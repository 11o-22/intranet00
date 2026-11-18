// ==========================================
// ★ 속성 변경권 폐지 → ★ 2026-11-18 상담사 지급 전용으로 되살림
// index.html 에서 reattr.js 보다 뒤, save-merge.js 앞에 불러온다
// ==========================================
//
// ★ 2026-11-18 사용자 「그리고 속성 변경권 상담사가 줄 수 있게 하자.」
//   · 물품 목록에 다시 올린다 — 상점(??? · 일반 · 우주)에는 안 나오고, 상담사 「보급품 지급」 목록에만 보인다 (adminOnly · 팔 수 없음).
//   · 소지품에서 거두던 것(아래 2)은 그만둔다 — 상담사가 준 것이 들어오자마자 사라지지 않게.
//   · 쓰면 전용 장비 속성 하나를 지우고 새로 고른다 — 주 3회 「🔁 속성 바꾸기」 횟수와 따로 센다 (reattr-free.js · 한 장 쓰면 한 장 사라진다).
//
// ── 아래는 예전(폐지) 설명 ──
//
// ■ 무엇을 하나
//   1. 물품 목록에서 지운다 — ??? 상점 진열은 ITEM_CATALOG 의 qShop 을 훑어
//      만들므로, 지우면 더 이상 나오지 않는다. (dark.js:4575·4605)
//   2. 소지품에 남아 있는 것을 거둔다. 산 값(140 P)은 돌려준다.
//      거둔 내역은 기록에 남는다.
//
// ■ 건드리지 않는 것
//   속성을 바꾸는 창 자체(openGearReattr · doGearReattr)는 그대로 둔다.
//   ⛓️‍💥 이레귤러 칭호가 변경권 없이 그 창을 쓰기 때문이다. (titles.js:1078)
//
//   돌려주지 않으려면 올리기 전에 아래 줄을 false 로 고친다.

if (window.REATTR_REFUND === undefined) window.REATTR_REFUND = true;

(function reattrOff() {

const NAME = '속성 변경권';
const PRICE = 140;

// ==========================================
// 1. 물품 목록 — 상담사 지급 전용으로 올린다 (2026-11-18 · 전에는 지웠다) · 상점 진열 후보에서는 뺀다
// ==========================================
let gone = false;
window.REATTR_TICKET = NAME;
function strip(arr) {
    if (!Array.isArray(arr)) return;
    let i;
    while ((i = arr.indexOf(NAME)) > -1) arr.splice(i, 1);
}
(function drop() {
    let tries = 0;
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        // ★ 상담사 지급 전용 — qShop 이 없어 ??? 상점에 안 나온다 · price '???' 라 값 매기는 진열에도 안 든다
        ITEM_CATALOG[NAME] = {
            price: '???', usable: true, targetable: false, effect: 'q_reattr', adminOnly: true,
            desc: '[특수] 상담사가 지급하는 표. 전용 장비 속성 하나를 지우고 새로 고른다. 주 3회 속성 바꾸기와 따로 쓰며, 쓸 때 한 장이 사라진다.'
        };
        // 진열 후보를 들고 있는 표에서는 뺀다 (있을 때만)
        //   const 로 선언된 표는 window 에 안 올라간다. 이름으로 바로 집는다.
        strip(typeof ALL_10_ITEMS !== 'undefined' ? ALL_10_ITEMS : null);
        strip(typeof ALIEN_ITEMS_POOL !== 'undefined' ? ALIEN_ITEMS_POOL : null);
        // 팔거나 거래로 바꿀 수 없게
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME); } catch (e) { }
        if (++tries > 20) {
            clearInterval(iv);
            console.log('[변경권] 상담사 지급 전용으로 올렸습니다.');
        }
    }, 500);
})();

// ==========================================
// 2. 소지품에 남은 것을 거둔다
// ==========================================
let swept = false;
function sweep() {
    if (swept || !currentUser || !Array.isArray(currentUser.inventory)) return;
    const n = currentUser.inventory.filter(function (x) { return x === NAME; }).length;
    swept = true;
    if (!n) return;

    currentUser.inventory = currentUser.inventory.filter(function (x) { return x !== NAME; });
    const back = window.REATTR_REFUND ? n * PRICE : 0;
    if (back) currentUser.points = (currentUser.points || 0) + back;

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(currentUser, '[폐지] ' + NAME + ' ' + n + '개를 거뒀습니다.'
            + (back ? ' (+' + back.toLocaleString() + ' P 환급)' : ''));
    }
    if (typeof saveFields === 'function') {
        try { saveFields({ inventory: 1, points: 1, history: 1 }); } catch (e) { }
    }
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
    if (typeof showCustomAlert === 'function') {
        showCustomAlert(NAME + '이(가) 폐지되었습니다.\n\n가지고 계시던 ' + n + '개를 거뒀습니다.'
            + (back ? '\n' + back.toLocaleString() + ' P를 돌려드렸습니다.' : ''));
    }
    console.log('[변경권] 남아 있던 ' + n + '개를 거뒀습니다.');
}

// ★ 2026-11-18 — 거두지 않는다 (상담사가 준 변경권이 사라지면 안 된다). sweep() 은 남겨 두되 부르지 않는다.
if (window.REATTR_SWEEP) {
    const iv2 = setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser) return;
        sweep();
        if (swept) clearInterval(iv2);
    }, 1000);
}

// ==========================================
// 3. 확인
// ==========================================
window.reattrState = function () {
    console.log('%c===== 속성 변경권 (상담사 지급 전용) =====', 'color:#ff8a65; font-size:13px');
    console.log('  물품 목록에:', (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[NAME])
        ? '있음 (상담사 지급 전용)' : '없음');
    console.log('  내 소지품에:', currentUser
        ? ((currentUser.inventory || []).filter(function (x) { return x === NAME; }).length + '개')
        : '(로그인 전)');
    console.log('  속성 바꾸는 창:', (typeof openGearReattr === 'function') ? '그대로 (이레귤러용)' : '없음');
};

console.log('[변경권] 속성 변경권 — 상담사 지급 전용 · reattrState()');

})();
