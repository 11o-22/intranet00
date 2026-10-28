// ==========================================
// ★ 익명 편지 — 유쾌 판매소 상시 진열 · 200 P (2026-10-29)
// bundles.json 마지막 묶음 맨 끝 (skip.js · skin.js · chilseong.js 뒤 — 진열 목록을 마지막에 손본다)
// ==========================================
//
//   전에는 ALL_10_ITEMS 스물다섯 가운데 그날 무작위로 여덟만 나와, 익명 편지가 안 뜨는 날이 있었다.
//   이제 날마다 맨 앞에 늘 있다. 값은 20 → 200 P. 하루 3개 한도(유쾌 판매소 공통)는 그대로.
//
// ■ 콘솔
//   letterShopState()

(function letterShop() {

const ITEM = '익명 편지';
const PRICE = 200;

// 1. 값
(function price() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[ITEM]) return;
        ITEM_CATALOG[ITEM].price = PRICE;
        clearInterval(iv);
    }, 300);
})();

// 2. 늘 진열 — 다른 고정 진열(스킵권 · 벽지 견본첩) 뒤에 두지 않고 맨 앞에
(function pin() {
    const iv = setInterval(function () {
        if (typeof getToday5ShopItems !== 'function' || getToday5ShopItems._letter) return;
        const _g = getToday5ShopItems;
        const w = function () {
            const list = _g.apply(this, arguments).filter(function (n) { return n !== ITEM; });
            return [ITEM].concat(list);
        };
        Object.keys(_g).forEach(function (k) { try { w[k] = _g[k]; } catch (e) { } });
        w._letter = true;
        getToday5ShopItems = w;
        try { window.getToday5ShopItems = w; } catch (e) { }
        clearInterval(iv);
        console.log('[익명 편지] 유쾌 판매소 상시 진열 · ' + PRICE + ' P');
    }, 300);
})();

window.letterShopState = function () {
    const list = (typeof getToday5ShopItems === 'function') ? getToday5ShopItems() : [];
    console.log('%c===== 익명 편지 =====', 'color:#ffcc80; font-size:13px');
    console.log('  값:', (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[ITEM]) ? ITEM_CATALOG[ITEM].price + ' P' : '-', '· 진열:', list.indexOf(ITEM) >= 0 ? list.indexOf(ITEM) + 1 + '번째' : '없음', '/', list.length + '개');
};

})();
