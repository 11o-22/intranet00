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

/* 테두리 두른 칸 — 글자가 빛에 묻히지 않게 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap {
    background-color: rgba(8,8,11,0.88) !important;
    background-clip: padding-box !important;
}
#history-list-container .history-item.fr-wrap *,
#employee-cards-container .emp-list-card.fr-wrap * {
    text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 7px rgba(0,0,0,0.85) !important;
}
`;



    // ==========================================
    // 3. 밝은 벽지·밝은 테마에서 글씨가 사라지던 것
    // ==========================================
    //
    // ■ 무엇이 일어났나
    //
    //   테두리 두른 칸은 **바탕이 어둡다.** 테두리의 빛과 무늬가 보여야
    //   하기 때문이다. S등급은 background-color:#0a0a08 을, A등급은
    //   검은 그림층을 자기 규칙으로 깐다. 그 규칙은 벽지(skin.js)를
    //   이기도록 명시도를 일부러 올려 두었다. (frames.js 의 FR_SCOPE)
    //
    //   그런데 **밝은 벽지와 밝은 테마는 글씨를 어둡게** 바꾼다.
    //   그래서 어두운 바탕 위에 어두운 글씨가 얹혀 아무것도 안 보였다.
    //   재어 보니 밝은 벽지에서 명암비가 1.1~1.4 였다. (4.5 는 되어야 한다)
    //
    // ■ 어떻게 맞췄나
    //
    //   테두리 칸 안에서는 **바탕도 글씨도 어두운 쪽 짝으로** 고정한다.
    //   벽지(1,2,1)·테마(0,2,1)·테두리(1,3,1) 보다 센 명시도로 깔아야
    //   이기므로, 아래 두 머리를 앞에 붙여 (2,3,2) 이상으로 만든다.
    //
    //       html body …                              ← 테마용
    //       html body[data-ui-skin] #app-container …  ← 벽지용
    //
    //   바탕은 테두리가 없는 칸은 건드리지 않는다. 벽지를 쓰는 사원의
    //   기록 칸·열람 카드는 그대로 벽지 색으로 남는다.
    //
    //   글씨는 칸 자체와, 코드에 직접 박힌 색(style="color:#...")을
    //   되돌린다. 벽지가 그 색들을 어둡게 바꿔 놓기 때문이다.
    //   상태 꼬리표(정상·약 위험·상담 요망·완전 오염)는 색이 뜻을
    //   가지므로 원래 네 색으로 되돌린다.

    const FX_AT = ['html body ', 'html body[data-ui-skin] #app-container '];
    const FX_BOX = [
        '#history-list-container .history-item.fr-wrap',
        '#employee-cards-container .emp-list-card.fr-wrap'
    ];
    function fx(inner) {
        const tails = String(inner || '').split(',').map(function (s) { return s.trim(); });
        const out = [];
        FX_AT.forEach(function (p) {
            FX_BOX.forEach(function (b) {
                tails.forEach(function (t) { out.push(p + b + (t ? ' ' + t : '')); });
            });
        });
        return out.join(',\n');
    }
    const LIGHT = '#e9e4d8';        // 글씨
    const DIM = '#b8b2a6';          // 흐린 글씨
    const STATUS = {                // 오염도 꼬리표 — 색이 뜻을 가진다
        '#4CAF50': ['#6ddc7a', 'rgba(76,175,80,0.20)'],
        '#ffd700': ['#ffd700', 'rgba(255,215,0,0.20)'],
        '#ff9800': ['#ffb04c', 'rgba(255,152,0,0.20)'],
        '#ff4c4c': ['#ff7b7b', 'rgba(255,76,76,0.28)']
    };

    let css2 = `
${fx('')} {
    background-color: rgba(8,8,11,0.88) !important;
    color: ${LIGHT} !important;
}
${fx('.history-time, .emp-list-sub, .letter-meta, .inv-card-desc')} { color: ${DIM} !important; }
${fx('.emp-list-title, .inv-card-name')} { color: #f2eee4 !important; }
${fx('.emp-role-tag')} {
    color: #ffd700 !important;
    background: rgba(255,215,0,0.12) !important;
    border-color: rgba(255,215,0,0.35) !important;
}
${fx('[style*="color:#fff"], [style*="color: #fff"], [style*="color:#eee"], [style*="color:#ddd"], [style*="color: #ddd"], [style*="color:#ccc"], [style*="color:#bbb"], [style*="color:var(--theme-text)"]')} {
    color: #f2eee4 !important;
}
${fx('[style*="color:#aaa"], [style*="color:#999"], [style*="color:#888"], [style*="color: #888"], [style*="color:#777"], [style*="color:#666"], [style*="color:#555"]')} {
    color: ${DIM} !important;
}
${fx('[style*="color:#ffd700"], [style*="color:#d4af37"]')} { color: #ffd700 !important; }
${fx('[style*="color:#c9a8ff"], [style*="color:#d4bbff"]')} { color: #d4bbff !important; }
${fx('[style*="color:#4fc3f7"], [style*="color:#7fd4d4"]')} { color: #7fd4d4 !important; }
`;
    Object.keys(STATUS).forEach(function (k) {
        const v = STATUS[k];
        css2 += `${fx('.status-tag[style*="color:' + k + '"]')} {
    color: ${v[0]} !important;
    background: ${v[1]} !important;
    border-color: ${v[0]} !important;
}
`;
    });



    const st = document.createElement('style');
    st.id = 'frames-fix-css';
    st.textContent = css + css2;
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