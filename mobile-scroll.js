// ==========================================
// ★ 모바일 스크롤 튕김 보정
// index.html 에서 frames-pop.js 다음에 불러온다
// ==========================================
//
// updateUI 가 자주 돌면서 목록을 통째로 다시 그린다.
// innerHTML 이 갈릴 때마다 스크롤 위치가 맨 위로 돌아가,
// 아래로 내리는 도중에 계속 튕긴다.
//
// 1) 내용이 같으면 아예 다시 그리지 않는다
// 2) 달라졌으면 스크롤 위치를 되돌려 놓는다
// 3) 보이지 않는 탭은 그리지 않는다

(function fixMobileScroll() {

    // ==========================================
    // 스크롤 지킴이
    // ==========================================
    function keepScroll(fnName, sel, tabSel) {
        if (typeof window[fnName] !== 'function') return false;
        if (window[fnName]._scrollKept) return true;

        const _f = window[fnName];
        window[fnName] = function () {
            // 안 보이는 탭이면 그리지 않는다
            if (tabSel) {
                const tab = document.querySelector(tabSel);
                if (tab && !tab.classList.contains('active')) return;
            }

            const el = document.querySelector(sel);
            const before = el ? el.innerHTML : null;
            const elTop = el ? el.scrollTop : 0;
            // 맨 밑에 있었는지 기억한다
            const atEnd = el ? (el.scrollHeight - el.scrollTop - el.clientHeight < 6) : false;
            const winTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            const docH = document.documentElement.scrollHeight;

            const r = _f.apply(this, arguments);

            const el2 = document.querySelector(sel);
            if (!el2) return r;

            // 내용이 그대로면 손대지 않는다
            if (before !== null && el2.innerHTML === before) return r;

            // 되돌려 놓는다 — 높이가 잡힌 뒤에 한 번 더
            const putBox = function () {
                if (atEnd) { el2.scrollTop = el2.scrollHeight; return; }
                if (!elTop) return;
                const max = Math.max(0, el2.scrollHeight - el2.clientHeight);
                el2.scrollTop = Math.min(elTop, max);
            };
            putBox();
            requestAnimationFrame(putBox);
            setTimeout(putBox, 60);

            if (winTop) {
                const put = function () {
                    const now = window.pageYOffset || document.documentElement.scrollTop || 0;
                    if (Math.abs(now - winTop) < 2) return;
                    // 문서가 짧아졌으면 그만큼만
                    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                    window.scrollTo(0, Math.min(winTop, max));
                };
                put();
                requestAnimationFrame(put);
                setTimeout(put, 60);
            }
            return r;
        };
        window[fnName]._scrollKept = true;
        return true;
    }

    const TARGETS = [
        ['renderInventory',      '#inventory-list-container',   '#rec-inventory'],
        ['renderEmployeeCards',  '#employee-cards-container',   null],
        ['renderHistory',        '#history-list-container',     '#rec-history'],
        ['renderLetters',        '#received-letters-container', '#rec-letters'],
        ['renderP2PLists',       '#p2p-received-list',          '#shop-p2p'],
        ['renderRegularShop',    '#regular-shop-items-container','#shop-regular'],
        ['renderAlienShop',      '#alien-items-container',      '#shop-alien'],
        ['renderQShop',          '#qshop-body',                 '#shop-unknown'],
        ['renderHouseStorage',   '#house-storage-body',         '#house-storage'],
        ['renderDarkLogs',       '#darkness-log-container',     '#dark-log'],
        ['loadBadgeInfo',        '#badge-note-display',         null],
        ['renderBadge',          '#badge-note-display',         null]
    ];

    (function hookAll() {
        let tries = 0;
        const iv = setInterval(function () {
            let left = 0;
            TARGETS.forEach(function (t) {
                if (!keepScroll(t[0], t[1], t[2])) left++;
            });
            if (left === 0 || ++tries > 40) {
                clearInterval(iv);
                const done = TARGETS.filter(t => typeof window[t[0]] === 'function' && window[t[0]]._scrollKept);
                console.log('[스크롤] ' + done.length + ' / ' + TARGETS.length + '곳 보정');
            }
        }, 500);
    })();

    // ==========================================
    // 스크롤 상자 자체를 손본다
    // ==========================================
    const css = `
/* 목록 상자 — 관성 스크롤과 경계 처리 */
#inventory-list-container,
#employee-cards-container,
#history-list-container,
#received-letters-container,
#my-suggestion-list,
#p2p-received-list,
#p2p-sent-list,
#darkness-log-container,
#mk-list,
#house-storage-body {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scroll-behavior: auto;
}

/* 사원 열람 — 화면 높이에 맞춰 늘린다 */
#employee-cards-container {
    max-height: min(62vh, 520px) !important;
}

/* 소지품 — 잘리지 않게 아래 여백 */
#rec-inventory { padding-bottom: 24px; }
#tab-record .sub-panel { padding-bottom: 16px; }

/* 아래쪽 순위 막대에 가리지 않게 */
.container { padding-bottom: 72px; }

/* 손가락이 가로로 미끄러져도 세로 스크롤이 끊기지 않게 */
body { overscroll-behavior-y: none; }
`;
    const st = document.createElement('style');
    st.id = 'mobile-scroll-fix';
    st.textContent = css;
    document.head.appendChild(st);

    // ==========================================
    // 스크롤 중에는 다시 그리지 않는다
    // ==========================================
    let scrolling = false, tmr = null;
    window.addEventListener('scroll', function () {
        scrolling = true;
        clearTimeout(tmr);
        tmr = setTimeout(function () { scrolling = false; }, 400);
    }, { passive: true });

    // ==========================================
    // 어느 탭이든 스크롤 자리를 지킨다
    // ==========================================
    function snapAll() {
        const list = [];
        document.querySelectorAll('div, section, ul, ol').forEach(function (el) {
            if (el.scrollTop <= 0) return;
            if (el.scrollHeight - el.clientHeight < 8) return;
            list.push({
                el: el,
                top: el.scrollTop,
                end: (el.scrollHeight - el.scrollTop - el.clientHeight) < 6
            });
        });
        return { win: window.pageYOffset || document.documentElement.scrollTop || 0, list: list };
    }

    function restoreAll(s) {
        if (!s) return;
        const put = function () {
            s.list.forEach(function (x) {
                if (!x.el.isConnected) return;
                const max = Math.max(0, x.el.scrollHeight - x.el.clientHeight);
                x.el.scrollTop = x.end ? x.el.scrollHeight : Math.min(x.top, max);
            });
            if (s.win) {
                const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const now = window.pageYOffset || document.documentElement.scrollTop || 0;
                if (Math.abs(now - s.win) > 2) window.scrollTo(0, Math.min(s.win, max));
            }
        };
        put();
        requestAnimationFrame(put);
        setTimeout(put, 60);
    }

    (function hookUpdateUI() {
        const iv = setInterval(function () {
            if (typeof updateUI !== 'function') return;
            if (updateUI._scrollHeld) { clearInterval(iv); return; }
            const _u = updateUI;
            let pending = false;
            updateUI = function () {
                // 손가락으로 넘기는 중이면 미뤄 둔다
                if (scrolling) {
                    if (pending) return;
                    pending = true;
                    setTimeout(function () { pending = false; updateUI(); }, 500);
                    return;
                }
                const snap = snapAll();
                const r = _u.apply(this, arguments);
                restoreAll(snap);
                return r;
            };
            updateUI._scrollHeld = true;
            clearInterval(iv);
        }, 500);
    })();

    // ==========================================
    // 너무 자주 다시 그리는 곳을 묶는다 — 깜빡임 방지
    // ==========================================
    function throttleRender(fnName, ms) {
        if (typeof window[fnName] !== 'function') return false;
        if (window[fnName]._throttled) return true;
        const _f = window[fnName];
        let lastRun = 0, timer = null;
        window[fnName] = function () {
            const now = Date.now();
            const self = this, args = arguments;
            if (now - lastRun >= ms) {
                lastRun = now;
                return _f.apply(self, args);
            }
            // 너무 이르면 한 번만 뒤로 미룬다
            if (timer) return;
            timer = setTimeout(function () {
                timer = null; lastRun = Date.now();
                _f.apply(self, args);
            }, ms - (now - lastRun));
        };
        window[fnName]._throttled = true;
        return true;
    }

    (function hookThrottle() {
        const SLOW = [['renderAlienShop', 2500], ['renderQShop', 2500], ['renderRegularShop', 1500]];
        let tries = 0;
        const iv = setInterval(function () {
            let left = 0;
            SLOW.forEach(function (t) { if (!throttleRender(t[0], t[1])) left++; });
            if (left === 0 || ++tries > 40) {
                clearInterval(iv);
                console.log('[스크롤] 다시 그리기 묶음 적용');
            }
        }, 500);
    })();

    // 확인용
    window.scrollFixState = function () {
        console.log('%c===== 스크롤 보정 =====', 'color:#c9a8ff; font-size:13px');
        console.table(TARGETS.map(function (t) {
            return {
                함수: t[0],
                있나: typeof window[t[0]] === 'function' ? 'O' : '-',
                보정: (typeof window[t[0]] === 'function' && window[t[0]]._scrollKept) ? 'O' : '-',
                상자: document.querySelector(t[1]) ? 'O' : '-'
            };
        }));
        console.log('updateUI 미루기:', (typeof updateUI === 'function' && updateUI._scrollHeld) ? 'O' : '-');
        console.log('body overflow:', document.body.style.overflow || '(기본)');
    };

    console.log('[스크롤] 모바일 보정 적용 — scrollFixState() 로 확인');
})();