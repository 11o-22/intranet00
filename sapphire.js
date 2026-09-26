// ==========================================
// ★ 사파이어 장비 2종
// index.html 에서 dna-once.js 다음에 불러온다
// ==========================================
//
// 둘 다 남이 채워 주었을 때만 힘이 돈다.
// 스스로 찬 것에는 아무 일도 일어나지 않는다.

ITEM_CATALOG['사파이어 요도 플러그'] = {
    price: 21000, usable: true, targetable: true, effect: 'equip_sap_urethra',
    desc: '타인이 채워 주었을 때만 힘이 돈다. 임신한 사원에게 채우면 낳는 것의 수가 늘어난다.'
};

ITEM_CATALOG['사파이어 젖꼭지 클램프'] = {
    price: 21000, usable: true, targetable: true, effect: 'equip_sap_clamp',
    desc: '타인이 채워 주었을 때만 힘이 돈다. 임신한 사원에게 채우면 드문 것이 나올 여지가 생긴다.'
};

// ==========================================
// 우주 쇼핑몰 진열
// ==========================================
(function putInAlien() {
    const names = ['사파이어 요도 플러그', '사파이어 젖꼭지 클램프'];
    if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
        names.forEach(function (n) {
            if (!ALIEN_ITEMS_POOL.includes(n)) ALIEN_ITEMS_POOL.push(n);
        });
    }
    // 진열 후보에 오를 확률 2%
    if (!window.RARE_ALIEN_RATE) window.RARE_ALIEN_RATE = {};
    names.forEach(function (n) { window.RARE_ALIEN_RATE[n] = 0.02; });
})();

// ==========================================
// 착용 판정 — 남이 채워 준 것만
// ==========================================
function sapActive(user, name) {
    if (!user || !user.equippedWeapons) return false;
    return user.equippedWeapons.some(function (w) {
        if (getEquipBaseName(w) !== name) return false;
        const o = getEquipOwner(user, w);
        return o && o !== user.code;      // 스스로 찬 건 안 친다
    });
}

function hasSapUrethra(user) { return sapActive(user, '사파이어 요도 플러그'); }
function hasSapClamp(user)   { return sapActive(user, '사파이어 젖꼭지 클램프'); }

// ==========================================
// 장착
// ==========================================
(function hookEquip() {
    const EFF = ['equip_sap_urethra', 'equip_sap_clamp'];

    // 본인 장착 — 슬롯만 먹고 아무 일도 안 일어난다
    if (typeof useInventoryItem === 'function') {
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || EFF.indexOf(cat.effect) === -1) return _u.apply(this, arguments);
            if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 장착할 수 없습니다.'); return; }

            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.length >= 5) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }

            currentUser.equippedWeapons.push(itemName);
            setEquipOwner(currentUser, itemName, currentUser.code);
            removeItemFromInventory(currentUser, itemName, 1);
            appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName);
            addHistoryLog(currentUser, '[장비 장착] ' + itemName);
            saveSelfFull();
            updateUI();
            showCustomAlert('채웠습니다.\n\n다만 스스로 채운 것에는 힘이 돌지 않습니다.');
        };
    }

    // 타인 장착 — 이때만 힘이 돈다
    if (typeof applyItemEffect === 'function') {
        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || EFF.indexOf(cat.effect) === -1) return _a.apply(this, arguments);
            if (!targetUser) return false;

            if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
            if (targetUser.equippedWeapons.length >= 5) {
                showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.');
                return false;
            }

            const label = isOthers
                ? itemName + ' (장착자: ' + currentUser.name + ')'
                : itemName;
            targetUser.equippedWeapons.push(label);
            setEquipOwner(targetUser, label, isOthers ? currentUser.code : targetUser.code);
            appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
            addHistoryLog(targetUser, '[장착] ' + currentUser.name + ' 사원이 ' + itemName + '을(를) 채웠습니다.');

            const preg = (typeof isPregnant === 'function') && isPregnant(targetUser);
            showCustomAlert(
                targetUser.name + ' 사원에게 ' + itemName + '을(를) 채웠습니다.'
                + (isOthers
                    ? (preg ? '\n\n푸른빛이 한 번 돌았습니다.' : '\n\n아직은 아무 일도 없습니다.')
                    : '\n\n스스로 채운 것에는 힘이 돌지 않습니다.')
            );
            return true;
        };
    }
})();

// ==========================================
// 요도 플러그 — 낳는 수가 는다
// ==========================================
(function hookCount() {
    if (typeof checkPregBirth !== 'function') return;

    // 출산 직전에 아버지 수를 부풀리지 않고, 개수 계산만 손본다
    // pregnancy2.js 의 count 식을 그대로 쓰되 보정만 얹는다
    window.sapCountBonus = function (user) {
        return hasSapUrethra(user) ? 2 : 0;
    };
})();

// ==========================================
// 젖꼭지 클램프 — 고유 아이템 확률이 오른다
// ==========================================
(function hookRate() {
    if (typeof rollBirthItem !== 'function') return;
    const _r = rollBirthItem;

    rollBirthItem = function (a, b, fill) {
        // 어미가 클램프를 차고 있으면 고유 확률을 따로 굴린다
        const mom = a;
        if (mom && hasSapClamp(mom)) {
            const f = Math.max(0, Math.min(1, fill || 0));
            const rate = 0.01 + f * 0.03;          // 1% → 4%
            const own = function (u) {
                if (!u) return false;
                if (typeof hasGotDna === 'function' && hasGotDna(u)) return false;
                return true;
            };
            const r = Math.random();
            if (r < rate && own(a)) { ensureDnaItem(a); return dnaItemName(a); }
            if (r < rate * 2 && own(b)) { ensureDnaItem(b); return dnaItemName(b); }
        }
        return _r.call(this, a, b, fill);
    };
})();

// ==========================================
// 확인
// ==========================================
function sapState(no) {
    const u = no
        ? Object.keys(db.users).map(c => db.users[c]).find(x => x && x.no === no)
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' =====', 'color:#4fc3f7; font-size:13px');
    console.log('  요도 플러그:', hasSapUrethra(u) ? '남이 채움 (작동)' : '없음 또는 스스로 채움');
    console.log('  젖꼭지 클램프:', hasSapClamp(u) ? '남이 채움 (작동)' : '없음 또는 스스로 채움');
    console.log('  임신 중:', (typeof isPregnant === 'function' && isPregnant(u)) ? '예' : '아니오');
    (u.equippedWeapons || []).forEach(function (w) {
        const base = getEquipBaseName(w);
        if (base.indexOf('사파이어') !== 0) return;
        const o = getEquipOwner(u, w);
        console.log('   ·', w, '→ 장착자', o === u.code ? '본인' : ((db.users[o] || {}).name || o));
    });
}

console.log('[사파이어] 2종 등록 — sapState() 로 확인');