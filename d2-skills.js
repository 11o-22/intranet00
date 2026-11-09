// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 기술 표 (공통 144 · 고유 17 · 발버둥) · PP · 학습 · 장착
// bundles.json 마지막 묶음 — d2-core.js 뒤 (D2 · DOLL · PET 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 2단계
//   기획 탭 「기술」「고유 기술」 과 「공통 규칙 02 · 09」「조는 도깨비 01·06」 을 옮겼다.
//   ★ 아직 전투에 쓰지 않는다 (3단계에서 엔진이 이 표를 읽는다). 상담사 콘솔 d2Skills() · d2Learn() 로만 본다.
//
// ■ 번호
//   공격 원형 17 × 속성 5 = 85  —  물 1~17 · 불 77~93 · 얼음 94~110 · 꽃 111~127 · 소리 128~144  (같은 원형은 수치·효과가 같다)
//   무속성 유틸 41 — 18~58 · 발버둥 59 (숨김 · 배우거나 끼울 수 없다 · PP 없음)
//   고유 17 — 60~76 · 전용 캐릭터 봉제인형만 (sp 26~42) · PP 5
//
// ■ 한 기술 (BY[번호])
//   no 번호 · n 이름 · el 속성('wet'·'heat'·'cold'·'scent'·'noise' · null 무속성 · 'self' 쓰는 인형의 속성) · arch 원형 번호
//   slot 'A' 공격기 | 'U' 유틸기 · pp 최대 PP · pw 위력(없으면 null) · acc 명중(1 · 0.9 · 0.85 · 0.1 · 'sure' 필중 · null 판정 없음)
//   kind 'phys' 물리 | 'mag' 마법 | 'spec' 특수(즉사) | null · pri 우선도 (4 교체 · 2 방어류 · 1 선제 · 0 일반) · tgt 'foe'·'self'·'field'·'ally'·'foeside'
//   fx 효과 조각 — 3단계 엔진이 읽는다 (아래 ARCH · UNIQ) · only 전용 인형 sp · desc 인게임 설명
//
// ■ 학습 · 장착 (공통 규칙 01.3 · 09.1)
//   배운 기술 = 끼운 기술. 공격기 3칸 + 유틸기 2칸, 합계 1~5개. 빈칸 허용. 마지막 한 개를 잊어 0 개로 만드는 변경은 실패.
//   공통 공격기는 자기 속성 전체 + 다른 속성의 위력 60 (원형 3) 만. 무속성 유틸은 누구나. 고유는 전용 인형만. 발버둥은 못 배운다.
//   ★ 회복2(19)의 「속성 전용·특수 개체만 습득」 은 캐릭터 봉제인형만 배우는 것으로 두었다 (기획에 더 자세한 말이 없다).
//   레벨 제한 없음 · 비용 없음(기획 미정).
//
// ■ PP (01.4 · 조는 도깨비 06)
//   시도하면 1 소모 (실패도). 0 이면 못 쓴다. 잊어도 기록은 남고 다시 배우면 그 PP 로. 처음 배울 때만 최대. 회복은 아이템(5단계)으로만.
//
// ■ 인형 기록에 더해지는 것 (u.pets[열쇠])
//   mv  { a: [번호,번호,번호], u: [번호,번호] }   끼운 기술 (0 = 빈칸)
//   pp  { 번호: 남은 PP }                          개체·기술별 PP 기록 (잊은 것도 남는다)
//
// ■ 처음 기술 (기획에 없어 정한 것)
//   야생 · 알 · 옮겨 오는 인형: 자기 속성의 일반공격1 + (D: 공격 하나 더 · C 이상: 둘 더) + 유틸 하나. 캐릭터 인형은 고유 기술을 더한다 (공격 고유는 공격기 칸에).
//   결정적 난수 (열쇠 · 태어난 때) 로 뽑아 기기마다 같다.
//
// ■ 콘솔
//   d2Skills(속성)        기술 표 (속성을 주면 그 속성 공격 17 + 유틸)
//   d2Learn(열쇠)         내 인형이 배울 수 있는 기술 · 지금 끼운 것

(function d2skills() {
'use strict';

const EL = { wet: '물', heat: '불', cold: '얼음', scent: '꽃', noise: '소리' };
const EL_KEYS = ['wet', 'heat', 'cold', 'scent', 'noise'];
const RANKS = ['atk', 'chm', 'def', 'sta', 'spd', 'acc', 'eva'];
const RANK_NAME = { atk: '공격력', chm: '매력', def: '방어력', sta: '굳건함', spd: '속도', acc: '명중률', eva: '회피율' };

// ── 공격 원형 17 (수치 · 효과) — 모든 속성이 같다
//   fx: recoil 반동 비율 · rest 다음 턴 강제 휴식 · status 명중 시 상태(확률 1) · flinch 풀죽음(등장당 1회) · ohko 즉사 · rank {who, k, n, p} 명중 시 확률 랭크
const ARCH = {
    1:  { an: '일반공격1', pp: 20, pw: 20,  acc: 1,    kind: 'phys', pri: 0, fx: {} },
    2:  { an: '일반공격2', pp: 15, pw: 40,  acc: 1,    kind: 'mag',  pri: 0, fx: {} },
    3:  { an: '속성공격1', pp: 10, pw: 60,  acc: 1,    kind: 'phys', pri: 0, fx: {}, any: 1 },           // 다른 속성 인형도 배운다
    4:  { an: '속성공격2', pp: 8,  pw: 90,  acc: 0.9,  kind: 'mag',  pri: 0, fx: {} },
    5:  { an: '반동공격1', pp: 5,  pw: 120, acc: 0.85, kind: 'phys', pri: 0, fx: { recoil: 0.25 } },
    6:  { an: '궁극공격1', pp: 3,  pw: 150, acc: 0.9,  kind: 'mag',  pri: 0, fx: { rest: 1 } },
    7:  { an: '상태공격1', pp: 10, pw: 20,  acc: 1,    kind: 'mag',  pri: 0, fx: { status: 'poison' } },
    8:  { an: '상태공격2', pp: 10, pw: 20,  acc: 1,    kind: 'phys', pri: 0, fx: { status: 'para' } },
    9:  { an: '기습공격1', pp: 10, pw: 20,  acc: 'sure', kind: 'phys', pri: 1, fx: {} },
    10: { an: '풀죽음공격1', pp: 5, pw: 20, acc: 1,    kind: 'mag',  pri: 1, fx: { flinch: 1, oncePerAppear: 1 } },
    11: { an: '즉사공격1', pp: 3,  pw: null, acc: 0.1, kind: 'spec', pri: 0, fx: { ohko: 1 } },
    12: { an: '돌진공격',   pp: 15, pw: 40, acc: 1,    kind: 'phys', pri: 0, fx: { rank: { who: 'self', k: 'spd', n: 1, p: 0.35 } } },
    13: { an: '경쾌한공격', pp: 15, pw: 40, acc: 1,    kind: 'mag',  pri: 0, fx: { rank: { who: 'self', k: 'eva', n: 1, p: 0.35 } } },
    14: { an: '침착한공격', pp: 15, pw: 40, acc: 1,    kind: 'mag',  pri: 0, fx: { rank: { who: 'self', k: 'acc', n: 1, p: 0.35 } } },
    15: { an: '짖기',       pp: 15, pw: 40, acc: 1,    kind: 'phys', pri: 0, fx: { rank: { who: 'self', k: 'atk', n: 1, p: 0.35 } } },
    16: { an: '꾸짖기',     pp: 15, pw: 40, acc: 1,    kind: 'mag',  pri: 0, fx: { rank: { who: 'foe', k: 'atk', n: -1, p: 0.35 } } },
    17: { an: '놀래키기',   pp: 15, pw: 40, acc: 1,    kind: 'phys', pri: 0, fx: { rank: { who: 'foe', k: 'acc', n: -1, p: 0.35 } } }
};
// ── 속성별 이름 — base 가 원형 1 의 번호
const ELN = {
    wet: { base: 1, n: ['물방울치기', '잔물결 무늬', '물살 들이받기', '깊은 물결', '격류 돌진', '바다의 자장가', '고인 물의 속삭임', '저린 물방울', '물수제비', '갑작스런 물벼락', '심해의 초대', '물살 타기', '물안개 숨기', '고요한 수면', '파도 주먹', '가라앉는 속삭임', '얼굴에 물 튀기기'] },
    heat: { base: 77, n: ['불씨 툭', '촛불 춤', '불꽃 몸통박치기', '화염 소용돌이', '잿불 돌진', '별을 삼킨 불꽃', '매캐한 재', '그을린 발자국', '불똥 찍기', '깜짝 불꽃', '꺼지는 심지', '불꽃 질주', '아지랑이 숨기', '심지 바로 세우기', '달아오른 솜주먹', '잿빛 꾸지람', '재 뿌리기'] },
    cold: { base: 94, n: ['얼음콩', '서리 수놓기', '고드름 찌르기', '한겨울의 숨결', '빙산 들이받기', '끝없는 설야', '묵은 성에', '얼얼한 얼음 깨물기', '서리 발톱', '얼음 거울 번쩍', '영원의 빙실', '빙판 미끄럼', '눈보라 숨기', '얼음 렌즈', '단단한 눈주먹', '찬바람 꾸지람', '눈가루 툭'] },
    scent: { base: 111, n: ['꽃잎 툭', '꽃향기 물결', '가시 찌르기', '만개하는 꿈', '덩굴 돌진', '달빛 아래 만개', '독꽃가루', '저린 가시', '꽃잎 기습', '봉오리 팡', '시드는 마지막 꽃잎', '덩굴 도약', '꽃잎 숨기', '이슬 머금은 눈', '가시 솜주먹', '풀이 죽는 향기', '꽃가루 털기'] },
    noise: { base: 128, n: ['방울 툭', '작은 콧노래', '큰북 들이받기', '불협화음', '종 몸통박치기', '피날레 합창', '탁한 자장가', '얼얼한 딱딱이', '찰나의 캐스터네츠', '깜짝 심벌즈', '마지막 종소리', '박자 맞춰 돌진', '메아리 숨기', '조율하는 울림', '북채 솜주먹', '기죽이는 저음', '귓가에 딸랑'] }
};
// ── 무속성 유틸 41 + 발버둥
//   fx: heal 자기 회복 비율 · healFoe 상대 회복 · rest · guard 'full'|'half'(reflect .5) · endure 버티기 · status(필중 상태) · ranks [{who,k,n}] · baton · prio3 선제태세 · focus 집중 · destiny 동귀어진 · struggle 발버둥
const UTIL = {
    18: { pp: 5,  cat: '회복', pri: 0, tgt: 'self', fx: { heal: 0.25 } },
    19: { pp: 5,  cat: '회복', pri: 0, tgt: 'self', fx: { heal: 0.5 }, chrOnly: 1 },
    20: { pp: 5,  cat: '회복', pri: 0, tgt: 'self', fx: { heal: 0.5, rest: 1 } },
    21: { pp: 5,  cat: '회복', pri: 0, tgt: 'self', fx: { heal: 1, healFoe: 0.5 } },
    22: { pp: 10, cat: '방어', pri: 2, tgt: 'self', fx: { guard: 'full', noRepeat: 1 } },
    23: { pp: 15, cat: '방어', pri: 2, tgt: 'self', fx: { guard: 'half', reflect: 0.5 } },
    24: { pp: 25, cat: '상태변화', pri: 0, tgt: 'foe', fx: { status: 'poison' } },
    25: { pp: 25, cat: '상태변화', pri: 0, tgt: 'foe', fx: { status: 'para' } },
    54: { pp: 25, cat: '특수 유틸', pri: 0, tgt: 'self', fx: { baton: 1 } },
    55: { pp: 25, cat: '특수 유틸', pri: 0, tgt: 'self', fx: { prio3: 3 } },
    56: { pp: 25, cat: '특수 유틸', pri: 0, tgt: 'self', fx: { focus: 1 } },
    57: { pp: 5,  cat: '특수 유틸', pri: 2, tgt: 'self', fx: { endure: 1 } },
    58: { pp: 5,  cat: '특수 유틸', pri: 0, tgt: 'foe',  fx: { destiny: 1 } },
    59: { pp: null, cat: '시스템', pri: 0, tgt: 'foe', fx: { struggle: 1, pw: 15 }, hidden: 1 }
};
// 랭크 기술 26~53 — 표로 만든다
(function () {
    const R7 = RANKS;
    R7.forEach(function (k, i) {
        UTIL[26 + i] = { pp: 25, cat: '랭크 상승', pri: 0, tgt: 'self', fx: { ranks: [{ who: 'self', k: k, n: 1 }] } };
        UTIL[33 + i] = { pp: 25, cat: '랭크 하락', pri: 0, tgt: 'foe',  fx: { ranks: [{ who: 'foe', k: k, n: -1 }] } };
    });
    // 고급 상승 40~46: +2 / -1
    [['atk', 'def'], ['chm', 'sta'], ['def', 'spd'], ['sta', 'atk'], ['spd', 'def'], ['acc', 'eva'], ['eva', 'acc']].forEach(function (p, i) {
        UTIL[40 + i] = { pp: 25, cat: '고급 랭크 상승', pri: 0, tgt: 'self', fx: { ranks: [{ who: 'self', k: p[0], n: 2 }, { who: 'self', k: p[1], n: -1 }] } };
    });
    // 고급 하락 47~53: 상대 -2 / 자신 -1
    [['atk', 'def'], ['chm', 'sta'], ['def', 'atk'], ['sta', 'chm'], ['spd', 'spd'], ['acc', 'eva'], ['eva', 'acc']].forEach(function (p, i) {
        UTIL[47 + i] = { pp: 25, cat: '고급 랭크 하락', pri: 0, tgt: 'foe', fx: { ranks: [{ who: 'foe', k: p[0], n: -2 }, { who: 'self', k: p[1], n: -1 }] } };
    });
})();
const UTIL_NAME = {
    18: '솜 고르기',
    19: '달빛 수선',
    20: '깊은잠 수선',
    21: '함께 꿰맨 꿈',
    22: '꼭 껴안기',
    23: '되받는 솜',
    24: '묵은 솜먼지',
    25: '실밥 묶기',
    26: '주먹 꾹',
    27: '리본 단장',
    28: '솜 단단히',
    29: '마음 꿰매기',
    30: '가벼운 발걸음',
    31: '눈매 단정히',
    32: '살금살금',
    33: '힘 빠지는 잔소리',
    34: '시무룩한 시선',
    35: '느슨한 솔기',
    36: '마음의 실 풀기',
    37: '발목 실',
    38: '헝클어진 시선',
    39: '꼬리실 붙잡기',
    40: '무모한 솜주먹',
    41: '벅찬 리본',
    42: '겹겹이 박음질',
    43: '두터운 마음',
    44: '실밥 풀고 달리기',
    45: '한 땀 조준',
    46: '그림자 발걸음',
    47: '험악한 솜인상',
    48: '차가운 한마디',
    49: '솔기 헤집기',
    50: '꿈매듭 흔들기',
    51: '엉킨 발목실',
    52: '눈앞에 실타래',
    53: '그림자 꿰매기',
    54: '꿈 잇기',
    55: '선수치는 매듭',
    56: '한 땀 집중',
    57: '마지막 실 한 올',
    58: '끝맺는 매듭',
    59: '발버둥'
};
// ── 고유 17 (60~76) — 전용 인형 sp
const UNIQ = {
    60: { n: '읽어서 삭제하기', only: 26, slot: 'U', pp: 5, cat: '특수 유틸', pri: 0, tgt: 'foe',  acc: 'sure', fx: { erase: 1 } },
    61: { n: '희생양',          only: 27, slot: 'U', pp: 5, cat: '특수 유틸', pri: 0, tgt: 'self', acc: null,   fx: { decoy: 0.25 } },
    62: { n: '아홉여우병',      only: 41, slot: 'U', pp: 5, cat: '상태변화', pri: 0, tgt: 'foe',  acc: 'sure', fx: { status: 'fox' } },
    63: { n: '황룡의 계약',     only: 39, slot: 'U', pp: 5, cat: '특수 유틸', pri: 0, tgt: 'field', acc: null,  fx: { reverse: 2 } },
    64: { n: '나비 네일팁',     only: 40, slot: 'U', pp: 5, cat: '설치 유틸', pri: 0, tgt: 'foeside', acc: null, fx: { nailtip: 1 } },
    65: { n: '착한사람!',       only: 37, slot: 'U', pp: 5, cat: '행동 제한', pri: 0, tgt: 'foe',  acc: 'sure', fx: { limit: 'util', turns: 2 } },
    66: { n: '잠깐, 실례!',     only: 28, slot: 'A', pp: 5, cat: '공격', pri: 0, tgt: 'foe', el: 'self', pw: 20, acc: 1, kind: 'phys', fx: { reveal: 1 } },
    67: { n: '물리퇴마',        only: 32, slot: 'U', pp: 5, cat: '랭크 상승', pri: 0, tgt: 'self', acc: null, fx: { ranks: [{ who: 'self', k: 'atk', n: 2 }] } },
    68: { n: '교육서 확인하기', only: 42, slot: 'U', pp: 5, cat: '복합 랭크 변화', pri: 0, tgt: 'self', acc: null, fx: { ranks: [{ who: 'self', k: 'def', n: -1 }, { who: 'self', k: 'sta', n: -1 }, { who: 'self', k: 'atk', n: 1 }, { who: 'self', k: 'chm', n: 1 }, { who: 'self', k: 'spd', n: 1 }] } },
    69: { n: '양초 밝히기',     only: 38, slot: 'U', pp: 5, cat: '무작위 유틸', pri: 0, tgt: 'self', acc: null, fx: { candle: 1 } },
    70: { n: '한 번 더 보여주게!', only: 30, slot: 'U', pp: 5, cat: '행동 제한', pri: 0, tgt: 'foe', acc: 'sure', fx: { limit: 'last', turns: 2 } },
    71: { n: '도넛 먹기',       only: 31, slot: 'U', pp: 5, cat: '지속 회복', pri: 0, tgt: 'self', acc: null, fx: { donut: 1 / 16 } },
    72: { n: '자전거 타기',     only: 33, slot: 'U', pp: 5, cat: '랭크 상승', pri: 0, tgt: 'self', acc: null, fx: { ranks: [{ who: 'self', k: 'spd', n: 2 }] } },
    73: { n: '쇼 타임!',        only: 34, slot: 'U', pp: 5, cat: '강제 기절 예약', pri: 0, tgt: 'field', acc: null, fx: { showtime: 2 } },
    74: { n: 'B조, 교대!',      only: 36, slot: 'U', pp: 5, cat: '교체·회복', pri: 4, tgt: 'ally', acc: null, fx: { swapHeal: 1 / 8 } },
    75: { n: '똑바로 붙어!',    only: 35, slot: 'A', pp: 5, cat: '공격', pri: 0, tgt: 'foe', el: 'self', pw: 40, acc: 1, kind: 'phys', fx: { resetRanks: 1 } },
    76: { n: '괜찮습니다, 제가 할게요', only: 29, slot: 'U', pp: 5, cat: '아군 회복', pri: 0, tgt: 'ally', acc: null, fx: { allyHeal: 0.25 } }
};
const DESC = {"1": "작은 물방울을 솜발로 톡 튕긴다. 가벼운 공격으로, 부가효과가 없다.",
    "2": "옷감에 번진 잔물결 무늬가 상대를 때린다. 정확하게 공격한다. 부가효과가 없다.",
    "3": "단단한 물살을 두르고 몸으로 부딪친다. 안정적으로 적중하는 기본 공격이다.",
    "4": "깊은 꿈속에서 커다란 물결을 불러낸다. 강하게 공격하지만 기본 명중률은 90%다.",
    "5": "거센 물살과 함께 온몸을 던진다. 적중해 실제로 깎은 상대 인형 또는 대타 HP의 25%만큼 자신도 반동 피해를 받는다.",
    "6": "봉제선 사이로 흘러나온 노래가 바다를 깨운다. 아주 강하게 공격한다. 사용 후 다음 한 턴은 지쳐서 기술을 쓸 수 없다.",
    "7": "오래 고인 꿈의 물을 상대에게 스며들게 한다. 적중하면 상대를 독 상태로 만든다.",
    "8": "찌릿한 물방울을 묻힌 솜발로 상대를 친다. 적중하면 상대를 마비 상태로 만든다.",
    "9": "물수제비처럼 재빠르게 상대를 찍는다. 우선 공격하며 명중·회피 판정으로 빗나가지 않는다. 완전 방어는 뚫지 못한다.",
    "10": "예고 없이 꿈의 물벼락을 쏟는다. 우선 공격하고 적중하면 상대의 아직 남은 이번 턴 기술 행동을 막는다. 등장할 때마다 한 번만 시도할 수 있다.",
    "11": "돌아오는 길이 없는 깊은 물로 상대를 초대한다. 기본 명중률은 10%. 적중하면 상대를 즉시 기절시키지만, 어둠에게는 통하지 않는다.",
    "12": "빠른 물살을 타고 미끄러지듯 부딪친다. 적중하면 35% 확률로 자신의 속도를 1랭크 올린다.",
    "13": "상대를 공격하며 자신의 윤곽을 물안개에 감춘다. 적중하면 35% 확률로 자신의 회피율을 1랭크 올린다.",
    "14": "물결을 가라앉혀 상대의 모습을 또렷이 비춘다. 적중하면 35% 확률로 자신의 명중률을 1랭크 올린다.",
    "15": "솜주먹에 작은 파도를 감아 내지른다. 적중하면 35% 확률로 자신의 공격력을 1랭크 올린다.",
    "16": "가라앉는 꿈의 속삭임으로 상대를 공격한다. 적중하면 35% 확률로 상대의 공격력을 1랭크 내린다.",
    "17": "상대의 얼굴에 물을 힘껏 튀긴다. 적중하면 35% 확률로 상대의 명중률을 1랭크 내린다.",
    "18": "흐트러진 솜을 차분히 고른다. 자신의 최대 HP의 25%를 회복한다.",
    "19": "달빛 같은 실로 벌어진 솔기를 꿰맨다. 자신의 최대 HP의 50%를 회복한다.",
    "20": "꿈 깊숙이 몸을 맡겨 솔기를 고친다. 최대 HP의 50%를 회복하지만, 다음 한 턴은 쉬어야 한다.",
    "21": "너와 나의 해진 꿈을 함께 꿰맨다. 자신의 HP를 전부 회복하고, 상대도 상대 최대 HP의 50%를 회복한다.",
    "22": "몸을 꼭 웅크려 소중한 솔기를 지킨다. 우선 행동해 이번 턴 공격을 완전히 막지만, 성공한 다음 턴에 연속으로 쓰면 실패한다. 일반 유틸기는 막지 못한다.",
    "23": "푹신한 솜으로 충격을 받아 되돌린다. 우선 행동해 이번 턴 공격 피해를 절반으로 줄이고, 실제 받은 피해의 절반을 상대에게 돌려준다.",
    "24": "낡은 솜에서 나온 꺼림칙한 먼지를 뿌린다. 상대를 독 상태로 만든다.",
    "25": "보이지 않는 실밥으로 상대의 움직임을 묶는다. 상대를 마비 상태로 만든다.",
    "26": "솜주먹을 꾹 쥐고 용기를 낸다. 자신의 공격력을 1랭크 올린다.",
    "27": "삐뚤어진 리본을 예쁘게 고쳐 맨다. 자신의 매력을 1랭크 올린다.",
    "28": "느슨한 솜을 단단히 뭉친다. 자신의 방어력을 1랭크 올린다.",
    "29": "흔들리는 마음에 작은 바느질을 놓는다. 자신의 굳건함을 1랭크 올린다.",
    "30": "발끝의 먼지를 털고 사뿐히 선다. 자신의 속도를 1랭크 올린다.",
    "31": "단추 눈의 각도를 바로잡는다. 자신의 명중률을 1랭크 올린다.",
    "32": "그림자를 밟지 않듯 조심스레 움직인다. 자신의 회피율을 1랭크 올린다.",
    "33": "쉴 새 없는 잔소리로 솜주먹의 힘을 뺀다. 상대의 공격력을 1랭크 내린다.",
    "34": "상대의 멋진 단장에 시무룩한 눈길을 보낸다. 상대의 매력을 1랭크 내린다.",
    "35": "상대의 솔기 사이에 틈을 만든다. 상대의 방어력을 1랭크 내린다.",
    "36": "단단히 묶인 마음의 실을 살짝 푼다. 상대의 굳건함을 1랭크 내린다.",
    "37": "발목에 달라붙는 가느다란 실을 보낸다. 상대의 속도를 1랭크 내린다.",
    "38": "단추 눈 앞에서 꿈의 실을 어지럽힌다. 상대의 명중률을 1랭크 내린다.",
    "39": "달아나는 꼬리실을 꼭 붙잡는다. 상대의 회피율을 1랭크 내린다.",
    "40": "솔기가 벌어지는 것도 잊고 힘을 모은다. 자신의 공격력을 2랭크 올리고 방어력을 1랭크 내린다.",
    "41": "가슴 벅찬 마음을 리본에 가득 담는다. 자신의 매력을 2랭크 올리고 굳건함을 1랭크 내린다.",
    "42": "두꺼운 바느질로 온몸을 단단히 감싼다. 자신의 방어력을 2랭크 올리고 속도를 1랭크 내린다.",
    "43": "흔들리지 않도록 마음을 두껍게 꿰맨다. 자신의 굳건함을 2랭크 올리고 공격력을 1랭크 내린다.",
    "44": "몸을 조이던 실밥을 풀고 달린다. 자신의 속도를 2랭크 올리고 방어력을 1랭크 내린다.",
    "45": "한 땀을 꿰매듯 상대에게만 집중한다. 자신의 명중률을 2랭크 올리고 회피율을 1랭크 내린다.",
    "46": "그림자 사이를 옮겨 다니느라 시야가 흔들린다. 자신의 회피율을 2랭크 올리고 명중률을 1랭크 내린다.",
    "47": "몸을 활짝 벌려 험악한 인상을 짓는다. 상대의 공격력을 2랭크 내리는 대신 자신의 방어력도 1랭크 내린다.",
    "48": "상처가 남을 만큼 차가운 말을 건넨다. 상대의 매력을 2랭크 내리는 대신 자신의 굳건함도 1랭크 내린다.",
    "49": "빈틈을 찾느라 자기 주먹의 힘을 푼다. 상대의 방어력을 2랭크 내리고 자신의 공격력을 1랭크 내린다.",
    "50": "상대의 마음을 묶은 꿈매듭을 흔든다. 상대의 굳건함을 2랭크 내리고 자신의 매력을 1랭크 내린다.",
    "51": "함께 엉킬 각오로 끈질긴 실을 보낸다. 상대의 속도를 2랭크 내리고 자신의 속도를 1랭크 내린다.",
    "52": "꿈의 실타래로 시야를 가린다. 상대의 명중률을 2랭크 내리고 자신의 회피율을 1랭크 내린다.",
    "53": "상대의 그림자를 꿰매느라 눈을 떼지 못한다. 상대의 회피율을 2랭크 내리고 자신의 명중률을 1랭크 내린다.",
    "54": "다음 동료에게 이어 줄 꿈의 매듭을 묶는다. 다음 턴 최우선으로 교체하며 7종 랭크와 일시 강화의 남은 효과를 넘긴다. 상태이상은 넘기지 않는다.",
    "55": "몸의 매듭을 빠르게 당겨 공격할 준비를 한다. 사용한 턴을 포함해 3턴간 공격기가 선제공격이 된다. 준비 뒤 활용할 수 있는 턴은 최대 2턴이다.",
    "56": "단추 눈을 좁히고 다음 한 땀을 겨눈다. 다음 공격은 명중·회피로 빗나가지 않지만 완전 방어는 뚫지 못한다. 어둠에게는 필중 효과가 없다.",
    "57": "마지막 실 한 올로 몸을 붙든다. 우선 행동해 이번 턴 HP를 1 남기고 버틴다. 즉사와 독도 견디지만, 스스로 기절하는 효과는 막지 못한다.",
    "58": "자신의 마지막 매듭을 풀어 상대의 HP를 1로 만든 뒤 기절한다. 상대가 완전 방어로 버텨도 자신의 기절은 막을 수 없다.",
    "59": "쓸 수 있는 기술이 하나도 남지 않아 온몸으로 버둥거린다. 공격력과 매력 중 높은 쪽으로 피해를 주는 위력 15의 무속성 공격이다.",
    "60": "상대의 능력치를 읽고 가장 큰 수치의 차이를 지운다. 다음 턴부터 최고 능력치 하나가 최저 능력치와 같아진다. 랭크는 그대로이며 효과는 전투 종료까지 남는다.",
    "61": "최대 HP의 1/4을 내어 대신 맞을 대타를 세운다. HP는 1 남기며, 실제 내준 HP만큼 대타가 버틴다. 교체해도 유지되고 즉사도 대신 받지만 독·마비·반동은 막지 못한다.",
    "62": "웃는 여우의 병을 옮긴다. 상대에게 실제로 생긴 랭크 상승·하락이 현재 아군에게도 똑같이 적용된다. 상대가 교체하거나 다른 상태이상에 걸리면 풀린다.",
    "63": "황룡의 이름으로 순서를 다시 계약한다. 다음 턴부터 2턴간 같은 우선순위에서는 느린 인형이 먼저 움직인다.",
    "64": "상대 바닥에 날카로운 네일팁을 흩뿌린다. 상대는 물리 공격 후 최대 HP의 1/16 피해를 받는다. 두 번 쌓이면 1/8이며 전투 종료까지 남는다.",
    "65": "착한 사람이 될 차례라고 환하게 웃는다. 다음 턴부터 2턴간 상대는 유틸기만 쓸 수 있다. 상대가 교체하면 풀린다.",
    "66": "가볍게 부딪히는 척 정보를 슬쩍 확인한다. 위력 20의 물리 공격이 적중하면 상대의 특성과 특기 능력치 두 종류를 알아낸다.  기술 속성은 사용하는 인형의 속성을 따른다.",
    "67": "복잡한 절차 대신 단단한 주먹을 준비한다. 자신의 공격력을 2랭크 올린다.",
    "68": "교육서를 펼쳐 배운 대로 움직인다. 자신의 방어력·굳건함을 1랭크씩 내리고 공격력·매력·속도를 1랭크씩 올린다.",
    "69": "어둠 속에 작은 양초를 밝힌다. 완전 방어 40%, 최대 HP 25% 회복 40%, 7종 중 무작위 능력치 2랭크 상승 20% 중 하나가 나온다. 연속 완전 방어는 실패한다.",
    "70": "흥미로운 장면을 다시 보여 달라고 재촉한다. 다음 턴부터 2턴간 상대는 마지막으로 사용한 기술만 쓸 수 있다. 상대가 교체하면 풀린다.",
    "71": "느긋하게 도넛을 베어 문다. 교체할 때까지 매 턴 끝에 최대 HP의 1/16을 회복한다. 이미 먹고 있다면 다시 먹을 수 없다.",
    "72": "자전거 페달을 힘껏 밟는다. 자신의 속도를 2랭크 올린다.",
    "73": "마지막 무대를 알리는 카운트다운이 시작된다. 지금 나온 양측 인형은 다음 두 턴이 끝나면 반드시 기절한다. 교체해야만 카운트다운을 취소할 수 있다.",
    "74": "조장의 지시에 맞춰 동료와 자리를 바꾼다. 즉시 일반 교체하고, 새로 나온 동료의 최대 HP의 1/8을 회복한다. 추가 행동은 하지 않는다.",
    "75": "복잡한 잔재주를 걷어 내고 정면으로 부딪친다. 적중하면 피해 계산 전 양측의 모든 랭크를 0으로 초기화하는 위력 40의 물리 공격이다.  기술 속성은 사용하는 인형의 속성을 따른다.",
    "76": "자신의 솔기를 내어 동료를 수선한다. HP 1은 남기고 최대 HP의 1/4까지 내주어, 생존한 대기 아군 하나를 실제 내준 HP의 두 배만큼 회복한다.",
    "77": "작은 불씨를 솜발로 툭 건드려 날린다. 가벼운 공격으로, 부가효과가 없다.",
    "78": "촛불의 춤추는 그림자가 상대를 때린다. 정확하게 공격한다. 부가효과가 없다.",
    "79": "불꽃을 두른 몸으로 정면을 들이받는다. 안정적으로 적중하는 기본 공격이다.",
    "80": "꿈속의 화염을 소용돌이로 엮어 덮친다. 강하게 공격하지만 기본 명중률은 90%다.",
    "81": "꺼지지 않은 잿불을 두르고 거칠게 돌진한다. 적중해 실제로 깎은 상대 인형 또는 대타 HP의 25%만큼 자신도 반동 피해를 받는다.",
    "82": "작은 가슴에 품었던 별빛을 거대한 불꽃으로 터뜨린다. 아주 강하게 공격한다. 사용 후 다음 한 턴은 지쳐서 기술을 쓸 수 없다.",
    "83": "묵은 재에 깃든 매캐한 기운으로 공격한다. 적중하면 상대를 독 상태로 만든다.",
    "84": "뜨겁게 달군 솜발을 상대에게 꾹 찍는다. 적중하면 상대를 마비 상태로 만든다.",
    "85": "눈 깜짝할 새 작은 불똥을 꽂는다. 우선 공격하며 명중·회피 판정으로 빗나가지 않는다. 완전 방어는 뚫지 못한다.",
    "86": "갑자기 피어나는 불꽃 환영으로 상대를 덮친다. 우선 공격하고 적중하면 상대의 아직 남은 이번 턴 기술 행동을 막는다. 등장할 때마다 한 번만 시도할 수 있다.",
    "87": "상대의 꿈을 밝히던 마지막 심지를 끈다. 기본 명중률은 10%. 적중하면 상대를 즉시 기절시키지만, 어둠에게는 통하지 않는다.",
    "88": "발끝에 불꽃을 붙여 쏜살같이 부딪친다. 적중하면 35% 확률로 자신의 속도를 1랭크 올린다.",
    "89": "공격하며 뜨거운 아지랑이 속으로 모습을 흐린다. 적중하면 35% 확률로 자신의 회피율을 1랭크 올린다.",
    "90": "흔들리던 심지를 곧게 세우고 불빛을 겨눈다. 적중하면 35% 확률로 자신의 명중률을 1랭크 올린다.",
    "91": "점점 달아오르는 솜주먹으로 상대를 친다. 적중하면 35% 확률로 자신의 공격력을 1랭크 올린다.",
    "92": "기세를 식히는 잿빛 목소리로 공격한다. 적중하면 35% 확률로 상대의 공격력을 1랭크 내린다.",
    "93": "솜발에 모아 둔 재를 상대 얼굴에 턴다. 적중하면 35% 확률로 상대의 명중률을 1랭크 내린다.",
    "94": "작은 얼음 알갱이를 톡 던진다. 가벼운 공격으로, 부가효과가 없다.",
    "95": "꿈의 서리 무늬를 허공에 수놓아 상대를 때린다. 정확하게 공격한다. 부가효과가 없다.",
    "96": "솜발에 쥔 고드름으로 상대를 찌른다. 안정적으로 적중하는 기본 공격이다.",
    "97": "한겨울의 차가운 꿈을 숨결에 실어 보낸다. 강하게 공격하지만 기본 명중률은 90%다.",
    "98": "빙산 같은 얼음 덩어리를 두르고 들이받는다. 적중해 실제로 깎은 상대 인형 또는 대타 HP의 25%만큼 자신도 반동 피해를 받는다.",
    "99": "끝없는 눈 내리는 밤을 불러 상대를 삼킨다. 아주 강하게 공격한다. 사용 후 다음 한 턴은 지쳐서 기술을 쓸 수 없다.",
    "100": "오래 묵은 성에에 밴 해로운 기운으로 공격한다. 적중하면 상대를 독 상태로 만든다.",
    "101": "얼음처럼 얼얼한 이빨로 상대를 깨문다. 적중하면 상대를 마비 상태로 만든다.",
    "102": "작은 서리 발톱을 재빨리 내민다. 우선 공격하며 명중·회피 판정으로 빗나가지 않는다. 완전 방어는 뚫지 못한다.",
    "103": "얼음 거울에 갑작스런 섬광을 비춰 공격한다. 우선 공격하고 적중하면 상대의 아직 남은 이번 턴 기술 행동을 막는다. 등장할 때마다 한 번만 시도할 수 있다.",
    "104": "깨어날 수 없는 얼음방으로 상대를 부른다. 기본 명중률은 10%. 적중하면 상대를 즉시 기절시키지만, 어둠에게는 통하지 않는다.",
    "105": "발밑의 얼음을 타고 미끄러져 부딪친다. 적중하면 35% 확률로 자신의 속도를 1랭크 올린다.",
    "106": "상대를 공격하며 눈보라 속으로 몸을 감춘다. 적중하면 35% 확률로 자신의 회피율을 1랭크 올린다.",
    "107": "투명한 얼음 렌즈로 상대를 정확히 비춘다. 적중하면 35% 확률로 자신의 명중률을 1랭크 올린다.",
    "108": "꾹꾹 뭉친 눈주먹을 힘껏 내지른다. 적중하면 35% 확률로 자신의 공격력을 1랭크 올린다.",
    "109": "찬바람을 닮은 꾸지람으로 기세를 누른다. 적중하면 35% 확률로 상대의 공격력을 1랭크 내린다.",
    "110": "상대 눈앞에 눈가루를 툭 턴다. 적중하면 35% 확률로 상대의 명중률을 1랭크 내린다.",
    "111": "작은 꽃잎을 솜발로 툭 날린다. 가벼운 공격으로, 부가효과가 없다.",
    "112": "옷깃에서 번진 꽃향기를 꿈의 물결로 바꾼다. 정확하게 공격한다. 부가효과가 없다.",
    "113": "단단한 가시를 앞세워 상대를 찌른다. 안정적으로 적중하는 기본 공격이다.",
    "114": "잠들어 있던 꽃봉오리의 꿈을 한꺼번에 피운다. 강하게 공격하지만 기본 명중률은 90%다.",
    "115": "덩굴을 온몸에 감고 상대에게 돌진한다. 적중해 실제로 깎은 상대 인형 또는 대타 HP의 25%만큼 자신도 반동 피해를 받는다.",
    "116": "달빛에 젖은 꽃밭을 눈부시게 피워 올린다. 아주 강하게 공격한다. 사용 후 다음 한 턴은 지쳐서 기술을 쓸 수 없다.",
    "117": "해로운 꽃가루를 꿈바람에 실어 보낸다. 적중하면 상대를 독 상태로 만든다.",
    "118": "저릿한 즙이 맺힌 가시로 상대를 찌른다. 적중하면 상대를 마비 상태로 만든다.",
    "119": "날카로운 꽃잎을 재빨리 날려 찍는다. 우선 공격하며 명중·회피 판정으로 빗나가지 않는다. 완전 방어는 뚫지 못한다.",
    "120": "바로 앞에서 꽃봉오리 환영을 팡 터뜨린다. 우선 공격하고 적중하면 상대의 아직 남은 이번 턴 기술 행동을 막는다. 등장할 때마다 한 번만 시도할 수 있다.",
    "121": "상대의 꿈에 남은 마지막 꽃잎을 시들게 한다. 기본 명중률은 10%. 적중하면 상대를 즉시 기절시키지만, 어둠에게는 통하지 않는다.",
    "122": "탄력 있는 덩굴을 딛고 뛰어 부딪친다. 적중하면 35% 확률로 자신의 속도를 1랭크 올린다.",
    "123": "공격하며 흩날리는 꽃잎 사이로 숨는다. 적중하면 35% 확률로 자신의 회피율을 1랭크 올린다.",
    "124": "맑은 이슬에 상대의 모습을 비춰 겨눈다. 적중하면 35% 확률로 자신의 명중률을 1랭크 올린다.",
    "125": "가시를 감은 솜주먹으로 상대를 친다. 적중하면 35% 확률로 자신의 공격력을 1랭크 올린다.",
    "126": "기운을 가라앉히는 꽃향기로 공격한다. 적중하면 35% 확률로 상대의 공격력을 1랭크 내린다.",
    "127": "상대 얼굴을 향해 꽃가루를 힘껏 턴다. 적중하면 35% 확률로 상대의 명중률을 1랭크 내린다.",
    "128": "작은 방울을 솜발로 툭 부딪친다. 가벼운 공격으로, 부가효과가 없다.",
    "129": "조그만 콧노래를 꿈의 파동으로 바꿔 보낸다. 정확하게 공격한다. 부가효과가 없다.",
    "130": "커다란 북을 앞세워 상대에게 들이받는다. 안정적으로 적중하는 기본 공격이다.",
    "131": "어긋난 음들을 겹쳐 거센 파동을 만든다. 강하게 공격하지만 기본 명중률은 90%다.",
    "132": "묵직한 종을 온몸으로 울리며 들이받는다. 적중해 실제로 깎은 상대 인형 또는 대타 HP의 25%만큼 자신도 반동 피해를 받는다.",
    "133": "가슴속 모든 소리를 모아 마지막 합창을 터뜨린다. 아주 강하게 공격한다. 사용 후 다음 한 턴은 지쳐서 기술을 쓸 수 없다.",
    "134": "낡은 자장가에 깃든 탁한 기운으로 공격한다. 적중하면 상대를 독 상태로 만든다.",
    "135": "상대를 얼얼하게 만드는 딱딱이로 내려친다. 적중하면 상대를 마비 상태로 만든다.",
    "136": "찰나에 울리는 캐스터네츠로 상대를 찍는다. 우선 공격하며 명중·회피 판정으로 빗나가지 않는다. 완전 방어는 뚫지 못한다.",
    "137": "예고 없이 커지는 심벌즈의 환영으로 공격한다. 우선 공격하고 적중하면 상대의 아직 남은 이번 턴 기술 행동을 막는다. 등장할 때마다 한 번만 시도할 수 있다.",
    "138": "상대의 꿈을 닫는 마지막 종을 울린다. 기본 명중률은 10%. 적중하면 상대를 즉시 기절시키지만, 어둠에게는 통하지 않는다.",
    "139": "점점 빨라지는 박자에 맞춰 몸으로 부딪친다. 적중하면 35% 확률로 자신의 속도를 1랭크 올린다.",
    "140": "공격하며 사방으로 번지는 메아리 속에 숨는다. 적중하면 35% 확률로 자신의 회피율을 1랭크 올린다.",
    "141": "흩어진 소리를 고르게 조율해 상대를 겨눈다. 적중하면 35% 확률로 자신의 명중률을 1랭크 올린다.",
    "142": "북채를 쥔 솜주먹으로 힘껏 내려친다. 적중하면 35% 확률로 자신의 공격력을 1랭크 올린다.",
    "143": "어깨가 움츠러드는 낮은 울림으로 공격한다. 적중하면 35% 확률로 상대의 공격력을 1랭크 내린다.",
    "144": "상대 귓가에 방울을 바짝 대고 흔든다. 적중하면 35% 확률로 상대의 명중률을 1랭크 내린다."};

// ==========================================
// 표를 편다 — BY[번호] · LIST
// ==========================================
const BY = {}, LIST = [];
function mkAtk(no, name, el, archNo) {
    const a = ARCH[archNo];
    return { no: no, n: name, el: el, arch: archNo, an: a.an, slot: 'A', pp: a.pp, pw: a.pw, acc: a.acc, kind: a.kind, pri: a.pri, tgt: 'foe', cat: (archNo >= 12 ? '복합 공격' : '공격'), fx: a.fx, any: !!a.any, desc: DESC[no] || '' };
}
EL_KEYS.forEach(function (el) {
    const t = ELN[el];
    t.n.forEach(function (name, i) { const no = t.base + i; BY[no] = mkAtk(no, name, el, i + 1); });
});
Object.keys(UTIL).forEach(function (k) {
    const no = Number(k), u = UTIL[k];
    BY[no] = { no: no, n: UTIL_NAME[no], el: null, arch: no, an: UTIL_NAME[no], slot: no === 59 ? 'A' : 'U', pp: u.pp, pw: u.fx.pw || null, acc: (u.tgt === 'foe' ? 'sure' : null), kind: no === 59 ? 'none' : null, pri: u.pri, tgt: u.tgt, cat: u.cat, fx: u.fx, hidden: !!u.hidden, chrOnly: !!u.chrOnly, desc: DESC[no] || '' };
});
BY[59].acc = 1;
Object.keys(UNIQ).forEach(function (k) {
    const no = Number(k), q = UNIQ[k];
    BY[no] = { no: no, n: q.n, el: q.el || null, arch: no, an: q.n, slot: q.slot, pp: q.pp, pw: q.pw || null, acc: q.acc === undefined ? null : q.acc, kind: q.kind || null, pri: q.pri, tgt: q.tgt, cat: q.cat, fx: q.fx, only: q.only, desc: DESC[no] || '' };
});
Object.keys(BY).map(Number).sort(function (a, b) { return a - b; }).forEach(function (no) { LIST.push(BY[no]); });
const UNIQ_OF = {}; Object.keys(UNIQ).forEach(function (k) { UNIQ_OF[UNIQ[k].only] = Number(k); });

function P() { return window.PET; }
function DL() { return window.DOLL; }
function D2() { return window.D2; }
function int(v) { v = Number(v); return isFinite(v) ? Math.floor(v) : 0; }
function get(no) { return BY[int(no)] || null; }
function elName(el, d) { if (el === 'self') { const e = d ? attOf(d) : null; return e ? EL[e] : '쓰는 인형의 속성'; } return el ? EL[el] : '무속성'; }
function attOf(d) { try { return DL().attOf(d); } catch (e) { return (d && d.att) || 'wet'; } }
function spOf(d) { const k = (d && d.sp) || (d && d.id); try { return P().sp(k) || int(k); } catch (e) { return int(k) % 100 || int(k); } }   // sp 가 없으면 열쇠에서 (13 · 113 · 213 → 13)
function isChr(d) { try { return !!P().isChr(spOf(d)); } catch (e) { return spOf(d) >= 26; } }
// 기술의 실제 속성 (쓰는 인형 기준)
function elOf(no, d) { const s = get(no); if (!s) return null; return s.el === 'self' ? attOf(d) : s.el; }
function ppMax(no) { const s = get(no); return s && s.pp != null ? s.pp : 0; }

// ==========================================
// 배울 수 있나 (01.3 · 09.1)
// ==========================================
function canLearn(d, no) {
    const s = get(no);
    if (!s) return { ok: false, why: '없는 기술입니다.' };
    if (s.hidden) return { ok: false, why: '발버둥은 배울 수 없습니다.' };
    if (s.only) { if (spOf(d) !== s.only) return { ok: false, why: '전용 인형만 배우는 고유 기술입니다.' }; return { ok: true }; }
    if (s.chrOnly && !isChr(d)) return { ok: false, why: '특수 개체(캐릭터 봉제인형)만 배웁니다.' };
    if (s.slot === 'A' && s.el && s.el !== 'self') {
        if (s.el !== attOf(d) && !s.any) return { ok: false, why: '다른 속성의 공격기는 위력 60 기술만 배울 수 있습니다.' };
    }
    return { ok: true };
}
// 배울 수 있는 전부 (지금 끼운 것 빼고)
function learnable(d) {
    const have = equipped(d);
    return LIST.filter(function (s) { return have.indexOf(s.no) < 0 && canLearn(d, s.no).ok; }).map(function (s) { return s.no; });
}

// ==========================================
// 끼운 기술 · PP (인형 기록 mv · pp)
// ==========================================
function arr(v, n) { const out = []; for (let i = 0; i < n; i++) { const x = v ? (Array.isArray(v) ? v[i] : v[String(i)]) : 0; out.push(get(x) ? int(x) : 0); } return out; }
function mvOf(d) { const m = (d && d.mv) || {}; return { a: arr(m.a, 3), u: arr(m.u, 2) }; }
function equipped(d) { const m = mvOf(d); return m.a.concat(m.u).filter(function (x) { return x > 0; }); }
function count(d) { return equipped(d).length; }
function ppOf(d, no) {
    const s = get(no); if (!s || s.pp == null) return Infinity;              // 발버둥
    const rec = d && d.pp && d.pp[String(no)];
    return (rec == null) ? s.pp : Math.max(0, Math.min(s.pp, int(rec)));
}
function setPp(d, no, v) { if (!get(no) || get(no).pp == null) return; d.pp = d.pp || {}; d.pp[String(no)] = Math.max(0, Math.min(ppMax(no), int(v))); }
function usePp(d, no) { const v = ppOf(d, no); if (v === Infinity) return Infinity; setPp(d, no, v - 1); return ppOf(d, no); }
function slotOf(no) { const s = get(no); return s ? s.slot : null; }
// 배우기 — slot 'A'|'U', idx 칸 번호 (없으면 첫 빈칸 · 빈칸 없으면 실패). 돌려주는 값 { ok, why, forgot } · 기록은 d 에 바로 쓴다 (저장은 부르는 쪽)
function learn(d, no, idx) {
    const s = get(no); const c = canLearn(d, no);
    if (!c.ok) return c;
    const m = mvOf(d), key = s.slot === 'A' ? 'a' : 'u', row = m[key];
    if (equipped(d).indexOf(s.no) >= 0) return { ok: false, why: '이미 끼운 기술입니다.' };
    if (idx == null || idx < 0 || idx >= row.length) { idx = row.indexOf(0); if (idx < 0) return { ok: false, why: (s.slot === 'A' ? '공격기' : '유틸기') + ' 칸이 다 찼습니다. 바꿀 칸을 고르세요.' }; }
    const forgot = row[idx] || 0;
    row[idx] = s.no;
    d.mv = { a: m.a, u: m.u };
    d.pp = d.pp || {};
    if (d.pp[String(s.no)] == null) d.pp[String(s.no)] = s.pp;              // 처음 배울 때만 최대 PP
    return { ok: true, forgot: forgot, idx: idx, slot: s.slot };
}
// 잊기 — 마지막 한 개는 못 잊는다 (MSG-115). PP 기록은 남는다.
function forget(d, no) {
    const m = mvOf(d);
    const key = m.a.indexOf(int(no)) >= 0 ? 'a' : (m.u.indexOf(int(no)) >= 0 ? 'u' : null);
    if (!key) return { ok: false, why: '끼우지 않은 기술입니다.' };
    if (count(d) <= 1) return { ok: false, why: '기술은 최소 1개 가지고 있어야 한다!' };
    m[key][m[key].indexOf(int(no))] = 0;
    d.mv = { a: m.a, u: m.u };
    return { ok: true };
}
// 같은 분류 안에서 자리 바꾸기
function move(d, slot, i, j) {
    const m = mvOf(d), key = slot === 'A' ? 'a' : 'u', row = m[key];
    if (i < 0 || j < 0 || i >= row.length || j >= row.length) return { ok: false, why: '칸이 없습니다.' };
    const t = row[i]; row[i] = row[j]; row[j] = t;
    d.mv = { a: m.a, u: m.u };
    return { ok: true };
}
// 전투에서 고를 수 있나 — 끼웠고 PP 가 남았고 (제한은 엔진이 본다)
function usable(d, no) { return equipped(d).indexOf(int(no)) >= 0 && ppOf(d, no) > 0; }
function uniqueOf(sp) { return UNIQ_OF[int(sp)] || 0; }

// ==========================================
// 처음 기술 — 야생 · 알 · 옮겨 오기 (결정적)
// ==========================================
function pick(r, list) { return list[Math.floor(r() * list.length)]; }
function defaultSet(d, rng) {
    const r = rng || D2().rngOf('d2mv:' + String((d && d.id) || '') + ':' + String((d && d.at) || 0));
    const el = attOf(d), base = ELN[el].base, lv = D2().lvOf(d);
    const a = [base + 0];                                            // 일반공격1
    const pool = [1, 2, 3, 6, 7, 8, 11, 12, 13, 14, 15, 16].map(function (i) { return base + i; });   // 원형 2~17 중 (반동 · 궁극 · 즉사는 빼고)
    const more = lv >= 11 ? 2 : 1;
    while (a.length < 1 + more && pool.length) { const x = pick(r, pool); pool.splice(pool.indexOf(x), 1); a.push(x); }
    const upool = [18, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39];
    const u = [pick(r, upool)];
    const uq = uniqueOf(spOf(d));
    if (uq) { if (get(uq).slot === 'A') { if (a.length >= 3) a[2] = uq; else a.push(uq); } else u.push(uq); }
    while (a.length < 3) a.push(0);
    while (u.length < 2) u.push(0);
    return { a: a.slice(0, 3), u: u.slice(0, 2) };
}
// 기록이 없는 인형에게 처음 기술을 준다 — 돌려주는 값은 기록 조각 { mv, pp } (저장은 부르는 쪽)
function fixMv(d, rng) {
    if (d && d.mv && count(d) > 0) return null;
    const mv = defaultSet(d, rng), pp = Object.assign({}, (d && d.pp) || {});
    mv.a.concat(mv.u).forEach(function (no) { if (no && pp[String(no)] == null) pp[String(no)] = ppMax(no); });
    return { mv: mv, pp: pp };
}

// ==========================================
// 글 — 상세창 (조는 도깨비 05)
// ==========================================
function accText(s) { if (s.acc === 'sure') return '필중'; if (s.acc == null) return (s.tgt === 'self' ? '자신 대상' : s.tgt === 'field' ? '필드 대상' : s.tgt === 'ally' ? '아군 대상' : s.tgt === 'foeside' ? '상대 진영' : '판정 없음'); return Math.round(s.acc * 100) + '%'; }
function priText(p) { return p >= 4 ? '교체 우선 (+4)' : p >= 2 ? '방어 우선 (+2)' : p >= 1 ? '선제 (+1)' : '일반'; }
function kindText(k) { return k === 'phys' ? '물리' : k === 'mag' ? '마법' : k === 'spec' ? '특수' : k === 'none' ? '분류 없음' : '—'; }
function line(no, d) {
    const s = get(no); if (!s) return '';
    const bits = ['#' + s.no, elName(s.el, d), s.pp == null ? 'PP ∞' : ('PP ' + (d ? ppOf(d, no) : s.pp) + '/' + s.pp)];
    if (s.pw) bits.push('위력 ' + s.pw);
    bits.push('명중 ' + accText(s));
    return s.n + ' — ' + bits.join(' · ');
}
function detail(no, d) {
    const s = get(no); if (!s) return '';
    const head = [s.slot === 'A' ? '공격기' : '유틸기', s.cat, kindText(s.kind) !== '—' ? kindText(s.kind) : null, priText(s.pri)].filter(Boolean).join(' · ');
    return line(no, d) + '\n' + head + '\n' + s.desc;
}

window.D2SK = {
    EL: EL, EL_KEYS: EL_KEYS, RANKS: RANKS, RANK_NAME: RANK_NAME, ARCH: ARCH, ELN: ELN, UTIL: UTIL, UNIQ: UNIQ, BY: BY, LIST: LIST, UNIQ_OF: UNIQ_OF, STRUGGLE: 59,
    get: get, elName: elName, elOf: elOf, ppMax: ppMax,
    canLearn: canLearn, learnable: learnable,
    mvOf: mvOf, equipped: equipped, count: count, ppOf: ppOf, setPp: setPp, usePp: usePp, slotOf: slotOf, learn: learn, forget: forget, move: move, usable: usable, uniqueOf: uniqueOf,
    defaultSet: defaultSet, fixMv: fixMv,
    line: line, detail: detail, accText: accText, priText: priText, kindText: kindText
};

// ==========================================
// 콘솔
// ==========================================
window.d2Skills = function (el) {
    const rows = LIST.filter(function (s) { return !el || s.el === el || s.el == null || s.el === 'self'; });
    console.log('%c===== 🧸 기술 표 ' + rows.length + '개 =====', 'color:#ffb74d; font-size:13px');
    console.table(rows.map(function (s) { return { 번호: s.no, 이름: s.n, 속성: elName(s.el), 칸: s.slot === 'A' ? '공격기' : '유틸기', PP: s.pp == null ? '∞' : s.pp, 위력: s.pw || '—', 명중: accText(s), 유형: kindText(s.kind), 우선: s.pri, 분류: s.cat, 전용: s.only || '' }; }));
};
window.d2Learn = function (key) {
    const D = DL(), u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u || !D) { console.log('로그인 전입니다.'); return; }
    const ds = D.dolls(u); key = String(key || Object.keys(ds)[0]);
    const d = Object.assign({ id: key }, ds[key] || {});
    if (!ds[key]) { console.log('그런 인형이 없습니다.'); return; }
    const m = mvOf(d);
    console.log('%c' + D.nickOf(d) + ' · ' + elName(attOf(d)) + ' · 끼운 기술 ' + count(d) + '/5', 'color:#9fd8ef');
    console.log('  공격기', m.a.map(function (n) { return n ? line(n, d) : '(빈칸)'; }));
    console.log('  유틸기', m.u.map(function (n) { return n ? line(n, d) : '(빈칸)'; }));
    const L = learnable(d);
    console.log('  배울 수 있는 기술 ' + L.length + '개:', L.map(function (n) { return n + ' ' + get(n).n; }).join(' · '));
    if (!d.mv) console.log('  (아직 기술 기록이 없다 — 갈아 끼울 때 처음 기술:', JSON.stringify(defaultSet(d)) + ')');
};
console.log('[🧸 2차] d2Skills(속성) · d2Learn(열쇠)');
})();
