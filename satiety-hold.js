// ==========================================
// ★ 포만도 유지 — 최음제 · 빨간 리본 · 세뇌 만년필
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 포만도가 깎이는 자리는 셋입니다
//
//     index.html:4980   두 시간마다 5씩      (checkPassivePollution)
//     index.html:9223   공용시설 이용 -3     (useFacility)
//     dark.js:12466     어둠 탐사 -10~-28    (applyDarkSatiety, 등급별)
//
//   「유지된다」를 글자 그대로 읽어 셋 다 막습니다.
//   자연 감소만 막고 싶으시면 아래 HOLD_FACILITY · HOLD_DARK 를 false 로.
//
//   막는 방법은 셋 다 같습니다. 원래 함수를 그대로 돌리고, 돌기 전의
//   포만도를 되돌려 놓습니다. 다만 lastSatietyTime 은 되돌리지 않습니다.
//   그걸 되돌리면 유지가 끝나는 순간 밀린 시간이 한꺼번에 깎여
//   (최대 12단계 = 60) 오히려 더 크게 떨어집니다.
//
// ■ 세 가지가 같은 자리를 봅니다
//
//   satHeld(user) 하나가 참이면 포만도가 안 내려갑니다.
//
//     1. user.satHoldUntil 이 아직 안 지났다        — 최음제
//     2. user.ribbons 에 안 끝난 줄이 있다          — 빨간 리본
//     3. 세뇌 만년필을 차고 있고 오염도가 50 이상   — 세뇌 만년필
//
// ■ 빨간 리본
//
//   원래 양쪽에 이름표만 붙이고 끝이었습니다 (index.html:7235).
//   거기에 한 시간짜리 줄을 하나 답니다.
//
//     · 한 줄에 한 시간, 양쪽 다 유지
//     · 한 사람이 동시에 다섯 줄까지
//     · 한 시간이 지나면 이름표가 빠지고, 채운 사람 소지품으로 돌아갑니다
//
//   정리는 채운 사람 쪽에서 양쪽을 같이 합니다. 채운 사람이 접속해 있지
//   않으면 각자 자기 이름표만 먼저 걷고, 나중에 채운 사람이 들어올 때
//   나머지가 맞춰집니다. 어느 쪽이든 영영 남지는 않습니다.
//
// ■ 세뇌 만년필
//
//   오염도 50% 증가는 이미 들어가 있고(index.html:7290) 저장도 됩니다
//   (index.html:6125 가 대상의 pollution 을 같이 씁니다).
//   여기서는 「차고 있고 오염도가 50 이상인 동안」만 더합니다.
//   오염도를 50 밑으로 낮추면 유지가 풀립니다.

(function satietyHold() {

const HOLD_FACILITY = true;      // 공용시설 -3 도 막을까
const HOLD_DARK     = true;      // 어둠 탐사 감소도 막을까

const DRUG = '최음제';
const RIBBON = '빨간 리본';
const PEN = '세뇌 만년필';
const DRUG_MS = 2 * 3600 * 1000;
const RIBBON_MS = 1 * 3600 * 1000;
const RIBBON_MAX = 5;
const PEN_POLL = 50;

function now() { return Date.now(); }
function base(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}
function wears(u, nm) {
    return (u && Array.isArray(u.equippedWeapons))
        && u.equippedWeapons.some(function (w) { return base(w) === nm; });
}
function ribbonsOf(u) {
    if (!u) return [];
    if (!Array.isArray(u.ribbons)) u.ribbons = [];
    return u.ribbons;
}
function liveRibbons(u) {
    const t = now();
    return ribbonsOf(u).filter(function (r) { return r && r.u > t; });
}

// ==========================================
// 유지 중인가 — 여기 하나만 보면 됩니다
// ==========================================
function satHeld(u) {
    if (!u) return false;
    if ((u.satHoldUntil || 0) > now()) return true;               // 최음제
    if (liveRibbons(u).length) return true;                       // 빨간 리본
    if (wears(u, PEN) && (u.pollution || 0) >= PEN_POLL) return true;  // 세뇌 만년필
    return false;
}
function heldWhy(u) {
    const out = [];
    if ((u.satHoldUntil || 0) > now()) {
        out.push(DRUG + ' ' + Math.ceil(((u.satHoldUntil - now()) / 60000)) + '분');
    }
    const lr = liveRibbons(u);
    if (lr.length) {
        const last = Math.max.apply(null, lr.map(function (r) { return r.u; }));
        out.push(RIBBON + ' ' + lr.length + '줄 · ' + Math.ceil((last - now()) / 60000) + '분');
    }
    if (wears(u, PEN) && (u.pollution || 0) >= PEN_POLL) out.push(PEN + ' (오염 ' + u.pollution + ')');
    return out;
}
window.satHeld = satHeld;

// ==========================================
// 깎이는 세 자리를 막는다
// ==========================================
function guard(name, on) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;          // 최상위 function 선언이라 window 로 잡힌다
        if (f._satHold) { clearInterval(iv); return; }

        const wrapped = function (a) {
            if (!on) return f.apply(this, arguments);
            // 첫 인자가 사원이면 그 사람, 아니면 나 (useFacility 는 금액, applyDarkSatiety 는 구역코드)
            const u = (a && typeof a === 'object' && a.code) ? a : currentUser;
            if (!u || !satHeld(u)) return f.apply(this, arguments);
            const keep = u.satiety;
            const r = f.apply(this, arguments);
            if (u.satiety != null && keep != null && u.satiety < keep) {
                u.satiety = keep;              // 깎인 만큼 되돌린다 (lastSatietyTime 은 그대로)
            }
            return r;
        };
        wrapped._satHold = true;
        window[name] = wrapped;
        clearInterval(iv);
        console.log('[포만] ' + name + ' 막음' + (on ? '' : ' (꺼짐)'));
    }, 400);
}
guard('checkPassivePollution', true);
guard('useFacility', HOLD_FACILITY);
guard('applyDarkSatiety', HOLD_DARK);

// ==========================================
// 최음제
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        ITEM_CATALOG[DRUG] = {
            price: 4000, usable: true, targetable: false, effect: 'sat_hold',
            desc: '마시면 두 시간 동안 포만감이 내려가지 않는다. 남은 시간에 이어 붙는다.'
        };
        if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(DRUG) < 0) {
            ALIEN_ITEMS_POOL.push(DRUG);
        }
        clearInterval(iv);
    }, 400);
})();

(function useDrug() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._satDrug) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'sat_hold') return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            const from = Math.max(now(), currentUser.satHoldUntil || 0);
            currentUser.satHoldUntil = from + DRUG_MS;
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
            if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[아이템 사용] ' + DRUG + ' — 포만감 유지');
            if (typeof saveFields === 'function') saveFields({ satHoldUntil: 1, inventory: 1, history: 1 });
            if (typeof updateUI === 'function') updateUI();
            showCustomAlert('속이 뜨거워집니다.\n\n' + Math.round((currentUser.satHoldUntil - now()) / 60000)
                + '분 동안 포만감이 내려가지 않습니다.');
        };
        useInventoryItem._satDrug = true;
        clearInterval(iv);
        console.log('[포만] ' + DRUG + ' 연결');
    }, 400);
})();

// ==========================================
// 빨간 리본 — 한 시간, 다섯 줄까지
// ==========================================
(function ribbon() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._satRibbon) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'equip_red_ribbon') return _a.apply(this, arguments);
            if (!currentUser || !targetUser) return _a.apply(this, arguments);

            if (liveRibbons(currentUser).length >= RIBBON_MAX) {
                showCustomAlert(RIBBON + '은(는) 한 번에 ' + RIBBON_MAX + '줄까지입니다.'); return false;
            }
            if (liveRibbons(targetUser).length >= RIBBON_MAX) {
                showCustomAlert('상대가 이미 ' + RIBBON_MAX + '줄을 묶고 있습니다.'); return false;
            }

            const r = _a.apply(this, arguments);
            if (r === false) return r;

            const until = now() + RIBBON_MS;
            ribbonsOf(currentUser).push({ p: targetUser.code, o: currentUser.code, u: until });
            ribbonsOf(targetUser).push({ p: currentUser.code, o: currentUser.code, u: until });
            if (typeof saveFields === 'function') { try { saveFields({ ribbons: 1 }); } catch (e) { } }
            if (typeof updateUserFields === 'function' && targetUser.code !== currentUser.code) {
                try { updateUserFields(targetUser.code, { ribbons: targetUser.ribbons }); } catch (e) { }
            }
            setTimeout(function () {
                showCustomAlert(targetUser.name + ' 사원과 묶였습니다.\n\n'
                    + '한 시간 동안 두 사람의 포만감이 내려가지 않습니다.\n'
                    + '시간이 지나면 리본은 소지품으로 돌아옵니다.');
            }, 60);
            return r;
        };
        applyItemEffect._satRibbon = true;
        clearInterval(iv);
        console.log('[포만] ' + RIBBON + ' 연결 — 1시간 · 최대 ' + RIBBON_MAX + '줄');
    }, 400);
})();

// 끝난 줄을 걷는다
function sweepRibbons() {
    if (!currentUser) return;
    const t = now();
    const all = ribbonsOf(currentUser);
    const dead = all.filter(function (r) { return r && r.u <= t; });
    if (!dead.length) return;

    currentUser.ribbons = all.filter(function (r) { return r && r.u > t; });

    // 내 이름표를 끝난 줄 수만큼 뺀다 — 되도록 그 상대의 것으로
    const eq = currentUser.equippedWeapons || [];
    dead.forEach(function (d) {
        const mate = (db.users[d.p] || {}).name || '';
        let i = eq.findIndex(function (w) {
            return base(w) === RIBBON && mate && String(w).indexOf(mate) >= 0;
        });
        if (i < 0) i = eq.findIndex(function (w) { return base(w) === RIBBON; });
        if (i >= 0) {
            const full = eq[i];
            eq.splice(i, 1);
            if (typeof clearEquipOwner === 'function') { try { clearEquipOwner(currentUser, full); } catch (e) { } }
        }
        // 내가 채운 것이면 소지품으로 돌려받는다
        if (d.o === currentUser.code) {
            if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
            currentUser.inventory.push(RIBBON);
        }
    });

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(currentUser, '[' + RIBBON + '] 묶임이 풀렸습니다. (' + dead.length + '줄)');
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }

    // 내가 채운 쪽이면 상대도 같이 정리한다
    dead.forEach(function (d) {
        if (d.o !== currentUser.code) return;
        const u = db.users[d.p];
        if (!u || typeof updateUserFields !== 'function') return;
        const mine = (u.ribbons || []).filter(function (r) { return r && r.u > t; });
        const teq = (u.equippedWeapons || []).slice();
        const myName = currentUser.name || '';
        let i = teq.findIndex(function (w) {
            return base(w) === RIBBON && myName && String(w).indexOf(myName) >= 0;
        });
        if (i < 0) i = teq.findIndex(function (w) { return base(w) === RIBBON; });
        if (i >= 0) teq.splice(i, 1);
        u.ribbons = mine; u.equippedWeapons = teq;
        try { updateUserFields(d.p, { ribbons: mine, equippedWeapons: teq }); } catch (e) { }
    });

    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
    console.log('[' + RIBBON + '] ' + dead.length + '줄이 풀렸습니다.');
}
setTimeout(sweepRibbons, 5000);
setInterval(sweepRibbons, 30000);

// ==========================================
// 포만감 칸에 「유지 중」 표시
// ==========================================
(function mark() {
    setInterval(function () {
        const el = document.getElementById('satiety-text');
        if (!el || !currentUser) return;
        let tag = document.getElementById('sat-hold-tag');
        if (!satHeld(currentUser)) { if (tag) tag.remove(); return; }
        if (!tag) {
            tag = document.createElement('span');
            tag.id = 'sat-hold-tag';
            tag.style.cssText = 'margin-left:6px; font-size:9px; color:#81c784;';
            el.parentElement.appendChild(tag);
        }
        const t = '유지 중';
        if (tag.textContent !== t) tag.textContent = t;
        tag.title = heldWhy(currentUser).join(' · ');
    }, 3000);
})();

// ==========================================
// 확인
// ==========================================
window.satState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 포만감 =====', 'color:#8bc34a; font-size:13px');
    console.log('  포만감:', u.satiety != null ? u.satiety : 100, '/100 · 오염도:', u.pollution || 0);
    console.log('  유지 중:', satHeld(u) ? 'O — ' + heldWhy(u).join(' · ') : '아니오');
    console.log('  ' + DRUG + ':', (u.satHoldUntil || 0) > now()
        ? new Date(u.satHoldUntil).toLocaleString() + ' 까지' : '없음');
    console.log('  ' + PEN + ':', wears(u, PEN) ? ('착용 중 · 오염 ' + (u.pollution || 0)
        + ((u.pollution || 0) >= PEN_POLL ? ' → 유지됨' : ' → 50 미만이라 안 됨')) : '없음');
    const lr = liveRibbons(u);
    if (!lr.length) { console.log('  ' + RIBBON + ': 없음'); return; }
    console.table(lr.map(function (r) {
        return {
            상대: (db.users[r.p] || {}).name || r.p,
            채운사람: r.o === u.code ? '본인' : ((db.users[r.o] || {}).name || r.o),
            남은시간: Math.ceil((r.u - now()) / 60000) + '분'
        };
    }));
};

// 상담사 — 지금 당장 묶임을 푼다
window.ribbonClear = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const eq = (u.equippedWeapons || []).filter(function (w) { return base(w) !== RIBBON; });
    u.ribbons = []; u.equippedWeapons = eq;
    if (typeof updateUserFields === 'function') updateUserFields(u.code, { ribbons: [], equippedWeapons: eq });
    console.log('%c✓ ' + u.name + ' 사원의 ' + RIBBON + ' 을 전부 풀었습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

console.log('[포만] satState(사번) · ribbonClear(사번) · satHeld(user)');

})();