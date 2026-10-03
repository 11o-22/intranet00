// ==========================================
// ★ epic 어둠 — 난이도 올리기 · 치유 등급 재조정
// index.html 에서 epic 파일들 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 왜 치유 L 이 긴장감을 없앴나
//
//   구제 판정(epicDoomRescue)의 보정은 이렇게 생겼다.
//       rollDarkBonus + (유대면 +3) + round(gearValue('heal') * 10)
//
//   gearValue 는 base 0.25 에 등급 배수를 곱한다. (D 1.0 … S 4.0, L 6.0)
//   그래서 치유 등급별 보정이 이렇게 된다.
//
//       D +3   C +4   B +5   A +7   S +10   L +15
//
//   DC 는 13 이다. S 만 돼도 자연 1 말고는 전부 성공한다.
//   L 의 +15 는 이미 넘치고도 남아서, 올려도 아무 차이가 없었다.
//
//       D 65%   C 70%   B 75%   A 85%   S 95%   L 95%
//
//   S 와 L 이 같은 95%. 등급을 올릴 이유도, 실패할 걱정도 없었다.
//
// ■ 무엇을 바꾸나
//
//   1. 모든 판정 DC 를 올린다            (아래 dcAdd)
//   2. 구제에서 치유 기여를 나눈다        (아래 healDiv)
//   3. 구제 판정만 DC 를 조금 더 올린다   (아래 rescueDc)
//   4. 손을 뻗을 수 있는 시간을 줄인다     (아래 doomTime)
//
//   바꾼 뒤 구제 성공률은 이렇게 된다.
//
//       D 45%   C 50%   B 50%   A 55%   S 60%   L 70%
//
//   등급 차이가 그대로 살아 있으면서, L 이라도 열 번에 세 번은 놓친다.
//
// ■ 숫자는 아래 EPIC_HARD 에서 바꾼다
//   콘솔에서 바로 고쳐 시험해 볼 수도 있다.
//       EPIC_HARD.dcAdd = 5
//   epicHardState() 로 지금 설정과 성공률 표를 본다.

window.EPIC_HARD = {
    dcAdd:     3,     // 모든 선택지 DC 에 더한다 (0 이면 그대로)
    healDiv:   2.5,   // 구제에서 치유 보정을 이 수로 나눈다 (1 이면 그대로)
    rescueDc:  2,     // 구제 판정에만 더 얹는 DC
    doomTime:  0.7    // 구제 제한시간 배수 (0.7 이면 70초 → 49초)
};

(function epicHard() {

const H = window.EPIC_HARD;

// ==========================================
// 1. 선택지 DC 올리기
// ==========================================
//
// 장면표는 한 번 만들어 두고 계속 쓰는 객체라, 올린 자리에 표시를 남겨
// 같은 선택지가 두 번 올라가지 않게 한다.
(function hookPick() {
    const iv = setInterval(function () {
        if (typeof epicPick !== 'function') return;
        if (epicPick._hard) { clearInterval(iv); return; }

        const _p = epicPick;
        epicPick = function (i) {
            try {
                const sc = (typeof er !== 'undefined' && er) ? er._sc : null;
                const o = sc && sc.opts && sc.opts[i];
                if (o && !o._hardDc && H.dcAdd) {
                    o.dc = (o.dc || 11) + H.dcAdd;
                    o._hardDc = true;
                }
            } catch (e) { }
            return _p.apply(this, arguments);
        };
        epicPick._hard = true;
        clearInterval(iv);
        console.log('[epic] 선택지 DC +' + H.dcAdd + ' 연결');
    }, 500);
})();

// ==========================================
// 2·3. 구제 판정 — 치유 기여를 줄이고 DC 를 얹는다
// ==========================================
//
// 보정은 함수 안에서 계산돼 밖에서 못 건드린다.
// 그래서 구제가 도는 동안만 gearValue 와 rollDarkBonus 를 눌러 둔다.
// DC 를 올리는 대신 보정을 깎는 것이라 결과는 같다.
let inRescue = false;

(function hookGear() {
    const iv = setInterval(function () {
        if (typeof gearValue !== 'function') return;
        if (gearValue._hard) { clearInterval(iv); return; }

        const _g = gearValue;
        gearValue = function (user, attr) {
            const v = _g.apply(this, arguments);
            if (inRescue && attr === 'heal' && H.healDiv > 1) return v / H.healDiv;
            return v;
        };
        gearValue._hard = true;
        clearInterval(iv);
        console.log('[epic] 구제 치유 기여 ÷' + H.healDiv + ' 연결');
    }, 500);
})();

(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._hard) { clearInterval(iv); return; }

        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            const b = _r.apply(this, arguments);
            if (inRescue && H.rescueDc) return b - H.rescueDc;   // DC 올린 것과 같다
            return b;
        };
        rollDarkBonus._hard = true;
        clearInterval(iv);
        console.log('[epic] 구제 DC +' + H.rescueDc + ' 연결');
    }, 500);
})();

// 구제가 도는 동안만 표시를 켠다
(function hookRescue() {
    const NAMES = ['epicRescue', 'epicDoomRescue'];
    const iv = setInterval(function () {
        let left = 0;
        NAMES.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._hard) return;
            const _o = f;
            window[n] = function () {
                inRescue = true;
                try { return _o.apply(this, arguments); }
                finally {
                    // epicDoomRescue 는 안쪽이 once().then 이라 조금 더 열어 둔다
                    setTimeout(function () { inRescue = false; }, 2500);
                }
            };
            window[n]._hard = true;
        });
        if (!left) { clearInterval(iv); console.log('[epic] 구제 판정 연결'); }
    }, 500);
})();

// ==========================================
// 4. 손 뻗을 시간 줄이기
// ==========================================
(function hookDoom() {
    const iv = setInterval(function () {
        if (typeof epicDoom !== 'function') return;
        if (epicDoom._hard) { clearInterval(iv); return; }

        const _d = epicDoom;
        epicDoom = function (cfg) {
            cfg = cfg || {};
            if (H.doomTime && H.doomTime !== 1) {
                cfg.sec = Math.max(20, Math.round((cfg.sec || 70) * H.doomTime));
            }
            return _d.call(this, cfg);
        };
        epicDoom._hard = true;
        clearInterval(iv);
        console.log('[epic] 구제 제한시간 ×' + H.doomTime + ' 연결');
    }, 500);
})();

// ==========================================
// 확인 — 지금 설정과 성공률
// ==========================================
window.epicHardState = function () {
    const MULT = { D: 1.0, C: 1.5, B: 2.0, A: 2.8, S: 4.0, L: 6.0 };
    const BASE = 0.25;
    const DC = 13;
    const ETC = 2;                        // rollDarkBonus 평균치로 잡은 값

    function pct(bonus, dc) {
        const need = dc - bonus;          // 이 눈 이상이면 성공
        const lo = Math.max(2, need);     // 자연 1 은 무조건 실패
        return Math.max(0, Math.min(20, 21 - lo)) / 20 * 100;
    }

    const rows = Object.keys(MULT).map(function (g) {
        const raw = BASE * MULT[g];
        const before = Math.round(raw * 10) + ETC;
        const after = Math.round(raw / (H.healDiv > 1 ? H.healDiv : 1) * 10) + ETC - H.rescueDc;
        return {
            '치유 등급': g,
            '보정 (전)': '+' + (before - ETC),
            '보정 (후)': '+' + Math.max(0, after - ETC + H.rescueDc) + ' − ' + H.rescueDc,
            '성공률 (전)': pct(before, DC).toFixed(0) + '%',
            '성공률 (후)': pct(after, DC).toFixed(0) + '%'
        };
    });

    console.log('%c===== epic 난이도 =====', 'color:#ff6b6b; font-size:13px');
    console.log('  설정:', JSON.stringify(H));
    console.log('  선택지 DC: 기본값에 +' + H.dcAdd);
    console.log('  구제 제한시간: 70초 → ' + Math.max(20, Math.round(70 * H.doomTime)) + '초');
    console.log('');
    console.log('  구제 판정 (DC ' + DC + ', 기타 보정 +' + ETC + ' 가정)');
    console.table(rows);
    console.log('  연결 — 선택지:', (typeof epicPick === 'function' && epicPick._hard) ? 'O' : '✗',
        '· 치유:', (typeof gearValue === 'function' && gearValue._hard) ? 'O' : '✗',
        '· 보정:', (typeof rollDarkBonus === 'function' && rollDarkBonus._hard) ? 'O' : '✗',
        '· 구제:', (typeof epicDoomRescue === 'function' && epicDoomRescue._hard) ? 'O' : '✗',
        '· 시간:', (typeof epicDoom === 'function' && epicDoom._hard) ? 'O' : '✗');
    console.log('  숫자를 바꾸려면 — EPIC_HARD.dcAdd = 5  처럼 고치고 다시 보세요.');
};

console.log('[epic] 난이도 조정 — epicHardState()');

})();