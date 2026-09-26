// ==========================================
// ★ DNA · 임신 아이템 70종
// index.html 에서 invmark.js 다음에 불러온다
// ==========================================

// ==========================================
// DNA — 사번 기반 고정값
// ==========================================
const DNA_BASE = ['A','T','G','C'];

function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function seedRand(seed, n) {
    let x = seed + n * 2654435761;
    x = Math.imul(x ^ (x >>> 15), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function dnaOf(user) {
    if (!user) return '----';
    if (user.dna) return user.dna;
    const s = seedOf(user.code + '|' + (user.no || ''));
    let d = '';
    for (let i = 0; i < 8; i++) d += DNA_BASE[Math.floor(seedRand(s, i) * 4)];
    user.dna = d;
    if (user.code === (currentUser && currentUser.code)) saveFields({ dna: 1 });
    else updateUserFields(user.code, { dna: d });
    return d;
}

// 임신 성공률 — 같은 사람은 항상 같다
function sireRate(user) {                    // 시키는 쪽 0.5 ~ 35%
    const s = seedOf('sire|' + user.code);
    return Math.round((0.5 + seedRand(s, 1) * 34.5) * 10) / 10;
}
function bearRate(user) {                    // 되는 쪽 0.1 ~ 30%
    const s = seedOf('bear|' + user.code);
    return Math.round((0.1 + seedRand(s, 2) * 29.9) * 10) / 10;
}
// 물약 등으로 역할이 바뀌었을 때의 반대편 확률
function sireRateAlt(user) {
    const s = seedOf('sireAlt|' + user.code);
    return Math.round((0.5 + seedRand(s, 3) * 34.5) * 10) / 10;
}
function bearRateAlt(user) {
    const s = seedOf('bearAlt|' + user.code);
    return Math.round((0.1 + seedRand(s, 4) * 29.9) * 10) / 10;
}

// ==========================================
// 역할 판정
// ==========================================
function hasPotion(user, name) {
    return (user.timedEffects || []).some(e => e.name === name);
}
function genderOf(user) {
    return (user.badge && user.badge.gender) || '';
}

// 딸기맛 물약 — 확률을 무시한다
function hasSureBear(user) {
    return !!user && hasPotion(user, '딸기맛 물약');
}

// 남성에게 자궁을 주는 물약 — 하나라도 있으면 임신할 수 있다
const BEAR_POTIONS = ['우유맛 물약', '포도맛 물약', '망고맛 물약'];
// 여성에게서 임신 능력을 뺏는 물약 — 망고맛은 자궁 문신이라 해당 없다
const UNBEAR_POTIONS = ['우유맛 물약', '포도맛 물약'];

function hasBearPotion(user) {
    if (!user) return false;
    return BEAR_POTIONS.some(n => hasPotion(user, n));
}
function hasUnbearPotion(user) {
    if (!user) return false;
    return UNBEAR_POTIONS.some(n => hasPotion(user, n));
}
// 이전 이름 호환
function hasFlipPotion(user) { return hasBearPotion(user); }
const FLIP_POTIONS = BEAR_POTIONS;

// 다이아 보지 플러그를 차고 있는가
// 차고 있으면 새로 임신할 수 없다. 이미 임신한 것은 유지된다.
function hasVaginaPlug(user) {
    if (!user || !user.equippedWeapons) return false;
    return user.equippedWeapons.some(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w);
        return base === '다이아 보지 플러그';
    });
}

// 임신할 수 있는 쪽
//   남성 : 우유 · 포도 · 망고 중 하나라도 있으면 가능
//   여성 : 우유 · 포도가 없으면 가능 (망고는 자궁 문신이라 막지 않는다)
function canBear(user) {
    if (!user) return false;
    const g = genderOf(user);
    if (g === '남성') return hasBearPotion(user);
    if (g === '여성') return !hasUnbearPotion(user);
    return false;                      // 성별 미지정은 해당 없음
}

// 임신시킬 수 있는 쪽 — 받는 쪽이면 시킬 수 없다
function canSire(user) {
    if (!user) return false;
    if (!genderOf(user)) return false; // 성별 미지정은 해당 없음
    return !canBear(user);
}

// 지금 새로 임신할 수 있는가 (플러그까지 본다)
function canBearNow(user) {
    return canBear(user) && !hasVaginaPlug(user);
}

// 물약으로 역할이 뒤집혔는가
function roleFlipped(user) {
    const g = genderOf(user);
    if (!g) return false;
    if (g === '남성') return hasBearPotion(user);
    return hasUnbearPotion(user);
}

// 화면에 보여 줄 확률 (본인 것만)
function myRates(user) {
    const flip = roleFlipped(user);
    return {
        sire: canSire(user) ? (flip ? sireRateAlt(user) : sireRate(user)) : null,
        bear: canBear(user) ? (flip ? bearRateAlt(user) : bearRate(user)) : null
    };
}

// ==========================================
// 임신 아이템 70종
// ==========================================
const BIRTH_ITEMS = [
    // --- 오염 계열 20 ---
    { n:'솜을 채운 곰', e:'heal', v:18, d:'오염도 18% 회복.' },
    { n:'은빛 방울', e:'heal', v:25, d:'오염도 25% 회복.' },
    { n:'별 무늬 담요', e:'heal', v:15, d:'오염도 15% 회복.' },
    { n:'식지 않는 찻잔', e:'heal', v:30, d:'오염도 30% 회복.' },
    { n:'밤에만 켜지는 등', e:'b_blind', v:3, d:'3시간 동안 오염도가 오르지 않는다.' },
    { n:'두 겹 이불', e:'b_blind', v:5, d:'5시간 동안 오염도가 오르지 않는다.' },
    { n:'태엽 오르골', e:'b_blind', v:2, d:'2시간 동안 오염도가 오르지 않는다.' },
    { n:'말린 들꽃 묶음', e:'heal', v:12, d:'오염도 12% 회복.' },
    { n:'눈 위의 작은 자국', e:'heal', v:20, d:'오염도 20% 회복.' },
    { n:'아직 비어 있는 공책', e:'heal', v:22, d:'오염도 22% 회복.' },
    { n:'식은 우유 한 잔', e:'heal', v:10, d:'오염도 10% 회복.' },
    { n:'뒤집히지 않은 모래시계', e:'heal', v:16, d:'오염도 16% 회복.' },
    { n:'손바닥만 한 벙어리장갑', e:'heal', v:14, d:'오염도 14% 회복.' },
    { n:'가라앉은 거품', e:'heal', v:8, d:'오염도 8% 회복.' },
    { n:'처음 열린 창', e:'b_blind', v:4, d:'4시간 동안 오염도가 오르지 않는다.' },
    { n:'덜 여문 열매', e:'heal', v:9, d:'오염도 9% 회복.' },
    { n:'기울지 않는 저울', e:'heal', v:11, d:'오염도 11% 회복.' },
    { n:'물기가 남은 조약돌', e:'heal', v:13, d:'오염도 13% 회복.' },
    { n:'개켜 둔 손수건', e:'heal', v:17, d:'오염도 17% 회복.' },
    { n:'온기가 남은 방석', e:'heal', v:19, d:'오염도 19% 회복.' },

    // --- 공용시설 계열 20 ---
    { n:'반들거리는 첫 동전', e:'b_luck', v:2, d:'2시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'흔들면 우는 딸랑이', e:'b_ticket', v:3, d:'공용시설 이용 3회 추가.' },
    { n:'자개 단추', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'뒤집힌 카드', e:'b_luck', v:3, d:'3시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'세 번 굴린 주사위', e:'b_luck', v:1, d:'1시간 동안 공용시설 행운이 세 배가 된다.', mult:3 },
    { n:'접힌 영수증', e:'b_point', v:8000, d:'8,000 P를 얻는다.' },
    { n:'구겨진 지폐', e:'b_point', v:15000, d:'15,000 P를 얻는다.' },
    { n:'풀칠이 마른 봉투', e:'b_point', v:4000, d:'4,000 P를 얻는다.' },
    { n:'꽉 찬 저금통', e:'b_point', v:30000, d:'30,000 P를 얻는다.' },
    { n:'금이 간 유리구슬', e:'b_ticket', v:4, d:'공용시설 이용 4회 추가.' },
    { n:'짝 없는 양말', e:'b_ticket', v:1, d:'공용시설 이용 1회 추가.' },
    { n:'돌려 감은 태엽', e:'b_luck', v:2, d:'2시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'무늬가 지워진 딱지', e:'b_point', v:6000, d:'6,000 P를 얻는다.' },
    { n:'납작하게 눌린 빨대', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'한쪽만 남은 덧신', e:'b_point', v:9000, d:'9,000 P를 얻는다.' },
    { n:'맞지 않는 퍼즐 조각', e:'b_luck', v:4, d:'4시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'작게 접힌 종이배', e:'b_ticket', v:3, d:'공용시설 이용 3회 추가.' },
    { n:'구르다 멈춘 팽이', e:'b_point', v:12000, d:'12,000 P를 얻는다.' },
    { n:'숨겨 둔 사탕', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'잃어버린 이름표', e:'b_point', v:7000, d:'7,000 P를 얻는다.' },

    // --- 어둠 계열 20 ---
    { n:'어둠에서 온 노크', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'눈을 감고 그린 지도', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'풀리지 않는 매듭', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'숨을 참은 물병', e:'b_bonus', v:3, d:'다음 탐사의 모든 판정에 +3.' },
    { n:'따라 나온 그림자', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'세어지지 않는 구슬', e:'b_reroll', v:2, d:'다음 탐사에서 판정을 2회 다시 굴린다.' },
    { n:'울리지 않는 종', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'거꾸로 놓인 나침반', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'물에서 건진 열쇠', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'이름이 지워진 표찰', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'두 번 접힌 쪽지', e:'b_reroll', v:1, d:'다음 탐사에서 판정을 1회 다시 굴린다.' },
    { n:'빛을 담아 둔 병', e:'b_bonus', v:1, d:'다음 탐사의 모든 판정에 +1.' },
    { n:'돌아보지 않은 문', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'소리를 삼킨 주머니', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'마르지 않은 잉크', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'다섯 칸짜리 서랍', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'반으로 나눈 부적', e:'b_reroll', v:1, d:'다음 탐사에서 판정을 1회 다시 굴린다.' },
    { n:'접힌 무릎 담요', e:'b_bonus', v:1, d:'다음 탐사의 모든 판정에 +1.' },
    { n:'헤아리지 못한 별', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'먼저 놓인 발판', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },

    // --- 복합 10 ---
    { n:'닮지 않은 초상', e:'b_mix', v:0, d:'오염도 15% 회복 · 공용시설 이용 2회 추가.', heal:15, ticket:2 },
    { n:'두 색으로 뜬 실타래', e:'b_mix', v:0, d:'오염도 20% 회복 · 다음 탐사 판정에 +2.', heal:20, bonus:2 },
    { n:'양쪽이 같은 팽이', e:'b_mix', v:0, d:'공용시설 이용 3회 추가 · 어둠 탐사 1회 추가.', ticket:3, dark:1 },
    { n:'어디에도 없던 무늬', e:'b_mix', v:0, d:'오염도 25% 회복 · 10,000 P.', heal:25, point:10000 },
    { n:'세 번째 서랍', e:'b_mix', v:0, d:'다음 탐사 판정에 +3 · 치명적 상황 1회 방어.', bonus:3, guard:1 },
    { n:'거울에 비친 초', e:'b_mix', v:0, d:'오염도 18% 회복 · 3시간 행운 두 배.', heal:18, luck:3 },
    { n:'이름이 둘인 책', e:'b_mix', v:0, d:'공용시설 4회 · 15,000 P.', ticket:4, point:15000 },
    { n:'웃는 쪽만 남은 가면', e:'b_mix', v:0, d:'오염도 22% 회복 · 지목 1회 회피.', heal:22, hide:1 },
    { n:'두 번 부푼 풍선', e:'b_mix', v:0, d:'어둠 탐사 1회 · 재굴림 1회.', dark:1, reroll:1 },
    { n:'돌아온 종이비행기', e:'b_mix', v:0, d:'오염도 30% 회복 · 20,000 P · 공용시설 3회.', heal:30, point:20000, ticket:3 }
];

BIRTH_ITEMS.forEach(function (b) {
    ITEM_CATALOG[b.n] = {
        price: 300, usable: true, targetable: false,
        effect: b.e, value: b.v, birth: true, desc: '[출산] ' + b.d,
        heal: b.heal, ticket: b.ticket, bonus: b.bonus, dark: b.dark,
        point: b.point, luck: b.luck, hide: b.hide, reroll: b.reroll,
        guard: b.guard, mult: b.mult
    };
});

// ==========================================
// 고유 DNA 아이템 — 사원마다 하나, 자동 생성
// ==========================================
// ★ 고유 아이템 이름·효과는 dna-gifts.js 에서 정의한다

// ==========================================
// 출산 추첨
// ==========================================
// 아이템 등급 — 값이 클수록 좋은 것
function birthTier(it) {
    if (it.e === 'b_mix') return 3;                                  // 복합
   if (it.e === 'b_point') return it.v >= 15000 ? 3 : it.v >= 8000 ? 2 : 1;
    if (it.e === 'heal')    return it.v >= 25 ? 3 : it.v >= 15 ? 2 : 1;
    if (it.e === 'b_blind') return it.v >= 5 ? 3 : it.v >= 3 ? 2 : 1;
    if (it.e === 'b_luck')  return (it.mult === 3 || it.v >= 3) ? 3 : 2;
    if (it.e === 'b_ticket')return it.v >= 4 ? 3 : it.v >= 2 ? 2 : 1;
    if (it.e === 'b_guard' || it.e === 'b_reroll') return 3;
    if (it.e === 'b_bonus') return it.v >= 3 ? 3 : it.v >= 2 ? 2 : 1;
    if (it.e === 'b_hide')  return 2;
    if (it.e === 'b_dark')  return 2;
    return 1;
}

// 돌봄을 얼마나 채웠는가 (0 ~ 1)
// 이틀 동안 하루 8회씩, 총 16회가 만점
function careFill(preg) {
    if (!preg) return 0;
    const total = Object.values(preg.careCount || {}).reduce((a, b) => a + b, 0);
    const goal = (typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8) * 2;
    return Math.max(0, Math.min(1, total / goal));
}

// 출산 아이템 추첨
// fill 0 → 지금까지와 같다
// fill 1 → 상급이 훨씬 자주 나오고, 고유 아이템도 아주 조금 잘 나온다
function rollBirthItem(parentA, parentB, fill) {
    [parentA, parentB].forEach(function (p) { if (p) ensureDnaItem(p); });

    const f = Math.max(0, Math.min(1, fill || 0));

    // 고유 아이템 — 0.01% 에서 최대 0.04% 까지만
    const dnaRate = 0.0001 * (1 + f * 3);
    const r = Math.random();
    if (r < dnaRate && parentA) return dnaItemName(parentA);
    if (r < dnaRate * 2 && parentB) return dnaItemName(parentB);

    // 등급 가중치 — 다 채우면 상급이 여섯 배쯤 잘 나온다
    const W = {
        1: 1 - f * 0.75,          // 1.00 → 0.25
        2: 1 + f * 0.6,           // 1.00 → 1.60
        3: 0.45 + f * 2.35        // 0.45 → 2.80
    };

    let total = 0;
    const pool = BIRTH_ITEMS.map(function (it) {
        const w = W[birthTier(it)] || 1;
        total += w;
        return { it: it, w: w };
    });

    let x = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
        x -= pool[i].w;
        if (x <= 0) return pool[i].it.n;
    }
    return pool[pool.length - 1].it.n;
}

// ==========================================
// 출산 아이템 효과
// ==========================================
(function hookBirthUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || !cat.birth) return _use.apply(this, arguments);
        if (window._birthOk !== itemName) return _use.apply(this, arguments);
        window._birthOk = null;

        const msg = [];
        const heal = cat.heal || (cat.effect === 'heal' ? cat.value : 0);
        if (heal) { currentUser.pollution = Math.max(0, currentUser.pollution - heal); msg.push(`오염도 -${heal}%`); }
        if (cat.point) { currentUser.points += cat.point; msg.push(`+${cat.point.toLocaleString()} P`); }
        if (cat.ticket) {
            if (!currentUser.facilityMax) currentUser.facilityMax = 20;
            currentUser.facilityMax = Math.min(40, currentUser.facilityMax + cat.ticket);
            msg.push(`공용시설 +${cat.ticket}회`);
        }
        if (cat.dark) { currentUser.darkTries = Math.max(0, (currentUser.darkTries || 0) - cat.dark); msg.push(`어둠 탐사 +${cat.dark}회`); }
        if (cat.effect === 'b_blind') {
            currentUser.blindfoldUntil = Math.max(currentUser.blindfoldUntil || 0, Date.now()) + cat.value * 3600000;
            msg.push(`${cat.value}시간 오염 동결`);
        }
        if (cat.effect === 'b_luck' || cat.luck) {
            const h = cat.luck || cat.value;
            addTimedEffect(currentUser, '아이의 운', `공용시설 행운 ${cat.mult === 3 ? '세' : '두'} 배`, h);
            msg.push(`${h}시간 행운 상승`);
        }
        if (cat.bonus) { if (typeof nAdd === 'function') nAdd('c_batt', cat.bonus); msg.push(`다음 탐사 판정 +${cat.bonus}`); }
        if (cat.guard) { if (typeof nAdd === 'function') nAdd('c_pain', cat.guard); msg.push(`치명 방어 ${cat.guard}회`); }
        if (cat.reroll) { if (typeof nAdd === 'function') nAdd('c_reroll', cat.reroll); msg.push(`재굴림 ${cat.reroll}회`); }
        if (cat.hide) { if (typeof nAdd === 'function') nAdd('no_mark', cat.hide); msg.push(`지목 회피 ${cat.hide}회`); }

        removeItemFromInventory(currentUser, itemName, 1);
        addHistoryLog(currentUser, `[출산품] ${itemName} 사용`);
        saveSelfFull();
        updateUI();
        showCustomAlert(`${itemName}\n\n${msg.join(' · ')}`);
    };
})();

// 확인 팝업을 거쳐 오도록
(function bridgeConfirm() {
    const _u = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (cat && cat.birth && window._invOk === itemName) {
            window._birthOk = itemName;
        }
        return _u.apply(this, arguments);
    };
})();

// 행운 효과 연결
(function hookLuckChild() {
    if (typeof facilityLuckMult !== 'function') return;
    const _f = facilityLuckMult;
    facilityLuckMult = function (user) {
        let m = _f.apply(this, arguments);
        const u = user || currentUser;
        if (u && (u.timedEffects || []).some(e => e.name === '아이의 운')) m *= 2;
        return m;
    };
})();

// 재굴림 연결
(function hookRerollChild() {
    if (typeof luckReroll !== 'function' || typeof nUse !== 'function') return;
    const _l = luckReroll;
    luckReroll = function (roll) {
        roll = _l.apply(this, arguments);
        if (darkRun && roll <= 7 && nUse('c_reroll')) {
            const nr = Math.floor(Math.random() * 20) + 1;
            if (typeof showDarkToast === 'function') showDarkToast(`◈ 다시 굴린다. (${roll} → ${nr})`);
            return nr;
        }
        return roll;
    };
})();

console.log('[DNA] 출산 아이템 70종 등록');