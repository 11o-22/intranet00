// ==========================================
// ★ 상담사만 주는 옷 — 선물함으로 받으면 옷장으로 (2026-10-19)
// bundles.json 마지막 묶음, preg-admin.js 뒤
// ==========================================
//
// ■ 무엇인가
//
//   제작자 의상 · 제작자 겉옷 · 제작자 신발 · 뉴비 새싹 · 늑대 잠옷 (2026-10-21) · 사운드 의상 · 코트 · 레빗 헤드셋 · 신발 · LP 판 (2026-10-23)
//   · 뉴비 의상 · 뉴비 장화 · 뉴비 병아리 후드 · 잎 우산 (2026-10-25 · 뉴비 세트 — 뉴비 새싹처럼 거래하지 않는다).
//   상점 · 뽑기에는 없다. 상담사가 「물품 강제 꽂기」로 고르면
//   선물함으로 가고, 사원이 받는 순간 소지품이 아니라 옷장으로 들어간다
//   (giftbox.js 의 GIFT_WEAR — 유리 펜과 같은 길). 상담사 옷장에는 늘 보인다.
//
//   옷장 자리 (closet.js)
//       제작자 의상   겉옷 칸     (정장 · 드레스와 같은 칸)
//       제작자 겉옷   망토 칸     (의상과 따로 — 같이 입는다. 바깥은 머리 위 · 안쪽은 머리카락 뒤)
//       제작자 신발   구두 칸
//       뉴비 새싹     악세 칸 (머리)
//       늑대 잠옷     겉옷 칸     (제작자 겉옷과 같은 두 장 — 바깥은 머리 위 · 후드 그림자는 머리카락 뒤)
//                     ★ 처음엔 망토 칸이었다 — 망토 칸에 입혀 둔 것은 들어올 때 겉옷 칸으로 옮긴다 (아래 moveWolf)
//
//   소지품에 남는 일은 없지만, 혹시 다른 길로 소지품에 들어오면 「사용」으로 옷장에 넣는다.
//   ★ 밀실 거래 (2026-10-19) — 제작자 의상 · 겉옷 · 신발(과 유리 펜)은 옷장에 든 것을 밀실 거래로
//     주고받을 수 있다. 처음 나눠 주는 것은 여전히 상담사만. 뉴비 새싹 · 늑대 잠옷은 거래하지 않는다 (noTrade).
//     ★ 사운드 세트(의상 · 코트 · 레빗 헤드셋 · 신발 · LP 판)는 밀실 거래가 된다 (2026-10-24).
//
// ■ 콘솔
//   wearGiftState()

(function wearGift() {

const LIST = [
    { n: '제작자 의상', k: 'maker-outfit',  slot: '겉옷', d: '[의상] 제작자의 옷. 옷장 겉옷 칸에서 입는다.' },
    { n: '제작자 겉옷', k: 'maker-outer',   slot: '망토', d: '[의상] 제작자의 고양이 귀 겉옷. 옷장 망토 칸에서 입는다.' },
    { n: '제작자 신발', k: 'maker-shoes',   slot: '구두', d: '[의상] 제작자의 신발. 옷장 구두 칸에서 신는다.' },
    { n: '뉴비 새싹',   k: 'newbie-sprout', slot: '악세', d: '[악세] 머리 위에 돋은 새싹. 옷장 악세 칸에서 단다.' },
    { n: '늑대 잠옷',   k: 'wolf-pj',       slot: '겉옷', d: '[의상] 늑대 귀 후드에 꼬리까지 달린 잠옷. 옷장 겉옷 칸에서 입는다.' },
    // 사운드 세트 (2026-10-23) — 코트는 그림자 장까지 같이 입는다 (closet.js)
    { n: '사운드 의상',        k: 'sound-outfit',  slot: '겉옷', d: '[의상] 사운드 세트의 옷. 옷장 겉옷 칸에서 입는다.' },
    { n: '사운드 코트',        k: 'sound-coat',    slot: '망토', d: '[의상] 사운드 세트의 코트. 옷장 망토 칸에서 입는다.' },
    { n: '사운드 레빗 헤드셋', k: 'sound-headset', slot: '악세', d: '[악세] 토끼 귀가 달린 헤드셋. 옷장 악세 칸에서 단다.' },
    { n: '사운드 신발',        k: 'sound-shoes',   slot: '구두', d: '[의상] 사운드 세트의 신발. 옷장 구두 칸에서 신는다.' },
    { n: 'LP 판',              k: 'sound-lp',      slot: '악세', d: '[악세] 발밑에서 도는 LP 판. 옷장 악세 칸에서 단다. 달고 광장에 서면 LP 단추로 피아노를 치거나 디스코 조명을 켤 수 있다.' },
    // 뉴비 세트 (2026-10-25) — 후드는 그림자 장까지 · 잎 우산은 웅덩이 · 빗물 · 줄기까지 같이 단다 (closet.js)
    { n: '뉴비 의상',          k: 'newbie-outfit', slot: '겉옷', d: '[의상] 노란 윗옷에 보라 반바지. 옷장 겉옷 칸에서 입는다.' },
    { n: '뉴비 장화',          k: 'newbie-boots',  slot: '구두', d: '[의상] 하늘색 장화. 옷장 구두 칸에서 신는다.' },
    { n: '뉴비 병아리 후드',   k: 'newbie-hood',   slot: '망토', d: '[의상] 빨간 병아리 후드. 옷장 망토 칸에서 입는다.' },
    { n: '잎 우산',            k: 'leaf-umb',      slot: '악세', d: '[악세] 커다란 잎 한 장을 우산처럼 든다. 옷장 악세 칸에서 단다. 달고 있는 동안 잎 위로 비가 내리고 발밑에 물이 고인다.' },
    // 검은 고양이 헤일로 (2026-10-31) — 상담사만 준다 · 거래하지 않는다 (closet.js noTrade). 악세 칸 · 「등」 줄
    { n: '검은 고양이 헤일로', k: 'cat-halo',      slot: '악세', d: '[악세] 등 뒤로 붉은 헤일로가 번지고, 검은 고양이 한 마리가 곁을 따라다닌다. 걸으면 내려와 함께 걷고, 멈추면 어깨 위로 뛰어오른다. 옷장 악세 칸에서 단다.' },
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

// 늑대 잠옷을 망토 칸에 입혀 둔 것 → 겉옷 칸으로 (2026-10-21 — 칸을 옮겼다)
setInterval(function () {
    try {
        const u = u_();
        if (!u || !u.dot || typeof u.dot !== 'object' || u.dot.cape !== 'wolf') return;
        u.dot.cape = '';
        u.dot.outer = 'wolf';
        if (typeof saveFields === 'function') saveFields({ dot: 1 });
        console.log('[늑대 잠옷] 망토 칸 → 겉옷 칸으로 옮겼습니다');
    } catch (e) { }
}, 3000);

window.wearGiftState = function () {
    const u = u_();
    console.log('%c===== 상담사만 주는 옷 =====', 'color:#c9a8ff; font-size:13px');
    console.table(LIST.map(function (x) {
        return { 물품: x.n, 옷장: x.slot, 열쇠: x.k, 가졌나: !!(u && u.wardrobe && u.wardrobe[x.k]) ? 'O' : '-',
                 물품표: (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[x.n]) ? 'O' : '✗' };
    }));
};

})();
