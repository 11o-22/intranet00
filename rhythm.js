// ==========================================
// ★ 🎵 리듬 게임 — 상담사 전용 (2026-11-10 사용자)
// bundles.json 마지막 묶음 · 광장 ☰ 「생활」 → 「리듬 게임」
// ==========================================
//
//   「직접 작곡한 두 곡 — 마스터링해서 리듬게임으로 쓰자. 모바일 기준 가로로 눕혀서 6칸 정도,
//     이지 · 노말 · 하드, 터치 · 길게 누르기 · 슬라이드까지. 일단은 상담사만. 메뉴칸에 놔줘.」
//
//   곡    snd/rhythm-<열쇠>.mp3  (마스터링 — -14 LUFS · 최고 -1 dBTP)
//   채보  rhythm/<열쇠>.json      (tools/rhythm-chart.py 가 곡을 듣고 만든 것 — 16분 격자 · 템포가 바뀌어도 따라간다)
//   표지는 쓰지 않는다 — 까만 칸 (2026-11-10 사용자)
//
//   ■ 화면 — 가로. 휴대폰을 세워 두면 화면을 돌려 그린다 (손가락 자리도 같이 돌린다).
//            들어갈 때 전체 화면 · 가로 고정을 해 본다 (되는 기기만).
//   ★ 2026-11-10 사용자 「터치감이 안 좋아 — Deemo 같은 형식으로」
//     · 칸이 없다 — 노트가 멀리(위 가운데)에서 원근으로 내려와 판정선에 닿는다. 노트마다 가로 자리가 있다.
//     · 화면 어디를 눌러도 된다 — **가로 자리만** 본다 (노트 폭 + 여유). 빈 곳을 눌러도 벌이 없다.
//     · 판정 CHARMING ±55 ms · NORMAL ±140 · 그 뒤 MISS (슬라이드는 ±120 안에 손가락이 지나가면 CHARMING)
//     · 점수는 정확도(%) — CHARMING 100% · NORMAL 60% · 길게 누르기는 머리 · 꼬리 둘로 센다
//     · 결과에 평균 타이밍(빠르게 / 늦게) — 「싱크에 반영」으로 바로 맞춘다
//   ■ 노트
//     · 터치         흰 건반 — 판정선에 닿을 때 그 자리를 누른다
//     · 길게 누르기   흰 건반 + 띠 — 누른 채 끝까지 (손가락이 옆으로 조금 흘러도 된다) · 일찍 떼면 꼬리는 MISS
//     · 슬라이드     노란 건반 — 손가락이 그 자리에 닿아 있거나 지나가면 된다 (누르지 않고 쓸어도 된다)
//   ■ 설정   속도 · 싱크(소리가 늦게 들리면 +) · 타격음 — 이 기기에 적어 둔다
//   ■ 기록   곡 · 난이도마다 최고 정확도 — 이 기기에 (rgBest)
//   ■ 키보드 S D F J K L · 스페이스 = 멈춤 (컴퓨터에서 시험)
//
//   콘솔   rhythmOpen()

(function rhythm() {
'use strict';

const ADMIN = 'kario0987';
const SONGS = [
    { key: 'airplane', title: 'In the Airplane', artist: 'Benz', audio: 'snd/rhythm-airplane.mp3', chart: 'rhythm/airplane.json', color: '#7ec8ff', cover: 'rhythm/airplane-cover.jpg' },
    { key: 'client', title: '내담자 여러분께', artist: 'Benz', audio: 'snd/rhythm-client.mp3', chart: 'rhythm/client.json', color: '#ffb3d1', cover: 'rhythm/client-cover.jpg' }      // 표지 (2026-11-11 사용자) — 없는 곡은 까만 칸
];
const DIFFS = [['easy', 'EASY', '이지', '#5fd18a'], ['normal', 'NORMAL', '노말', '#ffc94a'], ['hard', 'HARD', '하드', '#ff5f73']];
const LANES = 6;                      // 채보의 칸 수 — 화면에서는 가로 자리로 바꾼다 (xOfLane)
const W_CHARM = 55, W_NORMAL = 140, W_SLIDE = 120;
const HIT_PAD = 0.075;                // 노트 폭 바깥으로 이만큼(판정선 폭의 몫)까지 맞은 것으로
const NOTE_W = [0.15, 0.15, 0.12];    // 터치 · 길게 누르기 · 슬라이드 — 판정선 폭의 몫
function xOfLane(l) { return 0.08 + l * (0.84 / (LANES - 1)); }
const LEAD = 2.2;                     // 곡 앞에 비우는 초
const HOLD_EARLY_OK = 140;            // 꼬리 — 끝나기 이만큼 전에 떼도 성공
const KEYS = ['s', 'd', 'f', 'j', 'k', 'l'];
const SET_KEY = 'rgSet', BEST_KEY = 'rgBest';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdmin() { const u = u_(); return !!(u && u.code === ADMIN); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function loadJ(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function say(m) { try { showCustomAlert(m); } catch (e) { alert(m); } }

const SET = Object.assign({ speed: 5, offset: 0, hit: true, song: 'airplane', diff: 'normal' }, loadJ(SET_KEY, {}));
function saveSet() { saveJ(SET_KEY, SET); }

// ==========================================
// 소리
// ==========================================
const AU = { ctx: null, bufs: {}, src: null, gain: null, startAt: 0, click: null, sess: null, lag: {}, lagNow: 0 };
function ctx() {
    if (!AU.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        AU.ctx = new C({ latencyHint: 'interactive' });
        AU.gain = AU.ctx.createGain(); AU.gain.gain.value = 1; AU.gain.connect(AU.ctx.destination);
        // 타격음 — 부드러운 건반 소리 (사인 두 겹이 빨리 사그라든다 + 아주 짧은 닿는 소리)
        const sr = AU.ctx.sampleRate, n = Math.floor(sr * 0.14), b = AU.ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) {
            const t = i / sr;
            d[i] = (Math.sin(2 * Math.PI * 1046.5 * t) * 0.55 + Math.sin(2 * Math.PI * 2093 * t) * 0.18) * Math.exp(-t * 38) * Math.min(1, t * 900)
                 + (Math.random() * 2 - 1) * 0.12 * Math.exp(-t * 700);
        }
        AU.click = b;
    }
    if (AU.ctx.state !== 'running') { try { AU.ctx.resume(); } catch (e) { } }
    return AU.ctx;
}
function sessionOn() {
    try { if (navigator.audioSession && 'type' in navigator.audioSession) { AU.sess = navigator.audioSession.type; navigator.audioSession.type = 'playback'; } } catch (e) { }
}
function sessionOff() {
    try { if (navigator.audioSession && AU.sess != null) navigator.audioSession.type = AU.sess; } catch (e) { }
    AU.sess = null;
}
function decode(ab) {
    const c = ctx();
    return new Promise(function (res, rej) {
        try { const p = c.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); }
    });
}
function loadSong(s) {
    if (AU.bufs[s.key]) return Promise.resolve(AU.bufs[s.key]);
    return fetch(s.audio).then(function (r) { if (!r.ok) throw new Error('곡을 받지 못했습니다 (' + r.status + ')'); return r.arrayBuffer(); })
        .then(decode).then(function (b) { AU.bufs[s.key] = b; return b; });
}
const CH = {};
function loadChart(s) {
    if (CH[s.key]) return Promise.resolve(CH[s.key]);
    return fetch(s.chart, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('채보를 받지 못했습니다 (' + r.status + ')'); return r.json(); })
        .then(function (j) { CH[s.key] = j; return j; });
}
function playClick(v) {
    if (!SET.hit || !AU.ctx || !AU.click) return;
    try {
        const s = AU.ctx.createBufferSource(); s.buffer = AU.click;
        const g = AU.ctx.createGain(); g.gain.value = v || 0.35;
        s.connect(g); g.connect(AU.ctx.destination); s.start();
    } catch (e) { }
}
// 곡의 지금 시각 (ms) — 소리가 실제로 나가는 때에 맞춘다
//   ★ 2026-11-10 사용자 「박자가 이상하게 어긋나」
//     · 소리 시계(getOutputTimestamp)는 칸 단위로 들쭉날쭉하다 — 화면 시계(performance.now)에 붙여 두고 천천히만 따라가게 (떨림 · 판정 흔들림을 없앤다)
//     · mp3 앞 공백 — 브라우저마다 앞 25 ms 를 자르기도 · 안 자르기도 한다. 채보의 앞머리 지문(head)과 받은 곡을 대 보고 그만큼 민다 (AU.lag)
function rawMs() {
    const c = AU.ctx; if (!c) return 0;
    const lat = c.outputLatency || c.baseLatency || 0;
    let t = c.currentTime - lat;
    try {
        if (c.getOutputTimestamp && c.state === 'running') {
            const ts = c.getOutputTimestamp();
            if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
                const est = ts.contextTime + Math.max(0, (performance.now() - ts.performanceTime)) / 1000;
                // 멈췄다 이어 갈 때 묵은 값이 남아 앞질러 가지 않게 — 지금 시각보다 앞서지 않고, 많이 뒤처지지 않게
                if (est <= c.currentTime + 0.005 && est >= c.currentTime - 0.4) t = est;
            }
        }
    } catch (e) { }
    return (t - AU.startAt) * 1000 - (AU.lagNow || 0);
}
const CK = { base: null };
function clockReset() { CK.base = null; }
function songMs() {
    const pn = performance.now();
    const raw = rawMs();
    if (AU.ctx && AU.ctx.state !== 'running') { CK.base = null; return raw - (Number(SET.offset) || 0); }
    const want = raw - pn;
    if (CK.base == null || Math.abs(want - CK.base) > 80) CK.base = want;        // 처음 · 멈췄다 이어 감 — 바로 맞춘다
    else CK.base += (want - CK.base) * 0.02;                                     // 그 밖에는 아주 천천히만
    return pn + CK.base - (Number(SET.offset) || 0);
}
// 받은 곡의 앞머리를 채보의 지문과 대 본다 — 받은 곡이 늦게 시작하면 + (ms)
function headLag(buf, head) {
    try {
        if (!head || !head.length || !buf) return 0;
        const sr = buf.sampleRate, nb = Math.min(head.length + 140, Math.floor(buf.length / sr * 1000));
        const a = buf.getChannelData(0), b = buf.numberOfChannels > 1 ? buf.getChannelData(1) : a;
        const env = new Float32Array(nb);
        let mx = 0;
        for (let i = 0; i < nb; i++) {
            const s0 = Math.floor(i * sr / 1000), s1 = Math.floor((i + 1) * sr / 1000);
            let sum = 0;
            for (let j = s0; j < s1; j++) sum += Math.abs((a[j] + b[j]) * 0.5);
            env[i] = sum / Math.max(1, s1 - s0);
            if (env[i] > mx) mx = env[i];
        }
        let best = 0, bc = -1;
        for (let lag = -20; lag <= 120; lag++) {
            let num = 0, a2 = 0, b2 = 0;
            for (let i = 0; i < head.length; i++) {
                const j = i + lag; if (j < 0 || j >= nb) continue;
                const v = env[j] / (mx || 1);
                num += head[i] * v; a2 += head[i] * head[i]; b2 += v * v;
            }
            const c = num / Math.sqrt(a2 * b2 + 1e-12);
            if (c > bc) { bc = c; best = lag; }
        }
        return bc > 0.8 ? best : 0;
    } catch (e) { return 0; }
}

// ==========================================
// 화면
// ==========================================
let OV = null, ST = null, CV = null, G2 = null, UI = null;
let rot = false, VW = 0, VH = 0;
function css() {
    if (document.getElementById('rg-css')) return;
    const s = document.createElement('style');
    s.id = 'rg-css';
    s.textContent = [
        '#rg-ov{position:fixed;inset:0;z-index:2147483000;background:#07070d;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;font-family:inherit;color:#eef;}',
        '#rg-st{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;}',
        '#rg-st canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}',
        '#rg-ui{position:absolute;inset:0;}',
        '.rg-bg{position:absolute;inset:0;background:#000;}',
        '.rg-sel{position:absolute;inset:0;display:flex;gap:14px;padding:14px 18px;box-sizing:border-box;}',
        '.rg-col{display:flex;flex-direction:column;gap:10px;min-width:0;}',
        '.rg-h{font-size:12px;letter-spacing:4px;color:#9ab;opacity:.9;}',
        '.rg-song{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);cursor:pointer;}',
        '.rg-song.on{background:rgba(255,255,255,.16);border-color:var(--c);box-shadow:0 0 14px -4px var(--c);}',
        '.rg-song i.rg-sq{width:52px;height:52px;border-radius:8px;background:#000 center/cover no-repeat;border:1px solid rgba(255,255,255,.14);flex-shrink:0;}',
        '.rg-song b{display:block;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.rg-song small{font-size:11px;color:#aab;}',
        '.rg-big{flex:1;display:flex;gap:16px;align-items:center;min-width:0;}',
        '.rg-jacket{width:min(36%,230px);aspect-ratio:1;height:auto;border-radius:14px;background:#000 center/cover no-repeat;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 40px rgba(0,0,0,.6);flex-shrink:0;}',
        '.rg-info{display:flex;flex-direction:column;gap:9px;min-width:0;flex:1;}',
        '.rg-title{font-size:22px;font-weight:bold;color:#fff;line-height:1.2;}',
        '.rg-diffs{display:flex;gap:8px;flex-wrap:wrap;}',
        '.rg-diff{flex:1;min-width:84px;padding:8px 6px;border-radius:10px;border:2px solid var(--c);background:rgba(0,0,0,.3);color:#fff;text-align:center;cursor:pointer;font-family:inherit;}',
        '.rg-diff.on{background:var(--c);color:#111;}',
        '.rg-diff b{display:block;font-size:13px;letter-spacing:2px;}',
        '.rg-diff i{font-style:normal;font-size:20px;font-weight:bold;}',
        '.rg-diff small{display:block;font-size:10px;opacity:.85;}',
        '.rg-row{display:flex;gap:8px;align-items:center;font-size:12px;color:#ccd;flex-wrap:wrap;}',
        '.rg-step{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.07);border-radius:9px;padding:3px 4px;}',
        '.rg-step button,.rg-btn{border:none;border-radius:8px;background:rgba(255,255,255,.14);color:#fff;font-family:inherit;cursor:pointer;}',
        '.rg-step button{width:30px;height:28px;font-size:16px;}',
        '.rg-step span{min-width:52px;text-align:center;font-weight:bold;}',
        '.rg-btn{padding:10px 18px;font-size:14px;}',
        '.rg-go{background:linear-gradient(135deg,#7ec8ff,#b58cff);color:#111;font-weight:bold;font-size:17px;padding:12px 30px;letter-spacing:3px;}',
        '.rg-x{position:absolute;top:10px;right:12px;width:36px;height:36px;font-size:18px;z-index:5;}',
        '.rg-best{font-size:12px;color:#ffe9a8;}',
        '.rg-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-size:15px;letter-spacing:2px;}',
        '.rg-pause{position:absolute;top:8px;left:10px;width:40px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#fff;font-size:15px;z-index:4;}',
        '.rg-modal{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);z-index:6;}',
        '.rg-box{background:rgba(20,20,34,.96);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:18px 22px;display:flex;flex-direction:column;gap:10px;align-items:center;min-width:240px;}',
        '.rg-res{display:flex;gap:22px;align-items:center;}',
        '.rg-rank{font-size:84px;font-weight:900;line-height:1;text-shadow:0 0 24px currentColor;}',
        '.rg-tbl{font-size:13px;line-height:1.75;}',
        '.rg-tbl b{display:inline-block;min-width:104px;}',
        '.rg-rot{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:11px;color:#889;}'
    ].join('\n');
    document.head.appendChild(s);
}
function fit() {
    if (!OV) return;
    const w = window.innerWidth, h = window.innerHeight;
    rot = h > w;
    VW = rot ? h : w; VH = rot ? w : h;
    ST.style.width = VW + 'px'; ST.style.height = VH + 'px';
    ST.style.transform = rot ? ('translateX(' + w + 'px) rotate(90deg)') : 'none';
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    CV.width = Math.round(VW * dpr); CV.height = Math.round(VH * dpr);
    G2.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
}
// 손가락 자리 → 무대 자리 (세워 두면 돌려서)
function toStage(cx, cy) {
    if (!rot) return { x: cx, y: cy };
    return { x: cy, y: window.innerWidth - cx };
}

function open() {
    if (!isAdmin()) { say('아직 준비 중입니다.'); return; }
    if (OV) return;
    css();
    OV = document.createElement('div'); OV.id = 'rg-ov';
    ST = document.createElement('div'); ST.id = 'rg-st';
    CV = document.createElement('canvas'); G2 = CV.getContext('2d');
    UI = document.createElement('div'); UI.id = 'rg-ui';
    ST.appendChild(CV); ST.appendChild(UI); OV.appendChild(ST);
    document.body.appendChild(OV);
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'click', 'wheel', 'contextmenu'].forEach(function (t) {
        OV.addEventListener(t, function (e) { e.stopPropagation(); if (t === 'contextmenu') e.preventDefault(); }, { passive: t !== 'contextmenu' });
    });
    OV.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    fit();
    menu();
    raf();
}
function close() {
    stopPlay();
    if (!OV) return;
    window.removeEventListener('resize', fit);
    window.removeEventListener('orientationchange', fit);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) { }
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { }
    sessionOff();
    OV.remove(); OV = null; ST = null; CV = null; G2 = null; UI = null;
    MODE = 'off';
}
window.rhythmOpen = open;
window.rhythmClose = close;

// ==========================================
// 곡 고르기
// ==========================================
let MODE = 'off';        // menu · load · play · pause · result
function song() { return SONGS.find(function (s) { return s.key === SET.song; }) || SONGS[0]; }
function coverCss(x) { return x.cover ? ' style="background-image:url(\'' + x.cover + '\')"' : ''; }
function bestOf(k, d) { const b = loadJ(BEST_KEY, {}); return b[k + '/' + d] || null; }
function menu() {
    MODE = 'menu';
    const s = song();
    const chart = CH[s.key];
    if (!chart) loadChart(s).then(function () { if (MODE === 'menu' && song().key === s.key) menu(); }).catch(function () { });
    const songs = SONGS.map(function (x) {
        return '<div class="rg-song' + (x.key === s.key ? ' on' : '') + '" data-song="' + x.key + '" style="--c:' + x.color + '"><i class="rg-sq"' + coverCss(x) + '></i><div style="min-width:0"><b>' + esc(x.title) + '</b><small>' + esc(x.artist) + '</small></div></div>';
    }).join('');
    const bpm = chart ? (Array.isArray(chart.bpm) ? chart.bpm[0] + '–' + chart.bpm[1] : chart.bpm) : '…';
    const len = chart ? Math.floor(chart.dur / 60000) + ':' + String(Math.floor(chart.dur / 1000) % 60).padStart(2, '0') : '';
    const diffs = DIFFS.map(function (d) {
        const c = chart && chart.charts[d[0]];
        const b = bestOf(s.key, d[0]);
        return '<button class="rg-diff' + (SET.diff === d[0] ? ' on' : '') + '" data-diff="' + d[0] + '" style="--c:' + d[3] + '"><b>' + d[1] + '</b><i>' + (c ? c.level : '·') + '</i><small>' + (c ? c.count + ' 노트' : '') + '</small>'
            + '<small>' + (b ? (b.score / 10000).toFixed(2) + '%' + (b.ap ? ' · AC' : b.fc ? ' · FC' : '') : '—') + '</small></button>';
    }).join('');
    UI.innerHTML = '<div class="rg-bg"></div>'
        + '<button class="rg-btn rg-x" data-k="x">✕</button>'
        + '<div class="rg-sel">'
        + '<div class="rg-col" style="width:min(34%,240px);"><div class="rg-h">🎵 RHYTHM · 상담사 전용</div>' + songs + '<div style="flex:1"></div>'
        + '<div class="rg-row"><span>속도</span><span class="rg-step"><button data-k="sp-">−</button><span>' + SET.speed.toFixed(1) + '</span><button data-k="sp+">+</button></span></div>'
        + '<div class="rg-row"><span>싱크</span><span class="rg-step"><button data-k="of-">−</button><span>' + (SET.offset > 0 ? '+' : '') + SET.offset + 'ms</span><button data-k="of+">+</button></span>'
        + '<button class="rg-btn" data-k="hit" style="padding:6px 10px;font-size:12px;">타격음 ' + (SET.hit ? 'ON' : 'OFF') + '</button></div>'
        + '<div style="font-size:10px;color:#889;line-height:1.5;">소리가 노트보다 늦게 들리면 싱크를 + 로</div></div>'
        + '<div class="rg-big"><div class="rg-jacket"' + coverCss(s) + '></div><div class="rg-info">'
        + '<div class="rg-title">' + esc(s.title) + '</div><div style="font-size:12px;color:#aab;">' + esc(s.artist) + (chart ? ' · BPM ' + bpm + ' · ' + len : '') + '</div>'
        + '<div class="rg-diffs">' + diffs + '</div>'
        + '<div class="rg-row" style="font-size:11px;color:#99a;line-height:1.5;">흰 건반 터치 · 띠 달린 건반 길게 누르기 · 노란 건반 슬라이드(손가락이 지나가면) — 화면 어디든 노트의 가로 자리를 누르면 됩니다</div>'
        + '<div><button class="rg-btn rg-go" data-k="go">START</button></div>'
        + '</div></div></div>'
        + (rot ? '<div class="rg-rot">휴대폰을 가로로 눕혀서 하면 편합니다</div>' : '');
    Array.prototype.forEach.call(UI.querySelectorAll('[data-song]'), function (el) { el.onclick = function () { SET.song = el.dataset.song; saveSet(); menu(); }; });
    Array.prototype.forEach.call(UI.querySelectorAll('[data-diff]'), function (el) { el.onclick = function () { SET.diff = el.dataset.diff; saveSet(); menu(); }; });
    Array.prototype.forEach.call(UI.querySelectorAll('[data-k]'), function (el) {
        el.onclick = function () {
            const k = el.dataset.k;
            if (k === 'x') { close(); return; }
            if (k === 'sp-') SET.speed = Math.max(1, Math.round((SET.speed - 0.5) * 10) / 10);
            if (k === 'sp+') SET.speed = Math.min(12, Math.round((SET.speed + 0.5) * 10) / 10);
            if (k === 'of-') SET.offset = Math.max(-300, SET.offset - 5);
            if (k === 'of+') SET.offset = Math.min(300, SET.offset + 5);
            if (k === 'hit') SET.hit = !SET.hit;
            if (k === 'go') { saveSet(); start(); return; }
            saveSet(); menu();
        };
    });
}

// ==========================================
// 판
// ==========================================
let P = null;        // 지금 판
function start() {
    const s = song(), d = SET.diff;
    // 손짓 안에서 — 소리 · 전체 화면 · 가로 고정
    ctx(); sessionOn();
    try {
        if (!document.fullscreenElement && OV.requestFullscreen) {
            OV.requestFullscreen({ navigationUI: 'hide' }).then(function () {
                try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () { }); } catch (e) { }
            }).catch(function () { });
        }
    } catch (e) { }
    MODE = 'load';
    UI.innerHTML = '<div class="rg-bg"></div><div class="rg-load">불러오는 중…</div>';
    Promise.all([loadSong(s), loadChart(s)]).then(function (r) {
        if (!OV || MODE !== 'load') return;
        begin(s, d, r[0], r[1]);
    }).catch(function (e) {
        if (!OV) return;
        say('리듬 게임을 열지 못했습니다.\n\n' + (e && e.message ? e.message : e));
        menu();
    });
}
function begin(s, d, buf, chart) {
    const c = chart.charts[d];
    const notes = c.notes.map(function (n, i) {
        return { i: i, t: n[0], lane: n[1], x: xOfLane(n[1]), w: NOTE_W[n[2]] || 0.15, k: n[2], len: n[2] === 1 ? n[3] : 0, ch: n[2] === 2 ? n[3] : 0,
                 done: false, j: null, hold: null, tail: null };
    });
    // 슬라이드 줄 — 같은 번호끼리 차례대로 (희미한 줄로 잇는다)
    const chains = {};
    notes.forEach(function (n) { if (n.k === 2) (chains[n.ch] = chains[n.ch] || []).push(n); });
    const total = notes.reduce(function (a, n) { return a + (n.k === 1 ? 2 : 1); }, 0);
    P = { s: s, d: d, chart: chart, notes: notes, chains: chains, total: total, score: 0, combo: 0, maxCombo: 0,
          cnt: { c: 0, n: 0, m: 0 }, offs: [], ptr: {}, judge: null, fx: [], parts: [], ended: false, head: 0 };
    UI.innerHTML = '<button class="rg-pause" data-k="pause">❚❚</button>';
    UI.querySelector('[data-k="pause"]').onclick = function (e) { e.stopPropagation(); pause(); };
    bindInput();
    if (AU.lag[s.key] == null) AU.lag[s.key] = headLag(buf, chart.head);
    AU.lagNow = AU.lag[s.key];
    clockReset();
    const cx = ctx();
    AU.src = cx.createBufferSource(); AU.src.buffer = buf; AU.src.connect(AU.gain);
    AU.startAt = cx.currentTime + LEAD;
    AU.src.start(AU.startAt);
    AU.src.onended = function () { if (P && MODE === 'play') P.audioEnd = true; };
    MODE = 'play';
}
function stopPlay() {
    try { if (AU.src) { AU.src.onended = null; AU.src.stop(); } } catch (e) { }
    AU.src = null;
    try { if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); } catch (e) { }
    unbindInput();
}
function pause() {
    if (MODE !== 'play') return;
    MODE = 'pause';
    try { AU.ctx.suspend(); } catch (e) { }
    const m = document.createElement('div'); m.className = 'rg-modal';
    m.innerHTML = '<div class="rg-box"><b style="letter-spacing:4px;">PAUSE</b><button class="rg-btn" data-k="r" style="width:180px">계속</button><button class="rg-btn" data-k="re" style="width:180px">처음부터</button><button class="rg-btn" data-k="q" style="width:180px">곡 고르기</button></div>';
    UI.appendChild(m);
    m.querySelector('[data-k="r"]').onclick = function () {
        m.remove();
        try { AU.ctx.resume(); } catch (e) { }
        clockReset();
        MODE = 'play';
    };
    m.querySelector('[data-k="re"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } start(); };
    m.querySelector('[data-k="q"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } menu(); };
}
function onVis() { if (document.hidden) pause(); }

// ==========================================
// 판정 — 가로 자리만 본다 (Deemo 처럼)
// ==========================================
function addScore(kind, dt) {
    const base = 1000000 / Math.max(1, P.total);
    P.score += base * (kind === 'c' ? 1 : kind === 'n' ? 0.6 : 0);
    P.cnt[kind]++;
    if (kind === 'm') P.combo = 0;
    else { P.combo++; if (P.combo > P.maxCombo) P.maxCombo = P.combo; }
    P.judge = { k: kind, at: performance.now(), dt: dt };
}
function near(n, u, pad) { return u != null && Math.abs(u - n.x) <= n.w / 2 + pad; }
function burst(n, kind) {
    const t = performance.now();
    P.fx.push({ x: n.x, w: n.w, at: t, k: kind });
    if (P.fx.length > 30) P.fx.shift();
    for (let q = 0; q < 9; q++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        P.parts.push({ x: n.x + (Math.random() - 0.5) * n.w * 0.8, at: t, vx: Math.cos(a) * (0.08 + Math.random() * 0.22), vy: Math.sin(a) * (0.5 + Math.random() * 0.9), k: kind });
    }
    if (P.parts.length > 160) P.parts.splice(0, P.parts.length - 160);
}
// 눌렀다 — 판정 안 · 가로 자리 안에서 가장 이른 노트 (같으면 더 가까운 것)
function press(u, pid) {
    if (!P || MODE !== 'play' || u == null) return;
    const now = songMs();
    let best = null, bestScore = 1e9;
    for (let i = P.head; i < P.notes.length; i++) {
        const n = P.notes[i];
        const dt = now - n.t;
        if (dt < -W_NORMAL) break;                    // 아직 멀다 (시각 순)
        if (n.done || n.k === 2 || dt > W_NORMAL) continue;
        if (!near(n, u, HIT_PAD)) continue;
        const sc = Math.abs(dt) + Math.abs(u - n.x) * 400;
        if (best == null || n.t < best.t - 30 || (Math.abs(n.t - best.t) <= 30 && sc < bestScore)) { best = n; bestScore = sc; }
    }
    if (!best) return;
    const dt = now - best.t;
    const g = Math.abs(dt) <= W_CHARM ? 'c' : 'n';
    best.done = true; best.j = g;
    P.offs.push(dt);
    addScore(g, dt);
    burst(best, g);
    playClick(0.26);
    if (best.k === 1) { best.hold = pid; if (P.ptr[pid]) P.ptr[pid].hold = best; }
}
function releaseHold(n, now) {
    if (!n || n.tail) return;
    if (now >= n.t + n.len - HOLD_EARLY_OK) { n.tail = 'c'; addScore('c'); burst(n, 'c'); }
    else { n.tail = 'm'; addScore('m'); }
    n.hold = null;
}
function step(now) {
    const us = [];
    Object.keys(P.ptr).forEach(function (id) { const q = P.ptr[id]; if (q && q.u != null) us.push(q.u); });
    while (P.head < P.notes.length && P.notes[P.head].done && (P.notes[P.head].k !== 1 || P.notes[P.head].tail)) P.head++;
    for (let i = P.head; i < P.notes.length; i++) {
        const n = P.notes[i];
        const dt = now - n.t;
        if (dt < -W_NORMAL - 300) break;
        if (n.done) {
            if (n.k === 1 && !n.tail) {
                if (n.j === 'm') { n.tail = 'm'; addScore('m'); continue; }
                const q = n.hold != null ? P.ptr[n.hold] : null;
                const held = !!q && near(n, q.u, HIT_PAD * 1.8);
                if (!held || now >= n.t + n.len) releaseHold(n, now);
            }
            continue;
        }
        if (n.k === 2) {
            if (dt >= -60 && dt <= W_SLIDE && us.some(function (u) { return near(n, u, HIT_PAD * 1.3); })) {
                n.done = true; n.j = 'c'; addScore('c'); burst(n, 'c'); playClick(0.14);
            } else if (dt > W_SLIDE) { n.done = true; n.j = 'm'; addScore('m'); }
            continue;
        }
        if (dt > W_NORMAL) {
            n.done = true; n.j = 'm'; addScore('m');
            if (n.k === 1) { n.tail = 'm'; addScore('m'); }
        }
    }
    const tailEnd = P.notes.length ? Math.max.apply(null, P.notes.slice(-24).map(function (n) { return n.t + (n.len || 0); })) : 0;
    if (!P.ended && (now > P.chart.dur + 600 || (P.audioEnd && now > tailEnd + 800))) {
        P.ended = true;
        setTimeout(result, 900);
    }
}

// ==========================================
// 자리 — 원근 (멀리 위 가운데 → 판정선)
// ==========================================
let L = null;
const DEPTH = 2.4;                     // 멀리 있을 때 1 / (1 + DEPTH) 크기
function layout() {
    if (!VW) return;
    const lineW = Math.min(VW * 0.9, VH * 2.2);
    L = { lineW: lineW, lineL: (VW - lineW) / 2, cx: VW / 2, yJ: VH * 0.82, yV: -VH * 0.32, nh: Math.max(12, VH * 0.042) };
}
function scaleAt(p) { return p <= 1 ? 1 / (1 + (1 - p) * DEPTH) : 1 + (p - 1) * 0.6; }
function yAt(s) { return L.yV + (L.yJ - L.yV) * s; }
function xAt(u, s) { return L.cx + (u - 0.5) * L.lineW * s; }
function uOf(x) { if (!L) return null; return (x - L.lineL) / L.lineW; }

// ==========================================
// 손가락 · 키보드
// ==========================================
function pd(e) {
    if (MODE !== 'play' || !P) return;
    if (e.target && e.target.closest && e.target.closest('.rg-pause,.rg-modal')) return;
    e.preventDefault();
    const p = toStage(e.clientX, e.clientY);
    const u = uOf(p.x);
    P.ptr[e.pointerId] = { u: u, hold: null, at: performance.now() };
    try { ST.setPointerCapture && ST.setPointerCapture(e.pointerId); } catch (x) { }
    press(u, e.pointerId);
}
function pm(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const p = toStage(e.clientX, e.clientY);
    P.ptr[e.pointerId].u = uOf(p.x);
}
function pu(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const q = P.ptr[e.pointerId];
    delete P.ptr[e.pointerId];
    if (q.hold && MODE === 'play') releaseHold(q.hold, songMs());
}
// 무대 전체에서 받는다 — 위에 덮인 글자 칸(#rg-ui)을 눌러도 (단추 · 멈춤 창은 빼고)
function bindInput() {
    ST.addEventListener('pointerdown', pd);
    ST.addEventListener('pointermove', pm);
    ST.addEventListener('pointerup', pu);
    ST.addEventListener('pointercancel', pu);
}
function unbindInput() {
    if (!ST) return;
    ST.removeEventListener('pointerdown', pd);
    ST.removeEventListener('pointermove', pm);
    ST.removeEventListener('pointerup', pu);
    ST.removeEventListener('pointercancel', pu);
}
function onKey(e) {
    if (!OV) return;
    const k = (e.key || '').toLowerCase();
    if (k === 'escape') { if (MODE === 'play') pause(); e.preventDefault(); return; }
    if (MODE !== 'play' || !P) return;
    if (k === ' ') { pause(); e.preventDefault(); return; }
    const lane = KEYS.indexOf(k);
    if (lane < 0 || e.repeat) return;
    e.preventDefault(); e.stopPropagation();
    const id = 'k' + lane;
    P.ptr[id] = { u: xOfLane(lane), hold: null, key: true };
    press(xOfLane(lane), id);
}
function onKeyUp(e) {
    if (!P) return;
    const lane = KEYS.indexOf((e.key || '').toLowerCase());
    if (lane < 0) return;
    pu({ pointerId: 'k' + lane });
}

// ==========================================
// 그리기
// ==========================================
const JTX = { c: ['CHARMING', '#ffe3f2', '#ff9ccf'], n: ['NORMAL', '#cfeaff', '#7ec8ff'], m: ['MISS', '#a3a3b3', '#6b6b7a'] };
function raf() {
    if (!OV) return;
    requestAnimationFrame(raf);
    if (MODE !== 'play' && MODE !== 'pause') { if (G2) G2.clearRect(0, 0, VW, VH); return; }
    const now = MODE === 'play' ? songMs() : (P.lastNow || 0);
    if (MODE === 'play') { P.lastNow = now; step(now); }
    draw(now);
}
function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// 건반 하나 — 가운데 (cx, cy) · 폭 w · 높이 h
function key(g, cx, cy, w, h, kind, glow) {
    const x = cx - w / 2, y = cy - h / 2;
    g.save();
    g.shadowColor = kind === 2 ? 'rgba(255,214,90,0.7)' : 'rgba(210,230,255,0.55)';
    g.shadowBlur = glow ? 18 : 8;
    const gr = g.createLinearGradient(0, y, 0, y + h);
    if (kind === 2) { gr.addColorStop(0, '#fff3b8'); gr.addColorStop(0.55, '#ffd34d'); gr.addColorStop(1, '#d99a12'); }
    else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#eef1f8'); gr.addColorStop(1, '#b8c2d6'); }
    g.fillStyle = gr;
    rr(g, x, y, w, h, Math.min(5, h * 0.3)); g.fill();
    g.shadowBlur = 0;
    g.strokeStyle = kind === 2 ? 'rgba(120,80,0,0.55)' : 'rgba(40,50,80,0.55)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x + 3, y + 2, w - 6, Math.max(1, h * 0.14));
    g.restore();
}
function draw(now) {
    const g = G2; if (!g || !L) return;
    const vis = 7000 / SET.speed;                     // 멀리서 판정선까지 걸리는 ms
    const pOf = function (t) { return 1 - (t - now) / vis; };
    const tnow = performance.now();
    g.clearRect(0, 0, VW, VH);
    // 바탕 — 까맣게 (2026-11-10 사용자 「표지 없이 까만색으로」)
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    // 바닥 — 원근 사다리꼴 (멀리 → 판정선)
    const s0 = scaleAt(0), y0 = yAt(s0);
    g.save();
    g.beginPath();
    g.moveTo(xAt(0, s0), y0); g.lineTo(xAt(1, s0), y0); g.lineTo(xAt(1, 1), L.yJ); g.lineTo(xAt(0, 1), L.yJ); g.closePath();
    const fl = g.createLinearGradient(0, y0, 0, L.yJ);
    fl.addColorStop(0, 'rgba(120,150,220,0.0)'); fl.addColorStop(1, 'rgba(140,170,240,0.13)');
    g.fillStyle = fl; g.fill();
    g.strokeStyle = 'rgba(190,210,255,0.18)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(xAt(0, s0), y0); g.lineTo(xAt(0, 1), L.yJ); g.moveTo(xAt(1, s0), y0); g.lineTo(xAt(1, 1), L.yJ); g.stroke();
    g.restore();
    // 마디 — 바닥을 가로지르는 희미한 줄
    const bars = P.chart.bars;
    g.strokeStyle = 'rgba(200,215,255,0.08)'; g.lineWidth = 1;
    for (let i = 0; i < bars.length; i++) {
        const p = pOf(bars[i]); if (p < 0 || p > 1) continue;
        const sc = scaleAt(p), y = yAt(sc);
        g.beginPath(); g.moveTo(xAt(0, sc), y); g.lineTo(xAt(1, sc), y); g.stroke();
    }
    // 판정선
    g.save();
    g.shadowColor = 'rgba(190,215,255,0.9)'; g.shadowBlur = 14;
    g.fillStyle = 'rgba(235,242,255,0.95)'; g.fillRect(L.lineL, L.yJ - 1.5, L.lineW, 3);
    g.restore();
    g.fillStyle = 'rgba(235,242,255,0.9)';
    [L.lineL, L.lineL + L.lineW].forEach(function (x) { g.beginPath(); g.arc(x, L.yJ, 4, 0, Math.PI * 2); g.fill(); });
    // 손가락 자리 — 판정선 위 은은한 빛
    Object.keys(P.ptr).forEach(function (id) {
        const q = P.ptr[id]; if (!q || q.u == null) return;
        const x = xAt(q.u, 1);
        const rg = g.createRadialGradient(x, L.yJ, 0, x, L.yJ, L.lineW * 0.07);
        rg.addColorStop(0, 'rgba(200,225,255,0.45)'); rg.addColorStop(1, 'rgba(200,225,255,0)');
        g.fillStyle = rg; g.fillRect(x - L.lineW * 0.07, L.yJ - L.lineW * 0.07, L.lineW * 0.14, L.lineW * 0.14);
    });
    // 슬라이드 줄 — 희미하게
    Object.keys(P.chains).forEach(function (c) {
        const ch = P.chains[c]; if (ch.length < 2) return;
        g.strokeStyle = 'rgba(255,214,90,0.28)'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); let st = false;
        for (let i = 0; i < ch.length; i++) {
            const n = ch[i]; const p = pOf(n.t); if (p < 0) break; if (n.done && i < ch.length - 1 && ch[i + 1].done) continue;
            const sc = scaleAt(Math.min(p, 1)); const x = xAt(n.x, sc), y = yAt(sc);
            if (!st) { g.moveTo(x, y); st = true; } else g.lineTo(x, y);
        }
        if (st) g.stroke();
    });
    // 노트 — 먼 것부터 (가까운 것이 위에)
    let last = P.head;
    while (last < P.notes.length && pOf(P.notes[last].t) >= 0) last++;
    for (let i = last - 1; i >= P.head; i--) {
        const n = P.notes[i];
        const p = pOf(n.t);
        if (n.k === 1) {
            if (n.tail) continue;
            const holding = n.done && n.j !== 'm' && n.hold != null;
            if (n.done && !holding) continue;
            const pe = Math.max(0, pOf(n.t + n.len));
            const ph = holding ? 1 : p;
            if (ph < 0) continue;
            // 띠 — 꼬리에서 머리까지 (원근으로 좁아진다)
            const steps = 10;
            g.beginPath();
            for (let q = 0; q <= steps; q++) { const pp = pe + (ph - pe) * q / steps; const sc = scaleAt(pp); const x = xAt(n.x - n.w * 0.32, sc); const y = yAt(sc); if (q === 0) g.moveTo(x, y); else g.lineTo(x, y); }
            for (let q = steps; q >= 0; q--) { const pp = pe + (ph - pe) * q / steps; const sc = scaleAt(pp); g.lineTo(xAt(n.x + n.w * 0.32, sc), yAt(sc)); }
            g.closePath();
            const ys = yAt(scaleAt(pe)), yh = yAt(scaleAt(ph));
            const bg2 = g.createLinearGradient(0, ys, 0, yh);
            bg2.addColorStop(0, holding ? 'rgba(210,230,255,0.25)' : 'rgba(200,215,245,0.15)');
            bg2.addColorStop(1, holding ? 'rgba(235,245,255,0.75)' : 'rgba(210,225,255,0.45)');
            g.fillStyle = bg2; g.fill();
            g.strokeStyle = holding ? 'rgba(255,255,255,0.8)' : 'rgba(220,232,255,0.45)'; g.lineWidth = 1.2; g.stroke();
            if (pe > 0) { const sc = scaleAt(pe); key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc * 0.7, L.nh * sc * 0.5, 0, false); }
            const sc = scaleAt(ph);
            key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc, L.nh * sc, 1, holding);
            continue;
        }
        if (n.done || p < 0 || p > 1.25) continue;
        const sc = scaleAt(p);
        key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc, L.nh * sc * (n.k === 2 ? 0.8 : 1), n.k, false);
    }
    // 맞힌 자리 — 번쩍 · 부서지는 빛
    P.fx.forEach(function (f) {
        const k = (tnow - f.at) / 260; if (k >= 1) return;
        const w = f.w * L.lineW * (1 + k * 0.5), x = xAt(f.x, 1);
        g.save(); g.globalAlpha = (1 - k) * 0.9;
        const c = f.k === 'c' ? '255,228,244' : '200,230,255';
        const rg = g.createRadialGradient(x, L.yJ, 0, x, L.yJ, w * 0.75);
        rg.addColorStop(0, 'rgba(' + c + ',0.95)'); rg.addColorStop(1, 'rgba(' + c + ',0)');
        g.fillStyle = rg; g.fillRect(x - w, L.yJ - w * 0.75, w * 2, w * 1.5);
        g.restore();
    });
    P.parts = P.parts.filter(function (q) { return tnow - q.at < 520; });
    P.parts.forEach(function (q) {
        const k = (tnow - q.at) / 520;
        const x = xAt(q.x + q.vx * k * 0.35, 1), y = L.yJ + q.vy * k * VH * 0.35 + k * k * VH * 0.25;
        g.fillStyle = q.k === 'c' ? 'rgba(255,225,240,' + (1 - k) + ')' : 'rgba(200,230,255,' + (1 - k) + ')';
        g.fillRect(x - 2, y - 2, 4, 4);
    });
    // 판정 글자 · 빠르게 / 늦게 · 콤보
    if (P.judge) {
        const k = (tnow - P.judge.at) / 520;
        if (k < 1) {
            const J = JTX[P.judge.k];
            g.save(); g.globalAlpha = 1 - k * k; g.textAlign = 'center';
            g.shadowColor = J[2]; g.shadowBlur = 12;
            g.fillStyle = J[1]; g.font = '600 ' + Math.round(VH * 0.055) + 'px Georgia, serif';
            g.fillText(J[0], VW / 2, L.yJ - VH * 0.17 - k * 8);
            if (P.judge.k === 'n' && P.judge.dt != null) {
                g.shadowBlur = 0; g.font = Math.round(VH * 0.03) + 'px sans-serif';
                g.fillStyle = P.judge.dt < 0 ? '#8fd0ff' : '#ffb38a';
                g.fillText(P.judge.dt < 0 ? 'FAST' : 'SLOW', VW / 2, L.yJ - VH * 0.17 + VH * 0.045 - k * 8);
            }
            g.restore();
        }
    }
    if (P.combo >= 5) {
        g.save(); g.textAlign = 'center';
        g.fillStyle = 'rgba(255,255,255,0.88)'; g.font = '300 ' + Math.round(VH * 0.1) + 'px Georgia, serif';
        g.fillText(String(P.combo), VW / 2, VH * 0.3);
        g.fillStyle = 'rgba(255,255,255,0.45)'; g.font = Math.round(VH * 0.026) + 'px Georgia, serif';
        g.fillText('C O M B O', VW / 2, VH * 0.3 + VH * 0.045);
        g.restore();
    }
    // 위 — 진행 · 정확도
    const prog = Math.max(0, Math.min(1, now / P.chart.dur));
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(0, 0, VW, 2);
    g.fillStyle = P.s.color; g.fillRect(0, 0, VW * prog, 2);
    const done = P.cnt.c + P.cnt.n + P.cnt.m;
    const acc = done ? (P.cnt.c + P.cnt.n * 0.6) / done * 100 : 100;
    g.textAlign = 'right'; g.textBaseline = 'top';
    g.fillStyle = '#fff'; g.font = '600 ' + Math.round(VH * 0.048) + 'px Georgia, serif';
    g.fillText(acc.toFixed(2) + '%', VW - 14, 10);
    g.font = Math.round(VH * 0.027) + 'px sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    g.fillText(P.s.title + ' · ' + D[1] + ' ' + P.chart.charts[P.d].level, VW - 14, 12 + VH * 0.055);
    g.textBaseline = 'alphabetic';
    if (now < 0) {
        g.save(); g.textAlign = 'center';
        g.fillStyle = 'rgba(255,255,255,' + Math.min(1, -now / 600) + ')'; g.font = '300 ' + Math.round(VH * 0.07) + 'px Georgia, serif';
        g.fillText(P.s.title, VW / 2, VH * 0.42);
        g.font = Math.round(VH * 0.03) + 'px Georgia, serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillText(P.s.artist, VW / 2, VH * 0.42 + VH * 0.06);
        g.restore();
    }
}

// ==========================================
// 끝
// ==========================================
function result() {
    if (!P || !OV) return;
    MODE = 'result';
    stopPlay();
    const sc = Math.round(P.score), pct = (sc / 10000).toFixed(2);
    const fc = P.cnt.m === 0, ac = fc && P.cnt.n === 0;
    const best = loadJ(BEST_KEY, {}), k = P.s.key + '/' + P.d, old = best[k];
    const newBest = !old || sc > old.score;
    if (newBest) best[k] = { score: sc, fc: fc, ap: ac, at: Date.now() };
    else { best[k].fc = old.fc || fc; best[k].ap = old.ap || ac; }
    saveJ(BEST_KEY, best);
    // 평균 타이밍 — 맞힌 터치 · 길게 누르기 머리
    const offs = P.offs.slice().sort(function (a, b) { return a - b; });
    const mid = offs.length ? offs[Math.floor(offs.length / 2)] : 0;
    const avg = offs.length >= 8 ? Math.round(mid) : null;
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    UI.innerHTML = '<div class="rg-bg"></div>'
        + '<div class="rg-modal" style="background:transparent"><div class="rg-box" style="padding:18px 28px;">'
        + '<div style="font-size:13px;color:#aab;">' + esc(P.s.title) + ' · <b style="color:' + D[3] + '">' + D[1] + ' ' + P.chart.charts[P.d].level + '</b></div>'
        + '<div class="rg-res"><div style="text-align:center;"><div class="rg-rank" style="font-family:Georgia,serif;font-weight:300;font-size:64px;color:#fff;">' + pct + '<small style="font-size:26px;">%</small></div>'
        + (ac ? '<div style="color:#ffc1e3;font-weight:bold;letter-spacing:3px;">ALL CHARMING</div>' : fc ? '<div style="color:#ffe066;font-weight:bold;letter-spacing:3px;">FULL COMBO</div>' : '')
        + (newBest ? '<div style="font-size:12px;color:#ffe066;">NEW BEST</div>' : '') + '</div>'
        + '<div class="rg-tbl"><div><b style="color:#ff9ccf">CHARMING</b>' + P.cnt.c + '</div><div><b style="color:#7ec8ff">NORMAL</b>' + P.cnt.n + '</div>'
        + '<div><b style="color:#a3a3b3">MISS</b>' + P.cnt.m + '</div><div><b>MAX COMBO</b>' + P.maxCombo + '</div>'
        + (avg != null ? '<div style="font-size:12px;color:#ccd;">평균 ' + (avg > 0 ? '+' : '') + avg + 'ms · ' + (Math.abs(avg) <= 12 ? '딱 맞음' : avg > 0 ? '늦게 누름' : '빠르게 누름') + '</div>' : '')
        + '</div></div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"><button class="rg-btn" data-k="re">다시</button><button class="rg-btn" data-k="q">곡 고르기</button>'
        + (avg != null && Math.abs(avg) > 12 ? '<button class="rg-btn" data-k="sync">싱크에 반영 (' + ((SET.offset + avg) > 0 ? '+' : '') + Math.max(-300, Math.min(300, SET.offset + avg)) + 'ms)</button>' : '')
        + '</div></div></div>';
    UI.querySelector('[data-k="re"]').onclick = function () { start(); };
    UI.querySelector('[data-k="q"]').onclick = function () { menu(); };
    const sy = UI.querySelector('[data-k="sync"]');
    if (sy) sy.onclick = function () { SET.offset = Math.max(-300, Math.min(300, SET.offset + avg)); saveSet(); sy.textContent = '싱크 ' + (SET.offset > 0 ? '+' : '') + SET.offset + 'ms 로 맞췄습니다'; sy.disabled = true; };
}

window.rhythmState = function () {
    console.log({ 모드: MODE, 곡: SET.song, 난이도: SET.diff, 속도: SET.speed, 싱크: SET.offset, 점수: P && Math.round(P.score), 콤보: P && P.combo, 판정: P && P.cnt, 소리: AU.ctx && AU.ctx.state });
};
window.rhythmDebug = { P: function () { return P; }, now: function () { return songMs(); }, mode: function () { return MODE; }, L: function () { return L; }, lag: function () { return AU.lag; }, headLag: headLag };   // 시험 · 콘솔
console.log('[🎵 리듬] rhythmOpen() — 상담사 전용');
})();
