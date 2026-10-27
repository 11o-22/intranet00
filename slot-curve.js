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
// ■ 고친 곡선 — 맨몸은 딱 본전, 위는 하루 상한으로 묶는다
//
//       u    = 배수 / (배수 + K)          0 에서 1 로 오릅니다 (닿지는 않습니다)
//       3개  = J0   + (JMAX   - J0)   × u
//       2개  = TWO0 + (TWOMAX - TWO0) × u     ← 이쪽도 같이 오릅니다
//       꽝   = 나머지
//
//   ★ 곡선만으로는 「하루 최대 얼마」를 못 묶습니다. 두 가지가 걸립니다.
//
//     ① 판수가 사람마다 다릅니다. 공용시설 한도는 천장이 30회인데 고유
//        아이템과 은화 뱀 몫은 **천장 밖**이라(count-cap.js:123) 꽉 채운
//        사원은 쉰 판 넘게 돌립니다. 하루 20판으로 셈해 두면 어긋납니다.
//     ② 한 판에 🫀 세 개가 뜨면 20,000P × 40 = 800,000P 입니다. 기대값이
//        얼마든 운이 좋은 날은 훌쩍 넘습니다.
//
//     그래서 **하루에 번 몫을 따로 세어 DAY_CAP 에서 끊습니다.** 곡선은
//     「길게 보면 얼마」를 정하고, 상한은 「하루에 최대 얼마」를 못 박습니다.
//
//   ★ 한때 곡선을 깎으면서 상한까지 같이 달았던 적이 있습니다. 둘 중
//     하나면 될 일을 둘 다 걸어서, 아이템을 모은 보람이 같이 사라졌습니다.
//     (배수 11 에서 당첨 40.7% → 32.3% · 돌려받음 164% → 115%)
//     하루 벌이를 묶는 일은 **상한이 혼자 다 합니다.** 판수와 운에
//     상관없이 정확히 끊어 주기 때문입니다. 그래서 곡선은 도로 올리고,
//     꼭대기는 상한에게 맡깁니다.
//
//   잡은 자리가 세 군데입니다.
//
//       맨몸(배수 1)     돌려받음 **딱 100%**   — 본전만 찾습니다
//       풀 행운(배수 ∞)  돌려받음 **350%**
//       하루 상한        **1,000,000 P**       — 판수·운과 무관합니다
//
//   TWO0 와 TWOMAX 는 손으로 고른 값이 아니라 풀어 낸 값입니다.
//
//       TWOMAX = (3.50 − JMAX × 7.28) / 3.14      ← 꼭대기 돌려받음
//       TWO0   : 100% = j(1) × 7.28 + t(1) × 3.14 ← 맨몸이 본전
//
//   고친 뒤 slotOdds() 로 배수 1 이 100% · 배수 ∞ 가 350% 인지 보면 됩니다.
//
//       기호         🫀    🫁    👁   🦵🏼   🖐🏻   👂🏻
//       3개 일치    ×40   ×25   ×15   ×8    ×5    ×3     ← 적어 둔 표 그대로입니다
//       2개 일치    ×18   ×11    ×7   ×4    ×2    ×1     ← TWO_PAY 0.45 (평균 ×3.14)
//
//   부적(누군가가 쓴 부적 · 사원증 뱃지)은 배수를 1.5배로 쳐 줍니다.
//
// ■ 돌아가는 모양 (부적 없음 · 한 판 20,000P)
//
//     조합                      배수      꽝      3개     2개    당첨   돌려받음    20판      50판
//     아무것도 없음                1   71.9%   2.83%   25.3%   28.1%    100%       ±0        ±0
//     고유 600% 하나               6   64.7%   6.24%   29.1%   35.3%    137% +147,083  +367,706
//     플러그 둘 + 루비             11   59.3%   8.77%   31.9%   40.7%    164% +256,423  +641,058
//     거기에 도깨비·감자맛          16   55.2%  10.73%   34.1%   44.8%    185% +340,914  +852,285
//     고유 600% 하나 더            30   47.3%  14.41%   38.2%   52.7%    225% +499,989  +1,000,000 ←상한
//     둘 더                       63   38.5%  18.62%   42.9%   61.5%    270% +681,290  +1,000,000 ←상한
//     유리구슬까지                252   27.9%  23.60%   48.5%   72.1%    324% +896,379  +1,000,000 ←상한
//     전부 (뱃지 포함)          2,318   23.4%  25.71%   50.9%   76.6%    347% +987,581  +1,000,000 ←상한
//     한없이 올려도                 ∞   22.8%  26.00%   51.2%   77.2%    350% +999,941  +1,000,000 ←상한
//
//   길게 보면 배수 30 위부터는 쉰 판에서 상한에 걸립니다. 곡선이 아니라
//   **상한이 하루 벌이를 못 박습니다** — 운이 아주 좋은 날도 똑같이 100만에서
//   끊깁니다. 그래서 곡선은 「얼마나 자주 맞느냐」만 맡으면 됩니다.
//
// ■ 하루 상한이 도는 모양
//
//   하루에 **번 몫**(건 돈을 뺀 순이익)을 u.slotNet 에 세어 둡니다.
//   진 판은 음수로 더하므로, 잃고 나면 그만큼 천장이 다시 열립니다.
//   천장에 닿은 판도 **건 돈은 돌려줍니다** — 당첨인데 손해를 보는 것은
//   말이 안 되기 때문입니다. 깎인 몫은 화면과 기록에 적습니다.
//   날짜가 바뀌면 0 에서 다시 셉니다.
//
// ■ 손잡이 일곱 — 아래 상수만 고치면 됩니다
//
//   K        작을수록 적은 배수에서도 빨리 오릅니다 (28 · 맨 처음에는 120)
//   J0       맨몸 3개 일치 · JMAX    꼭대기 3개 일치
//   TWO0     맨몸 2개 일치 — 맨몸을 본전에 세우는 값 (풀어서 넣습니다)
//   TWOMAX   꼭대기 2개 일치 — 꼭대기 돌려받음을 정하는 값 (풀어서 넣습니다)
//   TWO_PAY  2개 일치 배당
//   DAY_CAP  하루에 벌 수 있는 몫 — 여기만 고치면 천장이 바뀝니다
//
//   돌려받는 몫 = 3개 × 7.28 + 2개 × (TWO_PAY 로 셈한 평균)
//     7.28 은 기호 가중치로 센 3개 일치 평균 배수입니다. TWO_PAY 0.5 → 평균
//     4.05 · 0.45 → 3.14 · 0.4 → 2.80 · 0.3 → 2.37 · 0.25 → 1.86 입니다.
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
const JMAX = 0.26;        // 한없이 올렸을 때 다가가는 3개 일치
const TWO0 = 0.2437;      // 아무것도 없을 때 2개 일치 — 맨몸이 딱 본전이 되는 값
const TWOMAX = 0.5118;    // 한없이 올렸을 때 다가가는 2개 일치 — 꼭대기 돌려받음을 정한다
const DAY_CAP = 1000000;  // 하루에 슬롯으로 벌 수 있는 몫 (판수·운과 무관한 천장)
const TWO_PAY = 0.45;     // 2개 일치 배당 — 기호 배수의 이만큼 (반올림, 적어도 1)
const AMULET = 1.5;       // 부적이 배수를 쳐 주는 몫 (하나마다)
const AMULET_MAX = 2;     // 부적 · 사원증 뱃지는 두 개까지만 겹친다 (장착도 둘까지 — amulet-stack.js)

const NERF = ['착한 친구', '유리손포'];
const NERF_DIV = 4;       // 원래 ×4 였던 것을 ×1 로

// ★ 부적 · 사원증 뱃지는 두 개까지 겹친다 (2026-10-27) — amulet 에 수(0 · 1 · 2)를 넣는다 (참 · 거짓도 받는다)
function amuletCount(u) {
    let n = 0;
    ((u && u.equippedWeapons) || []).forEach(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        if (b === '누군가가 쓴 부적' || b === '사원증 뱃지') n++;
    });
    return Math.min(AMULET_MAX, n);
}
window.amuletCount = amuletCount;
function bands(mult, amulet) {
    const n = (amulet === true) ? 1 : Math.min(AMULET_MAX, Math.max(0, Number(amulet) || 0));
    const eff = Math.max(1, mult) * Math.pow(AMULET, n);
    const u = eff / (eff + K);                      // 0 … 1 (닿지는 않는다)
    const j = J0 + (JMAX - J0) * u;
    const t = TWO0 + (TWOMAX - TWO0) * u;
    const f = Math.max(0.02, 1 - t - j);
    return { eff: eff, u: u, fail: f, jack: j, two: 1 - f - j };
}
window._slotBands = bands;
// 손잡이와 셈을 밖에서도 본다 — 검사와 콘솔이 같은 값을 쓰게
window._slotTune = { K: K, J0: J0, JMAX: JMAX, TWO0: TWO0, TWOMAX: TWOMAX,
                     TWO_PAY: TWO_PAY, AMULET: AMULET, bands: bands };

// ==========================================
// 하루 상한 — 판수와 운에 기대지 않는 천장
// ==========================================
//
//   곡선만으로는 「최대 얼마」를 못 묶는다. 두 가지가 걸린다.
//
//     ① 판수가 사람마다 다르다. 공용시설 한도는 천장이 30회인데
//        고유 아이템과 은화 뱀 몫은 **천장 밖**이라(count-cap.js:123)
//        꽉 채운 사원은 쉰 판 넘게 돌린다.
//     ② 한 판에 🫀 세 개가 뜨면 20,000P × 40 = 800,000P 다. 기대값이
//        얼마든 운이 좋은 날은 훌쩍 넘는다.
//
//   그래서 하루에 슬롯으로 **번 몫**을 세어 두고, 천장에 닿으면 그 위로는
//   주지 않는다. 진 몫은 도로 빼 주므로(진 만큼 천장이 열린다) 잃고 나서
//   다시 벌 수는 있다. 천장에 닿은 판도 건 돈은 돌려준다 — 당첨인데
//   손해를 보는 것은 말이 안 된다.
//
//   날짜가 바뀌면 0 에서 다시 센다. u.slotDay · u.slotNet 에 적힌다.
function today() {
    try { if (typeof getTodayStr === 'function') return getTodayStr(); } catch (e) { }
    return new Date().toISOString().slice(0, 10);
}
function dayNet(u) {
    if (!u || u.slotDay !== today()) return 0;
    return Number(u.slotNet) || 0;
}
function addNet(u, d) {
    if (!u || !d) return;
    if (u.slotDay !== today()) { u.slotDay = today(); u.slotNet = 0; }
    u.slotNet = (Number(u.slotNet) || 0) + d;
    try { if (typeof saveFields === 'function') saveFields({ slotDay: 1, slotNet: 1 }); } catch (e) { }
}
// 이 판에 줄 수 있는 몫 — 천장에 걸리면 깎는다
function capPrize(u, bet, prize) {
    const want = prize - bet;                       // 이 판에서 번 몫
    if (want <= 0) return { prize: prize, cut: 0 };
    const room = Math.max(0, DAY_CAP - dayNet(u));
    if (want <= room) return { prize: prize, cut: 0 };
    return { prize: bet + room, cut: want - room };
}
window._slotDayNet = dayNet;

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

            const hasAmulet = amuletCount(currentUser);         // 0 · 1 · 2

            // ★ 여기만 달라집니다 — 벽이 없습니다
            const B = bands(facilityLuckMult(currentUser), hasAmulet);

            // 📒 유치원 지침서를 다 읽은 날 — 한 판은 잭팟 (무늬는 평소 잭팟처럼 무작위 · daydream-items.js)
            let kgJack = false;
            try { kgJack = (typeof window.kgJackTake === 'function') && window.kgJackTake(); } catch (e) { kgJack = false; }
            const rollType = kgJack ? (B.fail + B.jack / 2) : Math.random();
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
                const capNote = function (cut) {
                    if (!cut) return '';
                    return '<div style="font-size:10px; color:#8d8578; margin-top:3px;">'
                        + '오늘 치 상한(' + DAY_CAP.toLocaleString() + ' P)에 닿아 '
                        + cut.toLocaleString() + ' P 는 들어오지 않았습니다.</div>';
                };
                if (res1.char === res2.char && res2.char === res3.char) {
                    const c = capPrize(currentUser, bet, bet * res1.mult);
                    winPoints(c.prize); addNet(currentUser, c.prize - bet);
                    msg.innerHTML = '<span style="color:#4CAF50;">[3개 일치] ' + res1.char
                        + ' 잭팟! ×' + res1.mult + ' 배</span>' + capNote(c.cut)
                        + (kgJack ? '<div style="font-size:10px; color:#d4af37; margin-top:3px;">📒 유치원 지침서 — 오늘의 잭팟</div>' : '');
                    addHistoryLog(currentUser, '[슬롯 대박] ' + res1.char + ' 3개 적중 (+' + c.prize + ' P)'
                        + (c.cut ? ' · 상한으로 ' + c.cut + ' P 깎임' : ''));
                } else if (res1.char === res2.char || res2.char === res3.char || res1.char === res3.char) {
                    const matched = (res1.char === res2.char) ? res1 : (res2.char === res3.char ? res2 : res1);
                    const multiplier = Math.max(1, Math.round(matched.mult * TWO_PAY));
                    const c = capPrize(currentUser, bet, bet * multiplier);
                    winPoints(c.prize); addNet(currentUser, c.prize - bet);
                    msg.innerHTML = '<span style="color:#ffd700;">[2개 일치] ' + matched.char
                        + ' 적중! (×' + multiplier + ') 지급</span>' + capNote(c.cut);
                    addHistoryLog(currentUser, '[슬롯 승리] ' + matched.char + ' 2개 적중 (+' + c.prize + ' P)'
                        + (c.cut ? ' · 상한으로 ' + c.cut + ' P 깎임' : ''));
                } else {
                    addNet(currentUser, -bet);          // 진 만큼 천장이 다시 열린다
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
            + ' · 꼭대기 3개 ' + (JMAX * 100).toFixed(1) + '% · 2개 ' + (TWOMAX * 100).toFixed(1) + '%'
            + ' · 하루 상한 ' + DAY_CAP.toLocaleString() + 'P');
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
        e2: SY.reduce(function (a, s) { return a + s.weight * Math.max(1, Math.round(s.mult * TWO_PAY)); }, 0) / tw
    };
}

function beText(m, amulet) {
    if (m === '(없음)') return '행운을 아무리 올려도 본전에 못 닿습니다';
    if (m !== 1) return '본전이 되는 자리는 배수 ' + m + ' 쯤입니다';
    const P = payouts(), B = bands(1, amulet);
    const r = B.jack * P.e3 + B.two * P.e2;
    const pct = Math.round(r * 100) + '%';
    return (r >= 1.02)
        ? '맨몸에서도 본전을 넘습니다 (돌려받음 ' + pct + ')'
        : '맨몸이 딱 본전입니다 (돌려받음 ' + pct + ')';
}

// 돌려받는 몫이 100% 로 적히는 배수 — 상수를 고치면 이 값도 따라 움직인다
//   0.995 에서 끊는다. 표에 100% 로 적히는 자리를 본전으로 보는 것이 맞고,
//   맨몸을 꼭 100% 에 맞춰 두면 99.95% 같은 값이 나와 「배수 2」로 적혔다.
function breakEven(amulet) {
    const P = payouts();
    for (let m = 1; m <= 100000; m++) {
        const B = bands(m, amulet);
        if (B.jack * P.e3 + B.two * P.e2 >= 0.995) return m;
    }
    return '(없음)';
}

window.slotOdds = function (mult) {
    const amulet = currentUser ? amuletCount(currentUser) : 0;
    const L = (mult != null) ? mult
        : ((typeof facilityLuckMult === 'function' && currentUser) ? facilityLuckMult(currentUser) : 1);
    const B = bands(L, amulet);
    const P = payouts();

    console.log('%c===== 슬롯 =====', 'color:#ffd700; font-size:13px');
    console.log('  행운 배수:', Math.round(L).toLocaleString(), amulet ? '· 부적 ' + amulet + '개 (×' + Math.pow(AMULET, amulet) + ')' : '· 부적 없음');
    console.table([{
        '꽝': (B.fail * 100).toFixed(1) + '%',
        '3개 일치': (B.jack * 100).toFixed(1) + '%',
        '2개 일치': (B.two * 100).toFixed(1) + '%',
        '돌려받는 비율': ((B.jack * P.e3 + B.two * P.e2) * 100).toFixed(0) + '%'
    }]);
    console.log('  한없이 올리면 3개 ' + (JMAX * 100).toFixed(1) + '% · 2개 '
        + (TWOMAX * 100).toFixed(1) + '% · 돌려받음 '
        + ((JMAX * P.e3 + TWOMAX * P.e2) * 100).toFixed(0) + '% 로 다가갑니다. (닿지는 않습니다)');
    console.log('  ' + beText(breakEven(amulet), amulet));
    const me = (typeof currentUser !== 'undefined') ? currentUser : null;
    console.log('  하루 상한 ' + DAY_CAP.toLocaleString() + ' P · 오늘 번 몫 '
        + dayNet(me).toLocaleString() + ' P · 남은 자리 '
        + Math.max(0, DAY_CAP - dayNet(me)).toLocaleString() + ' P');
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
    console.log('  부적 있을 때 — ' + beText(breakEven(true), true)
        + ' · 부적 없을 때 — ' + beText(breakEven(false), false));
};

// 내 행운 배수가 어디서 나오는지 쪼개 본다
window.luckWhy = function () {
    const u = currentUser;
    if (!u) return;
    const eff = u.timedEffects || [];
    const rows = [
        ['착한 친구', has(u, '착한 친구') ? '×1 (낮춤)' : '—'],
        ['유리손포', has(u, '유리손포') ? '×1 (낮춤)' : '—'],
        ['도깨비 불', (typeof window.dokOn === 'function' ? window.dokOn(u) : has(u, '도깨비 불')) ? '×2' : '—'],
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