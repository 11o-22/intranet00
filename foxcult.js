// ==========================================
// ★ 🎐 여우 신도 - 아홉여우병 — 상담사 지급 전용 (2026-10-25)
// bundles.json 마지막 묶음 맨 끝 — butterfly.js · pet-stay.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//
//   장착품이다. 은심장 · 호사수구 · 아기 여우 · 환영 나비와 같은 결 — 상점 · 우주 쇼핑몰 · 장터
//   어디에도 안 깔리고 팔 수 없다. 주는 법은 foxdGive(사번) 과 당국 화면의 「물품 강제 꽂기」뿐.
//   차고 있으면 장착칸의 [🎐 여우 신도] 로 두 신도를 부린다. 두 신도에게는 이름을 지어 줄 수 있다.
//
// ■ 역병 — 한 시간 (남에게는 몇 번이든 · 수치도 마음대로 / 본인에게는 하루 딱 한 번 · 한 가지)
//
//   제 一 신도  판정 1~15       굴림 +수치
//               행운 1~15       행운(재산 보존 · 대실패 무효 · 회수품 ×2 …) +수치/15 (15 면 100%)
//               기믹 파훼 1~10  기믹 파훼 횟수 +수치
//               회피 1~15       회피(은신) 굴림 +수치 · 7 이상이면 선택지에서 죽는 길이 ☪️ 로 보인다
//               즉사 무효 1~10  즉사를 수치만큼 무효로 한다 (한 시간 안에 쓴 만큼 준다)
//               ★ 병에 걸린 사람이 죽으면 제 一 신도의 역병(위 다섯)은 같은 탐사의 살아 있는 사람 하나에게 옮겨 간다
//   제 二 신도  상담실 · 선녀탕 구출 — 바로 꺼내거나(「제 二 신도가 당신을 부릅니다.」)
//                                     1~3시간을 줄인다(「여우의 역병이 당신의 시간을 잡아먹습니다. - 2시간」)
//               홀로 어둠 탐사 — 인원수에 구애받지 않고 어디든 들어간다 (구역이 차 있어도 방을 만든다)
//               포인트 배수 1.5~10 — 탐사 정산 포인트 (일반 포인트만 · 꿈결은 불리지 않는다)
//               행운 배수 100~1500% — 회수품 확률 · 공용시설 행운 ×(1 + 수치/100)
//
//   걸리면 그 사람 특이사항에  🎐 제 一 신도가 역병을 뿌립니다. - 회피 12  처럼 한 줄씩 적힌다.
//   ★ 역병에 걸린 사람 · 신도가 동행하는 사람이 탐사(어둠 · EPIC · K의 방 · 피날레)에서 얻은 포인트 · 경험치(K의 방)는
//     역병을 뿌린 장착자에게도 똑같이 들어간다 (payouts · foxShare — 들어오면 받는다).
//
// ■ 동행 — 신도를 사람 곁에 붙여 보낸다 (본인도 된다 · 거둬 올 때까지)
//
//   보낼 때 신도가 지닐 능력치를 정한다. 동행 중인 신도의 역병은 뿌리게 명하지 못한다.
//   제 一 신도  판정 · 행운 · 기믹 파훼 · 회피 · 즉사 무효 (0 = 안 줌)
//               행운 — 눈이 9 이하면 주사위를 뒤집어 15~20 으로 만든다 (탐사당 수치만큼)
//               회피 7 이상 — 피할 길을 알려 준다 (☪️)
//               즉사 무효 — 죽을 자리에서 들쳐 메거나 안아 들고 빠져나온다 (탐사당 수치만큼)
//   제 二 신도  어디든지 갈 수 있다 (인원수 · 구역이 차 있어도) · 포인트 배수 · 행운 배수 · 구출(쓰러져
//               상담실 · 선녀탕으로 가게 되면 바로 불러낸다)
//   동행하는 사람이 죽으면 신도마다 한 번씩(탐사당) 되살린다.
//   특이사항  🎐 제 二 신도가 동행합니다. 어디든지 갈 수 있습니다.
//
// ■ 적히는 자리
//
//   u.foxCult  = { d1:{ nick, to, toName, s:{…} }, d2:{…}, selfDay }   장착자 — 두 신도
//   u.foxPl    = { <역병>:{ v, until, by, byName, d, line, left?, w? } }  걸린 역병 (한 시간)
//   u.foxWith  = { d1:{ by, byName, line }, d2:{…} }                     곁에 동행하는 신도 (능력치는 장착자 쪽 s)
//   u.foxCall  = { k:'out'|'cut', ms, until, by, byName, nick, at }      상담실 · 선녀탕 — 받는 쪽이 띄운다
//   foxShare/<장착자>/<push> = { exp, from, fromName, where, at }          K의 방 경험치 몫
//   ★ 남의 글은 자식 길로만 쓴다 (users/<사번>/foxPl/<역병> · foxWith/<신도>).
//
// ■ 콘솔
//   foxdGive(사번) · foxdState(사번) · foxdHelp()

const FOXD = {
    NAME: '🎐 여우 신도 - 아홉여우병',
    HOUR: 3600 * 1000,
    NICK_MAX: 8,
    SEE: 7,              // 회피 이만큼이면 죽는 길이 보인다
    LOW: 9,              // 동행 행운 — 이 눈 이하면 뒤집는다
    FLIP: [15, 20]
};

(function foxCult() {
'use strict';
const C = FOXD;
const NAME = C.NAME;
const ADMIN = 'kario0987';
const MOD = 'foxd-modal';
const DS = ['d1', 'd2'];
const D_NAME = { d1: '제 一 신도', d2: '제 二 신도' };

// 역병 — vals 는 고를 수 있는 값
function seq(a, b, s) { const o = []; for (let v = a; v <= b + 1e-9; v += s) o.push(Math.round(v * 10) / 10); return o; }
const PL = [
    { k: 'judge',   d: 'd1', n: '판정',      vals: seq(1, 15, 1),     desc: '굴림 +수치' },
    { k: 'luck',    d: 'd1', n: '행운',      vals: seq(1, 15, 1),     desc: '행운 +수치 (15 면 100%)' },
    { k: 'gim',     d: 'd1', n: '기믹 파훼', vals: seq(1, 10, 1),     desc: '기믹 파훼 횟수 +수치' },
    { k: 'evade',   d: 'd1', n: '회피',      vals: seq(1, 15, 1),     desc: '회피 굴림 +수치 · 7 이상이면 죽는 길이 보인다' },
    { k: 'nodeath', d: 'd1', n: '즉사 무효', vals: seq(1, 10, 1),     desc: '즉사를 수치만큼 무효로 한다' },
    { k: 'rescue',  d: 'd2', n: '상담실 · 선녀탕 구출',               desc: '바로 꺼내거나 1~3시간을 줄인다' },
    { k: 'solo',    d: 'd2', n: '홀로 어둠 탐사',                     desc: '인원수에 구애받지 않고 어디든 들어간다' },
    { k: 'pts',     d: 'd2', n: '포인트 배수', vals: seq(1.5, 10, 0.5), desc: '탐사 정산 포인트 ×수치' },
    { k: 'luckx',   d: 'd2', n: '행운 배수', vals: seq(100, 1500, 50), desc: '회수품 확률 · 공용시설 행운 +수치%' }
];
const PL_BY = {}; PL.forEach(function (x) { PL_BY[x.k] = x; });
// 동행 능력치 — 0 은 안 준다
const WITH_KEYS = { d1: ['judge', 'luck', 'gim', 'evade', 'nodeath'], d2: ['rescue', 'pts', 'luckx'] };
const DEATH_KEYS = ['judge', 'luck', 'gim', 'evade', 'nodeath'];         // 죽으면 옮겨 가는 것

// ==========================================
// 손에 잡히는 것들
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function now() { return Date.now(); }
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(function (u) { return u && u.name && u.code && u.code !== ADMIN; });
}
function userOf(code) {
    const me = u_();
    if (me && code === me.code) return me;
    return (typeof db !== 'undefined' && db.users) ? (db.users[code] || null) : null;
}
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function find(who) {
    if (!who) return u_();
    return users().filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
function baseOf(w) { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
function kOn() { try { return typeof window.kroomOn === 'function' && window.kroomOn(); } catch (e) { return false; } }
function obj(v) { return (v && typeof v === 'object' && !Array.isArray(v)) ? v : null; }
function span(ms) {
    const m = Math.max(0, Math.round(ms / 60000));
    const h = Math.floor(m / 60), mm = m % 60;
    return (h ? h + '시간' : '') + (h && mm ? ' ' : '') + (mm || !h ? mm + '분' : '');
}
function inQ(u) {
    if (!u) return false;
    try { if (typeof isQuarantined === 'function') return !!isQuarantined(u); } catch (e) { }
    return !!(u.quarantineUntil && now() < u.quarantineUntil);
}
function bathOf(u) { return ((u && u.quarantineDest) || 'fox') === 'bath'; }

// ==========================================
// 장착자 — 두 신도
// ==========================================
function cult(u) {
    if (!u) return { d1: { s: {} }, d2: { s: {} } };
    if (!obj(u.foxCult)) u.foxCult = {};
    DS.forEach(function (d) {
        if (!obj(u.foxCult[d])) u.foxCult[d] = {};
        if (!obj(u.foxCult[d].s)) u.foxCult[d].s = {};
    });
    return u.foxCult;
}
function nickOf(u, d) { const c = u && obj(u.foxCult) && obj(u.foxCult[d]); return (c && c.nick) || ''; }
function dName(u, d) { const n = nickOf(u, d); return D_NAME[d] + (n ? '(' + n + ')' : ''); }
function busy(u, d) { const c = cult(u)[d]; return c.to ? c.to : null; }       // 동행 중이면 누구 곁인가
function withWhom(u, d) { const c = busy(u, d); return c === u.code ? '당신과' : nameOf(c) + ' 사원과'; }
function selfUsed(u) { return !!(u && obj(u.foxCult) && u.foxCult.selfDay === today()); }

// ==========================================
// 역병 — 걸린 쪽
// ==========================================
function plAll(u) { return (u && obj(u.foxPl)) ? u.foxPl : {}; }
function plOf(u, k) { const p = plAll(u)[k]; return (p && (Number(p.until) || 0) > now()) ? p : null; }
function plVal(u, k) { const p = plOf(u, k); return p ? (Number(p.v) || 0) : 0; }
function plLive(u) { return Object.keys(plAll(u)).filter(function (k) { return !!plOf(u, k); }); }
// 이 사람의 탐사 몫을 같이 받는 장착자들 — 역병을 뿌린 사람 · 신도를 동행시킨 사람 (자기 자신은 뺀다)
function spreaders(u) {
    const out = {};
    plLive(u).forEach(function (k) { const p = plOf(u, k); if (p.by && p.by !== u.code) out[p.by] = p.byName || nameOf(p.by); });
    DS.forEach(function (d) { const w = withOf(u, d); if (w && w.by !== u.code) out[w.by] = w.owner.name || nameOf(w.by); });
    return out;
}
// 몫을 받아 가는 신도 — 역병을 뿌린 신도 · 동행하는 신도 (자기 자신 것은 뺀다)
function spreadDs(u) {
    const out = {};
    plLive(u).forEach(function (k) { const p = plOf(u, k); if (p.by && p.by !== u.code && (p.d === 'd1' || p.d === 'd2')) out[p.d] = 1; });
    DS.forEach(function (d) { const w = withOf(u, d); if (w && w.by !== u.code) out[d] = 1; });
    return out;
}
// 정산서 — 몫을 받아 가며 신도가 하는 말
const QUOTE = { d1: '🎐 여우 신도의 몫 - "감사히 잘 받았습니다."', d2: '🎐 여우 신도의 몫 - "정당한 대가를 받습니다."' };
function quoteLines(ds) { return DS.filter(function (d) { return ds && ds[d]; }).map(function (d) { return QUOTE[d]; }); }

function valTxt(k, v, e) {
    const P = PL_BY[k];
    if (k === 'rescue') {
        const where = (e && e.w === 'bath') ? '선녀탕' : '상담실';
        return where + ' 구출' + (v ? ' — ' + v + '시간 단축' : '');
    }
    if (k === 'solo') return '홀로 어둠 탐사';
    if (k === 'pts') return '포인트 배수 ×' + v;
    if (k === 'luckx') return '행운 배수 ' + v + '%';
    return P.n + ' ' + v;
}

// ==========================================
// 동행 — 곁에 붙은 신도 (장착자 쪽이 아직 이 사람을 가리켜야 산다)
// ==========================================
function withOf(u, d) {
    if (!u) return null;
    const w = obj(u.foxWith) && obj(u.foxWith[d]);
    if (!w || !w.by) return null;
    const o = userOf(w.by);
    if (!o || !wears(o)) return null;
    const c = obj(o.foxCult) && obj(o.foxCult[d]);
    if (!c || c.to !== u.code) return null;
    return { d: d, by: w.by, owner: o, nick: c.nick || '', s: obj(c.s) || {}, line: w.line || '' };
}
function withVal(u, d, k) { const w = withOf(u, d); return w ? (Number(w.s[k]) || 0) : 0; }
// 지금 쓰는 값 — 역병과 동행 가운데 큰 쪽
function stat(u, k) {
    const P = PL_BY[k];
    return Math.max(plVal(u, k), P ? withVal(u, P.d, k) : 0);
}
// 어디든 — 홀로 어둠 탐사 역병 · 제 二 신도 동행
function freeOf(u) { return !!(u && (plOf(u, 'solo') || withOf(u, 'd2'))); }
function seesOf(u) { return stat(u, 'evade') >= C.SEE; }

// ==========================================
// 특이사항
// ==========================================
function badgeKey(u) {
    if (!u || !u.badge || typeof u.badge !== 'object') return 'notes';
    if (typeof u.badge.notes === 'string') return 'notes';
    if (typeof u.badge.note === 'string') return 'note';
    return 'notes';
}
function notesOf(u) {
    if (!u || !u.badge) return '';
    return String(typeof u.badge === 'object' ? (u.badge[badgeKey(u)] || '') : u.badge);
}
function cutNote(u, line) {
    if (!u || !u.badge || !line) return false;
    const isObj = (typeof u.badge === 'object');
    const key = isObj ? badgeKey(u) : null;
    const raw = String(isObj ? (u.badge[key] || '') : u.badge);
    if (raw.indexOf(line) < 0) return false;
    const keep = raw.split(/\s*\|\s*|<br\s*\/?>|\n/).filter(function (x) { return x && x.trim() !== line.trim(); });
    const out = keep.join(' | ') || '특이사항 없음';
    if (isObj) u.badge[key] = out; else u.badge = out;
    return true;
}
function addNote(u, line) {
    if (!u || !line) return;
    if (notesOf(u).split(/\s*\|\s*/).some(function (x) { return x.trim() === line; })) return;
    try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, line); } catch (e) { }
}
// note-fix.js — 「🎐」 줄이 아직 살아 있나 (역병이 끝났거나 동행을 거둬 갔으면 걷는다)
window.foxdNoteLive = function (u, note) {
    try {
        const t = String(note || '').trim();
        if (t.indexOf('🎐 ') !== 0) return true;             // 「[장착됨] 🎐 …」 같은 줄은 건드리지 않는다
        if (plLive(u).some(function (k) { return String(plOf(u, k).line || '').trim() === t; })) return true;
        if (DS.some(function (d) { const w = withOf(u, d); return w && String(w.line || '').trim() === t; })) return true;
        // 방금 붙은 동행 — 장착자 쪽 기록이 아직 안 왔을 수 있다 (1분은 기다린다)
        if (obj(u.foxWith) && DS.some(function (d) { const w = obj(u.foxWith[d]); return w && String(w.line || '').trim() === t && now() - (Number(w.at) || 0) < 60000; })) return true;
        return false;
    } catch (e) { return true; }
};

// ==========================================
// 쓰기 — 내 것은 saveFields, 남의 것은 자식 길 + 도장
// ==========================================
function push(code, paths) {
    const d = db_();
    if (!d || !code) return;
    const up = {};
    Object.keys(paths).forEach(function (p) { up['users/' + code + '/' + p] = (paths[p] === undefined) ? null : paths[p]; });
    up['users/' + code + '/_adminStamp'] = now();
    try { d.ref('/').update(up).catch(function () { }); } catch (e) { }
}
function clean(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; } }

// ==========================================
// 역병을 뿌린다
// ==========================================
//   code 가 나면 하루 한 번 · 한 가지.  v — 수치 (구출은 0 = 바로 · 1~3 = 시간)
function spread(d, k, code, v) {
    const me = u_(), t = userOf(code), P = PL_BY[k];
    if (!me || !t || !P || P.d !== d) return false;
    if (!wears(me)) { alert_(NAME + ' 을(를) 차고 있어야 합니다.'); return false; }
    const self = (code === me.code);
    if (busy(me, d)) { alert_(dName(me, d) + '는 지금 ' + withWhom(me, d) + ' 동행 중입니다.\n\n동행 중인 신도의 역병은 뿌리게 명하지 못합니다.'); return false; }
    if (self && selfUsed(me)) { alert_('본인에게는 하루 딱 한 번 · 한 가지만 쓸 수 있습니다.\n\n오늘은 이미 썼습니다.'); return false; }
    if (P.vals && P.vals.indexOf(v) < 0) { alert_('수치가 맞지 않습니다.'); return false; }
    let rq = null;
    if (k === 'rescue') {
        if (!inQ(t)) { alert_((self ? '당신은' : t.name + ' 사원은') + ' 지금 상담실 · 선녀탕에 있지 않습니다.'); return false; }
        if ([0, 1, 2, 3].indexOf(v) < 0) return false;
        const cur = Number(t.quarantineUntil) || 0;
        const nu = v ? Math.max(now() + 1500, cur - v * C.HOUR) : now() + 1500;
        rq = { until: nu, ms: Math.max(0, cur - nu), out: nu <= now() + 1500 };
    }
    const e = { v: v, until: now() + C.HOUR, by: me.code, byName: me.name || '', d: d, at: now() };
    if (k === 'nodeath') e.left = v;
    if (k === 'rescue') e.w = bathOf(t) ? 'bath' : 'fox';
    e.line = '🎐 ' + dName(me, d) + '가 역병을 뿌립니다. - ' + valTxt(k, v, e);
    // 같은 역병이 걸려 있으면 바꿔 단다
    const old = plAll(t)[k];
    if (old && old.line) cutNote(t, old.line);
    if (!obj(t.foxPl)) t.foxPl = {};
    t.foxPl[k] = e;
    addNote(t, e.line);
    const say = valTxt(k, v, e);
    log_(t, '[' + NAME + '] ' + (self ? '' : (me.name || '') + ' 사원의 ') + dName(me, d) + '가 역병을 뿌렸습니다 — ' + say + ' (한 시간)');
    let call = null;
    if (rq) {
        call = { k: rq.out ? 'out' : 'cut', ms: rq.ms, until: rq.until, by: me.code, byName: me.name || '', nick: dName(me, 'd2'), at: now() };
        t.quarantineUntil = rq.until;
        t.foxCall = call;
    }
    if (self) {
        cult(me).selfDay = today();
        const f = { foxPl: 1, badge: 1, history: 1, foxCult: 1 };
        if (call) { me.foxCallSeen = call.at; outPending = true; f.quarantineUntil = 1; f.foxCall = 1; f.foxCallSeen = 1; }
        save(f);
        try { if (typeof updateUI === 'function') updateUI(); } catch (er2) { }
    } else {
        const paths = { ['foxPl/' + k]: clean(e), badge: clean(t.badge), history: clean(t.history || []), hasItemUsedOnMe: true };
        if (call) { paths.quarantineUntil = rq.until; paths.foxCall = call; }
        push(code, paths);
        t.hasItemUsedOnMe = true;
        log_(me, '[' + NAME + '] ' + dName(me, d) + ' → ' + t.name + ' 사원 · ' + say);
        save({ history: 1 });
    }
    return { e: e, say: say, call: call, self: self, t: t };
}

// 죽은 사람 — 제 一 신도의 역병이 곁의 살아 있는 사람 하나에게 옮겨 간다 (신도 마음대로)
function nearOf(me) {
    const r = run();
    const pid = (r && r.partyId) || (typeof myPartyId !== 'undefined' ? myPartyId : null);
    const p = (pid && typeof darkParties !== 'undefined') ? darkParties[pid] : null;
    if (!p) return [];
    const alive = obj(p.alive) ? Object.keys(p.alive).filter(function (c) { return p.alive[c]; }) : Object.keys(p.members || {});
    return alive.filter(function (c) { return c !== me.code && userOf(c); });
}
function passOn(where) {
    const me = u_();
    if (!me) return null;
    const ks = DEATH_KEYS.filter(function (k) { const p = plOf(me, k); return p && p.d === 'd1'; });
    if (!ks.length) return null;
    const near = nearOf(me);
    const to = near.length ? near[Math.floor(Math.random() * near.length)] : null;
    const t = to ? userOf(to) : null;
    const moved = [];
    const paths = {};
    ks.forEach(function (k) {
        const e = clean(plOf(me, k));
        cutNote(me, e.line);
        delete me.foxPl[k];
        if (!t) return;
        const old = plAll(t)[k];
        if (old && old.line) cutNote(t, old.line);
        if (!obj(t.foxPl)) t.foxPl = {};
        t.foxPl[k] = e;
        addNote(t, e.line);
        paths['foxPl/' + k] = e;
        moved.push(valTxt(k, e.v, e));
    });
    save({ foxPl: 1, badge: 1 });
    if (!t) { log_(me, '[' + NAME + '] 쓰러졌습니다 — 곁에 아무도 없어 제 一 신도의 역병이 흩어졌습니다.'); save({ history: 1 }); return null; }
    log_(t, '[' + NAME + '] ' + (me.name || '') + ' 사원이 쓰러지자 제 一 신도가 역병을 당신에게 옮겼습니다 — ' + moved.join(' · '));
    paths.badge = clean(t.badge); paths.history = clean(t.history || []); paths.hasItemUsedOnMe = true;
    push(to, paths);
    log_(me, '[' + NAME + '] 쓰러졌습니다 — 제 一 신도가 역병을 ' + t.name + ' 사원에게 옮겼습니다.');
    save({ history: 1 });
    try { if (typeof sendPartyChat === 'function' && run() && run().isParty) sendPartyChat('🎐 ' + (me.name || '') + ' 사원이 쓰러지자 제 一 신도가 역병을 ' + t.name + ' 사원에게 옮겼습니다.', true); } catch (e) { }
    return t.name;
}

// ==========================================
// 동행 — 보낸다 · 거둬 온다
// ==========================================
function withLine(o, d, s) {
    if (d === 'd2') return '🎐 ' + dName(o, d) + '가 동행합니다. 어디든지 갈 수 있습니다.';
    const parts = WITH_KEYS.d1.filter(function (k) { return Number(s[k]) > 0; }).map(function (k) { return PL_BY[k].n + ' ' + s[k]; });
    return '🎐 ' + dName(o, d) + '가 동행합니다.' + (parts.length ? ' - ' + parts.join(' · ') : '');
}
function recall(d, quiet) {
    const me = u_();
    const c = cult(me)[d];
    const to = c.to;
    if (!to) return;
    const t = userOf(to);
    if (t) {
        const w = obj(t.foxWith) && obj(t.foxWith[d]);
        if (w && w.line) cutNote(t, w.line);
        if (obj(t.foxWith)) delete t.foxWith[d];
    }
    c.to = null; c.toName = null;
    if (to === me.code) {
        save({ foxWith: 1, badge: 1, foxCult: 1 });
    } else {
        if (t) push(to, { ['foxWith/' + d]: null, badge: clean(t.badge) });
        save({ foxCult: 1 });
    }
    if (!quiet) log_(me, '[' + NAME + '] ' + dName(me, d) + '를 ' + (to === me.code ? '곁에서' : nameOf(to) + ' 사원 곁에서') + ' 거둬 왔습니다.');
}
function sendWith(d, code, s) {
    const me = u_(), t = userOf(code);
    if (!me || !t || !wears(me)) return false;
    const c = cult(me)[d];
    if (c.to && c.to !== code) recall(d, true);
    const ss = {};
    WITH_KEYS[d].forEach(function (k) { ss[k] = Number(s[k]) || 0; });
    c.s = ss; c.to = code; c.toName = t.name || '';
    const line = withLine(me, d, ss);
    const old = obj(t.foxWith) && obj(t.foxWith[d]);
    if (old && old.line) cutNote(t, old.line);
    if (!obj(t.foxWith)) t.foxWith = {};
    t.foxWith[d] = { by: me.code, byName: me.name || '', line: line, at: now() };
    addNote(t, line);
    if (code === me.code) {
        save({ foxCult: 1, foxWith: 1, badge: 1, history: 1 });
    } else {
        log_(t, '[' + NAME + '] ' + (me.name || '') + ' 사원의 ' + dName(me, d) + '가 당신과 동행합니다.');
        push(code, { ['foxWith/' + d]: clean(t.foxWith[d]), badge: clean(t.badge), history: clean(t.history || []), hasItemUsedOnMe: true });
        save({ foxCult: 1, history: 1 });
    }
    log_(me, '[' + NAME + '] ' + dName(me, d) + ' → ' + (code === me.code ? '내 곁' : t.name + ' 사원') + ' 동행');
    return line;
}
// 능력치만 바꾼다 — 곁의 사람 특이사항 줄도 맞춘다
function retune(d, s) {
    const me = u_(), c = cult(me)[d];
    if (!c.to) return false;
    return sendWith(d, c.to, s);
}

// ==========================================
// 탐사 안 — 지금 내 몫
// ==========================================
function rs() {
    const r = run(); if (!r) return null;
    if (!r._foxd) r._foxd = { nd: 0, flip: 0, rev: {}, by: {}, ds: {} };
    if (!r._foxd.ds) r._foxd.ds = {};
    return r._foxd;
}
// 이번 탐사 동안 내게 역병을 뿌린 장착자 — 정산 때 끝났어도 몫은 간다
function noteSpreaders() {
    const me = u_(), x = rs();
    if (!me || !x) return;
    const s = spreaders(me);
    Object.keys(s).forEach(function (c) { x.by[c] = s[c]; });
    const ds = spreadDs(me);
    Object.keys(ds).forEach(function (d) { x.ds[d] = 1; });
}
setInterval(function () { try { noteSpreaders(); } catch (e) { } }, 5000);

// 즉사를 무효로 한다 — 역병 몫 먼저, 그다음 동행 몫. 무엇이 했는지 글줄을 돌려준다
function nodeath() {
    const me = u_();
    if (!me) return null;
    const p = plOf(me, 'nodeath');
    if (p && (Number(p.left) || 0) > 0) {
        p.left = (Number(p.left) || 0) - 1;
        save({ foxPl: 1 });
        return '— 몸 안에서 무언가가 들끓는다. 아홉여우병이 죽음을 비껴가게 했다.<br>' + esc(p.byName ? p.byName + ' 사원의 ' : '') + '제 一 신도의 역병 — 즉사 무효 (남은 ' + p.left + ')';
    }
    const w = withOf(me, 'd1'), x = rs();
    if (w && x && x.nd < (Number(w.s.nodeath) || 0)) {
        x.nd++;
        const nm = esc(dName(w.owner, 'd1'));
        const t = [nm + '가 당신을 들쳐 메고 그 자리를 벗어났다. 등 뒤에서 무언가가 닫히는 소리가 났다.',
                   nm + '가 당신을 안아 들고 뛰었다. 발이 땅에 닿았을 때는 이미 그것의 손이 닿지 않는 곳이었다.',
                   nm + '가 당신의 뒷덜미를 물어 끌어냈다. 방금 서 있던 자리가 통째로 꺼진다.'][rnd(0, 2)];
        return '— ' + t + '<br>(즉사 무효 ' + x.nd + ' / ' + w.s.nodeath + ')';
    }
    return null;
}
// 되살린다 — 동행하는 신도마다 탐사당 한 번
function revive() {
    const me = u_(), x = rs();
    if (!me || !x) return null;
    for (let i = 0; i < DS.length; i++) {
        const d = DS[i], w = withOf(me, d);
        if (!w || x.rev[d]) continue;
        x.rev[d] = 1;
        const nm = esc(dName(w.owner, d));
        log_(me, '[' + NAME + '] ' + dName(w.owner, d) + '가 쓰러진 당신을 되살렸습니다.');
        save({ history: 1 });
        return d === 'd1'
            ? '— 쓰러진 몸 위로 여우 그림자가 내려앉는다.<br>' + nm + '가 당신의 입에 숨을 도로 불어 넣었다. 감긴 눈이 다시 뜨인다. (부활 — 이번 탐사 한 번)'
            : '— 방울 소리가 난다. 아주 먼 데서, 그러다 바로 귓가에서.<br>' + nm + '가 당신의 이름을 부른다. 끊어졌던 숨이 그 부름을 따라 돌아온다. (부활 — 이번 탐사 한 번)';
    }
    return null;
}
function saveMe() { return nodeath() || revive(); }
function lineBox(t) {
    return '<span style="color:#f0c987;">' + t + '</span>';
}

// 쓰러져 상담실 · 선녀탕으로 가게 되면 — 제 二 신도(구출을 지니고 동행)가 바로 부른다
let outPending = false;
function callOutSoon() {
    const me = u_();
    const w = withOf(me, 'd2');
    if (!w || !(Number(w.s.rescue) > 0)) return;
    setTimeout(function () {
        const m = u_();
        if (!m || !inQ(m)) return;
        m.quarantineUntil = Math.min(Number(m.quarantineUntil) || 0, now() + 1500);
        m.foxCall = { k: 'out', ms: 0, until: m.quarantineUntil, by: w.by, byName: w.owner.name || '', nick: dName(w.owner, 'd2'), at: now(), self: 1 };
        m.foxCallSeen = m.foxCall.at;
        outPending = true;
        log_(m, '[' + NAME + '] ' + dName(w.owner, 'd2') + '가 ' + (bathOf(m) ? '선녀탕' : '상담실') + '에서 당신을 불러냈습니다.');
        save({ quarantineUntil: 1, foxCall: 1, foxCallSeen: 1, history: 1 });
        alert_('🎐 ' + dName(w.owner, 'd2') + '가 당신을 부릅니다.\n\n' + (bathOf(m) ? '선녀탕' : '상담실') + ' 문이 열립니다.');
    }, 2500);
}
// 죽은 뒤 — 역병을 옮기고, 제 二 신도가 부른다
function died() {
    const r = run(), x = rs();
    if (x && x.diedDone) return;
    if (x) x.diedDone = true;
    try { const to = passOn(); if (to) toast('🎐 제 一 신도가 역병을 ' + to + ' 사원에게 옮겼다'); } catch (e) { console.warn('[여우 신도] 옮기기', e); }
    try { callOutSoon(); } catch (e) { }
}

// 포인트 배수 — 역병 · 동행 가운데 큰 쪽
function mult() { return Math.max(1, stat(u_(), 'pts')); }
// 몫 — 역병을 뿌린 장착자에게 똑같이 (포인트 · K의 방 경험치)
function share(pts, exp, where) {
    const me = u_(), x = rs(), d = db_();
    if (!me) return [];
    const by = Object.assign({}, (x && x.by) || {}, spreaders(me));
    delete by[me.code];
    const who = Object.keys(by);
    const ds = Object.assign({}, (x && x.ds) || {}, spreadDs(me));
    pts = Math.round(Number(pts) || 0); exp = Math.round(Number(exp) || 0);
    if (!who.length || (pts <= 0 && exp <= 0) || !d) return [];
    who.forEach(function (code) {
        try {
            if (pts > 0) d.ref('payouts/' + code).push({ amount: pts, note: '[' + NAME + '] ' + (me.name || '') + ' 사원의 탐사 몫 (' + where + ') +' + pts.toLocaleString() + ' P', at: now() });
            if (exp > 0) d.ref('foxShare/' + code).push({ exp: exp, from: me.code, fromName: me.name || '', where: where, at: now() });
        } catch (e) { }
    });
    log_(me, '[' + NAME + '] 여우 신도의 몫 — ' + who.map(function (c) { return by[c]; }).join(', ') + ' 사원에게도 같은 몫이 갔습니다'
        + ' (' + [pts > 0 ? pts.toLocaleString() + ' P' : '', exp > 0 ? '경험치 ' + exp : ''].filter(Boolean).join(' · ') + ')');
    save({ history: 1 });
    return quoteLines(ds);                 // 정산서에 적을 줄
}

// 장착자 쪽 — K의 방 경험치 몫을 받는다 (자리에 없었으면 들어올 때)
let shareRef = null, shareCode = null;
setInterval(function () {
    try {
        const me = u_(), d = db_();
        if (!me || !d || shareCode === me.code) return;
        if (shareRef) { try { shareRef.off(); } catch (e) { } }
        shareCode = me.code;
        shareRef = d.ref('foxShare/' + me.code);
        shareRef.on('child_added', function (snap) {
            const id = snap.key, v = snap.val();
            if (!v || v.claimed || !u_() || u_().code !== shareCode) return;
            d.ref('foxShare/' + shareCode + '/' + id).transaction(function (x) { if (!x || x.claimed) return; x.claimed = true; return x; }).then(function (res) {
                if (!res || !res.committed) return;
                const n = Math.round(Number(v.exp) || 0);
                let got = null;
                try { if (n > 0 && typeof window.kroomExpGift === 'function') got = window.kroomExpGift(n); } catch (e) { }
                log_(u_(), '[' + NAME + '] ' + (v.fromName || '') + ' 사원의 탐사 몫 (' + (v.where || '') + ') — K의 방 경험치 +' + n + (got && got.lv > got.lv0 ? ' · Lv ' + got.lv0 + ' → ' + got.lv : ''));
                save({ history: 1 });
                toast('🎐 ' + (v.fromName || '') + ' 사원의 몫 — 경험치 +' + n);
                d.ref('foxShare/' + shareCode + '/' + id).remove().catch(function () { });
            }).catch(function () { });
        });
    } catch (e) { }
}, 1500);

// ==========================================
// 상담실 · 선녀탕 — 받는 쪽이 띄운다
// ==========================================
const SHUT_ROOMS = ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay', 'quarantine-pick-overlay', 'fox-loading-overlay'];
setInterval(function () {
    try {
        const me = u_();
        if (!me) return;
        const c = obj(me.foxCall);
        if (c && (Number(c.at) || 0) > (Number(me.foxCallSeen) || 0)) {
            me.foxCallSeen = c.at;
            // 내 창이 묵은 값으로 덮어썼으면 다시 맞춘다
            if (inQ(me) && (Number(me.quarantineUntil) || 0) > (Number(c.until) || 0)) me.quarantineUntil = Number(c.until) || now();
            const f = { foxCallSeen: 1, quarantineUntil: 1 };
            save(f);
            if (c.k === 'out') {
                outPending = true;
                alert_('🎐 ' + (c.nick || '제 二 신도') + '가 당신을 부릅니다.' + (c.byName && c.by !== me.code ? '\n\n(' + c.byName + ' 사원의 신도)' : ''));
            } else {
                const left = Math.max(0, (Number(me.quarantineUntil) || 0) - now());
                if (left <= 2000) outPending = true;
                alert_('🎐 여우의 역병이 당신의 시간을 잡아먹습니다. - ' + span(c.ms) + '\n\n'
                    + (left <= 2000 ? '남은 시간이 다 먹혀 문이 열립니다.' : '남은 시간 ' + span(left)));
            }
        }
        if (outPending && !inQ(me)) {
            outPending = false;
            SHUT_ROOMS.forEach(function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
            try { document.body.style.overflow = ''; } catch (e) { }
            try { hasShownFoxAlert = false; } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        }
    } catch (e) { }
}, 1500);

// 내 특이사항 — 끝난 역병 · 거둬 간 동행 줄을 걷는다 (남의 화면은 note-fix.js 가 가린다)
function sweep() {
    const me = u_();
    if (!me) return;
    let ch = false;
    const all = plAll(me);
    Object.keys(all).forEach(function (k) {
        const p = all[k];
        if (p && (Number(p.until) || 0) > now()) return;
        if (p && p.line) cutNote(me, p.line);
        delete all[k]; ch = true;
    });
    if (obj(me.foxWith)) {
        DS.forEach(function (d) {
            const w = me.foxWith[d];
            if (!w) return;
            if (withOf(me, d)) return;
            const o = userOf(w.by);
            if (!o) return;                                // 장착자 기록을 아직 못 읽었다 — 다음에
            if (now() - (Number(w.at) || 0) < 60000) return;   // 방금 붙었다 — 장착자 쪽 기록이 아직 안 왔을 수 있다
            if (w.line) cutNote(me, w.line);
            delete me.foxWith[d]; ch = true;
        });
    }
    // 살아 있는데 줄이 빠졌으면 다시 적는다
    const have = notesOf(me).split(/\s*\|\s*/).map(function (x) { return x.trim(); });
    plLive(me).forEach(function (k) { const l = plOf(me, k).line; if (l && have.indexOf(l) < 0) { addNote(me, l); ch = true; } });
    DS.forEach(function (d) { const w = withOf(me, d); if (w && w.line && have.indexOf(w.line) < 0) { addNote(me, w.line); ch = true; } });
    // 묵은 🎐 줄 — 살아 있는 것과 맞지 않으면 걷는다
    notesOf(me).split(/\s*\|\s*/).forEach(function (line) {
        if (line.trim().indexOf('🎐 ') !== 0) return;
        if (!window.foxdNoteLive(me, line)) { cutNote(me, line); ch = true; }
    });
    if (ch) {
        if (!obj(me.foxPl)) me.foxPl = {};
        if (!obj(me.foxWith)) me.foxWith = {};
        save({ foxPl: 1, foxWith: 1, badge: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    }
}
setInterval(function () { try { sweep(); } catch (e) { } }, 20000);
setTimeout(function () { try { sweep(); } catch (e) { } }, 7000);

// ==========================================
// 『 K 의 방 』 · 다른 파일이 부른다
// ==========================================
window.FOXCULT = {
    NAME: NAME,
    wears: function () { return wears(u_()); },
    free: function () { return freeOf(u_()); },
    freeOf: freeOf,
    sees: function () { return seesOf(u_()); },
    stat: function (k) { return stat(u_(), k); },
    nodeath: nodeath,
    revive: revive,
    save: saveMe,
    died: died,
    mult: mult,
    share: share,
    PL: PL, C: C
};

// ==========================================
// 굴림 — 판정 · 회피
// ==========================================
function hook(name, make) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._foxd) { clearInterval(iv); return; }
        const w = make(f);
        Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
        w._foxd = true;
        window[name] = w;
        try { if (name === 'renderDarkResult') renderDarkResult = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
}

hook('rollDarkBonus', function (_r) {
    return function (kind) {
        let b = _r.apply(this, arguments);
        try {
            const me = u_();
            if (me && run()) {
                b += stat(me, 'judge');
                if (kind === 'evade' || kind === 'hide') b += stat(me, 'evade');
            }
        } catch (e) { }
        return b;
    };
});

// 눈 — 동행하는 제 一 신도(행운)가 낮은 눈을 뒤집는다 (탐사당 수치만큼)
hook('luckReroll', function (_l) {
    return function (roll) {
        let out = _l.apply(this, arguments);
        try {
            const me = u_(), x = rs(), w = withOf(me, 'd1');
            if (w && x && out <= C.LOW && x.flip < (Number(w.s.luck) || 0)) {
                x.flip++;
                const nr = rnd(C.FLIP[0], C.FLIP[1]);
                const r = run();
                if (r && r.log) r.log.push('[🎐 ' + dName(w.owner, 'd1') + '] 주사위를 뒤집음 (' + out + ' → ' + nr + ')');
                toast('🎐 ' + dName(w.owner, 'd1') + '가 주사위를 뒤집어 놓았다 (' + out + ' → ' + nr + ' · ' + x.flip + '/' + w.s.luck + ')');
                out = nr;
            }
        } catch (e) { }
        return out;
    };
});

// 행운 — 전용 장비 행운 값에 더한다 (15 면 100%)
hook('gearValue', function (_g) {
    return function (user, attr) {
        let v = _g.apply(this, arguments);
        try {
            const me = u_();
            if (attr === 'luck' && me && user && user.code === me.code) {
                const n = stat(me, 'luck');
                if (n > 0) v = Math.min(1, (Number(v) || 0) + n / 15);
            }
        } catch (e) { }
        return v;
    };
});

// 기믹 파훼 — 횟수에 더한다
hook('smashCharges', function (_s) {
    return function () {
        let n = _s.apply(this, arguments);
        try { n += stat(u_(), 'gim'); } catch (e) { }
        return n;
    };
});

// 행운 배수 — 회수품 확률 · 공용시설 행운
hook('emLootMult', function (_e) {
    return function (user) {
        let m = _e.apply(this, arguments);
        try {
            const me = u_(), u = user || me;
            if (me && u && u.code === me.code) { const p = stat(me, 'luckx'); if (p > 0) m *= (1 + p / 100); }
        } catch (e) { }
        return m;
    };
});
hook('facilityLuckMult', function (_f) {
    return function (user) {
        let m = _f.apply(this, arguments);
        try {
            const me = u_(), u = user || me;
            if (me && u && u.code === me.code) { const p = stat(me, 'luckx'); if (p > 0) m *= (1 + p / 100); }
        } catch (e) { }
        return m;
    };
});

// ==========================================
// 죽음 — 어둠 · 피날레 (darkDeath) · EPIC (epicDeath).  K의 방은 kroom-core.js 가 부른다
// ==========================================
hook('darkDeath', function (_d) {
    return function (reasonText) {
        const r0 = run();
        try {
            if (r0 && !kOn() && !r0._dead) {
                const line = saveMe();
                if (line) {
                    r0.fail = Math.max(0, (Number(r0.fail) || 0) - 1);
                    const box = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                    if (box && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                        box.innerHTML = darkBox('—', String(reasonText || '') + '<br><br>' + lineBox(line), darkChoiceBtn('일어선다.', 'renderDarkStep();'));
                        try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                    }
                    try { if (r0.isParty && typeof sendPartyChat === 'function') sendPartyChat('🎐 ' + ((u_() || {}).name || '') + ' 사원 — 여우 신도가 죽음을 비껴가게 했습니다.', true); } catch (e) { }
                    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                    return;
                }
            }
        } catch (e) { console.warn('[여우 신도] 죽음 건너뜀:', e && e.message); }
        const out = _d.apply(this, arguments);
        try { if (r0 && r0._dead && !kOn()) died(); } catch (e) { }
        return out;
    };
});
hook('epicDeath', function (_e) {
    return function (txt) {
        try {
            if (typeof er !== 'undefined' && er && !er.dead) {
                const line = saveMe();
                if (line) {
                    const me = u_(), r = run();
                    er.danger = null; er._calledHelp = false;
                    try { if (db_() && r && r.partyId) db_().ref('darkParties/' + r.partyId + '/epicHelp/' + me.code).remove(); } catch (e) { }
                    let bar = '';
                    try { if (typeof epicBar === 'function') bar = epicBar(); } catch (e) { }
                    darkBodyEl().innerHTML = darkBox('—', String(txt || '') + '<br><br>' + lineBox(line), bar + darkChoiceBtn('일어선다.', 'epicMap()'));
                    return;
                }
            }
        } catch (e) { console.warn('[여우 신도] EPIC 죽음 건너뜀:', e && e.message); }
        const out = _e.apply(this, arguments);
        try { if (typeof er !== 'undefined' && er && er.dead) died(); } catch (e) { }
        return out;
    };
});

// ==========================================
// 선택지 — 회피 7 이상이면 죽는 길(0번이 아닌 쪽)에 ☪️ (내 화면에만 · jisan.js 와 같은 약속)
// ==========================================
function shared() {
    const r = run();
    return !!(r && r.isParty && !r.solo && !r.taken && !r._a214Scattered);
}
function jisanToo() { try { return !!(window.JISANFOX && window.JISANFOX.wears(u_())); } catch (e) { return false; } }
function seeWho() {
    const me = u_();
    const w = withOf(me, 'd1');
    if (w && (Number(w.s.evade) || 0) >= C.SEE) return '— ' + esc(dName(w.owner, 'd1')) + '가 꼬리로 한쪽을 가린다. ☪️ 가 붙은 쪽은 죽는 길이다.';
    return '— 열에 들뜬 눈에 다른 것이 비친다. 아홉여우병이 길을 보여 준다. ☪️ 가 붙은 쪽은 죽는 길이다.';
}
hook('renderChoiceStep', function (_c) {
    return function (title, text, options, imgKey) {
        try {
            const me = u_();
            if (me && seesOf(me) && !jisanToo() && Array.isArray(options) && options.length > 1) {
                if (!shared()) {
                    options = options.map(function (o, i) {
                        if (i === 0 || !o || String(o.label || '').indexOf('☪️') >= 0) return o;
                        return Object.assign({}, o, { label: '☪️ ' + o.label });
                    });
                }
                text = String(text || '') + '<br><br><span style="color:#f0c987;">' + seeWho() + '</span>';
            }
        } catch (e) { }
        return _c.call(this, title, text, options, imgKey);
    };
});
hook('renderVoteState', function (_v) {
    return function () {
        const out = _v.apply(this, arguments);
        try {
            const me = u_();
            if (!me || !seesOf(me) || jisanToo()) return out;
            const area = document.getElementById('vote-area');
            if (!area) return out;
            const bs = area.querySelectorAll('button[onclick^="castVote"]');
            for (let i = 1; i < bs.length; i++) {
                if (bs[i].innerHTML.indexOf('☪️') >= 0 || bs[i].innerHTML.indexOf('🈲') >= 0) continue;
                bs[i].insertAdjacentHTML('afterbegin', '☪️ ');
            }
        } catch (e) { }
        return out;
    };
});

// ==========================================
// 정산 — 포인트 배수 · 몫 (어둠 · 피날레 · EPIC).  K의 방은 kroom-core.js
// ==========================================
function settleWrap(where, _r, self, args, dead) {
    const me = u_();
    if (!me || dead) return _r.apply(self, args);
    try { noteSpreaders(); } catch (e) { }
    const m = mult();
    const x = rs();
    const keep = x ? Object.assign({}, x.by) : {};
    const keepDs = x ? Object.assign({}, x.ds) : {};
    const before = Number(me.points) || 0;
    const out = _r.apply(self, args);
    try {
        const got = (Number(me.points) || 0) - before;
        if (got <= 0) return out;
        let extra = 0;
        const lines = [];
        if (m > 1) {
            extra = Math.round(got * (m - 1));
            try { if (typeof changePoints === 'function') changePoints(extra); else me.points += extra; } catch (e) { me.points += extra; }
            log_(me, '[' + NAME + '] 포인트 배수 ×' + m + ' (+' + extra.toLocaleString() + ' P)');
            save({ history: 1 });
            lines.push('🎐 아홉여우병 — 포인트 ×' + m + ' (+' + extra.toLocaleString() + ' P)');
        }
        // darkRun 이 비었어도 몫은 간다 — 베껴 둔 장착자 몫으로
        const by = Object.assign({}, keep, spreaders(me));
        delete by[me.code];
        const total = got + extra;
        if (Object.keys(by).length) {
            const d = db_();
            if (d) Object.keys(by).forEach(function (code) {
                try { d.ref('payouts/' + code).push({ amount: total, note: '[' + NAME + '] ' + (me.name || '') + ' 사원의 탐사 몫 (' + where + ') +' + total.toLocaleString() + ' P', at: now() }); } catch (e) { }
            });
            log_(me, '[' + NAME + '] 여우 신도의 몫 — ' + Object.keys(by).map(function (c) { return by[c]; }).join(', ') + ' 사원에게도 ' + total.toLocaleString() + ' P 가 갔습니다.');
            save({ history: 1 });
            quoteLines(Object.assign({}, keepDs, spreadDs(me))).forEach(function (l) { lines.push(l); });
        }
        if (lines.length) receipt(lines);
    } catch (e) { console.warn('[여우 신도] 정산', e); }
    return out;
}
// 정산서에 줄을 단다 — 어둠 「[탐사 정산서]」 · EPIC · 피날레 「[정산]」 (못 찾으면 알림으로)
function receipt(lines) {
    const html = '<div class="foxd-receipt" style="margin-top:8px; padding-top:8px; border-top:1px dashed #6a3a30; color:#f0c987; font-size:11px; line-height:1.8;">'
        + lines.map(esc).join('<br>') + '</div>';
    const put = function () {
        const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
        if (!body) return false;
        if (body.querySelector('.foxd-receipt')) return true;
        const head = Array.prototype.filter.call(body.querySelectorAll('div'), function (el) {
            const t = (el.textContent || '').trim();
            return (t === '[탐사 정산서]' || t === '[정산]') && el.children.length === 0;
        })[0];
        if (!head || !head.parentElement) return false;
        head.parentElement.insertAdjacentHTML('beforeend', html);
        return true;
    };
    if (put()) return;
    setTimeout(function () { if (!put()) alert_(lines.join('\n')); }, 300);
}
hook('renderDarkResult', function (_r) {
    return function () {
        const r = run();
        return settleWrap(r && r.zone === 'Qtrew-S-018' ? '피날레' : '어둠', _r, this, arguments, !r || r._dead || r._settled);
    };
});
hook('epicSettle', function (_s) {
    return function (how) {
        return settleWrap('EPIC', _s, this, arguments, (typeof er === 'undefined' || !er || er._settled));
    };
});

// ==========================================
// 방 — 어디든지 (인원수 · 구역이 차 있어도)
// ==========================================
let bypass = false;
function partyNow() { try { return (typeof getMyParty === 'function') ? getMyParty() : null; } catch (e) { return null; } }
function anyFree(p) {
    if (!p || !p.members) return null;
    const c = Object.keys(p.members).filter(function (x) { return freeOf(userOf(x)); })[0];
    return c || null;
}
hook('isZoneTaken', function (_z) {
    return function () { if (bypass) return false; return _z.apply(this, arguments); };
});
hook('createParty', function (_c) {
    return function () {
        const on = freeOf(u_());
        if (on) bypass = true;
        try { return _c.apply(this, arguments); } finally { bypass = false; }
    };
});
hook('launchParty', function (_l) {
    return function () {
        let z = null, min0 = null;
        try {
            const me = u_(), p = partyNow();
            if (me && p && p.leader === me.code && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone] && anyFree(p)) {
                z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; bypass = true;
            }
        } catch (e) { }
        try { return _l.apply(this, arguments); }
        finally { bypass = false; if (z && min0 != null) z.min = min0; }
    };
});
let roomDraw = null;
hook('buildChatHtml', function (_b) {
    return function () {
        const out = _b.apply(this, arguments);
        if (!roomDraw) return out;
        try {
            return '<div id="foxd-room-box" style="background:rgba(201,86,74,0.08); border:1px solid #8a4a3a; border-radius:6px; padding:10px 11px; margin:12px 0; font-size:11px; color:#f0c987; line-height:1.7;">'
                + '🎐 ' + esc(roomDraw.who) + ' — 어디든지 갈 수 있습니다.'
                + '<div style="font-size:9.5px; color:#a08a70;">' + (roomDraw.min0 > 1 ? '최소 인원 ' + roomDraw.min0 + '인 → 1인 · ' : '') + '인원수에 구애받지 않습니다 (보상 · 난이도는 사람 수로 셉니다).</div></div>' + out;
        } catch (e) { return out; }
    };
});
hook('renderPartyRoom', function (_r) {
    return function (p) {
        let z = null, min0 = null;
        const prev = roomDraw;
        try {
            const c = anyFree(p);
            if (c && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1;
                const u = userOf(c), w = withOf(u, 'd2');
                roomDraw = { min0: min0, who: (w ? dName(w.owner, 'd2') + '가 ' + (u.name || '') + ' 사원과 동행합니다' : (u.name || '') + ' 사원 — 홀로 어둠 탐사의 역병') };
            }
        } catch (e) { }
        try { return _r.apply(this, arguments); }
        finally { roomDraw = prev; if (z && min0 != null) z.min = min0; }
    };
});
// 구역 목록 — 차 있는 구역(⛔)에도 모집 단추를 연다
hook('renderDarkness', function (_d) {
    return function () {
        const out = _d.apply(this, arguments);
        try {
            if (!freeOf(u_())) return out;
            const body = document.getElementById('darkness-body');
            if (!body) return out;
            Array.prototype.forEach.call(body.querySelectorAll('div'), function (dv) {
                const f = (dv.style && dv.style.fontFamily) || '';
                if (f.indexOf('monospace') < 0) return;
                const code = String(dv.textContent || '').trim();
                if (typeof DARK_ZONES === 'undefined' || !DARK_ZONES[code]) return;
                const left = dv.parentElement, row = left && left.parentElement, right = row && row.lastElementChild;
                if (!right || right === left) return;
                const z = DARK_ZONES[code];
                if (!z || !(z.max > 1)) return;
                if (String(right.textContent || '').indexOf('⛔') < 0) return;
                try { if (typeof isZoneOpen === 'function' && !isZoneOpen(code)) return; } catch (e) { }
                right.innerHTML = '<button class="game-btn" style="margin:0; padding:8px 12px; font-size:11px; background:linear-gradient(145deg,#8a3a2e,#3d1a14) !important; border-color:#e0907a !important;" onclick="createParty(\'' + esc(code) + '\')">🎐 파티<br>모집</button>';
            });
        } catch (e) { }
        return out;
    };
});

// ==========================================
// 물품 등록 · 장착 · 장터에서 빼기
// ==========================================
// 황룡의 눈 · 산군의 도움이 빼앗지 못한다 (newitems2.js 가 이 표를 본다) · 복사기 NO_COPY 에도 들어 있다
window.NO_STEAL_GEAR = (window.NO_STEAL_GEAR || []).concat([NAME]);
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = {
                price: 0, usable: true, targetable: false, effect: 'equip_foxd', noSell: true,
                desc: '[장착] 두 여우 신도가 아홉여우병을 퍼트린다. 제 一 신도 — 판정 · 행운 · 기믹 파훼 · 회피 · 즉사 무효. '
                    + '제 二 신도 — 상담실 · 선녀탕 구출 · 홀로 어둠 탐사 · 포인트 배수 · 행운 배수. 역병은 한 시간, 본인에게는 하루 한 번. '
                    + '신도를 사람 곁에 동행시킬 수도 있다. 장착칸의 [🎐 여우 신도] 로 부른다. 상담사 지급 전용.'
            };
        }
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () {
    try { if (typeof ALIEN_ITEMS_POOL !== 'undefined') { const i = ALIEN_ITEMS_POOL.indexOf(NAME); if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1); } } catch (e) { }
}, 5000);
hook('marketSellable', function (_m) {
    return function () {
        const pool = _m.apply(this, arguments);
        if (pool && typeof pool.delete === 'function') { pool.delete(NAME); return pool; }
        return Array.isArray(pool) ? pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; }) : pool;
    };
});
hook('useInventoryItem', function (_u) {
    return function (itemName) {
        if (itemName !== NAME) return _u.apply(this, arguments);
        const me = u_();
        if (!me) return;
        if ((me.inventory || []).indexOf(NAME) < 0) { alert_('가지고 있지 않습니다.'); return; }
        if (typeof isQuarantined === 'function' && isQuarantined(me)) { alert_('격리 중에는 장착할 수 없습니다.'); return; }
        if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
        if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
        if (typeof equipFull === 'function' && equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
        me.equippedWeapons.push(NAME);
        try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
        try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
        cult(me);
        try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(me, '[장착됨] ' + NAME); } catch (e) { }
        log_(me, '[' + NAME + '] 장착했습니다.');
        try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_(NAME + '\n\n풍경이 한 번 울린다. 두 신도가 고개를 숙인다.\n'
            + '제 一 신도 — 판정 · 행운 · 기믹 파훼 · 회피 · 즉사 무효\n'
            + '제 二 신도 — 상담실 · 선녀탕 구출 · 홀로 어둠 탐사 · 포인트 배수 · 행운 배수\n\n'
            + '장착칸의 [🎐 여우 신도] 로 부립니다.');
    };
});

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const MID = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:center;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const RED = ' background:linear-gradient(145deg,#7a2e26,#3a1410) !important; border-color:#e0907a !important; color:#fff !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:46dvh; margin-bottom:9px;';
function shut() { Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); }); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    // 탐사 화면(9999998) 위 · 알림창(99999999) 아래
    w.style.cssText = 'position:fixed; inset:0; z-index:99999990; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:16px; box-sizing:border-box;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#1f1412,#0d0807); border:1px solid #c9564a; border-radius:12px; padding:14px; width:100%; max-width:420px; max-height:calc(100dvh - 32px); overflow-y:auto; -webkit-overflow-scrolling:touch; box-sizing:border-box; box-shadow:0 8px 30px rgba(0,0,0,0.7);">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#f0c987; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#a08a70; margin:4px 0 11px 0; line-height:1.7;">' + sub + '</div>' : '<div style="height:9px;"></div>');
}
function on(w, sel, fn) { const el = w.querySelector(sel); if (el) el.onclick = fn; }

window.foxdMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 을(를) 차고 있어야 합니다.'); return; }
    cult(me);
    const card = function (d) {
        const c = cult(me)[d];
        const to = c.to;
        const state = to ? '<span style="color:#9fe6b0;">' + (to === me.code ? '당신과' : esc(nameOf(to)) + ' 사원과') + ' 동행 중</span>' : '<span style="color:#a08a70;">곁에서 쉬는 중</span>';
        const kinds = PL.filter(function (x) { return x.d === d; }).map(function (x) { return x.n; }).join(' · ');
        return '<div style="border:1px solid #5a2e26; border-radius:8px; padding:10px 11px; margin-bottom:9px; background:rgba(120,40,30,0.10);">'
            + '<div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px;"><span style="font-size:12.5px; color:#f0c987;">🦊 ' + esc(dName(me, d)) + '</span><span style="font-size:9.5px;">' + state + '</span></div>'
            + '<div style="font-size:9.5px; color:#8a7560; margin:4px 0 8px;">역병 — ' + kinds + '</div>'
            + '<div style="display:flex; gap:6px;">'
            + '<button class="game-btn fd-sp" data-d="' + d + '" style="flex:1; margin:0; padding:9px 4px; font-size:11px;' + (to ? GREY : RED) + '">' + (to ? '동행 중 — 못 뿌림' : '역병을 뿌린다') + '</button>'
            + '<button class="game-btn fd-wi" data-d="' + d + '" style="flex:1; margin:0; padding:9px 4px; font-size:11px;">' + (to ? '동행 — 바꾼다' : '동행시킨다') + '</button>'
            + '<button class="game-btn fd-nk" data-d="' + d + '" style="flex:0 0 auto; margin:0; padding:9px 10px; font-size:11px;">이름</button></div></div>';
    };
    const mine = infected();
    const w = box(head(NAME, '두 신도가 아홉여우병을 퍼트립니다. 남에게는 몇 번이든 · 수치도 마음대로, 본인에게는 하루 딱 한 번 한 가지. 역병은 한 시간.<br>역병에 걸린 사람 · 신도가 동행하는 사람이 탐사에서 얻은 포인트 · 경험치는 당신에게도 똑같이 들어옵니다.')
        + card('d1') + card('d2')
        + '<div style="font-size:10.5px; color:#bbb; line-height:1.8; padding:8px 10px; border:1px solid #3a2420; border-radius:6px; margin-bottom:9px;">'
        + '본인에게 오늘 남은 역병 <b style="color:#f0c987;">' + (selfUsed(me) ? 0 : 1) + ' / 1</b><br>'
        + '지금 내 역병이 걸린 사원 <b style="color:#f0c987;">' + mine.length + '</b>명'
        + (mine.length ? '<div style="font-size:9.5px; color:#a08a70; margin-top:3px;">' + mine.slice(0, 12).map(function (x) { return esc(x.name) + ' (' + x.what.join(' · ') + ' · ' + span(x.left) + ')'; }).join('<br>') + '</div>' : '')
        + '</div>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">닫는다</button>');
    on(w, '#fd-x', shut);
    Array.prototype.forEach.call(w.querySelectorAll('.fd-sp'), function (b) { b.onclick = function () { kindPick(b.dataset.d); }; });
    Array.prototype.forEach.call(w.querySelectorAll('.fd-wi'), function (b) { b.onclick = function () { withMenu(b.dataset.d); }; });
    Array.prototype.forEach.call(w.querySelectorAll('.fd-nk'), function (b) { b.onclick = function () { nickAsk(b.dataset.d); }; });
};
// 내 역병이 걸린 사원
function infected() {
    const me = u_(), out = [];
    if (!me) return out;
    users().concat([me]).forEach(function (u) {
        if (out.some(function (x) { return x.code === u.code; })) return;
        const ks = plLive(u).filter(function (k) { return plOf(u, k).by === me.code; });
        if (!ks.length) return;
        out.push({ code: u.code, name: u.code === me.code ? '본인' : u.name, what: ks.map(function (k) { return valTxt(k, plOf(u, k).v, plOf(u, k)); }),
            left: Math.max.apply(null, ks.map(function (k) { return plOf(u, k).until - now(); })) });
    });
    return out;
}

function nickAsk(d) {
    const me = u_(), c = cult(me)[d];
    const w = box(head(D_NAME[d] + '의 이름', C.NICK_MAX + '자까지. 비우면 이름을 지웁니다.<br>특이사항에는 「' + D_NAME[d] + '(이름)」 으로 적힙니다.')
        + '<input id="fd-in" type="text" maxlength="' + C.NICK_MAX + '" value="' + esc(c.nick || '') + '" placeholder="' + esc(D_NAME[d]) + '" style="width:100%; padding:10px; font-size:13px; margin-bottom:9px; box-sizing:border-box;">'
        + '<button id="fd-ok" class="game-btn" style="' + MID + '">짓는다</button>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">그만둔다</button>');
    const f = w.querySelector('#fd-in');
    const go = function () {
        const v = String(f.value || '').trim().replace(/[|<>]/g, '').slice(0, C.NICK_MAX);
        c.nick = v || null;
        if (!c.nick) delete c.nick;
        save({ foxCult: 1 });
        if (c.to) retune(d, c.s || {});            // 곁의 사람 특이사항 줄도 새 이름으로
        toast('🎐 ' + dName(me, d));
        window.foxdMenu();
    };
    on(w, '#fd-ok', go);
    on(w, '#fd-x', window.foxdMenu);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}

// --- 역병을 뿌린다 — 무엇을 ---
function kindPick(d) {
    const me = u_();
    if (busy(me, d)) { alert_(dName(me, d) + '는 지금 ' + withWhom(me, d) + ' 동행 중입니다.\n\n동행 중인 신도의 역병은 뿌리게 명하지 못합니다. 먼저 거둬 오십시오.'); return; }
    const rows = PL.filter(function (x) { return x.d === d; }).map(function (x) {
        const range = x.vals ? ' <span style="font-size:9.5px; color:#a08a70;">' + (x.k === 'luckx' ? x.vals[0] + '~' + x.vals[x.vals.length - 1] + '%' : x.vals[0] + '~' + x.vals[x.vals.length - 1]) + '</span>' : '';
        return '<button class="game-btn fd-k" data-k="' + x.k + '" style="' + BTN + '">' + esc(x.n) + range
            + '<div style="font-size:9px; color:#8a7560; margin-top:3px; white-space:normal;">' + esc(x.desc) + '</div></button>';
    }).join('');
    const w = box(head('🦊 ' + dName(me, d) + ' — 어떤 역병을', '한 시간 동안 걸립니다. 같은 역병을 다시 뿌리면 새 수치로 바뀝니다.')
        + rows + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    on(w, '#fd-x', window.foxdMenu);
    Array.prototype.forEach.call(w.querySelectorAll('.fd-k'), function (b) { b.onclick = function () { whoPick(d, b.dataset.k); }; });
}
// --- 누구에게 ---
function whoPick(d, k) {
    const me = u_();
    const rescue = (k === 'rescue');
    let list = users().filter(function (x) { return x.code !== me.code; });
    if (rescue) list = list.filter(inQ);
    const used = selfUsed(me), selfOk = !used && (!rescue || inQ(me));
    const rows = list.map(function (t) {
        const cur = plOf(t, k);
        const q = rescue ? ' <span style="font-size:9.5px; color:#a08a70;">' + (bathOf(t) ? '♨ 선녀탕' : '🦊 상담실') + ' · ' + span(t.quarantineUntil - now()) + ' 남음</span>' : '';
        return '<button class="game-btn fd-who" data-c="' + esc(t.code) + '" style="' + BTN + '">' + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>' + q
            + (cur ? '<div style="font-size:9px; color:#e0907a; margin-top:2px;">이미 걸림 — ' + esc(valTxt(k, cur.v, cur)) + ' (' + span(cur.until - now()) + ') · 다시 뿌리면 바뀝니다</div>' : '') + '</button>';
    }).join('');
    const selfRow = '<button class="game-btn" id="fd-me" style="' + BTN + (selfOk ? ' border-color:#5fae7a !important;' : GREY) + '"' + (selfOk ? '' : ' disabled') + '>🎐 본인'
        + '<div style="font-size:9px; margin-top:2px; color:' + (selfOk ? '#9fe6b0' : '#888') + ';">' + (used ? '오늘은 이미 썼습니다 (하루 한 번 · 한 가지)' : rescue && !inQ(me) ? '지금 상담실 · 선녀탕에 있지 않습니다' : '하루 딱 한 번 · 한 가지') + '</div></button>';
    const w = box(head('🦊 ' + PL_BY[k].n + ' — 누구에게', rescue ? '지금 상담실 · 선녀탕에 있는 사원만 보입니다. 횟수 제한은 없습니다.' : '남에게는 몇 번이든 뿌릴 수 있습니다.')
        + selfRow + '<div style="' + SCROLL + '">' + (rows || '<div style="font-size:11px; color:#8a7560; padding:8px 2px;">' + (rescue ? '지금 갇힌 사원이 없습니다.' : '사원이 없습니다.') + '</div>') + '</div>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    on(w, '#fd-x', function () { kindPick(d); });
    if (selfOk) on(w, '#fd-me', function () { valPick(d, k, me.code); });
    Array.prototype.forEach.call(w.querySelectorAll('.fd-who'), function (b) { b.onclick = function () { valPick(d, k, b.dataset.c); }; });
}
// --- 수치 ---
function slider(id, vals, cur, unit, zero) {
    const list = zero ? [0].concat(vals) : vals.slice();
    let i = list.indexOf(cur); if (i < 0) i = zero ? 0 : 0;
    return { html: '<div style="display:flex; align-items:center; gap:9px;"><input id="' + id + '" type="range" min="0" max="' + (list.length - 1) + '" step="1" value="' + i + '" style="flex:1;">'
        + '<b id="' + id + '-v" style="min-width:58px; text-align:right; color:#f0c987; font-size:13px;"></b></div>', list: list, unit: unit || '' };
}
function bindSlider(w, id, s, fmt) {
    const el = w.querySelector('#' + id), out = w.querySelector('#' + id + '-v');
    const paint = function () { const v = s.list[Number(el.value) || 0]; out.textContent = fmt(v); };
    el.addEventListener('input', paint); paint();
    return function () { return s.list[Number(el.value) || 0]; };
}
function fmtOf(k) {
    return function (v) {
        if (!v) return '안 줌';
        if (k === 'pts') return '×' + v;
        if (k === 'luckx') return v + '%';
        return String(v);
    };
}
function valPick(d, k, code) {
    const me = u_(), t = userOf(code), P = PL_BY[k];
    if (!t) return;
    const who = code === me.code ? '본인' : t.name + ' 사원';
    const done = function (res) {
        if (!res) return;
        shut();
        let msg = '🎐 ' + dName(me, d) + '가 ' + (res.self ? '당신' : t.name + ' 사원') + '에게 역병을 뿌렸습니다.\n\n' + res.say + ' — 한 시간';
        if (res.call && res.self) {
            msg = res.call.k === 'out' ? '🎐 ' + dName(me, 'd2') + '가 당신을 부릅니다.\n\n' + (bathOf(t) ? '선녀탕' : '상담실') + ' 문이 열립니다.'
                : '🎐 여우의 역병이 당신의 시간을 잡아먹습니다. - ' + span(res.call.ms) + '\n\n남은 시간 ' + span(res.call.until - now());
        } else if (res.call) msg += '\n\n' + (res.call.k === 'out' ? (bathOf(t) ? '선녀탕' : '상담실') + ' 문이 열립니다.' : span(res.call.ms) + '을 잡아먹었습니다. 남은 시간 ' + span(res.call.until - now()));
        if (res.self) msg += '\n\n(본인 몫 — 오늘은 더 쓸 수 없습니다)';
        else msg += '\n\n그 사원이 탐사에서 얻는 포인트 · 경험치가 당신에게도 똑같이 들어옵니다.';
        alert_(msg);
    };
    if (k === 'solo') {
        const w = box(head('🦊 홀로 어둠 탐사 — ' + who, '한 시간 동안 인원수에 구애받지 않고 어디든 들어갑니다. 구역이 차 있어도 방을 만들 수 있습니다.')
            + '<button id="fd-ok" class="game-btn" style="' + MID + RED + '">역병을 뿌린다</button>'
            + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
        on(w, '#fd-ok', function () { done(spread(d, k, code, 1)); });
        on(w, '#fd-x', function () { whoPick(d, k); });
        return;
    }
    if (k === 'rescue') {
        const left = Math.max(0, (Number(t.quarantineUntil) || 0) - now());
        const b = function (v, label) { return '<button class="game-btn fd-r" data-v="' + v + '" style="' + MID + (v === 0 ? RED : '') + '">' + label + '</button>'; };
        const w = box(head('🦊 ' + (bathOf(t) ? '선녀탕' : '상담실') + ' — ' + who, '남은 시간 ' + span(left) + '. 바로 꺼내거나 시간을 줄입니다.')
            + b(0, '바로 꺼낸다 — 「제 二 신도가 당신을 부릅니다.」') + b(1, '1시간을 잡아먹는다') + b(2, '2시간을 잡아먹는다') + b(3, '3시간을 잡아먹는다')
            + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
        Array.prototype.forEach.call(w.querySelectorAll('.fd-r'), function (x) { x.onclick = function () { done(spread(d, k, code, Number(x.dataset.v))); }; });
        on(w, '#fd-x', function () { whoPick(d, k); });
        return;
    }
    const cur = plOf(t, k);
    const s = slider('fd-v', P.vals, cur ? Number(cur.v) : P.vals[Math.min(P.vals.length - 1, k === 'luckx' ? 8 : 4)], '', false);
    const w = box(head('🦊 ' + P.n + ' — ' + who, esc(P.desc) + '<br>한 시간 동안 걸립니다.')
        + '<div style="padding:12px 4px 14px;">' + s.html + '</div>'
        + '<button id="fd-ok" class="game-btn" style="' + MID + RED + '">역병을 뿌린다</button>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    const get = bindSlider(w, 'fd-v', s, fmtOf(k));
    on(w, '#fd-ok', function () { done(spread(d, k, code, get())); });
    on(w, '#fd-x', function () { whoPick(d, k); });
}

// --- 동행 ---
function withMenu(d) {
    const me = u_(), c = cult(me)[d];
    if (!c.to) { withWho(d); return; }
    const s = c.s || {};
    const parts = WITH_KEYS[d].filter(function (k) { return Number(s[k]) > 0; }).map(function (k) { return k === 'rescue' ? '구출' : PL_BY[k].n + ' ' + fmtOf(k)(s[k]); });
    const w = box(head('🦊 ' + dName(me, d) + ' — 동행 중', (c.to === me.code ? '당신' : esc(nameOf(c.to)) + ' 사원') + ' 곁에 있습니다.<br>'
            + (d === 'd2' ? '어디든지 갈 수 있습니다 · ' : '') + (parts.length ? esc(parts.join(' · ')) : '능력치 없음') + '<br>쓰러지면 탐사마다 한 번 되살립니다.')
        + '<button id="fd-tune" class="game-btn" style="' + MID + '">능력치를 바꾼다</button>'
        + '<button id="fd-move" class="game-btn" style="' + MID + '">다른 사람 곁으로 보낸다</button>'
        + '<button id="fd-back" class="game-btn" style="' + MID + RED + '">거둬 온다</button>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    on(w, '#fd-tune', function () { withTune(d, c.to); });
    on(w, '#fd-move', function () { withWho(d); });
    on(w, '#fd-back', function () {
        const was = c.to;
        recall(d);
        shut();
        alert_('🎐 ' + dName(me, d) + '를 ' + (was === me.code ? '곁에서' : nameOf(was) + ' 사원 곁에서') + ' 거둬 왔습니다.\n\n이제 다시 역병을 뿌리게 명할 수 있습니다.');
    });
    on(w, '#fd-x', window.foxdMenu);
}
function withWho(d) {
    const me = u_(), c = cult(me)[d];
    const rows = users().filter(function (x) { return x.code !== me.code; }).map(function (t) {
        const other = withOf(t, d);
        const here = c.to === t.code;
        const taken = !here && other && other.by !== me.code;
        return '<button class="game-btn fd-ww" data-c="' + esc(t.code) + '"' + (here ? ' disabled' : '') + ' style="' + BTN + (here ? GREY : '') + '">' + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (here ? '<div style="font-size:9px; color:#9fe6b0; margin-top:2px;">지금 이 사원과 동행 중</div>' : taken ? '<div style="font-size:9px; color:#a08a70; margin-top:2px;">다른 사원의 ' + D_NAME[d] + '가 곁에 있습니다 — 바꿔 붙습니다</div>' : '') + '</button>';
    }).join('');
    const w = box(head('🦊 ' + dName(me, d) + ' — 누구와 동행', '보낼 때 신도가 지닐 능력치를 정합니다. 동행하는 동안 이 신도의 역병은 뿌리지 못합니다.<br>동행하는 사람이 탐사에서 얻은 포인트 · 경험치는 당신에게도 똑같이 들어옵니다.')
        + '<button class="game-btn" id="fd-me" style="' + BTN + ' border-color:#5fae7a !important;"' + (c.to === me.code ? ' disabled' : '') + '>🎐 본인 — 내 곁에서 어둠까지 함께' + (c.to === me.code ? '<div style="font-size:9px; color:#9fe6b0; margin-top:2px;">지금 동행 중</div>' : '') + '</button>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    on(w, '#fd-me', function () { withTune(d, me.code); });
    Array.prototype.forEach.call(w.querySelectorAll('.fd-ww'), function (b) { b.onclick = function () { withTune(d, b.dataset.c); }; });
    on(w, '#fd-x', function () { withMenu(d); });
}
function withTune(d, code) {
    const me = u_(), c = cult(me)[d], t = userOf(code);
    if (!t) return;
    const prev = c.s || {};
    const sl = {};
    let rows = '';
    WITH_KEYS[d].forEach(function (k) {
        if (k === 'rescue') {
            rows += '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px; border:1px solid #3a2420; border-radius:7px; margin-bottom:8px;">'
                + '<input type="checkbox" id="fd-rs"' + (prev.rescue ? ' checked' : '') + ' style="width:17px; height:17px;">'
                + '<div style="font-size:11.5px; color:#e8d7b4;">구출 <span style="font-size:9.5px; color:#a08a70;">— 쓰러져 상담실 · 선녀탕으로 가게 되면 바로 불러낸다</span></div></label>';
            return;
        }
        const P = PL_BY[k];
        sl[k] = slider('fd-s-' + k, P.vals, Number(prev[k]) || 0, '', true);
        rows += '<div style="margin-bottom:9px;"><div style="font-size:11px; color:#e8d7b4; margin-bottom:2px;">' + esc(P.n)
            + ' <span style="font-size:9px; color:#8a7560;">' + esc(withDesc(k)) + '</span></div>' + sl[k].html + '</div>';
    });
    const w = box(head('🦊 ' + dName(me, d) + ' → ' + (code === me.code ? '본인' : t.name + ' 사원'), (d === 'd2' ? '어디든지 갈 수 있습니다 (인원수 · 구역이 차 있어도). ' : '') + '0 은 안 줍니다. 쓰러지면 탐사마다 한 번 되살립니다.')
        + rows
        + '<button id="fd-ok" class="game-btn" style="' + MID + RED + '">' + (c.to === code ? '능력치를 바꾼다' : '동행시킨다') + '</button>'
        + '<button id="fd-x" class="game-btn" style="' + MID + GREY + '">돌아간다</button>');
    const get = {};
    Object.keys(sl).forEach(function (k) { get[k] = bindSlider(w, 'fd-s-' + k, sl[k], fmtOf(k)); });
    on(w, '#fd-ok', function () {
        const s = {};
        Object.keys(get).forEach(function (k) { s[k] = get[k](); });
        if (d === 'd2') { const cb = w.querySelector('#fd-rs'); s.rescue = (cb && cb.checked) ? 1 : 0; }
        const line = sendWith(d, code, s);
        shut();
        if (line) alert_('🎐 ' + dName(me, d) + '가 ' + (code === me.code ? '당신' : t.name + ' 사원') + '과 동행합니다.\n\n' + line.replace(/^🎐 /, '')
            + (d === 'd2' && s.rescue ? '\n구출 — 쓰러져 상담실 · 선녀탕으로 가게 되면 바로 불러냅니다.' : '') + '\n\n동행하는 동안 이 신도의 역병은 뿌리지 못합니다.' + (code === me.code ? '' : '\n그 사원이 탐사에서 얻는 포인트 · 경험치가 당신에게도 똑같이 들어옵니다.'));
    });
    on(w, '#fd-x', function () { c.to ? withMenu(d) : withWho(d); });
}
function withDesc(k) {
    return { judge: '굴림 +', luck: '눈이 9 이하면 뒤집는다 · 탐사당 수치만큼', gim: '기믹 파훼 +', evade: '회피 + · 7 이상이면 피할 길을 알려 준다',
             nodeath: '즉사할 때 들쳐 메고 나온다 · 탐사당', pts: '정산 포인트', luckx: '회수품 · 공용시설 행운' }[k] || '';
}

// ==========================================
// 단추 — 장착칸 · 탐사 화면 · 격리 중(본인 구출)
// ==========================================
(function buttons() {
    const ID = 'foxd-list-btn';
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.getElementById(ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;' + RED;
        b.textContent = '🎐 여우 신도';
        b.onclick = window.foxdMenu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._foxdBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            const w = function () { const r = _r.apply(this, arguments); try { stick(); } catch (e) { } return r; };
            Object.keys(_r).forEach(function (k) { if (!(k in w)) { try { w[k] = _r[k]; } catch (e) { } } });
            w._foxdBtn = true;
            renderInventory = w; window.renderInventory = w;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
    // 탐사 화면 위쪽 🎐
    setInterval(function () {
        try {
            const ov = document.getElementById('dark-run-overlay');
            const old = document.getElementById('foxd-run-btn');
            if (!ov || ov.style.display === 'none' || !wears(u_())) { if (old) old.remove(); return; }
            if (old) return;
            const mute = document.getElementById('dark-mute-btn');
            if (!mute) return;
            const b = document.createElement('button');
            b.id = 'foxd-run-btn';
            b.style.cssText = 'background:none; border:1px solid #6a3a30; color:#f0c987; font-size:12px; padding:4px 8px; border-radius:4px; cursor:pointer;';
            b.innerText = '🎐';
            b.onclick = window.foxdMenu;
            mute.parentNode.insertBefore(b, mute);
        } catch (e) { }
    }, 1300);
    // 격리 중 — 장착자 본인 구출 (하루 한 번 몫)
    setInterval(function () {
        try {
            const me = u_(), old = document.getElementById('foxd-out-btn');
            const can = !!(me && wears(me) && inQ(me) && !selfUsed(me) && !busy(me, 'd2'));
            if (!can) { if (old) old.remove(); return; }
            if (old) return;
            const b = document.createElement('button');
            b.id = 'foxd-out-btn'; b.className = 'game-btn';
            b.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:132px; z-index:99998; padding:11px 18px; font-size:12px; border-radius:22px; box-shadow:0 4px 14px rgba(0,0,0,0.5);' + RED;
            b.textContent = '🎐 ' + dName(me, 'd2') + '를 부른다';
            b.onclick = function () { valPick('d2', 'rescue', me.code); };
            document.body.appendChild(b);
        } catch (e) { }
    }, 2000);
})();

// ==========================================
// 콘솔
// ==========================================
window.foxdGive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' 지급');
    try { updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' 을(를) 줬습니다.', 'color:#e0907a');
};
window.foxdState = function (who) {
    const t = find(who) || u_();
    if (!t) return;
    console.log('%c===== 🎐 여우 신도 — ' + t.name + ' =====', 'color:#e0907a');
    console.log('  차고 있음:', wears(t) ? 'O' : '✗', '· 오늘 본인 몫', selfUsed(t) ? '씀' : '남음', '· 어디든지', freeOf(t) ? 'O' : '✗');
    if (wears(t)) DS.forEach(function (d) { const c = cult(t)[d]; console.log('  ' + dName(t, d) + ' — ' + (c.to ? nameOf(c.to) + ' 곁 ' + JSON.stringify(c.s) : '쉬는 중')); });
    const pl = plLive(t);
    if (pl.length) console.table(pl.map(function (k) { const p = plOf(t, k); return { 역병: valTxt(k, p.v, p), 뿌린이: p.byName, 남은: span(p.until - now()), 즉사무효: p.left == null ? '' : p.left }; }));
    DS.forEach(function (d) { const w = withOf(t, d); if (w) console.log('  곁의 ' + dName(w.owner, d) + ' — ' + JSON.stringify(w.s)); });
    const r = run(); if (r && r._foxd) console.log('  이번 탐사', JSON.stringify(r._foxd));
};
window.foxdHelp = function () {
    console.log('%c🎐 ' + NAME, 'color:#e0907a; font-size:13px');
    PL.forEach(function (x) { console.log('  ' + D_NAME[x.d] + ' · ' + x.n + ' — ' + x.desc); });
    console.log('  foxdGive(사번) · foxdState(사번)');
};

console.log('[여우 신도] ' + NAME + ' 연결 — 상담사 지급 전용');
})();
