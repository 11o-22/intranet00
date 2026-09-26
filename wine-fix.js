// ==========================================
// ★ 고급진 술 — 10시간 뒤 만료되게
// index.html 에서 pollution-fix.js 다음에 불러온다
// ==========================================
//
// 원래 코드는 특이사항에 글자만 붙이고 끝난다.
//     appendBadgeNoteToUser(targetUser, `[취함] 알코올 섭취 (10시간 지속)`);
// 만료를 재는 주체가 없어서 영영 안 사라진다.
// timedEffects 로 바꿔 달면 checkPassivePollution 이 알아서 지운다.

const WINE_HOURS = 10;

(function fixWine() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (itemName !== '고급진 술') return _f.apply(this, arguments);
        if (!targetUser) return false;

        // 예전 방식으로 붙어 있던 글자는 걷어 낸다
        stripWineNote(targetUser);

        addTimedEffect(targetUser, '고급진 술', '취함 (알코올 섭취)', WINE_HOURS);
        addHistoryLog(targetUser, `[음주] 고급진 술을 마셨습니다. (${WINE_HOURS}시간)`);

        if (!isOthers) showCustomAlert('술을 마셨습니다... 세상이 빙글빙글 돕니다.');
        return true;
    };
})();

// --- 특이사항에서 취함 줄만 걷어 낸다 ---
function stripWineNote(user) {
    if (!user || !user.badge || !user.badge.notes) return false;
    const arr = user.badge.notes.split(' | ').filter(function (n) {
        const t = n.trim();
        if (!t) return false;
        return !(t.includes('취함') || t.includes('알코올'));
    });
    const next = arr.length ? arr.join(' | ') : '특이사항 없음';
    if (next === user.badge.notes) return false;
    user.badge.notes = next;
    return true;
}

// --- 이미 박혀 있는 사람 정리 ---
(function cleanStuckWine() {
    setTimeout(function () {
        if (!currentUser) return;
        if (!stripWineNote(currentUser)) return;
        addHistoryLog(currentUser, `[효과 종료] 취기가 가셨습니다.`);
        saveFields({ badge: 1, history: 1 });
        updateUI();
        console.log('[술] 만료 안 되던 취함 표시를 지웠습니다.');
    }, 3000);
})();

// --- 상담사용: 전원 정리 ---
function cleanWineNotes() {
    if (currentUser.code !== 'kario0987') { console.warn('상담사 전용입니다.'); return; }
    const done = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!stripWineNote(u)) return;
        addHistoryLog(u, `[효과 종료] 취기가 가셨습니다.`);
        updateUserFields(c, { badge: u.badge, history: u.history });
        done.push(u.name);
    });
    if (!done.length) { console.log('[술] 정리할 사원이 없습니다.'); return; }
    console.log('[술] ' + done.length + '명 정리 완료 —', done.join(', '));
    updateUI();
}

console.log('[술] 고급진 술 만료 보정 적용 — cleanWineNotes() 로 전원 정리');