// ==========================================
// ★ 🧸 봉제인형 — 걸어 다니는 맵 넷 (출몰지 · 도깨비 공방 앞 · 도깨비 공방 · 매직버니 아케이드존)
// bundles.json 마지막 묶음 — doll-data.js 다음 · plaza.js 보다 뒤
// ==========================================
//
// 2026-11-07 사용자 「여정 시스템을 이렇게 구현하자. 야생 펫 조우 맵. 펫 전투 화면. + 도깨비 공방 추가」
//
// ■ 맵
//   wild    봉제인형 출몰지   ←광장 · 재난관리국→ 표지판이 선 길. 수풀 · 잡동사니(오브제 층) 뒤를 걸으면 확률로 조우.
//   gfront  도깨비 공방 앞    처음 오면 튜토리얼이 시작된다 (「김서방!!!!」).
//   gong    도깨비 공방       수선소 · 잡화점 · 교환소 · 보관소 · 가운데 계산대(도감).
//   arcade  매직버니 아케이드존 — 펫 동행 어둠. 시야가 둥글게 막혀 있고, 길에 괴담 넷 · 오른쪽 무대에 보스.
//
//   광장과는 이렇게 잇는다 (광장 쪽 그림은 그대로다):
//       [광장] ─(오른쪽 끝 입구)→ [출몰지] → [공방 앞] → [재난관리국 앞]
//       [재난관리국 앞] ─(왼쪽 끝 입구)→ [공방 앞]
//   아케이드존은 여정(재난관리국 B2 · ☰ 여정)의 두 번째 칸에서 들어간다.
//
// ■ 걷기
//   광장처럼 아무 데나 누르면 그리로 걷는다 (누른 채 끌면 따라간다). 바닥은 선(계단 포함)으로 이어져 있어
//   다른 층을 누르면 계단을 돌아서 간다. 입구 · 도깨비를 누르면 그 앞까지 걸어가서 연다.
//   동행 인형 첫째가 뒤를 따라온다.
//
// ■ 콘솔
//   dollGo('wild')   그 맵으로 바로 · dollSceneState()

(function dollScene() {
'use strict';

const D = function () { return window.DOLL; };
const OV = 'ds-ov';
const SPD = 62;                     // 1초에 몇 칸(그림 원래 크기) 걷나
const STEP = 26;                    // 튜토리얼 — 오브제 뒤를 이만큼 걸으면 바로 나온다
// ★ 출몰지 조우 — 500~700 걸음에 한 번 (2026-11-07 사용자 「확률적이게 · 한 500~700번 걸어야 한 번 나오는 정도로」)
//   걸음 하나 = 캐릭터 발걸음 하나 — 걷기 그림 한 바퀴(6칸 × 0.12초)에 두 걸음 → SPD 62 로 약 22칸
//   출몰지 어디를 걸어도 센다. 몇 걸음째에 나올지는 500~700 사이에서 그때그때 정하고,
//   다 채우면 다음에 수상한 장소(수풀 · 잡동사니 뒤)를 밟을 때 나온다. 센 걸음은 이 기기에 적어 둔다 (나갔다 와도 이어서).
const FOOT = SPD * 0.36;
const ENC_STEPS = [500, 700];
const K_STEP = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];

// ==========================================
// 맵
// ==========================================
//   lines — 걸을 수 있는 선 (같은 점은 이어진다) · band — 화면 세로에 맞출 띠 · body — 사람 키(그림 칸)
//   spots — 누르는 자리 { x, y(발 닿는 자리), n, i, act } · npcs — 그림에 그려진 사람 { r:[x0,y0,x1,y1], x, y, n, act }
//   zones — 조우 자리 { x:[a,b], y }
const SC = {
    wild: {
        n: '봉제인형 출몰지', img: 'doll/wild.webp', ob: 'doll/wild-ob.webp', w: 1536, h: 512, band: [40, 372], body: 46, bt: 'wild',
        zoom: 0.68,                                      // 2026-11-07 사용자 「출몰지 배경 너무 확대 되어서 좀 줌 아웃」
        lines: [
            [[0, 219], [530, 219], [588, 243], [650, 243], [785, 243], [805, 243], [845, 222], [1305, 222], [1536, 222]],
            [[0, 315], [560, 315], [650, 243]],
            [[785, 243], [872, 313], [1180, 313], [1305, 222]]
        ],
        zones: [
            { x: [131, 377], y: 219 }, { x: [1024, 1197], y: 222 }, { x: [1225, 1287], y: 222 }, { x: [1321, 1494], y: 222 },
            { x: [26, 128], y: 315 }, { x: [216, 308], y: 315 }, { x: [415, 517], y: 315 }, { x: [858, 934], y: 313 }, { x: [1010, 1112], y: 313 }
        ],
        spots: [
            // 2026-11-07 — 공방이 재관국 앞 오른쪽으로 옮겼다: 재관국 앞 → 공방 앞 → 출몰지 → 광장
            { x: 4, y: 219, n: '도깨비 공방', i: '◀', edge: 1, act: 'toGfrontR' },
            { x: 4, y: 315, n: '도깨비 공방', i: '◀', edge: 1, act: 'toGfrontR' },
            { x: 1532, y: 222, n: '광장', i: '▶', edge: 1, act: 'toPlaza' }
        ],
        start: { left: [16, 219], right: [1520, 222] }
    },
    gfront: {
        n: '도깨비 공방 앞', img: 'doll/gfront.webp', w: 470, h: 512, band: [25, 357], body: 46, bt: 'wild',
        lines: [
            [[0, 219], [48, 219], [245, 219], [422, 219], [470, 219]],
            [[48, 219], [70, 250], [102, 252], [138, 316], [236, 316], [332, 316], [368, 252], [400, 250], [422, 219]]
        ],
        spots: [
            { x: 4, y: 219, n: '재난관리국 앞', i: '◀', edge: 1, act: 'toGate' },
            { x: 466, y: 219, n: '출몰지', i: '▶', edge: 1, act: 'toWildL' },
            { x: 245, y: 219, n: '도깨비 공방', i: '🚪', act: 'toGong' },
            { x: 236, y: 316, n: '도깨비 공방', i: '🚪', act: 'toGong' }
        ],
        start: { left: [16, 219], right: [454, 219], door: [236, 316] }
    },
    gong: {
        n: '도깨비 공방', img: 'doll/gong.webp', w: 899, h: 512, band: [20, 420], body: 62, bt: 'wild',
        lines: [
            [[25, 240], [160, 240], [385, 240], [680, 240], [815, 240], [885, 240]],
            [[25, 240], [165, 400], [245, 400], [385, 400], [505, 400], [730, 400], [800, 400]]
        ],
        npcs: [
            { id: 'sew',   r: [128, 172, 182, 246], x: 160, y: 240, n: '수선소 도깨비', act: 'sew' },
            { id: 'shop',  r: [226, 312, 264, 364], x: 245, y: 400, n: '잡화점 도깨비', act: 'shop' },
            { id: 'trade', r: [486, 316, 527, 364], x: 505, y: 400, n: '교환소 도깨비', act: 'trade' },
            { id: 'box',   r: [745, 110, 875, 242], x: 815, y: 240, n: '보관소', act: 'box' },
            { id: 'dex',   r: [318, 196, 452, 250], x: 385, y: 240, n: '봉제인형 도감', act: 'dex' },
            { id: 'mask',  r: [652, 160, 706, 238], x: 680, y: 240, n: '💠 각성 공방', act: 'mask' },
            { id: 'nap',   r: [694, 336, 770, 398], x: 730, y: 400, n: '조는 도깨비', act: 'nap' },
            { id: 'door',  r: [350, 296, 422, 398], x: 385, y: 400, n: '나간다', act: 'toGfrontDoor' }
        ],
        start: { door: [385, 400] }
    },
    arcade: {
        n: '매직버니 아케이드존', img: 'doll/arcade.webp', w: 1536, h: 512, band: [45, 365], body: 50, bt: 'arcade', dark: 1, vision: 86,
        lines: [ [[20, 333], [95, 333], [1495, 333]] ],
        spots: [ { x: 95, y: 333, n: '나간다', i: '🚪', act: 'arcadeQuit' } ],
        mons: [ { x: 236 }, { x: 543 }, { x: 834 }, { x: 1135 } ],
        boss: { x: 1385, y: 300, at: 1290 },
        start: { spawn: [80, 333] }
    }
};

// ==========================================
// 바탕
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function snapK(v) { let b = K_STEP[0]; K_STEP.forEach(function (k) { if (Math.abs(k - v) < Math.abs(b - v)) b = k; }); return b; }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }
function quarantined() { try { return typeof isQuarantined === 'function' && isQuarantined(u_()); } catch (e) { return false; } }

// ==========================================
// 선 — 그래프
// ==========================================
function graphOf(sc) {
    if (sc._g) return sc._g;
    const nodes = [], idx = {}, adj = [];
    const nodeOf = function (p) {
        const k = p[0] + ',' + p[1];
        if (idx[k] == null) { idx[k] = nodes.length; nodes.push([p[0], p[1]]); adj.push([]); }
        return idx[k];
    };
    const edges = [];
    sc.lines.forEach(function (ln) {
        for (let i = 0; i + 1 < ln.length; i++) {
            const a = nodeOf(ln[i]), b = nodeOf(ln[i + 1]);
            const len = Math.hypot(ln[i + 1][0] - ln[i][0], ln[i + 1][1] - ln[i][1]);
            edges.push({ a: a, b: b, len: len });
            adj[a].push({ to: b, len: len });
            adj[b].push({ to: a, len: len });
        }
    });
    sc._g = { nodes: nodes, edges: edges, adj: adj };
    return sc._g;
}
// 가장 가까운 선 위 자리 — 누른 자리보다 **아래 바닥**을 더 친다 (사람 몸을 눌러도 그 사람이 선 바닥으로)
function nearest(sc, x, y, plain) {
    const g = graphOf(sc);
    let best = null, bs = Infinity;
    g.edges.forEach(function (e, ei) {
        const A = g.nodes[e.a], B = g.nodes[e.b];
        const dx = B[0] - A[0], dy = B[1] - A[1];
        const L2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((x - A[0]) * dx + (y - A[1]) * dy) / L2));
        const px = A[0] + dx * t, py = A[1] + dy * t;
        const ddx = px - x, ddy = py - y;
        const s = plain ? (ddx * ddx + ddy * ddy) : (ddx * ddx * 0.6 + (ddy < 0 ? ddy * ddy * 3 : ddy * ddy));
        if (s < bs) { bs = s; best = { e: ei, t: t, x: px, y: py }; }
    });
    return best;
}
// 길 찾기 — from · to 는 nearest 가 돌려준 자리. 돌려주는 값은 거쳐 갈 점들
function route(sc, from, to) {
    const g = graphOf(sc);
    if (!from || !to) return [];
    if (from.e === to.e) return [[to.x, to.y]];
    const N = g.nodes.length, S = N, T = N + 1;
    const dist = new Array(N + 2).fill(Infinity), prev = new Array(N + 2).fill(-1), done = new Array(N + 2).fill(false);
    const ef = g.edges[from.e], et = g.edges[to.e];
    const link = function (i) {
        const out = (i < N) ? g.adj[i].slice() : [];
        if (i === S) {
            out.push({ to: ef.a, len: ef.len * from.t });
            out.push({ to: ef.b, len: ef.len * (1 - from.t) });
        }
        if (i === et.a) out.push({ to: T, len: et.len * to.t });
        if (i === et.b) out.push({ to: T, len: et.len * (1 - to.t) });
        return out;
    };
    dist[S] = 0;
    for (;;) {
        let u = -1, du = Infinity;
        for (let i = 0; i < N + 2; i++) if (!done[i] && dist[i] < du) { du = dist[i]; u = i; }
        if (u < 0 || u === T) break;
        done[u] = true;
        link(u).forEach(function (l) { if (dist[u] + l.len < dist[l.to]) { dist[l.to] = dist[u] + l.len; prev[l.to] = u; } });
    }
    if (dist[T] === Infinity) return [[to.x, to.y]];
    const pts = [];
    let c = prev[T];
    while (c >= 0 && c !== S) { pts.unshift(g.nodes[c].slice()); c = prev[c]; }
    pts.push([to.x, to.y]);
    return pts;
}

// ==========================================
// 상태
// ==========================================
let run = null;
//   run = { key, sc, el, world, Z, k, x, y, at(선 위 자리), path, face, me(actor), meEl, doll, trail, busy, talkOn,
//           tut, encAcc, encOff, mons, arc, onTick, raf, last }

function css() {
    if (document.getElementById('ds-css')) return;
    const s = document.createElement('style');
    s.id = 'ds-css';
    s.textContent = [
        '#ds-ov{position:fixed;inset:0;z-index:99990;background:#0b0a12;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;font-family:inherit}',
        '#ds-ov .ds-world{position:absolute;left:0;top:0;will-change:transform}',
        '#ds-ov .ds-bg,#ds-ov .ds-ob{position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none}',
        '#ds-ov .ds-ob{z-index:5000}',
        '#ds-ov .ds-act{position:absolute;pointer-events:none}',
        '#ds-ov .ds-doll{position:absolute;pointer-events:none;transition:none}',
        '#ds-ov .ds-npcs{position:absolute;pointer-events:none;background-image:url(doll/npc.webp);background-repeat:no-repeat;image-rendering:pixelated}',
        '#ds-ov .ds-mon{position:absolute;pointer-events:none;transition:opacity .5s, transform .5s}',
        '#ds-ov .ds-spot{position:absolute;z-index:6000;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}',
        '#ds-ov .ds-spot .b{min-width:30px;height:30px;padding:0 6px;border-radius:15px;background:rgba(20,16,32,.78);border:1px solid rgba(255,220,160,.55);color:#ffe6b8;font-size:15px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5)}',
        '#ds-ov .ds-spot .t{font-size:10px;color:#ffe6b8;background:rgba(0,0,0,.55);padding:1px 6px;border-radius:7px;white-space:nowrap}',
        '#ds-ov .ds-tag{position:absolute;z-index:6000;transform:translate(-50%,-100%);font-size:10px;color:#fff3d6;background:rgba(40,24,30,.72);border:1px solid rgba(255,210,150,.45);padding:1px 7px;border-radius:8px;white-space:nowrap;pointer-events:none}',
        '#ds-ov .ds-top{position:absolute;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;display:flex;align-items:center;gap:8px;z-index:20000;pointer-events:none}',
        '#ds-ov .ds-top .nm{pointer-events:auto;background:rgba(10,8,18,.72);color:#ffe6b8;font-size:12px;padding:6px 11px;border-radius:14px;border:1px solid rgba(255,220,160,.35)}',
        '#ds-ov .ds-top .sp{flex:1}',
        '#ds-ov .ds-top button{pointer-events:auto;background:rgba(10,8,18,.78);color:#ffe6b8;border:1px solid rgba(255,220,160,.35);border-radius:14px;font-size:12px;padding:6px 11px;min-width:34px}',
        '#ds-ov .ds-sys{position:absolute;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:20000;text-align:center;pointer-events:none}',
        '#ds-ov .ds-sys span{display:inline-block;background:rgba(10,8,18,.8);color:#dcd2ff;font-size:11.5px;line-height:1.5;padding:7px 12px;border-radius:12px;border:1px solid rgba(180,160,255,.3);transition:opacity .4s}',
        '#ds-ov .ds-vis{position:absolute;inset:0;z-index:9000;pointer-events:none}',
        '#ds-ov .ds-talk{position:absolute;left:8px;right:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:30000;background:rgba(18,12,26,.94);border:2px solid #a78bdb;border-radius:10px;padding:12px 14px 22px;color:#f2ecff;font-size:14px;line-height:1.65;min-height:76px;box-shadow:0 4px 18px rgba(0,0,0,.6)}',
        '#ds-ov .ds-talk .who{position:absolute;top:-13px;left:12px;background:#4b3a74;color:#ffe6b8;font-size:11px;padding:2px 10px;border-radius:9px;border:1px solid #a78bdb}',
        '#ds-ov .ds-talk .nx{position:absolute;right:12px;bottom:6px;font-size:11px;color:#c9b8ff;animation:dsnx 1s infinite}',
        '#ds-ov .ds-talk .ch{display:flex;flex-direction:column;gap:6px;margin-top:10px}',
        '#ds-ov .ds-talk .ch button{background:#3a2d5c;color:#f2ecff;border:1px solid #a78bdb;border-radius:8px;padding:9px;font-size:13px;text-align:left}',
        '#ds-ov .ds-talk.sys{border-color:#6fd3c4;color:#c8fff6}',
        '#ds-ov .ds-flash{position:absolute;inset:0;z-index:40000;pointer-events:none;background:#fff;opacity:0}',
        '#ds-ov .ds-ex{position:absolute;z-index:6100;transform:translate(-50%,-100%);font-size:18px;font-weight:bold;color:#ffe14d;text-shadow:0 0 3px #000,0 0 6px #000;pointer-events:none}',
        '@keyframes dsnx{0%,100%{opacity:.3}50%{opacity:1}}',
        '@keyframes dsbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}',
        '@keyframes dsjump{0%{transform:translateY(0)}30%{transform:translateY(-40%)}60%{transform:translateY(0)}75%{transform:translateY(-14%)}100%{transform:translateY(0)}}'
    ].join('\n');
    document.head.appendChild(s);
}

function vp() { const el = document.getElementById(OV); return { w: (el && el.clientWidth) || window.innerWidth, h: (el && el.clientHeight) || window.innerHeight }; }

// ==========================================
// 열고 닫기
// ==========================================
//   key 맵 · at 들어설 자리 [x, y] 또는 start 이름 · opt { tut, arc }
function open(key, at, opt) {
    const sc = SC[key];
    const u = u_();
    if (!sc || !u) return;
    opt = opt || {};
    css();
    let ov = document.getElementById(OV);
    if (!ov) {
        ov = document.createElement('div');
        ov.id = OV;
        document.body.appendChild(ov);
        bindInput(ov);
        window.addEventListener('resize', onResize);
    }
    if (run && run.raf) cancelAnimationFrame(run.raf);
    stopActor();
    ov.innerHTML = '<div class="ds-world"><img class="ds-bg" alt=""></div>'
        + '<div class="ds-top"><span class="nm"></span><span class="sp"></span><button class="ds-x" title="나간다">✕</button></div>'
        + '<div class="ds-sys"><span style="opacity:0"></span></div><div class="ds-flash"></div>';
    const keepTut = run && run.tut, keepArc = (opt.arc !== undefined) ? opt.arc : (run && key === 'arcade' ? run.arc : null);
    run = { key: key, sc: sc, el: ov, world: ov.querySelector('.ds-world'), path: [], face: -1, trail: [], encAcc: 0, encOff: Date.now() + 1500,
            tut: opt.tut || keepTut || null, arc: keepArc, busy: false, last: 0, npcEl: null, tags: [], pt: opt.party || null, mates: {} };
    ov.querySelector('.nm').textContent = '📍 ' + (opt.title || sc.n);
    if (run.pt) { const n0 = nearest(sc, run.pt.posOf(run.pt.me()), 333, true); at = [n0.x, n0.y]; }
    ov.querySelector('.ds-x').onclick = function (ev) { ev.stopPropagation(); quit(); };
    const bg = ov.querySelector('.ds-bg');
    bg.src = sc.img;
    if (sc.ob) { const ob = document.createElement('img'); ob.className = 'ds-ob'; ob.src = sc.ob; ob.alt = ''; run.world.appendChild(ob); }
    let p = Array.isArray(at) ? at : ((sc.start && sc.start[at]) || (sc.start && sc.start[Object.keys(sc.start)[0]]) || sc.lines[0][0]);
    const n = nearest(sc, p[0], p[1], true);
    run.x = n.x; run.y = n.y; run.at = n;
    if (n.x > sc.w * 0.75) run.face = 1;                 // 오른쪽 끝에서 들어오면 맵 안쪽(왼쪽)을 본다
    layout();
    makeMe();
    makeDoll();
    paintSpots();
    if (sc.dark) makeVision();
    if (key === 'arcade') arcadePaint();
    tick();
    try { if (window.DOLL && DOLL.sweep) DOLL.sweep(); } catch (e) { }
    setTimeout(function () { onEnter(key, opt); }, 60);
}
function close() {
    if (!run) return;
    if (run.raf) cancelAnimationFrame(run.raf);
    stopActor();
    const ov = document.getElementById(OV);
    if (ov) ov.remove();
    window.removeEventListener('resize', onResize);
    run = null;
}
function stopActor() {
    try { if (run && run.me && run.me.stop) run.me.stop(); } catch (e) { }
    try { if (run && run.meEl && window.dotStop) window.dotStop(run.meEl.firstChild); } catch (e) { }
}
let rsT = 0;
function onResize() {
    clearTimeout(rsT);
    rsT = setTimeout(function () {
        if (!run) return;
        const k0 = run.k;
        layout();
        if (run.k !== k0) makeMe();
        makeDoll(); paintSpots(); if (run.sc.dark) makeVision(); if (run.key === 'arcade') arcadePaint();
        paintNpc();
    }, 150);
}

// 화면에 맞춘다 — 띠(band)가 세로에 꼭 맞게
function layout() {
    const sc = run.sc, v = vp();
    run.Z = v.h / (sc.band[1] - sc.band[0]) * (sc.zoom || 1);
    run.k = snapK(sc.body * run.Z / 236);
    const W = Math.round(sc.w * run.Z), H = Math.round(sc.h * run.Z);
    const bg = run.el.querySelector('.ds-bg');
    bg.style.width = W + 'px'; bg.style.height = H + 'px';
    const ob = run.el.querySelector('.ds-ob');
    if (ob) { ob.style.width = W + 'px'; ob.style.height = H + 'px'; }
    run.world.style.width = W + 'px'; run.world.style.height = H + 'px';
}
function camera() {
    const sc = run.sc, v = vp(), Z = run.Z;
    const W = sc.w * Z;
    let cx = (run.lookX != null ? run.lookX : run.x) * Z - v.w / 2;
    if (W <= v.w) cx = (W - v.w) / 2;
    else cx = Math.max(0, Math.min(W - v.w, cx));
    run.cx = cx;
    run.cy = sc.band[0] * Z - Math.max(0, (v.h - (sc.band[1] - sc.band[0]) * Z) / 2);   // 줌 아웃하면 띠를 세로 가운데에
    run.world.style.transform = 'translate(' + Math.round(-cx) + 'px,' + Math.round(-run.cy) + 'px)';
}
function toScreen(x, y) { return { x: x * run.Z - run.cx, y: y * run.Z - run.cy }; }
function toWorld(sx, sy) { return { x: (sx + run.cx) / run.Z, y: (sy + run.cy) / run.Z }; }

// ==========================================
// 나 · 따라오는 인형
// ==========================================
function makeMe() {
    stopActor();
    if (run.meEl) run.meEl.remove();
    const u = u_();
    const wrap = document.createElement('div');
    wrap.className = 'ds-act';
    let spec = { W: 352, H: 384, FOOT: 32 };
    try { if (window.dotSpec) spec = window.dotSpec(); } catch (e) { }
    run.spec = spec;
    wrap.style.width = Math.round(spec.W * run.k) + 'px';
    wrap.style.height = Math.round(spec.H * run.k) + 'px';
    try {
        run.me = window.dotActor(u, { scale: run.k });
        wrap.appendChild(run.me.el);
        run.me.face(run.face);
    } catch (e) {
        run.me = null;
        wrap.innerHTML = '<div style="position:absolute;left:35%;right:35%;bottom:8%;top:30%;background:#d9c7a3;border-radius:40% 40% 10% 10%"></div>';
    }
    run.world.appendChild(wrap);
    run.meEl = wrap;
    placeMe();
}
function placeMe() {
    if (!run.meEl) return;
    const Z = run.Z, k = run.k, sp = run.spec;
    const w = sp.W * k, h = sp.H * k;
    run.meEl.style.left = Math.round(run.x * Z - w / 2) + 'px';
    run.meEl.style.top = Math.round(run.y * Z - (h - sp.FOOT * k)) + 'px';
    run.meEl.style.zIndex = String(1000 + Math.round(run.y));
}
function leadDoll() {
    const u = u_(), M = D();
    if (!u || !M) return null;
    const w = M.withList(u);
    return w.length ? M.dolls(u)[w[0]] : null;
}
function makeDoll() {
    if (run.dollEl) { run.dollEl.remove(); run.dollEl = null; }
    const d = leadDoll();
    if (!d) return;
    const px = Math.round(26 * run.Z);                   // 2026-11-07 사용자 「인형 크기를 좀 줄이자」 (34 → 26)
    const el = document.createElement('div');
    el.className = 'ds-doll';
    el.innerHTML = '<div style="' + D().spriteCss(d.sp, px) + 'animation:dsbob .5s steps(2) infinite paused"></div>';
    el.style.width = px + 'px'; el.style.height = px + 'px';
    run.world.appendChild(el);
    run.dollEl = el; run.dollPx = px;
    run.trail = [[run.x, run.y]];
    placeDoll(true);
}
function placeDoll(snap) {
    if (!run.dollEl) return;
    // 지나온 자리 가운데 18칸 뒤
    const GAP = 18;
    let need = GAP, p = run.trail[run.trail.length - 1] || [run.x, run.y];
    let cur = [run.x, run.y];
    for (let i = run.trail.length - 1; i >= 0; i--) {
        const q = run.trail[i];
        const d = Math.hypot(cur[0] - q[0], cur[1] - q[1]);
        if (d >= need) { const t = need / d; p = [cur[0] + (q[0] - cur[0]) * t, cur[1] + (q[1] - cur[1]) * t]; need = 0; break; }
        need -= d; cur = q; p = q;
    }
    if (snap || need > 0) {               // 아직 덜 걸었으면 옆에 선다
        p = [run.x - run.face * -GAP * 0.6, run.y];
        const n = nearest(run.sc, p[0], p[1], true);
        p = [n.x, n.y];
    }
    const Z = run.Z, px = run.dollPx;
    run.dollEl.style.left = Math.round(p[0] * Z - px / 2) + 'px';
    run.dollEl.style.top = Math.round(p[1] * Z - px * 0.94) + 'px';
    run.dollEl.style.zIndex = String(1000 + Math.round(p[1]) - 1);
    const inner = run.dollEl.firstChild;
    if (inner) inner.style.animationPlayState = run.path.length ? 'running' : 'paused';
}

// ==========================================
// 누르는 자리 · 그림 속 사람
// ==========================================
function paintSpots() {
    Array.prototype.forEach.call(run.world.querySelectorAll('.ds-spot,.ds-tag'), function (e) { e.remove(); });
    const sc = run.sc, Z = run.Z;
    (sc.spots || []).forEach(function (s) {
        const e = document.createElement('div');
        e.className = 'ds-spot';
        const lx = s.edge ? Math.max(24 / Z, Math.min(sc.w - 24 / Z, s.x)) : s.x;
        e.style.left = Math.round(lx * Z) + 'px';
        e.style.top = Math.round((s.y - sc.body * 1.35) * Z) + 'px';
        e.innerHTML = '<div class="b">' + esc(s.i || '•') + '</div><div class="t">' + esc(s.n) + '</div>';
        e.addEventListener('pointerup', function (ev) { ev.stopPropagation(); if (busy()) return; walkTo(s.x, s.y, function () { act(s.act, s); }); });
        e.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
        run.world.appendChild(e);
    });
    (sc.npcs || []).forEach(function (n) {
        if (n.id === 'nap') return;
        const e = document.createElement('div');
        e.className = 'ds-tag';
        e.style.left = Math.round((n.r[0] + n.r[2]) / 2 * Z) + 'px';
        e.style.top = Math.round((n.r[1] - 3) * Z) + 'px';
        e.textContent = n.n;
        run.world.appendChild(e);
    });
}
function npcAt(x, y) {
    const ns = run.sc.npcs || [];
    for (let i = 0; i < ns.length; i++) {
        const r = ns[i].r;
        if (x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]) return ns[i];
    }
    return null;
}

// ==========================================
// 걷기
// ==========================================
function busy() { return !run || run.busy || run.talkOn; }
function walkTo(x, y, then) {
    if (!run) return;
    const to = nearest(run.sc, x, y);
    run.path = route(run.sc, run.at, to);
    run.then = then || null;
    run.tgt = to;
}
//   ★ 2026-11-07 사용자 「움직이기 어려워서 개선」
//     누른 채로 두면 손가락 쪽으로 계속 걷는다 (화면이 따라가므로 맵 끝까지) · 끌면 따라온다 · PC 는 방향키 · WASD
function canWalk() { return !!(run && !busy() && !(run.pt && (!run.pt.lead() || !run.pt.ready()))); }
function bindInput(ov) {
    let down = false, lastT = 0, holdIv = 0, at = null, toNpc = false, sx = 0, sy = 0;
    const world = function (cx, cy) { const r = ov.getBoundingClientRect(); return toWorld(cx - r.left, cy - r.top); };
    const go = function (ev) {
        if (!run || busy()) return;
        if (run.pt && !run.pt.lead()) { sys('파티장을 따라갑니다.', 1500); return; }
        if (run.pt && !run.pt.ready()) { sys('같이 갈 사원들이 들어오기를 기다리는 중…', 1500); return; }
        const w = world(ev.clientX, ev.clientY);
        const n = npcAt(w.x, w.y);
        toNpc = !!n;
        if (n) { try { if (window.DOLLGONG && DOLLGONG.prefetch) DOLLGONG.prefetch(n.act); } catch (e) { } walkTo(n.x, n.y, function () { act(n.act, n); }); return; }
        walkTo(w.x, w.y, null);
    };
    const stop = function () { down = false; clearInterval(holdIv); holdIv = 0; };
    ov.addEventListener('pointerdown', function (ev) {
        if (run && run.talkOn) return;               // 말 창은 제가 받는다
        if (ev.target.closest && ev.target.closest('.ds-top,.ds-spot')) return;
        down = true; lastT = Date.now(); at = { x: ev.clientX, y: ev.clientY }; sx = ev.clientX; sy = ev.clientY;
        go(ev);
        clearInterval(holdIv);
        const r0 = run;
        holdIv = setInterval(function () {
            if (!down || !run || run !== r0) { stop(); return; }     // 맵이 바뀌면 손을 뗀 것으로
            if (toNpc || !canWalk() || !at) return;
            const w = world(at.x, at.y);
            walkTo(w.x, w.y, null);
        }, 150);
    });
    ov.addEventListener('pointermove', function (ev) {
        if (!down) return;
        at = { x: ev.clientX, y: ev.clientY };
        if (toNpc && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 24) toNpc = false;   // 사람을 누르고 끌면 그냥 걷기
        if (Date.now() - lastT < 120) return;
        lastT = Date.now();
        if (toNpc || !canWalk()) return;
        const w = world(ev.clientX, ev.clientY);
        walkTo(w.x, w.y, null);
    });
    ov.addEventListener('pointerup', stop);
    ov.addEventListener('pointercancel', stop);
    ov.addEventListener('pointerleave', stop);
}
// 방향키 — 맵이 열려 있을 때만 (광장 쪽으로는 넘기지 않는다)
const KEYS = {}, KEYMAP = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l', d: 'r', w: 'u', s: 'd', A: 'l', D: 'r', W: 'u', S: 'd' };
window.addEventListener('keydown', function (ev) {
    if (!run || !document.getElementById(OV)) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
    const k = KEYMAP[ev.key];
    if (!k) return;
    KEYS[k] = 1;
    ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation();
}, true);
window.addEventListener('keyup', function (ev) {
    const k = KEYMAP[ev.key];
    if (k) delete KEYS[k];                               // 뗀 것은 광장에도 알린다 (광장 쪽 걸음이 눌린 채로 남지 않게)
}, true);
window.addEventListener('blur', function () { Object.keys(KEYS).forEach(function (k) { delete KEYS[k]; }); });
function keyWalk(t) {
    const dx = (KEYS.r ? 1 : 0) - (KEYS.l ? 1 : 0), dy = (KEYS.d ? 1 : 0) - (KEYS.u ? 1 : 0);
    if (!dx && !dy) { if (run.keyOn) { run.keyOn = 0; if (!run.then) run.path = run.path.slice(0, 1); } return; }
    if (!canWalk() || t - (run.keyT || 0) < 110) return;
    run.keyT = t; run.keyOn = 1;
    walkTo(run.x + dx * 40, run.y + dy * 40, null);
}

function tick(t) {
    if (!run) return;
    run.raf = requestAnimationFrame(tick);
    t = t || performance.now();
    const dt = run.last ? Math.min(0.05, (t - run.last) / 1000) : 0;
    run.last = t;
    keyWalk(t);
    let moved = 0;
    if (run.path.length && !run.talkOn && !run.busy) {
        let left = SPD * dt;
        while (left > 0 && run.path.length) {
            const p = run.path[0];
            const dx = p[0] - run.x, dy = p[1] - run.y;
            const d = Math.hypot(dx, dy);
            if (Math.abs(dx) > 0.3) {
                const f = dx < 0 ? 1 : -1;
                if (f !== run.face) { run.face = f; try { run.me && run.me.face(f); } catch (e) { } }
            }
            if (d <= left) { run.x = p[0]; run.y = p[1]; run.path.shift(); left -= d; moved += d; }
            else { run.x += dx / d * left; run.y += dy / d * left; moved += left; left = 0; }
        }
        run.at = nearest(run.sc, run.x, run.y, true);
        const tl = run.trail[run.trail.length - 1];
        if (!tl || Math.hypot(tl[0] - run.x, tl[1] - run.y) > 3) { run.trail.push([run.x, run.y]); if (run.trail.length > 60) run.trail.shift(); }
        if (!run.path.length) {
            const th = run.then; run.then = null;
            if (th) setTimeout(th, 30);
            else edgeGo();
        }
    }
    if (!run) return;                                    // 끝으로 걸어 나가 맵이 닫혔다
    const walking = moved > 0;
    if (run.me && run.walking !== walking) { run.walking = walking; try { run.me.moving(walking); } catch (e) { } }
    placeMe();
    placeDoll(false);
    if (run.pt) { followLead(); matesSync(dt); if (moved && run.pt.lead()) run.pt.onWalk(run.x); }
    camera();
    if (run.sc.dark) paintVision();
    if (moved) onMove(moved);
    if (run.npc) npcTick(dt);
}

// 끝까지 걸어가면 옆 맵으로 — 광장처럼 (끝 입구를 누르지 않아도)
function edgeGo() {
    const sc = run.sc;
    const sp = (sc.spots || []).filter(function (s) { return s.edge; });
    for (let i = 0; i < sp.length; i++) {
        const s = sp[i];
        const atEdge = (s.x < sc.w / 2) ? run.x <= 6 : run.x >= sc.w - 6;
        if (atEdge && Math.abs(run.y - s.y) < 8) { act(s.act, s); return; }
    }
}

// ==========================================
// 걸을 때 — 조우 · 괴담
// ==========================================
function inZone() {
    const zs = run.sc.zones || [];
    for (let i = 0; i < zs.length; i++) {
        const z = zs[i];
        if (run.x >= z.x[0] && run.x <= z.x[1] && Math.abs(run.y - z.y) < 14) return z;
    }
    return null;
}
function encLoad() {
    const u = u_(), k = 'dollEnc-' + (u && u.code);
    let o = null;
    try { o = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { }
    if (!o || !(o.need >= ENC_STEPS[0] && o.need <= ENC_STEPS[1])) o = { n: 0, acc: 0, need: ENC_STEPS[0] + Math.floor(Math.random() * (ENC_STEPS[1] - ENC_STEPS[0] + 1)) };
    o.k = k;
    return o;
}
function encSave(o) { try { localStorage.setItem(o.k, JSON.stringify({ n: o.n, acc: o.acc, need: o.need })); } catch (e) { } }
function onMove(d) {
    if (run.key === 'wild') {
        if (Date.now() < run.encOff) return;
        // 튜토리얼 — 수상한 장소를 조금 걸으면 바로 나온다
        if (run.tut && run.tut.step === 'wild-go') {
            if (!inZone()) return;
            run.encAcc += d;
            if (run.encAcc >= STEP) { run.encAcc = 0; encounter(); }
            return;
        }
        if (!canHunt()) { if (inZone()) { run.encAcc += d; if (run.encAcc >= STEP * 4) { run.encAcc = 0; encounter(); } } return; }   // 공방 먼저 — 알림만
        const o = run.enc || (run.enc = encLoad());
        o.acc += d;
        let stepped = 0;
        while (o.acc >= FOOT) { o.acc -= FOOT; o.n++; stepped++; }
        if (stepped && o.n % 10 === 0) encSave(o);
        if (o.n >= o.need && inZone()) {
            o.n = 0; o.acc = 0; o.need = ENC_STEPS[0] + Math.floor(Math.random() * (ENC_STEPS[1] - ENC_STEPS[0] + 1));
            encSave(o);
            encounter();
        }
    } else if (run.key === 'arcade') {
        arcadeCheck();
    }
}

function canHunt() {
    const u = u_();
    if (!u) return false;
    const t = u.dollTut || {};
    if (run && run.tut) return true;
    return !!t.done;
}

async function encounter() {
    if (!run || run.busy) return;
    if (!canHunt()) {
        run.encOff = Date.now() + 8000;
        sys('수풀 속에서 뭔가 바스락거렸다…… 도깨비 공방(◀)에 먼저 들러 보세요.');
        return;
    }
    run.busy = true; run.path = []; run.then = null;
    // 번쩍임 대신 — 전투 화면이 하얗게 덮으며 들어온다 (doll-battle.js enterFx)
    const tut = !!(run.tut);
    let res = null;
    try { res = await window.DOLLBT.wild({ loc: run.sc.bt, tut: tut }); } catch (e) { console.warn('[🧸] 전투', e); }
    if (!run) return;
    run.busy = false;
    run.encOff = Date.now() + 2500;
    run.encAcc = 0;
    makeDoll();
    if (tut && res && res.res === 'caught') { tutAfterCatch(); return; }
}

function flash(n) {
    return new Promise(function (r) {
        const f = run && run.el.querySelector('.ds-flash');
        if (!f) return r();
        let i = 0;
        const step = function () {
            if (i >= n * 2) { f.style.opacity = '0'; r(); return; }
            f.style.background = (i % 4 < 2) ? '#fff' : '#000';
            f.style.opacity = (i % 2 === 0) ? '0.9' : '0';
            i++;
            setTimeout(step, 90);
        };
        step();
    });
}
function sys(t, ms) {
    if (!run) return;
    const s = run.el.querySelector('.ds-sys span');
    if (!s) return;
    s.textContent = t;
    s.style.opacity = '1';
    clearTimeout(run._sysT);
    run._sysT = setTimeout(function () { if (s) s.style.opacity = '0'; }, ms || 3800);
}

// ==========================================
// 말 창 — 한 줄씩 (화면 아무 데나 누르면 다음)
// ==========================================
//   lines — [ '말' 또는 { who, t, sys } ] · 돌려주는 값은 Promise
function talk(lines, who) {
    lines = (Array.isArray(lines) ? lines : []).filter(function (L) { return L && (typeof L === 'string' || L.t); });
    return new Promise(function (resolve) {
        if (!run || !lines.length) return resolve();     // 할 말이 없으면 빈 창을 띄우지 않는다
        run.talkOn = true; run.path = [];
        let i = 0;
        const box = document.createElement('div');
        box.className = 'ds-talk';
        run.el.appendChild(box);
        let ready = 0;
        const show = function () {
            const L = lines[i];
            const o = (typeof L === 'string') ? { t: L, who: who } : L;
            box.className = 'ds-talk' + (o.sys ? ' sys' : '');
            box.innerHTML = (o.sys ? '' : (o.who ? '<div class="who">' + esc(o.who) + '</div>' : ''))
                + '<div class="tx">' + (o.sys ? '※ ' : '') + esc(o.t).replace(/\n/g, '<br>') + '</div><div class="nx">▼</div>';
            if (o.fn) try { o.fn(); } catch (e) { }
            ready = Date.now() + 180;
        };
        const next = function (ev) {
            if (ev) { ev.stopPropagation(); ev.preventDefault(); }
            if (Date.now() < ready) return;
            i++;
            if (i >= lines.length) {
                run && run.el.removeEventListener('pointerdown', next, true);
                box.remove();
                if (run) run.talkOn = false;
                resolve();
                return;
            }
            show();
        };
        show();
        run.el.addEventListener('pointerdown', next, true);
    });
}
//   고르기 — 돌려주는 값은 고른 번호
function ask(who, text, opts) {
    return new Promise(function (resolve) {
        if (!run) return resolve(-1);
        run.talkOn = true; run.path = [];
        const box = document.createElement('div');
        box.className = 'ds-talk';
        box.innerHTML = (who ? '<div class="who">' + esc(who) + '</div>' : '') + '<div class="tx">' + esc(text).replace(/\n/g, '<br>') + '</div>'
            + '<div class="ch">' + opts.map(function (o, i) { return '<button data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>';
        run.el.appendChild(box);
        box.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
        Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
            b.onclick = function (ev) {
                ev.stopPropagation();
                box.remove();
                if (run) run.talkOn = false;
                resolve(Number(b.dataset.i));
            };
        });
    });
}

// ==========================================
// 이벤트 도깨비 (튜토리얼) — doll/npc.webp · 72×96 칸 · 첫 줄 걷기 · 둘째 줄 서 있기
// ==========================================
function npcShow(x, y, face) {
    if (!run) return;
    if (!run.npcEl) {
        const e = document.createElement('div');
        e.className = 'ds-npcs';
        run.world.appendChild(e);
        run.npcEl = e;
    }
    run.npc = { x: x, y: y, face: face || 1, path: [], f: 0, ft: 0, jump: 0 };
    paintNpc();
}
// 사람 바로 앞 (바라보는 쪽) — 같은 줄에 서서 사람을 마주 본다 (2026-11-07 사용자 「위치는 같게 하되, 캐릭터 앞에 서있게」)
function frontAt(gap) {
    const dir = run.face === 1 ? -1 : 1;                 // face 1 = 왼쪽을 본다
    let x = run.x + dir * gap;
    if (x < 10 || x > run.sc.w - 10) x = run.x - dir * gap;
    const n = nearest(run.sc, x, run.y, true);
    return { x: n.x, y: n.y, face: n.x > run.x ? 1 : -1 };
}
function npcFront(gap) { const f = frontAt(gap || 32); npcShow(f.x, f.y, f.face); }
function npcHide() { if (run && run.npcEl) { run.npcEl.remove(); run.npcEl = null; } if (run) run.npc = null; }
function npcScale() { return run.key === 'gong' ? 1.15 : 0.95; }
function paintNpc() {
    if (!run || !run.npc || !run.npcEl) return;
    const n = run.npc, Z = run.Z, s = npcScale();
    const cw = 72 * s * Z, ch = 96 * s * Z;
    const e = run.npcEl;
    const row = n.path.length ? 0 : 1;
    e.style.width = Math.round(cw) + 'px'; e.style.height = Math.round(ch) + 'px';
    e.style.backgroundSize = Math.round(cw * 6) + 'px ' + Math.round(ch * 2) + 'px';
    e.style.backgroundPosition = Math.round(-(n.f % 6) * cw) + 'px ' + Math.round(-row * ch) + 'px';
    e.style.left = Math.round(n.x * Z - cw / 2) + 'px';
    e.style.top = Math.round(n.y * Z - ch * (row ? 74 : 86) / 96) + 'px';     // 발끝 — 걷기 줄 86 · 서 있기 줄 74 (96칸 가운데)
    e.style.zIndex = String(1000 + Math.round(n.y));
    e.style.transform = (n.face < 0 ? 'scaleX(-1)' : '') + (n.jump ? ' translateY(' + (-n.jump * Z) + 'px)' : '');
}
function npcTick(dt) {
    const n = run.npc;
    n.ft += dt;
    if (n.ft > (n.path.length ? 0.1 : 0.16)) { n.ft = 0; n.f = (n.f + 1) % 6; }
    if (n.path.length) {
        let left = (n.spd || SPD * 1.3) * dt;
        while (left > 0 && n.path.length) {
            const p = n.path[0];
            const dx = p[0] - n.x, dy = p[1] - n.y, d = Math.hypot(dx, dy);
            if (Math.abs(dx) > 0.3) n.face = dx < 0 ? 1 : -1;
            if (d <= left) { n.x = p[0]; n.y = p[1]; n.path.shift(); left -= d; } else { n.x += dx / d * left; n.y += dy / d * left; left = 0; }
        }
        if (!n.path.length && n.done) { const f = n.done; n.done = null; setTimeout(f, 20); }
    }
    paintNpc();
}
function npcWalk(x, y, spd) {
    return new Promise(function (r) {
        if (!run || !run.npc) return r();
        const from = nearest(run.sc, run.npc.x, run.npc.y, true);
        run.npc.path = route(run.sc, from, nearest(run.sc, x, y, true));
        run.npc.spd = spd || null;
        run.npc.done = r;
    });
}
function npcJump() {
    return new Promise(function (r) {
        if (!run || !run.npc) return r();
        let t = 0;
        const iv = setInterval(function () {
            if (!run || !run.npc) { clearInterval(iv); return r(); }
            t += 0.05;
            run.npc.jump = Math.max(0, Math.sin(Math.min(1, t / 0.5) * Math.PI) * 26);
            if (t >= 0.5) { run.npc.jump = 0; clearInterval(iv); r(); }
        }, 16);
    });
}
function exclaim(x, y, txt) {
    if (!run) return;
    const e = document.createElement('div');
    e.className = 'ds-ex';
    e.textContent = txt || '!';
    e.style.left = Math.round(x * run.Z) + 'px';
    e.style.top = Math.round(y * run.Z) + 'px';
    run.world.appendChild(e);
    setTimeout(function () { e.remove(); }, 900);
}

// ==========================================
// 아케이드존 — 시야 · 괴담
// ==========================================
function makeVision() {
    let v = run.el.querySelector('.ds-vis');
    if (!v) { v = document.createElement('div'); v.className = 'ds-vis'; run.el.insertBefore(v, run.el.querySelector('.ds-top')); }
    paintVision();
}
function paintVision() {
    const v = run.el.querySelector('.ds-vis');
    if (!v) return;
    const s = toScreen(run.x, run.y - run.sc.body * 0.55);
    const R = run.sc.vision * run.Z;
    const k = Math.round(s.x) + '_' + Math.round(s.y) + '_' + Math.round(R);
    if (v._k === k) return;
    v._k = k;
    v.style.background = 'radial-gradient(circle ' + Math.round(R) + 'px at ' + Math.round(s.x) + 'px ' + Math.round(s.y) + 'px, rgba(0,0,0,0) 0, rgba(0,0,0,0) ' + Math.round(R - 2) + 'px, rgba(4,2,8,.985) ' + Math.round(R) + 'px)';
}
// 괴담은 여정 판(doll-party.js)이 쥐고 있다 — run.pt
function arcadePaint() {
    Array.prototype.forEach.call(run.world.querySelectorAll('.ds-mon'), function (e) { e.remove(); });
    const PT = run.pt;
    if (!PT) return;
    const Z = run.Z;
    PT.mons().forEach(function (m, i) {
        if (!m || m.dead) return;
        const px = Math.round((m.boss ? 78 : 62) * Z);
        const e = document.createElement('div');
        e.className = 'ds-mon';
        e.innerHTML = '<div style="' + D().monCss(m.i, px) + '"></div>';
        e.style.left = Math.round(m.x * Z - px / 2) + 'px';
        e.style.top = Math.round(m.y * Z - px * 0.97) + 'px';
        e.style.zIndex = String(1000 + Math.round(m.y) - 2);
        e.dataset.i = i;
        run.world.appendChild(e);
    });
}
function arcadeCheck() {
    const PT = run.pt;
    if (!PT || !PT.lead() || run.busy || PT.stage() !== 'walk') return;
    const ms = PT.mons();
    for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        if (!m || m.dead) continue;
        const near = m.boss ? (run.x >= run.sc.boss.at) : (Math.abs(run.x - m.x) < 26);
        if (near) {
            run.busy = true; run.path = []; run.then = null;
            exclaim(m.x, m.y - (m.boss ? 80 : 62), '!');
            if (!PT.encounter(i)) run.busy = false;
            return;
        }
    }
}
function arcadeQuit() { if (run && run.pt) run.pt.quit(); else close(); }

// ── 같이 온 사원 — 줄지어 따라온다
function matesSync(dt) {
    const PT = run.pt;
    if (!PT) return;
    run.mates = run.mates || {};
    const order = PT.order(), me = PT.me();
    Object.keys(run.mates).forEach(function (c) { if (order.indexOf(c) < 0) { try { run.mates[c].a && run.mates[c].a.stop && run.mates[c].a.stop(); } catch (e) { } run.mates[c].wrap.remove(); delete run.mates[c]; } });
    order.forEach(function (c) {
        if (c === me) return;
        let m = run.mates[c];
        const sp = run.spec || { W: 352, H: 384, FOOT: 32 };
        if (!m) {
            const usr = (typeof db !== 'undefined' && db.users && db.users[c]) || { code: c, name: PT.name(c) };
            const wrap = document.createElement('div');
            wrap.className = 'ds-act';
            wrap.style.width = Math.round(sp.W * run.k) + 'px'; wrap.style.height = Math.round(sp.H * run.k) + 'px';
            let a = null;
            try { a = window.dotActor(usr, { scale: run.k, all: true }); wrap.appendChild(a.el); } catch (e) { }
            const tag = document.createElement('div');
            tag.className = 'ds-tag';
            tag.style.cssText = 'left:50%;top:22%;';
            tag.textContent = PT.name(c);
            wrap.appendChild(tag);
            run.world.appendChild(wrap);
            m = run.mates[c] = { wrap: wrap, a: a, x: PT.posOf(c), face: -1, walking: false };
        }
        const tx = PT.posOf(c);
        const dx = tx - m.x;
        const moving = Math.abs(dx) > 1;
        if (moving) { m.x += Math.sign(dx) * Math.min(Math.abs(dx), SPD * 1.25 * dt); const f = dx < 0 ? 1 : -1; if (f !== m.face) { m.face = f; try { m.a && m.a.face(f); } catch (e) { } } }
        if (moving !== m.walking) { m.walking = moving; try { m.a && m.a.moving(moving); } catch (e) { } }
        const Z = run.Z, w = sp.W * run.k, h = sp.H * run.k;
        m.wrap.style.left = Math.round(m.x * Z - w / 2) + 'px';
        m.wrap.style.top = Math.round(333 * Z - (h - sp.FOOT * run.k)) + 'px';
        m.wrap.style.zIndex = String(1000 + 333 - 1);
    });
}
// 방장이 아닌 사람 — 제 자리(방장 뒤)로 걸어간다
function followLead() {
    const PT = run.pt;
    if (!PT || PT.lead() || run.busy || run.talkOn) return;
    const tx = PT.posOf(PT.me());
    if (Math.abs(tx - run.x) > 2) { const n = nearest(run.sc, tx, 333, true); if (!run.path.length || Math.abs(run.path[run.path.length - 1][0] - n.x) > 2) run.path = [[n.x, n.y]]; }
}

// ==========================================
// 광장과 잇기
// ==========================================
function plazaWhere() {
    try { if (typeof window.plazaWhere === 'function') { const w = window.plazaWhere(); if (w && w.room) return { room: w.room, x: w.x }; } } catch (e) { }
    return { room: null, x: null };
}
function plazaOn() { try { return !!document.getElementById('plaza-ov'); } catch (e) { return false; } }
function toPlazaRoom(room, x) {
    const go = function () { try { if (room && typeof window.plazaGo === 'function') window.plazaGo(room, null, x); } catch (e) { } };
    if (plazaOn()) { go(); return; }
    try { if (typeof window.plazaOpen === 'function') { window.plazaOpen(); setTimeout(go, 700); } } catch (e) { }
}
function quit() {
    if (run && run.pt) { run.pt.quit(); return; }
    if (run && run.tut && !(u_().dollTut || {}).done) {
        ask(null, '튜토리얼을 멈추고 나갈까요?\n다음에 도깨비 공방 앞에 오면 이어서 합니다.', ['나간다', '계속한다']).then(function (i) { if (i === 0) { close(); } });
        return;
    }
    close();
}

// ==========================================
// 하는 일
// ==========================================
function act(name, o) {
    if (!run) return;
    switch (name) {
        case 'toPlaza':    close(); toPlazaRoom('plaza', 1830); return;
        case 'toGate':     close(); toPlazaRoom('gate', 1800); return;      // 재관국 앞 오른쪽 끝으로
        case 'toGfront':   open('gfront', 'left'); return;
        case 'toGfrontR':  open('gfront', 'right'); return;
        case 'toWildR':    open('wild', 'right'); return;
        case 'toWildL':    open('wild', 'left'); return;
        case 'toGong':     open('gong', 'door'); return;
        case 'toGfrontDoor': open('gfront', 'door'); return;
        case 'arcadeQuit': arcadeQuit(); return;
    }
    const G = window.DOLLGONG;
    if (G && typeof G[name] === 'function') { G[name](API, o); return; }
}

// ==========================================
// 들어설 때 — 튜토리얼
// ==========================================
function tutOf() { const u = u_(); return (u && u.dollTut && typeof u.dollTut === 'object') ? u.dollTut : {}; }
function tutSet(step, done) {
    const u = u_();
    if (!u) return;
    const t = Object.assign({}, tutOf(), { step: step });
    if (done) t.done = D().now();
    u.dollTut = t;
    D().put({ dollTut: t }, u);
}
function onEnter(key, opt) {
    if (!run) return;
    const t = tutOf();
    if (key === 'gfront' && !t.done && !t.step) { tutStart(); return; }
    if (key === 'gfront' && !t.done && t.step === 'go-wild') { tutResumeFront(); return; }
    if (key === 'wild' && !t.done && (t.step === 'go-wild' || t.step === 'wild-go')) { tutWild(); return; }
    if (key === 'gong' && !t.done && t.step === 'caught') { tutGong(); return; }
    if (key === 'wild' && !t.done && !run.tut) sys('도깨비 공방(◀)에 먼저 들러 보세요.', 4500);
    if (key === 'arcade' && run.pt && !opt.resume) {
        // 판 소식(dollRun)이 아직 안 왔으면 첫 말이 비어 있다 — 올 때까지 잠깐 기다린다
        const r0 = run;
        let n = 0;
        const iv = setInterval(function () {
            if (run !== r0) { clearInterval(iv); return; }
            const L = run.pt.intro();
            if (L.length || ++n > 40) { clearInterval(iv); if (L.length) talk(L); }
        }, 150);
    }
    if (key === 'gong' && t.done && !opt.quiet) sys('도깨비들을 누르면 이야기할 수 있습니다.', 3000);
}

const WHO = '도깨비';
async function tutStart() {
    run.tut = { step: 'front' };
    const sc = run.sc;
    // 저쪽에서 펄쩍 — 후다닥 다가온다
    const fromX = run.x < sc.w / 2 ? sc.w - 40 : 40;
    npcShow(fromX, 219, fromX > run.x ? 1 : -1);
    await sleep(350);
    await npcJump();
    exclaim(run.npc.x, 219 - 62, '!!');
    const fr = frontAt(32);
    await npcWalk(fr.x, fr.y, SPD * 2.4);
    run.npc.face = run.npc.x > run.x ? 1 : -1;
    await talk([
        '김서방!!!!',
        '김서방! 이보게, 김서방! 거기 김서방 맞지?!',
        '아이고, 잘 왔네! 아주 잘 왔어! 내가 지금 김서방만 오매불망 기다리고 있었지 뭔가!',
        '……응? 김서방이 누구냐고?',
        '그야 자네지! 이렇게 곤란한 나를 도와줄 사람이라면 김서방이 틀림없잖아!',
        '뭐? 처음 보는 사이라고? 에이, 그런 사소한 게 뭐가 중요해!',
        '아이고, 아무튼! 지금 그게 중요한 게 아니야! 큰일이 났다고, 큰일이!',
        { sys: 1, t: '도깨비가 발을 동동 구른다.', fn: function () { npcJump().then(npcJump); } },
        '우리 공방이 아주 그냥 발칵 뒤집혔어! 발칵! 이러다 공방 문을 닫게 생겼다니까!',
        '그러니까 김서방, 내 말 좀 들어보게. 응? 아주 잠깐이면 돼! 잠깐!',
        '우리 공방에서 만드는 물건 중에 말이야, 아주 특별한 봉제인형이 있거든?',
        '이름하여 따라쟁이 봉제인형!',
        '이놈들이 아주 기특해. 사람이고 짐승이고, 기억 속에 있는 모습이라면 곧잘 흉내를 낸단 말이지!',
        '솜뭉치 주제에 재주가 얼마나 좋은지! 내가 만들어놓고도 아주 감탄을 한다니까!',
        '……그런데 말이야.',
        '이놈들이 죄다 도망을 쳤네?',
        '하나도 아니고, 둘도 아니고! 우르르! 와르르! 아주 떼로 도망을 쳤어!',
        '아니, 세상에! 내가 밥을 굶기기를 했나, 바느질을 대충 하기를 했나! 기껏 예쁘게 만들어줬더니 주인 허락도 없이 나가버린 거야!',
        '게다가 그놈들, 복제 리본까지 달고 나갔지 뭔가!',
        '그 리본을 달고 있으면 자기들끼리 자꾸 늘어난단 말이지. 하나가 둘이 되고, 둘이 넷이 되고…… 아이고, 숫자는 생각하기도 싫어!',
        '지금쯤 온 동네에 솜뭉치가 굴러다니고 있을걸!',
        '그러니까 김서방! 자네가 그놈들을 좀 잡아다 주게!',
        '뭐? 왜 하필 자네냐고?',
        '그야 내가 지금 자네를 붙잡았으니까 그렇지!',
        '아이고, 사람 하나 살리는 셈 치고 좀 도와주게! 응? 부탁이야!',
        '뭐? 어떻게 잡느냐고?',
        '아하하! 그걸 걱정했구먼! 진작 말을 하지!',
        '자, 이걸 받게!'
    ], WHO);
    if (!run) return;
    giveRibbons();
    await talk([
        { sys: 1, t: '포옹 리본 ×5를 획득했습니다.' },
        '짜잔! 포옹 리본일세!',
        '이걸로 봉제인형을 살살 감싸주면 돼. 꽉 붙들고 놓아주지 않겠다는 마음으로 말이야!',
        '물론 인형이 싫다고 버둥거리면 실패할 수도 있지. 그럴 땐 다시 해보면 되고!',
        '아, 그리고 조심하게! 이놈들이 얼마나 잽싼지, 한눈팔면 홀랑 달아나 버린다니까!',
        '……뭐? 정말 이것만 있으면 되느냐고?',
        '그럼! 그럼! 내가 만든 물건인데 설마 못 믿겠나?',
        '자, 말 나온 김에 직접 해보자고!',
        '나만 따라오게, 김서방! 얼른!'
    ], WHO);
    if (!run) return;
    tutSet('go-wild');
    tutLeadOut();
}
function giveRibbons() {
    const u = u_(), M = D();
    if (!u || (u.dollTut && u.dollTut.gave)) return;
    M.bagAdd(M.ITEM.RIBBON, 5, u);
    const t = Object.assign({}, tutOf(), { gave: 1 });
    u.dollTut = t; M.put({ dollTut: t }, u);
    M.log('[🧸 도깨비 공방] 도깨비에게 🎀 포옹 리본 5개를 받았습니다.', u);
    M.saveHist();
}
async function tutLeadOut() {
    // 도깨비가 먼저 왼쪽(출몰지)으로 간다 — 따라가면 출몰지
    if (!run.npc) npcFront(32);
    run.tut = { step: 'go-wild' };
    sys('도깨비를 따라가세요 ▶', 6000);
    npcWalk(466, 219, SPD * 1.6).then(function () { npcHide(); });
}
async function tutResumeFront() {
    run.tut = { step: 'go-wild' };
    npcFront(32);
    await talk(['오, 김서방! 어디 갔었나? 자, 얼른 따라오게!'], WHO);
    if (run) tutLeadOut();
}
async function tutWild() {
    run.tut = { step: 'wild' };
    npcFront(32);
    for (let i = 0; i < 3; i++) { if (!run || !run.npc) break; run.npc.face = -run.npc.face; paintNpc(); await sleep(380); }
    if (run && run.npc) { run.npc.face = run.npc.x > run.x ? 1 : -1; paintNpc(); }
    await talk([
        '자아, 여기가 좋겠구먼!',
        '김서방, 저기 보이나? 수풀이며 잡동사니며, 이것저것 잔뜩 쌓여 있는 거 말이야!',
        '저런 데가 아주 명당이지. 우리 봉제인형들이 숨어 있기 딱 좋은 곳이거든!',
        '덩치는 쪼끄만 것들이 숨바꼭질은 또 어찌나 잘하는지!',
        '그런데 김서방, 이놈들이 가만히 있을 때는 그냥 평범한 솜뭉치처럼 보일 수도 있어.',
        '그러다가 누군가를 마주치면, 그 사람이 기억하는 모습을 냉큼 흉내 낸단 말이지!',
        '그러니 뭘 만나게 될지는 나도 몰라! 하하하!',
        '……아니, 웃을 때가 아니지!',
        '자! 이제 김서방 차례야!',
        '저기 한번 뒤져보게! 내가 여기서 지켜보고 있을 테니!',
        { sys: 1, t: '수상한 장소(수풀 · 잡동사니 뒤)를 걸어다니면 야생 봉제인형과 마주칠 수 있습니다.' }
    ], WHO);
    if (!run) return;
    run.tut = { step: 'wild-go' };
    tutSet('wild-go');
    sys('수풀 · 잡동사니 뒤를 걸어 보세요', 6000);
}
async function tutAfterCatch() {
    if (!run) return;
    tutSet('caught');
    if (!run.npc) npcFront(32);
    await npcJump();
    await talk([
        '잡았다!!!!',
        '아이고, 우리 김서방! 아주 장하네! 장해!',
        '내가 사람 하나는 기가 막히게 알아본다니까! 처음 봤을 때부터 범상치 않더라니!',
        '아니, 이럴 때가 아니지! 어서 공방으로 돌아가세!',
        '그놈을 어떻게 돌봐야 하는지도 알려줘야 할 것 아닌가!'
    ], WHO);
    if (!run) return;
    await flash(1);
    open('gong', 'door', { tut: { step: 'gong' }, quiet: 1 });
}
function lookAt(x) {
    // 카메라만 잠깐 그쪽으로 — 사람은 그대로 (x 가 null 이면 사람에게 돌아온다)
    return new Promise(function (r) {
        if (!run) return r();
        const sx = (run.lookX != null) ? run.lookX : run.x;
        const tx = (x == null) ? run.x : x;
        const n = 18;
        let i = 0;
        const iv = setInterval(function () {
            if (!run) { clearInterval(iv); return r(); }
            i++;
            run.lookX = sx + (tx - sx) * Math.min(1, i / n);
            if (i >= n) { clearInterval(iv); if (x == null) run.lookX = null; r(); }
        }, 22);
    });
}
async function tutGong() {
    run.tut = { step: 'gong' };
    npcShow(run.x + 40, run.y, 1);
    await talk([
        '자아! 우리 공방에 온 걸 환영하네, 김서방!',
        '아까는 경황이 없어서 제대로 구경도 못 시켜줬지?',
        '이제부터는 내가 특별히 하나하나 알려주겠네!'
    ], WHO);
    const seg = async function (x, lines) {
        run.busy = true;
        await lookAt(x);
        run.busy = false;
        await talk(lines, WHO);
    };
    await seg(160, [
        '우선 저쪽을 보게! 바늘이랑 실이 잔뜩 있는 곳 말이야!',
        '봉제인형이 다치거나 솜이 터지면 저기서 고칠 수 있네!',
        '아무리 튼튼하게 만들었어도 인형은 인형인지라, 오래 싸우다 보면 여기저기 해지기 마련이거든.',
        '그럴 땐 걱정하지 말고 가져오게! 우리가 말끔하게 꿰매줄 테니!',
        '물론 공짜는 아니야! 우리도 먹고살아야 하지 않겠나? 하하!'
    ]);
    await seg(245, [
        '그리고 저기는 먹을 걸 파는 곳일세!',
        '뭐? 봉제인형이 무슨 밥을 먹느냐고?',
        '에이, 김서방! 인형이라고 배가 안 고프겠나!',
        '사람이든 짐승이든 솜뭉치든, 데리고 다니기로 했으면 잘 먹이고 잘 돌봐야지!',
        '너무 오래 굶기고 내버려 두면 정이 떨어져서 도망가 버릴지도 몰라!',
        '기껏 잡아놓고 또 놓치면 안 되잖아? 안 그래?'
    ]);
    await seg(815, [
        '그런데 말이야, 김서방.',
        '잡는 족족 데리고 다닐 수는 없겠지?',
        '아무리 인형이라도 우르르 몰려다니면 정신이 없을 테니 말이야!',
        '그래서 우리가 준비했지! 바로 봉제인형 박스!',
        '자네가 데리고 다닐 수 있는 인형은 한 번에 세 마리까지야. 나머지는 이곳에 맡겨두면 돼!',
        '맡겨놓은 동안은 우리가 잘 보살펴줄 테니 먹이 걱정도 하지 말고!',
        '아주 편하지? 내가 생각해도 참 기특한 물건이야!'
    ]);
    await seg(505, [
        '그리고 저쪽은 교환소일세!',
        '김서방도 알다시피, 따라쟁이들은 누구를 흉내 낼지 도통 알 수가 없잖아?',
        '그러다 보면 자네 마음에 쏙 드는 인형도 있고, 남의 인형이 더 탐날 때도 있겠지!',
        '그럴 때는 다른 김서방…… 아니, 다른 탐사자와 서로 인형을 바꾸면 돼!',
        '서로 좋다고 해야 바꿀 수 있는 거야! 남의 인형을 멋대로 가져가면 도둑이지, 교환이겠나!',
        '하하하! 그러니 좋은 인형을 만나면 잘 간직하게!'
    ]);
    run.busy = true;
    await lookAt(null);
    run.busy = false;
    await talk([
        '자아, 이제 대충 알겠지?',
        '……응? 그럼 이 인형은 어떻게 하느냐고?',
        '어떻게 하긴! 김서방이 가져야지!',
        '뭐? 정말 가져도 되느냐고?',
        '그럼! 그럼! 자네가 직접 잡았잖아!',
        '우리 공방 물건이긴 하지만…… 에이, 됐어! 김서방이 가져!',
        '대신 말이야.',
        '앞으로 길을 가다가 저놈들이 보이거든, 꼭 좀 잡아주게.',
        '한 마리라도 좋고, 열 마리라도 좋아! 아니, 열 마리면 더 좋고!',
        '아이고, 부탁이야! 저놈들이 더 늘어나기 전에 어떻게든 해야 한다고!',
        '……응? 도와주겠다고?',
        { t: '아이고, 김서방!!!!', who: WHO, fn: function () { npcJump(); } },
        '내가 이 은혜를 어떻게 갚을꼬!',
        '우리 김서방 최고다! 최고!',
        '자, 그럼 앞으로도 잘 부탁하네!',
        '……아! 참! 리본이 떨어지면 공방에 들르게! 내가 아주 좋은 값에 챙겨줄 테니!',
        '하하하하!'
    ], WHO);
    if (!run) return;
    tutSet('done', true);
    D().log('[🧸 도깨비 공방] 튜토리얼을 마쳤습니다. 잡은 봉제인형이 내 것이 되었습니다.');
    D().saveHist();
    await talk([{ sys: 1, t: '튜토리얼을 완료했습니다. 포획한 봉제인형이 탐사자의 소유가 되었습니다.\n이제 야생맵에서 자유롭게 봉제인형을 포획하고, 도깨비 공방의 시설을 이용할 수 있습니다.' }]);
    if (!run) return;
    run.tut = null;
    npcWalk(890, 240, SPD * 1.5).then(npcHide);
}

// ==========================================
// 밖에 내놓는 것 — 공방 쪽(doll-gong.js)이 쓴다
// ==========================================
// 여정 판에서 부르는 것 (doll-party.js)
function partySync() {
    if (!run || !run.pt) return;
    const ms = run.pt.mons();
    Array.prototype.forEach.call(run.world.querySelectorAll('.ds-mon'), function (e) {
        const m = ms[Number(e.dataset.i)];
        if (m && m.dead && !e._gone) { e._gone = 1; e.style.opacity = '0'; e.style.transform = 'translateY(20%)'; setTimeout(function () { e.remove(); }, 600); }
    });
}
function fightStart() { if (!run) return; run.busy = true; run.path = []; run.then = null; }
function fightEnd(res, m) {
    if (!run) return;
    run.busy = false;
    makeDoll();
    partySync();
    if (res === 'run' && run.pt && run.pt.lead()) {
        const ms = run.pt.mons(), mm = ms[m];
        const n = nearest(run.sc, Math.max(30, (mm ? mm.x : run.x) - 60), 333, true);
        run.x = n.x; run.y = n.y; run.at = n;
        run.pt.pushBack(run.x);
        sys('물러섰다. 괴담은 아직 그 자리에 있다.');
    } else if (res === 'win') {
        const ms = run.pt ? run.pt.mons() : [];
        sys('괴담이 흩어졌다. 길이 조금 더 열렸다. (' + ms.filter(function (x) { return x && x.dead; }).length + ' / ' + ms.length + ')');
    }
}
function leave() { close(); toPlazaRoom(null, null); }

const API = {
    talk: talk, ask: ask, sys: sys, flash: flash, sleep: sleep, run: function () { return run; },
    open: open, close: close, makeDoll: makeDoll, npcJump: npcJump,
    partySync: partySync, fightStart: fightStart, fightEnd: fightEnd, leave: leave
};
window.DOLLSCENE = API;
window.dollRepaint = function () {
    try { if (run) makeDoll(); } catch (e) { }
    try { if (window.DOLLGONG && DOLLGONG.repaint) DOLLGONG.repaint(); } catch (e) { }
};
window.dollWildOpen = function () { if (inDark()) { alert_('어둠 탐사 중입니다.'); return; } open('wild', 'right'); };
window.dollGfrontOpen = function () { if (inDark()) { alert_('어둠 탐사 중입니다.'); return; } open('gfront', 'left'); };
window.dollGongOpen = function () {
    if (inDark()) { alert_('어둠 탐사 중입니다.'); return; }
    if (!tutOf().done) { open('gfront', 'door'); return; }
    open('gong', 'door');
};
window.dollGo = function (k, at) { if (!SC[k]) { console.log(Object.keys(SC).join(' · ')); return; } open(k, at); };
window.dollWalk = function (x, y) { if (run && !busy()) walkTo(x, y, null); };
window.dollSceneState = function () {
    if (!run) { console.log('열려 있지 않습니다.'); return; }
    const o = { 맵: run.key, x: Math.round(run.x), y: Math.round(run.y), Z: run.Z.toFixed(2), k: run.k, 튜토리얼: tutOf(), 걷는중: run.path.length, 말: !!run.talkOn, 바쁨: !!run.busy, 조우: run.enc ? run.enc.n + ' / ' + run.enc.need + ' 걸음' : '' };
    console.log(o);
    return o;
};

// 광장 — 입구와 ☰ 목록
(function plazaHook() {
    try {
        const R = PLAZA.ROOMS;
        if (R.plaza && !R.plaza.spots.some(function (s) { return s.fn === 'dollWildOpen'; })) {
            R.plaza.spots.push({ x: 1760, n: '봉제인형 출몰지', i: '🧸', fn: 'dollWildOpen' });
        }
        // ★ 도깨비 공방은 재관국 앞 오른쪽 — 오른쪽 끝으로 걸어가도 들어간다 (plaza.js rightFn · 2026-11-07 사용자)
        if (R.gate && !R.gate.spots.some(function (s) { return s.fn === 'dollGfrontOpen'; })) {
            R.gate.spots.push({ x: 1720, n: '도깨비 공방', i: '👺', fn: 'dollGfrontOpen' });
        }
        if (R.gate && !R.gate.right) R.gate.rightFn = 'dollGfrontOpen';
        const M = PLAZA.MENU;
        if (!M.some(function (m) { return m.fn === 'dollGongOpen'; })) {
            const at = M.findIndex(function (m) { return m.fn === 'petOpen'; });
            const rows = [{ g: 'life', n: '도깨비 공방', i: '👺', fn: 'dollGongOpen' },
                          { g: 'life', n: '봉제인형 출몰지', i: '🧸', fn: 'dollWildOpen' }];
            if (at >= 0) M.splice(at + 1, 0, rows[0], rows[1]); else M.push(rows[0], rows[1]);
        }
    } catch (e) { console.warn('[🧸] 광장 잇기', e); }
})();

console.log('[🧸] 맵 — dollGo(\'wild\') · dollSceneState()');
})();
