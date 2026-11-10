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
//   그림  rhythm/<열쇠>.jpg       (곡에 들어 있던 표지)
//
//   ■ 화면 — 가로. 휴대폰을 세워 두면 화면을 돌려 그린다 (손가락 자리도 같이 돌린다).
//            들어갈 때 전체 화면 · 가로 고정을 해 본다 (되는 기기만).
//   ■ 노트
//     · 터치         내려오는 칸을 판정선에서 누른다
//     · 길게 누르기   누른 채 끝까지 — 머리와 꼬리를 따로 센다 · 손을 일찍 떼면 꼬리는 놓침
//     · 슬라이드     초록 마름모 — 손가락이 그 칸에 닿아 있으면 된다 (줄로 이어진 것을 손을 떼지 않고 쓸어 넘긴다)
//   ■ 판정   PERFECT ±45 ms · GREAT ±90 · GOOD ±130 · 그 뒤는 MISS (슬라이드는 ±110 안에 닿으면)
//   ■ 점수   1,000,000 점 만점 — PERFECT 100% · GREAT 75% · GOOD 40% · 길게 누르기는 머리 · 꼬리 둘로 센다
//   ■ 설정   속도 · 싱크(소리가 늦게 들리면 +) · 타격음 — 이 기기에 적어 둔다
//   ■ 기록   곡 · 난이도마다 최고 점수 — 이 기기에 (rgBest)
//   ■ 키보드 S D F J K L · 스페이스 = 멈춤 (컴퓨터에서 시험)
//
//   콘솔   rhythmOpen()

(function rhythm() {
'use strict';

const ADMIN = 'kario0987';
const SONGS = [
    { key: 'airplane', title: 'In the Airplane', artist: 'qltmxm403', audio: 'snd/rhythm-airplane.mp3', cover: 'rhythm/airplane.jpg', chart: 'rhythm/airplane.json', color: '#7ec8ff' },
    { key: 'client', title: '내담자 여러분께', artist: 'qltmxm403', audio: 'snd/rhythm-client.mp3', cover: 'rhythm/client.jpg', chart: 'rhythm/client.json', color: '#ffb3d1' }
];
const DIFFS = [['easy', 'EASY', '이지', '#5fd18a'], ['normal', 'NORMAL', '노말', '#ffc94a'], ['hard', 'HARD', '하드', '#ff5f73']];
const LANES = 6;
const W_PERFECT = 45, W_GREAT = 90, W_GOOD = 130, W_SLIDE = 110, W_SLIDE_P = 70;
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
const AU = { ctx: null, bufs: {}, src: null, gain: null, startAt: 0, click: null, sess: null };
function ctx() {
    if (!AU.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        AU.ctx = new C({ latencyHint: 'interactive' });
        AU.gain = AU.ctx.createGain(); AU.gain.gain.value = 1; AU.gain.connect(AU.ctx.destination);
        // 타격음 — 짧은 딸깍
        const sr = AU.ctx.sampleRate, n = Math.floor(sr * 0.03), b = AU.ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) { const t = i / sr; d[i] = (Math.sin(2 * Math.PI * 2100 * t) * 0.6 + (Math.random() * 2 - 1) * 0.25) * Math.exp(-t * 180); }
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
function songMs() {
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
    return (t - AU.startAt) * 1000 - (Number(SET.offset) || 0);
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
        '.rg-bg{position:absolute;inset:-30px;background-size:cover;background-position:center;filter:blur(18px) brightness(.35) saturate(1.2);transform:scale(1.08);}',
        '.rg-sel{position:absolute;inset:0;display:flex;gap:14px;padding:14px 18px;box-sizing:border-box;}',
        '.rg-col{display:flex;flex-direction:column;gap:10px;min-width:0;}',
        '.rg-h{font-size:12px;letter-spacing:4px;color:#9ab;opacity:.9;}',
        '.rg-song{display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);cursor:pointer;}',
        '.rg-song.on{background:rgba(255,255,255,.16);border-color:var(--c);box-shadow:0 0 14px -4px var(--c);}',
        '.rg-song img{width:52px;height:52px;border-radius:8px;object-fit:cover;flex-shrink:0;}',
        '.rg-song b{display:block;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.rg-song small{font-size:11px;color:#aab;}',
        '.rg-big{flex:1;display:flex;gap:16px;align-items:center;min-width:0;}',
        '.rg-jacket{width:min(36%,230px);aspect-ratio:1;height:auto;border-radius:14px;object-fit:cover;box-shadow:0 10px 40px rgba(0,0,0,.6);flex-shrink:0;}',
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
function bestOf(k, d) { const b = loadJ(BEST_KEY, {}); return b[k + '/' + d] || null; }
function menu() {
    MODE = 'menu';
    const s = song();
    const chart = CH[s.key];
    if (!chart) loadChart(s).then(function () { if (MODE === 'menu' && song().key === s.key) menu(); }).catch(function () { });
    const songs = SONGS.map(function (x) {
        return '<div class="rg-song' + (x.key === s.key ? ' on' : '') + '" data-song="' + x.key + '" style="--c:' + x.color + '"><img src="' + x.cover + '" alt=""><div style="min-width:0"><b>' + esc(x.title) + '</b><small>' + esc(x.artist) + '</small></div></div>';
    }).join('');
    const bpm = chart ? (Array.isArray(chart.bpm) ? chart.bpm[0] + '–' + chart.bpm[1] : chart.bpm) : '…';
    const len = chart ? Math.floor(chart.dur / 60000) + ':' + String(Math.floor(chart.dur / 1000) % 60).padStart(2, '0') : '';
    const diffs = DIFFS.map(function (d) {
        const c = chart && chart.charts[d[0]];
        const b = bestOf(s.key, d[0]);
        return '<button class="rg-diff' + (SET.diff === d[0] ? ' on' : '') + '" data-diff="' + d[0] + '" style="--c:' + d[3] + '"><b>' + d[1] + '</b><i>' + (c ? c.level : '·') + '</i><small>' + (c ? c.count + ' 노트' : '') + '</small>'
            + '<small>' + (b ? b.rank + ' · ' + b.score.toLocaleString() + (b.ap ? ' · AP' : b.fc ? ' · FC' : '') : '—') + '</small></button>';
    }).join('');
    UI.innerHTML = '<div class="rg-bg" style="background-image:url(\'' + s.cover + '\')"></div>'
        + '<button class="rg-btn rg-x" data-k="x">✕</button>'
        + '<div class="rg-sel">'
        + '<div class="rg-col" style="width:min(34%,240px);"><div class="rg-h">🎵 RHYTHM · 상담사 전용</div>' + songs + '<div style="flex:1"></div>'
        + '<div class="rg-row"><span>속도</span><span class="rg-step"><button data-k="sp-">−</button><span>' + SET.speed.toFixed(1) + '</span><button data-k="sp+">+</button></span></div>'
        + '<div class="rg-row"><span>싱크</span><span class="rg-step"><button data-k="of-">−</button><span>' + (SET.offset > 0 ? '+' : '') + SET.offset + 'ms</span><button data-k="of+">+</button></span>'
        + '<button class="rg-btn" data-k="hit" style="padding:6px 10px;font-size:12px;">타격음 ' + (SET.hit ? 'ON' : 'OFF') + '</button></div>'
        + '<div style="font-size:10px;color:#889;line-height:1.5;">소리가 노트보다 늦게 들리면 싱크를 + 로</div></div>'
        + '<div class="rg-big"><img class="rg-jacket" src="' + s.cover + '" alt=""><div class="rg-info">'
        + '<div class="rg-title">' + esc(s.title) + '</div><div style="font-size:12px;color:#aab;">' + esc(s.artist) + (chart ? ' · BPM ' + bpm + ' · ' + len : '') + '</div>'
        + '<div class="rg-diffs">' + diffs + '</div>'
        + '<div class="rg-row" style="font-size:11px;color:#99a;">⬜ 터치 · ▮ 길게 누르기 · ◆ 슬라이드(손가락이 닿아 있으면) · 키보드 S D F J K L</div>'
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
    UI.innerHTML = '<div class="rg-bg" style="background-image:url(\'' + s.cover + '\')"></div><div class="rg-load">불러오는 중…</div>';
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
        return { i: i, t: n[0], lane: n[1], k: n[2], len: n[2] === 1 ? n[3] : 0, ch: n[2] === 2 ? n[3] : 0, done: false, j: null, hold: null, tail: null, fx: 0 };
    });
    // 슬라이드 줄 — 같은 번호끼리 차례대로
    const chains = {};
    notes.forEach(function (n) { if (n.k === 2) (chains[n.ch] = chains[n.ch] || []).push(n); });
    const total = notes.reduce(function (a, n) { return a + (n.k === 1 ? 2 : 1); }, 0);
    P = { s: s, d: d, chart: chart, notes: notes, chains: chains, total: total, score: 0, combo: 0, maxCombo: 0,
          cnt: { p: 0, g: 0, gd: 0, m: 0 }, ptr: {}, keys: {}, flash: [], judge: null, fx: [], first: 0, ended: false, pauseAt: 0 };
    UI.innerHTML = '<button class="rg-pause" data-k="pause">❚❚</button>';
    UI.querySelector('[data-k="pause"]').onclick = function (e) { e.stopPropagation(); pause(); };
    bindInput();
    const cx = ctx();
    AU.src = cx.createBufferSource(); AU.src.buffer = buf; AU.src.connect(AU.gain);
    AU.startAt = cx.currentTime + LEAD;
    AU.src.start(AU.startAt);
    AU.src.onended = function () { if (P && MODE === 'play') P.audioEnd = true; };
    P.bg = new Image(); P.bg.src = s.cover;
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
        MODE = 'play';
    };
    m.querySelector('[data-k="re"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } start(); };
    m.querySelector('[data-k="q"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } menu(); };
}
function onVis() { if (document.hidden) pause(); }

// ==========================================
// 판정
// ==========================================
function addScore(kind) {
    const base = 1000000 / Math.max(1, P.total);
    const r = kind === 'p' ? 1 : kind === 'g' ? 0.75 : kind === 'gd' ? 0.4 : 0;
    P.score += base * r;
    P.cnt[kind]++;
    if (kind === 'm') P.combo = 0;
    else { P.combo++; if (P.combo > P.maxCombo) P.maxCombo = P.combo; }
    P.judge = { k: kind, at: performance.now() };
}
function gradeOf(dt) {
    const a = Math.abs(dt);
    return a <= W_PERFECT ? 'p' : a <= W_GREAT ? 'g' : a <= W_GOOD ? 'gd' : null;
}
function hitFx(lane, kind) {
    P.fx.push({ lane: lane, at: performance.now(), k: kind });
    if (P.fx.length > 40) P.fx.shift();
}
// 칸을 눌렀다
function press(lane, pid) {
    if (!P || MODE !== 'play') return;
    const now = songMs();
    P.flash[lane] = performance.now();
    // 그 칸에서 판정 안에 드는 가장 이른 터치 · 길게 누르기 머리
    let best = null;
    for (let i = 0; i < P.notes.length; i++) {
        const n = P.notes[i];
        if (n.done || n.k === 2 || n.lane !== lane) continue;
        const dt = now - n.t;
        if (dt < -W_GOOD) break;            // 아직 멀다 (시각 순)
        if (dt > W_GOOD) continue;
        best = n; break;
    }
    if (!best) return;
    const dt = now - best.t;
    const g = gradeOf(dt) || 'gd';
    best.done = true; best.j = g;
    addScore(g);
    hitFx(lane, g);
    playClick(0.32);
    if (best.k === 1) { best.hold = pid; P.ptr[pid] && (P.ptr[pid].hold = best); }
}
// 손을 뗐다 · 칸을 벗어났다
function releaseHold(n, now) {
    if (!n || n.tail) return;
    const end = n.t + n.len;
    if (now >= end - HOLD_EARLY_OK) { n.tail = 'p'; addScore('p'); hitFx(n.lane, 'p'); }
    else { n.tail = 'm'; addScore('m'); }
    n.hold = null;
}
function step(now) {
    // 슬라이드 — 손가락이 그 칸에 닿아 있으면
    const lanesDown = {};
    Object.keys(P.ptr).forEach(function (id) { const q = P.ptr[id]; if (q && q.lane != null) lanesDown[q.lane] = true; });
    Object.keys(P.keys).forEach(function (l) { if (P.keys[l]) lanesDown[l] = true; });
    for (let i = 0; i < P.notes.length; i++) {
        const n = P.notes[i];
        const dt = now - n.t;
        if (dt < -W_GOOD - 200) break;
        if (n.done) {
            // 길게 누르기 — 끝까지 눌렀으면 꼬리
            if (n.k === 1 && !n.tail) {
                if (n.j === 'm') { n.tail = 'm'; addScore('m'); continue; }
                const held = n.hold != null && !!P.ptr[n.hold] && P.ptr[n.hold].lane === n.lane;
                if (!held) releaseHold(n, now);
                else if (now >= n.t + n.len) releaseHold(n, now);
            }
            continue;
        }
        if (n.k === 2) {
            if (lanesDown[n.lane] && dt >= -W_SLIDE && dt <= W_SLIDE) {
                if (dt >= -60 || Math.abs(dt) <= W_SLIDE_P) {
                    n.done = true; n.j = Math.abs(dt) <= W_SLIDE_P ? 'p' : 'g';
                    addScore(n.j); hitFx(n.lane, n.j); playClick(0.18);
                }
            } else if (dt > W_SLIDE) { n.done = true; n.j = 'm'; addScore('m'); }
            continue;
        }
        if (dt > W_GOOD) {
            n.done = true; n.j = 'm'; addScore('m');
            if (n.k === 1) { n.tail = 'm'; addScore('m'); }
        }
    }
    // 끝
    const last = P.notes.length ? P.notes[P.notes.length - 1] : null;
    const lastEnd = last ? Math.max.apply(null, P.notes.slice(-20).map(function (n) { return n.t + (n.len || 0); })) : 0;
    if (!P.ended && (now > P.chart.dur + 600 || (P.audioEnd && now > lastEnd + 800))) {
        P.ended = true;
        setTimeout(result, 700);
    }
}

// ==========================================
// 손가락 · 키보드
// ==========================================
let L = null;        // 칸 자리 (그리기와 같은 값)
function layout() {
    if (!VW) return;
    const usable = Math.min(VW * 0.94, VH * 2.3);
    const laneW = usable / LANES;
    const left = (VW - usable) / 2;
    L = { left: left, laneW: laneW, right: left + usable, judgeY: VH * 0.83, top: 0 };
}
function laneAt(x) {
    if (!L) return null;
    let i = Math.floor((x - L.left) / L.laneW);
    if (x < L.left - L.laneW * 0.6 || x > L.right + L.laneW * 0.6) return null;
    return Math.max(0, Math.min(LANES - 1, i));
}
function pd(e) {
    if (MODE !== 'play' || !P) return;
    if (e.target && e.target.closest && e.target.closest('.rg-pause,.rg-modal')) return;
    e.preventDefault();
    const p = toStage(e.clientX, e.clientY);
    const lane = laneAt(p.x);
    P.ptr[e.pointerId] = { lane: lane, hold: null };
    try { ST.setPointerCapture && ST.setPointerCapture(e.pointerId); } catch (x) { }
    if (lane != null) press(lane, e.pointerId);
}
function pm(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const p = toStage(e.clientX, e.clientY);
    const lane = laneAt(p.x);
    const q = P.ptr[e.pointerId];
    if (lane !== q.lane) {
        // 길게 누르는 칸을 벗어났다 — 반 칸까지는 봐준다
        if (q.hold && L) {
            const cx = L.left + (q.hold.lane + 0.5) * L.laneW;
            if (Math.abs(p.x - cx) <= L.laneW * 1.05) { q.lane = q.hold.lane; return; }
        }
        q.lane = lane;
        if (lane != null) P.flash[lane] = performance.now();
    }
}
function pu(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const q = P.ptr[e.pointerId];
    delete P.ptr[e.pointerId];
    if (q.hold && MODE === 'play') releaseHold(q.hold, songMs());
}
// 무대 전체에서 받는다 — 위에 덮인 글자 칸(#rg-ui)을 눌러도 칸으로 간다 (단추 · 멈춤 창은 빼고)
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
    P.keys[lane] = true;
    const id = 'k' + lane;
    P.ptr[id] = { lane: lane, hold: null, key: true };
    press(lane, id);
}
function onKeyUp(e) {
    if (!P) return;
    const k = (e.key || '').toLowerCase();
    const lane = KEYS.indexOf(k);
    if (lane < 0) return;
    P.keys[lane] = false;
    pu({ pointerId: 'k' + lane });
}

// ==========================================
// 그리기
// ==========================================
const JTX = { p: ['PERFECT', '#9ff3ff'], g: ['GREAT', '#ffe066'], gd: ['GOOD', '#a8ff9a'], m: ['MISS', '#ff7a8a'] };
function raf() {
    if (!OV) return;
    requestAnimationFrame(raf);
    if (MODE !== 'play' && MODE !== 'pause') { if (G2) G2.clearRect(0, 0, VW, VH); return; }
    const now = MODE === 'play' ? songMs() : (P.lastNow || 0);
    if (MODE === 'play') { P.lastNow = now; step(now); }
    draw(now);
}
function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function draw(now) {
    const g = G2; if (!g || !L) return;
    const vis = 6000 / SET.speed;                     // 위에서 판정선까지 걸리는 ms
    const pxms = L.judgeY / vis;
    const yOf = function (t) { return L.judgeY - (t - now) * pxms; };
    g.clearRect(0, 0, VW, VH);
    // 바탕
    if (P.bg && P.bg.complete && P.bg.naturalWidth) {
        g.save(); g.globalAlpha = 0.18;
        const s = Math.max(VW, VH);
        g.drawImage(P.bg, (VW - s) / 2, (VH - s) / 2, s, s);
        g.restore();
    }
    g.fillStyle = 'rgba(5,6,14,0.72)'; g.fillRect(0, 0, VW, VH);
    // 칸
    for (let i = 0; i < LANES; i++) {
        const x = L.left + i * L.laneW;
        g.fillStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.055)';
        g.fillRect(x, 0, L.laneW, VH);
        const f = P.flash[i] ? Math.max(0, 1 - (performance.now() - P.flash[i]) / 220) : 0;
        const held = Object.keys(P.ptr).some(function (id) { return P.ptr[id] && P.ptr[id].lane === i; });
        const a = Math.max(f * 0.35, held ? 0.16 : 0);
        if (a > 0) {
            const gr = g.createLinearGradient(0, L.judgeY, 0, L.judgeY - VH * 0.55);
            gr.addColorStop(0, 'rgba(150,210,255,' + a + ')'); gr.addColorStop(1, 'rgba(150,210,255,0)');
            g.fillStyle = gr; g.fillRect(x, 0, L.laneW, L.judgeY);
        }
    }
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
    for (let i = 0; i <= LANES; i++) { const x = L.left + i * L.laneW; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, VH); g.stroke(); }
    // 마디 줄
    g.strokeStyle = 'rgba(255,255,255,0.10)';
    const bars = P.chart.bars;
    for (let i = 0; i < bars.length; i++) {
        const y = yOf(bars[i]);
        if (y < -2) continue; if (y > L.judgeY) continue;
        g.beginPath(); g.moveTo(L.left, y); g.lineTo(L.right, y); g.stroke();
    }
    // 판정선
    g.fillStyle = 'rgba(160,220,255,0.9)'; g.fillRect(L.left, L.judgeY - 2, L.right - L.left, 4);
    g.fillStyle = 'rgba(160,220,255,0.18)'; g.fillRect(L.left, L.judgeY + 2, L.right - L.left, VH - L.judgeY);
    // 칸 아래 글자 (키)
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.font = Math.round(Math.min(16, L.laneW * 0.22)) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < LANES; i++) g.fillText(KEYS[i].toUpperCase(), L.left + (i + 0.5) * L.laneW, L.judgeY + (VH - L.judgeY) / 2);

    const nh = Math.max(10, Math.min(22, VH * 0.035));
    const pad = L.laneW * 0.06;
    // 슬라이드 줄
    Object.keys(P.chains).forEach(function (c) {
        const ch = P.chains[c];
        g.strokeStyle = 'rgba(120,255,170,0.55)'; g.lineWidth = Math.max(4, L.laneW * 0.12); g.lineCap = 'round';
        g.beginPath();
        let started = false;
        for (let i = 0; i < ch.length; i++) {
            const n = ch[i];
            const y = yOf(n.t); const x = L.left + (n.lane + 0.5) * L.laneW;
            if (n.done && n.j !== 'm' && i < ch.length - 1 && ch[i + 1].done) continue;
            if (!started) { g.moveTo(x, Math.min(y, L.judgeY)); started = true; } else g.lineTo(x, y);
        }
        g.stroke();
    });
    // 노트 (뒤에서부터)
    for (let i = P.notes.length - 1; i >= 0; i--) {
        const n = P.notes[i];
        const y = yOf(n.t);
        const x = L.left + n.lane * L.laneW + pad, w = L.laneW - pad * 2;
        if (n.k === 1) {
            if (n.tail) continue;                                   // 끝났다
            const holding = n.done && n.j !== 'm' && n.hold != null;
            if (n.done && !holding) continue;
            const ye = yOf(n.t + n.len);
            const yh = holding ? L.judgeY : y;
            if (yh < -nh) continue;                                 // 아직 위
            const top = Math.max(-10, ye), bot = Math.min(VH, yh);
            if (bot > top) {
                const gr = g.createLinearGradient(0, top, 0, bot);
                gr.addColorStop(0, holding ? 'rgba(255,215,120,0.75)' : 'rgba(255,200,90,0.45)');
                gr.addColorStop(1, holding ? 'rgba(255,240,180,0.9)' : 'rgba(255,200,90,0.6)');
                g.fillStyle = gr;
                g.fillRect(x + w * 0.18, top, w * 0.64, bot - top);
            }
            if (ye > -nh) { g.fillStyle = '#ffd36a'; rr(g, x, ye - nh * 0.35, w, nh * 0.7, 4); g.fill(); }
            g.fillStyle = holding ? '#fff3c4' : '#ffbe3c';
            rr(g, x, yh - nh / 2, w, nh, 6); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2; g.stroke();
            continue;
        }
        if (n.done || y < -nh || y > VH + nh) continue;
        if (n.k === 2) {
            const cx = x + w / 2, r = Math.min(w * 0.32, nh * 0.95);
            g.fillStyle = '#62f5a0';
            g.beginPath(); g.moveTo(cx, y - r); g.lineTo(cx + r, y); g.lineTo(cx, y + r); g.lineTo(cx - r, y); g.closePath(); g.fill();
            g.strokeStyle = '#e8fff0'; g.lineWidth = 2; g.stroke();
            continue;
        }
        const gr = g.createLinearGradient(0, y - nh / 2, 0, y + nh / 2);
        gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8fd6ff');
        g.fillStyle = gr;
        rr(g, x, y - nh / 2, w, nh, 6); g.fill();
        g.strokeStyle = 'rgba(40,120,200,0.9)'; g.lineWidth = 2; g.stroke();
    }
    // 맞힌 자리 빛
    const tnow = performance.now();
    P.fx.forEach(function (f) {
        const k = (tnow - f.at) / 300; if (k >= 1) return;
        const cx = L.left + (f.lane + 0.5) * L.laneW;
        g.save(); g.globalAlpha = 1 - k;
        g.strokeStyle = f.k === 'p' ? '#9ff3ff' : f.k === 'g' ? '#ffe066' : '#a8ff9a'; g.lineWidth = 3;
        g.beginPath(); g.arc(cx, L.judgeY, L.laneW * (0.25 + k * 0.45), 0, Math.PI * 2); g.stroke();
        g.restore();
    });
    // 판정 글자 · 콤보
    if (P.judge) {
        const k = (tnow - P.judge.at) / 520;
        if (k < 1) {
            const J = JTX[P.judge.k];
            g.save(); g.globalAlpha = 1 - k * k;
            g.fillStyle = J[1]; g.font = 'bold ' + Math.round(VH * 0.065) + 'px sans-serif'; g.textAlign = 'center';
            g.fillText(J[0], VW / 2, L.judgeY - VH * 0.2 - k * 10);
            g.restore();
        }
    }
    if (P.combo >= 3) {
        g.fillStyle = 'rgba(255,255,255,0.9)'; g.font = 'bold ' + Math.round(VH * 0.11) + 'px sans-serif'; g.textAlign = 'center';
        g.fillText(String(P.combo), VW / 2, VH * 0.36);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = Math.round(VH * 0.03) + 'px sans-serif';
        g.fillText('COMBO', VW / 2, VH * 0.36 + VH * 0.045);
    }
    // 위 띠 — 진행 · 점수
    const prog = Math.max(0, Math.min(1, now / P.chart.dur));
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, VW, 3);
    g.fillStyle = P.s.color; g.fillRect(0, 0, VW * prog, 3);
    g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(VH * 0.045) + 'px sans-serif'; g.textAlign = 'right'; g.textBaseline = 'top';
    g.fillText(String(Math.round(P.score)).padStart(7, '0'), VW - 12, 10);
    g.font = Math.round(VH * 0.028) + 'px sans-serif'; g.fillStyle = 'rgba(255,255,255,0.6)';
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    g.fillText(P.s.title + ' · ' + D[1] + ' ' + P.chart.charts[P.d].level, VW - 12, 10 + VH * 0.052);
    g.textBaseline = 'alphabetic';
    if (now < 0) {
        g.fillStyle = 'rgba(255,255,255,0.75)'; g.font = 'bold ' + Math.round(VH * 0.06) + 'px sans-serif'; g.textAlign = 'center';
        g.fillText(now < -1200 ? 'READY' : 'GO!', VW / 2, VH * 0.5);
    }
}

// ==========================================
// 끝
// ==========================================
function rankOf(sc) { return sc >= 980000 ? 'SSS' : sc >= 950000 ? 'SS' : sc >= 920000 ? 'S' : sc >= 880000 ? 'A' : sc >= 800000 ? 'B' : sc >= 700000 ? 'C' : 'D'; }
const RANK_C = { SSS: '#fff6a8', SS: '#ffe066', S: '#ffd36a', A: '#9ff3ff', B: '#a8ff9a', C: '#d0c0ff', D: '#ff7a8a' };
function result() {
    if (!P || !OV) return;
    MODE = 'result';
    stopPlay();
    const sc = Math.round(P.score), rank = rankOf(sc);
    const fc = P.cnt.m === 0, ap = fc && P.cnt.g === 0 && P.cnt.gd === 0;
    const best = loadJ(BEST_KEY, {}), k = P.s.key + '/' + P.d, old = best[k];
    const newBest = !old || sc > old.score;
    if (newBest) best[k] = { score: sc, rank: rank, fc: fc, ap: ap, at: Date.now() };
    else if ((fc && !old.fc) || (ap && !old.ap)) { best[k].fc = old.fc || fc; best[k].ap = old.ap || ap; }
    saveJ(BEST_KEY, best);
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    UI.innerHTML = '<div class="rg-bg" style="background-image:url(\'' + P.s.cover + '\')"></div>'
        + '<div class="rg-modal" style="background:transparent"><div class="rg-box" style="padding:20px 28px;">'
        + '<div style="font-size:13px;color:#aab;">' + esc(P.s.title) + ' · <b style="color:' + D[3] + '">' + D[1] + ' ' + P.chart.charts[P.d].level + '</b></div>'
        + '<div class="rg-res"><div class="rg-rank" style="color:' + RANK_C[rank] + '">' + rank + '</div>'
        + '<div class="rg-tbl"><div style="font-size:26px;font-weight:bold;">' + sc.toLocaleString() + (newBest ? ' <small style="font-size:12px;color:#ffe066;">NEW BEST</small>' : '') + '</div>'
        + (ap ? '<div style="color:#9ff3ff;font-weight:bold;letter-spacing:2px;">ALL PERFECT</div>' : fc ? '<div style="color:#ffe066;font-weight:bold;letter-spacing:2px;">FULL COMBO</div>' : '')
        + '<div><b style="color:#9ff3ff">PERFECT</b>' + P.cnt.p + '</div><div><b style="color:#ffe066">GREAT</b>' + P.cnt.g + '</div>'
        + '<div><b style="color:#a8ff9a">GOOD</b>' + P.cnt.gd + '</div><div><b style="color:#ff7a8a">MISS</b>' + P.cnt.m + '</div>'
        + '<div><b>MAX COMBO</b>' + P.maxCombo + '</div></div></div>'
        + '<div style="display:flex;gap:10px;"><button class="rg-btn" data-k="re">다시</button><button class="rg-btn" data-k="q">곡 고르기</button></div>'
        + '</div></div>';
    UI.querySelector('[data-k="re"]').onclick = function () { start(); };
    UI.querySelector('[data-k="q"]').onclick = function () { menu(); };
}

window.rhythmState = function () {
    console.log({ 모드: MODE, 곡: SET.song, 난이도: SET.diff, 속도: SET.speed, 싱크: SET.offset, 점수: P && Math.round(P.score), 콤보: P && P.combo, 판정: P && P.cnt, 소리: AU.ctx && AU.ctx.state });
};
window.rhythmDebug = { P: function () { return P; }, now: function () { return songMs(); }, mode: function () { return MODE; } };   // 시험 · 콘솔
console.log('[🎵 리듬] rhythmOpen() — 상담사 전용');
})();
