// ==========================================
// ★ 사택 리듬 게임 — 「새벽 네 시의 복도」
// bundles.json 마지막 그룹, secretbox.js 뒤
// ==========================================
//
// ■ 소리는 파일이 아니라 **그 자리에서 만든다**
//
//   mp3 를 넣으면 저작권을 봐야 하고, 한 곡이 묶음보다 커지고, 받아 오는 동안
//   박자가 어긋난다. 그래서 WebAudio 로 직접 만든다.
//
//       · 저작권이 없다 — 여기서 만든 소리다
//       · 묶음이 안 커진다 — 음원 파일이 없다
//       · **박자가 정확하다** — 아래가 핵심이다
//
//   가장 중요한 것은 시계다. 화면 그리는 때(performance.now)로 셈을 돌리면
//   소리와 조금씩 어긋난다. 그래서 **오디오 시계(AudioContext.currentTime)를
//   게임 시계로 쓴다.** 소리가 한 박 울릴 때 장애물도 정확히 그 자리에 온다.
//
//   소리를 자동으로 틀지 못하게 막혀 있으므로 스테이지를 고르는 그 누름에서
//   깨운다. 소리가 아예 안 되는 곳에서는 화면 시계로 돌아간다 — 놀 수는 있다.
//
// ■ 박자와 뜀을 묶어 둔다
//
//       한 박 = 135px (BEAT_PX) 로 고정
//       스테이지마다 분당 박(BPM)이 다르고, 속도 = BPM/60 × 135
//       **뜀은 항상 1.5 박** — 중력과 뛰는 힘을 BPM 에 맞춰 다시 셈한다
//
//   그래서 빠른 스테이지에서도 「한 박 띄운 가시는 한 번에」가 그대로 통한다.
//   손맛이 스테이지마다 달라지지 않는다.
//
// ■ 스테이지는 여덟 박짜리 구절을 이어 붙여 짠다
//
//   한 판이 1분 30초~2분 30초다. 장애물이 300개를 넘으므로 하나씩 찍을 수 없다.
//   그래서 여덟 박(= 두 마디)짜리 구절을 열여섯 가지 만들어 두고, 스테이지는
//   그 이름을 늘어놓은 것으로 적는다. 마디에 맞춰 떨어지니 소리와도 맞는다.
//
// ■ 물리는 1/240초씩 끊어 돈다
//
//   화면이 몇 번 그려지든 셈은 같다. 느린 기기에서도 같은 곳에서 죽고,
//   아래의 「깰 수 있는지 검사」가 실제 놀이와 같아진다.
//
// ■ 깰 수 있다는 증거
//
//   손으로 짠 배치는 사람이 못 깨는 것이 되기 쉽다. 그래서 봇을 같이 둔다.
//   앞을 내다보고 뛸 때와 안 뛸 때를 굴려 본 뒤 오래 사는 쪽을 고른다.
//   봇이 끝까지 가면 그 입력이 곧 증거다.
//
//       geoBot()       다섯 개 전부 깨 보게 한다
//       geoBot(3)      3 스테이지만
//
// ■ 보상
//
//   **처음 깰 때만** 준다. 10만 · 20만 · 30만 · 50만 · 90만 — 모두 200만 P.
//
// ■ 어디서 여나
//
//   L 등급 사택에서만. 「들어간다」를 누르면 손전화에서는 가로 전체화면으로 연다.
//
// ■ 확인
//
//   geoOpen()      바로 연다
//   geoState()     깬 스테이지 · 길이 · 분당 박
//   geoBot(n)      봇이 깨 보게 한다
//   geoPeek()      지금 상태를 들여다본다 (읽기만)

(function geoDash() {

// ==========================================
// 숫자
// ==========================================
const W = 960, H = 380;            // 그리는 판 (CSS 로 늘린다)
const GROUND = 300;
const SIZE = 28;
const BEAT_PX = 135;               // 한 박의 거리
const JUMP_BEATS = 1.5;            // 떠 있는 동안 가는 박
const JUMP_H = 104;                // 뜀의 꼭대기 높이
const STEP = 1 / 240;
const PAD = 5;                     // 가시 판정은 조금 너그럽게

const COL = {
    sky:'#0f0a06', far:'#1b1209', ground:'#2a1b0e', line:'#5a3f22',
    me:'#c79a5b', meEdge:'#f3e6d2', spike:'#a8443a', block:'#3a2a18',
    blockEdge:'#6a4f2a', text:'#f3e6d2', dim:'#8a7a63', good:'#7fbf6a', beat:'#3a2a18'
};

// ==========================================
// 구절 — 여덟 박짜리 조각
// ==========================================
//
//   s 가시 · b 발판(높이) · g 구덩이(너비)
//   숫자는 구절 안에서의 박 자리(0~7)다.
const PHRASE = {
    '.':  [],                                                   // 쉼
    a:  [['s',2]],
    b:  [['s',2],['s',6]],
    c:  [['s',1],['s',3],['s',5]],
    d:  [['s',2],['s',3]],                                      // 붙은 둘
    e:  [['s',1],['s',2],['s',5],['s',6]],
    f:  [['g',3,1]],
    g:  [['g',2,1],['s',6]],
    h:  [['g',1,1],['g',5,1]],
    i:  [['b',3,1]],
    j:  [['b',3,2],['s',7]],
    k:  [['b',2,1],['b',4,2]],                                  // 계단
    l:  [['s',1],['g',4,1],['s',7]],
    m:  [['s',1],['s',2],['g',5,1],['s',7]],
    n:  [['b',1,2],['s',5],['s',6]],
    o:  [['s',0],['s',2],['s',4],['s',6]],                      // 네 박마다
    p:  [['s',1],['s',2],['b',5,2],['s',7]]
};

// 스테이지 — 구절 이름을 늘어놓는다. 한 글자가 여덟 박이다.
//   bpm 으로 속도와 길이가 정해진다. 길이(초) = 구절수 × 8 × 60 / bpm
const STAGES = [
    { name:'첫 출근',        bpm:128, pay:100000,
      seq:'.babic.ciaba.icdci.babic.' },

    { name:'복도의 끝',      bpm:136, pay:200000,
      seq:'.dicgd.fjgcb.fcdic.dgbdi.gdcfj.' },

    { name:'계단은 없다',    bpm:144, pay:300000,
      seq:'.dikjg.cjfnd.dkfjd.cfknc.ikjgd.jfndc.' },

    { name:'네 시의 창',     bpm:152, pay:500000,
      seq:'.gjlnc.lnkmo.djlkn.jlkml.dgjkn.mlnkl.ndjlk.' },

    { name:'아무도 없는 층', bpm:160, pay:900000,
      seq:'.mnope.omlpo.emnlp.npmlp.nemol.eopml.eneno.pnopm.' }
];

// 구절 이름을 늘어놓은 글에서 장애물 표를 만든다 ('.' 도 한 구절이다)
function expand(seq) {
    const obs = [];
    let bar = 0;
    for (let i = 0; i < seq.length; i++) {
        const ch = seq[i];
        const ph = PHRASE[ch];
        if (!ph) continue;                       // 모르는 글자는 건너뛴다
        ph.forEach(function (o) {
            obs.push([o[0], bar * 8 + o[1], o[2]]);
        });
        bar++;
    }
    return { obs: obs, beats: bar * 8 };
}
STAGES.forEach(function (st) {
    const e = expand(st.seq);
    st.obs = e.obs;
    st.beats = e.beats + 6;                       // 끝에 숨 돌릴 자리
    st.spd = st.bpm / 60 * BEAT_PX;
    st.secs = st.beats * 60 / st.bpm;
});
window.GEO_STAGES = STAGES;

// ==========================================
// 생김새 — 박을 px 로
// ==========================================
function build(st) {
    const sp = [], bl = [], gp = [];
    (st.obs || []).forEach(function (o) {
        const x = o[1] * BEAT_PX;
        if (o[0] === 's') sp.push({ x: x, w: 32 });
        else if (o[0] === 'b') bl.push({ x: x, w: BEAT_PX * 0.8, h: (o[2] || 1) * SIZE });
        else if (o[0] === 'g') gp.push({ x: x, w: (o[2] || 1) * BEAT_PX * 0.58 });
    });
    // 뜀은 늘 1.5 박 — BPM 에 맞춰 중력을 다시 셈한다
    const T = JUMP_BEATS * 60 / st.bpm;
    const G = 8 * JUMP_H / (T * T);
    const V0 = G * T / 2;
    return { sp: sp, bl: bl, gp: gp, end: st.beats * BEAT_PX, spd: st.spd,
             G: G, V0: V0, bpm: st.bpm };
}

function inGap(L, x) {
    for (let i = 0; i < L.gp.length; i++) {
        const g = L.gp[i];
        if (x > g.x && x < g.x + g.w) return true;
    }
    return false;
}
function floorAt(L, x0, x1) {
    let top = null;
    for (let i = 0; i < L.bl.length; i++) {
        const b = L.bl[i];
        if (x1 > b.x && x0 < b.x + b.w) { if (top === null || b.h > top) top = b.h; }
    }
    if (top !== null) return top;
    if (inGap(L, x0) && inGap(L, x1)) return null;
    if (inGap(L, (x0 + x1) / 2)) return null;
    return 0;
}

// ==========================================
// 셈 — 한 걸음
// ==========================================
function step(L, s, hold) {
    if (s.dead || s.done) return s;
    if (hold && s.on) { s.vy = L.V0; s.on = false; }

    s.x += L.spd * STEP;
    s.vy -= L.G * STEP;
    s.y += s.vy * STEP;

    const x0 = s.x, x1 = s.x + SIZE;
    const f = floorAt(L, x0, x1);

    if (f === null) {
        s.on = false;
        if (s.y < -SIZE * 2) { s.dead = true; return s; }
    } else if (s.y <= f && s.vy <= 0) {
        s.y = f; s.vy = 0; s.on = true;
    } else s.on = false;

    for (let i = 0; i < L.bl.length; i++) {
        const b = L.bl[i];
        if (x1 > b.x + 2 && x0 < b.x + b.w - 2 && s.y < b.h - 3 && s.y + SIZE > 0) {
            s.dead = true; return s;
        }
    }
    for (let i = 0; i < L.sp.length; i++) {
        const k = L.sp[i];
        if (x1 - PAD > k.x && x0 + PAD < k.x + k.w && s.y < SIZE - PAD) { s.dead = true; return s; }
    }
    if (s.x >= L.end) s.done = true;
    return s;
}
function fresh() { return { x: 0, y: 0, vy: 0, on: true, dead: false, done: false }; }
window.geoSimStep = step; window.geoSimBuild = build; window.geoSimFresh = fresh;

// ==========================================
// 봇
// ==========================================
function needJump(L, s) {
    const look = L.spd * 0.33;
    const a = s.x + SIZE, b = a + look;
    for (let i = 0; i < L.sp.length; i++) {
        const k = L.sp[i];
        if (k.x < b && k.x + k.w > a - 2 && s.y < SIZE) return true;
    }
    for (let i = 0; i < L.gp.length; i++) {
        const g = L.gp[i];
        if (g.x < b && g.x + g.w > a - 2) return true;
    }
    for (let i = 0; i < L.bl.length; i++) {
        const bk = L.bl[i];
        if (bk.x < b && bk.x + bk.w > a - 2 && bk.h > s.y + 3) return true;
    }
    return false;
}
function rollout(L, s, first, horizon) {
    const t = { x: s.x, y: s.y, vy: s.vy, on: s.on, dead: false, done: false };
    const n = Math.round(horizon / STEP);
    let press = first;
    for (let i = 0; i < n; i++) {
        step(L, t, press);
        press = false;
        if (t.dead) return { far: t.x, dead: true };
        if (t.done) return { far: t.x, dead: false };
        if (t.on && i > 2) press = needJump(L, t);
    }
    return { far: t.x, dead: false };
}
function botRun(st) {
    const L = build(st), s = fresh();
    let jumps = 0, guard = 0;
    const hz = 1.9 * 60 / st.bpm * 4;                  // 네 박쯤 내다본다
    while (!s.dead && !s.done && guard++ < 1500000) {
        let press = false;
        if (s.on) {
            const no = rollout(L, s, false, hz);
            if (no.dead) { press = rollout(L, s, true, hz).far >= no.far; }
            else if (needJump(L, s)) { press = rollout(L, s, true, hz).far >= no.far; }
        }
        if (press) jumps++;
        step(L, s, press);
    }
    return { done: !!s.done, pct: Math.min(100, Math.round(s.x / L.end * 100)), jumps: jumps };
}
window.geoBot = function (n) {
    const list = n ? [STAGES[n - 1]] : STAGES;
    const rows = list.map(function (st, i) {
        const r = botRun(st);
        return { 스테이지: (n || i + 1) + '. ' + st.name,
                 결과: r.done ? '깸' : '못 깸', 도달: r.pct + '%',
                 길이: Math.round(st.secs) + '초', 분당박: st.bpm,
                 장애물: st.obs.length + '개', 누른횟수: r.jumps };
    });
    console.log('%c===== 봇이 깨 본 결과 =====', 'color:#c79a5b; font-size:13px');
    console.table(rows);
    const bad = rows.filter(function (r) { return r.결과 !== '깸'; });
    if (bad.length) console.warn('  못 깬 스테이지가 있습니다 — 배치를 손봐야 합니다.');
    else console.log('%c  다섯 개 모두 깰 수 있습니다.', 'color:#7fbf6a');
    return rows;
};

// ==========================================
// 소리 — 그 자리에서 만든다
// ==========================================
//
// 네 가지만 쓴다. 킥·스네어·하이햇·베이스. 그리고 네 마디마다 짧은 선율.
// 25ms 마다 깨어나 0.12초 앞까지 미리 예약한다 (WebAudio 의 보통 방식).
let AC = null, master = null, musicOn = true;

function ac() {
    if (AC) return AC;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try {
        AC = new C();
        master = AC.createGain();
        master.gain.value = 0.22;
        master.connect(AC.destination);
    } catch (e) { AC = null; }
    return AC;
}

function env(node, t, a, d, peak) {
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(peak, t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function kick(t) {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
    env(g, t, 0.004, 0.22, 1.0);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.3);
}
let noiseBuf = null;
function noise() {
    if (noiseBuf) return noiseBuf;
    const n = AC.sampleRate * 0.4;
    noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
}
function snare(t) {
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noise();
    f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8;
    env(g, t, 0.004, 0.16, 0.5);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.25);
}
function hat(t, loud) {
    const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noise();
    f.type = 'highpass'; f.frequency.value = 7800;
    env(g, t, 0.002, loud ? 0.05 : 0.03, loud ? 0.22 : 0.12);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.1);
}
function tone(t, hz, dur, type, vol) {
    const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter();
    o.type = type || 'square';
    o.frequency.setValueAtTime(hz, t);
    f.type = 'lowpass'; f.frequency.value = 2200;
    env(g, t, 0.01, dur, vol || 0.18);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
}

// 단조 — 어둑한 복도에 맞게
const ROOT = [110.00, 130.81, 98.00, 146.83];          // A2 C3 G2 D3 (마디마다)
const LEAD = [440.00, 523.25, 493.88, 587.33, 523.25, 440.00, 392.00, 440.00];

function playBeat(t, beat, bpm) {
    if (!AC || !musicOn) return;
    const bar = Math.floor(beat / 4) % 4;
    const inBar = beat % 4;
    const bt = 60 / bpm;

    if (inBar === 0 || inBar === 2) kick(t);
    if (inBar === 1 || inBar === 3) snare(t);
    hat(t, inBar === 0);
    hat(t + bt / 2, false);

    const root = ROOT[bar];
    if (inBar === 0) tone(t, root, bt * 0.9, 'square', 0.14);
    else if (inBar === 2) tone(t, root * 1.5, bt * 0.45, 'square', 0.10);

    // 여덟 박마다 선율 한 조각
    if (beat % 8 === 0) {
        const n = LEAD[(Math.floor(beat / 8)) % LEAD.length];
        tone(t + bt * 0.5, n, bt * 0.8, 'triangle', 0.08);
    }
}

// ==========================================
// 놀이 상태
// ==========================================
let run = null;

function stop() {
    if (run && run.raf) cancelAnimationFrame(run.raf);
    if (run) { run.raf = 0; if (run.sched) { clearInterval(run.sched); run.sched = 0; } }
}

function restart() {
    if (!run) return;
    run.s = fresh();
    run.tries++;
    run.simT = 0;
    run.t0 = clock();
    run.nextBeat = 0;
    if (run.sched) { clearInterval(run.sched); run.sched = 0; }
    if (run.useAudio) run.sched = setInterval(scheduler, 25);
    run.over = false;
    run.hold = false;
}

// 시계. 오디오가 **정말 돌기 시작한 뒤에만** 오디오 시계를 쓴다.
//
//   resume() 은 비동기다. 아직 멈춰 있는 오디오의 currentTime 은 늘어나지
//   않으므로, 그것을 시계로 삼으면 화면이 그 자리에서 굳는다. 그래서 처음에는
//   화면 시계로 돌다가, 오디오가 깨어나면 그 순간 **한 번만** 기준을 옮긴다.
//   simT 는 그대로 두므로 눈에 띄는 끊김이 없다.
function clock() {
    return (AC && run && run.useAudio) ? AC.currentTime : performance.now() / 1000;
}
function maybeSwitch() {
    if (!run || run.useAudio || !AC || AC.state !== 'running' || !run.wantAudio) return;
    run.useAudio = true;
    run.t0 = AC.currentTime - run.simT;              // 기준만 옮긴다
    run.nextBeat = Math.max(0, Math.floor(run.simT / (60 / run.L.bpm)));
    if (!run.sched) run.sched = setInterval(scheduler, 25);
}

// ==========================================
// 그리기
// ==========================================
function draw(ctx, r) {
    const L = r.L, s = r.s;
    const cam = Math.max(0, s.x - 190);

    ctx.fillStyle = COL.sky; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = COL.far; ctx.lineWidth = 1;
    const first = Math.floor(cam / BEAT_PX) * BEAT_PX;
    for (let x = first; x < cam + W + BEAT_PX; x += BEAT_PX) {
        const sx = x - cam;
        const isBar = Math.round(x / BEAT_PX) % 4 === 0;
        ctx.strokeStyle = isBar ? COL.line : COL.far;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    }

    ctx.fillStyle = COL.ground; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = COL.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

    ctx.fillStyle = COL.sky;
    L.gp.forEach(function (g) {
        const sx = g.x - cam;
        if (sx > W || sx + g.w < 0) return;
        ctx.fillRect(sx, GROUND, g.w, H - GROUND);
    });

    L.bl.forEach(function (b) {
        const sx = b.x - cam;
        if (sx > W || sx + b.w < 0) return;
        ctx.fillStyle = COL.block; ctx.fillRect(sx, GROUND - b.h, b.w, b.h);
        ctx.strokeStyle = COL.blockEdge; ctx.lineWidth = 2;
        ctx.strokeRect(sx + 1, GROUND - b.h + 1, b.w - 2, b.h - 2);
    });

    ctx.fillStyle = COL.spike;
    L.sp.forEach(function (k) {
        const sx = k.x - cam;
        if (sx > W || sx + k.w < 0) return;
        ctx.beginPath();
        ctx.moveTo(sx, GROUND);
        ctx.lineTo(sx + k.w / 2, GROUND - SIZE - 6);
        ctx.lineTo(sx + k.w, GROUND);
        ctx.closePath(); ctx.fill();
    });

    const ex = L.end - cam;
    if (ex < W + 40) {
        ctx.strokeStyle = COL.good; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ex, 0); ctx.lineTo(ex, GROUND); ctx.stroke();
    }

    const px = s.x - cam, py = GROUND - SIZE - s.y;
    ctx.save();
    ctx.translate(px + SIZE / 2, py + SIZE / 2);
    if (!s.on) ctx.rotate(-s.x / 95);
    ctx.fillStyle = COL.me; ctx.fillRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE);
    ctx.strokeStyle = COL.meEdge; ctx.lineWidth = 2;
    ctx.strokeRect(-SIZE / 2 + 1, -SIZE / 2 + 1, SIZE - 2, SIZE - 2);
    ctx.restore();

    // 박자 눈금 — 소리가 안 들려도 눈으로 박이 보인다
    const beatNow = s.x / BEAT_PX;
    const frac = beatNow - Math.floor(beatNow);
    const pulse = 1 - frac;
    ctx.fillStyle = COL.me;
    ctx.globalAlpha = 0.25 + pulse * 0.55;
    ctx.fillRect(W / 2 - 26, H - 16, 52, 6);
    ctx.globalAlpha = 1;

    const pct = Math.min(1, s.x / L.end);
    ctx.fillStyle = '#00000088'; ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = COL.me; ctx.fillRect(0, 0, W * pct, 18);
    ctx.fillStyle = COL.text; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(pct * 100) + '%', W / 2, 14);
    ctx.textAlign = 'left';
    ctx.fillStyle = COL.dim; ctx.font = '12px sans-serif';
    ctx.fillText('시도 ' + r.tries + '회 · 최고 ' + r.best + '%'
        + (r.useAudio ? '' : ' · 소리 꺼짐'), 10, 36);
}

// ==========================================
// 고리
// ==========================================
function tick() {
    if (!run) return;
    run.raf = requestAnimationFrame(tick);
    maybeSwitch();

    const now = clock();
    let want = now - run.t0;
    if (want < 0) want = 0;
    // 창을 가렸다 돌아오면 한꺼번에 몰아 돌지 않는다
    if (want - run.simT > 0.5) { run.t0 = now - run.simT - 0.5; want = run.simT + 0.5; }

    while (run.simT < want) {
        run.simT += STEP;
        if (!run.s.dead && !run.s.done) step(run.L, run.s, run.hold);
    }
    draw(run.ctx, run);

    const pct = Math.min(100, Math.round(run.s.x / run.L.end * 100));
    if (pct > run.best) run.best = pct;

    if (run.s.done && !run.over) { run.over = true; finish(); }
    else if (run.s.dead && !run.over) {
        run.over = true;
        setTimeout(function () { if (run && run.s.dead) restart(); }, 400);
    }
}

// 소리를 미리 예약한다
function scheduler() {
    if (!run || !AC || !run.useAudio || !musicOn) return;
    const ahead = AC.currentTime + 0.14;
    const bt = 60 / run.L.bpm;
    while (run.t0 + run.nextBeat * bt < ahead) {
        playBeat(run.t0 + run.nextBeat * bt, run.nextBeat, run.L.bpm);
        run.nextBeat++;
        if (run.nextBeat > 4000) break;
    }
}

// ==========================================
// 끝
// ==========================================
const TITLE = '새벽 네 시의 복도';

function finish() {
    stop();
    const st = STAGES[run.stage];
    const u = currentUser;
    const idx = run.stage + 1;

    if (!u.geoClear) u.geoClear = {};
    const first = !u.geoClear[idx];
    if (first) {
        u.geoClear[idx] = true;
        if (typeof changePoints === 'function') changePoints(st.pay);
        else u.points = (u.points || 0) + st.pay;
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(u, '[' + TITLE + '] ' + idx + '. ' + st.name + ' 클리어 (+'
                + st.pay.toLocaleString() + ' P)');
        }
        if (typeof saveFields === 'function') saveFields({ geoClear: 1, history: 1, points: 1 });
    } else if (typeof saveFields === 'function') saveFields({ geoClear: 1 });
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }

    const box = document.getElementById('geo-msg');
    if (box) {
        box.innerHTML = '<div style="color:' + COL.good + '; font-weight:bold; font-size:15px;">'
            + '통과 — ' + idx + '. ' + st.name + '</div>'
            + '<div style="font-size:12px; color:' + COL.dim + '; margin-top:5px;">'
            + (first ? ('+' + st.pay.toLocaleString() + ' P · 시도 ' + run.tries + '회')
                     : ('이미 깬 스테이지라 포인트는 없습니다 · 시도 ' + run.tries + '회')) + '</div>';
    }
    paintList();
}

// ==========================================
// 전체화면 · 가로
// ==========================================
function isPhone() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}
function goFull(el) {
    try {
        const f = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (f) {
            const r = f.call(el);
            if (r && r.then) r.then(lockWide, function () { });
            else lockWide();
        }
    } catch (e) { }
}
function lockWide() {
    try {
        if (screen.orientation && screen.orientation.lock) {
            const r = screen.orientation.lock('landscape');
            if (r && r.catch) r.catch(function () { });
        }
    } catch (e) { }
}
function unFull() {
    try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
    } catch (e) { }
    try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            const x = document.exitFullscreen || document.webkitExitFullscreen;
            if (x) x.call(document);
        }
    } catch (e) { }
}

// ==========================================
// 창
// ==========================================
function shut() {
    stop(); run = null;
    unFull();
    Array.prototype.forEach.call(document.querySelectorAll('.geo-modal'), function (x) { x.remove(); });
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keyup', onKeyUp);
}
function onKey(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault(); if (run) run.hold = true;
    }
    if (e.key === 'Escape') shut();
}
function onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') { if (run) run.hold = false; }
}
function cleared(i) { return !!((currentUser || {}).geoClear || {})[i]; }

function paintList() {
    const el = document.getElementById('geo-list');
    if (!el) return;
    el.innerHTML = STAGES.map(function (st, i) {
        const n = i + 1, ok = cleared(n), open = n === 1 || cleared(n - 1);
        const mm = Math.floor(st.secs / 60), ss = Math.round(st.secs % 60);
        return '<button class="geo-pick game-btn" data-n="' + n + '"' + (open ? '' : ' disabled')
            + ' style="width:100%; margin:0 0 6px 0; padding:11px; font-size:12px; text-align:left;'
            + (open ? '' : ' opacity:.35;') + '">'
            + '<span style="color:' + (ok ? COL.good : COL.me) + '; font-weight:bold;">'
            + n + '. ' + st.name + (ok ? '  ✓' : '') + '</span>'
            + '<div style="font-size:10px; color:' + COL.dim + '; margin-top:3px; font-weight:normal;">'
            + mm + '분 ' + (ss < 10 ? '0' : '') + ss + '초 · 분당 ' + st.bpm + '박 · 장애물 '
            + st.obs.length + '개<br>'
            + (open ? (ok ? '깼습니다 · 다시 해도 포인트는 없습니다'
                          : ('처음 깨면 +' + st.pay.toLocaleString() + ' P'))
                    : '앞 스테이지를 먼저 깨야 합니다')
            + '</div></button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.geo-pick'), function (b) {
        b.onclick = function () { play(parseInt(b.getAttribute('data-n'), 10) - 1); };
    });
}

function play(i) {
    const st = STAGES[i];
    if (!st) return;
    const wrap = document.getElementById('geo-play');
    const list = document.getElementById('geo-listwrap');
    if (!wrap || !list) return;
    list.style.display = 'none';
    wrap.style.display = 'block';
    document.getElementById('geo-title').innerText = (i + 1) + '. ' + st.name;
    document.getElementById('geo-msg').innerHTML =
        '<span style="font-size:11px; color:' + COL.dim + ';">'
        + '눌러서 뜁니다. 누르고 있으면 닿자마자 또 뜁니다.</span>';

    // 소리를 깨운다 (이 누름이 곧 사용자의 동작이다).
    // 깨어나는 것은 비동기이므로, 돌기 시작할 때까지는 화면 시계로 돈다.
    const c = ac();
    if (c) { try { if (c.state === 'suspended') c.resume(); } catch (e) { } }

    const cv = document.getElementById('geo-canvas');
    run = { L: build(st), s: fresh(), stage: i, tries: 1, best: 0,
            ctx: cv.getContext('2d'), raf: 0, hold: false, over: false,
            simT: 0, nextBeat: 0, useAudio: false, wantAudio: !!c, sched: 0 };
    run.t0 = clock();
    run.raf = requestAnimationFrame(tick);
    maybeSwitch();
}

function back() {
    stop(); run = null;
    const wrap = document.getElementById('geo-play');
    const list = document.getElementById('geo-listwrap');
    if (wrap) wrap.style.display = 'none';
    if (list) list.style.display = 'block';
    paintList();
}

window.geoOpen = function (full) {
    if (!currentUser) return;
    shut();
    const w = document.createElement('div');
    w.className = 'geo-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:100030; display:flex; align-items:center;'
        + ' justify-content:center; background:#000; padding:10px;';
    w.innerHTML =
        '<div id="geo-box" style="background:linear-gradient(145deg,#17120d,#0b0806); border:1px solid '
      + COL.line + '; border-radius:10px; padding:12px; max-width:1000px; width:100%;'
      + ' max-height:96vh; display:flex; flex-direction:column;">'
      + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:9px;">'
      + '<span style="font-size:14px; font-weight:bold; color:' + COL.me + ';">' + TITLE + '</span>'
      + '<div style="display:flex; gap:6px;">'
      + '<button id="geo-snd" class="game-btn" style="margin:0; padding:6px 10px; font-size:11px;">♪ 소리</button>'
      + '<button id="geo-x" class="game-btn" style="margin:0; padding:6px 12px; font-size:11px;'
      + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">닫는다</button>'
      + '</div></div>'

      + '<div id="geo-listwrap">'
      + '<div style="font-size:10px; color:' + COL.dim + '; margin-bottom:10px; line-height:1.7;">'
      + '저절로 앞으로 갑니다. 눌러서 뛰고, 가시에 닿거나 구덩이에 빠지면 처음부터입니다.<br>'
      + '소리는 이 자리에서 만들어 냅니다. 장애물은 모두 박자 위에 놓여 있습니다.</div>'
      + '<div id="geo-list" style="overflow-y:auto;"></div></div>'

      + '<div id="geo-play" style="display:none;">'
      + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">'
      + '<span id="geo-title" style="font-size:12px; color:' + COL.text + ';"></span>'
      + '<button id="geo-back" class="game-btn" style="margin:0; padding:5px 10px; font-size:10px;'
      + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">목록</button>'
      + '</div>'
      + '<canvas id="geo-canvas" width="' + W + '" height="' + H + '"'
      + ' style="width:100%; height:auto; display:block; border:1px solid ' + COL.line + ';'
      + ' border-radius:6px; touch-action:none; background:' + COL.sky + ';"></canvas>'
      + '<div id="geo-msg" style="margin-top:8px; min-height:36px;"></div>'
      + '</div></div>';
    document.body.appendChild(w);

    w.querySelector('#geo-x').onclick = shut;
    w.querySelector('#geo-back').onclick = back;
    const snd = w.querySelector('#geo-snd');
    snd.onclick = function () {
        musicOn = !musicOn;
        snd.innerText = musicOn ? '♪ 소리' : '♪ 끔';
        if (master) master.gain.value = musicOn ? 0.22 : 0;
    };

    const cv = w.querySelector('#geo-canvas');
    const down = function (e) { e.preventDefault(); if (run) run.hold = true; };
    const up = function (e) { e.preventDefault(); if (run) run.hold = false; };
    cv.addEventListener('mousedown', down);
    cv.addEventListener('mouseup', up);
    cv.addEventListener('mouseleave', up);
    cv.addEventListener('touchstart', down, { passive: false });
    cv.addEventListener('touchend', up, { passive: false });
    cv.addEventListener('touchcancel', up, { passive: false });
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);

    if (full !== false && isPhone()) goFull(w);
    paintList();
};

// ==========================================
// 사택 칸 — L 등급에서만
// ==========================================
function isL() {
    try { return typeof houseGrade === 'function' && houseGrade(currentUser) === 'L'; }
    catch (e) { return false; }
}
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._geo) { clearInterval(iv); return; }
        const _r = renderHouse;
        const wrapped = function () {
            const out = _r.apply(this, arguments);
            try {
                if (!isL()) return out;
                const box = document.getElementById('house-main-body');
                if (!box || box.querySelector('#geo-entry')) return out;
                const done = STAGES.filter(function (s, i) { return cleared(i + 1); }).length;
                const d = document.createElement('div');
                d.id = 'geo-entry';
                d.style.cssText = 'background:linear-gradient(145deg,#1e1710,#120d08); border:1px solid '
                    + COL.line + '; border-radius:8px; padding:14px; margin-top:14px;';
                d.innerHTML =
                    '<div style="font-size:10px; color:' + COL.me + '; letter-spacing:1px;">관사 전용</div>'
                  + '<div style="font-size:15px; color:#fff; font-weight:bold; margin-top:4px;">' + TITLE + '</div>'
                  + '<div style="font-size:11px; color:#999; margin-top:6px; line-height:1.6;">'
                  + '복도 끝까지 가면 됩니다. 스테이지 다섯 · 깬 것 ' + done + '개<br>'
                  + '<span style="font-size:10px; color:#777;">손전화에서는 가로 전체화면으로 열립니다.</span></div>'
                  + '<button id="geo-go" class="game-btn" style="width:100%; margin-top:10px; padding:11px;">들어간다</button>';
                box.appendChild(d);
                d.querySelector('#geo-go').onclick = function () { window.geoOpen(); };
            } catch (e) { console.warn('[복도] 사택 칸 건너뜀:', e && e.message); }
            return out;
        };
        wrapped._geo = true;
        renderHouse = wrapped;
        clearInterval(iv);
        console.log('[복도] 사택(L)에 ' + TITLE + ' 칸을 붙였습니다');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.geoPeek = function () {
    if (!run) return null;
    return { stage: run.stage + 1, x: run.s.x, y: run.s.y, on: run.s.on,
             dead: run.s.dead, done: run.s.done, tries: run.tries, best: run.best,
             end: run.L.end, spd: run.L.spd, bpm: run.L.bpm, 소리: !!run.useAudio };
};

window.geoState = function () {
    console.log('%c===== ' + TITLE + ' =====', 'color:#c79a5b; font-size:13px');
    console.log('  사택 등급:', (typeof houseGrade === 'function' ? houseGrade(currentUser) : '?'),
        '· 열리나:', isL() ? 'O' : '✗ (L 등급 사택에서만)');
    console.table(STAGES.map(function (st, i) {
        const mm = Math.floor(st.secs / 60), ss = Math.round(st.secs % 60);
        return { 스테이지: (i + 1) + '. ' + st.name, 깸: cleared(i + 1) ? 'O' : '-',
                 길이: mm + '분 ' + (ss < 10 ? '0' : '') + ss + '초',
                 분당박: st.bpm, 속도: Math.round(st.spd) + 'px/s',
                 장애물: st.obs.length + '개', 보상: st.pay.toLocaleString() + ' P' };
    }));
    const got = STAGES.reduce(function (a, s, i) { return a + (cleared(i + 1) ? s.pay : 0); }, 0);
    const all = STAGES.reduce(function (a, s) { return a + s.pay; }, 0);
    console.log('  받은 포인트:', got.toLocaleString() + ' / ' + all.toLocaleString() + ' P');
    console.log('  소리:', (window.AudioContext || window.webkitAudioContext) ? '만들 수 있습니다' : '이 기기에서는 안 됩니다');
};

console.log('[복도] geoOpen() · geoState() · geoBot()');

})();
