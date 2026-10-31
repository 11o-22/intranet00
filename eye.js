// ==========================================
// ★ 🔎 감지하는 눈 — 상담사 지급 전용
// bundles.json 마지막 묶음 · talkshow.js · heart2.js · foxtail.js ·
// spaceitems.js · newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
//   위험한 것을 감지하는 눈. 또한 사용자에게 이득이 되는 것이라면
//   무엇이든 알 수 있다.
//
// ■ 여섯 가지
//
//   1. 행운 300% · 회수품 확률 300%
//   2. 탐사에서 최대 네 명에게 버프를 건다. 그 뒤가 길다 (아래)
//   3. 장착한 채로 우주 쇼핑몰·[???] 을 보면 일부 품목이 3분의 1 값으로 보인다
//   4. 우주 쇼핑몰에서 두 판을 이겨 입고될 때, 목록을 보고 되돌릴 수 있다 (하루 2회)
//      ★ 되돌릴 자리는 사람 글(u.eyeAlienSnap)에 적는다. 전에는 창 안에만
//        있어서, 판 사이에 앱을 다시 열면 칸은 뜨는데 눌러도 아무 일도
//        없었다 (아래 「승부 이전」 자리 참고).
//   5. 상담실·선녀탕에서 포인트를 내고 바로 나온다. 다음에 갇히면 세 배로 돌아온다
//      ★ 하루 다섯 번까지 (2026-10-21 · 처음엔 세 번) — u.eyeOutDay = { d, n }. 세 배로 돌려받는 몫도 나온 만큼만 생긴다
//      ★ 낼 값은 고른다 — 50,000 ~ 100,000 P (2026-10-21). 돌려받는 것은 낸 값의 세 배
//      ★ 음식으로 오른 오염도로 갇혔으면 (food-quar.js 의 quarFood) —
//          나오기는 하고 횟수도 줄지만, 세 배로 돌려받을 몫은 생기지 않는다 (값은 가장 낮은 값만)
//          그렇게 갇힐 때는 쌓아 둔 몫도 내주지 않는다 — 다음에 갇힐 때까지 그대로 남는다
//      ★ 차고 있으면 상담실 · 선녀탕에 있어도 은행(tab-vip)은 열린다 (index.html updateUI · shell.js lockedWhy)
//   6. 탐사 횟수를 다 쓰면 그날 번 것 중 하나를 한 번 더 받는다
//
// ■ 2번이 어떻게 도는가
//
//   파티로 들어가면 장착자 화면에만 고르는 칸이 뜬다. 최대 넷.
//   고른 사람마다 버프 하나가 무작위로 걸린다.
//
//       행운 +1~3 · 회피 +1~3 · 판정 +1~3 · 오염 동결 · 보너스 포인트 1.5~3배
//
//   끝났을 때 —
//
//       버프 받은 사람이 죽었다       장착자 포인트 ×1.5
//       장착자가 죽었다               버프 받은 사람 중 하나가 같이 죽는다
//                                     죽은 사람들은 20,000 P 를 확정으로 받는다
//       아무도 안 죽었다              버프 받은 사람 ×2 · 장착자 ×3
//
//   남의 화면을 직접 건드릴 수는 없다. 그래서 판에 적는다.
//
//       darkParties/<방>/eye = {
//           by, byName, at,
//           picks: { <사번>: { k, v, name } },   누가 무슨 버프를 받았나
//           dead:  { <사번>: true },             누가 죽었나 (각자 제 화면에서 적는다)
//           doom:  <사번>                        장착자가 죽어 끌려가는 사람
//       }
//
//   버프도 각자 제 화면에서 제 몸에 건다. 남의 itemBuffs 를 내가 통째로
//   덮어쓰면 그 사이에 그쪽이 받은 버프가 지워진다. (ibAdd 가 남에게 걸 때
//   하는 일이 그것이다)
//
// ■ 숫자는 전부 아래 한 자리에 있다
//
//   EYE 표를 고치면 다 따라온다.
//
// ■ 콘솔
//   eyeGive(사번)    상담사가 하나 준다
//   eyeState()       지금 무엇이 걸려 있나
//   eyeParty()       이번 탐사의 버프와 생사

const EYE = {
    NAME:        '🔎 감지하는 눈',
    LUCK:        4,          // 행운 300% 상승 → ×4  (유리구슬 300% = ×4 와 같은 셈법)
    LOOT:        4,          // 회수품 확률 300% 상승 → ×4
    PICK_MAX:    4,          // 버프를 줄 수 있는 인원
    DEAD_PAY:    20000,      // 장착자가 죽었을 때 죽은 사람들이 받는 확정 포인트
    W_BUFF_DEAD: 1.5,        // 버프 받은 사람이 죽었을 때 장착자 배수
    W_ALL_ALIVE: 3,          // 전원 생존 시 장착자 배수
    B_ALL_ALIVE: 2,          // 전원 생존 시 버프 받은 사람 배수
    SHOP_OFF:    3,          // 할인 — 3분의 1 (우주 쇼핑몰 · [???] 만)
    SHOP_PICK:   3,          // 한 가게에서 몇 종이 싸게 보이나
    ALIEN_WINS:  2,          // 한 묶음을 끝내는 승수 (index.html 의 ALIEN_BOUT_WIN 과 같다 · 참고용)
    ALIEN_BACK:  2,          // 되돌리기 하루 횟수
    OUT_MIN:     50000,      // 상담실·선녀탕에서 바로 나오는 값 — 가장 낮은 값
    OUT_MAX:     100000,     //                                  — 가장 높은 값 (2026-10-21)
    OUT_STEP:    10000,      // 고르는 칸의 간격
    OUT_BACK:    3,          // 다음에 갇혔을 때 돌려받는 배수 (낸 값의)
    OUT_DAY:     5,          // 하루에 값을 치르고 나올 수 있는 횟수 (2026-10-21 · 3 → 5)
    AGAIN_DAY:   1           // 「한 번 더」 하루 횟수
};

(function eyeItem() {

const NAME = EYE.NAME;
const HOUR = 3600 * 1000;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
// ★ 이벤트 어둠(「이상한 나라의 ■■■」 · 연계판 포함)에서는 커스텀 장비가 먹히지 않는다 (2026-10-31 사용자 · wonder-core.js WONDER_GEAR_OFF)
function wOff(z) { try { return !!(window.WONDER_GEAR_OFF && window.WONDER_GEAR_OFF(z)); } catch (e) { return false; } }
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function cycle22() {
    try { return get22HourCycleStr(); } catch (e) { return today(); }
}
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function nameOf(c) {
    try { if (typeof safeName === 'function') return safeName(c); } catch (e) { }
    const x = (typeof db !== 'undefined' && db.users && db.users[c]) || null;
    return (x && x.name) || c;
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t);
}
function log_(user, t) {
    try { if (typeof addHistoryLog === 'function') addHistoryLog(user, t); } catch (e) { }
}

// 차고 있나 — 빌려 온 능력까지 보려고 hasEquip 을 먼저 쓴다
function wears(user) {
    const x = user || u_();
    if (!x) return false;
    try { if (typeof hasEquip === 'function') return hasEquip(x, NAME); } catch (e) { }
    if (!Array.isArray(x.equippedWeapons)) return false;
    return x.equippedWeapons.some(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        return b === NAME;
    });
}
window.wearsEye = wears;
// 『 K 의 방 』 은 darkDeath · renderDarkResult 를 거치지 않는다 — 그쪽에서 부른다
window.eyeKroom = {
    dead: function () { markDead(); owedPay(); },     // 내가 쓰러졌다
    mult: function () { return settleMult(); },        // 정산 배수
    rec: function (n) { if (wears(u_())) rec(n); }     // 능력 6 — 오늘 번 것
};

// ==========================================
// 등록 — 어느 상점에도 안 깔리고 장터에도 안 뜬다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'eye_equip', noSell: true,
            desc: '위험한 것을 감지하는 눈. 또한 사용자에게 이득이 되는 것이라면 무엇이든 알 수 있다. '
                + '행운 300% · 회수품 확률 300% 상승. 탐사에서 최대 네 명에게 버프를 건다. '
                + '우주 쇼핑몰과 [???] 의 일부 품목이 3분의 1 값으로 보이고, 우주 쇼핑몰에서 두 번 이기면 '
                + '입고될 목록을 먼저 보고 되돌릴 수 있다. 갇혔을 때 값을 치르고 나올 수 있고, 갇혀 있어도 은행은 쓸 수 있다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        console.log('[눈] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 다른 파일이 상점 후보에 넣어도 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
    let i;
    while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
}, 5000);

// 장터에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._eye) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._eye = true;
        clearInterval(iv);
    }, 400);
})();

// 장착
(function equip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._eye) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'eye_equip') return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if ((me.inventory || []).indexOf(itemName) < 0) { alert_('가지고 있지 않습니다.'); return; }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
            if (equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, itemName, 1); } catch (e) { }
            try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(me, '[장착됨] ' + NAME); } catch (e) { }
            log_(me, '[장착] ' + NAME);
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_('눈을 뜹니다.\n\n보이지 않던 것이 보입니다.\n무엇이 위험한지, 무엇이 이득인지.');
        };
        useInventoryItem._eye = true;
        clearInterval(iv);
        console.log('[눈] 장착 연결');
    }, 400);
})();

// ==========================================
// 능력 1 — 행운 300% · 회수품 확률 300%
// ==========================================
(function luck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._eye) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        facilityLuckMult = function (user) {
            let m = _f.apply(this, arguments);
            try { if (wears(user || u_())) m *= EYE.LUCK; } catch (e) { }
            return m;
        };
        facilityLuckMult._eye = true;
        clearInterval(iv);
        console.log('[눈] 행운 ×' + EYE.LUCK + ' 연결');
    }, 400);
})();

(function loot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function') return;
        if (emLootMult._eye) { clearInterval(iv); return; }
        const _e = emLootMult;
        const wrapped = function (user) {
            let v = _e.apply(this, arguments) || 1;
            try { if (wears(user || u_())) v *= EYE.LOOT; } catch (e) { }
            return v;
        };
        wrapped._eye = true;
        window.emLootMult = wrapped;
        clearInterval(iv);
        console.log('[눈] 회수품 ×' + EYE.LOOT + ' 연결');
    }, 400);
})();

// ==========================================
// 능력 2 — 파티 버프와 생사
// ==========================================
const BUFFS = [
    { k: 'luck',   t: '행운',        lo: 1, hi: 3 },
    { k: 'eva',    t: '회피',        lo: 1, hi: 3 },
    { k: 'bon',    t: '판정',        lo: 1, hi: 3 },
    { k: 'noPoll', t: '오염 동결',   lo: 1, hi: 1 },
    { k: 'pt',     t: '보너스 포인트', lo: 0, hi: 0 }   // 1.5~3배 — 아래에서 따로 센다
];
const BOX = 'eye-party-box';

let room = null, ref = null, key = '';

function path() { const r = run(); return 'darkParties/' + r.partyId + '/eye'; }
// ★ 🫧 흔적 (trace.js) — 혼자 든 탐사에서도 눈을 쓴다 (2026-10-24)
//   혼자면 고를 동료가 없어 이 칸이 아예 안 떴다. 흔적을 단 사람은 **나 자신**을 고른다 —
//   버프 하나(보너스 포인트는 빼고 넷 중)가 걸리고, 살아 나오면 장착자 몫 ×3.
//   혼자 든 방(1인 파티)은 방 노드에 그대로 적고, 방이 없는 혼자 판(어둠 혼자 · K의 방 혼자)은
//   판(darkRun.eyeSolo)에 적는다. EPIC 은 원래 눈의 정산이 없어 넣지 않는다.
function soloEye() {
    const me = u_();
    try { return !!(me && wears(me) && typeof window.traceSolo === 'function' && window.traceSolo()); } catch (e) { return false; }
}
function isLocal() { const r = run(); return !!(r && !(r.isParty && r.partyId)); }
function on_() {
    const r = run();
    if (!r || r._settled || wOff()) return false;      // 이벤트 어둠 — 눈이 뜨지 않는다
    if (db_() && r.isParty && r.partyId) return true;
    return !r.epic && soloEye();                       // 방 없는 혼자 판 — 흔적일 때만
}
function eye() {
    if (isLocal()) { const r = run(); return (r && r.eyeSolo) || null; }
    return (room && room.eye) || null;
}
// 나 혼자 나를 고른 판인가
function selfOnly(s) {
    const k = Object.keys((s && s.picks) || {});
    return k.length === 1 && s.by === u_().code && k[0] === s.by;
}
function amOwner() { const s = eye(); return !!(s && s.by === u_().code); }
function picks() { const s = eye(); return (s && s.picks) || {}; }
function deadMap() { const s = eye(); return (s && s.dead) || {}; }

function watch() {
    if (!on_() || isLocal()) {
        if (ref) { try { ref.off(); } catch (e) { } ref = null; key = ''; room = null; }
        return;
    }
    if (key === run().partyId) return;
    if (ref) { try { ref.off(); } catch (e) { } }
    key = run().partyId;
    room = null;
    ref = db_().ref('darkParties/' + key);
    ref.on('value', function (s) { room = s.val() || null; try { paint(); } catch (e) { } });
}

// --- 고르는 칸 (장착자만) ---
let chosen = {};

function body_() {
    try { return (typeof darkBodyEl === 'function') ? darkBodyEl() : null; } catch (e) { return null; }
}
// ★ 같은 내용이면 손대지 않는다
//
//   예전에는 data-h 를 **읽기만 하고 쓰지는 않아서** 늘 어긋났다. 그래서
//   1.2초마다 이 칸을 통째로 갈아 끼웠는데, index.html 이 #dro-body 의
//   자식이 바뀔 때마다 0.6초 동안 버튼 누름을 삼키게 해 두었다.
//   결과 — 눈을 차고 어둠에 들어가면 선택지를 여러 번 눌러야 했다.
//   이제는 내용이 같으면 아예 건드리지 않는다.
function sig_(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) | 0;
    return String(h >>> 0);
}
function put(html) {
    const b = body_();
    if (!b) return;
    const h = sig_(html);
    // data-side — index.html 의 「단추가 바뀌면 0.6초 막기」가 이 칸은 세지 않는다 (K 의 방에서 장면마다 누름을 먹던 것)
    const tagged = html.replace('<div id="' + BOX + '"', '<div id="' + BOX + '" data-side="1" data-h="' + h + '"');
    const old = document.getElementById(BOX);
    if (old) {
        if (old.getAttribute('data-h') === h) return;       // 그대로다
        if (old.parentNode !== b) { old.remove(); b.insertAdjacentHTML('beforeend', tagged); return; }
        old.outerHTML = tagged;
        return;
    }
    b.insertAdjacentHTML('beforeend', tagged);
}
function clearBox() { const o = document.getElementById(BOX); if (o) o.remove(); }
function wrap(inner) {
    return '<div id="' + BOX + '" style="margin:10px 0; padding:11px 12px; border-radius:6px;'
        + ' background:rgba(0,150,200,0.10); border:1px solid #2a7a9a;">' + inner + '</div>';
}

function roster() {
    const r = run();
    const p = (typeof darkParties !== 'undefined' && darkParties[r.partyId]) || {};
    const alive = Object.keys(p.alive || {});
    const base = alive.length ? alive : Object.keys(p.members || {});
    const out = base.filter(function (c) { return c !== u_().code; });
    if (!out.length && soloEye()) return [u_().code];  // 🫧 흔적 — 혼자면 나를 고른다
    return out;
}

window.eyeToggle = function (code) {
    if (chosen[code]) delete chosen[code];
    else {
        if (Object.keys(chosen).length >= EYE.PICK_MAX) { alert_('최대 ' + EYE.PICK_MAX + '명까지입니다.'); return; }
        chosen[code] = 1;
    }
    try { paint(); } catch (e) { }
};

window.eyeSeal = function () {
    if (!on_() || !db_()) return;
    const list = Object.keys(chosen);
    if (!list.length) { alert_('한 명도 고르지 않았습니다.'); return; }
    const out = {};
    const me0 = u_().code;
    list.forEach(function (c) {
        // 혼자 나를 고르면 보너스 포인트는 빼고 넷 중에서 — 포인트 몫은 살아 나올 때의 ×3 이 맡는다
        const pool = (c === me0) ? BUFFS.filter(function (x) { return x.k !== 'pt'; }) : BUFFS;
        const b = pool[Math.floor(Math.random() * pool.length)];
        let v;
        if (b.k === 'pt') v = Math.round((1.5 + Math.random() * 1.5) * 100) / 100;   // 1.5~3배
        else v = b.lo + Math.floor(Math.random() * (b.hi - b.lo + 1));
        out[c] = { k: b.k, v: v, name: nameOf(c) };
    });
    const me = u_();
    const rec0 = { by: me.code, byName: me.name, at: Date.now(), picks: out };
    if (isLocal()) run().eyeSolo = rec0;
    else db_().ref(path()).set(rec0);
    chosen = {};
    clearBox();
    const lines = Object.keys(out).map(function (c) {
        const b = out[c];
        return out[c].name + ' — ' + label(b);
    });
    if (!isLocal()) { try { if (typeof sendPartyChat === 'function') sendPartyChat(me.name + ' 사원의 눈이 떠졌습니다.', true); } catch (e) { } }
    else { try { paint(); } catch (e) { } }
    alert_('눈이 열렸습니다.\n\n' + lines.join('\n'));
};

function label(b) {
    if (b.k === 'pt') return '보너스 포인트 ×' + b.v;
    const d = BUFFS.filter(function (x) { return x.k === b.k; })[0];
    const t = d ? d.t : b.k;
    return (b.k === 'noPoll') ? t : (t + ' +' + b.v);
}

// --- 내 몸에 거는 것은 내 화면에서 ---
// 남의 itemBuffs 를 내가 통째로 덮어쓰면 그 사이에 그쪽이 받은 것이 지워진다.
let applied = '';
function applyMine() {
    const s = eye();
    if (!s) return;
    const me = u_();
    const mine = (s.picks || {})[me.code];
    if (!mine) return;
    const tag = key + '|' + (s.at || 0);
    if (applied === tag) return;
    if (me.eyeGot === tag) { applied = tag; return; }
    applied = tag;
    me.eyeGot = tag;

    if (mine.k !== 'pt') {
        try {
            if (typeof ibAdd === 'function') {
                ibAdd(me, mine.k, mine.v, 12 * HOUR, NAME, { run: true });
            }
        } catch (e) { console.warn('[눈] 버프 건너뜀:', e && e.message); }
        // 회피·기믹 몫은 탐사 들머리에 한 번만 읽힌다. 다시 채워 준다.
        try { if (typeof resetDnaCharge === 'function') resetDnaCharge(); } catch (e) { }
    }
    try { if (typeof saveFields === 'function') saveFields({ eyeGot: 1 }); } catch (e) { }
    try { if (typeof showDarkToast === 'function') showDarkToast('◉ 누군가 당신을 보고 있다 — ' + label(mine)); } catch (e) { }
    log_(me, '[' + NAME + '] ' + (s.byName || '') + ' 사원의 눈 — ' + label(mine));
}

// --- 오염 동결 ---
// applyPollutionToUser 는 noPoll 을 안 본다. 여기서 막는다.
(function freeze() {
    const iv = setInterval(function () {
        if (typeof applyPollutionToUser !== 'function') return;
        if (applyPollutionToUser._eye) { clearInterval(iv); return; }
        const _a = applyPollutionToUser;
        applyPollutionToUser = function (user, amt) {
            try {
                const me = u_();
                if (me && user && user.code === me.code && (amt || 0) > 0
                    && typeof ibSum === 'function' && (ibSum(me).noPoll || 0) > 0) return;
            } catch (e) { }
            return _a.apply(this, arguments);
        };
        applyPollutionToUser._eye = true;
        clearInterval(iv);
    }, 400);
})();

// --- 죽음을 판에 적는다 ---
let wroteDead = '';
function markDead() {
    if (!on_() || !eye()) return;
    const me = u_();
    const tag = key + '|' + me.code;
    if (wroteDead === tag) return;
    wroteDead = tag;

    const s = eye();
    const iAmOwner = s.by === me.code;

    if (isLocal()) { s.dead = s.dead || {}; s.dead[me.code] = true; return; }   // 혼자 판 — 끌고 갈 사람이 없다
    db_().ref(path()).transaction(function (a) {
        if (!a) return;
        a.dead = a.dead || {};
        a.dead[me.code] = true;
        // 장착자가 죽으면 버프 받은 사람 중 하나를 끌고 간다
        if (iAmOwner && !a.doom) {
            const live = Object.keys(a.picks || {}).filter(function (c) { return !(a.dead || {})[c]; });
            if (live.length) a.doom = live[Math.floor(Math.random() * live.length)];
        }
        return a;
    }).catch(function () { });
}

// --- 끌려가는 사람 ---
let doomed = '';
function checkDoom() {
    const s = eye();
    if (!s || !s.doom) return;
    const me = u_();
    if (s.doom !== me.code) return;
    if ((s.dead || {})[me.code]) return;
    const r = run();
    if (!r || r._dead) return;
    const tag = key + '|doom';
    if (doomed === tag) return;
    doomed = tag;
    fallen();
}

// 상담실로 끌려가지 않는 죽음 — 20,000 P 만 받고 나온다
function fallen() {
    const r = run();
    if (!r || r._dead) return;
    r._dead = true;
    r.failedRun = true;
    r.fail = (r.fail || 0) + 2;

    const me = u_();
    me.points = (Number(me.points) || 0) + EYE.DEAD_PAY;
    log_(me, '[' + NAME + '] 눈이 감겼습니다. (+' + EYE.DEAD_PAY.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }

    try { db_().ref('darkParties/' + r.partyId + '/alive/' + me.code).remove(); } catch (e) { }
    try {
        db_().ref(path()).transaction(function (a) {
            if (!a) return; a.dead = a.dead || {}; a.dead[me.code] = true; return a;
        });
    } catch (e) { }

    // 『 K 의 방 』 — 화면은 그쪽이 그린다 (몫과 표시는 위에서 다 했다)
    if (typeof window.kroomOn === 'function' && window.kroomOn() && typeof window.kroomOut === 'function') {
        window.kroomOut('eye', '눈을 가진 사람이 감겼다.<br><br>그 순간 네 것도 같이 감긴다. 보고 있던 것이 무엇이었는지<br>이제 와서 알 것 같다.<br><br>'
            + '<span style="color:#4fc3f7;">거기까지는 갔으니 ' + EYE.DEAD_PAY.toLocaleString() + ' P 는 들어온다.</span>');
        return;
    }

    try {
        const b = body_();
        if (b && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
            b.innerHTML = darkBox('—',
                '눈을 가진 사람이 감겼다.<br><br>'
                + '그 순간 네 것도 같이 감긴다. 보고 있던 것이 무엇이었는지<br>'
                + '이제 와서 알 것 같다.<br><br>'
                + '<span style="color:#4fc3f7;">거기까지는 갔으니 ' + EYE.DEAD_PAY.toLocaleString() + ' P 는 들어온다.</span>',
                darkChoiceBtn('숨을 고른다.', 'finishDarkDeath()'));
        }
    } catch (e) { }
}

// --- 그리기 ---
function paint() {
    if (!on_()) { clearBox(); return; }
    applyMine();
    checkDoom();

    const s = eye();
    const me = u_();

    // 아직 안 골랐다 — 장착자에게만 고르는 칸
    if (!s) {
        if (!wears(me)) { clearBox(); return; }
        const list = roster();
        if (!list.length) { clearBox(); return; }
        const n = Object.keys(chosen).length;
        const alone = list.length === 1 && list[0] === me.code;
        const rows = list.map(function (c) {
            const on = !!chosen[c];
            return '<button onclick="eyeToggle(\'' + c + '\')" style="width:100%; margin:0 0 5px 0;'
                + ' padding:8px 10px; text-align:left; font-size:11px; border-radius:5px; cursor:pointer;'
                + ' background:' + (on ? 'rgba(79,195,247,0.22)' : 'rgba(0,0,0,0.3)') + ';'
                + ' border:1px solid ' + (on ? '#4fc3f7' : '#333') + '; color:' + (on ? '#dff3ff' : '#aaa') + ';">'
                + (on ? '◉ ' : '○ ') + esc(nameOf(c)) + (c === me.code ? ' (나)' : '') + '</button>';
        }).join('');
        put(wrap(
            '<div style="font-size:12px; color:#4fc3f7; font-weight:bold; margin-bottom:7px;">🔎 눈을 나눈다</div>'
            + '<div style="font-size:10px; color:#9ab; line-height:1.7; margin-bottom:9px;">'
            + (alone
                ? '🫧 흔적 — 혼자 든 탐사입니다. 나에게 눈을 엽니다.<br>버프가 하나 걸리고, 살아 나오면 몫이 ×' + EYE.W_ALL_ALIVE + ' 입니다.</div>'
                : '최대 ' + EYE.PICK_MAX + '명까지 고릅니다. 고른 사람에게 버프가 하나씩 걸립니다.<br>'
                  + '이들이 죽으면 당신의 몫이 늘고, 당신이 죽으면 이들 중 하나가 같이 갑니다.</div>')
            + rows
            + '<button onclick="eyeSeal()" style="width:100%; margin-top:6px; padding:9px; font-size:11px;'
            + ' border-radius:5px; cursor:pointer; background:linear-gradient(145deg,#1f5f7a,#0d3448);'
            + ' border:1px solid #4fc3f7; color:#dff3ff; font-weight:bold;">'
            + '눈을 연다 (' + n + ' / ' + EYE.PICK_MAX + ')</button>'));
        return;
    }

    // 이미 정해졌다 — 상태만
    const d = deadMap();
    const mine = (s.picks || {})[me.code];
    const rows = Object.keys(s.picks || {}).map(function (c) {
        const b = s.picks[c];
        const gone = !!d[c];
        return '<div style="font-size:10px; line-height:1.8; color:' + (gone ? '#ff7b7b' : '#9fd8ef') + ';">'
            + (gone ? '✗ ' : '◉ ') + esc(b.name || nameOf(c)) + ' — ' + esc(label(b))
            + (gone ? ' <span style="color:#888;">(쓰러짐)</span>' : '') + '</div>';
    }).join('');
    put(wrap(
        '<div style="font-size:12px; color:#4fc3f7; font-weight:bold; margin-bottom:6px;">'
        + '🔎 ' + esc(s.byName || '') + ' 사원의 눈</div>'
        + rows
        + (mine ? '<div style="font-size:10px; color:#d4af37; margin-top:7px;">당신에게 걸린 것 — '
            + esc(label(mine)) + '</div>' : '')
        + (d[s.by] ? '<div style="font-size:10px; color:#ff7b7b; margin-top:7px;">눈이 감겼습니다.</div>' : '')));
}

// 사망을 잡는다 — 은심장과 같은 자리
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._eye) { clearInterval(iv); return; }
        const _d = darkDeath;
        const wrapped = function () {
            const before = (run()) ? !!run()._dead : null;
            const r = _d.apply(this, arguments);
            try {
                if (!run() || !run()._dead) return r;       // 살아났다
                if (before === true) return r;              // 이미 죽어 있었다
                markDead();
                owedPay();                                  // 능력 5 — 갇히면 세 배
            } catch (e) { console.warn('[눈] 사망 처리 건너뜀:', e && e.message); }
            return r;
        };
        wrapped._eye = true;
        darkDeath = wrapped;
        clearInterval(iv);
        console.log('[눈] 사망 연결');
    }, 500);
})();

setInterval(function () { try { watch(); paint(); } catch (e) { } }, 1200);

// ==========================================
// 정산 — 배수와 능력 6 의 기록
// ==========================================
function settleMult() {
    const s = eye();
    const me = u_();
    if (!s) return 1;
    const d = s.dead || {};
    const p = s.picks || {};
    const anyDead = Object.keys(d).length > 0;

    if (selfOnly(s)) return anyDead ? 1 : EYE.W_ALL_ALIVE;   // 🫧 혼자 나를 골랐다 — 살면 ×3
    if (s.by === me.code) {
        if (anyDead) {
            const buffedDead = Object.keys(p).some(function (c) { return d[c]; });
            return buffedDead ? EYE.W_BUFF_DEAD : 1;
        }
        return EYE.W_ALL_ALIVE;
    }
    const mine = p[me.code];
    if (!mine) return 1;
    let m = (mine.k === 'pt') ? mine.v : 1;
    if (!anyDead) m *= EYE.B_ALL_ALIVE;
    return m;
}

(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._eye) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const wrapped = function () {
            const me = u_();
            const before = me ? (Number(me.points) || 0) : 0;
            let mult = 1;
            try { mult = settleMult(); } catch (e) { }

            const out = _r.apply(this, arguments);

            try {
                if (!me) return out;
                const got = (Number(me.points) || 0) - before;
                if (got > 0) {
                    if (mult > 1) {
                        const extra = Math.round(got * (mult - 1));
                        me.points += extra;
                        log_(me, '[' + NAME + '] 눈의 몫 ×' + mult + ' (+' + extra.toLocaleString() + ' P)');
                        try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
                        try { if (typeof showPointGainEffect === 'function') showPointGainEffect(extra); } catch (e) { }
                    }
                    if (wears(me)) rec(got + (mult > 1 ? Math.round(got * (mult - 1)) : 0));
                }
            } catch (e) { console.warn('[눈] 정산 건너뜀:', e && e.message); }
            return out;
        };
        wrapped._eye = true;
        renderDarkResult = wrapped;
        clearInterval(iv);
        console.log('[눈] 정산 연결');
    }, 500);
})();

// ==========================================
// 능력 3 — 우주 쇼핑몰 · ??? 의 일부가 3분의 1 값
// ==========================================
//
// 일반 상점에는 안 걸린다. 걸리는 곳은 두 군데다.
//
//     우주 쇼핑몰   #alien-items-container · buyAlienItem
//     [???]         #qshop-body            · buyQShopItem
//
// 「일부」는 그날·그 사람·그 가게마다 따로 고정한다. 다시 그릴 때마다
// 바뀌면 눌러 보는 사이에 값이 달라진다. 진열에 걸린 이름을 그대로
// 줄 세워 앞의 몇 개를 고르므로, 진열이 안 바뀌는 한 값도 안 바뀐다.
//
// 값은 화면만 고치는 게 아니라 사는 함수에서 다시 센다. 눌린 단추에
// 적힌 값을 믿지 않는다.

const SHOPS = [
    { key: 'alien', box: 'alien-items-container', fn: 'buyAlienItem', quote: true  },
    { key: 'q',     box: 'qshop-body',            fn: 'buyQShopItem', quote: false }
];

function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

// 지금 그 가게에 걸려 있는 이름들 — 품절까지 같이 센다.
// (팔려 나갈 때마다 싼 품목이 옮겨 다니면 안 되므로)
function shelfOf(sh) {
    const box = document.getElementById(sh.box);
    if (!box) return [];
    const re = new RegExp(sh.fn + "\\('([^']*)'");
    const out = [], seen = {};
    box.querySelectorAll('button[onclick*="' + sh.fn + '"]').forEach(function (b) {
        const m = (b.getAttribute('onclick') || '').match(re);
        if (!m || seen[m[1]]) return;
        seen[m[1]] = 1;
        out.push(m[1]);
    });
    return out;
}

function cheapSet(sh) {
    const me = u_();
    if (!me || !wears(me)) return {};
    const list = shelfOf(sh);
    if (!list.length) return {};
    const seed = today() + '|' + me.code + '|' + sh.key;
    const sorted = list.slice().sort(function (a, b) { return hash(seed + a) - hash(seed + b); });
    const out = {};
    sorted.slice(0, EYE.SHOP_PICK).forEach(function (n) { out[n] = 1; });
    return out;
}

window.eyePrice = function (itemName, key) {
    const cat = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[itemName] : null;
    const base = cat ? Number(cat.price) : NaN;
    if (!isFinite(base)) return base;                 // 「???」 같은 값은 건드리지 않는다
    const list = key ? SHOPS.filter(function (s) { return s.key === key; }) : SHOPS;
    for (let i = 0; i < list.length; i++) {
        if (cheapSet(list[i])[itemName]) return Math.max(1, Math.floor(base / EYE.SHOP_OFF));
    }
    return base;
};

(function shop() {
    // 다른 파일이 그 위를 또 감싸면 표식이 안 보인다 (newitems2.js 의 withPool 처럼).
    // 그래서 표식이 아니라 「내가 감쌌는가」를 여기에 따로 적어 둔다.
    const done = {};
    const iv = setInterval(function () {
        let hit = 0;

        // --- 내는 값 — 넘어온 price 를 믿지 않고 다시 센다 ---
        SHOPS.forEach(function (sh) {
            const f = window[sh.fn];
            if (typeof f !== 'function') return;
            if (done[sh.fn] || f._eyeBuy) { hit++; return; }
            done[sh.fn] = 1;
            const _b = f;
            const w = function (nm, price) {
                let p = price;
                try {
                    const real = window.eyePrice(nm, sh.key);
                    if (isFinite(real)) p = sh.quote ? String(real) : real;
                } catch (e) { }
                return _b.call(this, nm, p);
            };
            w._eyeBuy = true;
            window[sh.fn] = w;
            hit++;
        });

        // --- 보이는 값 ---
        ['renderAlienShop', 'renderQShop'].forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function' || done[n] || f._eyeDraw) return;
            done[n] = 1;
            const _r = f;
            const w = function () {
                const out = _r.apply(this, arguments);
                try { repaint(); } catch (e) { }
                return out;
            };
            w._eyeDraw = true;
            window[n] = w;
        });

        if (hit < SHOPS.length) return;
        clearInterval(iv);
        console.log('[눈] 우주 쇼핑몰 · ??? ' + EYE.SHOP_OFF + '분의 1 연결');
    }, 400);
})();

function repaint() {
    SHOPS.forEach(function (sh) {
        const box = document.getElementById(sh.box);
        if (!box) return;
        const set = cheapSet(sh);
        if (!Object.keys(set).length) return;
        const re = new RegExp(sh.fn + "\\('([^']*)'");
        box.querySelectorAll('button[onclick*="' + sh.fn + '"]').forEach(function (b) {
            const m = (b.getAttribute('onclick') || '').match(re);
            if (!m) return;
            const nm = m[1];
            if (!set[nm]) return;
            if (b.getAttribute('data-eye') === nm) return;
            const p = window.eyePrice(nm, sh.key);
            if (!isFinite(p)) return;
            b.setAttribute('data-eye', nm);
            b.setAttribute('onclick', sh.fn + "('" + nm + "', " + (sh.quote ? "'" + p + "'" : p) + ")");
            if (!b.disabled) {
                b.innerHTML = '<span style="color:#4fc3f7; font-weight:bold;">' + p + ' P</span>'
                    + ' <span style="font-size:9px; color:#777; text-decoration:line-through;">'
                    + (ITEM_CATALOG[nm] ? ITEM_CATALOG[nm].price : '') + '</span>';
            }
        });
    });
}
// 다른 파일이 가게를 다시 그려도 따라붙는다
setInterval(function () { try { if (u_() && wears(u_())) repaint(); } catch (e) { } }, 1500);

// ==========================================
// 능력 4 — 우주 쇼핑몰, 미리 보고 되돌린다
// ==========================================
function alienDay(me) {
    if (me.eyeAlienDay !== cycle22()) {
        me.eyeAlienDay = cycle22();
        me.eyeAlienWins = 0;
        me.eyeAlienBack = 0;
        me.eyeAlienSnap = null;          // 어제 자리로는 되돌리지 않는다
    }
}
window.eyeAlienLeft = function () {
    const me = u_();
    if (!me) return 0;
    alienDay(me);
    return Math.max(0, EYE.ALIEN_BACK - (me.eyeAlienBack || 0));
};

// ==========================================
// 「승부 이전」 자리는 사람 글에 적는다
// ==========================================
//
// ★ 전에는 이 자리가 **창 안에만** 있었다 (let snap).
//
//     한 묶음은 세 판 중 두 판이다. 판 사이에는 1.5초 잠금이 있고, 그
//     사이에 앱을 내리거나 새로 고치는 일이 흔하다. 묶음은 서버에 적히므로
//     (alienBout) 다시 들어오면 「두 판을 이기면 입고됩니다」가 그대로
//     이어지는데, 눈이 들고 있던 승부 이전 자리는 창과 함께 사라져 있었다.
//
//     그러면 두 번째 판을 이겨 칸은 뜨는데, 「되돌린다」를 눌러도
//     **아무 일도 아무 말도 없이** 끝났다. 그것이 「되돌리는 게 안 먹힌다」다.
//
//   그래서 글에 적는다. 다시 들어와도, 다른 기기에서도 그대로 있다.
//
//       u.eyeAlienSnap = { bout, used, last, unlocked, date, at, part }
//
//   part 가 1 이면 묶음 시작이 아니라 **입고된 자리에서 되짚어 만든 것**이다
//   (묶음 도중에 눈을 찬 때처럼 시작을 못 본 경우). 그때는 세 시간 시계를
//   되돌리지 않는다 — 돌릴 자리를 모르기 때문이다. 칸에도 그렇게 적는다.
//
//   ★ 파이어베이스는 null 과 빈 배열을 적지 않고 지운다. 그래서 읽을 때
//     없는 칸을 메워 준다. bout 이 없으면 묶음 밖(null)이 맞다.
function snapRead(me) {
    const s = me && me.eyeAlienSnap;
    if (!s || typeof s !== 'object') return null;
    if (s.date && s.date !== cycle22()) return null;        // 어제 것은 안 쓴다
    return {
        bout: s.bout || null,
        used: Number(s.used) || 0,
        last: Number(s.last) || 0,
        unlocked: Array.isArray(s.unlocked) ? s.unlocked.slice()
            : (s.unlocked && typeof s.unlocked === 'object'
                ? Object.keys(s.unlocked).map(function (k) { return s.unlocked[k]; }) : []),
        date: s.date || cycle22(),
        part: !!s.part
    };
}
function snapSave(me, s) {
    if (!me) return;
    me.eyeAlienSnap = s;
    try { if (typeof saveFields === 'function') saveFields({ eyeAlienSnap: 1 }); } catch (e) { }
}
function snapClear(me) {
    if (!me || !me.eyeAlienSnap) return;
    snapSave(me, null);
}

(function alien() {
    const iv = setInterval(function () {
        if (typeof playHighLow !== 'function') return;
        if (playHighLow._eye) { clearInterval(iv); return; }
        const _p = playHighLow;
        const wrapped = function () {
            const me = u_();
            if (!me || !wears(me)) return _p.apply(this, arguments);
            alienDay(me);

            // 「승부를 보기 전」은 판 하나가 아니라 묶음 하나 전이다.
            //   한 묶음은 세 판 중 두 판을 이겨야 끝난다. 판마다 다시 적으면
            //   마지막 한 판만 되돌아가고 앞의 두 판은 그대로 남는다.
            //   그래서 묶음이 새로 시작할 때(alienBout 가 비었을 때)만 적는다.
            //   묶음이 **정말로 시작됐을 때만** 갈아 끼운다. 쉬는 시간이라
            //   거절당한 호출에도 갈아 끼우면, 직전 묶음의 자리가 지워져
            //   되돌려도 아무것도 안 돌아간다.
            const freshBefore = !me.alienBout;
            const cand = freshBefore ? {
                bout: null,
                used: me.alienDailyUsed || 0,
                last: me.lastAlienPlayTime || 0,
                unlocked: (me.alienUnlockedItems || []).slice(),
                date: cycle22(),
                at: Date.now(),
                part: 0
            } : null;
            const beforeN = (me.alienUnlockedItems || []).length;

            const out = _p.apply(this, arguments);
            if (freshBefore && me.alienBout) snapSave(me, cand);

            try {
                const after = (me.alienUnlockedItems || []).length;
                if (after <= beforeN) return out;            // 입고가 없었다 — 아직 묶음 중

                // 한 묶음은 세 판 중 두 판을 이겨야 입고된다 (ALIEN_BOUT_WIN = 2).
                // 여기 닿았다는 것이 곧 「두 번 이겼다」는 뜻이다.
                me.eyeAlienWins = (me.eyeAlienWins || 0) + 1;
                const got = (me.alienUnlockedItems || []).slice(beforeN);
                try { if (typeof saveFields === 'function') saveFields({ eyeAlienWins: 1, eyeAlienDay: 1 }); } catch (e) { }

                // ★ 자리가 없으면 **여기서 되짚어 만든다.**
                //   묶음 도중에 눈을 찼거나, 자리를 적기 전에 쓰던 글이라
                //   없을 수 있다. 들어온 것을 알고 있으니 그만큼 덜어내면
                //   승부 이전과 같다. 다만 세 시간 시계는 돌릴 자리를 모르니
                //   그대로 둔다 (part = 1).
                if (!snapRead(me)) {
                    snapSave(me, {
                        bout: null,
                        used: Math.max(0, (me.alienDailyUsed || 0) - 1),
                        last: me.lastAlienPlayTime || 0,
                        unlocked: (me.alienUnlockedItems || []).slice(0, beforeN),
                        date: cycle22(),
                        at: Date.now(),
                        part: 1
                    });
                }

                if (window.eyeAlienLeft() <= 0) return out;
                setTimeout(function () { offer(got); }, 400);
            } catch (e) { console.warn('[눈] 우주 되돌리기 건너뜀:', e && e.message); }
            return out;
        };
        wrapped._eye = true;
        playHighLow = wrapped;
        clearInterval(iv);
        console.log('[눈] 우주 쇼핑몰 되돌리기 연결');
    }, 400);
})();

const BACK_ID = 'eye-alien-back';

function offer(got) {
    const me = u_();
    // ★ 하네스가 없는 칸을 지어 주므로 getElementById 로는 「이미 떴나」를
    //   못 가린다 (b330 page.html). querySelector 는 진짜 화면과 똑같다.
    if (document.querySelector('#' + BACK_ID)) return;
    const s = snapRead(me);
    if (!s) return;                     // 되돌릴 자리가 없으면 아예 묻지 않는다
    const host = document.getElementById('alien-items-container');
    if (!host || !host.parentNode) return;
    host.insertAdjacentHTML('beforebegin',
        '<div id="' + BACK_ID + '" style="margin:10px 0; padding:11px 12px; border-radius:6px;'
        + ' background:rgba(0,150,200,0.12); border:1px solid #2a7a9a;">'
        + '<div style="font-size:12px; color:#4fc3f7; font-weight:bold; margin-bottom:6px;">🔎 눈이 먼저 보았다</div>'
        + '<div style="font-size:11px; color:#cfe9f5; line-height:1.8;">'
        + got.map(function (n) { return '· ' + esc(n); }).join('<br>') + '</div>'
        + '<div style="font-size:10px; color:#8aa; margin:8px 0 9px 0;">'
        + '마음에 들지 않으면 승부 이전으로 되돌립니다. 남은 횟수 '
        + window.eyeAlienLeft() + '회'
        + (s.part ? '<br><span style="color:#d9b26a;">묶음 시작을 못 보았습니다 — 횟수는 돌려받지만'
                  + ' 세 시간 시계는 그대로입니다.</span>' : '')
        + '</div>'
        + '<button onclick="eyeRewind()" style="width:100%; padding:9px; font-size:11px; border-radius:5px;'
        + ' cursor:pointer; background:linear-gradient(145deg,#1f5f7a,#0d3448); border:1px solid #4fc3f7;'
        + ' color:#dff3ff; font-weight:bold;">되돌린다</button>'
        + '<button onclick="eyeKeep()" style="width:100%; margin-top:5px; padding:8px; font-size:11px;'
        + ' border-radius:5px; cursor:pointer; background:rgba(0,0,0,0.3); border:1px solid #333;'
        + ' color:#999;">그대로 둔다</button></div>');
}
window.eyeKeep = function () {
    const o = document.querySelector('#' + BACK_ID);
    if (o) o.remove();
    snapClear(u_());
};
window.eyeRewind = function () {
    const me = u_();
    const s = snapRead(me);
    // ★ 전에는 자리가 없으면 아무 말도 없이 창만 닫았다. 눌렀는데 아무
    //   일도 안 일어나는 것으로 보였다. 이제는 왜 안 되는지 말한다.
    if (!me) return;
    if (!s) {
        alert_('되돌릴 자리를 찾지 못했습니다.\n\n'
            + '승부 이전으로 되돌릴 수 있는 것은 이번 묶음까지입니다.');
        window.eyeKeep();
        return;
    }
    if (window.eyeAlienLeft() <= 0) { alert_('오늘 되돌릴 몫을 다 썼습니다.'); window.eyeKeep(); return; }

    me.alienBout = s.bout;
    me.alienDailyUsed = s.used;
    if (!s.part) me.lastAlienPlayTime = s.last;    // 되짚어 만든 자리는 시계를 안 돌린다
    me.alienUnlockedItems = s.unlocked;
    me.alienDate = s.date;
    me.eyeAlienBack = (me.eyeAlienBack || 0) + 1;
    me.eyeAlienWins = Math.max(0, (me.eyeAlienWins || 0) - 1);
    me.eyeAlienSnap = null;

    try {
        if (typeof saveFields === 'function') {
            saveFields({ alienBout: 1, alienDailyUsed: 1, lastAlienPlayTime: 1,
                         alienUnlockedItems: 1, alienDate: 1, eyeAlienBack: 1,
                         eyeAlienWins: 1, eyeAlienSnap: 1 });
        }
    } catch (e) { }
    log_(me, '[' + NAME + '] 우주 쇼핑몰 — 승부를 되돌렸습니다.');
    window.eyeKeep();

    // renderAlienShop 은 mobile-scroll.js 가 2.5초에 한 번으로 묶어 두었다.
    //   그냥 부르면 최대 2.5초 동안 옛 진열이 그대로 남는다. 그 사이에
    //   「없던 일이 되었습니다」가 떠서, 닫고 보면 그대로인 것처럼 보인다.
    //   그래서 이 한 번만 묶음을 건너뛴다.
    window.renderNow = 1;
    try {
        try { if (typeof renderAlienShop === 'function') renderAlienShop(); } catch (e) { }
        try { if (typeof renderAlienTimer === 'function') renderAlienTimer(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    } finally { window.renderNow = 0; }

    alert_('없던 일이 되었습니다.\n\n남은 되돌리기 ' + window.eyeAlienLeft() + '회');
};

// ==========================================
// 능력 5 — 갇힌 곳에서 바로 나온다 · 다음에 갇히면 세 배
// ==========================================
function inRoom(x) {
    return !!(x && x.quarantineUntil && Date.now() < x.quarantineUntil);
}
// 오늘 나온 횟수 — 자정이 지나면 다시 세 번
function outBox(me) {
    if (!me.eyeOutDay || typeof me.eyeOutDay !== 'object' || me.eyeOutDay.d !== today()) me.eyeOutDay = { d: today(), n: 0 };
    return me.eyeOutDay;
}
window.eyeOutLeft = function () {
    const me = u_();
    if (!me) return 0;
    return Math.max(0, EYE.OUT_DAY - (Number(outBox(me).n) || 0));
};

// 음식으로 오른 오염도로 갇혔나 (food-quar.js)
function foodQ(x) {
    try { return typeof window.quarFood === 'function' && !!window.quarFood(x); } catch (e) { return false; }
}
function won(n) { return (Number(n) || 0).toLocaleString() + ' P'; }

// 낼 값을 고르는 칸
const OUT_BOX = 'eye-out-pick';
function outShut() { const o = document.getElementById(OUT_BOX); if (o) o.remove(); }
window.eyeOut = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 을 차고 있어야 합니다.'); return; }
    if (!inRoom(me)) { alert_('갇혀 있지 않습니다.'); return; }
    if (window.eyeOutLeft() <= 0) {
        alert_('오늘은 더 나올 수 없습니다.\n\n값을 치르고 나오는 것은 하루 ' + EYE.OUT_DAY + '번까지입니다. 자정이 지나면 다시 됩니다.');
        return;
    }
    const food = foodQ(me);
    const have = Number(me.points) || 0;
    if (have < EYE.OUT_MIN) { alert_('포인트가 모자랍니다.\n\n' + won(EYE.OUT_MIN) + ' 가 필요합니다.'); return; }
    outShut();
    const steps = [];
    for (let v = EYE.OUT_MIN; v <= EYE.OUT_MAX; v += EYE.OUT_STEP) steps.push(v);
    if (steps[steps.length - 1] !== EYE.OUT_MAX) steps.push(EYE.OUT_MAX);
    const list = food ? [EYE.OUT_MIN] : steps;
    const btns = list.map(function (v) {
        const off = have < v;
        return '<button class="eye-out-v" data-v="' + v + '"' + (off ? ' disabled' : '')
            + ' style="padding:10px 6px; border-radius:6px; font-size:12px; font-weight:bold; cursor:' + (off ? 'default' : 'pointer') + ';'
            + ' background:' + (off ? '#1a1a1a' : 'linear-gradient(145deg,#1f5f7a,#0d3448)') + ';'
            + ' border:1px solid ' + (off ? '#333' : '#4fc3f7') + '; color:' + (off ? '#555' : '#dff3ff') + ';">'
            + won(v)
            + (food ? '' : '<div style="font-size:9px; font-weight:normal; color:' + (off ? '#444' : '#9fd8ef') + '; margin-top:3px;">다음에 +' + won(v * EYE.OUT_BACK) + '</div>')
            + '</button>';
    }).join('');
    const w = document.createElement('div');
    w.id = OUT_BOX;
    w.style.cssText = 'position:fixed; inset:0; z-index:100001; display:flex; align-items:center; justify-content:center;'
        + ' background:rgba(0,0,0,0.82); padding:16px; box-sizing:border-box;';
    w.innerHTML = '<div style="width:100%; max-width:380px; background:linear-gradient(160deg,#0f2530,#071219); border:1px solid #2a7a9a;'
        + ' border-radius:12px; padding:15px; box-shadow:0 8px 30px rgba(0,0,0,0.7);">'
        + '<div style="font-size:13px; color:#4fc3f7; font-weight:bold; margin-bottom:6px;">🔎 값을 치르고 나온다</div>'
        + '<div style="font-size:10.5px; color:#9ab; line-height:1.75; margin-bottom:11px;">'
        + (food
            ? '<span style="color:#ffb74d;">음식으로 오른 오염도로 갇혀 있습니다.</span><br>'
              + '나올 수는 있지만 오늘 횟수가 하나 줄고, 세 배로 돌려받을 몫은 생기지 않습니다.'
            : '낼 값을 고릅니다 (' + won(EYE.OUT_MIN) + ' ~ ' + won(EYE.OUT_MAX) + ').<br>'
              + '다음에 갇히면 낸 값의 세 배가 들어옵니다.')
        + '<br>가진 포인트 ' + won(have) + ' · 오늘 남은 횟수 ' + window.eyeOutLeft() + ' / ' + EYE.OUT_DAY + '</div>'
        + '<div style="display:grid; grid-template-columns:repeat(' + (food ? 1 : 3) + ',1fr); gap:6px; margin-bottom:9px;">' + btns + '</div>'
        + '<button id="eye-out-x" style="width:100%; padding:9px; border-radius:6px; font-size:11px; cursor:pointer;'
        + ' background:rgba(0,0,0,0.3); border:1px solid #333; color:#999;">그만둔다</button></div>';
    document.body.appendChild(w);
    w.querySelector('#eye-out-x').onclick = outShut;
    Array.prototype.forEach.call(w.querySelectorAll('.eye-out-v'), function (b) {
        if (b.disabled) return;
        b.onclick = function () { outShut(); window.eyeOutPay(Number(b.getAttribute('data-v'))); };
    });
};

window.eyeOutPay = function (amount) {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 을 차고 있어야 합니다.'); return; }
    if (!inRoom(me)) { alert_('갇혀 있지 않습니다.'); return; }
    if (window.eyeOutLeft() <= 0) {
        alert_('오늘은 더 나올 수 없습니다.\n\n값을 치르고 나오는 것은 하루 ' + EYE.OUT_DAY + '번까지입니다. 자정이 지나면 다시 됩니다.');
        return;
    }
    const food = foodQ(me);
    let cost = Math.round(Number(amount) || 0);
    if (food) cost = EYE.OUT_MIN;                       // 돌려받을 몫이 없으니 가장 낮은 값만
    if (!(cost >= EYE.OUT_MIN && cost <= EYE.OUT_MAX)) {
        alert_('낼 수 있는 값은 ' + won(EYE.OUT_MIN) + ' ~ ' + won(EYE.OUT_MAX) + ' 입니다.');
        return;
    }
    if ((Number(me.points) || 0) < cost) {
        alert_('포인트가 모자랍니다.\n\n' + won(cost) + ' 가 필요합니다.');
        return;
    }
    me.points -= cost;
    const back = food ? 0 : cost * EYE.OUT_BACK;
    if (back) me.eyeOwed = (Number(me.eyeOwed) || 0) + back;
    outBox(me).n = (Number(outBox(me).n) || 0) + 1;

    // 나올 때 값을 그대로 돌려주면 100 가까이라 나오자마자 다시 들어간다
    me.quarantineUntil = 0;
    me.quarantineDest = null;
    me.quarantineHospital = null;
    me.quarantineExitPollution = 0;
    me.pollution = 50;
    me.lastPollutionTime = Date.now();
    me.foxRoomAnswered = false;
    me.quarCause = null;
    me.quarFood = null;
    try { hasShownFoxAlert = false; } catch (e) { }

    log_(me, '[' + NAME + '] 값을 치르고 나왔습니다. (-' + won(cost) + ' · 오염도 50%'
        + (food ? ' · 음식으로 갇힘 — 돌려받을 몫 없음' : '') + ')');
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ quarCause: 1, quarFood: 1, eyeOutDay: 1, eyeOwed: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay',
     'quarantine-pick-overlay', 'fox-loading-overlay'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    try { document.body.style.overflow = ''; } catch (e) { }
    alert_('눈이 문을 봅니다.\n\n나왔습니다. (-' + won(cost) + ' · 오염도 50%)\n\n'
        + (food ? '음식으로 오른 오염도라 돌려받을 몫은 생기지 않았습니다.\n'
                : '다음에 갇힐 때 ' + won(Number(me.eyeOwed) || 0) + ' 가 들어옵니다.\n')
        + '오늘 남은 횟수 ' + window.eyeOutLeft() + ' / ' + EYE.OUT_DAY);
};

// 갇히는 순간 돌려준다 — 음식으로 갇힌 것이면 주지 않고 다음까지 남겨 둔다
let foodHeldTold = 0;
function owedPay() {
    const me = u_();
    if (!me) return;
    const owed = Number(me.eyeOwed) || 0;
    if (owed <= 0) return;
    if (!inRoom(me)) return;
    if (foodQ(me)) {
        const until = Number(me.quarantineUntil) || 0;
        if (foodHeldTold === until) return;
        foodHeldTold = until;
        log_(me, '[' + NAME + '] 음식으로 오른 오염도로 갇혔습니다 — 돌려받을 ' + won(owed) + ' 는 이번에 들어오지 않습니다.');
        try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
        setTimeout(function () {
            alert_('눈이 고개를 돌립니다.\n\n음식으로 오른 오염도로 갇혔습니다.\n'
                + '돌려받을 ' + won(owed) + ' 는 이번에 들어오지 않습니다.\n(다음에 갇힐 때까지 남아 있습니다)');
        }, 900);
        return;
    }
    me.eyeOwed = 0;
    me.points = (Number(me.points) || 0) + owed;
    log_(me, '[' + NAME + '] 다시 갇혔습니다. 치렀던 값이 세 배로 돌아옵니다. (+' + owed.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, eyeOwed: 1, history: 1 }); } catch (e) { }
    setTimeout(function () {
        alert_('눈이 먼저 알고 있었습니다.\n\n+' + owed.toLocaleString() + ' P');
    }, 900);
}

(function hookLockup() {
    const iv = setInterval(function () {
        if (typeof finishFoxRoomSequence !== 'function') return;
        if (finishFoxRoomSequence._eye) { clearInterval(iv); return; }
        const _f = finishFoxRoomSequence;
        // finally 로 둔다. 원래 함수가 화면을 그리다 넘어져도 돌려받는 것은
        // 돌려받아야 한다 — 갇힌 것은 이미 갇힌 것이다.
        const wrapped = function () {
            try { return _f.apply(this, arguments); }
            finally { try { owedPay(); } catch (e) { } }
        };
        wrapped._eye = true;
        finishFoxRoomSequence = wrapped;
        clearInterval(iv);
        console.log('[눈] 갇힘 되돌려받기 연결');
    }, 500);
})();

// ==========================================
// 능력 6 — 탐사 횟수를 다 쓰면 하루치 중 하나를 한 번 더
// ==========================================
function dayBox(me) {
    if (!me.eyeDay || me.eyeDay.d !== today()) me.eyeDay = { d: today(), got: [], again: 0 };
    if (!Array.isArray(me.eyeDay.got)) me.eyeDay.got = [];
    return me.eyeDay;
}
function rec(amount) {
    const me = u_();
    if (!me || !(amount > 0)) return;
    const b = dayBox(me);
    b.got.push(Math.round(amount));
    if (b.got.length > 20) b.got.shift();
    try { if (typeof saveFields === 'function') saveFields({ eyeDay: 1 }); } catch (e) { }
}
window.eyeAgainLeft = function () {
    const me = u_();
    if (!me || !wears(me)) return 0;
    const b = dayBox(me);
    if (!b.got.length) return 0;
    let left = 0;
    try { left = getDarkTriesLeft(); } catch (e) { left = 1; }
    if (left > 0) return 0;
    return Math.max(0, EYE.AGAIN_DAY - (b.again || 0));
};
window.eyeAgain = function () {
    const me = u_();
    if (!me) return;
    if (window.eyeAgainLeft() <= 0) { alert_('지금은 쓸 수 없습니다.'); return; }
    const b = dayBox(me);
    const amt = b.got[Math.floor(Math.random() * b.got.length)];
    b.again = (b.again || 0) + 1;
    me.points = (Number(me.points) || 0) + amt;
    log_(me, '[' + NAME + '] 오늘 번 것 하나를 한 번 더 받았습니다. (+' + amt.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, eyeDay: 1, history: 1 }); } catch (e) { }
    try { if (typeof showPointGainEffect === 'function') showPointGainEffect(amt); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('눈이 오늘을 다시 봅니다.\n\n+' + amt.toLocaleString() + ' P');
};

// ==========================================
// 떠 있는 단추 — 갇혔을 때 · 횟수를 다 썼을 때
// ==========================================
(function float_() {
    function btn(id, text, fn, color) {
        let b = document.getElementById(id);
        if (b) { b.textContent = text; return; }
        b = document.createElement('button');
        b.id = id;
        b.textContent = text;
        b.style.cssText = 'position:fixed; right:12px; z-index:100000; padding:10px 14px;'
            + ' border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;'
            + ' background:linear-gradient(145deg,#1f5f7a,#0d3448); border:1px solid ' + color + ';'
            + ' color:#dff3ff; box-shadow:0 3px 10px rgba(0,0,0,0.6);';
        b.style.bottom = (id === 'eye-out-btn') ? '150px' : '100px';
        b.onclick = fn;
        document.body.appendChild(b);
    }
    function drop(id) { const b = document.getElementById(id); if (b) b.remove(); }

    setInterval(function () {
        const me = u_();
        if (!me || !wears(me)) { drop('eye-out-btn'); drop('eye-again-btn'); return; }

        if (inRoom(me) && window.eyeOutLeft() > 0) btn('eye-out-btn', '🔎 값을 치르고 나온다 (' + (EYE.OUT_MIN / 10000) + '만~' + (EYE.OUT_MAX / 10000) + '만 P · 오늘 ' + window.eyeOutLeft() + '/' + EYE.OUT_DAY + ')',
            window.eyeOut, '#4fc3f7');
        else drop('eye-out-btn');

        if (!run() && window.eyeAgainLeft() > 0) {
            btn('eye-again-btn', '🔎 오늘을 다시 본다', window.eyeAgain, '#d4af37');
        } else drop('eye-again-btn');
    }, 2000);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
function find(who) {
    if (typeof db === 'undefined' || !db.users) return null;
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    return all.filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
window.eyeGive = function (who, n) {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, n || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '개 지급');
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.eyeState = function () {
    const me = u_();
    if (!me) { console.log('로그인 전입니다.'); return; }
    alienDay(me);
    const b = dayBox(me);
    console.log('%c===== ' + NAME + ' =====', 'color:#4fc3f7; font-size:13px');
    console.log('  차고 있나        :', wears(me) ? 'O' : '✗');
    console.log('  행운 · 회수품    : ×' + EYE.LUCK + ' · ×' + EYE.LOOT);
    SHOPS.forEach(function (sh) {
        const nm = (sh.key === 'alien') ? '우주 쇼핑몰' : '[???]      ';
        console.log('  싸게 보이는 품목 (' + nm + ') :',
            Object.keys(cheapSet(sh)).join(' · ') || '- (그 가게를 열어 두어야 보입니다)');
    });
    console.log('  우주 이긴 횟수   :', (me.eyeAlienWins || 0)
        + ' · 되돌리기 남음 ' + window.eyeAlienLeft() + '회');
    const sp = snapRead(me);
    console.log('  되돌릴 자리      :', sp
        ? ('있음 — 진열 ' + sp.unlocked.length + '종 · 쓴 횟수 ' + sp.used
           + (sp.part ? ' (되짚어 만든 자리 · 세 시간 시계는 그대로)' : '')) : '없음');
    console.log('  돌려받을 값      :', (Number(me.eyeOwed) || 0).toLocaleString() + ' P');
    console.log('  오늘 번 것       :', b.got.join(' · ') || '-',
        '· 한 번 더 ' + window.eyeAgainLeft() + '회');
};

window.eyeParty = function () {
    const s = eye();
    if (!s) { console.log('이번 탐사에는 눈이 열리지 않았습니다.'); return; }
    const d = s.dead || {};
    console.log('%c===== 눈 · ' + (s.byName || '') + ' =====', 'color:#4fc3f7; font-size:13px');
    console.table(Object.keys(s.picks || {}).map(function (c) {
        return { 사원: s.picks[c].name || nameOf(c), 버프: label(s.picks[c]), 생사: d[c] ? '쓰러짐' : '살아 있음' };
    }));
    console.log('  장착자:', d[s.by] ? '쓰러짐' : '살아 있음',
        '· 끌려간 사람:', s.doom ? nameOf(s.doom) : '-');
    console.log('  내 정산 배수:', settleMult());
};

console.log('[눈] eyeGive(사번) · eyeState() · eyeParty()');

})();
