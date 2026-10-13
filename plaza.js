// ==========================================
// ★ 🚶 광장 — 여섯 군데를 걸어 다닌다 · 남도 보이고 말도 건넨다
// bundles.json 마지막 묶음, closet.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 어떻게 생겼나
//
//   단말 종료 옆 「🚶 광장」을 누르면 **따로 뜨는 세로 창**이 화면을 덮는다.
//   탭 안이 아니라 덮개(오버레이)로 둔 까닭은, 걸어 다니는 동안 사내 화면이
//   끼어들지 않게 하기 위해서다. 창은 위에서부터
//
//       머리띠 (어디인지 · 닫기)
//       방 화면  ← 카메라가 사람을 따라다닌다 (가로·세로 둘 다)
//       걷기 단추 (← ↑ → ↓)
//       주고받은 말  ← 안에서 바로 친다
//
//   로 쌓인다.
//
// ■ 방 여섯과 길
//
//       [숲 정류장]                       [하늘 계단]
//            ↑                                 ↑
//   [이소-오스카리] ↔ [아이스크림 거리] ↔ [헌터 상점가] ↔ [횡단보도]
//
//   좌우는 화면 끝까지 걸어가면 넘어간다. 위는 **정해진 자리**에서만 올라간다
//   (횡단보도의 계단 입구, 오스카리의 안내판 쪽). 올라간 곳에서는 아래로
//   내려오면 돌아온다 — 되돌아오는 길은 적지 않아도 저절로 생긴다.
//
// ■ 크기를 어떻게 맞췄나
//
//   방 그림은 손대지 않았다. 줄이면 도트가 뭉개지기 때문이다. 대신 방마다
//   **사람 배율**을 둔다. 사람 도트는 한 칸이 4픽셀이라 배율은 4분의 1 단위로
//   떨어지는 값(0.5 · 0.75 · 1.0 …)만 쓴다. 0.65 같은 값은 도트 경계가
//   어긋나 뭉개진다.
//
//   여섯 방을 다 재어 보니 0.75 배(사람 키 183px)가 문·벤치·간판과 두루
//   어울렸다. 방마다 다르게 두고 싶으면 아래 ROOMS 의 k 를 고치면 된다.
//
// ■ 남이 같이 보이는 얼개 (지난 시범과 같다)
//
//   plazaRoom/<방>/<사번> 에 { 이름, x, y, 보는쪽, 걷나, 옷차림, 한 말, 때 }.
//
//   · 매 그림마다 쓰지 않는다. 4분의 1초에 한 번, 그것도 달라졌을 때만.
//     멈추는 순간은 한 번 더 쓴다 (멈춘 자리가 어긋나지 않게).
//   · 받는 쪽은 그 자리로 **미끄러져 간다.** 띄엄띄엄 와도 걷는 것으로 보인다.
//   · 「멈췄다」가 유실되면 제자리걸음이 남으므로, 다 와 놓고 1.2초간
//     소식이 없으면 선 것으로 본다.
//   · 나갈 때 지우고 onDisconnect 로도 지운다. 그래도 남으면 25초 뒤 안 보인다.
//   · 방을 옮기면 **전에 있던 방에서 제 자리를 지운다.** 안 그러면 유령이 남는다.
//
// ■ 말풍선
//
//   친 말은 두 군데로 간다.
//     plazaChat/<방>  여럿이 보는 글줄 (서른 줄만 남긴다)
//     내 자리 기록의 s/st   머리 위 말풍선 — 6초 뒤 사라진다
//
//   말풍선을 자리 기록에 같이 싣는 까닭은, 글줄이 늦게 와도 말풍선은
//   제때 뜨게 하기 위해서다. 둘은 따로 돈다.
//
// ■ 콘솔
//       plazaGo('cross')   그 방으로 건너뛴다
//       plazaState()       지금 어디에 누구와 있나
//       plazaRooms()       방과 길
//
// ※ 방 그림은 plaza/*.webp 입니다. 바꾸시려면 같은 이름으로 덮으시고,
//   크기가 달라지면 아래 ROOMS 의 w·h·floor 를 같이 고쳐 주십시오.

const PLAZA = {
    DIR: 'plaza/',
    ADMIN: 'kario0987',
    ADMIN_ONLY: false,          // 상담사만 들이려면 true
    PATH: 'plazaRoom',          // 서버에 자리를 적는 자리
    CHAT: 'plazaChat',          // 서버에 말을 적는 자리

    SPEED: 105,                 // 1초에 몇 픽셀 걷나
    TAP_STOP: 3,
    EDGE: 20,                   // 좌우 끝에서 이만큼 남기고 넘어간다
    // ★ 넘어간 방에서 **문턱 안쪽으로** 들여 세운다.
    //   안 그러면 올라가자마자 아래쪽 끝에 서게 되어 그 자리에서 도로
    //   내려오고, 단추를 누르고 있는 동안 두 방을 끝없이 오간다.
    INSET: 26,
    WARP_MS: 450,               // 넘어간 직후 이만큼은 또 안 넘어간다
    SEND_MS: 250,
    STALE_MS: 25000,
    CATCH: 1.35,
    HOLD_MS: 1200,
    SAY_MS: 6000,               // 말풍선이 떠 있는 시간
    CHAT_KEEP: 30,              // 남기는 글줄 수
    SAY_MAX: 60,                // 한 번에 칠 수 있는 글자

    // 방 — w·h 는 그림 크기, floor 는 발이 닿을 수 있는 y 띠, k 는 사람 배율
    //      up 은 올라가는 자리 { to, x: [왼, 오] }
    ROOMS: {
        oskari: { n: '이소-오스카리', img: 'oskari.webp', w: 1690, h: 1135,
                  floor: [960, 1120], k: 0.75,
                  right: 'street', up: { to: 'stop', x: [1420, 1660] } },
        street: { n: '아이스크림 거리', img: 'street.webp', w: 735, h: 537,
                  floor: [470, 525], k: 0.75,
                  left: 'oskari', right: 'hunter' },
        hunter: { n: '헌터 상점가', img: 'hunter.webp', w: 735, h: 430,
                  floor: [372, 424], k: 0.75,
                  left: 'street', right: 'cross' },
        cross:  { n: '횡단보도', img: 'cross.webp', w: 736, h: 736,
                  floor: [600, 726], k: 0.75,
                  left: 'hunter', up: { to: 'stairs', x: [300, 460] } },
        stop:   { n: '숲 정류장', img: 'stop.webp', w: 735, h: 490,
                  floor: [440, 480], k: 0.75 },
        stairs: { n: '하늘 계단', img: 'stairs.webp', w: 735, h: 856,
                  floor: [770, 848], k: 0.75 }
    },
    START: 'street'
};

(function plaza() {

const P = PLAZA;
const R = P.ROOMS;

// ★ 돌아오는 길을 저절로 만든다 — 한쪽만 적어도 양쪽이 통한다
(function link() {
    Object.keys(R).forEach(function (a) {
        const r = R[a];
        if (r.left && R[r.left] && !R[r.left].right) R[r.left].right = a;
        if (r.right && R[r.right] && !R[r.right].left) R[r.right].left = a;
        if (r.up && R[r.up.to] && !R[r.up.to].down) R[r.up.to].down = a;
    });
})();

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function now() { return Date.now(); }
function isAdm(u) { const x = u || u_(); return !!(x && x.code === P.ADMIN); }
function canEnter() { return P.ADMIN_ONLY ? isAdm() : !!u_(); }
function nameOf(u) {
    if (!u) return '?';
    return (u.badge && u.badge.nickname) || u.name || u.code || '?';
}
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

let run = null;          // 지금 돌고 있는 광장
let chatRef = null;

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('plaza-css')) return;
    const s = document.createElement('style');
    s.id = 'plaza-css';
    s.textContent = [
        '#plaza-ov{position:fixed;inset:0;z-index:999995;display:flex;flex-direction:column;',
        '  background:#07070a;color:#e8e2d6;font-family:inherit;}',
        '#plaza-top{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:9px 11px;',
        '  background:linear-gradient(180deg,#14141b,#0d0d12);border-bottom:1px solid #2a2a36;}',
        '#plaza-top .ttl{flex:1;min-width:0;font-size:12px;font-weight:bold;color:#cfc6b4;',
        '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#plaza-top .x{flex:0 0 auto;padding:7px 12px;font-size:12px;border-radius:6px;',
        '  background:#2a2a33;border:1px solid #44444f;color:#ddd;cursor:pointer;}',
        '#plaza-view{flex:1 1 auto;position:relative;overflow:hidden;background:#0b0b0d;',
        '  touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:crosshair;',
        '  min-height:180px;}',
        '#plaza-room{position:absolute;left:0;top:0;image-rendering:pixelated;',
        '  image-rendering:crisp-edges;background-repeat:no-repeat;}',
        '.plaza-one{position:absolute;}',
        '.plaza-one .dot-box{position:absolute;left:0;top:0;margin:0;}',
        '.plaza-tag{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;',
        '  font-size:10px;font-weight:bold;color:#efe6d8;text-shadow:0 1px 2px #000,0 0 4px #000;',
        '  pointer-events:none;}',
        // 말풍선
        '.plaza-say{position:absolute;left:50%;transform:translateX(-50%);bottom:100%;',
        '  margin-bottom:16px;max-width:190px;padding:6px 9px;border-radius:9px;',
        '  background:#f4efe2;color:#1a1a1a;font-size:11px;line-height:1.5;',
        '  box-shadow:0 2px 8px rgba(0,0,0,.6);pointer-events:none;word-break:break-word;',
        '  text-align:center;}',
        '.plaza-say:after{content:"";position:absolute;left:50%;top:100%;margin-left:-5px;',
        '  border:5px solid transparent;border-top-color:#f4efe2;}',
        // 나가는 길 표시
        '.plaza-exit{position:absolute;pointer-events:none;color:#ffe9b0;font-size:15px;',
        '  text-shadow:0 1px 3px #000,0 0 6px #000;opacity:.85;animation:plazaBob 1.4s infinite;}',
        '@keyframes plazaBob{0%,100%{opacity:.45}50%{opacity:1}}',
        // 걷기 단추 (손가락이 아닌 자리 — 자판이 있는 쪽)
        '#plaza-pad{flex:0 0 auto;display:flex;gap:6px;justify-content:center;padding:8px 10px;',
        '  background:#0d0d12;border-top:1px solid #23232e;}',
        '#plaza-pad button{width:52px;padding:11px 0;font-size:15px;border-radius:7px;',
        '  background:#22222c;border:1px solid #3c3c48;color:#ded7c8;cursor:pointer;}',
        '#plaza-pad button:active{background:#33333f;}',
        // 조이스틱 — 손가락으로 쥐는 자리. 방 위에 겹쳐 띄워 화면을 안 갉아먹는다.
        '#plaza-stick{position:absolute;left:16px;bottom:16px;width:104px;height:104px;',
        '  border-radius:50%;z-index:6;touch-action:none;opacity:.6;',
        '  transition:opacity .14s;-webkit-tap-highlight-color:transparent;',
        '  background:radial-gradient(circle at 50% 42%,rgba(26,26,36,.62),rgba(8,8,12,.78));',
        '  border:1px solid rgba(170,158,126,.45);box-shadow:0 2px 12px rgba(0,0,0,.55);}',
        '#plaza-stick.on{opacity:.95;}',
        '#plaza-stick .ring{position:absolute;inset:15px;border-radius:50%;',
        '  border:1px dashed rgba(190,178,146,.2);pointer-events:none;}',
        '#plaza-knob{position:absolute;left:50%;top:50%;width:46px;height:46px;',
        '  margin:-23px 0 0 -23px;border-radius:50%;pointer-events:none;',
        '  background:radial-gradient(circle at 36% 32%,#7b7160,#2e2c36);',
        '  border:1px solid rgba(226,214,180,.55);box-shadow:0 2px 7px rgba(0,0,0,.6);}',
        // 말
        '#plaza-chat{flex:0 0 auto;background:#0b0b10;border-top:1px solid #23232e;}',
        '#plaza-log{height:92px;overflow-y:auto;padding:7px 10px;font-size:11px;line-height:1.65;}',
        '#plaza-log .who{color:#9fd8ef;font-weight:bold;}',
        '#plaza-log .sys{color:#8d8578;}',
        '#plaza-send{display:flex;gap:6px;padding:7px 10px 10px 10px;}',
        '#plaza-in{flex:1;min-width:0;padding:10px;font-size:13px;border-radius:7px;',
        '  background:#17171e;border:1px solid #3a3a46;color:#e8e2d6;}',
        '#plaza-send button{flex:0 0 auto;padding:10px 14px;font-size:12px;border-radius:7px;',
        '  background:#3a2f1c;border:1px solid #8a6a2a;color:#ffe9bd;cursor:pointer;}',
        '#plaza-who{font-size:10px;color:#8d8578;padding:0 11px 7px 11px;text-align:center;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 사람 하나 — 나든 남이든 같은 것을 쓴다
// ==========================================
function makeOne(user, label, k) {
    const wrap = document.createElement('div');
    wrap.className = 'plaza-one';
    const w = 208 * k, h = 256 * k;
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    const a = window.dotActor(user, { scale: k });
    wrap.appendChild(a.el);

    const tag = document.createElement('div');
    tag.className = 'plaza-tag';
    tag.style.top = '-2px';
    tag.innerText = label || '';
    wrap.appendChild(tag);

    return { wrap: wrap, actor: a, tag: tag, w: w, h: h, bub: null };
}

function putOne(one, x, y) {
    one.wrap.style.left = Math.round(x - one.w / 2) + 'px';
    one.wrap.style.top = Math.round(y - one.h) + 'px';     // 칸 아래끝이 발이다
    one.wrap.style.zIndex = String(100 + Math.round(y));   // 아래에 있는 사람이 앞
}

function bubble(one, text) {
    if (one.bub) { one.bub.remove(); one.bub = null; }
    if (!text) return;
    const b = document.createElement('div');
    b.className = 'plaza-say';
    b.innerText = text;
    one.wrap.appendChild(b);
    one.bub = b;
}

// ==========================================
// 방을 연다
// ==========================================
function roomOf() { return R[run.room]; }

function paintRoom() {
    const r = roomOf();
    run.el.style.width = r.w + 'px';
    run.el.style.height = r.h + 'px';
    run.el.style.backgroundImage = 'url("' + P.DIR + r.img + '")';
    run.el.style.backgroundSize = r.w + 'px ' + r.h + 'px';
    const t = document.getElementById('plaza-title');
    if (t) t.innerText = '🚶 광장 — ' + r.n;
    paintExits();
}

// 나갈 수 있는 쪽에 화살표를 띄운다
function paintExits() {
    const r = roomOf();
    Array.prototype.forEach.call(run.el.querySelectorAll('.plaza-exit'),
        function (e) { e.remove(); });
    const mk = function (txt, css) {
        const e = document.createElement('div');
        e.className = 'plaza-exit';
        e.innerText = txt;
        e.style.cssText = css;
        run.el.appendChild(e);
    };
    const fy = (r.floor[0] + r.floor[1]) / 2;
    if (r.left)  mk('◀', 'left:6px;top:' + Math.round(fy - 60) + 'px;');
    if (r.right) mk('▶', 'left:' + (r.w - 20) + 'px;top:' + Math.round(fy - 60) + 'px;');
    if (r.up)    mk('▲', 'left:' + Math.round((r.up.x[0] + r.up.x[1]) / 2 - 7) + 'px;top:'
                        + Math.round(r.floor[0] - 86) + 'px;');
    if (r.down)  mk('▼', 'left:10px;top:' + Math.round(r.floor[1] - 18) + 'px;');
}

// 방을 옮긴다 — way 는 **내가 걸어간 쪽** ('left'|'right'|'up'|'down'|null)
//
//   ★ 걸어간 쪽의 **반대편**에 선다. 오른쪽으로 걸어 들어갔으면 새 방의
//     왼쪽 끝에 서야 한다. 전에는 이것이 거꾸로 되어 있어서, 오른쪽으로
//     들어가자마자 또 오른쪽 끝에 서고 그대로 다음 방으로 밀려 갔다.
function goRoom(key, way) {
    if (!run || !R[key]) return;
    const r = R[key];

    // 있던 방에서 내 자리를 지운다 (유령이 남지 않게)
    leaveRoom();

    run.room = key;
    Object.keys(run.peers).forEach(dropPeer);
    // ★ 옛 사람의 시계를 **반드시 멈춘다.**
    //   dotActor 는 걸음과 눈 깜빡임을 setInterval·setTimeout 으로 돌린다.
    //   innerHTML 로 지우면 그림만 사라지고 시계는 그대로 남아, 방을 옮길
    //   때마다 쌓인다. 방을 몇 번 오가면 시계가 수십 개가 되어 화면이 무거워진다.
    if (run.me) { try { run.me.actor.stop(); } catch (e) { } }
    run.el.innerHTML = '';
    run.k = r.k;

    // 걸어간 쪽의 **반대편**에, 문턱 안쪽으로 들여 선다
    const mid = (r.floor[0] + r.floor[1]) / 2;
    const band = r.floor[1] - r.floor[0];
    const inY = Math.min(P.INSET, Math.max(2, band / 3));   // 바닥이 좁으면 그만큼만
    if (way === 'right')      { run.x = P.EDGE + P.INSET;       run.y = mid; }   // → 로 왔으니 왼쪽에
    else if (way === 'left')  { run.x = r.w - P.EDGE - P.INSET; run.y = mid; }   // ← 로 왔으니 오른쪽에
    else if (way === 'up')    { run.x = r.w / 2;  run.y = r.floor[1] - inY; }    // ↑ 로 왔으니 아래쪽에
    else if (way === 'down')  { run.x = r.w / 2;  run.y = r.floor[0] + inY; }    // ↓ 로 왔으니 위쪽에
    else                      { run.x = r.w / 2;  run.y = mid; }

    run.x = Math.max(P.EDGE, Math.min(r.w - P.EDGE, run.x));
    run.y = Math.max(r.floor[0], Math.min(r.floor[1], run.y));
    run.tx = null;
    run.warp = now();                       // 넘어간 직후에는 또 안 넘어간다

    // 사람을 다시 만든다 (배율이 방마다 다르다)
    const u = u_();
    run.me = makeOne(u, nameOf(u), run.k);
    run.el.appendChild(run.me.wrap);
    putOne(run.me, run.x, run.y);

    paintRoom();
    watchRoom();
    watchChat();
    run.sx = run.sy = -9999; run.sent = 0;
    sysLine(r.n + ' 에 들어왔습니다.');
    camera(true);

    // ★ 그리기 고리를 **다시 건다.**
    //
    //   tick 안에서 방을 넘어갈 때 goRoom 을 부르고 바로 return 했다.
    //   그러면 tick 끝의 requestAnimationFrame 에 못 닿아 **고리가 그 자리에서
    //   끊겼다.** 첫 방은 멀쩡한데 한 번 넘어가면 사람이 굳고, 말풍선도 안
    //   사라지고, 자리도 서버에 안 올라갔다 — 한 가지 빠뜨림이 셋으로 보였다.
    //
    //   밖에서 부를 때(plazaOpen · plazaGo)는 이미 걸려 있을 수 있으므로
    //   걸린 것을 끊고 다시 건다.
    try { cancelAnimationFrame(run.raf); } catch (e) { }
    run.last = performance.now();
    run.raf = requestAnimationFrame(tick);
}

// ==========================================
// 한 걸음
// ==========================================
function tick(ts) {
    if (!run) return;
    const r = roomOf();
    const dt = Math.min(0.05, (ts - run.last) / 1000);
    run.last = ts;

    let dx = 0, dy = 0;
    const k = run.keys;
    if (k.left) dx -= 1;
    if (k.right) dx += 1;
    if (k.up) dy -= 1;
    if (k.down) dy += 1;

    // ─ 조이스틱이 먼저다. 민 만큼만 걷는다 (살짝 밀면 느리게).
    if (run.ax || run.ay) { dx = run.ax; dy = run.ay; }

    if (dx || dy) run.tx = null;
    else if (run.tx != null) {
        const ax = run.tx - run.x, ay = run.ty - run.y;
        const d = Math.hypot(ax, ay);
        if (d <= P.TAP_STOP) run.tx = null;
        else { dx = ax / d; dy = ay / d; }
    }

    // 대각선이 더 빠르지 않게 1 로 자른다. 1 보다 작은 것은 그대로 둔다
    // — 자판은 늘 1 이고, 조이스틱만 그 사이 값이 온다.
    let mag = Math.hypot(dx, dy);
    if (mag > 1) { dx /= mag; dy /= mag; mag = 1; }

    const moving = mag > 0.001;
    if (moving) {
        run.x += dx * P.SPEED * dt;
        run.y += dy * P.SPEED * dt;

        // ─ 넘어간 직후에는 쉬어 간다 (두 방을 끝없이 오가지 않게)
        if (now() - (run.warp || 0) > P.WARP_MS) {
            if (r.left && run.x <= P.EDGE) { goRoom(r.left, 'left'); return; }
            if (r.right && run.x >= r.w - P.EDGE) { goRoom(r.right, 'right'); return; }
            // 위로 가는 자리에서 위쪽 끝에 닿으면 올라간다
            if (r.up && run.y <= r.floor[0] + 1
                && run.x >= r.up.x[0] && run.x <= r.up.x[1]) { goRoom(r.up.to, 'up'); return; }
            // 올라온 방에서 아래쪽 끝이면 내려간다
            if (r.down && run.y >= r.floor[1] - 1) { goRoom(r.down, 'down'); return; }
        }

        run.x = Math.max(P.EDGE, Math.min(r.w - P.EDGE, run.x));
        run.y = Math.max(r.floor[0], Math.min(r.floor[1], run.y));
        // 거의 위아래로만 밀었을 때 좌우가 깜빡이지 않게 턱을 조금 둔다
        if (dx < -0.08) run.me.actor.face(1);
        else if (dx > 0.08) run.me.actor.face(-1);
    }
    run.me.actor.moving(moving);
    putOne(run.me, run.x, run.y);
    camera();
    send(moving);

    // ─ 남 — 받은 자리로 미끄러져 간다
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
            const held = (now() - q.seen) > P.HOLD_MS;
            q.one.actor.moving(!!q.moving && !held);
            q.one.actor.face(q.face || 1);
        }
        putOne(q.one, q.x, q.y);
        if (q.sayAt && now() - q.sayAt > P.SAY_MS) { bubble(q.one, ''); q.sayAt = 0; }
    });

    if (run.sayAt && now() - run.sayAt > P.SAY_MS) { bubble(run.me, ''); run.sayAt = 0; }

    run.raf = requestAnimationFrame(tick);
}

// 카메라 — 방이 창보다 크면 사람을 따라 가로·세로로 민다
function camera(snap) {
    const r = roomOf();
    const vw = run.view.clientWidth || r.w;
    const vh = run.view.clientHeight || r.h;
    // 방이 창보다 작으면 **가운데로** 둔다 (왼위로 붙여 두면 검은 띠가 남는다)
    let cx = -(vw - r.w) / 2, cy = -(vh - r.h) / 2;
    if (r.w > vw) cx = Math.max(0, Math.min(r.w - vw, run.x - vw / 2));
    if (r.h > vh) cy = Math.max(0, Math.min(r.h - vh, run.y - vh * 0.62));
    if (snap) { run.cx = cx; run.cy = cy; }
    else {
        run.cx += (cx - run.cx) * 0.18;      // 조금 늦게 따라와 부드럽다
        run.cy += (cy - run.cy) * 0.18;
    }
    run.el.style.left = (-Math.round(run.cx)) + 'px';
    run.el.style.top = (-Math.round(run.cy)) + 'px';
}

// ==========================================
// 내 자리를 알린다
// ==========================================
function send(moving) {
    if (!run || !run.ref) return;
    const t = now();
    const changed = Math.abs(run.x - run.sx) > 0.7 || Math.abs(run.y - run.sy) > 0.7
        || moving !== run.sMoving || run.me.actor.facing() !== run.sFace
        || run.sayAt !== run.sSayAt;
    const stopping = (!moving && run.sMoving);
    if (!stopping && (!changed || t - run.sent < P.SEND_MS)) return;
    run.sent = t;
    run.sx = run.x; run.sy = run.y;
    run.sMoving = moving; run.sFace = run.me.actor.facing();
    run.sSayAt = run.sayAt;
    const u = u_(); if (!u) return;
    try {
        run.ref.child(u.code).set({
            n: nameOf(u), x: Math.round(run.x), y: Math.round(run.y),
            f: run.sFace, m: moving ? 1 : 0, d: (u.dot || null),
            s: run.say || null, st: run.sayAt || 0, at: t
        });
    } catch (e) { }
}

// ==========================================
// 같은 방 사람
// ==========================================
function watchRoom() {
    const d = db_(), u = u_();
    if (!d || !u) return;
    if (run.ref) { try { run.ref.off('value', run.onRoom); } catch (e) { } }
    run.ref = d.ref(P.PATH + '/' + run.room);
    run.onRoom = function (snap) { onPeers(snap); };
    run.ref.on('value', run.onRoom);
    try { run.ref.child(u.code).onDisconnect().remove(); } catch (e) { }
}

function onPeers(snap) {
    if (!run) return;
    const all = snap.val() || {};
    const u = u_(); const mine = u && u.code;
    const live = {};

    Object.keys(all).forEach(function (code) {
        if (code === mine) return;
        const v = all[code] || {};
        if (!v.at || now() - v.at > P.STALE_MS) return;
        live[code] = true;
        let q = run.peers[code];
        const key = JSON.stringify(v.d || {});
        if (q && q.key !== key) { dropPeer(code); q = null; }
        if (!q) {
            const one = makeOne({ code: code, dot: v.d || {} }, v.n || code, run.k);
            run.el.appendChild(one.wrap);
            q = run.peers[code] = { one: one, key: key, x: v.x, y: v.y, tx: v.x, ty: v.y,
                                    face: v.f || 1, moving: !!v.m, seen: now(), sayAt: 0 };
            one.actor.face(v.f || 1);
            putOne(one, q.x, q.y);
        }
        if (q.tx !== v.x || q.ty !== v.y || q.moving !== !!v.m) q.seen = now();
        q.tx = v.x; q.ty = v.y; q.face = v.f || 1; q.moving = !!v.m;
        q.one.tag.innerText = v.n || code;
        // 말풍선 — 아직 안 보여 준 말이고 너무 묵지 않았으면 띄운다
        if (v.st && v.st !== q.sayAt && now() - v.st < P.SAY_MS) {
            q.sayAt = v.st;
            bubble(q.one, v.s || '');
        }
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

function leaveRoom() {
    const u = u_();
    if (!run || !run.ref || !u) return;
    try { run.ref.child(u.code).onDisconnect().cancel(); } catch (e) { }
    try { run.ref.child(u.code).remove(); } catch (e) { }
    try { run.ref.off('value', run.onRoom); } catch (e) { }
    run.ref = null;
}

function showWho() {
    const el = document.getElementById('plaza-who'); if (!el || !run) return;
    const ns = Object.keys(run.peers).map(function (c) { return run.peers[c].one.tag.innerText; });
    el.innerText = ns.length ? ('같이 있는 사람 — ' + ns.join(' · ')) : '지금은 혼자 있습니다.';
}

// ==========================================
// 말
// ==========================================
function watchChat() {
    const d = db_(); if (!d || !run) return;
    if (chatRef) { try { chatRef.off(); } catch (e) { } chatRef = null; }
    const log = document.getElementById('plaza-log');
    if (log) log.innerHTML = '';
    chatRef = d.ref(P.CHAT + '/' + run.room).limitToLast(P.CHAT_KEEP);
    chatRef.on('child_added', function (s) {
        const v = s.val() || {};
        if (!v.t) return;
        addLine(v.n || '?', v.t, v.c);
    });
}

function addLine(who, text, code) {
    const log = document.getElementById('plaza-log'); if (!log) return;
    const u = u_();
    const d = document.createElement('div');
    d.innerHTML = '<span class="who">' + esc(who) + '</span> ' + esc(text);
    log.appendChild(d);
    while (log.children.length > P.CHAT_KEEP + 10) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
    // 내 말은 보낼 때 이미 띄웠다
    if (u && code === u.code) return;
}

function sysLine(text) {
    const log = document.getElementById('plaza-log'); if (!log) return;
    const d = document.createElement('div');
    d.className = 'sys';
    d.innerText = '· ' + text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
}

function say(text) {
    const u = u_(); if (!run || !u) return;
    const t = String(text || '').trim().slice(0, P.SAY_MAX);
    if (!t) return;
    run.say = t; run.sayAt = now();
    bubble(run.me, t);
    send(false);                              // 말풍선을 바로 알린다
    const d = db_();
    if (d) {
        try {
            d.ref(P.CHAT + '/' + run.room).push({ n: nameOf(u), c: u.code, t: t, at: now() });
        } catch (e) { }
    }
}
window.plazaSay = say;

// ==========================================
// 창
// ==========================================
function shut() {
    if (!run) return;
    try { cancelAnimationFrame(run.raf); } catch (e) { }
    leaveRoom();
    if (chatRef) { try { chatRef.off(); } catch (e) { } chatRef = null; }
    Object.keys(run.peers).forEach(dropPeer);
    try { run.me.actor.stop(); } catch (e) { }
    if (run.onKey) {
        window.removeEventListener('keydown', run.onKey);
        window.removeEventListener('keyup', run.onKeyUp);
    }
    const ov = document.getElementById('plaza-ov');
    if (ov) ov.remove();
    run = null;
}
window.plazaClose = shut;

function open() {
    if (!canEnter()) {
        if (typeof showCustomAlert === 'function') showCustomAlert('아직 들어갈 수 없습니다.');
        return;
    }
    if (typeof window.dotActor !== 'function') {
        if (typeof showCustomAlert === 'function') showCustomAlert('옷장이 아직 안 올라왔습니다. 잠시 뒤에 다시 눌러 주십시오.');
        return;
    }
    if (run) return;

    // 손가락으로 만지는 기계인가 — 그러면 조이스틱, 아니면 방향 단추.
    //
    //   조이스틱은 방 위에 겹쳐 띄운다. 아래에 한 칸을 더 두면 그만큼
    //   방이 좁아지는데, 좁은 화면에서는 그 한 칸이 아깝다.
    const touch = !!(('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);

    const ov = document.createElement('div');
    ov.id = 'plaza-ov';
    ov.innerHTML =
        '<div id="plaza-top">'
        + '<div class="ttl" id="plaza-title">🚶 광장</div>'
        + '<div class="x" id="plaza-x">나간다</div>'
        + '</div>'
        + '<div id="plaza-view"><div id="plaza-room"></div>'
        + (touch ? '<div id="plaza-stick"><div class="ring"></div><div id="plaza-knob"></div></div>' : '')
        + '</div>'
        + (touch ? '' :
            '<div id="plaza-pad">'
            + '<button data-k="left">◀</button>'
            + '<button data-k="up">▲</button>'
            + '<button data-k="down">▼</button>'
            + '<button data-k="right">▶</button>'
            + '</div>')
        + '<div id="plaza-who"></div>'
        + '<div id="plaza-chat">'
        + '<div id="plaza-log"></div>'
        + '<div id="plaza-send">'
        + '<input id="plaza-in" maxlength="' + P.SAY_MAX + '" placeholder="여기에 적으면 머리 위에 뜹니다">'
        + '<button id="plaza-go">말한다</button>'
        + '</div></div>';
    document.body.appendChild(ov);

    run = {
        room: null, el: document.getElementById('plaza-room'),
        view: document.getElementById('plaza-view'),
        peers: {}, keys: {}, ax: 0, ay: 0, x: 0, y: 0, tx: null, ty: null,
        cx: 0, cy: 0, last: performance.now(), raf: 0,
        sx: -9999, sy: -9999, sent: 0, sMoving: false, sFace: 1,
        say: '', sayAt: 0, sSayAt: 0, k: 0.75, ref: null, me: null
    };

    // 바닥을 누르면 그 자리로 간다
    run.view.addEventListener('pointerdown', function (e) {
        if (!run) return;
        // 조이스틱을 쥔 것은 바닥을 누른 것이 아니다
        try { if (e.target && e.target.closest && e.target.closest('#plaza-stick')) return; } catch (x) { }
        const r = roomOf();
        const b = run.view.getBoundingClientRect();
        const x = e.clientX - b.left + run.cx;
        const y = e.clientY - b.top + run.cy;
        run.tx = Math.max(P.EDGE, Math.min(r.w - P.EDGE, x));
        run.ty = Math.max(r.floor[0], Math.min(r.floor[1], y));
    });

    // ─ 조이스틱 — 쥔 쪽으로, 민 만큼 걷는다
    //
    //   테두리 안쪽 어디를 눌러도 쥐어진다 (손가락이 손잡이를 정확히
    //   짚지 않아도 된다). 쥐는 순간 그 손가락을 붙잡아 두므로
    //   (setPointerCapture) 테두리 밖으로 끌고 나가도 끊기지 않는다.
    (function stick() {
        const st = ov.querySelector('#plaza-stick');
        if (!st) return;
        const knob = st.querySelector('#plaza-knob');
        const DEAD = 0.18;            // 이만큼 안 밀면 안 움직인다 (손 떨림 몫)
        const REACH = 0.62;           // 손잡이가 테두리까지 다 안 나가게
        let id = null;

        const put = function (x, y) {
            knob.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
        };
        const read = function (e) {
            if (!run) return;
            const b = st.getBoundingClientRect();
            const max = b.width / 2 || 52;
            let x = e.clientX - (b.left + max);
            let y = e.clientY - (b.top + b.height / 2);
            const d = Math.hypot(x, y);
            if (d > max) { x = x / d * max; y = y / d * max; }
            put(x * REACH, y * REACH);
            let m = Math.min(1, d / max);
            if (m < DEAD) { run.ax = 0; run.ay = 0; return; }
            m = (m - DEAD) / (1 - DEAD);            // 턱을 넘은 만큼을 0~1 로 펴 준다
            const n = Math.hypot(x, y) || 1;
            run.ax = x / n * m;
            run.ay = y / n * m;
            run.tx = null;                           // 쥐면 눌러 둔 자리는 버린다
        };
        const off = function (e) {
            if (id === null || (e && e.pointerId !== undefined && e.pointerId !== id)) return;
            id = null;
            st.classList.remove('on');
            put(0, 0);
            if (run) { run.ax = 0; run.ay = 0; }
        };
        st.addEventListener('pointerdown', function (e) {
            if (!run) return;
            e.preventDefault();
            e.stopPropagation();
            id = e.pointerId;
            st.classList.add('on');
            try { st.setPointerCapture(id); } catch (x) { }
            read(e);
        });
        st.addEventListener('pointermove', function (e) {
            if (id === null || e.pointerId !== id) return;
            e.preventDefault();
            read(e);
        });
        st.addEventListener('pointerup', off);
        st.addEventListener('pointercancel', off);
        st.addEventListener('lostpointercapture', off);
    })();

    // 단추 — 누르는 동안 걷는다
    Array.prototype.forEach.call(ov.querySelectorAll('#plaza-pad button'), function (b) {
        const k = b.getAttribute('data-k');
        const on = function (e) { e.preventDefault(); if (run) { run.keys[k] = true; run.tx = null; } };
        const off = function () { if (run) run.keys[k] = false; };
        b.addEventListener('pointerdown', on);
        b.addEventListener('pointerup', off);
        b.addEventListener('pointerleave', off);
        b.addEventListener('pointercancel', off);
    });

    // 방향키 — 글을 치는 중에는 안 걷는다
    const KEY = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
                  a: 'left', d: 'right', w: 'up', s: 'down' };
    run.onKey = function (e) {
        if (!run) return;
        if (document.activeElement && document.activeElement.id === 'plaza-in') {
            if (e.key === 'Enter') { go(); }
            return;
        }
        const k = KEY[e.key];
        if (k) { run.keys[k] = true; run.tx = null; e.preventDefault(); }
        if (e.key === 'Escape') shut();
    };
    run.onKeyUp = function (e) { const k = KEY[e.key]; if (k && run) run.keys[k] = false; };
    window.addEventListener('keydown', run.onKey);
    window.addEventListener('keyup', run.onKeyUp);

    const go = function () {
        const el = document.getElementById('plaza-in');
        if (!el) return;
        say(el.value);
        el.value = '';
    };
    document.getElementById('plaza-go').onclick = go;
    document.getElementById('plaza-x').onclick = shut;

    goRoom(P.START, null);
    run.last = performance.now();
    run.raf = requestAnimationFrame(tick);
}
window.plazaOpen = open;

// ==========================================
// 단말 종료 옆에 단추를 단다
// ==========================================
(function button() {
    const ID = 'btn-plaza';
    setInterval(function () {
        try {
            if (document.getElementById(ID)) return;
            if (!canEnter()) return;
            const box = document.querySelector('.action-buttons');
            if (!box) return;
            const outs = Array.prototype.filter.call(box.querySelectorAll('button'),
                function (b) { return /단말 종료/.test(b.innerText); });
            const b = document.createElement('button');
            b.id = ID;
            b.innerText = '🚶 광장';
            b.onclick = function (e) { e.stopPropagation(); open(); };
            if (outs.length) box.insertBefore(b, outs[0]);
            else box.appendChild(b);
        } catch (e) { }
    }, 1200);
})();

// ==========================================
// 콘솔
// ==========================================
window.plazaGo = function (key) {
    if (!run) { console.warn('광장에 들어와 있어야 합니다.'); return; }
    if (!R[key]) { console.warn('그런 방이 없습니다 —', Object.keys(R).join(' · ')); return; }
    goRoom(key, null);
};

window.plazaRooms = function () {
    console.log('%c===== 🚶 광장 — 방과 길 =====', 'color:#ffcf8f; font-size:13px');
    console.table(Object.keys(R).map(function (k) {
        const r = R[k];
        return { 열쇠: k, 이름: r.n, 크기: r.w + 'x' + r.h,
                 바닥: r.floor.join('~'), 사람배율: r.k,
                 왼쪽: r.left || '-', 오른쪽: r.right || '-',
                 위: r.up ? (r.up.to + ' (x ' + r.up.x.join('~') + ')') : '-',
                 아래: r.down || '-' };
    }));
};

window.plazaState = function () {
    console.log('%c===== 🚶 광장 =====', 'color:#ffcf8f; font-size:13px');
    if (!run) { console.log('  들어와 있지 않습니다.'); return; }
    const r = roomOf();
    console.log('  지금 :', r.n, '(' + run.room + ')');
    console.log('  자리 :', Math.round(run.x) + ', ' + Math.round(run.y),
        '· 바닥 ' + r.floor.join('~') + ' · 사람 ' + run.k + '배');
    const ns = Object.keys(run.peers);
    console.log('  같이 :', ns.length ? ns.map(function (c) {
        return run.peers[c].one.tag.innerText + '(' + c + ')'; }).join(', ') : '혼자');
};

console.log('[광장] plazaOpen() · plazaGo(방) · plazaRooms() · plazaState()');

})();
