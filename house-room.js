// ==========================================
// ★ 🏠 사택 안 — 걸어 다니는 집 · 꾸미기 · 룸메이트 · 초대 (2026-11-12)
// bundles.json 마지막 묶음 맨 뒤 (closet.js 의 dotActor · dotSpec 을 쓴다)
// ==========================================
//
// ■ 사용자
//   「가장 위에서부터 순서대로 가구 레이어, 사택 틀 레이어, 벽지 레이어, 바닥지 레이어 순서대로 노출돼야 하고.
//     광장 같은 형식으로 사택에서도 움직일 수 있게 해줘.」 (그림 묶음 「사택 1차」)
//   물어보고 정한 것 — 가구는 사원이 직접 놓고 돌린다 · 벽지 · 바닥지는 사서 바꾼다 (장당 10,000 P) ·
//                     가구도 산다 · 사는 곳은 사택 화면 안 · 같이 보이는 사람은 룸메이트 + 집주인이 초대한 사원
//
// ■ 그림 (house/)
//   받은 그림(4128 · 가구 3840x4800)은 도트 한 칸이 4 점이다 — 4분의 1(1032 · 960x1200)로 줄여 한 칸 한 점으로 두고 키워 그린다.
//   이 집의 한 단위 = 도트 한 칸. 사람 그림(closet.js)도 도트 한 칸이 4 점이라 사람은 배(Z) 의 4분의 1 로 그리면 같은 눈금이 된다.
//     floorN.webp   바닥지 7 장 (맨 아래)
//     wallN.webp    벽지 6 장
//     frame.webp    사택 틀 (바깥 검정 · 회색 벽 줄 · 안은 비었다)
//     furn.webp     가구 20 가지 × 네 방향 (120 칸 · 한 줄에 두 가지 — 앞 · 옆 · 뒤 · 옆)
//     walk.png      걷는 곳 (0 집 밖 · 128 집 안 벽지 띠 · 255 걷는 곳 — 벽지 띠를 빼고 발 너비만큼 안쪽으로 줄였다)
//   쌓는 차례 (아래 → 위): 바닥지 · 벽지 · 사택 틀 · [가구 + 사람] — 가구와 사람은 발밑 높이(y) 차례로 앞뒤가 갈린다
//   (가구가 사택 틀 위 · 사람은 가구 사이에 끼어 선다 — 소파 뒤에 서면 소파에 가린다)
//
// ■ 서버
//   houseDeco/<집주인>             { w: 벽지 번호, f: 바닥지 번호, ow: { 번호: 1 } 산 벽지, of: { 번호: 1 } 산 바닥지,
//                                    inv: { 가구 번호: 산 개수 }, furn: { 열쇠: { t: 가구 번호, d: 방향 0~3, x, y } } }
//                                   (벽지 1 · 바닥지 1 은 처음부터 있다 · x, y = 가구 칸(120) 왼쪽 위 · 도트)
//   houseRoom/<집주인>/<사번>       { n, x, y, f, m, d, s, st, at }   — 그 집 안에 있는 사람 (광장 자리와 같은 꼴)
//   houseInvite/<집주인>/<사번>     { at, n }    — 집주인이 초대한 사원 (집주인 쪽 명단)
//   houseInvited/<사번>/<집주인>    { at, n }    — 같은 것을 받은 사람 쪽에도 (받은 사람 화면이 듣는다)
//
// ■ 🔍 꾸밀 때 줌인 · 줌아웃 (2026-11-12 사용자 「(기본 배치는) 하지 말고 꾸밀 때에는 줌인 줌아웃이 가능한 기능만」)
//   꾸미기를 켜면 오른쪽 위에 ［－ 100% ＋］ — 50% ~ 400% 를 한 칸씩 (ZE) · PC 는 마우스 휠 · 손가락 두 개로 벌리면 확대 · 오므리면 축소
//   꾸미기를 닫으면 원래 크기로. 걷기 · 가구 끌기는 줌과 상관없이 그대로 된다.
//   ✗ 같은 날 처음엔 가구 22개 · 벽지 1 · 바닥지 1 을 기본으로 깔아 두려다가 사용자가 「하지 말고」 — 집은 처음에 비어 있다
//
// ■ 누가 들어가나
//   집주인 · 집주인의 룸메이트(house.roomie — 어느 쪽에 적혀 있든) · 집주인이 초대한 사원 · 꾸미기는 집주인만
//   ★ 2026-11-12 사용자 「사택은 A등급 이상부터 들어갈 수 있게」 — 그 집의 등급(houseGrade · 둘 중 높은 쪽)이 A · S · L 일 때만 (손님도 그 집 등급으로)
//
// ■ ★ 같이 쓰는 사택 (2026-11-12 사용자)
//   「각자 사택이 있는데, 그렇게 말고 동거하면 공유하는 식으로 하자. 대신 자신이 산 건 자신의 보관함에 있는 식이고.
//     그 대신 양쪽의 방은 각각 꾸밀 수 있게 하자. 벽지나 바닥 등등. 이건 룸메가 바꼈을 때 자기 방은 유지되게 (거실 타인 방 제외.)
//     두 사원이 있으면 랜덤으로 왼쪽 오른쪽 자리 되게 하고, 만일 바껴서 위치가 바뀌면 가구 설치한 그대로 좌우반전만 된 식으로 옮겨지는 형식으로.」
//   「동거인이 방을 꾸며주길 원하면, 자신의 방에 들어가서 방 꾸미기 허용.」
//   물어보고 정한 것 — 거실은 둘 다 꾸민다(각자 자기 보관함 것으로 · 남이 놓은 가구는 못 옮긴다 · 룸메가 바뀌면 거실 가구는 각자 보관함으로) ·
//                     허용받은 동거인은 자기 것으로 내 방을 꾸민다(룸메가 바뀌면 그 가구는 동거인 보관함으로) ·
//                     혼자 사는 사원은 양쪽 방을 다 쓴다(룸메가 생기면 남는 방 가구는 보관함으로)
//   집은 가운데(x 515.5)를 두고 좌우가 똑같다 — 위 큰 방 + 가운데 복도 = 거실 C · 왼쪽 날개 L · 오른쪽 날개 R (regionAt)
//   집 열쇠 hk — 서로를 가리키는 룸메이트 둘이면 두 사번을 줄 세워 「_」로 · 혼자면 내 사번 (hkOf)
//
//   houseMine/<사번>       { inv: { 가구: 개수 }, ow: { 벽지: 1 }, of: { 바닥지: 1 },     — 내 보관함 (어느 집에 살든 따라온다)
//                            room: { w, wa, f, fa, furn: { 열쇠: { t, d, x, y } } } }   — 내 방. 가구 자리는 **왼쪽(L) 날개 기준**으로 적고
//                                                                                    오른쪽 방에 살면 좌우를 뒤집어 그린다 (mirrorV — 옆모습 1 ↔ 3)
//   houseShared/<hk>       { side: { 사번: 'L'|'R' } (처음 들어올 때 무작위 · transaction),
//                            liv: { w, f } 거실 벽지 · 바닥지,
//                            rw: { 방 주인: { w, wa, f, fa } } 허용받은 동거인이 바꾼 그 방 벽지 · 바닥지 (방 주인이 나중에 바꾸면 그쪽) · '_x' 혼자 사는 집의 남는 방,
//                            allow: { 방 주인: 1 } 동거인에게 내 방 꾸미기를 허용,
//                            furn: { 열쇠: { t, d, x, y, by } } 거실 · 남는 방 · 허용받은 남의 방에 놓은 가구 (집 좌표 그대로 · by 가 산 사람) }
//   룸메이트가 바뀌면 hk 가 바뀐다 → 거실 · 남의 방 · 남는 방에 놓았던 가구는 새 집 기록에 없으니 저절로 보관함으로 돌아온다 (보관함 개수 = 산 개수 − 지금 집에 놓인 내 것)
//   예전 houseDeco/<사번> 은 처음 들어올 때 houseMine 으로 옮긴다 — 산 것(가구 · 벽지 · 바닥지)과 고른 벽지 · 바닥지는 내 방으로, 놓아 둔 가구는 보관함으로
//
// ■ 콘솔
//   houseRoomState()
(function houseRoom() {
'use strict';
const DIR = 'house/';
const N = 1032;                      // 그림 한 변 (도트)
const ADMIN = 'kario0987';
const SPEED = 78;                    // 1초에 몇 도트 — 광장(315 점/초 · 도트 한 칸 4 점)과 같은 빠르기
const SEND_MS = 150, BEAT_MS = 10000, STALE_MS = 40000;
const SPAWN = { x: 516, y: 662 };    // 가운데 복도 아래끝 (현관)
const WALL_P = 10000, FLOOR_P = 10000, WALLS = 6, FLOORS = 7;
const HEAD_TOP = 116;                // 사람 칸에서 머리 꼭대기 (옷장 그림 규격 · plaza.js 와 같다)
// 가구 — 차례는 그림의 줄 · 칸 (한 줄에 두 가지). p 값 · r 바닥에 닿는 몫 (그림 아래쪽에서 이만큼이 막히는 자리)
const FURN = [
    { n: '책장', p: 15000, r: 0.3 },      { n: '옷장', p: 20000, r: 0.3 },
    { n: '서랍장', p: 8000, r: 0.45 },    { n: '소파', p: 25000, r: 0.55 },
    { n: '1인 소파', p: 12000, r: 0.55 }, { n: '침대', p: 30000, r: 0.75 },
    { n: '식탁', p: 15000, r: 0.55 },     { n: '의자', p: 5000, r: 0.45 },
    { n: '스툴', p: 3000, r: 0.5 },       { n: 'TV', p: 30000, r: 0.35 },
    { n: '화장대', p: 18000, r: 0.35 },   { n: '낮은 탁자', p: 8000, r: 0.6 },
    { n: '스탠드 조명', p: 5000, r: 0.25 }, { n: '화분', p: 5000, r: 0.3 },
    { n: '냉장고', p: 25000, r: 0.3 },    { n: '싱크대', p: 20000, r: 0.45 },
    { n: '가스레인지', p: 15000, r: 0.45 }, { n: '욕조', p: 25000, r: 0.6 },
    { n: '세탁기', p: 20000, r: 0.4 },    { n: '변기', p: 10000, r: 0.5 }
];
// 가구 칸(120) 안에서 그림이 차지하는 자리 [x0, y0, x1, y1] — FB[가구][방향] (furn.webp 에서 잰 값)
const FB = [[[4,25,69,120],[0,4,24,120],[2,25,69,120],[0,4,24,120]],[[7,25,66,120],[0,8,24,120],[6,25,65,120],[0,8,24,120]],
    [[8,72,41,120],[0,66,21,120],[8,72,41,120],[3,66,24,120]],[[1,75,94,120],[1,40,42,120],[1,77,94,120],[6,40,45,120]],
    [[1,74,48,120],[6,73,39,120],[1,76,48,120],[9,73,42,120]],[[2,54,70,120],[1,55,69,120],[5,63,66,120],[3,55,71,120]],
    [[2,56,94,120],[9,28,61,120],[2,56,94,120],[9,28,61,120]],[[1,74,23,120],[0,74,24,120],[1,84,23,120],[0,74,24,120]],
    [[1,92,23,120],[1,92,23,120],[1,92,23,120],[1,92,23,120]],[[0,50,96,120],[0,24,24,120],[0,50,96,120],[0,24,24,120]],
    [[4,41,68,120],[0,38,24,120],[4,49,68,120],[0,38,24,120]],[[7,87,65,120],[9,62,38,120],[7,87,65,120],[10,62,39,120]],
    [[4,96,20,120],[4,96,20,120],[4,96,20,120],[4,96,20,120]],[[1,72,23,120],[1,72,23,120],[1,72,23,120],[1,72,23,120]],
    [[5,39,42,120],[6,39,43,120],[5,39,42,120],[6,39,43,120]],[[0,72,72,120],[0,44,24,120],[0,77,72,120],[0,44,24,120]],
    [[0,77,24,120],[0,74,22,120],[0,77,24,120],[2,74,24,120]],[[2,72,70,120],[4,58,44,120],[2,73,70,120],[4,45,44,120]],
    [[6,62,43,120],[0,52,34,120],[5,62,42,120],[14,52,48,120]],[[2,74,22,120],[0,74,28,120],[2,79,22,120],[20,74,48,120]]];
const DIRS = ['앞', '옆', '뒤', '옆'];
// 화면 배 (화면 점 / 도트) — 사람이 도트 한 칸에 고르게 찍히는 자리만 (광장의 K_STEP × 4)
const Z_STEP = [1, 4 / 3, 2, 8 / 3, 3, 4];
const VIEW_DOTS = 420;               // 창 높이에 이만큼의 도트가 들게 (광장과 사람 크기가 비슷해진다)
// 🔍 꾸밀 때 줌인 · 줌아웃 (2026-11-12 사용자 「꾸밀 때에는 줌인 줌아웃이 가능한 기능만」) — 이 배들 사이를 한 칸씩
//   ＋ · － 단추 · PC 마우스 휠 · 손가락 두 개로 벌리기 · 오므리기. 꾸미기를 닫으면 원래 배로 돌아간다.
const ZE = [0.5, 2 / 3, 1, 4 / 3, 2, 8 / 3, 3, 4];

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function now() { return Date.now(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function nameOf(u) { if (!u) return '?'; return (u.badge && u.badge.nickname) || u.name || u.code || '?'; }
function nameIn(code) { return nameOf(users()[code]) || code; }
function won(n) { return Number(n || 0).toLocaleString() + ' P'; }
function roomieOf(code) {
    const u = users()[code];
    const h = u && u.house;
    return (h && h.roomie) ? String(h.roomie) : null;
}
function isMate(a, b) { return !!(a && b && (roomieOf(a) === b || roomieOf(b) === a)); }

// ==========================================
// 걷는 곳 (walk.png)
// ==========================================
let MASK = null, BOUND = null, maskWait = null;
function loadMask() {
    if (MASK) return Promise.resolve(MASK);
    if (maskWait) return maskWait;
    maskWait = new Promise(function (ok, no) {
        const im = new Image();
        im.onload = function () {
            try {
                const c = document.createElement('canvas'); c.width = N; c.height = N;
                const g = c.getContext('2d'); g.drawImage(im, 0, 0);
                const px = g.getImageData(0, 0, N, N).data;
                const m = new Uint8Array(N * N);
                let x0 = N, x1 = 0, y0 = N, y1 = 0;
                for (let i = 0; i < N * N; i++) {
                    const v = px[i * 4];
                    m[i] = v > 200 ? 255 : (v > 60 ? 128 : 0);
                    if (m[i]) { const x = i % N, y = (i / N) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
                }
                MASK = m; BOUND = { x0: x0, x1: x1, y0: y0, y1: y1 };
                ok(m);
            } catch (e) { maskWait = null; no(e); }
        };
        im.onerror = function () { maskWait = null; no(new Error('walk')); };
        im.src = DIR + 'walk.png';
    });
    return maskWait;
}
function cellAt(x, y) { x = Math.round(x); y = Math.round(y); if (!MASK || x < 0 || y < 0 || x >= N || y >= N) return 0; return MASK[y * N + x]; }

// ==========================================
// 꾸민 것
// ==========================================
// ==========================================
// ★ 같이 쓰는 사택 (2026-11-12) — 자리 · 집 열쇠 · 보관함 · 방
// ==========================================
const Y0 = 395, X1 = 468, X2 = 564;          // 거실 아래끝 · 왼쪽 날개 오른끝 · 오른쪽 날개 왼끝 (walk.png 에서 잰 값 · 좌우가 1031 을 두고 똑같다)
const REGS = ['L', 'R', 'C'];
function regionAt(x, y) { if (y < Y0) return 'C'; if (x < X1) return 'L'; if (x >= X2) return 'R'; return 'C'; }
function mateOf(c) { c = String(c || ''); const r = roomieOf(c); return (r && roomieOf(r) === c) ? r : null; }   // 서로 가리키는 짝만
function hkOf(c) { c = String(c || ''); if (c.indexOf('_') >= 0) return c; const m = mateOf(c); return m ? [c, m].sort().join('_') : c; }
function membersOf(hk) { return String(hk || '').split('_').filter(Boolean); }
// 좌우 뒤집기 — 그림이 차지하는 칸을 가운데(1031) 를 두고 뒤집고 옆모습은 반대쪽 옆모습으로
function mirrorV(v) {
    const d2 = v.d === 1 ? 3 : (v.d === 3 ? 1 : v.d);
    const b = FB[v.t][v.d], b2 = FB[v.t][d2];
    return { t: v.t, d: d2, x: 1032 - v.x - b[2] - b2[0], y: v.y };
}
function me_() { const u = u_(); return u ? String(u.code) : ''; }
function shared() { return (S && S.sh) || {}; }
function mineOf(c) { return (S && S.md && S.md[c]) || {}; }
function sideOf(c) { const v = (shared().side || {})[c]; return (v === 'L' || v === 'R') ? v : null; }
function mySide() { return sideOf(me_()); }
function solo() { return !!(S && S.mem.length === 1); }
// 그 날개의 방 주인 — 사번 · 혼자 사는 집의 남는 날개는 '_x' · 아직 모르면 null
function ownerAt(reg) {
    if (!S || reg === 'C') return null;
    const c = S.mem.filter(function (m) { return sideOf(m) === reg; })[0];
    if (c) return c;
    return (solo() && sideOf(S.mem[0])) ? '_x' : null;
}
function clampSkin(v, n) { v = Number(v) || 1; return (v >= 1 && v <= n) ? v : 1; }
// 벽지 · 바닥지 — 자리마다 (k: 'w' | 'f')
function skinOf(reg, k) {
    const n = k === 'w' ? WALLS : FLOORS, sh = shared();
    if (reg === 'C') return clampSkin((sh.liv || {})[k], n);
    const o = ownerAt(reg);
    if (!o) return 1;
    const rw = (sh.rw || {})[o] || {};
    if (o === '_x') return clampSkin(rw[k], n);
    const a = mineOf(o).room || {};
    if (rw[k] && (Number(rw[k + 'a']) || 0) > (Number(a[k + 'a']) || 0)) return clampSkin(rw[k], n);   // 허용받은 동거인이 더 나중에 바꿨다
    return clampSkin(a[k], n);
}
function curReg() { return (S && S.region) || 'C'; }
function wallNo(reg) { return skinOf(reg || curReg(), 'w'); }
function floorNo(reg) { return skinOf(reg || curReg(), 'f'); }
function myStore() { return mineOf(me_()); }
function ownWall(n) { const d = myStore(); return n === 1 || !!(d.ow && d.ow[n]); }
function ownFloor(n) { const d = myStore(); return n === 1 || !!(d.of && d.of[n]); }
function normF(x) { x = x || {}; return { t: x.t | 0, d: (x.d | 0) & 3, x: Number(x.x) || 0, y: Number(x.y) || 0 }; }
// 지금 집에 놓인 가구 전부 — 두 사람의 방(왼쪽 기준 → 그 사람 자리로) + 같이 쓰는 자리
function furnList() {
    const out = [];
    if (!S) return out;
    S.mem.forEach(function (c) {
        const sd = sideOf(c); if (!sd) return;
        const f = (mineOf(c).room || {}).furn || {};
        Object.keys(f).forEach(function (k) {
            let v = normF(f[k]); if (v.t < 0 || v.t >= FURN.length) return;
            if (sd === 'R') v = mirrorV(v);
            v.id = 'm.' + c + '.' + k; v.src = 'm'; v.own = c; v.key = k;
            out.push(v);
        });
    });
    const sf = shared().furn || {};
    Object.keys(sf).forEach(function (k) {
        const x = sf[k] || {};
        const v = normF(x); if (v.t < 0 || v.t >= FURN.length) return;
        v.id = 's.' + k; v.src = 's'; v.own = String(x.by || ''); v.key = k;
        out.push(v);
    });
    return out;
}
function ownedOf(t) { const inv = myStore().inv || {}; return Math.max(0, Number(inv[t]) || 0); }
// 지금 집에 놓인 내 것 — 내 방(어느 집이든 따라온다) + 이 집의 같이 쓰는 자리에 내가 놓은 것
function placedOf(t) {
    const m = me_();
    let n = 0;
    const f = (myStore().room || {}).furn || {};
    Object.keys(f).forEach(function (k) { if ((f[k] && f[k].t | 0) === t) n++; });
    const sf = shared().furn || {};
    Object.keys(sf).forEach(function (k) { const x = sf[k]; if (x && String(x.by) === m && (x.t | 0) === t) n++; });
    return n;
}
function bbOf(v) { return FB[v.t][v.d]; }
function baseOf(v) { return v.y + bbOf(v)[3]; }                    // 발밑 (앞뒤 차례)
function footOf(v) {
    const b = bbOf(v), r = FURN[v.t].r;
    const h = Math.max(4, Math.round((b[3] - b[1]) * r));
    return { x0: v.x + b[0] + 2, x1: v.x + b[2] - 2, y0: v.y + b[3] - h, y1: v.y + b[3] - 1 };
}
function anchorOf(v) { const b = bbOf(v); return { x: v.x + (b[0] + b[2]) / 2, y: v.y + b[3] - 1 }; }
function placeOk(v) { const a = anchorOf(v); return cellAt(a.x, a.y) >= 128; }
// 내가 여기에 놓을 수 있나 — 내 방 · 거실 · (혼자면) 남는 방 · 동거인이 허용한 그 방
function canPlaceAt(reg) {
    if (!S || !S.member) return false;
    if (reg === 'C') return true;
    const sd = mySide(); if (!sd) return false;
    if (reg === sd) return true;
    const o = ownerAt(reg);
    if (o === '_x') return true;
    return !!(o && (shared().allow || {})[o]);
}
function placeOkMe(v) { const a = anchorOf(v); return placeOk(v) && canPlaceAt(regionAt(a.x, a.y)); }
function canTouch(v) { return !!(v && S && S.member && v.own === me_()); }                 // 내가 산 것만 옮기고 돌린다
function canPutAway(v) {                                                                   // + 내 방에 동거인이 놓은 것은 넣어(동거인 보관함으로) 줄 수 있다
    if (canTouch(v)) return true;
    if (!v || !S || !S.member || v.src !== 's') return false;
    const a = anchorOf(v); return regionAt(a.x, a.y) === mySide();
}
function regLabel(reg) {
    if (reg === 'C') return '거실';
    if (reg === mySide()) return '내 방';
    const o = ownerAt(reg);
    if (o === '_x') return '남는 방 (혼자 쓰는 동안)';
    if (o) return nameIn(o) + ' 사원의 방' + ((shared().allow || {})[o] ? ' (꾸미기 허용됨)' : '');
    return '방';
}
// 그 집 등급 — A 이상만 들어간다 (2026-11-12)
const GR = ['D', 'C', 'B', 'A', 'S', 'L'];
function gradeOf(hk) {
    let best = -1;
    membersOf(hk).forEach(function (c) {
        const x = users()[c] || ((u_() && String(u_().code) === c) ? u_() : null);
        let g = null;
        try { if (x && typeof houseGrade === 'function') g = houseGrade(x); } catch (e) { }
        if (!g && x && x.house) g = x.house.grade;
        best = Math.max(best, GR.indexOf(g || 'D'));
    });
    return GR[Math.max(0, best)];
}
function gradeOk(hk) { return GR.indexOf(gradeOf(hk)) >= GR.indexOf('A'); }
function blockedAt(x, y, skipId) {
    if (!S) return false;
    const L = S.flist || [];
    for (let i = 0; i < L.length; i++) {
        const v = L[i];
        if (v.id === skipId) continue;
        const f = footOf(v);
        if (x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return true;
    }
    return false;
}

// ==========================================
// 들어갈 수 있나 · 초대
// ==========================================
let INV = {};                   // 나를 초대한 집 { 집주인: { at, n } }
let invRef = null, invFirst = true, invMe = null;
function invListen() {
    const u = u_(), d = db_();
    if (!u || !d) return;
    if (invMe === u.code) return;
    if (invRef) { try { invRef.off(); } catch (e) { } }
    invMe = u.code; invFirst = true; INV = {};
    invRef = d.ref('houseInvited/' + u.code);
    invRef.on('value', function (s) {
        const v = s.val() || {};
        const was = INV;
        INV = (v && typeof v === 'object') ? v : {};
        if (!invFirst) {
            Object.keys(INV).forEach(function (h) {
                if (was[h]) return;
                try { if (typeof showCustomAlert === 'function') showCustomAlert('🏠 ' + (INV[h].n || nameIn(h)) + ' 사원이 사택에 초대했습니다.\n\n사택 → 「초대받은 사택」에서 들어갈 수 있습니다.'); } catch (e) { }
            });
        }
        invFirst = false;
        // 들어가 있던 집에서 초대가 거둬졌다
        if (S && !S.member && !S.mem.some(function (c) { return !!INV[c]; })) {
            leave(); try { if (typeof showCustomAlert === 'function') showCustomAlert('🏠 초대가 거둬져 사택에서 나왔습니다.'); } catch (e) { }
        }
        try { boxPaint(); } catch (e) { }
    });
}
setInterval(function () { try { invListen(); } catch (e) { } }, 2000);
function canEnter(hk) {
    const u = u_();
    if (!u || !hk) return false;
    const mem = membersOf(hk);
    if (mem.indexOf(String(u.code)) >= 0) return true;
    return mem.some(function (c) { return !!INV[c]; });         // 둘 중 누구에게든 초대받았다
}

// ==========================================
// 화면
// ==========================================
let S = null;
function css() {
    if (document.getElementById('hr-css')) return;
    const st = document.createElement('style');
    st.id = 'hr-css';
    st.textContent = [
        '#hr-ov{position:fixed;inset:0;z-index:999990;background:#0c0b0a;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;color:#eee;font-family:inherit;}',
        '#hr-view{position:absolute;inset:0;overflow:hidden;}',
        '#hr-world{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;}',
        '.hr-l{position:absolute;left:0;top:0;background-repeat:no-repeat;image-rendering:pixelated;pointer-events:none;}',
        // 자리마다 벽지 · 바닥지 (2026-11-12 같이 쓰는 사택) — 왼쪽 날개 · 오른쪽 날개 · 거실(위 큰 방 + 가운데 복도)
        '.rg-L{clip-path:polygon(0 38.2752%,45.3488% 38.2752%,45.3488% 100%,0 100%);}',
        '.rg-R{clip-path:polygon(54.6512% 38.2752%,100% 38.2752%,100% 100%,54.6512% 100%);}',
        '.rg-C{clip-path:polygon(0 0,100% 0,100% 38.2752%,54.6512% 38.2752%,54.6512% 100%,45.3488% 100%,45.3488% 38.2752%,0 38.2752%);}',
        '#hr-box .hr-b.go:disabled{opacity:.55;cursor:default;}',
        '#hr-box .note{font-size:11px;color:#c9a96a;margin-top:4px;}',
        '#hr-scene{position:absolute;left:0;top:0;}',
        '.hr-fu{position:absolute;background-repeat:no-repeat;image-rendering:pixelated;pointer-events:none;}',
        '#hr-ov.edit .hr-fu{pointer-events:auto;cursor:grab;}',
        '.hr-fu.sel{outline:2px dashed #ffd76a;outline-offset:-2px;filter:drop-shadow(0 0 4px #ffd76a);}',
        '.hr-fu.bad{filter:drop-shadow(0 0 4px #ff5252) saturate(.4);}',
        '.hr-one{position:absolute;left:0;top:0;pointer-events:none;}',
        '.hr-tag{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;font-weight:bold;color:#fff;text-shadow:0 0 3px #000,0 0 6px #000;}',
        '.hr-tag.me{color:#ffe08a;}',
        '.hr-bub{position:absolute;left:50%;transform:translateX(-50%);max-width:180px;white-space:normal;word-break:break-all;background:#fff;color:#111;font-size:12px;line-height:1.35;padding:4px 8px;border-radius:9px;box-shadow:0 2px 6px rgba(0,0,0,.5);text-align:center;}',
        '#hr-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:8px 10px;padding-top:max(8px,env(safe-area-inset-top));background:linear-gradient(#000c,#0000);z-index:5;pointer-events:none;}',
        '#hr-top>*{pointer-events:auto;}',
        '#hr-title{font-size:14px;font-weight:bold;text-shadow:0 0 4px #000;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#hr-title small{font-weight:normal;color:#bbb;font-size:11px;margin-left:6px;}',
        '.hr-b{background:rgba(20,18,14,.85);border:1px solid #6b5a36;color:#f2e6c9;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;white-space:nowrap;}',
        '.hr-b:active{transform:scale(.96);}',
        '.hr-b.on{background:#6b5a36;color:#fff;}',
        '.hr-b[disabled]{opacity:.45;cursor:default;}',
        '#hr-chat{position:absolute;left:8px;bottom:8px;bottom:max(8px,env(safe-area-inset-bottom));width:min(320px,60vw);z-index:5;}',
        '#hr-feed{font-size:11px;line-height:1.45;text-shadow:0 0 3px #000,0 0 5px #000;margin-bottom:4px;pointer-events:none;}',
        '#hr-feed b{color:#ffe08a;}',
        '#hr-in{width:100%;box-sizing:border-box;background:rgba(0,0,0,.6);border:1px solid #555;border-radius:8px;color:#fff;padding:7px 9px;font-size:13px;}',
        '#hr-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:#ccc;z-index:6;background:#0c0b0a;}',
        '#hr-joy{position:absolute;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);z-index:4;pointer-events:none;display:none;}',
        '#hr-joy i{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,255,255,.35);}',
        '#hr-edit{position:absolute;right:8px;bottom:8px;bottom:max(8px,env(safe-area-inset-bottom));width:min(360px,calc(100vw - 16px));max-height:min(62vh,420px);display:flex;flex-direction:column;background:rgba(18,16,13,.94);border:1px solid #6b5a36;border-radius:12px;z-index:6;box-shadow:0 6px 18px rgba(0,0,0,.6);}',
        '#hr-edit .tabs{display:flex;gap:6px;padding:8px 8px 4px;align-items:center;}',
        '#hr-edit .tabs .sp{flex:1;}',
        '#hr-edit .pts{font-size:11px;color:#d9c48a;padding:0 10px 4px;}',
        // 가구 칸 안 — 📦 내 가구(눌러서 놓기) / 🛒 가구 상점 (2026-11-12 사용자 「보유하고 있는 가구를 눌러서 꾸밀 수 있게」)
        '#hr-edit .sub{display:flex;gap:6px;padding:0 8px 4px;}',
        '#hr-edit .sub:empty{display:none;}',
        '#hr-edit .sub .hr-b{flex:1;padding:5px 6px;font-size:12px;}',
        // 가구를 놓는 동안(방에서 누르거나 · 내 가구에서 누르거나) 꾸미기 창은 닫힌다 — ✓ 놓기 · 📦 넣기 하면 다시 열린다
        //   (2026-11-12 사용자 「가구 놓을 때는 창이 닫히고, 가구만 옮겨서 놓을 수 있게」)
        '#hr-edit.mini{display:none;}',
        '#hr-hint{position:absolute;left:50%;bottom:52px;bottom:calc(max(8px,env(safe-area-inset-bottom)) + 44px);transform:translateX(-50%);z-index:6;display:none;background:rgba(0,0,0,.8);border:1px solid #6b5a36;color:#f3e3b5;padding:6px 12px;border-radius:9px;font-size:12px;pointer-events:none;white-space:nowrap;}',
        '#hr-ov.place #hr-hint{display:block;}',
        '#hr-ov.place #hr-joy{display:none !important;}',
        '.hr-card.tap{cursor:pointer;}',
        '.hr-card.tap:active{border-color:#ffd76a;background:rgba(255,215,106,.08);}',
        '.hr-card.done small{color:#8fd18f;}',
        '.hr-empty{grid-column:1/-1;color:#888;font-size:12px;text-align:center;padding:18px 6px;line-height:1.6;}',
        '#hr-edit .list{overflow:auto;padding:4px 8px 10px;display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:6px;}',
        '.hr-card{background:rgba(255,255,255,.05);border:1px solid #3b3427;border-radius:8px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;text-align:center;}',
        '.hr-card.cur{border-color:#ffd76a;}',
        '.hr-card .pic{width:72px;height:56px;display:flex;align-items:flex-end;justify-content:center;}',
        '.hr-card .pic i{display:block;background-repeat:no-repeat;image-rendering:pixelated;}',
        '.hr-card .th{width:72px;height:48px;border-radius:4px;background-size:cover;background-position:center;image-rendering:pixelated;}',
        '.hr-card small{color:#aaa;}',
        '.hr-card .row{display:flex;gap:4px;}',
        '.hr-card .hr-b{padding:3px 7px;font-size:11px;}',
        '#hr-tool{position:absolute;z-index:5;display:none;gap:4px;transform:translate(-50%,-100%);}',
        '#hr-zoom{position:absolute;right:8px;top:52px;top:calc(max(8px,env(safe-area-inset-top)) + 44px);z-index:5;display:none;align-items:center;gap:4px;}',
        '#hr-ov.edit #hr-zoom{display:flex;}',
        '#hr-zoom .hr-b{min-width:34px;font-size:16px;font-weight:bold;padding:3px 8px;}',
        '#hr-zoom span{font-size:11px;color:#f2e6c9;min-width:40px;text-align:center;text-shadow:0 0 3px #000;}',
        '#hr-tool .hr-b{padding:5px 8px;}',
        '.hr-modal{position:absolute;inset:0;z-index:9;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;}',
        '.hr-box{background:#1b1813;border:1px solid #6b5a36;border-radius:12px;padding:16px;min-width:240px;max-width:min(360px,90vw);max-height:80vh;display:flex;flex-direction:column;gap:10px;font-size:13px;line-height:1.6;}',
        '.hr-box .acts{display:flex;gap:8px;justify-content:center;}',
        '.hr-box input{background:#000;border:1px solid #555;border-radius:6px;color:#fff;padding:6px 8px;font-size:13px;}',
        '.hr-box .ul{overflow:auto;max-height:42vh;display:flex;flex-direction:column;gap:4px;}',
        '.hr-box .li{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;background:rgba(255,255,255,.04);}',
        '.hr-box .li span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#hr-box{background:linear-gradient(145deg,#1e1a14,#141110);border:1px solid #5a4a2a;border-radius:8px;padding:12px;margin-bottom:14px;}',
        '#hr-box .go{width:100%;padding:10px;font-size:14px;font-weight:bold;}',
        '#hr-box .sub{display:flex;flex-direction:column;gap:6px;margin-top:8px;}',
        '#hr-box .cap{font-size:10px;color:#888;font-weight:bold;margin-top:4px;}'
    ].join('\n');
    document.head.appendChild(st);
}

function pickZ() {
    const vh = (S && S.view) ? (S.view.clientHeight || 600) : 600;
    const want = vh / VIEW_DOTS;
    let best = Z_STEP[0];
    Z_STEP.forEach(function (z) { if (Math.abs(z - want) < Math.abs(best - want)) best = z; });
    return best;
}

function spec() { try { if (typeof window.dotSpec === 'function') return window.dotSpec(); } catch (e) { } return { W: 352, H: 384, FOOT: 32 }; }

function mkOne(user, label, other) {
    const sp = spec(), k = S.z / 4;
    const wrap = document.createElement('div');
    wrap.className = 'hr-one';
    const w = sp.W * k, h = sp.H * k;
    wrap.style.width = w + 'px'; wrap.style.height = h + 'px';
    let a = null;
    try { a = window.dotActor(user, { scale: k, all: !!other, calm: !!other }); wrap.appendChild(a.el); } catch (e) { a = null; }
    const tag = document.createElement('div');
    tag.className = 'hr-tag' + (other ? '' : ' me');
    tag.textContent = label;
    tag.style.bottom = ((sp.H - HEAD_TOP) * k + 3) + 'px';
    wrap.appendChild(tag);
    S.scene.appendChild(wrap);
    return { wrap: wrap, actor: a, tag: tag, w: w, h: h, foot: sp.FOOT * k, bub: null, bubAt: 0 };
}
function dropOne(o) { if (!o) return; try { if (o.actor) o.actor.stop(); } catch (e) { } try { o.wrap.remove(); } catch (e) { } }
function putOne(o, x, y) {
    const z = S.z;
    o.wrap.style.transform = 'translate3d(' + (x * z - o.w / 2).toFixed(1) + 'px,' + (y * z - (o.h - o.foot)).toFixed(1) + 'px,0)';
    o.wrap.style.zIndex = String(Math.round(y) * 2 + 1);
}
function bubble(o, text) {
    if (!o) return;
    if (o.bub) { o.bub.remove(); o.bub = null; }
    if (!text) return;
    const b = document.createElement('div');
    b.className = 'hr-bub';
    b.textContent = text;
    b.style.bottom = (parseFloat(o.tag.style.bottom) + 18) + 'px';
    o.wrap.appendChild(b);
    o.bub = b; o.bubAt = now();
}
function feed(who, text) {
    if (!S) return;
    S.lines.push({ who: who, text: text });
    if (S.lines.length > 5) S.lines.shift();
    const el = S.ov.querySelector('#hr-feed');
    if (el) el.innerHTML = S.lines.map(function (l) { return '<div><b>' + esc(l.who) + '</b> ' + esc(l.text) + '</div>'; }).join('');
}

// ==========================================
// 들어가기 · 나가기
// ==========================================
function enter(host) {
    const u = u_(), d = db_();
    if (!u) return;
    const hk = hkOf(host || u.code);                       // 사번을 받아도 그 사람이 사는 집(룸메이트와 같이)으로
    if (!canEnter(hk)) { try { showCustomAlert('🏠 그 사택에는 들어갈 수 없습니다.\n(사는 사원 · 초대받은 사원만)'); } catch (e) { } return; }
    if (!gradeOk(hk)) { try { showCustomAlert('🏠 사택 안은 A 등급 이상 사택부터 들어갈 수 있습니다.\n(지금 ' + gradeOf(hk) + ' 등급)'); } catch (e) { } return; }
    if (typeof window.dotActor !== 'function') { try { showCustomAlert('🏠 사람 그림을 아직 못 불렀습니다. 잠시 뒤에 다시 해 주십시오.'); } catch (e) { } return; }
    if (S) leave();
    css();
    const ov = document.createElement('div');
    ov.id = 'hr-ov';
    const mem = membersOf(hk), mine = mem.indexOf(String(u.code)) >= 0;
    ov.innerHTML = '<div id="hr-view"><div id="hr-world">'
        + '<div class="hr-l rg-L" id="hr-floor-L"></div><div class="hr-l rg-R" id="hr-floor-R"></div><div class="hr-l rg-C" id="hr-floor-C"></div>'
        + '<div class="hr-l rg-L" id="hr-wall-L"></div><div class="hr-l rg-R" id="hr-wall-R"></div><div class="hr-l rg-C" id="hr-wall-C"></div>'
        + '<div class="hr-l" id="hr-frame"></div><div id="hr-scene"></div>'
        + '</div></div>'
        + '<div id="hr-top"><div id="hr-title"></div>'
        + (mine ? '<button class="hr-b" data-k="allow" style="display:none"></button><button class="hr-b" data-k="edit">🛠 꾸미기</button><button class="hr-b" data-k="inv">💌 초대</button>' : '')
        + '<button class="hr-b" data-k="x">✕ 나가기</button></div>'
        + '<div id="hr-chat"><div id="hr-feed"></div><input id="hr-in" maxlength="60" placeholder="말하기 (Enter)" autocomplete="off"></div>'
        + '<div id="hr-tool"><button class="hr-b" data-t="rot">↻ 돌리기</button><button class="hr-b" data-t="put">📦 넣기</button><button class="hr-b on" data-t="ok">✓ 놓기</button></div>'
        + '<div id="hr-hint">어디를 끌어도 가구가 따라 움직입니다 · ✓ 놓기</div>'
        + '<div id="hr-joy"><i></i></div>'
        + (mine ? '<div id="hr-zoom"><button class="hr-b" data-z="-1">－</button><span></span><button class="hr-b" data-z="1">＋</button></div>' : '')
        + '<div id="hr-load">🏠 사택에 들어가는 중…</div>';
    document.body.appendChild(ov);
    S = {
        host: hk, hk: hk, mem: mem, member: mine, mine: mine, md: {}, sh: {}, migr: {}, region: 'C', ov: ov, view: ov.querySelector('#hr-view'), world: ov.querySelector('#hr-world'),
        scene: ov.querySelector('#hr-scene'), z: 1, deco: {}, flist: [], fel: {}, peers: {}, lines: [],
        x: SPAWN.x, y: SPAWN.y, f: 1, moving: false, keys: {}, joy: null, drag: null, sel: null, edit: false,
        sx: -1, sy: -1, sMoving: false, sFace: 0, sent: 0, say: '', sayAt: 0, sSayAt: 0, last: now(), raf: 0, refs: []
    };
    const s0 = S;
    loadMask().then(function () {
        if (S !== s0) return;
        build();
        listen();
        const ld = ov.querySelector('#hr-load'); if (ld) ld.remove();
        loop();
    }).catch(function () {
        if (S !== s0) return;
        const ld = ov.querySelector('#hr-load'); if (ld) ld.textContent = '사택 그림을 불러오지 못했습니다. ✕ 를 눌러 나가 주십시오.';
    });
    // 단추
    ov.querySelector('[data-k="x"]').onclick = function () { leave(); };
    const eb = ov.querySelector('[data-k="edit"]'); if (eb) eb.onclick = function () { editToggle(); };
    const ib = ov.querySelector('[data-k="inv"]'); if (ib) ib.onclick = function () { inviteModal(); };
    const ab = ov.querySelector('[data-k="allow"]'); if (ab) ab.onclick = function () { allowToggle(); };
    ov.querySelectorAll('#hr-tool [data-t]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); toolDo(b.getAttribute('data-t')); }; });
    ov.querySelectorAll('#hr-zoom [data-z]').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); zoomStep(Number(b.getAttribute('data-z'))); }; });
    const inp = ov.querySelector('#hr-in');
    inp.onkeydown = function (e) {
        e.stopPropagation();
        if (e.key === 'Enter') { const t = inp.value.trim(); inp.value = ''; if (t) say(t); inp.blur(); }
        if (e.key === 'Escape') inp.blur();
    };
    // 자판
    S.onKey = function (e) {
        if (!S) return;
        const tg = e.target && e.target.tagName;
        if (tg === 'INPUT' || tg === 'TEXTAREA') return;
        const k = KEY[e.key];
        if (!k) { if (e.key === 'Enter') { inp.focus(); e.preventDefault(); } return; }
        S.keys[k] = (e.type === 'keydown');
        e.preventDefault();
    };
    window.addEventListener('keydown', S.onKey);
    window.addEventListener('keyup', S.onKey);
    S.onBlur = function () { if (S) S.keys = {}; };
    window.addEventListener('blur', S.onBlur);
    S.onSize = function () { if (S && S.built && !(S.edit && S.zEdit)) { const z = pickZ(); if (z !== S.z) rebuildScale(); } };
    window.addEventListener('resize', S.onSize);
    pointerSetup();
}
const KEY = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l', d: 'r', w: 'u', s: 'd', A: 'l', D: 'r', W: 'u', S: 'd' };

function leave() {
    const s = S;
    if (!s) return;
    S = null;
    try { cancelAnimationFrame(s.raf); } catch (e) { }
    s.refs.forEach(function (r) { try { r.off(); } catch (e) { } });
    try { if (s.myRef) { s.myRef.onDisconnect().cancel(); s.myRef.remove(); } } catch (e) { }
    try { window.removeEventListener('keydown', s.onKey); window.removeEventListener('keyup', s.onKey); window.removeEventListener('blur', s.onBlur); window.removeEventListener('resize', s.onSize); } catch (e) { }
    Object.keys(s.peers).forEach(function (c) { dropOne(s.peers[c].one); });
    if (s.me) dropOne(s.me);
    try { s.ov.remove(); } catch (e) { }
}

function build() {
    const z = S.z = (S.edit && S.zEdit) ? S.zEdit : pickZ();
    const W = N * z;
    S.world.style.width = W + 'px'; S.world.style.height = W + 'px';
    S.ov.querySelectorAll('#hr-world .hr-l').forEach(function (el) {
        el.style.width = W + 'px'; el.style.height = W + 'px'; el.style.backgroundSize = W + 'px ' + W + 'px';
    });
    S.ov.querySelector('#hr-frame').style.backgroundImage = 'url("' + DIR + 'frame.webp")';
    paintDeco();
    const u = u_();
    S.me = mkOne(u, nameOf(u), false);
    try { S.me.actor.face(1); } catch (e) { }
    putOne(S.me, S.x, S.y);
    S.built = true;
    title();
}
function rebuildScale() {
    Object.keys(S.peers).forEach(function (c) { dropOne(S.peers[c].one); S.peers[c].one = null; });
    if (S.me) dropOne(S.me);
    Object.keys(S.fel).forEach(function (id) { S.fel[id].remove(); });
    S.fel = {};
    build();
    peersPaint(S.room || {});
    if (S.sel) select(S.sel);
}

function title() {
    if (!S) return;
    const el = S.ov.querySelector('#hr-title'); if (!el) return;
    const n = 1 + Object.keys(S.peers).filter(function (c) { return S.peers[c].one; }).length;
    const ttl = S.member ? (S.mem.length > 1 ? '우리 사택 · ' + S.mem.map(nameIn).join(' · ') : '내 사택') : (S.mem.map(nameIn).join(' · ') + ' 사원의 사택');
    el.innerHTML = '🏠 ' + esc(ttl) + '<small>' + n + '명</small>';
}

// ==========================================
// 꾸민 것 칠하기
// ==========================================
function paintDeco() {
    if (!S || !S.built && !S.world) return;
    REGS.forEach(function (r) {
        const fl = S.ov.querySelector('#hr-floor-' + r), wl = S.ov.querySelector('#hr-wall-' + r);
        const fu = 'url("' + DIR + 'floor' + skinOf(r, 'f') + '.webp")', wu = 'url("' + DIR + 'wall' + skinOf(r, 'w') + '.webp")';
        if (fl && fl.style.backgroundImage !== fu) fl.style.backgroundImage = fu;
        if (wl && wl.style.backgroundImage !== wu) wl.style.backgroundImage = wu;
    });
    S.flist = furnList();
    const z = S.z, seen = {};
    S.flist.forEach(function (v) {
        seen[v.id] = 1;
        if (S.drag && S.drag.id === v.id) return;             // 끄는 중인 것은 손에 맡긴다
        let el = S.fel[v.id];
        if (!el) {
            el = document.createElement('div');
            el.className = 'hr-fu';
            el.setAttribute('data-id', v.id);
            el.style.backgroundImage = 'url("' + DIR + 'furn.webp")';
            S.scene.appendChild(el);
            S.fel[v.id] = el;
        }
        furnPaint(el, v);
    });
    Object.keys(S.fel).forEach(function (id) { if (!seen[id]) { S.fel[id].remove(); delete S.fel[id]; if (S.sel === id) select(null); } });
    if (S.editEl) editPaint();
    allowPaint();
}
function furnPaint(el, v) {
    const z = S.z, r = (v.t / 2) | 0, c = (v.t % 2) * 4 + v.d;
    el.style.width = (120 * z) + 'px'; el.style.height = (120 * z) + 'px';
    el.style.backgroundSize = (960 * z) + 'px ' + (1200 * z) + 'px';
    el.style.backgroundPosition = '-' + (c * 120 * z) + 'px -' + (r * 120 * z) + 'px';
    el.style.transform = 'translate3d(' + (v.x * z) + 'px,' + (v.y * z) + 'px,0)';
    el.style.zIndex = String(Math.round(baseOf(v)) * 2);
    el.classList.toggle('sel', S.sel === v.id);
    el.classList.toggle('bad', canTouch(v) ? !placeOkMe(v) : false);
}

// ==========================================
// 서버
// ==========================================
function listen() {
    const d = db_(), u = u_();
    if (!d || !u) return;
    S.mem.forEach(function (c) {                          // 사는 두 사람의 보관함 · 방
        const r = d.ref('houseMine/' + c);
        r.on('value', function (s) { if (!S) return; const v = s.val(); S.md[c] = v || {}; if (!v) migrate(c); paintDeco(); });
        S.refs.push(r);
    });
    const sr = d.ref('houseShared/' + S.hk);             // 같이 쓰는 자리
    sr.on('value', function (s) { if (!S) return; S.sh = s.val() || {}; ensureSides(); paintDeco(); });
    S.refs.push(sr);
    const rr = d.ref('houseRoom/' + S.hk);
    rr.on('value', function (s) { if (!S) return; S.room = s.val() || {}; peersPaint(S.room); });
    S.refs.push(rr);
    S.myRef = d.ref('houseRoom/' + S.hk + '/' + u.code);
    try { S.myRef.onDisconnect().remove(); } catch (e) { }
    S.sent = 0;
    send(false, true);
}
// 왼쪽 · 오른쪽 — 처음 들어온 사람이 무작위로 정한다 (둘이 동시에 들어와도 한 번만 · transaction)
function ensureSides() {
    if (!S || !S.member || S.sideBusy) return;
    const mem = S.mem.slice(), cur = shared().side || {};
    if (mem.every(function (c) { return cur[c] === 'L' || cur[c] === 'R'; })) return;
    const r = shRef('side'); if (!r) return;
    S.sideBusy = true;
    const s0 = S;
    r.transaction(function (c) {
        if (c && mem.every(function (m) { return c[m] === 'L' || c[m] === 'R'; })) return;
        const flip = Math.random() < 0.5, o = {};
        o[mem[0]] = flip ? 'R' : 'L';
        if (mem[1]) o[mem[1]] = flip ? 'L' : 'R';
        return o;
    }, function () { s0.sideBusy = false; });
}
// 예전 houseDeco/<사번> → houseMine/<사번> (산 것 · 고른 벽지 · 바닥지는 내 방으로 · 놓아 둔 가구는 보관함으로)
function migrate(c) {
    if (!S || !S.member || S.migr[c]) return;
    S.migr[c] = 1;
    const d = db_(); if (!d) return;
    d.ref('houseDeco/' + c).once('value').then(function (s) {
        const o = s.val();
        if (!o || typeof o !== 'object') return;
        const nv = { room: { w: Number(o.w) || 1, f: Number(o.f) || 1, wa: 1, fa: 1 }, from: 'houseDeco' };
        if (o.inv) nv.inv = o.inv; if (o.ow) nv.ow = o.ow; if (o.of) nv.of = o.of;
        return d.ref('houseMine/' + c).transaction(function (cur) { return cur ? undefined : nv; });
    }).catch(function () { });
}
function send(moving, force) {
    if (!S || !S.myRef) return;
    const t = now();
    const face = S.me && S.me.actor ? S.me.actor.facing() : S.f;
    const changed = Math.abs(S.x - S.sx) > 0.5 || Math.abs(S.y - S.sy) > 0.5 || moving !== S.sMoving || face !== S.sFace || S.sayAt !== S.sSayAt;
    const stopping = !moving && S.sMoving;
    if (!force && !stopping && t - S.sent < BEAT_MS && (!changed || t - S.sent < SEND_MS)) return;
    S.sent = t; S.sx = S.x; S.sy = S.y; S.sMoving = moving; S.sFace = face; S.sSayAt = S.sayAt;
    const u = u_(); if (!u) return;
    let dot = null;
    try { dot = (typeof window.dotShownDot === 'function' ? window.dotShownDot(u) : u.dot) || null; } catch (e) { dot = u.dot || null; }
    try {
        S.myRef.set({ n: nameOf(u), x: Math.round(S.x), y: Math.round(S.y), f: face, m: moving ? 1 : 0, d: dot,
                      s: S.say || null, st: S.sayAt || 0, at: t });
    } catch (e) { }
}
function peersPaint(room) {
    if (!S || !S.built) return;
    const u = u_(); if (!u) return;
    const t = now(), seen = {};
    Object.keys(room || {}).forEach(function (c) {
        if (c === u.code) return;
        const v = room[c] || {};
        if (t - (Number(v.at) || 0) > STALE_MS + BEAT_MS) return;
        seen[c] = 1;
        let p = S.peers[c];
        if (!p) { p = S.peers[c] = { x: Number(v.x) || SPAWN.x, y: Number(v.y) || SPAWN.y, one: null, st: 0, dk: '' }; }
        const dk = JSON.stringify(v.d || {});
        if (!p.one || p.dk !== dk) {
            if (p.one) dropOne(p.one);
            p.one = mkOne({ code: c, dot: v.d || {} }, v.n || nameIn(c), true);
            p.dk = dk;
            p.x = Number(v.x) || p.x; p.y = Number(v.y) || p.y;
            putOne(p.one, p.x, p.y);
        }
        p.tx = Number(v.x) || p.x; p.ty = Number(v.y) || p.y; p.m = !!v.m; p.at = Number(v.at) || t;
        try { if (p.one.actor) { p.one.actor.face(v.f || 1); } } catch (e) { }
        if (v.st && v.st !== p.st) {
            if (p.st && v.s) { bubble(p.one, v.s); feed(v.n || nameIn(c), v.s); }
            else if (!p.st && v.s && t - v.st < 8000) { bubble(p.one, v.s); feed(v.n || nameIn(c), v.s); }
            p.st = v.st;
        }
    });
    Object.keys(S.peers).forEach(function (c) { if (!seen[c]) { dropOne(S.peers[c].one); delete S.peers[c]; } });
    title();
}
function say(text) {
    if (!S) return;
    S.say = text.slice(0, 60); S.sayAt = now();
    bubble(S.me, S.say);
    feed(nameOf(u_()), S.say);
    send(S.moving, true);
}

// ==========================================
// 걷기
// ==========================================
function loop() {
    if (!S) return;
    const t = now();
    const dt = Math.min(0.05, (t - S.last) / 1000);
    S.last = t;
    let dx = 0, dy = 0;
    if (S.keys.l) dx -= 1; if (S.keys.r) dx += 1; if (S.keys.u) dy -= 1; if (S.keys.d) dy += 1;
    let mag = 1;
    if (S.joy && (S.joy.dx || S.joy.dy)) { dx = S.joy.dx; dy = S.joy.dy; mag = Math.min(1, Math.hypot(dx, dy)); }
    if (S.edit && S.sel) { dx = 0; dy = 0; }                 // 가구를 놓는 동안엔 가구만 움직인다
    const len = Math.hypot(dx, dy);
    let moving = false;
    if (len > 0.08) {
        const v = SPEED * dt * mag / len;
        const nx = S.x + dx * v, ny = S.y + dy * v;
        const ok = function (x, y) { return cellAt(x, y) === 255 && !(blockedAt(x, y) && !blockedAt(S.x, S.y)); };
        if (ok(nx, ny)) { S.x = nx; S.y = ny; moving = true; }
        else if (Math.abs(dx) > 0.01 && ok(nx, S.y)) { S.x = nx; moving = true; }
        else if (Math.abs(dy) > 0.01 && ok(S.x, ny)) { S.y = ny; moving = true; }
        if (S.me && S.me.actor && Math.abs(dx) > 0.15) S.me.actor.face(dx < 0 ? 1 : -1);
    }
    if (S.me) {
        if (S.me.actor && moving !== S.moving) S.me.actor.moving(moving);
        putOne(S.me, S.x, S.y);
        if (S.me.bub && t - S.me.bubAt > 6000) bubble(S.me, null);
    }
    S.moving = moving;
    if (moving && S.focus) S.focus = null;
    // 지금 서 있는 자리(내 방 · 거실 · 남의 방) — 벽지 · 바닥지 칸과 「룸메 꾸미기 허용」 단추가 이것을 따른다
    const reg = regionAt(S.x, S.y);
    if (reg !== S.region) { S.region = reg; if (S.editEl && editTab !== 'furn') editPaint(); allowPaint(); }
    // 룸메이트가 바뀌었다 (월요일 재배정 등) — 집이 달라졌으니 나온다
    if (S.member && t - (S.hkAt || 0) > 3000) {
        S.hkAt = t;
        const nk = hkOf(me_());
        if (nk !== S.hk) { leave(); try { showCustomAlert('🏠 룸메이트가 바뀌어 사택에서 나왔습니다. 다시 들어가 주십시오.'); } catch (e) { } return; }
    }
    // 남 — 받은 자리로 다가간다
    Object.keys(S.peers).forEach(function (c) {
        const p = S.peers[c]; if (!p.one) return;
        const ddx = (p.tx - p.x), ddy = (p.ty - p.y), d = Math.hypot(ddx, ddy);
        const walking = d > 0.6 || p.m;
        if (d > 60) { p.x = p.tx; p.y = p.ty; }
        else if (d > 0.3) { const st = Math.min(d, SPEED * 1.25 * dt); p.x += ddx / d * st; p.y += ddy / d * st; }
        if (p.one.actor && walking !== p.walk) { p.one.actor.moving(walking); p.walk = walking; }
        putOne(p.one, p.x, p.y);
        if (p.one.bub && t - p.one.bubAt > 6000) bubble(p.one, null);
    });
    camera();
    toolPlace();
    send(moving);
    S.raf = requestAnimationFrame(loop);
}
// 화면 가운데 — 보통은 나 · 끄는 동안은 끌기 시작한 자리 · 내 가구에서 놓인 것을 고르면 그 가구 (걸으면 다시 나)
function camAt() {
    if (S.drag && S.drag.cam) return S.drag.cam;
    if (S.edit && S.sel && S.focus) return S.focus;
    return { x: S.x, y: S.y };
}
function camera() {
    const z = S.z, vw = S.view.clientWidth || 800, vh = S.view.clientHeight || 600;
    const b = BOUND || { x0: 0, x1: N, y0: 0, y1: N };
    const cx0 = (b.x0 - 24) * z, cx1 = (b.x1 + 24) * z, cy0 = (b.y0 - 24) * z, cy1 = (b.y1 + 40) * z;
    const f = camAt(), fx = f.x, fy = f.y;
    let tx, ty;
    if (cx1 - cx0 <= vw) tx = (vw - (cx0 + cx1)) / 2; else tx = Math.max(vw - cx1, Math.min(-cx0, vw / 2 - fx * z));
    if (cy1 - cy0 <= vh) ty = (vh - (cy0 + cy1)) / 2; else ty = Math.max(vh - cy1, Math.min(-cy0, vh / 2 - (fy - 30) * z));
    tx = Math.round(tx); ty = Math.round(ty);
    if (tx !== S.tx || ty !== S.ty) { S.tx = tx; S.ty = ty; S.world.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)'; }
}
function toWorld(cx, cy) {
    const r = S.view.getBoundingClientRect();
    return { x: (cx - r.left - (S.tx || 0)) / S.z, y: (cy - r.top - (S.ty || 0)) / S.z };
}

// 🔍 꾸밀 때 줌 — 한 칸씩 (ZE)
function zoomLabel() {
    if (!S) return;
    const sp = S.ov.querySelector('#hr-zoom span'); if (!sp) return;
    const base = pickZ();
    sp.textContent = Math.round((S.z / base) * 100) + '%';
    const i = ZE.indexOf(S.z);
    const a = S.ov.querySelector('#hr-zoom [data-z="-1"]'), b = S.ov.querySelector('#hr-zoom [data-z="1"]');
    if (a) a.disabled = i === 0; if (b) b.disabled = i === ZE.length - 1;
}
function zoomStep(dir) {
    if (!S || !S.edit || !S.built) return;
    let i = ZE.indexOf(S.z);
    if (i < 0) { i = 0; ZE.forEach(function (z, k) { if (Math.abs(z - S.z) < Math.abs(ZE[i] - S.z)) i = k; }); }
    const ni = Math.max(0, Math.min(ZE.length - 1, i + (dir > 0 ? 1 : -1)));
    if (ZE[ni] === S.z) { zoomLabel(); return; }
    S.zEdit = ZE[ni];
    rebuildScale();
    zoomLabel();
}

// 짚어 끄는 조이스틱 · 꾸미기 중에는 가구를 끈다
function pointerSetup() {
    const view = S.view, joyEl = S.ov.querySelector('#hr-joy');
    // 손가락 두 개 — 꾸미는 중에만 줌 (벌리면 ＋ · 오므리면 －)
    const touches = {};
    view.addEventListener('wheel', function (e) {
        if (!S || !S.edit) return;
        e.preventDefault();
        const t = now();
        if (t - (S.wheelAt || 0) < 140) return;
        S.wheelAt = t;
        zoomStep(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });
    view.addEventListener('pointerdown', function (e) {
        if (!S || !S.built) return;
        if (e.pointerType === 'touch') touches[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (S.edit && Object.keys(touches).length === 2 && !S.drag) {
            const k = Object.keys(touches);
            S.pinch = { d: Math.hypot(touches[k[0]].x - touches[k[1]].x, touches[k[0]].y - touches[k[1]].y) || 1 };
            if (S.joy) { S.joy = null; joyEl.style.display = 'none'; }
            return;
        }
        const inp = S.ov.querySelector('#hr-in'); if (inp && document.activeElement === inp) inp.blur();
        if (S.edit) {
            const el = e.target && e.target.closest ? e.target.closest('.hr-fu') : null;
            {
                // 가구를 누르면 그 가구 · 놓는 중에 빈 곳을 누르면 고른 가구 — 끄는 만큼 가구만 움직인다 (사람은 안 걷는다)
                //   남이 산 가구는 고르지 않는다 (내 방에 동거인이 놓은 것은 골라서 📦 넣기만)
                let v = el ? S.flist.find(function (q) { return q.id === el.getAttribute('data-id'); }) : null;
                if (v && !(canTouch(v) || canPutAway(v))) v = null;
                if (!v && S.sel) { v = S.flist.find(function (q) { return q.id === S.sel; }) || null; if (!v) select(null); }
                if (v) {
                    if (S.sel !== v.id) select(v.id);
                    if (canTouch(v)) {
                        const w = toWorld(e.clientX, e.clientY);
                        S.drag = { id: v.id, pid: e.pointerId, ox: w.x - v.x, oy: w.y - v.y, v: Object.assign({}, v), x0: v.x, y0: v.y, moved: false, cam: camAt() };
                        try { view.setPointerCapture(e.pointerId); } catch (er) { }
                    }
                    e.preventDefault();
                    return;
                }
            }
        }
        S.joy = { pid: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, mouse: e.pointerType === 'mouse' };
        if (!S.joy.mouse) { joyEl.style.display = 'block'; joyEl.style.left = e.clientX + 'px'; joyEl.style.top = e.clientY + 'px'; joyEl.firstChild.style.transform = ''; }
        try { view.setPointerCapture(e.pointerId); } catch (er) { }
    });
    view.addEventListener('pointermove', function (e) {
        if (!S) return;
        if (touches[e.pointerId]) { touches[e.pointerId].x = e.clientX; touches[e.pointerId].y = e.clientY; }
        if (S.pinch) {
            const k = Object.keys(touches);
            if (k.length >= 2) {
                const d = Math.hypot(touches[k[0]].x - touches[k[1]].x, touches[k[0]].y - touches[k[1]].y) || 1;
                if (d / S.pinch.d > 1.3) { zoomStep(1); S.pinch.d = d; }
                else if (d / S.pinch.d < 0.77) { zoomStep(-1); S.pinch.d = d; }
            }
            return;
        }
        if (S.drag && S.drag.pid === e.pointerId) {
            const w = toWorld(e.clientX, e.clientY);
            const v = S.drag.v;
            v.x = Math.round(w.x - S.drag.ox); v.y = Math.round(w.y - S.drag.oy);
            S.drag.moved = true;
            const el = S.fel[v.id]; if (el) furnPaint(el, v);
            return;
        }
        if (S.joy && S.joy.pid === e.pointerId) {
            const R = 40;
            let dx = (e.clientX - S.joy.x0) / R, dy = (e.clientY - S.joy.y0) / R;
            const m = Math.hypot(dx, dy);
            if (m > 1) { dx /= m; dy /= m; }
            if (m < 0.18) { dx = 0; dy = 0; }
            S.joy.dx = dx; S.joy.dy = dy;
            if (!S.joy.mouse) joyEl.firstChild.style.transform = 'translate(' + (dx * 26) + 'px,' + (dy * 26) + 'px)';
        }
    });
    const up = function (e) {
        delete touches[e.pointerId];
        if (!S) return;
        if (S.pinch) { if (Object.keys(touches).length < 2) S.pinch = null; return; }
        if (S.drag && S.drag.pid === e.pointerId) {
            const dg = S.drag; S.drag = null;
            const v = dg.v;
            if (dg.moved) {
                if (placeOkMe(v)) furnWrite(v);
                else {
                    const a0 = anchorOf(v), bad = placeOk(v) ? regLabel(regionAt(a0.x, a0.y)) : '';
                    v.x = dg.x0; v.y = dg.y0; const el = S.fel[v.id]; if (el) furnPaint(el, v);
                    toast(bad ? bad + '에는 놓을 수 없습니다' : '집 밖에는 놓을 수 없습니다');
                }
                // 놓는 동안엔 사람이 안 걸으므로 — 가구가 화면 가장자리로 가면 화면을 가구 쪽으로 옮겨 더 끌 수 있게
                const a = anchorOf(v), vw = S.view.clientWidth || 800, vh = S.view.clientHeight || 600;
                const sx = a.x * S.z + (S.tx || 0), sy = a.y * S.z + (S.ty || 0);
                if (sx < vw * 0.2 || sx > vw * 0.8 || sy < vh * 0.22 || sy > vh * 0.78) S.focus = { x: a.x, y: a.y };
                else S.focus = dg.cam;                               // 그대로 — 끌기 전 화면을 붙든다
            }
            return;
        }
        if (S.joy && S.joy.pid === e.pointerId) { S.joy = null; joyEl.style.display = 'none'; }
    };
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
}

// ==========================================
// 꾸미기 (집주인만)
// ==========================================
let editTab = 'furn';
let furnSub = null;            // 가구 칸 — 'own' 내 가구 · 'shop' 가구 상점 (처음엔 산 가구가 있으면 내 가구)
function ownCount() { let n = 0; FURN.forEach(function (f, t) { n += ownedOf(t); }); return n; }
function editToggle() {
    if (!S || !S.mine) return;
    S.edit = !S.edit;
    S.ov.classList.toggle('edit', S.edit);
    const b = S.ov.querySelector('[data-k="edit"]'); if (b) b.classList.toggle('on', S.edit);
    if (!S.edit) {
        select(null); if (S.editEl) { S.editEl.remove(); S.editEl = null; }
        if (S.zEdit) { S.zEdit = null; if (pickZ() !== S.z) rebuildScale(); }     // 꾸미기를 닫으면 원래 배로
        S.pinch = null;
        return;
    }
    S.zEdit = S.z;
    zoomLabel();
    const el = document.createElement('div');
    el.id = 'hr-edit';
    el.innerHTML = '<div class="tabs"><button class="hr-b" data-tab="furn">🛋 가구</button><button class="hr-b" data-tab="wall">🧱 벽지</button><button class="hr-b" data-tab="floor">🟫 바닥지</button><span class="sp"></span><button class="hr-b" data-tab="x">닫기</button></div>'
        + '<div class="pts"></div><div class="sub"></div><div class="list"></div>';
    S.ov.appendChild(el);
    S.editEl = el;
    el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    el.querySelectorAll('[data-tab]').forEach(function (b) {
        b.onclick = function () { const k = b.getAttribute('data-tab'); if (k === 'x') { editToggle(); return; } editTab = k; if (S.sel) select(null); editPaint(); };
    });
    editPaint();
}
function picCss(t, box) {
    const b = FB[t][0], r = (t / 2) | 0, c = (t % 2) * 4;
    const bw = b[2] - b[0], bh = b[3] - b[1];
    const s = Math.min(box / bw, (box * 0.78) / bh, 1.5);
    return 'width:' + (bw * s).toFixed(1) + 'px;height:' + (bh * s).toFixed(1) + 'px;background-image:url(' + DIR + 'furn.webp);background-size:' + (960 * s).toFixed(1) + 'px ' + (1200 * s).toFixed(1) + 'px;background-position:-' + ((c * 120 + b[0]) * s).toFixed(1) + 'px -' + ((r * 120 + b[1]) * s).toFixed(1) + 'px;';
}
function editPaint() {
    if (!S || !S.editEl) return;
    const el = S.editEl, u = u_();
    el.querySelectorAll('[data-tab]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === editTab); });
    const list = el.querySelector('.list'), sub = el.querySelector('.sub');
    const pts = '보유 ' + won(Math.floor(Number(u && u.points) || 0));
    let h = '';
    if (editTab === 'furn') {
        const ownN = ownCount();
        if (!furnSub) furnSub = ownN ? 'own' : 'shop';
        sub.innerHTML = '<button class="hr-b' + (furnSub === 'own' ? ' on' : '') + '" data-sub="own">📦 내 가구 ' + ownN + '</button>'
            + '<button class="hr-b' + (furnSub === 'shop' ? ' on' : '') + '" data-sub="shop">🛒 가구 상점</button>';
        sub.querySelectorAll('[data-sub]').forEach(function (b) { b.onclick = function () { furnSub = b.getAttribute('data-sub'); editPaint(); }; });
        if (furnSub === 'own') {
            el.querySelector('.pts').textContent = '지금 ' + regLabel(curReg()) + ' · 가구를 누르면 내 앞에 놓입니다 · 놓인 내 가구는 눌러 끌어 옮깁니다';
            FURN.forEach(function (f, t) {
                const own = ownedOf(t); if (!own) return;
                const placed = placedOf(t), left = Math.max(0, own - placed);
                h += '<div class="hr-card tap' + (left ? '' : ' done') + '" data-own="' + t + '"><div class="pic"><i style="' + picCss(t, 64) + '"></i></div><b>' + esc(f.n) + '</b>'
                    + '<small>' + (left ? '눌러서 놓기 · 남은 ' + left + '/' + own : '다 놓음 ' + own + '/' + own + ' · 눌러서 고르기') + '</small></div>';
            });
            if (!h) h = '<div class="hr-empty">아직 산 가구가 없습니다.<br>「🛒 가구 상점」에서 사면 여기에 들어옵니다.</div>';
        } else {
            el.querySelector('.pts').textContent = pts;
            FURN.forEach(function (f, t) {
                const own = ownedOf(t);
                h += '<div class="hr-card"><div class="pic"><i style="' + picCss(t, 64) + '"></i></div><b>' + esc(f.n) + '</b><small>' + won(f.p) + (own ? ' · 보유 ' + own : '') + '</small>'
                    + '<div class="row"><button class="hr-b" data-buy="' + t + '">사기</button></div></div>';
            });
        }
    } else {
        sub.innerHTML = '';
        // 벽지 · 바닥지는 지금 서 있는 자리(내 방 · 거실 · 허용받은 동거인 방 · 남는 방)에 — 걸어서 옮겨 가며 바꾼다
        const reg = curReg(), okReg = canPlaceAt(reg);
        el.querySelector('.pts').textContent = pts + ' · 지금 ' + regLabel(reg) + (okReg ? '' : ' — 여기는 꾸밀 수 없습니다');
        const isW = editTab === 'wall', n = isW ? WALLS : FLOORS, cur = isW ? wallNo(reg) : floorNo(reg);
        for (let i = 1; i <= n; i++) {
            const own = isW ? ownWall(i) : ownFloor(i);
            h += '<div class="hr-card' + (i === cur ? ' cur' : '') + '"><div class="th" style="background-image:url(' + DIR + (isW ? 'wall' : 'floor') + i + '-t.webp)"></div><b>' + (isW ? '벽지 ' : '바닥지 ') + i + '</b>'
                + (i === cur ? '<small>쓰는 중</small>' : own ? (okReg ? '<button class="hr-b" data-use="' + i + '">바꾸기</button>' : '<small>보유</small>') : '<button class="hr-b" data-buy2="' + i + '">' + won(isW ? WALL_P : FLOOR_P) + ' 사기</button>') + '</div>';
        }
    }
    list.innerHTML = h;
    list.querySelectorAll('[data-buy]').forEach(function (b) { b.onclick = function () { buyFurn(Number(b.getAttribute('data-buy'))); }; });
    list.querySelectorAll('[data-own]').forEach(function (b) { b.onclick = function () { ownTap(Number(b.getAttribute('data-own'))); }; });
    list.querySelectorAll('[data-use]').forEach(function (b) { b.onclick = function () { useSkin(editTab, Number(b.getAttribute('data-use'))); }; });
    list.querySelectorAll('[data-buy2]').forEach(function (b) { b.onclick = function () { buySkin(editTab, Number(b.getAttribute('data-buy2'))); }; });
}

function pay(price, what) {
    const u = u_();
    if (!u) return false;
    const pts = Math.floor(Number(u.points) || 0);
    if (pts < price) { toast('포인트가 모자랍니다 (보유 ' + won(pts) + ')'); return false; }
    u.points = pts - price;
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[🏠 사택] ' + what + ' (-' + price.toLocaleString() + ' P)'); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    return true;
}
function ask(text, okLabel, fn) {
    if (!S) return;
    const m = document.createElement('div');
    m.className = 'hr-modal';
    m.innerHTML = '<div class="hr-box"><div style="text-align:center;">' + text + '</div><div class="acts"><button class="hr-b on" data-a="ok">' + esc(okLabel) + '</button><button class="hr-b" data-a="no">취소</button></div></div>';
    S.ov.appendChild(m);
    m.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector('[data-a="no"]').onclick = function () { m.remove(); };
    m.querySelector('[data-a="ok"]').onclick = function () { m.remove(); fn(); };
}
function toast(text) {
    if (!S) return;
    const t = document.createElement('div');
    t.style.cssText = 'position:absolute;left:50%;top:56px;transform:translateX(-50%);z-index:10;background:rgba(0,0,0,.82);border:1px solid #6b5a36;color:#fff;padding:7px 14px;border-radius:9px;font-size:13px;pointer-events:none;';
    t.textContent = text;
    S.ov.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
}
function mineRef(c, sub) { const d = db_(); return d ? d.ref('houseMine/' + c + (sub ? '/' + sub : '')) : null; }
function shRef(sub) { const d = db_(); return (d && S) ? d.ref('houseShared/' + S.hk + (sub ? '/' + sub : '')) : null; }
function buyFurn(t) {
    const f = FURN[t]; if (!f || !S || !S.mine) return;
    ask('「' + esc(f.n) + '」을(를) <b>' + won(f.p) + '</b> 에 살까요?<br><small style="color:#aaa;">산 가구는 내 보관함에 들어가 내 방 · 거실에 놓을 수 있습니다</small>', '사기', function () {
        if (!pay(f.p, '가구 「' + f.n + '」 구입')) { editPaint(); return; }
        const r = mineRef(me_(), 'inv/' + t);
        if (r) r.transaction(function (c) { return (Number(c) || 0) + 1; }, function (err, ok) { if (err || !ok) toast('저장하지 못했습니다'); else toast('「' + f.n + '」을(를) 샀습니다 — 눌러서 놓습니다'); });
        furnSub = 'own';                                   // 산 가구가 바로 보이게 — 📦 내 가구로 넘긴다
        editPaint();
    });
}
function buySkin(tab, n) {
    if (!S || !S.mine) return;
    const isW = tab === 'wall', price = isW ? WALL_P : FLOOR_P, lab = (isW ? '벽지 ' : '바닥지 ') + n;
    const reg = curReg(), okReg = canPlaceAt(reg);
    ask('「' + lab + '」을(를) <b>' + won(price) + '</b> 에 살까요?<br><small style="color:#aaa;">' + (okReg ? '사서 바로 ' + esc(regLabel(reg)) + '에 바릅니다' : '내 보관함에 들어갑니다') + '</small>', '사기', function () {
        if (!pay(price, lab + ' 구입')) { editPaint(); return; }
        const up = {}; up[(isW ? 'ow/' : 'of/') + n] = 1;
        const r = mineRef(me_());
        if (r) r.update(up).then(function () { if (okReg && S) useSkin(tab, n, reg, true); }).catch(function () { toast('저장하지 못했습니다'); });
    });
}
// 지금 서 있는 자리에 바른다 — 내 방은 내 기록(룸메가 바뀌어도 남는다) · 거실 · 동거인 방 · 남는 방은 이 집 기록
function useSkin(tab, n, reg, bought) {
    if (!S || !S.mine) return;
    const isW = tab === 'wall', k = isW ? 'w' : 'f';
    if (!bought && !(isW ? ownWall(n) : ownFloor(n))) return;      // bought — 방금 산 것 (내 기록이 아직 안 내려왔어도)
    reg = reg || curReg();
    if (!canPlaceAt(reg)) { toast('여기는 꾸밀 수 없습니다'); return; }
    const up = {}; up[k] = n;
    let r = null;
    if (reg === 'C') r = shRef('liv');
    else if (reg === mySide()) { up[k + 'a'] = now(); r = mineRef(me_(), 'room'); }
    else { const o = ownerAt(reg); if (!o) return; up[k + 'a'] = now(); r = shRef('rw/' + o); }
    if (r) r.update(up).catch(function () { toast('저장하지 못했습니다'); });
}
// 🔓 동거인에게 내 방 꾸미기 허용 (2026-11-12 사용자 「동거인이 방을 꾸며주길 원하면, 자신의 방에 들어가서 방 꾸미기 허용」)
//   내 방에 서 있을 때만 단추가 뜬다 · 이 집(지금 동거인)에만 — 룸메가 바뀌면 다시 허용해야 한다
function allowPaint() {
    if (!S) return;
    const b = S.ov.querySelector('[data-k="allow"]'); if (!b) return;
    const show = S.member && S.mem.length > 1 && !!mySide() && curReg() === mySide();
    b.style.display = show ? '' : 'none';
    if (!show) return;
    const on = !!(shared().allow || {})[me_()];
    const tx = on ? '🔓 룸메 꾸미기 허용 중' : '🔒 룸메 꾸미기 허용';
    if (b.textContent !== tx) b.textContent = tx;
    b.classList.toggle('on', on);
}
function allowToggle() {
    if (!S || !S.member || S.mem.length < 2 || curReg() !== mySide()) return;
    const on = !!(shared().allow || {})[me_()];
    const mate = S.mem.filter(function (c) { return c !== me_(); })[0];
    const go = function () {
        const r = shRef('allow/' + me_()); if (!r) return;
        (on ? r.remove() : r.set(1)).then(function () { toast(on ? '방 꾸미기 허용을 껐습니다' : nameIn(mate) + ' 사원이 내 방을 꾸밀 수 있습니다'); }).catch(function () { toast('저장하지 못했습니다'); });
    };
    if (on) { go(); return; }
    ask('🔓 <b>' + esc(nameIn(mate)) + '</b> 사원에게 내 방 꾸미기를 허용할까요?<br><small style="color:#aaa;">동거인은 자기 보관함의 가구 · 벽지 · 바닥지로 꾸밉니다 · 룸메가 바뀌면 그 가구는 동거인 보관함으로 돌아갑니다</small>', '허용', go);
}
function putNew(t) {
    if (!S || !S.mine) return;
    const left = ownedOf(t) - placedOf(t);
    if (left <= 0) return;
    if (!canPlaceAt(regionAt(S.x, S.y))) { toast(regLabel(regionAt(S.x, S.y)) + '에는 놓을 수 없습니다 — 내 방이나 거실로 가서 놓아 주십시오'); return; }
    const b = FB[t][0];
    // 내 바로 위쪽(뒤)에 — 집 안이 아니면 몇 군데를 더 짚어 본다
    const tries = [[0, -10], [0, 30], [-60, -10], [60, -10], [0, -70]];
    let v = null;
    for (let i = 0; i < tries.length && !v; i++) {
        const c = { t: t, d: 0, x: Math.round(S.x + tries[i][0] - (b[0] + b[2]) / 2), y: Math.round(S.y + tries[i][1] - b[3]) };
        if (placeOkMe(c)) v = c;
    }
    if (!v) v = { t: t, d: 0, x: Math.round(516 - (b[0] + b[2]) / 2), y: Math.round(300 - b[3]) };   // 거실 가운데
    const d = db_(); if (!d) return;
    v.key = d.ref('houseShared').push().key; v.src = null; v.own = me_();
    furnWrite(v, function (id) { if (S) select(id); });
}
// 📦 내 가구 칸에서 누르면 — 남은 것이 있으면 내 앞에 하나 놓고 고른다 · 다 놓았으면 놓인 것을 차례로 골라 화면을 그쪽으로 옮긴다
function ownTap(t) {
    if (!S || !S.mine || !ownedOf(t)) return;
    if (ownedOf(t) - placedOf(t) > 0) { S.focus = null; putNew(t); return; }
    const on = S.flist.filter(function (v) { return v.t === t && v.own === me_(); });
    if (!on.length) return;
    S.cyc = S.cyc || {};
    const i = ((S.cyc[t] || 0) + (S.sel && on.some(function (v) { return v.id === S.sel; }) ? 1 : 0)) % on.length;
    S.cyc[t] = i;
    const v = on[i], a = anchorOf(v);
    S.focus = { x: a.x, y: a.y };
    select(v.id);
    if (on.length > 1) toast('놓인 「' + FURN[t].n + '」 ' + (i + 1) + '/' + on.length);
}
// 내 가구를 적는다 — 놓인 자리가 내 방이면 내 기록(왼쪽 기준으로 · 룸메가 바뀌어도 따라온다), 아니면 이 집 기록(by 나)
//   자리를 옮겨 기록이 바뀌면 예전 것을 지우고 같은 열쇠로 새로 쓴다 (한 번에 · 고른 것도 새 이름을 따라간다)
function furnPath(v) { return v.src === 'm' ? ('houseMine/' + v.own + '/room/furn/' + v.key) : ('houseShared/' + S.hk + '/furn/' + v.key); }
function furnWrite(v, done) {
    const d = db_(); if (!d || !S || !v.key) return;
    const a = anchorOf(v), me = me_(), sd = mySide();
    const tgt = (regionAt(a.x, a.y) === sd) ? 'm' : 's';
    const up = {};
    if (v.src && v.src !== tgt) up[furnPath(v)] = null;
    let id;
    if (tgt === 'm') {
        const c = sd === 'R' ? mirrorV(v) : v;
        up['houseMine/' + me + '/room/furn/' + v.key] = { t: c.t, d: c.d, x: c.x, y: c.y };
        id = 'm.' + me + '.' + v.key;
    } else {
        up['houseShared/' + S.hk + '/furn/' + v.key] = { t: v.t, d: v.d, x: v.x, y: v.y, by: me };
        id = 's.' + v.key;
    }
    if (v.id && S.sel === v.id && id !== v.id) S.sel = id;
    d.ref().update(up).then(function () { if (done) done(id); }).catch(function () { toast('저장하지 못했습니다'); if (S && S.sel === id && !S.flist.some(function (q) { return q.id === id; })) select(null); });
}
function select(id) {
    if (!S) return;
    S.sel = id;
    if (!id) S.focus = null;
    if (S.editEl) S.editEl.classList.toggle('mini', !!id);
    S.ov.classList.toggle('place', !!(id && S.edit));
    if (id && S.joy) { S.joy = null; const j = S.ov.querySelector('#hr-joy'); if (j) j.style.display = 'none'; }
    Object.keys(S.fel).forEach(function (k) { S.fel[k].classList.toggle('sel', k === id); });
    toolPlace();
}
function toolPlace() {
    if (!S) return;
    const tool = S.ov.querySelector('#hr-tool'); if (!tool) return;
    const v = S.sel && S.edit ? (S.drag && S.drag.id === S.sel ? S.drag.v : S.flist.find(function (q) { return q.id === S.sel; })) : null;
    if (!v) { if (tool.style.display !== 'none') tool.style.display = 'none'; return; }
    const rb = tool.querySelector('[data-t="rot"]'), mineV = canTouch(v);
    if (rb && rb.style.display !== (mineV ? '' : 'none')) rb.style.display = mineV ? '' : 'none';   // 동거인 것 — 📦 넣기만
    const b = bbOf(v);
    const x = (v.x + (b[0] + b[2]) / 2) * S.z + (S.tx || 0), y = (v.y + b[1]) * S.z + (S.ty || 0) - 6;
    tool.style.display = 'flex';
    tool.style.left = Math.round(Math.max(90, Math.min((S.view.clientWidth || 800) - 90, x))) + 'px';
    tool.style.top = Math.round(Math.max(96, y)) + 'px';
}
function toolDo(k) {
    if (!S || !S.sel) return;
    const v = S.flist.find(function (q) { return q.id === S.sel; });
    if (!v) { select(null); return; }
    if (k === 'ok') { select(null); return; }
    if (k === 'put') {
        if (!canPutAway(v)) return;
        const d = db_(); if (d) d.ref(furnPath(v)).remove();
        if (!canTouch(v)) toast(nameIn(v.own) + ' 사원의 보관함으로 돌려 보냈습니다');
        select(null); return;
    }
    if (k === 'rot') {
        if (!canTouch(v)) return;
        const a = anchorOf(v);
        const nd = (v.d + 1) & 3, nb = FB[v.t][nd];
        const nv = Object.assign({}, v, { d: nd, x: Math.round(a.x - (nb[0] + nb[2]) / 2), y: Math.round(a.y + 1 - nb[3]) });
        furnWrite(nv);
    }
}

// ==========================================
// 초대 (집주인만)
// ==========================================
function inviteModal() {
    if (!S || !S.mine) return;
    const d = db_(), u = u_(); if (!d || !u) return;
    const m = document.createElement('div');
    m.className = 'hr-modal';
    m.innerHTML = '<div class="hr-box"><b>💌 사택 초대</b><small style="color:#aaa;">초대한 사원은 우리 사택에 들어올 수 있습니다 (룸메이트는 초대 없이도)</small>'
        + '<div class="cap" style="font-size:11px;color:#d9c48a;">초대한 사원</div><div class="ul" data-u="now"></div>'
        + '<input data-q placeholder="이름 · 사번으로 찾기"><div class="ul" data-u="all"></div>'
        + '<div class="acts"><button class="hr-b" data-a="x">닫기</button></div></div>';
    S.ov.appendChild(m);
    m.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    m.addEventListener('keydown', function (e) { e.stopPropagation(); });
    m.addEventListener('keyup', function (e) { e.stopPropagation(); });
    m.onclick = function (e) { if (e.target === m) close(); };
    let cur = {};
    const ref = d.ref('houseInvite/' + u.code);
    const onV = function (s) { cur = s.val() || {}; paint(); };
    ref.on('value', onV);
    function close() { try { ref.off('value', onV); } catch (e) { } m.remove(); }
    m.querySelector('[data-a="x"]').onclick = close;
    const q = m.querySelector('[data-q]');
    q.oninput = paint;
    function paint() {
        const nowEl = m.querySelector('[data-u="now"]'), allEl = m.querySelector('[data-u="all"]');
        const inv = Object.keys(cur);
        nowEl.innerHTML = inv.length ? inv.map(function (c) { return '<div class="li"><span>' + esc(nameIn(c)) + ' <small style="color:#888;">' + esc(c) + '</small></span><button class="hr-b" data-del="' + esc(c) + '">거두기</button></div>'; }).join('') : '<small style="color:#777;">아직 없습니다</small>';
        const key = q.value.trim().toLowerCase();
        const U = users();
        const rows = Object.keys(U).filter(function (c) {
            if (c === u.code || cur[c]) return false;
            const x = U[c] || {}; if (!x.name) return false;
            if (!key) return false;
            return String(nameOf(x)).toLowerCase().indexOf(key) >= 0 || String(x.name).toLowerCase().indexOf(key) >= 0 || String(x.no || '').indexOf(key) >= 0 || c.toLowerCase().indexOf(key) >= 0;
        }).slice(0, 30);
        allEl.innerHTML = key ? (rows.length ? rows.map(function (c) { const x = U[c]; return '<div class="li"><span>' + esc(nameOf(x)) + ' <small style="color:#888;">' + esc(x.no || c) + '</small></span><button class="hr-b on" data-add="' + esc(c) + '">초대</button></div>'; }).join('') : '<small style="color:#777;">찾는 사원이 없습니다</small>') : '';
        nowEl.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { uninvite(b.getAttribute('data-del')); }; });
        allEl.querySelectorAll('[data-add]').forEach(function (b) { b.onclick = function () { invite(b.getAttribute('data-add')); q.value = ''; paint(); }; });
    }
    paint();
}
function invite(code) {
    const d = db_(), u = u_(); if (!d || !u || !code || code === u.code) return;
    const t = now(), up = {};
    up['houseInvite/' + u.code + '/' + code] = { at: t, n: nameIn(code) };
    up['houseInvited/' + code + '/' + u.code] = { at: t, n: nameOf(u) };
    d.ref().update(up).then(function () { toast(nameIn(code) + ' 사원을 초대했습니다'); }).catch(function () { toast('초대하지 못했습니다'); });
}
function uninvite(code) {
    const d = db_(), u = u_(); if (!d || !u || !code) return;
    const up = {};
    up['houseInvite/' + u.code + '/' + code] = null;
    up['houseInvited/' + code + '/' + u.code] = null;
    d.ref().update(up);
    // 들어와 있으면 그 사람 화면이 스스로 나간다 (invListen)
}

// ==========================================
// 사택 첫 칸 — 들어가기 · 룸메이트 사택 · 초대받은 사택
// ==========================================
function boxPaint() {
    const host = document.getElementById('house-main-body');
    const u = u_();
    if (!host || !u) return;
    let el = document.getElementById('hr-box');
    if (!el) {
        css();
        el = document.createElement('div');
        el.id = 'hr-box';
        const ttl = host.querySelector('.panel-title');
        if (ttl && ttl.parentNode === host) ttl.insertAdjacentElement('afterend', el); else host.insertBefore(el, host.firstChild);
    }
    // ★ 2026-11-12 같이 쓰는 사택 — 룸메이트와 한 집이라 「룸메이트 사택」 칸은 없다 · A 등급 이상 사택만 들어간다
    const mate = mateOf(u.code);
    const hk = hkOf(u.code), ok = gradeOk(hk);
    const invs = Object.keys(INV || {}).filter(function (h) { return h !== String(u.code) && h !== mate; });
    let h = '<button class="hr-b on go" data-hr="' + esc(u.code) + '"' + (ok ? '' : ' disabled') + '>🏠 사택 안으로 들어가기' + (mate ? ' (' + esc(nameIn(mate)) + ' 사원과 함께)' : '') + '</button>';
    if (!ok) h += '<div class="note">사택 안은 A 등급 이상 사택부터 들어갈 수 있습니다 (지금 ' + esc(gradeOf(hk)) + ' 등급)</div>';
    if (invs.length) {
        h += '<div class="sub"><div class="cap">초대받은 사택</div>' + invs.map(function (c) { return '<button class="hr-b" data-hr="' + esc(c) + '">💌 ' + esc((INV[c] && INV[c].n) || nameIn(c)) + ' 사원의 사택</button>'; }).join('') + '</div>';
    }
    if (el._h !== h) {
        el._h = h;
        el.innerHTML = h;
        el.querySelectorAll('[data-hr]').forEach(function (b) { b.onclick = function () { enter(b.getAttribute('data-hr')); }; });
    }
}
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._hr) return;
        const _r = renderHouse;
        const w = function () {
            const r = _r.apply(this, arguments);
            setTimeout(function () { try { boxPaint(); } catch (e) { } }, 150);
            return r;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._hr = true;
        renderHouse = w; window.renderHouse = w;
    }, 600);
})();

// 다른 화면에서 쓰게
window.houseEnter = function (host) { enter(host); };
window.houseLeave = function () { leave(); };
window.houseRoomState = function () {
    return S ? { host: S.host, hk: S.hk, mem: S.mem, mine: S.mine, side: mySide(), sides: shared().side || {}, region: S.region, allow: shared().allow || {},
                 z: S.z, x: Math.round(S.x), y: Math.round(S.y), cell: cellAt(S.x, S.y), edit: S.edit, sel: S.sel,
                 wall: wallNo(), floor: floorNo(), skins: { L: [skinOf('L', 'w'), skinOf('L', 'f')], R: [skinOf('R', 'w'), skinOf('R', 'f')], C: [skinOf('C', 'w'), skinOf('C', 'f')] },
                 furn: S.flist.map(function (v) { const a = anchorOf(v); return { id: v.id, n: FURN[v.t].n, t: v.t, d: v.d, x: v.x, y: v.y, own: v.own, src: v.src, reg: regionAt(a.x, a.y), ok: placeOk(v) }; }),
                 peers: Object.keys(S.peers), invited: Object.keys(INV) }
             : { open: false, invited: Object.keys(INV) };
};
window.houseRoomDebug = { FURN: FURN, FB: FB, cellAt: cellAt, loadMask: loadMask, mirrorV: mirrorV, regionAt: regionAt, hkOf: hkOf, gradeOf: gradeOf, setPos: function (x, y) { if (S) { S.x = x; S.y = y; } }, keys: function (k) { if (S) S.keys = k || {}; } };
})();
