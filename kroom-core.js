// ==========================================
// ★ 『 K 의 방 』 — Qtrew-???-999 · 던전형 어둠 (뼈대)
// bundles.json — epic 파일들 다음 (epic-fix-steady.js 뒤) · 마지막 묶음 앞쪽
// ==========================================
//
// ■ 무엇이 다른가
//
//   · 이곳만의 레벨(Lv 1~100)과 경험치가 있다.
//   · 처음 들어오면 **직업**을 고른다 — 전용 장비 첫 속성의 다섯 직업이
//     뒤집힌 카드로 깔린다. 하나를 넘기면 그 한 장만 보이고, 정하거나
//     다시 고른다(다시는 딱 한 번).
//   · 한 팀(1~5명)이 들어가면 **팀 평균 Lv**과 **직업 등급**으로 던전 등급이 정해진다.
//       D 전체 · C Lv20+ · B 50+ · A 70+ · S 90+   (팀원끼리 Lv 차이가 20 넘으면 한 단계 낮게)
//       그리고 그 등급으로 각성한 사람이 팀의 절반 이상이어야 한다 (혼자면 나 자신).
//       각성은 **지금 등급의 던전**에서 한다 — D 던전에서 C 를 만들어야 C 던전이 열린다.
//   · 다른 어둠은 한 팀이 들어가면 막히지만, 여기는 **네 팀**까지 동시에 든다.
//     같은 던전에 든 팀끼리는 같은 층에서 **만난다**.
//   · 스탯 — 체력 · 심력 · 정신력(모두) + 마력/무력/내공(직업 계열에 따라 하나 또는 없음).
//     떨어지는 것이 막대로 보인다.
//   · 회복 — 던전 음식 · 치유(체력, 판정) · 요리사의 요리(체력) ·
//            응시(정신력) · 보정(마력) · 굳건(제 무력) · 연결(내공).
//   · 전용 재화 「꿈결」. 쓰러지면 포인트처럼 가진 꿈결을 잃는다 (행운이 지키면 30~45% 남음 · 2026-10-19).
//     밀실 거래로 주고받는다 (p2p-fix.js · p2p-multi.js · p2p-dream.js).
//   · 각성 — 직업 갈림길에서 각성 점수(wake)를 모은다. 등급마다 정해진 만큼 모이면
//            다음 이름으로 각성한다 (D→C→B→A→S).
//
// ■ 내용은 들어갈 때만 내려받는다
//   던전 장면(kroom/d1.js …)과 직업 갈림길(kroom/jd-<속성>.js …)은 게임 묶음에
//   안 넣는다. 다 넣으면 갈림길 5,000개라 파일이 수 MB 불어난다. 들어서는
//   순간 그 던전 한 장과 제 속성 갈림길 한 장만 받는다.
//
// ■ 서버 자리
//   users/<사번>/kroom                     { lv, exp, job, grade, wake, dream, rerolled, peek, runs }
//   darkParties/<pid>/kDun                 팀장이 정한 던전 { id, lv, at }
//   darkParties/<pid>/kStat/<사번>          팀원 스탯 (돌보기 창이 읽는다)
//   darkParties/<pid>/kAid/<받는이>/<번호>   돌봄 { k, v, from }
//   darkParties/<pid>/kDoom/<사번>          즉사 기믹 — 구해 달라
//   kroomTeams/<팀>                        지금 든 팀 (네 팀까지)
//   kroomRuns/<던전>/<팀>                   같은 던전 팀끼리 만나는 자리
//   kroomGift/<팀>/<번호>                   만난 팀이 건넨 것
//
// ■ 콘솔
//   kroomState()          내 Lv · 직업 · 각성 · 꿈결
//   kroomGive(사번, 칸, 값) 상담사 — Lv / exp / dream / job 손보기

const K_CODE = 'Qtrew-???-999';

(function kroom() {

const K_VER = '1';                    // 내용 파일을 새로 받게 하려면 올린다
const ADMIN = 'kario0987';
const GRADES = ['D', 'C', 'B', 'A', 'S'];
const GATE = { D: 1, C: 20, B: 50, A: 70, S: 90 };
const WAKE_NEED = { D: 3, C: 4, B: 5, A: 6 };       // 그 등급에서 다음으로 가는 데 드는 각성 점수 (제 등급 이상 던전의 갈림길에서 쌓인다)
const MAX_TEAMS = 4;
// ★ 꿈결 — 한 번 얻을 때 던전 등급마다 이만큼 (단위 D)
const DREAM = { D: [1, 20], C: [25, 50], B: [55, 70], A: [75, 100], S: [110, 150] };
// ★ D · C 는 혼자서는 거의 못 나온다 — 둘 이상이어야 산다
//   판정 DC 를 올리고 실패해서 잃는 값을 키운다. 동료가 끌어내는 DC(즉사 기믹 · 쓰러짐)는 그대로 둔다 —
//   같이 가는 것이 답이 되게. 쉼터도 혼자면 못 쉰다 (rest).
//   D 던전 다섯 장 · 직업 50 · 엔진 규칙을 옮긴 모형으로 2만 판씩 굴려 본 값 (한 사람이 살아 나올 확률):
//                       혼자    둘    셋
//     안전한 쪽만 고르면   13%   63%   76%      (전: 72% · 75% · 79%)
//     아무거나 고르면       2%   16%   31%      (전: 15% · 14% · 15%)
//   전에는 둘이 가도 혼자와 거의 같았다 — 끌어내다 놓치면 손을 뻗은 쪽이 같이 죽었기 때문이다.
//   이제 놓치면 손을 뻗은 쪽은 다치기만 하고(MISS), 끌려가는 쪽은 다른 동료를 기다린다 (한 사람에 한 번).
//   C 는 던전이 길고(장면 26 + 갈림길 5) 내용 DC 도 높게 적었으므로 더하는 몫을 줄였다 — D < C < B < A 가 되게.
//                       혼자    둘    셋    다섯   (C 던전 · D 직업으로 들어올 때)
//     안전한 쪽만 고르면    5%   27%   42%   68%
//   B · A 는 더하지 않는다 — 내용의 숫자가 그대로다 (B 는 S-003 보다 DC 가 높다: 19~22 · S-003 17~19).
//     B (C 직업)  둘 5% · 셋 12% · 다섯 28%      A (B 직업)  셋 6% · 다섯 14%   (주사위 20 은 늘 성공으로 다시 잼)
const HARD = { D: { dc: 2, lose: 1.6 }, C: { dc: 1, lose: 1.2 } };
// ★ 혼자 가면 (2026-10-19) — A · S 만 더 혹독하다. 일행이면 그대로.
//   A  DC +7 · 잃는 값 ×2.2 — 살아 나올 확률이 0.001% 언저리가 되게 (20 도 늘 성공이 아니다)
//   S  살아 나오지 못한다 — 판정이 전부 실패하고(장비 · 행운도 안 통한다), 잃는 값 ×3, 돌아가는 길이 없다
const SOLO_HARD = { A: { dc: 7, lose: 2.2, no20: true }, S: { dc: 99, lose: 3, no20: true, doom: true } };
const REST_PARTY = { hp: 25, mind: 15, spirit: 10 };   // 번갈아 망을 본다
const REST_SOLO = { mind: -5, spirit: -10 };            // 혼자서는 눈을 못 붙인다
const MISS = { hp: -20, mind: -10, spirit: -10 };       // 끌어내다 놓쳤을 때 손을 뻗은 쪽
const LV_MAX = 100;
// ★ 다 같이 처음부터 — 숫자를 올리면 모든 사원의 Lv · 직업이 처음으로 돌아간다
//   (경험치 · 각성 · 넘겨 둔 카드 · 다시 고를 기회 · 본 갈림길까지. 꿈결 · 들어간 수는 남는다)
//   새 판을 받은 사원이 화면을 처음 띄울 때 한 번 (paintDream). 아직 안 띄운 사원은
//   팀 평균 Lv · 동료 속성을 셀 때 처음 상태로 본다 (lvOf · attrOf).
//   1 — 2026-10-17  D · C · B · A 던전이 다 열려서 다시 뽑는다
const K_RESET = 1;

const ATTR = {
    evade:  { n: '회피', i: '✦', role: '함정·공격을 피하고 앞길을 살핀다' },
    break:  { n: '파괴', i: '✧', role: '기믹을 부수고 몬스터를 잡는다' },
    heal:   { n: '치유', i: '❋', role: '동료의 체력을 고친다 (판정)' },
    luck:   { n: '행운', i: '✺', role: '얻는 것이 좋아지고 꿈결이 더 붙는다' },
    sense:  { n: '감각', i: '◈', role: '길을 찾고 숨은 보물을 찾는다' },
    hide:   { n: '은신', i: '◐', role: '몰래 지나가고 먼저 친다' },
    bond:   { n: '연결', i: '⊙', role: '구조에 강하고 동료의 내공을 채운다' },
    gaze:   { n: '응시', i: '❂', role: '정체와 약점을 꿰뚫고 동료의 정신력을 채운다' },
    fix:    { n: '보정', i: '✚', role: '자신을 포함한 팀 전체를 강하게 한다 · 동료의 마력을 채운다' },
    steady: { n: '굳건', i: '▣', role: '맞아 주고 버틴다 · 제 무력을 스스로 채운다' }
};
const RES = { mana: '마력', might: '무력', qi: '내공' };
const STATN = { hp: '체력', mind: '심력', spirit: '정신력', mana: '마력', might: '무력', qi: '내공' };

// ── 직업 50 — key: [속성, 계열, 이름 D·C·B·A·S, 한 줄]
const JOBS = {
    acrobat:   ['evade', 'might', ['곡예사', '공중곡예사', '허공 곡예사', '바람의 곡예사', '천공무희'], '떨어지는 법을 먼저 배웠다. 그래서 안 떨어진다.'],
    lightfoot: ['evade', 'qi',    ['경신술사', '초상비', '비연객', '능공허도', '등평도수의 종사'], '발이 땅에 닿는 시간을 줄이는 것이 공부다.'],
    illusion:  ['evade', 'mana',  ['환영술사', '분신술사', '거울술사', '신기루 마도사', '몽환제(夢幻帝)'], '맞는 것은 늘 진짜가 아닌 쪽이다.'],
    scout:     ['evade', 'might', ['척후병', '정찰병', '선봉 척후', '그림자 선봉장', '전장의 유령'], '남보다 먼저 가서, 남보다 먼저 돌아온다.'],
    matador:   ['evade', 'might', ['투우사', '붉은 천의 투우사', '맹수 투우사', '괴수 투우사', '전설의 마타도르'], '달려드는 것은 천을 보고, 천은 비켜 선다.'],

    warrior:   ['break', 'might', ['전사', '투사', '광전사', '전쟁귀', '패왕(覇王)'], '앞에 있는 것을 치우는 일이다.'],
    pyro:      ['break', 'mana',  ['화염술사', '폭염술사', '업화술사', '화산의 대마도사', '종말의 염제'], '탈 수 있는 것은 생각보다 많다.'],
    fist:      ['break', 'qi',    ['권사', '철권', '금강권사', '파천권', '권왕'], '주먹 하나에 들어가는 것을 셈한다.'],
    blaster:   ['break', null,    ['폭파공', '발파공', '폭파 전문가', '붕괴술사', '천붕자(天崩者)'], '무너뜨리는 데에도 순서가 있다.'],
    greatsword:['break', 'might', ['대검사', '참마검사', '거검사', '파성의 검귀', '천참의 검성'], '한 번에 끝나지 않으면 두 번 벤다.'],

    cook:      ['heal', null,     ['요리사', '숙수', '수석 요리사', '궁중 대령숙수', '식신(食神)'], '배가 차면 사람이 산다. 그게 의술보다 먼저다.'],
    healer:    ['heal', 'mana',   ['치유사', '치료술사', '대치유사', '생명의 사도', '소생의 대현자'], '닫히는 상처는 손을 기억한다.'],
    pharma:    ['heal', null,     ['약사', '조제사', '연금약사', '영약 장인', '불사약의 대가'], '독과 약은 양이 다를 뿐이다.'],
    physician: ['heal', 'qi',     ['의원', '침술사', '신의(神醫)', '의성(醫聖)', '의선(醫仙)'], '맥이 먼저 말한다.'],
    monk:      ['heal', 'might',  ['수도사', '수행승', '무승', '금강 수호승', '대자대비의 승왕'], '고치는 손과 막는 손이 같은 손이다.'],

    gambler:   ['luck', null,     ['노름꾼', '타짜', '승부사', '판의 주인', '행운의 신'], '잃는 판을 아는 것이 따는 법이다.'],
    peddler:   ['luck', null,     ['행상', '상인', '대상인', '거상', '황금의 상왕'], '버려진 것에도 값이 있다.'],
    fortune:   ['luck', 'mana',   ['점술가', '운명술사', '별점의 현자', '인과술사', '천운의 예언자'], '좋은 쪽 패를 미리 본다.'],
    collector: ['luck', null,     ['수집가', '감정사', '골동품 대가', '보물 감정관', '전설의 수장가'], '먼지를 털면 값이 보인다.'],
    beggar:    ['luck', 'qi',     ['거지', '개방 제자', '걸개', '타구봉주(打狗棒主)', '항룡신개(降龍神丐)'], '빈손이 제일 많이 줍는다.'],

    explorer:  ['sense', null,    ['탐험가', '개척자', '지도 제작자', '미궁 탐사가', '미궁의 개척왕'], '처음 가는 길을 두 번째처럼 걷는다.'],
    marksman:  ['sense', 'might', ['사수', '저격수', '매의 눈', '천리안 궁사', '신궁(神弓)'], '보이면 닿는다.'],
    tracker:   ['sense', 'might', ['추적자', '흔적 사냥꾼', '맹수 추적자', '그림자 추적자', '끝까지 쫓는 자'], '지나간 것은 무엇이든 자국을 남긴다.'],
    seeker:    ['sense', 'mana',  ['탐지술사', '투시술사', '천리안 마도사', '진리의 눈', '전지(全知)의 현자'], '벽 너머가 벽 이쪽보다 잘 보인다.'],
    treasure:  ['sense', null,    ['보물사냥꾼', '유적 사냥꾼', '도굴 전문가', '금은보화 사냥꾼', '전설 보물의 주인'], '반짝이는 것보다 숨긴 손을 본다.'],

    assassin:  ['hide', 'might',  ['암살자', '그림자 칼날', '밤의 처형자', '무음의 사신', '암영(暗影)의 왕'], '한 번이면 된다. 두 번이면 실패다.'],
    killer:    ['hide', 'qi',     ['자객', '살수', '혈영 살수', '무영 자객', '천하제일 살수'], '발소리를 지우는 것이 첫 공부였다.'],
    shadow:    ['hide', 'mana',   ['그림자술사', '암영술사', '어둠술사', '심연의 마도사', '밤의 대마도사'], '그림자는 주인보다 먼저 움직인다.'],
    agent:     ['hide', null,     ['첩자', '공작원', '이중 첩자', '첩보 수장', '얼굴 없는 자'], '이름이 여럿이면 하나쯤 잃어도 된다.'],
    thief:     ['hide', 'might',  ['좀도둑', '도둑', '대도', '괴도', '전설의 대괴도'], '주인이 없는 것은 없다. 다만 지금 없을 뿐.'],

    negotiator:['bond', null,     ['협상가', '중재자', '외교관', '대사', '만국의 조정자'], '말이 통하면 칼이 덜 든다.'],
    binder:    ['bond', 'mana',   ['결속술사', '계약술사', '맹약술사', '영혼 결속자', '운명을 잇는 현자'], '묶인 것은 함께 버틴다.'],
    knight:    ['bond', 'might',  ['견습 기사', '기사', '수호 기사', '성기사(聖騎士)', '기사왕(騎士王)'], '지킬 사람이 있으면 무릎이 안 꺾인다.'],
    signal:    ['bond', null,     ['신호수', '통신병', '전령 기수', '전선 연락관', '만리 전령'], '닿지 않는 거리는 없다. 늦을 뿐이다.'],
    escort:    ['bond', 'qi',     ['표사', '표두', '총표두', '표국주', '만리표왕(萬里鏢王)'], '맡은 것은 끝까지 데려간다.'],

    scholar:   ['gaze', null,     ['학자', '고고학자', '금서 연구가', '고대어 해독가', '만물의 석학'], '읽을 수 있으면 무섭지 않다.'],
    hexer:     ['gaze', 'mana',   ['주술사', '저주술사', '해주술사', '금주(禁呪) 연구가', '주왕(呪王)'], '저주는 매듭이고, 매듭은 풀린다.'],
    exorcist:  ['gaze', 'mana',   ['퇴마사', '구마사', '대퇴마사', '마를 끊는 자', '멸마성자(滅魔聖者)'], '보이는 것보다 붙은 것이 문제다.'],
    physiog:   ['gaze', 'qi',     ['관상가', '독심술사', '혜안', '통찰자', '천안통(天眼通)'], '얼굴이 먼저 털어놓는다.'],
    detective: ['gaze', null,     ['탐정', '수사관', '명탐정', '진실의 추적자', '신탐(神探)'], '맞지 않는 것 하나가 전부를 말한다.'],

    drummer:   ['fix', null,      ['북잡이', '고수(鼓手)', '군악대장', '전장의 고수', '천지를 울리는 북'], '박자가 맞으면 다리가 안 떨린다.'],
    tactician: ['fix', null,      ['전술가', '참모', '군사(軍師)', '대군사', '천하의 책사'], '이기는 수는 미리 놓아 둔다.'],
    enchanter: ['fix', 'mana',    ['부여술사', '강화술사', '축복술사', '대부여술사', '만물 강화의 현자'], '손이 닿은 것은 조금씩 나아진다.'],
    squad:     ['fix', 'might',   ['분대장', '소대장', '지휘관', '사령관', '대원수'], '혼자 강한 것보다 다 같이 덜 약한 것.'],
    formation: ['fix', 'qi',      ['진법가', '진법사', '진법 대가', '천라지망의 진주(陣主)', '진법신(陣法神)'], '자리만 바로 서면 반은 이긴다.'],

    shield:    ['steady', 'might',['방패병', '중갑병', '철벽', '불굴의 수호자', '난공불락'], '맞는 것도 기술이다.'],
    survivor:  ['steady', null,   ['생존가', '야영 전문가', '극지 생존가', '불사의 생존자', '끝까지 남는 자'], '살아남는 데에는 요령이 있다. 대부분 참는 것이다.'],
    warder:    ['steady', 'mana', ['결계술사', '방벽술사', '대결계사', '성역의 수호자', '절대 결계의 마도사'], '선 하나를 긋고, 그 안을 지킨다.'],
    ironbody:  ['steady', 'qi',   ['외공 수련생', '철포삼', '금종조', '금강불괴', '불괴의 무신'], '몸이 곧 벽이 될 때까지.'],
    miner:     ['steady', null,   ['광부', '갱도 반장', '심층 광부', '지저의 굴착왕', '대지를 뚫는 자'], '어둠 속에서 오래 버티는 법은 땅이 가르쳐 줬다.']
};
// ==========================================
// ★ 히든 직업 (L) — 속성마다 하나 (2026-10-19)
// ==========================================
//
//   회피 거너 · 치유 드루이드 · 행운 성녀(남성이면 성자) · 연결 정령사 · 파괴 천마 ·
//   은신 테이머 · 응시 네크로맨서 · 감각 방랑자 · 보정 마스터 · 굳건 군주
//
//   ■ 조건 — 넷이 다 차면 상담사에게 알림이 간다 (kroomHidden/<사번>, state 'ready')
//       Lv 80 이상 · 지금 직업이 S 등급
//       D · C · B · A 등급 던전에서 갈림길(◇ ○○만의 갈림길)을 등급마다 90번 이상 겪음  (k.jx)
//       그 속성 직업의 임무(장면마다 붙는 ◇ 직업 선택지)를 100번 이상 해냄               (k.hq[속성])
//       — 헬퍼로 들어간 판은 세지 않는다. 세기 시작한 것은 2026-10-19 부터다.
//   ■ 상담사가 통제 콘솔 「히든 직업 관리」에서 지정하면(state 'offered') 그 사원이 다음에
//     K 의 방에 들어설 때 금빛 카드가 뜬다 — 『 선택받은 자여 전직하겠습니까? 』
//     전직하면 직업 등급은 D 부터 다시 (Lv 은 그대로). 거절하면 'declined'.
//   ■ 등급 올리기는 극악 — 각성 점수 D 30 · C 40 · B 50 · A 60 · S 100 (보통 직업의 열 배, S → L 은 백)
//   ■ L 이 되면 kroomHidden 에 'L' 을 적고 상담사에게 알린다 — 그에 맞는 물건은 추후 정한다.
//   ■ 내용 — 히든 직업만의 갈림길 · 선택지는 아직 없어서, **같은 속성 다섯 직업의 것**을 함께 쓴다.
const HIDDEN = {
    L_gunner:   ['evade',  'might', '거너',       '거리는 숨을 고르는 시간이다. 방아쇠는 그 끝에 있다.'],
    L_druid:    ['heal',   'mana',  '드루이드',   '숲은 상처를 덮는 법을 안다. 그 손을 빌릴 뿐이다.'],
    L_saintess: ['luck',   'mana',  '성녀',       '빌지 않아도 닿는 것이 있다. 그것을 운이라 부르지 않을 뿐.'],
    L_saint:    ['luck',   'mana',  '성자',       '빌지 않아도 닿는 것이 있다. 그것을 운이라 부르지 않을 뿐.'],
    L_spirit:   ['bond',   'mana',  '정령사',     '보이지 않는 것들과 맺었다. 부르면 온다.'],
    L_heavenly: ['break',  'qi',    '천마',       '하늘 아래 마(魔)라 불린 것은 늘 하나였다.'],
    L_tamer:    ['hide',   'might', '테이머',     '물지 않는 짐승은 없다. 물지 않게 하는 사람이 있을 뿐.'],
    L_necro:    ['gaze',   'mana',  '네크로맨서', '끝난 것들에게 한 번 더 일을 시킨다.'],
    L_wanderer: ['sense',  'qi',    '방랑자',     '지도는 지나온 길로만 그려진다.'],
    L_master:   ['fix',    'qi',    '마스터',     '모든 수를 다 써 본 사람만이 하나를 고른다.'],
    L_lord:     ['steady', 'might', '군주',       '무너지지 않는 것은 성벽이 아니라 그 앞에 선 사람이다.']
};
Object.keys(HIDDEN).forEach(function (k) {
    const h = HIDDEN[k];
    JOBS[k] = [h[0], h[1], [h[2], h[2], h[2], h[2], h[2], h[2]], h[3]];   // 이름은 등급마다 같다 (D … S · L)
});
function isHiddenJob(key) { return !!(key && HIDDEN[key]); }
// 속성 → 히든 직업 열쇠 (행운은 성별로 가른다)
function hiddenKeyFor(attr, u) {
    if (attr === 'luck') return (u && u.badge && u.badge.gender === '남성') ? 'L_saint' : 'L_saintess';
    const k = Object.keys(HIDDEN).filter(function (x) { return HIDDEN[x][0] === attr; })[0];
    return k || null;
}
const L_JOBS = ['거너', '드루이드', '성녀', '성자', '정령사', '천마', '테이머', '네크로맨서', '방랑자', '마스터', '군주'];
const HIDDEN_NEED = { lv: 80, grade: 'S', jx: 90, jxGrades: ['D', 'C', 'B', 'A'], hq: 100 };
const HIDDEN_WAKE = { D: 30, C: 40, B: 50, A: 60, S: 100 };
const NEXT_GRADE = { D: 'C', C: 'B', B: 'A', A: 'S', S: 'L' };

// ── 전용 장비 — 이 방에서는 속성마다 「몇 번」 쓰는 능력이 된다
//   횟수 = 1 + ⌊(장비 그 속성 등급 + 직업 등급) / 2⌋  (최대 5)
//     장비 D0 C1 B2 A3 S4 L5 · 직업 D0 C1 B2 A3 S4
//     예) 파괴 L · 직업 S → 5회   파괴 D · 직업 D → 1회   파괴 L · 직업 D → 3회
const GEAR_K = {
    break:  { n: '기믹 파훼',  d: '파괴로 푸는 선택지를 그대로 성공시킨다' },
    sense:  { n: '길 찾기',    d: '감각으로 푸는 선택지를 그대로 성공시킨다' },
    hide:   { n: '숨어 지나기', d: '은신으로 푸는 선택지를 그대로 성공시킨다' },
    gaze:   { n: '꿰뚫어 보기', d: '응시로 푸는 선택지를 그대로 성공시킨다' },
    evade:  { n: '즉사 회피',  d: '즉사 기믹에 걸려도 한 번 빠져나온다' },
    luck:   { n: '다시 굴림',  d: '실패한 주사위를 한 번 더 굴린다' },
    fix:    { n: '주사위 보정', d: '5 이하로 모자란 실패를 성공으로 바꾼다' },
    steady: { n: '맞아 주기',  d: '체력이 깎일 것을 한 번 막는다' },
    bond:   { n: '확실한 구조', d: '동료를 끌어낼 때 그대로 성공한다' },
    heal:   { n: '더 돌보기',  d: '층마다 두 번인 돌봄을 더 쓴다' }
};
const GEAR_T = { D: 0, C: 1, B: 2, A: 3, S: 4, L: 5 };

// ── 던전 15 — 내용 파일이 있는 것만 ready
const DUNS = {
    D1: { g: 'D', n: '『버려진 채석장』', ready: true },
    D2: { g: 'D', n: '『젖은 숲』', ready: true },
    D3: { g: 'D', n: '『물이 빠진 저수지』', ready: true },
    D4: { g: 'D', n: '『눈 덮인 산장』', ready: true },
    D5: { g: 'D', n: '『무너진 지하 시장』', ready: true },
    // C — 기괴 · 몬스터 사냥
    C1: { g: 'C', n: '『살이 자라는 도축장』', ready: true },
    C2: { g: 'C', n: '『이빨 난 인형 공방』', ready: true },
    C3: { g: 'C', n: '『거꾸로 선 성당』', ready: true },
    C4: { g: 'C', n: '『포자 온실』', ready: true },
    // B — 탈출 · 스릴러 · 느와르 (S-003 보다 어렵게)
    B1: { g: 'B', n: '『비 내리는 항구 창고』', ready: true },
    B2: { g: 'B', n: '『폐쇄 병동 7층』', ready: true },
    B3: { g: 'B', n: '『멈추지 않는 야간열차』', ready: true },
    // A — 호러
    A1: { g: 'A', n: '『어린이 방송국』', ready: true },
    A2: { g: 'A', n: '『물에 잠긴 기숙학교』', ready: true },
    // S — 에일리언 · 공룡
    S1: { g: 'S', n: '『표본실 — 착륙 이후』', ready: true },
    S2: { g: 'S', n: '『백악기 정원』', ready: true }
};

// ── 던전 물건
const ITEMS = {
    '말린 고기':  { food: { hp: 20, mind: 5 } },
    '맑은 물':    { food: { mind: 15, spirit: 5 } },
    '약초 뭉치':  { food: { hp: 12, spirit: 5 } },
    '꿀 한 줌':   { food: { mind: 10, hp: 5 } },
    '따뜻한 국':  { food: { hp: 35, mind: 10, spirit: 5 }, dish: true },   // 요리사만 만든다
    '야생 버섯':  { ing: true }, '짐승 고기': { ing: true }, '산나물': { ing: true },
    '소금 덩이':  { ing: true }, '민물고기': { ing: true }
};

// ── 내용 받는 자리 (내용 파일이 부른다)
const DATA = { dun: {}, job: {}, opt: {} };
window.kDungeon = function (id, d) { DATA.dun[id] = d; };
window.kJob = function (key, grade, arr) {
    (DATA.job[key] = DATA.job[key] || {})[grade] = arr || [];
};
// ★ 직업 선택지 — 장면마다 그 직업만 보는 선택지 하나 (kroom/o<등급>-<속성>.js)
window.kOpt = function (key, grade, arr) {
    (DATA.opt[key] = DATA.opt[key] || {})[grade] = arr || [];
};

// ==========================================
// 작은 도구
// ==========================================
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function now() { return Date.now(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function stale(k) { return !!k && typeof k === 'object' && (Number(k.reset) || 0) < K_RESET; }
function wipe(k) {
    k.lv = 1; k.exp = 0; k.job = null; k.grade = 'D'; k.wake = {};
    k.peek = null; k.rerolled = false; k.seen = {};
    k.jx = {}; k.hq = {}; k.hiddenAsk = null;
    k.reset = K_RESET;
}
function prof(u) {
    u = u || me();
    if (!u) return null;
    if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {};
    const k = u.kroom;
    if (stale(k)) wipe(k);
    if (!k.lv) k.lv = 1;
    if (k.exp == null) k.exp = 0;
    if (!k.grade) k.grade = 'D';
    if (!k.wake || typeof k.wake !== 'object') k.wake = {};
    if (k.dream == null) k.dream = 0;
    return k;
}
function saveProf() { try { saveFields({ kroom: 1, history: 1 }); } catch (e) { } }

// ★ 헬퍼 (party-helper.js 의 「헬퍼로 참가」) — 2026-10-18
//   혼자 들어갈 때는 이 창의 스위치를, 일행으로 들어갈 때는 일행 명단의 헬퍼 표시를 본다.
//   헬퍼는 탐사 횟수를 쓰지 않고(0 이어도 들어간다), 경험치 · 꿈결 · 각성 점수 · 포인트 ·
//   은행 점수를 받지 않는다. 쓰러져도 포인트 · 반입품을 잃지 않고 상담실로 가지 않는다.
//   (포만감은 그대로 — 어둠의 헬퍼와 같다)
//   ✗ 전에는 「혼자 들어간다」가 스위치를 아예 안 봐서, 켜 두고 들어가도 보통 탐사였다.
//     일행으로 들어간 헬퍼도 포인트만 끝나고 되돌렸지(party-helper.js 6) 경험치 · 꿈결 ·
//     각성은 그대로 쌓였다.
function helperSwitch() {
    try { return localStorage.getItem('darkHelperMode') === '1'; } catch (e) { return !!window._helperMode; }
}
function helperIn(pid) {
    const u = me(); if (!u) return false;
    const p = (pid && typeof darkParties !== 'undefined' && darkParties) ? darkParties[pid] : null;
    const m = p && p.members && p.members[u.code];
    return !!(m && m.helper);
}
function isHelper() { return !!(kr && kr.helper); }

// ==========================================
// ★ K 의 방 탐사 횟수 — 일반 어둠과 **따로** 센다 (2026-10-18)
// ==========================================
//
//   하루 50회. 「어둠 탐사 +n」으로 한도를 올리는 것(요리 · 장비 · 🦊 호사수구 · K.LEE ·
//   은화 뱀)도 얹히지만, 다 더해도 **55회까지**다. 출산 고유 아이템(유전자 고유 아이템 —
//   차고 있는 동안 어둠 탐사 +n)의 몫만 55 위에 그대로 얹힌다.
//   K 의 방에 들어가도 일반 어둠 탐사 횟수(8회)는 줄지 않는다.
//
//   쓴 횟수는 kroomUse/<사번> = { d: 날짜, n: 쓴 횟수 } 하나에 트랜잭션으로만 더한다
//   (사원 기록 밖 — 통째 저장이 덮지 못한다. dark-count.js 와 같은 까닭).
//   한도를 올리는 몫은 쓴 횟수를 깎는 것이 아니라 그날 그때 한도에 얹힌다.
//   (소지품을 써서 쓴 횟수를 하나 깎아 주는 것 — 밤샘 신청서 · 엽서 · 출산품 — 은
//    일반 어둠 쪽 횟수만 돌려준다)
//   당국이 어둠 탐사 횟수를 충전하면 K 의 방 횟수도 같이 0 으로 돌린다.
const K_TRY_BASE = 50;
const K_TRY_HARD = 55;
const K_USE = 'kroomUse';
const KC = { code: '', ref: null, synced: null, ready: false, pend: 0, busy: false };
function kToday() { try { return getTodayStr(); } catch (e) { return ''; } }
function kView(v) { const t = kToday(); return (v && v.d === t) ? Math.max(0, Number(v.n) || 0) : 0; }
function kCache(v) { try { localStorage.setItem(K_USE + '_' + KC.code, JSON.stringify(v || {})); } catch (e) { } }
function kCached(code) { try { return JSON.parse(localStorage.getItem(K_USE + '_' + code) || 'null'); } catch (e) { return null; } }
function kBind() {
    const u = me(), d = db_();
    if (!u || !u.code || !d) return;
    if (KC.code === u.code) return;
    try { if (KC.ref) KC.ref.off(); } catch (e) { }
    KC.code = u.code; KC.synced = kCached(u.code); KC.ready = false; KC.pend = 0; KC.busy = false;
    KC.ref = d.ref(K_USE + '/' + u.code);
    KC.ref.on('value', function (snap) {
        KC.synced = snap.val() || null;
        KC.ready = true;
        kCache(KC.synced);
    });
}
setInterval(function () { try { kBind(); } catch (e) { } }, 1000);
function kUsed() { return kView(KC.synced) + KC.pend; }
// 한도 — 50 + 얹는 몫(55 까지) + 출산 고유 아이템 몫
function kAdds(u) {
    let capped = 0, free = 0, dna = 0;
    try { if (typeof window.capParts === 'function') { const p = window.capParts(u); capped = Number(p.capped.dark) || 0; free = Number(p.free.dark) || 0; } } catch (e) { }
    try { const e = (typeof myDnaEquip === 'function' && u === me()) ? myDnaEquip() : null; dna = (e && Number(e.dark)) || 0; } catch (e) { }
    return { add: Math.max(0, capped + Math.max(0, free - dna)), dna: dna };
}
// ★ 끝 한계 (2026-10-19) — 무엇이 얹혀도 70 을 넘지 않는다 (K.LEE 로 가져온 몫까지 얹혀 119 가 뜬 적이 있다)
const K_TRY_ABS = 70;
function kNum(v) { v = Number(v); return isFinite(v) && v > 0 ? v : 0; }
function kLimit(u) {
    u = u || me();
    const a = kAdds(u);
    // 기본 50 + 얹는 몫(요리 · 장비 · 호사수구 · K.LEE …)은 55 까지, 출산 고유 몫은 그 위에 — 모두 합쳐 70 까지
    return Math.min(K_TRY_ABS, Math.min(K_TRY_HARD, K_TRY_BASE + kNum(a.add)) + kNum(a.dna));
}
function kLeft() { return Math.max(0, kLimit() - kUsed()); }
// 한 번 쓴다 — 차이만큼 트랜잭션
function kFlush() {
    if (KC.busy || !KC.pend || !KC.ref) return;
    const delta = KC.pend, t = kToday();
    KC.busy = true;
    KC.ref.transaction(function (cur) {
        const base = (cur && cur.d === t) ? Math.max(0, Number(cur.n) || 0) : 0;
        return { d: t, n: Math.max(0, base + delta) };
    }).then(function (r) {
        KC.busy = false;
        KC.pend -= delta;
        if (r && r.snapshot) { KC.synced = r.snapshot.val(); kCache(KC.synced); }
        if (KC.pend) kFlush();
    }).catch(function (e) {
        KC.busy = false;
        console.warn('[K 의 방] 횟수 보내기 실패 — 다시 보냅니다', e && e.message);
        setTimeout(kFlush, 3000);
    });
}
function kUse(n) {
    kBind();
    KC.pend += (n || 1);
    kFlush();
}
window.kroomTriesLeft = kLeft;
window.kroomTryLimit = function () { return kLimit(); };
window.kroomTriesUsed = kUsed;
// 일행을 모으거나 들 때 — 그 자리의 「남은 횟수」를 K 의 방 것으로 본다 (헬퍼는 0 이어도 들어간다)
function withKTries(fn) {
    if (typeof getDarkTriesLeft !== 'function') return fn();
    const _g = getDarkTriesLeft;
    getDarkTriesLeft = function () { return helperSwitch() ? Math.max(1, kLeft()) : kLeft(); };
    try { return fn(); }
    finally { getDarkTriesLeft = _g; }
}
// 당국의 「어둠 탐사 횟수 충전」 — K 의 방 것도 같이 0 으로
(function hookCharge() {
    setInterval(function () {
        if (typeof updateUserFields !== 'function' || updateUserFields._kUse) return;
        const _u = updateUserFields;
        const w = function (c, fields) {
            try {
                const d = db_();
                if (d && c && fields && fields.darkTries === 0
                    && Object.prototype.hasOwnProperty.call(fields, 'darkTryAdded') && fields.darkTryAdded === 0) {
                    d.ref(K_USE + '/' + c).set({ d: kToday(), n: 0 }).catch(function () { });
                    if (c === KC.code) KC.pend = 0;
                }
            } catch (e) { }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._kUse = true;
        updateUserFields = w;
        try { window.updateUserFields = w; } catch (e) { }
    }, 1500);
})();
function lvOf(u) { const k = u && u.kroom; return (k && !stale(k) && k.lv) || 1; }
// 내 것 — 새 판을 처음 띄우면 한 번 비우고 적어 둔다
function freshen() {
    const u = me(); if (!u || !u.code || !stale(u.kroom)) return;
    const k = u.kroom;
    const had = (k.lv || 1) > 1 || !!k.job;
    wipe(k);
    if (had) try { addHistoryLog(u, '[K 의 방] Lv · 직업 초기화 — 처음 들어가면 카드를 다시 고른다'); } catch (e) { }
    saveProf();
}
// ★ 경험치 통 — 1~9 는 빠르게 · 10~19 는 조금 더디게 · 20 부터는 크게 (한 Lv 마다 3% 씩 커진다)
//   돌파 한 번에 받는 경험치 (내용 숫자로 셈 · 70% 성공)  D ≈ 380 · C ≈ 850 · B ≈ 1,520 · A ≈ 2,840
//   그 등급 던전만 돌파한다고 칠 때 몇 번 만에 오르나 (2026-10-17):
//                Lv 10   Lv 20   Lv 30   Lv 50   Lv 70   Lv 90    30번이면
//       전          4      15      26      76     133     185     Lv 32
//       지금        4      19      43     120     197     272     Lv 25
//   Lv 20 통 680 → 1,800 · Lv 50 3,140 → 4,369 · Lv 90 9,220 → 14,252
function needExp(lv) {
    if (lv < 10) return 40 + 12 * lv + lv * lv;
    if (lv < 20) return 300 + 60 * (lv - 10);
    return Math.round(1800 * Math.pow(1.03, lv - 20));
}
function mainAttr(u) {
    const g = u && u.soulGear;
    const a = g && g.attrs;
    const first = Array.isArray(a) ? a[0] : (a && typeof a === 'object' ? a[Object.keys(a)[0]] : null);
    return (first && ATTR[first]) ? first : null;
}
function jobName(key, grade) {
    const j = JOBS[key]; if (!j) return '?';
    return j[2][Math.min(j[2].length - 1, gi(grade))];
}
// L 은 S 다음 (히든 직업만 오른다)
function gi(grade) { return grade === 'L' ? 5 : Math.max(0, GRADES.indexOf(grade || 'D')); }
function wakeNeed(k) { return k ? (isHiddenJob(k.job) ? HIDDEN_WAKE[k.grade] : WAKE_NEED[k.grade]) : 0; }

// 내용 파일 받기 — 한 번 받은 것은 다시 안 받는다
const loaded = {};
function loadOne(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (res) {
        const s = document.createElement('script');
        s.src = src + '?v=' + K_VER;
        s.onload = function () { res(true); };
        s.onerror = function () { delete loaded[src]; res(false); };
        document.head.appendChild(s);
    });
    return loaded[src];
}
function loadFor(dunId, jobKey) {
    const g = DUNS[dunId].g.toLowerCase();
    const list = ['kroom/' + dunId.toLowerCase() + '.js'];
    if (jobKey && JOBS[jobKey]) list.push('kroom/j' + g + '-' + JOBS[jobKey][0] + '.js');
    if (jobKey && JOBS[jobKey]) list.push('kroom/o' + g + '-' + JOBS[jobKey][0] + '.js');   // 없으면 그냥 넘어간다
    return Promise.all(list.map(loadOne));
}

// ==========================================
// ★ 꿈결 — 포인트 오른쪽에 「D」로 늘 보인다
// ==========================================
//   바탕 화면(보유 포인트 칸)과 광장 위 띠(포인트 줄) 두 곳.
//   updateUI 가 포인트를 다시 적을 때마다 같이 고친다.
function paintDream() {
    const u = me(); if (!u) return;
    try { freshen(); } catch (e) { }
    const v = ((u.kroom && u.kroom.dream) || 0).toLocaleString('ko-KR');
    const a = document.getElementById('display-points');
    if (a) {
        let d = document.getElementById('display-dream');
        if (!d) {
            d = document.createElement('span');
            d.id = 'display-dream';
            d.style.cssText = 'margin-left:6px; font-size:0.8em; color:#c9a8ff; white-space:nowrap;';
            a.insertAdjacentElement('afterend', d);
            a.style.display = 'inline';
        }
        const t = v + ' D';
        if (d.textContent !== t) d.textContent = t;
    }
    const pt = document.querySelector('#plaza-hud .pt');
    if (pt) {
        let d = pt.querySelector('.dm');
        if (!d) {
            pt.style.whiteSpace = 'nowrap';
            d = document.createElement('span');
            d.className = 'dm';
            d.style.cssText = 'margin-left:5px; color:#c9a8ff;';
            pt.appendChild(d);
        }
        const t = v + ' D';
        if (d.textContent !== t) d.textContent = t;
    }
}
window.kroomPaintDream = paintDream;
(function hookDream() {
    const iv = setInterval(function () {
        if (typeof updateUI !== 'function') return;
        if (updateUI._kd) { clearInterval(iv); return; }
        const _u = updateUI;
        updateUI = function () { const r = _u.apply(this, arguments); try { paintDream(); } catch (e) { } return r; };
        updateUI._kd = true;
        clearInterval(iv);
    }, 400);
    setInterval(function () { try { paintDream(); } catch (e) { } }, 3000);   // 광장 띠는 따로 그려진다
})();

// ==========================================
// 구역 등록
// ==========================================
DARK_ZONES[K_CODE] = {
    code: K_CODE, grade: '?', name: '『 K 의 방 』',
    brief: '문을 열 때마다 다른 방이 나온다. 방마다 주인이 다르다.',
    warn: '레벨제 던전 — 네 팀까지 동시 진입', danger: '던전마다 다름', survival: '??%',
    min: 1, max: 5, reward: [500, 6000], ready: true, kroom: true,
    intro: '', outro: ''
};

// ==========================================
// 네 팀까지 — 이 구역만 점유 규칙이 다르다
// ==========================================
let teams = {};          // kroomTeams 를 지켜본 것
(function watchTeams() {
    const iv = setInterval(function () {
        const d = db_(); if (!d || !me()) return;
        clearInterval(iv);
        d.ref('kroomTeams').on('value', function (s) { teams = s.val() || {}; });
    }, 1500);
})();
function liveTeams(skip) {
    return Object.keys(teams).filter(function (t) {
        const v = teams[t];
        return t !== skip && v && v.at && now() - v.at < 6 * 60 * 1000 && v.m && Object.keys(v.m).length > 0;
    });
}
(function hookOccupant() {
    const iv = setInterval(function () {
        if (typeof getZoneOccupant !== 'function') return;
        if (getZoneOccupant._k) { clearInterval(iv); return; }
        const _g = getZoneOccupant;
        getZoneOccupant = function (zone) {
            if (zone !== K_CODE) return _g.apply(this, arguments);
            const live = liveTeams();
            if (live.length < MAX_TEAMS) return null;              // 자리가 있다
            const v = teams[live[0]] || {};
            return { leaderCode: '_kfull', leaderName: '네 팀', members: [], enteredAt: now() };
        };
        getZoneOccupant._k = true;
        // ★ 파티 모집 중인 것도 한 팀으로 센다 — 원래 규칙은 같은 구역에 다른 파티가
        //   하나만 있어도 막는다. 여기는 네 팀까지 들인다.
        if (typeof isZoneTaken === 'function' && !isZoneTaken._k) {
            const _t = isZoneTaken;
            isZoneTaken = function (zone) {
                if (zone !== K_CODE) return _t.apply(this, arguments);
                const u = me(); if (!u) return false;
                let mine = null;
                const recruit = Object.keys((typeof darkParties !== 'undefined' && darkParties) || {}).filter(function (pid) {
                    const p = darkParties[pid];
                    if (!p || p.zone !== K_CODE) return false;
                    if (p.members && p.members[u.code]) { mine = pid; return false; }
                    return p.state === 'RECRUIT' && now() - (p.createdAt || 0) < 30 * 60 * 1000;
                }).length;
                return liveTeams(mine).length + recruit >= MAX_TEAMS;
            };
            isZoneTaken._k = true;
        }
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 입구 — epic 카드 밑
// ==========================================
(function hookEntry() {
    const iv = setInterval(function () {
        if (typeof renderDarkness !== 'function') return;
        if (renderDarkness._k) { clearInterval(iv); return; }
        const _r = renderDarkness;
        renderDarkness = function () {
            const r = _r.apply(this, arguments);
            try { paintEntry(); } catch (e) { console.warn('[K 의 방] 입구', e); }
            return r;
        };
        renderDarkness._k = true;
        clearInterval(iv);
    }, 400);
})();
// 헬퍼 스위치를 켜고 끄면 입구 안내도 따라간다
setInterval(function () {
    const left = document.getElementById('kroom-left');
    if (left) { const t = kLeft() + ' / ' + kLimit(); if (left.textContent !== t) left.textContent = t; }
    const n = document.getElementById('kroom-helper-note');
    if (!n) return;
    const v = helperSwitch() ? 'block' : 'none';
    if (n.style.display !== v) n.style.display = v;
}, 1000);
function paintEntry() {
    const body = document.getElementById('darkness-body');
    if (!body || (typeof darkRun !== 'undefined' && darkRun)) return;
    if (document.getElementById('kroom-entry')) return;
    if (!isZoneOpen(K_CODE)) return;
    const u = me(); if (!u) return;
    const k = prof(u);
    const live = liveTeams().length;
    const html = `
        <div id="kroom-entry" style="background:linear-gradient(145deg,#151a1e,#0e1012); border:1px solid #2f4a55; border-radius:8px; padding:14px; margin-bottom:14px; text-align:left;">
            <div style="font-family:monospace; font-size:11px; color:#7fd3e6; font-weight:bold;">${K_CODE}</div>
            <div style="font-size:15px; color:#fff; font-weight:bold; margin:4px 0;">『 K 의 방 』</div>
            <div style="font-size:10px; color:#999; line-height:1.6;">${DARK_ZONES[K_CODE].brief}</div>
            <div style="font-size:10px; color:#777; margin-top:6px;">1~5인 · 네 팀까지 동시 진입 (지금 ${live}팀) · 던전 등급은 팀 평균 Lv 과 직업 등급으로 정해짐</div>
            <div style="font-size:11px; color:#cfe9f0; margin-top:7px;">
                Lv <b>${k.lv}</b> · ${k.job ? esc(jobName(k.job, k.grade)) + ' <span style="color:#7fd3e6;">' + k.grade + '</span>' : '<span style="color:#888;">직업 없음 — 처음 들어가면 고른다</span>'}
                · 꿈결 <b style="color:#c9a8ff;">${(k.dream || 0).toLocaleString()} D</b>
            </div>
            <div style="font-size:11px; color:#cfe9f0; margin-top:5px;">오늘 남은 횟수 <b id="kroom-left" style="color:#7fd3e6;">${kLeft()} / ${kLimit()}</b>회 <span style="font-size:10px; color:#777;">(일반 어둠과 따로 · 자정 초기화)</span></div>
            <div style="font-size:10px; color:#ff6b6b; margin-top:4px;">※ 쓰러지면 보유 포인트 · 꿈결과 반입품을 잃고 상담실로 이송됩니다.</div>
            <div style="font-size:10px; color:#ff8a80; margin-top:3px;">※ 혼자 들어가면 A 던전은 거의 살아 나오지 못하고, S 던전은 돌아오지 못합니다.</div>
            <div id="kroom-helper-note" style="display:${helperSwitch() ? 'block' : 'none'}; font-size:10px; color:#81c784; margin-top:4px;">✚ 헬퍼로 들어갑니다 — 횟수를 쓰지 않고, 경험치 · 꿈결 · 포인트를 받지 않으며, 쓰러져도 잃지 않습니다. (파티 편성 칸에서 끕니다)</div>
            <div style="display:flex; gap:6px; margin-top:11px;">
                <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="kroomSolo()">혼자 들어간다</button>
                <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="createParty('${K_CODE}')">일행을 모은다</button>
            </div>
        </div>`;
    const ep = document.getElementById('epic-entry');
    if (ep) ep.insertAdjacentHTML('afterend', html);
    else body.insertAdjacentHTML('afterbegin', html);
}

function canEnter(silent) {
    const u = me(); if (!u) return false;
    const say = function (t) { if (!silent) showCustomAlert(t); return false; };
    if (!mainAttr(u)) return say('전용 장비가 없어 들어갈 수 없습니다.\n\n이곳의 직업은 전용 장비의 첫 번째 속성을 따라갑니다.');
    if (kLeft() <= 0 && !helperSwitch()) return say('금일 『 K 의 방 』 탐사 횟수(' + kLimit() + '회)를 모두 소진했습니다.\n\n자정에 초기화됩니다. 일반 어둠 탐사 횟수와는 따로 셉니다.');
    if (isQuarantined(u)) return say('격리 중에는 들어갈 수 없습니다.');
    if (u.pollution >= 100) return say('오염도가 한계치라 들어갈 수 없습니다.');
    return true;
}
window.kroomSolo = function () {
    if (typeof darkRun !== 'undefined' && darkRun) return;
    if (!canEnter()) return;
    if (liveTeams().length >= MAX_TEAMS) { showCustomAlert('지금 네 팀이 들어가 있습니다.\n\n한 팀이 나오면 들어갈 수 있습니다.'); return; }
    start(false, null);
};
(function guardParty() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function' || typeof joinParty !== 'function') return;
        if (createParty._k) { clearInterval(iv); return; }
        const _c = createParty, _j = joinParty;
        createParty = function (zone) {
            if (zone === K_CODE && !mainAttr(me())) { canEnter(); return; }
            if (zone !== K_CODE) return _c.apply(this, arguments);
            const self = this, args = arguments;
            return withKTries(function () { return _c.apply(self, args); });
        };
        joinParty = function (pid) {
            const p = (typeof darkParties !== 'undefined') ? darkParties[pid] : null;
            if (p && p.zone === K_CODE && !mainAttr(me())) { canEnter(); return; }
            if (!(p && p.zone === K_CODE)) return _j.apply(this, arguments);
            const self = this, args = arguments;
            return withKTries(function () { return _j.apply(self, args); });
        };
        createParty._k = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 진행 상태
// ==========================================
let kr = null;

function start(isParty, pid) {
    const u = me();
    hookItems();
    const old = (typeof darkRun !== 'undefined') ? darkRun : null;
    const helper = isParty ? (helperIn(pid) || !!(old && old.helper)) : helperSwitch();
    darkRun = {
        zone: K_CODE, step: 0, modifier: 0, success: 0, fail: 0,
        carryEquips: (typeof darkRun !== 'undefined' && darkRun && darkRun.carryEquips) || [],
        carryItems: (typeof darkRun !== 'undefined' && darkRun && darkRun.carryItems) || [],
        lostItems: [], log: [], isParty: !!isParty, partyId: pid || null,
        isLeader: false, counted: true, kroom: true
    };
    if (helper) darkRun.helper = true;          // party-helper.js 가 탐사 하나를 통째로 지킨다 (iAmHelper)
    // 일행 출발 때 다른 파일이 얹어 둔 것 — 📺 토크 쇼 부활 · 📱 K·LEE 예약
    if (old && isParty) ['_show', '_showRevives', '_showOn', '_showHeat', '_showHostDead', 'kleeBooked'].forEach(function (f) {
        if (old[f] != null) darkRun[f] = old[f];
    });
    // ★ 횟수는 K 의 방 칸(kroomUse)에서 쓴다 — 일반 어둠 횟수(darkTries)는 건드리지 않는다
    if (!isParty) {
        if (!helper) kUse(1);                                // 헬퍼는 횟수를 쓰지 않는다
        applyDarkSatiety(K_CODE);
        try { saveFields({ satiety: 1 }); } catch (e) { }
    } else {
        // 일행 출발(launchPartyRun)은 어느 어둠이든 darkTries 를 하나 올리고 바로 여기로 온다 — 되돌린다
        u.darkTries = Math.max(0, (Number(u.darkTries) || 0) - 1);
        if (!helper) kUse(1);
    }
    kr = { team: isParty ? pid : ('solo_' + u.code), dun: null, floor: 0, idx: 0, step: 'job',
           exp: 0, dream: 0, items: {}, log: [], started: now(), met: {}, seenJ: {},
           uses: {}, stats: null, wakeNow: 0, pts: 0, flags: {}, helper: helper };
    if (helper) {
        addHistoryLog(u, '[' + K_CODE + '] 헬퍼로 들어갔습니다. (보상 없음 · 횟수 차감 없음)');
        setTimeout(function () { toast('헬퍼로 들어왔습니다 — 경험치 · 꿈결 · 포인트를 받지 않고, 횟수도 줄지 않습니다.'); }, 900);
    }
    try { kv(resetDnaCharge); } catch (e) { }                  // 회피·행운·기믹 횟수 — 쇼핑몰 것은 빼고
    try { if (typeof clearDarkRunState === 'function') clearDarkRunState(); } catch (e) { }
    try { kDrop(); } catch (e) { }                            // 지난 판의 이어 갈 자리는 버린다
    darkAmbienceStart(K_CODE);
    openDarkOverlay();
    const el = document.getElementById('dro-code'); if (el) el.innerText = K_CODE;
    teamUp();
    const goOn = function () { if (!prof(u).job) cardPick(); else afterJob(); };
    if (hiddenOffered()) { hiddenPopup(goOn); return; }
    goOn();
}

// 팀 자리 — 네 팀 세는 데 쓴다
function teamUp() {
    const d = db_(), u = me(); if (!d || !kr) return;
    const ref = d.ref('kroomTeams/' + kr.team);
    ref.child('at').set(now());
    ref.child('leader').set(darkRun.isParty && typeof darkParties !== 'undefined' && darkParties[darkRun.partyId]
        ? darkParties[darkRun.partyId].leaderName : u.name);
    ref.child('m/' + u.code).set(true);
    try { ref.child('m/' + u.code).onDisconnect().remove(); } catch (e) { }
    if (!darkRun.isParty) { try { ref.onDisconnect().remove(); } catch (e) { } }
    if (kr._beat) clearInterval(kr._beat);
    kr._beat = setInterval(function () {
        if (!kr) return;
        try { d.ref('kroomTeams/' + kr.team + '/at').set(now()); } catch (e) { }
        runBeat();
    }, 30000);
}
function teamDown() {
    const d = db_(), u = me(); if (!d || !kr) return;
    if (kr._beat) clearInterval(kr._beat);
    const t = kr.team;
    const empty = function (s) { const v = s && s.val(); return !v || !Object.keys(v).length; };
    if (!darkRun || !darkRun.isParty) {                 // 혼자면 팀 자리를 통째로 치운다
        d.ref('kroomTeams/' + t).remove();
        if (kr.dun) d.ref('kroomRuns/' + kr.dun + '/' + t).remove();
        return;
    }
    d.ref('kroomTeams/' + t + '/m/' + u.code).remove().then(function () {
        return d.ref('kroomTeams/' + t + '/m').once('value');
    }).then(function (s) { if (empty(s)) d.ref('kroomTeams/' + t).remove(); }).catch(function () { });
    if (kr.dun) {
        d.ref('kroomRuns/' + kr.dun + '/' + t + '/m/' + u.code).remove().then(function () {
            return d.ref('kroomRuns/' + kr.dun + '/' + t + '/m').once('value');
        }).then(function (s) { if (empty(s)) d.ref('kroomRuns/' + kr.dun + '/' + t).remove(); }).catch(function () { });
    }
}

// ==========================================
// 화면 틀 — 위에 스탯 막대
// ==========================================
function show(title, text, extra) {
    if (kr) kr._going = false;                                // 내려가는 중이었으면 이제 닿았다
    darkBodyEl().innerHTML = darkBox(title, text, bar() + banner() + (extra || ''));
    kSaveSoon();                                              // 혼자 — 이 화면과 상태를 적어 둔다 (창이 끊겨도 이어 가게)
    if (darkRun && darkRun.isParty) { try { mountDarkChat('normal'); } catch (e) { } }
    // 막대가 이전 값에서 지금 값으로 줄어드는 것이 보이게
    setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll('#dro-body .kb-f[data-to]'), function (e) {
            e.style.width = e.dataset.to + '%';
        });
    }, 40);
}
function statKeys() {
    const j = kr && kr.job ? JOBS[kr.job] : null;
    return ['hp', 'mind', 'spirit'].concat(j && j[1] ? [j[1]] : []);
}
const BARC = { hp: '#e05656', mind: '#5b9be0', spirit: '#a07ae0', mana: '#4fd1e0', might: '#e0904f', qi: '#e0c34f' };
function bar() {
    if (!kr || !kr.stats) return '';
    const k = prof();
    const was = kr._shown || {};
    const rows = statKeys().map(function (s) {
        const v = Math.round(kr.stats[s]), mx = kr.max[s];
        const p = clamp(Math.round(v / mx * 100), 0, 100);
        const from = (was[s] != null) ? clamp(Math.round(was[s] / mx * 100), 0, 100) : p;
        const drop = (was[s] != null && was[s] !== v) ? (v < was[s] ? ' <span style="color:#ff6b6b;">' + (v - Math.round(was[s])) + '</span>' : ' <span style="color:#4CAF50;">+' + (v - Math.round(was[s])) + '</span>') : '';
        return `<div style="display:flex; align-items:center; gap:6px; font-size:10px; color:#aaa; margin:2px 0;">
            <span style="width:34px; flex:0 0 auto;">${STATN[s]}</span>
            <div style="flex:1; height:7px; background:rgba(255,255,255,.07); border-radius:4px; overflow:hidden;">
                <div class="kb-f" data-to="${p}" style="height:100%; width:${from}%; background:${BARC[s]}; transition:width .7s ease;"></div></div>
            <span style="width:62px; flex:0 0 auto; text-align:right; color:${v <= mx * 0.25 ? '#ff6b6b' : '#ccc'};">${v}/${mx}${drop}</span></div>`;
    }).join('');
    kr._shown = Object.assign({}, kr.stats);
    const d = kr.dun ? DUNS[kr.dun] : null;
    return `<div style="background:rgba(0,0,0,0.35); border:1px solid #23343b; border-radius:6px; padding:8px 10px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#8fb8c4; margin-bottom:5px;">
            <span>Lv ${k.lv} · ${kr.job ? ATTR[JOBS[kr.job][0]].i + ' ' + esc(jobName(kr.job, k.grade)) + ' ' + k.grade : ''}</span>
            <span>${d ? esc(d.n || kr.dun) + (kr.floor ? ' · ' + kr.floor + '층' : '') : ''}</span>
        </div>${rows}
        ${kr.gear && Object.keys(kr.gear).length ? '<div style="font-size:10px; color:#b9a3e0; margin-top:4px;">' + Object.keys(kr.gear).map(function (a) { return ATTR[a].i + ' ' + GEAR_K[a].n + ' ' + kr.gear[a].left + '/' + kr.gear[a].n; }).join(' · ') + '</div>' : ''}
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-top:4px;">
            <span>경험치 +${kr.exp}</span><span style="color:#c9a8ff;">꿈결 +${kr.dream} D</span></div>
    </div>`;
}

function setStat(s, v, why) {
    if (!kr || !kr.stats || kr.stats[s] == null) return 0;
    const before = kr.stats[s];
    kr.stats[s] = clamp(Math.round(v), 0, kr.max[s]);
    pubStat();
    return kr.stats[s] - before;
}
function addStat(s, dv) { if (!kr || !kr.stats || kr.stats[s] == null) return 0; return setStat(s, kr.stats[s] + dv); }

// 맞는 값 — 속성이 줄여 준다
function hard() {
    const g = (kr && kr.dun && DUNS[kr.dun]) ? DUNS[kr.dun].g : 'D';
    const h = HARD[g] || { dc: 0, lose: 1 };
    const sh = soloHard(g);
    return sh ? { dc: h.dc + sh.dc, lose: h.lose * sh.lose, no20: !!sh.no20, doom: !!sh.doom } : h;
}
// 혼자인가 — 일행으로 들어왔어도 한 사람뿐이면 혼자다
function alone() {
    if (!darkRun) return true;
    if (!darkRun.isParty) return true;
    try { return members().length <= 1; } catch (e) { return true; }
}
function soloHard(g) { return alone() ? (SOLO_HARD[g] || null) : null; }
function hurt(lose) {
    const got = {};
    if (!lose) return got;
    const a = JOBS[kr.job][0];
    const mul = hard().lose;
    Object.keys(lose).forEach(function (s) {
        let v = lose[s] * mul;
        if (v >= 0 || kr.stats[s] == null) return;
        if (s === 'hp' && a === 'steady') v *= 0.7;
        if (s === 'hp' && a === 'evade') v *= 0.8;
        if (s === 'mind' && a === 'steady') v *= 0.8;
        if (s === 'spirit' && a === 'gaze') v *= 0.8;
        v *= (1 - 0.04 * gi(prof().grade));          // 각성할수록 덜 다친다
        const d = addStat(s, Math.round(v));
        if (d) got[s] = d;
    });
    return got;
}

// ==========================================
// 팀 — 보정 · 행운 수, 평균 Lv
// ==========================================
function members() {
    if (!darkRun || !darkRun.isParty || typeof darkParties === 'undefined') return [me().code];
    const p = darkParties[darkRun.partyId];
    return p && p.members ? Object.keys(p.members) : [me().code];
}
function attrOf(code) {
    const u = (code === me().code) ? me() : ((typeof db !== 'undefined' && db.users) ? db.users[code] : null);
    const k = u && u.kroom;
    return (k && !stale(k) && k.job && JOBS[k.job]) ? JOBS[k.job][0] : null;
}
function teamCount(attr) { return members().filter(function (c) { return attrOf(c) === attr; }).length; }

// 굴림 — d20 + 바탕 보정 + 제 속성 +3 + 각성 + 보정(팀) − 지침
function roll(kind) {
    const k = prof();
    let b = 0;
    try { b += kv(rollDarkBonus, null, [kind]) || 0; } catch (e) { }       // 쇼핑몰 것은 빼고 센다
    if (kind && JOBS[kr.job] && JOBS[kr.job][0] === kind) b += 3;
    b += gi(k.grade);
    b += Math.min(3, teamCount('fix'));
    if (kr.stats && kr.stats.mind <= 0) b -= 3;
    if (kr.stats && kr.stats.spirit <= 20) b -= 2;
    const r = kv(luckReroll, null, [Math.floor(Math.random() * 20) + 1]);
    afterDice();
    return { r: r, b: b };
}

// ==========================================
// 1. 직업 — 뒤집힌 카드
// ==========================================
function cardPick() {
    const u = me(), k = prof(u);
    const a = mainAttr(u);
    if (!a) { show('—', '새겨진 것이 없는 자에게는 방이 열리지 않는다.', darkChoiceBtn('돌아간다.', 'kroomFinish()')); return; }
    if (!kr.deck) {
        kr.deck = Object.keys(JOBS).filter(function (j) { return JOBS[j][0] === a && !isHiddenJob(j); })
            .sort(function () { return Math.random() - 0.5; });
    }
    // 넘겨 둔 것이 있으면(다시 들어와도) 그대로 보여 준다
    const peek = k.peek && JOBS[k.peek] && JOBS[k.peek][0] === a ? k.peek : null;
    const cards = kr.deck.map(function (j, i) {
        const open = (peek === j);
        const J = JOBS[j];
        return `<div onclick="${open ? '' : 'kroomCard(' + i + ')'}" style="flex:1 1 0; min-width:0; aspect-ratio:2/3; border-radius:8px; cursor:${open ? 'default' : 'pointer'};
                ${open ? 'background:linear-gradient(160deg,#1c2a30,#0f1416); border:1px solid #7fd3e6; box-shadow:0 0 14px rgba(127,211,230,.35);'
                       : 'background:repeating-linear-gradient(45deg,#1a1420 0 6px,#140f19 6px 12px); border:1px solid #4a3a5a;'}
                display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4px; text-align:center;
                transition:transform .35s; ${open ? 'transform:rotateY(0deg);' : ''}">
                ${open ? `<div style="font-size:18px;">${ATTR[J[0]].i}</div><div style="font-size:11px; color:#fff; font-weight:bold; margin-top:4px; word-break:keep-all;">${esc(J[2][0])}</div>`
                       : `<div style="font-size:18px; color:#6a5a7a;">K</div>`}
            </div>`;
    }).join('');
    let detail = '';
    if (peek) {
        const J = JOBS[peek];
        detail = `<div style="background:rgba(127,211,230,0.07); border:1px solid #2f4a55; border-radius:6px; padding:12px; margin-top:12px;">
                <div style="font-size:15px; color:#fff; font-weight:bold;">${ATTR[J[0]].i} ${esc(J[2][0])}</div>
                <div style="font-size:11px; color:#aaa; margin:5px 0 8px 0; line-height:1.6;">${esc(J[3])}</div>
                <div style="font-size:10px; color:#8fb8c4; line-height:1.8;">
                    속성 ${ATTR[J[0]].n} — ${ATTR[J[0]].role}<br>
                    스탯 체력 · 심력 · 정신력${J[1] ? ' · <b>' + RES[J[1]] + '</b>' : ''}<br>
                    각성 ${J[2].map(esc).join(' → ')}
                </div></div>`
            + darkChoiceBtn('이 직업으로 정한다.', 'kroomCardOk()')
            + (k.rerolled ? '<div style="font-size:10px; color:#888; text-align:center;">다시 고를 기회는 이미 썼다.</div>'
                          : darkChoiceBtn('다시 고른다. <span style="font-size:10px; color:#888;">(한 번만)</span>', 'kroomCardRe()'));
    }
    show('배역', `방에 들어서자 탁자 위에 카드가 다섯 장 엎어져 있다.<br><br>
        뒷면이 모두 같다. 무늬 가운데에 K 한 글자.<br>
        ${peek ? '넘긴 한 장이 빛을 받는다.' : '하나를 넘긴다.'}<br>
        <span style="font-size:11px; color:#888;">${ATTR[a].i} ${ATTR[a].n} — 전용 장비 첫 번째 속성의 자리들이다.</span>`,
        `<div style="display:flex; gap:6px; perspective:600px;">${cards}</div>` + detail);
}
window.kroomCard = function (i) {
    const k = prof(); if (!kr || !kr.deck) return;
    if (k.peek && JOBS[k.peek]) return;                     // 한 장만 넘긴다
    k.peek = kr.deck[i];
    saveProf();                                             // 다시 들어와도 같은 카드다
    cardPick();
};
window.kroomCardRe = function () {
    const k = prof(); if (k.rerolled) return;
    k.rerolled = true; k.peek = null;
    saveProf();
    kr.deck = kr.deck.sort(function () { return Math.random() - 0.5; });
    cardPick();
};
window.kroomCardOk = function () {
    const k = prof(), u = me(); if (!k.peek) return;
    k.job = k.peek; k.peek = null; k.grade = 'D'; k.wake = {};
    addHistoryLog(u, '[K 의 방] 직업 — ' + jobName(k.job, 'D'));
    saveProf();
    if (darkRun.isParty) sendPartyChat(u.name + ' 사원이 ' + jobName(k.job, 'D') + '의 카드를 집었습니다.', true);
    afterJob();
};

// ==========================================
// 2. 던전 정하기 — 팀 평균 Lv · 직업 등급
// ==========================================
function afterJob() {
    const k = prof();
    kr.job = k.job;
    const J = JOBS[kr.job];
    kr.max = { hp: 100, mind: 100, spirit: 100 };
    if (J[1]) kr.max[J[1]] = 100;
    Object.keys(kr.max).forEach(function (s) { kr.max[s] += 5 * gi(k.grade); });   // 각성할수록 그릇이 커진다
    kr.stats = Object.assign({}, kr.max);
    kr._shown = null;
    kr.gear = gearPower();
    if (darkRun.isParty) waitDungeon(); else pickDun([me().code], enterDungeon);
}

// 전용 장비 속성마다 이번 판에 쓸 수 있는 횟수
function gearPower() {
    const u = me(), out = {};
    const g = (typeof getGear === 'function') ? getGear(u) : (u && u.soulGear);
    const attrs = g && Array.isArray(g.attrs) ? g.attrs : [];
    const jt = gi(prof().grade);
    attrs.forEach(function (a) {
        if (!GEAR_K[a]) return;
        let gg = 'D';
        try { gg = (typeof gearAttrGrade === 'function') ? gearAttrGrade(g, a) : (g.grade || 'D'); } catch (e) { }
        const n = Math.min(5, 1 + Math.floor(((GEAR_T[gg] || 0) + jt) / 2));
        out[a] = { n: n, left: n, g: gg };
    });
    // 🌟 제 칠 성군 · 염정 — 드린 속성(D · 치성이면 L)도 함께 든다. 내 장비 등급이 더 높으면 그쪽 (chilseong.js · 2026-10-20)
    try {
        const y = (typeof window.chilYeomOf === 'function') ? window.chilYeomOf(u) : null;
        if (y) Object.keys(y).forEach(function (a) {
            if (!GEAR_K[a]) return;
            const gy = y[a];
            if (out[a] && (GEAR_T[out[a].g] || 0) >= (GEAR_T[gy] || 0)) return;
            const n = Math.min(5, 1 + Math.floor(((GEAR_T[gy] || 0) + jt) / 2));
            out[a] = { n: n, left: n, g: gy };
        });
    } catch (e) { }
    return out;
}
function gearUse(a) {
    const x = kr && kr.gear && kr.gear[a];
    if (!x || x.left <= 0) return false;
    x.left--;
    return true;
}
function gearLine(a, extra) {
    const x = kr.gear[a];
    return `<div style="font-size:11px; color:#d4bbff; margin:0 0 8px 0; padding:7px 9px; border:1px solid #4a3a6a; border-radius:5px; background:rgba(106,76,147,.12);">
        ${ATTR[a].i} 전용 장비 — <b>${GEAR_K[a].n}</b> ${extra || ''} <span style="color:#888;">(남은 ${x.left} / ${x.n})</span></div>`;
}

// 직업 등급 — 아직 처음으로 안 돌아간 기록(stale)은 D 로 본다
function gradeOf(u) { const k = u && u.kroom; return (k && !stale(k) && (GRADES.indexOf(k.grade) >= 0 || k.grade === 'L')) ? k.grade : 'D'; }

// ★ 고를 수 있는 등급 — decide 와 같은 문(Lv · 각성 절반)이되 Lv 에 흔들기(±3)를 안 넣는다.
//   방장이 고르는 판(pickDun)이 쓴다. 들어갈 수 있는지 보는 것이라 늘 같은 답이어야 한다.
function gateOf(codes) {
    const users = codes.map(function (c) {
        return (c === me().code) ? me() : ((typeof db !== 'undefined' && db.users) ? db.users[c] : null);
    });
    const lvs = users.map(lvOf);
    const gis = users.map(function (u) { return gi(gradeOf(u)); });
    const avg = lvs.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, lvs.length);
    let dl = Math.round(avg);
    if (Math.max.apply(null, lvs) - Math.min.apply(null, lvs) > 20) dl -= 10;   // 밸런스 (decide 와 같다)
    dl = clamp(dl, 1, LV_MAX);
    const ok = GRADES.filter(function (g) {
        const woke = gis.filter(function (x) { return x >= gi(g); }).length;
        return dl >= GATE[g] && woke * 2 >= gis.length
            && Object.keys(DUNS).some(function (id) { return DUNS[id].g === g && DUNS[id].ready; });
    });
    if (!ok.length) ok.push('D');
    return { ok: ok, dl: dl, avg: Math.round(avg) };
}

// ★ 방장이 던전을 고른다 (2026-10-18)
//   들어갈 수 있는 등급(Lv · 각성)마다 그 등급의 던전이 줄줄이 선다. 혼자면 나, 일행이면 방장이 고른다.
//   「아무 데나」를 누르면 전처럼 높은 등급에 무게를 둔 제비뽑기(decide)로 정한다.
//   바로 전에 들어갔던 던전에는 「지난번」 표시만 붙인다 — 골라도 된다.
function pickDun(codes, done) {
    const G = gateOf(codes);
    const last = prof().lastDun;
    kr._pickDun = function (id) {
        kr._pickDun = null;
        if (id) done({ id: id, lv: G.dl, avg: G.avg, pick: 1 });
        else decide(codes, [last]).then(done);
    };
    const party = codes.length > 1;
    const rows = G.ok.slice().reverse().map(function (g) {
        const ids = Object.keys(DUNS).filter(function (id) { return DUNS[id].g === g && DUNS[id].ready; });
        return `<div style="font-size:11px; color:#7fd3e6; margin:12px 0 6px 0;">${g} 등급 <span style="color:#777;">· Lv ${GATE[g]}+</span></div>`
            + ids.map(function (id) {
                return darkChoiceBtn(esc(DUNS[id].n) + (id === last ? ' <span style="font-size:10px; color:#888;">(지난번)</span>' : ''),
                    'kroomDunPick(\'' + id + '\')');
            }).join('');
    }).join('');
    show('문', `문이 여러 개다.<br><br>손잡이마다 다른 냄새가 난다. ${party ? '팀을 데려갈' : '들어갈'} 문을 고른다.<br>
        <span style="font-size:11px; color:#888;">${party ? '팀 평균' : ''} Lv ${G.dl} · 들어갈 수 있는 등급 ${G.ok.join(' · ')}</span>`,
        rows + `<div style="margin-top:12px;">${darkChoiceBtn('아무 문이나 연다. <span style="font-size:10px; color:#888;">(무작위)</span>', 'kroomDunPick(\'\')')}</div>`);
}
window.kroomDunPick = function (id) {
    if (!kr || kr.dun || typeof kr._pickDun !== 'function') return;
    if (id && !(DUNS[id] && DUNS[id].ready)) return;
    kr._pickDun(id || null);
};

// avoid — 바로 전에 들어갔던 던전. 그 등급에 다른 던전이 있으면 그것은 빼고 고른다.
//
// ★ 등급 문은 둘이다 (2026-10-17 정함)
//     ① 팀 평균 Lv 이 GATE 이상          (C 20 · B 50 · A 70 · S 90)
//     ② 그 등급으로 각성한 사람이 **절반 이상**   (혼자면 내가 그 등급이어야)
//   각성은 제 등급 던전에서 하므로, D 던전에서 C 를 만들어야 C 던전이 열린다.
function decide(codes, avoid) {
    const users = codes.map(function (c) {
        return (c === me().code) ? me() : ((typeof db !== 'undefined' && db.users) ? db.users[c] : null);
    });
    const lvs = users.map(lvOf);
    const gis = users.map(function (u) { return gi(gradeOf(u)); });
    const avg = lvs.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, lvs.length);
    let dl = Math.round(avg) + rnd(-3, 3);
    if (Math.max.apply(null, lvs) - Math.min.apply(null, lvs) > 20) dl -= 10;   // 밸런스
    dl = clamp(dl, 1, LV_MAX);
    // 들어갈 수 있는 등급 — 높은 쪽에 무게를 더 준다
    const ok = GRADES.filter(function (g) {
        const woke = gis.filter(function (x) { return x >= gi(g); }).length;
        return dl >= GATE[g] && woke * 2 >= gis.length;
    });
    const w = ok.map(function (g, i) { return i === ok.length - 1 ? 4 : (i === ok.length - 2 ? 2 : 1); });
    let grade = 'D', t = Math.random() * w.reduce(function (a, b) { return a + b; }, 0);
    for (let i = 0; i < ok.length; i++) { t -= w[i]; if (t <= 0) { grade = ok[i]; break; } }
    // 그 등급 던전이 아직 없으면 한 등급씩 내려가며 찾는다
    let pool = [];
    for (let gx = gi(grade); gx >= 0 && !pool.length; gx--) {
        grade = GRADES[gx];
        pool = Object.keys(DUNS).filter(function (id) { return DUNS[id].g === grade && DUNS[id].ready; });
    }
    const fresh = pool.filter(function (id) { return (avoid || []).indexOf(id) < 0; });
    if (fresh.length) pool = fresh;
    return Promise.resolve({ id: pick(pool), lv: dl, avg: Math.round(avg) });
}

// 일행이면 팀장이 정하고 모두 그것을 읽는다
//
//   ★ 정한 던전에 **이번 출발 표(run)**를 붙인다 — 팀의 startedAt.
//     ✗ 전에는 kDun 을 한 번 적고 안 지웠다. 일행은 판이 끝나도 그대로 남아
//       다시 출발하므로, 다음 판에 들어서자마자 **지난 판의 kDun** 이 읽혀
//       늘 같은 던전에 들어갔다 (팀장도 제가 새로 정하기 전에 그것을 읽었다).
//     이제 이번 출발 표가 맞는 것만 받는다. 정할 때는 지난 판 던전을 뺀다.
function waitDungeon() {
    const d = db_(); const pid = darkRun.partyId;
    const p = darkParties[pid];
    const lead = p && p.leader === me().code;
    const run = (p && p.startedAt) || 0;
    const mine = function (v) { return !!(v && v.id && (run ? v.run === run : (v.at || 0) > kr.started - 20000)); };
    show('—', `팀이 모이기를 기다린다.<br><br>문 앞에 선 사람 수만큼 문고리가 차가워진다.`,
        `<div style="font-size:11px; color:#888; text-align:center; padding:10px;">팀장이 문을 여는 중…</div>`);
    const ref = d.ref('darkParties/' + pid + '/kDun');
    const take = function (s) {
        const v = s.val();
        if (!mine(v) || !kr || kr.dun) return;
        ref.off('value', take);
        enterDungeon(v);
    };
    ref.on('value', take);
    if (lead) {
        // 팀원이 카드를 고르는 동안 조금 기다렸다가 고르는 판을 띄운다 (각성 등급이 다 적히게)
        setTimeout(function () {
            if (!kr || kr.dun) return;
            pickDun(members(), function (v) { v.at = now(); v.run = run; ref.set(v); });
        }, 1500);
    } else {
        show('—', `팀이 모이기를 기다린다.<br><br>방장이 문 앞에 서서 손잡이를 하나씩 쥐어 본다.`,
            `<div style="font-size:11px; color:#888; text-align:center; padding:10px;">방장이 던전을 고르는 중…</div>`);
    }
    setTimeout(function () {                                 // 방장이 끊겼으면(3분) 내가 정한다
        if (!kr || kr.dun) return;
        decide(members(), [prof().lastDun]).then(function (v) {
            v.at = now(); v.run = run;
            ref.transaction(function (cur) { return mine(cur) ? cur : v; });
        });
    }, 180000);
}

function enterDungeon(v) {
    if (!kr) return;
    kr.dun = v.id; kr.dunLv = v.lv;
    try { prof().lastDun = v.id; } catch (e) { }              // 다음 판에는 이것을 빼고 고른다 (정산 때 같이 적힌다)
    show('—', `문이 열린다.<br><br>문 너머가 방이 아니다.`, `<div style="font-size:11px; color:#888; text-align:center; padding:10px;">방을 불러오는 중…</div>`);
    loadFor(kr.dun, kr.job).then(function () {
        const D = DATA.dun[kr.dun];
        if (!D) {
            show('—', '방이 열리지 않는다.<br><br>문 너머가 아직 비어 있다. (내용을 받지 못했습니다 — 잠시 뒤 다시 들어와 주십시오)',
                darkChoiceBtn('돌아간다.', 'kroomFinish()'));
            return;
        }
        kr.floor = 1; kr.idx = 0; kr.plan = plan();
        runUp();
        if (darkRun.isParty) sendPartyChat(DUNS[kr.dun].n + ' — 던전 Lv ' + kr.dunLv, true);
        darkRun.log.push('[K 의 방] ' + DUNS[kr.dun].n + ' (Lv ' + kr.dunLv + ')');
        show(DUNS[kr.dun].n, D.intro + `<br><br><span style="font-size:11px; color:#8fb8c4;">던전 Lv ${kr.dunLv} · ${DUNS[kr.dun].g}등급 · ${D.concept ? esc(D.concept) : ''}</span>`,
            darkChoiceBtn('발을 들인다.', 'kroomNext()'));
        watchAid(); watchDoom(); watchGift();
    });
}

// 층마다 볼 것 — 공용 장면 4 + 직업 갈림길 1 (+ 마지막 층 끝에 보스)
function kinOf(job) {
    if (!isHiddenJob(job)) return [job];
    const a = JOBS[job][0];
    return Object.keys(JOBS).filter(function (j) { return JOBS[j][0] === a && !isHiddenJob(j); });
}
function plan() {
    const D = DATA.dun[kr.dun];
    const gD = DUNS[kr.dun].g;
    const pool = [].concat.apply([], kinOf(kr.job).map(function (j) { return ((DATA.job[j] || {})[gD] || []); })).filter(function (b) {
        return b.at === kr.dun || b.at === DUNS[kr.dun].g;
    });
    // 아직 안 본 갈림길부터 (저장해 둔 본 목록)
    const seen = (prof().seen = prof().seen || {});
    pool.sort(function (a, b) { return (seen[a.t] ? 1 : 0) - (seen[b.t] ? 1 : 0) || (Math.random() - 0.5); });
    // ★ 직업 선택지 — 보통 장면마다 하나씩 붙인다 (이 판 안에서는 겹치지 않게 섞어 차례로)
    //   장면 원본은 건드리지 않는다 — 이 판의 몫만 얕게 베껴 선택지를 하나 더 단다.
    const ops = [].concat.apply([], kinOf(kr.job).map(function (j) { return ((DATA.opt[j] || {})[gD]) || []; }))
        .sort(function () { return Math.random() - 0.5; });
    let on = 0;
    const withJob = function (sc) {
        if (!ops.length) return sc;
        const o = Object.assign({ job: 1 }, ops[on++ % ops.length]);
        return Object.assign({}, sc, { o: (sc.o || []).concat([o]) });
    };
    const out = [];
    D.floors.forEach(function (fl, fi) {
        const list = fl.scenes.map(function (sc) { return { sc: withJob(sc), kind: 'c' }; });
        const jb = pool.shift();
        if (jb) list.splice(rnd(1, list.length), 0, { sc: jb, kind: 'j' });
        if (fl.boss) list.push({ sc: fl.boss, kind: 'boss' });
        out.push(list);
    });
    return out;
}

// ==========================================
// 3. 걷기 — 장면 · 고르기 · 결과
// ==========================================
window.kroomNext = function () {
    if (!kr || !kr.plan) return;
    if (kr.dead || kr.down) return;
    const fl = kr.plan[kr.floor - 1];
    if (!fl) { clear(); return; }
    // 다른 팀과 만나기 — 층 첫머리에 한 번
    if (kr.idx === 0 && !kr._metChecked) {
        kr._metChecked = true;
        meet().then(function (other) { if (other) encounter(other); else kroomNext(); });
        return;
    }
    if (kr.idx >= fl.length) { rest(); return; }
    const it = fl[kr.idx];
    kr.cur = it;
    // 정신력이 바닥이면 한 번 폭주 — 고를 수 없다
    if (kr.stats.spirit <= 0 && !kr._panic) {
        kr._panic = true;
        const opts = visible(it.sc.o);
        const i = opts.length ? opts[Math.floor(Math.random() * opts.length)].i : -1;
        show(it.sc.t, it.sc.x + `<br><br><span style="color:#ff6b6b;">— 정신력이 바닥났다. 손이 먼저 움직인다.</span>`,
            darkChoiceBtn('…', 'kroomPick(' + i + ')'));
        return;
    }
    const D = DATA.dun[kr.dun];
    const head = (kr.idx === 0 ? `<div style="font-size:10px; color:#8fb8c4; margin-bottom:6px;">${esc(D.floors[kr.floor - 1].name)}</div>` : '');
    const tag = it.kind === 'j' ? '<span style="font-size:10px; color:#d4af37;">◇ ' + esc(jobName(kr.job, prof().grade)) + '만의 갈림길</span><br><br>'
              : it.kind === 'boss' ? '<span style="font-size:10px; color:#ff6b6b;">◆ 이 층의 끝</span><br><br>' : '';
    let vis = visible(it.sc.o);
    const fs = foxSense(vis);                                 // 🐾 감각 분신 — 즉사 기믹 쪽을 가린다
    if (fs) vis = fs.vis;
    const skull = jisanOn();                                  // 📖 읽어내기 — 즉사 기믹에 ☠
    show(it.sc.t, head + tag + it.sc.x + (fs ? '<br><br><span style="color:#9fd8ef;">' + fs.line + '</span>' : ''),
        (vis.length ? '' : darkChoiceBtn('① 이를 악물고 지나간다.', 'kroomPick(-1)')) +
        vis.map(function (v) {
            const o = v.o;
            const cost = o.cost ? Object.keys(o.cost)[0] : null;
            const can = !cost || (kr.stats[cost] || 0) >= o.cost[cost];
            const lab = (skull && o.doom ? '<span style="color:#ff6b6b;">☠</span> ' : '')
                + (o.job ? '<span style="color:#d4af37;">◇</span> ' : '') + o.l + (cost ? ' <span style="font-size:10px; color:' + BARC[cost] + ';">(' + RES[cost] + ' ' + o.cost[cost] + ')</span>' : '')
                + (o.only ? ' <span style="font-size:10px; color:#8fb8c4;">' + ATTR[o.only].i + '</span>' : '');
            return can ? darkChoiceBtn(lab, 'kroomPick(' + v.i + ')')
                       : `<button class="game-btn" disabled style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; opacity:.4;">${lab}</button>`;
        }).join('') + supportBtn());
};
// 볼 수 있는 선택지 — only 는 그 속성만, cost 는 그 자원이 있는 직업만
function visible(opts) {
    const a = JOBS[kr.job][0], res = JOBS[kr.job][1];
    return (opts || []).map(function (o, i) { return { o: o, i: i }; }).filter(function (v) {
        if (v.o.only && v.o.only !== a) return false;
        if (v.o.cost) { const c = Object.keys(v.o.cost)[0]; if (c !== res) return false; }
        return true;
    });
}

// 이 직업이 고를 것이 하나도 없는 장면 — 버티며 지나간다
const PASS = { l: '이를 악물고 지나간다.', dc: 12,
    ok: '어떻게든 지나갔다.<br><br>무엇을 지나쳤는지는 생각하지 않기로 한다.',
    ng: '지나가긴 했다.<br><br>지나가는 동안 몇 번 부딪혔다. 몸이 기억한다.', lose: { hp: -8, mind: -6 } };
window.kroomPick = function (i) {
    if (!kr || !kr.cur || kr._picking) return;
    const it = kr.cur;
    let o = (i === -1) ? Object.assign({ k: JOBS[kr.job][0] }, PASS) : it.sc.o[i]; if (!o) return;
    kr._picking = true; setTimeout(function () { if (kr) kr._picking = false; }, 400);
    if (o.cost) { const c = Object.keys(o.cost)[0]; addStat(c, -o.cost[c]); }
    if (kr._panic && kr.stats.spirit <= 0) setStat('spirit', 20);       // 폭주 한 번 뒤에 조금 돌아온다
    kr._panic = false;
    const R = roll(o.k);
    const H = hard();
    const dc = (o.dc || 13) + H.dc;
    // 1 은 늘 실패, 20 은 늘 성공 — B 이상은 DC 가 20 을 넘어 보정이 낮으면 아예 못 넘는 자리가 생긴다
    //   ★ 혼자 A · S 에서는 20 도 늘 성공이 아니다 (SOLO_HARD.no20)
    let ok = R.r !== 1 && ((R.r === 20 && !H.no20) || (R.r + R.b) >= dc);
    let gl = '';                                            // 전용 장비가 한 일
    if (H.doom) ok = false;                                 // ★ 혼자 S — 아무것도 안 통한다
    // 파괴 · 감각 · 은신 · 응시 — 그 속성으로 푸는 선택지는 그대로 성공
    if (!ok && !H.doom && ['break', 'sense', 'hide', 'gaze'].indexOf(o.k) >= 0 && gearUse(o.k)) {
        ok = true; gl += gearLine(o.k, '— 손보다 장비가 먼저 움직였다.');
    }
    // 행운 — 다시 굴림
    if (!ok && !H.doom && gearUse('luck')) {
        const R2 = roll(o.k);
        ok = R2.r !== 1 && (R2.r === 20 || (R2.r + R2.b) >= dc);
        gl += gearLine('luck', '— 다시 굴렸다: 🎲 ' + R2.r + (ok ? ' 성공' : ' 이번에도 실패'));
    }
    // 보정 — 5 이하로 모자라면 맞춰 준다
    if (!ok && !H.doom && R.r !== 1 && dc - (R.r + R.b) <= 5 && gearUse('fix')) {
        ok = true; gl += gearLine('fix', '— 모자란 ' + (dc - (R.r + R.b)) + '을(를) 메웠다.');
    }
    // 특수 물건 — 즉사 기믹은 부순다
    if (!ok && !H.doom && o.doom) { const sm = itemSmash(); if (sm) { ok = true; gl += itemLine(sm); } }
    if (o.doom && jisanOn()) kr.truth = true;               // 📖 죽을 길을 잡았다
    kr.idx++;
    if (it.kind === 'j') { const k = prof(); (k.seen = k.seen || {})[it.sc.t] = 1; }
    // ★ 히든 직업 조건 — 갈림길을 겪은 수 (던전 등급마다) · 헬퍼 판은 안 센다
    if (it.kind === 'j' && !isHelper()) {
        const k = prof(); k.jx = k.jx || {};
        const gD = DUNS[kr.dun].g;
        k.jx[gD] = (k.jx[gD] || 0) + 1;
        saveProf();
    }
    const dice = `<div style="text-align:center; font-size:24px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:10px;">🎲 ${R.r} <span style="font-size:12px; color:#888;">(보정 ${R.b >= 0 ? '+' : ''}${R.b} / DC ${dc})</span></div>`;
    if (ok) {
        darkRun.success++;
        // ★ 히든 직업 조건 — 그 속성 직업의 임무(◇ 직업 선택지)를 해낸 수
        if (o.job && !isHelper()) {
            const k = prof(); k.hq = k.hq || {};
            const a = JOBS[kr.job][0];
            k.hq[a] = (k.hq[a] || 0) + 1;
            saveProf();
        }
        try { hiddenCheck(); } catch (e) { }
        const got = reward(o.win, it.kind);
        let tail = got;
        if (o.wake && it.kind === 'j') tail += wakeUp();
        show(it.sc.t + ' — 결과', dice + gl + o.ok + tail, darkChoiceBtn('계속한다.', 'kroomNext()'));
    } else {
        darkRun.fail++;
        // 회피 — 즉사에 걸려도 한 번 빠져나온다
        if (o.doom && !H.doom && gearUse('evade')) {
            addStat('mind', -6);
            show(it.sc.t + ' — 결과', dice + gearLine('evade', '— 반 발짝. 그 반 발짝이 전부였다.')
                + (o.doom.text || '') + '<br><br><span style="color:#d4bbff;">— 몸이 먼저 빠져나왔다.</span>',
                darkChoiceBtn('계속한다.', 'kroomNext()'));
            return;
        }
        if (o.doom) { doom(o.doom); return; }
        // 굳건 — 체력이 깎일 것을 한 번 막는다
        if (o.lose && o.lose.hp < 0 && !H.doom && gearUse('steady')) {
            o = Object.assign({}, o, { lose: Object.assign({}, o.lose, { hp: 0 }) });
            gl += gearLine('steady', '— 맞을 자리에 장비를 댔다.');
        }
        const lost = hurt(o.lose);
        try { kv(applyPollutionToUser, null, [me(), 2]); } catch (e) { }
        if (kr.stats.hp <= 0) { fall('쓰러졌다.'); return; }
        show(it.sc.t + ' — 결과', dice + gl + (o.ng || '') + lossLine(lost), darkChoiceBtn('계속한다.', 'kroomNext()'));
    }
};

// 얻는 것 — 행운이 보탠다
function reward(win, kind) {
    win = win || {};
    const a = JOBS[kr.job][0];
    const g = DUNS[kr.dun].g;
    const mult = { D: 1, C: 1.6, B: 2.4, A: 3.4, S: 5 }[g] || 1;
    let exp = Math.round((win.exp || 12) * mult);
    // 꿈결 — 내용 파일이 「꿈결을 준다」고 적은 자리(win.dream)와 층 끝(보스)에서 한 번씩 얻는다.
    //   얻는 양은 내용의 숫자가 아니라 던전 등급의 범위에서 굴린다.
    let times = (win.dream ? 1 : 0) + (kind === 'boss' ? 1 : 0);
    if (!times && a === 'luck' && Math.random() < 0.25) times = 1;     // 행운 — 안 주는 자리에서도 가끔
    let dream = 0;
    for (let t = 0; t < times; t++) dream += dreamRoll();
    if (dream) {
        if (a === 'luck') dream = Math.round(dream * 1.5);
        if (teamCount('luck') > 0) dream = Math.round(dream * 1.1);
    }
    if (kind === 'boss') exp += Math.round(30 * mult);
    kr.exp += exp; kr.dream += dream;
    const parts = ['경험치 +' + exp];
    if (dream) parts.push('<span style="color:#c9a8ff;">꿈결 +' + dream + ' D</span>');
    ['hp', 'mind', 'spirit', 'mana', 'might', 'qi'].forEach(function (s) {
        if (win[s] && kr.stats[s] != null) { const d = addStat(s, win[s]); if (d) parts.push(STATN[s] + ' +' + d); }
    });
    if (win.item && ITEMS[win.item]) {
        let n = 1;
        if (a === 'luck' && Math.random() < 0.5) n = 2;              // 행운 — 한 개 더
        kr.items[win.item] = (kr.items[win.item] || 0) + n;
        parts.push('<span style="color:#d4af37;">' + esc(win.item) + (n > 1 ? ' ×' + n : '') + '</span>');
    }
    return `<div style="font-size:11px; color:#8fb8c4; margin-top:10px; padding-top:8px; border-top:1px dashed #2f4a55;">${parts.join(' · ')}</div>`;
}
function dreamRoll() {
    const r = DREAM[(kr && kr.dun && DUNS[kr.dun]) ? DUNS[kr.dun].g : 'D'] || DREAM.D;
    return rnd(r[0], r[1]);
}
function lossLine(lose) {
    if (!lose) return '';
    const p = Object.keys(lose).filter(function (s) { return kr.stats[s] != null && lose[s] < 0; })
        .map(function (s) { return STATN[s] + ' ' + lose[s]; });
    return p.length ? `<div style="font-size:11px; color:#ff8a80; margin-top:10px; padding-top:8px; border-top:1px dashed #4a2a2a;">${p.join(' · ')}</div>` : '';
}

// 각성 점수 — 그 등급에서 정해진 만큼 모이면 다음 이름
function wakeUp() {
    const k = prof();
    const g = k.grade;
    if (!wakeNeed(k)) return '';
    if (isHelper()) return `<div style="font-size:11px; color:#81c784; margin-top:6px;">◇ 헬퍼 — 각성 점수는 쌓이지 않는다.</div>`;
    // ★ 각성은 **지금 등급의 던전**에서 한다 — D 던전에서 C 를 만들어야 C 던전이 열린다.
    //   (2026-10-17 사용자가 바꿈. 전에는 올라갈 등급의 던전에서만 했다)
    //   일행에 끼어 더 높은 등급 던전에 들었으면 거기서도 쌓인다. 낮은 등급 던전은 안 쌓인다.
    const dg = DUNS[kr.dun].g;
    if (gi(dg) < gi(g)) {
        return `<div style="font-size:11px; color:#888; margin-top:6px;">◇ 낮은 등급의 갈림길은 각성에 보태지지 않는다 — ${g} 등급 던전에서 각성한다.</div>`;
    }
    k.wake[g] = (k.wake[g] || 0) + 1;
    const need = wakeNeed(k);
    if (k.wake[g] < need) {
        saveProf();
        return `<div style="font-size:11px; color:#d4af37; margin-top:6px;">◇ 각성 ${k.wake[g]} / ${need}</div>`;
    }
    const from = jobName(k.job, g);
    k.grade = NEXT_GRADE[g];
    if (k.grade === 'L') { try { hiddenReachL(k); } catch (e) { } }
    const to = jobName(k.job, k.grade);
    addHistoryLog(me(), '[K 의 방] 각성 — ' + from + ' → ' + to + ' (' + k.grade + ')');
    saveProf();
    // 그릇이 커진다
    Object.keys(kr.max).forEach(function (s) { kr.max[s] += 5; kr.stats[s] = Math.min(kr.max[s], kr.stats[s] + 5); });
    if (darkRun.isParty) sendPartyChat('✦ ' + me().name + ' 사원이 ' + to + '(으)로 각성했습니다.', true);
    return `<div style="margin-top:12px; padding:12px; border:1px solid #d4af37; border-radius:6px; background:rgba(212,175,55,.08); text-align:center;">
        <div style="font-size:11px; color:#d4af37; letter-spacing:2px;">각 성</div>
        <div style="font-size:15px; color:#fff; font-weight:bold; margin:6px 0;">${esc(from)} → ${esc(to)}</div>
        <div style="font-size:10px; color:#aaa;">등급 ${g} → ${k.grade} · 판정 +1 · 스탯 그릇 +5</div></div>`;
}

// ==========================================
// 4. 쉼터 — 층 사이
// ==========================================
function rest() {
    const D = DATA.dun[kr.dun];
    const last = kr.floor >= D.floors.length;
    // 쉬면 조금 돌아온다
    addStat('mind', 10);
    ['mana', 'might', 'qi'].forEach(function (s) { if (kr.stats[s] != null) addStat(s, 5); });
    // 같이 온 사람이 있으면 번갈아 망을 보며 눈을 붙인다. 혼자면 못 잔다.
    const mates = darkRun.isParty && teamStats().some(function (m) { return m.code !== me().code && !m.dead; });
    const R = mates ? REST_PARTY : REST_SOLO;
    const got = Object.keys(R).map(function (s) { const d = addStat(s, R[s]); return d ? STATN[s] + ' ' + (d > 0 ? '+' : '') + d : ''; }).filter(Boolean);
    kr.uses = {};                                  // 돌봄 횟수는 층마다
    if (last) { clear(); return; }
    const others = otherTeams();
    show('쉼터 — ' + kr.floor + '층 끝', (mates
        ? `계단참에 바람이 안 든다.<br><br>
        한 사람이 망을 보는 동안 한 사람이 눈을 붙인다. 번갈아 가며.<br>
        여기까지는 아무것도 따라오지 않았다. 그렇게 믿기로 한다.`
        : `계단참에 바람이 안 든다.<br><br>
        눈을 감으면 무언가 올 것 같아서 감을 수가 없다.<br>
        망을 봐 줄 사람이 없다. 벽에 등을 붙이고 앉아 날이 새기만 기다린다.`) + `<br>
        <span style="font-size:11px; color:#888;">쉬면서 심력 +10 · 마력/무력/내공 +5${got.length ? ' · ' + (mates ? '번갈아 잠: ' : '혼자: ') + got.join(' · ') : ''}</span>`,
        restPanel() + others +
        darkChoiceBtn('▼ ' + (kr.floor + 1) + '층으로 내려간다.', 'kroomDown(' + kr.floor + ')') +
        (hard().doom ? '<div style="font-size:11px; color:#ff6b6b; margin-top:8px;">올라온 길이 없다. 돌아갈 수 없다.</div>'
                     : darkChoiceBtn('여기서 돌아간다. <span style="font-size:10px; color:#888;">(얻은 것의 절반만 들고 나온다)</span>', 'kroomLeave()')));
}
// ★ 한 번만 내려간다 (2026-10-21)
//   ✗ 전에는 누를 때마다 kr.floor++ 였다. 내려가면 먼저 같은 층의 다른 팀을 서버에 묻는데(meet),
//     서버가 느리면 그동안 쉼터 화면이 그대로라 다시 누르게 된다 — 그때마다 한 층씩 더 내려가
//     층을 건너뛰고, 끝내 맨 밑층을 지나쳐 판이 일찍 끝났다 (「맨 밑층까지 안 가진다」 · 「단추가 안 먹힌다」).
//   → 단추에 그 쉼터의 층 번호를 실어 다른 층의 단추는 무시하고, 내려가는 동안(_going)은 다시 받지 않는다.
//     누르면 바로 「내려가는 중」 화면으로 바꾸고, 서버에 묻는 것은 길어야 2.5초만 기다린다 (meet).
window.kroomDown = function (from) {
    if (!kr || kr.dead || kr._settled) return;
    if (from != null && Number(from) !== Number(kr.floor)) return;      // 이미 내려간 쉼터의 단추
    if (kr._going) return;
    const D = DATA.dun[kr.dun];
    if (D && kr.floor >= D.floors.length) return;                       // 더 내려갈 층이 없다
    kr._going = true;
    kr.floor++; kr.idx = 0; kr._metChecked = false;
    show2('▼ ' + kr.floor + '층', '계단을 내려간다.', '<div style="font-size:11px; color:#888; text-align:center; padding:10px;">아래층으로 내려가는 중…</div>');
    runUp();
    kroomNext();
};

function restPanel() {
    const items = Object.keys(kr.items).filter(function (n) { return kr.items[n] > 0; });
    const food = items.filter(function (n) { return ITEMS[n] && ITEMS[n].food; });
    const ing = items.filter(function (n) { return ITEMS[n] && ITEMS[n].ing; });
    let h = '';
    if (food.length) {
        h += `<div style="font-size:10px; color:#8fb8c4; margin:4px 0 6px 0;">— 먹을 것 —</div><div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">`
            + food.map(function (n) {
                const f = ITEMS[n].food;
                return `<button class="game-btn" style="flex:1; min-width:120px; margin:0; padding:8px; font-size:11px;" onclick="kroomEat('${n}')">${esc(n)} ×${kr.items[n]}<br><span style="font-size:9px; color:#888;">${Object.keys(f).map(function (s) { return STATN[s] + '+' + f[s]; }).join(' ')}</span></button>`;
            }).join('') + `</div>`;
    }
    if (kr.job === 'cook') {
        const n = ing.reduce(function (a, b) { return a + kr.items[b]; }, 0);
        h += darkChoiceBtn('🍲 재료 둘로 따뜻한 국을 끓인다. <span style="font-size:10px; color:#888;">(재료 ' + n + '개)</span>', 'kroomCook()');
    } else if (ing.length) {
        h += `<div style="font-size:10px; color:#777; margin-bottom:8px;">재료 ${ing.map(function (n) { return esc(n) + '×' + kr.items[n]; }).join(' · ')} — 요리사만 다룰 수 있다.</div>`;
    }
    return h + supportBtn();
}
window.kroomEat = function (n) {
    if (!kr || !kr.items[n] || !ITEMS[n] || !ITEMS[n].food) return;
    kr.items[n]--;
    const f = ITEMS[n].food;
    const got = Object.keys(f).map(function (s) { const d = addStat(s, f[s]); return STATN[s] + ' +' + d; });
    show('쉼터', esc(n) + '을(를) 먹었다.<br><br>' + got.join(' · '), restPanel() + darkChoiceBtn('▼ ' + (kr.floor + 1) + '층으로 내려간다.', 'kroomDown(' + kr.floor + ')') + darkChoiceBtn('여기서 돌아간다.', 'kroomLeave()'));
};
window.kroomCook = function () {
    if (!kr || kr.job !== 'cook') return;
    const ing = Object.keys(kr.items).filter(function (n) { return ITEMS[n] && ITEMS[n].ing && kr.items[n] > 0; });
    let left = 2;
    const use = [];
    ing.forEach(function (n) { while (left > 0 && kr.items[n] > 0) { kr.items[n]--; left--; use.push(n); } });
    if (left > 0) { use.forEach(function (n) { kr.items[n]++; }); show('쉼터', '재료가 모자라다. 둘은 있어야 국이 된다.', restPanel() + darkChoiceBtn('▼ ' + (kr.floor + 1) + '층으로 내려간다.', 'kroomDown(' + kr.floor + ')')); return; }
    const n = gi(prof().grade) >= 2 ? 2 : 1;                      // 각성할수록 넉넉히 끓인다
    kr.items['따뜻한 국'] = (kr.items['따뜻한 국'] || 0) + n;
    show('쉼터', `${use.map(esc).join('과 ')}을 넣고 끓였다.<br><br>김이 오른다. 이 냄새를 맡으면 다들 조금 덜 무섭다.<br>따뜻한 국 ×${n}`,
        restPanel() + darkChoiceBtn('▼ ' + (kr.floor + 1) + '층으로 내려간다.', 'kroomDown(' + kr.floor + ')'));
};

// ==========================================
// 5. 돌보기 — 속성마다 할 수 있는 것
// ==========================================
//   치유 → 체력 (판정 — d20 + 보정 ≥ DC 10 · 2026-10-20 전에는 무조건 성공)   응시 → 정신력   보정 → 마력
//   굳건 → 제 무력             연결 → 내공     요리사 → 국을 건넨다
//   층마다 두 번 (치유 장비가 있으면 그 횟수만큼 더). 보정이 팀에 있으면 채우는 양이 늘어난다.
const CARE = { heal: 'hp', gaze: 'spirit', fix: 'mana', bond: 'qi', steady: 'might' };
function careMax() { return 2 + ((kr.gear && kr.gear.heal) ? kr.gear.heal.n : 0); }
// ★ 치유도 판정을 굴린다 (2026-10-20) — 돌보기 DC 10 · 쓰러진 동료 일으키기는 그 쓰러짐의 DC
//   굴림은 roll('heal') — d20 + 바탕 보정 + 치유 직업 +3 + 각성 + 팀 보정. 1 은 늘 실패 · 20 은 늘 성공
const CARE_DC = 10;
function healDice(R, dc, ok) {
    return `<div style="text-align:center; font-size:24px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:10px;">🎲 ${R.r} <span style="font-size:12px; color:#888;">(보정 ${R.b >= 0 ? '+' : ''}${R.b} / DC ${dc})</span></div>`;
}
function healRoll(dc) {
    const R = roll('heal');
    const ok = R.r !== 1 && (R.r === 20 || (R.r + R.b) >= dc);
    return { R: R, ok: ok, dice: healDice(R, dc, ok) };
}
function careAmt() { return Math.round(25 * (1 + 0.2 * Math.min(2, teamCount('fix'))) * (1 + 0.1 * gi(prof().grade))); }
function supportBtn() {
    const a = JOBS[kr.job][0];
    if (!CARE[a] && kr.job !== 'cook') return '';
    return `<button class="game-btn" style="width:100%; margin:4px 0 8px 0; padding:9px; font-size:11px; background:linear-gradient(145deg,#1f3a2a,#13261b) !important; border-color:#2f6a45 !important;" onclick="kroomCare()">🤝 동료를 돌본다 <span style="font-size:10px; color:#8fb8c4;">(${STATN[CARE[a]] || '국'} · 남은 ${careMax() - (kr.uses.care || 0)}번)</span></button>`;
}
window.kroomCare = function () {
    if (!kr) return;
    const a = JOBS[kr.job][0];
    const stat = CARE[a];
    const left = careMax() - (kr.uses.care || 0);
    const mates = teamStats();
    const rows = mates.map(function (m) {
        const self = m.code === me().code;
        // 굳건은 제 무력만 · 나머지는 나도 남도
        if (a === 'steady' && !self) return '';
        const has = stat ? (m[stat] != null) : true;
        const val = stat && m[stat] != null ? m[stat] + '/' + (m['max_' + stat] || 100) : '';
        const ok = left > 0 && has && !(m.down && stat !== 'hp');
        return `<div style="display:flex; align-items:center; gap:8px; padding:8px 10px; margin-bottom:6px; border:1px solid #2a3a3f; border-radius:6px;">
            <div style="flex:1; font-size:11px; color:#ddd;">${esc(m.n)}${self ? ' (나)' : ''}${m.down ? ' <span style="color:#ff6b6b;">쓰러짐</span>' : ''}
                <div style="font-size:9px; color:#888;">체력 ${m.hp} · 심력 ${m.mind} · 정신력 ${m.spirit}${m.res ? ' · ' + RES[m.res] + ' ' + m[m.res] : ''}</div></div>
            <button class="game-btn" style="margin:0; padding:7px 10px; font-size:11px;" ${ok ? '' : 'disabled'}
                onclick="kroomCareGo('${m.code}')">${stat ? STATN[stat] + ' +' + careAmt() : '국 건네기'}</button></div>`;
    }).join('');
    show('돌보기', `${ATTR[a].i} ${ATTR[a].n} — ${ATTR[a].role}<br><span style="font-size:11px; color:#888;">이 층에서 남은 돌봄 ${left}번</span>`,
        (rows || '<div style="font-size:11px; color:#888;">돌볼 사람이 없다.</div>') + darkChoiceBtn('돌아간다.', 'kroomBack()'));
};
window.kroomBack = function () {
    if (!kr) return;
    const fl = kr.plan && kr.plan[kr.floor - 1];
    if (fl && kr.idx >= fl.length) rest();
    else { kr.idx = Math.max(0, kr.idx); kroomNext(); }
};
window.kroomCareGo = function (code) {
    if (!kr || (kr.uses.care || 0) >= careMax()) return;
    const a = JOBS[kr.job][0];
    const stat = CARE[a];
    if (kr.job === 'cook' && !stat) {
        if (!kr.items['따뜻한 국']) { show('돌보기', '건넬 국이 없다. 쉼터에서 먼저 끓여야 한다.', darkChoiceBtn('돌아간다.', 'kroomBack()')); return; }
        kr.items['따뜻한 국']--;
    }
    kr.uses.care = (kr.uses.care || 0) + 1;
    // ★ 치유 — 판정 (실패해도 돌봄 한 번은 쓴다)
    const who = code === me().code ? '스스로' : ((teamStats().filter(function (m) { return m.code === code; })[0] || {}).n || '');
    let H_ = null;
    if (a === 'heal') {
        H_ = healRoll(CARE_DC);
        if (!H_.ok) {
            if (darkRun.isParty && code !== me().code) sendPartyChat(me().name + ' → ' + who + ' : 치유가 닿지 않았습니다', true);
            show('돌보기', H_.dice + '손을 얹었다. 상처가 손을 밀어낸다.<br><br>아무것도 아물지 않았다.',
                darkChoiceBtn('돌보기로 돌아간다.', 'kroomCare()') + darkChoiceBtn('돌아간다.', 'kroomBack()'));
            return;
        }
    }
    const amt = careAmt();
    const give = stat ? { k: stat, v: amt } : { k: 'dish', v: 1 };
    if (code === me().code) applyAid(give, '스스로');
    else {
        const d = db_();
        if (d && darkRun.isParty) d.ref('darkParties/' + darkRun.partyId + '/kAid/' + code).push({ k: give.k, v: give.v, from: me().name, at: now() });
        if (darkRun.isParty) sendPartyChat(me().name + ' → ' + ((teamStats().filter(function (m) { return m.code === code; })[0] || {}).n || '') + ' : ' + (stat ? STATN[stat] + ' +' + amt : '따뜻한 국'), true);
    }
    if (H_) {
        show('돌보기', H_.dice + '손을 얹었다. 상처가 손을 기억한다.<br><br>' + esc(who) + (who === '스스로' ? ' — ' : ' 사원 — ') + STATN[stat] + ' +' + amt,
            darkChoiceBtn('돌보기로 돌아간다.', 'kroomCare()') + darkChoiceBtn('돌아간다.', 'kroomBack()'));
        return;
    }
    kroomCare();
};
function applyAid(a, from) {
    if (!kr || !a) return;
    if (a.k === 'dish') {
        const f = ITEMS['따뜻한 국'].food;
        Object.keys(f).forEach(function (s) { addStat(s, f[s]); });
    } else if (kr.stats[a.k] != null) {
        addStat(a.k, a.v);
        if (a.k === 'hp' && kr.down && kr.stats.hp > 0) revive(from);
    }
    toast((from || '') + ' — ' + (a.k === 'dish' ? '따뜻한 국' : STATN[a.k] + ' +' + a.v));
}
function toast(t) {
    const el = document.createElement('div');
    el.textContent = t;
    el.style.cssText = 'position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:2147483000;background:rgba(20,40,30,.95);color:#bdf5c8;border:1px solid #2f6a45;border-radius:8px;padding:8px 14px;font-size:12px;';
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
}
function watchAid() {
    const d = db_(); if (!d || !darkRun.isParty || kr._aidRef) return;
    const ref = d.ref('darkParties/' + darkRun.partyId + '/kAid/' + me().code);
    kr._aidRef = ref;
    ref.on('child_added', function (s) {
        const v = s.val(); try { s.ref.remove(); } catch (e) { }
        if (v) applyAid(v, v.from);
        if (kr && !kr.down && !kr.dead && kr.cur == null) { }
        // 지금 화면의 막대를 새로 그린다
        try { const b = document.querySelector('#dro-body'); if (b && kr && !kr.down) refreshBar(); } catch (e) { }
    });
}
function refreshBar() {
    // 막대만 바꾼다 — 고르던 화면은 그대로
    const box = document.querySelector('#dro-body .kb-f');
    if (!box) return;
    const holder = box.closest('div[style*="border:1px solid #23343b"]');
    if (!holder) return;
    const t = document.createElement('div'); t.innerHTML = bar();
    holder.replaceWith(t.firstElementChild);
    setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll('#dro-body .kb-f[data-to]'), function (e) { e.style.width = e.dataset.to + '%'; });
    }, 40);
}

// 팀원 스탯 — 서버에 올려 두고 돌보기 창이 읽는다
let statT = 0;
function pubStat() {
    if (!kr || !darkRun || !darkRun.isParty) return;
    if (statT) return;
    statT = setTimeout(function () {
        statT = 0;
        const d = db_(); if (!d || !kr) return;
        const res = JOBS[kr.job] ? JOBS[kr.job][1] : null;
        const v = { n: me().name, job: kr.job, hp: kr.stats.hp, mind: kr.stats.mind, spirit: kr.stats.spirit,
                    res: res || null, floor: kr.floor, down: !!kr.down, dead: !!kr.dead, at: now() };
        if (res) { v[res] = kr.stats[res]; v['max_' + res] = kr.max[res]; }
        v.max_hp = kr.max.hp; v.max_spirit = kr.max.spirit;
        d.ref('darkParties/' + darkRun.partyId + '/kStat/' + me().code).set(v);
    }, 300);
}
function teamStats() {
    const res = JOBS[kr.job][1];
    const mine = { code: me().code, n: me().name, hp: kr.stats.hp, mind: kr.stats.mind, spirit: kr.stats.spirit, res: res, down: !!kr.down,
                   max_hp: kr.max.hp, max_spirit: kr.max.spirit };
    if (res) { mine[res] = kr.stats[res]; mine['max_' + res] = kr.max[res]; }
    if (!darkRun.isParty || typeof darkParties === 'undefined') return [mine];
    const p = darkParties[darkRun.partyId] || {};
    const st = p.kStat || {};
    return [mine].concat(Object.keys(st).filter(function (c) { return c !== me().code && st[c] && now() - (st[c].at || 0) < 10 * 60 * 1000; })
        .map(function (c) { return Object.assign({ code: c }, st[c]); }));
}

// ==========================================
// 6. 다른 팀과 만나기 — 같은 던전 · 같은 층
// ==========================================
function runUp() {
    const d = db_(); if (!d || !kr || !kr.dun) return;
    const ref = d.ref('kroomRuns/' + kr.dun + '/' + kr.team);
    ref.update({ name: (darkRun.isParty && darkParties[darkRun.partyId] ? darkParties[darkRun.partyId].leaderName : me().name) + ' 팀',
                 n: members().length, floor: kr.floor, at: now() });
    ref.child('m/' + me().code).set(true);
    try { ref.child('m/' + me().code).onDisconnect().remove(); } catch (e) { }
}
function runBeat() { const d = db_(); if (d && kr && kr.dun) d.ref('kroomRuns/' + kr.dun + '/' + kr.team).update({ floor: kr.floor, at: now() }); }
let othersCache = {};
function meet() {
    const d = db_(); if (!d || !kr || !kr.dun) return Promise.resolve(null);
    // ★ 서버가 느리거나 끊겼으면 오래 기다리지 않는다 — 2.5초 안에 답이 없으면 아무도 못 만난 것으로 (2026-10-21)
    let done = false;
    const ask = d.ref('kroomRuns/' + kr.dun).once('value').then(function (s) {
        if (done || !kr) return null;
        othersCache = s.val() || {};
        const mine = kr.team;
        const hit = Object.keys(othersCache).filter(function (t) {
            const v = othersCache[t];
            return t !== mine && v && v.floor === kr.floor && now() - (v.at || 0) < 5 * 60 * 1000 && !kr.met[t + ':' + kr.floor];
        })[0];
        if (!hit) return null;
        kr.met[hit + ':' + kr.floor] = 1;
        return Object.assign({ id: hit }, othersCache[hit]);
    }).catch(function () { return null; });
    const late = new Promise(function (res) { setTimeout(function () { res(null); }, 2500); });
    return Promise.race([ask, late]).then(function (v) { done = true; return v; });
}
function otherTeams() {
    const list = Object.keys(othersCache).filter(function (t) { const v = othersCache[t]; return t !== kr.team && v && now() - (v.at || 0) < 5 * 60 * 1000; });
    if (!list.length) return '';
    return `<div style="font-size:10px; color:#8fb8c4; margin:4px 0 8px 0; padding:8px; border:1px dashed #2f4a55; border-radius:6px;">
        같은 방에 다른 팀이 있다 — ${list.map(function (t) { const v = othersCache[t]; return esc(v.name) + ' (' + (v.n || 1) + '명 · ' + (v.floor || '?') + '층)'; }).join(' · ')}</div>`;
}
function encounter(o) {
    kr._enc = o;
    const a = JOBS[kr.job][0];
    show('— 다른 발소리', `앞에서 불빛이 흔들린다.<br><br>
        이쪽 것이 아니다. ${esc(o.name)}, ${o.n || 1}명.<br>
        같은 방에 다른 문으로 들어온 사람들이다. 저쪽도 이쪽을 봤다.<br><br>
        여기서는 서로가 유일하게 사람이다.`,
        darkChoiceBtn('① 인사를 나눈다. <span style="font-size:10px; color:#888;">(정신력 · 심력이 조금 돌아온다)</span>', 'kroomMeet(1)') +
        (Object.keys(kr.items).some(function (n) { return kr.items[n] > 0 && ITEMS[n] && ITEMS[n].food; })
            ? darkChoiceBtn('② 먹을 것을 하나 건넨다. <span style="font-size:10px; color:#888;">(저쪽 팀에 간다 · 꿈결을 얻는다)</span>', 'kroomMeet(2)') : '') +
        (a === 'bond' ? darkChoiceBtn('③ 길을 맞춰 본다. ⊙ <span style="font-size:10px; color:#888;">(연결 — 서로 지나온 길을 나눈다)</span>', 'kroomMeet(3)') : '') +
        darkChoiceBtn('경계하며 지나간다.', 'kroomMeet(0)'));
}
window.kroomMeet = function (n) {
    const o = kr && kr._enc; if (!o) { kroomNext(); return; }
    kr._enc = null;
    const d = db_();
    let t = '';
    if (n === 1) { addStat('spirit', 12); addStat('mind', 6); t = '서로 고개를 끄덕였다. 말은 몇 마디 안 했다.<br><br>그것으로 됐다. 혼자가 아니라는 것만 알면 조금 덜 무섭다.'; }
    if (n === 2) {
        const f = Object.keys(kr.items).filter(function (x) { return kr.items[x] > 0 && ITEMS[x] && ITEMS[x].food; })[0];
        if (f) {
            kr.items[f]--; kr.dream += dreamRoll();
            if (d) d.ref('kroomGift/' + o.id).push({ item: f, from: me().name, at: now() });
            t = esc(f) + '을(를) 건넸다.<br><br>저쪽이 받아 들고 잠깐 멍하니 있다.<br>여기서 뭔가를 받아 본 게 오랜만인 얼굴이다.';
        }
    }
    if (n === 3) {
        addStat('spirit', 8); kr.exp += 20;
        t = '지나온 길을 서로 그려 보였다.<br><br>저쪽 길에는 이쪽에 없던 갈림이 있었다. 같은 방인데 다른 방이다.<br>그래도 맞춰 보니 출구 쪽은 같았다.';
    }
    if (n === 0) t = '눈을 떼지 않고 비켜 섰다.<br><br>저쪽도 그렇게 했다. 등을 보이지 않고 멀어진다.';
    if (darkRun.isParty && n) sendPartyChat(me().name + ' 사원이 ' + o.name + '과(와) 마주쳤습니다.', true);
    show('— 다른 발소리', t, darkChoiceBtn('계속한다.', 'kroomNext()'));
};
function watchGift() {
    const d = db_(); if (!d || kr._giftRef) return;
    const ref = d.ref('kroomGift/' + kr.team);
    kr._giftRef = ref;
    ref.on('child_added', function (s) {
        const v = s.val(); try { s.ref.remove(); } catch (e) { }
        if (!v || !kr || !ITEMS[v.item]) return;
        kr.items[v.item] = (kr.items[v.item] || 0) + 1;
        toast('다른 팀 ' + (v.from || '') + ' — ' + v.item + '을(를) 건넸다');
    });
}

// ==========================================
// 7. 즉사 기믹 · 쓰러짐 — 동료가 끌어낸다
// ==========================================
function doom(cfg) {
    kr._doomCfg = cfg;
    // 🐾 아기 여우(연결) — 내게 붙은 분신이 알아서 끌어낸다 (한 번)
    const bx = foxBond();
    if (bx) {
        foxBondSpend(bx);
        if (kr.down) { kr.down = false; if (kr.stats.hp <= 0) setStat('hp', 20); }
        pubStat();
        show(cfg.title || '—', (cfg.text || '') + '<br><br><span style="color:#ffd9a0;">— ' + esc(foxNick(bx)) + '이(가) 옷자락을 물고 끌어냈다.</span>',
            darkChoiceBtn('일어선다.', 'kroomNext()'));
        return;
    }
    const d = db_();
    const alive = darkRun.isParty ? teamStats().filter(function (m) { return m.code !== me().code && !m.down; }).length : 0;
    if (!d || !darkRun.isParty || !alive) {
        show(cfg.title || '—', (cfg.text || '') + `<br><br><span style="color:#ff6b6b;">부를 사람이 없다.</span>`, darkChoiceBtn('—', 'kroomDie()'));
        return;
    }
    const sec = cfg.sec || 65;
    d.ref('darkParties/' + darkRun.partyId + '/kDoom/' + me().code).set({
        name: me().name, what: cfg.what || '위험합니다', dc: cfg.dc || 13, until: now() + sec * 1000, floor: kr.floor
    });
    sendPartyChat('⚠⚠ ' + me().name + ' — ' + (cfg.what || '위험합니다'), true);
    let left = sec;
    kr._doomT = setInterval(function () {
        left--;
        const el = document.getElementById('kdoom-left'); if (el) el.innerText = left;
        if (left <= 0) { clearInterval(kr._doomT); doomEnd(); }
    }, 1000);
    const ref = d.ref('darkParties/' + darkRun.partyId + '/kDoom/' + me().code);
    kr._doomCb = function (s) {
        if (s.val()) return;
        ref.off('value', kr._doomCb);
        clearInterval(kr._doomT);
        if (kr && kr._spare) { try { kr._spare.close(); } catch (e) { } kr._spare = null; }   // 📖 구해졌다 — 물음을 닫는다
        if (!kr || kr.dead) return;
        const wasDown = kr.down;
        if (kr.down) { kr.down = false; if (kr.stats.hp <= 0) setStat('hp', 20); pubStat(); }
        show('—', (wasDown && kr.stats.hp > 20)
            ? `손이 얹힌다.<br><br>따뜻하다. 꺾였던 무릎에 힘이 돌아온다.<br>누가 고쳐 줬는지 보기도 전에 일어서 있었다.`
            : `팔이 잡힌다.<br><br>끌어내는 힘이 세다. 어깨가 빠질 것 같았다.<br>바닥에 끌려 나와 한참 누워 있었다.`,
            darkChoiceBtn('일어선다.', 'kroomNext()'));
    };
    ref.on('value', kr._doomCb);
    // 📖 지우기 — 방에 종말예언을 지닌 사람이 살아 있으면 대신 죽을지 묻는다 (jisan.js)
    try { kr._spare = (typeof window.jisanSpareAsk === 'function') ? window.jisanSpareAsk(sec * 1000, kroomSpared) : null; } catch (e) { kr._spare = null; }
    show(cfg.title || '—', cfg.text || '',
        `<div style="text-align:center; padding:16px; background:rgba(127,0,0,0.2); border:1px solid #b71c1c; border-radius:6px;">
            <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:6px;">손을 뻗을 수 있는 시간</div>
            <div style="font-size:30px; font-weight:bold; color:#fff;"><span id="kdoom-left">${left}</span><span style="font-size:14px; color:#888;">초</span></div>
            <div style="font-size:10px; color:#aaa; margin-top:8px;">동료가 오면 살아납니다. 아무도 못 오면 여기서 끝납니다.</div></div>`);
}
// 체력이 바닥 — 치유가 고치면 일어서고(판정 · 2026-10-20 전에는 무조건), 아니면 끌어내기를 기다린다
function fall(txt) {
    kr.down = true; pubStat();
    const healer = darkRun.isParty && teamStats().some(function (m) { return m.code !== me().code && attrOf(m.code) === 'heal' && !m.down; });
    doom({ title: '쓰러짐', what: '쓰러졌습니다' + (healer ? ' (치유로 일으켜 세울 수 있습니다)' : ''), dc: 12, sec: 75,
           text: txt + '<br><br>무릎이 먼저 꺾였다. 바닥이 가깝다.', dieText: '일어서지 못했다.' });
}
function revive(from) {
    if (!kr || !kr.down) return;
    kr.down = false; pubStat();
    const d = db_();
    if (d && darkRun.isParty) d.ref('darkParties/' + darkRun.partyId + '/kDoom/' + me().code).remove();   // 기다림을 끝낸다
}
function watchDoom() {
    const d = db_(); if (!d || !darkRun.isParty || kr._doomWatch) return;
    kr._doomWatch = true;
    d.ref('darkParties/' + darkRun.partyId + '/kDoom').on('value', function (s) {
        kr.doomAll = s.val() || {};
        const b = document.getElementById('kroom-banner'); if (b) b.outerHTML = banner();
    });
}
function banner() {
    if (!kr || !kr.doomAll) return '<div id="kroom-banner"></div>';
    const list = Object.keys(kr.doomAll).filter(function (c) { return c !== me().code && kr.doomAll[c] && now() < kr.doomAll[c].until; });
    if (!list.length) return '<div id="kroom-banner"></div>';
    return '<div id="kroom-banner">' + list.map(function (c) {
        const v = kr.doomAll[c];
        const left = Math.max(0, Math.round((v.until - now()) / 1000));
        const heal = JOBS[kr.job][0] === 'heal' && /쓰러/.test(v.what);
        const tried = v.tried && v.tried[me().code];                     // 치유도 한 사람에 한 번 (판정이 있으므로)
        return `<div style="background:rgba(127,0,0,0.3); border:2px solid #ff1744; border-radius:6px; padding:11px; margin-bottom:9px;">
            <div style="font-size:12px; color:#ff1744; font-weight:bold;">⚠⚠ ${esc(v.name)} — ${esc(v.what)}</div>
            <div style="font-size:10px; color:#ddd; margin:4px 0 7px 0;">${v.floor || '?'}층 · 남은 ${left}초 ${heal ? '· <span style="color:#4CAF50;">치유로 일으켜 세운다 (판정 · 한 사람에 한 번)</span>' : '· 한 사람에 한 번 · 놓치면 이쪽이 다친다'}</div>
            ${tried ? '<div style="font-size:11px; color:#aaa; text-align:center; padding:6px;">한 번 손을 뻗었다. 다른 동료를 기다린다.</div>'
                    : `<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#b71c1c,#7f0000) !important; border-color:#ff1744 !important; color:#fff !important;" onclick="kroomRescue('${c}')">${heal ? '치유로 일으킨다' : '끌어낸다'}</button>`}</div>`;
    }).join('') + '</div>';
}
window.kroomRescue = function (code) {
    const d = db_(); if (!d || !kr) return;
    const ref = d.ref('darkParties/' + darkRun.partyId + '/kDoom/' + code);
    ref.once('value').then(function (s) {
        const v = s.val();
        if (!v || now() > v.until) { toast('이미 끝났습니다.'); return; }
        const healDown = JOBS[kr.job][0] === 'heal' && /쓰러/.test(v.what);
        if (healDown) {                                      // 치유 — 판정 (2026-10-20 · 전에는 무조건)
            if (v.tried && v.tried[me().code]) { toast('이미 한 번 손을 얹었다.'); return; }
            ref.child('tried/' + me().code).set(true);
            const hr = healRoll(v.dc || 12);
            if (!hr.ok) {                                    // 닿지 않았다 — 치유자는 다치지 않는다 · 다른 동료가 아직 손을 뻗을 수 있다
                sendPartyChat(me().name + ' 사원의 치유가 ' + v.name + ' 사원에게 닿지 않았습니다.', true);
                show('구제', hr.dice + `손을 얹었다. 상처가 손을 밀어낸다.<br><br>${esc(v.name)} 사원은 아직 눈을 뜨지 못했다.`, darkChoiceBtn('계속한다.', 'kroomBack()'));
                return;
            }
            d.ref('darkParties/' + darkRun.partyId + '/kAid/' + code).push({ k: 'hp', v: careAmt(), from: me().name, at: now() });
            ref.remove(); kr.exp += 30;
            sendPartyChat(me().name + ' 사원이 ' + v.name + ' 사원을 치유로 일으켰습니다.', true);
            show('구제', hr.dice + `손을 얹었다. 상처가 손을 기억한다.<br><br>${esc(v.name)} 사원이 숨을 몰아쉬며 눈을 떴다.`, darkChoiceBtn('계속한다.', 'kroomBack()'));
            return;
        }
        if (v.tried && v.tried[me().code]) { toast('이미 한 번 손을 뻗었다.'); return; }   // 한 사람은 한 번만
        ref.child('tried/' + me().code).set(true);
        let b = 0; try { b += kv(rollDarkBonus, null, ['bond']) || 0; } catch (e) { }
        if (JOBS[kr.job][0] === 'bond') b += 3;
        b += Math.min(3, teamCount('fix'));
        const r = kv(luckReroll, null, [Math.floor(Math.random() * 20) + 1]);
        afterDice();
        let ok = r !== 1 && (r === 20 || r + b >= (v.dc || 13));
        let sure = '';
        if (!ok) { sure = sureRescue(); if (sure) ok = true; }  // 🩶 은심장(열 번) · 🐾 아기 여우(연결)
        heartCount();                                         // 구하러 갈 때마다 하나 센다
        if (!ok && gearUse('bond')) ok = true;                // 연결 장비 — 확실한 구조
        if (ok) {
            ref.remove(); kr.exp += 40;
            sendPartyChat(me().name + ' 사원이 ' + v.name + ' 사원을 끌어냈습니다.', true);
            show('구제', `<div style="text-align:center; font-size:24px; color:#4CAF50;">🎲 ${r} (+${b} / DC ${v.dc})</div>`
                + (sure ? `<div style="font-size:11px; color:#ffd9a0; margin-bottom:8px;">${esc(sure)} — 손을 대신 뻗었다. 구출이 확정되었다.</div>` : '')
                + `팔을 잡았다. 끌어냈다. 둘 다 바닥에 넘어졌다.`, darkChoiceBtn('계속한다.', 'kroomBack()'));
        } else {
            // 놓쳤다 — 손을 뻗은 쪽은 다치고, 끌려가는 쪽은 아직 기다린다 (다른 동료가 손을 뻗을 수 있다)
            sendPartyChat(me().name + ' 사원이 ' + v.name + ' 사원을 놓쳤습니다.', true);
            const lost = {};
            Object.keys(MISS).forEach(function (st) { const d = addStat(st, MISS[st]); if (d) lost[st] = d; });
            if (kr.stats.hp <= 0) { fall('손을 놓쳤다. 끌려 들어가던 것이 팔을 긁고 갔다.'); return; }
            show('구제', `<div style="text-align:center; font-size:24px; color:#f44336;">🎲 ${r} (+${b} / DC ${v.dc})</div>손이 닿았다. 닿았는데 놓지 않는다.<br><br>
                끌어내려는 쪽과 끌려가는 쪽의 힘이 비슷했다. 손이 미끄러졌다.<br>끌려 들어가던 것이 팔을 긁고 갔다.` + lossLine(lost),
                darkChoiceBtn('계속한다.', 'kroomBack()'));
        }
    });
};

// ==========================================
// 7½. 특수 물건 — 우주 쇼핑몰 것은 안 먹고, 상담사가 준 것은 먹는다
// ==========================================
//
// ■ 안 먹는 것 — 우주 쇼핑몰에서 파는 것
//   작두 · 버터 나이프 · 은반지 · 착한 친구 · 유리손포 · 루비 · 사인참사검 · 다이아 플러그 ·
//   에메랄드 목줄 · 포승줄 · 공기 누름돌 · 이동장 · 종이배 · 황룡의 눈 · 은화 뱀 · 물약 …
//   (쇼핑몰 목록 ALIEN_ITEMS_POOL 전부 + 진열에서 빠졌어도 아직 지닌 사람이 있는 것)
//
//   물건 효과는 대개 「장착칸에 그 이름이 있나」를 보고 붙는다. 보는 자리가 수십 군데라
//   하나하나 막지 않는다. **이 던전 안에서 셀 때만** 아래 네 칸에서 쇼핑몰 것을 잠깐 빼고
//   세고, 센 뒤 바로 되돌린다 (kv).
//       장착칸 equippedWeapons · 빌린 장비 borrowedGear (황룡의 눈 · 산군의 도움의 힘)
//       물약 timedEffects · 임시 버프 itemBuffs (버프마다 건 물건 이름 src 가 적혀 있다)
//   빼고 세는 자리 — 판정 보정 rollDarkBonus · 재굴림 luckReroll · 오염 applyPollutionToUser ·
//                    행운 gearValue · 회피·행운·기믹 횟수 resetDnaCharge · 기믹 파훼 smashLeft
//   그 사이에 저장이 불려도 되돌린 다음 저장한다 — 장착칸이 줄어든 채 저장되는 일은 없다.
//
// ■ 먹는 것 — 상담사가 주는 것 (어느 상점에도 안 깔린다)
//   굴림에 붙는 몫(판정 · 회피 · 행운 · 굴림 +)은 위 계산을 그대로 탄다. 원래 어둠에서
//   죽음 · 구출 · 정산 자리에 붙던 것은 이 던전이 그 자리를 따로 그리므로 여기서 잇는다.
//     🩶 은심장       열 번 넘게 구했으면 구출 확정 · 구하러 갈 때마다 한 번 센다 /
//                    서른 번 +5,000P / 쉰 번 즉사 기믹 파훼 / 쓰러지면 파티원 10,000P · 본인 20,000P
//     🦊 호사수구     꼬리 — 판정 · 회피 · 행운 · 기믹(즉사 기믹 파훼) · 오염 동결 · 격리 탈출
//     🐾 아기 여우    회피·치유 — 죽음을 한 번 받아 낸다 / 연결 — 끌려갈 때 끌어낸다 · 남을 확정으로 구한다 /
//                    감각 — 즉사 기믹 쪽을 가린다 / 응시 — 굴림 + / 파괴 — 즉사 기믹 파훼 /
//                    은신 — 격리를 막는다 / 행운 — 꿈결 1.5~3배
//     📖 종말예언    덧쓰기 — 쓰러지면 회수품 1~3종 / 지우기 — 일행이 쓰러져 구조를 기다릴 때 장착자가 대신 죽는다 /
//                    읽어내기 — 즉사 기믹에 ☠ 가 보인다 · 그 길을 잡고 살아 나오면 포인트 세 배 (jisan.js)
//     📺 토크 쇼      판정 +1 / 부활 두 번 / 열기만큼 포인트 배수 · 사회자와 끝까지 살면 꿈결 두 배
//     🔎 감지하는 눈  파티 버프 / 버프 받은 사람과 생사가 엮인다 / 정산 배수
//     📱 K·LEE       버프 / 예약 문자 — 쓰러져도 끌려가지 않는다
//     ⛓️‍💥 이레귤러   전용 장비 L / 처음 두 굴림 확정 / 부활 하나 / 사망 판정 / 연속 실패 → 즉사 기믹 파훼
//   사원 고유 DNA 물건 · 식당 · 전용 장비 · [???] 소모품은 원래대로 먹는다.
//
// ■ 즉사 기믹 파훼 — 즉사 기믹 선택지에 실패하면 저절로 쓰인다 (전용 장비 회피보다 먼저)
// ■ 쓰러질 때 — 이레귤러 부활 → 토크 쇼 부활 → 아기 여우 → 품 안의 것(DNA·은심장·눈의 회피)
//               → K·LEE → 이레귤러 사망 판정 → 그래도 안 되면 쓰러진다 (쓰러지면 종말예언 덧쓰기)

const KEEP = ['🩶 은심장', '🦊 호사수구', '🐾 아기 여우', '📖 〈종말예언 : 어둠탐사기록〉', '🧧 지산의 복 : 대리자',
              '📺 브라운의 심야 토크 쇼', '🔎 감지하는 눈', '📱 K·LEE'];
const SHOP_MORE = ['작두', '버터 나이프', '은반지', '유리손포', '착한 친구', '보안팀 의상 세트', '사자탈',
    '다이아 애널 플러그', '다이아 보지 플러그', '루비 클리 피어싱', '루비 유두 피어싱', '사인참사검', '??? 안경',
    '에메랄드 목줄', '에메랄드 하네스', '포승줄', '공기 누름돌', '꿈결 수집기', '부적이 깃든 등',
    '먹물맛 물약', '석류맛 물약', '곶감맛 물약'];
let shopSet = null;
const srcMemo = {};
function shop() {
    if (shopSet) return shopSet;
    shopSet = new Set(SHOP_MORE);
    try { if (typeof ALIEN_ITEMS_POOL !== 'undefined') ALIEN_ITEMS_POOL.forEach(function (n) { shopSet.add(n); }); } catch (e) { }
    KEEP.forEach(function (n) { shopSet.delete(n); });
    return shopSet;
}
function bname(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w; } catch (e) { return w; } }
function shopItem(n) { return !!n && shop().has(n); }
// 임시 버프를 건 것 — '엽서' · '달빛'(달빛 타투 스티커) · '황룡의 눈에 빼앗김' 처럼 적혀 있다
function shopSrc(src) {
    src = String(src || '').replace(/에 빼앗김$/, '');
    if (!src) return false;
    if (src in srcMemo) return srcMemo[src];
    let hit = shop().has(src);
    if (!hit && src.length >= 2) shop().forEach(function (n) { if (!hit && n.indexOf(src) === 0) hit = true; });
    return (srcMemo[src] = hit);
}

const KV_F = ['equippedWeapons', 'borrowedGear', 'timedEffects', 'itemBuffs'];
function kvOut(f, x) {
    if (f === 'equippedWeapons') return shopItem(bname(x));
    if (f === 'borrowedGear') return true;
    if (f === 'timedEffects') return !!x && shopItem(x.name);
    if (f === 'itemBuffs') return !!x && shopSrc(x.src);
    return false;
}
let kvHid = null, kvDepth = 0;
function kvHide(u) {
    const h = {};
    KV_F.forEach(function (f) {
        const a = u[f];
        if (!Array.isArray(a) || !a.length) return;
        const out = a.filter(function (x) { return kvOut(f, x); });
        if (!out.length) return;
        const view = a.filter(function (x) { return out.indexOf(x) < 0; });
        h[f] = { orig: a, out: out, view: view, n: view.length };
        u[f] = view;
    });
    return h;
}
function kvShow(u, h) {
    Object.keys(h || {}).forEach(function (f) {
        const x = h[f], cur = u[f];
        if (cur === x.view && cur.length === x.n) { u[f] = x.orig; return; }
        // 세는 사이에 바뀌었다 (다 된 것이 빠지거나 새 버프가 붙음) — 바뀐 것은 살리고 빼 둔 것은 제자리에
        const c = Array.isArray(cur) ? cur : [];
        u[f] = x.orig.filter(function (y) { return x.out.indexOf(y) >= 0 || c.indexOf(y) >= 0; })
            .concat(c.filter(function (y) { return x.orig.indexOf(y) < 0; }));
    });
}
// 쇼핑몰 것을 뺀 눈으로 fn 을 부른다
function kv(fn, self, args) {
    const u = me();
    if (typeof fn !== 'function') return undefined;
    if (!u || kvDepth) return fn.apply(self, args || []);
    kvDepth = 1; kvHid = kvHide(u);
    try { return fn.apply(self, args || []); }
    finally { const h = kvHid; kvHid = null; kvDepth = 0; kvShow(u, h); }
}
function kIn() { return !!(kr && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === K_CODE); }
function kOn() { return kIn() && !kr.dead && !kr._settled; }
window.kroomOn = kOn;

// 한 번만 건다 — 던전에 처음 들어설 때 (다른 파일이 다 걸고 난 뒤라 맨 바깥이 된다)
let itemHooked = false;
function copyFlags(from, to) { Object.keys(from).forEach(function (k) { try { to[k] = from[k]; } catch (e) { } }); }
function hookItems() {
    if (itemHooked) return;
    itemHooked = true;
    // 회피·행운·기믹 횟수 — 출발 0.2초 뒤(dna-gifts) · 눈 버프 때 다시 센다. 그때도 쇼핑몰 것은 빼고.
    try {
        if (typeof resetDnaCharge === 'function') {
            const _r = resetDnaCharge;
            const w = function () { return kIn() ? kv(_r, this, arguments) : _r.apply(this, arguments); };
            copyFlags(_r, w); w._kroom = true;
            resetDnaCharge = w;
        }
    } catch (e) { console.warn('[K 의 방] resetDnaCharge 못 걸었다', e); }
    // 원래 어둠의 죽음 — 이 던전 안이면 이쪽 길로 (darkDeath 를 부르는 것들)
    try {
        if (typeof darkDeath === 'function') {
            const _d = darkDeath;
            const w = function (t) {
                if (kIn()) { if (!kr.dead && !kr._settled) kroomDie(t); return; }
                return _d.apply(this, arguments);
            };
            copyFlags(_d, w); w._kroom = true;
            darkDeath = w; window.darkDeath = w;
        }
    } catch (e) { console.warn('[K 의 방] darkDeath 못 걸었다', e); }
    // 세는 사이에 저장이 불리면 — 되돌리고 저장한 다음 다시 뺀다
    ['saveFields', 'saveSelfFull'].forEach(function (name) {
        const f = window[name];
        if (typeof f !== 'function' || f._kv) return;
        const w = function () {
            if (!kvHid) return f.apply(this, arguments);
            const u = me();
            kvShow(u, kvHid);
            try { return f.apply(this, arguments); }
            finally { kvHid = kvHide(u); }
        };
        copyFlags(f, w); w._kv = true;
        window[name] = w;
    });
}

// 굴린 뒤 — 이레귤러 ③ 「다음 기믹을 부순다」는 단추 대신 이쪽 몫으로 (단추는 원래 어둠 화면 것이다)
function afterDice() {
    if (darkRun && darkRun._irrSmash) { darkRun._irrSmash = 0; kr.irrSmash = (kr.irrSmash || 0) + 1; }
}

function fox() { return window.KITFOX || null; }
function foxNick(x) {
    const K = fox();
    return (x && x.nick) || ((K && K.BY_K && x && K.BY_K[x.k]) ? K.BY_K[x.k].n + ' 분신' : '분신');
}
function foxBond() {                     // 연결 분신 — 확정 구출이 아직 남았나
    const K = fox(); if (!K) return null;
    const x = K.usable('bond');
    if (!x) return null;
    return (Number(K.st(x.owner, 'bond').r) || 0) < K.BFOX.BOND_SAVE ? x : null;
}
function foxBondSpend(x) {
    const K = fox();
    K.bump('bond', 'r', 1e9);
    const s = K.st(x.owner, 'bond');
    if ((Number(s.j) || 0) >= K.BFOX.BOND_JOIN && (Number(s.r) || 0) >= K.BFOX.BOND_SAVE) {
        K.kill('bond', '합류 셋과 구출 하나를 다 하고 소멸했습니다.');
    }
}
function jisanOn() { return !!(window.JISANFOX && window.JISANFOX.wears(me())); }
function showP() { try { return (typeof talkShowOf === 'function') ? talkShowOf() : null; } catch (e) { return null; } }
function heartSaves() { return Number(me().heartSaves) || 0; }
function hasHeart() { try { return typeof hasSilverHeart === 'function' && hasSilverHeart(me()); } catch (e) { return false; } }

// 즉사 기믹을 부수는 것 — 있으면 하나 쓰고 무엇이 했는지 돌려준다
function itemSmash() {
    const u = me();
    if (kr.irrSmash > 0) {
        kr.irrSmash--;
        return { n: '⛓️‍💥 이레귤러', t: '사슬이 끊어지는 소리가 앞에서 났다. 막고 있던 것이 통째로 접힌다.' };
    }
    if (typeof dnaCharge !== 'undefined' && dnaCharge && dnaCharge.gim > 0) {           // 고유 DNA · 은심장(쉰 번)
        dnaCharge.gim--;
        return { n: hasHeart() && heartSaves() >= 50 ? '🩶 은심장' : '품 안의 것', t: '품 안의 것이 먼저 반응했다. 막고 있던 것이 금이 가 무너진다.' };
    }
    try {
        if (typeof smashLeft === 'function' && kv(smashLeft) > 0) {                       // 고유 DNA · 호사수구 꼬리 (하루 몫)
            const day = getTodayStr();
            if (u.smashDate !== day) { u.smashDate = day; u.smashUsed = 0; }
            u.smashUsed = (u.smashUsed || 0) + 1;
            try { saveFields({ smashDate: 1, smashUsed: 1 }); } catch (e) { }
            const tail = (typeof window._foxSum === 'function' && window._foxSum(u, 'gim') > 0);
            return { n: tail ? '🦊 호사수구' : '품 안의 것', t: '꼬리 하나가 앞을 쓸고 지나갔다. 막고 있던 것이 없다.' };
        }
    } catch (e) { }
    const K = fox();
    const x = K && K.usable('break');
    if (x) {
        K.bump('break', 'n', K.BFOX.BREAK_MAX, '세 번을 다 부수고 소멸했습니다.');
        return { n: '🐾 ' + foxNick(x), t: '작은 것이 먼저 뛰어들어 그것을 부쉈다.' };
    }
    return null;
}
function itemLine(g) {
    return `<div style="font-size:11px; color:#ffd9a0; margin:0 0 8px 0; padding:7px 9px; border:1px solid #6a4c2a; border-radius:5px; background:rgba(147,106,46,.12);">
        ${esc(g.n)} — <b>즉사 기믹 파훼</b> <span style="color:#bbb;">${g.t}</span></div>`;
}

// 남을 구할 때 — 확정이 있나 (은심장 열 번 · 아기 여우 연결)
function sureRescue() {
    if (hasHeart() && heartSaves() >= 10) return '🩶 은심장';
    const x = foxBond();
    if (x) { foxBondSpend(x); return '🐾 ' + foxNick(x); }
    return '';
}
function heartCount() {                  // 구하러 갈 때마다 하나 (원래 어둠과 같다)
    const u = me();
    u.heartSaves = (Number(u.heartSaves) || 0) + 1;
    try { saveFields({ heartSaves: 1 }); } catch (e) { }
}

// 감각 분신 — 즉사 기믹 쪽을 가린다 (안 가린 길이 하나라도 남을 때만)
function foxSense(vis) {
    const K = fox();
    const x = K && K.usable('sense');
    if (!x) return null;
    const safe = vis.filter(function (v) { return !v.o.doom; });
    if (!safe.length || safe.length === vis.length) return null;
    return { vis: safe, line: '— ' + esc(foxNick(x)) + '이(가) 한쪽을 보고 있다. 다른 길은 보이지 않는다.' };
}

// 쓰러지는 순간 — 마지막으로 붙잡는 것들. 붙잡았으면 참.
function standUp(why, line, color) {
    kr.down = false;
    if (kr.stats.hp <= 0) setStat('hp', Math.max(20, Math.round(kr.max.hp * 0.3)));
    darkRun.fail = Math.max(0, (darkRun.fail || 0) - 1);
    pubStat();
    show('—', why + `<br><br><span style="color:${color || '#c9a8ff'};">${line}</span>`, darkChoiceBtn('숨을 고른다.', 'kroomNext()'));
    return true;
}
function lastChance(why) {
    const u = me(), r = darkRun;
    const IR = window.IRR_K;
    // ⛓️‍💥 이레귤러 ① — 얻어 둔 부활
    if (r._irrRevive && IR && IR.on()) {
        r._irrRevive = 0;
        kv(applyPollutionToUser, null, [u, 6]);
        try { stripNoteByItem(u, IR.reviveNote); } catch (e) { }
        addHistoryLog(u, '[' + IR.MARK + '] 부활 — 『 K 의 방 』 에서 한 번 더 일어섰습니다.');
        try { saveFields({ history: 1, badge: 1 }); } catch (e) { }
        return standUp(why, '— 끊어진 자리가 다시 이어진다.<br>원래 이렇게 되는 것이 아니라는 걸 안다. 알면서도 일어선다.');
    }
    // 📺 토크 쇼 — 쓰러질 때마다 무대가 달아오르고, 두 번은 일어선다
    const p = showP();
    if (p) {
        try { talkShowBumpHeat(p, talkShowIsHost(p)); } catch (e) { }
        r._showHeat = Math.max(Number(r._showHeat || 0), Number(p.heat || 0)) + 1;
        try { if (talkShowIsHost(p)) r._showHostDead = true; } catch (e) { }
        if (r._showRevives == null) { r._show = true; r._showRevives = (typeof TALK_SHOW_REVIVES !== 'undefined') ? TALK_SHOW_REVIVES : 2; }
        if (r._showRevives > 0) {
            r._showRevives--;
            try { talkShowSnap(); } catch (e) { }
            return standUp(why, '— 박수 소리가 난다. 어디서 나는지는 모른다.<br>조명이 다시 이쪽을 비춘다. 아직 방송 중이다. (남은 부활 ' + r._showRevives + ')', '#ffcc80');
        }
    }
    // 🐾 아기 여우 — 회피 · 치유 분신
    const K = fox();
    if (K) {
        const ev = K.usable('evade');
        if (ev) {
            K.kill('evade', '죽음을 대신 받았습니다.');
            return standUp(why, '— 작은 것이 앞으로 나섰다.<br>' + esc(foxNick(ev)) + '이(가) 당신 대신 그것을 받았다.<br>털 한 줌이 남고, 그마저 곧 보이지 않는다.', '#ffd9a0');
        }
        const he = K.usable('heal');
        if (he) {
            K.kill('heal', '한 번 살리고 소멸했습니다.');
            return standUp(why, '[ 치유의 기운이 깃듭니다. ]<br>' + esc(foxNick(he)) + '이(가) 당신에게 이마를 대었다.<br>숨이 돌아온다. 그 자리에 아무것도 남지 않았다.', '#9fe6b0');
        }
    }
    // 품 안의 것 — 고유 DNA · 은심장 · 눈의 「회피」 횟수
    if (typeof dnaCharge !== 'undefined' && dnaCharge && ((dnaCharge.death || 0) > 0 || (dnaCharge.eva || 0) > 0)) {
        if (dnaCharge.death > 0) dnaCharge.death--; else dnaCharge.eva--;
        kv(applyPollutionToUser, null, [u, 4]);
        return standUp(why, '— 품 안의 것이 먼저 반응했다.<br>빛이 한 번 일렁이고, 그것으로 끝이었다.', '#8fd4ff');
    }
    // 📱 K·LEE ④ — 예약 문자를 보내 두었으면 끌려가지 않는다
    if (typeof window.kleeKroom === 'function') {
        const o = window.kleeKroom();
        if (o) {
            return outNow(why + `<br><br><span style="color:#7fb6dd;">— 화면이 꺼지기 직전에 예약해 둔 문자가 나갔다. (받는 사람 ${o.n}명)</span>
                <div style="font-size:11px; color:#aaa; margin-top:8px;">오염도 ${o.was}% → 50% · +${o.got} P · 상담실로 끌려가지 않는다.</div>`);
        }
    }
    // ⛓️‍💥 이레귤러 ② — 사망 판정 (한 탐사에 한 번)
    if (IR && IR.on() && !r._irrDeathRolled) {
        r._irrDeathRolled = 1;
        const d = Math.floor(Math.random() * 20) + 1;
        r.log.push('[' + IR.MARK + '] 사망 판정 ' + d + ' / ' + IR.DEATH_AT);
        if (d >= IR.DEATH_AT) {
            const was = Number(u.points) || 0;
            const got = Math.max(0, Math.min(IR.cap(), was * IR.OUT_MULT));
            u.points = got; u.pollution = IR.OUT_POLL;
            u.quarantineUntil = 0; u.quarantineExitPollution = 0; u.quarantineHospital = false; u.quarantineDest = null;
            u.foxRoomAnswered = true;
            addHistoryLog(u, '[' + IR.MARK + '] 사망 판정 ' + d + ' — 『 K 의 방 』 에서 끌려가지 않았습니다. (오염도 ' + IR.OUT_POLL + '% · 포인트 '
                + was.toLocaleString() + ' → ' + got.toLocaleString() + ' P)');
            try { saveSelfFull(); } catch (e) { }
            return outNow(why + `<br><br><span style="color:#c9a8ff;">— 여기서 끝나는 것이 규칙인데, 규칙 쪽이 먼저 접힌다.<br>문이 열리는 소리도 없이 밖이다.<br><br>주머니가 무겁다. 들어갈 때보다 두 배로.</span>
                <div style="font-size:11px; color:#aaa; margin-top:8px;">사망 판정 ${d} / ${IR.DEATH_AT} · 오염도 ${IR.OUT_POLL}% · 포인트 ${was.toLocaleString()} → ${got.toLocaleString()} P</div>`);
        }
        toast(IR.MARK + ' 사망 판정 ' + d + ' — 모자랐다');
    }
    return false;
}

// 📖 지우기 — 쓰러져 구조를 기다리는 동안 장착자가 대신 죽기로 했다. 무사히 나온다 (jisan.js 가 부른다)
function kroomSpared(byName) {
    if (!kr || kr.dead || kr._settled) return;
    if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; }
    dropDoom();
    kr._spare = null;
    const why = (kr._doomCfg && kr._doomCfg.text) || '';
    if (kr.down) { kr.down = false; pubStat(); }
    const u = me();
    if ((Number(u.pollution) || 0) >= 100) { u.pollution = 50; u.lastPollutionTime = now(); }
    addHistoryLog(u, '[📖 종말예언] 지우기 — ' + byName + ' 사원이 대신 지워졌습니다. 무사히 빠져나왔습니다.');
    try { sendPartyChat(u.name + ' 사원이 무사히 빠져나갔습니다.', true); } catch (e) { }
    outNow((why ? why + '<br><br>' : '') + `<span style="color:#ffd9a0;">— 숨이 멎기 직전, 누군가의 경전이 펼쳐졌다.<br>${esc(byName)} 사원의 이름이 당신 자리에 덧쓰였다.</span><br><br>당신은 무사히 빠져나온다.`);
}
// 초읽기가 다 됐다 — 물어 둔 것이 있으면 닫아 보고(그 사이 장착자가 답했으면 그쪽으로), 아니면 쓰러진다
function doomEnd() {
    const sp = kr && kr._spare;
    if (kr) kr._spare = null;
    if (sp && sp.close) {
        sp.close().then(function (got) {
            if (!kr || kr.dead || kr._settled) return;
            if (got) kroomSpared(got.byName); else kroomDie();
        });
        return;
    }
    kroomDie();
}

// 쓰러지지 않고 빠져나왔다 — 경험치 · 꿈결은 절반, 반입품 · 포인트는 그대로
function outNow(text) {
    kr.dead = true;
    statDead();
    settle('out', text);
    return true;
}
window.kroomOut = function (kind, text) {           // 감지하는 눈 — 장착자가 쓰러져 같이 감겼다
    if (!kr || kr.dead || kr._settled) return;
    if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; }
    dropDoom();
    outNow(text || '');
};
function statDead() {
    const d = db_();
    if (d && darkRun && darkRun.isParty) { try { d.ref('darkParties/' + darkRun.partyId + '/kStat/' + me().code + '/dead').set(true); } catch (e) { } }
}
function dropDoom() {
    const d = db_();
    if (!d || !darkRun || !darkRun.isParty) return;
    const ref = d.ref('darkParties/' + darkRun.partyId + '/kDoom/' + me().code);
    if (kr && kr._doomCb) { try { ref.off('value', kr._doomCb); } catch (e) { } kr._doomCb = null; }   // 내가 지우는 것을 「구해졌다」로 읽지 않게
    try { ref.remove(); } catch (e) { }
}

// ==========================================
// 8. 끝 — 귀환 · 쓰러짐 · 정산
// ==========================================
window.kroomLeave = function () {
    if (kr && !kr.dead && !kr._settled && hard().doom) { try { showDarkToast('올라온 길이 없다.'); } catch (e) { } return; }   // ★ 혼자 S — 돌아갈 수 없다
    settle('leave');
};
function clear() {
    const D = DATA.dun[kr.dun];
    const g = DUNS[kr.dun].g;
    kr.exp += Math.round(120 * ({ D: 1, C: 1.6, B: 2.4, A: 3.4, S: 5 }[g] || 1));
    kr.dream += dreamRoll();                                   // 돌파 — 한 번 더 얻는다
    settle('clear', D.outro);
}
window.kroomDie = function (text) {
    if (!kr || kr.dead || kr._settled) return;
    if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; }
    dropDoom();
    const why = (typeof text === 'string' && text) || (kr._doomCfg && kr._doomCfg.dieText) || '거기서 끝났다.';
    let held = false;
    try { held = lastChance(why); } catch (e) { console.warn('[K 의 방] 특수 물건 건너뜀', e); }
    if (held) return;
    hardDeath(why);
};
function hardDeath(why) {
    const d = db_();
    kr.dead = true;
    statDead();
    const u = me();
    if (isHelper()) {
        // ★ 헬퍼 — 포인트 · 반입품을 잃지 않고, 오염도도 안 올라가며, 상담실로 가지 않는다
        kr.lostPts = 0; kr.lostItems = []; kr.luckSaved = false; kr.lostDream = 0;
        addHistoryLog(u, '[' + K_CODE + '] 쓰러짐 (헬퍼 — 잃은 것 없음)');
        try { saveFields({ history: 1 }); } catch (e) { }
        if (d && darkRun.isParty) { try { d.ref('darkParties/' + darkRun.partyId + '/alive/' + u.code).remove(); } catch (e) { } sendPartyChat(u.name + ' 사원의 소식이 끊겼습니다.', true); }
        darkRun._dead = true;
        try { if (window.eyeKroom) window.eyeKroom.dead(); } catch (e) { }
        settle('dead', why);
        return;
    }
    // 행운(전용 장비 · 호사수구 꼬리) — 일부를 지킨다
    const luckRate = (typeof gearValue === 'function') ? (kv(gearValue, null, [u, 'luck']) || 0) : 0;
    const saved = luckRate > 0 && Math.random() < luckRate;
    let lost = 0;
    if (saved) { const kept = Math.floor(u.points * (0.30 + Math.random() * 0.15)); lost = u.points - kept; u.points = kept; }
    else { lost = u.points; u.points = 0; }
    // ★ 꿈결도 포인트처럼 잃는다 (2026-10-19) — 행운이 지켜 주면 같은 몫만 남는다
    const kp = prof(u);
    const d0 = Math.max(0, Math.floor(Number(kp.dream) || 0));
    let dLost = 0;
    if (saved) { const keptD = Math.floor(d0 * (0.30 + Math.random() * 0.15)); dLost = d0 - keptD; kp.dream = keptD; }
    else { dLost = d0; kp.dream = 0; }
    kr.lostDream = dLost;
    const items = [];
    [].concat(darkRun.carryEquips || [], darkRun.carryItems || []).forEach(function (it) { removeItemFromInventory(u, it, 1); items.push(it); });
    kr.lostPts = lost; kr.lostItems = items; kr.luckSaved = saved;
    u.pollution = 100;
    u.quarantineUntil = now() + 4 * 60 * 60 * 1000;
    u.quarantineHospital = true;
    u.quarantineDest = isDisasterAgent(u) ? 'bath' : 'fox';
    u.quarantineExitPollution = 40;
    u.foxRoomAnswered = true;
    try { appendBadgeNoteToUser(u, '[' + K_CODE + '] 던전에서 의식 불명 — 긴급 이송됨'); } catch (e) { }
    addHistoryLog(u, '[' + K_CODE + '] 쓰러짐. 포인트 ' + lost.toLocaleString() + ' P 소실' + (dLost ? ' · 꿈결 ' + dLost.toLocaleString() + ' D 소실' : '') + (items.length ? ' · 반입품 ' + items.join(', ') + ' 소실' : ''));
    try { saveSelfFull(); } catch (e) { }
    if (d && darkRun.isParty) { try { d.ref('darkParties/' + darkRun.partyId + '/alive/' + u.code).remove(); } catch (e) { } sendPartyChat(u.name + ' 사원의 소식이 끊겼습니다.', true); }
    darkRun._dead = true;
    try { if (typeof window.heartPayParty === 'function') window.heartPayParty(); } catch (e) { }   // 🩶 은심장
    try { if (window.eyeKroom) window.eyeKroom.dead(); } catch (e) { }                            // 🔎 감지하는 눈
    try { if (jisanOn() && typeof window.jisanOverwrite === 'function') window.jisanOverwrite(K_CODE); } catch (e) { }   // 📖 덧쓰기 (반입품을 덜어 낸 뒤에)
    settle('dead', why);
}

function settle(how, txt) {
    if (!kr || kr._settled) return;
    kr._settled = true;
    if (darkRun) darkRun._settled = true;
    try { kDrop(); } catch (e) { }                          // 정산했다 — 이어 갈 자리를 지운다 (두 번 받지 않게)
    const u = me(), k = prof(u);
    const alive = (how === 'clear' || how === 'leave');
    const helper = isHelper();
    let exp = kr.exp, dream = kr.dream;
    if (how === 'leave' || how === 'out') { exp = Math.round(exp * 0.5); dream = Math.floor(dream * 0.5); }
    if (how === 'dead') { exp = Math.round(exp * 0.35); dream = 0; }   // ★ 쓰러지면 이번에 얻은 꿈결도 없다 (가진 것은 hardDeath 가 걷는다)
    if (helper) { exp = 0; dream = 0; }                         // 헬퍼 — 경험치 · 꿈결 없음
    const extra = [];                                           // 특수 물건이 보탠 것 — 정산에 한 줄씩
    // 꿈결 — 🐾 아기 여우(행운) · 📺 토크 쇼(사회자와 끝까지)
    if (alive && dream > 0) {
        const K = fox(), lx = K && K.usable('luck');
        if (lx) { const m = K.lootRoll(); dream = Math.round(dream * m); extra.push('🐾 ' + esc(foxNick(lx)) + ' — 꿈결 ×' + m.toFixed(2)); }
        const p = showP();
        if (p && p.talkShow && (p.alive || {})[p.talkShow.by]) { dream *= 2; extra.push('📺 사회자와 끝까지 — 꿈결 ×2'); }
    }
    // 레벨
    const lv0 = k.lv;
    if (!helper) {
        k.exp = (k.exp || 0) + exp;
        while (k.lv < LV_MAX && k.exp >= needExp(k.lv)) { k.exp -= needExp(k.lv); k.lv++; }
        if (k.lv >= LV_MAX) k.exp = 0;
        k.dream = (k.dream || 0) + dream;
        k.runs = (k.runs || 0) + 1;
    }
    // 포인트 — 다른 어둠처럼 조금
    const g = kr.dun ? DUNS[kr.dun].g : 'D';
    let pts = 0;
    if (how === 'clear') pts = rnd(1500, 4000) * ({ D: 1, C: 1.5, B: 2.2, A: 3, S: 4 }[g] || 1);
    if (how === 'leave') pts = rnd(400, 1200);
    pts = Math.round(pts);
    if (helper) pts = 0;                                        // 헬퍼 — 포인트 없음
    if (alive && !helper) {
        if (hasHeart() && heartSaves() >= 30) { pts += 5000; extra.push('🩶 은심장 +5,000 P'); }
        if (kr.truth && jisanOn()) { pts *= 3; extra.push('📖 읽어내기 — 죽을 길을 잡고 살아 나왔다 — 포인트 ×3'); }
        const p = showP();
        if (p) { let m = 1; try { m = talkShowMult(p); } catch (e) { } if (m > 1) { pts = Math.round(pts * m); extra.push('📺 무대 열기 — 포인트 ×' + m.toFixed(2)); } }
        if (window.eyeKroom) { let m = 1; try { m = window.eyeKroom.mult(); } catch (e) { } if (m !== 1) { pts = Math.round(pts * m); extra.push('🔎 눈의 몫 — 포인트 ×' + m); } }
    }
    if (pts) { try { changePoints(pts); } catch (e) { } }
    if (pts > 0 && window.eyeKroom) { try { window.eyeKroom.rec(pts); } catch (e) { } }
    // 이번 탐사 한 번짜리 버프 — 여기서 쓴 것만 걷는다 (쇼핑몰 물건이 건 것은 여기서 안 먹었으니 다음 어둠까지 남긴다)
    try { if (Array.isArray(u.itemBuffs)) u.itemBuffs = u.itemBuffs.filter(function (b) { return !b || !b.run || shopSrc(b.src); }); } catch (e) { }
    const HOW = { clear: '돌파', leave: '귀환', dead: '쓰러짐', out: '빠져나옴' };
    addHistoryLog(u, '[' + K_CODE + '] ' + (kr.dun ? DUNS[kr.dun].n : '') + ' — '
        + HOW[how] + (helper ? ' · 헬퍼 (보상 없음)' : ' · 경험치 +' + exp + ' · 꿈결 +' + dream + (pts ? ' · +' + pts.toLocaleString() + ' P' : '')));
    if (!helper) { try { bankAddScore(how === 'dead' ? -5 : (how === 'clear' ? 12 : (how === 'out' ? 2 : 4))); } catch (e) { } }
    if (!u.darkLogs) u.darkLogs = [];
    const logRow = { date: new Date().toLocaleString(), zone: K_CODE, zoneName: '『 K 의 방 』 ' + (kr.dun ? DUNS[kr.dun].n : ''),
        reward: pts, success: darkRun.success, fail: darkRun.fail, loot: [], lost: [], detail: darkRun.log.slice(-20),
        died: how === 'dead', party: !!darkRun.isParty };
    if (helper) logRow.helper = true;
    u.darkLogs.unshift(logRow);
    if (u.darkLogs.length > 15) u.darkLogs.pop();
    // ★ (2026-10-19) 서버는 값이 undefined · NaN 인 칸이 하나라도 있으면 **저장 전체를 거절한다.**
    //   전에는 기록 한 줄에 helper: undefined 가 실려, 같이 보내던 kroom(경험치 · Lv · 꿈결)까지
    //   통째로 안 올라가 정산 직후 되돌아갔다. 기록은 한 번 씻어 두고, kroom 은 따로 먼저 보낸다.
    try { u.darkLogs = JSON.parse(JSON.stringify(u.darkLogs)); } catch (e) { }
    try { saveFields({ kroom: 1 }); } catch (e) { console.warn('[K 의 방] kroom 저장 실패', e && e.message); }
    try { saveFields({ history: 1, darkLogs: 1, points: 1, itemBuffs: 1 }); } catch (e) { console.warn('[K 의 방] 정산 저장 실패', e && e.message); }
    try { paintDream(); } catch (e) { }
    const up = k.lv - lv0;
    darkBodyEl().innerHTML = darkBox({ dead: '종료', clear: '돌파', out: '탈출' }[how] || '귀환',
        (txt ? txt + '<br><br>' : ''),
        `<div style="background:rgba(0,0,0,0.35); border:1px solid #23343b; border-radius:6px; padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">
            <div style="font-weight:bold; color:#7fd3e6; margin-bottom:8px; border-bottom:1px dashed #2f4a55; padding-bottom:6px;">[정산]</div>
            ${kr.dun ? '던전 <b>' + esc(DUNS[kr.dun].n) + '</b> · Lv ' + kr.dunLv + '<br>' : ''}
            ${kr.job ? '직업 <b>' + esc(jobName(kr.job, k.grade)) + '</b> ' + k.grade + (wakeNeed(k) ? ' <span style="color:#888;">(각성 ' + (k.wake[k.grade] || 0) + '/' + wakeNeed(k) + ' · ' + (k.grade === 'S' && isHiddenJob(k.job) ? 'S' : k.grade) + ' 던전에서)</span>' : '') + '<br>' : ''}
            ${helper ? '<div style="color:#81c784; margin-bottom:6px;">헬퍼로 들어온 탐사입니다 — 경험치 · 꿈결 · 각성 점수 · 포인트를 받지 않고, 탐사 횟수도 줄지 않았습니다.</div>' : ''}
            경험치 <b>+${exp}</b>${how !== 'clear' && !helper ? ' <span style="color:#888;">(' + (how === 'dead' ? '35%' : '절반') + ')</span>' : ''}<br>
            Lv <b style="color:${up ? '#4CAF50' : '#ddd'};">${lv0}${up ? ' → ' + k.lv : ''}</b> <span style="color:#888;">(${k.exp} / ${needExp(k.lv)})</span><br>
            꿈결 <b style="color:#c9a8ff;">+${dream} D</b> <span style="color:#888;">(${how === 'dead' && !helper ? '쓰러짐 — 이번에 얻은 것 없음 · ' : ''}모두 ${k.dream.toLocaleString()} D)</span><br>
            ${extra.length ? '<div style="margin-top:6px; padding-top:6px; border-top:1px dashed #4a3a6a; color:#d4bbff; font-size:11px;">' + extra.join('<br>') + '</div>' : ''}
            ${how === 'dead' && helper ? `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed #2e7d32; color:#81c784;">
                헬퍼 — 포인트와 반입품을 잃지 않았고, 상담실로 가지 않습니다.</div>` : ''}
            ${how === 'dead' && !helper ? `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed #7f0000; color:#f44336;">
                보유 포인트 <b>-${(kr.lostPts || 0).toLocaleString()} P</b><br>
                ${kr.lostDream ? '보유 꿈결 <b>-' + kr.lostDream.toLocaleString() + ' D</b><br>' : ''}
                ${(kr.lostItems || []).length ? '반입품 <b>' + kr.lostItems.map(esc).join(', ') + '</b> 소실<br>' : ''}
                ${kr.luckSaved ? '<span style="color:#4CAF50;">✺ 행운 — 일부를 지켜냈습니다.</span><br>' : ''}
                오염도 <span style="color:#ff9800;">100%</span> — 🦊 상담실로 긴급 이송됩니다.</div>` : ''}
            ${pts ? '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #444;">지급 <b style="color:#ffd700; font-size:14px;">+' + pts.toLocaleString() + ' P</b></div>' : ''}
         </div>` + darkChoiceBtn('단말로 복귀한다.', 'kroomFinish()'));
    if (pts) { try { showPointGainEffect(pts); } catch (e) { } }
    // 🌟 제 칠 성군 — 무곡 · 문곡이 정산서에 붙는 자리 (chilseong.js · 2026-10-20)
    try { if (typeof window.kroomSettleHook === 'function') window.kroomSettleHook(how, pts, helper); } catch (e) { }
}

window.kroomFinish = function () {
    const pid = darkRun ? darkRun.partyId : null;
    if (kr) {
        if (kr._doomT) clearInterval(kr._doomT);
        try { if (kr._aidRef) kr._aidRef.off(); } catch (e) { }
        try { if (kr._giftRef) kr._giftRef.off(); } catch (e) { }
        teamDown();
    }
    const d = db_();
    if (pid && d) { try { d.ref('darkParties/' + pid + '/kDoom').off(); } catch (e) { } }
    closeDarkOverlay();
    darkAmbienceStop();
    try { detachChatListener(); } catch (e) { }
    if (pid) { try { partyRunCleanup(pid, K_CODE); } catch (e) { } }
    try { if (typeof clearDarkRunState === 'function') clearDarkRunState(); } catch (e) { }
    try { kDrop(); } catch (e) { }
    kr = null;
    darkRun = null;
    try { updateUI(); } catch (e) { }
    try { renderDarkness(); } catch (e) { }
    try { hasShownFoxAlert = false; } catch (e) { }
    const u = me();
    if (u) { u.foxRoomAnswered = false; setTimeout(function () { if (u.pollution >= 100) { try { startFoxRoomSequence(); } catch (e) { } } }, 600); }
};

// ==========================================
// 9. 이어 붙이기 — renderDarkStep 이 이 구역이면 여기로
// ==========================================
(function hookStep() {
    const iv = setInterval(function () {
        if (typeof renderDarkStep !== 'function') return;
        if (renderDarkStep._k) { clearInterval(iv); return; }
        const _r = renderDarkStep;
        renderDarkStep = function () {
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === K_CODE) {
                if (!kr) {
                    // 일행 출발(launchPartyRun) — 여기서 시작한다
                    if (darkRun.isParty && darkRun.partyId && !darkRun._kresume) { start(true, darkRun.partyId); return; }
                    // 혼자 — 적어 둔 자리가 있으면 거기서 다시 잇는다 (아래 9-1)
                    const snap = !darkRun.isParty && me() ? kLoad(me().code) : null;
                    if (snap && kRestore(snap)) return;
                    // 다시 들어온 것 — 던전과의 연결이 끊겼다
                    show2('—', '눈을 떴을 때 방이 아니었다.<br><br>문은 닫혀 있고, 손에 쥔 것이 없다.<br><span style="font-size:11px; color:#888;">(연결이 끊겨 던전에서 밀려났습니다. 이번 탐사는 보상 없이 끝납니다.)</span>',
                        darkChoiceBtn('단말로 복귀한다.', 'kroomFinish()'));
                    return;
                }
                return;                                   // K 의 방 화면은 스스로 그린다
            }
            return _r.apply(this, arguments);
        };
        renderDarkStep._k = true;
        clearInterval(iv);
    }, 400);
})();
function show2(title, text, extra) { darkBodyEl().innerHTML = darkBox(title, text, extra || ''); }

// ==========================================
// 9-1. 혼자 들어간 판 — 창이 끊겨도 이어 간다 (2026-10-21)
// ==========================================
//   ✗ K 의 방은 진행 상태(kr)를 메모리에만 들고 있었다. 휴대폰이 뒤에 깔린 창을 비웠다가
//     다시 띄우거나(새로 열림), 같은 계정이 다른 창에서 열려 이 창이 새로 열리면 kr 이 사라졌다.
//     그러면 「연결이 끊겨 던전에서 밀려났습니다 · 보상 없이 끝납니다」로 판이 통째로 날아갔다 —
//     쉼터에서 「▼ 내려간다」를 누르고 다음 층을 기다리는 사이에 특히 잘 났다.
//   → 화면을 그릴 때마다(show) 상태와 그 화면을 이 기기(localStorage)에 적어 둔다.
//       kroomRun_<사번>   { at, s(판 시작 시각), kr(장면 묶음 빼고), run(darkRun), html(지금 화면), dna }
//       kroomPlan_<사번>  { s, p(층마다 장면 묶음) } — 판마다 한 번
//     · 같은 창에서 kr 만 사라졌으면 그 자리에서 바로 잇는다 (renderDarkStep 갈래)
//     · 새로 열렸으면 들어온 뒤 「이어 간다 / 그만둔다」를 묻는다
//     · 정산(settle) · 단말로 복귀(kroomFinish) · 새 판(start) 에서 지운다 — 두 번 받는 일이 없다
//     · 일행 판은 하지 않는다 (팀이 같이 움직여야 해서 — 예전처럼 다시 합류)
const K_SAVE = 'kroomRun_', K_PLAN = 'kroomPlan_';
const K_KEEP = 6 * 3600 * 1000;                 // 이만큼 지난 자리는 버린다
const K_SKIP = { plan: 1, _doomT: 1, _doomCb: 1, _aidRef: 1, _giftRef: 1, _beat: 1, _picking: 1, _doomWatch: 1, _pickDun: 1, _going: 1 };
let kPlanFor = null, kSaveQ = false;
function kPlain(o, skip) {
    const out = {};
    Object.keys(o || {}).forEach(function (k) {
        if (skip && skip[k]) return;
        const v = o[k];
        if (typeof v === 'function' || v === undefined) return;
        try { out[k] = JSON.parse(JSON.stringify(v)); } catch (e) { }
    });
    return out;
}
function kSaveNow() {
    try {
        const u = me();
        if (!u || !u.code || !kr || typeof darkRun === 'undefined' || !darkRun || darkRun.zone !== K_CODE) return;
        if (darkRun.isParty) return;
        if (kr._settled || darkRun._settled) { kDrop(u.code); return; }
        const body = darkBodyEl(); if (!body) return;
        if (kr.plan && kPlanFor !== kr.started) {
            localStorage.setItem(K_PLAN + u.code, JSON.stringify({ s: kr.started, p: kr.plan }));
            kPlanFor = kr.started;
        }
        let dna = null;
        try { if (typeof dnaCharge === 'object' && dnaCharge) dna = Object.assign({}, dnaCharge); } catch (e) { }
        localStorage.setItem(K_SAVE + u.code, JSON.stringify({
            v: 1, code: u.code, at: now(), s: kr.started,
            kr: kPlain(kr, K_SKIP), run: kPlain(darkRun), html: body.innerHTML, dna: dna
        }));
    } catch (e) { console.warn('[K 의 방] 이어 갈 자리 적기 건너뜀:', e && e.message); }
}
// 같은 흐름에서 바로 뒤따라 바뀌는 것(idx++ 등)까지 담기게 한 박자 뒤에 적는다
function kSaveSoon() {
    if (kSaveQ) return;
    kSaveQ = true;
    Promise.resolve().then(function () { kSaveQ = false; kSaveNow(); });
}
function kDrop(code) {
    code = code || (me() && me().code);
    if (!code) return;
    try { localStorage.removeItem(K_SAVE + code); localStorage.removeItem(K_PLAN + code); } catch (e) { }
    kPlanFor = null;
}
function kLoad(code) {
    try {
        const s = JSON.parse(localStorage.getItem(K_SAVE + code) || 'null');
        if (!s || s.code !== code || !s.kr || !s.run || s.run.isParty) return null;
        if (now() - (s.at || 0) > K_KEEP) { kDrop(code); return null; }
        if (s.kr.dun && s.kr.floor >= 1) {                    // 던전 안 — 장면 묶음이 있어야 잇는다
            const p = JSON.parse(localStorage.getItem(K_PLAN + code) || 'null');
            if (!p || p.s !== s.s || !Array.isArray(p.p)) return null;
            s.plan = p.p;
        }
        return s;
    } catch (e) { return null; }
}
function kRestore(s) {
    const u = me();
    if (!u || !s || s.code !== u.code) return false;
    if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone !== K_CODE) return false;
    hookItems();
    darkRun = Object.assign({}, s.run, { zone: K_CODE, kroom: true, isParty: false, partyId: null });
    kr = Object.assign({}, s.kr);
    if (s.plan) { kr.plan = s.plan; kPlanFor = kr.started; }
    try { if (s.dna && typeof dnaCharge === 'object') dnaCharge = Object.assign({}, dnaCharge, s.dna); } catch (e) { }
    try { darkAmbienceStart(K_CODE); } catch (e) { }
    openDarkOverlay();
    const el = document.getElementById('dro-code'); if (el) el.innerText = K_CODE;
    show2('—', '다시 문 앞에 섰다.<br><br>손에 쥔 것도, 지나온 길도 그대로다.',
        '<div style="font-size:11px; color:#888; text-align:center; padding:10px;">끊긴 자리를 잇는 중…</div>');
    teamUp();
    console.log('[K 의 방] 끊긴 판을 이어 갑니다 — ' + (kr.dun || '던전 전') + ' · ' + (kr.floor || 0) + '층');
    if (!kr.job || !kr.stats) { if (!prof().job) cardPick(); else afterJob(); return true; }
    if (!kr.dun) { afterJob(); return true; }                   // 던전을 고르던 중 — 다시 고른다
    loadFor(kr.dun, kr.job).then(function () {
        if (!kr) return;
        if (!DATA.dun[kr.dun]) {
            show2('—', '방이 열리지 않는다.<br><br>문 너머가 아직 비어 있다. (내용을 받지 못했습니다 — 잠시 뒤 다시 들어와 주십시오)',
                darkChoiceBtn('돌아간다.', 'kroomFinish()'));
            return;
        }
        if (!kr.plan || !kr.floor) { const id = kr.dun; kr.dun = null; enterDungeon({ id: id, lv: kr.dunLv }); return; }
        runUp();
        try { watchGift(); } catch (e) { }
        darkBodyEl().innerHTML = s.html;
        kSaveNow();
        try { toast('끊긴 자리에서 이어 갑니다.'); } catch (e) { }
    });
    return true;
}

// 새로 열렸을 때 — 들어온 뒤 한 번 묻는다
let kAskedFor = null;
function kAsk(s) {
    if (document.getElementById('kroom-resume')) return;
    const D = s.kr && s.kr.dun ? DUNS[s.kr.dun] : null;
    const where = D ? esc(D.n) + (s.kr.floor ? ' · ' + s.kr.floor + '층' : '') : '던전에 들어서기 전';
    const box = document.createElement('div');
    box.id = 'kroom-resume';
    box.style.cssText = 'position:fixed; inset:0; z-index:2147483000; background:rgba(0,0,0,0.88); display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;';
    box.innerHTML = `<div class="luxury-alert-box" style="border-color:#8fb8c4; box-shadow:0 15px 40px rgba(143,184,196,0.2), inset 0 0 20px rgba(0,0,0,0.8);">
        <h3 style="color:#8fb8c4; margin-top:0; letter-spacing:1px; font-size:17px;">『 K 의 방 』 — 끊긴 탐사</h3>
        <div style="color:#eee; margin-bottom:22px; font-size:13px; line-height:1.7;">
            <span style="font-family:monospace; font-size:11px; color:#ff6b6b;">${K_CODE}</span><br>
            <b style="color:#fff; font-size:14px;">${where}</b><br><br>
            창이 닫히거나 새로 열려 끊긴 탐사가 있습니다.<br>
            <span style="font-size:12px; color:#aaa;">이어 가면 끊긴 그 화면부터 다시 시작합니다.</span><br>
            <span style="font-size:10px; color:#888;">그만두면 이번 탐사는 보상 없이 끝납니다.</span></div>
        <div style="display:flex; gap:10px;">
            <button class="luxury-alert-btn" onclick="kroomResumeGo()" style="flex:2; background:#1f3a44; color:#fff; border-color:#4f8a9c;">이어 간다</button>
            <button class="luxury-alert-btn" onclick="kroomResumeNo()" style="flex:1; white-space:nowrap; background:transparent; border-color:#888; color:#aaa;">그만둔다</button>
        </div></div>`;
    document.body.appendChild(box);
}
function kAskClose() { const b = document.getElementById('kroom-resume'); if (b) b.remove(); }
window.kroomResumeGo = function () {
    kAskClose();
    const u = me(); if (!u) return;
    if (typeof darkRun !== 'undefined' && darkRun) { showCustomAlert('다른 탐사 중이라 이어 갈 수 없습니다.'); return; }
    const s = kLoad(u.code);
    if (!s || !kRestore(s)) { kDrop(u.code); showCustomAlert('이어 갈 자리를 찾지 못했습니다.'); }
};
window.kroomResumeNo = function () {
    kAskClose();
    const u = me(); if (!u) return;
    const s = kLoad(u.code);
    kDrop(u.code);
    const d = db_();
    if (s && s.kr && d) {
        const t = s.kr.team || ('solo_' + u.code);
        try { d.ref('kroomTeams/' + t).remove(); } catch (e) { }
        if (s.kr.dun) { try { d.ref('kroomRuns/' + s.kr.dun + '/' + t).remove(); } catch (e) { } }
    }
    try { addHistoryLog(u, '[' + K_CODE + '] 끊긴 탐사를 이어 가지 않고 끝냈습니다. (보상 없음)'); saveFields({ history: 1 }); } catch (e) { }
};
setInterval(function () {
    try {
        const u = me();
        if (!u || !u.code || kAskedFor === u.code) return;
        if (typeof darkRun !== 'undefined' && darkRun) return;
        if (document.visibilityState === 'hidden') return;
        const sc = document.getElementById('session-cover');
        if (sc && sc.style.display !== 'none') return;
        const login = document.getElementById('login-screen');
        if (login && getComputedStyle(login).display !== 'none') return;
        kAskedFor = u.code;
        const s = kLoad(u.code);
        if (s) kAsk(s);
    } catch (e) { }
}, 1500);

// ==========================================
// 10. 히든 직업 — 조건 · 상담사 알림 · 금빛 카드 · L
// ==========================================
//   kroomHidden/<사번> = { state, code, name, no, attr, key, job, from, lv, jx, hq, at,
//                          offeredAt, answeredAt, lAt }
//     state  ready     조건을 다 채웠다 — 상담사에게 알림
//            offered   상담사가 지정했다 — 다음에 K 의 방에 들어설 때 금빛 카드
//            accepted  전직했다 (D 부터)          declined  사원이 거절했다
//            denied    상담사가 주지 않기로 했다    L         히든 직업이 L 이 되었다
const H_NODE = 'kroomHidden';
let hMine = null, hMineRef = null, hMineCode = '';
let hAll = {}, hAllOn = false;
function hiddenProgress(k) {
    k = k || prof();
    const jx = k.jx || {}, hq = k.hq || {};
    const a = (k.job && JOBS[k.job]) ? JOBS[k.job][0] : null;
    return {
        lv: k.lv || 1, grade: k.grade, attr: a,
        jx: HIDDEN_NEED.jxGrades.map(function (g) { return g + ' ' + (jx[g] || 0); }).join(' · '),
        hq: a ? (hq[a] || 0) : 0,
        ok: !!(k.job && !isHiddenJob(k.job) && (k.lv || 1) >= HIDDEN_NEED.lv && k.grade === HIDDEN_NEED.grade
            && HIDDEN_NEED.jxGrades.every(function (g) { return (jx[g] || 0) >= HIDDEN_NEED.jx; })
            && a && (hq[a] || 0) >= HIDDEN_NEED.hq)
    };
}
// 조건을 다 채웠으면 한 번만 상담사에게 알린다
function hiddenCheck() {
    const u = me(), d = db_();
    if (!u || !d || u.code === ADMIN) return;
    const k = prof(u);
    if (k.hiddenAsk || !hiddenProgress(k).ok) return;
    k.hiddenAsk = now();
    saveProf();
    const a = JOBS[k.job][0], key = hiddenKeyFor(a, u);
    const entry = { state: 'ready', code: u.code, name: u.name || '', no: String(u.no || ''), attr: a, key: key,
                    job: JOBS[key][2][0], from: jobName(k.job, k.grade), lv: k.lv, at: now(),
                    jx: Object.assign({}, k.jx || {}), hq: (k.hq || {})[a] || 0 };
    d.ref(H_NODE + '/' + u.code).transaction(function (cur) {
        if (cur && cur.state) return;                 // 이미 적혀 있으면(거절 · 미지정 포함) 그대로
        return entry;
    }).catch(function () { });
    addHistoryLog(u, '[K 의 방] 무언가가 당신을 지켜보기 시작했다.');
    try { saveFields({ history: 1 }); } catch (e) { }
}
setInterval(function () { try { if (me() && !kr) hiddenCheck(); } catch (e) { } }, 20000);

// 내 것 — 지정받았는지
setInterval(function () {
    const u = me(), d = db_();
    if (!u || !d) return;
    if (hMineCode === u.code) return;
    try { if (hMineRef) hMineRef.off(); } catch (e) { }
    hMineCode = u.code; hMine = null;
    hMineRef = d.ref(H_NODE + '/' + u.code);
    hMineRef.on('value', function (s) { hMine = s.val() || null; });
}, 1500);
function hiddenOffered() {
    const k = prof();
    return !!(hMine && hMine.state === 'offered' && k && k.job && !isHiddenJob(k.job));
}

// 금빛 카드 — 『 선택받은 자여 전직하겠습니까? 』
function hiddenCss() {
    if (document.getElementById('khid-css')) return;
    const st = document.createElement('style');
    st.id = 'khid-css';
    st.textContent = [
        '#khid-ov{position:fixed;inset:0;z-index:2147483200;display:flex;flex-direction:column;align-items:center;justify-content:center;',
        '  padding:20px;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,rgba(58,40,8,.94) 0%,rgba(14,10,4,.97) 45%,rgba(3,2,8,.99) 80%);',
        '  animation:khidFade 1.2s ease both;}',
        '#khid-ov .khid-dust{position:absolute;bottom:-10px;width:3px;height:3px;border-radius:50%;background:#ffe9a8;',
        '  box-shadow:0 0 6px #ffd76a,0 0 12px rgba(255,200,90,.6);opacity:0;animation:khidRise linear infinite;pointer-events:none;}',
        '#khid-ov .khid-ring{position:absolute;width:330px;height:330px;border-radius:50%;top:50%;left:50%;margin:-215px 0 0 -165px;',
        '  border:1px solid rgba(255,215,120,.18);box-shadow:0 0 60px rgba(255,200,80,.12) inset;animation:khidSpin 40s linear infinite;pointer-events:none;}',
        '#khid-ov .khid-ring:after{content:"";position:absolute;inset:18px;border-radius:50%;border:1px dashed rgba(255,215,120,.14);}',
        '#khid-ov .khid-card{position:relative;width:168px;aspect-ratio:2/3;border-radius:14px;display:flex;flex-direction:column;',
        '  align-items:center;justify-content:center;background:linear-gradient(155deg,#3d2c08 0%,#1b1304 52%,#2e2006 100%);',
        '  border:2px solid #f5d27a;box-shadow:0 0 18px rgba(255,215,110,.75),0 0 60px rgba(255,200,80,.35),inset 0 0 24px rgba(255,220,140,.28);',
        '  animation:khidIn 1.7s cubic-bezier(.2,.8,.2,1) both,khidGlow 2.8s ease-in-out 1.7s infinite;}',
        '#khid-ov .khid-card:before{content:"";position:absolute;inset:7px;border-radius:9px;border:1px solid rgba(255,225,150,.38);}',
        '#khid-ov .khid-card:after{content:"";position:absolute;inset:0;border-radius:12px;pointer-events:none;',
        '  background:linear-gradient(115deg,transparent 32%,rgba(255,244,200,.42) 50%,transparent 68%);background-size:260% 100%;',
        '  animation:khidSheen 3.6s ease-in-out 1.7s infinite;}',
        '#khid-ov .khid-tag{position:absolute;top:16px;font-size:9px;letter-spacing:6px;color:#e3c172;}',
        '#khid-ov .khid-ico{font-size:44px;color:#ffe7a3;text-shadow:0 0 14px #ffcf5a,0 0 30px rgba(255,190,60,.6);}',
        '#khid-ov .khid-nm{margin-top:12px;font-size:20px;letter-spacing:5px;color:#fff3cf;text-shadow:0 0 10px rgba(255,210,100,.85);',
        '  font-family:"Nanum Myeongjo","Noto Serif KR",serif;font-weight:bold;}',
        '#khid-ov .khid-at{position:absolute;bottom:16px;font-size:10px;letter-spacing:3px;color:#cdaa5c;}',
        '#khid-ov .khid-q{margin-top:30px;font-size:17px;letter-spacing:3px;color:#ffe9b0;text-align:center;line-height:1.7;',
        '  text-shadow:0 0 12px rgba(255,200,90,.75);font-family:"Nanum Myeongjo","Noto Serif KR",serif;animation:khidFade 1.4s ease 1.3s both;}',
        '#khid-ov .khid-note{margin-top:10px;font-size:11px;color:#b9a47b;text-align:center;line-height:1.7;animation:khidFade 1.4s ease 1.8s both;}',
        '#khid-ov .khid-btns{display:flex;gap:10px;margin-top:22px;animation:khidFade 1.4s ease 2.2s both;}',
        '#khid-ov .khid-btns button{padding:11px 22px;border-radius:999px;font-size:13px;cursor:pointer;font-family:inherit;}',
        '#khid-ov .khid-yes{background:linear-gradient(145deg,#d8b252,#8f6c1e);color:#1d1404;font-weight:bold;border:1px solid #ffe08a;',
        '  box-shadow:0 0 16px rgba(255,210,100,.55);}',
        '#khid-ov .khid-no{background:rgba(0,0,0,.25);color:#a8977a;border:1px solid #5a4a2a;}',
        '#khid-ov.done .khid-card{animation:khidBurst 1.2s ease both;}',
        '@keyframes khidFade{from{opacity:0}to{opacity:1}}',
        '@keyframes khidIn{0%{transform:translateY(40px) rotateY(180deg) scale(.55);opacity:0;filter:brightness(3)}',
        '  55%{opacity:1}100%{transform:none;opacity:1;filter:none}}',
        '@keyframes khidGlow{0%,100%{box-shadow:0 0 18px rgba(255,215,110,.75),0 0 60px rgba(255,200,80,.35),inset 0 0 24px rgba(255,220,140,.28)}',
        '  50%{box-shadow:0 0 30px rgba(255,225,140,.95),0 0 100px rgba(255,205,90,.55),inset 0 0 34px rgba(255,230,160,.42)}}',
        '@keyframes khidSheen{0%{background-position:160% 0}100%{background-position:-60% 0}}',
        '@keyframes khidRise{0%{transform:translateY(0) translateX(0);opacity:0}12%{opacity:.95}100%{transform:translateY(-112vh) translateX(24px);opacity:0}}',
        '@keyframes khidSpin{to{transform:rotate(360deg)}}',
        '@keyframes khidBurst{0%{filter:brightness(1)}35%{filter:brightness(2.6);transform:scale(1.08)}100%{filter:brightness(1.2);transform:scale(1)}}'
    ].join('\n');
    document.head.appendChild(st);
}
function hiddenPopup(cont) {
    const u = me(), k = prof(u);
    const a = JOBS[k.job][0];
    const key = hiddenKeyFor(a, u);
    const H = JOBS[key];
    hiddenCss();
    const old = document.getElementById('khid-ov'); if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'khid-ov';
    let dust = '';
    for (let i = 0; i < 34; i++) {
        dust += '<i class="khid-dust" style="left:' + (Math.random() * 100).toFixed(1) + '%;animation-duration:'
            + (6 + Math.random() * 9).toFixed(1) + 's;animation-delay:' + (Math.random() * 8).toFixed(1) + 's;"></i>';
    }
    ov.innerHTML = dust + '<div class="khid-ring"></div>'
        + '<div class="khid-card"><div class="khid-tag">HIDDEN</div>'
        + '<div class="khid-ico">' + ATTR[a].i + '</div>'
        + '<div class="khid-nm">' + esc(H[2][0]) + '</div>'
        + '<div class="khid-at">' + esc(ATTR[a].n) + '</div></div>'
        + '<div class="khid-q">『 선택받은 자여 전직하겠습니까? 』</div>'
        + '<div class="khid-note">전직하면 지금 직업(' + esc(jobName(k.job, k.grade)) + ' ' + k.grade + ')을 내려놓고<br>'
        + esc(H[2][0]) + ' D 부터 다시 시작합니다. Lv 은 그대로입니다.</div>'
        + '<div class="khid-btns"><button class="khid-no">거절한다</button><button class="khid-yes">전직한다</button></div>';
    document.body.appendChild(ov);
    let done = false;
    const close = function () { setTimeout(function () { ov.remove(); if (typeof cont === 'function') cont(); }, 1900); };
    ov.querySelector('.khid-yes').onclick = function () {
        if (done) return; done = true;
        const from = jobName(k.job, k.grade) + ' ' + k.grade;
        k.job = key; k.grade = 'D'; k.wake = {}; k.peek = null;
        k.hidden = { attr: a, at: now(), from: from };
        saveProf();
        addHistoryLog(u, '[K 의 방] ✦ 선택받았다 — ' + from + ' → ' + H[2][0] + ' D (히든 직업)');
        try { saveFields({ kroom: 1, history: 1 }); } catch (e) { }
        try { db_().ref(H_NODE + '/' + u.code).update({ state: 'accepted', answeredAt: now(), key: key, job: H[2][0] }); } catch (e) { }
        if (hMine) hMine.state = 'accepted';
        ov.classList.add('done');
        ov.querySelector('.khid-q').innerHTML = '✦ ' + esc(H[2][0]) + ' D ✦';
        ov.querySelector('.khid-note').innerHTML = '빛이 가라앉는다. 이름이 바뀌었다.';
        ov.querySelector('.khid-btns').remove();
        close();
    };
    ov.querySelector('.khid-no').onclick = function () {
        if (done) return; done = true;
        try { db_().ref(H_NODE + '/' + u.code).update({ state: 'declined', answeredAt: now() }); } catch (e) { }
        if (hMine) hMine.state = 'declined';
        addHistoryLog(u, '[K 의 방] 금빛 카드를 덮었다.');
        try { saveFields({ history: 1 }); } catch (e) { }
        ov.querySelector('.khid-card').style.transition = 'opacity 1.2s, transform 1.2s';
        ov.querySelector('.khid-card').style.opacity = '0';
        ov.querySelector('.khid-card').style.transform = 'rotateY(180deg) scale(.7)';
        ov.querySelector('.khid-q').innerHTML = '카드가 빛을 거둔다.';
        ov.querySelector('.khid-note').innerHTML = '';
        ov.querySelector('.khid-btns').remove();
        close();
    };
}
window.kroomHiddenPreview = function () { hiddenPopup(null); };     // 상담사 — 카드 모양 보기 (아무것도 안 바뀐다 · 누르면 바뀐다)

// L — 그에 맞는 물건은 추후
function hiddenReachL(k) {
    const u = me(), d = db_();
    if (!u) return;
    addHistoryLog(u, '[K 의 방] ✦ ' + jobName(k.job, 'L') + ' — L 에 닿았다.');
    try { if (d) d.ref(H_NODE + '/' + u.code).update({ state: 'L', lAt: now(), key: k.job, job: jobName(k.job, 'L') }); } catch (e) { }
}

// ==========================================
// 상담사 — 알림 · 통제 콘솔 「히든 직업 관리」
// ==========================================
function hSeen() { try { return JSON.parse(localStorage.getItem('kHiddenSeen') || '{}'); } catch (e) { return {}; } }
function hSeenPut(m) { try { localStorage.setItem('kHiddenSeen', JSON.stringify(m)); } catch (e) { } }
setInterval(function () {
    const u = me(), d = db_();
    if (!u || !d || u.code !== ADMIN || hAllOn) return;
    hAllOn = true;
    d.ref(H_NODE).on('value', function (s) {
        hAll = s.val() || {};
        const seen = hSeen(), news = [];
        Object.keys(hAll).forEach(function (c) {
            const v = hAll[c] || {};
            if (v.state !== 'ready' && v.state !== 'L') return;
            const id = c + ':' + v.state + (v.state === 'L' ? '' : ':' + v.at);   // L 은 한 사람에 한 번
            if (seen[id]) return;
            seen[id] = 1; news.push(v);
        });
        if (news.length) {
            hSeenPut(seen);
            const lines = news.map(function (v) {
                return v.state === 'L'
                    ? '✦ ' + v.name + ' 사원 — ' + v.job + ' L 달성 (그에 맞는 물건은 추후)'
                    : '✦ ' + v.name + ' 사원' + (v.no ? ' (' + v.no + ')' : '') + ' — ' + (ATTR[v.attr] ? ATTR[v.attr].n : v.attr) + ' → ' + v.job;
            });
            try { showCustomAlert('히든 직업\n\n' + lines.join('\n') + '\n\n통제 콘솔 「히든 직업 관리」에서 정할 수 있습니다.'); } catch (e) { }
        }
        const wait = Object.keys(hAll).filter(function (c) { return (hAll[c] || {}).state === 'ready'; }).length;
        const btn = document.getElementById('btn-admin-console');
        if (btn && wait > 0) btn.classList.add('notify-dot');
        try { hiddenPaint(); } catch (e) { }
    });
}, 1500);

const H_STATE = {
    ready: ['조건 달성 — 정해 주세요', '#ffd76a'], offered: ['지정함 — K 의 방에 들어서면 금빛 카드', '#c9a8ff'],
    accepted: ['전직함', '#4CAF50'], declined: ['사원이 거절함', '#ff8a80'], denied: ['주지 않기로 함', '#888'], L: ['L 달성', '#ffe08a']
};
function hiddenPaint() {
    const box = document.getElementById('admin-hidden-list');
    if (!box) return;
    const order = { ready: 0, L: 1, offered: 2, declined: 3, denied: 4, accepted: 5 };
    const codes = Object.keys(hAll).sort(function (a, b) {
        return (order[(hAll[a] || {}).state] || 9) - (order[(hAll[b] || {}).state] || 9) || ((hAll[b] || {}).at || 0) - ((hAll[a] || {}).at || 0);
    });
    if (!codes.length) {
        box.innerHTML = '<div style="font-size:11px; color:#777; padding:8px 0;">아직 조건을 채운 사원이 없습니다.</div>';
        return;
    }
    const book = (typeof db !== 'undefined' && db.users) || {};
    box.innerHTML = codes.map(function (c) {
        const v = hAll[c] || {};
        const st = H_STATE[v.state] || [v.state, '#aaa'];
        const now_ = book[c] && book[c].kroom ? book[c].kroom : null;
        const holders = Object.keys(hAll).filter(function (x) {
            const w = hAll[x] || {}; return x !== c && w.key === v.key && (w.state === 'accepted' || w.state === 'L');
        }).map(function (x) { return (hAll[x] || {}).name || x; });
        let btns = '';
        if (v.state === 'ready' || v.state === 'denied' || v.state === 'declined') {
            btns = '<button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#c9a24a,#8a6a1e) !important; color:#1a1204 !important; border-color:#ffe08a !important;" onclick="kroomHiddenAct(\'' + c + '\',\'offer\')">'
                + (v.state === 'ready' ? '지정한다' : '다시 지정한다') + '</button>';
            if (v.state === 'ready') btns += '<button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="kroomHiddenAct(\'' + c + '\',\'deny\')">주지 않는다</button>';
        } else if (v.state === 'offered') {
            btns = '<button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="kroomHiddenAct(\'' + c + '\',\'withdraw\')">지정을 거둔다</button>';
        }
        return '<div style="border:1px solid #4a3a1a; border-radius:6px; padding:10px; margin-bottom:8px; background:rgba(255,215,110,.04);">'
            + '<div style="display:flex; align-items:center; gap:6px; font-size:12px;"><b style="color:#fff;">' + esc(v.name || c) + '</b>'
            + '<span style="font-size:10px; color:#888;">' + esc(v.no || c) + '</span>'
            + '<span style="margin-left:auto; font-size:10px; color:' + st[1] + ';">' + esc(st[0]) + '</span></div>'
            + '<div style="font-size:11px; color:#e3c172; margin-top:5px;">' + (ATTR[v.attr] ? ATTR[v.attr].i + ' ' + ATTR[v.attr].n : '') + ' → <b>' + esc(v.job || '') + '</b>'
            + (v.from ? ' <span style="color:#888;">(지금 ' + esc(v.from) + ')</span>' : '') + '</div>'
            + '<div style="font-size:10px; color:#999; margin-top:4px; line-height:1.6;">조건 당시 Lv ' + (v.lv || '-') + ' · 갈림길 '
            + HIDDEN_NEED.jxGrades.map(function (g) { return g + ' ' + ((v.jx || {})[g] || 0); }).join(' · ') + ' · 임무 ' + (v.hq || 0)
            + (now_ && (v.state === 'accepted' || v.state === 'L') ? '<br>지금 ' + esc(jobName(now_.job, now_.grade)) + ' ' + esc(now_.grade || '') + ' · Lv ' + (now_.lv || '-') : '')
            + (v.state === 'L' ? '<br><span style="color:#ffe08a;">L 에 맞는 물건은 아직 정하지 않았습니다.</span>' : '')
            + (holders.length ? '<br><span style="color:#ff8a80;">이미 ' + holders.map(esc).join(', ') + ' 사원이 이 직업입니다.</span>' : '')
            + '</div>'
            + (btns ? '<div style="display:flex; gap:6px; margin-top:8px;">' + btns + '</div>' : '')
            + '</div>';
    }).join('');
}
window.kroomHiddenAct = function (code, act) {
    const u = me(), d = db_();
    if (!u || u.code !== ADMIN || !d) return;
    const v = hAll[code]; if (!v) return;
    let up = null;
    if (act === 'offer') up = { state: 'offered', offeredAt: now(), offeredBy: u.code };
    else if (act === 'deny') up = { state: 'denied', answeredAt: now() };
    else if (act === 'withdraw') up = { state: 'ready', offeredAt: null };
    if (!up) return;
    d.ref(H_NODE + '/' + code).update(up).then(function () {
        try {
            showCustomAlert(act === 'offer' ? (v.name + ' 사원에게 ' + v.job + ' 을(를) 지정했습니다.\n\n다음에 K 의 방에 들어설 때 금빛 카드가 뜹니다.')
                : act === 'deny' ? (v.name + ' 사원에게는 주지 않기로 했습니다.') : '지정을 거두었습니다.');
        } catch (e) { }
    }).catch(function (e) { try { showCustomAlert('적지 못했습니다.\n\n' + (e && e.message)); } catch (x) { } });
};
// 통제 콘솔에 칸을 끼워 넣는다
(function hiddenPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-hidden-box')) return;
        const anchor = scr.querySelector('.action-buttons');
        const html = '<div class="admin-panel-box" id="admin-hidden-box" style="border-color:#c9a24a; background-color:#1a1406;">'
            + '<h4 style="color:#ffe08a;">✦ 히든 직업 관리 (K 의 방)</h4>'
            + '<div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.6;">'
            + '조건 — Lv ' + HIDDEN_NEED.lv + ' · 직업 S · D~A 등급 던전마다 갈림길 ' + HIDDEN_NEED.jx + '번 · 그 속성 직업의 임무 ' + HIDDEN_NEED.hq + '번.<br>'
            + '채운 사원이 여기에 뜹니다. 지정하면 그 사원이 K 의 방에 들어설 때 금빛 카드가 뜨고, 전직하면 D 부터 다시 시작합니다.'
            + '</div><div id="admin-hidden-list"></div></div>';
        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
    }
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._kHidden) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); hiddenPaint(); }, 160);
            return r;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._kHidden = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
})();
window.kroomHiddenState = function (who) {
    const u = me(); if (!u) return;
    if (!who) {
        const p = hiddenProgress();
        console.log('%c===== ✦ 히든 직업 — 내 조건 =====', 'color:#ffe08a; font-size:13px');
        console.log('  Lv ' + p.lv + ' / ' + HIDDEN_NEED.lv + ' · 등급 ' + p.grade + ' / S · 갈림길 ' + p.jx + ' (각 ' + HIDDEN_NEED.jx + ') · 임무 ' + p.hq + ' / ' + HIDDEN_NEED.hq
            + (p.ok ? ' — 다 채움' : ''));
        console.log('  상태 :', hMine ? hMine.state : '없음');
        return;
    }
    console.table(Object.keys(hAll).map(function (c) { const v = hAll[c]; return { 사원: v.name, 사번: v.no, 속성: v.attr, 직업: v.job, 상태: v.state }; }));
};

// ==========================================
// 콘솔
// ==========================================
window.kroomState = function () {
    const k = prof(); if (!k) return;
    console.log('%c===== 『 K 의 방 』 =====', 'color:#7fd3e6; font-size:13px');
    console.log('  Lv ' + k.lv + ' (' + k.exp + ' / ' + needExp(k.lv) + ') · 꿈결 ' + k.dream + ' · 들어간 수 ' + (k.runs || 0));
    console.log('  직업 ' + (k.job ? jobName(k.job, k.grade) + ' ' + k.grade + ' — 각성 ' + JSON.stringify(k.wake) : '없음') + (k.rerolled ? ' · 다시 고르기 씀' : ''));
    console.log('  지금 든 팀 ' + liveTeams().length + ' / ' + MAX_TEAMS);
    try { const hp = hiddenProgress(k); console.log('  히든 직업 조건 — Lv ' + hp.lv + '/' + HIDDEN_NEED.lv + ' · ' + hp.grade + '/S · 갈림길 ' + hp.jx + ' · 임무 ' + hp.hq + '/' + HIDDEN_NEED.hq + (hp.ok ? ' (다 채움)' : '')); } catch (e) { }
    const a = kAdds(u_kc());
    console.log('  오늘 횟수 — 쓴 ' + kUsed() + ' · 한도 ' + kLimit() + ' (기본 ' + K_TRY_BASE + ' + 얹는 몫 ' + a.add + ' → 최대 ' + K_TRY_HARD
        + (a.dna ? ' · 출산 고유 아이템 +' + a.dna : '') + ') · 남은 ' + kLeft() + (KC.ready ? '' : ' (서버 값 받는 중)'));
};
function u_kc() { return me(); }
window.kroomGive = function (who, field, val) {
    const u = me(); if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) || {};
    const code = Object.keys(book).filter(function (c) { const x = book[c] || {}; return c === who || x.name === who || String(x.no) === String(who); })[0];
    if (!code) { console.warn('사원을 못 찾았습니다.'); return; }
    const t = book[code]; const k = prof(t);
    if (field === 'lv') k.lv = clamp(Number(val) || 1, 1, LV_MAX);
    else if (field === 'exp') k.exp = Math.max(0, Number(val) || 0);
    else if (field === 'dream') k.dream = Math.max(0, Number(val) || 0);
    else if (field === 'job') { if (val && !JOBS[val]) { console.warn('없는 직업 —', Object.keys(JOBS).join(' ')); return; } k.job = val || null; k.grade = 'D'; k.wake = {}; k.peek = null; }
    else if (field === 'grade') { if (GRADES.indexOf(val) < 0 && !(val === 'L' && isHiddenJob(k.job))) return; k.grade = val; }
    else if (field === 'reroll') { k.rerolled = false; k.peek = null; }
    else if (field === 'jx') { k.jx = k.jx || {}; HIDDEN_NEED.jxGrades.forEach(function (g) { k.jx[g] = Math.max(0, Number(val) || 0); }); }
    else if (field === 'hq') { const a = (k.job && JOBS[k.job]) ? JOBS[k.job][0] : null; if (!a) { console.warn('직업이 없습니다.'); return; } k.hq = k.hq || {}; k.hq[a] = Math.max(0, Number(val) || 0); }
    else if (field === 'hiddenAsk') { k.hiddenAsk = null; }
    else { console.warn('lv · exp · dream · job · grade · reroll · jx · hq · hiddenAsk'); return; }
    if (typeof updateUserFields === 'function') updateUserFields(code, { kroom: k });
    console.log('%c✓ ' + (t.name || code) + ' — ' + field + ' = ' + JSON.stringify(val), 'color:#4CAF50');
};
window.KROOM = { hard: function () { return hard(); }, JOBS: JOBS, ATTR: ATTR, DUNS: DUNS, DATA: DATA, L_JOBS: L_JOBS, HIDDEN: HIDDEN, hiddenProgress: function (k) { return hiddenProgress(k); }, hiddenCheck: function () { return hiddenCheck(); }, ITEMS: ITEMS, needExp: needExp, load: loadFor, visible: function (o) { return visible(o); }, plan: function () { return plan(); }, state: function () { return kr; },
    decide: function (c, a) { return decide(c, a); },
    doom: function (c) { return doom(c); },               // 시험용 — 즉사 기믹 초읽기를 바로 띄운다
    kv: kv, shopItem: shopItem, shopSrc: shopSrc, itemSmash: function () { return itemSmash(); }, lastChance: function (t) { return lastChance(t); } };

console.log('[K 의 방] ' + K_CODE + ' — 직업 ' + Object.keys(JOBS).length + ' · 던전 ' + Object.keys(DUNS).length + ' (준비 ' + Object.keys(DUNS).filter(function (d) { return DUNS[d].ready; }).length + ') — kroomState()');

})();
