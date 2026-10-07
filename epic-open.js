// ==========================================
// ★ epic 어둠 — 들어오는 길 50가지
// bundles.json 마지막 묶음, epic-hard.js 다음 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   epic 은 들어올 때마다 똑같았다.
//       같은 머리글 → 배역 고르기 → 맡은 자리의 start 로 → 지도
//   첫 화면이 글자 하나 다르지 않고, 떨어지는 자리도 직업마다 고정이라
//   두 번째부터는 외운 길을 걸으면 됐다.
//
// ■ 어떻게 바꾸나
//
//   들어오는 순간 50가지 중 하나가 뽑힌다. 뽑힌 것에 따라
//       · 머리글이 통째로 다르다 (첫 화면부터 다르다)
//       · 떨어지는 자리가 다르다 (맡은 자리의 start 를 덮어쓴다)
//       · 판정 보정 · 시작 돈 · 오염 · 열리는 길 · 반입품 분실이 다르다
//
//   대부분은 불리하거나 엉뚱한 데 떨어뜨린다. 득이 큰 것은 드물게 나온다.
//   (무게 w — 10이 보통, 1~4는 드문 것)
//
//   일행으로 들어가면 **같은 길**을 쓴다. 한 사람이 뽑아 방에 적고
//   나머지는 그것을 읽는다. 같은 자리에 같이 떨어져야 하기 때문이다.
//
// ■ 끼어드는 자리
//   epicJobPick    머리글을 갈아 끼운다 (뽑는 것도 여기서)
//   epicAfterJob   떨어지는 자리를 덮어쓰고 숫자를 얹는다
//   epicBar        배역이 정해진 화면에 한 번만 길 안내를 붙인다
//   epicCanEnter   그 길이 열어 준 장소를 통과시킨다
//
// ■ 콘솔
//   epicOpenState()      지금 어떤 길인지 · 연결됐는지
//   epicOpenList()       50가지 전부 (무게 · 떨어지는 자리 · 효과)
//   EPIC_OPEN_FORCE = 7  다음 입장을 7번 길로 고정 (시험용 · null 이면 해제)

if (window.EPIC_OPEN_FORCE === undefined) window.EPIC_OPEN_FORCE = null;

(function epicOpen() {

// n 이름 · at 떨어지는 자리(null 이면 맡은 자리의 start) · e 효과 · x 머리글
//   효과 — mod 판정 보정 · sc 시작 돈 · poll 오염 · add 열리는 장소
//          flag er.flags 에 세우는 깃발 · drop 반입품 하나 분실 · w 무게
function O(n, at, e, x) { return Object.assign({ n: n, at: at, x: x }, e || {}); }

const OPENS = [

// ── 무너진 성문 ──
O('아치 아래', 'gate', {}, `문이 아니다. 문이 있던 자리다.<br><br>
    돌이 무너져 아치만 남았고, 그 너머가 밝다. 밝은데 해는 없다.<br><br>
    발을 들이자 등 뒤에서 돌이 제자리로 돌아가는 소리가 난다.<br>
    천천히, 빠짐없이.`),

O('돌이 먼저 닫혔다', 'gate', { poll: 4 }, `들어서기 전에 소리가 났다.<br><br>
    돌아보니 아치가 이미 메워져 있다. 들어오지도 않았는데.<br>
    그러니까 들어온 것이다.<br><br>
    먼지를 한 입 먹었다. 먼지 맛이 아니었다.`),

O('누가 먼저 들어갔다', 'gate', { mod: -1, sc: 200 }, `문턱에 발자국이 하나 있다. 안쪽을 향해 있다.<br><br>
    크기가 내 발과 같다. 깊이도 같다.<br>
    딱 한 쌍이고, 돌아 나온 자취는 없다.<br><br>
    그 자리에 떨어져 있던 동전 몇 개를 주웠다.`),

O('뒤에서 닫는 소리', 'gate', { mod: -1, poll: 3 }, `문은 아직 열려 있다.<br>
    그런데 닫는 소리가 벌써 들린다. 먼 데서, 여러 번.<br><br>
    여기는 소리가 먼저 오는 곳인 모양이다.<br>
    그러면 들은 것을 믿을 수가 없다.`),


// ── 끊긴 길 ──
O('빗물받이를 따라', 'road', { mod: 1 }, `길로 들어서지 않고 길 옆을 따라왔다.<br><br>
    돌로 짠 빗물받이가 끊긴 자리까지 이어져 있다.<br>
    물은 흐른 적이 없어 보이는데, 바닥이 닳아 있다.<br><br>
    남이 안 쓰는 길은 덜 지켜본다.`),

O('안개가 먼저 왔다', 'road', { poll: 6, mod: -1 }, `끊긴 자리에 고여 있던 안개가 마중을 나왔다.<br><br>
    숨을 한 번 쉬면 안이 차가워지고, 두 번 쉬면 따뜻해진다.<br>
    세 번째는 세지 않았다.<br><br>
    눈앞의 것이 어디쯤인지 가늠이 안 된다.`),

O('끊긴 자리에서', 'road', { sc: 400, poll: 3 }, `길의 중간이 사라진 자리에 서 있다.<br><br>
    아래를 보면 아래가 없다. 밑이 아니라 그냥 없다.<br>
    건너온 기억이 없는데 이쪽에 있다.<br><br>
    주머니에 들어 있던 것이 늘었다. 세어 보니 맞지 않는다.`),

O('말이 먼저 알았다', 'road', { mod: 1, sc: 200 }, `끌고 온 말이 아니다. 길에 서 있던 말이다.<br><br>
    고삐가 없는데 멈춰 서서 한쪽을 본다.<br>
    그쪽으로 가라는 것인지, 가지 말라는 것인지는 적혀 있지 않다.<br><br>
    등에 얹혀 있던 짐을 한 몫 챙겼다.`),

O('길이 하나 더 있었다', 'road', { add: ['market'] }, `끊긴 길 옆에 밟혀 다져진 자리가 있다.<br><br>
    지도에는 없고, 사람이 지난 자취는 많다.<br>
    오래된 길이 아니라 요즘 생긴 길이다.<br><br>
    이 길은 장터로 이어진다. 누가 다니는 길인지는 모르겠다.`),

// ── 빈 마을 ──
O('굴뚝 연기', 'village', { mod: 1 }, `사람이 없는데 굴뚝에서 연기가 난다.<br><br>
    집마다 불을 땐 지 얼마 안 됐다. 솥이 아직 뜨겁다.<br>
    상은 차려져 있고, 수가 하나 모자란다.<br><br>
    남은 자리에 앉아 한 술 떴다. 간이 맞았다.`),

O('문이 열려 있었다', 'village', { sc: 300 }, `마을의 문이 전부 열려 있다. 안쪽으로.<br><br>
    바람이 불면 전부 같이 흔들리는데 소리가 하나뿐이다.<br><br>
    가장 가까운 집에서 쓸 만한 것을 챙겼다.<br>
    훔친 것은 아니다. 주인이 없으니까.`),

O('아이 울음', 'village', { poll: 5 }, `어느 집에서 아이가 운다. 들어가면 그친다.<br><br>
    나오면 다시 운다. 다른 집에서.<br>
    따라가다 보니 마을을 두 바퀴 돌았다.<br><br>
    두 바퀴를 돌 만한 크기가 아니었다.`),

O('동료가 먼저 사라졌다', 'village', { mod: -2, sc: 1200, w: 2 }, `같이 들어온 사람이 있었다. 이름이 기억나지 않는다.<br><br>
    마을에 들어설 때까지는 옆에 있었다.<br>
    지금은 발자국만 남아 있고, 그것도 중간에 끊긴다.<br><br>
    그가 들고 있던 것이 내 손에 있다. 묵직하다.`),


// ── 열린 장터 ──
O('좌판 사이로', 'market', { sc: 500 }, `파는 사람은 있는데 사는 사람이 없다.<br><br>
    좌판이 길게 이어지고, 어느 쪽 끝도 보이지 않는다.<br>
    값을 묻자 전부 같은 값을 불렀다.<br><br>
    흥정할 상대가 없어서 그냥 집어 왔다. 아무도 보지 않았다.`),

O('값을 먼저 치렀다', 'market', { sc: -300, mod: 2 }, `들어오는 자리에 값을 받는 사람이 앉아 있었다.<br><br>
    무엇의 값인지는 말하지 않았다. 액수만 말했다.<br>
    치르고 나니 길이 똑바로 보인다.<br><br>
    치르지 않은 사람에게는 어떻게 보일지 모르겠다.`),

O('장이 걷히는 중', 'market', { mod: -1 }, `장터가 접히고 있다. 천막이 하나씩 내려간다.<br><br>
    늦게 왔다는 뜻이다. 남은 것은 남은 까닭이 있는 것들이다.<br><br>
    그래도 비어 가는 좌판 사이는 걷기가 편하다.<br>
    숨을 데가 없다는 뜻이기도 하다.`),

O('빈손으로 들어갔다', 'market', { drop: true, mod: 1 }, `문 앞에서 짐을 하나 내려놓게 했다.<br><br>
    들여보내는 값이라고 했다. 받는 사람은 없었다.<br>
    내려놓은 것은 돌아보니 없었다.<br><br>
    가벼운 몸으로 들어서니 발소리가 작다.`),


// ── 검은 숲 ──
O('기울어진 나무', 'forest', { mod: 1 }, `나무가 전부 같은 방향으로 기울어 있다.<br><br>
    기운 쪽으로 걸으면 내리막이고, 반대로 걸으면 내리막이다.<br>
    어느 쪽이든 내려간다.<br><br>
    기운 방향만 알면 길을 잃지는 않는다.`),

O('발자국이 거꾸로', 'forest', { poll: 6 }, `앞서간 발자국이 있다. 뒤꿈치가 앞을 향해 있다.<br><br>
    뒤로 걸은 것이 아니다. 발이 그렇게 생긴 것이다.<br>
    보폭이 일정하고, 오래 걸은 솜씨다.<br><br>
    그것과 같은 방향으로 가고 있다.`),

O('숲이 먼저 알았다', 'forest', { mod: -1, sc: 600 }, `들어서자 새가 전부 한꺼번에 날았다.<br><br>
    한 마리도 소리를 내지 않았다.<br>
    남은 자리에 둥지가 비어 있고, 안에 돈이 될 것이 있다.<br><br>
    챙기긴 했지만, 알려진 채로 걷는 셈이다.`),

O('불을 들고', 'forest', { mod: 2, poll: 4, w: 5 }, `마른 가지를 묶어 불을 켰다.<br><br>
    불빛이 닿는 데까지는 전부 보인다. 아주 선명하게.<br>
    닿지 않는 데도 전부 보고 있다. 아주 선명하게.<br><br>
    보이는 것이 늘면 들키는 것도 는다. 그래도 들었다.`),


// ── 거울 호수 ──
O('물이 먼저 비췄다', 'lake', { add: ['tower'] }, `호수에 비친 하늘이 실제 하늘과 다르다.<br><br>
    비친 쪽에는 탑이 서 있다. 돌아보면 없다.<br>
    물속의 탑은 기울어 있지 않다.<br><br>
    어느 쪽이 베낀 것인지 모르겠지만, 가는 길은 알았다.`),

O('호수가 말랐다', 'lake', { poll: 4, mod: 1 }, `물이 없다. 물이 있던 자리가 그대로 남아 있다.<br><br>
    바닥에 비친 것이 그대로 말라붙어 있다. 하늘이, 구름이.<br>
    밟으면 금이 간다.<br><br>
    가운데까지 걸어 들어갈 수 있다.`),

O('젖은 채로', 'lake', { poll: 7, mod: 1 }, `정신을 차리니 허리까지 물에 들어가 있다.<br><br>
    들어온 기억이 없고, 옷이 전부 젖어 있다.<br>
    물은 따뜻하다. 몸보다 조금 더.<br><br>
    젖은 발은 자취를 남기지만, 자취는 마른다.`),

O('비친 것이 먼저 움직였다', 'lake', { mod: -2, sc: 900, w: 4 }, `물에 비친 내가 먼저 손을 들었다.<br><br>
    따라 들었다. 이번에는 같이 들었다.<br>
    세 번째에는 비친 쪽이 손을 내리지 않았다.<br><br>
    그 손에 쥐여 있던 것을 받았다. 받은 손이 아직 시리다.`),


// ── 무너진 신전 ──
O('촛불이 켜져 있었다', 'temple', { mod: 1 }, `제단은 깨졌는데 촛불은 켜져 있다.<br><br>
    심지가 줄지 않는다. 밀랍도 흐르지 않는다.<br>
    손을 가까이 대면 따뜻하지 않다.<br><br>
    그래도 불은 불이다. 어두운 데서는 그걸로 충분하다.`),

O('제단에서 잤다', 'temple', { sc: 300, poll: 3 }, `들어와서 바로 잠들었다. 그런 적이 없는데.<br><br>
    깨어 보니 제단 위에 누워 있고, 몸이 가볍다.<br>
    옆에 누가 두고 간 것이 있다.<br><br>
    두고 간 것인지 바친 것인지는 알 수 없다.`),

O('기도가 끝난 자리', 'temple', { mod: -1, add: ['grave'] }, `무릎 자국이 돌에 파여 있다. 수없이 겹쳐서.<br><br>
    마지막 사람이 일어난 지 오래되지 않았다. 자리가 따뜻하다.<br><br>
    그 사람이 보던 쪽에 문이 하나 있다.<br>
    묘로 내려가는 문이다.`),

O('종이 울렸다', 'temple', { mod: -1, poll: 5 }, `들어서는 순간 종이 한 번 울렸다.<br><br>
    종루는 무너져 있고, 종은 바닥에 엎어져 있다.<br>
    엎어진 종이 울린 것이다.<br><br>
    울린 소리를 들은 것이 나만은 아닐 것이다.`),


// ── 이름 없는 묘 ──
O('백지 비석 사이', 'grave', { poll: 8 }, `비석이 전부 백지다. 깎인 게 아니라 원래 그랬다.<br><br>
    줄과 줄 사이가 좁아서 어깨가 스친다.<br>
    스칠 때마다 비석이 조금 따라 돈다.<br><br>
    돌아보면 지나온 줄이 하나 늘어 있다.`),

O('이름을 하나 주웠다', 'grave', { sc: 700, mod: -1 }, `바닥에 돌조각이 하나 떨어져 있다.<br><br>
    글자가 새겨진 조각이고, 이름의 가운데쯤이다.<br>
    주워서 주머니에 넣었다.<br><br>
    주머니가 무겁다. 조각 무게가 아니다.`),

O('묘지기의 등', 'grave', { mod: 1 }, `앞서가는 등이 있다. 묘지기의 등이다.<br><br>
    세면서 걷는다. 숫자가 올라가다가 가끔 내려간다.<br>
    따라 걸으면 밟을 자리를 알려 준다.<br><br>
    말을 걸면 숫자가 처음으로 돌아간다. 걸지 않았다.`),

O('내 자리가 있었다', 'grave', { mod: -2, sc: 1100, w: 3 }, `백지 비석 가운데 하나에만 글자가 있다.<br><br>
    읽을 수 있다. 읽고 나서 한참 서 있었다.<br>
    흙이 덮이지 않았고, 파인 자리가 비어 있다.<br><br>
    비어 있는 자리에 부장품이 들어 있었다. 내 것이라 해도 되겠다.`),


// ── 폐허 회랑 ──
O('지붕 없는 회랑', 'ruin', { mod: -1 }, `기둥이 서 있는데 지붕이 없다. 있던 적도 없어 보인다.<br><br>
    기둥 사이로 걸으면 그림자가 생기지 않는다.<br>
    위에 아무것도 없는데 그늘은 있다.<br><br>
    가릴 것이 없는 자리다.`),

O('무너지는 소리', 'ruin', { poll: 6, sc: 400 }, `들어서는 중에 뒤쪽이 무너졌다.<br><br>
    돌아갈 길이 줄었다는 뜻이고, 쫓아올 길도 줄었다는 뜻이다.<br><br>
    무너진 자리에서 오래된 것이 드러났다.<br>
    꺼내는 데 손을 긁혔다.`),


O('지도에 없는 자리', 'deep', { flag: 'deepFound', mod: -2, w: 1 }, `회랑 끝에서 발을 디딘 자리가 아래로 꺼졌다.<br><br>
    떨어지는 동안 벽에 글자가 지나갔다. 전부 같은 글자였다.<br><br>
    바닥은 있었다. 여기부터는 지도에 없다.<br>
    나가는 길도 지도에 없다.`),


// ── 기울어진 탑 ──
O('바깥으로 도는 계단', 'tower', { mod: -1, add: ['tower'] }, `계단이 안쪽이 아니라 바깥으로 돈다.<br><br>
    오르는데 아래가 보인다. 올라갈수록 넓게 보인다.<br>
    난간은 없다.<br><br>
    한 바퀴 돌고 나니 들어왔던 문이 보이지 않는다.`),

O('꼭대기에서 떨어진 것', 'tower', { sc: 900, poll: 6, w: 4 }, `탑 밑에 뭔가 떨어져 있다. 아주 높은 데서 떨어진 모양이다.<br><br>
    깨지지 않았고, 아직 따뜻하다.<br>
    주워 들자 위에서 한 번 더 떨어지는 소리가 났다.<br><br>
    올려다보지 않고 걸었다.`),

O('별이 하나 비었다', 'tower', { mod: 1, w: 6 }, `탑에 오르기 전에 하늘을 봤다.<br><br>
    해는 없는데 별은 있다. 한 자리가 비어 있다.<br>
    빈 자리를 오래 보면 눈에 남는다.<br><br>
    눈에 남은 자리가 길을 가리킨다.`),

O('문장을 외우고', 'tower', { mod: 1, sc: -300 }, `탑 문에 문장이 적혀 있다. 외우라고 적혀 있다.<br><br>
    외우는 데 값이 들었다. 가진 것에서 조금씩 빠졌다.<br><br>
    외운 뒤에는 읽는 것이 쉬워졌다.<br>
    무엇을 주고 외웠는지는 적혀 있지 않았다.`),

// ── 잠긴 성 ──
O('문이 안에서 잠겼다', 'castle', { poll: 5 }, `문이 안에서 잠겼다. 안에 아무도 없는데.<br><br>
    걸쇠가 내려간 자리에 손자국이 있다. 안쪽에.<br>
    크기가 작다. 아이 손이다.<br><br>
    담을 넘어 들어갔다. 넘는 동안 아무도 말리지 않았다.`),

O('창이 하나 열려 있었다', 'castle', { mod: 1, add: ['castle'] }, `잠긴 성에 창이 하나 열려 있다. 가장 높은 창이다.<br><br>
    아래에서 보면 닫혀 있고, 담에 올라서면 열려 있다.<br><br>
    들어가 보니 안쪽은 아무도 지키지 않는다.<br>
    지킬 것이 이미 없는 것인지도 모른다.`),

O('성 안에서 깼다', 'castle', { sc: 600, mod: -2, w: 4 }, `눈을 뜨니 성 안이다. 들어온 기억이 없다.<br><br>
    옷이 갈려 있고, 손에 쥐고 있던 것이 다른 것으로 바뀌어 있다.<br>
    바뀐 것이 더 값나간다.<br><br>
    여기 사람들이 나를 알아보는 것 같다. 그게 문제다.`),

O('이름을 불렸다', null, { mod: -2, sc: 1000, w: 3 }, `들어서는데 누가 이름을 불렀다.<br><br>
    내 이름이다. 여기서 알 수 없는 이름이다.<br>
    돌아보지 않았는데 한 번 더 불렀다.<br><br>
    대답하지 않은 값으로 무언가를 받았다. 받고 나서 손이 떨렸다.`),

// ── 자기 자리로 ──
O('그림자가 먼저', null, { mod: -1 }, `그림자가 발보다 먼저 들어갔다.<br><br>
    따라 들어가니 그림자가 반대쪽에 붙어 있다.<br>
    해가 없는데 그림자가 있는 것부터가 그렇다.<br><br>
    가끔 내가 멈춰도 그림자는 조금 더 간다.`),

O('손에 쥔 것', null, { drop: true }, `문턱에서 손에 쥐고 있던 것을 떨어뜨렸다.<br><br>
    주우려고 보니 바닥이 멀다. 손이 닿지 않는다.<br>
    떨어뜨린 것은 바닥에 닿지도 않았다.<br><br>
    그냥 들어가기로 했다. 하나 없어도 걸을 수는 있다.`),

O('아무도 없었다', null, { mod: 1, sc: -200 }, `같이 들어가기로 한 사람들이 오지 않았다.<br><br>
    기다리는 동안 해가 기울지 않았다. 그래서 얼마나 기다렸는지 모른다.<br><br>
    혼자 걷는 것은 조용하다.<br>
    기다리는 데 쓴 것이 있다. 돈은 아니었는데 돈이 줄었다.`),

O('두 번째로 들어왔다', null, { sc: 800, mod: -1, w: 5 }, `들어온 적이 있다. 기억은 없는데 몸이 안다.<br><br>
    발이 먼저 방향을 잡고, 손이 먼저 짚을 자리를 찾는다.<br><br>
    전에 두고 간 것이 그 자리에 있었다.<br>
    두고 간 까닭이 있었을 것이다. 그래도 들었다.`),

O('굶고 들어왔다', null, { poll: 10, w: 6 }, `먹은 것이 없다. 먹을 생각도 없었다.<br><br>
    배가 고프면 눈이 밝아진다는 말이 있는데, 밝아지지 않았다.<br><br>
    대신 소리가 크게 들린다. 내 소리까지.<br>
    몸이 먼저 상한다.`),

O('꿈에서 이어졌다', null, { mod: 1, sc: 400, w: 4 }, `잠들었다가 여기서 깼다. 복도에서 잠든 기억은 있다.<br><br>
    꿈에서 본 자리와 똑같은 자리에 서 있다.<br>
    꿈에서는 다음에 무슨 일이 있었는지 안다.<br><br>
    안다고 생각한다. 꿈은 대개 그렇다.`)

];

// ==========================================
// 뽑기 — 무게를 본다
// ==========================================
function weight(o) { return (typeof o.w === 'number') ? Math.max(1, o.w) : 10; }

function pickId() {
    if (typeof window.EPIC_OPEN_FORCE === 'number'
        && OPENS[window.EPIC_OPEN_FORCE]) return window.EPIC_OPEN_FORCE;
    let sum = 0;
    OPENS.forEach(function (o) { sum += weight(o); });
    let r = Math.random() * sum;
    for (let i = 0; i < OPENS.length; i++) {
        r -= weight(OPENS[i]);
        if (r <= 0) return i;
    }
    return OPENS.length - 1;
}

function cur() {
    if (typeof er === 'undefined' || !er) return null;
    return OPENS[er.openId] || null;
}

// 일행이면 방에 적힌 것을 같이 쓴다
function decide(cb) {
    const mine = pickId();
    if (typeof darkRun === 'undefined' || !darkRun
        || !darkRun.isParty || !darkRun.partyId
        || typeof database === 'undefined' || !database) {
        er.openId = mine; cb(); return;
    }
    const path = 'darkParties/' + darkRun.partyId + '/epicOpen';
    // ★ 되돌리는 값이 undefined 면 트랜잭션이 그 자리에서 멈춘다.
    //   서버에 없는 자리를 처음 읽을 때 그렇게 되므로, 비어 있으면
    //   내 것을 넣고 이미 있으면 그것을 그대로 돌려준다.
    database.ref(path).transaction(function (c) {
        return (c === null || c === undefined) ? mine : c;
    }).then(function (res) {
        let v = null;
        try { v = (res && res.snapshot) ? res.snapshot.val() : null; } catch (e) { }
        er.openId = (typeof v === 'number' && OPENS[v]) ? v : mine;
        cb();
    }).catch(function () { er.openId = mine; cb(); });
}

// ==========================================
// 머리글 — 뽑힌 길의 글로 갈아 끼운다
// ==========================================
const TAIL = `<div style="border-top:1px dashed #333; margin:14px 0 12px 0;"></div>
    벽에 글자가 새겨져 있다. 대부분 깎여 나갔다.<br>
    <span style="color:#d4af37;">"■■이 ■■를 ■■하던 시절의 ■■■"</span><br>
    읽을 수 있는 글자는 둘뿐이다. <span style="color:#d4af37;">"영웅"</span>`;

function introOf(o) {
    return `<div style="font-size:10px; color:#d4af37; letter-spacing:1px; margin-bottom:8px;">◇ ${o.n}</div>`
        + o.x + TAIL;
}

let pending = false;          // 배역이 정해진 화면에 한 번만 붙인다

(function hookJobPick() {
    const iv = setInterval(function () {
        if (typeof epicJobPick !== 'function') return;
        if (epicJobPick._open) { clearInterval(iv); return; }

        const _pick = epicJobPick;

        function draw() {
            const o = cur();
            if (!o || typeof DARK_ZONES === 'undefined') return _pick();
            const z = DARK_ZONES['Qtrew-???-■■■'];
            if (!z) return _pick();
            const keep = z.intro;
            z.intro = introOf(o);
            try { return _pick(); } finally { z.intro = keep; }
        }

        epicJobPick = function () {
            if (typeof er === 'undefined' || !er) return _pick.apply(this, arguments);
            if (er.openId != null) return draw();          // 이미 뽑혔다 (다시 고르는 길)

            if (darkRun && darkRun.isParty) {
                try {
                    darkBodyEl().innerHTML = darkBox('들어오는 길',
                        '어느 길로 들어왔는지 맞춰 보는 중입니다.<br>'
                        + '<span style="font-size:11px; color:#888;">일행은 같은 길로 들어옵니다.</span>', '');
                } catch (e) { }
            }
            decide(draw);
        };
        epicJobPick._open = true;
        clearInterval(iv);
        console.log('[epic] 들어오는 길 ' + OPENS.length + '가지 연결');
    }, 400);
})();

// ==========================================
// 떨어지는 자리와 숫자
// ==========================================
function applyNums(o) {
    if (!o || !er) return;
    if (o.mod) darkRun.modifier = (darkRun.modifier || 0) + o.mod;
    if (o.sc) er.score = Math.max(0, (er.score || 0) + o.sc);
    if (o.poll && typeof applyPollutionToUser === 'function') {
        try { applyPollutionToUser(currentUser, o.poll); } catch (e) { }
    }
    if (o.flag) { er.flags = er.flags || {}; er.flags[o.flag] = true; }
    if (o.add) { er.flags = er.flags || {}; er.flags.openAdd = o.add.slice(); }
    if (o.drop && darkRun.carryItems && darkRun.carryItems.length) {
        const lost = darkRun.carryItems.pop();
        darkRun.lostItems = darkRun.lostItems || [];
        darkRun.lostItems.push(lost);
        er.openLost = lost;
    }
    darkRun.log.push('[길] ' + o.n);
}

(function hookAfterJob() {
    const iv = setInterval(function () {
        if (typeof epicAfterJob !== 'function') return;
        if (epicAfterJob._open) { clearInterval(iv); return; }

        const _after = epicAfterJob;
        epicAfterJob = function (k) {
            const o = cur();
            const j = (typeof EPIC_JOBS !== 'undefined') ? EPIC_JOBS[k] : null;

            // 떨어지는 자리 — 원래 함수가 start 를 읽으므로 그 동안만 바꿔 둔다
            let keep = null, swap = false;
            if (o && o.at && j && EPIC_PLACES[o.at]) {
                keep = j.start; j.start = o.at; swap = true;
            }
            pending = true;
            let r;
            try { r = _after.apply(this, arguments); }
            finally {
                if (swap) j.start = keep;
                pending = false;
            }
            applyNums(o);
            return r;
        };
        epicAfterJob._open = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 배역이 정해진 화면에 길 안내를 한 번 붙인다
//   epicBar() 가 글 상자 바로 아래에 들어가므로 거기에 얹는다
// ==========================================
function cardOf(o) {
    if (!o) return '';
    const bits = [];
    if (o.at && typeof EPIC_PLACES !== 'undefined' && EPIC_PLACES[o.at]) {
        bits.push('떨어진 자리 <b style="color:#d4af37;">'
            + EPIC_PLACES[o.at].icon + ' ' + EPIC_PLACES[o.at].name + '</b>');
    } else {
        bits.push('떨어진 자리 <b style="color:#d4af37;">맡은 자리의 본래 자리</b>');
    }
    if (o.mod) bits.push('판정 <b style="color:' + (o.mod > 0 ? '#4CAF50' : '#f44336') + ';">'
        + (o.mod > 0 ? '+' : '') + o.mod + '</b>');
    if (o.sc) bits.push((o.sc > 0 ? '쥐고 시작 ' : '치르고 시작 ')
        + '<b style="color:#d4af37;">' + Math.abs(o.sc).toLocaleString() + ' P</b>');
    if (o.poll) bits.push('오염 <b style="color:#f44336;">+' + o.poll + '%</b>');
    if (o.add && o.add.length && typeof EPIC_PLACES !== 'undefined') {
        bits.push('열린 길 <b style="color:#4fc3f7;">'
            + o.add.map(function (k) {
                return EPIC_PLACES[k] ? EPIC_PLACES[k].name : k;
            }).join(' · ') + '</b>');
    }
    if (o.flag === 'deepFound') bits.push('<b style="color:#e91e63;">지도에 없는 곳이 열렸다</b>');
    if (er && er.openLost) bits.push('잃은 반입품 <b style="color:#f44336;">' + er.openLost + '</b>');

    return `<div style="background:rgba(212,175,55,0.07); border:1px solid #5a4a2a; border-radius:6px;
                 padding:10px 12px; margin:0 0 10px 0; font-size:10px; color:#bbb; line-height:1.9;">
            <span style="color:#d4af37; font-weight:bold;">◇ 들어온 길 — ${o.n}</span><br>
            ${bits.join(' <span style="color:#555;">·</span> ')}
        </div>`;
}

(function hookBar() {
    const iv = setInterval(function () {
        if (typeof epicBar !== 'function') return;
        if (epicBar._open) { clearInterval(iv); return; }
        const _bar = epicBar;
        epicBar = function () {
            let s = _bar.apply(this, arguments);
            if (pending) { try { s += cardOf(cur()); } catch (e) { } }
            return s;
        };
        epicBar._open = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 그 길이 열어 준 장소를 통과시킨다
// ==========================================
(function hookCanEnter() {
    const iv = setInterval(function () {
        if (typeof epicCanEnter !== 'function') return;
        if (epicCanEnter._open) { clearInterval(iv); return; }
        const _can = epicCanEnter;
        epicCanEnter = function (key) {
            try {
                if (er && er.flags && Array.isArray(er.flags.openAdd)
                    && er.flags.openAdd.indexOf(key) >= 0) {
                    const p = EPIC_PLACES[key];
                    if (p && !(p.hidden && !er.flags.deepFound)) return true;
                }
            } catch (e) { }
            return _can.apply(this, arguments);
        };
        epicCanEnter._open = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.epicOpenList = function () {
    let sum = 0;
    OPENS.forEach(function (o) { sum += weight(o); });
    console.log('%c===== 들어오는 길 ' + OPENS.length + '가지 =====', 'color:#d4af37; font-size:13px');
    console.table(OPENS.map(function (o, i) {
        const e = [];
        if (o.mod) e.push('판정 ' + (o.mod > 0 ? '+' : '') + o.mod);
        if (o.sc) e.push((o.sc > 0 ? '+' : '') + o.sc + ' P');
        if (o.poll) e.push('오염 +' + o.poll);
        if (o.add) e.push('열림 ' + o.add.join('/'));
        if (o.flag) e.push('깃발 ' + o.flag);
        if (o.drop) e.push('반입품 1개 분실');
        return {
            번호: i, 이름: o.n,
            자리: o.at ? (EPIC_PLACES[o.at] ? EPIC_PLACES[o.at].name : o.at) : '(맡은 자리)',
            효과: e.join(' · ') || '없음',
            무게: weight(o),
            확률: (weight(o) / sum * 100).toFixed(1) + '%'
        };
    }));
    console.log('  고정하려면 — EPIC_OPEN_FORCE = 번호  (해제는 null)');
};

window.epicOpenState = function () {
    console.log('%c===== 들어오는 길 =====', 'color:#d4af37; font-size:13px');
    console.log('  연결 — 머리글:', (typeof epicJobPick === 'function' && epicJobPick._open) ? 'O' : '✗',
        '· 자리:', (typeof epicAfterJob === 'function' && epicAfterJob._open) ? 'O' : '✗',
        '· 안내:', (typeof epicBar === 'function' && epicBar._open) ? 'O' : '✗',
        '· 길 열기:', (typeof epicCanEnter === 'function' && epicCanEnter._open) ? 'O' : '✗');
    console.log('  고정:', (typeof window.EPIC_OPEN_FORCE === 'number') ? window.EPIC_OPEN_FORCE : '없음');
    if (typeof er === 'undefined' || !er) { console.log('  지금 epic 안이 아닙니다.'); return; }
    const o = cur();
    if (!o) { console.log('  아직 뽑히지 않았습니다.'); return; }
    console.log('  이번 길:', er.openId + '번 · ' + o.n);
    console.log('  떨어진 자리:', o.at || '(맡은 자리)', '· 지금:', er.place);
    console.log('  얹힌 보정:', darkRun ? (darkRun.modifier || 0) : '-', '· 점수:', er.score);
    if (er.flags && er.flags.openAdd) console.log('  열린 길:', er.flags.openAdd.join(', '));
    if (er.openLost) console.log('  잃은 반입품:', er.openLost);
};

window.EPIC_OPENS = OPENS;

console.log('[epic] 들어오는 길 ' + OPENS.length + '가지 — epicOpenList() · epicOpenState()');

})();
