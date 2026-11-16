// ==========================================
// ★ 🪈 영원의 단소 — 세계에 하나뿐 (2026-11-16 사용자)
// bundles.json 마지막 묶음, violin.js 바로 뒤
// ==========================================
//
// ■ 사용자
//   「어둠 동화의 뒷면에 『 🪈 영원의 단소 』 넣어주고 부속성 木으로 하자. 착용시에만 적용이 되고 전 서버에서 하나만 나오게.
//    조건은 신성의 바이올린과 같고 능력은 슬롯 한도(하루 벌 수 있는 금액) 해제 및 은행 한도 (예금 한도) 해제.」
//
// ■ 나오는 곳 · 확률 — 🎻 신성의 바이올린(violin.js)과 같다
//   Qtrew-S-003 「동화의 뒷면」 정산(renderDarkResult)에서 **0.0001%**. (2026-11-16 사용자 「10배 더 낮춰줘」 — 처음엔 0.001%)
//   배율(대성공 ×3 · 행운 ×2 · 에메랄드 · 감지하는 눈 · 토크쇼 · K.LEE …)은 타되 다 겹쳐도 **0.0072%** 까지.
//   사람 하나로 든 탐사(커스텀 장비 솔로)는 굴리지 않는다.
//   ★ 2026-11-16 사용자 「커스텀 장비로 만든 방을 여럿이서 돌 때에 ×0.1이 아니라, 커스텀 장비로 만들지 않은 방을 돌 때로」
//     → 커스텀 장비로 만들지 않은 방(보통 단체)이 ×0.1 · 커스텀 장비로 만든 방에 여럿이면 그대로 (gear-room.js room)
//   구역 회수품 표(DARK_LOOT_BY_ZONE)에는 넣지 않고 정산 뒤에 따로 굴린다 — 그래야 배율 뚜껑이 지켜지고,
//   회수품 표에서 고르는 것들(문곡성군 · 덧쓰기 · 확정 승인서)에 섞여 나오지 않는다.
//
// ■ 하나뿐
//   dansoOwner = { code, name, at } — 비어 있을 때만 적히는 트랜잭션. 먼저 적은 사람이 임자.
//   임자 자리와 맞지 않게 들고 있는 단소는 거둔다 (바이올린과 같은 guard).
//
// ■ 부속성 『木』 — 차고 있을 때만
//   ① 슬롯 하루 상한(번 몫 100만 · slot-curve.js) 이 없다 — window.slotCapOf 에 끼운다
//   ② 은행 예금 한도가 없다 — bankCap 을 감싼다 (내 계좌를 셀 때만 · 은행 칸에는 「한도 없음」)
//   벗으면 둘 다 그 자리에서 원래대로. 한도를 넘겨 맡겨 둔 예금은 그대로 남는다 (더 넣지만 못한다 · 이자로 깎이지 않는다 — bank.js)
//
// ■ 콘솔
//   dansoWho()          지금 누가 가지고 있나
//   dansoGive(사번)     상담사 — 임자가 없을 때만

(function danso() {

const NAME = '🪈 영원의 단소';
const ZONE = 'Qtrew-S-003';
const RATE = 0.000001;                // 0.0001% — 바이올린과 같다 (2026-11-16 · 처음 0.001% 에서 10배 낮춤)
const RATE_CAP = 0.000072;            // 0.0072% — 배율을 다 겹쳐도
function roomMult(g) { return (g && g.room) ? 1 : 0.1; }   // 커스텀 장비로 만든 방(여럿)은 그대로 · 그렇지 않은 방은 ×0.1
const OWNER = 'dansoOwner';
const ADMIN = 'kario0987';
const WOOD = '#7fd48a';

function db_() { return (typeof database !== 'undefined') ? database : null; }
function me()  { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function base(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && (u.equippedWeapons || []).some(function (w) { return base(w) === NAME; })); }
function has(u) { return !!u && (wears(u) || (u.inventory || []).indexOf(NAME) >= 0); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function hist(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
const DESC_EFFECT = '장착 시 부속성 『木』 — 슬롯 하루 한도와 은행 예금 한도가 사라진다.';

// ==========================================
// 1. 카탈로그
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'equip_danso',
            equipKind: true, noSell: true, darkOnly: true,
            desc: '[어둠 회수품] 동화의 맨 뒷장 너머에서 굴러 나온 단소. ' + DESC_EFFECT + ' '
                + '— 대나무 마디가 아직 푸르다. 불어 본 사람이 없는데 숨 자국이 남아 있고, 끝까지 불어도 숨이 모자라지 않는다. 세상에 하나뿐이다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 2. 임자 — 세계에 하나뿐
// ==========================================
function curOwner(v) { return (v && v.code) ? v : null; }
function readOwner() {
    const d = db_();
    if (!d) return Promise.resolve(null);
    return d.ref(OWNER).once('value').then(function (s) { return curOwner(s.val()); }).catch(function () { return null; });
}
function claim(u) {
    const d = db_();
    u = u || me();
    if (!d || !u) return Promise.resolve(false);
    return d.ref(OWNER).transaction(function (cur) {
        if (curOwner(cur)) return;                   // 이미 임자가 있다
        return { code: u.code, name: u.name, at: Date.now() };
    }, null, false).then(function (res) {
        const v = curOwner(res && res.snapshot && res.snapshot.val());
        return !!(res && res.committed && v && v.code === u.code);
    }).catch(function () { return false; });
}

// ==========================================
// 3. 정산 뒤에 따로 굴린다 (동화의 뒷면)
// ==========================================
function lootMult(u) {
    let m = 1;
    try {
        const r = (typeof darkRun !== 'undefined') ? darkRun : null;
        if (r && r.critical) m *= 3;
        if (typeof gearValue === 'function' && gearValue(u, 'luck') > 0) m *= 2;
        if (typeof emLootMult === 'function') m *= (emLootMult(u) || 1);
    } catch (e) { }
    return (m > 0 && isFinite(m)) ? m : 1;
}
function gearOf() {
    try { if (typeof window.gearRoomOf === 'function') { const g = window.gearRoomOf(); if (g) return g; } } catch (e) { }
    const r = (typeof darkRun !== 'undefined') ? darkRun : null;
    return { solo: !!(r && (Number(r.memberCount) || 1) <= 1), mult: 1 };
}
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._danso) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            // 정산이 끝나면 darkRun 이 비므로 미리 잰다 · 이미 정산했거나 쓰러진 판은 굴리지 않는다
            const r = (typeof darkRun !== 'undefined') ? darkRun : null;
            const inZone = !!(r && r.zone === ZONE && !r._dead && !r._settled);
            const g = inZone ? gearOf() : null;
            const rate = (inZone && !g.solo) ? Math.min(RATE_CAP, RATE * lootMult(me())) * roomMult(g) : 0;
            const out = _r.apply(this, arguments);
            if (rate > 0) { try { tryRoll(rate); } catch (e) { console.warn('[🪈]', e); } }
            return out;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._danso = true;
        renderDarkResult = w;
        window.renderDarkResult = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
function tryRoll(rate) {
    const u = me();
    if (!u) return;
    readOwner().then(function (o) {
        if (o) return;                               // 이미 세상에 나왔다
        if (Math.random() >= rate) return;
        return claim(u).then(function (ok) {
            if (!ok) return;
            if (!Array.isArray(u.inventory)) u.inventory = [];
            u.inventory.push(NAME);
            hist(u, '[어둠 회수품] ' + NAME + ' — 세계에 하나뿐인 것을 손에 넣었습니다.');
            save({ inventory: 1, history: 1 });
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            gHad = true;
            show();
            try { if (db_()) db_().ref('notices').push({ text: u.name + ' 사원이 ' + NAME + ' 을(를) 가지고 돌아왔습니다.', at: Date.now(), kind: 'danso' }); } catch (e) { }
        });
    });
}
function show() {
    const b = document.getElementById('dro-body') || (typeof darkBodyEl === 'function' ? darkBodyEl() : null);
    if (b && !document.getElementById('danso-got')) {
        b.insertAdjacentHTML('afterbegin',
            '<div id="danso-got" style="margin:0 0 12px 0; padding:14px; border-radius:8px;'
            + ' background:radial-gradient(circle at 30% 20%, rgba(127,212,138,0.20), rgba(0,0,0,0.45));'
            + ' border:1px solid ' + WOOD + '; box-shadow:0 0 18px rgba(127,212,138,0.30) inset;">'
            + '<div style="font-size:14px; font-weight:bold; margin-bottom:7px; color:#d8ffd8; text-shadow:0 0 6px rgba(127,212,138,.6);">' + esc(NAME) + '</div>'
            + '<div style="font-size:11px; color:#cfe8cf; line-height:1.9;">'
            + '동화의 맨 뒷장을 넘기자, 책등 틈에서 굴러 나왔다.<br>'
            + '대나무 마디가 아직 푸르다.<br><br>'
            + '불어 본 사람이 없는데 숨 자국이 남아 있다.<br>'
            + '끝까지 불어도 숨이 모자라지 않는다.<br><br>'
            + '<span style="color:' + WOOD + ';">세상에 이것 하나뿐입니다.</span></div></div>');
    }
    alert_('🪈 영원의 단소\n\n세계에 하나뿐인 것을 손에 넣었습니다.\n장착하면 부속성 『木』이 붙습니다.');
}

// ==========================================
// 4. 장착
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._danso) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const u = me();
            if (!u) return;
            if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
            if (wears(u)) { alert_('이미 장착하고 있습니다.'); return; }
            if (typeof equipFull === 'function' && equipFull(u)) { alert_('장착 자리가 가득 찼습니다.'); return; }
            u.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(u, NAME, u.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, NAME, 1); } catch (e) { }
            hist(u, '[장비 장착] ' + NAME + ' — 부속성 『木』이 붙었습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_('🪈 영원의 단소를 장착했습니다.\n\n부속성 『木』 — 차고 있는 동안\n· 슬롯으로 하루에 벌 수 있는 한도가 없습니다.\n· 은행 예금 한도가 없습니다.');
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._danso = true;
        useInventoryItem = w;
        window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 5. 『木』 — 슬롯 하루 한도 · 은행 예금 한도
// ==========================================
// ① 슬롯 — slot-curve.js capOf 가 window.slotCapOf(u) 를 본다 (🦊 호갑투 제 一 금제도 같은 자리 · 그쪽 값은 그대로 이어 준다)
setInterval(function () {
    const f = window.slotCapOf;
    if (f && f._danso) return;
    const prev = (typeof f === 'function') ? f : null;
    const w = function (u) {
        const x = u || me();
        if (wears(x)) return Infinity;
        return prev ? prev.apply(this, arguments) : 0;
    };
    w._danso = true;
    window.slotCapOf = w;
}, 1000);
// ② 은행 — bankCap(b) 은 늘 내 계좌를 셀 때 쓰인다 (입금 · 이자 · 은행 칸 · 바이올린 적립)
(function hookBankCap() {
    const iv = setInterval(function () {
        if (typeof window.bankCap !== 'function') return;
        if (window.bankCap._danso) { clearInterval(iv); return; }
        const _c = window.bankCap;
        const w = function () {
            if (wears(me())) return Infinity;
            return _c.apply(this, arguments);
        };
        w._danso = true;
        window.bankCap = w;
        try { bankCap = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 은행 칸 — 「한도 ∞ P」 대신 「한도 없음」 · 맨 위에 한 줄
(function hookBank() {
    const iv = setInterval(function () {
        if (typeof renderBank !== 'function') return;
        if (renderBank._danso) { clearInterval(iv); return; }
        const _b = renderBank;
        const w = function () {
            const out = _b.apply(this, arguments);
            try { bankPaint(); } catch (e) { }
            return out;
        };
        Object.keys(_b).forEach(function (k) { try { w[k] = _b[k]; } catch (e) { } });
        w._danso = true;
        renderBank = w;
        window.renderBank = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
function bankPaint() {
    const box = document.getElementById('bank-body');
    if (!box) return;
    const on = wears(me());
    const old = document.getElementById('danso-bank');
    if (!on) { if (old) old.remove(); return; }
    // 한도 ∞ → 한도 없음
    const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walk.nextNode())) { if (n.nodeValue.indexOf('∞') >= 0) n.nodeValue = n.nodeValue.replace(/한도\s*∞\s*P/g, '한도 없음').replace(/∞\s*P/g, '한도 없음'); }
    if (old) return;
    box.insertAdjacentHTML('afterbegin',
        '<div id="danso-bank" style="margin-bottom:12px; padding:10px 12px; border:1px solid ' + WOOD + '; border-radius:6px; background:rgba(127,212,138,0.06);">'
        + '<div style="font-size:11px; font-weight:bold; color:#d8ffd8;">木 — ' + esc(NAME) + '</div>'
        + '<div style="font-size:10px; color:#abc; margin-top:4px; line-height:1.7;">차고 있는 동안 예금 한도가 없습니다.<br><span style="color:#7a9a7a;">벗으면 원래 한도로 돌아갑니다 — 넘겨 맡긴 예금은 그대로 남습니다.</span></div></div>');
}

// ==========================================
// 6. 부속성 『木』 표시 — 전용 장비 이름표 꼬리 · 속성 선택 창 맨 밑
// ==========================================
(function hookLabel() {
    const iv = setInterval(function () {
        if (typeof gearLabel !== 'function') return;
        if (gearLabel._danso) { clearInterval(iv); return; }
        const _l = gearLabel;
        const w = function (u) {
            let s = '';
            try { s = _l.apply(this, arguments) || ''; } catch (e) { s = ''; }
            if (wears(u)) s = (s ? s + ' · ' : '') + '木 EX';
            return s;
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._danso = true;
        gearLabel = w;
        window.gearLabel = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hookPick() {
    const iv = setInterval(function () {
        if (typeof openGearAttrPick !== 'function') return;
        if (openGearAttrPick._danso) { clearInterval(iv); return; }
        const _o = openGearAttrPick;
        const w = function () {
            const out = _o.apply(this, arguments);
            setTimeout(function () { try { extraBox(); } catch (e) { } }, 60);
            return out;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._danso = true;
        openGearAttrPick = w;
        window.openGearAttrPick = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
function extraBox() {
    const box = document.getElementById('gear-modal-body');
    const u = me();
    if (!box || document.getElementById('danso-extra') || !has(u)) return;
    const on = wears(u);
    box.insertAdjacentHTML('beforeend',
        '<div id="danso-extra" style="margin-top:12px; padding-top:10px; border-top:1px dashed #3a5a3a;">'
        + '<div style="font-size:9px; color:#6a8a6a; letter-spacing:1px; margin-bottom:6px;">부속성</div>'
        + '<div style="border:1px solid ' + (on ? WOOD : '#304030') + '; border-radius:6px; padding:9px 10px; background:rgba(127,212,138,0.05);' + (on ? '' : ' opacity:0.55;') + '">'
        + '<div style="font-size:11px; font-weight:bold; color:#d8ffd8;">木 <span style="font-size:9px; letter-spacing:1px;">EX</span></div>'
        + '<div style="font-size:9px; color:#9a9; margin-top:4px; line-height:1.6;">슬롯 하루 한도와 은행 예금 한도가 사라집니다.<br>'
        + '<span style="color:#6a8a6a;">새길 수 없습니다. ' + esc(NAME) + ' 을(를) 차고 있는 동안만 붙습니다.' + (on ? ' <span style="color:#4CAF50;">— 지금 붙어 있습니다.</span>' : '') + '</span></div></div></div>');
}

// ==========================================
// 7. 하나뿐이게 지킨다 (바이올린과 같은 꼴)
// ==========================================
function strip(u, loud) {
    if (!u) return;
    let n = 0;
    if (Array.isArray(u.inventory)) {
        const before = u.inventory.length;
        u.inventory = u.inventory.filter(function (x) { return x !== NAME; });
        n += before - u.inventory.length;
    }
    if (Array.isArray(u.equippedWeapons)) {
        const gone = u.equippedWeapons.filter(function (w) { return base(w) === NAME; });
        if (gone.length) {
            u.equippedWeapons = u.equippedWeapons.filter(function (w) { return base(w) !== NAME; });
            gone.forEach(function (w) {
                try { if (typeof clearEquipOwner === 'function') clearEquipOwner(u, w); else if (u.equipOwner) delete u.equipOwner[w]; } catch (e) { }
                try { if (typeof stripNoteByItem === 'function') stripNoteByItem(u, w); } catch (e) { }
            });
            n += gone.length;
        }
    }
    if (!n) return;
    hist(u, '[🪈] ' + NAME + ' — 세상에 하나뿐이라 제자리로 돌아갔습니다.');
    save({ inventory: 1, equippedWeapons: 1, equipOwner: 1, history: 1, badge: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    if (loud) alert_('🪈 영원의 단소\n\n세상에 하나뿐인 것이라 제자리로 돌아갔습니다.');
}
let gCode = null, gHad = null, gBusy = false;
function guard() {
    const u = me(), d = db_();
    if (!u || !u.code || !d || gBusy) return;
    if (gCode !== u.code) { gCode = u.code; gHad = null; }
    if (!has(u)) { gHad = false; return; }
    if (gHad === true) return;
    const fresh = (gHad === false);                  // 접속 중에 새로 들어왔다
    gBusy = true;
    d.ref(OWNER).once('value').then(function (s) {
        const o = curOwner(s && s.val ? s.val() : null);
        if (o && o.code === u.code) { gHad = true; return; }
        if (!o && fresh) {
            return claim(u).then(function (ok) { if (ok) gHad = true; else { strip(u, true); gHad = false; } });
        }
        if (fresh) { strip(u, true); gHad = false; return; }
        // 들고 들어온 것 — 한 번 더 읽고 그래도 아니면 거둔다
        return new Promise(function (res) { setTimeout(res, 3000); }).then(function () {
            return d.ref(OWNER).once('value');
        }).then(function (s2) {
            const o2 = curOwner(s2 && s2.val ? s2.val() : null);
            const u2 = me();
            if (!u2 || u2.code !== u.code) return;
            if (o2 && o2.code === u.code) { gHad = true; return; }
            if (!o2) { return claim(u2).then(function (ok) { if (ok) gHad = true; else { strip(u2, false); gHad = false; } }); }
            strip(u2, false);
            gHad = false;
        });
    }).catch(function () { }).then(function () { gBusy = false; });
}
setInterval(function () { try { guard(); } catch (e) { } }, 2000);

// ==========================================
// 콘솔
// ==========================================
window.dansoWho = function () {
    readOwner().then(function (o) {
        console.log('%c===== 🪈 영원의 단소 =====', 'color:' + WOOD + '; font-size:13px');
        if (!o) { console.log('  아직 세상에 안 나왔습니다. (' + ZONE + ' · ' + (RATE * 100) + '% · 배율을 겹쳐도 ' + (RATE_CAP * 100) + '%)'); return; }
        console.log('  임자  :', o.name || '?');
        console.log('  나온 때:', new Date(o.at || 0).toLocaleString());
        const u = (typeof db !== 'undefined' && db.users) ? db.users[o.code] : null;
        console.log('  지금  :', u ? (wears(u) ? '차고 있음' : (has(u) ? '소지품에 있음' : '안 보임')) : '?');
    });
};
window.dansoGive = function (who) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    readOwner().then(function (o) {
        if (o) { console.warn('이미 임자가 있습니다 — ' + (o.name || '?')); return; }
        const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
            .filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0];
        if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
        claim(t).then(function (ok) {
            if (!ok) { console.warn('누가 먼저 가져갔습니다.'); return; }
            if (!Array.isArray(t.inventory)) t.inventory = [];
            t.inventory.push(NAME);
            hist(t, '[당국 개입] ' + NAME + ' 지급');
            try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
            console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' 을 줬습니다.', 'color:#4CAF50');
        });
    });
};
window.dansoDebug = { wears: wears, rate: function () { return Math.min(RATE_CAP, RATE * lootMult(me())) * roomMult(gearOf()); }, tryRoll: tryRoll };

console.log('[🪈] 영원의 단소 — ' + ZONE + ' · ' + (RATE * 100) + '% · dansoWho() · dansoGive(사번)');
})();
