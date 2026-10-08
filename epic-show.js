// ==========================================
// ★ 📺 브라운의 심야 토크 쇼 — epic 어둠에서도 들게
// bundles.json 마지막 묶음, talkshow.js · epic-hard.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 왜 안 들었나
//
//   토크쇼는 보통 어둠의 길목 세 군데에 손을 얹어 둔다.
//
//       launchPartyRun   darkRun._showRevives = 2   부활 두 번
//       rollDarkBonus    +1                         모든 판정
//       darkDeath        부활 처리 · 무대 열기
//       renderDarkResult 무대 열기 배율 · 회수품 2배
//
//   epic 은 이 가운데 **rollDarkBonus 하나만 함께 쓴다.** 나머지는 제 것이
//   따로 있다.
//
//       epicStart    darkRun 을 통째로 새로 짓는다  ← 얹어 둔 표가 지워진다
//       epicDeath    darkDeath 를 거치지 않는다     ← 부활도, 무대 열기도 없다
//       epicSettle   renderDarkResult 를 거치지 않는다 ← 배율이 안 걸린다
//
//   그래서 토크쇼에서 epic 에 들어가면 판정 +1 만 남고, 부활도 보너스도
//   없었다. 사회자가 죽어도 아무 일이 없었다.
//
// ■ 무엇을 잇나
//
//   1. epicStart 가 darkRun 을 새로 지어도 표를 도로 얹는다
//   2. epicDeath 에서 부활한다 — 남은 횟수가 있으면 일어선다
//   3. 죽을 때마다 무대 열기를 쌓는다 (사회자가 죽으면 피날레)
//   4. epicSettle 의 지급에 무대 열기 배율을 얹는다
//
//   셈은 talkshow.js 가 쓰던 것을 그대로 빌려 쓴다 (talkShowOf · talkShowMult).
//   같은 규칙을 두 군데 적어 두면 한쪽만 고쳐지기 마련이다.
//
//   회수품 2배는 epic 에 걸 자리가 없다 — epic 의 수확(er.found)은
//   emLootMult 를 거치지 않고 장면에서 바로 나온다. 그래서 뺐다.
//
//   배율은 epicSettle 이 주는 몫에만 걸린다. 그 뒤에 따로 얹히는 것
//   (꿈결 수집기의 추가 정산 같은 것)은 보통 어둠에서도 배율 밖이라
//   같게 두었다.
//
//   정산 상자의 「지급」 줄에는 기본 몫만 적힌다. 얹힌 몫은 그 뒤에
//   팝업과 기록으로 알린다 — 보통 어둠과 같은 모양이다.
//
// ■ 콘솔
//   epicShowState()   지금 epic 에서 토크쇼가 어떻게 걸려 있나

(function epicShow() {

function showNow() {
    if (typeof talkShowOf !== 'function') return null;
    try { return talkShowOf(); } catch (e) { return null; }
}
function inEpic() {
    return typeof darkRun !== 'undefined' && darkRun && darkRun.epic;
}

// ==========================================
// 1. epicStart 가 darkRun 을 새로 지어도 표를 도로 얹는다
// ==========================================
(function hookStart() {
    const iv = setInterval(function () {
        if (typeof epicStart !== 'function') return;
        if (epicStart._show) { clearInterval(iv); return; }

        const _s = epicStart;
        epicStart = function () {
            // 새로 짓기 전의 표를 적어 둔다
            let keep = null;
            try {
                if (typeof darkRun !== 'undefined' && darkRun && darkRun._show) {
                    keep = { show: true, revives: Number(darkRun._showRevives || 0) };
                }
            } catch (e) { }

            const r = _s.apply(this, arguments);

            try {
                if (typeof darkRun === 'undefined' || !darkRun) return r;
                // 표가 없었더라도, 지금 토크쇼 파티에 있으면 새로 얹는다
                if (!keep && showNow()) {
                    keep = { show: true, revives: (typeof TALK_SHOW_REVIVES !== 'undefined') ? TALK_SHOW_REVIVES : 2 };
                }
                if (!keep) return r;
                darkRun._show = true;
                darkRun._showRevives = keep.revives;
                console.log('[epic·토크쇼] 부활 ' + keep.revives + '회를 이어 붙였습니다.');
            } catch (e) { console.warn('[epic·토크쇼]', e); }
            return r;
        };
        epicStart._show = true;
        clearInterval(iv);
        console.log('[epic·토크쇼] 출발 연결');
    }, 500);
})();

// ==========================================
// 2·3. epicDeath — 부활하고, 무대 열기를 쌓는다
// ==========================================
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._show) { clearInterval(iv); return; }

        const _d = epicDeath;
        epicDeath = function (txt) {
            const p = showNow();
            if (!p || !inEpic() || typeof er === 'undefined' || !er || er.dead) {
                return _d.apply(this, arguments);
            }

            // 무대 열기는 죽을 때마다 쌓인다 (부활해도 쌓인다 — 보통 어둠과 같다)
            try {
                const host = (typeof talkShowIsHost === 'function') && talkShowIsHost(p);
                if (typeof talkShowBumpHeat === 'function') talkShowBumpHeat(p, host);
            } catch (e) { }

            // 표가 없으면 그 자리에서 채운다 (보통 어둠과 같은 까닭 — talkshow.js 참고)
            if (darkRun._showRevives == null) {
                darkRun._show = true;
                darkRun._showRevives = (typeof TALK_SHOW_REVIVES !== 'undefined') ? TALK_SHOW_REVIVES : 2;
                console.warn('[epic·토크쇼] 부활 표가 없어 다시 채웠습니다 — ' + darkRun._showRevives + '회');
            }

            const left = Number(darkRun._showRevives || 0);
            if (left <= 0) return _d.apply(this, arguments);
            darkRun._showRevives = left - 1;

            // 일어선다 — 구조를 기다리던 중이었으면 그것도 거둔다
            er._calledHelp = false;
            er.danger = null;
            er.dead = false;
            darkRun.fail = Math.max(0, (darkRun.fail || 0) - 1);
            try { if (typeof talkShowSnap === 'function') talkShowSnap(); } catch (e) { }
            try {
                if (typeof database !== 'undefined' && database && darkRun.partyId && currentUser) {
                    database.ref('darkParties/' + darkRun.partyId + '/epicHelp/' + currentUser.code).remove();
                }
            } catch (e) { }

            try {
                darkBodyEl().innerHTML = darkBox('📺',
                    (txt || '') + '<br><br>'
                    + '<span style="color:#c79a5b; font-size:15px; font-weight:bold;">'
                    + '— 쇼는 아직 끝나지 않았습니다!</span><br>'
                    + '<span style="color:#a08a68;">손가락 튕기는 소리가 어딘가에서 들린다.<br>'
                    + '조명이 다시 들어온다. 남은 부활 ' + (left - 1) + '회.</span>',
                    (typeof epicBar === 'function' ? epicBar() : '')
                    + darkChoiceBtn('일어선다.', 'epicMap()'));
                if (darkRun.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
            } catch (e) { console.warn('[epic·토크쇼] 부활 화면 건너뜀:', e && e.message); }

            try {
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[토크쇼] 쇼는 아직 끝나지 않았습니다. (남은 부활 '
                        + (left - 1) + '회)');
                }
            } catch (e) { }
            return;
        };
        epicDeath._show = true;
        clearInterval(iv);
        console.log('[epic·토크쇼] 부활 연결');
    }, 500);
})();

// ==========================================
// 4. epicSettle — 지급에 무대 열기 배율
// ==========================================
(function hookSettle() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._show) { clearInterval(iv); return; }

        const _s = epicSettle;
        epicSettle = function () {
            const p = showNow();
            const before = (p && currentUser) ? (Number(currentUser.points) || 0) : 0;
            const r = _s.apply(this, arguments);
            if (!p || !currentUser) return r;

            try {
                const m = (typeof talkShowMult === 'function') ? talkShowMult(p) : 1;
                const got = (Number(currentUser.points) || 0) - before;
                if (!(m > 1 && got > 0)) return r;

                const extra = Math.round(got * (m - 1));
                currentUser.points += extra;
                const heat = Number(p.heat || 0);
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[토크쇼] 무대 열기 ' + heat + '단'
                        + (p.hostDead ? ' · 사회자 피날레' : '')
                        + ' — 보너스 ×' + m.toFixed(1) + ' (+' + extra.toLocaleString() + ' P)');
                }
                if (typeof saveSelfFull === 'function') saveSelfFull();
                setTimeout(function () {
                    showCustomAlert('📺 무대 열기 ' + heat + '단'
                        + (p.hostDead ? '\n사회자가 피날레를 장식했습니다.' : '')
                        + '\n\n보너스 ×' + m.toFixed(1) + '\n+' + extra.toLocaleString() + ' P');
                }, 900);
            } catch (e) { console.warn('[epic·토크쇼] 보너스 건너뜀:', e && e.message); }
            return r;
        };
        epicSettle._show = true;
        clearInterval(iv);
        console.log('[epic·토크쇼] 보너스 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.epicShowState = function () {
    console.log('%c===== epic · 📺 토크쇼 =====', 'color:#c79a5b; font-size:13px');
    const p = showNow();
    console.log('  지금 epic 안인가:', inEpic() ? 'O' : '✗');
    console.log('  토크쇼 파티인가:', p ? ('O — 사회자 ' + (p.talkShow && p.talkShow.name)) : '✗');
    if (typeof darkRun !== 'undefined' && darkRun) {
        console.log('  남은 부활:', Number(darkRun._showRevives || 0) + '회',
            '· 표:', darkRun._show ? 'O' : '✗');
    }
    if (p) {
        console.log('  무대 열기:', Number(p.heat || 0) + '단', p.hostDead ? '· 사회자 피날레' : '',
            '→ 보너스 ×' + ((typeof talkShowMult === 'function') ? talkShowMult(p).toFixed(1) : '?'));
    }
    console.log('  연결 — epicStart:', (typeof epicStart === 'function' && epicStart._show) ? 'O' : '✗',
        '· epicDeath:', (typeof epicDeath === 'function' && epicDeath._show) ? 'O' : '✗',
        '· epicSettle:', (typeof epicSettle === 'function' && epicSettle._show) ? 'O' : '✗');
};

console.log('[epic·토크쇼] 부활 · 무대 열기 — epicShowState()');

})();
