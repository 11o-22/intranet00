// ==========================================
// ★ 통째 쓰기를 「바뀐 것만 쓰기」로 바꾼다
// index.html 에서 맨 뒤에 불러온다
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
//
// 소지품은 한 걸음 더 간다
//   inventory 는 배열이라, 항목만 골라 써도 「배열 통째」로 덮인다.
//   두 기기에서 동시에 물건을 얻으면 나중에 쓴 쪽만 남는다.
//   그래서 소지품은 배열을 쓰지 않고, 기준 대비 「늘어난 것·줄어든 것」만
//   트랜잭션으로 서버 배열에 더하고 뺀다. 둘 다 살아남는다.

(function saveMerge() {

const SKIP = ['letters', 'hasNewLetter', 'hasNewReply', 'hasItemUsedOnMe',
              'houseChatUnread', 'house', '_adminStamp', '_stamp'];

const INV = 'inventory';          // 배열 병합으로 다루는 항목

let code = null;
let base = {};            // 서버에서 마지막으로 본 모습
let ref = null;
let ready = false;

const shadowInv = {};     // 남의 소지품 — 서버에서 마지막으로 본 모습
let invBusy = false;  
let invAgain = false;     
let invStats = { merged: 0, added: 0, removed: 0, conflicts: 0 };

function clone(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return undefined; }
}
function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
}
function badKey(k) { return /[.#$\[\]\/]/.test(k); }
function asArr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}

// ==========================================
// 소지품 — 늘어난 것·줄어든 것만 센다
// ==========================================
//
// 같은 물건을 여러 개 가질 수 있으므로 개수까지 본다.
// msDiff(A, B) = A 에는 있는데 B 에는 없는 것들 (개수 차이만큼)
function msDiff(a, b) {
    const cnt = {};
    asArr(b).forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    const out = [];
    asArr(a).forEach(function (x) {
        if (cnt[x] > 0) { cnt[x]--; return; }
        out.push(x);
    });
    return out;
}

// 서버 배열에 add 를 붙이고 del 을 뺀다 — 그 사이 남이 넣은 것은 그대로 둔다
function mergeInv(path, baseArr, localArr) {
    if (!database) return Promise.resolve(null);
    const add = msDiff(localArr, baseArr);
    const del = msDiff(baseArr, localArr);
    if (!add.length && !del.length) return Promise.resolve(null);

    return database.ref(path).transaction(function (srv) {
        const cur = asArr(srv);
        del.forEach(function (n) {
            const i = cur.indexOf(n);
            if (i >= 0) cur.splice(i, 1);
        });
        return cur.concat(add);
    }, null, false).then(function (res) {        // ★ applyLocally = false
        if (!res || !res.committed) return null;
        const after = asArr(res.snapshot ? res.snapshot.val() : null);
        invStats.merged++;
        invStats.added += add.length;
        invStats.removed += del.length;
        // 내가 생각한 결과와 서버 결과가 다르면, 그 사이 남이 건드렸다는 뜻
        if (after.length !== asArr(localArr).length) invStats.conflicts++;
        return after;
    }).catch(function (e) {
        console.error('[병합] 소지품 저장 실패:', e);
        return null;
    });
}

// 배열을 그대로 두고 내용만 갈아끼운다 (다른 곳이 들고 있는 참조를 지키려고)
function fillArr(target, src) {
    if (!Array.isArray(target)) return src;
    target.length = 0;
    asArr(src).forEach(function (x) { target.push(x); });
    return target;
}

// 내 소지품을 서버와 맞춘다
// 내 소지품을 서버와 맞춘다
function flushMyInv() {
    if (!ready || !currentUser) return Promise.resolve(null);
    if (invBusy) { invAgain = true; return Promise.resolve(null); }   // 버리지 말고 적어 둔다
    if (same(currentUser[INV], base[INV])) return Promise.resolve(null);

    invBusy = true;
    const want = clone(currentUser[INV]) || [];
    const had = clone(base[INV]) || [];

    return mergeInv('users/' + code + '/' + INV, had, want).then(function (after) {
        invBusy = false;

        // 날아가는 사이에 손댄 것을 지킨다 — 이게 없으면 그 사이 산 물건이 사라진다
        const nowArr = asArr(currentUser[INV]);
        const add = msDiff(nowArr, want);      // 사이에 들어온 것
        const del = msDiff(want, nowArr);      // 사이에 빠진 것

        if (after === null) {
            base[INV] = want;
        } else {
            const next = asArr(after).slice();
            del.forEach(function (n) { const i = next.indexOf(n); if (i >= 0) next.splice(i, 1); });
            fillArr(currentUser[INV], next.concat(add));
            base[INV] = clone(after);
        }

        const more = add.length || del.length || invAgain;
        invAgain = false;
        if (more) return flushMyInv();         // 남은 몫을 한 번 더 보낸다
        return after;
    }).catch(function (e) {
        invBusy = false;
        invAgain = false;
        console.error('[병합] 소지품:', e);
        return null;
    });
}

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
        if (!currentUser || currentUser.code !== code) return;   // 계정이 어긋났다

        if (!ready) {
            base = clone(srv) || {};
            ready = true;
            console.log('[병합] 기준을 세웠습니다.');
            return;
        }

        // 서버가 바뀌었다 — 내가 손대지 않은 항목만 받아 온다
        let took = 0;
        const kept = {};                                    // 내가 손댄 항목은 기준도 바꾸지 않는다
        Object.keys(srv).forEach(function (k) {
            if (k === '_adminStamp' || k === '_stamp') return;
            if (same(srv[k], base[k])) return;              // 서버도 그대로면 볼 것 없다
            const mineTouched = !same(currentUser[k], base[k]);
            if (mineTouched) { kept[k] = clone(base[k]); return; }   // 내가 바꾼 것은 내가 쓴다
            if (k === INV) { fillArr(currentUser[INV], srv[k]); base[k] = clone(srv[k]); took++; return; }
            currentUser[k] = clone(srv[k]);
            took++;
        });

        // 서버에서 사라진 항목도 따라 지운다 (내가 손대지 않았을 때만)
        Object.keys(base).forEach(function (k) {
            if (k in srv) return;
            if (k === INV) return;                          // 소지품은 지우지 않는다
            if (!same(currentUser[k], base[k])) return;
            delete currentUser[k];
            took++;
        });

        base = clone(srv) || {};
        Object.keys(kept).forEach(function (k) { base[k] = kept[k]; });

        if (took) {
            if (db && db.users && db.users[code]) db.users[code] = currentUser;
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            console.log('[병합] 서버에서 ' + took + '개 항목을 받아 왔습니다.');
        }
    });
}

// 남의 소지품도 서버에서 본 모습을 적어 둔다 (물건을 줄 때 기준이 된다)
(function watchOthers() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (window._invShadow) { clearInterval(iv); return; }
        window._invShadow = true;
        clearInterval(iv);

        const note = function (s) {
            const v = s.val();
            if (!v) { delete shadowInv[s.key]; return; }
            shadowInv[s.key] = asArr(v[INV]);
        };
        database.ref('users').on('child_added', note);
        database.ref('users').on('child_changed', note);
        database.ref('users').on('child_removed', function (s) { delete shadowInv[s.key]; });
        console.log('[병합] 남의 소지품 기준 지켜보기 시작');
    }, 700);
})();

// ==========================================
// 바뀐 것만 쓴다
// ==========================================
function diffPayload() {
    const out = {};
    Object.keys(currentUser).forEach(function (k) {
        if (SKIP.indexOf(k) >= 0) return;
        if (k === INV) return;                              // 소지품은 따로 병합한다
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
            if (currentUser.code !== code) return _full.apply(this, arguments);   // 계정이 어긋났다
            if (!ready) return _full.apply(this, arguments);   // 기준이 없으면 예전 방식

            const invJob = flushMyInv();                      // 소지품은 병합으로

            const payload = diffPayload();
            const n = Object.keys(payload).length;
            if (!n) return invJob;

            payload._adminStamp = Date.now();
            currentUser._adminStamp = payload._adminStamp;

            return Promise.all([
                invJob,
                database.ref('users/' + code).update(payload)
                    .then(function () { markSaved(payload); })
                    .catch(function (e) { console.error('[병합] 저장 실패:', e); })
            ]);
        };
        saveSelfFull._merge = true;

        // saveFields — 소지품만 빼내 병합으로 돌리고, 나머지는 원래대로
        if (typeof saveFields === 'function' && !saveFields._merge) {
            const _f = saveFields;
            saveFields = function (fields) {
                fields = fields || {};
                const wantsInv = !!fields[INV];
                const rest = {};
                Object.keys(fields).forEach(function (k) { if (k !== INV) rest[k] = fields[k]; });

                let r;
                if (Object.keys(rest).length) r = _f.call(this, rest);
                // 기준은 미리 찍지 않는다 — 서버가 받기 전에 찍으면
                // 날아오던 옛 값이 「내가 안 바꾼 것」으로 보여 늘어난 몫을 지운다

                if (wantsInv && ready && currentUser && currentUser.code === code) flushMyInv();
                else if (wantsInv) r = _f.call(this, fields);   // 기준이 없으면 예전 방식

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
        console.log('[병합] 바뀐 것만 쓰도록 바꿨습니다. (소지품은 더하고 빼기로)');
    }, 500);
})();

// ==========================================
// 남을 고쳤을 때 — 소지품은 역시 더하고 빼기로
// ==========================================
(function hookOther() {
    const iv = setInterval(function () {
        if (typeof updateUserFields !== 'function') return;
        if (updateUserFields._merge) { clearInterval(iv); return; }
        const _u = updateUserFields;

        updateUserFields = function (c, fields) {
            fields = fields || {};

            // 내 자리면 기존 흐름대로 (기준도 맞춰 둔다)
            if (!c || (currentUser && c === currentUser.code)) {
                const r = _u.apply(this, arguments);
                // 기준은 미리 찍지 않는다 (saveFields 와 같은 까닭)
                return r;
            }

            // 남의 소지품 — 서버에서 본 모습을 기준으로 더하고 뺀다
            const hasInv = Object.prototype.hasOwnProperty.call(fields, INV);
            const had = shadowInv[c];
            if (!hasInv || !had) return _u.apply(this, arguments);

            const want = asArr(fields[INV]);
            const rest = {};
            Object.keys(fields).forEach(function (k) { if (k !== INV) rest[k] = fields[k]; });
            rest._adminStamp = Date.now();

            const jobs = [_u.call(this, c, rest)];
            jobs.push(mergeInv('users/' + c + '/' + INV, had, want).then(function (after) {
                if (after === null) return null;
                shadowInv[c] = after.slice();
                if (db && db.users && db.users[c]) fillArr(db.users[c][INV] || (db.users[c][INV] = []), after);
                return after;
            }));
            return Promise.all(jobs);
        };
        updateUserFields._merge = true;
        clearInterval(iv);
    }, 500);
})();

setInterval(attach, 1000);

// 소지품은 조금 뒤처져도 되지만, 오래 묵히지는 않는다
setInterval(function () {
    if (!ready || !currentUser || invBusy) return;
    if (same(currentUser[INV], base[INV])) return;
    flushMyInv();
}, 4000);

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
    console.log('  updateUserFields 교체:', (typeof updateUserFields === 'function' && updateUserFields._merge) ? 'O' : '-');
};

window.invState = function () {
    console.log('%c===== 소지품 병합 =====', 'color:#d4af37; font-size:13px');
    const mine = asArr(currentUser && currentUser[INV]);
    const had = asArr(base[INV]);
    console.log('  내 소지품:', mine.length + '개 · 기준:', had.length + '개');
    const add = msDiff(mine, had), del = msDiff(had, mine);
    console.log('  아직 안 쓴 변화 — 늘어남:', add.join(', ') || '없음');
    console.log('                  줄어듦:', del.join(', ') || '없음');
    console.log('  지금까지 병합 ' + invStats.merged + '회 · 더함 ' + invStats.added
        + ' · 뺌 ' + invStats.removed + ' · 남과 겹친 적 ' + invStats.conflicts + '회');
    console.log('  남의 소지품 기준 보유:', Object.keys(shadowInv).length + '명');
};

// 서버 자료로 강제로 맞춘다
window.pullServer = function () {
    if (!database || !code) return;
    database.ref('users/' + code).once('value').then(function (s) {
        const v = s.val();
        if (!v) return;
        Object.keys(currentUser).forEach(function (k) { if (!(k in v)) delete currentUser[k]; });
        Object.keys(v).forEach(function (k) {
            if (k === INV) { fillArr(currentUser[INV] || (currentUser[INV] = []), v[k]); return; }
            currentUser[k] = clone(v[k]);
        });
        base = clone(v) || {};
        ready = true;
        if (typeof updateUI === 'function') updateUI();
        console.log('%c✓ 서버 자료로 맞췄습니다. 소지품 ' + asArr(currentUser[INV]).length + '개', 'color:#4CAF50');
    });
};

console.log('[병합] mergeState() · invState() · pullServer()');

})();