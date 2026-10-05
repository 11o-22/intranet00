// ==========================================
// ★ 헬퍼는 죽어도 잃지 않는다 — 상담실도 가지 않는다
// bundles.json 마지막 그룹, party-helper.js 보다 뒤
// ==========================================
//
// ■ 지금 어떻게 되어 있나
//
//   party-helper.js 는 정산 화면(renderDarkResult)만 감싸 두었다.
//   거기서 포인트와 소지품을 되돌려 놓는다.
//
//   그런데 죽는 길은 정산을 거치지 않는다. darkDeath 가 따로 처리한다.
//   (index.html:4004) 그 안에서 이렇게 한다.
//
//       currentUser.points = 0;                       (4124)
//       반입품을 소지품에서 지운다                     (4126)
//       currentUser.pollution = 100;                  (4146)
//       currentUser.quarantineUntil = +4시간           (4147)
//       currentUser.quarantineHospital = true;        (4150)
//
//   그리고 finishDarkDeath 끝에서 이 줄이 돈다. (index.html:4337)
//
//       setTimeout(() => { if (currentUser.pollution >= 100) startFoxRoomSequence(); }, 600);
//
//   오염도가 100 이니 그대로 여우 상담실로 끌려간다.
//
// ■ 어떻게 고치나
//
//   헬퍼로 들어간 탐사에서는 darkDeath 전에 상태를 베껴 두고, 끝난 뒤 되돌린다.
//   오염도가 원래대로 돌아가므로 600ms 뒤의 저 검사도 통과하지 않는다.
//   하루 한 번짜리 보호(보안팀 의상 세트 · 사자탈 · 다이아 플러그)도 쓰지 않은 것으로 둔다.
//
//   죽은 화면과 탐사 기록은 그대로 남긴다. 죽은 것은 죽은 것이다.
//   다만 아무것도 잃지 않았다는 줄을 한 줄 붙인다.

(function helperDeath() {

// 되돌릴 칸
const FIELDS = [
    'points', 'pollution', 'lastPollutionTime',
    'quarantineUntil', 'quarantineExitPollution', 'quarantineHospital',
    'quarantineDest', 'foxRoomAnswered',
    'diaSaveUsed', 'securitySaveDate'
];

// 헬퍼로 들어온 탐사인가
function isHelperRun() {
    try {
        if (typeof darkRun === 'undefined' || !darkRun) return false;
        if (darkRun.helper) return true;
        if (!darkRun.partyId || typeof darkParties === 'undefined') return false;
        const p = darkParties[darkRun.partyId];
        const m = p && p.members && p.members[currentUser.code];
        return !!(m && m.helper);
    } catch (e) { return false; }
}

function take() {
    const s = { inv: null, eq: null };
    FIELDS.forEach(function (k) { s[k] = currentUser[k]; });
    if (Array.isArray(currentUser.inventory)) s.inv = currentUser.inventory.slice();
    if (Array.isArray(currentUser.equippedWeapons)) s.eq = currentUser.equippedWeapons.slice();
    return s;
}

function give(s) {
    FIELDS.forEach(function (k) {
        if (s[k] === undefined) delete currentUser[k];
        else currentUser[k] = s[k];
    });
    if (s.inv) {
        currentUser.inventory.length = 0;
        s.inv.forEach(function (n) { currentUser.inventory.push(n); });
    }
    if (s.eq) {
        currentUser.equippedWeapons.length = 0;
        s.eq.forEach(function (n) { currentUser.equippedWeapons.push(n); });
    }

    // 값이 없는 칸은 빼고 저장한다 — 하나라도 섞이면 전부 안 써진다
    const f = { inventory: 1, equippedWeapons: 1 };
    FIELDS.forEach(function (k) { if (currentUser[k] !== undefined) f[k] = 1; });
    if (typeof saveFields === 'function') {
        try { saveFields(f); } catch (e) { console.error('[헬퍼] 되돌리기 저장 실패:', e); }
    }
    if (typeof updateUI === 'function') updateUI();
}

// 죽은 화면에 한 줄 붙인다
function note() {
    setTimeout(function () {
        try {
            const b = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
            if (!b || b.querySelector('#helper-death-note')) return;
            b.insertAdjacentHTML('afterbegin',
                '<div id="helper-death-note" style="margin-bottom:12px; padding:10px 12px;'
                + ' border:1px solid #2f5f7f; border-radius:6px; background:rgba(0,0,0,0.3);'
                + ' font-size:11px; color:#4fc3f7; line-height:1.7;">'
                + '헬퍼로 들어왔습니다.<br>'
                + '아래 보고서의 손실은 적용되지 않았습니다. 상담실로도 가지 않습니다.</div>');
        } catch (e) { }
    }, 250);
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._helperSafe) { clearInterval(iv); return; }

        const _d = darkDeath;
        darkDeath = function () {
            if (!currentUser || !isHelperRun()) return _d.apply(this, arguments);

            window._helperDied = Date.now();   // 아래 상담실 막이가 쓴다
            const s = take();
            let r;
            try { r = _d.apply(this, arguments); }
            finally {
                give(s);                       // 원본이 중간에 멈춰도 되돌린다
                note();
                console.log('[헬퍼] 사망 — 잃은 것 없음, 상담실 이송 취소 (오염도 '
                    + (currentUser.pollution || 0) + '%)');
            }
            return r;
        };
        darkDeath._helperSafe = true;
        clearInterval(iv);
        console.log('[헬퍼] 사망 보호 연결');
    }, 400);
})();

// 혹시 다른 길로 오염도가 100 이 된 채 끌려가려 하면 한 번 더 막는다
(function guardFox() {
    const iv = setInterval(function () {
        if (typeof startFoxRoomSequence !== 'function') return;
        if (startFoxRoomSequence._helperSafe) { clearInterval(iv); return; }
        const _f = startFoxRoomSequence;
        startFoxRoomSequence = function () {
            if (window._helperDied && Date.now() - window._helperDied < 10000) {
                console.log('[헬퍼] 상담실 이송을 막았습니다.');
                return;
            }
            return _f.apply(this, arguments);
        };
        startFoxRoomSequence._helperSafe = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.helperDeathState = function () {
    console.log('%c===== 헬퍼 사망 보호 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  darkDeath 연결:', (typeof darkDeath === 'function' && darkDeath._helperSafe) ? 'O' : '✗');
    console.log('  상담실 막이:', (typeof startFoxRoomSequence === 'function' && startFoxRoomSequence._helperSafe) ? 'O' : '✗');
    console.log('  지금 헬퍼 탐사:', isHelperRun() ? '예' : '아니오');
    if (currentUser) {
        console.log('  오염도:', currentUser.pollution || 0,
            '· 격리:', currentUser.quarantineUntil > Date.now()
                ? new Date(currentUser.quarantineUntil).toLocaleString() : '없음');
    }
};

console.log('[헬퍼] helperDeathState()');

})();