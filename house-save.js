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

function myHouseObj() {
    if (!currentUser) return null;
    if (typeof getHouse === 'function') {
        try { return getHouse(currentUser); } catch (e) { /* 무시 */ }
    }
    return currentUser.house || null;
}

function saveMyHouseGrade() {
    const h = myHouseObj();
    if (!h || !h.grade || !currentUser) return Promise.resolve();
    return saveHouseGrade(currentUser.code, h.grade);
}

// ==========================================
// grade 가 바뀌면 자동으로 저장
// ==========================================
let _hgWatched = null;      // 지금 감시 중인 house 객체
let _hgLastSaved = null;    // 마지막으로 저장한 값

function attachGradeWatcher() {
    const h = myHouseObj();
    if (!h || typeof h !== 'object') return false;

    // 이미 이 객체에 붙어 있으면 그만
    const desc = Object.getOwnPropertyDescriptor(h, 'grade');
    if (h === _hgWatched && desc && desc.get) return true;

    let val = h.grade;
    try {
        Object.defineProperty(h, 'grade', {
            configurable: true,
            enumerable: true,
            get: function () { return val; },
            set: function (v) {
                if (v === val) return;
                val = v;
                if (v && v !== _hgLastSaved && currentUser) {
                    _hgLastSaved = v;
                    saveHouseGrade(currentUser.code, v);
                }
            }
        });
        _hgWatched = h;
        _hgLastSaved = val;
        return true;
    } catch (e) {
        console.warn('[사택] 등급 감시 실패:', e);
        return false;
    }
}

// currentUser 나 house 객체가 통째로 갈리는 경우가 있어 자주 다시 붙인다
setInterval(function () {
    if (!currentUser) return;
    attachGradeWatcher();

    // 감시 밖에서 바뀐 경우를 위한 대조
    const h = myHouseObj();
    if (h && h.grade && h.grade !== _hgLastSaved) {
        _hgLastSaved = h.grade;
        saveHouseGrade(currentUser.code, h.grade);
    }
}, 1000);

attachGradeWatcher();

// ==========================================
// 함수 훅 — 늦게 정의되는 것도 잡는다
// ==========================================
(function hookLate() {
    let tries = 0;
    const done = {};

    function wrapRenderHouse() {
        if (done.renderHouse) return true;
        if (typeof renderHouse !== 'function') return false;
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            attachGradeWatcher();
            saveMyHouseGrade();
            return r;
        };
        done.renderHouse = true;
        return true;
    }

    function wrapAdmin() {
        if (done.admin) return true;
        if (typeof adminSetHouseGrade !== 'function') return false;
        const _f = adminSetHouseGrade;
        adminSetHouseGrade = function (g) {
            const r = _f.apply(this, arguments);
            try {
                const codes = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
                codes.forEach(function (c) { if (db.users[c]) saveHouseGrade(c, g); });
            } catch (e) { /* 무시 */ }
            saveMyHouseGrade();
            return r;
        };
        done.admin = true;
        return true;
    }

    function wrapHouseMove() {
        if (done.move) return true;
        if (typeof houseMove !== 'function') return false;
        const _f = houseMove;
        houseMove = function () {
            const r = _f.apply(this, arguments);
            attachGradeWatcher();
            saveMyHouseGrade();
            return r;
        };
        done.move = true;
        return true;
    }

    const iv = setInterval(function () {
        const a = wrapRenderHouse(), b = wrapAdmin(), c = wrapHouseMove();
        if ((a && b && c) || ++tries > 60) {
            clearInterval(iv);
            const miss = [];
            if (!done.renderHouse) miss.push('renderHouse');
            if (!done.admin) miss.push('adminSetHouseGrade');
            if (!done.move) miss.push('houseMove');
            if (miss.length) console.warn('[사택] 못 찾은 함수:', miss.join(', '));
        }
    }, 500);
})();

// ==========================================
// 수동 도구
// ==========================================
function fixHouseGrade(code, g) {
    if (!db.users[code]) { console.warn('그런 사번이 없습니다:', code); return; }
    if (!db.users[code].house) db.users[code].house = {};
    db.users[code].house.grade = g;
    saveHouseGrade(code, g).then(function () {
        console.log('[사택] ' + code + ' → ' + g + '급 저장 완료');
        if (typeof updateUI === 'function') updateUI();
    });
}

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

// 감시 상태 확인
function houseWatchState() {
    const h = myHouseObj();
    const desc = h ? Object.getOwnPropertyDescriptor(h, 'grade') : null;
    console.log('house 객체:', h ? '있음' : '없음');
    console.log('현재 등급:', h ? h.grade : '-');
    console.log('감시자 붙음:', !!(desc && desc.get) ? '예' : '아니오');
    console.log('마지막 저장값:', _hgLastSaved);
    if (!(desc && desc.get)) {
        console.log('다시 붙입니다...');
        console.log(attachGradeWatcher() ? '성공' : '실패');
    }
}

console.log('[사택] 등급 저장 보정 적용 — checkHouseGrades() · houseWatchState()');