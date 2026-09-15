const DARK_ZONES = {
        "Qtrew-S-001": { code:"Qtrew-S-001", grade:"S", name:"■■■■■■", brief:"(기밀 — 열람 권한 없음)", danger:"최상", survival:"0.1%", min:4, max:5, reward:[1500,2500], ready:false },
        "Qtrew-A-667": { code:"Qtrew-A-667", grade:"A", name:"물고기가 인간이 되었다", brief:"(물고기가 인간이 되었다.)", danger:"최상", survival:"0.5%", min:3, max:4, reward:[1000,1500], ready:false },
        "Qtrew-A-214": { code:"Qtrew-A-214", grade:"A", name:"빛을 찾아서", brief:"(빛 아래에서만 숨을 쉴 수 있음.)", danger:"상", survival:"3%", min:2, max:3, reward:[1000,1500], ready:false },
                      "Qtrew-B-330": {
            code:"Qtrew-B-330", grade:"B", name:"미로를 빠져나가자",
            brief:"(함정 조심!)",
            danger:"중상", survival:"12%", min:2, max:4, reward:[900,1600], ready:true,
            voteMode:true, soloFrom:3, soloTo:6,
            intro:"안내 방송이 나오고 있다.<br><br><span style=\"color:#d4af37;\">\"미로 탈출 게임에 참가해 주셔서 감사합니다. 제한 시간은 없습니다. 함정을 조심하세요. 즐거운 시간 되시기 바랍니다.\"</span><br><br>목소리가 명랑하다. 같은 문장을 세 번 반복하는데, 세 번 다 억양이 똑같다.<br><br>벽에 안내판이 붙어 있다. 글씨가 흐릿하다.<br>누군가 미로를 대충 알고 있는 사람이 그린 것 같다.",
            outro:"이름이 기억나지 않는다.<br><br>그게 다행이라는 것만 안다.<br>벽이 멀어지고, 안내 방송이 잦아들고, 화살표가 전부 같은 방향을 가리킨다.<br>처음으로 일치했다.<br><br>눈을 뜨니 복도다. 사원증에 적힌 이름을 한참 들여다봤다.",
            images: { intro:"maze_1.jpg", step1:"maze_2.jpg", step2:"maze_3.jpg", step3:"maze_4.jpg" }
        },
        "Qtrew-B-508": { code:"Qtrew-B-508", grade:"B", name:"%$#@빵가게", brief:"(안녕하세요, %$#@빵가게 입니다!)", danger:"중상", survival:"9%", min:3, max:5, reward:[900,1600], ready:false },
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
         "Qtrew-C-176": { code:"Qtrew-C-176", grade:"C", name:"■■■■", brief:"(개방 준비 중)", danger:"중", survival:"38%", min:2, max:2, reward:[250,500], ready:false },
       
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
        "Qtrew-C-119": [
            { name:"금이 간 손거울", chance:0.003 },
            { name:"세 번째 단어", chance:0.002 },
            { name:"먼저 웃은 쪽", chance:0.001 },
            { name:"맞물리지 않는 조각", chance:0.05 }
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
            else if (zoneCode === 'Qtrew-C-119') buildMirrorAmbience(ctx, master);
            else if (zoneCode === 'Qtrew-B-330') buildMazeAmbience(ctx, master);
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
        8:  { type:'narr', text:`남은 사람끼리 걷는다.<br><br>말이 없다. 할 말이 없는 게 아니라, 소리를 내면 안 될 것 같아서다.<br><br>벽에 세어놓은 자국이 있다. 작대기 네 개씩 묶어서 여섯 묶음.<br>스물넷. 시간이었을까, 사람이었을까.` },
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
        19: { type:'narr', img:'step3', text:`바닥이 기울어 있다.<br><br>처음부터 기울어 있었다. 아주 미세해서 몰랐을 뿐이다.<br>여태 걸어온 게 아니라, 흘러온 것이었다.<br><br>벽에 손톱자국이 있다. 사람이 버티려고 한 자국이다.<br>그 옆에 또 하나. 또 하나. 셀 수 없이 많다.` },
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
                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`,
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
                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
        mountDarkChat('normal');
    }

    // --- 기믹 5: 마지막 ---
    function b330Gimmick7() {
        renderChoiceStep("기믹 5 — 잊히기",
            `바닥의 기울기가 급해진다.<br><br>벽에 붙은 안내판이 전부 떨어져 있다. 화살표도 없다.<br>대신 벽 전체에 같은 문장이 빼곡하다.<br><br><span style="color:#d4af37;">"즐거운 시간 되시기 바랍니다"</span><br><br>여기까지 온 사람이 몇이나 있었는지 모른다.<br>나가려면, 이것이 당신을 잊어야 한다.`,
            [
                { id:'forget', label:'① 이름을 버린다. 사원증을 놓는다.', fn:'b330G7Roll', arg:'forget' },
                { id:'still',  label:'② 움직이지 않는다. 숨도 쉬지 않는다.', fn:'b330G7Roll', arg:'still' },
                { id:'shout',  label:'③ 소리를 지른다. 존재를 각인시킨다.', fn:'b330G7Roll', arg:'shout' },
                { id:'walk',   label:'④ 그냥 걸어 나간다.', fn:'b330G7Roll', arg:'walk' }
            ], "step4");
    }

        function b330G7Roll(pick) {
        const roll = Math.floor(Math.random()*20) + 1;
        let bonus = rollDarkBonus();
        if (currentUser.darkMazeMap > 0) { bonus += 1; currentUser.darkMazeMap--; }
        const total = roll + bonus;

        let DC = { forget:9, still:11, walk:13, shout:17 }[pick];
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
        const roll = Math.floor(Math.random()*20) + 1;
        let bonus = rollDarkBonus();
        if (currentUser.darkCatalogBonus) { bonus += 2; currentUser.darkCatalogBonus = false; }
        const total = roll + bonus;

        let DC = (pick === 'pull') ? 9 : (pick === 'slow') ? 11 : 13;
        if (!darkRun.correct) DC += 4;

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
                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
        const roll = Math.floor(Math.random() * 20) + 1;
        let bonus = rollDarkBonus();
        const total = roll + bonus;
        const DC = 13;

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
                    : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
        }, 45000);
    }

    function giveUpDying() { confirmDeath(); }

    function confirmDeath() {
        clearTimeout(dyingTimer);
        if (darkRun && darkRun.isParty && database) {
            database.ref(`darkParties/${darkRun.partyId}/dying/${currentUser.code}`).remove();
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
            `<button class="game-btn" style="width:100%; margin:6px 0 0 0; padding:11px; font-size:11px;" onclick="abandonRescue('${code}')">보고만 있는다.</button>`);
        mountDarkChat('normal');
    }

    function attemptRescue(kind, code) {
        const roll = Math.floor(Math.random() * 20) + 1;
        let bonus = rollDarkBonus();
        let DC = { hand: 11, item: 8, name: 10 }[kind];
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
                txt = `손을 뻗는다. 닿는다.<br><br>그런데 끌려가는 쪽이 더 세다.<br>발이 미끄러지고, 같이 딸려 들어간다.<br><br>둘 다 흐려지기 시작한다.`;
                darkRun.dying = 'rescue';
                applyPollutionToUser(currentUser, 10);
                darkBodyEl().innerHTML = darkBox("구조 — 실패",
                    `<div style="text-align:center; font-size:26px; font-weight:bold; color:#f44336; margin-bottom:12px;">🎲 ${roll}</div>${txt}`,
                    darkChoiceBtn("놓지 않는다.", "renderRescueScene('rescue')"));
                mountDarkChat('normal');
                return;
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
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`));
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
        const roll = Math.floor(Math.random() * 20) + 1;
        let bonus = rollDarkBonus();
        const total = roll + bonus;
        const DC = { run: 10, brace: 15, crawl: 12, back: 13 }[pick];

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
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`);
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
        const roll = Math.floor(Math.random() * 20) + 1;
        let bonus = rollDarkBonus();
        const total = roll + bonus;
        const DC = { run: 10, brace: 15, crawl: 12, back: 13 }[pick];

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
                : `<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...</div>`);
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
    // ==========================================
    // ★ 전용 장비 (Soul Gear)
    // ==========================================
    const GEAR_ATTRS = {
        evade:  { name:'회피', icon:'✦', desc:'즉사 판정을 확률적으로 무효화하고, 강제 지목에 저항합니다.' },
        break:  { name:'파괴', icon:'✧', desc:'막힌 것을 뚫는 판정의 난이도를 낮춥니다.' },
        heal:   { name:'치유', icon:'❋', desc:'탐사 중 오염도 상승을 줄이고, 동료 구조 성공률을 높입니다.' },
        luck:   { name:'행운', icon:'✺', desc:'사망 시 재산 일부를 지키고, 회수품 확률이 오릅니다.' },
        sense:  { name:'감각', icon:'◈', desc:'정보·감식·기억 판정에 강해집니다.' },
        hide:   { name:'은신', icon:'◐', desc:'어둠의 표적이 되는 판정을 피합니다.' }
    };

    const GEAR_GRADES = ['D', 'C', 'B', 'A', 'S'];
    const GEAR_MULT = { D: 1.0, C: 1.5, B: 2.0, A: 2.8, S: 4.0 };
    const GEAR_UPGRADE = {
        D: { to:'C', rate:0.70, cost:3000 },
        C: { to:'B', rate:0.40, cost:8000 },
        B: { to:'A', rate:0.12, cost:20000 },
        A: { to:'S', rate:0.01, cost:50000 }
    };

    // 속성별 기본 수치 (D등급 기준, 등급 배율 적용)
    const GEAR_BASE = {
        evade:  0.08,   // 즉사 무효 확률
        break:  1,      // DC 감소
        heal:   0.10,   // 오염 감소율
        luck:   0.15,   // 재산 보존 판정 성공률
        sense:  1,      // 판정 보정
        hide:   1       // 판정 보정
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
        if (attr === 'break' || attr === 'sense' || attr === 'hide') {
            return Math.round(base * mult);
        }
        return base * mult;
    }

       const GEAR_MARK = { D: '◇', C: '◆', B: '❖', A: '✦', S: '✷' };

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
        if (currentUser.points < up.cost) { showLuxuryAlert(); return; }

        const ok = Math.random() < up.rate;
        const from = g.grade;

        if (ok) {
            currentUser.points -= up.cost;
            g.grade = up.to;
            addHistoryLog(currentUser, `[강화 성공] '${g.name}'이(가) ${from} → ${up.to} 등급이 되었습니다. (-${up.cost} P)`);
        } else {
            const loss = Math.floor(up.cost / 2);
            currentUser.points = Math.max(0, currentUser.points - loss);
            addHistoryLog(currentUser, `[강화 실패] '${g.name}' 강화에 실패했습니다. (-${loss} P)`);
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
                        : `아무 일도 일어나지 않았다.<br>포인트만 사라졌다.`}
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