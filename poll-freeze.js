// ==========================================
// ★ 오염 동결이 안 먹히던 것
// bundles.json 마지막 묶음, newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   「다 헐은 공략집」·「주의 설명서」는 오염도를 두 시간 동결한다.
//   user.pollFreezeUntil 에 시각을 적어 두는 방식이다. (newitems2.js:376)
//
//   그런데 그 시각을 보는 곳이 한 군데뿐이었다.
//
//       newitems2.js:388   addPollution 을 감싸서 막는다
//
//   오염이 오르는 길은 그것만이 아니다.
//
//       addPollution(amount)              부르는 곳 3군데
//       applyPollutionToUser(user, amt)   부르는 곳 118군데   ← 거의 전부
//       checkPassivePollution             세 시간마다 3% 저절로 오르는 자리
//
//   어둠·공용시설·기믹·물약·감금실이 전부 applyPollutionToUser 로 간다.
//   그래서 동결을 걸어도 거의 아무것도 막지 못했다. 「안 먹힌다」가 이것이다.
//
// ■ 어떻게 고치나
//
//   오르는 세 길을 모두 같은 규칙으로 막는다.
//
//     applyPollutionToUser   동결 중이면 오르는 몫을 버린다 (내리는 것은 그대로)
//     addPollution           같다 (newitems2 가 이미 막지만 여기서 한 번 더)
//     checkPassivePollution  동결 중에는 시간이 흐르지 않은 것으로 둔다
//                            (lastPollutionTime 을 지금으로 밀어 둔다)
//
//   안대(blindfoldUntil)와 같은 자리에 끼어들므로, 안대가 막던 것은 모두
//   동결도 막는다. 다만 안대 표시나 「이미 효과가 적용 중」 판정은 건드리지
//   않는다 — 그쪽은 안대만의 일이다.
//
// ■ 동결을 거는 것들
//   다 헐은 공략집 · 주의 설명서 (2시간)   newitems2.js
//   여우 꼬리                              foxtail.js
//   부적이 깃든 것 등 noPoll 버프           itemBuffs
//
// ■ 콘솔
//   pollFreezeState()   지금 동결 중인지 · 연결됐는지
//   pollFreezeTest()    동결 중에 오염이 정말 안 오르는지 바로 확인

(function pollFreeze() {

// ==========================================
// 동결 중인가
// ==========================================
function frozen(u) {
    if (!u) return false;
    if ((u.pollFreezeUntil || 0) > Date.now()) return true;
    if (typeof ibSum === 'function') {
        try { if (ibSum(u).noPoll) return true; } catch (e) { }
    }
    return false;
}
window.isPollFrozen = frozen;

function leftMin(u) {
    const t = (u && u.pollFreezeUntil) || 0;
    return t > Date.now() ? Math.ceil((t - Date.now()) / 60000) : 0;
}

// ==========================================
// 1. applyPollutionToUser — 오염이 오르는 큰길
// ==========================================
(function hookApply() {
    const iv = setInterval(function () {
        if (typeof applyPollutionToUser !== 'function') return;
        if (applyPollutionToUser._freeze) { clearInterval(iv); return; }

        const _a = applyPollutionToUser;
        applyPollutionToUser = function (user, amount) {
            if (frozen(user) && (Number(amount) || 0) > 0) return;      // 오르는 몫만 버린다
            return _a.apply(this, arguments);
        };
        applyPollutionToUser._freeze = true;
        clearInterval(iv);
        console.log('[오염] applyPollutionToUser 동결 연결');
    }, 400);
})();

// ==========================================
// 2. addPollution — 작은길 (newitems2 도 막지만 겹쳐도 해롭지 않다)
// ==========================================
(function hookAdd() {
    const iv = setInterval(function () {
        if (typeof addPollution !== 'function') return;
        if (addPollution._freeze2) { clearInterval(iv); return; }

        const _a = addPollution;
        addPollution = function (amount) {
            if (frozen(currentUser) && (Number(amount) || 0) > 0) return;
            return _a.apply(this, arguments);
        };
        addPollution._freeze2 = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 3. checkPassivePollution — 세 시간마다 3%
// ==========================================
//
// 오르는 자리가 함수 안쪽이라 밖에서 못 막는다. 대신 동결 중에는 시계를
// 지금으로 밀어 둔다. 그러면 diffMs 가 세 시간을 못 넘어 오르지 않는다.
// 「동결 동안은 시간이 흐르지 않는다」와 같은 뜻이다.
// (안대도 원래 흐른 시간을 버리므로 셈하는 방식이 같다)
(function hookPassive() {
    const iv = setInterval(function () {
        if (typeof checkPassivePollution !== 'function') return;
        if (checkPassivePollution._freeze) { clearInterval(iv); return; }

        const _c = checkPassivePollution;
        checkPassivePollution = function (user) {
            if (user && frozen(user)) user.lastPollutionTime = Date.now();
            return _c.apply(this, arguments);
        };
        checkPassivePollution._freeze = true;
        clearInterval(iv);
        console.log('[오염] 저절로 오르는 것도 동결 연결');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.pollFreezeState = function (who) {
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 오염 동결 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  동결 중:', frozen(u) ? 'O' : '✗',
        leftMin(u) ? ('· ' + leftMin(u) + '분 남음') : '');
    console.log('  pollFreezeUntil:', u.pollFreezeUntil
        ? new Date(u.pollFreezeUntil).toLocaleString() : '없음');
    console.log('  noPoll 버프:', (typeof ibSum === 'function' && ibSum(u).noPoll) ? '있음' : '없음');
    console.log('  오염도:', u.pollution);
    console.log('  연결 — applyPollutionToUser:',
        (typeof applyPollutionToUser === 'function' && applyPollutionToUser._freeze) ? 'O' : '✗',
        '· addPollution:', (typeof addPollution === 'function' && addPollution._freeze2) ? 'O' : '✗',
        '· 저절로 오르는 것:', (typeof checkPassivePollution === 'function' && checkPassivePollution._freeze) ? 'O' : '✗');
};

window.pollFreezeTest = function () {
    if (!currentUser) { console.log('로그인 후에 쓰세요.'); return; }
    const was = currentUser.pollution;
    const keep = currentUser.pollFreezeUntil;
    currentUser.pollFreezeUntil = Date.now() + 60000;
    applyPollutionToUser(currentUser, 10);
    const during = currentUser.pollution;
    currentUser.pollFreezeUntil = 0;
    applyPollutionToUser(currentUser, 10);
    const after = currentUser.pollution;
    currentUser.pollution = was;
    currentUser.pollFreezeUntil = keep;
    console.log('%c===== 동결 시험 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  동결 중에 +10 →', during - was, '(0 이어야 합니다)');
    console.log('  풀린 뒤에 +10 →', after - during, '(0 보다 커야 합니다)');
    console.log('  오염도는 원래대로 되돌려 놓았습니다:', currentUser.pollution);
};

console.log('[오염] 동결을 세 길 모두에 — pollFreezeState() · pollFreezeTest()');

})();
