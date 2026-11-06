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
//   ★ 감금실(cage.js · cage-plus.js — cage · cageUse · cageRoom · houseBank · 임신의 cageCut)은 건드리지 않는다 (사용자).
//   ★ 탐사 도중 셧다운으로 로그아웃되면 — 어둠 탐사는 「나간 때」를 셧다운 끝으로 밀어, 끝난 뒤 5분 안에 돌아오면 이어진다.
//     (kroom · 달 · 파티 도우미의 이어 하기는 브라우저에만 적혀 있어 6시간이 넘으면 끊긴다 — 여기서 못 민다)
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
    if (!v || !isFinite(v) || v <= w.a || v >= 1e14) return null;     // 1e14 넘는 것은 「끝이 없다」는 표시 (고정 효과 등)
    return v + (w.b - w.a);
}
function lt(v, w) {                         // 시작 시각 — 그 뒤 쉬는 시간 안에서 흐른 만큼
    v = Number(v);
    if (!v || !isFinite(v) || v >= w.b) return null;
    const d = w.b - Math.max(w.a, v);
    return d > 0 ? v + d : null;
}
// o[k] 를 민다 — 바뀌었으면 true
function sh(o, k, f, w) {
    if (!o || typeof o !== 'object') return false;
    const v = f(o[k], w);
    if (v == null) return false;
    o[k] = v;
    return true;
}
function each(o, fn) { if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') fn(o[k], k); }); }

// ==========================================
// 무엇을 미나 — 사원 기록 (users/<사번>)
// ==========================================
//   ★ 감금실(cage · cageUse · cageRoom · houseBank · preg.cageCut)은 넣지 않는다 (사용자).
const U_DL = [];          // 끝 시각 칸
const U_LT = [];          // 시작 시각 칸
const U_FN = [];          // 안쪽까지 봐야 하는 것 — function (u, w) → 바뀐 최상위 칸 이름들
const G = [];             // 사원 밖 자리 — { path, fn(val, w, up, path) } : 그 자리 값을 받아 바뀐 것을 up['경로'] 에 적는다 (val 도 고친다)

[
    'quarantineUntil',        // 여우 상담실 · 선녀탕 격리 (감금실과 다르다)
    'qSteadyAt',              // 굳건이 이미 줄인 격리 끝 — quarantineUntil 과 === 로 견주므로 똑같이 민다 (attr2.js)
    'slaveUntil',             // 노예 계약 (slaveFixed 면 끝이 없어 안 민다)
    'blindfoldUntil', 'nostalgiaUntil', 'hairUntil', 'satHoldUntil', 'pollFreezeUntil', 'securityPurgeUntil', 'noteGlowUntil',
    'petStayUntil', 'petSleepUntil',
    'glassesExpire', 'garterExpire', 'butterKnifeExpireTime', 'silverRingExpireTime', 'jakduExpireTime',
    'dollPt',                 // 봉제 인형 사흘
    'dollKitAt'               // 인형 꾸러미 나흘 기다림
].forEach(function (k) { U_DL.push(k); });
[
    'lastSatietyTime',        // 포만감 — 2시간마다 5 줄어든다
    'lastPollutionTime',      // 오염 — 3시간마다 3 오른다
    'nostalgiaLastReduced',   // 노스텔지어 끈 — 5분마다 오염 1 줄인다
    'securityPurgeLast',      // 보안팀 의상 — 10분마다 오염 3 줄인다
    // 'lastAlienPlayTime' — 우주 쇼핑몰은 쉬는 시간에도 시간이 흐른다 (2026-11-06 사용자 「셧다운동안 우주쇼핑몰 시간은 안 멈추게」)
    'bloodBathEquippedAt',    // 혈욕조 — 하루 3시간까지 차는 시간
    'quarFood',               // 음식 때문에 격리된 때 (30시간 믿는다)
    'moonT4At',               // 달 ④ — 5시간 창
    'violinAt',               // 바이올린 — 한 시간마다 (violinPaid 와 함께 센다)
    'petActAt',               // 펫 말썽 — 2시간 간격
    'petGaveAt'               // 펫 넘기기 — 사흘 간격
].forEach(function (k) { U_LT.push(k); });

// 걸린 효과(물약 …) — 고정이 아닌 것의 끝 시각
U_FN.push(function (u, w) {
    let ch = false;
    each(u.timedEffects, function (e) { if (!e.fixed && sh(e, 'expireAt', dl, w)) ch = true; });
    return ch ? ['timedEffects'] : [];
});
// 버프 · 호가호위 · 그 문구 · 역병 — 끝 시각 (until). 탐사 한 번짜리(run) 버프는 시간이 없어 그대로
U_FN.push(function (u, w) {
    const out = [];
    ['itemBuffs', 'foxBuffs', 'foxNotes', 'foxPl'].forEach(function (k) {
        let ch = false;
        each(u[k], function (b) { if (sh(b, 'until', dl, w)) ch = true; });
        if (ch) out.push(k);
    });
    return out;
});
// 붉은 리본 — 한 시간 포만 묶음 (u = 끝 시각 · 두 사람 기록에 같은 값이라 똑같이 밀린다)
U_FN.push(function (u, w) {
    let ch = false;
    each(u.ribbons, function (r) { if (sh(r, 'u', dl, w)) ch = true; });
    return ch ? ['ribbons'] : [];
});
// 복사기로 찍은 것 — [{ n, at }] (예전 꼴 { 이름: 끝 시각 } 도)
U_FN.push(function (u, w) {
    const c = u.copyExpire;
    if (!c || typeof c !== 'object') return [];
    let ch = false;
    if (Array.isArray(c)) c.forEach(function (x) { if (x && sh(x, 'at', dl, w)) ch = true; });
    else Object.keys(c).forEach(function (k) {
        if (c[k] && typeof c[k] === 'object') { if (sh(c[k], 'at', dl, w)) ch = true; }
        else if (sh(c, k, dl, w)) ch = true;
    });
    return ch ? ['copyExpire'] : [];
});
// 여우 부름 · 음식 격리 표시 — 격리 끝을 베껴 둔 값이라 똑같이 민다 (부름의 at 은 차례 표시라 안 민다)
U_FN.push(function (u, w) {
    const out = [];
    if (u.foxCall && sh(u.foxCall, 'until', dl, w)) out.push('foxCall');
    if (u.quarCause) {
        const a = sh(u.quarCause, 'until', dl, w), b = sh(u.quarCause, 'at', lt, w);
        if (a || b) out.push('quarCause');
    }
    return out;
});
// 도깨비 — 지켜 주는 12시간(on) · 쉬는 12시간(cd) · 이미 준 cd(paid — cd 와 === 로 견준다)
U_FN.push(function (u, w) {
    const d = u.dok;
    if (!d || typeof d !== 'object') return [];
    const paidWasCd = d.paid != null && d.paid === d.cd;
    let ch = sh(d, 'on', dl, w);
    if (sh(d, 'cd', dl, w)) { ch = true; if (paidWasCd) d.paid = d.cd; }
    return ch ? ['dok'] : [];
});
// 펫 — 먹은 때(포만감) · 혼자 탐사 · 쉼 · 잠 · 다침 · 쓰다듬기 · 놀기 · 알 돌보기
U_FN.push(function (u, w) {
    const out = [];
    let ch = false;
    each(u.pets, function (p) {
        if (sh(p, 'fedAt', lt, w)) ch = true;               // 포만감 — 먹은 때부터 사흘
        if (sh(p, 'stv', lt, w)) ch = true;                 // 굶어서 교감을 깎은 때 — 안 먹이면 사흘 뒤 또 (pet-data.js)
        if (p.out && sh(p.out, 'till', dl, w)) ch = true;   // 혼자 탐사 — 돌아오는 때
        if (sh(p, 'rest', dl, w)) ch = true;                // 탐사 뒤 쉼
        if (sh(p, 'jsleep', dl, w)) ch = true;              // 여정 뒤 잠
        if (p.hurt && typeof p.hurt === 'object') {         // 다친 펫 — 다친 때부터 2시간이면 교감 -70
            if (sh(p.hurt, 'at', lt, w)) ch = true;
            if (sh(p.hurt, 'last', lt, w)) ch = true;
        }
        if (sh(p, 'pat', lt, w)) ch = true;
        if (sh(p, 'play', lt, w)) ch = true;
    });
    if (ch) out.push('pets');
    if (u.petEgg && sh(u.petEgg, 'last', lt, w)) out.push('petEgg');
    return out;
});
// 임신 — 낳는 때(due) · 아빠마다 시작(sires[].at — due 를 다시 셀 때 쓴다) · 돌봄 간격(careAt)
U_FN.push(function (u, w) {
    const g = u.preg;
    if (!g || typeof g !== 'object') return [];
    let ch = sh(g, 'due', dl, w);
    each(g.sires, function (x) { if (sh(x, 'at', lt, w)) ch = true; });
    if (g.careAt && typeof g.careAt === 'object') Object.keys(g.careAt).forEach(function (k) { if (sh(g.careAt, k, lt, w)) ch = true; });
    return ch ? ['preg'] : [];
});
// 금고 이자 · 칭호 열흘 · 지산 · 칠성군
U_FN.push(function (u, w) {
    const out = [];
    let ch = false;
    each(u.safeBoxes, function (b) { if (sh(b, 'lastInterest', lt, w)) ch = true; });
    if (ch) out.push('safeBoxes');
    if (u.ti && typeof u.ti === 'object') {
        const a = sh(u.ti, 'pureFrom', lt, w), b = sh(u.ti, 'healthFrom', lt, w);
        if (a || b) out.push('ti');
    }
    ch = false;
    each(u.jisanSac, function (x) { if (sh(x, 'at', lt, w)) ch = true; });
    if (ch) out.push('jisanSac');
    if (u.chilRun && sh(u.chilRun, 'at', lt, w)) out.push('chilRun');
    // 눈(우주 쇼핑몰 되돌리기)의 last 도 안 민다 — lastAlienPlayTime 과 짝이다 (2026-11-06)
    return out;
});

// ==========================================
// 사원 밖 자리
// ==========================================
function gEach(val, path, fn) { each(val, function (x, k) { fn(x, path + '/' + k); }); }
function put(up, path, o, k) { up[path + '/' + k] = o[k]; }
// 펫 포만감 사본 — petFed/<사번>/<펫>.f (먹은 때)
G.push({ path: 'petFed', fn: function (val, w, up, path) {
    gEach(val, path, function (byPet, p1) { gEach(byPet, p1, function (x, p2) { if (sh(x, 'f', lt, w)) put(up, p2, x, 'f'); }); });
} });
// 은행 — 대출 갚을 날 · 이자 · 빌린 때 · 블랙리스트 창 · 쿨타임
G.push({ path: 'bank', fn: function (val, w, up, path) {
    gEach(val, path, function (b, p1) {
        ['lastInterest', 'lastGainAt', 'vipRejectedAt'].forEach(function (k) { if (sh(b, k, lt, w)) put(up, p1, b, k); });
        if (b.loan && typeof b.loan === 'object') {
            if (sh(b.loan, 'dueAt', dl, w)) put(up, p1 + '/loan', b.loan, 'dueAt');
            if (sh(b.loan, 'takenAt', lt, w)) put(up, p1 + '/loan', b.loan, 'takenAt');
        }
        if (b.loanTimes && typeof b.loanTimes === 'object') {
            let ch = false;
            Object.keys(b.loanTimes).forEach(function (k) { if (sh(b.loanTimes, k, lt, w)) ch = true; });
            if (ch) put(up, p1, b, 'loanTimes');
        }
    });
} });
// 어둠 탐사 이어 하기 — 나간 때(savedAt). 셧다운이 로그아웃시키므로, 끝난 뒤 5분 안에 돌아오면 이어진다
G.push({ path: 'darkRuns', fn: function (val, w, up, path) {
    gEach(val, path, function (r, p1) { if (sh(r, 'savedAt', lt, w)) put(up, p1, r, 'savedAt'); });
} });
// 가두리(펫 배틀 · 여정 · 이상한 나라 · 여우) — 갇힌 때 · 풀리는 때. 감금실이 아니다
G.push({ path: 'gaduri', fn: function (val, w, up, path) {
    gEach(val, path, function (room, p1) { gEach(room, p1, function (x, p2) {
        if (sh(x, 'until', dl, w)) put(up, p2, x, 'until');
        if (sh(x, 'at', lt, w)) put(up, p2, x, 'at');
    }); });
} });
// 🪄 도깨비 방망이에 맞아 소원권(물약)이 된 사원 — 30분 (plaza.js · 2026-11-06)
G.push({ path: 'wishForm', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) { if (sh(x, 'until', dl, w)) put(up, p1, x, 'until'); });
} });
// 장터 — 올린 때 (사흘 지나면 돌려준다)
G.push({ path: 'market', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) { if (sh(x, 'at', lt, w)) put(up, p1, x, 'at'); });
} });
// 사원 사이 거래 제안 — 만든 때 (기다리는 것만 · 24시간)
G.push({ path: 'p2pDeals', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) { if (x.status === 'PENDING' && sh(x, 'createdAt', lt, w)) put(up, p1, x, 'createdAt'); });
} });
// 탄원서(격리) — 낸 때 · 정해진 때 (24시간 · 30분 간격)
G.push({ path: 'pleas', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) {
        if (x.state === 'PENDING' && sh(x, 'at', lt, w)) put(up, p1, x, 'at');
        if (sh(x, 'decidedAt', lt, w)) put(up, p1, x, 'decidedAt');
    });
} });
// 토크쇼 피날레 풀려남 소식 — 사흘 기다린다
G.push({ path: 'talkFinale', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) { if (sh(x, 'at', lt, w)) put(up, p1, x, 'at'); });
} });
// 팝업 알림 — 올린 때 (한 시간 띄우고 하루 두었다 지운다)
G.push({ path: 'popupNotices', fn: function (val, w, up, path) {
    gEach(val, path, function (x, p1) { if (sh(x, 'at', lt, w)) put(up, p1, x, 'at'); });
} });

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
function lastEnd() {
    if (typeof window.restWindows !== 'function') return 0;
    const now = srv();
    const all = window.restWindows(0, now).filter(function (w) { return w.b <= now; });
    return all.length ? all[all.length - 1].b : 0;
}
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
        // ★ 밀기가 계속 실패해도 효과가 영영 안 끝나는 일은 없게 — 쉬는 시간이 끝나고 10분이 지나면 기다리지 않는다
        const w = function () {
            if (window.timeFreezePending() && srv() - lastEnd() < 10 * 60000) { run(); return; }
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
