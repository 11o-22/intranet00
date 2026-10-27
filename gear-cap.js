// ==========================================
// ★ 커스텀 장비 상한 — 회수품 행운 ×2 · 정산 포인트 ×3 · 보정 +23 (2026-10-27)
// bundles.json 마지막 묶음 맨 끝 (모든 커스텀 장비 파일 뒤)
// ==========================================
//
//   커스텀 장비(🦋 환영 나비 · 🌟 칠성군 · 🔎 눈 · 📺 토크 쇼 · 🐾 아기 여우 · 📖 지산 · 🎐 여우 신도 …)가
//   얹는 배수와 보정에 천장을 둔다.
//
//     회수품 확률 배수   다 곱해도 ×2 까지        (에메랄드 하네스 같은 보통 물건의 몫은 그 밖 — 그 위에 곱한다)
//     정산 포인트 배수   다 곱해도 ×3 까지        (기본 정산의 3배 — 「다음 탐사 +10,000 P」 같은 고정 몫은 세지 않는다)
//     굴림 보정          다 더해도 +23 까지
//
//   예외
//     🎐 여우 신도      상한에 안 걸린다 — 제 몫은 상한 위에 그대로 얹는다
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

// ── 회수품 — 커스텀 몫의 곱은 2 까지
wrap('emLootMult', function (_e) {
    return function (user) {
        const total = Number(_e.apply(this, arguments)) || 1;
        let base = 1;
        try { if (baseLoot) base = Number(baseLoot.call(this, user)) || 1; } catch (e) { base = 1; }
        const fox = foxLoot(user);
        const custom = total / (base * fox);
        if (custom <= CAP.LOOT) return total;
        lastLoot = { was: custom, at: Date.now() };
        return base * fox * CAP.LOOT;
    };
}, '_gearCap');

// ── 정산 포인트 — 커스텀 몫의 곱은 3 까지 (어둠 · 피날레 · EPIC)
function settleWrap(_f, self, args) {
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
        const fox = foxPts();
        const allow = Math.round(base * fox * CAP.PTS);
        if (got > allow) {
            const cut = got - allow;
            try { if (typeof changePoints === 'function') changePoints(-cut); else me.points -= cut; } catch (e) { me.points -= cut; }
            lastPts = { base: base, got: got, allow: allow, cut: cut, at: Date.now() };
            try { addHistoryLog(me, '[⚖ 상한] 커스텀 장비 포인트 배수는 다 합쳐 ×3 까지 — ' + cut.toLocaleString() + ' P 는 들어오지 않았습니다.'); } catch (e) { }
            try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
            try {
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body) {
                    const el = document.createElement('div');
                    el.style.cssText = 'margin-top:8px; padding:8px 10px; border:1px dashed #6a5a3a; border-radius:5px; font-size:11px; color:#d9c38a;';
                    el.textContent = '⚖ 커스텀 장비 배수는 다 합쳐 ×3 까지 — ' + cut.toLocaleString() + ' P 는 들어오지 않았습니다.';
                    const btn = body.querySelector('button');
                    if (btn) btn.insertAdjacentElement('beforebegin', el); else body.appendChild(el);
                }
            } catch (e) { }
        }
    } catch (e) { console.warn('[상한] 정산 상한 건너뜀', e && e.message); }
    return out;
}
wrap('renderDarkResult', function (_r) { return function () { return settleWrap(_r, this, arguments); }; }, '_gearCap');
wrap('epicSettle', function (_s) { return function () { return settleWrap(_s, this, arguments); }; }, '_gearCap');

window.gearCapState = function () {
    console.log('%c===== ⚖ 커스텀 장비 상한 =====', 'color:#d9c38a; font-size:13px');
    console.log('  회수품 ×' + CAP.LOOT + ' · 포인트 ×' + CAP.PTS + ' · 보정 +' + CAP.BON + ' (🎐 여우 신도는 상한 밖 · 🦋 보정 몫은 상한 밖 · 포인트 1.5 · 🌟 포인트 2)');
    console.log('  연결:', ['rollDarkBonus', 'emLootMult', 'renderDarkResult', 'epicSettle'].map(function (n) { return n + ' ' + ((typeof window[n] === 'function' && window[n]._gearCap) ? 'O' : '✗'); }).join(' · '));
    console.log('  지금 회수품 배수:', (typeof window.emLootMult === 'function') ? window.emLootMult(u_()) : '-', '· 보정(sense):', (typeof window.rollDarkBonus === 'function' && run()) ? window.rollDarkBonus('sense') : '-');
    console.log('  마지막으로 깎은 것 — 회수품:', lastLoot, '· 포인트:', lastPts, '· 보정:', lastBon);
};

})();
