// ==========================================
// ★ 어둠 재진입 막기 — 나왔는데 다시 끌려 들어가고 횟수가 깎이는 것
// bundles.json 마지막 그룹, party-helper.js 보다 뒤 · save-merge.js 보다 앞
// ==========================================
//
// ■ 무엇이 일어나고 있나
//
//   파티 감시기가 이렇게 생겼다. (index.html:1893)
//
//       database.ref('darkParties').on('value', (snap) => {
//           darkParties = snap.val() || {};
//           ...
//           if (found && darkParties[found].state === 'RUNNING' && !darkRun
//               && window._darkDone !== found) {
//               launchPartyRun(darkParties[found]);     ← 여기서 횟수가 깎인다
//           }
//
//   launchPartyRun 은 들어갈 때마다 횟수를 한 번 쓴다. (index.html:2397)
//
//       currentUser.darkTries = (currentUser.darkTries || 0) + 1;
//
//   재진입을 막는 것은 window._darkDone 하나뿐인데, 그 값은
//   renderDarkResult — 즉 「정상 정산 화면」에서만 적힌다. (index.html:4517)
//
//   그래서 정산을 거치지 않고 끝난 경우에는 아무 표시도 남지 않는다.
//
//       · 탐사 중에 파티에서 나가기        finishDarkRun
//       · 사망                             finishDarkDeath
//       · 진입 전 철회                     c176Withdraw
//       · 「탐사 기록이 사라졌습니다」      darkResync
//
//   그 길로 나오면 darkRun 이 null 이 되고 _launchingParty 도 풀린다.
//   그런데 darkParties/{방}/members/{나} 를 지우는 것은 서버 왕복이라 느리다.
//   그 사이에 누가 한 걸음 옮기거나 누가 들어오거나 하면 감시기가 또 돈다.
//   그때 나는 아직 members 에 남아 있고, state 는 RUNNING, darkRun 은 null —
//   조건이 전부 맞아 다시 들어간다. 횟수가 또 한 번 깎인다.
//
//   나가면 또 들어가고, 나가면 또 들어가고, 횟수만 줄어든다.
//
// ■ 어떻게 막나
//
//   끝난 방 번호를 적어 둔다. 적혀 있는 방은 두 번 다시 들어가지 않는다.
//   방 번호는 'pt_시각_난수' 로 겹치지 않으므로 (index.html:2271)
//   영구히 적어 두어도 다른 방을 막을 일이 없다.
//
//   막는 것으로 끝내지 않고 members · alive 에서 내 자리를 지운다.
//   그래야 감시기가 애초에 나를 찾지 못한다.
//
//   새로고침해도 남게 열 개까지 사원 기록에 같이 적는다.

(function darkRelaunch() {

const KEEP = 10;              // 기억할 방 개수

function doneList() {
    if (!currentUser) return [];
    if (!Array.isArray(currentUser.dkDone)) currentUser.dkDone = [];
    return currentUser.dkDone;
}

function isDone(pid) {
    return !!pid && doneList().indexOf(pid) >= 0;
}

function addDone(pid) {
    if (!pid || !currentUser) return;
    const l = doneList();
    if (l.indexOf(pid) >= 0) return;
    l.push(pid);
    while (l.length > KEEP) l.shift();
    window._darkDone = pid;                       // 원래 있던 자리도 같이 채운다
    if (typeof saveFields === 'function') {
        try { saveFields({ dkDone: 1 }); } catch (e) { }
    }
}

// 감시기가 나를 못 찾게 자리를 비운다
function dropMe(pid) {
    if (!pid || typeof database === 'undefined' || !database || !currentUser) return;
    const me = currentUser.code;
    try {
        const r = database.ref('darkParties/' + pid + '/members/' + me);
        try { r.onDisconnect().cancel(); } catch (e) { }
        r.remove().catch(function () { });
        const a = database.ref('darkParties/' + pid + '/alive/' + me);
        try { a.onDisconnect().cancel(); } catch (e) { }
        a.remove().catch(function () { });
    } catch (e) { }
}

// ==========================================
// 1. 끝났다는 표시를 모든 출구에 붙인다
// ==========================================
//
// 원본이 darkRun 을 null 로 만들기 전에 방 번호를 집어 둔다.
function mark(where) {
    let pid = null;
    try {
        if (typeof darkRun !== 'undefined' && darkRun) pid = darkRun.partyId || null;
    } catch (e) { }
    if (!pid) return null;
    addDone(pid);
    console.log('[어둠] ' + where + ' — 방 ' + pid + ' 종료로 적어 둠');
    return pid;
}

function before(name, where) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._noRelaunch) { clearInterval(iv); return; }
        const _o = f;
        window[name] = function () {
            const pid = mark(where);
            const r = _o.apply(this, arguments);
            if (pid) setTimeout(function () { dropMe(pid); }, 400);   // 남아 있으면 지운다
            return r;
        };
        window[name]._noRelaunch = true;
        clearInterval(iv);
    }, 400);
}

before('finishDarkRun',   '귀환');
before('finishDarkDeath', '사망');
before('leaveParty',      '파티 나가기');

// ==========================================
// 2. 새로고침한 경우 — 복귀 창이 맡게 둔다
// ==========================================
//
// 탐사 중에 새로고침하면 darkRun 이 비어 있는 상태로 감시기가 먼저 돈다.
// 복귀 창(checkDarkRunResume)은 0.8초 뒤에 뜨므로 감시기가 이긴다.
// 그러면 또 횟수가 깎이고, 방장이면 배역표까지 지워진다. (아래 3번)
//
// 그래서 올라올 때 darkRuns/{나} 를 한 번 읽어 둔다.
// 그 방에 진행 기록이 남아 있으면 감시기에게 맡기지 않는다.
let saved = undefined;          // undefined = 아직 읽는 중
(function readSaved() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database || !currentUser) return;
        clearInterval(iv);
        database.ref('darkRuns/' + currentUser.code).once('value')
            .then(function (s) { saved = s.val() || null; })
            .catch(function () { saved = null; });
    }, 300);
})();

// ==========================================
// 3. 배역표를 지키기
// ==========================================
//
// launchPartyRun 은 방장일 때 배역표를 지운다. (index.html:2392)
//
//     if (database && party.leader === currentUser.code) {
//         database.ref(`darkParties/${party.id}/taleCast`).remove();
//
// 방 번호는 만들 때마다 새로 나오므로, 갓 만든 방에 배역표가 있을 수가 없다.
// 즉 이 줄이 실제로 무언가를 지우는 때는 「이미 돌고 있는 방에 또 들어갈 때」뿐이고,
// 그때는 늘 잘못이다. 지워지면 attachTaleCast 의 감시자가
//
//     if (!cast || !cast[currentUser.code]) assignTaleRoles();   (dark.js:13825)
//
// 를 타고 배역을 다시 뽑는다. 그래서 동화 도중에 배역이 바뀐다.
//
// 지우기 직전의 배역표를 들고 있다가 바로 되돌려 놓는다.
function castOf(party) {
    try {
        const p = (typeof darkParties !== 'undefined' && darkParties[party.id]) || party;
        if (p && p.taleCast && Object.keys(p.taleCast).length) return Object.assign({}, p.taleCast);
    } catch (e) { }
    return null;
}

function putCast(pid, cast) {
    if (!cast || typeof database === 'undefined' || !database) return;
    database.ref('darkParties/' + pid + '/taleCast').update(cast)
        .then(function () { console.log('[어둠] 지워진 배역표를 되돌렸습니다 — ' + pid); })
        .catch(function () { });
}

// ==========================================
// 4. 들어가도 되는지 한 자리에서 판정
// ==========================================
//
// 원본을 부르지 않으면 darkTries 가 올라가지 않는다. 그것이 요점이다.
(function guard() {
    const iv = setInterval(function () {
        if (typeof launchPartyRun !== 'function') return;
        if (launchPartyRun._noRelaunch) { clearInterval(iv); return; }

        const _l = launchPartyRun;
        launchPartyRun = function (party) {
            const pid = party && party.id;

            // (1) 이미 끝낸 방
            if (isDone(pid)) {
                dropMe(pid);
                say(pid, '끝낸 방 재진입을 막았습니다');
                return;
            }

            // (2) 새로고침 — 복귀 창이 맡는다
            if (saved === undefined) { say(pid, '진행 기록을 읽는 중이라 기다립니다'); return; }
            if (saved && saved.partyId && saved.partyId === pid) {
                say(pid, '진행 중이던 방입니다. 복귀 창에 맡깁니다');
                return;
            }

            // 들어간다 — 방장이면 배역표가 지워지므로 들고 있는다
            const keep = castOf(party);
            const r = _l.apply(this, arguments);
            if (keep && party.leader === currentUser.code) putCast(pid, keep);
            return r;
        };
        launchPartyRun._noRelaunch = true;
        clearInterval(iv);
        console.log('[어둠] 재진입 차단 · 배역표 보호 연결');
    }, 400);
})();

function say(pid, msg) {
    if (window._reLogged === pid + msg) return;        // 같은 말을 되풀이하지 않는다
    window._reLogged = pid + msg;
    console.log('[어둠] ' + msg + ' — ' + pid
        + ' (남은 횟수 ' + (typeof getDarkTriesLeft === 'function' ? getDarkTriesLeft() : '?') + '회)');
}

// ==========================================
// 확인 · 되돌리기
// ==========================================
window.darkExitState = function () {
    console.log('%c===== 어둠 재진입 =====', 'color:#ff6b6b; font-size:13px');
    console.log('  차단 연결:', (typeof launchPartyRun === 'function' && launchPartyRun._noRelaunch) ? 'O' : '✗');
    ['finishDarkRun', 'finishDarkDeath', 'leaveParty'].forEach(function (n) {
        console.log('  ' + n + ':', (typeof window[n] === 'function' && window[n]._noRelaunch) ? 'O' : '✗');
    });
    console.log('  끝낸 방:', doneList().join(', ') || '없음');
    console.log('  저장된 진행 기록:', saved === undefined ? '읽는 중'
        : (saved ? (saved.zone + ' / 방 ' + (saved.partyId || '혼자')) : '없음'));
    console.log('  지금 방:', (typeof myPartyId !== 'undefined' && myPartyId) || '없음');
    console.log('  탐사 중:', (typeof darkRun !== 'undefined' && darkRun) ? darkRun.zone : '아니오');
    console.log('  오늘 쓴 횟수:', (currentUser && currentUser.darkTries) || 0,
        '· 남은 횟수:', (typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft() : '?');
    console.log('  횟수를 돌려주려면 — darkTryBack(3)');
};

// 잘못 깎인 횟수를 돌려준다 (내 것)
window.darkTryBack = function (n) {
    if (!currentUser) return;
    const give = Math.max(1, Math.floor(n || 1));
    const was = currentUser.darkTries || 0;
    currentUser.darkTries = Math.max(0, was - give);
    if (typeof saveFields === 'function') {
        try { saveFields({ darkTries: 1 }); } catch (e) { console.error(e); }
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderDarkness === 'function') renderDarkness();
    console.log('%c✓ 쓴 횟수 ' + was + ' → ' + currentUser.darkTries
        + ' (남은 횟수 ' + (typeof getDarkTriesLeft === 'function' ? getDarkTriesLeft() : '?') + '회)',
        'color:#4CAF50');
};

// 전 사원에게 돌려준다 — 상담사용
window.darkTryBackAll = function (n) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    const give = Math.max(1, Math.floor(n || 1));
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {}, rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            const was = u.darkTries || 0;
            if (!was) return;
            const now = Math.max(0, was - give);
            up['users/' + c + '/darkTries'] = now;
            rows.push({ 사원: u.name || c, 전: was, 후: now });
        });
        if (!rows.length) { console.log('돌려줄 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.table(rows);
            console.log('%c✓ ' + rows.length + '명에게 ' + give + '회씩 돌려주었습니다.', 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

console.log('[어둠] darkExitState() · darkTryBack(n) · darkTryBackAll(n)');

})();