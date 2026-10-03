// ==========================================
// ★ S-003 · S-010 난이도 올리기
// index.html 에서 s003.js · itemfix.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 생환률이 높았던 진짜 이유
//
//   두 구역은 「압력계」로 사람을 몰아붙인다.
//     S-003 이해도(lore) 80 에 닿으면 동화됨
//     S-010 감염도(infect) 100 에 닿으면 끝
//
//   그런데 그 압력계를 전용 장비가 거의 무력화한다.
//
//   addInfect 는 이렇게 깎는다.      amount × (1 − heal × 0.6)
//       D 85%   C 78%   B 70%   A 58%   S 40%   L 10%
//   치유 L 이면 감염도가 10분의 1 로만 오른다. 사실상 안 오른다.
//
//   addLore 는 이렇게 깎는다.        amount × (1 − gaze × 0.04)
//       D 88%   C 80%   B 76%   A 68%   S 52%   L 28%
//   응시 L 이면 이해도가 4분의 1 로만 오른다.
//
//   DC 도 완만하다. s003DC = base+6, s010DC = base+5.
//
// ■ 무엇을 바꾸나
//
//   1. 두 구역의 DC 를 올린다               (s003Dc · s010Dc)
//   2. 압력계가 차는 속도를 올린다           (loreUp · infectUp)
//   3. 치유·응시의 감쇄를 절반으로 줄인다     (healDiv · gazeDiv)
//
//   기본값으로 치유 L 의 감염 흡수는 10% → 77% 가 된다. 7.7배다.
//   장비가 없는 사원은 100% → 140% 로 1.4배. 장비가 셀수록 더 세게 맞는다.
//
// ■ 숫자는 아래 ZONE_HARD 에서 바꾼다
//   콘솔에서 바로 고쳐 시험할 수 있다.   ZONE_HARD.infectUp = 2
//   zoneHardState() 로 지금 설정과 표를 본다.

window.ZONE_HARD = {
    s003Dc:   3,    // s003DC 에 더한다 (지금 base+6 → base+9)
    s010Dc:   3,    // s010DC 에 더한다 (지금 base+5 → base+8)
    loreUp:   1.4,  // 이해도 상승 배수
    infectUp: 1.4,  // 감염도 상승 배수
    healDiv:  2,    // 감염 감쇄에 쓰이는 치유값을 이 수로 나눈다
    gazeDiv:  2     // 이해도 감쇄에 쓰이는 응시값을 이 수로 나눈다
};

(function zoneHard() {

const Z = window.ZONE_HARD;

// ==========================================
// 1. DC
// ==========================================
(function hookDC() {
    const names = [['s003DC', 's003Dc'], ['s010DC', 's010Dc']];
    const iv = setInterval(function () {
        let left = 0;
        names.forEach(function (p) {
            const fn = window[p[0]];
            if (typeof fn !== 'function') { left++; return; }
            if (fn._hard) return;
            const _o = fn;
            window[p[0]] = function (base) {
                return _o.apply(this, arguments) + (Z[p[1]] || 0);
            };
            window[p[0]]._hard = true;
            console.log('[구역] ' + p[0] + ' +' + Z[p[1]] + ' 연결');
        });
        if (!left) clearInterval(iv);
    }, 500);
})();

// ==========================================
// 2·3. 압력계 — 더 빨리 차고, 장비가 덜 막는다
// ==========================================
//
// 감쇄 식은 함수 안에 있어 밖에서 못 건드린다.
// 그래서 그 함수가 도는 동안만 gearValue 를 눌러 둔다.
//   addInfect 는 (1 − heal×0.6) 을 쓰므로 heal 을 절반으로 주면
//   (1 − heal×0.3) 과 같아진다.
let inInfect = false, inLore = false;

(function hookGear() {
    const iv = setInterval(function () {
        if (typeof gearValue !== 'function') return;
        if (gearValue._zone) { clearInterval(iv); return; }

        const _g = gearValue;
        gearValue = function (user, attr) {
            const v = _g.apply(this, arguments);
            if (inInfect && attr === 'heal' && Z.healDiv > 1) return v / Z.healDiv;
            if (inLore && attr === 'gaze' && Z.gazeDiv > 1) return v / Z.gazeDiv;
            return v;
        };
        gearValue._zone = true;
        clearInterval(iv);
        console.log('[구역] 치유 ÷' + Z.healDiv + ' · 응시 ÷' + Z.gazeDiv + ' 연결');
    }, 500);
})();

(function hookInfect() {
    const iv = setInterval(function () {
        if (typeof addInfect !== 'function') return;
        if (addInfect._zone) { clearInterval(iv); return; }

        const _a = addInfect;
        addInfect = function (amount, reason) {
            if (amount > 0 && Z.infectUp && Z.infectUp !== 1) {
                amount = Math.max(1, Math.round(amount * Z.infectUp));
            }
            inInfect = true;
            try { return _a.call(this, amount, reason); }
            finally { inInfect = false; }
        };
        addInfect._zone = true;
        clearInterval(iv);
        console.log('[구역] 감염도 ×' + Z.infectUp + ' 연결');
    }, 500);
})();

(function hookLore() {
    const iv = setInterval(function () {
        if (typeof addLore !== 'function') return;
        if (addLore._zone) { clearInterval(iv); return; }

        const _a = addLore;
        addLore = function (amount, reason) {
            if (amount > 0 && Z.loreUp && Z.loreUp !== 1) {
                amount = Math.max(1, Math.round(amount * Z.loreUp));
            }
            inLore = true;
            try { return _a.call(this, amount, reason); }
            finally { inLore = false; }
        };
        addLore._zone = true;
        clearInterval(iv);
        console.log('[구역] 이해도 ×' + Z.loreUp + ' 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.zoneHardState = function () {
    const M = { D: 1.0, C: 1.5, B: 2.0, A: 2.8, S: 4.0, L: 6.0 };

    const inf = Object.keys(M).map(function (g) {
        const h = 0.25 * M[g];
        const before = (1 - h * 0.6);
        const after = (1 - h * 0.6 / Z.healDiv) * Z.infectUp;
        return {
            '치유': g,
            '전 — 들어가는 감염': (before * 100).toFixed(0) + '%',
            '후 — 들어가는 감염': (after * 100).toFixed(0) + '%',
            '배': (after / Math.max(0.01, before)).toFixed(1) + '배'
        };
    });

    const lore = Object.keys(M).map(function (g) {
        const v = Math.round(3 * M[g]);
        const before = (1 - v * 0.04);
        const after = (1 - v * 0.04 / Z.gazeDiv) * Z.loreUp;
        return {
            '응시': g,
            '전 — 들어가는 이해도': (before * 100).toFixed(0) + '%',
            '후 — 들어가는 이해도': (after * 100).toFixed(0) + '%',
            '배': (after / Math.max(0.01, before)).toFixed(1) + '배'
        };
    });

    console.log('%c===== S-003 · S-010 난이도 =====', 'color:#ff6b6b; font-size:13px');
    console.log('  설정:', JSON.stringify(Z));
    console.log('  S-003 DC: base+6 → base+' + (6 + Z.s003Dc) + '   ·   S-010 DC: base+5 → base+' + (5 + Z.s010Dc));
    console.log('');
    console.log('  S-010 감염도 (100 에 닿으면 끝)');
    console.table(inf);
    console.log('  S-003 이해도 (80 에 닿으면 동화됨)');
    console.table(lore);
    console.log('  연결 — s003DC:', (typeof s003DC === 'function' && s003DC._hard) ? 'O' : '✗',
        '· s010DC:', (typeof s010DC === 'function' && s010DC._hard) ? 'O' : '✗',
        '· 감염:', (typeof addInfect === 'function' && addInfect._zone) ? 'O' : '✗',
        '· 이해도:', (typeof addLore === 'function' && addLore._zone) ? 'O' : '✗',
        '· 장비:', (typeof gearValue === 'function' && gearValue._zone) ? 'O' : '✗');
    console.log('  숫자를 바꾸려면 — ZONE_HARD.infectUp = 2  처럼 고치고 다시 보세요.');
};

console.log('[구역] S-003 · S-010 난이도 조정 — zoneHardState()');

})();