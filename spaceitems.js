// ==========================================
// ★ 우주 쇼핑몰 신규 4종
// bundles.json 마지막 그룹, newitems.js·newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
//   1. 에메랄드 하네스  20,000 P   공용시설 행운 200% · 탐사 회수품 2배
//   2. 에메랄드 목줄    20,000 P   랜덤박스 행운 100% · 탐사 판정 +3
//        둘 다 채워져 있으면  공용시설 250% · 랜덤박스 150%
//        둘 다 「남이 채워 줘야」 효력이 돈다 (다이아 플러그와 같은 규칙)
//   3. 복사기        2,000,000 P   하루 두 개까지 복제. 복사기는 안 사라진다
//   4. 우리가 도움   9,999,999 P   ???????? (전용 장비의 다음 속성 자리 하나 · 최대 5)
//
//   넷 다 진열 확률 0.5% 다. (RARE_ALIEN_RATE)
//
// ■ 행운 「200%」를 어떻게 셈했나
//
//   이 게임은 유리구슬 「행운 300% 상승」을 m *= 4 로, 도깨비 불
//   「행운 100% 상승」을 m *= 2 로 적고 있다. 즉 N% 는 ×(1 + N/100) 이다.
//   그래서 200% → ×3, 250% → ×3.5 로 넣었다. 다르게 보신다면 아래
//   EM.harness / EM.set 숫자만 고치면 된다.
//
// ■ 남이 채워 줘야 한다
//
//   장착한 이름표의 주인(equipOwner)이 자기 자신이 아닐 때만 효력이 돈다.
//   dark.js:4476 의 plugActive 와 같은 규칙이고, 그 함수가 있으면 그것을 쓴다.
//
// ■ 복제품
//
//   이름 앞에 「[복제품] 」이 붙는다. 쓰면 원래 물건의 효과가 돌지만
//       · 시간 효과는 절반    (24시간짜리 물약 → 12시간)
//       · 장착형은 24시간 뒤 사라진다
//   원본은 그대로 남는다. 복사기도 안 없어진다.
//
//   효과를 절반으로 만드는 방법은 addTimedEffect 의 시간을 반으로 줄이는
//   것이다. 그래서 「시간으로 재는 효과」는 전부 절반이 되지만, 시간이
//   아닌 것(한 번 쓰고 끝나는 포인트 지급 같은 것)은 원본과 같이 돈다.
//   그런 물건까지 반으로 만들려면 물건마다 따로 적어야 한다.
//
// ■ 확인용 콘솔
//
//   emState()     지금 내 에메랄드가 효력이 도는지
//   copyState()   오늘 복사한 횟수와 들고 있는 복제품
//   spaceOdds()   네 물건의 진열 확률

(function spaceItems() {

const HARNESS = '에메랄드 하네스';
const COLLAR  = '에메랄드 목줄';
const COPIER  = '복사기';
const GIFT    = '우리가 도움';
const COPY_TAG = '[복제품] ';

const EM = {
    harness: 3.0,      // 공용시설 행운 200% → ×3
    set:     3.5,      // 둘 다  250% → ×3.5
    box:     2.0,      // 랜덤박스 행운 100%
    boxSet:  2.5,      // 둘 다  150%
    loot:    2,        // 회수품 확률 곱
    dark:    3         // 탐사 판정 +3
};
const COPY_PER_DAY = 2;
const COPY_EQUIP_MS = 24 * 3600 * 1000;
const RATE = 0.005;    // 진열 확률 0.5%

const HOUR = 3600 * 1000;

// ==========================================
// 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);

        ITEM_CATALOG[HARNESS] = {
            price: 20000, usable: true, targetable: true, effect: 'equip_em_harness',
            desc: '에메랄드가 박힌 가슴줄. 남이 채워 줘야 조여든다. '
                + '공용시설 행운 200% 상승, 어둠에서 회수품이 두 배로 나온다. '
                + '목줄과 함께 채워지면 둘 다 더 세진다.'
        };
        ITEM_CATALOG[COLLAR] = {
            price: 20000, usable: true, targetable: true, effect: 'equip_em_collar',
            desc: '에메랄드가 박힌 목줄. 남이 채워 줘야 잠긴다. '
                + '랜덤박스 행운 100% 상승, 어둠 판정에 +3. '
                + '하네스와 함께 채워지면 둘 다 더 세진다.'
        };
        ITEM_CATALOG[COPIER] = {
            price: 2000000, usable: true, targetable: false, effect: 'copier', noSell: true,
            desc: '우주 쇼핑몰의 물품을 하루 두 개까지 베낀다. 기계는 닳지 않는다. '
                + '베낀 것은 본래의 절반만 듣고, 장착하는 것이면 하루 만에 삭는다.'
        };
        ITEM_CATALOG[GIFT] = {
            price: 9999999, usable: true, targetable: false, effect: 'gift_slot4', noSell: true,
            desc: '????????'
        };

        [HARNESS, COLLAR, COPIER, GIFT].forEach(function (n) {
            if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(n) < 0) {
                ALIEN_ITEMS_POOL.push(n);
            }
            if (!window.RARE_ALIEN_RATE) window.RARE_ALIEN_RATE = {};
            window.RARE_ALIEN_RATE[n] = RATE;
        });
        if (typeof NO_SELL_ITEMS !== 'undefined') {
            [COPIER, GIFT].forEach(function (n) {
                if (NO_SELL_ITEMS.indexOf(n) < 0) NO_SELL_ITEMS.push(n);
            });
        }
        // 이미 들고 있는 복제품을 다시 등록한다 (새로고침하면 사라지지 않게)
        regCopies();
        console.log('[우주] 신규 4종 등록 — 진열 확률 ' + (RATE * 100) + '%');
    }, 400);
})();

// ==========================================
// 남이 채워 줬는가
// ==========================================
function byOther(u, name) {
    if (!u) return false;
    if (typeof plugActive === 'function') { try { return !!plugActive(u, name); } catch (e) { } }
    if (!Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        if (b !== name) return false;
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        return o && o !== u.code;
    });
}
function emOn(u) {
    const h = byOther(u, HARNESS), c = byOther(u, COLLAR);
    return { h: h, c: c, set: h && c };
}
window._emOn = emOn;

// ==========================================
// 1·2. 에메랄드 — 채우기
// ==========================================
(function equipEm() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._emerald) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || (cat.effect !== 'equip_em_harness' && cat.effect !== 'equip_em_collar')) {
                return _a.apply(this, arguments);
            }
            if (!targetUser || !currentUser) return false;

            if (!Array.isArray(targetUser.equippedWeapons)) targetUser.equippedWeapons = [];
            if (targetUser.equippedWeapons.length >= 12) {
                showCustomAlert(isOthers ? '대상의 장착 슬롯이 가득 찼습니다.' : '장착 슬롯이 가득 찼습니다.');
                return false;
            }
            const already = targetUser.equippedWeapons.some(function (w) {
                const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                return b === itemName;
            });
            if (already) { showCustomAlert('이미 채워져 있습니다.'); return false; }

            const label = isOthers ? (itemName + ' (장착자: ' + currentUser.name + ')') : itemName;
            targetUser.equippedWeapons.push(label);
            if (typeof setEquipOwner === 'function') {
                setEquipOwner(targetUser, label, isOthers ? currentUser.code : targetUser.code);
            }
            if (typeof appendBadgeNoteToUser === 'function') {
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
            }
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(targetUser, '[장착] ' + (isOthers ? currentUser.name + ' 사원이 ' : '')
                    + itemName + '을(를) 채웠습니다.');
            }
            showCustomAlert(isOthers
                ? (targetUser.name + ' 사원에게 ' + itemName + '을(를) 채웠습니다.')
                : (itemName + '을(를) 찼습니다.\n\n다만 스스로 채운 것에는 힘이 돌지 않습니다.'));
            return true;
        };
        applyItemEffect._emerald = true;
        clearInterval(iv);
        console.log('[우주] 에메랄드 두 종 채우기 연결');
    }, 400);
})();

// --- 공용시설 행운 ---
(function hookLuck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._emerald) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        facilityLuckMult = function (user) {
            let m = _f.apply(this, arguments);
            const u = user || currentUser;
            if (!u) return m;
            const e = emOn(u);
            if (e.set) m *= EM.set;
            else if (e.h) m *= EM.harness;
            return m;
        };
        facilityLuckMult._emerald = true;
        clearInterval(iv);
        console.log('[우주] 에메랄드 — 공용시설 행운 연결');
    }, 400);
})();

// --- 탐사 판정 +3 ---
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._emerald) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            let b = _r.apply(this, arguments);
            if (currentUser && emOn(currentUser).c) b += EM.dark;
            return b;
        };
        rollDarkBonus._emerald = true;
        clearInterval(iv);
        console.log('[우주] 에메랄드 목줄 — 어둠 판정 +' + EM.dark);
    }, 400);
})();

// --- 회수품 확률 · 랜덤박스 행운 : index.html 이 불러 쓴다 ---
window.emLootMult = function (user) {
    const u = user || currentUser;
    return (u && emOn(u).h) ? EM.loot : 1;
};
window.emBoxLuck = function (user) {
    const u = user || currentUser;
    if (!u) return 1;
    const e = emOn(u);
    return e.set ? EM.boxSet : (e.c ? EM.box : 1);
};

// ==========================================
// 3. 복사기
// ==========================================
function dayKey() {
    const d = new Date();
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function copyLeft(u) {
    u = u || currentUser;
    if (!u) return 0;
    if (u.copyDay !== dayKey()) return COPY_PER_DAY;
    return Math.max(0, COPY_PER_DAY - (u.copyCount || 0));
}
function realOf(name) {
    return String(name || '').indexOf(COPY_TAG) === 0 ? String(name).slice(COPY_TAG.length) : null;
}

// 베낄 수 있는 것 — 우주 쇼핑몰에 깔리는 것 중에서 고른다
const NO_COPY = ['복사기', '우리가 도움', '여우구슬', '금고', '사직서', '랜덤박스', '🫙 소원권', '소원권',
                 '황룡의 눈', '산군의 도움'];
function copyables() {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return [];
    return ALIEN_ITEMS_POOL.filter(function (n) {
        if (NO_COPY.indexOf(n) >= 0) return false;
        if (realOf(n)) return false;
        const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[n] : null;
        return !!c;
    }).sort();
}

// 복제품을 소지품 목록이 알아보게 등록해 둔다
function regOne(real) {
    if (typeof ITEM_CATALOG === 'undefined') return;
    const src = ITEM_CATALOG[real];
    if (!src) return;
    const nm = COPY_TAG + real;
    if (ITEM_CATALOG[nm]) return;
    const wornLike = String(src.effect || '').indexOf('equip') === 0 || !!src.equipKind;
    ITEM_CATALOG[nm] = {
        price: 0, usable: !!src.usable, targetable: !!src.targetable,
        effect: 'copy_of', copyOf: real, noSell: true,
        equipKind: wornLike,                       // 장비 칸으로 세어지게 (equip-kind.js)
        restrictDept: src.restrictDept, restrictRank: src.restrictRank,
        desc: '베껴 낸 것. 본래의 절반만 듣는다.'
            + (String(src.effect || '').indexOf('equip') === 0 ? ' 채운 지 하루가 지나면 삭는다.' : '')
            + '\n\n— ' + (src.desc || '')
    };
    if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(nm) < 0) NO_SELL_ITEMS.push(nm);
}
function regCopies() {
    if (!currentUser) return;
    const seen = {};
    (currentUser.inventory || []).concat(currentUser.equippedWeapons || []).forEach(function (x) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(x) : x;
        const r = realOf(b);
        if (r && !seen[r]) { seen[r] = 1; regOne(r); }
    });
}
setInterval(regCopies, 4000);

// --- 고르는 창 ---
function copierOpen() {
    const left = copyLeft(currentUser);
    if (left <= 0) {
        showCustomAlert('오늘은 더 베낄 수 없습니다.\n\n하루 ' + COPY_PER_DAY + '개까지입니다.');
        return;
    }
    const list = copyables();
    if (!list.length) { showCustomAlert('베낄 것이 없습니다.'); return; }

    const old = document.getElementById('copier-box');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'copier-box';
    wrap.style.cssText = 'position:fixed; inset:0; z-index:100000; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.75); padding:18px;';
    wrap.innerHTML =
        '<div style="background:linear-gradient(145deg,#12161d,#0a0d12); border:1px solid #4a6a8a;'
        + ' border-radius:10px; padding:16px; max-width:380px; width:100%; max-height:80vh; display:flex; flex-direction:column;">'
        + '<div style="font-size:13px; color:#8fc9ff; font-weight:bold;">🖨 ' + COPIER + '</div>'
        + '<div style="font-size:10px; color:#888; margin:5px 0 11px 0;">오늘 남은 횟수 '
        + left + ' / ' + COPY_PER_DAY + ' · 베낀 것은 절반만 듣습니다</div>'
        + '<div id="copier-list" style="overflow-y:auto; flex:1; border:1px solid #2a3a4a; border-radius:7px; padding:6px;"></div>'
        + '<button id="copier-no" class="game-btn" style="width:100%; margin:10px 0 0 0; padding:9px;'
        + ' font-size:11px; background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">닫는다</button>'
        + '</div>';
    document.body.appendChild(wrap);

    const box = wrap.querySelector('#copier-list');
    box.innerHTML = list.map(function (n) {
        const c = ITEM_CATALOG[n] || {};
        return '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;'
            + ' padding:8px 6px; border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<div style="min-width:0;"><div style="font-size:12px; color:#ddd;">' + n + '</div>'
            + '<div style="font-size:9px; color:#777;">' + (c.price ? c.price.toLocaleString() + ' P' : '') + '</div></div>'
            + '<button class="game-btn copier-pick" data-n="' + n + '" style="margin:0; padding:7px 11px;'
            + ' font-size:11px; flex-shrink:0;">베낀다</button></div>';
    }).join('');

    wrap.querySelector('#copier-no').onclick = function () { wrap.remove(); };
    Array.prototype.forEach.call(box.querySelectorAll('.copier-pick'), function (b) {
        b.onclick = function () { wrap.remove(); copierAsk(b.getAttribute('data-n')); };
    });
}

function copierAsk(real) {
    const old = document.getElementById('copier-ok');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'copier-ok';
    wrap.style.cssText = 'position:fixed; inset:0; z-index:100001; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.78); padding:20px;';
    wrap.innerHTML =
        '<div style="background:linear-gradient(145deg,#12161d,#0a0d12); border:1px solid #4a6a8a;'
        + ' border-radius:10px; padding:18px; max-width:330px; width:100%;">'
        + '<div style="font-size:13px; color:#8fc9ff; font-weight:bold; margin-bottom:8px;">복사하시겠습니까</div>'
        + '<div style="font-size:12px; color:#fff; margin-bottom:6px;">' + real + '</div>'
        + '<div style="font-size:10px; color:#999; line-height:1.7; margin-bottom:14px;">'
        + '→ ' + COPY_TAG + real + '<br>본래의 절반만 듭니다.'
        + (String((ITEM_CATALOG[real] || {}).effect || '').indexOf('equip') === 0
            ? '<br>채운 지 하루가 지나면 삭습니다.' : '')
        + '</div>'
        + '<button id="cp-yes" class="game-btn" style="width:100%; margin:0 0 8px 0; padding:11px; font-size:12px;">복사</button>'
        + '<button id="cp-no" class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;'
        + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">그만둔다</button>'
        + '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('#cp-no').onclick = function () { wrap.remove(); };
    wrap.querySelector('#cp-yes').onclick = function () { wrap.remove(); copierMake(real); };
}

function copierMake(real) {
    if (!currentUser) return;
    if (copyLeft(currentUser) <= 0) { showCustomAlert('오늘은 더 베낄 수 없습니다.'); return; }
    if (!ITEM_CATALOG[real]) { showCustomAlert('베낄 수 없는 물건입니다.'); return; }

    if (currentUser.copyDay !== dayKey()) { currentUser.copyDay = dayKey(); currentUser.copyCount = 0; }
    currentUser.copyCount = (currentUser.copyCount || 0) + 1;

    regOne(real);
    const nm = COPY_TAG + real;
    if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
    currentUser.inventory.push(nm);

    if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[복사기] ' + nm);
    if (typeof saveFields === 'function') {
        try { saveFields({ inventory: 1, history: 1, copyDay: 1, copyCount: 1 }); } catch (e) { }
    }
    if (typeof updateUI === 'function') updateUI();
    showCustomAlert('기계가 한 번 떨었습니다.\n\n' + nm + '\n\n오늘 남은 횟수 '
        + copyLeft(currentUser) + ' / ' + COPY_PER_DAY);
}

// --- 복사기와 복제품 쓰기 ---
(function useCopy() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (typeof addTimedEffect !== 'function') return;
        if (useInventoryItem._copier) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];

            // 복사기 — 창을 띄우고 끝. 기계는 안 없어진다
            if (cat && cat.effect === 'copier') {
                if (!currentUser) return;
                if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                    showCustomAlert('가지고 있지 않습니다.'); return;
                }
                copierOpen();
                return;
            }

            // 우리가 도움
            if (cat && cat.effect === 'gift_slot4') { giftUse(itemName); return; }

            // 복제품 — 원본의 효과를 절반으로 돌린다
            const real = (cat && cat.effect === 'copy_of') ? cat.copyOf : realOf(itemName);
            if (!real || !ITEM_CATALOG[real]) return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }

            const eqBefore = (currentUser.equippedWeapons || []).length;

            // ① 시간 효과를 절반으로
            const _ate = addTimedEffect;
            addTimedEffect = function (u, n, d, h) {
                return _ate.call(this, u, COPY_TAG + n, (d || '') + ' (절반)', Math.max(0.5, (h || 0) / 2));
            };
            // ② 원본 대신 복제품을 소지품에서 뺀다
            const _rm = removeItemFromInventory;
            let taken = false;
            removeItemFromInventory = function (u, n, q) {
                if (!taken && u === currentUser && n === real) {
                    taken = true;
                    return _rm.call(this, u, itemName, 1);
                }
                return _rm.apply(this, arguments);
            };

            // 창을 띄워 상대를 고르는 물건은 고른 뒤에 효과가 돈다. 그때는 이미
            // 아래 finally 가 지나가 있어서 「절반」도, 「복제품을 뺀다」도 걸리지
            // 않는다. 그래서 표를 남겨 둔다 — copy-potion.js 가 이어서 받는다.
            window.__copyUse = { real: real, label: itemName, at: Date.now() };

            // invmark.js 가 「쓰시겠습니까?」를 한 번 묻고, 승낙하면 window._invOk 에
            //   그 이름을 적어 두고 다시 부른다. 그 표는 한 번 쓰면 지워진다.
            //   여기서 원본 이름으로 다시 들어가면 표가 안 맞아 확인창이 **또** 뜬다.
            //   그 둘째 창을 승낙해도 아래 finally 가 이미 지나간 뒤라 「절반」도,
            //   「원본 대신 복제품을 뺀다」도 안 걸린다. 그래서 아무 일도 안 났다.
            window._invOk = real;

            try { _u.call(this, real); }
            finally { addTimedEffect = _ate; removeItemFromInventory = _rm; window._invOk = null; }

            // 창이 안 떴다면(바로 끝났다면) 표를 지운다
            if (taken) window.__copyUse = null;

            // ③ 장착된 것이면 이름을 바꾸고 하루짜리로 만든다
            const eq = currentUser.equippedWeapons || [];
            for (let i = eq.length - 1; i >= eqBefore; i--) {
                const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(eq[i]) : eq[i];
                if (b !== real) continue;
                const was = eq[i], become = COPY_TAG + was;
                eq[i] = become;
                if (currentUser.equipOwner && currentUser.equipOwner[was] !== undefined) {
                    currentUser.equipOwner[become] = currentUser.equipOwner[was];
                    delete currentUser.equipOwner[was];
                }
                if (currentUser.badge && typeof currentUser.badge.notes === 'string') {
                    currentUser.badge.notes = currentUser.badge.notes.split(was).join(become);
                }
                if (!currentUser.copyExpire) currentUser.copyExpire = {};
                currentUser.copyExpire[become] = Date.now() + COPY_EQUIP_MS;
                break;
            }
            if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
            if (typeof updateUI === 'function') updateUI();
        };
        useInventoryItem._copier = true;
        clearInterval(iv);
        console.log('[우주] 복사기 · 복제품 연결');
    }, 400);
})();

// --- 남에게 채우기 ---
//
//   「타인」을 누르면 confirmItemTarget → applyItemEffect(상대, 이름, true) 로 간다.
//   그런데 복제품의 effect 는 copy_of 라 어느 갈래에도 안 걸려서, 상대에게는
//   아무것도 안 꽂히고 복제품만 소지품에서 사라졌다.
//
//   그래서 여기서도 원본 이름으로 바꿔 돌린 뒤, 상대 장착칸에 꽂힌 것에
//   복제품 표를 붙이고 하루짜리로 만든다. 본인 장착 때와 같은 모양이다.
(function copyToOthers() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (typeof addTimedEffect !== 'function') return;
        if (applyItemEffect._copier) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (target, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            const real = (cat && cat.copyOf) ? cat.copyOf : realOf(itemName);
            if (!real || !ITEM_CATALOG[real] || !target) return _a.apply(this, arguments);

            const before = (target.equippedWeapons || []).length;

            const _ate = addTimedEffect;
            addTimedEffect = function (u, n, d, h) {
                return _ate.call(this, u, COPY_TAG + n, (d || '') + ' (절반)', Math.max(0.5, (h || 0) / 2));
            };
            let out;
            try { out = _a.call(this, target, real, isOthers); }
            finally { addTimedEffect = _ate; }
            if (out === false) return false;

            // 상대에게 꽂힌 것에 표를 붙인다
            const eq = target.equippedWeapons || [];
            for (let i = eq.length - 1; i >= before; i--) {
                const was = eq[i];
                const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(was) : was;
                if (b !== real) continue;
                const become = COPY_TAG + was;
                eq[i] = become;
                if (target.equipOwner && target.equipOwner[was] !== undefined) {
                    target.equipOwner[become] = target.equipOwner[was];
                    delete target.equipOwner[was];
                }
                if (target.badge && typeof target.badge.notes === 'string') {
                    target.badge.notes = target.badge.notes.split(was).join(become);
                }
                if (!target.copyExpire) target.copyExpire = {};
                target.copyExpire[become] = Date.now() + COPY_EQUIP_MS;
                break;
            }
            return out;
        };
        applyItemEffect._copier = true;
        clearInterval(iv);
        console.log('[우주] 복제품 — 남에게 채우기 연결');
    }, 400);
})();

// --- 하루가 지난 복제 장비를 걷는다 ---
setInterval(function () {
    if (!currentUser || !currentUser.copyExpire) return;
    const t = Date.now();
    let changed = 0;
    Object.keys(currentUser.copyExpire).forEach(function (label) {
        if (currentUser.copyExpire[label] > t) return;
        const eq = currentUser.equippedWeapons || [];
        const i = eq.indexOf(label);
        if (i >= 0) {
            eq.splice(i, 1);
            if (typeof clearEquipOwner === 'function') { try { clearEquipOwner(currentUser, label); } catch (e) { } }
            if (typeof stripNoteByItem === 'function') { try { stripNoteByItem(currentUser, label); } catch (e) { } }
            if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[복제품] ' + label + ' 이(가) 삭았습니다.');
        }
        delete currentUser.copyExpire[label];
        changed++;
    });
    if (changed) {
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
        if (typeof updateUI === 'function') updateUI();
    }
}, 60000);

// ==========================================
// 4. 우리가 도움
// ==========================================
// 자리는 다섯까지 — 네 번째로 못 박지 않고, 지금 있는 자리의 「다음」을 연다
const GIFT_MAX = 5;
window.GEAR_SLOT_MAX = GIFT_MAX;

function giftUse(itemName) {
    if (!currentUser) return;
    if ((currentUser.inventory || []).indexOf(itemName) < 0) {
        showCustomAlert('가지고 있지 않습니다.'); return;
    }
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    if (!g) { showCustomAlert('받을 자리가 없습니다.'); return; }

    // ★ 「지금 열려 있는 자리」의 다음을 연다.
    //
    //   ⛓️‍💥 이레귤러 칭호는 자리를 넷으로 올려 둔다. 예전에는 원래 수
    //   (slotsReal)를 세어서, 세 자리인 사람이 쓰면 원래 수만 넷이 되고
    //   보이는 자리는 넷 그대로였다 — 쓰고도 아무 일이 없어 보였다.
    //   이제 보이는 수를 세므로 그 자리에서 다섯째가 열린다.
    //   얻은 자리는 slotsReal 에도 적으므로 칭호를 떼도 남는다.
    const open = Math.max(g.slots || 1, g.slotsReal || 0);
    if (open >= GIFT_MAX) {
        showCustomAlert('이미 ' + GIFT_MAX + '자리가 모두 열려 있습니다.'); return;
    }

    const next = open + 1;
    g.slots = next;
    if (g.slotsReal !== undefined) g.slotsReal = next;   // 칭호를 떼도 이 수로 남는다

    // 이 자리는 L 로 시작하고 속성을 바꿔도 L 로 남는다 (gift-slot.js 가 지킨다)
    if (!Array.isArray(g.giftSlots)) g.giftSlots = [];
    if (g.giftSlots.indexOf(next - 1) < 0) g.giftSlots.push(next - 1);
    if (typeof window.giftSlotPin === 'function') { try { window.giftSlotPin(); } catch (e) { } }

    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(currentUser, '[' + GIFT + '] 자리 ' + next + '개째 …');
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    if (typeof updateUI === 'function') updateUI();
    showCustomAlert('…… 들렸습니다.\n\n무언가 하나가 더 들어갈 자리가 생겼습니다.'
        + '\n\n속성 자리 ' + next + ' / ' + GIFT_MAX);
}

// ==========================================
// 확인
// ==========================================
window.emState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const e = emOn(u);
    console.log('%c===== ' + u.name + ' · 에메랄드 =====', 'color:#00f0a0; font-size:13px');
    console.table([{
        하네스: e.h ? 'O 남이 채움' : '✗',
        목줄: e.c ? 'O 남이 채움' : '✗',
        세트: e.set ? 'O' : '✗',
        '공용시설 행운': e.set ? '×' + EM.set : (e.h ? '×' + EM.harness : '—'),
        '랜덤박스 행운': e.set ? '×' + EM.boxSet : (e.c ? '×' + EM.box : '—'),
        '회수품': e.h ? '×' + EM.loot : '—',
        '어둠 판정': e.c ? '+' + EM.dark : '—'
    }]);
    const worn = (u.equippedWeapons || []).filter(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        return b === HARNESS || b === COLLAR;
    });
    if (worn.length) console.log('  차고 있는 것:', worn.join(' · '));
    console.log('  ※ 스스로 채운 것은 효력이 없습니다.');
};

window.copyState = function () {
    if (!currentUser) return;
    console.log('%c===== ' + COPIER + ' =====', 'color:#8fc9ff; font-size:13px');
    console.log('  오늘 남은 횟수:', copyLeft(currentUser) + ' / ' + COPY_PER_DAY,
        '(' + (currentUser.copyDay || '아직 없음') + ')');
    const inv = (currentUser.inventory || []).filter(function (x) { return realOf(x); });
    const eq = (currentUser.equippedWeapons || []).filter(function (x) { return String(x).indexOf(COPY_TAG) >= 0; });
    console.log('  소지품의 복제품:', inv.length ? inv.join(' · ') : '없음');
    if (eq.length) {
        console.table(eq.map(function (l) {
            const t = (currentUser.copyExpire || {})[l];
            return { 복제품: l, 남은시간: t ? Math.max(0, Math.round((t - Date.now()) / 60000)) + '분' : '?' };
        }));
    } else console.log('  차고 있는 복제품: 없음');
    console.log('  베낄 수 있는 것:', copyables().length + '종');
};

window.spaceOdds = function () {
    console.log('%c===== 우주 신규 4종 =====', 'color:#8fc9ff; font-size:13px');
    console.table([HARNESS, COLLAR, COPIER, GIFT].map(function (n) {
        const c = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[n]) || {};
        return {
            물건: n, 값: c.price ? c.price.toLocaleString() + ' P' : '-',
            '진열 확률': (((window.RARE_ALIEN_RATE || {})[n] || 0) * 100).toFixed(2) + '%',
            '진열 후보에 있나': (typeof ALIEN_ITEMS_POOL !== 'undefined'
                && ALIEN_ITEMS_POOL.indexOf(n) >= 0) ? 'O' : '✗'
        };
    }));
};

console.log('[우주] emState(사번) · copyState() · spaceOdds()');

})();
