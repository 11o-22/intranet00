// ==========================================
// ★ 🚶 광장 — 여섯 군데를 걸어 다닌다 · 남도 보이고 말도 건넨다
// bundles.json 마지막 묶음, closet.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 어떻게 생겼나
//
//   단말 종료 옆 「🚶 광장」을 누르면 **화면을 통째로 덮는 세로 창**이 뜬다.
//   탭 안이 아니라 덮개(오버레이)로 둔 까닭은, 걸어 다니는 동안 사내 화면이
//   끼어들지 않게 하기 위해서다.
//
//   방 그림이 화면을 꽉 채우고(검은 띠 없음), 나머지는 그 **위에 떠 있다.**
//
//       위   📍 어디인지 · ☰ 메뉴 · ✕ 나간다   ← 아이폰 상태막대만큼 내려 앉는다
//       가운데                                  ← 손가락으로 아무 데나 짚어 끌면 걷는다
//       아래 🎒 가방 · 채팅 바                   ← 바를 누르면 말 창이 올라온다
//
//   방마다 시설 입구(어둠 탐사 · 우주 쇼핑몰 · 유쾌 판매소 …)가 서 있고,
//   누르면 그 시설로 들어간다. 어느 방에 무엇을 둘지는 아래 ROOMS 의
//   spots 에, ☰ 에 무엇을 넣을지는 MENU 에 적는다.
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
    //      spots 는 그 방에 선 시설 입구 { x, n, i, tab, sub } 또는 { x, n, i, fn }
    ROOMS: {
        oskari: { n: '이소-오스카리', img: 'oskari.webp', w: 1690, h: 1135,
                  floor: [960, 1120], k: 0.75,
                  right: 'street', up: { to: 'stop', x: [1420, 1660] },
                  spots: [ { x: 430,  n: '공용시설',   i: '🎲', tab: 'tab-public' },
                           { x: 980,  n: '장기 은행',  i: '🏦', tab: 'tab-vip' } ] },
        street: { n: '아이스크림 거리', img: 'street.webp', w: 735, h: 537,
                  floor: [470, 525], k: 0.75,
                  left: 'oskari', right: 'hunter',
                  spots: [ { x: 190, n: '유쾌 판매소', i: '🛒', tab: 'tab-shop', sub: 'shop-regular' },
                           { x: 545, n: '행복 식당',   i: '🍚', tab: 'tab-shop', sub: 'shop-food' } ] },
        hunter: { n: '헌터 상점가', img: 'hunter.webp', w: 735, h: 430,
                  floor: [372, 424], k: 0.75,
                  left: 'street', right: 'cross',
                  spots: [ { x: 165, n: '우주 쇼핑몰', i: '🛸', tab: 'tab-shop', sub: 'shop-alien' },
                           { x: 400, n: '밀실 거래',   i: '🤝', tab: 'tab-shop', sub: 'shop-p2p' },
                           { x: 630, n: '???',         i: '❓', tab: 'tab-shop', sub: 'shop-unknown' } ] },
        cross:  { n: '횡단보도', img: 'cross.webp', w: 736, h: 736,
                  floor: [600, 726], k: 0.75,
                  left: 'hunter', up: { to: 'stairs', x: [300, 460] },
                  spots: [ { x: 600, n: '어둠 탐사', i: '🌑', tab: 'tab-darkness', sub: 'dark-main' } ] },
        stop:   { n: '숲 정류장', img: 'stop.webp', w: 735, h: 490,
                  floor: [440, 480], k: 0.75,
                  spots: [ { x: 360, n: '사택',  i: '🏠', tab: 'tab-house', sub: 'house-main' },
                           { x: 580, n: '펫 돌보기', i: '🐾', fn: 'petOpen' } ] },
        stairs: { n: '하늘 계단', img: 'stairs.webp', w: 735, h: 856,
                  floor: [770, 848], k: 0.75,
                  spots: [ { x: 380, n: '망상 홈쇼핑', i: '📺', tab: 'tab-shop', sub: 'shop-dream' } ] }
    },
    START: 'street',

    // ── 오른쪽 위 ☰ 에 들어가는 것들. 없는 것은 저절로 빠진다.
    MENU: [
        { n: '사원증',     i: '🪪', tab: 'tab-record',   sub: 'rec-badge' },
        { n: '소지품',     i: '🎒', tab: 'tab-record',   sub: 'rec-inventory' },
        { n: '기록',       i: '📄', tab: 'tab-record',   sub: 'rec-history' },
        { n: '익명 편지',  i: '✉️', tab: 'tab-record',   sub: 'rec-letters' },
        { n: '칭호',       i: '🏅', tab: 'tab-record',   sub: 'rec-titles' },
        { n: '선물함',     i: '🎁', fn: 'openGiftBox' },
        { n: '공용시설',   i: '🎲', tab: 'tab-public' },
        { n: '장기 은행',  i: '🏦', tab: 'tab-vip' },
        { n: '유쾌 판매소', i: '🛒', tab: 'tab-shop',    sub: 'shop-regular' },
        { n: '밀실 거래',  i: '🤝', tab: 'tab-shop',     sub: 'shop-p2p' },
        { n: '우주 쇼핑몰', i: '🛸', tab: 'tab-shop',    sub: 'shop-alien' },
        { n: '망상 홈쇼핑', i: '📺', tab: 'tab-shop',    sub: 'shop-dream' },
        { n: '어둠 탐사',  i: '🌑', tab: 'tab-darkness', sub: 'dark-main' },
        { n: '파티',       i: '🚩', tab: 'tab-darkness', sub: 'dark-party' },
        { n: '사택',       i: '🏠', tab: 'tab-house',    sub: 'house-main' },
        { n: '옷장',       i: '👔', tab: 'tab-house',    sub: 'house-closet' },
        { n: '펫 돌보기',  i: '🐾', fn: 'petOpen' },
        { n: '전체 대화',  i: '💬', fn: 'openAllChat' }
    ]
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
// 아이폰 — 시계·배터리 밑에 안 깔리게
// ==========================================
//
//   홈 화면 앱으로 띄우면 화면이 **상태 표시줄 밑까지** 올라온다
//   (index.html 의 viewport-fit=cover · black-translucent). 그래서 위 띠를
//   그만큼 내려 앉혀야 「나간다」가 배터리에 안 가린다.
//
//   env() 를 CSS 에 바로 쓰면 안 걸리는 자리를 이 저장소가 이미 한 번
//   겪었다 (pwa.js 의 stickSafe 참고). 그래서 **재서 값으로 박는다** —
//   작은 자를 하나 두고 그 여백을 읽어 변수에 넣는다.
function safeIns() {
    let r = document.getElementById('plaza-ruler');
    if (!r) {
        r = document.createElement('div');
        r.id = 'plaza-ruler';
        r.setAttribute('aria-hidden', 'true');
        r.style.cssText = 'position:fixed;left:0;top:0;width:0;visibility:hidden;'
            + 'pointer-events:none;z-index:-1;'
            + 'padding-top:env(safe-area-inset-top);'
            + 'padding-bottom:env(safe-area-inset-bottom);';
        (document.body || document.documentElement).appendChild(r);
    }
    const c = getComputedStyle(r);
    return { t: parseFloat(c.paddingTop) || 0, b: parseFloat(c.paddingBottom) || 0 };
}
function stampSafe(ov) {
    if (!ov) return;
    const s = safeIns();
    ov.style.setProperty('--plaza-safe-top', s.t + 'px');
    ov.style.setProperty('--plaza-safe-bot', s.b + 'px');
}

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('plaza-css')) return;
    const s = document.createElement('style');
    s.id = 'plaza-css';
    s.textContent = [
        // ── 틀 : 방 화면이 **화면을 통째로** 쓴다. 나머지는 그 위에 띄운다.
        '#plaza-ov{position:fixed;inset:0;z-index:999995;overflow:hidden;',
        '  background:#07070a;color:#e8e2d6;font-family:inherit;}',
        // ★ z-index 를 박아 **쌓임 칸**을 만든다. 안 그러면 사람에게 매긴
        //   높은 z-index(아래에 선 사람이 앞)가 밖으로 새어 나와, 아래에서
        //   올라오는 창 위로 사람이 비친다.
        '#plaza-view{position:absolute;inset:0;overflow:hidden;background:#07070a;z-index:1;',
        '  touch-action:none;user-select:none;-webkit-user-select:none;}',
        '#plaza-room{position:absolute;left:0;top:0;image-rendering:pixelated;',
        '  image-rendering:crisp-edges;background-repeat:no-repeat;}',
        // ── 위 띠 : 아이폰 상태막대를 피해 내려 앉힌다 (safe-area)
        '#plaza-top{position:absolute;left:0;right:0;top:0;z-index:20;display:flex;',
        '  align-items:flex-start;gap:8px;pointer-events:none;',
        '  padding:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 10px) 12px 26px 12px;',
        '  background:linear-gradient(180deg,rgba(6,6,10,.82),rgba(6,6,10,.35) 55%,rgba(6,6,10,0));}',
        '#plaza-top > *{pointer-events:auto;}',
        '#plaza-where{min-width:0;max-width:58%;display:flex;align-items:center;gap:6px;',
        '  padding:8px 13px;border-radius:999px;font-size:12.5px;font-weight:bold;color:#f1e7d6;',
        '  background:rgba(14,14,20,.62);border:1px solid rgba(190,170,120,.3);',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#plaza-top .sp{flex:1;}',
        '.plaza-ico{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:1px solid rgba(190,170,120,.3);',
        '  background:rgba(14,14,20,.62);color:#f1e7d6;font-size:17px;line-height:1;cursor:pointer;',
        '  display:flex;align-items:center;justify-content:center;',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '.plaza-ico:active{background:rgba(40,36,28,.85);}',
        '#plaza-who{position:absolute;left:12px;right:12px;z-index:19;text-align:center;',
        '  top:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 60px);',
        '  font-size:10.5px;color:#b9b0a0;text-shadow:0 1px 3px #000;pointer-events:none;}',
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
        '.plaza-exit{position:absolute;pointer-events:none;color:#ffe9b0;font-size:17px;',
        '  text-shadow:0 1px 3px #000,0 0 6px #000;opacity:.85;animation:plazaBob 1.4s infinite;}',
        '@keyframes plazaBob{0%,100%{opacity:.45}50%{opacity:1}}',
        // ── 시설 입구
        '.plaza-spot{position:absolute;z-index:300;transform:translate(-50%,-100%);',
        '  display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;}',
        '.plaza-spot .b{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;',
        '  justify-content:center;font-size:21px;background:rgba(18,14,10,.72);',
        '  border:1px solid rgba(217,160,90,.65);box-shadow:0 3px 12px rgba(0,0,0,.55),',
        '  inset 0 0 12px rgba(217,160,90,.16);animation:plazaFloat 2.6s ease-in-out infinite;}',
        '.plaza-spot .t{font-size:10px;font-weight:bold;color:#ffe9bd;white-space:nowrap;',
        '  text-shadow:0 1px 3px #000,0 0 5px #000;}',
        '.plaza-spot:active .b{background:rgba(60,42,22,.9);}',
        '@keyframes plazaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
        // 걷기 단추 (자판이 있는 기계에서만 — 손가락 쪽은 화면을 끌어 걷는다)
        '#plaza-pad{position:absolute;left:0;right:0;z-index:20;display:flex;gap:6px;',
        '  justify-content:center;bottom:calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 74px);}',
        '#plaza-pad button{width:50px;padding:10px 0;font-size:15px;border-radius:10px;',
        '  background:rgba(18,18,26,.66);border:1px solid rgba(170,158,126,.3);color:#ded7c8;',
        '  cursor:pointer;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);}',
        '#plaza-pad button:active{background:rgba(52,46,34,.9);}',
        // ── 아래 띠 : 가방 · 채팅 바
        '#plaza-bottom{position:absolute;left:0;right:0;bottom:0;z-index:20;display:flex;',
        '  align-items:center;gap:9px;pointer-events:none;',
        '  padding:30px 12px calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 12px) 12px;',
        '  background:linear-gradient(0deg,rgba(6,6,10,.85),rgba(6,6,10,.3) 60%,rgba(6,6,10,0));}',
        '#plaza-bottom > *{pointer-events:auto;}',
        '#plaza-bar{flex:1;min-width:0;display:flex;align-items:center;gap:8px;cursor:pointer;',
        '  padding:12px 15px;border-radius:999px;font-size:12.5px;color:#9a9284;',
        '  background:rgba(14,14,20,.68);border:1px solid rgba(190,170,120,.26);',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
        '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#plaza-bar:active{background:rgba(30,28,22,.85);}',
        '#plaza-bar .last{color:#d8cfbe;}',
        '#plaza-bar .dot{flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#ff7b6b;',
        '  box-shadow:0 0 7px #ff7b6b;display:none;}',
        '#plaza-bar.new .dot{display:block;}',
        // ── 시트 (아래에서 올라오는 창)
        '#plaza-sheet{position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;',
        '  justify-content:flex-end;background:rgba(4,4,8,.6);}',
        '.plaza-card{background:linear-gradient(180deg,#15151f,#0a0a10);',
        '  border:1px solid #2b2b38;border-bottom:0;border-radius:20px 20px 0 0;',
        '  padding:12px 14px calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 14px) 14px;',
        '  max-height:82dvh;display:flex;flex-direction:column;',
        '  box-shadow:0 -10px 34px rgba(0,0,0,.6);animation:plazaUp .18s ease-out;}',
        '@keyframes plazaUp{from{transform:translateY(16px);opacity:.4}to{transform:none;opacity:1}}',
        '.plaza-card .grip{width:38px;height:4px;border-radius:2px;background:#39394a;',
        '  margin:0 auto 10px auto;flex:0 0 auto;}',
        '.plaza-card h4{margin:0 0 10px 0;font-size:12.5px;color:#e8dcc6;font-weight:bold;}',
        // 메뉴 격자
        '.plaza-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;overflow-y:auto;}',
        '.plaza-grid button{display:flex;flex-direction:column;align-items:center;gap:5px;',
        '  padding:12px 4px;border-radius:13px;background:rgba(255,255,255,.035);',
        '  border:1px solid #2b2b38;color:#ded5c4;font-size:10.5px;font-family:inherit;cursor:pointer;}',
        '.plaza-grid button:active{background:rgba(217,160,90,.14);border-color:#8a6a2a;}',
        '.plaza-grid .e{font-size:21px;line-height:1;}',
        // 말 창
        '#plaza-log{flex:1 1 auto;min-height:120px;max-height:46dvh;overflow-y:auto;padding:2px 2px 8px 2px;',
        '  font-size:12px;line-height:1.7;}',
        '#plaza-log .who{color:#9fd8ef;font-weight:bold;}',
        '#plaza-log .sys{color:#7d7568;}',
        '#plaza-send{display:flex;gap:7px;padding-top:8px;flex:0 0 auto;}',
        '#plaza-in{flex:1;min-width:0;padding:12px;font-size:13px;border-radius:11px;',
        '  background:#16161f;border:1px solid #33333f;color:#e8e2d6;}',
        '#plaza-send button{flex:0 0 auto;padding:12px 16px;font-size:12px;border-radius:11px;',
        '  background:linear-gradient(145deg,#4a3a1e,#2a2112);border:1px solid #8a6a2a;',
        '  color:#ffe9bd;cursor:pointer;font-family:inherit;}',
        // 가방
        '.plaza-tabs{display:flex;gap:6px;flex:0 0 auto;margin-bottom:10px;}',
        '.plaza-tabs button{flex:1;padding:9px 0;font-size:11.5px;border-radius:10px;cursor:pointer;',
        '  background:rgba(255,255,255,.04);border:1px solid #2b2b38;color:#a79e8f;font-family:inherit;}',
        '.plaza-tabs button.on{background:rgba(217,160,90,.16);border-color:#8a6a2a;color:#ffe9bd;}',
        '#plaza-bagbody{overflow-y:auto;}',
        '.plaza-stage{display:flex;justify-content:center;padding:4px 0 10px 0;',
        '  background:radial-gradient(ellipse at 50% 92%,rgba(217,160,90,.13),rgba(0,0,0,0) 62%);}',
        '.plaza-row{display:flex;align-items:center;gap:8px;margin-top:7px;}',
        '.plaza-row .lab{flex:0 0 42px;font-size:10.5px;color:#8d8578;}',
        '.plaza-row .pick{flex:1;display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;}',
        '.plaza-row .pick button{flex:0 0 auto;padding:8px 12px;font-size:11px;border-radius:9px;',
        '  background:rgba(255,255,255,.04);border:1px solid #2b2b38;color:#b5ab9a;',
        '  white-space:nowrap;cursor:pointer;font-family:inherit;}',
        '.plaza-row .pick button.on{background:rgba(217,160,90,.18);border-color:#8a6a2a;color:#ffe9bd;}',
        '.plaza-inv{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;}',
        '.plaza-inv div{padding:10px 11px;border-radius:10px;font-size:11.5px;color:#ded5c4;',
        '  background:rgba(255,255,255,.035);border:1px solid #2b2b38;',
        '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.plaza-none{padding:24px 0;text-align:center;font-size:11.5px;color:#7d7568;}'
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

// 방 안의 자리(x·y)는 **그림 원래 크기**로 센다. 화면에 놓을 때만 배로 늘린다.
function zz() { return (run && run.z) || 1; }

function putOne(one, x, y) {
    const z = zz();
    one.wrap.style.left = Math.round(x * z - one.w / 2) + 'px';
    one.wrap.style.top = Math.round(y * z - one.h) + 'px';   // 칸 아래끝이 발이다
    one.wrap.style.zIndex = String(100 + Math.round(y));     // 아래에 있는 사람이 앞
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

// 방 그림을 **화면에 꽉 차게** 늘린다.
//
//   전에는 그림을 원래 크기로 두어, 세로가 짧은 방은 위아래에 검은 띠가 남았다.
//   화면을 덮을 만큼(cover) 늘리되 **4분의 1 단위로 끊어** 도트가 덜 뭉개지게 한다.
//   사람 크기는 그대로 둔다 — 배경만 가까워지는 셈이다.
function zoomOf(r) {
    const v = run && run.view;
    const vw = (v && v.clientWidth) || 430;
    const vh = (v && v.clientHeight) || 760;
    const need = Math.max(vw / r.w, vh / r.h);
    return Math.max(1, Math.ceil(need * 4) / 4);
}

function paintRoom() {
    const r = roomOf();
    run.z = zoomOf(r);
    const w = Math.round(r.w * run.z), h = Math.round(r.h * run.z);
    run.el.style.width = w + 'px';
    run.el.style.height = h + 'px';
    run.el.style.backgroundImage = 'url("' + P.DIR + r.img + '")';
    run.el.style.backgroundSize = w + 'px ' + h + 'px';
    const t = document.getElementById('plaza-where');
    if (t) t.innerHTML = '<span style="opacity:.8">📍</span> ' + esc(r.n);
    paintExits();
    paintSpots();
}

// 나갈 수 있는 쪽에 화살표를 띄운다
function paintExits() {
    const r = roomOf(), z = zz();
    Array.prototype.forEach.call(run.el.querySelectorAll('.plaza-exit'),
        function (e) { e.remove(); });
    const mk = function (txt, x, y) {
        const e = document.createElement('div');
        e.className = 'plaza-exit';
        e.innerText = txt;
        e.style.left = Math.round(x) + 'px';
        e.style.top = Math.round(y) + 'px';
        run.el.appendChild(e);
    };
    const fy = (r.floor[0] + r.floor[1]) / 2 * z;
    if (r.left)  mk('◀', 8, fy - 70);
    if (r.right) mk('▶', r.w * z - 24, fy - 70);
    if (r.up)    mk('▲', (r.up.x[0] + r.up.x[1]) / 2 * z - 8, r.floor[0] * z - 96);
    if (r.down)  mk('▼', 12, r.floor[1] * z - 22);
}

// ==========================================
// 시설 입구 — 방마다 선 자리
// ==========================================
//
//   누르면 그 시설로 들어간다 (광장은 닫힌다). 없는 시설은 아예 안 세운다.
function spotOk(s) {
    if (s.fn) return typeof window[s.fn] === 'function';
    if (s.tab && !document.getElementById(s.tab)) return false;
    if (s.sub && !document.getElementById(s.sub)) return false;
    return true;
}

function paintSpots() {
    const r = roomOf(), z = zz();
    Array.prototype.forEach.call(run.el.querySelectorAll('.plaza-spot'),
        function (e) { e.remove(); });
    (r.spots || []).forEach(function (s) {
        if (!spotOk(s)) return;
        const e = document.createElement('div');
        e.className = 'plaza-spot';
        e.style.left = Math.round(s.x * z) + 'px';
        e.style.top = Math.round((s.y != null ? s.y : r.floor[0] - 10) * z) + 'px';
        e.innerHTML = '<div class="b">' + s.i + '</div><div class="t">' + esc(s.n) + '</div>';
        e.addEventListener('pointerdown', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            goApp(s);
        });
        run.el.appendChild(e);
    });
}

// 시설·메뉴로 건너간다 — 광장을 닫고 그 탭을 누른 것과 같게 한다
function goApp(s) {
    try {
        shut();
        if (s.fn) {
            const f = window[s.fn];
            if (typeof f === 'function') setTimeout(function () { try { f(); } catch (e) { } }, 40);
            return;
        }
        const hit = function (sel, key) {
            return Array.prototype.filter.call(document.querySelectorAll(sel), function (e) {
                return (e.getAttribute('onclick') || '').indexOf("'" + key + "'") >= 0;
            })[0];
        };
        const t = s.tab && hit('.tabs-grid .tab', s.tab);
        if (t) t.click();
        else if (s.tab && typeof switchTabById === 'function') switchTabById(s.tab);
        if (s.sub) {
            setTimeout(function () {
                const b = hit('.sub-tab', s.sub);
                if (b) b.click();
            }, 40);
        }
    } catch (e) { }
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

    // ★ 방을 먼저 그린다 — 그래야 늘린 배(run.z)가 정해져 사람이 제자리에 선다
    paintRoom();

    // 사람을 다시 만든다 (배율이 방마다 다르다)
    const u = u_();
    run.me = makeOne(u, nameOf(u), run.k);
    run.el.appendChild(run.me.wrap);
    putOne(run.me, run.x, run.y);

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
    const r = roomOf(), z = zz();
    const rw = r.w * z, rh = r.h * z;
    const vw = run.view.clientWidth || rw;
    const vh = run.view.clientHeight || rh;
    // 방이 창보다 작으면 **가운데로** 둔다 (왼위로 붙여 두면 검은 띠가 남는다)
    let cx = -(vw - rw) / 2, cy = -(vh - rh) / 2;
    if (rw > vw) cx = Math.max(0, Math.min(rw - vw, run.x * z - vw / 2));
    if (rh > vh) cy = Math.max(0, Math.min(rh - vh, run.y * z - vh * 0.62));
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

// 글줄은 **들고 있다가** 창을 열 때 그린다 (창이 닫혀 있어도 안 잃는다)
function pushLine(o) {
    if (!run) return;
    if (!run.lines) run.lines = [];
    run.lines.push(o);
    while (run.lines.length > P.CHAT_KEEP + 10) run.lines.shift();
    paintLog();
    paintBar(o);
}

function paintLog() {
    const log = document.getElementById('plaza-log');
    if (!log || !run) return;
    log.innerHTML = (run.lines || []).map(function (o) {
        return o.sys ? '<div class="sys">· ' + esc(o.t) + '</div>'
                     : '<div><span class="who">' + esc(o.n) + '</span> ' + esc(o.t) + '</div>';
    }).join('');
    log.scrollTop = log.scrollHeight;
}

// 아래 채팅 바에 마지막 말을 비춘다 — 창을 안 열어도 뭐가 오가는지 보인다
function paintBar(o) {
    const bar = document.getElementById('plaza-bar');
    if (!bar || !o) return;
    const t = bar.querySelector('.txt');
    if (t) {
        t.innerHTML = o.sys ? '<span style="opacity:.65">· ' + esc(o.t) + '</span>'
            : '<span class="last"><b style="color:#9fd8ef">' + esc(o.n) + '</b> ' + esc(o.t) + '</span>';
    }
    if (!o.sys && !sheetOpen('chat')) bar.classList.add('new');     // 사람 말에만 빨간 점
}

function addLine(who, text, code) {
    pushLine({ n: who, t: text, c: code });
}

function sysLine(text) {
    pushLine({ sys: 1, t: text });
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
// 아래에서 올라오는 창 (메뉴 · 가방 · 말)
// ==========================================
function sheetOpen(kind) {
    const s = document.getElementById('plaza-sheet');
    if (!s) return false;
    return kind ? (s.dataset.kind === kind) : true;
}

function closeSheet() {
    const s = document.getElementById('plaza-sheet');
    if (s) s.remove();
    if (run) { run.ax = 0; run.ay = 0; run.keys = {}; }
}

//   바깥(어두운 자리)을 누르면 닫힌다. 안쪽을 눌러도 안 닫힌다.
function sheet(kind, title, inner) {
    closeSheet();
    const ov = document.getElementById('plaza-ov');
    if (!ov) return null;
    const s = document.createElement('div');
    s.id = 'plaza-sheet';
    s.dataset.kind = kind;
    s.innerHTML = '<div class="plaza-card"><div class="grip"></div>'
        + (title ? '<h4>' + esc(title) + '</h4>' : '') + inner + '</div>';
    s.addEventListener('pointerdown', function (e) {
        if (e.target === s) closeSheet();
        e.stopPropagation();
    });
    ov.appendChild(s);
    return s;
}

// ── ☰ 메뉴
function menuSheet() {
    const list = P.MENU.filter(spotOk);
    const html = '<div class="plaza-grid">' + list.map(function (m, i) {
        return '<button data-i="' + i + '"><span class="e">' + m.i + '</span>'
            + esc(m.n) + '</button>';
    }).join('') + '</div>';
    const s = sheet('menu', '어디로 갑니까', html);
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('.plaza-grid button'), function (b) {
        b.onclick = function () { goApp(list[Number(b.dataset.i)]); };
    });
}

// ── 💬 말
function sendSay() {
    const el = document.getElementById('plaza-in');
    if (!el) return;
    say(el.value);
    el.value = '';
}

function chatSheet() {
    const bar = document.getElementById('plaza-bar');
    if (bar) bar.classList.remove('new');
    const s = sheet('chat', '', '<div id="plaza-log"></div>'
        + '<div id="plaza-send">'
        + '<input id="plaza-in" maxlength="' + P.SAY_MAX + '" placeholder="여기에 적으면 머리 위에 뜹니다">'
        + '<button id="plaza-go">말한다</button></div>');
    if (!s) return;
    paintLog();
    s.querySelector('#plaza-go').onclick = sendSay;
    const inp = s.querySelector('#plaza-in');
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendSay(); });
    setTimeout(function () { try { inp.focus(); } catch (e) { } }, 60);
}

// ── 🎒 가방 — 소지품 · 악세 · 의상
//
//   옷장(closet.js)이 쓰는 표를 그대로 읽는다. 고르면 바로 적히고
//   가운데 선 사람이 그 자리에서 갈아입는다.
function allowedIt(it, u) {
    try {
        if (it.admin) return !!(u && u.code === P.ADMIN);
        if (it.nos) {
            if (u && u.code === P.ADMIN) return true;
            const n = (u && u.no != null) ? String(u.no).trim() : '';
            if (!n) return false;
            const p4 = n.length < 4 ? ('0000' + n).slice(-4) : n;
            return it.nos.some(function (x) { return x === n || x === p4; });
        }
    } catch (e) { }
    return true;
}

function dotOf(u) {
    if (!u.dot || typeof u.dot !== 'object') u.dot = {};
    return u.dot;
}

function saveDot() {
    try { if (typeof saveFields === 'function') saveFields({ dot: 1 }); } catch (e) { }
    // 광장에 선 내 모습도 바로 갈아입힌다
    try {
        if (run && run.me) {
            run.me.actor.stop();
            run.me.wrap.remove();
            const u = u_();
            run.me = makeOne(u, nameOf(u), run.k);
            run.el.appendChild(run.me.wrap);
            putOne(run.me, run.x, run.y);
            run.sx = -9999; run.sent = 0;         // 남에게도 다시 알린다
        }
    } catch (e) { }
}

let bagTab = 'wear';

function bagSheet(which) {
    const u = u_(); if (!u) return;
    if (which) bagTab = which;
    const tabs = [['bag', '소지품'], ['acc', '악세'], ['wear', '의상']];
    const body = (bagTab === 'bag') ? bagInv(u) : bagWear(u, bagTab === 'acc');
    const s = sheet('bag', '', '<div class="plaza-tabs">'
        + tabs.map(function (t) {
            return '<button data-t="' + t[0] + '"' + (bagTab === t[0] ? ' class="on"' : '') + '>'
                + t[1] + '</button>';
        }).join('') + '</div><div id="plaza-bagbody">' + body + '</div>');
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('.plaza-tabs button'), function (b) {
        b.onclick = function () { bagSheet(b.dataset.t); };
    });
    bagStage(s);
    Array.prototype.forEach.call(s.querySelectorAll('.pick button'), function (b) {
        b.onclick = function () {
            const d = dotOf(u_());
            d[b.dataset.k] = b.dataset.v;
            saveDot();
            bagSheet();
        };
    });
}

// 가운데 선 사람 — 고를 때마다 다시 그린다
function bagStage(s) {
    const host = s.querySelector('.plaza-stage');
    if (!host || typeof window.dotSprite !== 'function') return;
    try {
        const el = window.dotSprite(u_(), { pose: 'stand', scale: 1 });
        host.appendChild(el);
    } catch (e) { }
}

function bagInv(u) {
    const inv = Array.isArray(u.inventory) ? u.inventory : [];
    if (!inv.length) return '<div class="plaza-none">가진 것이 없습니다.</div>';
    const cnt = {};
    inv.forEach(function (x) { const n = String(x); cnt[n] = (cnt[n] || 0) + 1; });
    return '<div class="plaza-inv">' + Object.keys(cnt).map(function (n) {
        return '<div>' + esc(n) + (cnt[n] > 1 ? ' <b style="color:#d9a05a">×' + cnt[n] + '</b>' : '') + '</div>';
    }).join('') + '</div>';
}

function bagWear(u, accOnly) {
    if (typeof DOT_SLOTS === 'undefined' || typeof DOT_HEADS === 'undefined') {
        return '<div class="plaza-none">옷장이 아직 안 올라왔습니다.</div>';
    }
    const d = dotOf(u);
    const row = function (lab, k, list, nowV) {
        const on = list.filter(function (x) { return allowedIt(x, u); });
        if (on.length < 2) return '';
        return '<div class="plaza-row"><span class="lab">' + lab + '</span><div class="pick">'
            + on.map(function (x) {
                return '<button data-k="' + k + '" data-v="' + esc(x.i) + '"'
                    + (x.i === nowV ? ' class="on"' : '') + '>' + esc(x.n) + '</button>';
            }).join('') + '</div></div>';
    };
    let rows = '';
    if (accOnly) {
        DOT_SLOTS.forEach(function (s) {
            if (s.k !== 'acc') return;
            rows += row(s.n, s.k, s.items, d[s.k] || '');
        });
        if (!rows) rows = '<div class="plaza-none">가진 악세가 없습니다.</div>';
    } else {
        const nowHead = DOT_HEADS.some(function (h) { return h.i === d.head; }) ? d.head : DOT_HEADS[0].i;
        rows += row('머리', 'head', DOT_HEADS, nowHead);
        DOT_SLOTS.forEach(function (s) {
            if (s.k === 'acc') return;
            rows += row(s.n, s.k, s.items, d[s.k] || '');
        });
        if (!rows) rows = '<div class="plaza-none">갈아입을 것이 없습니다.</div>';
    }
    return '<div class="plaza-stage"></div>' + rows;
}

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
    if (run.onSize) window.removeEventListener('resize', run.onSize);
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

    // 손가락으로 만지는 기계인가 — 자판이 있는 쪽에만 방향 단추를 둔다
    const touch = !!(('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);

    const ov = document.createElement('div');
    ov.id = 'plaza-ov';
    ov.innerHTML =
        '<div id="plaza-view"><div id="plaza-room"></div></div>'
        + '<div id="plaza-top">'
        + '<div id="plaza-where">🚶 광장</div>'
        + '<div class="sp"></div>'
        + '<button class="plaza-ico" id="plaza-menu">☰</button>'
        + '<button class="plaza-ico" id="plaza-x">✕</button>'
        + '</div>'
        + '<div id="plaza-who"></div>'
        + (touch ? '' :
            '<div id="plaza-pad">'
            + '<button data-k="left">◀</button>'
            + '<button data-k="up">▲</button>'
            + '<button data-k="down">▼</button>'
            + '<button data-k="right">▶</button>'
            + '</div>')
        + '<div id="plaza-bottom">'
        + '<button class="plaza-ico" id="plaza-bag">🎒</button>'
        + '<div id="plaza-bar"><span class="dot"></span>'
        + '<span class="txt">여기에 적으면 머리 위에 뜹니다</span></div>'
        + '</div>';
    document.body.appendChild(ov);
    stampSafe(ov);

    run = {
        room: null, el: document.getElementById('plaza-room'),
        view: document.getElementById('plaza-view'),
        peers: {}, keys: {}, ax: 0, ay: 0, x: 0, y: 0, tx: null, ty: null,
        cx: 0, cy: 0, last: performance.now(), raf: 0, z: 1,
        sx: -9999, sy: -9999, sent: 0, sMoving: false, sFace: 1,
        say: '', sayAt: 0, sSayAt: 0, k: 0.75, ref: null, me: null
    };

    // ─ 안 보이는 조이스틱 — 화면 아무 데나 짚어 끌면 그쪽으로 걷는다
    //
    //   짚은 **그 자리**가 조이스틱 한가운데가 된다. 그래서 손잡이를 찾아
    //   짚을 것도 없고, 화면에 아무것도 안 띄워도 된다.
    //   끌지 않고 톡 치기만 하면 전처럼 **그 자리로 걸어간다.**
    (function stick() {
        const DEAD = 12;              // 이만큼 끌어야 걷기로 본다 (손 떨림 몫)
        const REACH = 64;             // 이만큼 끌면 가장 빠르다
        const TAP_MS = 320;
        let id = null, ox = 0, oy = 0, at = 0, drag = false;

        const stop_ = function () { if (run) { run.ax = 0; run.ay = 0; } };
        run.view.addEventListener('pointerdown', function (e) {
            if (!run) return;
            if (e.target && e.target.closest && e.target.closest('.plaza-spot')) return;
            id = e.pointerId; ox = e.clientX; oy = e.clientY; at = now(); drag = false;
            try { run.view.setPointerCapture(id); } catch (x) { }
        });
        run.view.addEventListener('pointermove', function (e) {
            if (!run || id === null || e.pointerId !== id) return;
            const dx = e.clientX - ox, dy = e.clientY - oy;
            const d = Math.hypot(dx, dy);
            if (!drag && d < DEAD) return;
            drag = true;
            e.preventDefault();
            const m = Math.min(1, (d - DEAD) / (REACH - DEAD));
            run.ax = dx / d * m;
            run.ay = dy / d * m;
            run.tx = null;                        // 끌면 눌러 둔 자리는 버린다
        });
        const up = function (e) {
            if (id === null || (e && e.pointerId !== undefined && e.pointerId !== id)) return;
            id = null;
            stop_();
            // 끌지 않고 톡 쳤으면 그 자리로 걸어간다
            if (!drag && now() - at < TAP_MS && run) {
                const r = roomOf(), z = zz();
                const b = run.view.getBoundingClientRect();
                const x = (e.clientX - b.left + run.cx) / z;
                const y = (e.clientY - b.top + run.cy) / z;
                run.tx = Math.max(P.EDGE, Math.min(r.w - P.EDGE, x));
                run.ty = Math.max(r.floor[0], Math.min(r.floor[1], y));
            }
            drag = false;
        };
        run.view.addEventListener('pointerup', up);
        run.view.addEventListener('pointercancel', up);
        run.view.addEventListener('lostpointercapture', up);
    })();

    // 창 크기가 바뀌면 (화면을 돌리거나 자판이 올라오면) 다시 맞춘다
    run.onSize = function () {
        if (!run || !run.room) return;
        stampSafe(ov);
        paintRoom();
        Object.keys(run.peers).forEach(function (c) {
            const q = run.peers[c]; putOne(q.one, q.x, q.y);
        });
        putOne(run.me, run.x, run.y);
        camera(true);
    };
    window.addEventListener('resize', run.onSize);

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
            if (e.key === 'Enter') sendSay();
            return;
        }
        const k = KEY[e.key];
        if (k) { run.keys[k] = true; run.tx = null; e.preventDefault(); }
        if (e.key === 'Escape') { if (sheetOpen()) closeSheet(); else shut(); }
    };
    run.onKeyUp = function (e) { const k = KEY[e.key]; if (k && run) run.keys[k] = false; };
    window.addEventListener('keydown', run.onKey);
    window.addEventListener('keyup', run.onKeyUp);

    document.getElementById('plaza-x').onclick = shut;
    document.getElementById('plaza-menu').onclick = menuSheet;
    document.getElementById('plaza-bag').onclick = bagSheet;
    document.getElementById('plaza-bar').onclick = chatSheet;

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
