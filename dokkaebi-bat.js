// ==========================================
// ★ 🪄 도깨비 방망이 · 🫙 소원권 소속 (2026-11-06)
// bundles.json — treasure.js 다음 (newitems.js · rare-odds.js · plaza.js 보다 뒤)
// ==========================================
//
// 2026-11-06 사용자
//   「우주쇼핑몰 재난관리국만 도깨비 방망이 15,000,000 p. 넣고 기능 - 장착, 사용이 가능하며
//    장착 후 사원을 때릴 시 그 사원이 소원권으로 변한다. 소원권은 내가 보여준 물약 두 개 중 하나로
//    랜덤으로 변하게 해주고, 때리는 건 단 한 번만 가능. 물약으로 변한 사원을 주울 시 사용 버튼이 뜨며
//    사용 시 기존 소원권처럼 상담사한테 소원 빌게 가능. 장착을 하지 않고 사용만 할시엔 그냥 바로
//    상담사한테 소원 빌게 가능. 소원권이 된 사원은 사용 시 다시 원래 돌아오거나 30분 뒤에 다시 원래
//    돌아올 수 있다. 그리고 소원권이 된 사원은 손으로 집을 수도 있게 해주고 움직일 수도 있게 해줘
//    이속은 2배 더 빠르게. 그리고 도깨비 방망이는 재난관리국 사람만 사용 및 장착 가능.
//    나올 확률은 0.000001%로 해주고 선물 상자에서도 나오게 해줘. 0.000001 확률로 단 한 개만.
//    그리고 기존의 소원권 아이템도 백일몽 사람들만 쓸 수 있게 해주고 어둠 소속은 둘 다 사용 가능하게.
//    선물상자에서 도깨비 방망이가 뜰 시에 소원권처럼 팝업 뜨게 해줘.」
//   「그리고 도깨비 방망이에 🪄 이거 붙여줘.」
// 2026-11-14 사용자
//   「소원권도 도깨비 방망이랑 같은 확률로 우주 쇼핑몰에 뜨게 해주고, 대신 백일몽 주식회사랑 어둠 소속만 뜨게 해줘.
//    사용도 그 둘만 가능하게. 도깨비 방망이는 어둠이랑 재난관리국만. 아니다. 둘 다. 확률을 10 배 더 낮추자」
//   → 우주 쇼핑몰 진열 확률 둘 다 0.0000001% (선물 상자 쪽 확률은 그대로) · 소속은 아래 그대로
//     🫙 소원권을 진열에서 숨기던 곳 셋을 풀었다 — rare-odds.js (확률 0) · index.html renderAlienShop · newitems2.js SHELF_HIDDEN
//
// ■ 나누어 맡는 곳
//
//   이 파일    물품 등록 · 우주 쇼핑몰(재난관리국 · 어둠 · 0.0000001%) · 쓰기(장착 / 소원) · 소속 안내 · 소원 보내기
//   plaza.js   광장에서 때리기 · 물약 모습 · 손에 들기 · 두 배 빠르기 · 「사용」 단추 · 30분 뒤 돌아오기
//              (「🪄 도깨비 방망이 — 소원권 물약」 칸)
//   treasure.js 선물 상자 한정품 (0.000001% · 서버 전체 하나) · 주우면 모두에게 팝업
//   rare-odds.js 진열 확률 0.0000001% (🪄 · 🫙 둘 다)
//   time-freeze.js 셧다운 동안 물약 30분은 멈춘다 (wishForm)
//
// ■ 소속
//
//   🪄 도깨비 방망이  재난관리국 (EQUIP_AFFIL '재난관리')
//   🫙 소원권         백일몽     (EQUIP_AFFIL '백일몽' — 원래 적혀 있었다 · newitems.js)
//   어둠 소속은 둘 다 (newitems2.js hookWear — canWearItem 이 어둠이면 참) · 상담사는 늘
//   우주 쇼핑몰 진열도 이 소속을 따른다 (newitems2.js shopAllowed).
//   여기서는 쓰려 할 때 「착용 조건이 맞지 않습니다」 대신 어느 소속 물건인지 알려 준다.
//
// ■ 확인
//
//   batState()

(function dokkaebiBat() {
'use strict';

const BAT = '🪄 도깨비 방망이';
const WISH = '🫙 소원권';
const PRICE = 15000000;
const RATE = 0.000000001;          // 0.0000001% — 우주 쇼핑몰 진열 확률 (2026-11-06 0.000001% → 2026-11-14 사용자 「둘 다. 확률을 10 배 더 낮추자」)
                                   //   🫙 소원권도 같은 확률로 진열한다 (rare-odds.js ODDS · newitems.js)

function u_() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); else console.log(m); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u, name) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === name; })); }
function has(u, name) { return !!(u && Array.isArray(u.inventory) && u.inventory.indexOf(name) >= 0); }

// ==========================================
// 1. 물품 등록 · 우주 쇼핑몰
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || typeof EQUIP_AFFIL === 'undefined' || typeof ALIEN_ITEMS_POOL === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[BAT] = {
            price: PRICE, usable: true, targetable: false, effect: 'dokkaebi_bat', noSell: true,
            desc: '[재난관리국] 장착하고 광장에서 사원을 때리면 그 사원이 30분 동안 소원권(물약)이 된다. 때리는 것은 단 한 번. '
                + '장착하지 않고 쓰면 바로 ??? 에게 소원을 적어 보낼 수 있다.'
        };
        EQUIP_AFFIL[BAT] = '재난관리';
        if (ALIEN_ITEMS_POOL.indexOf(BAT) < 0) ALIEN_ITEMS_POOL.push(BAT);
        window.RARE_ALIEN_RATE = window.RARE_ALIEN_RATE || {};
        window.RARE_ALIEN_RATE[BAT] = RATE;               // rare-odds.js 의 ODDS 에도 같은 값
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(BAT) < 0) NO_SELL_ITEMS.push(BAT); } catch (e) { }
    }, 200);
})();

// ==========================================
// 2. 소원 보내기 — 🫙 소원권과 같은 길 (newitems.js wish_ticket)
// ==========================================
//   title — 건의함 제목 · 성공하면 참
function wishSend(title, wish) {
    const u = u_();
    if (!u || !wish || !String(wish).trim()) return false;
    try {
        if (!db.suggestions) db.suggestions = [];
        db.suggestions.unshift({
            id: Date.now(), code: u.code, author: u.name, no: u.no,
            date: new Date().toLocaleString(),
            title: title, content: String(wish), status: 'PENDING', reply: ''
        });
        if (typeof database !== 'undefined' && database) database.ref('suggestions').set(db.suggestions);
        return true;
    } catch (e) { console.warn('[🪄] 소원 보내기', e); return false; }
}
window.wishSend = wishSend;
// 소원 적는 칸 — 다 적으면 then(wish)
function wishAsk(head, then) {
    if (typeof openTextInput !== 'function') { alert_('소원을 적을 칸을 열 수 없습니다.'); return; }
    openTextInput(WISH,
        (head ? head + '<br>' : '') + '소원을 적어 주세요.<br><span style="color:#888; font-size:10px;">적은 내용은 ??? 에게 전해집니다. 되돌릴 수 없습니다.</span>',
        '소원 내용',
        function (wish) { if (wish && wish.trim()) then(wish.trim()); });
}
window.wishAsk = wishAsk;

// ==========================================
// 3. 쓰기 — 장착하거나 · 바로 소원을 빈다
// ==========================================
function batPick(cb) {
    const old = document.getElementById('bat-pick');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'bat-pick';
    wrap.style.cssText = 'position:fixed; inset:0; z-index:100000; display:flex; align-items:center; justify-content:center;'
        + ' background:rgba(0,0,0,0.72); padding:20px;';
    wrap.innerHTML =
        '<div style="background:linear-gradient(145deg,#141a24,#0b0f16); border:1px solid #d4af37; border-radius:10px; padding:18px;'
        + ' max-width:340px; width:100%; box-shadow:0 6px 24px rgba(0,0,0,0.6);">'
        + '<div style="font-size:13px; color:#f0d27a; font-weight:bold; margin-bottom:6px;">' + esc(BAT) + '</div>'
        + '<div style="font-size:11px; color:#bbb; line-height:1.7; margin-bottom:14px;">어떻게 씁니까.</div>'
        + '<button id="bat-wear" class="game-btn" style="width:100%; margin:0 0 8px 0; padding:11px; font-size:12px;'
        + ' background:linear-gradient(145deg,#3a3320,#1e1a10) !important; border-color:#8a7a4a !important;">🪄 장착한다'
        + '<div style="font-size:10px; color:#bba; margin-top:4px; font-weight:normal;">광장에서 사원을 눌러 「때리기」 — 단 한 번 · 맞은 사원은 30분 동안 소원권이 된다</div></button>'
        + '<button id="bat-wish" class="game-btn" style="width:100%; margin:0 0 10px 0; padding:11px; font-size:12px;'
        + ' background:linear-gradient(145deg,#1c2a4a,#0e1628) !important; border-color:#4a6aa8 !important;">🫙 소원을 빈다'
        + '<div style="font-size:10px; color:#9bb; margin-top:4px; font-weight:normal;">바로 ??? 에게 소원을 적어 보낸다 · 방망이는 사라진다</div></button>'
        + '<button id="bat-no" class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;'
        + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">그만둔다</button>'
        + '</div>';
    document.body.appendChild(wrap);
    const close = function () { try { wrap.remove(); } catch (e) { } };
    wrap.querySelector('#bat-wear').onclick = function () { close(); cb('wear'); };
    wrap.querySelector('#bat-wish').onclick = function () { close(); cb('wish'); };
    wrap.querySelector('#bat-no').onclick = function () { close(); };
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
}

function batWear() {
    const u = u_();
    if (!u || !has(u, BAT)) return;
    if (wears(u, BAT)) { alert_('이미 도깨비 방망이를 쥐고 있습니다.'); return; }
    if (typeof window.__newItemWear === 'function') {
        if (window.__newItemWear(BAT)) alert_('🪄 도깨비 방망이를 손에 쥐었습니다.\n\n광장에서 사원을 눌러 「🪄 때리기」 — 단 한 번 때릴 수 있습니다.\n맞은 사원은 30분 동안 소원권이 됩니다.');
        return;
    }
    if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
    if (typeof equipFull === 'function' && equipFull(u)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
    u.equippedWeapons.push(BAT);
    try { if (typeof setEquipOwner === 'function') setEquipOwner(u, BAT, u.code); } catch (e) { }
    try { removeItemFromInventory(u, BAT, 1); } catch (e) { }
    try { addHistoryLog(u, '[장비 장착] ' + BAT); } catch (e) { }
    try { saveSelfFull(); updateUI(); } catch (e) { }
    alert_('🪄 도깨비 방망이를 손에 쥐었습니다.\n\n광장에서 사원을 눌러 「🪄 때리기」 — 단 한 번 때릴 수 있습니다.');
}

function batWish() {
    const u = u_();
    if (!u || !has(u, BAT)) return;
    wishAsk('', function (wish) {
        const me = u_();
        if (!me || !has(me, BAT)) { alert_('도깨비 방망이가 소지품에 없습니다.'); return; }
        if (!wishSend('[' + BAT + '] ' + me.name + ' 사원의 소원', wish)) { alert_('소원을 보내지 못했습니다. 다시 해 주세요.'); return; }
        try { removeItemFromInventory(me, BAT, 1); } catch (e) { }
        try { addHistoryLog(me, '[' + BAT + '] 소원을 적어 보냈습니다.'); } catch (e) { }
        try { saveSelfFull(); updateUI(); } catch (e) { }
        alert_('방망이를 한 번 휘두르자 사라졌습니다.\n\n누가 읽었는지는 알 수 없습니다.');
    });
}

// 소속이 안 맞을 때 — 어느 소속 물건인지 알려 준다
function affilMsg(name) {
    if (name === BAT) return '🪄 도깨비 방망이는 재난관리국 · 어둠 소속만 쓸 수 있습니다.';
    if (name === WISH) return '🫙 소원권은 백일몽 주식회사 · 어둠 소속만 쓸 수 있습니다.';
    return '';
}

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[BAT]) return;
        if (useInventoryItem._bat) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            const base = baseOf(itemName);
            if (base !== BAT && base !== WISH) return _u.apply(this, arguments);
            const u = u_();
            if (!u) return;
            if (typeof isQuarantined === 'function' && isQuarantined(u)) return _u.apply(this, arguments);   // 격리 안내는 원래 길로
            if (typeof canWearItem === 'function' && !canWearItem(u, itemName)) { alert_(affilMsg(base)); return; }
            if (base === WISH) return _u.apply(this, arguments);
            if (!has(u, itemName)) return;
            batPick(function (k) { if (k === 'wear') batWear(); else if (k === 'wish') batWish(); });
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._bat = true;
        useInventoryItem = w;
        try { window.useInventoryItem = w; } catch (e) { }
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 확인
// ==========================================
window.batState = function () {
    const u = u_();
    const R = window.RARE_ALIEN_RATE || {};
    console.log('%c===== 🪄 도깨비 방망이 =====', 'color:#f0d27a; font-size:13px');
    console.log('  물품:', ITEM_CATALOG && ITEM_CATALOG[BAT] ? 'O' : '✗', '· 소속:', (typeof EQUIP_AFFIL !== 'undefined') ? EQUIP_AFFIL[BAT] : '?',
        '· 진열 후보:', (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(BAT) >= 0) ? 'O' : '✗', '· 진열 확률:', (R[BAT] * 100) + '%');
    console.log('  쓰기 연결:', (typeof useInventoryItem === 'function' && useInventoryItem._bat) ? 'O' : '✗');
    if (u) console.log('  나 — 가짐', (u.inventory || []).filter(function (x) { return x === BAT; }).length, '· 쥠', wears(u, BAT) ? 'O' : '-',
        '· 쓸 수 있나', (typeof canWearItem === 'function') ? canWearItem(u, BAT) : '?');
    try { if (typeof window.plazaWishForms === 'function') console.table(window.plazaWishForms()); } catch (e) { }
};

})();
