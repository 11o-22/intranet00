// ==========================================
// ★ 재봉 도구 — 파손된 자리를 되돌린다  (교체판)
// index.html 에서 gear-break.js 다음에 불러온다
// 예전 gear-repair.js 는 이 내용으로 통째로 갈아 끼운다
// ==========================================
//
// 파손은 뒤쪽 속성부터 한 단계씩 깎고, 끝까지 가면 자리를 닫는다.
// 재봉 도구는 그 반대로 되돌린다.
//
// 깎이기 전 등급을 gearFull 에 적어 두지만,
// 이 파일을 붙이기 전에 깎인 것에는 기록이 없다.
// 기록이 없는 자리는 본체 등급을 상한으로 삼는다.

function gearFullOf(user) {
    user = user || currentUser;
    if (!user.gearFull) user.gearFull = {};
    return user.gearFull;
}

function gearGradesArr() {
    if (typeof gearGradeList === 'function') return gearGradeList();
    if (typeof GEAR_GRADES !== 'undefined') return GEAR_GRADES;
    return ['D', 'C', 'B', 'A', 'S', 'L'];
}

// 깎이기 전 등급을 기억한다
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

            // 실제로 뭔가 바뀌었는지 직접 확인한다 — 반환값을 믿지 않는다
            let changed = false;
            if (g && before) {
                if (g.grade !== before.grade) changed = true;
                if ((g.attrs || []).length !== before.attrs.length) changed = true;
                before.attrs.forEach(function (k) {
                    if ((g.attrGrades || {})[k] !== before.ag[k]) changed = true;
                });
            }

            if (changed) {
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
        console.log('[재봉] 파손 기록 연결');
    }, 500);
})();

// ==========================================
// 되돌리기
// ==========================================
function repairGearOnce() {
    if (typeof getGear !== 'function') return { ok: false, msg: '전용 장비 기능이 없습니다.' };
    const g = getGear(currentUser);
    if (!g) return { ok: false, msg: '전용 장비가 없습니다.' };

    const G = gearGradesArr();
    const F = gearFullOf(currentUser);
    const attrs = g.attrs || [];

    const curOf = function (k, i) {
        if (i === 0) return g.grade;
        if (typeof gearAttrGradeOf === 'function') return gearAttrGradeOf(g, k, i);
        return (g.attrGrades && g.attrGrades[k]) || g.grade;
    };
    const nameOf = function (k) {
        return (typeof gearAttrName === 'function') ? gearAttrName(k) : k;
    };

    // 1) 뒤쪽 자리부터 훑어서, 상한보다 낮은 첫 자리를 한 단계 올린다
    for (let i = attrs.length - 1; i >= 1; i--) {
        const key = attrs[i];
        const cur = curOf(key, i);
        // 기록이 없으면 본체 등급까지 올린다
        const cap = (F[key] != null) ? F[key] : g.grade;
        const pos = G.indexOf(cur), top = G.indexOf(cap);
        if (pos < 0 || top < 0 || pos >= top) continue;

        if (!g.attrGrades) g.attrGrades = {};
        g.attrGrades[key] = G[pos + 1];
        return { ok: true, what: nameOf(key), from: cur, to: G[pos + 1] };
    }

    // 2) 닫힌 자리를 다시 연다 — 기록에는 있는데 자리에서 빠진 것
    const closed = Object.keys(F).filter(function (k) {
        return k !== '_main' && attrs.indexOf(k) < 0;
    });
    if (closed.length) {
        const key = closed[closed.length - 1];
        if (!g.attrs) g.attrs = [];
        if (!g.attrGrades) g.attrGrades = {};
        g.attrs.push(key);
        g.attrGrades[key] = G[0];                      // 가장 낮은 등급으로 다시 열린다
        return { ok: true, what: nameOf(key), from: '닫힘', to: G[0], reopen: true };
    }

    // 3) 본체 — 기록이 있을 때만
    if (F._main != null) {
        const pos = G.indexOf(g.grade), top = G.indexOf(F._main);
        if (pos >= 0 && top >= 0 && pos < top) {
            const before = g.grade;
            g.grade = G[pos + 1];
            return { ok: true, what: g.name, from: before, to: g.grade };
        }
    }

    return { ok: false, msg: '되돌릴 손상이 없습니다.' };
}

// 남은 손상 개수
function gearLeftBroken() {
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    if (!g) return 0;
    const F = gearFullOf(currentUser);
    const attrs = g.attrs || [];
    let left = 0;

    if (F._main != null && g.grade !== F._main) left++;
    attrs.forEach(function (k, i) {
        if (i === 0) return;
        const cur = (typeof gearAttrGradeOf === 'function') ? gearAttrGradeOf(g, k, i)
                  : ((g.attrGrades || {})[k] || g.grade);
        const cap = (F[k] != null) ? F[k] : g.grade;
        if (cur !== cap) left++;
    });
    Object.keys(F).forEach(function (k) {
        if (k !== '_main' && attrs.indexOf(k) < 0) left++;
    });
    return left;
}

// ==========================================
// 재봉 도구를 가로챈다
// ==========================================
(function hookRepairItem() {
    const NAME = '재봉 도구';
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._repairFix2) { clearInterval(iv); return; }

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

            const left = gearLeftBroken();
            currentUser.gearBroken = left > 0;

            removeItemFromInventory(currentUser, NAME, 1);
            addHistoryLog(currentUser, '[재봉] ' + r.what + ' ' + r.from + ' → ' + r.to);
            saveSelfFull();
            updateUI();

            showCustomAlert('실을 당겨 꿰맸습니다.\n\n'
                + (r.reopen ? r.what + ' 자리가 다시 열렸습니다. (' + r.to + ')'
                            : r.what + ' ' + r.from + ' → ' + r.to)
                + (left ? '\n\n아직 ' + left + '군데가 손상되어 있습니다.' : '\n\n더 손볼 곳이 없습니다.'));
        };
        useInventoryItem._repairFix2 = true;
        clearInterval(iv);
        console.log('[재봉] 속성·닫힌 자리까지 되돌리도록 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
function gearRepairState() {
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    if (!g) { console.log('전용 장비가 없습니다.'); return; }
    const G = gearGradesArr();
    const F = gearFullOf(currentUser);
    const attrs = g.attrs || [];
    const nameOf = function (k) { return (typeof gearAttrName === 'function') ? gearAttrName(k) : k; };

    console.log('%c===== ' + g.name + ' =====', 'color:#d4af37; font-size:13px');
    const rows = [{
        자리: '본체', 항목: g.name, 지금: g.grade,
        상한: F._main != null ? F._main : '(기록 없음)',
        손상: (F._main != null && F._main !== g.grade) ? '✗' : ''
    }];
    attrs.forEach(function (k, i) {
        if (i === 0) return;
        const cur = (typeof gearAttrGradeOf === 'function') ? gearAttrGradeOf(g, k, i)
                  : ((g.attrGrades || {})[k] || g.grade);
        const cap = (F[k] != null) ? F[k] : g.grade;
        rows.push({
            자리: (i + 1) + '번', 항목: nameOf(k), 지금: cur,
            상한: cap + (F[k] != null ? '' : ' (본체 기준)'),
            손상: cur !== cap ? '✗' : ''
        });
    });
    Object.keys(F).forEach(function (k) {
        if (k === '_main' || attrs.indexOf(k) >= 0) return;
        rows.push({ 자리: '닫힘', 항목: nameOf(k), 지금: '없음', 상한: F[k], 손상: '✗' });
    });
    console.table(rows);
    console.log('  남은 손상:', gearLeftBroken() + '군데');
    console.log('  가진 재봉 도구:', (currentUser.inventory || []).filter(function (x) { return x === '재봉 도구'; }).length + '개');
    console.log('  연결:', (typeof useInventoryItem === 'function' && useInventoryItem._repairFix2) ? 'O' : '-');
}

console.log('[재봉] 교체판 연결 — gearRepairState() 로 확인');