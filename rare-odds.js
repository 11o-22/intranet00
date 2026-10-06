// ==========================================
// ★ 우주 쇼핑몰 — 희귀 품목 진열 확률을 낮춘다
// bundles.json 마지막 그룹, spaceitems.js · sapphire.js 보다 뒤
// ==========================================
//
// ■ 진열은 이렇게 된다 (index.html:9070~9115)
//
//   인증에 성공하면 진열대에 세 종을 넣는다. 그 후보를 고를 때
//
//       if (RARE_ALIEN[item] !== undefined
//           && Math.random() >= RARE_ALIEN[item]) return false;
//
//   표에 적힌 품목만 주사위를 굴린다. 표에 없는 것은 늘 후보가 된다.
//   그래서 실제 진열 확률은 「적힌 확률 × 세 자리 / 후보 수」 다.
//
//   확률은 여러 파일이 따로 적어 두었다.
//
//       newitems.js:164    다이아 1% · 루비 0.5% · 사인참사검 0.5% · 도깨비 불 1%
//       newitems2.js:1437  황룡의 눈 0.1% · 산군의 도움 0.1% · 이동장 0.1%
//                          꿈결 수집기 3% · 나머지 신규 3%
//       sapphire.js:31     사파이어 2종 2%
//       spaceitems.js:63   복사기 · 우리가 도움 · 에메랄드 2종 0.5%
//
//   이 파일이 **맨 마지막에** 그 값을 다시 적는다. 앞 파일들을 고치지 않고
//   한곳에서만 손보면 되도록.
//
// ■ 겹쳐 낮추지 않는다
//
//   올라오는 때가 파일마다 달라서(spaceitems 는 setInterval 로 늦게 적는다)
//   한동안 되풀이해 적어야 한다. 그때 배수를 거듭 곱하면 확률이 0 으로
//   무너지므로, **처음 본 값을 따로 적어 두고 늘 그 값에서 다시 셈한다.**
//
// ■ 확인
//
//   alienOdds()        품목별 적힌 확률과 실제 진열 확률
//   alienOdds(0.5)     표에 없는 희귀품까지 전부 절반으로 (이 자리에서만)

(function rareOdds() {

const SLOTS = 3;              // 한 번에 진열되는 종 수 (index.html:9111)

// 새로 정한 확률. 적지 않은 희귀품은 FALL 배로 낮춘다.
const ODDS = {
    '우리가 도움':            0.0003,
    '복사기':                 0.0004,
    '황룡의 눈':              0.0002,
    '산군의 도움':            0.0002,
    '％＄＠＆ 이동장':         0.0002,
    '소원권':                 0.00005,
    '에메랄드 하네스':        0.0015,
    '에메랄드 목줄':          0.0015,
    '사인참사검':             0.0015,
    '루비 클리 피어싱':       0.0015,
    '루비 유두 피어싱':       0.0015,
    '사파이어 요도 플러그':   0.005,
    '사파이어 젖꼭지 클램프': 0.005,
    '다이아 애널 플러그':     0.003,
    '다이아 보지 플러그':     0.003,
    '도깨비 불':              0.003,
    '꿈결 수집기':            0.01
};
const FALL = 0.3;             // 표에 없는 희귀품

const first = {};             // 처음 본 값 — 겹쳐 낮추지 않기 위해
let scale = 1;                // alienOdds(n) 으로 한 번 더 조절

function apply() {
    const R = window.RARE_ALIEN_RATE;
    if (!R) return 0;
    let n = 0;
    Object.keys(R).forEach(function (nm) {
        if (!(nm in first)) first[nm] = R[nm];
        const want = ((nm in ODDS) ? ODDS[nm] : first[nm] * FALL) * scale;
        if (R[nm] !== want) { R[nm] = want; n++; }
    });
    return n;
}

// 파일마다 올라오는 때가 달라 한동안 되풀이해 적는다
let ticks = 0;
const iv = setInterval(function () {
    apply();
    if (++ticks > 40) {                       // 20초쯤
        clearInterval(iv);
        const R = window.RARE_ALIEN_RATE || {};
        console.log('[우주] 희귀 진열 확률을 낮췄습니다 — ' + Object.keys(R).length + '종');
    }
}, 500);

// ==========================================
// 확인
// ==========================================
//
// 후보 수를 세려면 index.html:9074 의 걸러내기를 그대로 따라야 한다.
function candidates(u) {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return 0;
    const R = window.RARE_ALIEN_RATE || {};
    const a = (u.affiliation || ''), t = (u.team || ''), admin = (u.code === 'kario0987');
    const dis = a.indexOf('재난관리국') >= 0 || t.indexOf('재난관리') >= 0 || admin || /어둠/.test(a + ' ' + t);
    const day = a.indexOf('백일몽 주식회사') >= 0 || admin || /어둠/.test(a + ' ' + t);
    const high = ['과장', '차장', '부장', '이사', '대표', '사장'].indexOf(u.position) >= 0 || admin;
    const sec = t.indexOf('보안팀') >= 0 || t.indexOf('경비팀') >= 0 || admin;

    return ALIEN_ITEMS_POOL.filter(function (it) {
        if (['작두', '유리손포', '누군가가 쓴 부적', '사자탈'].indexOf(it) >= 0 && !dis) return false;
        if (['착한 친구', '보안팀 의상 세트', '버터 나이프'].indexOf(it) >= 0 && !day) return false;
        if (['은반지', '빨간 리본', '고급진 술', '금고'].indexOf(it) >= 0 && !high) return false;
        if (it === '노스텔지어 끈' && !sec) return false;
        if (it === '여우구슬' && !admin) return false;
        if (it === '금고' && !admin) return false;
        return R[it] === undefined;                  // 주사위를 굴리지 않는 것 = 늘 후보
    }).length;
}

window.alienOdds = function (mult) {
    if (typeof mult === 'number' && mult > 0) {
        scale = mult;
        const n = apply();
        console.log('[우주] 확률을 ' + mult + ' 배로 다시 적었습니다. (' + n + '종)');
    }
    const R = window.RARE_ALIEN_RATE || {};
    const u = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const N = u ? candidates(u) : 0;
    const share = N ? Math.min(1, SLOTS / (N + 1)) : 1;

    const rows = Object.keys(R).sort(function (x, y) { return R[x] - R[y]; }).map(function (nm) {
        const was = (nm in first) ? first[nm] : R[nm];
        return {
            품목: nm,
            전: (was * 100).toFixed(3) + '%',
            후: (R[nm] * 100).toFixed(3) + '%',
            '한 번 인증당': (R[nm] * share * 100).toFixed(4) + '%',
            '몇 번에 한 번': (R[nm] * share) > 0
                ? Math.round(1 / (R[nm] * share)).toLocaleString() + '번'
                : '—'
        };
    });
    console.log('%c===== 우주 쇼핑몰 희귀 진열 확률 =====', 'color:#9fd0ff; font-size:13px');
    console.table(rows);
    console.log('  늘 후보가 되는 평범한 품목 ' + N + '종 · 한 번에 ' + SLOTS + '종 진열'
        + ' → 주사위를 넘긴 뒤에도 ' + (share * 100).toFixed(1) + '% 만 자리에 든다');
    if (u && u.code === 'kario0987') {
        console.log('  ※ 관리자 계정은 진열대에 품목 전부가 보입니다(index.html:9146). 확률과 무관합니다.');
    }
    console.log('  alienOdds(0.5) 처럼 배수를 주면 전부 그만큼 더 낮춥니다.');
};

console.log('[우주] alienOdds()');

})();
