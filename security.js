// ==========================================
// ★ 🛡 보안 — 콘솔로 손대는 것 막기 · 적발 (2026-11-05 사용자 「코드 콘솔로 안 까이게 보안 좀 강화시키자」)
// bundles.json 첫 묶음 맨 앞 — 다른 파일보다 먼저 선다
// ==========================================
//
// ■ 한계 — 먼저 적어 둔다
//   인트라넷은 셈을 전부 사원 기기에서 하고, Firebase 에 로그인 · 보안 규칙 없이 바로 쓴다.
//   그래서 여기 있는 것은 **기기 쪽 막기**다. 작정하고 우회하면(Firebase 를 따로 불러 쓰기 등) 뚫린다.
//   근본적으로 막으려면 Firebase 로그인 + 보안 규칙 + 중요한 값은 서버(Vercel)를 거쳐 바꾸기가 필요하다.
//   (사용자가 「기기 쪽 막기 + 적발」을 골랐다 — 2026-11-05)
//
// ■ 막는 것 — 상담사(kario0987)는 빼고
//   ① 개발자 도구를 열면 — 화면을 덮고 로그아웃 · 다시 열 때까지 로그인을 막는다 · 기록을 남긴다
//        · debugger 덫 — 개발자 도구가 열려 있으면 이 줄에서 멈춘다. 멈췄다 풀린 시간으로 안다.
//        · 콘솔 덫 — 개발자 도구가 콘솔에 찍을 것을 그릴 때만 읽는 칸을 걸어 둔다.
//   ② 콘솔에서 직접 부른 것 — 호출 줄(stack)의 맨 바깥이 파일이 아니라 콘솔이면 막는다
//        · 서버 쓰기 (ref().set · update · push · remove · transaction …)
//        · changePoints · saveDB · saveFields · saveSelfFull · bankAddScore · giveItems
//   ③ 콘솔에서 값을 바꾸는 것 — currentUser 의 중요한 칸(포인트 · 사번 · 탐사 횟수 · 오염도 · 포만감 ·
//        격리 · 소지품 · 장비)을 콘솔에서 고쳐 넣으면 그 자리에서 되돌린다
//   ④ 로그인한 사번이 바뀐 것 — 콘솔로 currentUser 를 갈아 끼워 사번을 바꾸면 로그아웃
//
// ■ 적발 — 막지는 않고 기록만 (상담사가 본다)
//   포인트가 한 번에 크게 늘었다 · 소지품이 짧은 사이에 많이 늘었다
//
// ■ 기록 — security/log/<push> { t: 종류, c: 사번, n: 이름, d: 내용, at: 서버 시각, ua }
//   상담사 화면에 「🛡 보안 기록」 칸이 붙는다. 콘솔 securityLog()
//
// ■ 시험 판(가짜 Firebase)에서는 끈다 — 진짜 Firebase(SDK_VERSION 이 있는 것)일 때만 켠다.
//   켜고 끄는 값은 처음 한 번만 정해 이 안에 가둬 둔다 (콘솔에서 바꿀 수 없다).

(function security() {
'use strict';

const ADMIN = 'kario0987';
const LIVE = !!(window.firebase && typeof window.firebase.SDK_VERSION === 'string');
const MSG = '보안 경고 — 개발자 도구가 감지되었습니다.';
const JUMP_PTS = 2000000;            // 한 번에 이만큼 넘게 늘면 적발 기록
const JUMP_INV = 20, JUMP_INV_MS = 5000;   // 이 사이에 소지품이 이만큼 넘게 늘면 적발 기록
const GUARD_FIELDS = ['points', 'code', 'darkTries', 'darkDate', 'pollution', 'satiety',
                      'quarantineUntil', 'inventory', 'equippedWeapons'];

let known = null;        // 로그인으로 들어온 사번 — 콘솔로 바꿀 수 없다 (이 안에 있다)
let knownObj = null;     // 그때의 currentUser 덩어리
let tripped = null;      // 걸린 까닭 (개발자 도구)
let peekUntil = 0;       // 「상담사 로그인」을 눌러 덮개를 잠시 걷은 동안
const orig = {};         // 원래 서버 쓰기 함수 — 기록을 적을 때는 이것으로 (막히지 않게)

function cu() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
function isAdmin() { return known === ADMIN; }
function on() { return LIVE && !isAdmin(); }
function srv() { try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { } return Date.now(); }

// ==========================================
// 콘솔에서 불렸나 — 호출 줄의 맨 바깥 칸을 본다
// ==========================================
//   크롬 · 엣지  「at <anonymous>:1:5」          파이어폭스 「@debugger eval code:1:1」
//   사파리       「global code」 · 「@」 (네이티브 칸 [native code] 은 건너뛴다)
//   우리 파일에서 시작한 것은 맨 바깥 칸에 주소(https://…)가 있다 — 클릭 · 시계 · 서버 응답 모두.
function fromConsole() {
    let st = '';
    const lim = Error.stackTraceLimit;
    try { Error.stackTraceLimit = 100; } catch (e) { }
    try { st = String(new Error().stack || ''); } catch (e) { }
    try { Error.stackTraceLimit = lim; } catch (e) { }
    const fr = st.split('\n').map(function (s) { return s.trim(); }).filter(function (l) {
        if (!l || /^Error\b/.test(l)) return false;
        if (/\[native code\]/.test(l)) return false;               // 사파리 네이티브 칸
        if (/\(<anonymous>\)$/.test(l)) return false;              // 크롬 내장 함수 칸 (Array.forEach 등)
        return true;
    });
    if (!fr.length) return false;
    const last = fr[fr.length - 1];
    if (/(https?|file|blob|chrome-extension|moz-extension|safari-web-extension):\/\//.test(last)) return false;
    return /<anonymous>:\d+|debugger eval code|eval code|global code|^@\s*$|^at\s*$/i.test(last);
}

// ==========================================
// 기록
// ==========================================
let sent = 0;
const lastKey = {};
function report(t, d) {
    try {
        if (!LIVE) return;
        const k = t + '|' + String(d || '').slice(0, 60);
        if (lastKey[k] && Date.now() - lastKey[k] < 30000) return;
        lastKey[k] = Date.now();
        if (++sent > 30) return;                                    // 한 화면에서 서른 줄까지
        const u = cu();
        const row = {
            t: t, c: known || (u && u.code) || '', n: (u && (u.name || u.nickname)) || '',
            d: String(d == null ? '' : d).slice(0, 240), at: srv(),
            ua: String(navigator.userAgent || '').slice(0, 140)
        };
        if (typeof database === 'undefined' || !database) return;
        const r = database.ref('security/log');
        (orig.push ? orig.push.call(r, row) : r.push(row));
        console.warn('[보안] ' + t + ' — ' + row.d);
    } catch (e) { }
}

// ==========================================
// 덮개 · 로그아웃
// ==========================================
function cover(show) {
    let el = document.getElementById('sec-overlay');
    if (!show) { if (el) el.style.display = 'none'; return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'sec-overlay';
        el.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;background:#0b0505;z-index:2147483647;'
            + 'display:flex;justify-content:center;align-items:center;flex-direction:column;touch-action:none;user-select:none;';
        el.innerHTML = '<div style="font-size:40px;margin-bottom:16px;">🛡</div>'
            + '<div style="color:#ff5a5a;font-size:15px;font-weight:bold;text-align:center;padding:0 24px;line-height:1.7;">' + MSG + '</div>'
            + '<div style="color:#bbb;font-size:12px;text-align:center;padding:10px 28px 0;line-height:1.7;">개발자 도구를 닫고 새로고침해 주세요.<br>이 기록은 상담사에게 전달됩니다.</div>'
            + '<button id="sec-adm" style="position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);left:50%;transform:translateX(-50%);'
            + 'background:none;border:1px solid #2a2a2a;border-radius:8px;color:#555;font-size:11px;padding:6px 12px;cursor:pointer;">상담사 로그인</button>';
        ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend', 'wheel', 'contextmenu'].forEach(function (ev) {
            el.addEventListener(ev, function (e) {
                if (e.target && e.target.closest && e.target.closest('#sec-adm')) {
                    e.stopPropagation();
                    if (ev === 'click') { e.preventDefault(); peekUntil = Date.now() + 120000; cover(false); }
                    return;
                }
                e.stopPropagation(); if (ev !== 'touchstart' && ev !== 'wheel') e.preventDefault();
            }, { passive: false });
        });
        (document.body || document.documentElement).appendChild(el);
    }
    if (el.style.display !== 'flex') el.style.display = 'flex';
    if (el.parentNode && el !== el.parentNode.lastElementChild) el.parentNode.appendChild(el);
}
document.addEventListener('keydown', function (e) {
    const el = document.getElementById('sec-overlay');
    if (el && el.style.display === 'flex') { e.stopPropagation(); e.preventDefault(); }
}, true);

function kick() {
    const u = cu();
    if (!u || isAdmin()) return;
    try { if (typeof window.logout === 'function') window.logout(); } catch (e) { }
}

function trip(how) {
    if (!on()) return;
    if (!tripped) {
        tripped = how;
        report('devtools', how);
    }
    if (!(peekUntil > Date.now() && !cu())) cover(true);
    kick();
}

// ==========================================
// ① 개발자 도구 덫
// ==========================================
//   debugger — 개발자 도구가 없으면 아무 일도 안 하는 줄이다. 열려 있으면 여기서 멈추고, 풀리면 시간이 훌쩍 지나 있다.
setInterval(function () {
    if (!on()) return;
    const t0 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (performance.now() - t0 > 300) trip('debugger');      // 사람이 풀어 주는 데 걸린 시간 (쓰레기 수거로 잠깐 멎는 것보다 길게)
}, 1500);
//   콘솔 덫 — 개발자 도구가 콘솔에 그림을 그릴 때만 id 를 읽는다
(function consoleTrap() {
    let hit = false;
    const bait = new Image();
    try { Object.defineProperty(bait, 'id', { get: function () { hit = true; return ''; } }); } catch (e) { }
    setInterval(function () {
        if (!on()) return;
        hit = false;
        try { console.debug(bait); } catch (e) { }
        setTimeout(function () { if (hit) trip('console'); }, 0);
    }, 2000);
})();

// ==========================================
// ② 콘솔에서 부른 쓰기 · 함수 막기
// ==========================================
function blocked(what) {
    if (!on()) return false;
    if (!fromConsole()) return false;
    report('console', what);
    try { if (typeof showCustomAlert === 'function') showCustomAlert('🛡 콘솔에서 직접 부른 것은 막혀 있습니다.\n\n이 기록은 상담사에게 전달됩니다.'); } catch (e) { }
    return true;
}
function rej() { return Promise.reject(new Error('보안: 막힌 쓰기')); }

function pathOf(ref) {
    try { return String(ref).replace(/^https?:\/\/[^/]+\/?/, '/'); } catch (e) { return '?'; }
}

(function guardDb() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        let proto = null, odProto = null;
        try { proto = Object.getPrototypeOf(database.ref('security')); } catch (e) { }
        try { odProto = Object.getPrototypeOf(database.ref('security').onDisconnect()); } catch (e) { }
        if (!proto) return;
        clearInterval(iv);
        if (!LIVE) return;
        // 진짜 Firebase 는 쓰기 함수가 Reference.prototype 에 있다 — 아니면(평범한 객체) 손대지 않는다
        if (proto === Object.prototype || !Object.prototype.hasOwnProperty.call(proto, 'set')) return;
        if (odProto === Object.prototype || (odProto && !Object.prototype.hasOwnProperty.call(odProto, 'set'))) odProto = null;
        // 끊길 때 쓰기(onDisconnect)도 같은 길로 — 콘솔에서 걸어 두고 끊으면 서버가 써 주던 틈
        if (odProto) ['set', 'update', 'remove', 'setWithPriority'].forEach(function (m) {
            const f = odProto[m];
            if (typeof f !== 'function' || f._sec) return;
            const w = function () {
                if (on() && tripped) return Promise.resolve();
                if (blocked('끊길 때 쓰기 ' + m)) return rej();
                return f.apply(this, arguments);
            };
            w._sec = true;
            try { odProto[m] = w; } catch (e) { }
        });
        ['set', 'update', 'push', 'remove', 'transaction', 'setWithPriority', 'setPriority'].forEach(function (m) {
            const f = proto[m];
            if (typeof f !== 'function' || f._sec) return;
            orig[m] = f;
            const w = function () {
                // 걸린 뒤(개발자 도구)에는 기록 말고는 아무것도 안 쓴다 — 로그아웃되기 전 틈
                // (조용히 끝낸다 — 붙잡는 곳이 없는 실패가 콘솔을 덮지 않게)
                if (on() && tripped) {
                    if (m === 'transaction') return new Promise(function () { });     // 결과(snapshot)를 읽는 곳이 있다 — 끝내지 않는다
                    return m === 'push' ? { key: null, then: function (a) { return Promise.resolve().then(a); }, catch: function () { return Promise.resolve(); } } : Promise.resolve();
                }
                if (blocked('서버 쓰기 ' + m + ' ' + pathOf(this))) {
                    return m === 'push' ? { key: null, then: function (a, b) { return rej().then(a, b); }, catch: function (b) { return rej().catch(b); } } : rej();
                }
                return f.apply(this, arguments);
            };
            w._sec = true;
            try { proto[m] = w; } catch (e) { }
        });
    }, 50);
})();

const FN = ['changePoints', 'saveDB', 'saveFields', 'saveSelfFull', 'bankAddScore', 'giveItems', 'removeItemFromInventory'];
function guardFns() {
    if (!LIVE) return;
    FN.forEach(function (n) {
        const f = window[n];
        if (typeof f !== 'function' || f._sec) return;
        const w = function () {
            if (blocked(n + '(' + Array.prototype.slice.call(arguments, 0, 3).map(function (a) {
                try { return typeof a === 'object' ? JSON.stringify(a).slice(0, 60) : String(a).slice(0, 40); } catch (e) { return '?'; }
            }).join(', ') + ')')) return undefined;
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._sec = true;
        try { window[n] = w; } catch (e) { }
        // index.html 의 함수 선언은 전역 이름 그대로라 window 와 같은 자리다
    });
}
setInterval(guardFns, 1000);
guardFns();

// ==========================================
// ③ 콘솔로 값을 바꾸는 것 — 중요한 칸에 지킴이를 단다
// ==========================================
//   칸을 읽고 쓰는 길목(getter · setter)으로 바꾼다. 우리 파일에서 쓰면 그대로 들어가고,
//   콘솔에서 쓰면 안 들어간다 (기록만 남는다). 덩어리가 새로 바뀌면 다시 단다.
//   칸이 지워졌다 다시 생겨도(delete 뒤 새로 쓰기) 다음 번에 다시 단다 — 이미 달린 칸은 건너뛴다.
//   없는 칸은 새로 만들지 않는다 ('칸' in currentUser 로 갈래를 타는 곳이 있다).
function arm(u) {
    if (!u || typeof u !== 'object') return;
    GUARD_FIELDS.forEach(function (k) {
        const d = Object.getOwnPropertyDescriptor(u, k);
        if (!d || d.get || d.set || d.configurable === false) return;
        let val = u[k];
        try {
            Object.defineProperty(u, k, {
                configurable: true, enumerable: true,
                get: function () { return val; },
                set: function (v) {
                    if (v !== val && on() && fromConsole()) {
                        let shown = '';
                        try { shown = typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v); } catch (e) { }
                        report('console', 'currentUser.' + k + ' = ' + shown);
                        try { if (typeof showCustomAlert === 'function') showCustomAlert('🛡 콘솔에서 값을 바꾸는 것은 막혀 있습니다.\n\n이 기록은 상담사에게 전달됩니다.'); } catch (e) { }
                        return;
                    }
                    val = v;
                }
            });
        } catch (e) { }
    });
}

// ==========================================
// ④ 로그인한 사람을 지켜본다 · 적발
// ==========================================
let lastPts = null, invMarks = [];
setInterval(function () {
    const u = cu();
    if (!u) { known = null; knownObj = null; lastPts = null; invMarks = []; tick(); return; }
    if (!known) { known = u.code || null; knownObj = u; }
    if (known === ADMIN) { if (tripped) { tripped = null; cover(false); } return; }
    if (!LIVE) return;
    // 사번이 바뀌었다 — 콘솔로 덩어리를 갈아 끼웠다
    if (u.code !== known) {
        report('tamper', '사번이 ' + known + ' → ' + u.code + ' 로 바뀜');
        known = null;
        kick();
        return;
    }
    if (u !== knownObj) knownObj = u;
    arm(u);
    // 적발 — 포인트가 한 번에 크게 늘었다
    const p = Number(u.points) || 0;
    if (lastPts != null && p - lastPts >= JUMP_PTS) report('jump', '포인트 ' + lastPts.toLocaleString() + ' → ' + p.toLocaleString());
    lastPts = p;
    // 적발 — 소지품이 짧은 사이에 많이 늘었다
    const n = Array.isArray(u.inventory) ? u.inventory.length : 0;
    const now = Date.now();
    invMarks.push({ t: now, n: n });
    invMarks = invMarks.filter(function (m) { return now - m.t <= JUMP_INV_MS; });
    if (invMarks.length && n - invMarks[0].n >= JUMP_INV) {
        report('jump', '소지품 ' + invMarks[0].n + ' → ' + n + ' (' + Math.round(JUMP_INV_MS / 1000) + '초 안)');
        invMarks = [{ t: now, n: n }];
    }
    tick();
}, 300);

// 걸린 동안 — 로그인 칸을 덮는다 (상담사는 「상담사 로그인」으로 걷고 들어간다)
function tick() {
    if (!tripped || !on()) return;
    if (!cu() && peekUntil > Date.now()) { cover(false); return; }
    cover(true);
}
(function wrapLogin() {
    const iv = setInterval(function () {
        const f = window.attemptLogin;
        if (typeof f !== 'function' || f._sec) return;
        const w = function () {
            if (tripped && LIVE) {
                let code = '';
                try { code = String((document.getElementById('code-input') || {}).value || '').trim(); } catch (e) { }
                if (code !== ADMIN) { peekUntil = 0; cover(true); return Promise.resolve(null); }
            }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._sec = true;
        window.attemptLogin = w;
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 상담사 화면 — 🛡 보안 기록
// ==========================================
const BOX = 'admin-sec-box';
const KIND = { devtools: '개발자 도구', console: '콘솔 조작', tamper: '사번 바꿔치기', jump: '이상 증가' };
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function paint() {
    const box = document.getElementById(BOX);
    if (!box || typeof database === 'undefined' || !database) return;
    const out = box.querySelector('.sec-out');
    out.innerHTML = '<div style="font-size:11px;color:#888;">읽는 중…</div>';
    database.ref('security/log').limitToLast(200).once('value').then(function (s) {
        const v = s.val() || {};
        const rows = Object.keys(v).map(function (k) { return v[k]; }).filter(Boolean)
            .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
        const head = box.querySelector('h4');
        if (head) head.textContent = '🛡 보안 기록' + (rows.length ? ' (' + rows.length + ')' : '');
        if (!rows.length) { out.innerHTML = '<div style="font-size:11px;color:#888;">기록이 없습니다.</div>'; return; }
        out.innerHTML = rows.map(function (r) {
            const when = r.at ? new Date(r.at + 9 * 3600000).toISOString().replace('T', ' ').slice(5, 16) : '';
            const col = r.t === 'jump' ? '#e0b060' : '#ff6b6b';
            return '<div style="font-size:11px;line-height:1.6;padding:5px 0;border-bottom:1px dashed #333;">'
                + '<b style="color:' + col + ';">' + esc(KIND[r.t] || r.t) + '</b> · ' + esc(r.n || '?') + ' (' + esc(r.c || '-') + ') · '
                + '<span style="color:#888;">' + esc(when) + '</span><br><span style="color:#ccc;word-break:break-all;">' + esc(r.d) + '</span></div>';
        }).join('');
    }).catch(function (e) { out.innerHTML = '<div style="font-size:11px;color:#f88;">못 읽었습니다: ' + esc(e && e.message) + '</div>'; });
}
window.securityLogClear = function () {
    if (!isAdmin() || typeof database === 'undefined' || !database) return;
    if (!confirm('보안 기록을 모두 지울까요?')) return;
    database.ref('security/log').remove().then(paint).catch(function () { });
};
window.securityLogPaint = paint;
function make() {
    if (!isAdmin()) return;
    const scr = document.getElementById('admin-screen');
    if (!scr || document.getElementById(BOX)) return;
    const anchor = scr.querySelector('.action-buttons');
    const html = '<div class="admin-panel-box collapsed" id="' + BOX + '" style="border-color:#7a3a3a; background-color:#160c0c;">'
        + '<h4 style="color:#ff9a9a; cursor:pointer;" data-acc="1">🛡 보안 기록</h4>'
        + '<div style="display:flex;gap:6px;margin:0 0 9px;">'
        + '<button class="game-btn" style="flex:1;margin:0;padding:8px;font-size:11px;" onclick="securityLogPaint()">새로 읽기</button>'
        + '<button class="game-btn" style="flex:1;margin:0;padding:8px;font-size:11px;" onclick="securityLogClear()">모두 지우기</button></div>'
        + '<div class="sec-out" style="max-height:360px;overflow:auto;"></div></div>';
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html); else scr.insertAdjacentHTML('beforeend', html);
    const box = document.getElementById(BOX), h = box.querySelector('h4');
    h.onclick = function () { box.classList.toggle('collapsed'); if (!box.classList.contains('collapsed')) paint(); };
}
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._sec) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () { const r = _o.apply(this, arguments); setTimeout(make, 260); return r; };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._sec = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
window.securityLog = function () {
    if (!isAdmin()) { console.log('상담사만 봅니다.'); return; }
    database.ref('security/log').limitToLast(50).once('value').then(function (s) {
        const v = s.val() || {};
        console.table(Object.keys(v).map(function (k) { const r = v[k]; return { 종류: KIND[r.t] || r.t, 사번: r.c, 이름: r.n, 내용: r.d, 때: new Date(r.at).toLocaleString('ko-KR') }; }));
    });
};
})();
