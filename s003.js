// ==========================================
// ★ S-003 「동화의 뒷면」 확장
//   dark.js 다음에 불러올 것:  <script src="s003.js"></script>
//   - 동화 7종 추가 (총 14종), 5~9인
//   - 서사·공통 기믹 2배, 찢어진 장 10장
//   - 흩어짐 4회, 끌려감 5회 (14개 동화 인물 중 탐사마다 다른 5명)
//   - 난이도(DC)는 기존과 동일
// ==========================================

// --- 인원 ---
if (DARK_ZONES['Qtrew-S-003']) {
    DARK_ZONES['Qtrew-S-003'].min = 5;
    DARK_ZONES['Qtrew-S-003'].max = 9;
}

const S003_PAGE_TOTAL = 10;

// ==========================================
// ★ 신규 배역 7종
// ==========================================
Object.assign(TALE_ROLES, {
    cinder: {
        name:'신데렐라', tale:'신데렐라', icon:'👠',
        taboo:'열두 번째 종이 울린 뒤에도 머무는 것',
        warn:'종이 다 울리면 모든 것이 원래대로 돌아갑니다. 당신도.',
        death:`열두 번째 종이 울렸다.<br><br>
            드레스가 먼저 재가 된다. 그다음 구두가, 그다음 손끝이.<br>
            원래대로 돌아가는 것뿐이라고 생각했다.<br><br>
            원래가 무엇이었는지, 책은 기억하지 못했다.`
    },
    kongjwi: {
        name:'콩쥐', tale:'콩쥐 팥쥐', icon:'🏺',
        taboo:'도움을 거절하는 것',
        warn:'여기서는 두꺼비도 참새도 그냥 돕지 않습니다. 거절은 빚이 됩니다.',
        death:`괜찮다고 했다. 혼자 하겠다고.<br><br>
            두꺼비가 구멍에서 몸을 뺀다. 참새가 날아간다. 소가 돌아선다.<br>
            밑 빠진 독에 물이 한 방울도 남지 않는다.<br><br>
            대신 이쪽이 조금씩 빠져나간다. 같은 구멍으로.`
    },
    momo: {
        name:'복숭아 동자', tale:'복숭아 동자', icon:'🍑',
        taboo:'동료를 두고 먼저 가는 것',
        warn:'수수경단을 나눠 먹은 이상 혼자 갈 수 없습니다.',
        death:`먼저 갔다.<br><br>
            뒤에서 개가 짖다 멎는다. 원숭이 소리가 끊긴다. 꿩이 날지 않는다.<br>
            섬에 혼자 도착했다.<br><br>
            오니들이 반긴다. 수수경단 하나 몫의 자리가 비어 있었다고.`
    },
    sunmoon: {
        name:'오누이', tale:'해와 달이 된 오누이', icon:'🌙',
        taboo:'문을 열어 주는 것',
        warn:'문밖의 목소리는 엄마 목소리를 압니다. 엄마보다 잘.',
        death:`문을 열었다.<br><br>
            엄마였다. 엄마 옷을 입고, 엄마 목소리로 웃었다.<br>
            다만 눈높이가 조금 낮았다. 네 발로 서 있었으니까.<br><br>
            <span style="color:#d4af37;">"떡 하나 줄 테니 들어가자."</span>`
    },
    snow: {
        name:'백설공주', tale:'백설공주', icon:'🍎',
        taboo:'건네받은 것을 먹는 것',
        warn:'여기서 건네지는 것은 전부 한 입이면 충분합니다.',
        death:`한 입 먹었다.<br><br>
            달았다. 달아서 한 입 더 먹으려는데 턱이 움직이지 않는다.<br>
            눕혀진다. 유리 너머로 얼굴들이 내려다본다.<br><br>
            아무도 깨우러 오지 않는다. 이 이야기에는 왕자가 적혀 있지 않았다.`
    },
    aladdin: {
        name:'알라딘', tale:'알라딘과 요술 램프', icon:'🪔',
        taboo:'소원을 입 밖에 내는 것',
        warn:'말한 소원은 반드시 이루어집니다. 말한 그대로.',
        death:`소원을 말했다.<br><br>
            <span style="color:#d4af37;">"분부대로."</span><br><br>
            이루어졌다. 단어 하나하나 그대로.<br>
            말할 때 빠뜨린 것이 무엇인지는, 이루어진 다음에야 알았다.`
    },
    frog: {
        name:'개구리 왕자', tale:'개구리 왕자', icon:'🐸',
        taboo:'약속을 어기는 것',
        warn:'여기서 한 약속은 전부 적힙니다. 어기면 적힌 대로 거둬 갑니다.',
        death:`약속을 어겼다.<br><br>
            목이 조인다. 누가 조르는 게 아니다. 안쪽에서 조여 온다.<br>
            피부가 차갑고 미끈해진다. 목소리가 낮게 울린다.<br><br>
            우물 바닥이 가까워진다. 이번에는 아무도 공을 떨어뜨리지 않는다.`
    }
});
['cinder','kongjwi','momo','sunmoon','snow','aladdin','frog'].forEach(k => {
    if (!TALE_KEYS.includes(k)) TALE_KEYS.push(k);
});

// ==========================================
// ★ 신규 배역 장면 (배역당 4장)
// ==========================================
Object.assign(TALE_SCENES, {
cinder: {
1: { text:`무도회장 계단이다.<br><br>
    뒤에 세워 둔 마차에서 썩은 냄새가 난다. 호박이 벌써 무르기 시작했다.<br>
    구두가 발에 맞지 않는다. 조금 작다. 발가락 하나만큼.<br><br>
    계단 위에서 음악이 흐른다. 박자가 조금씩 빨라진다.`,
    opts:[
      {l:'① 계단을 오른다.', v:'climb', ok:true},
      {l:'② 구두 안을 들여다본다.', v:'peek', lore:12},
      {l:'③ 마차로 돌아간다.', v:'back', ok:false}
    ]},
2: { text:`왕자와 춤을 춘다.<br><br>
    한 바퀴 돌 때마다 왕자의 얼굴이 바뀐다. 전부 잘생겼고, 전부 모르는 얼굴이다.<br>
    멀리서 종이 한 번 울린다.<br><br>
    <span style="color:#888;">"이름이 뭐예요?"</span> 왕자가 묻는다. 네 번째 얼굴로.`,
    opts:[
      {l:'① 춤을 멈추고 시계를 본다.', v:'clock', ok:true},
      {l:'② 얼굴을 하나라도 외워 둔다.', v:'face', lore:13},
      {l:'③ 대답하며 계속 춘다.', v:'dance', ok:false}
    ]},
3: { text:`종이 열한 번 울렸다.<br><br>
    계단을 뛰어 내려간다. 구두 한 짝이 벗겨진다.<br>
    주우러 가면 늦는다. 두고 가면 누군가 그걸로 찾으러 온다.<br><br>
    한 번만 더 울리면 끝이다.`,
    opts:[
      {l:'① 구두를 두고 뛴다.', v:'run', ok:true},
      {l:'② 주우러 돌아간다.', v:'pick', ok:false},
      {l:'③ 열두 번째를 기다려 본다.', v:'stay', taboo:true}
    ]},
4: { text:`신하가 구두를 들고 집집마다 돌고 있다.<br><br>
    이 집에 왔다. 언니들이 먼저 신어 본다.<br>
    구두 안이 붉다. 발가락을 잘라서라도 맞추려 했다.<br><br>
    신하가 이쪽 발을 본다. 오래 본다.`,
    opts:[
      {l:'① 발을 내민다.', v:'foot', ok:true},
      {l:'② 재 속에 숨는다.', v:'hide', ok:false},
      {l:'③ 언니들의 발을 본다.', v:'sisters', lore:14}
    ]}
},

kongjwi: {
1: { text:`밑 빠진 독이다.<br><br>
    물을 길어 부어도 부은 만큼 빠진다.<br>
    바닥 구멍 옆에 두꺼비가 앉아 있다. 막아 주겠다고 한다.<br><br>
    대가가 무엇인지는 말하지 않는다. 눈만 깜빡인다.`,
    opts:[
      {l:'① 도움을 받는다.', v:'accept', ok:true},
      {l:'② 혼자 채워 보겠다고 한다.', v:'refuse', taboo:true},
      {l:'③ 대가를 묻는다.', v:'ask', lore:11}
    ]},
2: { text:`벼 한 가마니를 다 까야 한다.<br><br>
    참새 떼가 내려와 부리로 껍질을 벗긴다. 빠르다.<br>
    그런데 참새들 눈이 이상하다. 흰자가 있다.<br><br>
    사람 눈이다.`,
    opts:[
      {l:'① 그대로 맡긴다.', v:'let', ok:true},
      {l:'② 쫓아낸다.', v:'shoo', taboo:true},
      {l:'③ 눈을 들여다본다.', v:'eyes', lore:13}
    ]},
3: { text:`원님 잔치에 가는 길이다.<br><br>
    냇물을 건너다 꽃신 한 짝이 떠내려갔다.<br>
    누군가 주워서 다가온다. 얼굴이 팥쥐다. 웃고 있다.<br><br>
    <span style="color:#888;">"언니, 이거."</span>`,
    opts:[
      {l:'① 신을 받는다.', v:'take', ok:true},
      {l:'② 괜찮다며 사양한다.', v:'decline', taboo:true},
      {l:'③ 신 안쪽을 본다.', v:'inside', lore:12}
    ]},
4: { text:`연못이다.<br><br>
    물속에서 누가 부른다. 이쪽 목소리다.<br>
    원래 이야기에서 여기 빠진 것은 이쪽이었다.<br><br>
    물가에 연꽃이 한 송이 피어 있다. 꺾으면 뭔가 돌아온다고 들었다.`,
    opts:[
      {l:'① 내민 손을 잡고 물러난다.', v:'hand', ok:true},
      {l:'② 연꽃을 꺾는다.', v:'lotus', ok:false},
      {l:'③ 물속 얼굴을 본다.', v:'face', lore:15}
    ]}
},

momo: {
1: { text:`강을 따라 커다란 복숭아가 떠내려온다.<br><br>
    안에서 두드리는 소리가 난다. 두 번, 쉬고, 두 번.<br>
    원래 이야기에서는 이 안에 아기가 있었다.<br><br>
    두드리는 박자가 아기의 것은 아니다.`,
    opts:[
      {l:'① 쪼갠다.', v:'split', ok:true},
      {l:'② 흘려보낸다.', v:'float', ok:false},
      {l:'③ 귀를 대고 듣는다.', v:'listen', lore:11}
    ]},
2: { text:`수수경단을 나눈다.<br><br>
    개, 원숭이, 꿩이 하나씩 받아 간다.<br>
    그런데 한 마리가 더 있다. 모습이 잘 안 보이는데, 손을 내밀고 있다.<br><br>
    경단은 이제 하나 남았다. 내 몫이다.`,
    opts:[
      {l:'① 내 몫을 준다.', v:'give', ok:true},
      {l:'② 못 본 척한다.', v:'ignore', ok:false},
      {l:'③ 경단을 쥐고 먼저 출발한다.', v:'leave', taboo:true}
    ]},
3: { text:`오니섬으로 가는 배다.<br><br>
    다 같이 노를 젓는다. 동료들의 얼굴이 조금씩 사람을 닮아 간다.<br>
    개의 눈이, 원숭이의 입매가, 꿩의 목이.<br><br>
    섬은 아직 멀다. 물은 차다.`,
    opts:[
      {l:'① 계속 같이 젓는다.', v:'row', ok:true},
      {l:'② 동료들의 얼굴을 확인한다.', v:'look', lore:13},
      {l:'③ 먼저 뛰어내려 헤엄친다.', v:'swim', taboo:true}
    ]},
4: { text:`오니 대장 앞이다.<br><br>
    보물이 쌓여 있다. 오니가 그걸 전부 주겠다고 한다.<br>
    대신 하나만 두고 가라고 한다.<br><br>
    <span style="color:#888;">"네가 오는 길에 두고 온 것 말이다."</span>`,
    opts:[
      {l:'① 동료들과 나란히 선다.', v:'stand', ok:true},
      {l:'② 보물을 받는다.', v:'treasure', ok:false},
      {l:'③ 무엇을 두고 왔는지 묻는다.', v:'ask', lore:14}
    ]}
},

sunmoon: {
1: { text:`해가 졌다. 엄마는 아직 안 왔다.<br><br>
    문밖에서 목소리가 난다.<br>
    <span style="color:#888;">"얘들아, 엄마 왔다. 떡 가져왔다."</span><br><br>
    엄마 목소리다. 조금 쉬었다. 고개를 많이 넘었다고 한다.`,
    opts:[
      {l:'① 손부터 보여 달라고 한다.', v:'hand', ok:true},
      {l:'② 문을 연다.', v:'open', taboo:true},
      {l:'③ 목소리를 오래 듣는다.', v:'listen', lore:12}
    ]},
2: { text:`문틈으로 손이 들어온다.<br><br>
    하얗다. 밀가루를 발랐다. 그 아래로 털이 비친다.<br>
    <span style="color:#888;">"봐라, 엄마 손이지?"</span><br><br>
    손톱이 문지방을 긁는다.`,
    opts:[
      {l:'① 문고리를 붙잡고 버틴다.', v:'hold', ok:true},
      {l:'② 문틈을 벌려 확인한다.', v:'gap', taboo:true},
      {l:'③ 손을 만져 본다.', v:'touch', lore:11}
    ]},
3: { text:`뒷마당 나무 위로 올라왔다.<br><br>
    아래에서 호랑이가 올려다본다. 엄마 옷을 입은 채로.<br>
    <span style="color:#888;">"거기 어떻게 올라갔니?"</span><br><br>
    원래 이야기에서는 거짓말을 했다. 참기름을 발랐다고.`,
    opts:[
      {l:'① 참기름을 발랐다고 한다.', v:'oil', ok:true},
      {l:'② 도끼로 찍었다고 사실대로 말한다.', v:'truth', ok:false},
      {l:'③ 대답하지 않고 하늘을 본다.', v:'sky', lore:10}
    ]},
4: { text:`하늘에서 동아줄이 두 개 내려온다.<br><br>
    하나는 새것이고 하나는 썩었다. 둘 다 새것처럼 보인다.<br>
    동생이 옷자락을 잡는다. 떨고 있다.<br><br>
    아래에서 나무 흔드는 소리가 난다.`,
    opts:[
      {l:'① 동생 손을 잡고 함께 잡는다.', v:'together', ok:true},
      {l:'② 먼저 잡는다.', v:'first', ok:false},
      {l:'③ 줄 끝이 어디 닿았는지 본다.', v:'up', lore:14}
    ]}
},

snow: {
1: { text:`작은 집이다.<br><br>
    침대가 일곱 개 있다. 전부 작다.<br>
    그중 하나만 따뜻하다. 방금까지 누가 누워 있었다.<br><br>
    집 안에는 아무도 없다. 아무도 없어야 한다.`,
    opts:[
      {l:'① 침대에 눕지 않는다.', v:'stand', ok:true},
      {l:'② 따뜻한 침대에 눕는다.', v:'lie', ok:false},
      {l:'③ 누가 누워 있었는지 본다.', v:'check', lore:11}
    ]},
2: { text:`방물장수 노파가 문을 두드린다.<br><br>
    예쁜 끈이 있다고 한다. 옷에 매 주겠다고 한다.<br>
    <span style="color:#888;">"가만히 있어 보렴. 꽉 매 줄게."</span><br><br>
    노파의 손이 너무 곱다.`,
    opts:[
      {l:'① 거절한다.', v:'no', ok:true},
      {l:'② 매게 둔다.', v:'yes', ok:false},
      {l:'③ 노파의 손을 본다.', v:'hands', lore:12}
    ]},
3: { text:`노파가 또 왔다.<br><br>
    이번에는 빗과 과자를 들고 있다.<br>
    <span style="color:#888;">"빗이 싫으면 이거라도 먹으렴. 먼 길 왔잖니."</span><br><br>
    과자에서 김이 오른다. 방금 구운 것처럼.`,
    opts:[
      {l:'① 둘 다 거절한다.', v:'none', ok:true},
      {l:'② 빗만 받는다.', v:'comb', ok:false},
      {l:'③ 과자를 먹는다.', v:'eat', taboo:true}
    ]},
4: { text:`사과다.<br><br>
    반은 붉고 반은 하얗다. 노파가 하얀 쪽을 한 입 베어 먹어 보인다.<br>
    <span style="color:#888;">"봐라, 아무렇지 않지."</span><br><br>
    붉은 쪽이 이쪽을 향해 있다.`,
    opts:[
      {l:'① 받아서 주머니에 넣는다.', v:'pocket', ok:true},
      {l:'② 붉은 쪽을 먹는다.', v:'eat', taboo:true},
      {l:'③ 하얀 쪽 단면을 본다.', v:'look', lore:15}
    ]}
},

aladdin: {
1: { text:`동굴 입구다.<br><br>
    반지를 낀 사내가 밖에 서 있다. 들어오지 않는다.<br>
    <span style="color:#888;">"램프만 가져오너라. 다른 것은 손대지 말고."</span><br><br>
    안쪽에서 보석이 빛난다. 빛나는 방향이 이쪽이다.`,
    opts:[
      {l:'① 램프만 찾는다.', v:'lamp', ok:true},
      {l:'② 보석을 챙긴다.', v:'jewel', ok:false},
      {l:'③ 왜 직접 안 들어오는지 묻는다.', v:'ask', lore:12}
    ]},
2: { text:`램프를 문질렀다.<br><br>
    연기가 사람 모양이 된다. 크다. 천장에 머리가 닿는다.<br>
    <span style="color:#d4af37;">"주인님. 소원을 말씀하십시오."</span><br><br>
    발목에 사슬이 감겨 있다. 사슬 끝이 램프 안으로 이어진다.`,
    opts:[
      {l:'① 아무 말도 하지 않는다.', v:'silent', ok:true},
      {l:'② "여기서 나가고 싶어."', v:'wish', taboo:true},
      {l:'③ 사슬을 본다.', v:'chain', lore:13}
    ]},
3: { text:`궁전이다.<br><br>
    상인이 지나가며 외친다.<br>
    <span style="color:#888;">"헌 램프 주시면 새 램프 드려요!"</span><br><br>
    품 안의 램프가 따뜻해진다. 싫다는 뜻 같다.`,
    opts:[
      {l:'① 램프를 품에 감춘다.', v:'hide', ok:true},
      {l:'② 바꾼다.', v:'trade', ok:false},
      {l:'③ 상인의 얼굴을 본다.', v:'face', lore:11}
    ]},
4: { text:`지니가 마지막으로 묻는다.<br><br>
    <span style="color:#d4af37;">"주인님, 저를 풀어 주시겠습니까?"</span><br><br>
    풀어 주려면 말해야 한다. 말하면 소원이다.<br>
    소원은 말한 그대로 이루어진다.`,
    opts:[
      {l:'① 말없이 램프를 바닥에 내려놓는다.', v:'put', ok:true},
      {l:'② "너를 자유롭게 해 줘."', v:'free', taboo:true},
      {l:'③ 원래 누구였는지 묻는다.', v:'who', lore:15}
    ]}
},

frog: {
1: { text:`우물 속이다. 이쪽이 개구리다.<br><br>
    위에서 금공이 떨어진다. 공주가 울고 있다.<br>
    <span style="color:#888;">"건져 주면 뭐든 해 줄게. 약속해."</span><br><br>
    공은 손 닿는 곳에 있다.`,
    opts:[
      {l:'① 공을 건져 준다.', v:'give', ok:true},
      {l:'② 약속을 다시 한 번 말하게 한다.', v:'repeat', lore:11},
      {l:'③ 건져 준다고 하고 공을 숨긴다.', v:'cheat', taboo:true}
    ]},
2: { text:`성의 식탁이다.<br><br>
    공주 접시 옆에 앉아야 한다. 약속이니까.<br>
    공주가 이쪽을 보지 않는다. 포크를 쥔 손이 하얗다.<br><br>
    왕이 지켜본다. 약속은 지켜야 한다는 얼굴로.`,
    opts:[
      {l:'① 조용히 기다린다.', v:'wait', ok:true},
      {l:'② 접시에 먼저 입을 댄다.', v:'eat', ok:false},
      {l:'③ 공주의 얼굴을 본다.', v:'look', lore:12}
    ]},
3: { text:`침실이다.<br><br>
    벽에 던져지면 저주가 풀린다고 들었다.<br>
    그런데 벽에 초상화가 걸려 있다. 풀린 왕자들이다. 여럿이다.<br><br>
    전부 같은 표정이다. 무언가를 대신 받은 얼굴이다.`,
    opts:[
      {l:'① 던져지기를 기다린다.', v:'wait', ok:true},
      {l:'② 밤새 문밖에 있겠다고 하고 들어간다.', v:'lie', taboo:true},
      {l:'③ 초상화를 하나씩 본다.', v:'portraits', lore:14}
    ]},
4: { text:`마차가 달린다.<br><br>
    뒤에서 쇠테가 끊어지는 소리가 난다. 한 번, 두 번.<br>
    충직한 하인의 가슴을 묶고 있던 쇠테다.<br><br>
    세 번째 소리는 아직이다.`,
    opts:[
      {l:'① 뒤돌아보지 않는다.', v:'forward', ok:true},
      {l:'② 끊어지는 횟수를 센다.', v:'count', lore:13},
      {l:'③ 마차에서 내린다.', v:'off', ok:false}
    ]}
}
});

// ==========================================
// ★ 신규 서사
// ==========================================
Object.assign(S003_NARR, {
14: { text:`액자가 줄지어 걸린 문단이다.<br><br>
    전부 삽화다. 몇 개는 비어 있다.<br>
    빈 액자 아래에 이름표가 붙어 있다. 우리 배역 이름이다.<br><br>
    아직 그려지지 않았을 뿐이다. 곧 채워질 것이다.` },

15: { text:`재가 쌓인 부엌이다.<br><br>
    아궁이 앞에 작은 발자국이 찍혀 있다. 맨발이다.<br>
    발자국은 아궁이 안쪽으로 이어진다.<br><br>
    불은 꺼져 있는데, 재가 아직 따뜻하다.` },

16: { text:`초가집 마당이다.<br><br>
    까치가 운다. 멀리서 떡 찌는 냄새가 난다.<br>
    여기서부터 다른 나라 이야기가 섞이기 시작한다.<br><br>
    섞이는 자리마다 종이가 조금 찢겨 있다. 억지로 이어 붙인 흔적이다.` },

17: { text:`바다가 그려진 장이다.<br><br>
    물결이 선으로 그려져 있는데, 선이 움직인다.<br>
    멀리 섬이 보인다. 뿔 달린 그림자가 해변을 걷는다.<br><br>
    물가에 복숭아 씨가 잔뜩 쌓여 있다. 전부 쪼개져 있다.` },

18: { text:`거울이 많은 방이다.<br><br>
    비치는 얼굴이 배역 얼굴이다. 원래 얼굴이 아니다.<br>
    자세히 보면 거울마다 한 명씩 더 서 있다.<br><br>
    그 사람은 이쪽이 아니라 거울 뒤쪽을 본다.` },

19: { text:`모래가 흘러내리는 장이다.<br><br>
    모래알이 전부 글자다. 밟을 때마다 문장이 흩어진다.<br>
    흩어진 문장이 다른 자리에서 다시 모인다.<br><br>
    뒤에 남긴 발자국이 한 줄의 글이 되어 있다. 읽지 않기로 한다.` },

20: { text:`우물이 있다.<br><br>
    들여다보면 바닥에 금공이 여러 개 떨어져 있다.<br>
    하나하나에 이름이 새겨져 있다. 공주들의 이름이다.<br><br>
    두레박 줄이 아래로 내려가 있다. 누가 잡고 있다.` },

21: { text:`책의 여백이다.<br><br>
    연필로 낙서가 적혀 있다. 여러 사람의 글씨다.<br>
    <span style="color:#d4af37;">"금기를 적어 둘 것" · "종이 울리면 뛸 것" · "먹지 말 것"</span><br><br>
    맨 아래 줄은 반쯤 지워졌다. <span style="color:#d4af37;">"다 같이 나갈 수 있"</span>` },

22: { text:`모든 동화가 한 장에 겹쳐 있다.<br><br>
    늑대가 유리 구두를 신었고, 호랑이가 사과를 들었고, 거인이 램프를 문지른다.<br>
    이야기끼리 서로의 끝을 빌려 쓰고 있다.<br><br>
    이 장을 넘기면 결말이다. 누구의 결말인지는 아직 정해지지 않았다.` }
});

// ==========================================
// ★ 찢어진 장 위치 (6~10)
// ==========================================
Object.assign(S003_PAGE_SPOTS, {
    6:  ['재가 쌓인 아궁이', '호박 마차 안', '계단 난간'],
    7:  ['밑 빠진 독 속', '참새 둥지', '연못가 꽃신'],
    8:  ['쪼개진 복숭아 씨 속', '오니의 곤봉', '배 밑창'],
    9:  ['사과 바구니', '유리관 밑', '거울 뒷면'],
    10: ['램프 속', '우물 바닥', '마지막 제목 아래']
});

// ==========================================
// ★ 단계 구성 (약 2배)
// ==========================================
Object.keys(S003_STEPS).forEach(k => delete S003_STEPS[k]);
Object.assign(S003_STEPS, {
    0:  { type:'intro' },

    // --- 1구간: 책 속으로 ---
    1:  { type:'narr', n:1, img:'step1' },
    2:  { type:'cast' },
    3:  { type:'narr', n:2 },
    4:  { type:'gimmick', n:1 },
    5:  { type:'narr', n:3 },
    6:  { type:'page', n:1 },
    7:  { type:'gimmick', n:2 },
    8:  { type:'narr', n:4 },
    9:  { type:'tale', round:1 },
    10: { type:'narr', n:14 },
    11: { type:'gimmick', n:9 },
    12: { type:'abduct', n:1 },

    // --- 2구간: 첫 흩어짐 ---
    13: { type:'narr', n:5 },
    14: { type:'gimmick', n:3 },
    15: { type:'lore' },
    16: { type:'scatter', n:1 },
    17: { type:'sscene', n:1 },
    18: { type:'regroup', n:1 },
    19: { type:'narr', n:6, img:'step2' },
    20: { type:'page', n:2 },
    21: { type:'gimmick', n:4 },
    22: { type:'narr', n:15 },
    23: { type:'page', n:3 },
    24: { type:'gimmick', n:10 },

    // --- 3구간: 두 번째 동화 ---
    25: { type:'tale', round:2 },
    26: { type:'narr', n:7 },
    27: { type:'gimmick', n:5 },
    28: { type:'abduct', n:2 },
    29: { type:'vote', n:1 },
    30: { type:'narr', n:16 },
    31: { type:'scatter', n:2 },
    32: { type:'sscene', n:2 },
    33: { type:'regroup', n:2 },
    34: { type:'narr', n:8 },
    35: { type:'page', n:4 },
    36: { type:'gimmick', n:11 },
    37: { type:'lore' },

    // --- 4구간: 뒤틀림 ---
    38: { type:'narr', n:9, img:'step3' },
    39: { type:'tale', round:3 },
    40: { type:'narr', n:17 },
    41: { type:'gimmick', n:6 },
    42: { type:'abduct', n:3 },
    43: { type:'narr', n:18 },
    44: { type:'page', n:5 },
    45: { type:'gimmick', n:12 },
    46: { type:'scatter', n:3 },
    47: { type:'sscene', n:3 },
    48: { type:'regroup', n:3 },
    49: { type:'narr', n:10 },
    50: { type:'page', n:6 },
    51: { type:'gimmick', n:7 },
    52: { type:'vote', n:2 },

    // --- 5구간: 여러 나라의 끝 ---
    53: { type:'narr', n:19 },
    54: { type:'page', n:7 },
    55: { type:'gimmick', n:13 },
    56: { type:'abduct', n:4 },
    57: { type:'narr', n:20 },
    58: { type:'tale', round:4 },
    59: { type:'lore' },
    60: { type:'narr', n:11 },
    61: { type:'gimmick', n:14 },
    62: { type:'page', n:8 },
    63: { type:'scatter', n:4 },
    64: { type:'sscene', n:4 },
    65: { type:'regroup', n:4 },
    66: { type:'narr', n:21 },
    67: { type:'gimmick', n:15 },
    68: { type:'abduct', n:5 },

    // --- 6구간: 결말 ---
    69: { type:'narr', n:22 },
    70: { type:'page', n:9 },
    71: { type:'narr', n:12, img:'step4' },
    72: { type:'page', n:10 },
    73: { type:'gimmick', n:16 },
    74: { type:'lore' },
    75: { type:'gimmick', n:8 },
    76: { type:'narr', n:13 },
    77: { type:'ending' },
    99: { type:'result' }
});

// ==========================================
// ★ 신규 공통 기믹 (9~16)
// ==========================================

// --- 기믹 9: 무도회 계단 (회피) ---
const S003_G9 = {
    run: { dc: 11, kind: 'hide', extra: gEvade, mod: 1,
        okTxt: `계단을 두 칸씩 뛰어 내려간다.<br><br>종소리 사이사이에 발을 디뎠다.<br>마지막 종이 울릴 때는 이미 문밖이었다.`,
        failTxt: `발이 꼬였다.<br><br>계단 몇 칸을 구르고 나서야 멈췄다.<br>무릎에 유리 조각이 박혀 있다. 구두 조각이다.` },
    step: { dc: 10, kind: 'hide', extra: gEvade,
        okTxt: `한 칸씩, 종소리에 맞춰 내려간다.<br><br>박자를 놓치지 않았다.<br>계단이 끝나는 순간 음악이 멎었다.`,
        failTxt: `박자가 어긋났다.<br><br>계단 한 칸이 발밑에서 사라진다.<br>허공을 디딘 발이 한참 뒤에야 땅에 닿았다.` },
    stay: { dc: 8, kind: 'hide', extra: gEvade, taboo: ['cinder'], tabooWhy: '종이 울린 뒤 머묾', lore: 5,
        okTxt: `종이 멎을 때까지 기다린다.<br><br>마지막 종소리가 울리고, 아무 일도 일어나지 않았다.<br>적어도 이쪽에게는.`,
        failTxt: `기다리는 동안 계단이 바뀌었다.<br><br>올라가는 계단이 되어 있다.<br>다시 무도회장이다. 음악이 처음부터 시작된다.` }
};
function s003G9() {
    renderChoiceStep("기믹 9 — 무도회 계단",
        `종이 울리기 시작했다.<br><br>
         계단이 길다. 한 번 울릴 때마다 계단이 한 칸씩 늘어난다.<br>
         열두 번 안에 내려가야 한다.<br><br>
         <span style="color:#888; font-size:11px;">✦ 회피가 유리합니다.</span>`,
        [
            { id:'run',  label:'① 두 칸씩 뛰어 내려간다.',         fn:'s003G9R', arg:'run' },
            { id:'step', label:'② 종소리에 맞춰 한 칸씩 내려간다.', fn:'s003G9R', arg:'step' },
            { id:'stay', label:'③ 종이 다 울릴 때까지 기다린다.',   fn:'s003G9R', arg:'stay' }
        ], null);
}
function s003G9R(pick) { s003Resolve("기믹 9", S003_G9, pick); }

// --- 기믹 10: 밑 빠진 독 (연결) ---
const S003_G10 = {
    together: { dc: 9, kind: 'rejoin', mod: 2,
        okTxt: `다 같이 물을 붓는다. 쉬지 않고, 순서대로.<br><br>빠지는 것보다 붓는 게 빨랐다.<br>독이 가득 찬 순간 바닥의 구멍이 저절로 닫혔다.`,
        failTxt: `순서가 엉켰다.<br><br>서로 부딪히며 물을 쏟는다.<br>독은 그대로 비어 있고, 다들 젖었다.` },
    toad: { dc: 10, kind: 'rejoin', mod: 1,
        okTxt: `두꺼비에게 막아 달라고 한다.<br><br>두꺼비가 구멍에 몸을 밀어 넣는다. 물이 찬다.<br>대가는 나중에 받겠다고 한다. 언제인지는 말하지 않았다.`,
        failTxt: `두꺼비가 구멍을 막는 대신 들여다본다.<br><br><span style="color:#888;">"안에 누가 있네."</span><br>물은 계속 빠진다.` },
    alone: { dc: 12, kind: 'rejoin', taboo: ['kongjwi'], tabooWhy: '도움을 거절함', lore: 6,
        okTxt: `혼자 붓는다. 아무도 부르지 않는다.<br><br>팔이 떨어질 것 같을 때쯤 겨우 찼다.<br>다른 사람들은 그걸 지켜보기만 했다.`,
        failTxt: `혼자 붓다가 주저앉았다.<br><br>독 바닥 구멍으로 물이 아니라 다른 게 빠져나간다.<br>무엇인지 보기 전에 눈을 돌렸다.` }
};
function s003G10() {
    renderChoiceStep("기믹 10 — 밑 빠진 독",
        `독을 채워야 문이 열린다.<br><br>
         바닥에 구멍이 나 있다. 부은 만큼 빠진다.<br>
         옆에 두꺼비가 앉아 이쪽을 본다.<br><br>
         <span style="color:#888; font-size:11px;">⊙ 연결이 유리합니다.</span>`,
        [
            { id:'together', label:'① 다 같이 쉬지 않고 붓는다.',  fn:'s003G10R', arg:'together' },
            { id:'toad',     label:'② 두꺼비에게 부탁한다.',       fn:'s003G10R', arg:'toad' },
            { id:'alone',    label:'③ 도움 없이 채워 본다.',       fn:'s003G10R', arg:'alone' }
        ], null);
}
function s003G10R(pick) { s003Resolve("기믹 10", S003_G10, pick); }

// --- 기믹 11: 오니섬 배 (파괴) ---
const S003_G11 = {
    row: { dc: 10, kind: 'sense', extra: gBreak, mod: 1,
        okTxt: `다 같이 노를 젓는다.<br><br>박자가 맞는다. 배가 물결을 가르고 나아간다.<br>섬의 그림자가 점점 커진다.`,
        failTxt: `노 하나가 부러졌다.<br><br>배가 한쪽으로 돈다.<br>물속에서 뭔가 배 밑을 두드린다.` },
    ram: { dc: 11, kind: 'sense', extra: gBreak, mod: 1,
        okTxt: `뱃머리로 오니섬 성문을 들이받는다.<br><br>나무가 쪼개지는 소리.<br>성문 안쪽에 쌓여 있던 것들이 쏟아져 나온다.`,
        failTxt: `들이받았지만 성문은 멀쩡하다.<br><br>배가 튕겨 나왔다.<br>성벽 위에서 뿔 달린 얼굴들이 내려다본다.` },
    swim: { dc: 9, kind: 'sense', extra: gBreak, taboo: ['momo'], tabooWhy: '동료를 두고 먼저 감', failLore: 8,
        okTxt: `먼저 뛰어내려 헤엄친다.<br><br>해변에 가장 먼저 닿았다.<br>뒤돌아보니 배가 아직 멀다.`,
        failTxt: `뛰어내린 물이 차갑다. 너무 차갑다.<br><br>팔이 굳는다.<br>누가 머리채를 잡아 배 위로 끌어올렸다.` }
};
function s003G11() {
    renderChoiceStep("기믹 11 — 오니섬",
        `배가 섬에 가까워진다.<br><br>
         섬 둘레에 성벽이 있다. 성문은 닫혀 있다.<br>
         물살이 거세서 오래 머물 수 없다.<br><br>
         <span style="color:#888; font-size:11px;">✧ 파괴가 유리합니다.</span>`,
        [
            { id:'row',  label:'① 다 같이 노를 젓는다.',       fn:'s003G11R', arg:'row' },
            { id:'ram',  label:'② 뱃머리로 성문을 들이받는다.', fn:'s003G11R', arg:'ram' },
            { id:'swim', label:'③ 먼저 뛰어내려 헤엄친다.',     fn:'s003G11R', arg:'swim' }
        ], null);
}
function s003G11R(pick) { s003Resolve("기믹 11", S003_G11, pick); }

// --- 기믹 12: 동아줄 (행운) ---
const S003_G12 = {
    new: { dc: 10, kind: 'sense', extra: gLuck, mod: 2,
        okTxt: `새것처럼 보이는 줄을 잡는다.<br><br>당겨지는 힘이 단단하다.<br>발밑의 마당이 멀어진다. 호랑이가 올려다본다.`,
        failTxt: `잡은 줄이 중간에서 늘어진다.<br><br>썩은 쪽이었다.<br>떨어지기 직전에 옆 줄로 옮겨 잡았다. 손바닥이 쓸렸다.` },
    test: { dc: 11, kind: 'sense', extra: gLuck, lore: 4,
        okTxt: `두 줄을 번갈아 당겨 본다.<br><br>한쪽이 아주 조금 늦게 따라온다.<br>반대쪽을 잡았다. 맞았다.`,
        failTxt: `당겨 보는 사이 하나가 끊어졌다.<br><br>남은 하나를 잡는다. 선택지가 없었다.<br>올라가는 내내 줄이 삐걱거렸다.` },
    door: { dc: 8, kind: 'sense', extra: gLuck, taboo: ['sunmoon'], tabooWhy: '문을 열어 줌',
        okTxt: `줄을 잡기 전에 방문을 열어 엄마인지 확인한다.<br><br>아무도 없었다. 다행히.<br>돌아와 줄을 잡았다.`,
        failTxt: `방문을 열었다.<br><br>문 앞에 누가 앉아 있다. 엄마 옷을 입고.<br>문을 닫고 줄로 달렸다. 등 뒤가 뜨겁다.` }
};
function s003G12() {
    renderChoiceStep("기믹 12 — 동아줄",
        `하늘에서 동아줄이 내려온다.<br><br>
         두 개다. 하나는 새것, 하나는 썩었다. 겉으로는 똑같다.<br>
         뒤쪽 방문 너머에서 누가 부른다. 엄마 목소리다.<br><br>
         <span style="color:#888; font-size:11px;">✺ 행운이 유리합니다.</span>`,
        [
            { id:'new',  label:'① 새것처럼 보이는 줄을 잡는다.', fn:'s003G12R', arg:'new' },
            { id:'test', label:'② 둘 다 당겨 보고 고른다.',      fn:'s003G12R', arg:'test' },
            { id:'door', label:'③ 방문을 열어 누군지 확인한다.',  fn:'s003G12R', arg:'door' }
        ], null);
}
function s003G12R(pick) { s003Resolve("기믹 12", S003_G12, pick); }

// --- 기믹 13: 거울의 질문 (응시) ---
const S003_G13 = {
    ask: { dc: 10, kind: 'sense', extra: gGaze, lore: 6, mod: 1,
        okTxt: `거울에게 되묻는다. 누가 제일 두려운지.<br><br>거울이 한참 조용하다.<br>그리고 뒷면을 보여 준다. 거기에 문이 있었다.`,
        failTxt: `되물었다.<br><br>거울이 대답 대신 이쪽 얼굴을 비춘다.<br>조금 늙어 보인다. 조금 더.` },
    silent: { dc: 11, kind: 'sense', extra: gGaze,
        okTxt: `아무 말도 하지 않는다.<br><br>거울이 기다리다 지쳐 흐려진다.<br>흐려진 틈으로 빠져나왔다.`,
        failTxt: `입을 다물었는데 거울 속 이쪽이 대신 대답한다.<br><br>무슨 말을 했는지 들리지 않았다.<br>다만 입모양이 길었다.` },
    apple: { dc: 8, kind: 'sense', extra: gGaze, taboo: ['snow'], tabooWhy: '건네받은 것을 먹음', lore: 8,
        okTxt: `옆 바구니의 사과를 한 입 베어 문다. 답이 떠오른다.<br><br>말하자 거울이 갈라진다.<br>입 안이 한참 달았다.`,
        failTxt: `사과를 베어 무는 순간 턱이 무겁다.<br><br>겨우 뱉었다.<br>뱉은 조각이 바닥에서 뿌리를 내린다.` },
    answer: { dc: 9, kind: 'sense', extra: gGaze, taboo: ['alice'], tabooWhy: '질문에 답함',
        okTxt: `정답을 말한다.<br><br>거울이 만족스럽게 빛난다.<br>문이 열린다. 다만 대가는 나중에 청구한다고 적혀 있다.`,
        failTxt: `틀렸다.<br><br>거울 속에서 누가 박수를 친다.<br>비웃는 소리가 방을 몇 바퀴 돈다.` }
};
function s003G13() {
    renderChoiceStep("기믹 13 — 거울",
        `커다란 거울이 길을 막고 있다.<br><br>
         <span style="color:#d4af37;">"이 방에서 누가 가장 오래 남을까?"</span><br><br>
         옆에 사과 바구니가 놓여 있다. 한 입 먹으면 답이 보인다고 적혀 있다.<br><br>
         <span style="color:#888; font-size:11px;">❂ 응시가 유리합니다.</span>`,
        [
            { id:'ask',    label:'① 거울에게 되묻는다.',              fn:'s003G13R', arg:'ask' },
            { id:'silent', label:'② 대답하지 않는다.',                fn:'s003G13R', arg:'silent' },
            { id:'apple',  label:'③ 사과를 먹고 답을 얻는다.',        fn:'s003G13R', arg:'apple' },
            { id:'answer', label:'④ 떠오르는 답을 그대로 말한다.',     fn:'s003G13R', arg:'answer' }
        ], null);
}
function s003G13R(pick) { s003Resolve("기믹 13", S003_G13, pick); }

// --- 기믹 14: 동굴의 보물 (은신) ---
const S003_G14 = {
    pass: { dc: 11, kind: 'hide', mod: 1,
        okTxt: `아무것도 만지지 않고 지나간다.<br><br>보석들이 발목을 스치듯 굴러와도 밟지 않았다.<br>출구에서 뒤를 보니, 보석들이 전부 이쪽을 향해 있었다.`,
        failTxt: `소매가 보석 더미에 걸렸다.<br><br>하나가 굴러 떨어진다. 소리가 동굴 끝까지 간다.<br>동굴 입구가 조금 좁아진다.` },
    jewel: { dc: 10, kind: 'hide', failLore: 10,
        okTxt: `작은 것 하나를 소매에 넣는다.<br><br>아무 일도 없었다. 아직은.<br>소매 안이 따뜻하다.`,
        failTxt: `보석을 집자 동굴이 한 번 숨을 들이쉰다.<br><br>입구 쪽 빛이 좁아진다.<br>보석을 내려놓고 뛰었다. 겨우 빠져나왔다.` },
    wish: { dc: 8, kind: 'hide', taboo: ['aladdin'], tabooWhy: '소원을 말함', lore: 6,
        okTxt: `램프에 대고 나가게 해 달라고 말한다.<br><br>연기가 피어오르고, 출구가 바로 앞에 있다.<br>말한 그대로였다. 더도 덜도 아니게.`,
        failTxt: `소원을 말했다.<br><br>나갔다. 동굴 밖으로.<br>다른 사람들은 아직 안에 있다. 소원에 그들을 넣지 않았다.` }
};
function s003G14() {
    renderChoiceStep("기믹 14 — 동굴",
        `보석이 무릎까지 쌓인 동굴이다.<br><br>
         출구가 저 끝에 있다. 보석을 밟지 않고 가기는 어렵다.<br>
         벽감에 램프가 하나 놓여 있다.<br><br>
         <span style="color:#888; font-size:11px;">◐ 은신이 유리합니다.</span>`,
        [
            { id:'pass',  label:'① 아무것도 만지지 않고 지나간다.', fn:'s003G14R', arg:'pass' },
            { id:'jewel', label:'② 작은 보석 하나만 챙긴다.',      fn:'s003G14R', arg:'jewel' },
            { id:'wish',  label:'③ 램프에 나가게 해 달라고 한다.',  fn:'s003G14R', arg:'wish' }
        ], null);
}
function s003G14R(pick) { s003Resolve("기믹 14", S003_G14, pick); }

// --- 기믹 15: 우물 속 약속 (치유) ---
const S003_G15 = {
    keep: { dc: 10, kind: 'sense', extra: gHeal, mod: 1,
        onOk: () => addLore(-5, '지킨 약속'),
        okTxt: `약속하고, 그대로 한다.<br><br>우물 속 목소리가 두레박을 올려 준다. 맑은 물이다.<br>마시자 머릿속이 조금 가벼워졌다.`,
        failTxt: `약속을 지키려 했지만 목소리가 요구한 것이 늘어난다.<br><br>하나를 들어주면 둘을 말한다.<br>두레박은 끝내 절반만 올라왔다.` },
    none: { dc: 11, kind: 'sense', extra: gHeal,
        okTxt: `약속하지 않는다.<br><br>목소리가 한참 조르다가 포기한다.<br>두레박 없이 우물가를 돌아 나왔다.`,
        failTxt: `약속하지 않자 우물 속에서 손이 올라온다.<br><br>발목을 스친다. 차갑고 미끈하다.<br>겨우 떼어냈다.` },
    cheat: { dc: 8, kind: 'sense', extra: gHeal, taboo: ['frog', 'pinocchio'], tabooWhy: '약속을 어김(거짓)', lore: 6,
        okTxt: `약속하는 척하고 두레박만 받아 간다.<br><br>물은 얻었다.<br>우물 속에서 이름을 부르는 소리가 등 뒤로 한참 따라왔다.`,
        failTxt: `두레박을 받아 드는 순간 줄이 손목에 감긴다.<br><br>약속을 적어 둔 줄이었다.<br>풀어내는 데 한참 걸렸다.` }
};
function s003G15() {
    renderChoiceStep("기믹 15 — 우물",
        `우물 속에서 목소리가 올라온다.<br><br>
         <span style="color:#d4af37;">"두레박을 올려 줄게. 대신 약속 하나만."</span><br><br>
         무엇을 약속해야 하는지는 올려 준 다음에 말해 준다고 한다.<br><br>
         <span style="color:#888; font-size:11px;">❋ 치유가 유리합니다.</span>`,
        [
            { id:'keep',  label:'① 약속하고 그대로 지킨다.',          fn:'s003G15R', arg:'keep' },
            { id:'none',  label:'② 약속하지 않는다.',                 fn:'s003G15R', arg:'none' },
            { id:'cheat', label:'③ 약속하는 척하고 두레박만 받는다.',  fn:'s003G15R', arg:'cheat' }
        ], null);
}
function s003G15R(pick) { s003Resolve("기믹 15", S003_G15, pick); }

// --- 기믹 16: 모든 제목 (연결) ---
const S003_G16 = {
    all: { dc: 9, kind: 'rejoin', mod: 2, taboo: ['ariel'], tabooWhy: '소리를 냄',
        okTxt: `다 같이 제목을 부른다. 한 권씩, 순서대로.<br><br>부를 때마다 표지 하나가 닫힌다.<br>마지막 제목에서 목소리가 전부 겹쳤다. 틀린 사람이 없었다.`,
        failTxt: `순서가 엇갈렸다.<br><br>두 제목이 동시에 불렸고, 두 이야기가 한 장에 겹친다.<br>늑대가 램프를 들고 이쪽을 본다.` },
    write: { dc: 11, kind: 'rejoin', mod: 1,
        okTxt: `소리 내지 않고 제목을 적어 보여 준다.<br><br>표지들이 글씨를 읽는다. 하나씩 닫힌다.<br>조용해서 오히려 오래 걸렸다.`,
        failTxt: `적은 글씨가 번진다.<br><br>표지들이 읽지 못한다.<br>펼쳐진 채로 남은 책이 몇 권 생겼다.` },
    self: { dc: 12, kind: 'rejoin', lore: 6,
        okTxt: `자기 이야기 제목만 부른다.<br><br>자기 표지만 닫힌다. 나머지는 다른 사람이 닫았다.<br>그걸로도 충분했다.`,
        failTxt: `자기 제목을 부르는데 다른 제목이 튀어나왔다.<br><br>다른 사람의 이야기가 이쪽에 조금 옮아왔다.` }
};
function s003G16() {
    renderChoiceStep("기믹 16 — 모든 제목",
        `표지들이 펼쳐진 채로 떠 있다.<br><br>
         열네 권. 전부 제목이 반쯤 지워졌다.<br>
         누군가 제목을 불러 줘야 표지가 닫힌다. 닫히지 않은 책은 따라온다.<br><br>
         <span style="color:#888; font-size:11px;">⊙ 연결이 유리합니다.</span>`,
        [
            { id:'all',   label:'① 다 같이 소리 내어 부른다.',     fn:'s003G16R', arg:'all' },
            { id:'write', label:'② 적어서 보여 준다.',             fn:'s003G16R', arg:'write' },
            { id:'self',  label:'③ 자기 이야기 제목만 부른다.',    fn:'s003G16R', arg:'self' }
        ], null);
}
function s003G16R(pick) { s003Resolve("기믹 16", S003_G16, pick); }

// ==========================================
// ★ 공용 도우미
// ==========================================
function s003Nm(code) {
    const p = (darkRun && darkParties[darkRun.partyId]) || {};
    if (p.members && p.members[code] && p.members[code].name) return p.members[code].name;
    return db.users[code] ? db.users[code].name : '누군가';
}

function s003KindBonus(kind) {
    if (kind === 'hide')   return rollDarkBonus('hide') + gEvade();
    if (kind === 'break')  return rollDarkBonus('sense') + gBreak();
    if (kind === 'rejoin') return rollDarkBonus('rejoin');
    if (kind === 'luck')   return rollDarkBonus('sense') + gLuck();
    return rollDarkBonus('sense') + gGaze();
}

function s003Dice(roll, bonus, DC, ok) {
    return `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${DC})</span></div>`;
}

function s003SetSolo(on) {
    if (!darkRun) return;
    darkRun.solo = !!on;
    if (!database || !darkRun.isParty) return;
    const ref = database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`);
    if (on) ref.set({ name: currentUser.name, at: Date.now(), zone: 'S-003' });
    else ref.remove();
}

// ==========================================
// ★ 끌려감 — 14개 동화의 인물
// ==========================================
const S003_ABDUCTORS = [
    { id:'wolf', name:'늑대', tale:'빨간 망토', icon:'🐺',
      grab:`뒤에서 할머니 목소리가 부른다.<br><br>돌아보기도 전에 털 많은 팔이 허리를 감는다.<br>입김이 뒷목에 닿는다. 뜨겁고 비리다.<br><br>버틸 수 있을까.`,
      seen:`할머니 잠옷을 입은 무언가가 그를 끌고 숲 쪽 문단으로 사라진다.`,
      lair:`할머니 집 침대 위다.<br><br>이불이 무겁다. 이불 속에 뭔가 먼저 누워 있다.<br>늑대는 식탁에 앉아 포크를 닦고 있다. 서두르지 않는다.`,
      opts:[ {l:'① 이불 밑으로 빠져나간다.', kind:'hide', dc:10}, {l:'② 창문 틈을 찾는다.', kind:'sense', dc:11}, {l:'③ 침대 다리를 부순다.', kind:'break', dc:12} ] },
    { id:'hearts', name:'하트 여왕', tale:'이상한 나라의 앨리스', icon:'♥',
      grab:`카드 병사들이 양팔을 붙잡는다.<br><br><span style="color:#d4af37;">"목을 쳐라!"</span><br>이유는 말해 주지 않는다. 필요 없다는 듯이.<br><br>버틸 수 있을까.`,
      seen:`트럼프 카드들이 그를 둘러싸더니 한 장의 카드처럼 접혀 사라진다.`,
      lair:`장미 정원이다.<br><br>흰 장미를 붉게 칠하는 정원사들 사이에 세워졌다.<br>여왕이 크로켓 채를 휘두른다. 공은 고슴도치다. 다음 공은 이쪽인 것 같다.`,
      opts:[ {l:'① 장미 덤불 사이로 숨는다.', kind:'hide', dc:10}, {l:'② 판결문의 오자를 찾아 따진다.', kind:'sense', dc:11}, {l:'③ 카드 병사를 찢는다.', kind:'break', dc:12} ] },
    { id:'hook', name:'후크 선장', tale:'피터팬', icon:'🪝',
      grab:`갈고리가 옷깃에 걸린다.<br><br>똑딱, 똑딱. 어디선가 시계 소리가 가깝다.<br>몸이 들려 뱃전 쪽으로 끌린다.<br><br>버틸 수 있을까.`,
      seen:`갈고리 하나가 페이지 밖에서 내려와 그를 낚아채 갔다.`,
      lair:`해적선 널빤지 끝이다.<br><br>아래는 물이다. 물속에서 시계 소리가 난다.<br>후크가 칼끝으로 등을 민다. 한 걸음씩.`,
      opts:[ {l:'① 돛줄을 타고 숨는다.', kind:'hide', dc:10}, {l:'② 시계 소리 방향을 읽어 피한다.', kind:'sense', dc:11}, {l:'③ 널빤지를 부러뜨린다.', kind:'break', dc:12} ] },
    { id:'giant', name:'거인', tale:'잭과 콩나무', icon:'🌩',
      grab:`구름 위에서 손이 내려온다. 손바닥 하나가 방만 하다.<br><br><span style="color:#d4af37;">"피 냄새가 난다."</span><br>손가락 두 개가 몸을 집어 올린다.<br><br>버틸 수 있을까.`,
      seen:`하늘이 어두워지더니 커다란 손가락이 그를 집어 구름 위로 가져갔다.`,
      lair:`거인의 식탁 위다.<br><br>빵 부스러기가 바위만 하다. 소금 통 뒤에 사람들이 숨어 있다.<br>거인이 칼을 간다. 소리가 천둥 같다.`,
      opts:[ {l:'① 소금 통 뒤로 숨는다.', kind:'hide', dc:10}, {l:'② 거인이 잠드는 박자를 센다.', kind:'sense', dc:11}, {l:'③ 식탁 다리를 무너뜨린다.', kind:'break', dc:12} ] },
    { id:'seawitch', name:'바다 마녀', tale:'인어공주', icon:'🐙',
      grab:`발목에 촉수가 감긴다.<br><br>차갑다. 바닥이 물로 바뀐다.<br><span style="color:#d4af37;">"예쁜 목소리네. 값을 좀 쳐 줄게."</span><br><br>버틸 수 있을까.`,
      seen:`바닥에 물웅덩이가 생기더니 그를 삼키고 다시 말랐다.`,
      lair:`해저 동굴이다.<br><br>항아리마다 목소리가 담겨 있다. 전부 속삭인다.<br>마녀가 빈 항아리 하나를 이쪽 입가에 댄다.`,
      opts:[ {l:'① 항아리 사이로 숨는다.', kind:'hide', dc:10}, {l:'② 목소리들이 알려 주는 출구를 듣는다.', kind:'sense', dc:11}, {l:'③ 항아리를 깨뜨린다.', kind:'break', dc:12} ] },
    { id:'fox', name:'외눈 여우', tale:'피노키오', icon:'🦊',
      grab:`다정하게 어깨를 감싼다. 한쪽 눈이 없다.<br><br><span style="color:#d4af37;">"좋은 데 데려가 줄게. 금화가 열리는 나무가 있거든."</span><br>발이 저절로 따라간다.<br><br>버틸 수 있을까.`,
      seen:`외눈 여우가 그와 어깨동무를 하고 웃으며 샛길로 빠졌다.`,
      lair:`금화를 심는 밭이다.<br><br>땅에 묻힌 것은 금화가 아니라 손가락이다. 나무처럼 자란다.<br>여우가 삽을 건넨다. 이쪽 차례라고.`,
      opts:[ {l:'① 고랑 사이로 기어 숨는다.', kind:'hide', dc:10}, {l:'② 여우의 거짓말을 짚어 낸다.', kind:'sense', dc:11}, {l:'③ 삽으로 여우를 친다.', kind:'break', dc:12} ] },
    { id:'monkey', name:'날개 달린 원숭이', tale:'오즈의 마법사', icon:'🐒',
      grab:`하늘에서 날갯짓 소리가 쏟아진다.<br><br>원숭이 손 여럿이 팔다리를 하나씩 붙잡는다.<br>발이 땅에서 떨어진다.<br><br>버틸 수 있을까.`,
      seen:`날개 달린 원숭이 떼가 그를 들고 서쪽 하늘로 날아갔다.`,
      lair:`서쪽 마녀의 성이다.<br><br>빗자루가 벽마다 걸려 있고, 바닥에 물 한 방울 없다.<br>원숭이들이 창틀에 앉아 지켜본다. 지쳐 보인다.`,
      opts:[ {l:'① 빗자루 사이로 숨는다.', kind:'hide', dc:10}, {l:'② 원숭이들이 무엇을 두려워하는지 본다.', kind:'sense', dc:11}, {l:'③ 물통을 찾아 쏟는다.', kind:'break', dc:12} ] },
    { id:'stepmother', name:'계모', tale:'신데렐라', icon:'🕯',
      grab:`손목을 잡는 손이 차갑고 곱다.<br><br><span style="color:#d4af37;">"일이 남았잖니. 무도회는 너 같은 애가 가는 데가 아니야."</span><br>부엌 쪽으로 끌린다.<br><br>버틸 수 있을까.`,
      seen:`촛불을 든 여인이 그의 손목을 잡고 부엌 문단으로 데려갔다.`,
      lair:`재가 쌓인 부엌이다.<br><br>렌틸콩이 재 속에 뿌려져 있다. 전부 골라내야 한다.<br>계모가 모래시계를 뒤집는다.`,
      opts:[ {l:'① 굴뚝으로 숨는다.', kind:'hide', dc:10}, {l:'② 새들이 오는 창을 찾는다.', kind:'sense', dc:11}, {l:'③ 부엌문을 부순다.', kind:'break', dc:12} ] },
    { id:'patmom', name:'팥쥐 어미', tale:'콩쥐 팥쥐', icon:'🥢',
      grab:`머리채를 잡는다.<br><br><span style="color:#d4af37;">"어딜 싸돌아다녀. 할 일이 산더미인데."</span><br>힘이 사람 것이 아니다.<br><br>버틸 수 있을까.`,
      seen:`비녀를 꽂은 여인이 그의 머리채를 잡고 초가집 쪽으로 끌고 갔다.`,
      lair:`초가집 뒤꼍이다.<br><br>나무 호미로 돌밭을 매야 한다. 호미가 벌써 부러져 있다.<br>담장 너머에서 팥쥐가 웃는다.`,
      opts:[ {l:'① 장독대 뒤에 숨는다.', kind:'hide', dc:10}, {l:'② 검은 소가 오는 길을 찾는다.', kind:'sense', dc:11}, {l:'③ 담장을 허문다.', kind:'break', dc:12} ] },
    { id:'oni', name:'오니', tale:'복숭아 동자', icon:'👹',
      grab:`쇠곤봉이 앞을 가로막는다.<br><br>뿔이 천장에 닿는다. 웃을 때마다 이빨 사이로 불씨가 튄다.<br>한 손으로 목덜미를 들어 올린다.<br><br>버틸 수 있을까.`,
      seen:`붉은 오니가 그를 옆구리에 끼고 바다 쪽 문단으로 걸어갔다.`,
      lair:`오니섬 창고다.<br><br>보물 사이사이에 사람들이 쌓여 있다. 보물처럼.<br>오니가 장부에 이쪽 이름을 적는다.`,
      opts:[ {l:'① 보물 더미 속으로 숨는다.', kind:'hide', dc:10}, {l:'② 장부에서 빠진 칸을 찾는다.', kind:'sense', dc:11}, {l:'③ 창고 문을 부순다.', kind:'break', dc:12} ] },
    { id:'tiger', name:'호랑이', tale:'해와 달이 된 오누이', icon:'🐯',
      grab:`엄마 목소리가 뒤에서 부른다.<br><br>돌아보기 전에 털 많은 팔이 목을 감는다. 엄마 저고리를 입고 있다.<br><span style="color:#d4af37;">"떡 하나 주면 안 잡아먹지."</span><br><br>버틸 수 있을까.`,
      seen:`저고리를 입은 호랑이가 그를 입에 물고 고개 너머로 넘어갔다.`,
      lair:`고갯마루다.<br><br>떡 광주리가 비어 있다. 호랑이가 더 없냐고 묻는다.<br>고개는 아직 여러 개 남았다.`,
      opts:[ {l:'① 수숫대 밭에 숨는다.', kind:'hide', dc:10}, {l:'② 호랑이가 속는 말을 고른다.', kind:'sense', dc:11}, {l:'③ 돌을 던져 도망친다.', kind:'break', dc:12} ] },
    { id:'queen', name:'왕비', tale:'백설공주', icon:'🪞',
      grab:`거울 속에서 손이 뻗어 나온다.<br><br><span style="color:#d4af37;">"거울아, 거울아. 저 애는 누구니?"</span><br>거울 속으로 당겨진다.<br><br>버틸 수 있을까.`,
      seen:`복도 거울에서 하얀 손이 나와 그를 거울 안으로 데려갔다.`,
      lair:`거울 안쪽 성이다.<br><br>모든 방에 거울이 있고, 모든 거울에 왕비가 있다.<br>독이 든 빗, 끈, 사과가 식탁에 가지런하다.`,
      opts:[ {l:'① 비치지 않는 모서리에 숨는다.', kind:'hide', dc:10}, {l:'② 진짜 왕비가 비친 거울을 찾는다.', kind:'sense', dc:11}, {l:'③ 거울을 깬다.', kind:'break', dc:12} ] },
    { id:'sorcerer', name:'마법사', tale:'알라딘과 요술 램프', icon:'🧙',
      grab:`반지 낀 손이 어깨를 누른다.<br><br><span style="color:#d4af37;">"조카야, 램프를 가져오너라."</span><br>발밑이 열리고 동굴로 떨어진다.<br><br>버틸 수 있을까.`,
      seen:`반지 낀 사내가 손가락을 튕기자 바닥이 열리고 그가 떨어졌다.`,
      lair:`봉인된 동굴이다.<br><br>입구가 돌로 막혔다. 마법사가 밖에서 램프를 달라고 한다.<br>램프를 주면 입구를 열어 주겠다고 한다. 믿을 수 없다.`,
      opts:[ {l:'① 보석 사이에 숨어 기다린다.', kind:'hide', dc:10}, {l:'② 반지의 힘이 어디서 오는지 본다.', kind:'sense', dc:11}, {l:'③ 돌을 밀어낸다.', kind:'break', dc:12} ] },
    { id:'witch', name:'우물 마녀', tale:'개구리 왕자', icon:'🧹',
      grab:`뒤에서 누가 이름을 적는 소리가 난다.<br><br><span style="color:#d4af37;">"약속을 어긴 적 있지?"</span><br>몸이 작아진다. 우물 속으로 떨어진다.<br><br>버틸 수 있을까.`,
      seen:`검은 옷의 노파가 그의 이름을 부르자 그가 작아져 우물로 떨어졌다.`,
      lair:`우물 바닥이다.<br><br>개구리들이 앉아 있다. 전부 한때 누군가였다.<br>마녀가 우물 위에서 약속 목록을 읽는다.`,
      opts:[ {l:'① 개구리들 사이에 섞여 숨는다.', kind:'hide', dc:10}, {l:'② 목록에서 이쪽 이름이 틀린 곳을 찾는다.', kind:'sense', dc:11}, {l:'③ 우물 벽을 딛고 뛰어오른다.', kind:'break', dc:12} ] }
];

function s003Abd(id) {
    return S003_ABDUCTORS.find(a => a.id === id) || S003_ABDUCTORS[0];
}

function renderS003Abduct(n) {
    const body = darkBodyEl();
    const myStep = darkRun.step;

    // 파티가 아니거나 이미 떨어져 있으면 넘어간다
    if (!database || !darkRun.isParty || darkRun.solo) { partyAdvance(myStep + 1); return; }

    const pid = darkRun.partyId;
    const key = `s003abd${n}`;
    const done = darkRun['_' + key];
    if (done) {
        body.innerHTML = darkBox("—", `책장이 조용해졌다.<br><br>일행은 아직 앞에 있다.`,
            loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${myStep + 1})`));
        renderLoreBar(); mountDarkChat('normal');
        return;
    }

    body.innerHTML = darkBox("—",
        `책장 사이로 바람이 든다.<br><br>
         어느 이야기에서 새어 나온 바람인지 모르겠다.<br>
         다들 숨을 죽인다.`,
        loreBarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">기척을 살피는 중...</div>`);
    renderLoreBar(); mountDarkChat('normal');

    const ref = database.ref(`darkParties/${pid}/${key}`);
    let shown = false;

    const pick = () => {
        database.ref(`darkParties/${pid}/s003Abd`).transaction(cur => {
            if (cur && cur.order) return;
            const ids = S003_ABDUCTORS.map(a => a.id).sort(() => Math.random() - 0.5).slice(0, 5);
            return { order: ids };
        }).then(r => {
            const order = ((r.snapshot && r.snapshot.val()) || {}).order || [];
            const abd = order[n - 1] || S003_ABDUCTORS[(n - 1) % S003_ABDUCTORS.length].id;
            const p = darkParties[pid] || {};
            const solo = p.solo || {};
            const alive = p.alive ? Object.keys(p.alive).filter(c => !solo[c]) : [];
            if (!alive.length) return;
            const t = alive[Math.floor(Math.random() * alive.length)];
            return ref.transaction(cur => (cur && cur.target) ? undefined : { target: t, abd: abd, at: Date.now() });
        }).catch(() => {});
    };

    if (darkRun.isLeader) pick();
    const t1 = setTimeout(() => { if (darkRun && darkRun.step === myStep && !shown) pick(); }, 3000);
    const t2 = setTimeout(() => {
        if (darkRun && darkRun.step === myStep && !shown) { try { ref.off(); } catch (e) {} partyAdvance(myStep + 1); }
    }, 10000);

    try { ref.off(); } catch (e) {}
    ref.on('value', sn => {
        const m = sn.val();
        if (!m || !m.target || !darkRun || darkRun.step !== myStep || shown) return;
        shown = true;
        clearTimeout(t1); clearTimeout(t2);
        try { ref.off(); } catch (e) {}

        const a = s003Abd(m.abd);
        const isMe = m.target === currentUser.code;
        darkRun._s003AbdCur = { n: n, abd: a.id, target: m.target };

        if (isMe) {
            body.innerHTML = darkBox(`${a.icon} ${a.name}`,
                a.grab + `<br><br><span style="color:#888; font-size:11px;">— ${a.tale}에서 새어 나왔다.</span>`,
                loreBarHtml() + darkChoiceBtn("버틴다.", `s003Resist(${n})`));
        } else {
            body.innerHTML = darkBox(`${a.icon} ${a.name}`,
                `<b style="color:#ff6b6b;">${s003Nm(m.target)}</b> 사원 쪽으로 무언가 손을 뻗는다.<br><br>${a.seen}<br><br>
                 <span style="color:#888; font-size:11px;">찾으러 가면 끌려간 쪽의 탈출이 쉬워집니다.</span>`,
                loreBarHtml() +
                darkChoiceBtn("① 끌려간 쪽을 찾으러 간다. (감각)", `s003Search(${n})`) +
                darkChoiceBtn("② 계속 간다.", `partyAdvance(${myStep + 1})`));
        }
        renderLoreBar(); mountDarkChat('normal');
    });
}

function s003Resist(n) {
    if (!darkRun) return;
    const cur = darkRun._s003AbdCur || {};
    const a = s003Abd(cur.abd);
    const key = `s003abd${n}`;
    const ref = database.ref(`darkParties/${darkRun.partyId}/${key}`);

    if (consumeQFlag('no_mark')) {
        darkRun['_' + key] = 'safe';
        ref.child('result').set('safe');
        darkRun.success++;
        darkBodyEl().innerHTML = darkBox("—",
            `명찰을 내민다.<br><br>${a.name}의 손이 멈춘다. 이 이야기의 등장인물 목록에 없는 이름이다.<br>다른 쪽으로 간다.`,
            loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${darkRun.step + 1})`));
        renderLoreBar(); mountDarkChat('normal');
        return;
    }

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = s003KindBonus('hide');
    const DC = s003DC(10);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    darkRun['_' + key] = ok ? 'safe' : 'taken';
    ref.child('result').set(ok ? 'safe' : 'taken');
    darkRun.log.push(`[끌려감 ${n}] ${a.name} d20 ${roll} vs DC${DC} — ${ok ? '버팀' : '끌려감'}`);

    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 1;
        sendPartyChat(`${currentUser.name} 사원이 ${a.name}을(를) 뿌리쳤습니다.`, true);
        darkBodyEl().innerHTML = darkBox(`${a.icon} ${a.name}`,
            s003Dice(roll, bonus, DC, true) +
            `버텼다.<br><br>${a.name}의 손이 종이처럼 구겨지며 물러난다.<br>원래 있던 장으로 돌아갔다. 다음 기회를 노리는 얼굴로.`,
            loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${darkRun.step + 1})`));
        renderLoreBar(); mountDarkChat('normal');
        return;
    }

    darkRun.fail++;
    addLore(6, `${a.name}에게 끌려감`);
    applyPollutionToUser(currentUser, 8);
    s003SetSolo(true);
    darkRun.s003Lair = { n: n, abd: a.id };
    sendPartyChat(`${currentUser.name} 사원이 ${a.name}에게 끌려갔습니다.`, true);

    darkBodyEl().innerHTML = darkBox(`${a.icon} ${a.name}`,
        s003Dice(roll, bonus, DC, false) +
        `버티지 못했다.<br><br>일행의 얼굴이 종이 너머로 멀어진다.<br>${a.tale}의 장이 등 뒤에서 덮인다.`,
        loreBarHtml() + darkChoiceBtn("눈을 뜬다.", "renderS003Lair()"));
    renderLoreBar(); mountDarkChat('normal');
}

function s003Search(n) {
    if (!darkRun || !database) return;
    const myStep = darkRun.step;
    const ref = database.ref(`darkParties/${darkRun.partyId}/s003abd${n}`);

    ref.once('value').then(sn => {
        if (!darkRun) return;
        const m = sn.val() || {};
        const a = s003Abd(m.abd);
        const nm = s003Nm(m.target);

        if (m.result === 'safe') {
            darkRun.modifier = (darkRun.modifier || 0) + 1;
            darkBodyEl().innerHTML = darkBox("수색",
                `찾으러 가 보니 <b>${nm}</b> 사원은 이미 버텨 내고 서 있었다.<br><br>
                 둘 다 숨이 찼다. 말없이 어깨를 한 번 쳤다.`,
                loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${myStep + 1})`));
            renderLoreBar(); mountDarkChat('normal');
            return;
        }

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = s003KindBonus('sense');
        const DC = s003DC(9);
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (ok) {
            ref.child('found/' + currentUser.code).set(currentUser.name);
            darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
            applyPollutionToUser(currentUser, 4);
            sendPartyChat(`${currentUser.name} 사원이 ${nm} 사원이 끌려간 장을 찾았습니다.`, true);
            txt = `${a.tale}의 장 가장자리를 찾았다.<br><br>
                   찢어진 틈에 입을 대고 <b>${nm}</b> 사원의 이름을 불렀다. 진짜 이름으로.<br>
                   안쪽에서 무언가 대답한 것 같다.`;
        } else {
            addLore(5, '수색 실패');
            txt = `찾지 못했다.<br><br>
                   비슷한 장이 너무 많다. 넘길 때마다 다른 이야기다.<br>
                   ${a.name}의 냄새만 손끝에 남았다.`;
        }
        darkRun.log.push(`[수색 ${n}] d20 ${roll} vs DC${DC} — ${ok ? '찾음' : '못 찾음'}`);

        darkBodyEl().innerHTML = darkBox("수색", s003Dice(roll, bonus, DC, ok) + txt,
            loreBarHtml() + darkChoiceBtn("일행에게 돌아간다.", `partyAdvance(${myStep + 1})`));
        renderLoreBar(); mountDarkChat('normal');
    });
}

function s003LairFound(n) {
    if (!database || !darkRun) return Promise.resolve({});
    return database.ref(`darkParties/${darkRun.partyId}/s003abd${n}/found`).once('value')
        .then(s => s.val() || {}).catch(() => ({}));
}

function renderS003Lair() {
    if (!darkRun || !darkRun.s003Lair) return;
    const L = darkRun.s003Lair;
    const a = s003Abd(L.abd);

    s003LairFound(L.n).then(found => {
        if (!darkRun || !darkRun.s003Lair) return;
        const names = Object.values(found);
        darkBodyEl().innerHTML = darkBox(`${a.icon} ${a.name}의 장`,
            a.lair +
            (names.length
                ? `<br><br><span style="color:#4CAF50;">종이 너머에서 이름을 부르는 소리가 난다. ${names.join(', ')}.</span>`
                : `<br><br><span style="color:#888; font-size:11px;">아직 아무도 부르지 않는다.</span>`),
            loreBarHtml() +
            a.opts.map((o, i) => darkChoiceBtn(o.l, `s003LairPick(${i})`)).join(''));
        renderLoreBar(); mountDarkChat('normal');
    });
}

function s003LairPick(i) {
    if (!darkRun || !darkRun.s003Lair) return;
    const L = darkRun.s003Lair;
    const a = s003Abd(L.abd);
    const o = a.opts[i];
    if (!o) return;

    s003LairFound(L.n).then(found => {
        if (!darkRun || !darkRun.s003Lair) return;
        const finders = Object.keys(found).length;
        const fb = Math.min(8, finders * 4);

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = s003KindBonus(o.kind) + fb;
        const DC = s003DC(o.dc);
        const ok = roll !== 1 && (roll + bonus) >= DC;

        darkRun.log.push(`[${a.name}의 장] ${o.kind} d20 ${roll} vs DC${DC} (찾은 동료 ${finders})`);

        // 아무도 찾지 않았고 대실패면 그 이야기에 남는다
        if (roll === 1 && finders === 0) {
            darkRun.fail += 2;
            darkRun.s003Lair = null;
            darkDeath(
                `${a.name}의 장이 완전히 덮였다.<br><br>` +
                `아무도 이름을 부르지 않았다. 부를 틈이 없었다.<br>` +
                `이야기가 한 줄 늘었다.<br><br>` +
                `<span style="color:#d4af37;">"그리고 한 사람이 더 그곳에 살게 되었습니다."</span>`
            );
            return;
        }

        let txt;
        if (ok) {
            darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 2;
            addLore(-4, '탈출');
            let pageTxt = '';
            if (finders > 0) {
                const pages = darkRun.talePages || (darkRun.talePages = []);
                const miss = [];
                for (let k = 1; k <= S003_PAGE_TOTAL; k++) if (!pages.includes(k)) miss.push(k);
                if (miss.length) {
                    pages.push(miss[0]);
                    pageTxt = `<br><br><span style="color:#d4af37;">✦ 빠져나오면서 찢어진 장 하나를 쥐었다. (${pages.length} / ${S003_PAGE_TOTAL})</span>`;
                }
            }
            txt = `빠져나왔다.<br><br>
                   ${a.name}의 장이 등 뒤에서 덮인다. 종이 넘어가는 소리가 한 번.<br>
                   ${finders ? '이름을 불러 준 쪽으로 걸었다. 목소리가 길이 되어 주었다.' : '일행이 있는 문단에서 불빛이 샌다.'}${pageTxt}`;
        } else {
            darkRun.fail++;
            addLore(12, `${a.name}의 장`);
            applyPollutionToUser(currentUser, 10);
            txt = `빠져나오기는 했다.<br><br>
                   ${a.name}의 장에 무언가를 두고 왔다. 무엇인지는 모르겠다.<br>
                   이야기를 조금 더 알게 됐다. 알고 싶지 않았던 쪽으로.`;
        }

        darkBodyEl().innerHTML = darkBox(`${a.icon} ${a.name}의 장 — 결과`,
            s003Dice(roll, bonus, DC, ok) +
            (fb ? `<div style="text-align:center; font-size:10px; color:#4CAF50; margin:-6px 0 10px 0;">찾으러 온 동료 보정 +${fb}</div>` : '') +
            txt,
            loreBarHtml() + darkChoiceBtn("일행에게 돌아간다.", "s003LairReturn()"));
        renderLoreBar(); mountDarkChat('normal');
    });
}

function s003LairReturn() {
    if (!darkRun) return;
    darkRun.s003Lair = null;
    s003SetSolo(false);
    sendPartyChat(`${currentUser.name} 사원이 돌아왔습니다.`, true);

    if (!database || !darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }
    database.ref(`darkParties/${darkRun.partyId}/curStep`).once('value').then(sn => {
        if (!darkRun) return;
        const cur = sn.val() || 0;
        darkRun.step = Math.max(cur, darkRun.step + 1);
        detachVoteListener();
        renderDarkStep();
    });
}

// ==========================================
// ★ 흩어짐 (4회)
// ==========================================
const S003_SCATTER = {
1: {
    split:`책이 양쪽으로 크게 펼쳐진다.<br><br>
        가운데 제본선이 벌어지면서 발밑이 갈라진다.<br>
        일행이 왼쪽 페이지와 오른쪽 페이지로 나뉘어 떨어진다.`,
    A: { title:'왼쪽 페이지 — 숲', hint:'각자 고릅니다. 같은 장의 사람과는 채팅으로 의논할 수 있습니다.',
         text:`나무가 전부 같은 모양인 숲이다.<br><br>
            노란 벽돌 길과 오솔길이 겹쳐 있다. 어느 쪽이 어느 이야기인지 섞였다.<br>
            멀리서 늑대 울음과 날갯짓 소리가 동시에 난다.`,
         ok:`길을 맞게 골랐다.<br><br>숲이 조금씩 옅어진다. 제본선 쪽으로 이어지는 길이다.`,
         fail:`같은 나무를 세 번 지났다.<br><br>나무껍질에 이쪽 이름이 새겨져 있었다. 세 번 다.`,
         opts:[ {l:'① 노란 벽돌만 밟는다.', kind:'hide', extra:gEvade, dc:10, taboo:['hood'], tabooWhy:'길을 벗어남(다른 길로 들어섬)'},
                {l:'② 오솔길을 따른다.', kind:'hide', extra:gEvade, dc:10},
                {l:'③ 나무에 표시를 하며 간다.', kind:'sense', extra:gGaze, dc:11, lore:4} ] },
    B: { title:'오른쪽 페이지 — 바다', hint:'각자 고릅니다. 같은 장의 사람과는 채팅으로 의논할 수 있습니다.',
         text:`물이 선으로 그려진 바다다.<br><br>
            해적선 한 척이 지나가고, 물 아래에서 누가 노래한다.<br>
            해변에 작은 배가 묶여 있다.`,
         ok:`배를 몰아 제본선 쪽 물가에 닿았다.<br><br>노래는 끝까지 따라오지 못했다.`,
         fail:`노랫소리에 한참 멈춰 있었다.<br><br>정신을 차리니 발목까지 물이 차 있었다.`,
         opts:[ {l:'① 배를 타고 노를 젓는다.', kind:'break', extra:gBreak, dc:10},
                {l:'② 노래를 따라 물가를 걷는다.', kind:'sense', extra:gGaze, dc:11, lore:5},
                {l:'③ 소리 내어 해적선을 부른다.', kind:'hide', dc:9, taboo:['ariel'], tabooWhy:'소리를 냄'} ] }
},
2: {
    split:`제본이 풀린다.<br><br>
        실이 한 올씩 빠지면서 페이지가 낱장으로 흩어진다.<br>
        바람에 날린 장마다 사람이 하나둘씩 실려 간다.`,
    A: { title:'부엌 장', hint:'각자 고릅니다.',
         text:`재가 쌓인 부엌과 초가집 부엌이 한 장에 겹쳤다.<br><br>
            아궁이 두 개, 독 두 개. 한쪽 독은 밑이 빠졌다.<br>
            누가 일을 시키러 올 것 같은 공기다.`,
         ok:`일을 끝내 놓았다.<br><br>일을 시키러 온 사람이 아무 말 없이 돌아갔다. 문이 열려 있다.`,
         fail:`일이 끝나지 않는다.<br><br>할 때마다 재가 다시 쌓인다. 손끝이 까맣다.`,
         opts:[ {l:'① 새들에게 콩을 골라 달라 한다.', kind:'rejoin', dc:9},
                {l:'② 혼자 서둘러 끝낸다.', kind:'sense', extra:gGaze, dc:11, taboo:['kongjwi'], tabooWhy:'도움을 거절함'},
                {l:'③ 아궁이 뒤로 빠져나간다.', kind:'hide', extra:gEvade, dc:10} ] },
    B: { title:'섬 장', hint:'각자 고릅니다.',
         text:`복숭아 씨가 쌓인 해변이다.<br><br>
            섬 안쪽에서 북소리가 난다. 오니들의 잔치다.<br>
            해변 끝에 작은 동굴 입구가 보인다.`,
         ok:`북소리 박자를 틈타 해변을 가로질렀다.<br><br>동굴 안쪽에 제본선이 보인다.`,
         fail:`북소리가 멎었다.<br><br>모래 위에 발자국이 너무 많이 남았다. 뿔 달린 그림자가 그걸 세고 있다.`,
         opts:[ {l:'① 북소리에 맞춰 달린다.', kind:'hide', extra:gEvade, dc:10},
                {l:'② 동굴 입구를 부수고 들어간다.', kind:'break', extra:gBreak, dc:11},
                {l:'③ 먼저 혼자 헤엄쳐 빠져나간다.', kind:'hide', dc:9, taboo:['momo'], tabooWhy:'동료를 두고 먼저 감'} ] }
},
3: {
    split:`삽화가 커진다.<br><br>
        액자 틀을 넘어 그림이 번져 나온다. 사람을 하나씩 삼킨다.<br>
        삼켜진 쪽은 두 개의 그림으로 나뉘었다.`,
    A: { title:'작은 집 그림', hint:'각자 고릅니다.',
         text:`일곱 개의 작은 침대가 있는 집이다.<br><br>
            식탁 위에 음식이 차려져 있다. 일곱 명분인데 한 명분이 이미 비었다.<br>
            창밖에서 노파가 손을 흔든다.`,
         ok:`아무것도 먹지 않고, 창도 열지 않았다.<br><br>그림 가장자리가 흐려지며 출구가 된다.`,
         fail:`식탁 앞에서 너무 오래 서 있었다.<br><br>의자가 저절로 빠져 앉으라고 권한다. 겨우 물러섰다.`,
         opts:[ {l:'① 음식에 손대지 않고 뒷문을 찾는다.', kind:'sense', extra:gGaze, dc:10},
                {l:'② 한 입만 먹고 힘을 낸다.', kind:'sense', dc:9, taboo:['snow'], tabooWhy:'건네받은 것을 먹음'},
                {l:'③ 창을 열어 노파에게 길을 묻는다.', kind:'hide', dc:11, taboo:['sunmoon'], tabooWhy:'문(창)을 열어 줌', lore:5} ] },
    B: { title:'사막 동굴 그림', hint:'각자 고릅니다.',
         text:`모래 언덕 아래 동굴이다.<br><br>
            안에서 램프 빛이 새어 나온다. 반지 낀 사내가 입구에서 기다린다.<br>
            모래가 발목까지 차오른다.`,
         ok:`사내 옆을 지나쳐 동굴 반대편 틈으로 나왔다.<br><br>모래가 발자국을 지워 주었다.`,
         fail:`모래에 발이 묶였다.<br><br>빠져나오는 동안 사내가 한참 웃었다.`,
         opts:[ {l:'① 모래 언덕을 따라 우회한다.', kind:'hide', extra:gEvade, dc:10},
                {l:'② 램프 빛을 보고 길을 읽는다.', kind:'sense', extra:gGaze, dc:11, lore:4},
                {l:'③ 램프에 대고 나가고 싶다고 말한다.', kind:'sense', dc:9, taboo:['aladdin'], tabooWhy:'소원을 말함'} ] }
},
4: {
    split:`목차 번호가 뒤섞인다.<br><br>
        장 번호가 서로 자리를 바꾸면서 사람들도 따라 옮겨진다.<br>
        눈을 뜨니 두 장으로 갈려 있다.`,
    A: { title:'우물 장', hint:'각자 고릅니다.',
         text:`성 뒤뜰의 우물이다.<br><br>
            우물가에 금공이 떨어져 있다. 우물 속에서 누가 약속을 청한다.<br>
            성벽이 높다. 문은 하나, 잠겨 있다.`,
         ok:`우물의 약속을 지키고 열쇠를 받았다.<br><br>성문이 열린다.`,
         fail:`약속이 엉켰다.<br><br>우물 속 목소리가 이쪽 이름을 목록에 적는 소리가 났다.`,
         opts:[ {l:'① 약속하고 그대로 지킨다.', kind:'sense', extra:gHeal, dc:10},
                {l:'② 약속하는 척 열쇠만 받는다.', kind:'hide', dc:9, taboo:['frog','pinocchio'], tabooWhy:'약속을 어김(거짓)'},
                {l:'③ 성벽을 타고 넘는다.', kind:'break', extra:gBreak, dc:11} ] },
    B: { title:'초가집 장', hint:'각자 고릅니다.',
         text:`해가 진 초가집이다.<br><br>
            문밖에서 엄마 목소리가 떡을 가져왔다고 한다.<br>
            뒷마당 나무가 하늘까지 닿아 있다.`,
         ok:`나무를 타고 올라 장 경계를 넘었다.<br><br>문은 끝까지 열지 않았다.`,
         fail:`나무를 오르다 미끄러졌다.<br><br>아래에서 떡 냄새와 비린내가 같이 올라왔다.`,
         opts:[ {l:'① 뒷마당 나무를 타고 오른다.', kind:'hide', extra:gEvade, dc:10},
                {l:'② 문고리를 붙잡고 버티며 날이 밝길 기다린다.', kind:'rejoin', dc:11},
                {l:'③ 엄마인지 확인하려 문을 연다.', kind:'sense', dc:9, taboo:['sunmoon'], tabooWhy:'문을 열어 줌'} ] }
}
};

function renderS003Scatter(n) {
    const body = darkBodyEl();
    const myStep = darkRun.step;
    if (!database || !darkRun.isParty) { partyAdvance(myStep + 1); return; }

    const sc = S003_SCATTER[n];
    body.innerHTML = darkBox(`흩어짐 ${n}`, sc.split,
        loreBarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">흩어지는 중...</div>`);
    renderLoreBar(); mountDarkChat('normal');

    const p = darkParties[darkRun.partyId] || {};
    const codes = Object.keys(p.alive || p.members || {});
    if (!codes.includes(currentUser.code)) codes.push(currentUser.code);

    database.ref(`darkParties/${darkRun.partyId}/s003sc${n}`).transaction(cur => {
        if (cur) {
            if (cur[currentUser.code]) return;
            cur[currentUser.code] = Math.random() < 0.5 ? 'A' : 'B';
            return cur;
        }
        const g = {};
        codes.slice().sort(() => Math.random() - 0.5).forEach((c, i) => { g[c] = (i % 2 === 0) ? 'A' : 'B'; });
        return g;
    }).then(r => {
        if (!darkRun || darkRun.step !== myStep) return;
        const g = (r.snapshot && r.snapshot.val()) || {};
        const mine = g[currentUser.code] || 'A';
        darkRun.s003Group = mine;
        s003SetSolo(true);
        darkRun.log.push(`[흩어짐 ${n}] ${mine}쪽`);

        const mates = Object.keys(g).filter(c => c !== currentUser.code && g[c] === mine).map(s003Nm);
        body.innerHTML = darkBox(`흩어짐 ${n}`,
            sc.split + `<br><br>` +
            (mates.length
                ? `같은 장에 떨어진 사람 — <b style="color:#d4af37;">${mates.join(', ')}</b>`
                : `<span style="color:#ff9800;">혼자 떨어졌다.</span>`),
            loreBarHtml() + darkChoiceBtn("둘러본다.", `partyAdvance(${myStep + 1})`));
        renderLoreBar(); mountDarkChat('normal');
    }).catch(() => partyAdvance(myStep + 1));
}

function renderS003SScene(n) {
    const g = darkRun.s003Group || 'A';
    const sc = S003_SCATTER[n] && S003_SCATTER[n][g];
    if (!sc) { partyAdvance(darkRun.step + 1); return; }
    darkRun.solo = true;

    renderChoiceStep(sc.title,
        sc.text + `<br><br><span style="color:#888; font-size:11px;">${sc.hint}</span>`,
        sc.opts.map((o, i) => ({ id: 'o' + i, label: o.l, fn: 's003SPick', arg: `${n}${g}${i}` })),
        null);
}

function s003SPick(arg) {
    const n = parseInt(arg.charAt(0), 10);
    const g = arg.charAt(1);
    const i = parseInt(arg.charAt(2), 10);
    const sc = S003_SCATTER[n] && S003_SCATTER[n][g];
    if (!sc) return;
    const cfg = {};
    sc.opts.forEach((o, k) => { cfg['o' + k] = Object.assign({}, o, { okTxt: sc.ok, failTxt: sc.fail }); });
    s003Resolve(sc.title, cfg, 'o' + i);
}

// ==========================================
// ★ 합류 (4회)
// ==========================================
const S003_REGROUP_TEXT = {
    1: `두 페이지가 다시 맞닿는다.<br><br>제본선 너머로 익숙한 목소리가 들린다.<br>틈은 좁고, 금방 닫힐 것 같다.`,
    2: `흩어진 낱장들이 바람을 타고 모인다.<br><br>같은 쪽 번호를 가진 장끼리 붙으려 한다.<br>번호를 맞추면 같은 장에 설 수 있다.`,
    3: `번진 그림이 다시 액자 안으로 줄어든다.<br><br>줄어드는 가장자리에 일행의 손이 보인다.<br>잡을 수 있을 때 잡아야 한다.`,
    4: `목차가 제자리로 돌아온다.<br><br>원래 장 번호로 돌아가는 순간이 한 번 있다.<br>그때를 놓치면 다른 장에 남는다.`
};

function renderS003Regroup(n) {
    if (!darkRun.solo) {
        darkBodyEl().innerHTML = darkBox(`합류 ${n}`,
            `일행과 같은 장에 서 있다.<br><br>흩어졌던 사람들이 하나둘 돌아오는 걸 지켜본다.`,
            loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${darkRun.step + 1})`));
        renderLoreBar(); mountDarkChat('normal');
        return;
    }

    darkBodyEl().innerHTML = darkBox(`합류 ${n}`,
        (S003_REGROUP_TEXT[n] || S003_REGROUP_TEXT[1]) +
        `<br><br><span style="color:#888; font-size:11px;">⊙ 연결이 유리합니다. 실패하면 다음 합류까지 혼자 진행합니다.</span>`,
        loreBarHtml() +
        darkChoiceBtn("① 일행의 진짜 이름을 부른다.", `s003RegroupPick(${n},'call')`) +
        darkChoiceBtn("② 같은 쪽 번호를 찾아 맞춘다.", `s003RegroupPick(${n},'page')`) +
        darkChoiceBtn("③ 기다리지 않고 앞 장으로 먼저 넘어간다.", `s003RegroupPick(${n},'ahead')`));
    renderLoreBar(); mountDarkChat('normal');
}

function s003RegroupPick(n, v) {
    if (!darkRun) return;
    const myStep = darkRun.step;

    if (v === 'call' && darkRun.taleRole === 'ariel') { breakTaboo('소리를 냄'); if (!darkRun || darkRun._dead) return; }
    if (v === 'ahead' && darkRun.taleRole === 'momo') { breakTaboo('동료를 두고 먼저 감'); if (!darkRun || darkRun._dead) return; }

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const kind = { call:'rejoin', page:'sense', ahead:'hide' }[v];
    const bonus = s003KindBonus(kind) + (qFlag('rejoin_boost') ? 4 : 0);
    const DC = s003DC({ call:9, page:10, ahead:8 }[v]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        s003SetSolo(false);
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 1;
        sendPartyChat(`${currentUser.name} 사원이 합류했습니다.`, true);
        txt = v === 'call'
            ? `이름을 부른다. 배역 이름이 아니라.<br><br>대답이 온다. 같은 장으로 발이 내려선다.<br>서로 얼굴을 한 번씩 확인했다.`
            : v === 'page'
            ? `쪽 번호를 맞췄다.<br><br>종이 두 장이 딸깍 겹친다.<br>눈앞에 일행의 등이 보인다.`
            : `먼저 넘어갔다.<br><br>다행히 그 장에 일행이 먼저 와 있었다.<br>늦게 온 쪽이 이쪽이었다.`;
    } else {
        darkRun.fail++;
        addLore(8, '합류 실패');
        sendPartyChat(`${currentUser.name} 사원이 다른 장에 남았습니다.`, true);
        txt = `엇갈렸다.<br><br>
               맞닿았던 틈이 닫힌다. 반대편에서 누가 손바닥으로 종이를 두드린다.<br>
               ${n < 4 ? '다음 합류 때까지 혼자 읽어야 한다.' : '끝까지 혼자 읽어야 한다.'}`;
    }
    darkRun.log.push(`[합류 ${n}] ${v} d20 ${roll} vs DC${DC} — ${ok ? '성공' : '실패'}`);

    darkBodyEl().innerHTML = darkBox(`합류 ${n} — 결과`, s003Dice(roll, bonus, DC, ok) + txt,
        loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${myStep + 1})`));
    renderLoreBar(); mountDarkChat('normal');
}

// ==========================================
// ★ 기존 함수 교체
// ==========================================
function renderStepS003() {
    const body = darkBodyEl();
    if (!body || !darkRun) return;
    if (darkRun._dead) return;
    if (darkRun.rejoined) { renderRejoinScene(); return; }
    if (darkRun.isParty) { watchPartyStep(); watchDyingMembers(); attachTaleCast(); }
    saveDarkRunState();

    if (darkRun.lore == null) darkRun.lore = 0;
    if (!darkRun.talePages) darkRun.talePages = [];

    // 끌려간 상태면 일행이 넘어가도 그 장에 남아 있는다
    if (darkRun.s003Lair) { renderS003Lair(); return; }

    const def = S003_STEPS[darkRun.step];
    if (!def) { renderDarkResult(); return; }

    if (def.type === 'intro') {
        body.innerHTML = darkBox("첫 장", DARK_ZONES[darkRun.zone].intro,
            loreBarHtml() + s003Brief() +
            darkChoiceBtn("책장을 넘긴다.", "partyAdvance(1)"), "intro");
        renderLoreBar();
        mountDarkChat('normal');
        return;
    }

    if (def.type === 'narr') {
        const d = S003_NARR[def.n];
        if (!d) { partyAdvance(darkRun.step + 1); return; }
        body.innerHTML = darkBox("—", d.text,
            loreBarHtml() + darkChoiceBtn("계속 읽는다.", `partyAdvance(${darkRun.step + 1})`),
            def.img);
        renderLoreBar();
        mountDarkChat('normal');
        return;
    }

    if (def.type === 'cast')    { renderTaleCast(); return; }
    if (def.type === 'tale')    { renderTaleScene(def.round); return; }
    if (def.type === 'page')    { renderTornPage(def.n); return; }
    if (def.type === 'lore')    { renderLoreCheck(darkRun.step + 1); return; }
    if (def.type === 'vote')    { renderS003Vote(def.n); return; }
    if (def.type === 'abduct')  { renderS003Abduct(def.n); return; }
    if (def.type === 'scatter') { renderS003Scatter(def.n); return; }
    if (def.type === 'sscene')  { renderS003SScene(def.n); return; }
    if (def.type === 'regroup') { renderS003Regroup(def.n); return; }
    if (def.type === 'ending')  { renderS003Ending(); return; }
    if (def.type === 'result')  { renderDarkResult(); return; }

    if (def.type === 'gimmick') {
        const fn = window['s003G' + def.n];
        if (typeof fn === 'function') fn();
        else partyAdvance(darkRun.step + 1);
        return;
    }
}

function s003Brief() {
    return `
        <div style="background:rgba(212,175,55,0.08); border:1px solid #5a4a2a; border-radius:6px; padding:13px; margin-bottom:13px; font-size:11px; color:#ccc; line-height:1.8;">
            <div style="font-size:12px; color:#d4af37; font-weight:bold; margin-bottom:8px;">📖 규칙</div>
            들어가면 <b>배역</b>이 주어집니다. 거부할 수 없습니다.<br>
            배역마다 <b style="color:#ff6b6b;">금기</b>가 있습니다. 두 번 어기면 그 이야기대로 끝납니다.<br><br>
            이해도가 <b style="color:#d4af37;">${LORE_LIMIT}</b>에 닿으면 돌아올 수 없습니다.<br>
            알아갈수록 유리하고, 알아갈수록 위험합니다.<br><br>
            책장은 <b>네 번</b> 흩어지고, 다른 동화의 인물이 <b>다섯 번</b> 누군가를 끌고 갑니다.<br>
            끌려간 동료는 찾으러 갈 수 있습니다.<br><br>
            <span style="font-size:10px; color:#888;">찢어진 장 ${S003_PAGE_TOTAL}개를 모으면 다른 결말이 열립니다.</span>
        </div>`;
}

function renderLoreBar() {
    const el = document.getElementById('lore-bar');
    if (!el || !darkRun) return;

    const v = getLore();
    const color = v >= LORE_LIMIT ? '#d4af37' : v >= 50 ? '#ffb74d' : '#7fd4d4';
    const label = v >= LORE_LIMIT ? '동화됨' : v >= 50 ? '깊이 읽음' : v > 0 ? '읽는 중' : '아직 모름';

    const role = darkRun.taleRole ? TALE_ROLES[darkRun.taleRole] : null;
    const pages = (darkRun.talePages || []).length;
    const alone = darkRun.s003Lair ? '끌려감' : darkRun.solo ? '흩어짐' : '';

    el.innerHTML = `
        ${role ? `<div style="font-size:10px; color:#d4af37; margin-bottom:6px;">
            ${role.icon} <b>${role.name}</b> · ${role.tale}
            <span style="color:#888; margin-left:6px;">금기 — ${role.taboo}</span>
            ${alone ? `<span style="color:#ff9800; margin-left:6px;">[${alone}]</span>` : ''}
        </div>` : ''}
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
            <span>이해도 — <b style="color:${color};">${label}</b></span>
            <span style="color:${color}; font-weight:bold;">${v} / ${LORE_LIMIT}</span>
        </div>
        <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(100, v / LORE_LIMIT * 100)}%; background:${color}; transition:width 0.5s;"></div>
        </div>
        <div style="font-size:9px; color:#666; margin-top:5px;">찢어진 장 ${pages} / ${S003_PAGE_TOTAL}</div>`;
}

function renderS003Vote(n) {
    if (!darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }

    const p = darkParties[darkRun.partyId];
    const alive = (p && p.alive) ? Object.keys(p.alive) : [];
    if (alive.length < 2) { partyAdvance(darkRun.step + 1); return; }

    const cast = darkRun.taleCast || {};
    const title = n === 1 ? '누구의 결말을 따를 것인가' : '누구를 남길 것인가';
    const text = n === 1
        ? `이야기는 하나뿐이다.<br><br>
           여러 동화가 섞여 있지만, 끝은 하나로만 적힌다.<br>
           누구의 이야기로 끝낼지 정해야 한다.<br><br>
           <span style="font-size:11px; color:#888;">고른 사람의 동화가 결말이 됩니다.</span>`
        : `등장인물이 하나 많다.<br><br>
           아무도 맡지 않은 이름이 계속 불린다.<br>
           누군가 그 이름을 받아야 나머지가 나갈 수 있다.<br><br>
           <span style="font-size:11px; color:#ff6b6b;">고른 사람은 마지막 판정에 크게 불리해집니다.</span>`;

    const opts = alive.map(c => {
        const nm = (p.members && p.members[c]) ? p.members[c].name : (db.users[c] ? db.users[c].name : c);
        const r = cast[c] ? TALE_ROLES[cast[c]] : null;
        return `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="s003Vote(${n},'${c}')">
                    ${r ? r.icon + ' ' : ''}${nm}${r ? ` <span style="color:#888; font-size:10px;">— ${r.tale}</span>` : ''}${c === currentUser.code ? ' <span style="color:#666; font-size:10px;">(본인)</span>' : ''}
                </button>`;
    }).join('');

    darkBodyEl().innerHTML = darkBox(title, text, loreBarHtml() + opts);
    renderLoreBar();
    mountDarkChat('normal');
}

function renderS003Ending() {
    // 결말 장에서는 흩어진 상태를 푼다
    if (darkRun.solo && !darkRun.s003Lair) s003SetSolo(false);

    const lore = getLore();
    const pages = (darkRun.talePages || []).length;
    const role = darkRun.taleRole ? TALE_ROLES[darkRun.taleRole] : null;
    const trueEnd = pages >= S003_PAGE_TOTAL;

    darkBodyEl().innerHTML = darkBox("마지막 장",
        `책이 덮이려 한다.<br><br>
         덮이기 전에 나가야 한다. 나가는 방법은 적혀 있지 않다.<br>
         적혀 있지 않은 것을 하려면, 적히지 않은 곳으로 가야 한다.<br><br>
         <div style="background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; border-radius:6px; padding:12px; font-size:11px; line-height:1.9; margin-top:8px;">
            배역 <b style="color:#d4af37;">${role ? role.name : '—'}</b><br>
            이해도 <b style="color:${lore >= 60 ? '#ff6b6b' : '#7fd4d4'};">${lore}</b> / ${LORE_LIMIT}<br>
            찢어진 장 <b style="color:${trueEnd ? '#d4af37' : '#888'};">${pages}</b> / ${S003_PAGE_TOTAL}
            ${trueEnd ? '<br><span style="color:#d4af37;">— 다른 결말이 열려 있다.</span>' : ''}
         </div>`,
        loreBarHtml() +
        darkChoiceBtn("① 적힌 대로 끝낸다.", "s003EndPick('written')") +
        darkChoiceBtn("② 빈칸으로 걸어 들어간다.", "s003EndPick('blank')") +
        (trueEnd ? darkChoiceBtn("③ 찢어진 장을 끼워 넣는다.", "s003EndPick('true')") : ''));
    renderLoreBar();
    mountDarkChat('normal');
}

function s003EndPick(pick) {
    const lore = getLore();
    const pages = (darkRun.talePages || []).length;
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    // 장 수가 두 배가 되었으므로 장당 보정은 절반 (기존과 같은 최대치)
    let bonus = rollDarkBonus('sense') - Math.floor(lore / 12) + pages;
    if (darkRun.s003Stayed) bonus -= 8;
    if (darkRun.s003Ending && darkRun.s003Ending === darkRun.taleRole) bonus += 3;

    const DC = { written: 14, blank: 18, true: 12 }[pick] + 6;
    const ok = roll !== 1 && (roll + bonus) >= DC;

    darkRun.s003Route = pick;

    if (pick === 'true' && ok) {
        darkRun.success += 5;
        darkRun.critical = true;
        darkBodyEl().innerHTML = darkBox("— 끼워 넣음",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:#d4af37; margin-bottom:12px;">🎲 ${roll}</div>
             찢어진 장을 제자리에 끼운다.<br><br>
             열 장이 맞물리자 문장이 다시 읽힌다.<br>
             원래 이야기가 아니다. 원래 이야기였던 것이다.<br><br>
             <span style="color:#d4af37;">"등장인물이 모자랍니다."</span><br>
             그 문장 아래 원래 적혀 있던 것이 드러난다.<br>
             <span style="color:#d4af37;">"— 이미 채워졌습니다. 오래전에."</span><br><br>
             책이 스스로 덮인다. 덮이면서 이쪽을 밀어낸다.<br>
             밀려나는 게 이렇게 반가운 일인 줄 몰랐다.`,
            darkChoiceBtn("나간다.", "darkRun.step=99; renderDarkStep();"));
        mountDarkChat('normal');
        return;
    }

    if (pick === 'blank') {
        if (ok) {
            darkRun.success += 3;
            darkBodyEl().innerHTML = darkBox("— 빈칸",
                `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll}</div>
                 색이 없는 쪽으로 걸었다.<br><br>
                 몇 걸음 만에 발소리가 안 난다. 소리가 적히지 않는 곳이라서다.<br>
                 계속 걷는다. 걷는다는 말도 여기서는 안 맞는다.<br><br>
                 어느 순간 종이가 끝났다.<br>
                 끝난 자리에 문이 있었다. 문이라기보다 여백이었다.`,
                darkChoiceBtn("나간다.", "darkRun.step=99; renderDarkStep();"));
            mountDarkChat('normal');
        } else {
            darkDeath(
                `색이 없는 쪽으로 걸었다.<br><br>` +
                `몇 걸음 만에 발소리가 멎고, 그다음에 발이 멎는다.<br>` +
                `적히지 않은 곳에서는 움직임도 적히지 않는다.<br><br>` +
                `서 있는 자세 그대로 멈췄다.<br>` +
                `<span style="color:#d4af37;">한참 뒤, 그 자리에 문장이 한 줄 늘었다.</span>`
            );
        }
        return;
    }

    if (ok) {
        darkRun.success += 2;
        darkBodyEl().innerHTML = darkBox("— 끝",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>
             적힌 대로 끝냈다.<br><br>
             마지막 문장이 완성되고, 그 뒤에 마침표가 찍힌다.<br>
             마침표가 찍히는 순간 주변이 접힌다.<br><br>
             접히는 쪽에 있지 않아서 다행이었다.`,
            darkChoiceBtn("나간다.", "darkRun.step=99; renderDarkStep();"));
        mountDarkChat('normal');
    } else {
        darkDeath(
            `적힌 대로 끝내려는데, 적힌 것이 바뀐다.<br><br>` +
            `읽을 때마다 다르다. 따라가려니 따라갈 수가 없다.<br><br>` +
            `마침표가 엉뚱한 자리에 찍혔다.<br>` +
            `문장 중간이었다. 이쪽이 있던 자리였다.`
        );
    }
}

function s003Bonus() {
    if (!darkRun || darkRun.zone !== 'Qtrew-S-003') return 0;
    let b = 0;

    const pages = (darkRun.talePages || []).length;
    b += pages * 450;   // 장 수 2배 → 장당 절반 (최대치 동일)

    const lore = getLore();
    if (lore < 20) b += 3000;
    else if (lore < 40) b += 1500;
    else if (lore >= 70) b -= 2000;

    if (darkRun.s003Route === 'true') b += 8000;
    else if (darkRun.s003Route === 'blank') b += 4000;
    else if (darkRun.s003Route === 'written') b += 1500;

    if (darkRun.s003Stayed) b += 5000;
    if ((darkRun.tabooCount || 0) === 0) b += 2000;

    return b;
}