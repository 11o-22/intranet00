// ==========================================
// ★ 소지품 팔기 — 개수를 적어서 한 번에
// bundles.json 마지막 묶음, invmark.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 불편했나
//
//   팔기는 한 번에 한 개뿐이었다. (index.html:7557)
//       removeItemFromInventory(currentUser, itemName, 1);
//
//   게다가 invmark.js 가 「판매하시겠습니까」를 한 번씩 물어본다.
//   상비약 서른 개를 치우려면 **예순 번을 눌러야 했다.**
//
// ■ 어떻게 바꾸나
//
//   물어보는 창을 개수를 적는 창으로 바꾼다.
//
//       − 1 +  · 전부        손가락으로도, 자판으로도 넣는다
//       받는 돈이 그 자리에서 같이 바뀐다
//
//   그리고 **한 번에 판다.** 열 개를 팔아도 소지품에서 열 개를 빼고,
//   돈을 한 번 주고, 기록 한 줄을 남기고, 저장을 한 번 한다.
//   한 개씩 열 번 돌리면 저장도 열 번이라 서버가 출렁인다.
//
//   막는 것은 그대로 둔다 — 격리 중·매각 불가 품목·자물쇠·즐겨찾기 알림.
//
// ■ 콘솔
//   sellMany('상비약 (오염도 -10%)', 5)   창 없이 바로 판다 (시험용)

(function sellMany() {

const ID = 'sell-many-overlay';

function price(n) {
    return (typeof getSellPrice === 'function') ? getSellPrice(n) : 1;
}
function owned(n) {
    return ((currentUser && currentUser.inventory) || []).filter(function (x) { return x === n; }).length;
}
function close() {
    const el = document.getElementById(ID);
    if (el) el.remove();
}

// ==========================================
// 실제로 파는 자리 — 한 번에 n 개
// ==========================================
function doSell(name, n) {
    if (!currentUser) return;
    n = Math.max(1, Math.min(owned(name), Math.floor(Number(n) || 1)));
    if (!n) return;

    const unit = price(name);
    const got = unit * n;

    removeItemFromInventory(currentUser, name, n);
    winPoints(got);
    addHistoryLog(currentUser, '[소지품 판매] ' + name
        + (n > 1 ? ' ' + n + '개' : '') + ' 매각 (+' + got.toLocaleString() + ' P)');
    saveFields({ inventory: 1, history: 1 });
    updateUI();

    if (n > 1) {
        showCustomAlert(name + ' ' + n + '개를 팔았습니다.\n\n+' + got.toLocaleString() + ' P');
    }
}
window.sellMany = doSell;

// ==========================================
// 개수를 적는 창
// ==========================================
function ask(name) {
    const have = owned(name);
    if (have <= 0) { showCustomAlert('가지고 있지 않습니다.'); return; }
    const unit = price(name);

    // 한 개뿐이면 묻는 말만 바꿔 예전처럼 간다
    close();
    const fav = (typeof isFav === 'function' && isFav(name));
    document.body.insertAdjacentHTML('beforeend',
        '<div id="' + ID + '" class="modal-overlay" style="display:flex; z-index:9999999;">'
        + '<div class="modal-content" style="max-width:320px; text-align:center;">'
        + '<div style="font-size:30px; margin-bottom:11px;">💰</div>'
        + '<div style="font-size:13px; color:#eee; line-height:1.8;"><b>' + name + '</b><br>몇 개를 팔까요?</div>'
        + '<div style="font-size:10px; color:#888; line-height:1.6; margin:7px 0 14px 0;">'
        + '한 개에 ' + unit.toLocaleString() + ' P · 보유 ' + have + '개'
        + (fav ? '<br><span style="color:#ffd700;">★ 즐겨찾기에 등록된 물품입니다.</span>' : '')
        + '</div>'
        + '<div style="display:flex; gap:6px; align-items:center; margin-bottom:10px;">'
        + '<button class="game-btn" id="sm-minus" style="margin:0; padding:10px 0; width:46px; font-size:15px;">−</button>'
        + '<input id="sm-n" type="number" inputmode="numeric" min="1" max="' + have + '" value="1"'
        + ' style="flex:1; text-align:center; font-size:15px; padding:9px 4px; margin:0;">'
        + '<button class="game-btn" id="sm-plus" style="margin:0; padding:10px 0; width:46px; font-size:15px;">+</button>'
        + '<button class="game-btn" id="sm-all" style="margin:0; padding:10px 0; width:56px; font-size:11px;">전부</button>'
        + '</div>'
        + '<div id="sm-sum" style="font-size:12px; color:#ffd700; font-weight:bold; margin-bottom:16px;"></div>'
        + '<div style="display:flex; gap:8px;">'
        + '<button class="btn-cancel" id="sm-no" style="flex:1; background:#444; border-color:#555 !important;">취소</button>'
        + '<button class="game-btn" id="sm-ok" style="flex:1; margin:0; padding:12px;">판매한다</button>'
        + '</div></div></div>');

    const el = document.getElementById('sm-n');
    const sum = document.getElementById('sm-sum');
    const clamp = function () {
        let v = Math.floor(Number(el.value) || 1);
        if (v < 1) v = 1;
        if (v > have) v = have;
        el.value = v;
        sum.textContent = v + '개 → +' + (unit * v).toLocaleString() + ' P';
        return v;
    };
    clamp();

    el.oninput = clamp;
    document.getElementById('sm-minus').onclick = function () { el.value = (Number(el.value) || 1) - 1; clamp(); };
    document.getElementById('sm-plus').onclick = function () { el.value = (Number(el.value) || 1) + 1; clamp(); };
    document.getElementById('sm-all').onclick = function () { el.value = have; clamp(); };
    document.getElementById('sm-no').onclick = close;
    document.getElementById('sm-ok').onclick = function () {
        const v = clamp();
        close();
        doSell(name, v);
    };
    el.onkeydown = function (ev) { if (ev.key === 'Enter') document.getElementById('sm-ok').click(); };
    setTimeout(function () { try { el.select(); } catch (e) { } }, 50);
}

// ==========================================
// 팔기 길목 — 묻는 창을 개수 창으로 바꾼다
// ==========================================
//
// invmark.js 가 먼저 「판매하시겠습니까」를 물어본다. 그 앞에 서서
// 개수 창을 띄우고, 고른 개수만큼 한 번에 처리한다.
// 막는 것들(격리·매각 불가·자물쇠)은 여기서 그대로 본다.
(function hookSell() {
    const iv = setInterval(function () {
        if (typeof sellInventoryItem !== 'function') return;
        if (sellInventoryItem._many) { clearInterval(iv); return; }

        const _s = sellInventoryItem;
        sellInventoryItem = function (itemName) {
            // 안쪽에서 부른 것(예전 길)은 그대로 흘려보낸다
            if (window._invSellOk === itemName || window._sellManyGo) {
                return _s.apply(this, arguments);
            }
            if (!currentUser || !itemName) return _s.apply(this, arguments);

            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('여우 상담실 격리 중에는 소지품을 매각할 수 없습니다.'); return;
            }
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(itemName) >= 0) {
                showCustomAlert('해당 물품은 매각할 수 없습니다.'); return;
            }
            if (typeof isLock === 'function' && isLock(itemName)) {
                showCustomAlert("'" + itemName + "'에 자물쇠가 걸려 있습니다.\n\n"
                    + '소지품에서 자물쇠를 풀어야 판매할 수 있습니다.'); return;
            }
            ask(itemName);
        };
        sellInventoryItem._many = true;
        clearInterval(iv);
        console.log('[팔기] 개수를 적어 한 번에 팝니다');
    }, 300);
})();

})();
