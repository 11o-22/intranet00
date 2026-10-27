// ==========================================
// ★ 사원증 뱃지 · 누군가가 쓴 부적 — 둘까지만 찬다 (2026-10-27)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
//   두 가지를 합쳐 장착 두 개까지 (뱃지 둘 · 부적 둘 · 뱃지 하나 + 부적 하나).
//   효과도 둘까지 겹친다 — 슬롯 부적 몫 ×1.5 가 하나마다 (slot-curve.js) · 사원증 뱃지 행운 ×1.15 가 하나마다 (newitems.js).
//   셋째부터는 장착이 막힌다.

(function amuletStack() {
'use strict';
const SET = ['사원증 뱃지', '누군가가 쓴 부적'];
const MAX = 2;
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function worn(u) { return ((u && u.equippedWeapons) || []).filter(function (w) { return SET.indexOf(baseOf(w)) >= 0; }).length; }
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || useInventoryItem._amuletStack) return;
        const _u = useInventoryItem;
        const w = function (itemName) {
            try {
                if (SET.indexOf(itemName) >= 0 && currentUser && worn(currentUser) >= MAX) {
                    window._invOk = null;
                    showCustomAlert('사원증 뱃지 · 누군가가 쓴 부적은 합쳐 ' + MAX + '개까지만 찰 수 있습니다.\n\n지금 ' + worn(currentUser) + '개를 차고 있습니다.');
                    return;
                }
            } catch (e) { }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._amuletStack = true;
        useInventoryItem = w; try { window.useInventoryItem = w; } catch (e) { }
        clearInterval(iv);
    }, 600);
})();
})();
