// ==========================================
// ★ 🌙 달빛 문신 — 상담사 지급 전용
// bundles.json 마지막 묶음, jisan.js 바로 뒤
// ==========================================
//
//   우주 쇼핑몰의 VIP 쇼핑으로 구입한 일회용 자동 달빛 문신기를 통해 심장 위
//   피부에 새겨진 문신. 오염을 다스릴 수 있으며, 필요할 때마다 꺼내 쓸 수 있다.
//
//   은심장 · 호사수구 · 지산의 복과 같은 결이다. 어느 상점에도 안 깔리고
//   팔 수도 없다. 주는 법은 moonGive(사번) 과 당국 화면의 「물품 강제 꽂기」뿐이다.
//   장착칸의 [문신] 단추로 연다.
//
// ■ 통일 능력 — 하루에 셋
//
//   일곱 문신 가운데 하루에 셋까지 꺼낸다. 꺼낸 것은 자정까지 간다.
//   셋을 다 꺼내면 그 자리에서 오염도가 50 이 되고, 자정까지 **50 밑으로는
//   무엇으로도 안 내려간다** (1.5초마다 50 으로 되돌린다). 50 위로 오르는 것은
//   막지 않는다 — 원래 있던 동결로 막을 수 있다.
//
// ■ 일곱 문신
//
//   ① 유치원 선생님      판정 +3 (rollDarkBonus 를 지나는 모든 탐사 — 어둠 · K 의 방 ·
//                         ■■의 ■■■). (2026-10-18 · 입원 무효는 뺐다)
//   ② 세광공업고등학교 학생
//                         함께 간 사람이 한 번 죽을 때마다 ×1.5 씩 쌓인다
//                         (한 번 1.5 · 두 번 3 · 세 번부터 4).
//                         죽을 고비(어둠의 위험 · K 의 방 끌려감 · 쓰러짐 · ■■의 ■■■ 구조 요청)
//                         에 들었다가 살아난 것도, 물건으로 버틴 것도 한 번이다.
//                         내가 그렇게 되면 쌓인 배수는 일행에게 가고 나는 그 탐사의
//                         포인트를 못 받는다.
//   ③ 흉내장이            고른 사원의 예금(bank/<사번>.deposit) 5% 를 받는다. 하루 한 번.
//                         그쪽 통장은 그대로다. 예금이 0 이면 안 쓴 것으로 친다.
//   ④ 토크쇼 방송인        **꺼낸 뒤 딱 5시간 동안** 포만감이 안 줄고(1 밑으로 안 내려간다),
//                         탐사 횟수가 30 ~ 60 회 가운데 하나로 바뀐다 (원래 남은 것보다
//                         적어지지는 않는다). 5시간이 지나면 원래 횟수로 돌아간다.
//   ⑤ 룩키마트 직원        **우주 쇼핑몰만** 하루 두 번 리셋한다. 남은 주파수를 2 로 맞추고
//                         (2 보다 많이 남았으면 그대로), 기다리는 시간을 없애고,
//                         품절된 칸을 비운다 — 안 산 물건은 그대로 둔다.
//   ⑥ 검은 고양이          탐사가 끝날 때마다 +3,000 P, 이번 탐사에서 남을 구한 횟수마다
//                         +1,000 P — **도운 것은 한 탐사에 3번까지만 센다.**
//                         (붙잡았습니다 · 되살렸습니다 · 끌어냈습니다 · 치유로 일으켰습니다 ·
//                          ■■의 ■■■ 의 붙잡은 동료 수)
//   ⑦ 골든 마스코트        상담실 · 선녀탕에 있는 사원에게 계약서를 보내 오염도 0 으로 꺼낸다.
//                         **한 장에 1만 P · 하루 3장.**
//
// ■ ② · ⑥ 은 탐사 하나를 통째로 본다
//
//   탐사가 끝나는 자리가 갈래마다 다르다 (renderDarkResult · K 의 방 settle ·
//   epicSettle). 그래서 「darkRun 이 생겨서 없어질 때까지」를 한 판으로 보고,
//   그 사이 늘어난 포인트를 그 판의 몫으로 친다. 판 기록은 새로고침해도 이어지게
//   localStorage(moonRun_<사번>) 에 둔다.
//
//   죽음은 죽은 사람 화면이 방에 적는다 — darkParties/<방>/moonDie (push).
//   ② 를 꺼낸 사람은 그것을 센다. 내 죽을 고비는 방의 dying · kDoom · epicHelp
//   에 내 이름이 생기는 것으로, 죽음은 darkDeath · kroomDie · epicSettle('dead') 로 안다.
//   고비 끝에 그대로 죽은 것은 한 번으로 센다.
//   내가 죽어 넘긴 배수는 darkParties/<방>/moonGift/<사번> = { m, by, at } 에 적힌다.
//   일행은 끝날 때 그 배수만큼 받는다 (② 를 안 꺼낸 사람도).
//
// ■ 적히는 자리 (users/<사번>)
//
//   moonDay    하루가 바뀌었나          moonOut   오늘 꺼낸 문신 ['t1', …]
//   moonCopy   ③ { c, n, got, at }      moonT4At  ④ 꺼낸 때 (5시간)
//   moonTries  ④ 오늘 탐사 횟수         moonSat   ④ 지키는 포만감
//   moonShop   ⑤ { alien }             moonDeal  ⑦ { max, used, got }
//   moonFreed  ⑦ 계약서로 나온 쪽 { by, byName, at } · moonFreedSeen 본 것
//
// ■ 콘솔
//   moonGive(사번)   상담사가 하나 준다
//   moonState(사번)  지금 무엇이 걸려 있나
//   moonMenu()       문신 창

const MOON = {
    NAME:       '🌙 달빛 문신',
    DAY_MAX:    3,             // 하루에 꺼낼 수 있는 문신
    FIX_POLL:   50,            // 셋을 다 꺼내면
    T1_BONUS:   3,             // ① 판정
    T2_STEP:    1.5,           // ② 한 번 죽을 때마다
    T2_MAX:     4,             // (2026-10-18 · 6 → 4)
    T3_RATE:    0.05,          // ③ 예금의 몇 할 (2026-10-18 · 10% → 5%)
    T4_LO:      30,            // ④ 오늘 탐사 횟수
    T4_HI:      60,
    T4_MS:      5 * 3600000,   // ④ 꺼낸 뒤 딱 5시간
    T5_TIMES:   2,             // ⑤ 상점마다 하루 몇 번
    T5_ALIEN:   2,             // ⑤ 우주 쇼핑몰 — 리셋하면 남는 주파수
    T6_BASE:    3000,          // ⑥ 탐사마다
    T6_HELP:    1000,          // ⑥ 도울 때마다
    T6_HELP_MAX: 3,            // ⑥ 도운 것은 한 탐사에 몇 번까지 세나
    T7_MAX:     3,             // ⑦ 하루 계약서
    T7_PAY:     10000          // ⑦ 한 장에
};

// 설명은 적어 준 그대로 둔다
const MOON_TATS = [
    { id: 't1', n: '유치원 선생님',
      d: '모든 탐사에서 판정에 +3.',
      q: '■■■ 선생님, 들어보세요. 나는 교육서를 다 읽었어요!' },
    { id: 't2', n: '세광공업고등학교 학생',
      d: '함께 탐사하는 인원이 한 번 죽을 때마다 자신에게 포인트 1.5배. 최대 4배까지 누적 가능하다. '
       + '단, 자신이 죽을 시 누적된 효과는 모두 탐사 인원에게로 향하고, 포인트를 받지 못한다. '
       + '(아이템, 남의 도움 등으로 죽을 고비에서 부활하는 것도 죽음에 포함)',
      q: '1학년 5반에서 사망사고가 일어났습니다.' },
    { id: 't3', n: '흉내장이',
      d: '사원 중 한 명을 모방하여 해당 사원의 예금 통장 내 포인트 총액 5%를 지급 받는다. '
       + '대상이 된 사원의 포인트 변동은 없다.',
      q: '너희는 이름님을 믿니?' },
    { id: 't4', n: '토크쇼 방송인',
      d: '먹고 자지 않아도 생명에 지장이 생기지 않는다. 포만감이 줄지 않으며, '
       + '탐사 횟수가 크게 늘어난다(30~60회). 꺼낸 뒤 딱 5시간 동안만 간다.',
      q: '나는 이직에 성공했다.' },
    { id: 't5', n: '룩키마트 직원',
      d: '우주 쇼핑몰에서 최대 2회 리셋이 가능하다. '
       + '주파수 4회를 모두 맞춘 후 리셋할 시 횟수 2회가 남은 것으로 리셋된다.',
      q: '룩 키 마트에 어 서오 세 요!' },
    { id: 't6', n: '검은 고양이',
      d: '기본적으로 3천 포인트 추가 정산을 받는다. 탐사에서 남을 구출하거나 끌려간 것을 '
       + '잡아 주는 등 타 사원을 돕는 행위를 할 경우 성공 횟수 만큼 추가 정산 포인트 양이 '
       + '늘어난다. (1회 1천 포인트, 최대 3회)',
      q: '이쪽.' },
    { id: 't7', n: '골든 마스코트',
      d: '완전히 오염되거나 죽어서 상담실/선녀탕에 있는 사원에게 계약서를 보내 멀끔한 상태로 '
       + '즉시 꺼내 주며, 포인트를 얻는다. (계약서 일일 한도 3장, 1장 당 1만 포인트)',
      q: '' }
];

(function moonTattoo() {

const NAME = MOON.NAME;
const ADMIN = 'kario0987';
const MOD = 'moon-modal';
const BOOT = Date.now();

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function won(n) { return (Number(n) || 0).toLocaleString() + ' P'; }
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code && u.code !== ADMIN; });
}
function userOf(code) {
    if (typeof db === 'undefined' || !db.users) return null;
    return db.users[code] || null;
}
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function find(who) {
    if (!who) return u_();
    return users().filter(function (x) {
        return x.code === who || x.no === who || x.name === who;
    })[0] || null;
}
function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
window.moonWears = wears;

function inQ(u) {
    if (!u) return false;
    try { if (typeof isQuarantined === 'function') return !!isQuarantined(u); } catch (e) { }
    return !!(u.quarantineUntil && Date.now() < u.quarantineUntil);
}
function pay(n) {
    n = Math.round(Number(n) || 0);
    if (!n) return;
    const me = u_();
    try { if (typeof changePoints === 'function') { changePoints(n); return; } } catch (e) { }
    if (me) me.points = Math.max(0, (Number(me.points) || 0) + n);
}

// 값이 없는 칸이 하나라도 섞이면 저장이 통째로 안 된다 — 빼고 보낸다
function save(fields) {
    const me = u_();
    if (!me) return;
    const f = {};
    Object.keys(fields).forEach(function (k) { if (me[k] !== undefined) f[k] = 1; });
    try { if (Object.keys(f).length && typeof saveFields === 'function') saveFields(f); } catch (e) { }
}
function copyFlags(from, to) {
    Object.keys(from).forEach(function (k) { try { to[k] = from[k]; } catch (e) { } });
}

// ==========================================
// 하루 — 자정에 전부 돌아간다
// ==========================================
function dayRoll(u) {
    if (!u || u.moonDay === today()) return false;
    u.moonDay = today();
    u.moonOut = [];
    u.moonCopy = null;
    u.moonTries = 0;
    u.moonT4At = 0;
    u.moonSat = null;
    u.moonShop = { alien: 0 };
    u.moonDeal = null;
    if (u === u_()) {
        save({ moonDay: 1, moonOut: 1, moonCopy: 1, moonTries: 1, moonT4At: 1,
               moonSat: 1, moonShop: 1, moonDeal: 1 });
    }
    return true;
}
function outs(u) {
    if (!u) return [];
    dayRoll(u);
    let o = u.moonOut;
    if (o && !Array.isArray(o) && typeof o === 'object') o = Object.keys(o).map(function (k) { return o[k]; });
    if (!Array.isArray(o)) o = [];
    return o.filter(function (x) { return typeof x === 'string'; });
}
function on(u, id) { return !!(u && wears(u) && outs(u).indexOf(id) >= 0); }
window.moonOn = function (id, u) { return on(u || u_(), id); };
function fixed(u) { return !!(u && wears(u) && outs(u).length >= MOON.DAY_MAX); }
function tat(id) { return MOON_TATS.filter(function (t) { return t.id === id; })[0]; }
function shopOf(u) {
    dayRoll(u);
    const s = (u.moonShop && typeof u.moonShop === 'object') ? u.moonShop : {};
    return { alien: Number(s.alien) || 0 };
}
function dealOf(u) {
    dayRoll(u);
    const d = (u.moonDeal && typeof u.moonDeal === 'object') ? u.moonDeal : null;
    return d ? { max: MOON.T7_MAX, used: Number(d.used) || 0, got: Number(d.got) || 0 } : null;
}
// ④ — 꺼낸 뒤 5시간 동안만
function t4Live(u) {
    if (!on(u, 't4')) return false;
    let at = Number(u.moonT4At) || 0;
    if (!at && u === u_()) { at = u.moonT4At = Date.now(); save({ moonT4At: 1 }); }   // 때가 안 적힌 것은 지금부터
    return Date.now() < at + MOON.T4_MS;
}
function t4Left(u) { return Math.max(0, (Number(u.moonT4At) || 0) + MOON.T4_MS - Date.now()); }
function mult(d) { return d > 0 ? Math.min(MOON.T2_MAX, MOON.T2_STEP * d) : 1; }

// ==========================================
// 물품 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (ITEM_CATALOG[NAME]) { clearInterval(iv); return; }
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false,
            effect: 'equip_moon', noSell: true,
            desc: '[장착] 우주 쇼핑몰의 VIP 쇼핑으로 구입한 일회용 자동 달빛 문신기를 통해 '
                + '심장 위 피부에 새겨진 문신. 오염을 다스릴 수 있으며, 필요할 때마다 꺼내 쓸 수 있다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) {
            NO_SELL_ITEMS.push(NAME);
        }
        clearInterval(iv);
        console.log('[달빛] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._moon) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () {
            const pool = _m.apply(this, arguments);
            if (!Array.isArray(pool)) return pool;
            return pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; });
        };
        copyFlags(_m, w);
        w._moon = true;
        marketSellable = w; window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function addNote(u, line) {
    try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, line); } catch (e) { }
}

(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._moon) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if (inQ(me)) { alert_('격리 중에는 장착할 수 없습니다.'); return; }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 새겨져 있습니다.'); return; }
            if (equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
            dayRoll(me);
            addNote(me, '[장착됨] ' + NAME);
            log_(me, '[' + NAME + '] 심장 위에 새겼습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(NAME + '\n\n심장 위 피부가 서늘해집니다.\n'
                + '하루에 셋까지 꺼낼 수 있습니다. 장착칸의 [문신] 으로 엽니다.');
        };
        copyFlags(_u, w);
        w._moon = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
        console.log('[달빛] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 함수 감싸기 — 누가 위에 또 싸도 다시 맨 바깥으로 간다
// ==========================================
//
//   다른 파일들은 「제 깃발이 붙어 있나」를 보고 그만 싼다. 그래서 감쌀 때
//   안쪽의 깃발을 전부 옮겨 붙인다 (안 그러면 그쪽이 또 싸서 두 번 돈다).
//   내가 두 겹이 되어도 일은 한 번만 한다 — 바깥 겹이 돌고 있는 동안
//   안쪽 겹은 그냥 지나간다 (depth).
function hookFn(name, make, ms) {
    function wrap() {
        let f;
        try { f = window[name]; } catch (e) { return; }
        if (typeof f !== 'function' || f._moon) return;
        const w = make(f);
        copyFlags(f, w);
        w._moon = true;
        try { window[name] = w; } catch (e) { }
    }
    wrap();
    setInterval(function () { try { wrap(); } catch (e) { } }, ms || 1500);
}

// ==========================================
// 문신을 꺼낸다
// ==========================================
function takeOut(id) {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 이 새겨져 있어야 합니다.'); return false; }
    const t = tat(id);
    if (!t) return false;
    const o = outs(me);
    if (o.indexOf(id) >= 0) { alert_('이미 꺼냈습니다.'); return false; }
    if (o.length >= MOON.DAY_MAX) {
        alert_('하루에 꺼낼 수 있는 문신은 최대 셋입니다.\n인간으로서의 한계입니다.\n\n자정에 돌아갑니다.');
        return false;
    }
    o.push(id);
    me.moonOut = o;
    const f = { moonOut: 1, history: 1 };
    const more = [];
    if (id === 't4') {
        me.moonTries = rnd(MOON.T4_LO, MOON.T4_HI);
        me.moonT4At = Date.now();
        me.moonSat = Math.max(1, Number(me.satiety != null ? me.satiety : 100) || 0);
        me.satiety = me.moonSat;
        f.moonTries = 1; f.moonT4At = 1; f.moonSat = 1; f.satiety = 1;
        more.push('지금부터 딱 5시간 — 탐사 ' + me.moonTries + '회 · 포만감이 줄지 않습니다.');
    }
    if (id === 't7') {
        me.moonDeal = { max: MOON.T7_MAX, used: 0, got: 0 };
        f.moonDeal = 1;
        more.push('오늘 계약서 ' + me.moonDeal.max + '장.');
    }
    if (o.length >= MOON.DAY_MAX) {
        if (!inQ(me)) {
            me.pollution = MOON.FIX_POLL;
            me.lastPollutionTime = Date.now();
            f.pollution = 1; f.lastPollutionTime = 1;
        }
        more.push('셋을 모두 꺼냈습니다. 오염도가 ' + MOON.FIX_POLL + ' 으로 고정됩니다 — 자정까지.');
    }
    log_(me, '[' + NAME + '] ' + t.n + ' 을(를) 꺼냈습니다. (' + o.length + ' / ' + MOON.DAY_MAX + ')');
    save(f);
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('[ ' + t.n + ' ]\n\n'
        + (t.q ? t.q + '\n\n' : '')
        + (more.length ? more.join('\n') + '\n\n' : '')
        + '오늘 꺼낸 문신 ' + o.length + ' / ' + MOON.DAY_MAX);
    return true;
}
window.moonTakeOut = takeOut;

// 셋을 다 꺼냈으면 — 50 밑으로는 안 내려간다
setInterval(function () {
    try {
        const me = u_();
        if (!me || !fixed(me) || inQ(me)) return;
        const p = Number(me.pollution) || 0;
        if (p >= MOON.FIX_POLL) return;
        me.pollution = MOON.FIX_POLL;
        save({ pollution: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    } catch (e) { }
}, 1500);

// ==========================================
// ① 유치원 선생님 — 판정 +3
// ==========================================
let bonusDepth = 0;
hookFn('rollDarkBonus', function (_r) {
    return function () {
        if (bonusDepth) return _r.apply(this, arguments);
        bonusDepth++;
        let b = 0;
        try { b = _r.apply(this, arguments) || 0; }
        finally { bonusDepth--; }
        try { if (on(u_(), 't1')) b += MOON.T1_BONUS; } catch (e) { }
        return b;
    };
}, 1500);

const SHUT = ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay',
              'quarantine-pick-overlay', 'fox-loading-overlay'];
function shutRooms() {
    SHUT.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    try { document.body.style.overflow = ''; } catch (e) { }
    try { hasShownFoxAlert = false; } catch (e) { }
}
function cleanBadge(u) {
    if (u && u.badge && typeof u.badge.notes === 'string') {
        const arr = u.badge.notes.split(' | ').filter(function (n) {
            return n.trim() !== '' && n.indexOf('의식 불명') < 0
                && n.indexOf('긴급 이송') < 0 && n.indexOf('사직 반려') < 0;
        });
        u.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
        return true;
    }
    return false;
}


// ==========================================
// ② · ⑥ — 탐사 한 판을 본다
// ==========================================
const TK = 'moonRun_';
let T = null;              // 이번 판 { k, s, at, d, h, sd, g, pid, seen }
let tLive = false;         // 이 화면에서 판이 도는 것을 봤나
let lastSelf = 0;          // 내 죽음을 마지막으로 적은 때
let crisis = {};           // 내 죽을 고비가 열려 있나 (dying · kDoom · epicHelp)
let closedAt = 0;          // 고비가 닫힌 때
let lsnPid = '', lsnRefs = [];

function runKey(r) { return String(r.zone || '') + '|' + String((r.isParty && r.partyId) || 'solo'); }
function tSave() {
    const me = u_();
    if (!me) return;
    try {
        if (T) localStorage.setItem(TK + me.code, JSON.stringify(T));
        else localStorage.removeItem(TK + me.code);
    } catch (e) { }
}
function tLoad(code) {
    try { return JSON.parse(localStorage.getItem(TK + code) || 'null'); } catch (e) { return null; }
}
// 탐사 몫이 아닌 것 (흉내 · 계약서) — 판 몫에서 뺀다
function notRun(n) { if (T) { T.s = (Number(T.s) || 0) + (Number(n) || 0); tSave(); } }
function fresh(k, u) {
    return { k: k, s: Number(u.points) || 0, at: Date.now(), d: 0, h: 0, sd: 0, g: 1, pid: '', seen: {} };
}

function unlisten() {
    lsnRefs.forEach(function (x) { try { x.ref.off(x.ev, x.cb); } catch (e) { } });
    lsnRefs = []; lsnPid = ''; crisis = {};
}
function listen(pid) {
    if (pid === lsnPid) return;
    unlisten();
    lsnPid = pid;
    const d = db_(), me = u_();
    if (!pid || !d || !me) return;
    function add(path, ev, cb) {
        try { const ref = d.ref(path); ref.on(ev, cb); lsnRefs.push({ ref: ref, ev: ev, cb: cb }); } catch (e) { }
    }
    // 일행의 죽음 — 죽은 사람 화면이 적는다
    add('darkParties/' + pid + '/moonDie', 'child_added', function (s) {
        try {
            const v = s.val() || {}, key = s.key, u = u_();
            if (!T || !u || !key || T.seen[key]) return;
            T.seen[key] = 1;
            if (v.c === u.code || (Number(v.at) || 0) < T.at - 5000) { tSave(); return; }
            if (on(u, 't2') && !T.sd) {
                T.d++;
                toast('☠ 1학년 5반에서 사망사고가 일어났습니다. — 포인트 ×' + mult(T.d));
            }
            tSave();
        } catch (e) { }
    });
    // 일행이 넘겨준 배수
    add('darkParties/' + pid + '/moonGift', 'value', function (s) {
        try {
            const all = s.val() || {}, u = u_();
            if (!T || !u) return;
            let g = 1;
            Object.keys(all).forEach(function (c) {
                const v = all[c] || {};
                if (c === u.code || (Number(v.at) || 0) < T.at - 5000) return;
                g = Math.max(g, Math.min(MOON.T2_MAX, Number(v.m) || 1));
            });
            if (g > (T.g || 1)) {
                T.g = g;
                toast('☠ ' + '쌓인 배수가 이쪽으로 왔다 — 포인트 ×' + g);
            }
            tSave();
        } catch (e) { }
    });
    // 내 죽을 고비 — 방에 내 이름이 생기면
    ['dying', 'kDoom', 'epicHelp'].forEach(function (n) {
        add('darkParties/' + pid + '/' + n + '/' + me.code, 'value', function (s) {
            const ex = !!s.val();
            if (ex && !crisis[n]) { crisis[n] = true; selfEvent('crisis'); }
            else if (!ex && crisis[n]) { crisis[n] = false; closedAt = Date.now(); }
        });
    });
}

// 내가 죽었다 (고비 포함) — 방에 적고, ② 가 쌓은 것은 일행에게 넘긴다
function selfEvent(kind) {
    const u = u_();
    if (!u) return;
    const now = Date.now();
    if (now - lastSelf < 4000) return;
    lastSelf = now;
    const d = db_();
    const pid = T && T.pid;
    try { if (pid && d) d.ref('darkParties/' + pid + '/moonDie').push({ c: u.code, at: now, k: kind }); } catch (e) { }
    if (T && on(u, 't2') && !T.sd) {
        T.sd = 1;
        const m = mult(T.d);
        try {
            if (m > 1 && pid && d) d.ref('darkParties/' + pid + '/moonGift/' + u.code).set({ m: m, by: u.name, at: now });
        } catch (e) { }
        toast('☠ 1학년 5반 — ' + (m > 1 ? '쌓인 ×' + m + ' 이 일행에게 갑니다' : '이번 탐사 포인트는 없습니다'));
    }
    tSave();
}
function deathCall() {
    const open = Object.keys(crisis).some(function (k) { return crisis[k]; });
    if (open || Date.now() - closedAt < 4000) return;      // 고비 끝에 그대로 죽은 것 — 한 번으로 센다
    selfEvent('death');
}
window.moonDeathCall = deathCall;

// 죽음이 닿는 자리 — 어둠 · K 의 방 · ■■의 ■■■
let deathDepth = 0;
hookFn('darkDeath', function (_d) {
    return function () {
        if (!deathDepth) {
            try { const r = run(); if (!(r && r._dead)) deathCall(); } catch (e) { }
        }
        deathDepth++;
        try { return _d.apply(this, arguments); } finally { deathDepth--; }
    };
}, 1000);
let kdDepth = 0;
hookFn('kroomDie', function (_k) {
    return function () {
        if (!kdDepth) { try { deathCall(); } catch (e) { } }
        kdDepth++;
        try { return _k.apply(this, arguments); } finally { kdDepth--; }
    };
}, 2000);
let epDepth = 0;
hookFn('epicSettle', function (_e) {
    return function (how) {
        if (!epDepth) {
            try {
                if (how === 'dead') deathCall();
                if (T && typeof er !== 'undefined' && er) T.h = Math.max(T.h || 0, Number(er.helped) || 0);
                tSave();
            } catch (e) { }
        }
        epDepth++;
        try { return _e.apply(this, arguments); } finally { epDepth--; }
    };
}, 2000);

// 남을 도왔다 — 도운 쪽 화면이 방에 알리는 글로 센다
const HELP_RE = /(동료를 붙잡았습니다|동료를 되살렸습니다|사원을 끌어냈습니다|사원을 치유로 일으켰습니다|사원을 붙잡았습니다)\.?$/;
let chatDepth = 0;
hookFn('sendPartyChat', function (_s) {
    return function (text) {
        if (!chatDepth) {
            try {
                const u = u_();
                if (u && T && typeof text === 'string' && text.indexOf(u.name + ' 사원이 ') === 0 && HELP_RE.test(text)) {
                    T.h = (T.h || 0) + 1;
                    tSave();
                    if (on(u, 't6') && T.h <= MOON.T6_HELP_MAX) toast('🐈‍⬛ 이쪽. (+' + won(MOON.T6_HELP) + ')');
                }
            } catch (e) { }
        }
        chatDepth++;
        try { return _s.apply(this, arguments); } finally { chatDepth--; }
    };
}, 2000);

// 판이 끝났다 — ② 배수 · ⑥ 추가 정산
function finish() {
    const t = T, u = u_();
    T = null; tLive = false; tSave(); unlisten();
    lastSelf = 0; closedAt = 0;
    if (!t || !u) return;
    if (t.hp) return;                                      // 헬퍼 — 포인트를 받지 않는다
    const gained = (Number(u.points) || 0) - (Number(t.s) || 0);
    const two = on(u, 't2'), six = on(u, 't6');
    const lines = [];
    let net = 0;
    if (two && t.sd) {
        if (gained > 0) { pay(-gained); net -= gained; }
        lines.push('[ 세광공업고등학교 학생 ]\n이번 탐사에서 죽었습니다. 포인트를 받지 못합니다.'
            + (gained > 0 ? ' (−' + won(gained) + ')' : ''));
    } else {
        let m = two ? mult(t.d) : 1;
        let from = two && m > 1 ? '함께 간 사람이 ' + t.d + '번 죽었습니다' : '';
        if ((t.g || 1) > m) { m = t.g; from = '일행이 쌓아 둔 배수를 넘겨받았습니다'; }
        if (m > 1 && gained > 0) {
            const add = Math.round(gained * (m - 1));
            pay(add); net += add;
            lines.push('[ 세광공업고등학교 학생 ]\n' + from + ' — 포인트 ×' + m
                + '\n' + won(gained) + ' → ' + won(gained + add));
        }
        if (six) {
            const h = Math.min(MOON.T6_HELP_MAX, Number(t.h) || 0);     // 한 탐사에 3번까지
            const add = MOON.T6_BASE + MOON.T6_HELP * h;
            pay(add); net += add;
            lines.push('[ 검은 고양이 ]\n이쪽. — 추가 정산 +' + won(add)
                + (h ? ' (도운 것 ' + h + '번)' : ''));
        }
    }
    if (!lines.length) return;
    log_(u, '[' + NAME + '] 탐사 정산 ' + (net >= 0 ? '+' : '−') + won(Math.abs(net)));
    save({ history: 1 });
    setTimeout(function () { alert_('🌙 ' + NAME + '\n\n' + lines.join('\n\n')); }, 1200);
}

setInterval(function () {
    try {
        const u = u_();
        if (!u) return;
        const r = run();
        if (r && r.zone) {
            const k = runKey(r);
            if (T && T.k !== k) { if (tLive) finish(); else T = null; }
            let dirty = false;
            if (!T) {
                const old = tLoad(u.code);
                T = (old && old.k === k && Date.now() - (old.at || 0) < 6 * 3600000) ? old : fresh(k, u);
                if (!T.seen) T.seen = {};
                dirty = true;
            }
            tLive = true;
            const pid = (r.isParty && r.partyId) ? r.partyId : '';
            if (T.pid !== pid) { T.pid = pid; dirty = true; }
            // 헬퍼로 들어온 탐사는 받지 않는다 (party-helper.js)
            if (!T.hp) { try { if (typeof iAmHelper === 'function' && iAmHelper()) { T.hp = 1; dirty = true; } } catch (e) { } }
            if (dirty) tSave();
            listen(T.pid);
            return;
        }
        if (T) {
            if (tLive) { finish(); return; }
            // 새로고침 뒤 — 다시 들어오기를 잠깐 기다린다
            if (Date.now() - BOOT > 10 * 60000) { T = null; tSave(); }
            return;
        }
        const old = (Date.now() - BOOT < 15000) ? tLoad(u.code) : null;
        if (old && old.k && Date.now() - (old.at || 0) < 6 * 3600000) { T = old; tLive = false; }
    } catch (e) { }
}, 500);

// ==========================================
// ③ 흉내장이 — 예금의 5%
// ==========================================
function copyPick() {
    const me = u_();
    if (!on(me, 't3')) { alert_('흉내장이를 꺼내야 합니다.'); return; }
    if (me.moonCopy && me.moonCopy.c) { alert_('오늘은 이미 ' + (me.moonCopy.n || nameOf(me.moonCopy.c)) + ' 사원을 흉내 냈습니다.'); return; }
    const list = users().filter(function (x) { return x.code !== me.code; });
    if (!list.length) { alert_('흉내 낼 사원이 없습니다.'); return; }
    const rows = list.map(function (t) {
        return '<button class="game-btn mn-cp" data-c="' + esc(t.code) + '" style="' + BTN + '">'
            + esc(t.name) + ' <span style="font-size:9px; color:#7c87a8;">사번 ' + esc(t.no || '-') + '</span></button>';
    }).join('');
    const w = box(head('흉내장이 — 누구를 흉내 내나',
        '고른 사원의 예금 통장 총액의 ' + Math.round(MOON.T3_RATE * 100) + '% 를 받습니다. '
        + '그쪽 포인트는 그대로입니다. 하루 한 번입니다.<br>'
        + '<span style="color:#b9c8ff; font-style:italic;">' + esc(MOON_TATS[2].q) + '</span>')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="mn-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#mn-x').onclick = window.moonMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.mn-cp'), function (b) {
        b.onclick = function () { copyGo(b.dataset.c); };
    });
}
function copyGo(code) {
    const me = u_(), d = db_();
    if (!me || !on(me, 't3')) return;
    if (me.moonCopy && me.moonCopy.c) return;
    if (!d) { alert_('서버에 닿지 못했습니다.'); return; }
    shut();
    d.ref('bank/' + code).once('value').then(function (s) {
        const b = s.val() || {};
        const dep = Math.max(0, Math.floor(Number(b.deposit) || 0));
        const got = Math.floor(dep * MOON.T3_RATE);
        const nm = nameOf(code);
        if (me.moonCopy && me.moonCopy.c) return;
        if (got <= 0) {
            alert_('[ 흉내장이 ]\n\n' + nm + ' 사원의 통장이 비어 있습니다.\n다른 사원을 고르십시오. (오늘 횟수는 그대로입니다)');
            return;
        }
        me.moonCopy = { c: code, n: nm, got: got, at: Date.now() };
        pay(got); notRun(got);
        log_(me, '[' + NAME + ' · 흉내장이] ' + nm + ' 사원을 흉내 냈습니다 (+' + won(got) + ')');
        save({ moonCopy: 1, history: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_('[ 흉내장이 ]\n\n' + MOON_TATS[2].q + '\n\n'
            + nm + ' 사원의 예금 ' + won(dep) + ' 의 ' + Math.round(MOON.T3_RATE * 100) + '%\n+' + won(got));
    }).catch(function () { alert_('통장을 읽지 못했습니다.'); });
}

// ==========================================
// ④ 토크쇼 방송인 — 포만감 · 탐사 횟수
// ==========================================
setInterval(function () {
    try {
        const me = u_();
        if (!me || !t4Live(me)) return;
        const s = Number(me.satiety != null ? me.satiety : 100) || 0;
        let keep = Math.max(1, Number(me.moonSat) || 0);
        if (s > keep) { me.moonSat = s; save({ moonSat: 1 }); return; }
        if (s < keep) {
            me.satiety = keep;
            me.moonSat = keep;
            save({ satiety: 1, moonSat: 1 });
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        }
    } catch (e) { }
}, 1500);

// 남은 탐사 — 한도 쪽(count-cap)이 먼저 싼 뒤에 맨 바깥에서 싼다
let triesDepth = 0;
(function hookTries() {
    function make(_g) {
        return function () {
            if (triesDepth) return _g.apply(this, arguments);
            triesDepth++;
            let n;
            try { n = _g.apply(this, arguments); } finally { triesDepth--; }
            try {
                const u = u_();
                if (u && t4Live(u) && Number(u.moonTries) > 0) {
                    const used = (u.darkDate === today()) ? (Number(u.darkTries) || 0) : 0;
                    return Math.max(Number(n) || 0, Number(u.moonTries) - used);
                }
            } catch (e) { }
            return n;
        };
    }
    function wrap() {
        if (typeof getDarkTriesLeft !== 'function' || getDarkTriesLeft._moon) return;
        if (!getDarkTriesLeft._capDark && Date.now() - BOOT < 20000) return;
        const _g = getDarkTriesLeft;
        const w = make(_g);
        copyFlags(_g, w);
        w._moon = true;
        getDarkTriesLeft = w;
        try { window.getDarkTriesLeft = w; } catch (e) { }
    }
    setInterval(function () { try { wrap(); } catch (e) { } }, 1500);
})();

// ==========================================
// ⑤ 룩키마트 직원 — 상점 리셋
// ==========================================
const SHOP_NAME = { alien: '우주 쇼핑몰' };
function alienMax() {
    try { if (typeof ALIEN_DAILY_MAX !== 'undefined') return ALIEN_DAILY_MAX; } catch (e) { }
    return 4;
}
function shopReset(kind) {
    kind = 'alien';                     // ⑤ 는 우주 쇼핑몰만 (2026-10-18)
    const me = u_();
    if (!me || !on(me, 't5')) { alert_('룩키마트 직원을 꺼내야 합니다.'); return; }
    const s = shopOf(me);
    if (s[kind] >= MOON.T5_TIMES) { alert_('오늘 ' + SHOP_NAME[kind] + ' 리셋은 다 썼습니다.'); return; }
    let note = '';
    if (kind === 'alien') {
        let cyc = '';
        try { cyc = get22HourCycleStr(); } catch (e) { }
        const max = alienMax();
        const used = (me.alienDate === cyc) ? (Number(me.alienDailyUsed) || 0) : 0;
        const bought = (me.alienDate === cyc && Array.isArray(me.alienBoughtItems)) ? me.alienBoughtItems : [];
        const waiting = !!(me.alienDate === cyc && me.lastAlienPlayTime && used >= 1);
        if (me.alienDate !== cyc || (max - used >= MOON.T5_ALIEN && !bought.length && !waiting)) {
            alert_('우주 쇼핑몰에는 아직 리셋할 것이 없습니다.'); return;
        }
        if (me.alienBout) { alert_('주파수를 맞추는 중입니다.\n세 판을 마친 뒤에 리셋하십시오.'); return; }
        me.alienDailyUsed = Math.min(used, max - MOON.T5_ALIEN);
        me.lastAlienPlayTime = 0;
        me.alienUnlockedItems = (me.alienUnlockedItems || []).filter(function (x) { return bought.indexOf(x) < 0; });
        me.alienBoughtItems = [];
        save({ alienDailyUsed: 1, lastAlienPlayTime: 1, alienUnlockedItems: 1, alienBoughtItems: 1 });
        note = '주파수 ' + (max - me.alienDailyUsed) + '회가 남았습니다. 기다리지 않고 바로 맞출 수 있습니다.'
            + (bought.length ? '\n품절된 ' + bought.length + '칸을 비웠습니다.' : '');
        try {
            ['btn-hl-high', 'btn-hl-low'].forEach(function (id) { const b = document.getElementById(id); if (b) b.disabled = false; });
            if (typeof renderAlienShop === 'function') renderAlienShop();
        } catch (e) { }
    } else return;
    s[kind]++;
    me.moonShop = s;
    log_(me, '[' + NAME + ' · 룩키마트 직원] ' + SHOP_NAME[kind] + ' 리셋 (' + s[kind] + ' / ' + MOON.T5_TIMES + ')');
    save({ moonShop: 1, history: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('[ 룩키마트 직원 ]\n\n' + MOON_TATS[4].q + '\n\n' + SHOP_NAME[kind] + ' 을(를) 리셋했습니다.\n'
        + note + '\n\n오늘 ' + SHOP_NAME[kind] + ' 리셋 ' + s[kind] + ' / ' + MOON.T5_TIMES);
    if (document.querySelector('.' + MOD)) window.moonMenu();
}
window.moonShopReset = shopReset;

// ==========================================
// ⑦ 골든 마스코트 — 계약서
// ==========================================
function dealPick() {
    const me = u_();
    if (!on(me, 't7')) { alert_('골든 마스코트를 꺼내야 합니다.'); return; }
    const d = dealOf(me);
    if (!d || d.used >= d.max) { alert_('오늘 계약서는 다 보냈습니다.'); return; }
    const list = users().filter(function (x) { return x.code !== me.code && inQ(x); });
    const rows = list.map(function (t) {
        const bath = (t.quarantineDest || 'fox') === 'bath';
        const left = Math.max(0, Math.ceil((t.quarantineUntil - Date.now()) / 60000));
        return '<button class="game-btn mn-dl" data-c="' + esc(t.code) + '" style="' + BTN + '">'
            + esc(t.name) + ' <span style="font-size:9px; color:#7c87a8;">사번 ' + esc(t.no || '-') + '</span>'
            + '<div style="font-size:9px; color:#d9c27a; margin-top:2px;">' + (bath ? '♨ 선녀탕' : '🦊 상담실')
            + ' · 남은 ' + Math.floor(left / 60) + '시간 ' + (left % 60) + '분</div>'
            + (foodQ(t) ? '<div style="font-size:9px; color:#ffb74d; margin-top:2px;">🍽 음식으로 갇힘 — 계약서는 쓰이지만 포인트 없음</div>' : '')
            + '</button>';
    }).join('');
    const w = box(head('골든 마스코트 — 계약서 ' + (d.max - d.used) + ' / ' + d.max + '장',
        '상담실 · 선녀탕에 있는 사원에게 계약서를 보내 멀끔한 상태(오염도 0)로 바로 꺼냅니다.<br>'
        + '한 장에 ' + won(MOON.T7_PAY) + ' 를 받습니다.')
        + '<div style="' + SCROLL + '">' + (rows || '<div style="font-size:11px; color:#7c87a8; padding:14px 4px; text-align:center;">지금 상담실 · 선녀탕에 있는 사원이 없습니다.</div>') + '</div>'
        + '<button id="mn-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#mn-x').onclick = window.moonMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.mn-dl'), function (b) {
        b.onclick = function () { dealGo(b.dataset.c); };
    });
}
// 음식으로 오른 오염도로 갇혔나 (food-quar.js) — 꺼내 주고 계약서도 쓰이지만 포인트는 없다
function foodQ(x) {
    try { return typeof window.quarFood === 'function' && !!window.quarFood(x); } catch (e) { return false; }
}
let dealBusy = false;
function dealGo(code) {
    const me = u_();
    if (!me || !on(me, 't7') || dealBusy) return;
    const d0 = dealOf(me);
    if (!d0 || d0.used >= d0.max) { alert_('오늘 계약서는 다 보냈습니다.'); return; }
    shut();
    dealBusy = true;
    // ★ 보내기 전에 서버에서 한 번 새로 읽는다.
    //   save-merge 는 「읽은 뒤 손대지 않은 열쇠」를 빼고 보낸다. 묵은 읽기가 남아
    //   있으면 0 · false · null 로 바꾸는 칸(격리 · 오염도)이 손대지 않은 것으로
    //   보여 통째로 빠졌다. 새로 읽으면 그 기준이 지금 모습이 된다.
    //   갇혀 있는지도 서버 모습으로 다시 본다.
    const dbx = db_();
    const go = function (srv) {
        dealBusy = false;
        const local = userOf(code);
        const cur = srv || local;
        const d = dealOf(me);
        if (!d || d.used >= d.max) { alert_('오늘 계약서는 다 보냈습니다.'); return; }
        if (!cur || !inQ(cur)) { alert_('그 사원은 이미 나왔습니다.'); return; }
        const now = Date.now();
        const nm = cur.name || nameOf(code);
        const bath = (cur.quarantineDest || 'fox') === 'bath';
        const food = foodQ(cur);
        const x = {
            badge: cur.badge ? JSON.parse(JSON.stringify(cur.badge)) : undefined,
            history: Array.isArray(cur.history) ? cur.history.slice() : []
        };
        const f = {
            quarantineUntil: 0, quarantineExitPollution: 0, quarantineHospital: false, quarantineDest: null,
            pollution: 0, lastPollutionTime: now, foxRoomAnswered: false, quarCause: null, quarFood: null,
            moonFreed: { by: me.code, byName: me.name, at: now }, hasItemUsedOnMe: true
        };
        if (cleanBadge(x)) f.badge = x.badge;
        log_(x, '[' + NAME + ' · 골든 마스코트] ' + me.name + ' 사원의 계약서로 ' + (bath ? '선녀탕' : '상담실') + '에서 나왔습니다.');
        f.history = x.history;
        if (local) Object.keys(f).forEach(function (k) { local[k] = f[k]; });
        try { if (typeof updateUserFields === 'function') updateUserFields(code, Object.assign({}, f)); } catch (e) { }

        // ★ 음식으로 오른 오염도로 갇혔던 사람 — 계약서는 쓰이고 꺼내 주지만 포인트는 없다
        const got = food ? 0 : MOON.T7_PAY;
        if (got) { pay(got); notRun(got); }
        d.used++; d.got += got;
        me.moonDeal = d;
        log_(me, '[' + NAME + ' · 골든 마스코트] ' + nm + ' 사원에게 계약서 ('
            + (food ? '음식으로 갇힘 — 포인트 없음' : '+' + won(got)) + ')');
        save({ moonDeal: 1, history: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_('[ 골든 마스코트 ]\n\n' + nm + ' 사원에게 계약서를 보냈습니다.\n'
            + (bath ? '선녀탕' : '상담실') + '에서 멀끔한 상태로 나왔습니다.\n\n'
            + (food ? '음식으로 오른 오염도로 갇혔던 사원이라 포인트는 들어오지 않습니다.' : '+' + won(got))
            + '\n\n오늘 남은 계약서 ' + (d.max - d.used) + ' / ' + d.max + '장');
    };
    if (!dbx) { go(null); return; }
    dbx.ref('users/' + code).once('value')
        .then(function (sn) { go(sn && sn.val ? sn.val() : null); })
        .catch(function () { go(null); });
}

// 계약서를 받은 쪽 — 방을 닫고 알린다 (자리에 없었으면 들어올 때)
setInterval(function () {
    try {
        const me = u_();
        if (!me || !me.moonFreed || !me.moonFreed.at) return;
        const at = Number(me.moonFreed.at) || 0;
        if (at <= (Number(me.moonFreedSeen) || 0)) return;
        if (inQ(me)) return;                     // 풀린 모습이 아직 안 내려왔다 — 다음에 본다
        me.moonFreedSeen = at;
        save({ moonFreedSeen: 1 });
        shutRooms();
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        wakePop();
    } catch (e) { }
}, 2000);

// 계약서를 받은 쪽에 뜨는 창 — 노란 글씨 두 줄
function wakePop() {
    const ID = 'moon-wake-pop';
    const old = document.getElementById(ID);
    if (old) old.remove();
    if (!document.getElementById('moon-wake-css')) {
        const st = document.createElement('style');
        st.id = 'moon-wake-css';
        st.textContent = '@keyframes moonWakeIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}'
            + '#moon-wake-pop .mw-l{display:block;font-size:40px;font-weight:900;color:#ffd400;'
            + 'letter-spacing:0.12em;line-height:1.5;text-shadow:0 0 14px rgba(255,212,0,0.55),0 2px 0 #4a3a00;}';
        document.head.appendChild(st);
    }
    const w = document.createElement('div');
    w.id = ID;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999990; display:flex; flex-direction:column;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.88); padding:16px;'
        + ' text-align:center; animation:moonWakeIn .35s ease-out;';
    w.innerHTML = '<div><span class="mw-l">일 어 나</span><span class="mw-l">일 하 자</span></div>'
        + '<button class="game-btn" style="margin:28px 0 0 0; padding:10px 34px; font-size:12px;'
        + ' background:linear-gradient(145deg,#6a5400,#2e2400) !important; border-color:#ffd400 !important;'
        + ' color:#ffe680 !important;">확인</button>';
    w.querySelector('button').onclick = function () { w.remove(); };
    document.body.appendChild(w);
}
window.moonWakePop = wakePop;

// ==========================================
// [문신] 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#22252e !important; border-color:#3a3f4d !important; color:#9aa0ad !important;';
const MOONB = ' background:linear-gradient(145deg,#2d3a66,#161d38) !important; border-color:#8fa8d8 !important; color:#eef2ff !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:58dvh; margin-bottom:9px;';

function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); });
}
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999992; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(2,4,10,0.86); padding:16px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#121830,#06080f);'
        + ' border:1px solid #6f86c0; border-radius:12px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:88dvh; display:flex; flex-direction:column;'
        + ' box-shadow:0 0 26px rgba(120,150,230,0.25), 0 8px 30px rgba(0,0,0,0.75);">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#e3eaff; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#8790ab; margin:4px 0 11px 0; line-height:1.7;">'
            + sub + '</div>' : '<div style="height:9px;"></div>');
}
function smallBtn(id, label, dis) {
    return '<button class="game-btn" data-act="' + id + '"' + (dis ? ' disabled' : '')
        + ' style="width:100%; margin:6px 0 0 0; padding:8px; font-size:11px;' + (dis ? GREY : MOONB) + '">'
        + label + '</button>';
}

function state(u, id) {
    const T_ = T;
    if (id === 't1') return '판정 +' + MOON.T1_BONUS;
    if (id === 't2') {
        if (!T_) return '탐사 중이 아닙니다. 함께 간 사람이 죽을 때마다 ×' + MOON.T2_STEP + ' (최대 ×' + MOON.T2_MAX + ')';
        if (T_.sd) return '<b style="color:#e08a8a;">이번 탐사에서 죽었습니다 — 포인트 없음</b>';
        return '이번 탐사 — 죽음 ' + (T_.d || 0) + '번 · 포인트 ×' + mult(T_.d || 0);
    }
    if (id === 't3') return u.moonCopy && u.moonCopy.c
        ? '오늘 ' + esc(u.moonCopy.n || nameOf(u.moonCopy.c)) + ' 사원을 흉내 냈습니다 (+' + won(u.moonCopy.got) + ')'
        : '아직 아무도 흉내 내지 않았습니다.';
    if (id === 't4') {
        if (!t4Live(u)) return '<b style="color:#9aa0ad;">5시간이 지났습니다 — 탐사 횟수 · 포만감이 원래대로 돌아갔습니다.</b>';
        const ms = t4Left(u), hh = Math.floor(ms / 3600000), mm = Math.floor((ms % 3600000) / 60000);
        let left = '';
        try { left = ' · 남은 ' + getDarkTriesLeft() + '회'; } catch (e) { }
        return '탐사 ' + (Number(u.moonTries) || 0) + '회' + left + ' · 포만감 유지 · <b style="color:#e3eaff;">' + hh + '시간 ' + mm + '분 남음</b>';
    }
    if (id === 't5') { const s = shopOf(u); return '우주 쇼핑몰 리셋 ' + s.alien + ' / ' + MOON.T5_TIMES + '회'; }
    if (id === 't6') return '탐사마다 +' + won(MOON.T6_BASE) + ' · 도울 때마다 +' + won(MOON.T6_HELP) + ' (한 탐사에 ' + MOON.T6_HELP_MAX + '번까지)'
        + (T_ ? ' · 이번 탐사 도운 것 ' + Math.min(MOON.T6_HELP_MAX, T_.h || 0) + '번' : '');
    if (id === 't7') { const d = dealOf(u); return d ? '계약서 ' + (d.max - d.used) + ' / ' + d.max + '장 · 오늘 받은 몫 ' + won(d.got) : ''; }
    return '';
}
function actions(u, id) {
    if (id === 't3') return smallBtn('copy', '흉내 낼 사원을 고른다', !!(u.moonCopy && u.moonCopy.c));
    if (id === 't5') {
        const s = shopOf(u);
        return ['alien'].map(function (k) {
            return smallBtn('shop-' + k, SHOP_NAME[k] + ' 리셋 (' + (MOON.T5_TIMES - s[k]) + '회 남음)', s[k] >= MOON.T5_TIMES);
        }).join('');
    }
    if (id === 't7') { const d = dealOf(u); return smallBtn('deal', '계약서를 보낸다', !d || d.used >= d.max); }
    return '';
}

window.moonMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 이 새겨져 있어야 합니다.'); return; }
    const o = outs(me);
    const full = o.length >= MOON.DAY_MAX;
    const cards = MOON_TATS.map(function (t, i) {
        const isOut = o.indexOf(t.id) >= 0;
        let tail = '';
        if (isOut) {
            tail = '<div style="font-size:10px; color:#c9d4f5; margin-top:7px; line-height:1.6;">' + state(me, t.id) + '</div>'
                + actions(me, t.id);
        } else if (!full) {
            const third = (o.length === MOON.DAY_MAX - 1);
            tail = '<button class="game-btn" data-take="' + t.id + '"' + (third ? ' data-third="1"' : '')
                + ' style="width:100%; margin:8px 0 0 0; padding:8px; font-size:11px;' + MOONB + '">꺼낸다</button>';
        }
        return '<div style="border:1px solid ' + (isOut ? '#8fa8d8' : '#262d45') + '; border-radius:8px; padding:10px; margin-bottom:8px;'
            + ' background:' + (isOut ? 'rgba(60,80,140,0.28)' : 'rgba(24,30,52,0.55)') + ';' + (!isOut && full ? ' opacity:0.5;' : '') + '">'
            + '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">'
            + '<div style="font-size:12px; color:#eef2ff; font-weight:bold;">' + (i + 1) + '. ' + esc(t.n) + '</div>'
            + (isOut ? '<div style="font-size:9px; color:#0b1020; background:#b9c8ff; border-radius:9px; padding:2px 8px; flex-shrink:0;">꺼냄</div>' : '')
            + '</div>'
            + '<div style="font-size:9.5px; color:#8f9ab8; line-height:1.65; margin-top:5px;">' + esc(t.d) + '</div>'
            + (t.q ? '<div style="font-size:9.5px; color:#b9c8ff; font-style:italic; margin-top:5px;">' + esc(t.q) + '</div>' : '')
            + tail + '</div>';
    }).join('');
    const w = box(head('🌙 달빛 문신',
        '하루에 꺼낼 수 있는 문신은 최대 셋. 인간으로서의 한계입니다. 꺼낸 것은 자정에 돌아갑니다.<br>'
        + '오늘 꺼낸 문신 <b style="color:#e3eaff;">' + o.length + ' / ' + MOON.DAY_MAX + '</b>'
        + (full ? ' · <b style="color:#ffcf8f;">오염도 ' + MOON.FIX_POLL + ' 고정 — 50 밑으로는 내려가지 않습니다 (자정까지)</b>'
                : ' · 셋을 모두 꺼내면 오염도가 ' + MOON.FIX_POLL + ' 으로 고정됩니다.'))
        + '<div style="' + SCROLL + '">' + cards + '</div>'
        + '<button id="mn-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#mn-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('[data-take]'), function (b) {
        b.onclick = function () {
            if (b.dataset.third === '1' && b.dataset.sure !== '1') {
                b.dataset.sure = '1';
                b.innerHTML = '셋째입니다 — 오염도가 ' + MOON.FIX_POLL + ' 으로 고정됩니다. 그래도 꺼낸다';
                b.style.cssText += ' background:linear-gradient(145deg,#6a4a1a,#3a2608) !important; border-color:#ffcf8f !important;';
                return;
            }
            shut();
            takeOut(b.dataset.take);
        };
    });
    Array.prototype.forEach.call(w.querySelectorAll('[data-act]'), function (b) {
        b.onclick = function () {
            const a = b.dataset.act;
            if (a === 'copy') copyPick();
            else if (a === 'deal') dealPick();
            else if (a.indexOf('shop-') === 0) shopReset(a.slice(5));
        };
    });
};

// 장착칸의 [문신] 단추
(function badgeBtn() {
    const ID = 'moon-btn';
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.querySelector('#' + ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;'
            + ' background:linear-gradient(145deg,#2d3a66,#121830) !important;'
            + ' border-color:#8fa8d8 !important; color:#eef2ff !important;';
        b.textContent = '문신';
        b.onclick = window.moonMenu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._moonBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            const w = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            copyFlags(_r, w);
            w._moonBtn = true;
            renderInventory = w;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
window.moonGive = function (who, n) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(3, Number(n) || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '개 지급');
    try {
        if (typeof updateUserFields === 'function') {
            updateUserFields(t.code, { inventory: t.inventory, history: t.history });
        }
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#8fa8d8');
};

window.moonState = function (who) {
    const t = find(who) || u_();
    if (!t) { console.log('로그인 전입니다.'); return; }
    const o = outs(t);
    console.log('%c===== 🌙 달빛 문신 · ' + t.name + ' =====', 'color:#8fa8d8; font-size:13px');
    console.log('  새겨져 있나 :', wears(t) ? 'O' : '✗');
    console.log('  꺼낸 문신   :', o.map(function (id) { return tat(id).n; }).join(' · ') || '없음',
        '(' + o.length + ' / ' + MOON.DAY_MAX + ')' + (o.length >= MOON.DAY_MAX ? ' · 오염도 50 고정' : ''));
    console.log('  ③ 흉내      :', t.moonCopy && t.moonCopy.c ? (t.moonCopy.n + ' +' + won(t.moonCopy.got)) : '-');
    console.log('  ④ 탐사 횟수 :', t.moonTries || '-', '· 포만감', t.moonSat == null ? '-' : t.moonSat);
    const s = shopOf(t);
    console.log('  ⑤ 리셋      : 우주 쇼핑몰 ' + s.alien + ' / ' + MOON.T5_TIMES);
    const d = dealOf(t);
    console.log('  ⑦ 계약서    :', d ? (d.used + ' / ' + d.max + ' · ' + won(d.got)) : '-');
    if (t === u_()) console.log('  이번 탐사   :', T ? JSON.stringify({ 죽음: T.d, 도움: T.h, 내죽음: !!T.sd, 넘겨받은배수: T.g, 시작포인트: T.s }) : '밖');
};

window.MOONTAT = { MOON: MOON, TATS: MOON_TATS, wears: wears, on: on, outs: outs, dayRoll: dayRoll,
                   fixed: fixed, mult: mult, finish: finish, selfEvent: selfEvent,
                   run: function () { return T; }, t4Live: t4Live, shopReset: shopReset,
                   dealGo: dealGo, copyGo: copyGo };

console.log('[달빛] moonGive(사번) · moonState(사번) · moonMenu()');

})();
