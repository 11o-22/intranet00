// ==========================================
// ★ 슬롯 — 행운이 손에 잡히게 · 착한 친구·유리손포 행운 100%
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 본래 자리에는 벽이 있었습니다
//
//   index.html:7937
//       let failChance  = Math.max(0.75, (부적 ? 0.78 : 0.80) / luckM);
//       let jackpotSpan = Math.min(0.05, (부적 ? 0.035 : 0.02) * luckM);
//
//   luckM 이 1 + (배수-1)/10 로 눌려 들어오는 데다, 배수가 조금만 넘으면
//   두 값이 바닥·천장에 닿습니다. 그 뒤로는 배수가 37,000 이 되든 숫자가
//   1도 안 움직입니다. 600% 나침반을 껴도 아무 일이 안 일어나던 까닭입니다.
//
// ■ 벽은 없앴는데, 올려도 티가 안 났습니다
//
//   곡선을 갈면서 몫을 **3개 일치 칸에만** 실어 두었습니다.
//
//       3개  = J0 + (JMAX - J0) × u      2.0% → 8.5%
//       2개  = TWO                       18%  에 못으로 박음
//       꽝   = 나머지                     79.9% → 73.5%
//
//   그래서 배수를 1 에서 무한으로 올려도 **꽝이 6%포인트밖에 안 줄었고**,
//   눈에 보이는 변화는 3개 일치가 아주 드물게 한 번 더 뜨는 것뿐이었습니다.
//   게다가 K 가 120 이라 u 가 느리게 올라, 돌려받는 몫이 100% 가 되는 자리가
//   **배수 43**(부적 있으면 29)이었습니다.
//
//   플러그 둘 + 루비 유두 + 감자맛 물약 + 유리구슬을 다 껴도 배수는 11 쯤입니다.
//   「눈을 감은 나침반」 같은 고유 600% 아이템이 없으면 **구조적으로 영원히
//   마이너스**였습니다. 행운을 많이 올려도 마이너스만 나오던 까닭입니다.
//
// ■ 고친 곡선 — 두 칸을 같이 올립니다
//
//       u    = 배수 / (배수 + K)          0 에서 1 로 오릅니다 (닿지는 않습니다)
//       3개  = J0   + (JMAX   - J0)   × u
//       2개  = TWO0 + (TWOMAX - TWO0) × u     ← 이쪽도 같이 오릅니다
//       꽝   = 나머지
//
//   2개 일치가 자주 뜨는 쪽이 **손에 잡히는 변화**입니다. 3개 일치는 드물어서
//   확률이 네 배가 되어도 체감되지 않습니다. 그래서 꼭대기에서 돌려받는 몫은
//   전과 같이 두고(135%), 그 몫을 두 칸에 나누어 실었습니다.
//   K 도 120 에서 28 로 내려, 본전이 **배수 11** 에서 섭니다.
//
//   부적(누군가가 쓴 부적 · 사원증 뱃지)은 배수를 1.5배로 쳐 줍니다.
//
// ■ 돌아가는 모양 (부적 없음)
//
//     조합                      배수      꽝      3개     2개   돌려받음   전에는
//     아무것도 없음                1    79.7%   2.12%   18.2%      89%     88%
//     도깨비 불만                  2    79.4%   2.23%   18.4%      91%     88%
//     고유 600% 하나               6    78.4%   2.61%   19.0%      96%     90%
//     감자맛 + 유리구슬             8    78.0%   2.77%   19.2%      98%     90%
//     ───────────────── 본전이 되는 자리 ─────────────────
//     플러그 둘 + 루비             11    77.5%   2.97%   19.6%     101%     91%
//     거기에 도깨비·감자맛          16    76.7%   3.25%   20.0%     105%     93%
//     고유 600% 를 더하면          63    73.8%   4.38%   21.8%     120%    104%
//     유리구슬까지              1,008    71.3%   5.35%   23.4%     134%    130%
//     전부 (뱃지 포함)          2,318    71.2%   5.40%   23.4%     134%    132%
//     한없이 올려도                 ∞    71.1%   5.44%   23.5%     135%    135%
//
//   꼭대기는 전과 같습니다. 달라진 것은 **거기까지 가는 길**입니다.
//   베팅 한도 5,000P · 하루 20번이므로 하루에 오갈 수 있는 몫은 그대로입니다.
//
// ■ 손잡이 넷 — 아래 상수만 고치면 됩니다
//
//   K        작을수록 적은 배수에서도 빨리 오릅니다
//              28 → 본전이 배수 11      120 → 본전이 배수 43
//   JMAX     3개 일치 꼭대기
//   TWOMAX   2개 일치 꼭대기 — 체감을 정하는 손잡이입니다
//   꼭대기에서 돌려받는 몫 = 3개 × 7.28 + 2개 × 4.05
//     (7.28 · 4.05 는 기호 가중치로 센 평균 배수입니다. 둘을 올리면
//      돌려받는 몫이 그만큼 커지므로, 한쪽을 올리면 다른 쪽을 내려야
//      135% 가 지켜집니다.)
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

const K = 28;             // 오르는 속도 — 작을수록 적은 배수에서 빨리 오른다
const J0 = 0.02;          // 아무것도 없을 때 3개 일치
const JMAX = 0.054;       // 한없이 올렸을 때 다가가는 3개 일치
const TWO0 = 0.18;        // 아무것도 없을 때 2개 일치
const TWOMAX = 0.235;     // 한없이 올렸을 때 다가가는 2개 일치
const AMULET = 1.5;       // 부적이 배수를 쳐 주는 몫

const NERF = ['착한 친구', '유리손포'];
const NERF_DIV = 4;       // 원래 ×4 였던 것을 ×1 로

function bands(mult, amulet) {
    const eff = Math.max(1, mult) * (amulet ? AMULET : 1);
    const u = eff / (eff + K);                      // 0 … 1 (닿지는 않는다)
    const j = J0 + (JMAX - J0) * u;
    const t = TWO0 + (TWOMAX - TWO0) * u;
    const f = Math.max(0.02, 1 - t - j);
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
        console.log('[슬롯] 행운이 손에 잡히는 곡선 — K=' + K
            + ' · 꼭대기 3개 ' + (JMAX * 100).toFixed(1) + '% · 2개 ' + (TWOMAX * 100).toFixed(1) + '%');
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

// 돌려받는 몫이 100% 가 되는 배수 — 상수를 고치면 이 값도 따라 움직인다
function breakEven(amulet) {
    const P = payouts();
    for (let m = 1; m <= 100000; m++) {
        const B = bands(m, amulet);
        if (B.jack * P.e3 + B.two * P.e2 >= 1) return m;
    }
    return '(없음)';
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
    console.log('  한없이 올리면 3개 ' + (JMAX * 100).toFixed(1) + '% · 2개 '
        + (TWOMAX * 100).toFixed(1) + '% · 돌려받음 '
        + ((JMAX * P.e3 + TWOMAX * P.e2) * 100).toFixed(0) + '% 로 다가갑니다. (닿지는 않습니다)');
    console.log('  본전이 되는 자리는 배수 ' + breakEven(amulet) + ' 쯤입니다.');
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
    console.log('  본전(100%)이 되는 자리는 배수 ' + breakEven(true) + ' 쯤입니다. (부적 없으면 '
        + breakEven(false) + ')');
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