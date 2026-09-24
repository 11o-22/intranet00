// ==========================================
// ★ 은행 · 금고 — 전액 버튼
// index.html 에서 chatcontrast.js 다음에 불러온다
// ==========================================

// --- 값 채우기 ---
function fillAmt(id, v) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = Math.max(0, Math.floor(v || 0));
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

// 은행 — 넣을 수 있는 최대 (보유 포인트와 남은 한도 중 작은 쪽)
function bankMaxIn() {
    if (!bankState) return 0;
    const room = bankCap(bankState) - (bankState.deposit || 0);
    return Math.max(0, Math.min(currentUser.points || 0, room));
}
function bankMaxOut() {
    if (!bankState) return 0;
    return Math.max(0, bankState.deposit || 0);
}

// 금고
function safeMaxIn() {
    const room = safeCapacity(currentUser) - safeTotal(currentUser);
    return Math.max(0, Math.min(currentUser.points || 0, room));
}
function safeMaxOut() {
    return Math.max(0, safeTotal(currentUser));
}

// --- 은행 화면에 버튼 붙이기 ---
(function hookBank() {
    if (typeof renderBank !== 'function') return;
    const _r = renderBank;
    renderBank = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const inp = document.getElementById('bank-dep-amt');
            if (!inp || document.getElementById('bank-allbtn')) return;

            const row = document.createElement('div');
            row.id = 'bank-allbtn';
            row.style.cssText = 'display:flex; gap:5px; margin:7px 0 0 0;';
            row.innerHTML = `
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', bankMaxIn())">전액 입금액</button>
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', bankMaxOut())">전액 출금액</button>
                <button class="game-btn" style="flex:0 0 58px; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', 0)">지움</button>`;
            inp.parentElement.insertBefore(row, inp.nextSibling);

            const info = document.createElement('div');
            info.style.cssText = 'font-size:10px; color:#888; margin-top:5px; line-height:1.6;';
            info.innerHTML = `넣을 수 있는 최대 <b style="color:#4CAF50;">${bankMaxIn().toLocaleString()} P</b> · 뺄 수 있는 최대 <b style="color:#ffd700;">${bankMaxOut().toLocaleString()} P</b>`;
            row.parentElement.insertBefore(info, row.nextSibling);
        }, 60);
        return r;
    };
})();

// --- 금고 화면에 버튼 붙이기 ---
(function hookSafe() {
    if (typeof openSafePanel !== 'function') return;
    const _o = openSafePanel;
    openSafePanel = function () {
        const r = _o.apply(this, arguments);
        setTimeout(function () {
            const inp = document.getElementById('safe-amount');
            if (!inp || document.getElementById('safe-allbtn')) return;

            const row = document.createElement('div');
            row.id = 'safe-allbtn';
            row.style.cssText = 'display:flex; gap:5px; margin:7px 0 0 0;';
            row.innerHTML = `
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', safeMaxIn())">전액 입금액</button>
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', safeMaxOut())">전액 출금액</button>
                <button class="game-btn" style="flex:0 0 58px; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', 0)">지움</button>`;
            inp.parentElement.insertBefore(row, inp.nextSibling);

            const info = document.createElement('div');
            info.style.cssText = 'font-size:10px; color:#888; margin-top:5px; line-height:1.6;';
            info.innerHTML = `넣을 수 있는 최대 <b style="color:#4CAF50;">${safeMaxIn().toLocaleString()} P</b> · 뺄 수 있는 최대 <b style="color:#ffd700;">${safeMaxOut().toLocaleString()} P</b>`;
            row.parentElement.insertBefore(info, row.nextSibling);
        }, 60);
        return r;
    };
})();

console.log('[은행·금고] 전액 버튼 적용');