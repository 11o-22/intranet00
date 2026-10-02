// ==========================================
// ★ 투명 물약 — 고정할 효과를 고른다
// index.html 에서 cure-fix.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// 무엇이 문제였나
//   투명 물약은 「기간이 있는 효과 하나를 영구히 고정한다」인데,
//   무엇을 고정할지 무작위로 뽑는다(index.html 7015행).
//   효과가 여러 개 걸려 있으면 스마일 스티커를 노려도
//   엉뚱한 것이 고정된다. 스티커는 다섯 시간짜리라 다시 맞추기도 어렵다.
//
//   그리고 고정하면 못 푼다. 제거약은 이름이 '물약'으로 끝나는 것만
//   건드리기 때문에(cure-fix.js), 고정된 스마일 스티커는 영영 남는다.
//
// 어떻게 고치나
//   1. 고정할 효과를 직접 고른다. 하나뿐이면 묻지 않고 그대로 간다.
//   2. 고르지 않고 닫으면 물약을 쓰지 않은 것으로 둔다.
//   3. 고정된 것은 종류를 가리지 않고 제거약으로 풀 수 있게 한다.

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
// 2. 고정할 효과 고르기
// ==========================================
function candidatesOf(u) {
    const out = [];
    (u.timedEffects || []).forEach(function (e, i) {
        if (!e || e.fixed) return;
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
// 고르는 창
// ==========================================
function openPicker(u, list, isOthers) {
    const old = document.getElementById('fixpick-overlay');
    if (old) old.remove();

    const rows = list.map(function (c, i) {
        const e = (c.type === 'effect') ? (u.timedEffects || [])[c.idx] : null;
        const left = e ? leftText(e) : '';
        return '<button class="game-btn" style="width:100%; margin:0 0 7px 0; padding:12px; text-align:left; font-size:12px;"'
            + ' onclick="__fixPick(' + i + ')">'
            + '<div style="font-weight:bold; color:#4fc3f7;">' + c.name + '</div>'
            + (c.desc ? '<div style="font-size:10px; color:#aaa; margin-top:3px; line-height:1.5;">' + c.desc + '</div>' : '')
            + (left ? '<div style="font-size:10px; color:#888; margin-top:3px;">' + left + '</div>' : '')
            + '</button>';
    }).join('');

    const el = document.createElement('div');
    el.id = 'fixpick-overlay';
    el.style.cssText = 'position:fixed; inset:0; z-index:100000; background:rgba(0,0,0,0.82);'
        + ' display:flex; align-items:center; justify-content:center; padding:18px;';
    el.innerHTML =
        '<div style="width:100%; max-width:380px; max-height:80vh; overflow-y:auto;'
        + ' background:#141414; border:1px solid #2f5f7f; border-radius:8px; padding:18px;">'
        + '<div style="font-size:14px; font-weight:bold; color:#4fc3f7; margin-bottom:6px;">투명 물약</div>'
        + '<div style="font-size:11px; color:#999; margin-bottom:14px; line-height:1.7;">'
        + (isOthers ? u.name + ' 사원에게 ' : '') + '고정할 효과를 하나 고르세요.<br>'
        + '<span style="color:#777;">고정하면 제거약으로만 풀 수 있습니다.</span></div>'
        + rows
        + '<button class="game-btn" style="width:100%; margin:10px 0 0 0; padding:11px; font-size:11px; opacity:0.7;"'
        + ' onclick="__fixCancel()">쓰지 않는다</button>'
        + '</div>';
    document.body.appendChild(el);

    window.__fixPick = function (i) {
        const c = list[i];
        const o = document.getElementById('fixpick-overlay');
        if (o) o.remove();
        if (c) commit(u, c, isOthers);
    };
    window.__fixCancel = function () {
        const o = document.getElementById('fixpick-overlay');
        if (o) o.remove();
    };
}

// ==========================================
// 3. 투명 물약을 가로챈다
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
                showCustomAlert('고정할 수 있는 효과가 없습니다.');
                return false;
            }
            if (list.length === 1) {
                return _a.apply(this, arguments);     // 하나뿐이면 묻지 않는다
            }

            openPicker(targetUser, list, !!isOthers);
            return false;                              // 물약은 고른 뒤에 쓴다
        };
        applyItemEffect._pickFix = true;
        clearInterval(iv);
        console.log('[투명] 고정할 효과 고르기 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.fixPotionState = function () {
    console.log('%c===== 투명 물약 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  고르기 연결:', (typeof applyItemEffect === 'function' && applyItemEffect._pickFix) ? 'O' : '✗');
    console.log('  제거약 확장:', (typeof isPotionEffect === 'function' && isPotionEffect._anyFixed) ? 'O' : '✗');
    if (!currentUser) return;
    const eff = currentUser.timedEffects || [];
    if (!eff.length) { console.log('  지금 걸린 효과: 없음'); return; }
    console.table(eff.map(function (e) {
        return {
            이름: e.name, 내용: e.desc,
            상태: e.fixed ? '고정됨' : leftText(e),
            고정가능: e.fixed ? '-' : 'O',
            제거가능: (typeof isPotionEffect === 'function' && isPotionEffect(e)) ? 'O' : '✗'
        };
    }));
};

console.log('[투명] 고정할 효과 고르기 · fixPotionState()');

})();
