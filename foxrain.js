// ==========================================
// ★ 🌧 여우비 — 코드로 만든 비 (그림 · 소리 파일 없음)   (2026-11-13 사용자)
// bundles.json 마지막 묶음 — plaza.js 뒤 · hogaptu.js 앞
// ==========================================
//
//   「이 장비를 장착한 사람이 맵에 입장하면 빗소리가 나면서 바닥에 살짝씩 물이 고이는 효과와
//     비가 쏴아아 내리다가 점점 투둑. 툭 내리는 효과를 주자.」
//
// ■ 언제
//   『 🦊 호갑투 - 禁制 』(hogaptu.js)를 찬 사원이 광장 맵에 들어오면 — 그 방에 있는 모두의 화면에.
//   찬 사람이 광장 자리 기록에 「들어온 때」(fr)를 실어 보내고(plazaExtra), 보는 쪽은 그때부터 흐른 시간으로
//   비의 굵기를 정한다 — 늦게 본 사람은 남은 만큼만 본다 · 누가 봐도 같은 때에 그친다.
//   이미 한참 서 있던 사람이 있는 방에 내가 들어갈 때는 내리지 않는다 (들어온 것은 그 사람이 아니다).
//
// ■ 차례 (R)
//   0 ~ HEAVY          쏴아아 — 굵은 비
//   ~ HEAVY + EASE     잦아든다
//   ~ TOTAL            투둑 · 툭 — 성긴 굵은 방울 몇 개
//   그 뒤 DRY          웅덩이가 마른다
//
// ■ 무엇을 그리나
//   빗줄기 · 바닥에 닿는 물 튀김 — 화면에 덮은 캔버스 한 장 (1초에 서른 번 · 기기 배율은 1 로)
//   웅덩이 — 방 그림 위(사람 발밑 · 길 띠)에 놓는다. 방을 따라 움직인다. 자리는 「들어온 때」로 정해 누구 화면에서나 같다.
//   흐린 빛 — 비가 굵을수록 화면이 살짝 어둡고 푸르다.
//
// ■ 소리 (Web Audio — 잡음을 걸러 만든다)
//   깔리는 비   잡음 → 고역 · 중역 두 갈래 → 굵기를 따라 커지고 작아진다
//   방울        「투둑」 짧은 잡음 두 번 · 「툭」 낮은 음 하나 — 비가 잦아들수록 또렷하다
//   광장에서 화면을 한 번이라도 누른 뒤에만 난다 (브라우저 규칙) · 탐사 중에는 광장 비 소리를 내지 않는다
//   🔇 foxRainMute(true) — 이 기기에서 소리만 끈다 (그림은 그대로)
//
// ■ 어둠의 여우비 (hogaptu.js 제 零 금제)
//   FOXRAIN.steady(true) — 탐사 화면에 가늘게 계속 내린다 · 소리는 어둠 음소거(🔇)를 따른다
//
// ■ 콘솔
//   foxRainTest()      지금 방에 한 번 내려 본다 (내 화면만)
//   foxRainState()

(function foxRain() {
'use strict';

const R = { HEAVY: 9000, EASE: 12000, TOTAL: 30000, DRY: 24000, FPS: 30, MAX: 260, VOL: 0.5 };
const MUTE_KEY = 'foxRainMute';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function clock() { try { if (typeof serverNow === 'function') { const t = Number(serverNow()); if (t > 1.5e12) return t; } } catch (e) { } return Date.now(); }
function inRun() { try { return (typeof darkRun !== 'undefined' && !!darkRun) || (typeof window.kroomOn === 'function' && window.kroomOn()); } catch (e) { return false; } }
function muted() { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; } }

// 굵기 0~1 · 방울(투둑 · 툭) 차례인가
function levelAt(t) {
    if (t < 0 || t >= R.TOTAL) return 0;
    if (t < 600) return t / 600;                                           // 첫 반 초 — 확 쏟아지기 전에 숨 한 번
    if (t < R.HEAVY) return 1;
    if (t < R.HEAVY + R.EASE) { const k = (t - R.HEAVY) / R.EASE; return 1 - 0.9 * (k * k * (3 - 2 * k)); }
    const k = (t - R.HEAVY - R.EASE) / (R.TOTAL - R.HEAVY - R.EASE);
    return 0.1 * (1 - k);
}
function dripAt(t) { return t >= R.HEAVY + R.EASE * 0.55 && t < R.TOTAL; }

// 씨앗 난수 — 웅덩이 자리가 누구 화면에서나 같게
function rngOf(seed) {
    let a = (Math.floor(Number(seed) || 1) ^ 0x9e3779b9) >>> 0;
    return function () { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ==========================================
// 그림 — 캔버스 한 장
// ==========================================
function css() {
    if (document.getElementById('fxr-css')) return;
    const s = document.createElement('style');
    s.id = 'fxr-css';
    s.textContent = [
        '.fxr-wrap{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:29;}',
        '.fxr-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,30,52,.55),rgba(10,18,34,.42));opacity:0;transition:opacity .9s linear;}',
        '.fxr-cv{position:absolute;left:0;top:0;width:100%;height:100%;}',
        '.fxr-pud{position:absolute;pointer-events:none;border-radius:50%;z-index:2;opacity:0;transition:opacity 2.4s ease;',
        '  background:radial-gradient(ellipse at 50% 45%,rgba(205,230,255,.5) 0%,rgba(130,175,230,.38) 45%,rgba(70,110,170,.18) 72%,rgba(70,110,170,0) 100%);',
        '  box-shadow:inset 0 1px 1px rgba(255,255,255,.4);}',
        '.fxr-pud i{position:absolute;left:50%;top:50%;width:26%;height:26%;margin:-13% 0 0 -13%;border-radius:50%;border:1px solid rgba(225,240,255,.75);opacity:0;}',
        '.fxr-pud i.go{animation:fxrRing .9s ease-out 1;}',
        '@keyframes fxrRing{0%{transform:scale(.3);opacity:.9}100%{transform:scale(3.4);opacity:0}}'
    ].join('\n');
    document.head.appendChild(s);
}

function Scene(host, opt) {
    css();
    this.host = host; this.opt = opt || {};
    this.wrap = document.createElement('div'); this.wrap.className = 'fxr-wrap';
    if (this.opt.z != null) this.wrap.style.zIndex = String(this.opt.z);
    if (this.opt.fixed) this.wrap.style.position = 'fixed';              // 스크롤되는 화면(탐사) — 글을 따라 밀려 올라가지 않게
    this.dim = document.createElement('div'); this.dim.className = 'fxr-dim';
    this.cv = document.createElement('canvas'); this.cv.className = 'fxr-cv';
    this.wrap.appendChild(this.dim); this.wrap.appendChild(this.cv);
    host.appendChild(this.wrap);
    this.g = this.cv.getContext('2d');
    this.drops = []; this.splash = [];
    this.last = 0; this.lv = 0; this.raf = 0; this.dead = false;
    this.size();
}
Scene.prototype.size = function () {
    const w = Math.max(1, this.wrap.clientWidth), h = Math.max(1, this.wrap.clientHeight);
    if (this.w === w && this.h === h) return;
    this.w = w; this.h = h; this.cv.width = w; this.cv.height = h;
};
Scene.prototype.frame = function (lv, drip, dt) {
    const g = this.g, w = this.w, h = this.h;
    this.lv = lv;
    const dimTo = String(Math.round(Math.min(1, lv * (this.opt.dim != null ? this.opt.dim : 0.5)) * 100) / 100);
    if (this.dim.style.opacity !== dimTo) this.dim.style.opacity = dimTo;
    g.clearRect(0, 0, w, h);
    // 빗줄기 수 — 화면 넓이와 굵기를 따라
    const want = Math.min(R.MAX, Math.round((w * h) / 1350 * lv * (this.opt.dense || 1)));
    while (this.drops.length < want) this.drops.push(this.newDrop(true));
    const slant = 0.2;                                                      // 오른쪽 위 → 왼쪽 아래로 비스듬히
    g.lineCap = 'round';
    for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        d.y += d.v * dt; d.x -= d.v * slant * dt;
        if (d.y >= d.end) {
            if (d.big || Math.random() < 0.4) this.splash.push({ x: d.x, y: d.end, t: 0, r: d.big ? 11 : 6 });
            if (i >= want) { this.drops.splice(i, 1); continue; }           // 잦아드는 중 — 다시 내리지 않는다
            this.drops[i] = this.newDrop(false);
            continue;
        }
        g.strokeStyle = 'rgba(222,236,255,' + d.a + ')';
        g.lineWidth = d.wd;
        g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + d.len * slant, d.y - d.len); g.stroke();
    }
    // 투둑 · 툭 — 굵은 방울이 드문드문
    if (drip && Math.random() < dt * 2.2) { const b = this.newDrop(false); b.big = 1; b.wd = 2.6; b.len = 18; b.a = 0.85; b.v *= 0.75; this.drops.push(b); }
    // 물 튀김
    for (let i = this.splash.length - 1; i >= 0; i--) {
        const s = this.splash[i];
        s.t += dt * 3.4;
        if (s.t >= 1) { this.splash.splice(i, 1); continue; }
        g.strokeStyle = 'rgba(230,242,255,' + (0.7 * (1 - s.t)) + ')';
        g.lineWidth = 1.2;
        g.beginPath(); g.ellipse(s.x, s.y, s.r * (0.3 + s.t), s.r * (0.3 + s.t) * 0.36, 0, 0, Math.PI * 2); g.stroke();
    }
};
Scene.prototype.newDrop = function (anywhere) {
    const w = this.w, h = this.h;
    const end = h * (0.42 + Math.random() * 0.58);                          // 닿는 자리 — 화면 아래 절반 남짓
    return { x: Math.random() * (w + h * 0.25), y: anywhere ? Math.random() * end : -20 - Math.random() * 60, end: end,
             v: 900 + Math.random() * 520, len: 14 + Math.random() * 22, a: 0.3 + Math.random() * 0.36, wd: Math.random() < 0.22 ? 1.8 : 1.1 };
};
Scene.prototype.kill = function () {
    this.dead = true;
    try { this.wrap.remove(); } catch (e) { }
};

// ==========================================
// 웅덩이 — 방 그림 위 (길 띠)
// ==========================================
const PUD = { list: [], key: '', at: 0, ringAt: 0 };
function pudClear() { PUD.list.forEach(function (e) { try { e.remove(); } catch (x) { } }); PUD.list = []; PUD.key = ''; }
function pudBuild(st, seed) {
    pudClear();
    let fl = null;
    try { fl = (typeof window.plazaFloor === 'function') ? window.plazaFloor() : null; } catch (e) { fl = null; }
    if (!fl || !fl.band || !st || !st.el) return;
    const z = st.z || 1, rnd = rngOf(seed);
    const n = Math.max(4, Math.min(40, Math.round(fl.w / 210)));
    const y0 = fl.band[0], y1 = fl.band[1];
    for (let i = 0; i < n; i++) {
        const x = (i + 0.15 + rnd() * 0.7) * (fl.w / n);
        const y = y0 - 6 + rnd() * (y1 - y0 + 26);
        const pw = (84 + rnd() * 104) * z, ph = pw * (0.21 + rnd() * 0.08);
        const e = document.createElement('div');
        e.className = 'fxr-pud';
        e.style.cssText = 'left:' + Math.round(x * z - pw / 2) + 'px;top:' + Math.round(y * z - ph / 2) + 'px;width:' + Math.round(pw) + 'px;height:' + Math.round(ph) + 'px;';
        e.innerHTML = '<i></i>';
        st.el.appendChild(e);
        PUD.list.push(e);
    }
    PUD.key = (st.seat || st.room) + ':' + seed;
}
function pudLevel(t) {
    if (t < 0) return 0;
    if (t < R.TOTAL) return Math.min(1, t / 7000);                           // 비가 오는 동안 차오른다
    return Math.max(0, 1 - (t - R.TOTAL) / R.DRY);                           // 그친 뒤 마른다
}
function pudPaint(st, seed, t, raining) {
    const key = (st.seat || st.room) + ':' + seed;
    if (PUD.key !== key || (PUD.list[0] && PUD.list[0].parentNode !== st.el)) pudBuild(st, seed);
    const op = String(Math.round(pudLevel(t) * 100) / 100);
    PUD.list.forEach(function (e) { if (e.style.opacity !== op) e.style.opacity = op; });
    // 빗방울이 떨어진 자리 — 동그란 물결
    const nowT = performance.now();
    if (raining > 0 && PUD.list.length && nowT - PUD.ringAt > 260 - 170 * raining) {
        PUD.ringAt = nowT;
        const i = PUD.list[Math.floor(Math.random() * PUD.list.length)].firstChild;
        if (i) { i.classList.remove('go'); void i.offsetWidth; i.classList.add('go'); i.style.left = (25 + Math.random() * 50) + '%'; }
    }
}

// ==========================================
// 소리 — 잡음을 걸러 만든 비
// ==========================================
const A = { ctx: null, bed: null, hiss: null, body: null, master: null, buf: null, on: false, nextDrip: 0 };
function ac() {
    if (A.ctx) return A.ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { A.ctx = new C(); } catch (e) { return null; }
    return A.ctx;
}
function noiseBuf(c) {
    if (A.buf) return A.buf;
    const n = Math.floor(c.sampleRate * 2.5), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + 0.045 * w) / 1.045; d[i] = w * 0.55 + last * 6.5; }   // 흰 잡음 + 낮은 잡음을 조금 섞는다
    A.buf = b;
    return b;
}
function audioStart() {
    if (A.on) return true;
    const c = A.ctx;
    if (!c || c.state !== 'running') return false;
    try {
        const src = c.createBufferSource(); src.buffer = noiseBuf(c); src.loop = true;
        const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2600;
        const hiss = c.createGain(); hiss.gain.value = 0;
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.55;
        const body = c.createGain(); body.gain.value = 0;
        const master = c.createGain(); master.gain.value = R.VOL;
        src.connect(hp); hp.connect(hiss); hiss.connect(master);
        src.connect(bp); bp.connect(body); body.connect(master);
        master.connect(c.destination);
        src.start();
        A.bed = src; A.hiss = hiss; A.body = body; A.master = master; A.on = true;
        return true;
    } catch (e) { return false; }
}
function audioStop() {
    if (!A.on) return;
    const c = A.ctx, m = A.master, s = A.bed;
    A.on = false; A.bed = null; A.hiss = null; A.body = null; A.master = null;
    try { m.gain.cancelScheduledValues(c.currentTime); m.gain.setTargetAtTime(0, c.currentTime, 0.25); } catch (e) { }
    setTimeout(function () { try { s.stop(); } catch (e) { } try { m.disconnect(); } catch (e) { } }, 1400);
}
function audioLevel(lv, vol) {
    if (!A.on) return;
    const c = A.ctx, t = c.currentTime;
    try {
        A.hiss.gain.setTargetAtTime(0.5 * lv * lv, t, 0.35);                 // 쏴아아 — 굵을 때만 크게
        A.body.gain.setTargetAtTime(0.42 * lv, t, 0.35);
        A.master.gain.setTargetAtTime(R.VOL * (vol == null ? 1 : vol), t, 0.3);
    } catch (e) { }
}
// 툭 — 낮은 음 하나 · 투둑 — 짧은 잡음 둘
function drip(kind, vol) {
    const c = A.ctx;
    if (!c || c.state !== 'running' || !A.master) return;
    const t = c.currentTime + 0.01, v = (vol == null ? 1 : vol);
    try {
        const hit = function (at, f, g, len) {
            const o = c.createOscillator(), og = c.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * 0.5, at + len);
            og.gain.setValueAtTime(0.0001, at); og.gain.exponentialRampToValueAtTime(g * v, at + 0.006); og.gain.exponentialRampToValueAtTime(0.0001, at + len);
            o.connect(og); og.connect(A.master); o.start(at); o.stop(at + len + 0.02);
            const n = c.createBufferSource(), ng = c.createGain(), nf = c.createBiquadFilter();
            n.buffer = noiseBuf(c); nf.type = 'bandpass'; nf.frequency.value = f * 9; nf.Q.value = 1.2;
            ng.gain.setValueAtTime(g * 0.55 * v, at); ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.035);
            n.connect(nf); nf.connect(ng); ng.connect(A.master); n.start(at, Math.random() * 2, 0.05);
        };
        if (kind === 'tuduk') { hit(t, 250 + Math.random() * 90, 0.34, 0.07); hit(t + 0.085 + Math.random() * 0.04, 190 + Math.random() * 60, 0.26, 0.08); }
        else hit(t, 150 + Math.random() * 50, 0.42, 0.12);
    } catch (e) { }
}
// 화면을 누를 때 소리 장치를 연다 (그 전에는 소리 없이 그림만)
['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) {
    window.addEventListener(ev, function () {
        if (!NOW.plaza && !NOW.steady && !stage() && !A.ctx) return;       // 광장에 있거나 비가 올 때 열어 둔다 (누가 들어서면 바로 나게 — lp.js 도 광장에서 이렇게 연다)
        const c = ac();
        if (c && c.state !== 'running' && c.state !== 'closed') { try { const p = c.resume(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }
    }, { capture: true, passive: true });
});
document.addEventListener('visibilitychange', function () { if (document.hidden) audioStop(); });

// ==========================================
// 광장 — 찬 사람이 들어온 때를 실어 보내고 · 본다
// ==========================================
const ME = { key: '', fr: 0, wore: false };
const NOW = { plaza: null, steady: null, t0: 0, test: 0 };       // plaza — 광장 장면 · steady — 어둠 장면
function wearsMe() { try { return !!(window.HG && typeof window.HG.wears === 'function' && window.HG.wears(u_())); } catch (e) { return false; } }

// 내 자리 기록에 덧붙인다 (doll-walk.js 의 plazaExtra 를 감싼다 — 그쪽이 늦게 붙어도 다시 감싼다)
setInterval(function () {
    const f = window.plazaExtra;
    if (typeof f === 'function' && f._fxr) return;
    const w = function () {
        let o = null;
        try { o = (typeof f === 'function') ? f.apply(this, arguments) : null; } catch (e) { o = null; }
        if (ME.fr && wearsMe()) { o = Object.assign({}, o || {}); o.fr = ME.fr; }
        return o;
    };
    w._fxr = true;
    window.plazaExtra = w;
}, 800);

function rainSeed() {
    let best = 0;
    if (NOW.test) best = NOW.test;
    if (ME.fr && wearsMe()) best = Math.max(best, ME.fr);
    try {
        (typeof window.plazaPeerCodes === 'function' ? window.plazaPeerCodes() : []).forEach(function (c) {
            const q = window.plazaPeerPos(c);
            if (q && q.fr) best = Math.max(best, Number(q.fr) || 0);
        });
    } catch (e) { }
    return best;
}

// 무엇이 내리는지는 1초에 네 번만 본다 (ST) — 그리는 고리(loop)는 비가 올 때만 돈다
const ST = { st: null, seed: 0, on: false };
function tick() {
    const st = stage();
    ST.st = (st && st.view) ? st : null;
    if (ST.st) {
        const key = st.seat || st.room;
        const wear = wearsMe();
        if (key !== ME.key || (wear && !ME.wore)) { ME.key = key; ME.fr = wear ? clock() : 0; }    // 방에 들어왔다 · 방 안에서 찼다
        if (!wear) ME.fr = 0;
        ME.wore = wear;
        ST.seed = rainSeed();
        const t = ST.seed ? clock() - ST.seed : -1;
        if (ST.seed && t >= 0 && t < R.TOTAL + R.DRY) pudPaint(st, ST.seed, t, levelAt(t)); else if (PUD.list.length) pudClear();
    } else { ME.key = ''; ME.fr = 0; ME.wore = false; ST.seed = 0; if (PUD.list.length) pudClear(); }
    const raining = (ST.seed && levelAt(clock() - ST.seed) > 0) || !!NOW.plaza || !!NOW.steady;
    if (raining && !ST.on) { ST.on = true; lastFrame = 0; requestAnimationFrame(loop); }
    if (!raining && A.on) audioStop();
}
setInterval(function () { try { tick(); } catch (e) { } }, 250);

let lastFrame = 0;
function loop(ts) {
    if (!ST.on) return;
    if (!((ST.seed && levelAt(clock() - ST.seed) > 0) || NOW.plaza || NOW.steady)) { ST.on = false; if (A.on) audioStop(); return; }
    requestAnimationFrame(loop);
    if (ts - lastFrame < 1000 / R.FPS - 2) return;
    const dt = Math.min(0.08, (ts - (lastFrame || ts)) / 1000);
    lastFrame = ts;
    if (document.hidden) return;
    // ── 광장
    const st = ST.st;
    let lv = 0, drp = false;
    if (st && ST.seed) { const t = clock() - ST.seed; lv = levelAt(t); drp = dripAt(t); }
    if (lv > 0 && st) {
        if (!NOW.plaza || NOW.plaza.host !== st.view || NOW.plaza.dead) { if (NOW.plaza) NOW.plaza.kill(); NOW.plaza = new Scene(st.view, { z: 29 }); }
        NOW.plaza.size();
        NOW.plaza.frame(lv, drp, dt);
    } else if (NOW.plaza) {
        if (st && NOW.plaza.host === st.view && (NOW.plaza.drops.length || NOW.plaza.splash.length)) NOW.plaza.frame(0, false, dt);      // 남은 빗줄기는 끝까지 떨어진다
        else { NOW.plaza.kill(); NOW.plaza = null; }
    }
    // ── 어둠 (가늘게 계속)
    let lvS = 0;
    if (NOW.steady) {
        const host = NOW.steady.host;
        if (!host || !host.isConnected || !host.getClientRects().length) { NOW.steady.kill(); NOW.steady = null; }      // 닫힌 화면 (fixed 라 offsetParent 로는 못 본다)
        else { lvS = 0.34; NOW.steady.size(); NOW.steady.frame(lvS, Math.random() < 0.3, dt); }
    }
    // ── 소리 — 광장 비는 탐사 중이 아닐 때 · 어둠 비는 어둠 음소거를 따른다
    const plazaSnd = (lv > 0 && !inRun()) ? lv : 0;
    let darkMute = false;
    try { darkMute = (typeof darkAudio !== 'undefined' && darkAudio && !!darkAudio.muted); } catch (e) { }
    const steadySnd = (lvS > 0 && !darkMute) ? lvS * 0.8 : 0;
    const snd = muted() ? 0 : Math.max(plazaSnd, steadySnd);
    if (snd > 0) {
        if (!A.on) { ac(); audioStart(); }
        audioLevel(snd, 1);
        if (A.on && ts > A.nextDrip) {
            const sparse = plazaSnd > 0 ? drp : true;
            if (sparse) {
                drip(Math.random() < 0.55 ? 'tuduk' : 'tuk', plazaSnd > 0 ? 1 : 0.6);
                A.nextDrip = ts + (plazaSnd > 0 ? 500 + Math.random() * 1500 : 1600 + Math.random() * 3200);
            } else A.nextDrip = ts + 400;
        }
    } else if (A.on) audioStop();
}

// ==========================================
// 밖에서 쓰는 것
// ==========================================
window.FOXRAIN = {
    R: R,
    // 어둠 화면에 가늘게 계속 — host 는 탐사 화면 (없으면 끈다)
    steady: function (on, host) {
        if (!on || !host) { if (NOW.steady) { NOW.steady.kill(); NOW.steady = null; } return false; }
        if (NOW.steady && NOW.steady.host === host && !NOW.steady.dead && NOW.steady.wrap.isConnected) return true;
        if (NOW.steady) NOW.steady.kill();
        NOW.steady = new Scene(host, { z: 3, dim: 0.35, dense: 0.8, fixed: true });
        try { tick(); } catch (e) { }
        return true;
    },
    steadyOn: function () { return !!NOW.steady; },
    level: function () { const s = rainSeed(); return s ? levelAt(clock() - s) : 0; },
    seed: rainSeed,
    levelAt: levelAt,
    mine: function () { return ME.fr; }
};
window.foxRainMute = function (on) { try { if (on) localStorage.setItem(MUTE_KEY, '1'); else localStorage.removeItem(MUTE_KEY); } catch (e) { } return muted(); };
window.foxRainTest = function () { NOW.test = clock(); setTimeout(function () { NOW.test = 0; }, R.TOTAL + R.DRY + 500); try { tick(); } catch (e) { } return '🌧 ' + Math.round(R.TOTAL / 1000) + '초 동안 내립니다 (내 화면만)'; };
window.foxRainState = function () {
    const s = rainSeed(), t = s ? clock() - s : -1;
    const out = { 방: ME.key, 내가찼나: wearsMe(), 내들어온때: ME.fr, 씨앗: s, 흐른초: t >= 0 ? Math.round(t / 100) / 10 : null, 굵기: Math.round(levelAt(t) * 100) / 100,
                  빗줄기: NOW.plaza ? NOW.plaza.drops.length : 0, 웅덩이: PUD.list.length, 소리: A.on, 소리장치: A.ctx ? A.ctx.state : '없음', 음소거: muted(), 어둠비: !!NOW.steady };
    console.log(out);
    return out;
};
console.log('[🌧 여우비] foxRainTest() · foxRainState() · foxRainMute(true)');
})();
