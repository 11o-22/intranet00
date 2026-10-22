// ==========================================
// ★ 특이사항과 임신을 통째로 덮어쓰지 않는다
// bundles.json 마지막 묶음, save-merge.js · empty-null.js 보다 뒤
// ==========================================
//
// ■ 임신이 되돌아가고 특이사항이 사라지던 까닭
//
//   남을 임신시키는 자리는 이렇게 적는다. (pregnancy.js:320~325)
//
//       const t = db.users[code];              ← 내 화면에 있는 사본
//       const p = pregOf(t) || { sires: [] };  ← 그 사본의 임신
//       p.sires.push({ code: 나, … });
//       t.preg = p;
//       appendBadgeNoteToUser(t, '[… 임신했습니다]');
//       updateUserFields(code, { preg: p, badge: t.badge, … });
//                                ~~~~~~~  ~~~~~~~~~~~~~
//                                둘 다 **통째**로 쓴다
//
//   사본은 늘 서버보다 한 박자 늦다. 아버지가 둘 붙으면 —
//
//       가의 창 : 아버지 [가]   → 서버에 적는다
//       다의 창 : 아버지 [다]   → 제 사본엔 가가 없다. 적는다.
//       서버    : 아버지 [다]        ← 가가 **통째로 지워졌다**
//       특이사항: [다 … 임신했습니다]  ← 가의 줄도 같이 사라졌다
//
//   아버지만이 아니다. 특이사항을 통째로 쓰는 길은 열두 군데가 넘는다
//   (클레·여우 꼬리·우리·명찰·출산품·상담사 회수 …). 어느 하나가
//   한 박자 늦은 사본으로 쓰면, 그 사이에 적힌 줄이 전부 날아간다.
//   닉네임·성별·사원증 한 줄도 같은 꾸러미에 실려 되돌아간다.
//
// ■ 어떻게 고치나 — 소지품에 쓰던 방식 그대로
//
//   값을 덮어쓰지 않고 **움직인 몫만** 트랜잭션으로 보낸다.
//
//       특이사항 : 줄 단위로 센다. 쓰는 쪽이 더한 줄은 넣고, 지운 줄은 뺀다.
//       임신     : 아버지 단위로 센다 (사번 + 붙은 때로 가린다).
//       그 밖의 칸 : 쓰는 쪽이 **바꾼 칸만** 보낸다. 안 바꾼 칸은 서버 것을 둔다.
//
//   기준은 「서버에서 마지막으로 본 모습」이다 (save-merge 의 shadow 와 같다).
//
//   ★ 더하기만 하는 쓰기는 **아무것도 지우지 않는다.**
//
//     쓰는 쪽이 들고 있던 사본이 기준보다도 묵었을 수 있다 (카드를 열어 두고
//     한참 뒤에 눌렀을 때). 그러면 「기준에는 있는데 내 것에는 없는 줄」이
//     생기는데, 그것은 내가 지운 것이 아니라 그 사이에 **생긴** 줄이다.
//     그래서 더한 줄이 있고 지운 줄이 없는 쓰기는 더하기만 한다.
//     진짜로 지우는 쪽(출산·회수·초기화)은 줄이 줄어들므로 가려진다.
//
// ■ 어디를 지나가나
//
//     users/<사번>        .update({ badge, preg, … })   ← updateUserFields · saveSelfFull
//     /                   .update({ 'users/<사번>/badge': … })  ← save-merge 가 바꿔 쓴 꼴
//
//   깊은 자리(users/<사번>/badge/line 처럼)는 뜻이 있는 쓰기이므로 손대지 않는다.
//
// ■ 콘솔
//   noteMergeState()   몇 번 합쳤나 · 무엇을 지켜 냈나
//   noteMergeLog()     합친 자리를 차례로

(function noteMerge() {

const USERNODE = /^users\/([^/]+)$/;
const ROOTKEY = /^users\/([^/]+)\/(badge|preg)$/;
const NONE = '특이사항 없음';
const SPLIT = /\s*\|\s*|<br\s*\/?>|\n/;

const shadow = {};        // 사번 → { badge, preg } — 서버에서 마지막으로 본 모습
const LOG = [];
const KEEP = 40;
const stats = { badge: 0, preg: 0, lineKept: 0, lineAdded: 0, lineCut: 0, lineSaved: 0,
                sireKept: 0, sireAdded: 0, fieldKept: 0 };

function clone(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return undefined; } }
function same(a, b) { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } }
function obj(v) { return (v !== null && typeof v === 'object' && !Array.isArray(v)) ? v : null; }
function asArr(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return x !== null && x !== undefined; });
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; })
        .filter(function (x) { return x !== null && x !== undefined; });
    return [];
}
// a 에는 있는데 b 에는 없는 것 (개수 차이만큼) — 소지품 병합과 같은 셈
function msDiff(a, b, key) {
    const k = key || function (x) { return String(x); };
    const cnt = {};
    b.forEach(function (x) { const s = k(x); cnt[s] = (cnt[s] || 0) + 1; });
    const out = [];
    a.forEach(function (x) {
        const s = k(x);
        if (cnt[s] > 0) { cnt[s]--; return; }
        out.push(x);
    });
    return out;
}

function note(at, what) {
    LOG.unshift({ 때: new Date().toLocaleTimeString(), 자리: at, 한일: what });
    if (LOG.length > KEEP) LOG.pop();
}

// ==========================================
// 특이사항 — 줄 단위
// ==========================================
function lines(v) {
    if (v === null || v === undefined) return [];
    const s = String(v);
    if (!s.trim()) return [];
    return s.split(SPLIT).map(function (t) { return t.trim(); })
        .filter(function (t) { return t && t !== NONE; });
}
function joinLines(a) { return a.length ? a.join(' | ') : NONE; }

// badge 는 객체인 것이 보통이지만, 묵은 자료에는 글자인 것도 있다
function notesOf(b) {
    if (b === null || b === undefined) return undefined;
    if (typeof b === 'string') return b;
    const o = obj(b);
    if (!o) return undefined;
    if (typeof o.notes === 'string') return o.notes;
    if (typeof o.note === 'string') return o.note;
    return undefined;
}
function hasNotes(b) {
    if (typeof b === 'string') return true;
    const o = obj(b);
    return !!(o && (('notes' in o) || ('note' in o)));
}

// ==========================================
// 트랜잭션 — save-merge 가 내놓은 것이 있으면 그것을 쓴다 (maxretry 를 버틴다)
// ==========================================
function tx(path, fn) {
    if (typeof window.txRetry === 'function') return window.txRetry(path, fn);
    return database.ref(path).transaction(fn, null, false);
}

// ==========================================
// badge 를 합친다
// ==========================================
// 상담사가 남의 사원증을 통째로 고쳐야 할 때 한 번만 열어 주는 문
const gate = {};
window.noteMergeFull = function (code, ms) {
    if (!code) { console.warn('사번을 적어 주십시오.'); return; }
    gate[code] = Date.now() + (Number(ms) || 8000);
    console.log('[특이사항] ' + code + ' 의 사원증을 통째로 한 번 받습니다 ('
        + Math.round((Number(ms) || 8000) / 1000) + '초)');
};
function opened(code) {
    const t = gate[code];
    if (!t || Date.now() > t) return false;
    delete gate[code];                      // 한 번 쓰면 닫는다
    return true;
}

function mergeBadge(code, want) {
    const mine = !!(typeof currentUser !== 'undefined' && currentUser && currentUser.code === code);
    const base = (shadow[code] || {}).badge;
    const wStr = (typeof want === 'string');
    // 엉뚱한 값(깃발·숫자)이 실려 오면 아무것도 안 한다 — 서버 것을 지키는 쪽이 낫다
    if (!wStr && !obj(want)) {
        if (want !== null && want !== undefined) {
            console.warn('[특이사항] 사원증 자리에 엉뚱한 값이 왔습니다 — 건너뜁니다:', want);
        }
        return Promise.resolve(null);
    }
    const wide = mine || opened(code);        // 통째로 받을 자리인가 (트랜잭션 밖에서 한 번만 본다)
    const wObj = obj(want) || {};
    const bObj = obj(base) || {};

    const wNotes = notesOf(want);
    const bNotes = notesOf(base);
    const touchNotes = hasNotes(want);

    return tx('users/' + code + '/badge', function (srv) {
        // 서버 쪽이 글자면 객체로 세워 둔다 (이쪽이 지금 꼴이다)
        const sObj = (typeof srv === 'string') ? { notes: srv } : (obj(srv) || {});
        const out = {};
        Object.keys(sObj).forEach(function (k) { out[k] = sObj[k]; });

        // ① notes 가 아닌 칸 — 내 사원증일 때만 보낸다
        //
        //   ★ 남의 사원증은 **특이사항만** 받는다.
        //
        //     남의 사원증을 고치는 자리는 전부 줄만 건드린다. 나머지는
        //     Object.assign({}, u.badge) 로 그냥 베껴 실어 보낼 뿐이다
        //     (index.html:10381 · 6520 · 6566, 클레 · 여우 꼬리 · 우리 …).
        //     그 사본이 한 박자 묵으면 **성별·닉네임·사진·사원증 한 줄이
        //     옛 것으로 되돌아간다.** 보낸 값과 묵은 값은 가릴 길이 없으니
        //     (둘 다 「기준과 다른 값」이다) 애초에 안 받는다.
        //
        //     닉네임·성별·한 줄은 본인 창에서만 바꾼다. 상담사가 남의 것을
        //     통째로 고쳐야 할 때는 noteMergeFull(사번) 으로 한 번 열어 준다.
        if (!wStr && wide) {
            Object.keys(wObj).forEach(function (k) {
                if (k === 'notes' || k === 'note') return;
                if (same(wObj[k], bObj[k])) { stats.fieldKept++; return; }   // 안 바꿨다
                out[k] = wObj[k];
            });
            // 기준에는 있었는데 쓰는 쪽에서 아예 없어진 칸 = 일부러 지운 것
            Object.keys(bObj).forEach(function (k) {
                if (k === 'notes' || k === 'note') return;
                if (Object.prototype.hasOwnProperty.call(wObj, k)) return;
                if (same(sObj[k], bObj[k])) delete out[k];
            });
        }

        // ② notes — 줄 단위로 합친다
        if (touchNotes) {
            const w = lines(wNotes), b = lines(bNotes), s = lines(notesOf(sObj));
            const add = msDiff(w, b);
            const del = msDiff(b, w);
            let next;
            // ★ 더하는 쓰기는 **아무것도 지우지 않는다.**
            //
            //   줄을 더하면서 동시에 빼는 쓰기는 이 게임에 없다. 더하는 자리는
            //   appendBadgeNoteToUser 로 뒤에 붙이기만 하고(클레·여우 꼬리·임신 ·
            //   노예 계약 …), 지우는 자리는 줄을 골라 빼기만 한다(출산 · 장비
            //   회수 · 특이사항 초기화 · 우리 풀림). 그래서 둘이 한꺼번에 보이면
            //   그것은 뜻이 아니라, 쓰는 쪽 사본이 묵어서 그 사이에 **생긴** 줄이
            //   「내가 지운 줄」로 보이는 것이다. 더하기만 한다.
            if (add.length) {
                // ★ 서버에 이미 같은 줄이 있다고 더할 줄을 버리면 안 된다 (2026-10-23)
                //   ✗ 전에는 msDiff(add, s) — 서버에 같은 글자의 줄이 **하나라도** 있으면 더하지 않았다.
                //     그래서 어제 먹은 디저트 줄이 아직 있을 때 자정 지나 같은 디저트를 또 먹으면
                //     「[디저트] 판정 +2 (24시간)」 두 번째 줄이 통째로 버려졌다 (같은 글자 줄이 둘인 것은 다 그렇다).
                //   서버에 **기준보다 더 생긴 몫**(같은 쓰기가 두 번 실려 온 것 — 저장이 잇달아 불릴 때)만 빼고 더한다.
                next = s.concat(msDiff(add, msDiff(s, b)));
                if (del.length) stats.lineSaved += del.length;
            } else {
                const keep = s.slice();
                del.forEach(function (x) { const i = keep.indexOf(x); if (i >= 0) keep.splice(i, 1); });
                next = keep;
                stats.lineCut += del.length;
            }
            stats.lineKept += msDiff(s, w).length;      // 쓰는 쪽은 몰랐는데 살아남은 줄
            stats.lineAdded += add.length;
            out.notes = joinLines(next);
            if ('note' in out) delete out.note;         // 한 자리로 모은다
        }

        if (!Object.keys(out).length) return null;
        return out;
    }).then(function (r) {
        stats.badge++;
        return r;
    }).catch(function (e) {
        console.error('[특이사항] 합쳐 쓰기 실패 — 그대로 보냅니다:', e);
        return database.ref('users/' + code + '/badge').set(want);
    });
}

// ==========================================
// preg 를 합친다
// ==========================================
function sireKey(s) {
    return String((s && s.code) || '') + '|' + String((s && s.at) || '');
}
function mergePreg(code, want) {
    if (want !== null && want !== undefined && !obj(want)) {
        console.warn('[임신] 엉뚱한 값이 왔습니다 — 건너뜁니다:', want);
        return Promise.resolve(null);
    }
    const base = (shadow[code] || {}).preg;
    const bS = asArr(base && base.sires);
    const wObj = obj(want);
    const wS = asArr(wObj && wObj.sires);
    const clearing = !wObj || !wS.length;

    return tx('users/' + code + '/preg', function (srv) {
        const sObj = obj(srv) || {};
        const sS = asArr(sObj.sires);

        // ㉠ 비우는 쓰기 (출산 · 유산)
        if (clearing) {
            const bk = bS.map(sireKey);
            const left = sS.filter(function (s) { return bk.indexOf(sireKey(s)) < 0; });
            if (!left.length) return null;              // 알던 아버지가 전부다 — 비운다
            // 쓰는 쪽이 모르던 아버지가 그 사이에 붙었다 — 그쪽은 남긴다
            stats.sireKept += left.length;
            const o = {};
            Object.keys(sObj).forEach(function (k) { o[k] = sObj[k]; });
            o.sires = left;
            return o;
        }

        // ㉡ 아버지를 더하는 쓰기
        //
        //   ★ 아버지는 **빼지 않는다.**
        //
        //     아버지를 한 명만 떼어 내는 길은 이 게임에 없다. 낳거나 유산하면
        //     preg 가 통째로 비고(㉠), 그 밖에는 push 뿐이다 (pregnancy.js:314 ·
        //     preg-v2.js:306). 그러니 「기준에는 있고 내 것에는 없는 아버지」는
        //     내가 뺀 것이 아니라 **그 사이에 붙은** 아버지다. 그대로 둔다.
        const add = msDiff(wS, bS, sireKey);
        const list = sS.slice();
        const have = list.map(sireKey);
        add.forEach(function (a) {
            const k = sireKey(a);
            if (have.indexOf(k) >= 0) return;
            list.push(a); have.push(k);
        });
        stats.sireAdded += add.length;
        stats.sireKept += Math.max(0, msDiff(sS, wS, sireKey).length);
        if (!list.length) return null;

        const out = {};
        Object.keys(sObj).forEach(function (k) { out[k] = sObj[k]; });
        // 나머지 칸(due · kleeHalf · careAt …) — 쓰는 쪽이 바꾼 것만
        Object.keys(wObj).forEach(function (k) {
            if (k === 'sires') return;
            if (same(wObj[k], base ? base[k] : undefined)) return;
            out[k] = wObj[k];
        });
        out.sires = list;
        if (!out.due) out.due = wObj.due || sObj.due || (Date.now() + 24 * 3600000);
        return out;
    }).then(function (r) {
        stats.preg++;
        return r;
    }).catch(function (e) {
        console.error('[임신] 합쳐 쓰기 실패 — 그대로 보냅니다:', e);
        return database.ref('users/' + code + '/preg').set(want === undefined ? null : want);
    });
}

// ==========================================
// 꾸러미에서 badge · preg 를 빼내 따로 보낸다
// ==========================================
function split(pairs) {
    // pairs : [ [사번, 'badge'|'preg', 값] … ]
    return pairs.map(function (x) {
        const code = x[0], kind = x[1], v = x[2];
        if (!code) return null;
        try {
            note('users/' + code + '/' + kind, kind === 'badge' ? '줄 단위로 합침' : '아버지 단위로 합침');
            return (kind === 'badge') ? mergeBadge(code, v) : mergePreg(code, v);
        } catch (e) {
            console.error('[특이사항] 합치는 중에 터졌습니다:', e);
            return null;
        }
    }).filter(Boolean);
}

const iv = setInterval(function () {
    if (typeof database === 'undefined' || !database) return;
    if (database._noteMerge) { clearInterval(iv); return; }
    if (typeof database.ref !== 'function') return;

    const _ref = database.ref.bind(database);
    database.ref = function () {
        const r = _ref.apply(null, arguments);
        const p = String(arguments[0] == null ? '' : arguments[0]).replace(/^\/+|\/+$/g, '');
        if (!r || typeof r.update !== 'function' || r._noteMerge) return r;

        const m = USERNODE.exec(p);
        if (p !== '' && !m) return r;                   // 깊은 자리는 뜻이 있는 쓰기다

        const _up = r.update.bind(r);
        r.update = function (o, done) {
            if (!o || typeof o !== 'object' || Array.isArray(o)) return _up(o, done);

            const pairs = [];
            const rest = {};
            Object.keys(o).forEach(function (k) {
                if (m) {                                 // users/<사번> 에 쓰는 꼴
                    if (k === 'badge' || k === 'preg') { pairs.push([m[1], k, o[k]]); return; }
                    rest[k] = o[k];
                    return;
                }
                const rk = ROOTKEY.exec(String(k).replace(/^\/+/, ''));   // 루트에 전체 경로로 쓰는 꼴
                if (rk) { pairs.push([rk[1], rk[2], o[k]]); return; }
                rest[k] = o[k];
            });

            if (!pairs.length) return _up(o, done);

            const jobs = split(pairs);
            const keys = Object.keys(rest);
            // _adminStamp 만 남았어도 그것은 보낸다 (받는 쪽이 바뀐 것을 안다)
            if (keys.length) jobs.push(_up(rest, done));
            else if (typeof done === 'function') Promise.all(jobs).then(function () { done(null); },
                                                                       function (e) { done(e); });
            return Promise.all(jobs);
        };
        r._noteMerge = true;
        return r;
    };
    database._noteMerge = true;

    // 기준 — 서버에서 마지막으로 본 모습
    const take = function (s) {
        const v = s.val();
        if (!v) { delete shadow[s.key]; return; }
        shadow[s.key] = { badge: clone(v.badge), preg: clone(v.preg) };
    };
    database.ref('users').on('child_added', take);
    database.ref('users').on('child_changed', take);
    database.ref('users').on('child_removed', function (s) { delete shadow[s.key]; });

    clearInterval(iv);
    console.log('[특이사항] 통째로 덮어쓰지 않게 바꿨습니다 — noteMergeState()');
}, 300);
setTimeout(function () { clearInterval(iv); }, 40000);

// ==========================================
// 콘솔
// ==========================================
window.noteMergeState = function () {
    console.log('%c===== 특이사항 · 임신 합쳐 쓰기 =====', 'color:#ff8fb1; font-size:13px');
    console.log('  연결 :', database && database._noteMerge ? 'O' : '✗',
        '· 기준을 들고 있는 사원', Object.keys(shadow).length + '명');
    console.log('  특이사항 합친 횟수 ' + stats.badge + ' · 임신 ' + stats.preg);
    console.log('  줄 — 더한 ' + stats.lineAdded + ' · 지운 ' + stats.lineCut
        + ' · 통째 쓰기에서 지켜 낸 ' + stats.lineKept
        + ' · 묵은 사본이 지울 뻔한 것을 막은 ' + stats.lineSaved);
    console.log('  아버지 — 더한 ' + stats.sireAdded + ' · 지켜 낸 ' + stats.sireKept);
    console.log('  안 바꿨다고 보고 서버 것을 둔 칸 ' + stats.fieldKept + '개 (성별·닉네임·사원증 한 줄 …)');
    const me = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.code : null;
    if (me && shadow[me]) {
        console.log('  내 기준 — 특이사항 「' + (notesOf(shadow[me].badge) || '(없음)') + '」'
            + ' · 아버지 ' + asArr(shadow[me].preg && shadow[me].preg.sires).length + '명');
    }
};

// 들여다보기 — 기준이 묵었는지 볼 때
window._noteMerge = { shadow: shadow, stats: stats, lines: lines, sireKey: sireKey };

window.noteMergeLog = function () {
    console.log('%c===== 합친 자리 =====', 'color:#ff8fb1; font-size:13px');
    if (!LOG.length) { console.log('  아직 없습니다.'); return; }
    console.table(LOG);
};

// 지금 서버에 적힌 내 특이사항을 그대로 본다
window.noteNow = function (who) {
    const c = who || ((typeof currentUser !== 'undefined' && currentUser) ? currentUser.code : null);
    if (!c || !database) { console.warn('사번을 모르겠습니다.'); return; }
    database.ref('users/' + c + '/badge').once('value').then(function (s) {
        const v = s.val();
        console.log('%c===== ' + c + ' 의 사원증 =====', 'color:#ff8fb1; font-size:13px');
        lines(notesOf(v)).forEach(function (l, i) { console.log('  ' + (i + 1) + '. ' + l); });
        if (!lines(notesOf(v)).length) console.log('  특이사항 없음');
        console.log('  그 밖의 칸 :', Object.keys(obj(v) || {}).filter(function (k) {
            return k !== 'notes' && k !== 'note';
        }).join(', ') || '(없음)');
    });
};

})();
