// ==========================================
// ★ epic 어둠 — 구출은 어렵게, 즉사는 초반에
// bundles.json 마지막 묶음, epic-hard.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 둘을 바꾼다
//
//   ① 구출 — 치유 S~L 도 확정템도 없으면 거의 못 붙잡는다
//
//     epic-hard.js 가 올려 둔 뒤의 구제 성공률은 이렇다.
//
//         치유 없음 45%   D 45%   C 50%   B 50%   A 55%   S 60%   L 70%
//
//     맨손으로도 두 번에 한 번은 붙잡는다. 그래서 치유 장비를 올릴 까닭도,
//     확정템을 아껴 둘 까닭도 없었다. 그 둘이 없으면 판정에서 크게 깎는다.
//
//         치유 S~L 또는 확정템 있음   그대로 (S 60% · L 70%)
//         둘 다 없음                 판정 -7 — DC 12 기준 45% → 10%
//
//     확정템은 newitems2.js 의 rescueGuarantee() 가 보는 것 그대로다.
//     (은심장 10회 · ％＄＠＆ 이동장 · 종이배 · 전용 자전거 · 포승줄 · 통신 단추)
//
//   ② 즉사 — 초반에 몰아 준다
//
//     지금 즉사(die)가 붙은 선택지는 장면표 전체에 다섯 손가락이다.
//     그래서 epic 은 길고 밋밋했다. 초반 몇 걸음에 즉사를 몰아 둔다.
//
//         첫 세 번의 선택까지   실패하면 45% 로 그 자리에서 끝난다
//         그 뒤                 5% — 거의 뜨지 않는다
//
//     실제로 400번 돌려 재 보았다. (DC 11 짜리 선택지 · 맨몸)
//
//         한 사람이 초반 세 걸음 안에 쓰러질 확률   69%
//         다섯이 들어가 넷 이상이 쓰러질 확률       51%
//         쓰러진 자리 — 첫 번째 125 · 두 번째 100 · 세 번째 51
//
//     **다섯이 가면 두 번에 한 번은 넷이 초반에 눕는다.** 구출도 어려워졌으니
//     대개 거기서 끝난다. 더 험하게 하려면 earlyRate 를 올린다.
//     (0.55 면 한 사람 78% · 넷 이상 69% · 0.8 이면 96% 와 98% 였다)
//
//     잰 것은 장비 없는 몸으로 DC 11 짜리 선택지를 고른 400번이다.
//     장비를 갖춘 사원은 이보다 덜 죽는다.
//
//     원래 즉사가 붙어 있던 선택지는 그대로 즉사다. 건드리지 않는다.
//
// ■ 숫자는 아래 EPIC_GRIM 에서 바꾼다. 콘솔에서 바로 고쳐도 된다.
//       EPIC_GRIM.earlyRate = 0.5
//   epicGrimState() 로 지금 설정과 성공률을 본다.

window.EPIC_GRIM = {
    earlySteps:  3,     // 이 횟수째 선택까지를 「초반」으로 본다
    earlyRate:   0.45,  // 초반에 판정을 놓치면 이 확률로 즉사가 된다
    lateRate:    0.05,  // 그 뒤로는 이 확률
    weakPenalty: 7      // 치유 S~L 도 확정템도 없을 때 구출 판정에서 깎는 몫
};

(function epicGrim() {

const G = window.EPIC_GRIM;

// ==========================================
// 치유 S~L 을 들고 있나
// ==========================================
//
// gearValue 는 epic-hard.js 가 구제 동안 눌러 두므로 값으로 보면 안 된다.
// 등급 글자를 그대로 본다.
function healGrade(u) {
    try {
        if (typeof getGear !== 'function' || typeof gearAttrGrade !== 'function') return null;
        const g = getGear(u || currentUser);
        if (!g || !g.attrs || g.attrs.indexOf('heal') < 0) return null;
        return gearAttrGrade(g, 'heal');
    } catch (e) { return null; }
}
function hasHighHeal(u) {
    const g = healGrade(u);
    return g === 'S' || g === 'L';
}
function hasSure(u) {
    if (typeof rescueGuarantee !== 'function') return false;
    try { return !!rescueGuarantee(u); } catch (e) { return false; }
}
// 깎지 않아도 되는 사람인가
function strongHand(u) {
    return hasHighHeal(u) || hasSure(u);
}

// ==========================================
// ① 구출 — 맨손이면 크게 깎는다
// ==========================================
//
// 보정은 함수 안에서 계산되어 밖에서 못 건드린다. epic-hard.js 가 쓰던 수를
// 그대로 쓴다 — 구출이 도는 동안만 rollDarkBonus 를 눌러 둔다.
// (DC 를 올리는 것과 셈이 같다)
let weak = false;

(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._grim) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            const b = _r.apply(this, arguments);
            if (weak && G.weakPenalty) return b - G.weakPenalty;
            return b;
        };
        rollDarkBonus._grim = true;
        clearInterval(iv);
        console.log('[epic] 맨손 구출 -' + G.weakPenalty + ' 연결');
    }, 500);
})();

// 다른 파일(titles.js · newitems2.js)이 구출을 한 번 더 감싸므로, 우리 표가
// 맨 바깥에 남아 있지 않을 수 있다. 안쪽에 있어도 거쳐 가므로 따로 적어 둔다.
let hooked = false;

(function hookRescue() {
    const NAMES = ['epicRescue', 'epicDoomRescue'];
    const iv = setInterval(function () {
        let left = 0;
        NAMES.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._grim) return;
            const _o = f;
            window[n] = function () {
                weak = !strongHand(currentUser);
                try { return _o.apply(this, arguments); }
                finally {
                    // epicDoomRescue 는 안쪽이 once().then 이라 조금 더 열어 둔다
                    setTimeout(function () { weak = false; }, 2500);
                }
            };
            window[n]._grim = true;
        });
        if (!left) { hooked = true; clearInterval(iv); console.log('[epic] 구출 판정 연결'); }
    }, 500);
})();

// ==========================================
// ② 즉사 — 초반에 몰아 준다
// ==========================================
//
// 장면표(opts)는 한 번 만들어 두고 계속 쓰는 객체다. 그래서 die 를 영영
// 붙여 두면 안 된다. epicPick 이 도는 그 한 번 동안만 붙였다가 뗀다.
// (epicPick 안에서 epicDeath 까지 그 자리에서 끝나므로 이걸로 충분하다)
function lethalNow() {
    const idx = (typeof er !== 'undefined' && er) ? (Number(er.idx) || 0) : 0;
    const rate = (idx < G.earlySteps) ? G.earlyRate : G.lateRate;
    return Math.random() < rate;
}

(function hookPick() {
    const iv = setInterval(function () {
        if (typeof epicPick !== 'function') return;
        if (epicPick._grim) { clearInterval(iv); return; }

        const _p = epicPick;
        epicPick = function (i) {
            let o = null, added = false;
            try {
                const sc = (typeof er !== 'undefined' && er) ? er._sc : null;
                o = sc && sc.opts && sc.opts[i];
                if (o && !o.die && lethalNow()) { o.die = true; added = true; }
            } catch (e) { o = null; added = false; }

            try { return _p.apply(this, arguments); }
            finally { if (added && o) { try { delete o.die; } catch (e) { } } }
        };
        epicPick._grim = true;
        clearInterval(iv);
        console.log('[epic] 초반 즉사 ' + Math.round(G.earlyRate * 100) + '% 연결 (첫 '
            + G.earlySteps + '번)');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.epicGrimState = function () {
    console.log('%c===== epic · 구출과 즉사 =====', 'color:#ff8a65; font-size:13px');
    console.log('  설정:', JSON.stringify(G));

    const g = healGrade(currentUser);
    const sure = (typeof rescueGuarantee === 'function') ? (function () {
        try { return rescueGuarantee(currentUser); } catch (e) { return null; }
    })() : null;
    console.log('  내 치유 등급:', g || '없음', '· 확정템:', sure || '없음');
    console.log('  구출 판정:', strongHand(currentUser)
        ? '그대로 (치유 S~L 또는 확정템)'
        : ('-' + G.weakPenalty + ' (맨손)'));

    // DC 12 를 기준으로 본 성공률
    const show = function (pen) {
        const need = 12 + pen;
        const n = Math.max(0, Math.min(20, 21 - need));
        return Math.round(n / 20 * 100) + '%';
    };
    console.log('  DC 12 기준 — 치유 S~L·확정템:', show(0), '· 맨손:', show(G.weakPenalty));

    const idx = (typeof er !== 'undefined' && er) ? (Number(er.idx) || 0) : 0;
    console.log('  지금 선택 횟수:', idx, idx < G.earlySteps ? '(초반 — 즉사 ' + Math.round(G.earlyRate * 100) + '%)'
        : '(초반 지남 — 즉사 ' + Math.round(G.lateRate * 100) + '%)');

    const fail = 0.72;  // 400번 재 본 값 (장비 없는 몸 · DC 11 짜리 선택지)
    const per = 1 - Math.pow(1 - fail * G.earlyRate, G.earlySteps);
    const four = 5 * Math.pow(per, 4) * (1 - per) + Math.pow(per, 5);
    console.log('  초반에 쓰러질 확률 — 한 사람 약 ' + Math.round(per * 100) + '%'
        + ' · 다섯 중 넷 이상 약 ' + Math.round(four * 100) + '%');

    console.log('  연결 — epicPick:', (typeof epicPick === 'function' && epicPick._grim) ? 'O' : '✗',
        '· 구출 두 자리:', hooked ? 'O' : '✗');
};

console.log('[epic] 구출은 어렵게 · 즉사는 초반에 — epicGrimState()');

})();
