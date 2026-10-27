// ==========================================
// ★ 📖 〈종말예언 : 어둠탐사기록〉 — 상담사 지급 전용 (옛 이름 🧧 지산의 복 : 대리자 · 2026-10-21 바꿈)
// bundles.json 마지막 묶음, babyfox.js 보다 뒤 (맨 끝)
// ==========================================
//
//   ■■이라 부르는 각종 ■■■을 ■■한 ■■ ― 이름님께서 하사하신 경전이다.
//   그런데그걸왜네가가지고있어?
//
//   은심장 · 호사수구 · K.LEE · 아기 여우와 같은 결이다. 어느 상점에도
//   안 깔리고 팔 수도 없다. 주는 법은 jisanGive(사번) 과 당국 화면의
//   「물품 강제 꽂기」뿐이다.
//
//   ★ 이름의 꺾쇠는 〈 〉 (전각)로 적는다. < > 를 그대로 쓰면 물품 이름을
//     innerHTML 로 그리는 자리마다 태그로 읽혀 이름이 사라진다.
//   ★ 옛 이름으로 든 것은 들어올 때 새 이름으로 바꾼다 (가방 · 장착칸 · 주인 표 · 특이사항).
//
// ■ 다섯 가지
//
//   1. 덧쓰기
//      장착자가 탐사 중 죽으면(오염도가 차서 죽는 것 포함) 그 어둠에서 얻을 수 있는
//      회수품 전체 — 각성 돌파권 · 확정 승인서 포함 — 가운데 1~3종을 무작위로 받는다.
//      죽음은 그대로 간다. EPIC · K의 방은 회수품 표가 따로 없어 어둠 전 구역의 것에서 고른다.
//      🎻 신성의 바이올린은 세계에 하나뿐이라 넣지 않는다.
//
//   1(추가). 지우기
//      장착자와 같은 파티로 탐사할 때, 파티원이 죽거나 오염도가 차면 장착자가 대신 죽기를
//      고를 수 있다. 장착자 화면에 창이 뜨고, 「대신 죽는다」를 누르면 장착자가 죽고
//      그 파티원은 **죽기 직전에 구해져 탐사를 이어 간다** (오염도가 찼던 것이면 50% 로).
//      ★ 2026-10-22 — 전에는 그 자리에서 무사히 「나왔다」. 죽은 것처럼 바로 밖으로 나와
//        탐사를 더 할 수 없었으므로, 동료가 끌어낸 것처럼 그 자리에서 일어서게 바꿨다.
//        · 어둠    죽음이 닿는 순간 그 파티원은 20초 동안 멈춰 기다린다 — 답이 없으면 그대로 죽는다
//        · K의 방  쓰러져 구조를 기다리는 동안(즉사 기믹 초읽기) 묻는다
//        · EPIC    쓰러져 구조를 기다리는 동안(즉사 기믹 초읽기 · 동료 부르기) 묻는다
//      장착자 쪽 죽음은 평소 죽음과 같다 — 장착자 몸에 붙은 보호 장치는 그대로 돈다.
//      죽으니 덧쓰기도 받는다.
//
//   2. 읽어내기
//      이름님은 모든 서사와 이야기를 아신다. 탐사 선택지에서 **죽을 길이 보인다** (🈲).
//      그 길을 잡고도 살아 돌아오면 그 탐사의 포인트를 세 배로 받는다.
//
//   3. 이계의 광기 — 붉은 헤일로
//      장착자는 붉은 헤일로를 가진다. 하루 두 번 남에게(또는 제게) 줄 수 있다.
//      헤일로를 받은 사람은 공용시설 행운이 크게 오르고, 대신 **공용시설을 한 번 쓸 때마다
//      오염도가 15 씩 오른다 — 동결과 무관하게.** 슬롯에서 연달아 세 번 꽝이 나면 그 뒤 열 판은
//      꽝이 나오지 않는다. 자정이 지나면 사라진다.
//      헤일로를 지닌 사람의 특이사항에는 [ 🔴 정원을 찬양하라 ] · [고행이 시작될 것이다] 가 달린다.
//
//   4. 되돌리기 — [복원]
//      장착칸의 [복원] 을 누르면 사원 목록이 뜬다. 하루 세 사람까지 미리 찍어 둔다.
//      찍힌 사람이 상담실이나 선녀탕에 들어가 있는 동안, 그 시간만큼 **장착자와 그 사람
//      둘 다** 포인트를 받는다 — 한 사람에 시간당 20,000 P (3분마다 1,000 P 씩).
//      장착자가 하루에 받는 몫은 10만까지이고, 대상은 장착자가 받은 만큼 같이 받는다.
//
//   5. 절대적 권능
//      이름님에게는 한계가 존재하지 않는다. ■■의 ■■■ 탐사에는 한 번에 25,000 P 라는 천장이
//      있다 (epic.js). 장착자에게는 그 천장이 없다 — 쌓은 그대로 들고 나온다.
//
// ■ 적히는 자리
//
//   u.jisanDay      하루가 바뀌었나
//   u.jisanRod      { by, byName, at, miss, safe }   받은 붉은 헤일로
//   u.jisanRodGave  오늘 헤일로를 몇 번 주었나
//   u.jisanSac      { 사번: { at, paid, told } }      [복원] 대상과 받은 몫
//   darkParties/<방>/jisanWear/<사번>  = { at, name }   살아 있는 장착자 (지우기가 묻는 상대)
//   darkParties/<방>/jisanSpare/<사번> = { ask, until, name, mode, by, byName, closed }
//       ask    쓰러진 사람이 물은 때 (이 값으로 한 번의 물음을 가린다)
//       by     장착자가 대신 죽기로 했다 — 양쪽 다 transaction 으로만 쓴다
//       closed 쓰러진 사람이 기다림을 닫았다 (그 뒤로는 대신 죽을 수 없다)
//
//   ★ 남의 글은 통째로 덮지 않는다. 자식 길로만 쓴다.
//
// ■ 콘솔
//   jisanGive(사번)   상담사가 하나 준다
//   jisanState(사번)  지금 무엇이 걸려 있나
//   jisanRod(사번)    붉은 헤일로를 준다 (장착자)
//   jisanSacList()    [복원] 대상

const JISAN = {
    NAME:       '📖 〈종말예언 : 어둠탐사기록〉',
    OLD:        '🧧 지산의 복 : 대리자',
    ROD_NOTE:   '[ 🔴 정원을 찬양하라 ]',
    POLL_NOTE:  '[고행이 시작될 것이다]',
    OLD_NOTES:  ['[🏷 지산의 복 오셨다!]', '[성내고 욕하는 것은 부정 탄다]'],
    OVER_MIN:   1,             // 1. 덧쓰기 — 몇 종을 받나
    OVER_MAX:   3,
    OVER_MORE:  ['각성 돌파권', '확정 승인서'],   // 1. 구역 표에 없어도 늘 넣는다
    SPARE_MS:   20000,         // 1+. 지우기 — 어둠에서 쓰러진 사람이 기다리는 시간
    SPARE_POLL: 50,            // 1+. 오염도가 차서 쓰러졌던 사람이 나올 때
    TRUTH_MULT: 3,             // 2. 죽을 길을 잡고 살아 돌아왔을 때
    ROD_DAY:    2,             // 3. 헤일로를 하루에 몇 번 주나
    ROD_LUCK:   6,             // 3. 헤일로를 지닌 사람의 공용시설 행운 배수
    ROD_POLL:   15,            // 3. 공용시설 한 번에 오르는 오염도 (동결 무관)
    ROD_MISS:   3,             // 3. 연달아 몇 번 꽝이면
    ROD_SAFE:   10,            // 3. 그 뒤 몇 판을 꽝 없이 가나
    SAC_DAY:    3,             // 4. 하루에 찍을 [복원] 대상 수
    SAC_CAP:    100000,        // 4. 장착자가 하루 받을 수 있는 몫의 천장 (대상 모두 합쳐)
    SAC_HOUR:   20000,         // 4. 대상 한 사람이 상담실 · 선녀탕에 있는 한 시간마다
    SAC_STEP:   3,             // 4. 몇 분마다 한 번 주나 (20,000 ÷ 60 × 3 = 1,000 P)
    EPIC_CAP:   25000          // 5. epic.js:655 의 천장
};

(function jisanLuck() {

const NAME = JISAN.NAME;
const OLD = JISAN.OLD;
const ADMIN = 'kario0987';
const MOD = 'jisan-modal';
const K_ZONE = 'Qtrew-???-999';
const EPIC_ZONE = 'Qtrew-???-■■■';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code !== ADMIN; });
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
    return u.equippedWeapons.some(function (w) { const b = baseOf(w); return b === NAME || b === OLD; });
}
window.jisanWears = wears;

function save(fields) {
    try { if (typeof saveFields === 'function') saveFields(fields); } catch (e) { }
}
function patch(code, path, val) {
    const d = db_();
    if (!d || !code) return;
    try {
        if (val === null) d.ref('users/' + code + '/' + path).remove().catch(function () { });
        else d.ref('users/' + code + '/' + path).set(val).catch(function () { });
    } catch (e) { }
}
function pay(u, n) {
    try { if (typeof changePoints === 'function') { changePoints(n); return; } } catch (e) { }
    u.points = (Number(u.points) || 0) + n;
}

// 하루가 바뀌면 — 헤일로도 [복원] 대상도 비운다
function dayRoll(u) {
    if (!u || u.jisanDay === today()) return false;
    u.jisanDay = today();
    u.jisanRodGave = 0;
    u.jisanSac = {};
    if (u.jisanRod) {
        cutNote(u, JISAN.ROD_NOTE);
        cutNote(u, JISAN.POLL_NOTE);
        u.jisanRod = null;
    }
    save({ jisanDay: 1, jisanRodGave: 1, jisanSac: 1, jisanRod: 1, badge: 1 });
    return true;
}

// ==========================================
// 특이사항 — ' | ' 까지 끊는다 (호사수구·아기 여우와 같은 사정)
// ==========================================
function badgeKey(u) {
    if (!u || !u.badge || typeof u.badge !== 'object') return 'notes';
    if (typeof u.badge.notes === 'string') return 'notes';
    if (typeof u.badge.note === 'string') return 'note';
    return 'notes';
}
function cutNote(u, line) {
    if (!u || !u.badge || !line) return false;
    const obj = (typeof u.badge === 'object');
    const key = obj ? badgeKey(u) : null;
    const raw = String(obj ? (u.badge[key] || '') : u.badge);
    if (raw.indexOf(line) < 0) return false;
    const bar = raw.indexOf('|') >= 0;
    const br = /<br\s*\/?>/i.test(raw);
    const keep = raw.split(/\s*\|\s*|<br\s*\/?>|\n/)
        .filter(function (x) { return x && x.indexOf(line) < 0; });
    const out = keep.join(bar ? ' | ' : (br ? '<br>' : '\n')) || '특이사항 없음';
    if (obj) u.badge[key] = out; else u.badge = out;
    return true;
}
function addNote(u, line) {
    try {
        if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, line);
    } catch (e) { }
}
function noteText(u) {
    if (!u || !u.badge) return '';
    return String(typeof u.badge === 'object' ? (u.badge[badgeKey(u)] || '') : u.badge);
}
// note-fix.js 가 묵은 줄을 가릴 때 쓴다
window.jisanNoteLive = function (u, note) {
    try {
        const t = String(note || '');
        if (JISAN.OLD_NOTES.some(function (x) { return t.indexOf(x) >= 0; })) return false;   // 옛 줄은 늘 묵은 것
        if (t.indexOf(JISAN.ROD_NOTE) < 0 && t.indexOf(JISAN.POLL_NOTE) < 0) return true;
        return !!(u && u.jisanRod && u.jisanRod.at);
    } catch (e) { return true; }
};

// ==========================================
// 옛 이름 → 새 이름 (내 기록만 · 3초마다)
// ==========================================
function rename() {
    const u = u_();
    if (!u || !u.code) return;
    let ch = false;
    if (Array.isArray(u.inventory)) u.inventory = u.inventory.map(function (x) { if (x === OLD) { ch = true; return NAME; } return x; });
    if (Array.isArray(u.equippedWeapons)) u.equippedWeapons = u.equippedWeapons.map(function (x) {
        if (x === OLD || baseOf(x) === OLD) { ch = true; return String(x).split(OLD).join(NAME); }
        return x;
    });
    if (u.equipOwner && typeof u.equipOwner === 'object' && u.equipOwner[OLD] !== undefined) {
        u.equipOwner[NAME] = u.equipOwner[OLD]; delete u.equipOwner[OLD]; ch = true;
        try { if (db_()) db_().ref('users/' + u.code + '/equipOwner/' + OLD).remove(); } catch (e) { }
    }
    // 특이사항 — 옛 이름 · 옛 헤일로 줄
    if (noteText(u).indexOf(OLD) >= 0 && typeof u.badge === 'object') {
        const k = badgeKey(u); u.badge[k] = String(u.badge[k]).split(OLD).join(NAME); ch = true;
    }
    let oldRod = false;
    JISAN.OLD_NOTES.forEach(function (x) { if (cutNote(u, x)) { oldRod = true; ch = true; } });
    if (oldRod && u.jisanRod && u.jisanRod.at && noteText(u).indexOf(JISAN.ROD_NOTE) < 0) {
        addNote(u, JISAN.ROD_NOTE); addNote(u, JISAN.POLL_NOTE);
    }
    if (ch) {
        save({ inventory: 1, equippedWeapons: 1, equipOwner: 1, badge: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        console.log('[종말예언] ' + OLD + ' → ' + NAME + ' 이름을 바꿨습니다.');
    }
}
setInterval(function () { try { rename(); } catch (e) { } }, 3000);

// ==========================================
// 물품 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        try { delete ITEM_CATALOG[OLD]; } catch (e) { }
        if (ITEM_CATALOG[NAME]) { clearInterval(iv); return; }
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false,
            effect: 'equip_jisan', noSell: true,
            desc: '[장착] ■■이라 부르는 각종 ■■■을 ■■한 ■■ ― 이름님께서 하사하신 경전이다. '
                + '그런데그걸왜네가가지고있어?'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined') {
            [NAME, OLD].forEach(function (n) { if (NO_SELL_ITEMS.indexOf(n) < 0) NO_SELL_ITEMS.push(n); });
        }
        clearInterval(iv);
        console.log('[종말예언] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._jisan) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () {
            const pool = _m.apply(this, arguments);
            try {
                if (pool && typeof pool.delete === 'function' && !Array.isArray(pool)) { pool.delete(NAME); pool.delete(OLD); return pool; }
                if (Array.isArray(pool)) return pool.filter(function (x) { const b = baseOf(x); return b !== NAME && b !== OLD; });
            } catch (e) { }
            return pool;
        };
        w._jisan = true;
        marketSellable = w; window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._jisan) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME && itemName !== OLD) return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) {
                alert_('격리 중에는 장착할 수 없습니다.'); return;
            }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 지니고 있습니다.'); return; }
            if (equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, itemName, 1); } catch (e) { }
            dayRoll(me);
            addNote(me, '[장착됨] ' + NAME);
            log_(me, '[' + NAME + '] 장착했습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(NAME + '\n\n이름님께서 하사하신 경전이다.\n그런데그걸왜네가가지고있어?\n\n'
                + '장착칸의 [복원] · [헤일로] 로 엽니다.');
        };
        useInventoryItem._jisan = true;
        clearInterval(iv);
        console.log('[종말예언] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 지금 어느 탐사인가 · 살아 있나
// ==========================================
function modeOf(r) {
    if (!r) return '';
    if (r.kroom || r.zone === K_ZONE) return 'k';
    if (r.epic || r.zone === EPIC_ZONE) return 'epic';
    return 'dark';
}
function epicRun() { return (typeof er !== 'undefined') ? er : null; }
function aliveIn(r) {
    const m = modeOf(r);
    if (m === 'k') {
        const k = (window.KROOM && typeof window.KROOM.state === 'function') ? window.KROOM.state() : null;
        return !!(k && !k.dead && !k._settled && !k.down);
    }
    if (m === 'epic') {
        const e = epicRun();
        return !!(e && !e.dead && !e._settled && !e._calledHelp && !e._doomTick);
    }
    return !!(r && !r._dead && !r._jisanWait);
}

// ==========================================
// 1. 덧쓰기 — 죽으면 회수품 1~3종
// ==========================================
function overPool(zone) {
    const pool = [];
    const add = function (n) {
        if (!n || /바이올린/.test(n) || pool.indexOf(n) >= 0) return;
        if (typeof ITEM_CATALOG !== 'undefined' && !ITEM_CATALOG[n]) return;
        pool.push(n);
    };
    try { (DARK_LOOT_BY_ZONE[zone] || []).forEach(function (l) { add(l && l.name); }); } catch (e) { }
    // EPIC · K의 방은 회수품 표가 따로 없다 — 어둠 전 구역의 회수품에서 고른다 (문곡성군과 같은 수)
    if (!pool.length) {
        try {
            Object.keys(DARK_LOOT_BY_ZONE).forEach(function (z) {
                (DARK_LOOT_BY_ZONE[z] || []).forEach(function (l) { add(l && l.name); });
            });
        } catch (e) { }
    }
    JISAN.OVER_MORE.forEach(add);
    return pool;
}
function overwrite(zone) {
    const me = u_();
    if (!me || !wears(me)) return [];
    const pool = overPool(zone);
    if (!pool.length) return [];
    const n = Math.min(pool.length, JISAN.OVER_MIN + Math.floor(Math.random() * (JISAN.OVER_MAX - JISAN.OVER_MIN + 1)));
    const got = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, n);
    if (!Array.isArray(me.inventory)) me.inventory = [];
    got.forEach(function (x) { me.inventory.push(x); });
    log_(me, '[' + NAME + '] 덧쓰기 — 회수품 ' + got.length + '종 (' + got.join(', ') + ')');
    save({ inventory: 1, history: 1 });
    setTimeout(function () {
        alert_('[ 덧쓰기 ]\n\n끝난 자리 위에 경전이 한 줄을 덧쓴다.\n\n'
            + '회수품 ' + got.length + '종 — ' + got.join(' · '));
    }, 900);
    return got;
}
window.jisanOverwrite = overwrite;

// ==========================================
// 1(추가). 지우기 — 장착자가 대신 죽는다
// ==========================================
function partyOf(pid) {
    try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties[pid] || null : null; } catch (e) { return null; }
}
// 이 방에 살아 있는 장착자가 (나 말고) 있나
function wearerHere(pid, mine) {
    const p = partyOf(pid);
    if (!p || !p.jisanWear) return false;
    return Object.keys(p.jisanWear).some(function (c) {
        return c !== mine && p.jisanWear[c] && (!p.members || p.members[c]);
    });
}
function spareRef(pid, code) { const d = db_(); return d ? d.ref('darkParties/' + pid + '/jisanSpare/' + code) : null; }

// 쓰러진 쪽 — 묻고, 답을 기다린다.  돌려주는 것: { at, close() → Promise<{ by, byName } | null> }
window.jisanSpareAsk = function (ms, onSpared) {
    const r = run(), me = u_();
    if (!r || !r.isParty || !r.partyId || !me) return null;
    if (r._jisanSac) return null;                           // 대신 죽으러 가는 길에는 또 묻지 않는다
    if (!wearerHere(r.partyId, me.code)) return null;
    const ref = spareRef(r.partyId, me.code);
    if (!ref) return null;
    const pid = r.partyId;
    const at = Date.now();
    try { ref.set({ ask: at, until: at + ms, name: me.name || '', mode: modeOf(r) }); } catch (e) { return null; }
    let done = false;
    const iv = setInterval(function () {
        if (done) { clearInterval(iv); return; }
        const p = partyOf(pid);
        const v = p && p.jisanSpare ? p.jisanSpare[me.code] : null;
        if (v && v.ask === at && v.by && !v.closed) {
            done = true; clearInterval(iv);
            try { onSpared(v.byName || nameOf(v.by)); } catch (e) { console.warn('[종말예언] 지우기:', e && e.message); }
            return;
        }
        if (v && v.ask !== at) { done = true; clearInterval(iv); }       // 새 물음이 덮었다
        if (Date.now() > at + ms + 60000) { done = true; clearInterval(iv); }
    }, 500);
    return {
        at: at,
        // 기다림을 닫는다. 그 사이 장착자가 먼저 답했으면 그것을 돌려준다.
        close: function () {
            if (done) return Promise.resolve(null);
            done = true; clearInterval(iv);
            return ref.transaction(function (cur) {
                if (cur === null) return null;
                if (!cur || cur.ask !== at) return cur;
                if (cur.by) return;                                  // 장착자가 먼저 — 닫지 않는다
                return Object.assign({}, cur, { closed: Date.now() });
            }).then(function (res) {
                const v = res && res.snapshot && res.snapshot.val();
                return (v && v.ask === at && v.by && !v.closed) ? { by: v.by, byName: v.byName || nameOf(v.by) } : null;
            }).catch(function () { return null; });
        }
    };
};

// 장착자 쪽 — 살아 있다고 방에 적어 둔다 (바뀔 때만 쓴다)
let presKey = '';
function presence() {
    const me = u_(), r = run(), d = db_();
    if (!d) return;
    const live = !!(me && r && r.isParty && r.partyId && wears(me) && aliveIn(r));
    const key = live ? r.partyId + '|' + me.code : '';
    if (key === presKey) return;
    if (presKey) {
        const old = presKey.split('|');
        try { d.ref('darkParties/' + old[0] + '/jisanWear/' + old[1]).remove(); } catch (e) { }
    }
    presKey = key;
    if (live) {
        const ref = d.ref('darkParties/' + r.partyId + '/jisanWear/' + me.code);
        try { ref.set({ at: Date.now(), name: me.name || '' }); ref.onDisconnect().remove(); } catch (e) { }
    }
}

// 장착자 쪽 — 쓰러진 사람이 있으면 묻는 창
const seenAsk = {};
let askOpen = null;          // { c, at }
function askCheck() {
    const me = u_(), r = run();
    const live = !!(me && r && r.isParty && r.partyId && wears(me) && aliveIn(r));
    let pick = null;
    if (live) {
        const p = partyOf(r.partyId);
        const all = (p && p.jisanSpare) || {};
        Object.keys(all).some(function (c) {
            const v = all[c];
            if (c === me.code || !v || !v.ask || v.by || v.closed) return false;
            if (Date.now() > (Number(v.until) || 0)) return false;
            if (seenAsk[c + '|' + v.ask]) return false;
            pick = { c: c, v: v };
            return true;
        });
    }
    if (askOpen && (!pick || pick.c !== askOpen.c || pick.v.ask !== askOpen.at)) {
        // 열어 둔 물음이 끝났다 (구조됐거나 · 시간이 다 됐거나 · 다른 장착자가 먼저)
        const still = pick && pick.c === askOpen.c && pick.v.ask === askOpen.at;
        if (!still) { shutAsk(); }
    }
    if (pick && !askOpen) openAsk(pick.c, pick.v);
    if (askOpen) {
        const el = document.getElementById('jisan-ask-left');
        if (el && pick) el.textContent = Math.max(0, Math.ceil(((Number(pick.v.until) || 0) - Date.now()) / 1000));
    }
}
function shutAsk() {
    askOpen = null;
    const b = document.getElementById('jisan-ask');
    if (b) b.remove();
}
function openAsk(c, v) {
    askOpen = { c: c, at: v.ask };
    const nm = v.name || nameOf(c);
    const box = document.createElement('div');
    box.id = 'jisan-ask';
    box.style.cssText = 'position:fixed; inset:0; z-index:2147482000; display:flex; align-items:center; justify-content:center;'
        + ' background:rgba(0,0,0,0.82); padding:16px; box-sizing:border-box;';
    box.innerHTML = '<div style="background:linear-gradient(160deg,#1d1210,#0b0807); border:1px solid #b03030; border-radius:12px;'
        + ' padding:16px; width:100%; max-width:400px; box-shadow:0 8px 30px rgba(0,0,0,0.75);">'
        + '<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">[ 📖 지우기 ]</div>'
        + '<div style="font-size:12px; color:#e6ddd0; line-height:1.8; margin:10px 0 12px 0;">'
        + '<b style="color:#fff;">' + esc(nm) + '</b> 사원이 쓰러진다.<br>'
        + '경전의 그 장을 당신의 이름으로 덧쓰면, 그 사원은 죽기 직전에 구해져 탐사를 이어 갑니다.<br>'
        + '<span style="color:#ff9a9a;">대신 당신이 죽습니다.</span>'
        + '<div style="font-size:11px; color:#888; margin-top:6px;">남은 시간 <b id="jisan-ask-left" style="color:#ffcf8f;">'
        + Math.max(0, Math.ceil(((Number(v.until) || 0) - Date.now()) / 1000)) + '</b>초</div></div>'
        + '<button id="jisan-ask-yes" class="game-btn" style="width:100%; margin:0 0 7px 0; padding:12px; font-size:12px;'
        + ' background:linear-gradient(145deg,#8a1414,#3d0a0a) !important; border-color:#e07070 !important;">대신 죽는다</button>'
        + '<button id="jisan-ask-no" class="game-btn" style="width:100%; margin:0; padding:11px; font-size:12px;'
        + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">지켜본다</button></div>';
    document.body.appendChild(box);
    box.querySelector('#jisan-ask-no').onclick = function () { seenAsk[c + '|' + v.ask] = 1; shutAsk(); };
    box.querySelector('#jisan-ask-yes').onclick = function () {
        seenAsk[c + '|' + v.ask] = 1;
        shutAsk();
        takePlace(c, v);
    };
}
// 대신 죽는다 — 방에 먼저 적고(transaction), 적혔으면 내가 죽는다
function takePlace(c, v) {
    const me = u_(), r = run();
    if (!me || !r || !r.partyId || !aliveIn(r)) { alert_('지금은 대신 갈 수 없습니다.'); return; }
    const ref = spareRef(r.partyId, c);
    if (!ref) return;
    const mode = modeOf(r);
    ref.transaction(function (cur) {
        if (cur === null) return null;
        if (!cur || cur.ask !== v.ask || cur.by || cur.closed) return;
        if (Date.now() > (Number(cur.until) || 0)) return;
        return Object.assign({}, cur, { by: me.code, byName: me.name || '', at2: Date.now() });
    }).then(function (res) {
        const s = res && res.snapshot && res.snapshot.val();
        if (!(res && res.committed && s && s.by === me.code && s.ask === v.ask)) {
            alert_('[ 📖 지우기 ]\n\n이미 늦었습니다. 그 장은 닫혔습니다.');
            return;
        }
        const nm = v.name || nameOf(c);
        log_(me, '[' + NAME + '] 지우기 — ' + nm + ' 사원 대신 죽음을 받았습니다.');
        save({ history: 1 });
        try { if (typeof sendPartyChat === 'function') sendPartyChat('경전 한 장이 찢겨 나갔습니다. ' + nm + ' 사원의 자리가 지워졌습니다.', true); } catch (e) { }
        const txt = '<span style="color:#ffd9a0;">— ' + esc(nm) + ' 사원의 자리를 당신의 이름으로 덧썼다.</span><br><br>'
            + '경전 한 장이 찢겨 나간다. 이번에는 당신 차례다.';
        r._jisanSac = true;
        try {
            if (mode === 'k') { if (typeof window.kroomDie === 'function') window.kroomDie(txt); }
            else if (mode === 'epic') {
                const e = epicRun(); if (e) e._jisanSac = true;
                if (typeof epicDeath === 'function') epicDeath(txt);
            }
            else if (typeof darkDeath === 'function') darkDeath(txt);
        } catch (e) { console.warn('[종말예언] 대신 죽기:', e && e.message); }
    }).catch(function () { alert_('[ 📖 지우기 ]\n\n닿지 않았습니다.'); });
}
setInterval(function () {
    try { presence(); } catch (e) { }
    try { askCheck(); } catch (e) { }
}, 700);

// 쓰러졌다가 구해진 사람 — 오염도가 찼으면 50 으로 (그대로 두면 바로 다시 쓰러진다)
function sparedPoll(me) {
    if ((Number(me.pollution) || 0) >= 100) {
        me.pollution = JISAN.SPARE_POLL;
        me.lastPollutionTime = Date.now();
        return true;
    }
    return false;
}
function sparedLog(me, byName) {
    log_(me, '[' + NAME + '] 지우기 — ' + byName + ' 사원이 대신 지워졌습니다. 죽기 직전에 구해져 탐사를 이어 갑니다.');
    save({ pollution: 1, lastPollutionTime: 1, history: 1 });
    try { if (typeof sendPartyChat === 'function') sendPartyChat((me.name || '') + ' 사원이 죽기 직전에 구해졌습니다.', true); } catch (e) { }
}
function sparedText(byName) {
    return '<span style="color:#ffd9a0;">— 숨이 멎기 직전, 누군가의 경전이 펼쳐졌다.<br>'
        + esc(byName) + ' 사원의 이름이 당신 자리에 덧쓰였다.</span><br><br>숨이 돌아온다. 아직 끝나지 않았다.';
}
window.jisanSparedText = sparedText;

// ── 어둠 — 쓰러진 사람이 20초 기다린다
function darkWait(reasonText, until) {
    try {
        darkBodyEl().innerHTML = darkBox('—', String(reasonText || '') + '<br><br>'
            + '<span style="color:#d9a05a;">— 숨이 멎기 직전, 어디선가 경전이 펼쳐지는 소리가 난다.</span>',
            '<div style="text-align:center; padding:14px; background:rgba(127,0,0,0.18); border:1px solid #7f2a1a; border-radius:6px;">'
            + '<div style="font-size:11px; color:#ffcf8f;">누군가 대신 지워질지 고르는 중…</div>'
            + '<div style="font-size:26px; font-weight:bold; color:#fff; margin-top:6px;"><span id="jisan-wait-left">'
            + Math.ceil((until - Date.now()) / 1000) + '</span><span style="font-size:13px; color:#888;">초</span></div></div>');
        try { mountDarkChat('normal'); } catch (e) { }
        const iv = setInterval(function () {
            const el = document.getElementById('jisan-wait-left');
            if (!el) { clearInterval(iv); return; }
            el.textContent = Math.max(0, Math.ceil((until - Date.now()) / 1000));
        }, 500);
    } catch (e) { }
}
// 구해졌다 — 그 자리에서 일어서 탐사를 이어 간다 (거문성군 · 부활과 같은 꼴 — 지금 걸음을 다시 그린다)
function darkSpared(r, byName) {
    const me = u_();
    if (!me || run() !== r || r._dead) return;
    if (r._jisanSpared === r._jisanAskAt) return;           // 같은 물음에 두 번 받지 않는다
    r._jisanSpared = r._jisanAskAt;
    r._jisanWait = false;
    r._jisanAsked = false;                                   // 다음에 또 쓰러지면 (살아 있는 장착자가 있으면) 다시 묻는다
    r.fail = Math.max(0, (Number(r.fail) || 0) - 1);
    try { r.log.push('[' + NAME + '] 지우기 — ' + byName + ' 사원이 대신 지워짐'); } catch (e) { }
    sparedPoll(me);
    sparedLog(me, byName);
    try {
        darkBodyEl().innerHTML = darkBox('—', String(r._jisanReason || '') + (r._jisanReason ? '<br><br>' : '') + sparedText(byName),
            darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
        if (r.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    r._jisanReason = '';
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._jisan) { clearInterval(iv); return; }
        const _d = darkDeath;
        // 원본 죽음 — 끝나고도 죽어 있으면 덧쓰기 (사직서를 고르는 중이면 아직 아니다)
        const finalDeath = function (self, args) {
            const me = u_(), r = run();
            const out = _d.apply(self, args);
            try {
                const r2 = run();
                const resign = !!document.querySelector('#dro-body button[onclick*="useResignLetter"]');
                if (me && r2 && r2 === r && r2._dead && !resign && wears(me) && !r2._jisanOver) {
                    r2._jisanOver = true;
                    overwrite(r2.zone);
                }
            } catch (e) { console.warn('[종말예언] 덧쓰기 건너뜀:', e && e.message); }
            return out;
        };
        const w = function (reasonText) {
            const r = run(), me = u_();
            // K의 방 · EPIC 은 제 길이 따로 있다 (kroom-core.js · 아래 EPIC 연결)
            if (!r || !me || modeOf(r) !== 'dark') return _d.apply(this, arguments);
            if (r._jisanWait) return;                        // 기다리는 중 — 겹쳐 오는 죽음은 받지 않는다
            if (!r._dead && r.isParty && !r._jisanSac && !r._jisanAsked) {
                const h = window.jisanSpareAsk(JISAN.SPARE_MS, function (by) { darkSpared(r, by); });
                if (h) {
                    r._jisanAsked = true;
                    r._jisanWait = true;
                    r._jisanAskAt = h.at;
                    r._jisanReason = reasonText;
                    darkWait(reasonText, h.at + JISAN.SPARE_MS);
                    const self = this, args = arguments;
                    setTimeout(function () {
                        if (run() !== r || r._jisanSpared === h.at) return;
                        h.close().then(function (sp) {
                            if (run() !== r || r._jisanSpared === h.at) return;
                            if (sp) { darkSpared(r, sp.byName); return; }
                            r._jisanWait = false;
                            finalDeath(self, args);
                        });
                    }, JISAN.SPARE_MS);
                    return;
                }
            }
            return finalDeath(this, arguments);
        };
        w._jisan = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
        console.log('[종말예언] 덧쓰기 · 지우기 — 어둠 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ── EPIC — 동료를 부르거나(쓰러짐) 즉사 기믹 초읽기에 들 때 묻는다
function epicSpared(byName) {
    const e = epicRun(), me = u_(), r = run(), d = db_();
    if (!e || !me || e.dead || e._settled) return;
    if (e._doomTick) { clearInterval(e._doomTick); e._doomTick = null; }
    if (d && r && r.partyId) {
        ['epicHelp', 'epicDoom'].forEach(function (k) {
            const ref = d.ref('darkParties/' + r.partyId + '/' + k + '/' + me.code);
            try { ref.off(); } catch (x) { }                   // 내가 지우는 것을 「구해졌다」로 읽지 않게
            try { ref.remove(); } catch (x) { }
        });
    }
    // 동료가 끌어낸 것과 같다 — 그 자리에서 일어선다 (epicSaved · epicDoomSaved 와 같은 꼴 · 묵은 기다림 시계도 끈다)
    e._calledHelp = false; e._helpAt = 0; e.danger = null; e._jisanSpare = null;
    sparedPoll(me);
    sparedLog(me, byName);
    try {
        const cfg = e._doomCfg || null;
        darkBodyEl().innerHTML = darkBox('—', (cfg && cfg.text ? cfg.text + '<br><br>' : '') + sparedText(byName),
            (typeof epicBar === 'function' ? epicBar() : '') + darkChoiceBtn('일어선다.', 'epicMap()'));
        if (r && r.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (x) { console.warn('[종말예언] EPIC 지우기:', x && x.message); }
    try { if (typeof updateUI === 'function') updateUI(); } catch (x) { }
}
function epicAsk(ms) {
    const e = epicRun();
    if (!e || e._jisanSac || e.dead || e._settled) return;
    const h = window.jisanSpareAsk(ms, epicSpared);
    if (h) e._jisanSpare = h;
}
function epicClose() {
    const e = epicRun();
    if (e && e._jisanSpare) { const h = e._jisanSpare; e._jisanSpare = null; try { h.close(); } catch (x) { } }
}
(function hookEpicAsk() {
    const iv = setInterval(function () {
        let left = 0;
        // 동료를 부른다 — 기다림이 걸린 때
        if (typeof epicCallHelp === 'function' && !epicCallHelp._jisan) {
            const _c = epicCallHelp;
            const w = function () {
                const out = _c.apply(this, arguments);
                try { if (out) epicAsk(90000); } catch (x) { }
                return out;
            };
            w._jisan = true; epicCallHelp = w; window.epicCallHelp = w;
        } else if (typeof epicCallHelp !== 'function') left++;
        // 즉사 기믹 초읽기
        if (typeof epicDoom === 'function' && !epicDoom._jisan) {
            const _o = epicDoom;
            const w = function (cfg) {
                const out = _o.apply(this, arguments);
                try {
                    const e = epicRun(), r = run();
                    if (e && e._doomTick && r && r.isParty) epicAsk(((cfg && cfg.sec) || 70) * 1000);
                } catch (x) { }
                return out;
            };
            Object.keys(_o).forEach(function (k) { w[k] = _o[k]; });
            w._jisan = true; epicDoom = w; window.epicDoom = w;
        } else if (typeof epicDoom !== 'function') left++;
        // 구해졌다 — 기다림을 닫는다 (그 뒤로는 대신 죽을 수 없다)
        ['epicSaved', 'epicDoomSaved'].forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._jisan) return;
            const w = function () { try { epicClose(); } catch (x) { } return f.apply(this, arguments); };
            Object.keys(f).forEach(function (k) { w[k] = f[k]; });
            w._jisan = true; window[n] = w;
            try { if (n === 'epicSaved') epicSaved = w; else epicDoomSaved = w; } catch (x) { }
        });
        if (!left) { clearInterval(iv); console.log('[종말예언] 지우기 — EPIC 연결'); }
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 2. 읽어내기 — 죽을 길이 보인다
// ==========================================
//
//   선택지 자료에는 「죽는 쪽」 표시가 없다. 다만 이 게임에는 관례가
//   하나 있다 — safe_hint 가 options[0] 에 ◈ 를 붙인다
//   (index.html:2748). 글쓴이 약속으로 **0번이 가장 안전한 쪽**이다.
//   그러므로 나머지가 죽을 길이다. 그쪽에 🈲 를 붙여 보여 준다.
//
// ■ 투표판에서는 선택지에 **손대지 않는다** (중복 투표로 보이던 것)
//
//   파티로 함께 가는 자리에서는 먼저 도착한 사람의 선택지가 **투표판에 통째로
//   올라가** 모두의 화면이 그것을 쓴다 (index.html:2494 openVote · 2679 renderVoteState).
//   선택지를 갈아 끼우면 id 가 빠져 표가 한 바구니(tally[undefined])로 몰리고,
//   마감 뒤 남의 화면이 jisanGo 를 못 찾아 멎었다.
//   그래서 투표판에 올라가는 선택지는 **원래 것을 그대로** 둔다. 🈲 는 내
//   화면의 단추에만 덧붙이고 (hookVoteView), 죽을 길을 잡았는지는 마감된
//   투표에서 센다 (hookVoted). 혼자 가는 자리는 jisanGo 로 받는다.
window._jisanOpt = [];
window.jisanGo = function (i) {
    const o = window._jisanOpt[Number(i)];
    if (!o) return;
    if (o.bad) {
        const r = run();
        if (r) r._jisanTruth = true;
        toast('🈲 그 길로 간다');
    }
    try {
        const fn = window[o.fn];
        if (typeof fn === 'function') return fn(o.arg);
    } catch (e) { console.warn('[종말예언] 선택지:', e && e.message); }
};

(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._jisan) { clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            try {
                const me = u_();
                if (me && wears(me) && Array.isArray(options) && options.length > 1) {
                    window._jisanOpt = [];
                    options = options.map(function (o, i) {
                        const bad = (i > 0);
                        window._jisanOpt.push({ fn: o.fn, arg: o.arg, bad: bad });
                        if (shared()) return o;
                        return { id: o.id, label: (bad ? '🈲 ' : '') + o.label,
                                 fn: 'jisanGo', arg: String(i) };
                    });
                    text = String(text || '')
                        + '<br><br><span style="color:#d9a05a;">— 경전이 이 장을 미리 읽어 준다.'
                        + ' 🈲 가 붙은 쪽은 죽는 길이다.</span>';
                }
            } catch (e) { }
            return _c.call(this, title, text, options, imgKey);
        };
        w._jisan = true;
        renderChoiceStep = w; window.renderChoiceStep = w;
        clearInterval(iv);
        console.log('[종말예언] 읽어내기 — 죽을 길 보이기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 함께 투표하는 자리인가 — index.html:2759 의 together 와 같은 셈
function shared() {
    const r = run();
    return !!(r && r.isParty && !r.solo && !r.taken && !r._a214Scattered);
}

// 투표판 — 🈲 는 **내 화면의 단추에만** 덧붙인다 (투표판 글은 안 건드린다)
(function hookVoteView() {
    const iv = setInterval(function () {
        if (typeof renderVoteState !== 'function') return;
        if (renderVoteState._jisan) { clearInterval(iv); return; }
        const _v = renderVoteState;
        const w = function () {
            const out = _v.apply(this, arguments);
            try {
                const me = u_();
                if (!me || !wears(me)) return out;
                const area = document.getElementById('vote-area');
                if (!area) return out;
                const bs = area.querySelectorAll('button[onclick^="castVote"]');
                for (let i = 1; i < bs.length; i++) {             // 0번은 안전한 쪽
                    if (bs[i].innerHTML.indexOf('🈲') >= 0) continue;
                    bs[i].insertAdjacentHTML('afterbegin', '🈲 ');
                }
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        renderVoteState = w; window.renderVoteState = w;
        clearInterval(iv);
        console.log('[종말예언] 투표판 죽을 길 표시 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 투표가 끝났다 — 일행이 고른 쪽이 죽을 길이었나 (내 화면에서만 센다)
(function hookVoted() {
    const iv = setInterval(function () {
        if (typeof runVotedAction !== 'function') return;
        if (runVotedAction._jisan) { clearInterval(iv); return; }
        const _r = runVotedAction;
        const w = function (opt, vote) {
            try {
                const me = u_(), r = run();
                if (me && r && wears(me) && opt && vote && Array.isArray(vote.options)) {
                    const i = vote.options.findIndex(function (o) { return o && o.id === opt.id; });
                    if (i > 0) { r._jisanTruth = true; toast('🈲 그 길로 간다'); }
                }
            } catch (e) { }
            return _r.apply(this, arguments);
        };
        w._jisan = true;
        runVotedAction = w; window.runVotedAction = w;
        clearInterval(iv);
        console.log('[종말예언] 투표 결과 — 죽을 길 셈 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 2. 정산 — 죽을 길을 잡고 살아 돌아왔으면 세 배
// ==========================================
//   ★ 정산은 끝에서 darkRun 을 비운다 (index.html:4576). 그러니 배수는
//     **원본을 부르기 전에** 베껴 둬야 한다 (talkshow.js 가 적어 둔 함정).
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (window._jisanResult) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const me = u_();
            const r = run();
            const truth = !!(me && wears(me) && r && r._jisanTruth);
            const before = (me && Number(me.points)) || 0;
            const out = _r.apply(this, arguments);
            try {
                if (truth) {
                    const got = ((u_() && Number(u_().points)) || 0) - before;
                    if (got > 0) {
                        const add = Math.round(got * (JISAN.TRUTH_MULT - 1));
                        pay(u_(), add);
                        log_(u_(), '[' + NAME + '] 읽어내기 — 죽을 길을 밟고 살아 돌아왔습니다. 포인트 '
                            + JISAN.TRUTH_MULT + '배 (+' + add.toLocaleString() + ' P)');
                        setTimeout(function () {
                            alert_('[ 읽어내기 ]\n\n이름님은 모든 서사와 이야기를 아신다.\n'
                                + '죽는 길을 밟고도 걸어 나왔습니다.\n\n'
                                + '포인트 ' + JISAN.TRUTH_MULT + '배 — 모두 '
                                + (got + add).toLocaleString() + ' P');
                        }, 700);
                    }
                }
            } catch (e) { console.warn('[종말예언] 정산 건너뜀:', e && e.message); }
            return out;
        };
        w._jisan = true;
        window._jisanResult = true;        // 뒤에 감싸는 쪽이 표식을 지운다
        renderDarkResult = w; window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[종말예언] 세 배 정산 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 3. 이계의 광기 — 붉은 헤일로
// ==========================================
function hasRod(u) {
    if (!u) return false;
    dayRoll(u);
    return !!(u.jisanRod && u.jisanRod.at);
}
window.jisanHasRod = hasRod;

window.jisanRod = function (who) {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 을(를) 지니고 있어야 합니다.'); return; }
    dayRoll(me);
    const left = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    if (left <= 0) { alert_('오늘 붉은 헤일로는 다 나갔습니다.'); return; }
    const t = who ? find(who) : me;
    if (!t) { alert_('사원을 못 찾았습니다.'); return; }
    if (hasRod(t)) { alert_(t.name + ' 사원은 이미 붉은 헤일로를 지니고 있습니다.'); return; }

    const rod = { by: me.code, byName: me.name, at: Date.now(), miss: 0, safe: 0 };
    if (t.code === me.code) {
        me.jisanRod = rod;
        addNote(me, JISAN.ROD_NOTE);
        addNote(me, JISAN.POLL_NOTE);
    } else {
        t.jisanRod = rod;
        patch(t.code, 'jisanRod', rod);
        addNote(t, JISAN.ROD_NOTE);
        addNote(t, JISAN.POLL_NOTE);
        log_(t, '[' + NAME + '] ' + me.name + ' 사원이 붉은 헤일로를 씌워 주었습니다.');
        t.hasItemUsedOnMe = true;
        try {
            if (typeof updateUserFields === 'function') {
                // ★ jisanDay 도 같이 보낸다 — 받은 쪽 dayRoll 이 「오늘 치를 안 돌렸다」고 거두지 않게
                updateUserFields(t.code, { badge: t.badge, history: t.history,
                                           jisanDay: t.jisanDay || today(), hasItemUsedOnMe: true });
            }
        } catch (e) { }
    }
    me.jisanRodGave = (Number(me.jisanRodGave) || 0) + 1;
    log_(me, '[' + NAME + '] 붉은 헤일로 → ' + t.name + ' 사원');
    save({ jisanRodGave: 1, jisanRod: 1, badge: 1, history: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('🔴 붉은 헤일로가 ' + t.name + ' 사원에게 갔습니다.\n\n'
        + '공용시설 행운이 크게 오릅니다.\n'
        + '대신 한 번 쓸 때마다 오염도가 ' + JISAN.ROD_POLL + ' 오릅니다 — 동결과 무관하게.\n\n'
        + '오늘 남은 헤일로 ' + (JISAN.ROD_DAY - me.jisanRodGave) + '개');
};

// 공용시설 행운 — 헤일로를 지닌 사람
(function hookFacLuck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._jisan) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        const w = function (user) {
            let m = _f.apply(this, arguments);
            try { if (hasRod(user || u_())) m *= JISAN.ROD_LUCK; } catch (e) { }
            return m;
        };
        w._jisan = true;
        facilityLuckMult = w; window.facilityLuckMult = w;
        clearInterval(iv);
        console.log('[종말예언] 붉은 헤일로 — 공용시설 행운 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 한 번마다 오염도 +15 — 동결과 무관하게 (그래서 applyPollutionToUser 를 안 쓴다)
function pollRaw(u, n) {
    if (!u) return 0;
    const was = Number(u.pollution) || 0;
    u.pollution = Math.max(0, Math.min(100, was + n));
    save({ pollution: 1 });
    return u.pollution - was;
}
(function hookFacUse() {
    const iv = setInterval(function () {
        if (typeof useFacility !== 'function') return;
        if (useFacility._jisan) { clearInterval(iv); return; }
        const _u = useFacility;
        const w = function () {
            const me = u_();
            const on = hasRod(me);
            const r = _u.apply(this, arguments);
            try {
                if (on && r !== false) {
                    const up = pollRaw(me, JISAN.ROD_POLL);
                    if (up > 0) toast('🔴 ' + JISAN.POLL_NOTE + ' (오염도 +' + up + ')');
                }
            } catch (e) { }
            return r;
        };
        w._jisan = true;
        useFacility = w; window.useFacility = w;
        clearInterval(iv);
        console.log('[종말예언] 붉은 헤일로 — 오염도 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 슬롯 — 연달아 세 번 꽝이면 그 뒤 열 판은 꽝이 없다
(function hookSlot() {
    const iv = setInterval(function () {
        if (typeof playSlot !== 'function') return;
        if (playSlot._jisan) { clearInterval(iv); return; }
        const _p = playSlot;
        const w = function () {
            const me = u_();
            if (!hasRod(me)) return _p.apply(this, arguments);
            const rod = me.jisanRod;
            const before = Number(me.points) || 0;
            let fix = null;
            // 열 판 동안은 꽝이 없다 — 첫 난수를 꽝 띠 밖으로 민다
            if ((Number(rod.safe) || 0) > 0) {
                let fail = 0;
                try {
                    const am = (typeof window.amuletCount === 'function') ? window.amuletCount(me) : (me.equippedWeapons || []).some(function (x) {
                        const b = baseOf(x);
                        return b === '누군가가 쓴 부적' || b === '사원증 뱃지';
                    });
                    const B = window._slotBands
                        ? window._slotBands(facilityLuckMult(me), am) : null;
                    fail = B ? B.fail : 0;
                } catch (e) { fail = 0; }
                if (fail > 0 && fail < 1) {
                    const _r = Math.random;
                    let first = true;
                    Math.random = function () {
                        if (first) { first = false; return fail + (1 - fail) * _r() * 0.999; }
                        return _r();
                    };
                    fix = _r;
                }
            }
            let out;
            try { out = _p.apply(this, arguments); }
            finally { if (fix) Math.random = fix; }
            try {
                const won = ((Number(u_().points) || 0) - before) > 0;
                const s = Number(rod.safe) || 0;
                if (s > 0) {
                    rod.safe = s - 1;
                    rod.miss = 0;
                } else if (won) {
                    rod.miss = 0;
                } else {
                    rod.miss = (Number(rod.miss) || 0) + 1;
                    if (rod.miss >= JISAN.ROD_MISS) {
                        rod.safe = JISAN.ROD_SAFE;
                        rod.miss = 0;
                        toast('🔴 헤일로가 붉게 탄다 — 다음 ' + JISAN.ROD_SAFE + '판은 꽝이 없다');
                    }
                }
                save({ jisanRod: 1 });
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        playSlot = w; window.playSlot = w;
        clearInterval(iv);
        console.log('[종말예언] 붉은 헤일로 — 슬롯 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 4. 되돌리기 — [복원]
// ==========================================
function sacOf(u) {
    if (!u) return {};
    dayRoll(u);
    if (!u.jisanSac || typeof u.jisanSac !== 'object') u.jisanSac = {};
    return u.jisanSac;
}
function sacPaid(u) {
    const s = sacOf(u);
    return Object.keys(s).reduce(function (a, c) { return a + (Number(s[c].paid) || 0); }, 0);
}
function inRoom(t, now) { return !!(t && t.quarantineUntil && now < t.quarantineUntil); }
// 음식으로 오른 오염도로 갇혔나 (food-quar.js) — 그동안은 둘 다 받지 않는다
function foodQ(x) {
    try { return typeof window.quarFood === 'function' && !!window.quarFood(x); } catch (e) { return false; }
}
function roomName(t) { return (t && t.quarantineDest === 'bath') ? '선녀탕' : '상담실'; }
window.jisanSacList = function () {
    const me = u_();
    if (!me) return;
    const s = sacOf(me);
    console.log('%c===== 📖 [복원] 대상 =====', 'color:#d9a05a; font-size:13px');
    const ks = Object.keys(s);
    if (!ks.length) { console.log('  찍어 둔 사람이 없습니다.'); return; }
    const now = Date.now();
    console.table(ks.map(function (c) {
        const t = userOf(c);
        return { 사원: nameOf(c), 들어가있나: inRoom(t, now) ? roomName(t) : '-',
                 받은몫: (Number(s[c].paid) || 0).toLocaleString() + ' P' };
    }));
    console.log('  다 합쳐 ' + sacPaid(me).toLocaleString() + ' / '
        + JISAN.SAC_CAP.toLocaleString() + ' P');
};

// 대상에게도 같은 몫 — 남의 기록이라 transaction 으로 더한다 (p2p-fix.js 의 givePts 와 같은 수)
function giveTo(code, n, line) {
    const d = db_();
    if (!d || !code || !(n > 0)) return;
    const cap = (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000;
    try {
        d.ref('users/' + code + '/points').transaction(function (v) {
            return Math.min(cap, Math.max(0, Math.round(Number(v) || 0) + n));
        }).catch(function () { });
    } catch (e) { }
    if (!line) return;
    try {
        const t = new Date();
        const time = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0');
        d.ref('users/' + code + '/history').transaction(function (h) {
            const arr = Array.isArray(h) ? h.slice() : (h && typeof h === 'object' ? Object.keys(h).sort().map(function (k) { return h[k]; }) : []);
            arr.unshift({ time: time, text: line });
            while (arr.length > 10) arr.pop();
            return arr;
        }).catch(function () { });
    } catch (e) { }
}

// 찍어 둔 사람이 상담실 · 선녀탕에 있는 동안 — 그 시간만큼 둘 다 받는다 (1분마다)
function sacTick() {
    try {
        const me = u_();
        if (!me || !wears(me)) return;
        const s = sacOf(me);
        const codes = Object.keys(s);
        if (!codes.length) return;
        let left = JISAN.SAC_CAP - sacPaid(me);
        if (left <= 0) return;
        let got = 0;
        const now = Date.now();
        const day = today();
        codes.forEach(function (c) {
            if (left <= 0) return;
            const t = userOf(c);
            if (!t) return;
            const rec = s[c];
            if (!inRoom(t, now) || foodQ(t)) { rec.at = 0; return; }
            if (!rec.at) { rec.at = now; return; }
            const mins = (now - rec.at) / 60000;
            if (mins < JISAN.SAC_STEP) return;
            const step = Math.floor(mins / JISAN.SAC_STEP);
            const p = Math.min(left, Math.round(step * JISAN.SAC_HOUR * JISAN.SAC_STEP / 60));
            if (p <= 0) return;
            rec.at = rec.at + step * JISAN.SAC_STEP * 60000;
            rec.paid = (Number(rec.paid) || 0) + p;
            left -= p; got += p;
            // 대상 쪽 — 같은 몫. 기록 줄은 하루 한 번만 (열 줄밖에 안 남는다)
            const first = rec.told !== day;
            rec.told = day;
            giveTo(c, p, first ? ('[' + NAME + '] ' + (me.name || '') + ' 사원의 [복원] — '
                + roomName(t) + '에 있는 동안 포인트가 함께 들어옵니다.') : null);
        });
        if (got > 0) {
            pay(me, got);
            log_(me, '[' + NAME + '] [복원] 대상이 갇혀 있는 동안 +' + got.toLocaleString() + ' P (대상도 같은 몫)');
            toast('📖 [복원] ' + got.toLocaleString() + ' P');
            save({ jisanSac: 1, history: 1 });
        } else {
            save({ jisanSac: 1 });
        }
    } catch (e) { }
}
setInterval(sacTick, 60000);

// ==========================================
// [복원] · [헤일로] 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:48dvh; margin-bottom:9px;';

function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); });
}
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999992; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:16px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#1d1210,#0b0807);'
        + ' border:1px solid #b03030; border-radius:12px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; display:flex; flex-direction:column;'
        + ' box-shadow:0 8px 30px rgba(0,0,0,0.75);">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#7d7468; margin:4px 0 11px 0; line-height:1.7;">'
            + sub + '</div>' : '<div style="height:9px;"></div>');
}

// 콘솔 · 예전 단추에서 부르던 자리 — 둘 다 고를 수 있게 남겨 둔다
window.jisanMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 을(를) 지니고 있어야 합니다.'); return; }
    dayRoll(me);
    const rodLeft = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    const s = sacOf(me);
    const w = box(head(NAME,
        '이름님께서 하사하신 경전이다.<br>'
        + '오늘 붉은 헤일로 <b style="color:#ffcf8f;">' + rodLeft + '</b>개 · '
        + '[복원] <b style="color:#ffcf8f;">' + Object.keys(s).length + ' / '
        + JISAN.SAC_DAY + '</b>명 · 받은 몫 '
        + sacPaid(me).toLocaleString() + ' / ' + JISAN.SAC_CAP.toLocaleString() + ' P')
        + '<button id="js-sac" class="game-btn" style="' + BTN + ' text-align:center;">[복원] 대상을 고른다</button>'
        + '<button id="js-rod" class="game-btn" style="' + BTN + ' text-align:center;">붉은 헤일로를 씌워 준다</button>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#js-x').onclick = shut;
    w.querySelector('#js-sac').onclick = pickSac;
    w.querySelector('#js-rod').onclick = pickRod;
};

function pickSac() {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 을(를) 지니고 있어야 합니다.'); return; }
    const s = sacOf(me);
    const list = users().filter(function (x) { return x.code !== me.code; });
    if (!list.length) { alert_('고를 사원이 없습니다.'); return; }
    const now = Date.now();
    const rows = list.map(function (t) {
        const on = !!s[t.code];
        return '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px;'
            + ' border:1px solid #3a2a27; border-radius:7px; margin-bottom:6px;'
            + ' background:rgba(40,24,22,0.5);">'
            + '<input type="checkbox" class="js-sc" value="' + esc(t.code) + '"' + (on ? ' checked' : '')
            + ' style="width:17px; height:17px; flex-shrink:0;">'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#e6ddd0;">'
            + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (inRoom(t, now) ? ' <span style="font-size:9px; color:#ff9a9a;">' + roomName(t) + '</span>' : '')
            + (inRoom(t, now) && foodQ(t) ? ' <span style="font-size:9px; color:#ffb74d;">🍽 음식 — 몫 없음</span>' : '')
            + (on ? '<div style="font-size:9px; color:#d9a05a; margin-top:2px;">함께 받은 몫 '
                    + (Number(s[t.code].paid) || 0).toLocaleString() + ' P</div>' : '')
            + '</div></label>';
    }).join('');
    const w = box(head('[복원] — 죽음 · 오염에서 되돌릴 사람',
        '하루 ' + JISAN.SAC_DAY + '사람까지 미리 찍어 둡니다. 찍힌 사원이 상담실이나 선녀탕에 '
        + '들어가 있는 동안, 한 사람에 시간당 ' + JISAN.SAC_HOUR.toLocaleString() + ' P 가 '
        + '<b style="color:#ffcf8f;">당신과 그 사원 둘 다에게</b> 들어옵니다 (당신 몫은 하루 다 합쳐 '
        + JISAN.SAC_CAP.toLocaleString() + ' P 까지 · 그 사원은 당신이 받은 만큼).<br>'
        + '음식으로 오른 오염도로 갇힌 동안은 들어오지 않습니다.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="js-ok" class="game-btn" style="' + BTN + ' text-align:center;">찍는다</button>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#js-x').onclick = shut;
    w.querySelector('#js-ok').onclick = function () {
        const got = Array.prototype.slice.call(w.querySelectorAll('.js-sc:checked'))
            .map(function (x) { return x.value; });
        if (got.length > JISAN.SAC_DAY) {
            alert_('하루 ' + JISAN.SAC_DAY + '사람까지입니다.'); return;
        }
        const next = {};
        got.forEach(function (c) { next[c] = s[c] || { at: 0, paid: 0 }; });
        me.jisanSac = next;
        save({ jisanSac: 1 });
        shut();
        alert_('[복원] ' + got.length + '사람을 찍었습니다.\n\n'
            + got.map(nameOf).join(' · '));
    };
}
window.jisanRestore = pickSac;

function pickRod() {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 을(를) 지니고 있어야 합니다.'); return; }
    dayRoll(me);
    const left = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    if (left <= 0) { alert_('오늘 붉은 헤일로는 다 나갔습니다.'); return; }
    const list = [me].concat(users().filter(function (x) { return x.code !== me.code; }));
    const rows = list.map(function (t) {
        const on = hasRod(t);
        return '<button class="game-btn js-rd" data-c="' + esc(t.code) + '"' + (on ? ' disabled' : '')
            + ' style="' + BTN + (on ? GREY : '') + '">'
            + (t.code === me.code ? '나 — ' : '') + esc(t.name)
            + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (on ? '<div style="font-size:9px; color:#a07070; margin-top:2px;">이미 지니고 있습니다</div>' : '')
            + '</button>';
    }).join('');
    const w = box(head('🔴 붉은 헤일로 — 오늘 ' + left + '개',
        '공용시설 행운이 크게 오릅니다. 대신 한 번 쓸 때마다 오염도가 '
        + JISAN.ROD_POLL + ' 오릅니다 — 동결과 무관하게.<br>'
        + '슬롯에서 연달아 ' + JISAN.ROD_MISS + '번 꽝이면 그 뒤 '
        + JISAN.ROD_SAFE + '판은 꽝이 없습니다. 자정에 사라집니다.<br>'
        + '지닌 사람의 특이사항에 ' + esc(JISAN.ROD_NOTE) + ' 가 달립니다.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#js-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.js-rd'), function (b) {
        b.onclick = function () { shut(); window.jisanRod(b.dataset.c); };
    });
}
window.jisanHalo = pickRod;

// 장착칸 — 장착 단추 옆의 [복원] · [헤일로]
(function badgeBtn() {
    const ID = 'jisan-btn', ID2 = 'jisan-btn-halo';
    function mk(id, label, fn, bg, bd) {
        const b = document.createElement('button');
        b.id = id;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;'
            + ' background:' + bg + ' !important; border-color:' + bd + ' !important;';
        b.textContent = label;
        b.onclick = fn;
        return b;
    }
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.getElementById(ID), old2 = document.getElementById(ID2);
        if (!wears(u_())) { if (old) old.remove(); if (old2) old2.remove(); return; }
        if (old && old.isConnected && old2 && old2.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && (t.indexOf(NAME) >= 0 || t.indexOf(OLD) >= 0)) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        if (old) old.remove(); if (old2) old2.remove();
        // 세로로 — [해제] 아래로 [복원] · [헤일로] (2026-10-21)
        let col = row.querySelector('.jisan-btn-col');
        if (!col) {
            col = document.createElement('div');
            col.className = 'jisan-btn-col';
            col.style.cssText = 'display:flex; flex-direction:column; align-items:stretch; gap:6px; flex-shrink:0;';
            const un = Array.prototype.filter.call(row.children, function (x) { return x.tagName === 'BUTTON' || (x !== row.children[0]); })[0];
            if (un) { row.insertBefore(col, un); col.appendChild(un); un.style.margin = '0'; }
            else row.appendChild(col);
        }
        [mk(ID, '복원', pickSac, 'linear-gradient(145deg,#4a3a1a,#241a08)', '#d9a05a'),
         mk(ID2, '헤일로', pickRod, 'linear-gradient(145deg,#8a1414,#3d0a0a)', '#e07070')].forEach(function (b) {
            b.style.margin = '0';
            col.appendChild(b);
        });
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._jisanBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._jisanBtn = true;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 5. 절대적 권능 — ■■의 ■■■ 천장이 없다 · (1. 덧쓰기 — EPIC 에서 죽었을 때)
// ==========================================
//
//   epic.js:655 가 Math.min(25000, …) 으로 자른다. 그 안을 고칠 수는
//   없으니, **잘리기 전의 값을 여기서 다시 셈해** 넘친 만큼을 뒤에 얹는다.
//   셈은 epic.js:641-655 와 같은 식이다 — 거기가 바뀌면 여기도 고쳐야 한다.
function epicRaw(how) {
    try {
        if (typeof er === 'undefined' || !er) return 0;
        let t = 300 + (Number(er.score) || 0);
        t += (Number(er.moved) || 0) * 60;
        t += (Number(er.helped) || 0) * 900;
        t += ((er.found || []).length) * 400;
        if (er.goalDone) t += 2000;
        if (er.flags && er.flags.deepFound) t += 3000;
        const mins = Math.floor((Date.now() - er.started) / 60000);
        t += Math.min(3000, mins * 50);
        if (how === 'dead') t = Math.floor(t * 0.35);
        return Math.max(300, Math.round(t));
    } catch (e) { return 0; }
}
(function hookEpic() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._jisan) { clearInterval(iv); return; }
        const _e = epicSettle;
        const w = function (how, txt) {
            const me = u_();
            let over = 0;
            const first = !!(epicRun() && !epicRun()._settled);
            try { epicClose(); } catch (e) { }
            try {
                if (me && wears(me)) {
                    const raw = epicRaw(how);
                    over = Math.max(0, raw - JISAN.EPIC_CAP);
                }
            } catch (e) { }
            const out = _e.apply(this, arguments);
            try {
                if (first && how === 'dead' && me && wears(me)) overwrite(EPIC_ZONE);
            } catch (e) { }
            try {
                if (first && over > 0) {
                    pay(me, over);
                    log_(me, '[' + NAME + '] 절대적 권능 — 천장을 넘긴 몫 +' + over.toLocaleString() + ' P');
                    setTimeout(function () {
                        alert_('[ 절대적 권능 ]\n\n'
                            + '이름님에게는 한계가 존재하지 않는다.\n\n'
                            + '천장 ' + JISAN.EPIC_CAP.toLocaleString() + ' P 를 넘긴 '
                            + over.toLocaleString() + ' P 를 그대로 들고 나왔습니다.');
                    }, 800);
                }
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        epicSettle = w; window.epicSettle = w;
        clearInterval(iv);
        console.log('[종말예언] ■■의 ■■■ 천장 풀기 · EPIC 덧쓰기 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
window.jisanGive = function (who, n) {
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
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.jisanState = function (who) {
    const t = find(who) || u_();
    if (!t) { console.log('로그인 전입니다.'); return; }
    dayRoll(t);
    console.log('%c===== 📖 종말예언 · ' + t.name + ' =====', 'color:#d9a05a; font-size:13px');
    console.log('  지니고 있나 :', wears(t) ? 'O' : '✗');
    console.log('  붉은 헤일로 :', hasRod(t)
        ? ('지님 (' + (t.jisanRod.byName || t.jisanRod.by) + ' · 연속 꽝 '
           + (Number(t.jisanRod.miss) || 0) + ' · 꽝 없는 판 ' + (Number(t.jisanRod.safe) || 0) + ')')
        : '없음');
    console.log('  오늘 준 헤일로:', (Number(t.jisanRodGave) || 0) + ' / ' + JISAN.ROD_DAY);
    const s = t.jisanSac || {};
    console.log('  [복원] 대상 :', Object.keys(s).map(nameOf).join(' · ') || '없음',
        '· 받은 몫 ' + sacPaid(t).toLocaleString() + ' / ' + JISAN.SAC_CAP.toLocaleString() + ' P');
    const r = run();
    console.log('  이번 탐사   :', r ? (r.zone + ' (' + modeOf(r) + ')' + (r._jisanTruth ? ' · 죽을 길을 밟음' : '')) : '밖');
    if (r && r.partyId) {
        const p = partyOf(r.partyId) || {};
        console.log('  방의 장착자 :', Object.keys(p.jisanWear || {}).map(nameOf).join(' · ') || '없음');
        console.log('  지우기 물음 :', JSON.stringify(p.jisanSpare || {}));
    }
};

window.JISANFOX = { JISAN: JISAN, wears: wears, hasRod: hasRod, dayRoll: dayRoll,
                    overPool: overPool, overwrite: overwrite, sacPaid: sacPaid,
                    epicRaw: epicRaw, pollRaw: pollRaw, aliveIn: aliveIn, modeOf: modeOf,
                    wearerHere: wearerHere, sacTick: sacTick, noteLine: JISAN.ROD_NOTE };

console.log('[종말예언] jisanGive(사번) · jisanState(사번) · jisanRod(사번) · jisanSacList()');

})();
