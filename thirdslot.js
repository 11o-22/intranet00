// ==========================================
// ★ 세 번째 자리 — 재료와 조합
// index.html 에서 dark.js 다음에 불러온다
// ==========================================

// --- 재료 ---
ITEM_CATALOG['덮이지 않은 장'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 책이 덮일 때 딸려 나온 한 장. 접히지 않는다."
};
ITEM_CATALOG['아물지 않은 자리'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 물린 자국이 아니라 물기 전의 자리. 아직 비어 있다."
};
ITEM_CATALOG['떠오르지 않는 숨'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 내쉬었는데 올라가지 않았다. 손안에서 무겁다."
};

// --- 드롭 등록 (기존 재료의 1/5 확률) ---
(function registerThirdMats() {
    const base = { '맞물리지 않는 조각': 0, '지워지지 않는 자국': 0, '반죽에 섞이지 않은 것': 0 };

    Object.keys(DARK_LOOT_BY_ZONE).forEach(z => {
        DARK_LOOT_BY_ZONE[z].forEach(l => {
            if (base[l.name] !== undefined && l.chance > base[l.name]) base[l.name] = l.chance;
        });
    });

    const avg = (base['맞물리지 않는 조각'] + base['지워지지 않는 자국'] + base['반죽에 섞이지 않은 것']) / 3;
    const rate = (avg > 0 ? avg : 0.05) / 5;

    const add = (zone, name) => {
        if (!DARK_LOOT_BY_ZONE[zone]) DARK_LOOT_BY_ZONE[zone] = [];
        if (DARK_LOOT_BY_ZONE[zone].some(l => l.name === name)) return;
        DARK_LOOT_BY_ZONE[zone].push({ name: name, chance: rate });
    };

    add('Qtrew-S-003', '덮이지 않은 장');
    add('Qtrew-S-010', '아물지 않은 자리');
    add('Qtrew-A-667', '떠오르지 않는 숨');

    console.log(`[세 번째 자리] 재료 드롭률 ${(rate * 100).toFixed(2)}% (기존 재료의 1/5)`);
})();

// --- 조합 ---
const THIRD_MATS = ['덮이지 않은 장', '아물지 않은 자리', '떠오르지 않는 숨'];

function hasThirdMats() {
    if (!currentUser) return false;
    return THIRD_MATS.every(m => (currentUser.inventory || []).includes(m));
}

function combineThirdSlot() {
    if (!buyGuard()) return;
    const g = getGear(currentUser);
    if (!g) { showCustomAlert('전용 장비가 없습니다.'); return; }
    if ((g.slots || 1) < 2) { showCustomAlert('두 번째 자리를 먼저 열어야 합니다.'); return; }
    if ((g.slots || 1) >= 3) { showCustomAlert('이미 세 자리가 모두 열려 있습니다.'); return; }
    if ((currentUser.inventory || []).includes('세 번째 자리')) {
        showCustomAlert('이미 조합해 둔 것이 있습니다.'); return;
    }
    if (!hasThirdMats()) { showCustomAlert('재료가 모자랍니다.'); return; }

    THIRD_MATS.forEach(m => removeItemFromInventory(currentUser, m, 1));
    currentUser.inventory.push('세 번째 자리');
    addHistoryLog(currentUser, `[조합] 세 번째 자리를 만들었습니다.`);
    saveSelfFull();
    updateUI();

    showCustomAlert(
        '세 조각이 맞물립니다.\n\n' +
        '덮이지 않은 장이 자리를 만들고,\n' +
        '아물지 않은 자리가 그것을 붙잡고,\n' +
        '떠오르지 않는 숨이 그 안을 채웁니다.\n\n' +
        '소지품에서 사용하세요.'
    );
}