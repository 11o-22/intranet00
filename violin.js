// ==========================================
// ★ 🎻 신성의 바이올린 — 세계에 하나뿐
// bundles.json 마지막 묶음, dark.js·a214-kill.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   Qtrew-A-214 「빛을 찾아서」 에서만, **0.001%** 로 나온다.
//   그리고 **한 번 나오면 다시는 안 나온다.** 누군가 가져간 뒤로는
//   아무리 굴려도 걸리지 않는다.
//
//   장착하면 새 속성 『금』(EX) 이 붙는다. 무기 속성 목록 맨 밑에
//   「부가 속성」으로 따로 적히고, 글씨에 금테가 둘린다.
//   닉네임도 금테로 감싸이고 아주 옅게 숨 쉰다.
//
//   하는 일은 단순하다 — **한 시간마다 10,000 P 가 통장에 쌓인다.**
//   통장이 가득 차면 넘친 몫은 보유 포인트로 들어온다.
//
// ■ 배율을 안 타게 따로 굴린다
//
//   정산(renderDarkResult)은 구역 회수품표를 굴리면서 배율을 먹인다 —
//   대성공 ×3, 신도 전원 처리 ×3, 행운 ×2, 에메랄드·감지하는 눈·
//   토크쇼·K.LEE 까지 겹치면 **최대 720배**다. 0.001% 를 그 표에 그냥
//   얹으면 최악의 경우 0.72% 가 된다.
//
//   그래서 표에 넣되, 정산이 돌기 **직전에 표에서 빼 두었다가** 끝난 뒤
//   따로 0.001% 로 한 번 굴린다. 신도에게 당해 쓰러질 때 도는 쪽
//   (a214-kill.js 의 fallen) 은 배율을 안 먹이므로 표에 그대로 둔다.
//
// ■ 하나뿐인 것을 어떻게 못 박나
//
//   굴림에 걸려도 그것만으로는 못 가진다. 최상위 자리 하나를 선점한다.
//
//       violinOwner = { code, name, at }
//
//   비어 있을 때만 적히는 트랜잭션이다. 먼저 적은 사람이 임자이고,
//   그 뒤로는 굴림 자체를 건너뛴다. 두 사람이 같은 순간에 굴려도
//   하나만 남는다.
//
// ■ 콘솔
//   violinWho()        지금 누가 가지고 있나
//   violinState(사번)  적립 상태
//   violinGive(사번)   상담사 — 임자가 없을 때만 (한 번뿐)

(function violin() {

const NAME = '🎻 신성의 바이올린';
const ZONE = 'Qtrew-A-214';
const RATE = 0.00001;                 // 0.001%
const OWNER = 'violinOwner';          // 최상위 자리
const PAY = 10000;                    // 한 토막에 쌓이는 몫
const BLOCK = 60 * 60 * 1000;         // 한 시간
const ADMIN = 'kario0987';
const GOLD = '#d4af37';

function db_() { return (typeof database !== 'undefined') ? database : null; }
function me()  { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function base(w) {
    try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
    catch (e) { return String(w || ''); }
}
function wears(u) {
    if (!u) return false;
    return (u.equippedWeapons || []).some(function (w) { return base(w) === NAME; });
}
function has(u) {
    if (!u) return false;
    return wears(u) || (u.inventory || []).indexOf(NAME) >= 0;
}

// ==========================================
// 1. 카탈로그 · 회수품표
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'equip_violin',
            equipKind: true, noSell: true, darkOnly: true,
            desc: '[어둠 회수품] 빛을 고스란히 받은 바이올린. 장착 시 새로운 속성을 부여한다. '
                + '— 줄이 넷 다 성해 있는데 송진 자국이 없다. 켠 적이 없다는 뜻인데, '
                + '통 안쪽만 닳아 있다. 세상에 하나뿐이다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) {
            NO_SELL_ITEMS.push(NAME);
        }
        console.log('[🎻] ' + NAME + ' 등록 — ' + ZONE + ' · ' + (RATE * 100) + '%');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 회수품표에 얹는다 (쓰러질 때 도는 쪽은 배율을 안 먹이므로 그대로 둔다)
(function addLoot() {
    const iv = setInterval(function () {
        if (typeof DARK_LOOT_BY_ZONE === 'undefined') return;
        clearInterval(iv);
        if (!DARK_LOOT_BY_ZONE[ZONE]) DARK_LOOT_BY_ZONE[ZONE] = [];
        const arr = DARK_LOOT_BY_ZONE[ZONE];
        if (!arr.some(function (l) { return l.name === NAME; })) {
            arr.push({ name: NAME, chance: RATE });
        }
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 2. 임자 — 세계에 하나뿐
// ==========================================
let ownerCache = null, ownerAt = 0;

function readOwner(force) {
    const d = db_();
    if (!d) return Promise.resolve(null);
    if (!force && ownerCache !== null && Date.now() - ownerAt < 60000) {
        return Promise.resolve(ownerCache);
    }
    return d.ref(OWNER).once('value').then(function (s) {
        ownerCache = s.val() || null;
        ownerAt = Date.now();
        return ownerCache;
    }).catch(function () { return ownerCache; });
}

// 비어 있을 때만 적힌다. 먼저 적은 사람이 임자다.
function claim() {
    const d = db_(), u = me();
    if (!d || !u) return Promise.resolve(false);
    return d.ref(OWNER).transaction(function (cur) {
        if (cur && cur.code) return;                 // 이미 임자가 있다 — 멈춘다
        return { code: u.code, name: u.name, at: Date.now() };
    }, null, false).then(function (res) {
        const v = res && res.snapshot && res.snapshot.val();
        ownerCache = v || null; ownerAt = Date.now();
        return !!(res && res.committed && v && v.code === u.code);
    }).catch(function () { return false; });
}

// ==========================================
// 3. 정산에서 따로 굴린다 (배율을 안 타게)
// ==========================================
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._violin) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const inZone = (typeof darkRun !== 'undefined') && darkRun && darkRun.zone === ZONE;
            let pulled = null;
            // 표에서 잠시 뺀다 — 안 그러면 배율을 먹는다
            try {
                if (inZone && typeof DARK_LOOT_BY_ZONE !== 'undefined') {
                    const arr = DARK_LOOT_BY_ZONE[ZONE] || [];
                    const i = arr.findIndex(function (l) { return l.name === NAME; });
                    if (i >= 0) pulled = arr.splice(i, 1)[0];
                }
            } catch (e) { }
            let out;
            try { out = _r.apply(this, arguments); }
            finally {
                try { if (pulled) DARK_LOOT_BY_ZONE[ZONE].push(pulled); } catch (e) { }
            }
            if (inZone) { try { tryRoll(); } catch (e) { console.warn('[🎻]', e); } }
            return out;
        };
        w._violin = true;
        renderDarkResult = w;
        window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[🎻] 정산 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function tryRoll() {
    const u = me();
    if (!u) return;
    readOwner(true).then(function (o) {
        if (o && o.code) return;                     // 이미 세상에 나왔다
        if (Math.random() >= RATE) return;
        return claim().then(function (ok) {
            if (!ok) return;                         // 같은 순간에 누가 먼저 적었다
            if (!Array.isArray(u.inventory)) u.inventory = [];
            u.inventory.push(NAME);
            try { if (typeof addHistoryLog === 'function')
                addHistoryLog(u, '[어둠 회수품] ' + NAME + ' — 세계에 하나뿐인 것을 손에 넣었습니다.'); } catch (e) { }
            try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            show();
            try {
                if (db_()) db_().ref('notices').push({
                    text: u.name + ' 사원이 ' + NAME + ' 을(를) 가지고 돌아왔습니다.',
                    at: Date.now(), kind: 'violin'
                });
            } catch (e) { }
        });
    });
}

function show() {
    const b = document.getElementById('dro-body')
        || (typeof darkBodyEl === 'function' ? darkBodyEl() : null);
    if (!b || document.getElementById('violin-got')) return;
    css();
    b.insertAdjacentHTML('afterbegin',
        '<div id="violin-got" style="margin:0 0 12px 0; padding:14px; border-radius:8px;'
        + ' background:radial-gradient(circle at 30% 20%, rgba(212,175,55,0.22), rgba(0,0,0,0.45));'
        + ' border:1px solid ' + GOLD + '; box-shadow:0 0 18px rgba(212,175,55,0.35) inset;">'
        + '<div class="violin-gold" style="font-size:14px; font-weight:bold; margin-bottom:7px;">'
        + '🎻 신성의 바이올린</div>'
        + '<div style="font-size:11px; color:#e8d9a8; line-height:1.9;">'
        + '계단 아래 제일 어두운 자리에 세워져 있었다.<br>'
        + '빛을 등진 것이 아니라 빛을 다 받고 서 있었다.<br><br>'
        + '줄이 넷 다 성한데 송진 자국이 없다. 켠 적이 없다는 뜻인데,<br>'
        + '통 안쪽만 반질반질하게 닳아 있다.<br><br>'
        + '<span style="color:' + GOLD + ';">세상에 이것 하나뿐입니다.</span></div></div>');
    try { if (typeof showCustomAlert === 'function')
        showCustomAlert('🎻 신성의 바이올린\n\n세계에 하나뿐인 것을 손에 넣었습니다.\n'
            + '장착하면 『금』 속성이 붙습니다.'); } catch (e) { }
}

// ==========================================
// 4. 장착
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._violin) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const u = me();
            if (!u) return;
            if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
            if (wears(u)) { showCustomAlert('이미 장착하고 있습니다.'); return; }
            if (u.equippedWeapons.length >= 12) { showCustomAlert('장착 자리가 가득 찼습니다.'); return; }
            u.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(u, NAME, u.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, NAME, 1); } catch (e) { }
            if (!u.violinAt) u.violinAt = Date.now();     // 적립 기준 시각
            if (u.violinPaid == null) u.violinPaid = 0;
            try { if (typeof addHistoryLog === 'function')
                addHistoryLog(u, '[장비 장착] ' + NAME + ' — 『금』 속성이 붙었습니다.'); } catch (e) { }
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            paintName();
            showCustomAlert('🎻 신성의 바이올린을 장착했습니다.\n\n'
                + '『금』 EX — 한 시간마다 10,000 P 가 통장에 쌓입니다.\n'
                + '통장이 가득 차면 넘친 몫은 보유 포인트로 들어옵니다.');
        };
        w._violin = true;
        useInventoryItem = w;
        window.useInventoryItem = w;
        clearInterval(iv);
        console.log('[🎻] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 5. 『금』 — 무기 속성 맨 밑의 부가 속성
// ==========================================
//
//   GEAR_ATTRS 에 맨 밑으로 넣는다 (객체 넣은 순서대로 그려진다).
//   다만 **새길 수는 없다.** 전용 장비에 새기는 것이 아니라 바이올린을
//   차고 있는 동안만 붙는 것이라서, 속성 선택 모달에서는 고를 수 없게
//   막고 「부가 속성」으로 따로 적는다.
(function addAttr() {
    const iv = setInterval(function () {
        if (typeof GEAR_ATTRS === 'undefined' || typeof GEAR_BASE === 'undefined') return;
        clearInterval(iv);
        GEAR_ATTRS.gold = { name: '금', icon: '✶', extra: true,
            desc: '한 시간마다 10,000 P 가 통장에 쌓입니다. 통장이 가득 차면 보유 포인트로 들어옵니다.' };
        GEAR_BASE.gold = PAY;
        try { if (typeof GEAR_MULT !== 'undefined') GEAR_MULT.EX = 1; } catch (e) { }
        try { if (typeof GEAR_MARK !== 'undefined') GEAR_MARK.EX = '✶'; } catch (e) { }
        try {
            if (typeof EPIC_ATTR_NAME !== 'undefined') EPIC_ATTR_NAME.gold = '금';
            if (typeof EPIC_ATTR_ICON !== 'undefined') EPIC_ATTR_ICON.gold = '✶';
        } catch (e) { }
        console.log('[🎻] 『금』 속성 등록 (부가 · EX)');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// gearValue — 『금』은 전용 장비가 아니라 바이올린에서 온다
(function hookValue() {
    const iv = setInterval(function () {
        if (typeof gearValue !== 'function') return;
        if (gearValue._violin) { clearInterval(iv); return; }
        const _g = gearValue;
        const w = function (user, attr) {
            if (attr === 'gold') return wears(user) ? PAY : 0;
            return _g.apply(this, arguments);
        };
        w._violin = true;
        gearValue = w;
        window.gearValue = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 속성 선택 모달 — 맨 밑에 「부가 속성」 칸을 붙이고, 고를 수는 없게
(function hookPick() {
    const iv = setInterval(function () {
        if (typeof openGearAttrPick !== 'function') return;
        if (openGearAttrPick._violin) { clearInterval(iv); return; }
        const _o = openGearAttrPick;
        const w = function () {
            // 고를 수 있는 목록에서는 빼 둔다
            let saved = null;
            try {
                if (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS.gold) {
                    saved = GEAR_ATTRS.gold;
                    delete GEAR_ATTRS.gold;
                }
            } catch (e) { }
            let out;
            try { out = _o.apply(this, arguments); }
            finally { try { if (saved) GEAR_ATTRS.gold = saved; } catch (e) { } }
            setTimeout(function () { try { extraBox(); } catch (e) { } }, 40);
            return out;
        };
        w._violin = true;
        openGearAttrPick = w;
        window.openGearAttrPick = w;
        clearInterval(iv);
        console.log('[🎻] 속성 목록 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function extraBox() {
    const box = document.getElementById('gear-modal-body');
    if (!box || document.getElementById('violin-extra')) return;
    css();
    const on = wears(me());
    box.insertAdjacentHTML('beforeend',
        '<div id="violin-extra" style="margin-top:12px; padding-top:10px;'
        + ' border-top:1px dashed #5a4a2a;">'
        + '<div style="font-size:9px; color:#8a7a4a; letter-spacing:1px; margin-bottom:6px;">부가 속성</div>'
        + '<div style="border:1px solid ' + (on ? GOLD : '#4a4030') + '; border-radius:6px;'
        + ' padding:9px 10px; background:rgba(212,175,55,0.05);' + (on ? '' : ' opacity:0.55;') + '">'
        + '<div class="violin-gold" style="font-size:11px; font-weight:bold;">✶ 금 '
        + '<span style="font-size:9px; letter-spacing:1px;">EX</span></div>'
        + '<div style="font-size:9px; color:#998; margin-top:4px; line-height:1.6;">'
        + '한 시간마다 10,000 P 가 통장에 쌓입니다. 통장이 가득 차면 보유 포인트로 들어옵니다.<br>'
        + '<span style="color:#8a7a4a;">새길 수 없습니다. ' + esc(NAME) + ' 을(를) 차고 있는 동안만 붙습니다.'
        + (on ? ' <span style="color:#4CAF50;">— 지금 붙어 있습니다.</span>' : '') + '</span>'
        + '</div></div></div>');
}

// 전용 장비 이름표에도 꼬리를 단다
(function hookLabel() {
    const iv = setInterval(function () {
        if (typeof gearLabel !== 'function') return;
        if (gearLabel._violin) { clearInterval(iv); return; }
        const _l = gearLabel;
        const w = function (u) {
            let s = '';
            try { s = _l.apply(this, arguments) || ''; } catch (e) { s = ''; }
            if (wears(u)) s = (s ? s + ' · ' : '') + '✶ 금 EX';
            return s;
        };
        w._violin = true;
        gearLabel = w;
        window.gearLabel = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 6. 금테 — 글씨와 닉네임
// ==========================================
function css() {
    if (document.getElementById('violin-css')) return;
    const s = document.createElement('style');
    s.id = 'violin-css';
    s.textContent =
        // 금테 두른 글씨 — 획 둘레에 얇게
        '.violin-gold{color:#ffe9a8 !important;'
        + '-webkit-text-stroke:0.4px ' + GOLD + ';'
        + 'text-shadow:0 0 1px ' + GOLD + ',0 0 6px rgba(212,175,55,0.55);}'
        // 닉네임 — 금테로 감싸고 아주 옅게 숨 쉰다
        + '.violin-name{display:inline-block; padding:0 6px; border-radius:6px;'
        + 'border:1px solid ' + GOLD + '; color:#ffe9a8 !important;'
        + '-webkit-text-stroke:0.3px ' + GOLD + ';'
        + 'background:linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.04));'
        + 'animation:violinBreath 3.2s ease-in-out infinite;}'
        + '@keyframes violinBreath{'
        + '0%,100%{box-shadow:0 0 4px rgba(212,175,55,0.40),0 0 1px rgba(212,175,55,0.7) inset;}'
        + '50%{box-shadow:0 0 11px rgba(212,175,55,0.80),0 0 3px rgba(212,175,55,0.9) inset;}}'
        + '@media (prefers-reduced-motion: reduce){'
        + '.violin-name{animation:none; box-shadow:0 0 7px rgba(212,175,55,0.6);}}';
    (document.head || document.documentElement).appendChild(s);
}

function dress(el) {
    if (!el || el.dataset.vl) return;
    el.dataset.vl = '1';
    el.classList.add('violin-name');
}

// 이름이 그려지는 자리마다 다시 입힌다. 자리마다 꼴이 달라서
// 「이름만 든 span」이 있는 곳은 그 span 을, 없는 곳은 첫 글자 마디를 감싼다.
function wrapFirstText(el) {
    if (!el || el.dataset.vl) return;
    for (let i = 0; i < el.childNodes.length; i++) {
        const n = el.childNodes[i];
        if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) {
            const sp = document.createElement('span');
            sp.textContent = n.nodeValue.trim();
            sp.className = 'violin-name';
            sp.dataset.vl = '1';
            el.replaceChild(sp, n);
            el.dataset.vl = '1';
            return;
        }
        if (n.nodeType === 1 && n.tagName === 'SPAN' && !n.className) { dress(n); el.dataset.vl = '1'; return; }
    }
}

function paintName() {
    try {
        css();
        const u = me();
        // ① 내 사원증
        const d = document.getElementById('display-name');
        if (d) { if (wears(u)) dress(d); else { d.classList.remove('violin-name'); delete d.dataset.vl; } }

        // ② 사원 목록 카드
        document.querySelectorAll('#employee-cards-container .emp-list-card').forEach(function (card) {
            const m = (card.getAttribute('onclick') || '').match(/'([^']+)'/);
            if (!m) return;
            const who = (typeof db !== 'undefined' && db.users) ? db.users[m[1]] : null;
            if (!wears(who)) return;
            const t = card.querySelector('.emp-list-title');
            if (!t) return;
            const sp = t.querySelector('span:not(.emp-role-tag)');
            if (sp) dress(sp);
        });

        // ③ 파티 채팅 · 어둠 채팅
        document.querySelectorAll('.pchat-name').forEach(function (el) {
            const nm = (el.innerText || '').trim();
            if (!nm) return;
            const hit = (typeof db !== 'undefined' && db.users) && Object.keys(db.users).some(function (c) {
                const x = db.users[c];
                return x && x.name === nm && wears(x);
            });
            if (hit) dress(el);
        });
    } catch (e) { }
}

// 사원 상세 모달
(function hookDetail() {
    const iv = setInterval(function () {
        if (typeof openEmpDetailModal !== 'function') return;
        if (openEmpDetailModal._violin) { clearInterval(iv); return; }
        const _o = openEmpDetailModal;
        const w = function (code) {
            const out = _o.apply(this, arguments);
            try {
                const u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
                if (wears(u)) {
                    css();
                    const box = document.getElementById('emp-detail-card-container');
                    const el = box && box.querySelector('.emp-name');
                    if (el) wrapFirstText(el);
                }
            } catch (e) { }
            return out;
        };
        w._violin = true;
        openEmpDetailModal = w;
        window.openEmpDetailModal = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

['updateUI', 'renderEmployeeCards', 'renderChatLog'].forEach(function (n) {
    const iv = setInterval(function () {
        const f = window[n];
        if (typeof f !== 'function') return;
        if (f._violin) { clearInterval(iv); return; }
        const _o = f;
        // 앞사람이 터져도 금테는 다시 입힌다 (finally)
        const w = function () {
            try { return _o.apply(this, arguments); }
            finally { try { paintName(); } catch (e) { } }
        };
        w._violin = true;
        window[n] = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
});

window.violinPaint = function () { try { paintName(); } catch (e) { console.warn(e); } };

// ==========================================
// 7. 적립 — 한 시간에 10,000 P
// ==========================================
//
//   기준 시각을 지금으로 되돌리지 않는다. **이미 준 토막 수**를
//   적어 두고 그만큼만 더 준다 (cage.js 의 족갑과 같은 꼴).
//   화면이 둘 켜져 있어도 두 번 주지 않는다.
//
//   통장(bank/<사번>/deposit)에 먼저 넣고, 한도에 막혀 못 들어간 몫은
//   보유 포인트로 돌린다. 통장 한도를 넘겨 쌓이는 일은 없다.
function blocksDue(u) {
    if (!u || !u.violinAt) return 0;
    const run = Date.now() - u.violinAt;
    if (run < 0) return 0;
    const blocks = Math.floor(run / BLOCK);
    return Math.max(0, Math.min(72, blocks - (u.violinPaid || 0)));   // 한 번에 사흘치까지
}

let paying = false;
function settle() {
    const u = me();
    if (!u || paying) return;
    if (!wears(u)) return;
    if (!u.violinAt) {
        u.violinAt = Date.now();
        u.violinPaid = u.violinPaid || 0;
        try { if (typeof saveFields === 'function') saveFields({ violinAt: 1, violinPaid: 1 }); } catch (e) { }
        return;
    }
    const n = blocksDue(u);
    if (n <= 0) return;
    paying = true;

    const amount = n * PAY;
    const was = u.violinPaid || 0;
    u.violinPaid = was + n;
    try { if (typeof saveFields === 'function') saveFields({ violinPaid: 1, violinAt: 1 }); } catch (e) { }

    toBank(amount).then(function (r) {
        paying = false;
        const intoBank = r.bank, over = r.over;
        if (over > 0) {
            try { if (typeof changePoints === 'function') changePoints(over); } catch (e) { }
        }
        try {
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(u, '[🎻 금] ' + n + '시간분 ' + amount.toLocaleString() + ' P — 통장 '
                    + intoBank.toLocaleString() + ' P'
                    + (over > 0 ? ' · 넘친 ' + over.toLocaleString() + ' P 는 보유 포인트로' : ''));
            }
            if (typeof saveFields === 'function') saveFields({ history: 1 });
        } catch (e) { }
        try {
            if (typeof showDarkToast === 'function') showDarkToast('🎻 ' + amount.toLocaleString() + ' P 적립');
            else if (typeof showPointGainEffect === 'function' && over > 0) showPointGainEffect(over);
        } catch (e) { }
        try { if (typeof renderBank === 'function'
            && document.getElementById('bank-body')) renderBank(); } catch (e) { }
    }).catch(function () {
        paying = false;
        u.violinPaid = was;                       // 못 넣었으면 되돌린다
        try { if (typeof saveFields === 'function') saveFields({ violinPaid: 1 }); } catch (e) { }
    });
}

// 통장에 넣고, 못 들어간 몫을 돌려준다
function toBank(amount) {
    const d = db_(), u = me();
    if (!d || !u) return Promise.resolve({ bank: 0, over: amount });
    let put = 0;
    return d.ref('bank/' + u.code).transaction(function (b) {
        if (!b) return;                           // 계좌가 없다 — 전부 포인트로
        const cap = (typeof bankCap === 'function') ? bankCap(b) : Infinity;
        const dep = Number(b.deposit) || 0;
        const room = Math.max(0, cap - dep);
        put = Math.min(room, amount);
        if (put <= 0) return;                     // 가득 찼다 — 손대지 않는다
        b.deposit = dep + put;
        return b;
    }, null, false).then(function (res) {
        const ok = !!(res && res.committed);
        const into = ok ? put : 0;
        return { bank: into, over: amount - into };
    }).catch(function () { return { bank: 0, over: amount }; });
}

// 벗으면 셈을 멈춘다. 다시 차면 그때부터 다시 센다.
function watchWear() {
    const u = me();
    if (!u) return;
    if (wears(u)) {
        if (!u.violinAt) {
            u.violinAt = Date.now();
            u.violinPaid = 0;
            try { if (typeof saveFields === 'function') saveFields({ violinAt: 1, violinPaid: 1 }); } catch (e) { }
        }
        settle();
    } else if (u.violinAt) {
        u.violinAt = 0;
        u.violinPaid = 0;
        try { if (typeof saveFields === 'function') saveFields({ violinAt: 1, violinPaid: 1 }); } catch (e) { }
    }
}

setTimeout(function () {
    watchWear();
    setInterval(function () { try { watchWear(); } catch (e) { } }, 60000);
    setInterval(function () { try { paintName(); } catch (e) { } }, 4000);
}, 6000);

// 통장 화면에 한 줄
(function hookBank() {
    const iv = setInterval(function () {
        if (typeof renderBank !== 'function') return;
        if (renderBank._violin) { clearInterval(iv); return; }
        const _b = renderBank;
        const w = function () {
            const out = _b.apply(this, arguments);
            try {
                const u = me();
                if (!wears(u)) return out;
                const box = document.getElementById('bank-body');
                if (!box || document.getElementById('violin-bank')) return out;
                css();
                const left = u.violinAt
                    ? Math.max(0, BLOCK - ((Date.now() - u.violinAt) % BLOCK)) : BLOCK;
                box.insertAdjacentHTML('afterbegin',
                    '<div id="violin-bank" style="margin-bottom:12px; padding:11px 12px;'
                    + ' border:1px solid ' + GOLD + '; border-radius:6px;'
                    + ' background:rgba(212,175,55,0.06);">'
                    + '<div class="violin-gold" style="font-size:11px; font-weight:bold;">✶ 금 — 🎻 신성의 바이올린</div>'
                    + '<div style="font-size:10px; color:#bba; margin-top:5px; line-height:1.7;">'
                    + '한 시간마다 <b style="color:#ffd700;">' + PAY.toLocaleString() + ' P</b> 가 쌓입니다.<br>'
                    + '다음 적립까지 ' + Math.floor(left / 60000) + '분 · 지금까지 '
                    + ((u.violinPaid || 0) * PAY).toLocaleString() + ' P<br>'
                    + '<span style="color:#8a7a4a;">한도를 넘긴 몫은 보유 포인트로 들어옵니다.</span>'
                    + '</div></div>');
            } catch (e) { }
            return out;
        };
        w._violin = true;
        renderBank = w;
        window.renderBank = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 확인
// ==========================================
// 손으로 한 번 정산 — 지난 시간만큼만 준다 (여러 번 불러도 두 번 안 준다)
window.violinPay = function () { try { settle(); } catch (e) { console.warn(e); } };

window.violinWho = function () {
    readOwner(true).then(function (o) {
        console.log('%c===== 🎻 신성의 바이올린 =====', 'color:#d4af37; font-size:13px');
        if (!o || !o.code) { console.log('  아직 세상에 안 나왔습니다. (' + (RATE * 100) + '%)'); return; }
        console.log('  임자  :', o.name || o.code);
        console.log('  나온 때:', new Date(o.at || 0).toLocaleString());
        const u = (typeof db !== 'undefined' && db.users) ? db.users[o.code] : null;
        console.log('  지금  :', u ? (wears(u) ? '차고 있음' : (has(u) ? '소지품에 있음' : '안 보임')) : '?');
    });
};

window.violinState = function (who) {
    let u = me();
    if (who && typeof db !== 'undefined' && db.users) {
        u = Object.keys(db.users).map(function (c) { return db.users[c]; })
            .filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0] || u;
    }
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 🎻 =====', 'color:#d4af37; font-size:13px');
    console.log('  장착    :', wears(u) ? 'O' : '✗');
    console.log('  기준 시각:', u.violinAt ? new Date(u.violinAt).toLocaleString() : '없음');
    console.log('  준 토막  :', (u.violinPaid || 0) + '시간 · ' + ((u.violinPaid || 0) * PAY).toLocaleString() + ' P');
    console.log('  밀린 토막:', blocksDue(u) + '시간');
};

window.violinGive = function (who) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    readOwner(true).then(function (o) {
        if (o && o.code) { console.warn('이미 임자가 있습니다 — ' + (o.name || o.code)); return; }
        const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
            .filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0];
        if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
        db_().ref(OWNER).transaction(function (cur) {
            if (cur && cur.code) return;
            return { code: t.code, name: t.name, at: Date.now() };
        }, null, false).then(function (res) {
            if (!(res && res.committed)) { console.warn('누가 먼저 가져갔습니다.'); return; }
            if (!Array.isArray(t.inventory)) t.inventory = [];
            t.inventory.push(NAME);
            try { if (typeof addHistoryLog === 'function')
                addHistoryLog(t, '[당국 개입] ' + NAME + ' 지급'); } catch (e) { }
            try { if (typeof updateUserFields === 'function')
                updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
            ownerCache = null;
            console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' 을 줬습니다.', 'color:#4CAF50');
        });
    });
};

console.log('[🎻] violinWho() · violinState(사번) · violinGive(사번)');

})();
