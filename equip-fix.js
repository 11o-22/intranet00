// ==========================================
// ★ 타인 장착 마무리 — 소지품에서 빼고 양쪽을 저장
// index.html 에서 sapphire.js · newitems.js 보다 뒤에 불러온다
// ==========================================
//
// 타인 장착 처리가 대상에게 밀어 넣는 일만 하고
// 건네준 사람의 소지품은 그대로 두었다.
// 그래서 같은 것을 두 번, 세 번 채울 수 있었고
// 소지품에 남은 쪽이 해제 대상으로 잡히지 않았다.
//
// 여기서는 밑의 처리가 끝난 뒤에만 뒷정리를 한다.
// 이미 빼 간 경우에는 손대지 않는다.

(function fixOtherEquip() {

    function invCount(user, nm) {
        return (user && user.inventory ? user.inventory : []).filter(function (x) { return x === nm; }).length;
    }

    function isEquipItem(nm) {
        const c = (typeof ITEM_CATALOG !== 'undefined') && ITEM_CATALOG[nm];
        if (!c || !c.effect) return false;
        return String(c.effect).indexOf('equip_') === 0;
    }

    function pushTarget(t) {
        if (!t || !t.code) return;
        if (typeof updateUserFields !== 'function') return;
        const f = {
            equippedWeapons: t.equippedWeapons || [],
            equipOwner: t.equipOwner || {}
        };
        if (t.badgeNotes != null) f.badgeNotes = t.badgeNotes;
        try { updateUserFields(t.code, f); } catch (e) { }
    }

    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._equipTidy) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            if (!isEquipItem(itemName)) return _a.apply(this, arguments);

            const before = invCount(currentUser, itemName);
            const r = _a.apply(this, arguments);
            if (!r) return r;                       // 실패했으면 그대로 둔다

            // 밑에서 이미 빼 갔으면 두 번 빼지 않는다
            if (invCount(currentUser, itemName) === before && before > 0) {
                if (typeof removeItemFromInventory === 'function') {
                    removeItemFromInventory(currentUser, itemName, 1);
                }
            }

            // 남에게 채운 것은 대상 쪽도 서버에 적는다
            if (isOthers && targetUser && targetUser.code !== currentUser.code) {
                pushTarget(targetUser);
            }
            if (typeof saveSelfFull === 'function') saveSelfFull();
            if (typeof updateUI === 'function') updateUI();

            return r;
        };
        applyItemEffect._equipTidy = true;
        clearInterval(iv);
        console.log('[장착] 타인 장착 뒷정리 연결');
    }, 500);
})();

// ==========================================
// 이미 두 번 들어간 것을 치운다
// ==========================================
// cleanEquipDupe()            — 나
// cleanEquipDupe('밥')        — 그 사원
// cleanEquipDupe(null, true)  — 전 사원 훑어보기만
function cleanEquipDupe(who, scanOnly) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);

    let list;
    if (scanOnly) list = all;
    else if (!who) list = [currentUser];
    else {
        const t = all.find(function (u) { return u.name === who || u.no === who || u.code === who; });
        if (!t) { console.warn('사원을 못 찾았습니다: ' + who); return; }
        list = [t];
    }

    let hit = 0;
    list.forEach(function (u) {
        const eq = u.equippedWeapons || [];
        const seen = {}, keep = [], drop = [];
        eq.forEach(function (w) {
            if (seen[w]) { drop.push(w); return; }
            seen[w] = 1; keep.push(w);
        });
        if (!drop.length) return;
        hit++;
        console.log('%c' + u.name + ' (' + (u.no || u.code) + ')', 'color:#d4af37; font-size:12px');
        drop.forEach(function (w) { console.log('   겹침 ×1 → ' + w); });

        if (scanOnly) return;

        u.equippedWeapons = keep;
        if (typeof updateUserFields === 'function') {
            updateUserFields(u.code, { equippedWeapons: keep });
        }
        console.log('%c   ✓ ' + drop.length + '개를 정리했습니다.', 'color:#4CAF50');
    });

    if (!hit) console.log('겹쳐 들어간 장착이 없습니다.');
    if (typeof updateUI === 'function') updateUI();
}

// ==========================================
// 확인
// ==========================================
function equipState(who) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who
        ? all.find(function (x) { return x.name === who || x.no === who || x.code === who; })
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' 장착 =====', 'color:#4fc3f7; font-size:13px');
    const rows = (u.equippedWeapons || []).map(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        return {
            칸: w,
            본이름: base,
            채운사람: !o ? '(기록 없음)' : (o === u.code ? '본인' : ((db.users[o] || {}).name || o)),
            소지품에도: (u.inventory || []).indexOf(base) >= 0 ? '✗ 남아 있음' : ''
        };
    });
    if (rows.length) console.table(rows); else console.log('  (없음)');
    console.log('  뒷정리 연결:', (typeof applyItemEffect === 'function' && applyItemEffect._equipTidy) ? 'O' : '-');
}

console.log('[장착] cleanEquipDupe() · equipState() 준비');