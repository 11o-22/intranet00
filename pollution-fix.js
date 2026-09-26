// ==========================================
// ★ 오염 100% — 새로고침 후 격리 누락 보정
// index.html 에서 pregnancy2.js 다음에 불러온다
// ==========================================
//
// attemptLogin() 이 로그인 시점에
//     hasShownFoxAlert = currentUser.pollution >= 100;
// 으로 잠금 플래그를 미리 켜 버려서,
// updateUI() 의 checkFoxRoomEntry() 가 영영 안 불린다.
// 그래서 100%인데도 메인 화면에 남아 소지품을 쓸 수 있다.

(function fixPollutionQuarantine() {

    // 지금 이송되어야 하는 상태인가
    function needsRoom() {
        if (!currentUser) return false;
        if ((currentUser.pollution || 0) < 100) return false;
        if (currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) return false;
        if (typeof darkRun !== 'undefined' && darkRun) return false;   // 탐사 중이면 사망 처리가 먼저
        return true;
    }

    // 이미 절차가 떠 있는가
    function alreadyOpen() {
        const ids = ['quarantine-pick-overlay', 'fox-loading-overlay',
                     'fox-room-overlay', 'fox-nameplate-overlay',
                     'fox-modal', 'bath-modal'];
        return ids.some(function (id) {
            const el = document.getElementById(id);
            return el && el.style.display && el.style.display !== 'none';
        });
    }

    function force(reason) {
        if (!needsRoom()) return;
        if (alreadyOpen()) return;
        if (typeof checkFoxRoomEntry !== 'function') return;

        // 남아 있던 잠금 플래그를 푼다
        hasShownFoxAlert = false;
        currentUser.foxRoomAnswered = false;
        currentUser.quarantineHospital = false;   // 탐사 사망 잔재가 남아 있으면 절차가 막힌다

        console.log('[오염] 100% 상태인데 격리가 안 걸려 있습니다. 이송 절차를 시작합니다. (' + reason + ')');
        checkFoxRoomEntry();
    }

    // --- 로그인 직후 ---
    if (typeof attemptLogin === 'function') {
        const _login = attemptLogin;
        attemptLogin = function () {
            const r = _login.apply(this, arguments);
            setTimeout(function () { force('로그인'); }, 1500);
            return r;
        };
    }

    // --- 주기 점검 ---
    // 격리가 만료됐는데 오염도가 그대로 100인 경우도 여기서 잡는다
    setInterval(function () { force('주기 점검'); }, 20000);

    // --- 붙자마자 한 번 ---
    setTimeout(function () { force('적재'); }, 2500);

    // --- 잠금이 풀린 상태로 시설을 쓰는 것을 막는다 ---
    ['useInventoryItem', 'sellInventoryItem', 'useFacility',
     'buyRegularShopItem', 'buyAlienItem', 'sendP2PDeal', 'openDarkBriefing']
        .forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            const _f = window[n];
            window[n] = function () {
                if (needsRoom()) {
                    showCustomAlert('오염도가 한계치입니다.\n안정 조치가 필요합니다.');
                    force('차단');
                    return;
                }
                return _f.apply(this, arguments);
            };
        });

    // --- 수동 실행용 ---
    window.forceQuarantine = function () {
        if (!currentUser) { console.warn('로그인 안 됨'); return; }
        console.log('오염도:', currentUser.pollution,
                    '/ quarantineUntil:', currentUser.quarantineUntil,
                    '/ foxRoomAnswered:', currentUser.foxRoomAnswered,
                    '/ hasShownFoxAlert:', typeof hasShownFoxAlert !== 'undefined' ? hasShownFoxAlert : '?');
        hasShownFoxAlert = false;
        currentUser.foxRoomAnswered = false;
        currentUser.quarantineHospital = false;
        if (typeof checkFoxRoomEntry === 'function') checkFoxRoomEntry();
    };

    console.log('[오염] 격리 누락 보정 적용 — forceQuarantine() 으로 수동 실행');
})();