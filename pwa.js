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
// 손안의 것인가 — 글귀를 거기에 맞춘다
function handheld() {
    const ua = navigator.userAgent || '';
    if (isIOS()) return true;
    return /Android|Mobile|iPhone|iPad/.test(ua);
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
    // 꽉 찬 화면인지 가리지 않는다.
    //   아이폰에서 홈 화면 앱으로 띄워도 display-mode 와 navigator.standalone
    //   둘 다 못 잡는 자리가 있었다. env() 는 노치가 없으면 0 이므로
    //   늘 걸어 두어도 다른 기기에서는 아무 일도 일어나지 않는다.
    const T = 'env(safe-area-inset-top)', B = 'env(safe-area-inset-bottom)',
          L = 'env(safe-area-inset-left)', R = 'env(safe-area-inset-right)';

    // 꽉 찬 화면 오버레이는 body 의 여백을 받지 않는다. position:fixed 는
    // body 가 아니라 화면에 붙기 때문이다. 그래서 제 안쪽으로 따로 밀어 준다.
    // 안 밀면 어둠 탐사 머리칸의 ↻ · 🔊 가 아이폰 상태 표시줄(시계·배터리·
    // 다이내믹 아일랜드) 밑에 깔려 손가락이 닿지 않는다.
    //
    // 안쪽 칸은 inline 으로 height:100dvh 가 박혀 있다. 그대로 두면 밀어 낸
    // 만큼 아래로 넘쳐서 채팅칸이 홈 바에 잘린다. 그래서 100% 로 바꾼다.
    // inline 을 이기려면 !important 가 있어야 한다.
    const pad = function (sel, extra) {
        return sel + '{box-sizing:border-box !important;'
            + 'padding-top:' + (extra ? 'calc(' + extra + ' + ' + T + ')' : T) + ' !important;'
            + 'padding-bottom:' + (extra ? 'calc(' + extra + ' + ' + B + ')' : B) + ' !important;'
            + 'padding-left:' + (extra ? 'calc(' + extra + ' + ' + L + ')' : L) + ' !important;'
            + 'padding-right:' + (extra ? 'calc(' + extra + ' + ' + R + ')' : R) + ' !important;}';
    };

    const st = document.createElement('style');
    st.textContent =
        'body{padding-top:' + T + ';'
        + 'padding-bottom:' + B + ';'
        + 'padding-left:' + L + ';'
        + 'padding-right:' + R + ';}'
        + '#notice-ticker{top:' + T + ' !important;}'

        // 어둠 탐사 — 머리칸(구역 번호 · ↻ · 🔊)과 바닥 채팅칸
        + pad('#dark-run-overlay')
        + '#dark-run-overlay{height:100dvh !important;}'
        + '#dark-run-overlay > div{height:100% !important; max-height:100% !important;}'

        // 테트리스 — 원래 있던 16px 위에 얹는다
        + pad('#tetris-overlay', '16px')

        // 가운데 뜨는 창들 — 길어졌을 때 위아래로 넘치지 않게
        + pad('.modal-overlay')
        + pad('#custom-alert-overlay')
        + pad('#quarantine-pick-overlay')
        + pad('#dark-resume-overlay')
        + pad('#dark-invite-overlay')
        + pad('#auto-login-overlay')
        + pad('#maintenance-overlay');
    document.head.appendChild(st);
    if (standalone()) document.documentElement.classList.add('pwa-standalone');
})();

// ==========================================
// 2-1. 안전 구역을 손으로도 한 번 더 박는다
// ==========================================
//
//   위의 규칙만으로 안 걸리는 자리를 한 번 겪었다. 묶음이 묵었거나,
//   다른 파일이 더 센 규칙을 뒤에 깔았거나, 화면을 다시 그리면서 inline
//   style 을 새로 박았거나 — 어느 쪽이든 결과는 같다. 머리칸의 ↻ · 🔊 가
//   상태 표시줄 밑에 깔려 손가락이 안 닿는다.
//
//   그래서 실제 여백을 재서 요소에 직접 박는다. CSS 보다 뒤에 오고
//   inline 끼리 겨루므로 이쪽이 이긴다.
(function stickSafe() {
    let rule = null;
    function inset() {
        // env() 를 재는 작은 자 — 값이 바뀌면(돌리면) 다시 잰다
        if (!rule) {
            rule = document.createElement('div');
            rule.id = 'safe-ruler';
            rule.setAttribute('aria-hidden', 'true');
            rule.style.cssText = 'position:fixed; left:0; top:0; width:0; pointer-events:none;'
                + ' visibility:hidden; z-index:-1;'
                + ' padding-top:env(safe-area-inset-top);'
                + ' padding-bottom:env(safe-area-inset-bottom);'
                + ' padding-left:env(safe-area-inset-left);'
                + ' padding-right:env(safe-area-inset-right);';
            (document.body || document.documentElement).appendChild(rule);
        }
        const c = getComputedStyle(rule);
        return { t: parseFloat(c.paddingTop) || 0, b: parseFloat(c.paddingBottom) || 0,
                 l: parseFloat(c.paddingLeft) || 0, r: parseFloat(c.paddingRight) || 0 };
    }

    function stamp() {
        const ov = document.getElementById('dark-run-overlay');
        if (!ov || ov.style.display === 'none' || !ov.style.display) return;   // 안 떠 있다
        const i = inset();
        if (!i.t && !i.b && !i.l && !i.r) return;          // 노치가 없는 기기
        const tag = i.t + '/' + i.b + '/' + i.l + '/' + i.r;
        if (ov.getAttribute('data-safe') === tag) return;
        ov.setAttribute('data-safe', tag);
        // important 로 박는다. 위 2번이 깐 규칙도 important 라, 그냥 inline 으로는
        // 진다. inline 의 important 만이 그것을 넘는다.
        const set = function (el, k, v) { try { el.style.setProperty(k, v, 'important'); } catch (e) { el.style[k] = v; } };
        set(ov, 'box-sizing', 'border-box');
        set(ov, 'height', '100dvh');
        set(ov, 'padding-top', i.t + 'px');
        set(ov, 'padding-bottom', i.b + 'px');
        set(ov, 'padding-left', i.l + 'px');
        set(ov, 'padding-right', i.r + 'px');
        const inner = ov.firstElementChild;
        if (inner) { set(inner, 'height', '100%'); set(inner, 'max-height', '100%'); }
    }

    function start() { setInterval(function () { try { stamp(); } catch (e) { } }, 1000); }
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);

    // 기기에서 실제로 얼마가 잡히는지 보는 자리.
    //   안전 구역이 0 으로 잡히면 아무리 밀어도 안 밀린다. 그때는
    //   viewport-fit=cover 가 안 먹고 있다는 뜻이라 여기서 바로 드러난다.
    window.safeState = function () {
        const i = inset();
        const ov = document.getElementById('dark-run-overlay');
        console.log('%c===== 안전 구역 =====', 'color:#4fc3f7; font-size:13px');
        console.log('  잰 값     : 위 ' + i.t + ' · 아래 ' + i.b + ' · 왼 ' + i.l + ' · 오른 ' + i.r);
        console.log('  꽉 찬 화면: ' + (standalone() ? 'O' : '✗ (주소창이 있는 창으로 보입니다)'));
        console.log('  화면 크기 : innerHeight ' + window.innerHeight + ' / screen ' + (screen && screen.height));
        console.log('  어둠 오버레이에 박힌 값: ' + (ov ? (ov.getAttribute('data-safe') || '아직 없음') : '요소 없음'));
        if (!i.t) console.log('%c  위가 0 입니다 — viewport-fit=cover 가 안 먹고 있을 수 있습니다.', 'color:#ff9800');
        return i;
    };
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
        + (handheld() ? '홈 화면에 올리기' : '앱으로 설치하기') + '</button>'
        + '<div style="font-size:9px; color:#666; margin-top:4px;">'
        + (handheld() ? '주소창 없이 앱처럼 열립니다' : '주소창 없는 제 창으로 열립니다') + '</div>'
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

    const msg = isIOS()
        ? ('홈 화면에 올려 두면 앱처럼 쓸 수 있습니다.\n\n'
            + (isSafari() ? '' : '※ 먼저 사파리로 열어 주세요.\n\n')
            + '아래쪽 공유 단추 → 「홈 화면에 추가」')
        : handheld()
        ? ('홈 화면에 올려 두면 앱처럼 쓸 수 있습니다.\n\n'
            + '브라우저 메뉴(⋮) → 「앱 설치」 또는 「홈 화면에 추가」')
        : ('앱으로 설치해 두면 주소창 없는 제 창으로 열립니다.\n\n'
            + '주소창 오른쪽의 설치 아이콘(⊕), 또는\n'
            + '브라우저 메뉴(⋮) → 「설치」');
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
    console.log('  기기:', isIOS() ? ('아이폰·아이패드' + (isSafari() ? ' · 사파리' : ' · 사파리가 아님'))
        : handheld() ? '안드로이드 등 손안의 것' : '피시');
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
