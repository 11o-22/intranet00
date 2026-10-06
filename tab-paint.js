// ==========================================
// ★ 기록 칸에 들어갔을 때 목록이 늦게 뜨던 것
// ==========================================
//
// ── 무슨 일이었나 ──
//
// 소지품·기록·서신은 updateUI() 안에서만 그려진다. (index.html:5909)
//     checkVIPStatus(); renderInventory(); renderHistory(); renderLetters();
//
// 그런데 mobile-scroll.js 가 이 셋을 감싸면서
//     if (tab && !tab.classList.contains('active')) return;
// 를 붙였다. 보이지 않는 칸은 그리지 않는다 — 스크롤 튕김을 막으려고 넣은 것이고
// 그 자체는 맞다.
//
// 문제는 **칸을 바꿀 때 아무도 다시 그려 주지 않는다**는 것이다.
// switchRecordSubTab 은 active 딱지만 옮기고 끝난다. (index.html:5934)
// 그러니 소지품 칸을 열어도 비어 있고, 다음 updateUI() 가 올 때까지 기다려야 했다.
// updateUI 는 내 자리가 서버에서 바뀌거나, 남이 바뀐 것을 3초마다 훑을 때 돈다.
// 조용한 시각에는 한참 뒤에야 돈다. 그래서 「너무 느리다」.
//
// ── 어떻게 고치나 ──
//
// 칸을 연 그 자리에서 그 칸만 바로 그린다.
// (내용이 그대로면 norepaint.js 가 알아서 넘어가므로 덧그리는 값도 없다)
// ==========================================

(function tabPaint() {
    'use strict';

    // 칸마다 그 칸을 채우는 함수
    //
    //   mobile-scroll.js 가 아래 함수들을 「보이지 않는 칸은 그리지 않는다」로
    //   감싸 두었다. 그런데 칸을 바꿀 때 다시 그려 주는 쪽이 없어서,
    //   열어도 비어 있고 다음 updateUI() 가 올 때까지 기다려야 했다.
    //   밀실 거래처럼 소식이 뜸한 칸은 그래서 「아예 안 보인다」가 된다.
    const PAINT = {
        // 기록 탭
        'rec-badge':     ['loadBadgeInfo'],
        'rec-inventory': ['renderInventory'],
        'rec-history':   ['renderHistory'],
        'rec-letters':   ['renderLetters'],
        // 상점 탭 — switchShopPanel 이 ??? 상점·장터만 그려 주고 나머지는 빠져 있었다
        'shop-regular':  ['renderRegularShop'],
        'shop-alien':    ['renderAlienShop'],
        'shop-p2p':      ['renderP2PSelectBoxes', 'renderP2PLists']
    };

    // 큰 탭마다 — 그 안에서 열려 있는 칸을 찾는다
    const TABS = { 'tab-record': 1, 'tab-shop': 1 };

    function paint(id) {
        const names = PAINT[id];
        if (!names) return;
        names.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') return;
            try { f(); } catch (e) {
                console.warn('[칸] ' + n + ' 그리기 실패:', (e && e.message) ? e.message : e);
            }
        });
    }

    // 지금 열려 있는 칸 (탭 하나, 또는 열려 있는 탭 전부)
    function openPanel(tabId) {
        const tab = document.getElementById(tabId);
        if (!tab || !tab.classList.contains('active')) return null;
        const p = tab.querySelector('.sub-panel.active');
        return p ? p.id : null;
    }

    function paintOpen(tabId) {
        if (tabId) {
            if (!TABS[tabId]) return;
            const id = openPanel(tabId);
            if (id) paint(id);
            return;
        }
        Object.keys(TABS).forEach(function (t) {
            const id = openPanel(t);
            if (id) paint(id);
        });
    }

    function wrap(name, after) {
        if (typeof window[name] !== 'function') return false;
        if (window[name]._tabPaint) return true;
        const _f = window[name];
        window[name] = function () {
            const r = _f.apply(this, arguments);
            try { after.apply(null, arguments); } catch (e) { }
            return r;
        };
        window[name]._tabPaint = true;
        return true;
    }

    const iv = setInterval(function () {
        let left = 0;

        // 탭 안에서 칸을 바꿀 때
        if (!wrap('switchRecordSubTab', function (panelId) { paint(panelId); })) left++;
        if (!wrap('switchShopPanel', function (panelId) { paint(panelId); })) left++;

        // 큰 탭으로 들어올 때 — 열려 있는 칸을 그린다
        if (!wrap('switchTab', function (tabId) { paintOpen(tabId); })) left++;
        if (!wrap('switchTabById', function (tabId) { paintOpen(tabId); })) left++;

        if (left === 0) {
            clearInterval(iv);
            paintOpen();          // 지금 열려 있는 칸도 한 번 채워 둔다
            console.log('[칸] 기록·상점 탭 즉시 그리기 연결');
        }
    }, 300);

    // 확인용
    window.tabPaintState = function () {
        console.log('%c===== 칸 즉시 그리기 =====', 'color:#9fd0ff; font-size:13px');
        ['switchRecordSubTab', 'switchShopPanel', 'switchTab', 'switchTabById'].forEach(function (n) {
            console.log('  ' + n + ':',
                (typeof window[n] === 'function' && window[n]._tabPaint) ? 'O' : '✗');
        });
        Object.keys(TABS).forEach(function (t) {
            console.log('  ' + t + ' 에서 열린 칸:', openPanel(t) || '(열려 있지 않음)');
        });
        Object.keys(PAINT).forEach(function (id) {
            console.log('   · ' + id + ' →', PAINT[id].map(function (n) {
                return n + (typeof window[n] === 'function' ? '' : '(없음)');
            }).join(', '));
        });
    };
})();
