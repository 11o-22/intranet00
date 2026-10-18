// ==========================================
// ★ 펫 — 몰래 따라가기 · 다침 · 치료 · 곁에 있기
// bundles.json 마지막 묶음, pet-with.js · pet-adopt.js 보다 뒤
// ==========================================
//
// ■ 몰래 따라간다
//
//   교감 90 이상인 펫은 주인이 어둠에 들어갈 때 **말도 없이 따라붙는다.**
//   구역 등급은 보지 않는다 — S 구역이라도 따라간다. 한 번에 **두 마리까지**.
//
//   데려가기로 고른 펫(pet-with)과 혼자 탐사를 나가 있는 펫(pet-dark)은
//   빠진다. 이미 다친 펫도 안 따라간다.
//
// ■ 다친다
//
//   돌아왔을 때, **구역 등급이 제 등급보다 높으면** 많이 다쳐 있다.
//   한 단계 위면 깊이 40, 두 단계면 60, 셋이면 80, 넷이면 100 이다.
//
//   ★ 죽지는 않는다. 몰래 따라간 펫은 어둠에서 죽지 않는다 —
//     죽는 것은 주인이 **데려갔을 때**뿐이다 (pet-with 의 대신 죽기).
//
// ■ 두 시간
//
//   다친 채로 두 시간이 지나면 죽는다. 그 전에 **완전히** 나아야 한다.
//   망상 홈쇼핑에 치료 물품 열 가지를 두었다. 깊이를 0 까지 내려야 하고,
//   하나로는 모자라게 값을 매겼다.
//
//   ★ 주인이 상담실이나 선녀탕에 들어가 있으면 **같이 들어가** 곁에 앉는다.
//     그동안은 두 시간이 흐르지 않고, 거기서 천천히 낫는다 (10분에 깊이 3).
//     주인을 위로하는 것이 먼저고, 낫는 것은 덤이다.
//
// ■ 묘사
//
//   따라갈 때 50가지 · 다쳤을 때 50가지. 갈래(pet-talk 의 아홉)마다 다르다.
//   주인의 포만도와 오염도에 따라서도 한 줄씩 달라진다 — 교감이 깊을수록
//   더 알아보고 더 걱정한다. 포만도 96가지 · 오염도 96가지.
//
// ■ 적히는 자리
//
//   pets[번호].sneak  1 이면 지금 따라 들어가 있다
//   pets[번호].hurt   { at: 다친 때, deep: 남은 깊이, zone, calm: 1 }
//                     calm 은 주인 곁(상담실·선녀탕)에 있다는 표식
//   u.petMed          { 치료 물품 이름: 개수 }
//
// ■ 콘솔
//   petHurt()          다친 펫과 남은 시간
//   petMedShop()       치료 물품 열 가지
//   petHealAll()       상담사 — 전원 치료

(function petSneak() {

const BOND_NEED = 90;                 // 이만큼 교감해야 따라붙는다
const MAX_SNEAK = 2;                  // 한 번에 두 마리
const DIE_MS = 2 * 3600 * 1000;       // 다친 채 두 시간
const CALM_TICK = 10 * 60 * 1000;     // 곁에 있을 때 10분마다
const CALM_HEAL = 3;                  // 그때 낫는 깊이
const ORDER = ['D', 'C', 'B', 'A', 'S'];
const DEEP = [0, 40, 60, 80, 100];    // 등급 차이별 깊이

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function log_(t) {
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { }
}
function kindOf(id) {
    try { return (window.PETTALK && window.PETTALK.KIND[id]) || 'small'; } catch (e) { return 'small'; }
}
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }
function nick(id, u) { try { return P().nick(id, u || u_()); } catch (e) { return '펫'; } }

// 갈래가 붙은 줄 가운데 하나 — 제 갈래 것이 먼저, 없으면 아무거나
function pick(list, kind) {
    const mine = list.filter(function (x) { return x.k === kind; });
    const pool = mine.length ? mine : list;
    return pool[Math.floor(Math.random() * pool.length)].t;
}

// ==========================================
// 따라갈 때 — 50가지
// ==========================================
const SNEAK = [
// 개 (늑대 · 리트리버 · 여우 · 치와와)
{k:'dog',t:'문이 닫히기 직전에 그림자 하나가 미끄러져 들어왔다.'},
{k:'dog',t:'발소리를 죽이는 법을 어디서 배웠는지 모르겠다.'},
{k:'dog',t:'세 걸음 뒤에서 따라온다. 돌아보면 멈추고, 걸으면 다시 온다.'},
{k:'dog',t:'코를 바닥에 붙이고 먼저 길을 재 본다.'},
{k:'dog',t:'꼬리가 낮게 내려가 있다. 겁이 나도 가기로 한 모양이다.'},
{k:'dog',t:'짖지 않는다. 오늘만은 한 번도 짖지 않는다.'},
// 고양이 (고양이 · 사자 · 백호)
{k:'cat',t:'언제 들어왔는지 모르겠다. 어느 순간 거기 앉아 있다.'},
{k:'cat',t:'어둠 쪽이 제 자리라는 얼굴로 걸어 들어온다.'},
{k:'cat',t:'소리가 전혀 나지 않는다. 그림자만 두 개다.'},
{k:'cat',t:'벽을 따라 붙어 온다. 벽이 끝나면 또 다른 벽을 찾는다.'},
{k:'cat',t:'눈만 먼저 보인다. 몸은 나중에 따라 나온다.'},
// 새 (뱁새 · 참새 · 병아리 · 송골매 · 부엉이)
{k:'bird',t:'머리 위 어딘가에서 날갯짓 소리가 한 번 났다.'},
{k:'bird',t:'어깨에 앉았다가, 무겁겠다 싶었는지 다시 날아오른다.'},
{k:'bird',t:'천장이 없는 곳인데도 높은 자리를 찾아 앉는다.'},
{k:'bird',t:'앞서 날아가 길 끝을 보고 돌아온다. 한 번 운다.'},
{k:'bird',t:'깃 하나가 발밑에 떨어져 있었다. 그제서야 알았다.'},
// 물 (수달 · 돌고래)
{k:'water',t:'젖은 발자국이 뒤에 하나씩 늘어난다.'},
{k:'water',t:'바닥이 미끄러운 데를 골라 디디며 따라온다.'},
{k:'water',t:'어디서 물을 묻혀 왔는지 모르겠다. 묻혀 왔다.'},
{k:'water',t:'앞발로 옷자락을 한 번 쥐었다가 놓는다.'},
{k:'water',t:'겁이 나는지 가까이 붙는다. 그래도 돌아가지는 않는다.'},
// 기는 것 (도마뱀 · 거북이 · 뱀)
{k:'rept',t:'소매 속이 묵직했다. 들어오고 한참 뒤에 알았다.'},
{k:'rept',t:'느리게, 그러나 한 번도 뒤처지지 않고 따라온다.'},
{k:'rept',t:'돌 틈으로 들어갔다가 저쪽 돌 틈에서 나온다.'},
{k:'rept',t:'발목을 감고 있었다. 차갑다. 떼어 낼 생각은 안 들었다.'},
{k:'rept',t:'혀를 한 번 낸다. 여기 공기가 어떤지 재 보는 모양이다.'},
// 작은 털 (담비 · 햄스터 · 토끼)
{k:'small',t:'주머니 속에서 뭔가 움직였다. 꺼내 보니 이미 늦었다.'},
{k:'small',t:'발밑으로 쏙 지나간다. 밟을 뻔했다.'},
{k:'small',t:'귀가 먼저 쫑긋 선다. 몸은 아직 그늘에 있다.'},
{k:'small',t:'작아서 눈에 안 띈다. 그걸 아는 눈치다.'},
{k:'small',t:'심장이 빠르게 뛰는 것이 손끝까지 전해진다.'},
// 곰
{k:'bear',t:'숨길 수 있는 크기가 아닌데도 숨어서 따라왔다.'},
{k:'bear',t:'발소리가 들렸다. 돌아보니 아무렇지 않은 얼굴이다.'},
{k:'bear',t:'뒤에 서 있으니 등이 따뜻하다. 어둠이 조금 멀어진다.'},
{k:'bear',t:'문틀을 긁고 들어왔다. 문틀이 졌다.'},
{k:'bear',t:'앞을 막아선다. 비켜 달라고 해도 안 비킨다.'},
// 발굽 (염소 · 양)
{k:'hoof',t:'발굽 소리가 또각또각 울린다. 숨을 생각이 없어 보인다.'},
{k:'hoof',t:'뭔가를 씹으면서 따라온다. 이 와중에도 씹는다.'},
{k:'hoof',t:'뿔로 옷자락을 걸고 늘어진다. 데려가라는 뜻이다.'},
{k:'hoof',t:'어둠 속에서 흰 털이 먼저 보인다. 숨는 재주는 없다.'},
{k:'hoof',t:'겁에 질려 있다. 그래도 발은 이쪽으로 떼고 있다.'},
// 나비
{k:'bug',t:'어깨 위에 앉아 있었다. 무게가 없어서 몰랐다.'},
{k:'bug',t:'어둠 속에서 날개가 한 번 번쩍였다.'},
{k:'bug',t:'앞서 날아간다. 그쪽이 길이라는 듯이.'},
{k:'bug',t:'가루가 소매에 조금 묻어 있다. 그게 흔적의 전부다.'},
{k:'bug',t:'불빛이 없는 데서도 제 색이 보인다.'},
// 갈래를 안 가리는 것
{k:'',t:'뒤에서 작은 숨소리가 들렸다. 혼자가 아니었다.'},
{k:'',t:'말린 적이 없는데도 따라왔다. 말릴 틈도 없었다.'},
{k:'',t:'돌아가라고 했다. 세 걸음 물러섰다가 다시 왔다.'},
{k:'',t:'문턱을 넘는 순간, 발밑에서 작은 것이 같이 넘었다.'}
];

// ==========================================
// 다쳤을 때 — 50가지
// ==========================================
const HURT = [
{k:'dog',t:'다리를 들고 선다. 그래도 꼬리는 흔들어 보인다.'},
{k:'dog',t:'핥아 달라는 듯 상처를 내민다. 핥을 수가 없다.'},
{k:'dog',t:'평소처럼 달려오다 반쯤에서 멈춘다. 멈추고 앉는다.'},
{k:'dog',t:'아프다는 소리를 안 낸다. 그게 더 안 좋다.'},
{k:'dog',t:'귀가 뒤로 완전히 눕혀져 있다.'},
{k:'dog',t:'문 쪽을 자꾸 본다. 다시 가자는 것인지 가기 싫다는 것인지.'},
{k:'cat',t:'구석으로 들어가 나오지 않는다. 부르면 소리만 낸다.'},
{k:'cat',t:'제 몸을 핥다가 아픈 데에 닿자 멈춘다. 다시 핥는다.'},
{k:'cat',t:'눈을 반만 뜨고 있다. 평소의 그 눈이 아니다.'},
{k:'cat',t:'만지려 하면 피한다. 피하고 나서 미안한 얼굴을 한다.'},
{k:'cat',t:'털이 한쪽만 젖어 있다. 젖은 것이 물이 아니다.'},
{k:'bird',t:'한쪽 날개가 바닥에 끌린다. 접으려다 만다.'},
{k:'bird',t:'앉은 자리에서 움직이지 않는다. 발톱만 꽉 쥐고 있다.'},
{k:'bird',t:'울음이 반 마디에서 끊긴다.'},
{k:'bird',t:'깃이 여기저기 뽑혀 있다. 제가 뽑은 것은 아니다.'},
{k:'bird',t:'날려고 했다가 바닥에 주저앉는다. 두 번은 안 해 본다.'},
{k:'water',t:'물을 보고도 안 들어간다. 그 자리에 엎드려만 있다.'},
{k:'water',t:'배를 보이지 않는다. 처음 있는 일이다.'},
{k:'water',t:'앞발 하나를 들고 있다. 바닥에 안 닿게 든다.'},
{k:'water',t:'숨이 고르지 않다. 쉬는 소리가 물 밑에서 나는 것 같다.'},
{k:'water',t:'평소 들고 다니던 돌을 놓쳤다. 찾을 기운이 없다.'},
{k:'rept',t:'굳어 있다. 살아 있는지 한참 들여다봐야 안다.'},
{k:'rept',t:'비늘이 몇 장 떨어져 나갔다. 그 자리가 붉다.'},
{k:'rept',t:'따뜻한 쪽으로 기어가려다 반도 못 가고 멈춘다.'},
{k:'rept',t:'눈꺼풀이 아래에서 위로 닫힌 채 안 열린다.'},
{k:'rept',t:'혀가 안 나온다. 냄새를 못 맡는 모양이다.'},
{k:'small',t:'털이 부풀지 않는다. 납작한 채로 가만히 있다.'},
{k:'small',t:'볼이 비어 있다. 한 번도 비어 있던 적이 없었다.'},
{k:'small',t:'손바닥에 올리자 그제야 몸을 말았다. 떨고 있다.'},
{k:'small',t:'코만 겨우 움직인다. 그것도 느리다.'},
{k:'small',t:'평소의 다섯 배를 뛰던 다리가 접혀 있다.'},
{k:'bear',t:'앉은 채로 벽에 기댄다. 벽이 조금 밀렸다.'},
{k:'bear',t:'큰 몸이 작아 보인다. 그게 가장 무섭다.'},
{k:'bear',t:'앞발로 상처를 가린다. 보이기 싫은 모양이다.'},
{k:'bear',t:'콧김이 짧게 끊긴다. 평소의 그 소리가 아니다.'},
{k:'bear',t:'이마를 바닥에 댄 채로 안 든다.'},
{k:'hoof',t:'발굽 하나가 갈라졌다. 디딜 때마다 기운다.'},
{k:'hoof',t:'씹지 않는다. 앞에 둬도 안 씹는다.'},
{k:'hoof',t:'뿔 끝이 깨져 있다. 들이받을 생각은 없어 보인다.'},
{k:'hoof',t:'선 채로 자던 것이 오늘은 누워 있다.'},
{k:'hoof',t:'흰 털에 묻은 것이 잘 지워지지 않는다.'},
{k:'bug',t:'날개 한쪽이 찢어졌다. 접히지도 펴지지도 않는다.'},
{k:'bug',t:'바닥을 걸어 다닌다. 걷는 것을 처음 본다.'},
{k:'bug',t:'가루가 다 떨어져 날개가 비친다.'},
{k:'bug',t:'더듬이 하나가 꺾여 있다. 자꾸 그쪽으로 기운다.'},
{k:'bug',t:'불빛 쪽으로 가려다 중간에 내려앉는다.'},
{k:'',t:'돌아온 것만으로 다행이라고 하기에는 너무 많이 다쳤다.'},
{k:'',t:'어둠에서 무엇을 보았는지 말할 방법이 없다.'},
{k:'',t:'쓰다듬으려 손을 뻗자 먼저 몸을 기울여 온다. 아픈데도.'},
{k:'',t:'숨이 얕다. 세어 보면 한참에 한 번이다.'}
];

// ==========================================
// 곁에 있을 때 — 상담실 · 선녀탕
// ==========================================
const CALM = [
{k:'dog',t:'문틈으로 비집고 들어와 침대 밑에 자리를 잡았다.'},
{k:'cat',t:'언제 들어왔는지 베개 옆에 앉아 있다. 쫓아내지 못했다.'},
{k:'bird',t:'창틀에 앉아 안쪽만 본다. 간호사가 몇 번 쫓았다.'},
{k:'water',t:'탕 가장자리에 엎드려 물에 손만 담그고 있다.'},
{k:'rept',t:'따뜻한 바닥을 찾아 발치에 눌러앉았다.'},
{k:'small',t:'이불 속으로 들어가 겨드랑이께에 자리를 잡았다.'},
{k:'bear',t:'문 앞에 앉아 등으로 문을 막고 있다. 아무도 못 들어온다.'},
{k:'hoof',t:'복도에서 쫓겨났다가 다시 들어왔다. 세 번째에는 그냥 뒀다.'},
{k:'bug',t:'천장등 가에 앉아 내려다본다. 날개를 접었다 폈다 한다.'},
{k:'',t:'같이 들어왔다. 아무도 내보내지 못했다.'},
{k:'',t:'제가 더 다쳤으면서 곁을 안 떠난다.'},
{k:'',t:'당신이 잠들 때까지 지켜본다. 그러고 나서야 눕는다.'}
];

// ==========================================
// 주인의 포만도 — 96가지
// ==========================================
//
//   포만 네 칸 × 교감 세 칸. 교감이 깊을수록 더 알아보고 더 걱정한다.
//       칸 : starve(20 미만) low(50 미만) mid(80 미만) good
//       교감: f(40 미만) m(80 미만) d(깊음)
const FULL = {
starve: {
 f:['배에서 소리가 났다. 펫이 한 번 쳐다보고 만다.',
    '제 밥그릇을 슬쩍 당신 쪽으로 민다. 그러고 뒤로 물러선다.',
    '당신이 비틀거리자 길을 비킨다. 그것이 배려의 전부다.',
    '먹는 소리가 안 나는 것을 이상하게 여기는 눈치다.',
    '밥그릇을 확인하러 갔다가 당신을 돌아본다.',
    '가까이 오지는 않는다. 다만 자리를 뜨지도 않는다.',
    '배고픈 사람의 냄새를 아는 모양이다. 코를 씰룩인다.',
    '하품을 하다 말고 당신을 본다.'],
 m:['제 먹이를 입에 물고 와 발밑에 떨어뜨린다. 먹으라는 것이다.',
    '자꾸 부엌 쪽으로 가서 당신을 부른다.',
    '손을 핥는다. 손에서 아무 맛도 안 나는 것이 걱정인 모양이다.',
    '당신이 앉으면 무릎에 턱을 올린다. 일어나지 못하게 한다.',
    '밥그릇을 밀어 당신 발 앞까지 가져다 놓았다.',
    '먹는 시늉을 해 보인다. 이렇게 하는 거라고 알려 주는 것 같다.',
    '당신 배에 귀를 대고 한참 듣는다.',
    '평소보다 조용하다. 떠들 때가 아니라고 여기는 것 같다.'],
 d:['제 밥을 손도 안 댄 채로 당신 앞에 끌어다 놓고 물러나 앉았다.',
    '굶은 지 며칠인지 아는 것처럼 군다. 알 리가 없는데 안다.',
    '당신이 먹을 때까지 제 그릇을 안 본다. 끝까지 안 본다.',
    '밤새 머리맡에 앉아 있었다. 아침에도 그 자리였다.',
    '소매를 물고 식탁까지 끌고 간다. 놓지 않는다.',
    '당신 손에 머리를 밀어 넣는다. 쓰다듬으라는 게 아니라 버티라는 것이다.',
    '당신이 쓰러지면 받을 자리를 미리 잡고 있다.',
    '한 번도 운 적 없는 것이 오늘 낮게 운다.']
},
low: {
 f:['밥때가 지난 것을 저만 아는 눈치다.',
    '그릇 쪽과 당신 쪽을 번갈아 본다.',
    '발밑을 한 바퀴 돌고 제자리로 간다.',
    '배를 바닥에 붙이고 쭉 뻗는다. 기다리는 자세다.',
    '코를 킁킁거리다 흥미를 잃는다.',
    '기지개를 켜고 다시 눕는다.',
    '당신 손가락을 한 번 물었다 놓는다. 아프지 않게.',
    '창밖을 본다. 배가 고픈 쪽은 저인지 당신인지 모르겠다.'],
 m:['당신이 뭘 먹나 옆에 와서 본다. 달라는 것은 아니다.',
    '그릇을 발로 톡 친다. 소리로 알리려는 모양이다.',
    '무릎에 올라와 자리를 잡는다. 따뜻하다.',
    '당신 손을 잡고 안 놓는다.',
    '돌아다니다 자꾸 당신 발치로 돌아온다.',
    '배에서 나는 소리에 귀를 쫑긋 세운다.',
    '밥 먹는 흉내를 낸다. 알아듣게 한다고 애를 쓴다.',
    '앞발로 당신 무릎을 두 번 친다.'],
 d:['저 먹을 것을 반쯤 남겨 두었다. 늘 그렇게 한다.',
    '당신이 끼니를 거를 때마다 똑같이 조용해진다.',
    '곁에 앉아 당신 숨소리를 센다.',
    '그릇을 물고 와 발 앞에 놓고 올려다본다.',
    '당신이 일어나면 따라 일어난다. 부엌까지 간다.',
    '먹지 않으면 저도 안 먹는다. 고집이 세다.',
    '머리를 당신 배에 붙이고 가만히 있는다.',
    '오늘따라 잘 웃지 않는다.']
},
mid: {
 f:['별일 없다는 얼굴로 제 할 일을 한다.',
    '한 바퀴 돌고 제자리에 눕는다.',
    '앞발을 모으고 앉아 당신을 본다.',
    '창가 볕을 따라 자리를 옮긴다.',
    '하품을 크게 한 번 한다.',
    '꼬리 끝만 느리게 움직인다.',
    '귀를 한 번 털고 다시 눈을 감는다.',
    '당신이 움직이면 눈만 따라온다.'],
 m:['옆에 와 앉는다. 붙어 앉지는 않고 한 뼘을 둔다.',
    '당신 발등에 턱을 올리고 눈을 감는다.',
    '기분이 괜찮아 보인다. 저도 그래 보인다.',
    '장난감을 물고 와 떨어뜨린다.',
    '등을 기대 온다. 무게가 기분 좋다.',
    '당신 손 냄새를 맡고 만족한 듯 돌아선다.',
    '방을 한 바퀴 돌고 와 같은 자리에 눕는다.',
    '짧게 한 번 운다. 부르는 것은 아니다.'],
 d:['당신이 괜찮으면 저도 괜찮다는 얼굴이다.',
    '무릎에 올라와 둥글게 자리를 잡는다.',
    '눈을 천천히 감았다 뜬다. 믿는다는 뜻이다.',
    '당신이 숨 쉬는 박자에 맞춰 같이 느려진다.',
    '곁에서 조는데 한쪽 귀는 당신 쪽으로 열려 있다.',
    '손이 닿는 자리에 늘 있다. 우연이 아니다.',
    '오늘은 아무것도 안 한다. 그냥 옆에 있는다.',
    '당신 손바닥에 이마를 댄다.'],
},
good: {
 f:['배가 부른 사람 곁은 편한 모양이다. 가까이 와 눕는다.',
    '제 그릇을 비우고 당신 그릇도 들여다본다.',
    '발랑 누워 배를 보인다.',
    '방 안을 쓸데없이 빠르게 한 바퀴 돈다.',
    '아무 까닭 없이 신이 나 있다.',
    '장난을 걸었다가 혼자 지쳐 눕는다.',
    '앞발로 바닥을 긁는다. 뭘 하고 싶은 모양이다.',
    '당신 주위를 맴돌다 멈춘다.'],
 m:['배부른 둘이 나란히 늘어져 있다.',
    '당신 다리 위에 앞발을 올리고 잔다.',
    '밥 잘 먹는 당신이 마음에 드는 눈치다.',
    '놀자고 조른다. 기운이 남아도는 모양이다.',
    '당신 손에 머리를 비빈다. 오래 비빈다.',
    '배를 보이고 구르다 그대로 잠든다.',
    '먹고 나서 꼭 당신 곁으로 온다.',
    '기분 좋은 소리를 낸다. 낮고 길다.'],
 d:['당신이 잘 먹는 날은 저도 하루 종일 기분이 좋다.',
    '밥 먹는 당신 옆에 앉아 끝까지 본다. 그러고 같이 눕는다.',
    '배가 부르면 사람이 오래 산다고 아는 것 같다.',
    '당신 심장 소리 위에 머리를 올리고 잔다.',
    '오늘은 어디도 안 간다. 갈 생각이 없다.',
    '한참 보다가 눈을 감는다. 다 괜찮다는 얼굴이다.',
    '당신이 웃으면 꼬리가 먼저 안다.',
    '곁에 누워 당신 손가락 하나를 쥐고 잔다.']
}
};

// ==========================================
// 주인의 오염도 — 96가지
// ==========================================
//
//   오염 네 칸 × 교감 세 칸.
//       칸 : clean(20 미만) soil(50 미만) bad(80 미만) worst
const POLL = {
clean: {
 f:['냄새가 깨끗한 것이 마음에 드는 모양이다.',
    '곁에 와 앉았다가 금방 제자리로 돌아간다.',
    '코를 한 번 대 보고 아무 일 없이 지나간다.',
    '편한 얼굴로 눈을 감는다.',
    '방 안을 느리게 돈다.',
    '볕 드는 자리를 당신 옆으로 옮겼다.',
    '귀를 세우지 않는다. 경계할 것이 없다는 뜻이다.',
    '하품을 하고 늘어진다.'],
 m:['당신 옷깃에 얼굴을 묻는다. 한참 그러고 있다.',
    '가까이 붙어 앉는다. 오늘은 틈이 없다.',
    '깨끗한 손을 핥고 만족스러워한다.',
    '배를 보이고 눕는다. 겁이 하나도 없다.',
    '당신 무릎을 제 자리로 정한 모양이다.',
    '기분 좋은 소리를 낸다.',
    '놀자고 조른다. 받아 주면 더 조른다.',
    '졸린 눈으로 당신을 본다.'],
 d:['당신에게서 어둠 냄새가 안 난다. 그것만으로 하루가 좋다.',
    '머리를 당신 가슴에 대고 숨소리를 듣는다.',
    '오늘은 한 번도 문 쪽을 안 본다.',
    '곁에서 길게 잔다. 깨워도 안 일어난다.',
    '당신 손에 이마를 댄 채로 눈을 감는다.',
    '꼬리가 느리고 크게 움직인다.',
    '이런 날이 오래가기를 바라는 얼굴이다.',
    '아무 일도 안 생기는 하루를 아주 좋아한다.']
},
soil: {
 f:['코를 대 보고 고개를 돌린다.',
    '한 뼘쯤 떨어져 앉는다.',
    '재채기를 한 번 한다.',
    '당신 손을 피했다가 다시 온다.',
    '방 구석을 맴돈다.',
    '귀를 한 번 턴다.',
    '냄새가 익숙하지 않은지 자꾸 확인한다.',
    '앉았다 일어났다 한다.'],
 m:['옷자락을 물고 씻으러 가자는 듯 끈다.',
    '당신 손목을 핥는다. 닦아 주려는 것 같다.',
    '가까이 오다 멈추고, 그래도 결국 온다.',
    '코를 찡그리면서도 곁을 안 뜬다.',
    '당신 몸에서 나는 것을 지우려는 듯 계속 비빈다.',
    '한숨 비슷한 소리를 낸다.',
    '물 있는 쪽을 자꾸 본다.',
    '당신을 올려다보는 시간이 길어졌다.'],
 d:['묻어 온 것을 핥아 내려 든다. 말려도 또 한다.',
    '제 몸을 당신에게 붙여 덮어 주려 한다.',
    '냄새가 싫은데도 더 가까이 온다. 그게 더 아프다.',
    '오늘따라 눈을 안 뗀다.',
    '당신이 움직일 때마다 따라 움직인다.',
    '씻는 자리까지 따라 들어온다.',
    '어디가 안 좋은지 찾는 것처럼 몸을 훑는다.',
    '낮게 운다. 걱정하는 소리다.']
},
bad: {
 f:['멀찍이 떨어져 당신을 본다.',
    '다가오지 않는다. 그래도 도망가지도 않는다.',
    '털을 세우고 있다가 천천히 내린다.',
    '문 쪽으로 몇 번 가 본다.',
    '밥을 반만 먹고 만다.',
    '귀가 뒤로 눕혀져 있다.',
    '낮은 데로 들어가 몸을 숨긴다.',
    '잠을 설치는 눈치다.'],
 m:['겁을 내면서도 발치에 와 앉는다.',
    '당신 손을 피하다가 결국 머리를 들이민다.',
    '자꾸 코를 대 보고 확인한다. 나아지지 않는다.',
    '짧게 몇 번 운다. 평소에 안 내던 소리다.',
    '당신이 기침을 하면 귀가 번쩍 선다.',
    '곁에 눕기는 하는데 등을 돌리고 눕는다.',
    '문 앞과 당신 사이를 오간다.',
    '잠든 당신을 한참 들여다본다.'],
 d:['무서운 것을 알면서도 품으로 파고든다.',
    '당신에게서 나는 것을 저한테로 옮기려는 것처럼 군다.',
    '밤새 깨어 있었다. 아침에 눈이 붉다.',
    '제 몸이 상하는 것을 아랑곳하지 않는다.',
    '손을 끌어다 제 머리에 올린다. 살아 있으라는 것 같다.',
    '울지 않는 것이 더 무섭다.',
    '곁에서 한 발짝도 안 뗀다. 밥그릇까지 끌고 온다.',
    '당신 얼굴만 본다. 오래 본다.']
},
worst: {
 f:['가까이 오지 않는다. 멀리서 지켜만 본다.',
    '구석에서 몸을 말고 안 나온다.',
    '당신이 움직이면 같이 움찔한다.',
    '털이 서 있다. 내려올 기미가 없다.',
    '아무것도 안 먹는다.',
    '소리에 과하게 놀란다.',
    '문 앞에 가서 긁는다.',
    '고개를 숙이고 있다.'],
 m:['무서워하면서도 당신을 안 떠난다. 떨고 있다.',
    '한 걸음씩 다가왔다가 멈추기를 반복한다.',
    '낮게 계속 운다. 멈추지 않는다.',
    '당신 손이 닿으면 움찔하고, 그러고 나서 비빈다.',
    '잠을 안 잔다. 당신이 자는 동안에도 안 잔다.',
    '제 자리를 당신 머리맡으로 옮겼다.',
    '사람을 부르러 가듯 문으로 갔다가 돌아온다.',
    '아픈 쪽을 아는 것처럼 그 자리에 머리를 댄다.'],
 d:['썩어 가는 냄새 속으로 걸어 들어와 품에 안긴다.',
    '당신이 숨을 쉴 때마다 같이 숨을 쉰다. 맞춰서 쉰다.',
    '떨어뜨리려 해도 안 떨어진다. 밀어내면 더 붙는다.',
    '이대로 같이 가도 좋다는 얼굴이다. 그것이 가장 무섭다.',
    '밤새 당신 가슴 위에 머리를 두고 있었다.',
    '한 번도 짖은 적 없는 것이 문을 보고 짖는다.',
    '제 목숨을 세는 법을 모르는 것 같다. 세었어도 그랬을 것이다.',
    '당신이 눈을 뜰 때까지 눈을 안 감는다.']
}
};

// ==========================================
// 치료 물품 열 가지 — 망상 홈쇼핑
// ==========================================
//
//   깊이를 그만큼 깎는다. 깊이 100 짜리 상처는 하나로 안 낫는다.
const MED = [
    ['소독 솜',        12,   900],
    ['작은 붕대',      18,  1600],
    ['지혈 가루',      22,  2400],
    ['부목과 끈',      28,  3400],
    ['연고 한 통',     34,  4600],
    ['수면 물약(펫용)', 40,  6000],
    ['영양 주사',      48,  7800],
    ['수혈 팩',        56,  9900],
    ['뼈 접합 침',     68, 13000],
    ['재생 고약',      85, 18000]
];
const MED_BY = {};
MED.forEach(function (x) { MED_BY[x[0]] = { heal: x[1], price: x[2] }; });

let qty = 1;                          // 망상 홈쇼핑에서 한 번에 살 개수

// ==========================================
// 깊이 N 을 0 까지 내리는 **가장 싼 조합**
// ==========================================
//
//   깊이가 100 을 넘지 않고 물품이 열 가지뿐이라 그냥 다 세어 본다.
//   dp[d] = 깊이 d 를 0 까지 내리는 최소 값. 한 칸씩 올려 가며 채운다.
//
//   한 점당 값이 가장 싼 것은 소독 솜(900 / 12 = 75)이라 대개 그것이
//   잔뜩 나온다. 마지막 모자란 몫만 다른 것으로 메운다.
function cheapest(deep) {
    const d0 = Math.max(0, Math.ceil(Number(deep) || 0));
    if (!d0) return { cost: 0, list: {} };
    const dp = new Array(d0 + 1).fill(Infinity);
    const via = new Array(d0 + 1).fill(null);
    dp[0] = 0;
    for (let d = 1; d <= d0; d++) {
        for (let i = 0; i < MED.length; i++) {
            const rest = Math.max(0, d - MED[i][1]);
            const c = MED[i][2] + dp[rest];
            if (c < dp[d]) { dp[d] = c; via[d] = i; }
        }
    }
    const list = {};
    let d = d0;
    while (d > 0 && via[d] != null) {
        const i = via[d];
        list[MED[i][0]] = (list[MED[i][0]] || 0) + 1;
        d = Math.max(0, d - MED[i][1]);
    }
    return { cost: dp[d0], list: list };
}

// ==========================================
// 바탕 셈
// ==========================================
function pets(u) { try { return P().pets(u || u_()) || {}; } catch (e) { return {}; } }
function gradeOf(s) { const g = String((s && s.g) || 'D'); return ORDER.indexOf(g) >= 0 ? g : 'D'; }
function zoneGrade(code) {
    try {
        const z = (typeof DARK_ZONES !== 'undefined') ? DARK_ZONES[code] : null;
        if (z && z.grade) return z.grade;
    } catch (e) { }
    const m = /-([DCBAS])-/.exec(String(code || ''));
    return m ? m[1] : 'D';
}
function hurtOf(u, key) { const s = pets(u)[String(key)]; return (s && s.hurt) || null; }
function anyHurt(u) {
    const ps = pets(u);
    return Object.keys(ps).filter(function (k) { return ps[k] && ps[k].hurt; });
}
function quar(u) {
    try { if (typeof isQuarantined === 'function') return !!isQuarantined(u); } catch (e) { }
    return !!(u && Number(u.quarantineUntil) > Date.now());
}
function patch(key, o) { try { P().patch(String(key), o); } catch (e) { } }

// ==========================================
// 따라간다
// ==========================================
let was = false;

function begin() {
    const d = run(), u = u_();
    if (!d || !u) return;
    const ps = pets(u);
    const taken = String(d._pet || '');
    const cand = Object.keys(ps).filter(function (k) {
        const s = ps[k];
        if (!s || s.hurt) return false;                 // 다친 펫은 안 간다
        if (s.out) return false;                        // 혼자 탐사 중
        if (k === taken) return false;                  // 데려간 펫
        return (Number(s.bond) || 0) >= BOND_NEED;
    }).sort(function (a, b) {
        return (Number(ps[b].bond) || 0) - (Number(ps[a].bond) || 0);
    }).slice(0, MAX_SNEAK);

    if (!cand.length) return;
    d._sneak = cand.slice();
    const lines = [];
    cand.forEach(function (k) {
        patch(k, { sneak: 1 });
        lines.push('<b style="color:#9fd8ef;">' + esc(nick(k, u)) + '</b> — '
            + esc(pick(SNEAK, kindOf(k))));
    });
    try {
        d.log.push('[펫] 따라 들어왔습니다 — ' + cand.map(function (k) { return nick(k, u); }).join(' · '));
    } catch (e) { }
    setTimeout(function () {
        alert_('말리지 못했습니다.\n\n'
            + cand.map(function (k) {
                return nick(k, u) + ' — ' + pick(SNEAK, kindOf(k));
            }).join('\n\n'));
    }, 900);
}

// ==========================================
// 돌아왔다 — 구역이 제 등급보다 높으면 다친다
// ==========================================
function end() {
    const u = u_();
    if (!u) return;
    const ps = pets(u);
    const back = Object.keys(ps).filter(function (k) { return ps[k] && ps[k].sneak; });
    if (!back.length) return;

    const zone = (window._petSneakZone || '');
    const zg = ORDER.indexOf(zoneGrade(zone));
    const rows = [];
    back.forEach(function (k) {
        const s = ps[k];
        const pg = ORDER.indexOf(gradeOf(s));
        const gap = Math.max(0, zg - pg);
        if (gap <= 0) {
            patch(k, { sneak: null });
            rows.push({ k: k, ok: true });
            return;
        }
        const deep = DEEP[Math.min(4, gap)];
        patch(k, { sneak: null, hurt: { at: Date.now(), deep: deep, zone: zone || '' } });
        rows.push({ k: k, ok: false, deep: deep });
    });

    const hurtRows = rows.filter(function (r) { return !r.ok; });
    if (hurtRows.length) {
        log_('[펫] ' + hurtRows.map(function (r) { return nick(r.k, u); }).join(' · ')
            + ' — 따라갔다가 다쳤습니다.');
    }
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    setTimeout(function () {
        if (!rows.length) return;
        alert_(rows.map(function (r) {
            const nm = nick(r.k, u);
            return r.ok
                ? (nm + ' — 멀쩡합니다. 따라온 것을 들키지 않았다고 여기는 얼굴입니다.')
                : (nm + ' (깊이 ' + r.deep + ')\n' + pick(HURT, kindOf(r.k)));
        }).join('\n\n')
        + (hurtRows.length ? '\n\n두 시간 안에 **완전히** 고치지 않으면 죽습니다.\n'
            + '사택 맨 위 · 망상 홈쇼핑 맨 위의 「한 번에 낫게」를 누르면'
            + ' 모자란 몫만 사서 바로 낫습니다.' : ''));
    }, 1200);
}

// 들어간 구역을 적어 둔다 — 끝날 때는 darkRun 이 이미 없다
setInterval(function () {
    try {
        const d = run();
        if (d && d.zone) window._petSneakZone = d.zone;
        const on = !!d;
        if (on && !was) begin();
        if (!on && was) end();
        was = on;
    } catch (e) { }
}, 800);

// ==========================================
// 두 시간 · 곁에 있으면 안 죽는다
// ==========================================
setInterval(function () {
    const u = u_();
    if (!u) return;
    const ps = pets(u);
    const keys = anyHurt(u);
    if (!keys.length) return;
    const now = Date.now();
    const inQ = quar(u);
    let changed = 0;

    keys.forEach(function (k) {
        const h = ps[k].hurt;
        if (!h) return;
        if (inQ) {
            // 같이 들어가 곁에 앉았다 — 두 시간이 안 흐르고 천천히 낫는다
            if (!h.calm) {
                h.calm = 1; h.last = now;
                patch(k, { hurt: h });
                changed++;
                setTimeout(function () {
                    alert_(nick(k, u) + josa(nick(k, u), '이') + ' 따라 들어왔습니다.\n\n'
                        + pick(CALM, kindOf(k)));
                }, 600);
                return;
            }
            const last = Number(h.last) || now;
            if (now - last >= CALM_TICK) {
                h.last = now;
                h.at = now;                               // 두 시간을 미룬다
                h.deep = Math.max(0, Number(h.deep) - CALM_HEAL);
                if (h.deep <= 0) {
                    patch(k, { hurt: null });
                    log_('[펫] ' + nick(k, u) + ' — 곁에서 다 나았습니다.');
                } else patch(k, { hurt: h });
                changed++;
            }
            return;
        }
        if (h.calm) { h.calm = 0; h.at = now; patch(k, { hurt: h }); changed++; return; }
        if (now - Number(h.at || now) >= DIE_MS) {
            const nm = nick(k, u);
            try { delete pets(u)[String(k)]; } catch (e) { }
            try {
                if (typeof database !== 'undefined' && database) {
                    database.ref('users/' + u.code + '/pets/' + k).set(null);
                }
            } catch (e) { }
            log_('[펫] ' + nm + ' — 다친 채로 두 시간이 지나 숨을 거두었습니다.');
            changed++;
            setTimeout(function () {
                alert_(nm + josa(nm, '은') + ' 끝내 일어나지 못했습니다.\n\n'
                    + '다친 펫은 두 시간 안에 완전히 고쳐야 합니다.');
            }, 300);
        }
    });
    if (changed) {
        // ★ 고친 자리는 위에서 펫 하나씩(patch · set) 이미 썼다. 펫 칸을 통째로 다시
        //   올리면 다른 기기에서 먹인 것(fedAt)을 묵은 값으로 덮는다 — 서버가 없을 때만.
        try { if ((typeof database === 'undefined' || !database) && typeof saveFields === 'function') saveFields({ pets: 1 }); } catch (e) { }
        try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    }
}, 20000);

// ==========================================
// 치료
// ==========================================
function medBag(u) {
    u = u || u_();
    if (!u) return {};
    if (!u.petMed || typeof u.petMed !== 'object' || Array.isArray(u.petMed)) u.petMed = {};
    return u.petMed;
}
function medAdd(name, n) {
    const u = u_();
    if (!u) return;
    const b = medBag(u);
    b[name] = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (!b[name]) delete b[name];
    try { if (typeof saveFields === 'function') saveFields({ petMed: 1 }); } catch (e) { }
}

window.petMedBuy = function (name, qty) {
    const u = u_();
    const m = MED_BY[name];
    if (!u || !m) return;
    const n = Math.max(1, Number(qty) || 1);
    const cost = m.price * n;
    if ((Number(u.points) || 0) < cost) { alert_('포인트가 모자랍니다.'); return; }
    if (typeof changePoints === 'function') changePoints(-cost);
    medAdd(name, n);
    log_('[망상 홈쇼핑] ' + name + ' ' + n + '개 구입 (-' + cost.toLocaleString() + ' P)');
    alert_(name + ' ' + n + '개를 샀습니다.');
    try { if (typeof window.petMedPaint === 'function') window.petMedPaint(); } catch (e) { }
    try { if (typeof window.petHurtPaint === 'function') window.petHurtPaint(); } catch (e) { }
};

window.petMedUse = function (key, name) {
    const u = u_();
    const m = MED_BY[name];
    if (!u || !m) return;
    const b = medBag(u);
    if (!(Number(b[name]) > 0)) { alert_('가지고 있지 않습니다.'); return; }
    const s = pets(u)[String(key)];
    if (!s || !s.hurt) { alert_('다친 펫이 아닙니다.'); return; }

    medAdd(name, -1);
    const h = s.hurt;
    h.deep = Math.max(0, Number(h.deep) - m.heal);
    const nm = nick(key, u);
    if (h.deep <= 0) {
        patch(key, { hurt: null });
        log_('[펫] ' + nm + ' — 다 나았습니다.');
        alert_(nm + josa(nm, '이') + ' 다 나았습니다.\n\n' + '일어나 한 바퀴 돌아 보입니다.');
    } else {
        patch(key, { hurt: h });
        alert_(name + '을(를) 썼습니다.\n\n' + nm + ' — 남은 깊이 ' + h.deep);
    }
    try { if (typeof window.petMedPaint === 'function') window.petMedPaint(); } catch (e) { }
    try { if (typeof window.petHurtPaint === 'function') window.petHurtPaint(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
};

// ==========================================
// 한 번 눌러 낫게 한다
// ==========================================
//
//   깊이 100 짜리 상처는 소독 솜 아홉 개가 가장 싸다. 예전에는 아홉 번 사고
//   아홉 번 쓰는 열여덟 번을 눌러야 했다. 두 시간 안에 그걸 하는 것이
//   치료의 전부였다. 그래서 두 단추로 줄인다.
//
//     petHealFast  가진 것으로 되는 데까지
//     petHealBuy   모자란 몫을 가장 싼 조합으로 사서 끝까지
//
//   낭비를 줄이려고 **깊이를 덮는 가장 작은 것**을 먼저 찾는다. 없으면
//   가진 것 가운데 가장 큰 것을 쓴다.
function ownedSorted(u) {
    const b = medBag(u);
    return MED.filter(function (x) { return Number(b[x[0]]) > 0; })
              .map(function (x) { return { n: x[0], h: x[1], p: x[2], c: Number(b[x[0]]) }; });
}

// 가진 것만으로 깊이를 깎는다 — 돌려주는 값 { used:{이름:수}, left: 남은 깊이 }
function spend(u, deep) {
    const have = ownedSorted(u).map(function (x) {
        return { n: x.n, h: x.h, c: x.c };
    });
    const used = {};
    let d = Math.max(0, Number(deep) || 0);
    while (d > 0) {
        // ① 한 번에 끝낼 수 있는 가장 작은 것
        let pickIdx = -1;
        for (let i = 0; i < have.length; i++) {
            if (!have[i].c || have[i].h < d) continue;
            if (pickIdx < 0 || have[i].h < have[pickIdx].h) pickIdx = i;
        }
        // ② 없으면 가진 것 가운데 가장 큰 것
        if (pickIdx < 0) {
            for (let i = 0; i < have.length; i++) {
                if (!have[i].c) continue;
                if (pickIdx < 0 || have[i].h > have[pickIdx].h) pickIdx = i;
            }
        }
        if (pickIdx < 0) break;                       // 가진 것이 없다
        have[pickIdx].c--;
        used[have[pickIdx].n] = (used[have[pickIdx].n] || 0) + 1;
        d = Math.max(0, d - have[pickIdx].h);
    }
    return { used: used, left: d };
}

function applyUsed(key, used, u) {
    let heal = 0;
    Object.keys(used).forEach(function (n) {
        medAdd(n, -used[n]);
        heal += MED_BY[n].heal * used[n];
    });
    const s = pets(u)[String(key)];
    if (!s || !s.hurt) return 0;
    const h = s.hurt;
    h.deep = Math.max(0, Number(h.deep) - heal);
    if (h.deep <= 0) patch(key, { hurt: null });
    else patch(key, { hurt: h });
    return h.deep;
}

function usedText(used) {
    return MED.filter(function (x) { return used[x[0]]; })
              .map(function (x) { return x[0] + ' ×' + used[x[0]]; }).join(' · ');
}

function done(key, u) {
    const nm = nick(key, u);
    log_('[펫] ' + nm + ' — 다 나았습니다.');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    return nm + josa(nm, '이') + ' 다 나았습니다.\n\n일어나 한 바퀴 돌아 보입니다.';
}

function repaint() {
    try { if (typeof window.petMedPaint === 'function') window.petMedPaint(); } catch (e) { }
    try { if (typeof window.petHurtPaint === 'function') window.petHurtPaint(); } catch (e) { }
    try { if (typeof window.petHurtPaint === 'function') window.petHurtPaint(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    const m = document.getElementById('pet-hurt-modal');
    if (m) { m.remove(); if (anyHurt(u_()).length) window.petHurtOpen(); }
}

window.petHealFast = function (key) {
    const u = u_();
    if (!u) return;
    const s = pets(u)[String(key)];
    if (!s || !s.hurt) { alert_('다친 펫이 아닙니다.'); return; }
    const deep = Math.max(0, Number(s.hurt.deep) || 0);
    const r = spend(u, deep);
    if (!Object.keys(r.used).length) {
        alert_('쓸 치료 물품이 없습니다.\n\n망상 홈쇼핑에서 사십시오.');
        return;
    }
    const rest = applyUsed(key, r.used, u);
    const msg = '썼습니다 — ' + usedText(r.used);
    if (rest <= 0) alert_(done(key, u) + '\n\n' + msg);
    else {
        const c = cheapest(rest);
        alert_(nick(key, u) + ' — 남은 깊이 ' + rest + '\n\n' + msg
            + '\n\n가진 것이 모자랍니다. 모자란 몫은 ' + c.cost.toLocaleString() + ' P 입니다.');
    }
    repaint();
};

window.petHealBuy = function (key) {
    const u = u_();
    if (!u) return;
    const s = pets(u)[String(key)];
    if (!s || !s.hurt) { alert_('다친 펫이 아닙니다.'); return; }
    const deep = Math.max(0, Number(s.hurt.deep) || 0);
    const mine = spend(u, deep);                       // 가진 것으로 되는 데까지
    const buy = cheapest(mine.left);                   // 모자란 몫
    if (buy.cost > (Number(u.points) || 0)) {
        alert_('포인트가 모자랍니다.\n\n모자란 몫 ' + buy.cost.toLocaleString() + ' P'
            + '\n가진 포인트 ' + (Number(u.points) || 0).toLocaleString() + ' P');
        return;
    }
    if (buy.cost) {
        if (typeof changePoints === 'function') changePoints(-buy.cost);
        else u.points = (Number(u.points) || 0) - buy.cost;
        log_('[망상 홈쇼핑] 치료 물품 ' + usedText(buy.list)
            + ' 구입 (-' + buy.cost.toLocaleString() + ' P)');
    }
    const all = {};
    [mine.used, buy.list].forEach(function (o) {
        Object.keys(o).forEach(function (n) { all[n] = (all[n] || 0) + o[n]; });
    });
    // 산 몫을 먼저 주머니에 넣는다 — applyUsed 가 거기서 빼 간다
    Object.keys(buy.list).forEach(function (n) { medAdd(n, buy.list[n]); });
    const rest = applyUsed(key, all, u);
    try { if (typeof saveFields === 'function') saveFields({ points: 1, petMed: 1, history: 1 }); } catch (e) { }
    alert_((rest <= 0 ? done(key, u) : (nick(key, u) + ' — 남은 깊이 ' + rest))
        + '\n\n썼습니다 — ' + usedText(all)
        + (buy.cost ? '\n산 것 ' + buy.cost.toLocaleString() + ' P' : '\n가진 것으로 됐습니다.'));
    repaint();
};

// 망상 홈쇼핑에 칸을 붙인다
window.petMedQty = function (n) {
    qty = Math.max(1, Number(n) || 1);
    try { window.petMedPaint(); } catch (e) { }
};

// 다친 펫 띠 — 사택과 망상 홈쇼핑 맨 위에 같은 것을 띄운다
function hurtBanner() {
    const u = u_();
    const keys = anyHurt(u);
    if (!keys.length) return '';
    const ps = pets(u);
    return '<div style="background:rgba(224,122,95,0.12); border:1px solid #e07a5f;'
        + ' border-radius:7px; padding:11px; margin-bottom:12px;">'
        + '<div style="font-size:11px; color:#e07a5f; font-weight:bold; margin-bottom:7px;">'
        + '🩹 다친 펫 ' + keys.length + '마리</div>'
        + keys.map(function (k) {
            const h = ps[k].hurt;
            const c = cheapest(Math.max(0, Number(h.deep) || 0));
            const live = h.calm ? '<span style="color:#7fd4d4;">곁에서 낫는 중</span>'
                : '<span style="color:#e07a5f;">'
                  + Math.max(0, Math.ceil((Number(h.at) + DIE_MS - Date.now()) / 60000))
                  + '분 뒤에 죽습니다</span>';
            return '<div style="display:flex; align-items:center; gap:8px; padding:5px 0;">'
                + '<img src="' + P().icon(k) + '" alt="" style="width:26px; height:26px;'
                + ' object-fit:contain; image-rendering:pixelated;">'
                + '<div style="flex:1; min-width:0;">'
                + '<div style="font-size:11px; color:#e8d7b4;">' + esc(nick(k, u))
                + ' <span style="color:#6f685e;">깊이 ' + h.deep + '</span></div>'
                + '<div style="font-size:9.5px;">' + live + '</div></div>'
                + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:7px 10px;'
                + ' font-size:10px; background:linear-gradient(145deg,#8a3a28,#4a1d12) !important;'
                + ' border-color:#e07a5f !important; color:#ffd9cd !important;"'
                + ' onclick="petHealBuy(\'' + esc(k) + '\')">'
                + '한 번에 낫게 — ' + c.cost.toLocaleString() + ' P</button>'
                + '</div>';
        }).join('')
        + '<div style="font-size:9px; color:#8d8578; margin-top:5px; line-height:1.6;">'
        + '단추를 누르면 가진 치료 물품을 먼저 쓰고, 모자란 몫만 가장 싼 조합으로 사서'
        + ' 깊이 0 까지 내립니다. 적힌 값은 지금 모자란 몫입니다.</div>'
        + '<button class="game-btn" style="width:100%; margin:7px 0 0 0; padding:8px;'
        + ' font-size:10px; background:#2a2a2a !important; border-color:#444 !important;'
        + ' color:#aaa !important;" onclick="petHurtOpen()">하나씩 골라 쓴다</button>'
        + '</div>';
}

function shopHtml() {
    const u = u_();
    const b = medBag(u);
    const mine = MED.reduce(function (a, x) { return a + (Number(b[x[0]]) || 0); }, 0);
    return hurtBanner()
        + '<div style="font-size:12px; color:#e07a5f; font-weight:bold; margin:0 0 4px;">'
        + '🩹 치료 물품' + (mine ? ' <span style="color:#9fd8ef; font-size:10px;'
            + ' font-weight:normal;">· 가진 것 ' + mine + '개</span>' : '') + '</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:7px; line-height:1.6;">'
        + '어둠을 따라갔다 다친 펫에게 씁니다. 깊이를 0 까지 내려야 삽니다.<br>'
        + '다친 채로 두 시간이 지나면 죽습니다 — 다만 주인이 상담실·선녀탕에 있으면'
        + ' 곁에서 같이 낫습니다.<br>'
        + '<span style="color:#8d8578;">깊이 100 짜리 상처는 하나로 안 낫습니다.'
        + ' 아래에서 개수를 골라 한 번에 사십시오.</span></div>'
        + '<div style="display:flex; gap:5px; margin-bottom:6px;">'
        + [1, 5, 10].map(function (n) {
            const on = (qty === n);
            return '<button class="game-btn" style="flex:1; margin:0; padding:6px;'
                + ' font-size:10px;' + (on
                    ? ' background:linear-gradient(145deg,#8a3a28,#4a1d12) !important;'
                      + ' border-color:#e07a5f !important; color:#ffd9cd !important;'
                    : ' background:#2a2a2a !important; border-color:#444 !important;'
                      + ' color:#aaa !important;')
                + '" onclick="petMedQty(' + n + ')">×' + n + '</button>';
        }).join('')
        + '</div>'
        + MED.map(function (x) {
            const have = Number(b[x[0]]) || 0;
            return '<div style="display:flex; align-items:center; gap:6px; padding:4px 0;'
                + ' border-top:1px solid rgba(255,255,255,0.05);">'
                + '<div style="flex:1; min-width:0; font-size:11px; color:#e8d7b4;">'
                + esc(x[0]) + ' <span style="color:#6f685e;">깊이 −' + x[1] + '</span>'
                + (have ? ' <span style="color:#9fd8ef;">·' + have + '개</span>' : '') + '</div>'
                + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:6px 9px;'
                + ' font-size:10px;" onclick="petMedBuy(\'' + esc(x[0]) + '\',' + qty + ')">'
                + (qty > 1 ? '×' + qty + ' · ' : '')
                + (x[2] * qty).toLocaleString() + ' P</button></div>';
        }).join('');
}

// ★ 맨 위에 붙인다
//
//   전에는 host.appendChild 였다. 망상 홈쇼핑은 환몽알 칸 + 돌봄 물품
//   마흔 가지(여섯 묶음 아코디언)로 되어 있어서, 치료 물품은 그 밑에
//   깔려 있었다. 다친 펫은 두 시간 안에 **완전히** 나아야 하는데 그걸
//   찾으러 끝까지 내려가야 했다. 그래서 맨 앞으로 올린다.
window.petMedPaint = function () {
    const host = document.querySelector('#dream-body') || document.querySelector('#pet-shop-body');
    if (!host || !u_()) return;
    let el = document.querySelector('#pet-med-box');
    if (!el || el.parentNode !== host) {
        if (el) try { el.remove(); } catch (e) { }
        el = document.createElement('div');
        el.id = 'pet-med-box';
        el.style.cssText = 'margin-bottom:14px;';
    }
    if (el.parentNode !== host || host.firstChild !== el) {
        host.insertBefore(el, host.firstChild);
    }
    const h = shopHtml();
    if (el.innerHTML !== h) el.innerHTML = h;
};

// 돌봄 물품 칸이 다시 그려지면 우리 칸이 지워진다 (pet-shop 의 render 가
// dream-body 를 통째로 쓴다). 그 안쪽 부름까지 다 잡을 수가 없으므로,
// 상점이 열려 있는 동안 스스로 되돌려 놓는다. 띠의 남은 시간도 여기서 돈다.
setInterval(function () {
    try {
        const panel = document.getElementById('shop-dream');
        if (!panel || !panel.classList.contains('active')) return;
        window.petMedPaint();
    } catch (e) { }
}, 1000);

// ==========================================
// 사택 맨 위의 다친 펫 띠
// ==========================================
//
//   전에는 다친 펫으로 가는 길이 「내 방」 아래 한 줄짜리 기분 묘사 안에
//   있는 작은 단추 하나뿐이었다. 그 줄은 방에 내놓은 펫이 있어야 뜨고,
//   25초에 한 번만 다시 그려졌다. 두 시간짜리 상처를 그렇게 다룰 수는 없다.
//   그래서 사택 첫 칸 **맨 위에** 같은 띠를 띄운다.
window.petHurtPaint = function () {
    const host = document.getElementById('house-main-body');
    if (!host || !u_()) return;
    const h = hurtBanner();
    let el = document.getElementById('pet-hurt-top');
    if (!h) { if (el) el.remove(); return; }
    if (!el || el.parentNode !== host) {
        if (el) try { el.remove(); } catch (e) { }
        el = document.createElement('div');
        el.id = 'pet-hurt-top';
    }
    if (host.firstChild !== el) host.insertBefore(el, host.firstChild);
    if (el.innerHTML !== h) el.innerHTML = h;
};

setInterval(function () {
    try {
        const panel = document.getElementById('house-main');
        if (!panel || !panel.classList.contains('active')) return;
        window.petHurtPaint();
    } catch (e) { }
}, 1000);

(function hookShop() {
    const iv = setInterval(function () {
        if (typeof renderDream !== 'function') return;
        if (renderDream._med) { clearInterval(iv); return; }
        const _r = renderDream;
        const w = function () {
            const out = _r.apply(this, arguments);
            setTimeout(function () { try { window.petMedPaint(); } catch (e) { } }, 60);
            return out;
        };
        w._med = true;
        renderDream = w;
        window.renderDream = w;
        clearInterval(iv);
        console.log('[펫] 망상 홈쇼핑에 치료 물품 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 다친 펫 창 — 내 방 아래
// ==========================================
window.petHurtOpen = function () {
    const u = u_();
    if (!u) return;
    const keys = anyHurt(u);
    if (!keys.length) { alert_('다친 펫이 없습니다.'); return; }
    const b = medBag(u);
    const have = MED.filter(function (x) { return Number(b[x[0]]) > 0; });

    const body = keys.map(function (k) {
        const h = pets(u)[k].hurt;
        const left = h.calm ? '곁에서 낫는 중' :
            Math.max(0, Math.ceil((Number(h.at) + DIE_MS - Date.now()) / 60000)) + '분 남음';
        return '<div style="border-top:1px solid rgba(255,255,255,0.08); padding:9px 0;">'
            + '<div style="display:flex; align-items:center; gap:8px;">'
            + '<img src="' + P().icon(k) + '" alt="" style="width:30px; height:30px;'
            + ' object-fit:contain; image-rendering:pixelated;">'
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:11px; color:#e8d7b4;">' + esc(nick(k, u)) + '</div>'
            + '<div style="font-size:9.5px; color:' + (h.calm ? '#7fd4d4' : '#e07a5f') + ';">'
            + '깊이 ' + h.deep + ' · ' + left + '</div></div></div>'
            + '<button class="game-btn" style="width:100%; margin:7px 0 0 0; padding:10px;'
            + ' font-size:11px; background:linear-gradient(145deg,#8a3a28,#4a1d12) !important;'
            + ' border-color:#e07a5f !important; color:#ffd9cd !important;"'
            + ' onclick="petHealBuy(\'' + esc(k) + '\')">한 번에 낫게 한다'
            + '<div style="font-size:9.5px; color:#ffb7a5; margin-top:3px; font-weight:normal;">'
            + '가진 것을 먼저 쓰고, 모자란 몫만 '
            + cheapest(Math.max(0, Number(h.deep) || 0)).cost.toLocaleString()
            + ' P 에 사서 깊이 0 까지</div></button>'
            + (have.length
                ? '<button class="game-btn" style="width:100%; margin:5px 0 0 0; padding:8px;'
                  + ' font-size:10px;" onclick="petHealFast(\'' + esc(k) + '\')">'
                  + '가진 것으로만 낫게 한다</button>'
                  + '<div style="font-size:9.5px; color:#8d8578; margin:7px 0 3px 0;">'
                  + '하나씩 골라 쓴다</div>'
                  + '<div style="display:flex; flex-wrap:wrap; gap:4px;">'
                  + have.map(function (x) {
                        return '<button class="game-btn" style="margin:0; padding:6px 8px;'
                            + ' font-size:10px;" onclick="petMedUse(\'' + esc(k) + '\',\''
                            + esc(x[0]) + '\')">' + esc(x[0]) + ' −' + x[1] + '</button>';
                    }).join('')
                  + '</div>'
                : '<div style="font-size:10px; color:#8d8578; margin-top:6px;">'
                  + '가진 치료 물품이 없습니다. 위 단추를 누르면 사서 바로 씁니다.</div>')
            + '</div>';
    }).join('');

    const w = document.createElement('div');
    w.id = 'pet-hurt-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:999994; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #e07a5f; border-radius:10px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; overflow-y:auto;">'
        + '<div style="font-size:12px; color:#e07a5f; font-weight:bold; margin-bottom:4px;">'
        + '🩹 다친 펫</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:6px; line-height:1.6;">'
        + '깊이를 0 까지 내려야 삽니다. 두 시간이 지나면 죽습니다.<br>'
        + '상담실·선녀탕에 들어가 있으면 곁에서 같이 낫습니다.</div>'
        + body
        + '<button class="game-btn" style="width:100%; margin:10px 0 0 0; padding:11px;'
        + ' font-size:12px; background:#2a2a2a !important; border-color:#444 !important;'
        + ' color:#aaa !important;" onclick="this.closest(\'#pet-hurt-modal\').remove()">닫는다</button>'
        + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) w.remove(); });
    document.body.appendChild(w);
};

// ==========================================
// 상담실 · 선녀탕 — 다치지 않았어도 따라 들어간다
// ==========================================
//
//   어둠을 따라갔던 펫은 주인이 끌려가도 따라 들어간다. 다친 펫은 위의
//   시계가 곁에 앉힌다. 여기서는 **멀쩡한 펫**이 따라 들어가는 쪽을 본다 —
//   교감 90 이상이면 어디든 따라간다.
let qWas = false;
setInterval(function () {
    const u = u_();
    if (!u) { qWas = false; return; }
    const on = quar(u);
    if (!on) { qWas = false; return; }
    if (qWas) return;
    qWas = true;

    const ps = pets(u);
    const come = Object.keys(ps).filter(function (k) {
        const s = ps[k];
        if (!s || s.out) return false;
        return s.hurt || (Number(s.bond) || 0) >= BOND_NEED;
    }).slice(0, MAX_SNEAK);
    if (!come.length) return;

    log_('[펫] ' + come.map(function (k) { return nick(k, u); }).join(' · ')
        + ' — 따라 들어와 곁에 있습니다.');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    setTimeout(function () {
        alert_('혼자 들어온 것이 아니었습니다.\n\n'
            + come.map(function (k) {
                return nick(k, u) + ' — ' + pick(CALM, kindOf(k));
            }).join('\n\n')
            + (come.some(function (k) { return ps[k].hurt; })
                ? '\n\n다친 펫은 여기서는 죽지 않습니다. 곁에서 천천히 낫습니다.' : ''));
    }, 1500);
}, 5000);

// ==========================================
// 주인의 포만도 · 오염도에 따른 한 줄
// ==========================================
function bondBand(v) { return v < 40 ? 'f' : (v < 80 ? 'm' : 'd'); }
function fullBand(v) { return v < 20 ? 'starve' : (v < 50 ? 'low' : (v < 80 ? 'mid' : 'good')); }
function pollBand(v) { return v < 20 ? 'clean' : (v < 50 ? 'soil' : (v < 80 ? 'bad' : 'worst')); }

function moodLine() {
    const u = u_();
    if (!u) return null;
    let ids = [];
    try { ids = P().show(u) || []; } catch (e) { ids = []; }
    ids = ids.filter(function (k) { return pets(u)[k]; });
    if (!ids.length) return null;
    const k = ids[Math.floor(Math.random() * ids.length)];
    const bond = (function () { try { return P().bond(k, u); } catch (e) { return 0; } })();
    const bb = bondBand(bond);
    // 오염도가 더 급하면 오염 쪽을 먼저 보여 준다
    const poll = Number(u.pollution) || 0;
    const sat = (u.satiety == null) ? 100 : Number(u.satiety);
    const useP = poll >= 50 || (poll >= 20 && sat >= 50);
    const pool = useP ? POLL[pollBand(poll)][bb] : FULL[fullBand(sat)][bb];
    return { id: k, t: pool[Math.floor(Math.random() * pool.length)],
             why: useP ? ('오염 ' + poll + '%') : ('포만 ' + sat) };
}

window.petMoodPaint = function () {
    const host = document.querySelector('#house-main-body');
    if (!host || !u_()) return;
    const room = document.querySelector('#pet-room-box');
    let el = document.querySelector('#pet-mood-line');
    const m = moodLine();
    if (!m) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'pet-mood-line';
        el.style.cssText = 'font-size:10.5px; color:#b8ac97; line-height:1.7;'
            + ' background:rgba(159,216,239,0.04); border-left:2px solid #2f4350;'
            + ' padding:7px 10px; margin-top:8px;';
        if (room && room.parentNode === host) host.insertBefore(el, room.nextSibling);
        else host.appendChild(el);
    }
    // 다친 펫으로 가는 단추는 사택 맨 위의 띠(petHurtPaint)로 옮겼다.
    // 25초에 한 번 그려지는 이 줄에 두 시간짜리 상처를 매달아 둘 수는 없다.
    el.innerHTML = '<b style="color:#9fd8ef;">' + esc(nick(m.id)) + '</b> — ' + esc(m.t)
        + ' <span style="color:#5f594f;">(' + esc(m.why) + ')</span>';
};

let lastMood = 0;
setInterval(function () {
    try {
        const panel = document.querySelector('#house-main');
        if (!panel || !panel.classList.contains('active')) return;
        if (Date.now() - lastMood < 25000) return;
        lastMood = Date.now();
        window.petMoodPaint();
    } catch (e) { }
}, 3000);

// ==========================================
// 콘솔
// ==========================================
window.petHurt = function () {
    const u = u_();
    console.log('%c===== 다친 펫 =====', 'color:#e07a5f; font-size:13px');
    if (!u) { console.log('  로그인 후에 쓰세요.'); return; }
    const keys = anyHurt(u);
    if (!keys.length) { console.log('  다친 펫이 없습니다.'); }
    else {
        console.table(keys.map(function (k) {
            const h = pets(u)[k].hurt;
            return { 펫: nick(k, u), 깊이: h.deep, 구역: h.zone || '-',
                     상태: h.calm ? '곁에서 낫는 중' : '두 시간 셈 중',
                     남은시간: h.calm ? '—'
                        : Math.max(0, Math.ceil((Number(h.at) + DIE_MS - Date.now()) / 60000)) + '분' };
        }));
    }
    const ps = pets(u);
    const sneak = Object.keys(ps).filter(function (k) { return ps[k] && ps[k].sneak; });
    console.log('  지금 따라 들어가 있는 펫 :', sneak.length
        ? sneak.map(function (k) { return nick(k, u); }).join(' · ') : '없음');
    const able = Object.keys(ps).filter(function (k) {
        return (Number(ps[k].bond) || 0) >= BOND_NEED;
    });
    console.log('  따라갈 수 있는 펫 (교감 ' + BOND_NEED + ' 이상) :',
        able.length ? able.map(function (k) { return nick(k, u) + '(' + ps[k].bond + ')'; }).join(' · ')
                    : '없음', '· 한 번에 ' + MAX_SNEAK + '마리까지');
    console.log('  가진 치료 물품 :', JSON.stringify(medBag(u)));
};

window.petMedShop = function () {
    const b = medBag(u_());
    console.log('%c===== 펫 치료 물품 =====', 'color:#e07a5f; font-size:13px');
    console.table(MED.map(function (x) {
        return { 물품: x[0], '깎는 깊이': x[1], 값: x[2].toLocaleString() + ' P',
                 '한 점당': Math.round(x[2] / x[1]) + ' P',
                 가진것: Number(b[x[0]]) || 0 };
    }));
    console.log('  깊이 100 짜리 상처는 하나로 안 낫습니다. 0 까지 내려야 삽니다.');
    console.log('%c  깊이별 가장 싼 조합', 'color:#e07a5f');
    console.table([40, 60, 80, 100].map(function (d) {
        const c = cheapest(d);
        return { 깊이: d, 값: c.cost.toLocaleString() + ' P', 조합: usedText(c.list) };
    }));
    console.log('  「한 번에 낫게」 단추가 이 조합을 그대로 씁니다.');
};

window.petHealAll = function () {
    const u = u_();
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = (typeof db !== 'undefined' && db.users) ? db.users : {};
    let n = 0;
    Object.keys(all).forEach(function (c) {
        const t = all[c];
        if (!t) return;
        let ps = {};
        try { ps = P().pets(t) || {}; } catch (e) { return; }
        Object.keys(ps).forEach(function (k) {
            if (!ps[k] || !ps[k].hurt) return;
            ps[k].hurt = null;
            n++;
            try {
                if (typeof database !== 'undefined' && database) {
                    database.ref('users/' + c + '/pets/' + k + '/hurt').set(null);
                }
            } catch (e) { }
        });
    });
    console.log('%c✓ 다친 펫 ' + n + '마리를 고쳤습니다.', 'color:#4CAF50');
};

// 들여다보기 — 묘사가 몇 가지인지
window._petSneak = { SNEAK: SNEAK, HURT: HURT, CALM: CALM, FULL: FULL, POLL: POLL,
                     MED: MED, pick: pick, bands: { bondBand: bondBand, fullBand: fullBand,
                     pollBand: pollBand }, zoneGrade: zoneGrade };

console.log('[펫] 몰래 따라가기 · 다침 — petHurt() · petMedShop()');

})();
