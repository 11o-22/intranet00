// ==========================================
// ★ 공용시설 · 어둠 탐사 횟수에 천장을 둔다
// bundles.json 마지막 묶음, itemfix.js · dna-gifts.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   요리(식당 ★)가 「공용시설 +n회」·「어둠 탐사 +n회」를 ibAdd 로 얹는데
//   세는 데가 없었다. S등급 요리를 계속 먹으면 계속 늘어난다. 거기에
//   출산 몫(birthAddedMax)은 혼자 +20 까지 올라간다. 공용시설 한도가
//   20 + 5 + 20 + 요리… 로 끝없이 벌어졌다.
//
// ■ 어떻게 두나
//
//   요리로 더하는 몫        하루 공용 5회 · 어둠 5회까지
//                          (???의 티켓 · 무전기의 하루 +5 와는 따로 센다)
//   공용시설 한도           최대 30회
//   어둠 탐사 한도          최대 12회
//
//   천장 밖 — 은화 뱀과 고유 아이템(DNA)의 몫은 천장 위에 그대로 얹는다.
//   적혀 있는 숫자는 적힌 대로 들어가야 한다.
//
//   남은 몫은 쌓이지 않는다. 요리 버프는 24시간이 아니라 자정에 끝난다.
//   그래서 다 안 쓰고 자면 그만큼 사라진다. (공용시설 이용 횟수와
//   어둠 탐사 횟수가 자정에 초기화되는 것과 같은 시계다)
//
// ■ 콘솔
//   capState()    지금 한도가 어떻게 쌓여 있나

window.CAP_FAC_MAX   = 30;      // 공용시설 한도의 천장
window.CAP_DARK_MAX  = 12;      // 어둠 탐사 한도의 천장
window.CAP_COOK_DAY  = 5;       // 요리로 하루에 더할 수 있는 몫 (종류별)
window.CAP_DARK_BASE = 8;       // index.html 의 getDarkTriesLeft 기본값과 같아야 한다

(function countCap() {

const COOK_SRC = '식당 ★';
const FREE_SRC = ['은화 뱀'];   // 천장 밖에서 얹히는 임시 버프

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function today() {
    try { return getTodayStr(); } catch (e) { return ''; }
}

// 자정까지 남은 밀리초 — 요리 버프의 수명
window.capMidnightMs = function () {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return Math.max(60000, d.getTime() - Date.now());
};

// itemBuffs 중 특정 출처의 살아 있는 몫
function srcSum(u, srcs) {
    const out = { fac: 0, dark: 0 };
    const now = Date.now();
    ((u && u.itemBuffs) || []).forEach(function (b) {
        if (!b || (b.k !== 'fac' && b.k !== 'dark')) return;
        if (srcs.indexOf(b.src) < 0) return;
        if (!b.run && b.until && b.until <= now) return;     // 지난 것은 안 센다
        out[b.k] += b.v || 0;
    });
    return out;
}

// 임시 버프 + 상시 장비 몫 (고유 아이템 몫은 여기에 없다)
function buffAll(u) {
    try { if (typeof buffOnly === 'function') return buffOnly(u) || {}; } catch (e) { }
    try { if (typeof ibSum === 'function') return ibSum(u) || {}; } catch (e) { }
    return {};
}

// 고유 아이템(DNA)의 몫 — 천장 밖
function dnaWorn(u) {
    try {
        if (u && me() && u.code === me().code && typeof myDnaEquip === 'function') {
            return myDnaEquip() || {};
        }
    } catch (e) { }
    return {};
}

// 천장 안에 들어가는 몫과 천장 밖에 얹히는 몫으로 가른다
window.capParts = function (u) {
    u = u || me() || {};
    const all   = buffAll(u);
    const snake = srcSum(u, FREE_SRC);
    const dna   = dnaWorn(u);
    return {
        capped: {
            fac:  Math.max(0, (all.fac  || 0) - snake.fac),
            dark: Math.max(0, (all.dark || 0) - snake.dark)
        },
        free: {
            fac:  (dna.fac  || 0) + snake.fac,
            dark: (dna.dark || 0) + snake.dark
        }
    };
};

// ==========================================
// 1. 요리로 더할 수 있는 몫
// ==========================================
//
// 따로 세어 두는 칸을 만들지 않는다. 요리 버프 자체가 자정에 끝나므로
// 「살아 있는 식당 ★ 몫」이 곧 오늘 더한 양이다. 자정에 스스로 비워진다.
window.capCookUsed = function (u, k) {
    return srcSum(u || me() || {}, [COOK_SRC])[k] || 0;
};
window.capCookRoom = function (u, k) {
    return Math.max(0, window.CAP_COOK_DAY - window.capCookUsed(u, k));
};

// ==========================================
// 2. 공용시설 한도
// ==========================================
window.capFacMax = function (u) {
    u = u || me();
    if (!u) return 20;
    const p = window.capParts(u);
    const inner = 20
        + Math.min(5,  u.ticketAddedMax || 0)
        + Math.min(20, u.birthAddedMax  || 0)
        + p.capped.fac;
    return Math.min(window.CAP_FAC_MAX, inner) + p.free.fac;
};

// ==========================================
// 3. 어둠 탐사 한도
// ==========================================
//
// getDarkTriesLeft 는 「남은 횟수」다. 이미 세 겹으로 싸여 있고
// (index.html → dna-gifts → itemfix), 파티 도우미와 토크쇼는 잠깐
// 자기 것으로 바꿔치웠다가 되돌린다. 그래서 값을 다시 계산하지 않고,
// 천장을 넘은 만큼만 깎는다. 바꿔치기한 값(99 · 최소 1)은 그대로 살아남는다.
function darkOver(u) {
    u = u || me();
    if (!u) return 0;
    const added = (u.darkTryAddDate === today()) ? Math.min(2, u.darkTryAdded || 0) : 0;
    const total = window.CAP_DARK_BASE + added + window.capParts(u).capped.dark;
    return Math.max(0, total - window.CAP_DARK_MAX);
}
window.capDarkOver = darkOver;

(function hookDark() {
    function wrap() {
        if (typeof getDarkTriesLeft !== 'function') return;
        // itemfix 가 먼저 싸야 한다. 내가 먼저 싸면 그쪽이 바깥이 되어
        // 깎아 낸 뒤에 다시 얹는 꼴이 된다.
        if (!getDarkTriesLeft._facDark && !getDarkTriesLeft._capDark) return;
        if (getDarkTriesLeft._capDark) return;               // 이미 내가 맨 바깥이다

        const _g = getDarkTriesLeft;
        const mine = function () {
            const n = _g.apply(this, arguments);
            let over = 0;
            try { over = darkOver(); } catch (e) { }
            return Math.max(0, n - over);
        };
        mine._capDark = true;
        mine._facDark = true;                                 // 아래 깃발을 잃지 않는다
        getDarkTriesLeft = mine;
        console.log('[한도] 어둠 탐사 천장 ' + window.CAP_DARK_MAX + '회 연결');
    }
    wrap();
    setInterval(function () { try { wrap(); } catch (e) { } }, 1500);
})();

// ==========================================
// 확인
// ==========================================
window.capState = function () {
    const u = me();
    if (!u) { console.log('로그인 전입니다.'); return; }
    const p = window.capParts(u);
    console.log('%c===== 횟수 한도 =====', 'color:#d4af37; font-size:13px');
    console.table([
        { 항목:'공용시설', 기본:20,
          티켓:Math.min(5, u.ticketAddedMax || 0),
          출산:Math.min(20, u.birthAddedMax || 0),
          '요리·장비':p.capped.fac,
          천장:window.CAP_FAC_MAX,
          '천장 밖':p.free.fac,
          한도:window.capFacMax(u),
          사용:u.facilityCount || 0 },
        { 항목:'어둠 탐사', 기본:window.CAP_DARK_BASE,
          티켓:'-',
          출산:'-',
          '요리·장비':p.capped.dark,
          천장:window.CAP_DARK_MAX,
          '천장 밖':p.free.dark,
          한도:(window.CAP_DARK_BASE
                + ((u.darkTryAddDate === today()) ? Math.min(2, u.darkTryAdded || 0) : 0)
                + p.capped.dark - darkOver()) + p.free.dark,
          사용:u.darkTries || 0 }
    ]);
    console.log('  요리로 더한 몫 — 공용 ' + window.capCookUsed(u, 'fac')
        + '/' + window.CAP_COOK_DAY + ' · 어둠 ' + window.capCookUsed(u, 'dark')
        + '/' + window.CAP_COOK_DAY + ' (자정에 사라집니다)');
    console.log('  천장을 바꾸려면 — CAP_FAC_MAX = 30 · CAP_DARK_MAX = 12 · CAP_COOK_DAY = 5');
};

console.log('[한도] capState()');

})();
