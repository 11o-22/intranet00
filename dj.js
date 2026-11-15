// ==========================================
// ★ 🎧 Disc Jockey — 상담사 지급형 커스텀 장비   (2026-11-15 사용자)
// bundles.json 마지막 묶음 — hogaptu.js 뒤 · gear-room.js 앞  (gear-cap.js 는 시계로 돌며 맨 바깥을 다시 감싼다)
// ==========================================
//
// ■ 사용자가 준 글 (그대로)
//
//   이름 : 🎧 Disc Jockey
//   주 기술 : 턴테이블리즘
//    1. 블렌딩 - 매 어둠마다 확정 구출 3 회 가능. 그 후로는 구출 다이스 보정.
//    2. 에코 아웃 - 매 어둠마다 4 명을 지목해 4번 즉사를 면하게 한다. 본인 또한 최대 4 회 죽음에서 벗어날 수 있다.
//    3. 리버스 플레이백 - 하루 한 번 가두리에서 나올 수 있다.
//    4. 톤 플레이 - 자신이 지정한 한 사람을 무조건적으로 살린다. (횟수 상관 없이.) 단, 하루 한 번 지정 후 타인을 지정하지 못한다.
//    5. 백스핀 - 하루 한 번 전 사원 중 랜덤으로 행운 200% 를 준다.
//    6. 더블링 - 음표가 장착자의 리듬을 탄다. 하루 한 번 리듬 게임 (곡 난이도 상관x) 하나를 완주 시 모든 어둠에서 보정 +3
//    7. 피치 라이딩 - 가두리에서 30분 이상 있을 시 나올 때 랜덤으로 우주 쇼핑몰의 아이템 하나를 들고 나온다.
//
//   물어서 정한 것 (같은 날)
//     에코 아웃   지목한 4명이 **저마다 4번씩** 즉사를 면한다 (모두 16번) · 본인은 따로 4번
//     톤 플레이   지정한 사람은 **장착자와 같은 어둠에 있을 때만** 무조건 산다
//     백스핀      공용시설 행운 200% (×3) · 24시간
//     피치 라이딩 값이 쌀수록 잘 나온다 (보물 찾기 상자와 같은 셈 — 1/√값) · 한정품은 뺀다
//
//   그 밖에 정한 것
//     블렌딩      확정 구출은 구조 화면에 칸을 하나 붙인다 (🌟 파군처럼). 셋을 다 쓰면 그 어둠에서 장착자가 하는 구출 판정 +3
//                 (구조 · B-330 구출 A/B) — 판정 보정이라 커스텀 장비 상한(+23) 안이다.
//     에코 아웃   지목은 어둠 안에서 — 위쪽 🎧 단추 (같은 방 사람 가운데 넷 · 본인은 따로). 그 어둠에서만 · 끝나면 방과 함께 사라진다.
//     톤 플레이   남만 지정한다 (본인은 에코 아웃 몫이 따로 있다). 그날은 바꾸지 못한다.
//     백스핀      상담사를 뺀 전 사원 가운데 무작위 (장착자 자신도 걸릴 수 있다). 받은 사원 화면에 알림.
//                 ★ 같은 날 사용자 「백스핀은 무작위 말고 지정으로 하자」 — 장착자가 사번 · 이름으로 고른다 (본인도 된다 · 상담사는 안 된다).
//     더블링      장착한 채로 리듬 게임 한 곡을 끝까지 치면 (듀얼 포함 · 난이도 상관없음) 그날 하루 모든 어둠(EPIC · K 의 방 포함)의 판정 보정 +3.
//                 「음표가 장착자의 리듬을 탄다」는 설명 글.
//                 ★ 같은 날 사용자 「그리고 더블링은 장착자 뿐만 아니라 모든 사원들 포함해줘. 같은 어둠에 들어간」
//                   켜진 장착자와 같은 어둠(같은 방 — 어둠 탐사 · EPIC · K 의 방)에 들어간 사원 모두 +3. 장착자가 여럿이어도 +3 한 번.
//                   받는 사원은 제 화면에서 같은 방의 장착자를 본다 (users/<장착자>/djUse.dbl · 장착자가 봉인 중이면 없다).
//     피치 라이딩 나올 때 차고 있어야 한다. 어떻게 나왔든(시간이 다 됨 · 리버스 플레이백 · 누가 풀어 줌) 30분 넘게 있었으면.
//     어둠        죽음 · 구출 기술은 어둠 탐사(피날레 포함) — EPIC · K 의 방 · 재난은 아니다 (🦊 호갑투와 같다).
//     꺼지는 때   이벤트 어둠 · 재앙의 장비 봉인 (WONDER_GEAR_OFF) — 다른 커스텀 장비와 같다.
//     가두리      본인이 스스로 나오는 것만 (커스텀 장비 규칙) · 여정 가두리의 처음 30분 잠김은 지킨다 · 격리에 딸린 가두리는 아니다.
//
// ■ 적히는 자리
//   users/<장착자>  djUse { d, tone, toneN, spin, spinN, rev, dbl } (그날 쓴 것) · djCage { at, until, seen } (가두리에 든 때 · 피치 라이딩)
//   users/<받은 이> djSpin { by, n, at, until } (백스핀) · djSpinSeen
//   darkParties/<방>/djEcho/<사번> = { by, n, left }   에코 아웃 지목 (그 어둠에서만)
//   darkRuns/<사번>/djN = { s, b }                     복귀해도 이어지게 — 본인 몫 · 확정 구출 쓴 수
//
// ■ 콘솔
//   djGive(사원)  상담사 — 하나 준다      djState(사원)      djReset(사원)  상담사 — 오늘 쓴 것을 되돌린다      djMenu()

window.DJ = {
    NAME: '🎧 Disc Jockey',
    BLEND: { SURE: 3, BON: 3 },
    ECHO: { PICK: 4, EACH: 4, SELF: 4 },
    SPIN: { HOURS: 24, LUCK: 200 },
    DBL: { BON: 3 },
    PITCH: { MIN: 30 }
};

(function discJockey() {
'use strict';
const C = window.DJ, NAME = C.NAME;
const ADMIN = 'kario0987', MOD = 'dj-modal', HOUR = 3600000;

// ==========================================
// 잡동사니
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function wOff(z) { try { return !!(window.WONDER_GEAR_OFF && window.WONDER_GEAR_OFF(z)); } catch (e) { return false; } }
function epicOn() { try { return typeof er !== 'undefined' && !!er; } catch (e) { return false; } }
function kOn() { try { return typeof window.kroomOn === 'function' && !!window.kroomOn(); } catch (e) { return false; } }
// 어둠 탐사인가 — EPIC · K 의 방 · 이벤트 어둠이 아닌 판
function plain(r) { return !!(r && !r.epic && !r.kroom && !epicOn() && !kOn() && !wOff(r.zone)); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function chat(t) { try { const r = run(); if (r && r.isParty && typeof sendPartyChat === 'function') sendPartyChat(t, true); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function now() { return Date.now(); }
function users() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function userOf(code) { const me = u_(); if (me && me.code === code) return me; return users()[code] || null; }
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; })); }
function sealed(u) { try { return !!(u && typeof window.calamSealed === 'function' && window.calamSealed(u)); } catch (e) { return false; } }
function parties() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
// 값이 없는 칸은 빼고 저장한다 — 하나라도 섞이면 전부 안 써진다 (null 은 지우는 것이라 넣는다)
function save(f) {
    const me = u_(); if (!me) return;
    const g = {};
    Object.keys(f).forEach(function (k) { if (me[k] !== undefined) g[k] = 1; });
    if (!Object.keys(g).length) return;
    try { if (typeof saveFields === 'function') saveFields(g); } catch (e) { }
}
function hoursLeft(until) { const m = Math.max(0, Number(until) - now()); return m >= HOUR ? (Math.round(m / 360000) / 10) + '시간' : Math.max(1, Math.ceil(m / 60000)) + '분'; }
function useOf(u) { const x = u && u.djUse; return (x && x.d === today()) ? x : { d: today() }; }
function setUse(u, k, v) { const x = Object.assign({}, useOf(u)); x[k] = v; u.djUse = x; }
// 지금 쓸 수 있나 (차고 있고 · 봉인 · 이벤트 어둠이 아니고)
function live(u) { return !!(u && wears(u) && !(u === u_() ? wOff() : sealed(u))); }
function findUser(v) {
    v = String(v || '').trim();
    if (!v) return null;
    const book = users();
    const c = Object.keys(book).filter(function (x) { const t = book[x] || {}; return String(t.no) === v || t.name === v; })[0];
    return c ? book[c] : null;
}
C.wears = wears; C.useOf = useOf;

// 함수 하나를 감싼다 — 다른 파일이 뒤에 다시 감싸도 한 번만 (gear-cap 표는 넘기지 않는다 — 맨 바깥을 다시 감싸게)
function wrap(name, make) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._dj) { clearInterval(iv); return; }
        const w = make(f);
        Object.keys(f).forEach(function (k) { if (!(k in w) && k !== '_gearCap') { try { w[k] = f[k]; } catch (e) { } } });
        w._dj = true;
        window[name] = w;
        clearInterval(iv);
    }, 450);
    setTimeout(function () { clearInterval(iv); }, 60000);
}

// ==========================================
// 물품 등록 · 장터 숨김 · 장착
// ==========================================
const DESC = '[장착] 주 기술 : 턴테이블리즘. 판 위의 소리를 섞고, 메아리를 남기고, 거꾸로 돌린다. 음표가 장착자의 리듬을 탄다.';
(function reg() {
    function put() {
        if (typeof ITEM_CATALOG === 'undefined') return false;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = { price: 0, usable: true, targetable: false, effect: 'equip_dj', noSell: true, desc: DESC };
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
            console.log('[🎧 DJ] ' + NAME + ' 등록 — 상담사 지급 전용');
        }
        return true;
    }
    if (put()) return;
    const iv = setInterval(function () { if (put()) clearInterval(iv); }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 어느 상점 후보에도 들어가지 않게
setInterval(function () {
    try { if (typeof ALIEN_ITEMS_POOL !== 'undefined') { const i = ALIEN_ITEMS_POOL.indexOf(NAME); if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1); } } catch (e) { }
}, 5000);
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
        if (sealed(me)) { alert_('장비가 봉인되어 있어 찰 수 없습니다.'); return; }
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
        alert_(NAME + '\n\n헤드폰을 씁니다. 판이 돌기 시작합니다.\n장착칸의 [🎧 DJ] 로 기술을 다룹니다.');
    };
});

// ==========================================
// 2 · 4 — 죽음을 넘긴다 (톤 플레이 → 에코 아웃 지목 → 에코 아웃 본인)
// ==========================================
function crewOf(p) {
    const o = {};
    ['members', 'alive', 'crew'].forEach(function (k) { Object.keys((p && p[k]) || {}).forEach(function (c) { o[c] = 1; }); });
    return Object.keys(o);
}
// 같은 어둠의 장착자 가운데 오늘 나를 톤 플레이로 지정한 사람
function toneBy(me, r) {
    if (!r || !r.isParty || !r.partyId) return null;
    const p = parties()[r.partyId];
    if (!p) return null;
    const c = crewOf(p).filter(function (x) {
        if (x === me.code) return false;
        const u = userOf(x);
        return !!(u && wears(u) && !sealed(u) && useOf(u).tone === me.code);
    })[0];
    return c || null;
}
function echoOf(r, code) {
    if (!r || !r.isParty || !r.partyId) return null;
    const p = parties()[r.partyId];
    const v = p && p.djEcho && p.djEcho[code];
    return (v && v.by) ? v : null;
}
function keepN(r) {
    try { const me = u_(), d = db_(); if (r && me && d) d.ref('darkRuns/' + me.code + '/djN').set({ s: r._djSelf || 0, b: r._djBlend || 0 }); } catch (e) { }
}
function toneSave(me, r) {
    const by = toneBy(me, r);
    if (!by) return null;
    const who = nameOf(by);
    log_(me, '[' + NAME + '] 톤 플레이 — ' + who + ' 사원이 지정한 사람이라 쓰러지지 않았습니다.');
    save({ history: 1 });
    chat('🎧 ' + who + ' 사원의 톤 플레이 — ' + (me.name || '') + ' 사원은 쓰러지지 않습니다.');
    return '「 귀에 익은 톤이 끼어든다. 쓰러지려던 박자가 그 소리에 다시 맞춰진다.<br>' + esc(who) + ' 사원이 고른 톤이다. 이 판에서 당신은 끊기지 않는다. 」';
}
function echoSave(me, r) {
    const v = echoOf(r, me.code);
    if (!v || !((Number(v.left) || 0) > 0)) return null;
    v.left = (Number(v.left) || 0) - 1;
    try {
        if (db_()) db_().ref('darkParties/' + r.partyId + '/djEcho/' + me.code).transaction(function (x) {
            if (!x || !x.by) return x;
            x.left = Math.max(0, (Number(x.left) || 0) - 1);
            return x;
        }).catch(function () { });
    } catch (e) { }
    const who = v.n || nameOf(v.by);
    log_(me, '[' + NAME + '] 에코 아웃 — ' + who + ' 사원의 메아리가 즉사를 넘겼습니다. (남은 ' + v.left + '회)');
    save({ history: 1 });
    chat('🎧 에코 아웃 — ' + (me.name || '') + ' 사원에게 메아리가 돌아왔습니다. (남은 ' + v.left + '회)');
    return '「 마지막 소리가 끝나지 않는다. 메아리가 몇 번이고 되돌아와 당신을 붙든다.<br>' + esc(who) + ' 사원이 남긴 메아리다. (남은 ' + v.left + '회) 」';
}
function selfSave(me, r) {
    if (!wears(me)) return null;
    const n = Number(r._djSelf) || 0;
    if (n >= C.ECHO.SELF) return null;
    r._djSelf = n + 1;
    keepN(r);
    const left = C.ECHO.SELF - r._djSelf;
    log_(me, '[' + NAME + '] 에코 아웃 — 스스로 죽음에서 벗어났습니다. (이 어둠 남은 ' + left + '회)');
    save({ history: 1 });
    chat('🎧 ' + (me.name || '') + ' 사원이 에코 아웃으로 빠져나왔습니다.');
    return '「 판이 멈추기 직전, 손끝이 페이더를 끌어올린다. 끊기던 소리가 다시 차오른다.<br>에코 아웃. (이 어둠 남은 ' + left + '회) 」';
}
function saveMe(r) {
    const me = u_();
    if (!me || !plain(r)) return null;
    return toneSave(me, r) || echoSave(me, r) || selfSave(me, r);
}
wrap('darkDeath', function (_d) {
    return function (reasonText) {
        const r0 = run();
        try {
            if (r0 && !r0._dead) {
                const line = saveMe(r0);
                if (line) {
                    r0.fail = Math.max(0, (Number(r0.fail) || 0) - 1);
                    // 구조 화면을 거쳐 왔으면 「살아 있는 사람」에서 빠져 있다 — 되돌려 적는다
                    try { const me = u_(); if (r0.isParty && r0.partyId && db_() && me) db_().ref('darkParties/' + r0.partyId + '/alive/' + me.code).set(true); } catch (e) { }
                    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                    if (body && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                        body.innerHTML = darkBox('—', String(reasonText || '') + '<br><br><span style="color:#9fe7ff;">' + line + '</span>', darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                        try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                    }
                    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                    return;
                }
            }
        } catch (e) { console.warn('[🎧 DJ] 죽음 건너뜀:', e && e.message); }
        return _d.apply(this, arguments);
    };
});

// ==========================================
// 2 — 에코 아웃 지목 (어둠 안 · 위쪽 🎧 단추)
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const NEON = ' background:linear-gradient(145deg,#1d4a6b,#0b1a2a) !important; border-color:#5fd0ff !important; color:#e6f8ff !important;';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#0d1622,#05080d); border:1px solid #3aa8d8; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; color:#e6f8ff;">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#9fe7ff; font-weight:bold; margin-bottom:4px;">' + t + '</div>'
        + (sub ? '<div style="font-size:10px; color:#7fa6bd; margin-bottom:11px; line-height:1.6;">' + sub + '</div>' : '');
}
function echoMenu() {
    const me = u_(), r = run();
    if (!me || !r || !r.isParty || !r.partyId) return;
    if (!live(me) || !plain(r)) { alert_('지금은 쓸 수 없습니다.'); return; }
    const p = parties()[r.partyId] || {};
    const ec = p.djEcho || {};
    const mine = Object.keys(ec).filter(function (c) { return ec[c] && ec[c].by === me.code; });
    const mem = crewOf(p).filter(function (c) { return c !== me.code; });
    const rows = mem.map(function (c) {
        const v = ec[c];
        const nm = (p.members && p.members[c] && p.members[c].name) || nameOf(c);
        let right = '';
        if (v && v.by === me.code) right = '<span style="font-size:10px; color:#9fe7ff;">🔊 남은 ' + (Number(v.left) || 0) + ' / ' + C.ECHO.EACH + '</span>';
        else if (v) right = '<span style="font-size:10px; color:#7fa6bd;">' + esc(v.n || nameOf(v.by)) + ' 사원이 지목함</span>';
        else if (mine.length < C.ECHO.PICK) right = '<button class="game-btn dj-eon" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + NEON + '">지목한다</button>';
        return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; font-size:11.5px;">' + (v ? '🔊 ' : '') + esc(nm) + '</div>' + right + '</div>';
    }).join('');
    const w = box(head('🎧 에코 아웃 — 이 어둠', '넷까지 지목한다. 지목한 사람은 저마다 즉사를 ' + C.ECHO.EACH + '번 면한다. 지목은 거두지 못한다. (' + mine.length + ' / ' + C.ECHO.PICK + ')<br>'
        + '당신 자신 — 이 어둠에서 남은 ' + Math.max(0, C.ECHO.SELF - (Number(r._djSelf) || 0)) + ' / ' + C.ECHO.SELF + '번')
        + (rows || '<div style="font-size:10.5px; color:#7fa6bd; padding:6px 0;">같은 방에 다른 사람이 없다.</div>')
        + '<button id="dj-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px; text-align:center;">닫는다</button>');
    w.querySelector('#dj-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.dj-eon'), function (b) { b.onclick = function () { echoSet(b.dataset.c); echoMenu(); }; });
}
function echoSet(code) {
    const me = u_(), r = run(); if (!me || !r || !r.partyId || !live(me) || !plain(r)) return;
    const p = parties()[r.partyId] || (parties()[r.partyId] = {});
    p.djEcho = p.djEcho || {};
    const mine = Object.keys(p.djEcho).filter(function (c) { return p.djEcho[c] && p.djEcho[c].by === me.code; });
    if (mine.length >= C.ECHO.PICK) { alert_('에코 아웃은 넷까지입니다.'); return; }
    if (p.djEcho[code]) return;
    const v = { by: me.code, n: me.name || me.code, left: C.ECHO.EACH, at: now() };
    p.djEcho[code] = v;
    try { if (db_()) db_().ref('darkParties/' + r.partyId + '/djEcho/' + code).transaction(function (x) { return (x && x.by) ? undefined : v; }).catch(function () { }); } catch (e) { }
    const nm = nameOf(code);
    log_(me, '[' + NAME + '] 에코 아웃 — ' + nm + ' 사원을 지목했습니다.');
    try { if (r.log) r.log.push('[🎧 에코 아웃] ' + nm + ' — 지목'); } catch (e) { }
    save({ history: 1 });
    chat('🎧 ' + (me.name || '') + ' 사원이 ' + nm + ' 사원에게 에코 아웃을 걸었습니다. (즉사 ' + C.ECHO.EACH + '번)');
}
window.djEcho = echoMenu;
(function echoBtn() {
    const ID = 'dj-echo-btn';
    setInterval(function () {
        try {
            const r = run(), me = u_();
            const old = document.getElementById(ID);
            const ok = r && r.isParty && r.partyId && me && live(me) && plain(r);
            if (!ok) { if (old) old.remove(); return; }
            if (old && old.isConnected) return;
            const role = document.getElementById('dro-role');
            const ov = document.getElementById('dark-run-overlay');
            if (!role || !role.parentElement || !ov || ov.style.display === 'none') return;
            const b = document.createElement('button');
            b.id = ID; b.title = '🎧 에코 아웃 — 이 어둠에서 지목한다';
            b.style.cssText = 'background:none; border:1px solid #3aa8d8; color:#cfefff; font-size:12px; padding:4px 8px; border-radius:4px; cursor:pointer;';
            b.textContent = '🎧';
            b.onclick = echoMenu;
            role.parentElement.insertBefore(b, role.nextSibling);
        } catch (e) { }
    }, 1500);
})();

// ==========================================
// 1 — 블렌딩: 확정 구출 (이 어둠 셋) · 그 뒤로는 구출 판정 +3
// ==========================================
let blendArgs = null;
function blendLeft(r) { return Math.max(0, C.BLEND.SURE - (Number(r && r._djBlend) || 0)); }
function blendOn(r) { const me = u_(); return !!(me && r && live(me) && plain(r)); }
wrap('renderRescuePrompt', function (_r) {
    return function (info, code) {
        const out = _r.apply(this, arguments);
        try {
            const r = run();
            if (blendOn(r) && code) {
                blendArgs = { info: info, code: code };
                const left = blendLeft(r);
                const html = left > 0
                    ? '<div id="dj-blend-box" style="border:1px solid #3aa8d8; border-radius:6px; padding:11px; margin-bottom:9px; background:rgba(95,208,255,0.06);">'
                        + '<div style="font-size:12px; color:#9fe7ff; font-weight:bold;">🎧 블렌딩</div>'
                        + '<div style="font-size:10px; color:#8fb3c7; margin:4px 0 8px 0;">흐려지는 소리를 내 판에 섞어 끌어온다 — 확정 구출 · 이 어둠 남은 ' + left + ' / ' + C.BLEND.SURE + '</div>'
                        + '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;' + NEON + '" onclick="djBlendGo(\'' + esc(code) + '\')">섞어 끌어온다</button></div>'
                    : '<div id="dj-blend-box" style="margin:0 0 9px 0; padding:8px 10px; border:1px dashed #3aa8d8; border-radius:5px; font-size:11px; color:#9fe7ff; line-height:1.6;">'
                        + '🎧 블렌딩 — 이 어둠의 확정 구출 ' + C.BLEND.SURE + '번을 다 썼습니다. 아래 구출 판정에 +' + C.BLEND.BON + '</div>';
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body && !body.querySelector('#dj-blend-box')) {
                    const b = Array.prototype.filter.call(body.querySelectorAll('button'), function (x) { return /보고만 있는다/.test(x.textContent || ''); })[0];
                    // 칸들(① ② ③) 앞에 — 맨 위 구조 글 바로 밑
                    const first = body.querySelector('div[style*="border:1px solid"]');
                    if (left <= 0 && first && first.parentNode) first.insertAdjacentHTML('beforebegin', html);
                    else if (b) b.insertAdjacentHTML('beforebegin', html);
                    else body.insertAdjacentHTML('beforeend', html);
                }
            }
        } catch (e) { }
        return out;
    };
});
window.djBlendGo = function (code) {
    const me = u_(), r = run();
    if (!me || !r || !code || !blendOn(r) || blendLeft(r) <= 0) return;
    r._djBlend = (Number(r._djBlend) || 0) + 1;
    keepN(r);
    const who = (blendArgs && blendArgs.code === code && blendArgs.info && blendArgs.info.name) || nameOf(code);
    r.success = (r.success || 0) + 1;
    try { if (db_()) db_().ref('darkParties/' + r.partyId + '/dying/' + code).remove(); } catch (e) { }
    try { if (typeof window.dokRescued === 'function') window.dokRescued('dark'); } catch (e) { }   // 🔥 도깨비 불 — 남을 구했다 (dokkaebi.js)
    chat((me.name || '') + ' 사원이 블렌딩으로 ' + who + ' 사원을 끌어냈습니다.');
    log_(me, '[' + NAME + '] 블렌딩 — ' + who + ' 사원 확정 구출 (이 어둠 남은 ' + blendLeft(r) + '회)');
    try { if (r.log) r.log.push('[🎧 블렌딩] ' + who + ' — 확정 구출'); } catch (e) { }
    save({ history: 1 });
    r._rescueShown = false;
    const next = r.isLeader ? darkChoiceBtn('계속 간다.', 'partyAdvance(' + (r.step + 1) + ')')
        : '<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...<br>'
          + '<button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(' + (r.step + 1) + ')">먼저 간다</button></div>';
    try {
        darkBodyEl().innerHTML = darkBox('구조 — 블렌딩',
            '흐려지던 윤곽의 소리를 당신의 판에 겹친다. 박자가 맞물리는 순간 페이더를 당긴다.<br><br>'
            + '<b style="color:#9fe7ff;">' + esc(who) + '</b> 사원의 소리가 당신 쪽 채널로 넘어왔다.<br>'
            + '<span style="font-size:11px; color:#8fb3c7;">이 어둠의 확정 구출 남은 ' + blendLeft(r) + ' / ' + C.BLEND.SURE + (blendLeft(r) ? '' : ' — 이제부터 구출 판정 +' + C.BLEND.BON) + '</span>', next);
        if (typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
};
// 다 쓴 뒤 — 장착자가 하는 구출 판정 +3 (구조 · B-330 구출 A/B). 도는 동안만 darkRun._djRescue 에 걸어 두고 rollDarkBonus 가 더한다
function rescueWrap(name) {
    wrap(name, function (f) {
        return function () {
            const r = run();
            let on = false;
            try { on = blendOn(r) && blendLeft(r) <= 0; } catch (e) { on = false; }
            if (!on) return f.apply(this, arguments);
            r._djRescue = C.BLEND.BON;
            try { if (r.log) r.log.push('[🎧 블렌딩] 구출 판정 +' + C.BLEND.BON); } catch (e) { }
            try { return f.apply(this, arguments); }
            finally { delete r._djRescue; }
        };
    });
}
rescueWrap('attemptRescue');
rescueWrap('b330DoRescue1');
rescueWrap('b330DoRescue2');

// ==========================================
// 6 — 더블링 (+ 블렌딩 구출 보정) — 판정 보정에 얹는다. 맨 바깥의 gear-cap 이 +23 으로 자른다
// ==========================================
function dblOn(me) { return !!(me && wears(me) && useOf(me).dbl); }
// 오늘 더블링을 켠 장착자가 나와 같은 어둠에 들어왔나 — 나 자신이면 내 사번 · 같은 방의 다른 사원이면 그 사번
function dblBy(me, r) {
    if (!me || !r) return null;
    if (dblOn(me)) return me.code;
    if (!r.isParty || !r.partyId) return null;
    const p = parties()[r.partyId];
    if (!p) return null;
    return crewOf(p).filter(function (c) { if (c === me.code) return false; const u = userOf(c); return !!(u && dblOn(u) && !sealed(u)); })[0] || null;
}
C.dblBy = function () { return dblBy(u_(), run()); };
wrap('rollDarkBonus', function (_r) {
    return function (kind) {
        let b = Number(_r.apply(this, arguments)) || 0;
        try {
            const me = u_(), r = run();
            if (r && r._djRescue) b += Number(r._djRescue) || 0;
            const by = r ? dblBy(me, r) : null;
            if (by && !wOff(r.zone) && (by !== me.code || !wOff())) b += C.DBL.BON;      // 내 것이면 내 봉인도 본다
        } catch (e) { }
        return b;
    };
});
// 리듬 게임이 한 곡을 끝까지 쳤을 때 부른다 (rhythm.js result · duelResult) — 화면에 띄울 한 줄을 돌려준다
window.djRhythmDone = function (info) {
    const me = u_();
    if (!me || !wears(me) || wOff()) return '';
    if (useOf(me).dbl) return '';
    setUse(me, 'dbl', now());
    const t = info && info.title ? '「' + info.title + '」 ' : '';
    log_(me, '[' + NAME + '] 더블링 — 리듬 게임 ' + t + '완주 · 오늘 나와 같은 어둠에 들어간 사원 모두 보정 +' + C.DBL.BON);
    save({ djUse: 1, history: 1 });
    return '🎧 더블링 — 음표가 리듬을 탔습니다 · 오늘 나와 같은 어둠에 들어간 사원 모두 보정 +' + C.DBL.BON;
};

// ==========================================
// 3 — 리버스 플레이백: 하루 한 번 가두리에서 나온다 (가두리 위 🎧 단추 · 갇힌 본인만)
// ==========================================
function cageOf(me) {
    if (!me) return null;
    const e = (typeof window.gaduriEntry === 'function') ? window.gaduriEntry(me.code) : null;
    return e || null;
}
function revOk(me) { const e = cageOf(me); return (e && !e.auto && live(me)) ? e : null; }   // 격리에 딸린 가두리는 격리가 풀려야 풀린다
window.djReverse = function () {
    const me = u_();
    const e = revOk(me);
    if (!e) { alert_('지금은 쓸 수 없습니다.'); return; }
    if (useOf(me).rev) { alert_('🎧 리버스 플레이백은 하루에 한 번입니다.\n\n오늘은 이미 썼습니다.'); return; }
    const lock = (typeof window.cageLockLeft === 'function') ? window.cageLockLeft(me.code) : -1;
    if (lock > 0) { alert_('🔒 여정 가두리는 처음 삼십 분 동안 어떠한 행위로도 나올 수 없습니다.\n\n' + lock + '분 남았습니다.'); return; }
    const rel = (typeof window.cageRelease === 'function') ? window.cageRelease(me.code)
        : (db_() ? db_().ref('gaduri/' + e.room + '/' + me.code).remove().then(function () { return true; }) : Promise.resolve(false));
    rel.then(function (ok) {
        if (!ok) { alert_('가두리 문을 열지 못했습니다.'); return; }
        setUse(me, 'rev', now());
        log_(me, '[' + NAME + '] 리버스 플레이백 — 판을 거꾸로 돌려 가두리에서 나왔습니다.');
        save({ djUse: 1, history: 1 });
        alert_('🎧 리버스 플레이백\n\n판을 거꾸로 돌립니다. 들어오던 길이 되감깁니다.\n가두리에서 나왔습니다. (오늘 몫을 썼습니다)');
        setTimeout(function () { try { pitchTick(); } catch (err) { } }, 600);
    });
};
setInterval(function () {
    try {
        const me = u_();
        const old = document.querySelector('.plaza-dj-btn');
        const e = revOk(me);
        const feed = document.querySelector('.plaza-feed-btn');
        if (!e || !feed || !feed.parentNode) { if (old) old.remove(); return; }
        let b = old;
        if (!b || b.parentNode !== feed.parentNode) {
            if (b) b.remove();
            b = document.createElement('div');
            b.className = 'plaza-spot plaza-dj-btn';
            b.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); });
            b.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); window.djReverse(); });
            feed.parentNode.appendChild(b);
        }
        // 📜 탄원서(먹이 자리) · 💎 진주 혀 피어싱(+54) 옆으로
        const left = (parseInt(feed.style.left, 10) || 0) + 54 * (document.querySelector('.plaza-tongue-btn') ? 2 : 1);
        if (b.style.left !== left + 'px') b.style.left = left + 'px';
        if (b.style.top !== feed.style.top) b.style.top = feed.style.top;
        const usedT = !!useOf(me).rev;
        const html = '<div class="b" style="width:38px;height:38px;font-size:18px;' + (usedT ? 'opacity:.4;' : '') + '">🎧</div><div class="t">' + (usedT ? '오늘 씀' : '리버스 플레이백') + '</div>';
        if (b.innerHTML !== html) b.innerHTML = html;
    } catch (e) { }
}, 1000);

// ==========================================
// 7 — 피치 라이딩: 가두리에 30분 넘게 있다 나오면 우주 쇼핑몰 물건 하나
// ==========================================
//   가두리에 든 때를 users/<사번>/djCage 에 적어 두고, 빠진 것을 보면 그동안 있었던 시간을 잰다.
//   화면이 꺼져 있던 사이에 빠졌으면 — 정해진 시간이 다 돼서 나온 것이면 그때까지, 아니면 마지막으로 본 때까지만 센다.
const PITCH_SKIP = ['황룡의 눈', '산군의 도움', '🪄 도깨비 방망이', '🫙 소원권', '여우구슬', '금고', '사직서', '🎫 기록 소실 티켓', '📝 사원명 변경권',
    '복사기', '정갈한 문패', '오색 신발끈', NAME];
function priceOf(n) {
    const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[n] : null;
    const p = c ? parseInt(c.price, 10) : NaN;
    return (isNaN(p) || p <= 0) ? 10000 : p;
}
function pitchPool(me) {
    const pool = [];
    try {
        (typeof ALIEN_ITEMS_POOL !== 'undefined' && Array.isArray(ALIEN_ITEMS_POOL) ? ALIEN_ITEMS_POOL : []).forEach(function (n) {
            if (pool.indexOf(n) >= 0 || PITCH_SKIP.indexOf(n) >= 0) return;
            if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[n]) return;
            pool.push(n);
        });
    } catch (e) { }
    // 쓸 수 있는 것(소속)이 있으면 그 안에서
    try {
        if (typeof canWearItem === 'function') {
            const f = pool.filter(function (n) { try { return canWearItem(me, n) !== false; } catch (e) { return true; } });
            if (f.length) return f;
        }
    } catch (e) { }
    return pool;
}
function pitchPick(me) {
    const pool = pitchPool(me);
    if (!pool.length) return null;
    const rows = pool.map(function (n) { return { n: n, w: 1 / Math.sqrt(priceOf(n)) }; });
    const tot = rows.reduce(function (a, r) { return a + r.w; }, 0);
    let q = Math.random() * tot;
    for (let i = 0; i < rows.length; i++) { q -= rows[i].w; if (q <= 0) return rows[i].n; }
    return rows[rows.length - 1].n;
}
C.pitchPool = pitchPool; C.pitchPick = pitchPick;
let pitchBusy = false;
function pitchTick() {
    const me = u_();
    if (!me || pitchBusy) return;
    const e = cageOf(me);
    const t = now();
    if (e) {
        const at = Number(e.at) || t;
        const c = me.djCage;
        if (!c || Number(c.at) !== at) { me.djCage = { at: at, until: Number(e.until) || 0, seen: t }; save({ djCage: 1 }); }
        else if (t - (Number(c.seen) || 0) > 60000) { c.seen = t; c.until = Number(e.until) || 0; save({ djCage: 1 }); }
        return;
    }
    const c = me.djCage;
    if (!c || !c.at) return;
    let end = t;
    if (t - (Number(c.seen) || 0) > 150000) end = (c.until && t >= c.until) ? Number(c.until) : Number(c.seen) || Number(c.at);
    const stay = end - Number(c.at);
    me.djCage = null;
    save({ djCage: 1 });
    if (stay < C.PITCH.MIN * 60000 || !wears(me) || wOff()) return;
    const n = pitchPick(me);
    if (!n) return;
    pitchBusy = true;
    try {
        if (!Array.isArray(me.inventory)) me.inventory = [];
        me.inventory.push(n);
        log_(me, '[' + NAME + '] 피치 라이딩 — 가두리에서 ' + Math.floor(stay / 60000) + '분을 버티고 나오며 「' + n + '」 을(를) 들고 나왔습니다.');
        save({ inventory: 1, history: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (err) { }
        alert_('🎧 피치 라이딩\n\n가두리에 갇혀 있는 동안 음정을 타고 어딘가에 다녀왔습니다.\n나오는 길에 무언가를 들고 있습니다.\n\n「' + n + '」');
    } finally { pitchBusy = false; }
}
setInterval(function () { try { pitchTick(); } catch (e) { } }, 2000);

// ==========================================
// 4 — 톤 플레이 지정 · 5 — 백스핀
// ==========================================
function toneSet(target) {
    const me = u_();
    if (!me || !live(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return false; }
    const u0 = useOf(me);
    if (u0.tone) { alert_('🎧 톤 플레이는 하루에 한 번 지정합니다.\n\n오늘은 ' + (u0.toneN || nameOf(u0.tone)) + ' 사원으로 정해져 있어 바꿀 수 없습니다.'); return false; }
    if (!target) { alert_('그 사원을 찾지 못했습니다.'); return false; }
    if (target.code === me.code) { alert_('톤 플레이는 남을 지정합니다.\n\n당신 자신은 에코 아웃으로 네 번 빠져나옵니다.'); return false; }
    if (target.code === ADMIN && me.code !== ADMIN) { alert_('상담사는 지정할 수 없습니다.'); return false; }
    setUse(me, 'tone', target.code);
    setUse(me, 'toneN', target.name || target.code);
    log_(me, '[' + NAME + '] 톤 플레이 — 오늘의 톤은 ' + (target.name || target.code) + ' 사원입니다.');
    save({ djUse: 1, history: 1 });
    alert_('🎧 톤 플레이\n\n오늘의 톤 — ' + (target.name || target.code) + ' 사원.\n당신과 같은 어둠에 있는 동안 이 사원은 쓰러지지 않습니다.\n\n오늘은 바꿀 수 없습니다.');
    return true;
}
function spinGo(target) {
    const me = u_();
    if (!me || !live(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    if (useOf(me).spin) { alert_('🎧 백스핀은 하루에 한 번입니다.\n\n오늘은 ' + (useOf(me).spinN || '') + ' 사원에게 돌아갔습니다.'); return; }
    if (!target || !target.code) { alert_('그 사원을 찾지 못했습니다.'); return; }
    if (target.code === ADMIN && me.code !== ADMIN) { alert_('상담사는 지정할 수 없습니다.'); return; }
    const book = users();
    const code = target.code;
    const t = now();
    const v = { by: me.code, n: me.name || me.code, at: t, until: t + C.SPIN.HOURS * HOUR };
    const tgt = userOf(code) || {};
    const tn = tgt.name || code;
    if (code === me.code) { me.djSpin = v; me.djSpinSeen = t; save({ djSpin: 1, djSpinSeen: 1 }); }
    else {
        try { if (book[code]) book[code].djSpin = v; } catch (e) { }
        try { if (typeof updateUserFields === 'function') updateUserFields(code, { djSpin: v }); else if (db_()) db_().ref('users/' + code + '/djSpin').set(v); } catch (e) { }
    }
    setUse(me, 'spin', code);
    setUse(me, 'spinN', tn);
    log_(me, '[' + NAME + '] 백스핀 — ' + tn + ' 사원에게 공용시설 행운 ' + C.SPIN.LUCK + '% (' + C.SPIN.HOURS + '시간)');
    save({ djUse: 1, history: 1 });
    alert_('🎧 백스핀\n\n판을 뒤로 감았다 놓습니다. 바늘을 내려놓은 자리 —\n\n' + tn + ' 사원' + (code === me.code ? ' (당신)' : '') + '\n공용시설 행운 ' + C.SPIN.LUCK + '% · ' + C.SPIN.HOURS + '시간');
}
function spinOf(u) { const s = u && u.djSpin; return (s && Number(s.until) > now()) ? s : null; }
C.spinOf = spinOf;
wrap('facilityLuckMult', function (_f) {
    return function (user) {
        let m = Number(_f.apply(this, arguments)) || 1;
        try { const u = user || u_(); if (spinOf(u)) m *= (1 + C.SPIN.LUCK / 100); } catch (e) { }
        return m;
    };
});
// 받은 사원 — 알림 한 번
setInterval(function () {
    try {
        const me = u_();
        const s = spinOf(me);
        if (!s || (Number(me.djSpinSeen) || 0) >= Number(s.at)) return;
        me.djSpinSeen = Number(s.at);
        save({ djSpinSeen: 1 });
        log_(me, '[' + NAME + '] 백스핀 — ' + (s.n || nameOf(s.by)) + ' 사원의 판이 멈춘 자리. 공용시설 행운 ' + C.SPIN.LUCK + '% (' + hoursLeft(s.until) + ')');
        save({ history: 1 });
        alert_('🎧 백스핀\n\n' + (s.n || nameOf(s.by)) + ' 사원이 판을 뒤로 감았다 놓았습니다.\n바늘이 멈춘 자리는 당신입니다.\n\n공용시설 행운 ' + C.SPIN.LUCK + '% · ' + hoursLeft(s.until));
    } catch (e) { }
}, 3000);

// ==========================================
// 장착칸의 [🎧 DJ] 단추 · 창
// ==========================================
const SKILLS = [
    { k: 'blend', n: '블렌딩', d: '매 어둠마다 확정 구출 ' + C.BLEND.SURE + '회 (구조 화면에 칸이 붙는다). 그 뒤로는 그 어둠에서 당신이 하는 구출 판정 +' + C.BLEND.BON + '.' },
    { k: 'echo', n: '에코 아웃', d: '매 어둠마다 ' + C.ECHO.PICK + '명을 지목해 저마다 즉사를 ' + C.ECHO.EACH + '번 면하게 한다 (어둠 안 위쪽 🎧 단추). 당신도 그 어둠에서 ' + C.ECHO.SELF + '번 죽음에서 벗어난다.' },
    { k: 'rev', n: '리버스 플레이백', d: '하루 한 번 가두리에서 나올 수 있다 (가두리 위 🎧 단추).' },
    { k: 'tone', n: '톤 플레이', d: '지정한 한 사람은 당신과 같은 어둠에 있는 동안 횟수 상관없이 쓰러지지 않는다. 하루 한 번 지정하면 다른 사람으로 바꾸지 못한다.' },
    { k: 'spin', n: '백스핀', d: '하루 한 번, 지정한 사원 한 명에게 공용시설 행운 ' + C.SPIN.LUCK + '% (' + C.SPIN.HOURS + '시간). 당신 자신도 된다.' },
    { k: 'dbl', n: '더블링', d: '음표가 장착자의 리듬을 탄다. 하루 한 번 리듬 게임 한 곡(난이도 상관없이)을 끝까지 치면 그날 모든 어둠에서 당신과 같은 어둠에 들어간 사원 모두 보정 +' + C.DBL.BON + '.' },
    { k: 'pitch', n: '피치 라이딩', d: '가두리에서 ' + C.PITCH.MIN + '분 넘게 있다가 나오면 우주 쇼핑몰의 물건 하나를 무작위로 들고 나온다.' }
];
function stat(k, me) {
    const x = useOf(me), r = run();
    if (k === 'blend') return (r && plain(r)) ? '이 어둠 — 확정 구출 남은 ' + blendLeft(r) + ' / ' + C.BLEND.SURE : '어둠 안에서 센다';
    if (k === 'echo') {
        if (!(r && plain(r))) return '어둠 안에서 지목한다';
        const p = r.isParty ? (parties()[r.partyId] || {}) : {}; const ec = p.djEcho || {};
        return '이 어둠 — 지목 ' + Object.keys(ec).filter(function (c) { return ec[c] && ec[c].by === me.code; }).length + ' / ' + C.ECHO.PICK + ' · 당신 남은 ' + Math.max(0, C.ECHO.SELF - (Number(r._djSelf) || 0)) + ' / ' + C.ECHO.SELF;
    }
    if (k === 'rev') return x.rev ? '오늘 썼다' : '오늘 남았다';
    if (k === 'tone') return x.tone ? '오늘의 톤 — ' + (x.toneN || nameOf(x.tone)) + ' 사원' : '오늘 아직 지정하지 않았다';
    if (k === 'spin') return x.spin ? '오늘 — ' + (x.spinN || nameOf(x.spin)) + ' 사원에게 돌아갔다' : '오늘 남았다';
    if (k === 'dbl') return x.dbl ? '오늘 켜졌다 — 같은 어둠의 사원 모두 보정 +' + C.DBL.BON : '오늘 아직 — 리듬 게임 한 곡을 끝까지';
    if (k === 'pitch') { const e = cageOf(me); return e ? '가두리 안 — ' + Math.floor((now() - (Number(e.at) || now())) / 60000) + '분째' : '가두리 밖'; }
    return '';
}
function menu() {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    const x = useOf(me);
    const off = wOff();
    const rows = SKILLS.map(function (S, i) {
        let btns = '';
        if (!off && S.k === 'tone' && !x.tone) btns = '<button class="game-btn dj-tone" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + NEON + '">지정한다</button>';
        if (!off && S.k === 'spin' && !x.spin) btns = '<button class="game-btn dj-spin" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + NEON + '">지정한다</button>';
        if (!off && S.k === 'echo' && run() && run().isParty && plain(run())) btns = '<button class="game-btn dj-echo" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + NEON + '">지목한다</button>';
        return '<div style="display:flex; align-items:center; gap:6px; padding:9px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0;"><div style="font-size:11.5px; color:#e6f8ff;">' + (i + 1) + '. ' + S.n + '</div>'
            + '<div style="font-size:9.5px; color:#7fa6bd; margin-top:2px; line-height:1.55;">' + esc(S.d) + '<br><span style="color:#9fe7ff;">' + esc(stat(S.k, me)) + '</span></div></div>' + btns + '</div>';
    }).join('');
    const w = box(head(NAME, '주 기술 : 턴테이블리즘' + (off ? '<br><span style="color:#ff9f8a;">지금은 장비가 듣지 않습니다 (이벤트 어둠 · 봉인).</span>' : ''))
        + rows
        + '<button id="dj-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">닫는다</button>');
    w.querySelector('#dj-x').onclick = shut;
    const tb = w.querySelector('.dj-tone'); if (tb) tb.onclick = askTone;
    const sb = w.querySelector('.dj-spin'); if (sb) sb.onclick = askSpin;
    const eb = w.querySelector('.dj-echo'); if (eb) eb.onclick = echoMenu;
}
window.djMenu = menu;
function askTone() {
    const w = box(head('🎧 톤 플레이', '오늘의 톤으로 누구를 지정합니까. 당신과 같은 어둠에 있는 동안 이 사원은 쓰러지지 않습니다.<br>하루 한 번 — 지정하면 오늘은 바꾸지 못합니다.')
        + '<input id="dj-who" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="사번 또는 이름" style="width:100%; padding:10px; font-size:13px; margin-bottom:10px; box-sizing:border-box;">'
        + '<button id="dj-ok" class="game-btn" style="' + BTN + NEON + '">지정한다</button>'
        + '<button id="dj-no" class="game-btn" style="' + BTN + GREY + '">뒤로</button>');
    const f = w.querySelector('#dj-who');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 80);
    w.querySelector('#dj-no').onclick = menu;
    w.querySelector('#dj-ok').onclick = function () {
        const t = findUser(f.value);
        if (!t) { alert_('그 사원을 찾지 못했습니다.'); return; }
        shut();
        toneSet(t);
    };
}
function askSpin() {
    const w = box(head('🎧 백스핀', '누구에게 바늘을 내려놓습니까. 그 사원은 ' + C.SPIN.HOURS + '시간 동안 공용시설 행운 ' + C.SPIN.LUCK + '%. 당신 자신도 됩니다.<br>하루 한 번.')
        + '<input id="dj-who" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="사번 또는 이름" style="width:100%; padding:10px; font-size:13px; margin-bottom:10px; box-sizing:border-box;">'
        + '<button id="dj-ok" class="game-btn" style="' + BTN + NEON + '">지정한다</button>'
        + '<button id="dj-no" class="game-btn" style="' + BTN + GREY + '">뒤로</button>');
    const f = w.querySelector('#dj-who');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 80);
    w.querySelector('#dj-no').onclick = menu;
    w.querySelector('#dj-ok').onclick = function () {
        const t = findUser(f.value);
        if (!t) { alert_('그 사원을 찾지 못했습니다.'); return; }
        shut();
        spinGo(t);
    };
}
// 장착칸 단추
(function stickBtn() {
    const ID = 'dj-menu-btn';
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
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;' + NEON;
        b.textContent = '🎧 DJ';
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
// 복귀 — 본인 몫 · 확정 구출 쓴 수는 darkRun 에만 있어서, 나갔다 돌아오면(복귀) 새 darkRun 에는 없다
// ==========================================
wrap('acceptDarkResume', function (_a) {
    return function () {
        let n = null;
        try { n = window._pendingResume && window._pendingResume.djN; } catch (e) { }
        const out = _a.apply(this, arguments);
        try { const r = run(); if (r && n) { r._djSelf = Number(n.s) || 0; r._djBlend = Number(n.b) || 0; } } catch (e) { }
        return out;
    };
});

// ==========================================
// 상담사 · 확인
// ==========================================
function find(who) { const t = findUser(who); return t || users()[String(who || '')] || null; }
window.djGive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다 (이름 · 사번).'); return; }
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' 지급');
    try { if (t === me) save({ inventory: 1, history: 1 }); else if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' 를 줬습니다.', 'color:#4CAF50');
};
window.djReset = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = who ? find(who) : me;
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    t.djUse = { d: today() };
    try { if (t === me) save({ djUse: 1 }); else if (typeof updateUserFields === 'function') updateUserFields(t.code, { djUse: t.djUse }); } catch (e) { }
    console.log('%c✓ ' + t.name + ' — 오늘 쓴 것을 되돌렸습니다.', 'color:#4CAF50');
};
window.djState = function (who) {
    const t = who ? find(who) : u_();
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const x = useOf(t), r = run();
    console.log('%c===== ' + NAME + ' — ' + (t.name || t.code) + ' =====', 'color:#9fe7ff; font-size:13px');
    console.log('  차고 있나', wears(t), '· 봉인', sealed(t), '· 지금 꺼짐(이벤트 · 봉인)', t === u_() ? wOff() : sealed(t));
    console.log('  오늘', x);
    console.log('  백스핀 받은 것', spinOf(t), '· 가두리', t === u_() ? cageOf(t) : '-', '· djCage', t.djCage || null);
    if (r && t === u_()) console.log('  이 어둠 — 확정 구출 쓴 수', r._djBlend || 0, '· 본인 에코 아웃', r._djSelf || 0, '· 지목', (parties()[r.partyId] || {}).djEcho || {});
    console.log('  연결:', ['darkDeath', 'renderRescuePrompt', 'attemptRescue', 'rollDarkBonus', 'facilityLuckMult', 'useInventoryItem', 'acceptDarkResume'].map(function (n) { return n + ' ' + ((typeof window[n] === 'function' && window[n]._dj) ? 'O' : '✗'); }).join(' · '));
};

console.log('[🎧 DJ] djGive(사원) · djState(사원) · djReset(사원) · djMenu()');
})();
