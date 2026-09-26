// ==========================================
// ★ 어둠 — 전용 장비 파손
// index.html 에서 slots8 관련 파일 다음, 맨 뒤에 불러온다
// ==========================================
//
// 어둠에서 전용 장비가 상한다.
// 낮은 눈이 나오거나 치명적인 상황을 넘길 때 등급이 내려간다.
// D등급에서 한 번 더 상하면 부서져 사라진다.
//
// 파손 보호권 · 재봉 도구로 막거나 되돌릴 수 있다.

const GEAR_BREAK = {
    fumble: 0.35,      // 1이 나왔을 때
    low: 0.10,         // 3 이하가 나왔을 때
    death: 0.50,       // 죽을 뻔한 것을 넘겼을 때
    gimmick: 0.15      // 기믹을 부술 때
};

function gearGradeList() {
    return (typeof GEAR_GRADES !== 'undefined') ? GEAR_GRADES : ['D', 'C', 'B', 'A', 'S', 'L'];
}

// ==========================================
// 뒤쪽 자리부터 깎는다
// ==========================================
//
// 속성이 셋이면 세 번째부터 한 단계씩 내려간다.
// D 에서 한 번 더 맞으면 그 자리가 사라진다.
// 자리가 다 없어지고 본체가 D 에서 맞으면 부서진다.

function gearAttrGradeOf(g, key, idx) {
    if (idx === 0) return g.grade;
    if (typeof gearAttrGrade === 'function') {
        try { return gearAttrGrade(g, key); } catch (e) { /* 무시 */ }
    }
    return (g.attrGrades && g.attrGrades[key]) || g.grade;
}

function gearAttrName(key) {
    if (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[key]) {
        return GEAR_ATTRS[key].icon + ' ' + GEAR_ATTRS[key].name;
    }
    return key;
}

function breakGear(why, rate) {
    if (!currentUser || !darkRun) return false;
    if (typeof getGear !== 'function') return false;

    const g = getGear(currentUser);
    if (!g) return false;

    if (Math.random() >= (rate || 0.1)) return false;

    // 보호권이 있으면 한 번 막는다
    if (currentUser.gearProtect) {
        currentUser.gearProtect = false;
        saveFields({ gearProtect: 1 });
        if (typeof showDarkToast === 'function') showDarkToast('◈ 보호권이 대신 찢어졌다.');
        darkRun.log.push('[장비] 보호권 소모 — ' + why);
        return false;
    }

        const G = gearGradeList();
    const attrs = g.attrs || [];

    // L 등급은 상하지 않는다
    const lv = attrs.length ? gearAttrGradeOf(g, attrs[attrs.length - 1], attrs.length - 1) : g.grade;
    if (lv === 'L') {
        darkRun.log.push('[장비] L등급은 상하지 않는다 — ' + why);
        if (typeof showDarkToast === 'function') showDarkToast('◈ 흠집조차 안 난다.');
        return false;
    }
    

    // 맨 뒤 자리부터 본다
    const idx = Math.max(0, attrs.length - 1);
    const key = attrs[idx];
    const cur = gearAttrGradeOf(g, key, idx);
    const pos = G.indexOf(cur);

    // --- 두 번째 이후 자리 ---
    if (idx > 0) {
        if (pos > 0) {
            // 한 단계 내린다
            if (!g.attrGrades) g.attrGrades = {};
            g.attrGrades[key] = G[pos - 1];
            currentUser.gearBroken = true;
            const msg = gearAttrName(key) + ' ' + cur + ' → ' + G[pos - 1];
            addHistoryLog(currentUser, '[장비 손상] ' + g.name + ' · ' + msg + ' (' + why + ')');
            darkRun.log.push('[장비] ' + msg + ' — ' + why);
            saveSelfFull();
            if (typeof showDarkToast === 'function') showDarkToast('✗ ' + msg);
            return true;
        }
        // D 에서 또 맞으면 그 자리가 사라진다
        const nm = gearAttrName(key);
        attrs.splice(idx, 1);
        if (g.attrGrades) delete g.attrGrades[key];
        g.slots = Math.max(1, (g.slots || 1) - 1);
        currentUser.gearBroken = true;
        addHistoryLog(currentUser, '[장비 손상] ' + g.name + ' 의 ' + nm + ' 자리가 닫혔습니다. (' + why + ')');
        darkRun.log.push('[장비] ' + nm + ' 자리 소실 — ' + why);
        saveSelfFull();
        if (typeof showDarkToast === 'function') showDarkToast('✗ ' + nm + ' 자리가 닫혔다.');
        setTimeout(function () {
            showCustomAlert(g.name + '\n\n' + nm + ' 자리가 닫혔습니다.\n' + why
                + '\n\n남은 자리 ' + attrs.length + '개');
        }, 400);
        return true;
    }

    // --- 첫 자리 = 본체 등급 ---
    if (pos > 0) {
        const before = g.grade;
        g.grade = G[pos - 1];
        currentUser.gearBroken = true;
        addHistoryLog(currentUser, '[장비 손상] ' + g.name + ' ' + before + ' → ' + g.grade + ' (' + why + ')');
        darkRun.log.push('[장비] ' + before + ' → ' + g.grade + ' — ' + why);
        saveSelfFull();
        if (typeof showDarkToast === 'function') showDarkToast('✗ ' + g.name + ' ' + before + ' → ' + g.grade);
        return true;
    }

    // D 에서 또 맞으면 부서진다
    const nm = g.name;
    currentUser.soulGear = null;
    currentUser.gearBroken = false;
    addHistoryLog(currentUser, '[장비 파손] ' + nm + '이(가) 부서져 사라졌습니다. (' + why + ')');
    darkRun.log.push('[장비] ' + nm + ' 소실 — ' + why);
    saveSelfFull();
    if (typeof showDarkToast === 'function') showDarkToast('✗ ' + nm + ' 이(가) 부서졌다.');
    setTimeout(function () {
        showCustomAlert(nm + '이(가) 부서졌습니다.\n\n' + why + '\n\n조각도 남지 않았습니다.');
    }, 400);
    return true;
}

// ==========================================
// 판정에 붙인다
// ==========================================
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._gearBreak) { clearInterval(iv); return; }

        const _l = luckReroll;
        luckReroll = function (roll) {
            const r = _l.apply(this, arguments);
            if (darkRun && !darkRun._dead) {
                if (r === 1) breakGear('굴린 눈이 1이었다', GEAR_BREAK.fumble);
                else if (r <= 3) breakGear('손이 미끄러졌다', GEAR_BREAK.low);
            }
            return r;
        };
        luckReroll._gearBreak = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 치명적인 상황을 넘길 때
// ==========================================
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._gearBreak) { clearInterval(iv); return; }

        const _d = darkDeath;
        darkDeath = function () {
            const wasDead = darkRun ? darkRun._dead : false;
            const r = _d.apply(this, arguments);
            // 살아남았으면 장비가 대신 받았을 수 있다
            if (darkRun && !darkRun._dead && !wasDead) {
                breakGear('막아 내는 데 썼다', GEAR_BREAK.death);
            }
            return r;
        };
        darkDeath._gearBreak = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 기믹을 부술 때
// ==========================================
(function hookSmash() {
    const iv = setInterval(function () {
        let done = 0;

        if (typeof jakduSmash === 'function' && !jakduSmash._gearBreak) {
            const _j = jakduSmash;
            jakduSmash = function () {
                const r = _j.apply(this, arguments);
                breakGear('기믹을 부수다 금이 갔다', GEAR_BREAK.gimmick);
                return r;
            };
            jakduSmash._gearBreak = true;
        }
        if (typeof jakduSmash === 'function' && jakduSmash._gearBreak) done++;

        if (typeof rubySmash === 'function' && !rubySmash._gearBreak) {
            const _r = rubySmash;
            rubySmash = function () {
                const r = _r.apply(this, arguments);
                breakGear('빛이 되받아쳤다', GEAR_BREAK.gimmick);
                return r;
            };
            rubySmash._gearBreak = true;
        }
        if (typeof rubySmash !== 'function' || rubySmash._gearBreak) done++;

        if (done >= 2) clearInterval(iv);
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
function gearBreakState() {
    console.log('%c===== 전용 장비 파손 =====', 'color:#e53935; font-size:13px');
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    if (!g) console.log('  전용 장비가 없습니다.');
    else {
        console.log('  ' + g.icon + ' ' + g.name + ' · 본체 ' + g.grade + '등급 · 자리 ' + (g.slots || 1) + '개');
        const attrs = g.attrs || [];
        if (!attrs.length) console.log('  속성 없음');
        else console.table(attrs.map(function (k, i) {
            return {
                자리: i + 1,
                속성: gearAttrName(k),
                등급: gearAttrGradeOf(g, k, i),
                깎이는순서: (attrs.length - i) + '번째'
            };
        }));
        console.log('  다음에 맞을 자리:', attrs.length ? (attrs.length + '번 (' + gearAttrName(attrs[attrs.length - 1]) + ')') : '본체');
        console.log('  손상 기록:', currentUser.gearBroken ? '있음 (재봉 도구로 복구)' : '없음');
        console.log('  보호권:', currentUser.gearProtect ? '있음' : '없음');
    }
    console.log('  확률: 눈1 ' + (GEAR_BREAK.fumble * 100) + '% · 눈3이하 ' + (GEAR_BREAK.low * 100)
        + '% · 죽음회피 ' + (GEAR_BREAK.death * 100) + '% · 기믹 ' + (GEAR_BREAK.gimmick * 100) + '%');
    console.log('  연결:');
    ['luckReroll', 'darkDeath', 'jakduSmash', 'rubySmash'].forEach(function (n) {
        if (typeof window[n] !== 'function') { console.log('    (없음) ' + n); return; }
        console.log('    ' + (window[n]._gearBreak ? '✓ ' : '✗ ') + n);
    });
}

console.log('[장비] 어둠 파손 적용 — gearBreakState() 로 확인');