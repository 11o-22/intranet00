// ==========================================
// ★ 🧑 얼굴 지정 — 사원마다 쓸 수 있는 얼굴을 상담사가 정한다 (2026-10-23)
// bundles.json 마지막 묶음 (closet.js · firsthead.js 뒤)
// ==========================================
//
// ■ 무엇을
//
//   옷장의 「머리」에서 고를 수 있는 얼굴은 상담사가 정해 준 것뿐이다. 한 사원에게 세 개까지.
//     · 정해 준 것이 있으면       그것만 (어둠 전용 · 사번 전용 얼굴이어도 정해 주면 쓴다)
//     · 아직 아무것도 안 정했으면  지금 쓰는 얼굴 하나로 고정
//     · 새 사원(얼굴을 한 번도 안 고름)은 처음 들어올 때 있는 얼굴들 중 하나를 고르고, 그 얼굴로 고정된다
//     · 정해 준 것을 다 회수하면   기본 얼굴 J3
//     · 상담사는 전부
//   지금 쓰는 얼굴이 회수되면 그 사원 화면이 정해 준 첫 얼굴로 갈아 끼운다 (접속해 있으면 바로).
//
// ■ 어디에 적나
//
//   faces/<사원 코드> = { l: ['h02', 'h05'], at, by }
//   사원 기록(users/<코드>) 밖에 둔다 — 사원 기록은 통째로 다시 쓰는 길이 있어(사택 보관함 · 관리 도구)
//   상담사가 남의 기록 안에 적으면 그 사원 화면이 덮어쓸 수 있다.
//
// ■ 상담사 화면
//
//   통제 콘솔 「기존 사원 인사 발령 및 권한 제어」 칸 맨 아래 — 위 사번 칸의 사원이 대상이다.
//   얼굴들이 가로 띠로 놓여 있고 옆으로 밀어 고른다. 누르면 준다 · 준 것을 다시 누르면 회수한다.
//
// ■ 콘솔
//   facesState()            내 것 · 전체
//   faceGive(사번, 'h02')    faceTake(사번, 'h02')

(function faces() {

const ADMIN = 'kario0987';
const MAX = 3;
const BASE = 'h01';               // 기본 얼굴 (J3)
const NODE = 'faces';

let FACES = {}, loaded = false;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function dbr() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }
function users() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function el(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function say(t) { try { showCustomAlert(t); } catch (e) { alert(t); } }
function heads() { return (typeof DOT_HEADS !== 'undefined' && Array.isArray(DOT_HEADS)) ? DOT_HEADS : []; }
function headOf(id) { return heads().filter(function (h) { return h.i === id; })[0] || null; }
function nameOfHead(id) { const h = headOf(id); return h ? (h.n || id) : id; }
function listOf(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; }).filter(Boolean);
    return [];
}

// ── 듣는다 (모든 화면 — 내 것을 알아야 하고, 상담사는 남의 것도 본다)
(function listen() {
    const iv = setInterval(function () {
        const d = dbr();
        if (!d) return;
        clearInterval(iv);
        d.ref(NODE).on('value', function (s) {
            FACES = s.val() || {};
            loaded = true;
            try { fixMine(); } catch (e) { }
            try { paintAdmin(); } catch (e) { }
        });
    }, 300);
})();

// 정해 준 목록 — 없으면 null (아직 안 정함) · 다 회수했으면 []
function given(code) {
    const e = FACES[code];
    if (!e) return null;
    return listOf(e.l).filter(function (id) { return !!headOf(id); }).slice(0, MAX);
}
function nowHead(u) {
    const h = u && u.dot && u.dot.head;
    return (h && headOf(h)) ? h : BASE;
}

// ★ 옷장이 묻는다 — 이 사원이 쓸 수 있는 얼굴 (null 이면 다 된다 · 상담사)
window.faceList = function (u) {
    u = u || me();
    if (!u || !u.code) return null;
    if (u.code === ADMIN) return null;
    const g = given(u.code);
    if (g && g.length) return g;
    if (g) return [BASE];                      // 다 회수했다
    if (!u.dotPicked) return null;             // 아직 얼굴을 한 번도 안 고른 새 사원 — 있는 얼굴 중에서 하나 고른다 (예전 규칙 · firsthead.js)
    return [nowHead(u)];                       // 아직 안 정했다 — 고른(지금) 얼굴로 고정 (불러오기 전에도)
};
window.faceGiven = function (code) { return given(code); };

// ── 내 얼굴이 쓸 수 없는 것이면 쓸 수 있는 첫 얼굴로 갈아 끼운다
function fixMine() {
    const u = me();
    if (!u || !u.code || u.code === ADMIN || !loaded) return;
    const g = given(u.code);
    if (!g) return;                            // 안 정했다 — 지금 얼굴 그대로
    const ok = g.length ? g : [BASE];
    const cur = nowHead(u);
    if (ok.indexOf(cur) >= 0) return;
    // 아직 얼굴을 한 번도 안 고른 새 사원에게 둘 이상 정해 주었으면 — 처음 고르는 창(firsthead.js)이 묻는다
    if (!u.dotPicked && ok.length > 1 && !(u.dot && u.dot.head)) return;
    u.dot = Object.assign({}, (u.dot && typeof u.dot === 'object') ? u.dot : {});
    u.dot.head = ok[0];
    try { if (typeof saveFields === 'function') saveFields({ dot: 1 }); } catch (e) { }
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    try { if (typeof window.closetReset === 'function') window.closetReset(); } catch (e) { }
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[얼굴] ' + (g.length ? '상담사가 정해 준 얼굴(' + nameOfHead(ok[0]) + ')로 바뀌었습니다.' : '얼굴이 모두 회수되어 기본 얼굴(' + nameOfHead(BASE) + ')로 바뀌었습니다.')); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    console.log('[얼굴] ' + cur + ' → ' + ok[0] + ' (상담사가 정해 준 얼굴)');
}
setInterval(function () { try { fixMine(); } catch (e) { } }, 3000);

// ==========================================
// 상담사 — 주기 · 회수
// ==========================================
function isAdmin() { const u = me(); return !!(u && u.code === ADMIN); }
function codeOfNo(no) {
    no = String(no || '').trim();
    if (!no) return null;
    const U = users();
    return Object.keys(U).find(function (c) { return U[c] && (String(U[c].no || '') === no || c === no); }) || null;
}
function give(code, id) {
    const d = dbr();
    if (!d || !isAdmin() || !code || !headOf(id)) return Promise.resolve(false);
    let why = '';
    return d.ref(NODE + '/' + code).transaction(function (cur) {
        const l = listOf(cur && cur.l).filter(function (x) { return !!headOf(x); });
        if (l.indexOf(id) >= 0) { why = 'have'; return; }
        if (l.length >= MAX) { why = 'full'; return; }
        l.push(id);
        return { l: l, at: Date.now(), by: me().code };
    }).then(function (r) {
        if (why === 'full') say('한 사원에게는 얼굴을 ' + MAX + '개까지 줄 수 있습니다.\n\n먼저 하나를 회수해 주세요.');
        return !!(r && r.committed);
    }).catch(function (e) { say('적지 못했습니다.\n\n' + (e && e.message)); return false; });
}
function take(code, id) {
    const d = dbr();
    if (!d || !isAdmin() || !code) return Promise.resolve(false);
    return d.ref(NODE + '/' + code).transaction(function (cur) {
        const l = listOf(cur && cur.l).filter(function (x) { return x !== id && !!headOf(x); });
        return { l: l, at: Date.now(), by: me().code };          // 다 비어도 남긴다 — 그러면 기본 얼굴
    }).then(function (r) { return !!(r && r.committed); })
      .catch(function (e) { say('적지 못했습니다.\n\n' + (e && e.message)); return false; });
}
window.faceGive = function (no, id) { return give(codeOfNo(no), id); };
window.faceTake = function (no, id) { return take(codeOfNo(no), id); };

// ── 얼굴 그림 — 머리 시트의 서 있는 첫 칸에서 머리 자리만 떠 보인다
function thumb(id, size) {
    const h = headOf(id);
    const T = size || 52;
    // 사람 머리 — 칸(352x384) 안 x 100~240 · y 100~240 · 한 벌 그림(브라운 특전 · 토끼)은 몸까지
    const box = (h && h.solo) ? { x: 92, y: 100, w: 170, h: 252 } : { x: 100, y: 96, w: 140, h: 140 };
    const s = T / Math.max(box.w, box.h);
    const W = Math.round(2112 * s), H = Math.round(768 * s);
    const px = -Math.round((box.x - (Math.max(box.w, box.h) - box.w) / 2) * s);
    const py = -Math.round((384 + box.y - (Math.max(box.w, box.h) - box.h) / 2) * s);
    // 머리 그림은 머리카락 · 눈만 있다 — 살갗은 몸 그림에 있어 뒤에 몸을 깐다 (브라운은 전용 몸 · 한 벌 그림은 몸 없음)
    const body = (h && h.body) ? h.body : 'body';
    const imgs = "url('dot/" + esc(id) + ".png')" + (body === 'none' ? '' : ", url('dot/" + esc(body) + ".png')");
    const sz = W + 'px ' + H + 'px', ps = px + 'px ' + py + 'px';
    return '<span class="fa-th" style="width:' + T + 'px;height:' + T + 'px;background-image:' + imgs + ';'
        + 'background-size:' + sz + (body === 'none' ? '' : ',' + sz) + ';background-position:' + ps + (body === 'none' ? '' : ',' + ps) + ';"></span>';
}

function css() {
    if (el('fa-css')) return;
    const st = document.createElement('style');
    st.id = 'fa-css';
    st.textContent = [
        '#face-adm{margin-top:12px;border-top:1px solid #333;padding-top:10px;}',
        '#face-adm .fa-h{font-size:12px;color:#ddd;font-weight:bold;}',
        '#face-adm .fa-h i{font-style:normal;font-size:10px;color:#888;font-weight:normal;}',
        '#face-adm .fa-who{font-size:11px;color:#aaa;margin:7px 0 8px;line-height:1.6;}',
        '#face-adm .fa-who b{color:#ffe08a;}',
        '#face-adm .fa-bar{display:flex;gap:7px;overflow-x:auto;overflow-y:hidden;padding:2px 2px 8px;',
        '  -webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scrollbar-width:thin;}',
        '#face-adm .fa-b{flex:0 0 auto;width:74px;padding:6px 4px 5px;border-radius:8px;border:1px solid #3a3a44;',
        '  background:rgba(255,255,255,.03);color:#ccc;font-size:10px;display:flex;flex-direction:column;align-items:center;gap:4px;',
        '  cursor:pointer;scroll-snap-align:start;font-family:inherit;}',
        '#face-adm .fa-b .fa-n{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}',
        '#face-adm .fa-b .fa-st{font-size:9px;color:#888;}',
        '#face-adm .fa-b.on{border-color:#d4af37;background:rgba(212,175,55,.12);color:#fff;}',
        '#face-adm .fa-b.on .fa-st{color:#ffd76a;}',
        '#face-adm .fa-b.wear .fa-st:after{content:" · 쓰는 중";color:#8fd18f;}',
        '#face-adm .fa-b.dim{opacity:.38;}',
        '#face-adm .fa-b:disabled{cursor:default;}',
        '#face-adm .fa-th{display:block;border-radius:6px;background-color:#15151b;background-repeat:no-repeat;image-rendering:pixelated;}'
    ].join('\n');
    document.head.appendChild(st);
}

// 통제 콘솔 「기존 사원 인사 발령」 칸 맨 아래에 끼운다
function host() {
    const no = el('adm-target-no');
    return no ? no.closest('.admin-panel-box') : null;
}
let busy = false;
function paintAdmin() {
    if (!isAdmin()) return;
    const box = host();
    if (!box) return;
    css();
    let f = el('face-adm');
    if (!f) {
        f = document.createElement('div');
        f.id = 'face-adm';
        f.innerHTML = '<div class="fa-h">얼굴 지정 <i>— 위 사번 칸의 사원 · ' + MAX + '개까지 · 누르면 주고, 준 것을 다시 누르면 회수</i></div>'
            + '<div class="fa-who"></div><div class="fa-bar"></div>';
        box.appendChild(f);
        const inp = el('adm-target-no');
        if (inp && !inp._fa) { inp._fa = 1; inp.addEventListener('input', function () { paintAdmin(); }); }
        f.querySelector('.fa-bar').addEventListener('click', function (e) {
            const b = e.target.closest('.fa-b');
            if (!b || b.disabled || busy) return;
            const code = codeOfNo((el('adm-target-no') || {}).value);
            if (!code) { say('위 사번 칸에 사원 사번을 먼저 적어 주세요.'); return; }
            const id = b.dataset.id;
            const g = given(code) || [];
            busy = true;
            (g.indexOf(id) >= 0 ? take(code, id) : give(code, id)).then(function () { busy = false; paintAdmin(); });
        });
    }
    const code = codeOfNo((el('adm-target-no') || {}).value);
    const U = users(), u = code ? U[code] : null;
    const g = code ? given(code) : null;
    const wear = u ? nowHead(u) : '';
    const who = f.querySelector('.fa-who');
    if (!code) who.innerHTML = '사번을 적으면 그 사원에게 준 얼굴이 보입니다.';
    else if (code === ADMIN) who.innerHTML = '상담사는 모든 얼굴을 씁니다.';
    else {
        const nm = esc((u && u.name) || code);
        if (!g) who.innerHTML = '<b>' + nm + '</b> — 아직 정하지 않았습니다. 지금 얼굴(<b>' + esc(nameOfHead(wear)) + '</b>) 하나로 고정되어 있습니다.';
        else if (!g.length) who.innerHTML = '<b>' + nm + '</b> — 준 얼굴을 다 회수했습니다. 기본 얼굴(<b>' + esc(nameOfHead(BASE)) + '</b>)만 씁니다.';
        else who.innerHTML = '<b>' + nm + '</b> — ' + g.map(function (id) { return '<b>' + esc(nameOfHead(id)) + '</b>'; }).join(' · ')
            + ' <span style="color:#777;">(' + g.length + ' / ' + MAX + ')</span>';
    }
    const bar = f.querySelector('.fa-bar');
    const keep = bar.scrollLeft;
    const full = !!(g && g.length >= MAX);
    bar.innerHTML = heads().map(function (h) {
        const on = !!(g && g.indexOf(h.i) >= 0);
        const cls = 'fa-b' + (on ? ' on' : '') + (code && h.i === wear ? ' wear' : '') + (!on && full ? ' dim' : '');
        return '<button type="button" class="' + cls + '" data-id="' + esc(h.i) + '"' + (!code || code === ADMIN ? ' disabled' : '') + '>'
            + thumb(h.i) + '<span class="fa-n">' + esc(h.n || h.i) + '</span>'
            + '<span class="fa-st">' + (on ? '회수' : (full ? '가득 참' : '주기')) + '</span></button>';
    }).join('');
    bar.scrollLeft = keep;
}
// 통제 콘솔을 열 때 그린다
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._faces) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () {
            const r = _o.apply(this, arguments);
            setTimeout(paintAdmin, 200);
            return r;
        };
        Object.keys(_o).forEach(function (k) { if (!(k in w)) w[k] = _o[k]; });
        w._faces = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
setInterval(function () { try { if (isAdmin() && host() && !el('face-adm')) paintAdmin(); } catch (e) { } }, 2000);

window.facesState = function () {
    const u = me();
    console.log('%c===== 🧑 얼굴 지정 =====', 'color:#ffe08a; font-size:13px');
    if (u) console.log('  내 것 :', JSON.stringify(window.faceList(u)), '(정해 준 것 ' + JSON.stringify(given(u.code)) + ')');
    const U = users();
    console.table(Object.keys(FACES).map(function (c) {
        return { 사원: (U[c] && U[c].name) || c, 사번: (U[c] && U[c].no) || '', 얼굴: (given(c) || []).map(nameOfHead).join(', ') || '(다 회수 — J3)' };
    }));
};
console.log('[얼굴] 상담사 지정 · 사원마다 ' + MAX + '개까지 — facesState()');

})();
