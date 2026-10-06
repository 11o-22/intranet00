// ==========================================
// ★ 사원 소지품 점검
// bundles.json 마지막 그룹, node-set.js 뒤 (맨 끝)
// ==========================================
//
// ■ 쓰는 법
//
//   invBad()       ← 이것만 보면 됩니다. 정상으로 설명되지 않는 것만 짚습니다.
//   invBad('2542') 한 사원만
//
//   invAudit()     전수 — 위의 것에 참고 자료(많이 쌓아 둔 품목 등)까지 붙습니다
//   invSnap()      지금 모습을 적어 둔다 (이 브라우저에만)
//   invDiff()      적어 둔 때와 지금을 견준다 — 누가 무엇을 잃고 얻었나
//
//   사라지는 일이 또 생기면 invSnap() → (생길 때까지 기다림) → invDiff().
//
// ■ 왜 「정상으로 설명되는 것」을 갈라 두었나
//
//   처음에 임계값으로 재는 검사를 세 개 넣었는데 전부 헛경보였다.
//
//     · 「서로 닮은 꾸러미」를 겹침÷작은쪽 으로 셌다 → 작은 꾸러미가 큰 것
//       안에 들어 있기만 해도 97% 가 나왔다. 상담사(33개)가 열세 명과 97%.
//       겹침÷(A+B−겹침) 으로 바꿨더니 실제 자료 55줄에서 90% 넘는 줄이 0개.
//     · 「한 품목 40개 이상」 → 상비약은 하루 네 번 공짜로 준다. 한 달에 120개.
//       활동한 사원은 전부 걸렸다. 참고로 내렸다.
//     · 「물품 목록에 없는 유령 품목」 → 어둠 회수품은 DARK_LOOT_BY_ZONE
//       (dark.js:160) 에만 있고 ITEM_CATALOG 에는 없다. 멀쩡한 회수품이 찍혔다.
//
//   그래서 ■ (정상으로 설명될 길이 없는 것) 과 □ (참고) 를 갈라 두었다.
//   invBad() 는 ■ 만 본다.

(function invAudit() {

const KEY = 'invSnap.v1';

// 하나뿐이어야 하는 것들 — 둘 이상 나오면 통째 쓰기나 복사 사고다
const ONLY_ONE = [
    '🩶 은심장', '은심장', '🦊 호사수구', '호사수구', '📺 브라운의 심야 토크 쇼',
    '복사기', '우리가 도움', '여우구슬', '금고', '사직서', '💍 커플링',
    '황룡의 눈', '산군의 도움', '소원권', '％＄＠＆ 이동장', '두 번째 자리'
];
const MANY_OK = 40;              // 참고 표에 올릴 기준

// 많이 쌓이는 품목이 어디서 오는지 — 수가 설명되는지 바로 보이게
const SOURCE = {
    '상비약 (오염도 -10%)': '정기 보급 하루 4개 (08·13·18·23시)',
    '생수': '상점 5P',
    '익명 편지': '상점 20P',
    '벽지 견본첩': '유쾌 판매소 하루 5개',
    '???의 티켓': '상점',
    '중급 물약': '상점',
    '반창고': '어둠 회수품 · 상점',
    '마스크': '어둠 회수품 · 상점'
};

function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function counts(a) {
    const c = {};
    a.forEach(function (x) { c[x] = (c[x] || 0) + 1; });
    return c;
}
// 두 꾸러미가 겹치는 개수 (개수까지 센다)
function overlap(a, b) {
    const cb = counts(b);
    let n = 0;
    a.forEach(function (x) { if (cb[x] > 0) { cb[x]--; n++; } });
    return n;
}
function real(u) { return !!(u && u.name && u.code); }
function read() {
    if (typeof database === 'undefined' || !database) {
        return Promise.reject(new Error('서버에 붙어 있지 않습니다.'));
    }
    return database.ref('users').once('value').then(function (s) { return s.val() || {}; });
}

// 이름이 있을 수 있는 자리를 모두 모은다
function knownNames() {
    const known = {};
    if (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG) {
        Object.keys(ITEM_CATALOG).forEach(function (k) { known[k] = '물품 목록'; });
    }
    if (typeof DARK_LOOT_BY_ZONE !== 'undefined' && DARK_LOOT_BY_ZONE) {
        Object.keys(DARK_LOOT_BY_ZONE).forEach(function (z) {
            (DARK_LOOT_BY_ZONE[z] || []).forEach(function (l) {
                if (l && l.name && !known[l.name]) known[l.name] = '어둠 회수품';
            });
        });
    }
    return known;
}

function ctx(users, only) {
    let codes = Object.keys(users).filter(function (c) { return real(users[c]); });
    if (only) {
        const want = String(only);
        codes = codes.filter(function (c) {
            const u = users[c];
            return c === want || u.no === want || u.name === want;
        });
    }
    const inv = {};
    codes.forEach(function (c) { inv[c] = arr(users[c].inventory); });
    return {
        users: users, codes: codes, inv: inv,
        nameOf: function (c) {
            return users[c] ? (users[c].name + '(' + (users[c].no || c) + ')') : c;
        }
    };
}

// ==========================================
// ■ 정상으로 설명될 길이 없는 것들
// ==========================================

// 1. 소지품 모양이 어긋남 — 쓰기 사고의 흔적
function chkShape(x) {
    const rows = [];
    x.codes.forEach(function (c) {
        const raw = x.users[c].inventory;
        const bad = [];
        if (raw && !Array.isArray(raw) && typeof raw === 'object') bad.push('배열이 아니라 객체');
        if (arr(raw).some(function (v) { return v == null || v === ''; })) bad.push('빈 칸이 섞임');
        if (arr(raw).some(function (v) { return typeof v !== 'string'; })) bad.push('글자가 아닌 것이 섞임');
        if (bad.length) rows.push({ 사원: x.nameOf(c), 칸: arr(raw).length, 이상: bad.join(' · ') });
    });
    return { title: '소지품 모양이 어긋난 사원', rows: rows, hard: true };
}

// 2. 어디에도 없는 이름
function chkUnknown(x) {
    const known = knownNames();
    const rows = [];
    if (!Object.keys(known).length) return { title: '어디에도 없는 이름', rows: rows, skip: true };
    x.codes.forEach(function (c) {
        const bad = {};
        x.inv[c].forEach(function (it) {
            const base = String(it).replace(/^\[복제품\]\s*/, '');
            if (!known[it] && !known[base]) bad[it] = (bad[it] || 0) + 1;
        });
        const k = Object.keys(bad);
        if (k.length) {
            rows.push({ 사원: x.nameOf(c),
                품목: k.map(function (v) { return v + '×' + bad[v]; }).join(', ') });
        }
    });
    return {
        title: '어디에도 없는 이름 — 물품 목록에도, 어둠 회수품 표에도 없습니다',
        rows: rows, hard: true,
        note: '제가 모르는 자리에서 나온 것일 수도 있습니다. 짚어만 둡니다.',
        known: known
    };
}

// 3. 하나뿐이어야 하는 물건을 여럿이 지님
function chkOnlyOne(x) {
    const rows = [];
    ONLY_ONE.forEach(function (nm) {
        const who = [];
        x.codes.forEach(function (c) {
            const n = x.inv[c].filter(function (v) { return v === nm; }).length
                + arr(x.users[c].equippedWeapons).filter(function (w) {
                      return String(w).split(' · ')[0] === nm; }).length;
            if (n) who.push(x.nameOf(c) + (n > 1 ? '×' + n : ''));
        });
        if (who.length > 1) {
            rows.push({ 품목: nm, 가진사람: who.length + '명', 명단: who.join(', ') });
        }
    });
    return { title: '하나뿐이어야 하는 물건을 여럿이 지님', rows: rows, hard: true };
}

// 4. 남의 고유 아이템(DNA)
function chkOthersDna(x) {
    const rows = [];
    if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG) {
        return { title: '남의 고유 아이템', rows: rows, skip: true };
    }
    x.codes.forEach(function (c) {
        x.inv[c].forEach(function (it) {
            const cat = ITEM_CATALOG[it];
            if (!cat || !cat.dnaOwner || cat.dnaOwner === c) return;
            rows.push({ 사원: x.nameOf(c), 품목: it, 임자: x.nameOf(cat.dnaOwner) });
        });
    });
    return {
        title: '남의 고유 아이템을 지닌 사원', rows: rows, hard: true,
        note: '주고받은 것일 수도 있습니다. 임자에게 물어보면 압니다.'
    };
}

// 5. 장착칸 이상
function chkGear(x) {
    const rows = [];
    x.codes.forEach(function (c) {
        const ws = arr(x.users[c].equippedWeapons);
        const own = x.users[c].equipOwner || {};
        ws.forEach(function (w) {
            const o = own[w];
            if (o && !x.users[o]) {
                rows.push({ 사원: x.nameOf(c), 장비: w, 이상: '임자 사번(' + o + ')이 없습니다' });
            }
        });
        if (ws.length > 12) {
            rows.push({ 사원: x.nameOf(c), 장비: ws.length + '개', 이상: '장착칸(12)을 넘었습니다' });
        }
    });
    return { title: '장착칸이 어긋난 사원', rows: rows, hard: true };
}

// 6. 꾸러미가 아예 한 사람 것처럼 똑같은 짝
//
//   겹침÷(A+B−겹침) 으로 센다. 크기가 다른 짝은 저절로 떨어진다.
//   (겹침÷작은쪽 으로 셌다가 헛경보가 났다 — 맨 위 주석)
function chkTwin(x) {
    const rows = [];
    for (let i = 0; i < x.codes.length; i++) {
        for (let j = i + 1; j < x.codes.length; j++) {
            const a = x.inv[x.codes[i]], b = x.inv[x.codes[j]];
            if (a.length < 8 || b.length < 8) continue;
            const ov = overlap(a, b);
            const uni = a.length + b.length - ov;
            const r = uni ? ov / uni : 0;
            if (r >= 0.9 && ov >= 8) {
                rows.push({ 사원1: x.nameOf(x.codes[i]) + ' (' + a.length + '개)',
                            사원2: x.nameOf(x.codes[j]) + ' (' + b.length + '개)',
                            겹침: ov + '개', 닮은정도: Math.round(r * 100) + '%' });
            }
        }
    }
    return { title: '꾸러미가 아예 한 사람 것처럼 똑같은 짝', rows: rows, hard: true };
}

const HARD = [chkShape, chkUnknown, chkOnlyOne, chkOthersDna, chkGear, chkTwin];

function show(res) {
    if (res.skip || !res.rows.length) return 0;
    console.log('%c■ ' + res.title, 'color:#ff6b6b');
    console.table(res.rows);
    if (res.note) console.log('   ' + res.note);
    return 1;
}

// ==========================================
// invBad — 이것만 보면 된다
// ==========================================
window.invBad = function (who) {
    try { if (typeof buildAllDnaItems === 'function') buildAllDnaItems(); } catch (e) { }

    return read().then(function (users) {
        const x = ctx(users, who);
        if (!x.codes.length) {
            console.warn(who ? ('사번 ' + who + ' 를 못 찾았습니다.') : '사원이 없습니다.');
            return null;
        }

        console.log('%c===== 소지품 이상 점검' + (who ? ' — ' + x.nameOf(x.codes[0]) : '')
            + ' (' + x.codes.length + '명) =====', 'color:#ff8f6b; font-size:14px');

        let flags = 0;
        let known = null;
        HARD.forEach(function (fn) {
            const res = fn(x);
            if (res.known) known = res.known;
            flags += show(res);
        });

        if (known) {
            const a = Object.keys(known).filter(function (k) { return known[k] === '물품 목록'; }).length;
            const b = Object.keys(known).length - a;
            console.log('  (이름을 아는 자리: 물품 목록 ' + a + '가지 + 어둠 회수품 ' + b + '가지)');
        }
        if (!flags) {
            console.log('%c  이상 없습니다. 정상으로 설명되지 않는 것이 하나도 없습니다.',
                'color:#4CAF50; font-size:13px');
            console.log('  그래도 사라지는 일이 생기면 invSnap() 을 걸어 두고,'
                + ' 생긴 뒤에 invDiff() 로 견주십시오. 현장을 잡는 쪽이 확실합니다.');
        } else {
            console.log('%c  ' + flags + '가지가 걸렸습니다.', 'color:#ff8f6b; font-size:13px');
            console.log('  이 표를 알려 주시면 고칠 길을 찾겠습니다.'
                + ' 누가 통째로 썼는지는 nodeSetLog() 에 남습니다.');
        }
        return { 사원: x.codes.length, 걸린가지: flags };
    }).catch(function (e) {
        console.error('[점검] 읽지 못했습니다:', e && e.message);
    });
};

// ==========================================
// invAudit — 참고 자료까지
// ==========================================
window.invAudit = function (who) {
    return window.invBad(who).then(function (r) {
        if (!r) return r;
        return read().then(function (users) {
            const x = ctx(users, who);

            // □ 한 품목을 많이 지님 — 이상이 아니다
            const many = [];
            x.codes.forEach(function (c) {
                const cc = counts(x.inv[c]);
                Object.keys(cc).forEach(function (k) {
                    if (cc[k] >= MANY_OK) {
                        many.push({ 사원: x.nameOf(c), 품목: k, 개수: cc[k],
                                    '어디서 생기나': SOURCE[k] || '—' });
                    }
                });
            });
            if (many.length) {
                console.log('%c□ 참고 — 한 품목을 ' + MANY_OK + '개 이상 지님 (이상이 아닙니다)',
                    'color:#9fd0ff');
                console.table(many.sort(function (p, q) { return q.개수 - p.개수; }));
                console.log('  상비약은 하루 4개 공짜로 줍니다. 한 달이면 120개입니다.'
                    + ' 생수 5P · 익명 편지 20P · 벽지 견본첩 하루 5개 한도.');
            }

            // □ 소지품이 많은 사원
            const big = x.codes.map(function (c) { return { c: c, n: x.inv[c].length }; })
                .filter(function (v) { return v.n >= 500; })
                .sort(function (p, q) { return q.n - p.n; });
            if (big.length) {
                console.log('%c□ 참고 — 소지품이 500개를 넘는 사원', 'color:#9fd0ff');
                console.table(big.map(function (v) {
                    const cc = counts(x.inv[v.c]);
                    const top = Object.keys(cc).sort(function (p, q) { return cc[q] - cc[p]; })[0];
                    return { 사원: x.nameOf(v.c), 개수: v.n, 가장많은품목: top + '×' + cc[top],
                             '품목 종류': Object.keys(cc).length + '가지' };
                }));
                console.log('  (쌓아 둔 것일 수도 있습니다. 이것만으로는 이상이라 할 수 없습니다)');
            }

            const total = x.codes.reduce(function (a, c) { return a + x.inv[c].length; }, 0);
            console.log('  소지품 모두 ' + total.toLocaleString() + '개 · 사원 ' + x.codes.length + '명');
            return r;
        });
    });
};

// ==========================================
// 지금 모습을 적어 두기
// ==========================================
window.invSnap = function () {
    return read().then(function (users) {
        const snap = { at: Date.now(), u: {} };
        Object.keys(users).forEach(function (c) {
            if (!real(users[c])) return;
            snap.u[c] = {
                n: users[c].name, no: users[c].no,
                inv: arr(users[c].inventory),
                pts: Number(users[c].points) || 0,
                gear: arr(users[c].equippedWeapons)
            };
        });
        try { localStorage.setItem(KEY, JSON.stringify(snap)); }
        catch (e) { console.warn('[점검] 자리가 모자라 저장은 못 했습니다. 이 창에만 남깁니다.'); }
        window._invSnapMem = snap;
        console.log('%c✓ ' + Object.keys(snap.u).length + '명의 모습을 적어 두었습니다. ('
            + new Date(snap.at).toLocaleString() + ')', 'color:#4CAF50');
        console.log('  다음에 사라지는 일이 생기면 invDiff() 를 치십시오.');
    }).catch(function (e) { console.error('[점검]', e && e.message); });
};

// ==========================================
// 적어 둔 때와 견주기
// ==========================================
window.invDiff = function () {
    let old = window._invSnapMem;
    if (!old) { try { old = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { } }
    if (!old || !old.u) { console.warn('적어 둔 것이 없습니다. 먼저 invSnap() 을 치십시오.'); return; }

    return read().then(function (users) {
        const rows = [];
        Object.keys(old.u).forEach(function (c) {
            const was = old.u[c];
            const now = users[c];
            if (!now) {
                rows.push({ 사원: was.n + '(' + was.no + ')', 잃은것: '계정이 없습니다',
                            늘어난것: '', 돈: '' });
                return;
            }
            const ca = counts(was.inv), cb = counts(arr(now.inventory));
            const lost = [], got = [];
            Object.keys(ca).forEach(function (k) {
                const d = ca[k] - (cb[k] || 0);
                if (d > 0) lost.push(k + (d > 1 ? '×' + d : ''));
            });
            Object.keys(cb).forEach(function (k) {
                const d = cb[k] - (ca[k] || 0);
                if (d > 0) got.push(k + (d > 1 ? '×' + d : ''));
            });
            const dp = (Number(now.points) || 0) - was.pts;
            if (!lost.length && !got.length && !dp) return;
            rows.push({
                사원: was.n + '(' + was.no + ')',
                잃은것: lost.join(', ') || '—',
                늘어난것: got.join(', ') || '—',
                돈: (dp > 0 ? '+' : '') + dp.toLocaleString()
            });
        });

        console.log('%c===== ' + new Date(old.at).toLocaleString() + ' 부터 지금까지 =====',
            'color:#ff8f6b; font-size:13px');
        if (!rows.length) { console.log('%c  달라진 사원이 없습니다.', 'color:#4CAF50'); return; }
        console.table(rows);
        console.log('  「늘어난것」에 산 적 없는 물건이 있으면 그 사원이 되돌려진 것입니다.');
        console.log('  잃은 쪽과 늘어난 쪽이 다른 사원끼리 짝이 맞으면 섞인 것입니다.');
    }).catch(function (e) { console.error('[점검]', e && e.message); });
};

console.log('[점검] invBad() ← 이것만 보면 됩니다 · invAudit() · invSnap() · invDiff()');

})();
