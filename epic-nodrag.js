// ==========================================
// ★ EPIC — 남이 들어갈 때 끌려 들어가 죽던 것
// bundles.json — epic-nokill.js 다음 (dark-relaunch.js 보다 뒤)
// ==========================================
//
// 2026-11-06 사용자 「EPIC 어둠, 한 명이 가면 세명이 자동으로 따라가서 죽는 일이 일어나는데 보고 고쳐줘」
//                     → 「한 명이 들어가면」 (세 명이 저절로 끌려 들어가 죽는다)
//
// ■ 무엇이 일어났나
//
//   파티 감시기(index.html · darkParties 'value')는 darkParties 가 **어디서든** 바뀔 때마다 돈다.
//   내 이름이 명단(members)에 남은 RUNNING 방을 찾으면 그대로 launchPartyRun 으로 들어간다.
//
//       if (found && darkParties[found].state === 'RUNNING' && !darkRun && window._darkDone !== found)
//           launchPartyRun(darkParties[found]);
//
//   보통 어둠은 끝나는 길(finishDarkRun · finishDarkDeath)에서 「끝낸 방」으로 적어 두어
//   다시 안 끌려간다 (dark-relaunch.js). 그런데 EPIC 은 제 길(epicDeath → epicSettle → epicFinish)로
//   끝나서 그 표시를 거치지 않는다. 그래서
//     · 쓰러진 뒤 「단말로 복귀한다」를 안 누르고 껐거나
//     · 배역을 고르다 껐거나
//     · 복귀 창에서 실패로 끝난 사람은
//   지난 EPIC 방 명단에 이름이 남는다. 그 뒤 **누가 어둠에 들어가거나 방을 만들어** darkParties 가
//   바뀌는 순간, 남아 있던 사람들이 한꺼번에 그 방으로 끌려 들어갔다. 격리 중이어도, 오염 100 이어도
//   (launchPartyRun 은 그것을 보지 않는다) — 횟수가 깎이고, 그대로 쓰러진다.
//   (시험 화면에서 그대로 재현: 지난 EPIC 방에 이름만 남은 사람이 남이 방을 하나 만들자 끌려 들어감)
//
// ■ 어떻게 막나
//
//   ① EPIC 방에 저절로 들어가는 것은 「방장이 막 출발시킨 때」(출발 3분 안)만.
//      진행 중에 새로고침한 사람은 복귀 창(darkRuns)이 맡으므로(dark-relaunch.js ②) 여기서 건드리지 않는다.
//      격리 중이거나 오염 100 이면 출발 직후라도 안 들어간다.
//      막은 방은 「끝낸 방」으로 적고 명단 · alive 에서 내 자리를 지운다 — 다시 안 찾게.
//   ② EPIC 정산(쓰러짐 · 귀환 모두 epicSettle)을 지나면 그 방을 「끝낸 방」으로 적는다.
//      (쓰러졌다가 토크쇼 · 늑대 가면 등으로 일어서는 경우는 epicSettle 까지 안 가므로 적지 않는다)
//
// ■ 확인
//
//   epicDragState()

(function epicNoDrag() {
'use strict';

const EP = (typeof EPIC_CODE !== 'undefined') ? EPIC_CODE : 'Qtrew-???-■■■';
const FRESH = 3 * 60 * 1000;            // 출발하고 이만큼 안이면 「막 출발한 방」
const KEEP = 10;                        // 끝낸 방을 기억할 개수 (dark-relaunch.js 와 같은 칸 · 같은 수)
const st = { blocked: 0, marked: 0, last: '' };

function me() { try { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; } catch (e) { return null; } }
function fb() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }

// 끝낸 방으로 적는다 — dark-relaunch.js 의 dkDone 과 같은 칸을 쓴다 (그쪽 감시도 이 방을 막는다)
function markDone(pid) {
    const u = me();
    if (!pid || !u) return;
    if (!Array.isArray(u.dkDone)) u.dkDone = [];
    window._darkDone = pid;
    if (u.dkDone.indexOf(pid) >= 0) return;
    u.dkDone.push(pid);
    while (u.dkDone.length > KEEP) u.dkDone.shift();
    st.marked++;
    try { if (typeof saveFields === 'function') saveFields({ dkDone: 1 }); } catch (e) { }
}

// 명단 · alive 에서 내 자리를 지운다
function dropMe(pid) {
    const d = fb(), u = me();
    if (!d || !u || !pid) return;
    ['members', 'alive'].forEach(function (k) {
        try {
            const r = d.ref('darkParties/' + pid + '/' + k + '/' + u.code);
            try { r.onDisconnect().cancel(); } catch (e) { }
            r.remove().catch(function () { });
        } catch (e) { }
    });
}

function why(party) {
    const u = me();
    if (!u) return '';
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) return '격리 중'; } catch (e) { }
    if ((Number(u.pollution) || 0) >= 100) return '오염 100';
    const t0 = Number(party.startedAt) || Number(party.createdAt) || 0;
    if (!t0 || Date.now() - t0 > FRESH) return '출발한 지 ' + Math.round((Date.now() - t0) / 60000) + '분 지난 방';
    return '';
}

// ① 자동 입장 막기
(function guard() {
    const iv = setInterval(function () {
        if (typeof launchPartyRun !== 'function') return;
        if (launchPartyRun._epicNoDrag) { clearInterval(iv); return; }
        const _l = launchPartyRun;
        const w = function (party) {
            if (!party || party.zone !== EP) return _l.apply(this, arguments);
            const no = why(party);
            if (!no) return _l.apply(this, arguments);

            const pid = party.id;
            if (window._epicDragSeen === pid) return;           // 같은 방으로 여러 번 불려도 한 번만 처리
            window._epicDragSeen = pid;
            st.blocked++;
            st.last = pid + ' — ' + no;
            console.log('[epic] 끌려 들어가기 막음 — ' + pid + ' (' + no + ')');

            // 진행 중에 새로고침한 사람이면 복귀 창이 맡는다 — 자리를 지우지 않는다
            const d = fb(), u = me();
            if (!d || !u) return;
            d.ref('darkRuns/' + u.code).once('value').then(function (s) {
                const v = s.val();
                if (v && v.partyId === pid) {                   // 내 진행 기록이 그 방 — 복귀 창 몫이라 자리는 그대로 둔다
                    console.log('[epic] 진행 기록이 그 방이라 복귀 창에 맡깁니다 — ' + pid);
                    return;
                }
                markDone(pid);
                dropMe(pid);
            }).catch(function () { markDone(pid); dropMe(pid); });
        };
        w._epicNoDrag = true;
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        launchPartyRun = w;
        try { window.launchPartyRun = w; } catch (e) { }
        clearInterval(iv);
        console.log('[epic] 지난 방으로 끌려 들어가기 막기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ② 정산을 지나면 끝낸 방
(function hookSettle() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._epicNoDrag) { clearInterval(iv); return; }
        const _s = epicSettle;
        const w = function () {
            let pid = null;
            try { pid = (typeof darkRun !== 'undefined' && darkRun && darkRun.isParty) ? darkRun.partyId : null; } catch (e) { }
            const r = _s.apply(this, arguments);
            if (pid) markDone(pid);
            return r;
        };
        w._epicNoDrag = true;
        Object.keys(_s).forEach(function (k) { try { w[k] = _s[k]; } catch (e) { } });
        epicSettle = w;
        try { window.epicSettle = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

window.epicDragState = function () {
    const u = me();
    console.log('%c===== EPIC 끌려 들어가기 =====', 'color:#d4af37; font-size:13px');
    console.log('  연결 — launchPartyRun:', (typeof launchPartyRun === 'function' && launchPartyRun._epicNoDrag) ? 'O' : '✗',
        '· epicSettle:', (typeof epicSettle === 'function' && epicSettle._epicNoDrag) ? 'O' : '✗');
    console.log('  막은 횟수:', st.blocked, (st.last ? '· 마지막 ' + st.last : ''), '· 끝낸 방으로 적은 수:', st.marked);
    console.log('  끝낸 방:', (u && Array.isArray(u.dkDone)) ? u.dkDone.join(', ') : '없음');
};

})();
