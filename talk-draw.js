// ==========================================
// ★ 🖌 심야 토크쇼 — 무대 위에 다 같이 그리는 그림 (2026-11-15)
// bundles.json 마지막 묶음 — quizshow.js 바로 뒤
// ==========================================
//
// 2026-11-15 사용자
//   「브라운의 심야 토크쇼. 심야 토크쇼도 열고 거기에 초대받은 사람이랑 그 주인은 거기에서 같이 그림 그릴 수 있게 하자.
//    그림은 지우거나 나가지 않는 이상 안 지워지도록 하고.」
//
// ■ 무엇인가
//
//   🛋 심야 토크쇼(quizshow.js — quizShow/<사회자>/mode = 'talk')의 무대에 서 있는 **사회자와 자리에 앉은 손님**에게
//   오른쪽 위에 [🖌 그림] 단추가 뜬다. 누르면 그림판이 열리고, 화면에 그은 것이 **무대 그림 위**에 그려진다.
//   무대에 있는 모두가 같이 그리고 같이 본다. (🖋️ 유리 펜 pen.js 과 같은 길 — 획을 방 그림 좌표로 적는다.)
//
//   · **사라지지 않는다.** 유리 펜은 10초 뒤에 옅어지지만, 여기 그린 것은 아래 때까지 그대로 남는다.
//       지운다       🧽 지우개(문지른 획을 지운다 — 누가 그린 것이든) · ↩ 되돌리기(내가 마지막에 그은 획) · 🗑 모두 지우기(사회자만)
//       나간다       그린 사람이 [무대에서 나간다] 로 나가거나 · 사회자가 내보내면 **그 사람이 그린 것**이 지워진다
//       막이 내린다   쇼가 끝나면 다 지운다 (새 쇼를 열 때도 앞선 것이 남아 있으면 치운다)
//     화면을 끄거나 접속이 끊긴 것은 나간 것이 아니다 — 그대로 남는다 (다시 들어오면 그대로 보인다).
//   · 그림은 사람 · 단상 · 커튼 **위에** 그려진다 (무대 어디에 그어도 보이게). 단추 · 채팅 같은 화면 띠보다는 아래.
//   · 그리는 동안에는 그림판이 화면을 덮어 손가락을 받는다 (걷기 · 다른 단추로 새지 않는다). [닫기] · Esc 로 닫는다.
//
// ■ 서버
//
//   talkDraw/<사회자 사번>/<획> = { by, n, at, sid (쇼 id), c (색), w (굵기 · 방 그림 눈금), p: [x, y, x, y, …] }
//     쇼 자료(quizShow)와 따로 둔다 — 쇼 자료는 바뀔 때마다 모두에게 통째로 내려가는데, 그림까지 거기 있으면 획마다 다 같이 다시 내려온다.
//     손을 뗄 때 한 획을 한 번에 적는다. 한 획 MAX_PTS 점 · 한 쇼 MAX_STROKES 획까지 (가득 차면 지워야 더 그린다).
//
// ■ quizshow.js 가 부른다
//
//   talkDrawLeave(사회자)        내가 그린 것을 지운다 (무대에서 나갈 때 · 내보내졌을 때)
//   talkDrawDrop(사회자, 사번)   그 사람이 그린 것을 지운다 (사회자가 내보낼 때)
//   talkDrawClear(사회자)        다 지운다 (막이 내릴 때 · 새 쇼를 열 때)
//
// ■ 콘솔
//   talkDrawState()

(function talkDraw() {
'use strict';

const TD = {
    PATH: 'talkDraw',
    ROOM: 'quiz',
    MAX_PTS: 400,             // 한 획에 적는 점 수 (넘으면 솎는다)
    MAX_STROKES: 500,         // 한 쇼에 남겨 두는 획
    STEP: 2,                  // 화면에서 이만큼 움직여야 점을 하나 더 찍는다
    POLL: 400,
    MAX_PX: 4200000,          // 캔버스 점 수 상한
    Z: 4100,                  // 사람(100 + 발끝) · 단상(1360 ~) · 걷힌 커튼(3000) 위 — 채점 표(4200) 아래
    ERASE: 16,                // 지우개가 닿는 폭 (화면 px · 반지름)
    COLORS: ['#ffffff', '#1c1c1c', '#ff5a5a', '#ffd400', '#5ad17a', '#5ab8ff', '#b98bff', '#ff9ad5'],
    SIZES: [3, 6, 12]         // 화면에서 보이는 굵기 (px)
};

const S = {
    color: TD.COLORS[0], size: TD.SIZES[1], tool: 'pen',
    btn: null, board: null, open: false,
    host: '', sid: 0, ref: null, onAdd: null, onDel: null,
    strokes: {},              // 열쇠 → { c, w, p, at, by }
    live: null,               // 긋고 있는 획 { c, w, p, pid, lx, ly }
    erasing: null,            // 지우개를 누르고 있는 손가락
    cv: null, ctx: null, raf: 0, dim: '',
    askAll: 0
};

function u_() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
function db_() { try { return (typeof database !== 'undefined' && database && database.ref) ? database : null; } catch (e) { return null; } }
function now() { return (typeof window.serverNow === 'function') ? window.serverNow() : Date.now(); }
function stage() {
    try { const st = (typeof window.plazaStage === 'function') ? window.plazaStage() : null; return (st && st.room === TD.ROOM) ? st : null; } catch (e) { return null; }
}
// 지금 그릴 수 있는 자리인가 — 🛋 심야 토크쇼의 무대에 선 사회자 · 자리에 앉은 손님
function showNow() {
    let n = null;
    try { n = (typeof window.quizShowNow === 'function') ? window.quizShowNow() : null; } catch (e) { n = null; }
    if (!n || n.mode !== 'talk' || !n.inRoom || !(n.isHost || n.seated)) return null;
    return n;
}
function sys(t) { try { if (typeof window.__plazaSys === 'function') window.__plazaSys(t); } catch (e) { } }

// ==========================================
// 모양
// ==========================================
(function css() {
    if (document.getElementById('td-css')) return;
    const st = document.createElement('style');
    st.id = 'td-css';
    st.textContent = [
        // [🖌 그림] — 📺 단추 아래 (사회자의 🚶 내려가기는 그 아래 142px)
        '#td-btn{position:absolute;right:12px;top:102px;z-index:60;padding:8px 14px;border-radius:14px;border:1px solid #c79a5b;',
        '  background:rgba(42,27,14,.9);color:#f3e6d2;font-size:12px;font-weight:bold;box-shadow:0 3px 12px rgba(0,0,0,.5);}',
        // 그림판 — 화면을 통째로 덮어 손가락을 받는다 (📺 단추들보다 위)
        '#td-board{position:absolute;inset:0;z-index:66;touch-action:none;cursor:crosshair;user-select:none;-webkit-user-select:none;',
        '  box-shadow:inset 0 0 0 2px rgba(243,230,210,.5),inset 0 0 26px rgba(199,154,91,.22);}',
        '#td-board.erase{cursor:cell;}',
        '#td-board .tb-bar{position:absolute;left:50%;transform:translateX(-50%);width:max-content;box-sizing:border-box;',
        '  top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;flex-direction:column;align-items:center;gap:7px;',
        '  max-width:calc(100% - 16px);padding:8px 10px;border-radius:16px;cursor:default;',
        '  background:rgba(30,19,9,.92);border:1px solid #c79a5b;box-shadow:0 4px 16px rgba(0,0,0,.55);}',
        '#td-board .tb-row{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;}',
        '#td-board .tb-c{width:22px;height:22px;padding:0;border-radius:50%;cursor:pointer;border:2px solid rgba(255,255,255,.25);flex:0 0 auto;}',
        '#td-board .tb-c.on{border-color:#ffe2a8;box-shadow:0 0 0 2px rgba(255,214,140,.45);}',
        '#td-board .tb-gap{width:6px;flex:0 0 auto;}',
        '#td-board .tb-s{width:26px;height:26px;padding:0;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:0 0 auto;',
        '  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);}',
        '#td-board .tb-s i{display:block;border-radius:50%;background:#f3e6d2;}',
        '#td-board .tb-s.on{border-color:#ffe2a8;background:rgba(255,214,140,.2);}',
        '#td-board .tb-b{flex:0 0 auto;padding:6px 11px;border-radius:999px;cursor:pointer;font-size:12px;font-family:inherit;color:#f3e6d2;white-space:nowrap;',
        '  background:rgba(255,255,255,.08);border:1px solid rgba(243,230,210,.25);}',
        '#td-board .tb-b.on{background:#c79a5b;border-color:#f3e6d2;color:#1a1008;font-weight:bold;}',
        '#td-board .tb-b.warn{background:#7a1414;border-color:#e08a8a;color:#ffe1e1;}',
        // 안내 한 줄 — 띠 안 맨 아래 (화면 아래에 두면 채팅 띠의 글과 겹친다)
        '#td-board .tb-tip{max-width:300px;font-size:10.5px;line-height:1.4;color:#d9c3a0;text-align:center;pointer-events:none;}',
        '@media (max-width:430px){#td-board .tb-bar{padding:7px 8px;gap:6px;}#td-board .tb-row{gap:5px;}',
        '  #td-board .tb-c{width:20px;height:20px;}#td-board .tb-s{width:24px;height:24px;}#td-board .tb-b{padding:6px 9px;font-size:11.5px;}}',
        // 그리는 동안은 위 띠 · 무대 단추를 걷는다 (그림판의 띠와 겹치고, 어차피 못 누른다)
        '#plaza-ov.td-on #plaza-top,#plaza-ov.td-on #plaza-hud,#plaza-ov.td-on #plaza-cam,#plaza-ov.td-on #qz-ctl,#plaza-ov.td-on .qz-hbtn,#plaza-ov.td-on #td-btn{opacity:0;pointer-events:none;}',
        // 그린 것 — 방 그림 칸 안, 사람 · 단상 · 커튼 위
        '.td-cv{position:absolute;left:0;top:0;width:100%;height:100%;z-index:' + TD.Z + ';pointer-events:none;image-rendering:auto;}'
    ].join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 캔버스 — 방 그림 칸에 붙인다
// ==========================================
function ensureCanvas(st) {
    if (!S.cv || S.cv.parentNode !== st.el) {
        S.cv = document.createElement('canvas');
        S.cv.className = 'td-cv';
        S.ctx = S.cv.getContext('2d');
        S.dim = '';
        st.el.appendChild(S.cv);
    }
    const w = st.el.offsetWidth || 0, h = st.el.offsetHeight || 0;
    if (!w || !h) return false;
    let k = Math.min(2, window.devicePixelRatio || 1);
    if (w * h * k * k > TD.MAX_PX) k = Math.sqrt(TD.MAX_PX / (w * h));
    const cw = Math.max(1, Math.min(4096, Math.round(w * k)));
    const ch = Math.max(1, Math.min(4096, Math.round(h * k)));
    const dim = cw + 'x' + ch + '@' + st.w + 'x' + st.h;
    if (dim !== S.dim) { S.cv.width = cw; S.cv.height = ch; S.dim = dim; kick(); }
    return true;
}
function trace(ctx, s) {
    const p = s.p;
    if (!p || p.length < 2) return;
    ctx.strokeStyle = s.c; ctx.fillStyle = s.c; ctx.lineWidth = s.w;
    if (p.length < 4) { ctx.beginPath(); ctx.arc(p[0], p[1], s.w / 2, 0, Math.PI * 2); ctx.fill(); return; }
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length - 2; i += 2) {              // 점 사이를 가운데점으로 이어 부드럽게 굽힌다
        const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2;
        ctx.quadraticCurveTo(p[i], p[i + 1], mx, my);
    }
    ctx.lineTo(p[p.length - 2], p[p.length - 1]);
    ctx.stroke();
}
// 바뀐 때에만 다시 그린다 (사라지는 것이 없으니 틀마다 그릴 일이 없다)
function paint() {
    S.raf = 0;
    const st = stage();
    if (!st || !S.cv || !S.ctx || S.cv.parentNode !== st.el) return;
    const ctx = S.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, S.cv.width, S.cv.height);
    ctx.setTransform(S.cv.width / st.w, 0, 0, S.cv.height / st.h, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    Object.keys(S.strokes).sort(function (a, b) { return (S.strokes[a].at || 0) - (S.strokes[b].at || 0) || (a < b ? -1 : 1); })
        .forEach(function (k) { trace(ctx, S.strokes[k]); });
    if (S.live) trace(ctx, S.live);
}
function kick() { if (!S.raf) S.raf = requestAnimationFrame(paint); }

// ==========================================
// 서버 — 이 쇼의 획을 듣는다
// ==========================================
function okStroke(v) {
    if (!v || typeof v !== 'object') return false;
    if (typeof v.c !== 'string' || !/^#[0-9a-f]{6}$/i.test(v.c)) return false;
    if (typeof v.w !== 'number' || !(v.w > 0) || v.w > 400) return false;
    const p = Array.isArray(v.p) ? v.p : (v.p && typeof v.p === 'object' ? Object.keys(v.p).map(function (k) { return v.p[k]; }) : null);
    if (!p || p.length < 2 || p.length > TD.MAX_PTS * 2 + 2) return false;
    return true;
}
function ptsOf(v) { return (Array.isArray(v.p) ? v.p : Object.keys(v.p).map(function (k) { return v.p[k]; })).map(Number); }
function listen(n) {
    unlisten();
    const d = db_();
    if (!d || !n) return;
    S.host = n.host; S.sid = n.id;
    const ref = d.ref(TD.PATH + '/' + n.host);
    S.ref = ref;
    S.onAdd = function (snap) {
        if (S.ref !== ref) return;
        const k = snap.key, v = snap.val();
        if (!okStroke(v)) return;
        if (Number(v.sid) !== Number(S.sid)) {                // 앞선 쇼의 것 — 사회자 화면이 치운다
            const me = u_();
            if (me && me.code === S.host) { try { ref.child(k).remove(); } catch (e) { } }
            return;
        }
        S.strokes[k] = { c: v.c, w: v.w, p: ptsOf(v), at: Number(v.at) || 0, by: String(v.by || '') };
        kick();
    };
    S.onDel = function (snap) { if (S.ref === ref && S.strokes[snap.key]) { delete S.strokes[snap.key]; kick(); } };
    ref.on('child_added', S.onAdd);
    ref.on('child_removed', S.onDel);
}
function unlisten() {
    if (S.ref) {
        try { S.ref.off('child_added', S.onAdd); } catch (e) { }
        try { S.ref.off('child_removed', S.onDel); } catch (e) { }
    }
    S.ref = null; S.onAdd = null; S.onDel = null; S.host = ''; S.sid = 0;
    S.strokes = {}; S.live = null; S.erasing = null;
    kick();
}
// 손을 뗀 획을 적는다 — 지우거나 나갈 때까지 남는다 (끊겨도 지우지 않는다)
function publish(live) {
    const u = u_();
    if (!S.ref || !u) return;
    if (Object.keys(S.strokes).length >= TD.MAX_STROKES) { tip('🖌 그림이 가득 찼습니다 — 지우개로 지운 뒤에 더 그릴 수 있습니다'); return; }
    let p = live.p;
    if (p.length > TD.MAX_PTS * 2) {                          // 너무 길면 솎는다 (첫 점과 끝 점은 남긴다)
        const n = p.length / 2, step = n / TD.MAX_PTS, q = [];
        for (let i = 0; i < TD.MAX_PTS - 1; i++) { const j = Math.floor(i * step) * 2; q.push(p[j], p[j + 1]); }
        q.push(p[p.length - 2], p[p.length - 1]);
        p = q;
    }
    p = p.map(function (x) { return Math.round(x * 10) / 10; });
    const v = { by: u.code, n: String(u.name || '').slice(0, 20), at: now(), sid: S.sid, c: live.c, w: Math.round(live.w * 10) / 10, p: p };
    try {
        const r = S.ref.push();
        S.strokes[r.key] = { c: v.c, w: v.w, p: p, at: v.at, by: v.by };      // 서버에서 돌아오기 전에도 보이게
        r.set(v);
    } catch (e) { }
    kick();
}
function removeKey(k) {
    if (!S.strokes[k]) return;
    delete S.strokes[k];
    try { if (S.ref) S.ref.child(k).remove(); } catch (e) { }
    kick();
}
// 지우개 — 이 점에 닿는 획을 지운다 (누가 그린 것이든). r 은 방 그림 눈금.
function eraseAt(x, y, r) {
    Object.keys(S.strokes).forEach(function (k) {
        const s = S.strokes[k], p = s.p, lim = r + s.w / 2;
        if (p.length < 4) { if (Math.hypot(p[0] - x, p[1] - y) <= lim) removeKey(k); return; }
        for (let i = 0; i < p.length - 2; i += 2) {
            const ax = p[i], ay = p[i + 1], bx = p[i + 2], by = p[i + 3];
            const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
            let t = L ? ((x - ax) * dx + (y - ay) * dy) / L : 0;
            t = Math.max(0, Math.min(1, t));
            if (Math.hypot(ax + dx * t - x, ay + dy * t - y) <= lim) { removeKey(k); return; }
        }
    });
}
function undoMine() {
    const u = u_(); if (!u) return;
    const mine = Object.keys(S.strokes).filter(function (k) { return S.strokes[k].by === u.code; })
        .sort(function (a, b) { return (S.strokes[a].at || 0) - (S.strokes[b].at || 0) || (a < b ? -1 : 1); });
    if (!mine.length) { tip('↩ 내가 그린 것이 없습니다'); return; }
    removeKey(mine[mine.length - 1]);
}
// 그 사람이 그린 것을 지운다 — 듣고 있지 않아도 서버에서 찾아 지운다
function dropBy(host, code) {
    const d = db_();
    if (!d || !host || !code) return;
    if (S.host === host) Object.keys(S.strokes).forEach(function (k) { if (S.strokes[k].by === code) delete S.strokes[k]; });
    kick();
    const ref = d.ref(TD.PATH + '/' + host);
    try {
        ref.once('value').then(function (snap) {
            const v = snap.val() || {};
            Object.keys(v).forEach(function (k) { if (v[k] && v[k].by === code) { try { ref.child(k).remove(); } catch (e) { } } });
        }).catch(function () { });
    } catch (e) { }
}
window.talkDrawLeave = function (host) { const u = u_(); if (u) dropBy(host, u.code); closeBoard(); };
window.talkDrawDrop = function (host, code) { dropBy(host, code); };
window.talkDrawClear = function (host) {
    const d = db_();
    if (!d || !host) return;
    if (S.host === host) { S.strokes = {}; kick(); }
    try { d.ref(TD.PATH + '/' + host).remove(); } catch (e) { }
};

// ==========================================
// 그림판
// ==========================================
function roomXY(st, e) {
    const b = st.el.getBoundingClientRect();
    if (!b.width || !b.height) return null;
    const x = (e.clientX - b.left) * st.w / b.width;
    const y = (e.clientY - b.top) * st.h / b.height;
    return [Math.max(0, Math.min(st.w, x)), Math.max(0, Math.min(st.h, y))];
}
const TIP = '🖌 그린 것은 지우거나 무대에서 나갈 때까지 남습니다';
let tipT = 0;
function tip(t) {
    const e = S.board && S.board.querySelector('.tb-tip');
    if (!e) { if (t) sys(t); return; }
    e.textContent = t || TIP;
    clearTimeout(tipT);
    if (t) tipT = setTimeout(function () { const x = S.board && S.board.querySelector('.tb-tip'); if (x) x.textContent = TIP; }, 2600);
}
function buildBoard(ov, n) {
    const bd = document.createElement('div');
    bd.id = 'td-board';
    bd.className = 'plaza-keep';
    let cols = '', sizes = '';
    TD.COLORS.forEach(function (c) { cols += '<button class="tb-c' + (c === S.color ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '" aria-label="색"></button>'; });
    TD.SIZES.forEach(function (w) {
        const dot = Math.max(4, Math.min(16, w + 2));
        sizes += '<button class="tb-s' + (w === S.size ? ' on' : '') + '" data-w="' + w + '" aria-label="굵기"><i style="width:' + dot + 'px;height:' + dot + 'px"></i></button>';
    });
    bd.innerHTML = '<div class="tb-bar">'
        + '<div class="tb-row">' + cols + '<span class="tb-gap"></span>' + sizes + '</div>'
        + '<div class="tb-row">'
        + '<button class="tb-b" data-a="erase">🧽 지우개</button>'
        + '<button class="tb-b" data-a="undo">↩ 되돌리기</button>'
        + (n && n.isHost ? '<button class="tb-b" data-a="all">🗑 모두 지우기</button>' : '')
        + '<button class="tb-b" data-a="x">닫기</button></div>'
        + '<div class="tb-tip">' + TIP + '</div></div>';
    const setTool = function (t) {
        S.tool = t;
        bd.classList.toggle('erase', t === 'erase');
        const eb = bd.querySelector('[data-a="erase"]'); if (eb) eb.classList.toggle('on', t === 'erase');
    };
    setTool(S.tool);
    bd.querySelector('.tb-bar').addEventListener('click', function (e) {
        const t = e.target.closest('button');
        if (!t) return;
        e.stopPropagation();
        const a = t.dataset.a;
        if (a !== 'all') { S.askAll = 0; const ab = bd.querySelector('[data-a="all"]'); if (ab) { ab.classList.remove('warn'); ab.textContent = '🗑 모두 지우기'; } }
        if (a === 'x') { closeBoard(); return; }
        if (a === 'erase') { setTool(S.tool === 'erase' ? 'pen' : 'erase'); return; }
        if (a === 'undo') { undoMine(); return; }
        if (a === 'all') {                                    // 한 번 더 눌러야 지운다
            if (Date.now() - S.askAll < 4000) { S.askAll = 0; t.classList.remove('warn'); t.textContent = '🗑 모두 지우기'; if (S.host) window.talkDrawClear(S.host); tip('🗑 모두 지웠습니다'); }
            else { S.askAll = Date.now(); t.classList.add('warn'); t.textContent = '한 번 더 누르면 다 지웁니다'; }
            return;
        }
        if (t.dataset.c) {
            S.color = t.dataset.c; setTool('pen');
            bd.querySelectorAll('.tb-c').forEach(function (b) { b.classList.toggle('on', b === t); });
        }
        if (t.dataset.w) {
            S.size = Number(t.dataset.w) || TD.SIZES[1];
            bd.querySelectorAll('.tb-s').forEach(function (b) { b.classList.toggle('on', b === t); });
        }
    });
    const rub = function (st, ev) {
        const xy = roomXY(st, ev);
        if (!xy) return;
        const z = (st.el.getBoundingClientRect().width / st.w) || st.z || 1;
        eraseAt(xy[0], xy[1], TD.ERASE / z);
    };
    const finish = function (e) {
        if (S.erasing != null && (!e || e.pointerId === S.erasing)) { S.erasing = null; return; }
        const L = S.live;
        if (!L || (e && e.pointerId !== L.pid)) return;
        S.live = null;
        if (L.p.length >= 2) publish(L);
        kick();
    };
    bd.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.tb-bar')) return;
        e.preventDefault();
        e.stopPropagation();
        if (S.live || S.erasing != null) return;               // 손가락 하나로만
        const st = stage();
        if (!st || !S.ref || !ensureCanvas(st)) return;
        try { bd.setPointerCapture(e.pointerId); } catch (er) { }
        if (S.tool === 'erase') { S.erasing = e.pointerId; rub(st, e); return; }
        const xy = roomXY(st, e);
        if (!xy) return;
        const z = (st.el.getBoundingClientRect().width / st.w) || st.z || 1;
        S.live = { c: S.color, w: S.size / z, p: [xy[0], xy[1]], pid: e.pointerId, lx: e.clientX, ly: e.clientY };
        kick();
    });
    bd.addEventListener('pointermove', function (e) {
        const st = stage();
        if (!st) return;
        const evs = (typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
        if (S.erasing != null && e.pointerId === S.erasing) { e.preventDefault(); evs.forEach(function (ev) { rub(st, ev); }); return; }
        const L = S.live;
        if (!L || e.pointerId !== L.pid) return;
        e.preventDefault();
        evs.forEach(function (ev) {
            if (Math.hypot(ev.clientX - L.lx, ev.clientY - L.ly) < TD.STEP) return;
            if (L.p.length >= TD.MAX_PTS * 4) return;           // 아주 긴 획은 그만 받는다 (적을 때 솎는다)
            const xy = roomXY(st, ev);
            if (!xy) return;
            L.p.push(xy[0], xy[1]);
            L.lx = ev.clientX; L.ly = ev.clientY;
        });
        kick();
    });
    bd.addEventListener('pointerup', finish);
    bd.addEventListener('pointercancel', finish);
    bd.addEventListener('lostpointercapture', finish);
    bd.addEventListener('click', function (e) { e.stopPropagation(); });      // 그림판 위의 톡 치기가 광장으로 새지 않게
    ov.appendChild(bd);
    return bd;
}
function openBoard() {
    const st = stage(), n = showNow();
    if (!st || !st.ov || !n) return false;
    if (!S.board || !S.board.isConnected) S.board = buildBoard(st.ov, n);
    S.open = true;
    st.ov.classList.add('td-on');
    ensureCanvas(st);
    return true;
}
function closeBoard() {
    S.open = false;
    S.live = null; S.erasing = null; S.askAll = 0;
    if (S.board) { try { S.board.remove(); } catch (e) { } }
    S.board = null;
    const ov = document.getElementById('plaza-ov');
    if (ov) ov.classList.remove('td-on');
    kick();
}
window.addEventListener('keydown', function (e) {
    if (S.open && e.key === 'Escape') { e.stopPropagation(); closeBoard(); }
}, true);

// ==========================================
// [🖌 그림] 단추 · 돌보기
// ==========================================
function ensureBtn(ov) {
    if (S.btn && S.btn.isConnected && S.btn.parentNode === ov) return S.btn;
    const b = document.createElement('button');
    b.id = 'td-btn';
    b.className = 'plaza-keep';
    b.textContent = '🖌 그림';
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); if (S.open) closeBoard(); else openBoard(); });
    ov.appendChild(b);
    S.btn = b;
    return b;
}
function teardown() {
    if (S.ref) unlisten();
    if (S.open || S.board) closeBoard();
    if (S.btn) { try { S.btn.remove(); } catch (e) { } S.btn = null; }
    if (S.cv) { try { S.cv.remove(); } catch (e) { } }
    S.cv = null; S.ctx = null; S.dim = '';
}
function tick() {
    const st = stage(), n = showNow();
    if (!st || !st.ov || !n) { if (S.ref || S.btn || S.cv || S.board) teardown(); return; }
    if (S.host !== n.host || Number(S.sid) !== Number(n.id) || !S.ref) listen(n);
    ensureCanvas(st);
    ensureBtn(st.ov);
}
setInterval(function () { try { tick(); } catch (e) { } }, TD.POLL);

// ==========================================
// 콘솔
// ==========================================
window.talkDrawOpen = function () { tick(); return openBoard(); };
window.talkDrawClose = closeBoard;
window.talkDrawState = function () {
    const u = u_(), n = showNow();
    const o = {
        그릴수있나: !!n, 쇼: n ? (n.host === (u && u.code) ? '내 쇼' : '초대받은 쇼') : '-', 그림판: S.open, 도구: S.tool,
        보이는획: Object.keys(S.strokes).length,
        내획: u ? Object.keys(S.strokes).filter(function (k) { return S.strokes[k].by === u.code; }).length : 0,
        한도: TD.MAX_STROKES, 캔버스: S.dim
    };
    console.log('%c===== 🖌 심야 토크쇼 — 그림 =====', 'color:#c79a5b; font-size:13px');
    console.log(o);
    return o;
};
window.TALK_DRAW_CFG = TD;
window.talkDrawDebug = { S: S, eraseAt: eraseAt, undo: undoMine };

console.log('[🖌 심야 토크쇼] 무대 위에 다 같이 그리는 그림 — 지우거나 나갈 때까지 남는다 · talkDrawState()');
})();
