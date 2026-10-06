// ==========================================
// ★ 투명 물약 — 걸린 효과 하나를 무작위로 영구 고정한다
// index.html 에서 cure-fix.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// 고르는 창을 두었다가 다시 무작위로 돌렸다. 다만 두 가지는 후보에서 뺀다.
//
//   · 감자맛 물약  — 공용시설 행운 +100
//   · 아이의 운    — 돌봄(출산품)으로 받는 공용시설 행운 두세 배
//
//   둘 다 공용시설 행운을 올리는 것이라, 영구히 굳으면 공용시설 승률이
//   영영 올라간 채로 남는다. 그래서 투명 물약으로는 못 굳히게 한다.
//
// 그리고 고정된 것은 종류를 가리지 않고 제거약으로 풀 수 있게 둔다.
// (제거약은 원래 이름이 '물약'으로 끝나는 것만 건드린다 — cure-fix.js)

(function stickerFix() {

// ==========================================
// 1. 고정된 효과는 제거약으로 풀 수 있게
// ==========================================
(function openCure() {
    const iv = setInterval(function () {
        if (typeof isPotionEffect !== 'function') return;
        if (isPotionEffect._anyFixed) { clearInterval(iv); return; }

        const _p = isPotionEffect;
        isPotionEffect = function (eff) {
            if (eff && eff.fixed) return true;      // 고정된 것은 전부 풀 수 있다
            return _p.apply(this, arguments);
        };
        isPotionEffect._anyFixed = true;
        clearInterval(iv);
        console.log('[투명] 고정된 효과도 제거약 대상에 넣었습니다.');
    }, 500);
})();

// ==========================================
// 2. 고정할 효과 뽑기
// ==========================================
// 영구히 굳으면 안 되는 것들 — 여기에 이름을 더하면 후보에서 빠진다
const NO_FIX = ['감자맛 물약', '아이의 운'];

function canFix(e) {
    return !!e && !e.fixed && NO_FIX.indexOf(String(e.name || '').trim()) < 0;
}

function candidatesOf(u) {
    const out = [];
    (u.timedEffects || []).forEach(function (e, i) {
        if (!canFix(e)) return;
        out.push({ type: 'effect', idx: i, name: e.name, desc: e.desc || '' });
    });
    if (u.slaveUntil && Date.now() < u.slaveUntil && !u.slaveFixed) {
        out.push({ type: 'slave', name: '노예 계약', desc: '' });
    }
    return out;
}

function leftText(e) {
    if (!e || !e.expireAt) return '';
    const m = Math.round((e.expireAt - Date.now()) / 60000);
    if (m <= 0) return '곧 끝남';
    if (m < 60) return m + '분 남음';
    return Math.floor(m / 60) + '시간 ' + (m % 60) + '분 남음';
}

// 뺀 것 때문에 후보가 없어진 것인지 — 알림 글을 가르려고 본다
function hasOnlyBlocked(u) {
    return (u.timedEffects || []).some(function (e) {
        return e && !e.fixed && NO_FIX.indexOf(String(e.name || '').trim()) >= 0;
    });
}

// 실제로 고정한다
function applyFix(u, pick) {
    if (pick.type === 'effect') {
        const e = u.timedEffects[pick.idx];
        if (!e) return false;
        e.fixed = true;
        e.expireAt = Number.MAX_SAFE_INTEGER;
    } else {
        u.slaveFixed = true;
        u.slaveUntil = Number.MAX_SAFE_INTEGER;
        if (u.badge && u.badge.notes) {
            u.badge.notes = u.badge.notes.replace(/노예 계약 \(3일\)/g, '노예 계약 (영구)');
        }
    }
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[투명 물약] ' + pick.name + ' 효과가 영구히 고정되었습니다.');
    }
    return true;
}

// 고른 뒤 저장까지
function commit(u, pick, isOthers) {
    if (!applyFix(u, pick)) { showCustomAlert('효과를 찾지 못했습니다.'); return; }

    // 물약은 여기서 직접 쓴다 (원래 호출부는 false 를 받고 그냥 지나갔다)
    if (typeof removeItemFromInventory === 'function') {
        removeItemFromInventory(currentUser, '투명 물약', 1);
    }

    if (currentUser && u.code === currentUser.code) {
        if (typeof saveFields === 'function') {
            saveFields({ timedEffects: 1, slaveFixed: 1, slaveUntil: 1, badge: 1, history: 1, inventory: 1 });
        }
    } else {
        u.hasItemUsedOnMe = true;
        if (typeof updateUserFields === 'function') {
            updateUserFields(u.code, {
                timedEffects: u.timedEffects, slaveFixed: u.slaveFixed, slaveUntil: u.slaveUntil,
                badge: u.badge, history: u.history, hasItemUsedOnMe: true
            });
        }
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(currentUser, '[아이템 사용] ' + u.name + ' 사원에게 투명 물약 사용');
        }
        if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 });
    }

    if (typeof updateUI === 'function') updateUI();
    showCustomAlert((isOthers ? u.name + ' 사원의 ' : '') + pick.name
        + ' 효과가 고정되었습니다.\n제거약으로만 풀 수 있습니다.');
}

// ==========================================
// 3. 투명 물약을 가로챈다 — 뺄 것을 빼고 무작위로 뽑는다
// ==========================================
(function hookClear() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._pickFix) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'clear_potion' || !targetUser) {
                return _a.apply(this, arguments);
            }

            const list = candidatesOf(targetUser);
            if (list.length === 0) {
                showCustomAlert(hasOnlyBlocked(targetUser)
                    ? '고정할 수 있는 효과가 없습니다.\n\n'
                      + NO_FIX.join(' · ') + '은(는) 영구히 고정할 수 없습니다.'
                    : '고정할 수 있는 효과가 없습니다.');
                return false;
            }

            const pick = list[Math.floor(Math.random() * list.length)];
            commit(targetUser, pick, !!isOthers);
            return false;                              // 물약은 commit 안에서 직접 쓴다
        };
        applyItemEffect._pickFix = true;
        clearInterval(iv);
        console.log('[투명] 무작위 고정 연결 (뺀 것: ' + NO_FIX.join(', ') + ')');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.fixPotionState = function () {
    console.log('%c===== 투명 물약 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  무작위 고정 연결:', (typeof applyItemEffect === 'function' && applyItemEffect._pickFix) ? 'O' : '✗');
    console.log('  후보에서 빼는 것:', NO_FIX.join(' · '));
    console.log('  제거약 확장:', (typeof isPotionEffect === 'function' && isPotionEffect._anyFixed) ? 'O' : '✗');
    if (!currentUser) return;
    const eff = currentUser.timedEffects || [];
    if (!eff.length) { console.log('  지금 걸린 효과: 없음'); return; }
    console.table(eff.map(function (e) {
        return {
            이름: e.name, 내용: e.desc,
            상태: e.fixed ? '고정됨' : leftText(e),
            고정가능: e.fixed ? '-' : (canFix(e) ? 'O' : '✗ (뺀 것)'),
            제거가능: (typeof isPotionEffect === 'function' && isPotionEffect(e)) ? 'O' : '✗'
        };
    }));
};

console.log('[투명] 고정할 효과 고르기 · fixPotionState()');

})();
