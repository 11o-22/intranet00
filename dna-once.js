// ==========================================
// ★ 고유 아이템 — 평생 한 번만
// index.html 에서 dna-extra.js 다음에 불러온다
// ==========================================
//
// 한 번 받은 사람에게는 다시 나오지 않는다.
// 받은 기록은 dnaGotItem 에 남는다.

// 이미 받았는가
function hasGotDna(user) {
    if (!user) return true;                 // 모르면 안 주는 쪽으로
    if (user.dnaGotItem) return true;

    // 기록이 없어도 지금 가지고 있으면 받은 것으로 친다
    const nm = (typeof dnaItemName === 'function') ? dnaItemName(user) : '';
    if (!nm) return true;
    if ((user.inventory || []).indexOf(nm) !== -1) return true;
    if ((user.equippedWeapons || []).some(function (w) {
        return (typeof getEquipBaseName === 'function' ? getEquipBaseName(w) : w) === nm;
    })) return true;

    return false;
}

// 받았다고 적어 둔다
function markGotDna(user) {
    if (!user || user.dnaGotItem) return;
    user.dnaGotItem = true;
    if (currentUser && user.code === currentUser.code) saveFields({ dnaGotItem: 1 });
    else updateUserFields(user.code, { dnaGotItem: true });
}

// ==========================================
// 추첨에서 뺀다
// ==========================================
(function hookRoll() {
    if (typeof rollBirthItem !== 'function') {
        console.warn('[고유] dna.js 가 먼저 올라와야 합니다.');
        return;
    }
    const _r = rollBirthItem;

    rollBirthItem = function (a, b, fill) {
        // 이미 받은 사람은 후보에서 뺀다
        const pa = hasGotDna(a) ? null : a;
        const pb = hasGotDna(b) ? null : b;

        // 둘 다 받았으면 고유가 아예 안 나온다
        if (!pa && !pb) {
            for (let i = 0; i < 40; i++) {
                const x = _r.call(this, null, null, fill);
                const c = ITEM_CATALOG[x];
                if (!c || !c.dnaOwner) return x;
            }
            return BIRTH_ITEMS[Math.floor(Math.random() * BIRTH_ITEMS.length)].n;
        }

        return _r.call(this, pa, pb, fill);
    };
})();

// ==========================================
// 나온 순간 기록한다
// ==========================================
(function hookBirth() {
    const iv = setInterval(function () {
        if (typeof checkPregBirth !== 'function') return;
        if (checkPregBirth._onceHooked) { clearInterval(iv); return; }
        const _c = checkPregBirth;

        checkPregBirth = function () {
            const r = _c.apply(this, arguments);
            setTimeout(stampGotDna, 600);
            return r;
        };
        checkPregBirth._onceHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 소지품에 자기 고유 아이템이 들어온 사람을 찾아 기록한다
function stampGotDna() {
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (typeof isRealUser === 'function' && !isRealUser(u)) return;
        if (!u || u.dnaGotItem) return;
        const nm = dnaItemName(u);
        if (!nm) return;
        const has = (u.inventory || []).indexOf(nm) !== -1
            || (u.equippedWeapons || []).some(function (w) {
                return getEquipBaseName(w) === nm;
            });
        if (has) markGotDna(u);
    });
}

// 들어올 때 한 번, 그 뒤로는 가끔
setTimeout(stampGotDna, 4000);
setInterval(stampGotDna, 60000);

// ==========================================
// 확인
// ==========================================
function listDnaGot() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (typeof isRealUser === 'function' && !isRealUser(u)) return null;
        const nm = dnaItemName(u);
        const has = (u.inventory || []).indexOf(nm) !== -1;
        const eq = (u.equippedWeapons || []).some(function (w) { return getEquipBaseName(w) === nm; });
        return {
            사번: u.no, 이름: u.name,
            아이템: nm ? nm.split(' · ')[0] : '-',
            받음: u.dnaGotItem ? 'O' : '-',
            소지: has ? 'O' : '-',
            장착: eq ? 'O' : '-',
            '또 나오나': hasGotDna(u) ? '아니오' : '예'
        };
    }).filter(Boolean);

    console.table(rows);
    const done = rows.filter(r => r['또 나오나'] === '아니오').length;
    console.log('받은 사원 ' + done + ' / ' + rows.length + '명');
}

// 상담사용 — 다시 나올 수 있게 되돌린다
function resetDnaGot(no) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const c = Object.keys(db.users).find(function (x) {
        return db.users[x] && db.users[x].no === no;
    });
    if (!c) { console.error('사번 없음:', no); return; }

    delete db.users[c].dnaGotItem;
    database.ref('users/' + c + '/dnaGotItem').remove().then(function () {
        console.log(db.users[c].name + ' 사원 — 다시 나올 수 있습니다.');
    });
}

console.log('[고유] 평생 1회 제한 적용 — listDnaGot() 으로 확인');