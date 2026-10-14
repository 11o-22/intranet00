// ==========================================
// ★ 🎟️ 스킵권 — 걸어가지 않고 바로 들어간다
// bundles.json 마지막 묶음, shell.js 바로 뒤
// ==========================================
//
// ■ 왜 생겼나
//
//   목록(☰)에서 고르면 이제 **그 자리로 걸어가야** 들어갈 수 있다.
//   광장이 집이 된 뒤로 걸음이 곧 놀이라서 그렇게 두었는데, 늘 걸어
//   다니기만 하면 번거로운 날도 있다. 그 날을 위한 표다.
//
//       유쾌 판매소에서 장당 500 P · 하루 다섯 장까지
//       쓰면 목록이 바로 뜨고, 거기서 고른 곳으로 **그 자리에서** 들어간다
//
//   한 장에 한 번이다. 목록을 열어 두고 안 고르면 표는 그대로 살아 있다
//   (고르는 순간 쓰인다).
//
// ■ 어떻게 이어 붙였나
//
//   가게·소지품은 skin.js 가 하던 대로 **원래 함수를 감싸서** 붙인다.
//   광장 쪽은 plaza.js 가 내어 준 두 문만 쓴다.
//
//       plazaSkipArm()   한 번은 걸어가지 않고 바로 들어간다
//       plazaMenu()      목록을 띄운다
//
// ■ 콘솔
//       skipState()   오늘 몇 장 샀나 · 지금 표가 켜져 있나

const SKIP_ITEM = '🎟️ 스킵권';
const SKIP_DAILY = 5;      // 유쾌 판매소 하루 구매 한도
const SKIP_PRICE = 500;

ITEM_CATALOG[SKIP_ITEM] = {
    price: SKIP_PRICE, usable: true, targetable: false, effect: 'skip_pass',
    desc: '걸어가지 않는다. 쓰면 목록이 뜨고, 고른 곳으로 그 자리에서 바로 들어간다.'
};

// 우주 쇼핑몰에는 안 넣는다 (유쾌 판매소 고정 진열)
if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
    const _i = ALIEN_ITEMS_POOL.indexOf(SKIP_ITEM);
    if (_i > -1) ALIEN_ITEMS_POOL.splice(_i, 1);
}

(function skipPass() {

function boughtToday() {
    try {
        const key = getShopCycleKey();
        return ((currentUser.purchaseRecord || {})[key] || {})['item_' + SKIP_ITEM] || 0;
    } catch (e) { return 0; }
}

// ── 표를 쓴다
function useSkip(itemName) {
    if (!currentUser) return;
    if (typeof window.plazaSkipArm !== 'function' || !document.querySelector('#plaza-ov')) {
        showCustomAlert('광장에 있을 때만 쓸 수 있습니다.');
        return;
    }
    // ★ 소지품에서 먼저 빼지 않는다 — 목록을 열어 두고 안 고를 수도 있다.
    //   고르는 순간 plaza.js 가 아래 거둠표를 불러 그때 뺀다.
    window.plazaSkipArm(function spend() {
        const i = currentUser.inventory.indexOf(itemName);
        if (i < 0) return false;                       // 그새 없어졌다
        currentUser.inventory.splice(i, 1);
        addHistoryLog(currentUser, '[스킵권] 걸어가지 않고 바로 들어갔습니다.');
        saveFields({ inventory: 1, history: 1 });
        updateUI();
        return true;
    });
    if (typeof window.plazaMenu === 'function') window.plazaMenu();
}

// ── 기존 함수에 이어 붙인다
(function hook() {
    const _useInventoryItem = useInventoryItem;
    useInventoryItem = function (itemName) {
        const c = ITEM_CATALOG[itemName];
        if (c && c.effect === 'skip_pass') { useSkip(itemName); return; }
        return _useInventoryItem.apply(this, arguments);
    };

    // 유쾌 판매소 — 맨 앞에 고정으로 진열한다
    const _getToday5ShopItems = getToday5ShopItems;
    getToday5ShopItems = function () {
        const list = _getToday5ShopItems.apply(this, arguments).filter(function (n) { return n !== SKIP_ITEM; });
        return [SKIP_ITEM].concat(list);
    };

    const _buyRegularShopItem = buyRegularShopItem;
    buyRegularShopItem = function (itemId, itemName, price) {
        if (itemName !== SKIP_ITEM) return _buyRegularShopItem.apply(this, arguments);
        if (!buyGuard()) return;
        if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 상점을 이용할 수 없습니다.'); return; }
        const key = getShopCycleKey();
        if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
        if (!currentUser.purchaseRecord[key]) currentUser.purchaseRecord[key] = {};
        const bought = currentUser.purchaseRecord[key][itemId] || 0;
        if (currentUser.code !== 'kario0987' && bought >= SKIP_DAILY) {
            showCustomAlert('스킵권은 하루 ' + SKIP_DAILY + '장까지 살 수 있습니다.'); return;
        }
        if (currentUser.points < price) { showLuxuryAlert(); return; }
        currentUser.points -= price;
        currentUser.purchaseRecord[key][itemId] = bought + 1;
        currentUser.inventory.push(itemName);
        addHistoryLog(currentUser, '[상점 구매] ' + itemName + ' (-' + price + ' P)');
        saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
        updateUI();
    };

    // 진열 줄의 잔여 표기를 하루 한도(5장)에 맞춘다
    const _renderRegularShop = renderRegularShop;
    renderRegularShop = function () {
        const r = _renderRegularShop.apply(this, arguments);
        const box = document.getElementById('regular-shop-items-container');
        if (!box || !currentUser) return r;
        const left = currentUser.code === 'kario0987' ? 99 : Math.max(0, SKIP_DAILY - boughtToday());
        Array.prototype.forEach.call(box.querySelectorAll('.shop-item'), function (el) {
            if (el.innerText.indexOf(SKIP_ITEM) < 0) return;
            const info = el.querySelector('span[style*="color:#888"]');
            if (info) info.innerHTML = ITEM_CATALOG[SKIP_ITEM].desc
                + ' (잔여: ' + (left === 99 ? '무제한' : left + '/' + SKIP_DAILY + '장') + ')';
            const btn = el.querySelector('button');
            if (btn) {
                const out = left === 0;
                btn.disabled = out;
                btn.innerText = out ? '품절' : SKIP_PRICE + ' P';
                el.classList.toggle('sold-out', out);
            }
        });
        return r;
    };
})();

window.skipState = function () {
    console.log('%c===== 🎟️ 스킵권 =====', 'color:#ffcf8f; font-size:13px');
    console.log('  오늘 산 장 :', boughtToday(), '/', SKIP_DAILY);
    console.log('  가진 장   :', (currentUser && currentUser.inventory || [])
        .filter(function (n) { return n === SKIP_ITEM; }).length);
    console.log('  지금 켜졌나 :', (typeof window.plazaSkipOn === 'function' && window.plazaSkipOn()) ? '예' : '아니오');
};

console.log('[스킵권] 유쾌 판매소 ' + SKIP_PRICE + ' P · 하루 ' + SKIP_DAILY + '장 — skipState()');

})();
