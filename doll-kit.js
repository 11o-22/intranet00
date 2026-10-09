// ==========================================
// ★ 봉제 인형 키트 — 쓰고 나서 나흘 뒤에 다시
// bundles.json 마지막 그룹, newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 지금은 한 번 쓰면 사라집니다
//
//   newitems2.js:1679 의 n_doll 이 마지막에 gone(nm) 을 부릅니다.
//
//       n_doll: function (nm) {
//           ... 두 가지 효과를 사흘짜리로 붙인다 ...
//           gone(nm);                                   ← 여기서 없어진다
//       }
//
//       function gone(nm) {                             // newitems2.js:1570
//           removeItemFromInventory(currentUser, nm, 1);
//           saveSelfFull(); updateUI();
//       }
//
//   140,000 P 짜리가 한 번 쓰고 사라집니다.
//
// ■ 어떻게 고치나
//
//   효과를 짓는 부분은 그대로 두고, **없애는 그 한 번만** 막습니다.
//   n_doll 을 베껴 쓰면 뽑기 목록(DOLL)이나 안내문이 원본과 어긋날 수 있어서,
//   원본을 그대로 돌리고 removeItemFromInventory 를 잠깐 비켜 세웁니다.
//
//   그리고 나흘짜리 기다림을 둡니다. 그동안은 눌러도 남은 시간만 알려 줍니다.
//
//     인형의 효과   사흘  (원래대로)
//     다시 만들기   나흘  (아래 WAIT_DAYS)
//
//   기다림은 사원마다 하나입니다. 키트를 둘 가지고 있어도 나흘에 한 번입니다.
//   키트마다 따로 세려면 소지품이 글자 배열이라 가릴 수가 없습니다.
//
// ■ 한 번 고쳤는데도 사라지던 까닭 — 감싸는 차례
//
//   소지품 쓰는 길(useInventoryItem)은 열 겹 넘게 감싸여 있습니다.
//   그 가운데 newitems2.js 가 n_doll 을 가로채 **자기 선에서 끝냅니다.**
//   (newitems2.js:1843 — fn(itemName); return;)
//
//   그러니 이 파일은 newitems2 **바깥**에 있어야 손이 닿습니다.
//   그런데 둘 다 setInterval 로 끼어드는데 기다리는 때가 다릅니다.
//
//       newitems2   500ms   (묶음 2에서 시작)
//       여기        400ms   (묶음 8에서 시작)
//
//   묶음이 거의 동시에 내려오면 400ms 쪽이 먼저 끼어듭니다. 그러면
//   newitems2 가 그 위를 덮어 **바깥이 되고**, 여기는 영영 안 불립니다.
//   서비스 워커가 묶음을 들고 있으면 늘 그 차례가 되어, 늘 사라졌습니다.
//
//   기다리는 때를 늘려 피하는 것은 또 어긋날 수 있으니, 차례에 기대지
//   않게 바꿉니다. **내가 맨 바깥이 아니면 다시 감쌉니다.** 누가 나중에
//   덮어도 1.5초 안에 도로 바깥으로 올라옵니다.

(function dollKit() {

const KIT = '봉제 인형 키트';
const WAIT_DAYS = 4;
const WAIT = WAIT_DAYS * 24 * 3600 * 1000;

function leftMs() {
    if (!currentUser) return 0;
    return Math.max(0, (currentUser.dollKitAt || 0) - Date.now());
}
function human(ms) {
    const h = Math.floor(ms / 3600000), m = Math.ceil((ms % 3600000) / 60000);
    if (h >= 24) return Math.floor(h / 24) + '일 ' + (h % 24) + '시간';
    return h ? (h + '시간 ' + m + '분') : (m + '분');
}

(function hook() {
    let inside = false;          // 겹쳐 감싸여도 한 번만 처리한다
    let layers = 0;

    function wrap() {
        if (typeof useInventoryItem !== 'function') return;
        if (typeof removeItemFromInventory !== 'function') return;
        if (useInventoryItem._dollKeep) return;          // 내가 이미 맨 바깥이다

        const _u = useInventoryItem;
        const mine = function (itemName) {
            // 안쪽에 묵은 내 껍질이 또 있으면 그냥 지나친다
            if (itemName !== KIT || inside || !currentUser) return _u.apply(this, arguments);
            inside = true;
            try {
                const left = leftMs();
                if (left > 0) {
                    showCustomAlert('아직 바늘을 들 수 없습니다.\n\n'
                        + human(left) + ' 뒤에 다시 지을 수 있습니다.');
                    return;
                }

                // 없애는 그 한 번만 비켜 세운다
                const _rm = removeItemFromInventory;
                let kept = false;
                removeItemFromInventory = function (u, n, q) {
                    if (!kept && n === KIT && u === currentUser) { kept = true; return; }
                    return _rm.apply(this, arguments);
                };

                try { _u.apply(this, arguments); }
                finally { removeItemFromInventory = _rm; }

                // kept 가 참이면 실제로 인형을 지었다는 뜻이다
                // (격리·소속 같은 이유로 막혔으면 gone 까지 가지 않는다)
                if (!kept) return;

                currentUser.dollKitAt = Date.now() + WAIT;
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[' + KIT + '] 키트는 남았습니다. ' + WAIT_DAYS + '일 뒤에 다시 지을 수 있습니다.');
                }
                if (typeof saveFields === 'function') saveFields({ dollKitAt: 1, history: 1, inventory: 1 });
                if (typeof updateUI === 'function') updateUI();
                setTimeout(function () {
                    showCustomAlert('키트는 손에 남았습니다.\n\n'
                        + WAIT_DAYS + '일 뒤에 다시 지을 수 있습니다.');
                }, 80);
            } finally { inside = false; }
        };
        mine._dollKeep = true;
        useInventoryItem = mine;
        layers++;
        if (layers === 1) console.log('[인형] 키트가 남습니다 — ' + WAIT_DAYS + '일 기다림');
        else console.log('[인형] 누가 위를 덮어서 다시 맨 바깥으로 올라왔습니다 (' + layers + '겹째)');
    }

    wrap();
    // 차례에 기대지 않는다 — 누가 위를 덮으면 도로 바깥으로 올라온다
    setInterval(function () { try { wrap(); } catch (e) { } }, 1500);
})();

// 설명에도 적어 둔다
(function desc() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[KIT]) return;
        const c = ITEM_CATALOG[KIT];
        if (String(c.desc || '').indexOf('일 뒤') < 0) {
            c.desc = '사용자의 DNA를 읽어 사흘짜리 인형을 짓는다. 기능은 두 가지가 붙는다. '
                + '키트는 남으며 ' + WAIT_DAYS + '일 뒤에 다시 지을 수 있다.';
        }
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인 · 손으로
// ==========================================
window.dollState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const n = (u.inventory || []).filter(function (x) { return x === KIT; }).length;
    const l = Math.max(0, (u.dollKitAt || 0) - Date.now());
    console.log('%c===== ' + u.name + ' · ' + KIT + ' =====', 'color:#c9a8ff; font-size:13px');
    console.log('  가진 키트:', n + '개');
    console.log('  다시 지을 수 있나:', l > 0 ? ('✗ ' + human(l) + ' 남음') : 'O 지금 가능');
    console.log('  인형 효과(사흘):', (u.dollPt || 0) > Date.now()
        ? ('어둠 정산 +3,000P · ' + human(u.dollPt - Date.now()) + ' 남음') : '추가 정산은 없음');
    console.log('  연결:', (typeof useInventoryItem === 'function' && useInventoryItem._dollKeep) ? 'O' : '✗');
};

// 기다림을 지금 끝낸다 — 상담사
window.dollReady = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    u.dollKitAt = 0;
    if (typeof updateUserFields === 'function') updateUserFields(u.code, { dollKitAt: 0 });
    console.log('%c✓ ' + u.name + ' 사원은 지금 다시 지을 수 있습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

// 이미 없어진 키트를 돌려준다 — 상담사
window.dollKitBack = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(u.inventory)) u.inventory = [];
    u.inventory.push(KIT);
    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[당국 개입] ' + KIT + ' 를 돌려받았습니다.');
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    }
    console.log('%c✓ ' + u.name + ' 사원에게 ' + KIT + ' 1개를 돌려줬습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

console.log('[인형] dollState(사번) · dollReady(사번) · dollKitBack(사번)');

})();