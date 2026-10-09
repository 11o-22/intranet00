// ==========================================
// ★ 서버가 지운 빈 칸을 도로 세운다
// bundles.json 마지막 묶음, 맨 앞쪽 (inv-shout.js 보다 앞이면 좋다)
// ==========================================
//
// ■ 이 게임에서 가장 자주 무는 함정
//
//   파이어베이스는 **빈 배열과 빈 객체를 지운다.** 값이 아니라 칸 자체가
//   없어진다. 그래서 돌려받은 사원 기록에는 `inventory` 라는 칸이
//   아예 없을 수 있고, 그다음 이런 줄이 터진다.
//
//       currentUser.inventory.push(x)      ← inventory 가 undefined
//       u.equippedWeapons.forEach(...)
//       h.pond[사번]
//
//   오늘 하루에만 두 번 물렸다.
//     · 소지품이 하나도 없는 사원이 출산하면 ③ 에서 터져 임신이 안 끝났다
//     · 마작은 패를 돌린 직후 melds·pond 가 통째로 없어 화면이 터졌다
//
//   index.html 에 normUser 가 있긴 한데 세 칸(inventory·history·letters)
//   만 세운다. 나머지 서른 칸은 비면 그대로 사라진다.
//
// ■ 어떻게 하나
//
//   1. 세워야 할 칸을 한곳에 적는다 (아래 ARR · OBJ).
//   2. 자료가 들어오는 길(normUser)을 감싸 그 자리에서 세운다.
//   3. 그 길을 못 잡았을 때를 대비해 **쓸어 담는 눈**을 하나 둔다.
//      2초마다 나와 전 사원을 훑는다. 겹쳐 두른 순서와 상관이 없다.
//
//   배열 칸이 **객체로** 돌아오는 것도 되돌린다. 파이어베이스는 중간이
//   빈 배열을 { "0":…, "2":… } 로 돌려주는데, 그러면 push·indexOf 가
//   없어서 똑같이 터진다.
//
// ■ 새 칸을 만들 때
//
//   사원 기록에 배열이나 객체 칸을 새로 쓰면 **아래 표에 이름만 보태면**
//   된다. 그러면 다시는 이 함정에 안 걸린다.
//
// ■ 콘솔
//   userNormState()        지금 몇 칸이 비어 있었는지
//   userNormNow()          손으로 한 번 훑기

(function userNorm() {

// 비면 서버가 지우는 칸들 — 줄 세운 것
const ARR = [
    'inventory', 'equippedWeapons', 'history', 'letters',
    'titles', 'titleAdmin', 'titleSaid',
    'alienUnlockedItems', 'alienBoughtItems', 'receivedRations',
    'timedEffects', 'itemBuffs', 'foxBuffs', 'foxNotes',
    'darkLogs', 'foxLogs', 'bathLogs',
    'borrowedGear', 'safeBoxes'
];
// 비면 서버가 지우는 칸들 — 이름표가 붙은 것
const OBJ = [
    'equipOwner', 'purchaseRecord', 'qshopRecord',
    'useCnt', 'dayUse', 'gearFull', 'gearLock',
    'nFlags', 'nPending', 'qPending',
    'copyExpire', 'cageGear', 'invFold', 'stolenGear'
];
// 전용 장비 속 칸
const GEAR_ARR = ['attrs', 'giftSlots'];
const GEAR_OBJ = ['attrGrades'];

let fixed = 0;              // 지금까지 세운 칸 수
const seen = {};            // 칸 이름 → 몇 번 비어 있었나

// 객체로 돌아온 배열을 배열로 되돌린다 ({ "0":a, "2":b } → [a, b])
function toArr(v) {
    if (Array.isArray(v)) return v;
    if (!v || typeof v !== 'object') return [];
    return Object.keys(v)
        .sort(function (a, b) { return Number(a) - Number(b); })
        .map(function (k) { return v[k]; })
        .filter(function (x) { return x !== null && x !== undefined; });
}

function mark(k) { fixed++; seen[k] = (seen[k] || 0) + 1; }

function fix(u) {
    if (!u || typeof u !== 'object') return u;

    for (let i = 0; i < ARR.length; i++) {
        const k = ARR[i];
        if (Array.isArray(u[k])) continue;
        if (u[k] === undefined || u[k] === null) { u[k] = []; mark(k); continue; }
        if (typeof u[k] === 'object') { u[k] = toArr(u[k]); mark(k + '(객체로 옴)'); }
    }
    for (let i = 0; i < OBJ.length; i++) {
        const k = OBJ[i];
        if (u[k] && typeof u[k] === 'object' && !Array.isArray(u[k])) continue;
        if (u[k] === undefined || u[k] === null) { u[k] = {}; mark(k); }
    }

    // 사원증 — 통째로 없거나 글 칸이 비어 사라진 경우
    if (!u.badge || typeof u.badge !== 'object') {
        u.badge = { photo: '', nickname: u.name || '', notes: '특이사항 없음' };
        mark('badge');
    } else {
        if (u.badge.notes === undefined || u.badge.notes === null) { u.badge.notes = '특이사항 없음'; mark('badge.notes'); }
        if (u.badge.photo === undefined || u.badge.photo === null) u.badge.photo = '';
        if (u.badge.nickname === undefined || u.badge.nickname === null) u.badge.nickname = u.name || '';
    }

    // 전용 장비
    const g = u.soulGear;
    if (g && typeof g === 'object') {
        GEAR_ARR.forEach(function (k) {
            if (Array.isArray(g[k])) return;
            if (g[k] === undefined || g[k] === null) { if (k === 'attrs') { g[k] = []; mark('soulGear.' + k); } return; }
            if (typeof g[k] === 'object') { g[k] = toArr(g[k]); mark('soulGear.' + k + '(객체로 옴)'); }
        });
        GEAR_OBJ.forEach(function (k) {
            if (g[k] && typeof g[k] === 'object' && !Array.isArray(g[k])) return;
            if (g[k] === undefined || g[k] === null) { g[k] = {}; mark('soulGear.' + k); }
        });
    }

    // 임신 — sires 가 비면 임신이 아닌 것이 맞으므로 **세우지 않는다.**
    //   여기서 []를 만들어 두면 「임신인데 아버지가 없다」가 되어 더 헷갈린다.
    //   돌봄 표만 세운다.
    const p = u.preg;
    if (p && typeof p === 'object') {
        if (Array.isArray(p.sires) === false && p.sires && typeof p.sires === 'object') {
            p.sires = toArr(p.sires); mark('preg.sires(객체로 옴)');
        }
        ['careAt', 'careCount'].forEach(function (k) {
            if (p[k] && typeof p[k] === 'object') return;
            if (p[k] === undefined || p[k] === null) { p[k] = {}; mark('preg.' + k); }
        });
    }
    return u;
}
window.userNormFix = fix;

// ==========================================
// 1. 자료가 들어오는 길에서 바로 세운다
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof normUser !== 'function') return;
        if (normUser._wide) { clearInterval(iv); return; }
        const _n = normUser;
        normUser = function (u) {
            const r = _n.apply(this, arguments);
            return r ? fix(r) : r;
        };
        normUser._wide = true;
        clearInterval(iv);
        console.log('[빈칸] 사원 자료가 들어오는 길에 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// 서버 것으로 내 기록을 갈아 끼우는 자리 — 끼운 직후에 바로 세운다.
// (여기도 네 칸만 세우고 있었다. 2초 눈을 기다리지 않게 한다)
(function hookApply() {
    const iv = setInterval(function () {
        if (typeof applyServerMe !== 'function') return;
        if (applyServerMe._wide) { clearInterval(iv); return; }
        const _a = applyServerMe;
        applyServerMe = function () {
            const r = _a.apply(this, arguments);
            try { if (typeof currentUser !== 'undefined' && currentUser) fix(currentUser); } catch (e) { }
            return r;
        };
        applyServerMe._wide = true;
        clearInterval(iv);
        console.log('[빈칸] 서버 갈아끼우는 자리에 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 2. 쓸어 담는 눈 — 겹쳐 두른 순서와 상관없이
// ==========================================
function sweep() {
    try { if (typeof currentUser !== 'undefined' && currentUser) fix(currentUser); } catch (e) { }
    try {
        const users = (typeof db !== 'undefined' && db.users) || null;
        if (!users) return;
        const keys = Object.keys(users);
        for (let i = 0; i < keys.length; i++) fix(users[keys[i]]);
    } catch (e) { }
}
window.userNormNow = function () {
    const before = fixed;
    sweep();
    console.log('✓ ' + (fixed - before) + '칸을 세웠습니다.');
};
sweep();
setInterval(sweep, 2000);

// ==========================================
// 확인
// ==========================================
window.userNormState = function () {
    console.log('%c===== 빈 칸 세우기 =====', 'color:#8fc9ff; font-size:13px');
    console.log('  지금까지 세운 칸:', fixed);
    const rows = Object.keys(seen).sort(function (a, b) { return seen[b] - seen[a]; })
        .map(function (k) { return { 칸: k, 세운횟수: seen[k] }; });
    if (rows.length) console.table(rows);
    else console.log('  비어 있던 칸이 없었습니다.');
    console.log('  보는 칸: 줄 ' + ARR.length + '개 · 이름표 ' + OBJ.length + '개 · 장비 '
        + (GEAR_ARR.length + GEAR_OBJ.length) + '개');
    console.log('  들어오는 길 연결:', (typeof normUser === 'function' && normUser._wide) ? 'O' : '✗ (쓸어 담는 눈만 돕니다)');
};

console.log('[빈칸] 서버가 지운 칸 세우기 — userNormState()');

})();
