// ==========================================
// ★ 🎨 그림 전화 — 규칙과 통신 (화면은 draw-ui.js)
// bundles.json 마지막 묶음, draw-ui.js 바로 앞
// ==========================================
//
// ■ 무엇인가
//
//   카지노 거리 공용시설에 붙는 여럿이 하는 놀이다. 셋에서 다섯까지.
//   놀이법이 둘이고, 방을 만들 때 고른다.
//
//   ① 이어 말하기 (갈틱폰)
//        모두가 제시어를 하나씩 낸다 → 사람 수만큼 묶음이 생긴다.
//        묶음이 옆으로 돌면서, 받은 사람은 번갈아 **그리거나 맞힌다.**
//            제시어 → 그림 → 맞힌 말 → 그림 → …
//        한 바퀴 돌면 다섯 묶음이 처음부터 어떻게 망가졌는지 쭉 보인다.
//        ★ 차례를 기다리지 않는다 — 같은 시각에 다 같이 제 묶음을 맡는다.
//
//   ② 한 장 이어 그리기
//        제시어는 역시 다 같이 내고, 그중 하나를 뽑는다.
//        **맞힐 사람 하나만** 그 말을 모른다. 나머지가 차례로 같은
//        그림판에 덧그리고, 마지막에 맞힐 사람이 답한다.
//
// ■ 포인트
//
//       들어갈 때 참가비 FEE 를 낸다. 모인 판돈을 맞힌 사람이 나눈다.
//
//   ① 이어 말하기 — 맞힌 수에 따라 나눈다. 아무도 못 맞히면 되돌려 준다.
//   ② 한 장 — 맞히면 맞힌 사람이 절반, 그린 사람들이 절반을 나눈다.
//              못 맞히면 되돌려 준다.
//
//   ★ 돈은 **제 몫만 제가 가져간다.** 한 사람이 남의 포인트까지
//     적어 주면, 둘이 동시에 적을 때 한쪽이 덮어써서 사라진다.
//     들어갈 때 제가 내고, 끝나면 제 몫만 제가 받는다.
//
// ■ 서버 자리
//
//       drawRoom            방 하나 (한 번에 한 판)
//         .mode .state .fee .host .at .deadline .round
//         .players/<사번> { n, no, at }
//         .words/<사번>    제시어
//         .books/<번호>    { own, word, steps:[{by,kind,art,text}] }
//         .relay           { word, owner, seer, turn, art, guess }
//         .paid/<사번>     1   (몫을 가져갔다는 표)
//       drawArt/<열쇠>     그림 한 장 (선 목록 글자)
//
//   ★ 그림은 **방과 따로** 둔다. 방 자료는 1초에 한 번씩 모두에게
//     내려가는데, 그림까지 거기 있으면 한 판에 스물다섯 장이 매번
//     같이 내려온다. 그림은 볼 때만 한 장씩 받아 온다 (once).
//
// ■ 차례 넘기기
//
//   기한(deadline)이 지나면 **아무나** 다음으로 넘길 수 있다.
//   transaction 으로 넘기므로 둘이 동시에 눌러도 한 번만 넘어간다.
//   ✗ 방장만 넘기게 두면, 방장이 창을 닫는 순간 판이 멈춘다.
//
// ■ 콘솔
//       dgState()    지금 방 모습
//       dgClear()    상담사 — 방 치우기

const DG_MIN = 3, DG_MAX = 5;       // 사람 수
const DG_FEE = 500;                 // 참가비

(function drawCore() {

const SEC_WORD = 45;                // 제시어 내는 시간
const SEC_DRAW = 75;                // 그리는 시간
const SEC_GUESS = 40;               // 맞히는 시간
const DEAD = 90 * 1000;             // 이보다 손이 없으면 묵은 방으로 본다
const LIVE = 30 * 1000;             // 사람이 살아 있다고 보는 시간

function db_() { return (typeof database !== 'undefined') ? database : null; }
function me_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function now() { return Date.now(); }
function ref() { const d = db_(); return d ? d.ref('drawRoom') : null; }
function artRef(k) { const d = db_(); return d ? d.ref('drawArt/' + k) : null; }

// ── 맞혔는지 견주기 — 띄어쓰기·대소문자·문장부호는 안 본다
function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
        .replace(/[\s.,!?~·…'"“”‘’\-_()\[\]{}]/g, '');
}
function same(a, b) { const x = norm(a); return !!x && x === norm(b); }

// ==========================================
// 방 보기
// ==========================================
let room = null;            // 지금 방 (없으면 null)
let watching = false;
const hands = [];

function fire() { hands.slice().forEach(function (f) { try { f(room); } catch (e) { } }); }

function watch() {
    const r = ref();
    if (!r || watching) return;
    watching = true;
    r.on('value', function (s) {
        const v = s.val();
        room = (v && typeof v === 'object') ? v : null;
        // 묵은 방은 없는 것으로 본다 (아무도 안 건드린 지 오래)
        if (room && now() - (Number(room.at) || 0) > DEAD && room.state !== 'show') room = null;
        fire();
        try { tick(); } catch (e) { }
    });
}

function players(rm) {
    const p = (rm && rm.players) || {};
    return Object.keys(p).sort(function (a, b) {
        return (Number(p[a].at) || 0) - (Number(p[b].at) || 0) || (a < b ? -1 : 1);
    });
}
function amIn(rm) { const u = me_(); return !!(u && rm && rm.players && rm.players[u.code]); }

// ==========================================
// 방 만들기 · 들어가기 · 나가기
// ==========================================
function touch(patch) {
    const r = ref(); if (!r) return Promise.resolve();
    return r.update(Object.assign({ at: now() }, patch || {}));
}

function pay(n) {
    const u = me_(); if (!u) return;
    u.points = Math.max(0, (Number(u.points) || 0) - n);
    if (typeof saveFields === 'function') saveFields({ points: 1 });
    if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
}
function earn(n, why) {
    const u = me_(); if (!u || n <= 0) return;
    u.points = (Number(u.points) || 0) + n;
    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[그림 전화] ' + why + ' (+' + n + ' P)');
    if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 });
    if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
}

function make(mode) {
    const u = me_(), r = ref();
    if (!u || !r) return Promise.reject('서버에 닿지 못했습니다.');
    if ((Number(u.points) || 0) < DG_FEE) return Promise.reject('참가비 ' + DG_FEE + ' P 가 모자랍니다.');
    if (room && room.state && room.state !== 'show') return Promise.reject('이미 판이 열려 있습니다.');
    const seat = {};
    seat[u.code] = { n: u.name || u.code, no: u.no || '', at: now() };
    return r.set({
        mode: (mode === 'relay') ? 'relay' : 'chain',
        state: 'wait', fee: DG_FEE, host: u.code, at: now(),
        players: seat
    }).then(function () { pay(DG_FEE); });
}

function join() {
    const u = me_(), r = ref();
    if (!u || !r) return Promise.reject('서버에 닿지 못했습니다.');
    if (!room || room.state !== 'wait') return Promise.reject('지금은 들어갈 수 없습니다.');
    if (amIn(room)) return Promise.resolve();
    if (players(room).length >= DG_MAX) return Promise.reject('자리가 다 찼습니다. (' + DG_MAX + '명까지)');
    if ((Number(u.points) || 0) < (Number(room.fee) || DG_FEE)) {
        return Promise.reject('참가비 ' + (room.fee || DG_FEE) + ' P 가 모자랍니다.');
    }
    const p = {};
    p['players/' + u.code] = { n: u.name || u.code, no: u.no || '', at: now() };
    return touch(p).then(function () { pay(Number(room.fee) || DG_FEE); });
}

// ★ 나가기 — 모이는 중에만 참가비를 돌려준다. 시작한 뒤에는 안 돌려준다
//   (판이 깨지므로). 남은 사람이 둘 이하가 되면 판을 접는다.
function leave() {
    const u = me_(), r = ref();
    if (!u || !r || !room) return Promise.resolve();
    const was = room.state, fee = Number(room.fee) || DG_FEE;
    const left = players(room).filter(function (c) { return c !== u.code; });
    if (was === 'wait' && !left.length) {
        return r.remove().then(function () { earn(fee, '참가비 돌려받음'); });
    }
    const p = {};
    p['players/' + u.code] = null;
    if (was === 'wait' && room.host === u.code) p.host = left[0];
    return touch(p).then(function () { if (was === 'wait') earn(fee, '참가비 돌려받음'); });
}

function start() {
    const u = me_();
    if (!room || !u || room.host !== u.code) return Promise.reject('방장만 시작할 수 있습니다.');
    const n = players(room).length;
    if (n < DG_MIN) return Promise.reject(DG_MIN + '명부터 할 수 있습니다. (지금 ' + n + '명)');
    return touch({ state: 'word', round: 0, deadline: now() + SEC_WORD * 1000 });
}

// ==========================================
// 제시어
// ==========================================
function word(text) {
    const u = me_();
    if (!room || !u || room.state !== 'word') return Promise.reject('지금은 낼 수 없습니다.');
    const t = String(text || '').trim().slice(0, 20);
    if (!t) return Promise.reject('제시어를 적어 주세요.');
    const p = {}; p['words/' + u.code] = t;
    return touch(p);
}

// ==========================================
// 그림 · 맞힌 말 내기
// ==========================================
//
//   그림은 drawArt 에 따로 두고, 방에는 그 열쇠만 적는다.
function artKey(bookOrRelay, step) { return 'a' + now().toString(36) + '_' + bookOrRelay + '_' + step; }

function submitArt(strokes) {
    const u = me_();
    if (!room || !u || room.state !== 'play') return Promise.reject('지금은 낼 수 없습니다.');
    const mine = myJob();
    if (!mine || mine.kind !== 'draw') return Promise.reject('그릴 차례가 아닙니다.');
    const key = artKey(mine.book == null ? 'r' : mine.book, room.round || 0);
    const ar = artRef(key);
    const put = ar ? ar.set(String(strokes || '')) : Promise.resolve();
    return put.then(function () {
        const p = {};
        if (room.mode === 'relay') {
            p['relay/art'] = key;
            p['relay/turn'] = (Number((room.relay || {}).turn) || 0) + 1;
            // 다음 차례의 기한을 새로 준다 (남은 그릴 사람이 없으면 맞힐 사람 차례)
            const ps2 = players(room), R2 = room.relay || {};
            const left = ps2.filter(function (c) { return c !== R2.seer; }).length
                - ((Number(R2.turn) || 0) + 1);
            p.deadline = now() + (left > 0 ? SEC_DRAW : SEC_GUESS) * 1000;
        }
        else p['books/' + mine.book + '/steps/' + (room.round || 0)] = { by: u.code, kind: 'draw', art: key };
        return touch(p);
    });
}

function submitGuess(text) {
    const u = me_();
    if (!room || !u || room.state !== 'play') return Promise.reject('지금은 낼 수 없습니다.');
    const mine = myJob();
    if (!mine || mine.kind !== 'guess') return Promise.reject('맞힐 차례가 아닙니다.');
    const t = String(text || '').trim().slice(0, 20);
    const p = {};
    if (room.mode === 'relay') {
        // 맞힐 사람은 하나뿐이라 답하는 순간 끝이다
        p['relay/guess'] = t; p.state = 'show'; p.deadline = 0;
    } else p['books/' + mine.book + '/steps/' + (room.round || 0)] = { by: u.code, kind: 'guess', text: t };
    return touch(p);
}

// ==========================================
// 지금 내가 할 일
// ==========================================
//
//   ① 이어 말하기 — 묶음 i 는 돌림수 r 에 (i + r) 번째 사람이 맡는다.
//      홀수 돌림은 그리기, 짝수 돌림은 맞히기다 (1돌림째가 그리기).
//   ② 한 장 — 차례 하나씩. 그릴 사람이 다 그리면 맞힐 사람 차례다.
function myJob(rm) {
    rm = rm || room;
    const u = me_();
    if (!rm || !u || rm.state !== 'play') return null;
    const ps = players(rm), n = ps.length, k = ps.indexOf(u.code);
    if (k < 0) return null;

    if (rm.mode === 'relay') {
        const R = rm.relay || {};
        if (!R.seer) return null;
        const seer = R.seer;
        const drawers = ps.filter(function (c) { return c !== seer; });
        const t = Number(R.turn) || 0;
        if (t < drawers.length) {
            return (drawers[t] === u.code)
                ? { kind: 'draw', book: null, word: R.word, prev: R.art || '' }
                : { kind: 'wait', who: (rm.players[drawers[t]] || {}).n || drawers[t] };
        }
        if (seer === u.code) return { kind: 'guess', book: null, prev: R.art || '' };
        return { kind: 'wait', who: (rm.players[seer] || {}).n || seer };
    }

    const r = Number(rm.round) || 0;            // 1부터
    if (r < 1) return null;
    // 내가 맡는 묶음 — (i + r) % n === k  →  i = (k - r + n*n) % n
    const book = ((k - r) % n + n * n) % n;
    const steps = ((rm.books || {})[book] || {}).steps || {};
    const done = !!steps[r];
    const kind = (r % 2 === 1) ? 'draw' : 'guess';
    const prevStep = steps[r - 1];
    return {
        kind: done ? 'done' : kind, book: book,
        word: (r === 1) ? ((rm.books || {})[book] || {}).word
            : (prevStep && prevStep.kind === 'guess' ? prevStep.text : ''),
        prev: (prevStep && prevStep.kind === 'draw') ? prevStep.art : ''
    };
}

// ==========================================
// 다음으로 넘기기 — 아무나, 한 번만
// ==========================================
function allIn(rm) {
    const ps = players(rm);
    if (rm.state === 'word') {
        const w = rm.words || {};
        return ps.every(function (c) { return w[c]; });
    }
    if (rm.state === 'play') {
        if (rm.mode === 'relay') return false;      // 한 장 짜리는 차례로 돈다
        const r = Number(rm.round) || 0;
        const bs = rm.books || {};
        return ps.every(function (_, i) { return ((bs[i] || {}).steps || {})[r]; });
    }
    return false;
}

function tick() {
    const rm = room;
    if (!rm || !rm.state || rm.state === 'show') return;
    const over = rm.deadline && now() > Number(rm.deadline);
    if (!over && !allIn(rm)) return;
    const r = ref(); if (!r) return;
    // ★ transaction — 둘이 같이 눌러도 한 번만 넘어간다
    r.transaction(function (cur) {
        if (!cur || !cur.state || cur.state === 'show') return;
        const stale = cur.deadline && now() > Number(cur.deadline);
        if (!stale && !allIn(cur)) return;          // 그새 누가 넘겼다
        return step(cur);
    });
}

function step(cur) {
    const ps = players(cur), n = ps.length;
    cur.at = now();

    if (cur.state === 'word') {
        // 안 낸 사람 몫은 채워 준다
        const w = cur.words || {};
        ps.forEach(function (c, i) { if (!w[c]) w[c] = FILL[(i + (now() % FILL.length)) % FILL.length]; });
        cur.words = w;
        if (cur.mode === 'relay') {
            const owner = ps[Math.floor(Math.random() * n)];
            const seer = ps[(ps.indexOf(owner) + 1) % n];     // 바로 다음 사람이 맞힌다
            cur.relay = { word: w[owner], owner: owner, seer: seer, turn: 0, art: '', guess: '' };
            cur.state = 'play'; cur.round = 1;
            cur.deadline = now() + SEC_DRAW * 1000;
            return cur;
        }
        const books = {};
        ps.forEach(function (c, i) { books[i] = { own: c, word: w[c], steps: {} }; });
        cur.books = books;
        cur.state = 'play'; cur.round = 1;
        cur.deadline = now() + SEC_DRAW * 1000;
        return cur;
    }

    if (cur.state === 'play') {
        if (cur.mode === 'relay') {
            const R = cur.relay || {};
            const drawers = ps.filter(function (c) { return c !== R.seer; });
            const t = Number(R.turn) || 0;
            if (t < drawers.length) {                 // 안 그리고 넘긴 사람
                R.turn = t + 1; cur.relay = R;
                cur.deadline = now() + (R.turn < drawers.length ? SEC_DRAW : SEC_GUESS) * 1000;
                return cur;
            }
            cur.state = 'show'; cur.deadline = 0;
            return cur;
        }
        // 묶음 하나를 사람 수만큼 거치면 끝이다 — 주인 빼고 n-1 돌림
        const r = Number(cur.round) || 1;
        if (r >= n - 1) { cur.state = 'show'; cur.deadline = 0; return cur; }
        cur.round = r + 1;
        cur.deadline = now() + ((cur.round % 2 === 1) ? SEC_DRAW : SEC_GUESS) * 1000;
        return cur;
    }
    return cur;
}

// 제시어를 안 낸 사람 몫 — 아무 말이나 채워 넣는다
const FILL = ['출근길', '여우', '점심시간', '복사기', '야근', '엘리베이터', '사원증',
    '커피', '회의실', '우산', '고양이', '계단', '전구', '도시락', '단추'];

// ==========================================
// 셈과 몫 — 끝나면 제 몫만 제가 가져간다
// ==========================================
//
//   ★ 남의 포인트는 안 건드린다 (머리말 참고).
function result(rm) {
    rm = rm || room;
    if (!rm || rm.state !== 'show') return null;
    const ps = players(rm), n = ps.length;
    const fee = Number(rm.fee) || DG_FEE;
    const pot = fee * n;
    const share = {};
    ps.forEach(function (c) { share[c] = 0; });

    if (rm.mode === 'relay') {
        const R = rm.relay || {};
        const hit = same(R.guess, R.word);
        if (!hit) { ps.forEach(function (c) { share[c] = fee; }); return mk(rm, pot, share, hit); }
        const drawers = ps.filter(function (c) { return c !== R.seer; });
        share[R.seer] = Math.floor(pot / 2);
        const each = Math.floor((pot - share[R.seer]) / drawers.length);
        drawers.forEach(function (c) { share[c] = each; });
        return mk(rm, pot, share, hit);
    }

    // 이어 말하기 — 묶음의 **처음 말**을 맞힌 수로 나눈다
    const hits = {};
    ps.forEach(function (c) { hits[c] = 0; });
    let total = 0;
    Object.keys(rm.books || {}).forEach(function (bi) {
        const bk = rm.books[bi] || {};
        Object.keys(bk.steps || {}).forEach(function (si) {
            const st = bk.steps[si];
            if (!st || st.kind !== 'guess') return;
            if (same(st.text, bk.word)) { hits[st.by] = (hits[st.by] || 0) + 1; total++; }
        });
    });
    if (!total) { ps.forEach(function (c) { share[c] = fee; }); return mk(rm, pot, share, false, hits); }
    ps.forEach(function (c) { share[c] = Math.floor(pot * (hits[c] || 0) / total); });
    return mk(rm, pot, share, true, hits);
}
function mk(rm, pot, share, hit, hits) {
    return { pot: pot, share: share, hit: hit, hits: hits || {}, mode: rm.mode };
}

// 끝났으면 제 몫을 한 번만 가져온다
function collect() {
    const u = me_(), r = ref();
    if (!u || !r || !room || room.state !== 'show') return;
    if (!amIn(room)) return;
    if ((room.paid || {})[u.code]) return;
    const res = result(room);
    if (!res) return;
    const n = Number(res.share[u.code]) || 0;
    const p = {}; p['paid/' + u.code] = 1;
    r.update(p).then(function () {
        if (n > 0) earn(n, res.hit ? '판돈을 나눠 가졌습니다' : '참가비 돌려받음');
    });
}

// ==========================================
// 그림 — 볼 때만 한 장씩
// ==========================================
const artCache = {};
function art(key) {
    if (!key) return Promise.resolve('');
    if (artCache[key] != null) return Promise.resolve(artCache[key]);
    const r = artRef(key);
    if (!r) return Promise.resolve('');
    return r.once('value').then(function (s) {
        const v = String(s.val() || '');
        artCache[key] = v;
        return v;
    });
}

// ==========================================
// 밖으로
// ==========================================
window.DG = {
    MIN: DG_MIN, MAX: DG_MAX, FEE: DG_FEE,
    SEC_WORD: SEC_WORD, SEC_DRAW: SEC_DRAW, SEC_GUESS: SEC_GUESS,
    watch: watch,
    on: function (f) { if (typeof f === 'function') hands.push(f); },
    room: function () { return room; },
    players: players, amIn: amIn, myJob: myJob, result: result, same: same,
    make: make, join: join, leave: leave, start: start,
    word: word, submitArt: submitArt, submitGuess: submitGuess,
    tick: tick, collect: collect, art: art
};

// 기한이 지났는지 스스로도 본다 (아무도 안 누르고 있을 때)
setInterval(function () { try { if (room && amIn(room)) tick(); } catch (e) { } }, 3000);

window.dgState = function () {
    console.log('%c===== 🎨 그림 전화 =====', 'color:#9fd4ff; font-size:13px');
    if (!room) { console.log('  열린 판이 없습니다.'); return; }
    const ps = players(room);
    console.log('  놀이법 :', room.mode === 'relay' ? '한 장 이어 그리기' : '이어 말하기',
        '· 판 :', room.state, '· 돌림 :', room.round || 0);
    console.log('  사람   :', ps.map(function (c) { return (room.players[c] || {}).n || c; }).join(' · '),
        '(' + ps.length + '/' + DG_MAX + ')');
    console.log('  참가비 :', room.fee || DG_FEE, 'P · 판돈', (room.fee || DG_FEE) * ps.length, 'P');
    console.log('  남은 때:', room.deadline ? Math.max(0, Math.round((room.deadline - now()) / 1000)) + '초' : '-');
    console.log('  내 할 일:', JSON.stringify(myJob() || '없음'));
    if (room.state === 'show') console.log('  셈      :', JSON.stringify(result(room)));
};

window.dgClear = function () {
    const u = me_();
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const r = ref(); if (!r) return;
    r.remove().then(function () { console.log('판을 치웠습니다.'); });
};

console.log('[그림] 그림 전화 — ' + DG_MIN + '~' + DG_MAX + '명 · 참가비 ' + DG_FEE + ' P (dgState())');

})();
