// ==========================================
// ★ 복사기 — 전부 거두고 값을 돌려준다 (2026-10-25)
// bundles.json 마지막 묶음 맨 끝 — spaceitems.js · rare-odds.js · save-merge.js 보다 뒤
// ==========================================
//
// ■ 무엇을 하나
//
//   복사기(2,000,000 P)를 판에서 없앤다.
//     · 우주 쇼핑몰 후보 목록에서 뺀다 (rare-odds.js 의 NEVER) — 진열 · 장터 · 칠성 선물 같은 데서도 안 나온다
//     · 들고 있는 것은 거두고 한 개에 2,000,000 P 를 돌려준다
//     · 손에 남아 있어도 쓰면 복사 창이 아니라 환불이 돈다 (spaceitems.js)
//
// ■ 어디서 거두나
//
//   소지품(users/{사번}/inventory) · 사택 보관함(users/{사번}/house/storage) · 장터에 걸어 둔 판매 글(market/*)
//   선물함에 남은 것 · 거래가 끝나 소지품으로 돌아오는 것은 소지품에 들어오는 순간 아래 ①이 잡는다.
//
//   ① 사원 쪽 — 들어올 때와 1분마다 내 소지품 · 내 보관함을 본다.
//   ② 상담사 쪽 — 상담사가 들어오면 한 번, 서버의 전 사원을 훑어 한꺼번에 거둔다 (안 들어오는 사원 몫까지).
//
// ■ 두 번 돌려주지 않는다
//
//   거두기는 그 목록 칸 하나에 거는 트랜잭션이다. 둘이 동시에 거둬도(①과 ②, 두 기기) 복사기를
//   실제로 빼낸 쪽만 「뺀 개수」를 받는다. 돈은 그 개수만큼만 준다. 빼냈는데 돈이 못 갔다면 덜 받는 쪽으로
//   틀어지지, 더 받는 쪽으로는 틀어지지 않는다.
//
// ■ 콘솔 (상담사)
//
//   copierCheck()       아직 복사기를 가진 사원 · 장터 글
//   copierRefundAll()   지금 전부 거두고 돌려준다 (들어올 때 저절로 한 번 돈다)

(function copierRefund() {
'use strict';

const NAME = '복사기';
const PRICE = 2000000;
const ADMIN = 'kario0987';

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000; }
function won(n) { return Number(n || 0).toLocaleString(); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

function isCopier(v) {
    return v === NAME || !!(v && typeof v === 'object' && v.name === NAME);
}
// 파이어베이스는 빈칸이 생긴 배열을 객체로 돌려준다 — 번호 순서대로 배열로 편다
function asList(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') {
        return Object.keys(v).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return v[k]; });
    }
    return [];
}
function has(v) { return asList(v).some(isCopier); }

function timeStr() {
    const d = new Date();
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

// ==========================================
// 목록 칸 하나에서 복사기를 빼낸다 → 실제로 뺀 것들을 돌려준다
// ==========================================
//   cur 가 null 이면(이쪽 기억에 아직 없다) null 을 돌려 서버 값으로 다시 불리게 한다.
//   서버에도 없으면 그대로 비어 있을 뿐이다.
function takeFrom(path) {
    const d = db_();
    if (!d) return Promise.resolve([]);
    let got = [];
    return d.ref(path).transaction(function (cur) {
        got = [];
        if (cur === null || cur === undefined) return null;
        const list = asList(cur);
        const out = list.filter(function (v) {
            if (isCopier(v)) { got.push(v); return false; }
            return true;
        });
        if (!got.length) return;          // 거둘 것이 없다 — 손대지 않는다
        return out;
    }).then(function (res) {
        return (res && res.committed) ? got : [];
    }).catch(function (e) {
        console.warn('[복사기] ' + path + ' 거두기 실패:', e && e.message);
        return [];
    });
}

// ==========================================
// 돈을 넣는다 — 실제로 들어간 몫과 한도에 막힌 몫을 돌려준다
// ==========================================
function payTo(code, amount) {
    const d = db_();
    if (!d || !code || !(amount > 0)) return Promise.resolve({ paid: 0, lost: 0 });
    let paid = 0;
    const fn = function (p) {
        const was = Math.max(0, Number(p) || 0);
        const now = Math.max(0, Math.min(cap(), was + amount));
        paid = Math.max(0, now - was);
        return now;
    };
    const tx = (typeof window.txRetry === 'function')
        ? window.txRetry('users/' + code + '/points', fn, false)
        : d.ref('users/' + code + '/points').transaction(fn);
    return tx.then(function (res) {
        if (!res || !res.committed) return { paid: 0, lost: amount };
        return { paid: paid, lost: amount - paid };
    }).catch(function (e) {
        console.warn('[복사기] ' + code + ' 포인트 넣기 실패:', e && e.message);
        return { paid: 0, lost: amount };
    });
}

// 기록 한 줄 — 내 것은 화면 쪽에 적고 저장한다 (병합이 받아 간다), 남의 것은 그 칸에 바로 얹는다
function logTo(code, text) {
    const u = me();
    if (u && u.code === code) {
        try { if (typeof addHistoryLog === 'function') addHistoryLog(u, text); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
        return Promise.resolve();
    }
    const d = db_();
    if (!d) return Promise.resolve();
    return d.ref('users/' + code + '/history').transaction(function (h) {
        const list = asList(h);
        list.unshift({ time: timeStr(), text: text });
        while (list.length > 10) list.pop();
        return list;
    }).catch(function () { });
}

// 한 사람 몫을 돌려준다
function refund(code, n, where) {
    const amount = PRICE * n;
    return payTo(code, amount).then(function (r) {
        const tail = r.lost > 0 ? ' (포인트 한도로 ' + won(r.lost) + ' P 는 들어가지 못했습니다)' : '';
        return logTo(code, '[환불] ' + where + '의 복사기 ' + n + '개를 거두고 ' + won(r.paid) + ' P 를 돌려받았습니다.' + tail)
            .then(function () { return { code: code, n: n, paid: r.paid, lost: r.lost, where: where }; });
    });
}

// 거둔 것을 사람별로 묶어 돌려준다
//   소지품은 그 칸의 주인, 보관함은 넣은 사람(byCode — 없으면 보관함 주인)
function payBack(owner, got, where) {
    const by = {};
    got.forEach(function (v) {
        const c = (v && typeof v === 'object' && v.byCode) ? v.byCode : owner;
        by[c] = (by[c] || 0) + 1;
    });
    return Promise.all(Object.keys(by).map(function (c) { return refund(c, by[c], where); }));
}

function sweepUser(code) {
    return takeFrom('users/' + code + '/inventory').then(function (g1) {
        return (g1.length ? payBack(code, g1, '소지품') : Promise.resolve([])).then(function (r1) {
            return takeFrom('users/' + code + '/house/storage').then(function (g2) {
                return (g2.length ? payBack(code, g2, '사택 보관함') : Promise.resolve([])).then(function (r2) {
                    return r1.concat(r2);
                });
            });
        });
    });
}

// ==========================================
// ① 사원 쪽 — 내 소지품 · 내 보관함
// ==========================================
let busy = false;
function mineHas() {
    const u = me();
    if (!u) return false;
    if (has(u.inventory)) return true;
    try {
        const own = (typeof houseStorageRef === 'function') ? houseStorageRef(u) : u.code;
        const o = (own === u.code) ? u : ((typeof db !== 'undefined' && db.users) ? db.users[own] : null);
        if (o && o.house && has(o.house.storage)) return true;
    } catch (e) { }
    return false;
}
function sweepMine(loud) {
    const u = me();
    if (!u || !db_() || busy) return Promise.resolve([]);
    if (!mineHas()) return Promise.resolve([]);
    busy = true;
    const code = u.code;
    let own = code;
    try { if (typeof houseStorageRef === 'function') own = houseStorageRef(u) || code; } catch (e) { }

    // ★ 화면 쪽 소지품은 손대지 않는다. 서버에서 빠진 것을 병합(save-merge.js)이 받아 와 맞춘다.
    //   여기서 먼저 빼면 「내가 뺀 것」으로 세어 다음 저장이 서버에서 한 번 더 빼려 든다.
    return takeFrom('users/' + code + '/inventory').then(function (g1) {
        return (g1.length ? payBack(code, g1, '소지품') : Promise.resolve([])).then(function (r1) {
            return takeFrom('users/' + own + '/house/storage').then(function (g2) {
                return (g2.length ? payBack(own, g2, '사택 보관함') : Promise.resolve([])).then(function (r2) {
                    return r1.concat(r2);
                });
            });
        });
    }).then(function (rows) {
        busy = false;
        const mine = rows.filter(function (r) { return r.code === code; });
        if (mine.length) {
            const n = mine.reduce(function (s, r) { return s + r.n; }, 0);
            const paid = mine.reduce(function (s, r) { return s + r.paid; }, 0);
            const lost = mine.reduce(function (s, r) { return s + r.lost; }, 0);
            console.log('%c[복사기] ' + n + '개를 거두고 ' + won(paid) + ' P 를 돌려받았습니다.', 'color:#4CAF50');
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            if (loud !== false) {
                alert_('📠 복사기가 회수되었습니다.\n\n' + n + '개 — ' + won(paid) + ' P 를 돌려드렸습니다.'
                    + (lost > 0 ? '\n(포인트 한도로 ' + won(lost) + ' P 는 들어가지 못했습니다)' : ''));
            }
        }
        return rows;
    }).catch(function (e) {
        busy = false;
        console.warn('[복사기] 거두기 건너뜀:', e && e.message);
        return [];
    });
}
window.copierRefundMe = sweepMine;

// 들어올 때 · 1분마다 (선물함 · 장터에서 돌아온 것도 잡힌다)
(function watch() {
    setInterval(function () {
        if (!me() || !db_()) return;
        sweepMine(true);
    }, 60000);
    // 첫 번째는 조금 일찍 — 로그인이 끝나고 소지품이 올라올 때까지 기다린다
    let tries = 0;
    const iv = setInterval(function () {
        const u = me();
        if (u && db_() && Array.isArray(u.inventory)) { clearInterval(iv); setTimeout(function () { sweepMine(true); }, 4000); return; }
        if (++tries > 120) clearInterval(iv);
    }, 1000);
})();

// ==========================================
// ② 상담사 쪽 — 서버의 전 사원 + 장터
// ==========================================
function sweepMarket() {
    const d = db_();
    if (!d) return Promise.resolve([]);
    return d.ref('market').once('value').then(function (s) {
        const all = s.val() || {};
        const ids = Object.keys(all).filter(function (k) {
            const p = all[k];
            return p && p.type === 'sell' && p.state === 'OPEN' && p.item === NAME;
        });
        return Promise.all(ids.map(function (id) {
            let post = null;
            return d.ref('market/' + id).transaction(function (p) {
                post = null;
                if (!p) return p === null ? null : undefined;
                if (p.state !== 'OPEN' || p.type !== 'sell' || p.item !== NAME) return;
                p.state = 'CANCELLED';
                p.cancelWhy = '복사기 회수 (판매자에게 환불)';
                post = p;
                return p;
            }).then(function (res) {
                if (!res || !res.committed || !post) return null;
                return refund(post.seller, Math.max(1, Number(post.qty) || 1), '장터 판매 글');
            }).catch(function () { return null; });
        }));
    }).then(function (rows) { return rows.filter(Boolean); }).catch(function (e) {
        console.warn('[복사기] 장터 훑기 실패:', e && e.message);
        return [];
    });
}

function nameOf(code) {
    try { if (typeof db !== 'undefined' && db.users && db.users[code]) return db.users[code].name || code; } catch (e) { }
    return code;
}

let allBusy = false;
window.copierRefundAll = function (quiet) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return Promise.resolve([]); }
    const d = db_();
    if (!d) { console.warn('서버에 닿지 못했습니다.'); return Promise.resolve([]); }
    if (allBusy) return Promise.resolve([]);
    allBusy = true;

    return d.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const codes = Object.keys(all).filter(function (c) {
            const x = all[c] || {};
            return has(x.inventory) || (x.house && has(x.house.storage));
        });
        // 한 사람씩 차례로 — 같은 사람 포인트에 트랜잭션이 겹치지 않게
        let chain = Promise.resolve([]);
        codes.forEach(function (c) {
            chain = chain.then(function (acc) {
                return (c === u.code ? sweepMine(false) : sweepUser(c)).then(function (r) { return acc.concat(r); });
            });
        });
        return chain;
    }).then(function (rows) {
        return sweepMarket().then(function (m) { return rows.concat(m); });
    }).then(function (rows) {
        allBusy = false;
        if (!rows.length) {
            if (quiet !== true) console.log('[복사기] 거둘 것이 없습니다.');
            return rows;
        }
        const table = rows.map(function (r) {
            return { 사원: nameOf(r.code), 어디서: r.where, 개수: r.n, 돌려준P: won(r.paid), 한도초과P: r.lost ? won(r.lost) : '' };
        });
        console.log('%c===== 📠 복사기 환불 =====', 'color:#4CAF50; font-size:13px');
        console.table(table);
        const n = rows.reduce(function (a, r) { return a + r.n; }, 0);
        const paid = rows.reduce(function (a, r) { return a + r.paid; }, 0);
        const lost = rows.filter(function (r) { return r.lost > 0; });
        const people = {};
        rows.forEach(function (r) { people[r.code] = 1; });
        alert_('📠 복사기 환불\n\n' + Object.keys(people).length + '명 · ' + n + '개 · ' + won(paid) + ' P 를 돌려주었습니다.'
            + (lost.length ? '\n\n포인트 한도에 막힌 사원: ' + lost.map(function (r) { return nameOf(r.code) + ' ' + won(r.lost) + ' P'; }).join(', ') : '')
            + '\n\n(자세한 표는 콘솔에)');
        return rows;
    }).catch(function (e) {
        allBusy = false;
        console.error('[복사기] 전체 환불 실패:', e);
        return [];
    });
};

// 아직 가진 사람 · 장터 글
window.copierCheck = function () {
    const d = db_();
    if (!d) { console.warn('서버에 닿지 못했습니다.'); return; }
    Promise.all([d.ref('users').once('value'), d.ref('market').once('value')]).then(function (ss) {
        const all = ss[0].val() || {}, mk = ss[1].val() || {};
        const rows = [];
        Object.keys(all).forEach(function (c) {
            const x = all[c] || {};
            const a = asList(x.inventory).filter(isCopier).length;
            const b = x.house ? asList(x.house.storage).filter(isCopier).length : 0;
            if (a || b) rows.push({ 사원: x.name || c, 사번: x.no || '-', 소지품: a, 보관함: b });
        });
        Object.keys(mk).forEach(function (k) {
            const p = mk[k];
            if (p && p.type === 'sell' && p.state === 'OPEN' && p.item === NAME) {
                rows.push({ 사원: p.sellerName || p.seller, 사번: '-', 소지품: 0, 보관함: 0, 장터: p.qty || 1 });
            }
        });
        console.log('%c===== 📠 아직 남은 복사기 =====', 'color:#ffd700; font-size:13px');
        if (rows.length) { console.table(rows); console.log('  거두려면 copierRefundAll()'); }
        else console.log('  없습니다.');
    });
};

// 상담사가 들어오면 한 번 저절로
(function adminOnce() {
    let tries = 0;
    const iv = setInterval(function () {
        const u = me();
        if (u && u.code === ADMIN && db_()) {
            clearInterval(iv);
            setTimeout(function () { window.copierRefundAll(true); }, 8000);
            return;
        }
        if (++tries > 180) clearInterval(iv);
    }, 1000);
})();

})();
