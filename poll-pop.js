// ==========================================
// ★ 오염도가 높으면 팝업이 화면 밖으로 나가던 것
// bundles.json 마지막 묶음, poll-why.js 뒤
// ==========================================
//
// ■ 무엇이 일어나고 있었나
//
//   오염도가 90 을 넘으면 화면이 어두워집니다 (index.html:5375).
//
//       container.style.filter = `brightness(…) saturate(…)`;
//
//   그런데 **filter 가 걸린 칸은 그 안의 position:fixed 를 붙잡습니다.**
//   CSS 규칙이 그렇습니다 — 거른 칸이 fixed 의 기준 칸이 되어 버려서,
//   화면에 붙어 있어야 할 팝업이 **app-container 에 붙어** 버립니다.
//
//   app-container 는 내용만큼 길어집니다(재 봄: 1844px). 그래서 팝업이
//   화면이 아니라 그 긴 칸의 한가운데에 서고, 화면을 내릴수록 같이
//   밀려 올라가 버립니다.
//
//   재 보았습니다 (사원 열람 팝업의 위쪽 자리 · 화면 높이 852):
//
//       내린 만큼      0      600     992
//       오염 10      333      333     333     ← 늘 제자리
//       오염 95      828      228    -164     ← 따라 밀린다
//
//   오염 95 에서 조금만 내려가 있으면 팝업이 화면 위로 빠져나가
//   **안 열린 것처럼** 보입니다. 바탕의 검은 막도 같이 어긋나서
//   아무 일도 안 일어난 듯합니다.
//
//   붙잡히는 것은 app-container 안에 있는 fixed 넷입니다 —
//   사원 열람 · 건의함 · 점검 안내 · 상담사 화면.
//
// ■ 어떻게 고치나
//
//   어둡게 하는 일을 **거르는 막 쪽으로 옮깁니다.** 오염 막
//   (#pollution-overlay)은 화면 위에 따로 떠 있는 칸이고 아무것도
//   품고 있지 않으므로, 거기에 backdrop-filter 로 걸면 아래 것들이
//   똑같이 어두워지면서 app-container 에는 filter 가 남지 않습니다.
//
//   ✗ 팝업 넷을 body 로 옮기는 길도 있었습니다. 그러면 지금 것은
//     고쳐지지만, 나중에 app-container 안에 fixed 를 하나 더 두면
//     또 같은 일이 납니다. 까닭 쪽을 치웁니다.
//
//   ★ 막은 z-index 9999 라 팝업(10000 위)은 안 어두워집니다. 지금도
//     팝업 대부분은 app-container 밖이라 안 어두워지고 있었으니
//     보이는 결은 그대로입니다.
//
//   backdrop-filter 를 못 쓰는 브라우저에서는 어두워지는 것만 빠지고
//   붉은 막은 그대로 뜹니다 — 팝업은 어느 쪽이든 제자리에 섭니다.
//
// ■ 콘솔
//       pollPopState()   지금 거름이 어디에 걸려 있나

(function pollPop() {

function fix() {
    const ov = document.getElementById('pollution-overlay');
    const box = document.getElementById('app-container');
    if (!ov || !box) return;
    const f = box.style.filter;
    // ★ 여기가 고치는 자리 — 품는 칸에서 거름을 걷어 낸다
    box.style.filter = '';
    const on = !!(f && f !== 'none');
    ov.style.backdropFilter = on ? f : '';
    ov.style.webkitBackdropFilter = on ? f : '';
}

if (typeof updateVisualDistortion === 'function') {
    const _u = updateVisualDistortion;
    updateVisualDistortion = function () {
        const r = _u.apply(this, arguments);
        try { fix(); } catch (e) { }
        return r;
    };
}

// 이미 걸려 있는 채로 켜졌을 수도 있다
setTimeout(fix, 1200);
setTimeout(fix, 4000);

window.pollPopState = function () {
    const ov = document.getElementById('pollution-overlay');
    const box = document.getElementById('app-container');
    console.log('%c===== 오염 거름 =====', 'color:#ff8f8f; font-size:13px');
    console.log('  오염도        :', (typeof currentUser !== 'undefined' && currentUser)
        ? currentUser.pollution : '(로그인 전)');
    console.log('  품는 칸 거름  :', (box && getComputedStyle(box).filter) || '-',
        '← none 이어야 팝업이 화면에 붙는다');
    console.log('  막 뒤 거름    :', (ov && (getComputedStyle(ov).backdropFilter
        || getComputedStyle(ov).webkitBackdropFilter)) || '-');
    const host = document.getElementById('app-container');
    const stuck = [];
    if (host) host.querySelectorAll('*').forEach(function (e) {
        if (getComputedStyle(e).position === 'fixed') stuck.push(e.id || e.className);
    });
    console.log('  품는 칸 안 fixed :', stuck.join(' · ') || '없음');
};

console.log('[오염] 거름을 막 쪽으로 옮김 — 팝업이 화면에 붙는다 (pollPopState())');

})();
