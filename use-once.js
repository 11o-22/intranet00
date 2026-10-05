// ==========================================
// ★ 한 번 쓰면 한 개만 — 물건이 두 개씩 사라지는 것
// bundles.json 마지막 그룹, save-merge.js 앞 (맨 뒤에 가까울수록 좋다)
// ==========================================
//
// ■ 무엇이 일어나고 있나
//
//   물약 하나를 썼는데 두 개가 사라집니다.
//
//   소지품을 쓰는 길에는 지금 열 겹 넘게 손이 얹혀 있습니다.
//   useInventoryItem 을 감싸는 파일이 열두 개, applyItemEffect 를 감싸는
//   파일이 여덟 개입니다. 그 가운데 어느 둘이 같은 한 번의 사용에서
//   각각 removeItemFromInventory 를 부르면 두 개가 빠집니다.
//
//   원래 자리도 그렇게 생겨 있습니다. (index.html:6947)
//
//       let usedSuccessfully = applyItemEffect(currentUser, itemName, false);
//       if (usedSuccessfully) {
//           removeItemFromInventory(currentUser, itemName, 1);     ← 여기서 한 번
//
//   감싼 쪽이 효과를 처리하면서 이미 빼 놓고 true 를 돌려주면, 여기서
//   한 번 더 빠집니다. equip-fix.js 는 빼기 전에 개수를 세어 두어 두 번
//   빼지 않는데(equip-fix.js:50), 그렇게 조심하지 않는 곳이 있습니다.
//
// ■ 어떻게 고치나
//
//   범인을 하나하나 찾는 대신, 길목을 지킵니다.
//
//   「한 번의 사용에서 그 물건은 한 개까지만 빠진다」
//
//   useInventoryItem 이 불리면 그 물건 이름을 짧은 동안 적어 둡니다.
//   그 사이에 같은 물건을 두 번째로 빼려 하면 막고 콘솔에 적습니다.
//   어느 파일이 두 번 빼려 했는지도 같이 남으므로 범인도 드러납니다.
//
//   창을 띄워 상대를 고르는 물건은 고른 뒤에 빠지므로 창이 지키는
//   시간(WINDOW)을 지나 있습니다. 그런 길은 원래대로 한 개만 빠집니다.
//
// ■ 막힌 기록 보기
//
//   useOnce()      무엇이 몇 번 막혔는지
//   useOnceOff()   끄기 (살펴보실 때만)

(function useOnce() {

const WINDOW = 2500;       // 한 번의 사용으로 보는 시간 (ms)
const CAP = 1;             // 그 사이 같은 물건을 몇 개까지 뺄 수 있나

let ON = true;
const live = {};           // 물건 이름 → { at, took }
const blocked = [];        // 막은 기록

function where() {
    // 어디서 불렀는지 — 호출 자리를 적어 둔다
    try {
        const s = (new Error()).stack || '';
        const lines = s.split('\n').slice(2, 7)
            .map(function (x) { return x.trim().replace(/^at\s+/, ''); })
            .filter(function (x) { return x && x.indexOf('use-once') < 0; });
        return lines.slice(0, 3).join('  ←  ');
    } catch (e) { return ''; }
}

// --- 사용이 시작되면 적어 둔다 ---
(function markUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._useOnce) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (ON && itemName) live[itemName] = { at: Date.now(), took: 0 };
            return _u.apply(this, arguments);
        };
        useInventoryItem._useOnce = true;
        clearInterval(iv);
        console.log('[한번만] 사용 길목 연결');
    }, 300);
})();

// --- 두 번째 빼기를 막는다 ---
(function capRemove() {
    const iv = setInterval(function () {
        if (typeof removeItemFromInventory !== 'function') return;
        if (removeItemFromInventory._useOnce) { clearInterval(iv); return; }
        const _r = removeItemFromInventory;
        removeItemFromInventory = function (user, name, qty) {
            if (!ON || !currentUser || user !== currentUser || !name) {
                return _r.apply(this, arguments);
            }
            const s = live[name];
            if (!s || (Date.now() - s.at) > WINDOW) {
                return _r.apply(this, arguments);        // 이 사용과 상관없는 빼기
            }
            const want = (qty == null) ? 1 : qty;
            const left = Math.max(0, CAP - s.took);
            if (left <= 0) {
                blocked.push({ 때: new Date().toLocaleTimeString(), 물건: name,
                               막은개수: want, 자리: where() });
                while (blocked.length > 60) blocked.shift();
                console.warn('%c[한번만] ' + name + ' — 두 번째 빼기를 막았습니다. '
                    + '(한 번 쓰면 한 개까지)', 'color:#ff8a65');
                console.warn('         부른 자리: ' + blocked[blocked.length - 1].자리);
                return;
            }
            s.took += Math.min(want, left);
            return _r.call(this, user, name, Math.min(want, left));
        };
        removeItemFromInventory._useOnce = true;
        clearInterval(iv);
        console.log('[한번만] 빼기 길목 연결 — 한 번 쓰면 한 개까지');
    }, 300);
})();

// 묵은 표시를 치운다
setInterval(function () {
    const t = Date.now();
    Object.keys(live).forEach(function (k) {
        if (t - live[k].at > WINDOW * 4) delete live[k];
    });
}, 10000);

// ==========================================
// 확인
// ==========================================
window.useOnce = function () {
    console.log('%c===== 한 번 쓰면 한 개 =====', 'color:#ff8a65; font-size:13px');
    console.log('  켜짐:', ON ? 'O' : '✗', '· 보는 시간:', WINDOW + 'ms', '· 한도:', CAP + '개');
    console.log('  연결:',
        'useInventoryItem', (typeof useInventoryItem === 'function' && useInventoryItem._useOnce) ? 'O' : '✗',
        '· removeItemFromInventory', (typeof removeItemFromInventory === 'function' && removeItemFromInventory._useOnce) ? 'O' : '✗');
    if (!blocked.length) { console.log('  막은 것이 없습니다. (두 개씩 사라지는 일이 없다는 뜻입니다)'); return; }
    console.table(blocked.slice(-25));
    const by = {};
    blocked.forEach(function (b) { by[b.물건] = (by[b.물건] || 0) + 1; });
    console.warn('  두 번 빼려 한 물건:', Object.keys(by).map(function (k) {
        return k + ' ' + by[k] + '번';
    }).join(' · '));
    console.log('  「자리」에 적힌 파일이 두 번 빼는 쪽입니다. 그걸 알려 주시면 뿌리를 고칩니다.');
};

window.useOnceOff = function (v) {
    ON = (v !== false) ? false : true;
    console.log('[한번만] ' + (ON ? '켰습니다' : '껐습니다'));
};

console.log('[한번만] useOnce() 로 막은 기록을 봅니다');

})();
