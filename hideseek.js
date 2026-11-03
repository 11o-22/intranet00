// ==========================================
// ★ 🫣 숨바꼭질 — 광장 미니게임 (2026-11-02 사용자)
// bundles.json 마지막 묶음 — plaza.js · shell.js 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//   · 둘 이상(최대 인원 없음). 목록 「생활」 마작 옆 🫣 숨바꼭질 → 접속한 사람을 골라 부른다 → 받은 사람이 수락.
//   · 시작하면 무작위 한 명이 술래(보통 크기) · 나머지는 파인애플 먹은 크기(1/5 · plaza.js TINY).
//   · 주신 오브젝트(plaza/hs-objs.png · 34가지)를 포토존을 뺀 여덟 방에 깐다 — 작은 사람이 뒤에 숨을 만한 크기로.
//   · 15초 셈 — 이때는 목록(☰)으로 옮겨 다닐 수 없고 걸어서만. 술래는 그동안 눈을 가리고 못 움직인다.
//   · 셈이 끝나면 술래가 잡으러 다닌다 (5분). 찾기가 시작되면 파인애플은 다른 맵으로 못 넘어간다.
//   · 잡힌 파인애플은 이동식 가두리(plaza/hs-cage.png)에 갇혀 술래 뒤를 따라다닌다 · 끝날 때까지 못 나온다.
//   · 이름표는 절대 안 보인다 · 놀이 중에는 참여하지 않은 사람이 안 보인다.
//
// ■ 이렇게 했다
//   · 놀이 방 — 광장의 방 번호(plazaRoom/<방>~<번호>)를 7000 넘는 수로 따로 잡아 **참여자만** 든다.
//     그래서 미참여자가 안 보이고, 미참여자에게도 참여자가 안 보인다 (plaza.js joinInst 고리).
//   · 이름표 · 크기 · 걸음 · 방 옮기기는 plaza.js 가 window.PLAZA_HS 를 물어 정한다 (plaza.js 맨 위 「숨바꼭질」).
//   · 목록 이동은 놀이 내내 막는다 (셈 동안 · 찾는 동안 모두 — 술래도 걸어서). 동료 목록 · 포토존도 안 열린다.
//   · 잡기 — 술래의 「🔍 찾기」(1.2초마다) — 술래 둘레(좌우 120 · 앞뒤 70)에 있는 파인애플을 잡는다.
//     오브젝트 뒤에 숨어 안 보여도 그 둘레를 뒤지면 잡힌다 (덤불을 헤쳐 보는 셈).
//   · 놀이 방의 맵 채팅은 이름 대신 🫣 로 적힌다 · 사람을 톡 쳐도 아무것도 안 뜬다.
//   · 끝 — 5분이 지나거나 모두 잡히면. 결과(술래 · 잡힌 사람 · 끝까지 숨은 사람)를 띄우고 모두 원래 방으로.
//   · 상품 (2026-11-03) — 🎁 랜덤박스 · 술래는 잡은 파인애플 수만큼 · 끝까지 숨은 파인애플은 1개 (hsGame/<판>/paid 로 한 번만)
//
// ■ 서버 자리
//   hsGame/<판> = { id, host, hostName, at, st:'LOBBY'|'PLAY'|'END'|'CANCEL', inst,
//                   inv: { 사번: { n, st:'wait'|'ok'|'no' } }, mem: { 사번: { n } },
//                   seeker, room, t0, sk: { r, lv }, caught: { 사번: 때 }, end: { at, why } }
//   hsInv/<사번>/<판> = { from, fromName, at }   — 받은 초대
//
// ■ 콘솔
//   hsState()

(function hideSeek() {
'use strict';

const G = 'hsGame', INV = 'hsInv';
const COUNT_MS = 15000, SEEK_MS = 5 * 60000;
const LOBBY_TTL = 15 * 60000, INV_TTL = 3 * 60000;
const SEARCH_X = 120, SEARCH_Y = 70, SEARCH_COOL = 1200;
const CAGE_H = 165, CAGE_W = Math.round(165 * 288 / 352), CAGE_BACK = 125;     // 이동식 가두리 — 작은 사람 셋이 나란히 들 만큼 · 밝게 다시 칠하고 테두리를 둘렀다 (어두운 길에서도 보이게)
const CAGE_FLOOR = 34;                // 가두리 바닥 판 높이 — 잡힌 사람은 그 위에 선다 (바퀴 사이에 서지 않게)
const ATLAS = { src: 'plaza/hs-objs.png', w: 512, h: 575 };
// 주신 그림을 잘라 한 장에 모은 것 — n 이름 · x y w h 장 안의 자리 · k 방에 놓을 배 (작은 사람이 숨을 만하게)
const OBJS = [{"n": "tree1", "x": 2, "y": 2, "w": 62, "h": 80, "k": 2}, {"n": "tree2", "x": 66, "y": 2, "w": 62, "h": 80, "k": 2}, {"n": "fbush1", "x": 130, "y": 2, "w": 62, "h": 81, "k": 2}, {"n": "fbush2", "x": 194, "y": 2, "w": 62, "h": 83, "k": 2}, {"n": "fbush3", "x": 258, "y": 2, "w": 62, "h": 81, "k": 2}, {"n": "rock1", "x": 322, "y": 2, "w": 72, "h": 61, "k": 2}, {"n": "rock2", "x": 396, "y": 2, "w": 91, "h": 68, "k": 2}, {"n": "rock3", "x": 2, "y": 87, "w": 64, "h": 74, "k": 2}, {"n": "basket", "x": 68, "y": 87, "w": 52, "h": 84, "k": 2}, {"n": "vase", "x": 122, "y": 87, "w": 37, "h": 37, "k": 2}, {"n": "pebble1", "x": 161, "y": 87, "w": 30, "h": 20, "k": 2.5}, {"n": "pebble2", "x": 193, "y": 87, "w": 32, "h": 22, "k": 2.5}, {"n": "pebble3", "x": 227, "y": 87, "w": 39, "h": 26, "k": 2.5}, {"n": "stone1", "x": 268, "y": 87, "w": 46, "h": 39, "k": 2.5}, {"n": "stone2", "x": 316, "y": 87, "w": 37, "h": 27, "k": 2.5}, {"n": "pebble4", "x": 355, "y": 87, "w": 24, "h": 20, "k": 2.5}, {"n": "pebble5", "x": 381, "y": 87, "w": 32, "h": 22, "k": 2.5}, {"n": "stone3", "x": 415, "y": 87, "w": 40, "h": 24, "k": 2.5}, {"n": "pot1", "x": 457, "y": 87, "w": 42, "h": 68, "k": 2}, {"n": "pot2", "x": 2, "y": 173, "w": 42, "h": 64, "k": 2}, {"n": "pot3", "x": 46, "y": 173, "w": 42, "h": 62, "k": 2}, {"n": "barrel", "x": 90, "y": 173, "w": 42, "h": 54, "k": 2}, {"n": "chest", "x": 134, "y": 173, "w": 52, "h": 52, "k": 2}, {"n": "bush1", "x": 188, "y": 173, "w": 100, "h": 98, "k": 2}, {"n": "bush2", "x": 290, "y": 173, "w": 100, "h": 98, "k": 2}, {"n": "bamboo", "x": 392, "y": 173, "w": 70, "h": 68, "k": 2}, {"n": "bush3", "x": 2, "y": 273, "w": 100, "h": 98, "k": 2}, {"n": "bush4", "x": 104, "y": 273, "w": 100, "h": 98, "k": 2}, {"n": "bush5", "x": 206, "y": 273, "w": 100, "h": 98, "k": 2}, {"n": "grass1", "x": 308, "y": 273, "w": 54, "h": 40, "k": 2}, {"n": "grass2", "x": 364, "y": 273, "w": 46, "h": 32, "k": 2}, {"n": "cherry1", "x": 2, "y": 373, "w": 194, "h": 200, "k": 1.6}, {"n": "cherry2", "x": 198, "y": 373, "w": 161, "h": 172, "k": 1.6}, {"n": "bigrock", "x": 361, "y": 373, "w": 116, "h": 118, "k": 2}];
// 고르는 무게 — 숨기 좋은 것(덤불 · 바위 · 통)을 더 자주
const WEIGHT = { bush1: 4, bush2: 4, bush3: 4, bush4: 4, bush5: 4, fbush1: 3, fbush2: 3, fbush3: 3, tree1: 2, tree2: 2,
                 rock1: 3, rock2: 3, rock3: 3, bigrock: 3, basket: 2, pot1: 2, pot2: 2, pot3: 2, barrel: 3, chest: 3,
                 bamboo: 2, vase: 1, cherry1: 1, cherry2: 1, grass1: 1, grass2: 1, stone1: 1, stone2: 1, stone3: 1,
                 pebble1: 1, pebble2: 1, pebble3: 1, pebble4: 1, pebble5: 1 };

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
function nameOf(c) { const u = (me() && me().code === c) ? me() : users()[c]; return (u && ((u.badge && u.badge.nickname) || u.name)) || c; }
function rooms() { return (typeof PLAZA !== 'undefined' && PLAZA.ROOMS) ? PLAZA.ROOMS : {}; }
function roomNow() { try { return (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { return ''; } }
function online() { try { return (typeof onlineUsersMap !== 'undefined' && onlineUsersMap) ? onlineUsersMap : {}; } catch (e) { return {}; } }
// 하던 판 번호 — 사람마다 따로 (한 기기에서 여러 사원으로 들어와도 남의 판을 이어 보지 않게 · 2026-11-03)
function gidKey() { return 'hsGid_' + (myCode() || ''); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } return null; }
function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = hash(seed) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mmss(ms) { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

// 같이 놀 수 없는 때 — 어둠 탐사 중 · 상담실 · 선녀탕 · 가두리
function busyWhy(u) {
    u = u || me();
    if (!u) return '로그인이 필요합니다.';
    try { if (typeof darkRun !== 'undefined' && darkRun) return '어둠 탐사 중에는 할 수 없습니다.'; } catch (e) { }
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) return '상담실 · 선녀탕에 있는 동안은 할 수 없습니다.'; } catch (e) { }
    try { if (typeof window.gaduriOf === 'function' && window.gaduriOf(u.code)) return '가두리에 갇혀 있는 동안은 할 수 없습니다.'; } catch (e) { }
    return '';
}

// ==========================================
// 판 — 지금 내가 든 판을 듣는다
// ==========================================
let game = null, gid = '', gRef = null, gFn = null;
let hsOn = false;                 // plaza.js 가 묻는 「놀이 중인가」 — 프레임마다 묻는 값이라 들고 있는다
function watchGame(id) {
    if (gid === id && gRef) return;
    unwatchGame();
    const d = db_(); if (!d || !id) return;
    gid = id;
    ls(gidKey(), id);
    gRef = d.ref(G + '/' + id);
    gFn = function (s) { game = s.val(); onGame(); };
    gRef.on('value', gFn);
}
function unwatchGame() {
    if (gRef && gFn) { try { gRef.off('value', gFn); } catch (e) { } }
    gRef = null; gFn = null; gid = ''; game = null;
    ls(gidKey(), null);
}
function isMem(c) { return !!(game && game.mem && game.mem[c || myCode()]); }
function hiders() { return game && game.mem ? Object.keys(game.mem).filter(function (c) { return c !== game.seeker; }) : []; }
function caughtAt(c) { return (game && game.caught && game.caught[c]) || 0; }
function caughtList() { return hiders().filter(caughtAt).sort(function (a, b) { return caughtAt(a) - caughtAt(b) || (a < b ? -1 : 1); }); }
function allCaught() { const h = hiders(); return h.length > 0 && h.every(caughtAt); }
function phase() {
    if (!game || game.st !== 'PLAY' || !game.t0) return '';
    const t = srv() - game.t0;
    if (t < COUNT_MS) return 'count';
    if (t < COUNT_MS + SEEK_MS && !allCaught()) return 'seek';
    return 'over';
}
function amSeeker() { return !!(game && game.seeker === myCode()); }
const SEEK_SPEED = 2;            // 술래 걷는 빠르기 배수 (2026-11-03 사용자)
const HIDE_SPEED = 2;            // 파인애플 걷는 빠르기 배수 (2026-11-03 사용자 — 술래와 같게)

// ==========================================
// plaza.js 가 묻는 것
// ==========================================
window.PLAZA_HS = {
    on: function () { return hsOn; },
    inst: function () { return (game && game.inst) || 0; },
    tiny: function () { return !amSeeker(); },
    // 걷는 빠르기 배수 — 술래는 두 배 (2026-11-03 사용자 「파인애플을 찾는 사람은 이속 두 배」)
    speed: function () { return amSeeker() ? SEEK_SPEED : (isMem() ? HIDE_SPEED : 1); },
    speedOf: function (code) { return (game && code && game.seeker === code) ? SEEK_SPEED : (isMem(code) ? HIDE_SPEED : 1); },
    block: function (kind, to) {
        const R = rooms();
        if (to && R[to] && R[to].photo) return '🫣 숨바꼭질 중에는 포토존에 갈 수 없습니다.';
        if (kind === 'menu') return '🫣 숨바꼭질 중에는 목록으로 옮겨 다닐 수 없습니다. 걸어서 가 주십시오.';
        const c = myCode(), ph = phase();
        if (caughtAt(c)) return '🔒 잡혀서 가두리 안에 있습니다.';
        if (!amSeeker() && ph === 'seek') return '🍍 찾기가 시작되어 다른 곳으로 넘어갈 수 없습니다.';
        if (ph === 'over') return '🫣 놀이가 끝났습니다.';
        return '';
    },
    frozen: function () {
        const ph = phase();
        return (amSeeker() && ph === 'count') || !!caughtAt(myCode()) || ph === 'over';
    },
    pin: function () {
        const c = myCode();
        if (!caughtAt(c)) return null;
        const sk = (game && game.sk) || {};
        if (sk.r && sk.r !== roomNow()) return { room: sk.r, lv: sk.lv || 0 };
        const p = posOf(game.seeker);
        return p ? slot(p, c) : null;
    },
    pinOf: function (code) {
        if (!caughtAt(code)) return null;
        const p = posOf(game.seeker);
        return p ? slot(p, code) : null;
    }
};
function posOf(code) { try { return (typeof window.plazaPosOf === 'function') ? window.plazaPosOf(code) : null; } catch (e) { return null; } }
// 이동식 가두리 — 술래 뒤 (보는 쪽 반대) · 방 끝을 넘지 않게
function cageAt(p) {
    const r = rooms()[roomNow()] || { w: 1880 };
    const half = CAGE_W / 2 + 10;
    const x = Math.max(half, Math.min(r.w - half, p.x + (p.face || 1) * CAGE_BACK));
    return { x: x, y: p.y - 3 };
}
// 가두리 안 자리 — 잡힌 차례대로 나란히 (많으면 겹친다)
function slot(p, code) {
    const cg = cageAt(p);
    const list = caughtList();
    const i = Math.max(0, list.indexOf(code)), n = Math.max(1, list.length);
    const lim = CAGE_W / 2 - 18;
    const dx = Math.max(-lim, Math.min(lim, (i - (n - 1) / 2) * 18));
    return { x: cg.x + dx, y: cg.y - CAGE_FLOOR };
}

// ==========================================
// 판이 바뀔 때
// ==========================================
let shownEnd = '', joinedPlay = '';
function onGame() {
    const c = myCode();
    if (!game) { setOn(false); hideLobby(); return; }
    if (game.st === 'CANCEL') { setOn(false); hideLobby(); if (game.host !== c) toast('🫣 숨바꼭질이 취소되었습니다.'); unwatchGame(); return; }
    if (game.st === 'LOBBY') { if (game.host === c) paintLobby(); return; }
    if (game.st === 'PLAY') {
        hideLobby();
        if (!isMem(c)) { unwatchGame(); return; }
        if (joinedPlay !== game.id) { joinedPlay = game.id; startMine(); }
        return;
    }
    if (game.st === 'END') {
        if (shownEnd !== game.id && isMem(c)) { shownEnd = game.id; finishMine(); }
        return;
    }
}
function setOn(v) {
    v = !!v;
    if (hsOn === v) return;
    hsOn = v;
    try { if (typeof window.plazaHsRefresh === 'function') window.plazaHsRefresh(); } catch (e) { }
}
// 놀이 방으로 — 그 판의 시작 방(놀이 번호)에 선다
function startMine() {
    setOn(true);
    try { if (typeof window.plazaPanelClose === 'function') window.plazaPanelClose(); } catch (e) { }
    const go = function (n) {
        if (typeof window.plazaGo === 'function' && roomNow()) { window.plazaGo(game.room || 'plaza'); return; }
        if (n === 0 && typeof window.plazaOpen === 'function') { try { window.plazaOpen(); } catch (e) { } }
        if (n < 20) setTimeout(function () { go(n + 1); }, 300);
    };
    go(0);
    loopOn();
    toast(amSeeker() ? '👀 당신이 술래입니다. 15초 동안 눈을 감고 셉니다.' : '🍍 작아졌습니다! 15초 안에 숨으세요. (목록 이동은 안 됩니다 — 걸어서)');
}
function finishMine() {
    const g = game;
    setOn(false);
    loopOff();
    paintClear();
    try { if (typeof window.plazaReseat === 'function') window.plazaReseat(); } catch (e) { }
    const n = prizeOf(g, myCode());
    showResult(g, n);
    payPrize(g, n);
    unwatchGame();
}

// ── 이긴 몫 — 🎁 랜덤박스 (2026-11-03 사용자)
//   술래 — 잡은 파인애플 수만큼 · 파인애플 — 끝까지 안 잡혔으면 1개 · 잡힌 파인애플은 없음
//   한 판에 한 사람 한 번 — hsGame/<판>/paid/<사번> 를 트랜잭션으로 찍은 사람만 받는다 (두 기기 · 새로고침에도 두 번 안 받게)
const PRIZE = '랜덤박스';
function prizeOf(g, c) {
    if (!g || !c || !g.mem || !g.mem[c]) return 0;
    const cg = g.caught || {};
    if (c === g.seeker) return Object.keys(g.mem).filter(function (h) { return h !== g.seeker && cg[h]; }).length;
    return cg[c] ? 0 : 1;
}
function payPrize(g, n) {
    const d = db_(), u = me();
    if (!d || !u || !g || !(n > 0)) return;
    d.ref(G + '/' + g.id + '/paid/' + u.code).transaction(function (cur) { return cur ? undefined : srv(); }).then(function (res) {
        if (!res || !res.committed) return;                                  // 이미 받았다
        const cu = me();
        if (!cu || cu.code !== u.code) return;
        if (!Array.isArray(cu.inventory)) cu.inventory = [];
        for (let i = 0; i < n; i++) cu.inventory.push(PRIZE);
        try { if (typeof addHistoryLog === 'function') addHistoryLog(cu, '[숨바꼭질] ' + (cu.code === g.seeker ? '술래 — 파인애플 ' + n + '명을 찾았습니다' : '끝까지 숨었습니다') + ' · ' + PRIZE + ' ' + n + '개'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); else if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    }).catch(function (e) { console.warn('[숨바꼭질] 상품', e); });
}

// ==========================================
// 끝 — 누가 먼저 보든 한 번만 적는다
// ==========================================
function endCheck() {
    if (!game || game.st !== 'PLAY' || phase() !== 'over') return;
    const d = db_(); if (!d) return;
    const why = allCaught() ? 'all' : 'time';
    d.ref(G + '/' + game.id).transaction(function (cur) {
        if (cur === null) return null;                 // 서버 값으로 다시 부르게 (수락과 같은 까닭)
        if (cur.st !== 'PLAY') return;
        cur.st = 'END';
        cur.end = { at: srv(), why: why };
        return cur;
    }).catch(function () { });
}

// ==========================================
// 술래 — 지금 있는 방을 알린다 · 찾는다
// ==========================================
let skSent = '';
function seekerBeat() {
    if (!game || !amSeeker() || game.st !== 'PLAY') return;
    const w = (typeof window.plazaWhere === 'function') ? window.plazaWhere() : null;
    if (!w || !w.room) return;
    const k = w.room + '|' + (w.lv || 0);
    if (k === skSent && game.sk && game.sk.r === w.room) return;
    skSent = k;
    const d = db_(); if (!d) return;
    try { d.ref(G + '/' + game.id + '/sk').set({ r: w.room, lv: w.lv || 0 }); } catch (e) { }
}
let findAt = 0;
window.hsFind = function () {
    if (!game || !amSeeker() || phase() !== 'seek') return;
    if (Date.now() - findAt < SEARCH_COOL) return;
    findAt = Date.now();
    const p = posOf(myCode()); if (!p) return;
    ring(p);
    const got = hiders().filter(function (c) {
        if (caughtAt(c)) return false;
        const q = posOf(c);
        return q && Math.abs(q.x - p.x) <= SEARCH_X && Math.abs(q.y - p.y) <= SEARCH_Y;
    });
    if (!got.length) { toast('🔍 …아무도 없다.'); return; }
    const d = db_(); if (!d) return;
    const up = {}, t = srv();
    got.forEach(function (c) { up[c] = t; });
    d.ref(G + '/' + game.id + '/caught').update(up).catch(function () { });
    toast('🔍 찾았다! 🍍 ' + got.length + '명');
};

// ==========================================
// 그리기 — 오브젝트 · 이동식 가두리 · 위 띠 · 술래 가림막 · 찾기 단추
// ==========================================
// ★ z 자리 — 상담사 화면은 광장이 덮개(999995)로 떠 있다. 위 띠 · 가림막 · 찾기 단추는 그보다 위,
//   창(초대 · 모이는 판 · 결과)은 알림창(99999999) 바로 아래로 둔다. 사원 화면은 광장이 바탕(1)이라 어느 쪽이든 보인다.
(function css() {
    if (document.getElementById('hs-css')) return;
    const s = document.createElement('style');
    s.id = 'hs-css';
    s.textContent = [
        '.hs-objs{position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;}',
        '.hs-o{position:absolute;background-image:url(' + ATLAS.src + ');background-repeat:no-repeat;image-rendering:pixelated;pointer-events:none;}',
        '.hs-cage{position:absolute;left:0;top:0;background:url(plaza/hs-cage.png) no-repeat;background-size:100% 100%;image-rendering:pixelated;pointer-events:none;will-change:transform;}',
        '.hs-ring{position:absolute;border:2px solid rgba(255,230,140,.85);border-radius:50%;pointer-events:none;animation:hsRing .45s ease-out forwards;}',
        '@keyframes hsRing{from{opacity:1;transform:scale(.4);}to{opacity:0;transform:scale(1);}}',
        '#hs-hud{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 132px);z-index:999996;pointer-events:none;'
            + 'background:rgba(10,10,16,.82);border:1px solid #3a3a52;border-radius:14px;padding:7px 14px;color:#f3ead8;font-size:12.5px;font-weight:bold;'
            + 'text-align:center;white-space:nowrap;box-shadow:0 3px 12px rgba(0,0,0,.5);}',
        '#hs-hud small{display:block;font-size:10px;color:#a9a090;font-weight:normal;margin-top:2px;}',
        '#hs-blind{position:fixed;inset:0;z-index:999996;background:radial-gradient(circle at 50% 45%,#141420,#030305);display:flex;flex-direction:column;'
            + 'align-items:center;justify-content:center;color:#e8e0cc;text-align:center;gap:10px;}',
        '#hs-blind .n{font-size:64px;font-weight:bold;color:#ffd479;text-shadow:0 0 18px rgba(255,200,90,.5);}',
        '#hs-find{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);z-index:999997;width:84px;height:84px;border-radius:50%;'
            + 'background:radial-gradient(circle at 35% 30%,#ffe3a0,#d99b2b);border:3px solid #fff3cf;color:#3a2600;font-size:15px;font-weight:bold;'
            + 'box-shadow:0 4px 16px rgba(0,0,0,.55);touch-action:manipulation;}',
        '#hs-find:active{transform:scale(.94);}',
        '#hs-find.cool{filter:grayscale(.6) brightness(.8);}',
        '.hs-ov{position:fixed;inset:0;z-index:9999990;display:flex;align-items:center;justify-content:center;background:rgba(4,4,8,.82);padding:16px;}',
        '.hs-card{width:min(94vw,420px);max-height:86dvh;overflow-y:auto;background:linear-gradient(180deg,#16161f,#0b0b10);border:1px solid #2f2f40;'
            + 'border-radius:16px;padding:15px 14px;color:#e6dfd0;font-size:12.5px;display:flex;flex-direction:column;gap:10px;}',
        '.hs-card h3{margin:0;font-size:15px;color:#ffe9bd;display:flex;align-items:center;gap:8px;}',
        '.hs-card h3 button{margin-left:auto;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid #2f2f40;color:#ded5c4;cursor:pointer;}',
        '.hs-sub{font-size:11px;color:#9a9284;line-height:1.6;}',
        '.hs-list{display:flex;flex-direction:column;gap:5px;max-height:46dvh;overflow-y:auto;}',
        '.hs-row{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid #262634;cursor:pointer;}',
        '.hs-row.on{border-color:#d9a94a;background:rgba(217,169,74,.12);}',
        '.hs-row .ck{width:18px;height:18px;border-radius:5px;border:1px solid #6a6458;display:flex;align-items:center;justify-content:center;font-size:12px;}',
        '.hs-row.on .ck{background:#d9a94a;color:#1a1200;border-color:#d9a94a;}',
        '.hs-row .st{margin-left:auto;font-size:11px;}',
        '.hs-btns{display:flex;gap:8px;}',
        '.hs-btns button{flex:1;padding:11px;border-radius:11px;border:1px solid #3a3a52;background:#1e1e2c;color:#e6dfd0;font-size:13px;font-weight:bold;cursor:pointer;}',
        '.hs-btns button.go{background:linear-gradient(145deg,#d9a94a,#a8761f);color:#1a1200;border-color:#f0cd7a;}',
        '.hs-btns button:disabled{opacity:.4;cursor:default;}',
        '.hs-res b{color:#ffe9bd;}'
    ].join('\n');
    document.head.appendChild(s);
})();

let toastT = 0;
function toast(t) {
    let el = document.getElementById('hs-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'hs-toast';
        el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 250px);z-index:9999991;'
            + 'background:rgba(10,10,16,.9);border:1px solid #4a4a62;border-radius:12px;padding:8px 14px;color:#fff3d6;font-size:12.5px;font-weight:bold;'
            + 'pointer-events:none;max-width:86vw;text-align:center;transition:opacity .3s;';
        document.body.appendChild(el);
    }
    el.textContent = t;
    el.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.style.opacity = '0'; }, 2400);
}

// ── 오브젝트 — 판마다 같은 자리 (판 번호 + 방으로 씨를 뿌린다)
const layoutCache = {};
function layout(room) {
    const key = (game && game.id) + ':' + room;
    if (layoutCache[key]) return layoutCache[key];
    const r = rooms()[room];
    const out = [];
    if (!r || r.photo || !game) return (layoutCache[key] = out);
    const rnd = rng(key);
    const total = OBJS.reduce(function (a, o) { return a + (WEIGHT[o.n] || 1); }, 0);
    const pick = function (maxH) {
        for (let t = 0; t < 30; t++) {
            let v = rnd() * total, o = OBJS[0];
            for (let i = 0; i < OBJS.length; i++) { v -= (WEIGHT[OBJS[i].n] || 1); if (v < 0) { o = OBJS[i]; break; } }
            if (!maxH || o.h * o.k <= maxH) return o;
        }
        return OBJS.filter(function (o) { return o.n === 'barrel'; })[0];
    };
    const place = function (lv, n, x0, x1, y0, y1, maxH) {
        const bad = [];
        (r.spots || []).forEach(function (s) { if ((s.lv || 0) === lv) bad.push([s.x - (s.board ? (s.bw || 170) / 2 + 30 : 85), s.x + (s.board ? (s.bw || 170) / 2 + 30 : 85)]); });
        if (lv === 0 && r.cage) bad.push([r.cage.x - r.cage.w / 2 - 20, r.cage.x + r.cage.w / 2 + 20]);
        if (lv === 0 && r.up && r.up.x) bad.push([r.up.x[0], r.up.x[1]]);
        if (lv === 0 && r.down && r.down.x) bad.push([r.down.x[0], r.down.x[1]]);
        const mine = [];
        for (let t = 0; t < 400 && mine.length < n; t++) {
            const o = pick(maxH);
            const w = o.w * o.k, h = o.h * o.k;
            const x = x0 + w / 2 + rnd() * Math.max(1, (x1 - x0 - w));
            if (bad.some(function (b) { return x + w / 2 > b[0] && x - w / 2 < b[1]; })) continue;
            if (mine.some(function (m) { return Math.abs(m.x - x) < (m.w + w) / 2 + 16; })) continue;
            const y = y0 + rnd() * (y1 - y0);
            mine.push({ o: o, x: x, y: y, w: w, h: h, lv: lv });
        }
        mine.forEach(function (m) { out.push(m); });
    };
    const f = r.floor || [845, 905];
    place(0, 10, 150, r.w - 150, f[1] - 26, f[1] - 2, 0);
    if (r.floor2 && r.x2) place(1, 3, r.x2[0] + 40, r.x2[1] - 40, r.floor2[1] - 8, r.floor2[1] + 2, 190);
    return (layoutCache[key] = out);
}
let drawn = { key: '', box: null, cage: null };
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function paintObjs() {
    const st = stage();
    if (!st || !st.el) return;
    const key = game.id + '|' + st.room + '|' + st.z + '|' + (st.seat || '');
    if (drawn.key === key && drawn.box && drawn.box.isConnected) return;
    if (drawn.box) drawn.box.remove();
    if (drawn.cage) drawn.cage.remove();
    drawn = { key: key, box: null, cage: null };
    const box = document.createElement('div');
    box.className = 'hs-objs';
    const z = st.z;
    box.innerHTML = layout(st.room).map(function (m) {
        const k = m.o.k * z;
        return '<div class="hs-o" style="left:' + Math.round((m.x - m.w / 2) * z) + 'px;top:' + Math.round((m.y - m.h) * z) + 'px;'
            + 'width:' + Math.round(m.w * z) + 'px;height:' + Math.round(m.h * z) + 'px;z-index:' + (100 + Math.round(m.y)) + ';'
            + 'background-size:' + (ATLAS.w * k) + 'px ' + (ATLAS.h * k) + 'px;background-position:' + (-m.o.x * k) + 'px ' + (-m.o.y * k) + 'px;"></div>';
    }).join('');
    st.el.appendChild(box);
    const cage = document.createElement('div');
    cage.className = 'hs-cage';
    cage.style.width = Math.round(CAGE_W * z) + 'px';
    cage.style.height = Math.round(CAGE_H * z) + 'px';
    cage.style.display = 'none';
    st.el.appendChild(cage);
    drawn.box = box; drawn.cage = cage;
}
function paintCage() {
    const st = stage(), cage = drawn.cage;
    if (!st || !cage || !game) return;
    const p = posOf(game.seeker);
    if (!p || !caughtList().length) { if (cage.style.display !== 'none') cage.style.display = 'none'; return; }
    const cg = cageAt(p), z = st.z;
    const L = Math.round((cg.x - CAGE_W / 2) * z), T = Math.round((cg.y - CAGE_H) * z);
    cage.style.transform = 'translate3d(' + L + 'px,' + T + 'px,0)';
    cage.style.zIndex = String(100 + Math.round(cg.y));
    if (cage.style.display === 'none') cage.style.display = '';
}
function ring(p) {
    const st = stage(); if (!st) return;
    const z = st.z;
    const e = document.createElement('div');
    e.className = 'hs-ring';
    e.style.left = Math.round((p.x - SEARCH_X) * z) + 'px';
    e.style.top = Math.round((p.y - SEARCH_Y * 1.6) * z) + 'px';
    e.style.width = Math.round(SEARCH_X * 2 * z) + 'px';
    e.style.height = Math.round(SEARCH_Y * 2 * z) + 'px';
    e.style.zIndex = '99999';
    st.el.appendChild(e);
    setTimeout(function () { e.remove(); }, 500);
}
function paintHud() {
    const ph = phase();
    let hud = document.getElementById('hs-hud');
    if (!hud) { hud = document.createElement('div'); hud.id = 'hs-hud'; document.body.appendChild(hud); }
    const t = srv() - (game.t0 || 0);
    const h = hiders(), left = h.filter(function (c) { return !caughtAt(c); }).length;
    let html = '';
    if (ph === 'count') {
        const n = Math.max(1, Math.ceil((COUNT_MS - t) / 1000));
        html = amSeeker() ? '👀 술래 — 눈을 감고 셉니다 · ' + n : '🍍 숨으세요! ' + n + '초<small>목록 이동은 안 됩니다 — 걸어서 · 술래가 세는 동안 다른 맵으로 가도 됩니다</small>';
    } else if (ph === 'seek') {
        const rest = mmss(COUNT_MS + SEEK_MS - t);
        if (amSeeker()) html = '🔍 찾는 중 ' + rest + ' · 남은 파인애플 ' + left + '/' + h.length + '<small>「찾기」를 누르면 둘레를 뒤집니다</small>';
        else if (caughtAt(myCode())) html = '🔒 잡혔습니다 · ' + rest + '<small>끝날 때까지 가두리 안에 있습니다</small>';
        else html = '🍍 숨어 있기 ' + rest + ' · 남은 파인애플 ' + left + '/' + h.length + '<small>찾기가 시작되어 다른 맵으로는 못 넘어갑니다</small>';
    } else html = '🫣 끝났습니다…';
    if (hud._h !== html) { hud.innerHTML = html; hud._h = html; }
    // 술래 가림막 — 세는 동안
    let bl = document.getElementById('hs-blind');
    if (ph === 'count' && amSeeker()) {
        if (!bl) { bl = document.createElement('div'); bl.id = 'hs-blind'; document.body.appendChild(bl); }
        const n = Math.max(1, Math.ceil((COUNT_MS - t) / 1000));
        const bh = '<div style="font-size:14px;">👀 당신이 술래입니다</div><div class="n">' + n + '</div><div style="font-size:11px;color:#9a9284;">눈을 감고 열다섯을 셉니다 · 끝나면 찾으러 갑니다</div>';
        if (bl._h !== bh) { bl.innerHTML = bh; bl._h = bh; }
    } else if (bl) bl.remove();
    // 찾기 단추 — 술래 · 찾는 동안
    let fb = document.getElementById('hs-find');
    if (ph === 'seek' && amSeeker()) {
        if (!fb) {
            fb = document.createElement('button'); fb.id = 'hs-find'; fb.textContent = '🔍 찾기';
            fb.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
            fb.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); window.hsFind(); });
            document.body.appendChild(fb);
        }
        fb.classList.toggle('cool', Date.now() - findAt < SEARCH_COOL);
    } else if (fb) fb.remove();
}
function paintClear() {
    ['hs-hud', 'hs-blind', 'hs-find'].forEach(function (id) { const e = document.getElementById(id); if (e) e.remove(); });
    if (drawn.box) drawn.box.remove();
    if (drawn.cage) drawn.cage.remove();
    drawn = { key: '', box: null, cage: null };
}

let raf = 0, slowT = 0;
function frame() {
    raf = 0;
    if (!hsOn || !game) return;
    try { paintObjs(); paintCage(); } catch (e) { }
    raf = requestAnimationFrame(frame);
}
function loopOn() {
    if (!raf) raf = requestAnimationFrame(frame);
    if (!slowT) slowT = setInterval(function () {
        if (!hsOn || !game) return;
        try { paintHud(); } catch (e) { }
        try { seekerBeat(); } catch (e) { }
        try { endCheck(); } catch (e) { }
    }, 250);
}
function loopOff() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (slowT) { clearInterval(slowT); slowT = 0; }
}

// ==========================================
// 결과
// ==========================================
function showResult(g, prize) {
    if (!g) return;
    const mem = g.mem || {};
    const hs = Object.keys(mem).filter(function (c) { return c !== g.seeker; });
    const cg = g.caught || {};
    const got = hs.filter(function (c) { return cg[c]; }).sort(function (a, b) { return cg[a] - cg[b]; });
    const safe = hs.filter(function (c) { return !cg[c]; });
    const nm = function (c) { return esc((mem[c] && mem[c].n) || nameOf(c)); };
    const why = (g.end && g.end.why === 'all') ? '술래가 모두 찾았습니다! 👀 술래의 승리' : '5분이 지났습니다. 🍍 끝까지 숨은 파인애플의 승리';
    closeOv('hs-res-ov');
    const ov = document.createElement('div');
    ov.className = 'hs-ov'; ov.id = 'hs-res-ov';
    ov.innerHTML = '<div class="hs-card hs-res"><h3>🫣 숨바꼭질 끝</h3>'
        + '<div>' + why + '</div>'
        + '<div>👀 술래 — <b>' + nm(g.seeker) + '</b></div>'
        + '<div>🔒 잡힌 파인애플 (' + got.length + ') — ' + (got.length ? got.map(nm).join(' · ') : '없음') + '</div>'
        + '<div>🍍 끝까지 숨은 파인애플 (' + safe.length + ') — ' + (safe.length ? safe.map(nm).join(' · ') : '없음') + '</div>'
        + (prize > 0 ? '<div style="color:#ffd479;">🎁 ' + PRIZE + ' ' + prize + '개를 받았습니다.</div>' : '')
        + '<div class="hs-btns"><button class="go" id="hs-res-x">확인</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#hs-res-x').onclick = function () { closeOv('hs-res-ov'); };
}
function closeOv(id) { const e = document.getElementById(id); if (e) e.remove(); }

// ==========================================
// 부르기 — 목록 「🫣 숨바꼭질」
// ==========================================
let pickSel = {};
window.hsOpen = function () {
    const u = me(); if (!u) return;
    if (hsOn) { toast('🫣 이미 숨바꼭질 중입니다.'); return; }
    // 내가 연 판이 아직 모이는 중이면 그 판을 보여 준다
    if (game && game.st === 'LOBBY' && game.host === u.code) { paintLobby(true); return; }
    const why = busyWhy(u);
    if (why) { alert_('🫣 숨바꼭질\n\n' + why); return; }
    pickSel = {};
    paintPick();
};
function onlineList() {
    const on = online(), U = users(), c = myCode();
    return Object.keys(on).filter(function (k) { return k !== c && U[k] && U[k].name; })
        .sort(function (a, b) { return String(nameOf(a)).localeCompare(String(nameOf(b))); });
}
function paintPick() {
    closeOv('hs-pick-ov');
    const list = onlineList();
    const ov = document.createElement('div');
    ov.className = 'hs-ov'; ov.id = 'hs-pick-ov';
    ov.innerHTML = '<div class="hs-card"><h3>🫣 숨바꼭질 — 부를 사람<button id="hs-pick-x">✕</button></h3>'
        + '<div class="hs-sub">접속한 사원을 골라 부릅니다. 받은 사람이 수락하면 함께합니다 (둘 이상 · 인원 제한 없음).<br>'
        + '시작하면 무작위 한 명이 술래(보통 크기), 나머지는 파인애플 크기로 작아집니다. 15초 동안 숨고, 술래가 5분 동안 찾습니다.</div>'
        + '<div class="hs-list">' + (list.length ? list.map(function (k) {
            return '<div class="hs-row' + (pickSel[k] ? ' on' : '') + '" data-c="' + esc(k) + '"><span class="ck">' + (pickSel[k] ? '✓' : '') + '</span>'
                + esc(nameOf(k)) + '<span class="st" style="color:#7a7a8a;">' + esc((users()[k] || {}).no || '') + '</span></div>';
        }).join('') : '<div class="hs-sub">지금 접속한 다른 사원이 없습니다.</div>') + '</div>'
        + '<div class="hs-btns"><button id="hs-pick-all">모두 고르기</button><button class="go" id="hs-pick-go"' + (Object.keys(pickSel).length ? '' : ' disabled') + '>부르기 (' + Object.keys(pickSel).length + ')</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#hs-pick-x').onclick = function () { closeOv('hs-pick-ov'); };
    ov.addEventListener('click', function (e) { if (e.target === ov) closeOv('hs-pick-ov'); });
    Array.prototype.forEach.call(ov.querySelectorAll('.hs-row'), function (r) {
        r.onclick = function () { const c = r.dataset.c; if (pickSel[c]) delete pickSel[c]; else pickSel[c] = 1; paintPick(); };
    });
    ov.querySelector('#hs-pick-all').onclick = function () { list.forEach(function (k) { pickSel[k] = 1; }); paintPick(); };
    ov.querySelector('#hs-pick-go').onclick = sendInvites;
}
function sendInvites() {
    const u = me(), d = db_();
    if (!u || !d) return;
    const codes = Object.keys(pickSel);
    if (!codes.length) return;
    const why = busyWhy(u);
    if (why) { alert_('🫣 숨바꼭질\n\n' + why); return; }
    const id = 'hs' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const inv = {};
    codes.forEach(function (c) { inv[c] = { n: nameOf(c), st: 'wait' }; });
    const mem = {}; mem[u.code] = { n: nameOf(u.code) };
    const g = { id: id, host: u.code, hostName: nameOf(u.code), at: srv(), st: 'LOBBY', inst: 7000 + Math.floor(Math.random() * 2000), inv: inv, mem: mem };
    const up = {};
    up[G + '/' + id] = g;
    codes.forEach(function (c) { up[INV + '/' + c + '/' + id] = { from: u.code, fromName: nameOf(u.code), at: srv() }; });
    d.ref('/').update(up).then(function () {
        closeOv('hs-pick-ov');
        watchGame(id);
        toast('🫣 ' + codes.length + '명을 불렀습니다.');
    }).catch(function (e) { console.warn('[숨바꼭질] 부르기 실패', e); alert_('부르지 못했습니다.'); });
}

// ── 모이는 판 (부른 사람 화면)
function paintLobby(force) {
    if (!game || game.st !== 'LOBBY' || game.host !== myCode()) return;
    let ov = document.getElementById('hs-lobby-ov');
    if (!ov && !force && paintLobby._closed === game.id) return;     // 닫아 둔 사람에게 다시 들이밀지 않는다 (목록에서 다시 열 수 있다)
    const inv = game.inv || {};
    const okN = Object.keys(inv).filter(function (c) { return inv[c].st === 'ok'; }).length;
    const html = '<div class="hs-card"><h3>🫣 숨바꼭질 — 모이는 중<button id="hs-lb-x">✕</button></h3>'
        + '<div class="hs-sub">수락한 사람이 한 명 이상이면 시작할 수 있습니다. 시작하면 아직 답하지 않은 사람은 빠집니다.</div>'
        + '<div class="hs-list">' + Object.keys(inv).map(function (c) {
            const st = inv[c].st;
            const tag = st === 'ok' ? '<span class="st" style="color:#8bd48b;">수락</span>' : st === 'no' ? '<span class="st" style="color:#e58a8a;">거절</span>'
                : '<span class="st" style="color:#a9a090;">기다리는 중…</span>';
            return '<div class="hs-row" style="cursor:default;">' + esc(inv[c].n || nameOf(c)) + tag + '</div>';
        }).join('') + '</div>'
        + '<div class="hs-btns"><button id="hs-lb-cancel">취소</button><button class="go" id="hs-lb-go"' + (okN ? '' : ' disabled') + '>시작 (' + (okN + 1) + '명)</button></div></div>';
    if (!ov) {
        ov = document.createElement('div'); ov.className = 'hs-ov'; ov.id = 'hs-lobby-ov';
        document.body.appendChild(ov);
    }
    if (ov._h === html) return;
    ov._h = html;
    ov.innerHTML = html;
    ov.querySelector('#hs-lb-x').onclick = function () { paintLobby._closed = game && game.id; closeOv('hs-lobby-ov'); };
    ov.querySelector('#hs-lb-cancel').onclick = cancelLobby;
    ov.querySelector('#hs-lb-go').onclick = startGame;
}
function hideLobby() { closeOv('hs-lobby-ov'); }
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
    const why = busyWhy(u);
    if (why) { alert_('🫣 숨바꼭질\n\n' + why); return; }
    const here = roomNow();
    const R = rooms();
    const room = (here && R[here] && !R[here].photo) ? here : 'plaza';
    const id = game.id;
    d.ref(G + '/' + id).transaction(function (cur) {
        if (cur === null) return null;                 // 아직 내 화면에 없으면 서버 값으로 다시 부르게 (위 수락과 같은 까닭)
        if (cur.st !== 'LOBBY') return;
        const mem = cur.mem || {};
        Object.keys(cur.inv || {}).forEach(function (c) { if (cur.inv[c].st === 'ok') mem[c] = { n: cur.inv[c].n || c }; });
        const codes = Object.keys(mem);
        if (codes.length < 2) return;
        cur.mem = mem;
        cur.seeker = codes[Math.floor(Math.random() * codes.length)];
        cur.st = 'PLAY';
        cur.room = room;
        cur.t0 = srv() + 1500;          // 모두가 방에 들어설 틈
        cur.caught = null; cur.sk = { r: room, lv: 0 };
        return cur;
    }).then(function (res) {
        if (!res || !res.committed || !res.snapshot || !res.snapshot.val() || res.snapshot.val().st !== 'PLAY') { alert_('시작하지 못했습니다. (수락한 사람이 있어야 합니다)'); return; }
        const inv = (res.snapshot.val() || {}).inv || {};
        const up = {};
        Object.keys(inv).forEach(function (c) { up[INV + '/' + c + '/' + id] = null; });
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
    invRef.on('child_removed', function (s) { if (asked[s.key] === 'open') closeOv('hs-ask-' + s.key); });
}
function onInvite(id, v) {
    if (!v || asked[id]) return;
    const d = db_(); if (!d) return;
    if (srv() - (Number(v.at) || 0) > INV_TTL) { d.ref(INV + '/' + myCode() + '/' + id).remove(); return; }
    asked[id] = 'open';
    const ov = document.createElement('div');
    ov.className = 'hs-ov'; ov.id = 'hs-ask-' + id;
    ov.innerHTML = '<div class="hs-card"><h3>🫣 숨바꼭질 초대</h3>'
        + '<div><b style="color:#ffe9bd;">' + esc(v.fromName || nameOf(v.from)) + '</b> 사원이 숨바꼭질에 불렀습니다.</div>'
        + '<div class="hs-sub">한 명은 술래(보통 크기), 나머지는 파인애플 크기로 작아져 숨습니다. 15초 숨기 · 5분 찾기 · 이름표는 안 보입니다.</div>'
        + '<div class="hs-btns"><button id="hs-ask-no">안 한다</button><button class="go" id="hs-ask-ok">같이 한다</button></div></div>';
    document.body.appendChild(ov);
    const done = function () { asked[id] = 'done'; closeOv('hs-ask-' + id); try { d.ref(INV + '/' + myCode() + '/' + id).remove(); } catch (e) { } };
    ov.querySelector('#hs-ask-no').onclick = function () {
        d.ref(G + '/' + id + '/inv/' + myCode() + '/st').transaction(function (cur) { return cur === 'wait' ? 'no' : cur; }).catch(function () { });
        done();
    };
    ov.querySelector('#hs-ask-ok').onclick = function () {
        const why = busyWhy(me());
        if (why) { alert_('🫣 숨바꼭질\n\n' + why); return; }
        if (hsOn) { alert_('🫣 이미 다른 숨바꼭질 중입니다.'); return; }
        const c = myCode();
        // ★ 2026-11-03 사용자 「숨바꼭질 하려고 하면 여전히 시작했거나 끝났다고만 뜬다」
        //   초대받은 사람 화면은 그 판을 아직 듣고 있지 않다. 진짜 Firebase 트랜잭션은 그럴 때 **처음엔 null 로** 부르는데,
        //   거기서 undefined 를 돌려주면 서버 값을 보지도 않고 접어 버려 늘 「이미 시작했거나 끝난」이 떴다
        //   (시험 화면은 한 브라우저라 부른 사람의 판 번호를 같이 들고 있어 안 났다).
        //   null 이면 null 을 돌려줘 서버 값으로 다시 부르게 하고, 다 끝난 뒤 정말 수락으로 적혔는지 본다.
        d.ref(G + '/' + id).transaction(function (cur) {
            if (cur === null) return null;
            if (cur.st !== 'LOBBY' || !cur.inv || !cur.inv[c]) return;
            if (srv() - (Number(cur.at) || 0) > LOBBY_TTL) return;
            cur.inv[c].st = 'ok';
            return cur;
        }).then(function (res) {
            done();
            const v = res && res.snapshot ? res.snapshot.val() : null;
            if (!res || !res.committed || !v || !v.inv || !v.inv[c] || v.inv[c].st !== 'ok') { alert_('🫣 이미 시작했거나 끝난 숨바꼭질입니다.'); return; }
            watchGame(id);
            toast('🫣 수락했습니다. 부른 사람이 시작하기를 기다립니다.');
        }).catch(function () { done(); });
    };
}

// ── 다시 들어왔을 때 — 하던 판이 있으면 이어서
setInterval(function () {
    try { watchInv(); } catch (e) { }
    if (!gid && myCode()) {
        const id = ls(gidKey());
        if (id) watchGame(id);
    }
    // 묵은 모이는 판 — 부른 사람이 오래 손대지 않았으면 취소한다
    if (game && game.st === 'LOBBY' && game.host === myCode() && srv() - (Number(game.at) || 0) > LOBBY_TTL) cancelLobby();
}, 1500);

window.hsLayout = function (room) { return game ? layout(room || roomNow()) : []; };
window.hsState = function () {
    console.log('%c===== 🫣 숨바꼭질 =====', 'color:#ffd479; font-size:13px');
    if (!game) { console.log('  판 없음'); return; }
    console.log('  판', game.id, '·', game.st, '· 단계', phase() || '-', '· 놀이 방 번호', game.inst, '· 켜짐', hsOn);
    console.log('  술래', game.seeker && nameOf(game.seeker), '· 방', game.sk && game.sk.r);
    console.table(Object.keys(game.mem || {}).map(function (c) { return { 사번: c, 이름: nameOf(c), 역할: c === game.seeker ? '술래' : '파인애플', 잡힘: caughtAt(c) ? '🔒' : '' }; }));
    const st = stage();
    if (st) console.log('  이 방 오브젝트', layout(st.room).length);
};

console.log('[숨바꼭질] 목록 「생활」 🫣 숨바꼭질 — hsState()');
})();
