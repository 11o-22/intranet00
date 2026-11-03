// ==========================================
// ★ 🕵️ 행맨 — 어몽어스처럼 (2026-11-03 사용자)
// bundles.json 마지막 묶음 — plaza.js · hideseek.js 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//
//   · 5 ~ 9명 (2026-11-03 사용자 · 처음엔 3 ~ 7). 대기실은 광장 — 목록 「생활」 🕵️ 행맨 로 접속한 사람을 불러 모은다.
//   · 맵은 포토존 일곱 곳을 이어 붙인 것 (사용자가 그린 지도 그대로)
//
//         [헝그리 행맨] ─ [여우 상담실]
//               │               │
//         [  중  앙  ]     [플라워 골든 리조트]
//               │               │
//   [룩키마트] ─ [핼러윈] ─ [브라운의 심야 토크쇼]
//
//     좌우는 방 끝으로 걸어 넘어가고, 위아래는 방 안의 문(⬆ · ⬇)으로 넘어간다.
//     놀이 동안 「기본」 포토존의 이름은 「중앙」 — 긴급 회의 단추가 거기 있다.
//   · 범인 — 5~6명이면 1명 · 7~9명이면 2명. 범인끼리는 서로 안다.
//   · 미션 — 맵마다 3개 (모두 21). 시민이 살아서 끝낸 것만 센다 (유령 · 범인도 할 수는 있지만 안 센다).
//     숫자 순서대로 누르기 · 카드 정렬 · 박스 크기대로 놓기 · 같은 색 선 잇기 · 내려오는 사과 3번 받기
//     · 불빛 순서 기억 · 레버 꾹 누르기 · 같은 그림 짝 · 다이얼 맞추기 · 쓰레기 줍기 · 스위치 켜기 · 스캔
//   · 처치 — 범인이 산 사람(보통 크기)에게 🪩 를 날린다. 맞으면 죽는다. 한 사람분 거리 안 · 시작하고 20초 뒤부터 · 한 번 처치하면 20초 쉰다.
//     맞는 자리에 처치 자국(plaza/mf-slash.png · 사용자 그림 세 칸)이 번지고 「슉 — 팍」 소리.
//   · 시체 — 파인애플 크기로 눕고 눈을 감는다. 산 사람이 누르면 회의가 열린다.
//   · 유령 — 죽으면(쫓겨나도) 파인애플 크기 · 회색 · 두 배 빠르게 다닌다. 산 사람에게는 안 보인다. 유령끼리는 보인다.
//   · 산 사람은 시야가 좁다 (둘레만 보이고 바깥은 어둡다). 유령은 다 보인다.
//   · 회의 — 각자 얼굴이 뜬 방에서 채팅으로 이야기하고 범인을 투표한다. 유령은 보기만 한다.
//     많이 받은 한 사람이 쫓겨난다 (동률 · 건너뛰기가 더 많으면 아무도 안 나간다). 끝나면 모두 중앙에서 다시.
//     긴급 회의 — 중앙의 🚨 단추 · 한 사람이 한 판에 한 번.
//   · 승리 — 시민: 미션을 다 끝내거나 범인을 다 찾아내면 · 범인: 투표 직후 산 시민이 2명 이하면 (산 시민이 없어져도)
//   · 상품 — 이긴 편 모두에게 「안구」 1개 (소지품 「기타」 · 설명 ???)
//   · 놀이 중에는 광장 채팅을 막는다 (회의 때만 말한다) · 목록으로 옮겨 다니지 못한다 (걸어서만).
//
// ■ 서버 자리
//   mfGame/<판> = { id, host, hostName, at, st:'LOBBY'|'PLAY'|'END'|'CANCEL', inst,
//                   inv: { 사번: { n, st } }, mem: { 사번: { n } }, mafia: { 사번: 1 }, t0, seed,
//                   dead: { 사번: { at, by, r, x, y, kx, ky } }, out: { 사번: { at, n, quit } },
//                   done: { 미션: { by, at } }, emer: { 사번: 때 },
//                   meet: { n, on, kind:'body'|'emer', by, body, at, until, res:{ out, tally, skip }, end },
//                   votes: { 회의번호: { 사번: 사번|'skip' } }, chat: { 회의번호: { … { c, n, t, at } } },
//                   end: { at, win:'crew'|'mafia', why }, paid: { 사번: 때 } }
//   mfInv/<사번>/<판> = { from, fromName, at }
//   ★ 판정은 각자 화면이 한다 — 개발자 도구를 열면 누가 범인인지 볼 수 있다 (사용자에게 말씀드린 한계).
//
// ■ plaza.js 가 묻는 것 — window.PLAZA_MF (숨바꼭질 PLAZA_HS 와 같은 자리 · plaza.js HS())
//
// ■ 콘솔
//   mfState()

(function mafiaGame() {
'use strict';

const G = 'mfGame', INV = 'mfInv';
const MIN_P = 5, MAX_P = 9;
const TWO_AT = 7;                        // 이 인원부터 범인 둘
const LOBBY_TTL = 15 * 60000, INV_TTL = 3 * 60000;
const REVEAL_MS = 4000;                  // 처음 — 역할을 보여 주는 동안 (못 움직인다)
const KILL_COOL = 20000;                 // 처치 대기 — 시작하고 20초 뒤부터 · 한 번 처치하면 20초 (2026-11-03 사용자 · 처음엔 0.5초)
const MEET_MS = 100000;                  // 회의 — 이야기 + 투표 (모두 투표하면 바로 끝)
const RES_MS = 4500;                     // 회의 결과를 보여 주는 동안
const VISION = 300;                      // 산 사람의 시야 반지름 (방 그림 좌표)
const REACH = 150;                       // 미션 · 문 · 단추 · 시체에 손이 닿는 거리 (가로)
const GHOST_SPEED = 2;
const PRIZE = '안구';
const STALE = 3 * 3600000;               // 이만큼 묵은 판은 잇지 않는다

// 방 — 사용자가 그린 지도 (좌우는 방 끝 · 위아래는 문)
const MAP = {
    pz_hangman:   { n: '헝그리 행맨',          right: 'pz_fox',      down: 'pz_base' },
    pz_fox:       { n: '여우 상담실',          left: 'pz_hangman',   down: 'pz_flower' },
    pz_base:      { n: '중앙',                 up: 'pz_hangman',     down: 'pz_halloween', emer: 900 },
    pz_halloween: { n: '핼러윈',               up: 'pz_base',        left: 'pz_looky',     right: 'pz_brown' },
    pz_looky:     { n: '룩키마트',             right: 'pz_halloween' },
    pz_flower:    { n: '플라워 골든 리조트',    up: 'pz_fox',         down: 'pz_brown' },
    pz_brown:     { n: '브라운의 심야 토크쇼',  up: 'pz_flower',      left: 'pz_halloween' }
};
const ROOMS = Object.keys(MAP);
const START = 'pz_base';
const DOOR_UP = 420, DOOR_DN = 1180;
const MIS_X = { pz_base: [200, 610, 1400] };
const MIS_X0 = [200, 800, 1400];

// 미션 종류
const KINDS = [
    { k: 'num',    n: '숫자 순서대로 누르기', i: '🔢' },
    { k: 'card',   n: '카드 정렬',            i: '🃏' },
    { k: 'box',    n: '박스 크기대로 놓기',    i: '📦' },
    { k: 'wire',   n: '같은 색깔 선 잇기',     i: '🔌' },
    { k: 'apple',  n: '내려오는 사과 3번 받기', i: '🍎' },
    { k: 'simon',  n: '불빛 순서 기억하기',    i: '💡' },
    { k: 'hold',   n: '레버 꾹 누르기',        i: '🕹' },
    { k: 'pair',   n: '같은 그림 짝 맞추기',   i: '🎴' },
    { k: 'dial',   n: '다이얼 맞추기',         i: '🎚' },
    { k: 'trash',  n: '쓰레기 줍기',           i: '🗑' },
    { k: 'switch', n: '스위치 모두 켜기',      i: '💡' },
    { k: 'scan',   n: '몸 스캔하기',           i: '📡' }
];
KINDS[10].i = '🔘';

// ==========================================
// 잡동사니
// ==========================================
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function myCode() { const u = me(); return u ? u.code : ''; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function srv() { try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { } return Date.now(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); else console.log(m); } catch (e) { } }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function nameOf(c) { const g = game && game.mem && game.mem[c]; if (g && g.n) return g.n; const u = (me() && me().code === c) ? me() : users()[c]; return (u && ((u.badge && u.badge.nickname) || u.name)) || c; }
function rooms() { return (typeof PLAZA !== 'undefined' && PLAZA.ROOMS) ? PLAZA.ROOMS : {}; }
function roomNow() { try { return (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { return ''; } }
function online() { try { return (typeof onlineUsersMap !== 'undefined' && onlineUsersMap) ? onlineUsersMap : {}; } catch (e) { return {}; } }
function gidKey() { return 'mfGid_' + (myCode() || ''); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; }
function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = hash(seed) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r) { a = a.slice(); r = r || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function mmss(ms) { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function posOf(code) { try { return (typeof window.plazaPosOf === 'function') ? window.plazaPosOf(code) : null; } catch (e) { return null; } }
function closeOv(id) { const e = document.getElementById(id); if (e) e.remove(); }

// ⏰ 쉬는 시간 (rest-time.js — 2026-11-03 오후 7시 ~ 9시 · 인트라넷 전체를 덮고 로그아웃시킨다)
//   그 사이 하던 행맨 판은 취소(why:'rest')로 적고 걷는다 — 9시 뒤 다시 들어왔을 때 두 시간 묵은 판이 이어지지 않게. 상품은 없다.
//   알림은 rest-time.js 의 덮개가 띄우므로 여기서는 조용히.
const REST_MSG = '휴식을 취하실 시간입니다.';
function restNow() { try { return typeof window.restTimeOn === 'function' && !!window.restTimeOn(myCode()); } catch (e) { return false; } }
let restKicked = '';
function kickRest() {
    if (!game) return;
    const id = game.id, st = game.st, host = game.host === myCode(), inv = game.inv || {};
    if (restKicked === id) return;
    restKicked = id;
    gtx(function (cur) {
        if (cur.st !== 'PLAY' && cur.st !== 'LOBBY') return;
        cur.st = 'CANCEL'; cur.why = 'rest';
        if (cur.meet) cur.meet.on = false;
        return cur;
    });
    if (st === 'LOBBY' && host) {
        const d = db_(), up = {};
        Object.keys(inv).forEach(function (c) { up[INV + '/' + c + '/' + id] = null; });
        if (d) d.ref('/').update(up).catch(function () { });
    }
    if (mfOn) restLeaveLocal();
    hideLobby();
    unwatchGame();
}
function restLeaveLocal() {
    closeAll();
    setOn(false);
    loopOff();
    mapOff();
    try { if (typeof window.plazaReseat === 'function') window.plazaReseat(); } catch (e) { }
}

function busyWhy(u) {
    u = u || me();
    if (!u) return '로그인이 필요합니다.';
    try { if (typeof darkRun !== 'undefined' && darkRun) return '어둠 탐사 중에는 할 수 없습니다.'; } catch (e) { }
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) return '상담실 · 선녀탕에 있는 동안은 할 수 없습니다.'; } catch (e) { }
    try { if (typeof window.gaduriOf === 'function' && window.gaduriOf(u.code)) return '가두리에 갇혀 있는 동안은 할 수 없습니다.'; } catch (e) { }
    try { if (window.PLAZA_HS && window.PLAZA_HS.on && window.PLAZA_HS.on()) return '숨바꼭질 중에는 할 수 없습니다.'; } catch (e) { }
    return '';
}

// ==========================================
// 판 — 지금 내가 든 판을 듣는다
// ==========================================
let game = null, gid = '', gRef = null, gFn = null;
let mfOn = false;
function watchGame(id) {
    if (gid === id && gRef) return;
    unwatchGame();
    const d = db_(); if (!d || !id) return;
    gid = id;
    ls(gidKey(), id);
    gRef = d.ref(G + '/' + id);
    gFn = function (s) { game = s.val(); try { onGame(); } catch (e) { console.error('[행맨]', e); } };
    gRef.on('value', gFn);
}
function unwatchGame() {
    if (gRef && gFn) { try { gRef.off('value', gFn); } catch (e) { } }
    gRef = null; gFn = null; gid = ''; game = null;
    ls(gidKey(), null);
}
function mem() { return (game && game.mem) ? Object.keys(game.mem) : []; }
function isMem(c) { return !!(game && game.mem && game.mem[c || myCode()]); }
function isMafia(c) { return !!(game && game.mafia && game.mafia[c || myCode()]); }
function deadOf(c) { return (game && game.dead && game.dead[c]) || null; }
function outOf(c) { return (game && game.out && game.out[c]) || null; }
function alive(c) { return isMem(c) && !deadOf(c) && !outOf(c); }
function aliveList() { return mem().filter(alive); }
function crewAlive(g) { g = g || game; return Object.keys((g && g.mem) || {}).filter(function (c) { return !(g.mafia || {})[c] && !(g.dead || {})[c] && !(g.out || {})[c]; }); }
function mafiaAlive(g) { g = g || game; return Object.keys((g && g.mem) || {}).filter(function (c) { return (g.mafia || {})[c] && !(g.dead || {})[c] && !(g.out || {})[c]; }); }
function amGhost() { return isMem() && !alive(myCode()); }
function meetOn() { return !!(game && game.meet && game.meet.on); }
function lastMeetEnd() { return (game && game.meet && !game.meet.on && Number(game.meet.end)) || 0; }
function revealing() { return !!(game && game.t0 && srv() < game.t0 + REVEAL_MS); }
function playing() { return !!(game && game.st === 'PLAY'); }

// 미션 자리 — 판마다 같은 차림 (판 번호로 씨를 뿌린다)
let misCache = { id: '', list: [] };
function missions() {
    if (!game) return [];
    if (misCache.id === game.id) return misCache.list;
    const r = rng(game.id + ':mis');
    const list = [];
    ROOMS.forEach(function (room) {
        const ks = shuffle(KINDS, r).slice(0, 3);
        const xs = MIS_X[room] || MIS_X0;
        ks.forEach(function (k, i) { list.push({ id: room + '_' + i, room: room, x: xs[i], k: k.k, n: k.n, i: k.i }); });
    });
    misCache = { id: game.id, list: list };
    return list;
}
function doneOf(id) { return !!(game && game.done && game.done[id]); }
function doneN() { return missions().filter(function (m) { return doneOf(m.id); }).length; }

// ==========================================
// 방 — 놀이 동안만 포토존을 이어 붙인다 (내 화면에서만 · 끝나면 되돌린다)
// ==========================================
let saved = null;
function mapOn() {
    if (saved) return;
    const R = rooms();
    saved = {};
    ROOMS.forEach(function (k) {
        const r = R[k]; if (!r) return;
        saved[k] = { left: r.left, right: r.right, spots: r.spots, n: r.n };
        r.left = MAP[k].left || null;
        r.right = MAP[k].right || null;
        r.spots = [];                               // 「광장으로」 문은 놀이 동안 걷는다 · 문 · 미션 · 단추는 여기서 따로 그린다
        r.n = '🕵️ ' + MAP[k].n;
    });
}
function mapOff() {
    if (!saved) return;
    const R = rooms();
    Object.keys(saved).forEach(function (k) {
        const r = R[k]; if (!r) return;
        r.left = saved[k].left; r.right = saved[k].right; r.spots = saved[k].spots; r.n = saved[k].n;
        if (!r.left) delete r.left;
        if (!r.right) delete r.right;
    });
    saved = null;
}

// ==========================================
// plaza.js 가 묻는 것
// ==========================================
let misOpen = null;                      // 미션 창이 열려 있나
window.PLAZA_MF = {
    on: function () { return mfOn; },
    inst: function () { return (game && game.inst) || 0; },
    tiny: function () { return amGhost(); },                  // 산 사람은 보통 크기 (파인애플 물약이 걸려 있어도) · 유령은 작게
    speed: function () { return amGhost() ? GHOST_SPEED : 1; },
    speedOf: function (code) { return (isMem(code) && !alive(code)) ? GHOST_SPEED : 1; },
    hidePeer: function (code) { return isMem(code) && !alive(code) && !amGhost(); },   // 산 사람에게 유령은 안 보인다
    tagHide: function () { return false; },
    photoOk: function () { return true; },
    label: function () { return '🕵️ 행맨'; },
    chatBlock: function () { return playing() ? '🕵️ 행맨 중에는 회의 때만 말할 수 있습니다.' : ''; },
    block: function (kind) {
        if (kind === 'menu') return '🕵️ 행맨 중에는 목록으로 옮겨 다닐 수 없습니다. 걸어서 가 주십시오.';
        if (meetOn()) return '📢 회의 중입니다.';
        return '';
    },
    frozen: function () { return !playing() || revealing() || meetOn() || !!misOpen || resShow > Date.now(); },
    pin: function () { return null; },
    pinOf: function () { return null; }
};

// ==========================================
// 판이 바뀔 때
// ==========================================
let joinedPlay = '', shownEnd = '', shownRes = 0, resShow = 0, seenDead = {}, ghostTold = '';
function onGame() {
    const c = myCode();
    if (!game) { setOn(false); hideLobby(); return; }
    if (game.st === 'CANCEL') {
        // 놀이 중에 취소되었다 (⏰ 쉬는 시간) — 내 화면도 판을 걷는다
        const rest = game.why === 'rest', host = game.host === c, id = game.id;
        if (mfOn) restLeaveLocal();
        hideLobby();
        unwatchGame();
        if (rest) restKicked = id;
        else if (!host) toast('🕵️ 행맨이 취소되었습니다.');
        return;
    }
    if ((game.st === 'PLAY' || game.st === 'LOBBY') && restNow()) { kickRest(); return; }
    if (game.st === 'LOBBY') { if (game.host === c) paintLobby(); return; }
    if (game.st === 'PLAY') {
        hideLobby();
        if (!isMem(c)) { unwatchGame(); return; }
        if (srv() - (Number(game.t0) || 0) > STALE) { unwatchGame(); return; }
        if (outOf(c) && outOf(c).quit) { leaveLocal(); return; }
        if (joinedPlay !== game.id) { joinedPlay = game.id; startMine(); }
        onTick();
        return;
    }
    if (game.st === 'END') {
        if (shownEnd !== game.id && isMem(c)) { shownEnd = game.id; finishMine(); }
        return;
    }
}
function setOn(v) {
    v = !!v;
    if (mfOn === v) return;
    mfOn = v;
    try { if (typeof window.plazaHsRefresh === 'function') window.plazaHsRefresh(); } catch (e) { }
}
function startMine() {
    mapOn();
    setOn(true);
    try { if (typeof window.plazaPanelClose === 'function') window.plazaPanelClose(); } catch (e) { }
    const go = function (n) {
        if (typeof window.plazaGo === 'function' && roomNow()) { window.plazaGo(START); return; }
        if (n === 0 && typeof window.plazaOpen === 'function') { try { window.plazaOpen(); } catch (e) { } }
        if (n < 20) setTimeout(function () { go(n + 1); }, 300);
    };
    go(0);
    seenDead = {};
    Object.keys(game.dead || {}).forEach(function (k) { seenDead[k] = 1; });        // 다시 들어왔으면 지난 처치는 다시 안 튼다
    shownRes = (game.meet && !game.meet.on && game.meet.n) || 0;
    loopOn();
    if (revealing()) showReveal();
}
function finishMine() {
    const g = game;
    closeAll();
    setOn(false);
    loopOff();
    mapOff();
    try { if (typeof window.plazaReseat === 'function') window.plazaReseat(); } catch (e) { }
    const won = winOf(g, myCode());
    showResult(g, won);
    if (won) payPrize(g);
    unwatchGame();
}
function leaveLocal() {
    closeAll();
    setOn(false);
    loopOff();
    mapOff();
    try { if (typeof window.plazaReseat === 'function') window.plazaReseat(); } catch (e) { }
    unwatchGame();
}
function closeAll() {
    ['mf-meet', 'mf-res', 'mf-reveal', 'mf-mis', 'mf-hud', 'mf-act', 'mf-kill', 'mf-quit'].forEach(closeOv);
    stopGame();
    misOpen = null;
    paintClear();
}

// ==========================================
// 이긴 편 · 상품
// ==========================================
function winOf(g, c) {
    if (!g || !g.end || !g.mem || !g.mem[c]) return false;
    const mf = !!(g.mafia || {})[c];
    return g.end.win === 'mafia' ? mf : !mf;
}
function payPrize(g) {
    const d = db_(), u = me();
    if (!d || !u || !g) return;
    d.ref(G + '/' + g.id + '/paid/' + u.code).transaction(function (cur) { return cur ? undefined : srv(); }).then(function (res) {
        if (!res || !res.committed) return;
        const cu = me();
        if (!cu || cu.code !== u.code) return;
        if (!Array.isArray(cu.inventory)) cu.inventory = [];
        cu.inventory.push(PRIZE);
        try { addHistoryLog(cu, '[행맨] ' + (g.end.win === 'mafia' ? '범인' : '시민') + ' 편이 이겼습니다 · ' + PRIZE + ' 1개'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); else saveSelfFull(); } catch (e) { }
        try { updateUI(); } catch (e) { }
    }).catch(function (e) { console.warn('[행맨] 상품', e); });
}
// 상품 「안구」 — 소지품 기타 칸 · 설명 ??? · 팔 수 없다
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[PRIZE]) ITEM_CATALOG[PRIZE] = { price: '???', usable: false, targetable: false, desc: '???' };
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(PRIZE) < 0) NO_SELL_ITEMS.push(PRIZE); } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 끝 — 누가 먼저 보든 한 번만 적는다 (판 통째로 트랜잭션)
// ==========================================
//   ★ 진짜 Firebase 트랜잭션은 내 화면에 없는 자리를 처음엔 null 로 부른다 — null 이면 null 로 돌려 서버 값으로 다시 부르게 한다
function gtx(fn) {
    const d = db_(); if (!d || !game) return Promise.resolve(null);
    return d.ref(G + '/' + game.id).transaction(function (cur) {
        if (cur === null) return null;
        return fn(cur);
    }).catch(function (e) { console.warn('[행맨] 판', e); return null; });
}
function winCheck(why) {
    if (!playing()) return;
    gtx(function (cur) {
        if (cur.st !== 'PLAY') return;
        const crew = crewAlive(cur), mf = mafiaAlive(cur);
        const total = missions().length, done = Object.keys(cur.done || {}).length;
        let win = null, w = '';
        if (!mf.length) { win = 'crew'; w = 'found'; }
        else if (total && done >= total) { win = 'crew'; w = 'tasks'; }
        else if (!crew.length) { win = 'mafia'; w = 'kill'; }
        else if (why === 'vote' && crew.length <= 2) { win = 'mafia'; w = 'vote'; }
        if (!win) return;
        cur.st = 'END';
        cur.end = { at: srv(), win: win, why: w };
        if (cur.meet) cur.meet.on = false;
        return cur;
    });
}

// ==========================================
// 처치
// ==========================================
let killAt = 0;
// 처치까지 남은 때 (ms) — 판이 시작한 때(t0)와 내가 마지막으로 처치한 때 가운데 늦은 쪽에서 20초.
//   마지막 처치는 서버의 처치 기록(dead · by)에서 찾는다 — 새로 고침해도 그대로다.
function killWait() {
    if (!game) return KILL_COOL;
    let last = Number(game.t0) || 0;
    const dd = game.dead || {}, c = myCode();
    Object.keys(dd).forEach(function (k) { if (dd[k] && dd[k].by === c) last = Math.max(last, Number(dd[k].at) || 0); });
    if (killAt) last = Math.max(last, srv() - (Date.now() - killAt));     // 방금 누른 것 — 서버 기록이 오기 전에도 막는다
    return Math.max(0, last + KILL_COOL - srv());
}
function personW() {
    const st = stage();
    const k = (st && st.k) || 1, z = (st && st.z) || 1;
    return 352 * k / z * 0.32;                  // 칸(352) 가운데 몸이 차지하는 폭쯤 — 한 사람분
}
function killTarget() {
    if (!playing() || !isMafia() || amGhost() || meetOn() || revealing()) return null;
    const p = posOf(myCode()); if (!p) return null;
    const w = personW();
    let best = null, bd = 1e9;
    aliveList().forEach(function (c) {
        if (c === myCode() || isMafia(c)) return;
        const q = posOf(c); if (!q) return;
        const dx = Math.abs(q.x - p.x), dy = Math.abs(q.y - p.y);
        if (dx <= w * 1.15 && dy <= 60 && dx < bd) { bd = dx; best = c; }
    });
    return best;
}
window.mfKill = function () {
    if (killWait() > 0) return;
    const t = killTarget(); if (!t) return;
    killAt = Date.now();
    const p = posOf(myCode()), q = posOf(t);
    const d = db_(); if (!d || !p || !q) return;
    const rec = { at: srv(), by: myCode(), r: roomNow(), x: Math.round(q.x), y: Math.round(q.y), kx: Math.round(p.x), ky: Math.round(p.y) };
    seenDead[t] = 1;
    killFx(rec);
    d.ref(G + '/' + game.id + '/dead/' + t).transaction(function (cur) { return cur ? undefined : rec; }).then(function (res) {
        if (res && res.committed) setTimeout(function () { winCheck('kill'); }, 300);
    }).catch(function () { });
};
// 처치 연출 — 🪩 가 범인에게서 날아가 맞고, 자국이 번진다 · 슉 — 팍
function killFx(rec) {
    const st = stage();
    if (!st || st.room !== rec.r) return;
    const z = st.z, k = st.k || 1;
    const hh = 384 * k * 0.55;                  // 몸 가운데쯤 (칸 높이의 절반 남짓 위)
    const ball = document.createElement('div');
    ball.className = 'mf-ball';
    ball.textContent = '🪩';
    ball.style.transform = 'translate3d(' + Math.round(rec.kx * z) + 'px,' + Math.round(rec.ky * z - hh) + 'px,0)';
    st.el.appendChild(ball);
    sfxWhoosh();
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            ball.style.transform = 'translate3d(' + Math.round(rec.x * z) + 'px,' + Math.round(rec.y * z - hh) + 'px,0) rotate(540deg)';
        });
    });
    setTimeout(function () {
        ball.remove();
        sfxHit();
        const sz = Math.round(384 * k * 0.75);
        const sl = document.createElement('div');
        sl.className = 'mf-slash';
        sl.style.width = sz + 'px'; sl.style.height = sz + 'px';
        sl.style.backgroundSize = (sz * 3) + 'px ' + sz + 'px';
        sl.style.left = Math.round(rec.x * z - sz / 2) + 'px';
        sl.style.top = Math.round(rec.y * z - hh - sz / 2) + 'px';
        st.el.appendChild(sl);
        // 세 칸 — 3 → 2 → 1 로 그어지고, 1 → 2 → 3 으로 걷힌다
        const seq = [2, 1, 0, 0, 0, 1, 2];
        let i = 0;
        const step = function () {
            if (i >= seq.length) { sl.remove(); return; }
            sl.style.backgroundPosition = (-seq[i] * sz) + 'px 0';
            i++;
            setTimeout(step, 70);
        };
        step();
    }, 280);
}
// 소리 — 슉(바람) · 팍(맞는 소리). WebAudio 로 만들어 낸다
let actx = null;
function ac() {
    try {
        if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
        if (actx.state === 'suspended') actx.resume();
        return actx;
    } catch (e) { return null; }
}
function noise(a, dur) {
    const b = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * dur)), a.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = b; return s;
}
function sfxWhoosh() {
    const a = ac(); if (!a) return;
    try {
        const t = a.currentTime, n = noise(a, 0.28), f = a.createBiquadFilter(), g = a.createGain();
        f.type = 'bandpass'; f.Q.value = 1.4;
        f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.24);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.27);
        n.connect(f); f.connect(g); g.connect(a.destination); n.start(t); n.stop(t + 0.3);
    } catch (e) { }
}
function sfxHit() {
    const a = ac(); if (!a) return;
    try {
        const t = a.currentTime;
        const n = noise(a, 0.09), f = a.createBiquadFilter(), g = a.createGain();
        f.type = 'lowpass'; f.frequency.value = 2400;
        g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        n.connect(f); f.connect(g); g.connect(a.destination); n.start(t); n.stop(t + 0.1);
        const o = a.createOscillator(), og = a.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.16);
        og.gain.setValueAtTime(0.8, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.2);
    } catch (e) { }
}
// 새로 생긴 죽음 — 같은 방이면 연출 · 내가 죽었으면 유령
function deadWatch() {
    const dd = (game && game.dead) || {};
    Object.keys(dd).forEach(function (c) {
        if (seenDead[c]) return;
        seenDead[c] = 1;
        const r = dd[c];
        if (srv() - (Number(r.at) || 0) < 5000) killFx(r);
    });
    const c = myCode();
    if (isMem(c) && !alive(c) && ghostTold !== game.id) {
        ghostTold = game.id;
        setTimeout(function () {
            toast(deadOf(c) ? '🪩 당했습니다… 이제 👻 유령입니다 — 작게 · 회색 · 두 배 빠르게. 산 사람에게는 안 보입니다.' : '👻 이제 유령입니다.', 4200);
            try { if (typeof window.plazaHsRefresh === 'function') window.plazaHsRefresh(); } catch (e) { }
        }, 700);
    }
}

// ==========================================
// 회의
// ==========================================
function startMeet(kind, body) {
    if (!playing() || meetOn() || amGhost()) return;
    const c = myCode();
    if (kind === 'emer' && game.emer && game.emer[c]) { toast('🚨 긴급 회의는 한 판에 한 번만 열 수 있습니다.'); return; }
    gtx(function (cur) {
        if (cur.st !== 'PLAY' || (cur.meet && cur.meet.on)) return;
        if ((cur.dead || {})[c] || (cur.out || {})[c]) return;
        if (kind === 'emer') { cur.emer = cur.emer || {}; if (cur.emer[c]) return; cur.emer[c] = srv(); }
        const n = ((cur.meet && cur.meet.n) || 0) + 1;
        cur.meet = { n: n, on: true, kind: kind, by: c, body: body || null, at: srv(), until: srv() + MEET_MS };
        return cur;
    });
}
window.mfReport = function (body) { startMeet('body', body); };
window.mfEmergency = function () { startMeet('emer'); };
window.mfVote = function (t) {
    if (!meetOn() || !alive(myCode())) return;
    const n = game.meet.n;
    const v = (game.votes || {})[n] || {};
    if (v[myCode()]) return;
    const d = db_(); if (!d) return;
    d.ref(G + '/' + game.id + '/votes/' + n + '/' + myCode()).set(t || 'skip');
};
window.mfSay = function () {
    const inp = document.getElementById('mf-say');
    if (!inp || !meetOn() || !alive(myCode())) return;
    const t = String(inp.value || '').trim().slice(0, 80);
    if (!t) return;
    inp.value = '';
    const d = db_(); if (!d) return;
    d.ref(G + '/' + game.id + '/chat/' + game.meet.n).push({ c: myCode(), n: nameOf(myCode()), t: t, at: srv() });
};
function meetCheck() {
    if (!meetOn()) return;
    const m = game.meet, v = (game.votes || {})[m.n] || {};
    const al = aliveList();
    const all = al.every(function (c) { return !!v[c]; });
    if (!all && srv() < Number(m.until || 0)) return;
    gtx(function (cur) {
        if (!cur.meet || !cur.meet.on || cur.meet.n !== m.n) return;
        const vv = (cur.votes || {})[m.n] || {};
        const tally = {};
        let skip = 0;
        Object.keys(vv).forEach(function (who) {
            if ((cur.dead || {})[who] || (cur.out || {})[who]) return;
            const t = vv[who];
            if (!t || t === 'skip' || !(cur.mem || {})[t] || (cur.dead || {})[t] || (cur.out || {})[t]) { skip++; return; }
            tally[t] = (tally[t] || 0) + 1;
        });
        let top = null, topN = 0, tie = false;
        Object.keys(tally).forEach(function (t) {
            if (tally[t] > topN) { top = t; topN = tally[t]; tie = false; }
            else if (tally[t] === topN) tie = true;
        });
        const outC = (top && !tie && topN > skip) ? top : null;
        if (outC) { cur.out = cur.out || {}; cur.out[outC] = { at: srv(), n: m.n }; }
        cur.meet.on = false;
        cur.meet.end = srv();
        cur.meet.res = { out: outC, tally: tally, skip: skip, tie: tie };
        // 승리 — 투표 직후 (사용자 규칙)
        const crew = crewAlive(cur), mf = mafiaAlive(cur);
        const total = missions().length, done = Object.keys(cur.done || {}).length;
        let win = null, w = '';
        if (!mf.length) { win = 'crew'; w = 'found'; }
        else if (total && done >= total) { win = 'crew'; w = 'tasks'; }
        else if (crew.length <= 2) { win = 'mafia'; w = 'vote'; }
        if (win) { cur.st = 'END'; cur.end = { at: srv(), win: win, why: w, after: outC || '' }; }
        return cur;
    });
}
// 회의 창 — 얼굴 · 채팅 · 투표
function faceHtml(c, sz) {
    return '<div class="mf-face" data-face="' + esc(c) + '" style="width:' + sz + 'px;height:' + sz + 'px;"></div>';
}
function fillFaces(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.mf-face'), function (el) {
        if (el._done) return;
        el._done = 1;
        const c = el.getAttribute('data-face');
        const u = (me() && me().code === c) ? me() : users()[c];
        if (!u || typeof window.dotSprite !== 'function') { el.textContent = '🙂'; return; }
        try {
            const sz = el.offsetWidth || 56, s = sz / 120;
            const sp = window.dotSprite({ code: c, dot: u.dot || {} }, { pose: 'stand', scale: s, live: false, all: true });
            sp.style.position = 'absolute';
            sp.style.left = Math.round(sz / 2 - 176 * s) + 'px';
            sp.style.top = Math.round(sz / 2 - 168 * s) + 'px';
            sp.style.margin = '0';
            el.appendChild(sp);
        } catch (e) { el.textContent = '🙂'; }
    });
}
let meetDrawn = '';
function paintMeet() {
    let ov = document.getElementById('mf-meet');
    if (!meetOn()) { if (ov) ov.remove(); meetDrawn = ''; return; }
    const m = game.meet, c = myCode();
    const v = (game.votes || {})[m.n] || {};
    const live = alive(c), voted = !!v[c];
    const left = Math.max(0, Number(m.until || 0) - srv());
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'mf-meet'; ov.className = 'mf-ov';
        ov.innerHTML = '<div class="mf-card mf-meetcard"><h3 id="mf-mt"></h3><div id="mf-msub" class="mf-sub"></div>'
            + '<div id="mf-grid" class="mf-grid"></div>'
            + '<div id="mf-log" class="mf-log"></div>'
            + '<div id="mf-say-row" class="mf-say"><input id="mf-say" maxlength="80" placeholder="말하기 (회의 동안만)"><button id="mf-say-go">보내기</button></div>'
            + '<div class="mf-btns"><button id="mf-skip">건너뛰기</button></div></div>';
        document.body.appendChild(ov);
        ov.querySelector('#mf-say-go').onclick = window.mfSay;
        ov.querySelector('#mf-say').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); window.mfSay(); } });
        ov.querySelector('#mf-skip').onclick = function () { window.mfVote('skip'); };
        ov.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        ov.addEventListener('keydown', function (e) { e.stopPropagation(); });
    }
    ov.querySelector('#mf-mt').innerHTML = (m.kind === 'body' ? '☠ 시체 발견 — ' + esc(nameOf(m.body)) : '🚨 긴급 회의') + ' <span class="mf-t">' + mmss(left) + '</span>';
    ov.querySelector('#mf-msub').innerHTML = esc(nameOf(m.by)) + ' 사원이 회의를 열었습니다. '
        + (live ? (voted ? '투표했습니다 — 다른 사람을 기다립니다.' : '이야기하고 범인이라 생각하는 사람을 누르세요.') : '👻 유령은 보기만 합니다.');
    // 얼굴 칸 — 사람이 바뀌었을 때만 다시 만든다
    const sig = m.n + '|' + mem().map(function (x) { return x + (alive(x) ? 1 : 0) + (v[x] ? 1 : 0); }).join(',') + '|' + (voted ? 1 : 0) + (live ? 1 : 0);
    if (sig !== meetDrawn) {
        meetDrawn = sig;
        const grid = ov.querySelector('#mf-grid');
        grid.innerHTML = mem().map(function (x) {
            const a = alive(x);
            const st = deadOf(x) ? '☠' : (outOf(x) ? '🚪' : '');
            const can = live && !voted && a && x !== c;
            return '<button class="mf-pl' + (a ? '' : ' dead') + (can ? ' can' : '') + '" data-c="' + esc(x) + '"' + (can ? '' : ' disabled') + '>'
                + faceHtml(x, 52) + '<div class="nm">' + esc(nameOf(x)) + (x === c ? ' (나)' : '') + '</div>'
                + '<div class="st">' + st + (a && v[x] ? ' ✔ 투표함' : '') + (isMafia() && isMafia(x) && x !== c ? ' <span style="color:#ff6b6b;">범인</span>' : '') + '</div></button>';
        }).join('');
        Array.prototype.forEach.call(grid.querySelectorAll('.mf-pl.can'), function (b) {
            b.onclick = function () {
                const t = b.getAttribute('data-c');
                if (window.confirm(nameOf(t) + ' 사원에게 투표할까요?')) window.mfVote(t);
            };
        });
        fillFaces(grid);
    }
    ov.querySelector('#mf-say-row').style.display = live ? '' : 'none';
    const sk = ov.querySelector('#mf-skip');
    sk.style.display = (live && !voted) ? '' : 'none';
    // 채팅
    const ch = (game.chat || {})[m.n] || {};
    const lines = Object.keys(ch).map(function (k) { return ch[k]; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    const lh = lines.map(function (o) { return '<div><b>' + esc(o.n || nameOf(o.c)) + '</b> ' + esc(o.t) + '</div>'; }).join('') || '<div class="mf-sub">아직 아무도 말하지 않았습니다.</div>';
    const log = ov.querySelector('#mf-log');
    if (log._h !== lh) { log.innerHTML = lh; log._h = lh; log.scrollTop = log.scrollHeight; }
}
// 회의 결과
function resCheck() {
    const m = game && game.meet;
    if (!m || m.on || !m.n || m.n <= shownRes) return;
    shownRes = m.n;
    resShow = Date.now() + RES_MS;
    closeOv('mf-meet');
    closeOv('mf-mis'); misOpen = null;
    const r = m.res || {};
    const t = r.tally || {};
    const rows = mem().filter(function (x) { return t[x]; }).map(function (x) { return esc(nameOf(x)) + ' ' + t[x] + '표'; });
    let head;
    if (r.out) head = '🚪 <b>' + esc(nameOf(r.out)) + '</b> 사원이 쫓겨났습니다.<br>' + esc(nameOf(r.out)) + ' 사원은 ' + (isMafia(r.out) ? '<b style="color:#ff6b6b;">범인이었습니다.</b>' : '범인이 아니었습니다.');
    else head = (r.tie ? '표가 갈렸습니다. ' : '') + '아무도 쫓겨나지 않았습니다.';
    const ov = document.createElement('div');
    ov.id = 'mf-res'; ov.className = 'mf-ov';
    ov.innerHTML = '<div class="mf-card" style="text-align:center;"><h3 style="justify-content:center;">📢 투표 결과</h3><div style="font-size:14px;line-height:1.8;">' + head + '</div>'
        + '<div class="mf-sub">' + (rows.length ? rows.join(' · ') : '') + (r.skip ? (rows.length ? ' · ' : '') + '건너뛰기 ' + r.skip : '') + '</div>'
        + '<div class="mf-sub">잠시 뒤 모두 중앙에서 다시 시작합니다.</div></div>';
    document.body.appendChild(ov);
    setTimeout(function () {
        closeOv('mf-res');
        if (playing()) { try { window.plazaGo(START); } catch (e) { } }
    }, RES_MS);
}

// ==========================================
// 미션
// ==========================================
function openMission(m) {
    if (misOpen || !playing() || meetOn()) return;
    if (doneOf(m.id) && !amGhost() && !isMafia()) { toast('✅ 이미 끝난 미션입니다.'); return; }
    misOpen = m;
    const ov = document.createElement('div');
    ov.id = 'mf-mis'; ov.className = 'mf-ov';
    ov.innerHTML = '<div class="mf-card"><h3>' + m.i + ' ' + esc(m.n) + '<button id="mf-mis-x">✕</button></h3><div id="mf-mis-b" class="mf-game"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    ov.querySelector('#mf-mis-x').onclick = function () { stopGame(); closeOv('mf-mis'); misOpen = null; };
    GAMES[m.k](ov.querySelector('#mf-mis-b'), function () { missionDone(m); });
}
let gameStop = null;
function stopGame() { if (gameStop) { try { gameStop(); } catch (e) { } gameStop = null; } }
function missionDone(m) {
    stopGame();
    setTimeout(function () { closeOv('mf-mis'); misOpen = null; }, 450);
    const c = myCode();
    if (!playing()) return;
    if (amGhost()) { toast('👻 해냈지만 유령의 미션은 세지 않습니다.'); return; }
    if (isMafia()) { toast('🕵️ 하는 척했습니다. (범인의 미션은 세지 않습니다)'); return; }
    const d = db_(); if (!d) return;
    d.ref(G + '/' + game.id + '/done/' + m.id).transaction(function (cur) { return cur ? undefined : { by: c, at: srv() }; }).then(function (res) {
        if (res && res.committed) { toast('✅ 미션 완료 — ' + m.n); setTimeout(function () { winCheck('task'); }, 300); }
    }).catch(function () { });
}

// ── 미니게임 — el 에 그리고, 다 하면 ok() ──
function btnHtml(t, cls, st) { return '<button class="' + (cls || '') + '"' + (st ? ' style="' + st + '"' : '') + '>' + t + '</button>'; }
function flash(el) { el.classList.remove('mf-bad'); void el.offsetWidth; el.classList.add('mf-bad'); }
const GAMES = {
    // 숫자 순서대로 누르기 — 1 ~ 9
    num: function (el, ok) {
        let next = 1;
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        el.innerHTML = '<div class="mf-hint">1부터 9까지 차례로 누르세요.</div><div class="mf-g3">' + nums.map(function (n) { return '<button data-n="' + n + '">' + n + '</button>'; }).join('') + '</div>';
        Array.prototype.forEach.call(el.querySelectorAll('[data-n]'), function (b) {
            b.onclick = function () {
                const n = Number(b.getAttribute('data-n'));
                if (n === next) { b.classList.add('on'); b.disabled = true; next++; if (next > 9) ok(); }
                else { next = 1; flash(el); Array.prototype.forEach.call(el.querySelectorAll('[data-n]'), function (x) { x.classList.remove('on'); x.disabled = false; }); }
            };
        });
    },
    // 카드 정렬 — 두 장을 골라 바꿔 작은 수부터
    card: function (el, ok) {
        let cards = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
        while (cards.every(function (v, i) { return i === 0 || cards[i - 1] < v; })) cards = shuffle(cards);
        let sel = -1;
        const draw = function () {
            el.innerHTML = '<div class="mf-hint">두 장을 차례로 눌러 자리를 바꿉니다. 작은 수부터 왼쪽으로 늘어놓으세요.</div><div class="mf-row">'
                + cards.map(function (v, i) { return '<button class="mf-cd' + (i === sel ? ' sel' : '') + '" data-i="' + i + '">🂠<b>' + v + '</b></button>'; }).join('') + '</div>';
            Array.prototype.forEach.call(el.querySelectorAll('[data-i]'), function (b) {
                b.onclick = function () {
                    const i = Number(b.getAttribute('data-i'));
                    if (sel < 0) { sel = i; draw(); return; }
                    if (sel !== i) { const t = cards[sel]; cards[sel] = cards[i]; cards[i] = t; }
                    sel = -1; draw();
                    if (cards.every(function (v, j) { return j === 0 || cards[j - 1] < v; })) ok();
                };
            });
        };
        draw();
    },
    // 박스 크기대로 놓기 — 큰 것부터 선반에
    box: function (el, ok) {
        const sizes = [34, 48, 62, 76];
        const order = shuffle(sizes);
        let need = sizes.slice().sort(function (a, b) { return b - a; });
        let placed = [];
        const draw = function () {
            el.innerHTML = '<div class="mf-hint">큰 박스부터 차례로 눌러 선반에 올리세요.</div>'
                + '<div class="mf-shelf">' + placed.map(function (s) { return '<span class="mf-bx" style="width:' + s + 'px;height:' + s + 'px;"></span>'; }).join('') + '</div>'
                + '<div class="mf-row" style="align-items:flex-end;min-height:90px;">' + order.map(function (s) {
                    return placed.indexOf(s) >= 0 ? '' : '<button class="mf-bx" data-s="' + s + '" style="width:' + s + 'px;height:' + s + 'px;"></button>';
                }).join('') + '</div>';
            Array.prototype.forEach.call(el.querySelectorAll('[data-s]'), function (b) {
                b.onclick = function () {
                    const s = Number(b.getAttribute('data-s'));
                    if (s === need[placed.length]) { placed.push(s); draw(); if (placed.length === sizes.length) ok(); }
                    else { placed = []; flash(el); draw(); }
                };
            });
        };
        draw();
    },
    // 같은 색깔 선 잇기 — 왼쪽 → 오른쪽
    wire: function (el, ok) {
        const C = ['#e8584a', '#4a90e2', '#f2c14e', '#8bd14f'];
        const L = shuffle([0, 1, 2, 3]), Rr = shuffle([0, 1, 2, 3]);
        const linked = {};
        let pick = -1;
        el.innerHTML = '<div class="mf-hint">왼쪽 점을 누르고 같은 색의 오른쪽 점을 누르세요.</div>'
            + '<div class="mf-wire"><svg class="mf-wsvg" viewBox="0 0 220 200" preserveAspectRatio="none"></svg>'
            + '<div class="mf-wl">' + L.map(function (c, i) { return '<button data-l="' + i + '" style="background:' + C[c] + ';"></button>'; }).join('') + '</div>'
            + '<div class="mf-wr">' + Rr.map(function (c, i) { return '<button data-r="' + i + '" style="background:' + C[c] + ';"></button>'; }).join('') + '</div></div>';
        const svg = el.querySelector('svg');
        const draw = function () {
            svg.innerHTML = Object.keys(linked).map(function (li) {
                const ri = linked[li], c = L[li];
                return '<line x1="10" y1="' + (25 + li * 50) + '" x2="210" y2="' + (25 + ri * 50) + '" stroke="' + C[c] + '" stroke-width="7" stroke-linecap="round"/>';
            }).join('');
        };
        Array.prototype.forEach.call(el.querySelectorAll('[data-l]'), function (b) {
            b.onclick = function () {
                const i = Number(b.getAttribute('data-l'));
                if (linked[i] != null) return;
                pick = i;
                Array.prototype.forEach.call(el.querySelectorAll('[data-l]'), function (x) { x.classList.toggle('sel', x === b); });
            };
        });
        Array.prototype.forEach.call(el.querySelectorAll('[data-r]'), function (b) {
            b.onclick = function () {
                const j = Number(b.getAttribute('data-r'));
                if (pick < 0) return;
                if (L[pick] === Rr[j]) { linked[pick] = j; pick = -1; draw(); if (Object.keys(linked).length === 4) ok(); }
                else { pick = -1; flash(el); }
                Array.prototype.forEach.call(el.querySelectorAll('[data-l]'), function (x) { x.classList.remove('sel'); });
            };
        });
    },
    // 내려오는 사과 3번 받기 — ◀ ▶ 를 누르고 있거나 바구니를 끌어서
    apple: function (el, ok) {
        el.innerHTML = '<div class="mf-hint">바구니로 떨어지는 사과를 3번 받으세요. <b id="mf-ap-n">0</b>/3</div>'
            + '<div class="mf-field" id="mf-ap-f"><div class="mf-apple" id="mf-ap">🍎</div><div class="mf-basket" id="mf-bk">🧺</div></div>'
            + '<div class="mf-row"><button id="mf-ap-l">◀</button><button id="mf-ap-r">▶</button></div>';
        const f = el.querySelector('#mf-ap-f'), ap = el.querySelector('#mf-ap'), bk = el.querySelector('#mf-bk');
        const W = 260, H = 200;
        let bx = W / 2, ax = 0, ay = -30, vy = 95, got = 0, dir = 0, last = performance.now(), on = true;
        const drop = function () { ax = 20 + Math.random() * (W - 40); ay = -30; vy = 90 + got * 25; };
        drop();
        const hold = function (b, d) {
            const dn = function (e) { e.preventDefault(); dir = d; }, up = function () { if (dir === d) dir = 0; };
            b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
        };
        hold(el.querySelector('#mf-ap-l'), -1); hold(el.querySelector('#mf-ap-r'), 1);
        f.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') { const r = f.getBoundingClientRect(); bx = Math.max(20, Math.min(W - 20, (e.clientX - r.left) * W / r.width)); } });
        const tick = function (t) {
            if (!on) return;
            const dt = Math.min(0.05, (t - last) / 1000); last = t;
            bx = Math.max(20, Math.min(W - 20, bx + dir * 220 * dt));
            ay += vy * dt;
            if (ay >= H - 34 && ay <= H - 14 && Math.abs(ax - bx) < 32) {
                got++; el.querySelector('#mf-ap-n').textContent = String(got);
                if (got >= 3) { on = false; ok(); return; }
                drop();
            } else if (ay > H) drop();
            ap.style.transform = 'translate(' + (ax - 12) + 'px,' + ay + 'px)';
            bk.style.transform = 'translate(' + (bx - 18) + 'px,' + (H - 34) + 'px)';
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        gameStop = function () { on = false; };
    },
    // 불빛 순서 기억 — 네 번 깜빡인 차례대로
    simon: function (el, ok) {
        const C = ['#e8584a', '#4a90e2', '#f2c14e', '#8bd14f'];
        const seq = [0, 0, 0, 0].map(function () { return Math.floor(Math.random() * 4); });
        let i = 0, busy = true, on = true;
        el.innerHTML = '<div class="mf-hint" id="mf-sm-h">불빛을 잘 보세요…</div><div class="mf-g2">' + C.map(function (c, k) { return '<button data-k="' + k + '" style="background:' + c + ';opacity:.35;"></button>'; }).join('') + '</div>';
        const pads = el.querySelectorAll('[data-k]');
        const show = function () {
            busy = true; i = 0;
            el.querySelector('#mf-sm-h').textContent = '불빛을 잘 보세요…';
            seq.forEach(function (k, n) {
                setTimeout(function () { if (!on) return; pads[k].style.opacity = '1'; }, 500 + n * 600);
                setTimeout(function () { if (!on) return; pads[k].style.opacity = '.35'; }, 500 + n * 600 + 380);
            });
            setTimeout(function () { if (!on) return; busy = false; el.querySelector('#mf-sm-h').textContent = '같은 차례로 누르세요.'; }, 500 + seq.length * 600);
        };
        Array.prototype.forEach.call(pads, function (b) {
            b.onclick = function () {
                if (busy) return;
                const k = Number(b.getAttribute('data-k'));
                b.style.opacity = '1'; setTimeout(function () { b.style.opacity = '.35'; }, 160);
                if (k === seq[i]) { i++; if (i >= seq.length) { on = false; ok(); } }
                else { flash(el); setTimeout(show, 500); }
            };
        });
        show();
        gameStop = function () { on = false; };
    },
    // 레버 꾹 누르기 — 2.5초
    hold: function (el, ok) {
        el.innerHTML = '<div class="mf-hint">레버를 2.5초 동안 꾹 누르고 있으세요.</div><div class="mf-bar"><i id="mf-hd-i"></i></div><div class="mf-row"><button id="mf-hd" style="width:150px;height:70px;font-size:26px;">🕹</button></div>';
        const b = el.querySelector('#mf-hd'), bar = el.querySelector('#mf-hd-i');
        let t0 = 0, raf = 0;
        const step = function () {
            const p = Math.min(1, (performance.now() - t0) / 2500);
            bar.style.width = (p * 100) + '%';
            if (p >= 1) { t0 = 0; ok(); return; }
            raf = requestAnimationFrame(step);
        };
        const dn = function (e) { e.preventDefault(); t0 = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(step); };
        const up = function () { if (!t0) return; t0 = 0; cancelAnimationFrame(raf); bar.style.width = '0%'; };
        b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
        gameStop = function () { cancelAnimationFrame(raf); };
    },
    // 같은 그림 짝 — 여섯 장 (세 쌍)
    pair: function (el, ok) {
        const pics = shuffle(['🍎', '🍎', '🌙', '🌙', '⭐', '⭐']);
        const open = [], got = {};
        let lock = false;
        el.innerHTML = '<div class="mf-hint">두 장씩 뒤집어 같은 그림을 맞추세요.</div><div class="mf-g3">' + pics.map(function (p, i) { return '<button data-i="' + i + '">?</button>'; }).join('') + '</div>';
        const bs = el.querySelectorAll('[data-i]');
        Array.prototype.forEach.call(bs, function (b) {
            b.onclick = function () {
                const i = Number(b.getAttribute('data-i'));
                if (lock || got[i] || open.indexOf(i) >= 0) return;
                b.textContent = pics[i]; open.push(i);
                if (open.length < 2) return;
                const a = open[0], c = open[1];
                if (pics[a] === pics[c]) { got[a] = got[c] = 1; bs[a].classList.add('on'); bs[c].classList.add('on'); open.length = 0; if (Object.keys(got).length === 6) ok(); }
                else { lock = true; setTimeout(function () { bs[a].textContent = '?'; bs[c].textContent = '?'; open.length = 0; lock = false; }, 650); }
            };
        });
    },
    // 다이얼 맞추기 — 표시된 수에 ±3 안으로
    dial: function (el, ok) {
        const goal = 10 + Math.floor(Math.random() * 81);
        el.innerHTML = '<div class="mf-hint">다이얼을 <b>' + goal + '</b> 에 맞추고 「맞춘다」를 누르세요.</div>'
            + '<div style="text-align:center;font-size:28px;font-weight:bold;color:#ffe9bd;" id="mf-dl-v">50</div>'
            + '<input type="range" min="0" max="100" value="50" id="mf-dl" style="width:100%;">'
            + '<div class="mf-row"><button id="mf-dl-go">맞춘다</button></div>';
        const r = el.querySelector('#mf-dl');
        r.oninput = function () { el.querySelector('#mf-dl-v').textContent = r.value; };
        el.querySelector('#mf-dl-go').onclick = function () { if (Math.abs(Number(r.value) - goal) <= 3) ok(); else flash(el); };
    },
    // 쓰레기 줍기 — 여섯 개
    trash: function (el, ok) {
        const T = ['🍌', '🥫', '📦', '🧻', '🍾', '🥡'];
        let left = T.length;
        el.innerHTML = '<div class="mf-hint">떨어진 쓰레기를 모두 주우세요.</div><div class="mf-field" id="mf-tr"></div>';
        const f = el.querySelector('#mf-tr');
        T.forEach(function (t) {
            const b = document.createElement('button');
            b.className = 'mf-tr'; b.textContent = t;
            b.style.left = (8 + Math.random() * 78) + '%'; b.style.top = (8 + Math.random() * 70) + '%';
            b.onclick = function () { b.remove(); left--; if (!left) ok(); };
            f.appendChild(b);
        });
    },
    // 스위치 모두 켜기 — 다섯 개
    switch: function (el, ok) {
        let s = [0, 0, 0, 0, 0].map(function () { return Math.random() < 0.5 ? 1 : 0; });
        if (s.every(function (x) { return x; })) s[Math.floor(Math.random() * 5)] = 0;
        const draw = function () {
            el.innerHTML = '<div class="mf-hint">꺼진 스위치를 모두 켜세요.</div><div class="mf-row">' + s.map(function (v, i) {
                return '<button class="mf-sw' + (v ? ' on' : '') + '" data-i="' + i + '">' + (v ? 'ON' : 'OFF') + '</button>';
            }).join('') + '</div>';
            Array.prototype.forEach.call(el.querySelectorAll('[data-i]'), function (b) {
                b.onclick = function () { const i = Number(b.getAttribute('data-i')); s[i] = s[i] ? 0 : 1; draw(); if (s.every(function (x) { return x; })) ok(); };
            });
        };
        draw();
    },
    // 몸 스캔 — 시작하고 4초 기다린다 (창을 닫으면 처음부터)
    scan: function (el, ok) {
        el.innerHTML = '<div class="mf-hint">스캐너 위에 서서 4초 동안 기다리세요.</div><div class="mf-bar"><i id="mf-sc-i"></i></div><div class="mf-row"><button id="mf-sc">📡 스캔 시작</button></div>';
        let iv = 0;
        el.querySelector('#mf-sc').onclick = function () {
            if (iv) return;
            const t0 = Date.now();
            this.disabled = true; this.textContent = '스캔 중…';
            iv = setInterval(function () {
                const p = Math.min(1, (Date.now() - t0) / 4000);
                const i = el.querySelector('#mf-sc-i'); if (i) i.style.width = (p * 100) + '%';
                if (p >= 1) { clearInterval(iv); iv = 0; ok(); }
            }, 60);
        };
        gameStop = function () { clearInterval(iv); };
    }
};

// ==========================================
// 그리기 — 문 · 미션 · 긴급 단추 · 시체 · 시야 · 유령 회색 · 위 띠 · 손 단추
// ==========================================
(function css() {
    if (document.getElementById('mf-css')) return;
    const s = document.createElement('style');
    s.id = 'mf-css';
    s.textContent = [
        '.mf-layer{position:absolute;left:0;top:0;width:0;height:0;}',
        '.mf-mk{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;touch-action:manipulation;}',
        '.mf-mk .ic{font-size:22px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7));}',
        '.mf-mk .tx{font-size:10px;font-weight:bold;color:#fff3d6;background:rgba(0,0,0,.6);border-radius:7px;padding:1px 6px;white-space:nowrap;}',
        '.mf-mk.done .ic{opacity:.55;}',
        '.mf-mk.emer .ic{font-size:30px;animation:mfPulse 1.4s ease-in-out infinite;}',
        '@keyframes mfPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}',
        '.mf-body{position:absolute;cursor:pointer;touch-action:manipulation;}',
        '.mf-body .dot-box{position:absolute;left:0;top:0;margin:0;transform-origin:50% 50%;}',
        '.mf-vis{position:absolute;left:0;top:0;pointer-events:none;will-change:transform;}',
        '.mf-ball{position:absolute;left:0;top:0;font-size:30px;line-height:1;margin:-15px 0 0 -15px;z-index:60000;transition:transform .28s linear;pointer-events:none;}',
        '.mf-slash{position:absolute;z-index:60001;background:url(plaza/mf-slash.png) no-repeat;image-rendering:pixelated;pointer-events:none;}',
        '.mf-ghost .dot-box{filter:grayscale(1) brightness(1.18);opacity:.78;}',
        '#mf-hud{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 132px);z-index:999996;pointer-events:none;'
            + 'background:rgba(10,10,16,.86);border:1px solid #3a3a52;border-radius:14px;padding:7px 14px;color:#f3ead8;font-size:12.5px;font-weight:bold;'
            + 'text-align:center;white-space:nowrap;box-shadow:0 3px 12px rgba(0,0,0,.5);}',
        '#mf-hud small{display:block;font-size:10px;color:#a9a090;font-weight:normal;margin-top:2px;}',
        '.mf-fab{position:fixed;right:16px;z-index:999997;min-width:84px;height:84px;border-radius:42px;padding:0 10px;font-size:14px;font-weight:bold;'
            + 'box-shadow:0 4px 16px rgba(0,0,0,.55);touch-action:manipulation;border:3px solid #fff3cf;}',
        '#mf-kill{bottom:calc(env(safe-area-inset-bottom,0px) + 250px);background:radial-gradient(circle at 35% 30%,#ff9a8a,#b3261e);color:#fff;}',
        '#mf-act{bottom:calc(env(safe-area-inset-bottom,0px) + 150px);background:radial-gradient(circle at 35% 30%,#ffe3a0,#d99b2b);color:#3a2600;}',
        '.mf-fab:active{transform:scale(.94);}',
        '#mf-quit{position:fixed;left:12px;top:calc(env(safe-area-inset-top,0px) + 186px);z-index:999997;padding:6px 10px;border-radius:10px;font-size:11px;'
            + 'background:rgba(10,10,16,.86);border:1px solid #3a3a52;color:#c9c0ae;}',
        '.mf-ov{position:fixed;inset:0;z-index:9999990;display:flex;align-items:center;justify-content:center;background:rgba(4,4,8,.86);padding:12px;}',
        '.mf-card{width:min(96vw,460px);max-height:92dvh;overflow-y:auto;background:linear-gradient(180deg,#17151f,#0b0a10);border:1px solid #3a2f4a;'
            + 'border-radius:16px;padding:14px 13px;color:#e6dfd0;font-size:12.5px;display:flex;flex-direction:column;gap:10px;}',
        '.mf-card h3{margin:0;font-size:15px;color:#ffe9bd;display:flex;align-items:center;gap:8px;}',
        '.mf-card h3 button{margin-left:auto;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid #3a2f4a;color:#ded5c4;cursor:pointer;}',
        '.mf-card .mf-t{margin-left:auto;font-size:13px;color:#ff9a8a;}',
        '.mf-sub{font-size:11px;color:#9a9284;line-height:1.6;}',
        '.mf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:7px;}',
        '.mf-pl{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid #2f2a3a;color:#e6dfd0;}',
        '.mf-pl.can{cursor:pointer;border-color:#7a5aa0;}',
        '.mf-pl.dead{opacity:.45;}',
        '.mf-pl .nm{font-size:11.5px;font-weight:bold;}',
        '.mf-pl .st{font-size:10px;color:#a9a090;min-height:13px;}',
        '.mf-face{position:relative;overflow:hidden;border-radius:50%;background:#2a2433;border:2px solid #4a3f5a;}',
        '.mf-pl.dead .mf-face{filter:grayscale(1);}',
        '.mf-log{height:120px;overflow-y:auto;background:rgba(0,0,0,.3);border:1px solid #2f2a3a;border-radius:10px;padding:7px 9px;font-size:12px;line-height:1.7;}',
        '.mf-log b{color:#ffd9a0;margin-right:4px;}',
        '.mf-say{display:flex;gap:6px;}',
        '.mf-say input{flex:1;min-width:0;padding:9px 10px;border-radius:10px;border:1px solid #3a2f4a;background:#100e15;color:#eee;font-size:13px;}',
        '.mf-say button,.mf-btns button{padding:9px 12px;border-radius:10px;border:1px solid #4a3f5a;background:#241e2e;color:#e6dfd0;font-weight:bold;cursor:pointer;}',
        '.mf-btns{display:flex;gap:8px;justify-content:center;}',
        '.mf-btns button.go{background:linear-gradient(145deg,#d9a94a,#a8761f);color:#1a1200;border-color:#f0cd7a;}',
        '.mf-btns button:disabled{opacity:.4;}',
        '.mf-game{display:flex;flex-direction:column;gap:10px;}',
        '.mf-game.mf-bad,.mf-game .mf-bad{animation:mfShake .3s;}',
        '.mf-bad{animation:mfShake .3s;}',
        '@keyframes mfShake{0%,100%{transform:none;}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}',
        '.mf-hint{font-size:12px;color:#cfc6b4;text-align:center;}',
        '.mf-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}',
        '.mf-g2{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}',
        '.mf-g3 button,.mf-g2 button{height:64px;border-radius:12px;border:1px solid #4a3f5a;background:#241e2e;color:#fff;font-size:22px;font-weight:bold;}',
        '.mf-g3 button.on{background:#2f6b3a;border-color:#6fd27f;}',
        '.mf-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}',
        '.mf-row button{padding:10px 14px;border-radius:10px;border:1px solid #4a3f5a;background:#241e2e;color:#fff;font-size:16px;font-weight:bold;}',
        '.mf-cd{display:flex;flex-direction:column;align-items:center;width:52px;height:74px;justify-content:center;background:#f4efe2 !important;color:#2a1a00 !important;}',
        '.mf-cd b{font-size:20px;}',
        '.mf-cd.sel{outline:3px solid #ffd479;}',
        '.mf-shelf{min-height:90px;border-bottom:6px solid #8a6a3a;display:flex;align-items:flex-end;justify-content:center;gap:6px;padding-bottom:2px;}',
        '.mf-bx{display:inline-block;background:linear-gradient(145deg,#c89a5a,#8a6030) !important;border:2px solid #5a3a18 !important;border-radius:4px;padding:0 !important;}',
        '.mf-wire{position:relative;height:200px;display:flex;justify-content:space-between;}',
        '.mf-wsvg{position:absolute;left:24px;right:24px;top:0;width:calc(100% - 48px);height:200px;pointer-events:none;}',
        '.mf-wl,.mf-wr{display:flex;flex-direction:column;justify-content:space-around;height:200px;}',
        '.mf-wl button,.mf-wr button{width:32px;height:32px;border-radius:50%;border:3px solid #111;}',
        '.mf-wl button.sel{outline:3px solid #fff;}',
        '.mf-field{position:relative;width:260px;height:200px;margin:0 auto;background:linear-gradient(180deg,#1d2a3a,#2a3a24);border-radius:10px;overflow:hidden;touch-action:none;}',
        '.mf-apple,.mf-basket{position:absolute;left:0;top:0;font-size:24px;line-height:1;}',
        '.mf-basket{font-size:32px;}',
        '.mf-tr{position:absolute;font-size:26px;background:none;border:none;transform:translate(-50%,-50%);}',
        '.mf-sw{width:52px;height:64px;font-size:12px !important;background:#3a2020 !important;}',
        '.mf-sw.on{background:#2f6b3a !important;}',
        '.mf-bar{height:14px;border-radius:7px;background:#241e2e;border:1px solid #4a3f5a;overflow:hidden;}',
        '.mf-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#d9a94a,#ffe3a0);}'
    ].join('\n');
    document.head.appendChild(s);
})();

let toastT = 0;
function toast(t, ms) {
    let el = document.getElementById('mf-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mf-toast';
        el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 350px);z-index:9999991;'
            + 'background:rgba(10,10,16,.92);border:1px solid #5a4a72;border-radius:12px;padding:8px 14px;color:#fff3d6;font-size:12.5px;font-weight:bold;'
            + 'pointer-events:none;max-width:86vw;text-align:center;transition:opacity .3s;';
        document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.style.opacity = '0'; }, ms || 2400);
}

let lay = { key: '', box: null, vis: null, bodies: {} };
function paintClear() {
    if (lay.box) lay.box.remove();
    if (lay.vis) lay.vis.remove();
    lay = { key: '', box: null, vis: null, bodies: {} };
    ['mf-hud', 'mf-act', 'mf-kill', 'mf-quit'].forEach(closeOv);
}
function mk(x, y, ic, tx, cls, fn) {
    const e = document.createElement('div');
    e.className = 'mf-mk' + (cls ? ' ' + cls : '');
    e.innerHTML = '<div class="ic">' + ic + '</div><div class="tx">' + esc(tx) + '</div>';
    e.style.zIndex = String(100 + Math.round(y));
    e._x = x; e._y = y;
    e.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); if (near(x)) fn(); else toast('가까이 가야 합니다.'); });
    return e;
}
function near(x) { const p = posOf(myCode()); return !!(p && Math.abs(p.x - x) <= REACH); }
function floorY(room) { const r = rooms()[room]; return r && r.floor ? r.floor[0] - 6 : 600; }
// 이 방의 손 닿는 것 — 문 · 미션 · 단추 (자리 순)
function things(room) {
    const out = [];
    const L = MAP[room] || {};
    if (L.up) out.push({ t: 'door', x: DOOR_UP, ic: '⬆', n: MAP[L.up].n, go: L.up, way: 'down', at: DOOR_DN });
    if (L.down) out.push({ t: 'door', x: DOOR_DN, ic: '⬇', n: MAP[L.down].n, go: L.down, way: 'up', at: DOOR_UP });
    if (L.emer) out.push({ t: 'emer', x: L.emer, ic: '🚨', n: '긴급 회의' });
    missions().filter(function (m) { return m.room === room; }).forEach(function (m) { out.push({ t: 'mis', x: m.x, ic: m.i, n: m.n, m: m }); });
    return out;
}
function useThing(o) {
    if (!o || !playing() || meetOn() || misOpen) return;
    if (o.t === 'door') { try { window.plazaGo(o.go, null, o.at); } catch (e) { } return; }
    if (o.t === 'emer') { if (amGhost()) { toast('👻 유령은 회의를 열 수 없습니다.'); return; } window.mfEmergency(); return; }
    if (o.t === 'mis') openMission(o.m);
}
function paintMarks() {
    const st = stage();
    if (!st || !st.el || !MAP[st.room]) { if (lay.box) { lay.box.remove(); lay.box = null; lay.key = ''; } return; }
    const dn = missions().filter(function (m) { return m.room === st.room && doneOf(m.id); }).map(function (m) { return m.id; }).join(',');
    const key = game.id + '|' + st.room + '|' + st.z + '|' + dn + '|' + (game.emer && game.emer[myCode()] ? 1 : 0);
    if (lay.key === key && lay.box && lay.box.isConnected) return;
    if (lay.box) lay.box.remove();
    lay.bodies = {};
    const box = document.createElement('div');
    box.className = 'mf-layer';
    const z = st.z, fy = floorY(st.room);
    things(st.room).forEach(function (o) {
        const tx = o.t === 'door' ? o.n : (o.t === 'emer' ? o.n : o.n + (doneOf(o.m.id) ? ' ✅' : ''));
        const e = mk(o.x, fy, o.t === 'mis' && doneOf(o.m.id) ? '✅' : o.ic, tx, o.t === 'emer' ? 'emer' : (o.t === 'mis' && doneOf(o.m.id) ? 'done' : ''), function () { useThing(o); });
        e.style.left = Math.round(o.x * z) + 'px';
        e.style.top = Math.round(fy * z) + 'px';
        box.appendChild(e);
    });
    st.el.appendChild(box);
    lay.box = box; lay.key = key;
}
// 시체 — 지난 회의 뒤에 쓰러진 사람만 · 이 방에 · 작게 누워 눈 감고
function paintBodies() {
    const st = stage();
    if (!st || !lay.box) return;
    const dd = (game && game.dead) || {}, since = lastMeetEnd();
    const want = {};
    Object.keys(dd).forEach(function (c) {
        const r = dd[c];
        if (r.r !== st.room || (Number(r.at) || 0) <= since) return;
        if (srv() - (Number(r.at) || 0) < 550) return;                 // 🪩 가 날아가 맞은 뒤에 눕는다
        want[c] = r;
    });
    Object.keys(lay.bodies).forEach(function (c) { if (!want[c]) { lay.bodies[c].remove(); delete lay.bodies[c]; } });
    Object.keys(want).forEach(function (c) {
        if (lay.bodies[c]) return;
        const r = want[c];
        const u = (me() && me().code === c) ? me() : users()[c];
        const k = (st.k || 1) / 5, z = st.z;                           // 파인애플 크기
        const w = 352 * k, h = 384 * k;
        const e = document.createElement('div');
        e.className = 'mf-body';
        e.style.width = Math.round(h) + 'px'; e.style.height = Math.round(w) + 'px';
        e.style.left = Math.round(r.x * z - h / 2) + 'px';
        e.style.top = Math.round(r.y * z - w * 0.62) + 'px';
        e.style.zIndex = String(100 + Math.round(r.y));
        try {
            const sp = window.dotSprite({ code: c, dot: (u && u.dot) || {} }, { pose: 'stand', scale: k, live: false, all: true });
            sp.style.left = Math.round((h - w) / 2) + 'px';
            sp.style.top = Math.round((w - h) / 2) + 'px';
            sp.style.transform = 'rotate(-90deg)';
            // 눈 감은 칸 — 머리 장 서기 줄의 넷째 칸 (깜빡임 가운데 눈을 다 감은 칸)
            const L = window.dotLook({ code: c, dot: (u && u.dot) || {} }, null, true);
            const d = sp._dot;
            if (d && L && L.head) {
                const i = d.sheets.indexOf(L.head);
                if (i >= 0 && d.els[i]) d.els[i].style.backgroundPosition = '-' + (3 * 352 * k) + 'px -' + (384 * k) + 'px';
            }
            e.appendChild(sp);
        } catch (x) { e.textContent = '☠'; }
        e.title = nameOf(c);
        e.addEventListener('click', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            if (amGhost()) { toast('👻 유령은 신고할 수 없습니다.'); return; }
            if (!near(r.x)) { toast('가까이 가야 합니다.'); return; }
            window.mfReport(c);
        });
        lay.box.appendChild(e);
        lay.bodies[c] = e;
    });
}
// 시야 — 산 사람은 둘레만
function paintVision() {
    const st = stage();
    const need = !!(st && st.el && playing() && !amGhost());
    if (!need) { if (lay.vis) { lay.vis.remove(); lay.vis = null; } return; }
    const p = posOf(myCode()); if (!p) return;
    const z = st.z, R0 = 2600;
    // 반지름 — 방 그림으로 VISION 만큼. 다만 폰은 방을 크게 당겨 그려서 그대로면 화면이 다 보인다 → 화면 폭의 38% 를 넘지 않게
    const r = Math.round(Math.min(VISION * z, (window.innerWidth || 420) * 0.38));
    if (!lay.vis || !lay.vis.isConnected || lay.vis._r !== r) {
        if (lay.vis) lay.vis.remove();
        const v = document.createElement('div');
        v.className = 'mf-vis';
        v.style.width = v.style.height = (R0 * 2) + 'px';
        v.style.zIndex = '50000';
        v.style.background = 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ' + r + 'px, rgba(0,0,0,.55) ' + Math.round(r * 1.12) + 'px, rgba(2,2,6,.97) ' + Math.round(r * 1.32) + 'px)';
        v._r = r;
        st.el.appendChild(v);
        lay.vis = v;
    }
    const k = st.k || 1;
    const L = Math.round(p.x * z - R0), T = Math.round(p.y * z - 384 * k * 0.4 - R0);
    if (lay.vis._L !== L || lay.vis._T !== T) { lay.vis.style.transform = 'translate3d(' + L + 'px,' + T + 'px,0)'; lay.vis._L = L; lay.vis._T = T; }
}
// 유령은 회색 — 나(유령일 때) · 보이는 유령
function paintGhosts() {
    if (typeof window.plazaOneOf !== 'function') return;
    mem().forEach(function (c) {
        const o = window.plazaOneOf(c);
        if (!o || !o.wrap) return;
        const g = !alive(c) && (amGhost() || c === myCode());     // 산 사람 화면에서는 맞기 전까지 그대로 (곧 안 보이게 된다)
        if (o.wrap.classList.contains('mf-ghost') !== g) o.wrap.classList.toggle('mf-ghost', g);
    });
}
function nearThing() {
    const st = stage(); if (!st) return null;
    const p = posOf(myCode()); if (!p) return null;
    let best = null, bd = 1e9;
    things(st.room).forEach(function (o) {
        const d = Math.abs(o.x - p.x);
        if (d <= REACH && d < bd) { bd = d; best = o; }
    });
    // 시체 — 산 사람만
    if (!amGhost()) {
        Object.keys(lay.bodies).forEach(function (c) {
            const r = game.dead[c]; if (!r) return;
            const d = Math.abs(r.x - p.x);
            if (d <= REACH && d <= bd) { bd = d; best = { t: 'body', c: c, n: nameOf(c) }; }
        });
    }
    return best;
}
function paintHud() {
    const c = myCode();
    let hud = document.getElementById('mf-hud');
    if (!hud) { hud = document.createElement('div'); hud.id = 'mf-hud'; document.body.appendChild(hud); }
    const room = roomNow(), rn = (MAP[room] && MAP[room].n) || '';
    const total = missions().length, dn = doneN();
    const roomLeft = missions().filter(function (m) { return m.room === room && !doneOf(m.id); }).length;
    let role = isMafia() ? '🕵️ 범인' : '🙂 시민';
    if (amGhost()) role += ' · 👻 유령';
    const mates = isMafia() ? mem().filter(function (x) { return x !== c && isMafia(x); }).map(nameOf) : [];
    let sub = isMafia() ? '산 사람 가까이에서 🪩 처치 · 미션은 하는 척만' + (mates.length ? ' · 동료 범인 ' + mates.join(', ') : '')
        : '미션을 끝내거나 범인을 찾아내세요 · 시체를 누르면 회의';
    if (amGhost()) sub = '산 사람에게 안 보입니다 · 미션은 해도 세지 않습니다';
    if (revealing()) sub = '곧 시작합니다…';
    const html = role + ' · 📍 ' + esc(rn) + ' · 🛠 미션 ' + dn + '/' + total + (roomLeft ? ' (이 방 ' + roomLeft + ')' : '') + ' · 🙂 ' + aliveList().length + '명<small>' + esc(sub) + '</small>';
    if (hud._h !== html) { hud.innerHTML = html; hud._h = html; }
    // 처치 단추
    let kb = document.getElementById('mf-kill');
    if (isMafia() && !amGhost() && playing() && !meetOn()) {
        if (!kb) {
            kb = document.createElement('button'); kb.id = 'mf-kill'; kb.className = 'mf-fab'; kb.textContent = '🪩 처치';
            kb.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
            kb.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); window.mfKill(); });
            document.body.appendChild(kb);
        }
        const wait = killWait();
        const t = wait > 0 ? null : killTarget();
        kb.disabled = !t;
        kb.style.opacity = t ? '1' : '.4';
        const lab = wait > 0 ? '🪩 ' + Math.ceil(wait / 1000) + '초' : '🪩 처치';
        if (kb._l !== lab) { kb.textContent = lab; kb._l = lab; }
    } else if (kb) kb.remove();
    // 손 단추 — 가까운 것 (문 · 미션 · 긴급 회의 · 시체)
    let ab = document.getElementById('mf-act');
    const o = (playing() && !meetOn() && !misOpen) ? nearThing() : null;
    if (o) {
        if (!ab) {
            ab = document.createElement('button'); ab.id = 'mf-act'; ab.className = 'mf-fab';
            ab.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
            ab.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                const x = ab._o; if (!x) return;
                if (x.t === 'body') window.mfReport(x.c); else useThing(x);
            });
            document.body.appendChild(ab);
        }
        ab._o = o;
        const lab = o.t === 'body' ? '📢 신고' : (o.t === 'door' ? o.ic + ' ' + o.n : (o.t === 'emer' ? '🚨 긴급 회의' : o.ic + ' 미션'));
        if (ab._l !== lab) { ab.textContent = lab; ab._l = lab; }
    } else if (ab) ab.remove();
    // 나가기
    let qb = document.getElementById('mf-quit');
    if (!qb) {
        qb = document.createElement('button'); qb.id = 'mf-quit'; qb.textContent = '🚪 그만두기';
        qb.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        qb.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); quitGame(); });
        document.body.appendChild(qb);
    }
}
function quitGame() {
    if (!window.confirm('행맨을 그만두고 나갈까요?\n(남은 사람에게는 쫓겨난 것으로 셉니다)')) return;
    const c = myCode();
    gtx(function (cur) {
        if (cur.st !== 'PLAY') return;
        cur.out = cur.out || {};
        if (!cur.out[c]) cur.out[c] = { at: srv(), n: 0, quit: 1 };
        const crew = crewAlive(cur), mf = mafiaAlive(cur);
        if (!mf.length) { cur.st = 'END'; cur.end = { at: srv(), win: 'crew', why: 'quit' }; }
        else if (!crew.length) { cur.st = 'END'; cur.end = { at: srv(), win: 'mafia', why: 'quit' }; }
        return cur;
    }).then(function () { leaveLocal(); toast('🚪 행맨에서 나왔습니다.'); });
}
function showReveal() {
    closeOv('mf-reveal');
    const c = myCode();
    const mates = mem().filter(function (x) { return x !== c && isMafia(x); }).map(nameOf);
    const ov = document.createElement('div');
    ov.id = 'mf-reveal'; ov.className = 'mf-ov';
    ov.innerHTML = '<div class="mf-card" style="text-align:center;align-items:center;">'
        + (isMafia()
            ? '<div style="font-size:46px;">🕵️</div><h3 style="color:#ff6b6b;">당신은 범인입니다</h3><div class="mf-sub">산 사람 가까이에서 🪩 를 날려 처치하세요 (시작 20초 뒤부터 · 처치하면 20초 쉼). 들키지 않게 미션을 하는 척하세요.' + (mates.length ? '<br>동료 범인 — <b style="color:#ff9a8a;">' + mates.map(esc).join(', ') + '</b>' : '') + '</div>'
            : '<div style="font-size:46px;">🙂</div><h3>당신은 시민입니다</h3><div class="mf-sub">맵 곳곳의 미션 ' + missions().length + '개를 모두 끝내거나, 회의에서 범인을 찾아내세요.<br>시체를 보면 눌러 회의를 여세요. 중앙의 🚨 는 긴급 회의 (한 번).</div>')
        + '<div class="mf-sub">범인 ' + Object.keys(game.mafia || {}).length + '명 · 모두 ' + mem().length + '명</div></div>';
    document.body.appendChild(ov);
    setTimeout(function () { closeOv('mf-reveal'); }, Math.max(800, (Number(game.t0) || 0) + REVEAL_MS - srv()));
}

// ==========================================
// 도는 것
// ==========================================
let raf = 0, slowT = 0;
function frame() {
    raf = 0;
    if (!mfOn || !game) return;
    try { paintMarks(); paintBodies(); paintVision(); paintGhosts(); } catch (e) { }
    raf = requestAnimationFrame(frame);
}
function onTick() {
    if (!mfOn || !game || game.st !== 'PLAY') return;
    try { deadWatch(); } catch (e) { console.warn(e); }
    try { paintMeet(); } catch (e) { console.warn(e); }
    try { resCheck(); } catch (e) { console.warn(e); }
}
function loopOn() {
    if (!raf) raf = requestAnimationFrame(frame);
    if (!slowT) slowT = setInterval(function () {
        if (!mfOn || !game) return;
        if (restNow()) { kickRest(); return; }
        try { paintHud(); } catch (e) { }
        onTick();
        try { meetCheck(); } catch (e) { }
    }, 250);
}
function loopOff() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (slowT) { clearInterval(slowT); slowT = 0; }
}

// ==========================================
// 결과
// ==========================================
function showResult(g, won) {
    if (!g || !g.end) return;
    const e = g.end, mf = Object.keys(g.mafia || {});
    const why = { tasks: '시민이 미션을 모두 끝냈습니다.', found: '시민이 범인을 모두 찾아냈습니다.', vote: '투표 뒤 산 시민이 2명 이하가 되었습니다.', kill: '산 시민이 남지 않았습니다.', quit: '남은 사람이 없어 끝났습니다.' }[e.why] || '';
    closeOv('mf-end');
    const ov = document.createElement('div');
    ov.className = 'mf-ov'; ov.id = 'mf-end';
    ov.innerHTML = '<div class="mf-card" style="text-align:center;"><h3 style="justify-content:center;">' + (e.win === 'mafia' ? '🕵️ 범인의 승리' : '🙂 시민의 승리') + '</h3>'
        + '<div>' + esc(why) + '</div>'
        + '<div>🕵️ 범인 — <b>' + mf.map(function (c) { return esc((g.mem[c] && g.mem[c].n) || nameOf(c)); }).join(', ') + '</b></div>'
        + (won ? '<div style="color:#ffd479;">👁 이긴 편 — ' + PRIZE + ' 1개를 받았습니다.</div>' : '<div class="mf-sub">진 편입니다.</div>')
        + '<div class="mf-btns"><button class="go" id="mf-end-x">확인</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#mf-end-x').onclick = function () { closeOv('mf-end'); };
}

// ==========================================
// 부르기 — 목록 「🕵️ 행맨」
// ==========================================
let pickSel = {};
window.mfOpen = function () {
    const u = me(); if (!u) return;
    if (mfOn) { toast('🕵️ 이미 행맨 중입니다.'); return; }
    if (game && game.st === 'LOBBY' && game.host === u.code) { paintLobby(true); return; }
    if (restNow()) { alert_(REST_MSG); return; }
    const why = busyWhy(u);
    if (why) { alert_('🕵️ 행맨\n\n' + why); return; }
    pickSel = {};
    paintPick();
};
function onlineList() {
    const on = online(), U = users(), c = myCode();
    return Object.keys(on).filter(function (k) { return k !== c && U[k] && U[k].name; })
        .sort(function (a, b) { return String(nameOf(a)).localeCompare(String(nameOf(b))); });
}
function paintPick() {
    closeOv('mf-pick');
    const list = onlineList();
    const ov = document.createElement('div');
    ov.className = 'mf-ov'; ov.id = 'mf-pick';
    const n = Object.keys(pickSel).length;
    ov.innerHTML = '<div class="mf-card"><h3>🕵️ 행맨 — 부를 사람<button id="mf-pick-x">✕</button></h3>'
        + '<div class="mf-sub">접속한 사원을 골라 부릅니다 (나까지 ' + MIN_P + ' ~ ' + MAX_P + '명). 범인은 ' + MIN_P + '~' + (TWO_AT - 1) + '명이면 1명, ' + TWO_AT + '~' + MAX_P + '명이면 2명.<br>'
        + '포토존 일곱 곳을 이어 붙인 맵에서 미션을 하고, 시체를 보면 회의를 열어 범인을 찾습니다.</div>'
        + '<div class="mf-list">' + (list.length ? list.map(function (k) {
            return '<div class="mf-prow' + (pickSel[k] ? ' on' : '') + '" data-c="' + esc(k) + '"><span class="ck">' + (pickSel[k] ? '✓' : '') + '</span>' + esc(nameOf(k)) + '</div>';
        }).join('') : '<div class="mf-sub">지금 접속한 다른 사원이 없습니다.</div>') + '</div>'
        + '<div class="mf-btns"><button class="go" id="mf-pick-go"' + (n >= MIN_P - 1 ? '' : ' disabled') + '>부르기 (' + n + '명)</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#mf-pick-x').onclick = function () { closeOv('mf-pick'); };
    Array.prototype.forEach.call(ov.querySelectorAll('.mf-prow'), function (r) {
        r.onclick = function () {
            const k = r.getAttribute('data-c');
            if (pickSel[k]) delete pickSel[k];
            else { if (Object.keys(pickSel).length >= MAX_P - 1) { toast('나까지 ' + MAX_P + '명까지입니다.'); return; } pickSel[k] = 1; }
            paintPick();
        };
    });
    ov.querySelector('#mf-pick-go').onclick = function () { invite(Object.keys(pickSel)); };
}
function invite(codes) {
    const u = me(), d = db_();
    if (!u || !d || codes.length < MIN_P - 1) return;
    if (restNow()) { alert_(REST_MSG); return; }
    const why = busyWhy(u);
    if (why) { alert_('🕵️ 행맨\n\n' + why); return; }
    const id = 'mf' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const inv = {};
    codes.forEach(function (c) { inv[c] = { n: nameOf(c), st: 'wait' }; });
    const m = {}; m[u.code] = { n: nameOf(u.code) };
    const g = { id: id, host: u.code, hostName: nameOf(u.code), at: srv(), st: 'LOBBY', inst: 7000 + Math.floor(Math.random() * 2000), inv: inv, mem: m };
    const up = {};
    up[G + '/' + id] = g;
    codes.forEach(function (c) { up[INV + '/' + c + '/' + id] = { from: u.code, fromName: nameOf(u.code), at: srv() }; });
    d.ref('/').update(up).then(function () {
        closeOv('mf-pick');
        watchGame(id);
        toast('🕵️ ' + codes.length + '명을 불렀습니다.');
    }).catch(function (e) { console.warn('[행맨] 부르기 실패', e); alert_('부르지 못했습니다.'); });
}
function paintLobby(force) {
    if (!game || game.st !== 'LOBBY' || game.host !== myCode()) return;
    let ov = document.getElementById('mf-lobby');
    if (!ov && !force && paintLobby._closed === game.id) return;
    const inv = game.inv || {};
    const okN = Object.keys(inv).filter(function (c) { return inv[c].st === 'ok'; }).length;
    const can = okN + 1 >= MIN_P;
    const html = '<div class="mf-card"><h3>🕵️ 행맨 — 모이는 중<button id="mf-lb-x">✕</button></h3>'
        + '<div class="mf-sub">나까지 ' + MIN_P + '명 이상 모이면 시작할 수 있습니다. 시작하면 아직 답하지 않은 사람은 빠집니다.</div>'
        + '<div class="mf-list">' + Object.keys(inv).map(function (c) {
            const st = inv[c].st;
            const tag = st === 'ok' ? '<span class="st" style="color:#8bd48b;">수락</span>' : st === 'no' ? '<span class="st" style="color:#e58a8a;">거절</span>'
                : '<span class="st" style="color:#a9a090;">기다리는 중…</span>';
            return '<div class="mf-prow" style="cursor:default;">' + esc(inv[c].n || nameOf(c)) + tag + '</div>';
        }).join('') + '</div>'
        + '<div class="mf-btns"><button id="mf-lb-cancel">취소</button><button class="go" id="mf-lb-go"' + (can ? '' : ' disabled') + '>시작 (' + (okN + 1) + '명)</button></div></div>';
    if (!ov) { ov = document.createElement('div'); ov.className = 'mf-ov'; ov.id = 'mf-lobby'; document.body.appendChild(ov); }
    if (ov._h === html) return;
    ov._h = html;
    ov.innerHTML = html;
    ov.querySelector('#mf-lb-x').onclick = function () { paintLobby._closed = game && game.id; closeOv('mf-lobby'); };
    ov.querySelector('#mf-lb-cancel').onclick = cancelLobby;
    ov.querySelector('#mf-lb-go').onclick = startGame;
}
function hideLobby() { closeOv('mf-lobby'); }
function cancelLobby() {
    const d = db_(); if (!d || !game) return;
    const id = game.id, inv = game.inv || {};
    const up = {};
    up[G + '/' + id + '/st'] = 'CANCEL';
    Object.keys(inv).forEach(function (c) { up[INV + '/' + c + '/' + id] = null; });
    d.ref('/').update(up).catch(function () { });
    hideLobby();
    unwatchGame();
}
function startGame() {
    const d = db_(), u = me(); if (!d || !game || !u) return;
    if (restNow()) { alert_(REST_MSG); return; }
    const why = busyWhy(u);
    if (why) { alert_('🕵️ 행맨\n\n' + why); return; }
    const id = game.id;
    d.ref(G + '/' + id).transaction(function (cur) {
        if (cur === null) return null;
        if (cur.st !== 'LOBBY') return;
        const m = cur.mem || {};
        Object.keys(cur.inv || {}).forEach(function (c) { if (cur.inv[c].st === 'ok') m[c] = { n: cur.inv[c].n || c }; });
        const codes = Object.keys(m);
        if (codes.length < MIN_P || codes.length > MAX_P) return;
        const nm = codes.length >= TWO_AT ? 2 : 1;
        const mf = {};
        shuffle(codes).slice(0, nm).forEach(function (c) { mf[c] = 1; });
        cur.mem = m;
        cur.mafia = mf;
        cur.st = 'PLAY';
        cur.t0 = srv() + 1500;
        cur.dead = null; cur.out = null; cur.done = null; cur.meet = null; cur.votes = null; cur.chat = null; cur.emer = null;
        return cur;
    }).then(function (res) {
        const v = res && res.snapshot ? res.snapshot.val() : null;
        if (!res || !res.committed || !v || v.st !== 'PLAY') { alert_('시작하지 못했습니다. (나까지 ' + MIN_P + ' ~ ' + MAX_P + '명이 모여야 합니다)'); return; }
        const up = {};
        Object.keys(v.inv || {}).forEach(function (c) { up[INV + '/' + c + '/' + id] = null; });
        d.ref('/').update(up).catch(function () { });
    }).catch(function () { alert_('시작하지 못했습니다.'); });
}

// ── 받은 초대
let invRef = null, invCode = '';
const asked = {};
function watchInv() {
    const u = me(), d = db_();
    const c = (u && u.code) || '';
    if (c === invCode) return;
    if (invRef) { try { invRef.off(); } catch (e) { } invRef = null; }
    invCode = c;
    if (!c || !d) return;
    invRef = d.ref(INV + '/' + c);
    invRef.on('child_added', function (s) { onInvite(s.key, s.val()); });
    invRef.on('child_removed', function (s) { if (asked[s.key] === 'open') closeOv('mf-ask-' + s.key); });
}
function onInvite(id, v) {
    if (!v || asked[id]) return;
    const d = db_(); if (!d) return;
    if (srv() - (Number(v.at) || 0) > INV_TTL) { d.ref(INV + '/' + myCode() + '/' + id).remove(); return; }
    asked[id] = 'open';
    const ov = document.createElement('div');
    ov.className = 'mf-ov'; ov.id = 'mf-ask-' + id;
    ov.innerHTML = '<div class="mf-card"><h3>🕵️ 행맨 초대</h3>'
        + '<div><b style="color:#ffe9bd;">' + esc(v.fromName || nameOf(v.from)) + '</b> 사원이 행맨에 불렀습니다.</div>'
        + '<div class="mf-sub">포토존을 이어 붙인 맵에서 미션을 하고, 회의에서 범인을 찾는 놀이입니다. 이긴 편은 👁 안구 1개.</div>'
        + '<div class="mf-btns"><button id="mf-ask-no">안 한다</button><button class="go" id="mf-ask-ok">같이 한다</button></div></div>';
    document.body.appendChild(ov);
    const done = function () { asked[id] = 'done'; closeOv('mf-ask-' + id); try { d.ref(INV + '/' + myCode() + '/' + id).remove(); } catch (e) { } };
    ov.querySelector('#mf-ask-no').onclick = function () {
        d.ref(G + '/' + id + '/inv/' + myCode() + '/st').transaction(function (cur) { return cur === 'wait' ? 'no' : cur; }).catch(function () { });
        done();
    };
    ov.querySelector('#mf-ask-ok').onclick = function () {
        if (restNow()) { alert_(REST_MSG); return; }
        const why = busyWhy(me());
        if (why) { alert_('🕵️ 행맨\n\n' + why); return; }
        if (mfOn) { alert_('🕵️ 이미 다른 행맨 중입니다.'); return; }
        const c = myCode();
        // ★ 진짜 Firebase — 듣지 않던 자리는 처음엔 null 로 부른다 (숨바꼭질에서 겪은 것)
        d.ref(G + '/' + id).transaction(function (cur) {
            if (cur === null) return null;
            if (cur.st !== 'LOBBY' || !cur.inv || !cur.inv[c]) return;
            if (srv() - (Number(cur.at) || 0) > LOBBY_TTL) return;
            cur.inv[c].st = 'ok';
            return cur;
        }).then(function (res) {
            done();
            const g = res && res.snapshot ? res.snapshot.val() : null;
            if (!res || !res.committed || !g || !g.inv || !g.inv[c] || g.inv[c].st !== 'ok') { alert_('🕵️ 이미 시작했거나 끝난 행맨입니다.'); return; }
            watchGame(id);
            toast('🕵️ 수락했습니다. 부른 사람이 시작하기를 기다립니다.');
        }).catch(function () { done(); });
    };
}
(function lobbyCss() {
    const s = document.createElement('style');
    s.textContent = '.mf-list{display:flex;flex-direction:column;gap:5px;max-height:46dvh;overflow-y:auto;}'
        + '.mf-prow{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid #2f2a3a;cursor:pointer;}'
        + '.mf-prow.on{border-color:#d9a94a;background:rgba(217,169,74,.12);}'
        + '.mf-prow .ck{width:18px;height:18px;border-radius:5px;border:1px solid #6a6458;display:flex;align-items:center;justify-content:center;font-size:12px;}'
        + '.mf-prow.on .ck{background:#d9a94a;color:#1a1200;border-color:#d9a94a;}'
        + '.mf-prow .st{margin-left:auto;font-size:11px;}';
    document.head.appendChild(s);
})();

// ── 다시 들어왔을 때 — 하던 판이 있으면 이어서
setInterval(function () {
    try { watchInv(); } catch (e) { }
    if (!gid && myCode()) {
        const id = ls(gidKey());
        if (id) watchGame(id);
    }
    if (game && (game.st === 'PLAY' || game.st === 'LOBBY') && restNow()) { kickRest(); return; }
    if (game && game.st === 'LOBBY' && game.host === myCode() && srv() - (Number(game.at) || 0) > LOBBY_TTL) cancelLobby();
}, 1500);

window.mfState = function () {
    console.log('%c===== 🕵️ 행맨 =====', 'color:#ff9a8a; font-size:13px');
    if (!game) { console.log('  판 없음'); return; }
    console.log('  판', game.id, '·', game.st, '· 켜짐', mfOn, '· 방 번호', game.inst, '· 회의', meetOn() ? game.meet.n : '-');
    console.table(mem().map(function (c) { return { 사번: c, 이름: nameOf(c), 역할: isMafia(c) ? '범인' : '시민', 상태: deadOf(c) ? '처치됨' : (outOf(c) ? '쫓겨남' : '삶') }; }));
    console.log('  미션', doneN() + '/' + missions().length);
};
window.mfMissions = function () { return missions(); };
window.mfGames = GAMES;

console.log('[행맨] 목록 「생활」 🕵️ 행맨 — mfState()');
})();
