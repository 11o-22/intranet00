// ==========================================
// ★ 출산 고유 아이템 — 지금 누가 뭘 들고 있나
// bundles.json 마지막 묶음, dna-gifts.js · dna-extra.js 보다 뒤
// ==========================================
//
// ■ 왜 따로 만드나
//
//   listDnaItems() 가 이미 있지만 **번호와 이름만** 보여 준다.
//   어긋난 것을 찾으려면 그것으로는 모자란다. 알아야 할 것은 넷이다.
//
//     · 같은 번호를 둘 이상이 들고 있지 않은가   (겹침)
//     · 번호를 아직 못 받은 사원이 있지 않은가   (빈칸)
//     · 사원이 아닌 항목이 번호를 물고 있지 않은가 (유령)
//     · 적힌 번호와 **실제로 가진 물건**이 맞는가 (어긋남)
//
//   네 번째가 특히 중요하다. 번호는 바뀌어도 예전에 낳아서 받아 둔
//   물건은 소지품에 그대로 남는다. 그래서 「적힌 것」과 「든 것」이
//   달라질 수 있다.
//
// ■ 번호가 어떻게 흔들리나
//
//   dna-gifts.js 의 dnaGiftIndex() 는 번호를 이렇게 나눠 준다.
//
//       const used = new Set();
//       Object.keys(db.users || {}).forEach(…)   ← 지금 올라와 있는 사원만
//       let idx = 0;
//       while (used.has(idx)) idx++;             ← 가장 작은 빈 번호
//
//   **지금 내 화면에 올라와 있는 db.users 만** 보고 정한다. 트랜잭션도
//   아니다. 사원 목록이 다 안 내려온 참에 이 함수가 돌면 used 가 거의
//   비어 있어 0번부터 다시 나눠 주고, 두 사람이 같은 때에 들어오면
//   같은 번호를 받을 수도 있다. 한 번 적히면 그대로 굳는다.
//
// ■ 쓰는 법
//
//   dnaWho()      전부 — 겹침·빈칸·유령·어긋남까지 같이 적어 준다
//   dnaWho('강헌') 한 사람만
//   dnaDump()     붙여 둘 수 있는 글 — 지금 짜임새를 적어 두는 용도
//   dnaFree()     아직 아무도 안 가진 번호

(function dnaList() {

const ADMIN = 'kario0987';

function users() { return (typeof db !== 'undefined' && db.users) ? db.users : {}; }
function real(u) {
    try { if (typeof isRealUser === 'function') return isRealUser(u); } catch (e) { }
    return !!(u && u.code && u.name && u.code !== ADMIN);
}
function gifts() { return (typeof DNA_GIFTS !== 'undefined') ? DNA_GIFTS : []; }
// ★ 여기서는 **아무것도 적지 않는다.**
//
//   dnaOf() 와 dnaGiftOf() 는 값이 없으면 그 자리에서 만들어 **서버에
//   적는다.** 살펴보려고 부른 명령이 번호를 나눠 줘 버리면, 어긋난
//   것을 찾으려다 더 어긋나게 만든다. 그래서 둘 다 안 부르고 적혀
//   있는 것만 읽는다.
function dnaStr(u) {
    return (u && u.dna) ? u.dna : '(없음)';
}
function giftOf(u) {
    const i = u && u.dnaGift;
    if (i == null) return null;
    const base = gifts()[i];
    if (!base) return null;
    const ex = u.dnaExtra;
    if (!ex || !Object.keys(ex).length) return base;
    const e = Object.assign({}, base.e);
    Object.keys(ex).forEach(function (k) { e[k] = (e[k] || 0) + ex[k]; });
    let d = base.d;
    try { if (typeof dnaDescOf === 'function') d = dnaDescOf(e); } catch (err) { }
    return { n: base.n, e: e, p: base.p, d: d, boosted: true };
}
function fullName(u) {
    const i = u && u.dnaGift;
    if (i == null || !gifts()[i] || !u.dna) return '';
    return gifts()[i].n + ' · ' + u.dna;
}
function countIn(u, nm) {
    if (!u || !nm || !Array.isArray(u.inventory)) return 0;
    return u.inventory.filter(function (x) { return x === nm; }).length;
}
function wearing(u, nm) {
    if (!u || !nm || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        return b === nm;
    });
}
function exDesc(u) {
    const ex = u && u.dnaExtra;
    if (!ex || !Object.keys(ex).length) return '';
    try { if (typeof dnaDescOf === 'function') return dnaDescOf(ex); } catch (e) { }
    return Object.keys(ex).map(function (k) { return k + '+' + ex[k]; }).join(' · ');
}

// 사원 목록을 사번 순으로
function roster() {
    return Object.keys(users()).map(function (c) { return users()[c]; })
        .filter(real)
        .sort(function (a, b) {
            const x = String(a.no || '9999'), y = String(b.no || '9999');
            if (x !== y) return x < y ? -1 : 1;
            return String(a.code) < String(b.code) ? -1 : 1;
        });
}

// 번호 하나를 누가 들고 있나
function holders() {
    const m = {};
    roster().forEach(function (u) {
        if (u.dnaGift == null) return;
        (m[u.dnaGift] = m[u.dnaGift] || []).push(u.name);
    });
    return m;
}

// 사원이 아닌 항목이 물고 있는 번호
function ghosts() {
    const out = [];
    Object.keys(users()).forEach(function (c) {
        const u = users()[c];
        if (c === ADMIN) return;
        if (real(u)) return;
        if (!u || u.dnaGift == null) return;
        out.push({
            열쇠: c,
            이름: (u.name === undefined ? '(없음)' : u.name),
            사번: (u.no === undefined ? '(없음)' : u.no),
            물고있는번호: u.dnaGift,
            아이템: (gifts()[u.dnaGift] || {}).n || '?'
        });
    });
    return out;
}

window.dnaWho = function (who) {
    const G = gifts();
    if (!G.length) { console.warn('[고유] dna-gifts.js 가 아직 안 올라왔습니다.'); return; }

    let list = roster();
    if (who) {
        const q = String(who);
        list = list.filter(function (u) {
            return u.no === q || u.code === q || u.name === q;
        });
        if (!list.length) { console.warn('사원을 못 찾았습니다 — ' + q); return; }
    }

    const hold = holders();
    const rows = list.map(function (u) {
        const i = u.dnaGift;
        const base = (i != null && G[i]) ? G[i] : null;
        const merged = giftOf(u);
        const nm = fullName(u);
        const dup = (i != null && (hold[i] || []).length > 1);
        // 적힌 번호 말고 **실제로 가진** 고유 아이템
        const own = (u.inventory || []).filter(function (x) {
            const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[x] : null;
            return c && c.dnaOwner;
        });
        const mine = own.filter(function (x) { return x === nm; }).length;
        const alien = own.filter(function (x) { return x !== nm; });

        return {
            번호: (i == null ? '(없음)' : i),
            사원: u.name,
            사번: u.no || '-',
            DNA: dnaStr(u),
            아이템: base ? base.n : '(없음)',
            성능: merged ? merged.d : (base ? base.d : '-'),
            추가부여: exDesc(u) || '-',
            소지: mine,
            장착: wearing(u, nm) ? 'O' : '',
            겹침: dup ? hold[i].join(', ') : '',
            남의것: alien.length ? alien.join(', ') : ''
        };
    });

    console.log('%c===== 출산 고유 아이템 — ' + rows.length + '명 =====',
        'color:#c9a8ff; font-size:13px');
    console.table(rows);

    if (who) return rows;

    // --- 짚이는 것 ---
    const dupNos = Object.keys(hold).filter(function (k) { return hold[k].length > 1; });
    const blank = list.filter(function (u) { return u.dnaGift == null; });
    const gh = ghosts();
    const alien = rows.filter(function (r) { return r.남의것; });
    const noItem = rows.filter(function (r) { return r.번호 !== '(없음)' && r.소지 === 0; });

    console.log('%c----- 짚이는 것 -----', 'color:#ffd700');
    if (dupNos.length) {
        console.warn('■ 같은 번호를 둘 이상이 들고 있습니다 — ' + dupNos.length + '건');
        console.table(dupNos.map(function (k) {
            return { 번호: Number(k), 아이템: (G[k] || {}).n || '?', 사원: hold[k].join(', ') };
        }));
    } else console.log('· 겹치는 번호 없음');

    if (blank.length) {
        console.warn('■ 번호를 아직 못 받은 사원 ' + blank.length + '명 — '
            + blank.map(function (u) { return u.name; }).join(', '));
        console.log('  (화면에 들어오는 순간 가장 작은 빈 번호를 받습니다)');
    } else console.log('· 번호 없는 사원 없음');

    if (gh.length) {
        console.warn('■ 사원이 아닌 항목이 번호를 물고 있습니다 — ' + gh.length + '건');
        console.table(gh);
    } else console.log('· 유령이 문 번호 없음');

    if (alien.length) {
        console.warn('■ 남의 고유 아이템을 들고 있는 사원 ' + alien.length + '명');
        console.table(alien.map(function (r) {
            return { 사원: r.사원, 가진것: r.남의것 };
        }));
    } else console.log('· 남의 것을 든 사원 없음');

    if (noItem.length) {
        console.log('· 번호는 있는데 아직 안 받은 사원 ' + noItem.length + '명 — '
            + noItem.map(function (r) { return r.사원; }).join(', '));
    }

    console.log('');
    console.log('전체 ' + G.length + '종 · 쓰인 번호 ' + Object.keys(hold).length + '개 · '
        + '남은 번호 ' + (G.length - Object.keys(hold).length) + '개');
    console.log('지금 짜임새를 적어 두려면  dnaDump()');
    return rows;
};

// 붙여 둘 수 있는 글 — 지금 짜임새를 따로 적어 두는 용도
window.dnaDump = function () {
    const G = gifts();
    const lines = roster().map(function (u) {
        const i = u.dnaGift;
        return [
            String(u.no || '-').padEnd(6, ' '),
            String(u.name || '').padEnd(10, ' '),
            String(i == null ? '-' : i).padStart(3, ' '),
            '  ' + ((i != null && G[i]) ? G[i].n : '(없음)'),
            (u.dnaExtra && Object.keys(u.dnaExtra).length)
                ? '   [추가 ' + JSON.stringify(u.dnaExtra) + ']' : ''
        ].join('');
    });
    const head = '# 출산 고유 아이템 — ' + new Date().toLocaleString() + ' 기준 (' + lines.length + '명)\n'
        + '# 사번   이름        번호  아이템\n';
    const text = head + lines.join('\n');
    console.log(text);
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                console.log('%c✓ 복사했습니다.', 'color:#4CAF50');
            }).catch(function () { console.log('(복사는 안 됐습니다 — 위 글을 그대로 긁어 두십시오)'); });
        }
    } catch (e) { }
    return text;
};

// 아직 아무도 안 가진 번호
window.dnaFree = function () {
    const G = gifts();
    const hold = holders();
    const free = [];
    for (let i = 0; i < G.length; i++) if (!hold[i]) free.push(i);
    console.log('%c===== 남은 번호 ' + free.length + '개 =====', 'color:#c9a8ff; font-size:13px');
    console.table(free.map(function (i) {
        return { 번호: i, 아이템: G[i].n, 성능: G[i].d };
    }));
    return free;
};

console.log('[고유] dnaWho() · dnaWho(사번) · dnaDump() · dnaFree()');

})();
