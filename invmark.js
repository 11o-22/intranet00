// ==========================================
// ★ 소지품 — 즐겨찾기 · 자물쇠 · 확인 팝업
// index.html 에서 house-own.js 다음에 불러온다
// ==========================================

// --- 저장소 ---
function invMark() {
    if (!currentUser) return { fav: {}, lock: {} };
    if (!currentUser.invMark) currentUser.invMark = { fav: {}, lock: {} };
    if (!currentUser.invMark.fav) currentUser.invMark.fav = {};
    if (!currentUser.invMark.lock) currentUser.invMark.lock = {};
    return currentUser.invMark;
}
function isFav(n) { return !!invMark().fav[n]; }
function isLock(n) { return !!invMark().lock[n]; }

function toggleFav(n) {
    const m = invMark();
    if (m.fav[n]) delete m.fav[n]; else m.fav[n] = true;
    saveFields({ invMark: 1 });
    renderInventory();
}
function toggleLock(n) {
    const m = invMark();
    if (m.lock[n]) {
        delete m.lock[n];
        saveFields({ invMark: 1 });
        renderInventory();
        return;
    }
    m.lock[n] = true;
    saveFields({ invMark: 1 });
    renderInventory();
}

// ==========================================
// 확인 팝업
// ==========================================
(function injectConfirm() {
    if (document.getElementById('inv-confirm-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="inv-confirm-overlay" class="modal-overlay" style="display:none; z-index:10006;">
            <div class="modal-content" style="max-width:340px; text-align:center;">
                <div id="inv-confirm-icon" style="font-size:30px; margin-bottom:11px;">📦</div>
                <div id="inv-confirm-text" style="font-size:13px; color:#eee; line-height:1.8; margin-bottom:9px;"></div>
                <div id="inv-confirm-sub" style="font-size:10px; color:#888; line-height:1.6; margin-bottom:18px;"></div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-cancel" style="flex:1; background:#444; border-color:#555 !important;" onclick="closeInvConfirm()">취소</button>
                    <button class="game-btn" id="inv-confirm-ok" style="flex:1; margin:0; padding:12px;">확인</button>
                </div>
            </div>
        </div>`);
})();

let _invCb = null;
function openInvConfirm(icon, text, sub, okLabel, cb) {
    document.getElementById('inv-confirm-icon').innerText = icon;
    document.getElementById('inv-confirm-text').innerHTML = text;
    document.getElementById('inv-confirm-sub').innerHTML = sub || '';
    const ok = document.getElementById('inv-confirm-ok');
    ok.innerText = okLabel || '확인';
    _invCb = cb;
    ok.onclick = function () { const f = _invCb; closeInvConfirm(); if (f) f(); };
    document.getElementById('inv-confirm-overlay').style.display = 'flex';
}
function closeInvConfirm() {
    document.getElementById('inv-confirm-overlay').style.display = 'none';
    _invCb = null;
}

// ==========================================
// 사용 · 판매 가로채기
// ==========================================
(function hookUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const self = this, args = arguments;
        if (window._invOk === itemName) { window._invOk = null; return _use.apply(self, args); }

        const cat = ITEM_CATALOG[itemName] || {};
        const eq = String(cat.effect || '').startsWith('equip');
        openInvConfirm(
            eq ? '⚙' : '📦',
            `<b>${itemName}</b><br>${eq ? '장착하시겠습니까?' : '사용하시겠습니까?'}`,
            cat.desc || '',
            eq ? '장착한다' : '사용한다',
            function () { window._invOk = itemName; useInventoryItem(itemName); }
        );
    };
})();

(function hookSell() {
    const _sell = sellInventoryItem;
    sellInventoryItem = function (itemName) {
        if (isLock(itemName)) {
            showCustomAlert(`'${itemName}'에 자물쇠가 걸려 있습니다.\n\n소지품에서 자물쇠를 풀어야 판매할 수 있습니다.`);
            return;
        }
        if (window._invSellOk === itemName) { window._invSellOk = null; return _sell.apply(this, arguments); }

        const price = getSellPrice(itemName);
        const cnt = (currentUser.inventory || []).filter(x => x === itemName).length;
        openInvConfirm('💰',
            `<b>${itemName}</b><br>판매하시겠습니까?`,
            `${price} P를 받습니다. · 보유 ${cnt}개${isFav(itemName) ? '<br><span style="color:#ffd700;">★ 즐겨찾기에 등록된 물품입니다.</span>' : ''}`,
            '판매한다',
            function () { window._invSellOk = itemName; sellInventoryItem(itemName); }
        );
    };
})();

// 타인 사용도 확인
(function hookTarget() {
    if (typeof openItemTargetModal !== 'function') return;
    const _o = openItemTargetModal;
    openItemTargetModal = function (itemName, isPotion) {
        const self = this, args = arguments;
        if (window._invTgtOk === itemName) { window._invTgtOk = null; return _o.apply(self, args); }
        const cat = ITEM_CATALOG[itemName] || {};
        openInvConfirm('🎯',
            `<b>${itemName}</b><br>다른 사원에게 쓰시겠습니까?`,
            cat.desc || '',
            '대상 고르기',
            function () { window._invTgtOk = itemName; openItemTargetModal(itemName, isPotion); }
        );
    };
})();

// ==========================================
// 목록에 버튼 붙이기 · 즐겨찾기 정렬
// ==========================================
(function hookRender() {
    if (typeof renderInventory !== 'function') return;
    const _r = renderInventory;
    renderInventory = function () {
        const r = _r.apply(this, arguments);
        // 반드시 같은 프레임 안에서 붙인다.
        // setTimeout 을 쓰면 버튼 없는 화면이 한 번 그려지고, 그만큼 높이가 출렁인다.
        try { decorateInv(); } catch (e) { console.warn('[소지품] 표식 실패:', e); }
        return r;
    };
})();

function decorateInv() {
    const box = document.getElementById('inventory-list-container');
    if (!box || !currentUser) return;

    const cards = Array.from(box.querySelectorAll('.inv-card'));
    if (cards.length === 0) return;

    cards.forEach(function (card) {
        const nameEl = card.querySelector('.inv-card-name');
        if (!nameEl) return;
        const n = nameEl.innerText.trim();
        if (card.dataset.invDone === n) return;
        card.dataset.invDone = n;

        // 이름 앞 표식
        card.querySelectorAll('.inv-badge').forEach(e => e.remove());
        let mark = '';
        if (isFav(n)) mark += '<span class="inv-badge" style="color:#ffd700; margin-right:3px;">★</span>';
        if (isLock(n)) mark += '<span class="inv-badge" style="color:#4fc3f7; margin-right:3px;">🔒</span>';
        if (mark) nameEl.insertAdjacentHTML('beforebegin', mark);

        // 버튼
        const grp = card.querySelector('.inv-btn-group');
        if (grp && !grp.querySelector('.inv-mark-btn')) {
            grp.insertAdjacentHTML('beforeend', `
                <button class="inv-btn inv-mark-btn" style="background:${isFav(n) ? '#5a4a1a' : '#2a2a2a'}; color:${isFav(n) ? '#ffd700' : '#888'};" onclick="toggleFav('${n.replace(/'/g, "\\'")}')">${isFav(n) ? '★' : '☆'}</button>
                <button class="inv-btn inv-mark-btn" style="background:${isLock(n) ? '#1a3a4a' : '#2a2a2a'}; color:${isLock(n) ? '#4fc3f7' : '#888'};" onclick="toggleLock('${n.replace(/'/g, "\\'")}')">${isLock(n) ? '🔒' : '🔓'}</button>`);
        }

        // 자물쇠면 판매 버튼 잠금
        const sell = card.querySelector('.inv-btn-sell');
        if (sell) {
            if (isLock(n)) {
                sell.disabled = true;
                sell.style.opacity = '0.35';
                sell.innerText = '잠김';
            } else {
                sell.disabled = false;
                sell.style.opacity = '';
            }
        }
    });

    // 즐겨찾기를 위로
    // invcat.js 가 카드를 분류 상자 안에 넣으므로, 같은 부모 안에서만 옮긴다.
    // box 를 기준으로 옮기면 insertBefore 가 터지고 높이가 출렁인다.
    const byParent = new Map();
    cards.forEach(function (c) {
        const e = c.querySelector('.inv-card-name');
        if (!e || !isFav(e.innerText.trim())) return;
        if (!byParent.has(c.parentElement)) byParent.set(c.parentElement, []);
        byParent.get(c.parentElement).push(c);
    });

    byParent.forEach(function (list, parent) {
        // 이미 맨 앞에 몰려 있으면 손대지 않는다
        const kids = Array.from(parent.querySelectorAll(':scope > .inv-card'));
        let sorted = true;
        for (let i = 0; i < list.length; i++) {
            if (kids[i] !== list[i]) { sorted = false; break; }
        }
        if (sorted) return;

        const anchor = kids[0];
        list.forEach(function (c) {
            if (c !== anchor) parent.insertBefore(c, anchor);
        });
    });
}
  
console.log('[소지품] 즐겨찾기 · 자물쇠 · 확인 팝업 적용'); 