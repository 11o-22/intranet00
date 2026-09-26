// ==========================================
// ★ 테두리 — 깜빡임 · 가림 보정
// index.html 에서 frames-new.js 다음에 불러온다
// ==========================================
//
// 1) 깜빡임
//    renderHistory 가 1초에 한 번 넘게 목록을 새로 그린다.
//    새로 그려진 칸에는 테두리 클래스가 없고,
//    40ms 뒤에 붙으니 그 사이 한 프레임이 맨몸으로 그려진다.
//    → 같은 프레임 안에서 바로 붙인다.
//
// 2) 가림
//    글자와 배경이 테두리에 바짝 붙어 있어 빛이 안 보인다.
//    → 여백을 주고, 잘리지 않게 하고, 위로 올린다.

(function fixFrames() {

    // ==========================================
    // 1. 같은 프레임 안에서 붙인다
    // ==========================================
    if (typeof frRefresh === 'function') {
        ['updateUI', 'renderHistory', 'renderEmployeeCards', 'renderBadgePhoto'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._frSync) return;
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                try { frRefresh(); } catch (e) { /* 무시 */ }
                return r;
            };
            window[n]._frSync = true;
        });
        console.log('[테두리] 동기 적용으로 바꿨습니다.');
    }

    // ==========================================
    // 2. 여백 · 잘림 · 층
    // ==========================================
    const css = `
/* 테두리를 가진 칸은 위로 올리고, 빛이 잘리지 않게 한다 */
.fr-wrap {
    position: relative !important;
    z-index: 1;
    overflow: visible;
}

/* 글자가 테두리에 붙지 않게 */
#history-list-container .history-item.fr-wrap {
    padding: 11px 13px !important;
    margin: 0 3px 9px 3px !important;
    border-left-width: 2px !important;   /* 기본 3px 강조선이 테두리를 덮는다 */
}

/* 목록 상자가 빛을 잘라 먹지 않게 */
#history-list-container {
    padding: 4px 2px !important;
    overflow-x: visible !important;
}

/* 사원 열람 칸 */
#employee-cards-container .emp-list-card.fr-wrap {
    padding: 11px !important;
    margin: 0 3px 9px 3px !important;
}
#employee-cards-container {
    padding: 4px 2px !important;
    overflow-x: visible !important;
}

/* 사원증 사진 — 테두리가 사진에 먹히지 않게 안쪽으로 물린다 */
#badge-photo-display.fr-wrap {
    padding: 5px !important;
    box-sizing: border-box !important;
}
#badge-photo-display.fr-wrap img {
    border-radius: 4px;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 테두리 안쪽 내용은 항상 위에 */
.fr-wrap > * { position: relative; z-index: 2; }

/* 덧그리는 층은 절대 클릭을 먹지 않는다 */
.fr-wrap::before, .fr-wrap::after { pointer-events: none !important; }
`;

    const st = document.createElement('style');
    st.id = 'frames-fix-css';
    st.textContent = css;
    document.head.appendChild(st);

    // ==========================================
    // 3. 깜빡임 점검
    // ==========================================
    window.frameFlickerTest = function (sec) {
        const s = (sec || 6) * 1000;
        const items = () => document.querySelectorAll('#history-list-container .history-item');
        let noFrame = 0, ticks = 0;

        console.log('%c[테두리] ' + (s / 1000) + '초 동안 지켜봅니다...', 'color:#c9a8ff');
        const iv = setInterval(function () {
            ticks++;
            const el = items();
            let bare = 0;
            el.forEach(function (x) {
                if (!x.classList.contains('fr-wrap')) bare++;
            });
            if (bare > 0) noFrame++;
        }, 50);

        setTimeout(function () {
            clearInterval(iv);
            console.log('  검사 ' + ticks + '회 중 테두리가 빠진 순간: ' + noFrame + '회');
            console.log(noFrame === 0
                ? '%c  ✓ 깜빡임 없음'
                : '%c  ✗ 아직 깜빡입니다 — frRefresh 가 비동기로 돌고 있습니다',
                noFrame === 0 ? 'color:#4CAF50' : 'color:#e53935');
        }, s);
    };

    console.log('[테두리] 보정 적용 — frameFlickerTest() 로 확인');
})();