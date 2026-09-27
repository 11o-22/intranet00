// ==========================================
// ★ 재봉 도구 — 파손된 자리를 되돌린다
// index.html 에서 gear-break.js 다음에 불러온다
// ==========================================
//
// 파손은 뒤쪽 속성부터 한 단계씩 깎는다.
// 재봉 도구는 그 반대로, 마지막에 깎인 자리를 한 단계 올린다.
//
// 깎이기 전 등급을 gearFull 에 적어 두고,
// 그 위로는 절대 올라가지 않게 한다.

// 깎이기 전 등급을 기억한다
function gearFullOf(user) {
    user = user || currentUser;
    if (!user.gearFull) user.gearFull = {};
    return user.gearFull;
}

(function hookBreakRecord() {
    const iv = setInterval(function () {
        if (typeof breakGear !== 'function') return;
        if (breakGear._fullRecord) { clearInterval(iv); return; }

        const _b = breakGear;
        breakGear = function () {
            const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
            let before = null;
            if (g) {
                before = {
                    grade: g.grade,
                    ag: Object.assign({}, g.attrGrades || {}),
                    attrs: (g.attrs || []).slice()
                };
            }
            const r = _b.apply(this, arguments);
            if (r && before) {
                const F = gearFullOf(currentUser);
                if (F._main == null) F._main = before.grade;
                before.attrs.forEach(function (k, i) {
                    if (i === 0) return;                       // 첫 자리는 본체 등급
                    if (F[k] == null) F[k] = before.ag[k] || before.grade;
                });
                saveFields({ gearFull: 1 });
            }
            return r;
        };
        breakGear._fullRecord = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 되돌리기
// ==========================================
function repairGearOnce() {
    if (typeof getGear !== 'function') return { ok: false, msg: '전용 장비 기능이 없습니다.' };
    const g = getGear(currentUser);
    if (!g) return { ok: false, msg: '전용 장비가 없습니다.' };

    const G = (typeof gearGradeList === 'function') ? gearGradeList()
            : (typeof GEAR_GRADES !== 'undefined' ? GEAR_GRADES : ['D', 'C', 'B', 'A', 'S', 'L']);
    const F = gearFullOf(currentUser);
    const attrs = g.attrs || [];

    const curOf = function (k, i) {
        if (i === 0) return g.grade;
        if (typeof gearAttrGradeOf === 'function') return gearAttrGradeOf(g, k, i);
        return (g.attrGrades && g.attrGrades[k]) || g.grade;
    };

    // 뒤쪽 자리부터 훑어서, 원래보다 낮은 첫 자리를 한 단계 올린다
    for (let i = attrs.length - 1; i >= 0; i--) {
        const key = attrs[i];
        const cur = curOf(key, i);
        const full = (i === 0) ? F._main : F[key];
        if (full == null) continue;
        const pos = G.indexOf(cur), cap = G.indexOf(full);
        if (pos < 0 || cap < 0 || pos >= cap) continue;

        if (i === 0) {
            const before = g.grade;
            g.grade = G[pos + 1];
            return { ok: true, what: g.name, from: before, to: g.grade };
        }
        if (!g.attrGrades) g.attrGrades = {};
        g.attrGrades[key] = G[pos + 1];
        const nm = (typeof gearAttrName === 'function') ? gearAttrName(key) : key;
        return { ok: true, what: nm, from: cur, to: G[pos + 1] };
    }

    // 닫힌 자리가 있으면 알려 준다
    const closed = Object.keys(F).filter(function (k) {
        return k !== '_main' && attrs.indexOf(k) < 0;
    });
    if (closed.length) {
        const names = closed.map(function (k) {
            return (typeof gearAttrName === 'function') ? gearAttrName(k) : k;
        }).join(', ');
        return { ok: false, msg: '되돌릴 손상이 없습니다.\n\n닫힌 자리 — ' + names
            + '\n「두 번째 자리」나 「세 번째 자리」로 다시 엽니다.' };
    }
    return { ok: false, msg: '되돌릴 손상이 없습니다.' };
}

// ==========================================
// 재봉 도구를 가로챈다
// ==========================================
(function hookRepairItem() {
    const NAME = '재봉 도구';
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._repairFix) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('격리 중에는 쓸 수 없습니다.');
                return;
            }
            if ((currentUser.inventory || []).indexOf(NAME) === -1) return;

            const r = repairGearOnce();
            if (!r.ok) { showCustomAlert(r.msg); return; }

            // 더 손상된 곳이 남았는지
            const g = getGear(currentUser);
            const F = gearFullOf(currentUser);
            let left = 0;
            if (F._main != null && g.grade !== F._main) left++;
            (g.attrs || []).forEach(function (k, i) {
                if (i === 0) return;
                const cur = (typeof gearAttrGradeOf === 'function') ? gearAttrGradeOf(g, k, i) : g.grade;
                if (F[k] != null && cur !== F[k]) left++;
            });
            currentUser.gearBroken = left > 0;

            removeItemFromInventory(currentUser, NAME, 1);
            addHistoryLog(currentUser, '[재봉] ' + r.what + ' ' + r.from + ' → ' + r.to);
            saveSelfFull();
            updateUI();

            showCustomAlert('실을 당겨 꿰맸습니다.\n\n' + r.what + ' ' + r.from + ' → ' + r.to
                + (left ? '\n\n아직 ' + left + '군데가 손상되어 있습니다.' : '\n\n더 손볼 곳이 없습니다.'));
        };
        useInventoryItem._repairFix = true;
        clearInterval(iv);
        console.log('[재봉] 속성까지 되돌리도록 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
function gearRepairState() {
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    if (!g) { console.log('전용 장비가 없습니다.'); return; }
    const G = (typeof gearGradeList === 'function') ? gearGradeList() : GEAR_GRADES;
    const F = gearFullOf(currentUser);
    const attrs = g.attrs || [];

    console.log('%c===== ' + g.name + ' =====', 'color:#d4af37; font-size:13px');
    const rows = [{
        자리: '본체', 항목: g.name, 지금: g.grade,
        원래: F._main != null ? F._main : '(손상 없음)',
        손상: F._main != null && F._main !== g.grade ? '✗' : ''
    }];
    attrs.forEach(function (k, i) {
        if (i === 0) return;
        const cur = (typeof gearAttrGradeOf === 'function') ? gearAttrGradeOf(g, k, i) : g.grade;
        rows.push({
            자리: i + 1 + '번',
            항목: (typeof gearAttrName === 'function') ? gearAttrName(k) : k,
            지금: cur,
            원래: F[k] != null ? F[k] : '(손상 없음)',
            손상: F[k] != null && F[k] !== cur ? '✗' : ''
        });
    });
    console.table(rows);
    console.log('  다음에 꿰맬 자리:', attrs.length > 1
        ? attrs.length + '번 (' + ((typeof gearAttrName === 'function') ? gearAttrName(attrs[attrs.length - 1]) : attrs[attrs.length - 1]) + ')'
        : '본체');
    console.log('  가진 재봉 도구:', (currentUser.inventory || []).filter(function (x) { return x === '재봉 도구'; }).length + '개');
}

console.log('[재봉] 연결 완료 — gearRepairState() 로 확인');