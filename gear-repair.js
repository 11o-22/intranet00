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
//
// ★ 2026-10-29 — 「닫힌 자리 다시 열기」는 **파손으로 닫힌 자리(gearFull._closed)만**.
//   전에는 gearFull 에 적혀 있는데 지금 자리에 없는 열쇠는 전부 「닫힌 자리」로 보고 다시 열었다.
//   그런데 속성 변경(지우기)으로 뺀 옛 속성도 gearFull 에 그대로 남아 있어서, 재봉 도구를 쓰면
//   옛 속성(감각 따위)이 네 번째 자리로 되살아났다. 이제 파손으로 닫힌 것만 표시해 두고 그것만 열며,
//   속성 변경으로 지우면 기록에서도 지운다. 자리 수(slots)도 넘지 않는다. 넘쳐 있는 장비는 뒤에서부터 거둔다.

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
                    // ★ 파손으로 자리가 닫혔다 — 그것만 재봉 도구가 다시 연다
                    if ((g.attrs || []).indexOf(k) < 0) { if (!F._closed || typeof F._closed !== 'object') F._closed = {}; F._closed[k] = 1; }
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

    // 2) 파손으로 닫힌 자리를 다시 연다 — _closed 에 표시된 것만 (세 자리까지)
    //    파손은 자리를 닫으며 slots 도 하나 줄이므로(gear-break.js), 다시 열 때 slots 도 되돌린다
    gearFullPrune(g, F);
    const closed = closedKeys(g, F);
    if (closed.length && attrs.length < 3) {
        const key = closed[closed.length - 1];
        if (!g.attrs) g.attrs = [];
        if (!g.attrGrades) g.attrGrades = {};
        g.attrs.push(key);
        g.attrGrades[key] = G[0];                      // 가장 낮은 등급으로 다시 열린다
        g.slots = Math.min(3, Math.max(Number(g.slots) || 1, g.attrs.length));
        delete F._closed[key];
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
    left += closedKeys(g, F).length;
    return left;
}

// 파손으로 닫힌 자리 — 지금 자리에 없고 _closed 에 표시된 것
function closedKeys(g, F) {
    const attrs = (g && g.attrs) || [];
    const c = (F && F._closed && typeof F._closed === 'object') ? F._closed : {};
    return Object.keys(c).filter(function (k) { return c[k] && attrs.indexOf(k) < 0; });
}
// 기록 정리 — 지금 자리에 없고 파손으로 닫힌 것도 아닌 열쇠(속성 변경으로 뺀 옛 속성)는 지운다
function gearFullPrune(g, F) {
    const attrs = (g && g.attrs) || [];
    const c = (F && F._closed && typeof F._closed === 'object') ? F._closed : {};
    let n = 0;
    Object.keys(F || {}).forEach(function (k) {
        if (k === '_main' || k === '_closed') return;
        if (attrs.indexOf(k) < 0 && !c[k]) { delete F[k]; n++; }
    });
    if (n) { try { saveFields({ gearFull: 1 }); } catch (e) { } }
    return n;
}
// 자리 수를 넘은 장비 — 뒤에서부터 거둔다 (잘못 되살아난 네 번째 자리)
function gearTrimOver(user) {
    user = user || currentUser;
    const g = (typeof getGear === 'function') ? getGear(user) : null;
    if (!g || !Array.isArray(g.attrs)) return [];
    const max = Math.max(1, Number(g.slots) || 1);
    const gone = [];
    while (g.attrs.length > max) {
        const k = g.attrs.pop();
        if (g.attrGrades) delete g.attrGrades[k];
        gone.push(k);
    }
    if (gone.length) {
        const nameOf = function (k) { return (typeof gearAttrName === 'function') ? gearAttrName(k) : k; };
        try { addHistoryLog(user, '[전용 장비] 자리 수를 넘어 되살아난 속성을 거뒀습니다 — ' + gone.map(nameOf).join(' · ')); } catch (e) { }
        try { if (user === currentUser) { saveSelfFull(); updateUI(); } } catch (e) { }
    }
    return gone;
}
window.gearTrimOver = gearTrimOver;

// ==========================================
// 속성 변경(지우기)으로 뺀 속성 — 기록(gearFull)에서도 지운다 · 들어올 때 넘친 자리는 거둔다
// ==========================================
(function hookReattrPrune() {
    const iv = setInterval(function () {
        if (typeof doGearReattr !== 'function') return;
        if (doGearReattr._fullPrune) { clearInterval(iv); return; }
        const _d = doGearReattr;
        const w = function (attr) {
            const r = _d.apply(this, arguments);
            try {
                const F = gearFullOf(currentUser);
                if (attr && (F[attr] != null || (F._closed && F._closed[attr]))) {
                    delete F[attr];
                    if (F._closed) delete F._closed[attr];
                    saveFields({ gearFull: 1 });
                }
            } catch (e) { }
            return r;
        };
        Object.keys(_d).forEach(function (k) { try { w[k] = _d[k]; } catch (e) { } });
        w._fullPrune = true;
        doGearReattr = w; window.doGearReattr = w;
        clearInterval(iv);
    }, 500);
})();
(function trimOnLogin() {
    let tries = 0;
    const iv = setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser || typeof getGear !== 'function') { if (++tries > 120) clearInterval(iv); return; }
        clearInterval(iv);
        setTimeout(function () {
            try {
                const g = getGear(currentUser);
                if (g) { gearFullPrune(g, gearFullOf(currentUser)); const gone = gearTrimOver(currentUser); if (gone.length) console.log('[재봉] 자리 수를 넘은 속성을 거뒀습니다:', gone.join(', ')); }
            } catch (e) { }
        }, 6000);
    }, 1000);
})();

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
    closedKeys(g, F).forEach(function (k) {
        rows.push({ 자리: '닫힘 (파손)', 항목: nameOf(k), 지금: '없음', 상한: F[k] != null ? F[k] : G[0], 손상: '✗' });
    });
    Object.keys(F).forEach(function (k) {
        if (k === '_main' || k === '_closed' || attrs.indexOf(k) >= 0 || (F._closed && F._closed[k])) return;
        rows.push({ 자리: '옛 기록', 항목: nameOf(k), 지금: '없음 (속성 변경으로 뺀 것 — 다시 열지 않음)', 상한: F[k], 손상: '' });
    });
    console.table(rows);
    console.log('  남은 손상:', gearLeftBroken() + '군데');
    console.log('  가진 재봉 도구:', (currentUser.inventory || []).filter(function (x) { return x === '재봉 도구'; }).length + '개');
    console.log('  연결:', (typeof useInventoryItem === 'function' && useInventoryItem._repairFix2) ? 'O' : '-');
}

console.log('[재봉] 교체판 연결 — gearRepairState() 로 확인');