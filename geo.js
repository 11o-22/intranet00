// ==========================================
// ★ 사택 리듬 게임 — 「새벽 네 시의 복도」
// bundles.json 마지막 그룹, secretbox.js 뒤
// ==========================================
//
// ■ 무엇인가
//
//   저절로 앞으로 가고, 누르면 뛴다. 가시에 닿거나 구덩이에 빠지면 처음부터.
//   스테이지 다섯. 음악은 없고 **박자만** 쓴다.
//
// ■ 박자를 어떻게 쓰나
//
//   소리를 틀면 기기마다 어긋나고 자동 재생도 막힌다. 그래서 소리 대신
//   **거리로 박자를 잡는다.**
//
//       한 박 = 135px (BEAT_PX) 로 고정
//       스테이지 속도가 270px/s 면 → 분당 120 박
//
//   장애물은 전부 「몇 번째 박」에만 놓는다. 그러니 눌러야 하는 때가 고르게
//   떨어지고, 화면 아래 박자 눈금이 같이 뛰어서 손이 박자를 탄다.
//
//   뛰는 시간도 박에 맞춰 두었다. 한 번 뛰면 0.75초 떠 있고 그동안 1.5 박을
//   간다. 그래서 한 박 띄워 놓인 가시는 한 번 뛰면 넘고, 붙어 있는 가시 둘은
//   정확히 그 사이에서 떠야 넘는다.
//
// ■ 물리는 고정 간격으로 돈다
//
//   화면이 몇 번 그려지든 셈은 1/240초씩 끊어 돈다. 그래야 느린 기기에서도
//   같은 곳에서 죽고, 아래의 「깰 수 있는지 검사」가 실제 놀이와 같아진다.
//
// ■ 스테이지가 정말 깰 수 있는 것인가
//
//   손으로 찍은 배치는 사람이 못 깨는 것이 되기 쉽다. 그래서 **봇**을 같이
//   둔다. 봇은 앞을 조금 내다보고, 뛰었을 때와 안 뛰었을 때를 각각 굴려 본 뒤
//   오래 사는 쪽을 고른다. 봇이 끝까지 가면 그 입력이 곧 깰 수 있다는 증거다.
//
//       geoBot(1)      1 스테이지를 봇이 깨 보게 한다
//       geoBot()       다섯 개 전부
//
// ■ 보상
//
//   **처음 깰 때만** 포인트를 준다. 두 번째부터는 기록만 남는다.
//   스테이지 다섯을 다 깨면 모두 75,000 P.
//
// ■ 어디서 여나
//
//   L 등급 사택에서만 열린다. 사택 화면 아래에 칸이 하나 생긴다.
//   (상담사 · 상담사의 동거인 · 찢어진 메모지를 쓴 사원)
//
// ■ 확인
//
//   geoOpen()      바로 연다
//   geoState()     깬 스테이지 · 최고 기록
//   geoBot(n)      봇이 깨 보게 한다

(function geoDash() {

// ==========================================
// 숫자
// ==========================================
const W = 640, H = 260;            // 그리는 판의 크기 (CSS 로 늘린다)
const GROUND = 200;                // 바닥 높이 (판 위에서 아래로)
const SIZE = 26;                   // 네모의 한 변
const BEAT_PX = 135;               // 한 박의 거리
const G = 1350;                    // 중력 px/s²
const V0 = 506;                    // 뛸 때의 처음 속도 (떠 있는 시간 0.75초)
const STEP = 1 / 240;              // 셈을 끊어 도는 간격
const PAD = 4;                     // 가시 판정은 조금 너그럽게

const COL = {
    sky:'#0f0a06', far:'#1b1209', ground:'#2a1b0e', line:'#5a3f22',
    me:'#c79a5b', meEdge:'#f3e6d2', spike:'#a8443a', block:'#3a2a18',
    blockEdge:'#6a4f2a', text:'#f3e6d2', dim:'#8a7a63', good:'#7fbf6a'
};

// ==========================================
// 스테이지
// ==========================================
//
//   s  가시      [ 's', 박 ]
//   b  발판      [ 'b', 박, 높이(칸) ]          — 위에 올라설 수 있다
//   g  구덩이    [ 'g', 박, 너비(박) ]          — 빠지면 죽는다
//
//   높이 한 칸은 네모 한 변(26px)이다.
const STAGES = [
    { name: '첫 출근',       spd: 270, beats: 44, pay: 5000,
      obs: [ ['s',6], ['s',10], ['s',14], ['b',19,1], ['s',24], ['s',26],
             ['b',31,1], ['s',36], ['s',38], ['s',40] ] },

    { name: '복도의 끝',     spd: 290, beats: 52, pay: 8000,
      obs: [ ['s',5], ['s',7], ['g',11,1], ['s',15], ['b',19,1], ['s',22],
             ['s',24], ['g',28,1], ['b',32,2], ['s',37], ['s',39], ['s',41],
             ['g',45,1], ['s',49] ] },

    { name: '계단은 없다',   spd: 310, beats: 58, pay: 12000,
      obs: [ ['s',5], ['b',9,1], ['b',11,2], ['s',15], ['s',17], ['g',21,1],
             ['s',25], ['s',27], ['s',29], ['b',33,2], ['g',38,1], ['s',42],
             ['s',44], ['b',48,1], ['s',52], ['s',54] ] },

    { name: '네 시의 창',    spd: 330, beats: 64, pay: 20000,
      obs: [ ['s',4], ['s',6], ['g',10,1], ['s',14], ['b',18,2], ['s',22],
             ['s',24], ['s',26], ['g',30,1], ['b',34,1], ['b',36,2],
             ['s',40], ['s',42], ['g',46,1], ['s',50], ['s',52], ['s',54],
             ['b',58,2] ] },

    { name: '아무도 없는 층', spd: 350, beats: 72, pay: 30000,
      obs: [ ['s',4], ['s',6], ['s',8], ['g',12,1], ['b',16,2], ['s',20],
             ['s',22], ['g',26,1], ['s',30], ['s',32], ['s',34], ['b',38,2],
             ['g',42,1], ['s',46], ['s',48], ['b',52,1], ['b',54,2],
             ['s',58], ['s',60], ['g',64,1], ['s',68] ] }
];
window.GEO_STAGES = STAGES;

// ==========================================
// 생김새 — 박을 px 로 바꾼다
// ==========================================
function build(st) {
    const sp = [], bl = [], gp = [];
    (st.obs || []).forEach(function (o) {
        const x = o[1] * BEAT_PX;
        if (o[0] === 's') sp.push({ x: x, w: 30 });
        else if (o[0] === 'b') bl.push({ x: x, w: BEAT_PX * 0.8, h: (o[2] || 1) * SIZE });
        else if (o[0] === 'g') gp.push({ x: x, w: (o[2] || 1) * BEAT_PX * 0.55 });
    });
    return { sp: sp, bl: bl, gp: gp, end: st.beats * BEAT_PX, spd: st.spd };
}

function inGap(L, x) {
    for (let i = 0; i < L.gp.length; i++) {
        const g = L.gp[i];
        if (x > g.x && x < g.x + g.w) return true;
    }
    return false;
}

// 그 x 에서 설 수 있는 바닥의 높이 (바닥이 없으면 null)
function floorAt(L, x0, x1) {
    let top = null;
    for (let i = 0; i < L.bl.length; i++) {
        const b = L.bl[i];
        if (x1 > b.x && x0 < b.x + b.w) {
            const t = b.h;
            if (top === null || t > top) top = t;
        }
    }
    if (top !== null) return top;
    // 구덩이 위가 아니면 땅
    if (inGap(L, x0) && inGap(L, x1)) return null;
    if (inGap(L, (x0 + x1) / 2)) return null;
    return 0;
}

// ==========================================
// 셈 — 한 걸음
// ==========================================
//
//   s = { x, y, vy, on, dead, done }
//   y 는 바닥에서 띄운 높이 (위가 +)
function step(L, s, hold) {
    if (s.dead || s.done) return s;

    // 뛴다 — 땅에 붙어 있을 때만. 누르고 있으면 닿자마자 또 뛴다.
    if (hold && s.on) { s.vy = V0; s.on = false; }

    s.x += L.spd * STEP;
    s.vy -= G * STEP;
    s.y += s.vy * STEP;

    const x0 = s.x, x1 = s.x + SIZE;
    const f = floorAt(L, x0, x1);

    if (f === null) {
        // 구덩이 — 바닥이 없다. 떨어지면 죽는다.
        s.on = false;
        if (s.y < -SIZE * 2) { s.dead = true; return s; }
    } else if (s.y <= f && s.vy <= 0) {
        s.y = f; s.vy = 0; s.on = true;
    } else {
        s.on = false;
    }

    // 발판 옆구리에 박으면 죽는다
    for (let i = 0; i < L.bl.length; i++) {
        const b = L.bl[i];
        if (x1 > b.x + 2 && x0 < b.x + b.w - 2 && s.y < b.h - 3 && s.y + SIZE > 0) {
            s.dead = true; return s;
        }
    }

    // 가시
    for (let i = 0; i < L.sp.length; i++) {
        const k = L.sp[i];
        if (x1 - PAD > k.x && x0 + PAD < k.x + k.w && s.y < SIZE - PAD) {
            s.dead = true; return s;
        }
    }

    if (s.x >= L.end) s.done = true;
    return s;
}

function fresh() { return { x: 0, y: 0, vy: 0, on: true, dead: false, done: false }; }

// ==========================================
// 봇 — 이 스테이지를 깰 수 있는가
// ==========================================
//
// 땅에 붙어 있을 때마다 「지금 뛴다」와 「안 뛴다」를 각각 끝까지(또는 1.6초)
// 굴려 보고 오래 사는 쪽을 고른다. 끝까지 가면 그 입력이 곧 증거다.
function rollout(L, s, first, horizon) {
    const t = { x: s.x, y: s.y, vy: s.vy, on: s.on, dead: false, done: false };
    let n = Math.round(horizon / STEP);
    let press = first;
    for (let i = 0; i < n; i++) {
        step(L, t, press);
        press = false;                       // 첫 걸음에만 누른다
        if (t.dead) return { far: t.x, dead: true, done: false };
        if (t.done) return { far: t.x, dead: false, done: true };
        // 땅에 닿으면 그 뒤로는 「필요할 때 뛴다」로 이어 본다
        if (t.on && i > 2) press = needJump(L, t);
    }
    return { far: t.x, dead: false, done: false };
}

// 코앞에 위험이 있으면 뛴다 (아주 단순한 눈)
function needJump(L, s) {
    const look = L.spd * 0.34;                // 0.34초 앞
    const a = s.x + SIZE, b = s.x + SIZE + look;
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

function botRun(st) {
    const L = build(st);
    const s = fresh();
    const moves = [];
    let guard = 0;
    while (!s.dead && !s.done && guard++ < 200000) {
        let press = false;
        if (s.on) {
            const no = rollout(L, s, false, 1.6);
            if (no.dead) {
                const yes = rollout(L, s, true, 1.6);
                press = (yes.far >= no.far);
            } else {
                press = needJump(L, s) && rollout(L, s, true, 1.6).far >= no.far;
            }
        }
        if (press) moves.push(Math.round(s.x));
        step(L, s, press);
    }
    return { done: !!s.done, x: Math.round(s.x), end: L.end,
             pct: Math.min(100, Math.round(s.x / L.end * 100)), jumps: moves.length };
}
window.geoSimStep = step;
window.geoSimBuild = build;
window.geoSimFresh = fresh;

window.geoBot = function (n) {
    const list = n ? [STAGES[n - 1]] : STAGES;
    const rows = list.map(function (st, i) {
        const r = botRun(st);
        return { 스테이지: (n || i + 1) + '. ' + st.name,
                 결과: r.done ? '깸' : '못 깸',
                 도달: r.pct + '%', 누른횟수: r.jumps };
    });
    console.log('%c===== 봇이 깨 본 결과 =====', 'color:#c79a5b; font-size:13px');
    console.table(rows);
    const bad = rows.filter(function (r) { return r.결과 !== '깸'; });
    if (bad.length) console.warn('  못 깬 스테이지가 있습니다 — 배치를 손봐야 합니다.');
    else console.log('%c  다섯 개 모두 깰 수 있습니다.', 'color:#7fbf6a');
    return rows;
};

// ==========================================
// 그리기
// ==========================================
let run = null;                      // { L, s, stage, tries, best, raf, last, acc, hold }

function draw(ctx, r) {
    const L = r.L, s = r.s;
    const cam = Math.max(0, s.x - 150);

    ctx.fillStyle = COL.sky; ctx.fillRect(0, 0, W, H);

    // 뒤쪽 세로줄 — 박자에 맞춰 흐른다
    ctx.strokeStyle = COL.far; ctx.lineWidth = 1;
    const first = Math.floor(cam / BEAT_PX) * BEAT_PX;
    for (let x = first; x < cam + W + BEAT_PX; x += BEAT_PX) {
        const sx = x - cam;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    }

    // 땅
    ctx.fillStyle = COL.ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.strokeStyle = COL.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

    // 구덩이는 땅을 도려낸다
    ctx.fillStyle = COL.sky;
    L.gp.forEach(function (g) {
        const sx = g.x - cam;
        if (sx > W || sx + g.w < 0) return;
        ctx.fillRect(sx, GROUND, g.w, H - GROUND);
    });

    // 발판
    L.bl.forEach(function (b) {
        const sx = b.x - cam;
        if (sx > W || sx + b.w < 0) return;
        ctx.fillStyle = COL.block;
        ctx.fillRect(sx, GROUND - b.h, b.w, b.h);
        ctx.strokeStyle = COL.blockEdge; ctx.lineWidth = 2;
        ctx.strokeRect(sx + 1, GROUND - b.h + 1, b.w - 2, b.h - 2);
    });

    // 가시
    ctx.fillStyle = COL.spike;
    L.sp.forEach(function (k) {
        const sx = k.x - cam;
        if (sx > W || sx + k.w < 0) return;
        ctx.beginPath();
        ctx.moveTo(sx, GROUND);
        ctx.lineTo(sx + k.w / 2, GROUND - SIZE - 4);
        ctx.lineTo(sx + k.w, GROUND);
        ctx.closePath(); ctx.fill();
    });

    // 끝 선
    const ex = L.end - cam;
    if (ex < W + 40) {
        ctx.strokeStyle = COL.good; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ex, 0); ctx.lineTo(ex, GROUND); ctx.stroke();
    }

    // 나
    const px = s.x - cam, py = GROUND - SIZE - s.y;
    ctx.save();
    ctx.translate(px + SIZE / 2, py + SIZE / 2);
    if (!s.on) ctx.rotate(-s.x / 90);              // 떠 있는 동안 돈다
    ctx.fillStyle = COL.me;
    ctx.fillRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE);
    ctx.strokeStyle = COL.meEdge; ctx.lineWidth = 2;
    ctx.strokeRect(-SIZE / 2 + 1, -SIZE / 2 + 1, SIZE - 2, SIZE - 2);
    ctx.restore();

    // 위쪽 진행 막대
    const pct = Math.min(1, s.x / L.end);
    ctx.fillStyle = '#00000088'; ctx.fillRect(0, 0, W, 16);
    ctx.fillStyle = COL.me; ctx.fillRect(0, 0, W * pct, 16);
    ctx.fillStyle = COL.text; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(Math.round(pct * 100) + '%', W / 2, 12);
    ctx.textAlign = 'left';
    ctx.fillStyle = COL.dim; ctx.font = '11px sans-serif';
    ctx.fillText('시도 ' + r.tries + '회 · 최고 ' + r.best + '%', 8, 32);
}

// ==========================================
// 놀이
// ==========================================
function stop() {
    if (run && run.raf) cancelAnimationFrame(run.raf);
    if (run) run.raf = 0;
}

function restart() {
    if (!run) return;
    run.s = fresh();
    run.tries++;
    run.acc = 0;
    run.last = 0;
    run.hold = false;
    run.over = false;
}

function tick(now) {
    if (!run) return;
    run.raf = requestAnimationFrame(tick);
    const ctx = run.ctx;
    if (!run.last) run.last = now;
    let dt = (now - run.last) / 1000;
    run.last = now;
    if (dt > 0.25) dt = 0.25;                  // 창을 가렸다 돌아왔을 때
    run.acc += dt;

    while (run.acc >= STEP) {
        run.acc -= STEP;
        if (!run.s.dead && !run.s.done) step(run.L, run.s, run.hold);
    }
    draw(ctx, run);

    const pct = Math.min(100, Math.round(run.s.x / run.L.end * 100));
    if (pct > run.best) run.best = pct;

    if (run.s.done && !run.over) { run.over = true; finish(true); }
    else if (run.s.dead && !run.over) { run.over = true; setTimeout(function () {
        if (run && run.s.dead) restart();
    }, 420); }
}

function finish(won) {
    if (!won) return;
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
    } else {
        if (typeof saveFields === 'function') saveFields({ geoClear: 1 });
    }
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }

    const box = document.getElementById('geo-msg');
    if (box) {
        box.innerHTML = '<div style="color:' + COL.good + '; font-weight:bold; font-size:14px;">'
            + '통과 — ' + idx + '. ' + st.name + '</div>'
            + '<div style="font-size:11px; color:' + COL.dim + '; margin-top:5px;">'
            + (first ? ('+' + st.pay.toLocaleString() + ' P · 시도 ' + run.tries + '회')
                     : ('이미 깬 스테이지라 포인트는 없습니다 · 시도 ' + run.tries + '회')) + '</div>';
    }
    paintList();
}

// ==========================================
// 창
// ==========================================
const TITLE = '새벽 네 시의 복도';

function shut() {
    stop(); run = null;
    Array.prototype.forEach.call(document.querySelectorAll('.geo-modal'), function (x) { x.remove(); });
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('keyup', onKeyUp);
}
function onKey(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        if (run) run.hold = true;
    }
    if (e.key === 'Escape') shut();
}
function onKeyUp(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') { if (run) run.hold = false; }
}

function cleared(i) {
    return !!((currentUser || {}).geoClear || {})[i];
}

function paintList() {
    const el = document.getElementById('geo-list');
    if (!el) return;
    el.innerHTML = STAGES.map(function (st, i) {
        const n = i + 1, ok = cleared(n);
        const open = n === 1 || cleared(n - 1);
        return '<button class="geo-pick game-btn" data-n="' + n + '"' + (open ? '' : ' disabled')
            + ' style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px; text-align:left;'
            + (open ? '' : ' opacity:.35;') + '">'
            + '<span style="color:' + (ok ? COL.good : COL.me) + '; font-weight:bold;">'
            + n + '. ' + st.name + (ok ? '  ✓' : '') + '</span>'
            + '<div style="font-size:10px; color:' + COL.dim + '; margin-top:3px; font-weight:normal;">'
            + (open
                ? (ok ? '깼습니다 · 다시 해도 포인트는 없습니다'
                      : ('처음 깨면 +' + st.pay.toLocaleString() + ' P'))
                : ('앞 스테이지를 먼저 깨야 합니다'))
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
        '<span style="font-size:11px; color:' + COL.dim + ';">눌러서 뜁니다. 누르고 있으면 닿자마자 또 뜁니다.</span>';

    const cv = document.getElementById('geo-canvas');
    run = { L: build(st), s: fresh(), stage: i, tries: 1, best: 0,
            ctx: cv.getContext('2d'), raf: 0, last: 0, acc: 0, hold: false, over: false };
    run.raf = requestAnimationFrame(tick);
}

function back() {
    stop(); run = null;
    const wrap = document.getElementById('geo-play');
    const list = document.getElementById('geo-listwrap');
    if (wrap) wrap.style.display = 'none';
    if (list) list.style.display = 'block';
    paintList();
}

window.geoOpen = function () {
    if (!currentUser) return;
    shut();
    const w = document.createElement('div');
    w.className = 'geo-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:100030; display:flex; align-items:center;'
        + ' justify-content:center; background:rgba(0,0,0,0.86); padding:14px;';
    w.innerHTML =
        '<div style="background:linear-gradient(145deg,#17120d,#0b0806); border:1px solid ' + COL.line + ';'
      + ' border-radius:10px; padding:14px; max-width:680px; width:100%; max-height:92vh;'
      + ' display:flex; flex-direction:column;">'

      + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">'
      + '<span style="font-size:14px; font-weight:bold; color:' + COL.me + ';">' + TITLE + '</span>'
      + '<button id="geo-x" class="game-btn" style="margin:0; padding:6px 12px; font-size:11px;'
      + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">닫는다</button>'
      + '</div>'

      + '<div id="geo-listwrap">'
      + '<div style="font-size:10px; color:' + COL.dim + '; margin-bottom:10px; line-height:1.7;">'
      + '저절로 앞으로 갑니다. 눌러서 뛰고, 가시에 닿거나 구덩이에 빠지면 처음부터입니다.<br>'
      + '소리는 없습니다. 장애물이 모두 박자 위에 놓여 있습니다.</div>'
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
      + '<div id="geo-msg" style="margin-top:8px; min-height:34px;"></div>'
      + '</div>'

      + '</div>';
    document.body.appendChild(w);

    w.querySelector('#geo-x').onclick = shut;
    w.querySelector('#geo-back').onclick = back;

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

    paintList();
};

// ==========================================
// 사택에 칸을 붙인다 — L 등급에서만
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
                  + '복도 끝까지 가면 됩니다. 스테이지 다섯 · 깬 것 ' + done + '개</div>'
                  + '<button id="geo-go" class="game-btn" style="width:100%; margin-top:10px; padding:10px;">들어간다</button>';
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
// 지금 놀고 있는 상태를 들여다본다 — 읽기만 한다 (고쳐 쓸 수는 없다)
window.geoPeek = function () {
    if (!run) return null;
    return { stage: run.stage + 1, x: run.s.x, y: run.s.y, on: run.s.on,
             dead: run.s.dead, done: run.s.done, tries: run.tries, best: run.best,
             end: run.L.end, spd: run.L.spd };
};

window.geoState = function () {
    console.log('%c===== ' + TITLE + ' =====', 'color:#c79a5b; font-size:13px');
    console.log('  사택 등급:', (typeof houseGrade === 'function' ? houseGrade(currentUser) : '?'),
        '· 열리나:', isL() ? 'O' : '✗ (L 등급 사택에서만 열립니다)');
    console.table(STAGES.map(function (st, i) {
        return { 스테이지: (i + 1) + '. ' + st.name, 깸: cleared(i + 1) ? 'O' : '-',
                 보상: st.pay.toLocaleString() + ' P',
                 길이: st.beats + '박', 속도: st.spd + 'px/s',
                 분당박: Math.round(st.spd / BEAT_PX * 60) };
    }));
    const got = STAGES.reduce(function (a, s, i) { return a + (cleared(i + 1) ? s.pay : 0); }, 0);
    const all = STAGES.reduce(function (a, s) { return a + s.pay; }, 0);
    console.log('  받은 포인트:', got.toLocaleString() + ' / ' + all.toLocaleString() + ' P');
    console.log('  geoOpen() 으로 바로 열고, geoBot() 으로 봇이 깨 보게 합니다.');
};

console.log('[복도] geoOpen() · geoState() · geoBot()');

})();
