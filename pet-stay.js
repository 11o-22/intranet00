// ==========================================
// ★ 펫 — 🏠 집 지킴이 방석 (망상 홈쇼핑 · 2026-10-25)
// bundles.json 마지막 묶음 — pet-sneak.js · pet-with.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//
//   쓰면 그 시간 동안 **펫이 어둠에 따라오지 않는다.** 가진 펫 모두.
//     · 데려가기로 고른 펫(pet-with)도 안 들어간다
//     · 교감 90 이 넘어 몰래 따라붙는 펫(pet-sneak)도 안 따라간다 — 다쳐서 두 시간 안에 낫혀야 하는 일을 막는다
//   잠재우는 것(🦋 에로스의 마지막 숨결 두 번 · PET.asleep)과 달리 펫은 깨어 있다 —
//   쓰다듬기 · 놀아 주기 · 혼자 탐사 보내기는 그대로 된다. 어둠에만 따라오지 않는다.
//
//   다섯 가지 — 2 · 3 · 5 · 12 · 18 시간. 망상 홈쇼핑에서만 판다 (치료 물품 칸 바로 아래).
//   산 것은 소지품으로 들어가고, 소지품에서 「사용」하면 걸린다.
//   이미 걸려 있으면 남은 시간 **뒤에 이어 붙는다** (2시간이 남았는데 3시간짜리를 쓰면 5시간).
//
// ■ 적히는 자리
//   u.petStayUntil   이때까지 펫이 집을 지킨다 (pet-data.js 의 PET.stays · PET.stayLeft 가 읽는다)
//
// ■ 콘솔
//   petStayState()

(function petStay() {

const LIST = [
    { n: '집 지킴이 방석 (2시간)',  h: 2,  price: 3000 },
    { n: '집 지킴이 방석 (3시간)',  h: 3,  price: 4400 },
    { n: '집 지킴이 방석 (5시간)',  h: 5,  price: 7000 },
    { n: '집 지킴이 방석 (12시간)', h: 12, price: 15600 },
    { n: '집 지킴이 방석 (18시간)', h: 18, price: 21600 }
];
const BY = {};
LIST.forEach(function (x) { BY[x.n] = x; });
window.PET_STAY_LIST = LIST;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t); }
function log_(t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { } }
function left(u) { return Math.max(0, (Number((u || u_() || {}).petStayUntil) || 0) - Date.now()); }
function span(ms) {
    const m = Math.ceil(ms / 60000);
    return (m >= 60 ? Math.floor(m / 60) + '시간 ' : '') + (m % 60) + '분';
}
function copyFlags(from, to) { Object.keys(from).forEach(function (k) { if (!(k in to)) { try { to[k] = from[k]; } catch (e) { } } }); }

// 물품 표 — 상담사 「물품 강제 꽂기」에도 뜬다 · 되팔지 않는다 · 장터에 안 나온다
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        LIST.forEach(function (x) {
            if (!ITEM_CATALOG[x.n]) {
                ITEM_CATALOG[x.n] = { price: 0, usable: true, targetable: false, effect: 'pet_stay', noSell: true,
                    desc: '[펫] 쓰면 ' + x.h + '시간 동안 가진 펫이 모두 집을 지킨다 — 어둠에 따라오지 않는다 (데려가기 · 몰래 따라가기 모두). 남은 시간 뒤에 이어 붙는다. 망상 홈쇼핑에서 판다.' };
            }
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(x.n) < 0) NO_SELL_ITEMS.push(x.n);
        });
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 사기 (망상 홈쇼핑)
// ==========================================
window.petStayBuy = function (name) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const u = u_(), x = BY[name];
    if (!u || !x) return;
    if ((Number(u.points) || 0) < x.price) { alert_('포인트가 모자랍니다.\n\n' + x.n + ' ' + x.price.toLocaleString() + ' P'); return; }
    if (typeof changePoints === 'function') changePoints(-x.price);
    else u.points = (Number(u.points) || 0) - x.price;
    if (!Array.isArray(u.inventory)) u.inventory = [];
    u.inventory.push(x.n);
    log_('[망상 홈쇼핑] ' + x.n + ' 구입 (-' + x.price.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_(x.n + '을(를) 샀습니다.\n\n소지품에서 「사용」하면 ' + x.h + '시간 동안 펫이 어둠에 따라오지 않습니다.');
    try { window.petStayPaint(); } catch (e) { }
};

// ==========================================
// 쓰기 (소지품)
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._petStay) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            const x = BY[itemName];
            if (!x) return _u.apply(this, arguments);
            const u = u_();
            if (!u || !Array.isArray(u.inventory) || u.inventory.indexOf(itemName) < 0) return;
            const base = Math.max(Date.now(), Number(u.petStayUntil) || 0);
            u.petStayUntil = base + x.h * 3600 * 1000;
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, itemName, 1); } catch (e) { }
            log_('[🏠 집 지킴이 방석] ' + x.h + '시간 — 펫이 어둠에 따라오지 않습니다 (남은 ' + span(left(u)) + ')');
            try { if (typeof saveFields === 'function') saveFields({ petStayUntil: 1, inventory: 1, history: 1 }); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_('🏠 ' + x.n + '\n\n방석을 깔아 두었습니다. 펫들이 그 위에서 집을 지킵니다.\n'
                + '남은 시간 ' + span(left(u)) + ' — 그동안 데려가기로 고른 펫도, 몰래 따라붙던 펫도 어둠에 따라오지 않습니다.');
        };
        copyFlags(_u, w);
        w._petStay = true;
        useInventoryItem = w; try { window.useInventoryItem = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 망상 홈쇼핑 칸 — 치료 물품 바로 아래
// ==========================================
function boxHtml() {
    const u = u_();
    const inv = (u && u.inventory) || [];
    const l = left(u);
    return '<div style="font-size:12px; color:#9fd8ef; font-weight:bold; margin:0 0 4px;">🏠 집 지킴이 방석</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:7px; line-height:1.6;">'
        + '쓰면 그 시간 동안 가진 펫이 모두 집을 지킵니다 — 데려가기로 고른 펫도, 몰래 따라붙는 펫도 어둠에 따라오지 않습니다.<br>'
        + '<span style="color:#8d8578;">소지품으로 들어갑니다. 쓰면 남은 시간 뒤에 이어 붙습니다.</span></div>'
        + (l ? '<div style="font-size:10.5px; color:#9fd8ef; margin-bottom:6px;">지금 집을 지키는 중 — ' + span(l) + ' 남음</div>' : '')
        + LIST.map(function (x) {
            const have = inv.filter(function (y) { return y === x.n; }).length;
            return '<div style="display:flex; align-items:center; gap:6px; padding:4px 0; border-top:1px solid rgba(255,255,255,0.05);">'
                + '<div style="flex:1; min-width:0; font-size:11px; color:#e8d7b4;">' + esc(x.n)
                + (have ? ' <span style="color:#9fd8ef;">·' + have + '개</span>' : '') + '</div>'
                + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:6px 9px; font-size:10px;" onclick="petStayBuy(\'' + esc(x.n) + '\')">'
                + x.price.toLocaleString() + ' P</button></div>';
        }).join('');
}
window.petStayPaint = function () {
    const host = document.querySelector('#dream-body') || document.querySelector('#pet-shop-body');
    if (!host || !u_()) return;
    let el = document.getElementById('pet-stay-box');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pet-stay-box';
        el.style.cssText = 'margin-bottom:14px;';
    }
    const med = document.getElementById('pet-med-box');
    if (med && med.parentNode === host) { if (med.nextSibling !== el) host.insertBefore(el, med.nextSibling); }
    else if (el.parentNode !== host || host.firstChild !== el) host.insertBefore(el, host.firstChild);
    const h = boxHtml();
    if (el.innerHTML !== h) el.innerHTML = h;
};
(function hookShop() {
    const iv = setInterval(function () {
        if (typeof renderDream !== 'function') return;
        if (renderDream._petStay) { clearInterval(iv); return; }
        const _r = renderDream;
        const w = function () {
            const out = _r.apply(this, arguments);
            setTimeout(function () { try { window.petStayPaint(); } catch (e) { } }, 70);
            return out;
        };
        copyFlags(_r, w);
        w._petStay = true;
        renderDream = w; window.renderDream = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () {
    try {
        const panel = document.getElementById('shop-dream');
        if (!panel || !panel.classList.contains('active')) return;
        window.petStayPaint();
    } catch (e) { }
}, 1000);

window.petStayState = function () {
    const u = u_();
    console.log('%c===== 🏠 집 지킴이 방석 =====', 'color:#9fd8ef; font-size:13px');
    console.log('  집을 지키는 중:', left(u) ? span(left(u)) + ' 남음' : '아님');
    console.table(LIST.map(function (x) { return { 물품: x.n, 시간: x.h, 값: x.price, 가진것: ((u && u.inventory) || []).filter(function (y) { return y === x.n; }).length }; }));
};

})();
