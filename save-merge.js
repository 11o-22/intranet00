// ==========================================
// ★ 통째 쓰기를 「바뀐 것만 쓰기」로 바꾼다
// index.html 에서 맨 뒤에 불러온다
// ==========================================
//
// 왜 자료가 사라졌나
//   saveSelfFull() 은 currentUser 의 모든 항목을 서버에 덮어쓴다.
//   그래서 다른 기기나 다른 사람이 내 preg·inventory 를 고쳐 놔도,
//   내 창이 아무 저장이나 한 번 하면 내 머릿속 옛 값으로 전부 되돌아간다.
//
// 어떻게 고치나
//   서버에서 마지막으로 읽은 모습을 「기준」으로 들고 있다가,
//   저장할 때 기준과 다른 항목만 골라 쓴다.
//
// 소지품은 한 걸음 더 간다
//   inventory 는 배열이라, 항목만 골라 써도 「배열 통째」로 덮인다.
//   두 기기에서 동시에 물건을 얻으면 나중에 쓴 쪽만 남는다.
//   그래서 소지품은 배열을 쓰지 않고, 기준 대비 「늘어난 것·줄어든 것」만
//   트랜잭션으로 서버 배열에 더하고 뺀다. 둘 다 살아남는다.

(function saveMerge() {

const SKIP = ['letters', 'hasNewLetter', 'hasNewReply', 'hasItemUsedOnMe',
              'houseChatUnread', 'house', '_adminStamp', '_stamp'];

const INV = 'inventory';          // 배열 병합으로 다루는 항목
const PTS = 'points';             // 돈 — 「늘어난 만큼·줄어든 만큼」으로 다루는 항목
const EFF = 'timedEffects';       // 걸린 효과 — 이름별로 합친다
const BUF = 'itemBuffs';          // 물건이 얹어 준 버프 — 개수까지 세어 합친다

let code = null;
let base = {};            // 서버에서 마지막으로 본 모습
let ref = null;
let ready = false;

const shadowInv = {};     // 남의 소지품 — 서버에서 마지막으로 본 모습
const shadowPts = {};     // 남의 포인트 — 같은 까닭
const shadowEff = {};     // 남에게 걸린 효과 — 같은 까닭
const shadowBuf = {};     // 남에게 얹힌 버프 — 같은 까닭
let bufBusy = false, bufAgain = false;
let effBusy = false, effAgain = false;

// ★ 이번 판에 한 번이라도 내 손에 있었나
//
//   「내 쪽이 비어 있다」만 보고 서버 것을 지우면 안 된다. 제거약으로 떼어 낸
//   것과, 애초에 받아 본 적이 없는 것을 가를 수 없기 때문이다.
//   한 번이라도 들고 있었던 뒤에 비었을 때만 지운다. 들어 본 적이 없으면
//   서버에 있는 것은 남이 방금 걸어 준 것이므로 건드리지 않는다.
let effHeld = false, bufHeld = false;
const rootStats = {};     // 루트 통째 쓰기를 몇 번 병합으로 돌렸나
let invBusy = false;
let invAgain = false;
let invStats = { merged: 0, added: 0, removed: 0, conflicts: 0 };
let ptsBusy = false, ptsAgain = false;
let ptsStats = { merged: 0, moved: 0, rescued: 0 };

function clone(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return undefined; }
}
function same(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; }
}

// ★ 목록(소지품·효과·버프)은 「빈 배열」과 「열쇠가 없음」을 같은 것으로 본다.
//
//   파이어베이스는 빈 배열을 값으로 두지 않고 열쇠째 지운다. 그래서 걸린 것이
//   다 끝난 사원은 서버에 timedEffects 가 아예 없고, 화면에는 [] 가 남는다.
//   이 둘을 다르다고 세면 아래 지켜보기에서 「내가 손댄 항목」으로 잘못 걸려,
//   남이 걸어 준 효과를 받지 않는다. (리치맛 물약이 안 붙던 까닭이다)
function sameAs(k, a, b) {
    if (k === INV || k === EFF || k === BUF) return same(asArr(a), asArr(b));
    return same(a, b);
}
function badKey(k) { return /[.#$\[\]\/]/.test(k); }
function asArr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}

// ==========================================
// 소지품 — 늘어난 것·줄어든 것만 센다
// ==========================================
//
// 같은 물건을 여러 개 가질 수 있으므로 개수까지 본다.
// msDiff(A, B) = A 에는 있는데 B 에는 없는 것들 (개수 차이만큼)
function msDiff(a, b) {
    const cnt = {};
    asArr(b).forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
    const out = [];
    asArr(a).forEach(function (x) {
        if (cnt[x] > 0) { cnt[x]--; return; }
        out.push(x);
    });
    return out;
}

// 서버 배열에 add 를 붙이고 del 을 뺀다 — 그 사이 남이 넣은 것은 그대로 둔다
function mergeInv(path, baseArr, localArr) {
    if (!database) return Promise.resolve(null);
    const add = msDiff(localArr, baseArr);
    const del = msDiff(baseArr, localArr);
    if (!add.length && !del.length) return Promise.resolve(null);

    return database.ref(path).transaction(function (srv) {
        const cur = asArr(srv);
        del.forEach(function (n) {
            const i = cur.indexOf(n);
            if (i >= 0) cur.splice(i, 1);
        });
        return cur.concat(add);
    }, null, false).then(function (res) {        // ★ applyLocally = false
        if (!res || !res.committed) return null;
        const after = asArr(res.snapshot ? res.snapshot.val() : null);
        invStats.merged++;
        invStats.added += add.length;
        invStats.removed += del.length;
        // 내가 생각한 결과와 서버 결과가 다르면, 그 사이 남이 건드렸다는 뜻
        if (after.length !== asArr(localArr).length) invStats.conflicts++;
        return after;
    }).catch(function (e) {
        console.error('[병합] 소지품 저장 실패:', e);
        return null;
    });
}

// ==========================================
// 돈 — 늘어난 만큼·줄어든 만큼만 보낸다
// ==========================================
//
// 포인트를 「지금 내 화면의 값」으로 덮어쓰면, 그 사이에 남이 넣어 준 돈이
// 통째로 날아간다. 밀실 거래·경매장·결투·공용 통장이 다 남의 자리에 돈을
// 넣는 길이라, 어느 쪽이든 받는 쪽 화면이 열려 있으면 들어온 돈이 사라졌다.
//
// 그래서 소지품과 똑같이, 값이 아니라 「움직인 몫」을 트랜잭션으로 보낸다.
//     서버에 있는 값 + (내가 움직인 몫)
// 이러면 그 사이에 누가 얼마를 넣었든 둘 다 살아남는다.
function ptsCap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : Infinity; }
function mergePts(path, had, want) {
    if (!database) return Promise.resolve(null);
    const d = (Number(want) || 0) - (Number(had) || 0);
    if (!d) return Promise.resolve(null);
    return database.ref(path).transaction(function (srv) {
        return Math.max(0, Math.min(ptsCap(), Math.round((Number(srv) || 0) + d)));
    }, null, false).then(function (res) {           // ★ applyLocally = false
        if (!res || !res.committed) return null;
        const after = Number(res.snapshot ? res.snapshot.val() : 0) || 0;
        ptsStats.merged++;
        ptsStats.moved += d;
        // 내가 생각한 값과 서버 값이 다르면, 그 사이 남이 돈을 넣었다는 뜻
        if (after !== (Number(want) || 0)) ptsStats.rescued++;
        return after;
    }).catch(function (e) {
        console.error('[병합] 포인트 저장 실패:', e);
        return null;
    });
}

function flushMyPts() {
    if (!ready || !currentUser) return Promise.resolve(null);
    if (ptsBusy) { ptsAgain = true; return Promise.resolve(null); }
    const want = Number(currentUser[PTS]) || 0;
    const had = Number(base[PTS]) || 0;
    if (want === had) return Promise.resolve(null);

    ptsBusy = true;
    return mergePts('users/' + code + '/' + PTS, had, want).then(function (after) {
        ptsBusy = false;
        // 날아가는 사이에 또 벌었거나 썼으면 그 몫을 지킨다
        const extra = (Number(currentUser[PTS]) || 0) - want;
        if (after === null) {
            base[PTS] = want;
        } else {
            currentUser[PTS] = Math.max(0, Math.min(ptsCap(), after + extra));
            base[PTS] = after;
        }
        const more = extra || ptsAgain;
        ptsAgain = false;
        if (more) return flushMyPts();
        return after;
    }).catch(function (e) {
        ptsBusy = false; ptsAgain = false;
        console.error('[병합] 포인트:', e);
        return null;
    });
}

// ==========================================
// 걸린 효과 — 이름별로 합친다
// ==========================================
//
// 물약 효과(timedEffects)도 배열을 통째로 덮어쓰고 있었다. 물약은 대개
// 남에게 쓰는 것이어서, 쓰는 쪽이 「상대를 once 로 읽고 → 효과를 붙이고 →
// 배열을 통째로 덮어쓰기」를 한다. (index.html:6100~6126)
//
// 읽고 쓰는 사이에 상대가 받은 다른 효과, 또는 상대 화면이 저장한 것은
// 그만큼 지워진다. 두 사람이 연달아 물약을 쓰면 하나가 사라지고, 상대가
// 그 사이에 뭘 저장하면 방금 걸린 물약이 사라진다.
// 「적용된 물약이 멋대로 사라진다」가 이것이다.
//
// 그래서 값을 덮어쓰지 않고 이름별로 합친다.
//   · 내가 더한 효과는 넣는다
//   · 같은 이름이 양쪽에 있으면 남은 시간이 긴 쪽을 쓴다 (고정이 가장 세다)
//   · 내가 지운 효과는 뺀다. 다만 그 사이 누가 다시 걸었으면 두고 본다
//
// ★ 「지운 것」을 재는 기준은 **쓰는 쪽이 읽은 그 모습**이어야 한다.
//
//   남에게 물약을 쓰는 길은 모두 「users/사번 을 once 로 읽고 → 고치고 → 쓰기」다.
//   그런데 기준으로 shadow(서버에서 가장 최근에 본 모습)를 쓰고 있었다.
//   shadow 는 자식 사건으로 계속 갱신되므로, 읽고 쓰는 그 사이에 상대가
//   새로 받은 효과까지 들어가 있다. 그러면 쓰는 쪽의 묵은 목록에는 없으니
//   「상대가 지운 것」으로 보여 **방금 걸린 물약이 날아간다.**
//
//   그래서 읽은 모습을 적어 두고 그것을 기준으로 쓴다. 쓰는 쪽이 자기가 읽은
//   것에서 뺀 것만 지워지고, 그 사이에 들어온 것은 건드리지 않는다.
const lastRead = {};              // 사번 → { eff:[], at:읽은 시각 }
const READ_LIFE = 120000;         // 이보다 묵은 읽기는 안 믿는다

function noteRead(c, v) {
    if (!c) return;
    lastRead[c] = { eff: asArr(v && v[EFF]), at: Date.now() };
}
function readEff(c) {
    const r = lastRead[c];
    if (r && (Date.now() - r.at) <= READ_LIFE) return r.eff;
    return undefined;             // 읽은 기록이 없으면 shadow 로 돌아간다
}
function effBase(c) {
    const r = readEff(c);
    return (r !== undefined) ? r : shadowEff[c];
}

function effTime(e) { return (e && e.fixed) ? Infinity : ((e && e.expireAt) || 0); }
function pickEff(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.fixed || b.fixed) {
        const w = a.fixed ? a : b;
        return { name: w.name, desc: b.desc || a.desc, fixed: true };
    }
    return (effTime(b) > effTime(a)) ? b : a;
}
function effMap(list) {
    const m = {};
    asArr(list).forEach(function (e) {
        if (!e || !e.name) return;
        m[e.name] = pickEff(m[e.name], e);
    });
    return m;
}
function effChanged(had, want) {
    const a = Object.keys(had), b = Object.keys(want);
    if (a.some(function (n) { return !(n in want); })) return true;
    return b.some(function (n) {
        return !(n in had) || effTime(want[n]) !== effTime(had[n])
            || !!want[n].fixed !== !!had[n].fixed;
    });
}

function mergeEff(path, baseList, localList, noWipe) {
    if (!database) return Promise.resolve(null);
    const had = effMap(baseList), want = effMap(localList);
    if (!effChanged(had, want)) return Promise.resolve(null);

    // ★ 들어 본 적이 없으면 비웠다고 보지 않는다 — 보낼 것이 없으니 그냥 물러난다.
    //   (받아 본 적이 없는데 서버에 있다면 남이 방금 걸어 준 것이다)
    if (noWipe && Object.keys(want).length === 0) return Promise.resolve(null);

    // ★ 내 쪽이 통째로 비어 있다고 서버 것을 다 지우지는 않는다.
    //   잠깐 비어 있는 목록(막 들어온 자리, 덮어쓴 자리)이 올라가면
    //   걸려 있던 것이 한꺼번에 날아간다. 하나씩 빠지는 것은 그대로 둔다.
    const wipe = Object.keys(want).length === 0 && Object.keys(had).length > 1;
    const gone = wipe ? [] : Object.keys(had).filter(function (n) { return !(n in want); });

    return database.ref(path).transaction(function (srv) {
        const cur = effMap(srv);
        gone.forEach(function (n) {
            const s = cur[n];
            if (!s) return;
            if (effTime(s) > effTime(had[n])) return;   // 그 사이 누가 다시 걸었다
            delete cur[n];
        });
        Object.keys(want).forEach(function (n) { cur[n] = pickEff(cur[n], want[n]); });
        return Object.keys(cur).map(function (n) { return cur[n]; });
    }, null, false).then(function (res) {               // ★ applyLocally = false
        if (!res || !res.committed) return null;
        return asArr(res.snapshot ? res.snapshot.val() : null);
    }).catch(function (e) {
        console.error('[병합] 효과 저장 실패:', e);
        return null;
    });
}

function flushMyEff() {
    if (!ready || !currentUser) return Promise.resolve(null);
    if (asArr(currentUser[EFF]).length) effHeld = true;      // 한 번이라도 들고 있었다
    if (effBusy) { effAgain = true; return Promise.resolve(null); }
    if (!effChanged(effMap(base[EFF]), effMap(currentUser[EFF]))) return Promise.resolve(null);

    effBusy = true;
    const want = clone(currentUser[EFF]) || [];
    const had = clone(base[EFF]) || [];

    return mergeEff('users/' + code + '/' + EFF, had, want, !effHeld).then(function (after) {
        effBusy = false;
        if (after === null) { base[EFF] = want; }
        else {
            // 날아가는 사이에 또 걸린 것을 지킨다
            const extra = effMap(currentUser[EFF]);
            const sent = effMap(want);
            const out = effMap(after);
            Object.keys(extra).forEach(function (n) {
                if (!(n in sent) || effTime(extra[n]) > effTime(sent[n])) {
                    out[n] = pickEff(out[n], extra[n]);
                }
            });
            fillArr(currentUser[EFF] || (currentUser[EFF] = []),
                    Object.keys(out).map(function (n) { return out[n]; }));
            base[EFF] = clone(after);
        }
        const more = effAgain;
        effAgain = false;
        if (more) return flushMyEff();
        return after;
    }).catch(function (e) {
        effBusy = false; effAgain = false;
        console.error('[병합] 효과:', e);
        return null;
    });
}

// ==========================================
// 물건이 얹어 준 버프 — 봉제 인형 같은 것
// ==========================================
//
// itemBuffs 도 배열인데 통째로 덮어쓰고 있었다. 봉제 인형 키트로 지은 사흘짜리
// 효과가 사라지던 까닭이다. newitems2.js:340 이 정산 때 배열을 다시 짓고,
// buff24.js 가 10분마다 또 다시 짓는다. 그 사이에 얹힌 것은 지워진다.
//
// 알맹이가 객체라 이름으로 가를 수 없고, 같은 버프를 둘 가질 수도 있다.
// 그래서 글자로 바꿔 「개수까지」 세어 더하고 뺀다 (소지품과 같은 방식).
function bufKeys(v) {
    return asArr(v).filter(Boolean).map(function (x) {
        try { return JSON.stringify(x); } catch (e) { return ''; }
    }).filter(Boolean);
}
function bufBack(keys) {
    return keys.map(function (s) { try { return JSON.parse(s); } catch (e) { return null; } })
        .filter(Boolean);
}
function mergeBuf(path, baseList, localList, noWipe) {
    if (!database) return Promise.resolve(null);
    const had = bufKeys(baseList), want = bufKeys(localList);
    const add = msDiff(want, had), del = msDiff(had, want);
    if (!add.length && !del.length) return Promise.resolve(null);
    // 들어 본 적이 없으면 비웠다고 보지 않는다 (효과와 같은 까닭)
    if (noWipe && !want.length) return Promise.resolve(null);

    return database.ref(path).transaction(function (srv) {
        const cur = bufKeys(srv);
        del.forEach(function (k) { const i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); });
        return bufBack(cur.concat(add));
    }, null, false).then(function (res) {           // ★ applyLocally = false
        if (!res || !res.committed) return null;
        return asArr(res.snapshot ? res.snapshot.val() : null);
    }).catch(function (e) {
        console.error('[병합] 버프 저장 실패:', e);
        return null;
    });
}

function flushMyBuf() {
    if (!ready || !currentUser) return Promise.resolve(null);
    if (asArr(currentUser[BUF]).length) bufHeld = true;      // 한 번이라도 얹혀 있었다
    if (bufBusy) { bufAgain = true; return Promise.resolve(null); }
    if (same(bufKeys(currentUser[BUF]), bufKeys(base[BUF]))) return Promise.resolve(null);

    bufBusy = true;
    const want = clone(currentUser[BUF]) || [];
    const had = clone(base[BUF]) || [];

    return mergeBuf('users/' + code + '/' + BUF, had, want, !bufHeld).then(function (after) {
        bufBusy = false;
        if (after === null) { base[BUF] = want; }
        else {
            // 날아가는 사이에 또 얹힌 것을 지킨다
            const nowK = bufKeys(currentUser[BUF]);
            const extra = msDiff(nowK, bufKeys(want));
            const gone = msDiff(bufKeys(want), nowK);
            const next = bufKeys(after);
            gone.forEach(function (k) { const i = next.indexOf(k); if (i >= 0) next.splice(i, 1); });
            fillArr(currentUser[BUF] || (currentUser[BUF] = []), bufBack(next.concat(extra)));
            base[BUF] = clone(after);
        }
        const more = bufAgain; bufAgain = false;
        if (more) return flushMyBuf();
        return after;
    }).catch(function (e) {
        bufBusy = false; bufAgain = false;
        console.error('[병합] 버프:', e);
        return null;
    });
}

// 배열을 그대로 두고 내용만 갈아끼운다 (다른 곳이 들고 있는 참조를 지키려고)
function fillArr(target, src) {
    if (!Array.isArray(target)) return src;
    target.length = 0;
    asArr(src).forEach(function (x) { target.push(x); });
    return target;
}

// 내 소지품을 서버와 맞춘다
// 내 소지품을 서버와 맞춘다
function flushMyInv() {
    if (!ready || !currentUser) return Promise.resolve(null);
    if (invBusy) { invAgain = true; return Promise.resolve(null); }   // 버리지 말고 적어 둔다
    if (same(currentUser[INV], base[INV])) return Promise.resolve(null);

    invBusy = true;
    const want = clone(currentUser[INV]) || [];
    const had = clone(base[INV]) || [];

    return mergeInv('users/' + code + '/' + INV, had, want).then(function (after) {
        invBusy = false;

        // 날아가는 사이에 손댄 것을 지킨다 — 이게 없으면 그 사이 산 물건이 사라진다
        const nowArr = asArr(currentUser[INV]);
        const add = msDiff(nowArr, want);      // 사이에 들어온 것
        const del = msDiff(want, nowArr);      // 사이에 빠진 것

        if (after === null) {
            base[INV] = want;
        } else {
            const next = asArr(after).slice();
            del.forEach(function (n) { const i = next.indexOf(n); if (i >= 0) next.splice(i, 1); });
            fillArr(currentUser[INV], next.concat(add));
            base[INV] = clone(after);
        }

        const more = add.length || del.length || invAgain;
        invAgain = false;
        if (more) return flushMyInv();         // 남은 몫을 한 번 더 보낸다
        return after;
    }).catch(function (e) {
        invBusy = false;
        invAgain = false;
        console.error('[병합] 소지품:', e);
        return null;
    });
}

// ==========================================
// 들어올 때 — 서버에 있는 것을 내 쪽에 합친다
// ==========================================
//
// 기준(base)은 서버 모습 그대로 둔다. 내 쪽이 그보다 많아지므로
// 다음 저장에서 「지운 것」은 없고 「더한 것」만 올라간다.
function soakEff(srv) {
    if (!currentUser || !asArr(srv[EFF]).length) return;
    const out = effMap(currentUser[EFF]);
    const add = effMap(srv[EFF]);
    Object.keys(add).forEach(function (n) { out[n] = pickEff(out[n], add[n]); });
    fillArr(currentUser[EFF] || (currentUser[EFF] = []),
            Object.keys(out).map(function (n) { return out[n]; }));
    if (asArr(currentUser[EFF]).length) effHeld = true;
}

function soakBuf(srv) {
    if (!currentUser || !asArr(srv[BUF]).length) return;
    const mineK = bufKeys(currentUser[BUF]);
    const miss = msDiff(bufKeys(srv[BUF]), mineK);         // 서버에만 있는 몫
    if (!miss.length) { if (mineK.length) bufHeld = true; return; }
    fillArr(currentUser[BUF] || (currentUser[BUF] = []), bufBack(mineK.concat(miss)));
    bufHeld = true;
}

// ==========================================
// 기준을 세우고 지켜본다
// ==========================================
function attach() {
    if (!database || !currentUser || !currentUser.code) return;
    if (code === currentUser.code) return;
    code = currentUser.code;
    ready = false;

    if (ref) { try { ref.off(); } catch (e) { } }
    ref = database.ref('users/' + code);
    effHeld = false;
    bufHeld = false;

    ref.on('value', function (s) {
        const srv = s.val();
        if (!srv) return;
        if (!currentUser || currentUser.code !== code) return;   // 계정이 어긋났다

        if (!ready) {
            base = clone(srv) || {};
            // 들어올 때 이미 들고 있었다면, 떼어 내는 것도 할 수 있어야 한다
            effHeld = asArr(currentUser[EFF]).length > 0;
            bufHeld = asArr(currentUser[BUF]).length > 0;
            // ★ 서버에 걸려 있는 것을 내 쪽에 **합쳐 둔다.**
            //
            //   로그인이 내 모습을 읽은 뒤, 기준이 서기까지 한 호흡이 있다.
            //   그 사이에 남이 걸어 준 효과는 서버에만 있고 내 화면에는 없다.
            //   예전에는 내 쪽이 비어 있을 때만 받아 왔는데, 이미 하나 걸려
            //   있으면 그냥 지나쳐서 — 기준은 둘, 내 화면은 하나가 되고 —
            //   다음 저장이 그 하나를 「내가 지운 것」으로 보고 **서버에서
            //   지워 버렸다.** 붙었다가 사라지던 까닭이 이것이다.
            //
            //   그래서 비어 있든 아니든 이름별로 합친다. 들어오는 사이에
            //   내가 마신 것도 남고, 남이 걸어 준 것도 남는다.
            soakEff(srv);
            soakBuf(srv);
            ready = true;
            console.log('[병합] 기준을 세웠습니다.');
            return;
        }

        // 서버가 바뀌었다 — 내가 손대지 않은 항목만 받아 온다
        let took = 0;
        const kept = {};                                    // 내가 손댄 항목은 기준도 바꾸지 않는다
        Object.keys(srv).forEach(function (k) {
            if (k === '_adminStamp' || k === '_stamp') return;
            if (sameAs(k, srv[k], base[k])) return;         // 서버도 그대로면 볼 것 없다
            const mineTouched = !sameAs(k, currentUser[k], base[k]);
            if (mineTouched) {
                // ★ 서버 값이 내 값과 같다면 내가 쓴 글이 돌아온 것이다.
                //   이때 기준을 되돌리면 기준이 옛 값에 영원히 멈춘다. 그러면
                //   다음 저장마다 옛 값을 다시 밀어 넣어, 그 사이에 남이 넣어 준
                //   것을 지운다. (들어온 돈이 사라지던 까닭이 이것이었다)
                if (sameAs(k, srv[k], currentUser[k])) return;   // 기준은 아래에서 서버로 간다
                kept[k] = clone(base[k]);                   // 아직 안 닿았다 — 내 값을 지킨다
                return;
            }
            if (k === INV || k === EFF || k === BUF) {
                fillArr(currentUser[k] || (currentUser[k] = []), srv[k]);
                base[k] = clone(srv[k]); took++;
                // 받아 쥔 것은 나중에 떼어 낼 수도 있어야 한다
                if (asArr(srv[k]).length) { if (k === EFF) effHeld = true; if (k === BUF) bufHeld = true; }
                return;
            }
            currentUser[k] = clone(srv[k]);
            took++;
        });

        // 서버에서 사라진 항목도 따라 지운다 (내가 손대지 않았을 때만)
        //
        //   ★ 걸린 효과와 버프는 지우지 않는다.
        //     누가 내 자리를 통째로 쓰거나(그 바람에 키가 빠지거나), 잠깐
        //     비어 있는 목록이 올라가면 서버에서 timedEffects 키가 없어진다.
        //     그때 여기서 지워 버리면 **걸려 있던 물약이 한꺼번에 증발한다.**
        //     소지품을 지키는 것과 같은 까닭이다. 시간이 다한 것은
        //     checkPassivePollution 이 알아서 떼어 낸다.
        Object.keys(base).forEach(function (k) {
            if (k in srv) return;
            if (k === INV || k === EFF || k === BUF) return;   // 소지품·효과·버프는 지키다
            if (!same(currentUser[k], base[k])) return;
            delete currentUser[k];
            took++;
        });

        base = clone(srv) || {};
        Object.keys(kept).forEach(function (k) { base[k] = kept[k]; });

        if (took) {
            if (db && db.users && db.users[code]) db.users[code] = currentUser;
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            console.log('[병합] 서버에서 ' + took + '개 항목을 받아 왔습니다.');
        }
    });
}

// 남의 소지품도 서버에서 본 모습을 적어 둔다 (물건을 줄 때 기준이 된다)
(function watchOthers() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (window._invShadow) { clearInterval(iv); return; }
        window._invShadow = true;
        clearInterval(iv);

        const note = function (s) {
            const v = s.val();
            if (!v) { delete shadowInv[s.key]; delete shadowPts[s.key]; delete shadowEff[s.key]; delete shadowBuf[s.key]; return; }
            shadowInv[s.key] = asArr(v[INV]);
            shadowPts[s.key] = Number(v[PTS]) || 0;
            shadowEff[s.key] = asArr(v[EFF]);
            shadowBuf[s.key] = asArr(v[BUF]);
        };
        database.ref('users').on('child_added', note);
        database.ref('users').on('child_changed', note);
        database.ref('users').on('child_removed', function (s) {
            delete shadowInv[s.key]; delete shadowPts[s.key]; delete shadowEff[s.key]; delete shadowBuf[s.key];
        });
        console.log('[병합] 남의 소지품·포인트·효과·버프 기준 지켜보기 시작');
    }, 700);
})();

// ==========================================
// 바뀐 것만 쓴다
// ==========================================
function diffPayload() {
    const out = {};
    Object.keys(currentUser).forEach(function (k) {
        if (SKIP.indexOf(k) >= 0) return;
        if (k === PTS) return;                              // 돈은 더하고 빼기로 따로 보낸다
        if (k === EFF) return;                              // 효과도 이름별로 합쳐 보낸다
        if (k === BUF) return;                              // 버프도 개수까지 세어 보낸다
        if (k === INV) return;                              // 소지품은 따로 병합한다
        if (badKey(k)) return;
        if (currentUser[k] === undefined) return;
        if (same(currentUser[k], base[k])) return;          // 안 바뀐 것은 건너뛴다
        const v = clone(currentUser[k]);
        if (v === undefined) return;
        out[k] = v;
    });
    return out;
}

function markSaved(payload) {
    Object.keys(payload).forEach(function (k) { base[k] = clone(payload[k]); });
}

(function hookSave() {
    const iv = setInterval(function () {
        if (typeof saveSelfFull !== 'function') return;
        if (saveSelfFull._merge) { clearInterval(iv); return; }

        const _full = saveSelfFull;
        saveSelfFull = function () {
            if (!database || !currentUser) return Promise.resolve();
            if (currentUser.code !== code) return _full.apply(this, arguments);   // 계정이 어긋났다
            if (!ready) return _full.apply(this, arguments);   // 기준이 없으면 예전 방식

            const invJob = flushMyInv();                      // 소지품은 병합으로
            const ptsJob = flushMyPts();                      // 돈도 병합으로
            const effJob = flushMyEff();                      // 걸린 효과도 병합으로
            const bufJob = flushMyBuf();                      // 얹힌 버프도 병합으로

            const payload = diffPayload();
            const n = Object.keys(payload).length;
            if (!n) return Promise.all([invJob, ptsJob, effJob, bufJob]);

            payload._adminStamp = Date.now();
            currentUser._adminStamp = payload._adminStamp;

            return Promise.all([
                invJob, ptsJob, effJob, bufJob,
                database.ref('users/' + code).update(payload)
                    .then(function () { markSaved(payload); })
                    .catch(function (e) { console.error('[병합] 저장 실패:', e); })
            ]);
        };
        saveSelfFull._merge = true;

        // saveFields — 소지품만 빼내 병합으로 돌리고, 나머지는 원래대로
        if (typeof saveFields === 'function' && !saveFields._merge) {
            const _f = saveFields;
            saveFields = function (fields) {
                fields = fields || {};
                const wantsInv = !!fields[INV];
                const wantsPts = !!fields[PTS];
                const wantsEff = !!fields[EFF];
                const wantsBuf = !!fields[BUF];
                const mine = (ready && currentUser && currentUser.code === code);
                const rest = {};
                Object.keys(fields).forEach(function (k) {
                    if (k === INV) return;
                    if (k === PTS && mine) return;              // 돈은 더하고 빼기로 보낸다
                    if (k === EFF && mine) return;              // 효과는 이름별로 합쳐 보낸다
                    if (k === BUF && mine) return;              // 버프는 개수까지 세어 보낸다
                    rest[k] = fields[k];
                });

                let r;
                if (Object.keys(rest).length) r = _f.call(this, rest);
                // 기준은 미리 찍지 않는다 — 서버가 받기 전에 찍으면
                // 날아오던 옛 값이 「내가 안 바꾼 것」으로 보여 늘어난 몫을 지운다

                if (wantsInv && mine) flushMyInv();
                else if (wantsInv) r = _f.call(this, fields);   // 기준이 없으면 예전 방식
                if (wantsPts && mine) flushMyPts();
                if (wantsEff && mine) flushMyEff();
                if (wantsBuf && mine) flushMyBuf();

                return r;
            };
            saveFields._merge = true;
        }

        // changePoints — 제 트랜잭션을 따로 돌린다. 그대로 두면 두 번 더해진다.
        //   원래 코드(index.html:9231)는 currentUser.points 를 올리고
        //   서버에도 바로 +delta 를 넣는다. 그런데 우리 쪽도 「기준과의 차이」를
        //   보내므로, 돌아오는 메아리보다 저장이 먼저 가면 같은 delta 가 두 번
        //   들어간다. 그래서 서버 쓰기는 우리 길 하나로 모은다.
        if (typeof changePoints === 'function' && !changePoints._merge) {
            const _c = changePoints;
            const wrapped = function (delta) {
                if (!ready || !currentUser || currentUser.code !== code) {
                    return _c.apply(this, arguments);
                }
                const cap = (typeof POINT_CAP !== 'undefined') ? POINT_CAP : Infinity;
                currentUser[PTS] = Math.max(0, Math.min(cap,
                    (Number(currentUser[PTS]) || 0) + (Number(delta) || 0)));
                flushMyPts();
                if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
            };
            wrapped._merge = true;
            changePoints = wrapped;
        }

        // saveDB 도 통째로 쓴다 — 같은 방식으로 좁힌다
        if (typeof saveDB === 'function' && !saveDB._merge) {
            const _d = saveDB;
            saveDB = function () {
                if (!ready) return _d.apply(this, arguments);
                return saveSelfFull();
            };
            saveDB._merge = true;
        }

        clearInterval(iv);
        console.log('[병합] 바뀐 것만 쓰도록 바꿨습니다. (소지품은 더하고 빼기로)');
    }, 500);
})();

// ==========================================
// 남을 고쳤을 때 — 소지품은 역시 더하고 빼기로
// ==========================================
(function hookOther() {
    const iv = setInterval(function () {
        if (typeof updateUserFields !== 'function') return;
        if (updateUserFields._merge) { clearInterval(iv); return; }
        const _u = updateUserFields;

        updateUserFields = function (c, fields) {
            fields = fields || {};

            // 내 자리면 기존 흐름대로 (기준도 맞춰 둔다)
            if (!c || (currentUser && c === currentUser.code)) {
                const r = _u.apply(this, arguments);
                // 기준은 미리 찍지 않는다 (saveFields 와 같은 까닭)
                return r;
            }

            // 남의 소지품·돈 — 서버에서 본 모습을 기준으로 더하고 뺀다
            const hasInv = Object.prototype.hasOwnProperty.call(fields, INV);
            const hasPts = Object.prototype.hasOwnProperty.call(fields, PTS);
            const hasEff = Object.prototype.hasOwnProperty.call(fields, EFF);
            const hasBuf = Object.prototype.hasOwnProperty.call(fields, BUF);
            const hadInv = shadowInv[c];
            const hadPts = shadowPts[c];
            const hadEff = effBase(c);          // 쓰는 쪽이 읽은 모습 (없으면 shadow)
            const hadBuf = shadowBuf[c];
            const doInv = hasInv && hadInv;
            const doPts = hasPts && (hadPts !== undefined);
            const doEff = hasEff && hadEff;
            const doBuf = hasBuf && hadBuf;
            if (!doInv && !doPts && !doEff && !doBuf) return _u.apply(this, arguments);

            const rest = {};
            Object.keys(fields).forEach(function (k) {
                if (doInv && k === INV) return;
                if (doPts && k === PTS) return;
                if (doEff && k === EFF) return;
                if (doBuf && k === BUF) return;
                rest[k] = fields[k];
            });
            rest._adminStamp = Date.now();

            const jobs = [_u.call(this, c, rest)];
            if (doInv) {
                const want = asArr(fields[INV]);
                jobs.push(mergeInv('users/' + c + '/' + INV, hadInv, want).then(function (after) {
                    if (after === null) return null;
                    shadowInv[c] = after.slice();
                    if (db && db.users && db.users[c]) fillArr(db.users[c][INV] || (db.users[c][INV] = []), after);
                    return after;
                }));
            }
            if (doPts) {
                const wantP = Number(fields[PTS]) || 0;
                jobs.push(mergePts('users/' + c + '/' + PTS, hadPts, wantP).then(function (after) {
                    if (after === null) return null;
                    shadowPts[c] = after;
                    if (db && db.users && db.users[c]) db.users[c][PTS] = after;
                    return after;
                }));
            }
            if (doBuf) {
                jobs.push(mergeBuf('users/' + c + '/' + BUF, hadBuf, asArr(fields[BUF])).then(function (after) {
                    if (after === null) return null;
                    shadowBuf[c] = after.slice();
                    if (db && db.users && db.users[c]) fillArr(db.users[c][BUF] || (db.users[c][BUF] = []), after);
                    return after;
                }));
            }
            if (doEff) {
                jobs.push(mergeEff('users/' + c + '/' + EFF, hadEff, asArr(fields[EFF])).then(function (after) {
                    if (after === null) return null;
                    shadowEff[c] = after.slice();
                    if (db && db.users && db.users[c]) fillArr(db.users[c][EFF] || (db.users[c][EFF] = []), after);
                    return after;
                }));
            }
            return Promise.all(jobs);
        };
        updateUserFields._merge = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 루트 통째 쓰기도 더하고 빼기로
// ==========================================
//
// database.ref('/').update({ 'users/누구/points': 값, ... }) 꼴로 남의 자리를
// 통째로 덮어쓰는 곳이 일곱 군데 있다. 결투·물약 사용·출산 환급·사택 재배정·
// 칼 분실·당국 개입이다. 모두 「once 로 읽고 → 계산하고 → 덮어쓰기」라서
// 읽고 쓰는 사이에 움직인 몫이 지워진다.
//
//     index.html:6126  users/{상대}/timedEffects   ← 물약이 사라지던 자리
//     index.html:6130  users/{상대}/inventory
//     index.html:9491  users/{상대}/points
//     dark.js:12997    결투 — 양쪽 points
//     dark.js:13005    결투 — 양쪽 inventory
//     preg-v2.js:413   출산 환급 — inventory · points
//     roommate.js:499  재배정 — 보관함 돌려주기
//     knife-lost.js:394
//
// 부르는 쪽을 하나하나 고치는 대신 길목을 지킨다. 저 세 항목만 골라
// 트랜잭션으로 돌리고, 나머지 열쇠는 원래대로 한 번에 쓴다.
//
// 값을 보내던 코드를 그대로 두고 받는 쪽에서 「움직인 몫」으로 바꾸므로,
// 부르는 쪽은 아무것도 몰라도 된다.
//
// 다만 원래는 한 번에 쓰여 전부 되거나 전부 안 되던 것이, 이제 항목마다
// 따로 간다. 트랜잭션은 다시 시도하므로 실패는 드물지만, 아주 드물게
// 한쪽만 되는 일이 있을 수 있다. 돈이 사라지는 것보다는 낫다고 보았다.
const MERGED = /^users\/([^/]+)\/(points|inventory|timedEffects|itemBuffs)$/;
(function hookRoot() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (database._rootMerge) { clearInterval(iv); return; }
        if (typeof database.ref !== 'function') return;

        const _ref = database.ref.bind(database);
        database.ref = function () {
            const r = _ref.apply(null, arguments);
            const p = String(arguments[0] == null ? '' : arguments[0]).replace(/^\/+|\/+$/g, '');

            // ★ users/사번 을 읽으면 그 모습을 적어 둔다 (위 lastRead)
            const who = /^users\/([^/]+)$/.exec(p);
            if (who && r && typeof r.once === 'function' && !r._readNote) {
                const _once = r.once.bind(r);
                r.once = function () {
                    const out = _once.apply(null, arguments);
                    if (out && typeof out.then === 'function') {
                        return out.then(function (s) {
                            try { noteRead(who[1], (s && s.val) ? s.val() : null); } catch (e) { }
                            return s;
                        });
                    }
                    return out;
                };
                r._readNote = true;
            }

            if (p !== '' || !r || typeof r.update !== 'function' || r._rootMerge) return r;

            const _up = r.update.bind(r);
            r.update = function (obj) {
                if (!obj || typeof obj !== 'object') return _up(obj);
                const rest = {};
                const jobs = [];
                Object.keys(obj).forEach(function (k) {
                    const m = MERGED.exec(String(k).replace(/^\/+/, ''));
                    if (!m) { rest[k] = obj[k]; return; }
                    const c = m[1], f = m[2], path = 'users/' + c + '/' + f;
                    let job = null;
                    if (f === PTS && shadowPts[c] !== undefined) {
                        job = mergePts(path, shadowPts[c], obj[k]);
                    } else if (f === INV && shadowInv[c]) {
                        job = mergeInv(path, shadowInv[c], obj[k]);
                    } else if (f === EFF && effBase(c)) {
                        job = mergeEff(path, effBase(c), obj[k]);
                    } else if (f === BUF && shadowBuf[c]) {
                        job = mergeBuf(path, shadowBuf[c], obj[k]);
                    }
                    if (!job) { rest[k] = obj[k]; return; }     // 기준이 없으면 예전 방식
                    rootStats[f] = (rootStats[f] || 0) + 1;
                    jobs.push(job);
                });
                if (Object.keys(rest).length) jobs.push(_up(rest));
                return Promise.all(jobs);
            };
            r._rootMerge = true;
            return r;
        };
        database._rootMerge = true;
        clearInterval(iv);
        console.log('[병합] 루트 통째 쓰기도 더하고 빼기로 — 돈·소지품·효과');
    }, 500);
})();

// ==========================================
// addTimedEffect — 늘어난 쪽도 저장한다
// ==========================================
//
// index.html:5183
//     const exist = user.timedEffects.find(e => e.name === name && !e.fixed);
//     if (exist) {
//         exist.expireAt = base + add;      ← 늘려 놓고
//         exist.desc = desc;                ← 저장은 하지 않는다
//     } else {
//         user.timedEffects.push(...);
//         if (user.code === currentUser.code) saveFields({ timedEffects:1 });
//     }
//
// 같은 물약을 또 쓰면 시간이 늘어나기만 하고 서버에는 가지 않는다. 그래서
// 새로 고치면 늘린 몫이 없다. 그것도 「물약이 멋대로 사라진다」로 보인다.
(function hookAdd() {
    const iv = setInterval(function () {
        if (typeof addTimedEffect !== 'function') return;
        if (addTimedEffect._merge) { clearInterval(iv); return; }
        const _a = addTimedEffect;
        const wrapped = function (user) {
            const r = _a.apply(this, arguments);
            try {
                if (user && currentUser && user.code === currentUser.code) {
                    if (ready) flushMyEff();
                    else if (typeof saveFields === 'function') saveFields({ timedEffects: 1 });
                }
            } catch (e) { }
            return r;
        };
        wrapped._merge = true;
        addTimedEffect = wrapped;
        clearInterval(iv);
        console.log('[병합] addTimedEffect — 늘어난 쪽도 저장하도록 바꿨습니다');
    }, 500);
})();

setInterval(attach, 1000);

// 소지품·돈은 조금 뒤처져도 되지만, 오래 묵히지는 않는다
setInterval(function () {
    if (!ready || !currentUser) return;
    if (!invBusy && !same(currentUser[INV], base[INV])) flushMyInv();
    if (!ptsBusy && (Number(currentUser[PTS]) || 0) !== (Number(base[PTS]) || 0)) flushMyPts();
    if (!effBusy) flushMyEff();
    if (!bufBusy) flushMyBuf();
}, 4000);

// ==========================================
// 확인
// ==========================================
window.mergeState = function () {
    console.log('%c===== 저장 병합 =====', 'color:#d4af37; font-size:13px');
    console.log('  계정:', code || '(없음)', '· 기준 준비:', ready ? 'O' : '-');
    if (!ready) return;
    const d = diffPayload();
    const keys = Object.keys(d);
    console.log('  지금 저장하면 쓸 항목 ' + keys.length + '개:', keys.join(', ') || '(없음)');
    console.log('  기준 항목 수:', Object.keys(base).length);
    console.log('  saveSelfFull 교체:', (typeof saveSelfFull === 'function' && saveSelfFull._merge) ? 'O' : '-');
    console.log('  updateUserFields 교체:', (typeof updateUserFields === 'function' && updateUserFields._merge) ? 'O' : '-');
};

window.invState = function () {
    console.log('%c===== 소지품 병합 =====', 'color:#d4af37; font-size:13px');
    const mine = asArr(currentUser && currentUser[INV]);
    const had = asArr(base[INV]);
    console.log('  내 소지품:', mine.length + '개 · 기준:', had.length + '개');
    const add = msDiff(mine, had), del = msDiff(had, mine);
    console.log('  아직 안 쓴 변화 — 늘어남:', add.join(', ') || '없음');
    console.log('                  줄어듦:', del.join(', ') || '없음');
    console.log('  지금까지 병합 ' + invStats.merged + '회 · 더함 ' + invStats.added
        + ' · 뺌 ' + invStats.removed + ' · 남과 겹친 적 ' + invStats.conflicts + '회');
    console.log('  남의 소지품 기준 보유:', Object.keys(shadowInv).length + '명');
};

window.ptsState = function () {
    console.log('%c===== 포인트 병합 =====', 'color:#d4af37; font-size:13px');
    const mine = Number(currentUser && currentUser[PTS]) || 0;
    const had = Number(base[PTS]) || 0;
    console.log('  내 포인트:', mine.toLocaleString() + ' P · 기준:', had.toLocaleString() + ' P');
    console.log('  아직 안 쓴 몫:', (mine - had >= 0 ? '+' : '') + (mine - had).toLocaleString() + ' P');
    console.log('  지금까지 병합 ' + ptsStats.merged + '회 · 움직인 합 '
        + ptsStats.moved.toLocaleString() + ' P');
    console.log('  남이 넣어 준 돈을 건진 적:', ptsStats.rescued + '회');
    console.log('  남의 포인트 기준 보유:', Object.keys(shadowPts).length + '명');
    console.log('  (돈은 값을 덮어쓰지 않고 「움직인 몫」만 트랜잭션으로 보냅니다)');
};

window.effState = function () {
    console.log('%c===== 걸린 효과 병합 =====', 'color:#d4af37; font-size:13px');
    const mine = effMap(currentUser && currentUser[EFF]);
    const had = effMap(base[EFF]);
    const now = Date.now();
    console.table(Object.keys(mine).map(function (n) {
        const e = mine[n];
        return { 효과: n, 남은: e.fixed ? '영구'
                   : (Math.max(0, Math.round((e.expireAt - now) / 60000)) + '분'),
                 기준에있나: (n in had) ? 'O' : '✗ (아직 안 보냄)' };
    }));
    const gone = Object.keys(had).filter(function (n) { return !(n in mine); });
    if (gone.length) console.log('  내가 지운 것(아직 안 보냄):', gone.join(', '));
    console.log('  바뀐 것 있나:', effChanged(had, mine) ? 'O — 곧 보냅니다' : '없음');
    console.log('  남에게 걸린 효과 기준 보유:', Object.keys(shadowEff).length + '명');
    console.log('  addTimedEffect 교체:',
        (typeof addTimedEffect === 'function' && addTimedEffect._merge) ? 'O' : '✗');
};

window.rootMergeState = function () {
    console.log('%c===== 루트 통째 쓰기 =====', 'color:#d4af37; font-size:13px');
    console.log('  갈아끼움:', (typeof database !== 'undefined' && database && database._rootMerge) ? 'O' : '✗');
    const k = Object.keys(rootStats);
    if (!k.length) { console.log('  아직 가로챈 것이 없습니다.'); return; }
    console.log('  병합으로 돌린 횟수:', k.map(function (x) { return x + ' ' + rootStats[x] + '번'; }).join(' · '));
};

// 서버 자료로 강제로 맞춘다
window.pullServer = function () {
    if (!database || !code) return;
    database.ref('users/' + code).once('value').then(function (s) {
        const v = s.val();
        if (!v) return;
        Object.keys(currentUser).forEach(function (k) { if (!(k in v)) delete currentUser[k]; });
        Object.keys(v).forEach(function (k) {
            if (k === INV) { fillArr(currentUser[INV] || (currentUser[INV] = []), v[k]); return; }
            currentUser[k] = clone(v[k]);
        });
        base = clone(v) || {};
        ready = true;
        if (typeof updateUI === 'function') updateUI();
        console.log('%c✓ 서버 자료로 맞췄습니다. 소지품 ' + asArr(currentUser[INV]).length + '개', 'color:#4CAF50');
    });
};

console.log('[병합] mergeState() · invState() · ptsState() · effState() · rootMergeState() · pullServer()');

})();