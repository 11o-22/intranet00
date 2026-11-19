// ==========================================
// ★ ❄ 눈 (2026-11-19 사용자)
// bundles.json 마지막 묶음 맨 끝 — plaza.js 보다 뒤
// ==========================================
//
//   「인트라넷에 눈 효과를 좀 뿌려줘. 그리고, 쌓인 눈 누르면 손에 눈뭉치 들리게 해주고
//     사람 누르면 던져서 눈뭉치 맞은 효과도 주고.」
//
// ■ 내리는 눈 — 인트라넷 어디서나 (로그인 화면 · 광장 · 각 칸 · 창 위로)
//   화면 맨 위에 캔버스 하나 (누름은 그대로 아래로 지나간다 · pointer-events:none).
//   흰 배경에서도 보이게 눈송이 가장자리에 옅은 하늘빛 테를 두른다.
//   리듬 게임을 치는 동안 · 화면이 꺼져 있는 동안은 쉰다 (그리지 않는다).
//   알림창(확인 창)과 1기 마무리 팝업보다는 아래 — 글씨를 가리지 않게.
//
// ■ 쌓인 눈 — 광장 방마다 (길 · 건물 안 · 지하 · 포토존)
//   방마다 눈더미 셋 (지하가 있는 방은 지하에도 하나) — 자리는 방 이름으로 정해져 모두에게 같은 자리 · 서버에 적지 않는다.
//   시설 입구 · 가두리 · 나가는 자리 앞은 피한다. 눈더미는 줄지 않는다.
//   눈더미 가까이(가로 170 · 같은 층) 서서 누르면 → 손에 ❄ 눈뭉치를 든다. 멀리서 누르면 그쪽으로 걸어간다 (보물 상자와 같다).
//   든 눈뭉치는 같은 방 사람들에게도 보인다 (광장 자리 기록 sn · plaza.js).
//
// ■ 던지기
//   눈뭉치를 든 채 사람을 누르면 → 그 사람에게 던진다 (사람 고르는 칸 대신). 다 던지면 손이 빈다 — 다시 눈더미에서 뭉친다.
//   plazaSnow/<방>_<칸>/<열쇠> = { by, bn, to, at } — 같은 방 모두가 같은 장면을 본다 (던진 사람이 8초 뒤 지운다)
//     · 날아가는 눈뭉치 (포물선) → 맞은 자리에서 눈가루가 퍽 튀고, 맞은 사람 몸에 하얀 눈자국이 잠깐 남는다
//     · 맞은 사람 본인 화면 — 가장자리가 하얗게 얼었다 녹고 「❄ ○○ 사원이 던진 눈뭉치에 맞았습니다!」
//   🫣 숨바꼭질 중에는 사람이 골라지지 않아 던질 수 없다 (plaza.js personAt 이 그렇다).
//
// ■ 콘솔
//   snowState()        눈 · 눈뭉치 · 지금 방 눈더미
//   snowFall(false)    이 화면에서 내리는 눈 끄기 (true 면 켜기)

(function snowFx() {
'use strict';

function u_() { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nowS() {
    try { if (typeof window.serverNow === 'function') { const s = Number(window.serverNow()); if (s > 1.5e12) return s; } } catch (e) { }
    return Date.now();
}
function nameOf(u) { return (u && ((u.badge && u.badge.nickname) || u.name || u.code)) || ''; }

// ==========================================
// 1. 내리는 눈
// ==========================================
const Z_FALL = 9999990;                 // 광장(999995)보다 위 · 1기 마무리 팝업(99999980) · 알림창(99999999)보다 아래
let fallOn = true;
const F = { cv: null, ctx: null, fl: [], w: 0, h: 0, dpr: 1, last: 0, cleared: false };
function rhythmBusy() { try { return typeof window.rhythmQuiet === 'function' && !!window.rhythmQuiet().on; } catch (e) { return false; } }
function flake(top) {
    const r = 1.1 + Math.pow(Math.random(), 1.6) * 3.0;               // 작은 송이가 많고 큰 송이는 드물게
    return { x: Math.random() * F.w, y: top ? -10 - Math.random() * F.h * 0.2 : Math.random() * F.h,
             r: r, vy: 0.35 + r * 0.32 + Math.random() * 0.25, ph: Math.random() * 6.28, sw: 0.4 + Math.random() * 0.9,
             a: 0.55 + Math.random() * 0.4 };
}
function fallSize() {
    if (!F.cv) return;
    F.dpr = Math.min(2, window.devicePixelRatio || 1);
    F.w = window.innerWidth || 360; F.h = window.innerHeight || 640;
    F.cv.width = Math.round(F.w * F.dpr); F.cv.height = Math.round(F.h * F.dpr);
    F.cv.style.width = F.w + 'px'; F.cv.style.height = F.h + 'px';
    F.ctx.setTransform(F.dpr, 0, 0, F.dpr, 0, 0);
    const n = Math.max(55, Math.min(150, Math.round(F.w * F.h / 6500)));
    while (F.fl.length < n) F.fl.push(flake(false));
    if (F.fl.length > n) F.fl.length = n;
}
function fallInit() {
    if (F.cv || !document.body) return;
    const cv = document.createElement('canvas');
    cv.id = 'snow-fall';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed; left:0; top:0; pointer-events:none; z-index:' + Z_FALL + ';';
    document.body.appendChild(cv);
    F.cv = cv; F.ctx = cv.getContext('2d');
    fallSize();
    window.addEventListener('resize', fallSize);
    requestAnimationFrame(fallLoop);
}
function fallLoop(t) {
    requestAnimationFrame(fallLoop);
    if (!F.cv) return;
    if (!F.cv.isConnected) document.body.appendChild(F.cv);
    const rest = !fallOn || document.hidden || rhythmBusy();
    if (rest) { if (!F.cleared) { F.ctx.clearRect(0, 0, F.w, F.h); F.cleared = true; } F.last = t; return; }
    if (t - F.last < 32) return;                                         // 초당 30번쯤만 그린다 (배터리)
    const dt = Math.min(3, (t - F.last) / 16.7);
    F.last = t; F.cleared = false;
    const c = F.ctx;
    c.clearRect(0, 0, F.w, F.h);
    c.lineWidth = 0.7;
    c.strokeStyle = 'rgba(120,155,195,0.38)';
    for (let i = 0; i < F.fl.length; i++) {
        const f = F.fl[i];
        f.ph += 0.012 * dt * f.sw;
        f.y += f.vy * dt;
        f.x += Math.sin(f.ph) * 0.35 * f.sw * dt + 0.08 * dt;
        if (f.y - f.r > F.h || f.x < -20 || f.x > F.w + 20) { F.fl[i] = flake(true); continue; }
        c.globalAlpha = f.a;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(f.x, f.y, f.r, 0, 6.2832); c.fill();
        if (f.r > 1.3) c.stroke();
    }
    c.globalAlpha = 1;
}
(function waitBody() { if (document.body) fallInit(); else setTimeout(waitBody, 200); })();

// ==========================================
// 2. 쌓인 눈 — 광장 방마다 (같은 자리)
// ==========================================
const PILE_W = 124, PILE_H = 46;         // 방 그림 좌표 (사람 키 236)
const NEAR = 170;
const PER = 3;
function rooms() { try { return PLAZA.ROOMS || {}; } catch (e) { return {}; } }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function blocked(r, lv, x) {
    const sp = (r.spots || []).some(function (s) { return ((s.lv === 1 ? 1 : 0) === lv) && Math.abs((s.x || 0) - x) < 130; });
    const cg = lv === 0 && r.cage && Math.abs(r.cage.x - x) < (r.cage.w / 2 + 50);
    return sp || cg;
}
const PILES = {};
function pilesOf(key) {
    if (PILES[key]) return PILES[key];
    const r = rooms()[key];
    if (!r || !Array.isArray(r.floor)) return (PILES[key] = []);
    const R = rng(hash('snow:' + key));
    const bands = [{ lv: 0, y: r.floor, x: [90, (r.w || 1880) - 90], n: PER }];
    if (Array.isArray(r.floor2)) bands.push({ lv: 1, y: r.floor2, x: r.x2 || [555, 1325], n: 1 });
    const out = [];
    bands.forEach(function (b) {
        let made = 0;
        for (let t = 0; t < 80 && made < b.n; t++) {
            const x = Math.round(b.x[0] + R() * (b.x[1] - b.x[0]));
            const y = Math.round(b.y[0] + R() * Math.max(0, b.y[1] - b.y[0]));
            if (blocked(r, b.lv, x)) continue;
            if (out.some(function (o) { return o.lv === b.lv && Math.abs(o.x - x) < 260; })) continue;
            out.push({ x: x, y: y, lv: b.lv, i: out.length, k: Math.floor(R() * 3) });
            made++;
        }
    });
    return (PILES[key] = out);
}
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function roomNow() { try { return (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { return ''; } }
function where() { try { return (typeof window.plazaWhere === 'function') ? window.plazaWhere() : null; } catch (e) { return null; } }
// 눈더미 그림 — 세 가지 모양 (조금씩 다르게)
const MOUND = [
    'M2 30 C6 18 14 12 24 13 C30 5 44 3 52 10 C62 9 72 17 76 30 Z',
    'M2 30 C8 20 16 15 28 16 C34 9 46 8 54 13 C64 13 72 20 76 30 Z',
    'M2 30 C5 21 12 14 22 15 C28 8 38 6 46 11 C56 7 68 14 76 30 Z'
];
function moundSvg(k) {
    const id = 'sg' + k;
    return '<svg viewBox="0 0 78 30" width="100%" height="100%" preserveAspectRatio="none" style="display:block; overflow:visible;">'
        + '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.7" stop-color="#eef4fb"/><stop offset="1" stop-color="#cfdeee"/></linearGradient></defs>'
        + '<ellipse cx="39" cy="29.5" rx="38" ry="3.2" fill="rgba(0,0,0,0.18)"/>'
        + '<path d="' + MOUND[k % 3] + '" fill="url(#' + id + ')" stroke="#8fa9c4" stroke-width="1.3" stroke-linejoin="round"/>'
        + '<path d="M18 19 C24 15 30 14 34 15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>'
        + '<circle cx="50" cy="15" r="1.3" fill="#ffffff"/><circle cx="60" cy="20" r="1" fill="#dbe8f5"/>'
        + '</svg>';
}
let lastSig = '';
function paintPiles(force) {
    const st = stage();
    if (!st || !st.el) { lastSig = ''; return; }
    const z = st.z || 1;
    const have = st.el.querySelectorAll('.plaza-snowpile').length;
    const sig = st.room + '|' + z.toFixed(4) + '|' + have;
    if (!force && sig === lastSig) return;
    Array.prototype.forEach.call(st.el.querySelectorAll('.plaza-snowpile'), function (e) { e.remove(); });
    pilesOf(st.room).forEach(function (p) {
        const w = Math.max(18, Math.round(PILE_W * z)), h = Math.max(8, Math.round(PILE_H * z));
        const hw = Math.max(w + 8, 44), hh = Math.max(h + 12, 38);             // 누르는 자리는 손가락만큼
        const e = document.createElement('div');
        e.className = 'plaza-snowpile';
        e.style.cssText = 'position:absolute; cursor:pointer; touch-action:none;'
            + 'left:' + Math.round(p.x * z - hw / 2) + 'px; top:' + Math.round(p.y * z - hh) + 'px;'
            + 'width:' + hw + 'px; height:' + hh + 'px; z-index:' + (100 + Math.round(p.y) - 30) + ';';
        e.innerHTML = '<div style="position:absolute; left:' + Math.round((hw - w) / 2) + 'px; bottom:0; width:' + w + 'px; height:' + h + 'px; pointer-events:none;">' + moundSvg(p.k) + '</div>';
        e.addEventListener('pointerdown', function (ev) {
            e._near = nearPile(p);
            if (e._near) { ev.preventDefault(); ev.stopPropagation(); }       // 가까우면 뭉친다 · 멀면 누름이 광장으로 넘어가 그쪽으로 걷는다
        });
        e.addEventListener('click', function (ev) {
            if (!e._near) return;
            ev.preventDefault(); ev.stopPropagation();
            pick(e);
        });
        st.el.appendChild(e);
    });
    lastSig = sig;
}
function nearPile(p) {
    const w = where();
    if (!w) return false;
    return (Number(w.lv || 0) === Number(p.lv || 0)) && Math.abs(w.x - p.x) <= NEAR;
}

// ==========================================
// 3. 눈뭉치 — 손에 들기
// ==========================================
let held = false;
window.snowHeld = function () { return !!held && !!roomNow(); };
function pick(el) {
    if (!u_()) return;
    if (held) { toast('❄ 이미 눈뭉치를 들고 있습니다. 사람을 누르면 던집니다.'); return; }
    held = true;
    puff(el);
    paintHeld();
    toast('❄ 눈뭉치를 뭉쳤습니다! 사람을 누르면 던집니다.');
}
// 손 자리 — 몸 그림 칸(352x384) 안의 앞손 (왼쪽을 보고 있을 때 · 오른쪽을 보면 거울)
const HAND = { x: 131, y: 262 }, CELL_W = 352, CELL_H = 384, BALL = 24;
function oneOf(code) { try { return (typeof window.plazaOneOf === 'function') ? window.plazaOneOf(code) : null; } catch (e) { return null; } }
function faceOf(code) {
    const me = u_();
    try {
        if (me && code === me.code) return (typeof window.plazaMeFace === 'function') ? (window.plazaMeFace() || 1) : 1;
        const p = (typeof window.plazaPeerPos === 'function') ? window.plazaPeerPos(code) : null;
        return (p && p.face) || 1;
    } catch (e) { return 1; }
}
function heldBy(code) {
    const me = u_();
    if (me && code === me.code) return held;
    try { const p = window.plazaPeerPos(code); return !!(p && p.sn && !p.hid); } catch (e) { return false; }
}
function ballHtml() {
    return '<div style="width:100%; height:100%; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffffff 0%, #f4f8fc 45%, #c9d9ea 100%);'
        + ' box-shadow:0 0 0 1px rgba(110,140,175,.75), 0 1px 2px rgba(0,0,0,.25);"></div>';
}
function paintHeld() {
    const me = u_();
    if (!me || !roomNow()) return;
    const codes = [me.code].concat((typeof window.plazaPeerCodes === 'function') ? window.plazaPeerCodes() : []);
    codes.forEach(function (c) {
        const one = oneOf(c);
        if (!one || !one.wrap) return;
        let b = one.wrap.querySelector(':scope > .snow-held');
        if (!heldBy(c)) { if (b) b.remove(); return; }
        const k = (one.w || one.wrap.offsetWidth || CELL_W) / CELL_W;
        const f = faceOf(c);
        const s = Math.max(4, Math.round(BALL * k));
        const x = (f < 0 ? CELL_W - HAND.x : HAND.x) * k - s / 2;
        const y = HAND.y * k - s / 2;
        if (!b) {
            b = document.createElement('div');
            b.className = 'snow-held';
            b.style.cssText = 'position:absolute; pointer-events:none; z-index:5;';
            b.innerHTML = ballHtml();
            one.wrap.appendChild(b);
        }
        b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px';
        b.style.width = s + 'px'; b.style.height = s + 'px';
    });
}

// ==========================================
// 4. 던지기 — 같은 방 모두가 본다
// ==========================================
const ROOT = 'plazaSnow';
let evRef = null, evKey = '', seen = {};
function roomKey() { const w = where(); return (w && w.room) ? (w.room + '_' + (w.inst || 0)) : ''; }
function listen() {
    const k = roomKey();
    if (k === evKey) return;
    if (evRef) { try { evRef.off(); } catch (e) { } evRef = null; }
    evKey = k;
    const d = db_();
    if (!k || !d) return;
    evRef = d.ref(ROOT + '/' + k).limitToLast(10);
    evRef.on('child_added', function (s) {
        const v = s.val(), id = s.key;
        if (!v || seen[id]) return;
        seen[id] = 1;
        if (Math.abs(nowS() - (Number(v.at) || 0)) > 7000) return;           // 묵은 것
        fly(v);
    });
}
window.snowTap = function (cx, cy) {
    const me = u_();
    if (!held || !me || !roomNow()) return false;
    let c = null;
    try { c = (typeof window.plazaPersonAt === 'function') ? window.plazaPersonAt(cx, cy) : null; } catch (e) { c = null; }
    if (!c || c === me.code) return false;
    held = false;
    paintHeld();
    const id = me.code + '_' + Date.now().toString(36);
    const ev = { by: me.code, bn: nameOf(me), to: c, at: nowS() };
    seen[id] = 1;
    fly(ev);
    const d = db_(), k = roomKey();
    if (d && k) {
        const r = d.ref(ROOT + '/' + k + '/' + id);
        try { r.set(ev); } catch (e) { }
        setTimeout(function () { try { r.remove(); } catch (e) { } }, 8000);
    }
    return true;
};
// 화면 위 자리 — 손 · 가슴
function handPt(code) {
    const one = oneOf(code);
    if (!one || !one.wrap) return null;
    const b = one.wrap.getBoundingClientRect();
    if (!b.width) return null;
    const k = b.width / CELL_W, f = faceOf(code);
    return { x: b.left + (f < 0 ? CELL_W - HAND.x : HAND.x) * k, y: b.top + HAND.y * k, k: k };
}
function chestPt(code) {
    const one = oneOf(code);
    if (!one || !one.wrap) return null;
    const b = one.wrap.getBoundingClientRect();
    if (!b.width) return null;
    const k = b.width / CELL_W;
    return { x: b.left + 176 * k, y: b.top + 228 * k, k: k };
}
function host() { return document.getElementById('plaza-ov') || document.body; }
function fly(v) {
    const me = u_();
    const a = handPt(v.by), b = chestPt(v.to);
    if (!b) { if (me && v.to === me.code) hitMe(v); return; }            // 던진 사람이 안 보여도 맞은 것은 보인다
    const start = a || { x: b.x + 160, y: b.y - 60, k: b.k };
    const dist = Math.hypot(b.x - start.x, b.y - start.y);
    const dur = Math.max(320, Math.min(760, 280 + dist * 0.75));
    const arc = Math.min(130, 30 + dist * 0.28);
    const s = Math.max(8, Math.round(BALL * (start.k || 0.4) * 1.1));
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed; pointer-events:none; z-index:2147483000; width:' + s + 'px; height:' + s + 'px; left:0; top:0;';
    el.innerHTML = ballHtml();
    host().appendChild(el);
    const t0 = performance.now();
    (function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        const e2 = chestPt(v.to) || b;                                    // 맞을 사람이 움직이면 따라간다
        const x = start.x + (e2.x - start.x) * p;
        const y = start.y + (e2.y - start.y) * p - arc * 4 * p * (1 - p);
        el.style.transform = 'translate(' + Math.round(x - s / 2) + 'px,' + Math.round(y - s / 2) + 'px) rotate(' + Math.round(p * 540) + 'deg)';
        if (p < 1) { requestAnimationFrame(step); return; }
        el.remove();
        splash(e2.x, e2.y, s);
        splat(v.to);
        if (me && v.to === me.code) hitMe(v);
        else if (me && v.by === me.code) toast('❄ 명중!');
    })(t0);
}
// 퍽 — 눈가루
function splash(x, y, s) {
    const n = 12, H = host();
    for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        const r = Math.max(3, Math.round(s * (0.18 + Math.random() * 0.22)));
        d.style.cssText = 'position:fixed; pointer-events:none; z-index:2147483000; left:0; top:0; width:' + r + 'px; height:' + r + 'px; border-radius:50%;'
            + ' background:#ffffff; box-shadow:0 0 0 1px rgba(120,150,185,.55);';
        H.appendChild(d);
        const ang = (i / n) * 6.283 + Math.random() * 0.5, sp = s * (1.2 + Math.random() * 1.6);
        const t0 = performance.now(), life = 420 + Math.random() * 260;
        (function st(t) {
            const p = Math.min(1, (t - t0) / life);
            const dx = Math.cos(ang) * sp * p, dy = Math.sin(ang) * sp * p - s * 0.9 * p + s * 2.2 * p * p;
            d.style.transform = 'translate(' + Math.round(x + dx - r / 2) + 'px,' + Math.round(y + dy - r / 2) + 'px)';
            d.style.opacity = String(1 - p * p);
            if (p < 1) requestAnimationFrame(st); else d.remove();
        })(t0);
    }
}
// 맞은 사람 몸에 남는 눈자국
function splat(code) {
    const one = oneOf(code);
    if (!one || !one.wrap) return;
    const k = (one.w || one.wrap.offsetWidth || CELL_W) / CELL_W;
    const s = Math.max(10, Math.round(46 * k));
    const e = document.createElement('div');
    e.className = 'snow-splat';
    e.style.cssText = 'position:absolute; pointer-events:none; z-index:6; left:' + Math.round(176 * k - s / 2) + 'px; top:' + Math.round(226 * k - s / 2) + 'px;'
        + ' width:' + s + 'px; height:' + s + 'px; transition:opacity 1.4s ease 1.2s; opacity:1;';
    e.innerHTML = '<svg viewBox="0 0 40 40" width="100%" height="100%"><path d="M20 4 C24 9 28 6 30 11 C35 12 36 17 33 20 C37 24 33 29 29 28 C28 33 23 36 20 32 C16 36 11 33 11 28 C6 29 3 24 7 20 C4 16 6 11 11 11 C12 6 17 8 20 4 Z"'
        + ' fill="#ffffff" stroke="#9fb7cf" stroke-width="1.4" stroke-linejoin="round"/><circle cx="16" cy="16" r="2.2" fill="#e8f0f8"/></svg>';
    one.wrap.appendChild(e);
    requestAnimationFrame(function () { e.style.opacity = '0'; });
    setTimeout(function () { e.remove(); }, 2900);
}
// 내가 맞았다 — 화면 가장자리가 얼었다 녹는다
function hitMe(v) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed; inset:0; pointer-events:none; z-index:2147482999; opacity:1; transition:opacity 1.1s ease .25s;'
        + ' background:radial-gradient(ellipse at center, rgba(255,255,255,0) 52%, rgba(235,244,252,.55) 78%, rgba(255,255,255,.85) 100%);';
    host().appendChild(ov);
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.style.opacity = '0'; }); });
    setTimeout(function () { ov.remove(); }, 1600);
    toast('❄ ' + (v.bn || '누군가') + ' 사원이 던진 눈뭉치에 맞았습니다!');
}
// 뭉칠 때 눈가루
function puff(el) {
    try {
        const r = el.getBoundingClientRect();
        splash(r.left + r.width / 2, r.top + r.height * 0.6, Math.max(10, r.width * 0.25));
    } catch (e) { }
}
// 짧은 알림 — 광장 위 가운데
let toastEl = null, toastT = 0;
function toast(msg) {
    if (!toastEl || !toastEl.isConnected) {
        toastEl = document.createElement('div');
        toastEl.style.cssText = 'position:fixed; left:50%; top:calc(env(safe-area-inset-top,0px) + 96px); transform:translateX(-50%); z-index:2147483001; pointer-events:none;'
            + ' background:rgba(14,22,34,.86); color:#eef6ff; border:1px solid rgba(160,195,230,.55); border-radius:999px; padding:8px 14px; font-size:13px; font-weight:bold;'
            + ' white-space:nowrap; max-width:92vw; overflow:hidden; text-overflow:ellipsis; transition:opacity .3s; opacity:0;';
        host().appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(function () { if (toastEl) toastEl.style.opacity = '0'; }, 2200);
}

// 방이 바뀌거나 다시 그려지면 따라간다 · 든 눈뭉치는 광장을 나가면 녹는다
setInterval(function () {
    try {
        const k = roomNow();
        if (!k) { if (held) held = false; if (evRef) { try { evRef.off(); } catch (e) { } evRef = null; evKey = ''; } lastSig = ''; return; }
        paintPiles(false);
        paintHeld();
        listen();
    } catch (e) { }
}, 250);

window.snowFall = function (on) { fallOn = (on !== false); return fallOn; };
window.snowState = function () {
    const k = roomNow();
    const o = { 내리는눈: fallOn, 눈송이: F.fl.length, 들고있음: held, 방: k, 눈더미: k ? pilesOf(k) : [] };
    console.log(o);
    return o;
};
console.log('[❄ 눈] 광장 눈더미를 누르면 눈뭉치 · 사람을 누르면 던진다 · snowState()');
})();
