// ==========================================
// ★ 상담사만 주는 옷 — 선물함으로 받으면 옷장으로 (2026-10-19)
// bundles.json 마지막 묶음, preg-admin.js 뒤
// ==========================================
//
// ■ 무엇인가
//
//   제작자 의상 · 제작자 겉옷 · 제작자 신발 · 뉴비 새싹.
//   상점 · 뽑기에는 없다. 상담사가 「물품 강제 꽂기」로 고르면
//   선물함으로 가고, 사원이 받는 순간 소지품이 아니라 옷장으로 들어간다
//   (giftbox.js 의 GIFT_WEAR — 유리 펜과 같은 길). 상담사 옷장에는 늘 보인다.
//
//   옷장 자리 (closet.js)
//       제작자 의상   겉옷 칸     (정장 · 드레스와 같은 칸)
//       제작자 겉옷   망토 칸     (의상과 따로 — 같이 입는다. 바깥은 머리 위 · 안쪽은 머리카락 뒤)
//       제작자 신발   구두 칸
//       뉴비 새싹     악세 칸 (머리)
//
//   소지품에 남는 일은 없지만, 혹시 다른 길로 소지품에 들어오면 「사용」으로 옷장에 넣는다.
//   ★ 밀실 거래 (2026-10-19) — 제작자 의상 · 겉옷 · 신발(과 유리 펜)은 옷장에 든 것을 밀실 거래로
//     주고받을 수 있다. 처음 나눠 주는 것은 여전히 상담사만. 뉴비 새싹은 거래하지 않는다 (noTrade).
//
// ■ 콘솔
//   wearGiftState()

(function wearGift() {

const LIST = [
    { n: '제작자 의상', k: 'maker-outfit',  slot: '겉옷', d: '[의상] 제작자의 옷. 옷장 겉옷 칸에서 입는다.' },
    { n: '제작자 겉옷', k: 'maker-outer',   slot: '망토', d: '[의상] 제작자의 고양이 귀 겉옷. 옷장 망토 칸에서 입는다.' },
    { n: '제작자 신발', k: 'maker-shoes',   slot: '구두', d: '[의상] 제작자의 신발. 옷장 구두 칸에서 신는다.' },
    { n: '뉴비 새싹',   k: 'newbie-sprout', slot: '악세', d: '[악세] 머리 위에 돋은 새싹. 옷장 악세 칸에서 단다.' }
];
const BY = {};
LIST.forEach(function (x) { BY[x.n] = x; });

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function copyFlags(from, to) { Object.keys(from).forEach(function (k) { try { to[k] = from[k]; } catch (e) { } }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

// 선물함이 받는 순간 옷장으로 넣는 표
window.GIFT_WEAR = window.GIFT_WEAR || {};
LIST.forEach(function (x) { window.GIFT_WEAR[x.n] = { k: x.k, slot: x.slot + ' 칸' }; });

// 물품 표 — 상담사 「물품 강제 꽂기」 목록에 뜨게
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        LIST.forEach(function (x) {
            if (!ITEM_CATALOG[x.n]) {
                ITEM_CATALOG[x.n] = { price: 0, usable: true, targetable: false, effect: 'wear_gift', noSell: true, desc: x.d };
            }
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(x.n) < 0) NO_SELL_ITEMS.push(x.n);
        });
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 소지품에 들어와 있는 것 → 옷장으로
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._wearGift) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            const x = BY[itemName];
            if (!x) return _u.apply(this, arguments);
            const u = u_();
            if (!u || !Array.isArray(u.inventory) || u.inventory.indexOf(itemName) < 0) return;
            if (!u.wardrobe || typeof u.wardrobe !== 'object') u.wardrobe = {};
            if (u.wardrobe[x.k]) { alert_(x.n + '은(는) 이미 옷장에 있습니다.'); return; }
            u.wardrobe[x.k] = 1;
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, itemName, 1); } catch (e) { }
            try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[' + x.n + '] 옷장 ' + x.slot + ' 칸에 넣었습니다.'); } catch (e) { }
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(x.n + '\n\n옷장 ' + x.slot + ' 칸에 들어왔습니다.\n옷장이나 광장 가방에서 입을 수 있습니다.');
        };
        copyFlags(_u, w);
        w._wearGift = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

window.wearGiftState = function () {
    const u = u_();
    console.log('%c===== 상담사만 주는 옷 =====', 'color:#c9a8ff; font-size:13px');
    console.table(LIST.map(function (x) {
        return { 물품: x.n, 옷장: x.slot, 열쇠: x.k, 가졌나: !!(u && u.wardrobe && u.wardrobe[x.k]) ? 'O' : '-',
                 물품표: (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[x.n]) ? 'O' : '✗' };
    }));
};

})();
