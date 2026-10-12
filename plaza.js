// ==========================================
// ★ 🚶 광장 (시범) — 사택 안을 걸어 다닌다
// bundles.json 마지막 묶음, closet.js 뒤 · save-merge.js 앞
// ==========================================
//
//   지금은 **상담사 계정에서만** 보인다. 옷장에서 고른 모습 그대로
//   방 안을 걸어 다닌다. 아직 혼자다 — 남이 보이지는 않는다.
//
// ■ 크기를 어떻게 맞췄나
//
//   방 그림은 735 x 413 이고, 사람 도트는 한 칸이 208 x 256 에 키가 236 이다.
//   그대로 놓으면 사람이 방 높이의 57% 를 차지해 터무니없이 크다.
//
//   ★ 줄일 때 **도트가 정수로 떨어지는 배율만** 쓴다. 사람 도트는 한 칸이
//     4픽셀이므로 0.75 배면 3픽셀 — 깨지지 않는다. 0.65 같은 값을 쓰면
//     도트 경계가 어긋나 뭉개진다.
//
//       사람 0.75배 → 키 177px · 방 413px 의 43%  (의자 키와 어울린다)
//
//   방은 1:1 로 둔다. 줄이면 그림이 뭉개지므로, 대신 **화면이 사람을
//   따라다닌다**(카메라). 방보다 화면이 좁으면 좌우로 밀린다.
//
// ■ 바닥
//
//   의자 다리가 닿는 곳부터 그림 아래끝까지가 걸을 수 있는 땅이다.
//   발이 닿는 자리(y)로 센다 — 사람 칸의 **아래끝**이 발이다.
//
// ■ 움직이는 법
//
//   · 바닥을 누르면 그 자리로 걸어간다
//   · 방향키 · WASD 로도 걷는다 (누르고 있는 동안)
//   · 그림은 왼쪽을 보고 그려져 있어서, 오른쪽으로 갈 때만 뒤집는다
//     위아래로만 갈 때는 보던 쪽을 그대로 본다 (마리오식)
//
// ■ 콘솔
//       plazaState()   지금 자리와 설정

const PLAZA = {
    ROOM: 'plaza/room1.jpg',
    RW: 735, RH: 413,          // 방 그림 크기
    SCALE: 0.75,               // 사람 배율 — 도트가 3픽셀로 떨어지는 값
    FLOOR_TOP: 360,            // 걸을 수 있는 땅 (발이 닿는 자리)
    FLOOR_BOT: 406,
    EDGE: 24,                  // 좌우 여백
    SPEED: 68,                 // 1초에 몇 픽셀 가나
    TAP_STOP: 3                // 이만큼 가까우면 다 온 것으로 친다
};

(function plaza() {

const P = PLAZA;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdm() { const u = u_(); return !!(u && u.code === 'kario0987'); }

let run = null;          // { el, cam, actor, x, y, tx, ty, keys, raf, last }

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('plaza-css')) return;
    const s = document.createElement('style');
    s.id = 'plaza-css';
    s.textContent = [
        '#plaza-view{position:relative;overflow:hidden;width:100%;height:' + P.RH + 'px;',
        '  border:1px solid var(--theme-border,#4a5160);border-radius:8px;background:#0b0b0d;',
        '  touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:crosshair;}',
        '#plaza-room{position:absolute;top:0;left:0;width:' + P.RW + 'px;height:' + P.RH + 'px;',
        '  background-image:url("' + P.ROOM + '");background-size:' + P.RW + 'px ' + P.RH + 'px;',
        '  image-rendering:pixelated;image-rendering:crisp-edges;}',
        '#plaza-room .dot-box{position:absolute;margin:0;}',
        '#plaza-pad{display:flex;gap:6px;margin-top:10px;justify-content:center;}',
        '#plaza-pad .game-btn{width:58px;padding:12px 0;font-size:15px;margin:0;}',
        '#plaza-note{font-size:10px;color:#8d8578;margin-top:9px;line-height:1.6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 한 걸음
// ==========================================
function tick(now) {
    if (!run) return;
    const dt = Math.min(0.05, (now - run.last) / 1000);
    run.last = now;

    let dx = 0, dy = 0;
    const k = run.keys;
    if (k.left) dx -= 1;
    if (k.right) dx += 1;
    if (k.up) dy -= 1;
    if (k.down) dy += 1;

    if (dx || dy) {
        run.tx = null;                      // 손으로 걷기 시작하면 가던 자리는 버린다
    } else if (run.tx != null) {
        const ax = run.tx - run.x, ay = run.ty - run.y;
        const d = Math.hypot(ax, ay);
        if (d <= P.TAP_STOP) { run.tx = null; }
        else { dx = ax / d; dy = ay / d; }
    }

    const moving = !!(dx || dy);
    if (moving) {
        const n = Math.hypot(dx, dy) || 1;
        run.x += (dx / n) * P.SPEED * dt;
        run.y += (dy / n) * P.SPEED * dt;
        run.x = Math.max(P.EDGE, Math.min(P.RW - P.EDGE, run.x));
        run.y = Math.max(P.FLOOR_TOP, Math.min(P.FLOOR_BOT, run.y));
        // 위아래로만 갈 때는 보던 쪽 그대로 (마리오식)
        if (dx < -0.01) run.actor.face(1);
        else if (dx > 0.01) run.actor.face(-1);
    }
    run.actor.moving(moving);
    place();
    run.raf = requestAnimationFrame(tick);
}

function place() {
    if (!run) return;
    const w = 208 * P.SCALE, h = 256 * P.SCALE;
    run.actor.el.style.left = Math.round(run.x - w / 2) + 'px';
    run.actor.el.style.top = Math.round(run.y - h) + 'px';     // 칸 아래끝이 발이다
    // 카메라 — 방이 화면보다 넓을 때만 따라다닌다
    const vw = run.view.clientWidth || P.RW;
    let cam = 0;
    if (P.RW > vw) cam = Math.max(0, Math.min(P.RW - vw, run.x - vw / 2));
    run.room.style.left = (-Math.round(cam)) + 'px';
    run.cam = cam;
}

// ==========================================
// 화면
// ==========================================
function render() {
    const body = document.getElementById('house-plaza-body');
    if (!body) return;
    stop();
    body.innerHTML =
        '<div class="panel-title">[광장 — 시범]</div>'
        + '<div id="plaza-view"><div id="plaza-room"></div></div>'
        + '<div id="plaza-pad">'
        + '  <button class="game-btn" data-k="left">◀</button>'
        + '  <button class="game-btn" data-k="up">▲</button>'
        + '  <button class="game-btn" data-k="down">▼</button>'
        + '  <button class="game-btn" data-k="right">▶</button>'
        + '</div>'
        + '<div id="plaza-note">바닥을 누르면 그 자리로 걸어갑니다. 방향키·WASD 로도 걷습니다.<br>'
        + '옷장에서 고른 모습 그대로 나옵니다. 아직 혼자 있는 시범판입니다.</div>';

    const view = document.getElementById('plaza-view');
    const room = document.getElementById('plaza-room');
    const a = window.dotActor(u_(), { scale: P.SCALE });
    room.appendChild(a.el);

    run = {
        view: view, room: room, actor: a,
        x: P.RW / 2, y: (P.FLOOR_TOP + P.FLOOR_BOT) / 2,
        tx: null, ty: null, cam: 0,
        keys: { left: false, right: false, up: false, down: false },
        raf: null, last: performance.now(), off: []
    };
    place();

    // 바닥을 누르면 그리로 간다
    const tap = function (e) {
        if (!run) return;
        const t = (e.touches && e.touches[0]) || e;
        const r = view.getBoundingClientRect();
        run.tx = Math.max(P.EDGE, Math.min(P.RW - P.EDGE, t.clientX - r.left + run.cam));
        run.ty = Math.max(P.FLOOR_TOP, Math.min(P.FLOOR_BOT, t.clientY - r.top));
    };
    view.addEventListener('pointerdown', tap);
    run.off.push(function () { view.removeEventListener('pointerdown', tap); });

    // 단추 — 누르고 있는 동안 걷는다
    document.querySelectorAll('#plaza-pad .game-btn').forEach(function (b) {
        const k = b.dataset.k;
        const on = function (e) { e.preventDefault(); if (run) { run.keys[k] = true; run.tx = null; } };
        const off = function () { if (run) run.keys[k] = false; };
        b.addEventListener('pointerdown', on);
        b.addEventListener('pointerup', off);
        b.addEventListener('pointerleave', off);
        b.addEventListener('pointercancel', off);
        run.off.push(function () {
            b.removeEventListener('pointerdown', on); b.removeEventListener('pointerup', off);
            b.removeEventListener('pointerleave', off); b.removeEventListener('pointercancel', off);
        });
    });

    // 방향키 — 광장 칸이 열려 있을 때만 받는다
    const KEY = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
                  a: 'left', d: 'right', w: 'up', s: 'down',
                  A: 'left', D: 'right', W: 'up', S: 'down' };
    const kd = function (e) {
        const k = KEY[e.key]; if (!k || !run) return;
        if (document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName)) return;
        e.preventDefault(); run.keys[k] = true; run.tx = null;
    };
    const ku = function (e) { const k = KEY[e.key]; if (k && run) run.keys[k] = false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    run.off.push(function () {
        window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    });

    run.raf = requestAnimationFrame(tick);
}
window.renderPlaza = render;

function stop() {
    if (!run) return;
    if (run.raf) cancelAnimationFrame(run.raf);
    run.off.forEach(function (f) { try { f(); } catch (e) { } });
    try { run.actor.stop(); } catch (e) { }
    run = null;
}
window.plazaStop = stop;

// 다른 칸으로 넘어가면 멈춘다 (안 멈추면 뒤에서 계속 돈다)
setInterval(function () {
    const p = document.getElementById('house-plaza');
    if (run && p && !p.classList.contains('active')) stop();
}, 2000);

// ==========================================
// 사택에 탭을 단다 — 상담사에게만
// ==========================================
(function mountTab() {
    const iv = setInterval(function () {
        if (!u_()) return;                       // 로그인 뒤에 판단한다
        if (!isAdm()) { clearInterval(iv); return; }
        if (document.querySelector('#house-plaza')) { clearInterval(iv); return; }
        const host = document.getElementById('tab-house');
        const grid = host && host.querySelector('.sub-tabs-grid');
        if (!grid) return;

        const btn = document.createElement('button');
        btn.className = 'sub-tab';
        btn.innerText = '광장';
        btn.setAttribute('onclick', "switchHousePanel('house-plaza', this); renderPlaza();");
        grid.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'house-plaza';
        panel.className = 'sub-panel';
        panel.innerHTML = '<div id="house-plaza-body"></div>';
        host.appendChild(panel);

        clearInterval(iv);
        console.log('[광장] 사택에 탭 연결 (상담사 전용 시범)');
    }, 900);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

// ==========================================
// 콘솔
// ==========================================
window.plazaState = function () {
    console.log('%c===== 광장 (시범) =====', 'color:#e8c27a; font-size:13px');
    console.log('  상담사인가:', isAdm() ? 'O' : '✗ (상담사만 보입니다)');
    if (!run) { console.log('  지금 열려 있지 않습니다.'); return; }
    console.log('  자리 : x', Math.round(run.x), '· y', Math.round(run.y), '· 카메라', Math.round(run.cam));
    console.log('  보는 쪽 :', run.actor.facing() < 0 ? '오른쪽' : '왼쪽');
    console.log('  땅 :', P.FLOOR_TOP, '~', P.FLOOR_BOT, '· 사람 배율', P.SCALE);
};

console.log('[광장] 시범 — plazaState()');

})();
