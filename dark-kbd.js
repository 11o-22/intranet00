// ==========================================
// ★ 어둠 탐사 화면 — 자판이 올라오면 그만큼 줄여 파티 채팅 입력칸을 자판 위에 둔다 (2026-10-29)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
// ■ 무엇이 불편했나
//
//   탐사 화면(#dark-run-overlay)은 100dvh 로 고정이고 파티 채팅은 그 맨 아래에 붙어 있다.
//   휴대폰에서 입력칸을 누르면 자판이 올라오는데, 요즘 크롬(안드로이드 108+)·사파리는 자판이 떠도
//   **화면(레이아웃) 높이를 줄이지 않는다.** 그래서 100dvh 는 그대로이고, 아래에 붙은 입력칸이 자판 밑으로 들어간다.
//   브라우저가 잠깐 끌어 올려 보여 주지만 글이 다시 그려지거나 채팅 글이 오면 도로 내려간다 — 「치려고 하면 내려간다」.
//
// ■ 어떻게 하나
//
//   visualViewport(실제로 보이는 영역)를 듣는다. 자판이 떠서 보이는 높이가 80px 넘게 줄면
//   탐사 화면의 세로 칸(#dro-col)을 **보이는 높이**로 줄이고 보이는 자리에 맞춰 내려 놓는다.
//   그러면 채팅 칸이 자판 바로 위에 선다. 자판이 내려가면 원래대로.
//   입력칸을 누르면 한 번 더 그 자리로 끌어 올린다 (scrollIntoView).
//
// ■ 콘솔
//   darkKbdState()

(function darkKbd() {

const vv = window.visualViewport;
let on = false;

function els() {
    const ov = document.getElementById('dark-run-overlay');
    if (!ov || ov.style.display === 'none') return null;
    const col = document.getElementById('dro-col'), slot = document.getElementById('dro-chat');
    return (col && slot) ? { ov: ov, col: col, slot: slot } : null;
}
// 원래 값(인라인 height:100dvh · max-height:52dvh)을 적어 두고 되돌린다 — '' 로 비우면 칸 높이가 사라진다
function reset() {
    const col = document.getElementById('dro-col'), slot = document.getElementById('dro-chat');
    if (col) { col.style.height = col.dataset.kbdH || '100dvh'; col.style.transform = ''; }
    if (slot) slot.style.maxHeight = slot.dataset.kbdM || '52dvh';
    on = false;
}
function fit() {
    if (!vv) return;
    const e = els();
    if (!e) { if (on) reset(); return; }
    const kb = Math.max(0, window.innerHeight - vv.height);           // 자판이 가린 높이
    if (kb > 80) {
        if (!on) { e.col.dataset.kbdH = e.col.style.height || '100dvh'; e.slot.dataset.kbdM = e.slot.style.maxHeight || '52dvh'; }
        e.col.style.height = Math.round(vv.height) + 'px';
        e.col.style.transform = 'translateY(' + Math.round(vv.offsetTop) + 'px)';
        e.slot.style.maxHeight = Math.round(vv.height * 0.6) + 'px';
        on = true;
        // 입력칸이 보이게
        const inp = document.getElementById('pchat-input');
        if (inp && document.activeElement === inp) { try { inp.scrollIntoView({ block: 'nearest' }); } catch (err) { } }
    } else if (on) reset();
}
if (vv) {
    vv.addEventListener('resize', fit);
    vv.addEventListener('scroll', fit);
}
// 입력칸을 눌렀을 때 — 자판이 다 올라온 뒤 한 번 더 맞춘다
document.addEventListener('focusin', function (ev) {
    const t = ev.target;
    if (!t || t.id !== 'pchat-input') return;
    setTimeout(fit, 150); setTimeout(fit, 450);
    setTimeout(function () { try { if (document.activeElement === t) t.scrollIntoView({ block: 'nearest' }); } catch (err) { } }, 500);
});
document.addEventListener('focusout', function (ev) {
    const t = ev.target;
    if (!t || t.id !== 'pchat-input') return;
    setTimeout(fit, 250);
});

window.darkKbdState = function () {
    console.log('%c===== 탐사 화면 · 자판 =====', 'color:#ff8a80; font-size:13px');
    console.log('  visualViewport:', vv ? (Math.round(vv.height) + ' / 창 ' + window.innerHeight + ' · 위 ' + Math.round(vv.offsetTop)) : '없음', '· 맞춤 중:', on);
};

})();
