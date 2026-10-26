// ==========================================
// ★ 새로 올린 것을 켜 둔 화면에도 — 묵은 묶음을 계속 돌리지 않게 (2026-10-26)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
// ■ 왜
//
//   휴대폰 · PC 에 켜 둔 화면은 새로 올려도 **새로 열기 전까지** 예전 코드를 돌린다.
//   지운 이모티콘이 깨진 그림으로 남아 보이고, 고친 것이 「아직도」 일어난다.
//
// ■ 어떻게
//
//   build.mjs 가 올릴 때마다 번호를 찍는다 — 묶음 안 window.__BUILD 와 b/build.json.
//   이 화면은 1분 반마다(그리고 화면을 다시 볼 때마다) b/build.json 을 받아 견준다.
//   다르면 —
//     · 화면이 가려져 있으면(다른 앱 · 다른 탭) 그 자리에서 새로 연다
//     · 보고 있으면 위쪽에 띠를 띄우고, 누르면 새로 연다 · 다음에 가려질 때 저절로 새로 연다
//   어둠 · K 의 방 · 재난 · 피날레 · 마작 안이거나 글을 쓰는 중이면 기다린다.
//
// ■ 콘솔
//   updateState()

(function updateCheck() {

const MINE = String(window.__BUILD || '');
let latest = '', pending = false, lastAt = 0;

function busy(typing) {
    try { if (typeof darkRun !== 'undefined' && darkRun) return '어둠'; } catch (e) { }
    try { if (typeof window.kroomOn === 'function' && window.kroomOn()) return 'K 의 방'; } catch (e) { }
    if (document.getElementById('dz-ov')) return '재난';
    if (document.getElementById('fin-ov')) return '피날레';
    const mj = document.getElementById('mj-root');                // 마작 판 (mj-tile-defs 같은 그림 정의는 늘 있다)
    if (mj && mj.offsetParent !== null) return '마작';
    if (typing) {
        const a = document.activeElement;
        if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') && String(a.value || '').trim()) return '쓰는 중';
    }
    return '';
}
function reload() {
    try { console.log('[새 판] ' + MINE + ' → ' + latest + ' — 새로 엽니다'); } catch (e) { }
    location.reload();
}
function bar() {
    if (document.getElementById('upd-bar')) return;
    const b = document.createElement('div');
    b.id = 'upd-bar';
    b.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);z-index:2147483000;'
        + 'background:rgba(20,20,24,.94);color:#ffe08a;border:1px solid #6b5a2a;border-radius:18px;padding:7px 14px;font-size:12px;'
        + 'box-shadow:0 4px 18px rgba(0,0,0,.45);cursor:pointer;white-space:nowrap;';
    b.textContent = '✦ 새로 올린 판이 있습니다 — 눌러서 새로 열기';
    b.onclick = function () { const w = busy(false); if (w) { b.textContent = '✦ ' + w + ' 을(를) 마친 뒤에 눌러 주세요'; return; } reload(); };
    document.body.appendChild(b);
}
function act() {
    if (!pending) return;
    if (document.visibilityState === 'hidden') { if (!busy(false)) reload(); return; }
    bar();
}
function check() {
    if (!MINE) return;
    if (Date.now() - lastAt < 20000) return;
    lastAt = Date.now();
    fetch('b/build.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
            if (!j || !j.b) return;
            latest = String(j.b);
            if (latest !== MINE && latest > MINE) { pending = true; act(); }
        }).catch(function () { });
}
setTimeout(check, 20000);
setInterval(check, 90000);
setInterval(act, 5000);
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') check();
    else act();
});

window.updateState = function () {
    console.log('[새 판] 이 화면 ' + (MINE || '(번호 없음)') + ' · 서버 ' + (latest || '아직 안 봄') + (pending ? ' — 새로 열 차례' + (busy(true) ? ' (' + busy(true) + ' — 기다림)' : '') : ''));
};

})();
