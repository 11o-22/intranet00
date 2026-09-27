// ==========================================
// ★ 남이 채운 것은 스스로 못 뺀다
// index.html 에서 equip-fix.js 다음에 불러온다
// ==========================================
//
// unequipWeapon 은 번호로 바로 빼낸다. 누가 채웠는지 보지 않는다.
// 아래 목록에 든 물건은, 채운 사람이 따로 있으면 본인이 뺄 수 없다.
// 채운 사람은 예전처럼 retrieveEquipFromUser 로 거둬 간다.

(function equipLock() {

// 잠글 물건 — 여기에 이름을 더하면 같이 잠긴다
const LOCKED = [
    '루비 클리 피어싱',
    '루비 유두 피어싱'
];

function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
}

function lockedBy(w) {
    if (LOCKED.indexOf(baseOf(w)) === -1) return null;
    const o = (typeof getEquipOwner === 'function') ? getEquipOwner(currentUser, w) : null;
    if (!o || o === currentUser.code) return null;
    return o;
}

(function hookUnequip() {
    const iv = setInterval(function () {
        if (typeof unequipWeapon !== 'function') return;
        if (unequipWeapon._ownerLock) { clearInterval(iv); return; }

        const _f = unequipWeapon;
        unequipWeapon = function (index) {
            if (!window.__equipForce) {
                const w = (currentUser.equippedWeapons || [])[index];
                const o = w ? lockedBy(w) : null;
                if (o) {
                    const nm = (db.users[o] || {}).name || o;
                    showCustomAlert(baseOf(w) + '\n\n'
                        + nm + ' 사원이 채운 것입니다.\n스스로는 뺄 수 없습니다.');
                    return;
                }
            }
            return _f.apply(this, arguments);
        };
        unequipWeapon._ownerLock = true;
        clearInterval(iv);
        console.log('[장착잠금] ' + LOCKED.join(' · ') + ' — 본인 해제 차단');
    }, 500);
})();

// ==========================================
// 상담사용 — 억지로 뺀다
// ==========================================
window.forceUnequip = function (index) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.warn('상담사만 쓸 수 있습니다.'); return;
    }
    window.__equipForce = true;
    try { unequipWeapon(index); }
    finally { window.__equipForce = false; }
};

// 남의 계정에서 억지로 뺀다 — forceUnequipFor('4892', '루비 클리 피어싱')
window.forceUnequipFor = function (who, name) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.warn('상담사만 쓸 수 있습니다.'); return;
    }
    const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .find(function (u) { return u && (u.no === who || u.code === who || u.name === who); });
    if (!t) { console.warn('사원을 못 찾았습니다: ' + who); return; }
    const eq = t.equippedWeapons || [];
    const i = eq.findIndex(function (w) { return baseOf(w) === name; });
    if (i < 0) { console.warn(t.name + ' 사원은 ' + name + ' 을(를) 차고 있지 않습니다.'); return; }
    const full = eq[i];
    eq.splice(i, 1);
    if (t.equipOwner) delete t.equipOwner[full];
    updateUserFields(t.code, { equippedWeapons: eq, equipOwner: t.equipOwner || {} });
    console.log('%c✓ ' + t.name + ' 사원에게서 ' + full + ' 을(를) 뺐습니다.', 'color:#4CAF50');
};

// ==========================================
// 확인
// ==========================================
window.equipLockState = function (who) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x.no === who || x.code === who || x.name === who; })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' 장착 =====', 'color:#c9a8ff; font-size:13px');
    const rows = (u.equippedWeapons || []).map(function (w, i) {
        const b = baseOf(w);
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        const locked = LOCKED.indexOf(b) >= 0 && o && o !== u.code;
        return {
            번호: i,
            물건: b,
            '채운 사람': !o ? '(기록 없음)' : (o === u.code ? '본인' : ((db.users[o] || {}).name || o)),
            '본인 해제': locked ? '✗ 막힘' : '가능'
        };
    });
    if (rows.length) console.table(rows); else console.log('  (없음)');
    console.log('  잠금 대상:', LOCKED.join(' · '));
};

console.log('[장착잠금] equipLockState() · forceUnequip(번호) · forceUnequipFor(사번, 이름)');

})();