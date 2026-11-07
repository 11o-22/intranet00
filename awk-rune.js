// ==========================================
// ★ 💠 각성의 룬 — 펫 · 봉제인형 등급업 (D → C → B → A → S)
// bundles.json 마지막 묶음 — pet-gear.js · doll-data.js 보다 뒤 (awaken.js 는 다른 것 — 사원 각성)
// ==========================================
//
// 2026-11-07 사용자 「난이도별로 S까지 올라갈 수 있게 조정. 대신 올라갈 때마다 필요한 각성의 룬을 도입하자.
//   (기존의 D>C로 갈 때 필요한 조각은 없애기.) C급 각성의 룬 (C로 올라갈 때 필요한 것.) … 룬은 어둠에서 처치할 때마다
//   확률적으로 각성의 룬 조각이 나오고 조각 세 개를 합쳐 룬으로 만든 후 사용이 가능하게. 등급이 높은 룬 조각일 수록 나오기 어렵게」
//
// ■ 룬
//   C급 각성의 룬 — D → C · B급 — C → B · A급 — B → A · S급 — A → S   (모두 D 로 태어나므로 D급 룬은 없다)
//   등급업은 Lv 10 + 다음 등급의 룬 하나. 오르면 Lv 1 부터 다시.  (펫 · 봉제인형 · 짝 모두 같다)
//
// ■ 조각
//   펫 동행 어둠(여정 · 아케이드존)에서 괴담을 쓰러뜨릴 때마다 굴린다 — 보통 30% · 보스는 반드시 하나(+30% 하나 더).
//   어느 등급 조각이 나오나는 그 판의 난이도까지 · 높을수록 드물다 (무게 C 60 · B 26 · A 10 · S 4)
//       난이도 D → C 만 · C → C·B · B → C·B·A · A · S → C·B·A·S (S 는 C 를 빼고 무게를 높인다)
//   조각 셋 → 룬 하나 (도깨비 공방 「탈 깎는 도깨비」 — 각성 공방)
//
// ■ 사원 기록
//   u.awkBag  { 'C급 각성의 룬 조각': n, 'C급 각성의 룬': n, … }   — 소지품과 따로
//   예전 D → C 조각(u.petShard 의 🧩)은 한 번 C급 조각으로 바꿔 준다 (같은 수 · u.awkConv)
//
// ■ 콘솔
//   awkState() · awkGive('C', 3[, 'rune'])  상담사

(function awaken() {
'use strict';

const GR = ['D', 'C', 'B', 'A', 'S'];
const W = { C: 60, B: 26, A: 10, S: 4 };
const CAP = { D: ['C'], C: ['C', 'B'], B: ['C', 'B', 'A'], A: ['C', 'B', 'A', 'S'], S: ['B', 'A', 'S'] };
const DROP = 0.30;
const ADMIN = 'kario0987';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function RUNE(g) { return g + '급 각성의 룬'; }
function SHARD(g) { return g + '급 각성의 룬 조각'; }
function next(g) { const i = GR.indexOf(g || 'D'); return (i >= 0 && i < GR.length - 1) ? GR[i + 1] : null; }

function bag(u) {
    u = u || u_();
    if (!u) return {};
    const v = u.awkBag;
    if (!v || typeof v !== 'object' || Array.isArray(v)) u.awkBag = {};
    return u.awkBag;
}
function have(name, u) { return Math.max(0, Number(bag(u)[name]) || 0); }
function add(name, n, u) {
    u = u || u_();
    if (!u) return false;
    const b = bag(u);
    const v = (Number(b[name]) || 0) + (Number(n) || 0);
    if (v < 0) return false;
    if (v) b[name] = v; else delete b[name];
    const d = db_();
    if (d && u.code) d.ref('users/' + u.code + '/awkBag/' + name).set(v || null).catch(function (e) { console.warn('[룬] 저장 실패', e); });
    else { try { if (typeof saveFields === 'function') saveFields({ awkBag: 1 }); } catch (e) { } }
    return true;
}
// 조각 셋 → 룬 하나 (times 번)
function combine(g, times) {
    const u = u_();
    times = Math.max(1, Math.floor(Number(times) || 1));
    const can = Math.floor(have(SHARD(g), u) / 3);
    const n = Math.min(can, times);
    if (!n) return 0;
    add(SHARD(g), -3 * n, u);
    add(RUNE(g), n, u);
    try { if (typeof addHistoryLog === 'function') { addHistoryLog(u, '[💠 각성] ' + SHARD(g) + ' ' + (3 * n) + '개 → ' + RUNE(g) + ' ' + n + '개'); saveFields({ history: 1 }); } } catch (e) { }
    return n;
}
// 쓰러뜨린 괴담 하나 — 조각 등급(없으면 null)
function rollOne(diff) {
    const pool = CAP[diff] || CAP.D;
    const ws = pool.map(function (g) { return (diff === 'S' && g !== 'B') ? W[g] * 3 : W[g]; });
    const sum = ws.reduce(function (a, b) { return a + b; }, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r < 0) return pool[i]; }
    return pool[0];
}
function rollDrop(diff, boss) {
    const out = [];
    if (boss) { out.push(rollOne(diff)); if (Math.random() < DROP) out.push(rollOne(diff)); }
    else if (Math.random() < DROP) out.push(rollOne(diff));
    return out;
}

// 예전 D → C 조각을 C급 조각으로 (한 번)
function convert() {
    const u = u_();
    if (!u || !u.code || u.awkConv) return;
    let n = 0;
    const ps = u.petShard;
    if (ps && typeof ps === 'object') Object.keys(ps).forEach(function (k) { if (/^🧩/.test(k)) n += Math.max(0, Number(ps[k]) || 0); });
    u.awkConv = 1;
    const d = db_();
    if (n) {
        add(SHARD('C'), n, u);
        u.petShard = {};
        if (d) d.ref('users/' + u.code + '/petShard').set(null);
        try { addHistoryLog(u, '[💠 각성] 예전 등급업 조각 ' + n + '개를 ' + SHARD('C') + ' ' + n + '개로 바꿨습니다.'); saveFields({ history: 1 }); } catch (e) { }
    }
    if (d) d.ref('users/' + u.code + '/awkConv').set(1);
    else { try { saveFields({ awkConv: 1 }); } catch (e) { } }
}
setInterval(function () { try { const u = u_(); if (u && u.code && !u.awkConv && (typeof window.clockReady !== 'function' || window.clockReady())) convert(); } catch (e) { } }, 5000);

window.AWK = { GR: GR, CAP: CAP, W: W, DROP: DROP, RUNE: RUNE, SHARD: SHARD, next: next, bag: bag, have: have, add: add, combine: combine, rollDrop: rollDrop };
window.awkState = function () {
    console.log('%c===== 💠 각성의 룬 =====', 'color:#9fd8ef; font-size:13px');
    console.table(['C', 'B', 'A', 'S'].map(function (g) { return { 등급: g, 조각: have(SHARD(g)), 룬: have(RUNE(g)) }; }));
};
window.awkGive = function (g, n, rune) {
    const u = u_();
    if (!u || u.code !== ADMIN) { console.warn('상담사만'); return; }
    add(rune ? RUNE(g) : SHARD(g), Number(n) || 1, u);
    window.awkState();
};
})();
