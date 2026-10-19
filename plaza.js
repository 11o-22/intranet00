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
    // ★ 말하는 자리가 둘이다.
    //     맵 채팅   plazaChat/<방>   — 같은 방 사람끼리. 마지막 사람이 나가면 지워진다.
    //     서버 채팅 plazaChat/all    — 어느 방에 있든 다 보인다. 안 지워지고 남는다.
    //   방 열쇠에 'all' 은 없으므로 서로 섞이지 않는다.
    ALL: 'all',

    SPEED: 210,                 // 1초에 몇 픽셀 걷나 (방이 넓어지고 「조금 빠르게」 하여 올렸다)
    // ★ 그림 아래쪽 **밋밋한 벽**을 빼고 창에 맞춘다.
    //   2차 그림(1880x2556)은 볼 것이 y 1320 에서 끝나고 그 아래 1236픽셀이
    //   한 가지 색 벽이다. 통째로 창에 맞추면 화면 절반이 비어 보이고
    //   사람도 그만큼 작아진다. 그래서 아래 720 을 빼고 맞춘다 —
    //   그림이 내려와 앉고(볼 것이 화면의 72%까지 내려온다), 남은 28% 가
    //   채팅과 미니맵이 앉는 어두운 자리가 된다. 사람도 한 눈금 커진다.
    CUT: 720,
    TAP_STOP: 3,
    // ★ 민 쪽으로 **붙고 떨어지는 데 걸리는 시간**(초).
    //   전에는 손가락이 가리키는 쪽을 그 칸에서 그대로 썼다. 손전화는
    //   손가락이 늘 조금씩 떨려서, 사람이 그때마다 홱홱 꺾이고 좌우보기가
    //   깜빡였다. 이만큼에 걸쳐 따라가게 하면 떨림은 묻히고 꺾는 맛은 남는다.
    //   0.085 는 네댓 칸(60fps)이면 다 붙는 빠르기다 — 더 크면 굼떠 보인다.
    EASE: 0.085,
    EDGE: 20,                   // 좌우 끝에서 이만큼 남기고 넘어간다
    // ★ 넘어간 방에서 **문턱 안쪽으로** 들여 세운다.
    //   안 그러면 올라가자마자 아래쪽 끝에 서게 되어 그 자리에서 도로
    //   내려오고, 단추를 누르고 있는 동안 두 방을 끝없이 오간다.
    INSET: 26,
    WARP_MS: 450,               // 넘어간 직후 이만큼은 또 안 넘어간다
    SEND_MS: 250,
    STALE_MS: 25000,
    // ★ 가만히 서 있어도 이만큼마다 한 번 자리를 다시 적는다.
    //   ✗ 전에는 움직일 때만 적어서, 25초 넘게 서 있으면 남의 화면에서
    //     **사라졌다** (STALE_MS 를 넘긴 자리는 끊긴 사람으로 친다).
    //     방 정원을 세려면 서 있는 사람도 세어져야 한다.
    BEAT_MS: 10000,
    IDLE_MS: 250,               // 아무것도 안 움직일 때 이만큼마다 한 번만 깬다 (배터리)
    // ★ 한 방 정원 — 같은 장소에 이만큼 차면 그 장소의 2번 방으로 간다.
    //   사람마다 그리는 값이 커서, 한 화면에 사람이 많으면 끊긴다 (재 봤다:
    //   1명 38장/초 · 20명 24장 · 40명 18장). 그리는 사람 수를 여기서 묶는다.
    //   방이 달라도 「서버」 채팅은 다 같이 본다. 「맵」 채팅은 같은 방끼리.
    CAP: 10,
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
        // ■ 길 (주신 지도대로)
        //
        //      [백일몽]                                        [재관국]
        //         ↑                                               ↑
        //  [백일몽앞] ↔ [카지노] ↔ [광장] ↔ [우체국] ↔ [재관국앞]
        //      B1 ???                                        B1 → 망상홈쇼핑
        //
        // ★ 그림이 2차로 다시 와서 1880x2556 으로 커졌다. 바닥 띠와 계단은
        //   **전경 그림 한 장**이 여섯 방에서 똑같아서(그림을 떠서 확인했다)
        //   그 여섯은 같은 값을 쓴다. 광장과 카지노만 제 전경이 따로다.
        //
        // ★ 계단 자리를 **그림에 대고 다시 쟀다** (2026-10-15).
        //   전에는 x [150,650] · y 860→1240 이었는데, 그렸던 계단보다
        //   완만해서 사람이 **층계 위에 떠 있었다**(찍어 보았다).
        //   네 방(광장·카지노·재관국앞·백일몽앞) 그림에 선을 얹어 견주니
        //   그려진 층계는 (155,945) 에서 (565,1270) 으로 내려간다 — 기울기
        //   0.793. 그 선을 **길(860)까지 거슬러 늘리면 x 50** 에서 만난다.
        //   그래서 계단을 x [50,565] · 860→1270 으로 둔다. 길과 계단이
        //   y 가 이어져 **갈아탈 때 턱이 없고**, 155 에서 944 를 지나
        //   그려진 층계를 그대로 밟는다.
        //   아랫단(x2)도 다시 쟀다 — 565~1315 (전 650~1230 은 층계 끝과
        //   어긋나 있었다).
        dfront: { n: '백일몽 건물 앞', img: 'dfront.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  right: 'casino', up: { to: 'dream', x: [760, 1130] },
                  // ★ 건물 안으로는 **입구를 눌러야** 들어간다 (걸어서는 안 넘어간다)
                  spots: [ { x: 940, n: '백일몽 주식회사', i: '🏢', go: 'dream' },
                           { x: 940, n: '???', i: '❓', ic: 'unknown', lv: 1,
                             tab: 'tab-shop', sub: 'shop-unknown' } ] },

        dream:  { n: '백일몽 주식회사', img: 'dream.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  down: { to: 'dfront', x: [760, 1130] },
                  // 🔒 가두리 — 안내 데스크와 정문 사이 (gaduri.js · 아래 「가두리」)
                  cage: { x: 640, w: 360, h: 400, base: 915, zy: 880 },
                  // 주신 지도대로 — 2F 사택 · 1F 로비 · B1 어둠 탐사·유쾌 판매소
                  lift: { f2: [ { n: '사택', ic: 'house', tab: 'tab-house', sub: 'house-main' } ],
                          b1: [ { n: '어둠 탐사',   ic: 'dark', tab: 'tab-darkness', sub: 'dark-main' },
                                { n: '유쾌 판매소', ic: 'shop', tab: 'tab-shop',     sub: 'shop-regular' } ] },
                  spots: [ { x: 940, n: '엘리베이터', i: '🛗', lv: 1, lift: true },
                           { x: 1600, n: '나간다', ic: 'out', go: 'dfront' } ] },

        casino: { n: '카지노 거리', img: 'casino.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  left: 'dfront', right: 'plaza',
                  spots: [ { x: 940, n: '공용시설', i: '🎲', ic: 'public', tab: 'tab-public' } ] },

        // ★ 광장은 행복 식당과 장기 은행 둘만 둔다 (주신 대로).
        plaza:  { n: '광장', img: 'plaza.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  left: 'casino', right: 'post',
                  // 🔒 가두리 — 행복 식당과 게시판 사이, 분수대 왼쪽 앞 (gaduri.js · 아래 「가두리」)
                  cage: { x: 690, w: 360, h: 400, base: 915, zy: 880 },
                  spots: [ { x: 470,  n: '행복 식당', i: '🍚', ic: 'food', tab: 'tab-shop', sub: 'shop-food' },
                           { x: 1400, n: '장기 은행', i: '🏦', ic: 'bank', tab: 'tab-vip' },
                           // ★ 사내 게시판 — 분수대 그림 앞에 세운다 (board.js)
                           { x: 940, y: 892, n: '사내 게시판', fn: 'plazaBoardOpen', board: 1, bw: 170, bh: 205 } ] },

        post:   { n: '우체국', img: 'post.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  left: 'plaza', right: 'gate',
                  spots: [ { x: 940, n: '밀실 거래', i: '🤝', ic: 'p2p', tab: 'tab-shop', sub: 'shop-p2p' } ] },

        gate:   { n: '재난관리국 앞', img: 'gate.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  left: 'post', up: { to: 'bureau', x: [780, 1120] },
                  // 지하 가게로는 **그 자리에서 들어간다** (go 가 붙은 입구)
                  // ★ 건물 안으로도 **입구를 눌러야** 들어간다 (걸어서는 안 넘어간다)
                  spots: [ { x: 940,  n: '재난관리국', i: '🏛', go: 'bureau' },
                           { x: 940, n: '망상 홈쇼핑', i: '📺', ic: 'dream', lv: 1, go: 'dshop' } ] },

        bureau: { n: '재난관리국', img: 'bureau.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  down: { to: 'gate', x: [780, 1120] },
                  // 2F 사택 · 1F 로비 · B1 재난 탐사 로비 · B2 기록 소실 (disaster.js — 티켓이 있어야 들어간다)
                  lift: { f2: [ { n: '사택', ic: 'house', tab: 'tab-house', sub: 'house-main' } ],
                          // ✗ 「파티」는 뺐다 (2026-10-16)
                          b1: [ { n: '재난 탐사', ic: 'dark', tab: 'tab-darkness', sub: 'dark-main' } ],
                          b2: [ { n: '기록 소실', ic: 'dark', fn: 'disasterLost' } ] },
                  spots: [ { x: 940, n: '엘리베이터', i: '🛗', lv: 1, lift: true },
                           { x: 1600, n: '나간다', ic: 'out', go: 'gate' } ] },

        dshop:  { n: '망상 홈쇼핑', img: 'dshop.webp', w: 1880, h: 2556, k: 1,
                  floor: [845, 905], floor2: [1262, 1288], x2: [555, 1325],
                  stairs: [ { x: [105, 555],   y0: [890, 1247], y1: [920, 1277] },
                            { x: [1325, 1775], y0: [1247, 890], y1: [1277, 920] } ],
                  spots: [ { x: 940,  n: '망상 홈쇼핑', i: '📺', ic: 'dream', tab: 'tab-shop', sub: 'shop-dream' },
                           // 들어온 자리가 재관국 앞 **지하**라, 나갈 때도 그 층으로 돌려보낸다
                           { x: 1600, n: '나간다', ic: 'out', go: 'gate', golv: 1 } ] },
    },
    START: 'plaza',

    // ── 📸 포토존 — 장소마다 방이 둘 (목록 ☰ 「포토존」에서 고른다)
    //
    //   주신 그림(4800x2556)은 **도트 한 칸이 6픽셀**인 도트 그림이다. 그래서
    //   한 칸을 한 점으로 되돌린 800x426 을 파일로 두고(pz-*.webp · 무손실),
    //   방 크기는 그 두 배인 1600x852 로 적는다 — 사람 한 명이 방 그림 안에서
    //   광장 방과 같은 몫(키 236)이 되는 크기다. 그래서 걸음 빠르기·끝자리
    //   (SPEED · EDGE · INSET)를 따로 고치지 않아도 사람 몸에 맞는다.
    //   파일보다 크게 그리므로 늘 또렷하게(pixelated) 깐다 (pix).
    //
    //   그림 아래쪽 28%(y 1850~2556 / 3)가 무대 밑 어두운 기둥이라, 광장처럼
    //   채팅과 미니맵이 그 자리에 앉는다. 그래서 잘라 내지 않는다 (cut 0).
    //
    //   바닥 띠는 그림에 대고 쟀다 — 무대 앞 끝(검은 테두리)에서 조금 들이고,
    //   뒤로는 소품 발치까지. 4800 그림의 y 를 3 으로 나눈 값이다.
    //       기본 1815~1850 · 룩키마트 1720~1830 · 토크쇼 1680~1775
    //       여우 상담실 1630~1765 · 리조트 1705~1780 · 핼러윈 1830~1895 · 행맨 1715~1805
    //
    //   max 2 — 한 장소에 방은 둘. 둘 다 차면(한 방 CAP 명) 못 들어간다.
    PHOTO: ['pz_base', 'pz_hangman', 'pz_fox', 'pz_looky', 'pz_flower', 'pz_halloween', 'pz_brown'],

    // ── 오른쪽 위 ☰ 에 들어가는 것들. 없는 것은 저절로 빠진다.
    //
    //   ic 는 ico/ 안의 그림 이름이다. 흰 그림을 **마스크**로 써서 글자색을
    //   그대로 입으므로, 테마가 바뀌어도 아이콘이 따라 바뀐다.
    //   ic 가 없는 줄은 전처럼 i(글자 그림)로 그린다.
    // ★ nw 는 **알림 거리**다 — 올 것이 와 있으면 그 칸에 초록 불빛이 붙는다
    //   (hasNew 참고). ☰ 단추에도 같이 붙어, 열어 보지 않아도 안다.
    // ★ g 는 **갈래**다 — 목록(☰)이 이 차례대로 묶어 그린다 (GROUPS 참고).
    //   g 가 없는 줄은 맨 끝 「그 밖」으로 모인다.
    //   ★ 의상숍·악세서리숍도 없다 — 망상 홈쇼핑 안에 서 있다 (gacha.js).
    GROUPS: [
        { g: 'in',    n: '사내' },
        { g: 'me',    n: '내 정보' },
        { g: 'point', n: '포인트' },
        { g: 'dark',  n: '탐사' },
        { g: 'life',  n: '생활' },
        { g: 'shop',  n: '상점' }
    ],
    MENU: [
        // ① 사내
        // ✗ 선물함은 목록에서 뺐다 — 위 띠 오른쪽에 선물함 단추가 이미 있다.
        //   가는 길이 둘이면 알림 불도 둘이 된다. 불은 위 띠 단추 하나에만 붙인다.
        { g: 'in',    n: '건의함',     i: '🗳️', ic: 'suggest', fn: 'openSuggestionModal' },
        { g: 'in',    n: '사원 열람',  i: '👥', ic: 'people',  fn: 'openEmployeeListModal' },
        // 방이 나뉘어도 같이 있을 수 있게 — 누가 어느 장소 몇 번 방에 있나, 누르면 그리로 간다
        { g: 'in',    n: '동료 목록',  i: '🧭', ic: 'mates',   sheet: 'mates' },
        // ✗ 전체 대화는 뺐다 — 광장 아래 띠에서 바로 말하고, 글줄을 톡 치면
        //   채팅 칸이 열린다. 목록에까지 두면 가는 길이 둘이 된다.
        // ② 내 정보
        { g: 'me',    n: '사원증',     i: '🪪', ic: 'badge',   tab: 'tab-record',   sub: 'rec-badge' },
        // 오른쪽 아래 가방 단추와 가는 데가 같다 — 목록에서도 찾을 수 있게 둔다
        { g: 'me',    n: '소지품',     i: '🎒', ic: 'bag',     tab: 'tab-record',   sub: 'rec-inventory' },
        { g: 'me',    n: '기록',       i: '📄', ic: 'history', tab: 'tab-record',   sub: 'rec-history' },
        { g: 'me',    n: '익명 편지',  i: '✉️', ic: 'letter',  tab: 'tab-record',   sub: 'rec-letters', nw: 'letter' },
        { g: 'me',    n: '칭호',       i: '🏅', ic: 'title',   tab: 'tab-record',   sub: 'rec-titles' },
        // ③ 포인트
        { g: 'point', n: '공용시설',   i: '🎲', ic: 'public',  tab: 'tab-public' },
        { g: 'point', n: '장기 은행',  i: '🏦', ic: 'bank',    tab: 'tab-vip' },
        { g: 'point', n: '밀실 거래',  i: '🤝', ic: 'p2p',     tab: 'tab-shop',     sub: 'shop-p2p', nw: 'p2p' },
        // ④ 탐사 — 파티는 목록에서 뺐다. 재난관리국 B1 엘리베이터로 들어간다.
        { g: 'dark',  n: '어둠 탐사',  i: '🌑', ic: 'dark',    tab: 'tab-darkness', sub: 'dark-main' },
        // ⑤ 생활
        { g: 'life',  n: '사택',       i: '🏠', ic: 'house',   tab: 'tab-house',    sub: 'house-main' },
        { g: 'life',  n: '옷장',       i: '👔', ic: 'closet',  tab: 'tab-house',    sub: 'house-closet' },
        { g: 'life',  n: '펫 돌보기',  i: '🐾', ic: 'pet',     fn: 'petOpen' },
        // 📸 포토존 — 장소 목록 → 1번 · 2번 방 (안에 있는 사람까지) → 누르면 그 방으로
        { g: 'life',  n: '포토존',     i: '📸', ic: 'camera',  sheet: 'photo' },
        // ⑥ 상점
        { g: 'shop',  n: '유쾌 판매소', i: '🛒', ic: 'shop',   tab: 'tab-shop',     sub: 'shop-regular' },
        { g: 'shop',  n: '???',        i: '❓', ic: 'unknown', tab: 'tab-shop',     sub: 'shop-unknown' },
        { g: 'shop',  n: '행복 식당',  i: '🍚', ic: 'food',    tab: 'tab-shop',     sub: 'shop-food' },
        { g: 'shop',  n: '우주 쇼핑몰', i: '🛸', ic: 'alien',  tab: 'tab-shop',     sub: 'shop-alien' },
        { g: 'shop',  n: '망상 홈쇼핑', i: '📺', ic: 'dream',  tab: 'tab-shop',     sub: 'shop-dream' }
    ]
};

(function plaza() {

const P = PLAZA;
const R = P.ROOMS;

// 📸 포토존 방 — 위 PHOTO 의 차례대로
(function photoRooms() {
    const pz = function (key, pn, file, fl) {
        R[key] = { n: '포토존 · ' + pn, pn: pn, img: 'pz-' + file + '.webp', thumb: 'pz-' + file + '-t.webp',
                   w: 1600, h: 852, cut: 0, k: 1, floor: fl, photo: 1, pix: 1, max: 2,
                   spots: [ { x: 1520, n: '광장으로', ic: 'out', go: P.START } ] };
    };
    pz('pz_base',      '기본',                'base',      [605, 617]);
    pz('pz_hangman',   '헝그리 행맨',          'hangman',   [572, 602]);
    pz('pz_fox',       '여우 상담실',          'fox',       [543, 588]);
    pz('pz_looky',     '룩키마트',             'looky',     [573, 610]);
    pz('pz_flower',    '플라워 골든 리조트',    'flower',    [568, 593]);
    pz('pz_halloween', '핼러윈',               'halloween', [610, 632]);
    pz('pz_brown',     '브라운의 심야 토크쇼',  'brown',     [560, 592]);
})();

// ★ 돌아오는 길을 저절로 만든다 — 한쪽만 적어도 양쪽이 통한다
(function link() {
    Object.keys(R).forEach(function (a) {
        const r = R[a];
        if (r.left && R[r.left] && !R[r.left].right) R[r.left].right = a;
        if (r.right && R[r.right] && !R[r.right].left) R[r.right].left = a;
        if (r.up && R[r.up.to] && !R[r.up.to].down) R[r.up.to].down = { to: a, x: r.up.x };
    });
})();

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function now() { return Date.now(); }
function isAdm(u) { const x = u || u_(); return !!(x && x.code === P.ADMIN); }
function canEnter() { return P.ADMIN_ONLY ? isAdm() : !!u_(); }

// ★ 상담사(0000)는 광장에서 **8169 선염에게만** 보인다 (2026-10-19)
//   다른 사원 화면에서는 상담사의 모습 · 이름표 · 말풍선 · 맵 채팅 줄이 안 뜨고,
//   동료 목록 · 포토존 명단 · 방 인원 수에서도 빠진다.
//   (서버 채팅 · 귓속말은 광장 밖 이야기라 그대로 둔다)
//   상담사 본인 화면은 그대로 — 모두가 보인다.
//   ★ 상담사에게는 「같이 가기」(동료 목록 → 같은 장소로)가 없다 — 선염 화면에서도
//     동료 목록에 상담사가 안 뜬다. (보이는 것과 따라가는 것은 따로다)
const SEE_ADMIN = ['8169'];
function noOf(u) {
    const n = (u && u.no != null) ? String(u.no).trim() : '';
    return (n && n.length < 4) ? ('0000' + n).slice(-4) : n;
}
function hidPeer(code) {
    if (!code || code !== P.ADMIN) return false;
    const u = u_();
    if (!u || u.code === P.ADMIN) return false;
    return SEE_ADMIN.indexOf(noOf(u)) < 0;
}
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
let chatRef = null;      // 맵 채팅 (방이 바뀌면 다시 건다)
let allRef = null;       // 서버 채팅 (광장에 있는 내내 한 번만 건다)
let allFrom = 0;         // 이때까지 온 줄은 「묵은 것」 — 빨간 점을 안 붙인다

// 서버/맵/귓속말 어디에 적을 것인가. 이 기계에만 적어 둔다.
const CH_KEY = 'plazaChatCh';
let chatCh = 'map';
try { if (localStorage.getItem(CH_KEY) === 'all') chatCh = 'all'; } catch (e) { }
function chPath() { return PLAZA.CHAT + '/' + (chatCh === 'all' ? PLAZA.ALL : (run && seatKey(run.room, run.inst))); }

// ==========================================
// ★ 🤫 귓속말 — 고른 한 사람에게만
// ==========================================
//
//   서버·맵 줄은 모두가 보는 자리에 적히므로 귓속말을 거기 적을 수 없다.
//   **받는 사람 앞으로만** 적는다.
//
//       plazaWhisper/<받는이 사번>/<열쇠>  { n, c, t, at }
//
//   ★ 말풍선은 안 띄운다. 말풍선은 **내 자리 기록(s/st)에 실려** 같은
//     방 사람 모두에게 가므로, 귓속말을 거기 실으면 다 들린다.
//     그래서 귓속말은 글줄로만 간다.
//
//   ★ 보낸 줄은 **내 화면에만** 세운다 (서버에 내 몫까지 적지 않는다).
//     적으면 지웠다 썼다 할 자리가 둘이 되고, 한 줄이 두 번 뜬다.
const WH = 'plazaWhisper';
const WH_KEEP = 40;
let whTo = '', whName = '';      // 지금 귓속말할 상대
let whRef = null, whFrom = 0;

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
        '#plaza-room{position:absolute;left:0;top:0;image-rendering:pixelated;will-change:transform;',
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
        // 안 받은 선물이 있으면 붙는 **초록** 불 (바탕 화면 .notify-dot 과 같은 빛깔)
        '#plaza-gift{position:relative;}',
        '#plaza-gift .nd{position:absolute;top:5px;right:6px;width:9px;height:9px;border-radius:50%;',
        '  background:#4CAF50;display:none;animation:plaza-gdot 1.5s infinite;}',
        '#plaza-gift.new .nd{display:block;}',
        '@keyframes plaza-gdot{0%{box-shadow:0 0 0 0 rgba(76,175,80,.7);}',
        '  70%{box-shadow:0 0 0 6px rgba(76,175,80,0);}100%{box-shadow:0 0 0 0 rgba(76,175,80,0);}}',
        '.plaza-ico{flex:0 0 auto;width:42px;height:42px;border-radius:50%;border:1px solid rgba(190,170,120,.3);',
        '  background:rgba(14,14,20,.62);color:#f1e7d6;font-size:17px;line-height:1;cursor:pointer;',
        '  display:flex;align-items:center;justify-content:center;',
        '  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '.plaza-ico:active{background:rgba(40,36,28,.85);}',
        // ── 포인트 · 포만감 · 오염도
        //
        //   옛 화면 위 띠에만 있던 것들이다. 사원 화면은 그 띠를 감추므로
        //   광장에서는 볼 길이 없었다. 사진 단추 **오른쪽**에, 사원증 칸
        //   바로 아래로 나란히 놓는다 (포인트 → 포만감 → 오염도).
        '#plaza-hud{position:absolute;left:60px;z-index:21;width:88px;',
        '  top:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 58px);',
        '  display:flex;flex-direction:column;gap:3px;pointer-events:none;}',
        '#plaza-hud .pt{font-size:11px;color:#d8cfbe;line-height:1.2;',
        '  text-shadow:0 1px 3px #000,0 0 5px #000;}',
        '#plaza-hud .pt b{color:#ffe9bd;font-size:12.5px;}',
        '#plaza-hud .bar{height:6px;border-radius:999px;overflow:hidden;',
        '  background:rgba(8,8,12,.66);border:1px solid rgba(190,170,120,.25);}',
        '#plaza-hud .bar i{display:block;height:100%;width:0;border-radius:999px;',
        '  transition:width .3s;}',
        // 포만감은 찰수록 좋고, 오염도는 찰수록 나쁘다 — 색을 뒤집어 둔다
        '#plaza-hud .sat i{background:linear-gradient(90deg,#f44336,#ff9800,#8bc34a);}',
        '#plaza-hud .pol i{background:linear-gradient(90deg,#4caf50,#ff9800,#f44336);}',
        // 「같이 있는 사람」 줄 — 포인트·바가 들어오면서 한 칸 내려 앉았다
        // (긴 이름이 여럿이면 왼쪽 바와 겹쳤다)
        '#plaza-who{position:absolute;left:12px;right:12px;z-index:19;text-align:center;',
        '  top:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 96px);',
        '  font-size:10.5px;color:#b9b0a0;text-shadow:0 1px 3px #000;pointer-events:none;}',
        // ★ 사람은 **누름을 안 받는다.** 칸이 176x192 나 되는데 거의 투명해서,
        //   그 위를 짚으면 시설 단추도 못 누르고 걷기도 엉뚱해졌다.
        // ★ 사람마다 **제 층**으로 띄운다 (will-change). 그래야 누가 걷거나
        //   발을 바꿔 디뎌도 그 사람 칸만 다시 그리고, 뒤의 큰 방 그림까지
        //   다시 칠하지 않는다.
        '.plaza-one{position:absolute;pointer-events:none;will-change:transform;}',
        '.plaza-one .dot-box{position:absolute;left:0;top:0;margin:0;}',
        '.plaza-tag{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;',
        '  font-size:10px;font-weight:bold;color:#efe6d8;text-shadow:0 1px 2px #000,0 0 4px #000;',
        '  pointer-events:none;}',
        // 칭호 표 — 밝은 방에서도 읽히게 바탕을 조금 깔아 준다
        '.plaza-tag span{background:rgba(10,10,14,.55);vertical-align:1px;}',
        // 말풍선
        // ★ 사람 칸이 좁아(가로 100~170px) 말이 석 자씩 끊겼다.
        //   절대 자리 잡은 칸은 **담은 칸 너비까지만** 늘어나기 때문이다.
        //   width:max-content 로 글만큼 벌리고, 화면 폭으로만 잘라 준다.
        '.plaza-say{position:absolute;left:50%;transform:translateX(-50%);bottom:100%;',
        '  width:max-content;max-width:min(62vw,230px);',
        '  margin-bottom:12px;padding:6px 9px;border-radius:9px;',
        '  background:#f4efe2;color:#1a1a1a;font-size:11px;line-height:1.5;',
        '  box-shadow:0 2px 8px rgba(0,0,0,.6);pointer-events:none;word-break:break-word;',
        '  text-align:center;}',
        '.plaza-say:after{content:"";position:absolute;left:50%;top:100%;margin-left:-5px;',
        '  border:5px solid transparent;border-top-color:#f4efe2;}',
        '.plaza-say.emo{padding:4px;line-height:0;max-width:none;}',
        // 나가는 길 표시
        '.plaza-exit{position:absolute;pointer-events:none;color:#ffe9b0;font-size:17px;',
        '  text-shadow:0 1px 3px #000,0 0 6px #000;opacity:.85;animation:plazaBob 1.4s 4;}',
        '@keyframes plazaBob{0%,100%{opacity:.45}50%{opacity:1}}',
        // ── 시설 입구
        // ★ z-index 를 사람보다 **위**로 올린다 (300 → 2000).
        //   사람에게는 선 자리(y)로 z-index 를 매긴다 — 아래에 선 사람이 앞에
        //   오게 하려고 100+y 로, 많게는 1400 까지 간다. 그래서 시설 단추가
        //   사람 **밑에** 깔렸고, 사람 칸(176x192 · 거의 투명)이 단추를 덮어
        //   눌러도 안 눌리고 그 자리로 걸어가기만 했다.
        '.plaza-spot{position:absolute;z-index:2000;transform:translate(-50%,-100%);',
        '  display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;}',
        '.plaza-spot .b{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;',
        '  justify-content:center;font-size:21px;background:rgba(18,14,10,.72);',
        '  border:1px solid rgba(217,160,90,.65);box-shadow:0 3px 12px rgba(0,0,0,.55),',
        // ★ 둥실거림 · 깜빡임은 **몇 번만** 하고 멈춘다 (배터리).
        //   끝없이 돌면 아무것도 안 바뀌어도 화면을 1초에 수십 번 다시 그린다.
        //   방에 들어설 때마다 단추를 새로 세우므로, 들어올 때 몇 번 움직여 눈에 띄고 그친다.
        '  inset 0 0 12px rgba(217,160,90,.16);animation:plazaFloat 2.6s ease-in-out 3;}',
        '.plaza-spot .t{font-size:10px;font-weight:bold;color:#ffe9bd;white-space:nowrap;',
        '  text-shadow:0 1px 3px #000,0 0 5px #000;}',
        '.plaza-spot:active .b{background:rgba(60,42,22,.9);}',
        // 🔒 가두리 — 사람처럼 선 자리(zy)로 앞뒤를 가린다. 누름은 받지 않는다
        '.plaza-cage{position:absolute;pointer-events:none;}',
        '.plaza-cage img{display:block;width:100%;height:100%;filter:drop-shadow(0 4px 5px rgba(0,0,0,.5));}',
        '.plaza-cage .t{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:2px;font-size:10px;',
        '  font-weight:bold;color:#d9d4e0;white-space:nowrap;text-shadow:0 1px 3px #000,0 0 5px #000;}',
        // ── 동료 목록
        '.plaza-mates .mt-head{font-size:11px;color:#8d8578;margin:0 2px 9px;}',
        '.plaza-mates .mt-empty{font-size:12px;color:#8d8578;text-align:center;padding:26px 0;}',
        '.plaza-mates .mt-row{display:flex;align-items:center;gap:10px;padding:10px 11px;margin-bottom:7px;',
        '  border-radius:12px;background:rgba(255,255,255,.04);border:1px solid #2b2b38;}',
        '.plaza-mates .mt-who{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}',
        '.plaza-mates .mt-who b{font-size:13px;color:#ffe9bd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.plaza-mates .mt-who span{font-size:11px;color:#a79e8f;}',
        '.plaza-mates .mt-who i{font-style:normal;color:#6f685c;margin-left:4px;}',
        '.plaza-mates button{flex:0 0 auto;padding:8px 12px;border-radius:10px;font-family:inherit;font-size:12px;',
        '  cursor:pointer;background:rgba(217,160,90,.16);border:1px solid #8a6a2a;color:#ffe9bd;}',
        '.plaza-mates button:disabled{background:rgba(255,255,255,.03);border-color:#2b2b38;color:#6f685c;cursor:default;}',
        // ── 📸 포토존
        '.plaza-pz .mt-empty{font-size:12px;color:#8d8578;text-align:center;padding:26px 0;}',
        '.plaza-pz .pz-head{font-size:11px;color:#8d8578;margin:0 2px 9px;}',
        '.plaza-pz .pz-zone{display:flex;align-items:center;gap:11px;width:100%;padding:8px;margin-bottom:7px;',
        '  border-radius:12px;background:rgba(255,255,255,.04);border:1px solid #2b2b38;color:inherit;',
        '  font-family:inherit;text-align:left;cursor:pointer;}',
        '.plaza-pz .pz-zone.on{border-color:#8a6a2a;background:rgba(217,160,90,.09);}',
        '.plaza-pz .pz-th{flex:0 0 auto;width:96px;height:51px;border-radius:7px;background:#000 center/cover no-repeat;}',
        '.plaza-pz .pz-zn{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}',
        '.plaza-pz .pz-zn b{font-size:13px;color:#ffe9bd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.plaza-pz .pz-zn i{font-style:normal;font-size:11px;color:#a79e8f;}',
        '.plaza-pz .pz-zn i em{font-style:normal;color:#ffcf8f;}',
        '.plaza-pz .pz-back{border:none;background:none;color:#a79e8f;font-family:inherit;font-size:12px;',
        '  padding:0 2px 9px;cursor:pointer;}',
        '.plaza-pz .pz-pic{width:100%;aspect-ratio:400/213;border-radius:10px;margin-bottom:9px;',
        '  background:#000 center/cover no-repeat;}',
        '.plaza-pz .pz-room{padding:10px 11px;margin-bottom:7px;border-radius:12px;',
        '  background:rgba(255,255,255,.04);border:1px solid #2b2b38;}',
        '.plaza-pz .pz-room.on{border-color:#8a6a2a;}',
        '.plaza-pz .pz-rh{display:flex;align-items:center;gap:8px;}',
        '.plaza-pz .pz-rh b{font-size:13px;color:#ffe9bd;}',
        '.plaza-pz .pz-rh i{flex:1;font-style:normal;font-size:11px;color:#6f685c;}',
        '.plaza-pz .pz-rh button{flex:0 0 auto;padding:8px 12px;border-radius:10px;font-family:inherit;font-size:12px;',
        '  cursor:pointer;background:rgba(217,160,90,.16);border:1px solid #8a6a2a;color:#ffe9bd;}',
        '.plaza-pz .pz-rh button:disabled{background:rgba(255,255,255,.03);border-color:#2b2b38;color:#6f685c;cursor:default;}',
        '.plaza-pz .pz-who{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}',
        '.plaza-pz .pz-who span{font-size:11px;color:#e8dcc6;padding:3px 8px;border-radius:9px;',
        '  background:rgba(255,255,255,.06);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.plaza-pz .pz-who span.me{background:rgba(217,160,90,.22);color:#ffe9bd;}',
        '.plaza-pz .pz-none{font-size:11px;color:#6f685c;margin-top:7px;}',
        '.plaza-board{gap:1px;animation:none;}',
        '.plaza-board .bd{position:relative;filter:drop-shadow(0 4px 5px rgba(0,0,0,.55));}',
        '.plaza-board .bd svg{display:block;width:100%;height:100%;}',
        '.plaza-board .nd{position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;',
        '  background:#4CAF50;box-shadow:0 0 6px #4CAF50;display:none;animation:plaza-gdot 1.5s infinite;}',
        '.plaza-board.new .nd{display:block;}',
        '@keyframes plazaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
        // 걷기 단추 (자판이 있는 기계에서만 — 손가락 쪽은 화면을 끌어 걷는다)
        // ★ 줄 자체는 누름을 안 받는다 — 단추만 받는다.
        //   이 줄은 left:0 right:0 으로 **화면을 가로질러** 있어서, 가운데
        //   네 단추 말고 양옆 빈 자리까지 누름을 먹었다. 그 아래 깔린 글줄이
        //   눌리지 않아 PC 에서 「클릭이 잘 안 먹는」 꼴이 됐다.
        // ── 보이는 조이스틱 — 짚은 자리에 뜬다 (걷는 동안만)
        //   사람(z 100~1400)은 #plaza-view(z 1) 안이라 이것이 늘 위로 온다.
        '#plaza-stick{position:absolute;z-index:15;width:124px;height:124px;',
        '  margin:-62px 0 0 -62px;border-radius:50%;pointer-events:none;',
        '  border:2px solid rgba(232,226,214,.20);background:rgba(10,10,14,.16);',
        '  opacity:0;transition:opacity .13s;}',
        '#plaza-stick.on{opacity:1;}',
        '#plaza-stick i{position:absolute;left:50%;top:50%;width:46px;height:46px;',
        '  margin:-23px 0 0 -23px;border-radius:50%;',
        '  background:rgba(232,226,214,.28);border:1px solid rgba(232,226,214,.42);',
        '  box-shadow:0 2px 10px rgba(0,0,0,.45);}',
        '#plaza-pad{position:absolute;left:0;right:0;z-index:20;display:flex;gap:6px;',
        '  pointer-events:none;',
        '  justify-content:center;bottom:calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 74px);}',
        '#plaza-pad button{pointer-events:auto;}',
        '#plaza-pad button{width:50px;padding:10px 0;font-size:15px;border-radius:10px;',
        '  background:rgba(18,18,26,.66);border:1px solid rgba(170,158,126,.3);color:#ded7c8;',
        '  cursor:pointer;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);}',
        '#plaza-pad button:active{background:rgba(52,46,34,.9);}',
        // ── 채팅 내역 : 왼쪽 아래에 **늘 깔려 있다** (창을 안 열어도 보인다)
        //   그림 아래쪽 어두운 자리에 얹히므로 방이 가려지지 않는다.
        // ★ 글줄을 누르면 채팅 칸이 뜬다 — 그래서 누르는 것을 받는다
        //   (walk 입력은 .plaza-keep 이 막아 준다)
        '#plaza-feed{position:absolute;left:12px;z-index:18;max-width:62%;',
        '  bottom:calc(var(--plaza-safe-bot,env(safe-area-inset-bottom,0px)) + 74px);',
        '  display:flex;flex-direction:column;justify-content:flex-end;gap:2px;',
        '  font-size:11px;line-height:1.55;cursor:pointer;',
        '  padding:6px 8px;margin:-6px -8px;border-radius:10px;',
        '  text-shadow:0 1px 3px #000,0 0 5px #000;}',
        '#plaza-feed:active{background:rgba(14,14,20,.6);}',
        // 끌면 걷게 하려면 브라우저가 먼저 고르기·밀기를 집어가면 안 된다
        '#plaza-feed,#plaza-map{touch-action:none;user-select:none;-webkit-user-select:none;}',
        '#plaza-feed:empty{display:none;}',
        // ★ 긴 말은 잘라서 「…」 로 두지 않고 **줄을 바꿔 이어** 보여 준다
        '#plaza-feed div{color:#ded5c4;white-space:normal;word-break:break-word;}',
        '#plaza-feed .who{color:#9fd8ef;font-weight:bold;}',
        '#plaza-feed .sys{color:#8d8578;}',
        // 서버 채팅으로 온 줄에는 표를 붙인다 (맵 채팅은 표가 없다)
        '#plaza-ov .sv{display:inline-block;padding:0 4px;border-radius:4px;font-size:9px;font-weight:bold;',
        '  background:rgba(217,160,90,.22);color:#ffd79a;vertical-align:1px;}',
        // ── 🤫 귓속말 — 글줄 색을 따로 둔다 (분홍보라)
        '#plaza-ov .wht{display:inline-block;padding:0 4px;border-radius:4px;font-size:9px;font-weight:bold;',
        '  background:rgba(214,120,200,.26);color:#f4b8ea;vertical-align:1px;}',
        '#plaza-ov .wha{color:#f0a8e0;}',
        '#plaza-feed div.wh,#plaza-log div.wh{color:#f3c9ec;}',
        '#plaza-feed div.wh .who,#plaza-log div.wh .who{color:#f0a8e0;}',
        '#plaza-whto{font-size:11px;color:#c9a8c0;margin:-3px 0 8px 2px;flex:0 0 auto;cursor:pointer;}',
        '#plaza-whto b{color:#f0a8e0;}',
        '#plaza-whto i{font-style:normal;color:#8d8578;margin-left:5px;text-decoration:underline;}',
        '#plaza-whlist{display:flex;flex-direction:column;gap:6px;max-height:48vh;overflow-y:auto;}',
        '#plaza-whlist button{display:flex;align-items:center;gap:9px;padding:11px 13px;border-radius:9px;',
        '  background:rgba(255,255,255,.05);border:1px solid #4a5160;color:#ded5c4;cursor:pointer;',
        '  font-family:inherit;font-size:12px;text-align:left;}',
        '#plaza-whlist button b{color:#f0a8e0;}',
        '#plaza-whlist button i{font-style:normal;margin-left:auto;font-size:10.5px;color:#8d8578;}',
        '#plaza-whlist button i.on{color:#81c784;}',
        '#plaza-whlist button i.off{color:#7d7568;}',
        '#plaza-ov .plaza-none{font-size:11.5px;color:#8d8578;padding:14px 2px;}',
        // ── 채팅 칸 머리 : 왼쪽 위에 「서버 · 맵」
        '.plaza-chh{display:flex;align-items:center;gap:9px;margin-bottom:9px;flex:0 0 auto;}',
        '.plaza-chh .t{margin-left:auto;font-size:12.5px;color:#e8dcc6;}',
        '#plaza-ch{display:flex;gap:5px;}',
        '#plaza-ch button{padding:5px 13px;border-radius:999px;font-size:11px;cursor:pointer;',
        '  font-family:inherit;background:rgba(255,255,255,.04);color:#8d8578;',
        '  border:1px solid #2b2b38;}',
        '#plaza-ch button.on{background:rgba(217,160,90,.2);border-color:#8a6a2a;color:#ffe9bd;',
        '  font-weight:bold;}',
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
        // 적는 중에는 바가 그 자리에서 입력칸이 된다 (창을 안 띄운다)
        '#plaza-bar.typing{padding:6px 10px;background:rgba(10,10,16,.94);border-color:#8a6a2a;}',
        '#plaza-bar input{width:100%;min-width:0;padding:7px 6px;font-size:13px;font-family:inherit;',
        '  background:none;border:0;outline:none;color:#e8e2d6;}',
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
        // 카드 속 — 넘치면 여기서 흐른다 (채팅칸처럼 속에서 늘어나는 것도 있어 flex 로 둔다)
        '.plaza-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;',
        '  display:flex;flex-direction:column;}',
        // 메뉴 격자
        '.plaza-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}',
        // 갈래 이름 — 줄 위에 작게 얹는다 (목록 · 가방 · 옷장이 같이 쓴다)
        '.plaza-gh{font-size:10px;color:#8d8578;letter-spacing:.06em;',
        '  margin:13px 2px 6px 2px;display:flex;align-items:center;gap:7px;}',
        '.plaza-gh:first-child{margin-top:0;}',
        '.plaza-gh .n{font-style:normal;color:#6f6a60;font-size:9.5px;}',
        '.plaza-gh:after{content:"";flex:1;height:1px;background:#2b2b38;}',
        '.plaza-gout{margin-top:15px;}',
        '.plaza-grid button{display:flex;flex-direction:column;align-items:center;gap:5px;',
        '  padding:12px 4px;border-radius:13px;background:rgba(255,255,255,.035);',
        '  border:1px solid #2b2b38;color:#ded5c4;font-size:10.5px;font-family:inherit;cursor:pointer;}',
        '.plaza-grid button:active{background:rgba(217,160,90,.14);border-color:#8a6a2a;}',
        '.plaza-grid .e{font-size:21px;line-height:1;}',
        // 알림 불빛 — 바탕 화면과 같은 초록 점(.notify-dot, style.css).
        //   칸이 커서 모서리 **안쪽**에 둔다 (밖에 두면 칸 사이에 떠 보인다).
        '.plaza-grid button.notify-dot:after{top:7px;right:7px;}',
        // 말 창
        '#plaza-log{flex:1 1 auto;min-height:190px;max-height:52dvh;overflow-y:auto;padding:2px 2px 8px 2px;',
        '  font-size:12px;line-height:1.7;}',
        '#plaza-log .who{color:#9fd8ef;font-weight:bold;}',
        '#plaza-log .sys{color:#7d7568;}',
        '#plaza-send{display:flex;gap:7px;padding-top:8px;flex:0 0 auto;}',
        '#plaza-send input{flex:1;min-width:0;padding:12px;font-size:13px;border-radius:11px;',
        '  font-family:inherit;outline:none;',
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
        // 악세 몇 개 달렸나 (3개까지)
        '.plaza-row .pick .cnt{flex:0 0 auto;align-self:center;font-size:10px;color:#9a948a;}',
        // ── 가방(소지품) — 갈래마다 벌여 놓고, 누르면 그 밑에 한 칸이 펴진다
        '.bag-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;}',
        '.bag-it{display:flex;align-items:center;gap:6px;padding:10px 11px;border-radius:10px;',
        '  background:rgba(255,255,255,.035);border:1px solid #2b2b38;color:#ded5c4;',
        '  font-size:11.5px;font-family:inherit;cursor:pointer;text-align:left;}',
        '.bag-it .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.bag-it b{flex:0 0 auto;color:#d9a05a;font-size:10.5px;}',
        '.bag-it.on{background:rgba(217,160,90,.18);border-color:#8a6a2a;color:#ffe9bd;}',
        '.bag-card{margin:8px 0 2px 0;padding:11px 12px;border-radius:11px;',
        '  background:rgba(217,160,90,.07);border:1px solid #6a5a2a;}',
        '.bag-card .t{font-size:12.5px;color:#ffe9bd;font-weight:bold;}',
        '.bag-card .t b{color:#d9a05a;font-size:11px;}',
        '.bag-card .d{font-size:11px;color:#b5ab9a;line-height:1.7;margin:6px 0 9px 0;}',
        '.bag-card .b{display:flex;flex-wrap:wrap;gap:6px;}',
        '.bag-card .non{font-size:10.5px;color:#7d7568;}',
        '.bag-do{padding:8px 13px;border-radius:9px;font-size:11px;font-family:inherit;cursor:pointer;',
        '  background:rgba(255,255,255,.05);border:1px solid #4a5160;color:#ded5c4;}',
        '.bag-do:active{background:rgba(217,160,90,.2);}',
        '.bag-do.sell{color:#8fc7ef;border-color:#2a4a5a;}',
        '.bag-do.off{opacity:.45;cursor:default;}',
        '.plaza-none{padding:24px 0;text-align:center;font-size:11.5px;color:#7d7568;}',
        // 엘리베이터 판 — 그림 위에 손 닿는 자리만 덮어 둔다
        '#plaza-lift{position:relative;width:min(260px,66vw);margin:4px auto 8px auto;}',
        '#plaza-lift img{display:block;width:100%;height:auto;image-rendering:pixelated;}',
        '#plaza-lift button{position:absolute;left:14%;width:72%;border:0;padding:0;cursor:pointer;',
        '  background:rgba(255,233,189,0);border-radius:6px;}',
        '#plaza-lift button:active{background:rgba(255,233,189,.28);}',
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

// ★ other 가 참이면 **남**이다 — 가진 것을 따지지 않고 입은 그대로 그린다.
//
//   남의 모습은 방 칸에 적힌 dot 한 덩이로만 온다. 소지 목록(wardrobe)은
//   이쪽에 없어서, 평소처럼 「가진 것만」으로 거르면 남이 입은 옷·악세가
//   통째로 안 보인다. 실제로 그랬다 — 남은 늘 맨몸으로 보였다.
function makeOne(user, label, k, other) {
    const wrap = document.createElement('div');
    wrap.className = 'plaza-one';
    const sp = spec();
    const w = sp.W * k, h = sp.H * k;
    wrap.style.width = w + 'px';
    wrap.style.height = h + 'px';

    // 남(other)은 서 있을 때 눈 깜빡임·펄럭임을 시계 하나에 묶어 돌린다 (calm) — 그리는 값을 줄인다
    const a = window.dotActor(user, { scale: k, all: !!other, calm: !!other });
    wrap.appendChild(a.el);

    const tag = document.createElement('div');
    tag.className = 'plaza-tag';
    //   칸 위쪽 여백이 4도트에서 29도트로 늘어, 꼭대기에 붙이면 머리에서
    //   한참 떠 버린다. 머리 언저리(빈 몫의 절반쯤)로 내려 붙인다.
    tag.style.top = Math.round(sp.H * k * 0.22) + 'px';
    wrap.appendChild(tag);

    // foot = 칸 아래끝에서 발바닥까지 빈 몫. 이만큼 내려 놓아야 땅에 닿는다.
    const one = { wrap: wrap, actor: a, tag: tag, w: w, h: h, foot: sp.FOOT * k, bub: null };
    setTag(one, (user && user.code) || '', label || '');
    return one;
}

// ── 🏷 닉네임 옆 칭호
//
//   칭호 글은 titles.js 가 만들어 준다 (window.titleTag). 남의 칭호도
//   **내 화면의 사원 명부(db.users)** 에서 바로 읽는다 — 광장으로 주고받는
//   것에는 칭호가 안 실려 있고, 실을 까닭도 없다.
//
//   ★ 이름은 one.name 에 **따로 적어 둔다.** 표를 붙이면 tag.innerText 에
//     칭호까지 섞여, 그것을 이름으로 읽던 자리들(사진 찍기 · 누가 있나 ·
//     배를 다시 만들 때)이 「[칭호] 이름」을 이름으로 쓰게 된다.
// 🖍 반짝 크레용 (crayon.js) — 장착한 사람의 이름 · 글 색. 없으면 그대로
function cyN(c, h) { try { return (typeof window.crayonName === 'function') ? window.crayonName(c, h) : h; } catch (e) { return h; } }
function cyS(c, h) { try { return (typeof window.crayonSay === 'function') ? window.crayonSay(c, h) : h; } catch (e) { return h; } }
// 글줄의 말을 쓴 사람 — 내가 보낸 귓속말 줄은 이름 자리가 받는 사람이고 말은 내 것이다
function sayer(o) { return o.w === 'out' ? ((u_() || {}).code || '') : o.c; }
function tagHtmlOf(code, name) {
    let t = '';
    try {
        const u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
        if (u && typeof window.titleTag === 'function') t = window.titleTag(u, 9) || '';
    } catch (e) { }
    return t + cyN(code, esc(name || ''));
}
function setTag(one, code, name) {
    if (!one || !one.tag) return;
    one.name = name || '';
    one.code = code || '';
    const h = tagHtmlOf(one.code, one.name);
    if (one.tag._h === h) return;          // 그대로면 안 건드린다 (칸이 깜빡인다)
    one.tag.innerHTML = h;
    one.tag._h = h;
}
// 칭호를 바꿔 달면 그 자리에서 따라 바뀐다 (느리게 한 번씩 본다)
function refreshTags() {
    if (!run) return;
    if (run.me) setTag(run.me, run.me.code, run.me.name);
    Object.keys(run.peers).forEach(function (c) {
        const q = run.peers[c];
        if (q && q.one) setTag(q.one, c, q.one.name);
    });
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
        const lab = q.one.name || '';            // 칭호 말고 **이름만**
        try { q.one.actor.stop(); } catch (e) { }
        q.one.wrap.remove();
        q.one = makeOne({ code: c, dot: d }, lab, run.k, true);
        q.hid = false;                         // 새 칸은 보이는 채로 시작한다 (tick 이 다시 가린다)
        q.one.actor.face(q.face || 1);
        run.el.appendChild(q.one.wrap);
    });
}

// 방 안의 자리(x·y)는 **그림 원래 크기**로 센다. 화면에 놓을 때만 배로 늘린다.
function zz() { return (run && run.z) || 1; }

function putOne(one, x, y) {
    const z = zz();
    const L = Math.round(x * z - one.w / 2);
    const T = Math.round(y * z - (one.h - (one.foot || 0)));
    // ★ 칸 아래끝이 곧 발이 아니다 — 새 규격은 발밑이 여덟 도트 비어 있다.
    //   그만큼(foot) 도로 내려 놓아야 땅에 선다.
    //
    //   ★ 그 자리 그대로면 **안 적는다.** style 에 적으면 같은 값이어도
    //     브라우저가 다시 재 본다. 사람이 스물다섯이면 한 틀에 일흔다섯 번,
    //     초당 사천 번이다. 서 있는 사람은 대개 자리가 안 바뀐다.
    if (one._L !== L) { one.wrap.style.left = L + 'px'; one._L = L; }
    if (one._T !== T) { one.wrap.style.top = T + 'px'; one._T = T; }
    let Z = 100 + Math.round(y);                             // 아래에 있는 사람이 앞
    // 🔒 가두리 — 갇힌 사람만 창살 뒤로. 나머지는 가두리 앞을 지나는 것처럼 늘 창살 앞에 그린다
    //   (뒤로 지나가면 안에 든 것처럼 보였다)
    const cgr = run && R[run.room] && R[run.room].cage;
    if (cgr && Math.abs(x - cgr.x) < cgr.w / 2 + 60) {
        let inside = false;
        try { inside = !!(one.code && typeof window.gaduriOf === 'function' && window.gaduriOf(one.code) === run.room); } catch (e) { }
        if (!inside) Z = Math.max(Z, 101 + Math.round(cgr.zy));
    }
    if (one._Z !== Z) { one.wrap.style.zIndex = String(Z); one._Z = Z; }
}

// ★ 이모티콘은 말풍선 길을 그대로 탄다.
//   자리 기록에 싣는 글자가 [emo:e01] 꼴이면 글 대신 그림을 띄운다.
//   따로 길을 내지 않은 까닭은, 말풍선이 뜨고 지는 셈(SAY_MS·st)을
//   두 벌로 만들면 어긋나기 때문이다.
const EMO_RE = /^\[emo:([A-Za-z0-9_-]{1,12})\]$/;
// ★ 말풍선 **모양**은 바깥(bubbles.js)에서 고른다.
//   여기서는 고른 이름을 sb-○○ 라는 갈래 이름으로 붙이기만 한다.
//   bubbles.js 가 없으면 아무것도 안 붙어 전처럼 보인다.
// 저 사번이 **그 말풍선**을 가졌나 (bubbles.js 가 답한다 — 없으면 안 쓴다)
function sbOkOf(code, id) {
    try { return (typeof window.sbAllowedCode === 'function') ? !!window.sbAllowedCode(code, id) : false; }
    catch (e) { return false; }
}
function sbMine() {
    try { return (typeof window.sbOf === 'function') ? (window.sbOf(u_()) || '') : ''; }
    catch (e) { return ''; }
}
function bubble(one, text, sty) {
    if (one.bub) { one.bub.remove(); one.bub = null; }
    if (!text) return;
    const b = document.createElement('div');
    b.className = 'plaza-say';
    // 고른 모양이 있으면 **얹을 자리**도 같이 만들어 둔다 (bubbles.js 가 그림을 깐다).
    //   ✗ :before 로 못 한다 — 꼬리 테두리가 이미 쓰고 있다.
    // ★ 얹는 그림이 **여러 조각**일 수 있다 (도깨비불+술, 여우 귀 양쪽 따위).
    //   몇 조각인지는 bubbles.js 가 안다 — 없으면 전처럼 한 조각이다.
    let sbis = [];
    if (sty && /^[a-z0-9]{1,12}$/.test(String(sty))) {
        b.classList.add('sb-' + sty);
        let np = 1;
        try { if (typeof window.sbParts === 'function') np = window.sbParts(sty) || 1; }
        catch (e) { np = 1; }
        for (let i = 1; i <= np; i++) {
            const el = document.createElement('i');
            el.className = 'sbi p' + i;
            sbis.push(el);
        }
    }
    const m = EMO_RE.exec(String(text));
    if (m && typeof window.emoTag === 'function' && typeof window.emoById === 'function'
        && window.emoById(m[1])) {
        b.classList.add('emo');
        b.innerHTML = window.emoTag(m[1], 64);
    } else {
        b.innerText = text;
        // 🖍 반짝 크레용 — 말풍선 글자 색 (바탕이 밝아 옅은 색은 어두운 테를 두른다)
        try {
            const cc = (typeof window.crayonBubbleCss === 'function') ? window.crayonBubbleCss(one.code) : '';
            if (cc) b.style.cssText += ';' + cc;
        } catch (e) { }
    }
    sbis.forEach(function (el) { b.appendChild(el); });
    one.wrap.appendChild(b);
    one.bub = b;
}

// ==========================================
// 방을 연다
// ==========================================
function roomOf() { return R[run.room]; }

// ==========================================
// 🔒 가두리 — 상담사가 가둔 사원 (gaduri.js 가 누가 어디 갇혔는지 안다)
// ==========================================
//
//   광장 · 백일몽 로비에 하나씩 서 있다 (방 표의 cage). 갇힌 사원은
//     · 광장에 들어오면 그 방으로 가고, 가두리 안에서만 움직인다 (x · y 를 안쪽으로 자른다)
//     · 다른 방으로 못 간다 (좌우 끝 · 입구 · 목록 · 동료 찾아가기 · 포토존이 다 막힌다)
//     · 방 안 시설 입구도 못 누른다
//   같은 장소의 몇 번 방이든 가두리는 다 있다. 자리는 제 화면이 자르므로 남에게도 안에 보인다.
function cageMine() {
    try {
        const u = u_();
        const k = (u && typeof window.gaduriOf === 'function') ? (window.gaduriOf(u.code) || '') : '';
        return (k && R[k] && R[k].cage) ? k : '';
    } catch (e) { return ''; }
}
// 사람이 설 수 있는 안쪽 — 바깥 기둥 안으로 들이고, 앞뒤는 가두리 앞면(zy)보다 뒤
function cageBox(r) {
    const c = r && r.cage;
    if (!c) return null;
    const pad = 58;
    return { x0: c.x - c.w / 2 + pad, x1: c.x + c.w / 2 - pad,
             y0: r.floor[0] + 3, y1: Math.min(r.floor[1] - 2, c.zy - 8) };
}
function cageMid(r) { const b = cageBox(r); return b ? { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 } : null; }
// 한 걸음마다 — 갇혔으면 안쪽으로 잘라 둔다
function cageHold(r) {
    if (!run || !cageMine() || run.room !== cageMine()) return false;
    const b = cageBox(r);
    if (!b) return false;
    run.lv = 0; run.seg = 'up';
    run.x = Math.max(b.x0, Math.min(b.x1, run.x));
    run.y = Math.max(b.y0, Math.min(b.y1, run.y));
    if (run.tx != null) {
        run.tx = Math.max(b.x0, Math.min(b.x1, run.tx));
        if (run.ty != null) run.ty = Math.max(b.y0, Math.min(b.y1, run.ty));
        run.tseg = null;
    }
    return true;
}
function paintCage() {
    Array.prototype.forEach.call(run.el.querySelectorAll('.plaza-cage'), function (e) { e.remove(); });
    const r = roomOf(), c = r && r.cage, z = zz();
    if (!c) return;
    const e = document.createElement('div');
    e.className = 'plaza-cage';
    e.style.left = Math.round((c.x - c.w / 2) * z) + 'px';
    e.style.top = Math.round((c.base - c.h) * z) + 'px';
    e.style.width = Math.round(c.w * z) + 'px';
    e.style.height = Math.round(c.h * z) + 'px';
    e.style.zIndex = String(100 + Math.round(c.zy));
    e.innerHTML = '<img src="' + P.DIR + 'gaduri.png" alt=""><div class="t">가두리</div>';
    run.el.appendChild(e);
    // 🍖 먹이 던지기 — 가두리 위에 (갇힌 사람에게는 안 보인다 · gaduri.js 가 고르는 창을 띄운다)
    const f = document.createElement('div');
    f.className = 'plaza-spot plaza-feed-btn';
    f.style.left = Math.round(c.x * z) + 'px';
    f.style.top = Math.round((c.base - c.h - 8) * z) + 'px';
    f.style.display = cageMine() ? 'none' : '';
    f.innerHTML = '<div class="b" style="width:38px;height:38px;font-size:18px;">🍖</div><div class="t">먹이 던지기</div>';
    f.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); });
    f.addEventListener('click', function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        if (cageMine()) return;
        if (typeof window.gaduriFeedOpen === 'function') window.gaduriFeedOpen(run.room);
    });
    run.el.appendChild(f);
}
// 갇히거나 풀리면 그 자리에서 — 다른 방이면 데려가고, 같은 방이면 안으로 세운다
let cageWas = '';
setInterval(function () {
    if (!run || !run.me) return;
    const k = cageMine();
    if (k === cageWas) return;
    const before = cageWas;
    cageWas = k;
    const fb = run.el && run.el.querySelector('.plaza-feed-btn');       // 갇히면 먹이 단추를 감춘다
    if (fb) fb.style.display = k ? 'none' : '';
    if (k) {
        if (run.room !== k) { goRoom(k, null, 0); }
        else {
            const m = cageMid(roomOf());
            if (m) { run.x = m.x; run.y = m.y; run.lv = 0; run.seg = 'up'; run.tx = null; run.tseg = null; putOne(run.me, run.x, run.y); camera(true); wake(); }
        }
        sysLine('🔒 ' + R[k].n + ' 가두리에 갇혔습니다.');
    } else if (before) {
        sysLine('🔓 가두리에서 풀려났습니다.');
    }
}, 800);

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
// ※ 다닐 수 있는 자리는 이제 **띠가 아니라 선**이다 (아래 segX · segY).
//   띠로 자르던 yRange · xRange 는 쓰지 않는다.
// ★ 내려가는 자리 — 글자 하나만 적으면 **바닥 끝 어디서나** 내려간다.
//   그러면 건물 안에 지하가 생긴 뒤로는 계단 쪽으로 걸어 내려가다가
//   그 전에 밖으로 튕겨 나간다. 그래서 { to, x } 로 **문 자리**를 적는다.
function downOf(r) {
    if (!r || !r.down) return null;
    return (typeof r.down === 'string') ? { to: r.down, x: null } : r.down;
}

function lvAt(r, y) {
    if (!r.floor2) return 0;
    const mid = (r.floor[1] + r.floor2[0]) / 2;
    return y >= mid ? 1 : 0;
}

// ==========================================
// ★ 선 — 다닐 수 있는 자리는 **띠가 아니라 선**이다
// ==========================================
//
//   바닥은 **띠**, 계단은 **선**이다.
//
//       '길'      윗층 — 방 끝에서 끝까지, y 는 floor 띠 안 (845~905)
//       '지하'    아랫층 — x2 안에서만, y 는 floor2 띠 안 (1262~1288)
//       0 · 1     계단 — x 를 따라 비스듬히 내려가는 **선**
//
//   ★ 바닥을 다시 띠로 돌렸다. 선 하나로 묶었더니 바닥이 **깊이 없는
//     외줄**이 되어, 그려진 돌바닥을 앞뒤로 못 밟았다. 띠 폭은 그림에서
//     재 왔다 — 네 방 다 돌바닥이 845~905, 아랫단이 1262~1288 이다.
//     계단은 그대로 선이다 (층계를 비껴 딛지 않게).
//
//   ★ 띠와 계단이 **맞닿는 자리**를 띠 끝에 맞췄다.
//       계단 윗끝 y = 905 = 바닥 띠 **아랫변**  → 앞으로 걸어 나가 내려간다
//       계단 아랫끝 y = 1262 = 아랫단 띠 **윗변** → 내려서면 바로 아랫단
//     그래서 갈아탈 때 위아래로 튀지 않는다.
//
//   세 선은 **고리**로 이어진다 (주신 그림의 빨간 테두리 그대로).
//
//       길 ─────────────────────────────
//        ╲                             ╱     ← 계단
//         ╲── 지하 ────────────────────╱
//
//   · 계단 **아랫끝**은 지하 선과 y 가 똑같다 — 그냥 걸어가면 이어진다.
//   · 계단 **윗끝**은 길 바로 밑이다. 거기서만 위아래로 밀어 갈아탄다
//     (⇵ 표가 그 자리에 서 있다).
//     ✗ x 만 보고 저절로 내려가게 하면, 계단 x 를 지나는 순간 끌려
//       내려가서 그 너머(옆 방으로 가는 길)로는 영영 못 간다.
const JOIN_X = 80;          // 계단 입구로 보는 거리 (화면에서 27px 쯤)

function midY(b) { return (b[0] + b[1]) / 2; }
function stairTopX(s) { return (s.y0[0] < s.y0[1]) ? s.x[0] : s.x[1]; }
function segList(r) {
    const out = ['up'];
    if (r.floor2 && r.x2) out.push('dn');
    (r.stairs || []).forEach(function (_, i) { if (r.floor2) out.push(i); });
    return out;
}
// 띠로 된 선인가 — 길·지하는 띠(위아래로 다닌다), 계단은 선
function segBand(r, seg) {
    if (seg === 'dn') return r.floor2;
    if (seg === 'up') return r.floor;
    return null;
}
// 그 선(띠) 위의 y. 띠면 **지금 y 를 띠 안으로 자른 값**, 선이면 선의 y.
function segY(r, seg, x, y) {
    const b = segBand(r, seg);
    if (b) return (y == null) ? midY(b) : Math.max(b[0], Math.min(b[1], y));
    return midY(stairBand(r.stairs[seg], x));
}
function segX(r, seg) {
    if (seg === 'dn') return [r.x2[0], r.x2[1]];
    if (typeof seg === 'number') return [r.stairs[seg].x[0], r.stairs[seg].x[1]];
    return [P.EDGE, r.w - P.EDGE];
}
// 깊이 — 길 0 · 계단 1 · 지하 2 (어느 쪽으로 갈아타야 하는지 셀 때)
function segDeep(seg) { return seg === 'up' ? 0 : (seg === 'dn' ? 2 : 1); }

// 선 끝에서 **y 가 맞닿는** 다른 선 (계단 아랫끝 ↔ 지하처럼)
function nextSeg(r, seg, x) {
    const y = segY(r, seg, x, run.y);
    let best = null, bd = 60;
    segList(r).forEach(function (o) {
        if (o === seg) return;
        const xr = segX(r, o);
        if (x < xr[0] - 1 || x > xr[1] + 1) return;
        const d = Math.abs(segY(r, o, Math.max(xr[0], Math.min(xr[1], x)), y) - y);
        if (d < bd) { bd = d; best = o; }
    });
    return best;
}

// 지금 선에서 저 선으로 가려면 어느 x 로 걸어가야 하나
function wayX(r, seg, want) {
    if (seg === want) return null;
    const st = r.stairs || [];
    if (seg === 'up') {                       // 길 → 계단·지하 : 가까운 계단 윗끝
        if (typeof want === 'number') return stairTopX(st[want]);
        let bx = null, bd = 1e9;
        st.forEach(function (s) {
            const d = Math.abs(stairTopX(s) - run.x);
            if (d < bd) { bd = d; bx = stairTopX(s); }
        });
        return bx;
    }
    if (seg === 'dn') {                       // 지하 → 계단·길 : 가까운 계단 아랫끝
        const xr = segX(r, 'dn');
        return (Math.abs(run.x - xr[0]) <= Math.abs(run.x - xr[1])) ? xr[0] : xr[1];
    }
    const s = st[seg];                        // 계단 → 위면 윗끝, 아래면 아랫끝
    const top = stairTopX(s);
    return (segDeep(want) < 1) ? top : (top === s.x[0] ? s.x[1] : s.x[0]);
}

// 띠에서 다른 선으로 넘어갈 때 **어느 깊이로** 걸어 나가야 하나.
//   아래로 가려면 띠 아랫변(계단 윗끝이 거기 있다), 위로 가려면 띠 윗변.
function wayY(r, seg, want) {
    const b = segBand(r, seg);
    if (!b) return null;
    return (segDeep(want) > segDeep(seg)) ? b[1] : b[0];
}

// 한 칸 움직인 뒤 — 선을 갈아타고, x 를 자르고, y 를 선 위에 얹는다
function segStep(r, vdir) {
    if (!r.floor2 || !(r.stairs || []).length) {       // 층이 하나인 방
        run.seg = 'up'; run.lv = 0;
        const xr0 = segX(r, 'up');
        run.x = Math.max(xr0[0], Math.min(xr0[1], run.x));
        run.y = segY(r, 'up', run.x, run.y);
        return;
    }
    if (run.seg == null || (typeof run.seg === 'number' && !r.stairs[run.seg])) {
        run.seg = (run.lv === 1) ? 'dn' : 'up';
    }

    // ① 위아래로 밀었다 — **띠 아랫변까지 걸어 나간 뒤**에 계단으로 내려선다.
    //   띠 안에서는 그냥 앞뒤로 걷는다 (tick 이 y 를 민다). 아랫변에 닿고도
    //   더 밀면, 그때 계단 윗끝이 가까우면 계단을 탄다.
    //   계단 윗끝 y 가 띠 아랫변과 같아서 갈아탈 때 위아래로 안 튄다.
    if (vdir > 0 && run.seg === 'up' && run.y >= r.floor[1] - 0.8) {
        for (let i = 0; i < r.stairs.length; i++) {
            const tx = stairTopX(r.stairs[i]);
            if (Math.abs(run.x - tx) <= JOIN_X) { run.seg = i; run.x = tx; break; }
        }
    } else if (vdir < 0 && typeof run.seg === 'number') {
        const tx = stairTopX(r.stairs[run.seg]);
        if (Math.abs(run.x - tx) <= JOIN_X) { run.seg = 'up'; run.x = tx; }
    }

    // ② 선 끝을 넘었다 — 맞닿은 선으로 건너간다 (계단 아랫끝 ↔ 지하)
    for (let n = 0; n < 4; n++) {
        const xr = segX(r, run.seg);
        if (run.x >= xr[0] && run.x <= xr[1]) break;
        const edge = (run.x < xr[0]) ? xr[0] : xr[1];
        const nx = nextSeg(r, run.seg, edge);
        if (nx == null) { run.x = edge; break; }
        run.seg = nx;
    }

    // ③ 선(띠) 위에 얹는다
    const xr2 = segX(r, run.seg);
    run.x = Math.max(xr2[0], Math.min(xr2[1], run.x));
    run.y = segY(r, run.seg, run.x, run.y);
    run.lv = (run.seg === 'dn') ? 1 : (typeof run.seg === 'number' ? lvAt(r, run.y) : 0);
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
// 사람 배를 끊는 눈금 — 도트가 고르게 찍히는 자리들
const K_STEP = [1/4, 1/3, 1/2, 2/3, 3/4, 1];
function snapK(v) {
    let best = K_STEP[0];
    for (let i = 1; i < K_STEP.length; i++) {
        if (Math.abs(K_STEP[i] - v) < Math.abs(best - v)) best = K_STEP[i];
    }
    return best;
}

// ★ 창 크기는 **떠 둔다.**
//
//   clientWidth·clientHeight 를 읽으면 브라우저가 그 자리에서 판을 다시
//   잰다(forced layout). 틀마다 읽으면, 사람들이 걸어서 판이 어수선한
//   동안 **매 틀마다 판을 통째로 다시 재게 된다.** 재 보니 틀 시간의
//   5% 가 이 한 줄에서 나갔다. 창 크기는 창을 돌리거나 자판이 올라올 때만
//   바뀌고, 그때는 onSize 가 떠 둔 값을 버린다.
function viewBox() {
    const v = run && run.view;
    if (!v) return { w: 0, h: 760 };
    if (!run._vb) run._vb = { w: v.clientWidth, h: v.clientHeight };
    return run._vb;
}
function viewForget() { if (run) run._vb = null; }

function zoomOf(r) {
    const v = run && run.view;
    const vh = (v && viewBox().h) || 760;
    const cut = (r.cut != null) ? r.cut : (P.CUT || 0);
    return vh / Math.max(200, r.h - cut);
}

function paintRoom() {
    const r = roomOf();
    run.z = zoomOf(r);
    // ★ 사람도 같은 배로 줄이되, **정해진 눈금으로 끊는다.**
    //
    //   사람 그림은 도트 한 칸이 4픽셀이다. 배를 끊지 않으면 (0.38 같은 값)
    //   한 칸이 1.5픽셀처럼 어중간해져서, 찍을 때 어떤 줄만 한 픽셀 더
    //   들어간다 — 눈이 뭉개지고 테두리가 울퉁불퉁해진다.
    //
    //   눈금을 4분의 1로만 두었더니 0.25 다음이 0.5 라 **두 배씩** 뛰었다.
    //   그래서 3분의 1 자리를 끼워 넣었다. 방 그림이 1880x2556 으로 커진
    //   뒤로는 이 자리에 떨어진다 (키 96 → 128px).
    //   3분의 1 은 아이폰(dpr 3)에서 한 도트가 딱 4픽셀로 떨어진다.
    run.k = snapK(r.k * run.z);
    const w = Math.round(r.w * run.z), h = Math.round(r.h * run.z);
    run.el.style.width = w + 'px';
    run.el.style.height = h + 'px';
    // 줄여 그릴 때 nearest(pixelated) 로 찍으면 도트가 깨져 어른거린다
    //   포토존(pix)은 파일이 제 크기(도트 한 칸 = 한 점)라 늘 키워 그린다 — 늘 또렷하게.
    run.el.style.imageRendering = (r.pix || run.z >= 1) ? 'pixelated' : 'auto';
    run.el.style.backgroundImage = 'url("' + P.DIR + r.img + '")';
    run.el.style.backgroundSize = w + 'px ' + h + 'px';
    paintMap();                     // 미니맵이 방 이름까지 맡는다 (📍 띠를 대신한다)
    paintExits();
    paintSpots();
    paintCage();                    // 🔒 가두리 (그 방에 있으면)
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
    // ★ ▲ ▼ 는 안 세운다 — 건물 안팎은 이제 **입구를 눌러야** 드나든다.
    //   화살표만 남으면 걸어가면 넘어가는 줄 알고 바닥 끝을 더듬게 된다.
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
// 그림 아이콘 한 칸. ic 가 없으면 전처럼 글자 그림(i)을 쓴다.
function ico(o, cls) {
    if (!o || (!o.ic && !o.i)) return '';      // 그림도 글자도 없으면 아예 안 그린다
    if (o && o.ic) {
        return '<span class="pico ' + (cls || '')
            + '" style="--ic:url(\'ico/' + o.ic + '.png\')"></span>';
    }
    return '<span class="' + (cls || '') + '">' + esc((o && o.i) || '') + '</span>';
}

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
        e.innerHTML = '<div class="b">' + ico(s) + '</div><div class="t">' + esc(s.n) + '</div>';
        // ★ 게시판 — 단추가 아니라 **세워 둔 판**으로 그린다 (board.js 가 그림을 준다).
        //   사람처럼 선 자리(y)로 앞뒤를 가린다 — 판 뒤를 지나가는 사람은 가려진다.
        if (s.board && typeof window.plazaBoardArt === 'function') {
            e.className = 'plaza-spot plaza-board';
            e.style.zIndex = String(100 + Math.round(s.y != null ? s.y : b[0]));
            e.innerHTML = '<div class="bd" style="width:' + Math.round(s.bw * z) + 'px;height:'
                + Math.round(s.bh * z) + 'px">' + window.plazaBoardArt() + '<i class="nd"></i></div>'
                + '<div class="t">' + esc(s.n) + '</div>';
        }
        // ★ **손가락을 뗄 때(click)** 연다 — 누르는 순간이 아니다.
        //
        //   ✗ 전에는 pointerdown 에서 바로 열었다. 그러면 손가락이 아직
        //     화면에 있는 채로 창이 그 밑에 깔리고, 손을 뗄 때 click 이
        //     **새로 깔린 창의 단추**로 들어갔다. 의상숍 입구를 눌렀을
        //     뿐인데 「1회 30,000 P」가 그대로 눌려 한 장이 뽑혔다.
        //     (click 은 pointerdown 을 막아도 그대로 나간다 — 규격이 그렇다)
        //
        //   pointerdown 은 **조이스틱에 안 뺏기려고** 그대로 둔다
        //   (광장 창이 #plaza-view 안의 누름을 다 걷어 가므로).
        e.addEventListener('pointerdown', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
        });
        e.addEventListener('click', function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            if (cageMine()) { sysLine('🔒 가두리 안에서는 쓸 수 없습니다.'); return; }
            goApp(s);
        });
        run.el.appendChild(e);
    });
}

// ★ 이 시설이 **어느 방 어디에** 서 있나 — 방 표에서 찾아낸다.
//   목록에서 고르면 바로 열지 않고 그 방으로 보내는 데 쓴다.
function placeOf(m) {
    if (!m || (!m.tab && !m.fn)) return null;
    const keys = Object.keys(R);
    for (let i = 0; i < keys.length; i++) {
        const r = R[keys[i]];
        const list = (r.spots || []).concat(r.lift ? [].concat(r.lift.f2 || [], r.lift.b1 || []) : []);
        for (let j = 0; j < list.length; j++) {
            const s = list[j];
            if (m.fn ? (s.fn === m.fn) : (s.tab === m.tab && (s.sub || '') === (m.sub || ''))) {
                return { room: keys[i], spot: s };
            }
        }
    }
    return null;
}

// ★ 스킵권 — 한 번은 걸어가지 않고 바로 들어간다.
//   표를 **고르는 순간** 거둔다 (목록만 열어 두고 안 고르면 안 쓴다).
let skipTake = null;
window.plazaSkipArm = function (take) { skipTake = take || function () { return true; }; };
window.plazaSkipOn = function () { return !!skipTake; };
window.plazaMenu = function () { if (run) menuSheet(); };

// ★ 옷이나 얼굴이 바뀌었을 때 — 서 있는 사람을 그 자리에서 갈아입힌다.
//   방을 다시 열지 않는다 (자리·카메라를 그대로 두고 모습만 다시 만든다).
window.plazaRedress = function () {
    if (!run || !run.room) return false;
    remakeFolk();
    Object.keys(run.peers).forEach(function (c) {
        const q = run.peers[c]; putOne(q.one, q.x, q.y);
    });
    if (run.me) putOne(run.me, run.x, run.y);
    // ★ **남에게도 다시 알린다.** 안 그러면 나만 갈아입은 것으로 보이고,
    //   남의 화면에서는 옛 옷 그대로다 (자리가 안 바뀌면 안 보내기 때문).
    run.sx = -9999; run.sy = -9999; run.sent = 0;
    return true;
};

// ★ 사진(shot.js)이 **다시 그릴 수 있게** 지금 보이는 것을 그대로 내어 준다.
//   화면을 뜨는 길이 손전화에 없어서, 무엇으로 되어 있는지 아는 쪽이
//   직접 그린다. 방 그림 한 장과 사람들의 옷 장 — 그게 전부다.
//
//   ★ 장 이름은 dataset.sheet 가 아니라 **지금 깔린 그림 주소**에서 읽는다.
//     오른쪽을 볼 때 머리 장은 짝(h05 → h09)으로 갈리는데, dataset 은
//     만들 때 적힌 채라 안 바뀐다. 그대로 쓰면 사진에서 안대가 건너간다.
window.plazaShotData = function () {
    if (!run || !run.room) return null;
    const r = roomOf(), z = zz();
    const v = run.view.getBoundingClientRect();
    const one = function (o, label) {
        const b = o.wrap.getBoundingClientRect();
        const box = o.wrap.querySelector('.dot-box');
        const layers = [];
        Array.prototype.forEach.call((box ? box.querySelectorAll('.dot-layer') : []), function (e) {
            if (e.style.display === 'none') return;          // 가만히 서 있는 동작이 갈아 끼운 층은 빼고
            const u = /url\(["']?(.*?)["']?\)/.exec(e.style.backgroundImage || '');
            const src = u ? u[1] : ('dot/' + (e.dataset.sheet || '') + '.png');
            // 칸 크기 = 사람 칸 크기와 같다 (옷 장 한 칸이 곧 사람 한 칸)
            const p = (e.style.backgroundPosition || '').match(/-?[\d.]+/g) || [];
            layers.push({
                src: src,
                col: b.width ? Math.round(Math.abs(parseFloat(p[0]) || 0) / b.width) : 0,
                row: b.height ? Math.round(Math.abs(parseFloat(p[1]) || 0) / b.height) : 0
            });
        });
        // 이름표가 붙은 높이 — 글자 밑선까지
        let tagY = Math.round(b.height * 0.22) + 9;
        if (o.tag) { const t = o.tag.getBoundingClientRect();
                     tagY = Math.round(t.bottom - b.top - t.height * 0.22); }
        // 말풍선 — 글이든 이모티콘이든 지금 떠 있는 것을 그대로 본다
        const bub = o.wrap.querySelector('.plaza-say');
        const img = bub && bub.querySelector('img');
        return { x: b.left - v.left, y: b.top - v.top, w: b.width, h: b.height,
                 flip: /scaleX\(-1\)/.test((box && box.style.transform) || ''),
                 tagY: tagY, name: label,
                 say: (bub && !img) ? bub.innerText : '',
                 emo: img ? img.src : '',
                 layers: layers };
    };
    const folk = [];
    if (run.me) folk.push(one(run.me, run.me.name || ''));
    Object.keys(run.peers).forEach(function (c) {
        const q = run.peers[c];
        folk.push(one(q.one, q.one.name || ''));
    });
    return {
        vw: viewBox().w, vh: viewBox().h,
        cx: run.cx, cy: run.cy,
        room: { img: P.DIR + r.img, name: r.n, w: r.w * z, h: r.h * z, pix: !!r.pix },
        folk: folk
    };
};

// 시설·메뉴로 건너간다
//
//   사원 쪽에서는 **광장을 닫지 않는다.** 광장이 집이라 돌아올 데가
//   거기뿐이다. 그 칸만 광장 위에 띄우고(shell.js 의 plazaPanel),
//   닫으면 그대로 광장이 남아 있다.
//   상담사 쪽은 전처럼 광장을 닫고 옛 화면의 그 탭을 누른다.
function goApp(s) {
    const solo = !!(typeof window.plazaSolo === 'function' && window.plazaSolo());
    try {
        // 엘리베이터 — 층을 고르는 판을 띄운다
        if (s.lift) { liftSheet(); return; }
        // 방으로 들어가는 입구 — 광장을 닫지 않고 그 방으로 건너간다
        if (s.go) { closeSheet(); goRoom(s.go, null, s.golv); return; }
        if (s.fn) {
            // 창(모달)은 광장 위에 뜬다 — 사원 쪽은 광장을 바탕으로 깔아 두었다
            if (!solo) shut();
            closeSheet();
            const f = window[s.fn];
            if (typeof f === 'function') setTimeout(function () { try { f(); } catch (e) { } }, 40);
            return;
        }
        if (solo) {
            closeSheet();
            if (window.plazaPanel(s.tab, s.sub, esc(s.n || ''))) return;
        }
        shut();
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
function goRoom(key, way, lv) {
    if (!run || !R[key]) return;
    // 🔒 갇혔으면 가두리 방 밖으로는 못 간다 — 이미 거기 있으면 그대로, 밖이면 그리로 데려간다
    const cg = cageMine();
    if (cg && key !== cg) {
        if (run.room === cg && run.me) { sysLine('🔒 가두리에 갇혀 있어 나갈 수 없습니다.'); return; }
        key = cg; way = null; lv = 0;
    }
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
    if (lv != null) run.lv = (lv === 1 && r.floor2) ? 1 : 0;   // 집어서 보낸 층
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
    if (cg && key === cg) {                                     // 🔒 가두리 안에 선다
        const m = cageMid(r);
        if (m) { run.lv = 0; run.x = m.x; run.y = m.y; }
    }

    // ★ 선 위에 세운다 — 들어온 층의 선에 얹고, 그 선의 x 폭 안으로 자른다
    run.seg = (run.lv === 1 && r.floor2 && r.x2) ? 'dn' : 'up';
    segStep(r, 0);
    run.tx = null; run.tseg = null;
    run.warp = now();                       // 넘어간 직후에는 또 안 넘어간다
    // ★ 방을 옮겨도 **오간 말을 안 지운다.**
    //
    //   ✗ 전에는 서버 채팅만 남기고 맵 말과 귓속말을 다 털었다. 그런데
    //     귓속말은 방과 아무 상관이 없고(사람 앞으로 오는 것이다), 맵 말도
    //     옆 방으로 한 발 옮겼다고 하던 얘기가 통째로 사라지면 끊긴다.
    //     이제 지우지 않는다 — 같은 줄이 두 번 서는 것은 열쇠(k)로 막는다.
    paintFeed();
    run._swept = false;                     // 새 방에서 한 번 쓸어 낸다

    // ★ 방을 먼저 그린다 — 그래야 늘린 배(run.z)가 정해져 사람이 제자리에 선다
    paintRoom();

    // 사람을 다시 만든다 (배율이 방마다 다르다)
    const u = u_();
    run.me = makeOne(u, nameOf(u), run.k);
    run.el.appendChild(run.me.wrap);
    putOne(run.me, run.x, run.y);

    try { localStorage.setItem('plazaRoom', key); } catch (e) { }
    // ★ 몇 번 방에 들지 먼저 정한다 — 정해지기 전에는 자리를 안 적는다 (run.ref 가 없다).
    //   **자리가 남은 가장 앞 번호**로 든다. 있던 번호를 고집하면, 한 번 2번
    //   방으로 밀린 사람은 어디를 가도 2번에 남아 1번에 있는 사람과 영영
    //   못 만난다 (사람이 적을 때도 갈라진다). 앞 번호부터 채우면 모인다.
    //   동료 목록으로 찾아갈 때만 그 방 번호로 바로 든다 (forceInst).
    run.hops = 0;
    const force = !!run.forceInst;
    const want = run.forceInst || null;
    run.forceInst = 0;
    joinInst(want, force);
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
    if (run.idleT) { clearTimeout(run.idleT); run.idleT = 0; }
    run.idle = false;
    run.last = performance.now();
    run.raf = requestAnimationFrame(tick);

    // 칭호는 자주 바뀌지 않는다 — 삼 초에 한 번만 본다
    if (!run.tagIv) run.tagIv = setInterval(refreshTags, 3000);
    // 끊긴 사람 걷기 — 오 초에 한 번 (child_removed 가 안 올 때를 위한 그물)
    if (!run.swpIv) run.swpIv = setInterval(sweepPeers, 5000);
}

// ==========================================
// 한 걸음
// ==========================================
function tick(ts) {
    if (!run) return;
    const r = roomOf();
    const dt = Math.min(0.05, (ts - run.last) / 1000);
    run.last = ts;

    // ─ 손이 미는 쪽 (자판 · 조이스틱)
    let ix = 0, iy = 0;
    const k = run.keys;
    if (k.left) ix -= 1;
    if (k.right) ix += 1;
    if (k.up) iy -= 1;
    if (k.down) iy += 1;

    // ─ 조이스틱이 먼저다. 민 만큼만 걷는다 (살짝 밀면 느리게).
    if (run.ax || run.ay) { ix = run.ax; iy = run.ay; }

    // ★ 민 쪽으로 **천천히 붙고 천천히 떨어진다** (P.EASE).
    //   손이 떨려도 사람이 안 꺾이고, 손을 떼도 뚝 서지 않고 한 발 더 간다.
    //   dt 를 넣어 셈하므로 화면이 느린 기계에서도 같은 빠르기로 붙는다.
    const ea = 1 - Math.exp(-dt / P.EASE);
    run.vx += (ix - run.vx) * ea;
    run.vy += (iy - run.vy) * ea;
    // 거의 0 이면 0 으로 떨군다 — 안 그러면 영영 조금씩 미끄러진다
    if (!ix && Math.abs(run.vx) < 0.012) run.vx = 0;
    if (!iy && Math.abs(run.vy) < 0.012) run.vy = 0;

    let dx = run.vx, dy = run.vy;

    if (ix || iy) { run.tx = null; run.ty = null; run.tseg = null; }
    else if (run.tx != null) {
        // ★ 짚어서 갈 때도 **선을 따라** 간다. 다른 선을 짚었으면 그리로
        //   가는 끝까지 먼저 걷고, 거기서 갈아탄 뒤 이어 간다.
        //   바닥 띠 위에서는 **짚은 깊이까지** 세로로도 걸어간다.
        const onSeg = (run.tseg == null || run.tseg === run.seg);
        const gx = onSeg ? run.tx : wayX(r, run.seg, run.tseg);
        const gy = onSeg ? run.ty : wayY(r, run.seg, run.tseg);
        const ax = (gx == null ? run.tx : gx) - run.x;
        const ay = (gy == null) ? 0 : (gy - run.y);
        // ★ 한 칸에 갈 만큼 가까우면 **그 자리에 붙인다.**
        //   전에는 3픽셀 안에 들 때까지 걸었는데, 한 칸에 3.5픽셀씩 가므로
        //   목표를 넘었다 돌아왔다 하며 떨었다 (느린 기계일수록 심했다).
        const near = Math.max(P.TAP_STOP, P.SPEED * dt);
        let atX = false, atY = false;
        if (Math.abs(ax) <= near) { run.x += ax; dx = 0; atX = true; }
        else dx = ax / Math.abs(ax);
        if (Math.abs(ay) <= near) { run.y += ay; dy = 0; atY = true; }
        else dy = ay / Math.abs(ay);
        if (onSeg && atX && atY) {
            run.tx = null; run.ty = null; run.tseg = null; run.vx = run.vy = 0;
        }
    }

    // 대각선이 더 빠르지 않게 1 로 자른다. 1 보다 작은 것은 그대로 둔다
    // — 자판은 늘 1 이고, 조이스틱만 그 사이 값이 온다.
    let mag = Math.hypot(dx, dy);
    if (mag > 1) { dx /= mag; dy /= mag; mag = 1; }

    // ★ 짚어 간 자리가 **다른 선**이면, 길목에 닿아 멈춰 서도 한 번 더
    //   segStep 을 돌려 갈아타게 한다.
    //   ✗ 안 그러면 길목에서 dx·dy 가 0 이 되어 moving 이 꺼지고, 갈아타지
    //     못한 채 그 자리에 굳었다 (계단을 짚으면 계단 앞에서 멈췄다).
    const wantSeg = (run.tx != null && run.tseg != null && run.tseg !== run.seg);
    const moving = mag > 0.001;
    if (moving || wantSeg) {
        run.x += dx * P.SPEED * dt;
        // ★ 바닥 띠 위에서는 **세로로도 걷는다** (돌바닥을 앞뒤로 밟는다).
        //   계단은 선이라 세로로 안 민다 — 세로 입력은 갈아타는 데에만 쓴다.
        if (segBand(r, run.seg)) run.y += dy * P.SPEED * dt;

        // ─ 넘어간 직후에는 쉬어 간다 (두 방을 끝없이 오가지 않게)
        if (!cageMine() && now() - (run.warp || 0) > P.WARP_MS) {
            if (r.left && run.x <= P.EDGE) { goRoom(r.left, 'left'); return; }
            if (r.right && run.x >= r.w - P.EDGE) { goRoom(r.right, 'right'); return; }
        }
        // ★ 건물 안팎(재관국앞↔재관국 · 백일몽앞↔백일몽)은 **걸어서 안 넘어간다.**
        //   입구를 눌러야 들어가고 나간다 (ROOMS 의 go 입구). 전에는 바닥 띠
        //   위아래 끝에 닿기만 해도 넘어가서, 길을 걷다 실수로 빨려 들어갔다.

        // ─ 선 위로 — 갈아타기 · x 자르기 · y 얹기
        let vdir = (dy > 0.35) ? 1 : (dy < -0.35 ? -1 : 0);
        if (run.tx != null && run.tseg != null && run.tseg !== run.seg) {
            vdir = (segDeep(run.tseg) > segDeep(run.seg)) ? 1 : -1;
        }
        segStep(r, vdir);
        // 거의 위아래로만 밀었을 때 좌우가 깜빡이지 않게 턱을 조금 둔다
        if (dx < -0.08) run.me.actor.face(1);
        else if (dx > 0.08) run.me.actor.face(-1);
    }
    cageHold(r);                            // 🔒 갇혔으면 가두리 안쪽으로
    run.me.actor.moving(moving);
    putOne(run.me, run.x, run.y);
    camera();
    send(moving);

    let busy = moving || wantSeg || run.tx != null;
    // ─ 남 — 받은 자리로 미끄러져 간다
    // ★ 화면 밖에 있는 사람은 **안 그린다** (display:none · 걸음 시계도 멈춤).
    //   방은 화면보다 두 배 넘게 넓어서, 사람 절반은 대개 화면 밖이다.
    //   자리는 계속 따라가 두었다가 화면에 들어오는 순간 그 자리에 세운다.
    const zv = zz(), vbx = viewBox(), vwid = vbx.w || 0;
    const seeL = run.cx - 140, seeR = run.cx + vwid + 140;
    Object.keys(run.peers).forEach(function (code) {
        const q = run.peers[code];
        const ax = q.tx - q.x, ay = q.ty - q.y;
        const d = Math.hypot(ax, ay);
        if (d > 1) {
            busy = true;
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
        const sxp = q.x * zv;
        const vis = !vwid || (sxp + q.one.w / 2 >= seeL && sxp - q.one.w / 2 <= seeR);
        if (vis === !!q.hid) {
            q.hid = !vis;
            q.one.wrap.style.display = vis ? '' : 'none';
            q.one.actor.hold(!vis);
        }
        if (vis) putOne(q.one, q.x, q.y);
        if (q.sayAt && now() - q.sayAt > P.SAY_MS) { bubble(q.one, ''); q.sayAt = 0; }
    });

    if (run.sayAt && now() - run.sayAt > P.SAY_MS) { bubble(run.me, ''); run.sayAt = 0; }

    // ★ 아무것도 안 움직이면 **쉰다** (배터리).
    //   전에는 서 있기만 해도 1초에 60번 이 고리를 돌렸다. 이제 나도 남도
    //   안 움직이고 카메라도 멈췄으면 0.25초에 한 번만 깨어 본다 — 말풍선을
    //   거두고, 서 있다는 것을 알리는(BEAT_MS) 일은 그것으로 넉넉하다.
    //   손을 대거나(누름 · 자판) 남이 움직이기 시작하면 wake() 가 바로 깨운다.
    if (busy || run.camBusy) {
        run.idle = false;
        run.raf = requestAnimationFrame(tick);
    } else {
        run.idle = true;
        run.idleT = setTimeout(function () {
            if (!run) return;
            run.idleT = 0;
            run.raf = requestAnimationFrame(tick);
        }, P.IDLE_MS);
    }
}

// 쉬고 있으면 바로 깨운다 — 손짓 · 남의 움직임 · 말
function wake() {
    if (!run || !run.idle) return;
    run.idle = false;
    if (run.idleT) { clearTimeout(run.idleT); run.idleT = 0; }
    try { cancelAnimationFrame(run.raf); } catch (e) { }
    run.last = performance.now();
    run.raf = requestAnimationFrame(tick);
}

// 카메라 — **좌우로만** 민다.
//
//   세로는 zoomOf 가 창에 꼭 맞춰 두었으므로 움직일 일이 없다. 전에는
//   사람을 세로로도 따라가서, 길에서 지하로 내려설 때 화면이 쑥 내려갔다.
function camera(snap) {
    const r = roomOf(), z = zz();
    const rw = r.w * z, rh = r.h * z;
    const vb = viewBox();
    const vw = vb.w || rw;
    const vh = vb.h || rh;
    // 방이 창보다 좁으면 **가운데로** 둔다 (왼쪽에 붙이면 한쪽만 검다)
    let cx = -(vw - rw) / 2;
    if (rw > vw) cx = Math.max(0, Math.min(rw - vw, run.x * z - vw / 2));
    if (snap) run.cx = cx;
    else      run.cx += (cx - run.cx) * 0.18;   // 조금 늦게 따라와 부드럽다
    run.camBusy = Math.abs(cx - run.cx) > 0.5;  // 아직 따라가는 중이면 쉬지 않는다
    // ★ 세로는 **맨 위에 붙여** 둔다. 아래로 넘치는 몫(빼 둔 벽)은 창 밖으로
    //   나가고, 그만큼 그림이 내려와 앉는다. 걸어도 세로는 안 움직인다.
    run.cy = 0;
    // ★ 같은 값이면 안 적는다 — 적기만 해도 브라우저가 매번 다시 잰다
    const L = (-Math.round(run.cx)) + 'px', T = (-Math.round(run.cy)) + 'px';
    if (run._camL !== L || run.el.style.left !== L) { run.el.style.left = L; run._camL = L; }
    if (run._camT !== T || run.el.style.top !== T) { run.el.style.top = T; run._camT = T; }
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
    const beat = t - run.sent > P.BEAT_MS;           // 가만히 있어도 살아 있다고 알린다
    if (!stopping && !beat && (!changed || t - run.sent < P.SEND_MS)) return;
    run.sent = t;
    run.sx = run.x; run.sy = run.y;
    run.sMoving = moving; run.sFace = run.me.actor.facing();
    run.sSayAt = run.sayAt;
    const u = u_(); if (!u) return;
    try {
        run.ref.child(u.code).set({
            n: nameOf(u), x: Math.round(run.x), y: Math.round(run.y),
            f: run.sFace, m: moving ? 1 : 0, d: (u.dot || null),
            s: run.say || null, st: run.sayAt || 0, b: sbMine() || null, at: t,
            j: run.joinAt || t                     // 이 방에 들어온 때 — 넘치면 늦게 온 쪽이 옮긴다
        });
    } catch (e) { }
}

// ==========================================
// ★ 방 나누기 — 한 장소에 CAP(10)명까지
// ==========================================
//
//   같은 장소(광장 · 카지노 거리 …)라도 방이 여럿일 수 있다.
//       plazaRoom/plaza       1번 방   ← 예전 자리 그대로 (옛 판도 여기로 온다)
//       plazaRoom/plaza~2     2번 방
//       plazaRoom/plaza~3     3번 방 …
//   맵 채팅도 같은 꼴로 나뉜다 (plazaChat/plaza~2). 서버 채팅은 하나다.
//
//   ■ 들어갈 방 고르기
//     장소에 들어설 때 서버의 자리 표를 **한 번** 읽어(census) 방마다 몇 명인지
//     센다. 있던 방 번호에 자리가 있으면 그대로, 없으면 빈자리가 있는 가장
//     앞 번호로 간다. 고르기 전에는 자리를 적지 않는다.
//
//   ■ 동시에 들어와 넘쳤을 때
//     둘이 같은 때 마지막 한 자리를 보고 들어오면 열하나가 된다. 그때는
//     **늦게 들어온 쪽**(j — 방에 든 때)이 다음 방으로 옮긴다 (overCheck).
function seatKey(room, inst) { return (inst > 1) ? room + '~' + inst : room; }
function keyRoom(k) { const i = String(k).indexOf('~'); return i < 0 ? k : k.slice(0, i); }
function keyInst(k) { const i = String(k).indexOf('~'); return i < 0 ? 1 : (parseInt(k.slice(i + 1), 10) || 1); }
function liveSeat(v) { return !!(v && v.at && now() - v.at <= P.STALE_MS); }

// 서버에 앉은 자리를 한 번 읽는다 → { 장소: { 방번호: { 사번: 자리 } } }
function census() {
    const d = db_();
    if (!d) return Promise.resolve({});
    return d.ref(P.PATH).once('value').then(function (s) {
        const all = s.val() || {}, out = {};
        Object.keys(all).forEach(function (k) {
            const room = keyRoom(k), inst = keyInst(k);
            if (!R[room]) return;
            const seats = all[k] || {};
            Object.keys(seats).forEach(function (c) {
                if (!liveSeat(seats[c])) return;
                if (hidPeer(c)) return;                 // 상담사 — 선염 말고는 명단 · 인원에서 뺀다
                const a = out[room] = out[room] || {};
                (a[inst] = a[inst] || {})[c] = seats[c];
            });
        });
        return out;
    }).catch(function () { return {}; });
}
function headcount(cs, room, inst, skip) {
    const m = (cs[room] || {})[inst] || {};
    return Object.keys(m).filter(function (c) { return c !== skip; }).length;
}
// ★ 방이 몇 개까지인가 — 포토존은 둘(max). 다 차면 0 (못 든다).
function pickInst(cs, room, want, skip) {
    const max = (R[room] && R[room].max) || 500;
    if (want && want <= max && headcount(cs, room, want, skip) < P.CAP) return want;
    for (let i = 1; i <= max; i++) if (headcount(cs, room, i, skip) < P.CAP) return i;
    return (R[room] && R[room].max) ? 0 : 1;
}

// 장소에 들어선 뒤 — 방을 골라 듣기 시작한다
function joinInst(want, force) {
    if (!run) return;
    const tok = run.joinTok = (run.joinTok || 0) + 1;
    const room = run.room, u = u_();
    census().then(function (cs) {
        if (!run || run.joinTok !== tok || run.room !== room) return;   // 그 사이 또 옮겼다
        const inst = force ? want : pickInst(cs, room, want, u && u.code);
        if (!inst) {                                                     // 포토존 두 방이 다 찼다
            sysLine(R[room].n + ' — 두 방이 다 찼습니다. (한 방에 ' + P.CAP + '명)');
            goRoom(P.START, null);
            return;
        }
        enterInst(inst);
    });
}
function enterInst(inst) {
    if (!run) return;
    run.inst = inst;
    run.joinAt = now();
    watchRoom();
    watchChat();
    run.sx = run.sy = -9999; run.sent = 0;          // 곧바로 내 자리를 알린다
    paintMap();
    if (inst > 1) sysLine(roomOf().n + ' ' + inst + '번 방입니다. (한 방에 ' + P.CAP + '명까지)');
}
// 같은 장소 안에서 방만 바꾼다 (서 있던 자리는 그대로)
function hopInst(inst) {
    if (!run || inst === run.inst) return;
    leaveRoom();
    Object.keys(run.peers).forEach(dropPeer);
    showWho();
    run.joinTok = (run.joinTok || 0) + 1;            // 고르던 것이 있으면 버린다
    enterInst(inst);
}

// 넘쳤나 — 사람이 새로 보일 때 조금 기다렸다가 한 번 본다
let overT = 0;
function overSoon() {
    if (overT) return;
    overT = setTimeout(function () { overT = 0; overCheck(); }, 1500);
}
function overCheck() {
    const u = u_();
    if (!run || !run.ref || !u) return;
    const codes = Object.keys(run.peers).filter(function (c) {
        const q = run.peers[c]; return q && q.at && now() - q.at <= P.STALE_MS;
    });
    if (codes.length < P.CAP) return;
    const order = codes.map(function (c) { return { c: c, j: run.peers[c].j || 0 }; })
        .concat([{ c: u.code, j: run.joinAt || 0 }])
        .sort(function (a, b) { return (a.j - b.j) || (a.c < b.c ? -1 : 1); });
    const rank = order.map(function (o) { return o.c; }).indexOf(u.code);
    if (rank < P.CAP) return;                         // 먼저 온 열 명 안이다
    if ((run.hops || 0) >= 3) return;                 // 이리저리 튀지 않게
    run.hops = (run.hops || 0) + 1;
    const room = run.room;
    census().then(function (cs) {
        if (!run || run.room !== room) return;
        const inst = pickInst(cs, room, null, u.code);
        if (!inst || inst === run.inst) return;                          // 포토존 — 옮길 방이 없다
        hopInst(inst);
        sysLine('방이 가득 차 ' + inst + '번 방으로 옮겼습니다.');
    });
}

// ==========================================
// ★ 동료 목록 — 누가 어디 있나, 누르면 그리로 간다
// ==========================================
//
//   방이 나뉘면 같이 있고 싶은 사람과 갈라질 수 있다. 목록(☰)의 「동료 목록」
//   에서 지금 광장에 있는 사원과 그 장소 · 방 번호를 보여 주고, 누르면
//   **같은 장소 · 같은 방**으로 가서 그 사람 곁에 선다. 그 방이 가득 찼으면
//   못 간다고 알린다.
function matesSheet() {
    const s = sheet('mates', '동료 목록', '<div class="plaza-mates"><div class="mt-empty">불러오는 중…</div></div>');
    if (!s) return;
    const u = u_();
    census().then(function (cs) {
        if (!sheetOpen('mates') || !run) return;
        const box = s.querySelector('.plaza-mates');
        if (!box) return;
        const rows = [];
        Object.keys(cs).forEach(function (room) {
            Object.keys(cs[room]).forEach(function (ik) {
                const inst = Number(ik), seats = cs[room][ik];
                const n = Object.keys(seats).length;
                Object.keys(seats).forEach(function (c) {
                    if (u && c === u.code) return;
                    if (c === P.ADMIN && !isAdm(u)) return;     // 상담사에게는 같이 가기 없음 (선염도)
                    const v = seats[c] || {};
                    rows.push({ c: c, name: v.n || c, room: room, inst: inst, n: n, x: v.x, y: v.y });
                });
            });
        });
        if (!rows.length) {
            box.innerHTML = '<div class="mt-empty">지금 광장에 나와 있는 동료가 없습니다.</div>';
            return;
        }
        // 같은 방 → 같은 장소 → 나머지, 그 안에서는 이름 순
        const rank = function (r) { return (r.room === run.room ? (r.inst === run.inst ? 0 : 1) : 2); };
        rows.sort(function (a, b) { return (rank(a) - rank(b)) || String(a.name).localeCompare(String(b.name), 'ko'); });
        box.innerHTML = '<div class="mt-head">지금 나와 있는 동료 ' + rows.length + '명 · 한 방에 ' + P.CAP + '명까지</div>'
            + rows.map(function (r, i) {
                const here = (r.room === run.room && r.inst === run.inst);
                const full = !here && r.n >= P.CAP;
                const t = here ? '같은 방' : (full ? '가득 참' : '같은 장소로');
                return '<div class="mt-row">'
                    + '<div class="mt-who"><b>' + esc(r.name) + '</b>'
                    + '<span>' + esc(R[r.room].n) + ' · ' + r.inst + '번 방 <i>' + r.n + '/' + P.CAP + '</i></span></div>'
                    + '<button data-i="' + i + '"' + ((here || full) ? ' disabled' : '') + '>' + t + '</button></div>';
            }).join('');
        Array.prototype.forEach.call(box.querySelectorAll('button[data-i]'), function (b) {
            b.onclick = function () { goMate(rows[Number(b.dataset.i)]); };
        });
    });
}

function goMate(r) {
    const u = u_();
    if (!run || !r || !R[r.room]) return;
    if (r.c === P.ADMIN && !isAdm(u)) { closeSheet(); return; }          // 상담사에게는 같이 가기 없음
    if (cageMine()) { closeSheet(); sysLine('🔒 가두리에 갇혀 있어 다른 곳으로 갈 수 없습니다.'); return; }
    closeSheet();
    census().then(function (cs) {
        if (!run) return;
        // 그 사이 옮겼을 수 있다 — 지금 자리를 다시 찾는다
        let room = r.room, inst = r.inst, at = null;
        Object.keys(cs).forEach(function (rm) {
            Object.keys(cs[rm]).forEach(function (ik) {
                if (cs[rm][ik][r.c]) { room = rm; inst = Number(ik); at = cs[rm][ik][r.c]; }
            });
        });
        if (!at) { sysLine(r.name + ' 님이 지금은 광장에 없습니다.'); return; }
        if (room === run.room && inst === run.inst) { sysLine(r.name + ' 님과 이미 같은 방입니다.'); return; }
        if (headcount(cs, room, inst, u && u.code) >= P.CAP) {
            sysLine(R[room].n + ' ' + inst + '번 방이 가득 찼습니다. (' + P.CAP + '명)');
            return;
        }
        const rr = R[room];
        if (room !== run.room) {
            const lv = (rr.floor2 && at.y > (rr.floor[1] + rr.floor2[0]) / 2) ? 1 : 0;
            run.forceInst = inst;
            goRoom(room, null, lv);
        } else {
            hopInst(inst);
        }
        // 그 사람 곁에 선다
        if (typeof at.x === 'number' && typeof at.y === 'number') {
            run.x = Math.max(P.EDGE + P.INSET, Math.min(rr.w - P.EDGE - P.INSET, at.x + 60));
            run.y = at.y;
            try { segStep(rr, 0); } catch (e) { }
            putOne(run.me, run.x, run.y);
            camera(true);
        }
        sysLine(r.name + ' 님이 있는 ' + rr.n + ' ' + inst + '번 방으로 왔습니다.');
    });
}

// ==========================================
// ★ 📸 포토존 — 장소 목록 → 1번 · 2번 방 → 그 방으로
// ==========================================
//
//   목록(☰) 「포토존」을 누르면 장소 일곱이 그림과 함께 뜬다 (방마다 몇 명).
//   하나를 누르면 그 장소의 **1번 방 · 2번 방**이 뜨고, 방마다 지금 안에 있는
//   사람 이름이 붙는다. 「들어가기」를 누르면 그 장소 그 번호 방으로 바로 든다.
//   한 방에 CAP 명 — 가득 찬 방은 못 누른다.
//
//   창을 열어 둔 동안 4초마다 다시 센다 (드나드는 사람이 보이게). 바뀐 것이
//   없으면 다시 적지 않는다 — 누르려는 순간 칸이 갈리지 않게.
let pzIv = 0;
function pzZones() { return (P.PHOTO || []).filter(function (k) { return R[k] && R[k].photo; }); }
function pzSeats(cs, zone, inst) {
    const m = (cs[zone] || {})[inst] || {};
    return Object.keys(m).map(function (c) { return { c: c, n: (m[c] && m[c].n) || c }; })
        .sort(function (a, b) { return String(a.n).localeCompare(String(b.n), 'ko'); });
}
function pzListHtml(cs) {
    return '<div class="pz-head">장소를 고르면 1번 · 2번 방이 뜹니다 · 한 방에 ' + P.CAP + '명까지</div>'
        + pzZones().map(function (k) {
            const r = R[k];
            const a = pzSeats(cs, k, 1).length, b = pzSeats(cs, k, 2).length;
            const cnt = function (n) { return n ? '<em>' + n + '명</em>' : '0명'; };
            return '<button class="pz-zone' + (run && run.room === k ? ' on' : '') + '" data-z="' + k + '">'
                + '<span class="pz-th" style="background-image:url(\'' + P.DIR + r.thumb + '\')"></span>'
                + '<span class="pz-zn"><b>' + esc(r.pn) + '</b>'
                + '<i>1번 방 ' + cnt(a) + ' · 2번 방 ' + cnt(b) + (run && run.room === k ? ' · 지금 ' + run.inst + '번 방' : '') + '</i></span>'
                + '</button>';
        }).join('');
}
function pzRoomsHtml(cs, zone) {
    const r = R[zone], u = u_();
    let html = '<button class="pz-back">‹ 포토존 목록</button>'
        + '<div class="pz-pic" style="background-image:url(\'' + P.DIR + r.thumb + '\')"></div>';
    for (let i = 1; i <= (r.max || 2); i++) {
        const who = pzSeats(cs, zone, i);
        const here = !!(run && run.room === zone && run.inst === i);
        if (here && u && !who.some(function (w) { return w.c === u.code; })) who.unshift({ c: u.code, n: nameOf(u) });
        const full = !here && who.length >= P.CAP;
        html += '<div class="pz-room' + (here ? ' on' : '') + '">'
            + '<div class="pz-rh"><b>' + i + '번 방</b><i>' + who.length + ' / ' + P.CAP + '</i>'
            + '<button data-i="' + i + '"' + ((here || full) ? ' disabled' : '') + '>'
            + (here ? '지금 여기' : (full ? '가득 참' : '들어가기')) + '</button></div>'
            + (who.length
                ? '<div class="pz-who">' + who.map(function (w) {
                    return '<span' + (u && w.c === u.code ? ' class="me"' : '') + '>' + esc(w.n) + '</span>';
                }).join('') + '</div>'
                : '<div class="pz-none">비어 있습니다</div>')
            + '</div>';
    }
    return html;
}
function photoSheet(zone) {
    if (pzIv) { clearInterval(pzIv); pzIv = 0; }
    const z = (zone && R[zone] && R[zone].photo) ? zone : null;
    const s = sheet('photo', z ? '📸 ' + R[z].pn : '📸 포토존',
        '<div class="plaza-pz"><div class="mt-empty">불러오는 중…</div></div>');
    if (!s) return;
    let last = '';
    const paint = function () {
        if (!s.isConnected || !run) { if (pzIv) { clearInterval(pzIv); pzIv = 0; } return; }
        census().then(function (cs) {
            if (!s.isConnected || !run) return;
            const box = s.querySelector('.plaza-pz');
            if (!box) return;
            const html = z ? pzRoomsHtml(cs, z) : pzListHtml(cs);
            if (html === last) return;
            last = html;
            box.innerHTML = html;
            Array.prototype.forEach.call(box.querySelectorAll('.pz-zone'), function (b) {
                b.onclick = function () { photoSheet(b.dataset.z); };
            });
            const back = box.querySelector('.pz-back');
            if (back) back.onclick = function () { photoSheet(); };
            Array.prototype.forEach.call(box.querySelectorAll('.pz-rh button[data-i]'), function (b) {
                b.onclick = function () { goPhoto(z, Number(b.dataset.i)); };
            });
        });
    };
    paint();
    pzIv = setInterval(paint, 4000);
}
function goPhoto(zone, inst) {
    const u = u_();
    if (!run || !R[zone]) return;
    if (cageMine()) { closeSheet(); sysLine('🔒 가두리에 갇혀 있어 다른 곳으로 갈 수 없습니다.'); return; }
    census().then(function (cs) {
        if (!run) return;
        if (zone === run.room && inst === run.inst) { closeSheet(); return; }
        if (headcount(cs, zone, inst, u && u.code) >= P.CAP) {
            sysLine(R[zone].n + ' ' + inst + '번 방이 가득 찼습니다. (' + P.CAP + '명)');
            photoSheet(zone);
            return;
        }
        closeSheet();
        if (zone !== run.room) { run.forceInst = inst; goRoom(zone, null, 0); }
        else { hopInst(inst); sysLine(R[zone].n + ' ' + inst + '번 방으로 옮겼습니다.'); }
    });
}
window.plazaPhoto = function (zone) { if (run) photoSheet(zone); };

// ==========================================
// 같은 방 사람
// ==========================================
// ==========================================
// ★ 같은 방 사람 — **한 사람씩** 듣는다
// ==========================================
//
//   ✗ 전에는 방 전체에 on('value') 하나를 걸었다. 그러면 **누가 한 발
//     움직일 때마다** 방에 있는 사람을 전부 다시 훑는다. 스물다섯 명이
//     0.25초마다 자리를 적으면 1초에 백 번 × 스물다섯 사람 = 2,500 번이다.
//     재 봤다 — 스물다섯 명이 가만히 서 있을 때는 한 틀에 20ms 인데,
//     움직이기 시작하면 **444ms** 로 치솟았다 (그리는 값은 그대로였다.
//     버거운 것은 그리기가 아니라 **받아서 추리는 쪽**이었다).
//
//   이제 child_added · child_changed · child_removed 로 듣는다.
//   한 번에 한 사람만 본다 — 백 번이면 백 사람 몫이다 (2,500 → 100).
//
//   사람이 드나들 때만 showWho 를 다시 적는다. 걸음마다 적으면 그것만으로
//   한 틀이 밀린다 (innerText 는 자리를 다시 재게 만든다).
function watchRoom() {
    const d = db_(), u = u_();
    if (!d || !u) return;
    offRoom();
    run.ref = d.ref(P.PATH + '/' + seatKey(run.room, run.inst));
    run.onAdd = function (s) { onSeat(s.key, s.val(), true); };
    run.onChg = function (s) { onSeat(s.key, s.val(), false); };
    run.onDel = function (s) {
        if (run.hidden) delete run.hidden[s.key];
        if (run.peers[s.key]) { dropPeer(s.key); showWho(); }
    };
    run.hidden = {};                       // 안 그리지만 방에 있는 사람 (상담사) — 나갈 때 말을 지울지 볼 때 센다
    run.ref.on('child_added', run.onAdd);
    run.ref.on('child_changed', run.onChg);
    run.ref.on('child_removed', run.onDel);
    try { run.ref.child(u.code).onDisconnect().remove(); } catch (e) { }

    // 들어와 보니 아무도 없으면, 전에 누가 남기고 간 말을 치운다.
    //   (전에는 첫 value 가 이 일을 했다 — 이제 한 번만 따로 묻는다)
    if (!run._swept) {
        run._swept = true;
        const room = run.room, ckey = seatKey(run.room, run.inst);
        run.ref.once('value').then(function (s) {
            if (!run || run.room !== room || seatKey(run.room, run.inst) !== ckey) return;
            const all = s.val() || {};
            const other = Object.keys(all).filter(function (c) {
                const v = all[c] || {};
                return c !== u.code && v.at && now() - v.at <= P.STALE_MS;
            });
            if (other.length) return;
            try { d.ref(P.CHAT + '/' + ckey).remove(); } catch (e) { }
        }).catch(function () { });
    }
}

function offRoom() {
    if (!run || !run.ref) return;
    try { run.ref.off('child_added', run.onAdd); } catch (e) { }
    try { run.ref.off('child_changed', run.onChg); } catch (e) { }
    try { run.ref.off('child_removed', run.onDel); } catch (e) { }
    try { run.ref.off('value', run.onRoom); } catch (e) { }   // 묵은 판에서 넘어올 때
    run.onAdd = run.onChg = run.onDel = run.onRoom = null;
}

// 한 사람의 자리 한 줄
function onSeat(code, v, fresh) {
    if (!run || !code) return;
    const u = u_();
    if (!u || code === u.code) return;
    v = v || {};
    if (hidPeer(code)) {                   // 상담사 — 선염 말고는 안 그린다 (말풍선도 여기서 같이 막힌다)
        if (run.peers[code]) { dropPeer(code); showWho(); }
        run.hidden = run.hidden || {};
        run.hidden[code] = v.at || 0;
        return;
    }
    if (!v.at || now() - v.at > P.STALE_MS) { if (run.peers[code]) { dropPeer(code); showWho(); } return; }

    let q = run.peers[code];
    const key = JSON.stringify(v.d || {});
    if (q && q.key !== key) { dropPeer(code); q = null; }     // 옷이 바뀌었다 — 다시 만든다
    const isNew = !q;
    if (!q) {
        const one = makeOne({ code: code, dot: v.d || {} }, v.n || code, run.k, true);
        run.el.appendChild(one.wrap);
        q = run.peers[code] = { one: one, key: key, x: v.x, y: v.y, tx: v.x, ty: v.y,
                                face: v.f || 1, moving: !!v.m, seen: now(), sayAt: 0 };
        one.actor.face(v.f || 1);
        putOne(one, q.x, q.y);
    }
    if (q.tx !== v.x || q.ty !== v.y || q.moving !== !!v.m) q.seen = now();
    q.tx = v.x; q.ty = v.y; q.face = v.f || 1; q.moving = !!v.m;
    q.at = v.at;
    q.j = v.j || 0;                        // 옛 판(j 없음)은 먼저 온 사람으로 친다
    wake();                                // 쉬고 있었으면 바로 따라 그린다
    setTag(q.one, code, v.n || code);
    // 말풍선 — 아직 안 보여 준 말이고 너무 묵지 않았으면 띄운다
    if (v.st && v.st !== q.sayAt && now() - v.st < P.SAY_MS) {
        q.sayAt = v.st;
        // ★ 말풍선 빛깔은 **그 사람이 쓸 수 있는지 받는 쪽에서도 본다.**
        //   b 칸은 보내는 사람이 적는 값이라, 손으로 적어 보낼 수 있다.
        bubble(q.one, v.s || '', sbOkOf(code, v.b || '') ? (v.b || '') : '');
    }
    if (isNew) { showWho(); overSoon(); }
}

// ★ 끊긴 사람 걷기 — child_removed 가 안 오는 때가 있다 (창을 그냥 닫거나
//   끊기면 onDisconnect 가 늦다). 느리게 한 번씩만 훑는다.
function sweepPeers() {
    if (!run || !run.peers) return;
    const t = now();
    let gone = 0;
    Object.keys(run.peers).forEach(function (c) {
        const q = run.peers[c];
        if (!q) return;
        if (q.at && t - q.at > P.STALE_MS) { dropPeer(c); gone++; }
    });
    if (gone) showWho();
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
        const hid = Object.keys(run.hidden || {}).some(function (c) {
            const at = run.hidden[c]; return at && now() - at <= P.STALE_MS;
        });
        if (!Object.keys(run.peers || {}).length && !hid) {
            const d = db_();
            if (d) d.ref(P.CHAT + '/' + seatKey(run.room, run.inst)).remove();
        }
    } catch (e) { }
    try { run.ref.child(u.code).onDisconnect().cancel(); } catch (e) { }
    try { run.ref.child(u.code).remove(); } catch (e) { }
    offRoom();
    run.ref = null;
}

function showWho() {
    const el = document.getElementById('plaza-who'); if (!el || !run) return;
    const ns = Object.keys(run.peers).map(function (c) { return run.peers[c].one.name || c; });
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
    // ✗ 글줄칸을 비우지 않는다 — 방을 옮겨도 하던 얘기는 그대로 둔다.
    //   (전에는 여기서 innerHTML 을 털고 새 방 줄로 다시 채웠다)
    chatRef = d.ref(P.CHAT + '/' + seatKey(run.room, run.inst)).limitToLast(P.CHAT_KEEP);
    chatRef.on('child_added', function (s) {
        const v = s.val() || {};
        if (!v.t) return;
        if (hidPeer(v.c)) return;          // 상담사의 맵 채팅 — 선염 말고는 안 보인다
        addLine(v.n || '?', v.t, v.c, s.key);
    });
    paintLog();
}

// ★ 서버 채팅 — 방과 상관없이 **광장에 있는 내내** 한 번만 건다.
//   watchChat() 은 방을 옮길 때마다 도는데, 여기까지 거기에 넣으면
//   방을 옮길 때마다 지난 서른 줄이 다시 쏟아진다. (공지와 같은 까닭)
function watchAll() {
    const d = db_(); if (!d || !run) return;
    if (allRef) { try { allRef.off(); } catch (e) { } allRef = null; }
    allFrom = now() + 1500;        // 걸자마자 오는 지난 줄은 조용히 받는다
    allRef = d.ref(P.CHAT + '/' + P.ALL).limitToLast(P.CHAT_KEEP);
    allRef.on('child_added', function (s) {
        const v = s.val() || {};
        if (!v.t) return;
        pushLine({ n: v.n || '?', t: v.t, c: v.c, sv: 1, k: s.key, quiet: now() < allFrom });
    });
}

// 서버 채팅은 아무도 안 지워 주므로 가끔 묵은 줄을 걷어 낸다.
//   (맵 채팅은 마지막 사람이 나갈 때 통째로 지워진다 — leaveRoom)
function trimAll() {
    const d = db_(); if (!d) return;
    if (Math.random() > 0.25) return;            // 다섯 번에 한 번쯤만
    try {
        d.ref(P.CHAT + '/' + P.ALL).once('value', function (s) {
            const v = s.val(); if (!v) return;
            const keys = Object.keys(v).sort();   // push 열쇠는 때 순서대로 선다
            const over = keys.length - P.CHAT_KEEP * 2;
            if (over <= 0) return;
            const up = {};
            keys.slice(0, over).forEach(function (k) { up[k] = null; });
            d.ref(P.CHAT + '/' + P.ALL).update(up);
        });
    } catch (e) { }
}

// ── 서버/맵/귓속말 고르기
function chSet(c) {
    chatCh = (c === 'all') ? 'all' : (c === 'wh' ? 'wh' : 'map');
    // 귓속말은 기억해 두지 않는다 — 다음에 들어왔을 때 엉뚱한 사람에게 간다
    try { localStorage.setItem(CH_KEY, chatCh === 'wh' ? 'map' : chatCh); } catch (e) { }
    chPaint();
    if (chatCh === 'wh' && !whTo) whoPick();
}
function chPaint() {
    const box = document.getElementById('plaza-ch');
    if (box) Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        b.classList.toggle('on', b.dataset.c === chatCh);
    });
    const who = document.getElementById('plaza-whto');
    if (who) {
        who.style.display = (chatCh === 'wh') ? '' : 'none';
        who.innerHTML = whTo
            ? '<b>' + esc(whName || whTo) + '</b> 사원에게만 <i>바꾸기</i>'
            : '<i>누구에게 할지 고르세요</i>';
    }
    const ph = chatCh === 'all' ? '서버 — 모든 사원에게 들립니다'
        : chatCh === 'wh' ? ('귓속말 — ' + (whTo ? (whName || whTo) + ' 사원만 듣습니다' : '대상을 고르세요'))
        : '맵 — 이 방에 있는 사람에게만';
    ['plaza-in', 'plaza-in2'].forEach(function (id) {
        const e = document.getElementById(id);
        if (e) e.placeholder = ph;
    });
}
window.plazaChat = function (c) { if (c) chSet(c); return chatCh; };
// 🖍 반짝 크레용 — 색을 바꾸면 이름표 · 글줄을 그 자리에서 다시 그린다 (crayon.js)
window.plazaRepaintChat = function () { try { refreshTags(); paintLog(); paintFeed(); } catch (e) { } };

// ── 귓속말 상대 고르기 — 지금 광장에 있는 사람을 늘어놓는다
// ★ 지금 접속해 있나 — 바탕 화면이 늘 들고 있는 접속자 표를 본다.
//   (index.html 의 onlineUsersMap — 서버 presence 에서 내려온다)
function onAir(code) {
    try {
        return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[code]);
    } catch (e) { return false; }
}

// ★ 귓속말 상대 고르기 — **사원 명부 전체**에서 고른다.
//
//   ✗ 전에는 지금 광장에 서 있는 사람만 보여 줬다. 그래서 자리를 비운
//     사원에게는 아예 보낼 수가 없었다. 귓속말은 쌓이는 자리
//     (plazaWhisper/<사번>)라 **없는 동안 보내 두면 돌아와서 받는다** —
//     굳이 막을 까닭이 없었다.
//
//   이름 뒤에 (접속) · (부재) 를 적고, 접속한 사람을 위로 세운다.
function whoPick() {
    const u = u_();
    if (!u) return;
    const book = (typeof db !== 'undefined' && db && db.users) ? db.users : {};
    const rows = [];
    Object.keys(book).forEach(function (c) {
        const x = book[c] || {};
        if (c === u.code) return;
        if (!x.code || !x.name) return;          // 껍데기 (guard.js 가 보는 것과 같은 잣대)
        if (x.name === '기본사원') return;
        rows.push({ c: c, n: x.name, on: onAir(c) });
    });
    // 접속한 사람 먼저, 그 안에서 가나다 순
    rows.sort(function (a, b2) {
        if (a.on !== b2.on) return a.on ? -1 : 1;
        return a.n < b2.n ? -1 : 1;
    });
    const body = rows.length
        ? '<div id="plaza-whlist">' + rows.map(function (x) {
            return '<button data-c="' + esc(x.c) + '" data-n="' + esc(x.n) + '">'
                + '<b>' + esc(x.n) + '</b>'
                + '<i class="' + (x.on ? 'on' : 'off') + '">(' + (x.on ? '접속' : '부재') + ')</i>'
                + '</button>';
        }).join('') + '</div>'
        : '<div class="plaza-none">명부에 다른 사원이 없습니다.</div>';
    const sh = sheet('whis', '🤫 귓속말 — 누구에게', body);
    if (!sh) return;
    Array.prototype.forEach.call(sh.querySelectorAll('#plaza-whlist button'), function (b) {
        b.onclick = function () {
            whTo = b.dataset.c; whName = b.dataset.n;
            chatCh = 'wh';
            closeSheet();
            chPaint();
            sysLine(whName + ' 사원에게 귓속말합니다. 그 사원에게만 들립니다.'
                + (onAir(whTo) ? '' : ' (지금은 부재중 — 돌아오면 받습니다)'));
        };
    });
}
window.plazaWhisperTo = function (code, name) {
    whTo = String(code || ''); whName = String(name || code || '');
    chatCh = 'wh'; chPaint();
};

// ── 나에게 온 귓속말을 듣는다 (광장에 있는 내내 한 번만 건다)
function watchWhisper() {
    const d = db_(), u = u_();
    if (!d || !u || !run) return;
    if (whRef) { try { whRef.off(); } catch (e) { } whRef = null; }
    whFrom = now() + 1500;              // 걸자마자 오는 묵은 줄은 조용히 받는다
    whRef = d.ref(WH + '/' + u.code).limitToLast(WH_KEEP);
    whRef.on('child_added', function (s) {
        const v = s.val() || {};
        if (!v.t) return;
        pushLine({ n: v.n || '?', t: v.t, c: v.c, w: 'in', k: s.key, quiet: now() < whFrom });
    });
}

// 아무도 안 지워 주므로 가끔 묵은 줄을 걷어 낸다 (서버 채팅과 같은 길)
function whTrim(code) {
    const d = db_(); if (!d) return;
    if (Math.random() > 0.2) return;
    try {
        d.ref(WH + '/' + code).once('value').then(function (s) {
            const v = s.val(); if (!v) return;
            const keys = Object.keys(v).sort();
            const over = keys.length - WH_KEEP * 2;
            if (over <= 0) return;
            const up = {};
            keys.slice(0, over).forEach(function (k) { up[k] = null; });
            d.ref(WH + '/' + code).update(up);
        });
    } catch (e) { }
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
    paintHud();
}

// ── 포인트 · 포만감 · 오염도
//
//   값은 옛 화면과 같은 자리를 그대로 읽는다 (points · satiety · pollution).
//   updateUI 가 돌 때마다 같이 고쳐 두어, 쓰거나 벌면 바로 바뀐다.
function paintHud() {
    const el = document.getElementById('plaza-hud'), u = u_();
    if (!el || !u) return;
    const cut = function (v) { return Math.max(0, Math.min(100, Math.round(Number(v) || 0))); };
    const sat = (u.satiety === undefined) ? 100 : cut(u.satiety);
    const pol = cut(u.pollution);
    el.querySelector('.pt b').innerText = Number(u.points || 0).toLocaleString('ko-KR');
    el.querySelector('.sat i').style.width = sat + '%';
    el.querySelector('.pol i').style.width = pol + '%';
    el.querySelector('.sat').title = '포만감 ' + sat + ' / 100';
    el.querySelector('.pol').title = '오염도 ' + pol + ' / 100';
}

// 포인트·포만감·오염도가 바뀌면 같이 고친다 (updateUI 에 이어 붙인다)
(function hudHook() {
    const iv = setInterval(function () {
        if (typeof window.updateUI !== 'function') return;
        if (window.updateUI._hud) { clearInterval(iv); return; }
        const old = window.updateUI;
        window.updateUI = function () {
            const r = old.apply(this, arguments);
            try { paintHud(); } catch (e) { }
            return r;
        };
        window.updateUI._hud = true;
        clearInterval(iv);
    }, 500);
})();

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
    el.querySelector('.mp-n').innerText = r.n + (run.inst ? ' · ' + run.inst + '번 방' : '');
    const g = el.querySelector('.mp-g');
    g.style.display = r.photo ? 'none' : '';
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
        return '<div class="' + (o.w ? 'wh' : '') + '" style="opacity:' + dim + '">' + (o.sys
            ? '<span class="sys">· ' + esc(o.t) + '</span>'
            : whHead(o) + '<span class="who">' + cyN(o.c, esc(o.n)) + '</span> ' + cyS(sayer(o), esc(o.t))) + '</div>';
    }).join('');
}

// 글줄은 **들고 있다가** 창을 열 때 그린다 (창이 닫혀 있어도 안 잃는다)
function pushLine(o) {
    if (!run) return;
    if (!run.lines) run.lines = [];
    // ★ 같은 줄을 두 번 세우지 않는다.
    //   방을 옮겨도 글줄을 안 지우게 되면서, 갔던 방에 **다시 들어오면**
    //   그 방 말이 child_added 로 처음부터 또 쏟아진다. 서버가 준 열쇠(k)
    //   가 같으면 이미 선 줄이다.
    if (o.k && run.lines.some(function (q) { return q.k === o.k; })) return;
    run.lines.push(o);
    while (run.lines.length > P.CHAT_KEEP + 10) run.lines.shift();
    paintLog();
    paintFeed();
    paintBar(o);
}

// 지난 이야기를 길게 — 왼쪽 아래 글줄을 누르면 뜬다 (logSheet)
function paintLog() {
    const log = document.getElementById('plaza-log');
    if (!log || !run) return;
    log.innerHTML = (run.lines || []).map(function (o) {
        return o.sys ? '<div class="sys">· ' + esc(o.t) + '</div>'
                     : '<div class="' + (o.w ? 'wh' : '') + '">' + whHead(o)
                       + '<span class="who">' + cyN(o.c, esc(o.n)) + '</span> ' + cyS(sayer(o), esc(o.t)) + '</div>';
    }).join('') || '<div class="sys">아직 오간 말이 없습니다.</div>';
    log.scrollTop = log.scrollHeight;
}

// ── 💬 채팅 칸 — 왼쪽 아래 글줄을 누르면 뜬다
//
//   사내 채팅처럼 **읽고 바로 적는** 칸이다. 오고 간 말이 쭉 쌓이고,
//   아래 적는 줄로 보낸다. 왼쪽 위에 「서버 · 맵」이 있어 어느 쪽으로
//   말할지 거기서 고른다.
//
//   아래 바(한 줄짜리)는 그대로 둔다 — 자판이 화면을 덜 가려서,
//   짧게 한마디 할 때는 그쪽이 낫다. 둘 다 같은 자리로 간다.
function chatBox() {
    if (sheetOpen('chat')) { closeSheet(); return; }
    const s = sheet('chat', '',
        '<div class="plaza-chh">'
        + '<div id="plaza-ch">'
        +   '<button data-c="all">서버</button><button data-c="map">맵</button>'
        +   '<button data-c="wh">귓속말</button>'
        + '</div>'
        + '<b class="t">채팅</b></div>'
        + '<div id="plaza-whto" style="display:none"></div>'
        + '<div id="plaza-log"></div>'
        + '<div id="plaza-send">'
        +   '<input id="plaza-in2" maxlength="' + P.SAY_MAX + '" enterkeyhint="send">'
        +   '<button id="plaza-go">보낸다</button></div>');
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('#plaza-ch button'), function (b) {
        b.onclick = function (e) { e.stopPropagation(); chSet(b.dataset.c); };
    });
    const wt = s.querySelector('#plaza-whto');
    if (wt) wt.onclick = function (e) { e.stopPropagation(); whoPick(); };
    const inp = s.querySelector('#plaza-in2');
    const go = function () { say(inp.value); inp.value = ''; };
    inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); go(); }
    });
    s.querySelector('#plaza-go').onclick = go;
    chPaint();
    paintLog();
    setTimeout(function () { try { inp.focus(); } catch (e) { } }, 60);
}

// 아래 채팅 바에 마지막 말을 비춘다 — 창을 안 열어도 뭐가 오가는지 보인다
function paintBar(o) {
    const bar = document.getElementById('plaza-bar');
    if (!bar || !o) return;
    const t = bar.querySelector('.txt');
    if (t) {
        t.innerHTML = o.sys ? '<span style="opacity:.65">· ' + esc(o.t) + '</span>'
            : '<span class="last' + (o.w ? ' wh' : '') + '">' + whHead(o)
              + '<b style="color:' + (o.w ? '#f0a8e0' : '#9fd8ef') + '">' + cyN(o.c, esc(o.n)) + '</b> '
              + cyS(sayer(o), esc(o.t)) + '</span>';
    }
    // 사람 말에만 빨간 점. 들어오자마자 쏟아지는 서버 지난 줄(quiet)은 뺀다.
    if (!o.sys && !o.quiet && !bar.classList.contains('typing')) bar.classList.add('new');
}

// 글줄 앞에 붙는 표 — 「서버」 또는 「귓」
//   귓속말은 받은 것(in)과 보낸 것(out)을 화살표로 가른다.
function whHead(o) {
    if (o.w === 'in') return '<span class="wht">귓</span> ';
    if (o.w === 'out') return '<span class="wht">귓</span> <span class="wha">→</span> ';
    return o.sv ? '<span class="sv">서버</span> ' : '';
}

function addLine(who, text, code, key) {
    pushLine({ n: who, t: text, c: code, k: key });
}

function sysLine(text) {
    pushLine({ sys: 1, t: text });
}

function say(text) {
    const u = u_(); if (!run || !u) return;
    const t = String(text || '').trim().slice(0, P.SAY_MAX);
    if (!t) return;

    // ── 🤫 귓속말 — 받는 사람 앞으로만 적는다 (말풍선 없음)
    if (chatCh === 'wh') {
        if (!whTo) { sysLine('귓속말할 사원을 먼저 고르세요.'); whoPick(); return; }
        const d0 = db_();
        if (d0) {
            try {
                d0.ref(WH + '/' + whTo).push({ n: nameOf(u), c: u.code, t: t, at: now() });
                whTrim(whTo);
            } catch (e) { }
        }
        pushLine({ n: whName || whTo, t: t, c: whTo, w: 'out' });   // 보낸 줄은 내 화면에만
        return;
    }

    run.say = t; run.sayAt = now();
    bubble(run.me, t, sbMine());
    send(false);                              // 말풍선을 바로 알린다
    const d = db_();
    if (d) {
        try {
            d.ref(chPath()).push({ n: nameOf(u), c: u.code, t: t, at: now() });
            if (chatCh === 'all') trimAll();
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
    bubble(run.me, run.say, sbMine());
    send(false);                              // 말풍선을 바로 알린다
    const d = db_();
    if (d) {
        try {
            d.ref(chPath()).push({
                n: nameOf(u), c: u.code, t: '[이모티콘] ' + e.n, at: now() });
            if (chatCh === 'all') trimAll();
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
    // ★ 속은 **따로 흐르는 칸**에 담는다.
    //   ✗ 전에는 .plaza-grid 하나에 overflow-y:auto 를 걸어 그것이 흘렀다.
    //     목록을 갈래로 나누면서 격자가 여럿이 되자 흐를 칸이 없어져,
    //     카드(82dvh)를 넘긴 아래쪽(상점 · 단말 종료)에 손이 안 닿았다.
    s.innerHTML = '<div class="plaza-card"><div class="grip"></div>'
        + (title ? '<h4>' + esc(title) + '</h4>' : '')
        + '<div class="plaza-body">' + inner + '</div></div>';
    s.addEventListener('pointerdown', function (e) {
        if (e.target === s) closeSheet();
        e.stopPropagation();
    });
    ov.appendChild(s);
    return s;
}

// ==========================================
// ★ 알림 불빛 — 올 것이 와 있나
// ==========================================
//
//   목록(☰)의 칸과 ☰ 단추에 **초록 점**을 붙인다. 바탕 화면이 쓰는
//   .notify-dot 을 그대로 쓴다 (style.css — 초록·깜박임).
//
//       gift    선물함에 안 받은 것이 있다 (giftbox.js 의 giftCount)
//       letter  안 읽은 익명 편지가 있다 (hasNewLetter — 편지 칸을 열면 꺼진다)
//       p2p     나에게 온 **기다리는** 밀실 거래 제안이 있다
//
//   셋 다 이미 있는 값만 본다 — 새로 적는 칸은 없다.
function hasNew(key) {
    const u = u_(); if (!u) return false;
    try {
        if (key === 'gift') {
            return (typeof window.giftCount === 'function') && window.giftCount() > 0;
        }
        if (key === 'letter') return !!u.hasNewLetter;
        if (key === 'p2p') {
            const ds = (typeof db !== 'undefined' && db && db.p2pDeals) || [];
            return ds.some(function (d) {
                return d && d.toCode === u.code && d.status === 'PENDING';
            });
        }
    } catch (e) { }
    return false;
}
function anyNew() {
    return P.MENU.some(function (m) { return m.nw && hasNew(m.nw); });
}
// ☰ 단추 — 열어 보지 않아도 알게 한다.
//   ✗ 목록 안에만 붙이면 **열어야 보이는 알림**이 된다.
(function menuDot() {
    setInterval(function () {
        if (!run) return;
        const b = document.getElementById('plaza-menu');
        if (b) b.classList.toggle('notify-dot', anyNew());
        // 선물함은 목록에 없다 — 위 띠 단추에 바로 붙인다
        const g = document.getElementById('plaza-gift');
        if (g) g.classList.toggle('new', hasNew('gift'));
    }, 1500);
})();

// ── ☰ 메뉴
function menuSheet() {
    const list = P.MENU.filter(spotOk);
    // ★ 갈래(GROUPS)대로 묶어 그린다 — 스무 칸이 한 덩어리로 깔려 있으면
    //   무엇이 어디 있는지 눈으로 못 찾는다.
    //   갈래가 없거나 적어 둔 갈래에 안 드는 줄은 맨 끝 「그 밖」으로 모은다.
    const gs = (P.GROUPS || []).concat([{ g: '', n: '그 밖' }]);
    let html = '';
    const done = {};
    gs.forEach(function (grp) {
        const rows = list.filter(function (m, i) {
            const mine = grp.g ? (m.g === grp.g)
                : !(P.GROUPS || []).some(function (x) { return x.g === m.g; });
            if (mine) done[i] = 1;
            return mine;
        });
        if (!rows.length) return;
        html += '<div class="plaza-gh">' + esc(grp.n) + '</div>'
            + '<div class="plaza-grid">' + rows.map(function (m) {
                return '<button data-i="' + list.indexOf(m) + '"'
                    + (m.nw ? ' data-nw="' + m.nw + '"' : '')
                    + (m.nw && hasNew(m.nw) ? ' class="notify-dot"' : '') + '>'
                    + ico(m, 'e') + esc(m.n) + '</button>';
            }).join('') + '</div>';
    });
    // ★ 나가기(✕)가 위 띠에서 빠졌다 — 위 오른쪽이 공지·선물함·메뉴 셋으로
    //   찼기 때문이다. 그래서 메뉴 맨 끝에 혼자 둔다.
    html += '<div class="plaza-grid plaza-gout"><button id="plaza-out">' + ico({ ic: 'out' }, 'e')
        + (isAdm() ? '광장 나가기' : '단말 종료') + '</button></div>';
    const s = sheet('menu', '목록', html);
    if (!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('.plaza-grid button[data-i]'), function (b) {
        b.onclick = function () { pickMenu(list[Number(b.dataset.i)]); };
    });
    // 열어 둔 사이에 와도 바로 켜진다 (창이 닫히면 저절로 그친다)
    const dotIv = setInterval(function () {
        if (!s.isConnected) { clearInterval(dotIv); return; }
        Array.prototype.forEach.call(s.querySelectorAll('.plaza-grid button[data-nw]'), function (b) {
            b.classList.toggle('notify-dot', hasNew(b.dataset.nw));
        });
    }, 1500);
    s.querySelector('#plaza-out').onclick = function () {
        // 사원은 광장이 집이라 「나가기」가 갈 데가 없다 — 단말을 끈다.
        if (!isAdm() && typeof window.logout === 'function') { window.logout(); return; }
        shut();
    };
}

// ==========================================
// ★ 🛗 엘리베이터 — 층을 눌러 고른다
//
//   건물 안(백일몽·재난관리국)은 한 장에 **로비만** 그려져 있고,
//   2F 사택과 B1 탐사는 그림이 따로 없다. 그래서 층을 **판으로** 고른다.
//   주신 「엘레베이터 버튼」 그림을 그대로 쓰고, 2F·1F·B1 세 자리에만
//   손이 닿게 덮어 둔다 (그림 안의 단추 자리에 맞춰 둔 비율이다).
//
//   층에 든 것이 하나면 바로 들어가고, 둘이면 그 층의 것만 다시 묻는다.
//   1F 는 지금 서 있는 데라 그냥 닫는다.
// ==========================================
// ★ 2026-10-19 — 그림에 B2 단추를 하나 더 그려 넣어 키가 676 → 801 로 늘었다. 칸 자리도 그에 맞춰 다시 쟀다.
const LIFT_HIT = { f2: [0.215, 0.350], f1: [0.376, 0.511], b1: [0.536, 0.671], b2: [0.692, 0.827] };

function liftSheet(floor) {
    const r = roomOf();
    const L = r.lift;
    if (!L) return;
    if (floor) {
        const list = (L[floor] || []).filter(spotOk);
        if (!list.length) { closeSheet(); return; }       // 1F — 여기가 로비다
        if (list.length === 1) { goApp(list[0]); return; }
        const html = '<div class="plaza-grid">' + list.map(function (m, i) {
            return '<button data-i="' + i + '">' + ico(m, 'e') + esc(m.n) + '</button>';
        }).join('') + '</div>';
        const s2 = sheet('lift', floor.toUpperCase().replace('F', 'F').replace('B1', 'B1'), html);
        if (!s2) return;
        Array.prototype.forEach.call(s2.querySelectorAll('.plaza-grid button'), function (b) {
            b.onclick = function () { goApp(list[Number(b.dataset.i)]); };
        });
        return;
    }
    const s = sheet('lift', '', '<div id="plaza-lift"><img src="' + P.DIR + 'lift.png" alt="엘리베이터">'
        + Object.keys(LIFT_HIT).map(function (k) {
            const h = LIFT_HIT[k];
            return '<button data-f="' + k + '" title="' + k.toUpperCase() + '" style="top:'
                + (h[0] * 100).toFixed(2) + '%;height:' + ((h[1] - h[0]) * 100).toFixed(2) + '%"></button>';
        }).join('') + '</div>');
    if (!s) return;
    // ★ 연 그 손가락이 그대로 층을 누르는 것(유령 누름)을 막는다.
    //
    //   입구는 pointerdown 에서 열린다. 그러면 손을 떼는 순간 같은 자리에서
    //   click 이 한 번 더 나는데, 그 자리에 이제 막 뜬 층 단추가 있다.
    //   그래서 엘리베이터를 누르면 **2층이 같이 눌려** 사택이 바로 열렸다.
    //   창이 뜨고 0.4초 안에 오는 누름은 받지 않는다.
    const at = now();
    Array.prototype.forEach.call(s.querySelectorAll('#plaza-lift button'), function (b) {
        b.onclick = function () {
            if (now() - at < 400) return;
            liftSheet(b.dataset.f);
        };
    });
}

// ★ 목록에서 골랐을 때 — **걸어가서 들어간다.**
//
//   광장이 집이 된 뒤로 걸음이 곧 놀이라, 목록은 문을 바로 열지 않고
//   그 시설이 선 **방까지만** 데려다 준다. 거기서 걸어가 입구를 누르면
//   들어간다. 사원증·소지품처럼 **자리가 없는 것**은 전처럼 바로 연다.
//
//   스킵권(🎟️)을 쓴 다음 한 번은 걸음을 건너뛰고 그 자리에서 들어간다.
function pickMenu(m) {
    if (m && m.sheet === 'mates') { matesSheet(); return; }
    if (m && m.sheet === 'photo') { photoSheet(); return; }
    if (skipTake) {
        const take = skipTake;
        skipTake = null;
        let ok = false;
        try { ok = take(); } catch (e) { }
        if (ok) { goApp(m); return; }        // 표를 거뒀다 — 바로 들어간다
    }
    const at = placeOf(m);
    if (!at) { goApp(m); return; }           // 자리가 없는 것은 바로 연다
    // 🔒 갇혔으면 다른 방 · 다른 층의 시설로는 못 간다
    if (cageMine() && (at.room !== run.room || (at.spot.lv || 0) !== (run.lv || 0))) {
        closeSheet(); sysLine('🔒 가두리에 갇혀 있어 ' + m.n + '(으)로 갈 수 없습니다.'); return;
    }
    closeSheet();
    if (at.room !== run.room) goRoom(at.room, null, at.spot.lv);
    else if (at.spot.lv != null && at.spot.lv !== run.lv) goRoom(at.room, null, at.spot.lv);
    sysLine(R[at.room].n + ' 입니다. ' + m.n + ' 앞으로 걸어가 주십시오.');
}

// ── 💬 말
function sendSay() {
    const el = document.getElementById('plaza-in');
    if (!el) return;
    say(el.value);
    el.value = '';
}

// ★ 채팅은 **창을 안 띄운다.**
//
//   아래에서 창이 올라오면 자판까지 겹쳐 화면이 통째로 가렸다. 오고 간
//   말은 이미 왼쪽 아래 글줄(plaza-feed)에 늘 떠 있으므로 창까지 띄울
//   까닭이 없다. 그래서 **아래 바가 그 자리에서 입력칸이 된다.**
//   방도 사람도 그대로 보이고, 자판 위로 한 줄만 올라온다.
//
//   지난 글줄을 길게 보고 싶으면 **글줄을 톡 치면** 채팅 칸이 열린다.
//
//   ★ 적는 칸 바로 위에 「서버 · 맵」이 있다. 서버로 두면 어느 방에 있든
//     모든 사원에게 들리고, 맵으로 두면 같은 방 사람에게만 들린다.
//     서버로 온 줄에는 글줄에 「서버」 표가 붙는다.
function chatSheet() {
    const bar = document.getElementById('plaza-bar');
    if (!bar || bar.classList.contains('typing')) return;
    bar.classList.remove('new');
    bar.classList.add('typing');
    const keep = bar.innerHTML;
    bar.innerHTML = '<input id="plaza-in" maxlength="' + P.SAY_MAX + '" enterkeyhint="send">';
    const inp = bar.querySelector('#plaza-in');
    chPaint();                      // 적는 칸에 「서버/맵」 어느 쪽인지 적어 준다
    const back = function () {
        if (!bar.classList.contains('typing')) return;
        bar.classList.remove('typing');
        bar.innerHTML = keep;
        paintBar((run && run.lines || []).slice(-1)[0]);
    };
    inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); sendSay(); inp.value = ''; }
        else if (e.key === 'Escape') { e.preventDefault(); back(); }
    });
    // 적다 만 글이 없을 때만 접는다 (자판이 닫혔다고 글을 버리지 않는다)
    inp.addEventListener('blur', function () {
        setTimeout(function () { if (!inp.value.trim()) back(); }, 150);
    });
    setTimeout(function () { try { inp.focus(); } catch (e) { } }, 40);
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
        // ★ 뽑기(gacha.js)로 뽑은 사람만 — 옷장 쪽과 같은 규칙
        if (it.own) {
            if (u && u.code === P.ADMIN) return true;
            return !!(u && u.wardrobe && u.wardrobe[it.own]);
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

// ── 🎒 가방 — **소지품**
//
//   ★ 전에는 여기에 의상·악세가 들어 있었다. 옷 갈아입기는 **사택 옷장**으로
//     옮겼고(closet.js), 가방은 소지품만 든다. 손에 닿는 자리에 늘 있어야
//     하는 것은 「쓰는 물건」이지 옷이 아니다.
//
//   누르면 그 자리에서 펴지며 설명과 단추(사용·장착·본인/타인·판매)가 뜬다.
//   단추가 하는 일은 사원 화면 소지품 칸과 **같은 것을 그대로 부른다**
//   (useInventoryItem · openItemTargetModal · sellInventoryItem).

// ★ 갈래는 **사원 화면 소지품 칸과 같은 것을 그대로 쓴다** (invcat.js).
//   음식 · 회복 · 물약 · 장비 · 어둠 회수품 · ??? · 우주 쇼핑몰 · 조합 재료 ·
//   행복 식당(restaurant.js) · 출산(inv-shout.js) · 기타 …
//   ✗ 전에는 effect 를 보고 여기서 따로 갈랐다. 같은 물건이 두 화면에서
//     다른 칸에 들어가고, 다른 파일이 새로 더한 칸(행복 식당·출산)은
//     아예 안 보였다. 갈래는 한 군데서만 정한다.
function bagCats() {
    if (typeof INV_CATS !== 'undefined' && INV_CATS.length) return INV_CATS;
    return [{ id: 'etc', name: '소지품', icon: '📦', color: '#888' }];
}
function itemCat(name) {
    try { if (typeof invCatOf === 'function') return invCatOf(name); } catch (e) { }
    return 'etc';
}
function itemInfo(name) {
    try { return (typeof ITEM_CATALOG !== 'undefined') ? (ITEM_CATALOG[name] || null) : null; }
    catch (x) { return null; }
}

let bagOpenItem = '';          // 펴 둔 물건 (다시 그려도 그대로 펴 둔다)

function bagSheet() {
    const u = u_(); if (!u) return;
    const s = sheet('bag', '소지품', '<div id="plaza-bagbody">' + bagInv(u) + '</div>');
    if (!s) return;
    bagWire(s);
}
// 다시 그릴 때는 **속만** 갈아 끼운다 — 창을 새로 띄우면 내려 둔 자리가 풀린다
function bagRepaint() {
    const box = document.getElementById('plaza-bagbody');
    if (!box) return;
    const top = box.scrollTop;
    box.innerHTML = bagInv(u_());
    box.scrollTop = top;
    const s = document.getElementById('plaza-sheet');
    if (s) bagWire(s);
}
function bagWire(s) {
    Array.prototype.forEach.call(s.querySelectorAll('.bag-it'), function (b) {
        b.onclick = function () {
            bagOpenItem = (bagOpenItem === b.dataset.n) ? '' : b.dataset.n;
            bagRepaint();
        };
    });
    Array.prototype.forEach.call(s.querySelectorAll('.bag-do'), function (b) {
        b.onclick = function () {
            const n = b.dataset.n, how = b.dataset.do;
            try {
                if (how === 'use' && typeof useInventoryItem === 'function') useInventoryItem(n);
                else if (how === 'me' && typeof useInventoryItem === 'function') useInventoryItem(n);
                else if (how === 'you' && typeof openItemTargetModal === 'function') openItemTargetModal(n, true);
                else if (how === 'pick' && typeof openItemTargetModal === 'function') openItemTargetModal(n, false);
                else if (how === 'sell' && typeof sellInventoryItem === 'function') sellInventoryItem(n);
            } catch (e) { console.warn('[가방]', n, e); }
            // 수가 줄었을 수 있다 — 조금 뒤에 다시 그린다 (창은 그대로 둔다)
            setTimeout(bagRepaint, 420);
        };
    });
}

function bagInv(u) {
    const inv = Array.isArray(u.inventory) ? u.inventory : [];
    if (!inv.length) return '<div class="plaza-none">가진 것이 없습니다.</div>';
    const cnt = {};
    inv.forEach(function (x) { const n = String(x); cnt[n] = (cnt[n] || 0) + 1; });
    let names = Object.keys(cnt);
    try { if (typeof invSortNames === 'function') names = invSortNames(names); } catch (e) { }

    const cats = bagCats();
    const mine = {};
    names.forEach(function (n) {
        let id = itemCat(n);
        if (!cats.some(function (c) { return c.id === id; })) id = 'etc';
        (mine[id] = mine[id] || []).push(n);
    });
    let html = '';
    cats.forEach(function (g) {
        const rows = mine[g.id] || [];
        if (!rows.length) return;
        html += '<div class="plaza-gh">' + (g.icon ? esc(g.icon) + ' ' : '') + esc(g.name)
            + '<i class="n">' + rows.length + '</i></div><div class="bag-grid">'
            + rows.map(function (n) {
                return '<button class="bag-it' + (bagOpenItem === n ? ' on' : '') + '" data-n="' + esc(n) + '">'
                    + '<span class="nm">' + esc(n) + '</span>'
                    + (cnt[n] > 1 ? '<b>×' + cnt[n] + '</b>' : '') + '</button>';
            }).join('') + '</div>';
        if (rows.indexOf(bagOpenItem) >= 0) html += bagCard(bagOpenItem, cnt[bagOpenItem]);
    });
    return html || '<div class="plaza-none">가진 것이 없습니다.</div>';
}

// 펴 둔 물건 한 칸 — 설명과 단추
function bagCard(n, qty) {
    const c = itemInfo(n);
    const e = String((c && c.effect) || '');
    const noSell = (function () {
        try { return (typeof NO_SELL_ITEMS !== 'undefined') && NO_SELL_ITEMS.indexOf(n) >= 0; }
        catch (x) { return true; }
    })();
    let sell = 0;
    try { if (typeof getSellPrice === 'function') sell = getSellPrice(n); } catch (x) { }

    // ★ 어떤 단추가 뜨나 — 사원 화면 소지품 칸과 같은 규칙이다
    let btn = '';
    const one = function (how, label, cls) {
        return '<button class="bag-do ' + (cls || '') + '" data-do="' + how + '" data-n="' + esc(n) + '">'
            + esc(label) + '</button>';
    };
    if (c && c.usable) {
        // ★ 차례와 글귀를 **사원 화면 소지품 칸과 똑같이** 맞춘다.
        //   ✗ 「effect 가 equip 으로 시작하면 장착」으로 뭉뚱그렸더니 빨간 리본
        //     (equip_red_ribbon)이 「대상 지정」이 아니라 「장착」으로 떴다.
        //     사원 화면은 **적어 둔 열한 가지만** 장착으로 치고 나머지는
        //     「장착 본인 / 장착 타인」으로 간다.
        const EQUIP_SELF = ['equip', 'equip_bloodbath', 'equip_fox_bead', 'equip_amulet',
            'equip_silver_ring', 'equip_butter_knife', 'equip_dead_bulb', 'equip_rabbit',
            'equip_security', 'equip_jakdu', 'equip_lion'];
        const eq = /^equip/.test(e) ? '장착 ' : '';
        if (n === '💍 커플링') {
            btn += (u_() && u_().couple) ? '<button class="bag-do off" disabled>사용 중</button>' : one('use', '사용');
        } else if (EQUIP_SELF.indexOf(e) >= 0) {
            btn += one('use', '장착');
        } else if (n === '빨간 리본' || n === '노예 계약서') {
            btn += one('pick', '대상 지정');
        } else if (e === 'target_sticker') {
            btn += one('use', '타인 부착');
        } else if (c.targetable) {
            btn += one('me', eq + '본인') + one('you', eq + '타인');
        } else {
            btn += one('use', '사용');
        }
    }
    if (!noSell) btn += one('sell', '판매 +' + sell, 'sell');
    if (!btn) btn = '<span class="non">쓸 수 없는 물건입니다.</span>';

    return '<div class="bag-card">'
        + '<div class="t">' + esc(n) + (qty > 1 ? ' <b>×' + qty + '</b>' : '') + '</div>'
        + '<div class="d">' + esc((c && c.desc) || '알 수 없는 물품입니다.') + '</div>'
        + '<div class="b">' + btn + '</div></div>';
}

// ==========================================
// 창
// ==========================================
function shut() {
    if (!run) return;
    // 🔒 갇힌 사원은 광장을 닫지 못한다 — 단말을 끌 때(logout)만 닫힌다 (gaduri.js 가 표를 세운다)
    if (cageMine() && !window._plazaForceShut) { sysLine('🔒 가두리에 갇혀 있어 광장을 떠날 수 없습니다.'); return; }
    try { cancelAnimationFrame(run.raf); } catch (e) { }
    if (run.idleT) { clearTimeout(run.idleT); run.idleT = 0; }
    if (run.onWake) {
        window.removeEventListener('keydown', run.onWake, true);
        window.removeEventListener('pointerdown', run.onWake, true);
        window.removeEventListener('pointermove', run.onWake, true);
    }
    leaveRoom();
    if (chatRef) { try { chatRef.off(); } catch (e) { } chatRef = null; }
    if (allRef) { try { allRef.off(); } catch (e) { } allRef = null; }
    if (whRef) { try { whRef.off(); } catch (e) { } whRef = null; }
    if (nbRef) { try { nbRef.off(); } catch (e) { } nbRef = null; }
    Object.keys(run.peers).forEach(dropPeer);
    try { run.me.actor.stop(); } catch (e) { }
    if (run.onKey) {
        window.removeEventListener('keydown', run.onKey);
        window.removeEventListener('keyup', run.onKeyUp);
    }
    if (run.onSize) window.removeEventListener('resize', run.onSize);
    if (run.onStick) run.onStick();
    if (run.tagIv) { clearInterval(run.tagIv); run.tagIv = 0; }
    if (run.swpIv) { clearInterval(run.swpIv); run.swpIv = 0; }
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
        + '<button class="plaza-ico plaza-keep" id="plaza-notice">'
        +   '<span class="pico" style="--ic:url(\'ico/notice.png\')"></span><i class="nd"></i></button>'
        + '<button class="plaza-ico plaza-keep" id="plaza-gift">'
        +   '<span class="pico" style="--ic:url(\'ico/gift.png\')"></span><i class="nd"></i></button>'
        + '<button class="plaza-ico plaza-keep" id="plaza-menu">☰</button>'
        + '</div>'
        + '<div id="plaza-who"></div>'
        // 사원증 칸 아래 · 사진 단추 오른쪽 — 포인트 · 포만감 · 오염도
        + '<div id="plaza-hud" class="plaza-keep">'
        +   '<div class="pt"><b>0</b> P</div>'
        +   '<div class="bar sat" title="포만감"><i></i></div>'
        +   '<div class="bar pol" title="오염도"><i></i></div>'
        + '</div>'
        + (touch ? '' :
            '<div id="plaza-pad" class="plaza-keep">'
            + '<button data-k="left">◀</button>'
            + '<button data-k="up">▲</button>'
            + '<button data-k="down">▼</button>'
            + '<button data-k="right">▶</button>'
            + '</div>')
        // ★ plaza-keep 을 뗐다 — 엄지가 닿는 자리라 여기서도 끌어 걸을 수
        //   있어야 한다. 끌지 않고 톡 친 것만 열린다 (stick 참고).
        + '<div id="plaza-feed"></div>'
        + '<div id="plaza-map"><div class="mp-n"></div><div class="mp-g"></div></div>'
        + '<div id="plaza-bottom">'
        + '<button class="plaza-ico plaza-keep" id="plaza-emo">🙂</button>'
        + '<div id="plaza-bar" class="plaza-keep"><span class="dot"></span>'
        + '<span class="txt">여기에 적으면 머리 위에 뜹니다</span></div>'
        + '<button class="plaza-ico plaza-keep" id="plaza-bag">'
        +   '<span class="pico" style="--ic:url(\'ico/bag.png\')"></span></button>'
        + '</div>';
    document.body.appendChild(ov);
    stampSafe(ov);

    run = {
        room: null, el: document.getElementById('plaza-room'),
        view: document.getElementById('plaza-view'),
        peers: {}, keys: {}, ax: 0, ay: 0, vx: 0, vy: 0, x: 0, y: 0, tx: null, ty: null,
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
        const DEAD = 14;              // 이만큼 끌어야 걷기로 본다 (손 떨림 몫)
        const REACH = 62;             // 이만큼 끌면 가장 빠르다
        const TAP_MS = 360;           // 이 안에 떼면 톡 친 것
        const TAP_SLOP = 22;          // 이만큼 안 벗어났으면 톡 친 것으로 본다
        // ★ 조이스틱을 받는 자리 — 방 화면과 **왼쪽 아래 글줄 · 오른쪽 아래
        //   미니맵**까지다. 손전화에서 엄지가 닿는 곳이 거기인데, 전에는
        //   글줄과 미니맵이 손가락을 통째로 먹어 **엄지 자리에서 아예 못
        //   걸었다.** 이제 끌면 걷고, 끌지 않고 톡 치면 전처럼 열린다.
        const GRAB = '#plaza-view, #plaza-feed, #plaza-map';
        let id = null, ox = 0, oy = 0, at = 0, drag = false, far = 0, hit = null;

        const stop_ = function () { if (run) { run.ax = 0; run.ay = 0; } };
        // ★ 보이는 손잡이 — 짚은 자리에 동그라미, 민 쪽에 알맹이.
        //   안 보이는 채로 두니 「지금 끄는 중인지 톡 친 건지」를 알 수 없어
        //   조작이 막연했다. 걷는 동안에만 옅게 뜬다.
        const stick = document.createElement('div');
        stick.id = 'plaza-stick';
        stick.innerHTML = '<i></i>';
        ov.appendChild(stick);
        const draw = function (dx, dy, d) {
            stick.style.left = ox + 'px'; stick.style.top = oy + 'px';
            const m = d ? Math.min(1, d / REACH) : 0;
            const kx = d ? dx / d * REACH * m : 0, ky = d ? dy / d * REACH * m : 0;
            stick.firstChild.style.transform = 'translate(' + Math.round(kx) + 'px,' + Math.round(ky) + 'px)';
            stick.classList.add('on');
        };
        const hide = function () { stick.classList.remove('on'); };
        // 끌고 나서 손을 떼면 짚었던 것 위로 click 이 한 번 더 난다 —
        // 걸으려고 끈 것뿐인데 채팅 칸이 열리던 것을 한 번만 삼킨다.
        const eatClick = function () {
            const kill = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
            window.addEventListener('click', kill, true);
            setTimeout(function () { window.removeEventListener('click', kill, true); }, 350);
        };
        // ★ 얹어 둔 것들 위에서는 걷지 않는다.
        //
        //   짚은 자리가 목적지로 쓰이는 게 아니라서, 아래쪽 빈 검은 자리를
        //   짚어도 가만히 있지 않는다. 톡 치면 세로는 바닥 띠 안으로 잘리고
        //   **가로만** 받아 옆으로 걸어가고(게다가 아래쪽을 짚은 것을
        //   「지하로 가겠다」로 읽어 계단으로 내려간다), 끌면 짚은 자리가
        //   아예 상관없이 **그 자리가 조이스틱 한가운데**가 된다.
        //   그래서 미니맵·단추·채팅 바는 .plaza-keep 으로 빼낸다.
        //   (채팅 내역은 글자뿐이라 pointer-events:none 으로 그냥 통과시킨다)
        ov.addEventListener('pointerdown', function (e) {
            if (!run) return;
            const t = e.target;
            if (!t || !t.closest) return;
            if (!t.closest(GRAB)) return;                        // 단추·창 위에서는 안 걷는다
            if (t.closest('.plaza-spot, .plaza-keep')) return;   // 시설 표·얹어 둔 것
            id = e.pointerId; ox = e.clientX; oy = e.clientY; at = now();
            drag = false; far = 0; hit = t;
        });
        // ★ 끌기는 **창 전체**에서 듣는다. 붙잡기(setPointerCapture)는 안 쓴다.
        //
        //   ✗ 전에는 끌기 시작할 때 ov 로 손가락을 붙잡아 두었다. 그런데
        //     손가락은 누르는 순간 **눌린 칸에 저절로 붙잡힌다**(암묵적 붙잡기).
        //     거기서 ov 로 옮기면 눌렸던 칸에서 lostpointercapture 가 나고,
        //     그것이 **위로 타고 올라와 ov 까지 와서** 손 뗀 것으로 읽혔다.
        //     그래서 손전화에서는 끌기가 **한 칸 만에 죽고** 톡 치기만 됐다.
        //     마우스에는 암묵적 붙잡기가 없어 PC 에서는 멀쩡해 보였다.
        //
        //   붙잡지 않아도 샐 일이 없다. 광장 창(ov)은 화면을 통째로 덮으므로
        //   손가락이 어디로 가든 그 안이고, 창 밖으로 나가 손을 떼는 것은
        //   window 에서 듣는 pointerup 이 받는다.
        const onMove = function (e) {
            if (!run || id === null || e.pointerId !== id) return;
            let dx = e.clientX - ox, dy = e.clientY - oy;
            let d = Math.hypot(dx, dy);
            if (d > far) far = d;
            if (!drag && d < DEAD) return;
            drag = true;
            e.preventDefault();
            // ★ 끝까지 민 뒤에는 **한가운데가 손가락을 따라온다.**
            //   안 그러면 반대로 가려 할 때 민 만큼 되돌아와야 해서 늦게 돈다
            //   (끝까지 민 채로 손목만 돌리면 한참을 그대로 걸어갔다).
            if (d > REACH) {
                ox += dx * (d - REACH) / d;
                oy += dy * (d - REACH) / d;
                dx = e.clientX - ox; dy = e.clientY - oy; d = REACH;
            }
            const m = Math.min(1, (d - DEAD) / (REACH - DEAD));
            run.ax = dx / d * m;
            run.ay = dy / d * m;
            run.tx = null;                        // 끌면 눌러 둔 자리는 버린다
            draw(dx, dy, d);
        };
        const up = function (e) {
            if (id === null || (e && e.pointerId !== undefined && e.pointerId !== id)) return;
            id = null;
            stop_();
            hide();
            // ★ 손가락이 조금 미끄러져도(TAP_SLOP 안에서 짧게) 톡 친 것으로 본다.
            //   전에는 DEAD(14픽셀)만 넘으면 끈 것으로 쳐서, 15픽셀 미끄러진
            //   톡 치기는 **한 칸 걷다 멈추고 그대로 버려졌다.** 손전화에서
            //   가만히 톡 치기가 어려워 이것이 「안 눌린다」로 느껴졌다.
            const tap = (now() - at < TAP_MS) && far < TAP_SLOP;
            if (!tap && drag) eatClick();
            // 톡 쳤으면 그 자리로 걸어간다.
            // ★ 글줄·미니맵을 톡 친 것은 **그 칸을 여는 것**이지 걷는 게 아니다.
            if (tap && run
                && !(hit && hit.closest && hit.closest('#plaza-feed, #plaza-map'))) {
                const r = roomOf(), z = zz();
                const b = run.view.getBoundingClientRect();
                const x = (e.clientX - b.left + run.cx) / z;
                const y = (e.clientY - b.top + run.cy) / z;
                // ★ 짚은 자리에서 **가장 가까운 선**을 고른다. 다른 선이면
                //   그 선까지 가는 길(계단)은 걸으면서 저절로 잡힌다 (wayX).
                let best = 'up', bd = 1e9;
                segList(r).forEach(function (o) {
                    const xr = segX(r, o);
                    const cx = Math.max(xr[0], Math.min(xr[1], x));
                    const d = Math.hypot(cx - x, segY(r, o, cx) - y);
                    if (d < bd) { bd = d; best = o; }
                });
                const xr2 = segX(r, best);
                run.tseg = best;
                run.tx = Math.max(xr2[0], Math.min(xr2[1], x));
                run.ty = segY(r, best, run.tx);
            }
            drag = false; far = 0; hit = null;
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        // 광장을 닫을 때 떼어 낸다 — 창에 건 것은 창이 없어져도 안 지워진다
        run.onStick = function () {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
        };
    })();

    // 창 크기가 바뀌면 (화면을 돌리거나 자판이 올라오면) 다시 맞춘다
    run.onSize = function () {
        if (!run || !run.room) return;
        viewForget();                       // 떠 둔 창 크기를 버린다
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
    // ★ 쉬는 고리를 깨운다 — 누르기 · 끌기 · 자판 (조이스틱은 누른 채 움직이므로 끌기도 본다)
    run.onWake = function () { wake(); };
    window.addEventListener('keydown', run.onWake, true);
    window.addEventListener('pointerdown', run.onWake, true);
    window.addEventListener('pointermove', run.onWake, true);
    run.onKey = function (e) {
        if (!run) return;
        if (document.activeElement && document.activeElement.id === 'plaza-in') {
            if (e.key === 'Enter') sendSay();
            return;
        }
        // ★ 게시판 같은 다른 창에서 글을 치는 중에는 안 걷는다 (a·d·w·s 가 글자다)
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA')) return;
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
    document.getElementById('plaza-feed').onclick = chatBox;
    paintMe();
    watchNotice();
    watchAll();
    watchWhisper();

    // ★ 지난번에 서 있던 방에서 다시 시작한다 — 들어갔다 나오면 광장이
    //   아니라 **그 자리**여야 한다. 없어진 방이면 광장으로 돌아간다.
    let start = P.START;
    try {
        const last = localStorage.getItem('plazaRoom');
        if (last && R[last]) start = last;
    } catch (e) { }
    goRoom(start, null);
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
                 아래: (downOf(r) ? downOf(r).to : '-') };
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
        return (run.peers[c].one.name || c) + '(' + c + ')'; }).join(', ') : '혼자');
};

// 지금 선 자리 — 시험과 콘솔에서 들여다본다
window.plazaWhere = function () {
    if (!run) return null;
    return { room: run.room, inst: run.inst || 0, x: Math.round(run.x), y: Math.round(run.y),
             seg: run.seg, lv: run.lv };
};

// 지금 방 그림 — 유리 펜(pen.js)이 방 바닥 그림 위에 그린다
//   seat 는 몇 번 방에 들지 정해진 뒤에만 있다 (그 전에는 null).
window.plazaStage = function () {
    if (!run || !run.el || !run.room || !R[run.room]) return null;
    const r = roomOf();
    return { el: run.el, view: run.view, ov: document.getElementById('plaza-ov'),
             z: zz(), w: r.w, h: r.h, room: run.room,
             seat: run.inst ? seatKey(run.room, run.inst) : null };
};

console.log('[광장] plazaOpen() · plazaGo(방) · plazaRooms() · plazaState() · plazaWhere()');

})();
