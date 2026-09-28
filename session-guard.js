// ==========================================
// ★ 기기 하나만 쓰게 — 덮어쓰기로 물건이 사라지는 것을 막는다
// index.html 에서 맨 뒤에 불러온다
// ==========================================
//
// 같은 계정을 두 기기에서 열어 두면, 각자 자기 머릿속 자료를 통째로 저장한다.
// 나중에 저장한 쪽이 이기므로, 다른 기기에서 얻은 물건이 통째로 사라진다.
//
// 그래서 접속할 때마다 표를 하나 걸어 두고,
// 그 표가 바뀌면(= 다른 기기가 들어오면) 이 창은 더 이상 쓰지 않는다.

(function sessionGuard() {

const SID = 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
let stale = false;
let told = false;
let watching = null;

function freeze(why) {
    if (stale) return;
    stale = true;
    if (told) return;
    told = true;
    try {
        showCustomAlert('다른 기기에서 접속했습니다.\n\n'
            + '이 창은 더 이상 저장하지 않습니다.\n'
            + '계속 쓰려면 새로고침하세요.');
    } catch (e) { }
    console.warn('[기기] 이 창은 멈췄습니다 — ' + why);
}

// 저장을 막는다
function block(name, isSelf) {
    if (typeof window[name] !== 'function') return false;
    if (window[name]._sidGuard) return true;
    const _f = window[name];
    window[name] = function (a) {
        if (stale) {
            // 내 자료를 건드리는 저장만 막는다
            if (!isSelf || !a || a === (currentUser && currentUser.code)) {
                console.warn('[기기] 저장 막음: ' + name);
                return;
            }
        }
        return _f.apply(this, arguments);
    };
    window[name]._sidGuard = true;
    return true;
}

function guardAll() {
    block('saveSelfFull', false);
    block('saveFields', false);
    block('saveDB', false);
    block('updateUserFields', true);
}

// 표를 걸고 지켜본다
function claim() {
    if (!database || !currentUser || !currentUser.code) return;
    const ref = database.ref('users/' + currentUser.code + '/activeSid');

    ref.set(SID).catch(function (e) { console.warn('[기기] 표 걸기 실패', e); });

    if (watching) { try { watching.off(); } catch (e) { } }
    watching = ref;
    ref.on('value', function (s) {
        const v = s.val();
        if (!v) return;
        if (v !== SID) freeze('표가 ' + v + ' 로 바뀜');
    });
}

// 로그인 뒤에 건다
(function waitLogin() {
    let last = null;
    setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.code) return;
        guardAll();
        if (currentUser.code === last) return;
        last = currentUser.code;
        stale = false; told = false;
        claim();
        console.log('[기기] 이 창의 표: ' + SID);
    }, 1000);
})();

// 창을 닫을 때는 표를 내려 둔다 — 다음에 여는 쪽이 바로 쓴다
window.addEventListener('beforeunload', function () {
    if (stale || !database || !currentUser || !currentUser.code) return;
    try { database.ref('users/' + currentUser.code + '/activeSid').remove(); } catch (e) { }
});

// ==========================================
// 확인 · 되살리기
// ==========================================
window.deviceState = function () {
    console.log('%c===== 이 창 =====', 'color:#d4af37; font-size:13px');
    console.log('  내 표:', SID);
    console.log('  멈춤:', stale ? '예 — 저장하지 않습니다' : '아니오');
    if (!database || !currentUser) return;
    database.ref('users/' + currentUser.code + '/activeSid').once('value').then(function (s) {
        console.log('  서버의 표:', s.val() || '(없음)');
        console.log('  같은가:', s.val() === SID ? 'O' : '✗');
    });
};

// 이 창을 다시 주인으로 만든다
window.takeOverDevice = function () {
    if (!database || !currentUser) return;
    stale = false; told = false;
    database.ref('users/' + currentUser.code + '/activeSid').set(SID).then(function () {
        console.log('%c✓ 이 창이 주인이 되었습니다. 다른 창은 저장하지 않습니다.', 'color:#4CAF50');
    });
};

console.log('[기기] 덮어쓰기 방지 — deviceState() · takeOverDevice()');

})();