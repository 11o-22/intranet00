// ==========================================
// ★ 어둠 탐사 — 1인 체험 모드
// index.html 에서 spectate.js 다음에 불러온다
// ==========================================
//
// 탐사 횟수 차감 없음 · 보상 없음 · 사망해도 재산 소멸 없음.
// 기존 파티 탐사와 데이터를 공유하지 않는다.

let pv = null;   // 체험 진행 상태

const PREVIEW_ZONES = ['Qtrew-B-330','Qtrew-B-508','Qtrew-A-214','Qtrew-A-667','Qtrew-S-010','Qtrew-S-003'];

// ==========================================
// 시나리오
// ==========================================
const PREVIEW = {

'Qtrew-B-330': {
    meter: null,
    steps: [
        { type:'narr', img:'intro', text:`안내 방송이 세 번 반복된다. 억양이 세 번 다 똑같다.<br><br>
            벽에 손을 댄다. 미지근하다. 콘크리트가 이런 온도일 리 없다.<br>
            손을 떼면 자국이 남고, 그 자국이 천천히 메워진다.` },

        { type:'pick', title:'세 갈래', kind:'hide',
          text:`통로가 셋으로 갈린다.<br><br>
            왼쪽은 밝다. 가운데는 넓고 발자국이 많다.<br>
            오른쪽은 좁고 어둡다. 바람이 나온다.<br><br>
            벽의 화살표는 셋 다 가리키고 있다.`,
          opts:[
            { l:'① 밝은 쪽으로 간다.', dc:11,
              good:`형광등이 전부 켜져 있다. 너무 밝아서 그림자가 생기지 않는다.<br><br>발밑을 본다. 그림자가 없다.<br>그래도 걷는다.`,
              bad:`밝은 쪽으로 간다.<br><br>조금 걷자 뒤쪽 등부터 하나씩 꺼진다.<br>꺼지는 속도가 걷는 속도와 같다.` },
            { l:'② 넓은 쪽으로 간다.', dc:12,
              good:`발자국이 많다. 전부 들어가는 방향이다.<br><br>나오는 쪽 발자국은 하나도 없다.<br>세어 보려다 만다. 그게 맞았다.`,
              bad:`발자국을 세고 말았다.<br><br>스물넷까지 세다가 숫자가 늘어나기 시작했다.<br>세는 것을 멈춰도 숫자는 계속 들렸다.` },
            { l:'③ 좁고 어두운 쪽으로.', dc:13,
              good:`어깨가 벽에 닿는다. 벽이 미지근하고 물렁하다.<br><br>바람이 일정한 간격으로 나왔다 멎는다.<br>빠져나오니 통로가 다시 넓어져 있다.`,
              bad:`좁은 쪽으로 들어선다.<br><br>중간에 어깨가 걸렸다. 벽이 조여든 게 아니라, 이쪽이 부푼 것 같았다.<br>겨우 빠져나왔다.` }
          ] },

        { type:'narr', text:`돌아본다.<br><br>
            방금 지나온 자리에 표식을 남겼었다. 벽에 긁어 그은 자국.<br>
            없다.<br><br>
            다시 그어 본다. 이번에는 보는 앞에서 천천히 메워진다.` },

        { type:'quiz', title:'기억', q:`벽에 세어놓은 작대기 자국은 몇 묶음이었는가?`, hint:`숫자로 입력`,
          answers:['6','6묶음','여섯','육'],
          good:`기억하고 있었다.<br><br>벽이 물러난다. 막다른 길이 아니었다는 듯이.`,
          bad:`기억나지 않는다.<br><br>분명히 봤는데 숫자가 안 떠오른다.<br>벽이 한 뼘 가까워진다.` },

        { type:'pick', title:'하나 많다', kind:'sense',
          text:`분명히 하나 많다.<br><br>
            얼굴을 본다. 전부 아는 얼굴이다. 이름도 부를 수 있다.<br>
            그런데 수가 맞지 않는다.<br><br>
            <span style="color:#888; font-size:11px;">혼자 들어왔는데도 그렇다.</span>`,
          opts:[
            { l:'① 세는 것을 그만둔다.', dc:9,
              good:`숫자를 잊기로 한다.<br><br>잠시 뒤 다시 세어 보니 하나다.<br>처음부터 하나였던 것 같기도 하다.`,
              bad:`그만두려는데 자꾸 세게 된다.<br><br>둘. 셋.<br>셋까지 세고 눈을 감았다.` },
            { l:'② 뒤를 돌아본다.', dc:15,
              good:`돌아본다. 아무도 없다.<br><br>없는 것을 확인하는 데도 용기가 든다는 걸 알았다.`,
              bad:`돌아본다.<br><br>아무도 없다. 다만 벽에 그림자가 둘이다.<br>하나는 이쪽 것이 아니다.` }
          ] },

        { type:'final', title:'잊히기', kind:'hide',
          text:`끝이 보인다.<br><br>
            다만 나가려면 이것이 당신을 잊어야 한다.<br>
            기억되는 쪽은 나갈 수 없다. 벽에 남은 자국들이 그 증거다.`,
          opts:[
            { l:'① 사원증을 바닥에 놓고 간다.', dc:12 },
            { l:'② 완전히 멈춰 선다.', dc:14 },
            { l:'③ 평범하게 걸어 나간다.', dc:16 }
          ],
          win:`벽이 흐려진다.<br><br>
            당신을 그리던 손이 멈춘 것 같다.<br>
            세부가 지워지고, 윤곽이 지워지고, 마지막으로 이름이 지워진다.<br><br>
            눈을 뜨니 복도다. 사원증에 적힌 이름을 한참 들여다봤다.`,
          lose:`벽이 선명해진다.<br><br>
            당신이 아주 또렷해졌다는 뜻이다.<br>
            이제 그것은 당신을 정확히 알고 있다.<br><br>
            다음에 그릴 때는 더 잘 그릴 것이다.` }
    ]
},

'Qtrew-B-508': {
    meter: { name:'주목도', color:'#ff9800', start:0, limit:100, up:true },
    steps: [
        { type:'narr', img:'intro', text:`밀가루 냄새에 눈을 뜬다.<br><br>
            지하 저장고다. 포대가 천장까지 쌓여 있고, 형광등 하나가 깜빡인다.<br><br>
            위층에서 반죽을 치대는 소리가 난다.<br>
            규칙적이고, 성실하고, 아주 젖어 있다.` },

        { type:'pick', title:'저장고', kind:'hide',
          text:`나가는 길은 계단뿐이다.<br><br>
            문은 잠겨 있지 않다. 다만 열면 위층에서 알아차릴 것이다.<br>
            구석에 환기구가 있다. 좁고, 기름때가 두껍다.`,
          opts:[
            { l:'① 계단으로 올라간다.', dc:10, m:6,
              good:`문을 민다. 경첩이 소리를 내지 않는다. 기름칠이 잘 되어 있다.<br><br>위층은 밝다. 다들 각자 할 일을 하고 있다.<br>너무 열심히 하고 있다.`,
              bad:`문이 삐걱인다.<br><br>반죽 치는 소리가 한 박자 멎었다가 다시 시작된다.<br>다시 시작된 박자가 아까보다 빠르다.` },
            { l:'② 환기구로 기어간다.', dc:12, m:2,
              good:`기름때가 손에 엉긴다.<br><br>격자 너머로 작업대가 보인다. 그 위에 놓인 것을 보고 멈춘다.<br>내려가는 걸 잠시 미룬다.`,
              bad:`중간에서 격자가 뜯어진다.<br><br>떨어졌다. 소리가 크게 났다.<br>일어서기 전에 발소리가 다가왔다.` }
          ] },

        { type:'narr', text:`직원 하나가 지나간다.<br><br>
            앞치마를 입었고, 인사를 한다. 목소리가 명랑하다.<br>
            얼굴이 부풀어 있다. 피부 아래에서 뭔가가 자리를 옮긴다.<br><br>
            <span style="color:#d4af37;">"오늘 재료가 아주 좋네요."</span>` },

        { type:'pick', title:'반죽실', kind:'hide',
          text:`반죽공이 등을 보이고 있다.<br><br>
            눈이 있어야 할 자리에 밀가루가 굳어 있다. 그래서 보지 못한다.<br>
            대신 귀가 얼굴의 절반을 차지한다.<br><br>
            <span style="color:#ff6b6b;">소리를 내면 안 된다.</span>`,
          opts:[
            { l:'① 신발을 벗고 기어간다.', dc:10, m:4,
              good:`바닥이 미끄럽고 미지근하다.<br><br>반죽공의 발이 바로 옆에 있다. 발톱이 바닥을 긁고 있다.<br>지나쳤다. 귀는 움직이지 않았다.`,
              bad:`손바닥이 미끄러지며 소리가 났다.<br><br>팔이 공중에 멈춘다. 얼굴만 이쪽으로 돌아간다.<br>귀가 벌어진다. 안쪽이 붉다.` },
            { l:'② 박자에 맞춰 걷는다.', dc:12, m:3,
              good:`쿵. 쿵. 쿵.<br><br>치는 순간에 맞춰 한 걸음씩. 소리가 소리에 묻힌다.<br>세 걸음 만에 지나쳤다.`,
              bad:`박자를 놓쳤다.<br><br>정적에 발소리가 얹혔다.<br>반죽 치는 소리가 멎는다.` },
            { l:'③ 단숨에 뛰어 지나간다.', dc:16, m:14,
              good:`달린다.<br><br>지나쳤다. 운이 좋았다.<br>등 뒤에서 반죽 치는 소리가 한 박자 멎었다가 다시 시작된다.`,
              bad:`달린다. 절반쯤에서 미끄러졌다.<br><br>일어서는 동안 얼굴이 이쪽을 향했다.<br>쿵. 쿵. 발소리가 시작된다. 반죽 치던 박자 그대로.` }
          ] },

        { type:'pick', title:'계산대', kind:'hide',
          text:`계산원이 서 있다.<br><br>
            얼굴에 눈이 많다. 세어 보려다 만다. 세면 알아차릴 것 같아서.<br>
            전부 감겨 있는데, 하나씩 순서대로 뜬다.<br><br>
            <span style="color:#ff6b6b;">눈을 마주치면 안 된다.</span>`,
          opts:[
            { l:'① 바닥만 보고 지나간다.', dc:9, m:4,
              good:`계산대 아래에 신발이 여럿 놓여 있다. 짝이 맞는 것이 하나도 없다.<br><br>세지 않고 지나간다.`,
              bad:`바닥을 보고 걷는데, 바닥에 비친 것과 눈이 마주쳤다.<br><br>유리처럼 닦인 바닥이었다.` },
            { l:'② 유리에 비친 것만 보고 간다.', dc:11, m:5,
              good:`진열장에 비친 상만 보고 걷는다.<br><br>비친 계산원은 움직이지 않는다.<br>실제로도 움직이지 않았기를 바란다.`,
              bad:`비친 상이 한 박자 늦게 움직인다.<br><br>실제 쪽이 먼저 고개를 돌렸다는 뜻이다.` }
          ] },

        { type:'final', title:'출고', kind:'hide',
          text:`셔터가 절반쯤 내려왔다.<br><br>
            출고대 앞이다. 검수 담당이 서류를 받아 넘긴다.<br>
            숫자가 맞으면 상품, 아니면 폐기.<br><br>
            <span style="font-size:11px; color:#888;">체험이라 서류는 없다. 몸으로 때워야 한다.</span>`,
          opts:[
            { l:'① 빈손으로 내민다.', dc:14 },
            { l:'② 포장대의 봉지에 들어간다.', dc:12 },
            { l:'③ 셔터 아래로 굴러 나간다.', dc:15 }
          ],
          win:`봉지 안은 따뜻하다.<br><br>
            흔들린다. 누군가 들고 걷는다. 유리문 열리는 소리, 종소리, 바깥 공기.<br><br>
            한참 뒤에 봉지가 열린다. 빛이 들어온다.<br>
            눈을 뜨니 복도다. 손에 밀가루가 묻어 있다. 털어도 계속 나온다.`,
          lose:`검수 담당이 고개를 젓는다. 미안해하는 표정이다. 진심으로.<br><br>
            <span style="color:#d4af37;">"폐기 처리하겠습니다. 다음에는 더 신선하게 오세요."</span>` }
    ]
},

'Qtrew-A-214': {
    meter: null,
    steps: [
        { type:'narr', img:'intro', text:`복도가 길다.<br><br>
            양쪽 벽에 문이 늘어서 있고, 전부 조금씩 열려 있다.<br>
            안쪽에서 빛이 샌다. 전부 같은 색이다.<br><br>
            여럿이 같은 문장을 동시에 말하는 소리가 난다.<br>
            박자가 정확해서 노래 같기도 하다.` },

        { type:'pick', title:'첫 인사', kind:'sense',
          text:`계단 아래에서 한 사람이 올라온다.<br><br>
            흰 옷을 입었고, 맨발이다. 발소리가 나지 않는다.<br>
            얼굴은 평범하다. 그게 제일 이상하다.<br><br>
            <span style="color:#d4af37;">"오셨군요. 기다렸습니다."</span>`,
          opts:[
            { l:'① 무시하고 지나간다.', dc:10,
              good:`지나친다. 손은 그대로 내밀어져 있다.<br><br>등 뒤에서 그 자세로 한참 서 있는 기척이 난다.<br>돌아보지 않는다.`,
              bad:`지나치려는데 옷자락이 걸렸다.<br><br>잡은 게 아니라 스친 것이다. 그렇게 믿기로 한다.` },
            { l:'② 누구를 기다렸냐고 묻는다.', dc:12,
              good:`웃는 얼굴 그대로 대답한다.<br><span style="color:#d4af37;">"오시는 분을요."</span><br><br>질문이 잘못됐다는 걸 알았다.`,
              bad:`묻는 순간 상대가 한 걸음 다가온다.<br><br>대답 대신 이름을 부른다.<br>당신 이름이다.` },
            { l:'③ 같이 인사한다.', dc:9,
              good:`상대가 더 깊이 고개를 숙인다. 그리고 옆으로 비켜선다.<br><br>길을 내준 것이다.`,
              bad:`같이 고개를 숙인다.<br><br>고개를 든 순간 복도가 달라져 있었다.<br>문이 두 개 늘었다.` }
          ] },

        { type:'pick', title:'집회', kind:'hide',
          text:`집회장을 지나야 한다.<br><br>
            수십 명이 등을 보이고 앉아 있다. 같은 문장을 반복한다.<br>
            문장이 끝나고 다시 시작되는 사이에 아주 짧은 정적이 있다.`,
          opts:[
            { l:'① 정적에 맞춰 한 걸음씩.', dc:12,
              good:`세 번째 걸음에서 박자를 놓칠 뻔했다.<br><br>앞사람이 어깨를 잡아 줬다.<br>앞에 사람이 없었는데.`,
              bad:`박자가 끊긴다.<br><br>읊던 소리가 멎고, 앞줄부터 차례로 고개가 돌아간다. 파도처럼.` },
            { l:'② 같이 읊으며 걷는다.', dc:10,
              good:`입에 잘 붙는다. 처음 듣는 문장인데 그렇다.<br><br>지나가는 동안 아무도 돌아보지 않았다.<br>나오고 나서 입을 다무는 데 시간이 걸렸다.`,
              bad:`따라 읊다가 한 단어를 틀렸다.<br><br>전부 그 단어에서 멈춘다.<br>정정해 주기를 기다리는 자세로.` },
            { l:'③ 의자 사이로 기어간다.', dc:14,
              good:`발들이 보인다. 전부 맨발이다. 전부 같은 방향으로 놓여 있다.<br>발톱까지 가지런하다.<br><br>지나쳤다.`,
              bad:`의자 다리를 건드렸다.<br><br>의자가 아니었다. 무릎이었다.` }
          ] },

        { type:'narr', text:`창고다.<br><br>
            상자가 쌓여 있고, 안에 든 것이 전부 같다.<br>
            흰 천, 양초, 그리고 이름이 적힌 명패.<br><br>
            명패를 몇 개 꺼내 본다. 전부 이 회사 사람들 이름이다.<br>
            아직 새겨지지 않은 빈 명패가 하나 남아 있다.` },

        { type:'pick', title:'명패', kind:'sense',
          text:`조각칼이 놓여 있다. 손에 익은 자리가 반들반들하다.<br><br>
            누가 새기려던 것인지, 아니면 새기게 하려던 것인지 모르겠다.`,
          opts:[
            { l:'① 전부 부순다.', dc:11,
              good:`생각보다 잘 부서진다.<br><br>조각마다 글자가 새겨져 있다.<br>부수기 전에는 비어 있었는데.`,
              bad:`부수려는데 손이 멎는다.<br><br>이름이 하나 떠올랐다. 부수면 안 될 것 같은 이름이었다.` },
            { l:'② 그대로 둔다.', dc:9,
              good:`건드리지 않는 게 나을 것 같았다.<br><br>나가면서 한 번 더 본다. 빈 명패가 그대로 있다.`,
              bad:`그대로 둔다.<br><br>나가면서 한 번 더 본다.<br>빈 명패가 없어졌다.` }
          ] },

        { type:'final', title:'제단', kind:'sense',
          text:`제단 앞이다.<br><br>
            빛이 가운데 있다. 형태가 잡히지 않는다.<br>
            오래 보면 무릎이 저절로 굽는다.<br><br>
            봉인을 걸려면 시선을 유지해야 한다. 시선을 떼면 위치가 바뀐다.`,
          opts:[
            { l:'① 똑바로 본다.', dc:16 },
            { l:'② 곁눈으로만 본다.', dc:13 },
            { l:'③ 금속에 비친 것으로 본다.', dc:11 }
          ],
          win:`빛이 접힌다. 종이처럼, 아주 얇아질 때까지.<br><br>
            마지막에 소리가 한 번 났다. 사람 목소리였다.<br>
            복도의 발소리가 멎는다. 전부 동시에.<br><br>
            계단을 올라간다. 세어 보니 내려올 때보다 짧다.`,
          lose:`본다.<br><br>
            정리가 된다. 형태가 잡힌다.<br>
            보고 나니 왜 다들 무릎을 꿇었는지 알겠다.<br><br>
            무릎을 꿇는다. 누가 시킨 게 아니다.` }
    ]
},

'Qtrew-A-667': {
    meter: { name:'인간성', color:'#4fc3f7', start:70, limit:0, up:false },
    steps: [
        { type:'narr', img:'intro', text:`물이다.<br><br>
            눈을 뜨니 이미 잠겨 있다. 숨은 쉬어진다. 그게 첫 번째로 이상한 점이다.<br>
            두 번째는 옷이 젖지 않았다는 것이다.<br><br>
            아래에서 불빛이 하나 켜진다. 그리고 둘. 셋.<br>
            줄지어 켜진다. 길처럼.` },

        { type:'pick', title:'무리', kind:'hide',
          text:`은색 무리가 앞을 막는다.<br><br>
            전부 고개를 돌려 이쪽을 보고 있다. 몸은 그대로인 채로.<br>
            물고기는 고개를 돌리지 않는다.`,
          opts:[
            { l:'① 천천히 헤치고 간다.', dc:10, m:-2,
              good:`무리가 갈라진다. 닿지 않게 비켜 준다.<br><br>배려받았다는 느낌이 든다. 물고기한테.`,
              bad:`손등이 스쳤다.<br><br>비늘이 아니라 피부 같다. 미지근하다.` },
            { l:'② 멈춰서 지나가길 기다린다.', dc:9, m:0,
              good:`오래 걸린다. 그동안 전부 이쪽을 본다.<br><br>다 지나가고 나서도 한참 움직일 수가 없었다.`,
              bad:`기다리는 동안 무리가 늘어난다.<br><br>지나가는 것이 아니라 모이는 중이었다.` },
            { l:'③ 마주 본다.', dc:13, m:-6,
              good:`눈동자에 초점이 있다. 물고기 눈에는 초점이 없어야 하는데.<br><br>먼저 시선을 피한 건 이쪽이었다.`,
              bad:`마주 본다.<br><br>수십 개의 눈이 동시에 같은 각도로 기운다.<br>흉내 내는 것이다. 이쪽을.` }
          ] },

        { type:'check', title:'확인', q:`당신은 무엇입니까?`, answers:['사람','인간','나','사원'],
          good:`적는다.<br><br>손이 기억하고 있었다. 머리보다 먼저.<br>아직은 괜찮다.`,
          bad:`적으려는데 잘 안 나온다.<br><br>분명히 알던 것인데 지금은 헷갈린다.<br>물속에서는 원래 그렇다고, 스스로에게 설명해 본다.<br><br>설명이 잘 됐다. 그게 더 문제다.`,
          mGood:+4, mBad:-16 },

        { type:'pick', title:'첫 말', kind:'sense',
          text:`목소리가 묻는다.<br><br>
            <span style="color:#4fc3f7;">"많이 내려오셨네요. 힘드시죠?"</span><br><br>
            친절하다. 정말로 걱정하는 목소리다.<br>
            대답하면 뭔가 시작될 것 같고, 안 하면 실례인 것 같다.`,
          opts:[
            { l:'① 대답하지 않는다.', dc:8, m:+2,
              good:`목소리가 잠깐 멎었다가 다시 말한다.<br><span style="color:#4fc3f7;">"괜찮습니다. 아직 익숙하지 않으실 테니까요."</span><br><br>기다려 준다. 서두르지 않는다.`,
              bad:`대답하지 않는다.<br><br>그런데 입이 저절로 움직였다.<br>무슨 말을 했는지 모르겠다.` },
            { l:'② "네"라고 답한다.', dc:10, m:-12,
              good:`말이 입 밖으로 나오는데 물이 들어오지 않는다.<br><br>그 사실을 깨닫고 나서 목이 서늘해졌다.`,
              bad:`"네."<br><br><span style="color:#4fc3f7;">"그러실 겁니다. 조금만 더 가시면 편해져요."</span><br><br>편해진다는 말이 오래 남는다.` },
            { l:'③ 누구냐고 되묻는다.', dc:12, m:-8,
              good:`<span style="color:#4fc3f7;">"저도 처음엔 여쭤봤어요."</span><br><br>대답이 아니다. 그런데 대답처럼 들린다.`,
              bad:`되묻는다.<br><br>그것이 이름을 말한다. 아는 이름이다.<br>어디서 들었는지는 기억나지 않는다.` }
          ] },

        { type:'pick', title:'등불', kind:'hide',
          text:`등불을 든 것들 사이를 지나야 한다.<br><br>
            전부 아래를 비추고 있다. 일하는 중이다.<br>
            하나가 등불을 내민다. 들어 보라는 뜻이다.`,
          opts:[
            { l:'① 받지 않는다.', dc:10, m:+3,
              good:`고개를 젓는다. 그것이 등불을 거둔다.<br><br>실망한 기색은 없다. 다만 다음에 또 권할 자세다.`,
              bad:`거절했는데 손이 먼저 나갔다.<br><br>닿기 직전에 거두었다. 거둔 건 이쪽이었다.` },
            { l:'② 받아서 든다.', dc:14, m:-18,
              good:`가볍다. 손에 들자 자연스럽게 아래를 비추게 된다.<br><br>정신을 차리고 내려놓는다.<br>옆에 있던 것이 고개를 끄덕인다. 잘했다는 뜻 같다.`,
              bad:`받아서 든다.<br><br>팔이 알아서 움직인다. 아래를 비춘다.<br>한참 그러고 있었다.` }
          ] },

        { type:'final', title:'위로', kind:'sense',
          text:`올라가야 한다.<br><br>
            수면은 보이지 않는다. 방향만 안다.<br>
            올라가려면 이유가 필요하다고 했다.`,
          opts:[
            { l:'① 자기 이름을 부르며 올라간다.', dc:11 },
            { l:'② 숨을 참고 올라간다.', dc:13 },
            { l:'③ 아래를 보지 않고 올라간다.', dc:12 }
          ],
          win:`수면을 뚫고 나온다.<br><br>
            공기가 낯설다. 목이 아프다. 한참 기침했다.<br>
            손등을 본다. 손등이다. 확인하고 나서야 안심이 됐다.<br><br>
            눈을 뜨니 현관 앞이다.<br>
            며칠 동안 물을 마실 때마다 잠깐씩 멈추게 됐다.`,
          lose:`올라간다.<br><br>
            한참 올라갔는데 아직이다. 더 올라간다.<br>
            이상하다 싶어 위를 본다.<br><br>
            불빛이 있다. 줄지어 켜진 것들이.<br>
            방향을 잃은 게 아니었다. 아래가 두 개였다.` }
    ]
},

'Qtrew-S-010': {
    meter: { name:'감염도', color:'#ff6b6b', start:0, limit:60, up:true },
    steps: [
        { type:'narr', img:'intro', text:`사이렌이 멎은 직후다.<br><br>
            복도에 비닐이 겹겹이 쳐져 있다. 전부 찢겨 있다. 안쪽에서 찢은 것이다.<br><br>
            바닥에 명찰이 흩어져 있다. 밟지 않으려다 결국 밟는다.<br>
            소리가 났다. 어디선가 그 소리에 반응하는 기척이 있다.` },

        { type:'pick', title:'비닐 통로', kind:'hide',
          text:`겹겹이 쳐진 비닐을 지나야 한다.<br><br>
            젖히면 소리가 난다. 얇은 비닐이 서로 스치는 소리.<br>
            안쪽에서 무언가 그 소리를 기다리고 있다.`,
          opts:[
            { l:'① 한 겹씩 천천히 젖힌다.', dc:11, m:0,
              good:`손목만 써서 젖힌다.<br><br>세 겹을 지나는 데 한참 걸렸다.<br>그동안 아무것도 오지 않았다.`,
              bad:`세 번째 겹에서 손이 미끄러졌다.<br><br>비닐이 크게 흔들린다.<br>안쪽에서 뭔가 일어서는 소리가 난다.`, mBad:6 },
            { l:'② 아래쪽을 잘라 기어간다.', dc:9, m:0,
              good:`바닥이 끈적하다. 무릎에 묻는 걸 신경 쓰지 않기로 한다.<br><br>소리는 나지 않았다.`,
              bad:`기어가다 손을 짚었다.<br><br>짚은 게 바닥이 아니었다. 미지근했다.`, mBad:8 }
          ] },

        { type:'pick', title:'첫 무리', kind:'hide',
          text:`복도 중간이 막혔다.<br><br>
            넷쯤 된다. 아직 이쪽을 못 봤다.<br>
            벽을 따라가면 돌아갈 수 있는데, 그러려면 등을 보여야 한다.`,
          opts:[
            { l:'① 벽을 따라 돌아간다.', dc:12, m:0,
              good:`어깨가 벽을 긁는다. 소리가 날까 봐 옷을 말아 쥔다.<br><br>등 뒤로 지나간다. 돌아보지 않았다.`,
              bad:`벽에 붙어 돌다가 팔이 닿았다.<br><br>손톱이 팔을 긁었다. 피는 안 났는데 자국이 남았다.`, mBad:10 },
            { l:'② 반대쪽에 소리를 낸다.', dc:10, m:0,
              good:`깨진 유리 조각을 던진다.<br><br>전부 그쪽으로 고개를 돌린다. 몸까지 돌리는 데 시간이 걸린다.<br>그 사이에 지나간다.`,
              bad:`던진 것이 엉뚱한 데 맞았다.<br><br>소리가 이쪽으로 튕겨 왔다.<br>전부 이쪽을 본다.`, mBad:14 },
            { l:'③ 틈으로 달려 지나간다.', dc:15, m:0,
              good:`손이 옷깃을 스쳤다. 잡히지는 않았다.<br><br>반 발자국 차이였다.`,
              bad:`잡혔다.<br><br>어깨, 팔, 목덜미. 이로 무는 감각은 생각보다 둔했다.<br>겨우 빠져나왔다. 팔뚝이 뜨겁다.`, mBad:20 }
          ] },

        { type:'check', title:'자가 검진', q:`배가 고픕니까?`, answers:['아니오','아니요','아뇨','없다','안고프다','no','아님'],
          good:`적는다.<br><br>손이 떨리지 않았다. 그걸 확인하려고 한 검사였다.`,
          bad:`적으려다 멈춘다.<br><br>알던 것인데 답이 안 나온다.<br>결국 아무거나 적었다.`,
          mGood:-3, mBad:12 },

        { type:'pick', title:'물린 자리', kind:'sense',
          text:`팔뚝에 자국이 있다.<br><br>
            깊지는 않다. 다만 가장자리가 검게 죽어 가고 있다.<br>
            지금 처치하면 진행이 늦어진다. 아마도.`,
          opts:[
            { l:'① 소독하고 붕대를 감는다.', dc:9, m:0,
              good:`소독약을 붓는다. 숨을 참는다.<br><br>감는 손이 떨려서 두 번 다시 감았다.`, mGood:-6,
              bad:`손이 미끄러졌다.<br><br>상처가 더 벌어졌다. 붕대가 금방 젖는다.`, mBad:7 },
            { l:'② 불로 지진다.', dc:13, m:0,
              good:`라이터를 댄다.<br><br>소리를 내지 않으려고 옷자락을 물었다.<br>냄새가 한참 남았다.`, mGood:-12,
              bad:`손이 떨려 엉뚱한 데를 지졌다.<br><br>검은 자국은 그대로다.`, mBad:5 },
            { l:'③ 그냥 둔다.', dc:99, m:0,
              good:``, bad:`그냥 둔다.<br><br>지금은 아프지 않다. 그게 더 나쁜 신호라는 걸 안다.<br>소매를 내려 덮는다.`, mBad:14 }
          ] },

        { type:'final', title:'밖으로', kind:'sense',
          text:`셔터 너머가 아침이다.<br><br>
            밖에는 사람이 있다. 출근하는 사람들, 지나가는 사람들.<br>
            지금 나가면 무엇이 같이 나가는지 아무도 모른다.`,
          opts:[
            { l:'① 밖에 알리고 검역을 요청한다.', dc:12 },
            { l:'② 그냥 나간다.', dc:10 },
            { l:'③ 셔터를 다시 내린다.', dc:15 }
          ],
          win:`차단선이 쳐지는 데 20분 걸렸다.<br><br>
            그 20분 동안 아무도 우리를 건드리지 않았다.<br><br>
            셔터가 등 뒤에서 내려온다.<br>
            밖은 아침이다. 손등을 확인한다. 팔을 걷어 본다. 두 번 확인한다.`,
          lose:`나간다.<br><br>
            몇 걸음 못 가서 무릎이 꺾였다.<br>
            누가 부축하려고 다가온다. 밀어냈다.<br><br>
            밀어낸 손에 힘이 너무 많이 들어갔다.<br>
            그 사람이 놀란 얼굴로 손목을 감싼다.`,
          meterLose:`열이 내린다.<br><br>
            아까까지 아프던 자리가 아무렇지 않다.<br>
            숨이 편하다. 오래 참고 있었다는 걸 이제야 안다.<br><br>
            주변이 아주 또렷하다. 동료들의 위치를 눈을 감고도 알 수 있다.<br>
            배가 고프다. 그게 지금 유일하게 확실한 감각이다.` }
    ]
},

'Qtrew-S-003': {
    meter: { name:'이해도', color:'#d4af37', start:0, limit:60, up:true },
    steps: [
        { type:'narr', img:'intro', text:`책이 펼쳐져 있다.<br><br>
            아무도 펼치지 않았는데 펼쳐져 있다.<br>
            종이가 두껍고, 가장자리가 축축하다.<br><br>
            첫 장에 적혀 있다.<br>
            <span style="color:#d4af37;">"등장인물이 모자랍니다."</span><br>
            <span style="color:#ff6b6b;">"채워 주십시오."</span>` },

        { type:'cast' },

        { type:'pick', title:'첫 장', kind:'sense',
          text:`첫 장이 넘어가지 않는다.<br><br>
            종이가 두껍고 축축하다. 글자가 번져 있는데, 번진 방향이 이상하다.<br>
            바깥쪽이 아니라 안쪽으로 번졌다.`,
          opts:[
            { l:'① 끝까지 읽는다.', dc:11, m:8,
              good:`문장이 끝나는 곳에서 종이가 스스로 넘어간다.<br><br>무슨 내용이었는지는 벌써 흐릿하다.<br>다만 손끝이 기억한다.`,
              bad:`세 번째 줄에서 내 이름이 나왔다. 틀린 철자로.<br><br>고쳐 읽으려는 순간 글자가 한 칸씩 밀려난다.` },
            { l:'② 그림만 본다.', dc:9, m:4,
              good:`그림 속 인물들이 전부 같은 쪽을 가리키고 있다.<br><br>그쪽으로 종이가 넘어간다.`,
              bad:`그림을 오래 봤다.<br><br>그림 속 인물 하나가 손가락을 거둔다.<br>대신 이쪽을 가리킨다.` },
            { l:'③ 눈을 감고 넘긴다.', dc:12, m:2,
              good:`종이가 손가락을 한 번 붙잡았다가 놓아준다.<br><br>눈을 떴을 땐 이미 다음 장이다.`,
              bad:`눈을 감은 동안 누군가 읽어 주었다.<br><br>귀에 대고, 아주 작게.<br>알아버렸다.` }
          ] },

        { type:'pick', title:'길', kind:'hide',
          text:`길이 접힌다.<br><br>
            뒤쪽부터 종이처럼 접혀 올라온다. 접힌 자리는 다시 펴지지 않는다.<br>
            앞쪽은 노란 벽돌. 군데군데 빠져 있다.`,
          opts:[
            { l:'① 전력으로 달린다.', dc:11, m:3,
              good:`뒤에서 길이 접혀 올라온다. 발뒤꿈치 바로 뒤까지.<br><br>마지막 벽돌에서 뛰었다.<br>착지했을 땐 다음 문단이었다.`,
              bad:`벽돌 하나가 빠진다.<br><br>그 아래에도 같은 길이 있다.<br>한 층 내려간 셈이다.` },
            { l:'② 벽돌만 골라 밟는다.', dc:10, m:2,
              good:`빠진 자리를 피해서. 천천히.<br><br>길이 접히는 속도보다 아주 조금 빨랐다.`,
              bad:`색이 바랜 벽돌을 밟았다.<br><br>노란색이 아니었다. 원래 노란색이었던 것이었다.<br>발목까지 빠졌다.` }
          ] },

        { type:'pick', title:'질문', kind:'sense',
          text:`책이 멈춘다.<br><br>
            글자가 줄지어 있다가, 한 줄만 남기고 흩어진다.<br><br>
            <span style="color:#d4af37;">"이 이야기의 결말을 아십니까."</span><br><br>
            <span style="font-size:11px; color:#888;">답하지 않아도 됩니다. 답하면 더 알게 됩니다.</span>`,
          opts:[
            { l:'① 모른다고 적는다.', dc:8, m:3,
              good:`글자가 잠시 머물다 사라진다.<br><br>만족한 것 같지는 않다. 다만 더 묻지 않는다.`,
              bad:`모른다고 적었는데, 손이 한 글자 더 적었다.<br><br>지우려는데 지워지지 않는다.` },
            { l:'② 입을 다문다.', dc:10, m:0,
              good:`글자가 오래 머문다. 기다리는 것 같다.<br><br>끝내 답하지 않자 한 줄이 덧붙는다.<br><span style="color:#888;">"그럼 나중에 묻겠습니다."</span>`,
              bad:`입을 다물었는데 목이 움직였다.<br><br>소리는 나지 않았다. 그런데 책은 읽은 것 같다.` },
            { l:'③ 아는 대로 적는다.', dc:13, m:16,
              good:`적었다.<br><br>적고 나서 그게 어디서 나온 답인지 생각한다.<br>생각나지 않는다. 그런데 맞는 것 같다.`,
              bad:`적는다.<br><br>맞았다. 맞아서 문제다.<br><span style="color:#d4af37;">"정답입니다. 그럼 약속대로."</span>` }
          ] },

        { type:'final', title:'마지막 장', kind:'sense',
          text:`결말 바로 앞 장이다.<br><br>
            빈 줄이 하나 있고, 그 옆에 문장 세 개가 연필로 흐리게 적혀 있다.<br>
            그중 하나가 원래 이 자리에 있던 문장이다.`,
          opts:[
            { l:'① "그리고 모두 돌아왔다."', dc:12 },
            { l:'② "그리고 아무도 기억하지 않았다."', dc:12 },
            { l:'③ "그리고 이야기는 계속되었다."', dc:12 }
          ],
          win:`문장이 종이에 스며든다. 거부당하지 않았다.<br><br>
            책이 조금 가벼워진다. 그리고 스스로 덮인다.<br>
            덮이면서 이쪽을 밀어낸다.<br><br>
            눈을 뜨니 도서관 앞이다. 비가 오고 있다.<br>
            한동안 동화책을 읽어 주지 못했다.`,
          lose:`문장이 튕겨 나온다. 이 책의 문장이 아니라는 듯이.<br><br>
            대신 다른 문장이 그 자리에 적힌다.<br>
            읽어 보니 이쪽 이름이 들어 있었다.`,
          meterLose:`이제 알겠다.<br><br>
            왜 늑대가 말을 하는지, 왜 콩나무가 하늘까지 자라는지.<br>
            전부 말이 된다. 처음부터 말이 됐다.<br><br>
            이상하다고 느꼈던 게 이상했던 것이다.<br><br>
            <span style="color:#d4af37;">책장이 넘어간다. 이제 이쪽이 그림이다.</span>` }
    ]
}

};

// ==========================================
// 진행
// ==========================================
function startPreview(zoneCode) {
    if (darkRun) { showCustomAlert('탐사 중에는 이용할 수 없습니다.'); return; }
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 이용할 수 없습니다.'); return; }
    const sc = PREVIEW[zoneCode];
    if (!sc) return;

    pv = {
        zone: zoneCode, idx: 0, ok: 0, no: 0,
        meter: sc.meter ? sc.meter.start : 0,
        role: null, over: false
    };

    // darkBox 등이 참조하는 최소 상태만 세운다 (저장·점유·횟수 없음)
    darkRun = {
        zone: zoneCode, step: 0, modifier: 0, success: 0, fail: 0,
        carryEquips: [], carryItems: [], lostItems: [], log: [],
        isParty: false, preview: true, counted: false
    };

    darkAmbienceStart(zoneCode);
    openDarkOverlay();
    const code = document.getElementById('dro-code');
    if (code) code.innerText = zoneCode + ' · 체험';
    pvRender();
}

function pvBar() {
    const sc = PREVIEW[pv.zone];
    if (!sc.meter) return '';
    const m = sc.meter;
    const pct = m.up
        ? Math.min(100, pv.meter / m.limit * 100)
        : Math.max(0, pv.meter);
    return `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
                <span>${m.name}</span>
                <span style="color:${m.color}; font-weight:bold;">${pv.meter}${m.up ? ' / ' + m.limit : ' / 100'}</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${pct}%; background:${m.color}; transition:width 0.5s;"></div>
            </div>
        </div>`;
}

function pvMeter(delta) {
    const sc = PREVIEW[pv.zone];
    if (!sc.meter || !delta) return;
    const m = sc.meter;
    pv.meter = m.up
        ? Math.max(0, Math.min(999, pv.meter + delta))
        : Math.max(0, Math.min(100, pv.meter + delta));
}

function pvMeterBroke() {
    const sc = PREVIEW[pv.zone];
    if (!sc.meter) return false;
    return sc.meter.up ? pv.meter >= sc.meter.limit : pv.meter <= sc.meter.limit;
}

function pvRender() {
    if (!pv) return;
    const sc = PREVIEW[pv.zone];
    const st = sc.steps[pv.idx];
    if (!st) { pvEnd(true, '끝났다.'); return; }

    if (st.type === 'narr') {
        darkBodyEl().innerHTML = darkBox('—', st.text,
            pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'), st.img);
        return;
    }

    if (st.type === 'cast') { pvCast(); return; }

    if (st.type === 'pick' || st.type === 'final') {
        const opts = st.opts.map((o, i) =>
            darkChoiceBtn(o.l, `pvPick(${i})`)).join('');
        darkBodyEl().innerHTML = darkBox(st.title, st.text, pvBar() + opts);
        return;
    }

    if (st.type === 'quiz' || st.type === 'check') {
        darkBodyEl().innerHTML = darkBox(st.title,
            (st.type === 'quiz'
                ? `걸음이 멎는다.<br><br>벽에 글자가 떠오른다. 손으로 쓴 것처럼 한 획씩.<br><br><span style="color:#d4af37; font-size:13px;">${st.q}</span>`
                : `잠깐 멈춘다.<br><br>잊기 전에 확인해 두기로 한다.<br><br><span style="color:#4fc3f7; font-size:13px;">${st.q}</span>`),
            pvBar() +
            `<input type="text" id="pv-input" maxlength="24" placeholder="${st.hint || ''}" style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') pvAnswer()">
             <button class="game-btn" style="width:100%; margin:0; padding:12px;" onclick="pvAnswer()">적는다</button>`);
        setTimeout(() => { const f = document.getElementById('pv-input'); if (f) f.focus(); }, 200);
        return;
    }
}

function pvNext() {
    if (!pv) return;
    pv.idx++;
    pvRender();
}

function pvCast() {
    const keys = (typeof TALE_KEYS !== 'undefined') ? TALE_KEYS : null;
    if (!keys) { pvNext(); return; }
    const pick = keys[Math.floor(Math.random() * keys.length)];
    pv.role = pick;
    const r = TALE_ROLES[pick];

    darkBodyEl().innerHTML = darkBox('배역',
        `이름이 불린다.<br><br>
         부르는 쪽이 누구인지는 보이지 않는다.<br>
         다만 부르는 순간 몸이 먼저 대답한다.<br><br>
         <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:6px; padding:14px; margin-top:10px; text-align:center;">
            <div style="font-size:30px; margin-bottom:8px;">${r.icon}</div>
            <div style="font-size:16px; color:#d4af37; font-weight:bold;">${r.name}</div>
            <div style="font-size:11px; color:#888; margin-top:4px;">${r.tale}</div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #5a4a2a; font-size:11px; color:#ff6b6b;">
                금기 — <b>${r.taboo}</b><br>
                <span style="font-size:10px; color:#aaa;">${r.warn}</span>
            </div>
         </div>`,
        pvBar() + darkChoiceBtn('대답한다.', 'pvNext()'));
}

function pvPick(i) {
    if (!pv || pv.over) return;
    const sc = PREVIEW[pv.zone];
    const st = sc.steps[pv.idx];
    const o = st.opts[i];

    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = rollDarkBonus(o.kind || st.kind || 'sense');
    const ok = roll !== 1 && (roll + bonus) >= o.dc;

    if (ok) { pv.ok++; darkRun.success++; }
    else { pv.no++; darkRun.fail++; }

    pvMeter(ok ? (o.mGood != null ? o.mGood : (o.m || 0)) : (o.mBad != null ? o.mBad : (o.m || 0)));

    if (st.type === 'final') {
        const broke = pvMeterBroke();
        const txt = broke && st.meterLose ? st.meterLose : (ok ? st.win : st.lose);
        pvEnd(ok && !broke, txt, roll, bonus, o.dc);
        return;
    }

    if (pvMeterBroke() && st.meterLose) { pvEnd(false, st.meterLose, roll, bonus, o.dc); return; }

    darkBodyEl().innerHTML = darkBox(st.title + ' — 결과',
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${o.dc})</span></div>` +
        (ok ? o.good : o.bad),
        pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
}

function pvAnswer() {
    const el = document.getElementById('pv-input');
    if (!el || !pv) return;
    const v = el.value.trim();
    if (!v) { showCustomAlert('적어 주세요.'); return; }

    const st = PREVIEW[pv.zone].steps[pv.idx];
    const ok = st.answers ? checkQuizAnswer(v, st.answers) : true;

    if (ok) { pv.ok++; pvMeter(st.mGood || 0); }
    else { pv.no++; pvMeter(st.mBad || 0); }

    if (pvMeterBroke()) {
        const fin = PREVIEW[pv.zone].steps.find(s => s.type === 'final');
        if (fin && fin.meterLose) { pvEnd(false, fin.meterLose); return; }
    }

    darkBodyEl().innerHTML = darkBox(st.title, ok ? st.good : st.bad,
        pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
}

function pvEnd(win, text, roll, bonus, dc) {
    if (!pv) return;
    pv.over = true;
    const z = DARK_ZONES[pv.zone] || {};

    const dice = (roll != null)
        ? `<div style="text-align:center; font-size:26px; font-weight:bold; color:${win ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>`
        : '';

    darkBodyEl().innerHTML = darkBox(win ? '귀환' : '종료', dice + text,
        `<div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:6px; padding:13px; font-size:12px; line-height:1.9; margin-bottom:14px;">
            <div style="font-weight:bold; color:var(--theme-focus); margin-bottom:7px; border-bottom:1px dashed #444; padding-bottom:5px;">[체험 기록]</div>
            판정 성공 <b style="color:#4CAF50;">${pv.ok}</b> / 실패 <b style="color:#f44336;">${pv.no}</b><br>
            ${PREVIEW[pv.zone].meter ? `${PREVIEW[pv.zone].meter.name} <b style="color:${PREVIEW[pv.zone].meter.color};">${pv.meter}</b><br>` : ''}
            <span style="font-size:10px; color:#888;">체험 모드입니다. 보상·오염도·소지품 변화가 없습니다.</span>
         </div>` +
        darkChoiceBtn('단말로 복귀한다.', 'finishPreview()'));
}

function finishPreview() {
    closeDarkOverlay();
    darkAmbienceStop();
    pv = null;
    darkRun = null;
    updateUI();
    renderDarkness();
}

// ==========================================
// 입구
// ==========================================
function renderPreviewList() {
    const box = document.getElementById('preview-list');
    if (!box || !currentUser) return;

    box.innerHTML = PREVIEW_ZONES.map(k => {
        const z = DARK_ZONES[k];
        if (!z) return '';
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid #3a3a3a; border-radius:5px; padding:9px 11px; margin-bottom:6px; gap:9px;">
                <div style="flex:1; min-width:0;">
                    <span style="font-family:monospace; font-size:10px; color:#888;">${z.code}</span>
                    <div style="font-size:12px; color:var(--theme-text); font-weight:bold; margin-top:2px;">${z.name}</div>
                </div>
                <button class="game-btn" style="margin:0; padding:7px 12px; font-size:10px; flex-shrink:0;" onclick="startPreview('${k}')">체험</button>
            </div>`;
    }).join('');
}

(function hookPreview() {
    const _renderDarkness = renderDarkness;
    renderDarkness = function () {
        const r = _renderDarkness.apply(this, arguments);
        const body = document.getElementById('darkness-body');
        if (body && !darkRun && !document.getElementById('preview-list')) {
            body.insertAdjacentHTML('beforeend', `
                <div style="margin-top:16px; border-top:1px dashed #333; padding-top:12px; text-align:left;">
                    <div style="font-size:11px; color:#aaa; font-weight:bold; margin-bottom:5px;">◇ 혼자 체험</div>
                    <div style="font-size:10px; color:#666; margin-bottom:9px; line-height:1.6;">
                        짧게 줄인 1인 진행입니다. 탐사 횟수가 줄지 않고, 보상도 없습니다.<br>
                        죽어도 포인트와 소지품을 잃지 않습니다.
                    </div>
                    <div id="preview-list"></div>
                </div>`);
            renderPreviewList();
        }
        return r;
    };
})();