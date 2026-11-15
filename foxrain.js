// ==========================================
// ★ 🌧 여우비 — 코드로 그린 비 (그림 파일 없음 · 소리는 받은 녹음 snd/fox-rain.mp3)   (2026-11-13 사용자)
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
// ■ 소리 — 받은 빗소리 (snd/fox-rain.mp3)
//   ★ 2026-11-13 사용자 「빗소리 사운드 이걸로 바꿔줘」 — 처음엔 잡음을 걸러 코드로 만들었고(쏴아아 + 투둑 · 툭), 이제 사용자가 준 녹음을 튼다.
//     받은 것은 14 분짜리 — 가장 고른 자리에서 20 초를 떼어 이음매 없이 돌게 다듬었다 (앞뒤 2 초를 겹쳐 녹임 · -18 LUFS · 160 kbps).
//     mp3 는 풀면 앞뒤에 빈 틈이 붙어 파일 처음 ↔ 끝으로는 매끈하게 못 돈다 — 그래서 파일은 「끝 0.4 초 + 고리 20 초 + 처음 0.4 초」 이고
//     그 안쪽 20 초(0.2 ~ 20.2 초)만 돌린다. 돌 때마다 다른 자리에서 시작한다.
//   굵기를 따라 소리 크기만 바꾼다 — 쏴아아(크게) → 잦아든다 → 그친다. 코드로 만들던 「투둑 · 툭」 소리는 뺐다 (그림의 성긴 방울은 그대로).
//   곡은 광장에서 화면을 처음 누를 때 미리 받아 두고(소리 장치를 여는 그때), 비가 처음 올 때 푼다.
//   광장에서 화면을 한 번이라도 누른 뒤에만 난다 (브라우저 규칙) · 탐사 중에는 광장 비 소리를 내지 않는다
//   ★ 광장 위 🔊 를 꺼 두면 광장 비 소리도 나지 않는다 (2026-11-13 사용자 「빗소리 소리 끄면 안 들리게 하자」)
//     광장 음악 · 퀴즈쇼 효과음과 같은 단추(event-bgm.js eventBgmMuted) — 비가 내리는 가운데 끄면 바로 잦아들고, 다시 켜면 남은 비만큼 난다. 그림은 그대로
//   🔇 foxRainMute(true) — 이 기기에서 소리만 끈다 (그림은 그대로 · 콘솔)
//
// ■ 어둠에 들어간 사람에게는 안 보인다 (2026-11-15 사용자 「호갑투 비 오는 거 어둠에 들어간 사람들한테는 그 효과가 안 보이게 해줘」)
//   · 탐사 중인 화면(어둠 · K 의 방 · EPIC …)에서는 광장 비를 그리지도 소리 내지도 않는다 — 나오면 남은 만큼 본다
//   · 어둠의 여우비(hogaptu.js 제 零 금제)를 탐사 화면에 가늘게 내리던 것(FOXRAIN.steady)도 이제 부르지 않는다 —
//     여우비의 효력과 알림 글은 그대로, 그림 · 소리만 없다. steady 는 남겨 두었다 (부르는 곳이 없다).
//
// ■ ❄ 눈 (2026-11-15 사용자 「현재 날씨에 따라서 0도 밑으로 내려가면 비 대신 눈이 오는 효과도 가능한가?」 「무료 그거로 하자.」)
//   지금 기온이 0도 밑이면 비 대신 눈이 온다 — 눈송이가 살랑살랑 내리고, 웅덩이 대신 눈이 쌓였다 녹는다. 소리는 없다 (눈은 조용하다).
//   기온   서울의 지금 기온 (WX.PLACE) — api/weather.js 가 Open-Meteo(무료 공개 날씨 자료 · 열쇠 없음 · CC BY 4.0)에서 받아 10분 묵혀 돌려준다.
//          받는 것은 🦊 호갑투를 찬 사람의 화면뿐이다 (15분마다 · 30분까지 묵혀 쓴다 · 못 받았거나 묵었으면 비).
//   누가   비냐 눈이냐는 **찬 사람이 들어오는 순간** 정해 자리 기록에 싣는다 (fs: 1) — 보는 사람은 그대로 따른다.
//          그래서 같은 방에서는 누구 화면에서나 같은 것이 내린다 (새로고침 안 한 예전 화면은 비로 본다).
//   출처 표기는 광장 목록 맨 아래에 한 줄 (plaza.js menuSheet) — Open-Meteo 자료를 쓰는 조건이다.
//
// ■ 콘솔
//   foxRainTest()      지금 방에 한 번 내려 본다 (내 화면만) · foxRainTest(true) 는 눈
//   foxRainState()
//   foxWeather()       지금 알고 있는 기온 · foxWeatherTest(-3) 이 기기에서만 기온을 정해 본다 (null 로 되돌린다)

(function foxRain() {
'use strict';

const R = { HEAVY: 9000, EASE: 12000, TOTAL: 30000, DRY: 24000, FPS: 30, MAX: 260, VOL: 0.5 };
const MUTE_KEY = 'foxRainMute';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function clock() { try { if (typeof serverNow === 'function') { const t = Number(serverNow()); if (t > 1.5e12) return t; } } catch (e) { } return Date.now(); }
function inRun() { try { return (typeof darkRun !== 'undefined' && !!darkRun) || (typeof window.kroomOn === 'function' && window.kroomOn()); } catch (e) { return false; } }
function muted() { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; } }
// 광장 위 🔊 를 꺼 두었나 — 광장 음악 · 퀴즈쇼 효과음과 같은 단추
function plazaOff() { try { return typeof window.eventBgmMuted === 'function' && !!window.eventBgmMuted(); } catch (e) { return false; } }

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
        // ❄ 눈 — 흐린 빛은 옅고 희게 · 웅덩이 자리에는 눈이 쌓인다 (물결 없음)
        '.fxr-wrap.snow .fxr-dim{background:linear-gradient(180deg,rgba(196,210,234,.36),rgba(150,170,206,.24));}',
        '.fxr-pud.snow{background:radial-gradient(ellipse at 50% 42%,rgba(255,255,255,.95) 0%,rgba(238,245,255,.85) 48%,rgba(214,228,248,.42) 76%,rgba(214,228,248,0) 100%);',
        '  box-shadow:inset 0 -1px 2px rgba(150,175,215,.35);}',
        '.fxr-pud.snow i{display:none;}',
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
Scene.prototype.frame = function (lv, drip, dt, snow) {
    snow = !!snow;
    if (this.snow !== snow) {                                               // 비 ↔ 눈이 바뀌었다 — 떨어지던 것은 걷고 새로
        this.snow = snow; this.drops = []; this.splash = [];
        this.wrap.classList.toggle('snow', snow);
    }
    if (snow) { this.frameSnow(lv, drip, dt); return; }
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
// ❄ 눈 — 작은 송이가 천천히 · 살랑살랑 (왼쪽으로 조금 밀린다) · 땅에 닿기 직전에 옅어진다
Scene.prototype.frameSnow = function (lv, drip, dt) {
    const g = this.g, w = this.w, h = this.h;
    this.lv = lv;
    const dimTo = String(Math.round(Math.min(1, lv * (this.opt.dim != null ? this.opt.dim : 0.5)) * 100) / 100);
    if (this.dim.style.opacity !== dimTo) this.dim.style.opacity = dimTo;
    g.clearRect(0, 0, w, h);
    const want = Math.min(R.MAX, Math.round((w * h) / 1700 * lv * (this.opt.dense || 1)));
    while (this.drops.length < want) this.drops.push(this.newFlake(true));
    for (let i = this.drops.length - 1; i >= 0; i--) {
        const d = this.drops[i];
        d.y += d.v * dt; d.ph += d.sw * dt;
        if (d.y >= d.end) {
            if (i >= want) { this.drops.splice(i, 1); continue; }           // 잦아드는 중 — 다시 내리지 않는다
            this.drops[i] = this.newFlake(false);
            continue;
        }
        const x = d.x + Math.sin(d.ph) * d.amp - d.y * 0.12;
        const fade = Math.max(0, Math.min(1, (d.end - d.y) / 28));
        g.fillStyle = 'rgba(255,255,255,' + (Math.round(d.a * fade * 100) / 100) + ')';
        g.beginPath(); g.arc(x, d.y, d.r, 0, 6.2832); g.fill();
    }
    // 끝물 — 큰 송이가 드문드문
    if (drip && Math.random() < dt * 1.6) { const b = this.newFlake(false); b.r = 3.2 + Math.random() * 1.4; b.v *= 0.8; b.a = 0.95; this.drops.push(b); }
};
Scene.prototype.newFlake = function (anywhere) {
    const w = this.w, h = this.h;
    const end = h * (0.42 + Math.random() * 0.58);                          // 닿는 자리 — 비와 같다
    const r = Math.random() < 0.18 ? 2.3 + Math.random() * 1.2 : 1 + Math.random() * 1.3;
    return { x: Math.random() * (w + h * 0.14), y: anywhere ? Math.random() * end : -8 - Math.random() * 40, end: end,
             v: 52 + Math.random() * 70 + r * 14, r: r, a: 0.55 + Math.random() * 0.4,
             ph: Math.random() * 6.2832, sw: 0.8 + Math.random() * 1.4, amp: 6 + Math.random() * 14 };
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
function pudBuild(st, seed, snow) {
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
        e.className = 'fxr-pud' + (snow ? ' snow' : '');
        e.style.cssText = 'left:' + Math.round(x * z - pw / 2) + 'px;top:' + Math.round(y * z - ph / 2) + 'px;width:' + Math.round(pw) + 'px;height:' + Math.round(ph) + 'px;';
        e.innerHTML = '<i></i>';
        st.el.appendChild(e);
        PUD.list.push(e);
    }
    PUD.key = (st.seat || st.room) + ':' + seed + (snow ? ':s' : '');
}
function pudLevel(t) {
    if (t < 0) return 0;
    if (t < R.TOTAL) return Math.min(1, t / 7000);                           // 비가 오는 동안 차오른다
    return Math.max(0, 1 - (t - R.TOTAL) / R.DRY);                           // 그친 뒤 마른다
}
function pudPaint(st, seed, t, raining, snow) {
    const key = (st.seat || st.room) + ':' + seed + (snow ? ':s' : '');
    if (PUD.key !== key || (PUD.list[0] && PUD.list[0].parentNode !== st.el)) pudBuild(st, seed, snow);
    const op = String(Math.round(pudLevel(t) * 100) / 100);
    PUD.list.forEach(function (e) { if (e.style.opacity !== op) e.style.opacity = op; });
    // 빗방울이 떨어진 자리 — 동그란 물결
    const nowT = performance.now();
    if (!snow && raining > 0 && PUD.list.length && nowT - PUD.ringAt > 260 - 170 * raining) {
        PUD.ringAt = nowT;
        const i = PUD.list[Math.floor(Math.random() * PUD.list.length)].firstChild;
        if (i) { i.classList.remove('go'); void i.offsetWidth; i.classList.add('go'); i.style.left = (25 + Math.random() * 50) + '%'; }
    }
}

// ==========================================
// 소리 — 잡음을 걸러 만든 비
// ==========================================
const A = { ctx: null, bed: null, master: null, buf: null, bytes: null, wait: null, fail: 0, on: false };
const SND = { src: 'snd/fox-rain.mp3', L0: 0.2, L1: 20.2 };       // 돌리는 자리 (초) — 머리말
function ac() {
    if (A.ctx) return A.ctx;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { A.ctx = new C(); } catch (e) { return null; }
    return A.ctx;
}
// 빗소리 받기 — 바이트만 먼저 (한 번) · 푸는 것은 비가 처음 올 때
function rainBytes() {
    if (!A.bytes) {
        A.bytes = fetch(SND.src).then(function (r) { if (!r.ok) throw new Error('빗소리 ' + r.status); return r.arrayBuffer(); })
            .catch(function (e) { A.bytes = null; throw e; });
    }
    return A.bytes;
}
function rainLoad(c) {
    if (A.buf || A.wait) return;
    A.wait = rainBytes().then(function (ab) {
        return new Promise(function (res, rej) {
            try { const p = c.decodeAudioData(ab.slice(0), res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); }
        });
    }).then(function (buf) { A.buf = buf; A.wait = null; A.bytes = null; })
      .catch(function (e) { A.wait = null; A.fail = (A.fail | 0) + 1; console.warn('[🌧] 빗소리를 받지 못했습니다', e && e.message); });
}
function audioStart() {
    if (A.on) return true;
    const c = A.ctx;
    if (!c || c.state !== 'running') return false;
    if (!A.buf) { if ((A.fail | 0) < 3) rainLoad(c); return false; }        // 아직 못 받았다 — 받으면 다음 장면에 튼다 (그동안은 그림만)
    try {
        const src = c.createBufferSource(); src.buffer = A.buf; src.loop = true;
        const span = Math.min(SND.L1, A.buf.duration - 0.05) - SND.L0;
        if (span > 1) { src.loopStart = SND.L0; src.loopEnd = SND.L0 + span; }
        const master = c.createGain(); master.gain.value = 0;
        src.connect(master); master.connect(c.destination);
        src.start(0, span > 1 ? SND.L0 + Math.random() * (span - 0.5) : 0);    // 돌 때마다 다른 자리부터
        A.bed = src; A.master = master; A.on = true;
        return true;
    } catch (e) { return false; }
}
function audioStop() {
    if (!A.on) return;
    const c = A.ctx, m = A.master, s = A.bed;
    A.on = false; A.bed = null; A.master = null;
    try { m.gain.cancelScheduledValues(c.currentTime); m.gain.setTargetAtTime(0, c.currentTime, 0.25); } catch (e) { }
    setTimeout(function () { try { s.stop(); } catch (e) { } try { m.disconnect(); } catch (e) { } }, 1400);
}
// 굵기(0~1)를 따라 소리 크기만 — 굵을 때 크게 · 잦아들면 작게
function audioLevel(lv, vol) {
    if (!A.on) return;
    const c = A.ctx, t = c.currentTime;
    try { A.master.gain.setTargetAtTime(R.VOL * Math.pow(Math.max(0, Math.min(1, lv)), 0.8) * (vol == null ? 1 : vol), t, 0.35); } catch (e) { }
}
// 화면을 누를 때 소리 장치를 연다 (그 전에는 소리 없이 그림만)
['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (ev) {
    window.addEventListener(ev, function () {
        if (!NOW.plaza && !NOW.steady && !stage() && !A.ctx) return;       // 광장에 있거나 비가 올 때 열어 둔다 (누가 들어서면 바로 나게 — lp.js 도 광장에서 이렇게 연다)
        const c = ac();
        if (c && c.state !== 'running' && c.state !== 'closed') { try { const p = c.resume(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }
        if (c && !A.buf && !A.wait && (A.fail | 0) < 3) { try { rainBytes().catch(function () { }); } catch (e) { } }      // 빗소리를 미리 받아 둔다 (비가 오면 바로 나게)
    }, { capture: true, passive: true });
});
document.addEventListener('visibilitychange', function () { if (document.hidden) audioStop(); });

// ==========================================
// 광장 — 찬 사람이 들어온 때를 실어 보내고 · 본다
// ==========================================
const ME = { key: '', fr: 0, wore: false, sn: 0, snAt: 0 };       // sn — 들어온 때 기온이 0도 밑이었다 (눈)
const NOW = { plaza: null, steady: null, t0: 0, test: 0, testSnow: 0 };       // plaza — 광장 장면 · steady — 어둠 장면

// ==========================================
// ❄ 지금 기온 — 0도 밑이면 눈 (머리말)
// ==========================================
const WX = { PLACE: '서울', URL: '/api/weather', KEY: 'foxWx', EVERY: 15 * 60000, LIFE: 30 * 60000, RETRY: 60000,
             temp: null, at: 0, wait: false, tried: 0, fail: 0, test: null };
(function wxRestore() {
    try {
        const v = JSON.parse(localStorage.getItem(WX.KEY) || 'null');
        if (v && isFinite(Number(v.t)) && Date.now() - (Number(v.at) || 0) < WX.LIFE) { WX.temp = Number(v.t); WX.at = Number(v.at); }
    } catch (e) { }
})();
function wxFetch() {
    if (WX.wait || Date.now() - WX.tried < WX.RETRY) return;
    WX.wait = true; WX.tried = Date.now();
    let pr;
    try { pr = fetch(WX.URL, { cache: 'no-store' }); } catch (e) { WX.wait = false; WX.fail++; return; }
    pr.then(function (r) { if (!r.ok) throw new Error('날씨 ' + r.status); return r.json(); })
      .then(function (j) {
          WX.wait = false;
          const t = (j && typeof j.temp === 'number') ? j.temp : NaN;      // 비어 있는 값을 0 도로 읽지 않는다
          if (!j || !j.ok || !isFinite(t)) { WX.fail++; return; }
          WX.temp = t; WX.at = Date.now(); WX.fail = 0;
          try { localStorage.setItem(WX.KEY, JSON.stringify({ t: t, at: WX.at })); } catch (e) { }
      })
      .catch(function () { WX.wait = false; WX.fail++; });
}
// 받아 둘 때가 됐으면 받는다 — 🦊 호갑투를 찬 사람만 부른다
function wxNeed() { if (Date.now() - WX.at >= WX.EVERY) wxFetch(); }
// 지금 눈이 올 날씨인가 — 모르거나 묵었으면 비
function wxSnow() {
    if (WX.test != null) return WX.test < 0;
    return WX.temp != null && Date.now() - WX.at < WX.LIFE && WX.temp < 0;
}
function wearsMe() { try { return !!(window.HG && typeof window.HG.wears === 'function' && window.HG.wears(u_())); } catch (e) { return false; } }

// 내 자리 기록에 덧붙인다 (doll-walk.js 의 plazaExtra 를 감싼다 — 그쪽이 늦게 붙어도 다시 감싼다)
setInterval(function () {
    const f = window.plazaExtra;
    if (typeof f === 'function' && f._fxr) return;
    const w = function () {
        let o = null;
        try { o = (typeof f === 'function') ? f.apply(this, arguments) : null; } catch (e) { o = null; }
        if (ME.fr && wearsMe()) { o = Object.assign({}, o || {}); o.fr = ME.fr; if (ME.sn) o.fs = 1; }      // fs — ❄ 눈
        return o;
    };
    w._fxr = true;
    window.plazaExtra = w;
}, 800);

// 지금 이 방에 내리는 것 — 가장 늦게 들어온 찬 사람의 것 · 그 사람이 정한 대로 비 또는 눈
function rainPick() {
    let best = 0, snow = false;
    if (NOW.test) { best = NOW.test; snow = !!NOW.testSnow; }
    if (ME.fr && wearsMe() && ME.fr >= best) { best = ME.fr; snow = !!ME.sn; }
    try {
        (typeof window.plazaPeerCodes === 'function' ? window.plazaPeerCodes() : []).forEach(function (c) {
            const q = window.plazaPeerPos(c);
            const fr = q ? (Number(q.fr) || 0) : 0;
            if (fr && fr > best) { best = fr; snow = !!q.fs; }
        });
    } catch (e) { }
    return { seed: best, snow: snow };
}
function rainSeed() { return rainPick().seed; }

// 무엇이 내리는지는 1초에 네 번만 본다 (ST) — 그리는 고리(loop)는 비가 올 때만 돈다
const ST = { st: null, seed: 0, on: false, snow: false };
function tick() {
    const st = stage();
    ST.st = (st && st.view) ? st : null;
    if (ST.st) {
        const key = st.seat || st.room;
        const wear = wearsMe();
        if (wear) wxNeed();                                                                          // ❄ 찬 사람만 기온을 받아 둔다
        if (key !== ME.key || (wear && !ME.wore)) {                                                   // 방에 들어왔다 · 방 안에서 찼다
            ME.key = key; ME.fr = wear ? clock() : 0;
            ME.sn = (wear && wxSnow()) ? 1 : 0; ME.snAt = Date.now();                                 // ❄ 들어오는 순간의 기온으로 정한다
        } else if (wear && ME.fr && Date.now() - ME.snAt < 3000) ME.sn = wxSnow() ? 1 : 0;           // 막 들어왔는데 기온이 방금 도착했다 — 3초 안에는 맞춘다
        if (!wear) { ME.fr = 0; ME.sn = 0; }
        ME.wore = wear;
        const pick = rainPick();
        ST.seed = pick.seed; ST.snow = pick.snow;
        const t = ST.seed ? clock() - ST.seed : -1;
        if (ST.seed && t >= 0 && t < R.TOTAL + R.DRY && !inRun()) pudPaint(st, ST.seed, t, levelAt(t), ST.snow); else if (PUD.list.length) pudClear();   // 탐사 중인 화면에는 웅덩이도 안 놓는다
    } else { ME.key = ''; ME.fr = 0; ME.sn = 0; ME.wore = false; ST.seed = 0; ST.snow = false; if (PUD.list.length) pudClear(); }
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
    if (st && ST.seed && !inRun()) { const t = clock() - ST.seed; lv = levelAt(t); drp = dripAt(t); }      // 탐사 중인 화면에는 안 내린다 (2026-11-15)
    if (lv > 0 && st) {
        if (!NOW.plaza || NOW.plaza.host !== st.view || NOW.plaza.dead) { if (NOW.plaza) NOW.plaza.kill(); NOW.plaza = new Scene(st.view, { z: 29 }); }
        NOW.plaza.size();
        NOW.plaza.frame(lv, drp, dt, ST.snow);
    } else if (NOW.plaza) {
        if (st && !inRun() && NOW.plaza.host === st.view && (NOW.plaza.drops.length || NOW.plaza.splash.length)) NOW.plaza.frame(0, false, dt, NOW.plaza.snow);      // 남은 빗줄기 · 눈송이는 끝까지 떨어진다
        else { NOW.plaza.kill(); NOW.plaza = null; }
    }
    // ── 어둠 (가늘게 계속)
    let lvS = 0;
    if (NOW.steady) {
        const host = NOW.steady.host;
        if (!host || !host.isConnected || !host.getClientRects().length) { NOW.steady.kill(); NOW.steady = null; }      // 닫힌 화면 (fixed 라 offsetParent 로는 못 본다)
        else { lvS = 0.34; NOW.steady.size(); NOW.steady.frame(lvS, Math.random() < 0.3, dt); }
    }
    // ── 소리 — 광장 비는 탐사 중이 아닐 때 · 광장 🔊 가 켜져 있을 때 · 어둠 비는 어둠 음소거를 따른다
    const plazaSnd = (lv > 0 && !plazaOff() && !ST.snow) ? lv : 0;         // (탐사 중이면 위에서 lv 가 0 이다) · ❄ 눈은 소리가 없다
    let darkMute = false;
    try { darkMute = (typeof darkAudio !== 'undefined' && darkAudio && !!darkAudio.muted); } catch (e) { }
    const steadySnd = (lvS > 0 && !darkMute) ? lvS * 0.8 : 0;
    const snd = muted() ? 0 : Math.max(plazaSnd, steadySnd);
    if (snd > 0) {
        if (!A.on) { ac(); audioStart(); }
        audioLevel(snd, 1);
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
    snow: function () { return !!rainPick().snow; },                         // ❄ 지금 이 방에 내리는 것이 눈인가
    weather: function () { return { temp: WX.temp, at: WX.at, snow: wxSnow(), test: WX.test, fail: WX.fail }; },
    levelAt: levelAt,
    mine: function () { return ME.fr; },
    audio: function () { return { on: A.on, buf: A.buf ? A.buf.duration : 0, loop: A.bed ? [A.bed.loop, A.bed.loopStart, A.bed.loopEnd] : null, gain: A.master ? A.master.gain.value : null, fail: A.fail }; }      // 시험 · 콘솔
};
window.foxRainMute = function (on) { try { if (on) localStorage.setItem(MUTE_KEY, '1'); else localStorage.removeItem(MUTE_KEY); } catch (e) { } return muted(); };
window.foxRainTest = function (snow) { NOW.test = clock(); NOW.testSnow = snow ? 1 : 0; setTimeout(function () { NOW.test = 0; NOW.testSnow = 0; }, R.TOTAL + R.DRY + 500); try { tick(); } catch (e) { } return (snow ? '❄ ' : '🌧 ') + Math.round(R.TOTAL / 1000) + '초 동안 내립니다 (내 화면만)'; };
// ❄ 지금 알고 있는 기온 · 이 기기에서만 기온을 정해 보기 (null 로 되돌린다)
window.foxWeather = function () {
    const o = { 곳: WX.PLACE, 기온: WX.temp, 받은지_분: WX.at ? Math.round((Date.now() - WX.at) / 6000) / 10 : null, 지금_눈: wxSnow(), 시험값: WX.test, 못받은횟수: WX.fail, 출처: 'Open-Meteo.com (CC BY 4.0)' };
    console.log(o);
    return o;
};
window.foxWeatherTest = function (t) { WX.test = (t == null || t === '') ? null : Number(t); return window.foxWeather(); };
window.foxRainState = function () {
    const s = rainSeed(), t = s ? clock() - s : -1;
    const out = { 방: ME.key, 내가찼나: wearsMe(), 내들어온때: ME.fr, 눈: !!rainPick().snow, 씨앗: s, 흐른초: t >= 0 ? Math.round(t / 100) / 10 : null, 굵기: Math.round(levelAt(t) * 100) / 100,
                  빗줄기: NOW.plaza ? NOW.plaza.drops.length : 0, 웅덩이: PUD.list.length, 소리: A.on, 빗소리: A.buf ? Math.round(A.buf.duration * 10) / 10 + '초' : (A.wait ? '받는 중' : '아직'), 소리장치: A.ctx ? A.ctx.state : '없음', 음소거: muted(), 광장소리끔: plazaOff(), 어둠비: !!NOW.steady };
    console.log(out);
    return out;
};
console.log('[🌧 여우비] foxRainTest() · foxRainState() · foxRainMute(true)');
})();
