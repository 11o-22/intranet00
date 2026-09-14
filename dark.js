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