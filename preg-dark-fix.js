// ==========================================
// ★ 유산 처리 · 어둠 사망 정리
// index.html 에서 pregnancy2.js 다음에 불러온다
// ==========================================

// ==========================================
// 1. 임신 중에 몸이 바뀌면 아이가 사라진다
//    (여성이 우유맛·포도맛을 마신 경우 등)
// ==========================================
function checkMiscarriage() {
    if (!currentUser) return;
    if (typeof isPregnant !== 'function' || !isPregnant(currentUser)) return;
    if (typeof canBear !== 'function' || canBear(currentUser)) return;   // 아직 받을 수 있는 몸

    if (currentUser._losing) return;
    currentUser._losing = true;

    const p = pregOf(currentUser);
    const sires = (p && p.sires) || [];
    const n = sires.length;

    currentUser.preg = null;

    // 특이사항 정리
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ')
            .filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }

    addHistoryLog(currentUser, `[유산] 몸이 바뀌어 아이가 남지 않았습니다. (${n}명분)`);
    saveSelfFull();
    updateUI();

    // 아버지들에게도 알린다
    sires.forEach(function (s) {
        const f = db.users[s.code];
        if (!f) return;
        addHistoryLog(f, `[유산] ${currentUser.name} 사원의 몸이 바뀌어 아이가 사라졌습니다.`);
        updateUserFields(s.code, { history: f.history });
    });

    if (typeof pregBroadcast === 'function') {
        pregBroadcast(`<b style="color:#888;">${currentUser.name}</b> 사원의 아이가 사라졌습니다.`);
    }

    showCustomAlert('몸이 바뀌었습니다.\n\n가지고 있던 것이 남지 않았습니다.'
        + (n ? `\n\n(아버지 ${n}명분 전부)` : ''));

    setTimeout(function () { if (currentUser) currentUser._losing = false; }, 5000);
}

// 물약을 쓰는 순간 바로 확인
(function hookPotionUse() {
    ['useInventoryItem', 'confirmItemTarget', 'applyItemEffect'].forEach(function (nm) {
        if (typeof window[nm] !== 'function') return;
        const _f = window[nm];
        window[nm] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(checkMiscarriage, 400);
            return r;
        };
    });
})();

// 주기 확인 — 남이 먹였거나 상담사가 걸었을 때
setInterval(checkMiscarriage, 15000);
setTimeout(checkMiscarriage, 4000);

// ==========================================
// 2. 어둠에서 죽으면 그 자리에서 기록을 지운다
//    안 지우면 새로고침 때 복귀 창이 떠서 다시 들어간다
// ==========================================
(function fixDeathState() {
    function wipe(why) {
        try {
            if (typeof clearDarkRunState === 'function') clearDarkRunState();
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId && database) {
                database.ref(`darkParties/${darkRun.partyId}/alive/${currentUser.code}`).remove();
            }
            console.log('[어둠] 탐사 기록을 지웠습니다. (' + why + ')');
        } catch (e) { console.warn('[어둠] 기록 정리 실패:', e); }
    }

    let tries = 0;
    const iv = setInterval(function () {
        let done = 0;

        if (typeof darkDeath === 'function' && !darkDeath._wiped) {
            const _d = darkDeath;
            darkDeath = function () {
                const r = _d.apply(this, arguments);
                // 장비로 살아난 경우에는 _dead 가 다시 false 가 된다
                if (typeof darkRun !== 'undefined' && darkRun && darkRun._dead) wipe('사망');
                return r;
            };
            darkDeath._wiped = true;
        }
        if (typeof darkDeath === 'function' && darkDeath._wiped) done++;

        if (typeof useResignLetter === 'function' && !useResignLetter._wiped) {
            const _u = useResignLetter;
            useResignLetter = function () {
                const r = _u.apply(this, arguments);
                wipe('사직');
                return r;
            };
            useResignLetter._wiped = true;
        }
        if (typeof useResignLetter === 'function' && useResignLetter._wiped) done++;

        if (done >= 2 || ++tries > 60) clearInterval(iv);
    }, 500);
})();

// 복귀 창이 떴는데 이미 죽어 있던 경우를 막는다
(function guardResume() {
    if (typeof showDarkResumePrompt !== 'function') return;
    const _s = showDarkResumePrompt;
    showDarkResumePrompt = function (st, away) {
        // 상담실에 있거나 오염도가 100이면 죽어서 나온 것이다
        const dead = currentUser &&
            ((currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) ||
             (currentUser.pollution || 0) >= 100);
        if (dead) {
            if (typeof clearDarkRunState === 'function') clearDarkRunState();
            console.log('[어둠] 사망 상태여서 복귀 창을 띄우지 않았습니다.');
            return;
        }
        return _s.apply(this, arguments);
    };
})();

console.log('[임신] 유산 처리 적용 · [어둠] 사망 기록 정리 적용');