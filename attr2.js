// ==========================================
// ★ 새 속성 두 가지 — 『보정』 과 『굳건』
// bundles.json 마지막 묶음, dark.js · epic.js 다음
// ==========================================
//
// ■ 보정 (fix)  ✚
//
//   **자기만 빼고 같은 파티 사람 모두**의 판정에 더해 준다.
//
//   ✗ 여태 속성은 **전부 제 것만** 봤다. 쓰이는 자리 아흔여섯 곳이
//     하나같이 gearValue(currentUser, …) 였다. 보정은 그 틀을 처음으로
//     깨는 것이라, 남의 장비를 읽어 오는 길을 따로 냈다 (othersFix).
//
//   나에게는 아무 몫도 없다. 자리 하나를 남에게 내주는 속성이다.
//
//   ★ 여럿이 차면 겹쳐 쌓인다. 다섯이 L 을 차면 +30 이 되어 판이
//     무너지므로 **모두 합쳐 최대 CAP(+8)** 까지만 든다.
//
// ■ 굳건 (steady)  ▣
//
//   ㄱ. 탐사에 드는 **포만감**이 덜 깎인다 (applyDarkSatiety).
//   ㄴ. **격리 시간**이 줄어든다 (여우상담실·목욕탕, 입원도 같다).
//
//   둘 다 지금 속성이 한 번도 안 건드린 자리다 — 치유는 오염도만 본다.
//
//   ★ 격리는 여러 곳에서 걸린다 (질문 절차 끝 · 즉사 입원 · 오염 100 …).
//     그 자리를 하나하나 고치는 대신, **걸린 뒤에 한 번 깎는다.**
//     깎은 값을 qSteadyAt 에 적어 두어 같은 격리를 두 번 깎지 않는다.
//
// ■ 수치 (D등급 기준 · 등급 배율 GEAR_MULT 가 곱해진다)
//
//        보정   +1   (D +1 · B +2 · S +4 · L +6)   ← 남들 판정에
//        굳건   0.15 (D 15% · B 30% · S 60% · L 90%)
//                     포만감 깎임을 그만큼 덜 깎고,
//                     격리는 그 값 × STEADY_H(6시간) 만큼 줄인다
//                     (D 0.9시간 · S 3.6시간 · L 5.4시간)

(function attr2() {

const FIX = 'fix', STEADY = 'steady';
const FIX_CAP = 8;              // 파티에서 받는 보정의 윗마개
const STEADY_H = 6;             // 굳건 1.0 일 때 줄어드는 격리 시간(시간)

// ==========================================
// 속성 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof GEAR_ATTRS === 'undefined' || typeof GEAR_BASE === 'undefined') return;
        clearInterval(iv);
        GEAR_ATTRS[FIX] = { name: '보정', icon: '✚',
            desc: '같은 파티 **다른 사람들**의 판정에 보정이 더해집니다. 자신에게는 들지 않습니다.' };
        GEAR_ATTRS[STEADY] = { name: '굳건', icon: '▣',
            desc: '탐사에 드는 포만감이 덜 깎이고, 격리 시간이 줄어듭니다.' };
        GEAR_BASE[FIX] = 1;
        GEAR_BASE[STEADY] = 0.15;
        try {
            if (typeof EPIC_ATTR_NAME !== 'undefined') {
                EPIC_ATTR_NAME[FIX] = '보정'; EPIC_ATTR_NAME[STEADY] = '굳건';
            }
            if (typeof EPIC_ATTR_ICON !== 'undefined') {
                EPIC_ATTR_ICON[FIX] = '✚'; EPIC_ATTR_ICON[STEADY] = '▣';
            }
        } catch (e) { }
        console.log('[속성] 보정 ✚ · 굳건 ▣ 등록');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function val(u, a) {
    try { return (typeof gearValue === 'function') ? (gearValue(u, a) || 0) : 0; }
    catch (e) { return 0; }
}
function me_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }

// ==========================================
// 보정 — 같은 파티의 **남들** 것을 모은다
// ==========================================
//
//   파티 명단은 darkParties[darkRun.partyId].members 다. 사원 칸(db.users)
//   에 soulGear 가 들어 있어 남의 장비도 그대로 읽힌다.
//   혼자 하는 탐사에서는 더할 것이 없다 (0).
function othersFix() {
    const u = me_(); if (!u) return 0;
    let pid = null;
    try { pid = (typeof darkRun !== 'undefined' && darkRun) ? darkRun.partyId : null; } catch (e) { }
    if (!pid) return 0;
    let p = null;
    try { p = (typeof darkParties !== 'undefined' && darkParties) ? darkParties[pid] : null; } catch (e) { }
    if (!p || !p.members) return 0;
    let book = {};
    try { book = (typeof db !== 'undefined' && db.users) ? db.users : {}; } catch (e) { }
    let sum = 0;
    Object.keys(p.members).forEach(function (c) {
        if (c === u.code) return;                  // ★ 자신은 뺀다
        const o = book[c];
        if (!o) return;
        sum += val(o, FIX);
    });
    return Math.min(FIX_CAP, Math.round(sum));
}
window.darkFixBonus = othersFix;

// rollDarkBonus 에 얹는다 — 판정 보정은 모두 이 한 곳을 지난다
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._fix) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            let b = 0;
            try { b = _r.apply(this, arguments) || 0; } catch (e) { b = 0; }
            return b + othersFix();
        };
        rollDarkBonus._fix = true;
        try { window.rollDarkBonus = rollDarkBonus; } catch (e) { }
        clearInterval(iv);
        console.log('[속성] 보정 — 판정에 연결');
    }, 500);
})();

// ==========================================
// 굳건 ㄱ — 탐사에 드는 포만감
// ==========================================
//
//   applyDarkSatiety 가 구역 등급만큼 깎는다. 깎기 **전후를 재서**
//   굳건만큼 돌려준다 — 깎는 셈을 베껴 쓰지 않으려는 것이다
//   (구역 표가 바뀌어도 따라간다).
(function hookSatiety() {
    const iv = setInterval(function () {
        if (typeof applyDarkSatiety !== 'function') return;
        if (applyDarkSatiety._steady) { clearInterval(iv); return; }
        const _a = applyDarkSatiety;
        applyDarkSatiety = function () {
            const u = me_();
            const before = (u && u.satiety != null) ? u.satiety : null;
            const r = _a.apply(this, arguments);
            try {
                if (u && before != null) {
                    const cut = before - (u.satiety != null ? u.satiety : before);
                    const k = Math.min(0.95, val(u, STEADY));
                    if (cut > 0 && k > 0) {
                        u.satiety = Math.min(100, u.satiety + Math.round(cut * k));
                    }
                }
            } catch (e) { }
            return r;
        };
        applyDarkSatiety._steady = true;
        try { window.applyDarkSatiety = applyDarkSatiety; } catch (e) { }
        clearInterval(iv);
        console.log('[속성] 굳건 — 탐사 포만감에 연결');
    }, 500);
})();

// ==========================================
// 굳건 ㄴ — 격리 시간
// ==========================================
//
//   격리가 **새로 걸린 것**을 보면 한 번 깎는다. 깎은 뒤의 시각을
//   qSteadyAt 에 적어, 같은 격리를 거듭 깎지 않는다.
//   ✗ 격리를 거는 자리마다 고치지 않았다 — 여섯 군데가 넘고, 앞으로
//     늘어도 여기 하나면 따라간다.
function trimQuarantine() {
    const u = me_(); if (!u) return;
    const until = u.quarantineUntil || 0;
    if (!until || until <= Date.now()) return;
    if (u.qSteadyAt === until) return;                  // 이미 본 격리다
    const k = val(u, STEADY);
    if (k <= 0) { u.qSteadyAt = until; return; }        // 굳건이 없다 — 보기만 하고 둔다
    const cut = k * STEADY_H * 3600000;
    const next = Math.max(Date.now() + 60000, until - cut);
    if (next >= until) { u.qSteadyAt = until; return; }
    u.quarantineUntil = next;
    u.qSteadyAt = next;
    const h = Math.round((until - next) / 360000) / 10;
    if (typeof addHistoryLog === 'function') {
        try { addHistoryLog(u, '[굳건] 격리 시간이 ' + h + '시간 줄었습니다.'); } catch (e) { }
    }
    if (typeof saveFields === 'function') {
        try { saveFields({ quarantineUntil: 1, qSteadyAt: 1, history: 1 }); } catch (e) { }
    } else if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    console.log('%c[굳건] 격리 ' + h + '시간 줄었습니다.', 'color:#4CAF50');
}
setInterval(trimQuarantine, 2000);
window.steadyTrim = trimQuarantine;

// ==========================================
// 콘솔
// ==========================================
window.attr2State = function () {
    const u = me_(); if (!u) { console.warn('로그인 뒤에 보십시오.'); return; }
    console.log('%c===== 보정 ✚ · 굳건 ▣ =====', 'color:#d4af37; font-size:13px');
    console.log('  내 보정 (남에게 가는 몫)  ' + val(u, FIX));
    console.log('  내 굳건                  ' + val(u, STEADY).toFixed(2)
        + '  (포만감 ' + Math.round(val(u, STEADY) * 100) + '% 덜 깎임 · 격리 -'
        + (Math.round(val(u, STEADY) * STEADY_H * 10) / 10) + '시간)');
    console.log('  지금 파티에서 받는 보정   +' + othersFix() + '  (윗마개 +' + FIX_CAP + ')');
};

console.log('[속성] attr2 — attr2State() 로 지금 값을 봅니다');

})();
