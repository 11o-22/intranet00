// ==========================================
// ★ 사원증 테두리 — 신규 10종
// index.html 에서 frames.js 다음에 불러온다
// ==========================================
//
// 올려 주신 그림 열 장을 움직이는 테두리로 옮겼다.
// 이미지 파일을 쓰지 않고 전부 CSS 로 그린다.

(function addFrames() {
    if (typeof FRAMES === 'undefined') {
        console.warn('[테두리] frames.js 가 먼저 올라와야 합니다.');
        return;
    }

    // ==========================================
    // 애니메이션
    // ==========================================
    const css = `
/* 번개가 타오른다 */
@keyframes nfBolt {
    0%,100% { box-shadow:0 0 10px rgba(60,180,255,0.55), 0 0 26px rgba(30,140,255,0.30), inset 0 0 14px rgba(40,160,255,0.28); }
    18%     { box-shadow:0 0 22px rgba(120,220,255,0.95), 0 0 54px rgba(40,160,255,0.55), inset 0 0 22px rgba(90,200,255,0.45); }
    24%     { box-shadow:0 0 8px rgba(60,180,255,0.40), 0 0 18px rgba(30,140,255,0.20), inset 0 0 10px rgba(40,160,255,0.18); }
    61%     { box-shadow:0 0 28px rgba(160,240,255,1), 0 0 66px rgba(60,180,255,0.62), inset 0 0 26px rgba(120,220,255,0.50); }
    68%     { box-shadow:0 0 9px rgba(60,180,255,0.45), 0 0 20px rgba(30,140,255,0.22), inset 0 0 11px rgba(40,160,255,0.20); }
}
/* 연기가 피어오른다 */
@keyframes nfSmoke {
    0%,100% { background-position:0% 0%, 100% 100%; }
    50%     { background-position:0% 100%, 100% 0%; }
}
/* 눈이 내린다 */
@keyframes nfSnow {
    0%   { background-position:0 0, 24px 0, 12px 0; }
    100% { background-position:0 120px, 24px 150px, 12px 90px; }
}
/* 꽃잎이 흔들린다 */
@keyframes nfPetal {
    0%,100% { transform:rotate(0deg); }
    50%     { transform:rotate(1.2deg); }
}
/* 잉크가 번진다 */
@keyframes nfInk {
    0%,100% { background-position:0% 0%, 100% 100%; background-size:180% 180%, 180% 180%; }
    50%     { background-position:12% 8%, 88% 92%; background-size:210% 210%, 210% 210%; }
}
/* 별이 깜빡인다 */
@keyframes nfStar {
    0%,100% { opacity:0.55; }
    50%     { opacity:1; }
}
/* 비단이 흐른다 */
@keyframes nfSilk {
    0%   { background-position:0% 50%; }
    100% { background-position:200% 50%; }
}
/* 구름이 지난다 */
@keyframes nfCloud {
    0%,100% { background-position:0% 30%, 100% 70%; }
    50%     { background-position:30% 40%, 70% 60%; }
}
/* 진주가 빛난다 */
@keyframes nfPearl {
    0%,100% { box-shadow:inset 0 0 0 3px rgba(255,255,255,0.55), inset 0 0 18px rgba(150,220,215,0.35), 0 0 12px rgba(150,220,215,0.30); }
    50%     { box-shadow:inset 0 0 0 3px rgba(255,255,255,0.85), inset 0 0 26px rgba(180,240,235,0.55), 0 0 22px rgba(150,220,215,0.50); }
}
/* 룬이 돈다 */
@keyframes nfRune {
    0%   { transform:rotate(0deg); }
    100% { transform:rotate(360deg); }
}

/* --- 푸른 번개 (겹 테두리) --- */
.fr-n01 { position:relative; overflow:hidden; }
.fr-n01::before {
    content:''; position:absolute; inset:2px; border-radius:5px; pointer-events:none; z-index:0;
    border:1px solid rgba(150,230,255,0.75);
    box-shadow:0 0 8px rgba(120,220,255,0.6), inset 0 0 8px rgba(120,220,255,0.35);
    animation:nfBolt 2.4s ease-in-out infinite 0.3s;
}
.fr-n01 > * { position:relative; z-index:2; }

/* --- 룬 문양 --- */
.fr-n02 { position:relative; overflow:hidden; }
.fr-n02::before {
    content:''; position:absolute; inset:-55%; pointer-events:none; z-index:0;
    background:conic-gradient(from 0deg,
        transparent 0deg, rgba(90,200,255,0.35) 22deg, transparent 44deg,
        transparent 160deg, rgba(140,230,255,0.28) 182deg, transparent 204deg);
    animation:nfRune 9s linear infinite;
}
.fr-n02::after {
    content:''; position:absolute; inset:3px; border-radius:4px; pointer-events:none; z-index:1;
    border:1px solid rgba(160,235,255,0.55);
    box-shadow:inset 0 0 10px rgba(80,200,255,0.30);
}
.fr-n02 > * { position:relative; z-index:2; }

/* --- 진주 --- */
.fr-n09 { position:relative; }
.fr-n09::before {
    content:''; position:absolute; inset:1px; border-radius:6px; pointer-events:none; z-index:0;
    background:
        radial-gradient(circle at 12% 0%, rgba(255,255,255,0.85) 0 2.5px, transparent 3px),
        radial-gradient(circle at 50% 0%, rgba(255,255,255,0.95) 0 3.5px, transparent 4px),
        radial-gradient(circle at 88% 0%, rgba(255,255,255,0.85) 0 2.5px, transparent 3px),
        radial-gradient(circle at 12% 100%, rgba(255,255,255,0.85) 0 2.5px, transparent 3px),
        radial-gradient(circle at 50% 100%, rgba(255,255,255,0.95) 0 3.5px, transparent 4px),
        radial-gradient(circle at 88% 100%, rgba(255,255,255,0.85) 0 2.5px, transparent 3px),
        radial-gradient(circle at 0% 30%, rgba(255,255,255,0.75) 0 2px, transparent 2.5px),
        radial-gradient(circle at 0% 70%, rgba(255,255,255,0.75) 0 2px, transparent 2.5px),
        radial-gradient(circle at 100% 30%, rgba(255,255,255,0.75) 0 2px, transparent 2.5px),
        radial-gradient(circle at 100% 70%, rgba(255,255,255,0.75) 0 2px, transparent 2.5px);
    animation:nfStar 3.2s ease-in-out infinite;
}
.fr-n09 > * { position:relative; z-index:2; }

/* --- 별가루 --- */
.fr-n06 { position:relative; overflow:hidden; }
.fr-n06::before {
    content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
    background:
        radial-gradient(circle at 8% 14%, rgba(255,255,255,0.95) 0 1.2px, transparent 1.6px),
        radial-gradient(circle at 5% 46%, rgba(220,235,255,0.85) 0 1.6px, transparent 2px),
        radial-gradient(circle at 11% 78%, rgba(255,255,255,0.90) 0 1.2px, transparent 1.6px),
        radial-gradient(circle at 92% 22%, rgba(255,255,255,0.90) 0 1.4px, transparent 1.8px),
        radial-gradient(circle at 95% 58%, rgba(220,235,255,0.85) 0 1.2px, transparent 1.6px),
        radial-gradient(circle at 89% 86%, rgba(255,255,255,0.95) 0 1.6px, transparent 2px);
    animation:nfStar 2.6s ease-in-out infinite;
}
.fr-n06 > * { position:relative; z-index:2; }
`;

    const st = document.createElement('style');
    st.id = 'new-frames-css';
    st.textContent = css;
    document.head.appendChild(st);

    // ==========================================
    // 테두리 정의
    // ==========================================
    const NEW = [
        // --- B 3종 ---
        {
            id: 'n03', g: 'B', n: '서리꽃',
            c: `border:2px solid rgba(190,225,245,0.75);
                background-image:
                    radial-gradient(circle at 20% 10%, rgba(255,255,255,0.55) 0 2px, transparent 3px),
                    radial-gradient(circle at 70% 30%, rgba(255,255,255,0.45) 0 1.5px, transparent 2.5px),
                    radial-gradient(circle at 40% 70%, rgba(255,255,255,0.50) 0 2px, transparent 3px);
                background-size:52px 120px, 38px 150px, 46px 90px;
                box-shadow:0 0 14px rgba(160,210,240,0.40), inset 0 0 16px rgba(190,225,245,0.25);
                animation:nfSnow 14s linear infinite;`
        },
        {
            id: 'n04', g: 'B', n: '흰 꽃가지',
            c: `border:2px solid rgba(190,220,210,0.70);
                background-image:linear-gradient(135deg, rgba(255,255,255,0.14), transparent 45%);
                box-shadow:inset 0 0 0 1px rgba(255,255,255,0.28), 0 0 12px rgba(170,215,205,0.35);
                animation:nfPetal 5.2s ease-in-out infinite;`
        },
        {
            id: 'n08', g: 'B', n: '푸른 비단',
            c: `border:2px solid transparent;
                background-image:linear-gradient(#0a0a0a,#0a0a0a),
                    linear-gradient(105deg, #7ba7d4, #dce9f5, #a9c9e8, #dce9f5, #7ba7d4);
                background-origin:border-box; background-clip:padding-box,border-box;
                background-size:100% 100%, 220% 100%;
                box-shadow:0 0 14px rgba(140,180,220,0.40);
                animation:nfSilk 7s linear infinite;`
        },

        // --- A 5종 ---
        {
            id: 'n01', g: 'A', n: '푸른 번개',
            c: `border:2px solid rgba(90,200,255,0.9); border-radius:6px;
                background-color:#04121c;`
        },
        {
            id: 'n02', g: 'A', n: '룬 문양',
            c: `border:2px solid rgba(120,215,255,0.85); border-radius:6px;
                background-color:#061420;
                box-shadow:0 0 16px rgba(80,200,255,0.45), inset 0 0 18px rgba(0,0,0,0.85);`
        },
        {
            id: 'n05', g: 'A', n: '남색 잉크',
            c: `border:2px solid rgba(30,50,95,0.85);
                background-image:
                    radial-gradient(ellipse at 0% 0%, rgba(26,42,86,0.85) 0 22%, transparent 45%),
                    radial-gradient(ellipse at 100% 100%, rgba(26,42,86,0.85) 0 22%, transparent 45%);
                box-shadow:inset 0 0 0 1px rgba(200,170,90,0.45), 0 0 14px rgba(30,50,95,0.45);
                animation:nfInk 9s ease-in-out infinite;`
        },
        {
            id: 'n07', g: 'A', n: '구름과 안개',
            c: `border:2px solid rgba(150,175,205,0.65);
                background-image:
                    radial-gradient(ellipse at 20% 20%, rgba(180,200,225,0.30) 0 30%, transparent 55%),
                    radial-gradient(ellipse at 80% 80%, rgba(160,185,215,0.28) 0 30%, transparent 55%);
                background-size:180% 180%, 180% 180%;
                box-shadow:0 0 18px rgba(150,175,205,0.35), inset 0 0 20px rgba(180,200,225,0.18);
                animation:nfCloud 11s ease-in-out infinite;`
        },
        {
            id: 'n09', g: 'A', n: '진주 장식',
            c: `border:3px solid rgba(190,230,225,0.80); border-radius:8px;
                background-color:rgba(12,28,30,0.55);
                animation:nfPearl 3.6s ease-in-out infinite;`
        },

        // --- S 1종 ---
        {
            id: 'n06', g: 'S', n: '별가루',
            c: `border:2px solid transparent; border-radius:7px;
                background-image:linear-gradient(#050810,#050810),
                    linear-gradient(160deg, #0d1a3a, #2a4a8a, #c8d8f0, #6a8ac0, #0d1a3a);
                background-origin:border-box; background-clip:padding-box,border-box;
                background-size:100% 100%, 260% 260%;
                box-shadow:0 0 22px rgba(120,160,230,0.55), inset 0 0 22px rgba(0,0,0,0.85);
                animation:nfSmoke 10s ease-in-out infinite;`
        },
        {
            id: 'n10', g: 'S', n: '흰 나비',
            c: `border:2px solid rgba(240,238,232,0.85); border-radius:7px;
                background-image:
                    linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.30) 50%, transparent 65%),
                    radial-gradient(circle at 10% 14%, rgba(255,255,255,0.55) 0 3px, transparent 4px),
                    radial-gradient(circle at 90% 86%, rgba(255,255,255,0.55) 0 3px, transparent 4px);
                background-size:250% 100%, 100% 100%, 100% 100%;
                box-shadow:0 0 18px rgba(240,238,232,0.45), inset 0 0 16px rgba(255,255,255,0.15);
                animation:nfSilk 6.5s linear infinite;`
        }
    ];

    // 이미 들어 있으면 건너뛴다
    const have = new Set(FRAMES.map(f => f.id));
    let added = 0;
    NEW.forEach(function (f) {
        if (have.has(f.id)) return;
        FRAMES.push(f);
        added++;
    });

    // ==========================================
    // 규칙 깔기 — frames.js 는 한 번만 만들고 끝나므로 따로 깐다
    // ==========================================
    const SCOPE = [
        '',
        'html body ',
        'body[data-ui-skin] #app-container ',
        'body[data-ui-skin] .modal-overlay ',
        'body[data-ui-skin] #custom-alert-overlay ',
        'body[data-ui-skin] #luxury-alert-overlay ',
        'body[data-ui-skin] #vip-invite-overlay ',
        'body[data-ui-skin] #fox-nameplate-overlay '
    ];
    function bang(decl) {
        return decl.split(';').map(x => x.trim()).filter(Boolean)
            .map(d => /!important/.test(d) ? d : d + ' !important').join('; ') + ';';
    }
    let rules = '';
    NEW.forEach(function (f) {
        if (!f.c) return;
        const sel = SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap').join(',\n');
        rules += sel + ' { ' + bang(f.c) + ' border-radius:7px !important; }\n';
    });
    const st2 = document.createElement('style');
    st2.id = 'new-frames-rules';
    st2.textContent = rules;
    document.head.appendChild(st2);

    // 등급별 자리 맞추기 — 견본첩이 등급 순으로 그린다면 다시 세운다
    const ORDER = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    FRAMES.sort(function (a, b) {
        if (ORDER[a.g] !== ORDER[b.g]) return ORDER[a.g] - ORDER[b.g];
        return a.id < b.id ? -1 : 1;
    });

    console.log('[테두리] 신규 ' + added + '종 추가 — 전체 ' + FRAMES.length + '종');
})();

// 확인용
function listNewFrames() {
    const ids = ['n01','n02','n03','n04','n05','n06','n07','n08','n09','n10'];
    const rows = FRAMES.filter(f => ids.indexOf(f.id) !== -1)
        .map(f => ({ 번호: f.id, 등급: f.g, 이름: f.n }));
    console.table(rows);
    console.log('전체 테두리: ' + FRAMES.length + '종');
    const byG = {};
    FRAMES.forEach(f => { byG[f.g] = (byG[f.g] || 0) + 1; });
    console.log('등급별:', Object.keys(byG).sort().map(g => g + ' ' + byG[g]).join(' · '));
}