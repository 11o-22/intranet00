// ==========================================
// ★ 남의 장착칸을 통째로 덮어쓰지 않는다
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 일어났나
//
//   A 가 B 에게 황룡의 눈을 쓰고 돌려줬는데 B 의 장착칸이 텅 비었다.
//
//   빼앗기와 돌려주기가 둘 다 「A 의 화면에 들고 있는 B 의 배열」을 통째로
//   서버에 덮어쓰고 있었다.
//
//       newitems2.js:1179   빼앗을 때
//           updateUserFields(target.code, {
//               equippedWeapons: target.equippedWeapons || [],   ← 통째
//               equipOwner:      target.equipOwner || {},
//               gearLock:        target.gearLock || {}
//           });
//
//       newitems2.js:1262   돌려줄 때
//           const te = t.equippedWeapons || [];                  ← 여기서 이미
//           ...                                                     []가 될 수 있다
//           updateUserFields(t.code, { equippedWeapons: t.equippedWeapons, ... });
//
//   target 은 db.users[코드] 다. 즉 **내 화면이 들고 있는 남의 사본**이다.
//   그 사본에 equippedWeapons 가 아직 안 들어와 있으면 `|| []` 가 빈 배열을
//   만들고, 거기에 돌려줄 것 하나만 밀어 넣어 서버에 쓴다. B 의 장착칸에는
//   돌려받은 것 하나만 남고 나머지는 사라진다. 그게 「텅텅 비는」 것이다.
//
//   사본이 멀쩡해도, 읽고 쓰는 사이에 B 가 무엇을 차거나 벗으면 그만큼
//   지워진다. 돈·물약이 사라졌던 것과 같은 생김새다.
//
// ■ 어떻게 고치나
//
//   배열을 보내지 않는다. 「무엇을 빼고 무엇을 넣어라」만 보낸다.
//   서버에 있는 값에 그 하나만 적용하므로, 사본이 비어 있든 그 사이 B 가
//   무엇을 차든 나머지는 건드려지지 않는다.
//
//       gearPull(코드, [라벨...], 잠금)      빼앗을 때
//       gearPush(코드, 라벨, 주인, 봉인라벨)  돌려줄 때
//
//   newitems2.js 는 이 함수가 있으면 쓰고, 없으면 예전 길로 간다.
//
// ■ 확인
//
//   gearMoveState()      연결됐는지 · 몇 번 썼는지
//   gearOf(사번)         그 사원의 장착칸을 서버에서 바로 읽는다

(function gearMove() {

const EQW = 'equippedWeapons', OWN = 'equipOwner', LOCK = 'gearLock';
const stats = { pull: 0, push: 0, fail: 0 };

function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function txn(path, fn) {
    if (typeof database === 'undefined' || !database) return Promise.resolve(false);
    return database.ref(path).transaction(fn, null, false)
        .then(function (r) { return !!(r && r.committed); })
        .catch(function (e) { stats.fail++; console.error('[장착칸] ' + path, e); return false; });
}

// ==========================================
// 빼앗는다 — 적은 라벨만 뺀다
// ==========================================
window.gearPull = function (code, labels, locks) {
    if (!code) return Promise.resolve(false);
    const take = (labels || []).filter(Boolean);
    if (!take.length && !locks) return Promise.resolve(false);
    stats.pull++;

    const jobs = [];
    if (take.length) {
        jobs.push(txn('users/' + code + '/' + EQW, function (srv) {
            const cur = arr(srv);
            take.forEach(function (l) {
                const i = cur.indexOf(l);
                if (i >= 0) cur.splice(i, 1);          // 하나만 뺀다
            });
            return cur;
        }));
        jobs.push(txn('users/' + code + '/' + OWN, function (srv) {
            const o = (srv && typeof srv === 'object') ? srv : {};
            take.forEach(function (l) { delete o[l]; });
            return o;
        }));
    }
    if (locks && Object.keys(locks).length) {
        jobs.push(txn('users/' + code + '/' + LOCK, function (srv) {
            const o = (srv && typeof srv === 'object') ? srv : {};
            Object.keys(locks).forEach(function (k) { o[k] = locks[k]; });
            return o;
        }));
    }
    return Promise.all(jobs).then(function () {
        if (typeof database !== 'undefined' && database) {
            database.ref('users/' + code + '/_adminStamp').set(Date.now());
        }
        return true;
    });
};

// ==========================================
// 돌려준다 — 봉인판이 있으면 풀고, 없으면 하나 넣는다
// ==========================================
window.gearPush = function (code, label, owner, sealed, unlockBase) {
    if (!code || !label) return Promise.resolve(false);
    stats.push++;

    const jobs = [];
    jobs.push(txn('users/' + code + '/' + EQW, function (srv) {
        const cur = arr(srv);
        if (sealed) {
            const si = cur.indexOf(sealed);
            if (si >= 0) { cur[si] = label; return cur; }    // 봉인을 푼다
        }
        if (cur.indexOf(label) < 0) cur.push(label);         // 없으면 넣는다
        return cur;
    }));
    jobs.push(txn('users/' + code + '/' + OWN, function (srv) {
        const o = (srv && typeof srv === 'object') ? srv : {};
        if (sealed && o[sealed] != null) { o[label] = o[sealed]; delete o[sealed]; }
        else if (owner != null) o[label] = owner;
        return o;
    }));
    if (unlockBase) {
        jobs.push(txn('users/' + code + '/' + LOCK, function (srv) {
            const o = (srv && typeof srv === 'object') ? srv : {};
            delete o[unlockBase];
            return o;
        }));
    }
    return Promise.all(jobs).then(function () {
        if (typeof database !== 'undefined' && database) {
            database.ref('users/' + code + '/_adminStamp').set(Date.now());
        }
        return true;
    });
};

// ==========================================
// 마지막 빗장 — 남의 장착칸을 통째로 쓰려는 것을 막는다
// ==========================================
//
// 아직 못 찾은 자리가 남아 있을 수 있다. 남의 equippedWeapons 를 통째로
// 쓰려 할 때, 서버에 있는 것보다 **줄어들면** 그 쓰기를 버리고 콘솔에
// 어디서 불렀는지 남긴다. 늘어나는 쓰기는 그대로 둔다.
const refused = [];
(function guard() {
    const iv = setInterval(function () {
        if (typeof updateUserFields !== 'function') return;
        if (updateUserFields._gearGuard) { clearInterval(iv); return; }
        const _u = updateUserFields;
        const wrapped = function (code, fields) {
            fields = fields || {};
            const mine = currentUser && code === currentUser.code;
            const has = Object.prototype.hasOwnProperty.call(fields, EQW);
            if (!has || mine || typeof database === 'undefined' || !database) {
                return _u.apply(this, arguments);
            }
            const want = arr(fields[EQW]);
            const self = this, args = arguments;
            // 서버에 있는 것을 보고 나서 정한다
            return database.ref('users/' + code + '/' + EQW).once('value').then(function (s) {
                const srv = arr(s.val());
                if (want.length >= srv.length) return _u.apply(self, args);
                // 줄어든다 — 버린다
                let where = '';
                try {
                    where = ((new Error()).stack || '').split('\n').slice(2, 5)
                        .map(function (x) { return x.trim().replace(/^at\s+/, ''); })
                        .filter(function (x) { return x.indexOf('gear-move') < 0; })
                        .join('  ←  ');
                } catch (e) { }
                refused.push({ 때: new Date().toLocaleTimeString(), 사원: code,
                               서버: srv.length + '칸', 쓰려던것: want.length + '칸', 자리: where });
                while (refused.length > 40) refused.shift();
                console.warn('%c[장착칸] ' + code + ' 의 장착칸을 ' + srv.length
                    + '칸 → ' + want.length + '칸으로 덮어쓰려 해서 막았습니다.', 'color:#ff8a65');
                if (where) console.warn('         부른 자리: ' + where);
                // 장착칸과 **주인 기록**을 빼고 나머지는 그대로 쓴다.
                //
                //   주인 기록(equipOwner)은 장착칸과 한 쌍이다. 장착칸만 막고
                //   주인 기록을 통과시키면, 물건은 남는데 주인만 사라져
                //   「남이 채운 것을 본인이 뺄 수 있는」 상태가 된다.
                //   (gear-own.js 에 적어 두었다)
                const rest = {};
                Object.keys(fields).forEach(function (k) {
                    if (k === EQW || k === OWN) return;
                    rest[k] = fields[k];
                });
                if (!Object.keys(rest).length) return null;
                return _u.call(self, code, rest);
            });
        };
        wrapped._gearGuard = true;
        updateUserFields = wrapped;
        clearInterval(iv);
        console.log('[장착칸] 남의 장착칸 통째 쓰기 빗장 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.gearMoveState = function () {
    console.log('%c===== 장착칸 옮기기 =====', 'color:#ff8a65; font-size:13px');
    console.log('  gearPull/gearPush:', (typeof gearPull === 'function' && typeof gearPush === 'function') ? 'O' : '✗');
    console.log('  빗장:', (typeof updateUserFields === 'function' && updateUserFields._gearGuard) ? 'O' : '✗');
    console.log('  빼앗기', stats.pull + '번 · 돌려주기', stats.push + '번 · 실패', stats.fail + '번');
    if (!refused.length) { console.log('  막은 쓰기: 없음'); return; }
    console.table(refused.slice(-20));
    console.log('  「자리」에 적힌 파일이 아직 통째로 쓰는 쪽입니다.');
};

window.gearOf = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    database.ref('users/' + u.code + '/' + EQW).once('value').then(function (s) {
        const srv = arr(s.val());
        console.log('%c===== ' + u.name + ' 의 장착칸 =====', 'color:#ff8a65; font-size:13px');
        console.log('  서버:', srv.length + '칸 —', srv.join(' · ') || '없음');
        const loc = arr(u.equippedWeapons);
        console.log('  내 화면 사본:', loc.length + '칸 —', loc.join(' · ') || '없음');
        if (srv.length !== loc.length) {
            console.warn('  둘이 다릅니다. 사본으로 통째 쓰기를 하면 서버 쪽이 사라집니다.');
        }
    });
};

console.log('[장착칸] gearMoveState() · gearOf(사번)');

})();
