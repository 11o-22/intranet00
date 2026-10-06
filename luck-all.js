// ==========================================
// ★ 공용시설 행운 — 빠져 있던 몫을 전부 잇는다
// bundles.json 마지막 그룹, foxtail.js 뒤 · bj-luck.js 앞
// ==========================================
//
// ■ 무엇이 빠져 있었나
//
//   공용시설 행운(슬롯·블랙잭·섯다·하이로우)은 facilityLuckMult 하나가
//   셈한다. 여기에 여러 파일이 차례로 제 몫을 얹는다.
//
//       dark.js:4485      착한 친구 ×4 · 유리손포 ×4 · 다이아 플러그 ×3(세트 ×3.5)
//       slot-curve.js:95  착한 친구 · 유리손포 를 ÷4 (앞서 100% 로 낮춘 몫)
//       spaceitems.js:191 에메랄드 하네스 ×3 (세트 ×3.5)
//       newitems.js:532   감자맛 물약 ×2 · 유리구슬 ×4 · 루비 유두 ×3
//                         도깨비 불 ×2 · 사원증 뱃지 ×1.15
//       dna-gifts.js:217  고유 아이템(DNA)의 pct
//       dna.js:364        출산품 「아이의 운」 ×2
//       foxtail.js:555    꼬리 — 한 개마다 +50% (아홉 개 +450%)
//
//   그런데 **pct 버프가 어디에도 닿지 않았다.** itemfix.js:557 에
//
//       //   facilityLuckMult ← pct · getDarkTriesLeft ← dark
//
//   라고 적어 두고, 그 아래에서 dark · bon · gim · eva · luck · death 는
//   전부 이었는데 pct 만 잇는 자리를 안 만들었다. 그래서 아래의 것들이
//   설명에만 있고 실제로는 아무 일도 하지 않았다.
//
//       봉제 인형 키트 결과물   행운 150%   (newitems2.js:1607)
//       연구 보고서             행운 300%   (newitems2.js:1630 · 3시간)
//       달빛 타투 · 엽서        뽑히면 행운
//       꿈결 수집기(장착)       행운 100%   (newitems2.js:103)
//       고유 아이템에 얹은 몫   giveDnaExtra(..., { pct: n })
//
//   또 출산품 「세 번 굴린 주사위」는 설명이 '한 시간 동안 세 배' 인데
//   dna.js:364 가 이름만 보고 ×2 를 주고 있었다. 설명대로 ×3 이 되게 한다.
//
// ■ 세는 방식
//
//   pct 는 「행운 몇 %」를 뜻한다. 고유 아이템이 그렇게 쓰고 있다.
//
//       눈을 감은 나침반  pct 600  →  '공용시설 행운 600%'  →  ×6
//       연구 보고서       pct 300  →  '행운 300%'           →  ×3
//       꿈결 수집기       pct 100  →  '행운 100%'           →  ×1 (그대로)
//
//   그래서 합을 100 으로 나눈다. 100 아래로는 내려가지 않게 막아
//   **행운이 줄어드는 일은 없다.**
//
//   고유 아이템 제 몫은 dna-gifts.js 가 이미 세고 있으므로
//   itemfix.js 의 buffOnly() — 「고유 몫을 뺀 나머지」 — 만 쓴다.
//   두 번 들어가지 않는다.
//
// ■ 확인
//
//   luckBreak()         내 행운이 어디서 얼마나 오는지 한 줄씩
//   luckBreak('2542')   다른 사원의 것

(function luckAll() {

// ==========================================
// 하나 — pct 버프를 잇는다
// ==========================================
function pctSum(u) {
    try {
        if (typeof window.buffOnly !== 'function') return 0;
        return Math.max(0, window.buffOnly(u).pct || 0);
    } catch (e) { return 0; }
}
function pctMult(u) {
    const p = pctSum(u);
    return p > 0 ? Math.max(1, p / 100) : 1;
}

// ==========================================
// 둘 — 출산품 「세 배」를 제 값으로
// ==========================================
//
// dna.js:364 가 이름만 보고 ×2 를 주었다. 설명에 '세 배' 가 적힌 것은
// ×1.5 를 한 번 더 얹어 ×3 이 되게 한다. 이름은 그대로 두므로
// buff24.js 처럼 이름을 보는 다른 자리는 건드리지 않는다.
function childTriple(u) {
    try {
        const on = (u.timedEffects || []).some(function (e) {
            return e && e.name === '아이의 운' && /세\s*배/.test(String(e.desc || ''));
        });
        return on ? 1.5 : 1;
    } catch (e) { return 1; }
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._all) { clearInterval(iv); return; }

        const _f = facilityLuckMult;
        facilityLuckMult = function (user) {
            let m = _f.apply(this, arguments);
            const u = user || (typeof currentUser !== 'undefined' ? currentUser : null);
            if (!u) return m;
            m *= pctMult(u);
            m *= childTriple(u);
            return Math.max(1, m);
        };
        facilityLuckMult._all = true;
        clearInterval(iv);
        console.log('[행운] pct 버프 연결 — 봉제 인형 · 연구 보고서 · 달빛 타투 · 꿈결 수집기');
    }, 400);
})();

// ==========================================
// 확인 — 어디서 얼마나 오는지
// ==========================================
function wears(u, name) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}
// 타인이 채워 준 것만 효력이 도는 것들 (dark.js:4476 plugActive 와 같다)
function plugged(u, name) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        if (base !== name) return false;
        let owner = null;
        try { owner = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null; } catch (e) { }
        return owner && owner !== u.code;
    });
}
function timed(u, name) {
    return (u.timedEffects || []).some(function (e) { return e && e.name === name; });
}
function foxPct(u) {
    try {
        if (typeof window._foxSum === 'function') return window._foxSum(u, 'fluck') || 0;
    } catch (e) { }
    return 0;
}
function who(key) {
    const me = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!key) return me;
    if (typeof db === 'undefined' || !db.users) return me;
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (x) { return x && (x.no === key || x.code === key || x.name === key); })[0] || null;
}

window.luckBreak = function (key) {
    const u = who(key);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    const rows = [];
    const add = function (nm, x, note) {
        rows.push({ 출처: nm, 배수: '×' + Number(x).toFixed(2), 비고: note || '' });
    };

    // dark.js — 착한 친구 · 유리손포는 slot-curve.js 가 ÷4 하므로 실제로는 ×1
    if (wears(u, '착한 친구')) add('착한 친구', 1, '앞서 100% 로 낮춘 것');
    if (wears(u, '유리손포')) add('유리손포', 1, '앞서 100% 로 낮춘 것');

    const anal = plugged(u, '다이아 애널 플러그'), vag = plugged(u, '다이아 보지 플러그');
    if (anal && vag) add('다이아 플러그 세트', 3.5, '타인이 채워 준 것');
    else if (anal) add('다이아 애널 플러그', 3, '타인이 채워 준 것');

    // spaceitems.js
    const h = wears(u, '에메랄드 하네스'), c = wears(u, '에메랄드 목줄');
    if (h && c) add('에메랄드 세트', 3.5);
    else if (h) add('에메랄드 하네스', 3.0);

    // newitems.js
    if (timed(u, '감자맛 물약')) add('감자맛 물약', 2);
    if (timed(u, '유리구슬')) add('유리구슬', 4);
    if (plugged(u, '루비 유두 피어싱')) add('루비 유두 피어싱', 3, '타인이 채워 준 것');
    if (wears(u, '도깨비 불')) add('도깨비 불', 2);
    if (wears(u, '사원증 뱃지')) add('사원증 뱃지', 1.15);

    // dna-gifts.js — 고유 아이템 제 몫 (장착 중일 때만, 본인만)
    try {
        if (typeof currentUser !== 'undefined' && u === currentUser && typeof myDnaEquip === 'function') {
            const e = myDnaEquip();
            if (e && e.pct) add('고유 아이템 ' + e.pct + '%', e.pct / 100, '장착 중');
        }
    } catch (e) { }

    // dna.js — 출산품(임신 템)
    if (timed(u, '아이의 운')) {
        const t = childTriple(u);
        add('출산품 「아이의 운」', 2 * t, t > 1 ? '세 배짜리' : '두 배짜리');
    }

    // foxtail.js — 꼬리
    const fp = foxPct(u);
    if (fp > 0) add('꼬리 ' + fp + '%', 1 + fp / 100, '꼬리 ' + Math.round(fp / 50) + '개분');

    // 이 파일이 새로 이은 몫
    const p = pctSum(u);
    if (p > 0) add('pct 버프 ' + p + '%', Math.max(1, p / 100),
        '봉제 인형 · 연구 보고서 · 달빛 타투 · 꿈결 수집기 …');

    const total = (typeof facilityLuckMult === 'function') ? facilityLuckMult(u) : 1;

    console.log('%c===== ' + (u.name || '?') + ' · 공용시설 행운 =====', 'color:#d4af37; font-size:13px');
    if (rows.length) console.table(rows);
    else console.log('  (행운 물품이 하나도 없습니다)');
    console.log('%c  합계 ' + Math.round(total * 100) + '%  (배수 ' + total.toFixed(2) + ')',
        'color:#d4af37; font-size:13px');
    if (total < 10) {
        console.log('  섯다에서 딜러를 이기려면 1,000% 쯤은 되어야 합니다. 지금은 '
            + Math.round(total * 100) + '% 입니다.');
    }
    console.log('  연결:', (typeof facilityLuckMult === 'function' && facilityLuckMult._all) ? 'O' : '✗');
};

console.log('[행운] luckBreak()');

})();
