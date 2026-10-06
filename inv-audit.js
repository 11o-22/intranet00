// ==========================================
// ★ 사원 소지품 전수 점검
// bundles.json 마지막 그룹, node-set.js 뒤 (맨 끝)
// ==========================================
//
// ■ 무엇을 보나
//
//   소지품이 통째로 사라지거나, 사지도 않은 물건이 채워지는 일이 있었다.
//   까닭은 「사원 기록 통째 쓰기」다. (node-set.js 에 적어 두었다)
//
//       database.ref('users/' + 누구).set(제화면에캐시된객체)
//
//   set 은 넘긴 객체 그대로 서버를 갈아치운다. 그 객체는 **내 화면이
//   언젠가 받아 둔 모습**이다. 그래서 그 사원에게는 이렇게 보인다.
//
//       · 그 뒤에 산 물건이 사라진다
//       · 그 전에 쓰거나 팔았던 물건이 되살아난다  → 「사지도 않은 것」
//
//   node-set.js 가 그 길을 막았지만, **이미 어긋난 자료는 그대로 남아 있다.**
//   그래서 전부 훑어 본다.
//
// ■ 쓰는 법
//
//   invAudit()     지금 서버 자료를 전부 읽어 수상한 것을 짚는다
//   invSnap()      지금 모습을 적어 둔다 (이 브라우저에만)
//   invDiff()      적어 둔 때와 지금을 견준다 — 누가 무엇을 잃고 얻었나
//
//   사라지는 일이 또 생기면 invSnap() → (생길 때까지 기다림) → invDiff().
//   그러면 어느 사원이 무엇을 잃었고 무엇이 까닭 없이 늘었는지 바로 나온다.
//
// ■ 고치지는 않는다
//
//   무엇이 옳은 모습인지는 사람이 봐야 안다. 그래서 짚기만 한다.

(function invAudit() {

const KEY = 'invSnap.v1';

// 하나뿐이어야 하는 것들 — 둘 이상 나오면 통째 쓰기나 복사 사고다
const ONLY_ONE = [
    '🩶 은심장', '은심장', '🦊 호사수구', '호사수구', '📺 브라운의 심야 토크 쇼',
    '복사기', '우리가 도움', '여우구슬', '금고', '사직서', '💍 커플링',
    '황룡의 눈', '산군의 도움', '소원권', '％＄＠＆ 이동장', '두 번째 자리'
];
const MANY_OK = 40;              // 한 품목을 이보다 많이 가지면 들여다본다

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
function real(u) {
    return !!(u && u.name && u.code);
}
function read() {
    if (typeof database === 'undefined' || !database) return Promise.reject(new Error('서버에 붙어 있지 않습니다.'));
    return database.ref('users').once('value').then(function (s) { return s.val() || {}; });
}

// ==========================================
// 전수 점검
// ==========================================
window.invAudit = function () {
    try { if (typeof buildAllDnaItems === 'function') buildAllDnaItems(); } catch (e) { }

    return read().then(function (users) {
        const codes = Object.keys(users).filter(function (c) { return real(users[c]); });
        const inv = {};
        codes.forEach(function (c) { inv[c] = arr(users[c].inventory); });
        const nameOf = function (c) { return users[c] ? (users[c].name + '(' + (users[c].no || c) + ')') : c; };

        console.log('%c===== 사원 소지품 전수 점검 — ' + codes.length + '명 =====',
            'color:#ff8f6b; font-size:14px');

        let flags = 0;

        // ── 1. 구조가 어긋난 것
        const shape = [];
        codes.forEach(function (c) {
            const raw = users[c].inventory;
            const bad = [];
            if (raw && !Array.isArray(raw) && typeof raw === 'object') bad.push('배열이 아니라 객체');
            if (arr(raw).some(function (x) { return x == null || x === ''; })) bad.push('빈 칸이 섞임');
            if (arr(raw).some(function (x) { return typeof x !== 'string'; })) bad.push('글자가 아닌 것이 섞임');
            if (bad.length) shape.push({ 사원: nameOf(c), 칸: arr(raw).length, 이상: bad.join(' · ') });
        });
        if (shape.length) { flags++; console.log('%c■ 소지품 모양이 어긋난 사원', 'color:#ff8f6b'); console.table(shape); }

        // ── 2. 목록에 없는 유령 품목
        if (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG) {
            const ghost = [];
            codes.forEach(function (c) {
                const bad = {};
                inv[c].forEach(function (it) {
                    const base = String(it).replace(/^\[복제품\]\s*/, '');
                    if (!ITEM_CATALOG[it] && !ITEM_CATALOG[base]) bad[it] = (bad[it] || 0) + 1;
                });
                const k = Object.keys(bad);
                if (k.length) ghost.push({ 사원: nameOf(c),
                    품목: k.map(function (x) { return x + '×' + bad[x]; }).join(', ') });
            });
            if (ghost.length) { flags++; console.log('%c■ 물품 목록에 없는 품목을 지닌 사원', 'color:#ff8f6b'); console.table(ghost); }
        }

        // ── 3. 남의 고유 아이템(DNA)
        if (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG) {
            const dna = [];
            codes.forEach(function (c) {
                inv[c].forEach(function (it) {
                    const cat = ITEM_CATALOG[it];
                    if (!cat || !cat.dnaOwner || cat.dnaOwner === c) return;
                    dna.push({ 사원: nameOf(c), 품목: it, 임자: nameOf(cat.dnaOwner) });
                });
            });
            if (dna.length) {
                flags++;
                console.log('%c■ 남의 고유 아이템을 지닌 사원 (주고받은 것일 수도 있습니다)', 'color:#ffcf8f');
                console.table(dna);
            }
        }

        // ── 4. 하나뿐이어야 하는 것이 여럿
        const dup = [];
        ONLY_ONE.forEach(function (nm) {
            const who = [];
            codes.forEach(function (c) {
                const n = inv[c].filter(function (x) { return x === nm; }).length
                        + arr(users[c].equippedWeapons).filter(function (w) {
                              return String(w).split(' · ')[0] === nm; }).length;
                if (n) who.push(nameOf(c) + (n > 1 ? '×' + n : ''));
            });
            if (who.length > 1) dup.push({ 품목: nm, 가진사람: who.length + '명', 명단: who.join(', ') });
        });
        if (dup.length) { flags++; console.log('%c■ 하나뿐이어야 하는 물건을 여럿이 지님', 'color:#ff6b6b'); console.table(dup); }

        // ── 5. 한 품목을 많이 지님 — 「이상」이 아니라 「참고」다
        //
        //   처음에 40개를 넘으면 이상으로 쳤다. 잘못 잡은 임계값이었다.
        //   상비약은 하루 네 번(08·13·18·23시) 공짜로 준다(index.html:4705).
        //   안 쓰고 두면 한 달에 120개가 된다. 생수는 5P, 익명 편지는 20P,
        //   벽지 견본첩은 하루 5개까지 살 수 있다(skin.js:537).
        //   그러니 활동한 사원은 전부 걸린다. 복사된 흔적이 아니다.
        //
        //   그래서 걸린 가지 수에는 세지 않고 표만 보여 준다. 가진 경로와
        //   하루 한도를 같이 적어 두어, 수가 설명되는지 바로 보이게 한다.
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
        const many = [];
        codes.forEach(function (c) {
            const cc = counts(inv[c]);
            Object.keys(cc).forEach(function (k) {
                if (cc[k] >= MANY_OK) {
                    many.push({ 사원: nameOf(c), 품목: k, 개수: cc[k],
                                '어디서 생기나': SOURCE[k] || '—' });
                }
            });
        });
        if (many.length) {
            console.log('%c□ 참고 — 한 품목을 ' + MANY_OK + '개 이상 지님 (이상이 아닙니다)', 'color:#9fd0ff');
            console.table(many.sort(function (x, y) { return y.개수 - x.개수; }));
            console.log('  상비약은 하루 4개 공짜로 줍니다. 한 달이면 120개입니다.'
                + ' 생수는 5P · 익명 편지는 20P · 벽지 견본첩은 하루 5개 한도입니다.');
            console.log('  수가 그 경로로 설명되면 정상입니다. 설명이 안 되는 줄만 알려 주십시오.');
        }

        // ── 6. 꾸러미가 아예 한 사람 것처럼 똑같은 짝
        //
        //   처음에 「겹침 / 작은 쪽」으로 셌다가 크게 틀렸다. 작은 꾸러미가 큰
        //   꾸러미 안에 들어 있기만 해도 97% 가 나왔다. 이 게임은 상점 품목이
        //   정해져 있어 누구 꾸러미든 같은 이름 수십 가지로 이루어지므로,
        //   2,000개를 쌓아 둔 사원은 남의 작은 꾸러미를 거의 자동으로 품는다.
        //   그래서 상담사(33개)가 열세 명과 97% 로 찍히는 헛경보가 났다.
        //
        //   양쪽을 다 보는 값으로 바꾼다.
        //       겹침 / (A + B − 겹침)
        //   크기가 다른 짝은 저절로 떨어진다. 똑같이 복사된 짝만 남는다.
        const twin = [];
        for (let i = 0; i < codes.length; i++) {
            for (let j = i + 1; j < codes.length; j++) {
                const a = inv[codes[i]], b = inv[codes[j]];
                if (a.length < 8 || b.length < 8) continue;
                const ov = overlap(a, b);
                const uni = a.length + b.length - ov;          // 둘을 합친 크기
                const r = uni ? ov / uni : 0;
                if (r >= 0.9 && ov >= 8) {
                    twin.push({ 사원1: nameOf(codes[i]) + ' (' + a.length + '개)',
                                사원2: nameOf(codes[j]) + ' (' + b.length + '개)',
                                겹침: ov + '개', 닮은정도: Math.round(r * 100) + '%' });
                }
            }
        }
        if (twin.length) {
            flags++;
            console.log('%c■ 꾸러미가 아예 한 사람 것처럼 똑같은 짝', 'color:#ff6b6b');
            console.table(twin);
        }

        // ── 6-2. 꾸러미가 지나치게 큰 사원 (참고)
        const big = codes.map(function (c) { return { c: c, n: inv[c].length }; })
            .filter(function (x) { return x.n >= 500; })
            .sort(function (x, y) { return y.n - x.n; });
        if (big.length) {
            console.log('%c□ 참고 — 소지품이 500개를 넘는 사원', 'color:#9fd0ff');
            console.table(big.map(function (x) {
                const cc = counts(inv[x.c]);
                const top = Object.keys(cc).sort(function (p, q) { return cc[q] - cc[p]; })[0];
                return { 사원: nameOf(x.c), 개수: x.n, 가장많은품목: top + '×' + cc[top],
                         '품목 종류': Object.keys(cc).length + '가지' };
            }));
            console.log('  (이것만으로는 이상이라 할 수 없습니다. 쌓아 둔 것일 수도 있습니다)');
        }

        // ── 7. 장착 이상
        const gear = [];
        codes.forEach(function (c) {
            const ws = arr(users[c].equippedWeapons);
            const own = users[c].equipOwner || {};
            ws.forEach(function (w) {
                const o = own[w];
                if (o && !users[o]) gear.push({ 사원: nameOf(c), 장비: w, 이상: '임자 사번(' + o + ')이 없습니다' });
            });
            if (ws.length > 12) gear.push({ 사원: nameOf(c), 장비: ws.length + '개', 이상: '장착칸(12)을 넘었습니다' });
        });
        if (gear.length) { flags++; console.log('%c■ 장착칸이 어긋난 사원', 'color:#ffcf8f'); console.table(gear); }

        // ── 마무리
        //
        //   ■ 로 찍힌 것만 「이상」이다. 정상으로 설명되지 않는 것들이다.
        //   □ 는 참고다 — 많이 쌓아 둔 것일 뿐이어서 걸린 가지에 세지 않는다.
        const total = codes.reduce(function (a, c) { return a + inv[c].length; }, 0);
        console.log('  소지품 모두 ' + total.toLocaleString() + '개 · 사원 ' + codes.length + '명');
        if (!flags) console.log('%c  ■ 로 찍힌 이상은 없습니다. (□ 는 참고일 뿐입니다)', 'color:#4CAF50');
        else console.log('%c  ■ ' + flags + '가지가 걸렸습니다. 그 표를 알려 주시면 고칠 길을 찾겠습니다.'
            + ' (□ 는 정상입니다)', 'color:#ff8f6b');
        console.log('  invSnap() 으로 지금 모습을 적어 두고, 또 사라지면 invDiff() 로 견주십시오.');
        return { 사원: codes.length, 걸린가지: flags };
    }).catch(function (e) {
        console.error('[점검] 읽지 못했습니다:', e && e.message);
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
                gear: arr(users[c].equippedWeapons),
                hist: arr(users[c].history)[0] || ''
            };
        });
        try { localStorage.setItem(KEY, JSON.stringify(snap)); }
        catch (e) { console.warn('[점검] 적어 두지 못했습니다(자리가 모자랍니다). 창에만 남깁니다.'); }
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
            if (!now) { rows.push({ 사원: was.n + '(' + was.no + ')', 잃은것: '계정이 없습니다', 늘어난것: '', 돈: '' }); return; }
            const a = was.inv, b = arr(now.inventory);
            const lost = [], got = [];
            const cb = counts(b), ca = counts(a);
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
        console.log('  「늘어난것」에 산 적 없는 물건이 있으면 그 사원이 통째 쓰기로 되돌려진 것입니다.');
        console.log('  그 사원 이름을 알려 주시면 어느 자리에서 왔는지 nodeSetLog() 로 맞춰 보겠습니다.');
    }).catch(function (e) { console.error('[점검]', e && e.message); });
};

console.log('[점검] invAudit() · invSnap() · invDiff()');

})();
