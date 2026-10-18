// ==========================================
// ★ 🖋️ 유리 펜 — 광장 방 바닥 그림 위에 그리는 그림판 (2026-10-18)
// bundles.json 마지막 묶음, gacha.js 뒤 (closet.js · plaza.js 다음)
// ==========================================
//
// ■ 무엇인가
//
//   옷장 악세 「유리 펜」(closet.js — 상담사, 그리고 상담사가 선물함으로
//   보내 준 사람만 가진다)을 달고
//   광장에 들어가면 **오른쪽 아래(미니맵 위)에 펜 단추**가 뜬다.
//   누르면 그림판이 열리고, 화면에 그은 것이 **지금 선 방의 바닥 그림 위**에
//   그려진다. 같은 방(같은 번호 방)에 있는 사람은 모두 본다 —
//   펜을 안 단 사람도 본다. 그은 획마다 **10초 뒤에** 옅어지며 사라진다.
//
// ■ 어떻게 붙나
//
//   · 획은 **방 그림의 좌표**로 적는다 (화면 좌표가 아니다). 그래서 걸어서
//     화면이 움직여도, 화면 크기가 다른 사람이 봐도 바닥 그 자리에 붙어 있다.
//   · 그림은 방 그림 칸(#plaza-room) 안의 캔버스에 그린다. 사람(z 100+)보다
//     아래라 사람 뒤 바닥에 그려진 것처럼 보인다.
//   · 서버 자리 — plazaDraw/<방>/<획> = {by, n, at, c, w, p:[x,y,x,y…]}
//       손을 뗄 때 한 획을 한 번에 적는다. at 은 서버 시각(clock.js 의 serverNow).
//       그린 사람이 10초 뒤에 지운다. 그린 사람이 그 전에 나가 버렸으면
//       (접속이 끊기면 onDisconnect 로 지워지고) 나중에 들어온 사람이 묵은 것을 치운다.
//   · 방을 옮기면 그 방 획만 본다 (plazaStage().seat — 방~번호).
//
// ■ 콘솔
//
//       penState()          단추·그림판·보이는 획
//       penOpen() / penClose()
// ==========================================
(function () {
'use strict';

const PEN = {
    ID: 'glass-pen',          // 옷장 악세 줄 이름 (closet.js) — dotLook().tops 에 이 장이 있으면 단 것
    PATH: 'plazaDraw',        // 서버에 획을 적는 자리
    LIFE: 10000,              // 그은 지 10초 뒤에 사라진다
    FADE: 1200,               // 사라지기 전 이만큼 옅어진다
    STALE: 15000,             // 이보다 오래 남은 획은 본 사람이 치운다 (그린 이가 나간 것)
    MAX_PTS: 600,             // 한 획에 적는 점 수 (넘으면 솎는다)
    MAX_LIVE: 150,            // 한 방에 한꺼번에 그리는 획
    STEP: 2,                  // 화면에서 이만큼 움직여야 점을 하나 더 찍는다
    POLL: 400,
    MAX_PX: 4200000,          // 캔버스 점 수 상한 (넓은 방에서 메모리를 아낀다)
    COLORS: ['#ffffff', '#1c1c1c', '#ff5a5a', '#ffd400', '#5ad17a', '#5ab8ff', '#b98bff', '#ff9ad5'],
    SIZES: [3, 6, 12]         // 화면에서 보이는 굵기 (픽셀)
};

const S = {
    color: PEN.COLORS[0], size: PEN.SIZES[1],
    btn: null, board: null, open: false,
    seat: null, ref: null, onAdd: null, onDel: null,
    strokes: {},              // 열쇠 → {c, w, p, at, by, mine}
    live: null,               // 긋고 있는 획 {c, w, p, pid, lx, ly}
    cv: null, ctx: null, raf: 0, dim: '',
    timers: {}
};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database && database.ref) ? database : null; }
function now() { return (typeof window.serverNow === 'function') ? window.serverNow() : Date.now(); }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }

// 펜을 달았나 — 옷장이 거른 뒤의 것(못 가진 것은 빠진다)으로 본다
function worn() {
    const u = u_();
    if (!u || typeof window.dotLook !== 'function') return false;
    try {
        const L = window.dotLook(u);
        return !!(L && L.tops && L.tops.indexOf(PEN.ID) >= 0);
    } catch (e) { return false; }
}

// ==========================================
// 상담사가 선물함으로 준다
// ==========================================
//   물품 「유리 펜」을 물품 표(ITEM_CATALOG)에 올려 둔다 → 상담사 화면
//   「물품 강제 꽂기」 목록에 뜬다. 보내면 선물함으로 가고, 사원이 받는 순간
//   소지품이 아니라 **옷장(악세)** 으로 들어간다 (giftbox.js 의 GIFT_WEAR).
//   팔 수 없다 (장터는 가게 물품만 받아 원래 안 나온다). 소지품에 남는 일은 없지만, 혹시 다른 길로
//   소지품에 들어오면 「사용」으로 옷장에 넣는다.
const ITEM = '유리 펜';
window.GIFT_WEAR = window.GIFT_WEAR || {};
window.GIFT_WEAR[ITEM] = { k: PEN.ID, slot: '악세 칸' };

function copyFlags(from, to) {
    Object.keys(from).forEach(function (k) { try { to[k] = from[k]; } catch (e) { } });
}
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[ITEM]) {
            ITEM_CATALOG[ITEM] = {
                price: 0, usable: true, targetable: false,
                effect: 'wear_glass_pen', noSell: true,
                desc: '[악세] 유리로 빚은 펜. 옷장 악세에 넣어 달 수 있다. '
                    + '달고 광장에 서면 바닥에 글씨나 그림을 그릴 수 있고, 그린 것은 10초 뒤에 사라진다.'
            };
        }
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(ITEM) < 0) NO_SELL_ITEMS.push(ITEM);
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 소지품에 들어와 있는 유리 펜 → 옷장으로
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._pen) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== ITEM) return _u.apply(this, arguments);
            const u = u_();
            if (!u || !Array.isArray(u.inventory) || u.inventory.indexOf(ITEM) < 0) return;
            if (!u.wardrobe || typeof u.wardrobe !== 'object') u.wardrobe = {};
            if (u.wardrobe[PEN.ID]) { alert_('유리 펜은 이미 옷장에 있습니다.'); return; }
            u.wardrobe[PEN.ID] = 1;
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, ITEM, 1); } catch (e) { }
            try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[' + ITEM + '] 옷장 악세에 넣었습니다.'); } catch (e) { }
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(ITEM + '\n\n옷장 악세에 들어왔습니다.\n옷장이나 광장 가방에서 달 수 있습니다.');
        };
        copyFlags(_u, w);
        w._pen = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 모양
// ==========================================
(function css() {
    if (document.getElementById('pen-css')) return;
    const st = document.createElement('style');
    st.id = 'pen-css';
    st.textContent = [
        // 펜 단추 — 미니맵 바로 위 (자리는 tick 이 미니맵을 재서 정한다)
        '#pen-btn{position:absolute;right:12px;z-index:51;width:48px;height:48px;padding:0;',
        '  display:none;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;',
        '  background:rgba(12,14,20,.66);border:1px solid rgba(150,225,255,.42);',
        '  box-shadow:0 2px 10px rgba(0,0,0,.35);touch-action:none;',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#pen-btn.show{display:flex;}',
        '#pen-btn img{height:34px;image-rendering:pixelated;pointer-events:none;',
        '  filter:drop-shadow(0 0 3px rgba(160,235,255,.55));}',
        '#pen-btn:active{transform:scale(.94);}',
        '#pen-btn.on{background:rgba(40,70,90,.82);border-color:#9fe8ff;',
        '  box-shadow:0 0 12px rgba(140,225,255,.65);}',
        // 그림판 — 화면을 통째로 덮어 손가락을 받는다 (걷기·단추로 새지 않게)
        '#pen-board{position:absolute;inset:0;z-index:50;touch-action:none;cursor:crosshair;',
        '  user-select:none;-webkit-user-select:none;',
        '  box-shadow:inset 0 0 0 2px rgba(150,225,255,.5),inset 0 0 26px rgba(150,225,255,.18);}',
        '#pen-board .pb-bar{position:absolute;left:50%;transform:translateX(-50%);width:max-content;box-sizing:border-box;',
        '  top:calc(env(safe-area-inset-top,0px) + 12px);display:flex;align-items:center;gap:10px;',
        '  max-width:calc(100% - 24px);padding:8px 10px;border-radius:999px;cursor:default;',
        '  background:rgba(12,14,20,.84);border:1px solid rgba(150,225,255,.32);',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#pen-board .pb-cols,#pen-board .pb-sizes{display:flex;align-items:center;gap:6px;}',
        '#pen-board .pb-c{width:22px;height:22px;padding:0;border-radius:50%;cursor:pointer;',
        '  border:2px solid rgba(255,255,255,.25);flex:0 0 auto;}',
        '#pen-board .pb-c.on{border-color:#9fe8ff;box-shadow:0 0 0 2px rgba(159,232,255,.35);}',
        '#pen-board .pb-s{width:26px;height:26px;padding:0;border-radius:50%;cursor:pointer;',
        '  display:flex;align-items:center;justify-content:center;flex:0 0 auto;',
        '  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);}',
        '#pen-board .pb-s i{display:block;border-radius:50%;background:#e8e2d6;}',
        '#pen-board .pb-s.on{border-color:#9fe8ff;background:rgba(159,232,255,.16);}',
        '#pen-board .pb-x{flex:0 0 auto;padding:6px 12px;border-radius:999px;cursor:pointer;',
        '  font-size:12px;font-family:inherit;color:#e8e2d6;',
        '  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);}',
        '#pen-board .pb-tip{position:absolute;left:50%;transform:translateX(-50%);',
        '  top:calc(env(safe-area-inset-top,0px) + 62px);font-size:11px;color:rgba(214,238,248,.82);',
        '  white-space:nowrap;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.8);}',
        // 손전화 폭(393)에서는 단추를 조금 줄여 한 줄에 다 들어가게 한다
        '@media (max-width:430px){#pen-board .pb-bar{gap:7px;padding:7px 8px;}',
        '  #pen-board .pb-cols,#pen-board .pb-sizes{gap:4px;}',
        '  #pen-board .pb-c{width:20px;height:20px;}#pen-board .pb-s{width:24px;height:24px;}',
        '  #pen-board .pb-x{padding:6px 10px;}}',
        '@media (max-width:350px){#pen-board .pb-bar{gap:5px;padding:6px 7px;}',
        '  #pen-board .pb-c{width:17px;height:17px;}#pen-board .pb-s{width:21px;height:21px;}',
        '  #pen-board .pb-cols,#pen-board .pb-sizes{gap:3px;}#pen-board .pb-x{padding:5px 8px;}}',
        // 그리는 동안은 위 띠(사원증·포인트)를 걷는다 — 안내 글과 겹치고, 어차피 못 누른다
        '#plaza-ov.pen-on #plaza-top,#plaza-ov.pen-on #plaza-hud,#plaza-ov.pen-on #plaza-cam{opacity:0;pointer-events:none;}',
        // 그린 것 — 방 그림 칸 안, 사람보다 아래
        '.pen-cv{position:absolute;left:0;top:0;width:100%;height:100%;z-index:2;',
        '  pointer-events:none;image-rendering:auto;}'
    ].join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 캔버스 — 방 그림 칸에 붙인다
// ==========================================
//   방을 옮기면 광장이 방 칸을 비우므로(innerHTML = '') 그때마다 새로 붙인다.
//   창 크기가 바뀌어 방 칸이 커지고 줄면 점 수도 다시 맞춘다.
function ensureCanvas(st) {
    if (!S.cv || S.cv.parentNode !== st.el) {
        S.cv = document.createElement('canvas');
        S.cv.className = 'pen-cv';
        S.ctx = S.cv.getContext('2d');
        S.dim = '';
        st.el.appendChild(S.cv);
    }
    const w = st.el.offsetWidth || 0, h = st.el.offsetHeight || 0;
    if (!w || !h) return false;
    let k = Math.min(2, window.devicePixelRatio || 1);
    if (w * h * k * k > PEN.MAX_PX) k = Math.sqrt(PEN.MAX_PX / (w * h));
    const cw = Math.max(1, Math.min(4096, Math.round(w * k)));
    const ch = Math.max(1, Math.min(4096, Math.round(h * k)));
    const dim = cw + 'x' + ch + '@' + st.w + 'x' + st.h;
    if (dim !== S.dim) {
        S.cv.width = cw; S.cv.height = ch; S.dim = dim;
        kick();
    }
    return true;
}

function alphaOf(s, t) {
    if (s.at == null) return 1;                        // 아직 긋는 중 · 적기 전
    const left = s.at + PEN.LIFE - t;
    if (left <= 0) return 0;
    return left < PEN.FADE ? left / PEN.FADE : 1;
}

function trace(ctx, s, a) {
    const p = s.p;
    if (!p || p.length < 2) return;
    ctx.globalAlpha = a;
    ctx.strokeStyle = s.c;
    ctx.fillStyle = s.c;
    ctx.lineWidth = s.w;
    if (p.length < 4) {                                // 톡 찍은 점
        ctx.beginPath();
        ctx.arc(p[0], p[1], s.w / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    ctx.beginPath();
    ctx.moveTo(p[0], p[1]);
    // 점 사이를 가운데점으로 이어 부드럽게 굽힌다
    for (let i = 2; i < p.length - 2; i += 2) {
        const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2;
        ctx.quadraticCurveTo(p[i], p[i + 1], mx, my);
    }
    ctx.lineTo(p[p.length - 2], p[p.length - 1]);
    ctx.stroke();
}

function paint() {
    S.raf = 0;
    const st = stage();
    if (!st || !S.cv || !S.ctx || S.cv.parentNode !== st.el) return;
    const ctx = S.ctx, t = now();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, S.cv.width, S.cv.height);
    ctx.setTransform(S.cv.width / st.w, 0, 0, S.cv.height / st.h, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    let more = false;
    const keys = Object.keys(S.strokes).sort(function (a, b) {
        return (S.strokes[a].at || 0) - (S.strokes[b].at || 0);
    });
    keys.forEach(function (k) {
        const s = S.strokes[k];
        const a = alphaOf(s, t);
        if (a <= 0) { drop(k); return; }
        trace(ctx, s, a);
        more = true;
    });
    if (S.live) { trace(ctx, S.live, 1); more = true; }
    ctx.globalAlpha = 1;
    if (more) S.raf = requestAnimationFrame(paint);
}
function kick() { if (!S.raf) S.raf = requestAnimationFrame(paint); }

// 다 산 획을 내린다 — 내 것이면 서버에서도 지운다
function drop(k) {
    const s = S.strokes[k];
    delete S.strokes[k];
    if (S.timers[k]) { clearTimeout(S.timers[k]); delete S.timers[k]; }
    if (s && s.mine && S.ref) { try { S.ref.child(k).remove(); } catch (e) { } }
}

// ==========================================
// 서버 — 지금 방의 획을 듣는다
// ==========================================
function okStroke(v) {
    if (!v || typeof v !== 'object') return false;
    if (typeof v.c !== 'string' || !/^#[0-9a-f]{6}$/i.test(v.c)) return false;
    if (typeof v.w !== 'number' || !(v.w > 0) || v.w > 400) return false;
    if (!Array.isArray(v.p) || v.p.length < 2 || v.p.length > PEN.MAX_PTS * 2 + 2) return false;
    if (typeof v.at !== 'number') return false;
    return true;
}

function listen(seat) {
    unlisten();
    S.seat = seat;
    const d = db_();
    if (!seat || !d) return;
    const me = u_();
    S.ref = d.ref(PEN.PATH + '/' + seat);
    S.onAdd = function (snap) {
        const k = snap.key, v = snap.val();
        if (!okStroke(v)) return;
        const age = now() - v.at;
        if (age >= PEN.LIFE) {
            // 그린 이가 지우지 못하고 나간 것 — 묵었으면 본 사람이 치운다
            if (age > PEN.STALE) { try { S.ref.child(k).remove(); } catch (e) { } }
            delete S.strokes[k];
            return;
        }
        if (Object.keys(S.strokes).length >= PEN.MAX_LIVE && !S.strokes[k]) return;
        const mine = !!(me && v.by === me.code);
        S.strokes[k] = { c: v.c, w: v.w, p: v.p.map(Number), at: v.at, by: v.by, mine: mine };
        // 내 것은 10초 뒤에 내가 지운다 (화면이 안 그려지고 있어도)
        if (mine && !S.timers[k]) {
            S.timers[k] = setTimeout(function () {
                delete S.timers[k];
                drop(k);
                kick();
            }, Math.max(0, PEN.LIFE - age) + 150);
        }
        kick();
    };
    S.onDel = function (snap) {
        if (S.strokes[snap.key]) { delete S.strokes[snap.key]; kick(); }
    };
    S.ref.on('child_added', S.onAdd);
    S.ref.on('child_removed', S.onDel);
}

function unlisten() {
    if (S.ref) {
        try { S.ref.off('child_added', S.onAdd); } catch (e) { }
        try { S.ref.off('child_removed', S.onDel); } catch (e) { }
    }
    // 방을 떠나도 내 획은 서버에서 지운다 (남은 사람이 10초 뒤에 못 치울 수도 있다)
    Object.keys(S.strokes).forEach(function (k) {
        const s = S.strokes[k];
        if (s && s.mine && S.ref) {
            const ref = S.ref.child(k), left = s.at + PEN.LIFE - now();
            setTimeout(function () { try { ref.remove(); } catch (e) { } }, Math.max(0, left) + 150);
        }
    });
    Object.keys(S.timers).forEach(function (k) { clearTimeout(S.timers[k]); });
    S.timers = {};
    S.ref = null; S.onAdd = null; S.onDel = null; S.seat = null;
    S.strokes = {};
    S.live = null;
    kick();
}

// 손을 뗀 획을 적는다
function publish(live) {
    const u = u_();
    if (!S.ref || !u) return;
    let p = live.p;
    // 너무 길면 솎는다 (첫 점과 끝 점은 남긴다)
    if (p.length > PEN.MAX_PTS * 2) {
        const n = p.length / 2, step = n / PEN.MAX_PTS, q = [];
        for (let i = 0; i < PEN.MAX_PTS - 1; i++) {
            const j = Math.floor(i * step) * 2;
            q.push(p[j], p[j + 1]);
        }
        q.push(p[p.length - 2], p[p.length - 1]);
        p = q;
    }
    p = p.map(function (x) { return Math.round(x * 10) / 10; });
    const v = { by: u.code, n: String(u.name || '').slice(0, 20), at: now(),
                c: live.c, w: Math.round(live.w * 10) / 10, p: p };
    try {
        const r = S.ref.push();
        // 서버에서 돌아오기 전까지 사라지지 않게 먼저 얹어 둔다
        S.strokes[r.key] = { c: v.c, w: v.w, p: p, at: v.at, by: v.by, mine: true };
        try { r.onDisconnect().remove(); } catch (e) { }
        r.set(v);
        if (!S.timers[r.key]) {
            const k = r.key;
            S.timers[k] = setTimeout(function () { delete S.timers[k]; drop(k); kick(); }, PEN.LIFE + 150);
        }
    } catch (e) { }
    kick();
}

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

function buildBoard(ov) {
    const bd = document.createElement('div');
    bd.id = 'pen-board';
    bd.className = 'plaza-keep';
    let cols = '', sizes = '';
    PEN.COLORS.forEach(function (c) {
        cols += '<button class="pb-c' + (c === S.color ? ' on' : '') + '" data-c="' + c
            + '" style="background:' + c + '" aria-label="색"></button>';
    });
    PEN.SIZES.forEach(function (w) {
        const dot = Math.max(4, Math.min(16, w + 2));
        sizes += '<button class="pb-s' + (w === S.size ? ' on' : '') + '" data-w="' + w
            + '" aria-label="굵기"><i style="width:' + dot + 'px;height:' + dot + 'px"></i></button>';
    });
    bd.innerHTML = '<div class="pb-bar"><div class="pb-cols">' + cols + '</div>'
        + '<div class="pb-sizes">' + sizes + '</div>'
        + '<button class="pb-x">닫기</button></div>'
        + '<div class="pb-tip">🖋️ 그린 것은 10초 뒤에 사라집니다</div>';

    bd.querySelector('.pb-bar').addEventListener('click', function (e) {
        const t = e.target.closest('button');
        if (!t) return;
        e.stopPropagation();
        if (t.classList.contains('pb-x')) { closeBoard(); return; }
        if (t.dataset.c) {
            S.color = t.dataset.c;
            bd.querySelectorAll('.pb-c').forEach(function (b) { b.classList.toggle('on', b === t); });
        }
        if (t.dataset.w) {
            S.size = Number(t.dataset.w) || PEN.SIZES[1];
            bd.querySelectorAll('.pb-s').forEach(function (b) { b.classList.toggle('on', b === t); });
        }
    });

    const finish = function (e) {
        const L = S.live;
        if (!L || (e && e.pointerId !== L.pid)) return;
        S.live = null;
        if (L.p.length >= 2) publish(L);
        kick();
    };
    bd.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.pb-bar')) return;
        e.preventDefault();
        e.stopPropagation();
        if (S.live) return;                              // 손가락 하나로만 긋는다
        const st = stage();
        if (!st || !S.seat || !ensureCanvas(st)) return;
        const xy = roomXY(st, e);
        if (!xy) return;
        const z = (st.el.getBoundingClientRect().width / st.w) || st.z || 1;
        S.live = { c: S.color, w: S.size / z, p: [xy[0], xy[1]], pid: e.pointerId,
                   lx: e.clientX, ly: e.clientY };
        try { bd.setPointerCapture(e.pointerId); } catch (er) { }
        kick();
    });
    bd.addEventListener('pointermove', function (e) {
        const L = S.live;
        if (!L || e.pointerId !== L.pid) return;
        e.preventDefault();
        const st = stage();
        if (!st) return;
        const evs = (typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length)
            ? e.getCoalescedEvents() : [e];
        evs.forEach(function (ev) {
            if (Math.hypot(ev.clientX - L.lx, ev.clientY - L.ly) < PEN.STEP) return;
            if (L.p.length >= PEN.MAX_PTS * 4) return;   // 아주 긴 획은 그만 받는다 (적을 때 솎는다)
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
    // 그림판 위의 톡 치기가 광장으로 새지 않게
    bd.addEventListener('click', function (e) { e.stopPropagation(); });
    ov.appendChild(bd);
    return bd;
}

function openBoard() {
    const st = stage();
    if (!st || !st.ov || !worn()) return false;
    if (!S.board || !S.board.isConnected) S.board = buildBoard(st.ov);
    S.board.style.display = '';
    S.open = true;
    st.ov.classList.add('pen-on');
    if (S.btn) S.btn.classList.add('on');
    ensureCanvas(st);
    return true;
}
function closeBoard() {
    S.open = false;
    S.live = null;
    if (S.board) { try { S.board.remove(); } catch (e) { } }
    S.board = null;
    const ov = document.getElementById('plaza-ov');
    if (ov) ov.classList.remove('pen-on');
    if (S.btn) S.btn.classList.remove('on');
    kick();
}

window.addEventListener('keydown', function (e) {
    if (S.open && e.key === 'Escape') { e.stopPropagation(); closeBoard(); }
}, true);

// ==========================================
// 펜 단추 — 미니맵 바로 위
// ==========================================
function ensureBtn(ov) {
    if (S.btn && S.btn.isConnected && S.btn.parentNode === ov) return S.btn;
    const b = document.createElement('button');
    b.id = 'pen-btn';
    b.className = 'plaza-keep';
    b.title = '유리 펜';
    b.innerHTML = '<img src="dot/glass-pen-icon.png" alt="유리 펜">';
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (S.open) closeBoard(); else openBoard();
    });
    ov.appendChild(b);
    S.btn = b;
    return b;
}

function placeBtn(ov, b) {
    const ob = ov.getBoundingClientRect();
    const map = document.getElementById('plaza-map');
    let bottom = 86;
    if (map && !map.classList.contains('off') && map.offsetParent !== null) {
        bottom = ob.bottom - map.getBoundingClientRect().top + 8;
    } else {
        const bar = document.getElementById('plaza-bar');
        if (bar && bar.offsetParent !== null) bottom = ob.bottom - bar.getBoundingClientRect().top + 12;
    }
    const v = Math.round(bottom) + 'px';
    if (b.style.bottom !== v) b.style.bottom = v;
}

function tick() {
    const st = stage();
    if (!st || !st.ov) {
        // 광장 밖 — 다 걷는다
        if (S.seat || S.ref) unlisten();
        if (S.open || S.board) closeBoard();
        S.btn = null; S.cv = null; S.ctx = null; S.dim = '';
        return;
    }
    // 같은 방 획 듣기 (펜을 안 달아도 남이 그린 것은 본다)
    if (st.seat !== S.seat) listen(st.seat);
    if (S.seat) ensureCanvas(st);

    const on = worn();
    const b = ensureBtn(st.ov);
    const map = document.getElementById('plaza-map');
    const chatOpen = !!(map && map.classList.contains('off'));
    const show = on && (S.open || !chatOpen);
    b.classList.toggle('show', show);
    if (show) placeBtn(st.ov, b);
    if (!on && S.open) closeBoard();
}
setInterval(function () { try { tick(); } catch (e) { } }, PEN.POLL);

// ==========================================
// 콘솔
// ==========================================
window.penOpen = function () { tick(); return openBoard(); };
window.penClose = closeBoard;
window.penState = function () {
    const st = stage();
    const o = {
        광장: !!st, 방: st && st.seat, 달았나: worn(),
        단추: !!(S.btn && S.btn.classList.contains('show')), 그림판: S.open,
        보이는획: Object.keys(S.strokes).length,
        내획: Object.keys(S.strokes).filter(function (k) { return S.strokes[k].mine; }).length,
        캔버스: S.dim
    };
    console.log('%c===== 🖋️ 유리 펜 =====', 'color:#9fe8ff; font-size:13px');
    console.log(o);
    return o;
};
window.PEN_CFG = PEN;

})();
