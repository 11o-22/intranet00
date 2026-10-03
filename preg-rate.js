// ==========================================
// ★ 임신 확률 — 최소 10% · 전원 다시 뽑기
// bundles.json 에서 dna.js 보다 뒤, save-merge.js 보다 앞에 둔다
// (마지막 묶음의 preg-v2.js 다음 자리면 된다)
// ==========================================
//
// ■ 지금 어떻게 되어 있나  (dna.js:39~56)
//
//     sireRate     시키는 쪽   0.5 ~ 35%
//     bearRate     되는 쪽     0.1 ~ 30%
//     sireRateAlt  물약으로 역할이 뒤집혔을 때의 시키는 쪽
//     bearRateAlt  같은 경우의 되는 쪽
//
//   네 값은 전부 사번을 해시해서 뽑는다. 저장되지 않고, 같은 사람은 언제나 같다.
//
//   실제 성공 확률은 두 값을 곱해서 쓴다. (pregnancy.js:204 · preg-v2.js:280)
//
//       성공 확률 = (시키는 쪽 ÷ 100) × (되는 쪽 ÷ 100) × 6
//
//   그래서 바닥값끼리 만나면 0.5% × 0.1% × 6 = 0.003% 였다. 평생 한 번도 안 된다.
//
// ■ 무엇을 바꾸나
//
//   1. 네 값 모두 바닥을 10% 로 올린다
//        시키는 쪽  10 ~ 35%      되는 쪽  10 ~ 30%
//        성공 확률  6% ~ 63%   (바닥 10×10×6 / 천장 35×30×6)
//
//   2. 전원 다시 뽑는다
//        해시에 쓰는 소금(gen)을 바꾸면 모든 사번의 값이 한꺼번에 새로 나온다.
//        저장된 값이 아니므로 데이터베이스를 건드리지 않는다.
//        나중에 또 돌리고 싶으면 아래 gen 을 'g3' · 'g4' … 로 올리면 된다.
//
//   dna.js 는 손대지 않고 네 함수만 바꿔 끼운다.

window.PREG_RATE = {
    min:     10,      // 네 값 공통 바닥 (%)
    sireMax: 35,      // 시키는 쪽 천장
    bearMax: 30,      // 되는 쪽 천장
    gen:     'g2'     // ★ 이 글자를 바꾸면 전원 다시 뽑힌다
};

(function pregRate() {

// dna.js 의 것을 쓰고, 없으면 같은 식을 여기 둔다
function sOf(str) {
    if (typeof seedOf === 'function') return seedOf(str);
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function sRand(seed, n) {
    if (typeof seedRand === 'function') return seedRand(seed, n);
    let x = seed + n * 2654435761;
    x = Math.imul(x ^ (x >>> 15), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

// 한 칸까지만 남긴다 — 원래 식과 같다
function pick(tag, code, n, max) {
    const R = window.PREG_RATE;
    const lo = R.min;
    const hi = Math.max(lo, max);
    const s = sOf(tag + '|' + R.gen + '|' + code);
    return Math.round((lo + sRand(s, n) * (hi - lo)) * 10) / 10;
}

const MADE = {
    sireRate:    function (u) { return u ? pick('sire',    u.code, 1, window.PREG_RATE.sireMax) : 0; },
    bearRate:    function (u) { return u ? pick('bear',    u.code, 2, window.PREG_RATE.bearMax) : 0; },
    sireRateAlt: function (u) { return u ? pick('sireAlt', u.code, 3, window.PREG_RATE.sireMax) : 0; },
    bearRateAlt: function (u) { return u ? pick('bearAlt', u.code, 4, window.PREG_RATE.bearMax) : 0; }
};

(function swap() {
    const iv = setInterval(function () {
        let ready = 0;
        Object.keys(MADE).forEach(function (n) { if (typeof window[n] === 'function') ready++; });
        if (ready < 4) return;

        Object.keys(MADE).forEach(function (n) {
            if (window[n]._newRate) return;
            window[n] = MADE[n];
            window[n]._newRate = true;
        });

        clearInterval(iv);
        const R = window.PREG_RATE;
        console.log('[임신 확률] 바닥 ' + R.min + '% · 시키는 쪽 ~' + R.sireMax
            + '% · 되는 쪽 ~' + R.bearMax + '% · 세대 ' + R.gen + ' — 전원 다시 뽑음');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
//
// rateState()        내 값과 전 사원 분포
// rateState('3079')  그 사번의 값
window.rateState = function (code) {
    const R = window.PREG_RATE;
    console.log('%c===== 임신 확률 =====', 'color:#ff8fb1; font-size:13px');
    console.log('  바닥 ' + R.min + '%  ·  시키는 쪽 ~' + R.sireMax + '%  ·  되는 쪽 ~' + R.bearMax
        + '%  ·  세대 ' + R.gen);

    const lo = (R.min / 100) * (R.min / 100) * 6 * 100;
    const hi = (R.sireMax / 100) * (R.bearMax / 100) * 6 * 100;
    console.log('  실제 성공 확률 ' + lo.toFixed(1) + '% ~ ' + hi.toFixed(1) + '%'
        + '  (시키는 쪽 × 되는 쪽 × 6)');

    function row(u) {
        const s = sireRate(u), b = bearRate(u);
        return {
            사원: u.name || u.code, 사번: u.no || '-',
            '시킬 확률': s + '%', '될 확률': b + '%',
            '맞붙었을 때': ((s / 100) * (b / 100) * 6 * 100).toFixed(1) + '%',
            '뒤집힐 때 시킬': sireRateAlt(u) + '%', '뒤집힐 때 될': bearRateAlt(u) + '%'
        };
    }

    if (code) {
        const u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
        if (!u) { console.log('  그 사번을 찾지 못했습니다.'); return; }
        console.table([row(u)]);
        return;
    }

    if (currentUser) { console.log('  — 내 값 —'); console.table([row(currentUser)]); }

    if (typeof db === 'undefined' || !db.users) return;
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.code; });
    if (!all.length) return;

    const sr = all.map(sireRate), br = all.map(bearRate);
    const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    console.log('  — 전 사원 ' + all.length + '명 —');
    console.table([
        { 구분: '시킬 확률', 최소: Math.min.apply(null, sr) + '%',
          평균: avg(sr) + '%', 최대: Math.max.apply(null, sr) + '%' },
        { 구분: '될 확률',   최소: Math.min.apply(null, br) + '%',
          평균: avg(br) + '%', 최대: Math.max.apply(null, br) + '%' }
    ]);
    console.log('  다시 뽑으려면 — PREG_RATE.gen 을 \'g3\' 로 고쳐 올린다');
};

console.log('[임신 확률] rateState()');

})();