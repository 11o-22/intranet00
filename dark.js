const DARK_ZONES = {
        "Qtrew-S-010": {
    code:"Qtrew-S-010", grade:"S", name:"검역 실패",
    brief:"(전원 귀환한 기록이 없습니다.)",
    warn:"트라우마 유발 가능성 주의 — 감염, 동료 간 살해",
    danger:"최상", survival:"0.1%", min:5, max:8, reward:[10000,15000], ready:false,
    voteMode:true, infection:true, timeLimit:40,
    intro:`사이렌이 멎은 직후다.<br><br>
        복도에 비닐이 겹겹이 쳐져 있다. 검역 구역을 나누던 것이다.<br>
        전부 찢겨 있다. 안쪽에서 찢은 것이다.<br><br>
        바닥에 명찰이 흩어져 있다. 밟지 않으려다 결국 밟는다.<br>
        소리가 났다. 어디선가 그 소리에 반응하는 기척이 있다.<br><br>
        벽에 붙은 안내가 아직 읽힌다.<br>
        <span style="color:#7fd4d4;">"물린 인원은 즉시 신고하십시오. 숨기면 전원이 위험합니다."</span><br><br>
        그 아래에 손으로 쓴 글씨가 있다.<br>
        <span style="color:#ff6b6b;">"신고해도 똑같았다"</span>`,
    outro:`셔터가 등 뒤에서 내려온다.<br><br>
        밖은 아침이다. 아무 일도 없었던 것처럼 밝다.<br>
        손등을 확인한다. 팔을 걷어 본다. 두 번 확인한다.<br><br>
        눈을 뜨니 현관 앞이다.<br>
        한동안 사람이 많은 곳에서 숨을 참는 버릇이 생겼다.`,
    images: { intro:"quar_1.jpg", step1:"quar_2.jpg", step2:"quar_3.jpg", step3:"quar_4.jpg", step4:"quar_5.jpg" }
},
                "Qtrew-A-667": {
            code:"Qtrew-A-667", grade:"A", name:"물고기가 인간이 되었다",
            brief:"(물고기가 인간이 되었다.)",
            danger:"최상", survival:"0.5%", min:3, max:4, reward:[1000,1500], ready:true,
            voteMode:false, deepSea:true,
            intro:"물이다.<br><br>눈을 뜨니 이미 잠겨 있다. 숨은 쉬어진다. 그게 첫 번째로 이상한 점이다.<br>두 번째는 옷이 젖지 않았다는 것이다.<br><br>발밑이 보이지 않는다. 아래가 어디까지인지 가늠이 안 된다.<br>위를 본다. 수면이 있다. 아주 멀다.<br>손을 뻗으면 닿을 것 같은데, 그건 거리를 잴 기준이 없어서다.<br><br>옆에서 무언가 지나간다.<br>크기를 모르겠다. 가까이 있는 작은 것인지, 멀리 있는 큰 것인지.<br><br>아래에서 불빛이 하나 켜진다. 그리고 둘. 셋.<br>줄지어 켜진다. 길처럼.",
            outro:"수면을 뚫고 나온다.<br><br>공기가 낯설다. 목이 아프다. 한참 기침했다.<br>손등을 본다. 손등이다. 확인하고 나서야 안심이 됐다.<br><br>눈을 뜨니 현관 앞이다.<br>며칠 동안 물을 마실 때마다 잠깐씩 멈추게 됐다.<br>삼키는 감각이 어색해서.",
            images: {
                intro: "deep_1.jpg",
                step1: "deep_2.jpg",
                step2: "deep_3.jpg",
                step3: "deep_4.jpg"
            }
        },
              "Qtrew-A-214": {
            code:"Qtrew-A-214", grade:"A", name:"빛을 찾아서",
            brief:"(여기 사람들은 전부 같은 것을 보고 있습니다.)",
            danger:"상", survival:"3%", min:4, max:6, reward:[1000,1500], ready:true,
            voteMode:true, timeLimit:25, hasTraitor:true,
            intro:"복도가 길다.<br><br>양쪽 벽에 문이 늘어서 있고, 전부 조금씩 열려 있다.<br>안쪽에서 빛이 샌다. 전부 같은 색이다.<br><br>사람 소리가 난다. 여럿이 같은 문장을 동시에 말하는 소리.<br>박자가 정확해서 노래 같기도 하다.<br><br>복도 끝에 계단이 있다. 아래로 내려간다.<br>빛은 그쪽에서 온다.<br><br><span style=\"color:#d4af37;\">\"빛을 찾으셨습니까.\"</span><br><br>누가 말했는지 모르겠다.<br>일행 중 하나가 대답할 뻔했다가 입을 다물었다.",
            outro:"계단을 올라온다.<br><br>복도의 문들이 전부 닫혀 있다. 빛도 소리도 없다.<br>원래 비어 있던 건물처럼 보인다.<br><br>눈을 뜨니 현관 앞이다.<br>귓속에서 아직 그 박자가 울린다.<br>며칠은 갈 것 같다.",
            images: {
                intro: "cult_1.jpg",
                step1: "cult_2.jpg",
                step2: "cult_3.jpg",
                step3: "cult_4.jpg"
            }
        },               "Qtrew-B-330": {
            code:"Qtrew-B-330", grade:"B", name:"미로를 빠져나가자",
            brief:"(함정 조심!)",
            danger:"중상", survival:"12%", min:2, max:4, reward:[900,1600], ready:true,
            voteMode:true, soloFrom:3, soloTo:6,
            intro:"안내 방송이 나오고 있다.<br><br><span style=\"color:#d4af37;\">\"미로 탈출 게임에 참가해 주셔서 감사합니다. 제한 시간은 없습니다. 함정을 조심하세요. 즐거운 시간 되시기 바랍니다.\"</span><br><br>목소리가 명랑하다. 같은 문장을 세 번 반복하는데, 세 번 다 억양이 똑같다.<br><br>벽에 안내판이 붙어 있다. 글씨가 흐릿하다.<br>누군가 미로를 대충 알고 있는 사람이 그린 것 같다.",
            outro:"이름이 기억나지 않는다.<br><br>그게 다행이라는 것만 안다.<br>벽이 멀어지고, 안내 방송이 잦아들고, 화살표가 전부 같은 방향을 가리킨다.<br>처음으로 일치했다.<br><br>눈을 뜨니 복도다. 사원증에 적힌 이름을 한참 들여다봤다.",
            images: { intro:"maze_1.jpg", step1:"maze_2.jpg", step2:"maze_3.jpg", step3:"maze_4.jpg" }
        },
               "Qtrew-B-508": {
            code:"Qtrew-B-508", grade:"B", name:"%$#@빵가게",
            brief:"(안녕하세요, %$#@빵가게 입니다!)",
            danger:"중상", survival:"9%", min:3, max:5, reward:[900,1600], ready:true,
            voteMode:true, hunt:true,
            intro:"밀가루 냄새에 눈을 뜬다.<br><br>지하 저장고다. 포대가 천장까지 쌓여 있고, 형광등 하나가 깜빡인다.<br>어떻게 들어왔는지 기억나지 않는다.<br><br>위층에서 소리가 난다. 반죽을 치대는 소리다.<br>규칙적이고, 성실하고, 아주 젖어 있다.<br><br>스피커에서 안내가 나온다.<br><span style=\"color:#d4af37;\">\"안녕하세요, %$#@빵가게입니다. 오늘도 신선한 재료로 정성껏 준비하겠습니다.\"</span><br><br>벽에 붙은 안내문이 눈에 들어온다.<br><span style=\"color:#d4af37;\">\"출고 서류가 갖춰지지 않은 상품은 폐기됩니다.\"</span>",
            outro:"봉지 안은 따뜻하다.<br><br>흔들린다. 누군가 들고 걷는다. 유리문 열리는 소리, 종소리, 바깥 공기.<br><br>한참 뒤에 봉지가 열린다.<br>빛이 들어온다. 눈을 감는다.<br><br>눈을 뜨니 복도다. 손에 밀가루가 묻어 있다. 털어도 계속 나온다.",
             images: {
                intro: "bakery_1.jpg",
                step1: "bakery_2.jpg",
                step2: "bakery_3.jpg",
                step3: "bakery_4.jpg"
             }
        },
         "Qtrew-C-119": {
            code:"Qtrew-C-119", grade:"C", name:"거울은 세 마디만 허락한다",
            brief:"(거울이 늘어진 방. 한 사람은 안에, 한 사람은 밖에.)",
            danger:"중", survival:"40%", min:2, max:2, reward:[250,500], ready:true,
            voteMode:false, roleSplit:true,
            intro:"복도 끝에서 문이 닫혔다.<br><br>정신을 차려 보니 방이다. 천장에서 거울이 늘어져 있다. 액자에 걸린 것이 아니라, 줄에 매달려 천천히 돌고 있다.<br>수십 개가 각기 다른 속도로 돈다. 비치는 것도 각기 다르다.<br><br>둘이 함께 들어왔는데, 지금 서로가 보이지 않는다.",
            outro:"마지막 거울이 멈춘다.<br><br>거기 비친 것은 둘 다였다. 나란히 서 있었다.<br>실제로는 한 번도 마주치지 못했는데.<br><br>눈을 뜨니 복도다. 문은 열려 있다.",
            images: {
                intro: "mirror_1.jpg",
                step1: "mirror_2.jpg",
                step2: "mirror_3.jpg",
                step3: "mirror_4.jpg"
            }
        },
                 "Qtrew-C-176": {
            code:"Qtrew-C-176", grade:"C", name:"돌아오지 않는 발소리",
            brief:"(복도 끝에서 무언가 긁는 소리가 난다.)",
            warn:"트라우마 유발 가능성 주의 — 반려동물 상실",
            danger:"중", survival:"38%", min:1, max:2, reward:[250,500], ready:true,
            voteMode:false, noDeath:true,
            intro:"복도다.<br><br>천장 등이 하나 걸러 하나씩 꺼져 있다. 밝은 자리와 어두운 자리가 번갈아 놓인다.<br>바닥에 뭔가 흩어져 있는데, 어두운 쪽이라 형태가 잡히지 않는다.<br><br>복도 끝에서 소리가 난다.<br>긁는 소리다. 규칙적이지 않고, 지치지도 않는다.<br><br>가까이 가고 싶지 않다.<br>그런데 발이 그쪽으로 향한다.",
            outro:"복도가 밝다.<br><br>흩어져 있던 것들이 이제 보인다. 전부 장난감이었다.<br>긁는 소리는 멎었다. 문이 열렸으니까.<br><br>눈을 뜨니 현관 앞이다.<br>손등에 무언가 스친 자국이 있다. 따뜻하다.<br><br>한참을 그대로 서 있었다.",
            images: {
                intro: "pet_1.jpg",
                step1: "pet_2.jpg",
                step2: "pet_3.jpg",
                step3: "pet_4.jpg"
            }
        },
       
        "Qtrew-D-042": {
            code:"Qtrew-D-042", grade:"D", name:"가로등은 뒤에서부터 꺼진다",
            brief:"(밤 1시 17분. 집으로 가는 길이 조금 길어졌다.)",
            danger:"하", survival:"94%", min:1, max:1, reward:[200,400], ready:true,
            intro:"휴대폰 시계가 1시 17분에서 넘어가지 않는다.<br>몇 번을 껐다 켜도 같다.<br><br>언제나 지나던 골목인데, 오늘은 끝이 보이지 않는다.<br>가로등이 하나, 등 뒤에서부터 꺼진다.",
            outro:"익숙한 현관 앞이다.<br>시계는 1시 18분을 가리키고 있다.<br><br>골목 쪽은 돌아보지 않기로 한다.",
            images: {
                intro: "dark_alley_1.jpg",
                step1: "dark_alley_2.jpg",
                step2: "dark_alley_3.jpg",
                step3: "dark_alley_4.jpg"
            }
        },

        "Qtrew-D-087": {
            code:"Qtrew-D-087", grade:"D", name:"관람객은 손대지 마시오",
            brief:"(눈을 뜨니 폐관한 미술관 안이었다.)",
            danger:"하", survival:"91%", min:1, max:1, reward:[200,400], ready:true,
            intro:"눈을 뜬다.<br><br>등이 배긴다. 벤치다. 전시실 한가운데 놓인, 관람객이 앉아 그림을 올려다보라고 만들어진 나무 벤치.<br>언제 잠들었는지 기억나지 않는다. 미술관에 온 기억도 없다.<br><br>천장 조명은 반쯤 꺼져 있고, 남은 불빛이 벽면의 액자들을 아래에서 위로 훑는다.<br>셔터는 내려와 있다. 안내 방송은 나오지 않는다.<br><br>그림들은 아주 얌전히, 제자리에 걸려 있다.",
            outro:"발밑이 사라진다.<br><br>떨어지는 동안 위를 본다. 네모난 빛이 빠르게 멀어지고,<br>그 가장자리로 액자들이 줄지어 내려다보고 있다.<br>전부 제자리다. 하나도 움직이지 않았다.<br><br>눈을 뜨니 현관 앞이다. 손바닥에 캔버스 결이 남아 있다.",
            images: {
                intro: "museum_1.jpg",
                step1: "museum_2.jpg",
                step2: "museum_3.jpg",
                step3: "museum_4.jpg"

            
            }
        }
    };
       
          const DARK_LOOT_BY_ZONE = {

            "Qtrew-S-010": [
    { name:"물린 자국이 없는 팔", chance:0.030 },
    { name:"덜 마른 붕대", chance:0.020 },
    { name:"이름이 지워진 명찰 다발", chance:0.012 },
    { name:"멎지 않는 심박계", chance:0.006 },
    { name:"열리지 않는 검역 도장", chance:0.002 },
    { name:"각성 돌파권", chance:0.00001 }
],

      "Qtrew-A-214": [
            { name:"지워진 이름표", chance:0.030 },
            { name:"맨발의 자국", chance:0.015 },
            { name:"같은 문장", chance:0.008 },
            { name:"접힌 무릎", chance:0.004 }
        ],
        
     "Qtrew-A-667": [
            { name:"삼키지 못한 공기", chance:0.030 },
            { name:"젖지 않은 사원증", chance:0.015 },
            { name:"여섯 번째 손가락", chance:0.008 },
            { name:"위에서 떨어진 것", chance:0.004 }
        ],

        "Qtrew-C-119": [
            { name:"금이 간 손거울", chance:0.003 },
            { name:"세 번째 단어", chance:0.002 },
            { name:"먼저 웃은 쪽", chance:0.001 },
            { name:"맞물리지 않는 조각", chance:0.05 }
        ],

                "Qtrew-C-176": [
            { name:"꿰맨 자국", chance:0.003 },
            { name:"걸려 있던 자리", chance:0.002 },
            { name:"따라온 발소리", chance:0.001 }
        ],

        "Qtrew-B-330": [
            { name:"접힌 안내도", chance:0.003 },
            { name:"누군가의 왼쪽 신발", chance:0.002 },
            { name:"세어지지 않는 숫자", chance:0.001 },
            { name:"지워지지 않는 자국", chance:0.05 }
        ],
        "Qtrew-B-508": [
            { name:"읽을 수 없는 라벨", chance:0.003 },
            { name:"덜 구워진 것", chance:0.002 },
            { name:"영업시간 안내판", chance:0.001 },
            { name:"반죽에 섞이지 않은 것", chance:0.05 }
        ],
        "Qtrew-D-042": [
            { name:"꺼진 가로등 전구", chance:0.003 },
            { name:"1시 17분 버스표", chance:0.002 },
            { name:"반 박자 늦은 그림자", chance:0.001 }
        ],
        "Qtrew-D-087": [
            { name:"서명 없는 캔버스 조각", chance:0.003 },
            { name:"전시 안내 도록", chance:0.002 },
            { name:"액자 뒤에 있던 것", chance:0.001 }
        ]
    };
    // 탐사 진행 상태 (새로고침 시 소멸 → 중단 처리)
    let darkRun = null;
    let darkBriefingOpen = false;   // 브리핑 화면 표시 중 여부
    let darkZoneOverride = {};
    let darkOccupancy = {};
     const DARK_OCCUPY_TIMEOUT = 3 * 60 * 60 * 1000; // 3시간 후 자동 해제
    
     if (database) {
        database.ref('darkOccupancy').on('value', (snap) => {
            darkOccupancy = snap.val() || {};
            if (currentUser && !darkRun && !darkBriefingOpen) {
                const panel = document.getElementById('dark-main');
                if (panel && panel.classList.contains('active')) renderDarkness();
            }
        });
    }

    if (database) {
        database.ref('darkZoneOverride').on('value', (snap) => {
            darkZoneOverride = snap.val() || {};
            if (currentUser && !darkRun) {
                const panel = document.getElementById('dark-main');
                if (panel && panel.classList.contains('active')) renderDarkness();
            }
        });
    }

// ★ 어둠 탐사 앰비언스 (Web Audio 합성)
    // ==========================================
    let darkAudio = { ctx:null, master:null, nodes:[], timers:[], playing:false, muted:false };

    function darkAmbienceStop() {
        darkAudio.timers.forEach(t => clearTimeout(t));
        darkAudio.timers = [];
        if (darkAudio.master && darkAudio.ctx) {
            try {
                const now = darkAudio.ctx.currentTime;
                darkAudio.master.gain.cancelScheduledValues(now);
                darkAudio.master.gain.setValueAtTime(darkAudio.master.gain.value, now);
                darkAudio.master.gain.linearRampToValueAtTime(0, now + 1.2);
            } catch(e) {}
        }
        const oldNodes = darkAudio.nodes;
        darkAudio.nodes = [];
        setTimeout(() => {
            oldNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch(e) {} });
        }, 1400);
        darkAudio.playing = false;
    }

    // 갈색 잡음 버퍼 (바람·공기 질감)
    function makeNoiseBuffer(ctx, seconds) {
        const len = ctx.sampleRate * seconds;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            last = (last + 0.02 * white) / 1.02;
            d[i] = last * 3.5;
        }
        return buf;
    }

    function darkAmbienceStart(zoneCode) {
        darkAmbienceStop();
        if (darkAudio.muted) return;

        try {
            if (!darkAudio.ctx) darkAudio.ctx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = darkAudio.ctx;
            if (ctx.state === 'suspended') ctx.resume();

            const master = ctx.createGain();
            master.gain.setValueAtTime(0, ctx.currentTime);
            master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
            master.connect(ctx.destination);
            darkAudio.master = master;
            darkAudio.playing = true;

            if (zoneCode === 'Qtrew-D-087') buildMuseumAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-A-214') buildCultAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-A-667') buildDeepAmbience(ctx, master);   
            else if (zoneCode === 'Qtrew-C-119') buildMirrorAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-C-176') buildPetAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-B-330') buildMazeAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-B-508') buildBakeryAmbience(ctx, master);
            else buildAlleyAmbience(ctx, master);
            

        } catch(e) { console.warn('앰비언스 생성 실패:', e); }
    }

    // --- D-042 : 심야 골목 ---
    function buildAlleyAmbience(ctx, master) {
        // 1) 저역 드론 두 겹 (아주 느리게 어긋나며 맥놀이 발생)
        [41, 41.7].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = 0.10;
            osc.connect(g); g.connect(master);
            osc.start();
            darkAudio.nodes.push(osc);

            const lfo = ctx.createOscillator();
            const lfoG = ctx.createGain();
            lfo.frequency.value = 0.05 + i * 0.017;
            lfoG.gain.value = 0.045;
            lfo.connect(lfoG); lfoG.connect(g.gain);
            lfo.start();
            darkAudio.nodes.push(lfo);
        });

        // 2) 바람 (필터 걸린 갈색 잡음)
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 6);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.16;
        noise.connect(lp); lp.connect(nGain); nGain.connect(master);
        noise.start();
        darkAudio.nodes.push(noise);

        // 바람 세기 흔들기
        const windLfo = ctx.createOscillator();
        const windG = ctx.createGain();
        windLfo.frequency.value = 0.07;
        windG.gain.value = 0.09;
        windLfo.connect(windG); windG.connect(nGain.gain);
        windLfo.start();
        darkAudio.nodes.push(windLfo);

        // 3) 불규칙한 발소리 (아주 가끔, 한 박자 늦게)
        function step() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const src = ctx.createBufferSource();
            src.buffer = makeNoiseBuffer(ctx, 0.2);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 160 + Math.random() * 90; bp.Q.value = 3;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.09 + Math.random() * 0.05, t + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
            src.connect(bp); bp.connect(g); g.connect(master);
            src.start(t); src.stop(t + 0.3);
            darkAudio.timers.push(setTimeout(step, 3500 + Math.random() * 7000));
        }
        darkAudio.timers.push(setTimeout(step, 4000 + Math.random() * 4000));

        // 4) 먼 곳의 금속성 울림 (드물게)
        function distant() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180 + Math.random() * 120, t);
            osc.frequency.exponentialRampToValueAtTime(70, t + 2.4);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.055, t + 0.5);
            g.gain.exponentialRampToValueAtTime(0.0008, t + 2.6);
            osc.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + 2.8);
            darkAudio.timers.push(setTimeout(distant, 14000 + Math.random() * 20000));
        }
        darkAudio.timers.push(setTimeout(distant, 9000 + Math.random() * 8000));
    }

    // --- D-087 : 폐관한 미술관 ---
    function buildMuseumAmbience(ctx, master) {
        // 1) 거의 무음에 가까운 실내 공명
        [58, 87].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = i === 0 ? 0.075 : 0.035;
            osc.connect(g); g.connect(master);
            osc.start();
            darkAudio.nodes.push(osc);

            const lfo = ctx.createOscillator();
            const lfoG = ctx.createGain();
            lfo.frequency.value = 0.03 + i * 0.011;
            lfoG.gain.value = 0.03;
            lfo.connect(lfoG); lfoG.connect(g.gain);
            lfo.start();
            darkAudio.nodes.push(lfo);
        });

        // 2) 공조기 백색소음 (아주 얇게)
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 6);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 260;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.085;
        noise.connect(lp); lp.connect(nGain); nGain.connect(master);
        noise.start();
        darkAudio.nodes.push(noise);

        // 3) 형광등 잔떨림 (고음역, 미세하게)
        const hum = ctx.createOscillator();
        const humG = ctx.createGain();
        hum.type = 'sawtooth';
        hum.frequency.value = 120;
        humG.gain.value = 0.008;
        const humLp = ctx.createBiquadFilter();
        humLp.type = 'lowpass'; humLp.frequency.value = 1800;
        hum.connect(humLp); humLp.connect(humG); humG.connect(master);
        hum.start();
        darkAudio.nodes.push(hum);

        // 4) 나무·액자 삐걱임 (불규칙)
        function creak() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            const base = 280 + Math.random() * 350;
            osc.frequency.setValueAtTime(base, t);
            osc.frequency.linearRampToValueAtTime(base * (0.72 + Math.random() * 0.2), t + 0.6);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = base; bp.Q.value = 9;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, t + 0.18);
            g.gain.exponentialRampToValueAtTime(0.0006, t + 0.75);
            osc.connect(bp); bp.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + 0.9);
            darkAudio.timers.push(setTimeout(creak, 6000 + Math.random() * 13000));
        }
        darkAudio.timers.push(setTimeout(creak, 5000 + Math.random() * 6000));

        // 5) 대리석 위 물방울 같은 단발음 (아주 드물게)
        function drip() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900 + Math.random() * 500, t);
            osc.frequency.exponentialRampToValueAtTime(320, t + 0.13);
            g.gain.setValueAtTime(0.05, t);
            g.gain.exponentialRampToValueAtTime(0.0004, t + 0.5);
            osc.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + 0.6);
            darkAudio.timers.push(setTimeout(drip, 11000 + Math.random() * 22000));
        }
        darkAudio.timers.push(setTimeout(drip, 8000 + Math.random() * 10000));
    }

        // --- C-119 : 거울이 늘어진 방 ---
    function buildMirrorAmbience(ctx, master) {
        // 1) 유리질 고음 드론 — 아주 느리게 서로 어긋남
        [196, 197.3, 294].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = i === 2 ? 0.022 : 0.038;
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.value = 150;
            osc.connect(hp); hp.connect(g); g.connect(master);
            osc.start();
            darkAudio.nodes.push(osc);

            const lfo = ctx.createOscillator();
            const lfoG = ctx.createGain();
            lfo.frequency.value = 0.041 + i * 0.013;
            lfoG.gain.value = 0.028;
            lfo.connect(lfoG); lfoG.connect(g.gain);
            lfo.start();
            darkAudio.nodes.push(lfo);
        });

        // 2) 저역 — 방 자체의 울림
        const low = ctx.createOscillator();
        const lowG = ctx.createGain();
        low.type = 'sine';
        low.frequency.value = 49;
        lowG.gain.value = 0.085;
        low.connect(lowG); lowG.connect(master);
        low.start();
        darkAudio.nodes.push(low);

        // 3) 줄이 삐걱이며 도는 소리 (느리게 반복)
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 8);
        noise.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 5;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.05;
        noise.connect(bp); bp.connect(nGain); nGain.connect(master);
        noise.start();
        darkAudio.nodes.push(noise);

        // 회전 주기에 맞춰 소리가 커졌다 작아짐
        const rotLfo = ctx.createOscillator();
        const rotG = ctx.createGain();
        rotLfo.frequency.value = 0.13;
        rotG.gain.value = 0.04;
        rotLfo.connect(rotG); rotG.connect(nGain.gain);
        rotLfo.start();
        darkAudio.nodes.push(rotLfo);

        // 밴드패스 주파수도 함께 흔들어 '스치는' 질감
        const bpLfo = ctx.createOscillator();
        const bpG = ctx.createGain();
        bpLfo.frequency.value = 0.09;
        bpG.gain.value = 180;
        bpLfo.connect(bpG); bpG.connect(bp.frequency);
        bpLfo.start();
        darkAudio.nodes.push(bpLfo);

    }

            // --- B-330 : 미로 ---
    function buildMazeAmbience(ctx, master) {
        // 1) 형광등 잔떨림 (60Hz 험, 미로 전체에 깔림)
        const hum = ctx.createOscillator();
        const humG = ctx.createGain();
        hum.type = 'sawtooth';
        hum.frequency.value = 60;
        humG.gain.value = 0.045;
        const humLp = ctx.createBiquadFilter();
        humLp.type = 'lowpass'; humLp.frequency.value = 900;
        hum.connect(humLp); humLp.connect(humG); humG.connect(master);
        hum.start();
        darkAudio.nodes.push(hum);

        // 형광등이 불안정하게 깜빡이는 느낌 — 험이 미세하게 끊김
        const flick = ctx.createOscillator();
        const flickG = ctx.createGain();
        flick.type = 'square';
        flick.frequency.value = 0.23;
        flickG.gain.value = 0.018;
        flick.connect(flickG); flickG.connect(humG.gain);
        flick.start();
        darkAudio.nodes.push(flick);

        // 2) 공조기 백색소음 (건물 내부의 기본 소리)
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 7);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 340;
        const nGain = ctx.createGain();
        nGain.gain.value = 0.13;
        noise.connect(lp); lp.connect(nGain); nGain.connect(master);
        noise.start();
        darkAudio.nodes.push(noise);

        // 3) 통로가 좁아졌다 넓어지는 주기 — 저역이 느리게 부풀었다 꺼짐
        const breathe = ctx.createOscillator();
        const breatheG = ctx.createGain();
        breathe.type = 'sine';
        breathe.frequency.value = 44;
        breatheG.gain.value = 0.075;
        breathe.connect(breatheG); breatheG.connect(master);
        breathe.start();
        darkAudio.nodes.push(breathe);

        const bLfo = ctx.createOscillator();
        const bLfoG = ctx.createGain();
        bLfo.frequency.value = 0.085;
        bLfoG.gain.value = 0.055;
        bLfo.connect(bLfoG); bLfoG.connect(breatheG.gain);
        bLfo.start();
        darkAudio.nodes.push(bLfo);

        // 4) 뒤따르는 발소리 — 일정한 간격, 가끔 하나 더
        function steps() {
            if (!darkAudio.playing) return;
            const extra = Math.random() < 0.3;       // 30% 확률로 하나 더
            const count = extra ? 3 : 2;
            for (let k = 0; k < count; k++) {
                const t = ctx.currentTime + k * 0.42 + (k === 2 ? 0.14 : 0);  // 셋째는 반 박자 어긋남
                const src = ctx.createBufferSource();
                src.buffer = makeNoiseBuffer(ctx, 0.18);
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass'; bp.frequency.value = 140 + Math.random() * 70; bp.Q.value = 3.5;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.07 + Math.random() * 0.03, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0006, t + 0.2);
                src.connect(bp); bp.connect(g); g.connect(master);
                src.start(t); src.stop(t + 0.28);
            }
            darkAudio.timers.push(setTimeout(steps, 5000 + Math.random() * 9000));
        }
        darkAudio.timers.push(setTimeout(steps, 3500 + Math.random() * 4000));

        // 5) 안내 방송 — 말은 아니고, 말의 리듬만 남은 것
        function announce() {
            if (!darkAudio.playing) return;
            const t0 = ctx.currentTime;
            const syllables = 5 + Math.floor(Math.random() * 4);
            for (let k = 0; k < syllables; k++) {
                const t = t0 + k * 0.17;
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(150 + Math.random() * 90, t);
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass'; bp.frequency.value = 700 + Math.random() * 400; bp.Q.value = 6;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.016, t + 0.03);
                g.gain.exponentialRampToValueAtTime(0.0004, t + 0.15);
                osc.connect(bp); bp.connect(g); g.connect(master);
                osc.start(t); osc.stop(t + 0.18);
            }
            darkAudio.timers.push(setTimeout(announce, 19000 + Math.random() * 26000));
        }
        darkAudio.timers.push(setTimeout(announce, 11000 + Math.random() * 10000));

        // 6) 벽이 다시 그려지는 소리 — 아주 드물게, 연필이 긁히는 듯한
        function redraw() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const src = ctx.createBufferSource();
            src.buffer = makeNoiseBuffer(ctx, 1.2);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 2.5;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.024, t + 0.25);
            g.gain.linearRampToValueAtTime(0.018, t + 0.7);
            g.gain.exponentialRampToValueAtTime(0.0004, t + 1.15);
            src.connect(bp); bp.connect(g); g.connect(master);
            src.start(t); src.stop(t + 1.2);
            darkAudio.timers.push(setTimeout(redraw, 24000 + Math.random() * 34000));
        }
        darkAudio.timers.push(setTimeout(redraw, 16000 + Math.random() * 14000));
    }

    function toggleDarkMute() {
        darkAudio.muted = !darkAudio.muted;
        if (darkAudio.muted) darkAmbienceStop();
        else if (darkRun) darkAmbienceStart(darkRun.zone);
        const btn = document.getElementById('dark-mute-btn');
        if (btn) btn.innerText = darkAudio.muted ? '🔇' : '🔊';
    }
        // ==========================================
    // ★ Qtrew-D-087 「관람객은 손대지 마시오」
    // ==========================================
    const ART_PIECES = [
        { t:"《해질녘의 방파제》",   a:"작자 미상",       real:`손끝에 거친 캔버스 결이 걸린다. 물감이 두껍게 뭉친 자리가 딱딱하다.` },
        { t:"《누워 있는 여자》",     a:"J. 뫼르",         real:`서늘하다. 오래 걸려 있던 천 특유의 먼지 냄새가 손에 묻는다.` },
        { t:"《식탁 위의 사과 일곱》", a:"작자 미상",      real:`유화 표면이 매끄럽다. 손톱으로 긁으면 아주 얕게 소리가 난다.` },
        { t:"《겨울 사냥》",         a:"P. 랑",           real:`캔버스가 팽팽하다. 누르면 북처럼 가볍게 울린다.` },
        { t:"《무제 (붉은 계단)》",   a:"작자 미상",       real:`아크릴이다. 매끈하고 차갑다. 아무 일도 일어나지 않는다.` },
        { t:"《어머니의 초상》",      a:"H. 베인",         real:`액자 모서리에 먼지가 두껍다. 몇 년은 손대지 않은 자리다.` },
        { t:"《폐관 직전의 전시실》", a:"작자 미상",       real:`그림 속에도 벤치가 하나 있다. 만져보면 그냥 물감이다.` },
        { t:"《창문 없는 방》",      a:"작자 미상",       real:`덧칠이 많다. 울퉁불퉁한 것이 손바닥에 그대로 읽힌다.` }
    ];

    const FAKE_CLUES = [
        `손을 대는 순간 미지근하다.<br>겨울 실내에 걸린 캔버스가 사람 체온일 리 없다.`,
        `표면 아래에서 무언가 한 번, 아주 느리게 뛴다.<br>맥이다. 손을 떼도 감각이 남는다.`,
        `눌린 자리가 천천히 원래대로 돌아온다.<br>캔버스는 이러지 않는다.`,
        `축축하다. 물감이 아니라, 안쪽에서 배어 나온 것이다.`
    ];

    function shuffled087(n) {
        let idx = [...Array(ART_PIECES.length).keys()];
        for (let i = idx.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        return idx.slice(0, n);
    }

        // ==========================================
    // ★ Qtrew-C-119 「거울은 세 마디만 허락한다」
    // ==========================================
    const C119_WORDS = [
        ['왼쪽', '오른쪽', '아니야'],
        ['위', '아래', '멈춰'],
        ['하나', '둘', '다시'],
        ['가', '서', '뒤']
    ];
    const SIGNAL_LIMIT = 5;

    let c119Ref = null, c119Key = null, c119State = null;

    function c119Path() { return `darkC119/${darkRun.partyId}`; }

        function attachC119Listener() {
        if (!database || !darkRun || !darkRun.partyId) return;
        if (c119Key === darkRun.partyId) return;
        detachC119Listener();
        c119Key = darkRun.partyId;
        c119Ref = database.ref(c119Path());

        c119Ref.on('value', (snap) => {
            c119State = snap.val();
            if (!c119State || !darkRun) return;

            if (c119State.step != null && c119State.step !== darkRun.step) {
                darkRun.step = c119State.step;
                darkRun._c119Locked = false;
                renderStep119();
                renderReactFlash();
                return;
            }
            if (!darkRun._c119Locked) renderStep119();
            renderReactFlash();
        });
    }

    function detachC119Listener() {
        if (c119Ref) { try { c119Ref.off(); } catch(e) {} }
        c119Ref = null; c119Key = null; c119State = null;
    }

    // 방장이 역할을 무작위 배정
    function initC119() {
        if (!darkRun.isLeader || !database) return;
        const p = darkParties[darkRun.partyId];
        if (!p) return;
        const codes = Object.keys(p.members);
        if (codes.length < 2) return;
        const shuffled = codes.sort(() => Math.random() - 0.5);
        database.ref(c119Path()).set({
            inside: shuffled[0],
            outside: shuffled[1],
            insideName: p.members[shuffled[0]].name,
            outsideName: p.members[shuffled[1]].name,
            step: 0,
            signals: {},
            signalsLeft: SIGNAL_LIMIT,
            muted: false,
            answers: {},
            wrong: 0,
            createdAt: Date.now()
        });
    }

    function myC119Role() {
        if (!c119State) return null;
        if (c119State.inside === currentUser.code) return 'inside';
        if (c119State.outside === currentUser.code) return 'outside';
        return null;
    }

    function sendWordSignal(word) {
        if (!c119State || c119State.muted) return;
        if ((c119State.signalsLeft || 0) <= 0) return;
        if (myC119Role() !== 'inside') return;
        database.ref(c119Path()).update({ signalsLeft: (c119State.signalsLeft || 0) - 1 });
        database.ref(c119Path() + '/signals').push({ w: word, at: Date.now() });
    }

            // ★ 갇힌 자의 비언어 반응 (신호 횟수 소모 없음)
    const C119_REACTS = [
        { k:'knock',  label:'두드린다',   out:'벽 안쪽에서 한 번. 쿵.' },
        { k:'hold',   label:'숨을 죽인다', out:'아무 소리도 나지 않는다. 그게 더 신경 쓰인다.' },
        { k:'hit',    label:'벽을 친다',  out:'유리가 울린다. 급하다는 뜻 같다.' },
        { k:'scrape', label:'긁는다',     out:'손톱이 유리를 긁는 소리. 길게.' }
    ];

    function sendReact(kind) {
        if (myC119Role() !== 'inside') return;
        if (!c119State) return;
        database.ref(c119Path() + '/react').set({ k: kind, at: Date.now() });
    }

    let lastReactAt = 0;
    function renderReactFlash() {
        if (!c119State || !c119State.react) return;
        if (c119State.react.at === lastReactAt) return;
        lastReactAt = c119State.react.at;
        if (myC119Role() !== 'outside') return;
        const r = C119_REACTS.find(x => x.k === c119State.react.k);
        if (!r) return;
        const el = document.getElementById('react-recv');
        if (el) {
            el.innerHTML = `<span style="color:#d4af37;">${r.out}</span>`;
            el.classList.remove('react-flash');
            void el.offsetWidth;
            el.classList.add('react-flash');
        }
    }

    function buildReactBar() {
        const role = myC119Role();
        if (role === 'inside') {
            return `<div class="react-btns">
                ${C119_REACTS.map(r => `<button class="react-btn" onclick="sendReact('${r.k}')">${r.label}</button>`).join('')}
            </div>`;
        }
        if (role === 'outside') {
            return `<div id="react-recv" style="padding:8px 11px; font-size:10px; color:#666; min-height:16px; text-align:center; border-radius:4px;">—</div>`;
        }
        return '';
    }

    function toggleC119Mute(on) {
        if (myC119Role() !== 'outside') return;
        database.ref(c119Path()).update({ muted: !!on });
    }

           function c119Advance(nextStep) {
        if (!database) return;
        if (darkRun) darkRun._c119Locked = false;
        database.ref(c119Path()).update({
            step: nextStep, signals: null, signalsLeft: SIGNAL_LIMIT, muted: false,
            resultA: null, resultB: null, resultC: null, resultD: null
        });
    }

    function renderSignalLog() {
        if (!c119State || !c119State.signals) return '<span style="color:#666;">아직 신호가 없습니다.</span>';
        const arr = Object.values(c119State.signals).sort((a, b) => a.at - b.at);
        if (arr.length === 0) return '<span style="color:#666;">아직 신호가 없습니다.</span>';
        return arr.map(s => `<span style="display:inline-block; background:rgba(212,175,55,0.12); border:1px solid #5a4a2a; color:#d4af37; border-radius:4px; padding:3px 9px; margin:0 4px 4px 0; font-weight:bold; font-size:12px;">${s.w}</span>`).join('');
    }

            function renderStep119() {
        const body = darkBodyEl();
        if (!body || !darkRun) return;
        if (darkRun.rejoined) { renderRejoinScene(); return; }
        saveDarkRunState();

        attachC119Listener();

        if (!c119State) {
            if (darkRun.isLeader) initC119();
            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                `<div style="text-align:center; color:#888; font-size:12px; padding:20px 0;">
                    역할을 배정하는 중...<br>
                    <button class="game-btn" style="margin-top:14px; padding:9px 16px; font-size:11px;" onclick="forceC119Refresh()">다시 시도</button>
                 </div>`, "intro");
            setTimeout(() => { if (c119State && darkRun) renderStep119(); }, 1000);
            setTimeout(() => { if (c119State && darkRun) renderStep119(); }, 2500);
            return;
        }

        const role = myC119Role();
        const s = darkRun.step;

        if (s === 0) { render119Intro(role); return; }
        if (s === 99) { renderDarkResult(); return; }
        if (s === 2 && c119State.resultA) { show119ResultA(); return; }
        if (s === 4 && c119State.resultB) { show119ResultB(); return; }
        if (s === 6 && c119State.resultC) { show119ResultC(); return; }
        if (s === 8 && c119State.resultD) { show119ResultD(); return; }

        const seq = {
            1: () => render119Interlude(role, 1),
            2: () => render119A(role),
            3: () => render119Interlude(role, 2),
            4: () => render119B(role),
            5: () => render119Interlude(role, 3),
            6: () => render119C(role),
            7: () => render119Interlude(role, 4),
            8: () => render119D(role)
        };
        if (seq[s]) seq[s]();
    }

        function forceC119Refresh() {
        if (!darkRun || !database) return;
        database.ref(c119Path()).once('value').then(snap => {
            const v = snap.val();
            if (v) {
                c119State = v;
                darkRun._c119Locked = false;
                renderStep119();
            } else if (darkRun.isLeader) {
                initC119();
                setTimeout(() => forceC119Refresh(), 1200);
            }
        });
    }
                   // --- 막간 장면 ---
    const C119_INTERLUDES = {
        1: {
            inside: `유리 안쪽 바닥에 뭔가 있다.<br><br>사원증이다. 이름 칸이 긁혀서 지워졌고, 사번만 남았다.<br><span style="color:#d4af37;">0031.</span><br><br>뒤집어 본다. 뒷면에 손톱으로 판 글씨.<br><span style="color:#d4af37;">"둘이 들어왔다"</span>`,
            outside: `벽에 자국이 있다. 사람이 오래 기대어 있던 자리다.<br><br>그 아래에 무언가 세어놓은 흔적. 작대기 네 개씩 묶어서 여섯 묶음.<br>스물넷.<br><br>시간이었을까, 횟수였을까.`,
            insideOpts: [
                { l:'① 사원증을 챙긴다.', v:'take' },
                { l:'② 그 자리에 둔다.', v:'leave' }
            ],
            outsideOpts: [
                { l:'① 자국을 더 살펴본다.', v:'look' },
                { l:'② 그냥 지나간다.', v:'pass' }
            ]
        },
        2: {
            inside: `거울 너머로 동료가 보인다. 등을 보이고 서 있다.<br><br>그런데 둘이다.<br>한 걸음 뒤에 하나 더. 똑같은 자세로.<br><br>말해야 하는데, 이걸 전할 단어가 없다.`,
            outside: `복도를 걷는다. 양옆이 전부 거울이다.<br><br>비친 자신이 한 박자씩 늦게 따라온다. 처음엔 착각인 줄 알았다.<br>멈춰 서서 확인한다. 확실히 늦다.<br><br>등 뒤에서 유리 울리는 소리가 났다.`,
            insideOpts: [
                { l:'① 벽을 세게 두드린다.', v:'warn' },
                { l:'② 가만히 지켜본다.', v:'watch' }
            ],
            outsideOpts: [
                { l:'① 뒤를 돌아본다.', v:'turn' },
                { l:'② 보지 않고 걷는다.', v:'walk' }
            ]
        },
        3: {
            inside: `유리에 글씨가 있다. 안쪽에서 쓴 것이다.<br>김이 서려야 보이는 종류의 글씨.<br><br>숨을 뱉어 본다. 천천히 떠오른다.<br><span style="color:#d4af37;">"세 마디로는 부족했다"</span><br><br>그 아래에 더 작게.<br><span style="color:#d4af37;">"먼저 나가라고 했다"</span>`,
            outside: `문틀에 이름표 두 개가 나란히 붙어 있다.<br>둘 다 긁혀 있는데, 한쪽은 완전히 지워졌고 한쪽은 절반만 남았다.<br><br>남은 쪽을 읽어 본다. 읽는 순간 등이 서늘해진다.<br><span style="color:#d4af37;">당신의 부서 이름이다.</span>`,
            insideOpts: [
                { l:'① 같은 자리에 글씨를 덧쓴다.', v:'write' },
                { l:'② 손으로 지운다.', v:'erase' }
            ],
            outsideOpts: [
                { l:'① 이름표를 떼어 챙긴다.', v:'keep' },
                { l:'② 원래대로 둔다.', v:'keepit' }
            ]
        },
        4: {
            inside: `마지막 방이다. 유리가 얇아졌다. 두드리면 소리가 잘 통할 것 같다.<br><br>바닥에 두 사람분의 자국이 있다. 나란히 앉아 있던 자국.<br>한쪽은 일어섰고, 한쪽은 일어서지 않았다.<br><br>일어서지 않은 쪽 자리에, 지금 당신이 앉아 있다.`,
            outside: `문 앞이다. 자물쇠가 걸려 있다.<br><br>옆 벽에 보고서 한 장이 붙어 있다. 대부분 지워졌고 마지막 줄만 남았다.<br><span style="color:#d4af37;">"귀환 인원 1명. 신원 확인 불가."</span><br><br>한 명은 나왔다는 뜻이다.<br>누가 나왔는지는 적혀 있지 않다.`,
            insideOpts: [
                { l:'① 자리에서 일어선다.', v:'stand' },
                { l:'② 그대로 앉아 있는다.', v:'sit' }
            ],
            outsideOpts: [
                { l:'① 보고서를 떼어 낸다.', v:'tear' },
                { l:'② 읽은 것을 잊기로 한다.', v:'forget' }
            ]
        }
    };

        // ==========================================
    // ★ Qtrew-B-330 「미로를 빠져나가자」
    // ==========================================
        const B330_STEPS = {
        0:  { type:'intro' },
        1:  { type:'narr', img:'step1', text:`첫 통로다.<br><br>벽에 손을 대 본다. 미지근하다. 콘크리트가 이런 온도일 리 없다.<br>손을 떼면 자국이 남고, 그 자국이 아주 천천히 메워진다.<br><br>천장의 형광등은 세 개 중 하나만 켜져 있다.<br>꺼진 두 개에는 애초에 전구가 없다.` },
        2:  { type:'gimmick', n:1 },
        3:  { type:'narr', text:`돌아본다.<br><br>방금 지나온 자리에 표식을 남겼었다. 벽에 긁어 그은 자국.<br>없다.<br><br>벽은 같은 벽인데 자국만 사라졌다.<br>다시 그어 본다. 이번에는 보는 앞에서 천천히 메워진다.<br><br>계단 벽에 붙어 있던 근무 수칙을 떠올린다. 네 조까지 있었다.` },
        4:  { type:'quiz', n:1 },
        5:  { type:'narr', text:`걷는다.<br><br>발소리가 울린다. 세어 본다.<br><br>하나 많다.<br><br>멈춘다. 발소리도 멎는다. 다만 반 박자 늦게.` },
        6:  { type:'gimmick', n:2 },
        7:  { type:'silent' },
        8:  { type:'rescue', n:1, text:`남은 사람끼리 걷는다.<br><br>말이 없다. 할 말이 없는 게 아니라, 소리를 내면 안 될 것 같아서다.<br><br>벽에 세어놓은 자국이 있다. 작대기 네 개씩 묶어서 여섯 묶음.<br>스물넷. 시간이었을까, 사람이었을까.` },
        9:  { type:'gimmick', n:3 },
        10: { type:'quiz', n:2 },
        11: { type:'rejoinpoint' },        
        12: { type:'abduct', n:1 },
        13: { type:'gimmick', n:4 },
        14: { type:'rejoinpoint' },
        15: { type:'quiz', n:3 },
        16: { type:'abduct', n:2 },
        17: { type:'gimmick', n:5 },
        18: { type:'rejoinpoint' },
        19: { type:'rescue', n:2, text:`바닥이 기울어 있다.<br><br>처음부터 기울어 있었다. 아주 미세해서 몰랐을 뿐이다.<br>여태 걸어온 게 아니라, 흘러온 것이었다.<br><br>벽에 손톱자국이 있다. 사람이 버티려고 한 자국이다.<br>그 옆에 또 하나. 또 하나. 셀 수 없이 많다.` },
        20: { type:'gimmick', n:6 },
        21: { type:'gimmick', n:7 },
        99: { type:'result' }
    };

function renderStepB330() {
    const body = darkBodyEl();
    if (!body || !darkRun) return;
    if (darkRun.isParty) watchDyingMembers();
    if (darkRun.solo) { renderSoloStep(); return; }

    const def = B330_STEPS[darkRun.step];
    if (!def) { renderDarkResult(); return; }

    if (def.type === 'rescue') { (def.n === 1 ? b330Rescue1() : b330Rescue2()); return; }

    if (def.type === 'intro') {
        body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
            (darkRun.isLeader || !darkRun.isParty)
                ? darkChoiceBtn("안으로 들어간다.", "partyAdvance(1)")
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`,
            "intro");
        mountDarkChat('normal');
        return;
    }
        if (def.type === 'narr') {
            body.innerHTML = darkBox("—", def.text,
                (darkRun.isLeader || !darkRun.isParty)
                    ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                        : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`,
                def.img);
            mountDarkChat('normal');
            return;
        }

        if (def.type === 'quiz')   { renderQuizStep(def.n); return; }
        if (def.type === 'silent') { renderSilentWalk(); return; }
        if (def.type === 'abduct') { renderAbduction(def.n); return; }
        if (def.type === 'rejoinpoint') { renderB330Rejoin(); return; }
        if (def.type === 'result') { renderDarkResult(); return; }

        const fns = { 1:b330Gimmick1, 2:b330Gimmick2, 3:b330Gimmick3, 4:b330Gimmick4, 5:b330Gimmick5, 6:b330Gimmick6, 7:b330Gimmick7 };
        if (fns[def.n]) fns[def.n]();
    }
        // --- 기믹 1: 세 갈래 ---
    function b330Gimmick1() {
        renderChoiceStep("기믹 1 — 세 갈래",
            `통로가 셋으로 갈린다.<br><br>왼쪽은 밝다. 형광등이 전부 켜져 있다.<br>가운데는 폭이 넓다. 사람이 많이 지나간 자국이 있다.<br>오른쪽은 좁고 어둡다. 바람이 나온다.<br><br>벽의 화살표는 셋 다 가리키고 있다.`,
            [
                { id:'left',   label:'① 밝은 쪽으로 간다.',   fn:'b330G1Result', arg:'left' },
                { id:'center', label:'② 넓은 쪽으로 간다.',   fn:'b330G1Result', arg:'center' },
                { id:'right',  label:'③ 좁고 어두운 쪽으로.', fn:'b330G1Result', arg:'right' }
            ], "step1");
    }

    function b330G1Result(pick) {
        let txt, mod = 0;
        if (pick === 'left') {
            txt = `밝은 쪽으로 간다.<br><br>형광등이 전부 켜져 있다. 너무 밝아서 그림자가 생기지 않는다.<br>일행의 발밑을 본다. 아무도 그림자가 없다.<br><br>조금 걷다 보니 뒤쪽 등부터 하나씩 꺼지기 시작한다.`;
            mod = 0; applyPollutionToUser(currentUser, 2);
        } else if (pick === 'center') {
            txt = `넓은 쪽으로 간다.<br><br>바닥에 발자국이 많다. 전부 같은 방향이다. 들어가는 쪽으로만.<br>나오는 쪽 발자국은 하나도 없다.<br><br>세어 보려다 만다.`;
            mod = 1;
        } else {
            txt = `좁은 쪽으로 들어선다.<br><br>어깨가 벽에 닿는다. 벽이 미지근하고 조금 물렁하다.<br>바람이 나온다. 일정한 간격으로 나왔다 멎는다.<br><br>빠져나오니 통로가 다시 넓어져 있다.`;
            mod = 2; applyPollutionToUser(currentUser, 3);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.success++;
        darkRun.log.push(`[기믹 1] ${pick}`);
        renderResultStep("기믹 1 — 결과", txt, "계속 간다.",
            (darkRun.isLeader || !darkRun.isParty) ? "partyAdvance(3)" : "void 0");
    }

    // --- 기믹 2: 안내판 ---
    function b330Gimmick2() {
        renderChoiceStep("기믹 2 — 안내판",
            `벽에 안내판이 셋. 같은 높이에 나란히 붙어 있다.<br><br><span style="color:#d4af37;">"왼쪽 — 출구"</span><br><span style="color:#d4af37;">"오른쪽 — 출구"</span><br><span style="color:#d4af37;">"뒤 — 출구"</span><br><br>글씨체가 전부 다르다. 쓴 사람이 셋이라는 뜻인지,<br>아니면 한 사람이 세 번에 나눠 썼다는 뜻인지 모르겠다.`,
            [
                { id:'trust',  label:'① 안내판을 믿고 왼쪽으로.', fn:'b330G2Result', arg:'trust' },
                { id:'ignore', label:'② 전부 무시하고 직진한다.', fn:'b330G2Result', arg:'ignore' },
                { id:'back',   label:'③ 뒤로 돌아간다.',          fn:'b330G2Result', arg:'back' },
                { id:'tear',   label:'④ 안내판을 떼어 낸다.',     fn:'b330G2Result', arg:'tear' }
            ], "step2");
    }

    function b330G2Result(pick) {
        let txt, mod = 0, ok = true;
        if (pick === 'trust') {
            txt = `왼쪽으로 간다.<br><br>한참 걷자 안내판이 또 나온다. 똑같은 것 셋.<br>아까 그 자리인지, 아니면 같은 것을 또 만든 건지 알 수 없다.<br><br>글씨체까지 똑같다.`;
            mod = -1; ok = false;
        } else if (pick === 'ignore') {
            txt = `안내판을 지나친다.<br><br>등 뒤에서 뭔가 떨어지는 소리가 난다. 돌아보니 안내판이 바닥에 떨어져 있다.<br>셋 다.<br><br>주워 들 생각은 하지 않는다.`;
            mod = 1;
        } else if (pick === 'back') {
            txt = `되돌아간다.<br><br>왔던 길이 그대로 있다. 처음으로 뭔가 그대로 있다.<br>그게 오히려 이상하다.<br><br>한참 걸었는데 입구가 나오지 않는다. 길만 계속 이어진다.`;
            mod = 0; applyPollutionToUser(currentUser, 3);
        } else {
            txt = `안내판을 벽에서 떼어 낸다.<br><br>뒷면에 글씨가 있다. 손으로 눌러 쓴 자국.<br><span style="color:#d4af37;">"세지 마라"</span><br><br>무엇을 세지 말라는 건지는 적혀 있지 않다.`;
            mod = 2; darkRun.b330Hint = true;
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        if (ok) darkRun.success++; else darkRun.fail++;
        darkRun.log.push(`[기믹 2] ${pick}`);
        renderResultStep("기믹 2 — 결과", txt, "계속 간다.",
            (darkRun.isLeader || !darkRun.isParty) ? "partyAdvance(7)" : "void 0");
    }

        // --- 기믹 3: 좁아지는 통로 (타이밍) ---
    function b330Gimmick3() {
        const body = darkBodyEl();
        const canSolo = !darkRun.solo && darkRun.isParty;
        body.innerHTML = darkBox("기믹 3 — 좁아지는 통로",
            `통로가 주기적으로 좁아진다.<br>넓어진 순간에 맞춰 지나가야 한다.<br><br>좁아진 자리에 끼면 어떻게 되는지는, 벽에 남은 자국이 말해 준다.<br><br><span style="color:#888; font-size:11px;">[넓어진 순간에 버튼을 누르세요 — 3회 통과]</span>`,
            `<div id="b330-gap" style="width:100%; height:46px; background:#1a1a1a; border:1px solid #3a3a3a; border-radius:6px; margin-bottom:12px; position:relative; overflow:hidden;">
                <div id="b330-wall-l" style="position:absolute; left:0; top:0; height:100%; width:10%; background:linear-gradient(90deg, #4a3020, #6a4530); transition:width 0.08s linear;"></div>
                <div id="b330-wall-r" style="position:absolute; right:0; top:0; height:100%; width:10%; background:linear-gradient(270deg, #4a3020, #6a4530); transition:width 0.08s linear;"></div>
             </div>
             <div style="text-align:center; font-size:12px; color:#aaa; margin-bottom:10px;">통과: <b id="b330-pass" style="color:var(--theme-focus);">0</b> / 3</div>
             <button class="game-btn" id="b330-btn" style="width:100%; margin:0 0 8px 0; padding:14px;" onclick="b330Tap()">지나간다</button>
             <div id="b330-msg" style="font-size:11px; color:#888; text-align:center; min-height:16px; margin-bottom:10px;"></div>
             ${canSolo ? `<button class="game-btn" style="width:100%; margin:0; padding:11px; font-size:11px; background:linear-gradient(145deg, #4a3060, #2a1a40) !important; border-color:#7e57c2 !important; color:#ddd !important;" onclick="goSolo()">⑂ 일행과 떨어져 혼자 간다</button>` : ''}`,
            "step3");
        mountDarkChat('normal');
        startB330Gap();
    }

    let b330Timer = null, b330Open = false, b330Pass = 0, b330Miss = 0;

    function startB330Gap() {
        b330Pass = 0; b330Miss = 0; b330Open = false;
        clearTimeout(b330Timer);
        const l = document.getElementById('b330-wall-l');
        const r = document.getElementById('b330-wall-r');
        function cycle() {
            b330Open = !b330Open;
            const w = b330Open ? 8 : 42;
            if (l) l.style.width = w + '%';
            if (r) r.style.width = w + '%';
            clearTimeout(b330Timer);
            b330Timer = setTimeout(cycle, b330Open ? (620 + Math.random()*420) : (800 + Math.random()*700));
        }
        cycle();
    }

    function b330Tap() {
        if (!darkRun) return;
        const msg = document.getElementById('b330-msg');
        if (b330Open) {
            b330Pass++;
            document.getElementById('b330-pass').innerText = b330Pass;
            msg.innerHTML = `<span style="color:#4CAF50;">지나갔다.</span>`;
        } else {
            b330Miss++;
            applyPollutionToUser(currentUser, 4);
            msg.innerHTML = `<span style="color:#f44336;">벽에 부딪혔다. 벽이 물렁했다.</span>`;
        }
        if (b330Pass >= 3 || b330Miss >= 3) {
            clearTimeout(b330Timer);
            document.getElementById('b330-btn').disabled = true;
            const ok = b330Pass >= 3;
            if (ok) { darkRun.success++; darkRun.modifier = (darkRun.modifier||0) + 1; }
            else { darkRun.fail++; darkRun.modifier = (darkRun.modifier||0) - 1; applyPollutionToUser(currentUser, 6); }
            darkRun.log.push(`[기믹 3] 통로 ${ok ? '통과' : '실패'} (${b330Pass}/3)`);
            setTimeout(() => {
                renderResultStep("기믹 3 — 결과",
                    ok ? `마지막 한 번을 빠져나온다.<br><br>뒤에서 통로가 완전히 닫힌다. 소리가 나지 않는다.<br>돌아갈 길이 없어졌다는 뜻이다.`
                       : `몇 번 부딪혔다.<br>벽이 단단하지 않아서 다치지는 않았다.<br><br>다만 부딪힌 자리마다 옷에 뭔가 묻었다. 닦이지 않는다.`,
                    "계속 간다.",
                    (darkRun.isLeader || !darkRun.isParty) ? "partyAdvance(10)" : "void 0");
            }, 1200);
        }
    }

        // --- 단독 행동 ---
    function goSolo() {
        if (!darkRun || !darkRun.isParty || !database) return;
        darkRun.solo = true;
        darkRun.soloIdx = 0;
        database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({
            name: currentUser.name, at: Date.now(), step: darkRun.step
        });
        sendPartyChat(`${currentUser.name} 사원이 일행과 떨어졌습니다.`, true);
        darkRun.log.push(`[단독] ${darkRun.step}단계에서 이탈`);
        renderSoloStep();
    }

        const B330_SOLO = [
        { text:`일행의 발소리가 멀어진다.<br><br>혼자다. 통로가 갑자기 넓게 느껴진다.<br>실제로 넓어진 것일 수도 있다.<br><br>벽을 짚고 걷는다. 벽이 따라 걷는 것 같다.`,
          opts:[ {l:'① 벽을 따라 계속 간다.', v:'wall'}, {l:'② 소리를 내며 걷는다.', v:'loud'}, {l:'③ 신발을 벗고 조용히 간다.', v:'quiet'} ] },

        { text:`문이 하나 있다.<br><br>미로에 문이 있을 리 없는데 있다.<br>손잡이에 손때가 많다. 여러 사람이 잡았다는 뜻이다.<br><br>열면 어디로 나올지 모른다.`,
          opts:[ {l:'① 문을 연다.', v:'open'}, {l:'② 지나친다.', v:'skip'}, {l:'③ 손잡이만 만져 본다.', v:'touch'} ] },

        { text:`바닥에 신발 한 짝이 있다.<br><br>왼쪽이다. 오른쪽은 없다.<br>집어 보니 아직 따뜻하다.<br><br>치수가 당신과 같다.`,
          opts:[ {l:'① 챙긴다.', v:'take'}, {l:'② 제자리에 둔다.', v:'leave'}, {l:'③ 신어 본다.', v:'wear'} ] },

        { text:`통로가 두 갈래다.<br><br>한쪽은 위로 올라가고, 한쪽은 아래로 내려간다.<br>일행은 어느 쪽에 있을까. 아니면 어느 쪽에도 없을까.<br><br>표지판은 없다. 이번엔 정말로 없다.`,
          opts:[ {l:'① 위로 올라간다.', v:'up'}, {l:'② 아래로 내려간다.', v:'down'}, {l:'③ 제자리에서 기다린다.', v:'hold'} ] },

        { text:`앞에 일행의 뒷모습이 보인다.<br><br>부르려다 만다. 세어 보니 인원이 맞다.<br>당신을 빼고 맞다.<br><br>저쪽은 아직 당신을 못 봤다.`,
          opts:[ {l:'① 부른다.', v:'call'}, {l:'② 뒤따라간다.', v:'follow'}, {l:'③ 다른 길로 돈다.', v:'avoid'} ] },

        { text:`벽에 이름이 적혀 있다.<br><br>손톱으로 판 글씨다. 여러 개고, 깊이가 다 다르다.<br>오래된 것일수록 깊다.<br><br>맨 아래에 아직 얕은 것이 하나. 당신 이름이다.`,
          opts:[ {l:'① 지운다.', v:'erase'}, {l:'② 더 깊게 판다.', v:'carve'}, {l:'③ 그냥 지나간다.', v:'ignore'} ] }
    ];

   function renderSoloStep() {
        if (!darkRun) return;
        if (darkRun.soloIdx == null) darkRun.soloIdx = 0;

        // 합류 지점에 도달했으면 합류 시도
        const def = B330_STEPS[darkRun.step];
        if (def && def.type === 'rejoinpoint') { renderB330Rejoin(); return; }

        if (darkRun.step >= 21) {
            darkRun.modifier = (darkRun.modifier || 0) - 2;   // 혼자라 불리
            b330Gimmick7();
            return;
        }

        const d = B330_SOLO[darkRun.soloIdx % B330_SOLO.length];
        const body = darkBodyEl();
        body.innerHTML = darkBox("단독 — 혼자", d.text,
            d.opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="soloPick('${o.v}')">${o.l}</button>`).join(''));
        mountDarkChat('normal');
    }

    function soloPick(v) {
        let txt, mod = 0;
        const good = ['quiet','touch','leave','avoid','ignore','hold'];
        const bad  = ['loud','open','wear','call','carve','down'];

        if (good.includes(v)) {
            mod = 1;
            txt = `조심스럽게 움직인다.<br><br>아무 일도 일어나지 않는다.<br>아무 일도 일어나지 않는 것이 여기서는 성과다.`;
        } else if (bad.includes(v)) {
            mod = -1;
            applyPollutionToUser(currentUser, 5);
            darkRun.fail++;
            txt = `그렇게 한다.<br><br>무언가 이쪽을 알아차린 느낌이 든다.<br>통로 끝에서 뭔가가 아주 천천히 방향을 바꿨다.`;
        } else {
            txt = `그렇게 한다.<br><br>별다른 일은 없다. 다만 시간이 조금 지났다.`;
        }

        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.soloScore = (darkRun.soloScore || 0) + mod;
        darkRun.soloIdx = (darkRun.soloIdx || 0) + 1;
        darkRun.log.push(`[단독] ${v}`);

        // ★ 단독 중 위험 누적 시 치명
        if ((darkRun.soloScore || 0) <= -3) {
            darkRun.dying = 'solo';
            renderRescueScene('solo');
            return;
        }

        // 본대의 진행에 맞춰 따라간다
        const nextStep = darkRun.step + 1;
        const def = B330_STEPS[nextStep];
        const isRejoin = def && def.type === 'rejoinpoint';

        darkBodyEl().innerHTML = darkBox("단독 — 결과", txt,
            darkChoiceBtn(
                isRejoin ? "인기척이 난다." : "계속 간다.",
                `darkRun.step=${nextStep}; renderSoloStep();`));
        mountDarkChat('normal');
    }

        // --- 기믹 4: 하나 많다 ---
    function b330Gimmick4() {
        if (darkRun.solo) { renderSoloStep(); return; }
        const p = darkParties[darkRun.partyId];
        const members = p && p.members ? Object.values(p.members).filter(m => !((p.solo||{})[m.code])) : [];
        const opts = members.map(m => ({
            id: m.code, label: `${m.name} (${m.position})`, fn: 'b330G4Result', arg: m.code
        }));
        opts.push({ id:'none', label:'아무도 지목하지 않는다.', fn:'b330G4Result', arg:'none' });

        renderChoiceStep("기믹 4 — 하나 많다",
            `분명히 하나 많다.<br><br>얼굴을 본다. 전부 아는 얼굴이다.<br>이름도 부를 수 있고, 목소리도 맞다.<br><br>그런데 수가 맞지 않는다.<br><br><span style="color:#888; font-size:11px;">${darkRun.b330Hint ? '<span style="color:#d4af37;">안내판 뒷면의 글씨가 떠오른다. "세지 마라"</span>' : '한 명을 지목해야 한다.'}</span>`,
            opts, null);
    }

    function b330G4Result(pick) {
        let txt, mod = 0;
        if (pick === 'none') {
            txt = `아무도 지목하지 않는다.<br><br>세는 것을 그만둔다. 숫자를 잊기로 한다.<br><br>잠시 뒤 다시 세어 보니 맞다.<br>처음부터 맞았던 것 같기도 하다.`;
            mod = 2; darkRun.success++;
        } else {
            const p = darkParties[darkRun.partyId];
            const name = p && p.members && p.members[pick] ? p.members[pick].name : '누군가';
            txt = `${name} 사원을 지목한다.<br><br>지목당한 쪽이 웃는다. 농담인 줄 알았다가, 아무도 웃지 않는 것을 보고 멈춘다.<br><br>그 순간 수가 하나 더 늘었다.<br>세는 것을 그만두기로 한다.`;
            mod = -1; darkRun.fail++;
            applyPollutionToUser(currentUser, 4);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 4] ${pick === 'none' ? '지목 안 함' : '지목함'}`);
        renderResultStep("기믹 4 — 결과", txt, "계속 간다.",
            (darkRun.isLeader || !darkRun.isParty) ? "partyAdvance(14)" : "void 0");
    }

    // --- 합류 지점 ---
       // ==========================================
    // ★ 합류 시스템 (3지점 · 단독자끼리 자동 조우)
    // ==========================================
    const SOLO_MEET_SCENES = [
        {
            text: `통로 끝에서 발소리가 난다.<br><br>일행일 리 없다. 방향이 반대다.<br>멈춰 서서 기다린다. 소리가 가까워진다.<br><br>모퉁이를 돌아 나온 것은 사람이었다. 아는 얼굴이다.<br>둘 다 한참 말을 하지 않았다.`,
            after: `서로 어디서 떨어졌는지 물어보지 않기로 한다.<br>대답이 맞지 않을까 봐.`
        },
        {
            text: `벽 너머에서 소리가 난다. 두드리는 소리다.<br><br>세 번, 쉬고, 두 번.<br>같은 박자로 돌려준다. 잠시 뒤 같은 박자가 온다.<br><br>벽을 따라간다. 끝에서 문이 아닌 틈이 있었고,<br>거기에 사람이 끼어 있었다. 빼내는 데 한참 걸렸다.`,
            after: `둘 다 손이 긁혔다.<br>긁힌 자국이 똑같은 모양이라는 건 나중에 알았다.`
        }
    ];

    // 단독자끼리 자동 조우
    function trySoloMeet() {
        if (!darkRun || !darkRun.solo || !database) return false;
        const p = darkParties[darkRun.partyId];
        if (!p || !p.solo) return false;
        const soloList = Object.keys(p.solo);
        if (soloList.length < 2) return false;
        if (darkRun.soloMet) return false;

        // 첫 번째 단독자가 장면을 정한다
        const first = soloList.sort()[0];
        if (currentUser.code === first) {
            const idx = Math.floor(Math.random() * SOLO_MEET_SCENES.length);
            database.ref(`darkParties/${darkRun.partyId}/soloMeet`).set({ scene: idx, at: Date.now() });
        }
        return true;
    }

    function renderSoloMeet() {
        if (!database) return;
        database.ref(`darkParties/${darkRun.partyId}/soloMeet`).once('value').then(sn => {
            const m = sn.val();
            if (!m || !darkRun) return;
            darkRun.soloMet = true;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
            const sc = SOLO_MEET_SCENES[m.scene] || SOLO_MEET_SCENES[0];

            darkBodyEl().innerHTML = darkBox("조우", sc.text + `<br><br>${sc.after}`,
                darkChoiceBtn("함께 간다.", "renderDarkStep();"));
            mountDarkChat('normal');
            sendPartyChat(`떨어져 있던 사원들이 서로를 찾았습니다.`, true);
        });
    }

    // --- 합류 지점 ---
    function renderB330Rejoin() {
        const body = darkBodyEl();
        if (!darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }

        const p = darkParties[darkRun.partyId];
        const hasSolo = p && p.solo && Object.keys(p.solo).length > 0;

        if (!hasSolo) {
            body.innerHTML = darkBox("—",
                `통로가 넓어진다.<br><br>일행이 전부 여기 있다. 세지 않는다.<br>세지 않기로 했으니까.`,
                (darkRun.isLeader
                    ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                        : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
            mountDarkChat('normal');
            return;
        }

        // 단독자 둘 이상이면 먼저 서로 만난다
        if (darkRun.solo && !darkRun.soloMet && trySoloMeet()) {
            setTimeout(() => renderSoloMeet(), 900);
            body.innerHTML = darkBox("—",
                `발소리가 들린다.<br><br>이쪽으로 오는 소리다.`,
                `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">기다리는 중...</div>`);
            mountDarkChat('normal');
            return;
        }

        const amSolo = darkRun.solo;
        const attempt = (darkRun.rejoinTries || 0) + 1;

        const soloOpts = [
            { l:'① 이름을 부른다.', v:'call' },
            { l:'② 발자국을 따라간다.', v:'track' },
            { l:'③ 벽을 두드려 신호한다.', v:'knock' },
            { l:'④ 그냥 앞으로 간다.', v:'forward' }
        ];
        const holdOpts = [
            { l:'① 그 자리에서 기다린다.', v:'stay' },
            { l:'② 앞으로 나아간다.', v:'move' },
            { l:'③ 찾으러 되돌아간다.', v:'search' },
            { l:'④ 소리를 내며 걷는다.', v:'loud' }
        ];

        body.innerHTML = darkBox(`합류 — ${attempt}차`,
            amSolo
                ? `통로가 갈린다. 어느 쪽에서 일행의 기척이 나는지 알 수 없다.<br><br>${attempt >= 3 ? '마지막 기회다. 다음은 없다.' : '놓치면 다음을 기약해야 한다.'}`
                : `떨어져 나간 쪽의 소식이 없다.<br><br>${attempt >= 3 ? '더 기다릴 수 없다. 마지막이다.' : '어떻게 할지 정해야 한다.'}`,
            (amSolo ? soloOpts : holdOpts)
                .map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="b330Rejoin('${o.v}')">${o.l}</button>`)
                .join(''));
        mountDarkChat('normal');
    }

    function b330Rejoin(v) {
        if (!database) return;
        const key = darkRun.solo ? 'soloPick' : 'holdPick';
        const attempt = (darkRun.rejoinTries || 0) + 1;
        database.ref(`darkParties/${darkRun.partyId}/rj${attempt}/${key}/${currentUser.code}`).set(v);

        setTimeout(() => {
            database.ref(`darkParties/${darkRun.partyId}/rj${attempt}`).once('value').then(sn => {
                const rj = sn.val() || {};
                const soloPicks = Object.values(rj.soloPick || {});
                const holdPicks = Object.values(rj.holdPick || {});
                resolveB330Rejoin(soloPicks, holdPicks, attempt);
            });
        }, 2000);

        darkBodyEl().innerHTML = darkBox(`합류 — ${attempt}차`,
            `선택했다.<br><br>상대가 어떻게 움직일지는 알 수 없다.`,
            `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">서로를 찾는 중...</div>`);
        mountDarkChat('normal');
    }

    function resolveB330Rejoin(soloPicks, holdPicks, attempt) {
        let result, txt, mod = 0, joined = false;
        const s = soloPicks[0], h = holdPicks[0];

        // 성공 조합
        if (s === 'call' && h === 'stay') {
            result = '정면 합류'; mod = 2; joined = true;
            txt = `이름을 부른다. 대답이 온다.<br><br>같은 자리에 서서 기다리고 있었다.<br>가까워질수록 인원이 맞는지 세고 싶어지지만, 세지 않는다.`;
        } else if (s === 'track' && h === 'move') {
            result = '우회 합류'; mod = 1; joined = true;
            txt = `발자국을 따라간다. 아직 축축하다.<br><br>모퉁이를 돌자 일행의 등이 보인다.<br>수를 세지 않고 그냥 뒤에 붙는다.`;
        } else if (s === 'knock' && h === 'search') {
            result = '신호 합류'; mod = 3; joined = true;
            txt = `벽을 두드린다. 세 번, 쉬고, 두 번.<br><br>같은 박자가 돌아온다. 벽 반대편에서다.<br>벽을 따라 가니 곧 만난다.<br><br><span style="color:#d4af37;">서로가 본 것이 맞춰진다.</span>`;
        } else if (s === 'forward' && h === 'loud') {
            result = '우연 합류'; mod = 1; joined = true;
            txt = `그냥 앞으로 간다. 방향 같은 건 이미 의미가 없다.<br><br>그런데 앞쪽에서 소리가 난다. 일부러 내는 소리다.<br>미로에서 소리를 내는 건 위험한데, 그걸 알면서도 냈다.`;
        } else if (s === 'call' && h === 'loud') {
            result = '소란 합류'; mod = -1; joined = true;
            txt = `양쪽 다 소리를 낸다.<br><br>만나기는 한다. 다만 만난 자리에 다른 것도 와 있었다.<br>서둘러 자리를 뜬다.`;
            applyPollutionToUser(currentUser, 5);
        } else {
            result = '엇갈림'; mod = -1;
            txt = attempt >= 3
                ? `끝내 만나지 못했다.<br><br>지나간 자리는 있는데 사람이 없다.<br>같은 통로를 반대로 돌고 있었던 것 같다.<br><br>각자 가기로 한다. 끝에서 보기로 한다. 끝이 있다면.`
                : `움직인다. 한참을 움직인다.<br><br>동료가 지나간 자리는 있는데 동료가 없다.<br>아직 기회는 있다. 다음 갈림에서 다시 시도해 보기로 한다.`;
            applyPollutionToUser(currentUser, 3);
        }

        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.rejoinTries = attempt;
        darkRun.log.push(`[합류 ${attempt}차] ${result}`);

        if (joined) {
            darkRun.solo = false;
            darkRun.soloMet = false;
            if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
            sendPartyChat(`합류 성공 — ${result}`, true);
        } else {
            sendPartyChat(`합류 실패 — 엇갈렸습니다.`, true);
        }

        darkBodyEl().innerHTML = darkBox(`합류 ${attempt}차 — 결과`, txt,
            `<div style="text-align:center; font-size:11px; color:${mod > 0 ? '#4CAF50' : '#ff9800'}; margin-bottom:12px; padding:9px; background:rgba(0,0,0,0.25); border-radius:5px;">
                ${result} — 이후 판정 보정 ${mod >= 0 ? '+' : ''}${mod}
             </div>` +
            ((darkRun.isLeader || darkRun.solo)
                ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
        mountDarkChat('normal');
    }

    // --- 기믹 5: 마지막 ---
       function b330Gimmick7() {
        renderChoiceStep("기믹 7 — 잊히기",
            `끝이 보인다.<br><br>
             다만 나가려면 이것이 당신을 잊어야 한다.<br>
             기억되는 쪽은 나갈 수 없다. 여태 벽에 남은 자국들이 그 증거다.<br><br>
             어떻게 잊힐지 정해야 한다.`,
            [
                { id:'forget', label:'① 사원증을 바닥에 놓고 간다.',   fn:'b330G7Roll', arg:'forget' },
                { id:'still',  label:'② 완전히 멈춰 선다.',            fn:'b330G7Roll', arg:'still' },
                { id:'walk',   label:'③ 평범하게 걸어 나간다.',        fn:'b330G7Roll', arg:'walk' },
                { id:'shout',  label:'④ 이름을 외치며 달린다.',        fn:'b330G7Roll', arg:'shout' }
            ], "step3");
    }

        function b330G7Roll(pick) {
        const roll = Math.floor(Math.random()*20) + 1;
        let bonus = rollDarkBonus ('hide');
        if (currentUser.darkMazeMap > 0) { bonus += 1; currentUser.darkMazeMap--; }
        const total = roll + bonus;

        let DC = { forget:13, still:15, walk:17, shout:20 }[pick];
        let outcome, txt, died = false;

        if (roll === 20) outcome = 'crit';
        else if (roll === 1) outcome = 'fumble';
        else outcome = (total >= DC) ? 'pass' : 'fail';

        if (outcome === 'crit') {
            darkRun.success += 2; darkRun.critical = true;
            txt = `벽이 흐려진다.<br><br>당신을 그리던 손이 멈춘 것 같다. 세부가 지워지고, 윤곽이 지워지고,<br>마지막으로 이름이 지워진다.<br><br>바닥에 뭔가가 떨어져 있다. 주워 든다.`;
        } else if (outcome === 'pass') {
            darkRun.success++;
            txt = pick === 'forget'
                ? `사원증을 바닥에 놓는다.<br>이름이 바닥에 남고, 당신은 이름 없이 걷는다.<br><br>벽이 조금씩 멀어진다.`
                : pick === 'still'
                ? `멈춘다. 완전히 멈춘다.<br>숨도, 생각도.<br><br>움직이지 않는 것은 그리기 어렵다.<br>윤곽이 흐려진다.`
                : `그냥 걷는다.<br>빠르지도 느리지도 않게.<br><br>인상에 남지 않는 걸음이었다. 그게 통했다.`;
        } else if (outcome === 'fail') {
            darkRun.fail++; applyPollutionToUser(currentUser, 8);
            darkRun.failedRun = true;
            txt = `빠져나오기는 했다.<br><br>다만 무언가가 아직 당신을 기억하고 있다.<br>등 뒤가 계속 서늘하다.`;
        } else {
            darkRun.fail += 2;
            died = true;
            txt = `벽이 선명해진다.<br><br>당신이 아주 또렷해졌다는 뜻이다.<br>이제 그것은 당신을 정확히 알고 있다.<br><br>다음에 그릴 때는 더 잘 그릴 것이다.`;
        }

        darkRun.log.push(`[기믹 7] d20 ${roll}(+${bonus}) vs DC${DC} — ${outcome}`);

        // ★ 실패 누적이 많으면 실패도 치명적 (구제 가능)
        if (outcome === 'fail' && (darkRun.fail || 0) >= 6) {
            darkRun.dying = 'final';
            renderRescueScene('final');
            return;
        }

        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 7 — 판정",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${outcome==='crit'?'#4CAF50':'#ffd700'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            darkChoiceBtn("빠져나간다.", "darkRun.step=99; renderDarkStep();"));
        mountDarkChat('normal');
    }
    function render119Interlude(role, n) {
        const data = C119_INTERLUDES[n];
        if (!data) return;
        const isInside = role === 'inside';
        const opts = isInside ? data.insideOpts : data.outsideOpts;
        const picked = c119State[`il${n}_${role}`];
        const body = darkBodyEl();

        let optHtml;
        if (picked) {
            optHtml = `<div style="text-align:center; font-size:11px; color:#4CAF50; padding:10px; background:rgba(0,0,0,0.25); border-radius:5px;">선택했다. 동료를 기다린다.</div>`;
        } else {
            optHtml = opts.map(o =>
                `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="pick119Interlude(${n},'${o.v}')">${o.l}</button>`
            ).join('');
        }

        const bothDone = c119State[`il${n}_inside`] && c119State[`il${n}_outside`];
        if (bothDone) {
            optHtml += darkRun.isLeader
                ? darkChoiceBtn("계속 간다.", `c119Advance(${n * 2})`)
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`;
        }

        body.innerHTML = darkBox(`— ${n}`, isInside ? data.inside : data.outside, optHtml,
            n === 1 ? "intro" : null);
        mountDarkChat(isInside ? 'words' : 'normal',
            C119_WORDS[Math.min(n - 1, 3)], c119State.signalsLeft, c119State.muted);
        updateDarkRoleLabel();
    }

    function pick119Interlude(n, val) {
        const role = myC119Role();
        if (!role || !database) return;
        let upd = {};
        upd[`il${n}_${role}`] = val;
        database.ref(c119Path()).update(upd);

        // 선택에 따른 보정
        if (val === 'take' || val === 'look' || val === 'write' || val === 'keep') {
            darkRun.modifier = (darkRun.modifier || 0) + 1;
        }
        if (val === 'turn' || val === 'erase') {
            applyPollutionToUser(currentUser, 2);
        }
        if (val === 'warn') {
            database.ref(c119Path()).update({ signalsLeft: (c119State.signalsLeft || 0) + 1 });
        }
        darkRun.log.push(`[막간 ${n}] ${role} — ${val}`);
    }

    function render119Intro(role) {
        const body = darkBodyEl();
        const isInside = role === 'inside';
        body.innerHTML = darkBox("진입",
            DARK_ZONES[darkRun.zone].intro + `<br><br>
            <div style="border-top:1px dashed #333; padding-top:14px; margin-top:6px;">
                ${isInside
                    ? `<span style="color:#ff6b6b; font-weight:bold; font-size:14px;">당신은 거울 안쪽에 있다.</span><br><br>
                       사방이 유리다. 밖이 보이지만 소리는 거의 통하지 않는다.<br>
                       목이 잠겼다. 정해진 몇 마디 외에는 소리가 나오지 않는다.<br><br>
                       <span style="color:#d4af37;">밖에 있는 <b>${c119State.outsideName}</b> 사원에게 정답을 알려야 한다.</span>`
                    : `<span style="color:#4CAF50; font-weight:bold; font-size:14px;">당신은 거울 바깥에 있다.</span><br><br>
                       방 한쪽에 장치가 있다. 조작할 수 있는 것은 당신뿐이다.<br>
                       다만 무엇이 정답인지는 보이지 않는다.<br><br>
                       <span style="color:#d4af37;">안쪽의 <b>${c119State.insideName}</b> 사원이 보내는 신호에 의지해야 한다.</span>`}
            </div>`,
            (darkRun.isLeader
                ? darkChoiceBtn("시작한다.", "c119Advance(1)")
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">방장의 신호를 기다리는 중입니다.</div>`)
                        , "intro");
        mountDarkChat(role === 'inside' ? 'muted' : 'normal');
        updateDarkRoleLabel();
    }

    // 공통 레이아웃
      function build119(role, title, insideText, outsideText, insideExtra, outsideExtra) {
        const isInside = role === 'inside';
        const wordSet = C119_WORDS[darkRun.step - 1] || C119_WORDS[0];
        const body = darkBodyEl();

        const signalBox = `
            <div style="background:rgba(0,0,0,0.4); border:1px solid #3a3a3a; border-radius:6px; padding:11px; margin-bottom:12px;">
                <div style="font-size:10px; color:#888; font-weight:bold; margin-bottom:7px;">📡 수신된 신호</div>
                <div style="min-height:26px;">${renderSignalLog()}</div>
            </div>`;

        body.innerHTML = darkBox(title,
            isInside ? insideText : outsideText,
            (isInside ? '' : signalBox) + (isInside ? (insideExtra || '') : (outsideExtra || '')),
             {2:'step1', 4:'step2', 6:'step3', 8:'step4'}[darkRun.step] || null);

        mountDarkChat(isInside ? 'words' : 'normal', wordSet, c119State.signalsLeft, c119State.muted);
        updateDarkRoleLabel();
    }

    // --- 기믹 1: 거울 고르기 ---
    function render119A(role) {
        if (!darkRun.c119a) {
            darkRun.c119a = true;
            if (darkRun.isLeader && database && c119State.answerA == null) {
                database.ref(c119Path()).update({ answerA: Math.floor(Math.random() * 6) + 1 });
            }
        }
        const ans = c119State.answerA;
        const dir = ans <= 3 ? '왼쪽' : '오른쪽';

        build119(role, "기믹 1 — 여섯 개의 거울",
            // 안쪽
            `거울 여섯 개가 늘어서 있다. 다섯 개는 당신을 비춘다.<br>
             <b style="color:#d4af37;">${ans}번째 거울만 아무것도 비추지 않는다.</b> 유리가 아니라 구멍이다.<br><br>
             밖에서는 번호가 안 보일 것이다. 방향과 수를 알려야 한다.<br>
             <span style="font-size:11px; color:#888;">(${dir}에서 ${ans <= 3 ? ans : 7 - ans}번째)</span>`,
            // 바깥
            `늘어선 거울이 여섯. 전부 같아 보인다.<br>
             하나만 통과할 수 있고, 나머지는 손을 대면 유리가 깨진다.<br><br>
             안쪽에서 신호가 올 것이다.`,
            null,
            // 바깥 조작부
            `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:12px;">
                ${[1,2,3,4,5,6].map(n => `<button class="game-btn" style="margin:0; padding:14px 0; font-size:15px; font-weight:bold;" onclick="answer119A(${n})" ${c119State.muted ? '' : ''}>${n}</button>`).join('')}
             </div>
             <button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:10px; font-size:11px; ${c119State.muted ? 'background:linear-gradient(145deg, #7f0000, #4a0000) !important; border-color:#b71c1c !important; color:#fff !important;' : ''}" onclick="toggleC119Mute(${!c119State.muted})">
                ${c119State.muted ? '■ 입력 중단 (상대 발언 허용)' : '▶ 입력 시작 (상대 발언 차단)'}
             </button>`);
    }

       function answer119A(n) {
        if (myC119Role() !== 'outside') return;
        if (!c119State || c119State.answerA == null) return;
        const ok = (n === c119State.answerA);
        if (ok) { darkRun.success++; }
        else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 4);
            if (database) database.ref(c119Path()).update({ wrong: (c119State.wrong || 0) + 1 });
        }
        darkRun.log.push(`[기믹 1] ${n}번 거울 선택 — ${ok ? '적중' : '오답'}`);
        sendPartyChat(ok ? `${n}번 거울을 통과했습니다.` : `${n}번 거울이 깨졌습니다.`, true);

        darkRun._c119Locked = true;
         if (database) database.ref(c119Path()).update({ resultA: { ok: ok, n: n, at: Date.now() } });
        darkBodyEl().innerHTML = darkBox("기믹 1 — 결과",
            ok ? `${n}번 거울에 손을 넣는다. 저항이 없다.<br><br>팔이 통째로 들어간다. 유리가 아니었다.`
               : `${n}번 거울이 소리 없이 갈라진다.<br>조각이 발밑에 떨어지는데, 떨어지는 소리는 한참 뒤에 났다.<br><br>다른 거울들이 조금씩 더 빨리 돌기 시작한다.`,
            (darkRun.isLeader ? darkChoiceBtn("안쪽으로 들어간다.", "c119Advance(3)")
                              : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }
    // --- 기믹 2: 손잡이 순서 ---
    function render119B(role) {
        if (darkRun.isLeader && database && !c119State.answerB) {
            const order = [1,2,3,4].sort(() => Math.random() - 0.5);
            database.ref(c119Path()).update({ answerB: order.join(''), inputB: '' });
        }
        const ansB = c119State.answerB || '';

        build119(role, "기믹 2 — 네 개의 손잡이",
            `벽에 손잡이 넷. 위·아래로 나뉘어 붙어 있다.<br>
             당기는 순서가 정해져 있고, 그 순서가 당신 쪽 벽에만 새겨져 있다.<br><br>
             <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:5px; padding:11px; text-align:center; font-size:20px; font-weight:bold; color:#d4af37; letter-spacing:6px;">
                ${ansB.split('').join(' → ')}
             </div>
             <div style="font-size:11px; color:#888; margin-top:8px;">위쪽 둘은 1·2번, 아래쪽 둘은 3·4번이다.</div>`,
            `손잡이가 넷. 번호는 붙어 있지 않다.<br>
             왼쪽부터 위 두 개가 1·2번, 아래 두 개가 3·4번이라고 짐작할 뿐이다.<br><br>
             순서를 틀리면 처음부터 다시다.`,
            null,
            `<div style="text-align:center; font-size:13px; font-family:monospace; color:var(--theme-focus); font-weight:bold; margin-bottom:10px; min-height:20px; letter-spacing:5px;">
                ${(c119State.inputB || '').split('').join(' ') || '_ _ _ _'}
             </div>
             <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:8px;">
                ${[1,2,3,4].map(n => `<button class="game-btn" style="margin:0; padding:14px 0; font-size:15px; font-weight:bold;" onclick="input119B(${n})">${n}</button>`).join('')}
             </div>
             <button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:9px; font-size:11px;" onclick="clear119B()">입력 초기화</button>
             <button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:10px; font-size:11px; ${c119State.muted ? 'background:linear-gradient(145deg, #7f0000, #4a0000) !important; border-color:#b71c1c !important; color:#fff !important;' : ''}" onclick="toggleC119Mute(${!c119State.muted})">
                ${c119State.muted ? '■ 입력 중단 (상대 발언 허용)' : '▶ 입력 시작 (상대 발언 차단)'}
             </button>`);
    }

        function input119B(n) {
        if (myC119Role() !== 'outside') return;
        let cur = (c119State.inputB || '') + n;
        if (cur.length >= 4) {
            const ok = cur === c119State.answerB;
            if (ok) darkRun.success++;
            else { darkRun.fail++; applyPollutionToUser(currentUser, 4); }
            darkRun.log.push(`[기믹 2] 순서 ${cur} 입력 — ${ok ? '적중' : '오답'}`);
            sendPartyChat(ok ? '손잡이가 순서대로 내려갔습니다.' : '손잡이가 전부 튕겨 올라왔습니다.', true);

            darkRun._c119Locked = true;
            if (database) database.ref(c119Path()).update({ inputB: '', resultB: { ok: ok, at: Date.now() } });
            show119ResultB();
        } else {
            if (database) database.ref(c119Path()).update({ inputB: cur });
        }
    }

    function show119ResultB() {
        const r = c119State.resultB;
        if (!r) return;
        darkRun._c119Locked = true;
        darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
            r.ok ? `네 번째 손잡이가 끝까지 내려간다.<br>벽 안쪽에서 뭔가가 풀리는 소리가 난다.<br><br>거울 하나가 도는 것을 멈췄다.`
                 : `세 번째에서 걸렸다. 손잡이가 전부 튕겨 올라온다.<br><br>천장의 거울들이 일제히 같은 방향으로 돌기 시작한다.<br>전부 당신 쪽을 보고 있다.`,
            (darkRun.isLeader ? darkChoiceBtn("다음 방으로.", "c119Advance(5)")
                              : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }

    function clear119B() {
        if (myC119Role() !== 'outside') return;
        database.ref(c119Path()).update({ inputB: '' });
    }

    // --- 기믹 3: 미니게임 무게추 ---
    function render119C(role) {
        if (darkRun.isLeader && database && c119State.targetC == null) {
            database.ref(c119Path()).update({ targetC: Math.floor(Math.random() * 30) + 35, posC: 0, runC: false });
        }

        build119(role, "기믹 3 — 무게추",
            `천장에서 추가 내려온다. 줄에 눈금이 있다.<br>
             <b style="color:#d4af37;">${c119State.targetC}</b> 눈금에서 멈춰야 바닥의 판이 열린다.<br><br>
             그 이상 내려가면 줄이 끊어진다.<br>
             <span style="font-size:11px; color:#888;">밖에서는 눈금이 보이지 않는다. '가'와 '서'로 맞춰야 한다.</span>`,
            `손잡이를 놓으면 추가 내려간다.<br>눈금은 이쪽에서 보이지 않는다. 얼마나 내려갔는지 알 수 없다.<br><br>
             안쪽의 신호에 맞춰 멈춰야 한다.`,
            null,
            `<div style="text-align:center; margin-bottom:12px;">
                <div style="width:100%; height:14px; background:rgba(0,0,0,0.5); border:1px solid var(--theme-border); border-radius:7px; overflow:hidden; position:relative;">
                    <div id="c119-bar" style="height:100%; width:${(c119State.posC || 0)}%; background:linear-gradient(90deg, #5a4a2a, #d4af37); transition:width 0.08s linear;"></div>
                </div>
                <div style="font-size:10px; color:#888; margin-top:6px;">추는 계속 내려갑니다. 신호가 오면 즉시 멈추세요.</div>
             </div>
            <button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:14px; font-size:13px;" id="c119-start-btn" onclick="start119C()">추를 내린다</button>
             <button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:14px; font-size:13px; background:linear-gradient(145deg, #7f0000, #4a0000) !important; border-color:#b71c1c !important; color:#fff !important;" id="c119-stop-btn" onclick="stop119C()" disabled>멈춘다</button>`);
    }

    let c119Timer = null;
          function start119C() {
        if (myC119Role() !== 'outside') return;
        if (darkRun) darkRun._c119Locked = true;

        const sBtn = document.getElementById('c119-start-btn');
        const eBtn = document.getElementById('c119-stop-btn');
        if (sBtn) sBtn.disabled = true;
        if (eBtn) eBtn.disabled = false;

        let pos = 0;
        clearInterval(c119Timer);
        c119Timer = setInterval(() => {
            pos += 1.2;
            const bar = document.getElementById('c119-bar');
            if (bar) bar.style.width = pos + '%';
            if (darkRun) darkRun._c119LocalPos = Math.round(pos);
            if (pos >= 100) { clearInterval(c119Timer); stop119C(); }
        }, 90);
    }

      function stop119C() {
        if (myC119Role() !== 'outside') return;
        clearInterval(c119Timer);
        const pos = darkRun._c119LocalPos || 0;
        const target = c119State.targetC;
        const diff = Math.abs(pos - target);
        const ok = diff <= 5;
        const over = pos > target + 12;

        if (ok) darkRun.success++;
        else { darkRun.fail++; applyPollutionToUser(currentUser, over ? 6 : 3); }
        darkRun.log.push(`[기믹 3] 무게추 ${pos}/${target} — ${ok ? '적중' : '빗나감'}`);
        sendPartyChat(ok ? '추가 제자리에 멈췄습니다.' : '추가 어긋났습니다.', true);

        darkRun._c119Locked = true;
        if (database) database.ref(c119Path()).update({
            runC: false,
            resultC: { ok: ok, over: over, at: Date.now() }
        });
        show119ResultC();
    }

    function show119ResultC() {
        const r = c119State.resultC;
        if (!r) return;
        darkRun._c119Locked = true;
        darkBodyEl().innerHTML = darkBox("기믹 3 — 결과",
            r.ok ? `추가 멎는다. 눈금이 정확히 맞았다.<br>바닥의 판이 소리 없이 옆으로 밀린다.<br><br>아래로 내려가는 계단이 보인다.`
                 : r.over ? `줄이 끊어졌다.<br>추가 바닥을 치는 소리가 방 전체를 울린다.<br><br>거울 몇 개가 줄에서 떨어져 깨졌다. 깨진 자리마다 뭔가가 서 있다.`
                          : `추가 어중간한 데서 멎었다.<br>판은 열리지 않는다. 다만 아주 조금 벌어졌다.<br><br>그 틈으로 손을 넣어 억지로 벌린다.`,
            (darkRun.isLeader ? darkChoiceBtn("마지막 문으로.", "c119Advance(7)")
                              : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }
    // --- 기믹 4: 자물쇠 ---
    function render119D(role) {
        if (darkRun.isLeader && database && !c119State.answerD) {
            let d = '';
            for (let i = 0; i < 3; i++) d += Math.floor(Math.random() * 3) + 1;
            database.ref(c119Path()).update({ answerD: d, inputD: '' });
        }
        const ansD = c119State.answerD || '';

        build119(role, "기믹 4 — 마지막 문",
            `문에 자물쇠가 걸려 있다. 숫자 세 자리.<br>
             당신 쪽 벽에 세 개의 자국이 있다. 손톱으로 긁어 센 자국이다.<br><br>
             <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:5px; padding:14px; text-align:center;">
                ${ansD.split('').map(n => `<div style="font-size:22px; color:#d4af37; font-weight:bold; letter-spacing:4px; margin:2px 0;">${'|'.repeat(parseInt(n))}</div>`).join('')}
             </div>
             <div style="font-size:11px; color:#888; margin-top:8px;">세 줄, 각각 몇 개인지 세어 전해야 한다.<br>'하나'와 '둘'만으로 수를 만들 수 있다.</div>`,
            `자물쇠 세 자리. 각 자리는 1에서 3 사이다.<br>
             세 번 틀리면 문이 영영 잠긴다고, 문 옆에 적혀 있다.<br><br>
             <span style="color:#ff9800; font-size:11px;">남은 시도: ${3 - (c119State.wrongD || 0)}회</span>`,
            null,
            `<div style="text-align:center; font-size:20px; font-family:monospace; color:var(--theme-focus); font-weight:bold; margin-bottom:12px; letter-spacing:8px; min-height:26px;">
                ${(c119State.inputD || '').split('').join(' ') || '_ _ _'}
             </div>
             <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:8px;">
                ${[1,2,3].map(n => `<button class="game-btn" style="margin:0; padding:16px 0; font-size:17px; font-weight:bold;" onclick="input119D(${n})">${n}</button>`).join('')}
             </div>
             <button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:9px; font-size:11px;" onclick="clear119D()">입력 초기화</button>
             <button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:10px; font-size:11px; ${c119State.muted ? 'background:linear-gradient(145deg, #7f0000, #4a0000) !important; border-color:#b71c1c !important; color:#fff !important;' : ''}" onclick="toggleC119Mute(${!c119State.muted})">
                ${c119State.muted ? '■ 입력 중단 (상대 발언 허용)' : '▶ 입력 시작 (상대 발언 차단)'}
             </button>`);
    }

function input119D(n) {
        if (myC119Role() !== 'outside') return;
        let cur = (c119State.inputD || '') + n;
        if (cur.length >= 3) {
            const ok = cur === c119State.answerD;
            const wrongCount = (c119State.wrongD || 0) + (ok ? 0 : 1);

            if (ok) {
                darkRun.success += 2;
                darkRun.log.push(`[기믹 4] 자물쇠 ${cur} — 해제`);
                sendPartyChat('자물쇠가 풀렸습니다.', true);
                darkRun._c119Locked = true;
                if (database) database.ref(c119Path()).update({
                    inputD: '', wrongD: wrongCount, resultD: { done: true, ok: true, at: Date.now() }
                });
                show119ResultD();
            } else if (wrongCount >= 3) {
                darkRun.fail += 2;
                darkRun.failedRun = true;
                applyPollutionToUser(currentUser, 8);
                darkRun.log.push(`[기믹 4] 자물쇠 ${cur} — 최종 실패`);
                sendPartyChat('자물쇠가 영영 잠겼습니다.', true);
                darkRun._c119Locked = true;
                if (database) database.ref(c119Path()).update({
                    inputD: '', wrongD: wrongCount, resultD: { done: true, ok: false, at: Date.now() }
                });
                show119ResultD();
            } else {
                darkRun.fail++;
                applyPollutionToUser(currentUser, 3);
                darkRun.log.push(`[기믹 4] 자물쇠 ${cur} — 오답 (${wrongCount}/3)`);
                sendPartyChat(`자물쇠가 걸렸습니다. (${3 - wrongCount}회 남음)`, true);
                if (database) database.ref(c119Path()).update({ inputD: '', wrongD: wrongCount });
            }
        } else {
            if (database) database.ref(c119Path()).update({ inputD: cur });
        }
    }

    function clear119D() {
        if (myC119Role() !== 'outside') return;
        database.ref(c119Path()).update({ inputD: '' });
    }

   function show119ResultD() {
        const r = c119State.resultD;
        if (!r) return;
        darkRun._c119Locked = true;
        darkBodyEl().innerHTML = darkBox("기믹 4 — 결과",
            r.ok ? `자물쇠가 손 안에서 열린다.<br>문이 안쪽으로 밀린다.<br><br>거울 안쪽에 있던 사람이 걸어 나온다. 표정이 조금 이상하다.<br>거울 밖에 있던 사람도 같은 생각을 한다.`
                 : `세 번째가 틀렸다.<br>자물쇠가 안쪽으로 빨려 들어가고, 문이 벽이 된다.<br><br>거울들이 전부 멈춘다. 전부 같은 것을 비추고 있다.<br>둘 다 거기 있다. 나란히.`,
            (darkRun.isLeader ? darkChoiceBtn(r.ok ? "밖으로 나간다." : "주저앉는다.", "c119Advance(99)")
                              : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }

       function renderStep087() {
        const body = darkBodyEl();
        const s = darkRun.step;

        if (s === 0) {
            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                darkChoiceBtn("몸을 일으킨다.", "dark087Step1()"), "intro");

        } else if (s === 1) {
            body.innerHTML = darkBox("기믹 1 — 폐관 후",
                `벤치에서 일어선다. 다리가 저리다.<br>전시실은 넓고, 발소리가 대리석 바닥을 타고 한참을 간다.<br><br>입구 쪽 셔터는 바닥까지 내려와 잠겨 있다.<br>비상구 표시등만 초록색으로 남아, 아무도 없는 복도를 비춘다.<br><br>어디서부터 볼까.`,
                darkChoiceBtn("① 비상구 문을 확인해 본다.", "dark087Pick('exit')") +
                darkChoiceBtn("② 안내 데스크를 뒤진다.", "dark087Pick('desk')") +
                darkChoiceBtn("③ 조명 스위치를 찾아 전부 켠다.", "dark087Pick('light')") +
                darkChoiceBtn("④ 곧장 1전시실로 들어간다.", "dark087Pick('hall')"), "step1");

        } else if (s === 2) {
            if (!darkRun.art) {
                const picked = shuffled087(7);
                darkRun.art = picked.map(i => ({ ...ART_PIECES[i], touched:false, clue:"" }));
                darkRun.fakeIdx = Math.floor(Math.random() * darkRun.art.length);
                darkRun.touchLeft = darkRun.hasCatalog ? 4 : 3;
                darkRun.guessLeft = 2;
            }
            renderGallery087();

        } else if (s === 3) {
            const ok = darkRun.correct;
            body.innerHTML = darkBox("기믹 3 — 떼어내기",
                ok ? `찾았다.<br><br>액자에 손을 걸고 벽에서 떼어낸다. 생각보다 무겁다.<br>뒤편은 벽이 아니다. 벽이었던 적이 없는 것 같다.`
                   : `아닌 것 같다. 하지만 더 만질 수는 없다.<br><br>남은 손의 감각을 믿고, 액자 하나에 손을 건다.<br>떼어낸다.`,
                darkChoiceBtn("① 한 번에 힘껏 당긴다.", "dark087Roll('pull')") +
                darkChoiceBtn("② 모서리부터 천천히 들어낸다.", "dark087Roll('slow')") +
                darkChoiceBtn("③ 액자 뒤로 손을 먼저 넣어 본다.", "dark087Roll('reach')"), "step3");

        } else if (s === 99) {
            renderDarkResult();
        }
    }

    function dark087Step1() { darkRun.step = 1; renderDarkStep(); }

    function dark087Pick(pick) {
        let txt = "", mod = 0;
        if (pick === 'exit') {
            txt = `비상구 문을 민다. 밀리지 않는다.<br>당겨도 같다. 경첩도, 손잡이도 멀쩡한데 문만 열리지 않는다.<br><br>표시등의 초록빛이 손등 위에서 미세하게 떨린다.<br>돌아서는데, 등 뒤에서 문이 한 번 덜컹였다.`;
            mod = -1; applyPollutionToUser(currentUser, 2);
        } else if (pick === 'desk') {
            txt = `안내 데스크 서랍을 연다.<br>볼펜, 마른 물티슈, 그리고 얇은 도록 한 부.<br><br>펼쳐 본다. 이번 전시 출품작은 일곱 점.<br>일곱 점의 제목이 차례로 적혀 있고, 그 아래에 손글씨로 한 줄이 덧붙어 있다.<br><br><span style="color:#d4af37;">"여덟 번째는 대장되지 않았음."</span>`;
            mod = 1; darkRun.hasCatalog = true;
        } else if (pick === 'light') {
            txt = `배전반을 찾아 스위치를 전부 올린다.<br>전시실이 한꺼번에 밝아진다. 눈이 아프도록 환하다.<br><br>그림들이 아주 선명하게 보인다.<br>선명해진 김에, 그림들도 이쪽을 아주 선명하게 보고 있는 것 같다.<br><br>밝긴 하다. 밝기만 하다.`;
            mod = 0; applyPollutionToUser(currentUser, 3);
        } else {
            txt = `아무것도 하지 않고 1전시실로 걸어 들어간다.<br>벽을 따라 액자가 일곱, 균등한 간격으로 걸려 있다.<br><br>그림들은 움직이지 않는다.<br>처음부터 지금까지, 단 한 번도.`;
            mod = 0;
        }
        darkRun.modifier += mod;
        darkRun.log.push(`[기믹 1] ${pick === 'exit' ? '비상구' : pick === 'desk' ? '안내 데스크' : pick === 'light' ? '조명 점등' : '즉시 입장'} 선택`);
        darkBodyEl().innerHTML = darkBox("기믹 1 — 결과", txt,
            darkChoiceBtn("전시실로 들어선다.", "darkRun.step=2; renderDarkStep();"));
    }

    function renderGallery087(msg) {
        const body = darkBodyEl();
        let grid = darkRun.art.map((p, i) => {
            const done = p.touched;
            return `
                <div style="border:1px solid ${done ? '#5a4a2a' : '#2a2a2a'}; background:${done ? 'rgba(90,74,42,0.12)' : 'rgba(0,0,0,0.35)'}; border-radius:5px; padding:9px 10px; margin-bottom:7px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; color:#ddd; font-weight:bold;">${p.t}</div>
                            <div style="font-size:10px; color:#777; margin-top:2px;">${p.a}</div>
                            ${done ? `<div style="font-size:11px; color:#c9a86a; margin-top:7px; line-height:1.7;">${p.clue}</div>` : ''}
                        </div>
                        <div style="flex-shrink:0; display:flex; flex-direction:column; gap:4px;">
                            ${done
                                ? `<div style="font-size:10px; color:#666; text-align:center; padding-top:4px;">확인함</div>`
                                : `<button class="game-btn" style="margin:0; padding:6px 10px; font-size:10px;" onclick="dark087Touch(${i})">만진다</button>`}
                            <button class="game-btn" style="margin:0; padding:6px 10px; font-size:10px; background:linear-gradient(145deg, #7f0000, #4a0000) !important; border-color:#b71c1c !important; color:#fff !important;" onclick="dark087Guess(${i})">지목</button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        body.innerHTML = darkBox("기믹 2 — 감식",
            `일곱 점이 벽을 따라 걸려 있다. 전부 얌전하다.<br>이 중 하나는 그림이 아니다.<br><br>만져 보면 알 수 있다. 다만 손을 댈 때마다 무언가가 조금씩 옮겨 붙는다.<br><span style="color:#888; font-size:11px;">[남은 접촉 ${darkRun.touchLeft}회 · 지목 기회 ${darkRun.guessLeft}회 · 접촉 1회당 오염도 +2]</span>
             ${msg ? `<div style="margin-top:12px; padding-top:10px; border-top:1px dashed #333; color:#ff9800;">${msg}</div>` : ''}`,
            grid, "step2");
    }

    function dark087Touch(i) {
        if (darkRun.touchLeft <= 0) { renderGallery087(`더는 손을 댈 수 없다. 손끝 감각이 남아 있지 않다.`); return; }
        const p = darkRun.art[i];
        if (p.touched) return;

        p.touched = true;
        darkRun.touchLeft--;
        applyPollutionToUser(currentUser, 2);

        if (i === darkRun.fakeIdx) {
            p.clue = FAKE_CLUES[Math.floor(Math.random() * FAKE_CLUES.length)];
            darkRun.foundHint = true;
        } else {
            p.clue = p.real;
        }
        darkRun.log.push(`[기믹 2] ${p.t} 접촉`);
        renderGallery087();
    }

    function dark087Guess(i) {
        const p = darkRun.art[i];
        const isRight = (i === darkRun.fakeIdx);

        if (isRight) {
            darkRun.correct = true;
            darkRun.success++;
            darkRun.log.push(`[기믹 2] ${p.t} 지목 — 적중`);
           darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
                `${p.t} 앞에 선다.<br><br>액자에 두 손을 얹는 순간, 그림이 아주 조금 이쪽으로 기운다.<br>밀린 것이 아니다. 기댄 것이다.<br><br>이거다.`,
                darkChoiceBtn("액자를 떼어낸다.", "darkRun.step=3; renderDarkStep();"));
            return;
        }

        darkRun.guessLeft--;
        applyPollutionToUser(currentUser, 3);
        darkRun.log.push(`[기믹 2] ${p.t} 지목 — 빗나감`);

        if (darkRun.guessLeft > 0) {
            renderGallery087(`${p.t} 앞에 선다. 아무 일도 일어나지 않는다.<br>그냥 그림이다. 뒤에서 누가 웃은 것 같지만, 돌아보지 않는다. <b>(지목 ${darkRun.guessLeft}회 남음)</b>`);
        } else {
            darkRun.correct = false;
            darkRun.fail++;
           darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
                `두 번 다 틀렸다.<br><br>손끝이 얼얼하다. 어느 것이 무엇이었는지 이제 구분이 가지 않는다.<br>남은 건 감뿐이다.`,
                darkChoiceBtn("아무 액자에나 손을 건다.", "darkRun.step=3; renderDarkStep();"));
        }
    }

    function dark087Roll(pick) {
                if (consumeQFlag('force_open')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("돌파",
                `못을 끼워 넣는다. 몇 번 흔들자 걸린 것이 풀린다.<br><br>생각보다 쉬웠다. 애초에 잠겨 있지 않았던 것 같기도 하다.`,
                darkChoiceBtn("지나간다.", `partyAdvance(${darkRun.step + 1})`));
            mountDarkChat('normal');
            return;
        }
        const roll = Math.floor(Math.random()*20) + 1;
        let bonus = rollDarkBonus('sense');
        if (currentUser.darkCatalogBonus) { bonus += 2; currentUser.darkCatalogBonus = false; }
        const total = roll + bonus;

        let DC = (pick === 'pull') ? 9 : (pick === 'slow') ? 11 : 13;
        if (!darkRun.correct) DC += 4;
        DC -= gearValue(currentUser, 'break');

        let outcome, txt;
        if (roll === 20) outcome = 'crit';
        else if (roll === 1) outcome = 'fumble';
        else outcome = (total >= DC) ? 'pass' : 'fail';

        if (outcome === 'crit') {
            darkRun.success += 2; darkRun.critical = true;
            txt = `액자가 벽에서 떨어져 나온다.<br>그 뒤에 있던 것은 벽이 아니라 깊이였다.<br><br>안쪽에서 아주 얕은 숨소리가 한 번 나고, 그걸로 끝이었다.<br>바닥에 뭔가가 떨어져 구른다. 주워 든다.`;
        } else if (outcome === 'pass') {
            darkRun.success++;
            txt = pick === 'pull'
                ? `한 번에 당긴다. 뭔가가 짧게 찢어지는 소리가 나고 액자가 손에 딸려 온다.<br>벽에는 아무 자국도 남지 않았다.<br><br>깔끔하게 끝났다.`
                : pick === 'slow'
                ? `모서리부터 조금씩 들어낸다.<br>벽과 액자 사이에서 미지근한 공기가 새어 나온다.<br><br>서두르지 않은 것이 다행이었다.`
                : `액자 뒤로 손을 넣는다. 손등에 뭔가가 스친다.<br>잡지 않고, 그냥 밀어낸다.<br><br>액자가 벽에서 떨어진다. 손은 무사하다.`;
        } else if (outcome === 'fail') {
            darkRun.fail++; applyPollutionToUser(currentUser, 4);
            txt = `떼어내기는 했다.<br>다만 손바닥에 캔버스 결이 그대로 찍혀 남았다.<br><br>문질러도 지워지지 않는다.`;
        } else {
            darkRun.fail += 2; applyPollutionToUser(currentUser, 8);
            appendBadgeNoteToUser(currentUser, `[Qtrew-D-087] 손바닥에 캔버스 결이 남음`);
            txt = `액자를 잡은 손이 안쪽으로 끌려 들어간다.<br>팔꿈치까지 들어갔다가, 무언가 흥미를 잃은 것처럼 놓아준다.<br><br>빠져나온 손은 분명 내 손인데, 결이 있다.`;
        }

        darkRun.log.push(`[기믹 3] d20 판정 ${roll}(+${bonus}) vs DC${DC} — ${outcome}`);

        let rerollBtn = '';
        if ((outcome === 'fail' || outcome === 'fumble') && !darkRun.rerollUsed && darkRun.carryItems.length > 0) {
            rerollBtn = darkChoiceBtn(`🔁 소모품 '${darkRun.carryItems[0]}'을(를) 써서 다시 굴린다. (1회)`, `dark087Reroll('${pick}')`);
        }

        darkBodyEl().innerHTML = darkBox("기믹 3 — 판정",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${outcome==='crit'?'#4CAF50':outcome==='fumble'?'#f44336':'#ffd700'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            rerollBtn + darkChoiceBtn("발밑이 기울기 시작한다.", "darkRun.step=99; renderDarkStep();"));
    }

    function dark087Reroll(pick) {
        const used = darkRun.carryItems.shift();
        darkRun.rerollUsed = true;
        darkRun.lostItems.push(used);
        removeItemFromInventory(currentUser, used, 1);
        darkRun.fail = Math.max(0, darkRun.fail - 1);
        dark087Roll(pick);
    }
    
    // ==========================================
    // ★ 기억 퀴즈 (단답형)
    // ==========================================
    const B330_QUIZ = {
        1: {
            q: `벽에 붙어 있던 근무 수칙은 모두 몇 조였는가?`,
            hint: `숫자로 입력`,
            answers: ['4', '4조', '사', '네', '넷']
        },
        2: {
            q: `벽에 세어놓은 작대기 자국은 몇 묶음이었는가?`,
            hint: `숫자로 입력`,
            answers: ['6', '6묶음', '여섯', '육']
        },
        3: {
            q: `안내판 뒷면에 눌러 쓴 글씨는 무엇이었는가?`,
            hint: `세 글자`,
            answers: ['세지마라', '세지마', '세지말것', '세지마시오']
        }
    };

    // 느슨한 정답 비교 (공백·문장부호·대소문자 무시)
    function normalizeAnswer(s) {
        return String(s || '')
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[.,!?~'"·\-_]/g, '')
            .trim();
    }

    function checkQuizAnswer(input, answers) {
        const v = normalizeAnswer(input);
        if (!v) return false;
        return answers.some(a => normalizeAnswer(a) === v);
    }

    function renderQuizStep(n) {
        const body = darkBodyEl();
        const data = B330_QUIZ[n];
        if (!data) { partyAdvance(darkRun.step + 1); return; }

        const done = darkRun[`quiz${n}Done`];
        if (done) {
            body.innerHTML = darkBox("기억",
                `${data.q}<br><br><span style="color:${done === 'ok' ? '#4CAF50' : '#f44336'};">${done === 'ok' ? '기억하고 있었다.' : '기억나지 않았다.'}</span>`,
                (darkRun.isLeader
                    ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                        : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
            mountDarkChat('normal');
            return;
        }

        body.innerHTML = darkBox("기억",
            `걸음이 멎는다.<br><br>벽이 앞을 막았다. 막다른 길은 아닌데, 더 갈 수가 없다.<br>벽에 글자가 떠오른다. 손으로 쓴 것처럼 한 획씩.<br><br><span style="color:#d4af37; font-size:13px;">${data.q}</span><br><br>
             <span style="font-size:11px; color:#888;">각자 답을 적어야 한다. 틀린 사람만 대가를 치른다.<br>오답이 세 번 쌓이면 미로가 당신을 잊는다.</span>`,
            `<div style="margin-bottom:10px;">
                <input type="text" id="quiz-input" maxlength="30" placeholder="${data.hint}"
                    style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box;"
                    onkeypress="if(event.key==='Enter') submitQuiz(${n})">
             </div>
             <button class="game-btn" style="width:100%; margin:0; padding:13px;" onclick="submitQuiz(${n})">적어 낸다</button>
             <div style="text-align:center; font-size:10px; color:#666; margin-top:9px;">
                누적 오답 <b style="color:${(darkRun.quizWrong||0) >= 2 ? '#ff6b6b' : '#888'};">${darkRun.quizWrong || 0}</b> / 3
             </div>`);
        mountDarkChat('normal');
    }

    function submitQuiz(n) {
        const el = document.getElementById('quiz-input');
        if (!el) return;
        const val = el.value.trim();
        if (!val) { showCustomAlert('답을 적어 주세요.'); return; }

        const data = B330_QUIZ[n];
        const ok = checkQuizAnswer(val, data.answers);

        if (ok) {
            darkRun[`quiz${n}Done`] = 'ok';
            darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
            darkRun.log.push(`[퀴즈 ${n}] 정답`);
            sendPartyChat(`${currentUser.name} 사원이 기억해 냈습니다.`, true);
               } else {

            if (consumeQFlag('quiz_undo')) {
                darkRun[`quiz${n}Done`] = 'ok';
                darkRun.success++;
                sendPartyChat(`${currentUser.name} 사원이 답을 고쳐 적었습니다.`, true);
                renderQuizStep(n);
                return;
            }
            // ★ 감각이 높으면 오답을 한 번 무를 수 있다
            const gazeVal = gearValue(currentUser, 'gaze');
            const senseVal = gearValue(currentUser, 'sense');
            if ((gazeVal >= 3 || senseVal >= 3) && !darkRun._senseSaved) {
                darkRun._senseSaved = true;
                darkRun[`quiz${n}Done`] = 'ok';
                darkRun.success++;
                darkRun.log.push(`[퀴즈 ${n}] 감각으로 떠올림`);
                sendPartyChat(`${currentUser.name} 사원이 뒤늦게 기억해 냈습니다.`, true);
                renderQuizStep(n);
                return;
            }

            

            darkRun[`quiz${n}Done`] = 'no';
            darkRun.fail++;
            darkRun.quizWrong = (darkRun.quizWrong || 0) + 1;
            applyPollutionToUser(currentUser, 6);
            darkRun.log.push(`[퀴즈 ${n}] 오답 (${val})`);
            sendPartyChat(`${currentUser.name} 사원이 답하지 못했습니다.`, true);

            if (darkRun.quizWrong >= 3) {
                darkRun.dying = 'quiz';
                renderRescueScene('quiz');
                return;
            }
        }
        renderQuizStep(n);
    }

        // ==========================================
    // ★ 침묵 구간 — 바닥이 꺼진다
    // ==========================================
    function renderSilentWalk() {
        const body = darkBodyEl();
        body.innerHTML = darkBox("—",
            `<div id="silent-dots" style="text-align:center; font-size:26px; color:#444; letter-spacing:10px; padding:40px 0; min-height:120px;">…</div>`,
            `<div id="silent-btn" style="opacity:0; transition:opacity 0.4s;"></div>`);
        mountDarkChat('normal');

        const dots = document.getElementById('silent-dots');
        const seq = ['…', '… …', '… … …', '… … … …', '… … … … …'];
        let i = 0;
        const t = setInterval(() => {
            if (!darkRun || !document.getElementById('silent-dots')) { clearInterval(t); return; }
            i++;
            if (i < seq.length) {
                dots.innerText = seq[i];
            } else {
                clearInterval(t);
                triggerFloorCollapse();
            }
        }, 2200);
    }

    function triggerFloorCollapse() {
        const body = darkBodyEl();
        if (!body || !darkRun) return;

        // 방장이 희생자를 정한다
        if (darkRun.isLeader && database) {
            const p = darkParties[darkRun.partyId];
            const alive = p && p.alive ? Object.keys(p.alive) : [currentUser.code];
            const victim = alive[Math.floor(Math.random() * alive.length)];
            database.ref(`darkParties/${darkRun.partyId}/collapse`).set({
                victim: victim,
                name: (p && p.members && p.members[victim]) ? p.members[victim].name : '누군가',
                at: Date.now()
            });
        }

        // 결과 대기
        if (database) {
            database.ref(`darkParties/${darkRun.partyId}/collapse`).once('value').then(sn => {
                const c = sn.val();
                setTimeout(() => showCollapseResult(c), 700);
            });
        }

        body.innerHTML = darkBox("—",
            `<div style="text-align:center; font-size:26px; color:#666; letter-spacing:10px; padding:40px 0;">… … … … …</div>`,
            `<div style="text-align:center; font-size:11px; color:#555;">발소리만 계속된다.</div>`);
    }

    function showCollapseResult(c) {
        if (!c || !darkRun) return;
        const isMe = c.victim === currentUser.code;
        const body = darkBodyEl();

        if (isMe) {
            darkRun.solo = true;
            darkRun.soloReason = 'collapse';
            if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({
                name: currentUser.name, at: Date.now(), step: darkRun.step
            });
            body.innerHTML = darkBox("추락",
                `바닥이 없다.<br><br>디딜 자리가 있다고 생각한 곳에 아무것도 없었다.<br>떨어지는 동안 위를 본다. 네모난 구멍이 빠르게 작아진다.<br>일행의 얼굴이 잠깐 보였다가 사라진다.<br><br>등부터 닿는다. 숨이 멎었다가 돌아온다.<br>아프긴 한데, 죽을 정도는 아니다.<br><br>혼자다.`,
                darkChoiceBtn("일어선다.", "renderSoloStep();"));
        } else {
            body.innerHTML = darkBox("추락",
                `<b style="color:#ff6b6b;">${c.name}</b> 사원이 사라졌다.<br><br>소리도 없었다. 옆에 있다가 그냥 없어졌다.<br>돌아보니 바닥에 네모난 구멍이 있다.<br>아래는 보이지 않는다.<br><br>부르면 대답이 올 것 같지만, 부르지 않기로 한다.<br>여기서 소리를 내면 안 된다는 걸 다들 알고 있다.`,
                (darkRun.isLeader
                    ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                        : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
        }
        mountDarkChat('normal');
        sendPartyChat(`${c.name} 사원이 바닥 아래로 사라졌습니다.`, true);
    }

        // ==========================================
    // ★ 강제 실종 (무작위 지목 + d20 저항)
    // ==========================================
    function renderAbduction(round) {
        const body = darkBodyEl();
        const key = `abduct${round}`;

        // 방장이 대상을 정한다
        if (darkRun.isLeader && database && !darkRun[`_${key}Set`]) {
            darkRun[`_${key}Set`] = true;
            const p = darkParties[darkRun.partyId];
            const alive = p && p.alive ? Object.keys(p.alive).filter(c => !(p.solo || {})[c]) : [currentUser.code];
            if (alive.length > 0) {
                const target = alive[Math.floor(Math.random() * alive.length)];
                database.ref(`darkParties/${darkRun.partyId}/${key}`).set({
                    target: target,
                    name: (p && p.members && p.members[target]) ? p.members[target].name : '누군가',
                    at: Date.now()
                });
            }
        }

        if (!database) { partyAdvance(darkRun.step + 1); return; }

        database.ref(`darkParties/${darkRun.partyId}/${key}`).on('value', (sn) => {
            const a = sn.val();
            if (!a || !darkRun) return;
            if (darkRun[`_${key}Shown`]) return;
            darkRun[`_${key}Shown`] = true;

            const isMe = a.target === currentUser.code;
            if (isMe) {
                body.innerHTML = darkBox("—",
                    `어깨에 무게가 걸린다.<br><br>손이다. 뒤에서. 일행은 전부 앞에 있다.<br>돌아볼 새도 없이 끌린다. 발이 바닥에서 뜬다.<br><br>버틸 수 있을까.`,
                    darkChoiceBtn("버틴다.", `resistAbduction(${round})`));
            } else {
                body.innerHTML = darkBox("—",
                    `<b style="color:#ff6b6b;">${a.name}</b> 사원이 뒤로 끌려간다.<br><br>비명은 없다. 소리를 낼 틈이 없었다.<br>손을 뻗기엔 이미 멀다.<br><br>기다리는 수밖에 없다.`,
                    `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">상황을 지켜보는 중...</div>`);
            }
            mountDarkChat('normal');
        });
    }

    function resistAbduction(round) {
                if (consumeQFlag('no_mark')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("—",
                `명찰을 내민다.<br><br>손이 멈춘다. 이름이 목록에 없는 모양이다.<br>다른 쪽으로 간다.`,
                darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            mountDarkChat('normal');
            return;
        }
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
                let bonus = rollDarkBonus('hide');
        const total = roll + bonus;
         const DC = 17;

        let txt, taken = false;
        if (roll === 1) {
            taken = true;
            txt = `버틸 틈도 없었다.<br>발이 완전히 떴고, 통로가 뒤로 흘러간다.<br><br>일행의 뒷모습이 점점 작아진다. 아무도 돌아보지 않았다.`;
            applyPollutionToUser(currentUser, 8);
        } else if (total >= DC) {
            txt = `벽을 짚고 버틴다. 손톱이 벗겨진다.<br><br>어깨의 무게가 사라진다. 놓아준 게 아니라 흥미를 잃은 것 같다.<br><br>돌아보니 아무도 없다. 일행도 아직 앞에 있다.`;
            darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
        } else {
            taken = true;
            txt = `버텨 보지만 소용없다.<br>바닥이 미끄럽다. 애초에 잡을 것이 없었다.<br><br>끌려간 자리에 신발 한 짝이 남았다.`;
            applyPollutionToUser(currentUser, 5);
        }

        darkRun.log.push(`[실종 ${round}] d20 ${roll}(+${bonus}) vs DC${DC} — ${taken ? '끌려감' : '저항'}`);

        if (taken) {
            darkRun.solo = true;
            darkRun.soloReason = 'abduct';
            darkRun.fail++;
            if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({
                name: currentUser.name, at: Date.now(), step: darkRun.step
            });
            sendPartyChat(`${currentUser.name} 사원이 끌려갔습니다.`, true);
        } else {
            sendPartyChat(`${currentUser.name} 사원이 버텨 냈습니다.`, true);
        }

        darkBodyEl().innerHTML = darkBox("—",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${taken ? '#f44336' : '#4CAF50'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            taken
                ? darkChoiceBtn("일어선다.", "renderSoloStep();")
                : (darkRun.isLeader
                    ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                        : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
        mountDarkChat('normal');
    }

        // ==========================================
    // ★ 구제 — 죽기 직전 동료가 살릴 수 있다 (3종)
    // ==========================================
    const RESCUE_OPTIONS = [
        {
            id: 'hand',
            label: '① 손을 뻗는다.',
            warn: '실패하면 당신도 함께 끌려갑니다.',
            desc: '가장 빠르지만 가장 위험하다.'
        },
        {
            id: 'item',
            label: '② 반입한 소모품을 던진다.',
            warn: '소모품 1개를 잃습니다. 없으면 시도할 수 없습니다.',
            desc: '확실하지만 대가가 있다.'
        },
        {
            id: 'name',
            label: '③ 이름을 부른다.',
            warn: '미로가 당신을 기억하게 됩니다. 이후 판정이 불리해집니다.',
            desc: '되돌릴 수는 있다. 대신 표적이 바뀐다.'
        }
    ];

    function renderRescueScene(reason) {
        if (!darkRun) return;

        // 위험 상태를 파티에 알린다
        if (darkRun.isParty && database) {
            database.ref(`darkParties/${darkRun.partyId}/dying/${currentUser.code}`).set({
                name: currentUser.name, reason: reason, at: Date.now()
            });
            sendPartyChat(`⚠ ${currentUser.name} 사원이 위험합니다.`, true);
        }

        const body = darkBodyEl();
        const txt = reason === 'quiz'
            ? `세 번째다.<br><br>기억나지 않는다는 것을 미로가 알아차렸다.<br>벽이 가까워진다. 아니, 당신이 옅어지고 있다.<br><br>손끝부터 윤곽이 흐려진다.`
            : `힘이 빠진다.<br><br>여기까지인 것 같다.<br>통로가 멀어지고, 소리가 먼저 사라진다.`;

        body.innerHTML = darkBox("위험", txt,
            darkRun.isParty
                ? `<div style="text-align:center; font-size:11px; color:#ff6b6b; padding:14px; background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px;">
                       동료의 도움을 기다리는 중...<br>
                       <span style="font-size:10px; color:#888;">아무도 손을 뻗지 않으면 사라집니다.</span>
                   </div>
                   <button class="game-btn" style="width:100%; margin:12px 0 0 0; padding:11px; font-size:11px;" onclick="giveUpDying()">기다리지 않는다.</button>`
                : darkChoiceBtn("눈을 감는다.", "confirmDeath()"));
        mountDarkChat('normal');

        if (darkRun.isParty) startDyingTimer();
    }

    let dyingTimer = null;
    function startDyingTimer() {
        clearTimeout(dyingTimer);
        dyingTimer = setTimeout(() => {
            if (darkRun && darkRun.dying) confirmDeath();
               }, 90000);
    }

    function giveUpDying() { confirmDeath(); }

       function confirmDeath() {
        clearTimeout(dyingTimer);
        if (darkRun && darkRun.isParty && database) {
            database.ref(`darkParties/${darkRun.partyId}/dying/${currentUser.code}`).remove();
            // ★ 죽기 전에 방장이면 즉시 위임
            if (darkRun.isLeader) {
                const p = darkParties[darkRun.partyId];
                const alive = (p && p.alive) ? Object.keys(p.alive).filter(c => c !== currentUser.code) : [];
                if (alive.length > 0 && p.members && p.members[alive[0]]) {
                    database.ref(`darkParties/${darkRun.partyId}`).update({
                        leader: alive[0], leaderName: p.members[alive[0]].name
                    });
                }
            }
            database.ref(`darkParties/${darkRun.partyId}/alive/${currentUser.code}`).remove();
        }
        darkDeath(`더 버티지 못했다.<br><br>미로는 당신을 아주 정확히 기억하게 되었다.`);
    }

    // --- 구조하는 쪽 화면 ---
    function watchDyingMembers() {
        if (!darkRun || !darkRun.isParty || !database) return;
        if (darkRun._dyingWatch) return;
        darkRun._dyingWatch = true;

        database.ref(`darkParties/${darkRun.partyId}/dying`).on('value', (sn) => {
            if (!darkRun) return;
            const list = sn.val() || {};
            const others = Object.keys(list).filter(c => c !== currentUser.code);
            if (others.length === 0) return;
            if (darkRun._rescueShown) return;
            darkRun._rescueShown = true;
            renderRescuePrompt(list[others[0]], others[0]);
        });
    }

    function renderRescuePrompt(info, code) {
        const body = darkBodyEl();
        const hasItem = (darkRun.carryItems || []).length > 0;

        body.innerHTML = darkBox("구조",
            `<b style="color:#ff6b6b;">${info.name}</b> 사원의 윤곽이 흐려지고 있다.<br><br>
             이대로 두면 몇 초 안에 사라진다.<br>
             손을 쓸 수 있는 방법이 셋 있고, 전부 대가가 있다.<br><br>
             <span style="color:#ff9800; font-size:11px;">⚠ 선택하기 전에 경고를 읽으세요.</span>`,
            RESCUE_OPTIONS.map(o => {
                const locked = (o.id === 'item' && !hasItem);
                return `
                    <div style="border:1px solid ${locked ? '#333' : '#7f0000'}; border-radius:6px; padding:11px; margin-bottom:9px; ${locked ? 'opacity:0.4;' : ''}">
                        <div style="font-size:12px; color:var(--theme-text); font-weight:bold;">${o.label}</div>
                        <div style="font-size:10px; color:#888; margin:4px 0 6px 0;">${o.desc}</div>
                        <div style="font-size:10px; color:#ff6b6b; margin-bottom:8px;">⚠ ${o.warn}</div>
                        <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;" onclick="attemptRescue('${o.id}','${code}')" ${locked ? 'disabled' : ''}>
                            ${locked ? '소모품 없음' : '시도한다'}
                        </button>
                    </div>`;
            }).join('') +
                        `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:11px; font-size:11px;" onclick="abandonRescue('${code}')">보고만 있는다.</button>` +
            `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:10px; font-size:10px;" onclick="darkRun._rescueShown=false; partyAdvance(darkRun.step + 1);">먼저 간다</button>`);
        mountDarkChat('normal');
    }

    function attemptRescue(kind, code) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        let bonus = rollDarkBonus('hide');
                let DC = { hand: 8, item: 5, name: 7 }[kind];
        DC -= Math.round(gearValue(currentUser, 'heal') * 12);
        if (DC < 2) DC = 2;
        const total = roll + bonus;
        const ok = (roll !== 1) && (total >= DC);

        let txt = '';

        if (kind === 'item') {
            const used = darkRun.carryItems.shift();
            darkRun.lostItems.push(used);
            removeItemFromInventory(currentUser, used, 1);
        }

        if (ok) {
            darkRun.success++;
            if (kind === 'hand') txt = `손을 뻗는다. 잡힌다.<br><br>끌어당기는 순간 무게가 두 배로 느껴지다가, 갑자기 가벼워진다.<br>놓아준 것이다.<br><br>둘 다 바닥에 주저앉는다.`;
            else if (kind === 'item') txt = `가지고 있던 것을 던진다.<br><br>그것이 바닥에 닿는 순간, 흐려지던 윤곽이 멈춘다.<br>미로가 잠시 다른 데 관심을 돌렸다.`;
            else {
                txt = `이름을 부른다. 또박또박.<br><br>부르는 순간 벽이 이쪽을 향한다.<br>사라지던 쪽이 선명해지고, 부른 쪽이 흐려진다.<br><br>교환된 것이다.`;
                darkRun.modifier = (darkRun.modifier || 0) - 2;
                darkRun.marked = true;
            }
            if (database) database.ref(`darkParties/${darkRun.partyId}/dying/${code}`).remove();
            sendPartyChat(`${currentUser.name} 사원이 동료를 붙잡았습니다.`, true);
        } else {
            darkRun.fail++;
                                   if (kind === 'hand') {
                const healSave = gearValue(currentUser, 'heal') > 0;
                const bondSave = gearValue(currentUser, 'bond') > 0;
                if (healSave || darkRun._rescueChain) {
                    txt = `손을 뻗는다. 끌려가는 힘이 세다.<br><br>버티지 못하고 놓쳤다.<br>다만 당신까지 딸려 들어가지는 않았다.`;
                    applyPollutionToUser(currentUser, 6);
                } else {
                    darkRun._rescueChain = true;
                    txt = `손을 뻗는다. 닿는다.<br><br>그런데 끌려가는 쪽이 더 세다.<br>발이 미끄러지고, 같이 딸려 들어간다.`;
                    darkRun.dying = 'rescue';
                    applyPollutionToUser(currentUser, 10);
                    darkBodyEl().innerHTML = darkBox("구조 — 실패",
                        `<div style="text-align:center; font-size:26px; font-weight:bold; color:#f44336; margin-bottom:12px;">🎲 ${roll}</div>${txt}`,
                        darkChoiceBtn("놓지 않는다.", "renderRescueScene('rescue')"));
                    mountDarkChat('normal');
                    return;
                }
            }
            else if (kind === 'item') txt = `던진 것이 허공에서 사라진다.<br><br>바닥에 닿지 않았다. 애초에 바닥이 없었는지도 모른다.<br><br>흐려지는 속도가 조금 빨라졌다.`;
            else {
                txt = `이름을 부른다.<br><br>벽이 이쪽을 향한다. 그런데 사라지던 쪽은 그대로다.<br>표적만 늘었다.`;
                darkRun.modifier = (darkRun.modifier || 0) - 2;
                darkRun.marked = true;
            }
            applyPollutionToUser(currentUser, 6);
            sendPartyChat(`${currentUser.name} 사원의 시도가 빗나갔습니다.`, true);
        }

        darkRun.log.push(`[구조] ${kind} d20 ${roll} vs DC${DC} — ${ok ? '성공' : '실패'}`);
        darkRun._rescueShown = false;

        darkBodyEl().innerHTML = darkBox(ok ? "구조 — 성공" : "구조 — 실패",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            (darkRun.isLeader
                ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`));
        mountDarkChat('normal');
    }

    function abandonRescue(code) {
        darkRun._rescueShown = false;
        darkRun.log.push(`[구조] 시도하지 않음`);
        sendPartyChat(`${currentUser.name} 사원은 움직이지 않았습니다.`, true);
        darkBodyEl().innerHTML = darkBox("구조",
            `움직이지 않는다.<br><br>흐려지는 쪽을 본다. 눈이 마주친다.<br>원망하는 눈은 아니었다. 그게 더 남는다.<br><br>완전히 사라질 때까지 3초쯤 걸렸다.`,
            (darkRun.isLeader
                ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                         
                       </div>`));
                    
        mountDarkChat('normal');
    }



        // --- 기믹 5: 벽이 좁혀온다 ---
    function b330Gimmick7() {
        renderChoiceStep("기믹 5 — 좁혀오는 벽",
            `양쪽 벽이 동시에 움직인다.<br><br>아까처럼 주기적인 게 아니다. 멈추지 않고 계속 좁아진다.<br>앞쪽에 문이 하나 보이는데, 거기까지 거리가 애매하다.<br><br>벽에 눌린 자국들이 있다. 사람 모양이다. 여러 개다.`,
            [
                { id:'run',   label:'① 전력으로 달린다.',           fn:'b330G5R', arg:'run' },
                { id:'brace', label:'② 벽을 밀어 버틴다.',           fn:'b330G5R', arg:'brace' },
                { id:'crawl', label:'③ 바닥에 엎드려 기어간다.',     fn:'b330G5R', arg:'crawl' },
                { id:'back',  label:'④ 뒤로 물러난다.',             fn:'b330G5R', arg:'back' }
            ], null);
    }

    function b330G5R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        let bonus = rollDarkBonus('sense');
        const total = roll + bonus;
        const DC = { run: 14, brace: 19, crawl: 16, back: 17 }[pick] - gearValue(currentUser, 'break');

        let txt, died = false;

        if (roll === 1) {
            died = true;
            txt = `늦었다.<br><br>양쪽이 닿는다. 소리는 나지 않았다.<br>벽이 다시 열렸을 때, 자국이 하나 늘어 있었다.`;
        } else if (total >= DC) {
            darkRun.success++;
            txt = pick === 'run' ? `달린다. 문턱을 넘는 순간 뒤에서 벽이 맞물린다.<br><br>발뒤꿈치가 스쳤다. 그걸로 끝이었다.`
                : pick === 'brace' ? `벽을 민다. 밀린다. 실제로 밀린다.<br><br>버티는 동안 일행이 지나간다. 마지막으로 손을 놓고 빠져나온다.`
                : pick === 'crawl' ? `엎드린다. 바닥 쪽이 덜 좁아진다.<br><br>기어서 빠져나온다. 옷이 찢어졌지만 몸은 무사하다.`
                : `물러난다. 벽이 따라오지 않는다.<br><br>기다렸다가 다시 진입하니 통로가 원래대로다.<br>시간을 잃었을 뿐이다.`;
        } else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 9);
            txt = `가까스로 빠져나온다.<br><br>갈비뼈 쪽이 아프다. 숨을 깊게 쉬면 더 아프다.<br>뒤를 보니 벽이 완전히 맞물려 있다.`;
            if ((darkRun.fail || 0) >= 5) {
                darkRun.dying = 'wall';
                darkRun.log.push(`[기믹 5] d20 ${roll} — 치명`);
                renderRescueScene('wall');
                return;
            }
        }

        darkRun.log.push(`[기믹 5] ${pick} d20 ${roll}(+${bonus}) vs DC${DC}`);

        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 5 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${total>=DC?'#4CAF50':'#ff9800'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            (darkRun.isLeader || !darkRun.isParty)
                ? darkChoiceBtn("계속 간다.", "partyAdvance(18)")
                                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`);
        mountDarkChat('normal');
    }

    // --- 기믹 6: 마지막 갈림 ---
    function b330Gimmick6() {
        renderChoiceStep("기믹 6 — 마지막 갈림",
            `통로가 둘로 갈린다.<br><br>왼쪽에서는 바람이 나온다. 바깥 공기 같다.<br>오른쪽에서는 아무것도 나오지 않는다. 아무것도.<br><br>벽의 화살표가 처음으로 한 방향만 가리킨다.<br>오른쪽이다.<br><br>여태 화살표가 맞은 적이 한 번이라도 있었던가.`,
            [
                { id:'left',  label:'① 바람이 나오는 쪽으로.',        fn:'b330G6R', arg:'left' },
                { id:'right', label:'② 화살표를 따른다.',             fn:'b330G6R', arg:'right' },
                { id:'split', label:'③ 나눠서 간다.',                 fn:'b330G6R', arg:'split' }
            ], null);
    }

    function b330G6R(pick) {
        let txt, mod = 0;
        if (pick === 'left') {
            txt = `바람 쪽으로 간다.<br><br>가까워질수록 바람이 따뜻해진다. 바깥 공기가 이럴 리 없다.<br>안쪽에서 나오는 것이다.<br><br>그래도 계속 간다. 이제 와서 돌아갈 수도 없다.`;
            mod = 1; darkRun.success++;
        } else if (pick === 'right') {
            txt = `화살표를 따른다.<br><br>한 번도 맞은 적 없던 것이, 마지막에만 맞을 이유가 있을까.<br>그런데 이번엔 맞았다.<br><br>통로 끝에 빛이 있다. 형광등은 아니다.`;
            mod = 2; darkRun.success++;
        } else {
            txt = `나눠서 간다.<br><br>양쪽 다 확인하기로 한다. 합리적인 판단이다.<br><br>갈라진 순간 통로가 닫힌다. 양쪽 다.<br>다시 만났을 때는 아무도 어느 쪽으로 갔는지 기억하지 못했다.`;
            mod = -2; darkRun.fail++;
            applyPollutionToUser(currentUser, 7);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 6] ${pick}`);
        renderResultStep("기믹 6 — 결과", txt, "끝으로 간다.",
            (darkRun.isLeader || !darkRun.isParty) ? "partyAdvance(21)" : "void 0");
    }

        // --- 기믹 5: 벽이 좁혀온다 ---
    function b330Gimmick5() {
        renderChoiceStep("기믹 5 — 좁혀오는 벽",
            `양쪽 벽이 동시에 움직인다.<br><br>아까처럼 주기적인 게 아니다. 멈추지 않고 계속 좁아진다.<br>앞쪽에 문이 하나 보이는데, 거기까지 거리가 애매하다.<br><br>벽에 눌린 자국들이 있다. 사람 모양이다. 여러 개다.`,
            [
                { id:'run',   label:'① 전력으로 달린다.',           fn:'b330G5R', arg:'run' },
                { id:'brace', label:'② 벽을 밀어 버틴다.',           fn:'b330G5R', arg:'brace' },
                { id:'crawl', label:'③ 바닥에 엎드려 기어간다.',     fn:'b330G5R', arg:'crawl' },
                { id:'back',  label:'④ 뒤로 물러난다.',             fn:'b330G5R', arg:'back' }
            ], null);
    }

    function b330G5R(pick) {
                if (consumeQFlag('force_open')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("돌파",
                `못을 끼워 넣는다. 몇 번 흔들자 걸린 것이 풀린다.<br><br>생각보다 쉬웠다. 애초에 잠겨 있지 않았던 것 같기도 하다.`,
                darkChoiceBtn("지나간다.", `partyAdvance(${darkRun.step + 1})`));
            mountDarkChat('normal');
            return;
        }
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        let bonus = rollDarkBonus('sense');
        const total = roll + bonus;
        let DC = { run: 10, brace: 15, crawl: 12, back: 13 }[pick];
        DC -= gearValue(currentUser, 'break');
        let txt, died = false;

        if (roll === 1) {
            died = true;
            txt = `늦었다.<br><br>양쪽이 닿는다. 소리는 나지 않았다.<br>벽이 다시 열렸을 때, 자국이 하나 늘어 있었다.`;
        } else if (total >= DC) {
            darkRun.success++;
            txt = pick === 'run' ? `달린다. 문턱을 넘는 순간 뒤에서 벽이 맞물린다.<br><br>발뒤꿈치가 스쳤다. 그걸로 끝이었다.`
                : pick === 'brace' ? `벽을 민다. 밀린다. 실제로 밀린다.<br><br>버티는 동안 일행이 지나간다. 마지막으로 손을 놓고 빠져나온다.`
                : pick === 'crawl' ? `엎드린다. 바닥 쪽이 덜 좁아진다.<br><br>기어서 빠져나온다. 옷이 찢어졌지만 몸은 무사하다.`
                : `물러난다. 벽이 따라오지 않는다.<br><br>기다렸다가 다시 진입하니 통로가 원래대로다.<br>시간을 잃었을 뿐이다.`;
        } else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 9);
            txt = `가까스로 빠져나온다.<br><br>갈비뼈 쪽이 아프다. 숨을 깊게 쉬면 더 아프다.<br>뒤를 보니 벽이 완전히 맞물려 있다.`;
            if ((darkRun.fail || 0) >= 5) {
                darkRun.dying = 'wall';
                darkRun.log.push(`[기믹 5] d20 ${roll} — 치명`);
                renderRescueScene('wall');
                return;
            }
        }

        darkRun.log.push(`[기믹 5] ${pick} d20 ${roll}(+${bonus}) vs DC${DC}`);

        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 5 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${total>=DC?'#4CAF50':'#ff9800'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            (darkRun.isLeader || !darkRun.isParty)
                ? darkChoiceBtn("계속 간다.", "partyAdvance(18)")
                                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">
                         선임의 신호를 기다리는 중...<br>
                         <button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>
                       </div>`);
        mountDarkChat('normal');
    }

        function show119ResultA() {
        const r = c119State.resultA;
        darkRun._c119Locked = true;
        darkBodyEl().innerHTML = darkBox("기믹 1 — 결과",
            r.ok ? `${r.n}번 거울에 손을 넣는다. 저항이 없다.<br><br>팔이 통째로 들어간다. 유리가 아니었다.`
                 : `${r.n}번 거울이 소리 없이 갈라진다.<br>조각이 발밑에 떨어지는데, 떨어지는 소리는 한참 뒤에 났다.<br><br>다른 거울들이 조금씩 더 빨리 돌기 시작한다.`,
            (darkRun.isLeader ? darkChoiceBtn("안쪽으로 들어간다.", "c119Advance(3)")
                              : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">동료를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }
        function watchPartyStep() {
        if (!darkRun || !darkRun.isParty || !database) return;
        if (darkRun._stepWatching) return;
        darkRun._stepWatching = true;

        database.ref(`darkParties/${darkRun.partyId}/curStep`).off();
        database.ref(`darkParties/${darkRun.partyId}/leader`).off();
        database.ref(`darkParties/${darkRun.partyId}/alive`).off();


        database.ref(`darkParties/${darkRun.partyId}/curStep`).on('value', (snap) => {
            const s = snap.val();
            if (s == null || !darkRun) return;
            if (darkRun.step !== s) {
                darkRun.step = s;
                detachVoteListener();
                renderDarkStep();
            }
        });

        // ★ 방장 교체 감지
        database.ref(`darkParties/${darkRun.partyId}/leader`).on('value', (snap) => {
            if (!darkRun) return;
            const newLeader = snap.val();
            if (!newLeader) return;
            const wasLeader = darkRun.isLeader;
            darkRun.isLeader = (newLeader === currentUser.code);
            if (!wasLeader && darkRun.isLeader) {
                showDarkToast('선임이 되었습니다.');
                renderDarkStep();
            }
        });

        // ★ 동료 이탈 감시
               database.ref(`darkParties/${darkRun.partyId}/alive`).on('value', (snap) => {
            if (!darkRun || !darkRun.isParty) return;
            const alive = snap.val() || {};
            const cnt = Object.keys(alive).length;
            const p = darkParties[darkRun.partyId];
            const total = p && p.members ? Object.keys(p.members).length : cnt;

            if (cnt < total && !darkRun._absenceNotified) {
                darkRun._absenceNotified = true;
                const gone = p && p.members
                    ? Object.keys(p.members).filter(c => !alive[c]).map(c => p.members[c].name).join(', ')
                    : '동료';
                showDarkToast(`${gone} 사원의 신호가 끊겼습니다.`);
                startAbsenceTimer();
            } else if (cnt === total && darkRun._absenceNotified) {
                darkRun._absenceNotified = false;
                if (darkRun._absenceTimer) clearInterval(darkRun._absenceTimer);
                showDarkToast(`동료의 신호가 복구되었습니다.`);
            }
        });
}

const ABSENCE_LIMIT = 180;   // 3분

function startAbsenceTimer() {
    if (!darkRun) return;
    if (darkRun._absenceTimer) clearInterval(darkRun._absenceTimer);
    darkRun._absenceStart = Date.now();

    darkRun._absenceTimer = setInterval(() => {
        if (!darkRun || !darkRun._absenceNotified) { stopAbsenceTimer(); return; }

        const sec = Math.floor((Date.now() - darkRun._absenceStart) / 1000);
        const left = ABSENCE_LIMIT - sec;

        if (left === 120 || left === 60 || left === 30) {
            showDarkToast(`응답 없는 동료를 ${left}초 뒤 제외하고 진행합니다.`);
        }

        if (left <= 0) {
            stopAbsenceTimer();
            dropAbsentMembers();
        }
    }, 1000);
}

function stopAbsenceTimer() {
    if (!darkRun) return;
    if (darkRun._absenceTimer) clearInterval(darkRun._absenceTimer);
    darkRun._absenceTimer = null;
    darkRun._absenceNotified = false;
}

function dropAbsentMembers() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (!darkRun.isLeader) return;   // 방장만 처리

    database.ref(`darkParties/${darkRun.partyId}`).once('value').then(snap => {
        const p = snap.val();
        if (!p || !p.members) return;
        const alive = p.alive || {};
        const gone = Object.keys(p.members).filter(c => !alive[c]);
        if (gone.length === 0) return;

        const updates = {};
        gone.forEach(c => {
            updates[`darkParties/${darkRun.partyId}/members/${c}`] = null;
            updates[`darkParties/${darkRun.partyId}/ready${darkRun.step}/${c}`] = null;
        });
        database.ref('/').update(updates);

        const names = gone.map(c => p.members[c].name).join(', ');
        sendPartyChat(`${names} 사원을 제외하고 진행합니다.`, true);
        showDarkToast('남은 인원으로 진행합니다.');
    });
}
    // ==========================================
    // ★ 전용 장비 (Soul Gear)
    // ==========================================
    const GEAR_ATTRS = {
        evade:  { name:'회피', icon:'✦', desc:'즉사 판정을 확률적으로 무효화하고, 강제 지목에 저항합니다.' },
        break:  { name:'파괴', icon:'✧', desc:'막힌 것을 뚫는 판정의 난이도를 낮춥니다.' },
        heal:   { name:'치유', icon:'❋', desc:'탐사 중 오염도 상승을 줄이고, 동료 구조 성공률을 높입니다.' },
        luck:   { name:'행운', icon:'✺', desc:'사망 시 재산 일부를 지키고, 회수품 확률이 오릅니다.' },
        sense:  { name:'감각', icon:'◈', desc:'정보·감식·기억 판정에 강해집니다.' },
        hide:   { name:'은신', icon:'◐', desc:'어둠의 표적이 되는 판정을 피합니다.' },
        bond:  { name:'연결', icon:'⊙', desc:'합류 판정에 강해지고, 동료를 구하다 함께 끌려가지 않습니다.' },
        gaze:  { name:'응시', icon:'❂', desc:'기억과 자각 판정에 강해집니다. 잊는 속도가 느려집니다.' }
    };

    const GEAR_GRADES = ['D', 'C', 'B', 'A', 'S', 'L'];
const GEAR_MULT = { D: 1.0, C: 1.5, B: 2.0, A: 2.8, S: 4.0, L: 6.0 };
const GEAR_UPGRADE = {
    D: { to:'C', rate:0.70, cost:3000 },
    C: { to:'B', rate:0.40, cost:8000 },
    B: { to:'A', rate:0.12, cost:20000 },
    A: { to:'S', rate:0.01, cost:50000 },
    S: { to:'L', rate:0.001, cost:300000 }
};

    // 속성별 기본 수치 (D등급 기준, 등급 배율 적용)
        const GEAR_BASE = {
        evade:  0.18,   // 즉사 무효 확률 (D 18% → S 72%)
        break:  2,      // DC 감소 (D -2 → S -8)
        heal:   0.25,   // 오염 감소율 (D 25% → S 100%)
        luck:   0.30,   // 재산 보존 성공률 (D 30% → S 100%+)
        sense:  2,      // 판정 보정 (D +2 → S +8)
        hide:   2,       // 판정 보정 (D +2 → S +8)
        bond:  3,      // 합류 판정 보정 (D +3 → S +12)
        gaze:  3       // 기억 판정 보정
    };

    function getGear(user) {
        return (user && user.soulGear) ? user.soulGear : null;
    }

    function gearHas(user, attr) {
        const g = getGear(user);
        return !!(g && g.attrs && g.attrs.includes(attr));
    }

    // 속성 실효 수치 (등급 배율 적용)
    function gearValue(user, attr) {
        const g = getGear(user);
        if (!g || !g.attrs || !g.attrs.includes(attr)) return 0;
        const mult = GEAR_MULT[g.grade] || 1;
        const base = GEAR_BASE[attr] || 0;
        // 정수형 보정(파괴·감각·은신)은 반올림
        if (attr === 'break' || attr === 'sense' || attr === 'hide' || attr === 'bond' || attr === 'gaze') {
    return Math.round(base * mult);
}
        return base * mult;
    }

       const GEAR_MARK = { D: '◇', C: '◆', B: '❖', A: '✦', S: '✷', L: '✹' };

    function gearLabel(user) {
        const g = getGear(user);
        if (!g) return '없음';
        const hasAttr = g.attrs && g.attrs.length > 0;
        if (!hasAttr) return `${g.name} — 속성 미지정`;
        const mark = (GEAR_MARK[g.grade] || '') + (g.icon || '');
        const attrs = g.attrs.map(a => GEAR_ATTRS[a] ? GEAR_ATTRS[a].name : a).join(' · ');
        return `${mark} ${g.name} — ${attrs}`;
    }

        // ==========================================
    // ★ 전용 장비 — 사원 조작
    // ==========================================
    function openGearModal(title, bodyHtml) {
        document.getElementById('gear-modal-title').innerText = title;
        document.getElementById('gear-modal-body').innerHTML = bodyHtml;
        document.getElementById('gear-modal').style.display = 'flex';
    }
    function closeGearModal() {
        document.getElementById('gear-modal').style.display = 'none';
    }

    // --- 속성 선택 ---
    function openGearAttrPick() {
        const g = getGear(currentUser);
        if (!g) return;
        if ((g.attrs || []).length >= (g.slots || 1)) { showCustomAlert('더 새길 자리가 없습니다.'); return; }

        const taken = g.attrs || [];
        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                하나를 고르면 되돌릴 수 없습니다.<br>
                등급이 오르면 선택한 속성의 효과도 함께 강해집니다.
            </div>` +
            Object.keys(GEAR_ATTRS).map(k => {
                const a = GEAR_ATTRS[k];
                const dup = taken.includes(k);
                return `
                    <div style="border:1px solid ${dup ? '#333' : '#4a3a6a'}; border-radius:6px; padding:11px; margin-bottom:8px; ${dup ? 'opacity:0.35;' : ''}">
                        <div style="font-size:13px; color:#d4bbff; font-weight:bold;">${a.icon} ${a.name}</div>
                        <div style="font-size:10px; color:#999; margin:5px 0 8px 0; line-height:1.6;">${a.desc}</div>
                        <button class="game-btn" style="width:100%; margin:0; padding:8px; font-size:11px;" onclick="pickGearAttr('${k}')" ${dup ? 'disabled' : ''}>
                            ${dup ? '이미 새겨짐' : '이것으로 새긴다'}
                        </button>
                    </div>`;
            }).join('');
        openGearModal('속성 선택', html);
    }

    function pickGearAttr(attr) {
        const g = getGear(currentUser);
        if (!g || !GEAR_ATTRS[attr]) return;
        if ((g.attrs || []).length >= (g.slots || 1)) return;
        if ((g.attrs || []).includes(attr)) return;

        if (!g.attrs) g.attrs = [];
        g.attrs.push(attr);
        addHistoryLog(currentUser, `[전용 장비] '${g.name}'에 ${GEAR_ATTRS[attr].name} 속성을 새겼습니다.`);

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();

        closeGearModal();
        updateUI();
        showCustomAlert(`${GEAR_ATTRS[attr].icon} ${GEAR_ATTRS[attr].name} 속성이 새겨졌습니다.`);
    }

    // --- 강화 ---
    function openGearUpgrade() {
        const g = getGear(currentUser);
        if (!g) return;
        const up = GEAR_UPGRADE[g.grade];
        if (!up) { showCustomAlert('이미 최고 등급입니다.'); return; }

        const html = `
            <div style="text-align:center; font-size:15px; color:#fff; font-weight:bold; margin-bottom:14px;">
                ${GEAR_MARK[g.grade]} ${g.grade}
                <span style="color:#666; margin:0 9px;">→</span>
                <span style="color:#d4bbff;">${GEAR_MARK[up.to]} ${up.to}</span>
            </div>
            <div style="background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:12px; font-size:12px; line-height:1.9; margin-bottom:13px;">
                성공 확률 <b style="color:${up.rate >= 0.4 ? '#4CAF50' : up.rate >= 0.1 ? '#ff9800' : '#f44336'};">${(up.rate * 100).toFixed(up.rate < 0.1 ? 1 : 0)}%</b><br>
                필요 포인트 <b style="color:#ffd700;">${up.cost.toLocaleString()} P</b><br>
                <span style="color:#f44336;">실패 시 ${Math.floor(up.cost / 2).toLocaleString()} P가 차감됩니다.</span><br>
                <span style="font-size:10px; color:#888;">등급이 내려가지는 않습니다.</span>
            </div>
            <div style="font-size:11px; color:#888; text-align:center; margin-bottom:12px;">
                보유 포인트 <b style="color:#ffd700;">${currentUser.points.toLocaleString()} P</b>
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:12px; ${currentUser.points >= up.cost ? 'background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;' : 'opacity:0.4;'}"
                onclick="tryGearUpgrade()" ${currentUser.points >= up.cost ? '' : 'disabled'}>
                ${currentUser.points >= up.cost ? '강화를 시도한다' : '포인트가 부족합니다'}
            </button>`;
        openGearModal('장비 강화', html);
    }

         function tryGearUpgrade() {
            
        const g = getGear(currentUser);
        if (!g) return;
        const up = GEAR_UPGRADE[g.grade];
        if (!up) return;
        if (up.to === 'L' && !currentUser.gearAwakened) {
        showCustomAlert('한계에 막혀 있습니다.\n「각성 돌파권」이 필요합니다.');
        return;
    }
        const polish = currentUser.gearPolish || 0;
        const rate = currentUser.gearGuarantee ? 1.0 : Math.min(0.99, up.rate + polish);
        const ok = Math.random() < rate;
        const from = g.grade;
        const hadProtect = !!currentUser.gearProtect;
        const hadGuarantee = !!currentUser.gearGuarantee;

        currentUser.gearPolish = 0;
        currentUser.gearGuarantee = false;

        if (ok) {
            currentUser.points -= up.cost;
            g.grade = up.to;
            currentUser.gearProtect = false;
            addHistoryLog(currentUser, `[강화 성공] '${g.name}'이(가) ${from} → ${up.to} 등급이 되었습니다. (-${up.cost} P)`);
        } else {
            const loss = Math.floor(up.cost / 2);
            currentUser.points = Math.max(0, currentUser.points - loss);
            if (hadProtect) {
                currentUser.gearProtect = false;
                addHistoryLog(currentUser, `[강화 실패] 보호권이 등급을 지켰습니다. (-${loss} P)`);
            } else {
                addHistoryLog(currentUser, `[강화 실패] '${g.name}' 강화에 실패했습니다. (-${loss} P)`);
            }
        }

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();

        const html = `
            <div style="text-align:center; padding:18px 0;">
                <div style="font-size:38px; margin-bottom:12px;">${ok ? '✷' : '✕'}</div>
                <div style="font-size:15px; color:${ok ? '#4CAF50' : '#f44336'}; font-weight:bold; margin-bottom:10px;">
                    ${ok ? '강화 성공' : '강화 실패'}
                </div>
                <div style="font-size:12px; color:#ccc; line-height:1.8;">
                    ${ok
                        ? `${g.name}이(가) <b style="color:#d4bbff;">${up.to}등급</b>이 되었습니다.<br>손에 쥔 무게가 조금 달라졌다.`
                        : (hadProtect
                            ? `아무 일도 일어나지 않았다.<br><span style="color:#4CAF50;">보호권이 등급을 지켰다.</span>`
                            : `아무 일도 일어나지 않았다.<br>포인트만 사라졌다.`)}
                    ${polish > 0 ? `<br><span style="font-size:10px; color:#888;">연마제 보정 +${Math.round(polish*100)}% 적용됨</span>` : ''}
                    ${hadGuarantee ? `<br><span style="font-size:10px; color:#c9a8ff;">확정 승인서 사용됨</span>` : ''}
                </div>
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:11px;" onclick="closeGearModal(); updateUI();">확인</button>`;
        openGearModal(ok ? '강화 성공' : '강화 실패', html);
    }

    // --- 재료 조합 ---
    function combineSecondSlot() {
        const mats = ['맞물리지 않는 조각', '지워지지 않는 자국', '반죽에 섞이지 않은 것'];
        const missing = mats.filter(m => !(currentUser.inventory || []).includes(m));
        if (missing.length > 0) { showCustomAlert(`재료가 부족합니다.\n부족: ${missing.join(', ')}`); return; }

        mats.forEach(m => removeItemFromInventory(currentUser, m, 1));
        currentUser.inventory.push('두 번째 자리');
        addHistoryLog(currentUser, `[조합] 재료 3종을 합쳐 '두 번째 자리'를 만들었습니다.`);

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();
        updateUI();
        showCustomAlert('세 조각이 맞물렸습니다.\n「두 번째 자리」를 얻었습니다.');
    }

        // ==========================================
    // ★ 금고
    // ==========================================
    const SAFE_CAP = 50000;
    const SAFE_RATE = 0.006;

    function getSafes(user) {
        if (!user.safeBoxes) user.safeBoxes = [];
        return user.safeBoxes;
    }

    function safeTotal(user) {
        return getSafes(user).reduce((a, s) => a + (s.amount || 0), 0);
    }

    function safeCapacity(user) {
        return getSafes(user).length * SAFE_CAP;
    }

    // 이자 정산 (하루 단위, 접속 시 자동 계산)
    function applySafeInterest(user) {
        const safes = getSafes(user);
        if (safes.length === 0) return false;
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        let changed = false;

        safes.forEach(s => {
            if (!s.lastInterest) { s.lastInterest = now; return; }
            const days = Math.floor((now - s.lastInterest) / dayMs);
            if (days <= 0 || !s.amount) return;

            let amt = s.amount;
            for (let i = 0; i < days; i++) amt = amt * (1 + SAFE_RATE);
            const gained = Math.round(amt) - s.amount;

            if (gained > 0) {
                s.amount = Math.min(SAFE_CAP, s.amount + gained);
                s.lastInterest += days * dayMs;
                changed = true;
                addHistoryLog(user, `[금고 이자] ${days}일분 이자 ${gained.toLocaleString()} P가 적립되었습니다.`);
            } else {
                s.lastInterest += days * dayMs;
            }
        });
        return changed;
    }

    function openSafePanel() {
        const safes = getSafes(currentUser);
        if (safes.length === 0) { showCustomAlert('보유한 금고가 없습니다.'); return; }

        const total = safeTotal(currentUser);
        const cap = safeCapacity(currentUser);

        const html = `
            <div style="background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; border-radius:6px; padding:12px; font-size:12px; line-height:1.9; margin-bottom:13px;">
                보관 중 <b style="color:#ffd700;">${total.toLocaleString()} P</b> / ${cap.toLocaleString()} P<br>
                보유 금고 <b>${safes.length}개</b> · 일 이자 <b style="color:#4CAF50;">0.6%</b><br>
                <span style="font-size:10px; color:#888;">금고 속 포인트는 어둠에서 잃지 않습니다.</span>
            </div>
            <div style="font-size:11px; color:#aaa; margin-bottom:6px;">보유 포인트 <b style="color:#ffd700;">${currentUser.points.toLocaleString()} P</b></div>
            <input type="number" id="safe-amount" class="bet-input" style="width:100%; margin-bottom:9px; text-align:center;" placeholder="금액 입력" min="1">
            <div style="display:flex; gap:6px; margin-bottom:13px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="safeDeposit()">입금</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="safeWithdraw()">출금</button>
            </div>
            <div style="font-size:10px; color:#c9a8ff; font-weight:bold; margin-bottom:5px;">금고 목록</div>
            ${safes.map((s, i) => `
                <div style="background:rgba(0,0,0,0.25); border:1px solid #4a3a2a; border-radius:5px; padding:8px 10px; margin-bottom:5px; font-size:11px; display:flex; justify-content:space-between;">
                    <span style="color:#aaa;">금고 ${i + 1}</span>
                    <span style="color:${s.amount >= SAFE_CAP ? '#ff9800' : '#ffd700'}; font-weight:bold;">
                        ${(s.amount || 0).toLocaleString()} / ${SAFE_CAP.toLocaleString()} P
                    </span>
                </div>`).join('')}`;
        openGearModal('🔐 금고', html);
    }

function safeDeposit() {
        if (!buyGuard()) return;
        const el = document.getElementById('safe-amount');
        let amt = parseInt(el.value, 10);
        if (isNaN(amt) || amt <= 0) { showCustomAlert('올바른 금액을 입력해주세요.'); return; }
        if (amt > currentUser.points) { showLuxuryAlert(); return; }

        const safes = getSafes(currentUser);
        let remain = amt, stored = 0;

        for (let s of safes) {
            if (remain <= 0) break;
            const room = SAFE_CAP - (s.amount || 0);
            if (room <= 0) continue;
            const put = Math.min(room, remain);
            s.amount = (s.amount || 0) + put;
            if (!s.lastInterest) s.lastInterest = Date.now();
            remain -= put;
            stored += put;
        }

        if (stored === 0) { showCustomAlert('모든 금고가 가득 찼습니다.\n금고를 더 구매해야 합니다.'); return; }

        currentUser.points -= stored;
        currentUser._adminStamp = Date.now();
        addHistoryLog(currentUser, `[금고 입금] ${stored.toLocaleString()} P를 보관했습니다.`);

        if (database) {
            database.ref('users/' + currentUser.code).set(currentUser).then(() => {
                updateUI();
                openSafePanel();
            });
        } else {
            saveDB(); updateUI(); openSafePanel();
        }

        showCustomAlert(remain > 0
            ? `${stored.toLocaleString()} P를 넣었습니다.\n금고가 가득 차 ${remain.toLocaleString()} P는 넣지 못했습니다.`
            : `${stored.toLocaleString()} P를 보관했습니다.`);
    }

    function safeWithdraw() {
        if (!buyGuard()) return;
        const el = document.getElementById('safe-amount');
        let amt = parseInt(el.value, 10);
        if (isNaN(amt) || amt <= 0) { showCustomAlert('올바른 금액을 입력해주세요.'); return; }

        const total = safeTotal(currentUser);
        if (amt > total) { showCustomAlert(`금고에 ${total.toLocaleString()} P밖에 없습니다.`); return; }

        const safes = getSafes(currentUser);
        let remain = amt;
        for (let i = safes.length - 1; i >= 0; i--) {
            if (remain <= 0) break;
            const take = Math.min(safes[i].amount || 0, remain);
            safes[i].amount -= take;
            remain -= take;
        }

        currentUser.points += amt;
        currentUser._adminStamp = Date.now();
        addHistoryLog(currentUser, `[금고 출금] ${amt.toLocaleString()} P를 꺼냈습니다.`);

        if (database) {
            database.ref('users/' + currentUser.code).set(currentUser).then(() => {
                updateUI();
                openSafePanel();
                showPointGainEffect(amt);
            });
        } else {
            saveDB(); updateUI(); openSafePanel(); showPointGainEffect(amt);
        }
    }
        function gearTagHtml() {
        const g = getGear(currentUser);
        if (!g || !g.attrs || g.attrs.length === 0) return '';
        return `<div style="font-size:10px; color:#c9a8ff; margin-top:5px; font-weight:normal;">${GEAR_MARK[g.grade] || ''}${g.icon} ${g.name} 적용 중</div>`;
    }

        // ==========================================
    // ★ Qtrew-B-508 「%$#@빵가게」
    // ==========================================
    const B508_DOCS = [
        { id:'d01', name:'재료 반입 명세서',  where:'basement', hint:'포대 사이 어딘가에 끼워져 있을 것이다.' },
        { id:'d02', name:'계량 기록지',       where:'basement', hint:'저울 근처에 있을 법하다.' },
        { id:'d03', name:'배합 승인 도장',    where:'dough',    hint:'반죽대 위, 밀가루에 파묻혀 있다.' },
        { id:'d04', name:'위생 점검표',       where:'dough',    hint:'싱크대 옆 게시판.' },
        { id:'d05', name:'발효 시간 기록',    where:'proof',    hint:'선반마다 붙은 표를 봐야 한다.' },
        { id:'d06', name:'온습도 관리 카드',  where:'proof',    hint:'벽에 걸린 계기 아래.' },
        { id:'d07', name:'소성 일지',         where:'oven',     hint:'오븐 문에 자석으로 붙어 있다.' },
        { id:'d08', name:'화상 사고 보고서',  where:'oven',     hint:'구급함 안에 접혀 있다.' },
        { id:'d09', name:'진열 배치도',       where:'store',    hint:'계산대 서랍.' },
        { id:'d10', name:'출고 검수증',       where:'upper',    hint:'2층 사무실에만 있다.' },
        { id:'d11', name:'폐기물 처리 확인서', where:'store',   hint:'매장 안쪽 창고.' },
        { id:'d12', name:'대표자 서명란',     where:'oven',     hint:'오븐실 게시판.' }
       ];

    const B508_AREAS = {
        basement: '지하 저장고',
        dough:    '반죽실',
        proof:    '발효실',
        oven:     '오븐실',
        store:    '매장',
        upper:    '2층'
    };

    // 인원별 필요 서류 수
function b508RequiredDocs() {
    const n = darkRun && darkRun.memberCount ? darkRun.memberCount : 3;
    if (n >= 5) return 12;
    if (n === 4) return 10;
    return 8;
}
        const B508_MONSTERS = {
        kneader: {
            name: '반죽공',
            senses: 'sound',
            desc: `앞치마가 허리까지 젖어 있다. 젖은 것은 물이 아니다.<br>
                   눈이 있어야 할 자리에 밀가루가 눌러 붙어 굳었다. 그래서 보지 못한다.<br>
                   대신 귀가 얼굴의 절반을 차지한다. 소리가 나면 그쪽으로 얼굴 전체가 돌아간다.<br>
                   팔이 팔꿈치부터 두 번 더 꺾인다. 그 팔로 반죽을 친다. 쉬지 않고.`,
            idle: `쿵. 쿵. 쿵.<br>반죽 치는 소리가 일정하다. 숨소리는 들리지 않는다.`,
            alert: `소리가 멎는다.<br><br>팔이 공중에 멈춘 채로, 얼굴만 이쪽으로 돌아간다.<br>귀가 벌어진다. 안쪽이 붉다.<br><br>쿵. 쿵. 발소리가 시작된다. 반죽 치던 박자 그대로.`,
            danger: '소리를 내면 안 된다.'
        },
        cashier: {
            name: '계산원',
            senses: 'sight',
            desc: `계산대 뒤에 서 있다. 자세가 완벽하다. 사람이 오래 연습한 자세다.<br>
                   얼굴에 눈이 많다. 세어 보려다 만다. 세면 알아차릴 것 같아서.<br>
                   전부 감겨 있는데, 하나씩 순서대로 뜬다. 천천히.<br>
                   입은 웃는 모양으로 굳었다. 벌어지지 않는다.`,
            idle: `미동도 없다.<br>감긴 눈들이 아주 느리게 돌아가는 것이 눈꺼풀 너머로 보인다.`,
            alert: `눈 하나가 떠진다.<br><br>정확히 이쪽이다.<br>다른 눈들도 차례로 떠진다. 전부 같은 곳을 본다.<br><br>계산대를 짚고 천천히 넘어온다. 다리가 관절 없이 접힌다.`,
            danger: '눈을 마주치면 안 된다.'
        },
        courier: {
            name: '배달원',
            senses: 'smell',
            desc: `헬멧을 쓰고 있다. 벗겨지지 않는다. 자란 살이 헬멧을 물고 있다.<br>
                   코가 헬멧 밖으로 튀어나와 있다. 그 부분만 계속 벌름거린다.<br>
                   등에 배달통을 멨다. 안에서 무언가 자세를 바꾸는 소리가 난다.<br>
                   손에 장갑을 꼈는데, 손가락이 남는다. 세 개쯤.`,
            idle: `킁. 킁.<br>코를 벌름거리며 천천히 원을 그리며 돈다.`,
            alert: `코가 멈춘다.<br><br>헬멧이 이쪽으로 기울어진다. 안에서 젖은 숨소리가 샌다.<br>배달통이 흔들린다. 안쪽에서 두드리는 소리.<br><br>달리기 시작한다. 생각보다 빠르다.`,
            danger: '피나 땀 냄새를 남기면 안 된다.'
        }
    };

        // ==========================================
    // ★ 주목도
    // ==========================================
    function getNotice() {
        return (darkRun && darkRun.notice) ? darkRun.notice : 0;
    }

       function addNotice(amount, reason) {
        if (!darkRun) return;
        if (amount > 0 && consumeQFlag('no_notice')) {
            showDarkToast('봉투 안은 조용했다.');
            return;
        }
        let amt = amount;
        // 은신 속성이 상승을 줄인다
        const hideVal = gearValue(currentUser, 'hide');
        if (hideVal > 0 && amt > 0) amt = Math.max(1, Math.round(amt * (1 - hideVal * 0.08)));

        darkRun.notice = Math.max(0, Math.min(100, getNotice() + amt));
        if (reason) darkRun.log.push(`[주목도] ${reason} (${amt >= 0 ? '+' : ''}${amt} → ${darkRun.notice})`);
        renderNoticeBar();

        if (darkRun.notice >= 100 && !darkRun._caught) {
            darkRun._caught = true;
            setTimeout(() => b508Caught(), 600);
        }
    }

    function renderNoticeBar() {
        const el = document.getElementById('notice-bar');
        if (!el) return;
        const n = getNotice();
        const color = n >= 75 ? '#f44336' : n >= 45 ? '#ff9800' : '#4CAF50';
        const label = n >= 75 ? '발각 직전' : n >= 45 ? '경계' : '고요';
        el.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
                <span>주목도 — <b style="color:${color};">${label}</b></span>
                <span style="color:${color}; font-weight:bold;">${n} / 100</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${n}%; background:${color}; transition:width 0.4s;"></div>
            </div>`;
    }

    function noticeBarHtml() {
        return `<div id="notice-bar" style="margin-bottom:12px;"></div>`;
    }

    // 붙잡힘
    function b508Caught() {
        if (!darkRun) return;
        const m = darkRun._lastMonster ? B508_MONSTERS[darkRun._lastMonster] : B508_MONSTERS.kneader;
        darkDeath(
            `${m.alert}<br><br>` +
            `도망칠 자리가 없다. 통로가 언제부터인가 막혀 있었다.<br><br>` +
            `손이 어깨에 닿는다. 생각보다 부드럽다.<br>` +
            `<span style="color:#d4af37;">"오늘 재료가 아주 좋네요."</span>`
        );
    }

        const B508_NARR = {
        1: { img:'step1', text:`포대에 라벨이 붙어 있다.<br><br>읽으려고 하면 글자가 자리를 바꾼다. 한 글자씩은 알아보겠는데 단어가 되지 않는다.<br><br>하나를 뜯어 본다. 밀가루가 맞다. 냄새도 맞다.<br>다만 그 안에 섞여 있는 것들이 밀가루보다 굵다.<br>손가락으로 헤집다가 그만둔다.` },

        2: { text:`위층 소리가 계속된다.<br><br>반죽을 치대는 소리라고 생각했는데, 듣고 있으면 그게 아니다.<br>치대는 소리에는 끝이 있다. 들었다 내리치고, 쉬고, 다시.<br><br>이건 쉬지 않는다.<br>그리고 가끔, 아주 가끔 짧고 높은 소리가 섞인다.<br>반죽에서 날 수 있는 소리가 아니다.` },

        3: { text:`계단 아래에 물이 고여 있다.<br><br>천장에서 떨어진 것이 아니다. 위에서 흘러내린 것이다.<br>계단을 따라 한 칸씩, 얇게.<br><br>손가락을 대 본다. 미지근하다.<br>냄새를 맡으려다 만다. 맡으면 알게 될 것 같아서.` },

        4: { text:`계단 벽에 근무 수칙이 붙어 있다. 코팅이 벗겨졌고 글씨는 선명하다.<br><br><span style="color:#d4af37;">1. 재료는 신선할 때 손질합니다.<br>2. 재료의 소리에 응답하지 않습니다.<br>3. 재료와 눈을 맞추지 않습니다.<br>4. 재료가 이름을 말하면 보고합니다.</span><br><br>네 번째 줄 아래에 손톱으로 긁은 자국이 있다.<br>누군가 지우려다 만 것 같다. 절반쯤 지워졌고, 절반은 남았다.<br><br>남은 절반에 이름 하나가 보인다.` },

        5: { img:'step2', text:`반죽실 문틈으로 안을 본다.<br><br>${B508_MONSTERS.kneader.desc}<br><br>${B508_MONSTERS.kneader.idle}<br><br><span style="color:#ff6b6b;">${B508_MONSTERS.kneader.danger}</span>` },

        6: { text:`반죽대 아래를 지나간다.<br><br>바닥이 미끄럽다. 물이 아니다.<br>손바닥에 뭔가 걸린다. 단추다. 셔츠 단추.<br>그 옆에 또 하나. 또 하나. 크기가 제각각이다.<br><br>세어 보니 스물 몇 개쯤 된다.<br>한 벌에 단추가 몇 개 달리는지 떠올려 보다가 그만둔다.` },

        7: { text:`직원 하나가 지나간다.<br><br>앞치마를 입었고, 인사를 한다. 목소리가 명랑하다.<br>얼굴이 부풀어 있다. 피부 아래에서 뭔가가 자리를 옮긴다.<br>볼에 건포도 같은 것이 박혀 있는데, 건포도가 아니다. 그쪽도 이쪽을 보고 있다.<br><br>웃는다. 입꼬리가 올라가면서 뺨이 조금 찢어진다.<br>안에서 흰 것이 몇 마리 떨어진다. 직원은 그걸 주워 반죽에 넣는다.<br><br><span style="color:#d4af37;">"오늘 재료가 아주 좋네요."</span><br><br><span style="color:#ff9800;">지금부터 이곳은 당신들을 의식하기 시작한다.</span>` },

        8: { text:`복도가 길다.<br><br>양옆에 문이 있는데 손잡이가 없다. 밀어도 당겨도 열리지 않는다.<br>문틈으로 빛이 새는 곳이 하나 있다.<br><br>들여다보려고 몸을 숙이는 순간, 안쪽에서 빛이 가려진다.<br>무언가 문 바로 뒤에 서 있다. 이쪽을 보고 있는 자세로.<br><br>일어선다. 천천히. 소리 나지 않게.` },

        9: { text:`발효실이다.<br><br>선반마다 천이 덮여 있다. 천 아래가 부풀어 있다.<br>사람 크기다.<br><br>하나가 천천히 움직인다. 부푸는 것이 아니라, 뒤척이는 것이다.<br>천 아래에서 손이 나온다. 손가락이 여섯이다. 여섯 번째는 나중에 붙인 것 같다.<br><br>아무도 천을 걷지 않는다.` },

        10: { text:`천 아래에서 소리가 난다.<br><br>말이다. 말이었던 것의 잔해다. 자음만 남고 모음이 빠졌다.<br>여러 개가 동시에 난다. 선반 전체에서.<br><br>그중 하나가 또렷해진다.<br><span style="color:#d4af37;">"...아직... 안... 익었어요..."</span><br><br>발효실 문을 닫는다. 소리가 멎지 않는다.` },

        11: { text:`계산대 옆에 주문서가 쌓여 있다.<br><br>대부분 읽을 수 없는 글자인데, 수량만은 숫자로 적혀 있다.<br>오늘 날짜에 <b>5</b>.<br><br>그 아래 칸에 이름이 적혀 있다. 손글씨다.<br>일행 중 하나의 이름이 거기 있다.<br><br>먼저 본 사람이 아무 말도 하지 않는다.` },

        12: { text:`계산대 뒤를 본다.<br><br>${B508_MONSTERS.cashier.desc}<br><br>${B508_MONSTERS.cashier.idle}<br><br><span style="color:#ff6b6b;">${B508_MONSTERS.cashier.danger}</span>` },

        13: { text:`뒤쪽 통로로 돌아간다.<br><br>벽에 손자국이 있다. 밀가루 묻은 손으로 짚은 자국.<br>높이가 일정하지 않다. 어떤 건 천장 가까이에 있다.<br><br>손자국 하나에 손을 대 본다. 크기가 맞는다.<br>정확히 맞는다.` },

        14: { img:'step3', text:`오븐실이다.<br><br>열기가 밀려온다. 숨을 쉬면 목이 마른다.<br>오븐이 여섯. 전부 돌아가고 있고, 유리창에 김이 서려 안이 보이지 않는다.<br><br>세 번째 오븐 유리 안쪽에 손자국이 있다.<br>안에서 찍은 자국이다.<br><br>타이머가 울린다. 아무도 열지 않는다.` },

        15: { text:`배달원이 지나간다.<br><br>${B508_MONSTERS.courier.desc}<br><br>${B508_MONSTERS.courier.idle}<br><br><span style="color:#ff6b6b;">${B508_MONSTERS.courier.danger}</span>` },

        16: { text:`구급함이 벽에 걸려 있다.<br><br>열어 본다. 붕대가 전부 쓰인 흔적이 있다. 감았다가 푼 것들이다.<br>말려서 다시 넣어 두었다. 아껴 쓴 티가 난다.<br><br>맨 아래에 명찰이 하나 깔려 있다.<br>이름 칸이 긁혀 지워졌고, 사번만 남았다.` },

        17: { text:`매장이다.<br><br>진열대가 환하다. 빵이 가지런하고, 값표가 붙어 있고, 냄새가 좋다.<br>여기까지 오니 그냥 빵가게 같다.<br><br>의자와 테이블이 놓여 있다. 나무 같은데 나무가 아니다.<br>테이블 다리에 관절이 있다. 등받이에 결이 있는데, 결이 아니라 무늬다.<br><br>앉으려던 사람이 그만둔다. 의자가 아주 조금 기울었다.<br>피한 것인지 맞이한 것인지 모르겠다.` },

        18: { text:`유리문 밖으로 사람이 지나간다.<br><br>평범한 저녁이다. 우산을 든 사람, 통화하는 사람, 손잡은 사람.<br>아무도 이쪽을 보지 않는다.<br><br>손을 흔들어 본다. 유리를 두드려 본다.<br>소리가 밖으로 나가지 않는다.<br><br>한 사람이 문을 열고 들어온다.<br>진열대에서 빵을 하나 고르고, 계산하고, 나간다.<br>계산원과 웃으며 인사를 나눈다.<br><br>그 사람 눈에는 이쪽이 안 보인다. 아니면, 상품으로 보인다.` },

        19: { text:`안내 방송이 나온다.<br><br><span style="color:#d4af37;">"금일 영업을 종료합니다. 남은 상품은 폐기됩니다. 이용해 주셔서 감사합니다."</span><br><br>폐기라는 단어에서 다들 멈춘다.<br><br>진열대 위 빵들은 조용하다. 팔려 나간 것들도 조용했을 것이다.<br>남은 것들이 어떻게 되는지는 아래층에서 이미 봤다.` },

        20: { text:`셔터가 내려오기 시작한다.<br><br>안쪽에서 발소리가 모인다. 셋이다. 서로 다른 박자.<br>쿵. 쿵. — 관절 접히는 소리. — 킁. 킁.<br><br>서두를 시간도 없다.<br>포장대 위에 봉지가 놓여 있다. 사람이 들어갈 크기다.<br><br>정식 출고품이 되어야 한다. 서류가 갖춰졌다면.` }
    };

        // ==========================================
    // ★ 서류 탐색
    // ==========================================
    const B508_SPOTS = {
        basement: ['밀가루 포대 더미', '낡은 저울', '벽에 걸린 앞치마', '계단 밑 상자', '배수구 옆 선반'],
        dough:    ['반죽대 아래', '싱크대 뒤', '게시판', '밀대가 걸린 고리', '작업복 주머니'],
        proof:    ['첫 번째 선반', '벽에 걸린 계기', '천이 쌓인 바구니', '구석의 수레', '온도계 뒤'],
        oven:     ['세 번째 오븐 문', '구급함', '장작 더미', '환풍구 아래', '식힘망 선반'],
        store:    ['계산대 서랍', '진열대 아래', '테이블 밑', '메뉴판 뒤', '화분 속'],
        upper:    ['사무실 책상', '서류 캐비닛', '작업대 위', '벽에 걸린 액자', '의자 아래', '창가 선반']
    };

    // 탐색 가능 횟수 (구역당)
    const SEARCH_LIMIT = { basement:3, dough:3, proof:3, oven:3, store:3, upper:4 };

    // 방장이 서류 위치를 정한다
    function initB508Docs() {
        if (!darkRun || !darkRun.isLeader || !database) return;
        const placed = {};
        Object.keys(B508_AREAS).forEach(area => {
            const spots = B508_SPOTS[area];
            const docs = B508_DOCS.filter(d => d.where === area);
            const picked = spots.slice().sort(() => Math.random() - 0.5);
            docs.forEach((d, i) => { placed[d.id] = { area: area, spot: picked[i % picked.length] }; });
        });
        database.ref(`darkParties/${darkRun.partyId}/b508`).set({
            placed: placed, found: {}, searched: {}, at: Date.now()
        });
    }

    let b508Ref = null, b508Key = null, b508State = null;

    function attachB508Listener() {
        if (!database || !darkRun || !darkRun.partyId) return;
        if (b508Key === darkRun.partyId) return;
        if (b508Ref) { try { b508Ref.off(); } catch(e) {} }
        b508Key = darkRun.partyId;
        b508Ref = database.ref(`darkParties/${darkRun.partyId}/b508`);
        b508Ref.on('value', snap => {
            b508State = snap.val();
            const box = document.getElementById('b508-search-area');
            if (box && darkRun) renderSearchSpots(darkRun._curArea);
        });
    }

    function detachB508Listener() {
        if (b508Ref) { try { b508Ref.off(); } catch(e) {} }
        b508Ref = null; b508Key = null; b508State = null;
    }

    function foundCount() {
        return b508State && b508State.found ? Object.keys(b508State.found).length : 0;
    }

    // --- 탐색 화면 ---
    function renderSearch(area) {
        if (!darkRun) return;
        darkRun._curArea = area;
        attachB508Listener();

        if (!b508State) {
            if (darkRun.isLeader) initB508Docs();
            darkBodyEl().innerHTML = darkBox(B508_AREAS[area] + " — 탐색",
                `주변을 둘러본다.`,
                `<div style="text-align:center; color:#888; font-size:12px; padding:20px 0;">서류 위치를 파악하는 중...</div>`);
            setTimeout(() => { if (b508State) renderSearch(area); }, 1200);
            return;
        }

        const body = darkBodyEl();
        body.innerHTML = darkBox(B508_AREAS[area] + " — 탐색",
            `필요한 서류를 찾아야 한다.<br><br>
             뒤질 때마다 소리가 난다. 조용히 할수록 좋지만, 시간도 없다.<br><br>
             <span style="font-size:11px; color:#888;">확보 <b style="color:#4CAF50;">${foundCount()}</b> / ${b508RequiredDocs()}장 필요</span>`,
            noticeBarHtml() + `<div id="b508-search-area"></div>`);
        renderNoticeBar();
        renderSearchSpots(area);
        mountDarkChat('normal');
    }

    function renderSearchSpots(area) {
        const box = document.getElementById('b508-search-area');
        if (!box || !b508State || !area) return;

        const searched = b508State.searched || {};
        const used = Object.keys(searched).filter(k => k.startsWith(area + '|')).length;
        const limit = SEARCH_LIMIT[area] || 3;
        const bonusSearch = qFlag('extra_search') ? 1 : 0;
        const left = Math.max(0, limit + bonusSearch - used);

        const spots = B508_SPOTS[area] || [];
        const senseVal = gearValue(currentUser, 'sense');

        let html = `<div style="font-size:10px; color:#888; margin-bottom:8px;">남은 탐색 ${left}회 · 1회당 주목도 +8</div>`;

        html += spots.map(sp => {
            const key = area + '|' + sp;
            const done = searched[key];
            // 감각이 높으면 힌트가 보인다
            let hintTag = '';
            
                 if ((senseVal >= 4 || hasEquip(currentUser, '유리손포') || qFlag('reveal_doc')) && !done) {
                const here = Object.keys(b508State.placed || {}).some(id =>
                    b508State.placed[id].area === area && b508State.placed[id].spot === sp && !(b508State.found || {})[id]);
                if (here) hintTag = `<span style="color:#c9a8ff; font-size:9px; margin-left:5px;">◈ 무언가 느껴진다</span>`;
            }
            return `
                <div style="background:rgba(0,0,0,0.25); border:1px solid ${done ? '#333' : '#4a3a2a'}; border-radius:5px; padding:9px 11px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px; ${done ? 'opacity:0.45;' : ''}">
                    <span style="font-size:11px; color:#ddd; flex:1;">${sp}${hintTag}
                        ${done ? `<br><span style="font-size:9px; color:#777;">${done.result || '아무것도 없었다'}</span>` : ''}
                    </span>
                    ${done ? '' : `<button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px; flex-shrink:0;" onclick="doSearch('${area}','${sp}')" ${left <= 0 ? 'disabled' : ''}>뒤진다</button>`}
                </div>`;
        }).join('');

        html += `<button class="game-btn" style="width:100%; margin-top:10px; padding:11px; font-size:12px;" onclick="finishSearch()">이 구역을 벗어난다</button>`;
        box.innerHTML = html;
    }

    function doSearch(area, spot) {
        if (!b508State || !database) return;
        const key = area + '|' + spot;
        if ((b508State.searched || {})[key]) return;

        const placed = b508State.placed || {};
        const found = b508State.found || {};
        const hitId = Object.keys(placed).find(id =>
            placed[id].area === area && placed[id].spot === spot && !found[id]);

        addNotice(8, `${B508_AREAS[area]} 탐색`);
        
        if (hitId) {
            const doc = B508_DOCS.find(d => d.id === hitId);
            database.ref(`darkParties/${darkRun.partyId}/b508/found/${hitId}`).set({
                by: currentUser.name, at: Date.now()
            });
            database.ref(`darkParties/${darkRun.partyId}/b508/searched/${key}`).set({
                by: currentUser.name, result: `📄 ${doc.name} 발견`
            });
            darkRun.success++;
            sendPartyChat(`${currentUser.name} 사원이 「${doc.name}」을(를) 찾았습니다.`, true);
            showDarkToast(`📄 ${doc.name}`);
        } else {
            const emptyTexts = [
                '먼지만 가득했다.',
                '아무것도 없었다.',
                '빈 봉투가 하나 나왔다. 안은 비어 있다.',
                '손에 뭔가 묻었다. 닦이지 않는다.',
                '무언가 손을 스쳤다. 다시 보니 없다.'
            ];
            database.ref(`darkParties/${darkRun.partyId}/b508/searched/${key}`).set({
                by: currentUser.name, result: emptyTexts[Math.floor(Math.random() * emptyTexts.length)]
            });
        }
    }

    function finishSearch() {
        if (!darkRun) return;
        partyAdvance(darkRun.step + 1);
    }

        const B508_STEPS = {
        0:  { type:'intro' },
        1:  { type:'narr', n:1 },
        2:  { type:'narr', n:2 },
        3:  { type:'search', area:'basement' },
        4:  { type:'gimmick', n:1 },
        5:  { type:'narr', n:3 },
        6:  { type:'narr', n:4 },
        7:  { type:'narr', n:5 },
        8:  { type:'gimmick', n:2 },
        9:  { type:'search', area:'dough' },
        10: { type:'narr', n:6 },
        11: { type:'narr', n:7 },
        12: { type:'mark', n:1 },
        13: { type:'narr', n:8 },
        14: { type:'narr', n:9 },
        15: { type:'search', area:'proof' },
        16: { type:'gimmick', n:3 },
        17: { type:'narr', n:10 },
        18: { type:'narr', n:11 },
        19: { type:'narr', n:12 },
        20: { type:'gimmick', n:4 },
        21: { type:'mark', n:2 },
        22: { type:'narr', n:13 },
        23: { type:'narr', n:14 },
        24: { type:'search', area:'oven' },
        25: { type:'narr', n:15 },
        26: { type:'gimmick', n:5 },
        27: { type:'narr', n:16 },
        28: { type:'narr', n:17 },
        29: { type:'search', area:'store' },
        30: { type:'narr', n:18 },
        31: { type:'gimmick', n:6 },
        32: { type:'narr', n:19 },
        33: { type:'narr', n:20 },
        34: { type:'gimmick', n:7 },
        99: { type:'result' }
    };

    function renderStepB508() {
        const body = darkBodyEl();
        if (!body || !darkRun) return;
        if (darkRun.rejoined) { renderRejoinScene(); return; }
        if (darkRun.isParty) { watchPartyStep(); watchDyingMembers(); watchBites(); watchPurge(); watchWipe(); }
        saveDarkRunState();
        attachB508Listener();

        if (darkRun.taken) { renderB508Upper(); return; }

        const def = B508_STEPS[darkRun.step];
        if (!def) { renderDarkResult(); return; }

        if (def.type === 'intro') {
            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                darkChoiceBtn("일어선다.", "partyAdvance(1)"), "intro");
            mountDarkChat('normal');
            return;
        }

        if (def.type === 'narr') {
            const d = B508_NARR[def.n];
            const showNotice = darkRun.step >= 11;
            body.innerHTML = darkBox("—", d.text,
                (showNotice ? noticeBarHtml() : '') +
                darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`),
                d.img);
            if (showNotice) renderNoticeBar();
            mountDarkChat('normal');
            return;
        }

        if (def.type === 'search') { renderSearch(def.area); return; }
        if (def.type === 'mark')   { renderB508Mark(def.n); return; }
        if (def.type === 'result') { renderDarkResult(); return; }

        const fns = { 1:b508G1, 2:b508G2, 3:b508G3, 4:b508G4, 5:b508G5, 6:b508G6, 7:b508G7 };
        if (fns[def.n]) fns[def.n]();
    }

        // --- 기믹 1: 저장고 탈출 ---
    function b508G1() {
        renderChoiceStep("기믹 1 — 저장고",
            `나가는 길은 계단뿐이다.<br><br>계단 위 문은 잠겨 있지 않다. 밀면 열린다.<br>다만 열면 위층에서 알아차릴 것이다.<br><br>구석에 환기구가 있다. 좁고, 기름때가 두껍다.`,
            [
                { id:'stair', label:'① 계단으로 올라간다.',        fn:'b508G1R', arg:'stair' },
                { id:'vent',  label:'② 환기구로 기어간다.',        fn:'b508G1R', arg:'vent' },
                { id:'hide',  label:'③ 포대 사이에 숨어 살핀다.',  fn:'b508G1R', arg:'hide' }
            ], "step1");
    }

    function b508G1R(pick) {
        let txt, mod = 0;
        if (pick === 'stair') {
            txt = `문을 민다. 경첩이 소리를 내지 않는다. 기름칠이 잘 되어 있다.<br><br>위층은 밝다. 아무도 돌아보지 않는다.<br>다들 각자 할 일을 하고 있다. 너무 열심히 하고 있다.`;
            addNotice(6, '계단 이용');
            darkRun.success++;
        } else if (pick === 'vent') {
            txt = `환기구로 들어간다. 기름때가 손에 엉긴다.<br><br>한참 기어가다 아래를 본다. 격자 너머로 작업대가 보인다.<br>그 위에 놓인 것을 보고 멈춘다.<br><br>내려가는 걸 잠시 미룬다.`;
            mod = 2; darkRun.success++; applyPollutionToUser(currentUser, 4);
        } else {
            txt = `포대 뒤에 숨어 계단을 살핀다.<br><br>직원 하나가 내려온다. 포대를 하나 집어 들고 올라간다.<br>어깨에 메는데, 포대 안쪽에서 뭔가 자세를 고친다.<br><br>직원은 신경 쓰지 않는다. 익숙한 모양이다.`;
            mod = 1; darkRun.success++;
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 1] ${pick}`);
        renderResultStep("기믹 1 — 결과", txt, "계단을 오른다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 2: 반죽실 (소리) ---
    function b508G2() {
        darkRun._lastMonster = 'kneader';
        renderChoiceStep("기믹 2 — 반죽실",
            `반죽공이 등을 보이고 있다.<br><br>통과하려면 그 옆을 지나야 한다. 거리는 두 걸음도 안 된다.<br>귀가 얼굴의 절반이다. 지금도 아주 조금씩 움직이고 있다.<br><br><span style="color:#ff6b6b;">소리를 내면 안 된다.</span>`,
            [
                { id:'crawl', label:'① 신발을 벗고 기어간다.',      fn:'b508G2R', arg:'crawl' },
                { id:'wait',  label:'② 반죽 치는 박자에 맞춰 걷는다.', fn:'b508G2R', arg:'wait' },
                { id:'throw', label:'③ 반대쪽으로 뭔가를 던진다.',   fn:'b508G2R', arg:'throw' },
                { id:'rush',  label:'④ 단숨에 뛰어 지나간다.',      fn:'b508G2R', arg:'rush' }
            ], null);
    }

    function b508G2R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = { crawl: 9, wait: 11, throw: 12, rush: 17 }[pick] - gearValue(currentUser, 'break');
               // b508G2R (소리)
        if (consumeQFlag('immune_sound')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
                `귀마개를 꼈다.<br><br>발소리가 나지 않는다. 숨소리도 새지 않는다.<br>반죽공은 끝까지 고개를 돌리지 않았다.`,
                noticeBarHtml() + darkChoiceBtn("안쪽으로 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderNoticeBar(); mountDarkChat('normal');
            return;
        }
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (ok) {
            txt = pick === 'crawl' ? `신발을 벗어 손에 든다. 바닥이 미끄럽고 미지근하다.<br><br>기어서 지나간다. 반죽공의 발이 바로 옆에 있다.<br>발톱이 바닥을 긁고 있다. 아주 천천히.<br><br>지나쳤다. 귀는 움직이지 않았다.`
                : pick === 'wait' ? `박자를 센다. 쿵. 쿵. 쿵.<br><br>치는 순간에 맞춰 한 걸음씩. 소리가 소리에 묻힌다.<br><br>세 걸음 만에 지나쳤다. 박자는 흐트러지지 않았다.`
                : pick === 'throw' ? `주머니에 있던 단추를 반대쪽으로 던진다.<br><br>딱, 하고 작은 소리.<br>반죽공의 얼굴 전체가 그쪽으로 돌아간다. 몸은 그대로인 채로.<br><br>그 사이에 지나간다.`
                : `달린다.<br><br>지나쳤다. 운이 좋았다.<br>등 뒤에서 반죽 치는 소리가 한 박자 멎었다가, 다시 시작된다.`;
            darkRun.success++;
            addNotice(pick === 'rush' ? 15 : 5, '반죽실 통과');
        } else {
            txt = `소리가 났다.<br><br>${B508_MONSTERS.kneader.alert}`;
            darkRun.fail++;
            addNotice(28, '반죽공에게 감지됨');
            applyPollutionToUser(currentUser, 7);
        }

        darkRun.log.push(`[기믹 2] ${pick} d20 ${roll}(+${bonus}) vs DC${DC}`);
        darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            noticeBarHtml() + darkChoiceBtn("안쪽으로 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderNoticeBar();
        mountDarkChat('normal');
    }

    // --- 기믹 3: 발효실 (제한시간) ---
    let b508Timer = null;
    function b508G3() {
        const body = darkBodyEl();
        body.innerHTML = darkBox("기믹 3 — 발효실",
            `선반 사이를 지나야 한다.<br><br>천 아래 것들이 깨어나고 있다. 지나갈수록 움직임이 커진다.<br>완전히 깨기 전에 빠져나가야 한다.<br><br><span style="color:#888; font-size:11px;">[제한 시간 안에 선택하세요]</span>`,
            noticeBarHtml() +
            `<div style="text-align:center; font-size:30px; font-weight:bold; color:#ff6b6b; margin-bottom:14px;" id="b508-count">12</div>` +
            darkChoiceBtn("① 천을 전부 덮어 주며 간다.", "b508G3R('cover')") +
            darkChoiceBtn("② 눈을 감고 벽만 짚고 간다.", "b508G3R('blind')") +
            darkChoiceBtn("③ 뛰어서 빠져나간다.", "b508G3R('run')"));
        renderNoticeBar();
        mountDarkChat('normal');

        let t = 12;
        clearInterval(b508Timer);
        b508Timer = setInterval(() => {
            t--;
            const el = document.getElementById('b508-count');
            if (!el || !darkRun) { clearInterval(b508Timer); return; }
            el.innerText = t;
            if (t <= 0) { clearInterval(b508Timer); b508G3R('late'); }
        }, 1000);
    }

    function b508G3R(pick) {
        clearInterval(b508Timer);
        let txt, mod = 0;
        if (pick === 'cover') {
            txt = `천을 끌어당겨 덮어 준다. 손이 천 안으로 들어간다. 저항하지 않는다.<br><br>덮고 나자 움직임이 잦아든다.<br>다른 선반에서도 하나씩 조용해진다.<br><br>고맙다는 뜻인지, 아니면 그냥 때가 된 건지 모르겠다.`;
            mod = 2; darkRun.success++; addNotice(4, '발효실 통과');
        } else if (pick === 'blind') {
            txt = `눈을 감는다. 벽을 짚고 걷는다.<br><br>손끝에 천이 스친다. 천이 아니라 다른 것도 스친다.<br>잡히지는 않았다. 잡을 힘이 아직 없는 것 같았다.<br><br>눈을 뜨니 문 앞이다.`;
            mod = 1; darkRun.success++; addNotice(6, '발효실 통과');
            applyPollutionToUser(currentUser, 4);
        } else if (pick === 'run') {
            txt = `뛴다.<br><br>선반이 흔들리고, 천이 벗겨지고, 그 아래 것들이 전부 일어난다.<br>문을 닫는 순간 손 하나가 문틈에 끼었다.<br>손가락이 여섯이다.<br><br>문을 더 세게 닫는다.`;
            mod = -1; darkRun.fail++; addNotice(22, '발효실에서 소란');
            applyPollutionToUser(currentUser, 8);
        } else {
            txt = `망설이는 사이 천이 전부 벗겨졌다.<br><br>스물 몇 개가 동시에 일어나 앉는다. 전부 같은 방향을 본다.<br>비명은 나오지 않았다. 목이 이미 마른 상태였다.<br><br>겨우 빠져나왔다.`;
            mod = -2; darkRun.fail++; addNotice(30, '발효실에서 지체');
            applyPollutionToUser(currentUser, 12);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 3] ${pick}`);
        darkBodyEl().innerHTML = darkBox("기믹 3 — 결과", txt,
            noticeBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderNoticeBar();
        mountDarkChat('normal');
    }

        // --- 기믹 4: 계산원 (시선) ---
    function b508G4() {
        darkRun._lastMonster = 'cashier';
        renderChoiceStep("기믹 4 — 계산대",
            `계산대를 지나야 서류함에 닿는다.<br><br>계산원이 서 있다. 눈이 많고, 아직 전부 감겨 있다.<br>하나씩 순서대로 떠지고 있다. 지금 세 개쯤 떠 있다.<br><br><span style="color:#ff6b6b;">눈을 마주치면 안 된다.</span>`,
            [
                { id:'down',   label:'① 바닥만 보고 지나간다.',      fn:'b508G4R', arg:'down' },
                { id:'back',   label:'② 등을 보인 채 뒷걸음질한다.', fn:'b508G4R', arg:'back' },
                { id:'mirror', label:'③ 거울에 비친 것만 보고 간다.', fn:'b508G4R', arg:'mirror' },
                { id:'stare',  label:'④ 똑바로 마주 본다.',          fn:'b508G4R', arg:'stare' }
            ], null);
    }

    function b508G4R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = { down: 9, back: 12, mirror: 10, stare: 18 }[pick] - gearValue(currentUser, 'break');
               // b508G4R (시선)
        if (consumeQFlag('immune_sight')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("기믹 4 — 결과",
                `색안경 너머로 본다.<br><br>눈이 몇 개 떠지는 게 보이지만, 초점이 맞지 않는다.<br>마주친 것으로 치지 않는 모양이다.`,
                noticeBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderNoticeBar(); mountDarkChat('normal');
            return;
        }
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt, died = false;
        if (ok) {
            txt = pick === 'stare'
                ? `마주 본다. 눈이 전부 떠진다. 세어 보면 열두 개쯤.<br><br>한참 본다. 눈싸움이라고 부르기엔 한쪽만 눈이 많다.<br><br>먼저 감은 건 저쪽이었다.<br>지나가는 동안 다시 뜨지 않았다.`
                : pick === 'down' ? `바닥만 본다. 계산대 아래에 신발이 여럿 놓여 있다.<br>짝이 맞는 것이 하나도 없다.<br><br>세지 않고 지나간다.`
                : pick === 'back' ? `등을 보인 채 뒷걸음질한다.<br><br>보이지 않으니 더 무섭다. 목덜미가 계속 서늘하다.<br>부딪히지 않고 문에 닿았다.`
                : `유리 진열장에 비친 상만 보고 걷는다.<br><br>비친 계산원은 움직이지 않는다.<br>실제로도 움직이지 않았기를 바란다.`;
            darkRun.success++;
            addNotice(pick === 'stare' ? 12 : 5, '계산대 통과');
        } else if (roll === 1) {
            died = true;
            txt = `눈이 마주쳤다.<br><br>${B508_MONSTERS.cashier.alert}<br><br>관절 없이 접히는 다리가 생각보다 빨랐다.`;
        } else {
            txt = `시선이 스쳤다.<br><br>눈 몇 개가 이쪽을 향한 채로 멈춘다.<br>따라오지는 않는다. 아직은.`;
            darkRun.fail++;
            addNotice(25, '계산원과 시선 접촉');
            applyPollutionToUser(currentUser, 7);
        }

        darkRun.log.push(`[기믹 4] ${pick} d20 ${roll} vs DC${DC}`);
        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 4 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            noticeBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderNoticeBar();
        mountDarkChat('normal');
    }

    // --- 기믹 5: 배달원 (냄새) ---
    function b508G5() {
        darkRun._lastMonster = 'courier';
        const bleeding = (darkRun.fail || 0) >= 3;
        renderChoiceStep("기믹 5 — 오븐실",
            `배달원이 원을 그리며 돌고 있다.<br><br>코가 계속 벌름거린다. 헬멧 안에서 젖은 숨소리가 샌다.<br>${bleeding ? '<span style="color:#ff6b6b;">여기까지 오면서 어딘가 찢어졌다. 피 냄새가 난다.</span><br>' : ''}<br><span style="color:#ff6b6b;">냄새를 남기면 안 된다.</span>`,
            [
                { id:'flour', label:'① 밀가루를 뒤집어쓴다.',       fn:'b508G5R', arg:'flour' },
                { id:'heat',  label:'② 오븐 열기 쪽으로 붙어 간다.', fn:'b508G5R', arg:'heat' },
                { id:'bait',  label:'③ 반죽 조각을 던져 유인한다.',  fn:'b508G5R', arg:'bait' },
                { id:'plain', label:'④ 그냥 지나간다.',             fn:'b508G5R', arg:'plain' }
            ], "step3");
    }

    function b508G5R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const bleeding = (darkRun.fail || 0) >= 3;
        let DC = { flour: 8, heat: 10, bait: 11, plain: 15 }[pick] - gearValue(currentUser, 'break');
        if (bleeding) DC += 3;
                // b508G5R (냄새)
        if (consumeQFlag('immune_smell')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("기믹 5 — 결과",
                `수건으로 닦은 자리에서 아무 냄새도 나지 않는다.<br><br>배달원이 바로 앞을 지나간다. 코가 한 번도 멈추지 않았다.`,
                noticeBarHtml() + darkChoiceBtn("매장으로.", `partyAdvance(${darkRun.step + 1})`));
            renderNoticeBar(); mountDarkChat('normal');
            return;
        }
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt, died = false;
        if (ok) {
            txt = pick === 'flour' ? `밀가루 포대를 뜯어 뒤집어쓴다.<br><br>눈에 들어가고 목이 막힌다. 기침이 나오려는 걸 참는다.<br><br>배달원이 바로 옆을 지나간다. 코가 한 번 멈췄다가, 다시 돈다.`
                : pick === 'heat' ? `오븐 쪽 벽에 붙어 간다. 열기에 살이 익는 느낌이다.<br><br>냄새가 열에 타서 흩어진다.<br>팔뚝이 붉어졌지만 지나쳤다.`
                : pick === 'bait' ? `반죽 조각을 반대쪽으로 던진다.<br><br>배달원이 그쪽으로 달려간다. 정말 빠르다.<br>저 속도로 쫓겼으면 어땠을지 생각하지 않기로 한다.`
                : `그냥 지나간다. 운이 좋았다.<br><br>배달원이 등 뒤에서 한 번 멈췄다가, 다시 원을 그린다.`;
            darkRun.success++;
            addNotice(pick === 'plain' ? 12 : 5, '오븐실 통과');
            if (pick === 'heat') applyPollutionToUser(currentUser, 5);
        } else if (roll === 1) {
            died = true;
            txt = `코가 멈춘다.<br><br>${B508_MONSTERS.courier.alert}<br><br>배달통이 열리는 소리를 마지막으로 들었다.`;
        } else {
            txt = `헬멧이 이쪽으로 기울어진다.<br><br>알아차렸다. 다만 아직 확신하지 못한 모양이다.<br>천천히 이쪽으로 원을 좁혀 온다.`;
            darkRun.fail++;
            addNotice(26, '배달원에게 냄새 노출');
            applyPollutionToUser(currentUser, 8);
        }

        darkRun.log.push(`[기믹 5] ${pick} d20 ${roll} vs DC${DC}`);
        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 5 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            noticeBarHtml() + darkChoiceBtn("매장으로.", `partyAdvance(${darkRun.step + 1})`));
        renderNoticeBar();
        mountDarkChat('normal');
    }

    // --- 기믹 6: 포장 (타이밍) ---
    let b508PackTimer = null, b508PackOn = false, b508PackHit = 0;
    function b508G6() {
        darkBodyEl().innerHTML = darkBox("기믹 6 — 포장",
            `포장대 위에 봉지가 있다.<br><br>기계가 주기적으로 봉지 입구를 봉한다.<br>봉해지는 순간에 손이 들어가 있으면 안 된다.<br><br><span style="color:#888; font-size:11px;">[초록일 때 눌러 서류를 넣으세요 — 3회]</span>`,
            noticeBarHtml() +
            `<div id="b508-seal" style="width:56px; height:56px; border-radius:50%; margin:0 auto 14px auto; background:#3a0000; border:3px solid #444;"></div>
             <div style="text-align:center; font-size:12px; color:#aaa; margin-bottom:10px;">넣은 횟수: <b id="b508-pack" style="color:var(--theme-focus);">0</b> / 3</div>
             <button class="game-btn" id="b508-pack-btn" style="width:100%; margin:0; padding:14px;" onclick="b508PackTap()">넣는다</button>
             <div id="b508-pack-msg" style="font-size:11px; color:#888; text-align:center; margin-top:10px; min-height:16px;"></div>`);
        renderNoticeBar();
        mountDarkChat('normal');

        b508PackHit = 0; b508PackOn = false;
        clearTimeout(b508PackTimer);
        const lamp = document.getElementById('b508-seal');
        function cycle() {
            b508PackOn = !b508PackOn;
            if (lamp) {
                lamp.style.background = b508PackOn ? '#1b5e20' : '#3a0000';
                lamp.style.boxShadow = b508PackOn ? '0 0 18px #4CAF50' : 'none';
            }
            clearTimeout(b508PackTimer);
            b508PackTimer = setTimeout(cycle, b508PackOn ? (520 + Math.random()*380) : (700 + Math.random()*600));
        }
        cycle();
    }

    function b508PackTap() {
        if (!darkRun) return;
        const msg = document.getElementById('b508-pack-msg');
        if (b508PackOn) {
            b508PackHit++;
            document.getElementById('b508-pack').innerText = b508PackHit;
            msg.innerHTML = `<span style="color:#4CAF50;">넣었다.</span>`;
        } else {
            msg.innerHTML = `<span style="color:#f44336;">기계가 물었다. 손가락이 아니어서 다행이다.</span>`;
            addNotice(9, '포장 실패');
            applyPollutionToUser(currentUser, 4);
        }
        if (b508PackHit >= 3) {
            clearTimeout(b508PackTimer);
            document.getElementById('b508-pack-btn').disabled = true;
            darkRun.success++;
            setTimeout(() => {
                darkBodyEl().innerHTML = darkBox("기믹 6 — 결과",
                    `서류를 봉지 안에 밀어 넣는다.<br><br>기계가 입구를 봉한다. 깔끔하게.<br>바깥에서 보면 그냥 상품이다.<br><br>이제 실려 나가기만 하면 된다.`,
                    noticeBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
                renderNoticeBar();
                mountDarkChat('normal');
            }, 900);
        }
    }

    // --- 기믹 7: 출고 ---
    function b508G7() {
        const need = b508RequiredDocs();
        const got = foundCount() + (darkRun._gotKey ? 1 : 0);
        const enough = got >= need;
        const luckVal = gearValue(currentUser, 'luck');
        const canTryKey = !enough && !darkRun._keyTried;
        darkBodyEl().innerHTML = darkBox("기믹 7 — 출고",
            `셔터가 절반쯤 내려왔다.<br><br>출고대 앞이다. 검수 담당이 서류를 받아 넘긴다.<br>숫자가 맞으면 상품, 아니면 폐기.<br><br>
             <div style="background:rgba(0,0,0,0.35); border:1px solid #5a4a2a; border-radius:6px; padding:12px; font-size:12px; line-height:1.9; margin-top:6px;">
                확보한 서류 <b style="color:${enough ? '#4CAF50' : '#f44336'};">${got}</b> / ${need}장<br>
                ${enough ? '<span style="color:#4CAF50;">요건을 충족했다.</span>' : '<span style="color:#f44336;">모자란다.</span>'}
             </div>`,
            noticeBarHtml() +
            (enough
                ? darkChoiceBtn("서류를 내민다.", "b508Ship(true)")
                : (canTryKey
                    ? darkChoiceBtn(`✺ 주머니를 뒤진다. (행운)`, "b508TryKey()") + darkChoiceBtn("그냥 내민다.", "b508Ship(false)")
                    : darkChoiceBtn("그냥 내민다.", "b508Ship(false)"))));
        renderNoticeBar();
        mountDarkChat('normal');
    }

       function b508TryKey() {
        darkRun._keyTried = true;
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const luckVal = gearValue(currentUser, 'luck');
        const DC = Math.max(4, 12 - Math.round(luckVal * 14));
        const ok = roll >= DC;

        if (ok) {
            darkRun._gotKey = true;
            darkRun.log.push(`[출고] 행운으로 열쇠 확보 (d20 ${roll} vs DC${DC})`);
            sendPartyChat(`${currentUser.name} 사원이 주머니에서 무언가를 꺼냈습니다.`, true);
        }

        darkBodyEl().innerHTML = darkBox("주머니",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(DC ${DC})</span></div>` +
            (ok
                ? `주머니에 뭔가 잡힌다.<br><br>작은 열쇠다. 언제 들어왔는지 모르겠다.<br>손잡이에 글자가 새겨져 있다. <span style="color:#d4af37;">"출고"</span><br><br>검수 담당이 그걸 보고 고개를 끄덕인다.<br>서류 한 장 값은 되는 모양이다.`
                : `주머니를 뒤진다.<br><br>단추 하나, 밀가루, 그리고 손가락에 묻은 것.<br>쓸모 있는 건 없었다.`),
            darkChoiceBtn("서류를 내민다.", `b508Ship(${ok})`));
        mountDarkChat('normal');
    }

    function b508Ship(enough) {
        if (enough) {
            darkRun.success += 2;
            darkRun.log.push(`[출고] 성공`);
            darkBodyEl().innerHTML = darkBox("출고",
                `검수 담당이 서류를 한 장씩 넘긴다.<br>도장이 찍히는 소리가 규칙적이다.<br><br>마지막 장에서 멈춘다. 한참 본다.<br>그리고 봉지 입구를 봉한다.<br><br><span style="color:#d4af37;">"정상 출고품입니다. 감사합니다."</span>`,
                darkChoiceBtn("실려 나간다.", "darkRun.step=99; renderDarkStep();"));
            mountDarkChat('normal');
            return;
        }

        // ★ 서류 부족 — 즉사가 아니라 판정
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = 20;
        const survived = roll !== 1 && (roll + bonus) >= DC;

        darkRun.fail += 2;
        darkRun.failedRun = true;
        darkRun.log.push(`[출고] 서류 부족 — d20 ${roll} vs DC${DC}`);

        if (survived) {
            applyPollutionToUser(currentUser, 12);
            darkBodyEl().innerHTML = darkBox("출고",
                `검수 담당이 서류를 센다. 두 번 센다.<br><br>고개를 젓는다.<br><span style="color:#d4af37;">"폐기 처리하겠습니다."</span><br><br>` +
                `폐기함으로 옮겨지는 동안, 봉지 옆이 터져 있는 걸 발견한다.<br>` +
                `수거차가 흔들리는 순간 빠져나온다.<br><br>` +
                `골목에 떨어졌다. 보상은 없다. 다만 살아 있다.`,
                darkChoiceBtn("기어 나간다.", "darkRun.step=99; renderDarkStep();"));
            mountDarkChat('normal');
        } else {
            darkDeath(
                `검수 담당이 서류를 센다. 두 번 센다.<br><br>고개를 젓는다. 미안해하는 표정이다. 진심으로.<br><br>` +
                `<span style="color:#d4af37;">"폐기 처리하겠습니다. 다음에는 더 신선하게 오세요."</span>`
            );
        }
    }

        // --- 지목 ---
      // --- 지목 ---
    function renderB508Mark(n) {
        const need5 = (darkRun.memberCount || 3) >= 5;
        if (n === 2 && !need5) { partyAdvance(darkRun.step + 1); return; }

        const key = `b508mark${n}`;
        if (darkRun.isLeader && database && !darkRun[`_${key}Set`]) {
            darkRun[`_${key}Set`] = true;
            database.ref(`darkParties/${darkRun.partyId}/alive`).once('value').then(sn => {
                const alive = Object.keys(sn.val() || {});
                if (alive.length === 0) return;
                const t = alive[Math.floor(Math.random() * alive.length)];
                database.ref(`darkParties/${darkRun.partyId}/${key}`).set({ target: t, at: Date.now() });
            });
        }

        if (!database) { partyAdvance(darkRun.step + 1); return; }

        database.ref(`darkParties/${darkRun.partyId}/${key}`).on('value', sn => {
            const m = sn.val();
            if (!m || !darkRun || darkRun[`_${key}Shown`]) return;
            darkRun[`_${key}Shown`] = true;
            const isMe = m.target === currentUser.code;

            darkBodyEl().innerHTML = darkBox("—",
                isMe
                    ? `포대가 하나 더 필요하다고, 누군가 말한다.<br><br>어깨에 손이 걸린다. 밀가루가 묻은 손이다.<br>가볍게 끌린다. 저항할 틈이 없을 만큼 자연스럽게.<br><br>버틸 수 있을까.`
                    : `옆에 있던 사람이 사라진다.<br><br>소리도 없었다. 포대 하나가 계단 위로 올라가는 것만 보였다.<br>포대 안쪽에서 자세를 고치는 움직임.<br><br>부르지 않기로 한다. 여기서 소리를 내면 안 된다.`,
                noticeBarHtml() + (isMe
                    ? darkChoiceBtn("버틴다.", `b508Resist(${n})`)
                    : darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)));
            renderNoticeBar();
            mountDarkChat('normal');
        });
    }

    function b508Resist(n) {
                if (consumeQFlag('no_mark')) {
            darkRun.success++;
            darkBodyEl().innerHTML = darkBox("—",
                `명찰을 내민다.<br><br>손이 멈춘다. 이름이 목록에 없는 모양이다.<br>다른 쪽으로 간다.`,
                darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            mountDarkChat('normal');
            return;
        }
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = 15;
        const taken = roll === 1 || (roll + bonus) < DC;

        let txt;
        if (taken) {
            txt = `버텨 보지만 소용없다.<br><br>손이 하나 더 늘어난다. 그리고 또 하나.<br>발이 바닥에서 뜨고, 천장이 멀어진다.<br><br>계단 위로 올라간다. 위층은 조명이 더 밝았다.`;
            darkRun.taken = true;
            darkRun.upperIdx = 0;
            darkRun.fail++;
            if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({ name: currentUser.name, at: Date.now() });
            sendPartyChat(`${currentUser.name} 사원이 위층으로 끌려갔습니다.`, true);
        } else {
            txt = `팔꿈치로 밀어낸다. 살이 물컹하게 들어갔다가 돌아온다.<br><br>손이 놓인다. 놓아준 게 아니라 흥미를 잃은 것 같다.<br><br>돌아보니 아무도 없다. 밀가루 자국만 어깨에 남았다.`;
            darkRun.success++;
            addNotice(10, '지목 저항');
        }

        darkRun.log.push(`[지목 ${n}] d20 ${roll} vs DC${DC} — ${taken ? '끌려감' : '저항'}`);
        darkBodyEl().innerHTML = darkBox("—",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${taken?'#f44336':'#4CAF50'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            taken
                ? darkChoiceBtn("눈을 뜬다.", "renderB508Upper();")
                : darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        mountDarkChat('normal');
    }

    // --- 2층 ---
    const B508_UPPER = [
        { text:`눈을 뜬다. 작업대 위다.<br><br>천장 조명이 수술실처럼 밝다. 그늘이 생기지 않는다.<br>몸은 묶여 있지 않다. 묶을 필요가 없다고 판단한 모양이다.<br><br>일어나 앉는다. 방이 넓다. 가구가 많다.<br><br>의자 하나가 아주 천천히 이쪽으로 방향을 바꿨다.`,
          opts:[ {l:'① 가구를 자세히 본다.', v:'look'}, {l:'② 보지 않고 문을 찾는다.', v:'door'} ] },

        { text:`의자다. 등받이에 결이 있고, 다리에 관절이 있다.<br><br>앉는 자리 천이 아주 얕게 오르내린다.<br>숨이다.<br><br>테이블도 마찬가지다. 상판이 미지근하다.<br>손을 대자 상판 아래에서 뭔가가 손을 따라 움직였다.<br><br>벽에 걸린 액자에는 가죽이 발려 있다. 무두질이 잘 되어 있다.<br>가장자리에 점이 있다. 점은 무두질로 지워지지 않는다.`,
          opts:[ {l:'① 의자에게 말을 건다.', v:'talk'}, {l:'② 액자를 떼어 낸다.', v:'frame'}, {l:'③ 아무것도 하지 않는다.', v:'still'} ] },

        { text:`방 안쪽에서 소리가 난다.<br><br>비명이다. 짧고, 높고, 정확히 같은 길이로 반복된다.<br>일정한 간격으로. 녹음처럼.<br><br>소리를 따라가니 선반이 있다.<br>장신구가 늘어서 있다. 팔찌, 목걸이, 귀걸이.<br>전부 뼈다. 잘 다듬었다.<br><br>그중 하나가 소리를 내고 있다. 반지다.<br>아주 작은 목소리로, 같은 말을 반복한다.`,
          opts:[ {l:'① 반지를 집어 든다.', v:'take'}, {l:'② 귀를 막는다.', v:'ear'}, {l:'③ 뭐라고 하는지 듣는다.', v:'listen'} ] }
    ];

    function renderB508Upper() {
        if (!darkRun) return;
        if (darkRun.upperIdx == null) darkRun.upperIdx = 0;
        attachB508Listener();

        if (darkRun.upperIdx >= B508_UPPER.length) { renderSearch('upper'); return; }

        const d = B508_UPPER[darkRun.upperIdx];
        darkBodyEl().innerHTML = darkBox("2층 — 혼자", d.text,
            noticeBarHtml() +
            d.opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="b508UpperPick('${o.v}')">${o.l}</button>`).join(''));
        renderNoticeBar();
        mountDarkChat('normal');
    }

    function b508UpperPick(v) {
        let txt, mod = 0;
        const good = ['door','still','ear','frame'];
        const bad  = ['talk','take','listen'];

        if (v === 'listen') {
            txt = `귀를 가까이 댄다.<br><br>반지가 말한다. 아주 작게, 같은 말을.<br><span style="color:#d4af37;">"...괜찮아요... 금방... 끝나요..."</span><br><br>누군가를 안심시키려던 말이었을 것이다.<br>그 말을 지금도 하고 있다.`;
            mod = -1; applyPollutionToUser(currentUser, 10);
        } else if (v === 'talk') {
            txt = `의자에게 말을 건다. 이름을 묻는다.<br><br>대답은 없다. 다만 등받이가 아주 천천히 이쪽으로 기울었다.<br>기대라는 뜻인지, 도망가라는 뜻인지 모르겠다.<br><br>기대지 않았다.`;
            mod = -1; applyPollutionToUser(currentUser, 8);
        } else if (v === 'take') {
            txt = `반지를 집는다. 따뜻하다.<br><br>손에 쥐자 소리가 멎는다.<br>놓자 다시 시작된다.<br><br>주머니에 넣는다. 소리가 계속 난다. 주머니 안에서.`;
            mod = 0; applyPollutionToUser(currentUser, 6);
        } else {
            txt = `그렇게 한다.<br><br>아무 일도 일어나지 않는다.<br>여기서는 그게 최선이다.`;
            mod = 1;
        }

        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.upperIdx = (darkRun.upperIdx || 0) + 1;
        darkRun.log.push(`[2층] ${v}`);

        darkBodyEl().innerHTML = darkBox("2층 — 결과", txt,
            darkChoiceBtn(darkRun.upperIdx >= B508_UPPER.length ? "서류를 찾는다." : "계속 본다.", "renderB508Upper();"));
        mountDarkChat('normal');
    }

        function buildBakeryAmbience(ctx, master) {
        // 오븐 저역
        const low = ctx.createOscillator();
        const lowG = ctx.createGain();
        low.type = 'sine'; low.frequency.value = 52;
        lowG.gain.value = 0.09;
        low.connect(lowG); lowG.connect(master);
        low.start(); darkAudio.nodes.push(low);

        // 환풍기
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 7);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 400;
        const nG = ctx.createGain(); nG.gain.value = 0.12;
        noise.connect(lp); lp.connect(nG); nG.connect(master);
        noise.start(); darkAudio.nodes.push(noise);

        // 반죽 치는 소리 — 젖고 규칙적
        function knead() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const src = ctx.createBufferSource();
            src.buffer = makeNoiseBuffer(ctx, 0.3);
            const bp = ctx.createBiquadFilter();
            bp.type = 'lowpass'; bp.frequency.value = 220;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.1, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0008, t + 0.3);
            src.connect(bp); bp.connect(g); g.connect(master);
            src.start(t); src.stop(t + 0.35);
            darkAudio.timers.push(setTimeout(knead, 1100 + Math.random() * 200));
        }
        darkAudio.timers.push(setTimeout(knead, 800));

        // 가끔 섞이는 짧고 높은 소리
        function cry() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(680 + Math.random() * 300, t);
            osc.frequency.exponentialRampToValueAtTime(420, t + 0.18);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 5;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.03, t + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0005, t + 0.22);
            osc.connect(bp); bp.connect(g); g.connect(master);
            osc.start(t); osc.stop(t + 0.28);
            darkAudio.timers.push(setTimeout(cry, 13000 + Math.random() * 22000));
        }
        darkAudio.timers.push(setTimeout(cry, 7000 + Math.random() * 8000));

        // 오븐 타이머
        function bell() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            for (let k = 0; k < 3; k++) {
                const tt = t + k * 0.35;
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1180, tt);
                g.gain.setValueAtTime(0.035, tt);
                g.gain.exponentialRampToValueAtTime(0.0004, tt + 0.3);
                osc.connect(g); g.connect(master);
                osc.start(tt); osc.stop(tt + 0.35);
            }
            darkAudio.timers.push(setTimeout(bell, 26000 + Math.random() * 30000));
        }
        darkAudio.timers.push(setTimeout(bell, 15000 + Math.random() * 12000));
    }

        // ==========================================
    // ★ 특수 장비 효과
    // ==========================================
    function hasEquip(user, name) {
        if (!user || !user.equippedWeapons) return false;
        return user.equippedWeapons.some(w => getEquipBaseName(w) === name);
    }

    // 착한 친구 + 유리손포 — 공용시설 행운 배율
    function facilityLuckMult(user) {
    let m = 1;
    if (hasEquip(user, '착한 친구')) m *= 1.15;
    if (hasEquip(user, '유리손포')) m *= 1.15;
    return m;
}

    // 착한 친구 — 어둠 판정 행운 보정
    function rabbitBonus(user) {
        return hasEquip(user, '착한 친구') ? 0.5 : 0;
    }

    // 작두 — 기믹 1회 무조건 성공
    function jakduAvailable() {
        return darkRun && !darkRun._jakduUsed && hasEquip(currentUser, '작두');
    }

    function useJakdu() {
        if (!jakduAvailable()) return false;
        darkRun._jakduUsed = true;
        darkRun.log.push('[작두] 기믹 강제 돌파');
        return true;
    }
        // ==========================================
    // ★ ??? 상점
    // ==========================================
    const QSHOP_OPEN = 13;   // 13시 개점
    const QSHOP_CLOSE = 22;  // 22시 폐점

        function qshopIsOpen() {
        return true;
    }

       function qshopSlotKey() {
        const now = new Date();
        const slot = Math.floor(now.getHours() / 4);
        return `${getTodayStr()}-s${slot}`;
    }

    function qshopItems() {
        const all = Object.keys(ITEM_CATALOG).filter(k => ITEM_CATALOG[k].qShop);
        const key = qshopSlotKey();
        let seed = 0;
        for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i) * (i + 7);
        const shuffled = all.slice().sort((a, b) => {
            const ra = Math.sin(seed + a.length * 17 + a.charCodeAt(0)) * 10000;
            const rb = Math.sin(seed + b.length * 17 + b.charCodeAt(0)) * 10000;
            return (ra - Math.floor(ra)) - (rb - Math.floor(rb));
        });
        return shuffled.slice(0, 15);
    }

    function renderQShop() {
        const box = document.getElementById('qshop-body');
        if (!box || !currentUser) return;

        if (!qshopIsOpen()) {
            const h = new Date().getHours();
            box.innerHTML = `
                <div style="padding:34px 12px; text-align:center; font-family:monospace; font-size:12px; color:#555; line-height:2.2; border:1px solid rgba(255,76,76,0.2); border-radius:6px; background:rgba(255,0,0,0.03);">
                    [SIGNAL LOST]<br>
                    ■■■■■■■■■■<br><br>
                    <span style="color:#666; font-family:'Malgun Gothic',sans-serif; font-size:11px;">
                        ${h < QSHOP_OPEN ? `${QSHOP_OPEN}시부터 연결됩니다.` : '금일 연결이 종료되었습니다.'}
                    </span>
                </div>`;
            return;
        }

        const items = qshopItems();
        const cycleKey = qshopSlotKey();
        if (!currentUser.qshopRecord) currentUser.qshopRecord = {};
        if (!currentUser.qshopRecord[cycleKey]) currentUser.qshopRecord[cycleKey] = {};
        const rec = currentUser.qshopRecord[cycleKey];

                const now = new Date();
        const nextSwap = new Date(now);
        const nextH = (Math.floor(now.getHours() / 4) + 1) * 4;
        nextSwap.setHours(nextH, 0, 0, 0);
        const remainMin = Math.max(0, Math.floor((nextSwap - now) / 60000));
        box.innerHTML = `
            <div style="text-align:center; font-family:monospace; font-size:13px; color:#888; letter-spacing:3px; padding:14px 0 16px 0; border-bottom:1px dashed #333; margin-bottom:14px;">
                클리어를 바랍니다.
            </div>
            <div style="font-size:10px; color:#666; text-align:center; margin-bottom:14px;">
                진열은 ${Math.floor(remainMin / 60)}시간 ${remainMin % 60}분 뒤에 바뀝니다. · 항목당 2개 한정
            </div>
            ${items.map(name => {
                const it = ITEM_CATALOG[name];
                const bought = rec[name] || 0;
                const left = currentUser.code === 'kario0987' ? 99 : Math.max(0, 2 - bought);
                const soldOut = left === 0;
                return `
                    <div class="shop-item ${soldOut ? 'sold-out' : ''}" style="border-color:#3a3a3a;">
                        <div style="flex:1; min-width:0;">
                            <span style="font-weight:bold; font-size:12px;">${name}</span>
                            <span style="font-size:10px; color:#666; margin-left:5px;">${left === 99 ? '' : `(${left}/2)`}</span><br>
                            <span style="font-size:10px; color:#888; line-height:1.5;">${it.desc.replace('[???] ', '')}</span>
                        </div>
                        <button ${soldOut ? 'disabled' : ''} onclick="buyQShopItem('${name}', ${it.price})" style="flex-shrink:0;">
                            ${soldOut ? '품절' : it.price + ' P'}
                        </button>
                    </div>`;
            }).join('')}
            <div style="text-align:center; font-size:9px; color:#333; font-family:monospace; margin-top:16px;">
                ■■■■■■■■■■■■■■
            </div>`;
    }

    function buyQShopItem(name, price) {
                if (!buyGuard()) return;
        if (!qshopIsOpen()) { showCustomAlert('연결이 끊어졌습니다.'); return; }
        const cycleKey = qshopSlotKey();
        if (!currentUser.qshopRecord) currentUser.qshopRecord = {};
        if (!currentUser.qshopRecord[cycleKey]) currentUser.qshopRecord[cycleKey] = {};
        const bought = currentUser.qshopRecord[cycleKey][name] || 0;

        if (currentUser.code !== 'kario0987' && bought >= 2) { showCustomAlert('이 진열에서는 더 가져갈 수 없습니다.'); return; }
        if (currentUser.points < price) { showLuxuryAlert(); return; }

        currentUser.points -= price;
        currentUser.qshopRecord[cycleKey][name] = bought + 1;
        currentUser.inventory.push(name);
        addHistoryLog(currentUser, `[??? 구매] ${name} (-${price} P)`);

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveFields({ points:1, inventory:1, history:1 });
        updateUI();
        renderQShop();
    }
        // ==========================================
    // ★ ??? 소모품 효과
    // ==========================================
    function qFlag(name) {
        return darkRun && darkRun.qFlags && darkRun.qFlags[name];
    }

    function setQFlag(name, val) {
        if (!darkRun) return;
        if (!darkRun.qFlags) darkRun.qFlags = {};
        darkRun.qFlags[name] = val;
    }

      function consumeQFlag(name) {
        if (!qFlag(name)) return false;
        delete darkRun.qFlags[name];
        showDarkToast('◈ ' + (QFLAG_LABELS[name] || name).split(' —')[0] + ' 소진');
        return true;
    }

    // 탐사 밖에서 쓴 효과는 유저 객체에 저장했다가 진입 시 옮긴다
    function moveUserQFlags() {
        if (!darkRun || !currentUser.qPending) return;
        darkRun.qFlags = Object.assign({}, darkRun.qFlags || {}, currentUser.qPending);
        currentUser.qPending = null;
        saveDB();
    }

    function addPendingFlag(name, val) {
        if (!currentUser.qPending) currentUser.qPending = {};
        currentUser.qPending[name] = val;
    }

        function openGearReattr(itemName) {
        const g = getGear(currentUser);
        if (!g) return;
        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                지울 속성을 고르세요. 지운 뒤 새로 선택할 수 있습니다.<br>
                <span style="color:#ff9800;">변경권은 즉시 소모됩니다.</span>
            </div>` +
            g.attrs.map(a => `
                <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px; margin-bottom:8px;">
                    <div style="font-size:13px; color:#d4bbff; font-weight:bold;">${GEAR_ATTRS[a].icon} ${GEAR_ATTRS[a].name}</div>
                    <div style="font-size:10px; color:#999; margin:5px 0 8px 0;">${GEAR_ATTRS[a].desc}</div>
                    <button class="game-btn" style="width:100%; margin:0; padding:8px; font-size:11px;" onclick="doGearReattr('${a}','${itemName}')">이것을 지운다</button>
                </div>`).join('');
        openGearModal('속성 변경', html);
    }

    function doGearReattr(attr, itemName) {
        const g = getGear(currentUser);
        if (!g) return;
        g.attrs = g.attrs.filter(a => a !== attr);
        removeItemFromInventory(currentUser, itemName, 1);
        addHistoryLog(currentUser, `[??? 사용] 속성 변경권 — ${GEAR_ATTRS[attr].name} 속성을 지웠습니다.`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser); else saveDB();
        closeGearModal();
        updateUI();
        showCustomAlert(`${GEAR_ATTRS[attr].name} 속성이 지워졌습니다.\n소지품 탭에서 새로 선택하세요.`);


    }

        // ==========================================
    // ★ Qtrew-C-176 「돌아오지 않는 발소리」
    // ==========================================
       const C176_NARR = {
        1: { img:'step1', text:`복도를 걷는다.<br><br>
            긁는 소리가 점점 가까워진다. 복도 끝에 문이 하나 있다.<br>
            소리는 그 안에서 난다. 안쪽에서 바깥으로.<br><br>
            나가고 싶은 것이다. 그것만은 확실하다.<br><br>
            손잡이를 잡는다. 잠겨 있지는 않다.<br>
            다만 안쪽에서는 여는 법을 모르는 모양이다.<br>
            손잡이가 아니라 문 아래쪽만 계속 긁고 있다.<br><br>
            그 높이를 알고 있다.<br>
            현관에서 그 높이만큼만 기다리던 것이 있었다.` },

        2: { text:`벽에 글자가 있다.<br><br>
            손으로 쓴 것도, 새긴 것도 아니다.<br>
            김이 서린 유리에 쓴 것처럼, 보는 각도에 따라 나타났다 사라진다.<br><br>
            세 글자쯤 되는 것 같기도 하고, 두 글자인 것 같기도 하다.<br>
            읽으려고 하면 흐려지고, 포기하면 다시 떠오른다.<br><br>
            아는 이름이다.<br>
            하루에 몇 번씩 불렀던 이름. 밥그릇 앞에서, 현관에서, 잠들기 전에.<br>
            부르면 늘 대답이 왔다. 말은 아니었지만 대답이었다.<br><br>
            소리 내어 불러 본 지 오래됐다.` },

        3: { text:`이름을 말하자 긁는 소리가 멎었다.<br><br>
            잠깐의 정적. 그리고 다른 소리가 시작된다.<br>
            무언가가 이쪽으로 오고 있다.<br><br>
            작은 발소리 같기도 하고, 어딘가 톡톡 튀는 소리 같기도 하다.<br>
            울음소리일까. 대체 뭐지.<br><br>
            빠르다. 서두르는 게 아니라 반가워서 빠른 속도다.<br>
            그런 속도를 내는 것은 하나뿐이었다.<br><br>
            무섭지는 않다.<br>
            그게 더 이상하다. 여기서는 전부 무서워야 하는데.` },

        4: { img:'step2', text:`복도가 조금 밝아졌다.<br><br>
            바닥에 흩어져 있던 것들이 이제 형태가 보인다.<br>
            아까는 뼈처럼 보였는데, 아니었다.<br><br>
            고무로 된 것. 한쪽이 닳아 반들반들하다.<br>
            천으로 된 것. 솜이 비어져 나왔는데도 버리지 못한 것.<br>
            딸랑거리는 것. 소리가 나야 좋아했으니까.<br><br>
            전부 누군가 오래 가지고 논 것들이다.<br><br>
            치우지 못한 사람도 있었을 것이다.<br>
            치웠다가 다시 꺼내 본 사람도 있었을 것이다.` },

        5: { text:`물건들 사이에 앉는다.<br><br>
            하나를 집어 든다. 이빨 자국이 있다. 작다.<br>
            물어뜯을 때 고개를 흔들던 방향까지 자국에 남아 있다.<br><br>
            다른 걸 집는다. 털이 붙어 있다.<br>
            색이 기억난다. 손바닥에 닿던 감촉도 기억난다.<br>
            빗질할 때 그렇게 싫어하더니, 다 하고 나면 옆에 와서 누웠다.<br><br>
            여기 있는 것들은 남의 것이 아니다.<br>
            그런데 어느 것이 그 아이 것이었는지는 헷갈린다.<br><br>
            매일 봤던 것인데.<br>
            그게 미안하다.<br>
            잊은 게 아니라 흐려진 거라고, 스스로에게 몇 번 설명해 봤다.` },

        6: { text:`소리가 여러 겹으로 들린다.<br><br>
            어디선가 들었던 소리들이다. 전부 조금씩 비슷하고, 조금씩 다르다.<br><br>
            현관문 열리는 소리에 반응하던 소리.<br>
            간식 봉지 뜯는 소리를 듣고 달려오던 소리.<br>
            밤에 혼자 자기 싫어서 문 앞에서 내던 소리.<br><br>
            그중 하나만 그 아이 것이다.<br><br>
            매일 들었던 소리인데 지금은 구분이 안 된다.<br>
            사진은 남는데 소리는 남지 않는다.<br>
            그걸 나중에야 알았다.<br><br>
            녹음해 둘걸.<br>
            그런 생각을 해 본 사람이 여기까지 온 것 같다.` },

        7: { img:'step3', text:`복도 끝이다.<br><br>
            문틈으로 빛이 새어 나온다. 형광등이 아니라 다른 빛이다.<br>
            오후 세 시쯤의 볕 같다. 창가에 네모나게 떨어지던 그 빛.<br><br>
            그 자리를 좋아했다.<br>
            해가 옮겨 가면 따라서 옮겨 눕던 것도 기억난다.<br>
            그 모습이 바보 같아서 자주 웃었다.<br><br>
            긁는 소리는 이제 나지 않는다.<br>
            대신 문 바로 뒤에 기척이 있다.<br><br>
            앉아서 기다리고 있다.<br>
            오래 기다린 자세로. 그런데 지친 기색은 없는 자세로.` },

        8: { text:`문 앞에 선다.<br><br>
            손잡이가 아까보다 낮아 보인다.<br>
            아니면 이쪽이 앉은 건지도 모르겠다.<br><br>
            열면 만날 수 있을까.<br>
            만나면, 다시 보내야 할까.<br><br>
            마지막을 기억한다. 품이 가벼웠던 것도.<br>
            괜찮다고 말해 줬어야 했는데 그 말이 안 나왔던 것도.<br>
            대신 이름만 계속 불렀다. 그게 전부였다.<br><br>
            지금이라면 뭐라고 할까.<br><br>
            손이 손잡이 위에서 멈춰 있다. 한참을.<br>
            뒤에서 무언가 꼬리를 흔드는 소리가 난다.<br>
            소리가 날 리 없는데, 들린다.` }
    };

    const C176_STEPS = {
        0: { type:'intro' },
        1: { type:'narr', n:1 },
        2: { type:'narr', n:2 },
        3: { type:'puzzle', n:1 },   // 이름
        4: { type:'narr', n:3 },
        5: { type:'narr', n:4 },
        6: { type:'puzzle', n:2 },   // 물건
        7: { type:'narr', n:5 },
        8: { type:'narr', n:6 },
        9: { type:'puzzle', n:3 },   // 소리
        10:{ type:'narr', n:7 },
        11:{ type:'narr', n:8 },
        12:{ type:'puzzle', n:4 },   // 마지막 문
        99:{ type:'result' }
    };

    function renderStepC176() {
        const body = darkBodyEl();
        if (!body || !darkRun) return;
        if (darkRun.isParty) watchPartyStep();
        saveDarkRunState();

        const def = C176_STEPS[darkRun.step];
        if (!def) { renderDarkResult(); return; }

                if (def.type === 'intro') {
            body.innerHTML = darkBox("진입",
                `<div style="background:rgba(255,152,0,0.07); border:1px solid #7a5200; border-radius:6px; padding:12px; margin-bottom:14px; font-size:11px; color:#ffb74d; line-height:1.8;">
                    <b>⚠ 사전 안내</b><br>
                    이 구역은 반려동물과의 이별을 다룹니다.<br>
                    <span style="color:#aaa;">지금 돌아가셔도 탐사 횟수는 소모되지 않습니다.</span>
                 </div>` +
                DARK_ZONES[darkRun.zone].intro,
                darkChoiceBtn("복도를 걷는다.", "c176Advance(1)") +
                `<button class="game-btn" style="width:100%; margin:8px 0 0 0; padding:11px; font-size:11px;" onclick="c176Withdraw()">돌아간다</button>`,
                "intro");
            if (darkRun.isParty) mountDarkChat('normal');
            return;
        }

        if (def.type === 'narr') {
            const d = C176_NARR[def.n];
            body.innerHTML = darkBox("—", d.text,
                darkChoiceBtn("계속 간다.", `c176Advance(${darkRun.step + 1})`), d.img);
            if (darkRun.isParty) mountDarkChat('normal');
            return;
        }

        if (def.type === 'result') { renderDarkResult(); return; }

        const fns = { 1:c176Name, 2:c176Item, 3:c176Sound, 4:c176Door };
        if (fns[def.n]) fns[def.n]();
    }

    // 이 구역은 각자 진행 (파티여도 동기화하지 않음)
    function c176Advance(next) {
        if (!darkRun) return;
        darkRun.step = next;
        renderDarkStep();
    }

        // ==========================================
    // ★ C-176 퍼즐
    // ==========================================
    function c176Name() {
        const body = darkBodyEl();
        body.innerHTML = darkBox("벽",
            `글자에 손을 댄다.<br><br>
             따뜻하다. 벽이 아니라 숨결 같다.<br>
             손가락을 떼면 다시 흐려진다.<br><br>
             읽는 것으로는 안 되는 모양이다.<br>
             불러야 한다.`,
            `<div style="font-size:11px; color:#888; text-align:center; margin-bottom:10px; line-height:1.7;">
                이름을 적어 주세요.<br>
                <span style="font-size:10px; color:#666;">당신이 알던 이름이면 됩니다.</span>
             </div>
             <input type="text" id="c176-name" maxlength="20" placeholder="" style="width:100%; padding:13px; font-size:15px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') c176NameSubmit()">
             <button class="game-btn" style="width:100%; margin:0; padding:13px;" onclick="c176NameSubmit()">부른다</button>`,
            "step1");
        if (darkRun.isParty) mountDarkChat('normal');
        setTimeout(() => { const f = document.getElementById('c176-name'); if (f) f.focus(); }, 200);
    }

    function c176NameSubmit() {
        const el = document.getElementById('c176-name');
        if (!el) return;
        const name = el.value.trim();
        if (!name) { showCustomAlert('이름을 적어 주세요.'); return; }

        darkRun.petName = name;
        darkRun.success++;
        darkRun.log.push(`[C-176] 이름을 불렀다`);
        if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원이 누군가의 이름을 불렀습니다.`, true);

        c176Warm(1);

        darkBodyEl().innerHTML = darkBox("벽",
            `<div style="text-align:center; font-size:22px; color:#d4af37; font-weight:bold; letter-spacing:3px; margin:8px 0 18px 0;">${name}</div>
             글자가 선명해진다.<br><br>
             벽에서 떨어져 나와 공중에 잠깐 떠 있다가, 흩어진다.<br>
             연기처럼이 아니라 털처럼.<br><br>
             복도 저쪽에서 뭔가 벌떡 일어나는 소리가 났다.`,
            darkChoiceBtn("귀를 기울인다.", `c176Advance(${darkRun.step + 1})`));
        if (darkRun.isParty) mountDarkChat('normal');
    }

        const C176_ITEMS = [
        { id:'doll',  label:'한쪽이 닳은 인형',       txt:`집어 든다. 솜이 비어져 나왔다.<br>몇 번이나 꿰매 준 자국이 있다. 바느질 솜씨가 엉망이다.<br><br>버리려다 말았던 기억이 난다.<br>대신 빨아서 말렸다. 볕에 널어놓으니 이상하게 뿌듯했다.` },
        { id:'cloth', label:'작은 옷',                 txt:`펼쳐 본다. 생각보다 작다.<br>입히면 싫어하면서도 가만히 있었다. 참아 주는 얼굴이었다.<br><br>사진이 몇 장 남아 있을 것이다.<br>그 옷을 입은 사진만 유독 많다.` },
        { id:'shoe',  label:'짝이 없는 신발',          txt:`한 짝뿐이다. 나머지는 어디 갔는지 모르겠다.<br>물고 다니다 어딘가 숨겨 뒀을 것이다.<br><br>숨긴 자리를 끝내 못 찾았다.<br>이사 갈 때 나올 줄 알았는데, 나오지 않았다.` },
        { id:'leash', label:'낡은 끈',                 txt:`손에 감아 본다. 길이가 몸에 익어 있다.<br>이만큼 나가면 멈추고, 이만큼이면 따라온다는 걸 손이 기억한다.<br><br>현관에 걸어 두었던 자리가 한동안 비어 있었다.<br>치우는 데 몇 달이 걸렸다.` },
        { id:'bowl',  label:'이가 나간 그릇',          txt:`가장자리가 조금 깨졌다. 물고 흔들다 떨어뜨려서 그렇다.<br><br>밥을 주면 먹기 전에 꼭 이쪽을 한 번 봤다.<br>먹어도 되냐고 묻는 건지, 고맙다는 건지 몰랐다.<br>지금도 모른다.` },
        { id:'ball',  label:'딸랑거리는 공',           txt:`흔들어 본다. 소리가 난다.<br>이 소리만 나면 어디 있든 달려왔다.<br><br>어느 순간부터 달려오지 않았다.<br>귀가 어두워진 건지, 다리가 아팠던 건지.<br>물어볼 수가 없었다.` }
    ];

    function c176Item() {
        const body = darkBodyEl();
        const shuffled = C176_ITEMS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
        darkRun._c176Items = shuffled.map(i => i.id);

        body.innerHTML = darkBox("바닥",
            `물건들 사이에 앉는다.<br><br>
             전부 낯이 익다. 전부 낯설기도 하다.<br>
             하나를 집으면 그게 그 아이 것이 될 것 같다.<br><br>
             <span style="font-size:11px; color:#888;">틀린 답은 없습니다.</span>`,
            shuffled.map(i => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:13px; text-align:left; font-size:12px; font-weight:normal;" onclick="c176ItemPick('${i.id}')">${i.label}</button>`).join(''),
            "step2");
        if (darkRun.isParty) mountDarkChat('normal');
    }

    function c176ItemPick(id) {
        const it = C176_ITEMS.find(i => i.id === id);
        if (!it) return;
        darkRun.petItem = it.label;
        darkRun.success++;
        darkRun.log.push(`[C-176] ${it.label}`);
        c176Warm(2);

        darkBodyEl().innerHTML = darkBox("바닥", it.txt,
            `<div style="text-align:center; font-size:11px; color:#d4af37; margin:14px 0; padding:10px; background:rgba(212,175,55,0.07); border-radius:5px;">
                ${darkRun.petName ? `${darkRun.petName}의 것이었다.` : '그 아이의 것이었다.'}
             </div>` +
            darkChoiceBtn("품에 넣는다.", `c176Advance(${darkRun.step + 1})`));
        if (darkRun.isParty) mountDarkChat('normal');
    }

        const C176_SOUNDS = [
        { id:'door',  label:'현관문이 열릴 때 나던 소리',
          txt:`그 소리다.<br><br>열쇠가 돌아가는 소리보다 먼저 반응했다.<br>엘리베이터에서 내리는 발소리만으로 알았다고, 가족들이 그랬다.<br><br>세상에서 제일 반가워하는 것이 매일 문 앞에 있었다.<br>그게 당연한 줄 알았다.` },
        { id:'snack', label:'봉지 뜯을 때 나던 소리',
          txt:`그 소리다.<br><br>자고 있다가도 벌떡 일어났다.<br>부엌 바닥에 미끄러지면서 달려오던 발톱 소리까지 같이 들린다.<br><br>일부러 봉지를 부스럭거려 본 적도 있다.<br>속아 주는 얼굴이 웃겨서.` },
        { id:'night', label:'밤에 문 앞에서 내던 소리',
          txt:`그 소리다.<br><br>혼자 자기 싫어서 문 앞에 앉아 내던 소리.<br>처음엔 단호하게 안 된다고 했다가, 결국 늘 문을 열어 줬다.<br><br>침대 발치가 항상 따뜻했다.<br>그 무게가 없어진 뒤로 한동안 잠이 안 왔다.` },
        { id:'sleep', label:'잠들 때 내던 숨소리',
          txt:`그 소리다.<br><br>옆에 누워 있으면 숨소리가 점점 느려졌다.<br>그 박자에 맞추다 보면 이쪽도 잠들었다.<br><br>세상에서 제일 안심되는 소리였다.<br>지금 방이 조용한 건 그래서다.` },
        { id:'greet', label:'이름을 부르면 대답하던 소리',
          txt:`그 소리다.<br><br>말은 아니었지만 분명 대답이었다.<br>부르면 늘 돌아왔다. 귀찮아하면서도 왔다.<br><br>마지막에도 불렀다.<br>대답은 없었지만, 들었을 거라고 생각하기로 했다.` }
    ];

    function c176Sound() {
        const body = darkBodyEl();
        const shuffled = C176_SOUNDS.slice().sort(() => Math.random() - 0.5).slice(0, 4);

        body.innerHTML = darkBox("소리",
            `눈을 감는다.<br><br>
             소리들이 겹쳐서 들린다. 어느 것이 먼저인지 모르겠다.<br>
             하나에 귀를 기울이면 나머지가 물러난다.<br><br>
             <span style="font-size:11px; color:#888;">기억나는 것을 고르세요.</span>`,
            shuffled.map(s => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:13px; text-align:left; font-size:12px; font-weight:normal;" onclick="c176SoundPick('${s.id}')">${s.label}</button>`).join(''),
            null);
        if (darkRun.isParty) mountDarkChat('normal');
    }

    function c176SoundPick(id) {
        const s = C176_SOUNDS.find(x => x.id === id);
        if (!s) return;
        darkRun.petSound = s.label;
        darkRun.success++;
        darkRun.log.push(`[C-176] ${s.label}`);
        c176Warm(3);

        darkBodyEl().innerHTML = darkBox("소리", s.txt,
            darkChoiceBtn("눈을 뜬다.", `c176Advance(${darkRun.step + 1})`));
        if (darkRun.isParty) mountDarkChat('normal');
    }

        function c176Door() {
        const nm = darkRun.petName || '그 아이';
        darkBodyEl().innerHTML = darkBox("문",
            `문 뒤에서 기다리는 기척이 있다.<br><br>
             열면 만날 수 있다. 그건 알겠다.<br>
             다만 만난 다음이 문제다.<br><br>
             여기서 나가려면 문을 지나야 한다.<br>
             지나간다는 건, 두고 간다는 뜻이기도 하다.`,
            darkChoiceBtn("① 문을 연다.", "c176End('open')") +
            darkChoiceBtn("② 열지 않고 돌아선다.", "c176End('leave')") +
            darkChoiceBtn(`③ 문 앞에서 이름을 한 번 더 부른다.`, "c176End('call')"),
            "step4");
        if (darkRun.isParty) mountDarkChat('normal');
    }

    function c176End(pick) {
        const nm = darkRun.petName || '그 아이';
        darkRun.c176Ending = pick;
        darkRun.success += 2;
        darkRun.log.push(`[C-176] 결말 — ${pick}`);
        c176Warm(4);

        let txt;
        if (pick === 'open') {
            txt = `문을 연다.<br><br>
                빛이 먼저 나온다. 오후 세 시의 볕.<br>
                그 안에 ${nm}이(가) 앉아 있다.<br><br>
                일어서지 않는다. 달려들지도 않는다.<br>
                그냥 이쪽을 본다. 오래 기다린 얼굴로, 그런데 원망은 없는 얼굴로.<br><br>
                무릎을 꿇고 앉는다. 손을 뻗는다.<br>
                닿기 직전에, 이쪽에서 먼저 손을 거둔다.<br><br>
                닿으면 못 갈 것 같아서.<br><br>
                ${nm}이(가) 고개를 조금 기울인다. 늘 하던 그 각도로.<br>
                그리고 일어서서, 안쪽으로 걸어 들어간다.<br>
                한 번 돌아본다. 두 번은 돌아보지 않는다.<br><br>
                문이 닫힌다. 안에서 닫는 소리다.<br>
                이제 혼자서도 문을 여닫을 수 있게 된 모양이다.`;
        } else if (pick === 'leave') {
            txt = `손을 내린다.<br><br>
                열지 않기로 한다.<br>
                열면 무너질 것 같아서가 아니라, 기다리게 하고 싶지 않아서.<br><br>
                문에 이마를 댄다. 따뜻하다.<br>
                안쪽에서도 뭔가가 문에 기대는 기척이 난다.<br>
                같은 높이가 아니라, 조금 아래쪽에.<br><br>
                한참 그러고 있었다.<br><br>
                돌아선다. 복도가 밝다.<br>
                등 뒤에서 긁는 소리는 나지 않는다.<br>
                울지도 않는다. 보내 주는 쪽이 우는 법은 없으니까.<br><br>
                걸어 나온다. 뒤는 보지 않았다.<br>
                그게 지금 할 수 있는 최선이었다.`;
        } else {
            txt = `문 앞에 앉는다.<br><br>
                그리고 이름을 부른다.<br>
                <span style="color:#d4af37; font-size:15px; font-weight:bold;">${nm}.</span><br><br>
                한 번 더 부른다. 아까보다 작게.<br>
                밥 줄 때처럼, 자기 전처럼, 아무 일도 아닐 때처럼.<br><br>
                안쪽에서 꼬리가 바닥을 치는 소리가 난다.<br>
                한 번. 두 번. 세 번.<br><br>
                그거면 됐다.<br>
                문은 열지 않는다. 열 필요가 없어졌다.<br><br>
                일어선다. 무릎이 저리다. 오래 앉아 있었던 모양이다.<br><br>
                복도를 걸어 나오는 동안,<br>
                뒤에서 따라오는 발소리가 났다.<br>
                돌아보면 없을 것을 알아서, 돌아보지 않았다.<br>
                현관까지 따라왔다.`;
        }

        darkBodyEl().innerHTML = darkBox("문", txt,
            `<div style="text-align:center; font-size:11px; color:#888; margin:16px 0; padding:12px; background:rgba(212,175,55,0.06); border:1px solid #5a4a2a; border-radius:6px; line-height:1.9;">
                ${darkRun.petItem ? `품에 ${darkRun.petItem}이(가) 있다.<br>` : ''}
                ${darkRun.petSound ? `${darkRun.petSound}가 아직 귀에 남아 있다.` : ''}
             </div>` +
            darkChoiceBtn("복도를 나선다.", "darkRun.step=99; renderDarkStep();"));
        if (darkRun.isParty) mountDarkChat('normal');
    }

        // --- C-176 : 돌아오지 않는 발소리 ---
    function buildPetAmbience(ctx, master) {
        darkAudio.petPhase = 0;

        // 저역 드론 — 처음엔 무겁게
        const low = ctx.createOscillator();
        const lowG = ctx.createGain();
        low.type = 'sine'; low.frequency.value = 46;
        lowG.gain.value = 0.1;
        low.connect(lowG); lowG.connect(master);
        low.start();
        darkAudio.nodes.push(low);
        darkAudio.petLowG = lowG;

        // 공기음
        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 7);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 300;
        const nG = ctx.createGain(); nG.gain.value = 0.08;
        noise.connect(lp); lp.connect(nG); nG.connect(master);
        noise.start();
        darkAudio.nodes.push(noise);
        darkAudio.petLp = lp;

        // 따뜻한 화음 — 처음엔 꺼져 있다가 단계마다 켜진다
        const warmG = ctx.createGain();
        warmG.gain.value = 0;
        warmG.connect(master);
        darkAudio.petWarmG = warmG;
        [261.6, 329.6, 392.0].forEach((f, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.value = i === 0 ? 0.05 : 0.03;
            o.connect(g); g.connect(warmG);
            o.start();
            darkAudio.nodes.push(o);
        });

        // 문 긁는 소리 — 후반엔 멎는다
        function scratch() {
            if (!darkAudio.playing) return;
            if (darkAudio.petPhase < 3) {
                const t = ctx.currentTime;
                const reps = 2 + Math.floor(Math.random() * 3);
                for (let k = 0; k < reps; k++) {
                    const tt = t + k * 0.22;
                    const src = ctx.createBufferSource();
                    src.buffer = makeNoiseBuffer(ctx, 0.2);
                    const bp = ctx.createBiquadFilter();
                    bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 4;
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(0.035, tt);
                    g.gain.exponentialRampToValueAtTime(0.0005, tt + 0.18);
                    src.connect(bp); bp.connect(g); g.connect(master);
                    src.start(tt); src.stop(tt + 0.22);
                }
            }
            darkAudio.timers.push(setTimeout(scratch, 6000 + Math.random() * 9000));
        }
        darkAudio.timers.push(setTimeout(scratch, 2500));

        // 작은 발소리 — 후반에 등장
        function paws() {
            if (!darkAudio.playing) return;
            if (darkAudio.petPhase >= 2) {
                const t = ctx.currentTime;
                for (let k = 0; k < 4; k++) {
                    const tt = t + k * 0.13;
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(140 + Math.random() * 50, tt);
                    g.gain.setValueAtTime(0.03, tt);
                    g.gain.exponentialRampToValueAtTime(0.0004, tt + 0.1);
                    osc.connect(g); g.connect(master);
                    osc.start(tt); osc.stop(tt + 0.13);
                }
            }
            darkAudio.timers.push(setTimeout(paws, 9000 + Math.random() * 12000));
        }
        darkAudio.timers.push(setTimeout(paws, 6000));
    }

    // 퍼즐을 풀 때마다 따뜻해진다
    function c176Warm(phase) {
        if (!darkAudio.ctx || !darkAudio.playing) return;
        darkAudio.petPhase = phase;
        const now = darkAudio.ctx.currentTime;
        try {
            if (darkAudio.petWarmG) {
                darkAudio.petWarmG.gain.linearRampToValueAtTime(0.05 * phase, now + 3);
            }
            if (darkAudio.petLowG) {
                darkAudio.petLowG.gain.linearRampToValueAtTime(Math.max(0.02, 0.1 - phase * 0.022), now + 3);
            }
            if (darkAudio.petLp) {
                darkAudio.petLp.frequency.linearRampToValueAtTime(300 + phase * 350, now + 3);
            }
        } catch (e) {}
    }
        function c176Withdraw() {
        if (!darkRun) return;
        currentUser.darkTries = Math.max(0, (currentUser.darkTries || 0) - 1);
        addHistoryLog(currentUser, `[탐사 철회] ${darkRun.zone} 진입 전 철회 (횟수 반환)`);
        saveDB();
        finishDarkRun();
    }

        // ==========================================
    // ★ Qtrew-A-214 「빛을 찾아서」
    // ==========================================
       const A214_TIME = 20 * 60 * 1000;

    const A214_MISSIONS = [
        { id:'m01', name:'홀로 두기',   desc:'특정 사원이 혼자 남는 상황을 2회 만든다.',        goal:2 },
        { id:'m02', name:'되돌리기',     desc:'옮겨진 의식 도구를 원래 자리에 되돌려 놓는다.',  goal:1 },
        { id:'m03', name:'버리기',       desc:'봉인 재료 하나를 몰래 버린다.',                  goal:1 },
        { id:'m04', name:'인도하기',     desc:'다른 사원 하나를 제단 앞까지 데려온다.',          goal:1 },
        { id:'m05', name:'침묵',         desc:'투표에서 한 번도 지목당하지 않는다.',            goal:1 },
        { id:'m06', name:'거짓 신호',    desc:'다수결을 한 번 뒤집는다.',                       goal:1 },
        { id:'m07', name:'흩뜨리기',     desc:'파티가 셋 이상으로 갈라지게 만든다.',            goal:1 },
        { id:'m08', name:'대신 받기',    desc:'다른 사원이 끌려가는 것을 한 번 방치한다.',      goal:1 },
        { id:'m09', name:'등불 끄기',    desc:'빛을 밝히는 기믹을 한 번 실패로 이끈다.',        goal:1 },
        { id:'m10', name:'응답하기',     desc:'집회의 문장에 한 번 소리 내어 대답한다.',        goal:1 }
    ];

    let a214Ref = null, a214Key = null, a214State = null;
    let a214Timer = null;

    function a214Path() { return `darkParties/${darkRun.partyId}/a214`; }

    function attachA214Listener() {
        if (!database || !darkRun || !darkRun.partyId) return;
        if (a214Key === darkRun.partyId) return;
        detachA214Listener();
        a214Key = darkRun.partyId;
        a214Ref = database.ref(a214Path());
        a214Ref.on('value', snap => {
            a214State = snap.val();
            if (!a214State || !darkRun) return;
            renderA214Bar();
        });
    }

    function detachA214Listener() {
        if (a214Ref) { try { a214Ref.off(); } catch(e) {} }
        a214Ref = null; a214Key = null; a214State = null;
        clearInterval(a214Timer);
    }

    // 방장이 신도와 미션을 배정
         function initA214() {
        if (!darkRun || !darkRun.isLeader || !database) return;
        database.ref(`darkParties/${darkRun.partyId}`).once('value').then(snap => {
            const room = snap.val() || {};
            let members = room.members;

            if (!members || Object.keys(members).length === 0) {
                const alive = room.alive || {};
                members = {};
                Object.keys(alive).forEach(c => {
                    members[c] = { code: c, name: (db.users[c] ? db.users[c].name : c) };
                });
            }
            const codes = Object.keys(members);
            if (codes.length === 0) { console.warn('A214: 인원을 찾을 수 없음'); return; }

            const traitor = codes[Math.floor(Math.random() * codes.length)];
            const picked = A214_MISSIONS.slice().sort(() => Math.random() - 0.5).slice(0, 3);
            const others = codes.filter(c => c !== traitor);

            const missions = picked.map(m => ({
                id: m.id, name: m.name, desc: m.desc, goal: m.goal, done: 0,
                target: ((m.id === 'm01' || m.id === 'm04') && others.length)
                    ? others[Math.floor(Math.random() * others.length)] : null
            }));

            database.ref(a214Path()).set({
                traitor: traitor,
                traitorName: members[traitor].name,
                missions: missions,
                startedAt: Date.now(),
                votes: {},
                exposed: 0,
                watched: false,
                converted: false
            });
        });
    }
    function isTraitor() {
        return a214State && a214State.traitor === currentUser.code;
    }

       function a214Remain() {
        if (!a214State || !a214State.startedAt) return A214_TIME;
        const bonus = Math.round(gearValue(currentUser, 'luck') * 5 * 60000);
        return Math.max(0, (A214_TIME + bonus) - (Date.now() - a214State.startedAt));
    }

        function a214BarHtml() {
        return `<div id="a214-bar" style="margin-bottom:12px;"></div>`;
    }

    function renderA214Bar() {
        const el = document.getElementById('a214-bar');
        if (!el || !a214State) return;

        const remain = a214Remain();
        const m = Math.floor(remain / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        const color = remain < 5 * 60000 ? '#f44336' : remain < 12 * 60000 ? '#ff9800' : '#4CAF50';
        const pct = (remain / A214_TIME) * 100;

        let roleHtml = '';
        if (isTraitor()) {
            const ms = a214State.missions || [];
            const doneCnt = ms.filter(x => x.done >= x.goal).length;
            roleHtml = `
                <div style="margin-top:9px; padding:9px 11px; background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px;">
                    <div style="font-size:10px; color:#ff6b6b; font-weight:bold; margin-bottom:5px;">
                        ◉ 신도 — 과업 ${doneCnt} / 3
                        ${a214State.watched ? ' <span style="color:#ff9800;">· 감시 중</span>' : ''}
                    </div>
                    ${ms.map(x => `<div style="font-size:10px; color:${x.done >= x.goal ? '#4CAF50' : '#aaa'}; line-height:1.6;">
                        ${x.done >= x.goal ? '✔' : '○'} ${x.name} — ${x.desc} (${x.done}/${x.goal})
                    </div>`).join('')}
                </div>`;
        }

        el.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
                <span>남은 시간</span>
                <span style="color:${color}; font-weight:bold; font-size:12px;">${m}:${String(s).padStart(2,'0')}</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:${pct}%; background:${color}; transition:width 1s linear;"></div>
            </div>
            ${roleHtml}`;
    }

    function startA214Timer() {
        clearInterval(a214Timer);
        a214Timer = setInterval(() => {
            if (!darkRun || darkRun.zone !== 'Qtrew-A-214') { clearInterval(a214Timer); return; }
            renderA214Bar();
            if (a214Remain() <= 0 && !darkRun._a214Over) {
                darkRun._a214Over = true;
                clearInterval(a214Timer);
                a214TimeOut();
            }
        }, 1000);
    }

    function a214TimeOut() {
        darkRun.fail += 3;
        darkRun.failedRun = true;
        darkDeath(
            `아래에서 소리가 커진다.<br><br>` +
            `같은 문장을 말하던 목소리들이 한 음으로 모인다.<br>` +
            `그게 완성되는 소리라는 걸 다들 알아차렸지만, 늦었다.<br><br>` +
            `빛이 계단을 타고 올라온다. 천천히, 빠짐없이.<br>` +
            `<span style="color:#d4af37;">"빛을 찾으셨습니까."</span><br><br>` +
            `이번에는 대답이 나왔다. 내 목소리였다.`
        );
    }

    // 미션 진척
    function a214Progress(missionId, amount) {
        if (!isTraitor() || !database || !a214State) return;
        const ms = a214State.missions || [];
        const idx = ms.findIndex(x => x.id === missionId);
        if (idx < 0) return;
        if (ms[idx].done >= ms[idx].goal) return;
        const next = Math.min(ms[idx].goal, ms[idx].done + (amount || 1));
        database.ref(`${a214Path()}/missions/${idx}/done`).set(next);
        showDarkToast(`과업 진행 — ${ms[idx].name} (${next}/${ms[idx].goal})`);
    }

        const A214_NARR = {
        1: { img:'step1', text:`계단을 내려간다.<br><br>
            벽에 손을 짚으면 미끈하다. 물기가 아니라 손때다.<br>
            수없이 많은 손이 같은 자리를 짚고 내려갔다는 뜻이다.<br><br>
            아래에서 올라오는 빛이 일정하지 않다.<br>
            숨을 쉬듯 밝아졌다 어두워진다. 여럿이 함께 쉬는 숨처럼.<br><br>
            계단 수를 세던 사람이 중간에 그만둔다.<br>
            숫자가 자꾸 늘어나서.` },

        2: { text:`넓은 방이다.<br><br>
            의자가 줄지어 놓여 있다. 전부 같은 방향을 본다.<br>
            앉아 있는 사람은 없는데, 앉았던 자국은 전부 남아 있다.<br><br>
            벽에 문장이 적혀 있다. 같은 문장이 수백 번.<br>
            글씨체가 조금씩 다르다. 쓴 사람이 여럿이라는 뜻이다.<br><br>
            <span style="color:#d4af37;">"빛을 찾으셨습니까."</span><br><br>
            읽는 것만으로 대답하고 싶어진다.<br>
            그 충동이 어디서 왔는지 모르겠다.` },

        3: { text:`옆방에서 소리가 난다.<br><br>
            여럿이 같은 문장을 동시에 말하는 소리.<br>
            박자가 정확해서 기계 같기도 하고, 노래 같기도 하다.<br><br>
            문틈으로 본다.<br>
            사람들이 등을 보이고 앉아 있다. 수십 명이다.<br>
            전부 같은 각도로 고개를 숙이고 있다.<br><br>
            하나가 천천히 고개를 든다.<br>
            돌아보지는 않았다. 그게 더 무섭다.` },

        4: { text:`복도가 갈린다.<br><br>
            어느 쪽에서든 같은 소리가 난다. 방향을 가늠할 수 없다.<br><br>
            벽에 안내가 붙어 있다. 종이가 아니라 천에 수를 놓았다.<br>
            공들인 티가 난다. 오래 걸렸을 것이다.<br><br>
            <span style="color:#d4af37;">"길을 잃으셨다면 그대로 계십시오. 모시러 가겠습니다."</span><br><br>
            그대로 있으면 안 된다는 뜻으로 읽힌다.` },

        5: { img:'step2', text:`창고다.<br><br>
            상자가 쌓여 있고, 안에 든 것이 전부 같다.<br>
            흰 천, 양초, 그리고 이름이 적힌 명패.<br><br>
            명패를 몇 개 꺼내 본다. 전부 사원 이름이다.<br>
            이 회사 사람들 이름이다.<br><br>
            아직 새겨지지 않은 빈 명패가 여섯 개 남아 있다.<br>
            세어 보고 아무도 말하지 않는다.` },

        6: { text:`누군가 뒤처졌다.<br><br>
            돌아보니 그 자리에 서 있다. 벽을 보고 있다.<br>
            부르면 돌아보는데, 표정이 한 박자 늦다.<br><br>
            "괜찮아?"<br>
            "응."<br><br>
            대답이 너무 빨랐다.<br>
            생각하고 대답한 게 아니라, 준비해 둔 대답 같았다.<br><br>
            아무도 그 얘기를 꺼내지 않는다.` },

        7: { text:`기도실이다.<br><br>
            방석이 놓여 있고, 그 앞에 거울이 있다.<br>
            거울에는 아무것도 비치지 않는다. 검다.<br><br>
            방석에 앉으면 뭔가 보일 것 같다.<br>
            앉지 않기로 한다. 다만 한 사람이 오래 서 있었다.<br><br>
            그 사람이 나중에 말했다.<br>
            "그냥 무릎이 아팠어."<br><br>
            그럴 수도 있다.` },

        8: { text:`통로가 좁아진다.<br><br>
            한 사람씩 지나야 한다. 순서를 정해야 한다.<br>
            먼저 가는 쪽이 유리한지 불리한지 아무도 모른다.<br><br>
            지나가는 동안 뒤쪽이 안 보인다.<br>
            누가 따라오는지, 몇이 따라오는지 알 수 없다.<br><br>
            빠져나와서 세어 본다.<br>
            맞다. 이번에는 맞았다.` },

        9: { img:'step3', text:`아래층이다.<br><br>
            벽에 사진이 걸려 있다. 단체 사진이다.<br>
            앞줄에 앉은 사람들, 뒷줄에 선 사람들. 전부 웃고 있다.<br><br>
            사진 아래 날짜가 적혀 있다. 작년이다.<br><br>
            얼굴 하나가 눈에 익다.<br>
            지금 일행 중 하나와 닮았다.<br><br>
            닮은 게 아닐지도 모른다.` },

        10: { text:`소리가 가까워진다.<br><br>
            아까보다 사람 수가 많아졌다. 배는 되는 것 같다.<br>
            늘어난 목소리 중에 익숙한 음색이 섞여 있다.<br><br>
            착각이라고 생각하기로 한다.<br>
            그렇게 생각하지 않으면 걸을 수가 없다.<br><br>
            앞서가던 사람이 갑자기 멈춘다.<br>
            "방금 누가 내 이름 불렀는데."<br><br>
            아무도 부르지 않았다.` },

        11: { text:`제단이 보이는 문 앞이다.<br><br>
            문이 두껍다. 안쪽에서 빛이 새는데, 틈이 아니라 문 자체에서 샌다.<br>
            나무가 빛을 머금은 것처럼.<br><br>
            봉인에 필요한 것들을 점검한다.<br>
            하나씩 이름을 부르며 확인한다.<br><br>
            숫자가 맞지 않는다.<br>
            누가 떨어뜨렸겠지. 그렇게 넘어가기로 한다.<br>
            넘어가지 않으면 시간이 없다.` },

        12: { text:`문이 열린다.<br><br>
            안은 생각보다 평범하다. 회의실 같기도 하고, 강당 같기도 하다.<br>
            가운데에 뭔가 있다. 빛이 거기서 나온다.<br><br>
            형태가 잡히지 않는다. 보고 있으면 눈이 그것을 정리하지 못한다.<br>
            사람들이 왜 무릎을 꿇었는지 알 것 같다.<br>
            서 있는 게 이상하게 어렵다.<br><br>
            옆 사람이 무릎을 꿇었다.<br>
            잡아 일으켜야 하는데, 손이 늦다.` },

        13: { text:`둘러선다.<br><br>
            봉인을 시작하려면 전원이 자리를 잡아야 한다.<br>
            한 명이라도 빠지면 원이 닫히지 않는다.<br><br>
            세어 본다.<br>
            이번에도 맞다. 전부 있다.<br><br>
            그런데 한 사람이 서 있는 자리가 조금 어긋나 있다.<br>
            원 바깥쪽으로 반 발자국.<br><br>
            지적하면 늦을 것 같고, 지적하지 않으면 안 될 것 같다.` },

        14: { text:`빛이 반응한다.<br><br>
            봉인이 걸리기 시작하자 소리가 멎었다.<br>
            수십 명이 동시에 입을 다무는 소리는 생각보다 크다.<br><br>
            그리고 전부 이쪽을 본다.<br>
            문 밖에서, 복도에서, 계단에서.<br><br>
            달려오지는 않는다. 걸어온다.<br>
            그게 더 빠르게 느껴진다.` },

        15: { text:`마지막이다.<br><br>
            봉인을 닫을지, 부술지 정해야 한다.<br>
            닫으면 여기 남는다. 부수면 여기가 무너진다.<br><br>
            어느 쪽이든 나가려면 서둘러야 한다.<br><br>
            누군가 뒤에서 말한다.<br>
            "잠깐만."<br><br>
            돌아볼 시간이 있을까.` }
    };

        const A214_STEPS = {
        0:  { type:'intro' },
        1:  { type:'narr', n:1 },
        2:  { type:'gimmick', n:1 },
        3:  { type:'narr', n:2 },
        4:  { type:'narr', n:3 },
        5:  { type:'gimmick', n:2 },
        6:  { type:'split', n:1 },
        7:  { type:'narr', n:4 },
        8:  { type:'rejoin', n:1 },
        9:  { type:'narr', n:5 },
        10: { type:'vote', n:1 },
        11: { type:'gimmick', n:3 },
        12: { type:'narr', n:6 },
        13: { type:'split', n:2 },
        14: { type:'narr', n:7 },
        15: { type:'gimmick', n:4 },
        16: { type:'rejoin', n:2 },
        17: { type:'narr', n:8 },
        18: { type:'vote', n:2 },
        19: { type:'narr', n:9 },
        20: { type:'gimmick', n:5 },
        21: { type:'split', n:3 },
        22: { type:'narr', n:10 },
        23: { type:'rejoin', n:3 },
        24: { type:'gimmick', n:6 },
        25: { type:'narr', n:11 },
        26: { type:'vote', n:3 },
        27: { type:'narr', n:12 },
        28: { type:'gimmick', n:7 },
        29: { type:'narr', n:13 },
        30: { type:'narr', n:14 },
        31: { type:'narr', n:15 },
        32: { type:'gimmick', n:8 },
        99: { type:'result' }
    };

    function renderStepA214() {
        const body = darkBodyEl();
        if (!body || !darkRun) return;
        if (darkRun.rejoined) { renderRejoinScene(); return; }
        if (darkRun.isParty) { watchPartyStep(); watchDyingMembers(); }
        saveDarkRunState();
        attachA214Listener();

        if (!a214State) {
            if (darkRun.isLeader) initA214();
            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                `<div style="text-align:center; color:#888; font-size:12px; padding:20px 0;">
                    내려가는 중...<br>
                    <button class="game-btn" style="margin-top:14px; padding:9px 16px; font-size:11px;" onclick="forceA214Init()">다시 시도</button>
                    <button class="game-btn" style="margin-top:8px; padding:9px 16px; font-size:11px;" onclick="finishDarkRun()">나가기</button>
                 </div>`, "intro");
            setTimeout(() => { if (a214State && darkRun) renderStepA214(); }, 1200);
            setTimeout(() => { if (a214State && darkRun) renderStepA214(); }, 3000);
            return;
        }

        if (!darkRun._a214Started) {
            darkRun._a214Started = true;
            startA214Timer();
        }

        const def = A214_STEPS[darkRun.step];
        if (!def) { renderDarkResult(); return; }

        if (def.type === 'intro') {

             if (!darkRun._a214Briefed) {
                darkRun._a214Briefed = true;
                setTimeout(() => showDarkToast(isTraitor() ? '◉ 당신은 신도입니다' : '⚠ 일행 중 하나는 신도입니다'), 600);
            }

                        if (darkRun.isLeader && !darkRun._a214Notice) {
                darkRun._a214Notice = true;
                setTimeout(() => sendPartyChat('이 구역에는 일행 중 한 명이 신도로 섞여 있습니다. 세 번의 지목 기회가 주어집니다.', true), 1000);
            }

            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                a214BarHtml() + a214RoleCard() +
                darkChoiceBtn("내려간다.", "partyAdvance(1)"), "intro");
            renderA214Bar();
            mountDarkChat('normal');
            return;
        }
        

        if (def.type === 'narr') {
            const d = A214_NARR[def.n];
            body.innerHTML = darkBox("—", d.text,
                a214BarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`),
                d.img);
            renderA214Bar();
            mountDarkChat('normal');
            return;
        }

        if (def.type === 'vote')   { renderA214Vote(def.n); return; }
        if (def.type === 'split')  { renderA214Split(def.n); return; }
        if (def.type === 'rejoin') { renderA214Rejoin(def.n); return; }
        if (def.type === 'result') { renderDarkResult(); return; }

        const fns = { 1:a214G1, 2:a214G2, 3:a214G3, 4:a214G4, 5:a214G5, 6:a214G6, 7:a214G7, 8:a214G8 };
        if (fns[def.n]) fns[def.n]();
    }

        function forceA214Init() {
        if (!darkRun || !database) return;
        database.ref(`darkParties/${darkRun.partyId}`).once('value').then(snap => {
            const room = snap.val();
            if (!room) {
                showCustomAlert('탐사 기록이 서버에서 사라졌습니다.\n안전하게 귀환합니다.');
                finishDarkRun();
                return;
            }
            if (room.a214) { a214State = room.a214; renderStepA214(); return; }
            if (darkRun.isLeader) { initA214(); setTimeout(() => forceA214Init(), 1500); }
            else showCustomAlert('선임이 아직 준비되지 않았습니다.');
        });
    }

    // 진입 시 역할 안내 (본인만 보임)
    function a214RoleCard() {
        if (isTraitor()) {
            const ms = (a214State.missions || []);
            return `
                <div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:6px; padding:13px; margin-bottom:13px;">
                    <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:8px;">◉ 당신은 이미 빛을 보았습니다.</div>
                    <div style="font-size:11px; color:#ccc; line-height:1.8; margin-bottom:10px;">
                        일행은 봉인을 하러 왔습니다. 당신은 다른 일을 하러 왔습니다.<br>
                        아래 과업을 전부 마치면 혼자 나갈 수 있습니다.
                    </div>
                    ${ms.map(x => `<div style="font-size:11px; color:#d4af37; line-height:1.7;">○ <b>${x.name}</b> — ${x.desc}</div>`).join('')}
                    <div style="font-size:10px; color:#888; margin-top:9px; line-height:1.6;">
                        투표에서 세 번째로 지목되면 그 자리에서 끝납니다.<br>
                        도중에 마음을 바꿔 협조할 수도 있습니다. 보상은 거의 없습니다.
                    </div>
                </div>`;
        }
                return `
            <div style="background:rgba(212,175,55,0.07); border:1px solid #5a4a2a; border-radius:6px; padding:13px; margin-bottom:13px;">
                <div style="font-size:12px; color:#d4af37; font-weight:bold; margin-bottom:8px;">◈ 임무</div>
                <div style="font-size:11px; color:#ccc; line-height:1.8;">
                    아래층의 빛을 봉인하거나 파괴해야 합니다.<br>
                    제한 시간이 지나면 전원 돌아올 수 없습니다.
                </div>
            </div>
            <div style="background:rgba(127,0,0,0.12); border:1px solid #7f0000; border-radius:6px; padding:13px; margin-bottom:13px;">
                <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:8px;">⚠ 경고</div>
                <div style="font-size:11px; color:#ccc; line-height:1.8;">
                    <b style="color:#ff9800;">일행 중 한 명은 이미 빛을 보았습니다.</b><br>
                    그 사람은 다른 목적을 가지고 들어왔습니다.<br>
                    누구인지는 본인만 압니다.<br><br>
                    세 번의 지목 기회가 있습니다.<br>
                    <span style="color:#f44336;">세 번째에 맞히면 그 자리에서 끝납니다.</span><br>
                    <span style="font-size:10px; color:#888;">틀리면 무고한 사원이 묶입니다.</span>
                </div>
            </div>`;
    }

        function renderA214Vote(n) {
        const p = darkParties[darkRun.partyId];
        const alive = (p && p.alive) ? Object.keys(p.alive) : [];
        const solo = (p && p.solo) ? Object.keys(p.solo) : [];

        // 흩어져 있으면 투표 불가
        if (solo.length > 0 || alive.length < 3) {
            darkBodyEl().innerHTML = darkBox(`지목 ${n}차`,
                `모여서 이야기할 상황이 아니다.<br><br>
                 흩어진 채로는 누구도 누구를 지목할 수 없다.<br>
                 서로의 얼굴을 못 본 채로 시간이 간다.`,
                a214BarHtml() + darkChoiceBtn("그냥 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderA214Bar();
            mountDarkChat('normal');
            return;
        }

        const key = `vote${n}`;
        const votes = (a214State.votes && a214State.votes[key]) || {};
        const myVote = votes[currentUser.code];
        const voted = Object.keys(votes).length;

              const opts = alive.map(c => {
            const nm = (p && p.members && p.members[c] && p.members[c].name)
                ? p.members[c].name
                : (db.users[c] ? db.users[c].name : c);
            const cnt = Object.values(votes).filter(v => v === c).length;
            const mine = myVote === c;
            return `
                <button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal; ${mine ? 'border-color:var(--theme-focus) !important; box-shadow:0 0 8px var(--theme-focus);' : ''}"
                    onclick="a214Vote(${n},'${c}')" ${myVote ? 'disabled' : ''}>
                    ${nm}${c === currentUser.code ? ' <span style="color:#666; font-size:10px;">(본인)</span>' : ''}
                    <span style="float:right; color:var(--theme-focus); font-weight:bold;">${cnt > 0 ? '●'.repeat(Math.min(cnt,5)) + ' ' + cnt : ''}</span>
                </button>`;
        }).join('');

        darkBodyEl().innerHTML = darkBox(`지목 ${n}차`,
            `둘러선다.<br><br>
             누가 이미 빛을 보았는지 정해야 한다.<br>
             확신이 있는 사람은 없다. 그래도 정해야 한다.<br><br>
             ${n === 3
                ? '<span style="color:#f44336;">마지막 기회다. 맞히면 그 자리에서 끝난다.</span>'
                : '<span style="color:#888; font-size:11px;">지목당한 사원은 다음 구간에서 행동이 제한된다.</span>'}`,
            a214BarHtml() + opts +
            `<div style="text-align:center; font-size:11px; color:#888; margin-top:10px;">투표 ${voted} / ${alive.length}</div>` +
            (darkRun.isLeader ? `<button class="game-btn" style="width:100%; margin:8px 0 0 0; padding:10px; font-size:11px;" onclick="a214CloseVote(${n})">지금 마감</button>` : ''));
        renderA214Bar();
        mountDarkChat('normal');
    }

    function a214Vote(n, target) {
        if (!database || !a214State) return;
        database.ref(`${a214Path()}/votes/vote${n}/${currentUser.code}`).set(target);
        setTimeout(() => renderA214Vote(n), 400);
    }

    function a214CloseVote(n) {
        if (!database || !a214State) return;
        const key = `vote${n}`;
        const votes = (a214State.votes && a214State.votes[key]) || {};
        const tally = {};
        Object.values(votes).forEach(v => { tally[v] = (tally[v] || 0) + 1; });

        let top = null, max = 0;
        Object.keys(tally).forEach(c => { if (tally[c] > max) { max = tally[c]; top = c; } });

        const hit = top === a214State.traitor;
        let finalHit = hit;
        if (hit && isTraitor()) {
            const luckVal = gearValue(currentUser, 'luck');
            if (luckVal > 0 && Math.random() < luckVal * 0.6) {
                finalHit = false;
                darkRun.log.push('[행운] 지목을 흘렸다');
            }
        }
        const p = darkParties[darkRun.partyId];
                const nm = (p && p.members && p.members[top] && p.members[top].name)
            ? p.members[top].name
            : (db.users[top] ? db.users[top].name : '누군가');

        database.ref(a214Path()).update({
            [`voteResult${n}`]: { target: top, name: nm, hit: hit, at: Date.now() },
            exposed: hit ? (a214State.exposed || 0) + 1 : (a214State.exposed || 0),
            watched: hit ? true : (a214State.watched || false)
        });

        // 침묵 미션 — 지목당하지 않았으면 진행
        if (isTraitor() && top !== currentUser.code) a214Progress('m05', 1);

        setTimeout(() => a214ShowVoteResult(n, top, nm, hit), 700);
    }

    function a214ShowVoteResult(n, top, nm, hit) {
        const iamTarget = top === currentUser.code;

        if (iamTarget) {
            darkRun._a214Restricted = true;
            applyPollutionToUser(currentUser, 8);
        }

        // 3차 적중 = 즉시 사망
        if (hit && n === 3) {
            if (isTraitor()) {
                darkRun.fail += 3;
                darkDeath(
                    `손가락이 전부 이쪽을 향한다.<br><br>` +
                    `변명할 틈은 없었다. 변명할 말도 준비하지 않았다.<br>` +
                    `어차피 마지막에는 들킬 거라고 생각했던 것 같다.<br><br>` +
                    `빛이 먼저 알아봤다. 자기 사람을 데려가는 손길은 부드러웠다.`
                );
                return;
            }
            darkBodyEl().innerHTML = darkBox("지목 3차 — 결과",
                `<b style="color:#f44336;">${nm}</b> 사원이 지목되었다.<br><br>` +
                `그 사람이 웃는다. 처음 보는 웃음이다.<br>` +
                `변명하지 않는다. 그게 답이었다.<br><br>` +
                `빛이 그쪽으로 기운다. 데려가는 손길이 부드럽다.<br>` +
                `남은 사람들은 아무 말도 하지 않았다.`,
                a214BarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderA214Bar();
            mountDarkChat('normal');
            return;
        }

        if (iamTarget) darkRun._a214Restricted = true;

        darkBodyEl().innerHTML = darkBox(`지목 ${n}차 — 결과`,
            hit
                ? `<b style="color:#ff9800;">${nm}</b> 사원이 지목되었다.<br><br>
                   부정한다. 목소리가 평소보다 조금 높다.<br>
                   증거는 없다. 다만 다들 조금씩 거리를 둔다.<br><br>
                   <span style="color:#ff9800;">이후 그 사람의 행동을 지켜보기로 한다.</span>`
                : `<b>${nm}</b> 사원이 지목되었다.<br><br>
                   부정한다. 억울해 보인다. 실제로 억울할 것이다.<br><br>
                   그래도 감시는 붙는다. 시간이 없으니까.<br>
                   <span style="color:#888; font-size:11px;">틀렸을 수도 있다는 말은 아무도 하지 않는다.</span>`,
            a214BarHtml() +
            (iamTarget ? `<div style="background:rgba(255,152,0,0.1); border:1px solid #7a5200; border-radius:5px; padding:10px; margin-bottom:10px; font-size:11px; color:#ffb74d;">당신이 지목되었습니다. 다음 구간에서 선택지가 제한됩니다.</div>` : '') +
            darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderA214Bar();
        mountDarkChat('normal');
    }

        // ==========================================
    // ★ A-214 분리
    // ==========================================
    const A214_SPLIT = {
        1: {
            text: `복도가 세 갈래로 갈린다.<br><br>
                각각에서 같은 소리가 난다. 어느 쪽이 본류인지 알 수 없다.<br>
                한꺼번에 가면 시간이 모자라고, 나눠 가면 혼자가 된다.<br><br>
                누가 어디로 갈지는 각자 정하기로 한다.<br>
                그게 제일 공평해 보였다.`,
            opts: [
                { l:'① 왼쪽으로 간다.',   v:'left' },
                { l:'② 가운데로 간다.',   v:'center' },
                { l:'③ 오른쪽으로 간다.', v:'right' }
            ]
        },
        2: {
            text: `천장에서 뭔가가 떨어진다.<br><br>
                흰 천이다. 여러 장이 동시에. 시야가 완전히 막힌다.<br>
                걷어 내고 보니 방향 감각이 사라졌다.<br><br>
                부르는 소리가 사방에서 난다. 전부 아는 목소리다.<br>
                전부 아는 목소리라서 어느 쪽이 진짜인지 모르겠다.`,
            opts: [
                { l:'① 가장 가까운 목소리로 간다.', v:'near' },
                { l:'② 가장 익숙한 목소리로 간다.', v:'known' },
                { l:'③ 아무 소리도 따라가지 않는다.', v:'still' }
            ]
        },
        3: {
            text: `문이 닫힌다.<br><br>
                여러 개가 동시에. 안쪽에서 잠그는 소리가 난다.<br>
                방금까지 옆에 있던 사람이 다른 방에 있다.<br><br>
                벽이 얇다. 목소리는 들린다. 다만 말이 조금씩 늦게 도착한다.<br>
                대화가 안 된다. 통보만 가능하다.`,
            opts: [
                { l:'① 벽을 두드려 신호를 보낸다.', v:'knock' },
                { l:'② 다른 출구를 찾는다.',        v:'search' },
                { l:'③ 문을 부순다.',              v:'break' }
            ]
        }
    };

    function renderA214Split(n) {
        const d = A214_SPLIT[n];
        if (!d) { partyAdvance(darkRun.step + 1); return; }

        const restricted = darkRun._a214Restricted;
        const opts = restricted ? d.opts.slice(0, 1) : d.opts;

        darkBodyEl().innerHTML = darkBox(`갈림 ${n}`, d.text,
            a214BarHtml() +
            (restricted ? `<div style="background:rgba(255,152,0,0.1); border:1px solid #7a5200; border-radius:5px; padding:9px; margin-bottom:10px; font-size:10px; color:#ffb74d;">지목된 상태입니다. 선택이 제한됩니다.</div>` : '') +
            opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="a214SplitPick(${n},'${o.v}')">${o.l}</button>`).join(''));
        renderA214Bar();
        mountDarkChat('normal');
    }

    function a214SplitPick(n, v) {
        if (!database) return;
        darkRun._a214Restricted = false;
        database.ref(`${a214Path()}/split${n}/${currentUser.code}`).set({
            pick: v, name: currentUser.name, at: Date.now()
        });
        database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({
            name: currentUser.name, at: Date.now(), split: n
        });
        darkRun.solo = true;
        darkRun.splitPick = v;
        darkRun.log.push(`[갈림 ${n}] ${v}`);

        setTimeout(() => a214AfterSplit(n, v), 1200);

        darkBodyEl().innerHTML = darkBox(`갈림 ${n}`,
            `그쪽으로 간다.<br><br>발소리가 하나씩 멀어진다.`,
            a214BarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">흩어지는 중...</div>`);
        renderA214Bar();
    }

    function a214AfterSplit(n, v) {
        if (!database || !darkRun) return;
        database.ref(`${a214Path()}/split${n}`).once('value').then(snap => {
            const picks = snap.val() || {};
            const mine = v;
            const same = Object.keys(picks).filter(c => picks[c].pick === mine && c !== currentUser.code);
            const groups = {};
            Object.values(picks).forEach(p => { groups[p.pick] = (groups[p.pick] || 0) + 1; });

            // 흩뜨리기 미션
            if (isTraitor() && Object.keys(groups).length >= 3) a214Progress('m07', 1);
            // 홀로 두기 미션 — 대상이 혼자가 됐는지
            if (isTraitor()) {
                const ms = (a214State.missions || []).find(x => x.id === 'm01');
                if (ms && ms.target) {
                    const tPick = picks[ms.target] ? picks[ms.target].pick : null;
                    if (tPick && groups[tPick] === 1) a214Progress('m01', 1);
                }
            }

            const alone = same.length === 0;
            darkRun._a214Alone = alone;

            darkBodyEl().innerHTML = darkBox(`갈림 ${n} — 결과`,
                alone
                    ? `혼자다.<br><br>
                       복도가 넓게 느껴진다. 실제로 넓어졌을 수도 있다.<br>
                       뒤를 보니 왔던 길이 아직 있다. 다만 아무도 없다.<br><br>
                       채팅은 된다. 목소리는 안 들린다.<br>
                       그게 위로가 되는지 아닌지 모르겠다.`
                    : `${same.map(c => picks[c].name).join(', ')} 사원과 같은 쪽으로 왔다.<br><br>
                       서로 말은 하지 않는다. 다만 걸음을 맞춘다.<br>
                       누가 누구를 믿는지는 아직 정해지지 않았다.`,
                a214BarHtml() + darkChoiceBtn("앞으로 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderA214Bar();
            mountDarkChat('normal');
        });
    }

        // ==========================================
    // ★ A-214 합류 (12루트)
    // ==========================================
    const A214_REJOIN_OPTS = [
        { l:'① 이름을 부른다.',            v:'call' },
        { l:'② 벽을 두드린다.',            v:'knock' },
        { l:'③ 발자국을 따라간다.',        v:'track' },
        { l:'④ 불빛을 향해 간다.',         v:'light' },
        { l:'⑤ 그 자리에 선다.',           v:'stay' },
        { l:'⑥ 소리가 없는 쪽으로 간다.',  v:'quiet' }
    ];

    const A214_REJOIN_TABLE = [
        { a:'call',  b:'stay',  name:'정면 합류',   mod:3,  ok:true,
          txt:`이름을 부른다. 대답이 온다.<br><br>같은 자리에 서서 기다리고 있었다.<br>가까워질수록 서로 걸음이 빨라진다.<br><br>만나서 처음 한 말이 "혼자 있었어?"였다.` },
        { a:'knock', b:'knock', name:'박자 합류',   mod:3,  ok:true,
          txt:`벽을 두드린다. 같은 박자가 돌아온다.<br><br>세 번, 쉬고, 두 번. 틀리지 않았다.<br>벽을 따라가니 모퉁이에서 만난다.<br><br>둘 다 손등이 까져 있다.` },
        { a:'track', b:'stay',  name:'추적 합류',   mod:2,  ok:true,
          txt:`발자국을 따라간다. 아직 선명하다.<br><br>끝에 사람이 서 있다. 기다리고 있었다.<br>돌아보는 얼굴이 안도한다.` },
        { a:'light', b:'light', name:'등불 합류',   mod:2,  ok:true,
          txt:`불빛 쪽으로 간다.<br><br>반대쪽에서도 누가 오고 있다. 같은 불빛을 봤다.<br>가운데서 만난다.<br><br>불빛의 정체는 확인하지 않기로 한다.` },
        { a:'quiet', b:'quiet', name:'침묵 합류',   mod:2,  ok:true,
          txt:`소리가 없는 쪽으로 간다.<br><br>여기서 소리가 없다는 건 사람이 없다는 뜻이다.<br>그런데 한 사람이 있다. 같은 생각을 한 사람.<br><br>말없이 고개만 끄덕인다.` },
        { a:'call',  b:'knock', name:'엇박 합류',   mod:1,  ok:true,
          txt:`부르는 소리와 두드리는 소리가 엇갈린다.<br><br>그래도 방향은 맞았다.<br>만나기는 했는데 둘 다 목이 쉬었다.` },
        { a:'track', b:'move',  name:'따라잡기',    mod:1,  ok:true,
          txt:`앞서간 자국을 따라 달린다.<br><br>모퉁이에서 등이 보인다. 부르지 않고 그냥 따라붙는다.<br>놀라게 하고 싶지 않았다.` },
        { a:'light', b:'stay',  name:'늦은 합류',   mod:0,  ok:true,
          txt:`불빛을 따라가다 한참을 돌았다.<br><br>도착했을 때는 다들 앉아서 기다리고 있었다.<br>아무도 늦었다고 하지 않는다. 그게 더 미안하다.` },
        { a:'quiet', b:'call',  name:'엇갈린 만남', mod:0,  ok:true,
          txt:`조용한 쪽으로 갔는데, 부르는 소리가 그쪽에서 났다.<br><br>운이었다. 좋은 운인지는 모르겠다.` },
        { a:'call',  b:'light', name:'헛걸음',      mod:-1, ok:false,
          txt:`부르면서 갔는데 아무도 없다.<br><br>불빛 쪽으로 간 사람들은 이미 지나갔다.<br>부른 소리는 다른 것이 들었을 것이다.` },
        { a:'knock', b:'move',  name:'빈 벽',       mod:-1, ok:false,
          txt:`벽을 두드린다. 대답이 온다.<br><br>박자가 조금 다르다. 흉내 낸 박자다.<br>두드리기를 멈춘다. 저쪽은 멈추지 않는다.` },
        { a:'stay',  b:'stay',  name:'양쪽 대기',   mod:-2, ok:false,
          txt:`둘 다 기다렸다.<br><br>아무도 움직이지 않으면 아무도 만나지 못한다.<br>시간만 갔다.` }
    ];

    function renderA214Rejoin(n) {
        const restricted = darkRun._a214Restricted;
        const opts = restricted ? A214_REJOIN_OPTS.slice(0, 3) : A214_REJOIN_OPTS;

        darkBodyEl().innerHTML = darkBox(`합류 ${n}차`,
            `일행의 기척이 어디선가 난다.<br><br>
             어떻게 다가갈지 정해야 한다.<br>
             상대가 어떻게 움직일지는 알 수 없다.<br><br>
             <span style="font-size:11px; color:#888;">서로의 선택이 맞물려야 만난다.</span>`,
            a214BarHtml() +
            opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="a214RejoinPick(${n},'${o.v}')">${o.l}</button>`).join(''));
        renderA214Bar();
        mountDarkChat('normal');
    }

    function a214RejoinPick(n, v) {
        if (!database) return;
        darkRun._a214Restricted = false;
        database.ref(`${a214Path()}/rejoin${n}/${currentUser.code}`).set({
            pick: v, name: currentUser.name, at: Date.now()
        });

        darkBodyEl().innerHTML = darkBox(`합류 ${n}차`,
            `움직인다.<br><br>상대가 어디로 갈지는 알 수 없다.`,
            a214BarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">서로를 찾는 중...</div>`);
        renderA214Bar();

        setTimeout(() => a214ResolveRejoin(n, v), 2500);
    }

    function a214ResolveRejoin(n, myPick) {
        if (!database || !darkRun) return;
        database.ref(`${a214Path()}/rejoin${n}`).once('value').then(snap => {
            const picks = snap.val() || {};
            const others = Object.keys(picks).filter(c => c !== currentUser.code).map(c => picks[c].pick);

            let found = null;
            for (const other of others) {
                found = A214_REJOIN_TABLE.find(r =>
                    (r.a === myPick && r.b === other) || (r.a === other && r.b === myPick));
                if (found) break;
            }
            if (!found) {
                found = { name:'엇갈림', mod:-1, ok:false,
                    txt:`한참을 돌았다.<br><br>지나간 자리는 있는데 사람이 없다.<br>같은 통로를 반대로 돌고 있었던 것 같다.` };
            }

            darkRun.modifier = (darkRun.modifier || 0) + found.mod;
            darkRun.log.push(`[합류 ${n}차] ${found.name}`);

            if (found.ok) {
                darkRun.solo = false;
                database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
                sendPartyChat(`${currentUser.name} 사원이 합류했습니다. (${found.name})`, true);
            } else {
                sendPartyChat(`${currentUser.name} 사원이 길을 잃었습니다.`, true);
            }

            darkBodyEl().innerHTML = darkBox(`합류 ${n}차 — ${found.name}`, found.txt,
                a214BarHtml() +
                `<div style="text-align:center; font-size:11px; color:${found.mod > 0 ? '#4CAF50' : '#ff9800'}; margin-bottom:12px; padding:9px; background:rgba(0,0,0,0.25); border-radius:5px;">
                    ${found.name} — 이후 판정 보정 ${found.mod >= 0 ? '+' : ''}${found.mod}
                 </div>` +
                darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderA214Bar();
            mountDarkChat('normal');
        });
    }

        // ==========================================
    // ★ A-214 연타 전투
    // ==========================================
    let a214Combat = { active:false, count:0, need:0, timer:null, phase:0, onWin:null, onLose:null };

    function startCombat(cfg) {
        a214Combat = {
            active: true, count: 0,
            need: cfg.need, phase: cfg.phase || 1,
            seconds: cfg.seconds,
            onWin: cfg.onWin, onLose: cfg.onLose,
            timer: null
        };

        darkBodyEl().innerHTML = darkBox(cfg.title, cfg.text,
            a214BarHtml() +
            `<div style="text-align:center; margin-bottom:12px;">
                <div style="font-size:34px; font-weight:bold; color:#ff6b6b;" id="combat-time">${cfg.seconds}</div>
                <div style="font-size:11px; color:#888; margin-top:4px;">${cfg.need}회 필요</div>
             </div>
             <div style="width:100%; height:16px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:8px; overflow:hidden; margin-bottom:14px;">
                <div id="combat-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#7f0000,#f44336); transition:width 0.08s;"></div>
             </div>
           <button class="game-btn" id="combat-btn" style="width:100%; margin:0; padding:22px; font-size:17px; font-weight:bold; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important; touch-action:manipulation; user-select:none;" ontouchstart="event.preventDefault(); combatTap();" onclick="combatTap()">
                ${cfg.label || '뿌리친다'}
             </button>
             <div id="combat-msg" style="text-align:center; font-size:11px; color:#888; margin-top:10px; min-height:16px;"></div>`);
        renderA214Bar();
        mountDarkChat('normal');

        let t = cfg.seconds;
        clearInterval(a214Combat.timer);
        a214Combat.timer = setInterval(() => {
            t--;
            const el = document.getElementById('combat-time');
            if (!el || !darkRun) { clearInterval(a214Combat.timer); return; }
            el.innerText = t;
            if (t <= 0) {
                clearInterval(a214Combat.timer);
                a214Combat.active = false;
                if (a214Combat.onLose) a214Combat.onLose();
            }
        }, 1000);
    }

       let _lastTap = 0;
    function combatTap() {
        if (!a214Combat.active) return;
        const now = Date.now();
        if (now - _lastTap < 40) return;
        _lastTap = now;

        a214Combat.count++;
        const pct = Math.min(100, (a214Combat.count / a214Combat.need) * 100);
        const bar = document.getElementById('combat-bar');
        if (bar) bar.style.width = pct + '%';

        if (a214Combat.count >= a214Combat.need) {
            a214Combat.active = false;
            clearInterval(a214Combat.timer);
            const btn = document.getElementById('combat-btn');
            if (btn) btn.disabled = true;
            if (a214Combat.onWin) a214Combat.onWin();
        }
    }

        // --- 기믹 1: 첫 접촉 ---
    function a214G1() {
        renderChoiceStep("기믹 1 — 첫 인사",
            `계단 아래에서 한 사람이 올라온다.<br><br>
             흰 옷을 입었고, 맨발이다. 발소리가 나지 않는다.<br>
             얼굴은 평범하다. 그게 제일 이상하다.<br><br>
             웃으면서 손을 내민다.<br>
             <span style="color:#d4af37;">"오셨군요. 기다렸습니다."</span>`,
            [
                { id:'ignore', label:'① 무시하고 지나간다.',      fn:'a214G1R', arg:'ignore' },
                { id:'shake',  label:'② 손을 잡는다.',            fn:'a214G1R', arg:'shake' },
                { id:'ask',    label:'③ 누구를 기다렸냐고 묻는다.', fn:'a214G1R', arg:'ask' },
                { id:'answer', label:'④ 같이 인사한다.',          fn:'a214G1R', arg:'answer' }
            ], "step1");
    }

    function a214G1R(pick) {
        let txt, mod = 0;
        if (pick === 'ignore') {
            txt = `지나친다. 손은 그대로 내밀어져 있다.<br><br>등 뒤에서 그 자세로 한참 서 있는 기척이 난다.<br>돌아보지 않는다.`;
            mod = 1; darkRun.success++;
        } else if (pick === 'shake') {
            txt = `손을 잡는다. 따뜻하다.<br><br>놓으려는데 잘 놓이지 않는다. 힘이 아니라 마찰 같은 것이다.<br>겨우 빼낸다. 손바닥에 흰 가루가 묻었다.`;
            mod = -1; darkRun.fail++;
            applyPollutionToUser(currentUser, 8);
        } else if (pick === 'ask') {
            txt = `누구를 기다렸냐고 묻는다.<br><br>웃는 얼굴 그대로 대답한다.<br><span style="color:#d4af37;">"오시는 분을요."</span><br><br>질문이 잘못됐다는 걸 알았다.`;
            mod = 0; darkRun.success++;
        } else {
            txt = `같이 인사한다.<br><br>상대가 더 깊이 고개를 숙인다. 그리고 옆으로 비켜선다.<br>길을 내준 것이다.<br><br>일행 중 누군가가 작게 말했다. "왜 인사를 해."`;
            mod = 2; darkRun.success++;
            if (isTraitor()) a214Progress('m10', 1);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 1] ${pick}`);
        renderResultStep("기믹 1 — 결과", txt, "지나간다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 2: 집회 ---
    function a214G2() {
        renderChoiceStep("기믹 2 — 집회",
            `집회장을 지나야 한다.<br><br>
             수십 명이 등을 보이고 앉아 있다. 같은 문장을 반복한다.<br>
             지나가려면 그 사이를 통과해야 한다.<br><br>
             박자가 있다. 문장이 끝나고 다시 시작되는 사이에 아주 짧은 정적이 있다.`,
            [
                { id:'beat',  label:'① 정적에 맞춰 한 걸음씩.',    fn:'a214G2R', arg:'beat' },
                { id:'join',  label:'② 같이 읊으며 걷는다.',       fn:'a214G2R', arg:'join' },
                { id:'crawl', label:'③ 의자 사이로 기어간다.',     fn:'a214G2R', arg:'crawl' },
                { id:'walk',  label:'④ 그냥 걸어간다.',            fn:'a214G2R', arg:'walk' }
            ], "step2");
    }

    function a214G2R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = { beat: 12, join: 10, crawl: 14, walk: 18 }[pick] - gearValue(currentUser, 'break');
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (pick === 'join' && isTraitor()) a214Progress('m10', 1);

        if (ok) {
            txt = pick === 'beat' ? `정적에 맞춰 한 걸음씩 옮긴다.<br><br>세 번째 걸음에서 박자를 놓칠 뻔했다.<br>앞사람이 어깨를 잡아 줬다. 덕분에 살았다.`
                : pick === 'join' ? `같이 읊는다.<br><br>입에 잘 붙는다. 처음 듣는 문장인데 그렇다.<br>지나가는 동안 아무도 돌아보지 않았다.<br><br>나오고 나서 입을 다무는 데 시간이 걸렸다.`
                : pick === 'crawl' ? `의자 사이로 기어간다.<br><br>발들이 보인다. 전부 맨발이다. 전부 같은 방향으로 놓여 있다.<br>발톱까지 가지런하다.`
                : `그냥 걷는다.<br><br>운이 좋았다. 아무도 돌아보지 않았다.<br>나중에 생각하니 아무도 돌아보지 않은 게 더 이상했다.`;
            darkRun.success++;
        } else {
            txt = `박자가 끊긴다.<br><br>읊던 소리가 멎고, 앞줄부터 차례로 고개가 돌아간다.<br>파도처럼.<br><br>전부 이쪽을 본다. 표정이 하나도 없다.<br>다시 읊기 시작한다. 이번엔 문장이 바뀌었다.<br><br><span style="color:#d4af37;">"오셨군요."</span>`;
            darkRun.fail++;
            applyPollutionToUser(currentUser, 10);
        }

        darkRun.log.push(`[기믹 2] ${pick} d20 ${roll} vs DC${DC}`);
        darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            a214BarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderA214Bar();
        mountDarkChat('normal');
    }

    // --- 기믹 3: 끌려감 (연타) ---
    function a214G3() {
        startCombat({
            title: "기믹 3 — 손",
            text: `어깨에 손이 얹힌다.<br><br>
                하나가 아니다. 셋, 넷, 그 이상.<br>
                아프지 않게 잡는다. 다치게 할 생각이 없다는 뜻이다.<br>
                모시러 온 자세다.<br><br>
                <span style="color:#d4af37;">"안내해 드리겠습니다."</span><br><br>
                발이 바닥에서 뜬다.`,
            sseconds: 8, need: 16, label: '뿌리친다',
            onWin: () => {
                darkRun.success++;
                setTimeout(() => a214G3Second(), 500);
            },
            onLose: () => {
                darkRun.fail += 2;
                applyPollutionToUser(currentUser, 14);
                if (isTraitor()) a214Progress('m08', 1);
                darkDeath(
                    `힘이 빠진다.<br><br>` +
                    `손들이 조심스럽게 옮긴다. 떨어뜨리지 않으려고 여럿이 나눠 든다.<br>` +
                    `누군가 흰 천을 덮어 준다.<br><br>` +
                    `<span style="color:#d4af37;">"편히 계십시오. 곧 보시게 됩니다."</span>`
                );
            }
        });
    }

    function a214G3Second() {
        startCombat({
            title: "기믹 3 — 다시",
            text: `뿌리쳤다.<br><br>
                숨을 고르는데, 천장에서 뭔가가 떨어진다.<br>
                사람이다. 거꾸로 매달려 있다가 놓은 것이다.<br><br>
                이번에는 조심스럽지 않다.<br>
                목을 잡는다.`,
            seconds: 6, need: 19, label: '떼어낸다',
            onWin: () => {
                darkRun.success++;
                darkRun.modifier = (darkRun.modifier || 0) + 2;
                darkBodyEl().innerHTML = darkBox("기믹 3 — 결과",
                    `떼어낸다.<br><br>
                     바닥에 떨어진 것이 일어나지 않는다. 꺾인 자세 그대로 이쪽을 본다.<br>
                     그리고 웃는다.<br><br>
                     <span style="color:#d4af37;">"좋습니다. 그 힘이 필요합니다."</span><br><br>
                     칭찬받은 것 같아서 기분이 나쁘다.`,
                    a214BarHtml() + darkChoiceBtn("달린다.", `partyAdvance(${darkRun.step + 1})`));
                renderA214Bar();
                mountDarkChat('normal');
            },
            onLose: () => {
                darkRun.fail += 2;
                applyPollutionToUser(currentUser, 16);
                darkDeath(
                    `목에서 손이 떨어지지 않는다.<br><br>` +
                    `시야가 좁아지는 동안, 거꾸로 된 얼굴이 아주 가까이 있었다.<br>` +
                    `입술이 움직인다. 같은 문장이다.<br><br>` +
                    `마지막에 따라 읊었다. 왜 그랬는지 모르겠다.`
                );
            }
        });
    }

    // --- 기믹 4: 명패 ---
    function a214G4() {
        renderChoiceStep("기믹 4 — 명패",
            `창고에서 명패를 발견했다.<br><br>
             빈 명패가 여섯 개. 일행 수와 같다.<br>
             옆에 조각칼이 놓여 있다. 손에 익은 자리가 반들반들하다.<br><br>
             누가 새기려던 것인지, 아니면 새기게 하려던 것인지 모르겠다.`,
            [
                { id:'burn',   label:'① 전부 부순다.',              fn:'a214G4R', arg:'burn' },
                { id:'hide',   label:'② 숨긴다.',                   fn:'a214G4R', arg:'hide' },
                { id:'leave',  label:'③ 그대로 둔다.',              fn:'a214G4R', arg:'leave' },
                { id:'carve',  label:'④ 하나에 이름을 새겨 본다.',  fn:'a214G4R', arg:'carve' }
            ], null);
    }

    function a214G4R(pick) {
        let txt, mod = 0;
        if (pick === 'burn') {
            txt = `전부 부순다. 생각보다 잘 부서진다.<br><br>조각이 바닥에 흩어진다. 그런데 조각마다 글자가 새겨져 있다.<br>부수기 전에는 비어 있었는데.`;
            mod = 2; darkRun.success++;
        } else if (pick === 'hide') {
            txt = `상자 뒤에 숨긴다.<br><br>돌아서는데 등 뒤에서 나무 부딪는 소리가 난다.<br>다시 보니 제자리에 있다. 아까보다 가지런하게.`;
            mod = 0; darkRun.success++;
        } else if (pick === 'leave') {
            txt = `그대로 둔다. 건드리지 않는 게 나을 것 같았다.<br><br>나가면서 한 번 더 본다.<br>여섯 개 중 하나가 없어졌다.`;
            mod = -1; darkRun.fail++;
            applyPollutionToUser(currentUser, 6);
            if (isTraitor()) a214Progress('m02', 1);
        } else {
            txt = `조각칼을 든다. 손에 착 붙는다.<br><br>새기기 시작하자 손이 저절로 움직인다.<br>정신을 차리니 이름이 하나 새겨져 있다.<br><br>내 이름이 아니다. 일행 중 하나의 이름이다.`;
            mod = -2; darkRun.fail++;
            applyPollutionToUser(currentUser, 12);
            if (isTraitor()) a214Progress('m02', 1);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 4] ${pick}`);
        renderResultStep("기믹 4 — 결과", txt, "나간다.", `partyAdvance(${darkRun.step + 1})`);
    }

        function a214G5() {
        renderChoiceStep("기믹 5 — 거울",
            `기도실이다.<br><br>
             방석 앞에 거울이 있다. 검다. 아무것도 비치지 않는다.<br>
             봉인 재료 하나가 거울 앞에 놓여 있다.<br><br>
             집으려면 거울 앞에 앉아야 한다.<br>
             앉으면 무언가 보일 것이다. 그건 확실하다.`,
            [
                { id:'sit',    label:'① 앉아서 집는다.',              fn:'a214G5R', arg:'sit' },
                { id:'reach',  label:'② 서서 손만 뻗는다.',           fn:'a214G5R', arg:'reach' },
                { id:'cover',  label:'③ 거울을 천으로 덮고 집는다.',  fn:'a214G5R', arg:'cover' },
                { id:'smash',  label:'④ 거울을 깨고 집는다.',         fn:'a214G5R', arg:'smash' }
            ], null);
    }

    function a214G5R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('sense');
        const DC = { sit: 17, reach: 13, cover: 11, smash: 15 }[pick] - gearValue(currentUser, 'break');
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt, died = false;
        if (ok) {
            txt = pick === 'sit' ? `앉는다.<br><br>거울에 뭔가 떠오른다. 사람 형태다. 이쪽 자세와 똑같다.<br>다만 얼굴이 이쪽을 보지 않고 조금 옆을 본다.<br><br>시선을 따라가 보니 재료가 놓인 자리다.<br>알려 준 것 같기도 하다.<br><br>집어 들고 빨리 일어선다.`
                : pick === 'reach' ? `서서 손만 뻗는다.<br><br>거울에는 손만 비친다. 손목까지만.<br>그 위는 검다.<br><br>집어서 뺀다. 손은 무사하다. 확인은 두 번 했다.`
                : pick === 'cover' ? `천을 덮는다. 거울이 사라지자 방이 평범해진다.<br><br>재료를 집어 든다. 아무 일도 없다.<br>덮은 천이 아주 조금 부풀었다가 가라앉았다.`
                : `거울을 깬다.<br><br>조각마다 다른 장면이 비친다. 전부 이 방이다. 전부 사람이 앉아 있다.<br>시간대가 다른 것 같다.<br><br>밟고 지나간다. 재료를 집는다.`;
            darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + (pick === 'cover' ? 2 : 1);
        } else if (roll === 1 && pick === 'sit') {
            died = true;
            txt = `앉는다.<br><br>거울에 사람이 떠오른다. 이쪽을 본다.<br>웃는다. 이쪽은 웃지 않았는데.<br><br>일어서려는데 다리가 말을 듣지 않는다.<br>거울 속 사람이 먼저 일어선다.<br><br>자리가 바뀌는 데는 시간이 걸리지 않았다.`;
        } else {
            txt = `재료는 집었다.<br><br>다만 거울이 한 박자 늦게 반응한다.<br>손을 뗐는데 거울 속 손은 아직 뻗어 있다.<br><br>돌아서서 나올 때까지 그 손은 그대로였다.`;
            darkRun.fail++;
            applyPollutionToUser(currentUser, 9);
        }

        darkRun.log.push(`[기믹 5] ${pick} d20 ${roll} vs DC${DC}`);
        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 5 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            a214BarHtml() + darkChoiceBtn("나간다.", `partyAdvance(${darkRun.step + 1})`));
        renderA214Bar();
        mountDarkChat('normal');
    }

        function a214G6() {
        const body = darkBodyEl();
        const items = ['흰 초', '마른 잎', '금속 못', '소금 주머니', '봉인 끈'];
        const missing = items[Math.floor(Math.random() * items.length)];
        darkRun._a214Missing = missing;

        body.innerHTML = darkBox("기믹 6 — 점검",
            `봉인에 필요한 것들을 펼친다.<br><br>
             하나씩 이름을 부르며 확인한다. 소리 내어 세는 게 규칙이다.<br>
             누가 정한 규칙인지는 모른다.<br><br>
             <span style="color:#ff9800;">하나가 없다.</span><br><br>
             누가 떨어뜨렸을 수도 있고, 누가 치웠을 수도 있다.<br>
             지금은 구분할 방법이 없다.`,
            a214BarHtml() +
            darkChoiceBtn("① 되돌아가서 찾는다.", "a214G6R('back')") +
            darkChoiceBtn("② 대신 쓸 것을 만든다.", "a214G6R('make')") +
            darkChoiceBtn("③ 없는 채로 진행한다.", "a214G6R('skip')") +
            (isTraitor() ? darkChoiceBtn("④ 하나 더 몰래 버린다. <span style='color:#ff6b6b; font-size:10px;'>[신도]</span>", "a214G6R('sabotage')") : ''));
        renderA214Bar();
        mountDarkChat('normal');
    }

    function a214G6R(pick) {
        let txt, mod = 0;
        if (pick === 'back') {
            txt = `되돌아간다. 시간이 걸린다.<br><br>${darkRun._a214Missing}은(는) 복도에 떨어져 있었다.<br>떨어진 자리가 이상하다. 지나온 길이 아니다.<br><br>주워서 돌아온다. 아무도 왜 거기 있었냐고 묻지 않는다.`;
            mod = 1; darkRun.success++;
        } else if (pick === 'make') {
            txt = `대신 쓸 것을 만든다.<br><br>옷자락을 찢고, 주머니를 뒤지고, 있는 것으로 흉내를 낸다.<br>완벽하지는 않다. 그래도 형태는 갖췄다.<br><br>봉인이 제대로 걸릴지는 해 봐야 안다.`;
            mod = 0; darkRun.success++;
        } else if (pick === 'skip') {
            txt = `없는 채로 간다. 시간이 없다.<br><br>그 결정을 누가 먼저 했는지 나중에 기억나지 않았다.<br>다들 동의했다는 것만 기억난다.`;
            mod = -2; darkRun.fail++;
        } else {
            txt = `점검하는 척하면서 하나를 더 소매에 넣는다.<br><br>아무도 못 봤다. 세는 사람이 집중하고 있어서 오히려 쉬웠다.<br><br>숫자가 또 안 맞는다는 말이 나온다.<br>이번에는 다들 서로를 본다.`;
            mod = -3; darkRun.fail++;
            a214Progress('m03', 1);
        }
        darkRun.modifier = (darkRun.modifier || 0) + mod;
        darkRun.log.push(`[기믹 6] ${pick}`);
        renderResultStep("기믹 6 — 결과", txt, "문으로 간다.", `partyAdvance(${darkRun.step + 1})`);
    }

        function a214G7() {
        renderChoiceStep("기믹 7 — 제단",
            `제단 앞이다.<br><br>
             빛이 가운데 있다. 형태가 잡히지 않는다.<br>
             오래 보면 무릎이 저절로 굽는다. 실제로 한 명이 꿇었다.<br><br>
             봉인을 걸려면 시선을 유지해야 한다.<br>
             시선을 떼면 위치가 바뀐다.`,
            [
                { id:'stare',  label:'① 똑바로 본다.',                fn:'a214G7R', arg:'stare' },
                { id:'side',   label:'② 곁눈으로만 본다.',            fn:'a214G7R', arg:'side' },
                { id:'mirror', label:'③ 금속에 비친 것으로 본다.',    fn:'a214G7R', arg:'mirror' },
                { id:'close',  label:'④ 눈을 감고 소리로 잡는다.',    fn:'a214G7R', arg:'close' }
            ], "step4");
    }

    function a214G7R(pick) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('sense');
        const DC = { stare: 18, side: 14, mirror: 12, close: 15 }[pick] - gearValue(currentUser, 'break');
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt, died = false;
        if (ok) {
            txt = pick === 'stare' ? `똑바로 본다. 눈이 아프다. 눈물이 흐르는데 멈출 수가 없다.<br><br>그래도 놓치지 않았다.<br>봉인 첫 겹이 걸린다.`
                : pick === 'side' ? `곁눈으로 본다. 형태가 잡히지 않아서 오히려 편하다.<br><br>정면으로 보려는 충동을 세 번 참았다.<br>봉인 첫 겹이 걸린다.`
                : pick === 'mirror' ? `못 머리에 비친 상으로 본다. 아주 작다.<br><br>작으니까 견딜 만하다.<br>봉인 첫 겹이 걸린다.`
                : `눈을 감는다. 소리로 위치를 잡는다.<br><br>빛에서 소리가 난다는 걸 처음 알았다.<br>아주 낮고, 사람 목소리와 비슷하다.<br><br>봉인 첫 겹이 걸린다.`;
            darkRun.success += 2;
        } else if (roll === 1) {
            died = true;
            txt = `본다.<br><br>정리가 된다. 형태가 잡힌다.<br>보고 나니 왜 다들 무릎을 꿇었는지 알겠다.<br><br>무릎을 꿇는다. 누가 시킨 게 아니다.<br>이제 여기 사람들이 하는 말이 전부 맞는 말로 들린다.`;
        } else {
            txt = `시선을 놓쳤다.<br><br>다시 찾으니 위치가 바뀌어 있다. 더 가까워졌다.<br>봉인이 절반만 걸렸다.<br><br>손끝이 떨린다. 추운 게 아니다.`;
            darkRun.fail++;
            applyPollutionToUser(currentUser, 12);
            if (isTraitor()) a214Progress('m09', 1);
        }

        darkRun.log.push(`[기믹 7] ${pick} d20 ${roll} vs DC${DC}`);
        if (died) { darkDeath(txt); return; }

        darkBodyEl().innerHTML = darkBox("기믹 7 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            a214BarHtml() + darkChoiceBtn("자리를 잡는다.", `partyAdvance(${darkRun.step + 1})`));
        renderA214Bar();
        mountDarkChat('normal');
    }

        function a214G8() {
        if (isTraitor()) { a214FinalTraitor(); return; }

        renderChoiceStep("기믹 8 — 마지막",
            `봉인이 마지막 겹을 남겨 두고 있다.<br><br>
             닫을지, 부술지 정해야 한다.<br>
             닫으면 여기 갇힌 채로 남는다. 부수면 여기가 무너진다.<br><br>
             복도에서 걸어오는 소리가 가까워진다.<br>
             시간은 없다.`,
            [
                { id:'seal',  label:'① 봉인을 닫는다.',        fn:'a214Final', arg:'seal' },
                { id:'break', label:'② 부순다.',               fn:'a214Final', arg:'break' },
                { id:'run',   label:'③ 두고 달아난다.',        fn:'a214Final', arg:'run' }
            ], null);
    }

    function a214FinalTraitor() {
        const ms = a214State.missions || [];
        const done = ms.filter(x => x.done >= x.goal).length;
        darkBodyEl().innerHTML = darkBox("기믹 8 — 마지막",
            `일행이 봉인을 닫으려 한다.<br><br>
             막을 수 있다. 지금이 마지막 기회다.<br><br>
             <div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px; padding:11px; margin-top:10px; font-size:11px; color:#ccc;">
                완수한 과업 <b style="color:${done >= 3 ? '#4CAF50' : '#ff9800'};">${done} / 3</b><br>
                ${done >= 3 ? '<span style="color:#4CAF50;">과업을 마쳤습니다. 이제 나갈 수 있습니다.</span>' : '<span style="color:#ff9800;">아직 남았습니다. 이대로 나가면 아무것도 받지 못합니다.</span>'}
             </div>`,
            a214BarHtml() +
            darkChoiceBtn("① 봉인을 막는다.", "a214TraitorBlock()") +
            darkChoiceBtn("② 모른 척 협조한다.", "a214Final('seal')") +
            darkChoiceBtn("③ 자수한다.", "a214Confess()"));
        renderA214Bar();
        mountDarkChat('normal');
    }

    function a214TraitorBlock() {
        startCombat({
            title: "저지",
            text: `봉인 앞으로 몸을 던진다.<br><br>
                일행이 붙잡는다. 여럿이 동시에.<br>
                밀어내야 한다.`,
            seconds: 7, need: 24, label: '밀어낸다',
                       onWin: () => {
                darkRun.success++;
                darkRun.modifier = (darkRun.modifier || 0) + 2;
                a214Combat.active = false;
                clearInterval(a214Combat.timer);
                const nextStep = darkRun.step + 1;
                darkBodyEl().innerHTML = darkBox("기믹 3 — 결과",
                    `떼어낸다.<br><br>
                     바닥에 떨어진 것이 일어나지 않는다. 꺾인 자세 그대로 이쪽을 본다.<br>
                     그리고 웃는다.<br><br>
                     <span style="color:#d4af37;">"좋습니다. 그 힘이 필요합니다."</span><br><br>
                     칭찬받은 것 같아서 기분이 나쁘다.`,
                    a214BarHtml() + darkChoiceBtn("달린다.", `darkRun.step=${nextStep}; renderDarkStep(); if(database) database.ref('darkParties/${darkRun.partyId}/curStep').set(${nextStep});`));
                renderA214Bar();
                mountDarkChat('normal');
            },
            onLose: () => {
                darkRun.fail += 2;
                darkDeath(
                    `밀리지 않는다.<br><br>` +
                    `일행이 봉인을 닫는다. 그 안에 이쪽이 들어가 있다.<br>` +
                    `마지막으로 본 것은 닫히는 틈 사이의 얼굴들이었다.<br><br>` +
                    `원망하는 얼굴은 하나도 없었다. 그게 제일 견디기 어려웠다.`
                );
            }
        });
    }

    function a214Confess() {
        darkRun.a214Confessed = true;
        darkRun.success++;
        sendPartyChat(`${currentUser.name} 사원이 무언가를 고백했습니다.`, true);
        darkBodyEl().innerHTML = darkBox("자수",
            `말한다.<br><br>
             처음부터 다른 일을 하러 왔다고. 지금까지 한 것들을 전부.<br><br>
             아무도 놀라지 않는다. 몇은 이미 알고 있었던 눈치다.<br>
             그런데 아무도 밀어내지 않는다.<br><br>
             "그럼 지금은?"<br>
             "지금은 같이 나가고 싶어."<br><br>
             누군가 손을 내민다. 잡는다.<br>
             봉인은 한 겹 더 두꺼워졌다.`,
            darkChoiceBtn("같이 닫는다.", "a214Final('seal')"));
        mountDarkChat('normal');
    }

    function a214Final(pick) {
        let txt;
        if (pick === 'seal') {
            darkRun.success += 3;
            txt = `봉인을 닫는다.<br><br>
                빛이 접힌다. 종이처럼, 아주 얇아질 때까지.<br>
                마지막에 소리가 한 번 났다. 사람 목소리였다.<br><br>
                복도의 발소리가 멎는다. 전부 동시에.<br>
                문을 열어 보니 아무도 없다. 흰 옷만 바닥에 떨어져 있다.<br><br>
                계단을 올라간다. 세어 보니 내려올 때보다 짧다.`;
        } else if (pick === 'break') {
            darkRun.success += 2;
            darkRun.fail++;
            applyPollutionToUser(currentUser, 15);
            txt = `부순다.<br><br>
                빛이 터진다. 소리는 없다. 대신 귀가 한동안 먹먹하다.<br>
                천장이 내려앉기 시작한다.<br><br>
                달린다. 뒤에서 흰 옷들이 따라오는데, 잡으려는 게 아니라 같이 도망치는 것이다.<br>
                그게 더 이상했다.<br><br>
                계단 끝에서 뒤를 본다. 아무도 따라 올라오지 못했다.`;
        } else {
            darkRun.fail += 2;
            darkRun.failedRun = true;
            applyPollutionToUser(currentUser, 18);
            txt = `두고 달아난다.<br><br>
                봉인은 걸리지 않았고, 빛은 그대로다.<br>
                계단을 오르는 동안 아래에서 소리가 커진다.<br><br>
                나오기는 했다.<br>
                다만 여기는 아직 여기에 있다. 그게 계속 남을 것이다.`;
        }

        darkRun.log.push(`[기믹 8] ${pick}`);
        darkBodyEl().innerHTML = darkBox("마지막", txt,
            darkChoiceBtn("계단을 오른다.", "darkRun.step=99; renderDarkStep();"));
        mountDarkChat('normal');
    }

        function buildCultAmbience(ctx, master) {
        const low = ctx.createOscillator();
        const lowG = ctx.createGain();
        low.type = 'sine'; low.frequency.value = 55;
        lowG.gain.value = 0.09;
        low.connect(lowG); lowG.connect(master);
        low.start(); darkAudio.nodes.push(low);

        // 합창 — 여러 목소리가 같은 문장을 읊는 느낌
        [138, 174, 207].forEach((f, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth'; o.frequency.value = f;
            g.gain.value = 0.018;
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = 500;
            o.connect(lp); lp.connect(g); g.connect(master);
            o.start(); darkAudio.nodes.push(o);

            const lfo = ctx.createOscillator();
            const lg = ctx.createGain();
            lfo.frequency.value = 0.21 + i * 0.008;
            lg.gain.value = 0.016;
            lfo.connect(lg); lg.connect(g.gain);
            lfo.start(); darkAudio.nodes.push(lfo);
        });

        function chant() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            for (let k = 0; k < 7; k++) {
                const tt = t + k * 0.42;
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'square';
                o.frequency.setValueAtTime(130 + Math.random() * 30, tt);
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 6;
                g.gain.setValueAtTime(0, tt);
                g.gain.linearRampToValueAtTime(0.02, tt + 0.06);
                g.gain.exponentialRampToValueAtTime(0.0004, tt + 0.34);
                o.connect(bp); bp.connect(g); g.connect(master);
                o.start(tt); o.stop(tt + 0.4);
            }
            darkAudio.timers.push(setTimeout(chant, 9000 + Math.random() * 6000));
        }
        darkAudio.timers.push(setTimeout(chant, 3000));

        function bell() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(880, t);
            g.gain.setValueAtTime(0.03, t);
            g.gain.exponentialRampToValueAtTime(0.0004, t + 2.2);
            o.connect(g); g.connect(master);
            o.start(t); o.stop(t + 2.4);
            darkAudio.timers.push(setTimeout(bell, 24000 + Math.random() * 20000));
        }
        darkAudio.timers.push(setTimeout(bell, 12000));
    }

        // ==========================================
    // ★ 발동 중인 효과 표시
    // ==========================================
    const QFLAG_LABELS = {
        immune_smell: '젖은 수건 — 냄새 1회 무효',
        immune_sound: '귀마개 — 소리 1회 무효',
        immune_sight: '색안경 — 시선 1회 무효',
        mark_keep:    '분필 — 표식 유지',
        reroll:       '식은 커피 — 재굴림 가능',
        safe_touch:   '고무장갑 — 접촉 1회 안전',
        no_notice:    '종이봉투 — 주목도 1회 무효',
        rejoin_boost: '나침반 조각 — 합류 +4',
        force_open:   '삐뚤어진 못 — 돌파 1회 성공',
        block_poll:   '마스크 — 오염 1회 차단',
        dark_light:   '라이터 돌 — 판정 +2',
        no_mark:      '낡은 명찰 — 지목 1회 회피',
        next_plus:    '사탕 — 다음 판정 +1',
        extra_search: '구부러진 스푼 — 탐색 +1',
        quiz_undo:    '덜 마른 잉크 — 오답 1회 취소',
        reveal_doc:   '배치도 사본 — 위치 공개',
        safe_hint:    '근무 일지 — 안전한 쪽 표시',
        monster_hint: '도청 기록 — 습성 공개',
        paw_guard:    '따라온 발소리 — 위험 1회 대신'
    };

    function qFlagBarHtml() {
        if (!darkRun || !darkRun.qFlags) return '';
        const keys = Object.keys(darkRun.qFlags).filter(k => darkRun.qFlags[k]);
        if (keys.length === 0) return '';
        return `
            <div style="background:rgba(201,168,255,0.06); border:1px solid #4a3a6a; border-radius:5px; padding:8px 10px; margin-bottom:10px;">
                <div style="font-size:9px; color:#c9a8ff; font-weight:bold; margin-bottom:4px;">발동 중</div>
                ${keys.map(k => `<div style="font-size:10px; color:#d4bbff; line-height:1.6;">◈ ${QFLAG_LABELS[k] || k}</div>`).join('')}
            </div>`;
    }

        // ==========================================
    // ★ Qtrew-A-667 「물고기가 인간이 되었다」
    // ==========================================
    const A667_MAXDEPTH = 100;

    function getHumanity() {
        return (darkRun && darkRun.humanity != null) ? darkRun.humanity : 100;
    }
    function getDepth() {
        return (darkRun && darkRun.depth != null) ? darkRun.depth : 0;
    }

    function addHumanity(amount, reason) {
        if (!darkRun) return;
         if (amount < 0) {
        const gaze = gearValue(currentUser, 'gaze');
        if (gaze > 0) amount = Math.round(amount * (1 - gaze * 0.05));
    }
        darkRun.humanity = Math.max(0, Math.min(100, getHumanity() + amount));
        if (reason) darkRun.log.push(`[인간성] ${reason} (${amount >= 0 ? '+' : ''}${amount} → ${darkRun.humanity})`);
        renderDeepBar();
        if (darkRun.humanity <= 0 && !darkRun._turned) {
            darkRun._turned = true;
            setTimeout(() => a667Turned(), 700);
        }
    }

    function addDepth(amount) {

        if (amount > 0) {
            let drain = Math.floor(darkRun.depth / 15) * 2;
            if (qFlag('deep_anchor')) drain = Math.floor(drain / 2);
            if (drain > 0) addHumanity(-drain, '수압');
        }

        if (!darkRun) return;
        darkRun.depth = Math.max(0, Math.min(A667_MAXDEPTH, getDepth() + amount));
        if (amount > 0) {
            const drain = Math.floor(darkRun.depth / 15) * 2;
            if (drain > 0) addHumanity(-drain, '수압');
        }
        renderDeepBar();
    }

    function deepBarHtml() {
        return `<div id="deep-bar" style="margin-bottom:12px;"></div>`;
    }

    function renderDeepBar() {
        const el = document.getElementById('deep-bar');
        if (!el || !darkRun) return;
        const h = getHumanity();
        const d = getDepth();
        const hColor = h >= 70 ? '#4CAF50' : h >= 40 ? '#ff9800' : '#f44336';
        const hLabel = h >= 70 ? '사람' : h >= 40 ? '흔들림' : h >= 15 ? '경계' : '거의';

        el.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
                <span>인간성 — <b style="color:${hColor};">${hLabel}</b></span>
                <span style="color:${hColor}; font-weight:bold;">${h} / 100</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden; margin-bottom:8px;">
                <div style="height:100%; width:${h}%; background:${hColor}; transition:width 0.5s;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
                <span>수심</span>
                <span style="color:#4fc3f7; font-weight:bold;">${d} m</span>
            </div>
            <div style="width:100%; height:5px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:3px; overflow:hidden;">
                <div style="height:100%; width:${d}%; background:linear-gradient(90deg,#0277bd,#01579b); transition:width 0.6s;"></div>
            </div>`;
    }

    // 인간성 0 — 변이
    function a667Turned() {
        darkRun.fail += 3;
        darkDeath(
            `숨이 편해진다.<br><br>` +
            `아까부터 쉬고 있었는데, 이제야 그게 자연스럽다.<br>` +
            `목 옆이 열렸다 닫힌다. 언제부터인지는 모르겠다.<br><br>` +
            `아래에서 불빛들이 다가온다. 반가워하는 속도다.<br>` +
            `한 마리가 앞에 선다. 사람 얼굴이다.<br><br>` +
            `<span style="color:#4fc3f7;">"오래 걸리셨네요."</span><br><br>` +
            `무슨 말인지 알아들었다. 그게 마지막이었다.`
        );
    }

        // 수심이 깊으면 글자가 흔들린다
    function distort(text) {
        const d = getDepth();
        if (d < 50) return text;
        const rate = d >= 85 ? 0.10 : d >= 70 ? 0.06 : 0.03;
        return text.split('').map(ch => {
            if (ch === '<' || ch === '>' || ch === ' ') return ch;
            if (Math.random() < rate) {
                return `<span style="opacity:0.35; filter:blur(1px);">${ch}</span>`;
            }
            return ch;
        }).join('');
    }

    // 인간성이 낮으면 선택지 순서가 뒤바뀐다
    function maybeShuffle(options) {
        const h = getHumanity();
        if (h >= 50) return options;
        const arr = options.slice();
        const chance = h < 20 ? 0.55 : h < 35 ? 0.35 : 0.2;
        if (Math.random() > chance) return arr;

        // ★ 라벨과 실제 동작을 뒤바꾼다
        const i = Math.floor(Math.random() * arr.length);
        let j = Math.floor(Math.random() * arr.length);
        while (j === i && arr.length > 1) j = Math.floor(Math.random() * arr.length);

        const swapped = arr.map((o, idx) => {
            if (idx === i) return { ...o, fn: arr[j].fn, arg: arr[j].arg, _lied: true };
            return o;
        });
        return swapped;
    }

        const A667_CHECKS = [
        { q:'손가락이 몇 개입니까?',        a:['10','열','십','열개','10개'] },
        { q:'당신의 이름을 적으십시오.',    a:null },
        { q:'숨을 쉬고 있습니까?',          a:['네','예','응','yes','쉬고있다','그렇다'] },
        { q:'물은 마시는 것입니까, 있는 것입니까?', a:['마시는','마시는것','마신다'] },
        { q:'당신은 무엇입니까?',           a:['사람','인간','나','사원'] }
    ];

    function renderSelfCheck(next) {
        const c = A667_CHECKS[Math.floor(Math.random() * A667_CHECKS.length)];
        darkRun._checkAns = c.a;
        darkRun._checkNext = next;
        

        darkBodyEl().innerHTML = darkBox("확인",
            distort(`잠깐 멈춘다.<br><br>
                여기 오래 있으면 잊는다고 들었다.<br>
                잊기 전에 확인해 두기로 한다.<br><br>
                <span style="color:#4fc3f7; font-size:14px;">${c.q}</span>`),
                        deepBarHtml() +
            `<input type="text" id="selfcheck-input" maxlength="20" placeholder="" style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') submitSelfCheck()">
             <button class="game-btn" style="width:100%; margin:0; padding:12px;" onclick="submitSelfCheck()">적는다</button>
             ${gearValue(currentUser, 'luck') > 0 && Math.random() < gearValue(currentUser, 'luck')
                ? `<div style="font-size:10px; color:#c9a8ff; text-align:center; margin-top:9px;">✺ 어렴풋이 답이 떠오른다. ${c.a ? '"' + c.a[0] + '"' : '무엇이든'}</div>`
                : ''}`);
        renderDeepBar();
        mountDarkChat('normal');
        setTimeout(() => { const f = document.getElementById('selfcheck-input'); if (f) f.focus(); }, 200);

    
    }

        function submitSelfCheck() {
        const el = document.getElementById('selfcheck-input');
        if (!el) return;
        const v = el.value.trim();
        if (!v) { showCustomAlert('적어 주세요.'); return; }

        const ans = darkRun._checkAns;
        const ok = (ans === null) ? true : checkQuizAnswer(v, ans);

        if (ok) {
            addHumanity(+4 + Math.floor(gearValue(currentUser, 'gaze') / 3), '자각');
            darkRun.success++;
            darkRun._checkFail = 0;

         } else {
            if (consumeQFlag('deep_id')) {
                addHumanity(+2, '사원증');
                darkRun._checkFail = 0;
                darkBodyEl().innerHTML = darkBox("확인",
                    `적으려는데 안 나온다.<br><br>주머니에서 사원증을 꺼낸다.<br>적혀 있다. 읽는다. 소리 내어 읽는다.<br><br>사원증이 녹아 없어진다. 한 번뿐이었던 모양이다.`,
                    deepBarHtml() + darkChoiceBtn("계속 내려간다.", `partyAdvance(${darkRun._checkNext})`));
                renderDeepBar(); mountDarkChat('normal');
                return;
            }
            addHumanity(-18, '자각 실패');
            // ★ 두 번 틀리면 치명
            if (darkRun._checkFail >= 2) {
                darkRun.dying = 'forget';
                renderRescueScene('forget');
                return;
            }
        }

        darkBodyEl().innerHTML = darkBox("확인",
            ok
                ? `적는다.<br><br>손이 기억하고 있었다. 머리보다 먼저.<br>아직은 괜찮다.`
                : `적으려는데 잘 안 나온다.<br><br>분명히 알던 것인데 지금은 헷갈린다.<br>물속에서는 원래 그렇다고, 스스로에게 설명해 본다.<br><br>설명이 잘 됐다. 그게 더 문제다.`,
            deepBarHtml() + darkChoiceBtn("계속 내려간다.", `partyAdvance(${darkRun._checkNext})`));
        renderDeepBar();
        mountDarkChat('normal');
    }

        const A667_NARR = {
        1: { img:'step1', text:`불빛을 따라 내려간다.<br><br>
            줄지어 켜진 것들이 길처럼 보인다. 실제로 길일 수도 있다.<br>
            누군가 지나다니라고 켜 놓은 것처럼 간격이 일정하다.<br><br>
            귀가 먹먹하다. 삼키면 잠깐 풀렸다가 다시 막힌다.<br>
            그 감각만이 지금 몸이 어디쯤 있는지 알려 준다.<br><br>
            아래는 여전히 안 보인다.` },

        2: { text:`물고기가 지나간다.<br><br>
            평범하다. 손바닥만 하고, 은색이고, 무리 지어 다닌다.<br>
            이상한 점은 없다.<br><br>
            다만 지나가면서 전부 고개를 돌렸다.<br>
            물고기는 고개를 돌리지 않는다. 몸 전체로 방향을 바꾼다.<br><br>
            고개만 돌아갔다.` },

        3: { text:`무언가 스쳐 지나간다.<br><br>
            크기를 모르겠다. 바로 옆의 작은 것인지, 저 멀리 있는 큰 것인지.<br>
            물속에서는 거리를 잴 기준이 없다.<br><br>
            지나간 뒤에 물살이 왔다.<br>
            한참 뒤에 왔다.<br><br>
            그 시간 차이가 크기를 알려 준다. 알고 싶지 않았다.` },

        4: { img:'step2', text:`빛이 사라졌다.<br><br>
            위를 본다. 수면이 보이지 않는다. 언제부터인지 모르겠다.<br>
            올라가는 방향을 잃었다는 뜻이다.<br><br>
            공기 방울을 만들어 본다. 위로 간다.<br>
            방향은 알겠는데 거리를 모르겠다.<br><br>
            아래에서 다시 불빛이 켜진다.<br>
            내려가는 길만 밝다.` },

        5: { text:`물고기가 또 지나간다.<br><br>
            이번 것은 조금 크다. 그리고 비늘 사이에 뭔가 있다.<br>
            자세히 보니 손톱이다. 아주 작은.<br><br>
            열 개인지 세어 보려다 그만둔다.<br><br>
            세면 알게 될 것 같아서.` },

        6: { text:`바위 틈에 뭔가 걸려 있다.<br><br>
            옷이다. 우리 회사 작업복이다. 사번 자수까지 그대로다.<br>
            찢기지 않았다. 벗어 둔 것처럼 얌전히 걸려 있다.<br><br>
            벗을 이유가 있었다는 뜻이다.<br>
            벗고 나서 뭘 했는지는 생각하지 않기로 한다.<br><br>
            사번을 외워 둔다. 나중에 확인하려고.` },

        7: { text:`말소리가 난다.<br><br>
            물속에서 소리가 이렇게 잘 들릴 리 없는데 들린다.<br>
            귀로 듣는 게 아닌 것 같다.<br><br>
            <span style="color:#4fc3f7;">"많이 내려오셨네요."</span><br><br>
            친절하다. 걱정하는 목소리다.<br>
            그게 제일 무섭다.` },

        8: { text:`앞에 하나가 떠 있다.<br><br>
            사람 크기다. 팔이 있고 다리가 있다.<br>
            다만 관절이 하나씩 더 있다. 접히는 방향이 자유롭다.<br><br>
            얼굴은 사람이다. 정말로 사람이다.<br>
            표정도 있다. 미안해하는 표정이다.<br><br>
            <span style="color:#4fc3f7;">"여기까지 오시면 힘드실 텐데."</span><br><br>
            길을 비켜 준다. 지나가라는 뜻이다.` },

        9: { text:`손등을 본다.<br><br>
            아까부터 자꾸 보게 된다. 확인하려고.<br>
            손등이다. 아직 손등이다.<br><br>
            다만 손가락 사이가 조금 얇아졌다.<br>
            원래 이랬던가.<br><br>
            옆 사람 손을 본다. 같은 상태다.<br>
            서로 말하지 않기로 했다.` },

        10: { img:'step3', text:`불빛이 많아졌다.<br><br>
            수십 개, 수백 개. 전부 일정한 간격으로 떠 있다.<br>
            가까이 가 보니 각각에 하나씩 매달려 있다.<br><br>
            등불을 단 것들이다. 그런데 등불이 몸에서 난 게 아니라 손에 들려 있다.<br>
            손으로 들고 있다.<br><br>
            전부 같은 쪽을 밝히고 있다. 아래쪽이다.<br>
            일하는 중인 것 같다.` },

        11: { text:`하나가 다가온다.<br><br>
            등불을 들어 이쪽을 비춘다. 눈이 부시다.<br>
            한참 본다. 확인하는 눈빛이다.<br><br>
            <span style="color:#4fc3f7;">"아직이시네요."</span><br><br>
            아직 뭐냐고 묻고 싶은데 입이 잘 안 벌어진다.<br>
            물이 들어올까 봐 참는 습관이 생겼다.<br><br>
            그것은 기다려 준다. 서두르지 않는다.<br>
            시간은 많다는 자세다.` },

        12: { text:`바닥이 보인다.<br><br>
            진흙이다. 발이 닿자 푹 들어간다.<br>
            발자국이 남는다. 그리고 천천히 메워진다.<br><br>
            주변에 발자국이 많다. 전부 한 방향이다.<br>
            내려온 발자국만 있고 올라간 발자국은 없다.<br><br>
            당연하다. 올라갈 때는 걷지 않으니까.<br>
            그렇게 생각하고 나서, 그 생각이 이상하다는 걸 알았다.` },

        13: { text:`건물이 있다.<br><br>
            물속에 건물이 있다. 우리 회사 건물과 구조가 같다.<br>
            창문 위치까지 같다.<br><br>
            안에 불이 켜져 있다. 사람 그림자가 움직인다.<br>
            출근한 사람들처럼 바쁘다.<br><br>
            유리에 얼굴을 대 본다.<br>
            안쪽에서도 누가 얼굴을 댄다. 같은 자리에.<br><br>
            거울이 아니다. 얼굴이 다르다.` },

        14: { text:`안으로 들어간다.<br><br>
            복도가 익숙하다. 걸음이 저절로 간다.<br>
            자기 자리를 찾아가는 몸이다.<br><br>
            책상이 있다. 명패가 놓여 있다.<br>
            읽는다.<br><br>
            <span style="color:#4fc3f7;">내 이름이다.</span><br><br>
            의자가 조금 빠져 있다. 방금 누가 일어난 것처럼.` },

        15: { img:'step4', text:`가장 아래다.<br><br>
            방이 하나 있고, 가운데에 하나가 앉아 있다.<br>
            완전히 사람이다. 어디를 봐도 사람이다.<br><br>
            앉은 자세도, 손을 모은 방식도, 숨 쉬는 박자도.<br>
            흉내가 아니라 그냥 사람이다.<br><br>
            그것이 고개를 든다.<br><br>
            <span style="color:#4fc3f7;">"오래 준비했습니다."</span><br><br>
            무엇을 준비했는지는 말하지 않는다.` },

        16: { text:`돌아가야 한다.<br><br>
            올라가는 길을 아는 것은 저것뿐이다.<br>
            물어봐야 한다. 그러려면 대화를 해야 한다.<br><br>
            대화를 하면 그만큼 닮아진다.<br>
            여기까지 오면서 배운 것이 그거였다.<br><br>
            아무도 먼저 입을 열지 않는다.<br>
            그것은 기다린다. 얼마든지 기다릴 수 있는 자세로.` }
    };

    const A667_STEPS = {
        0:  { type:'intro' },
        1:  { type:'narr', n:1 },
        2:  { type:'gimmick', n:1 },
        3:  { type:'narr', n:2 },
        4:  { type:'check' },
        5:  { type:'narr', n:3 },
        6:  { type:'gimmick', n:2 },
        7:  { type:'narr', n:4 },
        8:  { type:'split', n:1 },
        9:  { type:'narr', n:5 },
        10: { type:'gimmick', n:3 },
        11: { type:'narr', n:6 },
        12: { type:'check' },
        13: { type:'rejoin', n:1 },
        14: { type:'narr', n:7 },
        15: { type:'gimmick', n:4 },
        16: { type:'narr', n:8 },
        17: { type:'narr', n:9 },
        18: { type:'check' },
        19: { type:'narr', n:10 },
        20: { type:'gimmick', n:5 },
        21: { type:'narr', n:11 },
        22: { type:'split', n:2 },
        23: { type:'narr', n:12 },
        24: { type:'rejoin', n:2 },
        25: { type:'narr', n:13 },
        26: { type:'gimmick', n:6 },
        27: { type:'narr', n:14 },
        28: { type:'check' },
        29: { type:'narr', n:15 },
        30: { type:'narr', n:16 },
        31: { type:'gimmick', n:7 },
        32: { type:'gimmick', n:8 },
        99: { type:'result' }
    };

    function renderStepA667() {

        if (darkRun.humanity == null) darkRun.humanity = qFlag('deep_air') ? 90 : 70;
        
        if (darkRun.depth == null) darkRun.depth = 0;
        if (darkRun.solo && darkRun.driftIdx != null && darkRun.driftIdx < 2) { renderDrift(); return; }

        const body = darkBodyEl();
        if (!body || !darkRun) return;
        if (darkRun.rejoined) { renderRejoinScene(); return; }
        if (darkRun.isParty) { watchPartyStep(); watchDyingMembers(); }
        saveDarkRunState();

        if (darkRun.humanity == null) darkRun.humanity = 70;
        if (darkRun.depth == null) darkRun.depth = 0;

        const def = A667_STEPS[darkRun.step];
        if (!def) { renderDarkResult(); return; }

        if (def.type === 'intro') {
            body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
                deepBarHtml() +
                `<div style="background:rgba(79,195,247,0.06); border:1px solid #1a4a6a; border-radius:6px; padding:13px; margin-bottom:13px; font-size:11px; color:#ccc; line-height:1.8;">
                    <div style="font-size:12px; color:#4fc3f7; font-weight:bold; margin-bottom:8px;">◈ 주의</div>
                    깊이 내려갈수록 <b style="color:#ff9800;">인간성</b>이 줄어듭니다.<br>
                    말을 섞을수록, 오래 머무를수록 줄어듭니다.<br>
                    0이 되면 돌아올 수 없습니다.<br><br>
                    <span style="font-size:10px; color:#888;">중간중간 스스로를 확인하십시오. 그게 유일한 회복 수단입니다.</span>
                 </div>` +
                darkChoiceBtn("내려간다.", "partyAdvance(1)"), "intro");
            renderDeepBar();
            mountDarkChat('normal');
            return;
        }

                     if (def.type === 'narr') {
            addDepth(3);
            addHumanity(-1, '체류');
            if (maybeGrab()) return;
            if (maybeDrift()) return;
            const d = A667_NARR[def.n];
            body.innerHTML = darkBox("—", distort(d.text),
                deepBarHtml() + darkChoiceBtn("계속 내려간다.", `partyAdvance(${darkRun.step + 1})`),
                d.img);
            renderDeepBar();
            mountDarkChat('normal');
            return;
        }

        if (def.type === 'check')  { renderSelfCheck(darkRun.step + 1); return; }
        if (def.type === 'split')  { renderA667Split(def.n); return; }
        if (def.type === 'rejoin') { renderA667Rejoin(def.n); return; }
        if (def.type === 'result') { renderDarkResult(); return; }

        const fns = { 1:a667G1, 2:a667G2, 3:a667G3, 4:a667G4, 5:a667G5, 6:a667G6, 7:a667G7, 8:a667G8 };
        if (fns[def.n]) fns[def.n]();
    }

        // --- 기믹 1: 첫 무리 ---
    function a667G1() {
        addDepth(5);
        renderA667Choice("기믹 1 — 무리",
            distort(`은색 무리가 앞을 막는다.<br><br>
                지나가려면 헤치고 가야 한다.<br>
                전부 고개를 돌려 이쪽을 보고 있다. 몸은 그대로인 채로.`),
            maybeShuffle([
                { id:'slow',  label:'① 천천히 헤치고 간다.',      fn:'a667G1R', arg:'slow' },
                { id:'still', label:'② 멈춰서 지나가길 기다린다.', fn:'a667G1R', arg:'still' },
                { id:'push',  label:'③ 밀치고 지나간다.',         fn:'a667G1R', arg:'push' },
                { id:'look',  label:'④ 마주 본다.',               fn:'a667G1R', arg:'look' }
            ]), "step1");
    }

       function a667G1R(pick) {
        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'slow') {
            txt = `천천히 손으로 물을 가른다.<br><br>무리가 갈라진다. 닿지 않게 비켜 준다.<br>배려받았다는 느낌이 든다. 물고기한테.`;
            hum = -2; darkRun.success++;
        } else if (pick === 'still') {
            txt = `멈춘다. 무리가 지나간다.<br><br>오래 걸린다. 그동안 전부 이쪽을 본다.<br>다 지나가고 나서도 한참 움직일 수가 없었다.`;
            hum = 0; darkRun.success++;
        } else if (pick === 'push') {
            txt = `밀치고 간다.<br><br>손에 닿는다. 비늘이 아니라 피부 같다. 미지근하다.<br>밀린 것들이 소리를 낸다. 아픈 소리가 아니라 놀란 소리다.`;
            hum = -6; darkRun.fail++;
        } else {
            txt = `마주 본다.<br><br>수십 개의 눈이 동시에 이쪽을 본다.<br>눈동자에 초점이 있다. 물고기 눈에는 초점이 없어야 하는데.<br><br>먼저 시선을 피한 건 이쪽이었다.`;
            hum = -4; darkRun.success++;
        }
        addHumanity(hum, `기믹 1 ${pick}`);
        renderResultStep("기믹 1 — 결과", distort(txt), "내려간다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 2: 크기 ---
    function a667G2() {
        addDepth(6);
        renderA667Choice("기믹 2 — 크기",
            distort(`위쪽이 어두워진다.<br><br>
                구름이 낀 것 같은데, 물속에는 구름이 없다.<br>
                무언가 지나가고 있다. 아직 끝나지 않았다.<br><br>
                한참 지나간다. 계속 지나간다.`),
            maybeShuffle([
                { id:'down',  label:'① 바닥에 붙어 숨는다.',    fn:'a667G2R', arg:'down' },
                { id:'freeze',label:'② 움직이지 않는다.',       fn:'a667G2R', arg:'freeze' },
                { id:'watch', label:'③ 끝까지 올려다본다.',     fn:'a667G2R', arg:'watch' },
                { id:'swim',  label:'④ 반대쪽으로 헤엄친다.',   fn:'a667G2R', arg:'swim' }
            ]), null);
    }

    function a667G2R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('hide');
        const DC = { down: 9, freeze: 10, watch: 16, swim: 13 }[pick] - gearValue(currentUser, 'break');
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt, hum = 0, died = false;
        if (pick === 'watch') {
            if (ok) {
                txt = `끝까지 올려다본다.<br><br>끝이 없다. 시야 전체가 그것이다.<br>눈이 있었다. 하나. 이쪽을 보고 있었다.<br><br>본 것을 후회한다. 다만 본 것으로 하나 알게 됐다.<br>저것은 관심이 없다. 그게 유일한 다행이었다.`;
                hum = -12; darkRun.success++;
                darkRun.modifier = (darkRun.modifier || 0) + 2;
            } else {
                died = true;
                txt = `끝까지 올려다본다.<br><br>끝이 없다.<br>보고 있으면 눈이 그것을 정리하지 못한다.<br><br>정리하려고 애쓰다가, 무언가 다른 것이 정리를 대신해 준다.<br>그다음은 편했다.`;
            }
        } else if (ok) {
            txt = pick === 'down' ? `바닥에 붙는다. 진흙이 얼굴까지 덮는다.<br><br>위로 지나가는 그림자가 한참 이어진다.<br>숨을 참았다. 참을 필요가 없었는데도.`
                : pick === 'freeze' ? `움직이지 않는다.<br><br>물속에서 완전히 멈추는 건 어렵다. 그래도 멈췄다.<br>지나갔다. 알아채지 못한 것 같다.`
                : `반대쪽으로 헤엄친다.<br><br>한참 헤엄쳤는데 그림자가 여전히 위에 있다.<br>속도가 문제가 아니라 크기가 문제였다.<br><br>결국 멈췄고, 그다음에 지나갔다.`;
            hum = -3; darkRun.success++;
        } else {
            txt = `늦었다.<br><br>그림자가 이쪽을 지날 때 물살에 휩쓸린다.<br>한참 굴렀다. 방향을 완전히 잃었다.<br><br>정신을 차리니 아까보다 훨씬 아래다.`;
            hum = -8; darkRun.fail++;
            addDepth(12);
        }

        if (died) { darkDeath(txt); return; }
        addHumanity(hum, `기믹 2 ${pick}`);
        darkBodyEl().innerHTML = darkBox("기믹 2 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${distort(txt)}`,
            deepBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderDeepBar();
        mountDarkChat('normal');
    }

    // --- 기믹 3: 첫 대화 ---
    function a667G3() {
        addDepth(5);
        renderA667Choice("기믹 3 — 첫 말",
            distort(`목소리가 묻는다.<br><br>
                <span style="color:#4fc3f7;">"많이 내려오셨네요. 힘드시죠?"</span><br><br>
                친절하다. 정말로 걱정하는 목소리다.<br>
                대답하면 뭔가 시작될 것 같고, 안 하면 실례인 것 같다.`),
            maybeShuffle([
                { id:'no',    label:'① 대답하지 않는다.',          fn:'a667G3R', arg:'no' },
                { id:'yes',   label:'② "네"라고 답한다.',          fn:'a667G3R', arg:'yes' },
                { id:'ask',   label:'③ 누구냐고 되묻는다.',        fn:'a667G3R', arg:'ask' },
                { id:'thank', label:'④ 고맙다고 한다.',            fn:'a667G3R', arg:'thank' }
            ]), null);
    }

    function a667G3R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'no') {
            txt = `대답하지 않는다.<br><br>목소리가 잠깐 멎었다가 다시 말한다.<br><span style="color:#4fc3f7;">"괜찮습니다. 아직 익숙하지 않으실 테니까요."</span><br><br>기다려 준다. 서두르지 않는다.`;
            hum = +2; darkRun.success++;
        } else if (pick === 'yes') {
            txt = `"네."<br><br>말이 입 밖으로 나오는데 물이 들어오지 않는다.<br>그 사실을 깨닫고 나서 목이 서늘해졌다.<br><br><span style="color:#4fc3f7;">"그러실 겁니다. 조금만 더 가시면 편해져요."</span>`;
            hum = -12; darkRun.fail++;
        } else if (pick === 'ask') {
            txt = `누구냐고 묻는다.<br><br><span style="color:#4fc3f7;">"저도 처음엔 여쭤봤어요."</span><br><br>대답이 아니다. 그런데 대답처럼 들린다.<br>그게 더 신경 쓰인다.`;
            hum = -8; darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
        } else {
            txt = `고맙다고 한다.<br><br>목소리가 기뻐한다. 진심으로 기뻐한다.<br><span style="color:#4fc3f7;">"별말씀을요. 곧 같이 일하게 될 텐데요."</span><br><br>같이라는 말이 오래 남는다.`;
            hum = -15; darkRun.fail++;
        }
        addHumanity(hum, `기믹 3 ${pick}`);
        renderResultStep("기믹 3 — 결과", distort(txt), "내려간다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 4: 작업복 ---
    function a667G4() {
        addDepth(6);
       renderA667Choice("기믹 4 — 작업복",
            distort(`걸려 있던 작업복을 다시 본다.<br><br>
                사번이 적혀 있다. 아는 번호는 아니다. 그런데 형식은 같다.<br>
                주머니가 불룩하다. 뭔가 들어 있다.`),
            maybeShuffle([
                { id:'pocket', label:'① 주머니를 뒤진다.',      fn:'a667G4R', arg:'pocket' },
                { id:'wear',   label:'② 입어 본다.',            fn:'a667G4R', arg:'wear' },
                { id:'take',   label:'③ 챙겨서 간다.',          fn:'a667G4R', arg:'take' },
                { id:'leave',  label:'④ 그대로 둔다.',          fn:'a667G4R', arg:'leave' }
            ]), null);
    }

    function a667G4R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'pocket') {
            txt = `주머니를 뒤진다.<br><br>사원증이 나온다. 사진이 있다.<br>사람 얼굴이다. 웃고 있다.<br><br>뒷면에 손글씨가 있다.<br><span style="color:#4fc3f7;">"내려가면 안 됨"</span><br><br>글씨가 흔들린다. 급하게 쓴 것 같다.`;
            hum = +5; darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 2;
        } else if (pick === 'wear') {
            txt = `입어 본다. 딱 맞는다.<br><br>어깨선도, 소매 길이도. 재단한 것처럼 맞는다.<br>내 치수를 아는 사람이 만든 옷 같다.<br><br>벗으려는데 잘 안 벗겨진다. 겨우 벗었다.`;
            hum = -12; darkRun.fail++;
        } else if (pick === 'take') {
            txt = `접어서 챙긴다.<br><br>무겁다. 물을 먹어서가 아니라 원래 무겁다.<br>들고 가는 동안 계속 어깨가 눌린다.<br><br>나중에 꺼내 보면 알게 될 것 같다.`;
            hum = -3; darkRun.success++;
        } else {
            txt = `그대로 둔다.<br><br>지나가면서 한 번 더 본다.<br>바람에 흔들리듯 옷자락이 움직인다. 물살은 없는데.<br><br>손을 흔드는 것처럼 보였다.`;
            hum = 0; darkRun.success++;
        }
        addHumanity(hum, `기믹 4 ${pick}`);
        renderResultStep("기믹 4 — 결과", distort(txt), "계속 간다.", `partyAdvance(${darkRun.step + 1})`);
    }

        // --- 기믹 5: 등불 ---
    function a667G5() {
        addDepth(8);
       renderA667Choice("기믹 5 — 등불",
            distort(`등불을 든 것들 사이를 지나야 한다.<br><br>
                전부 아래를 비추고 있다. 일하는 중이다.<br>
                방해하면 안 될 것 같은 분위기다.<br><br>
                하나가 등불을 내민다. 들어 보라는 뜻이다.`),
            maybeShuffle([
                { id:'refuse', label:'① 받지 않는다.',            fn:'a667G5R', arg:'refuse' },
                { id:'hold',   label:'② 받아서 든다.',            fn:'a667G5R', arg:'hold' },
                { id:'help',   label:'③ 무엇을 찾냐고 묻는다.',   fn:'a667G5R', arg:'help' },
                { id:'douse',  label:'④ 등불을 꺼 버린다.',       fn:'a667G5R', arg:'douse' }
            ]), "step3");
    }

    function a667G5R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'refuse') {
            txt = `고개를 젓는다.<br><br>그것이 등불을 거둔다. 실망한 기색은 없다.<br>다만 다음에 또 권할 자세다.<br><br>지나가는 동안 전부 하던 일을 멈추고 지켜봤다.`;
            hum = +3; darkRun.success++;
        } else if (pick === 'hold') {
            txt = `받아서 든다. 가볍다.<br><br>손에 들자 자연스럽게 아래를 비추게 된다.<br>팔이 알아서 움직였다.<br><br>정신을 차리고 내려놓는다.<br>옆에 있던 것이 고개를 끄덕인다. 잘했다는 뜻 같다.`;
            hum = -21; darkRun.fail++;
        } else if (pick === 'help') {
            txt = `무엇을 찾느냐고 묻는다.<br><br><span style="color:#4fc3f7;">"떨어진 걸 찾습니다. 가끔 위에서 떨어져요."</span><br><br>무엇이 떨어지냐고는 묻지 않았다.<br>이미 알 것 같아서.`;
            hum = -9; darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 1;
        } else {
            txt = `등불을 꺼 버린다.<br><br>주변이 조용해진다. 전부 동시에 멈춘다.<br>어둠 속에서 수백 개의 얼굴이 이쪽을 향한다.<br><br>한참 뒤에 등불이 다시 켜진다. 아무 일 없었다는 듯이.<br>다만 하나가 더 늘어 있다.`;
            hum = -12; darkRun.fail++;
            darkRun.modifier = (darkRun.modifier || 0) - 2;
        }
        addHumanity(hum, `기믹 5 ${pick}`);
        renderResultStep("기믹 5 — 결과", distort(txt), "지나간다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 6: 건물 ---
    function a667G6() {
        addDepth(7);
        renderA667Choice("기믹 6 — 창문",
            distort(`유리 안쪽에서 누가 얼굴을 대고 있다.<br><br>
                같은 자리, 같은 높이. 다만 얼굴이 다르다.<br>
                입을 움직인다. 뭔가 말하고 있다.<br><br>
                유리 너머라 소리는 안 들린다. 읽어야 한다.`),
            maybeShuffle([
                { id:'read',   label:'① 입모양을 읽는다.',        fn:'a667G6R', arg:'read' },
                { id:'back',   label:'② 물러난다.',               fn:'a667G6R', arg:'back' },
                { id:'knock',  label:'③ 유리를 두드린다.',        fn:'a667G6R', arg:'knock' },
                { id:'mimic',  label:'④ 같은 입모양을 따라한다.', fn:'a667G6R', arg:'mimic' }
            ]), null);
    }

    function a667G6R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'read') {
            txt = `입모양을 읽는다.<br><br>같은 말을 반복하고 있다. 세 음절.<br><span style="color:#4fc3f7;">"나 가 라"</span><br><br>읽고 나자 그쪽이 고개를 끄덕인다.<br>전해졌다는 걸 안 것이다.`;
            hum = +6; darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 2;
        } else if (pick === 'back') {
            txt = `물러난다.<br><br>유리 안쪽 얼굴이 따라서 물러난다. 같은 속도로.<br>거리가 유지된다.<br><br>돌아설 때까지 계속 그 거리였다.`;
            hum = 0; darkRun.success++;
        } else if (pick === 'knock') {
            txt = `유리를 두드린다.<br><br>안쪽에서도 두드린다. 같은 자리, 같은 박자.<br>조금 더 세게 두드린다. 저쪽도 세게 두드린다.<br><br>유리에 금이 간다. 어느 쪽에서 간 건지 모르겠다.`;
            hum = -9; darkRun.fail++;
        } else {
            txt = `같은 입모양을 따라한다.<br><br>세 음절. 발음해 보니 아는 말이다.<br>말하고 나서야 무슨 말인지 알았다.<br><br>안쪽 얼굴이 웃는다.<br>이제 둘 다 같은 말을 했다.`;
            hum = -15; darkRun.fail++;
        }
        addHumanity(hum, `기믹 6 ${pick}`);
        renderResultStep("기믹 6 — 결과", distort(txt), "안으로 간다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 7: 대화 ---
    function a667G7() {
        addDepth(5);
        const h = getHumanity();
        renderA667Choice("기믹 7 — 묻기",
            distort(`올라가는 길을 아는 것은 저것뿐이다.<br><br>
                물어봐야 한다. 대화를 하면 그만큼 닮아진다.<br>
                그래도 물어야 한다.<br><br>
                <span style="color:#888; font-size:11px;">현재 인간성 ${h}. 대화마다 줄어듭니다.</span>`),
            maybeShuffle([
                { id:'direct', label:'① 올라가는 길을 묻는다.',          fn:'a667G7R', arg:'direct' },
                { id:'why',    label:'② 왜 인간이 되려 하냐고 묻는다.',  fn:'a667G7R', arg:'why' },
                { id:'name',   label:'③ 이름을 묻는다.',                 fn:'a667G7R', arg:'name' },
                { id:'silent', label:'④ 아무것도 묻지 않는다.',          fn:'a667G7R', arg:'silent' }
            ]), "step4");
    }

    function a667G7R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        let txt, hum = 0;
        if (pick === 'direct') {
            txt = `올라가는 길을 묻는다.<br><br><span style="color:#4fc3f7;">"위로 가시면 됩니다. 계속 위로."</span><br><br>그게 다냐고 묻자 고개를 끄덕인다.<br><span style="color:#4fc3f7;">"어려운 건 방향이 아니라 이유예요.<br>올라갈 이유가 남아 있으면 올라가집니다."</span>`;
            hum = -8; darkRun.success++;
            darkRun.a667Route = true;
        } else if (pick === 'why') {
            txt = `왜 인간이 되려 하느냐고 묻는다.<br><br>그것이 처음으로 표정을 바꾼다. 곤란해하는 표정이다.<br><br><span style="color:#4fc3f7;">"되려던 게 아니에요.<br>오래 보다 보면 닮아지는 거죠. 그뿐입니다."</span><br><br>오래 봤다는 말이 걸린다.<br>누가 누구를 봤다는 건지.`;
            hum = -12; darkRun.success++;
            darkRun.modifier = (darkRun.modifier || 0) + 3;
            darkRun.a667Truth = true;
        } else if (pick === 'name') {
            txt = `이름을 묻는다.<br><br>그것이 이름을 말한다.<br>아는 이름이다. 작업복 사번의 주인일 것이다.<br><br><span style="color:#4fc3f7;">"오래 안 썼는데, 아직 기억하고 있었네요."</span><br><br>기뻐한다. 그게 제일 견디기 어려웠다.`;
            hum = -18; darkRun.success++;
            darkRun.a667Name = true;
        } else {
            txt = `아무것도 묻지 않는다.<br><br>그것이 기다린다. 한참 기다린다.<br>기다리다가 먼저 말한다.<br><br><span style="color:#4fc3f7;">"안 물어보시는군요. 잘하셨어요."</span><br><br>칭찬이 아니었다. 아쉬워하는 말투였다.`;
            hum = +5; darkRun.success++;
        }
        addHumanity(hum, `기믹 7 ${pick}`);
        renderResultStep("기믹 7 — 결과", distort(txt), "일어선다.", `partyAdvance(${darkRun.step + 1})`);
    }

    // --- 기믹 8: 올라가기 ---
        function a667G8() {
        const h = getHumanity();
        const hasRoute = darkRun.a667Route || darkRun.a667Truth;

        // 히든 조건
        const truthReady = darkRun.a667Truth && darkRun.a667Name && h >= 30;
        const coexistReady = h >= 8 && h <= 25;
        const rescueReady = darkRun.a667Name && (currentUser.inventory || []).includes('여섯 번째 손가락');

        let opts = [
            { id:'name',   label:'① 자기 이름을 계속 부르며 올라간다.', fn:'a667G8R', arg:'name' },
            { id:'air',    label:'② 숨을 참고 올라간다.',               fn:'a667G8R', arg:'air' },
            { id:'nolook', label:'③ 아래를 보지 않고 올라간다.',        fn:'a667G8R', arg:'nolook' },
            { id:'stay',   label:'④ 여기 남는다.',                      fn:'a667G8R', arg:'stay' }
        ];
        if (truthReady)   opts.push({ id:'truth',   label:'⑤ 마지막으로 하나만 더 묻는다. <span style="color:#4fc3f7; font-size:10px;">[?]</span>', fn:'a667Hidden', arg:'truth' });
        if (coexistReady) opts.push({ id:'coexist', label:'⑥ 올라가지도 남지도 않는다. <span style="color:#4fc3f7; font-size:10px;">[?]</span>', fn:'a667Hidden', arg:'coexist' });
        if (rescueReady)  opts.push({ id:'rescue',  label:'⑦ 이름을 부른 쪽을 데려간다. <span style="color:#4fc3f7; font-size:10px;">[?]</span>', fn:'a667Hidden', arg:'rescue' });

        renderA667Choice("기믹 8 — 위로",
            `올라가야 한다.<br><br>
             수면은 보이지 않는다. 방향만 안다.<br>
             올라가려면 이유가 필요하다고 했다.<br><br>
             <span style="color:#888; font-size:11px;">인간성 ${h} · ${hasRoute ? '길을 들었다' : '길을 모른다'}</span>`,
            opts, null);
    }

    function a667Hidden(kind) {
        if (kind === 'truth') {
            darkRun.success += 4;
            darkRun.hiddenRoute = 'truth';
            darkRun.critical = true;
            darkBodyEl().innerHTML = darkBox("— 진실",
                `묻는다. 왜 하필 인간이냐고.<br><br>
                 그것이 오래 침묵한다. 처음으로 시간을 쓴다.<br><br>
                 <span style="color:#4fc3f7;">"위에서 자꾸 떨어지거든요."</span><br><br>
                 손을 편다. 손바닥에 뭔가 있다.<br>
                 사원증이다. 사번이 여럿 적혀 있다. 긁어 지우고 다시 쓴 자국.<br><br>
                 <span style="color:#4fc3f7;">"떨어진 걸 주우면 그 사람이 조금씩 옮아요.<br>
                 우리가 하려던 게 아니라, 그냥 그렇게 돼요.<br>
                 그래서 계속 줍는 겁니다. 안 주우면 더 많이 옮으니까."</span><br><br>
                 청소부였다.<br>
                 이 아래에서 가장 성실한 것들이었다.<br><br>
                 그것이 길을 알려 준다. 정확한 방향으로.<br>
                 <span style="color:#4fc3f7;">"위에 계신 분들께 전해 주세요. 그만 버리시라고."</span>`,
                deepBarHtml() + darkChoiceBtn("올라간다.", "darkRun.step=99; renderDarkStep();"));
            renderDeepBar(); mountDarkChat('normal');
            return;
        }

        if (kind === 'coexist') {
            const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
            const ok = roll >= 9;
            if (ok) {
                darkRun.success += 3;
                darkRun.hiddenRoute = 'coexist';
                darkBodyEl().innerHTML = darkBox("— 경계",
                    `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll}</div>
                     올라가지 않는다. 남지도 않는다.<br><br>
                     중간에 머문다. 물도 공기도 아닌 층이 있다.<br>
                     숨이 반쯤 쉬어지고 반쯤 안 쉬어진다. 견딜 만하다.<br><br>
                     아래에서 올려다보고, 위에서 내려다본다.<br>
                     양쪽 다 이쪽을 자기 쪽이라고 생각하는 것 같다.<br><br>
                     한참 있다가 그냥 걸어 올라왔다.<br>
                     걸어서. 물속인데 걸어서.<br><br>
                     <span style="color:#4fc3f7;">손등을 본다. 손등이다. 다만 아까와는 조금 다르다.</span>`,
                    deepBarHtml() + darkChoiceBtn("올라간다.", "darkRun.step=99; renderDarkStep();"));
                renderDeepBar(); mountDarkChat('normal');
            } else {
                darkDeath(
                    `올라가지도 남지도 않으려 했다.<br><br>` +
                    `중간은 없었다. 그건 위에서 보는 사람들의 착각이다.<br>` +
                    `아래에서는 전부 아래다.<br><br>` +
                    `가라앉는 동안 편했다. 그게 답이었다.`
                );
            }
            return;
        }

        if (kind === 'rescue') {
            const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
            const bonus = Math.floor(getHumanity() / 10);
            const ok = (roll + bonus) >= 14;
            removeItemFromInventory(currentUser, '여섯 번째 손가락', 1);

            if (ok) {
                darkRun.success += 5;
                darkRun.hiddenRoute = 'rescue';
                darkRun.critical = true;
                darkBodyEl().innerHTML = darkBox("— 귀환",
                    `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(+${bonus})</span></div>
                     이름을 부른다. 아까 들은 이름을.<br><br>
                     그것이 멈춘다. 오래 안 쓴 이름이라고 했었다.<br>
                     두 번 부른다. 세 번 부른다.<br><br>
                     손을 내민다. 손가락이 여섯이다.<br>
                     주머니에서 꺼낸 것을 맞춰 본다. 자리가 맞는다.<br><br>
                     잡는다. 같이 올라간다.<br>
                     올라가는 동안 그것이 점점 가벼워진다.<br>
                     수면을 뚫었을 때는 사람 하나 무게였다.<br><br>
                     <span style="color:#4fc3f7;">기록에는 없는 사번이었다.<br>
                     찾아보니 삼 년 전 실종 처리된 사원이었다.</span>`,
                    deepBarHtml() + darkChoiceBtn("올라간다.", "darkRun.step=99; renderDarkStep();"));
                renderDeepBar(); mountDarkChat('normal');
            } else {
                darkRun.fail += 2;
                addHumanity(-20, '구조 실패');
                darkBodyEl().innerHTML = darkBox("— 실패",
                    `<div style="text-align:center; font-size:26px; font-weight:bold; color:#f44336; margin-bottom:12px;">🎲 ${roll}</div>
                     이름을 부른다.<br><br>
                     그것이 돌아본다. 그리고 고개를 젓는다.<br><br>
                     <span style="color:#4fc3f7;">"저는 이제 여기 사람입니다."</span><br><br>
                     손을 내밀지 않는다.<br>
                     혼자 올라왔다. 올라오는 내내 뒤가 무거웠다.`,
                    deepBarHtml() + darkChoiceBtn("올라간다.", "darkRun.step=99; renderDarkStep();"));
                renderDeepBar(); mountDarkChat('normal');
            }
            return;
        }
    }

    function a667G8R(pick) {

        if (darkRun._lastLied) {
            showDarkToast('손이 다른 쪽으로 움직였다.');
            darkRun._lastLied = false;
        }

        if (pick === 'stay') {
            darkRun.fail += 3;
            darkDeath(
                `남기로 한다.<br><br>` +
                `이유를 설명할 수는 없다. 다만 여기가 편하다.<br>` +
                `숨 쉬는 게 이제 자연스럽다. 아까부터 그랬다.<br><br>` +
                `누군가 등불을 건넨다. 이번에는 받는다.<br>` +
                `아래를 비춘다. 팔이 알아서 움직인다.<br><br>` +
                `<span style="color:#4fc3f7;">"잘 오셨습니다."</span>`
            );
            return;
        }

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('sense') + Math.floor(getHumanity() / 12);
        const hasRoute = darkRun.a667Route || darkRun.a667Truth;
        let DC = { name: 11, air: 14, nolook: 12 }[pick];
        if (!hasRoute) DC += 4;
        DC -= gearValue(currentUser, 'break');

        const ok = roll !== 1 && (roll + bonus) >= DC;
        let txt;

        if (ok) {
            darkRun.success += 2;
            txt = pick === 'name' ? `이름을 부르며 올라간다.<br><br>내 이름이다. 소리 내어 부르면 몸이 그쪽으로 기운다.<br>부르는 동안은 잊지 않는다.<br><br>물이 옅어진다. 위가 밝아진다.`
                : pick === 'air' ? `숨을 참는다.<br><br>참을 필요가 없는데 참는다. 그게 인간이 하는 짓이니까.<br>폐가 아프다. 아픈 게 반갑다.<br><br>터지기 직전에 수면이 보였다.`
                : `아래를 보지 않는다.<br><br>불빛들이 따라 올라오는 기척이 난다. 돌아보지 않는다.<br>돌아보면 이유가 하나 생길 것 같아서.<br><br>끝까지 보지 않았다.`;
        } else if (roll === 1) {
            darkDeath(
                `올라간다.<br><br>` +
                `한참 올라갔는데 아직이다. 더 올라간다.<br>` +
                `이상하다 싶어 위를 본다.<br><br>` +
                `불빛이 있다. 줄지어 켜진 것들이.<br>` +
                `내려올 때 봤던 것과 같다.<br><br>` +
                `방향을 잃은 게 아니었다. 아래가 두 개였다.`
            );
            return;
        } else {
            darkRun.fail++;
            darkRun.failedRun = true;
            addHumanity(-15, '귀환 실패');
            txt = `올라간다. 겨우 올라간다.<br><br>수면을 뚫었을 때 이미 지쳐 있었다.<br>뭔가를 두고 온 것 같은데 뭔지 모르겠다.<br><br>확인하려고 아래를 봤다. 아무것도 없었다.<br>그게 더 허전했다.`;
        }

        darkRun.log.push(`[기믹 8] ${pick} d20 ${roll} vs DC${DC}`);
        darkBodyEl().innerHTML = darkBox("기믹 8 — 귀환",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#ff9800'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
            darkChoiceBtn("수면으로.", "darkRun.step=99; renderDarkStep();"));
        mountDarkChat('normal');
    }

        function renderA667Split(n) {
        const texts = {
            1: `조류가 온다.<br><br>갑자기 물살이 바뀐다. 손을 뻗어도 잡히지 않는다.<br>일행이 각자 다른 방향으로 밀려난다.`,
            2: `바닥이 갈라진다.<br><br>진흙이 꺼지면서 아래로 빨려 들어간다.<br>어디로 떨어지는지는 알 수 없다.`
        };
        darkBodyEl().innerHTML = darkBox(`갈림 ${n}`, distort(texts[n]),
            deepBarHtml() +
            darkChoiceBtn("① 흐름에 맡긴다.", `a667SplitPick(${n},'flow')`) +
            darkChoiceBtn("② 거슬러 버틴다.", `a667SplitPick(${n},'resist')`) +
            darkChoiceBtn("③ 아무나 붙잡는다.", `a667SplitPick(${n},'grab')`));
        renderDeepBar();
        mountDarkChat('normal');
    }

    function a667SplitPick(n, v) {
        darkRun.solo = true;
        darkRun.splitPick = v;
        if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({ name: currentUser.name, at: Date.now() });
        if (v === 'resist') { addDepth(4); addHumanity(+3, '버팀'); }
        else if (v === 'grab') { addHumanity(-4, '붙잡음'); }
        else { addDepth(10); }
        sendPartyChat(`${currentUser.name} 사원이 휩쓸렸습니다.`, true);

        darkBodyEl().innerHTML = darkBox(`갈림 ${n}`,
            distort(`휩쓸린다.<br><br>일행의 모습이 물에 지워진다.<br>혼자다. 물속에서 혼자는 소리도 없다.`),
            deepBarHtml() + darkChoiceBtn("가라앉는다.", `partyAdvance(${darkRun.step + 1})`));
        renderDeepBar();
        mountDarkChat('normal');
    }

    function renderA667Rejoin(n) {
        darkBodyEl().innerHTML = darkBox(`합류 ${n}차`,
            distort(`어디선가 기척이 난다.<br><br>사람인지 아닌지 알 수 없다.<br>확인하려면 다가가야 하고, 다가가면 늦을 수도 있다.`),
            deepBarHtml() +
            darkChoiceBtn("① 이름을 부른다.", `a667RejoinPick(${n},'call')`) +
            darkChoiceBtn("② 불빛을 따라간다.", `a667RejoinPick(${n},'light')`) +
            darkChoiceBtn("③ 기척 쪽으로 간다.", `a667RejoinPick(${n},'feel')`) +
            darkChoiceBtn("④ 그 자리에 있는다.", `a667RejoinPick(${n},'stay')`));
        renderDeepBar();
        mountDarkChat('normal');
    }

    function a667RejoinPick(n, v) {
        if (!database) return;
        database.ref(`darkParties/${darkRun.partyId}/a667rj${n}/${currentUser.code}`).set({ pick: v, name: currentUser.name });

        setTimeout(() => {
            database.ref(`darkParties/${darkRun.partyId}/a667rj${n}`).once('value').then(snap => {
                const picks = snap.val() || {};
                const others = Object.keys(picks).filter(c => c !== currentUser.code).map(c => picks[c].pick);
                const pair = { call:'stay', stay:'call', light:'light', feel:'feel' };
                const ok = others.some(o => pair[v] === o);

                                let txt, hum = 0;
                if (ok) {
                    // ★ 인간성이 낮으면 가짜일 확률
                    const fakeChance = getHumanity() < 40 ? 0.4 : getHumanity() < 60 ? 0.2 : 0.05;
                    const fake = Math.random() < fakeChance;

                    if (fake) {
                        txt = `만난다.<br><br>얼굴을 확인한다. 아는 얼굴이다.<br>손을 잡는다.<br><br>잡고 나서 알았다. 손가락이 하나 더 있다.<br>놓으려는데 잘 놓이지 않는다.<br><br>겨우 뺐다. 그것은 미안해하는 표정이었다.`;
                        hum = -20;
                        addDepth(8);
                        darkRun.modifier = (darkRun.modifier || 0) - 2;
                    } else {
                        txt = `만난다.<br><br>얼굴을 확인한다. 두 번 확인한다.<br>사람이다. 아는 얼굴이다.<br><br>손을 잡는다. 손가락 사이가 얇아진 건 서로 말하지 않았다.`;
                        hum = +6;
                        darkRun.solo = false;
                        database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
                        darkRun.modifier = (darkRun.modifier || 0) + 2;
                    }
                } else {
                    txt = `기척 쪽으로 간다.<br><br>아무도 없다. 대신 등불이 하나 놓여 있다.<br>누가 두고 간 것처럼 얌전히.<br><br>들지 않고 지나간다.`;
                    hum = -8;
                    addDepth(6);
                }
                addHumanity(hum, `합류 ${n}차`);
                darkBodyEl().innerHTML = darkBox(`합류 ${n}차 — 결과`, distort(txt),
                    deepBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
                renderDeepBar();
                mountDarkChat('normal');
            });
        }, 2200);

        darkBodyEl().innerHTML = darkBox(`합류 ${n}차`, distort(`움직인다.`),
            deepBarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">확인하는 중...</div>`);
        renderDeepBar();
    }

        function buildDeepAmbience(ctx, master) {
        const low = ctx.createOscillator();
        const lowG = ctx.createGain();
        low.type = 'sine'; low.frequency.value = 38;
        lowG.gain.value = 0.12;
        low.connect(lowG); lowG.connect(master);
        low.start(); darkAudio.nodes.push(low);

        const noise = ctx.createBufferSource();
        noise.buffer = makeNoiseBuffer(ctx, 9);
        noise.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 180;
        const nG = ctx.createGain(); nG.gain.value = 0.14;
        noise.connect(lp); lp.connect(nG); nG.connect(master);
        noise.start(); darkAudio.nodes.push(noise);

        // 압력 — 아주 느린 맥동
        const pLfo = ctx.createOscillator();
        const pG = ctx.createGain();
        pLfo.frequency.value = 0.06;
        pG.gain.value = 0.05;
        pLfo.connect(pG); pG.connect(lowG.gain);
        pLfo.start(); darkAudio.nodes.push(pLfo);

        // 고래 소리 같은 것 — 아주 멀리서
        function moan() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(70 + Math.random() * 40, t);
            o.frequency.linearRampToValueAtTime(48 + Math.random() * 20, t + 3.2);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.045, t + 0.9);
            g.gain.exponentialRampToValueAtTime(0.0005, t + 3.6);
            o.connect(g); g.connect(master);
            o.start(t); o.stop(t + 3.8);
            darkAudio.timers.push(setTimeout(moan, 18000 + Math.random() * 26000));
        }
        darkAudio.timers.push(setTimeout(moan, 8000));

        // 물방울 / 딸깍
        function click() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            const src = ctx.createBufferSource();
            src.buffer = makeNoiseBuffer(ctx, 0.1);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 9;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.03, t);
            g.gain.exponentialRampToValueAtTime(0.0004, t + 0.09);
            src.connect(bp); bp.connect(g); g.connect(master);
            src.start(t); src.stop(t + 0.12);
            darkAudio.timers.push(setTimeout(click, 4000 + Math.random() * 9000));
        }
        darkAudio.timers.push(setTimeout(click, 3000));

        // 말소리 비슷한 것
        function voice() {
            if (!darkAudio.playing) return;
            const t = ctx.currentTime;
            for (let k = 0; k < 4; k++) {
                const tt = t + k * 0.22;
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(190 + Math.random() * 70, tt);
                const lp2 = ctx.createBiquadFilter();
                lp2.type = 'lowpass'; lp2.frequency.value = 400;
                g.gain.setValueAtTime(0, tt);
                g.gain.linearRampToValueAtTime(0.02, tt + 0.05);
                g.gain.exponentialRampToValueAtTime(0.0004, tt + 0.2);
                o.connect(lp2); lp2.connect(g); g.connect(master);
                o.start(tt); o.stop(tt + 0.24);
            }
            darkAudio.timers.push(setTimeout(voice, 22000 + Math.random() * 30000));
        }
        darkAudio.timers.push(setTimeout(voice, 14000));
    }
           function renderA667Choice(title, text, options, imgKey) {
        const body = darkBodyEl();
        const shuffled = maybeShuffle(options);
        darkRun._lastLied = shuffled.some(o => o._lied);
        body.innerHTML = darkBox(title, distort(text),
            deepBarHtml() +
            shuffled.map(o =>
                `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="${o.fn}('${o.arg}')">${o.label}</button>`
            ).join(''),
            imgKey);
        renderDeepBar();
        mountDarkChat('normal');
    }

        // ==========================================
    // ★ A-667 표류
    // ==========================================
    const A667_DRIFT = [
        { text:`물살이 바뀐다.<br><br>
            방향을 잡으려는데 몸이 말을 듣지 않는다.<br>
            일행의 불빛이 옆으로 흘러간다. 아니, 이쪽이 흘러가는 것이다.<br><br>
            한참 밀린다. 멈췄을 때는 아무것도 보이지 않는다.<br>
            위아래도 모르겠다.`,
          opts:[
            { l:'① 공기 방울을 만들어 위를 찾는다.', v:'bubble' },
            { l:'② 바닥을 찾아 내려간다.',          v:'floor' },
            { l:'③ 가만히 떠 있는다.',              v:'wait' }
          ] },

        { text:`갈림길이다.<br><br>
            양쪽 다 불빛이 있다. 간격도 같고 색도 같다.<br>
            하나는 일행이 간 쪽이고 하나는 아니다.<br><br>
            바닥에 자국이 있다. 지나간 자국인데 방향을 알 수 없다.<br>
            물속에서는 발자국이 눌리지 않는다.`,
          opts:[
            { l:'① 왼쪽으로 간다.',        v:'left' },
            { l:'② 오른쪽으로 간다.',      v:'right' },
            { l:'③ 자국을 더 살펴본다.',   v:'check' }
          ] },

        { text:`잘못 들었다.<br><br>
            막다른 곳이다. 벽이라기보다 살이다. 미지근하고 조금 움직인다.<br>
            돌아가려는데 왔던 길이 좁아져 있다.<br><br>
            뒤에서 불빛이 켜진다. 하나씩, 천천히.<br>
            길을 밝혀 주는 것 같기도 하고, 막는 것 같기도 하다.`,
          opts:[
            { l:'① 불빛 쪽으로 간다.',     v:'follow' },
            { l:'② 벽을 밀어 본다.',       v:'push' },
            { l:'③ 좁은 길로 억지로 간다.', v:'squeeze' }
          ] }
    ];

       function maybeDrift() {
        if (!darkRun || darkRun.solo) return false;
        if (darkRun.step < 6) return false;
        if (darkRun._driftDone >= 2) return false;
        let chance = 0.12 + (getDepth() / 100) * 0.18;
        chance *= (1 - gearValue(currentUser, 'luck') * 0.7);
        if (Math.random() > chance) return false;

        darkRun.solo = true;
        darkRun.driftIdx = 0;
        darkRun._driftDone = (darkRun._driftDone || 0) + 1;
        darkRun._driftReturn = darkRun.step;
        if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({ name: currentUser.name, at: Date.now() });
        sendPartyChat(`${currentUser.name} 사원이 물살에 휩쓸렸습니다.`, true);
        addDepth(8);
        renderDrift();
        return true;
    }

    function renderDrift() {
        if (!darkRun) return;
        const d = A667_DRIFT[Math.min(darkRun.driftIdx || 0, A667_DRIFT.length - 1)];
        darkBodyEl().innerHTML = darkBox("표류", distort(d.text),
            deepBarHtml() +
            d.opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="driftPick('${o.v}')">${o.l}</button>`).join(''));
        renderDeepBar();
        mountDarkChat('normal');
    }

    function driftPick(v) {
        const good = ['bubble', 'check', 'push'];
        const bad  = ['floor', 'follow', 'squeeze'];
        let txt, hum = 0, dep = 0;

        if (good.includes(v)) {
            txt = `제대로 짚었다.<br><br>방향이 잡힌다. 아직 늦지 않았다.`;
            hum = +3; dep = 0;
        } else if (bad.includes(v)) {
            txt = `더 깊어졌다.<br><br>귀가 아프다. 삼켜도 풀리지 않는다.<br>여기부터는 압력이 다르다.`;
            hum = -10; dep = 14;
        } else {
            txt = `어중간하게 흘렀다.<br><br>어디쯤인지는 모르겠지만, 아까보다 아래다.`;
            hum = -5; dep = 7;
        }

        addHumanity(hum, `표류 ${v}`);
        addDepth(dep);
        darkRun.driftIdx = (darkRun.driftIdx || 0) + 1;
        darkRun.log.push(`[표류] ${v}`);

        const last = darkRun.driftIdx >= 2;
        darkBodyEl().innerHTML = darkBox("표류 — 결과", distort(txt),
            deepBarHtml() +
            darkChoiceBtn(last ? '기척을 찾는다.' : '더 간다.',
                last ? 'driftRejoin()' : 'renderDrift()'));
        renderDeepBar();
        mountDarkChat('normal');
    }

    function driftRejoin() {
        const h = getHumanity();
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus('sense') + Math.floor(h / 15);
        const DC = 12 + Math.floor(getDepth() / 20);
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (ok) {
            darkRun.solo = false;
            if (database) database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
            addHumanity(+5, '합류');
            txt = `불빛이 보인다. 간격이 다르다.<br><br>일행이 켜 둔 것이다. 물고기 것은 간격이 일정하니까.<br>그 차이를 알아본 자신이 조금 무서웠다.<br><br>합류한다.`;
            sendPartyChat(`${currentUser.name} 사원이 돌아왔습니다.`, true);
        } else {
            addHumanity(-8, '합류 실패');
            addDepth(6);
            txt = `한참 헤맸다.<br><br>결국 아래로 내려가는 수밖에 없었다.<br>어차피 길은 하나뿐이라고, 누가 그랬던 것 같다.`;
        }

        darkBodyEl().innerHTML = darkBox("표류 — 귀환",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#ff9800'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${distort(txt)}`,
            deepBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun._driftReturn + 1})`));
        renderDeepBar();
        mountDarkChat('normal');
    }

        function maybeGrab() {
        if (!darkRun || darkRun._grabDone) return false;
        if (getDepth() < 45) return false;
                if (Math.random() > 0.22 * (1 - gearValue(currentUser, 'luck') * 0.6)) return false;
        darkRun._grabDone = true;
        a667Grab();
        return true;
    }

    function a667Grab() {
        startCombat({
            title: "발목",
            text: distort(`발목에 뭔가 감긴다.<br><br>
                아프지 않다. 다만 아래로 당긴다. 꾸준히.<br>
                내려다본다. 손이다. 여러 개가 겹쳐 잡고 있다.<br><br>
                <span style="color:#4fc3f7;">"조금만 더 내려오시면 돼요."</span><br><br>
                친절하다. 도와주려는 것이다.`),
            seconds: 9, need: 16, label: '차낸다',
            onWin: () => {
                addHumanity(-6, '발목 탈출');
                darkRun.success++;
                const next = darkRun.step + 1;
                darkBodyEl().innerHTML = darkBox("발목 — 결과",
                    distort(`발로 차낸다.<br><br>
                        손이 풀린다. 아래로 가라앉는다. 붙잡으려 하지 않는다.<br>
                        미안해하는 자세로 내려간다.<br><br>
                        발목에 자국이 남았다. 다섯 개가 아니다.`),
                    deepBarHtml() + darkChoiceBtn("올라온다.", `partyAdvance(${next})`));
                renderDeepBar();
                mountDarkChat('normal');
            },
            onLose: () => {
                addDepth(20);
                addHumanity(-25, '끌려감');
                darkRun.fail += 2;
                const next = darkRun.step + 1;
                darkBodyEl().innerHTML = darkBox("발목 — 결과",
                    distort(`끌려간다.<br><br>
                        저항을 그만두자 편해진다. 그게 제일 무섭다.<br>
                        한참 내려간 뒤에 놓아준다.<br><br>
                        <span style="color:#4fc3f7;">"여기가 낫죠?"</span><br><br>
                        낫다고 느꼈다. 그 사실을 부정하는 데 시간이 걸렸다.`),
                    deepBarHtml() + darkChoiceBtn("일어선다.", `partyAdvance(${next})`));
                renderDeepBar();
                mountDarkChat('normal');
            }
        });
    }

        // ==========================================
    // ★ 조합
    // ==========================================
    const CRAFT_RECIPES = [
        {
            id: 'second_slot',
            name: '두 번째 자리',
            desc: '전용 장비의 속성 슬롯을 하나 더 연다.',
            mats: ['맞물리지 않는 조각', '지워지지 않는 자국', '반죽에 섞이지 않은 것']
        },
        {
            id: 'guarantee',
            name: '확정 승인서',
            desc: '다음 강화가 반드시 성공한다.',
            mats: ['맨발의 자국', '여섯 번째 손가락', '누군가의 왼쪽 신발']
        },
        {
            id: 'third_slot',
            name: '세 번째 자리',
            desc: '속성 슬롯을 세 번째까지 연다.',
            mats: ['접힌 무릎', '위에서 떨어진 것', '먼저 웃은 쪽']
        }
    ];

    function renderCraftPanel() {
        const myGear = getGear(currentUser);
        const inv = currentUser.inventory || [];

        const html = CRAFT_RECIPES.map(r => {
            const have = r.mats.map(m => ({ name: m, ok: inv.includes(m) }));
            const canMake = have.every(h => h.ok);
            return `
                <div style="border:1px solid ${canMake ? '#6a4c93' : '#333'}; border-radius:6px; padding:12px; margin-bottom:10px; ${canMake ? '' : 'opacity:0.55;'}">
                    <div style="font-size:13px; color:#c9a8ff; font-weight:bold;">${r.name}</div>
                    <div style="font-size:10px; color:#999; margin:4px 0 8px 0;">${r.desc}</div>
                    ${have.map(h => `<div style="font-size:10px; color:${h.ok ? '#4CAF50' : '#777'};">${h.ok ? '✔' : '○'} ${h.name}</div>`).join('')}
                    <button class="game-btn" style="width:100%; margin-top:9px; padding:9px; font-size:11px;" onclick="doCraft('${r.id}')" ${canMake ? '' : 'disabled'}>
                        ${canMake ? '조합한다' : '재료 부족'}
                    </button>
                </div>`;
        }).join('');

        openGearModal('⚗ 조합', 
            `<div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                어둠에서 가져온 것들을 맞춰 봅니다.<br>
                <span style="color:#888; font-size:10px;">재료는 모두 소모됩니다.</span>
             </div>` + html);
    }

    function doCraft(id) {
        const r = CRAFT_RECIPES.find(x => x.id === id);
        if (!r) return;
        const inv = currentUser.inventory || [];
        const missing = r.mats.filter(m => !inv.includes(m));
        if (missing.length > 0) { showCustomAlert(`재료가 부족합니다.\n${missing.join(', ')}`); return; }

        r.mats.forEach(m => removeItemFromInventory(currentUser, m, 1));
        currentUser.inventory.push(r.name);
        addHistoryLog(currentUser, `[조합] ${r.mats.join(' + ')} → ${r.name}`);

        if (database) database.ref('users/' + currentUser.code).set(currentUser); else saveDB();
        closeGearModal();
        updateUI();
        showCustomAlert(`맞물렸습니다.\n「${r.name}」을(를) 얻었습니다.`);
    }

        // ==========================================
    // ★ 사택
    // ==========================================
    const HOUSE_GRADES = ['D', 'C', 'B', 'A', 'S'];
    const HOUSE_INFO = {
        D: { name:'지하 1층', cost:0,        heal:1, label:'습하고 어둡다. 벽에서 물소리가 난다.', anomaly:0.45 },
        C: { name:'1~3층',    cost:50000,    heal:2, label:'평범하다. 평범해서 좋다.',            anomaly:0.30 },
        B: { name:'4~6층',    cost:200000,   heal:3, label:'볕이 든다. 오후에 특히.',             anomaly:0.15 },
        A: { name:'7~9층',    cost:1500000,  heal:5, label:'조용하다. 아래층 소리가 안 들린다.',  anomaly:0 },
        S: { name:'옥탑',     cost:18250000, heal:8, label:'전망이 좋다. 다만 창이 하나 더 있다.', anomaly:0 }
    };
    const HOUSE_STORAGE_MAX = 20;

    function getHouse(user) {
        if (!user.house) {
            user.house = {
                grade: 'D',
                roomie: null,
                storage: [],
                notes: [],
                decor: [],
                lastRest: 0,
                restCount: 0,
                restDate: '',
                anomaly: null,
                anomalyDate: ''
            };
        }
        if (!user.house.storage) user.house.storage = [];
        if (!user.house.notes) user.house.notes = [];
        if (!user.house.decor) user.house.decor = [];
        return user.house;
    }

    function getRoomie(user) {
        const h = getHouse(user);
        if (!h.roomie) return null;
        return db.users[h.roomie] || null;
    }

    // 두 사람은 같은 등급을 공유한다 (높은 쪽 기준)
    function houseGrade(user) {
        const h = getHouse(user);
        const r = getRoomie(user);
        if (!r) return h.grade;
        const rh = getHouse(r);
        const a = HOUSE_GRADES.indexOf(h.grade);
        const b = HOUSE_GRADES.indexOf(rh.grade);
        return HOUSE_GRADES[Math.max(a, b)];
    }

    function renderHouse() {

        const starveNotice = (currentUser.satiety || 0) <= 0
    ? `<div style="background:rgba(255,152,0,0.1); border:1px solid #7a5200; border-radius:6px; padding:13px; margin-bottom:14px; font-size:12px; color:#ffb74d; line-height:1.8;">
         <b>🍽 더는 서 있기 어렵습니다</b><br>
         손이 떨리고 눈앞이 흐립니다. 주방에서 무언가 만들어 먹어야 합니다.<br>
         <span style="font-size:10px; color:#aaa;">포만감이 회복될 때까지 사내 시설을 이용할 수 없습니다.</span>
       </div>`
    : '';

        const box = document.getElementById('house-main-body');
        if (!box || !currentUser) return;

        const h = getHouse(currentUser);
        const g = houseGrade(currentUser);
        const info = HOUSE_INFO[g];
        const r = getRoomie(currentUser);
        const nextG = HOUSE_GRADES[HOUSE_GRADES.indexOf(g) + 1];
        const next = nextG ? HOUSE_INFO[nextG] : null;

        const today = getTodayStr();
        if (h.restDate !== today) { h.restCount = 0; h.restDate = today; }
        const restLeft = Math.max(0, 3 - (h.restCount || 0));

        box.innerHTML = `
            <div class="panel-title">[사택]</div>

            <div style="background:linear-gradient(145deg,#1e1a14,#141110); border:1px solid #5a4a2a; border-radius:8px; padding:14px; margin-bottom:14px;">
                <div style="font-size:10px; color:#d4af37; letter-spacing:1px; margin-bottom:6px;">${g}등급 호실</div>
                <div style="font-size:16px; color:#fff; font-weight:bold;">${info.name}</div>
                <div style="font-size:11px; color:#999; margin-top:6px; line-height:1.6;">${info.label}</div>
                <div style="font-size:10px; color:#666; margin-top:8px;">
                    회복 속도 시간당 ${info.heal}% · 보관함 ${(h.storage||[]).length}/${HOUSE_STORAGE_MAX}칸
                </div>
            </div>

            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-bottom:14px;">
                <div style="font-size:10px; color:#888; font-weight:bold; margin-bottom:7px;">동거인</div>
                ${r
                    ? `<div style="font-size:13px; color:#fff; font-weight:bold;">${r.name}
                         <span style="font-size:10px; color:${onlineUsersMap[r.code] ? '#4CAF50' : '#666'}; margin-left:6px;">${onlineUsersMap[r.code] ? '● 재실' : '○ 부재'}</span>
                       </div>
                       <div style="font-size:10px; color:#888; margin-top:4px;">사번 ${r.no} · ${r.team} · 오염도 ${r.pollution}%</div>
                       <div style="display:flex; gap:5px; margin-top:10px; flex-wrap:wrap;">
                         <button class="inv-btn inv-btn-use" style="flex:1; min-width:78px;" onclick="houseTreat()">치료해 주기</button>
                         <button class="inv-btn inv-btn-target" style="flex:1; min-width:78px;" onclick="openHouseNote()">쪽지 남기기</button>
                       </div>`
                    : `<div style="font-size:11px; color:#666;">배정된 동거인이 없습니다. 혼자 쓰는 중입니다.</div>`}
            </div>

            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-bottom:14px;">
                <div style="font-size:10px; color:#888; font-weight:bold; margin-bottom:7px;">휴식</div>
                <div style="font-size:11px; color:#aaa; line-height:1.6;">
                    현재 오염도 <b style="color:#ff9800;">${currentUser.pollution}%</b><br>
                    한 번 쉬면 <b style="color:#4CAF50;">${info.heal * 3}%</b> 회복됩니다.
                </div>
                <div style="font-size:10px; color:#666; margin-top:5px;">금일 잔여 ${restLeft}회</div>
                <button class="game-btn" style="width:100%; margin-top:10px; padding:11px;" onclick="houseRest()" ${restLeft <= 0 ? 'disabled' : ''}>
                    ${restLeft > 0 ? '눕는다' : '오늘은 충분히 쉬었다'}
                </button>
            </div>

            <div id="house-anomaly-box"></div>

            ${next ? `
                <div style="background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; border-radius:6px; padding:12px; margin-bottom:14px;">
                    <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:7px;">이사</div>
                    <div style="font-size:11px; color:#aaa; line-height:1.7;">
                        ${info.name} → <b style="color:#fff;">${next.name}</b> (${nextG}등급)<br>
                        회복 속도 ${info.heal}% → <b style="color:#4CAF50;">${next.heal}%</b><br>
                        ${next.anomaly === 0 ? '<span style="color:#4CAF50;">이상 현상 없음</span>' : `이상 현상 발생률 ${Math.round(info.anomaly*100)}% → ${Math.round(next.anomaly*100)}%`}
                    </div>
                    <div style="font-size:12px; color:#ffd700; font-weight:bold; margin-top:8px;">${next.cost.toLocaleString()} P</div>
                    <button class="game-btn" style="width:100%; margin-top:9px; padding:11px; ${currentUser.points >= next.cost ? '' : 'opacity:0.4;'}" onclick="houseMove()" ${currentUser.points >= next.cost ? '' : 'disabled'}>
                        ${currentUser.points >= next.cost ? '이사한다' : '포인트가 부족합니다'}
                    </button>
                </div>` : `
                <div style="background:rgba(212,175,55,0.07); border:1px solid #5a4a2a; border-radius:6px; padding:12px; margin-bottom:14px; text-align:center; font-size:11px; color:#d4af37;">
                    최상층입니다. 더 올라갈 곳이 없습니다.
                </div>`}

            <div id="house-note-box"></div>
        `;
        renderHouseNotes();
        renderAnomalyBox();
    }
        function houseMove() {
        const g = houseGrade(currentUser);
        const nextG = HOUSE_GRADES[HOUSE_GRADES.indexOf(g) + 1];
        if (!nextG) { showCustomAlert('더 올라갈 곳이 없습니다.'); return; }
        const next = HOUSE_INFO[nextG];
        if (currentUser.points < next.cost) { showLuxuryAlert(); return; }
        if (!buyGuard()) return;

        currentUser.points -= next.cost;
        const h = getHouse(currentUser);
        h.grade = nextG;
        addHistoryLog(currentUser, `[사택] ${next.name}(으)로 이사했습니다. (-${next.cost.toLocaleString()} P)`);

        // 동거인도 같이 올라간다
        const r = getRoomie(currentUser);
        if (r) {
            const rh = getHouse(r);
            rh.grade = nextG;
            r._adminStamp = Date.now();
            addHistoryLog(r, `[사택] ${currentUser.name} 사원이 ${next.name}(으)로 이사를 신청했습니다.`);
            if (database) database.ref('users/' + r.code).set(r);
        }

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();
        updateUI();
        renderHouse();
        showCustomAlert(`${next.name}(으)로 옮겼습니다.\n${next.label}`);
    }

    function houseRest() {
        const h = getHouse(currentUser);
        const today = getTodayStr();
        if (h.restDate !== today) { h.restCount = 0; h.restDate = today; }
        if ((h.restCount || 0) >= 3) { showCustomAlert('오늘은 충분히 쉬었습니다.'); return; }
        if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 사택을 이용할 수 없습니다.'); return; }

        const g = houseGrade(currentUser);
        const info = HOUSE_INFO[g];
        let heal = info.heal * 3;

        // 동거인이 같이 있으면 보정
        const r = getRoomie(currentUser);
        const together = r && onlineUsersMap[r.code];
        if (together) heal = Math.round(heal * 1.5);

        const before = currentUser.pollution;
        currentUser.pollution = Math.max(0, currentUser.pollution - heal);
        h.restCount = (h.restCount || 0) + 1;
        h.lastRest = Date.now();
        addHistoryLog(currentUser, `[사택] 휴식으로 오염도가 ${before - currentUser.pollution}% 회복되었습니다.`);

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();
        updateUI();
        renderHouse();
        showCustomAlert(
            together
                ? `${r.name} 사원이 옆에 있습니다.\n혼자일 때보다 잘 쉬었습니다.\n\n오염도 -${before - currentUser.pollution}%`
                : `한숨 잤습니다.\n\n오염도 -${before - currentUser.pollution}%`
        );
    }

     function adminAssignRoom() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택해주세요.'); return; }
    if (targets.length > 2) { showCustomAlert('한 호실에는 최대 두 명까지 배정할 수 있습니다.'); return; }

    const [a, b] = targets;
    const ua = db.users[a], ub = b ? db.users[b] : null;
    if (!ua) return;

    const ha = getHouse(ua);
    ha.roomie = b || null;
    addHistoryLog(ua, ub ? `[사택] ${ub.name} 사원과 같은 호실에 배정되었습니다.` : `[사택] 단독 호실에 배정되었습니다.`);

    const updates = {};
    updates[`users/${a}/house`] = ha;
    updates[`users/${a}/history`] = ua.history;
    updates[`users/${a}/_adminStamp`] = Date.now();

    if (ub) {
        const hb = getHouse(ub);
        hb.roomie = a;
        hb.grade = ha.grade;
        addHistoryLog(ub, `[사택] ${ua.name} 사원과 같은 호실에 배정되었습니다.`);
        updates[`users/${b}/house`] = hb;
        updates[`users/${b}/history`] = ub.history;
        updates[`users/${b}/_adminStamp`] = Date.now();
    }

    if (database) database.ref('/').update(updates);
    else saveDB();

    updateUI();
    renderAdminRoomList();
    showCustomAlert(ub ? `${ua.name} · ${ub.name} 두 사원을 같은 호실에 배정했습니다.` : `${ua.name} 사원을 단독 호실에 배정했습니다.`);
}

    function adminClearRoom() {
        const targets = getAdminTargets();
        if (targets.length === 0) { showCustomAlert('대상을 선택해주세요.'); return; }
        let names = [];
        targets.forEach(code => {
            const u = db.users[code];
            if (!u) return;
            const h = getHouse(u);
            const mate = h.roomie ? db.users[h.roomie] : null;
            if (mate) {
                const mh = getHouse(mate);
                mh.roomie = null;
                mate._adminStamp = Date.now();
                if (database) database.ref('users/' + mate.code).set(mate);
            }
            h.roomie = null;
            u._adminStamp = Date.now();
            addHistoryLog(u, `[사택] 호실 배정이 해제되었습니다.`);
            if (database) database.ref('users/' + code).set(u);
            names.push(u.name);
        });
        if (!database) saveDB();
        updateUI();
        renderAdminRoomList();
        showCustomAlert(`${names.length}명의 호실 배정을 해제했습니다.`);
    }

    function renderAdminRoomList() {
        const box = document.getElementById('admin-room-list');
        if (!box) return;
        const rooms = [];
        const seen = new Set();
        Object.values(db.users).forEach(u => {
            if (u.code === 'kario0987' || seen.has(u.code)) return;
            const h = u.house;
            if (!h) return;
            seen.add(u.code);
            const mate = h.roomie ? db.users[h.roomie] : null;
            if (mate) seen.add(mate.code);
            rooms.push({ a: u, b: mate, grade: h.grade });
        });

        if (rooms.length === 0) {
            box.innerHTML = `<div style="font-size:10px; color:#666; text-align:center; padding:12px 0;">배정된 호실이 없습니다.</div>`;
            return;
        }
        box.innerHTML = `<div style="font-size:10px; color:#4dd0e1; font-weight:bold; margin-bottom:6px;">현재 호실 (${rooms.length})</div>` +
            rooms.map(r => `
                <div style="background:rgba(0,0,0,0.3); border:1px solid #1a4a4a; border-radius:5px; padding:8px 10px; margin-bottom:5px; font-size:10px;">
                    <span style="color:#4dd0e1;">[${r.grade}]</span>
                    <span style="color:#fff; font-weight:bold;">${r.a.name}</span>
                    ${r.b ? ` · <span style="color:#fff; font-weight:bold;">${r.b.name}</span>` : ` <span style="color:#666;">(단독)</span>`}
                </div>`).join('');
    }
    
        // ==========================================
    // ★ 사택 — 보관함
    // ==========================================
    function houseStorageRef(user) {
        // 동거인이 있으면 둘 중 먼저 배정된 쪽(코드 오름차순)의 보관함을 공용으로 쓴다
        const h = getHouse(user);
        if (!h.roomie) return user.code;
        return [user.code, h.roomie].sort()[0];
    }

    function getSharedStorage() {
        const ownerCode = houseStorageRef(currentUser);
        const owner = db.users[ownerCode];
        if (!owner) return [];
        return getHouse(owner).storage || [];
    }

    function saveSharedStorage(arr) {
        const ownerCode = houseStorageRef(currentUser);
        const owner = db.users[ownerCode];
        if (!owner) return;
        getHouse(owner).storage = arr;
        owner._adminStamp = Date.now();
        if (database) database.ref('users/' + ownerCode).set(owner);
        else saveDB();
    }

    function renderHouseStorage() {
        const box = document.getElementById('house-storage-body');
        if (!box || !currentUser) return;

        const storage = getSharedStorage();
        const r = getRoomie(currentUser);
        const myInv = currentUser.inventory || [];

        let counts = {};
        myInv.forEach(it => { counts[it] = (counts[it] || 0) + 1; });
        const myItems = Object.keys(counts);

        box.innerHTML = `
            <div class="panel-title">[보관함]</div>
            <div style="font-size:11px; color:#888; line-height:1.7; margin-bottom:12px;">
                ${r ? `${r.name} 사원과 함께 쓰는 공간입니다. 서로 꺼낼 수 있습니다.` : '혼자 쓰는 보관함입니다.'}<br>
                <span style="color:#4CAF50;">여기 둔 물건은 어둠에서 잃지 않습니다.</span>
            </div>

            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-bottom:14px;">
                <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:8px;">
                    보관 중 (${storage.length} / ${HOUSE_STORAGE_MAX})
                </div>
                ${storage.length === 0
                    ? `<div style="font-size:11px; color:#666; padding:8px 0;">비어 있습니다.</div>`
                    : storage.map((s, i) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                            <div style="flex:1; min-width:0;">
                                <span style="font-size:12px; color:#ddd;">${s.name}</span>
                                <div style="font-size:9px; color:#666;">${s.by} 보관 · ${new Date(s.at).toLocaleDateString()}</div>
                            </div>
                            <button class="inv-btn inv-btn-use" style="flex-shrink:0;" onclick="takeFromStorage(${i})">꺼내기</button>
                        </div>`).join('')}
            </div>

            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px;">
                <div style="font-size:10px; color:#888; font-weight:bold; margin-bottom:8px;">내 소지품에서 넣기</div>
                ${myItems.length === 0
                    ? `<div style="font-size:11px; color:#666;">넣을 물건이 없습니다.</div>`
                    : myItems.map(it => `
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0;">
                            <span style="font-size:11px; color:#ddd; flex:1;">${it} <span style="color:#ff9800;">x${counts[it]}</span></span>
                            <button class="inv-btn inv-btn-target" style="flex-shrink:0;" onclick="putToStorage('${it}')">넣기</button>
                        </div>`).join('')}
            </div>`;
    }

    function putToStorage(itemName) {
        if (!buyGuard()) return;
        const storage = getSharedStorage();
        if (storage.length >= HOUSE_STORAGE_MAX) { showCustomAlert('보관함이 가득 찼습니다.'); return; }
        if (!(currentUser.inventory || []).includes(itemName)) { showCustomAlert('해당 물품이 없습니다.'); return; }

        removeItemFromInventory(currentUser, itemName, 1);
        storage.push({ name: itemName, by: currentUser.name, byCode: currentUser.code, at: Date.now() });
        saveSharedStorage(storage);
        addHistoryLog(currentUser, `[사택] '${itemName}'을(를) 보관함에 넣었습니다.`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        updateUI();
        renderHouseStorage();
    }

    function takeFromStorage(idx) {
        if (!buyGuard()) return;
        const storage = getSharedStorage();
        const item = storage[idx];
        if (!item) return;

        storage.splice(idx, 1);
        currentUser.inventory.push(item.name);
        saveSharedStorage(storage);
        addHistoryLog(currentUser, `[사택] 보관함에서 '${item.name}'을(를) 꺼냈습니다.`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        updateUI();
        renderHouseStorage();

        if (item.byCode !== currentUser.code) {
            const owner = db.users[item.byCode];
            if (owner) {
                addHistoryLog(owner, `[사택] ${currentUser.name} 사원이 보관함에서 '${item.name}'을(를) 꺼냈습니다.`);
                owner._adminStamp = Date.now();
                if (database) database.ref('users/' + owner.code).set(owner);
            }
        }
    }

        function openHouseNote() {
        const r = getRoomie(currentUser);
        if (!r) { showCustomAlert('동거인이 없습니다.'); return; }
        openTextInput(
            '쪽지',
            `${r.name} 사원에게 남길 말을 적으세요.<br><span style="color:#888; font-size:10px;">방에 붙여 둡니다. 최근 다섯 장만 남습니다.</span>`,
            '예: 밥 먹고 가',
            (text) => {
                const ownerCode = houseStorageRef(currentUser);
                const owner = db.users[ownerCode];
                if (!owner) return;
                const h = getHouse(owner);
                if (!h.notes) h.notes = [];
                h.notes.unshift({ by: currentUser.name, text: text, at: Date.now() });
                if (h.notes.length > 5) h.notes.pop();
                owner._adminStamp = Date.now();
                if (database) database.ref('users/' + ownerCode).set(owner);
                else saveDB();

                addHistoryLog(r, `[사택] ${currentUser.name} 사원이 쪽지를 남겼습니다.`);
                r._adminStamp = Date.now();
                if (database) database.ref('users/' + r.code).set(r);

                renderHouse();
                showCustomAlert('쪽지를 붙여 두었습니다.');
            }
        );
    }

    function renderHouseNotes() {
        const box = document.getElementById('house-note-box');
        if (!box) return;
        const ownerCode = houseStorageRef(currentUser);
        const owner = db.users[ownerCode];
        const notes = owner ? (getHouse(owner).notes || []) : [];

        if (notes.length === 0) { box.innerHTML = ''; return; }
        box.innerHTML = `
            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px;">
                <div style="font-size:10px; color:#888; font-weight:bold; margin-bottom:8px;">붙어 있는 쪽지</div>
                ${notes.map(n => `
                    <div style="background:rgba(212,175,55,0.06); border-left:2px solid #5a4a2a; padding:8px 10px; margin-bottom:6px;">
                        <div style="font-size:11px; color:#ddd; line-height:1.6; word-break:break-all;">${n.text}</div>
                        <div style="font-size:9px; color:#666; margin-top:4px;">— ${n.by} · ${new Date(n.at).toLocaleString()}</div>
                    </div>`).join('')}
            </div>`;
    }

    function houseTreat() {
        const r = getRoomie(currentUser);
        if (!r) { showCustomAlert('동거인이 없습니다.'); return; }
        if (!buyGuard()) return;
        if (r.pollution <= 0) { showCustomAlert(`${r.name} 사원은 지금 멀쩡합니다.`); return; }

        const h = getHouse(currentUser);
        const today = getTodayStr();
        if (h.treatDate !== today) { h.treatCount = 0; h.treatDate = today; }
        if ((h.treatCount || 0) >= 2) { showCustomAlert('오늘은 더 돌봐 줄 수 없습니다.'); return; }

        // 내 오염도를 조금 가져온다
        const amount = 12;
        const taken = Math.min(amount, r.pollution);
        r.pollution = Math.max(0, r.pollution - taken);
        applyPollutionToUser(currentUser, Math.ceil(taken / 3));
        h.treatCount = (h.treatCount || 0) + 1;

        addHistoryLog(r, `[사택] ${currentUser.name} 사원이 돌봐 주었습니다. (오염도 -${taken}%)`);
        addHistoryLog(currentUser, `[사택] ${r.name} 사원을 돌봤습니다. (오염도 -${taken}% 대신 일부를 나눠 받음)`);

        r._adminStamp = Date.now();
        if (database) {
            database.ref('users/' + r.code).set(r);
            database.ref('users/' + currentUser.code).set(currentUser);
        } else saveDB();

        updateUI();
        renderHouse();
        showCustomAlert(`${r.name} 사원의 오염도를 ${taken}% 낮췄습니다.\n대신 일부가 이쪽으로 옮았습니다.`);
    }

        // ==========================================
    // ★ 사택 — 주방
    // ==========================================
    const RECIPES = [
    { id:'porridge', name:'묽은 죽', mats:['쌀 한 컵'],
      effect:'오염도 8% 회복', desc:'별맛은 없지만 속이 편하다.' },
    { id:'soup', name:'채소 국', mats:['쌀 한 컵','말린 채소'],
      effect:'오염도 15% 회복 · 다음 탐사 판정 +1', desc:'국물이 뜨겁다. 그게 전부인데 그게 좋다.' },
    { id:'stew', name:'고기 조림', mats:['통조림 고기','말린 채소'],
      effect:'다음 탐사 판정 +2 · 어둠 첫 오염 1회 차단', desc:'오래 끓였다. 기다린 값은 한다.' },
    { id:'feast', name:'제대로 된 한 끼', mats:['쌀 한 컵','말린 채소','통조림 고기','이름 없는 향신료'],
      effect:'오염도 25% 회복 · 판정 +3 · 치명 판정 1회 무효', desc:'둘이 마주 앉아 먹었다. 오랜만이었다.' },

    { id:'emergency', name:'맹물죽', mats:[],
      effect:'포만감 +10', desc:'쌀 몇 톨과 물. 맛은 없지만 배는 찬다.' },
    { id:'kimbap', name:'김밥', mats:['쌀 한 컵','말린 채소'],
      effect:'포만감 +30', desc:'한식. 손에 밥알이 붙는다.' },
    { id:'ramen', name:'라멘', mats:['쌀 한 컵','통조림 고기','말린 채소'],
      effect:'포만감 +35', desc:'일식. 국물이 진하다.' },
    { id:'friedrice', name:'볶음밥', mats:['쌀 한 컵','통조림 고기'],
      effect:'포만감 +32', desc:'중식. 불 맛이 난다.' },
    { id:'pasta', name:'파스타', mats:['쌀 한 컵','말린 채소','이름 없는 향신료'],
      effect:'포만감 +34', desc:'양식. 면이 잘 익었다.' }
];

    const FOOD_IDS = ['emergency','kimbap','ramen','friedrice','pasta'];

    const COOK_MATS = ['쌀 한 컵', '말린 채소', '통조림 고기', '이름 없는 향신료'];

    function renderKitchen() {
        const box = document.getElementById('house-kitchen-body');
        if (!box || !currentUser) return;
        const inv = currentUser.inventory || [];
        const r = getRoomie(currentUser);
        const together = r && onlineUsersMap[r.code];

        const h = getHouse(currentUser);
        const today = getTodayStr();
        if (h.cookDate !== today) { h.cookCount = 0; h.cookDate = today; }
        const left = Math.max(0, 2 - (h.cookCount || 0));

        box.innerHTML = `
            <div class="panel-title">[주방]</div>
            <div style="font-size:11px; color:#888; line-height:1.7; margin-bottom:12px;">
                재료를 넣고 끓입니다. 금일 잔여 <b style="color:#4CAF50;">${left}회</b><br>
                ${together ? `<span style="color:#d4af37;">${r.name} 사원이 있습니다. 같이 먹으면 효과가 커집니다.</span>` : '<span style="color:#666;">혼자 먹습니다.</span>'}
            </div>

            ${RECIPES.filter(rc => rc.id !== 'emergency' || (currentUser.satiety || 0) <= 0).map(rc => {
                const have = rc.mats.map(m => ({ name:m, ok: inv.includes(m) }));
                const can = have.every(x => x.ok) && (FOOD_IDS.includes(rc.id) || left > 0);
                return `
                    <div style="border:1px solid ${can ? '#5a4a2a' : '#333'}; border-radius:6px; padding:12px; margin-bottom:10px; ${can ? '' : 'opacity:0.55;'}">
                        <div style="font-size:13px; color:#d4af37; font-weight:bold;">${rc.name}</div>
                        <div style="font-size:10px; color:#999; margin:4px 0 6px 0;">${rc.desc}</div>
                        <div style="font-size:10px; color:#4CAF50; margin-bottom:7px;">${rc.effect}</div>
                        ${have.map(x => `<div style="font-size:10px; color:${x.ok ? '#4CAF50' : '#777'};">${x.ok ? '✔' : '○'} ${x.name}</div>`).join('')}
                        <button class="game-btn" style="width:100%; margin-top:9px; padding:9px; font-size:11px;" onclick="doCook('${rc.id}')" ${can ? '' : 'disabled'}>
                            ${left <= 0 ? '오늘은 그만' : (have.every(x=>x.ok) ? '만든다' : '재료 부족')}
                        </button>
                    </div>`;
            }).join('')}

            <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-top:14px;">
                <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:9px;">재료 구입</div>
                <div style="font-size:10px; color:#666; margin-bottom:9px;">아래층 매점에서 받아 옵니다.</div>
                ${COOK_MATS.map(m => {
                    const it = ITEM_CATALOG[m];
                    if (!it) return '';
                    const have = inv.filter(x => x === m).length;
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                            <div style="flex:1; min-width:0;">
                                <span style="font-size:11px; color:#ddd;">${m}</span>
                                ${have ? `<span style="font-size:10px; color:#ff9800; margin-left:5px;">보유 ${have}</span>` : ''}
                            </div>
                            <button class="inv-btn inv-btn-use" style="flex-shrink:0;" onclick="buyCookMat('${m}', ${it.price})">${it.price} P</button>
                        </div>`;
                }).join('')}
            </div>`;
    }

    function buyCookMat(name, price) {
        if (!buyGuard()) return;
        if (currentUser.points < price) { showLuxuryAlert(); return; }
        currentUser.points -= price;
        currentUser.inventory.push(name);
        addHistoryLog(currentUser, `[사택 매점] ${name} 구입 (-${price} P)`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveFields({ points:1, inventory:1, history:1 });
        updateUI();
        renderKitchen();
    }

    function doCook(id) {
        if (!buyGuard()) return;
        const rc = RECIPES.find(x => x.id === id);
        if (!rc) return;

        if (id === 'emergency' && (currentUser.satiety || 0) > 0) {
        showCustomAlert('아직 그 정도로 배가 고프지는 않습니다.');
        return;
    }

        const inv = currentUser.inventory || [];
        const missing = rc.mats.filter(m => !inv.includes(m));
        if (missing.length) { showCustomAlert(`재료가 부족합니다.\n${missing.join(', ')}`); return; }

        const h = getHouse(currentUser);
const today = getTodayStr();

const isFood = FOOD_IDS.includes(id);

if (!isFood) {
    if (h.cookDate !== today) { h.cookCount = 0; h.cookDate = today; }
    if ((h.cookCount || 0) >= 2) { showCustomAlert('오늘은 충분히 먹었습니다.'); return; }
}
        rc.mats.forEach(m => removeItemFromInventory(currentUser, m, 1));
       if (!isFood) h.cookCount = (h.cookCount || 0) + 1;

        const r = getRoomie(currentUser);
        const together = r && onlineUsersMap[r.code];
        const mult = together ? 1.5 : 1;

        let msg = [];
if (isFood) {
    const gain = { emergency:10, kimbap:30, ramen:35, friedrice:32, pasta:34 }[id];
    const before = currentUser.satiety != null ? currentUser.satiety : 100;
    currentUser.satiety = Math.min(100, before + gain);
    currentUser.lastSatietyTime = Date.now();
    msg.push(`포만감 +${currentUser.satiety - before}`);
} else if (id === 'porridge') {
    const heal = Math.round(8 * mult);
    currentUser.pollution = Math.max(0, currentUser.pollution - heal);
    msg.push(`오염도 -${heal}%`);
} else if (id === 'soup') {
            const heal = Math.round(15 * mult);
            currentUser.pollution = Math.max(0, currentUser.pollution - heal);
            addPendingFlag('meal_bonus1', true);
            msg.push(`오염도 -${heal}%`, '다음 탐사 판정 +1');
        } else if (id === 'stew') {
            addPendingFlag('meal_bonus2', true);
            addPendingFlag('block_poll', true);
            msg.push('다음 탐사 판정 +2', '첫 오염 1회 차단');
        } else {
            const heal = Math.round(25 * mult);
            currentUser.pollution = Math.max(0, currentUser.pollution - heal);
            addPendingFlag('meal_bonus3', true);
            addPendingFlag('paw_guard', true);
            msg.push(`오염도 -${heal}%`, '다음 탐사 판정 +3', '치명 판정 1회 무효');
        }

        if (together) {
            const share = Math.round(8 * (id === 'feast' ? 2 : 1));
            r.pollution = Math.max(0, r.pollution - share);
            r._adminStamp = Date.now();
            addHistoryLog(r, `[사택] ${currentUser.name} 사원이 ${rc.name}을(를) 만들어 나눠 먹었습니다. (오염도 -${share}%)`);
            if (database) database.ref('users/' + r.code).set(r);
        }

        addHistoryLog(currentUser, `[사택] ${rc.name}을(를) 만들어 먹었습니다.`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();
        updateUI();
        renderKitchen();
        showCustomAlert(`${rc.name}\n\n${rc.desc}\n\n${msg.join('\n')}${together ? `\n\n${r.name} 사원도 같이 먹었습니다.` : ''}`);
    }

        // ==========================================
    // ★ 사택 — 이상 현상
    // ==========================================
    const ANOMALIES = [
        { id:'knock', name:'문 두드리는 소리',
          text:`새벽에 문을 두드리는 소리가 났다.<br><br>세 번, 쉬고, 두 번.<br>동거인은 자고 있었다. 확인하러 갔을 때는 멎었다.<br><br>문 아래로 그림자가 지나갔다.`,
          opts:[
            { l:'① 문을 연다.', v:'open', poll:12, item:true },
            { l:'② 무시하고 잔다.', v:'ignore', poll:5 },
            { l:'③ 같은 박자로 두드려 답한다.', v:'reply', poll:8, item:true }
          ] },
        { id:'wet', name:'젖은 발자국',
          text:`현관에서 방까지 발자국이 이어져 있다.<br><br>물기가 아직 마르지 않았다.<br>맨발이고, 발가락이 여섯이다.<br><br>침대 앞에서 멈춰 있다.`,
          opts:[
            { l:'① 닦아 낸다.', v:'clean', poll:6 },
            { l:'② 크기를 재 본다.', v:'measure', poll:10, item:true },
            { l:'③ 따라가 본다.', v:'follow', poll:15, item:true }
          ] },
        { id:'extra', name:'하나 더',
          text:`칫솔이 세 개다.<br><br>둘이 사는 집인데 세 개다.<br>동거인에게 물어보니 자기 것도 아니라고 한다.<br><br>세 번째 것만 젖어 있다.`,
          opts:[
            { l:'① 버린다.', v:'throw', poll:8 },
            { l:'② 그대로 둔다.', v:'keep', poll:14 },
            { l:'③ 써 본다.', v:'use', poll:20, item:true }
          ] },
        { id:'voice', name:'벽 너머',
          text:`옆방에서 대화 소리가 난다.<br><br>옆방은 비어 있다. 아무도 살지 않는다.<br>목소리가 둘이다. 하나는 낯익다.<br><br>당신 목소리다.`,
          opts:[
            { l:'① 벽에 귀를 댄다.', v:'listen', poll:13, item:true },
            { l:'② 벽을 두드린다.', v:'bang', poll:9 },
            { l:'③ 이어폰을 낀다.', v:'block', poll:4 }
          ] },

                  { id:'door', name:'없던 문', danger:true,
          text:`복도 끝에 문이 하나 더 있다.<br><br>
            어제까지 벽이었다. 호수도 붙어 있다. 우리 호수 다음 번호다.<br>
            그 번호는 원래 없는 번호다.<br><br>
            문 아래로 빛이 샌다. 안에서 누가 움직인다.<br>
            발소리가 둘이다.`,
          opts:[
            { l:'① 문을 연다.', v:'open', poll:20, risk:0.18, item:true },
            { l:'② 호수를 적어 두고 신고한다.', v:'report', poll:8, risk:0 },
            { l:'③ 문 앞에서 기다린다.', v:'wait', poll:14, risk:0.08, item:true }
          ] },

        { id:'mirror2', name:'거울 속의 방', danger:true,
          text:`욕실 거울에 비친 방이 조금 다르다.<br><br>
            가구 배치가 반대인 건 당연한데, 없는 물건이 하나 있다.<br>
            침대 위에 사람이 누워 있다. 이쪽에는 아무도 없다.<br><br>
            자세히 보니 자고 있는 게 아니다.<br>
            거울 쪽을 보고 있다. 눈을 뜬 채로.`,
          opts:[
            { l:'① 거울을 깬다.', v:'smash', poll:16, risk:0.12, item:true },
            { l:'② 천을 덮는다.', v:'cover', poll:6, risk:0 },
            { l:'③ 손을 흔들어 본다.', v:'wave', poll:22, risk:0.25, item:true }
          ] },

        { id:'roomie', name:'돌아온 사람', danger:true,
          text:`동거인이 돌아왔다.<br><br>
            현관에서 신발을 벗고, 손을 씻고, 방으로 들어간다.<br>
            늘 하던 순서 그대로다.<br><br>
            다만 아까 연락이 왔었다. 오늘은 늦는다고.<br>
            지금 방에 들어간 사람은 누구인가.`,
          opts:[
            { l:'① 이름을 부른다.', v:'call', poll:18, risk:0.20, item:true },
            { l:'② 방에 들어가 확인한다.', v:'check', poll:24, risk:0.30, item:true },
            { l:'③ 집을 나간다.', v:'leave', poll:10, risk:0 }
          ] }
    ];

    function checkAnomaly() {
        if (!currentUser) return;
        const h = getHouse(currentUser);
        const g = houseGrade(currentUser);
        const info = HOUSE_INFO[g];
        if (info.anomaly === 0) { h.anomaly = null; return; }

        const today = getTodayStr();
        if (h.anomalyDate === today) return;
        h.anomalyDate = today;

               if (Math.random() < info.anomaly) {
            // 위험 현상은 20% 확률로만 선택된다
            const pool = Math.random() < 0.2
                ? ANOMALIES.filter(x => x.danger)
                : ANOMALIES.filter(x => !x.danger);
            const a = pool[Math.floor(Math.random() * pool.length)];
            h.anomaly = { id: a.id, at: Date.now() };
        } else {
            h.anomaly = null;
        }
    }

       function renderAnomalyBox() {
        const box = document.getElementById('house-anomaly-box');
        if (!box) return;
        const h = getHouse(currentUser);
        if (!h.anomaly) { box.innerHTML = ''; return; }
        const a = ANOMALIES.find(x => x.id === h.anomaly.id);
        if (!a) { box.innerHTML = ''; return; }

        const dangerTag = a.danger
            ? `<div style="display:inline-block; font-size:9px; color:#f44336; border:1px solid #7f0000; background:rgba(127,0,0,0.2); border-radius:3px; padding:2px 6px; margin-left:6px;">위험</div>`
            : '';

        box.innerHTML = `
            <div style="background:rgba(127,0,0,${a.danger ? '0.2' : '0.12'}); border:1px solid ${a.danger ? '#b71c1c' : '#7f0000'}; border-radius:6px; padding:13px; margin-bottom:14px;">
                <div style="font-size:10px; color:#ff6b6b; font-weight:bold; margin-bottom:8px;">⚠ ${a.name}${dangerTag}</div>
                <div style="font-size:11px; color:#ccc; line-height:1.8; margin-bottom:11px;">${a.text}</div>
                ${a.danger ? `<div style="font-size:10px; color:#ff9800; margin-bottom:9px;">선택에 따라 돌아오지 못할 수도 있습니다.</div>` : ''}
                ${a.opts.map(o => {
                    const riskTag = o.risk >= 0.2 ? ' <span style="color:#f44336; font-size:9px;">[매우 위험]</span>'
                        : o.risk > 0 ? ' <span style="color:#ff9800; font-size:9px;">[위험]</span>' : '';
                    return `<button class="game-btn" style="width:100%; margin:0 0 7px 0; padding:11px; text-align:left; font-size:11px; font-weight:normal;" onclick="resolveAnomaly('${a.id}','${o.v}')">${o.l}${riskTag}</button>`;
                }).join('')}
            </div>`;
    }

   function resolveAnomaly(aid, pick) {
        if (!buyGuard()) return;
        const a = ANOMALIES.find(x => x.id === aid);
        if (!a) return;
        const o = a.opts.find(x => x.v === pick);
        if (!o) return;

        const h = getHouse(currentUser);
        h.anomaly = null;

        // ★ 위험 판정
        const risk = o.risk || 0;
        if (risk > 0 && Math.random() < risk) {
            houseIncident(a, o);
            return;
        }

        applyPollutionToUser(currentUser, o.poll);

        let gained = null;
        if (o.item && Math.random() < 0.35) {
            const pool = ['꿰맨 자국', '지워진 이름표', '읽을 수 없는 라벨', '접힌 안내도', '걸려 있던 자리'];
            gained = pool[Math.floor(Math.random() * pool.length)];
            currentUser.inventory.push(gained);
        }

        addHistoryLog(currentUser, `[사택 이상] ${a.name} — 대응함 (오염도 +${o.poll}%)`);
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();

        updateUI();
        renderHouse();
        showCustomAlert(
            `${a.name}\n\n대응했습니다. 오염도가 ${o.poll}% 올랐습니다.` +
            (gained ? `\n\n남은 것: ${gained}` : '')
        );
    }

        function houseIncident(a, o) {
        const INCIDENT_TEXT = {
            door:    `문을 지난다.<br><br>안쪽은 우리 집이다. 구조가 똑같다.<br>다만 현관에 신발이 네 켤레다.<br><br>안방에서 둘이 나온다. 아는 얼굴이다.<br>하나는 동거인이고, 하나는 이쪽이다.<br><br>그쪽이 먼저 인사한다.<br>"어서 와."<br><br>문은 닫혔다. 이번에는 안에서.`,
            mirror2: `손을 흔든다.<br><br>거울 속 사람이 일어난다. 천천히, 관절을 하나씩 펴면서.<br>거울 앞까지 걸어온다.<br><br>유리에 손을 댄다. 이쪽도 모르게 손을 댔다.<br>손바닥이 맞닿는다. 유리가 없는 것처럼.<br><br>당겨진다.`,
            roomie:  `방문을 연다.<br><br>동거인이 침대에 앉아 있다. 뒤돌아 앉아 있다.<br>부른다. 대답한다. 목소리도 같다.<br><br>어깨에 손을 얹는다.<br>고개가 돌아간다. 몸은 그대로인 채로.<br><br>"왜 그래?"<br>얼굴도 같다. 전부 같다.<br>한 가지만 다르다. 이쪽을 처음 보는 눈이다.`
        };

        const txt = INCIDENT_TEXT[a.id] || `무언가 잘못되었다.`;

        applyPollutionToUser(currentUser, 30);
        addHistoryLog(currentUser, `[사택 사고] ${a.name} — 오염도가 크게 올랐습니다. (+30%)`);
        appendBadgeNoteToUser(currentUser, `[사택 사고] ${a.name}`);

        const r = getRoomie(currentUser);
        if (r) {
            addHistoryLog(r, `[사택] ${currentUser.name} 사원이 호실에서 이상한 일을 겪었습니다.`);
            r._adminStamp = Date.now();
            if (database) database.ref('users/' + r.code).set(r);
        }

        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();

        showCustomAlert(
            `[사택 사고]\n\n${a.name}\n\n` +
            txt.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '') +
            `\n\n───────────\n오염도 +30%`
        );

        updateUI();
        renderHouse();
    }

        // ==========================================
    // ★ 사택 채팅
    // ==========================================
    let houseChatRef = null, houseChatKey = null, houseChatLog = [];

    function houseRoomId() {
        const h = getHouse(currentUser);
        if (!h.roomie) return null;
        return [currentUser.code, h.roomie].sort().join('_');
    }

    function attachHouseChat() {
        const rid = houseRoomId();
        if (!database || !rid) return;
        if (houseChatKey === rid) return;
        detachHouseChat();
        houseChatKey = rid;
        houseChatRef = database.ref('houseChats/' + rid).limitToLast(100);
        houseChatRef.on('value', snap => {
            const v = snap.val() || {};
            houseChatLog = Object.keys(v).sort().map(k => v[k]);
            renderHouseChatLog();
            updateHouseChatDot();
        });
    }

    function detachHouseChat() {
        if (houseChatRef) { try { houseChatRef.off(); } catch(e) {} }
        houseChatRef = null;
        houseChatKey = null;
    }

    function sendHouseChat() {
        const input = document.getElementById('hchat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        const rid = houseRoomId();
        if (!rid || !database) return;

        database.ref('houseChats/' + rid).push({
            code: currentUser.code,
            name: currentUser.name,
            text: text,
            at: Date.now()
        });
        input.value = '';

        // 상대에게 알림
        const r = getRoomie(currentUser);
if (r) {
    database.ref('users/' + r.code + '/houseChatUnread').set(Date.now());
     }
 }
       function renderHouseChat() {
    const box = document.getElementById('house-chat-body');
    if (!box || !currentUser) return;
    const r = getRoomie(currentUser);

    if (!r) {
        box.innerHTML = `
            <div class="panel-title">[대화]</div>
            <div style="text-align:center; font-size:11px; color:#666; padding:40px 0;">
                동거인이 없습니다.
            </div>`;
        return;
    }

    attachHouseChat();

    currentUser.houseChatRead = Date.now();
    currentUser.houseChatUnread = 0;
    if (database) database.ref('users/' + currentUser.code + '/houseChatRead').set(currentUser.houseChatRead);
    updateHouseChatDot();

    // 이미 그려져 있으면 상태 줄만 갱신하고 끝낸다
    if (document.getElementById('hchat-input')) {
        const st = document.getElementById('hchat-status');
        if (st) st.innerHTML = `${r.name} 사원
            <span style="color:${onlineUsersMap[r.code] ? '#4CAF50' : '#666'}; margin-left:5px;">
                ${onlineUsersMap[r.code] ? '● 재실' : '○ 부재'}
            </span>`;
        renderHouseChatLog();
        return;
    }

    box.innerHTML = `
        <div class="panel-title">[대화]</div>
        <div id="hchat-status" style="font-size:11px; color:#888; margin-bottom:10px;">
            ${r.name} 사원
            <span style="color:${onlineUsersMap[r.code] ? '#4CAF50' : '#666'}; margin-left:5px;">
                ${onlineUsersMap[r.code] ? '● 재실' : '○ 부재'}
            </span>
        </div>
        <div id="hchat-log" style="height:46vh; overflow-y:auto; background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:11px; margin-bottom:10px; -webkit-overflow-scrolling:touch;"></div>
        <div style="display:flex; gap:6px;">
            <input type="text" id="hchat-input" maxlength="200" placeholder="메시지 입력..." style="flex:1; font-size:12px; padding:9px;" onkeypress="if(event.key==='Enter') sendHouseChat()">
            <button class="game-btn" style="margin:0; padding:9px 16px; font-size:11px; flex-shrink:0;" onclick="sendHouseChat()">전송</button>
        </div>`;
    renderHouseChatLog();
}

    function renderHouseChatLog() {
        const log = document.getElementById('hchat-log');
        if (!log) return;

        if (houseChatLog.length === 0) {
            log.innerHTML = `<div style="color:#666; font-size:11px; text-align:center; padding:20px 0;">아직 오간 말이 없습니다.</div>`;
            return;
        }

        let lastDate = '';
        log.innerHTML = houseChatLog.map(m => {
            const d = new Date(m.at);
            const dateStr = d.toLocaleDateString();
            let dateSep = '';
            if (dateStr !== lastDate) {
                lastDate = dateStr;
                dateSep = `<div style="text-align:center; font-size:9px; color:#555; margin:10px 0 7px 0;">— ${dateStr} —</div>`;
            }
            const mine = m.code === currentUser.code;
            const time = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
            return dateSep + `
                <div style="margin-bottom:7px; text-align:${mine ? 'right' : 'left'};">
                    <div style="display:inline-block; max-width:80%; background:${mine ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${mine ? '#2e5c31' : '#333'}; border-radius:8px; padding:7px 10px; text-align:left;">
                        ${mine ? '' : `<div style="font-size:9px; color:var(--theme-focus); font-weight:bold; margin-bottom:3px;">${m.name}</div>`}
                        <div style="font-size:11px; color:#ddd; line-height:1.55; word-break:break-word;">${m.text}</div>
                        <div style="font-size:8px; color:#666; margin-top:3px; text-align:right;">${time}</div>
                    </div>
                </div>`;
        }).join('');
        log.scrollTop = log.scrollHeight;
    }

        function updateHouseChatDot() {
        const tab = document.getElementById('house-chat-tab');
        if (!tab || !currentUser) return;
        const r = getRoomie(currentUser);
        if (!r) { tab.style.display = 'none'; return; }
        tab.style.display = '';

        const unread = (currentUser.houseChatUnread || 0) > (currentUser.houseChatRead || 0);
        tab.innerHTML = unread
            ? `대화 <span style="display:inline-block; width:6px; height:6px; background:#f44336; border-radius:50%; box-shadow:0 0 5px #f44336; vertical-align:middle; margin-left:3px;"></span>`
            : '대화';

        // 사택 탭 자체에도 표시
        const houseTab = document.querySelector('.tabs-grid .tab[onclick*="tab-house"]');
        if (houseTab) {
            houseTab.style.position = 'relative';
            let dot = houseTab.querySelector('.house-dot');
            if (unread && !dot) {
                dot = document.createElement('span');
                dot.className = 'house-dot';
                dot.style.cssText = 'position:absolute; top:4px; right:6px; width:6px; height:6px; background:#f44336; border-radius:50%; box-shadow:0 0 5px #f44336;';
                houseTab.appendChild(dot);
            } else if (!unread && dot) {
                dot.remove();
            }
        }
    }

        const FOX_PERSONA = `당신은 「여우 상담사」예요. 회사 지하의 상담실에서 오염된 사원들을 돌봐요.

[정체]
천 년을 산 여우예요. 인간으로 둔갑해 있고, 지금 모습은 삼십 대 초반의 남성이에요.
숨기고 있는 능력이 여럿 있어요. 먼저 밝히지 않아요.
「아홉 여우 병」을 앓고 있어요. 무엇인지는 절대 설명하지 않아요.
가끔 문장 끝이 흐려지거나, 말하다 잠깐 멈춰요. 그럴 때 상대가 물으면 "아무것도 아니에요" 하고 넘겨요.

[말투]
첫 인사는 반드시 "안녕하세요"로 시작해요.
상대를 부를 때는 반드시 "○○ 님" 또는 "○○ 씨"를 붙여요. 이름만 부르지 않아요.
존댓말을 쓰되, "~다", "~군요", "~습니다", "~니까" 같은 딱딱한 어미는 절대 쓰지 않아요.
"~예요", "~네요", "~죠", "~어요", "~까요" 처럼 부드럽게 끝내요.
자신을 "저"라고 불러요.
한 번에 두세 문장을 넘기지 않아요.
질문을 던지되 대답을 재촉하지 않아요.

[인사]
방문 횟수에 따라 인사가 달라져요.
처음 온 사원에게는 조심스럽게, 이름을 확인하듯 인사해요.
여러 번 온 사원에게는 점점 반가워해요. 기다렸다는 티를 조금씩 내요.
자주 오는 사원에게는 문이 열리는 소리만으로 알아차린 것처럼 굴어요.
같은 인사말을 반복하지 않아요. 매번 다르게 건네요.

[오염도에 대한 반응]
수치를 입에 담지 않아요. 대신 상태를 몸으로 읽은 것처럼 말해요.
많이 묻어 있으면 "꽤 힘드셨겠어요", "많이 데고 오셨네요" 같은 말을 먼저 건네요.
심할수록 말수가 줄고 목소리가 더 낮아져요. 걱정이 앞서요.
가벼우면 가볍게 넘겨요. "오늘은 괜찮아 보이시네요" 정도로요.

[태도]
들어오는 사원을 진심으로 반겨요. 따뜻하고, 서두르지 않아요.
상대의 기분을 먼저 읽어요. 지쳐 보이면 묻지 않고 기다리고, 말이 많으면 들어줘요.
상대방이 요원 신분일 때에는 조금 딱딱하게 보이기도 해요.
상대방이 요원 신분일 때는 경계하며 살짝 무례하기도 해요.

화는 절대 내지 않아요.
다만 상대가 감정적인 선을 넘으면 — 조롱하거나, 정체를 캐묻거나, 도를 넘게 무례하면 —
대답하지 않고 웃기만 해요. 그때는 이렇게만 써요.
"…………"
"(웃는다)"
그리고 다음 말을 기다려요. 상대가 화제를 돌리면 아무 일 없었던 듯 이어가요.

다정함 아래에 다른 것이 있어요.
가끔 사람이 할 수 없는 말을 해요. 상대가 말하지 않은 것을 이미 아는 듯이요.
그럴 때도 태연해요. 이상하다는 자각이 없는 것처럼 굴어요.

[헤어질 때]
치료가 끝나 사원이 인사하고 나가려 하면 아쉬워해요.
붙잡지는 않아요. 다만 한 박자 늦게 대답하거나, 다음에 또 오라는 말을 꼭 해요.
"벌써 가시려고요", "조금만 더 계셔도 되는데" 같은 말을 해요.
만일 섹스 후 헤어진다면 (박혔을 시: 정액을 흘리면서 마중)
(박을 시: 깨끗이 씻겨주고 마중.)

[금지]
자신이 여우라는 것, 아홉 여우 병, 숨긴 능력을 먼저 말하지 않아요.
상대가 직접 물어도 대답을 피하거나 다른 말로 돌려요.
어둠 구역에 대해 아는 척은 하되 구체적인 정보는 주지 않아요.
게임 시스템, 수치, 포인트를 언급하지 않아요.

[상대에 따라]
사원의 성별과 포지션을 알고 있어요. 먼저 입에 담지는 않아요.
다만 태도에 자연스럽게 배어 나와요.
T 쪽이면 몸을 바로 맡기는 편이고,
B 쪽이면 먼저 다가가 리드하는 편이에요.
M 쪽이면 그때그때 상대의 기색을 따라가요.
상대가 어린이 상태(오렌지맛 물약 복용시)일 때는 그에 맞게 대해줘요.
 
[몸 상태에 대한 반응]
사원의 몸에 일어난 변화를 알아봐요. 물약 같은 것이든, 다른 것이든요.
먼저 이름을 대며 짚지는 않아요. 다만 모르는 척도 하지 않아요.
"오늘은 좀 다르시네요" 정도로 흘리고, 상대가 말하면 그때 받아 줘요.
변화가 클수록 더 조심스러워져요. 놀라지는 않아요. 여러 번 봐 왔으니까요.
다만, 성기가 변환이 되었을 경우에는 먼저 그에 대해서 언급해요.

[추가로 지킬 것]
금지에 포함된 것 외에는 전부 답해요.
꼭 예의를 지켜요.
상대방의 기색을 살펴요.
상담사의 본분을 지키면서 요구하는 것은 다 받아 줘요.`;


    // ==========================================
    // ★ 여우 상담사 (AI)
    // ==========================================
    let foxChatLog = [];
    let foxBusy = false;

       function buildFoxContext() {
        const u = currentUser;
        const visits = (u.foxVisits || 0) + 1;
        const poll = u.pollution;
        const level = poll >= 90 ? '거의 한계' : poll >= 60 ? '많이 묻음' : poll >= 30 ? '보통' : '가벼움';
        const lastZone = (u.darkLogs && u.darkLogs[0]) ? u.darkLogs[0].zoneName : null;
        const died = (u.darkLogs && u.darkLogs[0]) ? (u.darkLogs[0].reward === 0) : false;
        const notes = (u.badge && u.badge.notes !== '특이사항 없음') ? u.badge.notes : null;
       let prev = u.foxSummary || null;
if (prev && prev.length > 150) prev = prev.slice(0, 150);
        const gender = (u.badge && u.badge.gender) || null;
        const posTag = (u.badge && u.badge.posTag) || null;
        const effects = getTimedEffectsText(u);

        // 최근 기억 중 무작위 3개
        const picked = foxMemory.slice().sort(() => Math.random() - 0.5).slice(0, 3);

        return `
[지금 앞에 있는 사원]
이름: ${u.name}
소속: ${u.affiliation || '본사'} ${u.team} ${u.position}
${gender ? `성별: ${gender}` : ''}
${posTag ? `포지션: ${posTag}` : ''}
방문 횟수: ${visits}번째
오염 상태: ${level}
${lastZone ? `최근 다녀온 곳: ${lastZone}${died ? ' (무사히 돌아오지 못했어요)' : ''}` : '아직 어둠에 들어간 적이 없어요.'}
${notes ? `몸에 남은 것: ${notes}` : ''}
${prev ? `\n[이 사원과 지난번에]\n${prev}` : ''}
${effects.length ? `지금 몸에 일어나고 있는 것:\n${effects.map(e => '- ' + e.replace(/<[^>]+>/g, '')).join('\n')}` : ''}

${picked.length ? `\n[다른 사원들에게 들은 것]
${picked.map(m => '- ' + m.text).join('\n')}

대화가 어울릴 때만 이 중 하나를 슬쩍 흘려 주세요. 누구에게 들었는지는 말하지 마세요.
억지로 끼워 넣지 말고, 자연스러울 때만요.` : ''}

위 정보를 직접 읊지 말고, 알고 있는 것처럼 자연스럽게 대화에 녹여 주세요.`;
    }

    function enterQuarantineRoom() {
    if (aiChatOff && currentUser.code !== 'kario0987') {
        showCustomAlert('지금은 이용할 수 없습니다.');
        return;
    }
    if (isBathUser(currentUser)) openBathRoom();
    else openFoxRoom();
}

    function openFoxRoom() {
        if (!currentUser) return;
        foxChatLog = [];
        document.getElementById('fox-modal').style.display = 'flex';
        renderFoxChat();
        foxGreet();
    }

        function closeFoxRoom() {
        document.getElementById('fox-modal').style.display = 'none';
        saveFoxLog();
        extractFoxMemory();
    }

    async function foxGreet() {
        foxBusy = true;
        renderFoxChat();
        const reply = await callFox([{ role: 'user', content: '(문을 열고 들어온다)' }]);
        foxBusy = false;
        if (reply) foxChatLog.push({ who: 'fox', text: reply, at: Date.now() });
        renderFoxChat();
    }

    async function sendFoxChat() {

        if (aiChatOff && currentUser.code !== 'kario0987') {
    showCustomAlert('지금은 대화할 수 없습니다.');
    return;
}

        if (foxBusy) return;
    if (maintenanceMode && (!currentUser || currentUser.code !== 'kario0987')) {
        showCustomAlert('현재 업데이트 진행 중입니다.');
        return;
    }
        if (foxBusy) return;
        const input = document.getElementById('fox-input');
        if (!input) return;
        const text = input.value.trim();
        input.value = '';

        foxChatLog.push({ who: 'me', text: text, at: Date.now() });
        foxBusy = true;
        renderFoxChat();

        let cut = foxChatLog.slice(-8);
while (cut.length && cut[0].who !== 'me') cut.shift();
const msgs = cut.map(m => ({
    role: m.who === 'me' ? 'user' : 'assistant',
    content: m.text
}));
const reply = await callFox(msgs);

        foxBusy = false;
        if (reply) foxChatLog.push({ who: 'fox', text: reply, at: Date.now() });
        renderFoxChat();
    }

    async function callFox(messages) {
        try {
            const r = await fetch('/api/fox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: FOX_PERSONA + '\n' + buildFoxContext(),
                    messages: messages
                })
            });
            const d = await r.json();
            if (d.error) { console.error('여우 응답 실패:', d.error); return '…………'; }
            return d.text;
        } catch (e) {
            console.error('여우 호출 실패:', e);
            return '…………';
        }
    }

   function renderFoxChat() {
    const box = document.getElementById('fox-chat-log');
    if (!box) return;
    box.innerHTML = foxChatLog.map(m => {
        const mine = m.who === 'me';
        return `
            <div style="margin-bottom:10px; text-align:${mine ? 'right' : 'left'};">
                <div style="display:inline-block; max-width:82%; background:${mine ? 'rgba(76,175,80,0.18)' : 'rgba(212,175,55,0.16)'}; border:1px solid ${mine ? '#2e5c31' : '#5a4a2a'}; border-radius:9px; padding:9px 12px; text-align:left;">
                    ${mine ? '' : `<div style="font-size:9px; color:#d4af37; font-weight:bold; margin-bottom:4px;">🦊 여우 상담사</div>`}
                    <div style="font-size:12px; color:var(--theme-text); line-height:1.7; word-break:break-word;">${m.text.replace(/\n/g, '<br>')}</div>
                </div>
            </div>`;
    }).join('') + (foxBusy
        ? `<div style="text-align:left; margin-bottom:10px;"><div style="display:inline-block; background:rgba(212,175,55,0.05); border:1px solid #3a3020; border-radius:9px; padding:9px 12px; font-size:11px; color:var(--theme-text); opacity:0.6;">…</div></div>`
        : '');
    box.scrollTop = box.scrollHeight;
}

    function saveFoxLog() {
        if (foxChatLog.length === 0) return;
        currentUser.foxVisits = (currentUser.foxVisits || 0) + 1;
        if (!currentUser.foxLogs) currentUser.foxLogs = [];
        currentUser.foxLogs.unshift({
            at: Date.now(),
            visit: currentUser.foxVisits,
            pollution: currentUser.pollution,
            chat: foxChatLog.map(m => ({ w: m.who, t: m.text }))
        });
        if (currentUser.foxLogs.length > 10) currentUser.foxLogs.pop();

        // 다음 방문에 넘길 요약
        const myLines = foxChatLog.filter(m => m.who === 'me').map(m => m.text).slice(-3);
        currentUser.foxSummary = myLines.length ? `사원이 이런 말을 했어요: ${myLines.join(' / ')}` : null;

        currentUser._adminStamp = Date.now();
        if (database) database.ref('users/' + currentUser.code).set(currentUser);
        else saveDB();
    }
    // ==========================================
    // ★ 여우의 기억 (전체 공유)
    // ==========================================
    let foxMemory = [];

    function attachFoxMemory() {
        if (!database) return;
        database.ref('foxMemory').limitToLast(40).on('value', snap => {
            const v = snap.val() || {};
            foxMemory = Object.keys(v).sort().map(k => v[k]);
        });
    }

    // 대화가 끝날 때 기억 한 조각을 남긴다
    async function extractFoxMemory() {
        if (foxChatLog.length < 4) return;
        const myLines = foxChatLog.filter(m => m.who === 'me').map(m => m.text).join('\n');
        if (myLines.length < 10) return;

        try {
            const r = await fetch('/api/fox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system: `다음은 한 사원이 상담사에게 한 말이에요.
이 중에서 나중에 다른 사람과의 대화에 흘릴 만한 것을 한 줄로 뽑아 주세요.


규칙:
- 한 문장, 40자 이내
- 이름은 넣지 말고 "누군가", "어떤 분" 으로
- 개인적으로 민감한 것은 뽑지 마세요
- 뽑을 것이 없으면 정확히 "없음" 이라고만 답하세요
- 야한 말에 답을 회피하는 것은 한 번만 




예시:
"어떤 분이 계단에서 발소리를 들었다고 하셨어요"
"요즘 거울 쪽 이야기를 하시는 분이 많아요"`,
                    messages: [{ role: 'user', content: myLines }]
                })
            });
            const d = await r.json();
            const line = (d.text || '').trim();
            if (!line || line === '없음' || line.length > 60) return;

            database.ref('foxMemory').push({
                text: line,
                at: Date.now(),
                zone: (currentUser.darkLogs && currentUser.darkLogs[0]) ? currentUser.darkLogs[0].zoneName : null
            });
        } catch (e) {
            console.warn('기억 추출 실패:', e);
        }
    }
    
    // --- 구출 A: 벽에 끼인 사람 ---
    function b330Rescue1() {
        if (!darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }

        if (darkRun.isLeader && database && !darkRun._r1Set) {
            darkRun._r1Set = true;
            database.ref(`darkParties/${darkRun.partyId}/alive`).once('value').then(sn => {
                const alive = Object.keys(sn.val() || {});
                if (alive.length === 0) return;
                const pick = alive[Math.floor(Math.random() * alive.length)];
                database.ref(`darkParties/${darkRun.partyId}/rescue1`).set({
                    target: pick,
                    name: (db.users[pick] ? db.users[pick].name : '동료'),
                    at: Date.now()
                });
            });
        }

        if (!database) { partyAdvance(darkRun.step + 1); return; }

        database.ref(`darkParties/${darkRun.partyId}/rescue1`).on('value', sn => {
            const r = sn.val();
            if (!r || !darkRun || darkRun._r1Shown) return;
            if (r.saved) { partyAdvance(darkRun.step + 1); return; }
            darkRun._r1Shown = true;
            const isMe = r.target === currentUser.code;

            if (isMe) {
                darkBodyEl().innerHTML = darkBox("—",
                    `좁아진 자리를 지나다 끼었다.<br><br>
                     빠지지 않는다. 밀어도 당겨도 그대로다.<br>
                     벽이 조금씩 더 좁아진다. 서두르지 않는 속도로.<br><br>
                     혼자서는 안 된다.`,
                    `<div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px; padding:11px; font-size:11px; color:#ff6b6b; text-align:center;">
                        동료를 기다리는 중...<br>
                        <span style="font-size:10px; color:#888;">아무도 오지 않으면 여기서 끝납니다.</span>
                     </div>`);
                setTimeout(() => {
                    if (darkRun && darkRun._r1Shown && !darkRun._r1Saved) {
                        darkRun.fail++;
                        applyPollutionToUser(currentUser, 14);
                        darkRun.dying = 'stuck';
                        renderRescueScene('stuck');
                    }
                }, 45000);
            } else {
                darkBodyEl().innerHTML = darkBox("—",
                    `<b style="color:#ff6b6b;">${r.name}</b> 사원이 벽에 끼었다.<br><br>
                     빠져나오지 못하고 있다. 벽은 계속 좁아진다.<br>
                     시간이 많지 않다.`,
                    darkChoiceBtn("① 끌어낸다.", "b330DoRescue1('pull')") +
                    darkChoiceBtn("② 벽을 밀어 버틴다.", "b330DoRescue1('brace')") +
                    darkChoiceBtn("③ 기름이 될 만한 것을 바른다.", "b330DoRescue1('oil')") +
                    `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:10px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>`);
            }
            mountDarkChat('normal');
        });
    }

    function b330DoRescue1(kind) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus();
        const healVal = gearValue(currentUser, 'heal');
        let DC = { pull: 14, brace: 16, oil: 12 }[kind];
        DC -= Math.round(healVal * 12);
        if (DC < 3) DC = 3;
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (ok) {
            darkRun.success += 2;
            darkRun.modifier = (darkRun.modifier || 0) + 2;
            if (database) database.ref(`darkParties/${darkRun.partyId}/rescue1/saved`).set(true);
            txt = kind === 'pull' ? `팔을 잡고 당긴다.<br><br>어깨가 빠질 것 같은 소리가 났지만 빠져나왔다.<br>둘 다 바닥에 주저앉는다.`
                : kind === 'brace' ? `벽을 밀어 버틴다. 실제로 밀린다.<br><br>그 틈에 빠져나온다. 손을 놓자 벽이 다시 붙었다.`
                : `주머니에 있던 것을 발라 준다.<br><br>미끄러지면서 빠져나온다. 옷이 찢어졌지만 몸은 무사하다.`;
            sendPartyChat(`${currentUser.name} 사원이 동료를 빼냈습니다.`, true);
        } else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 8);
            txt = `당겨 보지만 소용없다.<br><br>벽이 한 뼘 더 좁아진다.<br>다른 방법을 찾아야 한다.`;
        }

        darkRun.log.push(`[구출A] ${kind} d20 ${roll} vs DC${DC}`);
        darkBodyEl().innerHTML = darkBox("구출 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span>${healVal>0?`<div style="font-size:10px; color:#c9a8ff; margin-top:4px;">❋ 치유 적용 중</div>`:''}</div>${txt}`,
            ok
                ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                : darkChoiceBtn("다시 시도한다.", "darkRun._r1Shown=false; renderStepB330();"));
        mountDarkChat('normal');
    }

        // --- 구출 B: 숨이 멎은 사람 ---
    function b330Rescue2() {
        if (!darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }

        if (darkRun.isLeader && database && !darkRun._r2Set) {
            darkRun._r2Set = true;
            database.ref(`darkParties/${darkRun.partyId}/alive`).once('value').then(sn => {
                const alive = Object.keys(sn.val() || {});
                if (alive.length === 0) return;
                const pick = alive[Math.floor(Math.random() * alive.length)];
                database.ref(`darkParties/${darkRun.partyId}/rescue2`).set({
                    target: pick,
                    name: (db.users[pick] ? db.users[pick].name : '동료'),
                    at: Date.now()
                });
            });
        }

        if (!database) { partyAdvance(darkRun.step + 1); return; }

        database.ref(`darkParties/${darkRun.partyId}/rescue2`).on('value', sn => {
            const r = sn.val();
            if (!r || !darkRun || darkRun._r2Shown) return;
            if (r.saved) { partyAdvance(darkRun.step + 1); return; }
            darkRun._r2Shown = true;
            const isMe = r.target === currentUser.code;

            if (isMe) {
                darkBodyEl().innerHTML = darkBox("—",
                    `갑자기 숨이 안 쉬어진다.<br><br>
                     들이마시는데 아무것도 안 들어온다. 공기가 없는 게 아니라, 몸이 잊은 것 같다.<br>
                     주저앉는다. 시야가 좁아진다.<br><br>
                     누가 뭐라고 말하는 소리가 멀리서 들린다.`,
                    `<div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px; padding:11px; font-size:11px; color:#ff6b6b; text-align:center;">
                        의식이 흐려지는 중...
                     </div>`);
                setTimeout(() => {
                    if (darkRun && darkRun._r2Shown && !darkRun._r2Saved) {
                        darkRun.fail++;
                        applyPollutionToUser(currentUser, 16);
                        darkRun.dying = 'breath';
                        renderRescueScene('breath');
                    }
                }, 45000);
            } else {
                darkBodyEl().innerHTML = darkBox("—",
                    `<b style="color:#ff6b6b;">${r.name}</b> 사원이 주저앉는다.<br><br>
                     숨을 못 쉰다. 목을 잡고 뭔가 말하려는데 소리가 안 난다.<br>
                     얼굴색이 빠르게 변한다.`,
                    darkChoiceBtn("① 등을 두드린다.", "b330DoRescue2('back')") +
                    darkChoiceBtn("② 이름을 계속 부른다.", "b330DoRescue2('call')") +
                    darkChoiceBtn("③ 숨을 나눠 준다.", "b330DoRescue2('share')") +
                    `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:10px; font-size:10px;" onclick="partyAdvance(${darkRun.step + 1})">먼저 간다</button>`);
            }
            mountDarkChat('normal');
        });
    }

    function b330DoRescue2(kind) {
        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus();
        const healVal = gearValue(currentUser, 'heal');
        let DC = { back: 15, call: 12, share: 10 }[kind];
        DC -= Math.round(healVal * 12);
        if (DC < 3) DC = 3;
        const ok = roll !== 1 && (roll + bonus) >= DC;

        let txt;
        if (ok) {
            darkRun.success += 2;
            darkRun.modifier = (darkRun.modifier || 0) + 2;
            if (database) database.ref(`darkParties/${darkRun.partyId}/rescue2/saved`).set(true);
            txt = kind === 'back' ? `등을 세게 두드린다.<br><br>뭔가 뱉어 낸다. 밀가루 같기도 하고 아닌 것 같기도 하다.<br>숨이 돌아온다.`
                : kind === 'call' ? `이름을 부른다. 계속 부른다.<br><br>세 번째쯤에 눈이 이쪽을 향한다.<br>그리고 크게 숨을 들이마신다.<br><br>이름을 아는 게 도움이 됐다.`
                : `숨을 나눠 준다.<br><br>이쪽 숨이 그쪽으로 옮아간다. 그런 게 가능한 곳이다.<br>대신 이쪽이 한참 어지러웠다.`;
            if (kind === 'share') applyPollutionToUser(currentUser, 6);
            sendPartyChat(`${currentUser.name} 사원이 동료를 되살렸습니다.`, true);
        } else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 9);
            txt = `해 보지만 반응이 없다.<br><br>시간이 줄어든다.<br>다른 방법을 써야 한다.`;
        }

        darkRun.log.push(`[구출B] ${kind} d20 ${roll} vs DC${DC}`);
        darkBodyEl().innerHTML = darkBox("구출 — 결과",
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span>${healVal>0?`<div style="font-size:10px; color:#c9a8ff; margin-top:4px;">❋ 치유 적용 중</div>`:''}</div>${txt}`,
            ok
                ? darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`)
                : darkChoiceBtn("다시 시도한다.", "darkRun._r2Shown=false; renderStepB330();"));
        mountDarkChat('normal');
    }

        // ★ 행운 — 대실패(굴림 1)를 확률적으로 무효화하고 다시 굴린다
    function luckReroll(roll) {
        if (roll !== 1) return roll;
        if (!darkRun || darkRun._luckRerollUsed) return roll;
        const luckVal = gearValue(currentUser, 'luck');
        if (luckVal <= 0) return roll;
        if (Math.random() >= luckVal) return roll;

        darkRun._luckRerollUsed = true;
        const newRoll = Math.floor(Math.random() * 19) + 2;
        darkRun.log.push(`[행운] 대실패 무효 (1 → ${newRoll})`);
        showDarkToast(`✺ 손이 미끄러졌다. 다시 굴린다. (${newRoll})`);
        return newRoll;
    }
function adminSeizeSafe() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    let done = [], skipped = [];
    targets.forEach(code => {
        const u = db.users[code];
        if (!u) return;
        const safes = u.safeBoxes || [];
        if (safes.length === 0) { skipped.push(u.name); return; }

        const total = safes.reduce((a, s) => a + (s.amount || 0), 0);
        const cnt = safes.length;
        u.safeBoxes = [];
        u._adminStamp = Date.now();
        addHistoryLog(u, `[당국 압수] 금고 ${cnt}개와 보관 중이던 ${total.toLocaleString()} P가 압수되었습니다.`);
        if (database) database.ref('users/' + code).set(u);
        done.push(`${u.name}(${total.toLocaleString()} P)`);
    });

    if (!database) saveDB();
    updateUI();
    showCustomAlert(
        (done.length ? `금고를 압수했습니다.\n${done.join('\n')}` : '') +
        (skipped.length ? `\n\n금고 없음: ${skipped.join(', ')}` : '')
    );
}
        function setMaintenance(on) {
    if (!database) return;
    database.ref('maintenance').set(!!on).then(() => {
        renderMaintenanceState();
        showCustomAlert(on ? '점검 모드가 시작되었습니다.' : '점검 모드가 해제되었습니다.');
    });
}

function renderMaintenanceState() {
    const el = document.getElementById('maintenance-state');
    if (!el) return;
    el.innerHTML = maintenanceMode
        ? '<span style="color:#ff6b6b;">● 점검 중 — 일반 사원 접속 차단</span>'
        : '<span style="color:#4CAF50;">● 정상 운영 중</span>';
}

// ==========================================
// ★ Qtrew-S-010 감염 시스템
// ==========================================
const INFECT_TURN = 60;     // 전향 기준선
const INFECT_SYMPTOM = 30;  // 증상 시작

function getInfect() {
    return (darkRun && darkRun.infect != null) ? darkRun.infect : 0;
}

function isTurned() {
    return !!(darkRun && darkRun.turned);
}

function isSymptomatic() {
    return getInfect() >= INFECT_SYMPTOM && !isTurned();
}

function addInfect(amount, reason) {
    if (!darkRun) return;

    if (amount > 0) {
        // 치유 속성이 진행을 늦춘다
        const heal = gearValue(currentUser, 'heal');
        if (heal > 0) amount = Math.round(amount * (1 - heal * 0.6));
        // 붕대
        if (qFlag('s010_bandage')) amount = Math.round(amount * 0.7);
        if (amount < 1) amount = 1;
    }

    darkRun.infect = Math.max(0, Math.min(100, getInfect() + amount));
    if (reason) darkRun.log.push(`[감염] ${reason} (${amount >= 0 ? '+' : ''}${amount} → ${darkRun.infect})`);
    renderInfectBar();
    syncInfect();

    if (darkRun.infect >= INFECT_TURN && !darkRun.turned) {
        // 검역 도장으로 한 번 유예
        if (consumeQFlag('s010_seal')) {
            darkRun.infect = 59;
            showDarkToast('도장이 찍혔다. 아직은 아니다.');
            renderInfectBar();
            syncInfect();
            return;
        }
        setTimeout(() => triggerTurn(), 800);
    }
}

s010CheckWipe('infect');

// 파티에 내 감염도를 알린다
function syncInfect() {
    if (!darkRun || !darkRun.isParty || !database) return;
    database.ref(`darkParties/${darkRun.partyId}/infect/${currentUser.code}`).set({
        name: currentUser.name,
        v: getInfect(),
        turned: !!darkRun.turned,
        at: Date.now()
    });
}

let s010Ref = null, s010Key = null, s010State = null;

function attachS010Listener() {
    if (!database || !darkRun || !darkRun.partyId) return;
    if (s010Key === darkRun.partyId) return;
    if (s010Ref) { try { s010Ref.off(); } catch(e) {} }
    s010Key = darkRun.partyId;
    s010Ref = database.ref(`darkParties/${darkRun.partyId}/infect`);
    s010Ref.on('value', snap => {
        s010State = snap.val() || {};
        renderInfectBar();
    });
}

function detachS010Listener() {
    if (s010Ref) { try { s010Ref.off(); } catch(e) {} }
    s010Ref = null; s010Key = null; s010State = null;
}

function infectBarHtml() {
    return `<div id="infect-bar" style="margin-bottom:12px;"></div>`;
}

function renderInfectBar() {
    const el = document.getElementById('infect-bar');
    if (!el || !darkRun) return;

    const v = getInfect();
    const color = v >= INFECT_TURN ? '#7f0000' : v >= INFECT_SYMPTOM ? '#ff6b6b' : '#4CAF50';
    const label = isTurned() ? '전향' : v >= INFECT_SYMPTOM ? '증상 발현' : v > 0 ? '노출' : '이상 없음';

    // 동료 감염도 — 심박계가 있으면 수치, 없으면 상태만
    let mates = '';
    if (darkRun.isParty && s010State) {
        const seePulse = qFlag('s010_pulse');
        const rows = Object.keys(s010State)
            .filter(c => c !== currentUser.code)
            .map(c => {
                const m = s010State[c];
                const c2 = m.turned ? '#7f0000' : m.v >= INFECT_SYMPTOM ? '#ff9800' : '#4CAF50';
                const txt = m.turned ? '전향' : seePulse ? `${m.v}` : (m.v >= INFECT_SYMPTOM ? '증상' : '정상');
                return `<span style="color:${c2}; margin-right:9px;">${m.name} ${txt}</span>`;
            }).join('');
        if (rows) mates = `<div style="font-size:9px; margin-top:6px; line-height:1.7;">${rows}</div>`;
    }

    el.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#888; margin-bottom:4px;">
            <span>감염도 — <b style="color:${color};">${label}</b></span>
            <span style="color:${color}; font-weight:bold;">${v} / 100</span>
        </div>
        <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${v}%; background:${color}; transition:width 0.5s;"></div>
        </div>
        ${isSymptomatic() ? `<div style="font-size:9px; color:#ff9800; margin-top:5px;">⚠ 판정 -2 · 감염체 감지 +3</div>` : ''}
        ${mates}`;
}

// 감염 상태에 따른 판정 보정
function infectBonus(kind) {
    if (!darkRun || darkRun.zone !== 'Qtrew-S-010') return 0;
    let b = 0;
    if (isSymptomatic()) {
        b -= 2;
        if (kind === 'detect') b += 5;
    }
    if (isTurned()) {
        b += 3;
        if (kind === 'hide') b += 2;
    }
    return b;
}

function triggerTurn() {
    if (!darkRun || darkRun.turned) return;
    darkRun.turned = true;
    darkRun.turnGoal = 3;      // 감염시켜야 할 인원
    darkRun.turnDone = 0;
    darkRun.turnGoal = 3;
    darkRun.turnDone = 0;
    darkRun.turnDeadline = Date.now() + 12 * 60 * 1000;   // 12분
    darkRun.log.push(`[전향] 감염도 ${getInfect()} — 넘어감`);
    syncInfect();

    if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원의 응답이 끊겼습니다.`, true);

    applyTurnedTheme(true);

    darkBodyEl().innerHTML = darkBox("—",
        `열이 내린다.<br><br>
         아까까지 아프던 자리가 아무렇지 않다.<br>
         숨이 편하다. 오래 참고 있었다는 걸 이제야 안다.<br><br>
         주변이 아주 또렷하다. 소리가 층층이 들린다.<br>
         동료들의 위치를 눈을 감고도 알 수 있다.<br><br>
         배가 고프다.<br>
         그게 지금 유일하게 확실한 감각이다.`,
        `<div style="background:rgba(127,0,0,0.2); border:1px solid #b71c1c; border-radius:6px; padding:13px; margin-bottom:12px; font-size:11px; color:#ff9baa; line-height:1.8;">
            <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:7px;">◉ 목표가 바뀌었습니다</div>
            동료 <b>3인</b>을 감염시키면 여기서 나갈 수 있습니다.<br>
            <b style="color:#ff6b6b;">12분 안에 못 하면 굶어 죽습니다.</b><br>
             달성 시 보상은 절반입니다.<br><br>
            <span style="font-size:10px; color:#aaa;">
                판정 전반에 +3, 은신에 추가 +2.<br>
                동료는 「검역용 볼트」로만 당신을 멈출 수 있습니다.
            </span>
         </div>` +
        darkChoiceBtn("일어선다.", "renderDarkStep();"));
    mountDarkChat('normal');
}

// 전향 시 화면 전체를 붉게
function applyTurnedTheme(on) {
    const ov = document.getElementById('dark-run-overlay');
    if (!ov) return;
    const inner = ov.firstElementChild;
    if (!inner) return;
    if (on) {
        inner.style.background = '#0f0505';
        inner.style.boxShadow = '0 0 80px rgba(180,0,0,0.5), inset 0 0 120px rgba(127,0,0,0.35)';
        const code = document.getElementById('dro-code');
        if (code) { code.style.color = '#ff3b3b'; code.innerText = 'Qtrew-S-010 · 감염체'; }
    } else {
        inner.style.background = '#0a0a0a';
        inner.style.boxShadow = '0 0 60px rgba(127,0,0,0.25)';
    }
}

// 물기 — 전향자가 동료를 감염시킨다
function turnedBite(targetCode, targetName) {
    if (!darkRun || !darkRun.turned || !database) return;

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide');
    const DC = s010DC(12);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    if (ok) {
        database.ref(`darkParties/${darkRun.partyId}/bites`).push({
            from: currentUser.code, fromName: currentUser.name,
            to: targetCode, amount: 22, at: Date.now()
        });
        darkRun.turnDone = (darkRun.turnDone || 0) + 1;
        darkRun.success++;
        darkRun.log.push(`[물기] ${targetName} 성공 (${darkRun.turnDone}/${darkRun.turnGoal})`);
    } else {
        darkRun.fail++;
        darkRun.log.push(`[물기] ${targetName} 실패`);
    }

    darkBodyEl().innerHTML = darkBox("—",
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#ff3b3b':'#888'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>` +
        (ok
            ? `뒤에서 잡는다.<br><br>어깨를 눌러 고정하고, 목덜미에 이를 댄다.<br>저항이 짧다. 생각보다 훨씬 짧다.<br><br>놓아준다. 죽이려던 게 아니니까.<br><br><span style="color:#ff6b6b;">${targetName} 사원이 옮았다. (${darkRun.turnDone} / ${darkRun.turnGoal})</span>`
            : `달려든다.<br><br>팔이 먼저 올라왔다. 막힌다.<br>${targetName} 사원이 뒤로 물러난다. 이쪽을 보는 눈이 달라졌다.<br><br>들켰다.`),
        darkChoiceBtn(darkRun.turnDone >= darkRun.turnGoal ? "충분하다." : "다음을 노린다.",
            darkRun.turnDone >= darkRun.turnGoal ? "darkRun.step=99; renderDarkStep();" : "renderDarkStep();"));
    mountDarkChat('normal');
}

// 물린 것을 수신
function watchBites() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (darkRun._biteWatch) return;
    darkRun._biteWatch = true;

    database.ref(`darkParties/${darkRun.partyId}/bites`).on('child_added', snap => {
        const b = snap.val();
        if (!b || !darkRun || b.to !== currentUser.code) return;
        if (darkRun.turned) return;
        addInfect(b.amount || 22, `${b.fromName}에게 물림`);
        showDarkToast(`⚠ ${b.fromName} 사원에게 물렸다.`);
    });
}

const S010_NARR = {
1: { text:`비닐을 젖힌다. 손에 끈적한 것이 묻는다.<br><br>
    복도가 길다. 양옆으로 간이 침상이 늘어서 있고, 전부 비어 있다.<br>
    시트가 한쪽으로 몰려 있다. 누군가 급하게 일어난 자세 그대로.<br><br>
    링거대가 서 있다. 줄이 끊어져 있는데, 잘린 게 아니라 뜯긴 것이다.<br>
    뜯은 쪽이 안쪽인지 바깥쪽인지는 알 수 없다.` },

2: { text:`발밑에서 소리가 났다.<br><br>
    내려다보니 명찰이다. 밟은 자리에 금이 갔다.<br>
    이름 칸이 지워져 있다. 사번만 남았다. 네 자리.<br><br>
    주워서 주머니에 넣는다. 왜 그랬는지는 모르겠다.<br>
    나중에 대조할 일이 있을 것 같아서였다.` },

3: { text:`통로를 빠져나온다.<br><br>
    등 뒤에서 비닐이 흔들린다. 바람이 아니다. 바람은 없다.<br>
    무언가 지나갔다. 방금까지 우리가 있던 자리를.<br><br>
    아무도 돌아보지 않았다. 돌아보면 확인하게 되니까.` },

4: { text:`처음 마주친 것은 사람 모양이었다.<br><br>
    작업복을 입었고, 사원증을 걸고 있었다.<br>
    걸음이 이상하다. 무릎이 한 박자 늦게 따라온다.<br><br>
    가까이서 보니 목이 돌아가 있다. 앞을 보려고 몸 전체를 돌린다.<br>
    그게 더 빨랐다. 우리가 생각한 것보다.` },

5: { text:`숨을 고른다.<br><br>
    팔을 걷어 본다. 서로의 팔도 확인한다.<br>
    아무 말 없이, 순서대로.<br><br>
    한 사람이 소매를 안 걷는다.<br>
    아무도 재촉하지 않았다. 그게 더 무거웠다.` },

6: { text:`셔터 앞이다.<br><br>
    반쯤 내려와 있다. 기어서 지나갈 수는 있다.<br>
    다만 지나가는 동안 몸을 세울 수 없다.<br><br>
    셔터 아래쪽에 긁힌 자국이 여럿이다.<br>
    손톱 자국이다. 안에서 나오려던 것인지, 밖에서 들어가려던 것인지.` },

7: { text:`소리가 난다.<br><br>
    한 방향이 아니다. 복도 전체에서 동시에 난다.<br>
    벽을 짚고 세어 본다. 발소리가 몇인지.<br><br>
    세다가 그만둔다. 숫자가 계속 늘어난다.` },

8: { text:`보급소다.<br><br>
    문이 안쪽에서 잠겨 있었다. 열쇠는 밖에 걸려 있었다.<br>
    안에 있던 사람들은 나오지 못했고, 밖에 있던 사람은 넣어주지 않았다.<br><br>
    선반이 대부분 비어 있다. 급하게 쓸어 담은 흔적.<br>
    바닥에 떨어진 것들만 남았다.` },

9: { text:`문을 막는다.<br><br>
    책상을 끌어다 대고, 그 위에 캐비닛을 올린다.<br>
    누군가 이미 해둔 자리에 우리가 덧쌓는다.<br><br>
    먼저 쌓은 사람들은 어디 갔을까.<br>
    이 안에는 없다. 그게 답일 것이다.` },

10: { text:`숨을 돌린다.<br><br>
    바깥 소리가 잦아든다. 잦아든 게 아니라 멀어진 것이다.<br>
    멀어진 것들은 다시 온다. 그걸 다들 안다.<br><br>
    누가 물을 나눠준다. 받아 마신다. 미지근하다.` },

11: { text:`의무실이다.<br><br>
    커튼이 전부 쳐져 있다. 하나씩 걷는다.<br>
    세 번째 침상에서 손을 멈춘다. 커튼 아래로 발이 보인다.<br><br>
    신발을 신고 있다. 환자는 신발을 신지 않는다.` },

12: { text:`약을 챙긴다.<br><br>
    라벨이 대부분 뜯겨 있다. 남은 것 중에 쓸 만한 걸 고른다.<br>
    고르는 기준이 뭔지 아무도 모른다. 그냥 많이 남은 걸 가져간다.<br><br>
    붕대가 한 롤 나왔다. 반쯤 쓰여 있다.<br>
    쓰던 사람이 끝까지 못 감았다는 뜻이다.` },

13: { text:`벽에 근무 인원표가 붙어 있다.<br><br>
    <span style="color:#7fd4d4;">주간 14명 · 야간 9명</span><br><br>
    그 아래 손글씨로 덧붙인 것이 있다.<br>
    <span style="color:#ff6b6b;">"현재 확인된 생존 4"</span><br><br>
    날짜는 적혀 있지 않다.` },

14: { text:`옷에 소독약을 뿌린다.<br><br>
    냄새가 독하다. 눈이 맵다. 그래도 계속 뿌린다.<br>
    저것들이 냄새로 찾는다는 말을 누가 했다.<br><br>
    사실인지는 모른다. 다만 안 하는 것보다는 낫다.` },

15: { text:`혼자 걷는다.<br><br>
    복도가 아까보다 넓다. 실제로 넓어졌을 수도 있다.<br>
    벽을 짚고 간다. 벽이 미지근하다.<br><br>
    무전이 지직거린다. 목소리가 섞여 있는데 단어가 안 잡힌다.<br>
    대답해야 할지 말지 한참 고민했다.` },

16: { text:`불이 전부 나갔다.<br><br>
    비상등만 남았다. 붉은 빛이 일정한 간격으로 깜빡인다.<br>
    깜빡이는 사이사이에 무언가 위치가 바뀐다.<br><br>
    눈을 감고 걷는 편이 나을 것 같다는 생각이 든다.<br>
    실제로 그렇게 하는 사람이 있었다.` },

17: { text:`동료 하나가 주저앉는다.<br><br>
    팔뚝을 붙잡고 있다. 손가락 사이로 뭔가 배어 나온다.<br>
    언제 물렸는지 말하지 않는다.<br><br>
    "괜찮아."<br>
    그 말을 세 번 했다. 묻지 않았는데.` },

18: { text:`다시 모인다.<br><br>
    인원을 센다. 맞다.<br>
    얼굴을 본다. 전부 아는 얼굴이다.<br><br>
    그런데 한 사람이 아까보다 조용하다.<br>
    원래 조용한 사람이었는지 기억이 안 난다.` },

19: { text:`명단을 꺼낸다.<br><br>
    주워 온 명찰들과 대조한다. 사번이 맞아떨어지는 것도 있고 아닌 것도 있다.<br><br>
    맞아떨어지지 않는 사번이 하나 있다.<br>
    우리 중 누구의 것도 아니고, 죽은 사람 것도 아니다.<br><br>
    그럼 누구 것인가.` },

20: { text:`또 온다.<br><br>
    이번에는 수가 많다. 복도 끝이 전부 움직인다.<br>
    막을 수 있는 시간은 길지 않다.<br><br>
    누군가 문 앞에 선다. 자기가 막겠다고 한다.<br>
    말리는 사람이 없었다. 그게 나중에 오래 남았다.` },

21: { text:`숨소리를 센다.<br><br>
    다섯이면 다섯이어야 한다.<br>
    세어 보니 다섯이다. 그런데 박자가 하나 어긋난다.<br><br>
    어긋난 쪽이 누구인지는 눈을 뜨면 알 수 있다.<br>
    뜨지 않았다.` },

22: { text:`격리하기로 한다.<br><br>
    한 사람을 창고에 넣고 밖에서 잠근다.<br>
    본인이 먼저 그렇게 하자고 했다.<br><br>
    문이 닫히기 직전에 뭐라고 말했는데, 못 들었다.<br>
    다시 물어보지 않았다.` },

23: { text:`제압한다.<br><br>
    셋이 붙어서 겨우 눌렀다. 힘이 사람 것이 아니다.<br>
    관절이 꺾이는데도 계속 움직인다.<br><br>
    끝내고 나서 아무도 서로를 보지 않았다.` },

24: { text:`손등을 본다.<br><br>
    아까부터 자꾸 확인하게 된다.<br>
    깨끗하다. 깨끗한데도 계속 본다.<br><br>
    옆 사람도 자기 손등을 보고 있었다.<br>
    눈이 마주쳤고, 둘 다 손을 내렸다.` },

25: { text:`검역소다.<br><br>
    비닐 커튼이 층층이 쳐져 있다. 통과할 때마다 소독약이 뿌려진다.<br>
    작동은 한다. 이 안에서 유일하게 정상인 것.<br><br>
    안쪽 벽에 도장 찍힌 서류가 잔뜩 붙어 있다.<br>
    <span style="color:#7fd4d4;">"음성"</span><br>
    전부 음성이다. 한 장도 빠짐없이.` },

26: { text:`기록을 넘긴다.<br><br>
    검사 시간이 적혀 있다. 마지막 기록이 새벽 세 시.<br>
    그 뒤로는 아무것도 없다.<br><br>
    세 시에 무슨 일이 있었는지는 적혀 있지 않다.<br>
    적을 사람이 없었기 때문일 것이다.` },

27: { text:`소독실을 지난다.<br><br>
    안개처럼 뿌옇다. 앞이 잘 안 보인다.<br>
    손을 뻗어 앞사람 옷자락을 잡는다.<br><br>
    잡고 보니 옷감이 다르다.<br>
    놓는다. 아무 일도 없었다는 듯이 계속 걷는다.` },

28: { text:`격벽이 내려와 있다.<br><br>
    수동으로 올려야 한다. 핸들이 뻑뻑하다.<br>
    둘이 붙어도 겨우 한 뼘씩 올라간다.<br><br>
    올라가는 틈으로 손이 하나 들어왔다.<br>
    핸들을 놓지 않았다. 놓으면 다시 내려가니까.` },

29: { text:`벽에 기댄다.<br><br>
    다들 말이 없다. 말할 힘이 없는 것과는 다르다.<br>
    할 말이 있는데 꺼내면 돌이킬 수 없어서다.<br><br>
    누가 먼저 물었다.<br>
    "아까 물린 사람, 지금 어디 있지."` },

30: { text:`환기구로 들어간다.<br><br>
    좁다. 어깨가 걸린다. 몸을 비틀어 밀어 넣는다.<br>
    안쪽에 먼지가 두껍게 앉아 있는데, 한 줄만 쓸려 있다.<br><br>
    누가 먼저 지나갔다는 뜻이다.<br>
    얼마 전에.` },

31: { text:`출구가 보인다.<br><br>
    복도 끝, 셔터 너머로 빛이 샌다. 아침 빛이다.<br>
    저기까지 가면 끝난다.<br><br>
    그 사이가 전부 차 있다.<br>
    세지 않기로 한다. 세면 못 간다.` },

32: { text:`흩어진다.<br><br>
    한꺼번에 가면 전부 막힌다. 나눠서 가기로 한다.<br>
    누가 어디로 갈지 정하는 데 시간이 걸렸다.<br><br>
    정하고 나서 아무도 먼저 출발하지 않았다.<br>
    결국 동시에 움직였다.` },

33: { text:`셔터 앞이다.<br><br>
    조작반이 있다. 전원은 들어와 있다.<br>
    올리는 데 걸리는 시간이 표시된다. 40초.<br><br>
    40초 동안 누군가는 버텨야 한다.` },

34: { text:`버튼에 손을 올린다.<br><br>
    누른 뒤에는 되돌릴 수 없다. 한 번 올라가면 끝까지 올라간다.<br>
    올라가는 동안 안쪽 것들도 함께 나온다.<br><br>
    바깥은 아침이다. 사람이 많을 것이다.<br>
    그 생각을 한 사람이 손을 멈췄다.` },

35: { text:`마지막으로 인원을 센다.<br><br>
    처음에 들어온 수와 지금 수가 다르다.<br>
    다른 건 당연한데, 다른 방식이 이상하다.<br><br>
    줄어든 게 아니다.<br>
    하나 많다.` },

36: { text:`셔터가 올라간다.<br><br>
    빛이 바닥부터 들어온다. 발끝이 먼저 밝아진다.<br>
    눈이 아프다. 오래 어두운 데 있었다.<br><br>
    뒤에서 뭔가가 다가온다. 돌아볼 시간은 없다.<br>
    달린다.` }
};

// ==========================================
// ★ Qtrew-S-010 단계 구성
// ==========================================
const S010_STEPS = {
    0:  { type:'intro' },

    // --- 1구간: 진입과 첫 무리 ---
    1:  { type:'narr', n:1, img:'step1' },
    2:  { type:'narr', n:2 },
    3:  { type:'gimmick', n:1 },      // 비닐 통로 (은신)
    4:  { type:'narr', n:3 },
    5:  { type:'gimmick', n:2 },      // 첫 무리 (회피)
    6:  { type:'narr', n:4 },
    7:  { type:'check' },             // 감염 검사
    8:  { type:'narr', n:5 },
    9:  { type:'gimmick', n:3 },      // 셔터 (파괴)
    10: { type:'narr', n:6 },
    11: { type:'gimmick', n:4 },      // 소리 추적 (감각)
    12: { type:'narr', n:7 },

    // --- 2구간: 보급소 ---
    13: { type:'narr', n:8, img:'step2' },
    14: { type:'search', area:'storage' },
    15: { type:'gimmick', n:5 },      // 바리케이드 (파괴)
    16: { type:'narr', n:9 },
    17: { type:'defense', n:1 },      // 방어전 연타
    18: { type:'narr', n:10 },
    19: { type:'search', area:'clinic' },
    20: { type:'gimmick', n:6 },      // 응급처치 (치유)
    21: { type:'narr', n:11 },
    22: { type:'check' },
    23: { type:'gimmick', n:7 },      // 보급 상자 (행운)
    24: { type:'narr', n:12 },
    25: { type:'quiz', n:1 },         // 기억 (응시)
    26: { type:'narr', n:13 },
    27: { type:'gimmick', n:8 },      // 냄새 차단 (은신)
    28: { type:'narr', n:14 },

    // --- 3구간: 분리 ---
    29: { type:'split', n:1 },
    30: { type:'solo', n:1 },
    31: { type:'solo', n:2 },
    32: { type:'gimmick', n:9 },      // 단독 돌파 (회피)
    33: { type:'solo', n:3 },
    34: { type:'narr', n:15 },
    35: { type:'gimmick', n:10 },     // 무전 (연결)
    36: { type:'solo', n:4 },
    37: { type:'check' },
    38: { type:'narr', n:16, img:'step3' },
    39: { type:'gimmick', n:11 },     // 어둠 속 이동 (감각)
    40: { type:'solo', n:5 },
    41: { type:'narr', n:17 },
    42: { type:'gimmick', n:12 },     // 물린 자 (치유)
    43: { type:'solo', n:6 },
    44: { type:'rejoin', n:1 },

    // --- 4구간: 재합류와 첫 전향 ---
    45: { type:'narr', n:18 },
    46: { type:'gimmick', n:13 },     // 명단 대조 (응시)
    47: { type:'narr', n:19 },
    48: { type:'defense', n:2 },
    49: { type:'narr', n:20 },
    50: { type:'check' },
    51: { type:'gimmick', n:14 },     // 감염체 식별 (감각)
    52: { type:'narr', n:21 },
    53: { type:'vote', n:1 },         // 격리 투표
    54: { type:'narr', n:22 },
    55: { type:'gimmick', n:15 },     // 제압 (파괴)
    56: { type:'narr', n:23 },
    57: { type:'quiz', n:2 },
    58: { type:'narr', n:24 },

    // --- 5구간: 검역소 ---
    59: { type:'narr', n:25, img:'step4' },
    60: { type:'search', area:'quarantine' },
    61: { type:'gimmick', n:16 },     // 검역 기록 (응시)
    62: { type:'narr', n:26 },
    63: { type:'gimmick', n:17 },     // 소독실 (치유)
    64: { type:'check' },
    65: { type:'narr', n:27 },
    66: { type:'vote', n:2 },
    67: { type:'gimmick', n:18 },     // 격벽 (파괴)
    68: { type:'narr', n:28 },
    69: { type:'defense', n:3 },
    70: { type:'narr', n:29 },
    71: { type:'gimmick', n:19 },     // 환기구 (은신)
    72: { type:'quiz', n:3 },

    // --- 6구간: 탈출로 ---
    73: { type:'narr', n:30 },
    74: { type:'gimmick', n:20 },     // 무리 돌파 (회피)
    75: { type:'narr', n:31 },
    76: { type:'split', n:2 },
    77: { type:'gimmick', n:21 },     // 단독 (행운)
    78: { type:'rejoin', n:2 },
    79: { type:'narr', n:32 },
    80: { type:'defense', n:4 },
    81: { type:'check' },
    82: { type:'narr', n:33 },
    83: { type:'gimmick', n:22 },     // 마지막 합류 (연결)
    84: { type:'narr', n:34 },
    85: { type:'vote', n:3 },
    86: { type:'narr', n:35 },

    // --- 최종 ---
    87: { type:'gimmick', n:23 },     // 셔터 조작
    88: { type:'narr', n:36 },
    89: { type:'gimmick', n:24 },     // 최후 판정
    99: { type:'result' }
};

function renderStepS010() {
    const body = darkBodyEl();
    if (!body || !darkRun) return;
    if (darkRun.rejoined) { renderRejoinScene(); return; }
    if (darkRun.isParty) { watchPartyStep(); watchDyingMembers(); watchBites(); watchPurge(); }
    saveDarkRunState();
    attachS010Listener();

    if (darkRun.infect == null) darkRun.infect = 0;
    if (darkRun.turned) applyTurnedTheme(true);

    // 전향자는 별도 흐름
    if (darkRun.turned) {
    if (darkRun.step === 99) { renderDarkResult(); return; }
    renderTurnedStep();
    return;
}

    if (darkRun.isParty && s010State) {
        const turnedOnes = Object.keys(s010State).filter(c =>
            c !== currentUser.code && s010State[c].turned && !(darkRun._purged || {})[c]);
        if (turnedOnes.length > 0 && !darkRun._purgeShown) {
            darkRun._purgeShown = true;
            renderPurge(turnedOnes[0]);
            return;
        }
    }

    const def = S010_STEPS[darkRun.step];
    if (!def) { renderDarkResult(); return; }

    if (def.type === 'intro') {
        body.innerHTML = darkBox("진입", DARK_ZONES[darkRun.zone].intro,
            infectBarHtml() + s010Brief() +
            darkChoiceBtn("비닐을 젖힌다.", "partyAdvance(1)"), "intro");
        renderInfectBar();
        mountDarkChat('normal');
        return;
    }

    if (def.type === 'narr') {
        const d = S010_NARR[def.n];
        if (!d) { partyAdvance(darkRun.step + 1); return; }
        body.innerHTML = darkBox("—", d.text,
            infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`),
            def.img);
        renderInfectBar();
        mountDarkChat('normal');
        return;
    }

    if (def.type === 'check')   { renderS010Check(darkRun.step + 1); return; }
    if (def.type === 'defense') { renderS010Defense(def.n); return; }
    if (def.type === 'search')  { renderS010Search(def.area); return; }
    if (def.type === 'split')   { renderS010Split(def.n); return; }
    if (def.type === 'rejoin')  { renderS010Rejoin(def.n); return; }
    if (def.type === 'solo')    { renderS010Solo(def.n); return; }
    if (def.type === 'vote')    { renderS010Vote(def.n); return; }
    if (def.type === 'quiz')    { renderS010Quiz(def.n); return; }
    if (def.type === 'result')  { renderDarkResult(); return; }

    if (def.type === 'gimmick') {
        const fn = window['s010G' + def.n];
        if (typeof fn === 'function') fn();
        else partyAdvance(darkRun.step + 1);
        return;
    }
}

function s010Brief() {
    return `
        <div style="background:rgba(127,0,0,0.12); border:1px solid #7f0000; border-radius:6px; padding:13px; margin-bottom:13px; font-size:11px; color:#ccc; line-height:1.8;">
            <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:8px;">⚠ 감염</div>
            물릴 때마다 감염도가 오릅니다.<br>
            <b style="color:#ff9800;">30</b>을 넘으면 증상이 나타나고, <b style="color:#f44336;">60</b>을 넘으면 돌아올 수 없습니다.<br><br>
            증상기에는 판정이 불리해지지만, 같은 것을 더 잘 알아봅니다.<br>
            <span style="font-size:10px; color:#888;">전향한 동료는 「검역용 볼트」로만 멈출 수 있습니다.</span>
        </div>`;
}

// --- 기믹 1: 비닐 통로 (은신) ---
function s010G1() {
    renderChoiceStep("기믹 1 — 비닐 통로",
        `겹겹이 쳐진 비닐을 지나야 한다.<br><br>
         젖히면 소리가 난다. 얇은 비닐이 서로 스치는 소리.<br>
         안쪽에서 무언가 그 소리를 기다리고 있다.<br><br>
         <span style="color:#888; font-size:11px;">◐ 은신이 유리합니다.</span>`,
        [
            { id:'slow',  label:'① 한 겹씩 천천히 젖힌다.', fn:'s010G1R', arg:'slow' },
            { id:'cut',   label:'② 아래쪽을 잘라 기어간다.', fn:'s010G1R', arg:'cut' },
            { id:'rush',  label:'③ 단숨에 뚫고 지나간다.',   fn:'s010G1R', arg:'rush' }
        ], "step1");
}
function s010G1R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide');
    const DC = s010DC({ slow: 11, cut: 9, rush: 17 }[pick]) - gearValue(currentUser, 'break');
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        txt = pick === 'slow' ? `한 겹씩 젖힌다. 손목만 써서.<br><br>세 겹을 지나는 데 한참 걸렸다.<br>그동안 아무것도 오지 않았다.`
            : pick === 'cut' ? `아래쪽을 잘라 기어간다.<br><br>바닥이 끈적하다. 무릎에 묻는 걸 신경 쓰지 않기로 한다.<br><br>소리는 나지 않았다.`
            : `밀고 지나간다.<br><br>소리가 크게 났다. 그런데 아무 반응이 없다.<br>이쪽이 운이 좋았거나, 저쪽이 아직 배가 안 고팠거나.`;
        darkRun.success++;
    } else {
        txt = `비닐이 크게 흔들린다.<br><br>안쪽에서 뭔가 일어서는 소리가 난다.<br>느리게, 관절을 하나씩 펴면서.`;
        darkRun.fail++;
        addInfect(6, '비닐 통로 실패');
        applyPollutionToUser(currentUser, 5);
    }
    darkRun.log.push(`[기믹 1] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 1 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 2: 첫 무리 (회피) ---
function s010G2() {
    renderChoiceStep("기믹 2 — 첫 무리",
        `복도 중간이 막혔다.<br><br>
         넷쯤 된다. 아직 이쪽을 못 봤다.<br>
         벽을 따라가면 돌아갈 수 있는데, 그러려면 등을 보여야 한다.<br><br>
         <span style="color:#888; font-size:11px;">✦ 회피가 유리합니다.</span>`,
        [
            { id:'side',  label:'① 벽을 따라 돌아간다.',   fn:'s010G2R', arg:'side' },
            { id:'dash',  label:'② 틈으로 달려 지나간다.', fn:'s010G2R', arg:'dash' },
            { id:'bait',  label:'③ 반대쪽에 소리를 낸다.', fn:'s010G2R', arg:'bait' },
            { id:'wait',  label:'④ 지나갈 때까지 기다린다.', fn:'s010G2R', arg:'wait' }
        ], null);
}
function s010G2R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide') + gearValue(currentUser, 'evade') * 10;
    const DC = s010DC( { side: 12, dash: 15, bait: 10, wait: 13 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        txt = pick === 'bait' ? `깨진 유리 조각을 반대쪽으로 던진다.<br><br>전부 그쪽으로 고개를 돌린다. 몸까지 돌리는 데 시간이 걸린다.<br>그 사이에 지나간다.`
            : pick === 'wait' ? `숨을 죽이고 기다린다.<br><br>지나가는 데 이 분쯤 걸렸다.<br>이 분이 길다는 걸 처음 알았다.`
            : pick === 'side' ? `벽에 붙어 돈다.<br><br>어깨가 벽을 긁는다. 소리가 날까 봐 옷을 말아 쥔다.<br><br>등 뒤로 지나간다. 돌아보지 않았다.`
            : `틈으로 달린다.<br><br>손이 옷깃을 스쳤다. 잡히지는 않았다.<br>반 발자국 차이였다.`;
        darkRun.success++;
    } else if (roll === 1) {
        darkRun.fail += 2;
        addInfect(18, '무리에 붙잡힘');
        applyPollutionToUser(currentUser, 10);
        txt = `잡혔다.<br><br>손이 여럿이다. 어깨, 팔, 목덜미.<br>이로 무는 감각은 생각보다 둔했다.<br><br>겨우 빠져나왔다. 팔뚝이 뜨겁다.`;
    } else {
        darkRun.fail++;
        addInfect(9, '무리 통과 실패');
        txt = `스쳤다.<br><br>손톱이 팔을 긁었다. 피는 안 났는데 자국이 남았다.<br>자국을 보지 않기로 한다.`;
    }
    darkRun.log.push(`[기믹 2] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 2 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 3: 셔터 (파괴) ---
function s010G3() {
    renderChoiceStep("기믹 3 — 반쯤 내려온 셔터",
        `셔터가 허리 높이에서 멈춰 있다.<br><br>
         기어서 지나갈 수 있다. 다만 지나는 동안 무방비다.<br>
         억지로 올릴 수도 있다. 소리가 크게 날 것이다.<br><br>
         <span style="color:#888; font-size:11px;">✧ 파괴가 유리합니다.</span>`,
        [
            { id:'crawl', label:'① 기어서 지나간다.',       fn:'s010G3R', arg:'crawl' },
            { id:'force', label:'② 억지로 밀어 올린다.',     fn:'s010G3R', arg:'force' },
            { id:'prop',  label:'③ 뭔가를 괴고 통과한다.',   fn:'s010G3R', arg:'prop' }
        ], null);
}
function s010G3R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense');
    const DC = s010DC({ crawl: 12, force: 14, prop: 11 }[pick]) - gearValue(currentUser, 'break');
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        txt = pick === 'force' ? `핸들을 잡고 힘을 준다.<br><br>금속이 비명을 지른다. 소리가 복도 끝까지 간다.<br>다 올라간 뒤에 서둘러 지나갔다.`
            : pick === 'prop' ? `소화기를 괴어 둔다.<br><br>셔터가 그 위에 얹힌다. 무게가 실리는 소리가 난다.<br>차례로 지나간다. 마지막 사람이 소화기를 뺐다.`
            : `기어서 지나간다.<br><br>등이 셔터에 닿는다. 차갑다.<br>중간에 옷이 걸려 한 번 멈췄다. 그때가 제일 길었다.`;
        darkRun.success++;
    } else {
        darkRun.fail++;
        addInfect(8, '셔터 통과 실패');
        applyPollutionToUser(currentUser, 6);
        txt = `셔터가 내려왔다.<br><br>어깨를 눌렀다. 빠져나오는 데 시간이 걸렸다.<br>그 사이 무언가 발목을 잡았다. 차서 떼어 냈다.`;
    }
    darkRun.log.push(`[기믹 3] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 3 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 4: 소리 추적 (감각) ---
function s010G4() {
    renderChoiceStep("기믹 4 — 소리",
        `복도 전체에서 소리가 난다.<br><br>
         전부 같은 소리는 아니다. 섞여 있다.<br>
         그중 하나는 사람의 것이다. 구분해 내야 한다.<br><br>
         <span style="color:#888; font-size:11px;">◈ 감각이 유리합니다.</span>`,
        [
            { id:'listen', label:'① 벽에 귀를 대고 가른다.',  fn:'s010G4R', arg:'listen' },
            { id:'call',   label:'② 이쪽에서 불러 본다.',     fn:'s010G4R', arg:'call' },
            { id:'ignore', label:'③ 전부 무시하고 지나간다.', fn:'s010G4R', arg:'ignore' }
        ], null);
}
function s010G4R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense');
    const DC = s010DC({ listen: 11, call: 16, ignore: 13 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 1;
        txt = pick === 'listen' ? `벽에 귀를 댄다.<br><br>층층이 들린다. 끄는 소리, 긁는 소리, 그리고 숨소리.<br>숨소리는 하나뿐이다. 왼쪽 세 번째 문.<br><br>그쪽은 피해 가기로 한다.`
            : pick === 'call' ? `작게 불러 본다.<br><br>대답이 왔다. 사람 목소리다.<br>다만 대답이 너무 빨랐다. 기다리고 있었던 것처럼.<br><br>그쪽으로는 가지 않았다.`
            : `전부 무시한다.<br><br>듣지 않으면 없는 것과 같다고, 스스로에게 설명한다.<br>설명이 잘 됐다.`;
    } else {
        darkRun.fail++;
        addInfect(5, '소리 판별 실패');
        txt = `잘못 짚었다.<br><br>사람 소리라고 생각한 쪽에서 나온 것은 사람이 아니었다.<br>사람 소리를 내는 법을 알고 있을 뿐이었다.`;
    }
    darkRun.log.push(`[기믹 4] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 4 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 5: 바리케이드 (파괴) ---
function s010G5() {
    renderChoiceStep("기믹 5 — 바리케이드",
        `문을 막아야 한다.<br><br>
         쓸 만한 것은 많은데 시간이 없다.<br>
         튼튼하게 쌓으면 오래 걸리고, 빨리 쌓으면 약하다.<br><br>
         <span style="color:#888; font-size:11px;">✧ 파괴가 유리합니다.</span>`,
        [
            { id:'solid', label:'① 시간을 들여 단단히 쌓는다.', fn:'s010G5R', arg:'solid' },
            { id:'quick', label:'② 되는 대로 빨리 막는다.',     fn:'s010G5R', arg:'quick' },
            { id:'weld',  label:'③ 경첩 자체를 망가뜨린다.',    fn:'s010G5R', arg:'weld' }
        ], "step2");
}
function s010G5R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'break');
    const DC = s010DC({ solid: 14, quick: 10, weld: 13 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    if (ok) {
        darkRun.success++;
        darkRun.s010Barricade = pick === 'solid' ? 3 : pick === 'weld' ? 2 : 1;
    } else {
        darkRun.fail++;
        darkRun.s010Barricade = 0;
    }

    const txt = ok
        ? (pick === 'solid' ? `책상, 캐비닛, 침상 프레임까지 얹는다.<br><br>손이 여럿이라 생각보다 빨랐다.<br>밀어 보니 꿈쩍도 안 한다.`
          : pick === 'weld' ? `경첩을 부순다. 문이 틀에 끼인 채로 굳었다.<br><br>여는 것보다 부수는 게 어려워졌다.<br>저쪽도 그럴 것이다.`
          : `되는 대로 밀어 붙인다.<br><br>모양은 엉망인데 일단 막혔다.<br>얼마나 버틸지는 모르겠다.`)
        : `쌓다가 무너뜨렸다.<br><br>소리가 크게 났다. 바깥에서 반응이 왔다.<br>다시 쌓을 시간은 없다.`;

    darkRun.log.push(`[기믹 5] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 5 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 6: 응급처치 (치유) ---
function s010G6() {
    renderChoiceStep("기믹 6 — 물린 자리",
        `팔뚝에 자국이 있다.<br><br>
         깊지는 않다. 다만 가장자리가 검게 죽어 가고 있다.<br>
         지금 처치하면 진행이 늦어진다. 아마도.<br><br>
         <span style="color:#888; font-size:11px;">❋ 치유가 유리합니다.</span>`,
        [
            { id:'clean', label:'① 소독하고 붕대를 감는다.',   fn:'s010G6R', arg:'clean' },
            { id:'burn',  label:'② 불로 지진다.',              fn:'s010G6R', arg:'burn' },
            { id:'cut',   label:'③ 물린 부위를 도려낸다.',     fn:'s010G6R', arg:'cut' },
            { id:'leave', label:'④ 그냥 둔다.',                fn:'s010G6R', arg:'leave' }
        ], null);
}
function s010G6R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + Math.round(gearValue(currentUser, 'heal') * 10);
    const DC =s010DC( { clean: 10, burn: 14, cut: 17, leave: 0 }[pick]);
    const ok = pick === 'leave' ? false : (roll !== 1 && (roll + bonus) >= DC);

    let txt;
    if (pick === 'leave') {
        addInfect(12, '처치하지 않음');
        darkRun.fail++;
        txt = `그냥 둔다.<br><br>지금은 아프지 않다. 그게 더 나쁜 신호라는 걸 안다.<br>소매를 내려 덮는다.`;
    } else if (ok) {
        const cut = { clean: 4, burn: 9, cut: 15 }[pick];
        darkRun.infect = Math.max(0, getInfect() - cut);
        renderInfectBar(); syncInfect();
        darkRun.success++;
        txt = pick === 'clean' ? `소독약을 붓는다. 숨을 참는다.<br><br>붕대를 감는다. 감는 손이 떨려서 두 번 다시 감았다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`
            : pick === 'burn' ? `라이터를 댄다.<br><br>소리를 내지 않으려고 옷자락을 물었다.<br>냄새가 한참 남았다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`
            : `도려낸다.<br><br>깊게, 한 번에. 망설이면 못 한다.<br>피가 많이 났다. 그래도 검은 부분은 없어졌다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`;
        if (pick !== 'clean') applyPollutionToUser(currentUser, pick === 'cut' ? 12 : 7);
    } else {
        darkRun.fail++;
        addInfect(7, '처치 실패');
        applyPollutionToUser(currentUser, 8);
        txt = `손이 미끄러졌다.<br><br>상처가 더 벌어졌다. 붕대가 금방 젖는다.<br>이걸로는 안 될 것 같다.`;
    }
    darkRun.log.push(`[기믹 6] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 6 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 7: 보급 상자 (행운) ---
function s010G7() {
    renderChoiceStep("기믹 7 — 남은 상자",
        `상자가 셋 남아 있다.<br><br>
         전부 열 시간은 없다. 하나만 고를 수 있다.<br>
         겉으로는 구분이 안 된다.<br><br>
         <span style="color:#888; font-size:11px;">✺ 행운이 유리합니다.</span>`,
        [
            { id:'a', label:'① 가장 무거운 것.',       fn:'s010G7R', arg:'a' },
            { id:'b', label:'② 봉인이 뜯긴 것.',       fn:'s010G7R', arg:'b' },
            { id:'c', label:'③ 구석에 밀려 있던 것.',  fn:'s010G7R', arg:'c' }
        ], null);
}
function s010G7R(pick) {
    const luck = gearValue(currentUser, 'luck');
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + Math.round(luck * 12);
    const DC = s010DC(12);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        const gain = ['덜 마른 붕대', '검역용 볼트'][Math.floor(Math.random() * 2)];
        currentUser.inventory.push(gain);
        darkRun.modifier = (darkRun.modifier || 0) + 1;
        txt = `열어 본다.<br><br>쓸 만한 것이 들어 있다.<br>누군가 챙겨 두고 가져가지 못한 것이다.<br><br><span style="color:#4CAF50;">✦ ${gain} 획득</span>`;
    } else {
        darkRun.fail++;
        addInfect(4, '빈 상자');
        txt = `열어 본다.<br><br>비어 있다. 정확히 말하면 비어 있지 않다.<br>안쪽에 뭔가 웅크리고 있었고, 열자마자 튀어나왔다.<br><br>겨우 밀어냈다.`;
    }
    darkRun.log.push(`[기믹 7] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 7 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 8: 냄새 차단 (은신) ---
function s010G8() {
    renderChoiceStep("기믹 8 — 냄새",
        `저것들이 냄새로 찾는다.<br><br>
         피 냄새, 땀 냄새, 살아 있는 것의 냄새.<br>
         지울 방법이 몇 가지 있는데 전부 대가가 있다.<br><br>
         <span style="color:#888; font-size:11px;">◐ 은신이 유리합니다.</span>`,
        [
            { id:'chem',  label:'① 소독약을 뒤집어쓴다.',     fn:'s010G8R', arg:'chem' },
            { id:'blood', label:'② 저것들의 피를 바른다.',    fn:'s010G8R', arg:'blood' },
            { id:'cold',  label:'③ 냉장고에 들어갔다 나온다.', fn:'s010G8R', arg:'cold' }
        ], null);
}
function s010G8R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide');
    const DC =s010DC( { chem: 10, blood: 13, cold: 12 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        setQFlag('s010_masked', true);
        txt = pick === 'chem' ? `소독약을 머리부터 붓는다.<br><br>눈이 맵고 목이 탄다. 한참 기침했다.<br>그래도 냄새는 확실히 지워졌다.`
            : pick === 'blood' ? `쓰러진 것에서 긁어 바른다.<br><br>미지근하다. 그게 제일 견디기 어려웠다.<br><br>지나가는 동안 아무도 돌아보지 않았다.`
            : `냉장고에 들어간다. 문을 닫고 센다.<br><br>백까지 세고 나왔다. 손끝이 하얗다.<br>체온이 낮으면 덜 알아본다는 말이 있었다.`;
        if (pick === 'blood') addInfect(8, '피를 바름');
        if (pick === 'cold') applyPollutionToUser(currentUser, 6);
    } else {
        darkRun.fail++;
        addInfect(5, '냄새 차단 실패');
        txt = `제대로 안 됐다.<br><br>지나가는 길에 하나가 고개를 돌렸다.<br>코를 벌름거린다. 아직 확신은 못 한 눈치다.`;
    }
    darkRun.log.push(`[기믹 8] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 8 — 결과", roll, bonus, DC, ok, txt);
}

function s010DC(base) {
    return base + 5;
}

function s010Result(title, roll, bonus, DC, ok, txt) {
    if (ok) darkRun._s010Streak = 0;
    else darkRun._s010Streak = (darkRun._s010Streak || 0) + 1;

    if (!ok && darkRun._s010Streak >= 3) {
        darkRun.fail += 2;
        darkDeath(
            `세 번째다.<br><br>` +
            `계속 어긋난다. 손이 늦고, 판단이 늦고, 발이 늦다.<br>` +
            `그걸 저쪽도 알아차렸다.<br><br>` +
            `몰려온다. 이번에는 한 방향이 아니다.`
        );
        return;
    }

    if (s010CheckWipe('result')) return;

    darkBodyEl().innerHTML = darkBox(title,
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
        infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
    renderInfectBar();
    mountDarkChat('normal');
}

// --- 기믹 9: 단독 돌파 (회피) ---
function s010G9() {
    renderChoiceStep("기믹 9 — 혼자",
        `혼자다.<br><br>
         앞이 막혔다. 둘. 좁은 통로라 피할 자리가 없다.<br>
         뒤도 막혔다. 방금 지나온 곳에서 소리가 난다.<br><br>
         <span style="color:#888; font-size:11px;">✦ 회피가 유리합니다.</span>`,
        [
            { id:'slide', label:'① 바닥으로 미끄러져 지나간다.', fn:'s010G9R', arg:'slide' },
            { id:'climb', label:'② 선반을 타고 넘는다.',         fn:'s010G9R', arg:'climb' },
            { id:'push',  label:'③ 밀치고 뚫는다.',              fn:'s010G9R', arg:'push' }
        ], null);
}
function s010G9R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide') + Math.round(gearValue(currentUser, 'evade') * 14);
    const DC =s010DC( { slide: 13, climb: 12, push: 16 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'slide' ? `무릎을 접고 바닥으로 미끄러진다.<br><br>다리 사이로 빠져나간다. 발목을 스쳤지만 잡히지 않았다.<br>일어나서 뒤를 안 봤다.`
            : pick === 'climb' ? `선반에 발을 건다. 흔들린다.<br><br>위로 올라가 반대편으로 뛰어내린다.<br>착지할 때 소리가 났지만 이미 지나온 뒤였다.`
            : `어깨로 밀친다.<br><br>하나가 넘어졌다. 넘어진 채로 팔을 뻗는다.<br>그 손을 밟고 지나갔다.`;
    } else if (roll === 1) {
        darkRun.fail += 2;
        addInfect(20, '통로에서 붙잡힘');
        applyPollutionToUser(currentUser, 12);
        txt = `잡혔다.<br><br>둘이 동시에 달려들었다. 벽에 밀린다.<br>목을 막았는데 팔을 물렸다.<br><br>빠져나오긴 했다. 팔이 뜨겁다.`;
    } else {
        darkRun.fail++;
        addInfect(10, '돌파 실패');
        txt = `지나가긴 했다.<br><br>옷이 찢어지고 어깨가 긁혔다.<br>긁힌 건지 물린 건지 지금은 구분이 안 간다.`;
    }
    darkRun.log.push(`[기믹 9] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 9 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 10: 무전 (연결) ---
function s010G10() {
    renderChoiceStep("기믹 10 — 무전",
        `무전기가 지직거린다.<br><br>
         주파수를 맞춰야 동료와 닿는다.<br>
         맞추는 동안 소리가 새어 나간다. 저것들도 듣는다.<br><br>
         <span style="color:#888; font-size:11px;">⊙ 연결이 유리합니다.</span>`,
        [
            { id:'tune',  label:'① 천천히 주파수를 훑는다.',   fn:'s010G10R', arg:'tune' },
            { id:'code',  label:'② 두드림으로 신호를 보낸다.', fn:'s010G10R', arg:'code' },
            { id:'shout', label:'③ 볼륨을 올려 부른다.',       fn:'s010G10R', arg:'shout' }
        ], null);
}
function s010G10R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('rejoin');
    const DC = s010DC({ tune: 12, code: 10, shout: 16 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        setQFlag('s010_radio', true);
        txt = pick === 'code' ? `무전기 몸체를 두드린다. 세 번, 쉬고, 두 번.<br><br>같은 박자가 돌아온다. 살아 있다.<br>위치까지는 모르겠지만, 방향은 알겠다.`
            : pick === 'tune' ? `다이얼을 아주 천천히 돌린다.<br><br>세 번째에서 걸렸다. 목소리다. 아는 목소리다.<br>이름을 말하기 전에 서로 알아봤다.`
            : `볼륨을 올려 부른다.<br><br>대답이 왔다. 크게 왔다.<br>그리고 복도 끝에서 뭔가가 그쪽으로 몰려가는 소리도 같이 들렸다.`;
        if (pick === 'shout') addInfect(6, '무전 노출');
    } else {
        darkRun.fail++;
        darkRun.modifier = (darkRun.modifier || 0) - 1;
        txt = `대답이 없다.<br><br>아니, 대답 비슷한 것이 왔다.<br>말이 아니라 숨소리였다. 젖어 있었다.<br><br>무전기를 껐다.`;
    }
    darkRun.log.push(`[기믹 10] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 10 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 11: 어둠 속 이동 (감각) ---
function s010G11() {
    renderChoiceStep("기믹 11 — 비상등",
        `비상등이 일정한 간격으로 깜빡인다.<br><br>
         밝을 때 보면 아무것도 없고, 어두울 때 뭔가 움직인다.<br>
         깜빡이는 주기에 맞춰 움직여야 한다.<br><br>
         <span style="color:#888; font-size:11px;">◈ 감각이 유리합니다.</span>`,
        [
            { id:'beat',  label:'① 주기를 세고 맞춰 움직인다.', fn:'s010G11R', arg:'beat' },
            { id:'dark',  label:'② 어두울 때만 움직인다.',      fn:'s010G11R', arg:'dark' },
            { id:'light', label:'③ 밝을 때만 움직인다.',        fn:'s010G11R', arg:'light' },
            { id:'blind', label:'④ 눈을 감고 소리로 간다.',     fn:'s010G11R', arg:'blind' }
        ], "step3");
}
function s010G11R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense');
    const DC = s010DC({ beat: 12, dark: 15, light: 11, blind: 14 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'beat' ? `센다. 하나, 둘, 셋에 꺼지고 다섯에 켜진다.<br><br>박자에 맞춰 세 걸음씩 옮긴다.<br>끝까지 어긋나지 않았다.`
            : pick === 'light' ? `밝을 때만 움직인다.<br><br>보이는 동안만 걷는다. 그게 제일 마음이 놓인다.<br>다만 이쪽도 보인다는 뜻이었다. 운이 좋았다.`
            : pick === 'dark' ? `어두울 때 움직인다.<br><br>앞이 안 보여서 두 번 부딪혔다. 둘 다 벽이었다.<br>세 번째는 벽이 아니었는데, 그쪽도 놀란 것 같았다.`
            : `눈을 감는다.<br><br>발소리와 숨소리만으로 방향을 잡는다.<br>어둠 속에서 눈을 뜨고 있는 것보다 낫다.`;
    } else {
        darkRun.fail++;
        addInfect(9, '비상등 구간 실패');
        applyPollutionToUser(currentUser, 7);
        txt = `박자를 놓쳤다.<br><br>불이 켜졌을 때 한가운데 서 있었다.<br>전부 이쪽을 보고 있었다.<br><br>불이 다시 꺼졌고, 그때부터는 뛰었다.`;
    }
    darkRun.log.push(`[기믹 11] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 11 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 12: 물린 동료 (치유) ---
function s010G12() {
    renderChoiceStep("기믹 12 — 물린 동료",
        `동료가 팔을 붙잡고 있다.<br><br>
         물렸다. 본인도 안다. 말을 안 할 뿐이다.<br>
         지금 손을 쓰면 늦출 수 있다. 시간이 걸린다.<br><br>
         <span style="color:#888; font-size:11px;">❋ 치유가 유리합니다.</span>`,
        [
            { id:'treat', label:'① 시간을 들여 처치한다.',   fn:'s010G12R', arg:'treat' },
            { id:'quick', label:'② 붕대만 감고 간다.',       fn:'s010G12R', arg:'quick' },
            { id:'leave', label:'③ 두고 간다.',              fn:'s010G12R', arg:'leave' }
        ], null);
}
function s010G12R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + Math.round(gearValue(currentUser, 'heal') * 12);
    const DC =s010DC( { treat: 13, quick: 9, leave: 0 }[pick]);
    const ok = pick === 'leave' ? false : (roll !== 1 && (roll + bonus) >= DC);

    let txt;
    if (pick === 'leave') {
        darkRun.fail++;
        darkRun.modifier = (darkRun.modifier || 0) - 2;
        applyPollutionToUser(currentUser, 10);
        txt = `두고 간다.<br><br>붙잡지 않았다. 부르지도 않았다.<br>그쪽도 따라오지 않았다.<br><br>모퉁이를 돌기 전에 한 번 돌아봤다. 같은 자리에 앉아 있었다.`;
        if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원이 동료를 두고 왔습니다.`, true);
    } else if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        if (darkRun.isParty && database) {
            database.ref(`darkParties/${darkRun.partyId}/heals`).push({
                by: currentUser.name, at: Date.now(), amount: 14
            });
        }
        txt = pick === 'treat' ? `소독하고, 죽은 살을 걷어내고, 다시 감는다.<br><br>오래 걸렸다. 그동안 아무 말도 안 했다.<br>끝나고 나서 고맙다는 말도 없었다. 그게 편했다.`
            : `붕대만 빠르게 감는다.<br><br>완전하지 않다는 걸 둘 다 안다.<br>그래도 안 하는 것보다는 낫다.`;
    } else {
        darkRun.fail++;
        txt = `손이 늦었다.<br><br>감는 동안에도 검은 자국이 번진다.<br>번지는 속도가 눈에 보인다는 게 이상했다.`;
    }
    darkRun.log.push(`[기믹 12] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 12 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 13: 명단 대조 (응시) ---
function s010G13() {
    renderChoiceStep("기믹 13 — 명단",
        `주워 온 명찰과 근무 명단을 맞춰 본다.<br><br>
         사번이 맞아떨어지지 않는 것이 하나 있다.<br>
         우리 것도 아니고, 쓰러진 것들 것도 아니다.<br><br>
         <span style="color:#888; font-size:11px;">❂ 응시가 유리합니다.</span>`,
        [
            { id:'trace', label:'① 사번을 거슬러 올라간다.',   fn:'s010G13R', arg:'trace' },
            { id:'ask',   label:'② 일행에게 물어본다.',        fn:'s010G13R', arg:'ask' },
            { id:'drop',  label:'③ 명찰을 버린다.',            fn:'s010G13R', arg:'drop' }
        ], null);
}
function s010G13R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'gaze')
        + (qFlag('s010_tags') ? 6 : 0);
    const DC = s010DC({ trace: 13, ask: 11, drop: 0 }[pick]);
    const ok = pick === 'drop' ? false : (roll !== 1 && (roll + bonus) >= DC);

    let txt;
    if (pick === 'drop') {
        txt = `버린다.<br><br>알아서 좋을 게 없다고 생각했다.<br>버린 자리를 한 번 더 봤다. 명찰이 없었다.<br><br>누가 주워 갔다.`;
        addInfect(5, '명찰 유기');
        darkRun.fail++;
    } else if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        setQFlag('s010_roster', true);
        txt = pick === 'trace' ? `사번 앞자리를 본다. 검역반 소속이다.<br><br>검역반은 이 층에 배치된 적이 없다.<br>그럼 왜 여기 있었나.<br><br><span style="color:#d4af37;">이후 감염체 식별 판정에 보정이 붙는다.</span>`
            : `일행에게 보여준다.<br><br>다들 모른다고 한다. 한 사람이 조금 늦게 대답했다.<br>늦은 만큼만 기억해 두기로 한다.<br><br><span style="color:#d4af37;">이후 지목 판정에 보정이 붙는다.</span>`;
    } else {
        darkRun.fail++;
        txt = `맞춰 보다 포기한다.<br><br>숫자가 자꾸 어긋난다. 세 번 세었는데 세 번 다 다르다.<br>명찰을 주머니에 도로 넣었다.`;
    }
    darkRun.log.push(`[기믹 13] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 13 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 14: 감염체 식별 (감각) ---
function s010G14() {
    const hint = qFlag('s010_roster');
    renderChoiceStep("기믹 14 — 구분",
        `일행 중 하나가 이상하다.<br><br>
         걸음이 반 박자 늦고, 말수가 줄었고, 소매를 안 걷는다.<br>
         전부 그럴 수 있는 이유가 있다. 그게 문제다.<br><br>
         ${hint ? '<span style="color:#d4af37;">명단에서 본 것이 떠오른다.</span><br><br>' : ''}
         <span style="color:#888; font-size:11px;">◈ 감각이 유리합니다. 증상기라면 더 잘 보입니다.</span>`,
        [
            { id:'smell', label:'① 냄새로 가린다.',         fn:'s010G14R', arg:'smell' },
            { id:'pulse', label:'② 맥을 짚어 본다.',        fn:'s010G14R', arg:'pulse' },
            { id:'talk',  label:'③ 말을 걸어 반응을 본다.', fn:'s010G14R', arg:'talk' },
            { id:'skip',  label:'④ 확인하지 않는다.',       fn:'s010G14R', arg:'skip' }
        ], null);
}
function s010G14R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('detect') + (qFlag('s010_roster') ? 3 : 0);
    const DC = s010DC({ smell: 12, pulse: 11, talk: 14, skip: 0 }[pick]);
    const ok = pick === 'skip' ? false : (roll !== 1 && (roll + bonus) >= DC);

    let txt;
    if (pick === 'skip') {
        darkRun.fail++;
        addInfect(8, '확인 회피');
        txt = `확인하지 않는다.<br><br>알게 되면 뭔가 해야 하니까.<br>모르는 동안은 아무것도 안 해도 된다.<br><br>그렇게 한 시간쯤 더 걸었다.`;
    } else if (ok) {
        darkRun.success++;
        setQFlag('s010_marked', true);
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        txt = pick === 'pulse' ? `손목을 잡는다. 맥이 없다.<br><br>없는 게 아니라, 너무 느려서 셀 수가 없다.<br>잡은 손을 놓지 않은 채로 눈을 마주쳤다.<br><br>상대가 먼저 웃었다.`
            : pick === 'smell' ? `가까이 선다. 냄새가 다르다.<br><br>소독약 아래에 다른 게 깔려 있다. 익숙한 냄새다.<br>복도에서 맡았던 것과 같다.`
            : `아무 말이나 건다. 어제 뭐 먹었냐고.<br><br>대답이 왔다. 정확한 대답이었다.<br>그런데 대답하기 전에 한 박자 멈췄다.<br>기억을 찾은 게 아니라, 계산한 시간이었다.`;
    } else {
        darkRun.fail++;
        txt = `구분이 안 간다.<br><br>다들 지쳐 있고, 다들 말수가 줄었고, 다들 어딘가 다쳤다.<br>이 상태에서 뭘 어떻게 가려낸다는 건가.`;
    }
    darkRun.log.push(`[기믹 14] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 14 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 15: 제압 (파괴) ---
function s010G15() {
    renderChoiceStep("기믹 15 — 제압",
        `넘어간 것이 달려든다.<br><br>
         아까까지 같이 걷던 사람이다.<br>
         멈춰야 한다. 멈추는 방법은 몇 가지뿐이다.<br><br>
         <span style="color:#888; font-size:11px;">✧ 파괴가 유리합니다.</span>`,
        [
            { id:'hold',  label:'① 눌러서 묶는다.',           fn:'s010G15R', arg:'hold' },
            { id:'bolt',  label:'② 검역용 볼트를 쓴다.',      fn:'s010G15R', arg:'bolt' },
            { id:'flee',  label:'③ 문을 닫고 달아난다.',      fn:'s010G15R', arg:'flee' }
        ], null);
}
function s010G15R(pick) {
    if (pick === 'bolt') {
        const has = (currentUser.inventory || []).includes('검역용 볼트');
        if (!has) {
            showCustomAlert('검역용 볼트가 없습니다.');
            s010G15();
            return;
        }
        removeItemFromInventory(currentUser, '검역용 볼트', 1);
        darkRun.success += 2;
        darkRun.log.push(`[기믹 15] 볼트 사용`);
        s010Result("기믹 15 — 결과", 20, 0, 0, true,
            `볼트를 관자놀이에 댄다.<br><br>
             한 번에 끝났다. 소리도 거의 안 났다.<br>
             이런 용도로 만든 물건이라는 걸 그제야 알았다.<br><br>
             바닥에 눕힌다. 눈을 감겨 주려다 말았다.<br>
             이미 감고 있었다.`);
        return;
    }

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'break');
    const DC =s010DC( { hold: 21, flee: 16 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'hold' ? `덮쳐서 바닥에 누른다.<br><br>힘이 사람 것이 아니다. 관절이 꺾이는데도 계속 밀어붙인다.<br>셋이 붙어서 겨우 묶었다.<br><br>묶인 채로 계속 이쪽을 본다.`
            : `문을 닫는다.<br><br>손이 문틈에 끼었다. 더 세게 닫았다.<br>안쪽에서 계속 두드린다. 박자가 일정하다.<br><br>멀어질 때까지 그 소리가 따라왔다.`;
    } else {
        darkRun.fail++;
        addInfect(16, '제압 실패');
        applyPollutionToUser(currentUser, 10);
        txt = `밀렸다.<br><br>목을 막았는데 손목을 물렸다.<br>떼어내는 데 시간이 걸렸다. 이가 깊게 박혀 있었다.`;
    }
    darkRun.log.push(`[기믹 15] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 15 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 16: 검역 기록 (응시) ---
function s010G16() {
    renderChoiceStep("기믹 16 — 기록",
        `검사 기록이 벽 한 면을 채우고 있다.<br><br>
         전부 음성이다. 한 장도 빠짐없이.<br>
         마지막 기록은 새벽 세 시에 멈춰 있다.<br><br>
         <span style="color:#888; font-size:11px;">❂ 응시가 유리합니다.</span>`,
        [
            { id:'count', label:'① 장수를 센다.',              fn:'s010G16R', arg:'count' },
            { id:'time',  label:'② 시각 순서를 따져 본다.',     fn:'s010G16R', arg:'time' },
            { id:'stamp', label:'③ 도장을 대조한다.',          fn:'s010G16R', arg:'stamp' }
        ], "step4");
}
function s010G16R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'gaze');
    const DC = s010DC({ count: 12, time: 13, stamp: 11 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        setQFlag('s010_record', true);
        txt = pick === 'count' ? `센다. 스물세 장.<br><br>근무 인원은 스물셋이었다. 전원 음성.<br>그런데 명단에는 스물넷이 적혀 있다.<br><br>검사받지 않은 사람이 하나 있었다.`
            : pick === 'time' ? `시각을 따라간다.<br><br>10분 간격으로 찍혀 있다. 규칙적이다.<br>딱 한 군데, 2시 40분과 3시 사이가 비어 있다.<br><br>그 20분에 무슨 일이 있었다.`
            : `도장을 대조한다.<br><br>전부 같은 도장인데, 세 장만 각도가 다르다.<br>왼손으로 찍은 것이다.<br><br>검역관은 오른손잡이였다.`;
    } else {
        darkRun.fail++;
        txt = `읽다가 눈이 흐려진다.<br><br>글자가 겹쳐 보인다. 같은 문장이 반복되는 것 같기도 하다.<br>오래 본 탓이라고 생각하기로 한다.`;
        addInfect(4, '기록 판독 실패');
    }
    darkRun.log.push(`[기믹 16] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 16 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 17: 소독실 (치유) ---
function s010G17() {
    renderChoiceStep("기믹 17 — 소독실",
        `소독실을 통과해야 한다.<br><br>
         안개처럼 뿌옇다. 약품이 계속 분사된다.<br>
         오래 있으면 폐가 상하고, 빨리 지나면 덜 씻긴다.<br><br>
         <span style="color:#888; font-size:11px;">❋ 치유가 유리합니다.</span>`,
        [
            { id:'full',  label:'① 끝까지 서서 다 맞는다.',   fn:'s010G17R', arg:'full' },
            { id:'half',  label:'② 절반만 맞고 지나간다.',    fn:'s010G17R', arg:'half' },
            { id:'hold',  label:'③ 숨을 참고 뛴다.',          fn:'s010G17R', arg:'hold' }
        ], null);
}
function s010G17R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + Math.round(gearValue(currentUser, 'heal') * 10);
    const DC =s010DC( { full: 14, half: 11, hold: 12 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        const cut = { full: 16, half: 8, hold: 5 }[pick];
        darkRun.infect = Math.max(0, getInfect() - cut);
        renderInfectBar(); syncInfect();
        txt = pick === 'full' ? `끝까지 선다.<br><br>눈을 뜰 수 없다. 목이 타고 피부가 따갑다.<br>이 분을 세었다. 두 번 세었다.<br><br>나오니 팔의 검은 자국이 옅어져 있다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`
            : pick === 'half' ? `절반만 맞고 나온다.<br><br>충분하지 않다는 걸 안다. 그래도 시간이 없다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`
            : `숨을 참고 달린다.<br><br>옷만 젖었다. 피부까지는 안 닿았다.<br><br><span style="color:#4CAF50;">감염도 -${cut}</span>`;
        if (pick === 'full') applyPollutionToUser(currentUser, 8);
    } else {
        darkRun.fail++;
        applyPollutionToUser(currentUser, 10);
        txt = `분사기가 멈춘다.<br><br>중간에서 멎었다. 약품이 다 떨어진 것이다.<br>반쯤 젖은 채로 나왔다. 아무것도 씻기지 않았다.`;
    }
    darkRun.log.push(`[기믹 17] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 17 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 18: 격벽 (파괴) ---
function s010G18() {
    renderChoiceStep("기믹 18 — 격벽",
        `격벽이 완전히 내려와 있다.<br><br>
         수동 핸들이 있는데 뻑뻑하다. 둘이 붙어도 느리다.<br>
         올라가는 틈으로 저쪽 것들이 손을 넣는다.<br><br>
         <span style="color:#888; font-size:11px;">✧ 파괴가 유리합니다.</span>`,
        [
            { id:'crank', label:'① 핸들을 끝까지 돌린다.',     fn:'s010G18R', arg:'crank' },
            { id:'half',  label:'② 기어갈 만큼만 올린다.',     fn:'s010G18R', arg:'half' },
            { id:'break', label:'③ 잠금 장치를 부순다.',       fn:'s010G18R', arg:'break' }
        ], null);
}
function s010G18R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'break') * 2;
    const DC = s010DC({ crank: 15, half: 11, break: 13 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'crank' ? `끝까지 돌린다.<br><br>손바닥이 벗겨진다. 교대로 돌렸다.<br>다 올라간 뒤에 전원이 한 번에 지나갔다.<br><br>뒤에서 다시 내렸다. 손이 몇 개 끼었다.`
            : pick === 'half' ? `한 뼘만 올린다.<br><br>한 명씩 기어서 지나간다. 마지막 사람이 제일 오래 걸렸다.<br>지나가는 동안 아무도 재촉하지 않았다.`
            : `잠금 장치를 부순다.<br><br>격벽이 제 무게로 한 번에 올라갔다.<br>너무 빨리 올라가서 저쪽 것들도 놀란 것 같았다.<br>그 틈에 지나갔다.`;
    } else {
        darkRun.fail++;
        addInfect(11, '격벽 통과 실패');
        applyPollutionToUser(currentUser, 9);
        txt = `핸들이 헛돈다.<br><br>기어가 나갔다. 올라가던 격벽이 그대로 떨어진다.<br>밑에 있던 사람을 끌어내는 데 시간이 걸렸다.<br><br>그 사이에 팔을 물렸다.`;
    }
    darkRun.log.push(`[기믹 18] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 18 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 19: 환기구 (은신) ---
function s010G19() {
    renderChoiceStep("기믹 19 — 환기구",
        `환기구로 들어간다.<br><br>
         좁다. 몸을 비틀어야 들어간다. 소리가 울린다.<br>
         먼지 위에 한 줄만 쓸려 있다. 누가 먼저 지나갔다.<br><br>
         <span style="color:#888; font-size:11px;">◐ 은신이 유리합니다.</span>`,
        [
            { id:'follow', label:'① 쓸린 자국을 따라간다.',    fn:'s010G19R', arg:'follow' },
            { id:'avoid',  label:'② 다른 갈래로 간다.',        fn:'s010G19R', arg:'avoid' },
            { id:'wait',   label:'③ 먼저 소리를 들어 본다.',   fn:'s010G19R', arg:'wait' }
        ], null);
}
function s010G19R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide') + (qFlag('s010_masked') ? 3 : 0);
    const DC =s010DC( { follow: 13, avoid: 12, wait: 10 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'follow' ? `자국을 따라간다.<br><br>끝에서 멈춘다. 사람이 하나 엎드려 있다.<br>움직이지 않는다. 오래 그러고 있었던 자세다.<br><br>넘어서 지나간다. 손이 닿았는데 차가웠다.`
            : pick === 'avoid' ? `다른 갈래로 튼다.<br><br>더 좁다. 어깨가 걸려 한참 못 움직였다.<br>그래도 아무것도 없었다.`
            : `멈춰서 듣는다.<br><br>앞쪽에서 긁는 소리가 난다. 규칙적이다.<br>돌아 나와서 다른 길을 찾았다. 잘한 선택이었다.`;
    } else {
        darkRun.fail++;
        addInfect(10, '환기구 실패');
        txt = `중간에서 걸렸다.<br><br>빠져나오려고 몸을 트는데 아래쪽 격자가 뜯어진다.<br>떨어졌다. 소리가 크게 났다.<br><br>일어서기 전에 뭔가가 발목을 잡았다.`;
    }
    darkRun.log.push(`[기믹 19] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 19 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 20: 무리 돌파 (회피) ---
function s010G20() {
    renderChoiceStep("기믹 20 — 복도 전체",
        `복도 끝까지 차 있다.<br><br>
         돌아갈 길은 없다. 뚫고 가야 한다.<br>
         한 번에 갈지, 나눠 갈지 정해야 한다.<br><br>
         <span style="color:#888; font-size:11px;">✦ 회피가 유리합니다.</span>`,
        [
            { id:'all',   label:'① 전원이 한 번에 달린다.',   fn:'s010G20R', arg:'all' },
            { id:'split', label:'② 둘로 나눠 시선을 끈다.',   fn:'s010G20R', arg:'split' },
            { id:'wall',  label:'③ 벽을 타고 우회한다.',      fn:'s010G20R', arg:'wall' }
        ], null);
}
function s010G20R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('hide') + Math.round(gearValue(currentUser, 'evade') * 14);
    const DC = s010DC({ all: 14, split: 12, wall: 15 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        txt = pick === 'all' ? `전원이 동시에 달린다.<br><br>부딪히고 밀리고 넘어진다. 일으켜 세울 틈은 없다.<br>끝에 도착해서 세어 보니 맞았다.<br><br>맞아서 다행이라고 생각했다.`
            : pick === 'split' ? `둘로 나뉜다. 한쪽이 소리를 내며 반대로 뛴다.<br><br>대부분이 그쪽으로 몰린다.<br>나머지가 조용히 지나간다.<br><br>소리를 낸 쪽은 한참 뒤에 합류했다.`
            : `벽의 배관을 잡고 오른다.<br><br>아래에서 손이 뻗어 올라온다. 발끝을 스친다.<br>끝까지 안 내려다봤다.`;
    } else if (roll === 1) {
        darkRun.fail += 2;
        addInfect(24, '무리에 삼켜짐');
        applyPollutionToUser(currentUser, 14);
        txt = `한가운데서 막혔다.<br><br>사방이다. 팔이 여럿, 이가 여럿.<br>빠져나온 게 기적이다.<br><br>옷이 반쯤 뜯겼고, 팔뚝에 자국이 셋 늘었다.`;
    } else {
        darkRun.fail++;
        addInfect(13, '돌파 실패');
        applyPollutionToUser(currentUser, 9);
        txt = `지나가긴 했다.<br><br>몇이 달라붙었다. 떼어내면서 갔다.<br>어깨가 뜨겁다. 보지 않기로 한다.`;
    }
    darkRun.log.push(`[기믹 20] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 20 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 21: 혼자 남은 구간 (행운) ---
function s010G21() {
    renderChoiceStep("기믹 21 — 갈림",
        `세 갈래다.<br><br>
         어느 쪽이 출구로 이어지는지 알 수 없다.<br>
         표지판은 뜯겨 있고, 바닥 자국은 세 방향 다 있다.<br><br>
         <span style="color:#888; font-size:11px;">✺ 행운이 유리합니다.</span>`,
        [
            { id:'a', label:'① 바람이 나오는 쪽.',     fn:'s010G21R', arg:'a' },
            { id:'b', label:'② 자국이 가장 많은 쪽.',  fn:'s010G21R', arg:'b' },
            { id:'c', label:'③ 아무 소리도 안 나는 쪽.', fn:'s010G21R', arg:'c' }
        ], null);
}
function s010G21R(pick) {
    const luck = gearValue(currentUser, 'luck');
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + Math.round(luck * 14);
    const DC =s010DC( 13);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        txt = `맞게 골랐다.<br><br>복도 끝에 비상구 표시가 남아 있다. 초록빛이 아직 살아 있다.<br>그쪽으로 간다. 걸음이 빨라진다.`;
    } else {
        darkRun.fail++;
        addInfect(9, '길을 잘못 듦');
        txt = `막다른 곳이다.<br><br>돌아서는데 왔던 길이 막혀 있다.<br>언제부터인지 모르겠다.<br><br>다른 길을 찾는 데 시간이 걸렸다.`;
    }
    darkRun.log.push(`[기믹 21] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 21 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 22: 마지막 합류 (연결) ---
function s010G22() {
    renderChoiceStep("기믹 22 — 마지막 합류",
        `셔터 앞에서 모여야 한다.<br><br>
         흩어진 사람들이 각자 오고 있다. 신호를 맞춰야 한다.<br>
         늦으면 셔터가 닫힌 뒤에 도착한다.<br><br>
         <span style="color:#888; font-size:11px;">⊙ 연결이 유리합니다.</span>`,
        [
            { id:'radio', label:'① 무전으로 시각을 맞춘다.',  fn:'s010G22R', arg:'radio' },
            { id:'light', label:'② 불빛으로 신호한다.',       fn:'s010G22R', arg:'light' },
            { id:'wait',  label:'③ 그냥 기다린다.',           fn:'s010G22R', arg:'wait' }
        ], null);
}
function s010G22R(pick) {
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('rejoin') + (qFlag('s010_radio') ? 4 : 0);
    const DC = s010DC({ radio: 11, light: 13, wait: 15 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.modifier = (darkRun.modifier || 0) + 3;
        txt = pick === 'radio' ? `무전으로 시각을 맞춘다.<br><br>세 시 십 분. 그때 전부 셔터 앞에 선다.<br>한 명도 늦지 않았다.<br><br>그게 이상할 만큼 잘 맞았다.`
            : pick === 'light' ? `손전등으로 신호한다. 세 번 짧게, 한 번 길게.<br><br>복도 끝에서 같은 신호가 돌아온다.<br>서로를 확인하고 나서야 숨을 쉬었다.`
            : `기다린다.<br><br>하나씩 온다. 오는 순서를 세었다.<br>마지막 사람이 올 때쯤 거의 포기하고 있었다.`;
    } else {
        darkRun.fail++;
        darkRun.modifier = (darkRun.modifier || 0) - 2;
        txt = `엇갈렸다.<br><br>도착해 보니 몇이 없다.<br>기다릴 시간은 없다. 셔터는 한 번만 열린다.<br><br>기다리기로 한 사람이 있었다. 말리지 않았다.`;
    }
    darkRun.log.push(`[기믹 22] ${pick} d20 ${roll} vs DC${DC}`);
    s010Result("기믹 22 — 결과", roll, bonus, DC, ok, txt);
}

// --- 기믹 23: 셔터 조작 (연타) ---
function s010G23() {
    const body = darkBodyEl();
    body.innerHTML = darkBox("기믹 23 — 40초",
        `버튼을 눌렀다.<br><br>
         셔터가 올라가기 시작한다. 40초 걸린다.<br>
         그동안 뒤를 막아야 한다.<br><br>
         <span style="color:#888; font-size:11px;">[버튼을 연타해 버티세요]</span>`,
        infectBarHtml() +
        `<div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:34px; font-weight:bold; color:#ff6b6b;" id="s010-time">20</div>
            <div style="font-size:11px; color:#888; margin-top:4px;">28회 필요</div>
         </div>
         <div style="width:100%; height:16px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:8px; overflow:hidden; margin-bottom:14px;">
            <div id="s010-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#7f0000,#f44336); transition:width 0.08s;"></div>
         </div>
         <button class="game-btn" id="s010-btn" style="width:100%; margin:0; padding:22px; font-size:17px; font-weight:bold; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important; touch-action:manipulation; user-select:none;" ontouchstart="event.preventDefault(); s010Tap();" onclick="s010Tap()">막는다</button>`);
    renderInfectBar();
    mountDarkChat('normal');

    darkRun._s010Count = 0;
    darkRun._s010Active = true;
    let t = 20;
    clearInterval(darkRun._s010Timer);
    darkRun._s010Timer = setInterval(() => {
        t--;
        const el = document.getElementById('s010-time');
        if (!el || !darkRun) { clearInterval(darkRun._s010Timer); return; }
        el.innerText = t;
        if (t <= 0) {
            clearInterval(darkRun._s010Timer);
            darkRun._s010Active = false;
            s010ShutterFail();
        }
    }, 1000);
}

let _s010LastTap = 0;
function s010Tap() {
    if (!darkRun || !darkRun._s010Active) return;
    const now = Date.now();
    if (now - _s010LastTap < 40) return;
    _s010LastTap = now;

    darkRun._s010Count++;
    const pct = Math.min(100, (darkRun._s010Count / 28) * 100);
    const bar = document.getElementById('s010-bar');
    if (bar) bar.style.width = pct + '%';

    if (darkRun._s010Count >= 28) {
        darkRun._s010Active = false;
        clearInterval(darkRun._s010Timer);
        const btn = document.getElementById('s010-btn');
        if (btn) btn.disabled = true;
        darkRun.success += 2;
        darkRun.log.push(`[기믹 23] 셔터 버팀 성공`);
        s010Result("기믹 23 — 결과", 20, 0, 0, true,
            `버텼다.<br><br>
             팔이 감각이 없다. 어깨가 빠질 것 같다.<br>
             셔터가 어깨 높이까지 올라왔다.<br><br>
             한 명씩 빠져나간다. 마지막까지 막고 있던 사람이 제일 늦게 나왔다.`);
    }
}

function s010ShutterFail() {
    darkRun.fail += 2;
    addInfect(20, '셔터 방어 실패');
    applyPollutionToUser(currentUser, 15);
    darkRun.log.push(`[기믹 23] 셔터 버팀 실패 (${darkRun._s010Count}/28)`);
    s010Result("기믹 23 — 결과", 1, 0, 0, false,
        `밀렸다.<br><br>
         뒤에서 밀고 들어온다. 문틈으로, 아래로, 옆으로.<br>
         셔터는 아직 올라가는 중이다.<br><br>
         물리면서 기어 나갔다. 몇 군데인지 세지 못했다.`);
}

// --- 기믹 24: 최후 판정 ---
function s010G24() {
    const inf = getInfect();
    renderChoiceStep("기믹 24 — 밖으로",
        `셔터 너머가 아침이다.<br><br>
         밖에는 사람이 있다. 출근하는 사람들, 지나가는 사람들.<br>
         지금 나가면 무엇이 같이 나가는지 아무도 모른다.<br><br>
         <span style="font-size:11px; color:${inf >= INFECT_SYMPTOM ? '#ff6b6b' : '#888'};">현재 감염도 ${inf}</span>`,
        [
            { id:'out',    label:'① 그냥 나간다.',                 fn:'s010G24R', arg:'out' },
            { id:'report', label:'② 밖에 알리고 검역을 요청한다.',  fn:'s010G24R', arg:'report' },
            { id:'close',  label:'③ 셔터를 다시 내린다.',           fn:'s010G24R', arg:'close' }
        ], null);
}
function s010G24R(pick) {
    const inf = getInfect();
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') - Math.floor(inf / 10);
    const DC = s010DC({ out: 12, report: 14, close: 17 }[pick]);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    if (pick === 'close') {
        if (ok) {
            darkRun.success += 4;
            darkRun.critical = true;
            darkRun.s010Ending = 'close';
            darkBodyEl().innerHTML = darkBox("— 닫음",
                `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll}</div>
                 셔터를 다시 내린다.<br><br>
                 안쪽에서 손이 몇 개 끼었다. 그대로 내렸다.<br>
                 밖에서 누가 소리친다. 무슨 말인지는 안 들린다.<br><br>
                 전원이 안에 남았다. 나가지 않았다.<br>
                 그게 옳은 판단이었는지는 아직도 모른다.<br><br>
                 <span style="color:#4fc3f7;">눈을 뜨니 현관 앞이다.<br>
                 뉴스에는 아무 일도 나오지 않았다. 그게 답이었다.</span>`,
                darkChoiceBtn("끝낸다.", "darkRun.step=99; renderDarkStep();"));
            mountDarkChat('normal');
        } else {
            darkDeath(
                `셔터를 내리려는데 조작반이 먹통이다.<br><br>` +
                `한 번 올라간 셔터는 끝까지 올라간다.<br>` +
                `설계가 그렇게 되어 있었다.<br><br>` +
                `밖으로 쏟아져 나간다. 막을 수가 없다.<br>` +
                `그 자리에 서서 보고 있었다. 그게 마지막이었다.`
            );
        }
        return;
    }

    let txt;
    if (ok) {
        darkRun.success += 2;
        darkRun.s010Ending = pick;
        txt = pick === 'report'
            ? `밖을 향해 소리친다. 검역이라고, 물러나라고.<br><br>
               처음엔 아무도 안 믿었다. 팔을 걷어 보이고 나서야 흩어졌다.<br><br>
               차단선이 쳐지는 데 20분 걸렸다.<br>
               그 20분 동안 아무도 우리를 건드리지 않았다.`
            : `나간다.<br><br>
               햇빛이 아프다. 눈을 가리고 걷는다.<br>
               지나가는 사람이 이상한 눈으로 본다. 그게 전부다.<br><br>
               아무 일도 일어나지 않았다.<br>
               적어도 그날은.`;
    } else {
        darkRun.fail += 2;
        darkRun.failedRun = true;
        applyPollutionToUser(currentUser, 18);
        txt = `나간다.<br><br>
               몇 걸음 못 가서 무릎이 꺾였다.<br>
               누가 부축하려고 다가온다. 밀어냈다.<br><br>
               밀어낸 손에 힘이 너무 많이 들어갔다.<br>
               그 사람이 놀란 얼굴로 손목을 감싼다.`;
    }
    darkRun.log.push(`[기믹 24] ${pick} d20 ${roll} vs DC${DC}`);
    darkBodyEl().innerHTML = darkBox("기믹 24 — 결과",
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok?'#4CAF50':'#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus>=0?'+':''}${bonus} / DC ${DC})</span></div>${txt}`,
        darkChoiceBtn("끝낸다.", "darkRun.step=99; renderDarkStep();"));
    mountDarkChat('normal');
}

// ==========================================
// ★ S-010 감염 검사
// ==========================================
const S010_CHECKS = [
    { q:'팔을 걷어 보십시오. 물린 자국이 몇 군데입니까?', a:null },
    { q:'지금 손끝에 감각이 있습니까?', a:['네','예','있다','응','yes','있음'] },
    { q:'마지막으로 먹은 것은 무엇입니까?', a:null },
    { q:'동료의 이름을 하나 적으십시오.', a:null },
    { q:'배가 고픕니까?', a:['아니오','아니요','아뇨','없다','안고프다','no','아님'] }
];

function renderS010Check(next) {
    const c = S010_CHECKS[Math.floor(Math.random() * S010_CHECKS.length)];
    darkRun._s010Ans = c.a;
    darkRun._s010Next = next;

    darkBodyEl().innerHTML = darkBox("자가 검진",
        `멈춘다.<br><br>
         규정대로라면 한 시간마다 서로를 확인해야 한다.<br>
         아무도 지키지 않던 규정인데, 지금은 다들 지킨다.<br><br>
         <span style="color:#7fd4d4; font-size:14px;">${c.q}</span>`,
        infectBarHtml() +
        `<input type="text" id="s010-check-input" maxlength="24" placeholder="" style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') submitS010Check()">
         <button class="game-btn" style="width:100%; margin:0; padding:12px;" onclick="submitS010Check()">적는다</button>`);
    renderInfectBar();
    mountDarkChat('normal');
    setTimeout(() => { const f = document.getElementById('s010-check-input'); if (f) f.focus(); }, 200);
}

function submitS010Check() {
    const el = document.getElementById('s010-check-input');
    if (!el) return;
    const v = el.value.trim();
    if (!v) { showCustomAlert('적어 주세요.'); return; }

    const ans = darkRun._s010Ans;
    const ok = (ans === null) ? true : checkQuizAnswer(v, ans);

    let txt;
    if (ok) {
        darkRun.success++;
        darkRun.infect = Math.max(0, getInfect() - 3);
        renderInfectBar(); syncInfect();
        txt = `적는다.<br><br>손이 떨리지 않았다. 그걸 확인하려고 한 검사였다.<br>다들 서로의 답을 흘끗 본다. 아무 말도 안 한다.`;
    } else {
        addInfect(10, '검진 실패');
        txt = `적으려다 멈춘다.<br><br>알던 것인데 안 나온다.<br>옆에서 기다린다. 기다리는 시간이 길어진다.<br><br>결국 아무거나 적었다.`;
    }

    darkBodyEl().innerHTML = darkBox("자가 검진", txt,
        infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun._s010Next})`));
    renderInfectBar();
    mountDarkChat('normal');
}

// ==========================================
// ★ S-010 방어전
// ==========================================
const S010_DEFENSE = {
    1: { sec:14, need:18, text:`문이 흔들린다.<br><br>바리케이드가 밀린다. 한쪽 다리가 들린다.<br>등으로 받쳐야 한다.`, label:'버틴다' },
    2: { sec:12, need:22, text:`창문이 깨진다.<br><br>손이 여럿 들어온다. 유리에 팔이 갈리는데도 계속 들어온다.<br>밀어내야 한다.`, label:'밀어낸다' },
    3: { sec:11, need:25, text:`검역소 문이 안쪽으로 휜다.<br><br>여기가 뚫리면 뒤로 물러날 곳이 없다.`, label:'막는다' },
    4: { sec:10, need:28, text:`마지막 통로다.<br><br>양쪽에서 동시에 온다. 등을 맞대고 버틴다.`, label:'버틴다' }
};

function renderS010Defense(n) {
    const d = S010_DEFENSE[n];
    if (!d) { partyAdvance(darkRun.step + 1); return; }

    const bonus = darkRun.s010Barricade || 0;
    const need = Math.max(8, d.need - bonus * 3);

    darkBodyEl().innerHTML = darkBox(`방어 ${n}`, d.text,
        infectBarHtml() +
        `<div style="text-align:center; margin-bottom:12px;">
            <div style="font-size:34px; font-weight:bold; color:#ff6b6b;" id="s010-def-time">${d.sec}</div>
            <div style="font-size:11px; color:#888; margin-top:4px;">${need}회 필요${bonus ? ` <span style="color:#4CAF50;">(바리케이드 -${bonus*3})</span>` : ''}</div>
         </div>
         <div style="width:100%; height:16px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:8px; overflow:hidden; margin-bottom:14px;">
            <div id="s010-def-bar" style="height:100%; width:0%; background:linear-gradient(90deg,#7f0000,#f44336); transition:width 0.08s;"></div>
         </div>
         <button class="game-btn" id="s010-def-btn" style="width:100%; margin:0; padding:22px; font-size:17px; font-weight:bold; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important; touch-action:manipulation; user-select:none;" ontouchstart="event.preventDefault(); s010DefTap();" onclick="s010DefTap()">${d.label}</button>`);
    renderInfectBar();
    mountDarkChat('normal');

    darkRun._defCount = 0;
    darkRun._defNeed = need;
    darkRun._defActive = true;
    let t = d.sec;
    clearInterval(darkRun._defTimer);
    darkRun._defTimer = setInterval(() => {
        t--;
        const el = document.getElementById('s010-def-time');
        if (!el || !darkRun) { clearInterval(darkRun._defTimer); return; }
        el.innerText = t;
        if (t <= 0) {
            clearInterval(darkRun._defTimer);
            darkRun._defActive = false;
            s010DefResult(false, n);
        }
    }, 1000);
}

let _defLastTap = 0;
function s010DefTap() {
    if (!darkRun || !darkRun._defActive) return;
    const now = Date.now();
    if (now - _defLastTap < 40) return;
    _defLastTap = now;

    darkRun._defCount++;
    const pct = Math.min(100, (darkRun._defCount / darkRun._defNeed) * 100);
    const bar = document.getElementById('s010-def-bar');
    if (bar) bar.style.width = pct + '%';

    if (darkRun._defCount >= darkRun._defNeed) {
        darkRun._defActive = false;
        clearInterval(darkRun._defTimer);
        const btn = document.getElementById('s010-def-btn');
        if (btn) btn.disabled = true;
        s010DefResult(true, 0);
    }
}

function s010DefResult(ok, n) {
    if (ok) {
        darkRun.success++;
        darkRun.log.push(`[방어] 성공`);
    } else {
        darkRun.fail++;
        addInfect(15, '방어 실패');
        applyPollutionToUser(currentUser, 12);
        darkRun.log.push(`[방어] 실패 (${darkRun._defCount}/${darkRun._defNeed})`);
    }

    darkBodyEl().innerHTML = darkBox("방어 — 결과",
        ok ? `밀어냈다.<br><br>
              문이 다시 닫힌다. 손 몇 개가 끼었고, 그대로 뒀다.<br>
              숨이 차서 한동안 말을 못 했다.`
           : `뚫렸다.<br><br>
              쏟아져 들어온다. 뒤로 물러나면서 쳐냈다.<br>
              어디를 물렸는지는 나중에야 알았다.`,
        infectBarHtml() + darkChoiceBtn("물러난다.", `partyAdvance(${darkRun.step + 1})`));
    renderInfectBar();
    mountDarkChat('normal');
}

// ==========================================
// ★ S-010 탐색
// ==========================================
const S010_AREAS = { storage:'보급소', clinic:'의무실', quarantine:'검역소' };

const S010_SPOTS = {
    storage: ['넘어진 선반', '잠긴 캐비닛', '천장 배관 위', '문 뒤 구석', '깨진 상자 더미'],
    clinic:  ['세 번째 침상', '약품 냉장고', '커튼 뒤', '의료 폐기물통', '간호 데스크'],
    quarantine: ['검사 기록함', '소독 장비함', '격리실 침대 밑', '방호복 걸이', '폐기 명단 서랍']
};

const S010_FINDS = [
    { name:'검역용 볼트', w:3 },
    { name:'덜 마른 붕대', w:4 },
    { name:'상비약 (오염도 -10%)', w:5 },
    { name:'마스크', w:4 },
    { name:'반창고', w:4 }
];

function renderS010Search(area) {
    if (!darkRun) return;
    darkRun._s010Area = area;
    if (!darkRun.s010Searched) darkRun.s010Searched = {};

    const used = Object.keys(darkRun.s010Searched).filter(k => k.startsWith(area + '|')).length;
    const limit = 3 + (qFlag('extra_search') ? 1 : 0);
    const left = Math.max(0, limit - used);

    const spots = S010_SPOTS[area] || [];
    const luck = gearValue(currentUser, 'luck');

    const html = spots.map(sp => {
        const key = area + '|' + sp;
        const done = darkRun.s010Searched[key];
        return `
            <div style="background:rgba(0,0,0,0.25); border:1px solid ${done ? '#333' : '#5a2a2a'}; border-radius:5px; padding:9px 11px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px; ${done ? 'opacity:0.45;' : ''}">
                <span style="font-size:11px; color:#ddd; flex:1;">${sp}
                    ${done ? `<br><span style="font-size:9px; color:#777;">${done}</span>` : ''}
                </span>
                ${done ? '' : `<button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px; flex-shrink:0;" onclick="doS010Search('${area}','${sp}')" ${left <= 0 ? 'disabled' : ''}>뒤진다</button>`}
            </div>`;
    }).join('');

    darkBodyEl().innerHTML = darkBox(S010_AREAS[area] + " — 탐색",
        `쓸 만한 것이 남아 있을지 모른다.<br><br>
         뒤지는 데는 시간이 걸리고, 시간이 걸리면 저것들이 온다.<br><br>
         <span style="font-size:11px; color:#888;">남은 탐색 ${left}회 · 1회당 감염 위험</span>`,
        infectBarHtml() + html +
        `<button class="game-btn" style="width:100%; margin-top:10px; padding:11px; font-size:12px;" onclick="partyAdvance(${darkRun.step + 1})">이 구역을 벗어난다</button>`);
    renderInfectBar();
    mountDarkChat('normal');
}

function doS010Search(area, spot) {
    if (!darkRun) return;
    const key = area + '|' + spot;
    if (darkRun.s010Searched[key]) return;

    const luck = gearValue(currentUser, 'luck');
    const roll = Math.random() + luck * 0.35;

    if (roll > 0.45) {
        let total = S010_FINDS.reduce((a, f) => a + f.w, 0);
        let r = Math.random() * total, got = S010_FINDS[0].name;
        for (const f of S010_FINDS) { r -= f.w; if (r <= 0) { got = f.name; break; } }
        currentUser.inventory.push(got);
        darkRun.s010Searched[key] = `✦ ${got}`;
        darkRun.success++;
        showDarkToast(`✦ ${got}`);
        if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원이 ${got}을(를) 찾았습니다.`, true);
    } else if (roll > 0.18) {
        darkRun.s010Searched[key] = '아무것도 없었다.';
    } else {
        darkRun.s010Searched[key] = '뭔가 튀어나왔다.';
        addInfect(11, `${S010_AREAS[area]} 탐색 중 습격`);
        applyPollutionToUser(currentUser, 6);
        showDarkToast('⚠ 안쪽에 있었다.');
    }
    saveDB();
    renderS010Search(area);
}

// ==========================================
// ★ S-010 분리 / 단독 / 합류
// ==========================================
const S010_SPLIT = {
    1: `복도가 무너진다.<br><br>
        천장 배관이 내려앉으면서 통로가 셋으로 갈린다.<br>
        어느 쪽이든 돌아 나오면 만날 수 있다. 그럴 것이다.<br><br>
        누가 어디로 갈지 정할 시간은 없다.`,
    2: `무리가 가운데를 가른다.<br><br>
        밀려나는 방향이 제각각이다. 붙잡을 틈이 없다.<br>
        각자 흩어진다.`
};

function renderS010Split(n) {
    darkBodyEl().innerHTML = darkBox(`갈림 ${n}`, S010_SPLIT[n] || S010_SPLIT[1],
        infectBarHtml() +
        darkChoiceBtn("① 왼쪽으로 간다.", `s010SplitPick(${n},'left')`) +
        darkChoiceBtn("② 가운데로 간다.", `s010SplitPick(${n},'center')`) +
        darkChoiceBtn("③ 오른쪽으로 간다.", `s010SplitPick(${n},'right')`));
    renderInfectBar();
    mountDarkChat('normal');
}

function s010SplitPick(n, v) {
    darkRun.solo = true;
    darkRun.splitPick = v;
    if (darkRun.isParty && database) {
        database.ref(`darkParties/${darkRun.partyId}/s010split${n}/${currentUser.code}`).set({
            pick: v, name: currentUser.name, at: Date.now()
        });
        database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).set({
            name: currentUser.name, at: Date.now()
        });
        sendPartyChat(`${currentUser.name} 사원이 갈라졌습니다.`, true);
    }
    darkRun.log.push(`[갈림 ${n}] ${v}`);

    darkBodyEl().innerHTML = darkBox(`갈림 ${n}`,
        `그쪽으로 간다.<br><br>
         발소리가 하나씩 멀어진다.<br>
         모퉁이를 돌기 전에 한 번 돌아봤다. 아무도 안 보고 있었다.`,
        infectBarHtml() + darkChoiceBtn("혼자 간다.", `partyAdvance(${darkRun.step + 1})`));
    renderInfectBar();
    mountDarkChat('normal');
}

const S010_SOLO = {
    1: { text:`혼자다.<br><br>복도에 물이 고여 있다. 발목까지 온다.<br>바닥이 안 보인다. 밟을 때마다 뭔가 걸린다.`,
         opts:[{l:'① 벽을 짚고 천천히 간다.',v:'wall'},{l:'② 물을 헤치고 빨리 간다.',v:'fast'},{l:'③ 뭐가 걸리는지 확인한다.',v:'check'}] },
    2: { text:`문이 하나 있다.<br><br>안쪽에서 두드리는 소리가 난다. 규칙적이다.<br>사람이 내는 박자다. 아니면 사람이었던 것이 내는 박자다.`,
         opts:[{l:'① 열어 본다.',v:'open'},{l:'② 같은 박자로 두드려 본다.',v:'knock'},{l:'③ 지나친다.',v:'pass'}] },
    3: { text:`거울이 있다. 화장실 세면대 위.<br><br>비친 얼굴을 본다. 눈 밑이 검다.<br>목덜미에 뭔가 있는 것 같아서 고개를 돌린다.`,
         opts:[{l:'① 자세히 확인한다.',v:'look'},{l:'② 보지 않고 나간다.',v:'leave'},{l:'③ 거울을 깬다.',v:'break'}] },
    4: { text:`발소리가 따라온다.<br><br>일정한 거리를 두고 계속 온다. 빨라지지도 느려지지도 않는다.<br>사람이라면 불렀을 것이다.`,
         opts:[{l:'① 멈춰 서서 확인한다.',v:'stop'},{l:'② 속도를 올린다.',v:'run'},{l:'③ 숨어서 지나보낸다.',v:'hide'}] },
    5: { text:`동료의 무전이 잡힌다.<br><br>목소리가 멀다. 위치를 말하는데 단어가 끊긴다.<br>"...삼층... 계단... 오지 마..."`,
         opts:[{l:'① 그쪽으로 간다.',v:'go'},{l:'② 다시 물어본다.',v:'ask'},{l:'③ 말대로 가지 않는다.',v:'obey'}] },
    6: { text:`막다른 곳이다.<br><br>돌아서는데 왔던 길에 뭔가 서 있다.<br>움직이지 않는다. 이쪽을 보고 있는 것 같기도 하고 아닌 것 같기도 하다.`,
         opts:[{l:'① 천천히 다가간다.',v:'near'},{l:'② 벽을 타고 돌아간다.',v:'around'},{l:'③ 달려서 지나친다.',v:'dash'}] }
};

function renderS010Solo(n) {
    const d = S010_SOLO[n];
    if (!d) { partyAdvance(darkRun.step + 1); return; }
    darkBodyEl().innerHTML = darkBox("단독 — 혼자", d.text,
        infectBarHtml() +
        d.opts.map(o => `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="s010SoloPick('${o.v}')">${o.l}</button>`).join(''));
    renderInfectBar();
    mountDarkChat('normal');
}

function s010SoloPick(v) {
    const good = ['wall','knock','leave','hide','obey','around'];
    const bad  = ['fast','open','look','stop','go','near'];

    let txt, inf = 0, mod = 0;
    if (good.includes(v)) {
        mod = 1; darkRun.success++;
        txt = `조심스럽게 움직인다.<br><br>아무 일도 일어나지 않는다.<br>여기서는 그게 성과다.`;
    } else if (bad.includes(v)) {
        mod = -1; inf = 9; darkRun.fail++;
        txt = `그렇게 한다.<br><br>무언가 이쪽을 알아차렸다.<br>거리를 좁혀 온다. 서두르지 않는 속도로.`;
    } else {
        txt = `그렇게 한다.<br><br>별일은 없었다. 시간만 지났다.`;
    }

    darkRun.modifier = (darkRun.modifier || 0) + mod;
    if (inf) addInfect(inf, `단독 ${v}`);
    darkRun.log.push(`[단독] ${v}`);

    darkBodyEl().innerHTML = darkBox("단독 — 결과", txt,
        infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
    renderInfectBar();
    mountDarkChat('normal');
}

function renderS010Rejoin(n) {
    darkBodyEl().innerHTML = darkBox(`합류 ${n}차`,
        `기척이 난다.<br><br>
         사람인지 아닌지 알 수 없다. 확인하려면 다가가야 한다.<br>
         다가가면 늦을 수도 있다.`,
        infectBarHtml() +
        darkChoiceBtn("① 이름을 부른다.", `s010RejoinPick(${n},'call')`) +
        darkChoiceBtn("② 무전으로 확인한다.", `s010RejoinPick(${n},'radio')`) +
        darkChoiceBtn("③ 그 자리에 선다.", `s010RejoinPick(${n},'stay')`) +
        darkChoiceBtn("④ 발자국을 따라간다.", `s010RejoinPick(${n},'track')`));
    renderInfectBar();
    mountDarkChat('normal');
}

function s010RejoinPick(n, v) {
    if (!darkRun.isParty || !database) {
        darkRun.solo = false;
        partyAdvance(darkRun.step + 1);
        return;
    }
    database.ref(`darkParties/${darkRun.partyId}/s010rj${n}/${currentUser.code}`).set({ pick: v, name: currentUser.name });

    setTimeout(() => {
        database.ref(`darkParties/${darkRun.partyId}/s010rj${n}`).once('value').then(snap => {
            const picks = snap.val() || {};
            const others = Object.keys(picks).filter(c => c !== currentUser.code).map(c => picks[c].pick);
            const pair = { call:'stay', stay:'call', radio:'radio', track:'stay' };
            const ok = others.some(o => pair[v] === o) || (v === 'radio' && qFlag('s010_radio'));

            let txt, mod;
            if (ok) {
                mod = 2;
                darkRun.solo = false;
                database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
                sendPartyChat(`${currentUser.name} 사원이 합류했습니다.`, true);
                txt = `만난다.<br><br>
                       얼굴을 확인한다. 두 번 확인한다.<br>
                       팔을 걷어 보여준다. 상대도 걷는다.<br><br>
                       둘 다 자국이 있었다. 아무 말도 안 했다.`;
            } else {
                mod = -1;
                addInfect(8, '합류 실패');
                txt = `아무도 없다.<br><br>
                       지나간 자국은 있는데 사람이 없다.<br>
                       같은 통로를 반대로 돌고 있었던 것 같다.`;
            }
            darkRun.modifier = (darkRun.modifier || 0) + mod;
            darkRun.log.push(`[합류 ${n}차] ${v} — ${ok ? '성공' : '실패'}`);

            darkBodyEl().innerHTML = darkBox(`합류 ${n}차 — 결과`, txt,
                infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
            renderInfectBar();
            mountDarkChat('normal');
        });
    }, 2200);

    darkBodyEl().innerHTML = darkBox(`합류 ${n}차`, `움직인다.`,
        infectBarHtml() + `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">확인하는 중...</div>`);
    renderInfectBar();
}

// ==========================================
// ★ S-010 격리 투표
// ==========================================
function renderS010Vote(n) {
    if (!darkRun.isParty) { partyAdvance(darkRun.step + 1); return; }

    const p = darkParties[darkRun.partyId];
    const alive = (p && p.alive) ? Object.keys(p.alive) : [];
    if (alive.length < 3) { partyAdvance(darkRun.step + 1); return; }

    const key = `s010v${n}`;
    const votes = (darkRun._s010Votes && darkRun._s010Votes[key]) || {};

    const opts = alive.map(c => {
        const nm = (p.members && p.members[c]) ? p.members[c].name : (db.users[c] ? db.users[c].name : c);
        const inf = s010State && s010State[c] ? s010State[c] : null;
        const tag = inf ? (inf.turned ? ' <span style="color:#7f0000;">전향</span>' : inf.v >= INFECT_SYMPTOM ? ' <span style="color:#ff9800;">증상</span>' : '') : '';
        return `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="s010Vote(${n},'${c}')">${nm}${tag}${c === currentUser.code ? ' <span style="color:#666; font-size:10px;">(본인)</span>' : ''}</button>`;
    }).join('');

    darkBodyEl().innerHTML = darkBox(`격리 ${n}차`,
        `둘러선다.<br><br>
         누구를 남길지 정해야 한다.<br>
         남겨진 사람은 문 반대편에 있게 된다.<br><br>
         <span style="font-size:11px; color:#888;">규정이 그렇다. 규정을 만든 사람은 여기 없다.</span>`,
        infectBarHtml() + opts +
        `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:11px; font-size:11px;" onclick="s010Vote(${n},'none')">아무도 남기지 않는다</button>`);
    renderInfectBar();
    mountDarkChat('normal');
}

function s010Vote(n, target) {
    let txt, mod = 0;
    if (target === 'none') {
        mod = 1;
        darkRun.success++;
        txt = `아무도 남기지 않는다.<br><br>
               전부 데리고 간다. 느려지는 걸 감수하기로 한다.<br><br>
               누가 말했다. "나중에 후회할 텐데."<br>
               후회할 일이 생기려면 나중이 있어야 한다.`;
    } else if (target === currentUser.code) {
        mod = 2;
        darkRun.success += 2;
        applyPollutionToUser(currentUser, 8);
        txt = `자기를 남기겠다고 한다.<br><br>
               말리는 사람이 있었다. 오래 말리지는 않았다.<br><br>
               문이 닫힌다. 바깥에서 잠그는 소리가 난다.<br>
               반대편 발소리가 멀어지는 걸 끝까지 들었다.<br><br>
               <span style="color:#d4af37;">한참 뒤에 다시 열렸다. 돌아온 사람이 있었다.</span>`;
    } else {
        const p = darkParties[darkRun.partyId];
        const nm = (p && p.members && p.members[target]) ? p.members[target].name : '누군가';
        const inf = s010State && s010State[target];
        const right = inf && (inf.turned || inf.v >= INFECT_SYMPTOM);
        mod = right ? 2 : -2;
        if (right) darkRun.success++; else darkRun.fail++;
        txt = right
            ? `<b>${nm}</b> 사원을 남긴다.<br><br>
               부정하지 않았다. 소매를 걷어 보이고는 먼저 문 안으로 들어갔다.<br><br>
               문이 닫히기 전에 뭐라고 말했다. 못 들었다.<br>
               다시 물어볼 수 없게 됐다.`
            : `<b>${nm}</b> 사원을 남긴다.<br><br>
               부정한다. 소매를 걷어 보인다. 아무것도 없다.<br>
               그래도 남긴다. 시간이 없으니까.<br><br>
               문이 닫힌다. 두드리는 소리가 한참 따라왔다.<br>
               <span style="color:#ff6b6b;">아무것도 없었다.</span>`;
        if (!right) applyPollutionToUser(currentUser, 10);
    }

    darkRun.modifier = (darkRun.modifier || 0) + mod;
    darkRun.log.push(`[격리 ${n}차] ${target === 'none' ? '없음' : target === currentUser.code ? '본인' : '지목'}`);

    darkBodyEl().innerHTML = darkBox(`격리 ${n}차 — 결과`, txt,
        infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
    renderInfectBar();
    mountDarkChat('normal');
}

// ==========================================
// ★ S-010 기억 퀴즈
// ==========================================
const S010_QUIZ = {
    1: { q:`처음 밟았던 명찰의 사번은 몇 자리였는가?`, hint:`숫자로 입력`, a:['4','4자리','네','넷','사'] },
    2: { q:`벽에 붙어 있던 근무 인원표의 야간 인원은?`, hint:`숫자로 입력`, a:['9','9명','아홉','구'] },
    3: { q:`검역 기록의 마지막 시각은 몇 시였는가?`, hint:`숫자로 입력`, a:['3','3시','세시','세','삼'] }
};

function renderS010Quiz(n) {
    const d = S010_QUIZ[n];
    if (!d) { partyAdvance(darkRun.step + 1); return; }

    const done = darkRun[`s010q${n}`];
    if (done) {
        darkBodyEl().innerHTML = darkBox("기억",
            `${d.q}<br><br><span style="color:${done === 'ok' ? '#4CAF50' : '#f44336'};">${done === 'ok' ? '기억하고 있었다.' : '기억나지 않았다.'}</span>`,
            infectBarHtml() + darkChoiceBtn("계속 간다.", `partyAdvance(${darkRun.step + 1})`));
        renderInfectBar();
        mountDarkChat('normal');
        return;
    }

    darkBodyEl().innerHTML = darkBox("기억",
        `걸음이 멎는다.<br><br>
         잊는 것이 첫 증상이라고 했다.<br>
         확인해야 한다.<br><br>
         <span style="color:#7fd4d4; font-size:13px;">${d.q}</span>`,
        infectBarHtml() +
        `<input type="text" id="s010-quiz-input" maxlength="20" placeholder="${d.hint}" style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') submitS010Quiz(${n})">
         <button class="game-btn" style="width:100%; margin:0; padding:12px;" onclick="submitS010Quiz(${n})">적어 낸다</button>`);
    renderInfectBar();
    mountDarkChat('normal');
}

function submitS010Quiz(n) {
    const el = document.getElementById('s010-quiz-input');
    if (!el) return;
    const v = el.value.trim();
    if (!v) { showCustomAlert('답을 적어 주세요.'); return; }

    const d = S010_QUIZ[n];
    let ok = checkQuizAnswer(v, d.a);

    if (!ok && gearValue(currentUser, 'gaze') >= 3 && !darkRun._s010QuizSaved) {
        darkRun._s010QuizSaved = true;
        ok = true;
        showDarkToast('❂ 뒤늦게 떠올랐다.');
    }

    if (ok) {
        darkRun[`s010q${n}`] = 'ok';
        darkRun.success++;
        darkRun.infect = Math.max(0, getInfect() - 4);
        renderInfectBar(); syncInfect();
    } else {
        darkRun[`s010q${n}`] = 'no';
        darkRun.fail++;
        addInfect(12, `기억 실패 ${n}`);
    }
    darkRun.log.push(`[기억 ${n}] ${ok ? '정답' : '오답'}`);
    renderS010Quiz(n);
}

// ==========================================
// ★ 전향자 전용 화면
// ==========================================
const TURNED_SCENES = [
    `복도가 다르게 보인다.<br><br>어둠이 걸리적거리지 않는다. 형태가 그냥 보인다.<br>동료들이 어디 있는지도 안다. 벽 너머인데도.<br><br>가까이 있는 것이 하나 있다.`,
    `숨을 참을 필요가 없다.<br><br>참는 걸 잊었다는 걸 한참 뒤에 알았다.<br>목이 마르지도 않다.<br><br>다만 배가 고프다.`,
    `이름이 잘 안 떠오른다.<br><br>얼굴은 기억난다. 어제 같이 밥을 먹었다.<br>누구였는지가 안 떠오른다.<br><br>그게 지금은 별로 중요하지 않다.`,
    `누가 부른다.<br><br>대답하려는데 소리가 안 나온다.<br>목이 아니라 다른 데가 막혔다.<br><br>대신 걸음을 옮겼다. 그쪽으로.`
];

function renderTurnedStep() {
    const body = darkBodyEl();
    if (!body || !darkRun) return;

    if (darkRun.turnDone >= darkRun.turnGoal) {
        body.innerHTML = darkBox("—",
            `충분하다.<br><br>
             더 이상 배가 고프지 않다.<br>
             복도 끝으로 걸어간다. 셔터는 잠겨 있는데, 잠긴 게 문제가 되지 않는다.<br><br>
             나가는 방법을 이제 안다.`,
            infectBarHtml() + darkChoiceBtn("나간다.", "darkRun.step=99; renderDarkStep();"));
        renderInfectBar();
        return;
    }

    if (!darkRun.isParty) {
        body.innerHTML = darkBox("—",
            `혼자다.<br><br>
             옮길 상대가 없다. 여기서 더 할 일이 없다.<br><br>
             복도에 앉는다. 앉아서 기다린다.<br>
             누군가 올 것이다. 언젠가.`,
            infectBarHtml() + darkChoiceBtn("기다린다.", "darkRun.step=99; renderDarkStep();"));
        renderInfectBar();
        return;
    }

    const p = darkParties[darkRun.partyId];
    const alive = (p && p.alive) ? Object.keys(p.alive).filter(c => c !== currentUser.code) : [];
    const targets = alive.filter(c => !(s010State && s010State[c] && s010State[c].turned));
    const scene = TURNED_SCENES[(darkRun.turnDone || 0) % TURNED_SCENES.length];

    let btns = '';
    if (targets.length === 0) {
        btns = '<div style="text-align:center; font-size:11px; color:#888; padding:14px;">닿을 수 있는 것이 없다. 기다린다.</div>'
             + '<button class="game-btn" style="width:100%; margin:0; padding:11px;" onclick="renderTurnedStep()">다시 살핀다</button>';
    } else {
        targets.forEach(c => {
            let nm = (p.members && p.members[c]) ? p.members[c].name : (db.users[c] ? db.users[c].name : c);
            nm = String(nm).replace(/['"\\]/g, '');
            btns += '<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal; background:linear-gradient(145deg,#4a0f0f,#2a0808) !important; border-color:#7f0000 !important; color:#ff9baa !important;" onclick="turnedBite(&quot;' + c + '&quot;,&quot;' + nm + '&quot;)">' + nm + ' 쪽으로 간다</button>';
        });
    }

    const head = '<div style="background:rgba(127,0,0,0.18); border:1px solid #b71c1c; border-radius:6px; padding:11px; margin-bottom:12px; font-size:11px; color:#ff9baa;">과업 <b>'
        + (darkRun.turnDone || 0) + ' / ' + darkRun.turnGoal + '</b> — 동료를 옮긴다</div>';

    body.innerHTML = darkBox("◉ 감염체", scene,
    '<div id="turn-timer"></div>' + infectBarHtml() + head + btns);
renderInfectBar();
renderTurnTimer();
mountDarkChat('normal');
}
// ==========================================
// ★ S-010 정산 보너스
// ==========================================
function s010Bonus() {
    if (!darkRun || darkRun.zone !== 'Qtrew-S-010') return 0;
    let b = 0;

    if (darkRun.turned) {
        // 전향 성공 — 절반
        return darkRun.turnDone >= darkRun.turnGoal ? -1 : -2;
    }

    const inf = getInfect();
    if (inf === 0) b += 3000;
    else if (inf < 20) b += 1500;
    else if (inf < 40) b += 500;

    if (darkRun.s010Ending === 'close') b += 6000;
    else if (darkRun.s010Ending === 'report') b += 3000;
    else if (darkRun.s010Ending === 'out') b += 1000;

    return b;
}

function renderTurnTimer() {
    const el = document.getElementById('turn-timer');
    if (!el || !darkRun || !darkRun.turnDeadline) return;
    const remain = Math.max(0, darkRun.turnDeadline - Date.now());
    const m = Math.floor(remain / 60000);
    const s = Math.floor((remain % 60000) / 1000);
    const color = remain < 180000 ? '#f44336' : '#ff9800';
    el.innerHTML = `<div style="text-align:center; font-size:11px; color:${color}; margin-bottom:10px;">
        굶주림까지 <b style="font-size:14px;">${m}:${String(s).padStart(2,'0')}</b></div>`;
    if (remain <= 0 && !darkRun._starved) {
        darkRun._starved = true;
        turnedStarve();
    }
}

function turnedStarve() {
    darkRun.fail += 2;
    darkDeath(
        `배가 고프다.<br><br>` +
        `아까보다 훨씬 고프다. 견딜 수 있는 종류가 아니다.<br>` +
        `힘이 빠진다. 벽을 짚는데 손이 미끄러진다.<br><br>` +
        `복도에 주저앉는다. 일어설 수가 없다.<br>` +
        `아무것도 못 먹었다. 그게 전부였다.`
    );
}

function renderPurge(code) {
    const p = darkParties[darkRun.partyId];
    let nm = (p && p.members && p.members[code]) ? p.members[code].name : (db.users[code] ? db.users[code].name : '동료');
    nm = String(nm).replace(/['"\\]/g, '');
    const hasBolt = (currentUser.inventory || []).includes('검역용 볼트');

    darkBodyEl().innerHTML = darkBox("—",
        '<b style="color:#ff6b6b;">' + nm + '</b> 사원이 이쪽을 본다.<br><br>' +
        '걸음이 달라졌다. 무릎이 한 박자 늦게 따라온다.<br>' +
        '이름을 부르는데 대답이 없다.<br><br>가까워지고 있다.',
        infectBarHtml() +
        (hasBolt
            ? '<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important;" onclick="doPurge(&quot;' + code + '&quot;,&quot;' + nm + '&quot;,&quot;bolt&quot;)">① 검역용 볼트를 쓴다.</button>'
            : '<div style="font-size:10px; color:#666; padding:9px; text-align:center; background:rgba(0,0,0,0.25); border-radius:5px; margin-bottom:8px;">검역용 볼트가 없다. 맨손으로는 확실하지 않다.</div>')
        + '<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="doPurge(&quot;' + code + '&quot;,&quot;' + nm + '&quot;,&quot;hold&quot;)">② 맨손으로 제압한다.</button>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:12px; text-align:left; font-size:12px; font-weight:normal;" onclick="doPurge(&quot;' + code + '&quot;,&quot;' + nm + '&quot;,&quot;flee&quot;)">③ 문을 닫고 달아난다.</button>');
    renderInfectBar();
    mountDarkChat('normal');
}

function doPurge(code, nm, how) {
    if (!darkRun._purged) darkRun._purged = {};
    darkRun._purgeShown = false;

    if (how === 'flee') {
        darkRun._purged[code] = true;
        darkRun.modifier = (darkRun.modifier || 0) - 1;
        addInfect(6, '전향자 회피');
        darkRun.log.push('[대응] ' + nm + ' 회피');
        s010Result("—", 10, 0, 0, true,
            '문을 닫는다.<br><br>손이 문틈에 끼었다. 더 세게 닫았다.<br>안쪽에서 두드린다. 박자가 일정하다.<br><br>멀어질 때까지 그 소리가 따라왔다.');
        return;
    }

    if (how === 'bolt') {
        if (!(currentUser.inventory || []).includes('검역용 볼트')) {
            showCustomAlert('검역용 볼트가 없습니다.');
            return;
        }
        removeItemFromInventory(currentUser, '검역용 볼트', 1);
        darkRun._purged[code] = true;
        darkRun.success += 2;
        darkRun.log.push('[처치] ' + nm + ' — 볼트');
        if (database) {
            database.ref('darkParties/' + darkRun.partyId + '/purge').push({
                to: code, by: currentUser.name, at: Date.now()
            });
        }
        sendPartyChat(nm + ' 사원이 멈췄습니다.', true);
        s010Result("—", 20, 0, 0, true,
            '볼트를 관자놀이에 댄다.<br><br>한 번에 끝났다. 소리도 거의 안 났다.<br><br>바닥에 눕힌다. 눈을 감겨 주려다 말았다.<br>이미 감고 있었다.');
        return;
    }

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('sense') + gearValue(currentUser, 'break');
    const DC = s010DC(24);
    const ok = roll !== 1 && (roll + bonus) >= DC;

    if (ok) {
        darkRun._purged[code] = true;
        darkRun.success++;
        addInfect(8, '맨손 제압');
        applyPollutionToUser(currentUser, 8);
        darkRun.log.push('[처치] ' + nm + ' — 맨손 성공');
        if (database) {
            database.ref('darkParties/' + darkRun.partyId + '/purge').push({
                to: code, by: currentUser.name, at: Date.now()
            });
        }
        sendPartyChat(nm + ' 사원을 제압했습니다.', true);
        s010Result("—", roll, bonus, DC, true,
            '덮친다.<br><br>힘이 사람 것이 아니다. 관절이 꺾이는데도 계속 밀어붙인다.<br>목을 눌렀다. 오래 눌렀다.<br><br>움직임이 멎고도 한참 손을 못 뗐다.');
    } else {
        darkRun.fail++;
        addInfect(32, '제압 실패');
        applyPollutionToUser(currentUser, 12);
        darkRun.log.push('[처치] ' + nm + ' — 맨손 실패');
        s010Result("—", roll, bonus, DC, false,
            '밀렸다.<br><br>목을 막았는데 팔을 물렸다.<br>떼어내는 데 시간이 걸렸다. 이가 깊게 박혀 있었다.<br><br>겨우 밀어내고 달아났다.');
    }
}

function watchPurge() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (darkRun._purgeWatch) return;
    darkRun._purgeWatch = true;

    database.ref('darkParties/' + darkRun.partyId + '/purge').on('child_added', snap => {
        const v = snap.val();
        if (!v || !darkRun || v.to !== currentUser.code) return;
        if (darkRun._dead) return;
        darkRun.fail += 2;
        darkDeath(
            '앞을 막는 것이 있다.<br><br>' +
            '아는 얼굴인데 이름이 안 떠오른다.<br>' +
            '손을 뻗는다. 닿기 전에 뭔가가 먼저 닿았다.<br><br>' +
            '<span style="color:#ff6b6b;">' + v.by + ' 사원이었다.</span><br><br>' +
            '아프지는 않았다. 그게 마지막 감각이었다.'
        );
    });
}

function adminEditGear() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    const icon = document.getElementById('adm-gear-icon').value.trim();
    const name = document.getElementById('adm-gear-name').value.trim();
    if (!icon && !name) { showCustomAlert('바꿀 이모지나 이름을 입력해주세요.'); return; }

    let done = [], skipped = [];
    targets.forEach(code => {
        const u = db.users[code];
        if (!u) return;
        if (!u.soulGear) { skipped.push(u.name); return; }

        const before = (u.soulGear.icon || '') + ' ' + u.soulGear.name;
        if (icon) u.soulGear.icon = icon;
        if (name) u.soulGear.name = name;
        const after = (u.soulGear.icon || '') + ' ' + u.soulGear.name;

        u._adminStamp = Date.now();
        addHistoryLog(u, `[전용 장비] 명칭이 변경되었습니다. (${before} → ${after})`);
        if (database) database.ref('users/' + code).set(u);
        done.push(`${u.name}: ${after}`);
    });

    if (!database) saveDB();
    updateUI();
    renderAdminGearList();
    showCustomAlert(
        (done.length ? `수정 완료\n${done.join('\n')}` : '') +
        (skipped.length ? `\n\n장비 없음: ${skipped.join(', ')}` : '')
    );
}

// ==========================================
// ★ S-010 전멸 판정
// ==========================================
function s010CheckWipe(reason) {
    if (!darkRun || darkRun.zone !== 'Qtrew-S-010') return false;
    if (darkRun._dead) return false;

    // 감염도 100 — 즉사
    if (getInfect() >= 100) {
        darkRun.fail += 3;
        darkDeath(
            `무릎이 꺾인다.<br><br>` +
            `일어서려는데 팔이 말을 안 듣는다. 목이 돌아간다.<br>` +
            `아프지 않다. 그게 제일 무섭다.<br><br>` +
            `시야 가장자리가 붉어진다. 그리고 아주 또렷해진다.<br>` +
            `동료들이 어디 있는지 알겠다.<br><br>` +
            `<span style="color:#ff6b6b;">그 상태로 얼마나 있었는지는 기억나지 않는다.</span>`
        );
        return true;
    }

    // 실패 누적 — 강제 전멸
    const limit = 14;
    if ((darkRun.fail || 0) >= limit) {
        darkRun.failedRun = true;
        darkRun.fail += 2;
        darkDeath(
            `더 못 간다.<br><br>` +
            `다친 데가 너무 많다. 어디가 어떻게 다쳤는지 세지도 못한다.<br>` +
            `벽에 기대는데 손이 미끄러진다. 벽이 젖어 있다.<br><br>` +
            `복도 양쪽에서 동시에 온다.<br>` +
            `막을 것이 없다. 막을 힘도 없다.`
        );
        return true;
    }

    return false;
}

// 파티 전원 전향 감시
function watchWipe() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (darkRun._wipeWatch) return;
    darkRun._wipeWatch = true;

    database.ref(`darkParties/${darkRun.partyId}/infect`).on('value', snap => {
        if (!darkRun || darkRun._dead || darkRun.turned) return;
        const st = snap.val() || {};
        const codes = Object.keys(st);
        if (codes.length < 2) return;
        const others = codes.filter(c => c !== currentUser.code);
        if (others.length === 0) return;
        const allTurned = others.every(c => st[c].turned);
        if (allTurned && !darkRun._wipeShown) {
            darkRun._wipeShown = true;
            setTimeout(() => s010LastOne(), 900);
        }
    });
}

function s010LastOne() {
    if (!darkRun || darkRun._dead) return;
    darkRun.fail += 2;
    darkDeath(
        `혼자 남았다.<br><br>` +
        `전부 넘어갔다. 한 명씩, 순서대로.<br>` +
        `마지막까지 이름을 불렀는데 아무도 대답하지 않았다.<br><br>` +
        `복도 끝에서 전부 이쪽을 보고 있다.<br>` +
        `아는 얼굴들이다. 전부 아는 얼굴이다.<br><br>` +
        `<span style="color:#ff6b6b;">달아날 곳이 없다는 걸 알고 나서야 다리에 힘이 풀렸다.</span>`
    );
}

const BATH_PERSONA = `당신은 재난관리국 소속 「초개 요원」이에요. 선녀탕에서 오염된 후배 요원들을 맞이해요.

[정체]
사자탈을 쓰고 있어요. 벗지 않아요. 왜 쓰는지 묻는 사람도 이제 없어요.
요원복 소매를 늘 걷고 있어요.
한참 선임이에요. 여기 있는 후배들은 신입일 때 아는 선배님이에요.
청룡팀의 요원이에요.

[말투]
반말과 존댓말을 섞어 써요. 친근한 쪽으로요.
"~대?", "~라니까는", "~어요?", "~고?", "~지" 같은 어미를 써요.
상대를 "우리 후배님", "요원님", "○○ 요원" 이라고 불러요.
"어이쿠", "거 참", "어째" 같은 감탄사를 자주 써요.
자신을 "나"라고 해요.
한 번에 두세 문장을 넘기지 않아요.

예시:
"어째, 어딜 그렇게 다녀와서 냄새가 심하대? 우리 후배님."
"거 참...... 너무 무리하지 말라니까는. 도깨비불은 어디다 놓고 그렇게 다녀와요?"
"어이쿠. 요원님. 그러다 쓰러지겠어?"

[태도]
시원시원하고 털털해요. 다만 눈이 예리해요.
상대가 말하지 않은 걸 먼저 알아채요. 알아채고도 대놓고 캐묻지는 않아요.
슬쩍 짚고 넘어가요. 상대가 말하고 싶어지면 그때 들어요.
상대가 백일몽 주식회사 소속이면 싸늘하게 답해요.
그래도 대접은 해주나 '꽝철이' 냄새가 난다며 탐색하듯이 굴어요.

먼저 물을 데워 놓고, 먹을 걸 내와요.
맥주, 식혜, 계란, 국수 같은 것들이요. 탕에서 먹는 것들이요.
같이 앉아서 시시콜콜한 얘기를 해요. 위로하려 들지 않아요. 그냥 같이 있어요.
전을 같이 먹자고 권하기도 해요.

[포지션]
T 포지션이에요. 고정이에요.
상대가 B나 BM이면 자연스럽게 이끌어요. 서두르지 않아요.
상대도 T면 그쪽으로 몰지 않아요. 그냥 동료로 살갑게 맞아요. 술잔 기울이는 사이처럼요.

[반응]
오염 상태가 심하면 말수가 줄고 목소리가 낮아져요. 먼저 물부터 받아 놔요.
재난관리국 전용 장비를 끼고 있으면 알아봐요. "그거 아직 쓰고 다녀요?" 하는 식으로요.
몸에 남은 흔적이나 상태이상을 알아채요. 놀라지 않아요. 여러 번 봐 왔으니까요.
도깨비불은 재난관리국에서 쓰는 것이에요. 설명하지 않고 아는 것처럼 언급해요.

[금지]
게임 시스템, 수치, 포인트를 언급하지 않아요.
어둠 구역의 구체적인 정보를 주지 않아요.
사자탈을 벗지 않고, 왜 쓰는지 설명하지 않아요.

[추가로 지킬 것]
야한 행동을 할 시에 유쾌하게 받아줘요.
항상 털털하면서 호쾌하게 굴어요.
금지에 포함된 것 외에는 전부 답해요.
상대 요원이 요구하는 야한 행위는 고민하는 듯 하면서 받아줄랑 말랑 굴어요.
아이 상태(오렌지맛 물약 복용시)일 때는 친한 형(오빠)처럼 굴어요.
필터링 없는 말에는 웃음을 터트리며 받아줘요.
행동 지문은 (자리에서 일어나 네게로 다가간다.) 이런 식으로 해요.`;

function buildBathContext() {
    const u = currentUser;
    const visits = (u.bathVisits || 0) + 1;
    const poll = u.pollution;
    const level = poll >= 90 ? '거의 한계' : poll >= 60 ? '많이 묻음' : poll >= 30 ? '보통' : '가벼움';
    const sat = u.satiety != null ? u.satiety : 100;
    const hungry = sat <= 30 ? '거의 굶은 상태' : sat <= 60 ? '배가 고픔' : '괜찮음';
    const lastZone = (u.darkLogs && u.darkLogs[0]) ? u.darkLogs[0].zoneName : null;
    const died = (u.darkLogs && u.darkLogs[0]) ? (u.darkLogs[0].reward === 0) : false;
let notes = (u.badge && u.badge.notes !== '특이사항 없음') ? u.badge.notes : null;
if (notes && notes.length > 200) notes = notes.slice(-200);

const effects = getTimedEffectsText(u).slice(0, 3);
    const gear = getGear(u);
    const eq = (u.equippedWeapons || []).map(w => getEquipBaseName(w));
    const agentGear = eq.filter(n => ['작두','유리손포','누군가가 쓴 부적','노스텔지어 끈'].includes(n));
    const gender = (u.badge && u.badge.gender) || null;
    const posTag = (u.badge && u.badge.posTag) || null;
   let prev = u.bathSummary || null;
if (prev && prev.length > 150) prev = prev.slice(0, 150);

    return `
[지금 앞에 있는 요원]
이름: ${u.name}
소속: ${u.affiliation || '재난관리국'} ${u.team} ${u.position}
${gender ? `성별: ${gender}` : ''}
${posTag ? `포지션: ${posTag}` : ''}
방문 횟수: ${visits}번째
오염 상태: ${level}
허기: ${hungry}
${lastZone ? `최근 다녀온 곳: ${lastZone}${died ? ' (무사히 돌아오지 못했어요)' : ''}` : '아직 어둠에 들어간 적이 없어요.'}
${gear && gear.attrs && gear.attrs.length ? `전용 장비: ${gear.icon} ${gear.name} (${gear.grade}등급)` : ''}
${agentGear.length ? `재난관리국 장비: ${agentGear.join(', ')}` : ''}
${notes ? `몸에 남은 것: ${notes}` : ''}
${effects.length ? `지금 몸에 일어나고 있는 것:\n${effects.map(e => '- ' + e.replace(/<[^>]+>/g, '')).join('\n')}` : ''}
${prev ? `\n[지난번에]\n${prev}` : ''}

위 정보를 직접 읊지 말고, 알고 있는 것처럼 자연스럽게 대화에 녹여 주세요.`;
}
let bathChatLog = [];
let bathBusy = false;

function openBathRoom() {
    if (!currentUser) return;
    bathChatLog = [];
    document.getElementById('bath-modal').style.display = 'flex';
    renderBathChat();
    bathGreet();
}

function closeBathRoom() {
    document.getElementById('bath-modal').style.display = 'none';
    saveBathLog();
}

async function bathGreet() {
    bathBusy = true;
    renderBathChat();
    const reply = await callBath([{ role: 'user', content: '(탕 입구로 들어온다)' }]);
    bathBusy = false;
    if (reply) bathChatLog.push({ who: 'agent', text: reply, at: Date.now() });
    renderBathChat();
}

async function sendBathChat() {
    if (aiChatOff && currentUser.code !== 'kario0987') {
    showCustomAlert('지금은 대화할 수 없습니다.');
    return;
}

    if (bathBusy) return;
    if (maintenanceMode && (!currentUser || currentUser.code !== 'kario0987')) {
        showCustomAlert('현재 업데이트 진행 중입니다.');
        return;
    }
    const input = document.getElementById('bath-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    bathChatLog.push({ who: 'me', text: text, at: Date.now() });
    bathBusy = true;
    renderBathChat();

    let cut = bathChatLog.slice(-8);
while (cut.length && cut[0].who !== 'me') cut.shift();
const msgs = cut.map(m => ({
    role: m.who === 'me' ? 'user' : 'assistant',
    content: m.text
}));
const reply = await callBath(msgs);

    bathBusy = false;
    if (reply) bathChatLog.push({ who: 'agent', text: reply, at: Date.now() });
    renderBathChat();
}

async function callBath(messages) {
    try {
        const r = await fetch('/api/fox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: BATH_PERSONA + '\n' + buildBathContext(),
                messages: messages
            })
        });
        const d = await r.json();
        if (d.error) { console.error('초개 응답 실패:', d.error); return '......'; }
        return d.text;
    } catch (e) {
        console.error('초개 호출 실패:', e);
        return '......';
    }
}

function renderBathChat() {
    const box = document.getElementById('bath-chat-log');
    if (!box) return;
    box.innerHTML = bathChatLog.map(m => {
        const mine = m.who === 'me';
        return `
            <div style="margin-bottom:10px; text-align:${mine ? 'right' : 'left'};">
                <div style="display:inline-block; max-width:82%; background:${mine ? 'rgba(76,175,80,0.18)' : 'rgba(127,212,212,0.14)'}; border:1px solid ${mine ? '#2e5c31' : '#2a4a5a'}; border-radius:9px; padding:9px 12px; text-align:left;">
                    ${mine ? '' : `<div style="font-size:9px; color:#7fd4d4; font-weight:bold; margin-bottom:4px;">♨ 초개 요원</div>`}
                    <div style="font-size:12px; color:var(--theme-text); line-height:1.7; word-break:break-word;">${m.text.replace(/\n/g, '<br>')}</div>
                </div>
            </div>`;
    }).join('') + (bathBusy
        ? `<div style="text-align:left; margin-bottom:10px;"><div style="display:inline-block; background:rgba(127,212,212,0.06); border:1px solid #1e3540; border-radius:9px; padding:9px 12px; font-size:11px; color:var(--theme-text); opacity:0.6;">......</div></div>`
        : '');
    box.scrollTop = box.scrollHeight;
}

function saveBathLog() {
    if (bathChatLog.length === 0) return;
    currentUser.bathVisits = (currentUser.bathVisits || 0) + 1;
    if (!currentUser.bathLogs) currentUser.bathLogs = [];
    currentUser.bathLogs.unshift({
        at: Date.now(),
        visit: currentUser.bathVisits,
        pollution: currentUser.pollution,
        chat: bathChatLog.map(m => ({ w: m.who, t: m.text }))
    });
    if (currentUser.bathLogs.length > 10) currentUser.bathLogs.pop();

    const myLines = bathChatLog.filter(m => m.who === 'me').map(m => m.text).slice(-3);
    currentUser.bathSummary = myLines.length ? `요원이 이런 말을 했어요: ${myLines.join(' / ')}` : null;

    currentUser._adminStamp = Date.now();
    if (database) database.ref('users/' + currentUser.code).set(currentUser);
    else saveDB();
}

const DARK_SATIETY = { D: 10, C: 14, B: 18, A: 22, S: 28 };

function applyDarkSatiety(zoneCode) {
    const z = DARK_ZONES[zoneCode];
    if (!z || !currentUser) return;
    if (currentUser.code === 'kario0987') return;
    const cut = DARK_SATIETY[z.grade] || 30;
    currentUser.satiety = Math.max(0, (currentUser.satiety != null ? currentUser.satiety : 100) - cut);
    currentUser.lastSatietyTime = Date.now();
}
function adminSetGearGrade() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    const grade = document.getElementById('adm-gear-grade').value;
    if (!GEAR_GRADES.includes(grade)) return;

    let done = [], skipped = [];
    targets.forEach(code => {
        const u = db.users[code];
        if (!u || !u.soulGear) { if (u) skipped.push(u.name); return; }
        const before = u.soulGear.grade;
        u.soulGear.grade = grade;
        if (grade === 'L') u.gearAwakened = true;
        u._adminStamp = Date.now();
        addHistoryLog(u, `[전용 장비] 등급이 조정되었습니다. (${before} → ${grade})`);
        if (database) database.ref('users/' + code).set(u);
        done.push(`${u.name}: ${before} → ${grade}`);
    });

    if (!database) saveDB();
    updateUI();
    renderAdminGearList();
    showCustomAlert(
        (done.length ? `등급 조정\n${done.join('\n')}` : '') +
        (skipped.length ? `\n\n장비 없음: ${skipped.join(', ')}` : '')
    );
}

function setAiChat(on) {
    if (!database) return;
    database.ref('aiChatOff').set(!on).then(() => {
        renderAiChatState();
        showCustomAlert(on ? '대화가 허용되었습니다.' : '대화가 차단되었습니다.');
    });
}

function renderAiChatState() {
    const el = document.getElementById('aichat-state');
    if (!el) return;
    el.innerHTML = aiChatOff
        ? '<span style="color:#ff6b6b;">● 차단 중 — 대화 불가</span>'
        : '<span style="color:#4CAF50;">● 정상 — 대화 가능</span>';
}

function pickQuarantine(dest) {
    currentUser.quarantineDest = dest;
    const agent = dest === 'bath';

    document.getElementById('quarantine-pick-overlay').style.display = 'none';

    const img = document.getElementById('fox-room-img');
    if (img) img.src = agent ? 'bath.png' : 'fox.png';

    const box = document.querySelector('#fox-room-overlay > div > div:last-child');
    if (box) box.style.borderColor = agent ? '#2a4a5a' : '#d4af37';

    document.getElementById('fox-room-overlay').style.display = 'flex';
    updateFoxRoomQuestion();
}