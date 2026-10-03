// ==========================================
// ★ 기록 칸이 깜박이는 것
// bundles.json 마지막 그룹 아무 데나 (frames-video3.js 보다 뒤면 더 좋다)
// ==========================================
//
// ■ 왜 깜박이나
//
//   renderHistory 는 들어올 때마다 칸을 통째로 다시 만든다. (index.html:7542)
//
//       container.innerHTML = currentUser.history.map(h => `
//           <div class="history-item">...</div>
//       `).join('');
//
//   그리고 이 함수는 updateUI 안에서 돈다. (index.html:5891)
//   updateUI 는 서버에서 내 자리가 바뀔 때마다(applyMine, index.html:1378)
//   그리고 남이 바뀌면 3초에 한 번(touchOthers, index.html:1366) 불린다.
//
//   그러니 몇 초마다 줄이 전부 버려지고 새로 생긴다.
//   줄이 버려지면 거기 붙어 있던 영상 캔버스도 같이 사라진다.
//   다시 붙이는 일은 scan() 이 맡는데 그것은 1.2초마다 한 번만 돈다.
//
//       setInterval(scan, 1200);     (frames-video2.js:220)
//
//   그래서 다시 그려질 때마다 최대 1.2초 동안 테두리가 없다. 그게 깜박임이다.
//
// ■ 어떻게 고치나
//
//   기록 내용이 그대로면 다시 그리지 않는다.
//   renderHistory 는 currentUser.history 만 보고 글자를 만들므로,
//   그 내용이 같으면 결과도 같다. 줄을 그냥 두면 캔버스도 살아 있다.
//
//   기록이 실제로 바뀌었을 때만 다시 그린다. 그때는 어차피 한 번 깜박인다.

(function noRepaint() {

function sigOf() {
    const h = (currentUser && currentUser.history) || [];
    let s = h.length + '|';
    for (let i = 0; i < h.length; i++) {
        s += (h[i] && h[i].time) + '\u0001' + (h[i] && h[i].text) + '\u0002';
    }
    return s;
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof renderHistory !== 'function') return;
        if (renderHistory._noRepaint) { clearInterval(iv); return; }

        const _r = renderHistory;
        renderHistory = function () {
            const box = document.getElementById('history-list-container');
            if (!box || !currentUser) return _r.apply(this, arguments);

            const sig = sigOf();
            // 글자가 그대로고 줄도 멀쩡히 있으면 손대지 않는다
            if (box._sig === sig && box.children.length) return;

            const r = _r.apply(this, arguments);
            box._sig = sig;
            return r;
        };
        renderHistory._noRepaint = true;
        clearInterval(iv);
        console.log('[기록] 내용이 같으면 다시 그리지 않습니다');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
//
// 켜 두면 얼마나 아꼈는지 센다.
window.repaintState = function (sec) {
    sec = sec || 10;
    if (typeof renderHistory !== 'function' || !renderHistory._noRepaint) {
        console.warn('아직 연결되지 않았습니다.'); return;
    }
    const box = document.getElementById('history-list-container');
    let calls = 0, redraw = 0;
    const _r = renderHistory;
    renderHistory = function () {
        calls++;
        const before = box && box.firstElementChild;
        const r = _r.apply(this, arguments);
        if (box && box.firstElementChild !== before) redraw++;
        return r;
    };
    console.log('%c===== 기록 칸 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  ' + sec + '초 동안 세어 봅니다…');
    setTimeout(function () {
        renderHistory = _r;
        console.log('  renderHistory 호출 ' + calls + '회 · 실제로 다시 그린 것 ' + redraw + '회');
        console.log('  나머지 ' + (calls - redraw) + '회는 줄을 그대로 두었습니다. 그만큼 안 깜박입니다.');
    }, sec * 1000);
};

console.log('[기록] repaintState(10)');

})();