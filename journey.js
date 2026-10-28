// ==========================================
// ★ 🐾 여정 — 펫 동반 어둠 (2026-10-28)
//   첫 번째: 『 첫번째 여정 - 주인을 찾아서. 』 (D · 1~3인 · 턴제)
// bundles.json 마지막 묶음 — pet-gear.js · plaza.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//   주인이 아니라 **반려동물(펫)이 서술하는** 어둠이다. 1~3명이 각자 펫 하나를 보내고, 주인들은 펫 어깨의
//   바디캠 · 따라다니는 드론으로 본다는 설정. 요괴 · 괴물 · 마수 · 마물 넷을 지나 마지막은 보스.
//   싸움은 펫 배틀처럼 턴제 — 동물마다 공격 스킬 3 · 방어 스킬 2, 낀 장비의 스킬 1 (한 싸움에 한 번).
//   룬은 쓰지 않는다. 장비는 망상 홈쇼핑 🐾 펫 숍의 반려동물용 장비 (pet-gear.js).
//
//   들어가는 문 — 광장 재난관리국 엘리베이터 B2 「여정」(기록 소실 왼쪽) · ☰ 목록 「여정」.
//   하루 **세 번** (journeyUse/<사번> · 자정에 초기화). 「어둠 탐사 +n」 같은 횟수 아이템은 안 먹는다.
//
// ■ 지면
//   펫의 체력이 다하면 **주인이 몸을 날려 대신 맞았다** — 펫은 다치지 않고 집으로 돌아와 한 시간 잔다
//   (pets[번호].jsleep · 그동안 포만도 시계도 멈춘다 — fedAt 을 한 시간 민다). 모두 쓰러지면 여정 실패.
//
// ■ 얻는 것
//   싸움마다 경험치 · 끝까지 가면 경험치 더 (pet-gear.js Lv · Lv 10 이면 등급업) · 35% 로 그 여정의 장비 하나.
//   쓰러진 펫은 그때까지 모은 경험치의 절반.
//
// ■ 적히는 자리
//   journey/lobby/<열쇠>  { at, j, lead, leadName, members: { 사번: { name, key, nick, sp, at } }, run }
//   journey/runs/<열쇠>   { at, j, stage, enc, round, roundAt, lead, order, pets: { 사번: {…} }, mon, pick, log, settled }
//       stage  intro 회상 · fight 싸움 · between 다음 싸움 앞 · win · lose
//   journeyUse/<사번>     { d, n }
//
// ■ 콘솔
//   journeyOpen() · journeyState()

(function journey() {

const NODE = 'journey';
const USE = 'journeyUse';
const DAY_MAX = 3;
const SLEEP_MS = 60 * 60 * 1000;
const PICK_WAIT = 60 * 1000;
const LOBBY_LIVE = 10 * 60 * 1000;
const RUN_LIVE = 2 * 3600 * 1000;
const LOG_KEEP = 40;
const REST_HEAL = 0.3;              // 싸움과 싸움 사이 회복
const OV = 'jr-ov';

// ==========================================
// 동물마다 — 회상 한 줄 · 공격 3 · 방어 2
// ==========================================
//   공격 종류  hit 보통 · heavy 강타(160% · 75% 명중) · multi 두 번(65% 씩) · pierce 방어 무시(110%) · drain 흡수(90% · 40% 회복) · sure 확정(85% · 치명 +25)
//   방어 종류  guard 피해 절반 · dodge 75% 로 피함 · counter 70% 받고 60% 되돌림 · heal 30% 회복 · taunt 적을 끌어 65% 받음
const ATK_T = { hit: { m: 1.0, h: 95 }, heavy: { m: 1.6, h: 75 }, multi: { m: 0.65, h: 90, n: 2 }, pierce: { m: 1.1, h: 90, pierce: 1 }, drain: { m: 0.9, h: 95, drain: 0.4 }, sure: { m: 0.85, h: 100, crit: 25 } };
const DEF_T = { guard: { take: 0.5 }, dodge: { dodge: 75 }, counter: { take: 0.7, reflect: 0.6 }, heal: { heal: 0.3 }, taunt: { take: 0.65, taunt: 1 } };
const GEAR_T = { crit: { atk: 1, m: 1.5, h: 100, crit: 100 }, heavy: { atk: 1, m: 1.8, h: 100 }, dodge: { def: 1, dodge: 100 }, pierce: { atk: 1, m: 1.5, h: 100, pierce: 1 }, guard: { def: 1, take: 0.3, heal: 0.15 } };
const T_NAME = { hit: '보통', heavy: '강타', multi: '두 번', pierce: '방어 무시', drain: '흡수', sure: '확정 명중', guard: '피해 절반', dodge: '피하기', counter: '되받기', heal: '회복', taunt: '끌어오기' };

const RECALL = {
    1: '창틀의 볕이 옮겨 가는 것을 세며 주인이 돌아올 시간을 쟀다. 부르면 안 가는 것은 자존심이지, 기다리지 않아서가 아니었다.',
    2: '항상 주인이 나간 현관문 앞에 앉아 있었다. 발소리가 계단을 오를 때마다 꼬리가 먼저 알았다.',
    3: '작은 몸으로 소파 꼭대기에 올라가 집을 지켰다. 목소리만은 벌써 컸다. 주인이 웃어 줄 때까지 울었다.',
    4: '둥근 몸을 더 둥글게 말고 횃대에서 문 쪽만 봤다. 깃털 속에서 심장이 종종거렸다.',
    5: '주인의 양말을 하나씩 숨겨 두었다. 돌아오면 찾게 하려고. 돌아오지 않으니 숨길 것이 없어졌다.',
    6: '햇볕이 드는 자리에서 자리를 옮기지 않았다. 따뜻한 쪽이 주인이 돌아오는 쪽이라고 믿었다.',
    7: '느릿하게 수조 안에서 주인이 오기만을 기다렸다. 느린 것은 다리뿐이었다.',
    8: '셋이 모여 앉아 있던 창가에 혼자 남았다. 혼자인 걸 들키지 않으려고 더 크게 지저귀었다.',
    9: '볼에 하루치 해바라기씨를 넣고 쳇바퀴를 돌렸다. 돌면 시간이 빨리 가는 줄 알았다.',
    10: '눈을 마주치면 지는 줄 알면서도 현관의 거울을 노려봤다. 거울 속의 것이 먼저 고개를 돌렸다.',
    11: '봉제 인형처럼 구석에 앉아 있었다. 아니다. 숨을 쉬고 있었다. 주인의 베개를 끌어안고.',
    12: '주인의 의자 다리를 감고 있었다. 감는 것이 인사라서, 돌아오면 바로 인사하려고.',
    13: '웃고 있었다. 웃는 게 아닐 수도 있었다. 빈 집에서는 아무도 그 차이를 묻지 않았다.',
    14: '귀를 세우고 다 듣고 있었다. 현관 밖 발소리 가운데 하나만 골라내는 법을 알았다. 그 하나가 오지 않았다.',
    15: '평생 들고 다니던 돌을 주인의 신발 안에 넣어 두었다. 찾으면 웃을 것이다. 찾으러 와야 한다.',
    16: '아직 아무것도 몰랐다. 그래서 겁도 없이 문을 쪼았다. 열리지 않는다는 것도 몰랐다.',
    17: '늘 화가 나 있었다. 지금은 더 나 있었다. 문이 열리면 짖으려고 목을 아껴 두었다.',
    18: '가장 높은 책장 위에서 내려다봤다. 내려올 때는 소리가 안 나니까, 주인이 들어오는 순간 바로 내려앉으려고.',
    19: '웃는 얼굴로 수면 위를 돌았다. 기분과는 무관했다. 주인이 없는 물은 조금 더 차가웠다.',
    20: '밤에만 눈이 커졌다. 주인이 돌아오던 시간이 밤이었으니까. 낮에는 자는 척했다.',
    21: '주인이 적어 둔 쪽지를 먹었다. 중요한 것부터. 「금방 올게」가 제일 먼저였다.',
    22: '달이 없는 날에도 울었다. 멀리서 들으라고. 돌아오는 길을 잃지 말라고.',
    23: '세고 있으면 잠이 왔다. 세 마리째에서 졌다. 꿈에서는 주인이 세어 주었다.',
    24: '손에 앉았다가, 손을 보면 없었다. 이번에는 손이 없었다. 창문 안쪽에서 날개를 접고 기다렸다.',
    25: '한 번 정한 사람 곁에서 떨어지지 않는다. 그 사람이 없는 곁은 곁이 아니었다. 빈 어깨를 부리로 찾았다.'
};
// 돌아온 몰골 — 동물마다 (꼬질꼬질한데, 주인이 기뻐하는 얼굴을 보고 싶어 한다)
const HOME = {
    1: '털이 먼지로 회색이 됐고 수염 하나가 꺾였다. 그런데도 발치의 것을 앞발로 한 번 밀어 보이고는 고개를 홱 돌린다. 칭찬은 그쪽에서 먼저 하라는 뜻이다.',
    2: '온몸이 흙투성이에 귀 한쪽이 뒤집혀 있다. 꼬리가 바닥을 쓸어 흙이 날린다. 주인이 웃기만 기다리는 얼굴로 숨을 헐떡인다.',
    3: '갈기가 될 자리에 가시가 잔뜩 엉겨 붙었다. 그래도 가슴을 쭉 펴고 앉아 주인을 올려다본다. 울지는 않는다. 칭찬받을 때까지 참는다.',
    4: '깃털이 사방으로 뻗쳐 두 배는 둥글어졌다. 발치의 것 위에 올라앉아 주인 쪽으로 종종 뛴다. 봤느냐고, 봤느냐고.',
    5: '코끝이 새까맣고 꼬리에 가시 하나가 꽂혀 있다. 가져온 것을 내려놓고도 한 발을 그 위에 올려 둔다. 주인이 웃어야 발을 뗄 모양이다.',
    6: '비늘 사이사이에 모래가 끼었다. 햇볕 드는 자리 대신 주인 발등 위에 올라와 가만히 눈을 깜빡인다. 그게 전부다. 그게 제일 큰 애교다.',
    7: '등딱지에 긁힌 자국이 길게 났다. 느릿하게 목을 뺐다 넣었다 하며 주인의 얼굴을 올려다본다. 기뻐하는 것을 확인할 때까지 들어가지 않는다.',
    8: '깃털이 한 움큼 빠졌고 발에 진흙이 굳었다. 가져온 것 옆에서 폴짝폴짝 뛰며 쉬지 않고 지저귄다. 혼자서 셋 몫을 떠든다.',
    9: '볼주머니가 양쪽 다 터질 듯 부풀었다 — 반은 여정에서 주운 것, 반은 그냥 씨앗이다. 주인 손바닥에 올라가 볼을 비운다. 다 드리는 것이다.',
    10: '흰 털이 잿빛이 됐고 줄무늬가 흐려졌다. 그래도 눈은 똑바로 주인을 본다. 눈을 먼저 돌리는 쪽이 지는데, 오늘은 주인이 웃을 때까지 봐 줄 생각이다.',
    11: '온몸에 검불이 붙어 봉제 인형이 아니라 걸레 인형 같다. 가져온 것을 내려놓고 그대로 주인에게 기대 눕는다. 무겁다. 기쁜 얼굴 한 번이면 비켜 줄 것이다.',
    12: '비늘이 살짝 벗겨졌다. 하지만 날름거리는 혀와 하트로 만든 꼬리가 칭찬해 달라는 것 같다.',
    13: '꼬리털이 반쯤 젖어 축 늘어졌다. 그래도 웃고 있다. 이번에는 웃는 게 맞다. 주인이 같이 웃는지 곁눈으로 확인한다.',
    14: '귀 끝에 흙이 묻고 뒷발이 까맣다. 가져온 것을 내려놓고 코를 빠르게 씰룩인다. 칭찬이 오기 전까지는 귀를 내리지 않는다.',
    15: '털이 뭉쳐 고슴도치 같다. 평생 들고 다니던 돌 대신 가져온 것을 가슴에 안았다가, 주인 앞에 내려놓는다. 돌보다 소중한 것은 처음이다.',
    16: '솜털이 잿빛이 되고 부리 끝이 조금 까졌다. 가져온 것이 저보다 크다. 그 위에 올라앉아 삐약, 한 번 운다. 칭찬은 당연히 받는 줄 안다.',
    17: '온몸이 흙투성이에 눈만 반짝인다. 여전히 화가 나 있는 얼굴이지만, 꼬리가 먼저 사실을 말한다. 주인이 기뻐하면 짖는 것을 참을 생각이다.',
    18: '날개깃 하나가 꺾였고 발톱에 흙이 끼었다. 가져온 것을 정확히 주인 발끝에 떨어뜨리고 높은 곳으로 올라가 내려다본다. 칭찬은 거기서 듣겠다는 뜻이다.',
    19: '등이 말라 하얗게 트고 웃는 얼굴에 모래가 묻었다. 기분과 무관하게 늘 웃는 얼굴인데, 오늘은 기분도 같다. 주인이 웃어야 물에 들어갈 것이다.',
    20: '깃털이 뻗쳐 두 배로 부풀었고 눈 둘레가 까맣다. 낮인데 눈이 크다. 주인이 기뻐하는 얼굴을 놓치지 않으려고.',
    21: '수염에 가시가 엉기고 뿔에 종이가 걸렸다. 가져온 것을 내려놓고 주인의 소매 끝을 살짝 씹는다. 먹는 게 아니다. 봐 달라는 것이다.',
    22: '털이 뭉치고 앞발에 진흙이 굳었다. 가져온 것을 내려놓고 낮게, 아주 낮게 운다. 달 없는 밤의 그 소리가 아니라 — 돌아왔다는 소리다.',
    23: '양털이 검불투성이라 굴러온 덤불 같다. 발치에 것을 내려놓고 주인 다리에 머리를 기댄다. 세어 주지 않아도 벌써 졸리다. 칭찬은 자기 전에 듣고 싶다.',
    24: '날개 끝이 조금 찢어지고 가루가 벗겨졌다. 물고 올 입이 없어 발로 들고 왔다. 주인 손등에 내려앉아 날개를 천천히 두 번 접었다 편다. 봐 달라는 것이다.',
    25: '깃털이 흐트러지고 부리 끝이 흙으로 까맣다. 가져온 것을 내려놓자마자 빈 어깨로 날아올라 귀에 대고 떠든다. 칭찬이 올 때까지 멈출 생각이 없다.'
};
const SK = {
    1:  { a: [['냥펀치', 'hit'], ['할퀴기', 'multi'], ['숨었다 덮치기', 'sure']],          d: [['등 세우기', 'counter'], ['상자 속으로', 'dodge']] },
    2:  { a: [['돌진 안기기', 'heavy'], ['물고 늘어지기', 'drain'], ['짖기', 'hit']],        d: [['앞에 서기', 'taunt'], ['공 물어오기', 'heal']] },
    3:  { a: [['포효', 'sure'], ['앞발 내리치기', 'heavy'], ['물기', 'hit']],               d: [['갈기 세우기', 'guard'], ['으르렁', 'taunt']] },
    4:  { a: [['종종걸음 습격', 'multi'], ['쪼기', 'hit'], ['깃털 폭풍', 'sure']],           d: [['깃털 속으로', 'dodge'], ['둥글게 말기', 'guard']] },
    5:  { a: [['훔쳐 달아나기', 'drain'], ['날렵한 물기', 'multi'], ['급소 찌르기', 'pierce']], d: [['그림자 숨기', 'dodge'], ['되받아치기', 'counter']] },
    6:  { a: [['꼬리 후리기', 'hit'], ['혀 찌르기', 'pierce'], ['볕 모아 치기', 'heavy']],     d: [['꼬리 자르기', 'dodge'], ['바위 흉내', 'guard']] },
    7:  { a: [['등딱지 박치기', 'heavy'], ['물기', 'hit'], ['느린 돌진', 'sure']],            d: [['등딱지 속으로', 'guard'], ['버티기', 'taunt']] },
    8:  { a: [['떼 지저귐', 'multi'], ['쪼기', 'hit'], ['급강하 쪼기', 'pierce']],            d: [['흩어지기', 'dodge'], ['지저귀어 기운 내기', 'heal']] },
    9:  { a: [['볼주머니 폭탄', 'heavy'], ['앞니 갉기', 'multi'], ['씨앗 던지기', 'hit']],     d: [['굴 속으로', 'dodge'], ['볼 채우기', 'heal']] },
    10: { a: [['흰 섬광', 'heavy'], ['앞발 내리치기', 'hit'], ['목덜미 물기', 'pierce']],      d: [['노려보기', 'taunt'], ['줄무늬 흐리기', 'dodge']] },
    11: { a: [['곰 포옹', 'heavy'], ['앞발 후리기', 'hit'], ['벌꿀 핥기', 'drain']],           d: [['버티기', 'guard'], ['앞에 서기', 'taunt']] },
    12: { a: [['조이기', 'drain'], ['독니', 'pierce'], ['꼬리 치기', 'hit']],                  d: [['똬리 틀기', 'counter'], ['풀 속으로', 'dodge']] },
    13: { a: [['홀리기', 'sure'], ['물기', 'hit'], ['꼬리 세 번', 'multi']],                   d: [['웃어 넘기기', 'dodge'], ['꼬리 감싸기', 'guard']] },
    14: { a: [['뒷발차기', 'heavy'], ['앞니 갉기', 'multi'], ['뛰어 들이받기', 'hit']],        d: [['굴로 뛰기', 'dodge'], ['귀 접고 웅크리기', 'guard']] },
    15: { a: [['돌 던지기', 'pierce'], ['물기', 'hit'], ['물장구', 'multi']],                  d: [['물속으로', 'dodge'], ['돌 껴안기', 'heal']] },
    16: { a: [['삐약 공세', 'multi'], ['쪼기', 'hit'], ['겁 없는 돌진', 'sure']],              d: [['날개 밑으로', 'heal'], ['둥글게 말기', 'guard']] },
    17: { a: [['광폭화', 'heavy'], ['물기', 'hit'], ['짖어 대기', 'sure']],                    d: [['으르렁', 'taunt'], ['뒤로 물러서기', 'dodge']] },
    18: { a: [['급강하', 'pierce'], ['발톱', 'multi'], ['날개 치기', 'hit']],                  d: [['바람 타기', 'dodge'], ['날개 세우기', 'counter']] },
    19: { a: [['초음파', 'sure'], ['꼬리 치기', 'heavy'], ['들이받기', 'hit']],                d: [['물결 타기', 'dodge'], ['숨 고르기', 'heal']] },
    20: { a: [['소리 없는 활강', 'pierce'], ['발톱', 'hit'], ['날개 후리기', 'heavy']],        d: [['깃털 세우기', 'guard'], ['고개 돌리기', 'dodge']] },
    21: { a: [['들이받기', 'heavy'], ['뿔로 밀기', 'hit'], ['뒷발질', 'multi']],               d: [['버티기', 'guard'], ['되받기', 'counter']] },
    22: { a: [['하울링', 'sure'], ['물어뜯기', 'heavy'], ['연속 물기', 'multi']],              d: [['앞에 서기', 'taunt'], ['되물기', 'counter']] },
    23: { a: [['양털 돌진', 'hit'], ['들이받기', 'heavy'], ['뛰어오르기', 'sure']],            d: [['양털 뭉치기', 'guard'], ['꾸벅 졸기', 'heal']] },
    24: { a: [['인분 흩뿌리기', 'sure'], ['날개 치기', 'multi'], ['더듬이 찌르기', 'pierce']],  d: [['바람에 흩어지기', 'dodge'], ['날개 접기', 'guard']] },
    25: { a: [['고성방가', 'sure'], ['부리 쪼기', 'multi'], ['날개 치기', 'hit']],             d: [['어깨 뒤로', 'dodge'], ['깃 고르기', 'heal']] }
};

// ==========================================
// 여정 — 지금은 하나
// ==========================================
const JOURNEYS = {
    j1: {
        id: 'j1', n: '첫번째 여정 - 주인을 찾아서.', g: 'D', ic: '🐾',
        xpFight: [8, 10, 12, 14, 20], xpClear: 30, drop: 0.35, pts: 20000,
        // 끝까지 가서 돌아온 펫 — 가져온 것 한 줄 ({n} 은 펫 이름) · 꼬질꼬질한 몰골은 동물마다 (HOME)
        home: '{n}이(가) 여정에서 가져온 것을 주인 앞에 내려놓았다 — 20,000 P.',
        open: ['현관문이 열려 있었다. 언제부터인지는 모른다.',
               '주인의 냄새가 문지방을 넘어 밖으로 이어져 있었다. 우리는 각자의 집에서 같은 냄새를 따라 나왔다.',
               '어깨 위의 작은 기계가 깜빡였다 — 주인들이 보고 있다는 뜻이라고, 누군가 그랬다. 그러니까 찾아야 한다. 보고 있는 그 사람을.'],
        enc: [
            { kind: '요괴', n: '문틈 요괴', hp: 45, atk: 7, def: 1, mv: ['문틈으로 긴 손을 뻗는다', '문을 쾅 닫는다'],
              in: '첫 골목. 어느 집 문틈에서 길쭉한 것이 나와 냄새를 가로막았다. 문틈에 사는 것은 문을 열어 주지 않는다.',
              out: '문틈이 닫혔다. 냄새가 다시 이어진다.' },
            { kind: '괴물', n: '젖은 신발 괴물', hp: 55, atk: 8, def: 2, mv: ['젖은 발로 밟는다', '신발끈으로 휘감는다'],
              in: '비 온 자리. 누군가 벗어 둔 신발이 저 혼자 걸어와 길을 막았다. 주인의 것이 아니다. 주인은 신발을 벗어 두고 가지 않는다.',
              out: '신발이 쓰러져 더는 걷지 않았다. 우리는 그 옆을 지났다. 냄새는 젖지 않았다.' },
            { kind: '마수', n: '골목 마수', hp: 65, atk: 9, def: 2, mv: ['송곳니로 문다', '꼬리로 후려친다'],
              in: '골목 끝. 개도 고양이도 아닌 것이 네 발로 서서 이쪽을 봤다. 먼저 보는 쪽이 이긴다. 우리가 먼저 봤다.',
              out: '마수가 담을 넘어 사라졌다. 골목이 다시 조용해졌다. 어깨 위 기계가 한 번 더 깜빡였다. 보고 있다.' },
            { kind: '마물', n: '가로등 마물', hp: 70, atk: 10, def: 3, mv: ['빛을 떨어뜨린다', '그림자를 늘인다'],
              in: '가로등 아래. 불빛이 아니라 불빛 모양을 한 것이 매달려 있었다. 그 아래를 지나는 것은 다 그림자가 길어진다. 우리 그림자가 벌써 주인만큼 길다.',
              out: '불빛이 꺼졌다. 그림자가 제 길이로 돌아왔다. 냄새가 바로 저 앞에서 끝난다.' },
            { kind: '보스', n: '주인의 냄새를 입은 것', hp: 170, atk: 12, def: 3, boss: 1, mv: ['주인의 목소리로 부른다', '뒤에서 끌어안는다', '냄새를 벗어 던진다'],
              in: '냄새가 끝나는 자리에 그것이 서 있었다. 주인의 냄새를 입고, 주인의 걸음으로, 주인이 아닌 것이. 어깨 위 기계가 쉬지 않고 깜빡였다. 주인들이 뭐라고 소리치는지는 들리지 않았다. 들리지 않아도 안다 — 그건 내가 아니야.',
              out: '그것이 입고 있던 냄새가 벗겨져 바닥에 떨어졌다. 안에는 아무것도 없었다. 우리는 그 냄새를 하나씩 물고 집으로 돌아왔다.<br><br>현관문 앞에 — 주인이 서 있었다. 어깨 위의 기계를 떼어 내며 주인은 아무 말도 하지 않았다. 그저 오래 쓰다듬었다.' }
        ],
        lose: '쓰러지는 순간 어깨 위 기계가 꺼졌다. 그리고 — 주인이 몸을 날려 대신 맞았다. 어떻게 거기까지 왔는지는 묻지 않았다.<br>집으로 돌아와 주인의 무릎 위에서 한 시간을 잤다. 다친 데는 없다. 다만 한 시간이다.'
    }
};

// ==========================================
// 바탕
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function P() { return window.PET; }
function G() { return window.PETGEAR; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t); }
function log_(t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { } }
function now() { try { return P().now(); } catch (e) { return Date.now(); } }
function today() { try { return P().today(); } catch (e) { return new Date().toDateString(); } }
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }
function ready() { return !!(window.PET && window.PETGEAR && window.PETTRAIT); }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }
function nickOf(code, key) { try { return P().nick(key, users()[code] || (u_() && u_().code === code ? u_() : {})); } catch (e) { return (P().BY[key] || {}).n || '펫'; } }

// ==========================================
// 하루 세 번
// ==========================================
const UC = { code: '', ref: null, v: null, ready: false };
function useBind() {
    const u = u_(), d = db_();
    if (!u || !u.code || !d || UC.code === u.code) return;
    try { if (UC.ref) UC.ref.off(); } catch (e) { }
    UC.code = u.code; UC.v = null; UC.ready = false;
    UC.ref = d.ref(USE + '/' + u.code);
    UC.ref.on('value', function (s) { UC.v = s.val() || null; UC.ready = true; try { if (document.getElementById(OV) && view === 'list') paint(); } catch (e) { } });
}
setInterval(function () { try { useBind(); } catch (e) { } }, 1500);
function usedToday() { const v = UC.v; return (v && v.d === today()) ? Math.max(0, Number(v.n) || 0) : 0; }
function triesLeft() { return Math.max(0, DAY_MAX - usedToday()); }
function useOne(code) {
    const d = db_(); if (!d) return Promise.resolve(false);
    const t = today();
    return d.ref(USE + '/' + code).transaction(function (c) {
        const n = (c && c.d === t) ? Math.max(0, Number(c.n) || 0) : 0;
        return { d: t, n: n + 1 };
    }).then(function (r) { return !!(r && r.committed); }).catch(function () { return false; });
}

// ==========================================
// 내 펫 — 갈 수 있는 것
// ==========================================
function myPets() {
    const u = u_();
    if (!u) return [];
    const ps = P().pets(u), t = now();
    if (P().asleep && P().asleep(u)) return [];
    return Object.keys(ps).filter(function (k) {
        const s = ps[k];
        if (!s || !P().BY[k]) return false;
        if (s.out && s.out.till && s.out.till > t) return false;
        if (s['with']) return false;
        if (s.hurt) return false;
        if ((Number(s.jsleep) || 0) > t) return false;
        return true;
    }).sort(function (a, b) { return Number(a) - Number(b); });
}
// 여정에 보낼 펫 한 마리의 전투 수치 — 그 사원의 기록으로
function build(code, key) {
    const u = (u_() && u_().code === code) ? u_() : (users()[code] || null);
    if (!u) return null;
    const st = G().stats(key, u);
    const sp = P().BY[key] || {};
    const sk = SK[Number(key)] || SK[1];
    const gear = G().BY[st.gear] || null;
    return { code: code, name: u.name || code, key: String(key), sp: sp.n || '', nick: P().nick(key, u),
             hp: st.max, max: st.max, atk: st.atk, def: st.def, eva: st.eva, crit: st.crit, gim: st.gim,
             gear: st.gear || '', gsk: gear ? gear.sk.t : '', gskn: gear ? gear.sk.n : '', gused: 0, ko: 0, xp: 0,
             a: sk.a, d: sk.d };
}

// ==========================================
// 듣기 — 방 · 여정
// ==========================================
const live = { lobby: {}, runs: {} };
let watching = false;
function watch() {
    const d = db_();
    if (!d || watching) return;
    watching = true;
    d.ref(NODE + '/lobby').on('value', function (s) { live.lobby = s.val() || {}; try { onChange(); } catch (e) { console.warn('[여정]', e); } });
    d.ref(NODE + '/runs').on('value', function (s) { live.runs = s.val() || {}; try { onChange(); } catch (e) { console.warn('[여정]', e); } });
}
setInterval(function () { try { if (ready()) watch(); } catch (e) { } }, 1500);
function myLobby() {
    const me = u_(); if (!me) return null;
    let best = null;
    Object.keys(live.lobby).forEach(function (k) {
        const o = live.lobby[k];
        if (!o || o.run || !o.members || !o.members[me.code]) return;
        if (now() - Number(o.at || 0) > LOBBY_LIVE) return;
        if (!best || o.at > best.at) best = Object.assign({ _k: k }, o);
    });
    return best;
}
function myRun() {
    const me = u_(); if (!me) return null;
    let best = null;
    Object.keys(live.runs).forEach(function (k) {
        const o = live.runs[k];
        if (!o || !o.pets || !o.pets[me.code]) return;
        if (now() - Number(o.at || 0) > RUN_LIVE) return;
        if (!best || o.at > best.at) best = Object.assign({ _k: k }, o);
    });
    return best;
}
function runAlive(o) { return !!o && ['intro', 'fight', 'between'].indexOf(o.stage) >= 0; }
function petsOf(o) { const out = []; (o.order || Object.keys(o.pets || {})).forEach(function (c) { if (o.pets && o.pets[c]) out.push(o.pets[c]); }); return out; }
function logArr(o) { const l = o && o.log; if (Array.isArray(l)) return l.filter(Boolean); if (l && typeof l === 'object') return Object.keys(l).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return l[k]; }).filter(Boolean); return []; }
function tx(key, fn) { const d = db_(); return d ? d.ref(NODE + '/runs/' + key).transaction(fn) : Promise.resolve(null); }

let shownTag = '';
let view = '';                      // 지금 창에 보이는 것 — list · lobby · run · end
function onChange() {
    const me = u_();
    if (!me || !ready()) return;
    sweep();
    settleSweep();
    const r = myRun();
    if (r && runAlive(r)) {
        if (inDark()) return;
        if (r.stage === 'fight' && allPicked(r)) { resolve(r); return; }
        const tag = [r._k, r.stage, r.enc, r.round, JSON.stringify(r.pick || {}), logArr(r).length, JSON.stringify(petsOf(r).map(function (p) { return [p.hp, p.ko]; })), (r.mon || {}).hp].join('|');
        if (tag === shownTag && document.getElementById(OV) && view === 'run') return;
        shownTag = tag;
        paintRun(r);
        return;
    }
    if (document.getElementById(OV) && (view === 'list' || view === 'lobby')) paint();   // 끝 화면(end) 은 덮지 않는다
}
setInterval(function () { try { if (ready() && watching) onChange(); } catch (e) { } }, 5000);

// 묵은 방 · 끝난 여정
function sweep() {
    const d = db_(); if (!d) return;
    const t = now();
    Object.keys(live.lobby).forEach(function (k) { const o = live.lobby[k]; if (!o || t - Number(o.at || 0) > LOBBY_LIVE) d.ref(NODE + '/lobby/' + k).remove().catch(function () { }); });
    Object.keys(live.runs).forEach(function (k) { const o = live.runs[k]; if (!o || t - Number(o.at || 0) > RUN_LIVE) d.ref(NODE + '/runs/' + k).remove().catch(function () { }); });
}

// ==========================================
// 화면
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const GOLD = ' background:linear-gradient(145deg,#6b4a1d,#38250e) !important; border-color:#ffd766 !important; color:#ffe9bd !important;';
function shut() { const m = document.getElementById(OV); if (m) m.remove(); shownTag = ''; }
function box(html) {
    let w = document.getElementById(OV);
    if (!w) {
        w = document.createElement('div');
        w.id = OV;
        w.style.cssText = 'position:fixed; inset:0; z-index:999990; display:flex; align-items:center; justify-content:center; background:rgba(4,3,6,0.94); padding:12px;';
        document.body.appendChild(w);
    }
    w.innerHTML = '<div style="background:linear-gradient(160deg,#141018,#0a080c); border:1px solid #6a5a8a; border-radius:12px; padding:14px; width:100%; max-width:460px; max-height:92dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; box-shadow:0 8px 30px rgba(0,0,0,0.8); color:#e8e2f0;">' + html + '</div>';
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#c9b8ff; font-weight:bold; margin-bottom:4px;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:10px; color:#7f7898; margin-bottom:11px; line-height:1.6;">' + sub + '</div>' : '');
}
function petRow(p, mine) {
    const pct = Math.max(0, Math.min(100, Math.round((Number(p.hp) || 0) / (Number(p.max) || 1) * 100)));
    return '<div style="display:flex; align-items:center; gap:8px; padding:5px 0; opacity:' + (p.ko ? '.45' : '1') + ';">'
        + '<img src="' + P().icon(p.key) + '" alt="" style="width:30px; height:30px; object-fit:contain; image-rendering:pixelated; flex:0 0 auto;">'
        + '<div style="flex:1; min-width:0;"><div style="display:flex; justify-content:space-between; font-size:10.5px;"><span style="color:' + (mine ? '#ffcf8f' : '#e8e2f0') + ';">' + esc(p.nick) + ' <span style="color:#7f7898;">· ' + esc(p.name) + '</span></span><span style="color:#9fd8ef;">' + (p.ko ? '주인이 대신 맞았다' : (p.hp + ' / ' + p.max)) + '</span></div>'
        + '<div style="height:6px; background:#241f2e; border-radius:3px; overflow:hidden; margin-top:3px;"><div style="height:100%; width:' + pct + '%; background:' + (pct > 40 ? '#6fcf97' : '#ff8a80') + ';"></div></div></div></div>';
}

// ── 목록 · 방
function paint() {
    const me = u_();
    if (!me) return;
    const lob = myLobby();
    if (lob) { paintLobby(lob); return; }
    view = 'list';
    const J = JOURNEYS.j1;
    const open = Object.keys(live.lobby).map(function (k) { return Object.assign({ _k: k }, live.lobby[k]); })
        .filter(function (o) { return o && !o.run && o.members && Object.keys(o.members).length < 3 && now() - Number(o.at || 0) <= LOBBY_LIVE; })
        .sort(function (a, b) { return b.at - a.at; });
    const left = triesLeft();
    const w = box(head('🐾 여정', '펫이 주인을 대신해 떠나는 어둠. 1~3명이 펫 하나씩. 주인은 바디캠으로 본다.<br>오늘 남은 횟수 <b style="color:#ffcf8f;">' + left + ' / ' + DAY_MAX + '</b> — 횟수를 늘리는 물건은 듣지 않습니다.')
        + '<div style="border:1px solid #4a3f6a; border-radius:8px; padding:11px; margin-bottom:10px; background:rgba(90,70,130,.10);">'
        + '<div style="font-size:12px; color:#e8e2f0; font-weight:bold;">『 ' + esc(J.n) + ' 』 <span style="font-size:10px; color:#c9a227;">' + J.g + ' 등급</span></div>'
        + '<div style="font-size:10px; color:#9f98b8; margin-top:4px; line-height:1.6;">요괴 · 괴물 · 마수 · 마물 넷, 마지막은 보스. 동물마다 공격 3 · 방어 2, 낀 장비의 스킬 1.<br>지면 주인이 몸을 날려 대신 맞는다 — 펫은 멀쩡하고 한 시간 잔다.<br>끝까지 가면 펫이 <b style="color:#ffcf8f;">20,000 P</b> 를 물고 온다 · 등급업 조각(D → C) 세 가지가 길에 놓여 있다 — '
        + ((G().SHARDS || {})[J.g] || []).map(function (x) { return '<span style="color:' + (G().shardHave(x.n, me) ? '#d4af37' : '#5f5878') + ';">' + esc(x.n.replace(/^🧩 /, '')) + '</span>'; }).join(' · ') + ' <span style="color:#7f7898;">(' + G().shardCount(J.g, me) + '/3)</span></div>'
        + '<div style="display:flex; gap:6px; margin-top:9px;">'
        + '<button id="jr-solo" class="game-btn" style="flex:1; margin:0; padding:10px; font-size:11px;' + (left ? '' : ' opacity:.4;') + '"' + (left ? '' : ' disabled') + '>혼자 떠난다</button>'
        + '<button id="jr-make" class="game-btn" style="flex:1; margin:0; padding:10px; font-size:11px;' + (left ? '' : ' opacity:.4;') + '"' + (left ? '' : ' disabled') + '>방을 만든다</button></div></div>'
        + '<div style="font-size:10px; color:#7f7898; margin-bottom:5px;">열린 방 — 같이 떠날 동료를 기다리는 중</div>'
        + (open.length ? open.map(function (o) {
            const ms = Object.keys(o.members).map(function (c) { return o.members[c]; });
            return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
                + '<div style="flex:1; min-width:0; font-size:11px;"><span style="color:#e8e2f0;">' + esc(o.leadName) + ' 사원의 방</span> <span style="color:#7f7898;">· ' + ms.length + '/3 · ' + esc(ms.map(function (m) { return m.nick; }).join(' · ')) + '</span></div>'
                + '<button class="game-btn jr-join" data-k="' + esc(o._k) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;"' + (left ? '' : ' disabled') + '>들어간다</button></div>';
        }).join('') : '<div style="font-size:10.5px; color:#5f5878; padding:6px 0 10px 0;">열린 방이 없습니다.</div>')
        + '<button id="jr-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">닫는다</button>');
    w.querySelector('#jr-x').onclick = shut;
    const solo = w.querySelector('#jr-solo'); if (solo) solo.onclick = function () { pickPet(function (key) { startRun([{ code: me.code, key: key }]); }); };
    const mk = w.querySelector('#jr-make'); if (mk) mk.onclick = function () { pickPet(function (key) { makeLobby(key); }); };
    Array.prototype.forEach.call(w.querySelectorAll('.jr-join'), function (b) { b.onclick = function () { pickPet(function (key) { joinLobby(b.dataset.k, key); }); }; });
}
function pickPet(cb) {
    const me = u_();
    if (inDark()) { alert_('어둠 탐사 중에는 떠날 수 없습니다.'); return; }
    if (!triesLeft()) { alert_('오늘 여정은 ' + DAY_MAX + '번까지입니다.'); return; }
    const keys = myPets();
    if (!keys.length) { alert_('보낼 수 있는 펫이 없습니다.\n(탐사 중 · 동행 중 · 다친 펫 · 여정 뒤 자는 펫은 못 갑니다)'); return; }
    view = 'pick';
    const w = box(head('보낼 펫', '펫 하나가 떠납니다. 낀 장비의 스킬을 한 싸움에 한 번 씁니다.')
        + '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:9px;">'
        + keys.map(function (k) {
            const st = G().stats(k, me);
            return '<button class="game-btn jr-pet" data-k="' + esc(k) + '" style="margin:0; padding:8px 4px; font-size:10px; display:flex; flex-direction:column; align-items:center; gap:3px;">'
                + '<img src="' + P().icon(k) + '" alt="" style="width:40px; height:40px; object-fit:contain; image-rendering:pixelated;">'
                + '<span style="max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(P().nick(k, me)) + '</span>'
                + '<span style="font-size:8.5px; color:#8d8578;">Lv ' + st.lv + ' · 체력 ' + st.max + (st.gear ? ' · 장비' : '') + '</span></button>';
        }).join('') + '</div>'
        + '<button id="jr-back" class="game-btn" style="' + BTN + GREY + '">돌아간다</button>');
    w.querySelector('#jr-back').onclick = paint;
    Array.prototype.forEach.call(w.querySelectorAll('.jr-pet'), function (b) { b.onclick = function () { cb(b.dataset.k); }; });
}
function makeLobby(key) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    view = 'list';                                   // 방이 서면 듣는 쪽이 방 화면으로 바꿔 그린다
    const k = 'l' + Date.now() + Math.floor(Math.random() * 1000);
    const m = {}; m[me.code] = { name: me.name, key: String(key), nick: P().nick(key, me), sp: (P().BY[key] || {}).n || '', at: Date.now() };
    d.ref(NODE + '/lobby/' + k).set({ at: Date.now(), j: 'j1', lead: me.code, leadName: me.name, members: m });
}
function joinLobby(k, key) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    view = 'list';
    d.ref(NODE + '/lobby/' + k).transaction(function (cur) {
        if (!cur || cur.run) return;
        cur.members = cur.members || {};
        if (!cur.members[me.code] && Object.keys(cur.members).length >= 3) return;
        cur.members[me.code] = { name: me.name, key: String(key), nick: P().nick(key, me), sp: (P().BY[key] || {}).n || '', at: Date.now() };
        return cur;
    }).then(function (r) { if (!r || !r.committed) alert_('그 방에는 들어갈 수 없습니다. (찼거나 이미 떠났습니다)'); });
}
function paintLobby(o) {
    const me = u_(), d = db_();
    view = 'lobby';
    const lead = o.lead === me.code;
    const ms = Object.keys(o.members).map(function (c) { return Object.assign({ code: c }, o.members[c]); }).sort(function (a, b) { return a.at - b.at; });
    const w = box(head('🐾 여정 — ' + o.leadName + ' 사원의 방', '『 ' + esc(JOURNEYS[o.j || 'j1'].n) + ' 』 · 셋까지. ' + (lead ? '다 모이면 「출발」을 누릅니다.' : '방장이 출발하기를 기다리는 중…'))
        + ms.map(function (m) {
            return '<div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-top:1px solid rgba(255,255,255,0.06);">'
                + '<img src="' + P().icon(m.key) + '" alt="" style="width:30px; height:30px; object-fit:contain; image-rendering:pixelated;">'
                + '<div style="font-size:11px;"><span style="color:' + (m.code === me.code ? '#ffcf8f' : '#e8e2f0') + ';">' + esc(m.nick) + '</span> <span style="color:#7f7898;">· ' + esc(m.sp) + ' · ' + esc(m.name) + ' 사원' + (m.code === o.lead ? ' · 방장' : '') + '</span></div></div>';
        }).join('')
        + '<div style="margin-top:10px;">'
        + (lead ? '<button id="jr-go" class="game-btn" style="' + BTN + GOLD + '">출발 — ' + ms.length + '마리</button><button id="jr-del" class="game-btn" style="' + BTN + GREY + '">방을 없앤다</button>'
                : '<button id="jr-leave" class="game-btn" style="' + BTN + GREY + '">나간다</button>')
        + '</div>');
    const go = w.querySelector('#jr-go'); if (go) go.onclick = function () { startRun(ms.map(function (m) { return { code: m.code, key: m.key }; }), o._k); };
    const del = w.querySelector('#jr-del'); if (del) del.onclick = function () { d.ref(NODE + '/lobby/' + o._k).remove(); shut(); };
    const lv = w.querySelector('#jr-leave'); if (lv) lv.onclick = function () { d.ref(NODE + '/lobby/' + o._k + '/members/' + me.code).remove(); shut(); };
}

// 괴물 — 몇 마리가 갔느냐에 따라 (혼자면 약하게 · 셋이면 그대로)
const SCALE = { 1: { hp: 0.5, atk: 0.7 }, 2: { hp: 0.95, atk: 1.0 }, 3: { hp: 1.35, atk: 1.15 } };
function monOf(J, i, n) {
    const e = J.enc[i]; if (!e) return null;
    const sc = SCALE[Math.max(1, Math.min(3, n))] || SCALE[3];
    const hp = Math.round(e.hp * sc.hp), atk = Math.round(e.atk * sc.atk * 10) / 10;
    return { n: e.n, kind: e.kind, hp: hp, max: hp, atk: atk, def: e.def, boss: e.boss ? 1 : 0 };
}

// ==========================================
// 출발
// ==========================================
function startRun(members, lobbyKey) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    if (inDark()) { alert_('어둠 탐사 중에는 떠날 수 없습니다.'); return; }
    const J = JOURNEYS.j1;
    const pets = {}, order = [];
    for (let i = 0; i < members.length; i++) {
        const p = build(members[i].code, members[i].key);
        if (!p) { alert_(members[i].code + ' 사원의 펫 기록을 못 읽었습니다.'); return; }
        pets[p.code] = p; order.push(p.code);
    }
    const k = 'r' + Date.now() + Math.floor(Math.random() * 1000);
    const run = { at: Date.now(), j: J.id, stage: 'intro', enc: 0, round: 1, roundAt: Date.now(), lead: me.code, order: order, pets: pets, n: order.length,
                  mon: monOf(J, 0, order.length), log: [] };
    d.ref(NODE + '/runs/' + k).set(run).then(function () {
        order.forEach(function (c) { useOne(c); });                              // 하루 세 번 — 방장이 모두의 몫을 센다
        if (lobbyKey) d.ref(NODE + '/lobby/' + lobbyKey).remove().catch(function () { });
        order.forEach(function (c) {
            const t = (c === me.code) ? me : users()[c];
            if (!t) return;
            try {
                if (typeof addHistoryLog === 'function') addHistoryLog(t, '[여정] 『 ' + J.n + ' 』 — ' + pets[c].nick + josa(pets[c].nick, '이') + ' 떠났습니다.');
                if (c === me.code) saveFields({ history: 1 }); else if (typeof updateUserFields === 'function') updateUserFields(c, { history: t.history });
            } catch (e) { }
        });
    });
}

// ==========================================
// 여정 화면
// ==========================================
function paintRun(r) {
    const me = u_();
    view = 'run';
    const J = JOURNEYS[r.j] || JOURNEYS.j1;
    const mine = r.pets[me.code];
    if (r.stage === 'intro') {
        const w = box(head('『 ' + J.n + ' 』', J.g + ' 등급 · ' + petsOf(r).length + '마리 · 주인들은 바디캠으로 본다')
            + petsOf(r).map(function (p) {
                return '<div style="display:flex; gap:9px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
                    + '<img src="' + P().icon(p.key) + '" alt="" style="width:34px; height:34px; object-fit:contain; image-rendering:pixelated; flex:0 0 auto;">'
                    + '<div style="font-size:11px; line-height:1.65; color:#d8d2e6;"><b style="color:#c9b8ff;">' + esc(p.nick) + '</b><br>' + esc(RECALL[Number(p.key)] || RECALL[1]) + '</div></div>';
            }).join('')
            + '<div style="font-size:11.5px; line-height:1.75; color:#e8e2f0; margin:12px 0; padding:10px; border:1px dashed #4a3f6a; border-radius:8px;">' + J.open.map(esc).join('<br><br>') + '</div>'
            + (r.lead === me.code ? '<button id="jr-start" class="game-btn" style="' + BTN + GOLD + '">문을 나선다</button>' : '<div style="font-size:11px; color:#9fd8ef; text-align:center; padding:8px 0;">방장이 문을 나서기를 기다리는 중…</div>')
            + '<button id="jr-quit" class="game-btn" style="' + BTN + GREY + '">돌아간다 (기권)</button>');
        const st = w.querySelector('#jr-start'); if (st) st.onclick = function () { tx(r._k, function (cur) { if (!cur || cur.stage !== 'intro') return; cur.stage = 'fight'; cur.roundAt = Date.now(); cur.log = [{ r: 0, t: J.enc[0].in, k: 'n' }]; return cur; }); };
        w.querySelector('#jr-quit').onclick = function () { quit(r); };
        return;
    }
    if (r.stage === 'between') {
        const m = J.enc[r.enc - 1], nx = J.enc[r.enc];
        const w = box(head('『 ' + J.n + ' 』 — ' + r.enc + ' / ' + J.enc.length, '')
            + '<div style="font-size:11.5px; line-height:1.75; color:#e8e2f0; padding:10px; border:1px dashed #4a3f6a; border-radius:8px; margin-bottom:10px;">' + (m ? m.out : '') + '</div>'
            + petsOf(r).map(function (p) { return petRow(p, p.code === me.code); }).join('')
            + '<button id="jr-next" class="game-btn" style="' + BTN + GOLD + ' margin-top:10px;">계속 간다 — ' + esc(nx ? nx.kind + ' 「' + nx.n + '」' : '') + '</button>'
            + '<button id="jr-quit" class="game-btn" style="' + BTN + GREY + '">돌아간다 (기권)</button>');
        w.querySelector('#jr-next').onclick = function () {
            tx(r._k, function (cur) {
                if (!cur || cur.stage !== 'between') return;
                const e = J.enc[cur.enc]; if (!e) return;
                cur.stage = 'fight'; cur.round = 1; cur.roundAt = Date.now(); cur.pick = null;
                cur.mon = monOf(J, cur.enc, Number(cur.n) || Object.keys(cur.pets).length);
                // 다음 싸움 앞에 숨을 고른다 — 살아 있는 펫은 체력 30% 회복 (혼자 가도 보스까지 갈 수 있게)
                Object.keys(cur.pets).forEach(function (c) { const p = cur.pets[c]; p.gused = 0; p.guard = null; if (!p.ko) p.hp = Math.min(p.max, p.hp + Math.round(p.max * REST_HEAL)); });
                cur.log = logArr(cur).concat([{ r: 0, t: '— 잠깐 숨을 골랐다. (체력 ' + Math.round(REST_HEAL * 100) + '% 회복)', k: 'x' }, { r: 0, t: e.in, k: 'n' }]).slice(-LOG_KEEP);
                return cur;
            });
        };
        w.querySelector('#jr-quit').onclick = function () { quit(r); };
        return;
    }
    // fight
    const mon = r.mon || {};
    const e = J.enc[r.enc] || {};
    const pct = Math.max(0, Math.min(100, Math.round((Number(mon.hp) || 0) / (Number(mon.max) || 1) * 100)));
    const picked = !!(r.pick && r.pick[me.code]);
    const logs = logArr(r).slice(-7);
    const late = picked && (Date.now() - Number(r.roundAt || r.at || 0)) > PICK_WAIT;
    const w = box('<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><span style="font-size:12px; color:#c9b8ff; font-weight:bold;">' + esc(mon.kind) + ' 「' + esc(mon.n) + '」' + (mon.boss ? ' <span style="color:#ff8a80;">보스</span>' : '') + '</span><span style="font-size:10px; color:#7f7898;">' + (r.enc + 1) + ' / ' + J.enc.length + ' · ' + r.round + '판</span></div>'
        + '<div style="height:10px; background:#241f2e; border:1px solid #4a3f6a; border-radius:5px; overflow:hidden;"><div style="height:100%; width:' + pct + '%; background:linear-gradient(90deg,#8a3a5a,#ff8a80); transition:width .3s;"></div></div>'
        + '<div style="font-size:10px; color:#9f98b8; text-align:right; margin:3px 0 8px 0;">' + mon.hp + ' / ' + mon.max + '</div>'
        + petsOf(r).map(function (p) { return petRow(p, p.code === me.code); }).join('')
        + '<div style="font-size:10.5px; line-height:1.7; background:rgba(0,0,0,0.35); border:1px solid #2a2436; border-radius:6px; padding:7px 9px; margin:8px 0; min-height:40px;">'
        + logs.map(function (l) { return '<div style="color:' + (l.k === 'n' ? '#d8d2e6' : l.k === 'm' ? '#ff9e9e' : l.k === 'x' ? '#ffd766' : '#9fe6b0') + ';">' + (l.k === 'n' ? '' : '· ') + l.t + '</div>'; }).join('') + '</div>'
        + (mine && !mine.ko
            ? (picked ? '<div style="font-size:11px; color:#9fd8ef; text-align:center; padding:8px 0;">골랐습니다. 다른 동물을 기다리는 중…' + (late ? '<br><button id="jr-force" class="game-btn" style="margin:8px 0 0 0; padding:8px; font-size:10.5px;">1분이 지났다 — 안 고른 동물은 보통 공격으로</button>' : '') + '</div>'
                : '<div style="font-size:10px; color:#7f7898; margin-bottom:4px;">공격 — ' + esc(mine.nick) + '</div>'
                  + '<div style="display:flex; gap:5px; margin-bottom:7px;">' + (mine.a || []).map(function (s, i) { return '<button class="game-btn jr-o" data-k="a' + i + '" style="flex:1; margin:0; padding:9px 4px; font-size:10.5px;">' + esc(s[0]) + '<br><span style="font-size:8.5px; color:#8d8578;">' + T_NAME[s[1]] + '</span></button>'; }).join('') + '</div>'
                  + '<div style="font-size:10px; color:#7f7898; margin-bottom:4px;">방어</div>'
                  + '<div style="display:flex; gap:5px; margin-bottom:7px;">' + (mine.d || []).map(function (s, i) { return '<button class="game-btn jr-o" data-k="d' + i + '" style="flex:1; margin:0; padding:9px 4px; font-size:10.5px; background:linear-gradient(145deg,#1d3a4a,#0e2030) !important; border-color:#3a6a8a !important;">' + esc(s[0]) + '<br><span style="font-size:8.5px; color:#8fb8c8;">' + T_NAME[s[1]] + '</span></button>'; }).join('') + '</div>'
                  + '<div style="font-size:10px; color:#7f7898; margin-bottom:4px;">장비 스킬 <span style="color:#5f5878;">— 한 싸움에 한 번</span></div>'
                  + '<button class="game-btn jr-o" data-k="g" style="' + BTN + (mine.gsk && !mine.gused ? ' background:linear-gradient(145deg,#4a2c73,#2a0c43) !important; border-color:#8a6cb3 !important; color:#fff !important;' : GREY) + '"' + (mine.gsk && !mine.gused ? '' : ' disabled') + '>'
                  + (mine.gsk ? '✦ ' + esc(mine.gskn) + (mine.gused ? ' — 썼다' : '') : '낀 장비가 없다') + '</button>')
            : '<div style="font-size:11px; color:#ff9e9e; text-align:center; padding:8px 0;">주인이 몸을 날려 대신 맞았다. ' + esc(mine ? mine.nick : '') + josa(mine ? mine.nick : '', '은') + ' 집으로 돌아갔다 — 동료들을 지켜본다.</div>')
        + '<button id="jr-quit" class="game-btn" style="' + BTN + GREY + ' margin-top:4px;">돌아간다 (기권)</button>');
    Array.prototype.forEach.call(w.querySelectorAll('.jr-o'), function (b) {
        b.onclick = function () {
            const k = b.dataset.k;
            tx(r._k, function (cur) {
                if (!cur || cur.stage !== 'fight' || Number(cur.round) !== Number(r.round)) return;
                cur.pick = cur.pick || {};
                if (cur.pick[me.code]) return;
                if (k === 'g' && (!cur.pets[me.code].gsk || cur.pets[me.code].gused)) return;
                cur.pick[me.code] = { k: k };
                return cur;
            });
        };
    });
    const fc = w.querySelector('#jr-force');
    if (fc) fc.onclick = function () {
        tx(r._k, function (cur) {
            if (!cur || cur.stage !== 'fight') return;
            if (Date.now() - Number(cur.roundAt || cur.at || 0) < PICK_WAIT) return;
            cur.pick = cur.pick || {};
            Object.keys(cur.pets).forEach(function (c) { if (!cur.pets[c].ko && !cur.pick[c]) cur.pick[c] = { k: 'a0', auto: 1 }; });
            return cur;
        });
    };
    w.querySelector('#jr-quit').onclick = function () { quit(r); };
}
function quit(r) {
    const me = u_();
    tx(r._k, function (cur) {
        if (!cur || !cur.pets || !cur.pets[me.code]) return;
        if (['intro', 'fight', 'between'].indexOf(cur.stage) < 0) return;
        cur.pets[me.code].ko = 1; cur.pets[me.code].hp = 0;
        cur.log = logArr(cur).concat([{ r: cur.round || 0, t: cur.pets[me.code].nick + josa(cur.pets[me.code].nick, '이') + ' 돌아섰다. 주인이 그 앞을 막아섰다.', k: 'm' }]).slice(-LOG_KEEP);
        if (cur.pick) delete cur.pick[me.code];
        const alive = Object.keys(cur.pets).filter(function (c) { return !cur.pets[c].ko; });
        if (!alive.length) { cur.stage = 'lose'; cur.endAt = Date.now(); }
        else if (cur.lead === me.code) cur.lead = alive[0];
        return cur;
    });
}

// ==========================================
// 한 판 풀기 — 트랜잭션 (어느 화면이든 · 한 번만)
// ==========================================
function allPicked(r) {
    if (!r.pets) return false;
    const alive = Object.keys(r.pets).filter(function (c) { return !r.pets[c].ko; });
    return alive.length > 0 && alive.every(function (c) { return r.pick && r.pick[c]; });
}
function resolve(r) {
    const J = JOURNEYS[r.j] || JOURNEYS.j1;
    const rolls = []; for (let i = 0; i < 40; i++) rolls.push(Math.random());
    let ri = 0;
    const roll = function () { const v = rolls[ri % rolls.length]; ri++; return v; };
    tx(r._k, function (cur) {
        if (!cur || cur.stage !== 'fight' || !allPicked(cur)) return;
        ri = 0;
        const log = logArr(cur);
        const say = function (t, k) { log.push({ r: cur.round, t: t, k: k || 'p' }); };
        const mon = cur.mon;
        const order = (cur.order || Object.keys(cur.pets)).filter(function (c) { return cur.pets[c] && !cur.pets[c].ko; });
        const e = J.enc[cur.enc] || {};
        // 괴물이 무너졌다 — 경험치 · 등급업 조각(그 싸움에 놓인 것 · 1/odds) · 다음으로
        const beat = function () {
            const xp = (J.xpFight || [8])[Math.min(cur.enc, (J.xpFight || [8]).length - 1)] || 8;
            const alive = order.filter(function (c) { return !cur.pets[c].ko; });
            alive.forEach(function (c) { cur.pets[c].xp = (cur.pets[c].xp || 0) + xp; });
            say(mon.n + josa(mon.n, '이') + ' 무너졌다. (경험치 +' + xp + ')', 'x');
            const sh = ((G().SHARDS || {})[J.g] || []).filter(function (x) { return Number(x.enc) === Number(cur.enc); });
            alive.forEach(function (c) {
                sh.forEach(function (x) {
                    if (roll() < 1 / (Number(x.odds) || 30)) {
                        const p = cur.pets[c];
                        p.shards = (Array.isArray(p.shards) ? p.shards : []).concat([x.n]);
                        say('— ' + p.nick + josa(p.nick, '이') + ' 무엇인가를 물었다. ' + x.n + '. ' + x.d, 'x');
                    }
                });
            });
            if (cur.enc + 1 >= J.enc.length) { cur.stage = 'win'; cur.endAt = Date.now(); }
            else { cur.stage = 'between'; cur.enc = cur.enc + 1; }
        };
        // 1. 펫들 — 고른 것대로
        order.forEach(function (c) {
            const p = cur.pets[c]; const pk = (cur.pick[c] || {}).k || 'a0';
            p.guard = null;
            let atk = null, defT = null, gearA = null;
            if (pk[0] === 'a') { const s = (p.a || [])[Number(pk[1]) || 0] || ['몸통 박치기', 'hit']; atk = { n: s[0], t: ATK_T[s[1]] || ATK_T.hit }; }
            else if (pk[0] === 'd') { const s = (p.d || [])[Number(pk[1]) || 0] || ['버티기', 'guard']; defT = { n: s[0], t: DEF_T[s[1]] || DEF_T.guard }; }
            else if (pk === 'g' && p.gsk && !p.gused) { const g = GEAR_T[p.gsk] || GEAR_T.guard; p.gused = 1; if (g.atk) atk = { n: p.gskn, t: g, gear: 1 }; else { defT = { n: p.gskn, t: g, gear: 1 }; } }
            if (atk) {
                const n = atk.t.n || 1; let total = 0, hits = 0;
                for (let i = 0; i < n; i++) {
                    if (roll() * 100 >= atk.t.h) continue;
                    const crit = roll() * 100 < Math.min(100, (p.crit || 5) + (atk.t.crit || 0));
                    let d = p.atk * atk.t.m * (crit ? 1.5 : 1);
                    if (!atk.t.pierce) d -= mon.def || 0;
                    if (mon.boss) d += (p.gim || 0) * 4;
                    d = Math.max(1, Math.round(d)); total += d; hits++;
                    if (crit) say(p.nick + ' — ' + atk.n + '! 급소에 닿았다 (' + d + ')', 'x');
                }
                if (!hits) say(p.nick + ' — ' + atk.n + '. 빗나갔다.');
                else { mon.hp = Math.max(0, mon.hp - total); say(p.nick + ' — ' + atk.n + ' → ' + mon.n + ' 에 ' + total + (n > 1 ? ' (' + hits + '번)' : '')); if (atk.t.drain) { const h = Math.round(total * atk.t.drain); p.hp = Math.min(p.max, p.hp + h); say(p.nick + josa(p.nick, '이') + ' ' + h + ' 만큼 숨을 돌렸다'); } }
            } else if (defT) {
                p.guard = defT.t;
                if (defT.t.heal) { const h = Math.round(p.max * defT.t.heal); p.hp = Math.min(p.max, p.hp + h); say(p.nick + ' — ' + defT.n + '. ' + h + ' 회복'); }
                else say(p.nick + ' — ' + defT.n + '.');
            }
        });
        // 2. 괴물
        if (mon.hp <= 0) {
            beat();
        } else {
            const special = (cur.round % 3 === 0);
            const mvs = e.mv || ['친다'];
            const mv = special ? mvs[mvs.length - 1] : mvs[Math.floor(roll() * Math.max(1, mvs.length - 1))];
            const tauntC = order.filter(function (c) { return cur.pets[c].guard && cur.pets[c].guard.taunt; });
            const alive = order.filter(function (c) { return !cur.pets[c].ko; });
            const pool = tauntC.length ? tauntC : alive;
            const tc = pool[Math.floor(roll() * pool.length)];
            const t = cur.pets[tc];
            if (t) {
                let d = Math.max(1, Math.round(mon.atk * (special ? 1.5 : 1) - (t.def || 0)));
                const g = t.guard || {};
                let dodged = false;
                if (g.dodge != null) dodged = roll() * 100 < g.dodge;
                else dodged = roll() * 100 < (t.eva || 0);
                if (dodged) say(mon.n + ' — ' + mv + ' → ' + t.nick + josa(t.nick, '은') + ' 피했다', 'm');
                else {
                    const raw = d;
                    if (g.take) d = Math.max(1, Math.round(d * g.take));
                    t.hp = Math.max(0, t.hp - d);
                    say(mon.n + ' — ' + mv + ' → ' + t.nick + ' 에 ' + d + (g.take ? ' (막았다)' : ''), 'm');
                    if (g.reflect) { const back = Math.max(1, Math.round(raw * g.reflect)); mon.hp = Math.max(0, mon.hp - back); say(t.nick + josa(t.nick, '이') + ' 되받았다 → ' + back, 'x'); }
                    if (g.heal) { const h = Math.round(t.max * g.heal); t.hp = Math.min(t.max, t.hp + h); }
                    if (t.hp <= 0) { t.ko = 1; say('— ' + t.nick + josa(t.nick, '이') + ' 쓰러지는 순간, 주인이 몸을 날려 대신 맞았다. ' + t.nick + josa(t.nick, '은') + ' 다친 데 없이 집으로 돌아갔다.', 'm'); }
                }
                if (mon.hp <= 0) beat();
            }
            const left = order.filter(function (c) { return !cur.pets[c].ko; });
            if (!left.length && cur.stage === 'fight') { cur.stage = 'lose'; cur.endAt = Date.now(); }
            else if (cur.lead && cur.pets[cur.lead] && cur.pets[cur.lead].ko && left.length) cur.lead = left[0];
        }
        cur.log = log.slice(-LOG_KEEP);
        cur.pick = null;
        if (cur.stage === 'fight') { cur.round = (Number(cur.round) || 1) + 1; cur.roundAt = Date.now(); Object.keys(cur.pets).forEach(function (c) { cur.pets[c].guard = null; }); }
        return cur;
    });
}

// ==========================================
// 정산 — 내 펫만 내가 (끝난 것을 보면 그 자리에서 · 늦게 들어와도)
// ==========================================
const settling = {};
function settleSweep() {
    const me = u_();
    if (!me) return;
    Object.keys(live.runs).forEach(function (k) {
        const o = live.runs[k];
        if (!o || (o.stage !== 'win' && o.stage !== 'lose')) return;
        if (!o.pets || !o.pets[me.code]) return;
        if (o.settled && o.settled[me.code]) return;
        if (settling[k]) return;
        settling[k] = 1;
        settle(Object.assign({ _k: k }, o));
    });
}
function settle(o) {
    const me = u_(), d = db_();
    const J = JOURNEYS[o.j] || JOURNEYS.j1;
    const p = o.pets[me.code];
    const key = String(p.key);
    const won = o.stage === 'win';
    const s = P().pets(me)[key];
    const lines = [];
    let xp = Number(p.xp) || 0;
    if (won && !p.ko) xp += J.xpClear || 0;
    if (p.ko) xp = Math.floor(xp / 2);
    let lvs = null;
    if (s && xp > 0) { lvs = G().addXp(key, xp); lines.push('경험치 +' + xp + (lvs && lvs.lv > lvs.lv0 ? ' — Lv ' + lvs.lv0 + ' → ' + lvs.lv + (lvs.full ? ' (등급업 가능)' : '') : '')); }
    // 물고 온 것 — 끝까지 가서 돌아온 펫만 (주인이 대신 맞은 펫은 빈 입)
    if (won && !p.ko && J.pts) {
        const cap = (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000;
        const was = Number(me.points) || 0;
        const got = Math.max(0, Math.min(cap, was + J.pts) - was);
        if (typeof changePoints === 'function') { try { changePoints(got); } catch (e) { me.points = was + got; } } else me.points = was + got;
        try { if (typeof showPointGainEffect === 'function') showPointGainEffect(got); } catch (e) { }
        lines.push('물고 온 것 — ' + got.toLocaleString() + ' P');
    }
    // 여정 중에 문 등급업 조각 — 주인이 대신 맞았어도 물고 있던 것은 가져온다
    const shards = Array.isArray(p.shards) ? p.shards : (p.shards && typeof p.shards === 'object' ? Object.keys(p.shards).map(function (k) { return p.shards[k]; }) : []);
    shards.forEach(function (n) { G().shardAdd(n, 1); lines.push('등급업 조각 — ' + n + ' (' + G().shardCount(J.g, me) + ' / 3)'); });
    let drop = '';
    if (won && !p.ko && Math.random() < (J.drop || 0)) {
        const pool = G().DROP.filter(function (g) { return g.from === J.id; });
        if (pool.length) { drop = pool[Math.floor(Math.random() * pool.length)].n; G().add(drop, 1); lines.push('떨어진 것 — ' + drop + ' (장비 주머니)'); }
    }
    if (p.ko && s) {
        const until = Date.now() + SLEEP_MS;
        const fed = Math.min(Date.now(), (Number(s.fedAt) || Date.now()) + SLEEP_MS);     // 포만도 시계도 한 시간 멈춘다
        P().patch(key, { jsleep: until, fedAt: fed });
        lines.push('한 시간 잔다 — 포만도는 그동안 줄지 않는다');
    }
    log_('[여정] 『 ' + J.n + ' 』 ' + (won ? '끝까지 갔다' : '주인이 대신 맞았다') + ' — ' + p.nick + (lines.length ? ' · ' + lines.join(' · ') : ''));
    try { saveFields({ history: 1 }); } catch (e) { }
    const patch = {}; patch['settled/' + me.code] = 1;
    if (d) d.ref(NODE + '/runs/' + o._k).update(patch).then(function () { delete settling[o._k]; }).catch(function () { delete settling[o._k]; });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    const last = J.enc[J.enc.length - 1];
    view = 'end';
    const w = box(head('『 ' + J.n + ' 』 — ' + (won ? '집으로' : '주인이 대신 맞았다'), '')
        + '<div style="font-size:11.5px; line-height:1.75; color:#e8e2f0; padding:10px; border:1px dashed #4a3f6a; border-radius:8px; margin-bottom:10px;">' + (won ? last.out + (!p.ko && J.home ? '<br><br>' + J.home.replace(/\{n\}이\(가\)/g, esc(p.nick) + josa(p.nick, '이')).replace(/\{n\}/g, esc(p.nick)) + '<br>' + esc(HOME[Number(p.key)] || HOME[2]) : '') : J.lose) + '</div>'
        + petsOf(o).map(function (q) { return petRow(q, q.code === me.code); }).join('')
        + '<div style="font-size:11px; color:#ffcf8f; line-height:1.7; margin:10px 0;">' + esc(p.nick) + ' — ' + (lines.length ? lines.map(esc).join('<br>') : '얻은 것이 없다') + '</div>'
        + '<button id="jr-x" class="game-btn" style="' + BTN + GREY + '">닫는다</button>');
    w.querySelector('#jr-x').onclick = shut;
    shownTag = '';
}

// ==========================================
// 들어가는 문
// ==========================================
window.journeyOpen = function () {
    const me = u_();
    if (!me) { alert_('로그인 뒤에 쓸 수 있습니다.'); return; }
    if (!ready()) { alert_('펫 자료를 아직 못 읽었습니다. 잠시 뒤에 다시.'); return; }
    if (!db_()) { alert_('서버에 닿아야 할 수 있습니다.'); return; }
    watch();
    const r = myRun();
    if (r && runAlive(r)) { shownTag = ''; paintRun(r); return; }
    paint();
};
window.journeyOn = function () { const r = myRun(); return !!(r && runAlive(r)); };
window.journeyState = function () {
    console.log('%c===== 🐾 여정 =====', 'color:#c9b8ff; font-size:13px');
    console.log('  오늘 남은 횟수:', triesLeft() + ' / ' + DAY_MAX, '· 방', Object.keys(live.lobby).length, '· 여정', Object.keys(live.runs).length);
    const r = myRun();
    if (r) console.log('  내 여정:', r._k, r.stage, '·', r.enc + 1, '번째 ·', r.round, '판 ·', petsOf(r).map(function (p) { return p.nick + ' ' + p.hp + '/' + p.max + (p.ko ? ' (대신 맞음)' : ''); }).join(' · '));
    console.log('  보낼 수 있는 펫:', myPets().join(', ') || '없음');
};
window.JOURNEY = { J: JOURNEYS, RECALL: RECALL, HOME: HOME, SK: SK, ATK_T: ATK_T, DEF_T: DEF_T, GEAR_T: GEAR_T, DAY_MAX: DAY_MAX, build: build, myPets: myPets, triesLeft: triesLeft };

console.log('[여정] journeyOpen() · journeyState()');

})();
