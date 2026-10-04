// ==========================================
// ★ 슬롯 — 상한을 없애고 배수에 비례하게 · 착한 친구·유리손포 행운 100%
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 지금은 배수 16에서 벽에 부딪힙니다
//
//   index.html:7780
//       let failChance  = Math.max(0.22, (부적 ? 0.55 : 0.76) / luckM);
//       let jackpotSpan = Math.min(0.18, (부적 ? 0.08 : 0.025) * luckM);
//
//   facilityLuckMult 가 16만 넘으면 두 값이 바닥·천장에 닿습니다.
//   그 뒤로는 배수가 37,000 이 되든 숫자가 1도 안 움직입니다.
//   600% 나침반을 껴도 아무 일이 안 일어나던 까닭입니다.
//
// ■ 새 곡선 — 벽이 없습니다
//
//       u    = 배수 / (배수 + K)          0 에서 1 로 천천히 오릅니다
//       3개  = J0 + (JMAX - J0) × u       배수가 오를수록 꽝이 3개 일치로 바뀝니다
//       2개  = TWO                        고정
//       꽝   = 나머지
//
//   u 가 1 에 닿지 않으므로 배수를 한없이 올려도 JMAX 를 넘지 않습니다.
//   벽은 없는데 끝없이 커지지도 않습니다. 올릴수록 계속 좋아지기만 합니다.
//
//   부적(누군가가 쓴 부적 · 사원증 뱃지)은 배수를 1.5배로 쳐 줍니다.
//
// ■ 돌아가는 모양 (부적 있음 · 40만 번 돌려 맞춰 봤습니다)
//
//     조합                      배수      꽝      3개     2개   돌려받음
//     아무것도 없음                1    79.9%    2.1%   18.0%     88%
//     도깨비 불만                  2    79.8%    2.2%   18.0%     89%
//     고유 600% 하나               6    79.6%    2.5%   18.0%     91%
//     감자맛 + 유리구슬             8    79.4%    2.6%   18.0%     92%
//     플러그 둘 + 루비             11    79.2%    2.8%   18.0%     93%
//     ───────────────── 본전이 되는 자리 ─────────────────
//     거기에 고유 600%            63    77.1%    4.9%   18.0%    108%
//     도깨비·감자맛까지           252    75.1%    6.9%   18.0%    123%
//     유리구슬까지              1,008    74.0%    8.0%   18.0%    131%
//     전부 (뱃지 포함)          2,318    73.7%    8.3%   18.0%    133%
//     한없이 올려도                 ∞    73.5%    8.5%   18.0%    135%  ← 닿지는 않습니다
//
//   본전(100%)이 되는 자리는 배수 29쯤입니다.
//   꽉 채워 껴도 133%, 즉 1,000P 넣으면 길게 보아 1,330P 가 돌아옵니다.
//   지금은 374% 였습니다.
//
// ■ 손잡이 두 개 — 아래 상수만 고치면 됩니다
//
//   K      작을수록 적은 배수에서도 빨리 오릅니다
//            120 → 본전이 배수 29쯤      300 → 본전이 배수 75쯤
//   JMAX   꼭대기를 정합니다
//            0.085 → 135%    0.06 → 117%    0.04 → 102%
//
// ■ 착한 친구 · 유리손포 — 행운 100%
//
//   dark.js:4487~4488 의 ×4 두 개를 여기서 되돌립니다. 파일은 안 건드립니다.
//   곱셈은 어디서 나누어도 결과가 같으므로 순서를 걱정할 일이 없습니다.
//
//     꽉 채운 배수   37,094  →  2,318
//
//   두 아이템의 다른 효과(어둠 판정 +2 · 기믹 단서 · 회피)는 그대로 남습니다.
//   행운은 공용시설(슬롯·블랙잭·섯다·룰렛·하이로우)에만 쓰이므로
//   어둠 탐사 판정은 아무 영향을 받지 않습니다.

(function slotCurve() {

const K = 120;            // 오르는 속도
const J0 = 0.02;          // 아무것도 없을 때 3개 일치
const JMAX = 0.085;       // 한없이 올렸을 때 다가가는 3개 일치
const TWO = 0.18;         // 2개 일치 — 고정
const AMULET = 1.5;       // 부적이 배수를 쳐 주는 몫

const NERF = ['착한 친구', '유리손포'];
const NERF_DIV = 4;       // 원래 ×4 였던 것을 ×1 로

function bands(mult, amulet) {
    const eff = Math.max(1, mult) * (amulet ? AMULET : 1);
    const u = eff / (eff + K);                      // 0 … 1 (닿지는 않는다)
    const j = J0 + (JMAX - J0) * u;
    const f = Math.max(0.02, 1 - TWO - j);
    return { eff: eff, u: u, fail: f, jack: j, two: 1 - f - j };
}
window._slotBands = bands;

// hasEquip 과 같은 것 — dark.js:4468
function has(u, name) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    if (typeof canWearItem === 'function' && !canWearItem(u, name)) return false;
    return u.equippedWeapons.some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}

// ==========================================
// 1. 착한 친구 · 유리손포 행운을 100% 로
// ==========================================
(function nerf() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._nerf) { clearInterval(iv); return; }

        const _f = facilityLuckMult;
        facilityLuckMult = function (user) {
            let m = _f.apply(this, arguments);
            const u = user || (typeof currentUser !== 'undefined' ? currentUser : null);
            if (!u) return m;
            NERF.forEach(function (n) { if (has(u, n)) m /= NERF_DIV; });
            return Math.max(1, m);
        };
        facilityLuckMult._nerf = true;
        clearInterval(iv);
        console.log('[행운] 착한 친구 · 유리손포 → 100%');
    }, 400);
})();

// ==========================================
// 2. 슬롯 — 상한을 없앤 곡선
// ==========================================
(function swap() {
    const iv = setInterval(function () {
        if (typeof playSlot !== 'function') return;
        if (playSlot._curve) { clearInterval(iv); return; }
        try {
            if (typeof slotSymbols === 'undefined' || typeof pickSlotSymbol !== 'function') return;
        } catch (e) { return; }

        playSlot = function () {
            let bet = parseInt(document.getElementById('slot-bet').value);
            if (isNaN(bet) || bet <= 0) { showCustomAlert('베팅 금액을 입력해주세요.'); return; }
            const slotCap = BET_CAPS['slot-bet'];
            if (bet > slotCap) { showCustomAlert('슬롯 최대 베팅 한도는 ' + slotCap.toLocaleString() + ' P입니다.'); return; }
            if (bet > currentUser.points) { showLuxuryAlert(); return; }
            if (!useFacility(bet)) return;

            const btn = document.getElementById('btn-slot');
            btn.disabled = true;
            const b1 = document.getElementById('slot-box-1');
            const b2 = document.getElementById('slot-box-2');
            const b3 = document.getElementById('slot-box-3');
            const msg = document.getElementById('slot-msg');
            b1.classList.add('slot-rolling'); b2.classList.add('slot-rolling'); b3.classList.add('slot-rolling');
            msg.innerText = '릴이 회전하고 있습니다...';

            const hasAmulet = (currentUser.equippedWeapons || []).some(function (w) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                return base === '누군가가 쓴 부적' || base === '사원증 뱃지';
            });

            // ★ 여기만 달라집니다 — 벽이 없습니다
            const B = bands(facilityLuckMult(currentUser), hasAmulet);

            const rollType = Math.random();
            let res1, res2, res3;
            if (rollType < B.fail) {
                // 완전 꽝 (3개 다름)
                const shuffled = slotSymbols.slice().sort(function () { return 0.5 - Math.random(); });
                res1 = shuffled[0]; res2 = shuffled[1]; res3 = shuffled[2];
            } else if (rollType < B.fail + B.jack) {
                // 대박 (3개 일치)
                const s = pickSlotSymbol(); res1 = s; res2 = s; res3 = s;
            } else {
                // 본전 (2개 일치)
                const matchSym = pickSlotSymbol();
                let otherSym = pickSlotSymbol();
                while (otherSym.char === matchSym.char) { otherSym = pickSlotSymbol(); }
                const pos = Math.floor(Math.random() * 3);
                if (pos === 0) { res1 = otherSym; res2 = matchSym; res3 = matchSym; }
                else if (pos === 1) { res1 = matchSym; res2 = otherSym; res3 = matchSym; }
                else { res1 = matchSym; res2 = matchSym; res3 = otherSym; }
            }

            const roll1 = setInterval(function () { b1.innerText = slotSymbols[Math.floor(Math.random() * 6)].char; }, 70);
            const roll2 = setInterval(function () { b2.innerText = slotSymbols[Math.floor(Math.random() * 6)].char; }, 70);
            const roll3 = setInterval(function () { b3.innerText = slotSymbols[Math.floor(Math.random() * 6)].char; }, 70);

            setTimeout(function () { clearInterval(roll1); b1.classList.remove('slot-rolling'); b1.innerText = res1.char; }, 700);
            setTimeout(function () { clearInterval(roll2); b2.classList.remove('slot-rolling'); b2.innerText = res2.char; }, 1300);
            setTimeout(function () {
                clearInterval(roll3); b3.classList.remove('slot-rolling'); b3.innerText = res3.char;
                if (res1.char === res2.char && res2.char === res3.char) {
                    const prize = bet * res1.mult; winPoints(prize);
                    msg.innerHTML = '<span style="color:#4CAF50;">[3개 일치] ' + res1.char
                        + ' 잭팟! ×' + res1.mult + ' 배</span>';
                    addHistoryLog(currentUser, '[슬롯 대박] ' + res1.char + ' 3개 적중 (+' + prize + ' P)');
                } else if (res1.char === res2.char || res2.char === res3.char || res1.char === res3.char) {
                    const matched = (res1.char === res2.char) ? res1 : (res2.char === res3.char ? res2 : res1);
                    const multiplier = Math.max(1, Math.round(matched.mult * 0.5));
                    const prize = bet * multiplier; winPoints(prize);
                    msg.innerHTML = '<span style="color:#ffd700;">[2개 일치] ' + matched.char
                        + ' 적중! (×' + multiplier + ') 지급</span>';
                    addHistoryLog(currentUser, '[슬롯 승리] ' + matched.char + ' 2개 적중 (+' + prize + ' P)');
                } else {
                    msg.innerHTML = '<span style="color:#f44336;">완전 불일치. (-' + bet + ' P)</span>';
                    addHistoryLog(currentUser, '[슬롯 패배] 릴 불일치 (-' + bet + ' P)');
                }
                msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                btn.disabled = false;
            }, 1900);
        };
        playSlot._curve = true;
        clearInterval(iv);
        console.log('[슬롯] 상한을 없앤 곡선 — K=' + K + ' · 꼭대기 3개 ' + (JMAX * 100).toFixed(1) + '%');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
function payouts() {
    const SY = (typeof slotSymbols !== 'undefined') ? slotSymbols : [];
    const tw = SY.reduce(function (a, s) { return a + s.weight; }, 0) || 1;
    return {
        e3: SY.reduce(function (a, s) { return a + s.weight * s.mult; }, 0) / tw,
        e2: SY.reduce(function (a, s) { return a + s.weight * Math.max(1, Math.round(s.mult * 0.5)); }, 0) / tw
    };
}

window.slotOdds = function (mult) {
    const amulet = !!(currentUser && (currentUser.equippedWeapons || []).some(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        return b === '누군가가 쓴 부적' || b === '사원증 뱃지';
    }));
    const L = (mult != null) ? mult
        : ((typeof facilityLuckMult === 'function' && currentUser) ? facilityLuckMult(currentUser) : 1);
    const B = bands(L, amulet);
    const P = payouts();

    console.log('%c===== 슬롯 =====', 'color:#ffd700; font-size:13px');
    console.log('  행운 배수:', Math.round(L).toLocaleString(), amulet ? '· 부적 있음 (×1.5)' : '· 부적 없음');
    console.table([{
        '꽝': (B.fail * 100).toFixed(1) + '%',
        '3개 일치': (B.jack * 100).toFixed(1) + '%',
        '2개 일치': (B.two * 100).toFixed(1) + '%',
        '돌려받는 비율': ((B.jack * P.e3 + B.two * P.e2) * 100).toFixed(0) + '%'
    }]);
    console.log('  한없이 올리면 3개 ' + (JMAX * 100).toFixed(1) + '% · 돌려받음 '
        + ((JMAX * P.e3 + TWO * P.e2) * 100).toFixed(0) + '% 로 다가갑니다. (닿지는 않습니다)');
    console.log('  slotOdds(63) 처럼 배수를 넣어 견줘 볼 수 있습니다. 표는 slotTable()');
};

window.slotTable = function () {
    const P = payouts();
    console.log('%c===== 배수별 슬롯 (부적 있음) =====', 'color:#ffd700; font-size:13px');
    console.table([1, 2, 6, 8, 11, 29, 63, 252, 1008, 2318].map(function (L) {
        const B = bands(L, true);
        return {
            '행운 배수': L.toLocaleString(),
            '꽝': (B.fail * 100).toFixed(1) + '%',
            '3개': (B.jack * 100).toFixed(1) + '%',
            '2개': (B.two * 100).toFixed(1) + '%',
            '돌려받음': ((B.jack * P.e3 + B.two * P.e2) * 100).toFixed(0) + '%'
        };
    }));
    console.log('  본전(100%)이 되는 자리는 배수 29쯤입니다.');
};

// 내 행운 배수가 어디서 나오는지 쪼개 본다
window.luckWhy = function () {
    const u = currentUser;
    if (!u) return;
    const eff = u.timedEffects || [];
    const rows = [
        ['착한 친구', has(u, '착한 친구') ? '×1 (낮춤)' : '—'],
        ['유리손포', has(u, '유리손포') ? '×1 (낮춤)' : '—'],
        ['도깨비 불', has(u, '도깨비 불') ? '×2' : '—'],
        ['사원증 뱃지', has(u, '사원증 뱃지') ? '×1.15 · 부적 몫도 함께' : '—'],
        ['누군가가 쓴 부적', has(u, '누군가가 쓴 부적') ? '배수 ×1.5' : '—'],
        ['감자맛 물약', eff.some(function (e) { return e.name === '감자맛 물약'; }) ? '×2' : '—'],
        ['유리구슬', eff.some(function (e) { return e.name === '유리구슬'; }) ? '×4' : '—']
    ];
    console.log('%c===== 행운 배수 =====', 'color:#ffd700; font-size:13px');
    console.table(rows.map(function (r) { return { 출처: r[0], 몫: r[1] }; }));
    console.log('  합친 배수:', Math.round(facilityLuckMult(u)).toLocaleString());
    console.log('  (다이아 플러그 · 루비 피어싱 · 아이의 운 · 고유 선물은 조건이 복잡해 빼 두었습니다)');
};

console.log('[슬롯] slotOdds() · slotOdds(배수) · slotTable() · luckWhy()');

})();