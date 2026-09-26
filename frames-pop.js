// ==========================================
// ★ 테두리 — 벽지에 묻히지 않게
// index.html 에서 frames-fix.js 다음에 불러온다
// ==========================================
//
// 벽지 색과 테두리 색이 비슷하면 경계가 사라진다.
// 테두리 바깥에 어두운 선을 한 겹 둘러 떼어 놓는다.
// outline 은 border · box-shadow 와 겹치지 않아 안전하다.

const FRAME_POP = {
    ring: 2,          // 바깥 어두운 선 두께 (px)
    gap: 1,           // 테두리와 그 선 사이 틈 (px)
    dark: 0.72,       // 선의 짙기 (0~1)
    width: 3          // 테두리 자체 두께 (px)
};

function framePopCSS(o) {
    const c = Object.assign({}, FRAME_POP, o || {});
    return `
/* 바깥 분리선 — 벽지와 테두리를 떼어 놓는다 */
.fr-wrap {
    outline: ${c.ring}px solid rgba(0,0,0,${c.dark}) !important;
    outline-offset: ${c.gap}px !important;
}

/* 테두리를 조금 굵게 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap,
#badge-photo-display.fr-wrap {
    border-width: ${c.width}px !important;
}

/* 분리선이 잘리지 않게 자리를 넓힌다 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap {
    margin: ${c.ring + c.gap + 2}px ${c.ring + c.gap + 2}px ${c.ring + c.gap + 7}px ${c.ring + c.gap + 2}px !important;
}
#history-list-container,
#employee-cards-container {
    padding: ${c.ring + c.gap + 2}px ${c.ring + c.gap}px !important;
}
#badge-photo-display.fr-wrap {
    margin: ${c.ring + c.gap + 2}px auto !important;
}

/* 견본첩 미리보기도 같게 */
.fr-wrap[style*="34px"] {
    outline-width: 1px !important;
    outline-offset: 1px !important;
}
`;
}

function applyFramePop(o) {
    let st = document.getElementById('frame-pop-css');
    if (!st) {
        st = document.createElement('style');
        st.id = 'frame-pop-css';
        document.head.appendChild(st);
    }
    st.textContent = framePopCSS(o);
}

applyFramePop();

// ==========================================
// 콘솔에서 바로 조절
//   framePop({ ring:3, dark:0.85, width:4 })
//   framePop('off')   끄기
//   framePop('on')    다시 켜기
// ==========================================
function framePop(o) {
    if (o === 'off') {
        const st = document.getElementById('frame-pop-css');
        if (st) st.textContent = '';
        console.log('[테두리] 분리선을 껐습니다.');
        return;
    }
    if (o === 'on' || o === undefined) {
        applyFramePop();
        console.log('[테두리] 지금 설정:', JSON.stringify(FRAME_POP));
        console.log('  바꾸려면 framePop({ ring:3, gap:2, dark:0.85, width:4 })');
        return;
    }
    Object.assign(FRAME_POP, o);
    applyFramePop();
    console.log('[테두리] 적용:', JSON.stringify(FRAME_POP));
}

console.log('[테두리] 분리선 적용 — framePop() 으로 조절');