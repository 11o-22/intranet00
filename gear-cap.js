// ==========================================
// ★ 커스텀 장비 상한 — 회수품 행운 ×2 · 정산 포인트 ×3 (겹치면 가장 높은 하나만 · 2026-11-02) · 보정 +23 (2026-10-27)
// bundles.json 마지막 묶음 맨 끝 (모든 커스텀 장비 파일 뒤)
// ==========================================
//
//   커스텀 장비(🦋 환영 나비 · 🌟 칠성군 · 🔎 눈 · 📺 토크 쇼 · 🐾 아기 여우 · 📖 지산 · 🎐 여우 신도 …)가
//   얹는 배수와 보정에 천장을 둔다.
//
//     회수품 확률 배수   겹치지 않는다 — 가장 높은 하나만 · ×2 까지 (2026-11-03 · 전에는 다 곱해 ×2)  (에메랄드 하네스 같은 보통 물건의 몫은 그 밖)
//     정산 포인트 배수   다 곱해도 ×3 까지        (기본 정산의 3배 — 「다음 탐사 +10,000 P」 같은 고정 몫은 세지 않는다)
//     굴림 보정          다 더해도 +23 까지
//
//   ★ 포인트 배수가 겹치면 (2026-11-02 사용자) — 커스텀 장비 둘 이상이 한 정산에 포인트 배수를 얹으면
//     **배수가 가장 높은 하나만** 따른다 (곱하지 않는다). 한 장비 안의 여러 배수(📺 무대 열기 × 사회자와 끝까지)는 한 몫.
//     장비마다 정산에서 붙인 몫을 window.gearPtsMark(id, 배수, 붙인 P) 로 적어 두고, 맨 바깥 겹(여기)이
//     「커스텀 몫을 걷어 낸 포인트 × 가장 높은 배수 × 🎐 여우 신도 배수」를 넘는 만큼을 걷는다.
//     🌙 달빛 문신(②)은 판이 끝난 뒤 따로 붙어 gearPtsLast 로 앞서 따른 배수를 보고 그보다 높을 때만 그 차이를 붙인다.
//     K 의 방은 settle() 안에서 같은 규칙으로 고른다 (kroom-core.js).
//
//   예외
//     🎐 여우 신도      상한에 안 걸린다 — 제 몫은 상한 위에 그대로 얹는다 (겹침 규칙에도 안 든다)
//     🦋 환영 나비      포인트 배수는 1.5 까지 (butterfly.js PTS_CAP) · 대신 보정 · 판정 몫은 상한에서 뺀다 (그대로 다 붙는다)
//     🌟 칠성군         포인트 배수는 2 까지 (chilseong.js MUG · MUN_X)
//
//   어디서
//     회수품   emLootMult 맨 바깥 (스페이스 아이템의 원래 함수를 먼저 잡아 두고 그 몫은 뺀다)
//     보정     rollDarkBonus 맨 바깥 · K 의 방 roll() · 피날레 roll() 은 gearCapBonus 를 부른다
//     포인트   renderDarkResult · epicSettle 맨 바깥 — 정산 전후 포인트 차이를 기본 정산(darkLogs[0].reward)과 견준다
//              K 의 방은 settle() 안에서 (kroom-core.js)
//
//   gearCapState()   지금 걸린 상한

(function gearCap() {
'use strict';

const CAP = { LOOT: 2, PTS: 3, BON: 23 };
const baseLoot = (typeof window.emLootMult === 'function') ? window.emLootMult : null;   // 스페이스 아이템 — 커스텀 몫이 얹히기 전
let lastLoot = null, lastPts = null, lastBon = null;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function mine(user) { const me = u_(); return !!(me && (!user || user.code === me.code)); }
function wrap(name, make, flag) {
    setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function' || f[flag]) return;
        const w = make(f);
        Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
        w[flag] = true;
        window[name] = w;
        try { if (name === 'renderDarkResult') renderDarkResult = w; } catch (e) { }
        try { if (name === 'rollDarkBonus') rollDarkBonus = w; } catch (e) { }
        try { if (name === 'emLootMult') emLootMult = w; } catch (e) { }
        try { if (name === 'epicSettle') epicSettle = w; } catch (e) { }
    }, 1500);
}

// ── 예외 몫
function foxLoot(user) {
    try { if (mine(user) && window.FOXCULT) { const p = window.FOXCULT.stat('luckx'); if (p > 0) return 1 + p / 100; } } catch (e) { }
    return 1;
}
function foxPts() { try { return window.FOXCULT ? Math.max(1, window.FOXCULT.mult()) : 1; } catch (e) { return 1; } }
function exemptBon(kind) {
    let b = 0;
    try { if (window.FOXCULT && run()) { b += window.FOXCULT.stat('judge') || 0; if (kind === 'evade' || kind === 'hide') b += window.FOXCULT.stat('evade') || 0; } } catch (e) { }
    try { if (window.BFLY && typeof window.BFLY.bonus === 'function') b += window.BFLY.bonus() || 0; } catch (e) { }
    return b;
}

// ── 보정 — 다 더해 23 까지 (예외 몫은 그 위에)
window.gearCapBonus = function (b, kind) {
    b = Number(b) || 0;
    const ex = exemptBon(kind);
    const rest = b - ex;
    if (rest <= CAP.BON) return b;
    lastBon = { was: b, now: CAP.BON + ex, at: Date.now() };
    return CAP.BON + ex;
};
wrap('rollDarkBonus', function (_r) {
    return function (kind) {
        const b = _r.apply(this, arguments);
        return window.gearCapBonus(b, kind);
    };
}, '_gearCap');

// ── 회수품 — 커스텀 장비 배수는 겹치지 않는다 · 가장 높은 하나만 · 그것도 ×2 까지 (2026-11-03 사용자)
//   전에는 커스텀 몫을 다 곱한 뒤 ×2 로 잘랐다. 이제 장비마다 곱한 몫을 window.gearLootMark(id, 배수) 로 적어 두고,
//   맨 바깥 겹(여기)이 그 곱을 걷어 낸 뒤 가장 높은 하나(×2 까지)만 다시 곱한다.
//   🐾 아기 여우 · 🦋 환영 나비(숨결) · 🌟 칠성군(문곡 · 치성) · 🐺 정예 B조 · 🔎 감지하는 눈 · 📺 토크 쇼 — 🎐 여우 신도는 규칙 밖 (그대로 곱한다).
//   에메랄드 · 아쿠아마린 같은 보통 물건 몫은 적지 않으니 건드리지 않는다. 겹이 여럿 감겨도 맨 바깥 겹만 센다.
let lootMarks = null, lootDepth = 0;
window.gearLootMark = function (id, m) {
    if (!lootMarks) return;
    m = Number(m) || 1;
    if (m > 0 && m !== 1) lootMarks.push({ id: String(id), m: m });
};
wrap('emLootMult', function (_e) {
    return function (user) {
        if (lootDepth) return _e.apply(this, arguments);
        lootDepth++; lootMarks = [];
        try {
            const total = Number(_e.apply(this, arguments)) || 1;
            const ms = lootMarks.filter(function (x) { return x.id !== 'fox'; });
            if (!ms.length) return total;
            let prod = 1, top = 1, topId = '';
            ms.forEach(function (x) { prod *= x.m; if (x.m > top) { top = x.m; topId = x.id; } });
            const keep = Math.min(CAP.LOOT, top);
            const out = total / prod * keep;
            if (Math.abs(out - total) > 1e-9) lastLoot = { marks: ms.map(function (x) { return x.id + ' ×' + (Math.round(x.m * 100) / 100); }), top: topId, keep: keep, was: total, now: out, at: Date.now() };
            return out;
        } finally { lootDepth--; lootMarks = null; }
    };
}, '_gearCap');

// ── 포인트 배수 겹침 — 장비마다 붙인 몫을 적는다 (정산 하나 동안만)
const PTS_NAME = { bfly: '🦋 환영 나비', chil: '🌟 칠성군', eb: '🐺 정예 B조', eye: '🔎 감지하는 눈', jisan: '📖 종말예언', show: '📺 토크 쇼', moon: '🌙 달빛 문신' };
let marks = null, depth = 0, lastTop = null, lastOver = null;
window.gearPtsMark = function (id, m, extra) {
    if (!marks) return;
    marks.push({ id: String(id), m: Number(m) || 1, x: Math.round(Number(extra) || 0) });
};
// 앞서 따른 커스텀 배수 — { at, m, id } (since 뒤의 것만)
window.gearPtsLast = function (since) { return (lastTop && lastTop.at >= (Number(since) || 0)) ? lastTop : null; };
window.gearPtsSet = function (m, id) { lastTop = { at: Date.now(), m: Math.max(1, Number(m) || 1), id: id || '' }; };
window.gearPtsName = function (id) { return PTS_NAME[id] || String(id || ''); };
function fmtX(m) { return '×' + (Math.round(m * 100) / 100); }
function cutPts(me, cut, msg) {
    try { if (typeof changePoints === 'function') changePoints(-cut); else me.points -= cut; } catch (e) { me.points -= cut; }
    try { addHistoryLog(me, '[⚖ 상한] ' + msg); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    try {
        const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
        if (body) {
            const el = document.createElement('div');
            el.style.cssText = 'margin-top:8px; padding:8px 10px; border:1px dashed #6a5a3a; border-radius:5px; font-size:11px; color:#d9c38a;';
            el.textContent = '⚖ ' + msg;
            const btn = body.querySelector('button');
            if (btn) btn.insertAdjacentElement('beforebegin', el); else body.appendChild(el);
        }
    } catch (e) { }
}

// ── 정산 포인트 — 겹치면 가장 높은 배수 하나 · 그래도 ×3 까지 (어둠 · 피날레 · EPIC)
//    겹이 여럿 감겨도 맨 바깥 겹만 센다 (안쪽 겹은 그냥 지나간다)
function settleWrap(_f, self, args) {
    if (depth) return _f.apply(self, args);
    depth++; marks = [];
    try { return settleCore(_f, self, args); }
    finally { depth--; marks = null; }
}
function settleCore(_f, self, args) {
    const me = u_();
    const before = me ? (Number(me.points) || 0) : 0;
    const log0 = (me && me.darkLogs && me.darkLogs.length) ? me.darkLogs[0] : null;
    const pend0 = me ? (Number(me.darkPtPend) || 0) : 0;
    const out = _f.apply(self, args);
    try {
        if (!me) return out;
        const lg = (me.darkLogs || [])[0];
        if (!lg || lg === log0 || lg.died) return out;
        const base = Math.max(0, Number(lg.reward) || 0);
        if (!base) return out;
        let got = (Number(me.points) || 0) - before;
        if (pend0 && !(Number(me.darkPtPend) || 0)) got -= pend0;         // 「다음 탐사 +n P」 고정 몫은 세지 않는다
        // ── 겹친 배수 — 가장 높은 하나만 (2026-11-02)
        const ms = (marks || []).slice();
        const gear = {}; let fx = 0, fxM = 1;
        ms.forEach(function (k) {
            if (k.id === 'fox') { fx += k.x; fxM *= Math.max(1, k.m); return; }
            const g = gear[k.id] || (gear[k.id] = { m: 1, x: 0 });
            g.m *= k.m; g.x += k.x;
        });
        const ids = Object.keys(gear).filter(function (id) { return gear[id].m > 1; });
        let top = null;
        ids.forEach(function (id) { if (!top || gear[id].m > gear[top].m) top = id; });
        const topM = top ? Math.min(CAP.PTS, gear[top].m) : 1;
        window.gearPtsSet(topM, top);
        if (ids.length >= 2 && got > 0) {
            const sumX = ids.reduce(function (a, id) { return a + gear[id].x; }, 0);
            const base0 = got - sumX - fx;                                  // 커스텀 몫을 다 걷어 낸 포인트
            if (base0 > 0) {
                const target = Math.round(base0 * topM * fxM);
                const cut = got - target;
                if (cut > 0) {
                    const rest = ids.filter(function (id) { return id !== top; }).map(function (id) { return PTS_NAME[id] + ' ' + fmtX(gear[id].m); }).join(' · ');
                    cutPts(me, cut, '커스텀 장비 포인트 배수가 겹쳤습니다 — 가장 높은 ' + PTS_NAME[top] + ' ' + fmtX(gear[top].m) + ' 만 따릅니다 ('
                        + rest + ' 몫 ' + cut.toLocaleString() + ' P 는 들어오지 않았습니다.)');
                    lastOver = { ids: ids.map(function (id) { return id + ' ' + fmtX(gear[id].m); }), top: top, got: got, base0: base0, target: target, cut: cut, at: Date.now() };
                    got -= cut;
                }
            }
        }
        const fox = Math.max(foxPts(), fxM);                               // 여우 신도 — 정산에서 실제로 붙은 배수가 있으면 그것
        const allow = Math.round(base * fox * CAP.PTS);
        if (got > allow) {
            const cut = got - allow;
            lastPts = { base: base, got: got, allow: allow, cut: cut, at: Date.now() };
            cutPts(me, cut, '커스텀 장비 포인트 배수는 ×3 까지 — ' + cut.toLocaleString() + ' P 는 들어오지 않았습니다.');
        }
    } catch (e) { console.warn('[상한] 정산 상한 건너뜀', e && e.message); }
    return out;
}
wrap('renderDarkResult', function (_r) { return function () { return settleWrap(_r, this, arguments); }; }, '_gearCap');
wrap('epicSettle', function (_s) { return function () { return settleWrap(_s, this, arguments); }; }, '_gearCap');

window.gearCapState = function () {
    console.log('%c===== ⚖ 커스텀 장비 상한 =====', 'color:#d9c38a; font-size:13px');
    console.log('  회수품 ×' + CAP.LOOT + ' · 포인트 ×' + CAP.PTS + ' (둘 다 커스텀 장비끼리 겹치면 가장 높은 하나만) · 보정 +' + CAP.BON + ' (🎐 여우 신도는 상한 밖 · 🦋 보정 몫은 상한 밖 · 포인트 1.5 · 🌟 포인트 2)');
    console.log('  연결:', ['rollDarkBonus', 'emLootMult', 'renderDarkResult', 'epicSettle'].map(function (n) { return n + ' ' + ((typeof window[n] === 'function' && window[n]._gearCap) ? 'O' : '✗'); }).join(' · '));
    console.log('  지금 회수품 배수:', (typeof window.emLootMult === 'function') ? window.emLootMult(u_()) : '-', '· 보정(sense):', (typeof window.rollDarkBonus === 'function' && run()) ? window.rollDarkBonus('sense') : '-');
    console.log('  마지막으로 깎은 것 — 회수품:', lastLoot, '· 포인트:', lastPts, '· 보정:', lastBon);
    console.log('  포인트 배수 겹침 — 마지막으로 따른 것:', lastTop, '· 걷은 것:', lastOver);
};

})();
