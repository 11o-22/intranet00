// ==========================================
// ★ 출산품 — 끝나야 할 때 끝나게
// bundles.json 마지막 묶음, buff24.js · dna.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 네 가지가 안 끝나고 있었다
//
//   ① 「아이의 운」이 1~4시간이 아니라 24시간씩 걸렸다
//
//     출산품 설명은 이렇다.
//
//         반들거리는 첫 동전   2시간 동안 공용시설 행운이 두 배
//         뒤집힌 카드          3시간
//         세 번 굴린 주사위    1시간 (세 배)
//         돌려 감은 태엽       2시간
//         맞지 않는 퍼즐 조각  4시간
//
//     그런데 buff24.js 가 「판정에 걸리는 버프는 전부 24시간」으로 통일하면서
//     이 이름도 그 목록에 넣어 두었다. (buff24.js:78)
//
//         addTimedEffect(…, '아이의 운', …, 2)   →  hours = 24 로 덮임
//
//     게다가 addTimedEffect 는 같은 이름이 이미 걸려 있으면 **남은 시간 위에
//     더한다.** (index.html:5189) 그래서 두 개째를 쓰면 23시간 + 24시간 =
//     47시간이 된다. 쓸 때마다 하루씩 다시 시작하는 셈이었다.
//
//     → buff24.js 의 목록에서 「아이의 운」을 뺐다. 이제 적힌 시간 그대로 간다.
//       (그 한 줄은 buff24.js 에서 고쳤다. 이 파일은 그 뒤를 지킨다)
//
//   ② 오염 동결이 안대 위에 얹혀 안대까지 늘렸다
//
//         dna.js:335
//         blindfoldUntil = Math.max(blindfoldUntil || 0, 지금) + 시간
//                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//     **남은 시간 위에 더한다.** 그래서
//
//       · 두 겹 이불(5h) + 태엽 오르골(2h) = 7시간
//       · 상담사가 씌운 안대가 10시간 남았는데 출산품을 쓰면 **안대가 12시간**
//
//     벌로 씌운 안대가 출산품 때문에 늘어나고, 끝날 때가 돼도 안 끝난다.
//     blindfoldUntil 은 안대와 같은 칸이라 둘이 서로를 민다.
//
//     → 더하지 않고 **긴 쪽으로** 맞춘다. 2시간짜리를 써도 이미 10시간이
//       남아 있으면 그대로 10시간이다. 짧은 것으로 긴 것을 줄이지도 않는다.
//
//   ③ 시간이 다 된 「아이의 운」이 치워지기 전까지 계속 먹혔다
//
//         dna.js:375   timedEffects.some(e => e.name === '아이의 운')
//
//     이름만 본다. 끝 시각을 안 본다. 치우는 자리(checkPassivePollution)는
//     1분에 한 번 도므로, **끝난 뒤에도 최대 1분 동안 행운이 두 배**였다.
//     luck-all.js:80 의 「세 배」 몫도 같은 자리라 같이 남는다.
//     공용시설을 연달아 돌리면 그 1분이 그대로 승률이 된다.
//
//     → 배수를 세는 자리를 또 감싸지 않는다. 그 자리는 네 파일이 차례로
//       얹고 있어서, 감싸는 차례가 뒤집히면 되돌리는 몫이 어긋난다.
//       대신 **끝난 칸을 5초마다 치운다.** 칸이 없으면 아무도 안 센다.
//
//   ④ 횟수형 넷이 새로고침하면 되살아났다
//
//     「다음 탐사 판정 +N」·「치명 방어 N회」·「재굴림 N회」·「지목 회피 N회」는
//     nFlags 에 숫자로 들어간다. 그런데
//
//         nUse()            숫자를 줄이기만 하고 **저장을 안 한다**
//         moveUserQFlags    nPending 을 nFlags 로 옮기고 **저장을 안 한다**
//                           (안쪽 saveDB 는 qPending 이 있을 때만 돈다)
//
//     그래서 재굴림을 쓰고 저장이 한 번도 안 일어난 채 새로고침하면,
//     서버에는 아직 1회가 남아 있어 **다시 생긴다.**
//
//     그리고 옮기는 자리가 합치지 않고 **덮어쓴다.**
//
//         nFlags = Object.assign({}, nPending)
//
//     그래서 반대로, 지난 탐사에서 안 쓰고 남긴 횟수는 다음 탐사가 시작될 때
//     소리 없이 날아갔다.
//
//     → 쓰면 바로 적고, 옮길 때는 합치고, 옮긴 뒤에도 적는다.
//
// ■ 콘솔
//   birthEndState()   지금 걸린 출산품 효과와 남은 시간

(function birthEnd() {

const LUCK = '아이의 운';

function evOf(u) {
    return (u && Array.isArray(u.timedEffects)) ? u.timedEffects.filter(Boolean) : [];
}
function liveLuck(u) {
    const now = Date.now();
    return evOf(u).find(function (e) {
        if (e.name !== LUCK) return false;
        return !!e.fixed || (e.expireAt && e.expireAt > now);
    }) || null;
}
// ==========================================
// ② 오염 동결 — 더하지 않고 긴 쪽으로
// ==========================================
//
// 거는 자리가 dna.js 안쪽이라 밖에서 못 막는다. 대신 쓰고 난 뒤에 고쳐 놓는다.
// 안쪽이 아무것도 안 했으면(확인 창을 안 거친 경우 등) 건드리지 않는다.
(function hookBlind() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._birthEnd) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        const wrapped = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            const hours = (cat && cat.birth && cat.effect === 'b_blind') ? (Number(cat.value) || 0) : 0;
            if (!hours || !currentUser) return _u.apply(this, arguments);

            const before = Number(currentUser.blindfoldUntil) || 0;
            const r = _u.apply(this, arguments);
            try {
                const after = Number(currentUser.blindfoldUntil) || 0;
                if (after === before) return r;            // 안쪽이 안 걸었다
                const want = Math.max(before, Date.now() + hours * 3600000);
                if (after !== want) {
                    currentUser.blindfoldUntil = want;
                    if (typeof saveFields === 'function') saveFields({ blindfoldUntil: 1 });
                    const left = Math.round((want - Date.now()) / 60000);
                    console.log('[출산품] 오염 동결을 긴 쪽으로 맞췄습니다 — ' + left + '분 남음');
                }
            } catch (e) { console.warn('[출산품] 동결 손질 건너뜀:', e && e.message); }
            return r;
        };
        wrapped._birthEnd = true;
        useInventoryItem = wrapped;
        clearInterval(iv);
        console.log('[출산품] 오염 동결 — 쌓이지 않게 연결');
    }, 400);
})();

// ==========================================
// ③ 끝난 「아이의 운」 칸을 바로 치운다
// ==========================================
//
// 배수를 세는 자리(facilityLuckMult)는 dna.js · luck-all.js · foxtail.js ·
// spaceitems.js 가 차례로 감싸고 있다. 거기에 하나 더 얹어 몫을 되돌리려 하면
// 감싸는 차례에 따라 ÷2 가 될 수도, ÷3 이 될 수도 있다.
// 그래서 셈을 건드리지 않고 **끝난 칸만 치운다.** 칸이 없으면 아무도 안 센다.
//
// 다른 효과는 건드리지 않는다 — 이 이름 하나만 본다.
window.birthLuckSweep = function () {
    try {
        if (typeof currentUser === 'undefined' || !currentUser) return 0;
        if (!Array.isArray(currentUser.timedEffects)) return 0;
        const now = Date.now();
        const before = currentUser.timedEffects.length;
        currentUser.timedEffects = currentUser.timedEffects.filter(function (e) {
            if (!e || e.name !== LUCK) return true;
            if (e.fixed) return true;
            return !e.expireAt || e.expireAt > now;
        });
        const n = before - currentUser.timedEffects.length;
        if (!n) return 0;
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(currentUser, '[상태 해제] ' + LUCK + ' 효과가 종료되었습니다.');
        }
        if (typeof saveFields === 'function') saveFields({ timedEffects: 1 });
        if (typeof updateUI === 'function') updateUI();
        console.log('[출산품] 끝난 「' + LUCK + '」 ' + n + '칸을 치웠습니다.');
        return n;
    } catch (e) { console.warn('[출산품] 치우기 건너뜀:', e && e.message); return 0; }
};
setInterval(function () { window.birthLuckSweep(); }, 5000);

// ==========================================
// ④ 횟수형 — 쓰면 적고, 옮길 때 합치고, 옮긴 뒤에도 적는다
// ==========================================
function keepFlags() {
    try {
        if (!currentUser) return;
        if (!currentUser.nFlags) currentUser.nFlags = {};
        if (!currentUser.nPending) currentUser.nPending = {};
        if (typeof saveFields === 'function') saveFields({ nFlags: 1, nPending: 1 });
    } catch (e) { console.warn('[출산품] 횟수 적기 건너뜀:', e && e.message); }
}

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof nUse !== 'function') return;
        if (nUse._birthEnd) { clearInterval(iv); return; }
        const _n = nUse;
        const wrapped = function (key) {
            const r = _n.apply(this, arguments);
            if (r) keepFlags();                    // 정말 한 번 썼을 때만 적는다
            return r;
        };
        wrapped._birthEnd = true;
        nUse = wrapped;
        clearInterval(iv);
        console.log('[출산품] 횟수를 쓰면 바로 적도록 연결');
    }, 400);
})();

(function hookMove() {
    const iv = setInterval(function () {
        if (typeof moveUserQFlags !== 'function') return;
        if (moveUserQFlags._birthEnd) { clearInterval(iv); return; }

        const _m = moveUserQFlags;
        const wrapped = function () {
            // 안쪽(newitems.js)이 nFlags 를 nPending 으로 덮어쓴다.
            // 남은 횟수를 미리 챙겨 두었다가 도로 합친다.
            const left = (currentUser && currentUser.nFlags)
                ? JSON.parse(JSON.stringify(currentUser.nFlags)) : {};
            const r = _m.apply(this, arguments);
            try {
                if (!currentUser) return r;
                const now = currentUser.nFlags || {};
                Object.keys(left).forEach(function (k) {
                    if (!(Number(left[k]) > 0)) return;
                    if (now[k] === undefined) now[k] = left[k];
                    else if (Number(now[k]) < Number(left[k])) now[k] = left[k];
                });
                currentUser.nFlags = now;
                keepFlags();                       // 옮긴 결과를 서버에도 적는다
            } catch (e) { console.warn('[출산품] 횟수 옮기기 건너뜀:', e && e.message); }
            return r;
        };
        wrapped._birthEnd = true;
        moveUserQFlags = wrapped;
        clearInterval(iv);
        console.log('[출산품] 남은 횟수를 지키고 저장하도록 연결');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.birthEndState = function () {
    console.log('%c===== 출산품 · 끝나는 자리 =====', 'color:#ffb3c6; font-size:13px');
    if (!currentUser) { console.log('  로그인 후에 쓰세요.'); return; }
    const now = Date.now();

    const all = evOf(currentUser).filter(function (e) { return e.name === LUCK; });
    if (!all.length) console.log('  아이의 운: 없음');
    else all.forEach(function (e) {
        const left = e.fixed ? '고정' : (e.expireAt ? Math.round((e.expireAt - now) / 60000) + '분 남음' : '끝 시각 없음');
        console.log('  아이의 운:', e.desc, '·', left,
            (e.expireAt && e.expireAt <= now && !e.fixed) ? '← 이미 끝남 (안 셉니다)' : '');
    });

    const b = Number(currentUser.blindfoldUntil) || 0;
    console.log('  오염 동결·안대:', b > now ? (Math.round((b - now) / 60000) + '분 남음') : '없음');

    const f = currentUser.nFlags || {}, p = currentUser.nPending || {};
    const NAME = { c_batt: '판정 +1', c_pain: '치명 방어', c_reroll: '재굴림', no_mark: '지목 회피' };
    const rows = Object.keys(NAME).filter(function (k) { return f[k] || p[k]; })
        .map(function (k) { return { 효과: NAME[k], 지금쓸수있음: f[k] || 0, 다음탐사에들어감: p[k] || 0 }; });
    if (rows.length) console.table(rows); else console.log('  횟수형: 없음');

    console.log('  연결 — 동결:', (typeof useInventoryItem === 'function' && useInventoryItem._birthEnd) ? 'O' : '✗',
        '· 아이의 운 치우기: O',
        '· 횟수 쓰기:', (typeof nUse === 'function' && nUse._birthEnd) ? 'O' : '✗',
        '· 횟수 옮기기:', (typeof moveUserQFlags === 'function' && moveUserQFlags._birthEnd) ? 'O' : '✗');
    console.log('  (연결이 ✗ 로 보여도 다른 파일이 바깥에서 한 번 더 감쌌을 수 있습니다)');
};

console.log('[출산품] 끝나야 할 때 끝나게 — birthEndState()');

})();
