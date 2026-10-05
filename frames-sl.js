// ==========================================
// ★ 특급 테두리 견본첩 — S · L 등급만
// bundles.json 마지막 그룹, frames.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   한 장만 나온다. 나오는 것은 S 등급과 L 등급뿐이다.
//   L 은 훨씬 드물게 나온다.
//
//   지금 있는 테두리는 D 16 · C 12 · B 10 · A 9 · S 5 · L 1 종이다.
//   그래서 이 견본첩이 뽑는 후보는 여섯 종이다.
//
//       S  s01 · n06 · n10 · v02 · v03      각 1.000
//       L  v01                                    0.080
//
//   L 이 나올 확률은 0.080 / 5.080 ≈ 1.6% 다.
//   L 을 더 드물게 하려면 아래 L_WEIGHT 를 줄이면 된다.
//       0.080 → 1.6%      0.050 → 1.0%      0.025 → 0.5%
//
// ■ 상담사만 줄 수 있다
//
//   상점 어디에도 넣지 않는다. 우주 쇼핑몰 후보(ALIEN_ITEMS_POOL)에도
//   들어가지 않도록 혹시 들어가 있으면 빼낸다. 팔 수도 없다.
//
//   주는 법은 당국 화면의 「물품 강제 꽂기」다. 그 목록은 ITEM_CATALOG
//   전체에서 만들어지므로(index.html:9712) 여기 등록만 하면 바로 보인다.
//   검색칸에 「특급」이라고 치면 나온다.
//
// ■ 이미 가진 것이 나오면
//
//   원래 견본첩과 같다. 등급에 맞는 값으로 돌려받는다. (S 60 P · L 120 P)
//   후보가 여섯 종뿐이라 다 모으면 겹침만 나온다. 그때는 돌려받기만 한다.

(function framesSL() {

const ITEM = '특급 테두리 견본첩';
const L_WEIGHT = 0.080;        // S 한 종을 1.000 으로 보았을 때 L 의 무게
const S_WEIGHT = 1.000;

// ==========================================
// 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);

        ITEM_CATALOG[ITEM] = {
            price: 0, usable: true, targetable: false, effect: 'frame_book_sl', noSell: true,
            desc: '사원증에 두를 테두리가 한 장 들어 있다. S 등급 이상만 들어 있다. '
                + 'L 등급은 아주 드물게 나온다.'
        };

        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(ITEM) < 0) {
            NO_SELL_ITEMS.push(ITEM);
        }
        // 상점 후보에는 넣지 않는다 — 혹시 들어가 있으면 빼낸다
        if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
            const i = ALIEN_ITEMS_POOL.indexOf(ITEM);
            if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
        }
        console.log('[테두리] ' + ITEM + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 혹시 다른 파일이 상점 후보에 넣어도 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    const i = ALIEN_ITEMS_POOL.indexOf(ITEM);
    if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
}, 5000);

// ==========================================
// 뽑기 — S 와 L 만
// ==========================================
function candidates() {
    if (typeof FRAMES === 'undefined' || !Array.isArray(FRAMES)) return [];
    return FRAMES.filter(function (f) { return f && (f.g === 'S' || f.g === 'L'); });
}

function draw() {
    const list = candidates();
    if (!list.length) return null;
    const w = list.map(function (f) { return f.g === 'L' ? L_WEIGHT : S_WEIGHT; });
    const total = w.reduce(function (a, b) { return a + b; }, 0);
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
        r -= w[i];
        if (r <= 0) return list[i];
    }
    return list[list.length - 1];
}

// ==========================================
// 개봉
// ==========================================
(function open() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (typeof frBag !== 'function' || typeof frOwned !== 'function') return;
        if (useInventoryItem._frameSL) { clearInterval(iv); return; }

        const _use = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'frame_book_sl') return _use.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            if (typeof buyGuard === 'function' && !buyGuard()) return;

            const f = draw();
            if (!f) { showCustomAlert('꺼낼 것이 없습니다.'); return; }

            const bag = frBag();
            const dup = frOwned(f.id);
            if (typeof removeItemFromInventory === 'function') {
                removeItemFromInventory(currentUser, itemName, 1);
            }

            let msg;
            if (dup) {
                const back = (typeof FRAME_REFUND !== 'undefined' ? FRAME_REFUND[f.g] : 0) || 0;
                currentUser.points = (currentUser.points || 0) + back;
                bag.owned[f.id] = (bag.owned[f.id] || 0) + 1;
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[특급 견본첩] ' + f.n + ' (중복 · +' + back + ' P)');
                }
                msg = f.g + '등급 — ' + f.n + '\n\n이미 가지고 있던 것입니다.\n' + back + ' P로 돌려받았습니다.';
            } else {
                bag.owned[f.id] = 1;
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[특급 견본첩] ' + f.g + "등급 '" + f.n + "' 획득");
                }
                msg = f.g + '등급 — ' + f.n + '\n\n새로 얻었습니다.'
                    + (f.g === 'L' ? '\n\n(L 등급입니다.)' : '');
            }

            if (typeof saveSelfFull === 'function') saveSelfFull();
            if (typeof updateUI === 'function') updateUI();
            if (dup && typeof showPointGainEffect === 'function') {
                try { showPointGainEffect(FRAME_REFUND[f.g]); } catch (e) { }
            }
            showCustomAlert(msg);
            if (!dup) setTimeout(function () {
                if (typeof openFramePanel === 'function') openFramePanel();
            }, 400);
        };
        useInventoryItem._frameSL = true;
        clearInterval(iv);
        console.log('[테두리] ' + ITEM + ' 개봉 연결');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.slBookOdds = function (n) {
    const list = candidates();
    if (!list.length) { console.warn('S·L 테두리를 못 찾았습니다. frames.js 가 먼저 올라와야 합니다.'); return; }
    const w = list.map(function (f) { return f.g === 'L' ? L_WEIGHT : S_WEIGHT; });
    const total = w.reduce(function (a, b) { return a + b; }, 0);

    console.log('%c===== ' + ITEM + ' =====', 'color:#c9a8ff; font-size:13px');
    console.table(list.map(function (f, i) {
        return { 등급: f.g, 이름: f.n, id: f.id, 확률: (w[i] / total * 100).toFixed(2) + '%' };
    }));
    const lw = list.reduce(function (a, f, i) { return a + (f.g === 'L' ? w[i] : 0); }, 0);
    console.log('  L 등급이 나올 확률:', (lw / total * 100).toFixed(2) + '%'
        + '  (L_WEIGHT = ' + L_WEIGHT + ')');
    console.log('  한 장만 나옵니다. 상담사 「물품 강제 꽂기」로만 줍니다.');

    // 실제로 돌려 본다
    const times = n || 10000;
    const got = {};
    for (let i = 0; i < times; i++) { const f = draw(); got[f.g] = (got[f.g] || 0) + 1; }
    console.log('  ' + times.toLocaleString() + '번 돌려 보면 — '
        + Object.keys(got).sort().map(function (g) {
            return g + ' ' + (got[g] / times * 100).toFixed(2) + '%';
        }).join(' · '));
};

window.slBookGive = function (who, n) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(20, n || 1));
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < q; i++) u.inventory.push(ITEM);
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[당국 개입] ' + ITEM + ' ' + q + '개가 지급되었습니다.');
    }
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    }
    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + u.name + ' 사원에게 ' + ITEM + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

console.log('[테두리] slBookOdds() · slBookGive(사번, 개수)');

})();
