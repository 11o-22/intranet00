// ==========================================
// ★ 🦊 호갑투 - 禁制  — 상담사 지급형 커스텀 장비   (2026-11-13 사용자)
// bundles.json 마지막 묶음 — foxrain.js 뒤 · gear-room.js 앞  (gear-cap.js 는 시계로 돌며 맨 바깥을 다시 감싼다)
// ==========================================
//
// ■ 사용자가 준 글 (그대로)
//
//   여우의 꼬리털을 엮어 만든 호갑투. 인간 사이에 섞여들 수 있도록 제작자가 자신의 격을 낮추며 모자란 힘을 보완하기 위해 만든 장신구이다.
//   엮은 꼬리털의 개수만큼 금제가 담겨 있으며, 금제가 걸린 사용자는 지정된 자리에 사슬 모양의 표시가 떠오른다.
//   모든 금제가 한 사람에게 걸릴 경우, 특별한 일이 일어나기도 한다.
//
//   「지급 조건은 상담사만 줄 수 있게 하고, 이모지는 🦊 이걸로. N 표시가 되어있는 건 1~3중 하나로 적절하게 넣어 주고.
//     이 장비를 장착한 사람이 맵에 입장하면 빗소리가 나면서 바닥에 살짝씩 물이 고이는 효과와 비가 쏴아아 내리다가 점점 투둑. 툭 내리는 효과를 주자.」
//
// ■ 금제 (N 은 아래 HG 표에 — 1~3 가운데 골랐다)
//
//   제 零 금제 · 심장   스스로에게만 · 하루 2번 · 3시간. 걸린 동안 주인이 탐사하는 어둠에는 여우비가 내린다.
//                       여우비 — 괴이의 판정에 패널티(일행 판정 +2) · 사원의 즉사를 3회 막는다(주인 말고) · 막을 때마다 주인 판정 +1.
//                       주인은 그동안 남을 구출하지 못하고, 사원이 걸어 준 판정 버프(버프 물품 · 호가호위 판정)를 받지 않는다.
//   제 一 금제 · 손목   24시간. 공용시설(슬롯) 하루 상한 150만 · 공용시설 행운 300%.
//                       남에게 걸면 번 몫(건 돈을 뺀 수익)의 30% 가 주인에게, 주인 자신이면 15% 가 가장 가난한 사원에게.
//   제 二 금제 · 쇄골   주인은 하루 2번 상담실 · 선녀탕에서 스스로 나온다 (가두리는 아니다).
//                       하루 한 번, 오늘 여우비를 맞은 사원 한 명을 상담실 · 선녀탕에서 빼돌린다 — 그 사원이 제 二 금제의 대상이 된다 (24시간).
//   제 三 금제 · 이마   3시간. 어둠에서 생환하면 포인트 2배 · 회수품 2배. 하루 2번까지, 대상이 얻은 포인트와 회수품을 주인도 똑같이 받는다.
//   제 四 금제 · 발목   3시간. 작은 여우가 붙는다 — 죽는 길에 ☪️ · 기믹 파훼 1 · 즉사 회피 1(몸을 던진다).
//                       여우를 잃으면 금제가 끝날 때까지 대상의 화면에 으스스한 환각이 붙는다 (주인에게는 잃었다는 기별).
//   제 五 금제 · 목     24시간. 남에게 걸면 어둠에서 죽을 때 주인의 모습으로 둔갑해 이어 간다(즉사 회피 1번) · 주인 자신이면 하루 2번.
//   ???                 제 一~五 금제가 (같은 주인 것으로) 한 사원에게 다 걸리면 — 그 사원은 3시간 동안 제 零 금제를 쓴다 (탐사하는 어둠에 여우비).
//
//   거는 횟수 — 제 一 · 三 · 四 · 五 금제는 저마다 하루 한 번 (본인 또는 타인). 제 二 금제는 빼돌린 사원에게 저절로 걸린다.
//   사슬 표시 — 사원증 특이사항에 「⛓ 제 ○ 금제 · 자리」, 광장에서는 그 자리에 작은 사슬.
//   어둠 — 여기서 「어둠」은 어둠 탐사(피날레 포함)다. EPIC · K 의 방 · 재난에는 걸지 않았다. 이벤트 어둠에서는 다른 커스텀 장비처럼 먹히지 않는다.
//
// ■ 적히는 자리
//   users/<주인>   hgUse { d, z, c1, c3, c4, c5, out, pull, s5 } · hgZero { at, until }
//   users/<대상>   hgSeals { s1..s5: { by, n, at, until } } (주인이 적는다) · hgFox { at, gim, dead } · hgFive { at, used } · hgRained { d, by } · hgSeen · hgZero(???) (본인이 적는다)
//   darkParties/<방>/hgRain { by, n, left, cold, at }     여우비 (혼자면 darkRun._hgRain)
//   hgMirror/<주인>/<날>  제 三 금제 — 주인이 똑같이 받은 횟수 · hgPull/<사번> 빼돌려진 사원에게 띄울 글 · hgGrief/<주인> 여우를 잃었다는 기별
//
// ■ 콘솔
//   hgGive(사번)  상담사 — 하나 준다      hgState(사번)      hgReset(사번)  상담사 — 오늘 쓴 횟수를 되돌린다      hgMenu()

window.HG = {
    NAME: '🦊 호갑투 - 禁制',
    ZERO:  { DAY: 2, HOURS: 3, SAVES: 3, COLD: 1, RAIN_BON: 2 },
    ONE:   { HOURS: 24, CAP: 1500000, LUCK: 300, CUT_OTHER: 0.30, CUT_SELF: 0.15 },
    TWO:   { OUT_DAY: 2, PULL_DAY: 1, HOURS: 24, OUT_POLL: 50 },
    THREE: { HOURS: 3, PTS: 2, LOOT: 2, MIRROR_DAY: 2 },
    FOUR:  { HOURS: 3 },
    FIVE:  { HOURS: 24, OTHER: 1, SELF_DAY: 2 },
    ALL:   { HOURS: 3 }
};

(function hogaptu() {
'use strict';
const C = window.HG, NAME = C.NAME;
const ADMIN = 'kario0987', MOD = 'hg-modal', HOUR = 3600000;
const SEALS = [
    { k: '0', han: '零', spot: '심장' },
    { k: '1', han: '一', spot: '손목', hours: C.ONE.HOURS },
    { k: '2', han: '二', spot: '쇄골', hours: C.TWO.HOURS },
    { k: '3', han: '三', spot: '이마', hours: C.THREE.HOURS },
    { k: '4', han: '四', spot: '발목', hours: C.FOUR.HOURS },
    { k: '5', han: '五', spot: '목', hours: C.FIVE.HOURS }
];
const BY_K = {}; SEALS.forEach(function (s) { BY_K[s.k] = s; });
function title(k) { const s = BY_K[k]; return '제 ' + s.han + ' 금제'; }

// ==========================================
// 잡동사니
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function wOff(z) { try { return !!(window.WONDER_GEAR_OFF && window.WONDER_GEAR_OFF(z)); } catch (e) { return false; } }
// 어둠 탐사인가 — EPIC · K 의 방 · 이벤트 어둠이 아닌 판 (금제의 「어둠」은 여기까지)
function epicOn() { try { return typeof er !== 'undefined' && !!er; } catch (e) { return false; } }
function kOn() { try { return typeof window.kroomOn === 'function' && !!window.kroomOn(); } catch (e) { return false; } }
function plain(r) { return !!(r && !epicOn() && !kOn() && !wOff(r.zone)); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function now() { return Date.now(); }
function users() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function userOf(code) { const me = u_(); if (me && me.code === code) return me; return users()[code] || null; }
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; })); }
function parties() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
// 값이 없는 칸은 빼고 저장한다 — 하나라도 섞이면 전부 안 써진다
function save(f) {
    const me = u_(); if (!me) return;
    const g = {};
    Object.keys(f).forEach(function (k) { if (me[k] !== undefined) g[k] = 1; });
    if (!Object.keys(g).length) return;
    try { if (typeof saveFields === 'function') saveFields(g); } catch (e) { }
}
function hoursLeft(until) { const m = Math.max(0, Number(until) - now()); return m >= HOUR ? (Math.round(m / 360000) / 10) + '시간' : Math.max(1, Math.ceil(m / 60000)) + '분'; }
C.wears = wears;

// ==========================================
// 금제 — 읽기
// ==========================================
function sealsOf(u) { return (u && u.hgSeals && typeof u.hgSeals === 'object') ? u.hgSeals : {}; }
// 열쇠는 s1 ~ s5 — 숫자만 쓰면 서버가 배열로 바꿔 돌려준다
function sealOf(u, k) { const s = sealsOf(u)['s' + k]; return (s && s.by && Number(s.until) > now()) ? s : null; }
// 제 零 금제가 걸려 있나 — 주인은 차고 있을 때만 · ??? 로 받은 사원은 그대로
function zeroOf(u) {
    const z = u && u.hgZero;
    if (!z || !(Number(z.until) > now())) return null;
    if (z.grant) return z;
    return wears(u) ? z : null;
}
function useOf(u) { const x = u && u.hgUse; return (x && x.d === today()) ? x : { d: today() }; }
function bump(u, key, n) { const x = Object.assign({}, useOf(u)); x[key] = (Number(x[key]) || 0) + (n == null ? 1 : n); u.hgUse = x; }
function used(u, key) { return Number(useOf(u)[key]) || 0; }
// 내 금제가 지금 누구에게 걸려 있나 (주인 화면)
function whereIs(k) {
    const me = u_(); if (!me) return null;
    if (k === '0') { const z = zeroOf(me); return z ? { code: me.code, until: z.until } : null; }
    const mine = sealOf(me, k);
    if (mine && mine.by === me.code) return { code: me.code, until: mine.until };
    const book = users();
    const c = Object.keys(book).filter(function (x) { const s = sealOf(book[x], k); return x !== me.code && s && s.by === me.code; })[0];
    return c ? { code: c, until: sealOf(book[c], k).until } : null;
}
// 작은 여우 (제 四 금제) — 살아 있나 · 파훼가 남았나
function foxState(u, s4) { const f = u && u.hgFox; return (f && s4 && f.at === s4.at) ? f : {}; }
function foxAlive(u) { const s = sealOf(u, '4'); return !!(s && !foxState(u, s).dead); }
function foxGim(u) { const s = sealOf(u, '4'); return !!(s && !foxState(u, s).dead && !foxState(u, s).gim); }
function foxLost(u) { const s = sealOf(u, '4'); return !!(s && foxState(u, s).dead); }
C.sealOf = sealOf; C.zeroOf = zeroOf; C.foxAlive = foxAlive;

// ==========================================
// 물품 등록 · 장터 숨김 · 장착
// ==========================================
(function reg() {
    function put() {
        if (typeof ITEM_CATALOG === 'undefined') return false;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = {
                price: 0, usable: true, targetable: false, effect: 'equip_hogaptu', noSell: true,
                desc: '[장착] 여우의 꼬리털을 엮어 만든 호갑투. 인간 사이에 섞여들 수 있도록 제작자가 자신의 격을 낮추며 모자란 힘을 보완하기 위해 만든 장신구이다. '
                    + '엮은 꼬리털의 개수만큼 금제가 담겨 있으며, 금제가 걸린 사용자는 지정된 자리에 사슬 모양의 표시가 떠오른다. '
                    + '모든 금제가 한 사람에게 걸릴 경우, 특별한 일이 일어나기도 한다.'
            };
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
            console.log('[호갑투] ' + NAME + ' 등록 — 상담사 지급 전용');
            repaint();
        }
        return true;
    }
    function repaint() {
        try {
            const box = document.getElementById('inventory-list-container');
            if (!box || !box.childNodes.length) return;
            if (String(box.textContent || '').indexOf(NAME) < 0) return;
            if (!u_() || typeof renderInventory !== 'function') return;
            renderInventory();
        } catch (e) { }
    }
    if (put()) return;
    const iv = setInterval(function () { if (put()) clearInterval(iv); }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 어느 상점 후보에도 들어가지 않게
setInterval(function () {
    try { if (typeof ALIEN_ITEMS_POOL !== 'undefined') { const i = ALIEN_ITEMS_POOL.indexOf(NAME); if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1); } } catch (e) { }
}, 5000);

// 함수 하나를 감싼다 — 다른 파일이 뒤에 다시 감싸도 한 번만
function wrap(name, make, keepGearCap) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._hg) { clearInterval(iv); return; }
        const w = make(f);
        Object.keys(f).forEach(function (k) { if (!(k in w) && (keepGearCap || k !== '_gearCap')) { try { w[k] = f[k]; } catch (e) { } } });
        w._hg = true;
        window[name] = w;
        clearInterval(iv);
    }, 450);
    setTimeout(function () { clearInterval(iv); }, 60000);
}

wrap('marketSellable', function (_m) {
    return function () {
        const pool = _m.apply(this, arguments);
        try { if (pool && typeof pool.delete === 'function') pool.delete(NAME); else if (Array.isArray(pool)) return pool.filter(function (x) { return baseOf(x) !== NAME; }); } catch (e) { }
        return pool;
    };
});
wrap('useInventoryItem', function (_u) {
    return function (itemName) {
        if (itemName !== NAME) return _u.apply(this, arguments);
        const me = u_(); if (!me) return;
        if (typeof isQuarantined === 'function' && isQuarantined(me)) { alert_('격리 중에는 장착할 수 없습니다.'); return; }
        if ((me.inventory || []).indexOf(NAME) < 0) { alert_('가지고 있지 않습니다.'); return; }
        if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
        if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
        if (typeof equipFull === 'function' && equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
        me.equippedWeapons.push(NAME);
        try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
        try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
        try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(me, '[장착됨] ' + NAME); } catch (e) { }
        log_(me, '[' + NAME + '] 장착했습니다.');
        try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_(NAME + '\n\n손끝에 꼬리털이 감깁니다.\n장착칸의 [🦊 금제] 로 금제를 겁니다.');
    };
});

// ==========================================
// 금제를 건다 (주인 화면)
// ==========================================
function findUser(v) {
    v = String(v || '').trim();
    const book = users();
    const c = Object.keys(book).filter(function (x) { const t = book[x] || {}; return x === v || String(t.no) === v || t.name === v; })[0];
    return c ? book[c] : null;
}
// 걸 수 없는 까닭 ('' 이면 건다)
function whyNot(k, target) {
    const me = u_();
    if (!me || !wears(me)) return NAME + ' 를 차고 있어야 합니다.';
    if (k === '0') {
        if (zeroOf(me)) return '제 零 금제가 이미 걸려 있습니다. (' + hoursLeft(zeroOf(me).until) + ' 남음)';
        if (used(me, 'z') >= C.ZERO.DAY) return '제 零 금제는 하루에 ' + C.ZERO.DAY + '번입니다. 오늘은 다 걸었습니다.';
        return '';
    }
    if (k === '2') return '제 二 금제는 빼돌린 사원에게 저절로 걸립니다.';
    if (used(me, 'c' + k)) return title(k) + '는 하루에 한 번 겁니다. 오늘은 이미 걸었습니다.';
    if (!target) return '누구에게 걸지 고르십시오.';
    if (target.code === ADMIN && me.code !== ADMIN) return '상담사에게는 걸 수 없습니다.';
    return '';
}
function cast(k, target) {
    const me = u_();
    const why = whyNot(k, target || me);
    if (why) { alert_(why); return false; }
    const t = now(), S = BY_K[k];
    if (k === '0') {
        me.hgZero = { at: t, until: t + C.ZERO.HOURS * HOUR };
        bump(me, 'z');
        log_(me, '[' + NAME + '] 제 零 금제 · 심장 — 스스로에게 걸었습니다. ' + C.ZERO.HOURS + '시간 동안, 탐사하는 어둠에 여우비가 내립니다.');
        badgeSync(me);
        save({ hgZero: 1, hgUse: 1, history: 1, badge: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_('⛓ 제 零 금제 · 심장\n\n스스로에게 금제를 걸었습니다. (' + C.ZERO.HOURS + '시간)\n\n그동안 탐사하는 어둠에는 여우비가 내립니다.\n'
            + '· 괴이의 판정에 패널티 · 사원의 즉사를 ' + C.ZERO.SAVES + '회 막습니다\n· 당신은 남을 구출하지 못하고, 사원이 건 판정 버프를 받지 않습니다\n\n오늘 남은 횟수 ' + (C.ZERO.DAY - used(me, 'z')) + ' / ' + C.ZERO.DAY);
        return true;
    }
    const rec = { by: me.code, n: me.name || me.code, at: t, until: t + S.hours * HOUR };
    const self = target.code === me.code;
    const obj = Object.assign({}, sealsOf(target)); obj['s' + k] = rec;
    target.hgSeals = obj;
    bump(me, 'c' + k);
    log_(me, '[' + NAME + '] ' + title(k) + ' · ' + S.spot + ' — ' + (self ? '스스로에게' : (target.name || target.code) + ' 사원에게') + ' 걸었습니다. (' + S.hours + '시간)');
    if (self) { badgeSync(me); save({ hgSeals: 1, hgUse: 1, history: 1, badge: 1 }); }
    else {
        try { if (typeof updateUserFields === 'function') updateUserFields(target.code, { hgSeals: obj, hasItemUsedOnMe: true }); } catch (e) { }
        save({ hgUse: 1, history: 1 });
    }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('⛓ ' + title(k) + ' · ' + S.spot + '\n\n' + (self ? '스스로에게' : (target.name || target.code) + ' 사원에게') + ' 금제를 걸었습니다. (' + S.hours + '시간)\n\n' + SAY[k](self));
    return true;
}
const SAY = {
    '1': function (self) { return '공용시설(슬롯) 하루 상한 ' + (C.ONE.CAP / 10000) + '만 P · 공용시설 행운 ' + C.ONE.LUCK + '%.\n' + (self ? '번 몫의 ' + Math.round(C.ONE.CUT_SELF * 100) + '% 는 가장 가난한 사원에게 기부됩니다.' : '그 사원이 번 몫의 ' + Math.round(C.ONE.CUT_OTHER * 100) + '% 는 당신에게 귀속됩니다.'); },
    '3': function (self) { return '어둠에서 생환하면 포인트 ' + C.THREE.PTS + '배 · 회수품 ' + C.THREE.LOOT + '배.' + (self ? '' : '\n하루 ' + C.THREE.MIRROR_DAY + '번까지, 그 사원이 얻은 포인트와 회수품을 당신도 똑같이 받습니다.'); },
    '4': function () { return '작은 여우 한 마리가 붙습니다 — 죽는 길에 ☪️ · 기믹 파훼 1 · 즉사 회피 1.\n여우를 잃으면 금제가 끝날 때까지 환각이 붙습니다.'; },
    '5': function (self) { return self ? '하루 ' + C.FIVE.SELF_DAY + '번, 둔갑하여 목숨의 위협을 넘깁니다.' : '어둠에서 죽게 되면 당신의 모습으로 둔갑해 탐사를 이어 갑니다. (즉사 회피 ' + C.FIVE.OTHER + '번)'; }
};

// ==========================================
// 특이사항 — 사슬 줄 (본인 화면이 제 금제를 보고 맞춘다)
// ==========================================
const LINE = /^⛓ 제 [零一二三四五] 금제/;
function myLines(me) {
    const out = [];
    const z = zeroOf(me);
    if (z) out.push('⛓ 제 零 금제 · 심장' + (z.grant ? ' (' + nameOf(z.by) + ')' : ''));
    ['1', '2', '3', '4', '5'].forEach(function (k) { const s = sealOf(me, k); if (s) out.push('⛓ ' + title(k) + ' · ' + BY_K[k].spot + (s.by !== me.code ? ' (' + (s.n || nameOf(s.by)) + ')' : '')); });
    return out;
}
function badgeSync(me) {
    if (!me) return false;
    const mine = myLines(me);
    if (!me.badge || typeof me.badge !== 'object') { if (!mine.length) return false; me.badge = { photo: '', nickname: me.name, notes: '특이사항 없음' }; }
    const raw = String(me.badge.notes == null ? '' : me.badge.notes);
    const parts = raw.split(' | ').map(function (x) { return x.trim(); }).filter(function (x) { return x && x !== '특이사항 없음'; });
    // ★ 사슬 줄이 달라졌을 때만 고쳐 적는다 — 남의 줄(띄어쓰기 · 다른 이음 글자)은 건드리지 않는다
    if (parts.filter(function (x) { return LINE.test(x); }).join('\n') === mine.join('\n')) return false;
    me.badge.notes = parts.filter(function (x) { return !LINE.test(x); }).concat(mine).join(' | ') || '특이사항 없음';
    return true;
}
// 새로 걸린 금제를 알린다 · 끝난 줄을 치운다 · ??? 를 본다
setInterval(function () {
    try {
        const me = u_(); if (!me || !me.code) return;
        const f = {};
        const seen = Object.assign({}, (me.hgSeen && typeof me.hgSeen === 'object') ? me.hgSeen : {});
        let fresh = [];
        ['1', '2', '3', '4', '5'].forEach(function (k) {
            const s = sealOf(me, k);
            if (!s || s.by === me.code || seen['s' + k] === s.at) return;
            seen['s' + k] = s.at; fresh.push(k);
            log_(me, '[' + NAME + '] ' + (s.n || nameOf(s.by)) + ' 사원이 ' + title(k) + '(' + BY_K[k].spot + ')를 걸었습니다. (' + hoursLeft(s.until) + ')');
        });
        if (fresh.length) {
            me.hgSeen = seen; f.hgSeen = 1; f.history = 1;
            const s0 = sealOf(me, fresh[0]);
            const body = fresh.map(function (k) { return '⛓ ' + title(k) + ' · ' + BY_K[k].spot + '\n' + (k === '2' ? '상담실에서 빼돌려졌습니다.' : SAY_T[k](sealOf(me, k))); }).join('\n\n');
            if (!run()) alert_('🦊 ' + (s0.n || nameOf(s0.by)) + ' 사원의 금제가 걸렸습니다.\n\n' + body); else toast('⛓ ' + fresh.map(title).join(' · ') + '가 걸렸다.');
        }
        allCheck(me, f);
        if (badgeSync(me)) f.badge = 1;
        if (Object.keys(f).length) { save(f); try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }
    } catch (e) { }
}, 3000);
const SAY_T = {
    '1': function () { return '공용시설(슬롯) 하루 상한 ' + (C.ONE.CAP / 10000) + '만 P · 공용시설 행운 ' + C.ONE.LUCK + '% — 대신 번 몫의 ' + Math.round(C.ONE.CUT_OTHER * 100) + '% 는 금제의 주인에게 귀속됩니다.'; },
    '3': function () { return '어둠에서 생환하면 포인트 ' + C.THREE.PTS + '배 · 회수품 ' + C.THREE.LOOT + '배.'; },
    '4': function () { return '작은 여우 한 마리가 붙었습니다 — 죽는 길에 ☪️ · 기믹 파훼 1 · 즉사 회피 1.'; },
    '5': function () { return '어둠에서 죽게 되면 금제 주인의 모습으로 둔갑해 탐사를 이어 갑니다. (즉사 회피 ' + C.FIVE.OTHER + '번)'; }
};
// ??? — 제 一~五 금제가 같은 주인 것으로 다 걸렸다 → 3시간 동안 제 零 금제
function allCheck(me, f) {
    const ss = ['1', '2', '3', '4', '5'].map(function (k) { return sealOf(me, k); });
    if (ss.some(function (s) { return !s; })) return;
    const by = ss[0].by;
    if (by === me.code || ss.some(function (s) { return s.by !== by; })) return;
    const key = ss.map(function (s) { return s.at; }).join('.');
    if (me.hgAll === key) return;
    me.hgAll = key;
    me.hgZero = { at: now(), until: now() + C.ALL.HOURS * HOUR, grant: 1, by: by };
    f.hgAll = 1; f.hgZero = 1; f.history = 1;
    log_(me, '[' + NAME + '] ??? — 다섯 금제가 한 몸에 모였습니다. ' + C.ALL.HOURS + '시간 동안 제 零 금제를 씁니다 (탐사하는 어둠에 여우비).');
    alert_('⛓ ???\n\n다섯 금제가 한 몸에 모였습니다.\n사슬이 심장까지 닿습니다.\n\n' + C.ALL.HOURS + '시간 동안 제 零 금제를 씁니다 — 당신이 탐사하는 어둠에는 여우비가 내립니다.\n'
        + '· 괴이의 판정에 패널티 · 사원의 즉사를 ' + C.ZERO.SAVES + '회 막습니다\n· 그동안 당신은 남을 구출하지 못하고, 사원이 건 판정 버프를 받지 않습니다');
}

// ==========================================
// 장착칸의 [🦊 금제] 단추 · 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const GOLD = ' background:linear-gradient(145deg,#8a4a1e,#3a1c0a) !important; border-color:#e0a05a !important; color:#ffe9cf !important;';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#1c120b,#0c0705); border:1px solid #c98a4a; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#ffd9a8; font-weight:bold; margin-bottom:4px;">' + t + '</div>'
        + (sub ? '<div style="font-size:10px; color:#a88d6a; margin-bottom:11px; line-height:1.6;">' + sub + '</div>' : '');
}
const DESC = {
    '0': '스스로에게만. 걸린 동안 당신이 탐사하는 어둠에 여우비가 내린다 — 괴이의 판정에 패널티 · 사원의 즉사를 ' + C.ZERO.SAVES + '회 막고, 막을 때마다 당신의 판정 +' + C.ZERO.COLD + '. 그동안 당신은 남을 구출하지 못하고 사원이 건 판정 버프를 받지 않는다. (하루 ' + C.ZERO.DAY + '번 · ' + C.ZERO.HOURS + '시간)',
    '1': '공용시설(슬롯) 하루 상한 ' + (C.ONE.CAP / 10000) + '만 P · 공용시설 행운 ' + C.ONE.LUCK + '%. 남에게 걸면 번 몫의 ' + Math.round(C.ONE.CUT_OTHER * 100) + '% 가 당신에게, 당신 자신이면 ' + Math.round(C.ONE.CUT_SELF * 100) + '% 가 가장 가난한 사원에게. (' + C.ONE.HOURS + '시간)',
    '2': '당신은 하루 ' + C.TWO.OUT_DAY + '번 상담실 · 선녀탕에서 스스로 나온다. 하루 한 번, 오늘 여우비를 맞은 사원 한 명을 상담실 · 선녀탕에서 빼돌린다 — 그 사원이 이 금제의 대상이 된다. (가두리는 아니다)',
    '3': '어둠에서 생환하면 포인트 ' + C.THREE.PTS + '배 · 회수품 ' + C.THREE.LOOT + '배. 남에게 걸면 하루 ' + C.THREE.MIRROR_DAY + '번까지, 그 사원이 얻은 포인트와 회수품을 당신도 똑같이 받는다. (' + C.THREE.HOURS + '시간)',
    '4': '작은 여우 한 마리가 붙는다 — 죽는 길에 ☪️ · 기믹 파훼 1 · 즉사 회피 1(몸을 던진다). 여우를 잃으면 금제가 끝날 때까지 환각이 붙는다. (' + C.FOUR.HOURS + '시간)',
    '5': '남에게 걸면 어둠에서 죽게 될 때 당신의 모습으로 둔갑해 이어 간다 (즉사 회피 ' + C.FIVE.OTHER + '번). 당신 자신이면 하루 ' + C.FIVE.SELF_DAY + '번 목숨의 위협을 넘긴다. (' + C.FIVE.HOURS + '시간)'
};
function menu() {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    const rows = SEALS.map(function (S) {
        const k = S.k, at = whereIs(k);
        let st = '', btns = '';
        if (at) st = '⛓ ' + (at.code === me.code ? '당신' : nameOf(at.code) + ' 사원') + ' · ' + hoursLeft(at.until) + ' 남음';
        if (k === '0') {
            st = st || '오늘 남은 ' + Math.max(0, C.ZERO.DAY - used(me, 'z')) + ' / ' + C.ZERO.DAY;
            if (!whyNot('0', me)) btns = '<button class="game-btn hg-go" data-k="0" data-t="me" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + GOLD + '">건다</button>';
        } else if (k === '2') {
            st = (st ? st + ' · ' : '') + '탈출 ' + Math.max(0, C.TWO.OUT_DAY - used(me, 'out')) + ' / ' + C.TWO.OUT_DAY + ' · 빼돌리기 ' + Math.max(0, C.TWO.PULL_DAY - used(me, 'pull')) + ' / ' + C.TWO.PULL_DAY;
            btns = '<button class="game-btn hg-pull" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + GOLD + '">빼돌린다</button>';
        } else {
            if (!at) st = used(me, 'c' + k) ? '오늘은 이미 걸었다' : '걸 수 있다';
            if (!used(me, 'c' + k)) btns = '<button class="game-btn hg-go" data-k="' + k + '" data-t="me" style="flex:0 0 auto; margin:0; padding:7px 9px; font-size:10px;' + GOLD + '">본인</button>'
                + '<button class="game-btn hg-go" data-k="' + k + '" data-t="you" style="flex:0 0 auto; margin:0; padding:7px 9px; font-size:10px;' + GOLD + '">타인</button>';
        }
        return '<div style="display:flex; align-items:center; gap:6px; padding:9px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0;"><div style="font-size:11.5px; color:#ffe9cf;">⛓ ' + title(k) + ' <span style="color:#c9a27a;">· ' + S.spot + '</span></div>'
            + '<div style="font-size:9.5px; color:#a88d6a; margin-top:2px; line-height:1.55;">' + esc(DESC[k]) + '<br><span style="color:#e0b98a;">' + esc(st) + '</span></div></div>' + btns + '</div>';
    }).join('');
    const w = box(head(NAME, '엮은 꼬리털의 개수만큼 금제가 담겨 있다. 금제가 걸린 이는 지정된 자리에 사슬 모양의 표시가 떠오른다.')
        + rows
        + '<div style="padding:9px 0 2px; border-top:1px solid rgba(255,255,255,0.06); font-size:9.5px; color:#a88d6a; line-height:1.55;"><span style="font-size:11.5px; color:#ffe9cf;">⛓ ???</span><br>제 一 ~ 五 금제가 전부 한 사람에게 걸리면, 그 사원은 ' + C.ALL.HOURS + '시간 동안 제 零 금제를 쓴다.</div>'
        + '<button id="hg-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">닫는다</button>');
    w.querySelector('#hg-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.hg-go'), function (b) {
        b.onclick = function () {
            const k = b.dataset.k;
            if (b.dataset.t === 'me') { shut(); cast(k, u_()); }
            else askWho(k);
        };
    });
    const pb = w.querySelector('.hg-pull'); if (pb) pb.onclick = pullMenu;
}
window.hgMenu = menu;
function askWho(k) {
    const w = box(head('⛓ ' + title(k) + ' · ' + BY_K[k].spot, '누구에게 겁니까.')
        + '<input id="hg-who" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="사번 또는 이름" style="width:100%; padding:10px; font-size:13px; margin-bottom:10px; box-sizing:border-box;">'
        + '<button id="hg-ok" class="game-btn" style="' + BTN + GOLD + '">건다</button>'
        + '<button id="hg-no" class="game-btn" style="' + BTN + GREY + '">뒤로</button>');
    const f = w.querySelector('#hg-who');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 80);
    w.querySelector('#hg-no').onclick = menu;
    w.querySelector('#hg-ok').onclick = function () {
        const t = findUser(f.value);
        if (!t) { alert_('그 사원을 찾지 못했습니다.'); return; }
        if (t.code === u_().code) { alert_('본인은 「본인」으로 거십시오.'); return; }
        shut();
        cast(k, t);
    };
}
// 장착칸 단추
(function stickBtn() {
    const ID = 'hg-menu-btn';
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.getElementById(ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div'); if (!row) return;
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;' + GOLD;
        b.textContent = '🦊 금제';
        b.onclick = menu;
        row.appendChild(b);
    }
    wrap('renderInventory', function (_r) { return function () { const r = _r.apply(this, arguments); try { stick(); } catch (e) { } return r; }; });
    const iv = setInterval(function () {
        const el = document.getElementById('inventory-list-container');
        if (!el) return;
        clearInterval(iv);
        try { new MutationObserver(function () { try { stick(); } catch (e) { } }).observe(el, { childList: true }); } catch (e) { }
        stick();
    }, 400);
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 🌧 여우비 — 제 零 금제가 걸린 이가 탐사하는 어둠
// ==========================================
function rainOf(r) {
    if (!r) return null;
    if (r.isParty && r.partyId) {
        const p = parties()[r.partyId];
        const v = (p && p.hgRain && p.hgRain.by) ? p.hgRain : null;
        if (v) { if (r._hgLeft != null) v.left = Math.min(Number(v.left) || 0, r._hgLeft); r._hgRain = v; return v; }
    }
    return r._hgRain || null;
}
C.rainOf = function () { return rainOf(run()); };
function callRain() {
    const me = u_(), r = run();
    if (!me || !plain(r) || r._hgCalled || !zeroOf(me)) return;
    r._hgCalled = 1;
    const v = { by: me.code, n: me.name || me.code, left: C.ZERO.SAVES, cold: 0, at: now() };
    if (r.isParty && r.partyId) {
        const d = db_();
        if (d) { try { d.ref('darkParties/' + r.partyId + '/hgRain').transaction(function (c) { return (c && c.by) ? undefined : v; }).catch(function () { }); } catch (e) { } }
        if (!rainOf(r)) r._hgRain = v;
    } else r._hgRain = v;
    try { if (r.log) r.log.push('[🦊 여우비] 제 零 금제 — 여우비가 내린다'); } catch (e) { }
}
wrap('launchPartyRun', function (_l) { return function () { const out = _l.apply(this, arguments); try { callRain(); } catch (e) { } return out; }; });
wrap('startDarkRun', function (_s) { return function () { const out = _s.apply(this, arguments); try { callRain(); } catch (e) { } return out; }; });
// 탐사 중 — 비가 보이면 한 번 알리고 · 맞은 사원으로 적고 · 화면에 가늘게 내린다
setInterval(function () {
    try {
        const me = u_(), r = run();
        const R = window.FOXRAIN;
        if (!me || !plain(r)) { if (R && R.steadyOn()) R.steady(false); return; }
        if (!r._hgCalled && zeroOf(me) && !r._dead && !r._settled) callRain();           // 이어 하기로 돌아온 판 · 탐사 중에 걸린 금제
        const rain = rainOf(r);
        const host = document.getElementById('dark-run-overlay');
        if (R) R.steady(!!rain && !!host && host.style.display !== 'none', host);
        if (!rain || r._hgSeen) return;
        r._hgSeen = 1;
        const mine = rain.by === me.code;
        toast(mine ? '「 여우비가 내린다. 당신의 비다. 」' : '「 여우비가 내린다. 차갑지 않다. 」');
        if (!mine && !(me.hgRained && me.hgRained.d === today() && me.hgRained.by === rain.by)) { me.hgRained = { d: today(), by: rain.by }; save({ hgRained: 1 }); }
    } catch (e) { }
}, 1200);
// 사원이 걸어 준 판정 버프 (버프 물품의 판정 몫 · 호가호위 판정) — 여우비가 내리는 동안 주인은 받지 않는다
function givenBon(u) {
    const t = now(); let s = 0;
    (Array.isArray(u && u.itemBuffs) ? u.itemBuffs : []).forEach(function (b) { if (b && b.k === 'bon' && b.v > 0 && (b.run || (b.until || 0) > t)) s += b.v; });
    (Array.isArray(u && u.foxBuffs) ? u.foxBuffs : []).forEach(function (b) { if (b && b.k === 'roll' && b.v > 0 && (b.until || 0) > t) s += b.v; });
    return s;
}
wrap('rollDarkBonus', function (_r) {
    return function (kind) {
        let b = _r.apply(this, arguments);
        try {
            const me = u_(), r = run(), rain = plain(r) ? rainOf(r) : null;
            if (me && rain) {
                b = (Number(b) || 0) + C.ZERO.RAIN_BON;                              // 괴이의 판정 패널티 — 사원 쪽 판정에 얹는다
                if (rain.by === me.code) b += (Number(rain.cold) || 0) * C.ZERO.COLD - givenBon(me);
            }
        } catch (e) { }
        return b;
    };
});
// 구출 — 여우비가 내리는 동안 주인은 손을 뻗지 못한다
wrap('renderRescuePrompt', function (_p) {
    return function () {
        const out = _p.apply(this, arguments);
        try {
            const me = u_(), rain = plain(run()) ? rainOf(run()) : null;
            if (me && rain && rain.by === me.code) {
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body) {
                    Array.prototype.forEach.call(body.querySelectorAll('button'), function (b) {
                        if (String(b.getAttribute('onclick') || '').indexOf('attemptRescue') < 0) return;
                        b.disabled = true; b.textContent = '여우비 — 손을 뻗을 수 없다'; b.removeAttribute('onclick');
                    });
                    const el = document.createElement('div');
                    el.style.cssText = 'margin:0 0 9px 0; padding:8px 10px; border:1px dashed #c98a4a; border-radius:5px; font-size:11px; color:#e0b98a; line-height:1.6;';
                    el.textContent = '⛓ 제 零 금제 — 여우비가 내리는 동안 당신은 남을 구출하지 못합니다.';
                    const first = body.querySelector('button');
                    if (first && first.parentNode) { const holder = first.closest('div[style*="border"]') || first; holder.parentNode.insertBefore(el, holder); }
                }
            }
        } catch (e) { }
        return out;
    };
});

// ==========================================
// 죽음 — 여우비(사원) → 제 五 금제(둔갑) → 제 四 금제(작은 여우)
// ==========================================
function lineBox(t) { return '<span style="color:#f0c987;">' + t + '</span>'; }
function rainSave(me, r) {
    const rain = rainOf(r);
    if (!rain || rain.by === me.code || !((Number(rain.left) || 0) > 0)) return null;
    rain.left = (Number(rain.left) || 0) - 1; rain.cold = (Number(rain.cold) || 0) + 1;
    r._hgLeft = rain.left;
    if (r.isParty && r.partyId && db_()) {
        try {
            db_().ref('darkParties/' + r.partyId + '/hgRain').transaction(function (v) {
                if (!v || !v.by) return v;
                v.left = Math.max(0, (Number(v.left) || 0) - 1); v.cold = (Number(v.cold) || 0) + 1;
                return v;
            }).catch(function () { });
        } catch (e) { }
    }
    log_(me, '[' + NAME + '] 여우비가 죽음을 씻어 냈습니다. (' + (rain.n || nameOf(rain.by)) + ' 사원의 제 零 금제 · 남은 ' + rain.left + '회)');
    try { if (r.isParty && typeof sendPartyChat === 'function') sendPartyChat('🦊 여우비가 ' + (me.name || '') + ' 사원의 죽음을 씻어 냈습니다. (남은 ' + rain.left + '회)', true); } catch (e) { }
    return '「 빗줄기가 굵어진다. 닿으려던 것이 비에 씻겨 흘러내린다.<br>따뜻한 비다. 」';
}
function fiveSave(me) {
    const s = sealOf(me, '5');
    if (!s) return null;
    if (s.by === me.code) {
        if (!wears(me) || used(me, 's5') >= C.FIVE.SELF_DAY) return null;
        bump(me, 's5');
        log_(me, '[' + NAME + '] 제 五 금제 · 목 — 둔갑하여 목숨의 위협을 넘겼습니다. (오늘 남은 ' + (C.FIVE.SELF_DAY - used(me, 's5')) + '회)');
        save({ hgUse: 1, history: 1 });
        return '「 죽은 것은 허물이다. 당신은 벌써 다른 얼굴로 그 옆에 서 있다.<br>여우는 예로부터 둔갑의 귀재다. 」';
    }
    const n = (me.hgFive && me.hgFive.at === s.at) ? (Number(me.hgFive.used) || 0) : 0;
    if (n >= C.FIVE.OTHER) return null;
    me.hgFive = { at: s.at, used: n + 1 };
    const who = s.n || nameOf(s.by);
    log_(me, '[' + NAME + '] 제 五 금제 · 목 — ' + who + ' 사원의 모습으로 둔갑하여 탐사를 이어 갑니다.');
    save({ hgFive: 1, history: 1 });
    try { const r = run(); if (r && r.isParty && typeof sendPartyChat === 'function') sendPartyChat('🦊 ' + (me.name || '') + ' 사원이 쓰러진 자리에 ' + who + ' 사원의 모습이 서 있습니다.', true); } catch (e) { }
    return '「 목의 사슬이 조여든다. 쓰러진 것은 당신의 허물이다.<br>거울이 있다면 거기 비친 얼굴은 ' + esc(who) + ' 사원의 것이다. 」';
}
function foxSave(me) {
    const s = sealOf(me, '4');
    if (!s || foxState(me, s).dead) return null;
    me.hgFox = Object.assign({}, foxState(me, s), { at: s.at, dead: now() });
    log_(me, '[' + NAME + '] 제 四 금제 · 발목 — 작은 여우가 몸을 던져 당신을 대신했습니다. 여우를 잃었습니다.');
    save({ hgFox: 1, history: 1 });
    try { if (db_()) db_().ref('hgGrief/' + s.by).push({ c: me.code, n: me.name || me.code, at: now(), until: s.until }); } catch (e) { }
    try { const r = run(); if (r && r.isParty && typeof sendPartyChat === 'function') sendPartyChat('🦊 작은 여우가 ' + (me.name || '') + ' 사원을 대신해 몸을 던졌습니다.', true); } catch (e) { }
    return '「 발목께에서 작은 것이 튀어 나간다. 짧은 울음이 한 번.<br>당신은 서 있고, 작은 여우는 돌아오지 않는다. 」';
}
function saveMe() {
    const me = u_(), r = run();
    if (!me || !plain(r)) return null;
    return rainSave(me, r) || fiveSave(me) || foxSave(me);
}
wrap('darkDeath', function (_d) {
    return function (reasonText) {
        const r0 = run();
        try {
            if (r0 && !r0._dead) {
                const line = saveMe();
                if (line) {
                    r0.fail = Math.max(0, (Number(r0.fail) || 0) - 1);
                    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                    if (body && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                        body.innerHTML = darkBox('—', String(reasonText || '') + '<br><br>' + lineBox(line), darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                        try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                    }
                    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                    return;
                }
            }
        } catch (e) { console.warn('[호갑투] 죽음 건너뜀:', e && e.message); }
        return _d.apply(this, arguments);
    };
});

// ==========================================
// 제 四 금제 — 작은 여우: 죽는 길 ☪️ · 기믹 파훼 1
// ==========================================
function shared() { const r = run(); return !!(r && r.isParty && !r.solo && !r.taken && !r._a214Scattered); }
wrap('renderChoiceStep', function (_c) {
    return function (title_, text, options, imgKey) {
        try {
            const me = u_();
            if (me && plain(run()) && foxAlive(me) && Array.isArray(options) && options.length > 1 && String(text || '').indexOf('☪️') < 0) {
                if (!shared()) {
                    options = options.map(function (o, i) {
                        if (i === 0 || !o || String(o.label || '').indexOf('☪️') >= 0) return o;
                        return Object.assign({}, o, { label: '☪️ ' + o.label });
                    });
                }
                text = String(text || '') + '<br><br><span style="color:#f0c987;">「 작은 여우가 앞장선다. ☪️ 가 붙은 쪽에서는 꼬리를 내린다 — 죽는 길이다. 」</span>';
            }
        } catch (e) { }
        return _c.call(this, title_, text, options, imgKey);
    };
});
wrap('renderVoteState', function (_v) {
    return function () {
        const out = _v.apply(this, arguments);
        try {
            const me = u_();
            if (!me || !plain(run()) || !foxAlive(me)) return out;
            const area = document.getElementById('vote-area');
            if (!area) return out;
            const bs = area.querySelectorAll('button[onclick^="castVote"]');
            for (let i = 1; i < bs.length; i++) {
                if (bs[i].innerHTML.indexOf('☪️') >= 0 || bs[i].innerHTML.indexOf('🈲') >= 0) continue;
                bs[i].insertAdjacentHTML('afterbegin', '☪️ ');
            }
        } catch (e) { }
        return out;
    };
});
let noGim = false;
wrap('smashCharges', function (_s) {
    return function () {
        let n = _s.apply(this, arguments);
        try { const me = u_(); if (!noGim && me && !wOff() && !epicOn() && !kOn() && foxGim(me)) n += 1; } catch (e) { }
        return n;
    };
});
// 파훼를 썼다 — 다른 몫이 남아 있었으면 그것부터 쓴 것으로 친다 (여우의 몫은 맨 나중)
wrap('rubySmash', function (_r) {
    return function () {
        let mineOnly = false;
        try {
            const me = u_();
            if (me && foxGim(me) && typeof smashLeft === 'function') { noGim = true; const base = smashLeft(); noGim = false; mineOnly = base <= 0 && smashLeft() > 0; }
        } catch (e) { noGim = false; }
        const out = _r.apply(this, arguments);
        try {
            if (mineOnly) {
                const me = u_(), s = sealOf(me, '4');
                if (s) { me.hgFox = Object.assign({}, foxState(me, s), { at: s.at, gim: 1 }); log_(me, '[' + NAME + '] 제 四 금제 · 발목 — 작은 여우가 금제 주인에게서 받은 힘으로 기믹을 깨뜨렸습니다.'); save({ hgFox: 1, history: 1 }); }
            }
        } catch (e) { }
        return out;
    };
});

// ==========================================
// 제 三 금제 — 생환 포인트 2배 · 회수품 2배 · 주인도 똑같이
// ==========================================
function addReport(text) {
    try {
        const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
        if (!body) return;
        const el = document.createElement('div');
        el.style.cssText = 'margin-top:8px; padding:8px 10px; border:1px dashed #c98a4a; border-radius:5px; font-size:11px; color:#e0b98a;';
        el.textContent = text;
        const btn = body.querySelector('button');
        if (btn) btn.insertAdjacentElement('beforebegin', el); else body.appendChild(el);
    } catch (e) { }
}
wrap('renderDarkResult', function (_r) {
    return function () {
        const me = u_(), r0 = run();
        const log0 = (me && me.darkLogs && me.darkLogs.length) ? me.darkLogs[0] : null;
        let s3 = null;
        // 헬퍼(party-helper.js)는 포인트 · 회수품을 받지 않는다 — 금제의 몫도 없다
        try { if (me && plain(r0) && !(typeof window.iAmHelper === 'function' && window.iAmHelper())) s3 = sealOf(me, '3'); } catch (e) { }
        const out = _r.apply(this, arguments);
        try {
            if (!me || !s3) return out;
            const lg = (me.darkLogs || [])[0];
            if (!lg || lg === log0 || lg.died) return out;
            const base = Math.max(0, Number(lg.reward) || 0);
            const extra = Math.round(base * (C.THREE.PTS - 1));
            if (extra > 0) {
                try { if (typeof changePoints === 'function') changePoints(extra); else me.points = (Number(me.points) || 0) + extra; } catch (e) { me.points = (Number(me.points) || 0) + extra; }
                try { if (window.gearPtsMark) window.gearPtsMark('hg', C.THREE.PTS, extra); } catch (e) { }
                log_(me, '[' + NAME + '] 제 三 금제 · 이마 — 생환 포인트 ×' + C.THREE.PTS + ' (+' + extra.toLocaleString() + ' P)');
                save({ points: 1, history: 1 });
                addReport('⛓ 제 三 금제 · 이마 — 생환 포인트 ×' + C.THREE.PTS + ' (+' + extra.toLocaleString() + ' P) · 회수품 ×' + C.THREE.LOOT);
            }
            if (s3.by !== me.code) mirror(me, s3, base + extra, Array.isArray(lg.loot) ? lg.loot.slice() : [], lg.zone || '');
        } catch (e) { console.warn('[호갑투] 정산', e && e.message); }
        return out;
    };
}, false);
wrap('emLootMult', function (_e) {
    return function (user) {
        let m = Number(_e.apply(this, arguments)) || 1;
        try { const me = u_(); if (me && (!user || user.code === me.code) && plain(run()) && sealOf(me, '3')) { m *= C.THREE.LOOT; if (window.gearLootMark) window.gearLootMark('hg', C.THREE.LOOT); } } catch (e) { }
        return m;
    };
}, false);
// 주인도 똑같이 — 하루 MIRROR_DAY 번 (hgMirror/<주인>/<날> 을 세어 넘지 않게)
function mirror(me, s3, pts, loot, zone) {
    const d = db_();
    if (!d || (!pts && !loot.length)) return;
    d.ref('hgMirror/' + s3.by + '/' + today()).transaction(function (n) {
        n = Number(n) || 0;
        if (n >= C.THREE.MIRROR_DAY) return;
        return n + 1;
    }).then(function (res) {
        if (!res || !res.committed) return;
        const note = '[' + NAME + '] 제 三 금제 — ' + (me.name || me.code) + ' 사원의 생환 (' + zone + ')';
        if (pts > 0) { try { d.ref('payouts/' + s3.by).push({ amount: pts, note: note + ' +' + pts.toLocaleString() + ' P', at: now() }); } catch (e) { } }
        if (loot.length && typeof window.giftSendRaw === 'function') {
            const items = {}; loot.forEach(function (n) { items[n] = (items[n] || 0) + 1; });
            try { window.giftSendRaw([s3.by], { title: '⛓ 제 三 금제 · 이마', text: (me.name || me.code) + ' 사원이 어둠(' + zone + ')에서 가지고 나온 것과 똑같은 것입니다.', items: items, byName: NAME }); } catch (e) { }
        }
        log_(me, '[' + NAME + '] 제 三 금제 — 금제의 주인(' + (s3.n || nameOf(s3.by)) + ')도 똑같이 받았습니다. (' + pts.toLocaleString() + ' P' + (loot.length ? ' · 회수품 ' + loot.length + '개' : '') + ')');
        save({ history: 1 });
    }).catch(function () { });
}

// ==========================================
// 제 一 금제 — 공용시설 상한 150만 · 행운 300% · 번 몫 나누기
// ==========================================
window.slotCapOf = function (u) { return sealOf(u || u_(), '1') ? C.ONE.CAP : 0; };
wrap('facilityLuckMult', function (_f) {
    return function (user) {
        let m = _f.apply(this, arguments);
        try { const u = user || u_(); if (u && sealOf(u, '1')) m *= (1 + C.ONE.LUCK / 100); } catch (e) { }
        return m;
    };
});
// 건 돈 — 공용시설에 들어갈 때 적어 두고, 딴 돈이 들어올 때 뺀다 (수익 = 딴 돈 − 건 돈)
const FAC = { bet: 0, at: 0, sale: false };
wrap('useFacility', function (_u) {
    return function (bet) {
        const ok = _u.apply(this, arguments);
        try { if (ok) { FAC.bet = Math.max(0, Number(bet) || 0); FAC.at = now(); } } catch (e) { }
        return ok;
    };
});
// 소지품을 판 돈도 winPoints 로 들어온다 — 판 것은 바로 앞에서 물건이 빠지므로 그 순간만 표를 세운다
wrap('removeItemFromInventory', function (_r) {
    return function () {
        FAC.sale = true;
        try { Promise.resolve().then(function () { FAC.sale = false; }); } catch (e) { FAC.sale = false; }
        return _r.apply(this, arguments);
    };
});
function wealthOf(x, bank) {
    const b = bank ? bank[x.code] : null;
    const dep = b ? (Number(b.deposit) || 0) : 0, owe = (b && b.loan) ? (Number(b.loan.owe) || 0) : 0;
    return (Number(x.points) || 0) + dep - owe;
}
function poorest(exclude) {
    const book = users();
    const list = Object.keys(book).map(function (c) { return book[c]; }).filter(function (x) {
        if (!x || !x.code || !x.name || x.code === ADMIN || exclude.indexOf(x.code) >= 0) return false;
        return true;
    });
    const pick = function (bank) { list.sort(function (a, b) { return wealthOf(a, bank) - wealthOf(b, bank); }); return list[0] || null; };
    const d = db_();
    if (!d) return Promise.resolve(pick(null));
    return d.ref('bank').once('value').then(function (s) { return pick(s.val() || {}); }).catch(function () { return pick(null); });
}
wrap('winPoints', function (_w) {
    return function (amount) {
        let cut = 0, s1 = null;
        const me = u_();
        try {
            if (me && !FAC.sale && FAC.bet > 0 && now() - FAC.at < 20 * 60000) {
                s1 = sealOf(me, '1');
                const profit = Math.floor(Number(amount) || 0) - FAC.bet;
                FAC.bet = 0;                                                     // 한 판에 한 번
                if (s1 && profit > 0) cut = Math.floor(profit * (s1.by === me.code ? C.ONE.CUT_SELF : C.ONE.CUT_OTHER));
            }
        } catch (e) { cut = 0; }
        if (cut <= 0) return _w.apply(this, arguments);
        const out = _w.call(this, Math.floor(Number(amount) || 0) - cut);
        try {
            const d = db_();
            if (s1.by !== me.code) {
                if (d) d.ref('payouts/' + s1.by).push({ amount: cut, note: '[' + NAME + '] 제 一 금제 — ' + (me.name || me.code) + ' 사원의 공용시설 수익 ' + Math.round(C.ONE.CUT_OTHER * 100) + '% +' + cut.toLocaleString() + ' P', at: now() });
                log_(me, '[' + NAME + '] 제 一 금제 · 손목 — 공용시설 수익의 ' + Math.round(C.ONE.CUT_OTHER * 100) + '% (' + cut.toLocaleString() + ' P)가 금제의 주인(' + (s1.n || nameOf(s1.by)) + ')에게 귀속되었습니다.');
                save({ history: 1 });
            } else {
                poorest([me.code]).then(function (p) {
                    if (p && d) d.ref('payouts/' + p.code).push({ amount: cut, note: '[' + NAME + '] 제 一 금제 — 누군가의 기부 +' + cut.toLocaleString() + ' P', at: now() });
                    log_(me, '[' + NAME + '] 제 一 금제 · 손목 — 공용시설 수익의 ' + Math.round(C.ONE.CUT_SELF * 100) + '% (' + cut.toLocaleString() + ' P)를 ' + (p ? (p.name || p.code) + ' 사원에게' : '') + ' 기부했습니다.');
                    save({ history: 1 });
                });
            }
        } catch (e) { }
        return out;
    };
});

// ==========================================
// 제 二 금제 — 주인의 상담실 탈출 · 여우비를 맞은 사원 빼돌리기
// ==========================================
function quarantinedU(u) { return !!(u && Number(u.quarantineUntil) > now()); }
function roomName(u) { return (u.quarantineHospital ? '입원 · ' : '') + ((u.quarantineDest || 'fox') === 'bath' ? '선녀탕' : '상담실'); }
const ROOMS_UI = ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay', 'quarantine-pick-overlay', 'fox-loading-overlay'];
function selfOut() {
    const me = u_();
    if (!me || !wears(me) || !quarantinedU(me)) return;
    if (used(me, 'out') >= C.TWO.OUT_DAY) { alert_('제 二 금제 — 하루에 ' + C.TWO.OUT_DAY + '번입니다. 오늘은 다 나왔습니다.'); return; }
    const where = roomName(me);
    let out = Number(me.quarantineExitPollution) || 0;
    if (out >= 100) out = 99;
    me.quarantineUntil = 0; me.quarantineDest = null; me.quarantineHospital = null;
    me.pollution = out; me.quarantineExitPollution = 0; me.lastPollutionTime = now(); me.foxRoomAnswered = false;
    try { hasShownFoxAlert = false; } catch (e) { }
    if (me.badge && typeof me.badge.notes === 'string') {
        const arr = me.badge.notes.split(' | ').filter(function (n) { return n.trim() !== '' && n.indexOf('의식 불명') < 0 && n.indexOf('긴급 이송') < 0 && n.indexOf('사직 반려') < 0; });
        me.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    ROOMS_UI.forEach(function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    document.body.style.overflow = '';
    bump(me, 'out');
    log_(me, '[' + NAME + '] 제 二 금제 · 쇄골 — 상담이 필요하지 않습니다. ' + where + '에서 나왔습니다. (오염도 ' + out + '% · 오늘 남은 ' + (C.TWO.OUT_DAY - used(me, 'out')) + '회)');
    save({ quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1, pollution: 1, quarantineExitPollution: 1, lastPollutionTime: 1, foxRoomAnswered: 1, hgUse: 1, history: 1, badge: 1 });
    try { const b = document.getElementById('hg-out-btn'); if (b) b.remove(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('⛓ 제 二 금제 · 쇄골\n\n금제의 주인은 상담이 필요하지 않습니다.\n' + where + '에서 나왔습니다. (오염도 ' + out + '%)\n오늘 남은 ' + (C.TWO.OUT_DAY - used(me, 'out')) + '회');
}
setInterval(function () {
    try {
        const me = u_(), ID = 'hg-out-btn';
        const old = document.getElementById(ID);
        const left = me ? C.TWO.OUT_DAY - used(me, 'out') : 0;
        if (!me || !wears(me) || !quarantinedU(me) || left <= 0) { if (old) old.remove(); return; }
        const txt = '⛓ 제 二 금제 — 나온다 (' + left + ')';
        if (old) { if (old.textContent !== txt) old.textContent = txt; return; }
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:132px; z-index:99998; padding:11px 18px; font-size:12px; border-radius:22px; box-shadow:0 4px 14px rgba(0,0,0,0.5);' + GOLD;
        b.textContent = txt;
        b.onclick = selfOut;
        document.body.appendChild(b);
    } catch (e) { }
}, 2000);
// 빼돌리기 — 오늘 내 여우비를 맞았고, 지금 상담실 · 선녀탕에 있는 사원
function pullList() {
    const me = u_(), book = users();
    return Object.keys(book).filter(function (c) {
        const x = book[c];
        return x && c !== me.code && x.hgRained && x.hgRained.d === today() && x.hgRained.by === me.code && quarantinedU(x);
    }).sort(function (a, b) { return String(book[a].name || a).localeCompare(String(book[b].name || b), 'ko'); });
}
function pullMenu() {
    const me = u_();
    if (!me || !wears(me)) return;
    const left = C.TWO.PULL_DAY - used(me, 'pull');
    const book = users(), list = pullList();
    const rows = list.map(function (c) {
        const x = book[c];
        return '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0; font-size:11.5px; color:#ffe9cf;">' + esc(x.name || c) + ' <span style="font-size:9.5px; color:#a88d6a;">· ' + roomName(x) + ' · ' + hoursLeft(x.quarantineUntil) + '</span></div>'
            + '<button class="game-btn hg-pick" data-c="' + esc(c) + '"' + (left > 0 ? '' : ' disabled') + ' style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + GOLD + (left > 0 ? '' : ' opacity:.4;') + '">빼돌린다</button></div>';
    }).join('');
    const w = box(head('⛓ 제 二 금제 · 쇄골 — 빼돌리기', '오늘 당신의 여우비를 맞은 사원 가운데 지금 상담실 · 선녀탕에 있는 사원. 하루에 딱 한 번, 한 명만. (가두리는 아니다) · 오늘 남은 ' + Math.max(0, left) + ' / ' + C.TWO.PULL_DAY)
        + (rows || '<div style="font-size:10.5px; color:#a88d6a; padding:6px 0;">지금 빼돌릴 수 있는 사원이 없습니다.</div>')
        + '<button id="hg-b" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">뒤로</button>');
    w.querySelector('#hg-b').onclick = menu;
    Array.prototype.forEach.call(w.querySelectorAll('.hg-pick'), function (b) { b.onclick = function () { pull(b.dataset.c); }; });
}
function pull(code) {
    const me = u_(), d = db_(), x = users()[code];
    if (!me || !x || !wears(me)) return;
    if (used(me, 'pull') >= C.TWO.PULL_DAY) { alert_('빼돌리기는 하루에 딱 한 번입니다.'); return; }
    if (!quarantinedU(x) || !(x.hgRained && x.hgRained.d === today() && x.hgRained.by === me.code)) { alert_((x.name || code) + ' 사원은 지금 빼돌릴 수 없습니다.'); pullMenu(); return; }
    const where = roomName(x), t = now();
    const out = Math.min(C.TWO.OUT_POLL, Number(x.pollution) || 0);
    const obj = Object.assign({}, sealsOf(x)); obj.s2 = { by: me.code, n: me.name || me.code, at: t, until: t + C.TWO.HOURS * HOUR };
    const f = { quarantineUntil: 0, quarantineDest: null, quarantineHospital: false, quarantineExitPollution: 0, pollution: out, lastPollutionTime: t, foxRoomAnswered: false, hgSeals: obj, hasItemUsedOnMe: true };
    if (x.badge && typeof x.badge.notes === 'string') {
        const arr = x.badge.notes.split(' | ').filter(function (n) { return n.trim() !== '' && !/의식 불명|긴급 이송|사직 반려/.test(n); });
        f.badge = Object.assign({}, x.badge, { notes: arr.length ? arr.join(' | ') : '특이사항 없음' });
    }
    Object.keys(f).forEach(function (k) { x[k] = f[k]; });
    try { if (typeof updateUserFields === 'function') updateUserFields(code, f); } catch (e) { }
    if (d) { try { d.ref('hgPull/' + code).set({ by: me.code, n: me.name || me.code, at: t, was: where }); } catch (e) { } }
    bump(me, 'pull');
    log_(me, '[' + NAME + '] 제 二 금제 · 쇄골 — 눈속임으로 ' + (x.name || code) + ' 사원을 ' + where + '에서 빼돌렸습니다.');
    save({ hgUse: 1, history: 1 });
    shut();
    alert_('⛓ 제 二 금제 · 쇄골\n\n' + (x.name || code) + ' 사원을 ' + where + '에서 빼돌렸습니다. (오염도 ' + out + '%)\n그 사원에게 제 二 금제가 걸렸습니다.');
}
// 빼돌려진 사원 · 여우를 잃은 주인 — 글을 띄운다
(function watchMine() {
    let on = '';
    setInterval(function () {
        const me = u_(), d = db_();
        if (!me || !d || on === me.code) return;
        on = me.code;
        const code = me.code;
        try {
            d.ref('hgPull/' + code).on('value', function (s) {
                const v = s.val();
                if (!v || !u_() || u_().code !== code) return;
                try { d.ref('hgPull/' + code).remove(); } catch (e) { }
                ROOMS_UI.forEach(function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
                try { document.body.style.overflow = ''; } catch (e) { }
                log_(u_(), '[' + NAME + '] ' + (v.n || '') + ' 사원이 눈속임으로 ' + (v.was || '상담실') + '에서 빼돌려 주었습니다. (제 二 금제 · 쇄골)');
                save({ history: 1 });
                alert_('⛓ 제 二 금제 · 쇄골\n\n환술의 귀재가 누군가의 눈을 가렸습니다.\n' + (v.n || '') + ' 사원이 당신을 ' + (v.was || '상담실') + '에서 빼돌렸습니다.');
            });
            d.ref('hgGrief/' + code).on('child_added', function (s) {
                const v = s.val();
                try { s.ref.remove(); } catch (e) { }
                if (!v || !u_() || u_().code !== code) return;
                log_(u_(), '[' + NAME + '] 제 四 금제 — ' + (v.n || '') + ' 사원 곁의 작은 여우가 몸을 던졌습니다. 작은 여우를 잃었습니다.');
                save({ history: 1 });
                alert_('⛓ 제 四 금제 · 발목\n\n작은 여우가 돌아오지 않습니다.\n' + (v.n || '') + ' 사원을 대신해 몸을 던졌습니다.\n\n…');
            });
        } catch (e) { }
    }, 2500);
})();

// ==========================================
// 환각 — 작은 여우를 잃은 사원의 화면 (금제가 끝날 때까지)
// ==========================================
const WHISPER = ['…… 어디 갔니.', '작은 것이 돌아오지 않는다.', '발목이 차다.', '누가 대신 갔지.', '돌려줘.', '비가 그치지 않는다.', '뒤에.', '울음소리가 한 번 더.'];
(function halu() {
    const ID = 'hg-halu';
    function css() {
        if (document.getElementById('hg-halu-css')) return;
        const s = document.createElement('style');
        s.id = 'hg-halu-css';
        s.textContent = [
            '#hg-halu{position:fixed;inset:0;z-index:2147482000;pointer-events:none;overflow:hidden;}',   // 탐사 화면 · 창 위에도 (누르는 것은 막지 않는다)
            '#hg-halu .hv{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 44%,rgba(46,4,4,.5) 78%,rgba(8,0,0,.86) 100%);animation:hgPulse 6s ease-in-out infinite;}',
            '#hg-halu .he{position:absolute;width:46px;height:12px;opacity:0;animation:hgEye 4.6s ease-in-out 1;}',
            '#hg-halu .he:before,#hg-halu .he:after{content:"";position:absolute;top:0;width:13px;height:8px;border-radius:50%/65% 65% 35% 35%;',
            '  background:radial-gradient(ellipse,#fff2c4 0,#ff9a3a 42%,rgba(255,80,0,0) 78%);box-shadow:0 0 10px 3px rgba(255,120,30,.55);}',
            '#hg-halu .he:before{left:0}#hg-halu .he:after{right:0}',
            '#hg-halu .hw{position:absolute;font-size:12px;letter-spacing:3px;color:rgba(255,214,196,.9);text-shadow:0 0 8px rgba(255,50,30,.85);opacity:0;white-space:nowrap;',
            '  font-family:"Nanum Myeongjo","Noto Serif KR",serif;animation:hgWh 5.4s ease-in-out 1;}',
            '@keyframes hgPulse{0%,100%{opacity:.62}50%{opacity:1}}',
            '@keyframes hgEye{0%{opacity:0}18%{opacity:.95}30%{opacity:.1}38%{opacity:.95}80%{opacity:.85}100%{opacity:0}}',
            '@keyframes hgWh{0%{opacity:0;transform:translateY(4px)}25%{opacity:.85}70%{opacity:.7}100%{opacity:0;transform:translateY(-6px)}}'
        ].join('\n');
        document.head.appendChild(s);
    }
    let next = 0;
    setInterval(function () {
        try {
            const me = u_();
            let el = document.getElementById(ID);
            if (!me || !foxLost(me)) { if (el) el.remove(); return; }
            css();
            if (!el) { el = document.createElement('div'); el.id = ID; el.innerHTML = '<div class="hv"></div>'; document.body.appendChild(el); next = now() + 1500; }
            if (now() < next || document.hidden) return;
            next = now() + 3800 + Math.random() * 5200;
            const e = document.createElement('div');
            if (Math.random() < 0.5) {
                e.className = 'he';
                e.style.left = (4 + Math.random() * 80) + '%'; e.style.top = (8 + Math.random() * 78) + '%';
                e.style.transform = 'scale(' + (0.7 + Math.random() * 0.9) + ')';
            } else {
                e.className = 'hw';
                e.textContent = WHISPER[Math.floor(Math.random() * WHISPER.length)];
                e.style.left = (6 + Math.random() * 50) + '%'; e.style.top = (12 + Math.random() * 70) + '%';
            }
            el.appendChild(e);
            setTimeout(function () { try { e.remove(); } catch (x) { } }, 5600);
        } catch (e) { }
    }, 700);
})();

// ==========================================
// 사슬 표시 — 광장에서 금제가 걸린 자리 (칸 352×384 가운데 몸의 자리 · 그림은 왼쪽을 본다)
// ==========================================
const SPOT = { '0': [0.483, 0.586], '1': [0.381, 0.688], '2': [0.474, 0.534], '3': [0.460, 0.388], '4': [0.452, 0.885], '5': [0.480, 0.513] };
(function marks() {
    function css() {
        if (document.getElementById('hg-mark-css')) return;
        const s = document.createElement('style');
        s.id = 'hg-mark-css';
        s.textContent = [
            '.hg-marks{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3;}',
            '.hg-marks i{position:absolute;width:11px;height:4px;margin:-2px 0 0 -5.5px;transform:rotate(-14deg);',
            '  background:radial-gradient(circle at 2px 2px,rgba(0,0,0,0) .7px,#ffe2a0 1px,#e9b85a 1.9px,rgba(0,0,0,0) 2.2px) 0 0/3.6px 4px repeat-x;',
            '  filter:drop-shadow(0 0 2px rgba(255,190,80,.95)) drop-shadow(0 0 1px rgba(120,50,0,.9));animation:hgChain 2.8s ease-in-out infinite;}',
            '@keyframes hgChain{0%,100%{opacity:.72}50%{opacity:1}}'
        ].join('\n');
        document.head.appendChild(s);
    }
    function spotsOf(u) {
        const out = [];
        if (!u) return out;
        if (zeroOf(u)) out.push('0');
        ['1', '2', '3', '4', '5'].forEach(function (k) { if (sealOf(u, k)) out.push(k); });
        return out;
    }
    function paint(code, u) {
        let one = null;
        try { one = window.plazaOneOf(code); } catch (e) { one = null; }
        if (!one || !one.wrap) return;
        const ks = spotsOf(u);
        let el = one.wrap.querySelector(':scope > .hg-marks');
        if (!ks.length) { if (el) el.remove(); return; }
        const tiny = (function () { try { return !!(window.plazaTinyOf && window.plazaTinyOf(u)); } catch (e) { return false; } })();
        if (tiny) { if (el) el.remove(); return; }
        if (!el) { css(); el = document.createElement('div'); el.className = 'hg-marks'; one.wrap.appendChild(el); }
        const face = one.face || 1;
        const key = ks.join('') + ':' + face;
        if (el.dataset.k === key) return;
        el.dataset.k = key;
        // 그림은 왼쪽을 보고 그려져 있다 — 오른쪽을 볼 때는 자리도 좌우를 뒤집는다
        el.innerHTML = ks.map(function (k) { const p = SPOT[k]; const x = (face === FLIP ? 1 - p[0] : p[0]); return '<i style="left:' + (x * 100).toFixed(1) + '%;top:' + (p[1] * 100).toFixed(1) + '%"></i>'; }).join('');
    }
    const FLIP = -1;                                      // actor.facing() 이 -1 이면 오른쪽 — 칸 그림(.dot-box)을 좌우로 뒤집어 그린다
    setInterval(function () {
        try {
            if (typeof window.plazaOneOf !== 'function' || typeof window.plazaPeerCodes !== 'function') return;
            const me = u_(); if (!me) return;
            paint(me.code, me);
            const book = users();
            window.plazaPeerCodes().forEach(function (c) { paint(c, book[c]); });
        } catch (e) { }
    }, 350);
})();

// ==========================================
// 콘솔 — 상담사
// ==========================================
window.hgGive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = findUser(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(NAME);
    log_(t, '[' + NAME + '] 상담사가 지급했습니다.');
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + NAME + ' → ' + t.name, 'color:#4CAF50');
};
window.hgReset = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = who ? findUser(who) : me;
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    t.hgUse = { d: today() };
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { hgUse: t.hgUse }); } catch (e) { }
    try { if (db_()) db_().ref('hgMirror/' + t.code + '/' + today()).remove(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원의 오늘 금제 횟수를 되돌렸습니다.', 'color:#4CAF50');
};
window.hgState = function (who) {
    const u = who ? findUser(who) : u_();
    if (!u) { console.warn('사원을 못 찾았습니다.'); return null; }
    const out = { 사원: u.name, 장착: wears(u), 오늘: useOf(u), 零: zeroOf(u) ? hoursLeft(zeroOf(u).until) + ' 남음' + (zeroOf(u).grant ? ' (???)' : '') : '-' };
    ['1', '2', '3', '4', '5'].forEach(function (k) { const s = sealOf(u, k); out[BY_K[k].han] = s ? (s.n || s.by) + ' · ' + hoursLeft(s.until) + ' 남음' : '-'; });
    out.여우 = sealOf(u, '4') ? (foxLost(u) ? '잃음 (환각)' : '곁에 있음' + (foxGim(u) ? ' · 파훼 남음' : '')) : '-';
    out.여우비 = rainOf(run());
    console.log(out);
    return out;
};
C.cast = cast; C.menu = menu; C.pull = pull; C.selfOut = selfOut; C.pullList = pullList; C.badgeSync = badgeSync;
console.log('[🦊 호갑투] hgGive(사번) · hgState(사번) · hgReset(사번) · hgMenu()');
})();
