// ==========================================
// ★ 🎁 보물 찾기 (2026-11-01 사용자)
// bundles.json 마지막 묶음 — plaza.js · gaduri.js · cage-escape.js · gear-cap.js 보다 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//
//   · 선물 상자를 광장 모든 방(길 · 건물 안 · 지하)과 📸 포토존에 **방마다 5개**씩 깐다.
//     ★ 2026-11-05 사용자 「보물 갯수 총 100개로」 — 방마다 5개(15방 75개) → **모두 합쳐 100개**.
//       방 차례대로 고르게 나눈다 — 100 ÷ 방 수의 몫씩, 남는 것은 앞 방부터 하나씩 더 (15방이면 길 · 건물 여덟 방과 중앙 · 헝그리 행맨이 7개, 나머지 포토존 다섯이 6개).
//       방이 늘거나 줄어도 합은 100 이다 (perRoom).
//     작게 그려 찾기 어렵게 둔다. (그림 plaza/treasure.png — 다섯 가지 상자, 18x18 도트)
//   · 한 사람이 **하루 3개**까지 연다.
//   · 상품 — 50,000 P · 우주 쇼핑몰에서 **지금 파는** 물품 전부(소속 상관없이)
//            + 새 장신구 넷(진주 혀 피어싱 · 진주 목걸이 · 아쿠아마린 귀걸이 · 아쿠아마린 렌즈) — 다른 물품의 5분의 1 꼴
//            황룡의 눈 · 산군의 도움은 뺀다. **값이 비쌀수록 덜 나온다.**
//   · 🫙 소원권 — 0.00001% (처음 0.1% → 0.01%) · 서버 전체에서 **딱 하나**만
//   · 여우구슬 — 서버 전체에서 딱 하나 · 기록 소실 티켓 · 사직서 · 금고 · 사원명 변경권 — 각각 둘까지
//
// ■ 어떻게 도나
//
//   상자는 모두가 같이 본다 — treasure/<방>/<0~6> = { x, y, lv, k, g }   (방 그림 좌표 · lv 1 이면 지하 · k 상자 모양 · g 이 자리 번호)
//     · 먼저 연 사람이 가져가고, 연 상자는 **모두의 화면에서 사라진다** (2026-11-01 사용자 — 처음엔 다른 자리로 옮겨 다시 숨었다).
//       { …, taken: 사번, tat } 로 남겨 두고 그리지 않는다. 날이 바뀌면(day) 방마다 다섯 개를 새 자리에 다시 깐다.
//     · 여는 것은 트랜잭션 한 번 — g 가 그대로일 때만 연다 (둘이 동시에 눌러도 한 사람만).
//   상자 가까이(가로 170) 같은 층에 서 있어야 열린다. 멀리서 누르면 그쪽으로 걸어간다(누름이 광장으로 넘어간다).
//   하루 몫 — currentUser.treasure = { day, n }   (상담사는 세지 않는다)
//   한정품 — treasureCap/<열쇠> 에 서버 전체 개수를 센다 (다 나갔으면 보통 상품으로 다시 뽑는다)
//   🎉 소원권을 주우면 treasureWish = { k, code, name, at } — 켜 둔 모두의 화면에 「🎉 ~ 사원이 소원권을 주웠습니다! 🎉」 팝업 (2026-11-03)
//
// ■ 상품 확률 (뽑기 한 번)
//   먼저 한정품 — 소원권 0.00001% · 여우구슬 0.01% · 금고 0.02% · 사직서 · 기록 소실 티켓 · 사원명 변경권 각 0.03%
//   나머지는 무게로 — 무게 = 1 / √값  (50,000 P 도 값 50,000 으로 센다 · 값이 없는 것은 10,000)
//   새 장신구 넷 — 각각 0.2% (한정품 다음에 본다)
//
// ■ 새 장신구 (장착 — 소지품에서 「사용」)
//   💎 진주 혀 피어싱      하루에 한 번 가두리에서 나올 수 있다 (가두리 위 💎 단추 · 여정 가두리의 첫 30분 잠김은 그대로)
//   📿 진주 목걸이         공용시설 행운 200% 상승 (×3)
//   💠 아쿠아마린 귀걸이   어둠 회수품 200% 상승 (×3 — 커스텀 장비 상한 밖)
//   👁 아쿠아마린 렌즈     어둠에서 사망하면 포인트 +5,000 · 공용시설 행운 100% 상승 (×2)
//   ★ 세트 (2026-11-01 사용자) — 둘 다 차면 낱개 몫 대신
//     진주 세트(혀 피어싱 + 목걸이)          행운 250% (×3.5)
//     아쿠아마린 세트(귀걸이 + 렌즈)         사망 시 +8,000 P · 행운 120% (×2.2) · 회수품 250% (×3.5)
//   ★ 나올 확률은 넷 다 **각각 0.2%** (2026-11-01 사용자 — 처음엔 다른 물품 무게의 5분의 1 → 0.2% → 0.02% → 다시 0.2%)
//   이벤트 어둠(이상한 나라 · 연계판)에서는 장비가 통하지 않으므로 회수품 · 사망 몫은 꺼진다.
//
// ■ 콘솔
//   treasureState()      내 하루 몫 · 지금 방의 상자 · 한정품 남은 수
//   treasureTable()      상품 확률표
//   treasureTest(n)      n번 뽑아 세기 (지급 없음 · 한정품 칸은 건드리지 않음)
//   treasureReset()      상담사 — 상자 자리를 모두 새로 (지금 방 · 'all' 이면 전부)

(function treasureHunt() {
'use strict';

const ROOT = 'treasure';
const CAPS = 'treasureCap';
const ADMIN = 'kario0987';
const TOTAL = 100;                // 광장 · 포토존을 모두 합친 상자 수 (2026-11-05 · 처음엔 방마다 5)
// 이 방의 상자 수 — 100 을 방 차례대로 고르게 (몫 + 앞 방부터 나머지 하나씩)
function perRoom(key) {
    const ks = Object.keys(rooms() || {});
    const n = ks.length; if (!n) return 0;
    const i = ks.indexOf(key); if (i < 0) return 0;
    const base = Math.floor(TOTAL / n), rem = TOTAL - base * n;
    return base + (i < rem ? 1 : 0);
}
const PER_DAY = 3;
const SIZE = 34;                 // 방 그림 좌표에서 상자 키 (사람 키 236)
const NEAR = 170;                // 이만큼 가까이 서야 열린다 (가로 · 방 그림 좌표)
const POINTS = 50000;
const IMG = 'plaza/treasure.png';
const KINDS = 5;

const EXCLUDE = ['황룡의 눈', '산군의 도움'];
// ★ 2026-11-01 사용자 — 소원권 0.1% → 0.01% → **0.00001%**, 나머지 한정품은 10분의 1로
const SPECIAL = [
    { k: 'bat',    n: '🪄 도깨비 방망이', p: 0.00000001, cap: 1 }, // 0.000001% · 서버 전체 하나 (2026-11-06 사용자 · dokkaebi-bat.js)
    { k: 'wish',   n: '🫙 소원권',        p: 0.0000001, cap: 1 },  // 0.00001%
    { k: 'fox',    n: '여우구슬',          p: 0.0001, cap: 1 },     // 0.01%  (처음 0.1%)
    { k: 'safe',   n: '금고',              p: 0.0002, cap: 2 },     // 0.02%  (처음 0.2%)
    { k: 'resign', n: '사직서',            p: 0.0003, cap: 2 },     // 0.03%  (처음 0.3%)
    { k: 'lost',   n: '🎫 기록 소실 티켓', p: 0.0003, cap: 2 },     // 0.03%
    { k: 'rename', n: '📝 사원명 변경권',  p: 0.0003, cap: 2 }      // 0.03%
];
// 새 장신구 — 다른 물품의 5분의 1
const JEWEL = {
    TONGUE:  '진주 혀 피어싱',
    NECK:    '진주 목걸이',
    EAR:     '아쿠아마린 귀걸이',
    LENS:    '아쿠아마린 렌즈'
};
const NEW = [
    { n: JEWEL.TONGUE, e: 'equip_tr_tongue', d: '[보물 찾기] 장착 시 하루에 한 번 가두리에서 나올 수 있다. 진주 세트(진주 혀 피어싱 · 진주 목걸이)로 착용 시 행운 250%.' },
    { n: JEWEL.NECK,   e: 'equip_tr_neck',   d: '[보물 찾기] 장착 시 행운 200% 상승. 진주 세트(진주 혀 피어싱 · 진주 목걸이)로 착용 시 행운 250%.' },
    { n: JEWEL.EAR,    e: 'equip_tr_ear',    d: '[보물 찾기] 장착 시 회수품 상승 200%. 아쿠아마린 세트(아쿠아마린 귀걸이 · 아쿠아마린 렌즈)로 착용 시 회수품 상승 250%, 사망 시 포인트 + 8000p, 행운 120%.' },
    { n: JEWEL.LENS,   e: 'equip_tr_lens',   d: '[보물 찾기] 장착 시 사망 시 포인트 + 5000, 행운 100%. 아쿠아마린 세트(아쿠아마린 귀걸이 · 아쿠아마린 렌즈)로 착용 시 회수품 상승 250%, 사망 시 포인트 + 8000p, 행운 120%.' }
];
const JEWEL_P = 0.002;           // 새 장신구 넷 — 각각 0.2% (2026-11-01 사용자 — 0.02% 로 낮췄다가 다시 0.2%)
function pearlSet(u) { return wears(u, JEWEL.TONGUE) && wears(u, JEWEL.NECK); }
function aquaSet(u) { return wears(u, JEWEL.EAR) && wears(u, JEWEL.LENS); }

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function isAdm() { const u = u_(); return !!(u && u.code === ADMIN); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); else console.log(m); } catch (e) { } }
// ★ 날짜는 **서버 시각 · 한국 날짜**로 센다 (2026-11-04 — 「백일몽 로비에 선물상자들이 계속 돌아다닌다」)
//   예전에는 기기 날짜(getTodayStr)였다. 기기 날짜가 다른 사람(시간대가 다르거나 날짜를 바꿔 둔 기기)이 같은 방에 있으면
//   서로 상대가 깐 상자를 「오늘 것이 아니다」로 보고 새 자리에 다시 깔았다 — 그것을 또 상대가 다시 깔아,
//   사람이 많은 로비에서 상자가 쉴 새 없이 자리를 옮겼다. 꼴(YYYY-MM-DD)은 예전과 같다.
function today() {
    let t = Date.now();
    try { if (typeof window.serverNow === 'function') { const s = Number(window.serverNow()); if (s > 1.5e12) t = s; } } catch (e) { }
    const d = new Date(t + 9 * 3600000);
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
// 서버 시계가 섰나 — 서기 전(들어온 직후 몇 초)에는 기기 시계라 상자를 깔지 않는다
function clockOk() { try { return typeof window.clockReady !== 'function' || !!window.clockReady(); } catch (e) { return true; } }
function rooms() { try { return PLAZA.ROOMS; } catch (e) { return {}; } }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u, name) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === name; })); }
function gearOff() { try { return !!(window.WONDER_GEAR_OFF && window.WONDER_GEAR_OFF()); } catch (e) { return false; } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); else if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { } }
function rid() { return Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

// ==========================================
// 새 장신구 — 물품 목록에 올린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        NEW.forEach(function (x) {
            ITEM_CATALOG[x.n] = { price: 20000, usable: true, targetable: false, effect: x.e, treasure: true, desc: x.d };
        });
    }, 200);
})();

// ==========================================
// 하루 몫
// ==========================================
function dayRec() {
    const u = u_();
    if (!u) return { day: today(), n: 0 };
    if (!u.treasure || u.treasure.day !== today()) u.treasure = { day: today(), n: 0 };
    return u.treasure;
}
function leftToday() { return isAdm() ? 99 : Math.max(0, PER_DAY - (Number(dayRec().n) || 0)); }

// ==========================================
// 상자 자리 — 방 그림 좌표로 고른다
// ==========================================
function bandsOf(r) {
    const out = [{ lv: 0, y: r.floor, x: [70, r.w - 70], wgt: 7 }];
    if (r.floor2) out.push({ lv: 1, y: r.floor2, x: r.x2 || [555, 1325], wgt: 3 });
    return out;
}
function blocked(r, lv, x) {
    // 시설 입구 · 가두리 · 나가는 자리 앞은 피한다 (누르는 것이 겹치지 않게)
    const sp = (r.spots || []).some(function (s) { return ((s.lv === 1 ? 1 : 0) === lv) && Math.abs((s.x || 0) - x) < 120; });
    const cg = lv === 0 && r.cage && Math.abs(r.cage.x - x) < (r.cage.w / 2 + 40);
    return sp || cg;
}
function newSpot(key, avoid) {
    const r = rooms()[key];
    if (!r || !r.floor) return null;
    const bands = bandsOf(r);
    const tot = bands.reduce(function (a, b) { return a + b.wgt; }, 0);
    for (let t = 0; t < 40; t++) {
        let q = Math.random() * tot, b = bands[0];
        for (let i = 0; i < bands.length; i++) { q -= bands[i].wgt; if (q <= 0) { b = bands[i]; break; } }
        const x = Math.round(b.x[0] + Math.random() * (b.x[1] - b.x[0]));
        const y = Math.round(b.y[0] + Math.random() * Math.max(0, b.y[1] - b.y[0]));
        if (blocked(r, b.lv, x)) continue;
        if ((avoid || []).some(function (o) { return o && o.lv === b.lv && Math.abs(o.x - x) < 90; })) continue;
        return { x: x, y: y, lv: b.lv, k: Math.floor(Math.random() * KINDS), g: rid(), at: Date.now(), day: today() };
    }
    return { x: Math.round(r.w * 0.3), y: r.floor[1], lv: 0, k: 0, g: rid(), at: Date.now(), day: today() };
}

// ==========================================
// 지금 방의 상자 — 서버에서 듣는다
// ==========================================
let curRoom = '', ref = null, boxes = {};
let lastFill = 0, gotRoom = '';          // gotRoom — 서버 값을 한 번이라도 받은 방 (받기 전에는 빈 줄 알고 깔면 안 된다)
function listen(key) {
    if (key === curRoom) return;
    if (ref) { try { ref.off(); } catch (e) { } ref = null; }
    curRoom = key; boxes = {}; gotRoom = '';
    paint(true);
    const d = db_();
    if (!d || !key || !rooms()[key]) return;
    ref = d.ref(ROOT + '/' + key);
    ref.on('value', function (s) {
        if (curRoom !== key) return;
        boxes = s.val() || {};
        gotRoom = key;
        fill(key);
        paint(true);
    });
}
// 빈 자리는 들어와 있는 사람이 채운다 (여럿이 채워도 트랜잭션이라 하나만 들어간다)
//   한꺼번에 채울 때 서로 겹치지 않게 — 방금 고른 자리도 피한다
//   오늘 깐 것이 아니면(어제 것 · 예전 꼴) 새로 깐다 — 연 상자는 그날 안에는 다시 생기지 않는다
//   ★ 서버 시계가 서기 전에는 깔지 않는다 — 서면 아래 시계가 다시 부른다
//   ★ 날짜가 오늘보다 **뒤**인 상자(자정 무렵 시계가 조금 앞선 사람이 먼저 깐 것)는 그대로 둔다 — 서로 다시 깔며 다투지 않게
function fill(key) {
    if (!clockOk() || key !== curRoom) return;
    const made = Object.keys(boxes).map(function (k) { return boxes[k]; }).filter(keep);
    for (let i = 0, n = perRoom(key); i < n; i++) {
        if (keep(boxes[i])) continue;
        const sp = newSpot(key, made);
        if (sp) { made.push(sp); seed(key, i, sp); }
    }
}
function seed(key, i, sp) {
    const d = db_(); if (!d) return;
    d.ref(ROOT + '/' + key + '/' + i).transaction(function (cur) { return keep(cur) ? cur : sp; });
}
// 오늘 것이거나, 하루 앞선 것 (자정을 넘긴 사람이 먼저 깐 것)
function keep(b) {
    if (fresh(b)) return true;
    if (!b || typeof b.day !== 'string') return false;
    const t = today();
    if (b.day <= t) return false;
    const n = new Date(Date.parse(t + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
    return b.day === n;
}
function fresh(b) { return !!(b && b.day === today()); }
function live(b) { return fresh(b) && !b.taken; }

// ==========================================
// 그리기 — 방 그림 위에 작게
// ==========================================
let lastSig = '';
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function paint(force) {
    const st = stage();
    if (!st || !st.el) { lastSig = ''; return; }
    const z = st.z || 1;
    const have = st.el.querySelectorAll('.plaza-tr').length;
    const sig = st.room + '|' + z.toFixed(4) + '|' + JSON.stringify(boxes) + '|' + have;
    if (!force && sig === lastSig) return;
    Array.prototype.forEach.call(st.el.querySelectorAll('.plaza-tr'), function (e) { e.remove(); });
    if (st.room !== curRoom) { lastSig = ''; return; }
    for (let i = 0, n = perRoom(curRoom); i < n; i++) {
        const b = boxes[i];
        if (!live(b) || !(b.x >= 0)) continue;           // 연 상자 · 어제 상자는 그리지 않는다
        const s = Math.max(6, Math.round(SIZE * z));            // 화면에서 상자 크기
        const hit = Math.max(s, 30);                            // 누르는 자리는 손가락만큼
        const e = document.createElement('div');
        e.className = 'plaza-tr';
        e.dataset.i = String(i);
        e.dataset.g = b.g || '';
        e.style.cssText = 'position:absolute; cursor:pointer; touch-action:none;'
            + 'left:' + Math.round(b.x * z - hit / 2) + 'px; top:' + Math.round(b.y * z - hit + (hit - s) / 2) + 'px;'
            + 'width:' + hit + 'px; height:' + hit + 'px; z-index:' + (100 + Math.round(b.y)) + ';';
        const k = Math.max(0, Math.min(KINDS - 1, Number(b.k) || 0));
        e.innerHTML = '<div style="position:absolute; left:' + Math.round((hit - s) / 2) + 'px; bottom:' + Math.round((hit - s) / 2) + 'px;'
            + ' width:' + s + 'px; height:' + s + 'px; background:url(' + IMG + ') no-repeat;'
            + ' background-size:' + (s * KINDS) + 'px ' + s + 'px; background-position:' + (-k * s) + 'px 0;'
            + ' image-rendering:pixelated; pointer-events:none;"></div>';
        e.addEventListener('pointerdown', function (ev) {
            e._near = near(b);
            if (e._near) { ev.preventDefault(); ev.stopPropagation(); }       // 가까우면 연다 · 멀면 누름이 광장으로 넘어가 그쪽으로 걷는다
        });
        e.addEventListener('click', function (ev) {
            if (!e._near) return;
            ev.preventDefault(); ev.stopPropagation();
            open(curRoom, i, b.g);
        });
        st.el.appendChild(e);
    }
    lastSig = sig;
}
function near(b) {
    try {
        const w = (typeof window.plazaWhere === 'function') ? window.plazaWhere() : null;
        if (!w) return false;
        return (Number(w.lv || 0) === Number(b.lv || 0)) && Math.abs(w.x - b.x) <= NEAR;
    } catch (e) { return false; }
}

// 방이 바뀌거나 다시 그려지면 따라간다
setInterval(function () {
    try {
        const key = (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : '';
        if (key !== curRoom) listen(key);
        else {
            paint(false);
            // 시계가 서기 전에 들어온 방 · 자정이 지난 방 — 비어 있거나 어제 것인 자리를 채운다 (5초마다 한 번 살핀다)
            if (Date.now() - lastFill > 5000) {
                lastFill = Date.now();
                let need = false;
                for (let i = 0, n = perRoom(curRoom); i < n; i++) if (!keep(boxes[i])) need = true;
                if (need && ref && gotRoom === curRoom) fill(curRoom);
            }
        }
    } catch (e) { }
}, 400);

// ==========================================
// 열기
// ==========================================
let busy = false;
function open(key, i, g) {
    const u = u_(), d = db_();
    if (!u || !d || busy) return;
    if (leftToday() <= 0) { alert_('🎁 오늘은 보물 상자를 ' + PER_DAY + '개 다 열었습니다.\n\n내일 다시 찾아보세요.'); return; }
    busy = true;
    d.ref(ROOT + '/' + key + '/' + i).transaction(function (cur) {
        if (!live(cur) || cur.g !== g) return;                          // 누가 먼저 열었다
        return Object.assign({}, cur, { taken: u.code, tat: Date.now() });   // 연 상자는 사라진다 (오늘 안에는 다시 안 생긴다)
    }).then(function (r) {
        if (!r || !r.committed) { busy = false; alert_('🎁 한 발 늦었습니다 — 누군가 먼저 열었습니다.'); return; }
        const rec = dayRec();
        if (!isAdm()) rec.n = (Number(rec.n) || 0) + 1;
        return roll().then(function (p) { give(p, rec); busy = false; });
    }).catch(function (e) { busy = false; console.warn('[보물 찾기] 열기', e); });
}

// ==========================================
// 상품
// ==========================================
function priceOf(n) {
    if (n === '__pts') return POINTS;
    const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[n] : null;
    const p = c ? parseInt(c.price, 10) : NaN;
    return (isNaN(p) || p <= 0) ? 10000 : p;
}
function table() {
    const skip = EXCLUDE.concat(SPECIAL.map(function (s) { return s.n; })).concat(NEW.map(function (x) { return x.n; }));
    const pool = [];
    try {
        (Array.isArray(ALIEN_ITEMS_POOL) ? ALIEN_ITEMS_POOL : []).forEach(function (n) {
            if (pool.indexOf(n) >= 0 || skip.indexOf(n) >= 0) return;
            if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[n]) return;
            pool.push(n);
        });
    } catch (e) { }
    const rows = pool.map(function (n) { return { n: n, w: 1 / Math.sqrt(priceOf(n)) }; });
    rows.push({ n: '__pts', w: 1 / Math.sqrt(POINTS), pts: true });
    return rows;
}
function pick(rows) {
    const tot = rows.reduce(function (a, r) { return a + r.w; }, 0);
    let q = Math.random() * tot;
    for (let i = 0; i < rows.length; i++) { q -= rows[i].w; if (q <= 0) return rows[i]; }
    return rows[rows.length - 1];
}
function normal() {
    const r = pick(table());
    return r.pts ? { kind: 'points', n: POINTS } : { kind: 'item', name: r.n };
}
// 한정품 — 서버 전체 개수를 세어 남았을 때만
function capTake(s) {
    const d = db_();
    if (!d) return Promise.resolve(false);
    return d.ref(CAPS + '/' + s.k).transaction(function (cur) {
        const n = Number(cur) || 0;
        if (n >= s.cap) return;
        return n + 1;
    }).then(function (r) { return !!(r && r.committed); }).catch(function () { return false; });
}
// 🫙 소원권이 반드시 나오는 사원 (2026-11-14 사용자 「Benz 라고 되어있는 사원은 선물상자 까면 소원권이 100% 나오게」)
//   이름이 아니라 **사번으로 고정**한다 — 이름으로 보면 📝 사원명 변경권으로 누구나 「Benz」가 될 수 있다 (doll-data.js ART_OLD_CODES 와 같은 사번 0010)
//   · 서버 전체 개수(treasureCap)는 세지도 줄이지도 않는다 — 한 장 한정과 따로 간다
//   · 모두에게 띄우는 「소원권을 주웠습니다」 팝업은 띄우지 않는다 (sure 표시) — 하루 세 번씩 모두에게 뜨게 된다
//   · 하루에 여는 상자 수(PER_DAY)는 그대로
const WISH_SURE = ['0010'];
function wishSure(u) {
    u = u || u_();
    if (!u) return false;
    return WISH_SURE.indexOf(String(u.no || '')) >= 0 || WISH_SURE.indexOf(String(u.code || '')) >= 0;
}
function roll() {
    if (wishSure()) {
        const w = SPECIAL.filter(function (s) { return s.k === 'wish'; })[0];
        if (w) return Promise.resolve({ kind: 'item', name: w.n, special: 'wish', sure: true });
    }
    const q = Math.random();
    let acc = 0;
    for (let i = 0; i < SPECIAL.length; i++) {
        acc += SPECIAL[i].p;
        if (q < acc) {
            const s = SPECIAL[i];
            return capTake(s).then(function (ok) { return ok ? { kind: 'item', name: s.n, special: s.k } : normal(); });
        }
    }
    // 새 장신구 넷 — 각각 0.2%
    for (let i = 0; i < NEW.length; i++) {
        acc += JEWEL_P;
        if (q < acc) return Promise.resolve({ kind: 'item', name: NEW[i].n, jewel: true });
    }
    return Promise.resolve(normal());
}
function give(p, rec) {
    const u = u_();
    if (!u) return;
    let line = '';
    if (p.kind === 'points') {
        u.points = (Number(u.points) || 0) + p.n;
        line = '+' + p.n.toLocaleString('ko-KR') + ' P';
        try { if (typeof showPointGainEffect === 'function') showPointGainEffect(p.n); } catch (e) { }
    } else {
        if (!Array.isArray(u.inventory)) u.inventory = [];
        u.inventory.push(p.name);
        line = p.name;
    }
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[보물 찾기] 선물 상자를 열었습니다 — ' + line); } catch (e) { }
    save({ points: 1, inventory: 1, history: 1, treasure: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    const left = isAdm() ? '' : '\n\n오늘 남은 상자 ' + Math.max(0, PER_DAY - (Number(rec.n) || 0)) + ' / ' + PER_DAY;
    const desc = (p.kind === 'item' && typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[p.name]) ? '\n' + ITEM_CATALOG[p.name].desc : '';
    alert_('🎁 보물 상자를 열었습니다!\n\n' + (p.special ? '✨ ' : '') + line + desc + left);
    if (p.special === 'wish' && !p.sure) wishShout(u);       // 반드시 나오는 사원의 소원권은 모두에게 알리지 않는다
    if (p.special === 'bat') wishShout(u, 'bat');            // 🪄 도깨비 방망이도 소원권처럼 모두에게 (2026-11-06)
}

// ==========================================
// 🎉 소원권을 주우면 모두에게 팝업 (2026-11-03 사용자)
// ==========================================
//   「 🎉 ~ 사원이 소원권을 주웠습니다! 🎉 」 — 주운 사람이 treasureWish 에 적으면, 켜 둔 모두의 화면이 받아 띄운다.
//   주운 본인은 상자 알림이 따로 뜨므로 빼고, 10분 넘게 지난 소식 · 이미 본 소식(이 기기에서)은 띄우지 않는다.
const WISH = 'treasureWish';
const WISH_FRESH = 10 * 60 * 1000;
//   it — 무엇을 주웠나 ('bat' = 🪄 도깨비 방망이 · 없으면 소원권)
function wishText(name, it) { return '🎉 ' + (name || '누군가') + ' 사원이 ' + (it === 'bat' ? '🪄 도깨비 방망이를' : '소원권을') + ' 주웠습니다! 🎉'; }
function wishShout(u, it) {
    const d = db_();
    if (!d || !u) return;
    try { d.ref(WISH).set({ k: rid(), code: u.code, name: u.name || u.code, at: Date.now(), it: it || null }); } catch (e) { }
}
function wishSeen(k) {
    try { const o = JSON.parse(localStorage.getItem('treasureWishSeen') || '{}'); return !!o[k]; } catch (e) { return false; }
}
function wishMark(k) {
    try { const o = JSON.parse(localStorage.getItem('treasureWishSeen') || '{}'); o[k] = 1; localStorage.setItem('treasureWishSeen', JSON.stringify(o)); } catch (e) { }
}
(function wishListen() {
    let on = false;
    const shown = {};
    const iv = setInterval(function () {
        const d = db_(), u = u_();
        if (on || !d || !u) return;
        on = true;
        clearInterval(iv);
        d.ref(WISH).on('value', function (snap) {
            const v = snap.val();
            if (!v || !v.k || shown[v.k] || wishSeen(v.k)) return;
            const me = u_();
            if (me && v.code === me.code) { shown[v.k] = 1; wishMark(v.k); return; }      // 주운 본인
            const at = Number(v.at) || 0;
            if (!at || Math.abs(Date.now() - at) > WISH_FRESH) return;                      // 묵은 소식
            shown[v.k] = 1; wishMark(v.k);
            alert_(wishText(v.name, v.it));
        });
    }, 1000);
})();
window.treasureWishTest = function (name) { if (!isAdm()) { console.log('상담사만'); return; } alert_(wishText(name || (u_() || {}).name)); };

// ==========================================
// 💎 진주 혀 피어싱 · 📿 진주 목걸이 · 💠 아쿠아마린 귀걸이 · 👁 아쿠아마린 렌즈
// ==========================================
// 쓰기 = 장착 (newitems2.js 의 장착 길을 빌린다 — 없으면 여기서)
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._treasure) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || String(cat.effect || '').indexOf('equip_tr_') !== 0) return _u.apply(this, arguments);
            const u = u_();
            if (!u || (u.inventory || []).indexOf(itemName) < 0) return;
            if (wears(u, itemName)) { alert_('이미 장착하고 있습니다.'); return; }
            if (typeof window.__newItemWear === 'function') return window.__newItemWear(itemName);
            if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
            if (typeof equipFull === 'function' && equipFull(u)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            u.equippedWeapons.push(itemName);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(u, itemName, u.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, itemName, 1); } catch (e) { }
            try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[장비 장착] ' + itemName); } catch (e) { }
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(itemName + '을(를) 몸에 걸었습니다.');
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._treasure = true;
        useInventoryItem = w;
        window.useInventoryItem = w;
        clearInterval(iv);
    }, 500);
})();

// 📿 · 👁 — 공용시설 행운 (200% 상승 = ×3 · 100% = ×2)
(function hookLuck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._treasure) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        const w = function (user) {
            let m = Number(_f.apply(this, arguments)) || 1;
            const u = user || u_();
            // 세트로 차면 낱개 몫 대신 — 진주 250% (×3.5) · 아쿠아마린 120% (×2.2)
            if (pearlSet(u)) m *= 3.5; else if (wears(u, JEWEL.NECK)) m *= 3;
            if (aquaSet(u)) m *= 2.2; else if (wears(u, JEWEL.LENS)) m *= 2;
            return m;
        };
        Object.keys(_f).forEach(function (k) { try { w[k] = _f[k]; } catch (e) { } });
        w._treasure = true;
        facilityLuckMult = w;
        try { window.facilityLuckMult = w; } catch (e) { }
        clearInterval(iv);
    }, 600);
})();

// 💠 — 회수품 ×3. 보통 물건이라 커스텀 장비 상한(gear-cap.js) **밖**에 둔다 — 늘 맨 바깥에 얹고, 겹쳐 감겨도 한 번만 곱한다
(function hookLoot() {
    const mine = new WeakSet();
    let depth = 0;
    setInterval(function () {
        const f = window.emLootMult;
        if (typeof f !== 'function' || mine.has(f)) return;
        const w = function (user) {
            if (depth) return f.apply(this, arguments);
            depth++;
            try {
                let v = Number(f.apply(this, arguments)) || 1;
                const u = user || u_();
                if (wears(u, JEWEL.EAR) && !gearOff()) v *= aquaSet(u) ? 3.5 : 3;      // 세트면 250% (×3.5 · 2026-11-01 사용자)
                return v;
            } finally { depth--; }
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        mine.add(w);
        window.emLootMult = w;
        try { emLootMult = w; } catch (e) { }
    }, 1500);
})();

// 👁 — 어둠에서 사망하면 +5,000 P
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof window.finishDarkDeath !== 'function') return;
        if (window.finishDarkDeath._treasure) { clearInterval(iv); return; }
        const _f = window.finishDarkDeath;
        const w = function () {
            const u = u_();
            const on = !!(u && wears(u, JEWEL.LENS) && !gearOff() && typeof darkRun !== 'undefined' && darkRun);
            const set = on && aquaSet(u);                       // 아쿠아마린 세트면 +8,000
            const add = set ? 8000 : 5000;
            const out = _f.apply(this, arguments);
            if (on) {
                try {
                    u.points = (Number(u.points) || 0) + add;
                    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[' + (set ? '아쿠아마린 세트' : '아쿠아마린 렌즈') + '] 사망 — +' + add.toLocaleString('ko-KR') + ' P');
                    save({ points: 1, history: 1 });
                    if (typeof updateUI === 'function') updateUI();
                    setTimeout(function () { try { if (typeof showPointGainEffect === 'function') showPointGainEffect(add); } catch (e) { } }, 400);
                } catch (e) { }
            }
            return out;
        };
        Object.keys(_f).forEach(function (k) { try { w[k] = _f[k]; } catch (e) { } });
        w._treasure = true;
        window.finishDarkDeath = w;
        try { finishDarkDeath = w; } catch (e) { }
        clearInterval(iv);
    }, 700);
})();

// 💎 — 하루에 한 번 가두리에서 나온다 (가두리 위에 단추 · 갇힌 본인만)
function tongueOk(u) {
    if (!u || !wears(u, JEWEL.TONGUE)) return null;
    const e = (typeof window.gaduriEntry === 'function') ? window.gaduriEntry(u.code) : null;
    if (!e || e.auto) return null;                 // 격리에 딸린 가두리는 격리가 풀려야 풀린다
    return e;
}
window.treasureTongue = function () {
    const u = u_();
    const e = tongueOk(u);
    if (!e) { alert_('지금은 쓸 수 없습니다.'); return; }
    if (u.tongueDay === today()) { alert_('💎 진주 혀 피어싱은 하루에 한 번입니다.\n\n오늘은 이미 썼습니다.'); return; }
    const lock = (typeof window.cageLockLeft === 'function') ? window.cageLockLeft(u.code) : -1;
    if (lock > 0) { alert_('🔒 여정 가두리는 처음 삼십 분 동안 어떠한 행위로도 나올 수 없습니다.\n\n' + lock + '분 남았습니다.'); return; }
    const rel = (typeof window.cageRelease === 'function') ? window.cageRelease(u.code)
        : (db_() ? db_().ref('gaduri/' + e.room + '/' + u.code).remove().then(function () { return true; }) : Promise.resolve(false));
    rel.then(function (ok) {
        if (!ok) { alert_('가두리 문을 열지 못했습니다.'); return; }
        u.tongueDay = today();
        try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[진주 혀 피어싱] 가두리에서 나왔습니다.'); } catch (err) { }
        save({ tongueDay: 1, history: 1 });
        alert_('💎 진주 혀 피어싱\n\n가두리에서 나왔습니다. (오늘 몫을 썼습니다)');
    });
};
setInterval(function () {
    const u = u_();
    const old = document.querySelector('.plaza-tongue-btn');
    const e = tongueOk(u);
    const feed = document.querySelector('.plaza-feed-btn');
    if (!e || !feed || !feed.parentNode) { if (old) old.remove(); return; }
    let b = old;
    if (!b || b.parentNode !== feed.parentNode) {
        if (b) b.remove();
        b = document.createElement('div');
        b.className = 'plaza-spot plaza-tongue-btn';
        b.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); });
        b.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); window.treasureTongue(); });
        feed.parentNode.appendChild(b);
    }
    const left = (parseInt(feed.style.left, 10) || 0) + 54;
    if (b.style.left !== left + 'px') b.style.left = left + 'px';
    if (b.style.top !== feed.style.top) b.style.top = feed.style.top;
    const used = u.tongueDay === today();
    const html = '<div class="b" style="width:38px;height:38px;font-size:18px;' + (used ? 'opacity:.4;' : '') + '">💎</div><div class="t">' + (used ? '오늘 씀' : '진주 혀 피어싱') + '</div>';
    if (b.innerHTML !== html) b.innerHTML = html;
}, 1000);

// ==========================================
// 콘솔
// ==========================================
window.treasureState = function () {
    const r = dayRec();
    console.log('%c===== 🎁 보물 찾기 =====', 'color:#ffcf8f; font-size:13px');
    console.log('  오늘 연 상자', r.n, '/', PER_DAY, isAdm() ? '(상담사 — 세지 않음)' : '');
    if (wishSure()) console.log('  🫙 이 사원은 상자를 열면 반드시 소원권이 나온다 (사번 고정)');
    console.log('  지금 방', curRoom || '-', '· 상자', Object.keys(boxes).length, '/', perRoom(curRoom), '· 모든 방', Object.keys(rooms()).map(function (k) { return k + ' ' + perRoom(k); }).join(' · '));
    if (Object.keys(boxes).length) console.table(Object.keys(boxes).map(function (k) { const b = boxes[k]; return { 칸: k, x: b.x, y: b.y, 층: b.lv ? '지하' : '길', 모양: b.k }; }));
    const d = db_();
    if (d) d.ref(CAPS).once('value').then(function (s) {
        const v = s.val() || {};
        console.table(SPECIAL.map(function (x) { return { 물품: x.n, 확률: (x.p * 100) + '%', 나간수: v[x.k] || 0, 끝: x.cap }; }));
    });
};
window.treasurePerRoom = function () { const o = {}; Object.keys(rooms()).forEach(function (k) { o[k] = perRoom(k); }); return o; };
window.treasureTable = function () {
    const rows = table();
    const tot = rows.reduce(function (a, r) { return a + r.w; }, 0);
    const rest = 1 - SPECIAL.reduce(function (a, s) { return a + s.p; }, 0) - JEWEL_P * NEW.length;
    const out = rows.map(function (r) { return { 상품: r.pts ? POINTS.toLocaleString() + ' P' : r.n, 값: priceOf(r.pts ? '__pts' : r.n), 확률: (r.w / tot * rest * 100).toFixed(3) + '%' }; })
        .sort(function (a, b) { return parseFloat(b.확률) - parseFloat(a.확률); });
    console.table(SPECIAL.map(function (s) { return { 상품: s.n + ' (서버 전체 ' + s.cap + '개)', 값: '-', 확률: (s.p * 100).toFixed(3) + '%' }; })
        .concat(NEW.map(function (x) { return { 상품: x.n, 값: '-', 확률: (JEWEL_P * 100).toFixed(3) + '%' }; })).concat(out));
    return out;
};
window.treasureTest = function (n) {
    n = n || 10000;
    const c = {};
    for (let i = 0; i < n; i++) {
        const q = Math.random();
        let acc = 0, hit = null;
        for (let j = 0; j < SPECIAL.length; j++) { acc += SPECIAL[j].p; if (q < acc) { hit = SPECIAL[j].n; break; } }
        if (!hit) for (let j = 0; j < NEW.length; j++) { acc += JEWEL_P; if (q < acc) { hit = NEW[j].n; break; } }
        const p = hit ? { name: hit } : normal();
        const k = p.kind === 'points' ? POINTS + ' P' : p.name;
        c[k] = (c[k] || 0) + 1;
    }
    return c;
};
window.treasureReset = function (all) {
    if (!isAdm()) { console.log('상담사만'); return; }
    const d = db_(); if (!d) return;
    const keys = all === 'all' ? Object.keys(rooms()) : [curRoom];
    keys.forEach(function (k) { if (k) d.ref(ROOT + '/' + k).remove(); });
    console.log('상자 자리를 새로 —', keys.join(', '));
};

console.log('[보물 찾기] 광장 · 포토존 모두 합쳐 상자 ' + TOTAL + '개 (방마다 고르게) · 하루 ' + PER_DAY + '개 — treasureState() · treasureTable()');
})();
