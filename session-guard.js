// ==========================================
// ★ 덮어쓰기로 물건·임신이 사라지는 것을 막는다
// index.html 에서 맨 뒤에 불러온다
// ==========================================
//
// 같은 계정을 두 기기에서 열면, 각자 자기 머릿속 자료를 통째로 저장한다.
// 나중에 저장한 쪽이 이기므로 다른 기기에서 얻은 것이 통째로 사라진다.
//
// 그래서 저장할 때마다 내 도장을 같이 찍고, 서버의 도장을 지켜본다.
// 내가 찍지 않은 도장이 올라오면 = 다른 기기가 썼다는 뜻이므로
// 이 창은 그 순간부터 저장을 멈추고 새로 읽어 오라고 알린다.

(function sessionGuard() {

const SID = 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
let seq = 0;
let mine = '';            // 방금 내가 찍은 도장
let stale = false;
let told = false;
let code = null;
let ref = null;

function stampNow() {
    seq++;
    mine = SID + '.' + seq;
    return mine;
}

// 다른 기기가 썼다 — 알리지 않고 조용히 서버 자료로 맞춘다
let syncing = false;
function freeze(why) {
    if (syncing) return;
    syncing = true;
    stale = true;                       // 맞추는 동안만 저장을 멈춘다
    console.log('[기기] 다른 기기가 썼습니다 — 서버 자료로 맞춥니다 (' + why + ')');

    if (!database || !code) { stale = false; syncing = false; return; }

    database.ref('users/' + code).once('value').then(function (s) {
        const v = s.val();
        if (v) {
            // 서버가 가진 것을 그대로 받되, 화면 전용 임시 값은 건드리지 않는다
            Object.keys(v).forEach(function (k) {
                if (k === '_stamp') return;
                currentUser[k] = v[k];
            });
            if (db && db.users && db.users[code]) db.users[code] = currentUser;
        }
        stampNow();                     // 이제부터는 내가 주인
        stale = false; syncing = false;
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        console.log('[기기] 맞췄습니다 — 소지품 ' + ((currentUser.inventory || []).length) + '개');
    }).catch(function (e) {
        console.warn('[기기] 맞추기 실패', e);
        stale = false; syncing = false;
    });
}

// ==========================================
// 저장을 막는다
// ==========================================
function wrap(name, isOther) {
    if (typeof window[name] !== 'function') return false;
    if (window[name]._sidGuard) return true;
    const _f = window[name];
    window[name] = function (a) {
        if (stale) {
            // 남의 계정을 건드리는 저장은 막지 않는다
            if (!isOther || !a || a === code) {
                // 맞추는 동안 들어온 저장은 잠깐 미뤄 둔다
                setTimeout(function () {
                    if (!stale) { try { _f.apply(null, arguments); } catch (e) { } }
                }, 800);
                return;
            }
        }
        const r = _f.apply(this, arguments);
        // 내가 쓴 자리에 도장을 남긴다
        if (!stale && (!isOther || a === code)) markStamp();
        return r;
    };
    window[name]._sidGuard = true;
    return true;
}

let markTimer = null;
function markStamp() {
    if (!database || !code) return;
    clearTimeout(markTimer);
    markTimer = setTimeout(function () {
        const v = stampNow();
        database.ref('users/' + code + '/_stamp').set(v).catch(function () { });
    }, 120);
}

function guardAll() {
    wrap('saveSelfFull', false);
    wrap('saveFields', false);
    wrap('saveDB', false);
    wrap('updateUserFields', true);
}

// ==========================================
// 도장을 지켜본다
// ==========================================
function watch() {
    if (!database || !code) return;
    if (ref) { try { ref.off(); } catch (e) { } }
    ref = database.ref('users/' + code + '/_stamp');

    // 들어올 때 지금 도장을 내 것으로 바꿔 둔다
    const v = stampNow();
    ref.set(v).catch(function () { });

    ref.on('value', function (s) {
        const now = s.val();
        if (!now) return;
        if (now === mine) return;                  // 내가 찍은 것
        if (String(now).indexOf(SID + '.') === 0) return;
        freeze('서버 도장이 ' + now);
    });
}

// ==========================================
// 로그인 뒤에 건다
// ==========================================
(function waitLogin() {
    setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.code) return;
        guardAll();
        if (currentUser.code === code) return;
        code = currentUser.code;
        stale = false; told = false; seq = 0;
        watch();
        console.log('[기기] 이 창의 도장: ' + SID);
    }, 1000);
})();

// ==========================================
// 확인 · 되살리기
// ==========================================
window.deviceState = function () {
    console.log('%c===== 이 창 =====', 'color:#d4af37; font-size:13px');
    console.log('  내 도장:', mine || '(아직 없음)');
    console.log('  멈춤:', stale ? '예 — 저장하지 않습니다' : '아니오');
    if (!database || !code) return;
    database.ref('users/' + code + '/_stamp').once('value').then(function (s) {
        console.log('  서버 도장:', s.val() || '(없음)');
        console.log('  내 것인가:', String(s.val() || '').indexOf(SID + '.') === 0 ? 'O' : '✗');
    });
};

// 이 창을 다시 주인으로 — 서버에서 새로 읽은 뒤에 쓰세요
window.takeOverDevice = function () {
    if (!database || !code) return;
    stale = false; told = false;
    const v = stampNow();
    database.ref('users/' + code + '/_stamp').set(v).then(function () {
        console.log('%c✓ 이 창이 주인이 되었습니다.', 'color:#4CAF50');
        console.log('  자료가 오래됐을 수 있으니 새로고침을 권합니다.');
    });
};

// 서버 자료로 이 창을 맞춘다 (새로고침 없이)
window.reloadMine = function () {
    if (!database || !code) return;
    database.ref('users/' + code).once('value').then(function (s) {
        const v = s.val();
        if (!v) { console.warn('서버에 자료가 없습니다.'); return; }
        Object.keys(v).forEach(function (k) { currentUser[k] = v[k]; });
        stale = false; told = false;
        stampNow();
        if (typeof updateUI === 'function') updateUI();
        console.log('%c✓ 서버 자료로 맞췄습니다.', 'color:#4CAF50');
        console.log('  소지품 ' + (currentUser.inventory || []).length + '개 · 포인트 ' + (currentUser.points || 0));
    });
};

console.log('[기기] 덮어쓰기 방지 (조용히 맞춤) — deviceState() · reloadMine()');

})();