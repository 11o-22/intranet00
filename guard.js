// ==========================================
// ★ 유령 계정 쓰기 차단
// index.html 에서 dna-once.js 다음에 불러온다
// ==========================================
//
// 사원을 지워도 undefined 껍데기가 다시 생긴다.
// dnaOf 나 dnaGiftIndex 가 없는 계정에 값을 써서
// 파이어베이스가 그 경로를 새로 만들기 때문이다.
// 사원이 아닌 계정에는 아예 쓰지 않게 막는다.

(function guardGhostWrite() {

    function realUser(code) {
        const u = db.users && db.users[code];
        return !!(u && u.code && u.name && u.name !== '기본사원');
    }

    // --- 남의 계정에 쓰는 길을 막는다 ---
    if (typeof updateUserFields === 'function' && !updateUserFields._ghostGuard) {
        const _u = updateUserFields;
        updateUserFields = function (code, fields) {
            const me = currentUser && code === currentUser.code;
            if (!realUser(code) && !me) {
                console.warn('[차단] 사원이 아닌 계정:', code, '·', Object.keys(fields || {}).join(', '));
                return Promise.resolve();
            }
            return _u.apply(this, arguments);
        };
        updateUserFields._ghostGuard = true;
    }

    // --- dna 를 심는 것도 막는다 ---
    if (typeof dnaOf === 'function' && !dnaOf._ghostGuard) {
        const _d = dnaOf;
        dnaOf = function (user) {
            if (!user || !user.code || !user.name) return '----';
            return _d.apply(this, arguments);
        };
        dnaOf._ghostGuard = true;
    }

    // --- 기본사원 잔재를 화면에서도 뺀다 ---
    function dropDefault() {
        if (!db.users) return;
        Object.keys(db.users).forEach(function (c) {
            const u = db.users[c];
            if (!u) { delete db.users[c]; return; }
            if (u.name === '기본사원') { delete db.users[c]; return; }
            if (!u.code || !u.name) delete db.users[c];
        });
    }
    dropDefault();
    setInterval(dropDefault, 5000);

    console.log('[유령] 쓰기 차단 적용 — cleanGhostUsers() 로 정리');
})();

// ==========================================
// 이미 생긴 껍데기 치우기 — 상담사 전용
// ==========================================
function cleanGhostUsers() {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    database.ref('users').once('value').then(function (s) {
        const srv = s.val() || {};
        const bad = Object.keys(srv).filter(function (c) {
            const u = srv[c];
            if (c === 'kario0987') return false;
            return !u || !u.name || !u.code || u.name === '기본사원';
        });

        if (!bad.length) { console.log('%c서버가 깨끗합니다.', 'color:#4CAF50'); return; }

        console.table(bad.map(function (c) {
            return { 키: c, 가진필드: Object.keys(srv[c] || {}).join(', ') || '(빈 객체)' };
        }));

        const up = {};
        bad.forEach(function (c) { up['users/' + c] = null; delete db.users[c]; });

        return database.ref('/').update(up).then(function () {
            console.log('%c✓ ' + bad.length + '건 지웠습니다: ' + bad.join(', '), 'color:#4CAF50; font-size:13px');
            console.log('  새로고침하면 반영됩니다.');
        });
    }).catch(function (e) { console.error('실패:', e); });
}

// 지금 껍데기가 있는지만 본다
function checkGhostUsers() {
    database.ref('users').once('value').then(function (s) {
        const srv = s.val() || {};
        const bad = Object.keys(srv).filter(function (c) {
            const u = srv[c];
            if (c === 'kario0987') return false;
            return !u || !u.name || !u.code || u.name === '기본사원';
        });
        if (!bad.length) { console.log('%c서버가 깨끗합니다.', 'color:#4CAF50'); return; }
        console.warn('껍데기 ' + bad.length + '건');
        console.table(bad.map(function (c) {
            return { 키: c, 가진필드: Object.keys(srv[c] || {}).join(', ') || '(빈 객체)' };
        }));
        console.log('지우려면 cleanGhostUsers()');
    });
}