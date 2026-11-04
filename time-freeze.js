// ==========================================
// ★ ⏸ 셧다운 동안 시간 멈춤 (2026-11-04 사용자)
// bundles.json 첫 묶음 — rest-time.js 바로 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//   「셧다운 동안에는 시간이 들어간 모든 것들을 동결해줘. (펫 포만감, 물약 등등.) 감금실 제외.」
//   셧다운 = rest-time.js — 2026-11-05 부터 날마다 오전 10시 ~ 오후 6시 (한국 시각).
//
// ■ 어떻게 멈추나 — 끝난 쉬는 시간마다 한 번, 모든 사원의 시계를 그만큼 뒤로 민다
//   이 게임의 시간 것들은 다 「언제 끝나는가(끝 시각)」나 「언제부터 셌는가(시작 시각)」를 적어 두고,
//   들어왔을 때 지금 시각과 견주어 끝내거나 줄인다. 그래서 셧다운이 끝난 뒤에 그 적힌 시각들을 셧다운만큼 밀면
//   그동안 시간이 흐르지 않은 것과 같다.
//     · 끝 시각 D (물약 · 격리 · 안대 · 노예 계약 …) — 셧다운이 시작될 때 아직 안 끝났으면(D > 시작) 셧다운 길이(8시간)만큼 늦춘다.
//     · 시작 시각 L (포만감 · 오염이 마지막으로 줄거나 오른 때, 펫이 마지막으로 먹은 때, 쿨타임 …) — 셧다운 안에서 흐른 만큼 늦춘다.
//   ★ 감금실(cage.js · cage-plus.js)은 건드리지 않는다 (사용자).
//
// ■ 누가 미나 — 쉬는 시간이 끝난 뒤 처음 화면을 연 사람(누구든)이 모든 사원 것을 한 번에
//   · freeze/done = 마지막으로 민 쉬는 시간의 날짜('YYYY-MM-DD'). 더 늦게 끝난 쉬는 시간이 있으면 민다.
//   · 동시에 둘이 밀지 않게 freeze/lock 을 트랜잭션으로 잡고, 모든 사원 것과 freeze/done 을 한 번의 update 로 쓴다
//     (반만 쓰이는 일이 없다 — 쓰다 끊기면 아무것도 안 쓰인 것이라 다음 사람이 다시 민다).
//   · 아직 안 밀었으면 로그인을 잠깐 붙잡는다 (rest-time.js 가 묻는다) — 밀기 전 시각으로 효과가 끝나 버리지 않게.
//     로그인한 채 기다리는 동안에는 checkPassivePollution(1초마다 시간을 재는 곳)을 쉬게 한다.
//
// ■ 콘솔
//   timeFreezeState()

(function timeFreeze() {
'use strict';

const LOCK_MS = 60000;

function srv() { try { if (typeof window.restNow === 'function') return window.restNow(); } catch (e) { } return Date.now(); }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function cu() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }

// ==========================================
// 미는 셈
// ==========================================
//   w = { id, a, b } 쉬는 시간 한 칸
function dl(v, w) {                         // 끝 시각 — 시작 때 아직 안 끝났으면 통째로
    v = Number(v);
    if (!v || !isFinite(v) || v <= w.a) return null;
    return v + (w.b - w.a);
}
function lt(v, w) {                         // 시작 시각 — 그 뒤 쉬는 시간 안에서 흐른 만큼
    v = Number(v);
    if (!v || !isFinite(v) || v >= w.b) return null;
    const d = w.b - Math.max(w.a, v);
    return d > 0 ? v + d : null;
}

// ==========================================
// 무엇을 미나 — 사원 기록 (users/<사번>)
// ==========================================
const U_DL = [];          // 끝 시각 칸 (아래에서 채운다)
const U_LT = [];          // 시작 시각 칸
const U_FN = [];          // 안쪽까지 봐야 하는 것 — function (u, w) → 바뀐 칸 이름들
const G = [];             // 사원 밖 자리 — { path, fn(val, w, up, path) } : 그 자리 값을 받아 바뀐 것을 up['경로'] 에 적는다 (val 도 고친다)

// ── 사원 기록의 끝 시각 · 시작 시각 (index.html checkPassivePollution 등)
[
    'quarantineUntil',        // 여우 상담실 · 선녀탕 격리 (감금실과 다르다)
    'slaveUntil',             // 노예 계약 (slaveFixed 면 끝이 없어 안 민다)
    'blindfoldUntil', 'nostalgiaUntil', 'hairUntil', 'satHoldUntil', 'pollFreezeUntil', 'securityPurgeUntil', 'noteGlowUntil',
    'petStayUntil', 'petSleepUntil',
    'copyExpire', 'glassesExpire', 'garterExpire', 'butterKnifeExpireTime', 'silverRingExpireTime'
].forEach(function (k) { U_DL.push(k); });
[
    'lastSatietyTime',        // 포만감 — 2시간마다 5 줄어든다
    'lastPollutionTime',      // 오염 — 3시간마다 3 오른다
    'nostalgiaLastReduced',   // 노스텔지어 끈 — 5분마다 오염 1 줄인다
    'securityPurgeLast',      // 보안팀 의상 — 10분마다 오염 3 줄인다
    'lastAlienPlayTime',      // 우주 쇼핑몰 — 다음 연결까지 2시간
    'bloodBathEquippedAt'     // 혈욕조 — 하루 3시간까지 차는 시간
].forEach(function (k) { U_LT.push(k); });
// 걸린 효과(물약 …) — 고정이 아닌 것의 끝 시각
U_FN.push(function (u, w) {
    const L = u.timedEffects;
    if (!L || typeof L !== 'object') return [];
    let ch = false;
    Object.keys(L).forEach(function (i) {
        const e = L[i];
        if (!e || e.fixed) return;
        const v = dl(e.expireAt, w);
        if (v != null) { e.expireAt = v; ch = true; }
    });
    return ch ? ['timedEffects'] : [];
});

// 한 사원 — 바뀐 최상위 칸 이름 목록
function shiftUser(u, w) {
    const ch = {};
    U_DL.forEach(function (k) {
        if (k === 'slaveUntil' && u.slaveFixed) return;
        const v = dl(u[k], w); if (v != null) { u[k] = v; ch[k] = 1; }
    });
    U_LT.forEach(function (k) { const v = lt(u[k], w); if (v != null) { u[k] = v; ch[k] = 1; } });
    U_FN.forEach(function (f) { try { (f(u, w) || []).forEach(function (k) { ch[k] = 1; }); } catch (e) { console.warn('[시간 멈춤]', e); } });
    return Object.keys(ch);
}

// ==========================================
// 밀기 — 쉬는 시간이 끝난 뒤 처음 연 사람이
// ==========================================
let done = null, doneKnown = false, busy = false, lastTry = 0, last = null;
function pendingWins() {
    if (typeof window.restWindows !== 'function') return [];
    const now = srv();
    return window.restWindows(0, now).filter(function (w) { return w.b <= now && (!done || w.id > done); });
}
// 아직 밀지 않은 끝난 쉬는 시간이 있나 (모르면 — 아직 freeze/done 을 못 받았으면 — 끝난 쉬는 시간이 하나라도 있으면 있다고 본다)
window.timeFreezePending = function () {
    if (typeof window.restWindows !== 'function') return false;
    const now = srv();
    const all = window.restWindows(0, now).filter(function (w) { return w.b <= now; });
    if (!all.length) return false;
    if (!doneKnown) return true;
    return !done || all[all.length - 1].id > done;
};
function run() {
    const d = db_();
    if (!d || busy || !doneKnown) return;
    const wins = pendingWins();
    if (!wins.length) return;
    if (Date.now() - lastTry < 4000) return;
    lastTry = Date.now();
    busy = true;
    const me = 'c' + Math.random().toString(36).slice(2, 9);
    const want = wins[wins.length - 1].id;
    d.ref('freeze/lock').transaction(function (cur) {
        if (cur && cur.id === want && (srv() - (Number(cur.at) || 0)) < LOCK_MS) return;     // 누가 밀고 있다
        return { id: want, at: srv(), by: me };
    }).then(function (res) {
        const v = res && res.snapshot ? res.snapshot.val() : null;
        if (!res || !res.committed || !v || v.by !== me) { busy = false; return; }
        // 사원 기록 · 사원 밖 자리 · freeze/done 을 새로 읽는다 (데이터베이스 통째는 읽지 않는다)
        const paths = ['users', 'freeze/done'].concat(G.map(function (g) { return g.path; }));
        return Promise.all(paths.map(function (p) { return d.ref(p).once('value').then(function (x) { return x.val(); }); })).then(function (vals) {
            const root = { users: vals[0], freeze: { done: vals[1] } }, gv = vals.slice(2);
            const fresh = String((root.freeze && root.freeze.done) || '');
            const todo = wins.filter(function (w) { return !fresh || w.id > fresh; });
            if (!todo.length) { busy = false; return; }
            const up = {}, users = root.users || {}, stamp = Date.now();
            let n = 0;
            Object.keys(users).forEach(function (c) {
                const u = users[c];
                if (!u || typeof u !== 'object') return;
                const ch = {};
                todo.forEach(function (w) { shiftUser(u, w).forEach(function (k) { ch[k] = 1; }); });
                const ks = Object.keys(ch);
                if (!ks.length) return;
                n++;
                ks.forEach(function (k) { up['users/' + c + '/' + k] = (u[k] === undefined ? null : u[k]); });
                up['users/' + c + '/_adminStamp'] = stamp;
            });
            todo.forEach(function (w) { G.forEach(function (g, i) { try { if (gv[i] != null) g.fn(gv[i], w, up, g.path); } catch (e) { console.warn('[시간 멈춤]', g.path, e); } }); });
            up['freeze/done'] = todo[todo.length - 1].id;
            up['freeze/log/' + todo[todo.length - 1].id] = { at: srv(), users: n, wins: todo.map(function (w) { return w.id; }).join(',') };
            up['freeze/lock'] = null;
            // 내 화면의 기록도 같이 민다 — 서버 메아리를 기다리지 않는다 (내 것은 저장 병합이 옛 값을 다시 쓰지 않게 먼저 맞춘다)
            try {
                const me_ = cu();
                Object.keys(users).forEach(function (c) {
                    const live = (me_ && me_.code === c) ? me_ : ((typeof db !== 'undefined' && db.users) ? db.users[c] : null);
                    if (!live || live === users[c]) return;
                    todo.forEach(function (w) { shiftUser(live, w); });
                    if (up['users/' + c + '/_adminStamp']) live._adminStamp = stamp;
                });
            } catch (e) { }
            last = { at: srv(), wins: todo.map(function (w) { return w.id; }), users: n, keys: Object.keys(up).length };
            return d.ref('/').update(up).then(function () {
                done = todo[todo.length - 1].id;
                console.log('[시간 멈춤] 쉬는 시간 ' + last.wins.join(', ') + ' — ' + n + '명 시계를 밀었습니다');
            });
        });
    }).catch(function (e) { console.warn('[시간 멈춤]', e); }).then(function () { busy = false; });
}

// freeze/done 을 듣는다 — 들어야 트랜잭션도 서버 값으로 바로 돈다
(function listen() {
    const iv = setInterval(function () {
        const d = db_(); if (!d) return;
        clearInterval(iv);
        d.ref('freeze/done').on('value', function (s) { done = s.val() || null; doneKnown = true; run(); });
        d.ref('freeze/lock').on('value', function () { });
    }, 200);
})();
setInterval(run, 3000);

// 1초마다 시간을 재는 곳 — 아직 안 밀었으면 쉰다 (밀기 전 시각으로 물약이 끝나지 않게)
(function hold() {
    const iv = setInterval(function () {
        const f = window.checkPassivePollution;
        if (typeof f !== 'function') return;
        clearInterval(iv);
        if (f._frz) return;
        const w = function () {
            if (window.timeFreezePending()) { run(); return; }
            return f.apply(this, arguments);
        };
        w._frz = true;
        window.checkPassivePollution = w;
    }, 100);
})();

window.timeFreezeState = function () {
    const now = srv();
    console.log('[시간 멈춤] 마지막으로 민 쉬는 시간', done, '· 받음', doneKnown, '· 밀 것', pendingWins().map(function (w) { return w.id; }), '· 지금 쉬는 중', !!(window.restWindows && window.restWindows(now, now + 1).length), '· 이 화면에서 민 것', last);
};
window.timeFreezeSpec = { U_DL: U_DL, U_LT: U_LT, U_FN: U_FN, G: G, dl: dl, lt: lt, shiftUser: shiftUser };
window.timeFreezeRun = function () { if (Date.now() - lastTry > 1500) lastTry = 0; run(); };
})();
