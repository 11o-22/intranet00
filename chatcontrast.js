// ==========================================
// ★ AI 대화창 자동 대비
// index.html 에서 awaken.js 다음에 불러온다
// ==========================================
//
// 배경 밝기를 재서 글자색을 자동으로 뒤집는다.
// 테마를 새로 추가해도 따로 손볼 필요가 없다.

(function injectChatContrast() {
    const css = `
/* 대화창 바탕 — 테마와 무관하게 확실한 대비 */
#fox-chat-log, #bath-chat-log {
    background: rgba(0,0,0,0.42) !important;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    padding: 12px 11px !important;
}
#fox-chat-log *, #bath-chat-log * {
    color: #f0f0f0 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.9);
}
/* 상대 발언 강조색만 따로 */
#fox-chat-log .ai-say, #fox-chat-log b {
    color: #ffd76a !important;
}
#bath-chat-log .ai-say, #bath-chat-log b {
    color: #9fe8e8 !important;
}
/* 내 발언 */
#fox-chat-log .me-say, #bath-chat-log .me-say {
    color: #cfcfcf !important;
}
/* 입력칸 */
#fox-input, #bath-input {
    background: rgba(0,0,0,0.55) !important;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.22) !important;
}
#fox-input::placeholder, #bath-input::placeholder { color: #999 !important; }

/* 모달 본문 전반 */
#fox-modal .modal-content, #bath-modal .modal-content {
    background: #10100c !important;
}
#bath-modal .modal-content { background: #0b1418 !important; }

/* 어둠 탐사 대화 */
/* 어둠 탐사 대화 — 바탕을 어둡게 깔고 글자를 밝게 */
.pchat-wrap, .pchat-body, .pchat-log {
    background: rgba(0,0,0,0.55) !important;
}
.pchat-head {
    background: rgba(0,0,0,0.7) !important;
    color: #f0f0f0 !important;
}
.pchat-head * { color: #f0f0f0 !important; }
.pchat-log, .pchat-log * {
    color: #f2f2f2 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.95);
}
.pchat-log .pchat-sys, .pchat-log .pchat-sys * {
    color: #d8d8d8 !important;
    font-style: italic;
}
.pchat-log .pchat-name { color: #ffd76a !important; }
.pchat-log .pchat-time { color: #b0b0b0 !important; }
.pchat-log .pchat-me .pchat-name { color: #9fe8e8 !important; }
#pchat-input {
    background: rgba(0,0,0,0.55) !important;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.22) !important;
}
`;
    const st = document.createElement('style');
    st.id = 'chat-contrast';
    st.textContent = css;
    document.head.appendChild(st);
})();

// --- 밝은 바탕 위에 올라간 글자를 자동으로 뒤집는다 ---
(function autoContrast() {
    function lum(rgb) {
        const m = String(rgb).match(/\d+/g);
        if (!m || m.length < 3) return null;
        const v = m.slice(0, 3).map(function (x) {
            x = x / 255;
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    }

    function bgOf(el) {
        let n = el;
        while (n && n !== document.documentElement) {
            const c = getComputedStyle(n).backgroundColor;
            const m = String(c).match(/[\d.]+/g);
            if (m && (m.length < 4 || parseFloat(m[3]) > 0.3)) return c;
            n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
    }

    function fix(root) {
        if (!root) return;
        const l = lum(bgOf(root));
        if (l === null) return;
        const light = l > 0.45;
        root.querySelectorAll('*').forEach(function (el) {
            if (!el.childNodes.length) return;
            const has = Array.prototype.some.call(el.childNodes, function (n) {
                return n.nodeType === 3 && n.textContent.trim();
            });
            if (!has) return;
            el.style.setProperty('color', light ? '#161616' : '#f0f0f0', 'important');
            el.style.setProperty('text-shadow',
                light ? '0 1px 1px rgba(255,255,255,0.7)' : '0 1px 2px rgba(0,0,0,0.9)', 'important');
        });
    }

    window.fixChatContrast = function () {
        ['fox-chat-log', 'bath-chat-log', 'pchat-log'].forEach(function (id) {
            fix(document.getElementById(id));
        });
        document.querySelectorAll('.pchat-log').forEach(fix);
    };

    // 대화가 갱신될 때마다 다시 잡는다
    const mo = new MutationObserver(function () {
        clearTimeout(window._ccT);
        window._ccT = setTimeout(window.fixChatContrast, 60);
    });
    ['fox-chat-log', 'bath-chat-log'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) mo.observe(el, { childList: true, subtree: true });
    });

    const chatSlot = document.getElementById('dro-chat');
    if (chatSlot) mo.observe(chatSlot, { childList: true, subtree: true });

    setTimeout(window.fixChatContrast, 300);
})();

// 모달을 열 때도 한 번
(function hookOpen() {
    ['openFoxRoom', 'openBathRoom', 'enterQuarantineRoom'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(window.fixChatContrast, 200);
            return r;
        };
    });
})();

console.log('[대화창] 자동 대비 적용');