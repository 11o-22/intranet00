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

    // --- 진단: 왜 다시 들어가나 (상담사 콘솔 · 서버 기록을 읽는다 · 2026-10-26) ---
    //   quarWhy('사번')  — 오염도 · 격리 칸(값의 종류까지) · 최근 기록 · 탐사 · 뿅망치 줄
    window.quarWhy = function (code) {
        if (typeof database === 'undefined' || !database) { console.warn('서버에 닿지 않습니다'); return; }
        if (!code) { console.warn("quarWhy('사번') 처럼 사번을 넣어 주세요"); return; }
        const ago = function (t) { t = Number(t) || 0; if (!t) return '없음'; const m = Math.round((Date.now() - t) / 60000); return m >= 0 ? m + '분 전' : (-m) + '분 뒤'; };
        const ty = function (v) { return JSON.stringify(v) + ' (' + (v === null ? 'null' : typeof v) + ')'; };
        database.ref('users/' + code).once('value').then(function (sn) {
            const u = sn.val();
            if (!u) { console.warn('그 사번의 기록이 없습니다: ' + code); return; }
            const q = Number(u.quarantineUntil) || 0;
            console.log('%c===== 🦊 ' + (u.name || code) + ' (' + code + ') — 오염 · 격리 =====', 'color:#ffcc80; font-size:13px');
            console.log('  오염도            ' + ty(u.pollution));
            console.log('  격리 끝           ' + (q ? (q > Date.now() ? Math.ceil((q - Date.now()) / 60000) + '분 남음' : '끝남 (' + ago(q) + ')') : '없음') + '  · 값 ' + ty(u.quarantineUntil));
            console.log('  입원(쓰러짐)      ' + ty(u.quarantineHospital) + '  · 행선 ' + ty(u.quarantineDest));
            console.log('  퇴원 시 오염도    ' + ty(u.quarantineExitPollution));
            console.log('  문답 끝냄         ' + ty(u.foxRoomAnswered));
            console.log('  오염 시계         ' + ago(u.lastPollutionTime) + '  · 동결 ' + ago(u.pollFreezeUntil) + '  · 안대 ' + ago(u.blindfoldUntil));
            console.log('  음식 표시         ' + ty(u.quarFood) + '  · 까닭 ' + ty(u.quarCause));
            const eq = (u.equippedWeapons || []).filter(Boolean);
            console.log('  장착              ' + (eq.length ? eq.join(', ') : '없음'));
            const te = (Array.isArray(u.timedEffects) ? u.timedEffects : Object.values(u.timedEffects || {})).filter(Boolean).map(function (e) { return e.name + (e.expireAt ? '(' + ago(e.expireAt) + ')' : ''); });
            if (te.length) console.log('  걸린 효과         ' + te.join(', '));
            if (u.ppyongTookDay) console.log('  뿅망치로 대신 들어간 날 ' + u.ppyongTookDay);
            database.ref('users').once('value').then(function (all) {
                const v = all.val() || {};
                const by = Object.keys(v).filter(function (c) { const qq = v[c] && v[c].ppyongQueue; return Array.isArray(qq) && qq.indexOf(code) >= 0; });
                if (by.length) console.log('  ⚠ 뿅망치 줄에 서 있음 — ' + by.map(function (c) { return (v[c].name || c) + '(' + c + ')'; }).join(', '));
            }).catch(function () { });
            const hs = (Array.isArray(u.history) ? u.history : Object.values(u.history || {})).map(function (h) { return typeof h === 'string' ? h : ((h.time ? h.time + ' ' : '') + (h.text || '')); });
            console.log('  최근 기록\n     ' + (hs.length ? hs.join('\n     ') : '없음'));
            const lg = (Array.isArray(u.darkLogs) ? u.darkLogs : []).slice(0, 3).map(function (l) { return (l.date || '') + ' ' + (l.zone || '') + ' ' + (l.died ? '✖ 쓰러짐' : l.resigned ? '사직' : '✔ 귀환'); });
            if (lg.length) console.log('  최근 탐사\n     ' + lg.join('\n     '));
        }).catch(function (e) { console.error('[오염] 읽기 실패', e); });
    };

    console.log('[오염] 격리 누락 보정 적용 — forceQuarantine() 으로 수동 실행 · quarWhy(\'사번\') 진단');
})();