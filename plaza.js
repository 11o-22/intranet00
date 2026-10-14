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
// ■ 방 여섯과 길 (주신 지도대로)
//
//       [백일몽]                                     [재난관리국]
//          ↑                                              ↑
//     [백일몽 앞] ↔ [카지노] ↔ [광장] ↔ [재난관리국 앞]
//
//   좌우는 화면 끝까지 걸어가면 넘어간다. 건물 안으로는 **문 앞에서만**
//   올라가고, 안에서 아래로 내려오면 도로 나온다.
//
// ■ 두 층 — 길과 지하
//
//   주신 그림은 한 장에 **길(위층)과 지하(B1)**가 같이 그려져 있다.
//   그래서 방마다 바닥 띠를 둘 둔다 (floor · floor2).
//
//   광장과 재난관리국 앞에는 **비스듬한 계단**이 있다 (stairs). 계단 자리는
//   x 를 따라 바닥선이 같이 기울어서, 앞으로 내려선 뒤 옆으로 걸으면 그대로
//   오르내린다 — 순간이동이 없다. 계단이 없는 방은 한 층만 쓴다.
//   지하에서는 옆 방으로 넘어가지 않는다. 그 방 계단으로만 오르내린다.
//
// ■ 크기를 어떻게 맞췄나
//
//   방 그림(1880×1672)은 **세로가 창에 꼭 맞게** 줄여 쓴다. 그래서 한 장이
//   통째로 보이고, 카메라는 좌우로만 민다. 그림 아래쪽 어두운 자리는
//   **채팅이 덮는 여백**이라 일부러 비워 두었다.
//
//   사람은 방의 k 에 그 줄인 배를 곱하되 **4분의 1 단위로 끊는다.**
//   흔한 손전화(세로 700~1000)에서는 0.5배(키 128px)로 떨어진다.
//   끊는 까닭은 paintRoom 에 적어 두었다 — 안 끊으면 도트가 울퉁불퉁해진다.
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
//       plazaGo('plaza')   그 방으로 건너뛴다
//       plazaState()       지금 어디에 누구와 있나
//       plazaRooms()       방과 길
//
// ※ 방 그림은 plaza/*.webp 입니다 (원경·중경·전경 세 장을 한 장으로 합쳤습니다).
//   바꾸시려면 같은 이름으로 덮으시고, 크기가 달라지면 아래 ROOMS 의
//   w·h·floor·floor2·stairs 를 같이 고쳐 주십시오.

const PLAZA = {
    DIR: 'plaza/',
    ADMIN: 'kario0987',
    ADMIN_ONLY: false,          // 상담사만 들이려면 true
    PATH: 'plazaRoom',          // 서버에 자리를 적는 자리
    CHAT: 'plazaChat',          // 서버에 말을 적는 자리

    SPEED: 180,                 // 1초에 몇 픽셀 걷나 (방이 1880px 로 넓어져 올렸다)
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
    // 방 — w·h 는 그림 크기, floor 는 **위층** 발이 닿는 y 띠,
    //      floor2 는 **지하(B1)** 띠, stairs 는 두 층을 잇는 계단의 x 자리.
    //      k 는 사람 배율, up/down 은 건물 안팎을 드나드는 자리,
    //      spots 는 시설 입구 { x, n, i, tab, sub | fn, lv } (lv:1 이면 지하).
    //
    //   ■ 길 (주신 지도대로)
    //
    //       [백일몽]                                   [재관국]
    //          ↑                                          ↑
    //     [백일몽 앞] ↔ [카지노] ↔ [광장] ↔ [재관국 앞]
    //
    //     좌우는 화면 끝까지 걸어가면 넘어가고, **지하도 좌우로 이어진다** —
    //     지하에서 옆 방으로 가면 그쪽 지하로 나온다.
    //     위(건물 안)로는 정해진 자리에서만 올라간다.
    // 방 — w·h 는 그림 크기, floor 는 **위층** 발이 닿는 y 띠,
    //      floor2 는 **지하(B1)** 띠 (x2 는 지하에서 다닐 수 있는 x 폭),
    //      stairs 는 두 층을 잇는 **비스듬한 계단**
    //        { x:[왼,오], y0:[왼쪽 끝 윗선, 오른쪽 끝 윗선], y1:[…아랫선…] }
    //        x 를 따라 윗선·아랫선이 같이 내려가므로, 계단에서는 옆으로
    //        걸으면 저절로 오르내린다.
    //      k 는 사람 배율, up/down 은 건물을 드나드는 자리,
    //      spots 는 시설 입구 { x, n, i, tab, sub | fn, lv } (lv:1 이면 지하).
    //
    //   ■ 길 (주신 지도대로)
    //
    //       [백일몽]                                   [재난관리국]
    //          ↑                                            ↑
    //     [백일몽 앞] ↔ [카지노] ↔ [광장] ↔ [재난관리국 앞]
    //
    //     좌우는 화면 끝까지 걸어가면 넘어간다. 건물 안으로는 문 앞에서만
    //     올라가고, 지하는 **그 방의 계단**으로만 오르내린다.
    ROOMS: {
        dfront: { n: '백일몽 건물 앞', img: 'dfront.webp', w: 1880, h: 1672,
                  floor: [600, 725], k: 1,
                  right: 'casino', up: { to: 'dream', x: [760, 1130] },
                  spots: [ { x: 300, n: '??? (지하)', i: '❓', tab: 'tab-shop', sub: 'shop-unknown' } ] },

        dream:  { n: '백일몽 주식회사', img: 'dream.webp', w: 1880, h: 1672,
                  floor: [1015, 1105], k: 1,
                  down: 'dfront',
                  spots: [ { x: 540,  n: '사택',        i: '🏠', tab: 'tab-house', sub: 'house-main' },
                           { x: 940,  n: '어둠 탐사',   i: '🌑', tab: 'tab-darkness', sub: 'dark-main' },
                           { x: 1340, n: '유쾌 판매소', i: '🛒', tab: 'tab-shop', sub: 'shop-regular' } ] },

        casino: { n: '카지노 거리', img: 'casino.webp', w: 1880, h: 1672,
                  floor: [625, 725], k: 1,
                  left: 'dfront', right: 'plaza',
                  spots: [ { x: 940, n: '공용시설', i: '🎲', tab: 'tab-public' } ] },

        plaza:  { n: '광장', img: 'plaza.webp', w: 1880, h: 1672,
                  floor: [615, 710], floor2: [1040, 1112], x2: [340, 1540], k: 1,
                  stairs: [ { x: [150, 340],   y0: [700, 1040], y1: [762, 1112] },
                            { x: [1540, 1730], y0: [1040, 700], y1: [1112, 762] } ],
                  left: 'casino', right: 'gate',
                  spots: [ { x: 470,  n: '행복 식당',   i: '🍚', tab: 'tab-shop', sub: 'shop-food' },
                           { x: 1400, n: '장기 은행',   i: '🏦', tab: 'tab-vip' },
                           { x: 1650, n: '펫 돌보기',   i: '🐾', fn: 'petOpen' },
                           { x: 700,  n: '밀실 거래',   i: '🤝', lv: 1, tab: 'tab-shop', sub: 'shop-p2p' },
                           { x: 1180, n: '우주 쇼핑몰', i: '🛸', lv: 1, tab: 'tab-shop', sub: 'shop-alien' } ] },

        gate:   { n: '재난관리국 앞', img: 'gate.webp', w: 1880, h: 1672,
                  floor: [630, 730], floor2: [1030, 1105], x2: [630, 1280], k: 1,
                  stairs: [ { x: [430, 630],   y0: [690, 1030], y1: [752, 1105] },
                            { x: [1280, 1480], y0: [1030, 690], y1: [1105, 752] } ],
                  left: 'plaza', up: { to: 'bureau', x: [780, 1120] },
                  spots: [ { x: 940, n: '망상 홈쇼핑', i: '📺', lv: 1, tab: 'tab-shop', sub: 'shop-dream' } ] },

        bureau: { n: '재난관리국', img: 'bureau.webp', w: 1880, h: 1672,
                  floor: [1000, 1078], k: 1,
                  down: 'gate',
                  spots: [ { x: 630,  n: '사택',      i: '🏠', tab: 'tab-house', sub: 'house-main' },
                           { x: 940,  n: '재난 탐사', i: '🌑', tab: 'tab-darkness', sub: 'dark-main' },
                           { x: 1230, n: '파티',      i: '🚩', tab: 'tab-darkness', sub: 'dark-party' } ] }
    },
    START: 'plaza',

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
        // 사원증 칸 — 사진 · 닉네임 · 사번(작게)
        '#plaza-me{min-width:0;max-width:58%;display:flex;align-items:center;gap:8px;',
        '  padding:6px 13px 6px 6px;border-radius:999px;cursor:pointer;font-family:inherit;',
        '  background:rgba(14,14,20,.62);border:1px solid rgba(190,170,120,.3);',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#plaza-me:active{background:rgba(40,36,28,.85);}',
        '#plaza-me .pm-pic{flex:0 0 auto;width:32px;height:32px;border-radius:50%;overflow:hidden;',
        '  background:rgba(255,255,255,.07);border:1px solid rgba(190,170,120,.28);',
        '  display:flex;align-items:center;justify-content:center;font-size:8px;color:#6f685c;}',
        '#plaza-me .pm-pic img{width:100%;height:100%;object-fit:cover;}',
        '#plaza-me .pm-txt{min-width:0;display:flex;flex-direction:column;align-items:flex-start;',
        '  gap:1px;line-height:1.15;text-align:left;}',
        '#plaza-me .pm-n{font-size:12.5px;font-weight:bold;color:#f1e7d6;',
        '  max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#plaza-me .pm-no{font-size:9.5px;font-style:normal;color:#9a9284;letter-spacing:.3px;}',
        '#plaza-top .sp{flex:1;}',
        // 안 읽은 공지가 있으면 붙는 점
        '#plaza-notice{position:relative;}',
        '#plaza-notice .nd{position:absolute;top:5px;right:6px;width:8px;height:8px;border-radius:50%;',
        '  background:#ff7b6b;box-shadow:0 0 7px #ff7b6b;display:none;}',
        '#plaza-notice.new .nd{display:block;}',
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
        '.plaza-say.emo{padding:4px;line-height:0;max-width:none;}',
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
        // ── 채팅 내역 : 왼쪽 아래에 **늘 깔려 있다** (창을 안 열어도 보인다)
        //   그림 아래쪽 어두운 자리에 얹히므로 방이 가려지지 않는다.
        '#plaza-feed{position:absolute;left:12px;z-index:18;max-width:62%;',
        '  bottom:calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 74px);',
        '  display:flex;flex-direction:column;justify-content:flex-end;gap:2px;',
        '  font-size:11px;line-height:1.55;pointer-events:none;',
        '  text-shadow:0 1px 3px #000,0 0 5px #000;}',
        '#plaza-feed div{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ded5c4;}',
        '#plaza-feed .who{color:#9fd8ef;font-weight:bold;}',
        '#plaza-feed .sys{color:#8d8578;}',
        // ── 미니맵 : 오른쪽 아래. 채팅 창을 열면 사라진다.
        '#plaza-map{position:absolute;right:12px;z-index:19;width:116px;',
        '  bottom:calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 74px);',
        '  padding:7px 8px 8px 8px;border-radius:13px;',
        '  background:rgba(12,12,18,.62);border:1px solid rgba(190,170,120,.26);',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#plaza-map.off{display:none;}',
        '#plaza-map .mp-n{font-size:10px;font-weight:bold;color:#ffe9bd;margin-bottom:5px;',
        '  text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#plaza-map .mp-g{display:grid;gap:3px;}',
        '#plaza-map .mp-c{height:15px;border-radius:4px;background:rgba(255,255,255,.055);',
        '  border:1px solid rgba(255,255,255,.1);position:relative;}',
        '#plaza-map .mp-c.none{background:none;border-color:transparent;}',
        '#plaza-map .mp-c.on{background:rgba(217,160,90,.4);border-color:#d9a05a;',
        '  box-shadow:0 0 7px rgba(217,160,90,.5);}',
        // 위아래로 이어진 자리에 잇는 금
        '#plaza-map .mp-c.up:after{content:"";position:absolute;left:50%;top:-4px;',
        '  width:1px;height:4px;background:rgba(190,170,120,.45);}',
        // ── 아래 띠 : 이모티콘 · 채팅 바 · 가방
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
        '.plaza-stage{display:flex;justify-content:center;padding:4px 0 10px 0;overflow:hidden;',
        '  background:radial-gradient(ellipse at 50% 92%,rgba(217,160,90,.13),rgba(0,0,0,0) 62%);}',
        // ★ 칸이 384 로 커지며 머리 위가 29도트까지 넓어졌다. 마네킹은
        //   그만큼 비어 보이므로 위를 걷어 낸다 (모자·베일 자리는 남긴다).
        //   아래는 발밑 빈 몫(FOOT)만큼 당겨 발이 바닥에 서게 한다.
        '.plaza-stage .dot-box{margin-top:-64px;margin-bottom:-26px;}',
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
        '.plaza-none{padding:24px 0;text-align:center;font-size:11.5px;color:#7d7568;}',
        // 공지판
        '#plaza-nb{overflow-y:auto;max-height:58dvh;display:flex;flex-direction:column;gap:8px;}',
        '.nb-i{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.035);',
        '  border:1px solid #2b2b38;}',
        '.nb-h{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:10px;color:#8d8578;}',
        '.nb-h span:first-child{color:#ffe9bd;font-weight:bold;}',
        '.nb-h .nb-x{margin-left:auto;padding:4px 9px;font-size:10px;border-radius:7px;cursor:pointer;',
        '  background:rgba(255,120,110,.12);border:1px solid #6e3630;color:#ffb3ab;font-family:inherit;}',
        '.nb-t{font-size:12px;line-height:1.65;color:#ded5c4;word-break:break-word;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 사람 하나 — 나든 남이든 같은 것을 쓴다
// ==========================================
// ★ 칸 크기를 여기에 베껴 적지 않는다 — 옷장(closet.js)에 물어본다.
//   예전에는 208·256 을 그대로 적어 두어서, 옷 그림 규격이 288·384 로
//   바뀌었을 때 옷장은 멀쩡한데 광장에서만 어긋났다.
function spec() {
    try {
        if (typeof window.dotSpec === 'function') return window.dotSpec();
    } catch (e) { }
    return { W: 288, H: 384, FOOT: 32 };
}

function makeOne(user, label, k) {
    const wrap = document.createElement('div');
    wrap.className = 'plaza-one';
    const sp = spec();
    const w = sp.W * k, h = sp.H * k;
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    const a = window.dotActor(user, { scale: k });
    wrap.appendChild(a.el);

    const tag = document.createElement('div');
    tag.className = 'plaza-tag';
    //   칸 위쪽 여백이 4도트에서 29도트로 늘어, 꼭대기에 붙이면 머리에서
    //   한참 떠 버린다. 머리 언저리(빈 몫의 절반쯤)로 내려 붙인다.
    tag.style.top = Math.round(sp.H * k * 0.22) + 'px';
    tag.innerText = label || '';
    wrap.appendChild(tag);

    // foot = 칸 아래끝에서 발바닥까지 빈 몫. 이만큼 내려 놓아야 땅에 닿는다.
    return { wrap: wrap, actor: a, tag: tag, w: w, h: h, foot: sp.FOOT * k, bub: null };
}

// ★ 배(run.k)가 바뀌면 서 있는 사람들을 그 배로 다시 만든다.
//   화면을 돌리거나 자판이 올라오면 창 높이가 달라져 z 가 바뀐다. 그때
//   배경만 다시 그리면 사람만 옛 배로 남아 혼자 크거나 작아 보인다.
function remakeFolk() {
    if (!run) return;
    if (run.me) {
        try { run.me.actor.stop(); } catch (e) { }
        run.me.wrap.remove();
        const u = u_();
        run.me = makeOne(u, nameOf(u), run.k);
        run.el.appendChild(run.me.wrap);
    }
    Object.keys(run.peers).forEach(function (c) {
        const q = run.peers[c];
        let d = {};
        try { d = JSON.parse(q.key) || {}; } catch (e) { }
        const lab = q.one.tag.innerText;
        try { q.one.actor.stop(); } catch (e) { }
        q.one.wrap.remove();
        q.one = makeOne({ code: c, dot: d }, lab, run.k);
        q.one.actor.face(q.face || 1);
        run.el.appendChild(q.one.wrap);
    });
}

// 방 안의 자리(x·y)는 **그림 원래 크기**로 센다. 화면에 놓을 때만 배로 늘린다.
function zz() { return (run && run.z) || 1; }

function putOne(one, x, y) {
    const z = zz();
    one.wrap.style.left = Math.round(x * z - one.w / 2) + 'px';
    // ★ 칸 아래끝이 곧 발이 아니다 — 새 규격은 발밑이 여덟 도트 비어 있다.
    //   그만큼(foot) 도로 내려 놓아야 땅에 선다.
    one.wrap.style.top = Math.round(y * z - (one.h - (one.foot || 0))) + 'px';
    one.wrap.style.zIndex = String(100 + Math.round(y));     // 아래에 있는 사람이 앞
}

// ★ 이모티콘은 말풍선 길을 그대로 탄다.
//   자리 기록에 싣는 글자가 [emo:e01] 꼴이면 글 대신 그림을 띄운다.
//   따로 길을 내지 않은 까닭은, 말풍선이 뜨고 지는 셈(SAY_MS·st)을
//   두 벌로 만들면 어긋나기 때문이다.
const EMO_RE = /^\[emo:([A-Za-z0-9_-]{1,12})\]$/;
function bubble(one, text) {
    if (one.bub) { one.bub.remove(); one.bub = null; }
    if (!text) return;
    const b = document.createElement('div');
    b.className = 'plaza-say';
    const m = EMO_RE.exec(String(text));
    if (m && typeof window.emoTag === 'function' && typeof window.emoById === 'function'
        && window.emoById(m[1])) {
        b.classList.add('emo');
        b.innerHTML = window.emoTag(m[1], 64);
    } else {
        b.innerText = text;
    }
    one.wrap.appendChild(b);
    one.bub = b;
}

// ==========================================
// 방을 연다
// ==========================================
function roomOf() { return R[run.room]; }

// ==========================================
// ★ 층 — 한 방에 위층과 지하가 같이 있다
// ==========================================
//
//   주신 그림은 한 장에 **위층(길)과 지하(B1)**가 같이 그려져 있고, 계단이
//   둘을 잇는다. 그래서 방마다 바닥 띠를 둘 둔다 (floor · floor2).
//
//   · 계단 자리(stairs)의 x 안에서는 두 띠 사이가 **뚫려 있다.** 그 안에서는
//     y 가 위층 꼭대기부터 지하 바닥까지 그대로 움직인다 — 계단을 걸어
//     내려가는 것으로 보인다. 순간이동이 없다.
//   · 계단 밖에서는 지금 있는 층의 띠 안에만 머문다.
//   · 옆 방으로 넘어갈 때는 **있던 층 그대로** 간다. 지하에서 옆으로 가면
//     그쪽 지하로 나온다 (지하도 좌우로 이어져 있다).
function bandOf(r, lv) {
    return (lv === 1 && r.floor2) ? r.floor2 : r.floor;
}
function stairAt(r, x) {
    const st = r.stairs;
    if (!st || !st.length || !r.floor2) return null;
    for (let i = 0; i < st.length; i++) {
        if (x >= st[i].x[0] && x <= st[i].x[1]) return st[i];
    }
    return null;
}
// 계단 위 — x 를 따라 윗선·아랫선이 같이 기운다
function stairBand(s, x) {
    const t = Math.max(0, Math.min(1, (x - s.x[0]) / Math.max(1, s.x[1] - s.x[0])));
    return [s.y0[0] + (s.y0[1] - s.y0[0]) * t, s.y1[0] + (s.y1[1] - s.y1[0]) * t];
}
// 지금 x 에서 발이 닿을 수 있는 y 범위
//
//   ★ 계단은 **길 앞쪽으로** 내려간다. 그래서 위층에 서 있을 때는 길(위층 띠)과
//     계단이 **둘 다** 열려 있어야 한다 — 안 그러면 계단 x 를 지나는 순간
//     끌려 내려가서, 그 너머(옆 방으로 가는 길)로는 영영 못 간다.
function yRange(r, x, lv) {
    const s = stairAt(r, x);
    if (!s) return bandOf(r, lv);
    const b = stairBand(s, x);
    if (lv === 1) return b;                       // 지하 쪽에서는 계단만
    return [r.floor[0], b[1]];                    // 위층에서는 길 + 계단 아래까지
}
// 지금 x 에서 걸어 다닐 수 있는 가로 폭 (지하는 좁을 수 있다)
function xRange(r, lv) {
    if (lv === 1 && r.x2) {
        let lo = r.x2[0], hi = r.x2[1];
        (r.stairs || []).forEach(function (s) {          // 계단 자리까지는 갈 수 있어야 한다
            lo = Math.min(lo, s.x[0]); hi = Math.max(hi, s.x[1]);
        });
        return [lo, hi];
    }
    return [P.EDGE, r.w - P.EDGE];
}
function lvAt(r, y) {
    if (!r.floor2) return 0;
    const mid = (r.floor[1] + r.floor2[0]) / 2;
    return y >= mid ? 1 : 0;
}

// 방 그림을 **세로로 화면에 꼭 맞춘다.**
//
//   전에는 화면을 덮을 만큼(cover) 늘려서, 그림이 창보다 위아래로도 컸다.
//   그래서 걸을 때마다 카메라가 위아래로 따라 움직여, 분수 윗머리나 지하가
//   번갈아 잘려 보였다. 주신 그림은 **한 장에 길과 지하가 같이** 그려져
//   있으므로 세로는 통째로 보여야 그림이 그림대로 보인다.
//
//       z = 창 높이 ÷ 그림 높이      ← 세로가 딱 맞는다 (위아래로 안 움직인다)
//
//   가로는 1880 × z 가 창보다 넓어 여전히 **좌우로만** 민다.
//   (393×852 짜리 화면이면 z 는 0.51, 방은 958px 폭이 된다 — 565px 를 민다)
//
//   ★ 4분의 1 단위로 끊던 것을 그만두었다. 끊으면 세로가 딱 안 맞아
//     위아래로 또 움직이게 된다. 대신 줄여 그릴 때는 nearest 를 끈다.
function zoomOf(r) {
    const v = run && run.view;
    const vh = (v && v.clientHeight) || 760;
    return vh / r.h;
}

function paintRoom() {
    const r = roomOf();
    run.z = zoomOf(r);
    // ★ 사람도 같은 배로 줄이되, **4분의 1 단위로 끊는다.**
    //
    //   사람 그림은 도트 한 칸이 4픽셀이다. 배를 끊지 않으면 (0.38 같은 값)
    //   한 칸이 1.5픽셀처럼 어중간해져서, 찍을 때 어떤 줄만 한 픽셀 더
    //   들어간다 — 눈이 뭉개지고 테두리가 울퉁불퉁해진다.
    //   4분의 1로 끊으면 한 칸이 1·2·3·4 픽셀로 딱 떨어져 어느 화면에서나
    //   고르게 찍힌다. (방 그림은 도트 그림이 아니라 끊지 않고 부드럽게 둔다)
    run.k = Math.max(0.25, Math.round(r.k * run.z * 4) / 4);
    const w = Math.round(r.w * run.z), h = Math.round(r.h * run.z);
    run.el.style.width = w + 'px';
    run.el.style.height = h + 'px';
    // 줄여 그릴 때 nearest(pixelated) 로 찍으면 도트가 깨져 어른거린다
    run.el.style.imageRendering = (run.z < 1) ? 'auto' : 'pixelated';
    run.el.style.backgroundImage = 'url("' + P.DIR + r.img + '")';
    run.el.style.backgroundSize = w + 'px ' + h + 'px';
    paintMap();                     // 미니맵이 방 이름까지 맡는다 (📍 띠를 대신한다)
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
    // 층마다 좌우 화살표를 둔다 (지하도 옆 방으로 이어지므로)
    const bands = [r.floor].concat(r.floor2 ? [r.floor2] : []);
    bands.forEach(function (b) {
        const fy = (b[0] + b[1]) / 2 * z;
        if (r.left)  mk('◀', 8, fy - 70);
        if (r.right) mk('▶', r.w * z - 24, fy - 70);
    });
    if (r.up)    mk('▲', (r.up.x[0] + r.up.x[1]) / 2 * z - 8, r.floor[0] * z - 96);
    if (r.down)  mk('▼', 12, r.floor[1] * z - 22);
    // 계단 — 내려가고 올라가는 자리
    (r.stairs || []).forEach(function (s) {
        if (!r.floor2) return;
        const t = (s.y0[0] < s.y0[1]) ? 0 : 1;            // 위쪽 끝이 어느 쪽인가
        mk('⇵', (t ? s.x[1] : s.x[0]) * z - 8, (r.floor[1] - 4) * z);
    });
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
        const b = bandOf(r, s.lv || 0);
        e.style.left = Math.round(s.x * z) + 'px';
        e.style.top = Math.round((s.y != null ? s.y : b[0] - 10) * z) + 'px';
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
    run.k = r.k;            // 임시 — 아래 paintRoom() 이 늘린 배까지 셈해 다시 적는다

    // ★ 층 — 좌우로 넘어갈 때는 있던 층 그대로 간다 (지하도 이어져 있다).
    //   건물 안팎을 드나들 때(up·down)는 그 방의 바닥으로 내려 세운다.
    if (way === 'left' || way === 'right') {
        if (run.lv === 1 && !r.floor2) run.lv = 0;          // 그쪽에 지하가 없으면 위층으로
    } else {
        run.lv = 0;
    }
    const bnd = bandOf(r, run.lv);

    // 걸어간 쪽의 **반대편**에, 문턱 안쪽으로 들여 선다
    const mid = (bnd[0] + bnd[1]) / 2;
    const band = bnd[1] - bnd[0];
    const inY = Math.min(P.INSET, Math.max(2, band / 3));   // 바닥이 좁으면 그만큼만
    if (way === 'right')      { run.x = P.EDGE + P.INSET;       run.y = mid; }   // → 로 왔으니 왼쪽에
    else if (way === 'left')  { run.x = r.w - P.EDGE - P.INSET; run.y = mid; }   // ← 로 왔으니 오른쪽에
    else if (way === 'up')    { run.x = r.w / 2;  run.y = bnd[1] - inY; }        // ↑ 로 왔으니 아래쪽에
    else if (way === 'down')  { run.x = (r.up && r.up.x) ? (r.up.x[0] + r.up.x[1]) / 2 : r.w / 2;
                                run.y = bnd[0] + inY; }                           // ↓ 로 왔으니 문 앞에
    else                      { run.x = r.w / 2;  run.y = mid; }

    const xr0 = xRange(r, run.lv);
    run.x = Math.max(Math.max(P.EDGE, xr0[0]), Math.min(Math.min(r.w - P.EDGE, xr0[1]), run.x));
    run.y = Math.max(bnd[0], Math.min(bnd[1], run.y));
    run.tx = null;
    run.warp = now();                       // 넘어간 직후에는 또 안 넘어간다
    run.lines = [];                         // 방이 바뀌면 말도 새로 시작한다
    paintFeed();
    run._swept = false;                     // 새 방에서 한 번 쓸어 낸다

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
            // 위로 가는 자리에서 위쪽 끝에 닿으면 올라간다 (위층에서만)
            if (r.up && run.lv !== 1 && run.y <= r.floor[0] + 1
                && run.x >= r.up.x[0] && run.x <= r.up.x[1]) { goRoom(r.up.to, 'up'); return; }
            // 올라온 방에서 아래쪽 끝이면 내려간다
            if (r.down && run.y >= bandOf(r, run.lv)[1] - 1) { goRoom(r.down, 'down'); return; }
        }

        // ─ 바닥 — 계단 위에서는 띠가 x 를 따라 기울어 내려간다
        const xr = xRange(r, run.lv);
        run.x = Math.max(xr[0], Math.min(xr[1], run.x));
        const yr = yRange(r, run.x, run.lv);
        run.y = Math.max(yr[0], Math.min(yr[1], run.y));
        if (stairAt(r, run.x)) run.lv = lvAt(r, run.y);   // 계단 위에서는 높이로 층을 센다
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

// 카메라 — **좌우로만** 민다.
//
//   세로는 zoomOf 가 창에 꼭 맞춰 두었으므로 움직일 일이 없다. 전에는
//   사람을 세로로도 따라가서, 길에서 지하로 내려설 때 화면이 쑥 내려갔다.
function camera(snap) {
    const r = roomOf(), z = zz();
    const rw = r.w * z, rh = r.h * z;
    const vw = run.view.clientWidth || rw;
    const vh = run.view.clientHeight || rh;
    // 방이 창보다 좁으면 **가운데로** 둔다 (왼쪽에 붙이면 한쪽만 검다)
    let cx = -(vw - rw) / 2;
    if (rw > vw) cx = Math.max(0, Math.min(rw - vw, run.x * z - vw / 2));
    if (snap) run.cx = cx;
    else      run.cx += (cx - run.cx) * 0.18;   // 조금 늦게 따라와 부드럽다
    // 세로는 반올림으로 한두 픽셀 남는 것만 가운데로 맞춘다 — 따라오지 않는다
    run.cy = (rh - vh) / 2;
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

    // ★ 들어와 보니 아무도 없으면, 전에 누가 남기고 간 말을 치운다.
    //
    //   나갈 때 지우는 것만으로는 모자라다 — 창을 그냥 닫거나 끊기면 지울
    //   틈이 없다. 그래서 들어온 쪽에서도 한 번 쓸어 낸다. 사람이 있으면
    //   이야기가 이어지는 중이므로 손대지 않는다.
    if (!run._swept) {
        run._swept = true;
        if (!Object.keys(run.peers).length) {
            try { const d = db_(); if (d) d.ref(P.CHAT + '/' + run.room).remove(); } catch (e) { }
            setTimeout(function () {
                if (!run) return;
                run.lines = (run.lines || []).filter(function (o) { return o.sys; });
                paintLog();
            }, 600);
        }
    }
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
    // ★ 광장에서 한 말은 안 남긴다 — **마지막 사람이 나가면 그 방의 말을 지운다.**
    //
    //   들어올 때마다 지우면 안 된다. 남이 아직 안에서 이야기하는 중일 수
    //   있기 때문이다. 그래서 나가는 사람이 「나 말고 아무도 없다」일 때만
    //   지운다. 다음에 들어오면 빈 채로 시작한다.
    try {
        if (!Object.keys(run.peers || {}).length) {
            const d = db_();
            if (d) d.ref(P.CHAT + '/' + run.room).remove();
        }
    } catch (e) { }
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
    // ★ 공지(nbRef)는 여기서 끄지 않는다. 이 함수는 **방을 옮길 때마다**
    //   도는데, 공지는 방과 상관없이 광장에 있는 내내 보고 있어야 한다.
    //   (끄는 자리는 shut() 한 곳뿐이다)
    const log = document.getElementById('plaza-log');
    if (log) log.innerHTML = '';
    chatRef = d.ref(P.CHAT + '/' + run.room).limitToLast(P.CHAT_KEEP);
    chatRef.on('child_added', function (s) {
        const v = s.val() || {};
        if (!v.t) return;
        addLine(v.n || '?', v.t, v.c);
    });
}

// ==========================================
// ★ 사원증 칸 — 사진 · 닉네임 · 사번
// ==========================================
function paintMe() {
    const el = document.getElementById('plaza-me');
    const u = u_();
    if (!el || !u) return;
    const p = u.badge && u.badge.photo;
    el.querySelector('.pm-pic').innerHTML = p ? '<img src="' + esc(p) + '" alt="사진">' : 'PHOTO';
    el.querySelector('.pm-n').innerText = nameOf(u);
    const no = (u.no != null && String(u.no).trim()) ? String(u.no).trim() : (u.code || '');
    el.querySelector('.pm-no').innerText = no ? ('사번 ' + no) : '';
}

// ==========================================
// ★ 미니맵 — 방 표(ROOMS)에서 바로 그려 낸다
//
//   자리를 손으로 잡지 않는다. 가장 왼쪽 방부터 right 를 따라가며 칸을
//   매기고, up 으로 이어진 방은 **그 위 줄**에 같은 칸으로 얹는다.
//   그래서 방을 더 만들어도 여기는 고칠 것이 없다.
//
//       [백일몽]                 [재난관리국]      ← 윗줄 (건물 안)
//      [백일몽앞][카지노][광장][재난관리국앞]      ← 아랫줄 (길)
// ==========================================
let mapPlan = null;
function mapOf() {
    if (mapPlan) return mapPlan;
    let head = P.START, guard = 0;
    while (R[head] && R[head].left && ++guard < 40) head = R[head].left;   // 왼쪽 끝까지
    const col = {}, up = {};
    let c = 0, k = head;
    guard = 0;
    while (k && R[k] && ++guard < 40) {
        col[k] = c++;
        if (R[k].up && R[k].up.to) up[R[k].up.to] = col[k];
        k = R[k].right;
    }
    Object.keys(up).forEach(function (t) { col[t] = up[t]; });
    mapPlan = { col: col, up: up, w: Math.max(1, c) };
    return mapPlan;
}

function paintMap() {
    const el = document.getElementById('plaza-map');
    if (!el || !run) return;
    const m = mapOf(), r = roomOf();
    el.querySelector('.mp-n').innerText = r.n;
    const g = el.querySelector('.mp-g');
    g.style.gridTemplateColumns = 'repeat(' + m.w + ',1fr)';
    const keys = Object.keys(m.col);
    const out = [];
    for (let row = 0; row < 2; row++) {
        for (let x = 0; x < m.w; x++) {
            const key = keys.filter(function (q) {
                return m.col[q] === x && ((m.up[q] != null) === (row === 0));
            })[0];
            out.push('<div class="mp-c'
                + (key ? '' : ' none')
                + (key && key === run.room ? ' on' : '')
                + (key && R[key].up ? ' up' : '') + '"'
                + (key ? ' title="' + esc(R[key].n) + '"' : '') + '></div>');
        }
    }
    g.innerHTML = out.join('');
}

// 채팅 창을 열면 미니맵을 접는다 (그림을 가리지 않게)
function mapShow(on) {
    const el = document.getElementById('plaza-map');
    if (el) el.classList.toggle('off', !on);
}

// ==========================================
// ★ 채팅 내역 — 왼쪽 아래에 늘 깔려 있다
// ==========================================
const FEED_KEEP = 5;
function paintFeed() {
    const el = document.getElementById('plaza-feed');
    if (!el || !run) return;
    const rows = (run.lines || []).slice(-FEED_KEEP);
    el.innerHTML = rows.map(function (o, i) {
        const dim = (0.45 + 0.55 * ((i + 1) / rows.length)).toFixed(2);   // 묵은 줄은 옅게
        return '<div style="opacity:' + dim + '">' + (o.sys
            ? '<span class="sys">· ' + esc(o.t) + '</span>'
            : '<span class="who">' + esc(o.n) + '</span> ' + esc(o.t)) + '</div>';
    }).join('');
}

// 글줄은 **들고 있다가** 창을 열 때 그린다 (창이 닫혀 있어도 안 잃는다)
function pushLine(o) {
    if (!run) return;
    if (!run.lines) run.lines = [];
    run.lines.push(o);
    while (run.lines.length > P.CHAT_KEEP + 10) run.lines.shift();
    paintLog();
    paintFeed();
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

// 🙂 이모티콘 — 고르면 바로 머리 위에 뜬다 (말과 같은 길)
function sayEmo(id) {
    const u = u_();
    if (!run || !u) return;
    const e = (typeof window.emoById === 'function') ? window.emoById(id) : null;
    if (!e) return;
    try { if (typeof window.emoClose === 'function') window.emoClose(); } catch (x) { }
    run.say = '[emo:' + id + ']';
    run.sayAt = now();
    bubble(run.me, run.say);
    send(false);                              // 말풍선을 바로 알린다
    const d = db_();
    if (d) {
        try {
            d.ref(P.CHAT + '/' + run.room).push({
                n: nameOf(u), c: u.code, t: '[이모티콘] ' + e.n, at: now() });
        } catch (x) { }
    }
}

// ==========================================
// ★ 📢 공지판 — 상담사가 쓰고 사원이 읽는다
//
//   서버의 notices 는 출산·결투처럼 **떴다 사라지는** 소식 자리라
//   쌓이지 않는다. 그래서 읽을 공지는 여기 따로 둔다.
//
//       noticeBoard/<열쇠>  { t: 글, at: 때, by: 쓴 이 }
//
//   안 읽은 것이 있으면 단추에 점이 붙는다. 어디까지 읽었는지는
//   이 기계에만 적는다(localStorage) — 서버에 사람마다 적을 것까지는
//   아니고, 기계를 바꾸면 한 번 더 뜨는 정도는 괜찮다.
// ==========================================
const NB = 'noticeBoard';
const NB_SEEN = 'plazaNoticeSeen';
const NB_KEEP = 30;
let nbRef = null, nbList = [];

function nbSeen() { try { return +(localStorage.getItem(NB_SEEN) || 0) || 0; } catch (e) { return 0; } }
function nbMark(t) { try { localStorage.setItem(NB_SEEN, String(t || now())); } catch (e) { } }

function watchNotice() {
    const d = db_();
    if (!d) return;
    try { nbRef = d.ref(NB).limitToLast(NB_KEEP); } catch (e) { return; }
    nbRef.on('value', function (s) {
        const v = s.val() || {};
        nbList = Object.keys(v).map(function (k) {
            const o = v[k] || {};
            return { k: k, t: String(o.t || ''), at: +o.at || 0, by: String(o.by || '') };
        }).sort(function (a, b) { return b.at - a.at; });
        paintNoticeDot();
        if (sheetOpen('notice')) noticeSheet();      // 열어 둔 채로 새 글이 오면 같이 바뀐다
    });
}

function paintNoticeDot() {
    const b = document.getElementById('plaza-notice');
    if (!b) return;
    b.classList.toggle('new', (nbList.length ? nbList[0].at : 0) > nbSeen());
}

function nbWrite() {
    const el = document.getElementById('plaza-nbin');
    const d = db_();
    if (!el || !d) return;
    const t = String(el.value || '').trim().slice(0, 300);
    if (!t) return;
    const u = u_();
    try {
        d.ref(NB).push({ t: t, at: now(), by: nameOf(u) });
        el.value = '';
    } catch (e) { }
}

function nbDrop(key) {
    const d = db_();
    if (!d || !key) return;
    try { d.ref(NB + '/' + key).set(null); } catch (e) { }
}

function noticeSheet() {
    const u = u_();
    const boss = !!(u && u.code === P.ADMIN);
    const body = nbList.length
        ? '<div id="plaza-nb">' + nbList.map(function (o) {
            return '<div class="nb-i"><div class="nb-h">'
                + '<span>' + esc(o.by || '상담사') + '</span>'
                + '<span>' + esc(when(o.at)) + '</span>'
                + (boss ? '<button class="nb-x" data-k="' + esc(o.k) + '">지움</button>' : '')
                + '</div><div class="nb-t">' + esc(o.t).replace(/\n/g, '<br>') + '</div></div>';
        }).join('') + '</div>'
        : '<div class="plaza-none">아직 올라온 공지가 없습니다.</div>';
    const write = boss
        ? '<div id="plaza-send"><input id="plaza-nbin" maxlength="300" placeholder="사원들에게 알릴 것">'
          + '<button id="plaza-nbgo">올린다</button></div>'
        : '';
    const s = sheet('notice', '📢 공지사항', body + write);
    if (!s) return;
    nbMark(nbList.length ? nbList[0].at : now());
    paintNoticeDot();
    if (boss) {
        s.querySelector('#plaza-nbgo').onclick = nbWrite;
        const inp = s.querySelector('#plaza-nbin');
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') nbWrite(); });
        Array.prototype.forEach.call(s.querySelectorAll('.nb-x'), function (b) {
            b.onclick = function () { nbDrop(b.dataset.k); };
        });
    }
}

function when(t) {
    if (!t) return '';
    const d = new Date(t), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

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
    mapShow(true);
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
    // ★ 나가기(✕)가 위 띠에서 빠졌다 — 위 오른쪽이 공지·선물함·메뉴 셋으로
    //   찼기 때문이다. 그래서 메뉴 맨 끝에 둔다.
    const html = '<div class="plaza-grid">' + list.map(function (m, i) {
        return '<button data-i="' + i + '"><span class="e">' + m.i + '</span>'
            + esc(m.n) + '</button>';
    }).join('')
        + '<button id="plaza-out"><span class="e">🚪</span>광장 나가기</button></div>';
    const s = sheet('menu', '어디로 갑니까', html);
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('.plaza-grid button[data-i]'), function (b) {
        b.onclick = function () { goApp(list[Number(b.dataset.i)]); };
    });
    s.querySelector('#plaza-out').onclick = shut;
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
    // ★ 반드시 sheet() **뒤**에 접는다 — sheet() 가 closeSheet() 를 먼저
    //   부르고, 그 안에서 미니맵을 도로 켜 놓기 때문이다.
    mapShow(false);                 // 주신 그림대로 — 채팅을 누르면 미니맵은 비킨다
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
    if (nbRef) { try { nbRef.off(); } catch (e) { } nbRef = null; }
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
        + '<button id="plaza-me" class="plaza-keep">'
        +   '<span class="pm-pic"></span>'
        +   '<span class="pm-txt"><b class="pm-n">·</b><i class="pm-no"></i></span>'
        + '</button>'
        + '<div class="sp"></div>'
        + '<button class="plaza-ico plaza-keep" id="plaza-notice">📢<i class="nd"></i></button>'
        + '<button class="plaza-ico plaza-keep" id="plaza-gift">🎁</button>'
        + '<button class="plaza-ico plaza-keep" id="plaza-menu">☰</button>'
        + '</div>'
        + '<div id="plaza-who"></div>'
        + (touch ? '' :
            '<div id="plaza-pad" class="plaza-keep">'
            + '<button data-k="left">◀</button>'
            + '<button data-k="up">▲</button>'
            + '<button data-k="down">▼</button>'
            + '<button data-k="right">▶</button>'
            + '</div>')
        + '<div id="plaza-feed" class="plaza-keep"></div>'
        + '<div id="plaza-map" class="plaza-keep"><div class="mp-n"></div><div class="mp-g"></div></div>'
        + '<div id="plaza-bottom">'
        + '<button class="plaza-ico plaza-keep" id="plaza-emo">🙂</button>'
        + '<div id="plaza-bar" class="plaza-keep"><span class="dot"></span>'
        + '<span class="txt">여기에 적으면 머리 위에 뜹니다</span></div>'
        + '<button class="plaza-ico plaza-keep" id="plaza-bag">🎒</button>'
        + '</div>';
    document.body.appendChild(ov);
    stampSafe(ov);

    run = {
        room: null, el: document.getElementById('plaza-room'),
        view: document.getElementById('plaza-view'),
        peers: {}, keys: {}, ax: 0, ay: 0, x: 0, y: 0, tx: null, ty: null,
        cx: 0, cy: 0, last: performance.now(), raf: 0, z: 1,
        sx: -9999, sy: -9999, sent: 0, sMoving: false, sFace: 1,
        say: '', sayAt: 0, sSayAt: 0, k: 1, ref: null, me: null, lv: 0
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
        // ★ 얹어 둔 것들 위에서는 걷지 않는다.
        //
        //   짚은 자리가 목적지로 쓰이는 게 아니라서, 아래쪽 빈 검은 자리를
        //   짚어도 가만히 있지 않는다. 톡 치면 세로는 바닥 띠 안으로 잘리고
        //   **가로만** 받아 옆으로 걸어가고(게다가 아래쪽을 짚은 것을
        //   「지하로 가겠다」로 읽어 계단으로 내려간다), 끌면 짚은 자리가
        //   아예 상관없이 **그 자리가 조이스틱 한가운데**가 된다.
        //   그래서 미니맵·단추·채팅 바는 .plaza-keep 으로 빼낸다.
        //   (채팅 내역은 글자뿐이라 pointer-events:none 으로 그냥 통과시킨다)
        run.view.addEventListener('pointerdown', function (e) {
            if (!run) return;
            if (e.target && e.target.closest && e.target.closest('.plaza-spot, .plaza-keep')) return;
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
                // ★ 다른 층을 짚었으면 가까운 계단부터 간다.
                //   계단 x 안에서는 두 층이 뚫려 있으므로, 그리로 걸어가면
                //   저절로 오르내린다. 계단이 없는 방이면 제 층 안으로 자른다.
                const want = r.floor2 ? lvAt(r, y) : 0;
                let tx = x, lv = run.lv;
                if (want !== run.lv && r.stairs && r.stairs.length) {
                    // 다른 층을 짚었다 — 가까운 계단의 **그 층 쪽 끝**으로 먼저 간다
                    let best = null, bd = 1e9;
                    r.stairs.forEach(function (s) {
                        const down = (s.y0[0] < s.y0[1]);      // 오른쪽으로 갈수록 내려가나
                        const end = (want === 1) === down ? s.x[1] : s.x[0];
                        const d = Math.abs(end - run.x);
                        if (d < bd) { bd = d; best = end; }
                    });
                    if (best != null) { tx = best; lv = want; }
                }
                const xr = xRange(r, lv);
                tx = Math.max(Math.max(P.EDGE, xr[0]), Math.min(Math.min(r.w - P.EDGE, xr[1]), tx));
                const yr = yRange(r, tx, lv);
                run.tx = tx;
                run.ty = Math.max(yr[0], Math.min(yr[1], y));
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
        const was = run.z || 0;
        paintRoom();
        // 창 높이가 달라지면 늘린 배도 달라진다 — 사람도 그 배로 다시 만든다
        if (Math.abs((run.z || 0) - was) > 0.0005) remakeFolk();
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

    document.getElementById('plaza-me').onclick = function () {
        goApp({ tab: 'tab-record', sub: 'rec-badge' });
    };
    document.getElementById('plaza-notice').onclick = noticeSheet;
    document.getElementById('plaza-gift').onclick = function () {
        if (typeof window.openGiftBox === 'function') goApp({ fn: 'openGiftBox' });
    };
    document.getElementById('plaza-menu').onclick = menuSheet;
    document.getElementById('plaza-emo').onclick = function () {
        if (typeof window.emoOpen === 'function') window.emoOpen('plaza', sayEmo);
    };
    document.getElementById('plaza-bag').onclick = bagSheet;
    document.getElementById('plaza-bar').onclick = chatSheet;

    paintMe();
    watchNotice();

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
        '· ' + (run.lv === 1 ? '지하' : '길') + ' 바닥 ' + bandOf(r, run.lv).join('~')
        + (stairAt(r, run.x) ? ' · 계단 위' : '') + ' · 사람 ' + run.k + '배');
    const ns = Object.keys(run.peers);
    console.log('  같이 :', ns.length ? ns.map(function (c) {
        return run.peers[c].one.tag.innerText + '(' + c + ')'; }).join(', ') : '혼자');
};

console.log('[광장] plazaOpen() · plazaGo(방) · plazaRooms() · plazaState()');

})();
