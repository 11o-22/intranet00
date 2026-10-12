// ==========================================
// ★ 🚶 광장 (시범) — 사택 안을 걸어 다닌다 · 남도 같이 보인다
// bundles.json 마지막 묶음, closet.js 뒤 · save-merge.js 앞
// ==========================================
//
//   사원 누구나 들어온다 (상담사만 들이려면 ADMIN_ONLY 를 true 로).
//   옷장에서 고른 모습 그대로 방 안을 걸어 다니고, 같은 방에 있는 사람도
//   같이 보인다.
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
// ■ 움직이는 법
//
//   · 바닥을 누르면 그 자리로 걸어간다
//   · 방향키 · WASD · 화면 아래 네 단추로도 걷는다
//   · 그림은 왼쪽을 보고 그려져 있어서, 오른쪽으로 갈 때만 뒤집는다
//     위아래로만 갈 때는 보던 쪽을 그대로 본다 (마리오식)
//
// ■ 남이 같이 보이는 얼개
//
//   plazaRoom/room1/<사번> 에 { 이름, x, y, 보는쪽, 걷나, 옷차림, 때 } 를 적는다.
//
//   ★ 매 그림마다 적으면 안 된다. 1초에 예순 번씩 쓰면 서버가 못 버틴다.
//     그래서 **4분의 1초에 한 번**만, 그것도 **자리나 상태가 달라졌을 때만**
//     적는다. 멈추는 순간은 한 번 더 적어 준다 (멈춘 자리가 어긋나지 않게).
//
//   ★ 받는 쪽은 그 자리로 **미끄러져 간다.** 4분의 1초마다 오는 자리로
//     툭툭 옮기면 뚝뚝 끊겨 보이므로, 받은 자리를 「가야 할 곳」으로 두고
//     내가 걷는 것과 같은 빠르기로 다가가게 한다. 그래서 띄엄띄엄 와도
//     부드럽게 걷는 것으로 보인다.
//
//   ★ 「멈췄다」는 소식이 유실되면 남이 제자리걸음을 계속한다. 다 와 놓고
//     1.2초가 넘게 아무 소식이 없으면 선 것으로 본다. 벽에 막혀 제자리걸음을
//     하는 중이면 소식이 계속 오므로 이 자에 안 걸린다.
//
//   ★ 유령을 남기지 않는다. 나갈 때 지우고, 끊겨도 지워지도록
//     onDisconnect().remove() 를 걸어 둔다. 그래도 남는 것이 있을 수 있으니
//     **25초 넘게 소식이 없는 사람은 안 보이게** 한다.
//
//   ★ 앞뒤를 가린다. 아래쪽(y 가 큰 쪽)에 있는 사람이 앞이다 — z-index 로 준다.
//
// ■ 콘솔
//       plazaState()   지금 자리와 같이 있는 사람
//       plazaOpen()    상담사 말고도 들어오게 할지 — 고치는 자리를 알려 준다

const PLAZA = {
    ROOM: 'plaza/room1.jpg',
    RW: 735, RH: 413,          // 방 그림 크기
    SCALE: 0.75,               // 사람 배율 — 도트가 3픽셀로 떨어지는 값
    FLOOR_TOP: 360,            // 걸을 수 있는 땅 (발이 닿는 자리)
    FLOOR_BOT: 406,
    EDGE: 24,                  // 좌우 여백
    SPEED: 68,                 // 1초에 몇 픽셀 가나
    TAP_STOP: 3,               // 이만큼 가까우면 다 온 것으로 친다

    ADMIN_ONLY: false,         // ★ 상담사만 들이려면 true 로
    ADMIN: 'kario0987',
    PATH: 'plazaRoom/room1',
    SEND_MS: 250,              // 내 자리를 알리는 사이
    STALE_MS: 25000,           // 이보다 소식이 없으면 안 보인다
    CATCH: 1.35,               // 남을 따라붙는 빠르기 (내 걸음의 몇 곱)
    HOLD_MS: 1200              // 다 와 놓고 이만큼 소식이 없으면 선 것으로 본다
};

(function plaza() {

const P = PLAZA;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function isAdm(u) { const x = u || u_(); return !!(x && x.code === P.ADMIN); }
function canEnter() { return P.ADMIN_ONLY ? isAdm() : !!u_(); }
function now() { return Date.now(); }
function nameOf(u) {
    if (!u) return '?';
    return (u.badge && u.badge.nickname) || u.name || u.code || '?';
}

let run = null;

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
        '.plaza-one{position:absolute;}',
        '.plaza-one .dot-box{position:absolute;left:0;top:0;margin:0;}',
        '.plaza-tag{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;',
        '  font-size:10px;font-weight:bold;color:#efe6d8;text-shadow:0 1px 2px #000,0 0 4px #000;',
        '  pointer-events:none;}',
        '#plaza-pad{display:flex;gap:6px;margin-top:10px;justify-content:center;}',
        '#plaza-pad .game-btn{width:58px;padding:12px 0;font-size:15px;margin:0;}',
        '#plaza-who{font-size:10px;color:#9a948a;margin-top:8px;text-align:center;}',
        '#plaza-note{font-size:10px;color:#8d8578;margin-top:7px;line-height:1.6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 사람 하나 — 나든 남이든 같은 것을 쓴다
// ==========================================
function makeOne(user, label) {
    const wrap = document.createElement('div');
    wrap.className = 'plaza-one';
    const w = 208 * P.SCALE, h = 256 * P.SCALE;
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    const a = window.dotActor(user, { scale: P.SCALE });
    wrap.appendChild(a.el);

    const tag = document.createElement('div');
    tag.className = 'plaza-tag';
    tag.style.top = '-2px';
    tag.innerText = label || '';
    wrap.appendChild(tag);

    return { wrap: wrap, actor: a, tag: tag, w: w, h: h };
}

function putOne(one, x, y) {
    one.wrap.style.left = Math.round(x - one.w / 2) + 'px';
    one.wrap.style.top = Math.round(y - one.h) + 'px';     // 칸 아래끝이 발이다
    one.wrap.style.zIndex = String(100 + Math.round(y));   // 아래에 있는 사람이 앞
}

// ==========================================
// 한 걸음
// ==========================================
function tick(ts) {
    if (!run) return;
    const dt = Math.min(0.05, (ts - run.last) / 1000);
    run.last = ts;

    // --- 나 ---
    let dx = 0, dy = 0;
    const k = run.keys;
    if (k.left) dx -= 1;
    if (k.right) dx += 1;
    if (k.up) dy -= 1;
    if (k.down) dy += 1;

    if (dx || dy) {
        run.tx = null;
    } else if (run.tx != null) {
        const ax = run.tx - run.x, ay = run.ty - run.y;
        const d = Math.hypot(ax, ay);
        if (d <= P.TAP_STOP) run.tx = null;
        else { dx = ax / d; dy = ay / d; }
    }

    const moving = !!(dx || dy);
    if (moving) {
        const n = Math.hypot(dx, dy) || 1;
        run.x += (dx / n) * P.SPEED * dt;
        run.y += (dy / n) * P.SPEED * dt;
        run.x = Math.max(P.EDGE, Math.min(P.RW - P.EDGE, run.x));
        run.y = Math.max(P.FLOOR_TOP, Math.min(P.FLOOR_BOT, run.y));
        if (dx < -0.01) run.me.actor.face(1);
        else if (dx > 0.01) run.me.actor.face(-1);
    }
    run.me.actor.moving(moving);
    putOne(run.me, run.x, run.y);
    camera();
    send(moving);

    // --- 남 — 받은 자리로 미끄러져 간다 ---
    Object.keys(run.peers).forEach(function (code) {
        const q = run.peers[code];
        const ax = q.tx - q.x, ay = q.ty - q.y;
        const d = Math.hypot(ax, ay);
        if (d > 1) {
            const step = Math.min(d, P.SPEED * P.CATCH * dt);
            q.x += (ax / d) * step;
            q.y += (ay / d) * step;
            q.one.actor.moving(true);
            if (ax < -0.5) q.one.actor.face(1);
            else if (ax > 0.5) q.one.actor.face(-1);
        } else {
            q.x = q.tx; q.y = q.ty;
            // ★ 「멈췄다」는 소식이 유실되면 남이 **제자리걸음**을 계속한다.
            //   다 와 놓고 한참 아무 소식이 없으면 선 것으로 본다.
            //   (벽에 막혀 제자리걸음 하는 것은 소식이 계속 오므로 안 걸린다)
            const held = (now() - q.seen) > P.HOLD_MS;
            q.one.actor.moving(!!q.moving && !held);
            q.one.actor.face(q.face || 1);
        }
        putOne(q.one, q.x, q.y);
    });

    run.raf = requestAnimationFrame(tick);
}

function camera() {
    const vw = run.view.clientWidth || P.RW;
    let cam = 0;
    if (P.RW > vw) cam = Math.max(0, Math.min(P.RW - vw, run.x - vw / 2));
    run.room.style.left = (-Math.round(cam)) + 'px';
    run.cam = cam;
}

// ==========================================
// 내 자리를 알린다 — 띄엄띄엄, 달라졌을 때만
// ==========================================
function send(moving) {
    if (!run || !run.ref) return;
    const t = now();
    const changed = Math.abs(run.x - run.sx) > 0.7 || Math.abs(run.y - run.sy) > 0.7
        || moving !== run.sMoving || run.me.actor.facing() !== run.sFace;
    const stopping = (!moving && run.sMoving);          // 멈추는 순간은 꼭 알린다
    if (!stopping && (!changed || t - run.sent < P.SEND_MS)) return;
    run.sent = t;
    run.sx = run.x; run.sy = run.y;
    run.sMoving = moving; run.sFace = run.me.actor.facing();
    const u = u_(); if (!u) return;
    try {
        run.ref.child(u.code).set({
            n: nameOf(u), x: Math.round(run.x), y: Math.round(run.y),
            f: run.sFace, m: moving ? 1 : 0, d: (u.dot || null), at: t
        });
    } catch (e) { }
}

// ==========================================
// 남이 들어오고 나가는 것을 받는다
// ==========================================
function onPeers(snap) {
    if (!run) return;
    const all = snap.val() || {};
    const u = u_(); const mine = u && u.code;
    const live = {};

    Object.keys(all).forEach(function (code) {
        if (code === mine) return;
        const v = all[code] || {};
        if (!v.at || now() - v.at > P.STALE_MS) return;     // 유령은 안 보인다
        live[code] = true;
        let q = run.peers[code];
        const key = JSON.stringify(v.d || {});
        if (q && q.key !== key) { dropPeer(code); q = null; }   // 옷을 갈아입었으면 다시 만든다
        if (!q) {
            const one = makeOne({ code: code, dot: v.d || {} }, v.n || code);
            run.room.appendChild(one.wrap);
            q = run.peers[code] = { one: one, key: key, x: v.x, y: v.y, tx: v.x, ty: v.y,
                                    face: v.f || 1, moving: !!v.m, seen: now() };
            one.actor.face(v.f || 1);
            putOne(one, q.x, q.y);
        }
        if (q.tx !== v.x || q.ty !== v.y || q.moving !== !!v.m) q.seen = now();
        q.tx = v.x; q.ty = v.y; q.face = v.f || 1; q.moving = !!v.m;
        q.one.tag.innerText = v.n || code;
    });

    Object.keys(run.peers).forEach(function (code) { if (!live[code]) dropPeer(code); });
    showWho();
}

function dropPeer(code) {
    const q = run && run.peers[code]; if (!q) return;
    try { q.one.actor.stop(); } catch (e) { }
    q.one.wrap.remove();
    delete run.peers[code];
}

function showWho() {
    const el = document.getElementById('plaza-who'); if (!el || !run) return;
    const ns = Object.keys(run.peers).map(function (c) { return run.peers[c].one.tag.innerText; });
    el.innerText = ns.length ? ('같이 있는 사람 — ' + ns.join(' · ')) : '지금은 혼자 있습니다.';
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
        + '<div id="plaza-who"></div>'
        + '<div id="plaza-note">바닥을 누르면 그 자리로 걸어갑니다. 방향키·WASD 로도 걷습니다.<br>'
        + '옷장에서 고른 모습 그대로 나옵니다.</div>';

    const view = document.getElementById('plaza-view');
    const room = document.getElementById('plaza-room');
    const u = u_();
    const me = makeOne(u, nameOf(u));
    room.appendChild(me.wrap);

    run = {
        view: view, room: room, me: me, peers: {},
        x: P.RW / 2, y: (P.FLOOR_TOP + P.FLOOR_BOT) / 2,
        tx: null, ty: null, cam: 0,
        sent: 0, sx: -999, sy: -999, sMoving: false, sFace: 1,
        keys: { left: false, right: false, up: false, down: false },
        raf: null, last: performance.now(), off: [], ref: null
    };
    putOne(me, run.x, run.y);
    camera();
    showWho();

    // --- 서버에 붙는다 ---
    const d = db_();
    if (d && u) {
        run.ref = d.ref(P.PATH);
        const mine = run.ref.child(u.code);
        try { mine.onDisconnect().remove(); } catch (e) { }
        run.ref.on('value', onPeers);
        run.off.push(function () {
            try { run.ref.off('value', onPeers); } catch (e) { }
            try { mine.remove(); } catch (e) { }
            try { mine.onDisconnect().cancel(); } catch (e) { }
        });
        send(false);
    }

    // --- 바닥을 누르면 그리로 간다 ---
    const tap = function (e) {
        if (!run) return;
        const t = (e.touches && e.touches[0]) || e;
        const r = view.getBoundingClientRect();
        run.tx = Math.max(P.EDGE, Math.min(P.RW - P.EDGE, t.clientX - r.left + run.cam));
        run.ty = Math.max(P.FLOOR_TOP, Math.min(P.FLOOR_BOT, t.clientY - r.top));
    };
    view.addEventListener('pointerdown', tap);
    run.off.push(function () { view.removeEventListener('pointerdown', tap); });

    // --- 단추 ---
    document.querySelectorAll('#plaza-pad .game-btn').forEach(function (b) {
        const k = b.dataset.k;
        const on = function (e) { e.preventDefault(); if (run) { run.keys[k] = true; run.tx = null; } };
        const off = function () { if (run) run.keys[k] = false; };
        b.addEventListener('pointerdown', on);
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.addEventListener(n, off); });
        run.off.push(function () {
            b.removeEventListener('pointerdown', on);
            ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { b.removeEventListener(n, off); });
        });
    });

    // --- 방향키 ---
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
    Object.keys(run.peers).forEach(dropPeer);
    try { run.me.actor.stop(); } catch (e) { }
    run = null;
}
window.plazaStop = stop;

// 다른 칸으로 넘어가면 멈추고 자리를 비운다
setInterval(function () {
    const p = document.getElementById('house-plaza');
    if (run && p && !p.classList.contains('active')) stop();
}, 2000);
// 창을 닫을 때도 비운다 (onDisconnect 가 늦을 수 있다)
window.addEventListener('pagehide', function () { stop(); });

// ==========================================
// 사택에 탭을 단다
// ==========================================
(function mountTab() {
    const iv = setInterval(function () {
        if (!u_()) return;
        if (!canEnter()) { clearInterval(iv); return; }
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
        console.log('[광장] 사택에 탭 연결' + (P.ADMIN_ONLY ? ' (상담사 전용 시범)' : ''));
    }, 900);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

// ==========================================
// 콘솔
// ==========================================
window.plazaState = function () {
    console.log('%c===== 광장 (시범) =====', 'color:#e8c27a; font-size:13px');
    console.log('  들어갈 수 있나:', canEnter() ? 'O' : '✗',
        P.ADMIN_ONLY ? '(지금은 상담사만)' : '(모두 열려 있음)');
    if (!run) { console.log('  지금 열려 있지 않습니다.'); return; }
    console.log('  내 자리 : x', Math.round(run.x), '· y', Math.round(run.y),
        '· 보는 쪽', run.me.actor.facing() < 0 ? '오른쪽' : '왼쪽');
    const cs = Object.keys(run.peers);
    console.log('  같이 있는 사람 :', cs.length ? cs.map(function (c) {
        const q = run.peers[c];
        return q.one.tag.innerText + '(' + Math.round(q.x) + ',' + Math.round(q.y) + ')';
    }).join(' · ') : '없음');
    console.log('  적는 곳 :', P.PATH, '· 알리는 사이', P.SEND_MS + 'ms',
        '· 소식 끊김으로 보는 때', P.STALE_MS + 'ms');
};

window.plazaOpen = function () {
    console.log('모두에게 열려면 plaza.js 맨 위 PLAZA.ADMIN_ONLY 를 false 로 바꾸면 됩니다.');
    console.log('지금은', P.ADMIN_ONLY ? '상담사만' : '모두', '들어올 수 있습니다.');
};

console.log('[광장] 시범 — plazaState() · plazaOpen()');

})();
