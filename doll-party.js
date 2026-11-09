// ==========================================
// ★ 🐾 여정 — 봉제인형이 함께 떠나는 어둠 (여럿이 같이 들어가 같이 싸운다)
// bundles.json 마지막 묶음 — doll-gong.js 다음 (journey.js · doll-scene.js · doll-battle.js 보다 뒤)
// ==========================================
//
// 2026-11-07 사용자 「어둠은 여러명이 같이 들어가는 만큼 여러명이 들어가서 같이 싸울 수 있게」
//                    「첫번째 여정도 아예 바꿔버려. 글 형식이 아닌 몬스터가 출몰하고 처치하는 형식으로」 (맵은 아케이드 그림을 같이 쓴다)
//                    「난이도별로 S까지 올라갈 수 있게 · 처치할 때마다 확률적으로 각성의 룬 조각」
//
// ■ 여정 둘
//   j1   『 첫번째 여정 - 주인을 찾아서. 』  문틈손 · 젖은 신발 · 네발이 · 등불이 → 가짜 주인 (그 여정의 글을 그대로 띄운다)
//   arc  『 매직버니 아케이드존 』            깜짝 선물 토끼 · 튀어나오는 토끼 · 목마 · 풍선 · 거울 · 눈알병 가운데 넷 → 북 치는 토끼
//   난이도 D · C · B · A · S — 괴담이 세지고 경험치 · 보상이 늘고, 높은 등급 룬 조각이 나온다 (awk-rune.js)
//   하루 세 번씩 (여정마다 따로 · dollRunUse/<사번>/<여정>)
//
// ■ 여럿이
//   방(dollLobby)을 만들면 셋까지 들어온다. 방장이 출발하면 모두 같은 판(dollRun)에 들어간다.
//   맵은 각자 화면이지만 파티는 한 줄로 걷는다 — 방장이 걷고, 나머지는 그 뒤를 따라간다 (서로가 보인다).
//   괴담에 닿으면 모두 전투 화면으로 — 사원마다 제 진영(인형 셋)이 있어 **동시에** 싸운다 (인형 전투 2차 엔진 d2-battle.js · 6단계 2026-11-10).
//   다 고르면(25초가 지나면 저절로 · 안 고른 사원은 엔진이 대신) 방장 화면이 한 턴을 푼다 (doll-battle.js resolveParty). 방장이 끊기면 45초 뒤 남은 사람이 푼다.
//   쓰러뜨리면 사원마다 경험치 · 교감 · 룬 조각을 제 기록에 받는다. 보스까지 가면 보상 (첫번째 여정 포인트 · 아케이드존 꿈결).
//
// ■ 적히는 자리
//   dollLobby/<열쇠> = { at, j, diff, lead, leadName, members: { 사번: { name, at } }, run }
//   dollRun/<열쇠>   = { at, j, diff, lead, stage(walk·fight·clear·lose·quit), x, order:[사번…], mons:[{ i, x, y, boss, dead }],
//                        members: { 사번: { name, dolls: { 열쇠: 인형 기록 }, act, out, left } }, fight: { id, m, foe, round, d2(엔진 상태), picks, pickq, need, log, res, grow, drops … doll-battle.js } }
//
// ■ 콘솔
//   dollPartyState()

(function dollParty() {
'use strict';

const LOBBY = 'dollLobby', RUN = 'dollRun', USE = 'dollRunUse';
const DAY = 3;
const LOBBY_LIVE = 10 * 60 * 1000;
const PICK_MS = 25000, FAIL_MS = 45000, WAIT_MEM = 15000;
const GR5 = ['D', 'C', 'B', 'A', 'S'];
// 괴담 자리는 맵(doll-scene.js SC[맵].mons · boss)에서 — 여정마다 맵이 다르다 (j1 저택 manor · arc 아케이드)
const J = {
    j1:  { n: '첫번째 여정 - 주인을 찾아서.', ic: '🐾', map: 'manor', bt: 'garden', mons: [0, 1, 2, 3], boss: 4, pay: 'P', base: 20000, gear: 0.35,
           d: '현관문이 열려 있었다. 주인의 냄새를 따라 나선 길 — 문틈손 · 젖은 신발 · 네발이 · 등불이, 그리고 마지막은 가짜 주인.' },
    arc: { n: '매직버니 아케이드존', ic: '🎪', map: 'arcade', bt: 'arcade', pool: [7, 8, 9, 11, 12, 13], boss: 10, pay: 'D', base: 500,
           d: '불 꺼진 아케이드. 시야가 좁다. 길에 괴담 넷, 무대 위에 북 치는 토끼.\n⚠️ 지면 💤 꿈결을 모두 잃고 10분 동안 가두리에 갇힙니다.' }
};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function M() { return window.DOLL; }
function G() { return window.DOLLGONG; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function now() { try { return M().now(); } catch (e) { return Date.now(); } }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }
function J1() { return window.JOURNEY_J1 || null; }
function payText(j, diff) { const di = Math.max(0, GR5.indexOf(diff)); const n = Math.round(J[j].base * (1 + 0.5 * di)); return J[j].pay === 'P' ? n.toLocaleString() + ' P' : '💤 꿈결 ' + n.toLocaleString() + ' D'; }

// ==========================================
// 내 동행 — 갈 수 있는 인형 (체력이 남았고, 탐사 · 데려가기 · 잠 아닌 것)
// ==========================================
function ready() {
    const u = u_(), D = M();
    if (!u || !D) return [];
    const ds = D.dolls(u), t = now();
    let sleepAll = false;
    try { sleepAll = !!(window.PET.asleep && window.PET.asleep(u)); } catch (e) { }
    if (sleepAll) return [];
    return D.withList(u).filter(function (k) {
        const s = ds[k];
        if (!s) return false;
        if (s.out && s.out.till && s.out.till > t) return false;
        if ((Number(s.jsleep) || 0) > t) return false;
        return D.hpOf(s) > 0;
    });
}
// ★ 6단계(2026-11-10) — 인형 기록 전체를 판에 적는다 (개체치 · 성격 · 노력치 · 레벨 · 기술 · PP · 특성 · 상태 · 먹인 룬). 엔진(D2BT)이 이것으로 개체를 만든다.
function snap(k) {
    const D = M(), d = D.dolls()[k];
    const o = JSON.parse(JSON.stringify(d));
    o.sp = d.sp; o.hp = Math.round(D.hpOf(d)); o.att = D.attOf(d);
    ['fav', 'ord', 'fedAt', 'bd', 'with', 'out', 'rest', 'jsleep', 'hurt', 'stv', 'gear'].forEach(function (x) { delete o[x]; });
    if (d.nick) o.nick = String(d.nick).slice(0, 12);
    if (D.artOld(u_())) o.art = 'old';                   // 🎨 예전 펫 그림으로 보는 사원 (동료 화면에도)
    try { const R = window.PETRUNE; if (R) { const f = R.fed(k, u_()); if (f.length) o.runes = f; else delete o.runes; } } catch (e) { }
    return o;
}

// ==========================================
// 하루 세 번
// ==========================================
const USED = {};
function usedBind() {
    const u = u_(), d = db_();
    if (!u || !d || USED._code === u.code) return;
    USED._code = u.code;
    d.ref(USE + '/' + u.code).on('value', function (s) { const v = s.val() || {}; USED.v = v; if (VIEW.dim) paint(); });
}
setInterval(function () { try { usedBind(); } catch (e) { } }, 1500);
function left(j) { const v = (USED.v || {})[j]; const n = (v && v.d === M().today()) ? Number(v.n) || 0 : 0; return Math.max(0, DAY - n); }
function useOne(j) {
    const u = u_(), d = db_();
    if (!u || !d) return Promise.resolve(true);
    const t = M().today();
    return d.ref(USE + '/' + u.code + '/' + j).transaction(function (c) {
        const n = (c && c.d === t) ? Math.max(0, Number(c.n) || 0) : 0;
        if (n >= DAY) return;
        return { d: t, n: n + 1 };
    }).then(function (r) { return !!(r && r.committed); }).catch(function () { return false; });
}

// ==========================================
// 방 — 고르고 · 모이고 · 떠난다
// ==========================================
const VIEW = { dim: null, j: 'j1', diff: 'D', lob: {}, lobRef: null, my: null };
function lobBind() {
    const d = db_();
    if (!d || VIEW.lobRef) return;
    VIEW.lobRef = d.ref(LOBBY);
    VIEW.lobRef.on('value', function (s) {
        VIEW.lob = s.val() || {};
        const me = u_();
        // 내가 들어 있는 방이 출발했나
        Object.keys(VIEW.lob).forEach(function (k) {
            const L = VIEW.lob[k];
            if (L && L.run && L.members && me && L.members[me.code] && !S.runKey && !S.seenRun[L.run]) {
                S.seenRun[L.run] = 1;
                if (VIEW.dim) { VIEW.dim._close(); VIEW.dim = null; }
                enter(L.run);
            }
        });
        if (VIEW.dim) paint();
    });
}
function myLobby() {
    const me = u_();
    if (!me) return null;
    const ks = Object.keys(VIEW.lob).filter(function (k) { const L = VIEW.lob[k]; return L && !L.run && L.members && L.members[me.code] && now() - Number(L.at || 0) < LOBBY_LIVE; });
    return ks.length ? Object.assign({ _k: ks[0] }, VIEW.lob[ks[0]]) : null;
}
function partyHtml() {
    const D = M(), u = u_(), ds = D.dolls(u);
    const w = D.withList(u), ok = ready();
    if (!w.length) return '<div class="sub" style="color:#ff9f9f">동행 인형이 없습니다 — 도깨비 공방 보관소에서 동행 칸에 넣어 주세요.</div>';
    return '<div style="display:flex;gap:6px;margin-bottom:8px">' + w.map(function (k) {
        const d = ds[k], s = D.stats(d), h = D.hpOf(d), p = h / s.max;
        return '<div style="flex:1;border:1px solid #4a3a70;border-radius:8px;padding:4px;text-align:center;' + (ok.indexOf(k) < 0 ? 'opacity:.45' : '') + '">' + '<div style="display:flex;justify-content:center">' + G().icon(d.sp, 34) + '</div>'
            + '<div style="font-size:9.5px;color:#fff3d6">' + esc(D.nickOf(d)) + '</div><div style="font-size:8.5px;color:#a99ccc">' + s.g + ' · Lv.' + s.lv + ' · ' + Math.ceil(h) + '/' + s.max + '</div>'
            + '<div style="height:3px;background:#333;margin-top:2px"><i style="display:block;height:100%;width:' + Math.round(p * 100) + '%;background:' + (p > 0.5 ? '#4cd964' : p > 0.2 ? '#ffcc00' : '#ff3b30') + '"></i></div></div>';
    }).join('') + '</div>';
}
function paint() {
    const me = u_();
    if (!me || !G()) return;
    const L = myLobby();
    let html;
    if (L) {
        const ms = Object.keys(L.members || {});
        const isLead = L.lead === me.code;
        html = '<h3>' + J[L.j].ic + ' ' + esc(J[L.j].n) + ' · 난이도 ' + L.diff + '</h3><div class="sub">' + esc(L.leadName) + ' 사원의 방 — 셋까지 같이 떠납니다. 방장이 출발하면 모두 같은 어둠에 들어갑니다.</div>'
            + ms.map(function (c) { const x = L.members[c]; return '<div class="gb-row"><div class="tx"><b>' + esc(x.name) + '</b>' + (c === L.lead ? ' <span style="color:#ffcf8f;font-size:10px">방장</span>' : '') + '</div></div>'; }).join('')
            + '<div style="font-size:10.5px;color:#ffcf8f;margin:10px 0 4px">내 동행</div>' + partyHtml()
            + '<div class="gb-btns">' + (isLead ? '<button class="gb-btn pri" data-k="go">출발한다 (' + ms.length + '명)</button>' : '<div class="sub" style="flex:1">방장이 출발하기를 기다리는 중…</div>') + '<button class="gb-btn" data-k="leave">나간다</button></div>';
    } else {
        const open = Object.keys(VIEW.lob).map(function (k) { return Object.assign({ _k: k }, VIEW.lob[k]); })
            .filter(function (o) { return o && !o.run && o.members && Object.keys(o.members).length < 3 && now() - Number(o.at || 0) < LOBBY_LIVE; })
            .sort(function (a, b) { return b.at - a.at; });
        html = '<h3>🐾 여정</h3><div class="sub">봉제인형(동행 셋)이 함께 떠나는 어둠. 혼자도, 셋까지 같이도 갈 수 있고, 같이 가면 같이 싸웁니다.<br>괴담을 쓰러뜨리면 각성의 룬 조각이 나옵니다 — 난이도가 높을수록 높은 등급 조각 (드물게).</div>'
            + '<div style="font-size:10.5px;color:#ffcf8f;margin:4px 0">내 동행</div>' + partyHtml()
            + Object.keys(J).map(function (j) {
                const on = VIEW.j === j;
                return '<div style="border:1px solid ' + (on ? '#a78bdb' : '#3d2f5c') + ';border-radius:10px;padding:9px;margin:8px 0;background:' + (on ? 'rgba(120,90,190,.16)' : 'transparent') + '" data-j="' + j + '">'
                    + '<div style="font-size:12px;color:#fff3d6;font-weight:bold">' + J[j].ic + ' 『 ' + esc(J[j].n) + ' 』 <span style="font-size:10px;color:#9fd8ef">오늘 ' + left(j) + ' / ' + DAY + '</span></div>'
                    + '<div class="sub" style="margin:4px 0 0">' + esc(J[j].d) + '<br>끝까지 가면 ' + payText(j, VIEW.diff) + '</div></div>';
            }).join('')
            + '<div style="display:flex;gap:4px;align-items:center;margin:6px 0"><span style="font-size:10.5px;color:#ffcf8f;flex:0 0 auto">난이도</span>' + GR5.map(function (g) { return '<button class="gb-btn' + (VIEW.diff === g ? ' pri' : '') + '" data-d="' + g + '" style="flex:1;padding:6px 0">' + g + '</button>'; }).join('') + '</div>'
            + '<div class="sub" style="margin:0">난이도 ' + VIEW.diff + ' — 나오는 조각 ' + window.AWK.CAP[VIEW.diff].map(function (g) { return g + '급'; }).join(' · ') + ' · 괴담 Lv ' + window.DOLLBT.LV_OF_DIFF[VIEW.diff][0] + '~' + window.DOLLBT.LV_OF_DIFF[VIEW.diff][1] + ' (보스 +3) · 같이 가면 괴담 HP 가 는다</div>'
            + '<div class="gb-btns"><button class="gb-btn pri" data-k="solo">혼자 떠난다</button><button class="gb-btn" data-k="make">방을 만든다</button></div>'
            + '<div style="font-size:10.5px;color:#ffcf8f;margin:12px 0 2px">열린 방</div>'
            + (open.length ? open.map(function (o) { return '<div class="gb-row"><div class="tx"><b>' + esc(o.leadName) + ' 사원의 방</b><div>' + J[o.j].ic + ' ' + esc(J[o.j].n) + ' · 난이도 ' + o.diff + ' · ' + Object.keys(o.members).length + '/3</div></div><button class="gb-btn" data-join="' + esc(o._k) + '">들어간다</button></div>'; }).join('')
                         : '<div class="sub">열린 방이 없습니다.</div>')
            + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
    }
    if (!VIEW.dim || !VIEW.dim.parentNode) VIEW.dim = G().panel(html, function () { VIEW.dim = null; });
    else VIEW.dim.firstChild.innerHTML = html;
    const P = VIEW.dim;
    Array.prototype.forEach.call(P.querySelectorAll('[data-j]'), function (b) { b.onclick = function () { VIEW.j = b.dataset.j; paint(); }; });
    Array.prototype.forEach.call(P.querySelectorAll('[data-d]'), function (b) { b.onclick = function () { VIEW.diff = b.dataset.d; paint(); }; });
    Array.prototype.forEach.call(P.querySelectorAll('[data-join]'), function (b) { b.onclick = function () { joinLobby(b.dataset.join); }; });
    const on = function (k, f) { const b = P.querySelector('[data-k=' + k + ']'); if (b) b.onclick = f; };
    on('x', function () { P._close(); });
    on('solo', function () { if (canGo(VIEW.j)) start(VIEW.j, VIEW.diff, null); });
    on('make', function () { if (canGo(VIEW.j)) makeLobby(VIEW.j, VIEW.diff); });
    on('go', function () { const L2 = myLobby(); if (L2 && canGo(L2.j)) start(L2.j, L2.diff, L2); });
    on('leave', function () { const L2 = myLobby(); if (L2) leaveLobby(L2); });
}
function canGo(j) {
    if (inDark()) { alert_('어둠 탐사 중에는 떠날 수 없습니다.'); return false; }
    try { if (typeof isQuarantined === 'function' && isQuarantined(u_())) { alert_('격리 중에는 떠날 수 없습니다.'); return false; } } catch (e) { }
    if (S.runKey) { alert_('이미 여정 중입니다.'); return false; }
    if (!left(j)) { alert_('『 ' + J[j].n + ' 』 은 하루 ' + DAY + '번까지입니다.'); return false; }
    if (!ready().length) { alert_('함께 갈 봉제인형이 없습니다.\n(동행 중이고 체력이 남은 인형이 하나는 있어야 합니다 — 도깨비 공방 보관소 · 수선소)'); return false; }
    return true;
}
function makeLobby(j, diff) {
    const me = u_(), d = db_();
    const ref = d.ref(LOBBY).push();
    const m = {}; m[me.code] = { name: me.name, at: now() };
    ref.set({ at: now(), j: j, diff: diff, lead: me.code, leadName: me.name, members: m }).then(function () {
        try { ref.child('members/' + me.code).onDisconnect().remove(); } catch (e) { }
        paint();
    });
}
function joinLobby(k) {
    const L = VIEW.lob[k], me = u_();
    if (!L || !canGo(L.j)) return;
    db_().ref(LOBBY + '/' + k + '/members').transaction(function (c) {
        c = c || {};
        if (Object.keys(c).length >= 3 && !c[me.code]) return;
        c[me.code] = { name: me.name, at: now() };
        return c;
    }).then(function (r) { if (!r || !r.committed) alert_('방이 가득 찼습니다.'); else paint(); });
}
function leaveLobby(L) {
    const me = u_(), d = db_();
    if (L.lead === me.code) d.ref(LOBBY + '/' + L._k).remove();
    else d.ref(LOBBY + '/' + L._k + '/members/' + me.code).remove();
}

// ==========================================
// 판 — 열고 · 들어가고 · 지켜본다
// ==========================================
const S = { runKey: null, ref: null, run: null, code: '', seenRun: {}, fightOn: null, waiters: [], applied: {}, lastX: 0, xT: 0, timer: null, ended: false };

function sceneOf(j) { return (window.DOLLSCENE && DOLLSCENE.sc && DOLLSCENE.sc(J[j].map)) || { mons: [{ x: 236, y: 333 }, { x: 543, y: 333 }, { x: 834, y: 333 }, { x: 1135, y: 333 }], boss: { x: 1385, y: 300 } }; }
function genMons(j) {
    const sc = sceneOf(j);
    const pool = J[j].mons ? J[j].mons.slice() : J[j].pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 4);
    return pool.map(function (i, n) { const m = sc.mons[n] || sc.mons[sc.mons.length - 1]; return { i: i, x: m.x, y: m.y }; }).concat([{ i: J[j].boss, x: sc.boss.x, y: sc.boss.y, boss: 1 }]);
}
function start(j, diff, lobby) {
    const me = u_(), d = db_();
    const ref = d.ref(RUN).push();
    const order = lobby ? Object.keys(lobby.members).sort(function (a, b) { return (a === lobby.lead ? -1 : b === lobby.lead ? 1 : (lobby.members[a].at || 0) - (lobby.members[b].at || 0)); }) : [me.code];
    const members = {};
    order.forEach(function (c) { members[c] = { name: (lobby ? lobby.members[c].name : me.name) }; });
    ref.set({ at: now(), j: j, diff: diff, lead: me.code, stage: 'walk', x: 80, order: order, members: members, mons: genMons(j) }).then(function () {
        if (lobby) d.ref(LOBBY + '/' + lobby._k).update({ run: ref.key });
        if (VIEW.dim) { VIEW.dim._close(); VIEW.dim = null; }
        S.seenRun[ref.key] = 1;
        enter(ref.key);
    });
}
function enter(key) {
    const me = u_(), d = db_();
    d.ref(RUN + '/' + key).once('value').then(function (s) {
        const v = s.val();
        if (!v || !v.members || !v.members[me.code]) return;
        useOne(v.j).then(function (ok) {
            const mref = d.ref(RUN + '/' + key + '/members/' + me.code);
            if (!ok) { mref.update({ out: 1, left: 1 }); alert_('『 ' + J[v.j].n + ' 』 은 오늘 더 들어갈 수 없습니다.'); return; }
            const ks = ready();
            if (!ks.length) { mref.update({ out: 1, left: 1 }); alert_('함께 갈 봉제인형이 없습니다.'); return; }
            const dolls = {};
            ks.forEach(function (k) { dolls[k] = snap(k); });
            mref.update({ name: me.name, dolls: dolls, act: ks[0], at: now() }).then(function () {
                S.runKey = key; S.code = me.code; S.ended = false; S.applied = {}; S.fightOn = null;
                S.ref = d.ref(RUN + '/' + key);
                S.ref.on('value', onRun);
                clearInterval(S.timer);
                S.timer = setInterval(tick, 1000);
                M().log('[🐾 여정] 『 ' + J[v.j].n + ' 』 난이도 ' + v.diff + ' — 떠났습니다.');
                M().saveHist();
                window.DOLLSCENE.open(J[v.j].map || 'arcade', 'spawn', { party: PT, title: J[v.j].n });
            });
        });
    });
}
// Firebase 는 0 부터 이어지는 숫자 열쇠를 배열로 돌려준다 (반대로 배열을 객체로 줄 때도) — 받자마자 한 모양으로 맞춘다
function arr(x) { if (!x) return []; if (Array.isArray(x)) return x.filter(function (y) { return y != null; }); return Object.keys(x).sort(function (a, b) { return a - b; }).map(function (k) { return x[k]; }); }
function obj(x) { if (!x || !Array.isArray(x)) return x; const o = {}; x.forEach(function (y, i) { if (y != null) o[String(i)] = y; }); return o; }
function norm(v) {
    if (!v) return v;
    v.order = arr(v.order);
    v.mons = arr(v.mons);
    Object.keys(v.members || {}).forEach(function (c) { const m = v.members[c]; if (m && m.dolls) m.dolls = obj(m.dolls); });
    const F = v.fight;
    if (F) {
        if (F.part) Object.keys(F.part).forEach(function (c) { F.part[c] = obj(F.part[c]); });
        if (F.log) Object.keys(F.log).forEach(function (r) {
            if (F.log[r] == null) return;
            F.log[r] = arr(F.log[r]);
        });
        if (F.drops) Object.keys(F.drops).forEach(function (c) { F.drops[c] = arr(F.drops[c]); });
        if (F.pickq) F.pickq = arr(F.pickq);
    }
    return v;
}
function onRun(s) {
    const v = norm(s.val());
    S.run = v;
    if (!v) { endRun('gone'); return; }
    // 기다리는 전투 화면에 판 지문을 넘긴다
    S.waiters = S.waiters.filter(function (w) {
        const F = v.fight;
        if (!F || F.id !== w.id) { w.r(null); return false; }
        if (F.log && F.log[w.round]) { w.r(F.log[w.round]); return false; }
        // 🧸 내가 다음 인형을 골라야 한다 (기절 · 바통) — 기다림을 끊고 선택창으로 (doll-battle.js partyFight)
        if (F.need && F.need.code === S.code && arr(F.pickq).length <= Number(F.need.at || 0)) { w.r('need'); return false; }
        return true;
    });
    // 전투가 열렸다
    if (v.stage === 'fight' && v.fight && !v.fight.res && S.fightOn !== v.fight.id) startFight(v.fight.id);
    if ((v.stage === 'quit') && !S.ended) { endRun('quit'); return; }
    if ((v.stage === 'clear' || v.stage === 'lose') && !S.fightOn && !S.ended) endRun(v.stage);
    try { window.DOLLSCENE.partySync(); } catch (e) { }
    tryResolve(false);
}
function tick() {
    if (!S.run) return;
    tryResolve(true);
}
function isLead() { return !!(S.run && S.run.lead === S.code); }
function alive(v) {
    const F = v.fight, S2 = F && F.d2;
    return (v.order || []).filter(function (c) {
        const m = v.members[c]; if (!m || m.left || !m.dolls) return false;
        if (S2 && S2.sides) { const sd = Object.keys(S2.sides).map(function (k) { return S2.sides[k]; }).filter(function (x) { return x && x.code === c; })[0]; if (sd) return !sd.out && arr(sd.units).some(function (u) { return u && u.hp > 0 && !u.fainted; }); }
        return !m.out;
    });
}
function tryResolve(byClock) {
    const v = S.run;
    if (!v || !v.fight || v.fight.res || v.stage !== 'fight') return;
    const F = v.fight, t = now();
    if (!F.d2) return;                                                   // 엔진 상태가 아직 안 적혔다 (방장이 만든다)
    const al = alive(v);
    const all = al.every(function (c) { return F.picks && F.picks[c]; });
    const waited = t - Number(F.roundAt || 0);
    // 선택(기절 · 바통)을 기다리는 중 — 그 사원이 골랐으면(pickq 가 늘었으면) 바로 다시 푼다 · 45초가 지나면 엔진이 첫 후보로
    const needed = !!F.need;
    const needOk = needed && (arr(F.pickq).length > Number(F.need.at || 0) || t - Number(F.needAt || F.roundAt || 0) > FAIL_MS);
    if (needed && !needOk) return;
    const mine = (isLead() && (all || waited > PICK_MS || needOk)) || (!isLead() && waited > FAIL_MS);
    if (!mine) return;
    S.ref.child('fight/lock').transaction(function (c) { return (Number(c) || 0) >= F.round ? undefined : F.round; }).then(function (r) {
        if (!r || !r.committed) return;
        const P = window.DOLLBT.resolve(v, now());
        if (!P) return;
        return S.ref.update(P);
    }).catch(function (e) { console.warn('[🐾] 판 풀기 실패', e); });
}

// ── 전투
function startFight(id) {
    S.fightOn = id;
    try { window.DOLLSCENE.fightStart(); } catch (e) { }
    const v = S.run;
    window.DOLLBT.party({
        code: S.code, lead: isLead(), loc: (J[v.j] && J[v.j].bt) || 'arcade',
        get: function () { return S.run; },
        pick: function (k) { const p = {}; p['fight/picks/' + S.code] = k; S.ref.update(p); },
        pickq: function (idx) { S.ref.child('fight/pickq').transaction(function (c) { c = arr(c); c.push(Number(idx)); return c; }); S.ref.update({ 'fight/needAt': now() }); },
        applyWin: function (grow, side) { applyWin(id, grow, side); },
        waitLog: function (round) {
            return new Promise(function (r) {
                const F = S.run && S.run.fight;
                if (!F || F.id !== id) return r(null);
                if (F.log && F.log[round]) return r(F.log[round]);
                if (F.need && F.need.code === S.code && arr(F.pickq).length <= Number(F.need.at || 0)) return r('need');
                S.waiters.push({ id: id, round: round, r: r });
            });
        },
        applyLog: function (lg) { applyLog(id, lg); }
    }).then(function (res) {
        S.fightOn = null;
        const r = res && res.res;
        const m = v && v.fight ? v.fight.m : null;
        try { window.DOLLSCENE.fightEnd(r, m); } catch (e) { }
        // 이긴 뒤 — 첫번째 여정의 글
        const run = S.run;
        if (r === 'win' && run && run.j === 'j1' && J1() && m != null && J1().enc[m] && window.DOLLSCENE.run()) {
            window.DOLLSCENE.talk([{ sys: 1, t: String(J1().enc[m].out).replace(/<br>/g, '\n') }]).then(function () { if (S.run && (S.run.stage === 'clear' || S.run.stage === 'lose')) endRun(S.run.stage); });
            return;
        }
        if (run && (run.stage === 'clear' || run.stage === 'lose') && !S.ended) endRun(run.stage);
    });
}
// 이겼다 — 경험치 · 노력치(엔진 grow 를 내 진영 기록에) · 교감 · 룬 조각 (한 번만)
function applyWin(id, grow, side) {
    const v = S.run, D = M(), u = u_();
    if (!v || !u) return;
    const tag = id + ':win';
    if (S.applied[tag]) return;
    S.applied[tag] = 1;
    try {
        const sd = grow && grow.bySide && grow.bySide[side];
        if (sd) {
            const ds = D.dolls(u), recs = arr(sd).map(function (g) { return ds[String(g.key)] ? window.DOLLBT.recOf(ds[String(g.key)], g.key) : null; });
            window.D2BT.applyGrow(grow, recs, side, u);
            arr(sd).forEach(function (g) { if (g.xp && ds[String(g.key)]) D.log('[🐾 여정] ' + D.nickOf(ds[String(g.key)]) + ' 경험치 +' + g.xp + (g.up ? ' → Lv ' + g.lv : '') + (g.wait ? ' (각성 돌파 필요)' : ''), u); });
        }
    } catch (e) { console.warn('[🐾] 성장 기록', e); }
    const me = v.members && v.members[S.code];
    try { const act = v.fight && v.fight.d2 && v.fight.d2.sides && v.fight.d2.sides[side]; const cu = act && arr(act.units)[act.act]; if (cu && cu.key && D.dolls(u)[cu.key]) D.bondUp(cu.key, u); } catch (e) { }
    const got = arr((v.fight && v.fight.drops && v.fight.drops[S.code]) || []);
    got.forEach(function (g) { window.AWK.add(window.AWK.SHARD(g), 1, u); });
    if (got.length) {
        D.log('[🐾 여정] 💠 ' + got.map(function (g) { return window.AWK.SHARD(g); }).join(' · ') + ' 을 주웠습니다.', u);
        try { window.DOLLSCENE.sys('💠 ' + got.map(function (g) { return window.AWK.SHARD(g); }).join(' · ') + ' 을 주웠다! (각성 공방에서 셋을 합친다)', 5000); } catch (x) { }
    }
    D.saveHist();
}
function applyLog(id, lg) { /* 판마다의 HP · PP 기록은 전투 화면(doll-battle.js writeMine)이 한다 */ }

// ── 끝
async function endRun(why) {
    if (S.ended) return;
    S.ended = true;
    const v = S.run || {}, u = u_(), D = M();
    clearInterval(S.timer);
    const S2 = window.DOLLSCENE;
    try {
        if (why === 'clear') {
            const di = Math.max(0, GR5.indexOf(v.diff)), n = Math.round(J[v.j].base * (1 + 0.5 * di));
            const lines = [];
            if (v.j === 'j1') {
                u.points = (Number(u.points) || 0) + n;
                try { saveFields({ points: 1 }); } catch (e) { }
                lines.push('여정을 끝까지 갔습니다 — ' + n.toLocaleString() + ' P');
                // ✗ 펫 장비 드롭은 뺐다 (2026-11-10 사용자 「장비는 판에서 뺌」)
            } else {
                try {
                    const r = await db_().ref('users/' + u.code + '/kroom/dream').transaction(function (x) { return Math.max(0, Math.floor(Number(x) || 0)) + n; });
                    if (r && r.committed) { if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {}; u.kroom.dream = Math.floor(Number(r.snapshot.val()) || 0); }
                } catch (e) { }
                lines.push('아케이드존을 빠져나왔습니다 — 💤 꿈결 ' + n.toLocaleString() + ' D');
            }
            D.log('[🐾 여정] 『 ' + J[v.j].n + ' 』 난이도 ' + v.diff + ' — 끝까지 갔습니다. ' + lines.join(' · '), u);
            D.saveHist();
            if (S2 && S2.run()) {
                const home = (v.j === 'j1' && J1()) ? [{ sys: 1, t: String(J1().enc[4].out).replace(/<br>/g, '\n') }] : [{ sys: 1, t: '무대의 북소리가 멎었다. 불 꺼진 아케이드에 반짝이는 것만 남았다.' }];
                await S2.talk(home.concat([{ sys: 1, t: lines.join('\n') }]));
            }
        } else if (why === 'lose') {
            // ★ 매직버니 아케이드존에서 지면 — 꿈결 전액 소실 · 10분 가두리 (2026-11-07 사용자)
            let lost = 0;
            if (v.j === 'arc') {
                try {
                    const r = await db_().ref('users/' + u.code + '/kroom/dream').transaction(function (x) { lost = Math.max(0, Math.floor(Number(x) || 0)); return 0; });
                    if (r && r.committed) { if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {}; u.kroom.dream = 0; }
                } catch (e) { lost = 0; }
                cage(u);
            }
            D.log('[🐾 여정] 『 ' + J[v.j].n + ' 』 — 봉제인형들이 모두 지쳐 물러났습니다.' + (v.j === 'arc' ? ' 💤 꿈결 ' + lost.toLocaleString() + ' D 를 잃고 ' + CAGE_MIN + '분 가두리.' : ''), u);
            D.saveHist();
            if (S2 && S2.run()) await S2.talk([{ sys: 1, t: '봉제인형들을 데리고 어둠에서 물러났다.\n도깨비 공방 수선소에서 고쳐 주세요.' + (v.j === 'arc' ? '\n\n무대의 토끼가 주머니를 털어 갔다 — 💤 꿈결 ' + lost.toLocaleString() + ' D 를 모두 잃었다.\n' + CAGE_MIN + '분 동안 가두리에 갇힙니다.' : '') }]);
        } else if (why === 'quit' && v.lead !== S.code) {
            alert_('🐾 파티장이 여정을 그만두었습니다.');
        }
    } catch (e) { console.warn('[🐾] 끝', e); }
    try { if (S.ref) S.ref.off(); } catch (e) { }
    S.runKey = null; S.ref = null; S.run = null; S.fightOn = null; S.waiters = [];
    try { if (S2 && S2.run()) S2.leave(); } catch (e) { }
}
// 🎪 아케이드존 패배 — 10분 가두리 (광장 → 백일몽 → … 빈 자리 · gaduri.js by 'arcade' · 때가 되면 저절로 풀린다)
const CAGE_MIN = 10;
function cage(me) {
    const d = db_();
    if (!d || !me || me.code === 'kario0987') return;
    const until = Date.now() + CAGE_MIN * 60000;
    const rooms = (typeof window.gaduriOrder === 'function') ? window.gaduriOrder() : ['plaza', 'dream', 'post'];
    const put = function (i) {
        if (i >= rooms.length) return;
        d.ref('gaduri/' + rooms[i]).transaction(function (box) {
            box = box || {};
            if (box[me.code]) {
                if (!box[me.code].until || box[me.code].until < until) { box[me.code].until = until; box[me.code].by = box[me.code].by || 'arcade'; box[me.code].at = Date.now(); }
                return box;
            }
            if (Object.keys(box).length >= 3) return;
            box[me.code] = { at: Date.now(), by: 'arcade', until: until, name: me.name || me.code };
            return box;
        }).then(function (res) { if (!res || !res.committed) put(i + 1); }).catch(function () { });
    };
    put(0);
}
function quit() {
    const v = S.run;
    if (!v) { endRun('gone'); return; }
    window.DOLLSCENE.ask(null, isLead() ? '여정을 그만둘까요?\n같이 온 사원들도 모두 돌아갑니다. 쓴 횟수는 돌아오지 않습니다.' : '여정에서 혼자 빠질까요?\n쓴 횟수는 돌아오지 않습니다.', ['그만둔다', '계속 간다']).then(function (i) {
        if (i !== 0) return;
        if (isLead()) S.ref.update({ stage: 'quit' });
        else { const p = {}; p['members/' + S.code + '/left'] = 1; p['members/' + S.code + '/out'] = 1; S.ref.update(p); endRun('left'); }
    });
}

// ==========================================
// 맵(doll-scene.js)에 넘기는 것
// ==========================================
const PT = {
    me: function () { return S.code; },
    lead: isLead,
    mons: function () { return (S.run && S.run.mons) ? (Array.isArray(S.run.mons) ? S.run.mons : Object.keys(S.run.mons).map(function (k) { return S.run.mons[k]; })) : []; },
    order: function () { const v = S.run; return v ? (v.order || []).filter(function (c) { return v.members[c] && !v.members[c].left; }) : []; },
    name: function (c) { return (S.run && S.run.members[c] && S.run.members[c].name) || ''; },
    leadX: function () { return Number(S.run && S.run.x) || 80; },
    posOf: function (c) { const o = PT.order(); const i = Math.max(0, o.indexOf(c)); return Math.max(24, PT.leadX() - i * 24); },
    ready: function () {
        const v = S.run;
        if (!v) return false;
        if (now() - Number(v.at || 0) > WAIT_MEM) return true;
        return (v.order || []).every(function (c) { const m = v.members[c]; return m && (m.dolls || m.left); });
    },
    stage: function () { return S.run ? S.run.stage : ''; },
    intro: function () {
        const v = S.run;
        if (!v) return [];
        if (v.j === 'j1' && J1()) return (J1().open || []).map(function (t) { return { sys: 1, t: t }; }).concat([{ sys: 1, t: '앞으로(→) 걸으면 괴담과 마주칩니다. 난이도 ' + v.diff + '.' }]);
        return [{ sys: 1, t: '불 꺼진 아케이드. 어디선가 북소리가 들린다 — 둥, 둥.' }, { sys: 1, t: '시야가 좁습니다. 앞으로(→) 나아가면 괴담과 마주칩니다. 난이도 ' + v.diff + '.' }];
    },
    onWalk: function (x) {
        if (!isLead() || !S.ref) return;
        const t = Date.now();
        if (Math.abs(x - S.lastX) < 2 || t - S.xT < 220) return;
        S.lastX = x; S.xT = t;
        S.ref.update({ x: Math.round(x) });
    },
    encounter: function (i) {
        const v = S.run;
        if (!v || !isLead() || v.stage !== 'walk') return false;
        const ms = PT.mons(), m = ms[i];
        if (!m || m.dead) return false;
        const n = alive(v).length || 1;
        const id = Date.now();
        const foe = window.DOLLBT.monSpec(m.i, v.diff, n, 'mon:' + S.runKey + ':' + i);
        const intro = (v.j === 'j1' && J1() && J1().enc[i]) ? String(J1().enc[i].in).replace(/<br>/g, ' ') : '';
        let d2 = null;
        try { d2 = window.DOLLBT.partyStart(v, foe, S.runKey + ':' + id); } catch (e) { console.warn('[🐾] 전투 시작', e); return false; }
        S.ref.update({ stage: 'fight', x: Math.round(PT.leadX()), fight: { id: id, m: i, foe: foe, round: 1, roundAt: now(), intro: intro, d2: d2 } });
        return true;
    },
    pushBack: function (x) { if (isLead() && S.ref) S.ref.update({ x: Math.round(x) }); },
    quit: quit
};
window.DOLLPARTY = PT;

window.dollPartyOpen = function () {
    if (!G() || !M()) return;
    G().css();
    lobBind();
    paint();
};
// ★ 여정 입구(재난관리국 B2 · ☰ 여정)를 이리로 — 옛 글 여정은 쓰지 않는다
(function hookJourney() {
    const iv = setInterval(function () {
        if (typeof window.journeyOpen !== 'function') return;
        if (window.journeyOpen._doll) { clearInterval(iv); return; }
        window.journeyOpen = window.dollPartyOpen;
        window.journeyOpen._doll = true;
        window.dollArcadeOpen = window.dollPartyOpen;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 끊겼다 다시 들어오면 — 하던 판으로 (화면이 닫혀 있으면 다시 연다)
setInterval(function () {
    try {
        const me = u_(), d = db_();
        if (!me || !d || S.runKey || S._scan) return;
        S._scan = 1;
        d.ref(RUN).orderByChild('at').startAt(now() - 2 * 3600 * 1000).once('value').then(function (s) {
            const all = s.val() || {};
            Object.keys(all).forEach(function (k) {
                const v = norm(all[k]);
                if (S.runKey || !v || !v.members || !v.members[me.code] || S.seenRun[k]) return;
                const m = v.members[me.code];
                if (m.left || !m.dolls || ['clear', 'lose', 'quit'].indexOf(v.stage) >= 0) { S.seenRun[k] = 1; return; }
                S.seenRun[k] = 1;
                S.runKey = k; S.code = me.code; S.ended = false; S.applied = {};
                S.ref = d.ref(RUN + '/' + k); S.ref.on('value', onRun);
                clearInterval(S.timer); S.timer = setInterval(tick, 1000);
                window.DOLLSCENE.open(J[v.j].map || 'arcade', 'spawn', { party: PT, title: J[v.j].n, resume: 1 });
            });
        }).catch(function () { }).then(function () { S._scan = 0; });
    } catch (e) { }
}, 20000);

window.dollPartyState = function () {
    console.log({ 판: S.runKey, 방장: isLead(), 단계: S.run && S.run.stage, 전투: S.fightOn, 위치: S.run && S.run.x, 사원: S.run && S.run.order });
    return S.run;
};
console.log('[🐾] 여정 — 봉제인형 동행 어둠 (여럿이) · dollPartyOpen()');
})();
