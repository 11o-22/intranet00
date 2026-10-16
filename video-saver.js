// ==========================================
// ★ 영상 테두리 — 보일 때만 튼다 (배터리)
// bundles.json — frames-video5.js 다음
// ==========================================
//
// ■ 무엇이 문제였나
//
//   영상 테두리(뇌명 · 맥광 · 성운 …)는 영상 열다섯 개를 쓴다. 다섯 파일이
//   들어오자마자 **열다섯 개를 다 틀어 두고**, 끌 때까지 반복해서 돌렸다.
//   화면에 그 테두리를 단 사람이 하나도 없어도 그랬다. 영상을 푸는 일은
//   손전화가 전기를 가장 많이 쓰는 일 가운데 하나다.
//
// ■ 어떻게 하나
//
//   영상마다 쓰는 테두리가 적혀 있다 (video.dataset.fv — 각 파일이 적는다).
//   1초에 한 번, 그 테두리를 단 칸이 **지금 화면에 실제로 보이는지** 본다.
//       · 칸이 있고 · 화면 안에 들어와 있고 · 위에 다른 것(광장 창 등)이 덮지 않았다
//   보이면 틀고, 안 보이면 멈춘다. 창이 뒤로 가면(document.hidden) 다 멈춘다.
//
//   각 파일은 손짓 · 창 복귀 때마다 vid.play() 를 부른다. 그것도 막아야
//   안 보이는데 다시 돌지 않는다 — 영상마다 play 를 감싸 「보일 때만」 통과시킨다.
//
//   각 파일의 그리기 고리도 영상이 멈춰 있으면 반 초에 한 번만 깬다 (그쪽에 적었다).
//
// ■ 콘솔
//   videoSaverState()    영상마다 틀었나 · 쓰는 테두리 · 보이는 칸 수

(function videoSaver() {

const realPlay = HTMLMediaElement.prototype.play;

function vids() { return Array.prototype.slice.call(document.querySelectorAll('video[data-fv]')); }

// 이 칸이 지금 눈에 보이나
function seen(el) {
    if (!el || !el.isConnected) return false;
    if (!el.getClientRects().length) return false;                 // display:none 안쪽
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    if (r.width < 4 || r.height < 4) return false;
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;   // 화면 밖
    // 위에 다른 것이 덮었나 — 가운데와 두 모서리 안쪽을 짚어 본다
    const pts = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + Math.min(12, r.width / 3), r.top + Math.min(12, r.height / 3)],
        [r.right - Math.min(12, r.width / 3), r.bottom - Math.min(12, r.height / 3)]
    ];
    for (let i = 0; i < pts.length; i++) {
        const x = Math.max(0, Math.min(vw - 1, pts[i][0]));
        const y = Math.max(0, Math.min(vh - 1, pts[i][1]));
        const hit = document.elementFromPoint(x, y);
        if (hit && (hit === el || el.contains(hit) || (hit.closest && hit.closest('.fr-wrap') === el))) return true;
    }
    return false;
}

function shownCount(v) {
    const ids = String(v.dataset.fv || '').split(' ').filter(Boolean);
    let n = 0;
    ids.forEach(function (id) {
        Array.prototype.forEach.call(document.querySelectorAll('.fr-' + id + '.fr-wrap'), function (el) {
            if (seen(el)) n++;
        });
    });
    return n;
}
function want(v) {
    if (document.hidden) return false;
    return shownCount(v) > 0;
}

// 파일들이 아무 때나 부르는 play 를 「보일 때만」 통과시킨다
function guard(v) {
    if (v._fvGuard) return;
    v._fvGuard = true;
    v.play = function () {
        if (!want(v)) return Promise.resolve();
        return realPlay.call(v);
    };
}

function check() {
    vids().forEach(function (v) {
        guard(v);
        const w = want(v);
        if (w && v.paused) {
            try { const r = realPlay.call(v); if (r && r.catch) r.catch(function () { }); } catch (e) { }
        } else if (!w && !v.paused) {
            try { v.pause(); } catch (e) { }
        }
    });
}

check();                                        // 들어오자마자 틀어 둔 것부터 세운다
setInterval(check, 1000);
document.addEventListener('visibilitychange', check);
// 손짓 뒤에 화면이 바뀌었을 수 있다 (창이 열리고 닫힘) — 조금 뒤에 한 번 더
['click', 'touchend'].forEach(function (ev) {
    document.addEventListener(ev, function () { setTimeout(check, 250); }, true);
});

window.videoSaverState = function () {
    console.log('%c===== 🎞 영상 테두리 =====', 'color:#d4af37; font-size:13px');
    console.table(vids().map(function (v) {
        return { 테두리: v.dataset.fv, 틀었나: v.paused ? '멈춤' : '재생', 보이는칸: shownCount(v) };
    }));
};

console.log('[영상 테두리] 보일 때만 틉니다 — videoSaverState()');

})();
