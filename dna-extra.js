// ==========================================
// ★ 고유 아이템 — 상담사가 따로 얹어 주기
// index.html 에서 dna-gifts.js 다음에 불러온다
// ==========================================
//
// 표 원본은 안 건드린다.
// 사원에게 dnaExtra 를 붙이면 그 사람 것에만 더해진다.

const DNA_EX_NAME = {
    death: '즉사 회피',
    gim:   '기믹 파훼',
    eva:   '회피',
    luck:  '행운',
    bon:   '판정',
    pct:   '공용시설 행운',
    dark:  '어둠 탐사',
    fac:   '공용시설'
};

function dnaDescOf(e) {
    const order = ['death', 'gim', 'eva', 'luck', 'bon', 'pct', 'dark', 'fac'];
    const out = [];
    order.forEach(function (k) {
        if (!e[k]) return;
        const nm = DNA_EX_NAME[k];
        if (k === 'pct') out.push(nm + ' ' + e[k] + '%');
        else if (k === 'bon') out.push(nm + ' +' + e[k]);
        else if (k === 'dark' || k === 'fac') out.push(nm + ' +' + e[k] + '회');
        else out.push(nm + ' ' + e[k] + '회');
    });
    return out.join(' · ');
}

// dnaGiftOf 를 감싸서 얹은 것을 합친다
(function hookGiftOf() {
    if (typeof dnaGiftOf !== 'function') {
        console.warn('[고유] dna-gifts.js 가 먼저 올라와야 합니다.');
        return;
    }
    const _g = dnaGiftOf;
    dnaGiftOf = function (user) {
        const base = _g.apply(this, arguments);
        if (!base) return base;

        const ex = user && user.dnaExtra;
        if (!ex || Object.keys(ex).length === 0) return base;

        const e = Object.assign({}, base.e);
        Object.keys(ex).forEach(function (k) {
            e[k] = (e[k] || 0) + ex[k];
        });

        return { n: base.n, e: e, p: base.p, d: dnaDescOf(e), boosted: true };
    };
})();

// ==========================================
// 얹기
// ==========================================
// giveDnaExtra('4892', { eva:2, bon:1 })
// 여러 명이면 giveDnaExtra({ '4892':{eva:2}, '4368':{luck:2} })
function giveDnaExtra(a, b) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const map = (typeof a === 'string') ? { [a]: b } : a;
    if (!map || typeof map !== 'object') { console.error('입력이 잘못되었습니다.'); return; }

    const updates = {}, rows = [];
    Object.keys(map).forEach(function (no) {
        const c = Object.keys(db.users).find(function (x) {
            return db.users[x] && db.users[x].no === no;
        });
        if (!c) { console.error('사번 없음:', no); return; }

        const u = db.users[c];
        const before = dnaGiftOf(u);
        if (!before) { console.error('번호가 없는 사원:', no); return; }

        u.dnaExtra = Object.assign({}, u.dnaExtra || {}, map[no]);

        Object.keys(ITEM_CATALOG).forEach(function (k) {
            if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner === c) delete ITEM_CATALOG[k];
        });
        ensureDnaItem(u);

        const after = dnaGiftOf(u);
        updates['users/' + c + '/dnaExtra'] = u.dnaExtra;
        rows.push({
            사번: no, 이름: u.name, 아이템: after.n,
            이전: before.d, 이후: after.d
        });
    });

    if (rows.length === 0) { console.warn('바꾼 사원이 없습니다.'); return; }
    console.table(rows);

    database.ref('/').update(updates).then(function () {
        console.log('%c✓ ' + rows.length + '명에게 얹었습니다.', 'color:#4CAF50');
        if (typeof updateUI === 'function') updateUI();
    }).catch(function (e) { console.error('실패:', e); });
}

// 되돌리기
function clearDnaExtra(no) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const c = Object.keys(db.users).find(function (x) {
        return db.users[x] && db.users[x].no === no;
    });
    if (!c) { console.error('사번 없음:', no); return; }

    const u = db.users[c];
    delete u.dnaExtra;
    Object.keys(ITEM_CATALOG).forEach(function (k) {
        if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner === c) delete ITEM_CATALOG[k];
    });
    ensureDnaItem(u);

    database.ref('users/' + c + '/dnaExtra').remove().then(function () {
        console.log(u.name + ' 사원 — 원래대로 돌렸습니다.');
        console.log('  ' + dnaGiftOf(u).d);
        if (typeof updateUI === 'function') updateUI();
    });
}

// 얹은 사람 보기
function listDnaExtra() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (!isRealUser(u) || !u.dnaExtra || !Object.keys(u.dnaExtra).length) return null;
        const g = dnaGiftOf(u);
        return {
            사번: u.no, 이름: u.name, 아이템: g.n,
            얹은것: dnaDescOf(u.dnaExtra), 현재: g.d
        };
    }).filter(Boolean);

    if (!rows.length) { console.log('얹어 준 사원이 없습니다.'); return; }
    console.table(rows);
}

console.log('[고유] 추가 부여 적용 — giveDnaExtra() · clearDnaExtra() · listDnaExtra()');