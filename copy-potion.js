// ==========================================
// ★ 복제품 제거약 · 복제품 투명 물약
// bundles.json 마지막 그룹, spaceitems.js 보다 뒤 · save-merge.js 앞
// (cure-fix.js 와 sticker-fix.js 보다 뒤여야 한다 — 그 둘을 바깥에서 감싼다)
// ==========================================
//
// ■ 무엇을 바꾸나
//
//   복제품은 원래 물건의 절반만 듣는다. 그런데 제거약과 투명 물약은 시간을
//   쓰는 물건이 아니라 효과를 아예 지우거나 영구히 굳히는 물건이라, 절반이
//   없다. 그래서 복제품이 원본과 똑같이 셌다.
//
//       복제품 제거약     효과를 지우는 대신 남은 시간을 절반으로 줄인다
//       복제품 투명 물약  영구히 굳히는 대신 남은 기간을 두 배로 늘린다
//
//   고정된(영구) 효과는 복제품으로 어쩌지 못한다. 절반도 두 배도 끝이 없는
//   시간에는 뜻이 없다. 그런 것만 걸려 있으면 그렇다고 알린다.
//
// ■ 창을 띄우는 물건이라 표가 필요했다
//
//   두 물약은 상대를 고르는 물건이다(targetable). 창을 띄우고 고른 뒤에
//   효과가 도는데, 복사기 쪽의 「절반으로 만들기」는 창이 뜨기 전에 끝나는
//   동기 덮어쓰기였다. 그래서 창을 지나면 아무것도 걸리지 않았다.
//
//   spaceitems.js 가 window.__copyUse 에 표를 남기고, 여기서 그 표를 보고
//   이어 받는다. 덕분에 창을 띄우는 다른 복제품도 제대로 돈다 —
//   복제품이 아니라 원본이 소지품에서 빠지던 것도 같이 고쳐진다.
//
// ■ 확인
//
//   copyPotionState()   연결됐는지 · 지금 표가 남아 있나

(function copyPotion() {

const TAG = '[복제품] ';
const LIVE = 180000;        // 표를 믿는 시간 (ms) — 창을 띄워 둔 동안

function mark() {
    const m = window.__copyUse;
    if (!m || !m.real) return null;
    if (Date.now() - (m.at || 0) > LIVE) { window.__copyUse = null; return null; }
    return m;
}
function clearMark() { window.__copyUse = null; }

function leftOf(e) {
    if (!e) return 0;
    if (e.fixed) return Infinity;
    return Math.max(0, (e.expireAt || 0) - Date.now());
}
function hm(ms) {
    const m = Math.round(ms / 60000);
    return (m >= 60) ? (Math.floor(m / 60) + '시간 ' + (m % 60) + '분') : (m + '분');
}

// 제거약·투명 물약이 고르는 후보와 같은 규칙
function potionEff(e) {
    if (typeof isPotionEffect === 'function') { try { return isPotionEffect(e); } catch (x) { } }
    return !!(e && e.name && /물약$/.test(String(e.name).trim()));
}

// 시간을 건드릴 수 있는 것만 — 고정된 것은 뺀다
function timedCands(u, potionOnly) {
    const out = [];
    (u.timedEffects || []).forEach(function (e, i) {
        if (!e || e.fixed) return;
        if (potionOnly && !potionEff(e)) return;
        if (leftOf(e) <= 0) return;
        out.push({ type: 'effect', idx: i, name: e.name });
    });
    if (u.slaveUntil && !u.slaveFixed && Date.now() < u.slaveUntil) {
        out.push({ type: 'slave', name: '노예 계약' });
    }
    return out;
}

// 남은 시간에 배수를 적용한다
function scale(u, pick, mul) {
    const now = Date.now();
    if (pick.type === 'slave') {
        const was = Math.max(0, u.slaveUntil - now);
        u.slaveUntil = now + Math.round(was * mul);
        return { was: was, now: Math.max(0, u.slaveUntil - now) };
    }
    const e = u.timedEffects[pick.idx];
    const was = Math.max(0, (e.expireAt || 0) - now);
    e.expireAt = now + Math.max(60000, Math.round(was * mul));   // 1분은 남긴다
    return { was: was, now: Math.max(0, e.expireAt - now) };
}

function save(u, isOthers) {
    if (!u) return;
    if (currentUser && u.code === currentUser.code) {
        if (typeof saveFields === 'function') saveFields({ timedEffects: 1, slaveUntil: 1, history: 1 });
    } else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { timedEffects: u.timedEffects, slaveUntil: u.slaveUntil,
                                   history: u.history, hasItemUsedOnMe: true });
    }
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
}

// ==========================================
// 갈아끼우기 — cure-fix · sticker-fix 바깥
// ==========================================
function install() {
    if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return false;
    if (applyItemEffect._copyPotion) return true;

    const _a = applyItemEffect;
    const wrapped = function (targetUser, itemName, isOthers) {
        const m = mark();
        const cat = ITEM_CATALOG[itemName];
        // 복제품으로 쓰는 중이 아니거나, 그 복제품의 원본이 아니면 평소대로
        if (!m || !cat || !targetUser || itemName !== m.real) return _a.apply(this, arguments);

        const eff = cat.effect;
        if (eff !== 'cure_potion' && eff !== 'clear_potion') return _a.apply(this, arguments);

        const potionOnly = (eff === 'cure_potion');
        const list = timedCands(targetUser, potionOnly);
        if (!list.length) {
            const anyFixed = (targetUser.timedEffects || []).some(function (e) { return e && e.fixed; });
            showCustomAlert(anyFixed
                ? '복제품으로는 고정된 효과를 어쩌지 못합니다.'
                : (potionOnly ? '줄일 효과가 없습니다.' : '늘릴 효과가 없습니다.'));
            return false;
        }

        const pick = list[Math.floor(Math.random() * list.length)];
        const mul = potionOnly ? 0.5 : 2;
        const r = scale(targetUser, pick, mul);

        const word = potionOnly
            ? ('[복제품 제거약] ' + pick.name + ' 남은 시간이 절반으로 줄었습니다. '
               + hm(r.was) + ' → ' + hm(r.now))
            : ('[복제품 투명 물약] ' + pick.name + ' 남은 기간이 두 배가 되었습니다. '
               + hm(r.was) + ' → ' + hm(r.now));

        if (typeof addHistoryLog === 'function') addHistoryLog(targetUser, word);
        save(targetUser, isOthers);
        showCustomAlert(word.replace(/^\[/, '[').replace('] ', ']\n\n'));
        return true;                       // 복제품은 쓰인 것으로 본다
    };
    wrapped._copyPotion = true;
    applyItemEffect = wrapped;
    console.log('[복제품] 제거약·투명 물약 연결 — 절반 줄이기 / 두 배 늘리기');
    return true;
}

// ==========================================
// 창을 지나와도 복제품이 빠지게
// ==========================================
//
// 표가 살아 있는 동안 원본을 빼려 하면 복제품을 뺀다. 창을 띄우는 복제품이
// 원본을 먹어 버리던 것도 이걸로 막힌다.
function hookRemove() {
    if (typeof removeItemFromInventory !== 'function') return false;
    if (removeItemFromInventory._copyPotion) return true;
    const _r = removeItemFromInventory;
    const wrapped = function (user, name, qty) {
        const m = mark();
        if (m && currentUser && user === currentUser && name === m.real) {
            const inv = currentUser.inventory || [];
            if (inv.indexOf(m.label) >= 0) {
                clearMark();
                return _r.call(this, user, m.label, 1);      // 복제품을 뺀다
            }
            clearMark();
        }
        return _r.apply(this, arguments);
    };
    wrapped._copyPotion = true;
    removeItemFromInventory = wrapped;
    return true;
}

// 창을 닫아 버렸을 때 표가 남지 않게
(function hookClose() {
    const iv = setInterval(function () {
        if (typeof closeItemTargetModal !== 'function') return;
        if (closeItemTargetModal._copyPotion) { clearInterval(iv); return; }
        const _c = closeItemTargetModal;
        const wrapped = function () {
            // 고르기를 끝낸 뒤라면 applyItemEffect 가 이미 지나갔다. 조금 뒤에 지운다.
            setTimeout(function () { clearMark(); }, 4000);
            return _c.apply(this, arguments);
        };
        wrapped._copyPotion = true;
        closeItemTargetModal = wrapped;
        clearInterval(iv);
    }, 500);
})();

let n = 0;
const iv = setInterval(function () {
    const a = install(), b = hookRemove();
    if ((a && b) || ++n > 60) clearInterval(iv);
}, 500);

// ==========================================
// 확인
// ==========================================
window.copyPotionState = function () {
    console.log('%c===== 복제품 제거약 · 투명 물약 =====', 'color:#8fc9ff; font-size:13px');
    console.log('  연결:', (typeof applyItemEffect === 'function' && applyItemEffect._copyPotion) ? 'O' : '✗',
        '· 소지품 빼기:', (typeof removeItemFromInventory === 'function' && removeItemFromInventory._copyPotion) ? 'O' : '✗');
    const m = window.__copyUse;
    console.log('  지금 표:', m ? (m.label + ' → ' + m.real + ' (' + Math.round((Date.now() - m.at) / 1000) + '초 전)') : '없음');
    console.log('  복제품 제거약 — 지우지 않고 남은 시간을 절반으로');
    console.log('  복제품 투명 물약 — 굳히지 않고 남은 기간을 두 배로');
    console.log('  고정된(영구) 효과는 복제품으로 어쩌지 못합니다.');
    if (!currentUser) return;
    const list = timedCands(currentUser, false);
    if (!list.length) { console.log('  지금 건드릴 수 있는 효과: 없음'); return; }
    console.table(list.map(function (p) {
        const e = p.type === 'slave' ? null : currentUser.timedEffects[p.idx];
        const left = p.type === 'slave'
            ? Math.max(0, currentUser.slaveUntil - Date.now()) : leftOf(e);
        return { 효과: p.name, 남음: hm(left),
                 제거약복제품: hm(left / 2), 투명복제품: hm(left * 2) };
    }));
};

console.log('[복제품] copyPotionState()');

})();
