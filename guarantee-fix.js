// ==========================================
// ★ 확정 승인서 재료 개편
// index.html 에서 epic.js · thirdslot.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 전
//     맨발의 자국         A-214   1.5%
//     여섯 번째 손가락     A-667   0.8%
//     누군가의 왼쪽 신발   B-330   0.2%   ← 병목. 평균 500판
//
// ■ 후
//     맨발의 자국         A-214   0.5%
//     여섯 번째 손가락     A-667   0.8%
//     아직 쓰이지 않은 이름  영웅 구역  살아 돌아오면 10%
//
//   「누군가의 왼쪽 신발」은 승인서에서 빠지고, 전리품 표에서도 뺀다.
//   쓰이는 데가 없어지면 떨어져도 짐만 되기 때문이다.
//   이미 가지고 있는 것은 그대로 남는다. (아래 설명 참고)
//
//   영웅 구역(epic)은 원래 전리품을 굴리지 않는다.
//   정산이 끝난 뒤 따로 굴려서 준다. 쓰러졌을 때는 주지 않는다.

const GUAR_MAT  = '아직 쓰이지 않은 이름';
window.GUAR_EPIC_RATE = 0.005;   // 영웅 구역에서 살아 돌아왔을 때 나올 확률

(function guaranteeFix() {

// ==========================================
// 1. 새 재료 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (ITEM_CATALOG[GUAR_MAT]) { clearInterval(iv); return; }
        ITEM_CATALOG[GUAR_MAT] = {
            price: 2400, usable: false, darkOnly: true,
            desc: '[조합 재료] 아치 아래에 적혀 있었다. 누구의 것도 아직 아니다.'
        };
        clearInterval(iv);
        console.log('[승인서] 재료 등록 — ' + GUAR_MAT);
    }, 500);
})();

// 소지품에서 「조합」 칸에 들어가게
(function cat() {
    const iv = setInterval(function () {
        if (typeof invCatOf !== 'function') return;
        if (invCatOf._guar) { clearInterval(iv); return; }
        const _c = invCatOf;
        invCatOf = function (name) {
            if (name === GUAR_MAT) return 'craft';
            return _c.apply(this, arguments);
        };
        invCatOf._guar = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 2. 레시피 갈아끼우기
// ==========================================
(function recipe() {
    const iv = setInterval(function () {
        if (typeof CRAFT_RECIPES === 'undefined') return;
        const r = CRAFT_RECIPES.find(function (x) { return x.id === 'guarantee'; });
        if (!r) { clearInterval(iv); console.warn('[승인서] 레시피를 찾지 못했습니다.'); return; }
        if (r._guar) { clearInterval(iv); return; }
        r.mats = ['맨발의 자국', '여섯 번째 손가락', GUAR_MAT];
        r._guar = true;
        clearInterval(iv);
        console.log('[승인서] 재료 교체 — ' + r.mats.join(' · '));
    }, 500);
})();

// ==========================================
// 3. 전리품 표 손보기
// ==========================================
(function loot() {
    const iv = setInterval(function () {
        if (typeof DARK_LOOT_BY_ZONE === 'undefined') return;
        if (window._guarLoot) { clearInterval(iv); return; }
        window._guarLoot = true;

        // 맨발의 자국 — 1.5% → 0.5%
        const a214 = DARK_LOOT_BY_ZONE['Qtrew-A-214'] || [];
        a214.forEach(function (l) {
            if (l.name === '맨발의 자국') {
                console.log('[승인서] 맨발의 자국 ' + (l.chance * 100).toFixed(1) + '% → 0.5%');
                l.chance = 0.005;
            }
        });

        // 누군가의 왼쪽 신발 — 더 쓰이지 않으므로 뺀다
        Object.keys(DARK_LOOT_BY_ZONE).forEach(function (z) {
            const arr = DARK_LOOT_BY_ZONE[z];
            const i = arr.findIndex(function (l) { return l.name === '누군가의 왼쪽 신발'; });
            if (i >= 0) { arr.splice(i, 1); console.log('[승인서] 누군가의 왼쪽 신발 — ' + z + ' 전리품에서 뺌'); }
        });

        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 4. 영웅 구역에서 재료 주기
// ==========================================
//
// epicSettle 은 DARK_LOOT_BY_ZONE 을 굴리지 않는다.
// 정산이 끝난 자리에 따로 굴려서 얹는다.
(function epicDrop() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._guar) { clearInterval(iv); return; }

        const _s = epicSettle;
        epicSettle = function (how, txt) {
            const r = _s.apply(this, arguments);
            try {
                if (how === 'dead') return r;                       // 쓰러지면 없다
                if (Math.random() >= window.GUAR_EPIC_RATE) return r;

                if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
                currentUser.inventory.push(GUAR_MAT);
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[영웅] ' + GUAR_MAT + '을(를) 가지고 나왔습니다.');
                }
                if (typeof saveFields === 'function') {
                    try { saveFields({ inventory:1, history:1 }); } catch (e) { }
                }

                // 정산 화면에 한 줄 붙인다
                setTimeout(function () {
                    try {
                        const b = darkBodyEl();
                        if (!b || b.querySelector('#guar-got')) return;
                        b.insertAdjacentHTML('beforeend',
                            '<div id="guar-got" style="margin-top:10px; padding:10px 12px;'
                            + ' border:1px solid #6a4c93; border-radius:6px; background:rgba(0,0,0,0.3);'
                            + ' font-size:11px; color:#c9a8ff; line-height:1.7;">'
                            + '◇ 손에 쥔 것이 있다.<br><b>' + GUAR_MAT + '</b></div>');
                    } catch (e) { }
                }, 300);
            } catch (e) { console.warn('[승인서] 지급 건너뜀:', e && e.message); }
            return r;
        };
        epicSettle._guar = true;
        clearInterval(iv);
        console.log('[승인서] 영웅 구역 지급 연결 (' + (window.GUAR_EPIC_RATE * 100).toFixed(0) + '%)');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.guarState = function () {
    console.log('%c===== 확정 승인서 =====', 'color:#c9a8ff; font-size:13px');
    const r = (typeof CRAFT_RECIPES !== 'undefined')
        && CRAFT_RECIPES.find(function (x) { return x.id === 'guarantee'; });
    console.log('  재료:', r ? r.mats.join(' · ') : '못 찾음');

    const where = {};
    if (typeof DARK_LOOT_BY_ZONE !== 'undefined') {
        Object.keys(DARK_LOOT_BY_ZONE).forEach(function (z) {
            DARK_LOOT_BY_ZONE[z].forEach(function (l) { where[l.name] = [z, l.chance]; });
        });
    }
    const inv = (currentUser && currentUser.inventory) || [];
    console.table((r ? r.mats : []).map(function (m) {
        const w = where[m];
        return {
            재료: m,
            나오는곳: m === GUAR_MAT ? '영웅 구역' : (w ? w[0] : '-'),
            확률: m === GUAR_MAT
                ? (window.GUAR_EPIC_RATE * 100).toFixed(0) + '% (생환 시)'
                : (w ? (w[1] * 100).toFixed(1) + '%' : '-'),
            보유: inv.filter(function (x) { return x === m; }).length
        };
    }));
    const shoe = inv.filter(function (x) { return x === '누군가의 왼쪽 신발'; }).length;
    if (shoe) console.log('  쓰이지 않는 「누군가의 왼쪽 신발」 ' + shoe + '개를 가지고 있습니다.');
    console.log('  확률을 바꾸려면 — GUAR_EPIC_RATE = 0.2');
};

console.log('[승인서] guarState()');

})();