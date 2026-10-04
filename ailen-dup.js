// ==========================================
// ★ 우주 쇼핑몰 — 같은 품목이 두 줄로 뜨는 것
// bundles.json 마지막 그룹 아무 데나
// ==========================================
//
// ■ 어디를 봤나
//
//   진열은 두 자리에서 나온다.
//
//     보통 사원  currentUser.alienUnlockedItems      (index.html:9144)
//     상담사     ALIEN_ITEMS_POOL 통째로              (index.html:9144 같은 줄)
//
//   쌓는 자리는 전부 중복을 막고 있다.
//
//     index.html:9112   if (!...includes(it)) push
//     newitems.js:160   if (!...includes(n)) push
//     newitems2.js:1432 if (...indexOf(nm) < 0) push
//     sapphire.js:26    if (!...includes(n)) push
//     newitems2.js:1525 소속이 안 맞는 것을 바꿔 끼울 때도 이미 있는 것은 뺀다
//
//   그러니 코드가 지금 새로 만들어 내는 것 같지는 않다.
//   예전 판에서 들어가 저장되어 있던 것이 남아 돌고 있을 가능성이 크다.
//
// ■ 무엇을 하나
//
//   1. 두 자리 모두 그릴 때마다 겹친 이름을 걷어낸다 (앞엣것을 남긴다)
//   2. 내 진열대가 바뀌었으면 서버에도 고쳐 쓴다
//   3. 겹친 것이 보이면 어디서 몇 개였는지 콘솔에 적는다
//
//   3번이 중요하다. 이 줄이 계속 찍히면 지금도 새로 생기고 있다는 뜻이다.
//   그 기록을 알려 주시면 만들어 내는 자리를 찾을 수 있다.

(function alienDup() {

function dedup(arr) {
    const seen = {}, out = [], dup = [];
    for (let i = 0; i < arr.length; i++) {
        const n = arr[i];
        if (seen[n]) { dup.push(n); continue; }
        seen[n] = 1;
        out.push(n);
    }
    return { out: out, dup: dup };
}

let told = {};
function tell(where, dup) {
    if (!dup.length) return;
    const key = where + '|' + dup.sort().join(',');
    if (told[key]) return;              // 같은 말을 되풀이하지 않는다
    told[key] = 1;
    console.warn('[우주] ' + where + ' 에서 겹친 품목 ' + dup.length + '개 — ' + dup.join(', '));
}

// --- 목록 자체 ---
function cleanPool() {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !Array.isArray(ALIEN_ITEMS_POOL)) return;
    const r = dedup(ALIEN_ITEMS_POOL);
    if (!r.dup.length) return;
    tell('ALIEN_ITEMS_POOL', r.dup.slice());
    ALIEN_ITEMS_POOL.length = 0;
    r.out.forEach(function (n) { ALIEN_ITEMS_POOL.push(n); });
}

// --- 내 진열대 ---
function cleanMine() {
    if (!currentUser || !Array.isArray(currentUser.alienUnlockedItems)) return;
    const r = dedup(currentUser.alienUnlockedItems);
    if (!r.dup.length) return;
    tell('내 진열대', r.dup.slice());
    currentUser.alienUnlockedItems = r.out;
    if (typeof saveFields === 'function') {
        try { saveFields({ alienUnlockedItems: 1 }); } catch (e) { }
    }
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof renderAlienShop !== 'function') return;
        if (renderAlienShop._noDup) { clearInterval(iv); return; }
        const _r = renderAlienShop;
        renderAlienShop = function () {
            cleanPool();
            cleanMine();
            return _r.apply(this, arguments);
        };
        renderAlienShop._noDup = true;
        clearInterval(iv);
        console.log('[우주] 중복 진열 정리 연결');
    }, 400);
})();

// 입고될 때도 한 번 본다
(function hookWin() {
    const iv = setInterval(function () {
        if (typeof updateUI !== 'function') return;
        if (updateUI._alienDup) { clearInterval(iv); return; }
        const _u = updateUI;
        updateUI = function () {
            const r = _u.apply(this, arguments);
            try { cleanMine(); } catch (e) { }
            return r;
        };
        updateUI._alienDup = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.alienDupState = function () {
    console.log('%c===== 우주 쇼핑몰 중복 =====', 'color:#00A2E8; font-size:13px');

    const pool = (typeof ALIEN_ITEMS_POOL !== 'undefined') ? ALIEN_ITEMS_POOL : [];
    const pr = dedup(pool);
    console.log('  ALIEN_ITEMS_POOL ' + pool.length + '종 · 겹침 '
        + (pr.dup.length ? pr.dup.join(', ') : '없음'));

    const mine = (currentUser && currentUser.alienUnlockedItems) || [];
    const mr = dedup(mine);
    console.log('  내 진열대 ' + mine.length + '칸 · 겹침 '
        + (mr.dup.length ? mr.dup.join(', ') : '없음'));
    if (mine.length) console.log('   ', mine.join(' · '));

    // 상담사면 전 사원을 훑는다
    if (!currentUser || currentUser.code !== 'kario0987') return;
    if (typeof database === 'undefined' || !database) return;
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {}, rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!Array.isArray(u.alienUnlockedItems)) return;
            const d = dedup(u.alienUnlockedItems);
            if (!d.dup.length) return;
            rows.push({ 사원: u.name || c, 사번: u.no || '-',
                        칸: u.alienUnlockedItems.length, 겹침: d.dup.join(', ') });
        });
        console.log('  — 전 사원 —');
        if (rows.length) { console.table(rows); console.log('  고치려면 alienDupFixAll()'); }
        else console.log('  겹친 사원이 없습니다.');
    });
};

// 전 사원 정리 — 상담사용
window.alienDupFixAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {}, up = {}, rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!Array.isArray(u.alienUnlockedItems)) return;
            const d = dedup(u.alienUnlockedItems);
            if (!d.dup.length) return;
            up['users/' + c + '/alienUnlockedItems'] = d.out;
            rows.push({ 사원: u.name || c, 전: u.alienUnlockedItems.length, 후: d.out.length });
        });
        if (!rows.length) { console.log('고칠 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.table(rows);
            console.log('%c✓ ' + rows.length + '명 정리했습니다.', 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

console.log('[우주] alienDupState() · alienDupFixAll()');

})();