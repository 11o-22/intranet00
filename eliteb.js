// ==========================================
// ★ 🐺 （구） 정예 B조 ■■ — 상담사 지급 전용 커스텀 장비 (2026-10-29)
// bundles.json 마지막 묶음 — babyfox.js · gear-cap.js 뒤 (맨 끝쪽)
// ==========================================
//
// ■ 무엇인가
//
//   장착품이다. 어둠 탐사에서 **조장**(장착자)이 이끄는 조의 장비다. 은심장 · 호사수구 · 아기 여우와 같은 결 —
//   상점 · 우주 쇼핑몰 · 장터 어디에도 안 깔리고 팔 수 없다. 주는 법은 ebGive(사번) 과 당국 화면의 「물품 강제 꽂기」뿐.
//
//   『 🐺 (구) 정예 B조 ■■ 』
//     어둠 탐사 생환 포인트 1.5배 · 회수품 확률 2배.
//     정예조 가면을 쓴 조원은 생환 포인트 배율이 0.5 씩 오른다(×1.5).
//     **전원 생환**하면 조장 3배 · 정예조 조원 2배 · 일반 조원 1.5배.  (상한 ⚖ ×3 — gear-cap.js 안에서)
//
//   조원 — 같은 방(파티)으로 들어간 사람. 조장 = 이 장비를 찬 사람(방에 하나뿐이어야 한다 · 둘이면 먼저 적은 쪽).
//     정예조 조원 = 조장이 가면을 씌워 준 두 사람.  일반 조원 = 그 밖의 사람.
//
//   1. 정예조 가면 — 쓰면 「True or Fake」. 기믹 선택지에 안전한 쪽(True ◈)이 표시되고, 즉사 선택지가 있는 장면에서는 그쪽(Fake ✖)도.
//      기믹을 **어둠 한 판에 2회** 파훼한다(작두처럼 성공 +2 · 보정 +1 · 다음 장면 · 횟수는 darkRun 에 — 2026-10-28 하루 2회에서 바꿈). 쓴 사람은 판정 **+2** (매뉴얼의 역할 보정과 따로).
//      조장이 **정예조 조원을 구출**할 때(구조 · B-330 구출A/B) 구출 판정에 **+1~3 무작위** — 확정 구출이 아니다 (2026-10-28 사용자).
//      누구에게 씌울지는 **어둠 안에서** 고른다 — 탐사 중 위쪽 🎭 단추(조장만) → 같은 방 사람 가운데 둘까지. 그 탐사에서만 — 끝나면 없어진다.
//      (2026-10-29 사용자: 안에서 씌운 것이 밖에 남아 다음 어둠에 겹쳐 씌워지던 것 → 가면은 방(eliteB.masks)에만 두고 사원에는 안 적는다)
//   2. 어둠 탐사 매뉴얼 — 판정 보정: 조장 +3~5 · 정예조 조원 +2~4 · 일반 조원 +1~3 (굴릴 때마다 그 사이에서 무작위 · 조장이 같은 방에 있을 때).
//   3. 가죽 반장갑 — 공용시설 행운 +300% · 공용시설 횟수 +3~8 (날마다 무작위 · 그날 자정까지 · 상한 안에서).
//   4. 카세트테이프 — 함께 탐사를 갔던 사람이 상담실 · 선녀탕에 있으면 풀어 준다. 사람마다 하루 한 번.
//   5. 금촉 만년필 — 다인 탐사를 **둘이서** 간다(조장의 방 · 최소 인원 2). 동행인의 각인(전용 장비 속성) 가운데 하나를
//      무작위로 복사한 늑대를 **세 마리까지** 데려간다 — 늑대는 그 속성의 아기 여우 분신처럼 움직인다(babyfox.js 가 늑대도 본다).
//
// ■ 적히는 자리
//   (u.ebMasks · u.ebMask — 예전 자리. 이제 안 쓴다 · 가면은 방에만)
//   u.ebGlove  = 'YYYY-MM-DD'                 오늘 반장갑 몫을 받았나
//   u.ebMates  = { <사번>: at }               함께 탐사한 사람 (카세트테이프 대상)
//   u.ebTape   = { d, used: { <사번>: 1 } }   오늘 풀어 준 사람
//   u.ebWolves = 0~3                          데려갈 늑대 수
//   darkParties/<방>/eliteB = { lead, leadName, crew: { <사번>: 1 }(출발 때 인원), masks: { <사번>: 1 }, dead: { <사번>: 1 } }
//     전원 생환은 crew 로 센다 — members 는 먼저 귀환한 사람부터 빠져서(partyRunCleanup) 정산 때 둘 미만이 되곤 했다 (2026-10-29)
//     ★ 조장이 조원에게 가면을 씌웠으면(masks 가 하나라도) 조장은 전원 생환이 아니어도 ×3 (2026-10-29 사용자)
//
// ■ 콘솔
//   ebGive(사번)   상담사 — 준다      ebState()   지금 상태      ebMenu()   창
window.EB = window.EB || {
    NAME: '🐺 （구） 정예 B조 ■■',          // ★ 괄호는 전각 — 장비 이름에 「 (」가 들면 getEquipBaseName 이 그 앞까지만 이름으로 본다 (index.html:1898)
    MASK_MAX: 2, MASK_BON: 2, BREAK_MAX: 2, RESCUE_BON: [1, 3], WOLF_MAX: 3,   // MASK_BON 가면 판정 보정(고정) · BREAK_MAX 한 판 파훼 · RESCUE_BON 조장→정예조 구출 보정
    PTS: { lead: 1.5, elite: 1.5, member: 1.0 },
    PTS_ALL: { lead: 3.0, elite: 2.0, member: 1.5 },
    LOOT: 2,
    BON: { lead: [3, 5], elite: [2, 4], member: [1, 3] },
    GLOVE_PCT: 300, GLOVE_FAC: [3, 8],
    PEN_MIN: 2
};

(function eliteB() {
'use strict';
const C = window.EB;
const NAME = C.NAME;
const ADMIN = 'kario0987';
const MOD = 'eb-modal';
const PARTS = [
    { k: 'mask',   n: '정예조 가면',   i: '🎭', d: '쓰면 「True or Fake」 — 기믹의 안전한 쪽이 보이고, 어둠 한 판에 2회 기믹을 파훼하며, 판정 +2. 조장이 어둠 안에서 조원 둘에게 씌워 주고(그 탐사에서만), 조장이 그 조원을 구출할 때 구출 판정 +1~3.' },
    { k: 'manual', n: '어둠 탐사 매뉴얼', i: '📘', d: '판정 보정 — 조장 +3~5 · 정예조 조원 +2~4 · 일반 조원 +1~3. 조장이 같은 방에 있을 때.' },
    { k: 'glove',  n: '가죽 반장갑',   i: '🧤', d: '공용시설 행운 +300% · 공용시설 횟수 +3~8 (날마다 무작위).' },
    { k: 'tape',   n: '카세트테이프',  i: '📼', d: '함께 탐사를 갔던 사람이 상담실 · 선녀탕에 있으면 풀어 준다. 사람마다 하루 한 번.' },
    { k: 'pen',    n: '금촉 만년필',   i: '🖋', d: '다인 탐사를 둘이서 간다. 동행인의 각인 하나를 복사한 늑대를 세 마리까지 데려간다.' }
];
// 즉사가 정해진 선택지 — fn → arg (True or Fake 의 Fake 표)
const DEADLY = { a667G8R: ['stay'] };

// ==========================================
// 잡동사니
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function users() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function userOf(code) { const me = u_(); if (me && me.code === code) return me; return users()[code] || null; }
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; })); }
window.ebWears = wears;
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function parties() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
function myParty() { try { return (typeof getMyParty === 'function') ? getMyParty() : null; } catch (e) { return null; } }

// ==========================================
// 역할 — 지금 탐사(또는 방)에서 나는 누구인가
// ==========================================
//   darkParties/<방>/eliteB 를 본다. 혼자 가는 장착자는 그대로 조장.
//   ★ 본 것은 darkRun._ebCache 에 들고 있는다 — 정산(renderDarkResult) 때 방이 이미 지워졌어도 역할·전원 생환을 셀 수 있게.
function ebOf(pid) {
    const p = parties()[pid], r = run();
    const e = (p && p.eliteB && typeof p.eliteB === 'object') ? p.eliteB : null;
    if (r && r.partyId === pid) {
        if (e) r._ebCache = e;
        else if (r._ebCache) return r._ebCache;
    }
    return e;
}
function crewOf(p) { const o = {}; Object.keys((p && p.members) || {}).forEach(function (c) { o[c] = 1; }); return o; }
function roleIn(code, pid) {
    const e = ebOf(pid);
    if (!e || !e.lead) return null;
    if (e.lead === code) return 'lead';
    if (e.masks && e.masks[code]) return 'elite';
    return 'member';
}
// 내 역할 — 탐사 중 (파티면 방의 eliteB · 혼자면 차고 있으면 조장)
function myRole() {
    const me = u_(), r = run();
    if (!me || !r) return null;
    if (r.isParty && r.partyId) {
        const role = roleIn(me.code, r.partyId);
        if (role) return role;
        return null;
    }
    return wears(me) ? 'lead' : null;
}
function leadAlive(pid) {
    const e = ebOf(pid); if (!e || !e.lead) return false;
    return !(e.dead && e.dead[e.lead]);
}
// 가면을 쓴 사람인가 (조장은 늘 쓴 셈)
function masked() { const role = myRole(); return role === 'lead' || role === 'elite'; }
window.ebRole = myRole;

// ==========================================
// 물품 등록 · 장터 숨김 · 장착
// ==========================================
//   ★ 바로 등록한다 — 시계(400ms)로 미루면 그 사이에 자동 로그인이 소지품 칸을 먼저 그려
//     「알 수 없는 물품입니다 · 정가 -」 로 뜨고, 깜박임 막기(norepaint2.js)가 그 뒤의 다시
//     그리기를 건너뛰어 그대로 남는다 (2026-10-28 · 실제로 그렇게 떴다). ITEM_CATALOG 는
//     index.html 이 묶음보다 먼저 만들어 두므로 이 줄이 돌 때 이미 있다.
//     이미 그 이름으로 그려진 칸이 있으면 그 자리에서 한 번 다시 그린다.
(function reg() {
    function put() {
        if (typeof ITEM_CATALOG === 'undefined') return false;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = {
                price: 0, usable: true, targetable: false, effect: 'equip_eliteb', noSell: true,
                desc: '[장착] 정예 B조의 장비. 생환 포인트 1.5배 · 회수품 2배. 가면을 쓴 조원은 배율이 오르고, 전원 생환하면 조장 3배 · 정예조 2배 · 일반 1.5배. '
                    + '정예조 가면 · 어둠 탐사 매뉴얼 · 가죽 반장갑 · 카세트테이프 · 금촉 만년필이 딸려 있다.'
            };
            if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
            console.log('[정예 B조] ' + NAME + ' 등록 — 상담사 지급 전용');
            repaint();
        }
        return true;
    }
    // 등록 전에 그려진 소지품 칸 — 「알 수 없는 물품」 으로 남아 있으면 손으로 부른 셈 치고 다시 그린다
    function repaint() {
        try {
            const box = document.getElementById('inventory-list-container');
            if (!box || !box.childNodes.length) return;
            if (String(box.textContent || '').indexOf(NAME) < 0) return;
            if (typeof currentUser === 'undefined' || !currentUser || typeof renderInventory !== 'function') return;
            renderInventory();
            console.log('[정예 B조] 등록 전에 그려진 소지품 칸을 다시 그렸습니다');
        } catch (e) { }
    }
    window.ebRegister = put;
    if (put()) return;
    const iv = setInterval(function () { if (put()) clearInterval(iv); }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._eb) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () { const pool = _m.apply(this, arguments); return Array.isArray(pool) ? pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; }) : pool; };
        Object.keys(_m).forEach(function (k) { try { w[k] = _m[k]; } catch (e) { } });
        w._eb = true; marketSellable = w; window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._eb) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const me = u_(); if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) { alert_('격리 중에는 장착할 수 없습니다.'); return; }
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
            alert_(NAME + '\n\n장착했습니다. 장착칸의 [🐺 정예 B조] 로 가면 · 카세트테이프 · 만년필을 다룹니다.');
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._eb = true; useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 상담사 — 준다
window.ebGive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = users();
    const code = Object.keys(book).filter(function (c) { const x = book[c] || {}; return c === who || String(x.no) === String(who) || x.name === who; })[0];
    if (!code) { console.warn('사원을 못 찾았습니다.'); return; }
    const t = book[code];
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(NAME);
    log_(t, '[' + NAME + '] 상담사가 지급했습니다.');
    try { if (typeof updateUserFields === 'function') updateUserFields(code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    console.log('%c✓ ' + NAME + ' → ' + t.name, 'color:#4CAF50');
};

// ==========================================
// 장착칸의 [🐺 정예 B조] 단추 · 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#15171c,#0a0b0e); border:1px solid #7a8aa0; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75); color:#e3e8f0;">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#cfd8e6; font-weight:bold; margin-bottom:4px;">' + t + '</div>'
        + (sub ? '<div style="font-size:10px; color:#8a95a8; margin-bottom:11px; line-height:1.6;">' + sub + '</div>' : '');
}

window.ebMenu = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    const w = box(head('🐺 （구） 정예 B조 ■■', '생환 포인트 1.5배 · 회수품 2배. 가면을 쓴 조원은 배율이 오르고, 전원 생환하면 조장 3배 · 정예조 2배 · 일반 1.5배.')
        + PARTS.map(function (p) {
            let line = '';
            if (p.k === 'mask') line = '어둠 안에서 위쪽 🎭 단추로 고른다 — 한 판에 둘까지 · 그 탐사에서만';
            if (p.k === 'glove') line = me.ebGlove === today() ? '오늘 몫을 받았다' : '오늘 몫은 접속하면 붙는다';
            if (p.k === 'tape') line = '함께 탐사한 사람 ' + Object.keys(me.ebMates || {}).length + '명';
            if (p.k === 'pen') line = '데려갈 늑대 ' + (Number(me.ebWolves) || 0) + ' / ' + C.WOLF_MAX;
            const btn = (p.k === 'tape' || p.k === 'pen') ? '<button class="game-btn eb-go" data-k="' + p.k + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">열기</button>' : '';
            return '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
                + '<div style="flex:1; min-width:0;"><div style="font-size:11.5px; color:#e3e8f0;">' + p.i + ' ' + esc(p.n) + '</div>'
                + '<div style="font-size:9.5px; color:#8a95a8; margin-top:2px; line-height:1.5;">' + esc(p.d) + (line ? '<br><span style="color:#b7c4d8;">' + esc(line) + '</span>' : '') + '</div></div>' + btn + '</div>';
        }).join('')
        + '<button id="eb-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px; text-align:center;">닫는다</button>');
    w.querySelector('#eb-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.eb-go'), function (b) {
        b.onclick = function () { const k = b.dataset.k; if (k === 'tape') tapeMenu(); else if (k === 'pen') penMenu(); };
    });
};

// ── 카세트테이프
function quarantinedU(u) { return !!(u && Number(u.quarantineUntil) > Date.now()); }
function tapeMenu() {
    const me = u_(); if (!me) return;
    if (!me.ebTape || me.ebTape.d !== today()) me.ebTape = { d: today(), used: {} };
    const mates = me.ebMates || {};
    const codes = Object.keys(mates).sort(function (a, b) { return (mates[b] || 0) - (mates[a] || 0); });
    const rows = codes.map(function (c) {
        const t = userOf(c);
        if (!t) return '';
        const q = quarantinedU(t);
        const used = !!(me.ebTape.used && me.ebTape.used[c]);
        const where = q ? ((t.quarantineDest || 'fox') === 'bath' ? '♨ 선녀탕' : '🦊 상담실') + ' · ' + Math.max(1, Math.ceil((t.quarantineUntil - Date.now()) / 36e5)) + '시간' : '밖에 있다';
        return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0; font-size:11.5px;">' + esc(t.name || c) + ' <span style="font-size:9.5px; color:#8a95a8;">· ' + where + (used ? ' · 오늘 풀어 줬다' : '') + '</span></div>'
            + (q && !used ? '<button class="game-btn eb-free" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">풀어 준다</button>' : '') + '</div>';
    }).join('');
    const w = box(head('📼 카세트테이프', '구형 카세트테이프. 심신 안정에 도움이 되는 노래가 감겨 있다. 함께 탐사를 갔던 사람이 상담실 · 선녀탕에 있으면 풀어 준다 — 사람마다 하루 한 번.')
        + (rows || '<div style="font-size:10.5px; color:#8a95a8; padding:6px 0;">함께 탐사한 사람이 아직 없다.</div>')
        + '<button id="eb-back" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">돌아간다</button>');
    w.querySelector('#eb-back').onclick = window.ebMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.eb-free'), function (b) { b.onclick = function () { tapeFree(b.dataset.c); }; });
}
function tapeFree(code) {
    const me = u_(); if (!me) return;
    if (!me.ebTape || me.ebTape.d !== today()) me.ebTape = { d: today(), used: {} };
    if (me.ebTape.used && me.ebTape.used[code]) { alert_('오늘은 이미 풀어 줬습니다.'); return; }
    const t = userOf(code);
    if (!t || !quarantinedU(t)) { alert_('지금 상담실 · 선녀탕에 있지 않습니다.'); tapeMenu(); return; }
    let out = Number(t.quarantineExitPollution) || 0; if (out >= 100) out = 99;
    const f = { quarantineUntil: 0, quarantineDest: null, quarantineHospital: false, quarantineExitPollution: 0, pollution: Math.min(out, Number(t.pollution) || 0), lastPollutionTime: Date.now(), foxRoomAnswered: false };
    Object.keys(f).forEach(function (k) { t[k] = f[k]; });
    log_(t, '[' + NAME + '] ' + (me.name || me.code) + ' 사원의 카세트테이프 — 노래가 끝나자 문이 열렸습니다. (오염도 ' + f.pollution + '%)');
    f.history = t.history;
    try { if (typeof updateUserFields === 'function') updateUserFields(code, f); } catch (e) { }
    if (!me.ebTape.used) me.ebTape.used = {};
    me.ebTape.used[code] = 1;
    log_(me, '[' + NAME + '] 카세트테이프로 ' + (t.name || code) + ' 사원을 풀어 줬습니다.');
    save({ ebTape: 1, history: 1 });
    alert_('📼 ' + (t.name || code) + ' 사원이 나왔습니다.\n\n노래가 끝나자 문이 열렸습니다.');
    tapeMenu();
}
// 함께 탐사한 사람 적기 — 파티로 출발할 때
function noteMates(party) {
    const me = u_(); if (!me || !party || !party.members) return;
    if (!me.ebMates || typeof me.ebMates !== 'object') me.ebMates = {};
    let n = 0;
    Object.keys(party.members).forEach(function (c) { if (c !== me.code) { me.ebMates[c] = Date.now(); n++; } });
    const ks = Object.keys(me.ebMates).sort(function (a, b) { return me.ebMates[b] - me.ebMates[a]; });
    ks.slice(30).forEach(function (c) { delete me.ebMates[c]; });      // 서른 명까지
    if (n) save({ ebMates: 1 });
}

// ── 만년필
function penMenu() {
    const me = u_(); if (!me) return;
    const n = Math.max(0, Math.min(C.WOLF_MAX, Number(me.ebWolves) || 0));
    const w = box(head('🖋 금촉 만년필', '타인의 필체를 복사한다. 어쩌면 습관과 행동, 혹은 능력마저.<br>조장의 방은 최소 인원이 둘이 된다. 동행인의 각인(전용 장비 속성) 가운데 하나를 무작위로 복사한 늑대를 데려간다 — 늑대는 그 속성의 분신처럼 움직인다(회피는 죽음을 대신 받고 · 치유는 한 번 살리고 · 감각은 안전한 쪽을 보이고 · 은신은 끌려감을 막고 · 행운은 회수품 · 파괴는 기믹 · 연결은 합류와 구출 · 응시는 굴림).')
        + '<div style="font-size:11px; color:#b7c4d8; margin:6px 0 10px 0;">데려갈 늑대 — <b id="eb-wn" style="color:#fff;">' + n + '</b> / ' + C.WOLF_MAX + '</div>'
        + '<div style="display:flex; gap:6px; margin-bottom:10px;">' + [0, 1, 2, 3].map(function (i) { return '<button class="game-btn eb-wolf" data-n="' + i + '" style="flex:1; margin:0; padding:10px; font-size:12px;' + (i === n ? ' background:linear-gradient(145deg,#4a5a70,#2a3240) !important; border-color:#9fb4d0 !important; color:#fff !important;' : '') + '">' + i + '</button>'; }).join('') + '</div>'
        + '<div style="font-size:9.5px; color:#8a95a8; line-height:1.6;">출발할 때 동행인의 각인에서 뽑는다. 동행인에게 각인이 없으면 늑대는 D 등급의 아무 속성을 띤다. 늑대는 그 탐사 동안만 있다.</div>'
        + '<button id="eb-back" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">돌아간다</button>');
    w.querySelector('#eb-back').onclick = window.ebMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.eb-wolf'), function (b) { b.onclick = function () { me.ebWolves = Number(b.dataset.n) || 0; save({ ebWolves: 1 }); penMenu(); }; });
}

// 장착칸 단추
(function badgeBtn() {
    const ID = 'eb-list-btn';
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
        const row = card.querySelector('div'); if (!row) return;
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0; background:linear-gradient(145deg,#4a5a70,#2a3240) !important; border-color:#9fb4d0 !important;';
        b.textContent = '🐺 정예 B조';
        b.onclick = window.ebMenu;
        row.appendChild(b);
    }
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 방 · 출발 — 조장이 eliteB 를 적는다 · 늑대를 부른다 · 최소 인원 둘
// ==========================================
function pushParty() {
    const me = u_(), d = db_();
    if (!me || !d || !wears(me)) return;
    const r = run();
    if (r && r.isParty && r.partyId) {
        // 탐사 중 — 출발 때 못 적었을 때만 (가면은 안에서 고르므로 여기서 masks 는 건드리지 않는다)
        if (ebOf(r.partyId)) return;
        const p = parties()[r.partyId]; if (!p) return;
        try { d.ref('darkParties/' + r.partyId + '/eliteB').update({ lead: me.code, leadName: me.name || me.code, crew: crewOf(p), at: Date.now() }); } catch (e) { }
        return;
    }
    const p = myParty();
    if (!p || !p.id || p.state === 'RUNNING') return;
    try { d.ref('darkParties/' + p.id + '/eliteB').update({ lead: me.code, leadName: me.name || me.code, at: Date.now() }); } catch (e) { }
}
let partySig = '';
setInterval(function () {
    try {
        const me = u_(), r = run();
        const p = (r && r.isParty && r.partyId) ? parties()[r.partyId] : myParty();
        if (!me || !p || !p.id || !wears(me)) { partySig = ''; return; }
        const sig = p.id + '|' + Object.keys(p.members || {}).sort().join(',') + '|' + (ebOf(p.id) ? 1 : 0);
        if (sig === partySig) return;
        partySig = sig;
        pushParty();
    } catch (e) { }
}, 3000);

// 늑대 — 출발할 때 동행인의 각인에서 뽑는다
function attrsOf(u) {
    try {
        const g = (typeof getGear === 'function') ? getGear(u) : null;
        if (!g || !Array.isArray(g.attrs) || !g.attrs.length) return [];
        return g.attrs.map(function (a) { let gr = 'D'; try { gr = gearAttrGrade(g, a) || 'D'; } catch (e) { } return { k: a, g: gr }; });
    } catch (e) { return []; }
}
const WOLF_NAMES = ['회색', '검은', '흰', '잿빛'];
function summonWolves(party) {
    const me = u_(), r = run();
    if (!me || !r || !wears(me)) return;
    const n = Math.max(0, Math.min(C.WOLF_MAX, Number(me.ebWolves) || 0));
    if (!n) return;
    const mates = Object.keys((party && party.members) || {}).filter(function (c) { return c !== me.code; });
    const KEYS = ['evade', 'break', 'heal', 'luck', 'sense', 'hide', 'bond', 'gaze'];
    const wolves = [];
    for (let i = 0; i < n; i++) {
        const c = mates.length ? mates[i % mates.length] : null;
        const pool = c ? attrsOf(userOf(c)) : [];
        const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { k: KEYS[Math.floor(Math.random() * KEYS.length)], g: 'D' };
        wolves.push({ k: pick.k, g: pick.g, from: c, nick: WOLF_NAMES[i % WOLF_NAMES.length] + ' 늑대', gone: 0, n: 0, j: 0, r: 0 });
    }
    r._ebWolves = wolves;
    try { if (r.log) r.log.push('[🐺 만년필] 늑대 ' + wolves.map(function (w) { return w.nick + '(' + attrName(w.k) + ' ' + w.g + ')'; }).join(' · ')); } catch (e) { }
    toast('🐺 늑대 ' + n + '마리가 따라붙었다 — ' + wolves.map(function (w) { return attrName(w.k); }).join(' · '));
}
function attrName(k) { try { return (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[k]) ? GEAR_ATTRS[k].name : k; } catch (e) { return k; } }
// babyfox.js 가 본다 — 늑대는 그 속성의 분신
window.EBWOLF = {
    usable: function (k) {
        const r = run(), me = u_();
        if (!r || !me || !Array.isArray(r._ebWolves)) return null;
        const w = r._ebWolves.find(function (x) { return x && x.k === k && !x.gone; });
        if (!w) return null;
        return { k: k, owner: me, ownerCode: me.code, grade: w.g || 'D', nick: w.nick, mine: true, wolf: w };
    },
    kill: function (x, why) {
        if (!x || !x.wolf) return false;
        x.wolf.gone = 1;
        const r = run();
        try { if (r && r.log) r.log.push('[🐺 늑대] ' + x.wolf.nick + ' — ' + (why || '사라졌다')); } catch (e) { }
        toast('🐺 ' + x.wolf.nick + (why ? ' — ' + why : ' 사라졌다'));
        return true;
    },
    bump: function (x, field, max, why) {
        if (!x || !x.wolf) return 0;
        const n = (Number(x.wolf[field]) || 0) + 1;
        x.wolf[field] = n;
        if (n >= max) window.EBWOLF.kill(x, why);
        return n;
    },
    list: function () { const r = run(); return (r && Array.isArray(r._ebWolves)) ? r._ebWolves : []; }
};

// 파티 출발 — 조장이면 eliteB 를 적고 · 함께 탐사한 사람을 적고 · 늑대를 부른다
(function hookLaunch() {
    const iv = setInterval(function () {
        if (typeof launchPartyRun !== 'function' || launchPartyRun._eb) { if (typeof launchPartyRun === 'function' && launchPartyRun._eb) clearInterval(iv); return; }
        const _l = launchPartyRun;
        const w = function (party) {
            const out = _l.apply(this, arguments);
            try {
                const me = u_(), r = run();
                if (me && party && r && r.partyId) {
                    if (wears(me)) {
                        const d = db_();
                        // 가면은 어둠 안에서 고른다 — 출발 때는 비워 둔다. crew = 출발 때 인원 (전원 생환 셈)
                        if (d) d.ref('darkParties/' + party.id + '/eliteB').update({ lead: me.code, leadName: me.name || me.code, crew: crewOf(party), masks: null, dead: null, at: Date.now() });
                        noteMates(party);
                        summonWolves(party);
                    }
                }
            } catch (e) { console.warn('[정예 B조] 출발 연결', e && e.message); }
            return out;
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._eb = true; launchPartyRun = w; window.launchPartyRun = w;
        clearInterval(iv);
        console.log('[정예 B조] 출발 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 혼자 떠날 때도 늑대는 못 데려간다 (동행인이 없다) — 조장 혼자면 그대로 조장

// 최소 인원 둘 — 조장(차고 있는 방장)의 방은 z.min 을 2 로 낮춰 출발시킨다 (babyfox 와 같은 꼴 · 가짜 사원은 안 넣는다)
(function hookMin() {
    const iv = setInterval(function () {
        if (typeof launchParty !== 'function' || launchParty._eb) { if (typeof launchParty === 'function' && launchParty._eb) clearInterval(iv); return; }
        const _l = launchParty;
        const w = function () {
            const me = u_();
            let z = null, min0 = null;
            try {
                const p = myParty();
                if (me && wears(me) && p && p.leader === me.code && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                    const n = Object.keys(p.members || {}).length;
                    z = DARK_ZONES[p.zone];
                    if (n >= C.PEN_MIN && z.min > C.PEN_MIN) { min0 = z.min; z.min = C.PEN_MIN; }
                    else z = null;
                }
            } catch (e) { z = null; }
            try { return _l.apply(this, arguments); }
            finally { if (z && min0 != null) z.min = min0; }
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._eb = true; launchParty = w; window.launchParty = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 방 화면의 「최소 n인」 · 출발 단추 — 조장의 방이면 둘부터 열어 준다
(function roomBtn() {
    setInterval(function () {
        try {
            const me = u_(), p = myParty();
            if (!me || !p || !wears(me) || p.leader !== me.code) return;
            const z = (typeof DARK_ZONES !== 'undefined') ? DARK_ZONES[p.zone] : null;
            if (!z || z.min <= C.PEN_MIN) return;
            const n = Object.keys(p.members || {}).length;
            const members = Object.keys(p.members || {}).map(function (c) { return p.members[c]; });
            if (n < C.PEN_MIN || !members.every(function (m) { return m && m.ready; })) return;
            Array.prototype.forEach.call(document.querySelectorAll('button'), function (b) {
                const t = b.textContent || '';
                if (t.indexOf('대기 중') >= 0 && t.indexOf('최소') >= 0 && b.disabled) {
                    b.disabled = false; b.textContent = '⚑ 어둠으로 진입 (🖋 둘이서)';
                    b.onclick = function () { try { launchParty(); } catch (e) { } };
                }
            });
        } catch (e) { }
    }, 1200);
})();

// ==========================================
// 정산 — 생환 포인트 배수 (상한 ⚖ ×3 은 gear-cap 이 바깥에서 센다)
// ==========================================
function allSurvived(pid) {
    const e = ebOf(pid);
    if (!e) return false;
    // 출발 때 인원(crew)으로 센다 — members 는 먼저 귀환한 사람부터 빠진다
    let mem = Object.keys(e.crew || {});
    if (!mem.length) { const p = parties()[pid]; mem = Object.keys((p && p.members) || {}); }
    if (mem.length < 2) return false;                       // 혼자면 「전원」이 아니다
    const dead = e.dead || {};
    return mem.every(function (c) { return !dead[c]; });
}
function masksGiven(pid) { const e = ebOf(pid); return e && e.masks ? Object.keys(e.masks).length : 0; }
function myMult() {
    const me = u_(), r = run();
    if (!me || !r) return 1;
    if (!r.isParty) return wears(me) ? C.PTS.lead : 1;
    const role = roleIn(me.code, r.partyId);
    if (!role) return 1;
    if (role !== 'lead' && !leadAlive(r.partyId)) return 1;            // 조장이 쓰러져 있으면 조원 몫은 없다
    const all = allSurvived(r.partyId);
    // ★ 조장이 조원에게 가면을 씌웠으면 조장은 ×3 (2026-10-29 사용자) — 전원 생환이 아니어도
    if (role === 'lead' && masksGiven(r.partyId) > 0) return C.PTS_ALL.lead;
    return (all ? C.PTS_ALL : C.PTS)[role] || 1;
}
(function hookSettle() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function' || renderDarkResult._eb) { if (typeof renderDarkResult === 'function' && renderDarkResult._eb) clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const me = u_();
            const log0 = (me && me.darkLogs && me.darkLogs.length) ? me.darkLogs[0] : null;
            let mult = 1, role = null, all = false, r0 = run();
            try { mult = myMult(); role = myRole(); all = (r0 && r0.isParty) ? allSurvived(r0.partyId) : false; } catch (e) { }
            const out = _r.apply(this, arguments);
            try {
                if (!me || mult <= 1) return out;
                const lg = (me.darkLogs || [])[0];
                if (!lg || lg === log0 || lg.died) return out;
                const base = Math.max(0, Number(lg.reward) || 0);
                if (!base) return out;
                const extra = Math.round(base * (mult - 1));
                if (extra <= 0) return out;
                try { if (typeof changePoints === 'function') changePoints(extra); else me.points = (Number(me.points) || 0) + extra; } catch (e) { me.points = (Number(me.points) || 0) + extra; }
                const who = role === 'lead' ? '조장' : role === 'elite' ? '정예조 조원' : '일반 조원';
                const why = all ? ' · 전원 생환' : ((role === 'lead' && r0 && r0.isParty && masksGiven(r0.partyId) > 0) ? ' · 가면을 씌움' : '');
                log_(me, '[' + NAME + '] ' + who + why + ' — 생환 포인트 ×' + mult + ' (+' + extra.toLocaleString() + ' P)');
                save({ points: 1, history: 1 });
                try {
                    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                    if (body) {
                        const el = document.createElement('div');
                        el.style.cssText = 'margin-top:8px; padding:8px 10px; border:1px dashed #6a7a90; border-radius:5px; font-size:11px; color:#cfd8e6;';
                        el.textContent = '🐺 ' + who + why + ' — 생환 포인트 ×' + mult + ' (+' + extra.toLocaleString() + ' P)';
                        const btn = body.querySelector('button');
                        if (btn) btn.insertAdjacentElement('beforebegin', el); else body.appendChild(el);
                    }
                } catch (e) { }
            } catch (e) { console.warn('[정예 B조] 정산', e && e.message); }
            return out;
        };
        // ★ _gearCap 표는 옮기지 않는다 — gear-cap 이 이 겹을 다시 감싸 상한(×3)을 바깥에서 세게
        Object.keys(_r).forEach(function (k) { if (k !== '_gearCap') { try { w[k] = _r[k]; } catch (e) { } } });
        w._eb = true; renderDarkResult = w; window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[정예 B조] 정산 연결');
    }, 700);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 회수품 ×2 — 장착자
// ==========================================
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function' || emLootMult._eb) { if (typeof emLootMult === 'function' && emLootMult._eb) clearInterval(iv); return; }
        const _e = emLootMult;
        const w = function (user) {
            let m = Number(_e.apply(this, arguments)) || 1;
            try { const me = u_(); if (me && (!user || user.code === me.code) && wears(me)) m *= C.LOOT; } catch (e) { }
            return m;
        };
        Object.keys(_e).forEach(function (k) { if (k !== '_gearCap') { try { w[k] = _e[k]; } catch (e) { } } });
        w._eb = true; emLootMult = w; window.emLootMult = w;
        clearInterval(iv);
    }, 700);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 판정 보정 — 매뉴얼(역할마다 무작위) + 가면(쓴 사람 고정 +2) + 구출(조장→정예조 +1~3)
// ==========================================
//   매뉴얼 몫은 조장이 살아 있을 때. 가면 몫은 쓰고 있으면(조장 · 정예조) 늘.
//   구출 몫은 hookRescue 가 구출 함수를 도는 동안 darkRun._ebRescue 에 걸어 둔 값.
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function' || rollDarkBonus._eb) { if (typeof rollDarkBonus === 'function' && rollDarkBonus._eb) clearInterval(iv); return; }
        const _r = rollDarkBonus;
        const w = function (kind) {
            let b = _r.apply(this, arguments);
            try {
                const role = myRole(), r = run();
                if (role && r && (role === 'lead' || !r.isParty || leadAlive(r.partyId))) {
                    const rg = C.BON[role] || [0, 0];
                    b = (Number(b) || 0) + rnd(rg[0], rg[1]);
                }
                if (role === 'lead' || role === 'elite') b = (Number(b) || 0) + C.MASK_BON;
                if (r && r._ebRescue) {
                    if (r._ebRescueOnce && Date.now() - (Number(r._ebRescueAt) || 0) > 15000) { delete r._ebRescue; delete r._ebRescueOnce; }
                    else {
                        b = (Number(b) || 0) + r._ebRescue;
                        if (r._ebRescueOnce) { delete r._ebRescue; delete r._ebRescueOnce; }
                    }
                }
            } catch (e) { }
            return b;
        };
        Object.keys(_r).forEach(function (k) { if (k !== '_gearCap') { try { w[k] = _r[k]; } catch (e) { } } });
        w._eb = true; rollDarkBonus = w; window.rollDarkBonus = w;
        clearInterval(iv);
    }, 700);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 가면 — True or Fake 표시 · 파훼 · 구출 보정 · 어둠 안 가면 고르기
// ==========================================
(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function' || renderChoiceStep._eb) { if (typeof renderChoiceStep === 'function' && renderChoiceStep._eb) clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            try {
                if (masked() && Array.isArray(options) && options.length > 1) {
                    options = options.map(function (o) { return Object.assign({}, o); });
                    if (String(options[0].label || '').indexOf('◈') < 0) options[0].label = '◈ True — ' + options[0].label;
                    else options[0].label = String(options[0].label).replace('◈ ', '◈ True — ');
                    options.forEach(function (o) {
                        const dl = DEADLY[o.fn];
                        if (dl && dl.indexOf(o.arg) >= 0 && String(o.label).indexOf('✖') < 0) o.label = '✖ Fake — ' + o.label;
                    });
                    text = String(text || '') + '<br><br><span style="color:#9fb4d0;">🎭 True or Fake — 가면이 한쪽을 가리킨다.</span>';
                }
            } catch (e) { }
            return _c.call(this, title, text, options, imgKey);
        };
        Object.keys(_c).forEach(function (k) { try { w[k] = _c[k]; } catch (e) { } });
        w._eb = true; renderChoiceStep = w; window.renderChoiceStep = w;
        clearInterval(iv);
        console.log('[정예 B조] True or Fake 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 파훼 단추 — 작두 · 분신 단추와 같은 자리 (어둠 한 판에 2회 · 가면을 쓴 사람 · 횟수는 darkRun._ebBreakN)
window.ebBreak = function () {
    const me = u_(), r = run();
    if (!me || !r) { alert_('탐사 중에만 쓸 수 있습니다.'); return; }
    if (!masked()) { alert_('가면을 쓰고 있지 않습니다.'); return; }
    const used = Number(r._ebBreakN) || 0;
    if (used >= C.BREAK_MAX) { alert_('이 탐사에서 파훼는 ' + C.BREAK_MAX + '회까지입니다.'); return; }
    r._ebBreakN = used + 1;
    const bx = { n: r._ebBreakN };
    try { if (typeof saveDarkRunState === 'function') saveDarkRunState(); } catch (e) { }     // 나갔다 돌아와도 횟수가 남게 (아래 keepBreakN)
    if (window.FINX && typeof window.FINX.on === 'function' && window.FINX.on()) {
        if (r.log) r.log.push('[🎭 가면] 피날레 파훼');
        window.FINX.smash('🎭 정예조 가면 (남은 파훼 ' + (C.BREAK_MAX - bx.n) + ')');
        return;
    }
    r.success = (r.success || 0) + 2;
    r.modifier = (r.modifier || 0) + 1;
    if (r.log) r.log.push('[🎭 가면] True or Fake — 기믹을 파훼했다 (+2)');
    try { if (r.isParty && typeof sendPartyChat === 'function') sendPartyChat((me.name || '') + ' 사원이 가면 너머로 답을 보았습니다.', true); } catch (e) { }
    try {
        if (typeof darkBodyEl === 'function' && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
            darkBodyEl().innerHTML = darkBox('🎭 True or Fake', '가면 너머로 보면 답은 하나뿐이다.<br><br>막고 있던 것이 거짓이었다는 듯 물러난다.<br><br><span style="font-size:11px; color:#8aa;">남은 파훼 ' + (C.BREAK_MAX - bx.n) + '회</span>',
                darkChoiceBtn('지나간다.', 'partyAdvance(' + ((Number(r.step) || 0) + 1) + ')'));
            try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
        }
    } catch (e) { }
};
//   ★ K 의 방(darkRun.kroom)에서는 안 붙인다 — 거기는 본문을 자주 다시 그려서 단추가 깜빡이고 느려졌다 (2026-10-28)
//   ★ 본문이 다시 그려지는 **그 자리에서** 붙인다 (2026-10-29) — 전에는 1.4초 시계로만 붙여서, 장면이 바뀔 때마다
//     단추가 사라졌다 1초쯤 뒤에 나타나 깜빡이는 것처럼 보였다(영상 · 동화의 뒷면은 장면이 잘게 자주 바뀐다).
//     이제 본문(#dro-body · #darkness-body)의 자식이 바뀌면 MutationObserver 가 바로(그리기 전에) 붙인다. 시계는 뒷받침.
function ensureBreak() {
    const ID = 'eb-break-btn';
    const r = run(), me = u_();
    const old = document.querySelector('#' + ID);
    if (!r || r.kroom || !me || !masked()) { if (old) old.remove(); return; }
    const left = Math.max(0, C.BREAK_MAX - (Number(r._ebBreakN) || 0));
    if (!left) { if (old) old.remove(); return; }
    const label = '🎭 True or Fake — 파훼한다 (남은 ' + left + '회)';
    if (old && old.isConnected) { if (old.textContent !== label) old.textContent = label; return; }
    // 선택지가 있는 장면에만 (단추가 하나라도 있는 본문) — 투표 칸이 있으면 그 **뒤**(형제), 아니면 본문 끝
    //   ★ 투표 칸(#vote-area) 안에 넣으면 안 된다 — 투표 시계가 1초마다 그 안을 통째로 다시 그려
    //     단추가 지워졌다 1.4초 뒤 다시 붙으며 미친 듯이 깜빡였다 (2026-10-28 · 작두 단추처럼 afterend 로)
    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
    const vote = document.getElementById('vote-area');
    if (!body || !body.querySelector('button')) return;
    const b = document.createElement('button');
    b.id = ID; b.className = 'game-btn';
    b.setAttribute('data-aux', '1');       // ★ 「준비 중」 표시가 맨 끝 .game-btn 을 집어 쓰는데(index.html renderAdvanceWait · dark-wait.js) 이 단추는 건너뛰게
    b.style.cssText = 'width:100%; margin:8px 0 0 0; padding:12px; font-size:12px; background:linear-gradient(145deg,#4a5a70,#2a3240) !important; border-color:#9fb4d0 !important; color:#fff !important;';
    b.textContent = label;
    b.onclick = window.ebBreak;
    if (vote && vote.parentElement) vote.insertAdjacentElement('afterend', b); else body.appendChild(b);
}
// 🐺 늑대 줄 — 데려간 늑대가 있으면 본문 맨 위에 한 줄 (안 보이는 속성의 늑대도 있다는 것을 알 수 있게 · 2026-10-29)
function ensureWolf() {
    const ID = 'eb-wolf-line';
    const r = run();
    const old = document.getElementById(ID);
    const ws = (r && !r.kroom && Array.isArray(r._ebWolves)) ? r._ebWolves : [];
    if (!ws.length) { if (old) old.remove(); return; }
    const txt = '🐺 ' + ws.map(function (w) { return w.nick + ' — ' + attrName(w.k) + ' ' + (w.g || 'D') + (w.gone ? ' (사라짐)' : ''); }).join(' · ');
    if (old && old.isConnected) { if (old.textContent !== txt) old.textContent = txt; return; }
    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
    if (!body || !body.childNodes.length) return;
    const el = document.createElement('div');
    el.id = ID;
    el.style.cssText = 'font-size:10px; color:#9fb4d0; margin:0 0 8px 0; padding:6px 8px; border:1px dashed #4a5a70; border-radius:5px; line-height:1.5;';
    el.textContent = txt;
    body.insertAdjacentElement('afterbegin', el);
}
let ensureT = 0;
function ensureSoon() {
    if (ensureT) return;
    ensureT = requestAnimationFrame(function () { ensureT = 0; try { ensureWolf(); } catch (e) { } try { ensureBreak(); } catch (e) { } });
}
(function watchBody() {
    const seen = {};
    function hook(id) {
        const el = document.getElementById(id);
        if (!el || seen[id]) return;
        seen[id] = 1;
        new MutationObserver(function (muts) {
            // 내 것(단추 · 늑대 줄)만 붙거나 떨어진 것이면 넘어간다 — 그래도 ensure 는 있으면 아무것도 안 하므로 돌아도 된다
            ensureSoon();
        }).observe(el, { childList: true });
    }
    const iv = setInterval(function () { hook('dro-body'); hook('darkness-body'); if (seen['dro-body'] && seen['darkness-body']) clearInterval(iv); }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
setInterval(function () { try { ensureWolf(); } catch (e) { } try { ensureBreak(); } catch (e) { } }, 1400);

// 파훼 횟수는 darkRun 에만 있어서, 나갔다 돌아오면(복귀) 새 darkRun 에는 없다 — darkRuns/<사번>/ebBreakN 에 같이 적고 복귀 때 되찾는다
(function keepBreakN() {
    const iv = setInterval(function () {
        if (typeof saveDarkRunState === 'function' && !saveDarkRunState._eb) {
            const _s = saveDarkRunState;
            const w = function () {
                const out = _s.apply(this, arguments);
                try { const r = run(), me = u_(), d = db_(); if (r && me && d && r._ebBreakN) d.ref('darkRuns/' + me.code + '/ebBreakN').set(r._ebBreakN); } catch (e) { }
                return out;
            };
            Object.keys(_s).forEach(function (k) { try { w[k] = _s[k]; } catch (e) { } });
            w._eb = true; saveDarkRunState = w; window.saveDarkRunState = w;
        }
        if (typeof acceptDarkResume === 'function' && !acceptDarkResume._eb) {
            const _a = acceptDarkResume;
            const w = function () {
                let n = 0;
                try { n = Number(window._pendingResume && window._pendingResume.ebBreakN) || 0; } catch (e) { }
                const out = _a.apply(this, arguments);
                try { const r = run(); if (r && n) r._ebBreakN = n; } catch (e) { }
                return out;
            };
            Object.keys(_a).forEach(function (k) { try { w[k] = _a[k]; } catch (e) { } });
            w._eb = true; acceptDarkResume = w; window.acceptDarkResume = w;
        }
        if (typeof saveDarkRunState === 'function' && saveDarkRunState._eb && typeof acceptDarkResume === 'function' && acceptDarkResume._eb) clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 구출 보정 — 조장이 정예조 조원을 구출할 때 구출 판정 +1~3 (확정 구출이 아니다)
// ==========================================
//   구조(attemptRescue(kind, 사번)) · B-330 구출A/B(b330DoRescue1/2 — 대상은 방의 rescue1/2.target).
//   함수가 도는 동안만 darkRun._ebRescue 에 값을 걸어 두고, rollDarkBonus 가 그 값을 더한다.
function rescueBon(targetCode) {
    const me = u_(), r = run();
    if (!me || !r || !r.isParty || !r.partyId || !targetCode) return 0;
    if (roleIn(me.code, r.partyId) !== 'lead') return 0;
    if (roleIn(targetCode, r.partyId) !== 'elite') return 0;
    return rnd(C.RESCUE_BON[0], C.RESCUE_BON[1]);
}
function wrapRescue(name, targetOf) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._eb) { clearInterval(iv); return; }
        const w = function () {
            const r = run(), me = u_();
            let bon = 0, t = null;
            try { t = targetOf.apply(this, arguments); bon = rescueBon(t); } catch (e) { bon = 0; }
            if (r && bon) {
                r._ebRescue = bon;
                try { if (r.log) r.log.push('[🐺 가면] ' + nameOf(t) + ' 구출 — 조장의 구출 판정 +' + bon); } catch (e) { }
                toast('🎭 정예조 조원 — 구출 판정 +' + bon);
            }
            try { return f.apply(this, arguments); }
            finally { if (r) delete r._ebRescue; }
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._eb = true; window[name] = w;
        clearInterval(iv);
    }, 700);
    setTimeout(function () { clearInterval(iv); }, 60000);
}
wrapRescue('attemptRescue', function (kind, code) { return code; });
// ★ K 의 방(kroomRescue(사번))도 — 굴림이 서버를 읽은 뒤(비동기)에 돌아서 try/finally 로 못 건다.
//   한 번 쓰고 지우는 표(_ebRescueOnce)로 걸어 두고, rollDarkBonus 가 처음 더할 때 지운다 (15초 지나면 그냥 버린다).
(function wrapKroomRescue() {
    const iv = setInterval(function () {
        const f = window.kroomRescue;
        if (typeof f !== 'function') return;
        if (f._eb) { clearInterval(iv); return; }
        const w = function (code) {
            const r = run();
            let bon = 0;
            try { bon = rescueBon(code); } catch (e) { bon = 0; }
            if (r && bon) {
                r._ebRescue = bon; r._ebRescueOnce = 1; r._ebRescueAt = Date.now();
                try { if (r.log) r.log.push('[🐺 가면] ' + nameOf(code) + ' 구출 — 조장의 구출 판정 +' + bon + ' (K 의 방)'); } catch (e) { }
                toast('🎭 정예조 조원 — 구출 판정 +' + bon);
            }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._eb = true; window.kroomRescue = w;
        clearInterval(iv);
    }, 700);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
wrapRescue('b330DoRescue1', function () { const r = run(), p = r && parties()[r.partyId]; return p && p.rescue1 && p.rescue1.target; });
wrapRescue('b330DoRescue2', function () { const r = run(), p = r && parties()[r.partyId]; return p && p.rescue2 && p.rescue2.target; });

// ==========================================
// 어둠 안에서 가면 고르기 — 조장만 · 같은 방 사람 가운데 둘까지 · 위쪽 🎭 단추
// ==========================================
//   방의 eliteB.masks 에만 적는다 — 그 탐사에서만 효력 · 끝나면 방과 함께 사라진다.
function runMaskMenu() {
    const me = u_(), r = run();
    if (!me || !r || !r.isParty || !r.partyId) return;
    const pid = r.partyId, p = parties()[pid] || {}, e = ebOf(pid) || {};
    if (!e.lead || e.lead !== me.code) { alert_('조장만 가면을 씌울 수 있습니다.'); return; }
    const masks = e.masks || {};
    // 출발 때 인원(crew) — 먼저 귀환해 members 에서 빠진 사람도 보인다
    const mem = Object.keys(Object.keys(e.crew || {}).length ? e.crew : (p.members || {})).filter(function (c) { return c !== me.code; });
    const n = Object.keys(masks).length;
    const rows = mem.map(function (c) {
        const on = !!masks[c];
        const dead = !!(e.dead && e.dead[c]);
        const nm = (p.members && p.members[c] && p.members[c].name) || nameOf(c);
        return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; font-size:11.5px;">' + (on ? '🎭 ' : '') + esc(nm) + (dead ? ' <span style="font-size:9.5px; color:#ff8a80;">· 쓰러짐</span>' : '') + '</div>'
            + (on ? '<button class="game-btn eb-roff" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + GREY + '">거둔다</button>'
                  : (n < C.MASK_MAX ? '<button class="game-btn eb-ron" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">씌운다</button>' : ''))
            + '</div>';
    }).join('');
    const w = box(head('🎭 정예조 가면 — 이 방', '둘까지. 쓴 사람은 「True or Fake」 · 한 판에 ' + C.BREAK_MAX + '회 파훼 · 판정 +' + C.MASK_BON + ' · 조장이 구출할 때 +' + C.RESCUE_BON[0] + '~' + C.RESCUE_BON[1] + ' · 전원 생환 때 2배. (' + n + ' / ' + C.MASK_MAX + ')')
        + (rows || '<div style="font-size:10.5px; color:#8a95a8; padding:6px 0;">같은 방에 다른 사람이 없다.</div>')
        + '<button id="eb-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px; text-align:center;">닫는다</button>');
    w.querySelector('#eb-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.eb-ron'), function (b) { b.onclick = function () { runMaskSet(b.dataset.c, true); runMaskMenu(); }; });
    Array.prototype.forEach.call(w.querySelectorAll('.eb-roff'), function (b) { b.onclick = function () { runMaskSet(b.dataset.c, false); runMaskMenu(); }; });
}
function runMaskSet(code, on) {
    const me = u_(), r = run(); if (!me || !r || !r.partyId) return;
    const pid = r.partyId, d = db_();
    const e = ebOf(pid); if (!e || e.lead !== me.code) return;
    e.masks = e.masks || {};
    if (on) {
        if (Object.keys(e.masks).length >= C.MASK_MAX) { alert_('가면은 둘까지입니다.'); return; }
        e.masks[code] = 1;
    } else delete e.masks[code];
    try { if (d) d.ref('darkParties/' + pid + '/eliteB/masks/' + code).set(on ? 1 : null); } catch (x) { }
    const nm = nameOf(code);
    log_(me, '[' + NAME + '] 어둠 안에서 ' + nm + ' 사원' + (on ? '에게 정예조 가면을 씌웠습니다.' : '의 가면을 거뒀습니다.'));
    try { if (r.log) r.log.push('[🎭 가면] ' + nm + (on ? ' — 씌웠다' : ' — 거뒀다')); } catch (x) { }
    try { if (typeof sendPartyChat === 'function') sendPartyChat((me.name || '') + ' 조장이 ' + nm + ' 사원' + (on ? '에게 정예조 가면을 씌웠습니다.' : '의 가면을 거뒀습니다.'), true); } catch (x) { }
}
window.ebRunMask = runMaskMenu;
(function runMaskBtn() {
    const ID = 'eb-mask-btn';
    setInterval(function () {
        try {
            const r = run(), me = u_();
            const old = document.getElementById(ID);
            const ok = r && r.isParty && r.partyId && me && wears(me) && roleIn(me.code, r.partyId) === 'lead';   // K 의 방에서도 (2026-10-29)
            if (!ok) { if (old) old.remove(); return; }
            if (old && old.isConnected) return;
            const role = document.getElementById('dro-role');
            const ov = document.getElementById('dark-run-overlay');
            if (!role || !role.parentElement || !ov || ov.style.display === 'none') return;
            const b = document.createElement('button');
            b.id = ID; b.title = '정예조 가면 — 이 방에서 고른다';
            b.style.cssText = 'background:none; border:1px solid #6b7d99; color:#cfd8e6; font-size:12px; padding:4px 8px; border-radius:4px; cursor:pointer;';
            b.textContent = '🎭';
            b.onclick = runMaskMenu;
            role.parentElement.insertBefore(b, role.nextSibling);
        } catch (e) { }
    }, 1500);
})();

// 쓰러진 것은 방에 적는다 (전원 생환 셈)
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function' || darkDeath._eb) { if (typeof darkDeath === 'function' && darkDeath._eb) clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            const me = u_(), r = run();
            try {
                if (me && r && r.isParty && r.partyId && ebOf(r.partyId)) {
                    const d = db_();
                    if (d) d.ref('darkParties/' + r.partyId + '/eliteB/dead/' + me.code).set(1).catch(function () { });
                    const e = ebOf(r.partyId); if (e) { e.dead = e.dead || {}; e.dead[me.code] = 1; }
                }
            } catch (err) { }
            return _d.apply(this, arguments);
        };
        Object.keys(_d).forEach(function (k) { try { w[k] = _d[k]; } catch (e) { } });
        w._eb = true; darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
        console.log('[정예 B조] 쓰러짐 기록 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 가죽 반장갑 — 날마다 공용시설 행운 +300% · 횟수 +3~8
// ==========================================
function msToMidnight() {
    try {
        const now = (typeof serverNow === 'function') ? serverNow() : Date.now();
        const KST = 9 * 3600e3;
        const d = new Date(now + KST);
        const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1) - KST;
        return Math.max(60e3, next - now);
    } catch (e) { return 12 * 3600e3; }
}
setInterval(function () {
    try {
        const me = u_();
        if (!me || !wears(me) || typeof ibAdd !== 'function') return;
        if (me.ebGlove === today()) return;
        me.ebGlove = today();
        const fac = rnd(C.GLOVE_FAC[0], C.GLOVE_FAC[1]);
        const ms = msToMidnight();
        ibAdd(me, 'pct', C.GLOVE_PCT, ms, '🧤 가죽 반장갑');
        ibAdd(me, 'fac', fac, ms, '🧤 가죽 반장갑');
        log_(me, '[' + NAME + '] 가죽 반장갑 — 오늘 공용시설 행운 +' + C.GLOVE_PCT + '% · 횟수 +' + fac);
        save({ ebGlove: 1, history: 1 });
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    } catch (e) { }
}, 4000);

// ==========================================
// 콘솔
// ==========================================
window.ebState = function () {
    const me = u_(), r = run();
    console.log('%c===== 🐺 （구） 정예 B조 ■■ =====', 'color:#9fb4d0; font-size:13px');
    if (!me) return;
    const r0 = run(), e0 = (r0 && r0.partyId) ? ebOf(r0.partyId) : null;
    console.log('  차고 있나:', wears(me), '· 이 방 eliteB:', e0 ? JSON.stringify({ lead: e0.lead, crew: Object.keys(e0.crew || {}), masks: Object.keys(e0.masks || {}), dead: Object.keys(e0.dead || {}) }) : '없음', '· 역할:', myRole() || '-');
    console.log('  이 판 파훼:', (run() ? (Number(run()._ebBreakN) || 0) : '-') + '/' + C.BREAK_MAX, '· 반장갑:', me.ebGlove === today() ? '받았다' : '아직', '· 늑대:', Number(me.ebWolves) || 0, '· 가면 보정: +' + C.MASK_BON, '· 구출 보정: +' + C.RESCUE_BON[0] + '~' + C.RESCUE_BON[1]);
    console.log('  함께 탐사한 사람:', Object.keys(me.ebMates || {}).map(nameOf).join(', ') || '없음');
    if (r) console.log('  탐사 중 — 역할:', myRole() || '없음', '· 배수:', myMult(), '· 늑대:', window.EBWOLF.list().map(function (w) { return w.nick + '(' + attrName(w.k) + ' ' + w.g + (w.gone ? ' · 사라짐' : '') + ')'; }).join(' · ') || '없음', '· 방 eliteB:', r.partyId ? JSON.stringify(ebOf(r.partyId)) : '-');
};
console.log('[정예 B조] ebGive(사번) · ebState() · ebMenu()');

})();
