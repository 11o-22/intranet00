// ==========================================
// ★ 어둠 탐사 횟수 — 서버 한 곳에서 더하고 뺀다
// bundles.json 마지막 묶음, party-helper.js · save-merge.js · empty-null.js 보다 뒤
// ==========================================
//
// ■ 무엇이 일어나고 있었나 (2026-10-18 「가지 않아도 줄고 알아서 찬다」)
//
//   쓴 횟수(darkTries)와 그 날짜(darkDate)를 화면마다 **값 그대로** 써 올렸다.
//   여러 화면이 같은 칸을 덮어쓰니 이런 일이 났다.
//
//     · 켜 둔 채 잠든 화면(또는 PC)이 깨어나면, 서버 소식이 내려오기 전에
//       하루 넘김(dailyRollover · renderDarkness)이 먼저 돌았다. 그 화면은
//       아직 어제 날짜라 「새 날이다」 하고 darkTries = 0 을 써 올렸다.
//       다른 기기에서 오늘 쓴 횟수가 통째로 지워진다 → 알아서 찬다.
//     · 묵은 화면이 묵은 값에 +1 해서 올리면, 그 사이 다른 데서 바뀐 것
//       (철회 반환 · 아이템 · 충전 · 다른 기기의 탐사)이 덮였다 → 가지 않아도
//       줄거나, 쓴 것이 사라졌다.
//
// ■ 어떻게 두나
//
//   진짜 값은 darkUse/<사번> = { d: 날짜, n: 쓴 횟수 } 하나다. 사원 기록
//   (users/<사번>) 밖이라 통째 저장이 건드리지 못한다. 바꿀 때는 트랜잭션으로
//   **차이만큼만** 더하고 뺀다. 날짜가 바뀌어 있으면 그 자리에서 0 부터 센다.
//
//   예전 코드는 그대로 둔다 — 곳곳에서 currentUser.darkTries 를 +1 · −1 하고
//   저장한다. 여기서 그 「화면 값이 움직인 것」을 0.3초마다 보고 차이를
//   트랜잭션으로 보낸다. 대신 내 darkTries · darkDate 를 **값 그대로** 써
//   올리는 것은 길목(database.ref … update)에서 뺀다. 화면 값과 사원 기록의
//   칸은 여기서 진짜 값으로 맞춰 둔다 (다른 파일 · 상담사 화면이 읽는다).
//
//   이렇게 거른다.
//     · 화면 날짜가 어제로 돌아갔다      → 묵은 값이다. 진짜 값으로 되돌린다.
//     · 어제였다가 오늘 · 0 이 되었다    → 하루 넘김이다. 서버를 보고 맞춘다.
//     · 사원 기록에서 내려온 값과 같다   → 남(상담사 충전 · 아이템)이 쓴 것을
//                                           받아 온 것이다. 그쪽은 아래에서
//                                           darkUse 에도 같이 적으므로 그 값을 따른다.
//     · 그 밖에 오늘 날짜로 움직였다     → 내가 쓴 것이다. 차이를 보낸다.
//
//   남의 횟수를 고칠 때(updateUserFields 로 darkTries 를 쓰는 길 — 당국의 충전,
//   남에게 쓰는 「어둠 탐사 +n」)는 darkUse 에도 같은 값을 적는다.
//
// ■ 콘솔
//   darkCountState()   진짜 값 · 화면 값 · 보내는 중인 몫

(function darkCount() {

const NODE = 'darkUse';
let code = '';
let useRef = null, usrRefT = null, usrRefD = null;
let synced = null;        // 서버 darkUse { d, n }
let ready = false;        // synced 를 한 번이라도 받았나
let mirror = null;        // 화면에 맞춰 둔 { d, n } (d 는 늘 오늘)
let pend = 0;             // 아직 서버에 안 닿은 몫
let busy = false;
let lastLd = '';          // 바로 전에 본 화면 날짜
let boot = null;          // 붙을 때의 화면 값 (진짜 값을 받기 전에 움직인 것을 셈)
const usrSrv = { d: undefined, n: undefined };   // users/<나> 에 서버가 가진 값
let stripOff = 0;
const stat = { sent: 0, ignored: 0, imported: 0, rolled: 0 };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function today() { try { return getTodayStr(); } catch (e) { return ''; } }
function clockOk() { try { return typeof clockReady !== 'function' || clockReady(); } catch (e) { return true; } }
function view(s) {
    const t = today();
    return (s && s.d === t) ? { d: t, n: Math.max(0, Number(s.n) || 0) } : { d: t, n: 0 };
}

// 화면 값을 맞춘다
function put(v) {
    const me = u_();
    if (!me || !v) return;
    mirror = { d: v.d, n: v.n };
    me.darkDate = v.d;
    me.darkTries = v.n;
    lastLd = v.d;
}
// 사원 기록 칸도 맞춘다 (다른 화면 · 상담사가 읽는 자리)
function mirrorWrite(v) {
    const d = db_();
    if (!d || !code || !v) return;
    if (usrSrv.d === v.d && usrSrv.n === v.n) return;
    stripOff++;
    try { d.ref('users/' + code).update({ darkDate: v.d, darkTries: v.n }).catch(function () { }); }
    catch (e) { }
    finally { stripOff--; }
}
function repaint() {
    try {
        const box = document.getElementById('darkness-body');
        if (box && box.offsetParent && typeof renderDarkness === 'function'
            && !(typeof darkRun !== 'undefined' && darkRun)) renderDarkness();
    } catch (e) { }
}

// ==========================================
// 붙기 — 사원이 바뀌면 다시
// ==========================================
function unbind() {
    [useRef, usrRefT, usrRefD].forEach(function (r) { try { if (r) r.off(); } catch (e) { } });
    useRef = usrRefT = usrRefD = null;
    synced = null; ready = false; mirror = null; pend = 0; busy = false; boot = null;
    usrSrv.d = undefined; usrSrv.n = undefined;
}
function bind() {
    const me = u_(), d = db_();
    if (!me || !me.code || !d) { if (code) { unbind(); code = ''; } return; }
    if (code === me.code) return;
    unbind();
    if (!clockOk()) return;                         // 날짜를 서버 시계로 셀 수 있을 때
    code = me.code;
    const t = today();
    boot = { d: me.darkDate, n: Number(me.darkTries) || 0 };
    lastLd = me.darkDate || '';

    usrRefT = d.ref('users/' + code + '/darkTries');
    usrRefT.on('value', function (s) { const v = s.val(); usrSrv.n = (v == null) ? undefined : Number(v) || 0; });
    usrRefD = d.ref('users/' + code + '/darkDate');
    usrRefD.on('value', function (s) { usrSrv.d = s.val() || undefined; });

    useRef = d.ref(NODE + '/' + code);
    // 처음이면 지금 사원 기록 값으로 심는다 (이미 있으면 건드리지 않는다)
    useRef.transaction(function (cur) {
        if (cur && cur.d) return;
        return (boot.d === t) ? { d: t, n: boot.n } : { d: t, n: 0 };
    }).catch(function () { }).then(function () {
        if (code !== me.code || !useRef) return;
        useRef.on('value', function (s) {
            synced = s.val() || null;
            const first = !ready;
            ready = true;
            if (busy) return;                       // 보내는 중 — 끝나면 맞춘다
            if (first) {
                // 진짜 값을 받기 전에 화면에서 움직인 몫 (탐사 출발 등)
                const cu = u_();
                if (cu && boot && cu.darkDate === today()) {
                    const base0 = (boot.d === today()) ? boot.n : 0;
                    const moved = (Number(cu.darkTries) || 0) - base0;
                    if (moved) pend += moved;
                }
            }
            const v = view(synced);
            put({ d: v.d, n: Math.max(0, v.n + pend) });
            if (!pend) mirrorWrite(v);
            if (pend) flush();
            repaint();
        });
    });
}
setInterval(function () { try { bind(); } catch (e) { } }, 1000);

// ==========================================
// 보내기 — 차이만큼 트랜잭션
// ==========================================
function flush() {
    if (busy || !pend || !useRef) return;
    const delta = pend;
    pend = 0;
    busy = true;
    const t = today();
    useRef.transaction(function (cur) {
        const base = (cur && cur.d === t) ? Math.max(0, Number(cur.n) || 0) : 0;
        return { d: t, n: Math.max(0, base + delta) };
    }).then(function (r) {
        busy = false;
        stat.sent++;
        const v = view(r && r.snapshot ? r.snapshot.val() : synced);
        synced = r && r.snapshot ? r.snapshot.val() : synced;
        put({ d: v.d, n: Math.max(0, v.n + pend) });
        mirrorWrite(v);
        if (pend) flush();
        repaint();
    }).catch(function (e) {
        busy = false;
        pend += delta;                              // 다음에 다시
        console.warn('[횟수] 보내기 실패 — 다시 보냅니다', e && e.message);
        setTimeout(flush, 3000);
    });
}

// 화면 값이 움직였나 — 0.3초마다
setInterval(function () {
    try {
        const me = u_();
        if (!me || me.code !== code || !ready || !mirror) return;
        const t = today();
        if (!t) return;
        if (mirror.d !== t) { put(view(synced)); stat.rolled++; repaint(); return; }      // 날이 바뀌었다
        const ld = me.darkDate, ln = Number(me.darkTries) || 0;
        const prevLd = lastLd;
        lastLd = ld;
        if (ld === mirror.d && ln === mirror.n) return;                                // 그대로
        if (ld !== t) { put(mirror); stat.ignored++; return; }                          // 묵은 날짜 — 되돌린다
        if (prevLd !== t && ln === 0) { put(view(synced)); stat.rolled++; return; }      // 하루 넘김이 지운 것
        if (usrSrv.d === ld && usrSrv.n === ln) {                                       // 사원 기록에서 받아 온 값
            put({ d: mirror.d, n: mirror.n }); stat.imported++; return;
        }
        // 내가 쓴 것 — 차이를 보낸다
        const delta = ln - mirror.n;
        mirror.n = ln;
        pend += delta;
        flush();
    } catch (e) { }
}, 300);

// ==========================================
// 길목 — 내 darkTries · darkDate 를 값 그대로 써 올리는 것은 뺀다
// ==========================================
function cut(obj, p) {
    if (stripOff || !code || !obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    let out = obj, hit = false;
    function drop(k) {
        if (!Object.prototype.hasOwnProperty.call(out, k)) return;
        if (!hit) { out = Object.assign({}, obj); hit = true; }
        delete out[k];
    }
    if (p === '') {
        drop('users/' + code + '/darkTries');
        drop('users/' + code + '/darkDate');
        drop('/users/' + code + '/darkTries');
        drop('/users/' + code + '/darkDate');
    } else if (p === 'users/' + code) {
        drop('darkTries');
        drop('darkDate');
    }
    return out;
}
(function hookRef() {
    const iv = setInterval(function () {
        const d = db_();
        if (!d || typeof d.ref !== 'function') return;
        if (d._darkCount) { clearInterval(iv); return; }
        const _ref = d.ref.bind(d);
        d.ref = function () {
            const r = _ref.apply(null, arguments);
            if (!r || r._darkCount || typeof r.update !== 'function') return r;
            const p = String(arguments[0] == null ? '' : arguments[0]).replace(/^\/+|\/+$/g, '');
            if (p !== '' && p.indexOf('users/') !== 0) return r;
            const _up = r.update.bind(r);
            r.update = function (obj, done) { return _up(cut(obj, p), done); };
            r._darkCount = true;
            return r;
        };
        d._darkCount = true;
        clearInterval(iv);
        console.log('[횟수] 어둠 탐사 횟수를 서버 한 곳(darkUse)에서 셉니다 — darkCountState()');
    }, 300);
})();

// 하루 넘김 앞에서 — 화면 날짜가 묵어 있으면 진짜 값으로 먼저 맞춘다
//   (화면 날짜만 어제로 돌아간 때 그 둘이 「새 날」로 보고 0 을 적지 않게)
(function hookRoll() {
    function guard(name) {
        const f = window[name];
        if (typeof f !== 'function' || f._darkCount) return;
        const w = function () {
            try {
                const me = u_();
                if (me && me.code === code && ready && mirror && mirror.d === today() && me.darkDate !== mirror.d) put(mirror);
            } catch (e) { }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._darkCount = true;
        try { window[name] = w; } catch (e) { }
    }
    setInterval(function () { guard('dailyRollover'); guard('renderDarkness'); }, 1500);
})();

// 남의 횟수를 고칠 때 — darkUse 에도 같이 적는다 (당국 충전 · 「어둠 탐사 +n」)
(function hookOther() {
    setInterval(function () {
        if (typeof updateUserFields !== 'function' || updateUserFields._darkCount) return;
        const _u = updateUserFields;
        const w = function (c, fields) {
            try {
                const me = u_(), d = db_();
                if (d && c && fields && Object.prototype.hasOwnProperty.call(fields, 'darkTries')
                    && !(me && c === me.code)) {
                    const t = today();
                    const dd = fields.darkDate || t;
                    d.ref(NODE + '/' + c).set({ d: dd, n: Math.max(0, Number(fields.darkTries) || 0) })
                        .catch(function () { });
                }
            } catch (e) { }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._darkCount = true;
        updateUserFields = w;
        try { window.updateUserFields = w; } catch (e) { }
    }, 1500);
})();

window.darkCountState = function () {
    const me = u_();
    console.log('%c===== 어둠 탐사 횟수 =====', 'color:#ff8a80; font-size:13px');
    console.log('  진짜 값 (darkUse) :', synced ? JSON.stringify(synced) : (ready ? '없음' : '받는 중'));
    console.log('  화면 값           :', me ? (me.darkDate + ' · ' + me.darkTries + '회') : '-',
        '· 남은 ' + ((typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft() : '?') + '회');
    console.log('  보내는 중         :', pend, busy ? '(가는 중)' : '');
    console.log('  사원 기록 칸      :', usrSrv.d, usrSrv.n);
    console.log('  보낸 · 묵은 값 되돌림 · 받아 옴 · 하루 넘김 :', stat.sent, stat.ignored, stat.imported, stat.rolled);
};

})();
