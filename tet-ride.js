// ==========================================
// ★ 🧩 테트리스 탈것 — 오락실 테트리스(솔로)로 블록을 모아 직접 조합해 타고 다닌다 (2026-11-15 사용자)
// bundles.json — plaza.js 바로 뒤 (광장 · 옷장이 window.tetRideEl 로 그린다)
// ==========================================
//
// ■ 사용자가 준 말 (그대로)
//   「혹시 테트리스 블럭들로 조합해서 타고 다니는 형식의 탈것도 가능한가?」
//   「그럼 직접 조합 형식으로 하고 개인으로 20줄 지웠을 때 한 개, 25줄 지웠을 때 한 개, 30 줄 지웠을 때 한 개 35 줄 한 개
//    이렇게 5줄씩으로 해서 총 7개를 얻을 수 있게 해주고 각 블록은 거래가 가능하게 해줘. 그리고 타고 다닐 때에 작은 블럭들이
//    잔상으로 남게 해주고 블럭들 크기는 기본적으로 캐릭터의 1.5배로 하되 조합 시에는 작아져서 그 크기 이상으로 안 가도록 하자.」
//
// ■ 이렇게 했다
//   · 받기 — 사택 오락실 테트리스 **솔로** 한 판에서 지운 줄이 20 · 25 · 30 · 35 · 40 · 45 · 50 에 닿을 때마다 한 개 (계정마다 한 번씩 · 모두 일곱).
//     한 판에 50 줄을 넘기면 그때까지 못 받은 것을 한꺼번에 받는다. 대전은 세지 않는다.
//     일곱 가지(I · O · T · S · Z · J · L) 가운데 **아직 안 받은 모양**이 무작위로 나온다 — 일곱을 다 받으면 한 벌이 된다.
//     u.tetBlk = { 20: 'T', 25: 'I', … } (받은 줄 → 모양)
//   · 블록은 소지품 물품 「테트리스 블록 I」 … — 밀실 거래로 주고받는다 (상점에 팔지는 않는다).
//     소지품에서 [사용] 하면 조합 창이 열린다 (쓰여 없어지지 않는다). 옷장 악세 「탈것」 줄의 [🧩 조합] 으로도 연다.
//   · 조합 — 가진 블록을 10 × 8 판에 놓는다 (돌리기 ↻ · 놓인 블록을 누르면 뺀다). u.tetRide = [[모양, 돌림, x, y], …]
//     거래로 블록을 내주면 그만큼 탈것에서 빠진다 (모양마다 가진 수까지만 그린다).
//   · 탄다 — 옷장 악세 「탈것」 의 테트리스 탈것 (closet.js ride 'tet' · 블록을 하나라도 가지면 생긴다).
//     리듬 보드와 같은 길 (plaza.js) — 블록 위에 올라서고 · [🧩 타기 / 내리기] · 점프 · 빠르기 두 배.
//   · 크기 — 캐릭터(몸 폭 100 · 키 236 도트)의 1.5 배 = 가로 150 · 세로 354 도트 상자. 블록 하나만 놓으면 그 상자에 꽉 차게,
//     여럿을 이으면 칸이 작아져 그 상자를 넘지 않는다 (칸 크기 = min(150 / 가로 칸 수, 354 / 세로 칸 수)).
//   · 서는 자리 — 가운데에 가장 가까운 줄(칸이 있는 줄)의 맨 윗블록 위. 그 줄이 발밑에 오게 탈것을 옆으로 맞춘다.
//   · 잔상 — 움직이면 블록 빛깔의 작은 조각들이 지나온 자리에 떨어져 남았다가 사라진다 (plaza.js trailPaint).
//
// ■ 콘솔
//   tetRideState()          내 블록 · 조합 · 받은 줄
//   tetRideGive(n)          상담사 — n 번째 줄 몫을 받은 것으로 (점검용 · 없으면 남은 것 하나)

(function tetRide() {
'use strict';

const TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const COLORS = { I: '#4fc3f7', O: '#ffd54f', T: '#ba68c8', S: '#81c784', Z: '#e57373', J: '#7986cb', L: '#ffb74d' };   // 오락실 테트리스 빛깔 (dark.js TET_COLORS)
const SHAPES = {                                    // 오락실 테트리스와 같은 모양 (dark.js TET_SHAPES)
    I: [[0, 1], [1, 1], [2, 1], [3, 1]],
    O: [[1, 0], [2, 0], [1, 1], [2, 1]],
    T: [[1, 0], [0, 1], [1, 1], [2, 1]],
    S: [[1, 0], [2, 0], [0, 1], [1, 1]],
    Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
    J: [[0, 0], [0, 1], [1, 1], [2, 1]],
    L: [[2, 0], [0, 1], [1, 1], [2, 1]]
};
const MILES = [20, 25, 30, 35, 40, 45, 50];
const CAP_W = 150, CAP_H = 354;                     // 캐릭터의 1.5 배 (도트)
const GW = 10, GH = 8;                              // 조합 판
const OV = 'tetr-ov';
const NAME_PRE = '테트리스 블록 ';
function nameOf(t) { return NAME_PRE + t; }
const BY_NAME = {};
TYPES.forEach(function (t) { BY_NAME[nameOf(t)] = t; });

window.TET_RIDE = { TYPES: TYPES, COLORS: COLORS, MILES: MILES, CAP_W: CAP_W, CAP_H: CAP_H, nameOf: nameOf };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function alert_(t) { try { if (typeof showCustomAlert === 'function') showCustomAlert(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

// ==========================================
// 모양
// ==========================================
function cellsOf(t, r) {
    let c = (SHAPES[t] || []).map(function (p) { return [p[0], p[1]]; });
    for (let i = 0; i < ((Number(r) || 0) & 3); i++) c = c.map(function (p) { return [3 - p[1], p[0]]; });
    const mx = Math.min.apply(null, c.map(function (p) { return p[0]; }));
    const my = Math.min.apply(null, c.map(function (p) { return p[1]; }));
    return c.map(function (p) { return [p[0] - mx, p[1] - my]; });
}
function listOf(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; });
    return [];
}
// 놓인 것 [모양, 돌림, x, y] — 판 안 · 안 겹침 · (owned 가 있으면) 모양마다 가진 수까지만
function clean(tr, owned) {
    const used = {}, occ = {}, out = [];
    listOf(tr).forEach(function (p) {
        p = listOf(p);
        const t = String(p[0] || ''), r = (Number(p[1]) || 0) & 3, x = Number(p[2]) || 0, y = Number(p[3]) || 0;
        if (!SHAPES[t]) return;
        if (owned && (used[t] || 0) >= (owned[t] || 0)) return;
        const cs = cellsOf(t, r).map(function (c) { return [c[0] + x, c[1] + y]; });
        if (cs.some(function (c) { return c[0] < 0 || c[1] < 0 || c[0] >= GW || c[1] >= GH || occ[c[0] + ',' + c[1]]; })) return;
        cs.forEach(function (c) { occ[c[0] + ',' + c[1]] = t; });
        used[t] = (used[t] || 0) + 1;
        out.push([t, r, x, y]);
    });
    return out;
}
function ownedOf(u) {
    const o = {};
    ((u && Array.isArray(u.inventory)) ? u.inventory : []).forEach(function (n) { const t = BY_NAME[n]; if (t) o[t] = (o[t] || 0) + 1; });
    return o;
}
function totalOf(o) { return TYPES.reduce(function (a, t) { return a + (o[t] || 0); }, 0); }
// 내 탈것 — 가진 블록만큼만
function mine(u) { u = u || u_(); return u ? clean(u.tetRide, ownedOf(u)) : []; }
window.tetRideMine = mine;
// 칸 목록 · 둘레 (판 좌표를 둘레 안으로 당긴다)
function layout(tr) {
    const cells = [];
    tr.forEach(function (p) {
        cellsOf(p[0], p[1]).forEach(function (c) { cells.push({ x: c[0] + p[2], y: c[1] + p[3], t: p[0] }); });
    });
    if (!cells.length) return null;
    const x0 = Math.min.apply(null, cells.map(function (c) { return c.x; }));
    const y0 = Math.min.apply(null, cells.map(function (c) { return c.y; }));
    const x1 = Math.max.apply(null, cells.map(function (c) { return c.x; }));
    const y1 = Math.max.apply(null, cells.map(function (c) { return c.y; }));
    cells.forEach(function (c) { c.x -= x0; c.y -= y0; });
    return { cells: cells, cols: x1 - x0 + 1, rows: y1 - y0 + 1 };
}
// 서는 줄 — 가운데에 가장 가까운 (칸이 있는) 줄 · 같으면 더 높은 쪽
function standOf(L) {
    const top = {};
    L.cells.forEach(function (c) { if (top[c.x] == null || c.y < top[c.x]) top[c.x] = c.y; });
    const mid = (L.cols - 1) / 2;
    let best = null;
    Object.keys(top).forEach(function (k) {
        const x = Number(k), d = Math.abs(x - mid);
        if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) < 1e-9 && top[x] < best.top)) best = { x: x, d: d, top: top[x] };
    });
    return best;
}
// ★ 그린다 — 광장(plaza.js makeOne) · 옷장(closet.js paintDoll) · 조합 창 미리 보기
//   k — 칸 배율 (도트 → px). 돌려주는 것 — { el, w, h, lift(서는 높이), standX(왼끝에서 서는 줄 가운데까지), cells, cell }
function rideEl(tr, k) {
    const L = layout(clean(tr));
    if (!L) return null;
    const cell = Math.max(2, Math.floor(Math.min(CAP_W * k / L.cols, CAP_H * k / L.rows)));
    const w = cell * L.cols, h = cell * L.rows;
    const el = document.createElement('div');
    el.className = 'plaza-tride';
    el.style.cssText = 'position:absolute;left:50%;width:' + w + 'px;height:' + h + 'px;pointer-events:none;';
    const b = Math.max(1, Math.round(cell * 0.14));
    L.cells.forEach(function (c) {
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;left:' + (c.x * cell) + 'px;top:' + (c.y * cell) + 'px;width:' + cell + 'px;height:' + cell + 'px;'
            + 'box-sizing:border-box;background:' + COLORS[c.t] + ';'
            + (cell >= 6 ? 'border:1px solid rgba(0,0,0,.38);' : '')
            + 'box-shadow:inset ' + b + 'px ' + b + 'px 0 rgba(255,255,255,.38),inset -' + b + 'px -' + b + 'px 0 rgba(0,0,0,.22);';
        el.appendChild(d);
    });
    const st = standOf(L);
    return { el: el, w: w, h: h, lift: (L.rows - st.top) * cell, standX: (st.x + 0.5) * cell, cell: cell,
             cells: L.cells.map(function (c) { return { x: c.x * cell, y: c.y * cell, c: COLORS[c.t] }; }) };
}
window.tetRideEl = rideEl;

// ==========================================
// 물품 — 블록 일곱 가지 (밀실 거래 됨 · 상점에는 안 판다)
// ==========================================
(function reg() {
    function put() {
        if (typeof ITEM_CATALOG === 'undefined') return false;
        TYPES.forEach(function (t) {
            const n = nameOf(t);
            if (!ITEM_CATALOG[n]) ITEM_CATALOG[n] = { price: 0, usable: true, targetable: false, effect: 'tet_block', noSell: true,
                desc: '[탈것 조각] ' + t + ' 모양 블록. 쓰면 테트리스 탈것 조합 창이 열린다 (쓰여 없어지지 않는다). 밀실 거래로 주고받을 수 있다.' };
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(n) < 0) NO_SELL_ITEMS.push(n);
        });
        return true;
    }
    if (put()) return;
    const iv = setInterval(function () { if (put()) clearInterval(iv); }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 소지품 [사용] → 조합 창
(function hookUse() {
    const iv = setInterval(function () {
        const f = window.useInventoryItem;
        if (typeof f !== 'function') return;
        if (f._tetRide) { clearInterval(iv); return; }
        const w = function (itemName) {
            if (!BY_NAME[itemName]) return f.apply(this, arguments);
            const u = u_();
            if (!u || (u.inventory || []).indexOf(itemName) < 0) return;
            open();
        };
        Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
        w._tetRide = true;
        window.useInventoryItem = w;
        try { useInventoryItem = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 블록을 하나라도 가지면 옷장 악세 「탈것」 에 테트리스 탈것이 생긴다 (거래로 받아도)
function wardrobeFix(u) {
    if (!u || !totalOf(ownedOf(u))) return false;
    if (!u.wardrobe || typeof u.wardrobe !== 'object') u.wardrobe = {};
    if (u.wardrobe['tet-ride']) return false;
    u.wardrobe['tet-ride'] = 1;
    return true;
}
let lastMine = null;
setInterval(function () {
    try {
        const u = u_(); if (!u) return;
        if (wardrobeFix(u)) save({ wardrobe: 1 });
        // 거래로 블록을 내주거나 받아 탈것 모양이 바뀌면 광장의 내 모습을 다시 그린다
        const k = JSON.stringify(mine(u));
        if (lastMine !== null && k !== lastMine && typeof window.plazaRedress === 'function') window.plazaRedress();
        lastMine = k;
    } catch (e) { }
}, 3000);

// ==========================================
// 받기 — 솔로 한 판에서 20 · 25 · 30 · 35 · 40 · 45 · 50 줄
// ==========================================
function got(u) { return (u && u.tetBlk && typeof u.tetBlk === 'object') ? u.tetBlk : {}; }
function grant(lines, force) {
    const u = u_(); if (!u) return [];
    const g = Object.assign({}, got(u));
    const due = MILES.filter(function (m) { return (force ? force === m : lines >= m) && !g[m]; });
    if (!due.length) return [];
    if (!Array.isArray(u.inventory)) u.inventory = [];
    const out = [];
    due.forEach(function (m) {
        const had = Object.keys(g).map(function (k) { return g[k]; });
        const left = TYPES.filter(function (t) { return had.indexOf(t) < 0; });
        const pool = left.length ? left : TYPES;
        const t = pool[Math.floor(Math.random() * pool.length)];
        g[m] = t;
        u.inventory.push(nameOf(t));
        out.push({ m: m, t: t });
        log_(u, '[🧩 테트리스] 솔로 ' + m + '줄 — ' + nameOf(t) + ' 을(를) 받았습니다 (' + Object.keys(g).length + ' / ' + MILES.length + ')');
    });
    u.tetBlk = g;
    wardrobeFix(u);
    save({ inventory: 1, tetBlk: 1, wardrobe: 1, history: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('🧩 테트리스 블록\n\n' + out.map(function (x) { return '솔로 ' + x.m + '줄 — ' + nameOf(x.t); }).join('\n')
        + '\n\n소지품에 들어왔습니다 (' + Object.keys(g).length + ' / ' + MILES.length + ').\n[사용] 하거나 옷장 악세 「탈것」 의 [🧩 조합] 으로 탈것을 만듭니다.');
    return out;
}
function tetObj() { try { return (typeof tet !== 'undefined') ? tet : null; } catch (e) { return null; } }
(function hookLock() {
    const iv = setInterval(function () {
        const f = window.tetLock;
        if (typeof f !== 'function') return;
        if (f._tetRide) { clearInterval(iv); return; }
        const w = function () {
            const out = f.apply(this, arguments);
            try { const t = tetObj(); if (t && t.mode === 'solo' && t.lines >= MILES[0]) grant(t.lines); } catch (e) { }
            return out;
        };
        w._tetRide = true;
        window.tetLock = w;
        try { tetLock = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 조합 창
// ==========================================
const ST = { sel: null, rot: 0, tr: [], msg: '' };
function shut() { const o = document.getElementById(OV); if (o) o.remove(); }
function mini(t, r, px) {
    const cs = cellsOf(t, r);
    const cw = Math.max.apply(null, cs.map(function (c) { return c[0]; })) + 1, ch = Math.max.apply(null, cs.map(function (c) { return c[1]; })) + 1;
    return '<span style="position:relative; display:inline-block; width:' + (cw * px) + 'px; height:' + (ch * px) + 'px;">'
        + cs.map(function (c) { return '<i style="position:absolute; left:' + (c[0] * px) + 'px; top:' + (c[1] * px) + 'px; width:' + (px - 1) + 'px; height:' + (px - 1) + 'px; background:' + COLORS[t] + '; border-radius:1px;"></i>'; }).join('')
        + '</span>';
}
function open() {
    const u = u_(); if (!u) return;
    ST.tr = mine(u);
    ST.sel = null; ST.rot = 0; ST.msg = '';
    shut();
    const w = document.createElement('div');
    w.id = OV;
    w.style.cssText = 'position:fixed; inset:0; z-index:100000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:12px;';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    paint();
}
window.tetRideOpen = open;
function paint() {
    const w = document.getElementById(OV); if (!w) return;
    const u = u_(); if (!u) { shut(); return; }
    const own = ownedOf(u);
    const used = {}; ST.tr.forEach(function (p) { used[p[0]] = (used[p[0]] || 0) + 1; });
    const occ = {}; ST.tr.forEach(function (p, i) { cellsOf(p[0], p[1]).forEach(function (c) { occ[(c[0] + p[2]) + ',' + (c[1] + p[3])] = { t: p[0], i: i }; }); });
    const C = 26;
    let grid = '';
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const o = occ[x + ',' + y];
        grid += '<div class="tr-c" data-x="' + x + '" data-y="' + y + '" style="width:' + C + 'px; height:' + C + 'px; box-sizing:border-box; border-radius:2px; cursor:pointer;'
            + (o ? 'background:' + COLORS[o.t] + '; border:1px solid rgba(0,0,0,.35); box-shadow:inset 3px 3px 0 rgba(255,255,255,.35), inset -3px -3px 0 rgba(0,0,0,.2);'
                 : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.06);') + '"></div>';
    }
    const pal = TYPES.map(function (t) {
        const n = own[t] || 0, left = n - (used[t] || 0);
        const on = ST.sel === t;
        return '<button class="tr-p" data-t="' + t + '"' + (left > 0 ? '' : ' disabled') + ' style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;'
            + ' min-width:0; padding:6px 2px; border-radius:7px; cursor:pointer; background:' + (on ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)') + ';'
            + ' border:1px solid ' + (on ? COLORS[t] : 'rgba(255,255,255,0.12)') + '; color:#ddd; font-size:10px;' + (left > 0 ? '' : ' opacity:.35;') + '">'
            + '<span style="height:18px; display:flex; align-items:center;">' + mini(t, 0, 7) + '</span>'
            + '<span>' + t + ' ' + (used[t] || 0) + '/' + n + '</span></button>';
    }).join('');
    const total = totalOf(own);
    w.innerHTML = '<div style="background:linear-gradient(145deg,#15151d,#0b0b10); border:1px solid #4a4a5e; border-radius:10px; padding:13px; width:100%; max-width:360px; max-height:92dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; color:#e8e8f0;">'
        + '<div style="font-size:13px; font-weight:bold; color:#ffe9a8; margin-bottom:3px;">🧩 테트리스 탈것 — 조합</div>'
        + '<div style="font-size:10px; color:#9a9aae; line-height:1.6; margin-bottom:9px;">가진 블록을 판에 놓아 탈것을 만듭니다. 블록 하나면 캐릭터의 1.5배, 여럿을 이으면 그 크기 안으로 작아집니다.<br>'
        + '블록을 고르고 판을 누르면 놓이고, 놓인 블록을 누르면 빠집니다.</div>'
        + '<div id="tr-prev" style="height:150px; position:relative; overflow:hidden; background:rgba(255,255,255,0.03); border-radius:8px; margin-bottom:9px;"></div>'
        + (total ? '' : '<div style="font-size:11px; color:#ff9f8a; text-align:center; margin:6px 0 9px;">가진 블록이 없습니다. 오락실 테트리스 솔로에서 20줄부터 5줄마다 하나씩 받습니다.</div>')
        + '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; margin-bottom:8px;">' + pal + '</div>'
        + '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; min-height:30px;">'
        + '<button id="tr-rot" class="game-btn" style="flex:0 0 auto; margin:0; padding:6px 12px; font-size:12px;"' + (ST.sel ? '' : ' disabled') + '>↻ 돌리기</button>'
        + '<span style="flex:1; display:flex; align-items:center; gap:7px; font-size:11px; color:#aaa;">' + (ST.sel ? mini(ST.sel, ST.rot, 9) + ' <span>놓을 자리를 누르세요</span>' : '<span>블록을 고르세요</span>') + '</span></div>'
        + '<div id="tr-grid" style="display:grid; grid-template-columns:repeat(' + GW + ', ' + C + 'px); gap:2px; justify-content:center; margin-bottom:8px;">' + grid + '</div>'
        + '<div id="tr-msg" style="min-height:16px; font-size:11px; color:#ffcf7a; text-align:center; margin-bottom:6px;">' + esc(ST.msg) + '</div>'
        + '<div style="display:flex; gap:6px;">'
        + '<button id="tr-clr" class="game-btn" style="flex:1; margin:0; padding:10px; font-size:11px; background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">모두 치우기</button>'
        + '<button id="tr-save" class="game-btn" style="flex:1.4; margin:0; padding:10px; font-size:12px;">저장</button>'
        + '<button id="tr-x" class="game-btn" style="flex:1; margin:0; padding:10px; font-size:11px; background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">닫기</button></div>'
        + '</div>';
    Array.prototype.forEach.call(w.querySelectorAll('.tr-p'), function (b) {
        b.onclick = function () { const t = b.dataset.t; if (ST.sel === t) ST.sel = null; else { ST.sel = t; } ST.msg = ''; paint(); };
    });
    Array.prototype.forEach.call(w.querySelectorAll('.tr-c'), function (c) {
        c.onclick = function () { cellTap(Number(c.dataset.x), Number(c.dataset.y)); };
    });
    w.querySelector('#tr-rot').onclick = function () { ST.rot = (ST.rot + 1) & 3; paint(); };
    w.querySelector('#tr-clr').onclick = function () { ST.tr = []; ST.msg = ''; paint(); };
    w.querySelector('#tr-x').onclick = shut;
    w.querySelector('#tr-save').onclick = saveRide;
    prev();
}
function cellTap(x, y) {
    const u = u_(); if (!u) return;
    // 놓인 블록을 누르면 뺀다
    for (let i = 0; i < ST.tr.length; i++) {
        const p = ST.tr[i];
        if (cellsOf(p[0], p[1]).some(function (c) { return c[0] + p[2] === x && c[1] + p[3] === y; })) {
            ST.tr.splice(i, 1); ST.msg = ''; paint(); return;
        }
    }
    if (!ST.sel) { ST.msg = '블록을 먼저 고르세요.'; paint(); return; }
    const own = ownedOf(u), used = ST.tr.filter(function (p) { return p[0] === ST.sel; }).length;
    if (used >= (own[ST.sel] || 0)) { ST.msg = ST.sel + ' 블록을 다 놓았습니다.'; ST.sel = null; paint(); return; }
    const next = ST.tr.concat([[ST.sel, ST.rot, x, y]]);
    if (clean(next, own).length !== next.length) { ST.msg = '거기에는 안 들어갑니다.'; paint(); return; }
    ST.tr = next; ST.msg = '';
    if (used + 1 >= (own[ST.sel] || 0)) ST.sel = null;          // 그 모양을 다 놓았으면 고른 것을 푼다
    paint();
}
// 미리 보기 — 지금 모습 그대로 탈것 위에 세운다
function prev() {
    const box = document.getElementById('tr-prev'); if (!box) return;
    box.innerHTML = '';
    const u = u_(); if (!u) return;
    const k = 0.34;
    const v = rideEl(ST.tr, k);
    const sp = (typeof window.dotSpec === 'function') ? window.dotSpec() : { W: 352, H: 384, FOOT: 8 };
    const wrap = document.createElement('div');
    const W = sp.W * k, H = sp.H * k, foot = (sp.FOOT || 8) * k;
    const lift = v ? v.lift : 0;
    const ground = 140;                                         // 상자 안 땅 높이(px)
    wrap.style.cssText = 'position:absolute; left:50%; width:' + W + 'px; height:' + H + 'px; margin-left:' + (-W / 2) + 'px; top:' + (ground - (H - foot) - lift) + 'px;';
    if (v) {
        v.el.style.top = Math.round(H - foot + lift - v.h) + 'px';
        v.el.style.marginLeft = (-v.standX) + 'px';
        wrap.appendChild(v.el);
    }
    try { if (typeof window.dotSprite === 'function') wrap.appendChild(window.dotSprite(u, { pose: 'stand', scale: k, live: false })); } catch (e) { }
    box.appendChild(wrap);
    const gl = document.createElement('div');
    gl.style.cssText = 'position:absolute; left:8px; right:8px; top:' + ground + 'px; height:1px; background:rgba(255,255,255,0.15);';
    box.appendChild(gl);
}
function saveRide() {
    const u = u_(); if (!u) return;
    u.tetRide = clean(ST.tr, ownedOf(u));
    wardrobeFix(u);
    save({ tetRide: 1, wardrobe: 1 });
    lastMine = JSON.stringify(mine(u));
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    try { const b = document.getElementById('house-closet-body'); if (b && b.offsetParent && typeof window.renderCloset === 'function') window.renderCloset(); } catch (e) { }
    const acc = String((u.dot && u.dot.acc) || '');
    const on = acc.split(',').indexOf('tet-ride') >= 0;
    ST.msg = u.tetRide.length ? ('저장했습니다 — 블록 ' + u.tetRide.length + '개' + (on ? '' : ' · 옷장 악세 「탈것」 에서 테트리스 탈것을 달면 탑니다')) : '저장했습니다 — 비어 있습니다';
    paint();
}

// ==========================================
// 콘솔
// ==========================================
window.tetRideState = function () {
    const u = u_(); if (!u) return;
    console.log('%c===== 🧩 테트리스 탈것 =====', 'color:#ffe9a8; font-size:13px');
    console.log('  가진 블록', ownedOf(u), '· 받은 줄', got(u));
    console.log('  조합', JSON.stringify(mine(u)), '· 옷장', !!(u.wardrobe && u.wardrobe['tet-ride']));
};
window.tetRideGive = function (m) {
    const u = u_();
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const g = got(u);
    const left = MILES.filter(function (x) { return !g[x]; });
    const want = m ? Number(m) : left[0];
    if (!want || MILES.indexOf(want) < 0) { console.warn('받을 줄이 없습니다.', MILES); return; }
    return grant(0, want);
};
})();
