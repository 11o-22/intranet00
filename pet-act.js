// ==========================================
// ★ 펫이 저지른 일 — 혼낼 것인가 쓰다듬을 것인가
// bundles.json 마지막 묶음, pet-talk.js 보다 뒤 (갈래 표를 빌려 쓴다)
// ==========================================
//
// ■ 무엇이 생기나
//
//   사택 칸을 열면 방에 나와 있는 펫이 저지른 일이 하나 걸린다.
//
//       실수로 이불에 소변을 봤다. 당신 눈치를 보고 있다.
//                [ 혼낸다 ]        [ 쓰다듬는다 ]
//
//   갈래 아홉마다 열 가지씩 — 모두 아흔 가지다. 일마다 혼냈을 때와
//   쓰다듬었을 때의 반응이 따로 있으니 글은 270가지다.
//   갈래는 pet-talk.js 의 표를 그대로 쓴다 — 개 · 고양이 · 새 · 물 ·
//   기는 것 · 작은 털 · 곰 · 발굽 · 나비.
//
// ■ 고르는 값
//
//   열 가지 가운데 여섯이나 일곱은 **잘못**이고, 나머지는 잘못이 아니다
//   (마중 · 선물 · 곁에 있기). 글을 읽지 않으면 가릴 수 없게 두었다.
//
//       잘못을 혼낸다      버릇이 고쳐진다 — 그 일은 다시 안 난다. 교감 −2
//       잘못을 쓰다듬는다  교감 +1~2. 버릇은 그대로다 — 또 난다
//       잘못이 아닌데 혼낸다   교감 −4. 영문을 모른다
//       잘한 것을 쓰다듬는다   교감 +2~3
//
//   오르는 쪽은 **하루 교감 몫(10)에서 깎는다.** 쓰다듬기·놀아주기와 같은
//   주머니다 — 일이 났다고 교감이 공짜로 붙으면 그쪽이 뜻을 잃는다.
//   내려가는 쪽은 하루 몫을 되돌리지 않는다. 깎인 것을 다시 올리려면
//   남은 몫이 있어야 한다.
//
//   혼내서 고친 버릇은 pets[번호].fix 에 번호로 쌓인다. 열 가지를 다
//   고치면 그 펫은 더 이상 아무 일도 저지르지 않는다.
//
// ■ 언제 나나
//
//   사택 칸이 열릴 때. 두 시간에 한 번, 하루 세 번까지다.
//   나가 있는 펫 · 몰래 따라간 펫 · 다친 펫(pet-sneak)은 빠진다.
//   격리 중에도 안 뜬다.
//
//   한 번 걸린 일은 고르기 전까지 pets[번호].act 에 남는다. 창을 닫고
//   나가도 다음에 다시 뜬다 — 「나중에 본다」는 미루는 것일 뿐이다.
//
// ■ 적히는 자리
//
//   pets[번호].act  { i: 일 번호, at: 난 때 }     걸려 있는 일
//   pets[번호].fix  [ 일 번호 … ]                 혼내서 고친 버릇
//   u.petActAt      마지막으로 일이 난 때
//   u.petActDay     { d: 날짜, v: 그날 몇 번 }
//
//   ★ 일 번호는 갈래마다 백 단위로 떼어 두었다 (개 101~110, 고양이
//     201~210 …). 나중에 일을 더 넣어도 이미 고친 버릇이 딴 일로
//     바뀌지 않게 하려는 것이다. 번호는 한 번 붙이면 바꾸지 않는다.
//
// ■ 콘솔
//   petActNow()        지금 바로 하나 띄운다
//   petActList()       아흔 가지 전부
//   petActState()      쿨타임 · 오늘 몇 번 · 고친 버릇
//   petActClear()      걸려 있는 일과 고친 버릇을 지운다 (다시 보기)

(function petAct() {

const MOD = 'pet-act-modal';
const GAP = 2 * 3600 * 1000;       // 일이 나는 사이
const DAY_MAX = 3;                 // 하루에 몇 번까지
const DROP_BAD = 2;                // 잘못을 혼냈을 때 교감 −
const DROP_GOOD = 4;               // 잘못이 아닌데 혼냈을 때 교감 −
const UP_BAD = [1, 2];             // 잘못을 쓰다듬었을 때 교감 +
const UP_GOOD = [2, 3];            // 잘한 것을 쓰다듬었을 때 교감 +

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }
function kindOf(id) {
    try { return (window.PETTALK && window.PETTALK.KIND[id]) || 'small'; }
    catch (e) { return 'small'; }
}
const KIND_NAME = { dog: '개', cat: '고양이', bird: '새', water: '물', rept: '기는 것',
                    small: '작은 털', bear: '곰', hoof: '발굽', bug: '나비' };

// ==========================================
// 아흔 가지
// ==========================================
//
//   i    번호 (한 번 붙이면 바꾸지 않는다)
//   k    갈래
//   bad  1 이면 잘못이다 (혼내면 버릇이 고쳐진다)
//   t    일어난 일
//   s    혼냈을 때
//   p    쓰다듬었을 때
const ACT = [

// ───── 개 — 리트리버 · 여우 · 치와와 · 늑대
{ i: 101, k: 'dog', bad: 1,
  t: '실수로 이불에 소변을 봤다. 당신 눈치를 보고 있다.',
  s: '머리를 바닥에 붙이고 눈만 들어 당신을 본다. 꼬리가 다리 사이로 접힌다.',
  p: '용서받은 것으로 알아듣고, 젖은 자리 위에서 꼬리를 흔든다.' },
{ i: 102, k: 'dog', bad: 1,
  t: '현관에 둔 구두 한 짝을 물고 와 방 가운데 놓았다. 뒤축이 없다.',
  s: '구두를 다시 물어다 현관에 놓는다. 뒤축은 끝까지 안 가져온다.',
  p: '칭찬으로 듣고 나머지 한 짝을 가져오려 달려 나간다.' },
{ i: 103, k: 'dog', bad: 1,
  t: '사원증 끈을 씹어 끊어 놓았다. 입가에 실밥이 붙어 있다.',
  s: '입을 꾹 닫고 실밥을 삼킨다. 증거를 치우려는 것처럼.',
  p: '끊어진 끈을 다시 물어 와 당신 손에 쥐여 준다. 고쳐 달라는 뜻이다.' },
{ i: 104, k: 'dog', bad: 1,
  t: '쓰레기통을 엎고 그 안에 코를 박고 있다.',
  s: '귀가 납작해진다. 엎은 통을 코로 밀어 세워 보려다 만다.',
  p: '허락인 줄 알고 더 깊이 들어간다. 이마까지 들어갔다.' },
{ i: 105, k: 'dog', bad: 1,
  t: '한밤중에 아무것도 없는 복도를 보고 짖었다. 세 번.',
  s: '짖음을 삼킨다. 그래도 복도 쪽에서 눈을 떼지 않는다.',
  p: '당신 다리에 몸을 붙이고, 짖는 대신 낮게 으르렁거린다.' },
{ i: 106, k: 'dog', bad: 1,
  t: '당신 자리에 올라가 자고 있었다. 일어나면서 하품을 한다.',
  s: '내려온다. 바닥에 엎드리면서도 꼬리 끝만 당신 자리에 올려 둔다.',
  p: '자리를 반쯤 비켜 주고, 당신이 앉기를 기다린다.' },
{ i: 107, k: 'dog', bad: 1,
  t: '밥그릇을 코로 밀어 문 앞까지 끌고 왔다. 아직 반이 남았다.',
  s: '그릇을 두고 물러난다. 남은 것을 다 먹고 나서야 당신을 본다.',
  p: '그릇을 당신 발 앞까지 밀어 놓는다. 같이 먹자는 것 같다.' },
{ i: 108, k: 'dog', bad: 0,
  t: '물그릇 앞에 앉아 당신이 올 때까지 기다리고 있었다. 마시지 않고.',
  s: '왜 혼나는지 모른다. 물그릇에서 더 멀어져 앉는다.',
  p: '그제야 마신다. 중간에 한 번 고개를 들어 당신을 확인한다.' },
{ i: 109, k: 'dog', bad: 0,
  t: '어디선가 마른 꽃 한 송이를 물고 와 당신 신발 위에 놓았다.',
  s: '꽃을 다시 물고 어디론가 가져가 버린다. 어디에 두었는지는 알려 주지 않는다.',
  p: '꽃 옆에 앉아, 당신이 그것을 집을 때까지 지켜본다.' },
{ i: 110, k: 'dog', bad: 0,
  t: '당신이 기침을 하자 자던 자리에서 일어나 곁에 와 앉았다.',
  s: '물러난다. 다만 소리가 들리는 거리까지만.',
  p: '무릎에 머리를 올리고, 당신 숨이 고르게 될 때까지 안 움직인다.' },

// ───── 고양이 — 고양이 · 사자 · 백호
{ i: 201, k: 'cat', bad: 1,
  t: '책상 위의 컵을 발로 밀어 떨어뜨렸다. 깨지는 것을 보고도 앉아 있다.',
  s: '귀를 뒤로 눕히고 아주 천천히 눈을 감는다. 혼나는 중에도 품위를 잃지 않는다.',
  p: '허락인 줄 알고 두 번째 컵에 발을 올린다.' },
{ i: 202, k: 'cat', bad: 1,
  t: '모니터 위에 올라가 앉아 화면을 반쯤 가리고 있다.',
  s: '내려온다. 내려오면서 키보드를 한 번 밟는다.',
  p: '그 자리에서 몸을 접고 잠들 준비를 한다. 화면은 완전히 가려졌다.' },
{ i: 203, k: 'cat', bad: 1,
  t: '서류 더미를 발로 헤집어 놓았다. 가장 중요한 장이 맨 아래에 있다.',
  s: '헤집은 자리에 앉는다. 치우려면 그를 들어내야 한다.',
  p: '앞발로 한 장을 더 밀어낸다. 당신이 웃는 것을 보았기 때문이다.' },
{ i: 204, k: 'cat', bad: 1,
  t: '문틈에 발을 끼워 문이 닫히지 않게 하고 있다.',
  s: '발을 뺀다. 문이 닫히는 소리를 듣고 한 번 돌아본다.',
  p: '발 하나를 더 넣는다. 문은 이제 닫히지 않는다.' },
{ i: 205, k: 'cat', bad: 1,
  t: '당신 손을 물었다. 피는 안 났다. 물고 나서 제가 먼저 놀란 얼굴이다.',
  s: '귀를 납작하게 하고 물러난다. 물린 손은 계속 쳐다본다.',
  p: '같은 자리를 혀로 두 번 핥는다. 사과인지 간을 보는 것인지 모르겠다.' },
{ i: 206, k: 'cat', bad: 1,
  t: '커튼을 타고 올라가 천장 가까이에서 내려다보고 있다.',
  s: '한 발씩 내려온다. 끝까지 내려오지는 않는다.',
  p: '거기서 꼬리를 늘어뜨린다. 손이 닿지 않는 높이로 정확히 맞춰 두었다.' },
{ i: 207, k: 'cat', bad: 1,
  t: '당신이 자리를 비운 사이 가방 안에 들어가 앉아 있었다. 털이 가득하다.',
  s: '나온다. 나오면서 가방 안쪽을 한 번 더 긁는다.',
  p: '가방 안에서 몸을 말고, 당신이 들고 나가기를 기다린다.' },
{ i: 208, k: 'cat', bad: 0,
  t: '당신 손 밑으로 머리를 밀어 넣었다. 세 번째다.',
  s: '머리를 뺀다. 그 뒤로 한참 당신 쪽을 보지 않는다.',
  p: '손 아래에서 눈을 감고, 목에서 낮은 소리를 낸다.' },
{ i: 209, k: 'cat', bad: 0,
  t: '어두운 데서 당신 발소리를 알아듣고 먼저 나와 있었다.',
  s: '소리 없이 돌아선다. 다음부터는 안 나올 것 같다.',
  p: '발목에 몸을 한 번 긋고 지나간다. 그것이 인사다.' },
{ i: 210, k: 'cat', bad: 0,
  t: '당신이 앉은 의자 다리에 몸을 기대고 잠들었다. 등이 닿아 있다.',
  s: '깬다. 닿아 있던 등을 떼고 한 뼘 물러나 다시 눕는다.',
  p: '더 깊이 기댄다. 의자가 조금 움직였다.' },

// ───── 새 — 뱁새 · 참새 · 병아리 · 송골매 · 부엉이
{ i: 301, k: 'bird', bad: 1,
  t: '적어 둔 쪽지를 부리로 찢어 둥지 재료로 쓰고 있다.',
  s: '찢던 것을 놓는다. 조각은 이미 둥글게 모여 있다.',
  p: '조각을 당신 쪽으로 한 번 밀고, 더 가져와도 되는지 본다.' },
{ i: 302, k: 'bird', bad: 1,
  t: '창에 몇 번이고 부딪친다. 밖에 있는 것이 자기라는 것을 모른다.',
  s: '멈춘다. 창 대신 당신을 본다. 어느 쪽도 이해하지 못한 얼굴이다.',
  p: '어깨에 올라와 창을 같이 본다. 부딪히는 것은 그만두었다.' },
{ i: 303, k: 'bird', bad: 1,
  t: '당신이 통화하는 소리를 그대로 따라 한다. 억양까지 같다.',
  s: '입을 닫는다. 그러고는 혼나는 목소리를 따라 하기 시작한다.',
  p: '같은 말을 세 번 더 한다. 세 번째에는 당신 이름이 섞였다.' },
{ i: 304, k: 'bird', bad: 1,
  t: '서랍에서 반짝이는 것만 골라 꺼내 한곳에 쌓아 두었다.',
  s: '쌓아 둔 것 위에 올라가 앉는다. 가져가려면 밀어내야 한다.',
  p: '꺼낸 것 가운데 하나를 부리로 집어 당신 손에 떨어뜨린다.' },
{ i: 305, k: 'bird', bad: 1,
  t: '건조대에 앉아 흰 셔츠 위에 똥을 쌌다. 정확히 가운데다.',
  s: '건조대에서 내려온다. 내려오면서 한 번 더 싼다.',
  p: '그 자리에 그대로 앉아 깃을 다듬는다. 셔츠는 이미 포기했다.' },
{ i: 306, k: 'bird', bad: 1,
  t: '새벽 네 시에 울었다. 해는 아직 멀었다.',
  s: '울음을 그친다. 대신 부리로 창살을 두 번 두드린다.',
  p: '울음이 길어진다. 당신이 깨어 있는 것을 알았기 때문이다.' },
{ i: 307, k: 'bird', bad: 1,
  t: '밥을 부리로 집어 바닥에 하나씩 떨어뜨린다. 먹지는 않는다.',
  s: '그릇 안에 부리를 넣고 가만히 있는다. 떨어뜨린 것은 그대로 둔다.',
  p: '떨어뜨리는 속도가 빨라진다. 당신이 보는 것이 재미있는 것이다.' },
{ i: 308, k: 'bird', bad: 0,
  t: '당신 손가락 위에 올라와 한참 앉아 있다. 무게가 거의 없다.',
  s: '날아오른다. 손가락이 가볍다.',
  p: '깃을 부풀리고 손가락 위에서 눈을 감는다.' },
{ i: 309, k: 'bird', bad: 0,
  t: '당신이 들어오는 소리에 날개를 펼쳐 보였다. 두 번 접었다 폈다.',
  s: '날개를 접는다. 그 뒤로는 당신이 들어와도 접은 채다.',
  p: '한 번 더 펼친다. 끝 깃이 당신 뺨을 스친다.' },
{ i: 310, k: 'bird', bad: 0,
  t: '깃 하나를 뽑아 당신 책상 위에 놓았다. 가장 긴 것이다.',
  s: '깃을 부리로 집어 바닥에 떨어뜨린다. 다시는 뽑지 않을 것이다.',
  p: '깃 옆에 앉아, 당신이 그것을 집는 것을 끝까지 본다.' },

// ───── 물 — 수달 · 돌고래
{ i: 401, k: 'water', bad: 1,
  t: '물그릇을 뒤집어 방을 적셔 놓았다. 그 가운데 누워 있다.',
  s: '일어나 앉는다. 바닥은 이미 다 젖어서 앉을 자리가 없다.',
  p: '젖은 바닥을 배로 밀며 한 바퀴 돈다. 더 넓게 젖었다.' },
{ i: 402, k: 'water', bad: 1,
  t: '선반의 물건을 하나씩 물에 담갔다. 전부 젖었다.',
  s: '담그던 손을 멈춘다. 들고 있던 것은 끝내 놓지 않는다.',
  p: '마지막 하나를 당신에게 들어 보인 뒤 물에 넣는다.' },
{ i: 403, k: 'water', bad: 1,
  t: '물에서 나와 바닥을 미끄러져 다녔다. 긴 자국이 하나 남아 있다.',
  s: '자국 끝에서 멈춘다. 돌아가는 길은 조심스럽게 걸어간다.',
  p: '같은 자국 위를 한 번 더 지나간다. 이번에는 더 멀리 갔다.' },
{ i: 404, k: 'water', bad: 1,
  t: '당신 손에서 간식 봉지를 빼앗아 물속으로 가져갔다.',
  s: '봉지를 물 위로 올려놓는다. 안의 것은 이미 없다.',
  p: '봉지를 가슴에 안고 물 위에 똑바로 누워 먹기 시작한다.' },
{ i: 405, k: 'water', bad: 1,
  t: '배수구 뚜껑을 열어 놓았다. 그 안을 들여다보고 있다.',
  s: '뚜껑에서 물러난다. 다만 눈은 계속 그 구멍에 있다.',
  p: '구멍에 손을 넣는다. 팔이 다 들어가도록.' },
{ i: 406, k: 'water', bad: 1,
  t: '당신이 씻는 동안 문을 밀고 들어와 물을 다 쓰고 나갔다.',
  s: '문밖에서 젖은 채로 앉아 있다. 들어오지는 않는다.',
  p: '다시 들어와 당신 발 옆에 눕는다. 남은 물은 없다.' },
{ i: 407, k: 'water', bad: 0,
  t: '조개껍데기 하나를 물에서 꺼내 당신 발 앞에 놓았다.',
  s: '껍데기를 집어 물속으로 가져간다. 가장 깊은 데에 둘 것이다.',
  p: '껍데기를 두 손으로 다시 밀어 준다. 당신 것이라는 뜻이다.' },
{ i: 408, k: 'water', bad: 0,
  t: '당신이 손을 담그자 손가락 사이로 머리를 넣고 가만히 있다.',
  s: '머리를 뺀다. 물은 그 자리에서 한참 흔들린다.',
  p: '머리를 더 밀어 넣고 눈을 감는다. 숨을 쉬러도 안 올라온다.' },
{ i: 409, k: 'water', bad: 0,
  t: '물 위에 똑바로 누워 당신이 지나갈 때까지 기다렸다.',
  s: '몸을 뒤집어 가라앉는다. 지나가도 안 올라온다.',
  p: '누운 채로 발을 한 번 든다. 그것이 손인사다.' },
{ i: 410, k: 'water', bad: 0,
  t: '수면을 두 번 쳐서 당신을 불렀다. 부른 뒤에는 아무것도 안 한다.',
  s: '물을 치던 꼬리를 내린다. 다음에 부를 때는 소리가 더 작을 것이다.',
  p: '세 번째로 물을 친다. 이번에는 당신 쪽으로 물이 왔다.' },

// ───── 기는 것 — 도마뱀 · 거북이 · 뱀
{ i: 501, k: 'rept', bad: 1,
  t: '전구 아래를 혼자 차지하고 하루를 다 썼다. 다른 것은 들어오지 못했다.',
  s: '조금 옆으로 옮긴다. 아주 조금.',
  p: '그 자리에서 몸을 더 펼친다. 자리는 더 좁아졌다.' },
{ i: 502, k: 'rept', bad: 1,
  t: '벗어 둔 허물을 당신 베개 위에 두었다.',
  s: '허물을 끌어 내려 침대 밑으로 밀어 넣는다. 거기 있는 것은 더 나쁘다.',
  p: '허물 옆에 머리를 올린다. 선물로 여겨진 것이 흡족한 모양이다.' },
{ i: 503, k: 'rept', bad: 1,
  t: '책장 뒤로 들어가 사흘 동안 나오지 않았다. 지금 막 나왔다.',
  s: '다시 들어가려다 멈춘다. 반쯤 들어간 채로 당신을 본다.',
  p: '나온 자리에 그대로 머문다. 다음에도 사흘은 들어가 있을 것이다.' },
{ i: 504, k: 'rept', bad: 1,
  t: '당신 손목을 두 바퀴 감고 풀지 않는다. 숨이 조금 답답하다.',
  s: '한 바퀴를 푼다. 남은 한 바퀴는 아까보다 느슨하다.',
  p: '세 바퀴가 된다. 조이지는 않는다. 다만 따뜻하다.' },
{ i: 505, k: 'rept', bad: 1,
  t: '밥으로 둔 것은 그대로 두고, 대신 벽에 붙은 벌레를 삼켰다.',
  s: '혀를 한 번 내밀고 그릇 쪽으로 머리를 돌린다. 먹지는 않는다.',
  p: '벽을 다시 올려다본다. 거기 또 하나가 있다.' },
{ i: 506, k: 'rept', bad: 1,
  t: '신발 안에 들어가 있었다. 당신이 발을 넣기 직전이었다.',
  s: '신발에서 나온다. 나와서는 신발 바로 옆에 자리를 잡는다.',
  p: '신발 안에서 머리만 내놓는다. 거기가 제일 어둡고 따뜻한 것이다.' },
{ i: 507, k: 'rept', bad: 0,
  t: '당신 손바닥 위로 올라와 온기를 받고 가만히 있다.',
  s: '내려간다. 바닥은 차다. 그래도 돌아보지 않는다.',
  p: '손바닥 가운데로 몸을 모은다. 맥이 느껴질 만큼 가깝다.' },
{ i: 508, k: 'rept', bad: 0,
  t: '당신이 앉은 자리 쪽으로 아주 천천히, 그러나 멈추지 않고 왔다.',
  s: '멈춘다. 왔던 거리만큼 되돌아가는 데 그보다 오래 걸렸다.',
  p: '발끝에 머리를 대고 거기서 더 가지 않는다. 도착한 것이다.' },
{ i: 509, k: 'rept', bad: 0,
  t: '유리에 코를 붙이고 당신이 움직이는 쪽으로 머리를 돌린다.',
  s: '코를 뗀다. 유리에 흐린 자국만 남아 있다.',
  p: '코를 더 세게 붙인다. 유리 너머로 닿으려는 것처럼.' },
{ i: 510, k: 'rept', bad: 0,
  t: '겨울잠에서 당신 목소리에 먼저 깼다. 눈만 떴다.',
  s: '눈을 다시 감는다. 이번에는 더 오래 자려는 것 같다.',
  p: '눈을 뜬 채로 머리를 조금 든다. 깬 것을 보여 주려고.' },

// ───── 작은 털 — 담비 · 햄스터 · 토끼
{ i: 601, k: 'small', bad: 1,
  t: '전선 하나를 반쯤 갉아 놓았다. 안쪽 구리가 보인다.',
  s: '앞발을 가슴에 모으고 뒤로 물러난다. 이는 계속 움직인다.',
  p: '같은 자리를 다시 문다. 이번에는 끝까지 갈 것 같다.' },
{ i: 602, k: 'small', bad: 1,
  t: '주머니에 넣어 둔 영수증을 잘게 찢어 잠자리로 깔았다.',
  s: '깔아 둔 것 위에 앉는다. 걷어 내려면 안아 들어야 한다.',
  p: '찢은 것 가운데로 파고들어 머리만 내놓는다.' },
{ i: 603, k: 'small', bad: 1,
  t: '밥을 볼에 다 넣고도 그릇을 비우지 못해 입이 닫히지 않는다.',
  s: '볼에서 두 알을 꺼내 그릇에 돌려놓는다. 두 알만.',
  p: '남은 것까지 다 넣는다. 이제 눈만 보인다.' },
{ i: 604, k: 'small', bad: 1,
  t: '쳇바퀴를 한밤중에 돌렸다. 세 시간 동안.',
  s: '바퀴에서 내려온다. 내려와서도 발은 달리던 모양으로 있다.',
  p: '다시 올라간다. 이번에는 더 빠르다.' },
{ i: 605, k: 'small', bad: 1,
  t: '우리 틈으로 빠져나와 책상 밑에서 발견되었다. 두 번째다.',
  s: '우리로 들어간다. 들어가서 그 틈에 코를 대고 있다.',
  p: '빠져나온 자리를 한 번 더 지나가 본다. 이제 길을 외웠다.' },
{ i: 606, k: 'small', bad: 1,
  t: '당신 손가락을 먹을 것으로 알고 물었다. 바로 놓았다.',
  s: '앞발로 제 얼굴을 두 번 문지른다. 냄새를 지우려는 것 같다.',
  p: '손가락 끝을 혀로 핥는다. 먹을 것이 아니라는 것은 이제 안다.' },
{ i: 607, k: 'small', bad: 0,
  t: '당신 소매 안으로 들어와 팔 안쪽에서 잠들었다.',
  s: '소매에서 나온다. 나와서는 소매 끝만 붙잡고 있다.',
  p: '더 깊이 들어간다. 팔을 들면 무게가 따라 움직인다.' },
{ i: 608, k: 'small', bad: 0,
  t: '볼에 넣어 둔 것 가운데 하나를 꺼내 당신 손에 놓았다.',
  s: '놓은 것을 다시 집어 볼에 넣는다. 그러고는 등을 돌린다.',
  p: '하나를 더 꺼내 옆에 놓는다. 가장 큰 것을 골랐다.' },
{ i: 609, k: 'small', bad: 0,
  t: '당신이 가까이 가자 창살 쪽으로 와서 코를 내밀었다.',
  s: '코를 넣고 안쪽으로 들어간다. 집 안에서 당신을 본다.',
  p: '창살에 몸을 붙인다. 털이 틈으로 삐져나온다.' },
{ i: 610, k: 'small', bad: 0,
  t: '당신 손 위에서 몸을 둥글게 말았다. 작아지는 쪽으로.',
  s: '풀고 내려간다. 내려가서는 손 그늘 안에 앉는다.',
  p: '더 둥글어진다. 어디가 머리인지 알 수 없을 만큼.' },

// ───── 곰
{ i: 701, k: 'bear', bad: 1,
  t: '찬장 문을 열어 꿀 통을 비웠다. 통은 멀쩡하다.',
  s: '빈 통을 제자리에 올려놓는다. 뚜껑까지 닫는다.',
  p: '통 바닥을 한 번 더 핥는다. 이제 정말 비었다.' },
{ i: 702, k: 'bear', bad: 1,
  t: '소파 한쪽을 뜯어 속을 꺼내 놓았다. 그 위에 앉아 있다.',
  s: '꺼낸 속을 발로 모아 구멍에 다시 밀어 넣는다. 반도 안 들어간다.',
  p: '꺼낸 속에 몸을 묻는다. 소파보다 그쪽이 나은 모양이다.' },
{ i: 703, k: 'bear', bad: 1,
  t: '당신을 안으려다 넘어뜨렸다. 일어나면서 또 안으려 한다.',
  s: '팔을 내린다. 내린 팔을 어디에 둘지 몰라 바닥에 놓는다.',
  p: '이번에는 천천히 안는다. 넘어지지 않을 만큼만.' },
{ i: 704, k: 'bear', bad: 1,
  t: '문설주에 등을 긁어 문이 틀어졌다. 닫으면 소리가 난다.',
  s: '문에서 떨어져 앉는다. 등은 계속 벽에 닿아 있다.',
  p: '같은 자리에 등을 다시 댄다. 소리가 한 번 더 났다.' },
{ i: 705, k: 'bear', bad: 1,
  t: '냉장고 문을 열어 둔 채 들여다보고 있다. 십 분째다.',
  s: '문을 닫는다. 닫고 나서도 손잡이를 쥐고 있다.',
  p: '안쪽으로 머리를 더 넣는다. 찬 바람이 방까지 나온다.' },
{ i: 706, k: 'bear', bad: 1,
  t: '당신이 들어오는 길목에 누워 있다. 비켜 주지 않는다.',
  s: '옆으로 조금 굴러 길을 낸다. 한 사람이 겨우 지날 만큼.',
  p: '누운 채로 배를 보인다. 길은 끝까지 안 난다.' },
{ i: 707, k: 'bear', bad: 0,
  t: '당신이 춥다고 하자 옆에 와 벽처럼 앉았다.',
  s: '일어나 멀어진다. 그 자리로 바람이 들어온다.',
  p: '더 바싹 붙어 앉는다. 등이 따뜻해질 때까지 안 움직인다.' },
{ i: 708, k: 'bear', bad: 0,
  t: '잠든 당신 위에 담요를 끌어다 덮었다. 반쯤 덮였다.',
  s: '담요를 끌어 내린다. 그러고는 담요를 안고 자리에 눕는다.',
  p: '남은 반도 끌어 덮는다. 발끝까지 덮는 데 한참 걸렸다.' },
{ i: 709, k: 'bear', bad: 0,
  t: '당신 손을 제 발바닥 사이에 넣고 가만히 쥐고 있다.',
  s: '발을 뗀다. 손에 남은 온기가 금방 식는다.',
  p: '쥔 힘을 조금 더 준다. 아프지는 않다.' },
{ i: 710, k: 'bear', bad: 0,
  t: '당신이 울던 날 밤새 문 앞에 앉아 있었다. 아침에도 거기 있었다.',
  s: '문 앞을 떠난다. 그날 밤에는 안 왔다.',
  p: '문에서 한 걸음 들어와 앉는다. 이제는 방 안이다.' },

// ───── 발굽 — 염소 · 양
{ i: 801, k: 'hoof', bad: 1,
  t: '적어 둔 쪽지를 먹었다. 가장 중요한 것부터 먹었다.',
  s: '입을 멈춘다. 다만 이미 삼킨 것은 돌아오지 않는다.',
  p: '남은 쪽지로 머리를 돌린다. 두 번째로 중요한 것이다.' },
{ i: 802, k: 'hoof', bad: 1,
  t: '화분의 잎을 끝까지 먹어 줄기만 남겼다.',
  s: '줄기에서 입을 뗀다. 줄기는 다음에 먹을 것으로 보인다.',
  p: '줄기까지 꺾어 입에 넣는다. 화분에는 흙만 남았다.' },
{ i: 803, k: 'hoof', bad: 1,
  t: '당신 외투 단추를 씹어 하나 삼켰다. 남은 자리에 실만 있다.',
  s: '외투에서 물러난다. 실 끝은 아직 입에 붙어 있다.',
  p: '옆 단추로 입을 옮긴다. 이번 것은 더 크다.' },
{ i: 804, k: 'hoof', bad: 1,
  t: '벽에 머리를 두 번 박았다. 벽이 밀리는지 보려 한 것이다.',
  s: '머리를 든다. 벽은 그대로고, 이마에 흙이 묻었다.',
  p: '세 번째로 박는다. 이번에는 소리가 더 크다.' },
{ i: 805, k: 'hoof', bad: 1,
  t: '울타리를 넘어 옆 칸으로 갔다. 넘은 자리만 낮아져 있다.',
  s: '넘어온 자리로 돌아온다. 낮아진 데는 그대로 두고.',
  p: '옆 칸에서 한 바퀴 돌고 온다. 길은 이제 두 사람 몫이 되었다.' },
{ i: 806, k: 'hoof', bad: 1,
  t: '당신이 들고 있던 종이컵을 뿔로 쳐서 떨어뜨렸다.',
  s: '뿔을 내린다. 떨어진 컵은 보지 않는다.',
  p: '떨어진 컵을 코로 밀어 당신 발 앞까지 가져온다.' },
{ i: 807, k: 'hoof', bad: 0,
  t: '당신 손바닥의 소금을 핥고, 다 핥은 뒤에도 손을 떠나지 않았다.',
  s: '손에서 입을 뗀다. 혀가 아직 소금 쪽으로 움직인다.',
  p: '손바닥에 턱을 올린다. 소금은 이미 없다.' },
{ i: 808, k: 'hoof', bad: 0,
  t: '당신 무릎에 턱을 올리고 눈을 반쯤 감았다.',
  s: '턱을 내린다. 무릎이 가벼워진 것이 먼저 느껴진다.',
  p: '무게를 더 싣는다. 무릎이 저려도 깨울 수 없다.' },
{ i: 809, k: 'hoof', bad: 0,
  t: '당신이 세는 소리에 맞춰 세 번 발을 디뎠다.',
  s: '발을 멈춘다. 네 번째는 안 디딘다.',
  p: '네 번째를 디딘다. 세다 만 것을 이어 준 것이다.' },
{ i: 810, k: 'hoof', bad: 0,
  t: '밤에 당신 옆에 앉아 되새김질 소리를 냈다. 그 소리에 잠이 왔다.',
  s: '소리를 멈춘다. 방이 그만큼 조용해진다.',
  p: '소리가 느려진다. 숨 쉬는 간격과 맞는다.' },

// ───── 나비
{ i: 901, k: 'bug', bad: 1,
  t: '적어 둔 쪽지 위에 앉아 글자를 가렸다. 하필 숫자 위다.',
  s: '날개를 접고 옆으로 옮겨 앉는다. 숫자 하나는 아직 가려져 있다.',
  p: '그 자리에서 날개를 펼친다. 쪽지는 완전히 덮였다.' },
{ i: 902, k: 'bug', bad: 1,
  t: '창틈으로 나가려다 거미줄 근처까지 갔다. 지금 돌아왔다.',
  s: '창에서 멀어진다. 멀어져서도 그쪽만 본다.',
  p: '창틈으로 다시 간다. 이번에는 더 가까이 갔다.' },
{ i: 903, k: 'bug', bad: 1,
  t: '설탕물 접시에 날개를 적셨다. 한쪽이 무거워 비뚜로 난다.',
  s: '접시에서 떨어져 앉는다. 젖은 날개는 혼자 마르기를 기다린다.',
  p: '손가락 위로 와 날개를 펼친다. 마르는 동안 가만히 있다.' },
{ i: 904, k: 'bug', bad: 1,
  t: '화면의 빛을 따라 밤새 돌았다. 아침에 날개 가루가 남았다.',
  s: '빛에서 멀어진다. 가루는 화면에 그대로 있다.',
  p: '빛 가운데로 다시 들어간다. 날개가 비쳐 보인다.' },
{ i: 905, k: 'bug', bad: 1,
  t: '당신 커피 잔 테두리에 앉았다. 안쪽으로 한 걸음 더 갔다.',
  s: '테두리에서 날아오른다. 잔은 간신히 지켰다.',
  p: '안쪽으로 한 걸음 더 간다. 잔을 비켜 놓아야 했다.' },
{ i: 906, k: 'bug', bad: 1,
  t: '방충망 쪽만 보고 있다. 당신이 부르면 한 번 접었다 편다.',
  s: '방충망에서 떨어진다. 떨어져서도 방향은 그쪽이다.',
  p: '방충망에 붙어 날개를 아주 느리게 움직인다. 밖과 같은 속도다.' },
{ i: 907, k: 'bug', bad: 0,
  t: '당신 손등에 앉았다. 앉은 것을 보려고 손을 들면 없다.',
  s: '날아간다. 어디에 앉았는지 끝내 못 찾는다.',
  p: '같은 자리에 다시 앉는다. 이번에는 손을 들어도 있다.' },
{ i: 908, k: 'bug', bad: 0,
  t: '당신 어깨에 앉아 같이 창밖을 보았다. 아주 오래.',
  s: '어깨에서 내려간다. 창밖은 혼자 보게 되었다.',
  p: '어깨에서 목덜미로 옮겨 앉는다. 숨결이 닿는 자리다.' },
{ i: 909, k: 'bug', bad: 0,
  t: '마른 꽃은 지나치고, 당신이 둔 새 꽃을 골라 앉았다.',
  s: '꽃에서 날아오른다. 마른 꽃 쪽으로 간다.',
  p: '꽃 가운데에 머문다. 날개 무늬와 꽃 색이 비슷하다.' },
{ i: 910, k: 'bug', bad: 0,
  t: '당신이 숨을 멈추자 날개도 멈췄다. 숨을 쉬니 다시 움직인다.',
  s: '날개가 빨라진다. 당신 숨과는 이제 안 맞는다.',
  p: '날개가 숨에 다시 맞는다. 둘 다 느려진다.' }

];

const BY_KIND = {};
const BY_I = {};
ACT.forEach(function (a) {
    if (!BY_KIND[a.k]) BY_KIND[a.k] = [];
    BY_KIND[a.k].push(a);
    BY_I[a.i] = a;
});

// ==========================================
// 걸려 있는 일 · 고친 버릇
// ==========================================
function pets() { try { return P().pets(u_()) || {}; } catch (e) { return {}; } }
function petOf(id) { return pets()[String(id)] || null; }
function nickOf(id) {
    try { return P().nick(id, u_()); } catch (e) { return (P().BY[id] || {}).n || '펫'; }
}
function fixOf(id) {
    const s = petOf(id);
    const v = s && s.fix;
    if (Array.isArray(v)) return v.map(Number).filter(function (n) { return n; });
    // 꾸러미로 들어와 있으면 줄로 바꿔 둔다 (파이어베이스가 빈 칸을 지우며 생긴다)
    if (v && typeof v === 'object') return Object.keys(v).map(Number).filter(function (n) { return n; });
    return [];
}
function pending(id) {
    const s = petOf(id);
    const a = s && s.act;
    if (!a) return null;
    return BY_I[Number(a.i)] || null;
}

// 아직 안 고친 일 가운데 하나
function pickFor(id) {
    const list = BY_KIND[kindOf(id)] || [];
    const done = fixOf(id);
    const left = list.filter(function (a) { return done.indexOf(a.i) < 0; });
    if (!left.length) return null;
    return left[Math.floor(Math.random() * left.length)];
}

// ==========================================
// 오늘 몇 번
// ==========================================
function today() { try { return P().today(); } catch (e) { return String(new Date().getDate()); } }
function dayUsed() {
    const u = u_();
    const d = u && u.petActDay;
    return (d && d.d === today()) ? (Number(d.v) || 0) : 0;
}
function dayLeft() { return Math.max(0, DAY_MAX - dayUsed()); }
function coolLeft() {
    const u = u_();
    return ((Number(u && u.petActAt) || 0) + GAP) - Date.now();
}

// ==========================================
// 교감 — 오르는 쪽은 하루 몫에서 깎는다
// ==========================================
function up(id, lo, hi, patch) {
    const u = u_();
    let room = 0;
    try { room = P().bondRoom(id, u); } catch (e) { room = 0; }
    if (room <= 0) return 0;
    const got = Math.min(room, lo + Math.floor(Math.random() * (hi - lo + 1)));
    const s = petOf(id);
    if (!s) return 0;
    const bd = (s.bd && s.bd.d === today()) ? s.bd : { d: today(), v: 0 };
    patch.bond = P().bond(id, u) + got;
    patch.bd = { d: bd.d, v: (Number(bd.v) || 0) + got };
    return got;
}
function down(id, n, patch) {
    const u = u_();
    let now = 0;
    try { now = P().bond(id, u); } catch (e) { now = 0; }
    const got = Math.min(now, n);
    patch.bond = now - got;
    return got;
}

// ==========================================
// 일을 하나 건다
// ==========================================
function raise(id) {
    const a = pickFor(id);
    if (!a) return null;
    const u = u_();
    try { P().patch(String(id), { act: { i: a.i, at: Date.now() } }); } catch (e) { }
    if (u) {
        u.petActAt = Date.now();
        u.petActDay = { d: today(), v: dayUsed() + 1 };
        try {
            if (typeof saveFields === 'function') saveFields({ petActAt: 1, petActDay: 1 });
        } catch (e) { }
    }
    return a;
}

// ==========================================
// 골랐다
// ==========================================
//
//   돌려주는 것 — { line, bad, scold, bond, fixed, full }
function answer(id, scold) {
    const a = pending(id);
    if (!a) return null;
    const patch = { act: null };
    let bond = 0, fixed = false, full = false;

    if (scold) {
        if (a.bad) {
            const done = fixOf(id);
            if (done.indexOf(a.i) < 0) done.push(a.i);
            patch.fix = done;
            fixed = true;
            bond = -down(id, DROP_BAD, patch);
        } else {
            bond = -down(id, DROP_GOOD, patch);
        }
    } else {
        const r = a.bad ? UP_BAD : UP_GOOD;
        bond = up(id, r[0], r[1], patch);
        if (!bond) full = true;
    }
    try { P().patch(String(id), patch); } catch (e) { }

    if (typeof addHistoryLog === 'function') {
        try {
            addHistoryLog(u_(), '[펫] ' + nickOf(id) + josa(nickOf(id), '을') + ' '
                + (scold ? '혼냈습니다' : '쓰다듬었습니다')
                + ' — 교감 ' + (bond > 0 ? '+' + bond : bond));
        } catch (e) { }
    }
    return { line: scold ? a.s : a.p, bad: !!a.bad, scold: !!scold,
             bond: bond, fixed: fixed, full: full, i: a.i };
}

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:12px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

function shut() { const m = document.querySelector('#' + MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999994; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%;'
        + ' max-width:400px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function icon(id) {
    let src = '';
    try { src = P().icon(id) || ''; } catch (e) { src = ''; }
    return src ? '<img src="' + src + '" alt="" style="width:46px; height:46px;'
        + ' object-fit:contain; image-rendering:pixelated; flex:0 0 auto;">' : '';
}

// 일이 났다 — 고르는 창
function ask(id) {
    const a = pending(id);
    if (!a) return false;
    const nm = nickOf(id);
    const w = box('<div style="display:flex; align-items:center; gap:9px; margin-bottom:10px;">'
        + icon(id)
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:12px; color:#ffcf8f; font-weight:bold;">' + esc(nm) + '</div>'
        + '<div style="font-size:9px; color:#6f685e;">' + esc(KIND_NAME[kindOf(id)] || '')
        + ' · 교감 ' + P().bond(id, u_()) + ' / ' + P().BOND_MAX + '</div>'
        + '</div></div>'
        + '<div style="font-size:12px; color:#ded5c4; line-height:1.85; padding:11px 12px;'
        + ' background:rgba(255,255,255,0.03); border-left:2px solid #c08a3e;'
        + ' border-radius:4px; margin-bottom:12px;">' + esc(a.t) + '</div>'
        + '<button id="pa-scold" class="game-btn" style="' + BTN + '">혼낸다</button>'
        + '<button id="pa-pat" class="game-btn" style="' + BTN + '">쓰다듬는다</button>'
        + '<button id="pa-later" class="game-btn" style="' + BTN + GREY
        + ' padding:9px; font-size:10.5px;">나중에 본다</button>');
    w.querySelector('#pa-scold').onclick = function () { done(id, true); };
    w.querySelector('#pa-pat').onclick = function () { done(id, false); };
    w.querySelector('#pa-later').onclick = shut;
    return true;
}

// 고른 뒤 — 반응을 보여 준다
function done(id, scold) {
    const r = answer(id, scold);
    if (!r) { shut(); return; }
    const nm = nickOf(id);
    const col = r.bond > 0 ? '#8fd18f' : (r.bond < 0 ? '#e08f8f' : '#8d8578');
    const bondText = r.full
        ? '교감은 오늘 더 오르지 않습니다 (하루 몫 ' + P().BOND_DAY + '을 다 썼습니다)'
        : (r.bond === 0 ? '교감은 그대로입니다'
            : '교감 ' + (r.bond > 0 ? '+' + r.bond : r.bond)
              + ' (' + P().bond(id, u_()) + ' / ' + P().BOND_MAX + ')');
    const w = box('<div style="display:flex; align-items:center; gap:9px; margin-bottom:10px;">'
        + icon(id)
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:12px; color:#ffcf8f; font-weight:bold;">'
        + esc(nm + josa(nm, '을') + ' ' + (scold ? '혼냈습니다' : '쓰다듬었습니다')) + '</div>'
        + '<div style="font-size:9px; color:' + col + ';">' + esc(bondText) + '</div>'
        + '</div></div>'
        + '<div style="font-size:12px; color:#ded5c4; line-height:1.85; padding:11px 12px;'
        + ' background:rgba(255,255,255,0.03); border-left:2px solid ' + col + ';'
        + ' border-radius:4px; margin-bottom:10px;">' + esc(r.line) + '</div>'
        + '<div style="font-size:9.5px; color:#6f685e; line-height:1.7; margin-bottom:11px;">'
        + (r.fixed ? '버릇이 고쳐졌습니다. 그 일은 다시 일어나지 않습니다.'
            : (r.scold ? '잘못한 일이 아니었습니다. 고쳐질 버릇도 없습니다.'
                : (r.bad ? '버릇은 그대로입니다. 또 그럴 것입니다.' : '')))
        + '</div>'
        + '<button id="pa-ok" class="game-btn" style="' + BTN + '">알겠습니다</button>');
    w.querySelector('#pa-ok').onclick = function () {
        shut();
        try { if (typeof renderHouse === 'function') renderHouse(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    };
}

// ==========================================
// 언제 뜨나
// ==========================================
//
//   방에 나와 있는 펫 가운데, 나가 있지도 다치지도 않은 것.
function okIds() {
    const u = u_();
    if (!u || !window.PET) return [];
    let ids = [];
    try { ids = P().show(u) || []; } catch (e) { ids = []; }
    if (!ids.length) {
        try { ids = Object.keys(pets()).slice(0, 2); } catch (e) { ids = []; }
    }
    return ids.map(Number).filter(function (id) {
        if (!id || !BY_KIND[kindOf(id)]) return false;
        const s = petOf(id);
        if (!s) return false;
        if (s.out || s.sneak || s.hurt) return false;      // 나가 있거나 다친 펫
        return true;
    });
}

function quarantined() {
    try { return (typeof isQuarantined === 'function') && isQuarantined(u_()); }
    catch (e) { return false; }
}

// 걸려 있는 일이 있으면 그것부터, 없으면 새로 하나 건다
function maybe(force) {
    if (!u_() || !window.PET) return false;
    if (document.querySelector('#' + MOD)) return false;
    if (quarantined()) return false;
    const ids = okIds();
    if (!ids.length) return false;

    const held = ids.filter(function (id) { return pending(id); });
    if (held.length) return ask(held[0]);

    if (!force) {
        if (dayLeft() <= 0) return false;
        if (coolLeft() > 0) return false;
    }
    const pool = ids.filter(function (id) { return pickFor(id); });
    if (!pool.length) return false;
    const id = pool[Math.floor(Math.random() * pool.length)];
    if (!raise(id)) return false;
    return ask(id);
}

// 사택 칸이 열릴 때 — 마중(pet-talk)이 먼저 지나가게 조금 늦춘다
let wasOn = false;
setInterval(function () {
    try {
        const panel = document.getElementById('house-main');
        const on = !!(panel && panel.classList.contains('active'));
        if (on && !wasOn) setTimeout(function () { try { maybe(false); } catch (e) { } }, 1800);
        wasOn = on;
    } catch (e) { }
}, 900);

// ==========================================
// 콘솔
// ==========================================
window.petActNow = function () {
    if (!maybe(true)) {
        console.log('  띄울 것이 없습니다 — 방에 내놓은 펫이 없거나, 그 펫은 버릇을 다 고쳤습니다.');
        return;
    }
    console.log('  띄웠습니다.');
};

window.petActList = function () {
    console.log('%c===== 🐾 펫이 저지르는 일 =====', 'color:#ffb74d; font-size:13px');
    Object.keys(KIND_NAME).forEach(function (k) {
        const list = BY_KIND[k] || [];
        console.log('%c  ' + KIND_NAME[k] + ' — ' + list.length + '가지 (잘못 '
            + list.filter(function (a) { return a.bad; }).length + ')',
            'color:#ffcf8f; font-weight:bold');
        list.forEach(function (a) {
            console.log('    ' + a.i + (a.bad ? ' [잘못] ' : ' [아님] ') + a.t);
            console.log('        혼냄   : ' + a.s);
            console.log('        쓰다듬 : ' + a.p);
        });
    });
    console.log('  모두 ' + ACT.length + '가지 · 반응 ' + (ACT.length * 2) + '가지');
};

window.petActState = function () {
    const u = u_();
    console.log('%c===== 🐾 펫 버릇 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const cl = coolLeft();
    console.log('  오늘 ' + dayUsed() + ' / ' + DAY_MAX + '번'
        + ' · 다음까지 ' + (cl > 0 ? Math.ceil(cl / 60000) + '분' : '지금 바로'));
    const ids = Object.keys(pets()).map(Number).filter(function (i) { return i; });
    if (!ids.length) { console.log('  펫이 없습니다.'); return; }
    console.table(ids.map(function (id) {
        const p = pending(id);
        const list = BY_KIND[kindOf(id)] || [];
        return { 펫: nickOf(id), 갈래: KIND_NAME[kindOf(id)] || '-',
                 교감: P().bond(id, u) + ' / ' + P().BOND_MAX,
                 고친버릇: fixOf(id).length + ' / ' + list.length,
                 걸린일: p ? (p.i + ' ' + p.t.slice(0, 18) + '…') : '-',
                 방에나와있나: okIds().indexOf(id) >= 0 ? 'O' : '✗' };
    }));
};

window.petActClear = function (who) {
    const ids = who ? [Number(who)]
        : Object.keys(pets()).map(Number).filter(function (i) { return i; });
    ids.forEach(function (id) {
        try { P().patch(String(id), { act: null, fix: null }); } catch (e) { }
    });
    const u = u_();
    if (u) {
        u.petActAt = 0; u.petActDay = { d: today(), v: 0 };
        try {
            if (typeof saveFields === 'function') saveFields({ petActAt: 1, petActDay: 1 });
        } catch (e) { }
    }
    console.log('%c✓ 걸려 있던 일과 고친 버릇을 지웠습니다 — ' + ids.length + '마리',
        'color:#4CAF50');
};

window.PETACT = { ACT: ACT, BY_KIND: BY_KIND, BY_I: BY_I, KIND_NAME: KIND_NAME,
                  pick: pickFor, pending: pending, raise: raise, answer: answer,
                  ask: ask, maybe: maybe, ids: okIds, fix: fixOf,
                  GAP: GAP, DAY_MAX: DAY_MAX,
                  DROP_BAD: DROP_BAD, DROP_GOOD: DROP_GOOD,
                  UP_BAD: UP_BAD, UP_GOOD: UP_GOOD };

console.log('[펫] 버릇 ' + ACT.length + '가지 — petActNow() · petActList() · petActState()');

})();
