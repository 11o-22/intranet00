// ==========================================
// ★ 사택 등급 저장 보정
// index.html 에서 house-own.js 다음에 불러온다
// ==========================================
//
// saveSelfFull() 의 SKIP 목록에 'house' 가 들어 있어서
// house.grade 가 파이어베이스로 안 올라간다.
// 등급만 따로, 직접 쓴다.

// --- 등급만 콕 집어 저장 ---
function saveHouseGrade(code, g) {
    if (typeof database === 'undefined' || !database) return Promise.resolve();
    const c = code || (currentUser && currentUser.code);
    if (!c || !g) return Promise.resolve();
    return database.ref('users/' + c + '/house/grade').set(g)
        .catch(e => console.error('[사택] 등급 저장 실패:', e));
}

// --- 내 등급 저장 ---
function saveMyHouseGrade() {
    if (!currentUser) return Promise.resolve();
    const h = (typeof getHouse === 'function') ? getHouse(currentUser) : currentUser.house;
    if (!h || !h.grade) return Promise.resolve();
    return saveHouseGrade(currentUser.code, h.grade);
}

// --- grade 가 바뀌면 자동으로 저장 ---
(function watchGrade() {
    let watched = null;       // 지금 감시 중인 house 객체
    let lastSaved = null;     // 마지막으로 저장한 값

    function attach() {
        if (!currentUser) return;
        const h = (typeof getHouse === 'function') ? getHouse(currentUser) : currentUser.house;
        if (!h || typeof h !== 'object') return;
        if (h === watched) return;          // 이미 감시 중

        // 이전 감시 해제
        if (watched) {
            try {
                const v = watched.grade;
                delete watched.grade;
                watched.grade = v;
            } catch (e) { /* 무시 */ }
        }

        let val = h.grade;
        lastSaved = val;
        try {
            Object.defineProperty(h, 'grade', {
                configurable: true,
                enumerable: true,
                get: function () { return val; },
                set: function (v) {
                    if (v === val) return;
                    val = v;
                    if (v && v !== lastSaved) {
                        lastSaved = v;
                        saveHouseGrade(currentUser.code, v);
                    }
                }
            });
            watched = h;
        } catch (e) {
            console.warn('[사택] 등급 감시 실패:', e);
            watched = null;
        }
    }

    attach();

    // currentUser 가 통째로 갈리는 경우가 있어 주기적으로 다시 붙인다
    setInterval(function () {
        attach();
        if (!currentUser || !watched) return;
        // 감시 밖에서 바뀐 경우를 위한 대조
        if (watched.grade && watched.grade !== lastSaved) {
            lastSaved = watched.grade;
            saveHouseGrade(currentUser.code, watched.grade);
        }
    }, 3000);
})();

// --- 상담사 조정도 저장되게 ---
(function fixAdmin() {
    if (typeof adminSetHouseGrade !== 'function') return;
    const _f = adminSetHouseGrade;
    adminSetHouseGrade = function (g) {
        const r = _f.apply(this, arguments);
        // 대상이 남이면 그 사람 것도 저장한다
        try {
            const code = (typeof adminTargetCode !== 'undefined' && adminTargetCode)
                ? adminTargetCode
                : (window.selectedAdminTarget || null);
            if (code && db.users[code]) saveHouseGrade(code, g);
        } catch (e) { /* 무시 */ }
        saveMyHouseGrade();
        return r;
    };
})();

// --- 화면 그릴 때 한 번씩 대조 ---
(function syncOnRender() {
    if (typeof renderHouse !== 'function') return;
    const _r = renderHouse;
    renderHouse = function () {
        const r = _r.apply(this, arguments);
        saveMyHouseGrade();
        return r;
    };
})();

// --- 수동 복구용 ---
// 콘솔에서 fixHouseGrade('사번', 'A') 로 고칠 수 있다
function fixHouseGrade(code, g) {
    if (!db.users[code]) { console.warn('그런 사번이 없습니다:', code); return; }
    if (!db.users[code].house) db.users[code].house = {};
    db.users[code].house.grade = g;
    saveHouseGrade(code, g).then(function () {
        console.log('[사택] ' + code + ' → ' + g + '급 저장 완료');
        if (typeof updateUI === 'function') updateUI();
    });
}

// --- 전체 점검 ---
function checkHouseGrades() {
    if (typeof database === 'undefined' || !database) { console.warn('database 없음'); return; }
    database.ref('users').once('value').then(function (snap) {
        const server = snap.val() || {};
        const rows = [];
        Object.keys(db.users || {}).forEach(function (c) {
            const local = (db.users[c].house || {}).grade || '-';
            const remote = ((server[c] || {}).house || {}).grade || '-';
            if (local !== remote) rows.push({ 사번: c, 이름: db.users[c].name, 화면: local, 서버: remote });
        });
        if (!rows.length) console.log('%c[사택] 화면과 서버가 전부 일치합니다.', 'color:#4CAF50');
        else {
            console.warn('[사택] 안 맞는 사원 ' + rows.length + '명');
            console.table(rows);
            console.log('고치려면: fixHouseGrade(\'사번\', \'등급\')');
        }
    });
}

console.log('[사택] 등급 저장 보정 적용 — checkHouseGrades() 로 점검');