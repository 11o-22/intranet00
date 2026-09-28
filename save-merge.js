// ==========================================
// ★ 통째 쓰기를 「바뀐 것만 쓰기」로 바꾼다
// index.html 에서 맨 뒤에 불러온다 (session-guard.js 는 빼도 된다)
// ==========================================
//
// 왜 자료가 사라졌나
//   saveSelfFull() 은 currentUser 의 모든 항목을 서버에 덮어쓴다.
//   그래서 다른 기기나 다른 사람이 내 preg·inventory 를 고쳐 놔도,
//   내 창이 아무 저장이나 한 번 하면 내 머릿속 옛 값으로 전부 되돌아간다.
//
// 어떻게 고치나
//   서버에서 마지막으로 읽은 모습을 「기준」으로 들고 있다가,
//   저장할 때 기준과 다른 항목만 골라 쓴다.
//   내가 손대지 않은 항목은 아예 쓰지 않으므로 남의 변경이 살아남는다.
//   서버가 바뀌면, 내가 손대지 않은 항목만 조용히 받아 온다.

(function saveMerge() {

const SKIP = ['letters', 'hasNewLetter', 'hasNewReply', 'hasItemUsedOnMe',
              'houseChatUnread', 'house', '_adminStamp', '_stamp'];

let code = null;
let base = {};            // 서버에서 마지막으로 본 모습
let ref = null;
let ready = false;

function clone(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return undefined; }
}
function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
}
function badKey(k) { return /[.#$\[\]\/]/.test(k); }

// ==========================================
// 기준을 세우고 지켜본다
// ==========================================
function attach() {
    if (!database || !currentUser || !currentUser.code) return;
    if (code === currentUser.code) return;
    code = currentUser.code;
    ready = false;

    if (ref) { try { ref.off(); } catch (e) { } }
    ref = database.ref('users/' + code);

        ref.on('value', function (s) {
        const srv = s.val();
        if (!srv) return;
        if (!currentUser || currentUser.code !== code) return;   // ← 추가

        if (!ready) {
            base = clone(srv) || {};
            ready = true;
            console.log('[병합] 기준을 세웠습니다.');
            return;
        }

        // 서버가 바뀌었다 — 내가 손대지 않은 항목만 받아 온다
        let took = 0;
        Object.keys(srv).forEach(function (k) {
            if (k === '_adminStamp' || k === '_stamp') return;
            if (same(srv[k], base[k])) return;              // 서버도 그대로면 볼 것 없다
            const mineTouched = !same(currentUser[k], base[k]);
            if (mineTouched) return;                        // 내가 바꾼 것은 내가 쓴다
            currentUser[k] = clone(srv[k]);
            took++;
        });

        // 서버에서 사라진 항목도 따라 지운다 (내가 손대지 않았을 때만)
        Object.keys(base).forEach(function (k) {
            if (k in srv) return;
            if (!same(currentUser[k], base[k])) return;
            delete currentUser[k];
            took++;
        });

        base = clone(srv) || {};

        if (took) {
            if (db && db.users && db.users[code]) db.users[code] = currentUser;
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            console.log('[병합] 서버에서 ' + took + '개 항목을 받아 왔습니다.');
        }
    });
}

// ==========================================
// 바뀐 것만 쓴다
// ==========================================
function diffPayload() {
    const out = {};
    Object.keys(currentUser).forEach(function (k) {
        if (SKIP.indexOf(k) >= 0) return;
        if (badKey(k)) return;
        if (currentUser[k] === undefined) return;
        if (same(currentUser[k], base[k])) return;          // 안 바뀐 것은 건너뛴다
        const v = clone(currentUser[k]);
        if (v === undefined) return;
        out[k] = v;
    });
    return out;
}

function markSaved(payload) {
    Object.keys(payload).forEach(function (k) { base[k] = clone(payload[k]); });
}

(function hookSave() {
    const iv = setInterval(function () {
        if (typeof saveSelfFull !== 'function') return;
        if (saveSelfFull._merge) { clearInterval(iv); return; }

        const _full = saveSelfFull;
        saveSelfFull = function () {
            if (!database || !currentUser) return Promise.resolve();
            if (currentUser.code !== code) return _full.apply(this, arguments);   // ← 추가
            if (!ready) return _full.apply(this, arguments); // 기준이 없으면 예전 방식

            const payload = diffPayload();
            const n = Object.keys(payload).length;
            if (!n) return Promise.resolve();                 // 바뀐 게 없으면 쓰지 않는다

            payload._adminStamp = Date.now();
            currentUser._adminStamp = payload._adminStamp;

            return database.ref('users/' + code).update(payload)
                .then(function () { markSaved(payload); })
                .catch(function (e) { console.error('[병합] 저장 실패:', e); });
        };
        saveSelfFull._merge = true;

        // saveFields 는 원래도 항목만 쓴다 — 기준만 맞춰 준다
        if (typeof saveFields === 'function' && !saveFields._merge) {
            const _f = saveFields;
            saveFields = function (fields) {
                const r = _f.apply(this, arguments);
                try {
                    Object.keys(fields || {}).forEach(function (k) {
                        base[k] = clone(currentUser[k]);
                    });
                } catch (e) { }
                return r;
            };
            saveFields._merge = true;
        }

        // saveDB 도 통째로 쓴다 — 같은 방식으로 좁힌다
        if (typeof saveDB === 'function' && !saveDB._merge) {
            const _d = saveDB;
            saveDB = function () {
                if (!ready) return _d.apply(this, arguments);
                return saveSelfFull();
            };
            saveDB._merge = true;
        }

        clearInterval(iv);
        console.log('[병합] 바뀐 것만 쓰도록 바꿨습니다.');
    }, 500);
})();

// ==========================================
// 남을 고쳤을 때 — 그쪽이 바로 알아채도록
// ==========================================
(function hookOther() {
    const iv = setInterval(function () {
        if (typeof updateUserFields !== 'function') return;
        if (updateUserFields._merge) { clearInterval(iv); return; }
        const _u = updateUserFields;
        updateUserFields = function (c, fields) {
            const r = _u.apply(this, arguments);
            // 내 자리면 기준도 맞춘다
            if (c === code) {
                try {
                    Object.keys(fields || {}).forEach(function (k) {
                        if (k === '_adminStamp') return;
                        base[k] = clone(currentUser[k]);
                    });
                } catch (e) { }
            }
            return r;
        };
        updateUserFields._merge = true;
        clearInterval(iv);
    }, 500);
})();

setInterval(attach, 1000);

// ==========================================
// 확인
// ==========================================
window.mergeState = function () {
    console.log('%c===== 저장 병합 =====', 'color:#d4af37; font-size:13px');
    console.log('  계정:', code || '(없음)', '· 기준 준비:', ready ? 'O' : '-');
    if (!ready) return;
    const d = diffPayload();
    const keys = Object.keys(d);
    console.log('  지금 저장하면 쓸 항목 ' + keys.length + '개:', keys.join(', ') || '(없음)');
    console.log('  기준 항목 수:', Object.keys(base).length);
    console.log('  saveSelfFull 교체:', (typeof saveSelfFull === 'function' && saveSelfFull._merge) ? 'O' : '-');
};

// 서버 자료로 강제로 맞춘다
window.pullServer = function () {
    if (!database || !code) return;
    database.ref('users/' + code).once('value').then(function (s) {
        const v = s.val();
        if (!v) return;
        Object.keys(currentUser).forEach(function (k) { if (!(k in v)) delete currentUser[k]; });
        Object.keys(v).forEach(function (k) { currentUser[k] = clone(v[k]); });
        base = clone(v) || {};
        ready = true;
        if (typeof updateUI === 'function') updateUI();
        console.log('%c✓ 서버 자료로 맞췄습니다. 소지품 ' + ((currentUser.inventory || []).length) + '개', 'color:#4CAF50');
    });
};

console.log('[병합] mergeState() · pullServer()');

})();