// ==========================================
// ★ 정갈한 문패 · 오색 신발끈 — 전부 거두고 값을 돌려준다 · 우주 쇼핑몰에서 내린다 (2026-10-29)
// bundles.json 마지막 묶음 맨 끝 — copier-refund.js · rare-odds.js · save-merge.js 보다 뒤
// ==========================================
//
// ■ 무엇을 하나 (사용자 · 2026-10-29)
//
//   정갈한 문패(7,000 P) · 오색 신발끈(7,000 P)을 판에서 내린다.
//     · 우주 쇼핑몰 후보 목록에서 뺀다 (rare-odds.js 의 NEVER) — 오늘 이미 스캔해 둔 칸(alienUnlockedItems)에서도 지우고, 사는 것도 막는다
//     · 들고 있는 것은 거두고 한 개에 7,000 P 를 돌려준다
//     · ★ 2026-10-20 이후 웰컴 패키지로 받은 것은 **거두지 않는다** — users/<사번>/welcomeAt 이 10월 20일 0시(한국) 이후인 사원은
//       소속 묶음에 든 것(백일몽 → 정갈한 문패 2 · 재난관리국 → 오색 신발끈 2)만큼 남겨 둔다 (welcome.js PACK 과 같은 잣대).
//
// ■ 어디서 거두나 — copier-refund.js 와 같다
//
//   소지품(users/{사번}/inventory) · 사택 보관함(users/{사번}/house/storage) · 장터에 걸어 둔 판매 글(market/*)
//   남겨 둘 몫은 소지품에서 먼저 세고, 남으면 보관함에서 센다.
//
//   ① 사원 쪽 — 들어올 때와 1분마다 내 소지품 · 내 보관함을 본다.
//   ② 상담사 쪽 — 상담사가 들어오면 한 번, 서버의 전 사원을 훑어 한꺼번에 거둔다.
//
// ■ 두 번 돌려주지 않는다 — 거두기는 그 칸 하나에 거는 트랜잭션이고, 실제로 빼낸 쪽만 돈을 준다.
//
// ■ 콘솔 (상담사)
//   plateLaceCheck()       아직 가진 사원 · 장터 글 (남겨 둘 몫과 거둘 몫)
//   plateLaceRefundAll()   지금 전부 거두고 돌려준다 (들어올 때 저절로 한 번 돈다)

(function plateLaceRefund() {
'use strict';

const PRICE = { '정갈한 문패': 7000, '오색 신발끈': 7000 };
const NAMES = Object.keys(PRICE);
const KIT = [                                  // welcome.js PACK 과 같은 잣대
    { re: /재난관리국/, keep: { '오색 신발끈': 2 } },
    { re: /백일몽/,     keep: { '정갈한 문패': 2 } }
];
const CUT = Date.UTC(2026, 9, 19, 15, 0, 0);   // 2026-10-20 00:00 KST
const ADMIN = 'kario0987';
const TAG = '[문패·신발끈]';

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000; }
function won(n) { return Number(n || 0).toLocaleString(); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function nameIn(v) {
    const n = (v && typeof v === 'object') ? v.name : v;
    return (typeof n === 'string' && PRICE[n]) ? n : null;
}
function asList(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') {
        return Object.keys(v).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return v[k]; });
    }
    return [];
}
function countIn(v) { const c = {}; asList(v).forEach(function (x) { const n = nameIn(x); if (n) c[n] = (c[n] || 0) + 1; }); return c; }
function has(v) { return Object.keys(countIn(v)).length > 0; }
function timeStr() {
    const d = new Date();
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function nameOf(code) {
    try { if (typeof db !== 'undefined' && db.users && db.users[code]) return db.users[code].name || code; } catch (e) { }
    return code;
}

// 남겨 둘 몫 — 10월 20일 이후 웰컴 패키지를 받은 사원의 소속 묶음만큼
function keepFor(u) {
    const out = {};
    if (!u) return out;
    const at = Number(u.welcomeAt) || 0;
    if (!at || at < CUT) return out;
    const where = String(u.affiliation || '') + ' ' + String(u.team || '');
    for (let i = 0; i < KIT.length; i++) {
        if (KIT[i].re.test(where)) { Object.keys(KIT[i].keep).forEach(function (n) { out[n] = KIT[i].keep[n]; }); break; }
    }
    return out;
}

// ==========================================
// 목록 칸 하나에서 거둔다 → 실제로 뺀 이름들을 돌려준다 (남길 몫은 뒤에서부터 남긴다)
// ==========================================
function takeFrom(path, keep) {
    const d = db_();
    if (!d) return Promise.resolve({ got: [], kept: {} });
    let got = [], kept = {};
    return d.ref(path).transaction(function (cur) {
        got = []; kept = {};
        if (cur === null || cur === undefined) return null;
        const list = asList(cur);
        const left = Object.assign({}, keep || {});
        const out = [];
        // 앞에서부터 남길 몫을 채우고, 그 뒤는 거둔다
        list.forEach(function (v) {
            const n = nameIn(v);
            if (!n) { out.push(v); return; }
            if ((left[n] || 0) > 0) { left[n]--; kept[n] = (kept[n] || 0) + 1; out.push(v); return; }
            got.push(v);
        });
        if (!got.length) return;          // 거둘 것이 없다 — 손대지 않는다
        return out;
    }).then(function (res) {
        return (res && res.committed) ? { got: got, kept: kept } : { got: [], kept: kept };
    }).catch(function (e) {
        console.warn(TAG + ' ' + path + ' 거두기 실패:', e && e.message);
        return { got: [], kept: {} };
    });
}

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
        console.warn(TAG + ' ' + code + ' 포인트 넣기 실패:', e && e.message);
        return { paid: 0, lost: amount };
    });
}

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

function cntText(c) { return Object.keys(c).map(function (n) { return n + ' ' + c[n] + '개'; }).join(' · '); }

// 한 사람 몫 — 이름별 개수 c
function refund(code, c, where) {
    let amount = 0, n = 0;
    Object.keys(c).forEach(function (k) { amount += PRICE[k] * c[k]; n += c[k]; });
    return payTo(code, amount).then(function (r) {
        const tail = r.lost > 0 ? ' (포인트 한도로 ' + won(r.lost) + ' P 는 들어가지 못했습니다)' : '';
        return logTo(code, '[환불] ' + where + '의 ' + cntText(c) + '를 거두고 ' + won(r.paid) + ' P 를 돌려받았습니다.' + tail)
            .then(function () { return { code: code, n: n, items: c, paid: r.paid, lost: r.lost, where: where }; });
    });
}

// 거둔 것을 사람별로 묶어 돌려준다 — 소지품은 그 칸의 주인, 보관함은 넣은 사람(byCode — 없으면 보관함 주인)
function payBack(owner, got, where) {
    const by = {};
    got.forEach(function (v) {
        const c = (v && typeof v === 'object' && v.byCode) ? v.byCode : owner;
        const n = nameIn(v);
        by[c] = by[c] || {};
        by[c][n] = (by[c][n] || 0) + 1;
    });
    return Promise.all(Object.keys(by).map(function (c) { return refund(c, by[c], where); }));
}

// 남길 몫은 소지품에서 먼저, 남으면 보관함에서
function sweepOne(code, own, keep) {
    return takeFrom('users/' + code + '/inventory', keep).then(function (a) {
        const left = {};
        Object.keys(keep || {}).forEach(function (n) { left[n] = Math.max(0, (keep[n] || 0) - (a.kept[n] || 0)); });
        return (a.got.length ? payBack(code, a.got, '소지품') : Promise.resolve([])).then(function (r1) {
            return takeFrom('users/' + own + '/house/storage', left).then(function (b) {
                return (b.got.length ? payBack(own, b.got, '사택 보관함') : Promise.resolve([])).then(function (r2) {
                    return r1.concat(r2);
                });
            });
        });
    });
}
function sweepUser(code, x) {
    return sweepOne(code, code, keepFor(x));
}

// ==========================================
// ① 사원 쪽
// ==========================================
let busy = false;
function mineHas() {
    const u = me();
    if (!u) return false;
    const keep = keepFor(u);
    const c = countIn(u.inventory);
    if (Object.keys(c).some(function (n) { return c[n] > (keep[n] || 0); })) return true;
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
    // ★ 화면 쪽 소지품은 손대지 않는다 — 서버에서 빠진 것을 병합(save-merge.js)이 받아 와 맞춘다 (copier-refund.js 와 같다)
    return sweepOne(code, own, keepFor(u)).then(function (rows) {
        busy = false;
        const mine = rows.filter(function (r) { return r.code === code; });
        if (mine.length) {
            const n = mine.reduce(function (s, r) { return s + r.n; }, 0);
            const paid = mine.reduce(function (s, r) { return s + r.paid; }, 0);
            const lost = mine.reduce(function (s, r) { return s + r.lost; }, 0);
            const all = {};
            mine.forEach(function (r) { Object.keys(r.items).forEach(function (k) { all[k] = (all[k] || 0) + r.items[k]; }); });
            console.log('%c' + TAG + ' ' + cntText(all) + '를 거두고 ' + won(paid) + ' P 를 돌려받았습니다.', 'color:#4CAF50');
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            if (loud !== false) {
                const keep = keepFor(u);
                alert_('🏷 정갈한 문패 · 오색 신발끈이 회수되었습니다.\n\n' + cntText(all) + ' — ' + won(paid) + ' P 를 돌려드렸습니다.'
                    + (lost > 0 ? '\n(포인트 한도로 ' + won(lost) + ' P 는 들어가지 못했습니다)' : '')
                    + (Object.keys(keep).length ? '\n\n(10월 20일 이후 웰컴 패키지로 받은 ' + cntText(keep) + '는 남겨 두었습니다)' : ''));
            }
        }
        return rows;
    }).catch(function (e) {
        busy = false;
        console.warn(TAG + ' 거두기 건너뜀:', e && e.message);
        return [];
    });
}
window.plateLaceRefundMe = sweepMine;

(function watch() {
    setInterval(function () { if (me() && db_()) sweepMine(true); }, 60000);
    let tries = 0;
    const iv = setInterval(function () {
        const u = me();
        if (u && db_() && Array.isArray(u.inventory)) { clearInterval(iv); setTimeout(function () { sweepMine(true); }, 5000); return; }
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
            return p && p.type === 'sell' && p.state === 'OPEN' && PRICE[p.item];
        });
        return Promise.all(ids.map(function (id) {
            let post = null;
            return d.ref('market/' + id).transaction(function (p) {
                post = null;
                if (!p) return p === null ? null : undefined;
                if (p.state !== 'OPEN' || p.type !== 'sell' || !PRICE[p.item]) return;
                p.state = 'CANCELLED';
                p.cancelWhy = p.item + ' 회수 (판매자에게 환불)';
                post = p;
                return p;
            }).then(function (res) {
                if (!res || !res.committed || !post) return null;
                const c = {}; c[post.item] = Math.max(1, Number(post.qty) || 1);
                return refund(post.seller, c, '장터 판매 글');
            }).catch(function () { return null; });
        }));
    }).then(function (rows) { return rows.filter(Boolean); }).catch(function (e) {
        console.warn(TAG + ' 장터 훑기 실패:', e && e.message);
        return [];
    });
}

let allBusy = false;
window.plateLaceRefundAll = function (quiet) {
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
            const keep = keepFor(x), cnt = countIn(x.inventory);
            const over = Object.keys(cnt).some(function (n) { return cnt[n] > (keep[n] || 0); });
            return over || (x.house && has(x.house.storage));
        });
        let chain = Promise.resolve([]);
        codes.forEach(function (c) {
            chain = chain.then(function (acc) {
                return (c === u.code ? sweepMine(false) : sweepUser(c, all[c])).then(function (r) { return acc.concat(r); });
            });
        });
        return chain;
    }).then(function (rows) {
        return sweepMarket().then(function (m) { return rows.concat(m); });
    }).then(function (rows) {
        allBusy = false;
        if (!rows.length) { if (quiet !== true) console.log(TAG + ' 거둘 것이 없습니다.'); return rows; }
        const table = rows.map(function (r) {
            return { 사원: nameOf(r.code), 어디서: r.where, 거둔것: cntText(r.items), 돌려준P: won(r.paid), 한도초과P: r.lost ? won(r.lost) : '' };
        });
        console.log('%c===== 🏷 정갈한 문패 · 오색 신발끈 환불 =====', 'color:#4CAF50; font-size:13px');
        console.table(table);
        const n = rows.reduce(function (a, r) { return a + r.n; }, 0);
        const paid = rows.reduce(function (a, r) { return a + r.paid; }, 0);
        const lost = rows.filter(function (r) { return r.lost > 0; });
        const people = {};
        rows.forEach(function (r) { people[r.code] = 1; });
        alert_('🏷 정갈한 문패 · 오색 신발끈 환불\n\n' + Object.keys(people).length + '명 · ' + n + '개 · ' + won(paid) + ' P 를 돌려주었습니다.'
            + (lost.length ? '\n\n포인트 한도에 막힌 사원: ' + lost.map(function (r) { return nameOf(r.code) + ' ' + won(r.lost) + ' P'; }).join(', ') : '')
            + '\n\n(자세한 표는 콘솔에)');
        return rows;
    }).catch(function (e) {
        allBusy = false;
        console.error(TAG + ' 전체 환불 실패:', e);
        return [];
    });
};

window.plateLaceCheck = function () {
    const d = db_();
    if (!d) { console.warn('서버에 닿지 못했습니다.'); return; }
    Promise.all([d.ref('users').once('value'), d.ref('market').once('value')]).then(function (ss) {
        const all = ss[0].val() || {}, mk = ss[1].val() || {};
        const rows = [];
        Object.keys(all).forEach(function (c) {
            const x = all[c] || {};
            const a = countIn(x.inventory), b = x.house ? countIn(x.house.storage) : {};
            if (!Object.keys(a).length && !Object.keys(b).length) return;
            const keep = keepFor(x);
            rows.push({ 사원: x.name || c, 사번: x.no || '-', 소지품: cntText(a) || '-', 보관함: cntText(b) || '-',
                        남길것: cntText(keep) || '-', 웰컴: x.welcomeAt ? new Date(Number(x.welcomeAt)).toLocaleDateString() : '-' });
        });
        Object.keys(mk).forEach(function (k) {
            const p = mk[k];
            if (p && p.type === 'sell' && p.state === 'OPEN' && PRICE[p.item]) rows.push({ 사원: p.sellerName || p.seller, 사번: '-', 소지품: '-', 보관함: '-', 남길것: '-', 장터: p.item + ' ' + (p.qty || 1) });
        });
        console.log('%c===== 🏷 아직 남은 정갈한 문패 · 오색 신발끈 =====', 'color:#ffd700; font-size:13px');
        if (rows.length) { console.table(rows); console.log('  거두려면 plateLaceRefundAll()'); }
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
            setTimeout(function () { window.plateLaceRefundAll(true); }, 10000);
            return;
        }
        if (++tries > 180) clearInterval(iv);
    }, 1000);
})();

// ==========================================
// 우주 쇼핑몰 — 오늘 이미 스캔해 둔 칸에서도 지우고, 사는 것도 막는다 (후보 목록은 rare-odds.js NEVER)
// ==========================================
(function hideShop() {
    function strip() {
        const u = me();
        if (!u || !Array.isArray(u.alienUnlockedItems)) return false;
        const before = u.alienUnlockedItems.length;
        u.alienUnlockedItems = u.alienUnlockedItems.filter(function (n) { return !PRICE[n]; });
        if (u.alienUnlockedItems.length !== before) { try { if (typeof saveFields === 'function') saveFields({ alienUnlockedItems: 1 }); } catch (e) { } return true; }
        return false;
    }
    const iv = setInterval(function () {
        if (typeof renderAlienShop === 'function' && !renderAlienShop._pl) {
            const _r = renderAlienShop;
            const w = function () { try { strip(); } catch (e) { } return _r.apply(this, arguments); };
            Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
            w._pl = true; renderAlienShop = w; window.renderAlienShop = w;
        }
        if (typeof buyAlienItem === 'function' && !buyAlienItem._pl) {
            const _b = buyAlienItem;
            const w = function (itemName) {
                if (PRICE[itemName]) { alert_(itemName + '은(는) 판매를 멈췄습니다.'); return; }
                return _b.apply(this, arguments);
            };
            Object.keys(_b).forEach(function (k) { try { w[k] = _b[k]; } catch (e) { } });
            w._pl = true; buyAlienItem = w; window.buyAlienItem = w;
        }
        if (typeof renderAlienShop === 'function' && renderAlienShop._pl && typeof buyAlienItem === 'function' && buyAlienItem._pl) clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
    setInterval(function () { try { strip(); } catch (e) { } }, 30000);
})();

console.log(TAG + ' 회수 · 환불 — plateLaceCheck() · plateLaceRefundAll()');
})();
