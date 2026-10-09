// ==========================================
// ★ 홈 화면에 올려 앱처럼 쓰기
// bundles.json 마지막 묶음, 아무 데나 (뒤쪽이면 좋다)
// ==========================================
//
// ■ 무엇이 되나
//
//   홈 화면에 아이콘이 생기고, 거기서 열면 **주소창 없이 꽉 찬 화면**으로
//   뜬다. 겉보기에는 앱이다. 스토어도, 심사도, 돈도 없다.
//
//   · 안드로이드 — 브라우저가 「설치」를 물어본다. 안 물어보면 아래
//     단추로 직접 띄운다.
//   · 아이폰 — 사파리가 물어보지 않는다. 공유 → 홈 화면에 추가를
//     사람이 눌러야 한다. 그 안내를 한 번만 띄운다.
//
// ■ 서비스 워커
//
//   sw.js 를 걸어 두면 서버가 느리거나 안 될 때 들고 있던 것으로 연다.
//   묵은 것을 내보내지 않도록 **네트워크 먼저**로 짰다 (sw.js 머리말 참고).
//   새로 올리면 BUILD 가 바뀌어 들고 있던 것을 통째로 버린다.
//
// ■ 안전 구역
//
//   꽉 찬 화면으로 뜨면 위쪽 노치와 아래쪽 띠에 글자가 가린다.
//   standalone 일 때만 body 에 안전 구역만큼 여백을 준다.
//
// ■ 콘솔
//   pwaState()      지금 어떤 꼴로 열려 있나 · 서비스 워커 상태
//   pwaInstall()    설치 창 띄우기 (안드로이드)
//   pwaReset()      들고 있던 것을 버리고 서비스 워커를 뗀다

(function pwa() {

const HINT_KEY = 'pwaHintShown';

function standalone() {
    try {
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.navigator && window.navigator.standalone) return true;      // 아이폰
    } catch (e) { }
    return false;
}
function isIOS() {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    // 아이패드는 요즘 맥인 척한다
    return /Macintosh/.test(ua) && typeof document.ontouchend !== 'undefined';
}
function isSafari() {
    const ua = navigator.userAgent || '';
    return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
}

// ==========================================
// 1. 서비스 워커
// ==========================================
let reg = null;
(function hookSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;  // https 에서만 돈다
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (r) {
            reg = r;
            console.log('[앱] 서비스 워커를 걸었습니다');
            // 새것이 올라오면 기다리지 말고 바로 넘긴다
            r.addEventListener('updatefound', function () {
                const w = r.installing;
                if (!w) return;
                w.addEventListener('statechange', function () {
                    if (w.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[앱] 새 판이 올라왔습니다 — 다음에 열 때 반영됩니다');
                        try { w.postMessage('skipWaiting'); } catch (e) { }
                    }
                });
            });
        }).catch(function (e) { console.warn('[앱] 서비스 워커를 못 걸었습니다', e); });
    });
})();

// ==========================================
// 2. 안전 구역 — 꽉 찬 화면일 때만
// ==========================================
(function safeArea() {
    if (!standalone()) return;
    const st = document.createElement('style');
    st.textContent =
        'body{padding-top:env(safe-area-inset-top);'
        + 'padding-bottom:env(safe-area-inset-bottom);'
        + 'padding-left:env(safe-area-inset-left);'
        + 'padding-right:env(safe-area-inset-right);}'
        + '#notice-ticker{top:env(safe-area-inset-top) !important;}';
    document.head.appendChild(st);
    document.documentElement.classList.add('pwa-standalone');
})();

// ==========================================
// 3. 안드로이드 — 설치 물어보기
// ==========================================
let waiting = null;
window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    waiting = e;
    console.log('[앱] 설치할 수 있습니다 — pwaInstall() 또는 로그인 화면의 단추');
    paintBtn();
});
window.addEventListener('appinstalled', function () {
    waiting = null;
    const b = document.getElementById('pwa-btn');
    if (b) b.remove();
    console.log('[앱] 홈 화면에 올렸습니다');
});

window.pwaInstall = function () {
    if (!waiting) {
        showHint(true);
        return;
    }
    waiting.prompt();
    waiting.userChoice.then(function (r) {
        console.log('[앱] 설치 ' + (r && r.outcome === 'accepted' ? '함' : '안 함'));
        waiting = null;
        const b = document.getElementById('pwa-btn');
        if (b) b.remove();
    });
};

// 로그인 화면 아래에 조용히 하나
function paintBtn() {
    if (standalone() || !waiting) return;
    if (document.getElementById('pwa-btn')) return;
    const anchor = document.getElementById('code-input');
    if (!anchor) return;
    const box = anchor.closest('div') || anchor.parentNode;
    if (!box) return;
    box.insertAdjacentHTML('afterend',
        '<div id="pwa-btn" style="margin-top:10px; text-align:center;">'
        + '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;'
        + ' border-color:#4a5160 !important; color:#aaa !important;" onclick="pwaInstall()">'
        + '홈 화면에 올리기</button>'
        + '<div style="font-size:9px; color:#666; margin-top:4px;">주소창 없이 앱처럼 열립니다</div>'
        + '</div>');
}
setInterval(function () { try { paintBtn(); } catch (e) { } }, 1500);

// ==========================================
// 4. 아이폰 — 손으로 올려야 한다
// ==========================================
function showHint(force) {
    if (standalone()) return;
    if (!force) {
        try { if (localStorage.getItem(HINT_KEY)) return; } catch (e) { }
    }
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { }

    const ios = isIOS();
    const msg = ios
        ? ('홈 화면에 올려 두면 앱처럼 쓸 수 있습니다.\n\n'
            + (isSafari() ? '' : '※ 먼저 사파리로 열어 주세요.\n\n')
            + '아래쪽 공유 단추 → 「홈 화면에 추가」')
        : ('홈 화면에 올려 두면 앱처럼 쓸 수 있습니다.\n\n'
            + '브라우저 메뉴(⋮) → 「앱 설치」 또는 「홈 화면에 추가」');
    setTimeout(function () {
        try { showCustomAlert(msg); } catch (e) { }
    }, 2500);
}

// 로그인해서 자리를 잡은 뒤에 한 번만
(function hintOnce() {
    let shown = false;
    const iv = setInterval(function () {
        if (shown) { clearInterval(iv); return; }
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (standalone()) { shown = true; clearInterval(iv); return; }
        if (waiting) return;                 // 안드로이드는 단추로 안내한다
        shown = true;
        clearInterval(iv);
        showHint(false);
    }, 3000);
    setTimeout(function () { clearInterval(iv); }, 10 * 60000);
})();

// ==========================================
// 확인 · 치우기
// ==========================================
window.pwaState = function () {
    console.log('%c===== 앱처럼 쓰기 =====', 'color:#d4af37; font-size:13px');
    console.log('  꽉 찬 화면으로 열림:', standalone() ? 'O' : '✗ (브라우저로 열려 있습니다)');
    console.log('  기기:', isIOS() ? ('아이폰·아이패드' + (isSafari() ? ' · 사파리' : ' · 사파리가 아님')) : '그 밖');
    console.log('  설치 물어볼 수 있나:', waiting ? 'O — pwaInstall()' : '✗ (이미 올렸거나 브라우저가 안 물어봅니다)');
    if (!('serviceWorker' in navigator)) { console.log('  서비스 워커: 쓸 수 없는 브라우저'); return; }
    navigator.serviceWorker.getRegistrations().then(function (rs) {
        console.log('  서비스 워커:', rs.length ? (rs.length + '개 걸림') : '없음',
            navigator.serviceWorker.controller ? '· 지금 이 화면을 맡고 있습니다' : '· 아직 안 맡음');
        return caches.keys();
    }).then(function (ks) {
        console.log('  들고 있는 꾸러미:', ks && ks.length ? ks.join(', ') : '없음');
        console.log('  다 버리려면 pwaReset()');
    }).catch(function () { });
};

window.pwaReset = function () {
    const jobs = [];
    if ('serviceWorker' in navigator) {
        jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) {
            return Promise.all(rs.map(function (r) { return r.unregister(); }));
        }));
    }
    if (window.caches) {
        jobs.push(caches.keys().then(function (ks) {
            return Promise.all(ks.map(function (k) { return caches.delete(k); }));
        }));
    }
    Promise.all(jobs).then(function () {
        console.log('%c✓ 다 버렸습니다. 새로고침하면 처음부터 받습니다.', 'color:#4CAF50');
    });
};

console.log('[앱] 홈 화면에 올리기 — pwaState() · pwaInstall()');

})();
