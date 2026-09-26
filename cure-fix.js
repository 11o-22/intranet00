// ==========================================
// ★ 제거약 — 신규 물약 10종도 풀리게
// index.html 에서 preg-guard.js 앞에 불러온다
// ==========================================
//
// 원래 제거약은 이름 목록으로 대상을 거른다.
//     const POTION_NAMES = ['포도맛 물약', ... '바나나맛 물약'];
// newitems.js 의 10종이 목록에 없어서 안 풀린다.
// 투명 물약으로 고정하면 영영 안 풀리는 문제가 생긴다.
//
// 이름 목록 대신 '물약으로 끝나는 효과'를 전부 대상으로 삼는다.

function isPotionEffect(eff) {
    if (!eff || !eff.name) return false;
    return /물약$/.test(String(eff.name).trim());
}

(function fixCurePotion() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'cure_potion') return _f.apply(this, arguments);
        if (!targetUser) return false;

        const candidates = [];

        (targetUser.timedEffects || []).forEach(function (eff, i) {
            if (isPotionEffect(eff)) candidates.push({ type: 'effect', idx: i, name: eff.name });
        });

        if (targetUser.slaveUntil && (targetUser.slaveFixed || Date.now() < targetUser.slaveUntil)) {
            candidates.push({ type: 'slave', name: '노예 계약' });
        }

        if (candidates.length === 0) {
            if (!isOthers) showCustomAlert('제거할 효과가 없습니다.');
            return false;
        }

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const removedName = pick.name;
        const wasFixed = pick.type === 'effect'
            ? !!targetUser.timedEffects[pick.idx].fixed
            : !!targetUser.slaveFixed;

        if (pick.type === 'effect') {
            targetUser.timedEffects.splice(pick.idx, 1);
        } else {
            targetUser.slaveUntil = 0;
            targetUser.slaveFixed = false;
            targetUser.masterName = null;
        }

        // 특이사항에서도 걷어 낸다
        if (targetUser.badge && targetUser.badge.notes) {
            const key = pick.type === 'slave' ? '노예 계약' : removedName;
            const arr = targetUser.badge.notes.split(' | ')
                .filter(n => n.trim() !== '' && !n.includes(key));
            targetUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
        }

        addHistoryLog(targetUser, `[제거약] ${removedName} 효과가 씻겨 나갔습니다.`
            + (wasFixed ? ' (고정되어 있던 것)' : ''));

        if (!isOthers) {
            showCustomAlert(`[제거약 효과]\n${removedName}의 효과가 사라졌습니다.`
                + (wasFixed ? '\n\n고정되어 있던 것이 풀렸습니다.' : ''));
        }
        return true;
    };
})();

// 확인용 — 지금 제거약으로 풀 수 있는 것
function curableOf(code) {
    const u = code ? db.users[code] : currentUser;
    if (!u) { console.warn('대상이 없습니다.'); return; }

    const rows = (u.timedEffects || []).map(function (e) {
        return {
            효과: e.name,
            내용: e.desc,
            고정: e.fixed ? 'O' : '-',
            제거약: isPotionEffect(e) ? '가능' : '불가'
        };
    });
    if (u.slaveUntil && (u.slaveFixed || Date.now() < u.slaveUntil)) {
        rows.push({ 효과: '노예 계약', 내용: (u.masterName || '') + ' 사원과', 고정: u.slaveFixed ? 'O' : '-', 제거약: '가능' });
    }

    console.log('%c===== ' + u.name + ' =====', 'color:#c9a8ff; font-size:13px');
    if (!rows.length) { console.log('걸린 효과가 없습니다.'); return; }
    console.table(rows);
    const n = rows.filter(r => r.제거약 === '가능').length;
    console.log('제거약으로 풀 수 있는 것: ' + n + '개 (무작위로 하나)');
}

console.log('[물약] 제거약 대상 확장 — curableOf() 로 확인');