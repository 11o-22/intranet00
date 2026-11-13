// ==========================================
// ★ 🧸 봉제인형 출몰지 — 둘이 같이 (파티장 + 파티원)
// bundles.json 마지막 묶음 — doll-walk.js 다음 (plaza.js · doll-scene.js · doll-battle.js 보다 뒤)
// ==========================================
//
// 2026-11-13 사용자 「봉제 인형 출몰지에서는 듀얼로 (타인과 같이.) 할 때에 한 명이 파티장이 되어서 그 사람 따라다니다가 같이 잡는 형식으로 가자.」
//
// ■ 맺기
//   출몰지(광장 방 dwild)에서 다른 사원을 누르면 메뉴에 [🧸 같이 잡기] 가 뜬다. 누르면 그 사원 화면에 [수락] · [거절].
//   수락하면 **신청한 쪽이 파티장**, 받은 쪽이 파티원이 된다. 한 파티는 둘.
//
// ■ 따라다니기
//   파티원은 파티장의 뒤를 한 걸음 떨어져 저절로 따라간다 (plaza.js xFollowStep — 🪢 목줄과 같은 걸음 · 그동안 제 손으로는 못 움직인다).
//   화면 위에 [🧸 ○○ 사원과 같이 · 파티 풀기] 단추 — 둘 중 누구든 언제든 푼다.
//   출몰지를 벗어나거나 · 접속이 끊기거나 · 소식이 30초 끊기면 저절로 풀린다 (출몰지에서만 도는 파티다).
//
// ■ 같이 잡기
//   만남은 **파티장의 걸음**으로만 생긴다 (파티원의 걸음은 세지 않는다 — doll-scene.js wildStep).
//   만나면 둘 다 전투 화면으로 — 야생 둘과 **더블 배틀(2 : 2)**. 한 사람이 한 자리씩 (왼쪽 파티장 · 오른쪽 파티원).
//   엔진 · 화면은 더블 여정 그대로 (doll-battle.js partyFightDbl · resolvePartyDbl) — 판은 파티장 화면이 푼다 (다 고르면 · 25초가 지나면 · 파티장이 끊기면 45초 뒤 파티원이).
//   🎀 포옹 리본은 저마다 제 것을 제 차례에 던진다. 잡은 인형은 **던진 사람**의 것 (하루 포획 20마리도 저마다).
//   물러서기(도망)는 파티장만 정한다. 한 사람의 인형이 다 지치면 그 자리는 남은 사람이 맡는다 (더블 여정과 같다).
//   경험치 · 노력치 · 교감은 저마다 제 인형에. 룬 조각은 없다 (출몰지라서).
//   한쪽이 싸울 인형이 없으면 다른 쪽이 두 자리를 다 맡고, 둘 다 없으면 파티장 혼자의 만남으로 돌아간다.
//
// ■ 적히는 자리
//   dollDuoAsk/<받는 사번> = { id, by, bn, at, st: ask | ok | no, why }
//   dollDuo/<파티장 사번>  = { id, at, lead, leadName, mate, mateName, st: on | end, why, wild: 1, dbl: 1, diff: 'D', stage: walk | ready | fight,
//                              order: [파티장, 파티원], members: { 사번: { name, dolls: { 열쇠: 인형 기록 }, hb, rdy, off } }, enc: { id, at },
//                              fight: { id, foe, foes, round, roundAt, d2(엔진 상태), picks, pickq, need, log, res, grow, got: { 판: [잡은 것…] }, rib … doll-battle.js } }
//     (더블 여정의 판 dollRun 과 같은 꼴 — DOLLBT.partyStart · resolve · party 가 그대로 읽는다)
//
// ■ 콘솔
//   dollDuoState()

(function dollDuo() {
'use strict';

const PATH = 'dollDuo', ASK = 'dollDuoAsk', ROOM = 'dwild';
const ASK_MS = 20000, BEAT = 5000, STALE = 30000, RDY_MS = 4000, JOIN_MS = 9000;
const PICK_MS = 25000, FAIL_MS = 45000;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function M() { return window.DOLL; }
function BT() { return window.DOLLBT; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function now() { try { return M().now(); } catch (e) { return Date.now(); } }
function sys(t) { try { if (typeof window.__plazaSys === 'function') window.__plazaSys(t); } catch (e) { } }
function room() { try { return (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { return ''; } }
function users() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function nameOf(code) { const x = users()[code]; return (x && x.name) || code; }
function myName() { const u = u_(); return (u && u.name) || (u && u.code) || ''; }
function tutDone(u) { return !!(u && u.dollTut && u.dollTut.done); }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }
function battleOn() { try { return !!(BT() && BT().busy && BT().busy()); } catch (e) { return false; } }
function peerHere(code) { try { return !!(window.plazaPeerPos && window.plazaPeerPos(code)); } catch (e) { return false; } }
function arr(x) { if (!x) return []; if (Array.isArray(x)) return x.filter(function (y) { return y != null; }); return Object.keys(x).sort(function (a, b) { return a - b; }).map(function (k) { return x[k]; }); }
function obj(x) { if (!x || !Array.isArray(x)) return x; const o = {}; x.forEach(function (y, i) { if (y != null) o[String(i)] = y; }); return o; }
function clean(o) { return JSON.parse(JSON.stringify(o)); }                // undefined 를 뺀다 (실서버는 섞이면 쓰기를 통째로 거부한다)

// ==========================================
// 내 동행 — 싸울 수 있는 인형의 기록 (더블 여정 doll-party.js 의 ready · snap 과 같다)
// ==========================================
function ready() {
    const u = u_(), D = M();
    if (!u || !D) return [];
    const ds = D.dolls(u), t = now();
    try { if (window.PET && window.PET.asleep && window.PET.asleep(u)) return []; } catch (e) { }
    return D.withList(u).filter(function (k) {
        const s = ds[k];
        if (!s) return false;
        if (s.out && s.out.till && s.out.till > t) return false;
        if ((Number(s.jsleep) || 0) > t) return false;
        return D.hpOf(s) > 0;
    });
}
function snap(k) {
    const D = M(), d = D.dolls()[k];
    const o = JSON.parse(JSON.stringify(d));
    o.sp = d.sp; o.hp = Math.round(D.hpOf(d)); o.att = D.attOf(d);
    ['fav', 'ord', 'fedAt', 'bd', 'with', 'out', 'rest', 'jsleep', 'hurt', 'stv', 'gear'].forEach(function (x) { delete o[x]; });
    if (d.nick) o.nick = String(d.nick).slice(0, 12);
    try { if (D.artOld(u_())) o.art = 'old'; } catch (e) { }
    try { const R = window.PETRUNE; if (R) { const f = R.fed(k, u_()); if (f.length) o.runes = f; else delete o.runes; } } catch (e) { }
    return o;
}
function snapAll() {
    const out = {};
    try { ready().forEach(function (k) { out[k] = snap(k); }); } catch (e) { console.warn('[🧸] 둘이 — 인형 기록', e); }
    return Object.keys(out).length ? clean(out) : null;
}

// ==========================================
// 파티 — 지금 것
// ==========================================
const S = { key: '', ref: null, cb: null, v: null, code: '', want: '', fightOn: null, waiters: [], applied: {}, timer: null, ask: null,
            hbAt: 0, rdyFor: 0, encBusy: false, encDone: null, joinAt: 0, joined: false };
function on() { return !!(S.v && S.v.st === 'on' && S.code); }
function isLead() { return on() && S.v.lead === S.code; }
function isMate() { return on() && S.v.mate === S.code; }
function partner() { return on() ? (S.v.lead === S.code ? S.v.mate : S.v.lead) : ''; }
function partnerName() { return on() ? (S.v.lead === S.code ? (S.v.mateName || nameOf(S.v.mate)) : (S.v.leadName || nameOf(S.v.lead))) : ''; }
function mateIn() { const m = on() && S.v.members && S.v.members[S.v.mate]; return !!(m && m.hb); }       // 파티원이 판에 들어왔나

function norm(v) {
    if (!v) return v;
    v.order = arr(v.order);
    v.members = v.members || {};
    Object.keys(v.members).forEach(function (c) { const m = v.members[c]; if (m && m.dolls) m.dolls = obj(m.dolls); });
    const F = v.fight;
    if (F) {
        if (F.log) Object.keys(F.log).forEach(function (r) { if (F.log[r] != null) F.log[r] = arr(F.log[r]); });
        if (F.pickq) F.pickq = arr(F.pickq);
        if (F.foes) F.foes = arr(F.foes);
    }
    return v;
}
function bind(key, wantId) {
    const d = db_(), me = u_();
    if (!d || !me) return;
    unbind();
    S.key = key; S.code = me.code; S.want = wantId || ''; S.v = null; S.fightOn = null; S.waiters = []; S.applied = {}; S.rdyFor = 0; S.joined = false; S.joinAt = Date.now(); S.hbAt = 0;
    S.ref = d.ref(PATH + '/' + key);
    S.cb = S.ref.on('value', onVal);
    try { S.ref.child('members/' + me.code + '/off').onDisconnect().set(1); } catch (e) { }
    clearInterval(S.timer);
    S.timer = setInterval(function () { try { tick(); } catch (e) { console.warn('[🧸] 둘이', e); } }, 1000);
}
function unbind() {
    clearInterval(S.timer); S.timer = null;
    if (S.ref) {
        try { S.ref.off('value', S.cb); } catch (e) { }
        try { S.ref.child('members/' + S.code + '/off').onDisconnect().cancel(); } catch (e) { }
    }
    const wait = S.waiters; S.waiters = [];
    wait.forEach(function (w) { try { w.r(null); } catch (e) { } });
    const mv = S.movers || []; S.movers = [];
    mv.forEach(function (w) { try { w.r(); } catch (e) { } });
    const done = S.encDone; S.encDone = null;
    S.key = ''; S.ref = null; S.cb = null; S.v = null; S.want = ''; S.fightOn = null; S.encBusy = false; S.joined = false;
    if (done) { try { done({ res: 'gone' }); } catch (e) { } }
    chip();
}
// 파티가 풀렸다 (내 화면) — msg 를 채팅 줄에
function drop(msg) {
    if (!S.key) return;
    const wasLead = !!(S.v && S.v.lead === S.code), ref = S.ref;
    unbind();
    if (msg) sys(msg);
    // 파티장이 판을 치운다 (조금 뒤 — 파티원이 「풀렸다」를 먼저 읽게)
    if (wasLead && ref) setTimeout(function () { try { ref.once('value').then(function (s) { const v = s.val(); if (v && v.st === 'end') ref.remove(); }); } catch (e) { } }, 4000);
}
// 내가 푼다 — why: 'leave' 단추 · 'room' 출몰지를 벗어남
function leave(why) {
    if (!S.key || !S.ref) return;
    const mine = S.v && S.v.st === 'on';
    try { if (mine) S.ref.update({ st: 'end', why: why || 'leave', endBy: S.code }); } catch (e) { }
    drop(why === 'room' ? '🧸 출몰지를 벗어나 파티가 풀렸습니다.' : '🧸 파티를 풀었습니다.');
}

function onVal(snapshot) {
    const v = norm(snapshot.val());
    const me = u_();
    if (!S.key || !me) return;
    if (!v || !v.id || (S.want && v.id !== S.want)) {
        if (S.v) { drop('🧸 파티가 풀렸습니다.'); return; }                 // 판이 사라졌다
        if (Date.now() - S.joinAt > JOIN_MS) drop('🧸 파티를 맺지 못했습니다.');
        return;                                                           // 파티장이 아직 판을 안 열었다 (수락 직후)
    }
    if (v.st !== 'on') {
        const by = v.endBy && v.endBy !== S.code ? nameOf(v.endBy) + ' 사원이 ' : '';
        drop(S.v ? (v.why === 'room' ? '🧸 ' + by + '출몰지를 벗어나 파티가 풀렸습니다.' : '🧸 ' + by + '파티를 풀었습니다.') : null);
        return;
    }
    const first = !S.v;
    S.v = v;
    // 판에 들어간다 — 내 이름 · 인형 · 소식 (한 번)
    if (!S.joined) {
        S.joined = true;
        const up = {};
        up['members/' + S.code + '/name'] = myName();
        up['members/' + S.code + '/dolls'] = snapAll();
        up['members/' + S.code + '/hb'] = now();
        up['members/' + S.code + '/off'] = null;
        try { S.ref.update(up); } catch (e) { }
        S.hbAt = Date.now();
    }
    if (first) sys(v.lead === S.code ? '🧸 ' + (v.mateName || nameOf(v.mate)) + ' 사원과 파티를 맺었습니다 — 파티장입니다. 걷다가 만나면 같이 싸웁니다.'
                                     : '🧸 ' + (v.leadName || nameOf(v.lead)) + ' 사원의 파티에 들었습니다 — 파티장을 따라다니다가 같이 싸웁니다.');
    // 만남 준비 — 지금 인형 기록을 새로 적는다 (파티원 · 파티장은 encounter 가 적는다)
    if (v.stage === 'ready' && v.enc && v.enc.id && S.rdyFor !== v.enc.id && v.lead !== S.code) {
        S.rdyFor = v.enc.id;
        const up = {};
        up['members/' + S.code + '/dolls'] = snapAll();
        up['members/' + S.code + '/rdy'] = v.enc.id;
        try { S.ref.update(up); } catch (e) { }
    }
    // 기다리는 전투 화면에 판 지문을 넘긴다
    S.waiters = S.waiters.filter(function (w) {
        const F = v.fight;
        if (!F || F.id !== w.id) { w.r(null); return false; }
        if (F.log && F.log[w.round]) { w.r(F.log[w.round]); return false; }
        if (F.need && F.need.code === S.code && arr(F.pickq).length <= Number(F.need.at || 0)) { w.r('need'); return false; }
        return true;
    });
    // 고르는 중인 전투 화면에 — 판이 넘어갔다 (파티장이 물러섰다 · 시간이 다 됐다)
    S.movers = (S.movers || []).filter(function (w) {
        const F = v.fight;
        if (!F || F.id !== w.id || F.res || Number(F.round) !== w.round) { w.r(); return false; }
        return true;
    });
    if (v.stage === 'fight' && v.fight && v.fight.d2 && !v.fight.res && S.fightOn !== v.fight.id) startFight(v.fight.id);
    tryResolve();
    chip();
}
function tick() {
    const v = S.v, me = u_();
    if (!S.key) return;
    if (!me || me.code !== S.code) { unbind(); return; }                   // 다른 계정으로 다시 들어왔다
    if (!v) { if (Date.now() - S.joinAt > JOIN_MS) drop('🧸 파티를 맺지 못했습니다.'); return; }
    // 출몰지를 벗어났다 (전투 중에는 보지 않는다)
    if (!S.fightOn && !battleOn() && room() !== ROOM) { leave('room'); return; }
    // 소식
    if (Date.now() - S.hbAt > BEAT) { S.hbAt = Date.now(); try { S.ref.child('members/' + S.code + '/hb').set(now()); } catch (e) { } }
    const p = v.members && v.members[partner()];
    if (p && p.off) { try { S.ref.update({ st: 'end', why: 'off', endBy: partner() }); } catch (e) { } drop('🧸 ' + partnerName() + ' 사원의 접속이 끊겨 파티가 풀렸습니다.'); return; }
    const seen = p && Number(p.hb) ? Number(p.hb) : Number(v.at) || 0;
    if (seen && now() - seen > STALE) { try { S.ref.update({ st: 'end', why: 'stale', endBy: partner() }); } catch (e) { } drop('🧸 ' + partnerName() + ' 사원의 소식이 끊겨 파티가 풀렸습니다.'); return; }
    tryResolve();
    chip();
}

// ==========================================
// 맺기 — 묻고 · 답한다
// ==========================================
function cantWhy() {
    const me = u_();
    if (!me) return '지금은 받을 수 없습니다';
    if (S.key || S.ask) return '이미 다른 파티에 있습니다';
    if (room() !== ROOM) return '출몰지에 없습니다';
    if (!tutDone(me)) return '아직 도깨비 공방에 들르지 않았습니다';
    if (inDark() || battleOn()) return '지금은 받을 수 없습니다';
    return '';
}
function removeIf(ref, id) { try { ref.once('value').then(function (s) { const v = s.val(); if (v && v.id === id) ref.remove(); }).catch(function () { }); } catch (e) { } }
function askStop(rm) {
    const A = S.ask; S.ask = null;
    if (!A) return;
    clearTimeout(A.to);
    try { A.ref.off('value', A.cb); } catch (e) { }
    if (rm) removeIf(A.ref, A.id);
}
function ask(code) {
    const me = u_(), d = db_();
    if (!me || !d || !code || code === me.code) return;
    const why = cantWhy();
    if (why) { sys('🧸 ' + (why === '이미 다른 파티에 있습니다' ? '이미 파티에 있습니다.' : why === '출몰지에 없습니다' ? '출몰지에서만 같이 잡을 수 있습니다.' : why + '.')); return; }
    const id = me.code + ':' + Date.now().toString(36);
    const ref = d.ref(ASK + '/' + code);
    const A = { code: code, id: id, ref: ref, cb: null, to: 0 };
    try { ref.set({ id: id, by: me.code, bn: myName(), at: now(), st: 'ask' }); } catch (e) { sys('🧸 묻지 못했습니다.'); return; }
    sys('🧸 ' + nameOf(code) + ' 사원에게 같이 잡자고 했습니다.');
    S.ask = A;
    A.cb = ref.on('value', function (s) {
        const v = s.val();
        if (S.ask !== A) return;
        if (!v || v.id !== id) { askStop(false); return; }
        if (v.st === 'no') { askStop(true); sys('🧸 ' + nameOf(code) + ' 사원 — ' + (v.why ? v.why + '.' : '거절했습니다.')); return; }
        if (v.st === 'ok') { askStop(true); create(code, id); }
    });
    A.to = setTimeout(function () { if (S.ask === A) { askStop(true); sys('🧸 ' + nameOf(code) + ' 사원이 답하지 않았습니다.'); } }, ASK_MS);
}
// 파티장 — 판을 연다
function create(mate, id) {
    const me = u_(), d = db_();
    if (!me || !d || S.key) return;
    if (room() !== ROOM) { sys('🧸 출몰지를 벗어나 파티를 맺지 못했습니다.'); return; }
    const rec = { id: id, at: now(), lead: me.code, leadName: myName(), mate: mate, mateName: nameOf(mate), st: 'on', wild: 1, dbl: 1, diff: 'D', stage: 'walk', order: [me.code, mate], members: {} };
    rec.members[me.code] = { name: myName(), hb: now() };
    rec.members[mate] = { name: nameOf(mate) };
    const ref = d.ref(PATH + '/' + me.code);
    try { ref.set(clean(rec)); } catch (e) { sys('🧸 파티를 맺지 못했습니다.'); return; }
    bind(me.code, id);
}
// ── 받는 쪽 — 내 사번의 칸을 듣는다 (들어오고 나가면 다시 건다)
let CARD = null;
function cardHide() { const c = CARD; CARD = null; if (c) { clearTimeout(c.to); try { c.el.remove(); } catch (e) { } } }
function answer(ref, v, st, why) {
    try {
        ref.transaction(function (cur) {
            if (!cur || cur.id !== v.id || cur.st !== 'ask') return;
            const o = Object.assign({}, cur, { st: st });
            if (why) o.why = why;
            return o;
        });
    } catch (e) { }
}
function card(v, ref) {
    cardHide();
    const el = document.createElement('div');
    el.id = 'duo-ask';
    el.style.cssText = 'position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);';
    el.innerHTML = '<div style="width:min(92vw,360px);box-sizing:border-box;background:#1b1426;border:1px solid #a58cff;border-radius:14px;padding:16px 14px;color:#e8dcc6;font-size:12px;line-height:1.65;">'
        + '<div style="font-size:13px;font-weight:bold;color:#d8ceff;margin-bottom:8px;">🧸 같이 잡기</div>'
        + '<div><b style="color:#ffe6a8;">' + esc(v.bn || nameOf(v.by)) + '</b> 사원이 봉제인형을 같이 잡자고 합니다.<br>'
        + '수락하면 그 사원이 <b>파티장</b>이 됩니다 — 파티장을 따라다니다가, 만나면 둘이 같이 싸우고 잡습니다 (야생 둘과 2 : 2).<br>'
        + '<span style="color:#a99ccc;">따라다니는 동안 제 손으로는 못 움직입니다. 화면의 [ 파티 풀기 ] 로 언제든 풉니다.</span></div>'
        + '<div style="display:flex;gap:8px;margin-top:12px;">'
        + '<button data-a="no" style="flex:1;padding:11px;border-radius:12px;border:1px solid #4a3a70;background:#241a36;color:#cfc4ee;font-size:13px;">거절</button>'
        + '<button data-a="ok" style="flex:1.4;padding:11px;border-radius:12px;border:1px solid #8a6a2a;background:#2a1f3a;color:#ffe6a8;font-size:13px;font-weight:bold;">수락</button></div></div>';
    ['pointerdown', 'pointerup', 'touchstart', 'click'].forEach(function (t) { el.addEventListener(t, function (e) { e.stopPropagation(); }); });
    document.body.appendChild(el);
    CARD = { el: el, id: v.id, to: setTimeout(function () { if (CARD && CARD.id === v.id) cardHide(); }, Math.max(1000, ASK_MS - (now() - Number(v.at || 0)))) };
    el.querySelector('[data-a="no"]').onclick = function () { cardHide(); answer(ref, v, 'no'); };
    el.querySelector('[data-a="ok"]').onclick = function () {
        cardHide();
        const why = cantWhy();
        if (why) { answer(ref, v, 'no', why); sys('🧸 ' + why + '.'); return; }
        answer(ref, v, 'ok');
        bind(v.by, v.id);                                              // 파티장이 판을 열기를 기다린다
    };
}
(function listen() {
    let ref = null, code = '', cb = null, seen = '';
    setInterval(function () {
        const d = db_(), me = u_();
        const c = (d && me && me.code) ? String(me.code) : '';
        if (c === code) return;
        if (ref) { try { ref.off('value', cb); } catch (e) { } ref = null; }
        cardHide();
        if (S.key) unbind();
        askStop(false);
        code = c;
        if (!c) return;
        ref = d.ref(ASK + '/' + c);
        cb = ref.on('value', function (s) {
            const v = s.val();
            if (!v || !v.id) { cardHide(); return; }
            if (v.st !== 'ask') { if (CARD && CARD.id === v.id) cardHide(); return; }
            if (v.id === seen) return;
            seen = v.id;
            if (now() - Number(v.at || 0) > ASK_MS) return;
            const why = cantWhy();
            if (why) { answer(s.ref, v, 'no', why); return; }
            card(v, s.ref);
        });
    }, 1000);
})();

// ==========================================
// 화면 위 단추 — 누구와 · 파티 풀기
// ==========================================
function chip() {
    let el = document.getElementById('duo-chip');
    const ov = document.getElementById('plaza-ov');
    if (!on() || !ov) { if (el) el.remove(); return; }
    const label = '🧸 ' + partnerName() + ' 사원과 같이 · ' + (isLead() ? '파티장' : '따라가는 중');
    if (!el || el.parentNode !== ov) {
        if (el) el.remove();
        el = document.createElement('div');
        el.id = 'duo-chip';
        el.className = 'plaza-keep';
        el.style.cssText = 'position:absolute;left:50%;top:98px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:14px;border:1px solid #a58cff;background:rgba(27,20,38,.9);color:#e8dcff;font-size:11.5px;font-weight:bold;white-space:nowrap;';
        el.innerHTML = '<span data-v="t"></span><button class="plaza-keep" style="padding:5px 10px;border-radius:10px;border:1px solid #8a6a2a;background:#2a1f3a;color:#ffe6a8;font-size:11px;font-weight:bold;">파티 풀기</button>';
        el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        el.querySelector('button').onclick = function (e) { e.stopPropagation(); leave('leave'); };
        ov.appendChild(el);
    }
    const t = el.querySelector('[data-v="t"]');
    if (t.textContent !== label) t.textContent = label;
}

// ==========================================
// 만남 — 파티장의 걸음으로 (doll-scene.js wildStep 이 부른다) · 돌려주는 값: 전투가 끝나면 풀리는 Promise
// ==========================================
function waitFor(fn, ms) {
    return new Promise(function (res) {
        const t0 = Date.now();
        const iv = setInterval(function () { let ok = false; try { ok = !!fn(); } catch (e) { } if (ok || Date.now() - t0 > ms) { clearInterval(iv); res(ok); } }, 120);
    });
}
function lvOf(dolls) {                                                       // 그 사원의 앞 인형 레벨 (살아 있는 첫째)
    const ds = obj(dolls) || {};
    const ks = Object.keys(ds);
    for (let i = 0; i < ks.length; i++) { const d = ds[ks[i]]; if (d && Number(d.hp) > 0) return Number(d.lv) || 1; }
    return 0;
}
function encounter() {
    const solo = function () { return BT().wild({ loc: 'wild' }); };
    const v = S.v;
    if (!isLead() || v.stage !== 'walk' || S.encBusy || S.fightOn || !mateIn() || !peerHere(v.mate)) return solo();
    S.encBusy = true;
    const id = Date.now();
    const up = { stage: 'ready', enc: { id: id, at: now() } };
    up['members/' + S.code + '/dolls'] = snapAll();
    up['members/' + S.code + '/rdy'] = id;
    const back = function () { S.encBusy = false; try { if (S.ref) S.ref.update({ stage: 'walk', enc: null }); } catch (e) { } };
    let pr;
    try { pr = S.ref.update(up); } catch (e) { back(); return solo(); }
    return Promise.resolve(pr).then(function () {
        return waitFor(function () { const m = S.v && S.v.members && S.v.members[v.mate]; return !S.v || (m && m.rdy === id); }, RDY_MS);
    }).then(function () {
        const cur = S.v;
        if (!cur || cur.st !== 'on' || !S.ref) { S.encBusy = false; return solo(); }
        // 야생 둘 — 하나는 파티장의 인형 언저리 · 하나는 파티원의 인형 언저리 레벨
        const mlv = lvOf(cur.members[cur.mate] && cur.members[cur.mate].dolls);
        const specs = [BT().wildSpec({}), BT().wildSpec(mlv ? { lv: Math.max(1, Math.min(20, mlv + Math.floor(Math.random() * 6) - 3)) } : {})];
        let d2 = null;
        try { d2 = BT().partyStart(cur, specs, S.key + ':' + id); } catch (e) { d2 = null; }
        if (!d2) { back(); return solo(); }                                 // 둘 다 싸울 인형이 없다 — 파티장 혼자의 만남으로
        const fight = clean({ id: id, m: 0, foe: specs[0], foes: specs, round: 1, roundAt: now(), d2: d2 });
        return new Promise(function (res) {
            S.encDone = res;
            S.ref.update({ stage: 'fight', fight: fight, enc: null }).catch(function (e) {
                console.warn('[🧸] 둘이 — 전투 시작 기록 실패', e);
                S.encDone = null; back(); res({ res: 'gone' });
            });
            // 전투 화면이 끝내 안 열리면 (기록은 됐는데 소식이 안 돌아옴) 풀어 준다
            setTimeout(function () { if (S.encDone === res && S.fightOn !== id) { S.encDone = null; back(); res({ res: 'gone' }); } }, 12000);
        });
    }).then(function (r) { S.encBusy = false; return r; }, function (e) { console.warn('[🧸] 둘이 — 만남', e); back(); return { res: 'gone' }; });
}

// ==========================================
// 전투 — 더블 여정의 화면 · 풀기를 그대로 쓴다
// ==========================================
function alive(v) {                                                          // 살아 있는 인형이 선 자리의 주인들 (맡은 자리마다 행동을 낸다)
    const S2 = v.fight && v.fight.d2, out = [];
    if (!S2 || !S2.sides) return out;
    ['A', 'C'].forEach(function (k) {
        const sd = S2.sides[k]; if (!sd || !(sd.act >= 0)) return;
        const u = arr(sd.units)[sd.act], c = sd.own || sd.code;
        if (u && u.hp > 0 && !u.fainted && c && out.indexOf(c) < 0 && v.members[c]) out.push(c);
    });
    return out;
}
function tryResolve() {
    const v = S.v;
    if (!v || !S.ref || v.st !== 'on' || !v.fight || v.fight.res || v.stage !== 'fight') return;
    const F = v.fight, t = now();
    if (!F.d2) return;
    const al = alive(v);
    const all = al.every(function (c) { return F.picks && F.picks[c]; });
    const waited = t - Number(F.roundAt || 0);
    const needed = !!F.need;
    const needOk = needed && (arr(F.pickq).length > Number(F.need.at || 0) || t - Number(F.needAt || F.roundAt || 0) > FAIL_MS);
    if (needed && !needOk) return;
    const lead = v.lead === S.code;
    const runNow = !!(F.picks && F.picks[v.lead] === 'run' && !F.refill);      // 파티장이 물러서기로 했다 — 파티원이 고르기를 기다리지 않는다
    const mine = (lead && (all || waited > PICK_MS || needOk || runNow)) || (!lead && waited > FAIL_MS);
    if (!mine) return;
    const ref = S.ref;
    ref.child('fight/lock').transaction(function (c) { return (Number(c) || 0) >= F.round ? undefined : F.round; }).then(function (r) {
        if (!r || !r.committed || S.ref !== ref) return;
        const P = BT().resolve(v, now());
        if (!P) return;
        return ref.update(clean(P));
    }).catch(function (e) { console.warn('[🧸] 둘이 — 판 풀기 실패', e); });
}
function startFight(id) {
    S.fightOn = id;
    BT().party({
        code: S.code, lead: !!(S.v && S.v.lead === S.code), loc: 'wild',
        get: function () { return S.v; },
        pick: function (k) { const p = {}; p['fight/picks/' + S.code] = k; try { S.ref.update(p); } catch (e) { } },
        pickq: function (idx) { try { S.ref.child('fight/pickq').transaction(function (c) { c = arr(c); c.push(Number(idx)); return c; }); S.ref.update({ 'fight/needAt': now() }); } catch (e) { } },
        applyWin: function (grow, side) { applyWin(id, grow, side); },
        moved: function (round) {
            return new Promise(function (r) {
                const F = S.v && S.v.fight;
                if (!F || F.id !== id || F.res || Number(F.round) !== Number(round)) return r();
                S.movers = S.movers || [];
                S.movers.push({ id: id, round: Number(round), r: r });
            });
        },
        waitLog: function (round) {
            return new Promise(function (r) {
                const F = S.v && S.v.fight;
                if (!F || F.id !== id) return r(null);
                if (F.log && F.log[round]) return r(F.log[round]);
                if (F.need && F.need.code === S.code && arr(F.pickq).length <= Number(F.need.at || 0)) return r('need');
                S.waiters.push({ id: id, round: round, r: r });
            });
        }
    }).then(function (res) {
        if (S.fightOn === id) S.fightOn = null;
        const done = S.encDone; S.encDone = null;
        // 파티장 — 싸움이 끝났는데 판이 아직 「전투」면 걷기로 되돌린다 (화면이 먼저 닫힌 때)
        try { if (S.v && S.v.lead === S.code && S.ref && S.v.stage === 'fight' && S.v.fight && S.v.fight.id === id && (!S.v.fight.res || (res && res.res === 'gone'))) S.ref.update({ stage: 'walk' }); } catch (e) { }
        if (done) done(res);
    });
}
// 이겼다 — 경험치 · 노력치(엔진 grow 를 내 인형 기록에) · 교감 (한 번만 · 룬 조각은 없다)
function applyWin(id, grow, side) {
    const v = S.v, D = M(), u = u_();
    if (!v || !u) return;
    const tag = id + ':win';
    if (S.applied[tag]) return;
    S.applied[tag] = 1;
    try {
        const sd = grow && grow.bySide && grow.bySide[side];
        if (sd) {
            const mineG = function (g) { return !(g && g.own && g.own !== S.code); };          // 한 목록에 동료의 인형도 들어 있다 → 내 것만
            const ds = D.dolls(u), recs = arr(sd).map(function (g) { return (mineG(g) && ds[String(g.key)]) ? BT().recOf(ds[String(g.key)], g.key) : null; });
            window.D2BT.applyGrow(grow, recs, side, u);
            arr(sd).forEach(function (g) { if (g.xp && mineG(g) && ds[String(g.key)]) D.log('[🧸 출몰지 · 둘이] ' + D.nickOf(ds[String(g.key)]) + ' 경험치 +' + g.xp + (g.up ? ' → Lv ' + g.lv : '') + (g.wait ? ' (각성 돌파 필요)' : ''), u); });
        }
    } catch (e) { console.warn('[🧸] 둘이 — 성장 기록', e); }
    try {
        const d2 = v.fight && v.fight.d2;
        if (d2 && d2.sides) ['A', 'C'].forEach(function (k) { const sd2 = d2.sides[k]; const cu = sd2 && (sd2.own || sd2.code) === S.code && sd2.act >= 0 ? arr(sd2.units)[sd2.act] : null; if (cu && cu.key && cu.hp > 0 && D.dolls(u)[cu.key]) D.bondUp(cu.key, u); });
    } catch (e) { }
    try { D.saveHist(); } catch (e) { }
}

// ==========================================
// 광장 · 출몰지에 넘기는 것
// ==========================================
// 남을 눌렀을 때의 메뉴 (plaza.js xItem · xPick) — 앞서 다른 파일이 걸어 둔 것이 있으면 잇는다
(function hook() {
    const items0 = window.plazaPeerItems, pick0 = window.plazaPeerPick;
    window.plazaPeerItems = function (code) {
        let out = [];
        try { if (typeof items0 === 'function') out = items0(code) || []; } catch (e) { out = []; }
        const me = u_();
        if (!me || room() !== ROOM) return out;
        if (on()) return code === partner() ? out.concat([['duo-off', '🧸 파티 풀기']]) : out;
        if (S.key || S.ask || !tutDone(me)) return out;
        return out.concat([['duo', '🧸 같이 잡기']]);
    };
    window.plazaPeerPick = function (k, code) {
        if (k === 'duo') { ask(code); return; }
        if (k === 'duo-off') { leave('leave'); return; }
        try { if (typeof pick0 === 'function') pick0(k, code); } catch (e) { }
    };
    // 파티원 — 파티장을 따라다닌다 (같은 방에 있을 때 · 전투 화면이 떠 있는 동안은 선다)
    const follow0 = window.plazaFollowOf;
    window.plazaFollowOf = function () {
        if (isMate() && room() === ROOM && !battleOn()) return S.v.lead;
        try { return (typeof follow0 === 'function') ? follow0() : ''; } catch (e) { return ''; }
    };
})();
window.DOLLDUO = {
    following: function () { return isMate(); },
    leading: function () { return isLead() && mateIn(); },
    encounter: encounter,
    on: on, partner: partner, leave: function () { leave('leave'); }, ask: ask,
    _s: function () { return S; }
};
window.dollDuoState = function () {
    const v = S.v;
    const o = { 파티: on() ? (isLead() ? '파티장' : '파티원') : (S.key ? '맺는 중' : '없음'), 상대: partner(), 판: S.key, 단계: v ? v.stage : '', 전투: S.fightOn, 묻는중: S.ask ? S.ask.code : '' };
    console.log(o);
    return o;
};
console.log('[🧸] 둘이 같이 — dollDuoState()');
})();
