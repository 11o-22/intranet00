// ==========================================
// ★ 펫에게 말 걸기 — 타이핑으로 시키고, 사택에 들어오면 마중 나온다
// bundles.json 마지막 묶음, pet-bond.js 보다 뒤
// ==========================================
//
// ■ 무엇이 생기나
//
//   ① 내 방 아래에 말 거는 칸이 하나 생긴다. 「앉아」 「손」 「빵야」
//      「하이파이브」 「엎드려」 「돌아」 처럼 시키거나, 「안녕」 「잘 자」
//      「사랑해」 처럼 말을 걸면 방에 나와 있는 펫이 **저마다 다르게**
//      반응한다.
//
//      말 열다섯 가지 × 갈래 아홉 = 반응 135가지.
//      갈래는 종류로 나눈다 — 개 · 고양이 · 새 · 물 · 기는 것 · 작은 털 · 곰 ·
//      발굽(염소·양) · 나비.
//      그래서 같은 「손」이라도 리트리버와 뱀과 돌고래가 전부 다르다.
//
//   ② 사택 칸을 열면 방에 나와 있는 펫이 **먼저 알아보고 마중** 나온다.
//      스무 가지 가운데 하나. 들어올 때마다 보면 성가시므로 3분에 한 번까지만.
//
//   교감(쓰다듬기·놀아주기·먹이주기)과는 따로다. 여기서는 교감도가 오르지
//   않는다 — 말은 공짜고, 공짜인 것으로 수치를 올리면 그쪽이 뜻을 잃는다.
//
// ■ 어디에 붙나
//
//   내 방 칸(pet-room-box)은 pet-bond.js 가 글째로 다시 쓴다. 그 안에 넣으면
//   적다 만 글자가 지워진다. 그래서 **형제 칸**으로 따로 붙인다.
//
// ■ 콘솔
//   petSay('앉아')     콘솔로 시켜 보기
//   petTalkList()      알아듣는 말 전부
//   petGreetTest()     마중 글 스무 가지

(function petTalk() {

const BOX = 'pet-talk-box';
const IN = 'pet-talk-in';
const OUT = 'pet-talk-out';
const GREET_GAP = 3 * 60 * 1000;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

// ==========================================
// 갈래 — 어떤 몸을 가졌나
// ==========================================
//
//   1 고양이 2 리트리버 3 사자 4 뱁새 5 담비 6 도마뱀 7 거북이 8 참새
//   9 햄스터 10 백호 11 곰 12 뱀 13 여우 14 토끼 15 수달 16 병아리
//   17 치와와 18 송골매 19 돌고래 20 부엉이 21 염소 22 늑대 23 양 24 나비
//
//   ★ 여기 없는 펫은 말을 걸어도 **아무 말도 안 한다** (roomPets 가 거른다).
//     펫을 더하면 이 표에도 반드시 넣어야 한다.
const KIND = {
    1:'cat', 2:'dog', 3:'cat', 4:'bird', 5:'small', 6:'rept', 7:'rept', 8:'bird',
    9:'small', 10:'cat', 11:'bear', 12:'rept', 13:'dog', 14:'small', 15:'water',
    16:'bird', 17:'dog', 18:'bird', 19:'water', 20:'bird',
    21:'hoof', 22:'dog', 23:'hoof', 24:'bug'
};
const KIND_NAME = { dog:'개', cat:'고양이', bird:'새', water:'물', rept:'기는 것',
                    small:'작은 털', bear:'곰', hoof:'발굽', bug:'나비' };

// ==========================================
// 알아듣는 말 — 열다섯 가지
// ==========================================
//
//   al 에 적힌 말이 들어 있으면 그 말로 친다. 띄어쓰기와 문장부호는 떼고 본다.
const SAY = [
{ k:'앉아', al:['앉아','앉앗','앉','sit','시트'], r:{
  dog:'엉덩이가 바닥에 닿기도 전에 꼬리가 먼저 바닥을 쓴다.',
  cat:'앉는다. 다만 당신이 말하기 전부터 앉아 있었다는 얼굴이다.',
  bird:'앉는 대신 발을 바꿔 디딘다. 그것으로 충분하다는 듯이.',
  water:'앉는 시늉을 하다 미끄러져 그대로 눕는다.',
  rept:'가만히 있는다. 원래 앉아 있었다.',
  small:'뒷다리로 앉아 앞발을 가슴에 모은다.',
  bear:'쿵, 하고 앉는다. 바닥이 한 번 울린다.',
  hoof:'앞다리를 접고 주저앉는다. 되새김질은 멈추지 않는다.',
  bug:'손등에 내려앉는다. 그게 앉은 것이다.' } },

{ k:'손', al:['손','악수','발','paw'], r:{
  dog:'앞발을 척 얹는다. 묵직하고 따뜻하다.',
  cat:'앞발을 들었다가, 당신 손이 아니라 제 얼굴을 닦는다.',
  bird:'손가락에 올라앉는다. 발톱이 생각보다 야무지다.',
  water:'두 앞발로 손가락을 쥔다. 놓아 주지 않는다.',
  rept:'발을 올리는 대신 손등에 턱을 올린다.',
  small:'앞발로 손끝을 톡 친다. 두 번 친다.',
  bear:'손 위에 발을 얹는다. 손이 안 보인다.',
  hoof:'발굽을 들어 손바닥을 툭 친다. 딱딱하다.',
  bug:'손끝에 앉아 더듬이로 두 번 두드린다.' } },

{ k:'빵야', al:['빵야','빵','탕','뱅','피융'], r:{
  dog:'옆으로 넘어진다. 혀가 조금 나와 있다. 연기가 과하다.',
  cat:'쳐다본다. 안 넘어진다. 끝까지 안 넘어진다.',
  bird:'푸드덕 뒤집혀 발을 하늘로 든다. 발가락이 오므라든다.',
  water:'배를 보이며 데굴 굴러 그대로 멈춘다.',
  rept:'아주 천천히 옆으로 기운다. 쓰러지는 데 사 초가 걸린다.',
  small:'톡, 하고 옆으로 쓰러진다. 코는 계속 움직인다.',
  bear:'쓰러진다. 바닥이 울리고 먼지가 조금 난다.',
  hoof:'옆으로 쓰러진다. 다리가 넷이라 꽤 요란하다.',
  bug:'날개를 접고 뚝 떨어진다. 바닥 직전에 다시 난다.' } },

{ k:'하이파이브', al:['하이파이브','하이','파이브','터치','highfive','five'], r:{
  dog:'앞발을 힘껏 친다. 손바닥이 얼얼하다.',
  cat:'발을 올린다. 치는 게 아니라 눌러 놓는다.',
  bird:'날개 끝으로 손바닥을 스친다. 깃털이 하나 떨어진다.',
  water:'두 앞발로 짝, 하고 친다. 제가 더 좋아한다.',
  rept:'발바닥을 마주 댄다. 차갑다.',
  small:'폴짝 뛰어 손바닥에 앞발을 댄다. 거의 닿았다.',
  bear:'친다. 손이 뒤로 밀린다.',
  hoof:'손바닥에 뿔을 들이민다. 손바닥 말고 뿔이다.',
  bug:'날개 끝이 손바닥을 스친다. 가루가 조금 묻는다.' } },

{ k:'엎드려', al:['엎드려','엎드','엎어','down','다운'], r:{
  dog:'턱을 바닥에 붙인다. 눈만 위를 본다.',
  cat:'식빵 자세가 된다. 발이 어디 갔는지 모르겠다.',
  bird:'가슴을 바닥에 붙이고 둥글게 부푼다.',
  water:'배를 깔고 쭉 뻗는다. 꼬리가 바닥을 한 번 친다.',
  rept:'더 낮아질 수 없는데도 더 낮아진다.',
  small:'납작해진다. 털만 남은 것 같다.',
  bear:'엎드린다. 방이 좁아 보인다.',
  hoof:'네 다리를 접고 배를 붙인다. 한참 걸린다.',
  bug:'날개를 활짝 펴고 납작 붙는다.' } },

{ k:'돌아', al:['돌아','돌앗','한바퀴','턴','spin','돌어'], r:{
  dog:'제자리에서 한 바퀴. 신나서 두 바퀴를 돈다.',
  cat:'반 바퀴만 돌고 멈춘다. 등을 보인다.',
  bird:'종종걸음으로 한 바퀴. 끝에 날개를 턴다.',
  water:'돌다가 미끄러져 한 바퀴 반을 돈다.',
  rept:'돈다. 꼬리가 먼저 돌고 머리가 나중에 따라온다.',
  small:'눈 깜짝할 사이에 세 바퀴를 돈다.',
  bear:'무겁게 한 바퀴. 돌고 나서 당신을 확인한다.',
  hoof:'한 바퀴 돌다 말고 뭔가를 씹기 시작한다.',
  bug:'제자리에서 원을 그리며 난다. 두 바퀴째가 더 크다.' } },

{ k:'기다려', al:['기다려','기다렷','기다','웨잇','wait','스테이'], r:{
  dog:'멈춘다. 꼬리만 미친 듯이 흔들린다. 참는 중이다.',
  cat:'기다린다. 당신이 먼저 지칠 때까지.',
  bird:'고개를 갸웃한 채로 굳는다. 숨도 참는 것 같다.',
  water:'기다리다 말고 손에 든 것을 본다. 다시 기다린다.',
  rept:'기다린다. 이쪽은 원래 기다리는 쪽이다.',
  small:'코만 움직인다. 나머지는 돌처럼 멈춰 있다.',
  bear:'앉은 채로 기다린다. 곰이 기다리면 꽤 든든하다.',
  hoof:'기다린다. 기다리면서 먹는다.',
  bug:'허공에 멈춘 듯 떠 있다. 날개는 계속 움직인다.' } },

{ k:'이리 와', al:['이리와','이리','와봐','컴','come','오너라','이리오'], r:{
  dog:'달려온다. 멈추는 걸 깜빡해서 정강이에 부딪힌다.',
  cat:'안 온다. 그런데 어느새 발치에 와 있다.',
  bird:'포르르 날아와 어깨에 앉는다.',
  water:'배를 깔고 미끄러져 온다. 그게 더 빠르다.',
  rept:'온다. 오고 있다. 아직 오고 있다.',
  small:'종종종 와서 신발 위에 올라선다.',
  bear:'온다. 발소리가 먼저 온다.',
  hoof:'천천히 온다. 오는 길에 있는 것을 다 맛본다.',
  bug:'곧장 오지 않는다. 몇 번 돌다 어깨에 앉는다.' } },

{ k:'점프', al:['점프','뛰어','뛰엇','jump','높이'], r:{
  dog:'네 발이 다 떴다. 착지는 생각 안 했다.',
  cat:'가볍게 뛰어 선반 위에 앉는다. 내려올 생각은 없다.',
  bird:'뛴다기보다 그냥 떠오른다. 반칙 같다.',
  water:'뛰어올라 몸을 비틀고 떨어진다. 물이 없는 게 아쉽다.',
  rept:'뛰었다고 주장하는 높이다. 땅에서 손가락 하나.',
  small:'제 키의 다섯 배를 뛴다. 본인도 놀란다.',
  bear:'뛴다. 착지에서 방이 흔들린다.',
  hoof:'네 발이 동시에 뜬다. 생각보다 높다.',
  bug:'뛰는 게 아니라 그냥 올라간다. 천장까지 간다.' } },

{ k:'물어', al:['물어','가져와','가져옷','물어와','fetch','페치'], r:{
  dog:'던진 것을 기어이 물어 온다. 침이 묻어 있다.',
  cat:'가서 본다. 보고 온다. 빈손이다.',
  bird:'부리로 물어 와 발밑에 똑 떨어뜨린다.',
  water:'물어 오다 말고 배 위에 올려 둔다. 제 것이 됐다.',
  rept:'입에 문다. 놓는 데 또 한참 걸린다.',
  small:'입에 넣고 볼에 넣는다. 가져오긴 했다.',
  bear:'통째로 물어 온다. 원래 모양이 아니다.',
  hoof:'물어 온다. 오는 동안 반이 없어졌다.',
  bug:'물 수가 없다. 그 위에 앉아 보고 만다.' } },

{ k:'안녕', al:['안녕','하이','인사','방가','헬로','hello','hi','왔다'], r:{
  dog:'온몸으로 인사한다. 꼬리가 몸통을 흔든다.',
  cat:'눈을 천천히 감았다 뜬다. 고양이의 인사다.',
  bird:'고개를 두 번 까딱한다. 아주 공손하다.',
  water:'앞발을 들어 흔든다. 어디서 배웠는지 모르겠다.',
  rept:'혀를 한 번 낸다. 냄새로 당신을 확인했다.',
  small:'코를 씰룩이며 다가와 손가락 냄새를 맡는다.',
  bear:'콧김을 한 번 분다. 그게 인사다.',
  hoof:'콧등을 손에 비빈다. 따뜻하고 축축하다.',
  bug:'날개를 천천히 두 번 여닫는다. 인사로 친다.' } },

{ k:'잘 자', al:['잘자','굿나잇','자라','자자','goodnight','잘 자','취침'], r:{
  dog:'발치에 턱을 얹고 눕는다. 금방 숨소리가 느려진다.',
  cat:'당신 다리에 등을 붙이고 눕는다. 온기만 가져간다.',
  bird:'깃에 머리를 묻는다. 동그랗게 부푼 공이 된다.',
  water:'배를 보이고 누워 앞발을 가슴에 포갠다.',
  rept:'눈꺼풀이 아래에서 위로 닫힌다. 처음 보면 놀란다.',
  small:'둥지처럼 털을 부풀리고 그 안으로 들어간다.',
  bear:'벽에 등을 대고 앉은 채로 잔다. 코 고는 소리가 낮다.',
  hoof:'선 채로 잔다. 눈만 반쯤 감겼다.',
  bug:'잎 뒤로 돌아가 거꾸로 매달린다.' } },

{ k:'사랑해', al:['사랑해','사랑','좋아해','조아','lovely','love'], r:{
  dog:'얼굴을 핥으려 든다. 피할 틈이 없다.',
  cat:'머리를 당신 손에 박는다. 그게 전부다. 그게 크다.',
  bird:'머리카락을 하나씩 다듬어 준다. 정리해 주는 중이다.',
  water:'손을 끌어다 제 배에 올린다. 만지라는 뜻이다.',
  rept:'손목에 몸을 감는다. 체온을 나눠 받는 쪽이다.',
  small:'손바닥 한가운데에 몸을 말고 눕는다.',
  bear:'이마를 당신 어깨에 댄다. 무겁다. 가만히 있는다.',
  hoof:'이마를 들이민다. 밀면 더 민다.',
  bug:'머리카락 끝에 앉아 한참 안 떠난다.' } },

{ k:'미안', al:['미안','미안해','쏘리','sorry','용서'], r:{
  dog:'이미 용서했다. 용서할 일이 있었는지도 모른다.',
  cat:'등을 돌린다. 꼬리 끝만 당신 쪽으로 남겨 둔다.',
  bird:'어깨에 앉아 귀 옆에서 작게 운다. 괜찮다는 소리 같다.',
  water:'손가락을 두 발로 쥐었다 놓는다. 그걸로 끝이다.',
  rept:'아무 일도 없었다는 얼굴이다. 원래 그런 얼굴이다.',
  small:'다가와 신발코에 이마를 댄다.',
  bear:'앞발로 바닥을 한 번 쓸고 만다. 넘어가 준 모양이다.',
  hoof:'용서했는지는 알 수 없다. 계속 씹고 있다.',
  bug:'손등에 앉았다가 날아간다. 곧 돌아온다.' } },

{ k:'고마워', al:['고마워','고맙','땡큐','감사','thanks','thank'], r:{
  dog:'칭찬인 걸 알아듣고 더 신이 난다. 말리기 어렵다.',
  cat:'고개를 돌린다. 귀는 이쪽으로 와 있다.',
  bird:'가슴을 부풀리고 한 번 짧게 운다. 뿌듯한 모양이다.',
  water:'손뼉 비슷한 걸 친다. 박수인지 재촉인지 모르겠다.',
  rept:'천천히 눈을 감는다. 받았다는 뜻으로 친다.',
  small:'볼주머니에서 뭔가를 꺼내 바닥에 둔다. 답례인 것 같다.',
  bear:'코로 손등을 민다. 밀려난 손이 조금 아프다.',
  hoof:'꼬리를 짧게 흔든다. 그러고 다시 먹는다.',
  bug:'빙글 한 바퀴 돌고 제자리에 앉는다.' } }
];

// 못 알아들었을 때
const HUH = {
  dog:'고개를 갸웃한다. 그래도 꼬리는 흔든다.',
  cat:'한 번 보고 만다. 못 알아들은 쪽이 당신인 것 같다.',
  bird:'고개를 좌우로 번갈아 기울인다.',
  water:'알아들은 척하며 배를 보인다.',
  rept:'미동도 없다. 들은 것 같기는 하다.',
  small:'코를 씰룩인다. 그게 대답의 전부다.',
  bear:'한참 보다가 눈을 감는다.',
  hoof:'씹던 것을 멈춘다. 그것뿐이다.',
  bug:'날개를 한 번 여닫는다. 못 알아들은 쪽 같다.'
};

// ==========================================
// 사택에 들어오면 — 스무 가지
// ==========================================
const GREET = [
    '문소리를 듣고 먼저 고개를 든다. 눈이 마주친다.',
    '자다 말고 벌떡 일어나 달려온다. 아직 반쯤 자고 있다.',
    '신발 벗는 자리까지 마중을 나와 있다.',
    '발치를 빙 돈다. 한 바퀴 더 돈다.',
    '올려다보며 작게 운다. 하루치 보고인 것 같다.',
    '다리에 몸을 붙이고 지나간다. 지나갔다가 다시 온다.',
    '들고 있던 것을 떨어뜨리고 이쪽으로 온다.',
    '창가에 앉아 기다리고 있었다. 자국이 남아 있다.',
    '꼬리부터 먼저 반응한다. 본인은 모르는 눈치다.',
    '문 앞에 앉아 있다가 일어선다. 오래 앉아 있던 모양이다.',
    '손 냄새를 맡고 나서야 긴장을 푼다.',
    '어디 갔다 왔느냐는 얼굴로 쳐다본다.',
    '방 안을 한 바퀴 뛰고 돌아와 앞에 앉는다.',
    '발밑에 와서 납작 엎드린다. 쓰다듬어 달라는 자세다.',
    '벽 뒤에서 머리만 내밀고 보다가 천천히 나온다.',
    '품으로 뛰어든다. 받을 준비가 안 되어 있었다.',
    '가방 끈을 물고 안쪽으로 끈다.',
    '아침에 둔 자리 그대로 앉아 있다. 그 자리에서 꼬리만 움직인다.',
    '조용히 와서 발등에 턱을 올린다.',
    '하품을 하다 말고 당신을 보고 입을 다문다.'
];

// ==========================================
// 말을 고른다
// ==========================================
function norm(s) {
    return String(s || '').toLowerCase()
        .replace(/[\s.,!?~'"·\-_()[\]]/g, '');
}
function findSay(text) {
    const v = norm(text);
    if (!v) return null;
    // 똑같은 것 먼저
    for (let i = 0; i < SAY.length; i++) {
        for (let j = 0; j < SAY[i].al.length; j++) {
            if (norm(SAY[i].al[j]) === v) return SAY[i];
        }
    }
    // 들어 있기만 해도
    for (let i = 0; i < SAY.length; i++) {
        for (let j = 0; j < SAY[i].al.length; j++) {
            const a = norm(SAY[i].al[j]);
            if (a.length >= 2 && v.indexOf(a) >= 0) return SAY[i];
        }
    }
    return null;
}

// 방에 나와 있는 펫
function roomPets() {
    const u = u_();
    if (!u || !window.PET) return [];
    let ids = [];
    try { ids = P().show(u) || []; } catch (e) { ids = []; }
    if (!ids.length) {
        try { ids = Object.keys(P().pets(u)).slice(0, 2); } catch (e) { ids = []; }
    }
    return ids.map(Number).filter(function (i) { return KIND[i]; });
}

function kindOf(id) { return KIND[id] || 'small'; }
function nickOf(id) {
    try { return P().nick(id, u_()); } catch (e) { return (P().BY[id] || {}).n || '펫'; }
}

// 한 마디에 대한 대답 — [{ id, nick, line }]
function answer(text) {
    const ids = roomPets();
    if (!ids.length) return { none: true, rows: [] };
    const s = findSay(text);
    const rows = ids.map(function (id) {
        const k = kindOf(id);
        return { id: id, nick: nickOf(id), line: s ? (s.r[k] || HUH[k]) : HUH[k] };
    });
    return { none: false, said: s ? s.k : null, rows: rows };
}

// ==========================================
// 화면
// ==========================================
function rowsHtml(rows) {
    return rows.map(function (r) {
        const ic = (window.PET && P().icon) ? P().icon(r.id) : '';
        return '<div style="display:flex; align-items:flex-start; gap:7px;'
            + ' padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">'
            + (ic ? '<img src="' + ic + '" alt="" style="width:26px; height:26px;'
                  + ' object-fit:contain; image-rendering:pixelated; flex:0 0 auto;">' : '')
            + '<div style="flex:1; min-width:0; font-size:11px; line-height:1.7; color:#ddd;">'
            + '<b style="color:#9fd8ef;">' + esc(r.nick) + '</b> — ' + esc(r.line)
            + '</div></div>';
    }).join('');
}

function show(html) {
    const el = document.getElementById(OUT);
    if (el) el.innerHTML = html;
}

window.petTalkSend = function () {
    const el = document.getElementById(IN);
    if (!el) return;
    const text = el.value;
    if (!String(text || '').trim()) return;
    const a = answer(text);
    if (a.none) {
        show('<div style="font-size:10.5px; color:#8d8578; padding:7px 0;">'
            + '방에 내놓은 펫이 없습니다. 펫 칸에서 내놓을 펫을 정해 주십시오.</div>');
        return;
    }
    const head = '<div style="font-size:10px; color:#8d8578; margin-bottom:3px;">「'
        + esc(String(text).trim()) + '」' + (a.said ? '' : ' — 못 알아들은 것 같습니다') + '</div>';
    show(head + rowsHtml(a.rows));
    el.value = '';
    el.focus();
};

function html() {
    const words = SAY.map(function (s) { return s.k; }).join(' · ');
    return '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:4px;">'
        + '💬 말 걸기</div>'
        + '<div style="font-size:9.5px; color:#777; margin-bottom:7px; line-height:1.6;">'
        + esc(words) + '</div>'
        + '<div style="display:flex; gap:6px; margin-bottom:7px;">'
        + '<input type="text" id="' + IN + '" maxlength="20" placeholder="앉아 · 손 · 빵야 · 안녕 …"'
        + ' style="flex:1; min-width:0; padding:9px; font-size:12px; box-sizing:border-box;"'
        + ' onkeypress="if(event.key===\'Enter\') petTalkSend()">'
        + '<button class="inv-btn inv-btn-use" style="flex:0 0 auto; min-width:58px;"'
        + ' onclick="petTalkSend()">말한다</button>'
        + '</div>'
        + '<div id="' + OUT + '"></div>';
}

function mount() {
    const host = document.getElementById('house-main-body');
    if (!host || !u_()) return;
    if (document.querySelector('#' + BOX)) return;
    const el = document.createElement('div');
    el.id = BOX;
    el.style.cssText = 'background:rgba(159,216,239,0.05); border:1px solid #2f4350;'
        + ' border-radius:6px; padding:12px; margin-top:10px;';
    el.innerHTML = html();
    // 내 방 칸 바로 아래에 — 없으면 맨 끝에
    const room = document.getElementById('pet-room-box');
    if (room && room.parentNode === host) host.insertBefore(el, room.nextSibling);
    else host.appendChild(el);
}

// ==========================================
// 마중
// ==========================================
let lastGreet = 0, wasOn = false;

function greet() {
    const ids = roomPets();
    if (!ids.length) return;
    const id = ids[Math.floor(Math.random() * ids.length)];
    const line = GREET[Math.floor(Math.random() * GREET.length)];
    lastGreet = Date.now();
    const el = document.getElementById(OUT);
    if (!el) return;
    el.innerHTML = '<div style="font-size:10px; color:#8d8578; margin-bottom:3px;">돌아왔습니다</div>'
        + rowsHtml([{ id: id, nick: nickOf(id), line: line }]);
}

// 사택 칸이 열릴 때 한 번 (3분에 한 번까지)
setInterval(function () {
    try {
        const panel = document.getElementById('house-main');
        const on = !!(panel && panel.classList.contains('active'));
        if (on && !document.querySelector('#' + BOX)) mount();
        if (on && !wasOn && Date.now() - lastGreet > GREET_GAP) setTimeout(greet, 400);
        wasOn = on;
    } catch (e) { }
}, 900);

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._petTalk) { clearInterval(iv); return; }
        const _r = renderHouse;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { mount(); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._petTalk = true;
        renderHouse = w;
        window.renderHouse = w;
        clearInterval(iv);
        console.log('[펫] 말 걸기 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 콘솔
// ==========================================
window.petSay = function (text) {
    const a = answer(text);
    if (a.none) { console.log('  방에 내놓은 펫이 없습니다.'); return; }
    console.log('%c「' + text + '」' + (a.said ? ' → ' + a.said : ' → 못 알아들음'),
        'color:#9fd8ef; font-size:13px');
    a.rows.forEach(function (r) {
        console.log('  ' + r.nick + ' (' + KIND_NAME[kindOf(r.id)] + ') — ' + r.line);
    });
};

window.petTalkList = function () {
    console.log('%c===== 알아듣는 말 =====', 'color:#9fd8ef; font-size:13px');
    console.table(SAY.map(function (s) {
        return { 말: s.k, 같이쓰는말: s.al.join(' · '), 반응: Object.keys(s.r).length + '갈래' };
    }));
    console.log('  말 ' + SAY.length + '가지 × 갈래 ' + Object.keys(KIND_NAME).length
        + ' = 반응 ' + (SAY.length * Object.keys(KIND_NAME).length) + '가지');
    console.log('  갈래 :', Object.keys(KIND_NAME).map(function (k) {
        const ids = Object.keys(KIND).filter(function (i) { return KIND[i] === k; });
        const nm = ids.map(function (i) { return (window.PET ? (P().BY[i] || {}).n : i) || i; });
        return KIND_NAME[k] + '(' + nm.join('·') + ')';
    }).join(' / '));
};

// 마중을 한 번 더 보고 싶을 때
window.petGreetNow = function () { lastGreet = 0; greet(); };

window.petGreetTest = function () {
    console.log('%c===== 마중 ' + GREET.length + '가지 =====', 'color:#9fd8ef; font-size:13px');
    GREET.forEach(function (g, i) { console.log('  ' + (i + 1) + '. ' + g); });
};

window.PETTALK = { SAY: SAY, GREET: GREET, KIND: KIND, answer: answer, find: findSay };

console.log('[펫] petSay(\'앉아\') · petTalkList() · petGreetTest()');

})();
