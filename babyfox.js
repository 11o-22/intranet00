// ==========================================
// ★ 🐾 아기 여우 — 상담사 지급 전용
// bundles.json 마지막 묶음, foxtail.js · eye.js · klee.js 보다 뒤 · 맨 끝
// ==========================================
//
// ■ 무엇인가
//
//   장착품이다. 차고 있으면 아기 여우 여덟 마리를 다룬다. 한 마리씩
//   **장착자의 분신**으로 움직인다.
//
//       회피 · 감각 · 치유 · 은신 · 행운 · 파괴 · 연결 · 응시
//
//   은심장 · 호사수구 · K.LEE 와 같은 결이다. 상점·우주 쇼핑몰·장터
//   어디에도 안 깔리고 팔 수도 없다. 주는 법은 kitGive(사번) 과 당국
//   화면의 「물품 강제 꽂기」뿐이다.
//
// ■ 등급은 장착자를 따라간다
//
//   여덟 속성은 전용 장비(soulGear)의 여덟 속성과 같은 것이다
//   (dark.js GEAR_ATTRS). 그래서 등급을 따로 두지 않고 **장착자의 속성
//   등급을 그대로 쓴다.** 장착자가 지니고 있지 않은 속성은 D 로 굳는다.
//
//       gearHas(u, 'evade') 가 참이면  gearAttrGrade(getGear(u), 'evade')
//       아니면                          'D'
//
// ■ 여덟 마리가 하는 일
//
//   회피  어둠에서 죽음을 대신 받아 내고 그대로 소멸한다.
//   감각  살아나갈 선택지만 보이게 한다. 다이스를 망치면 사라진다.
//   치유  죽을 자리에서 한 번 살리고 소멸한다 —「치유의 기운이 깃듭니다.」
//   은신  끌려가거나 함정에 빠질 일을 세 번 막고 소멸한다.
//   행운  회수품 확률을 150~300% 올린다. 공용시설을 대신 돌릴 수도 있다
//         (장착자 한도에서 · 그때 행운이 등급만큼 더 붙는다).
//   파괴  어떤 기믹이든 파훼한다. 세 번 쓰면 소멸한다.
//         감각이 살아 있으면 감각이 먼저 길을 열어 더 크게 연다.
//   연결  떨어진 일행을 합류시키고(세 번), 죽을 일행을 확정으로 구한다(한 번).
//         둘 다 쓰면 소멸한다.
//   응시  모든 기믹의 눈을 속인다(굴림 보정). ??? 와 유쾌 판매소에 원하는
//         물품을 확정으로 띄운다. 확정 죽음(이해도 80 · 인간성 0 · 감염 60)
//         의 눈을 속여 그 수치를 절반으로 되돌리고 소멸한다.
//
//   소멸하면 그날은 다시 못 부른다. 자정이 지나면 여덟이 다시 살아난다.
//
// ■ 남에게 붙인다
//
//   장착칸의 [🐾 아기 여우] 를 누르면 사원 목록이 뜬다. 사원을 고르면
//   여덟 마리가 『대기중』 으로 늘어서고, 원하는 속성을 골라 붙인다.
//   붙일 때는 장착자가 지어 준 이름으로 간다.
//
//   붙은 사람 특이사항에
//
//       [🐾 회피 분신이 당신과 함께합니다.]
//
//   이 적힌다. 거둬 오거나 소멸하면 그 줄도 같이 걷힌다. 묵은 줄은
//   note-fix.js 가 kitNoteLive 로 가려 치운다.
//
// ■ 방
//
//   장착자는 **구역이 차 있어도** 방을 만들 수 있고, 모자란 최소 인원을
//   분신으로 채운다. 데려갈 분신은 방을 만들 때 고르고, 이미 만든 방에도
//   더 넣을 수 있다. **남에게 붙여 준 분신은 데려갈 수 없다** — 그쪽
//   사람 곁에 있기 때문이다.
//
// ■ 적히는 자리
//
//   u.kits   = { evade:{ gone, nick, to, toName, n }, … }   내 여덟 마리
//   u.kitOn  = { evade:{ by, byName, nick, grade }, … }     내게 붙은 분신
//   u.kitDay = 'YYYY-MM-DD'                                 자정 되살림 기준
//   u.kitRoom= { evade:1, … }                               방에 데려갈 분신
//   u.kitWish= { q:'<??? 물품>', r:'<유쾌 판매소 물품>' }    응시가 띄울 것
//   darkParties/<방>/kits = { evade:{ by, byName, nick }, … }
//
//   ★ 남의 글을 통째로 덮어쓰지 않는다. 분신 한 마리를 건드릴 때는
//     users/<사번>/kits/<속성> 처럼 **자식 길**로만 쓴다. 통째 쓰기는
//     그 사이 그쪽이 바꾼 것을 지운다 (이 저장소가 여러 번 겪은 함정이다).
//
// ■ 콘솔
//   kitGive(사번)     상담사가 하나 준다
//   kitState(사번)    여덟 마리가 어떤가
//   kitRevive(사번)   상담사 — 소멸한 것을 지금 되살린다
//   kitHelp()         분신마다 무엇을 하는지

const BFOX = {
    NAME:      '🐾 아기 여우',
    NICK_MAX:  8,
    LOOT_LO:   1.5,                                             // 회수품 150%
    LOOT_HI:   3.0,                                             // 회수품 300%
    SPIN:      { D:100, C:150, B:200, A:300, S:350, L:400 },    // 행운 — 대신 돌릴 때 얹는 행운(%)
    HIDE_MAX:  3,                                               // 은신 — 막아 주는 횟수
    BREAK_MAX: 3,                                               // 파괴 — 파훼 횟수
    BOND_SAVE: 1,                                               // 연결 — 확정 구출
    BOND_JOIN: 3,                                               // 연결 — 합류
    GAZE_ROLL: { D:1, C:1, B:2, A:2, S:3, L:4 },                // 응시 — 굴림 보정
    BREAK_ADD: 2,                                               // 파괴 — 성공 더하는 몫
    BREAK_SENSE: 3                                              // 감각이 길을 열었을 때
};

(function babyFox() {

const NAME = BFOX.NAME;
const ADMIN = 'kario0987';
const MOD = 'kit-modal';

// 여덟 — dark.js 의 GEAR_ATTRS 와 같은 여덟이다
const KINDS = [
    { k:'evade', n:'회피', icon:'✦', d:'죽음을 대신 받아 내고 소멸한다.' },
    { k:'sense', n:'감각', icon:'◈', d:'살아나갈 선택지만 보이게 한다. 다이스를 망치면 사라진다.' },
    { k:'heal',  n:'치유', icon:'❋', d:'한 번 살리고 소멸한다.' },
    { k:'hide',  n:'은신', icon:'◐', d:'끌려가거나 빠질 일을 세 번 막는다.' },
    { k:'luck',  n:'행운', icon:'✺', d:'회수품 150~300% · 공용시설을 대신 돌린다.' },
    { k:'break', n:'파괴', icon:'✧', d:'어떤 기믹이든 세 번 파훼한다.' },
    { k:'bond',  n:'연결', icon:'⊙', d:'합류 세 번 · 확정 구출 한 번.' },
    { k:'gaze',  n:'응시', icon:'❂', d:'기믹의 눈을 속인다 · 상점 확정 진열 · 확정 죽음 한 번.' }
];
const BY_K = {};
KINDS.forEach(function (x) { BY_K[x.k] = x; });
const KEYS = KINDS.map(function (x) { return x.k; });

// ==========================================
// 손에 잡히는 것들
// ==========================================
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
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
window.kitWears = wears;

// 속성 등급 — 장착자가 안 가진 속성은 D
function gradeOf(u, k) {
    try {
        if (typeof gearHas !== 'function' || !gearHas(u, k)) return 'D';
        return gearAttrGrade(getGear(u), k) || 'D';
    } catch (e) { return 'D'; }
}

// ==========================================
// 여덟 마리의 자리
// ==========================================
function kitsOf(u) {
    if (!u) return {};
    if (!u.kits || typeof u.kits !== 'object' || Array.isArray(u.kits)) u.kits = {};
    return u.kits;
}
function st(u, k) {
    const all = kitsOf(u);
    if (!all[k] || typeof all[k] !== 'object') all[k] = {};
    return all[k];
}
// 자정이 지나면 여덟이 다시 살아난다
function dayRoll(u) {
    if (!u || u.kitDay === today()) return false;
    u.kitDay = today();
    const all = kitsOf(u);
    KEYS.forEach(function (k) {
        const s = all[k] || (all[k] = {});
        s.gone = 0; s.n = 0; s.j = 0; s.r = 0;
    });
    try { if (typeof saveFields === 'function' && u === u_()) saveFields({ kits: 1, kitDay: 1 }); } catch (e) { }
    return true;
}
function alive(u, k) {
    if (!u) return false;
    dayRoll(u);
    return !st(u, k).gone;
}

// 자식 길로만 쓴다 — 남의 글을 통째로 덮지 않는다
function kitPatch(code, k, patch) {
    const u = userOf(code);
    if (u) {
        const s = st(u, k);
        Object.keys(patch).forEach(function (x) {
            if (patch[x] === null) delete s[x]; else s[x] = patch[x];
        });
    }
    const d = db_();
    if (!d || !code) return;
    try { d.ref('users/' + code + '/kits/' + k).update(patch).catch(function () { }); } catch (e) { }
}
function onPatch(code, k, val) {
    const u = userOf(code);
    if (u) {
        if (!u.kitOn || typeof u.kitOn !== 'object') u.kitOn = {};
        if (val === null) delete u.kitOn[k]; else u.kitOn[k] = val;
    }
    const d = db_();
    if (!d || !code) return;
    try {
        if (val === null) d.ref('users/' + code + '/kitOn/' + k).remove().catch(function () { });
        else d.ref('users/' + code + '/kitOn/' + k).set(val).catch(function () { });
    } catch (e) { }
}

// ==========================================
// 특이사항 — 붙은 사람 글에 한 줄
// ==========================================
//
//   appendBadgeNoteToUser 는 ' | ' 로 이어 붙인다 (index.html:5169).
//   newitems2.js 의 removeBadgeLine 은 <br> 과 개행만 끊으므로 그것으로는
//   안 지워진다. 그래서 ' | ' 까지 끊는 것을 따로 쓴다 (호사수구와 같은 사정).
function noteLine(k) {
    return '[🐾 ' + (BY_K[k] ? BY_K[k].n : k) + ' 분신이 당신과 함께합니다.]';
}
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
function addNote(u, k) {
    try {
        if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, noteLine(k));
    } catch (e) { }
}

// note-fix.js 가 묵은 줄을 가릴 때 쓴다 — 붙어 있지 않으면 걷는다
window.kitNoteLive = function (u, note) {
    try {
        const t = String(note || '');
        const hit = KINDS.filter(function (x) { return t.indexOf(noteLine(x.k)) >= 0; })[0];
        if (!hit) return true;                       // 우리 줄이 아니다 — 손대지 않는다
        return !!(u && u.kitOn && u.kitOn[hit.k]);
    } catch (e) { return true; }
};

// ==========================================
// 지금 이 화면에서 쓸 수 있는 분신
// ==========================================
//
//   내 것이면서 남에게 안 붙인 것, 또는 내게 붙어 있는 남의 것.
//   돌려주는 것 — { k, owner, ownerCode, grade, nick, mine }
function usable(k) {
    const me = u_();
    if (!me) return null;
    // 내게 붙어 있는 남의 분신
    const on = me.kitOn && me.kitOn[k];
    if (on && on.by) {
        const o = userOf(on.by);
        if (o && alive(o, k)) {
            return { k: k, owner: o, ownerCode: on.by, grade: on.grade || gradeOf(o, k),
                     nick: on.nick || '', mine: false };
        }
    }
    // 내 분신 (남에게 안 붙였을 때)
    if (wears(me) && alive(me, k) && !st(me, k).to) {
        return { k: k, owner: me, ownerCode: me.code, grade: gradeOf(me, k),
                 nick: st(me, k).nick || '', mine: true };
    }
    return null;
}
function nickOf(x) {
    if (!x) return '';
    return x.nick || (BY_K[x.k] ? BY_K[x.k].n + ' 분신' : '분신');
}

// 소멸 — 그날은 다시 못 부른다
function kill(k, why) {
    const x = usable(k);
    if (!x) return false;
    kitPatch(x.ownerCode, k, { gone: 1 });
    const s = st(x.owner, k);
    if (s.to) {
        const t = userOf(s.to);
        if (t) { cutNote(t, noteLine(k)); }
        onPatch(s.to, k, null);
        const d = db_();
        if (d && t) { try { d.ref('users/' + s.to + '/badge').set(t.badge).catch(function () { }); } catch (e) { } }
        kitPatch(x.ownerCode, k, { to: null, toName: null });
    }
    const me = u_();
    if (me && me.kitOn && me.kitOn[k]) { delete me.kitOn[k]; }
    log_(x.owner, '[' + NAME + '] ' + nickOf(x) + ' — ' + (why || '소멸했습니다.'));
    toast('🐾 ' + nickOf(x) + (why ? ' — ' + why : ' 소멸'));
    return true;
}
window.kitKill = kill;

// 몇 번 썼나 — 쌓아 두고, 다 차면 소멸한다
function bump(k, field, max, why) {
    const x = usable(k);
    if (!x) return 0;
    const s = st(x.owner, k);
    const n = (Number(s[field]) || 0) + 1;
    const p = {}; p[field] = n;
    kitPatch(x.ownerCode, k, p);
    if (n >= max) kill(k, why);
    return n;
}

// ==========================================
// 물품 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (ITEM_CATALOG[NAME]) { clearInterval(iv); return; }
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false,
            effect: 'equip_babyfox', noSell: true,
            desc: '[장착] 아기 여우 여덟 마리를 분신으로 다룬다. 속성과 등급은 장착자를 따른다. '
                + '남에게 붙여 줄 수 있고, 소멸하면 자정까지 다시 못 부른다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) {
            NO_SELL_ITEMS.push(NAME);
        }
        clearInterval(iv);
        console.log('[아기 여우] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 장터 팝니다·구합니다에서 지운다 (은심장·호사수구와 같은 길)
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._kit) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () {
            const pool = _m.apply(this, arguments);
            if (!Array.isArray(pool)) return pool;
            return pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; });
        };
        w._kit = true;
        marketSellable = w;
        window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 차고 벗기 — 고유 아이템과 같은 길
(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._kit) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) {
                alert_('격리 중에는 장착할 수 없습니다.'); return;
            }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
            if (me.equippedWeapons.length >= 12) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
            dayRoll(me);
            try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(me, '[장착됨] ' + NAME); } catch (e) { }
            log_(me, '[' + NAME + '] 장착했습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(NAME + '\n\n여덟 마리가 깨어났습니다.\n장착칸의 [🐾 아기 여우] 로 부릅니다.');
        };
        useInventoryItem._kit = true;
        clearInterval(iv);
        console.log('[아기 여우] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:52dvh; margin-bottom:9px;';

function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); });
}
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999993; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:16px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#1a1410,#0b0908);'
        + ' border:1px solid #c08a3e; border-radius:12px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; display:flex; flex-direction:column;'
        + ' box-shadow:0 8px 30px rgba(0,0,0,0.7);">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#7d7468; margin:4px 0 11px 0; line-height:1.7;">'
            + sub + '</div>' : '<div style="height:9px;"></div>');
}
function face(k, g) {
    const x = BY_K[k];
    return '<span style="color:#ffcf8f;">' + x.icon + '</span> ' + esc(x.n)
        + ' <span style="font-size:9px; color:#6fa8cf;">' + esc(g) + '</span>';
}

// 상태 한 줄
function lineOf(me, k) {
    const s = st(me, k);
    if (s.gone) return { t: '소멸 — 자정에 돌아온다', c: '#8a6a6a', off: 1 };
    if (s.to) return { t: nameOf(s.to) + ' 사원과 함께', c: '#8fd18f', off: 0 };
    return { t: '『 대기중 』', c: '#9fb8c8', off: 0 };
}

window.kitMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    dayRoll(me);
    const rows = KINDS.map(function (x) {
        const s = st(me, x.k), L = lineOf(me, x.k);
        const nick = s.nick ? esc(s.nick) : '<span style="color:#6b6257;">이름 없음</span>';
        return '<button class="game-btn kit-one" data-k="' + x.k + '" style="' + BTN
            + (L.off ? GREY : '') + '">'
            + '<div style="font-size:12px;">' + face(x.k, gradeOf(me, x.k)) + ' · ' + nick + '</div>'
            + '<div style="font-size:9.5px; color:' + L.c + '; margin-top:3px;">' + esc(L.t) + '</div>'
            + '<div style="font-size:9px; color:#6b6257; margin-top:2px; white-space:normal;">'
            + esc(x.d) + '</div></button>';
    }).join('');

    const w = box(head('🐾 아기 여우',
        '여덟 마리가 당신의 분신으로 움직입니다. 속성과 등급은 당신을 따릅니다.<br>'
        + '한 마리를 눌러 이름을 짓거나 사원에게 붙입니다.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="kit-room" class="game-btn" style="' + BTN + ' text-align:center;">방에 데려갈 분신</button>'
        + '<button id="kit-wish" class="game-btn" style="' + BTN + ' text-align:center;">응시 — 띄울 물품 정하기</button>'
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#kit-x').onclick = shut;
    w.querySelector('#kit-room').onclick = window.kitRoomPick;
    w.querySelector('#kit-wish').onclick = window.kitWishPick;
    Array.prototype.forEach.call(w.querySelectorAll('.kit-one'), function (b) {
        b.onclick = function () { one(b.dataset.k); };
    });
};

// 한 마리 — 이름 · 붙이기 · 거둬 오기
function one(k) {
    const me = u_();
    if (!me) return;
    const s = st(me, k), x = BY_K[k];
    if (s.gone) { alert_(x.n + ' 분신은 소멸했습니다.\n\n자정이 지나면 다시 깨어납니다.'); return; }

    const w = box(head(x.icon + ' ' + x.n + ' 분신',
        esc(x.d) + '<br>등급 <b style="color:#6fa8cf;">' + gradeOf(me, k) + '</b>'
        + (s.to ? ' · 지금 ' + esc(nameOf(s.to)) + ' 사원과 함께 있습니다.' : ''))
        + '<button id="kit-nick" class="game-btn" style="' + BTN + ' text-align:center;">이름을 짓는다</button>'
        + (s.to
            ? '<button id="kit-back" class="game-btn" style="' + BTN + ' text-align:center;">거둬 온다</button>'
            : '<button id="kit-send" class="game-btn" style="' + BTN + ' text-align:center;">사원에게 붙인다</button>')
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#kit-x').onclick = window.kitMenu;
    w.querySelector('#kit-nick').onclick = function () { nickAsk(k); };
    const sendB = w.querySelector('#kit-send');
    if (sendB) sendB.onclick = function () { pickWho(k); };
    const backB = w.querySelector('#kit-back');
    if (backB) backB.onclick = function () { takeBack(k); };
}

function nickAsk(k) {
    const me = u_();
    const s = st(me, k), x = BY_K[k];
    const w = box(head(x.n + ' 분신의 이름', BFOX.NICK_MAX + '자까지. 비우면 이름을 지웁니다.')
        + '<input id="kit-in" type="text" maxlength="' + BFOX.NICK_MAX + '"'
        + ' value="' + esc(s.nick || '') + '" placeholder="' + esc(x.n) + '"'
        + ' style="width:100%; padding:10px; font-size:13px; margin-bottom:9px; box-sizing:border-box;">'
        + '<button id="kit-ok" class="game-btn" style="' + BTN + ' text-align:center;">짓는다</button>'
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    const f = w.querySelector('#kit-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 80);
    const go = function () {
        const v = String(f.value || '').trim().slice(0, BFOX.NICK_MAX);
        kitPatch(me.code, k, { nick: v || null });
        if (s.to) onPatch(s.to, k, { by: me.code, byName: me.name, nick: v || '', grade: gradeOf(me, k) });
        try { if (typeof saveFields === 'function') saveFields({ kits: 1 }); } catch (e) { }
        one(k);
    };
    w.querySelector('#kit-ok').onclick = go;
    w.querySelector('#kit-x').onclick = function () { one(k); };
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}

// 사원 고르기 → 붙인다
function pickWho(k) {
    const me = u_();
    const list = users().filter(function (x) { return x.code !== me.code; });
    if (!list.length) { alert_('붙일 사원이 없습니다.'); return; }
    const rows = list.map(function (t) {
        const on = t.kitOn && t.kitOn[k];
        return '<button class="game-btn kit-who" data-c="' + esc(t.code) + '"' + (on ? ' disabled' : '')
            + ' style="' + BTN + (on ? GREY : '') + '">'
            + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (on ? '<div style="font-size:9px; color:#a07070; margin-top:2px;">이미 같은 분신이 함께 있습니다</div>' : '')
            + '</button>';
    }).join('');
    const w = box(head(BY_K[k].n + ' 분신을 붙입니다', '함께 다닐 사원을 고르십시오.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#kit-x').onclick = function () { one(k); };
    Array.prototype.forEach.call(w.querySelectorAll('.kit-who'), function (b) {
        b.onclick = function () { sendTo(k, b.dataset.c); };
    });
}

function sendTo(k, code) {
    const me = u_();
    const t = userOf(code);
    if (!me || !t) return;
    const s = st(me, k);
    if (s.gone) { alert_('소멸한 분신은 붙일 수 없습니다.'); return; }
    const nick = s.nick || BY_K[k].n;

    kitPatch(me.code, k, { to: code, toName: t.name });
    // 방에 데려가기로 해 두었다면 뺀다 — 남에게 간 분신은 데려갈 수 없다
    if (me.kitRoom && me.kitRoom[k]) { delete me.kitRoom[k]; roomSave(me); }
    onPatch(code, k, { by: me.code, byName: me.name, nick: nick, grade: gradeOf(me, k) });
    addNote(t, k);
    log_(t, '[' + NAME + '] ' + me.name + ' 사원의 ' + nick + '이(가) 함께합니다.');
    log_(me, '[' + NAME + '] ' + nick + ' → ' + t.name + ' 사원');
    t.hasItemUsedOnMe = true;
    try {
        if (typeof updateUserFields === 'function') {
            updateUserFields(code, { badge: t.badge, history: t.history, hasItemUsedOnMe: true });
        }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ kits: 1, kitRoom: 1 }); } catch (e) { }
    shut();
    alert_(nick + '이(가) ' + t.name + ' 사원에게 갔습니다.\n\n'
        + '거둬 오기 전에는 방에 데려갈 수 없습니다.');
}

function takeBack(k) {
    const me = u_();
    const s = st(me, k);
    if (!s.to) return;
    const t = userOf(s.to);
    if (t) {
        cutNote(t, noteLine(k));
        log_(t, '[' + NAME + '] ' + (s.nick || BY_K[k].n) + '이(가) 돌아갔습니다.');
        try {
            if (typeof updateUserFields === 'function') {
                updateUserFields(s.to, { badge: t.badge, history: t.history });
            }
        } catch (e) { }
    }
    onPatch(s.to, k, null);
    kitPatch(me.code, k, { to: null, toName: null });
    try { if (typeof saveFields === 'function') saveFields({ kits: 1 }); } catch (e) { }
    one(k);
}

// ==========================================
// 방에 데려갈 분신
// ==========================================
function roomSave(u) {
    try { if (typeof saveFields === 'function') saveFields({ kitRoom: 1 }); } catch (e) { }
}
function roomPicked(u) {
    const r = (u && u.kitRoom) || {};
    return KEYS.filter(function (k) {
        return r[k] && alive(u, k) && !st(u, k).to;
    });
}
window.kitRoomKeys = roomPicked;

window.kitRoomPick = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    dayRoll(me);
    if (!me.kitRoom || typeof me.kitRoom !== 'object') me.kitRoom = {};
    const rows = KINDS.map(function (x) {
        const s = st(me, x.k);
        const off = !!(s.gone || s.to);
        const why = s.gone ? '소멸' : (s.to ? nameOf(s.to) + ' 사원과 함께 — 데려갈 수 없습니다' : '');
        return '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px;'
            + ' border:1px solid #3a3027; border-radius:7px; margin-bottom:6px;'
            + ' background:rgba(40,32,24,0.5);' + (off ? ' opacity:0.45;' : '') + '">'
            + '<input type="checkbox" class="kit-rm" value="' + x.k + '"' + (off ? ' disabled' : '')
            + (me.kitRoom[x.k] && !off ? ' checked' : '')
            + ' style="width:17px; height:17px; flex-shrink:0;">'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#e6ddd0;">'
            + face(x.k, gradeOf(me, x.k)) + ' · ' + esc(s.nick || x.n)
            + (why ? '<div style="font-size:9px; color:#a07070; margin-top:2px;">' + esc(why) + '</div>' : '')
            + '</div></label>';
    }).join('');
    const w = box(head('방에 데려갈 분신',
        '방을 만들 때 최소 인원을 이 분신들로 채웁니다.<br>'
        + '남에게 붙여 준 분신은 데려갈 수 없습니다.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="kit-ok" class="game-btn" style="' + BTN + ' text-align:center;">정한다</button>'
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#kit-x').onclick = window.kitMenu;
    w.querySelector('#kit-ok').onclick = function () {
        const picked = {};
        Array.prototype.forEach.call(w.querySelectorAll('.kit-rm:checked'), function (c) {
            picked[c.value] = 1;
        });
        me.kitRoom = picked;
        roomSave(me);
        pushRoomKits();
        shut();
        alert_('데려갈 분신 ' + Object.keys(picked).length + '마리를 정했습니다.');
    };
};

// 들어가 있는 방에도 적어 둔다 (다른 방에 있을 때도 더할 수 있다)
function myParty() {
    try {
        if (typeof getMyParty === 'function') return getMyParty();
    } catch (e) { }
    return null;
}
function pushRoomKits() {
    const me = u_();
    const p = myParty();
    if (!me || !p || !p.id) return 0;
    if (p.leader !== me.code) return 0;      // 방을 만든 사람만 분신을 데려간다
    const d = db_();
    const out = {};
    // ★ 차고 있어야 센다. 벗으면 데려갈 수 없는데 방에는 적힌 채로 남아
    //   남의 화면에만 분신이 보이던 것을 여기서 막는다.
    if (wears(me)) {
        roomPicked(me).forEach(function (k) {
            out[k] = { by: me.code, byName: me.name, nick: st(me, k).nick || BY_K[k].n };
        });
    }
    const n = Object.keys(out).length;
    try {
        if (d) d.ref('darkParties/' + p.id + '/kits').set(n ? out : null);
    } catch (e) { }
    p.kits = out;
    return n;
}
window.kitPushRoom = pushRoomKits;

// ==========================================
// 방에 들어간 분신 — 방 안의 **모두**가 같은 것을 본다
// ==========================================
//
//   방장은 제 기록(kitRoom)이 바로 반영되고, 나머지 사원은 방에 적힌
//   것(p.kits)을 본다. 방장이 벗거나 분신이 소멸하면 어긋나므로,
//   방장 화면이 그릴 때마다 어긋난 것을 다시 적는다.
function roomKitList(p, me) {
    if (!p) return [];
    if (me && p.leader === me.code) {
        if (!wears(me)) return [];
        return roomPicked(me).map(function (k) {
            return { k: k, nick: st(me, k).nick || BY_K[k].n, g: gradeOf(me, k) };
        });
    }
    const kits = (p.kits && typeof p.kits === 'object' && !Array.isArray(p.kits)) ? p.kits : {};
    return Object.keys(kits).filter(function (k) { return BY_K[k]; }).map(function (k) {
        return { k: k, nick: (kits[k] && kits[k].nick) || BY_K[k].n, g: '' };
    });
}

// ==========================================
// 응시 — 띄울 물품 정하기
// ==========================================
function qPool() {
    try {
        if (typeof qshopItems === 'function') {
            const raw = (qshopItems._kitRaw || qshopItems)();
            if (Array.isArray(raw) && raw.length) return raw;
        }
    } catch (e) { }
    try {
        if (typeof ITEM_CATALOG !== 'undefined') {
            return Object.keys(ITEM_CATALOG).filter(function (k) { return ITEM_CATALOG[k].qShop; });
        }
    } catch (e) { }
    return [];
}
function rPool() {
    try {
        if (typeof ALL_10_ITEMS !== 'undefined' && Array.isArray(ALL_10_ITEMS)) {
            return ALL_10_ITEMS.map(function (x) { return (x && x.name) ? x.name : x; });
        }
    } catch (e) { }
    return [];
}

window.kitWishPick = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    if (!me.kitWish || typeof me.kitWish !== 'object') me.kitWish = {};
    const q = qPool(), r = rPool();
    const sel = function (id, pool, now) {
        return '<select id="' + id + '" style="width:100%; padding:9px; font-size:12px;'
            + ' margin-bottom:9px; box-sizing:border-box;">'
            + '<option value="">— 정하지 않음 —</option>'
            + pool.map(function (n) {
                return '<option value="' + esc(n) + '"' + (now === n ? ' selected' : '') + '>'
                    + esc(n) + '</option>';
            }).join('') + '</select>';
    };
    const w = box(head('❂ 응시 — 띄울 물품',
        '리셋 전에 정해 두면 응시 분신이 그 물품을 확정으로 띄웁니다.<br>'
        + '응시가 소멸하면 정해 둔 것도 소용이 없습니다.')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:4px;">[???]</div>'
        + sel('kit-wq', q, me.kitWish.q || '')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:4px;">유쾌 판매소</div>'
        + sel('kit-wr', r, me.kitWish.r || '')
        + '<button id="kit-ok" class="game-btn" style="' + BTN + ' text-align:center;">정한다</button>'
        + '<button id="kit-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#kit-x').onclick = window.kitMenu;
    w.querySelector('#kit-ok').onclick = function () {
        const a = w.querySelector('#kit-wq').value || '';
        const b = w.querySelector('#kit-wr').value || '';
        me.kitWish = {};
        if (a) me.kitWish.q = a;
        if (b) me.kitWish.r = b;
        try { if (typeof saveFields === 'function') saveFields({ kitWish: 1 }); } catch (e) { }
        shut();
        alert_('정했습니다.\n\n[???] ' + (a || '-') + '\n유쾌 판매소 ' + (b || '-'));
    };
};

// ==========================================
// 장착칸의 [🐾 아기 여우] 단추
// ==========================================
(function badgeBtn() {
    const ID = 'kit-list-btn';
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
            + ' background:linear-gradient(145deg,#8a5a2a,#3d2714) !important;'
            + ' border-color:#d9a05a !important;';
        b.textContent = '🐾 아기 여우';
        b.onclick = window.kitMenu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._kitBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._kitBtn = true;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// ① 회피 · ③ 치유 — 죽음을 받아 낸다
// ==========================================
//
//   darkDeath 를 감싼다. 살렸으면 darkRun._dead 를 되돌리고 원본을 부르지
//   않는다 (irregular.js 의 saved() 와 같은 꼴).
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._kit) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            try {
                const r = run();
                const box2 = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                const draw = function (title, body) {
                    if (r) r._dead = false;
                    if (box2 && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                        box2.innerHTML = darkBox(title, body, darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                        try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                    }
                    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                };

                const ev = usable('evade');
                if (ev) {
                    const nm = nickOf(ev);
                    kill('evade', '죽음을 대신 받았습니다.');
                    draw('—', String(reasonText || '') + '<br><br>'
                        + '<span style="color:#ffd9a0;">— 작은 것이 앞으로 나섰다.<br>'
                        + esc(nm) + '이(가) 당신 대신 그것을 받았다.<br>'
                        + '털 한 줌이 남고, 그마저 곧 보이지 않는다.</span>');
                    return;
                }
                const he = usable('heal');
                if (he) {
                    const nm2 = nickOf(he);
                    kill('heal', '한 번 살리고 소멸했습니다.');
                    draw('—', String(reasonText || '') + '<br><br>'
                        + '<span style="color:#9fe6b0;">[ 치유의 기운이 깃듭니다. ]<br>'
                        + esc(nm2) + '이(가) 당신에게 이마를 대었다.<br>'
                        + '숨이 돌아온다. 그 자리에 아무것도 남지 않았다.</span>');
                    return;
                }
            } catch (e) { console.warn('[아기 여우] 죽음 건너뜀:', e && e.message); }
            return _d.apply(this, arguments);
        };
        w._kit = true;
        darkDeath = w;
        window.darkDeath = w;
        clearInterval(iv);
        console.log('[아기 여우] 회피·치유 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ② 감각 — 살아나갈 선택지만 보인다
// ==========================================
//
//   선택지 자료에는 「죽는 쪽」 표시가 없다. 다만 이 게임에는 관례가 하나
//   있다 — safe_hint 가 options[0] 에 ◈ 를 붙인다 (index.html:2748).
//   글쓴이 약속으로 **0번이 가장 안전한 쪽**이다. 감각 분신은 그 약속을
//   그대로 따라, 안전한 쪽 하나만 남기고 나머지를 가린다.
(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._kit) { clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            try {
                const se = usable('sense');
                if (se && Array.isArray(options) && options.length > 1) {
                    const safe = Object.assign({}, options[0]);
                    safe.label = '◈ ' + safe.label;
                    options = [safe];
                    text = String(text || '')
                        + '<br><br><span style="color:#9fd8ef;">— ' + esc(nickOf(se))
                        + '이(가) 한쪽을 보고 있다. 다른 길은 보이지 않는다.</span>';
                }
            } catch (e) { }
            return _c.call(this, title, text, options, imgKey);
        };
        w._kit = true;
        renderChoiceStep = w;
        window.renderChoiceStep = w;
        clearInterval(iv);
        console.log('[아기 여우] 감각 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 다이스를 망치면 감각이 사라진다 · 응시는 눈을 속여 굴림을 올린다
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._kit) { clearInterval(iv); return; }
        const _l = luckReroll;
        const w = function (roll) {
            let out = _l.apply(this, arguments);
            try {
                const gz = usable('gaze');
                if (gz) out = Math.min(20, out + (BFOX.GAZE_ROLL[gz.grade] || 1));
                if (out <= 1 && usable('sense')) kill('sense', '다이스를 망쳐 사라졌습니다.');
            } catch (e) { }
            return out;
        };
        w._kit = true;
        luckReroll = w;
        window.luckReroll = w;
        clearInterval(iv);
        console.log('[아기 여우] 감각·응시 굴림 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ④ 은신 — 끌려가거나 빠지는 것을 막는다
// ==========================================
//
//   끌려감은 구역마다 따로 적힌다. 하나로 모인 자리는 darkRun.taken 뿐이다
//   (dark.js:4406). 그래서 그것이 서면 되돌린다. 격리 이송은 그와 별개로
//   quarantineUntil 이 서는 것을 보고 막는다.
let hideWatch = 0;
setInterval(function () {
    try {
        const me = u_();
        const r = run();
        if (!me || !r) { hideWatch = 0; return; }
        if (!r.taken) { hideWatch = 0; return; }
        if (hideWatch === r.step) return;                // 같은 걸음에서 두 번 세지 않는다
        const hd = usable('hide');
        if (!hd) return;
        hideWatch = r.step || 1;
        r.taken = false;
        const n = bump('hide', 'n', BFOX.HIDE_MAX, '세 번을 다 막고 소멸했습니다.');
        toast('🐾 ' + nickOf(hd) + '이(가) 끌려가는 것을 막았다 (' + n + '/' + BFOX.HIDE_MAX + ')');
        if (r.log) r.log.push('[🐾 은신] ' + nickOf(hd) + '이(가) 끌려가는 것을 막았습니다.');
    } catch (e) { }
}, 1200);

(function hookQuarantine() {
    ['pickQuarantine', 'startFoxRoomSequence'].forEach(function (fn) {
        const iv = setInterval(function () {
            if (typeof window[fn] !== 'function') return;
            if (window[fn]._kit) { clearInterval(iv); return; }
            const _o = window[fn];
            const w = function () {
                try {
                    const hd = usable('hide');
                    if (hd) {
                        const n = bump('hide', 'n', BFOX.HIDE_MAX, '세 번을 다 막고 소멸했습니다.');
                        const me = u_();
                        if (me) { me.quarantineUntil = 0; me.quarantineHospital = false; }
                        try { if (typeof saveFields === 'function') saveFields({ quarantineUntil: 1 }); } catch (e) { }
                        alert_('🐾 ' + nickOf(hd) + '이(가) 당신을 숨겼습니다.\n\n'
                            + '끌려가지 않았습니다. (' + n + ' / ' + BFOX.HIDE_MAX + ')');
                        return false;
                    }
                } catch (e) { }
                return _o.apply(this, arguments);
            };
            w._kit = true;
            window[fn] = w;
            clearInterval(iv);
        }, 500);
        setTimeout(function () { clearInterval(iv); }, 60000);
    });
})();

// ==========================================
// ⑤ 행운 — 회수품 · 공용시설 대신 돌리기
// ==========================================
function lootRoll() {
    const r = run();
    if (r && r._kitLoot) return r._kitLoot;
    const v = BFOX.LOOT_LO + Math.random() * (BFOX.LOOT_HI - BFOX.LOOT_LO);
    if (r) r._kitLoot = v;
    return v;
}
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function') return;
        if (emLootMult._kit) { clearInterval(iv); return; }
        const _e = emLootMult;
        const w = function (user) {
            let m = _e.apply(this, arguments);
            try { if (usable('luck')) m *= lootRoll(); } catch (e) { }
            return m;
        };
        w._kit = true;
        emLootMult = w;
        window.emLootMult = w;
        clearInterval(iv);
        console.log('[아기 여우] 행운 — 회수품 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 대신 돌리기 — 켜 두면 다음 한 판에 등급만큼 행운이 더 붙는다
// ==========================================
//
// ■ 안 붙던 까닭
//
//   공용시설은 **판돈을 먼저 걷고 뒤에 행운을 읽는다.**
//
//       slot-curve.js:229   if (!useFacility(bet)) return;
//       slot-curve.js:260   const B = bands(facilityLuckMult(currentUser), …)
//
//   그런데 예전에는 useFacility 안에서 spinOn 을 껐다. 그래서 바로 뒤에
//   읽는 facilityLuckMult 는 **이미 꺼진 것**을 보았다. 켜 두고 콘솔에서
//   배수만 읽어 보면 2배가 나오는데, 실제로 한 판 돌리면 1배였다.
//   횟수와 판돈은 나가고 분신 몫만 사라졌다.
//
//   슬롯만이 아니다. 룰렛(index.html:8020)·섯다(8189)·블랙잭(8341)·
//   하이로우(9303) 는 행운을 **한 박자 뒤에** 읽으므로 더 확실히 놓쳤다.
//
// ■ 어떻게 고치나
//
//   끄는 자리를 「판돈을 걷을 때」에서 「행운을 읽을 때」로 옮긴다.
//
//     useFacility        켜져 있으면 spinArm 을 세운다 (spinOn 은 그대로)
//     facilityLuckMult   spinOn 이나 spinArm 이면 몫을 얹는다.
//                        spinArm 이었으면 그때 끈다 — 한 판에 한 번.
//
//   이러면 바로 읽든(슬롯) 한 박자 뒤에 읽든(룰렛·섯다·블랙잭·하이로우)
//   똑같이 붙는다. 판을 안 벌이고 배수만 들여다보는 것으로는 안 닳는다.
let spinOn = false;        // 켜 두었다
let spinArm = false;       // 켜 둔 채로 한 판이 시작됐다 — 행운을 읽을 때 쓴다

window.kitSpin = function (on) {
    const x = usable('luck');
    if (!x) { alert_('행운 분신이 없습니다.'); return false; }
    spinOn = (on === undefined) ? !spinOn : !!on;
    if (!spinOn) spinArm = false;
    const pct = BFOX.SPIN[x.grade] || 100;
    alert_(spinOn
        ? ('🐾 ' + nickOf(x) + '이(가) 대신 돌립니다.\n\n다음 공용시설 한 판에 행운 +' + pct + '%\n'
           + '(횟수는 당신 몫에서 나갑니다)')
        : '대신 돌리기를 껐습니다.');
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    return spinOn;
};
window.kitSpinOn = function () { return spinOn || spinArm; };

(function hookFacLuck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._kit) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        const w = function (user) {
            let m = _f.apply(this, arguments);
            try {
                if (!spinOn && !spinArm) return m;
                const x = usable('luck');
                if (!x) return m;
                m *= (1 + (BFOX.SPIN[x.grade] || 100) / 100);
                // ★ 한 판이 시작된 뒤에 읽은 것이면 여기서 끈다.
                //   판 없이 배수만 들여다본 것은 안 닳는다.
                if (spinArm) {
                    spinOn = false;
                    spinArm = false;
                    toast('🐾 ' + nickOf(x) + '이(가) 대신 돌렸다 (행운 +'
                        + (BFOX.SPIN[x.grade] || 100) + '%)');
                }
            } catch (e) { }
            return m;
        };
        w._kit = true;
        facilityLuckMult = w;
        window.facilityLuckMult = w;
        clearInterval(iv);
        console.log('[아기 여우] 행운 — 공용시설 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 판돈이 걷히면 「한 판이 시작됐다」고 세워 둔다 (끄지는 않는다)
(function hookFacUse() {
    const iv = setInterval(function () {
        if (typeof useFacility !== 'function') return;
        if (useFacility._kit) { clearInterval(iv); return; }
        const _u = useFacility;
        const w = function () {
            const was = spinOn;
            const r = _u.apply(this, arguments);
            try { if (was && r !== false) spinArm = true; } catch (e) { }
            return r;
        };
        w._kit = true;
        useFacility = w;
        window.useFacility = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ⑥ 파괴 — 어떤 기믹이든 연다
// ==========================================
window.kitBreak = function () {
    const x = usable('break');
    if (!x) { alert_('파괴 분신이 없습니다.'); return; }
    const r = run();
    if (!r) { alert_('탐사 중에만 쓸 수 있습니다.'); return; }
    const se = usable('sense');
    const add = se ? BFOX.BREAK_SENSE : BFOX.BREAK_ADD;
    r.success = (r.success || 0) + add;
    r.modifier = (r.modifier || 0) + 1;
    if (r.log) r.log.push('[🐾 파괴] ' + nickOf(x) + '이(가) 길을 열었습니다 (+' + add + ')');
    const n = bump('break', 'n', BFOX.BREAK_MAX, '세 번을 다 파훼하고 소멸했습니다.');
    try {
        if (r.isParty && typeof sendPartyChat === 'function') {
            sendPartyChat(nickOf(x) + '이(가) 앞을 열었습니다.', true);
        }
    } catch (e) { }
    const body = se
        ? (esc(nickOf(se)) + '이(가) 먼저 코를 들었다. 한쪽으로 길이 열린다.<br><br>'
           + esc(nickOf(x)) + '이(가) 그 길로 들어가, 열리지 않던 것을 안에서부터 밀어냈다.<br>'
           + '막고 있던 것이 더 이상 앞에 없다.')
        : (esc(nickOf(x)) + '이(가) 앞을 향해 달렸다.<br><br>'
           + '무엇을 부수었는지는 보지 못했다. 다만 앞이 비었다.');
    try {
        if (typeof darkBodyEl === 'function' && typeof darkBox === 'function') {
            darkBodyEl().innerHTML = darkBox('—', body
                + '<br><br><span style="font-size:11px; color:#8aa;">남은 파훼 '
                + Math.max(0, BFOX.BREAK_MAX - n) + '회</span>',
                darkChoiceBtn('계속 간다.', 'renderDarkStep();'));
            if (typeof mountDarkChat === 'function') mountDarkChat('normal');
        }
    } catch (e) { }
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
};

// 선택지 아래에 단추를 붙인다 (작두·다이아 단추와 같은 자리)
(function breakBtn() {
    const ID = 'kit-break-btn';
    setInterval(function () {
        try {
            const r = run();
            const old = document.querySelector('#' + ID);
            const x = r ? usable('break') : null;
            if (!x) { if (old) old.remove(); return; }
            if (old && old.isConnected) {
                old.textContent = '✧ ' + nickOf(x) + '이(가) 부순다 (남은 '
                    + Math.max(0, BFOX.BREAK_MAX - (Number(st(x.owner, 'break').n) || 0)) + '회)';
                return;
            }
            const area = document.getElementById('vote-area') || document.getElementById('dark-body');
            if (!area) return;
            const b = document.createElement('button');
            b.id = ID;
            b.className = 'game-btn';
            b.style.cssText = 'width:100%; margin:8px 0 0 0; padding:12px; font-size:12px;'
                + ' background:linear-gradient(145deg,#8a5a2a,#3d2714) !important;'
                + ' border-color:#d9a05a !important; color:#fff !important;';
            b.textContent = '✧ ' + nickOf(x) + '이(가) 부순다 (남은 '
                + Math.max(0, BFOX.BREAK_MAX - (Number(st(x.owner, 'break').n) || 0)) + '회)';
            b.onclick = window.kitBreak;
            area.appendChild(b);
        } catch (e) { }
    }, 1400);
})();

// ==========================================
// ⑦ 연결 — 합류 · 확정 구출
// ==========================================
window.kitJoin = function () {
    const x = usable('bond');
    if (!x) { alert_('연결 분신이 없습니다.'); return; }
    const r = run();
    if (!r) { alert_('탐사 중에만 쓸 수 있습니다.'); return; }
    const s = st(x.owner, 'bond');
    if ((Number(s.j) || 0) >= BFOX.BOND_JOIN) { alert_('합류는 세 번까지입니다.'); return; }
    r.taken = false;
    r.solo = false;
    r._a214Scattered = false;
    const j = (Number(s.j) || 0) + 1;
    kitPatch(x.ownerCode, 'bond', { j: j });
    if (r.log) r.log.push('[🐾 연결] ' + nickOf(x) + '이(가) 길을 이었습니다.');
    toast('🐾 ' + nickOf(x) + '이(가) 일행에게 데려다 주었다 (' + j + '/' + BFOX.BOND_JOIN + ')');
    bondDone(x);
    try { if (typeof renderDarkStep === 'function') renderDarkStep(); } catch (e) { }
};

window.kitRescue = function (who) {
    const x = usable('bond');
    if (!x) { alert_('연결 분신이 없습니다.'); return; }
    const s = st(x.owner, 'bond');
    if ((Number(s.r) || 0) >= BFOX.BOND_SAVE) { alert_('확정 구출은 한 번뿐입니다.'); return; }
    const r = run();
    const p = myParty();
    const code = who || (r && r.partyId && p && p.dying ? Object.keys(p.dying)[0] : null);
    if (!code) { alert_('지금 죽을 위기에 처한 일행이 없습니다.'); return; }
    const d = db_();
    try {
        if (d && p && p.id) {
            d.ref('darkParties/' + p.id + '/dying/' + code).remove().catch(function () { });
            d.ref('darkParties/' + p.id + '/rescue/' + code).set({
                by: x.ownerCode, byName: (x.owner && x.owner.name) || '', nick: nickOf(x), at: Date.now()
            }).catch(function () { });
        }
    } catch (e) { }
    kitPatch(x.ownerCode, 'bond', { r: (Number(s.r) || 0) + 1 });
    const t = userOf(code);
    if (t) log_(t, '[' + NAME + '] ' + nickOf(x) + '이(가) 당신을 끌어냈습니다.');
    alert_('🐾 ' + nickOf(x) + '이(가) ' + nameOf(code) + ' 사원을 끌어냈습니다.\n\n확정 구출은 한 번뿐입니다.');
    bondDone(x);
};

function bondDone(x) {
    const s = st(x.owner, 'bond');
    if ((Number(s.j) || 0) >= BFOX.BOND_JOIN && (Number(s.r) || 0) >= BFOX.BOND_SAVE) {
        kill('bond', '합류 셋과 구출 하나를 다 하고 소멸했습니다.');
    }
}

// 내가 죽을 위기일 때 — 내게 붙은 연결 분신이 알아서 끌어낸다
(function rescueWatch() {
    setInterval(function () {
        try {
            const r = run();
            if (!r || !r.dying) return;
            const x = usable('bond');
            if (!x) return;
            const s = st(x.owner, 'bond');
            if ((Number(s.r) || 0) >= BFOX.BOND_SAVE) return;
            r.dying = false;
            r._dead = false;
            kitPatch(x.ownerCode, 'bond', { r: (Number(s.r) || 0) + 1 });
            toast('🐾 ' + nickOf(x) + '이(가) 당신을 끌어냈다');
            if (r.log) r.log.push('[🐾 연결] ' + nickOf(x) + '이(가) 끌어냈습니다.');
            bondDone(x);
            try { if (typeof renderDarkStep === 'function') renderDarkStep(); } catch (e) { }
        } catch (e) { }
    }, 1500);
})();

// ==========================================
// ⑧ 응시 — 상점 확정 진열 · 확정 죽음 한 번
// ==========================================
function wishOf() {
    const x = usable('gaze');
    if (!x) return null;
    const o = x.owner;
    const wsh = (o && o.kitWish) || {};
    return { x: x, q: wsh.q || '', r: wsh.r || '' };
}
function pin(list, want) {
    if (!want || !Array.isArray(list)) return list;
    if (list.indexOf(want) >= 0) return list;
    const out = list.slice();
    out.pop();
    out.unshift(want);
    return out;
}
(function hookShops() {
    const iv = setInterval(function () {
        let done = 0;
        if (typeof qshopItems === 'function' && !qshopItems._kit) {
            const _q = qshopItems;
            const w = function () {
                const list = _q.apply(this, arguments);
                try { const g = wishOf(); if (g && g.q) return pin(list, g.q); } catch (e) { }
                return list;
            };
            w._kit = true; w._kitRaw = _q;
            qshopItems = w; window.qshopItems = w;
            done++;
        }
        if (typeof getToday5ShopItems === 'function' && !getToday5ShopItems._kit) {
            const _r = getToday5ShopItems;
            const w2 = function () {
                const list = _r.apply(this, arguments);
                try { const g = wishOf(); if (g && g.r) return pin(list, g.r); } catch (e) { }
                return list;
            };
            w2._kit = true; w2._kitRaw = _r;
            getToday5ShopItems = w2; window.getToday5ShopItems = w2;
            done++;
        }
        if (done) console.log('[아기 여우] 응시 — 상점 확정 진열 연결');
        if ((typeof qshopItems === 'function' && qshopItems._kit)
            && (typeof getToday5ShopItems === 'function' && getToday5ShopItems._kit)) clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 확정 죽음 — 이해도 80 · 인간성 0 · 감염 60 의 눈을 속인다
const GAUGE = [
    { fn: 'addLore',     key: 'lore',     n: '이해도', lim: 80, over: 1, half: 40 },
    { fn: 'addHumanity', key: 'humanity', n: '인간성', lim: 0,  over: 0, half: 50 },
    { fn: 'addInfect',   key: 'infect',   n: '감염',   lim: 60, over: 1, half: 30 }
];
(function hookGauge() {
    GAUGE.forEach(function (g) {
        const iv = setInterval(function () {
            if (typeof window[g.fn] !== 'function') return;
            if (window[g.fn]._kit) { clearInterval(iv); return; }
            const _o = window[g.fn];
            const w = function () {
                const out = _o.apply(this, arguments);
                try {
                    const r = run();
                    if (!r) return out;
                    const v = Number(r[g.key]);
                    if (isNaN(v)) return out;
                    const hit = g.over ? (v >= g.lim) : (v <= g.lim);
                    if (!hit) return out;
                    const gz = usable('gaze');
                    if (!gz) return out;
                    r[g.key] = g.half;
                    r._dead = false;
                    r._turned = false;
                    r.turned = false;
                    r._loreGone = false;
                    kill('gaze', g.n + ' 의 눈을 속이고 소멸했습니다.');
                    if (r.log) r.log.push('[🐾 응시] ' + g.n + ' 이(가) 절반으로 돌아왔습니다 (' + g.half + ').');
                    alert_('🐾 ' + g.n + ' 의 눈이 당신을 지나쳤습니다.\n\n'
                        + g.n + ' 이(가) ' + g.half + ' 로 돌아왔습니다.\n응시 분신은 소멸했습니다.');
                } catch (e) { }
                return out;
            };
            w._kit = true;
            window[g.fn] = w;
            clearInterval(iv);
        }, 500);
        setTimeout(function () { clearInterval(iv); }, 60000);
    });
})();

// ==========================================
// 방 — 구역이 차 있어도 만들고, 최소 인원을 분신으로 채운다
// ==========================================
let bypass = false;
(function hookZone() {
    const iv = setInterval(function () {
        if (typeof isZoneTaken !== 'function') return;
        if (isZoneTaken._kit) { clearInterval(iv); return; }
        const _z = isZoneTaken;
        const w = function () {
            if (bypass) return false;
            return _z.apply(this, arguments);
        };
        w._kit = true;
        isZoneTaken = w;
        window.isZoneTaken = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

(function hookCreate() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function') return;
        if (createParty._kit) { clearInterval(iv); return; }
        const _c = createParty;
        const w = function () {
            const me = u_();
            const on = !!(me && wears(me));
            if (on) bypass = true;
            try { return _c.apply(this, arguments); }
            finally {
                bypass = false;
                try { if (on) setTimeout(pushRoomKits, 400); } catch (e) { }
            }
        };
        w._kit = true;
        createParty = w;
        window.createParty = w;
        clearInterval(iv);
        console.log('[아기 여우] 방 — 구역 한계 넘기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

(function hookLaunch() {
    const iv = setInterval(function () {
        if (typeof launchParty !== 'function') return;
        if (launchParty._kit) { clearInterval(iv); return; }
        const _l = launchParty;
        const w = function () {
            const me = u_();
            let z = null, min0 = null;
            try {
                const p = myParty();
                if (me && wears(me) && p && p.leader === me.code
                    && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                    // 방 화면이 보여 준 것과 **같은 수**를 쓴다
                    const n = roomKitList(p, me).length;
                    if (n > 0) {
                        z = DARK_ZONES[p.zone];
                        min0 = z.min;
                        // ★ 가짜 사원을 방에 넣지 않는다 — 방 자료가 꼬인다.
                        //   최소 인원만 분신 수만큼 낮췄다가 바로 되돌린다.
                        z.min = Math.max(1, min0 - n);
                        bypass = true;
                    }
                }
            } catch (e) { }
            try { return _l.apply(this, arguments); }
            finally {
                bypass = false;
                if (z && min0 != null) z.min = min0;
            }
        };
        w._kit = true;
        launchParty = w;
        window.launchParty = w;
        clearInterval(iv);
        console.log('[아기 여우] 방 — 최소 인원 채우기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 방 화면 — 분신을 **보이게** 하고 진입 단추를 열어 준다
// ==========================================
//
// ■ 무엇이 안 됐나
//
//   분신을 골라 두면 방에도 서버에도 제대로 적혔다 (darkParties/<방>/kits).
//   그런데 **아무도 그것을 읽지 않았다.** 그래서
//
//     · 방 화면에 분신이 한 마리도 안 보였고
//     · 진입 단추가 꺼진 채였다
//
//   꺼져 있던 까닭은 관문이 다른 곳에 있었기 때문이다.
//
//       index.html:3365   canStart = members.length >= z.min && 전원 준비
//       index.html:3416   canStart 가 거짓이면 단추에 disabled
//
//   아래 hookLaunch 가 launchParty 안에서 z.min 을 낮추고는 있었지만,
//   단추가 꺼져 있어서 **그 함수에 손으로 닿을 수가 없었다.** 콘솔에서
//   launchParty() 를 직접 부르면 출발했다 — 훅은 처음부터 제대로 돌고
//   있었고, 막혀 있던 것은 그 앞의 단추였다.
//
// ■ 어떻게 고치나
//
//   방 화면을 그리는 동안만 z.min 을 분신 수만큼 낮춘다. launchParty 에
//   쓰던 것과 똑같은 방식이다. 그러면 canStart 가 참이 되어 단추가 열리고,
//   열린 단추가 부르는 launchParty 에는 이미 훅이 걸려 있다.
//
//   낮춘 값이 「정원 1~5인」처럼 새어 나가는 한 줄만 원래 값으로 되돌리고,
//   참가자 목록 아래에 분신 칸을 끼워 넣는다. 방 안의 모두가 같은 것을
//   본다 — 방장은 제 기록으로, 나머지는 방에 적힌 것으로.
//
//   [🐾 데려갈 분신 고르기] 단추도 그 칸 안으로 들어왔다. 전에는 2초마다
//   도는 시계가 방 화면 밑에 붙였다 떼었다 했다 — 다시 그릴 때마다
//   지워지고 2초 뒤에 돌아오느라 깜빡였다.
function kitRoomBox(p, me, min0, low, list) {
    const mine = !!(me && p.leader === me.code);
    const rows = list.map(function (x) {
        return '<div style="display:flex; align-items:center; gap:7px; padding:5px 0;">'
            + '<div style="flex:1; min-width:0; font-size:11.5px; color:#e6ddd0;">'
            + '<span style="color:#ffcf8f;">' + (BY_K[x.k] ? BY_K[x.k].icon : '🐾') + '</span> '
            + esc(x.nick)
            + ' <span style="font-size:9px; color:#8d8578;">' + esc(BY_K[x.k].n) + ' 분신'
            + (x.g ? ' · ' + esc(x.g) : '') + '</span></div></div>';
    }).join('');

    return '<div id="kit-room-box" style="background:rgba(217,160,90,0.07);'
        + ' border:1px solid #8a5a2a; border-radius:6px; padding:11px; margin:12px 0;">'
        + '<div style="font-size:11px; color:#d9a05a; font-weight:bold; margin-bottom:5px;">'
        + '🐾 데려가는 분신 ' + list.length + '마리</div>'
        + (list.length
            ? rows + '<div style="font-size:9.5px; color:#8d8578; margin-top:5px;'
                   + ' border-top:1px solid #3a3027; padding-top:6px; line-height:1.6;">'
                   + (min0 > low
                        ? '최소 인원 <b style="color:#d9a05a;">' + min0 + '인 → ' + low + '인</b>'
                          + ' — 분신이 빈자리를 채웁니다.'
                        : '최소 인원이 이미 ' + min0 + '인이라 더 낮출 것이 없습니다.')
                   + '<br>분신은 사람 수에는 안 들어갑니다 (보상·난이도는 사람 수로 셉니다).'
                   + '</div>'
            : '<div style="font-size:10px; color:#8d8578; line-height:1.6;">'
              + (mine ? '아직 아무도 안 골랐습니다. 아래에서 고르면 최소 인원을 채웁니다.'
                      : '방장이 데려가는 분신이 없습니다.') + '</div>')
        + (mine && wears(me)
            ? '<button class="game-btn" style="width:100%; margin:8px 0 0 0; padding:9px;'
              + ' font-size:11px; background:linear-gradient(145deg,#8a5a2a,#3d2714) !important;'
              + ' border-color:#d9a05a !important;" onclick="kitRoomPick()">'
              + '🐾 데려갈 분신 고르기</button>'
            : '')
        + '</div>';
}

// ★ 다 그린 뒤에 innerHTML 을 다시 쓰지 않는다
//
//   renderPartyRoom 은 맨 끝에서 파티 대화창에 쓰던 글과 커서를 되돌려
//   놓는다 (index.html:3442). 다 그린 뒤에 innerHTML 을 손대면 그게
//   날아가서, 대화를 치는 중에 방이 다시 그려질 때마다 글이 지워진다.
//   그래서 **그리는 동안** 끼워 넣는다 — 방 화면이 제 틀 안에서 부르는
//   buildChatHtml 의 앞에 붙인다. 그 뒤에 대화창 되돌리기가 돌므로
//   글도 커서도 그대로다.
let drawing = null;        // { p, me, min0, low, list } — 방 화면을 그리는 중

(function hookChatSlot() {
    const iv = setInterval(function () {
        if (typeof buildChatHtml !== 'function') return;
        if (buildChatHtml._kit) { clearInterval(iv); return; }
        const _b = buildChatHtml;
        const w = function () {
            const out = _b.apply(this, arguments);
            if (!drawing) return out;              // 방 화면 밖에서는 건드리지 않는다
            try {
                const r = drawing;
                return kitRoomBox(r.p, r.me, r.min0, r.low, r.list) + out;
            } catch (e) { return out; }
        };
        w._kit = true;
        buildChatHtml = w;
        window.buildChatHtml = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

(function hookRoomRender() {
    const iv = setInterval(function () {
        if (typeof renderPartyRoom !== 'function') return;
        if (renderPartyRoom._kit) { clearInterval(iv); return; }
        const _r = renderPartyRoom;
        const w = function (p, body) {
            const me = u_();
            let z = null, min0 = null, low = null, list = [], show = false;

            try {
                if (me && p && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                    z = DARK_ZONES[p.zone];
                    list = roomKitList(p, me);
                    // 방장 화면이 그릴 때, 방에 적힌 것이 어긋나 있으면 다시 적는다
                    if (p.leader === me.code) {
                        const a = list.map(function (x) { return x.k; }).sort().join(',');
                        const b = Object.keys((p.kits && typeof p.kits === 'object'
                            && !Array.isArray(p.kits)) ? p.kits : {}).sort().join(',');
                        if (a !== b) pushRoomKits();
                    }
                    min0 = z.min;
                    low = Math.max(1, min0 - list.length);
                    show = !!(list.length || (wears(me) && p.leader === me.code));
                    // ★ 여기서 최소 인원을 낮춘다 — canStart 가 이 값을 본다
                    //   (index.html:3365) 그래서 진입 단추가 열린다
                    if (list.length) z.min = low;
                    if (show) drawing = { p: p, me: me, min0: min0, low: low, list: list };
                }
            } catch (e) { }

            let out;
            try { out = _r.apply(this, arguments); }
            finally {
                drawing = null;
                if (z && min0 != null) z.min = min0;
            }

            // 대화창 틀을 못 찾았을 때만 — 맨 끝에 따로 붙인다.
            // appendChild 는 이미 있는 것을 건드리지 않으므로 대화 글이 안 날아간다.
            try {
                // 먼저 지난번에 붙인 것을 걷는다. 보통은 innerHTML 이 다시 쓰이면서
                // 같이 지워지지만, 안 지워지는 길로 들어와도 늘어나지 않게 한다.
                const stale = document.getElementById('kit-room-fallback');
                if (stale) stale.remove();
                if (show && body && String(body.innerHTML || '').indexOf('kit-room-box') < 0) {
                    const el = document.createElement('div');
                    el.id = 'kit-room-fallback';
                    el.innerHTML = kitRoomBox(p, me, min0, low, list);
                    body.appendChild(el);
                }
            } catch (e) { }
            return out;
        };
        w._kit = true;
        renderPartyRoom = w;
        window.renderPartyRoom = w;
        clearInterval(iv);
        console.log('[아기 여우] 방 화면 — 분신 칸과 진입 단추 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
window.kitGive = function (who, n) {
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

window.kitRevive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    KEYS.forEach(function (k) { kitPatch(t.code, k, { gone: 0, n: 0, j: 0, r: 0 }); });
    console.log('%c✓ ' + t.name + ' 사원의 여덟 마리를 되살렸습니다.', 'color:#4CAF50');
};

window.kitState = function (who) {
    const t = find(who) || u_();
    if (!t) { console.log('로그인 전입니다.'); return; }
    dayRoll(t);
    console.log('%c===== 🐾 아기 여우 · ' + t.name + ' =====', 'color:#d9a05a; font-size:13px');
    console.log('  차고 있나 :', wears(t) ? 'O' : '✗',
        '· 전용 장비 :', (typeof gearLabel === 'function') ? gearLabel(t) : '-');
    console.table(KINDS.map(function (x) {
        const s = st(t, x.k);
        const left = { hide: BFOX.HIDE_MAX, break: BFOX.BREAK_MAX }[x.k];
        return {
            분신: x.icon + ' ' + x.n, 이름: s.nick || '-', 등급: gradeOf(t, x.k),
            상태: s.gone ? '소멸' : (s.to ? nameOf(s.to) + ' 사원과' : '대기중'),
            남은횟수: x.k === 'bond'
                ? ('합류 ' + Math.max(0, BFOX.BOND_JOIN - (Number(s.j) || 0))
                   + ' · 구출 ' + Math.max(0, BFOX.BOND_SAVE - (Number(s.r) || 0)))
                : (left ? Math.max(0, left - (Number(s.n) || 0)) : '-'),
            방에데려감: (t.kitRoom && t.kitRoom[x.k]) ? 'O' : '-'
        };
    }));
    const on = t.kitOn || {};
    const onKeys = Object.keys(on);
    console.log('  내게 붙은 분신 :', onKeys.length
        ? onKeys.map(function (k) {
            return (BY_K[k] ? BY_K[k].n : k) + '(' + (on[k].byName || on[k].by) + ')';
          }).join(' · ') : '없음');
    const wsh = t.kitWish || {};
    console.log('  응시가 띄울 것 : [???] ' + (wsh.q || '-') + ' · 유쾌 ' + (wsh.r || '-'));
    console.log('  대신 돌리기 :', spinOn ? '켜짐' : '꺼짐');
};

window.kitHelp = function () {
    console.log('%c===== 🐾 아기 여우 여덟 =====', 'color:#d9a05a; font-size:13px');
    KINDS.forEach(function (x) { console.log('  ' + x.icon + ' ' + x.n + ' — ' + x.d); });
    console.log('  소멸하면 자정까지 다시 못 부릅니다. 자정이 지나면 여덟이 다시 깨어납니다.');
    console.log('  kitGive(사번) · kitState(사번) · kitRevive(사번)');
};

window.KITFOX = { KINDS: KINDS, BY_K: BY_K, KEYS: KEYS, BFOX: BFOX,
                  st: st, alive: alive, usable: usable, kill: kill, bump: bump,
                  grade: gradeOf, dayRoll: dayRoll, noteLine: noteLine,
                  roomKeys: roomPicked, lootRoll: lootRoll,
                  spin: function () { return spinOn; } };

console.log('[아기 여우] kitGive(사번) · kitState(사번) · kitHelp()');

})();
