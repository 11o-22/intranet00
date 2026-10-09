// ==========================================
// ★ 🀄 마작 — 판 진행 (2·3·4인 실시간 동풍전)
// bundles.json 마지막 묶음, mj-core.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// 이 파일에는 화면이 없다. 자리를 만들고, 패를 돌리고, 차례를 넘기고,
// 후로를 가리고, 점수를 옮기는 일만 한다. 그리는 것은 mj-ui.js 가 한다.
//
// ■ 어디에 적히나
//
//   mjTables/<판>
//       state   WAIT | PLAY | DONE
//       seats   [{code,name}…]        차례 = 동 남 서 북
//       players 2 | 3 | 4
//       kyoku   1..players            동풍전 — 사람 수만큼 한다
//       honba, sticks                 본장 · 리치봉
//       scores  { 사번: 점수 }
//       h       지금 국 (아래)
//       result  끝난 뒤 순위
//
//   h (지금 국)
//       wall, dead, doraInd, uraInd   산 · 왕패 · 도라
//       hands   { 사번: [패…] }
//       melds   { 사번: [후로…] }
//       pond    { 사번: [버린패…] }
//       riichi  { 사번: 버린 순번 }
//       turn    자리 번호 · turnAt 차례가 된 때
//       phase   DRAW | DISCARD | CLAIM | END
//       last    { by, tile, at }      마지막으로 버린 패
//       claims  { 사번: {kind, tiles} }
//
// ■ 누가 셈하나
//
//   따로 심판을 두지 않는다. **모든 손질이 트랜잭션 한 번**이고, 손질마다
//   지금 상태가 맞는지 다시 본다. 그래서 누가 끊겨도 판이 멈추지 않는다.
//   차례인 사람이 시간을 넘기면 **아무나** 쯔모기리를 대신 눌러 줄 수 있다.
//
// ■ 2·3인 규칙
//
//   2인·3인은 북과 만수 2~8 을 뺀다. 치(吃)는 없다. 동풍전은 사람 수만큼.
//
// ■ 숨김에 대하여
//
//   파이어베이스를 그대로 쓰므로, 콘솔을 열면 남의 손패를 볼 수 있다.
//   이 게임의 다른 자료도 전부 그렇다. 막으려면 서버가 따로 있어야 한다.
//
// ■ 콘솔
//   mjTables()        지금 열린 자리
//   mjState()         내가 앉은 판의 속
//   mjForce()         차례인 사람이 굳었을 때 떠밀기

window.MJ_PLAY = {
    start: 25000,           // 시작 점수
    turnSec: 25,            // 한 차례에 주는 시간
    claimSec: 15,           // 후로(폰·치·깡·론)를 기다려 주는 시간
    graceSec: 4,            // 이 시간이 더 지나면 아무나 떠밀 수 있다
    payout: 'diff'          // 'diff' 최종점수 − 시작점수를 포인트로 / 'none' 안 줌
};

(function mjPlay() {

const P = window.MJ_PLAY;
const ROOT = 'mjTables';
const WINDS = [27, 28, 29, 30];      // 동 남 서 북

function db_() { return (typeof database !== 'undefined') ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function now() { return Date.now(); }
// ★ 트랜잭션을 거는 동안 그 자리를 **지켜보고 있어야 한다.**
//
//   파이어베이스는 트랜잭션 함수를 먼저 **내 쪽에 남아 있는 값**으로 한 번
//   돌려 본다. 그 자리를 한 번도 읽어 본 적이 없으면 그 값은 null 이다.
//   아래 함수들은 하나같이 `if (!t) return;` 으로 시작하는데, undefined 를
//   돌려주면 그것은 「그만둔다」는 뜻이다. 서버에 닿아 보지도 못하고 끝난다.
//
//   남이 만든 자리에 앉으려 할 때 그 자리를 읽은 적이 없으니 늘 null 이었다.
//   그래서 「그 자리에는 앉을 수 없습니다」가 떴다. 패를 가져오고 버리는
//   것도 같은 길을 쓰므로 판에 붙기 전에는 전부 같은 꼴이었다.
//
//   ★ once('value') 로는 모자란다. once 는 읽고 **바로 떼기** 때문에 그 값이
//     내 쪽에 남지 않는다. 파이어베이스는 지켜보기가 붙어 있는 동안만 값을
//     들고 있다. 그래서 once 로 읽어도 트랜잭션은 여전히 null 로 시작했다.
//
//     그래서 트랜잭션을 거는 동안만 **살아 있는 지켜보기**를 하나 붙여 둔다.
//     첫 소식이 온 뒤에 걸고, 끝나면 뗀다. 그동안은 값이 내 쪽에 남아 있으므로
//     첫 굴림부터 진짜 자료를 본다. (판에 붙은 뒤로는 watch 가 그 일을 한다.
//      앉기 전에는 아무도 안 보고 있어서 앉기만 늘 실패했다.)
function tx(path, fn) {
    const d = db_();
    if (!d) return Promise.resolve({ committed: false, snapshot: null });
    const ref = d.ref(path);
    // 지워진 빈 칸을 세워서 넘긴다 — 안쪽 함수들이 h.pond 같은 것을 그냥 쓴다
    const F = function (v) { return fn(norm(v)); };
    const run = function () {
        if (typeof txRetry === 'function') return txRetry(path, F);
        return ref.transaction(F, null, false);
    };
    // 이미 그 자리를 지켜보고 있으면(판에 앉은 뒤) 값이 내 쪽에 있다 — 바로 건다
    if (watchRef && cur && cur.id && path === ROOT + '/' + cur.id) return run();

    let held = false, fired = false, go = null;
    // 뗄 때 같은 함수를 넘겨야 떨어진다 — 그래서 하나로 둔다
    const keep = function () { if (fired || !go) return; fired = true; go(); };
    const drop = function () { if (!held) return; held = false; try { ref.off('value', keep); } catch (e) { } };

    return new Promise(function (resolve) {
        go = resolve;
        try { ref.on('value', keep, keep); held = true; } catch (e) { keep(); }
        setTimeout(keep, 4000);             // 소식이 안 와도 마냥 기다리지 않는다
    }).then(run).then(function (r) { drop(); return r; },
            function (e) { drop(); throw e; });
}
// ★ 파이어베이스는 **빈 칸을 지운다.**
//
//   패를 돌리면 h.melds · h.pond · h.riichi · h.ippatsu 는 모두 빈 채로
//   시작한다. 빈 배열은 지워지고, 그래서 그 묶음 자체도 통째로 없어진다.
//   돌아온 자료에는 pond 라는 칸이 아예 없다. 그 뒤로
//
//       arr(h.pond[x.code])        ← h.pond 가 undefined
//
//   가 터진다. 「판을 그리다 터졌습니다」가 이것이었다.
//
//   지워진 빈 칸을 도로 세운다. 읽는 자리(watch)와 쓰는 자리(tx) 양쪽에서
//   한 번씩 거치므로, 그 뒤로는 어디서든 그냥 써도 된다.
function norm(t) {
    if (!t || typeof t !== 'object') return t;
    if (!t.scores) t.scores = {};
    if (!t.seats) t.seats = [];
    else if (!Array.isArray(t.seats)) t.seats = arr(t.seats);
    const h = t.h;
    if (h) {
        ['hands', 'melds', 'pond', 'riichi', 'ippatsu', 'claims'].forEach(function (k) {
            if (k === 'claims') return;                 // claims 는 없을 수 있다 (후로 창이 없을 때)
            if (!h[k] || typeof h[k] !== 'object') h[k] = {};
        });
        ['wall', 'dead', 'doraInd', 'uraInd'].forEach(function (k) {
            if (!Array.isArray(h[k])) h[k] = arr(h[k]);
        });
    }
    return t;
}

function clone(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; } }
function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

// 지금 내가 앉은 판
let cur = null;             // { id, t }
let watchRef = null;
window.mjCur = function () { return cur; };

function seatOf(t, code) {
    const s = arr(t.seats);
    for (let i = 0; i < s.length; i++) if (s[i] && s[i].code === code) return i;
    return -1;
}
function codeAt(t, i) { const s = arr(t.seats)[i]; return s ? s.code : null; }
function nameAt(t, i) { const s = arr(t.seats)[i]; return s ? s.name : '?'; }
// 자풍 — 국마다 한 자리씩 돈다
function windOf(t, seat) {
    const n = t.players;
    const d = ((seat - (t.kyoku - 1)) % n + n) % n;
    return WINDS[d];
}
function dealerSeat(t) { return (t.kyoku - 1) % t.players; }
function canChi(t) { return t.players === 4; }

// ==========================================
// 자리 만들기 · 들어가기
// ==========================================
// ★ 앉을 때 쓰는 이름은 **적힌 id 가 아니라 자리 이름(열쇠)** 이다.
//   둘이 어긋나면 목록에는 보이는데 앉으려 하면 없는 자리를 더듬는다.
//   («그 자리가 없어졌습니다»)
function listTables() {
    if (!db_()) return Promise.resolve([]);
    return db_().ref(ROOT).once('value').then(function (s) {
        const v = s.val() || {};
        return Object.keys(v).map(function (k) {
            let t = v[k];
            if (!t || typeof t !== 'object') return null;
            if (t.id !== k) t = Object.assign({}, t, { id: k });   // 열쇠를 믿는다
            return t;
        }).filter(function (t) {
            if (!t || !t.id) return false;
            if (!t.players || !t.seats) return false;              // 자리 모양이 아니면 거른다
            return t.state !== 'DONE' && now() - (t.made || 0) < 3 * 3600000;
        }).sort(function (a, b) { return (a.made || 0) - (b.made || 0); });
    });
}
window.mjListTables = listTables;

function makeTable(players) {
    const u = me();
    if (!u || !db_()) return Promise.resolve(null);
    const n = Math.max(2, Math.min(4, Number(players) || 4));
    const id = 'mj' + now().toString(36) + Math.floor(Math.random() * 1000);
    const t = {
        id: id, host: u.code, made: now(), state: 'WAIT', players: n,
        seats: [{ code: u.code, name: u.name }],
        kyoku: 1, honba: 0, sticks: 0,
        scores: (function () { const o = {}; o[u.code] = P.start; return o; })()
    };
    return db_().ref(ROOT + '/' + id).set(t).then(function () { watch(id); return id; });
}
window.mjMake = makeTable;

function joinTable(id) {
    const u = me();
    if (!u || !db_()) return Promise.resolve(false);
    window._mjJoinWhy = '';
    return tx(ROOT + '/' + id, function (t) {
        if (!t) { window._mjJoinWhy = '그 자리가 없어졌습니다.'; return; }
        if (t.state !== 'WAIT') { window._mjJoinWhy = '벌써 시작한 판입니다.'; return; }
        const s = arr(t.seats);
        if (s.some(function (x) { return x && x.code === u.code; })) { window._mjJoinWhy = ''; return t; }
        if (s.length >= t.players) { window._mjJoinWhy = '자리가 다 찼습니다.'; return; }
        window._mjJoinWhy = '';
        s.push({ code: u.code, name: u.name });
        t.seats = s;
        t.scores = t.scores || {};
        t.scores[u.code] = P.start;
        if (s.length === t.players) { t.state = 'PLAY'; deal(t); }
        return t;
    }).then(function (r) {
        if (r && r.committed) { watch(id); return true; }
        // 왜 안 됐는지 콘솔에 자리 이름과 서버에 정말 있는지까지 남긴다
        return db_().ref(ROOT + '/' + id).once('value').then(function (s) {
            const v = s.val();
            console.warn('[마작] 앉지 못했습니다 — 자리 "' + id + '" · 까닭: '
                + (window._mjJoinWhy || '(없음)') + ' · 서버에 있나: ' + (v ? 'O' : '✗'));
            if (v) console.warn('   서버 쪽 모습:', JSON.stringify(v).slice(0, 300));
            return false;
        }).catch(function () { return false; });
    });
}
window.mjJoin = joinTable;

function leaveTable() {
    const u = me();
    if (!u || !cur || !db_()) return Promise.resolve();
    const id = cur.id;
    return tx(ROOT + '/' + id, function (t) {
        if (!t) return;
        const s = arr(t.seats).filter(function (x) { return x && x.code !== u.code; });
        if (t.state === 'PLAY') { t.state = 'DONE'; t.result = { aborted: true, by: u.code }; return t; }
        if (!s.length) return null;                 // 아무도 없으면 자리를 치운다
        t.seats = s;
        if (t.host === u.code) t.host = s[0].code;
        return t;
    }).then(function () { unwatch(); });
}
window.mjLeave = leaveTable;

function watch(id) {
    if (!db_()) return;
    unwatch();
    cur = { id: id, t: null };
    watchRef = db_().ref(ROOT + '/' + id);
    watchRef.on('value', function (s) {
        const t = norm(s.val());
        if (!t) { unwatch(); fire(); return; }
        cur.t = t;
        fire();
        try { tick(); } catch (e) { console.warn('[마작]', e); }
    });
}
function unwatch() {
    if (watchRef) { try { watchRef.off(); } catch (e) { } watchRef = null; }
    cur = null;
}
window.mjWatch = watch;
window.mjUnwatch = unwatch;

function fire() {
    // 삼키면 「눌러도 아무 일이 없다」가 된다 — 터진 것은 남긴다
    try { if (typeof window.mjOnChange === 'function') window.mjOnChange(cur && cur.t); }
    catch (e) { window._mjLastError = String((e && e.message) || e); console.error('[마작] 화면 그리기', e); }
}

// tick 은 자료가 바뀔 때만 돌았다. 그래서 「아무도 아무것도 안 하면」
// 기다림이 영영 안 끝났다. 앉아 있는 동안 1초에 한 번 떠민다.
setInterval(function () {
    if (!cur || !cur.t) return;
    try { tick(); } catch (e) { }
}, 1000);

// 들어오면 내가 앉아 있던 자리를 찾아 붙는다
(function rejoin() {
    const iv = setInterval(function () {
        if (!db_() || !me() || cur) return;
        db_().ref(ROOT).once('value').then(function (s) {
            if (cur) return;
            const v = s.val() || {};
            const mine = Object.keys(v).map(function (k) { return v[k]; }).filter(function (t) {
                return t && t.state !== 'DONE' && seatOf(t, me().code) >= 0;
            })[0];
            if (mine) watch(mine.id);
        }).catch(function () { });
    }, 4000);
    setTimeout(function () { clearInterval(iv); }, 10 * 60000);
})();

// ==========================================
// 국 시작 — 패를 돌린다
// ==========================================
function deal(t) {
    const wall = shuffle(window.mjBuildWall(t.players));
    const dead = wall.splice(0, 14);                 // 왕패
    const h = {
        wall: wall, dead: dead,
        doraInd: [dead[0]], uraInd: [dead[1]],
        hands: {}, melds: {}, pond: {}, riichi: {},
        turn: dealerSeat(t), turnAt: now(), phase: 'DRAW',
        last: null, claims: null, drawn: null, kans: 0, firstGo: true
    };
    arr(t.seats).forEach(function (s) {
        h.hands[s.code] = wall.splice(0, 13).sort(function (a, b) { return a - b; });
        h.melds[s.code] = [];
        h.pond[s.code] = [];
    });
    t.h = h;
    return t;
}

// ==========================================
// 내 차례인가 · 내 패
// ==========================================
function myState() {
    const u = me();
    if (!cur || !cur.t || !u) return null;
    const t = cur.t, h = t.h;
    if (!h) return { t: t, seat: seatOf(t, u.code), h: null };
    const seat = seatOf(t, u.code);
    return {
        t: t, h: h, seat: seat,
        hand: arr(h.hands && h.hands[u.code]),
        melds: arr(h.melds && h.melds[u.code]),
        mine: (h.turn === seat),
        phase: h.phase,
        riichi: !!(h.riichi && h.riichi[u.code])
    };
}
window.mjMy = myState;

// ==========================================
// 뽑기
// ==========================================
function draw() {
    const u = me(); if (!u || !cur) return;
    const id = cur.id;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        const seat = seatOf(t, u.code);
        if (h.turn !== seat || h.phase !== 'DRAW') return;
        const wall = arr(h.wall);
        if (!wall.length) { endDraw(t); return t; }
        const tile = wall.shift();
        h.wall = wall;
        h.drawn = tile;
        const hand = arr(h.hands[u.code]); hand.push(tile);
        h.hands[u.code] = hand;
        h.phase = 'DISCARD';
        h.turnAt = now();
        return t;
    });
}
window.mjDraw = draw;

// ==========================================
// 버리기
// ==========================================
function discard(tile) {
    const u = me(); if (!u || !cur) return;
    const id = cur.id;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        const seat = seatOf(t, u.code);
        if (h.turn !== seat || h.phase !== 'DISCARD') return;
        const hand = arr(h.hands[u.code]);
        const i = hand.indexOf(tile);
        if (i < 0) return;
        hand.splice(i, 1);
        h.hands[u.code] = hand.sort(function (a, b) { return a - b; });
        const pond = arr(h.pond[u.code]); pond.push(tile);
        h.pond[u.code] = pond;
        h.drawn = null;
        h.last = { by: seat, tile: tile, at: now() };
        h.claims = {};
        h.phase = 'CLAIM';
        h.turnAt = now();
        return t;
    });
}
window.mjDiscard = discard;

// 리치를 걸고 버린다
function riichiDiscard(tile) {
    const u = me(); if (!u || !cur) return;
    const id = cur.id;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        const seat = seatOf(t, u.code);
        if (h.turn !== seat || h.phase !== 'DISCARD') return;
        if (h.riichi && h.riichi[u.code]) return;
        if (arr(h.melds[u.code]).length) return;                    // 문전이어야 한다
        if ((t.scores[u.code] || 0) < 1000) return;
        const hand = arr(h.hands[u.code]);
        const i = hand.indexOf(tile);
        if (i < 0) return;
        const after = hand.slice(); after.splice(i, 1);
        if (window.mjShanten(after, 0) !== 0) return;                // 텐파이여야 한다

        hand.splice(i, 1);
        h.hands[u.code] = hand.sort(function (a, b) { return a - b; });
        const pond = arr(h.pond[u.code]); pond.push(tile);
        h.pond[u.code] = pond;
        h.riichi = h.riichi || {};
        h.riichi[u.code] = pond.length;                              // 몇 번째로 버렸나
        h.ippatsu = h.ippatsu || {};
        h.ippatsu[u.code] = true;
        t.scores[u.code] = (t.scores[u.code] || 0) - 1000;
        t.sticks = (t.sticks || 0) + 1;
        h.drawn = null;
        h.last = { by: seat, tile: tile, at: now(), riichi: true };
        h.claims = {};
        h.phase = 'CLAIM';
        h.turnAt = now();
        return t;
    });
}
window.mjRiichi = riichiDiscard;

// ==========================================
// 후로 — 폰 · 치 · 깡 · 론 · 넘김
// ==========================================
function claim(kind, tiles) {
    const u = me(); if (!u || !cur) return;
    const id = cur.id;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        if (h.phase !== 'CLAIM' || !h.last) return;
        if (seatOf(t, u.code) === h.last.by) return;
        h.claims = h.claims || {};
        h.claims[u.code] = { kind: kind, tiles: tiles || null, at: now() };
        return t;
    }).then(function () { setTimeout(function () { try { tick(); } catch (e) { } }, 60); });
}
window.mjClaim = claim;
window.mjPass = function () { return claim('pass'); };

// 어느 자리가 지금 버린 패로 할 수 있는 후로 — 자리 번호로 묻는다.
// 내 것만 보던 것을 **아무 자리나** 볼 수 있게 바꿨다. 기다릴 사람이
// 정말 있는지 tick 이 알아야 하기 때문이다. (아래 claim 창 설명 참고)
function claimsFor(t, h, seat) {
    if (!h || h.phase !== 'CLAIM' || !h.last) return null;
    const code = codeAt(t, seat);
    if (!code || seat === h.last.by) return null;
    const tile = h.last.tile;
    const hand = arr(h.hands && h.hands[code]);
    const melds = arr(h.melds && h.melds[code]);
    const c = {};
    const cnt = hand.filter(function (x) { return x === tile; }).length;

    // 론
    if (window.mjShanten(hand.concat([tile]), melds.length) === -1 && !furiten(t, h, code, hand, melds)) {
        const r = window.mjScore(winArgs(t, h, code, tile, false));
        if (r && r.ok) c.ron = r;
    }
    if (!(h.riichi && h.riichi[code])) {
        if (cnt >= 2) c.pon = [tile, tile];
        if (cnt >= 3) c.kan = [tile, tile, tile];
        if (canChi(t) && ((seat - h.last.by + t.players) % t.players) === 1 && tile < 27) {
            const opts = [];
            [[-2, -1], [-1, 1], [1, 2]].forEach(function (d) {
                const a = tile + d[0], b = tile + d[1];
                if (Math.floor(a / 9) !== Math.floor(tile / 9) || Math.floor(b / 9) !== Math.floor(tile / 9)) return;
                if (a < 0 || b > 26) return;
                if (hand.indexOf(a) >= 0 && hand.indexOf(b) >= 0) opts.push([a, b]);
            });
            if (opts.length) c.chi = opts;
        }
    }
    return Object.keys(c).length ? c : null;
}

// 내가 지금 할 수 있는 후로
function claimable() {
    const s = myState();
    if (!s || !s.h) return null;
    const u = me();
    if (s.h.claims && s.h.claims[u.code]) return null;
    return claimsFor(s.t, s.h, s.seat);
}
window.mjCanClaim = claimable;

// 후리텐 — 내가 기다리는 패를 내가 이미 버렸나
function furiten(t, h, code, hand, melds) {
    const w = window.mjWaits(hand, (melds || []).length);
    const mine = arr(h.pond && h.pond[code]);
    return w.some(function (x) { return mine.indexOf(x) >= 0; });
}

function winArgs(t, h, code, tile, tsumo) {
    const seat = seatOf(t, code);
    const melds = arr(h.melds[code]).map(function (m) {
        return { type: m.type, tiles: arr(m.tiles) };
    });
    const hand = arr(h.hands[code]).slice();
    if (tsumo) { const i = hand.indexOf(tile); if (i >= 0) hand.splice(i, 1); }
    const riichi = !!(h.riichi && h.riichi[code]);
    return {
        hand: hand, melds: melds, win: tile, tsumo: !!tsumo,
        seat: windOf(t, seat), round: 27,
        riichi: riichi, ippatsu: riichi && !!(h.ippatsu && h.ippatsu[code]),
        doubleRiichi: riichi && (h.riichi[code] === 1),
        rinshan: !!h.rinshan, haitei: tsumo && arr(h.wall).length === 0,
        houtei: !tsumo && arr(h.wall).length === 0,
        doraInd: arr(h.doraInd), uraInd: riichi ? arr(h.uraInd) : [],
        aka: 0, players: t.players
    };
}
window.mjWinArgs = winArgs;

// 쯔모 화료
function tsumoWin() {
    const u = me(); if (!u || !cur) return;
    const t = cur.t, h = t && t.h;
    if (!h || h.phase !== 'DISCARD' || h.turn !== seatOf(t, u.code)) return;
    const r = window.mjScore(winArgs(t, h, u.code, h.drawn, true));
    if (!r || !r.ok) { if (typeof showCustomAlert === 'function') showCustomAlert('역이 없습니다.'); return; }
    return settleWin(u.code, null, r);
}
window.mjTsumo = tsumoWin;

// ==========================================
// 진행 — 차례마다 한 번씩 돈다
// ==========================================
// 울기 창이 열린 것을 **내가 처음 본 때** (기기 시계 차이를 타지 않게)
const claimSeen = { key: '', at: 0 };
window.mjClaimLeft = function () {
    const t = cur && cur.t, h = t && t.h;
    if (!h || h.phase !== 'CLAIM' || !h.last) return 0;
    const key = h.last.by + '|' + h.last.tile + '|' + (h.last.at || 0);
    if (claimSeen.key !== key) return P.claimSec;
    return Math.max(0, Math.ceil((P.claimSec * 1000 - (now() - claimSeen.at)) / 1000));
};

function tick() {
    const u = me(); if (!u || !cur || !cur.t) return;
    const t = cur.t, h = t.h;
    if (t.state !== 'PLAY' || !h) return;

    if (h.phase === 'CLAIM') {
        // ★ 「폰이 안 뜬다」의 자리였다.
        //
        //   예전에는 기다리는 시간을 now() − h.turnAt 으로 쟀다.
        //   h.turnAt 은 **버린 사람의 시계**로 적힌 때다. 내 기기 시계가
        //   몇 초만 앞서 있어도 창이 열리자마자 다 지난 것으로 보여
        //   그 자리에서 닫혔다. 그러면 폰 단추는 한 번도 안 뜬다.
        //
        //   그리고 아무도 울 수 없는 평범한 버림에도 claimSec 만큼
        //   멍하니 기다렸다. 그래서 두 가지를 바꿨다.
        //
        //     · 울 수 있는 사람이 하나도 없으면 **바로** 넘긴다 (빠르다)
        //     · 울 수 있는 사람이 있으면, 기다린 시간을 **내 시계로만**
        //       잰다 — 창이 열린 것을 내가 처음 본 때부터
        let waiting = 0;
        for (let i = 0; i < t.players; i++) {
            if (i === h.last.by) continue;
            const code = codeAt(t, i);
            if (!code) continue;
            if (h.claims && h.claims[code]) continue;       // 이미 답했다
            try { if (claimsFor(t, h, i)) waiting++; } catch (e) { waiting++; }
        }
        if (!waiting) { resolveClaims(); return; }

        const key = h.last.by + '|' + h.last.tile + '|' + (h.last.at || 0);
        if (claimSeen.key !== key) { claimSeen.key = key; claimSeen.at = now(); }
        if (now() - claimSeen.at > P.claimSec * 1000) resolveClaims();
        return;
    }
    // 차례인 사람이 굳었다 — 아무나 떠민다
    const limit = (P.turnSec + P.graceSec) * 1000;
    if (now() - (h.turnAt || 0) > limit) forceTurn();
}

function forceTurn() {
    const id = cur && cur.id; if (!id) return;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        if (now() - (h.turnAt || 0) <= (P.turnSec + P.graceSec) * 1000) return;
        const code = codeAt(t, h.turn);
        if (!code) return;
        if (h.phase === 'DRAW') {
            const wall = arr(h.wall);
            if (!wall.length) { endDraw(t); return t; }
            const tile = wall.shift();
            h.wall = wall; h.drawn = tile;
            const hand = arr(h.hands[code]); hand.push(tile);
            h.hands[code] = hand;
            h.phase = 'DISCARD'; h.turnAt = now();
            return t;
        }
        if (h.phase === 'DISCARD') {
            // 쯔모기리 — 뽑은 것을 그대로 버린다
            const hand = arr(h.hands[code]);
            const tile = (h.drawn != null) ? h.drawn : hand[hand.length - 1];
            const i = hand.indexOf(tile);
            if (i >= 0) hand.splice(i, 1);
            h.hands[code] = hand.sort(function (a, b) { return a - b; });
            const pond = arr(h.pond[code]); pond.push(tile);
            h.pond[code] = pond;
            h.drawn = null;
            h.last = { by: h.turn, tile: tile, at: now(), auto: true };
            h.claims = {}; h.phase = 'CLAIM'; h.turnAt = now();
            return t;
        }
        return;
    });
}
window.mjForce = forceTurn;
window.mjTick = tick;              // 화면과 검사에서 직접 떠민다

// 후로를 가린다 — 론 > 폰·깡 > 치
function resolveClaims() {
    const id = cur && cur.id; if (!id) return;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        if (h.phase !== 'CLAIM' || !h.last) return;
        const cl = h.claims || {};
        const byPri = function (k) { return k === 'ron' ? 3 : (k === 'pon' || k === 'kan') ? 2 : k === 'chi' ? 1 : 0; };

        let win = null;
        Object.keys(cl).forEach(function (code) {
            const c = cl[code];
            if (!c || byPri(c.kind) === 0) return;
            if (!win || byPri(c.kind) > byPri(win.c.kind)) win = { code: code, c: c };
        });

        if (!win) { nextTurn(t); return t; }

        if (win.c.kind === 'ron') { h._ron = win.code; h.phase = 'END'; return t; }

        // 후로로 가져온다
        const code = win.code, tile = h.last.tile;
        const hand = arr(h.hands[code]);
        const take = [];
        if (win.c.kind === 'chi') take.push.apply(take, arr(win.c.tiles));
        else if (win.c.kind === 'pon') take.push(tile, tile);
        else take.push(tile, tile, tile);
        let ok = true;
        take.forEach(function (x) {
            const i = hand.indexOf(x);
            if (i < 0) { ok = false; return; }
            hand.splice(i, 1);
        });
        if (!ok) { nextTurn(t); return t; }

        h.hands[code] = hand.sort(function (a, b) { return a - b; });
        const melds = arr(h.melds[code]);
        melds.push({ type: win.c.kind === 'chi' ? 'chi' : win.c.kind === 'pon' ? 'pon' : 'minkan',
                     tiles: take.concat([tile]).sort(function (a, b) { return a - b; }), from: h.last.by });
        h.melds[code] = melds;

        // 울면 일발이 끊긴다
        h.ippatsu = {};
        h.firstGo = false;
        h.turn = seatOf(t, code);
        h.turnAt = now();
        h.claims = null;
        h.last = null;

        if (win.c.kind === 'kan') {
            // 깡 — 왕패에서 한 장 더, 도라도 한 장 더
            const dead = arr(h.dead);
            const extra = dead.pop();
            h.dead = dead;
            h.kans = (h.kans || 0) + 1;
            const di = arr(h.doraInd); di.push(dead[2 + h.kans] != null ? dead[2 + h.kans] : dead[0]);
            h.doraInd = di;
            const hh = arr(h.hands[code]); hh.push(extra);
            h.hands[code] = hh;
            h.drawn = extra; h.rinshan = true; h.phase = 'DISCARD';
        } else {
            h.rinshan = false;
            h.phase = 'DISCARD';           // 후로를 했으면 바로 버린다
        }
        return t;
    }).then(function (r) {
        const t = r && r.snapshot && r.snapshot.val();
        if (t && t.h && t.h._ron) return doRon(t.h._ron, t);   // 약속을 돌려줘야 뒤가 기다린다
    });
}

function nextTurn(t) {
    const h = t.h;
    h.claims = null;
    h.phase = 'DRAW';
    h.turn = (h.turn + 1) % t.players;
    h.turnAt = now();
    h.rinshan = false;
    h.last = h.last;                 // 버린 패는 남겨 둔다 (화면에 쓴다)
    if (!arr(h.wall).length) endDraw(t);
}

function doRon(code, tbl) {
    const t = tbl || (cur && cur.t); if (!t || !t.h) return;
    const h = t.h;
    const r = window.mjScore(winArgs(t, h, code, h.last.tile, false));
    if (!r || !r.ok) { return tx(ROOT + '/' + cur.id, function (x) { if (x && x.h) { delete x.h._ron; nextTurn(x); } return x; }); }
    return settleWin(code, codeAt(t, h.last.by), r);
}

// ==========================================
// 국이 끝났다
// ==========================================
function settleWin(winner, loser, r) {
    const id = cur && cur.id; if (!id) return;
    return tx(ROOT + '/' + id, function (t) {
        if (!t || t.state !== 'PLAY' || !t.h) return;
        const h = t.h;
        if (h.done) return;
        h.done = true;
        const sc = t.scores || {};
        const dealer = (seatOf(t, winner) === dealerSeat(t));
        const honba = (t.honba || 0) * 300;

        if (loser) {
            sc[winner] = (sc[winner] || 0) + r.points + honba;
            sc[loser] = (sc[loser] || 0) - r.points - honba;
        } else {
            let got = 0;
            arr(t.seats).forEach(function (s) {
                if (s.code === winner) return;
                const isOya = (seatOf(t, s.code) === dealerSeat(t));
                const pay = dealer ? r.pay.each : (isOya ? r.pay.oya : r.pay.ko);
                const add = pay + (honba / Math.max(1, t.players - 1));
                sc[s.code] = (sc[s.code] || 0) - Math.round(add);
                got += Math.round(add);
            });
            sc[winner] = (sc[winner] || 0) + got;
        }
        sc[winner] = (sc[winner] || 0) + (t.sticks || 0) * 1000;
        t.sticks = 0;
        t.scores = sc;
        t.last = {
            kind: 'win', winner: winner, loser: loser || null,
            yaku: r.yaku, han: r.han, fu: r.fu, points: r.points, name: r.name,
            uraInd: arr(h.uraInd), at: now()
        };
        advance(t, dealer);
        return t;
    });
}

function endDraw(t) {
    const h = t.h;
    if (h.done) return;
    h.done = true;
    // 텐파이 · 노텐
    const ten = [], noten = [];
    arr(t.seats).forEach(function (s) {
        const hand = arr(h.hands[s.code]);
        const ms = arr(h.melds[s.code]).length;
        (window.mjShanten(hand, ms) === 0 ? ten : noten).push(s.code);
    });
    if (ten.length && noten.length) {
        const pot = 3000, give = Math.round(pot / noten.length), take = Math.round(pot / ten.length);
        noten.forEach(function (c) { t.scores[c] = (t.scores[c] || 0) - give; });
        ten.forEach(function (c) { t.scores[c] = (t.scores[c] || 0) + take; });
    }
    t.last = { kind: 'draw', ten: ten, at: now() };
    const dealerTen = ten.indexOf(codeAt(t, dealerSeat(t))) >= 0;
    advance(t, dealerTen);
}

// 다음 국 · 또는 끝
function advance(t, keepDealer) {
    if (keepDealer) {
        t.honba = (t.honba || 0) + 1;
    } else {
        t.honba = 0;
        t.kyoku = (t.kyoku || 1) + 1;
    }
    if (t.kyoku > t.players) { finish(t); return; }
    deal(t);
}

function finish(t) {
    t.state = 'DONE';
    const rank = arr(t.seats).map(function (s) {
        return { code: s.code, name: s.name, score: t.scores[s.code] || 0 };
    }).sort(function (a, b) { return b.score - a.score; });
    t.result = { rank: rank, at: now(), start: P.start };
    t.h = null;
}

// ==========================================
// 확인
// ==========================================
window.mjTables = function () {
    listTables().then(function (list) {
        console.log('%c===== 🀄 열린 자리 =====', 'color:#4CAF50; font-size:13px');
        if (!list.length) { console.log('  없습니다.'); return; }
        console.table(list.map(function (t) {
            return { 판: t.id, 인원: arr(t.seats).length + '/' + t.players, 상태: t.state,
                     국: t.kyoku + '국', 사람: arr(t.seats).map(function (s) { return s.name; }).join(', ') };
        }));
    });
};
window.mjState = function () {
    const s = myState();
    console.log('%c===== 🀄 내 판 =====', 'color:#4CAF50; font-size:13px');
    if (!s) { console.log('  앉은 자리가 없습니다.'); return; }
    const t = s.t;
    console.log('  판:', t.id, '· 상태:', t.state, '· ' + t.kyoku + '국 ' + (t.honba || 0) + '본장');
    console.log('  자리:', arr(t.seats).map(function (x, i) {
        return (i === (s.h ? s.h.turn : -1) ? '▶' : ' ') + x.name + '(' + (t.scores[x.code] || 0) + ')';
    }).join('  '));
    if (!s.h) { console.log('  아직 안 시작했습니다.'); return; }
    console.log('  내 패:', s.hand.map(window.mjTileName).join(' '),
        s.melds.length ? ('· 후로 ' + s.melds.length) : '');
    console.log('  단계:', s.phase, '· 내 차례:', s.mine ? 'O' : '✗',
        '· 남은 산:', arr(s.h.wall).length, '장');
    console.log('  샨텐:', window.mjShanten(s.hand, s.melds.length),
        '· 기다리는 패:', window.mjWaits(s.hand, s.melds.length).map(window.mjTileName).join(' ') || '-');
};

// 왜 자리가 안 만들어지나 — 처음부터 끝까지 한 번 해 보고 걸리는 데를 짚는다
const OK = 'color:#4CAF50', NO = 'color:#f44336';
// 자풍이 왜 그렇게 나오나 — 자리와 친을 적어 준다
window.mjWinds = function () {
    const t = cur && cur.t;
    if (!t) { console.log('앉은 판이 없습니다.'); return; }
    const n = t.players, W = ['東', '南', '西', '北'];
    console.log('%c===== 자리와 바람 =====', 'color:#d4af37; font-size:13px');
    console.log('  ' + t.kyoku + '국 · 장풍 東 · 친(선)은 ' + nameAt(t, dealerSeat(t)) + ' 입니다.');
    console.table(arr(t.seats).map(function (s, i) {
        return { 자리: i, 이름: s.name,
                 자풍: W[((i - (t.kyoku - 1)) % n + n) % n],
                 친: i === dealerSeat(t) ? 'O' : '',
                 차례: t.h && t.h.turn === i ? '◀' : '' };
    }));
    console.log('  자풍은 국마다 한 자리씩 돕니다. 1국의 첫 자리가 東이고,'
        + ' 2국이 되면 그 자리가 北으로 갑니다.');
};

window.mjWhy = function () {
    console.log('%c===== 🀄 마작이 되는지 =====', 'color:#ffd700; font-size:13px');
    console.log('  채점기:', typeof window.mjScore === 'function' ? 'O' : '✗',
        '· 판 진행:', typeof window.mjMake === 'function' ? 'O' : '✗',
        '· 화면:', typeof window.mjOpen === 'function' ? 'O' : '✗');
    console.log('  나:', me() ? (me().name + ' (' + me().code + ')') : '✗ 없음',
        '· 서버 연결:', db_() ? 'O' : '✗ 없음');
    console.log('  격리 중인가(단추가 뜨는 조건):',
        (typeof isQuarantined === 'function' && me() && isQuarantined(me())) ? 'O' : '✗ — 단추는 상담실·선녀탕 안에서만 뜹니다');
    console.log('  이미 앉아 있는 자리:', cur ? (cur.id + ' · ' + ((cur.t && cur.t.state) || '?')) : '없음');
    if (window._mjLastError) console.log('  지난 오류:', window._mjLastError);
    if (!db_()) return;
    if (cur) { console.log('  ※ 이미 앉아 있어 새로 만들어 보지는 않습니다. 나가려면 mjLeave()'); return; }

    console.log('  — 실제로 한 번 만들어 봅니다 —');
    let made = null;
    makeTable(2).then(function (id) {
        made = id;
        if (!id) { console.log('%c  ✗ mjMake 가 빈손으로 돌아왔습니다 (나 또는 서버 연결 없음)', NO); return null; }
        console.log('%c  ✓ 만들었습니다 — ' + id, OK);
        return db_().ref(ROOT + '/' + id).once('value');
    }).then(function (s) {
        if (!s) return;
        const v = s.val();
        if (!v) { console.log('%c  ✗ 썼는데 서버에서 다시 읽히지 않습니다 (규칙이 읽기를 막음)', NO); return; }
        console.log('%c  ✓ 서버에서 다시 읽힙니다 — ' + v.players + '인 · ' + v.state, OK);
        console.log('%c    내 자리: ' + (cur ? 'O 붙었습니다' : '✗ 안 붙었습니다 (watch 가 실패했습니다)'), cur ? OK : NO);
        return listTables();
    }).then(function (l) {
        if (l) console.log('%c  ✓ 열린 자리 목록에 ' + l.length + '개 보입니다', OK);
    }).catch(function (e) {
        const msg = (e && (e.message || e.code)) || e;
        console.log('%c  ✗ 막혔습니다 — ' + msg, NO);
        if (/permission|denied/i.test(String(msg))) {
            console.log('    데이터베이스 규칙에서 mjTables 쓰기가 막혀 있습니다.');
            console.log('    Firebase 콘솔 → Realtime Database → 규칙 에 아래를 넣어 주세요.');
            console.log('      { "rules": { ".read": true, ".write": true } }');
        }
    }).then(function () {
        if (!made) return;
        unwatch();
        return db_().ref(ROOT + '/' + made).set(null).then(function () {
            console.log('  (시험으로 만든 자리는 치웠습니다)');
        }).catch(function () { });
    });
};

// 바뀐 것이 없어도 시간은 흐른다 — 후로 창과 굳은 차례를 여기서 본다
setInterval(function () { try { tick(); } catch (e) { } }, 1000);

console.log('[마작] 판 진행 — mjTables() · mjState() · mjWhy()');

})();
