// ==========================================
// 묶음 03.js — 34개
// build.mjs 가 만든 것입니다. 여기를 고치지 말고 원본 파일을 고치세요.
// ==========================================

// ---------- frames-new.js ----------
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
;

// ---------- frames-fix.js ----------
// ==========================================
// ★ 테두리 — 깜빡임 · 가림 보정
// index.html 에서 frames-new.js 다음에 불러온다
// ==========================================
//
// 1) 깜빡임
//    renderHistory 가 1초에 한 번 넘게 목록을 새로 그린다.
//    새로 그려진 칸에는 테두리 클래스가 없고,
//    40ms 뒤에 붙으니 그 사이 한 프레임이 맨몸으로 그려진다.
//    → 같은 프레임 안에서 바로 붙인다.
//
// 2) 가림
//    글자와 배경이 테두리에 바짝 붙어 있어 빛이 안 보인다.
//    → 여백을 주고, 잘리지 않게 하고, 위로 올린다.

(function fixFrames() {

    // ==========================================
    // 1. 같은 프레임 안에서 붙인다
    // ==========================================
    if (typeof frRefresh === 'function') {
        ['updateUI', 'renderHistory', 'renderEmployeeCards', 'renderBadgePhoto'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._frSync) return;
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                try { frRefresh(); } catch (e) { /* 무시 */ }
                return r;
            };
            window[n]._frSync = true;
        });
        console.log('[테두리] 동기 적용으로 바꿨습니다.');
    }

    // ==========================================
    // 2. 여백 · 잘림 · 층
    // ==========================================
    const css = `
/* 테두리를 가진 칸은 위로 올리고, 빛이 잘리지 않게 한다 */
.fr-wrap {
    position: relative !important;
    z-index: 1;
    overflow: visible;
}

/* 글자가 테두리에 붙지 않게 */
#history-list-container .history-item.fr-wrap {
    padding: 11px 13px !important;
    margin: 0 3px 9px 3px !important;
    border-left-width: 2px !important;   /* 기본 3px 강조선이 테두리를 덮는다 */
}

/* 목록 상자가 빛을 잘라 먹지 않게 */
#history-list-container {
    padding: 4px 2px !important;
    overflow-x: visible !important;
}

/* 사원 열람 칸 */
#employee-cards-container .emp-list-card.fr-wrap {
    padding: 11px !important;
    margin: 0 3px 9px 3px !important;
}
#employee-cards-container {
    padding: 4px 2px !important;
    overflow-x: visible !important;
}

/* 사원증 사진 — 테두리가 사진에 먹히지 않게 안쪽으로 물린다 */
#badge-photo-display.fr-wrap {
    padding: 5px !important;
    box-sizing: border-box !important;
}
#badge-photo-display.fr-wrap img {
    border-radius: 4px;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 테두리 안쪽 내용은 항상 위에 */
.fr-wrap > * { position: relative; z-index: 2; }

/* 덧그리는 층은 절대 클릭을 먹지 않는다 */
.fr-wrap::before, .fr-wrap::after { pointer-events: none !important; }

/* 테두리 두른 칸 — 글자가 빛에 묻히지 않게 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap {
    background-color: rgba(8,8,11,0.88) !important;
    background-clip: padding-box !important;
}
#history-list-container .history-item.fr-wrap *,
#employee-cards-container .emp-list-card.fr-wrap * {
    text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 7px rgba(0,0,0,0.85) !important;
}
#history-list-container .history-item.fr-wrap .history-time {
    color: #b8b2a6 !important;
}
    
`;



    const st = document.createElement('style');
    st.id = 'frames-fix-css';
    st.textContent = css;
    document.head.appendChild(st);



    // ==========================================
    // 3. 깜빡임 점검
    // ==========================================
    window.frameFlickerTest = function (sec) {
        const s = (sec || 6) * 1000;
        const items = () => document.querySelectorAll('#history-list-container .history-item');
        let noFrame = 0, ticks = 0;

        console.log('%c[테두리] ' + (s / 1000) + '초 동안 지켜봅니다...', 'color:#c9a8ff');
        const iv = setInterval(function () {
            ticks++;
            const el = items();
            let bare = 0;
            el.forEach(function (x) {
                if (!x.classList.contains('fr-wrap')) bare++;
            });
            if (bare > 0) noFrame++;
        }, 50);

        setTimeout(function () {
            clearInterval(iv);
            console.log('  검사 ' + ticks + '회 중 테두리가 빠진 순간: ' + noFrame + '회');
            console.log(noFrame === 0
                ? '%c  ✓ 깜빡임 없음'
                : '%c  ✗ 아직 깜빡입니다 — frRefresh 가 비동기로 돌고 있습니다',
                noFrame === 0 ? 'color:#4CAF50' : 'color:#e53935');
        }, s);
    };

    console.log('[테두리] 보정 적용 — frameFlickerTest() 로 확인');
})();
;

// ---------- frames-pop.js ----------
// ==========================================
// ★ 테두리 — 벽지에 묻히지 않게
// index.html 에서 frames-fix.js 다음에 불러온다
// ==========================================
//
// 벽지 색과 테두리 색이 비슷하면 경계가 사라진다.
// 테두리 바깥에 어두운 선을 한 겹 둘러 떼어 놓는다.
// outline 은 border · box-shadow 와 겹치지 않아 안전하다.

const FRAME_POP = {
    ring: 2,          // 바깥 어두운 선 두께 (px)
    gap: 1,           // 테두리와 그 선 사이 틈 (px)
    dark: 0.72,       // 선의 짙기 (0~1)
    width: 3          // 테두리 자체 두께 (px)
};

function framePopCSS(o) {
    const c = Object.assign({}, FRAME_POP, o || {});
    return `
/* 바깥 분리선 — 벽지와 테두리를 떼어 놓는다 */
.fr-wrap {
    outline: ${c.ring}px solid rgba(0,0,0,${c.dark}) !important;
    outline-offset: ${c.gap}px !important;
}

/* 테두리를 조금 굵게 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap,
#badge-photo-display.fr-wrap {
    border-width: ${c.width}px !important;
}

/* 분리선이 잘리지 않게 자리를 넓힌다 */
#history-list-container .history-item.fr-wrap,
#employee-cards-container .emp-list-card.fr-wrap {
    margin: ${c.ring + c.gap + 2}px ${c.ring + c.gap + 2}px ${c.ring + c.gap + 7}px ${c.ring + c.gap + 2}px !important;
}
#history-list-container,
#employee-cards-container {
    padding: ${c.ring + c.gap + 2}px ${c.ring + c.gap}px !important;
}
#badge-photo-display.fr-wrap {
    margin: ${c.ring + c.gap + 2}px auto !important;
}

/* 견본첩 미리보기도 같게 */
.fr-wrap[style*="34px"] {
    outline-width: 1px !important;
    outline-offset: 1px !important;
}
`;
}

function applyFramePop(o) {
    let st = document.getElementById('frame-pop-css');
    if (!st) {
        st = document.createElement('style');
        st.id = 'frame-pop-css';
        document.head.appendChild(st);
    }
    st.textContent = framePopCSS(o);
}

applyFramePop();

// ==========================================
// 콘솔에서 바로 조절
//   framePop({ ring:3, dark:0.85, width:4 })
//   framePop('off')   끄기
//   framePop('on')    다시 켜기
// ==========================================
function framePop(o) {
    if (o === 'off') {
        const st = document.getElementById('frame-pop-css');
        if (st) st.textContent = '';
        console.log('[테두리] 분리선을 껐습니다.');
        return;
    }
    if (o === 'on' || o === undefined) {
        applyFramePop();
        console.log('[테두리] 지금 설정:', JSON.stringify(FRAME_POP));
        console.log('  바꾸려면 framePop({ ring:3, gap:2, dark:0.85, width:4 })');
        return;
    }
    Object.assign(FRAME_POP, o);
    applyFramePop();
    console.log('[테두리] 적용:', JSON.stringify(FRAME_POP));
}

console.log('[테두리] 분리선 적용 — framePop() 으로 조절');
;

// ---------- mobile-scroll.js ----------
// ==========================================
// ★ 모바일 스크롤 튕김 보정
// index.html 에서 frames-pop.js 다음에 불러온다
// ==========================================
//
// updateUI 가 자주 돌면서 목록을 통째로 다시 그린다.
// innerHTML 이 갈릴 때마다 스크롤 위치가 맨 위로 돌아가,
// 아래로 내리는 도중에 계속 튕긴다.
//
// 1) 내용이 같으면 아예 다시 그리지 않는다
// 2) 달라졌으면 스크롤 위치를 되돌려 놓는다
// 3) 보이지 않는 탭은 그리지 않는다

(function fixMobileScroll() {

    // ==========================================
    // 스크롤 지킴이
    // ==========================================
    function keepScroll(fnName, sel, tabSel) {
        if (typeof window[fnName] !== 'function') return false;
        if (window[fnName]._scrollKept) return true;

        const _f = window[fnName];
        window[fnName] = function () {
            if (typeof currentUser === 'undefined' || !currentUser) return _f.apply(this, arguments);
            // 안 보이는 탭이면 그리지 않는다
            if (tabSel) {
                const tab = document.querySelector(tabSel);
                if (tab && !tab.classList.contains('active')) return;
            }

            const el = document.querySelector(sel);
            const before = el ? el.innerHTML : null;
            const elTop = el ? el.scrollTop : 0;
            // 맨 밑에 있었는지 기억한다
            const atEnd = el ? (el.scrollHeight - el.scrollTop - el.clientHeight < 6) : false;
            const winTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            const docH = document.documentElement.scrollHeight;

            const r = _f.apply(this, arguments);

            const el2 = document.querySelector(sel);
            if (!el2) return r;

            // 내용이 그대로면 손대지 않는다
            if (before !== null && el2.innerHTML === before) return r;

            // 되돌려 놓는다 — 높이가 잡힌 뒤에 한 번 더
            const putBox = function () {
                if (atEnd) { el2.scrollTop = el2.scrollHeight; return; }
                if (!elTop) return;
                const max = Math.max(0, el2.scrollHeight - el2.clientHeight);
                el2.scrollTop = Math.min(elTop, max);
            };
            putBox();
            requestAnimationFrame(putBox);
            setTimeout(putBox, 60);

            if (winTop) {
                const put = function () {
                    const now = window.pageYOffset || document.documentElement.scrollTop || 0;
                    if (Math.abs(now - winTop) < 2) return;
                    // 문서가 짧아졌으면 그만큼만
                    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                    window.scrollTo(0, Math.min(winTop, max));
                };
                put();
                requestAnimationFrame(put);
                setTimeout(put, 60);
            }
            return r;
        };
        window[fnName]._scrollKept = true;
        return true;
    }

    const TARGETS = [
        ['renderInventory',      '#inventory-list-container',   '#rec-inventory'],
        ['renderEmployeeCards',  '#employee-cards-container',   null],
        ['renderHistory',        '#history-list-container',     '#rec-history'],
        ['renderLetters',        '#received-letters-container', '#rec-letters'],
        ['renderP2PLists',       '#p2p-received-list',          '#shop-p2p'],
        ['renderRegularShop',    '#regular-shop-items-container','#shop-regular'],
        ['renderAlienShop',      '#alien-items-container',      '#shop-alien'],
        ['renderQShop',          '#qshop-body',                 '#shop-unknown'],
        ['renderHouseStorage',   '#house-storage-body',         '#house-storage'],
        ['renderDarkLogs',       '#darkness-log-container',     '#dark-log'],
        ['loadBadgeInfo',        '#badge-note-display',         null],
        ['renderBadge',          '#badge-note-display',         null]
    ];

    (function hookAll() {
        let tries = 0;
        const iv = setInterval(function () {
            let left = 0;
            TARGETS.forEach(function (t) {
                if (!keepScroll(t[0], t[1], t[2])) left++;
            });
            if (left === 0 || ++tries > 40) {
                clearInterval(iv);
                const done = TARGETS.filter(t => typeof window[t[0]] === 'function' && window[t[0]]._scrollKept);
                console.log('[스크롤] ' + done.length + ' / ' + TARGETS.length + '곳 보정');
            }
        }, 500);
    })();

    // ==========================================
    // 스크롤 상자 자체를 손본다
    // ==========================================
    const css = `
/* 목록 상자 — 관성 스크롤과 경계 처리 */
#inventory-list-container,
#employee-cards-container,
#history-list-container,
#received-letters-container,
#my-suggestion-list,
#p2p-received-list,
#p2p-sent-list,
#darkness-log-container,
#mk-list,
#house-storage-body {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    scroll-behavior: auto;
}

/* 사원 열람 — 화면 높이에 맞춰 늘린다 */
#employee-cards-container {
    max-height: min(62vh, 520px) !important;
}

/* 소지품 — 잘리지 않게 아래 여백 */
#rec-inventory { padding-bottom: 24px; }
#tab-record .sub-panel { padding-bottom: 16px; }

/* 아래쪽 순위 막대에 가리지 않게 */
.container { padding-bottom: 72px; }

/* 손가락이 가로로 미끄러져도 세로 스크롤이 끊기지 않게 */
body { overscroll-behavior-y: none; }
`;
    const st = document.createElement('style');
    st.id = 'mobile-scroll-fix';
    st.textContent = css;
    document.head.appendChild(st);

    // ==========================================
    // 스크롤 중에는 다시 그리지 않는다
    // ==========================================
    let scrolling = false, tmr = null;
    window.addEventListener('scroll', function () {
        scrolling = true;
        clearTimeout(tmr);
        tmr = setTimeout(function () { scrolling = false; }, 400);
    }, { passive: true });

    // ==========================================
    // 어느 탭이든 스크롤 자리를 지킨다
    // ==========================================
    function snapAll() {
        const list = [];
        document.querySelectorAll('div, section, ul, ol').forEach(function (el) {
            if (el.scrollTop <= 0) return;
            if (el.scrollHeight - el.clientHeight < 8) return;
            list.push({
                el: el,
                top: el.scrollTop,
                end: (el.scrollHeight - el.scrollTop - el.clientHeight) < 6
            });
        });
        return { win: window.pageYOffset || document.documentElement.scrollTop || 0, list: list };
    }

    function restoreAll(s) {
        if (!s) return;
        const put = function () {
            s.list.forEach(function (x) {
                if (!x.el.isConnected) return;
                const max = Math.max(0, x.el.scrollHeight - x.el.clientHeight);
                x.el.scrollTop = x.end ? x.el.scrollHeight : Math.min(x.top, max);
            });
            if (s.win) {
                const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const now = window.pageYOffset || document.documentElement.scrollTop || 0;
                if (Math.abs(now - s.win) > 2) window.scrollTo(0, Math.min(s.win, max));
            }
        };
        put();
        requestAnimationFrame(put);
        setTimeout(put, 60);
    }

    (function hookUpdateUI() {
        const iv = setInterval(function () {
            if (typeof updateUI !== 'function') return;
            if (updateUI._scrollHeld) { clearInterval(iv); return; }
            const _u = updateUI;
            let pending = false;
            updateUI = function () {
                // 손가락으로 넘기는 중이면 미뤄 둔다
                if (scrolling) {
                    if (pending) return;
                    pending = true;
                    setTimeout(function () { pending = false; updateUI(); }, 500);
                    return;
                }
                const snap = snapAll();
                const r = _u.apply(this, arguments);
                restoreAll(snap);
                return r;
            };
            updateUI._scrollHeld = true;
            clearInterval(iv);
        }, 500);
    })();

    // ==========================================
    // 너무 자주 다시 그리는 곳을 묶는다 — 깜빡임 방지
    // ==========================================
    function throttleRender(fnName, ms) {
        if (typeof window[fnName] !== 'function') return false;
        if (window[fnName]._throttled) return true;
        const _f = window[fnName];
        let lastRun = 0, timer = null;
        window[fnName] = function () {
            const now = Date.now();
            const self = this, args = arguments;
            if (now - lastRun >= ms) {
                lastRun = now;
                return _f.apply(self, args);
            }
            // 너무 이르면 한 번만 뒤로 미룬다
            if (timer) return;
            timer = setTimeout(function () {
                timer = null; lastRun = Date.now();
                // 미뤄 둔 사이에 로그아웃되었을 수 있다
                if (typeof currentUser === 'undefined' || !currentUser) return;
                try { _f.apply(self, args); }
                catch (e) { console.warn('[스크롤] ' + fnName + ' 건너뜀:', e && e.message ? e.message : e); }
            }, ms - (now - lastRun));
        };
        window[fnName]._throttled = true;
        return true;
    }

    (function hookThrottle() {
        const SLOW = [['renderAlienShop', 2500], ['renderQShop', 2500], ['renderRegularShop', 1500]];
        let tries = 0;
        const iv = setInterval(function () {
            let left = 0;
            SLOW.forEach(function (t) { if (!throttleRender(t[0], t[1])) left++; });
            if (left === 0 || ++tries > 40) {
                clearInterval(iv);
                console.log('[스크롤] 다시 그리기 묶음 적용');
            }
        }, 500);
    })();

    // 확인용
    window.scrollFixState = function () {
        console.log('%c===== 스크롤 보정 =====', 'color:#c9a8ff; font-size:13px');
        console.table(TARGETS.map(function (t) {
            return {
                함수: t[0],
                있나: typeof window[t[0]] === 'function' ? 'O' : '-',
                보정: (typeof window[t[0]] === 'function' && window[t[0]]._scrollKept) ? 'O' : '-',
                상자: document.querySelector(t[1]) ? 'O' : '-'
            };
        }));
        console.log('updateUI 미루기:', (typeof updateUI === 'function' && updateUI._scrollHeld) ? 'O' : '-');
        console.log('body overflow:', document.body.style.overflow || '(기본)');
    };

    console.log('[스크롤] 모바일 보정 적용 — scrollFixState() 로 확인');
})();
;

// ---------- house-own.js ----------
// ==========================================
// ★ 사택 — 소유 등급과 이용 등급 분리
// index.html 에서 frames.js 다음에 불러온다
// ==========================================
//
// 소유 등급 : house.grade  (내 돈으로 올린 것. 룸메가 바뀌어도 안 변한다)
// 이용 등급 : houseGrade() (둘 중 높은 쪽. 같이 사는 동안만)

// --- 소유 등급 ---
function ownGrade(user) {
    const h = getHouse(user);
    return h.grade || 'D';
}

// --- 승급 시 소유 등급만 올린다 ---
(function fixUpgrade() {
    ['houseUpgrade', 'doHouseUpgrade', 'upgradeHouse'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const before = ownGrade(currentUser);
            const r = _f.apply(this, arguments);
            setTimeout(function () {
                const h = getHouse(currentUser);
                const cur = HOUSE_GRADES.indexOf(h.grade);
                const b = HOUSE_GRADES.indexOf(before);
                // 룸메 등급을 따라 뛰어오른 경우 되돌린다
                if (cur > b + 1) {
                    h.grade = HOUSE_GRADES[b + 1];
                    saveSelfFull();
                    updateUI();
                }
            }, 120);
            return r;
        };
    });
})();

// --- 화면에 소유·이용을 함께 표시 ---
(function showBoth() {
    if (typeof renderHouse !== 'function') return;
    const _r = renderHouse;
    renderHouse = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('house-main-body');
            if (!box || !currentUser || document.getElementById('house-owninfo')) return;
            const own = ownGrade(currentUser);
            const use = houseGrade(currentUser);
            const mate = getRoomie(currentUser);
            if (own === use && !mate) return;

            box.insertAdjacentHTML('afterbegin', `
                <div id="house-owninfo" style="background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:10px 12px; margin-bottom:11px; font-size:11px; line-height:1.8;">
                    내 명의 <b style="color:#c9a8ff;">${own}급</b> · ${HOUSE_INFO[own].name}
                    ${own !== use ? `<br>지금 쓰는 곳 <b style="color:#ffd700;">${use}급</b> · ${HOUSE_INFO[use].name}
                    <div style="font-size:10px; color:#888; margin-top:4px;">${mate ? mate.name + ' 사원의 집에 얹혀 있습니다. 나가면 ' + own + '급으로 돌아갑니다.' : ''}</div>` : ''}
                </div>`);
        }, 80);
        return r;
    };
})();

// ==========================================
// 상담사 콘솔 — 등급 조절
// ==========================================
function adminSetHouseGrade(g) {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    if (HOUSE_GRADES.indexOf(g) < 0) return;

    const done = [];
    const jobs = targets.map(function (code) {
        const u = db.users[code];
        if (!u) return null;
        if (!u.house) u.house = {};
        u.house.grade = g;
        const tmp = { history: (u.history || []).slice() };
        addHistoryLog(tmp, `[당국 개입] 사택 등급이 ${g}급(${HOUSE_INFO[g].name})으로 조정되었습니다.`);
        u.history = tmp.history;
        done.push(u.name);
        if (code === currentUser.code) {
            currentUser.house.grade = g;
            currentUser.history = tmp.history;
        }
        return updateUserFields(code, { house: u.house, history: tmp.history });
    }).filter(Boolean);

    Promise.all(jobs).then(function () {
        updateUI();
        renderAdminRoomList();
        showCustomAlert(`${done.length}명의 사택을 ${g}급으로 조정했습니다.\n(${done.join(', ')})`);
    });
}

(function addAdminPanel() {
    function put() {
        const list = document.getElementById('admin-room-list');
        if (!list || document.getElementById('admin-house-grade')) return;
        list.insertAdjacentHTML('beforebegin', `
            <div id="admin-house-grade" style="border-top:1px dashed #00838f; margin-top:11px; padding-top:11px;">
                <div style="font-size:10px; color:#4dd0e1; font-weight:bold; margin-bottom:6px;">사택 등급 조정</div>
                <div style="font-size:10px; color:#aaa; margin-bottom:8px; line-height:1.5;">
                    위 대상 목록에서 선택한 뒤 누르세요. 명의 등급이 바뀝니다.
                </div>
                <div style="display:flex; gap:4px;">
                    ${HOUSE_GRADES.map(g => `<button class="game-btn" style="flex:1; margin:0; padding:8px 4px; font-size:11px;" onclick="adminSetHouseGrade('${g}')">${g}급</button>`).join('')}
                </div>
            </div>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
    if (typeof openAdminScreen === 'function') {
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(put, 120);
            return r;
        };
    }
})();

// ==========================================
// 배정 목록에 명의 표시
// ==========================================
(function hookRoomList() {
    if (typeof renderAdminRoomList !== 'function') return;
    const _r = renderAdminRoomList;
    renderAdminRoomList = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('admin-room-list');
            if (!box) return;
            box.querySelectorAll('[data-code]').forEach(function (el) {
                const u = db.users[el.getAttribute('data-code')];
                if (!u) return;
                el.insertAdjacentHTML('beforeend',
                    `<div style="font-size:9px; color:#888;">명의 ${ownGrade(u)}급</div>`);
            });
        }, 60);
        return r;
    };
})();

console.log('[사택] 소유 등급 분리 적용');
;

// ---------- house-save.js ----------
// ==========================================
// ★ 사택 등급 저장 보정
// index.html 에서 house-own.js 다음에 불러온다
// ==========================================
//
// saveSelfFull() 의 SKIP 목록에 'house' 가 들어 있어서
// house.grade 가 파이어베이스로 안 올라간다.
// 등급만 따로, 직접 쓴다.

// --- 등급만 콕 집어 저장 ---
function saveHouseGrade(code, g) {
    if (typeof database === 'undefined' || !database) return Promise.resolve();
    const c = code || (currentUser && currentUser.code);
    if (!c || !g) return Promise.resolve();
    return database.ref('users/' + c + '/house/grade').set(g)
        .catch(e => console.error('[사택] 등급 저장 실패:', e));
}

function myHouseObj() {
    if (!currentUser) return null;
    if (typeof getHouse === 'function') {
        try { return getHouse(currentUser); } catch (e) { /* 무시 */ }
    }
    return currentUser.house || null;
}

function saveMyHouseGrade() {
    const h = myHouseObj();
    if (!h || !h.grade || !currentUser) return Promise.resolve();
    return saveHouseGrade(currentUser.code, h.grade);
}

// ==========================================
// grade 가 바뀌면 자동으로 저장
// ==========================================
let _hgWatched = null;      // 지금 감시 중인 house 객체
let _hgLastSaved = null;    // 마지막으로 저장한 값

function attachGradeWatcher() {
    const h = myHouseObj();
    if (!h || typeof h !== 'object') return false;

    // 이미 이 객체에 붙어 있으면 그만
    const desc = Object.getOwnPropertyDescriptor(h, 'grade');
    if (h === _hgWatched && desc && desc.get) return true;

    let val = h.grade;
    try {
        Object.defineProperty(h, 'grade', {
            configurable: true,
            enumerable: true,
            get: function () { return val; },
            set: function (v) {
                if (v === val) return;
                val = v;
                if (v && v !== _hgLastSaved && currentUser) {
                    _hgLastSaved = v;
                    saveHouseGrade(currentUser.code, v);
                }
            }
        });
        _hgWatched = h;
        _hgLastSaved = val;
        return true;
    } catch (e) {
        console.warn('[사택] 등급 감시 실패:', e);
        return false;
    }
}

// currentUser 나 house 객체가 통째로 갈리는 경우가 있어 자주 다시 붙인다
setInterval(function () {
    if (!currentUser) return;
    attachGradeWatcher();

    // 감시 밖에서 바뀐 경우를 위한 대조
    const h = myHouseObj();
    if (h && h.grade && h.grade !== _hgLastSaved) {
        _hgLastSaved = h.grade;
        saveHouseGrade(currentUser.code, h.grade);
    }
}, 1000);

attachGradeWatcher();

// ==========================================
// 함수 훅 — 늦게 정의되는 것도 잡는다
// ==========================================
(function hookLate() {
    let tries = 0;
    const done = {};

    function wrapRenderHouse() {
        if (done.renderHouse) return true;
        if (typeof renderHouse !== 'function') return false;
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            attachGradeWatcher();
            saveMyHouseGrade();
            return r;
        };
        done.renderHouse = true;
        return true;
    }

    function wrapAdmin() {
        if (done.admin) return true;
        if (typeof adminSetHouseGrade !== 'function') return false;
        const _f = adminSetHouseGrade;
        adminSetHouseGrade = function (g) {
            const r = _f.apply(this, arguments);
            try {
                const codes = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
                codes.forEach(function (c) { if (db.users[c]) saveHouseGrade(c, g); });
            } catch (e) { /* 무시 */ }
            saveMyHouseGrade();
            return r;
        };
        done.admin = true;
        return true;
    }

    function wrapHouseMove() {
        if (done.move) return true;
        if (typeof houseMove !== 'function') return false;
        const _f = houseMove;
        houseMove = function () {
            const r = _f.apply(this, arguments);
            attachGradeWatcher();
            saveMyHouseGrade();
            return r;
        };
        done.move = true;
        return true;
    }

    const iv = setInterval(function () {
        const a = wrapRenderHouse(), b = wrapAdmin(), c = wrapHouseMove();
        if ((a && b && c) || ++tries > 60) {
            clearInterval(iv);
            const miss = [];
            if (!done.renderHouse) miss.push('renderHouse');
            if (!done.admin) miss.push('adminSetHouseGrade');
            if (!done.move) miss.push('houseMove');
            if (miss.length) console.warn('[사택] 못 찾은 함수:', miss.join(', '));
        }
    }, 500);
})();

// ==========================================
// 수동 도구
// ==========================================
function fixHouseGrade(code, g) {
    if (!db.users[code]) { console.warn('그런 사번이 없습니다:', code); return; }
    if (!db.users[code].house) db.users[code].house = {};
    db.users[code].house.grade = g;
    saveHouseGrade(code, g).then(function () {
        console.log('[사택] ' + code + ' → ' + g + '급 저장 완료');
        if (typeof updateUI === 'function') updateUI();
    });
}

function checkHouseGrades() {
    if (typeof database === 'undefined' || !database) { console.warn('database 없음'); return; }
    database.ref('users').once('value').then(function (snap) {
        const server = snap.val() || {};
        const rows = [];
        Object.keys(db.users || {}).forEach(function (c) {
            const local = (db.users[c].house || {}).grade || '-';
            const remote = ((server[c] || {}).house || {}).grade || '-';
            if (local !== remote) rows.push({ 사번: c, 이름: db.users[c].name, 화면: local, 서버: remote });
        });
        if (!rows.length) console.log('%c[사택] 화면과 서버가 전부 일치합니다.', 'color:#4CAF50');
        else {
            console.warn('[사택] 안 맞는 사원 ' + rows.length + '명');
            console.table(rows);
            console.log('고치려면: fixHouseGrade(\'사번\', \'등급\')');
        }
    });
}

// 감시 상태 확인
function houseWatchState() {
    const h = myHouseObj();
    const desc = h ? Object.getOwnPropertyDescriptor(h, 'grade') : null;
    console.log('house 객체:', h ? '있음' : '없음');
    console.log('현재 등급:', h ? h.grade : '-');
    console.log('감시자 붙음:', !!(desc && desc.get) ? '예' : '아니오');
    console.log('마지막 저장값:', _hgLastSaved);
    if (!(desc && desc.get)) {
        console.log('다시 붙입니다...');
        console.log(attachGradeWatcher() ? '성공' : '실패');
    }
}

console.log('[사택] 등급 저장 보정 적용 — checkHouseGrades() · houseWatchState()');
;

// ---------- skin.js ----------
// ==========================================
// ★ 벽지 견본첩 — 무작위 고급 인터페이스
// index.html 에서 bank.js 다음에 불러온다
// ==========================================

// --- 아이템 등록 ---
ITEM_CATALOG['벽지 견본첩'] = {
    price: 50, usable: true, targetable: false, effect: 'ui_skin',
    desc: '넘길 때마다 다른 방이 나온다. 사용하면 단말의 색·무늬·글꼴이 무작위로 바뀐다. 해제하면 견본첩은 사라진다.'
};
const SKIN_ITEM = '벽지 견본첩';
const SKIN_DAILY = 5;   // 유쾌 판매소 하루 구매 한도
// 우주 쇼핑몰에는 넣지 않는다 (유쾌 판매소 고정 진열)
if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
    const i = ALIEN_ITEMS_POOL.indexOf(SKIN_ITEM);
    if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
}

// --- 재료 ---
// 색: 이름 붙은 팔레트 46종 (어두운 28 · 밝은 18)
// base 바탕 · panel 겉면 · accent 강조 · text 글씨
const SKIN_PALETTES = [
    // --- 어두운 계열 ---
    { name:'루비와 골드',          base:'#1a0709', panel:'#2a0e12', accent:'#d4af37' },
    { name:'버건디와 샴페인',      base:'#1c0a10', panel:'#2d1119', accent:'#e6c98f' },
    { name:'가닛과 로즈 골드',     base:'#1d0b0b', panel:'#2e1413', accent:'#e0a899' },
    { name:'코냑과 황동',          base:'#1b0f07', panel:'#2b180c', accent:'#c9a063' },
    { name:'호박과 앤틱 골드',     base:'#1a1206', panel:'#2a1d0b', accent:'#d9b25a' },
    { name:'마호가니와 골드',      base:'#190c08', panel:'#2a140d', accent:'#d4af37' },
    { name:'초콜릿과 샴페인',      base:'#140c08', panel:'#22150e', accent:'#e6c98f' },
    { name:'올리브와 브론즈',      base:'#12130a', panel:'#1e2012', accent:'#b58d57' },
    { name:'압생트와 샴페인',      base:'#0e150b', panel:'#182314', accent:'#d8d08a' },
    { name:'에메랄드와 골드',      base:'#06140e', panel:'#0c2218', accent:'#d4af37' },
    { name:'포레스트와 실버',      base:'#0a130d', panel:'#132117', accent:'#c0c7cf' },
    { name:'비취와 진주',          base:'#071413', panel:'#0e2220', accent:'#efe6d8' },
    { name:'딥 틸과 골드',         base:'#061416', panel:'#0c2326', accent:'#d4af37' },
    { name:'공작과 로즈 골드',     base:'#06121a', panel:'#0b1f2a', accent:'#e0a899' },
    { name:'사파이어와 플래티넘',  base:'#070d1c', panel:'#0e1830', accent:'#d9dde3' },
    { name:'코발트와 실버',        base:'#080c1a', panel:'#111a31', accent:'#c0c7cf' },
    { name:'네이비와 황동',        base:'#0a1020', panel:'#131c33', accent:'#c9a063' },
    { name:'미드나잇과 골드',      base:'#07091a', panel:'#0f132b', accent:'#d4af37' },
    { name:'인디고와 진주',        base:'#0c0b1f', panel:'#161433', accent:'#efe6d8' },
    { name:'자수정과 샴페인',      base:'#120a1c', panel:'#1e122d', accent:'#e6c98f' },
    { name:'로열 퍼플과 골드',     base:'#150821', panel:'#231034', accent:'#d4af37' },
    { name:'자두와 로즈 골드',     base:'#190a17', panel:'#2a1226', accent:'#e0a899' },
    { name:'로즈와 진주',          base:'#1c0b12', panel:'#2d131e', accent:'#efe6d8' },
    { name:'와인과 플래티넘',      base:'#1a0810', panel:'#2b0f1c', accent:'#d9dde3' },
    { name:'오닉스와 골드',        base:'#0b0b0c', panel:'#161618', accent:'#d4af37' },
    { name:'흑단과 실버',          base:'#0d0c0b', panel:'#1a1816', accent:'#c0c7cf' },
    { name:'차콜과 로즈 골드',     base:'#121315', panel:'#1d1f22', accent:'#e0a899' },
    { name:'슬레이트와 샴페인',    base:'#0f1318', panel:'#1a2029', accent:'#e6c98f' },
    // --- 밝은 계열 ---
    { name:'아이보리와 골드',      base:'#f7f1e3', panel:'#efe6d2', accent:'#9a7b2e', text:'#2b2418', light:true },
    { name:'진주와 로즈 골드',     base:'#f6efec', panel:'#ecdfd9', accent:'#a8665a', text:'#2e2220', light:true },
    { name:'샴페인 크림과 브론즈', base:'#f4ecdc', panel:'#e9dcc4', accent:'#8a6433', text:'#2a2016', light:true },
    { name:'포슬린과 코발트',      base:'#f4f6fa', panel:'#e6ebf3', accent:'#2c4a8a', text:'#1b2233', light:true },
    { name:'크림과 사파이어',      base:'#f6f2e8', panel:'#ebe4d4', accent:'#23407a', text:'#1d2230', light:true },
    { name:'스카이와 네이비',      base:'#eef4f9', panel:'#dde8f2', accent:'#2f4f6f', text:'#1a2632', light:true },
    { name:'민트와 골드',          base:'#eef6f1', panel:'#dfece4', accent:'#8c6e22', text:'#1c2a22', light:true },
    { name:'스노우와 에메랄드',    base:'#f5f7f6', panel:'#e6ece9', accent:'#1f6b4f', text:'#1a2621', light:true },
    { name:'세이지와 황동',        base:'#eef1ea', panel:'#dfe4d8', accent:'#7d6a2e', text:'#22271d', light:true },
    { name:'버터와 올리브',        base:'#faf5e3', panel:'#efe7cc', accent:'#5f6a2c', text:'#26281a', light:true },
    { name:'라벤더와 자수정',      base:'#f3f0f8', panel:'#e6e0f0', accent:'#5e3f8a', text:'#251e33', light:true },
    { name:'블러시와 버건디',      base:'#f8eeee', panel:'#efdede', accent:'#7a2436', text:'#2e1a1e', light:true },
    { name:'로즈 쿼츠와 로즈 골드', base:'#f7ecef', panel:'#eedce2', accent:'#9c5a66', text:'#2e2024', light:true },
    { name:'피치와 코퍼',          base:'#faf0e8', panel:'#f1e0d2', accent:'#9a5a34', text:'#2f2119', light:true },
    { name:'린넨과 월넛',          base:'#f3eee6', panel:'#e7dfd2', accent:'#6b4a2e', text:'#2a2118', light:true },
    { name:'페일 골드와 흑단',     base:'#f6f0dc', panel:'#ebe2c6', accent:'#3a3226', text:'#221e16', light:true },
    { name:'그레이지와 샴페인 골드', base:'#eeebe6', panel:'#e0dbd3', accent:'#8a7442', text:'#26231e', light:true },
    { name:'마블과 오닉스',        base:'#f2f2f0', panel:'#e4e4e1', accent:'#2a2a2a', text:'#1e1e1e', light:true }
];
const SKIN_PATTERNS = [
    { name: '핀스트라이프', css: a => `repeating-linear-gradient(90deg, ${a}1c 0 1px, transparent 1px 14px)`, size: 'auto' },
    { name: '다이아몬드',   css: a => `linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%), linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%)`, size: '28px 28px', pos: '0 0, 14px 14px' },
    { name: '아르데코',     css: a => `radial-gradient(circle at 50% 100%, transparent 38%, ${a}22 39% 41%, transparent 42% 58%, ${a}18 59% 61%, transparent 62%)`, size: '40px 20px' },
    { name: '격자',         css: a => `linear-gradient(${a}14 1px, transparent 1px), linear-gradient(90deg, ${a}14 1px, transparent 1px)`, size: '22px 22px' },
    { name: '진주 점',      css: a => `radial-gradient(${a}26 1.2px, transparent 1.7px)`, size: '16px 16px' },
    { name: '헤링본',       css: a => `repeating-linear-gradient(45deg, ${a}12 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, ${a}0e 0 2px, transparent 2px 12px)`, size: 'auto' },
    { name: '비단 결',      css: a => `repeating-linear-gradient(170deg, ${a}0c 0 1px, transparent 1px 5px), linear-gradient(180deg, ${a}10, transparent 40%, ${a}0a)`, size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' }
];
const SKIN_FONTS = [
    { family: 'Nanum Myeongjo', label: '나눔명조' },
    { family: 'Gowun Batang',   label: '고운바탕' },
    { family: 'Noto Serif KR',  label: '본명조' },
    { family: 'Hahmlet',        label: '함렛' },
    { family: 'Song Myung',     label: '송명' },
    { family: 'Diphylleia',     label: '산하엽' },
    { family: 'Gowun Dodum',    label: '고운돋움' }
];

// --- 도우미 ---
function skinPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function skinHslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + to(f(0)) + to(f(8)) + to(f(4));
}

let _skinFontsLoaded = false;
function loadSkinFonts() {
    if (_skinFontsLoaded) return;
    _skinFontsLoaded = true;
    const fam = SKIN_FONTS.map(f => 'family=' + f.family.replace(/ /g, '+') + ':wght@400;700').join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fam}&display=swap`;
    document.head.appendChild(link);
}

// --- 무작위 조합 ---
function rollUiSkin() {
    const pal = skinPick(SKIN_PALETTES);
    const pattern = skinPick(SKIN_PATTERNS);
    const font = skinPick(SKIN_FONTS);
    return {
        palette: pal.name,
        light: !!pal.light,
        base: pal.base,
        panel: pal.panel,
        accent: pal.accent,
        text: pal.text || '#f3ead8',
        pattern: SKIN_PATTERNS.indexOf(pattern),
        font: font.family,
        name: `${pal.name} · ${pattern.name} · ${font.label}`,
        since: Date.now()
    };
}


// --- 전체 인터페이스 스타일 ---
// 벽지가 적용되면 body 에 data-ui-skin 이 붙고, 아래 규칙이 소속·커플 테마 위에 덮인다.
// 색 섞기는 전부 JS 에서 미리 계산해 변수로 넣는다 (구형 모바일 브라우저 호환).
// 어둠 탐사 화면·오락기·여우 상담실·선녀탕은 고유 분위기를 지키도록 제외한다.
const SK_AREAS = [
    '#app-container',
    '.modal-overlay:not(#fox-modal):not(#bath-modal)',
    '#custom-alert-overlay',
    '#luxury-alert-overlay',
    '#vip-invite-overlay',
    '#fox-nameplate-overlay'
];
function skSel(list) {
    const parts = (Array.isArray(list) ? list : list.split(',')).map(x => x.trim()).filter(Boolean);
    return SK_AREAS.flatMap(a => parts.map(x => `body[data-ui-skin] ${a} ${x}`)).join(',\n');
}
function skLight(list) {
    const parts = (Array.isArray(list) ? list : list.split(',')).map(x => x.trim()).filter(Boolean);
    return SK_AREAS.flatMap(a => parts.map(x => `body[data-ui-skin-tone="light"] ${a} ${x}`)).join(',\n');
}
const V = n => `var(--sk-${n})`;

// 코드 곳곳에 직접 박혀 있는 어두운 배경들 (밝은 벽지에서 밝게 덮는다)
const SK_DARK_BG = [
    '[style*="background:#0"]', '[style*="background:#1"]', '[style*="background:#2"]', '[style*="background:#3"]',
    '[style*="background: #0"]', '[style*="background: #1"]', '[style*="background: #2"]',
    '[style*="background-color:#0"]', '[style*="background-color:#1"]', '[style*="background-color:#2"]',
    '[style*="background:rgba(0"]', '[style*="background: rgba(0"]', '[style*="background-color:rgba(0"]',
    '[style*="background:linear-gradient(145deg"]', '[style*="background: linear-gradient(145deg"]',
    '[style*="background:linear-gradient(160deg"]', '[style*="background:linear-gradient(180deg"]'
];

const SKIN_CSS = `
${skSel('.tabs-grid, .sub-tabs-grid')} {
    background: transparent !important;
    border-color: ${V('line')} !important;
}
${skSel('.tab-content')} {
    background: ${V('card')} !important;
    border: 1px solid ${V('line')} !important;
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px ${V('shadow')} !important;
}
${skSel('.sub-panel')} {
    background: ${V('well')} !important;
    border: 1px solid ${V('line')} !important;
    color: ${V('text')} !important;
}

${skSel('.game-btn, .action-buttons button, .step-btn, .btn-cancel, .admin-access-btn, .ranking-toggle-btn, .shop-item button, .inv-btn, .vip-nav-btn')} {
    background: linear-gradient(160deg, ${V('btn-top')}, ${V('panel')}) !important;
    border: 1px solid ${V('edge')} !important;
    color: ${V('accent-text')} !important;
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 2px 7px ${V('shadow')} !important;
    text-shadow: none !important;
    letter-spacing: 0.03em;
}
${skSel('.game-btn:active, .action-buttons button:active, .step-btn:active, .shop-item button:active, .inv-btn:active')} {
    background: linear-gradient(160deg, ${V('press-top')}, ${V('press-bot')}) !important;
}
${skSel('.game-btn:disabled, .shop-item button:disabled, .inv-btn:disabled, .step-btn:disabled')} {
    opacity: 0.4 !important;
    box-shadow: none !important;
}
${skSel('.inv-btn-use, .btn-submit, .login-btn, .custom-alert-btn, .luxury-alert-btn, #rec-badge .game-btn')} {
    background: linear-gradient(160deg, ${V('accent')}, ${V('accent-deep')}) !important;
    border: 1px solid ${V('accent')} !important;
    color: ${V('base')} !important;
    font-weight: 700 !important;
}
${skSel('.inv-btn-sell, .btn-cancel')} {
    background: transparent !important;
    color: ${V('text-dim')} !important;
    border-color: ${V('line')} !important;
}

${skSel('.tab, .sub-tab')} {
    background: ${V('tab')} !important;
    border: 1px solid ${V('line')} !important;
    color: ${V('text-dim')} !important;
    box-shadow: none !important;
}
${skSel('.tab.active, .sub-tab.active')} {
    background: linear-gradient(160deg, ${V('accent')}, ${V('accent-deep')}) !important;
    border-color: ${V('accent')} !important;
    color: ${V('base')} !important;
    font-weight: 700 !important;
}

${skSel('input, select, textarea, .bet-input, .badge-input, .bet-display')} {
    background: ${V('base')} !important;
    color: ${V('text')} !important;
    border: 1px solid ${V('edge-soft')} !important;
}
${skSel('input:focus, select:focus, textarea:focus')} {
    outline: none !important;
    border-color: ${V('accent')} !important;
    box-shadow: 0 0 0 2px ${V('halo')} !important;
}

${skSel('.id-card-badge, .modal-content, .inv-card, .shop-item, .emp-list-card, .status-item, .history-item, .letter-card, .suggestion-item, .admin-panel-box, .seotda-arena, .slot-window, .ranking-body, .custom-alert-box, .luxury-alert-box, .badge-photo-box, .badge-table, .pollution-container, .status-section')} {
    background: ${V('card')} !important;
    border-color: ${V('line')} !important;
    color: ${V('text')};
}
${skSel('.id-card-badge, .modal-content, .custom-alert-box, .luxury-alert-box')} {
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px ${V('shadow')} !important;
}
${skSel('.pollution-container, .status-section, .status-item')} {
    background: transparent !important;
    box-shadow: none !important;
}

${skSel('.panel-title, h2, h3, h4, .status-label, .serial-row, .pollution-header, .badge-table th')} {
    color: ${V('accent-text')} !important;
    border-color: ${V('line')} !important;
    letter-spacing: 0.04em;
}
${skSel('.status-value, .emp-name, .badge-table td, .emp-list-title, .inv-card-name, .header-info, .emp-meta')} {
    color: ${V('text')} !important;
}
${skSel('.status-value')} {
    color: ${V('accent-text')} !important;
}
${skSel('.emp-role-tag, .inv-card-qty, .status-tag')} {
    background: transparent !important;
    border: 1px solid ${V('edge')} !important;
    color: ${V('accent-text')} !important;
}
${skSel('.badge-table th')} {
    background: ${V('well')} !important;
}
${skSel('.badge-table th, .badge-table td')} {
    border-color: ${V('line')} !important;
}
${skSel('.pollution-bar-bg')} {
    background: ${V('base')} !important;
    border: 1px solid ${V('line')} !important;
}
${skSel('.inv-card-desc, .emp-list-sub, .history-time, .letter-meta')} {
    color: ${V('text-dim')} !important;
}

${skLight('[style*="color:#fff"], [style*="color: #fff"], [style*="color:#eee"], [style*="color:#ddd"], [style*="color: #ddd"], [style*="color:#ccc"], [style*="color:#bbb"], [style*="color:var(--theme-text)"]')} {
    color: ${V('text')} !important;
}
${skLight('[style*="color:#aaa"], [style*="color:#999"], [style*="color:#888"], [style*="color: #888"], [style*="color:#777"], [style*="color:#666"], [style*="color:#555"]')} {
    color: ${V('text-dim')} !important;
}
${skLight('[style*="color:#ffd700"], [style*="color:#d4af37"], [style*="color:#c9a8ff"], [style*="color:#d4bbff"], [style*="color:#7fd4d4"], [style*="color:#4fc3f7"]')} {
    color: ${V('accent-text')} !important;
}
${skLight(SK_DARK_BG)} {
    background: ${V('well')} !important;
    border-color: ${V('line')} !important;
    color: ${V('text')} !important;
}

${skSel('.custom-alert-msg, .luxury-alert-msg, #custom-alert-text, #luxury-alert-text, #vip-invite-text, #emp-detail-card-container, .modal-content > div, .modal-content > p, .modal-content label')} {
    color: ${V('text')} !important;
}
${skSel('.custom-alert-box, .luxury-alert-box, .modal-content')} {
    color: ${V('text')} !important;
}

body[data-ui-skin] #app-container *::-webkit-scrollbar-thumb { background: ${V('edge')} !important; }
body[data-ui-skin] #app-container *::-webkit-scrollbar-track { background: transparent !important; }
`;

function injectSkinStyle() {
    let st = document.getElementById('ui-skin-style');
    if (!st) {
        st = document.createElement('style');
        st.id = 'ui-skin-style';
        document.head.appendChild(st);
    }
    if (st.textContent !== SKIN_CSS) st.textContent = SKIN_CSS;
    // style.css 보다 뒤에 오도록 항상 맨 끝으로
    if (document.head.lastElementChild !== st) document.head.appendChild(st);
}

// 두 색을 섞는다 (t = b 쪽 비율 0~1)
function skinBlend(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// 밝기(0~1)
function skinLum(hex) {
    const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function skinContrast(a, b) {
    const l1 = skinLum(a), l2 = skinLum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
// 글씨로 쓸 강조색 — 바탕과 충분히 구분될 때까지 어둡게/밝게 민다
function skinReadable(accent, bg) {
    const toward = skinLum(bg) > 0.4 ? '#000000' : '#ffffff';
    let c = accent;
    for (let t = 0; t <= 0.8 && skinContrast(c, bg) < 4.5; t += 0.06) {
        c = skinBlend(accent, toward, t);
    }
    return c;
}

function skinVars(s) {
    const L = !!s.light;
    return {
        'accent': s.accent,
        'accent-text': skinReadable(s.accent, skinBlend(s.panel, s.accent, L ? 0.04 : 0.07)),
        'accent-on-base': skinReadable(s.accent, s.base),
        'base': s.base,
        'panel': s.panel,
        'text': s.text,
        'text-dim': s.text + (L ? 'a6' : 'b3'),
        'accent-deep': L ? skinBlend(s.accent, '#000000', 0.25) : skinBlend(s.accent, s.base, 0.3),
        'card': skinBlend(s.panel, s.accent, L ? 0.04 : 0.07),
        'well': L ? skinBlend(s.base, '#ffffff', 0.35) : skinBlend(s.base, s.accent, 0.05),
        'tab': skinBlend(s.panel, s.accent, L ? 0.05 : 0.06),
        'btn-top': L ? skinBlend(s.base, '#ffffff', 0.5) : skinBlend(s.panel, s.accent, 0.22),
        'press-top': skinBlend(s.panel, s.accent, L ? 0.2 : 0.38),
        'press-bot': skinBlend(s.panel, s.accent, L ? 0.08 : 0.12),
        'edge': s.accent + (L ? '99' : '8c'),
        'edge-soft': s.accent + (L ? '66' : '59'),
        'line': s.accent + (L ? '40' : '47'),
        'glint': L ? '#ffffffb3' : s.accent + '38',
        'halo': s.accent + '40',
        'shadow': L ? 'rgba(70,50,20,0.12)' : 'rgba(0,0,0,0.4)'
    };
}

// --- 적용 / 해제 ---
const SKIN_VAR_NAMES = ['accent','accent-text','accent-on-base','base','panel','text','text-dim','accent-deep','card','well','tab','btn-top','press-top','press-bot','edge','edge-soft','line','glint','halo','shadow'];
const SKIN_BODY_PROPS = SKIN_VAR_NAMES.map(n => '--sk-' + n).concat(['--theme-focus', '--theme-accent', '--theme-border', '--theme-text', '--theme-sub', '--theme-bg-grad', 'background-color', 'font-family']);

function applyUiSkin(user) {
    const s = user && user.uiSkin;
    const body = document.body;
    if (!s) {
        if (body.dataset.uiSkin) clearUiSkin(user);
        return;
    }
    loadSkinFonts();
    injectSkinStyle();

    // 소속·커플 테마 클래스를 걷어 낸다 (해제하면 다시 붙는다)
    Array.from(body.classList).forEach(c => {
        if (c.startsWith('theme-') || c.startsWith('cp-') || c === 'couple-themed') body.classList.remove(c);
    });

    const set = (k, v) => body.style.setProperty(k, v, 'important');
    const vars = skinVars(s);
    Object.keys(vars).forEach(k => set('--sk-' + k, vars[k]));
    set('--theme-focus', s.accent);
    set('--theme-accent', s.accent);
    set('--theme-border', s.accent + '66');
    set('--theme-text', s.text);
    set('--theme-sub', s.accent + 'aa');
    set('--theme-bg-grad', `linear-gradient(180deg, ${s.panel} 0%, ${s.base} 60%, ${s.panel} 100%)`);
    set('background-color', s.base);
    set('font-family', `'${s.font}', 'Noto Serif KR', serif`);

    const pat = SKIN_PATTERNS[s.pattern] || SKIN_PATTERNS[0];
    const cont = document.querySelector('.container');
    if (cont) {
        cont.style.setProperty('background-color', s.panel, 'important');
        cont.style.setProperty('background-image', pat.css(s.accent), 'important');
        cont.style.setProperty('background-size', pat.size || 'auto', 'important');
        cont.style.setProperty('background-position', pat.pos || '0 0', 'important');
    }

    // 커플링 무늬는 가린다
    const cp = document.getElementById('couple-emoji-bg');
    if (cp) cp.remove();

    const key = `${s.since}|${s.accent}|${s.base}`;
    body.dataset.uiSkin = key;
    body.dataset.uiSkinTone = s.light ? 'light' : 'dark';
}

function clearUiSkin(user) {
    const body = document.body;
    SKIN_BODY_PROPS.forEach(k => body.style.removeProperty(k));
    const cont = document.querySelector('.container');
    if (cont) ['background-color', 'background-image', 'background-size', 'background-position'].forEach(k => cont.style.removeProperty(k));
    delete body.dataset.uiSkin;
    delete body.dataset.uiSkinTone;

    // 원래 테마로 복귀
    if (user && user.couple) applyCoupleTheme(user);
    else if (user) applyDepartmentTheme(user);
}

// --- 사용 ---
function useUiSkin(itemName) {
    if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 소지품을 사용할 수 없습니다.'); return; }
    if (!(currentUser.inventory || []).includes(itemName)) return;

    const had = !!currentUser.uiSkin;
    const s = rollUiSkin();
    currentUser.uiSkin = s;
    removeItemFromInventory(currentUser, itemName, 1);
    addHistoryLog(currentUser, `[벽지 견본첩] ${had ? '방을 다시 꾸몄습니다' : '방을 꾸몄습니다'} — ${s.name}`);
    saveFields({ uiSkin: 1, inventory: 1, history: 1 });
    updateUI();
    showCustomAlert(`견본첩을 넘겼습니다.\n\n${s.name}\n\n해제하면 견본첩은 사라집니다.`);
}

function releaseUiSkin() {
    if (!currentUser || !currentUser.uiSkin) return;
    if (!confirm('해제하면 견본첩이 사라집니다.\n다시 쓰려면 새로 구해야 합니다.\n\n해제할까요?')) return;
    const name = currentUser.uiSkin.name;
    currentUser.uiSkin = null;
    addHistoryLog(currentUser, `[벽지 견본첩] 원래 방으로 돌아왔습니다. (${name})`);
    saveFields({ uiSkin: 1, history: 1 });
    clearUiSkin(currentUser);
    updateUI();
    showCustomAlert('원래 방으로 돌아왔습니다.');
}

function uiSkinCardHtml() {
    const s = currentUser && currentUser.uiSkin;
    if (!s) return '';
    return `
        <div class="ui-skin-card" style="background:${s.panel}; border:1px solid ${s.accent}; padding:12px; margin-bottom:12px; border-radius:6px;">
            <div style="font-size:10px; color:${s.accent}; font-weight:bold; margin-bottom:5px;">[벽지]</div>
            <div style="font-size:14px; color:${s.text}; font-weight:bold;">${s.name}</div>
            <div style="font-size:10px; color:${s.text}b3; margin-top:6px;">해제하면 견본첩은 사라집니다. 다른 견본첩을 쓰면 새로 꾸며집니다.</div>
            <button class="inv-btn" style="width:100%; margin-top:9px; padding:8px; background:linear-gradient(145deg,#555,#333); color:#ddd;" onclick="releaseUiSkin()">해제</button>
        </div>`;
}

// --- 기존 함수에 연결 ---
(function hookUiSkin() {
    const _useInventoryItem = useInventoryItem;
    useInventoryItem = function (itemName) {
        const c = ITEM_CATALOG[itemName];
        if (c && c.effect === 'ui_skin') { useUiSkin(itemName); return; }
        return _useInventoryItem.apply(this, arguments);
    };

    const _updateUI = updateUI;
    updateUI = function () {
        const r = _updateUI.apply(this, arguments);
        if (currentUser) applyUiSkin(currentUser);
        return r;
    };

    const _renderInventory = renderInventory;
    renderInventory = function () {
        const r = _renderInventory.apply(this, arguments);
        const box = document.getElementById('inventory-list-container');
        if (box && currentUser && currentUser.uiSkin && !box.querySelector('.ui-skin-card')) {
            box.insertAdjacentHTML('afterbegin', uiSkinCardHtml());
        }
        return r;
    };


    // 유쾌 판매소 — 벽지 견본첩 고정 진열 (하루 5개)
    const _getToday5ShopItems = getToday5ShopItems;
    getToday5ShopItems = function () {
        const list = _getToday5ShopItems.apply(this, arguments).filter(n => n !== SKIN_ITEM);
        return [SKIN_ITEM].concat(list);
    };

    const _buyRegularShopItem = buyRegularShopItem;
    buyRegularShopItem = function (itemId, itemName, price) {
        if (itemName !== SKIN_ITEM) return _buyRegularShopItem.apply(this, arguments);
        if (!buyGuard()) return;
        if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 상점을 이용할 수 없습니다.'); return; }

        const key = getShopCycleKey();
        if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
        if (!currentUser.purchaseRecord[key]) currentUser.purchaseRecord[key] = {};
        const bought = currentUser.purchaseRecord[key][itemId] || 0;
        if (currentUser.code !== 'kario0987' && bought >= SKIN_DAILY) { showCustomAlert(`벽지 견본첩은 하루 ${SKIN_DAILY}개까지 살 수 있습니다.`); return; }
        if (currentUser.points < price) { showLuxuryAlert(); return; }

        currentUser.points -= price;
        currentUser.purchaseRecord[key][itemId] = bought + 1;
        currentUser.inventory.push(itemName);
        addHistoryLog(currentUser, `[상점 구매] ${itemName} (-${price} P)`);
        saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
        updateUI();
    };

    const _renderRegularShop = renderRegularShop;
    renderRegularShop = function () {
        const r = _renderRegularShop.apply(this, arguments);
        const box = document.getElementById('regular-shop-items-container');
        if (!box || !currentUser) return r;
        // 벽지 줄의 잔여 표기를 하루 한도에 맞춘다
        const key = getShopCycleKey();
        const bought = ((currentUser.purchaseRecord || {})[key] || {})['item_' + SKIN_ITEM] || 0;
        const left = currentUser.code === 'kario0987' ? 99 : Math.max(0, SKIN_DAILY - bought);
        Array.from(box.querySelectorAll('.shop-item')).forEach(el => {
            if (!el.innerText.includes(SKIN_ITEM)) return;
            const info = el.querySelector('span[style*="color:#888"]');
            if (info) info.innerHTML = `${ITEM_CATALOG[SKIN_ITEM].desc} (잔여: ${left === 99 ? '무제한' : left + '/' + SKIN_DAILY + '개'})`;
            const btn = el.querySelector('button');
            if (btn) {
                const out = left === 0;
                btn.disabled = out;
                btn.innerText = out ? '품절' : ITEM_CATALOG[SKIN_ITEM].price + ' P';
                el.classList.toggle('sold-out', out);
            }
        });
        return r;
    };

    const _logout = logout;
    logout = function () {
        const r = _logout.apply(this, arguments);
        clearUiSkin(null);
        return r;
    };
})();
;

// ---------- invcat.js ----------
// ==========================================
// ★ 소지품 분류 — 카테고리별 접기
// index.html 에서 skin.js 다음에 불러온다
// ==========================================

const INV_CATS = [
    { id:'food',   name:'음식',        icon:'🍚', color:'#8bc34a' },
    { id:'heal',   name:'회복',        icon:'💊', color:'#4CAF50' },
    { id:'potion', name:'물약',        icon:'🧪', color:'#ba68c8' },
    { id:'equip',  name:'장비',        icon:'⚔',  color:'#d4af37' },
    { id:'dark',   name:'어둠 회수품', icon:'🕯', color:'#ff6b6b' },
    { id:'qshop',  name:'???',         icon:'◈',  color:'#c9a8ff' },
    { id:'alien',  name:'우주 쇼핑몰', icon:'🛸', color:'#00A2E8' },
    { id:'craft',  name:'조합 재료',   icon:'⚗',  color:'#7fd4d4' },
    { id:'etc',    name:'기타',        icon:'📦', color:'#888' }
];

// 물품 하나가 어느 칸에 들어가는지
function invCatOf(name) {
    const c = ITEM_CATALOG[name];
    if (!c) return 'etc';

    if (c.effect === 'food' || c.cookMat) return 'food';
    if (name.endsWith('물약')) return 'potion';
    if (String(c.effect || '').startsWith('equip')) return 'equip';

    // 조합 재료 — 레시피에 쓰이는 것
    if (typeof CRAFT_RECIPES !== 'undefined' &&
        CRAFT_RECIPES.some(r => r.mats.includes(name))) return 'craft';
    if (['두 번째 자리', '세 번째 자리', '확정 승인서'].includes(name)) return 'craft';

    if (c.darkOnly) return 'dark';
    if (c.qShop) return 'qshop';
    if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.includes(name)) return 'alien';
    if (c.effect === 'heal' || c.effect === 'radio' || c.effect === 'candy') return 'heal';

    return 'etc';
}

// 접힘 상태 — 사원 데이터에 남긴다
function invFolded(id) {
    const f = (currentUser && currentUser.invFold) || {};
    return !!f[id];
}

function toggleInvCat(id) {
    if (!currentUser) return;
    if (!currentUser.invFold) currentUser.invFold = {};
    currentUser.invFold[id] = !currentUser.invFold[id];
    saveFields({ invFold: 1 });
    renderInventory();
}

function invFoldAll(on) {
    if (!currentUser) return;
    currentUser.invFold = {};
    if (on) INV_CATS.forEach(c => { currentUser.invFold[c.id] = true; });
    saveFields({ invFold: 1 });
    renderInventory();
}

// 카드 하나를 어느 칸에 넣을지 — 이름표를 붙여 둔다
function invTagCards() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    Array.from(box.querySelectorAll('.inv-card')).forEach(el => {
        const nameEl = el.querySelector('.inv-card-name');
        if (!nameEl) return;
        el.dataset.invName = nameEl.innerText.trim();
    });
}

// 그려진 소지품 카드를 카테고리 박스로 옮긴다
function applyInvCats() {
    const box = document.getElementById('inventory-list-container');
    if (!box || !currentUser) return;
    if (box.querySelector('.inv-cat-wrap')) return;   // 이미 처리됨

    invTagCards();
    const cards = Array.from(box.querySelectorAll('.inv-card'));
    if (cards.length === 0) return;

    // 카드 앞쪽의 고정 블록(전용 장비·금고·커플링·장착 중 등)은 그대로 둔다
    const firstCard = cards[0];
    const head = [];
    let node = box.firstChild;
    while (node && node !== firstCard) {
        const next = node.nextSibling;
        head.push(node);
        node = next;
    }

    const groups = {};
    cards.forEach(el => {
        const id = invCatOf(el.dataset.invName || '');
        if (!groups[id]) groups[id] = [];
        groups[id].push(el);
    });

    const wrap = document.createElement('div');
    wrap.className = 'inv-cat-wrap';

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex; gap:6px; margin-bottom:10px;';
    bar.innerHTML = `
        <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:10px;" onclick="invFoldAll(false)">모두 펼치기</button>
        <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:10px;" onclick="invFoldAll(true)">모두 접기</button>`;
    wrap.appendChild(bar);

    INV_CATS.forEach(cat => {
        const list = groups[cat.id];
        if (!list || list.length === 0) return;

        const folded = invFolded(cat.id);
        const sec = document.createElement('div');
        sec.style.cssText = 'margin-bottom:10px;';

        const head2 = document.createElement('div');
        head2.style.cssText = `display:flex; justify-content:space-between; align-items:center; cursor:pointer;
            padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);
            border:1px solid ${cat.color}55; border-left:3px solid ${cat.color};`;
        head2.onclick = () => toggleInvCat(cat.id);
        head2.innerHTML = `
            <span style="font-size:12px; color:${cat.color}; font-weight:bold;">
                ${cat.icon} ${cat.name}
                <span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">${list.length}종</span>
            </span>
            <span style="font-size:10px; color:#888;">${folded ? '▲' : '▼'}</span>`;
        sec.appendChild(head2);

        const body = document.createElement('div');
        body.style.cssText = `margin-top:7px; ${folded ? 'display:none;' : ''}`;
        list.forEach(el => body.appendChild(el));
        sec.appendChild(body);

        wrap.appendChild(sec);
    });

    box.innerHTML = '';
    head.forEach(n => box.appendChild(n));
    box.appendChild(wrap);
}

// --- 기존 함수에 연결 ---
(function hookInvCat() {
    const _renderInventory = renderInventory;
    renderInventory = function () {
        const r = _renderInventory.apply(this, arguments);
        try { applyInvCats(); } catch (e) { console.warn('소지품 분류 실패:', e); }
        return r;
    };
})();
;

// ---------- letterbox.js ----------
// ==========================================
// ★ 익명 편지 보관함
// index.html 에서 invcat.js 다음에 불러온다
// ==========================================

// 받은 편지(letters)는 3장까지만 남고 밀려난다.
// 보관(kept)으로 옮긴 편지는 무제한으로 남는다.

function keptLetters() {
    if (!currentUser.keptLetters) currentUser.keptLetters = [];
    return currentUser.keptLetters;
}

function keepLetter(idx) {
    if (!currentUser.letters || !currentUser.letters[idx]) return;
    const l = currentUser.letters[idx];
    const kept = keptLetters();

    if (kept.some(k => k.id === l.id)) { showCustomAlert('이미 보관 중인 편지입니다.'); return; }

    kept.unshift(Object.assign({}, l, { keptAt: Date.now() }));
    currentUser.letters.splice(idx, 1);
    saveFields({ letters: 1, keptLetters: 1 });
    renderLetters();
    renderKeptLetters();
    showCustomAlert('보관함으로 옮겼습니다.');
}

function unkeepLetter(idx) {
    const kept = keptLetters();
    if (!kept[idx]) return;
    if (!confirm('보관함에서 지웁니다.\n되돌릴 수 없습니다.\n\n지울까요?')) return;
    kept.splice(idx, 1);
    saveFields({ keptLetters: 1 });
    renderKeptLetters();
}

function toggleKeptBox() {
    if (!currentUser) return;
    currentUser.keptOpen = !currentUser.keptOpen;
    saveFields({ keptOpen: 1 });
    renderKeptLetters();
}

function renderKeptLetters() {
    const box = document.getElementById('kept-letters-box');
    if (!box || !currentUser) return;

    const kept = keptLetters();
    const open = !!currentUser.keptOpen;

    box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;
            padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);
            border:1px solid var(--theme-border); border-left:3px solid var(--theme-focus); margin-bottom:8px;"
            onclick="toggleKeptBox()">
            <span style="font-size:12px; color:var(--theme-focus); font-weight:bold;">
                🗃 보관함
                <span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">${kept.length}장</span>
            </span>
            <span style="font-size:10px; color:#888;">${open ? '▼' : '▲'}</span>
        </div>
        <div style="${open ? '' : 'display:none;'}">
            ${kept.length === 0
                ? `<div style="font-size:11px; color:#666; padding:10px 0; text-align:center;">보관한 편지가 없습니다.</div>`
                : kept.map((l, i) => `
                    <div class="letter-card" style="position:relative;">
                        <div class="letter-meta">발신인: [익명] | ${l.date}</div>
                        <div class="letter-body">${l.content}</div>
                        <button onclick="unkeepLetter(${i})" style="position:absolute; top:8px; right:8px; background:transparent; border:none; color:#888; cursor:pointer; font-size:10px; font-weight:bold;">지움</button>
                    </div>`).join('')}
        </div>`;
}

// --- 기존 함수에 연결 ---
(function hookLetters() {
    const _renderLetters = renderLetters;
    renderLetters = function () {
        const r = _renderLetters.apply(this, arguments);

        // 받은 편지마다 [보관] 버튼을 붙인다
        const box = document.getElementById('received-letters-container');
        if (box && currentUser && (currentUser.letters || []).length > 0) {
            Array.from(box.querySelectorAll('.letter-card')).forEach((el, i) => {
                if (el.querySelector('.keep-btn')) return;
                el.insertAdjacentHTML('beforeend',
                    `<button class="keep-btn" onclick="keepLetter(${i})" style="position:absolute; top:8px; right:44px; background:transparent; border:none; color:var(--theme-focus); cursor:pointer; font-size:10px; font-weight:bold;">보관</button>`);
            });
        }

        // 보관함 영역이 없으면 만든다
        if (!document.getElementById('kept-letters-box')) {
            const panel = document.getElementById('rec-letters');
            if (panel) {
                panel.insertAdjacentHTML('beforeend',
                    `<div style="margin-top:14px; border-top:1px dashed #333; padding-top:12px;">
                        <div id="kept-letters-box"></div>
                     </div>`);
            }
        }
        renderKeptLetters();
        return r;
    };
})();
;

// ---------- spectate.js ----------
// ==========================================
// ★ 어둠 탐사 관전
// index.html 에서 letterbox.js 다음에 불러온다
// ==========================================
//
// 파티 방에서 방장이 관전을 켜면, 탐사 중인 파티가 목록에 뜬다.
// 관전자는 본문·판정·채팅을 전부 볼 수 있고 채팅에 끼어들 수 있다.
// 다만 선택지 버튼은 누를 수 없다.

let spectateId = null;       // 지금 보고 있는 파티
let spectateRef = null;
let spectateChatRef = null;
let spectateData = null;
let spectateChat = [];

// --- 방장: 관전 허용 토글 ---
function toggleSpectate() {
    const p = getMyParty();
    if (!p || !database) return;
    if (p.leader !== currentUser.code) { showCustomAlert('방장만 바꿀 수 있습니다.'); return; }
    database.ref(`darkParties/${p.id}/openView`).set(!p.openView);
}

// --- 탐사 중인 파티가 화면을 서버에 올린다 ---
function pushSpectateView(html, title) {
    if (!darkRun || !darkRun.isParty || !database) return;
    const p = darkParties[darkRun.partyId];
    if (!p || !p.openView) return;
    if (!darkRun.isLeader) return;              // 방장 화면만 중계한다

    database.ref(`darkViews/${darkRun.partyId}`).set({
        zone: darkRun.zone,
        zoneName: (DARK_ZONES[darkRun.zone] || {}).name || '',
        step: darkRun.step,
        title: title || '',
        html: String(html || '').slice(0, 20000),
        leaderName: p.leaderName || '',
        at: Date.now()
    });
}

function clearSpectateView(pid) {
    if (!database || !pid) return;
    database.ref('darkViews/' + pid).remove();
}

// --- 관전 목록 ---
function renderSpectateList() {
    const box = document.getElementById('spectate-list');
    if (!box || !currentUser) return;

    const list = Object.values(darkParties).filter(p =>
        p && p.state === 'RUNNING' && p.openView &&
        !(p.members && p.members[currentUser.code])
    );

    if (list.length === 0) {
        box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:18px 0;">공개된 탐사가 없습니다.</div>`;
        return;
    }

    box.innerHTML = list.map(p => {
        const z = DARK_ZONES[p.zone] || {};
        const alive = p.alive ? Object.keys(p.alive).length : 0;
        const names = p.members ? Object.values(p.members).map(m => m.name).join(', ') : '';
        return `
            <div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-bottom:9px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-family:monospace; font-size:10px; color:#ff6b6b; font-weight:bold;">${z.code || p.zone}</div>
                        <div style="font-size:13px; font-weight:bold; color:var(--theme-text); margin:3px 0;">${z.name || ''}</div>
                        <div style="font-size:10px; color:#999;">선임 <b>${p.leaderName}</b> · 생존 ${alive}명</div>
                        <div style="font-size:9px; color:#666; margin-top:3px;">${names}</div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:8px 12px; font-size:11px; flex-shrink:0;" onclick="startSpectate('${p.id}')">관전</button>
                </div>
            </div>`;
    }).join('');
}

// --- 관전 시작 ---
function startSpectate(pid) {
    if (darkRun) { showCustomAlert('탐사 중에는 관전할 수 없습니다.'); return; }
    if (!database) return;

    spectateId = pid;
    const ov = document.getElementById('spectate-overlay');
    if (ov) ov.style.display = 'flex';

    if (spectateRef) { try { spectateRef.off(); } catch (e) {} }
    spectateRef = database.ref('darkViews/' + pid);
    spectateRef.on('value', snap => {
        spectateData = snap.val();
        renderSpectateView();
    });

    if (spectateChatRef) { try { spectateChatRef.off(); } catch (e) {} }
    spectateChatRef = database.ref('darkChats/' + pid);
    spectateChatRef.on('value', snap => {
        const v = snap.val();
        spectateChat = v ? Object.values(v).sort((a, b) => a.at - b.at) : [];
        renderSpectateChat();
    });
}

function stopSpectate() {
    if (spectateRef) { try { spectateRef.off(); } catch (e) {} }
    if (spectateChatRef) { try { spectateChatRef.off(); } catch (e) {} }
    spectateRef = null; spectateChatRef = null;
    spectateId = null; spectateData = null; spectateChat = [];
    const ov = document.getElementById('spectate-overlay');
    if (ov) ov.style.display = 'none';
    renderSpectateList();
}

function renderSpectateView() {
    const head = document.getElementById('spec-code');
    const body = document.getElementById('spec-body');
    if (!body) return;

    if (!spectateData) {
        if (head) head.innerText = '연결 중...';
        body.innerHTML = `<div style="text-align:center; font-size:12px; color:#888; padding:40px 0;">화면을 받아오는 중입니다.<br><span style="font-size:10px;">선임의 화면이 바뀌면 여기에 나타납니다.</span></div>`;
        return;
    }

    if (head) head.innerText = `${spectateData.zone} · ${spectateData.leaderName}`;

    // 버튼은 눌리지 않게 잠근다
    const safe = String(spectateData.html || '')
        .replace(/onclick="[^"]*"/g, '')
        .replace(/ontouchstart="[^"]*"/g, '')
        .replace(/<button/g, '<button disabled');

    body.innerHTML = safe;
    body.scrollTop = 0;
}

function renderSpectateChat() {
    const log = document.getElementById('spec-chat-log');
    if (!log) return;

    if (spectateChat.length === 0) {
        log.innerHTML = `<div style="color:#666; font-size:11px; text-align:center; padding:14px 0;">아직 대화가 없습니다.</div>`;
        return;
    }
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 50;
    log.innerHTML = spectateChat.map(m => {
        const t = new Date(m.at);
        const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
        if (m.code === 'SYSTEM') {
            return `<div style="color:#888; font-style:italic; font-size:10px; margin-bottom:5px; text-align:center;">— ${m.text} <span style="color:#555;">${ts}</span></div>`;
        }
        const mine = m.code === currentUser.code;
        return `<div style="margin-bottom:5px; font-size:11px; line-height:1.6; ${mine ? 'text-align:right;' : ''}">
            <span style="color:${m.spec ? '#7fd4d4' : 'var(--theme-focus)'}; font-weight:bold;">${m.spec ? '👁 ' : ''}${m.name}</span>
            <span style="color:#ddd;">${m.text}</span>
            <span style="color:#555; font-size:9px; margin-left:4px;">${ts}</span>
        </div>`;
    }).join('');
    if (atBottom) log.scrollTop = log.scrollHeight;
}

function sendSpectateChat() {
    const input = document.getElementById('spec-chat-input');
    if (!input || !spectateId || !database) return;
    const text = input.value.trim();
    if (!text || text.length > 200) return;

    database.ref('darkChats/' + spectateId).push({
        code: currentUser.code,
        name: currentUser.name,
        text: text,
        spec: true,
        at: Date.now()
    });
    input.value = '';
}

// --- 화면 만들기 ---
function buildSpectateUI() {
    if (document.getElementById('spectate-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="spectate-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100dvh; background:#000; z-index:9999997; justify-content:center; align-items:flex-start; overflow:hidden;">
            <div style="width:100%; max-width:450px; height:100dvh; display:flex; flex-direction:column; background:#0a0a0a; box-shadow:0 0 60px rgba(127,212,212,0.15);">
                <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; padding:11px 14px; border-bottom:1px solid #2a2a2a; background:#0d0d0d;">
                    <div style="font-family:monospace; font-size:11px; color:#7fd4d4; font-weight:bold;" id="spec-code">관전</div>
                    <div style="display:flex; gap:7px; align-items:center;">
                        <span style="font-size:10px; color:#666;">👁 관전 중</span>
                        <button onclick="stopSpectate()" style="background:none; border:1px solid #333; color:#888; font-size:11px; padding:4px 10px; border-radius:4px; cursor:pointer;">나간다</button>
                    </div>
                </div>
                <div id="spec-body" style="flex:1; overflow-y:auto; padding:14px; -webkit-overflow-scrolling:touch; min-height:0; opacity:0.92;"></div>
                <div style="flex-shrink:0; border-top:1px solid #2a2a2a; background:#0d0d0d;">
                    <div id="spec-chat-log" style="height:26dvh; overflow-y:auto; padding:10px 12px; -webkit-overflow-scrolling:touch;"></div>
                    <div style="display:flex; gap:6px; padding:8px 10px; border-top:1px solid #1a1a1a;">
                        <input type="text" id="spec-chat-input" maxlength="200" placeholder="한마디 거든다..." style="flex:1; font-size:12px; padding:9px;" onkeypress="if(event.key==='Enter') sendSpectateChat()">
                        <button class="game-btn" style="margin:0; padding:9px 16px; font-size:11px; flex-shrink:0;" onclick="sendSpectateChat()">전송</button>
                    </div>
                </div>
            </div>
        </div>`);
}

// --- 기존 함수에 연결 ---
(function hookSpectate() {
    buildSpectateUI();

    // 탐사 화면이 바뀔 때마다 중계
    const _darkBox = darkBox;
    darkBox = function (title, text, extra, imgKey) {
        const html = _darkBox.apply(this, arguments);
        try { pushSpectateView(html, title); } catch (e) {}
        return html;
    };

    // 탐사가 끝나면 중계도 끝낸다
    const _finishDarkRun = finishDarkRun;
    finishDarkRun = function () {
        const pid = darkRun ? darkRun.partyId : null;
        const r = _finishDarkRun.apply(this, arguments);
        if (pid) clearSpectateView(pid);
        return r;
    };

    const _finishDarkDeath = finishDarkDeath;
    finishDarkDeath = function () {
        const pid = darkRun ? darkRun.partyId : null;
        const wasLeader = darkRun ? darkRun.isLeader : false;
        const r = _finishDarkDeath.apply(this, arguments);
        if (pid && wasLeader) clearSpectateView(pid);
        return r;
    };

    // 파티 방에 관전 스위치, 탐사 탭에 관전 목록
    const _renderPartyRoom = renderPartyRoom;
    renderPartyRoom = function (p, body) {
        const r = _renderPartyRoom.apply(this, arguments);
        const isLeader = p.leader === currentUser.code;
        const on = !!p.openView;
        const chat = body.querySelector('.pchat-wrap');
        const html = `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid ${on ? '#2a4a5a' : '#333'}; border-radius:6px; padding:10px 12px; margin-top:10px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:${on ? '#7fd4d4' : '#888'}; font-weight:bold;">👁 관전 ${on ? '허용' : '차단'}</div>
                    <div style="font-size:9px; color:#666; margin-top:3px;">켜면 다른 사원이 이 탐사를 볼 수 있습니다.</div>
                </div>
                ${isLeader
                    ? `<button class="game-btn" style="margin:0; padding:7px 12px; font-size:10px; flex-shrink:0;" onclick="toggleSpectate()">${on ? '끄기' : '켜기'}</button>`
                    : `<span style="font-size:9px; color:#666; flex-shrink:0;">방장만 변경</span>`}
            </div>`;
        if (chat) chat.insertAdjacentHTML('beforebegin', html);
        else body.insertAdjacentHTML('beforeend', html);
        return r;
    };

    const _renderDarkness = renderDarkness;
    renderDarkness = function () {
        const r = _renderDarkness.apply(this, arguments);
        const body = document.getElementById('darkness-body');
        if (body && !darkRun && !document.getElementById('spectate-list')) {
            body.insertAdjacentHTML('beforeend', `
                <div style="margin-top:16px; border-top:1px dashed #333; padding-top:12px; text-align:left;">
                    <div style="font-size:11px; color:#7fd4d4; font-weight:bold; margin-bottom:8px;">👁 공개된 탐사</div>
                    <div id="spectate-list"></div>
                </div>`);
            renderSpectateList();
        } else if (document.getElementById('spectate-list')) {
            renderSpectateList();
        }
        return r;
    }; 
})();
;

// ---------- invmark.js ----------
// ==========================================
// ★ 소지품 — 즐겨찾기 · 자물쇠 · 확인 팝업
// index.html 에서 house-own.js 다음에 불러온다
// ==========================================

// --- 저장소 ---
function invMark() {
    if (!currentUser) return { fav: {}, lock: {} };
    if (!currentUser.invMark) currentUser.invMark = { fav: {}, lock: {} };
    if (!currentUser.invMark.fav) currentUser.invMark.fav = {};
    if (!currentUser.invMark.lock) currentUser.invMark.lock = {};
    return currentUser.invMark;
}
function isFav(n) { return !!invMark().fav[n]; }
function isLock(n) { return !!invMark().lock[n]; }

function toggleFav(n) {
    const m = invMark();
    if (m.fav[n]) delete m.fav[n]; else m.fav[n] = true;
    saveFields({ invMark: 1 });
    renderInventory();
}
function toggleLock(n) {
    const m = invMark();
    if (m.lock[n]) {
        delete m.lock[n];
        saveFields({ invMark: 1 });
        renderInventory();
        return;
    }
    m.lock[n] = true;
    saveFields({ invMark: 1 });
    renderInventory();
}

// ==========================================
// 확인 팝업
// ==========================================
(function injectConfirm() {
    if (document.getElementById('inv-confirm-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="inv-confirm-overlay" class="modal-overlay" style="display:none; z-index:10006;">
            <div class="modal-content" style="max-width:340px; text-align:center;">
                <div id="inv-confirm-icon" style="font-size:30px; margin-bottom:11px;">📦</div>
                <div id="inv-confirm-text" style="font-size:13px; color:#eee; line-height:1.8; margin-bottom:9px;"></div>
                <div id="inv-confirm-sub" style="font-size:10px; color:#888; line-height:1.6; margin-bottom:18px;"></div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-cancel" style="flex:1; background:#444; border-color:#555 !important;" onclick="closeInvConfirm()">취소</button>
                    <button class="game-btn" id="inv-confirm-ok" style="flex:1; margin:0; padding:12px;">확인</button>
                </div>
            </div>
        </div>`);
})();

let _invCb = null;
function openInvConfirm(icon, text, sub, okLabel, cb) {
    document.getElementById('inv-confirm-icon').innerText = icon;
    document.getElementById('inv-confirm-text').innerHTML = text;
    document.getElementById('inv-confirm-sub').innerHTML = sub || '';
    const ok = document.getElementById('inv-confirm-ok');
    ok.innerText = okLabel || '확인';
    _invCb = cb;
    ok.onclick = function () { const f = _invCb; closeInvConfirm(); if (f) f(); };
    document.getElementById('inv-confirm-overlay').style.display = 'flex';
}
function closeInvConfirm() {
    document.getElementById('inv-confirm-overlay').style.display = 'none';
    _invCb = null;
}

// ==========================================
// 사용 · 판매 가로채기
// ==========================================
(function hookUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const self = this, args = arguments;
        if (window._invOk === itemName) { window._invOk = null; return _use.apply(self, args); }

        const cat = ITEM_CATALOG[itemName] || {};
        const eq = String(cat.effect || '').startsWith('equip');
        openInvConfirm(
            eq ? '⚙' : '📦',
            `<b>${itemName}</b><br>${eq ? '장착하시겠습니까?' : '사용하시겠습니까?'}`,
            cat.desc || '',
            eq ? '장착한다' : '사용한다',
            function () { window._invOk = itemName; useInventoryItem(itemName); }
        );
    };
})();

(function hookSell() {
    const _sell = sellInventoryItem;
    sellInventoryItem = function (itemName) {
        if (isLock(itemName)) {
            showCustomAlert(`'${itemName}'에 자물쇠가 걸려 있습니다.\n\n소지품에서 자물쇠를 풀어야 판매할 수 있습니다.`);
            return;
        }
        if (window._invSellOk === itemName) { window._invSellOk = null; return _sell.apply(this, arguments); }

        const price = getSellPrice(itemName);
        const cnt = (currentUser.inventory || []).filter(x => x === itemName).length;
        openInvConfirm('💰',
            `<b>${itemName}</b><br>판매하시겠습니까?`,
            `${price} P를 받습니다. · 보유 ${cnt}개${isFav(itemName) ? '<br><span style="color:#ffd700;">★ 즐겨찾기에 등록된 물품입니다.</span>' : ''}`,
            '판매한다',
            function () { window._invSellOk = itemName; sellInventoryItem(itemName); }
        );
    };
})();

// 타인 사용도 확인
(function hookTarget() {
    if (typeof openItemTargetModal !== 'function') return;
    const _o = openItemTargetModal;
    openItemTargetModal = function (itemName, isPotion) {
        const self = this, args = arguments;
        if (window._invTgtOk === itemName) { window._invTgtOk = null; return _o.apply(self, args); }
        const cat = ITEM_CATALOG[itemName] || {};
        openInvConfirm('🎯',
            `<b>${itemName}</b><br>다른 사원에게 쓰시겠습니까?`,
            cat.desc || '',
            '대상 고르기',
            function () { window._invTgtOk = itemName; openItemTargetModal(itemName, isPotion); }
        );
    };
})();

// ==========================================
// 목록에 버튼 붙이기 · 즐겨찾기 정렬
// ==========================================
(function hookRender() {
    if (typeof renderInventory !== 'function') return;
    const _r = renderInventory;
    renderInventory = function () {
        const r = _r.apply(this, arguments);
        // 반드시 같은 프레임 안에서 붙인다.
        // setTimeout 을 쓰면 버튼 없는 화면이 한 번 그려지고, 그만큼 높이가 출렁인다.
        try { decorateInv(); } catch (e) { console.warn('[소지품] 표식 실패:', e); }
        return r;
    };
})();

function decorateInv() {
    const box = document.getElementById('inventory-list-container');
    if (!box || !currentUser) return;

    const cards = Array.from(box.querySelectorAll('.inv-card'));
    if (cards.length === 0) return;

    cards.forEach(function (card) {
        const nameEl = card.querySelector('.inv-card-name');
        if (!nameEl) return;
        const n = nameEl.innerText.trim();
        if (card.dataset.invDone === n) return;
        card.dataset.invDone = n;

        // 이름 앞 표식
        card.querySelectorAll('.inv-badge').forEach(e => e.remove());
        let mark = '';
        if (isFav(n)) mark += '<span class="inv-badge" style="color:#ffd700; margin-right:3px;">★</span>';
        if (isLock(n)) mark += '<span class="inv-badge" style="color:#4fc3f7; margin-right:3px;">🔒</span>';
        if (mark) nameEl.insertAdjacentHTML('beforebegin', mark);

        // 버튼
        const grp = card.querySelector('.inv-btn-group');
        if (grp && !grp.querySelector('.inv-mark-btn')) {
            grp.insertAdjacentHTML('beforeend', `
                <button class="inv-btn inv-mark-btn" style="background:${isFav(n) ? '#5a4a1a' : '#2a2a2a'}; color:${isFav(n) ? '#ffd700' : '#888'};" onclick="toggleFav('${n.replace(/'/g, "\\'")}')">${isFav(n) ? '★' : '☆'}</button>
                <button class="inv-btn inv-mark-btn" style="background:${isLock(n) ? '#1a3a4a' : '#2a2a2a'}; color:${isLock(n) ? '#4fc3f7' : '#888'};" onclick="toggleLock('${n.replace(/'/g, "\\'")}')">${isLock(n) ? '🔒' : '🔓'}</button>`);
        }

        // 자물쇠면 판매 버튼 잠금
        const sell = card.querySelector('.inv-btn-sell');
        if (sell) {
            if (isLock(n)) {
                sell.disabled = true;
                sell.style.opacity = '0.35';
                sell.innerText = '잠김';
            } else {
                sell.disabled = false;
                sell.style.opacity = '';
            }
        }
    });

    // 즐겨찾기를 위로
    // invcat.js 가 카드를 분류 상자 안에 넣으므로, 같은 부모 안에서만 옮긴다.
    // box 를 기준으로 옮기면 insertBefore 가 터지고 높이가 출렁인다.
    const byParent = new Map();
    cards.forEach(function (c) {
        const e = c.querySelector('.inv-card-name');
        if (!e || !isFav(e.innerText.trim())) return;
        if (!byParent.has(c.parentElement)) byParent.set(c.parentElement, []);
        byParent.get(c.parentElement).push(c);
    });

    byParent.forEach(function (list, parent) {
        // 이미 맨 앞에 몰려 있으면 손대지 않는다
        const kids = Array.from(parent.querySelectorAll(':scope > .inv-card'));
        let sorted = true;
        for (let i = 0; i < list.length; i++) {
            if (kids[i] !== list[i]) { sorted = false; break; }
        }
        if (sorted) return;

        const anchor = kids[0];
        list.forEach(function (c) {
            if (c !== anchor) parent.insertBefore(c, anchor);
        });
    });
}

console.log('[소지품] 즐겨찾기 · 자물쇠 · 확인 팝업 적용');
;

// ---------- dna.js ----------
// ==========================================
// ★ DNA · 임신 아이템 70종
// index.html 에서 invmark.js 다음에 불러온다
// ==========================================

// ==========================================
// DNA — 사번 기반 고정값
// ==========================================
const DNA_BASE = ['A','T','G','C'];

function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
function seedRand(seed, n) {
    let x = seed + n * 2654435761;
    x = Math.imul(x ^ (x >>> 15), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function dnaOf(user) {
    if (!user) return '----';
    if (user.dna) return user.dna;
    const s = seedOf(user.code + '|' + (user.no || ''));
    let d = '';
    for (let i = 0; i < 8; i++) d += DNA_BASE[Math.floor(seedRand(s, i) * 4)];
    user.dna = d;
    if (user.code === (currentUser && currentUser.code)) saveFields({ dna: 1 });
    else updateUserFields(user.code, { dna: d });
    return d;
}

// 임신 성공률 — 같은 사람은 항상 같다
function sireRate(user) {                    // 시키는 쪽 0.5 ~ 35%
    const s = seedOf('sire|' + user.code);
    return Math.round((0.5 + seedRand(s, 1) * 34.5) * 10) / 10;
}
function bearRate(user) {                    // 되는 쪽 0.1 ~ 30%
    const s = seedOf('bear|' + user.code);
    return Math.round((0.1 + seedRand(s, 2) * 29.9) * 10) / 10;
}
// 물약 등으로 역할이 바뀌었을 때의 반대편 확률
function sireRateAlt(user) {
    const s = seedOf('sireAlt|' + user.code);
    return Math.round((0.5 + seedRand(s, 3) * 34.5) * 10) / 10;
}
function bearRateAlt(user) {
    const s = seedOf('bearAlt|' + user.code);
    return Math.round((0.1 + seedRand(s, 4) * 29.9) * 10) / 10;
}

// ==========================================
// 역할 판정
// ==========================================
function hasPotion(user, name) {
    return (user.timedEffects || []).some(e => e.name === name);
}
function genderOf(user) {
    return (user.badge && user.badge.gender) || '';
}

// 딸기맛 물약 — 확률을 무시한다
function hasSureBear(user) {
    return !!user && hasPotion(user, '딸기맛 물약');
}

// 남성에게 자궁을 주는 물약 — 하나라도 있으면 임신할 수 있다
const BEAR_POTIONS = ['우유맛 물약', '포도맛 물약', '망고맛 물약'];
// 여성에게서 임신 능력을 뺏는 물약 — 망고맛은 자궁 문신이라 해당 없다
const UNBEAR_POTIONS = ['우유맛 물약', '포도맛 물약'];

function hasBearPotion(user) {
    if (!user) return false;
    return BEAR_POTIONS.some(n => hasPotion(user, n));
}
function hasUnbearPotion(user) {
    if (!user) return false;
    return UNBEAR_POTIONS.some(n => hasPotion(user, n));
}
// 이전 이름 호환
function hasFlipPotion(user) { return hasBearPotion(user); }
const FLIP_POTIONS = BEAR_POTIONS;

// 다이아 보지 플러그를 차고 있는가
// 차고 있으면 새로 임신할 수 없다. 이미 임신한 것은 유지된다.
function hasVaginaPlug(user) {
    if (!user || !user.equippedWeapons) return false;
    return user.equippedWeapons.some(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w);
        return base === '다이아 보지 플러그';
    });
}

// 임신할 수 있는 쪽
//   남성 : 우유 · 포도 · 망고 중 하나라도 있으면 가능
//   여성 : 우유 · 포도가 없으면 가능 (망고는 자궁 문신이라 막지 않는다)
function canBear(user) {
    if (!user) return false;
    const g = genderOf(user);
    if (g === '남성') return hasBearPotion(user);
    if (g === '여성') return !hasUnbearPotion(user);
    return false;                      // 성별 미지정은 해당 없음
}

// 임신시킬 수 있는 쪽 — 받는 쪽이면 시킬 수 없다
function canSire(user) {
    if (!user) return false;
    if (!genderOf(user)) return false; // 성별 미지정은 해당 없음
    return !canBear(user);
}

// 지금 새로 임신할 수 있는가 (플러그까지 본다)
function canBearNow(user) {
    return canBear(user) && !hasVaginaPlug(user);
}

// 물약으로 역할이 뒤집혔는가
function roleFlipped(user) {
    const g = genderOf(user);
    if (!g) return false;
    if (g === '남성') return hasBearPotion(user);
    return hasUnbearPotion(user);
}

// 화면에 보여 줄 확률 (본인 것만)
function myRates(user) {
    const flip = roleFlipped(user);
    return {
        sire: canSire(user) ? (flip ? sireRateAlt(user) : sireRate(user)) : null,
        bear: canBear(user) ? (flip ? bearRateAlt(user) : bearRate(user)) : null
    };
}

// ==========================================
// 임신 아이템 70종
// ==========================================
const BIRTH_ITEMS = [
    // --- 오염 계열 20 ---
    { n:'솜을 채운 곰', e:'heal', v:18, d:'오염도 18% 회복.' },
    { n:'은빛 방울', e:'heal', v:25, d:'오염도 25% 회복.' },
    { n:'별 무늬 담요', e:'heal', v:15, d:'오염도 15% 회복.' },
    { n:'식지 않는 찻잔', e:'heal', v:30, d:'오염도 30% 회복.' },
    { n:'밤에만 켜지는 등', e:'b_blind', v:3, d:'3시간 동안 오염도가 오르지 않는다.' },
    { n:'두 겹 이불', e:'b_blind', v:5, d:'5시간 동안 오염도가 오르지 않는다.' },
    { n:'태엽 오르골', e:'b_blind', v:2, d:'2시간 동안 오염도가 오르지 않는다.' },
    { n:'말린 들꽃 묶음', e:'heal', v:12, d:'오염도 12% 회복.' },
    { n:'눈 위의 작은 자국', e:'heal', v:20, d:'오염도 20% 회복.' },
    { n:'아직 비어 있는 공책', e:'heal', v:22, d:'오염도 22% 회복.' },
    { n:'식은 우유 한 잔', e:'heal', v:10, d:'오염도 10% 회복.' },
    { n:'뒤집히지 않은 모래시계', e:'heal', v:16, d:'오염도 16% 회복.' },
    { n:'손바닥만 한 벙어리장갑', e:'heal', v:14, d:'오염도 14% 회복.' },
    { n:'가라앉은 거품', e:'heal', v:8, d:'오염도 8% 회복.' },
    { n:'처음 열린 창', e:'b_blind', v:4, d:'4시간 동안 오염도가 오르지 않는다.' },
    { n:'덜 여문 열매', e:'heal', v:9, d:'오염도 9% 회복.' },
    { n:'기울지 않는 저울', e:'heal', v:11, d:'오염도 11% 회복.' },
    { n:'물기가 남은 조약돌', e:'heal', v:13, d:'오염도 13% 회복.' },
    { n:'개켜 둔 손수건', e:'heal', v:17, d:'오염도 17% 회복.' },
    { n:'온기가 남은 방석', e:'heal', v:19, d:'오염도 19% 회복.' },

    // --- 공용시설 계열 20 ---
    { n:'반들거리는 첫 동전', e:'b_luck', v:2, d:'2시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'흔들면 우는 딸랑이', e:'b_ticket', v:3, d:'공용시설 이용 3회 추가.' },
    { n:'자개 단추', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'뒤집힌 카드', e:'b_luck', v:3, d:'3시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'세 번 굴린 주사위', e:'b_luck', v:1, d:'1시간 동안 공용시설 행운이 세 배가 된다.', mult:3 },
    { n:'접힌 영수증', e:'b_point', v:8000, d:'8,000 P를 얻는다.' },
    { n:'구겨진 지폐', e:'b_point', v:15000, d:'15,000 P를 얻는다.' },
    { n:'풀칠이 마른 봉투', e:'b_point', v:4000, d:'4,000 P를 얻는다.' },
    { n:'꽉 찬 저금통', e:'b_point', v:30000, d:'30,000 P를 얻는다.' },
    { n:'금이 간 유리구슬', e:'b_ticket', v:4, d:'공용시설 이용 4회 추가.' },
    { n:'짝 없는 양말', e:'b_ticket', v:1, d:'공용시설 이용 1회 추가.' },
    { n:'돌려 감은 태엽', e:'b_luck', v:2, d:'2시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'무늬가 지워진 딱지', e:'b_point', v:6000, d:'6,000 P를 얻는다.' },
    { n:'납작하게 눌린 빨대', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'한쪽만 남은 덧신', e:'b_point', v:9000, d:'9,000 P를 얻는다.' },
    { n:'맞지 않는 퍼즐 조각', e:'b_luck', v:4, d:'4시간 동안 공용시설 행운이 두 배가 된다.' },
    { n:'작게 접힌 종이배', e:'b_ticket', v:3, d:'공용시설 이용 3회 추가.' },
    { n:'구르다 멈춘 팽이', e:'b_point', v:12000, d:'12,000 P를 얻는다.' },
    { n:'숨겨 둔 사탕', e:'b_ticket', v:2, d:'공용시설 이용 2회 추가.' },
    { n:'잃어버린 이름표', e:'b_point', v:7000, d:'7,000 P를 얻는다.' },

    // --- 어둠 계열 20 ---
    { n:'어둠에서 온 노크', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'눈을 감고 그린 지도', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'풀리지 않는 매듭', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'숨을 참은 물병', e:'b_bonus', v:3, d:'다음 탐사의 모든 판정에 +3.' },
    { n:'따라 나온 그림자', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'세어지지 않는 구슬', e:'b_reroll', v:2, d:'다음 탐사에서 판정을 2회 다시 굴린다.' },
    { n:'울리지 않는 종', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'거꾸로 놓인 나침반', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'물에서 건진 열쇠', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'이름이 지워진 표찰', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'두 번 접힌 쪽지', e:'b_reroll', v:1, d:'다음 탐사에서 판정을 1회 다시 굴린다.' },
    { n:'빛을 담아 둔 병', e:'b_bonus', v:1, d:'다음 탐사의 모든 판정에 +1.' },
    { n:'돌아보지 않은 문', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'소리를 삼킨 주머니', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },
    { n:'마르지 않은 잉크', e:'b_bonus', v:2, d:'다음 탐사의 모든 판정에 +2.' },
    { n:'다섯 칸짜리 서랍', e:'b_guard', v:1, d:'다음 탐사에서 치명적 상황을 한 번 넘긴다.' },
    { n:'반으로 나눈 부적', e:'b_reroll', v:1, d:'다음 탐사에서 판정을 1회 다시 굴린다.' },
    { n:'접힌 무릎 담요', e:'b_bonus', v:1, d:'다음 탐사의 모든 판정에 +1.' },
    { n:'헤아리지 못한 별', e:'b_hide', v:1, d:'다음 탐사에서 지목을 한 번 피한다.' },
    { n:'먼저 놓인 발판', e:'b_dark', v:1, d:'어둠 탐사 횟수 1회 추가.' },

    // --- 복합 10 ---
    { n:'닮지 않은 초상', e:'b_mix', v:0, d:'오염도 15% 회복 · 공용시설 이용 2회 추가.', heal:15, ticket:2 },
    { n:'두 색으로 뜬 실타래', e:'b_mix', v:0, d:'오염도 20% 회복 · 다음 탐사 판정에 +2.', heal:20, bonus:2 },
    { n:'양쪽이 같은 팽이', e:'b_mix', v:0, d:'공용시설 이용 3회 추가 · 어둠 탐사 1회 추가.', ticket:3, dark:1 },
    { n:'어디에도 없던 무늬', e:'b_mix', v:0, d:'오염도 25% 회복 · 10,000 P.', heal:25, point:10000 },
    { n:'세 번째 서랍', e:'b_mix', v:0, d:'다음 탐사 판정에 +3 · 치명적 상황 1회 방어.', bonus:3, guard:1 },
    { n:'거울에 비친 초', e:'b_mix', v:0, d:'오염도 18% 회복 · 3시간 행운 두 배.', heal:18, luck:3 },
    { n:'이름이 둘인 책', e:'b_mix', v:0, d:'공용시설 4회 · 15,000 P.', ticket:4, point:15000 },
    { n:'웃는 쪽만 남은 가면', e:'b_mix', v:0, d:'오염도 22% 회복 · 지목 1회 회피.', heal:22, hide:1 },
    { n:'두 번 부푼 풍선', e:'b_mix', v:0, d:'어둠 탐사 1회 · 재굴림 1회.', dark:1, reroll:1 },
    { n:'돌아온 종이비행기', e:'b_mix', v:0, d:'오염도 30% 회복 · 20,000 P · 공용시설 3회.', heal:30, point:20000, ticket:3 }
];

BIRTH_ITEMS.forEach(function (b) {
    ITEM_CATALOG[b.n] = {
        price: 300, usable: true, targetable: false,
        effect: b.e, value: b.v, birth: true, desc: '[출산] ' + b.d,
        heal: b.heal, ticket: b.ticket, bonus: b.bonus, dark: b.dark,
        point: b.point, luck: b.luck, hide: b.hide, reroll: b.reroll,
        guard: b.guard, mult: b.mult
    };
});

// ==========================================
// 고유 DNA 아이템 — 사원마다 하나, 자동 생성
// ==========================================
// ★ 고유 아이템 이름·효과는 dna-gifts.js 에서 정의한다

// ==========================================
// 출산 추첨
// ==========================================
// 아이템 등급 — 값이 클수록 좋은 것
function birthTier(it) {
    if (it.e === 'b_mix') return 3;                                  // 복합
   if (it.e === 'b_point') return it.v >= 15000 ? 3 : it.v >= 8000 ? 2 : 1;
    if (it.e === 'heal')    return it.v >= 25 ? 3 : it.v >= 15 ? 2 : 1;
    if (it.e === 'b_blind') return it.v >= 5 ? 3 : it.v >= 3 ? 2 : 1;
    if (it.e === 'b_luck')  return (it.mult === 3 || it.v >= 3) ? 3 : 2;
    if (it.e === 'b_ticket')return it.v >= 4 ? 3 : it.v >= 2 ? 2 : 1;
    if (it.e === 'b_guard' || it.e === 'b_reroll') return 3;
    if (it.e === 'b_bonus') return it.v >= 3 ? 3 : it.v >= 2 ? 2 : 1;
    if (it.e === 'b_hide')  return 2;
    if (it.e === 'b_dark')  return 2;
    return 1;
}

// 돌봄을 얼마나 채웠는가 (0 ~ 1)
// 이틀 동안 하루 8회씩, 총 16회가 만점
function careFill(preg) {
    if (!preg) return 0;
    const total = Object.values(preg.careCount || {}).reduce((a, b) => a + b, 0);
    const goal = (typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8) * 2;
    return Math.max(0, Math.min(1, total / goal));
}

// 출산 아이템 추첨
// fill 0 → 지금까지와 같다
// fill 1 → 상급이 훨씬 자주 나오고, 고유 아이템도 아주 조금 잘 나온다
function rollBirthItem(parentA, parentB, fill) {
    [parentA, parentB].forEach(function (p) { if (p) ensureDnaItem(p); });

    const f = Math.max(0, Math.min(1, fill || 0));

    // 고유 아이템 — 0.01% 에서 최대 0.04% 까지만
    const dnaRate = 0.0001 * (1 + f * 3);
    const r = Math.random();
    if (r < dnaRate && parentA) return dnaItemName(parentA);
    if (r < dnaRate * 2 && parentB) return dnaItemName(parentB);

    // 등급 가중치 — 다 채우면 상급이 여섯 배쯤 잘 나온다
    const W = {
        1: 1 - f * 0.75,          // 1.00 → 0.25
        2: 1 + f * 0.6,           // 1.00 → 1.60
        3: 0.45 + f * 2.35        // 0.45 → 2.80
    };

    let total = 0;
    const pool = BIRTH_ITEMS.map(function (it) {
        const w = W[birthTier(it)] || 1;
        total += w;
        return { it: it, w: w };
    });

    let x = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
        x -= pool[i].w;
        if (x <= 0) return pool[i].it.n;
    }
    return pool[pool.length - 1].it.n;
}

// ==========================================
// 출산 아이템 효과
// ==========================================
(function hookBirthUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || !cat.birth) return _use.apply(this, arguments);
        if (window._birthOk !== itemName) return _use.apply(this, arguments);
        window._birthOk = null;

        const msg = [];
        const heal = cat.heal || (cat.effect === 'heal' ? cat.value : 0);
        if (heal) { currentUser.pollution = Math.max(0, currentUser.pollution - heal); msg.push(`오염도 -${heal}%`); }
        if (cat.point) { currentUser.points += cat.point; msg.push(`+${cat.point.toLocaleString()} P`); }
         if (cat.ticket) {
            currentUser.birthAddedMax = Math.min(20, (currentUser.birthAddedMax || 0) + cat.ticket);
            msg.push(`공용시설 +${cat.ticket}회`);
        }
        if (cat.dark) { currentUser.darkTries = Math.max(0, (currentUser.darkTries || 0) - cat.dark); msg.push(`어둠 탐사 +${cat.dark}회`); }
        if (cat.effect === 'b_blind') {
            currentUser.blindfoldUntil = Math.max(currentUser.blindfoldUntil || 0, Date.now()) + cat.value * 3600000;
            msg.push(`${cat.value}시간 오염 동결`);
        }
        if (cat.effect === 'b_luck' || cat.luck) {
            const h = cat.luck || cat.value;
            addTimedEffect(currentUser, '아이의 운', `공용시설 행운 ${cat.mult === 3 ? '세' : '두'} 배`, h);
            msg.push(`${h}시간 행운 상승`);
        }
        if (cat.bonus) { if (typeof nAdd === 'function') nAdd('c_batt', cat.bonus); msg.push(`다음 탐사 판정 +${cat.bonus}`); }
        if (cat.guard) { if (typeof nAdd === 'function') nAdd('c_pain', cat.guard); msg.push(`치명 방어 ${cat.guard}회`); }
        if (cat.reroll) { if (typeof nAdd === 'function') nAdd('c_reroll', cat.reroll); msg.push(`재굴림 ${cat.reroll}회`); }
        if (cat.hide) { if (typeof nAdd === 'function') nAdd('no_mark', cat.hide); msg.push(`지목 회피 ${cat.hide}회`); }

        removeItemFromInventory(currentUser, itemName, 1);
        addHistoryLog(currentUser, `[출산품] ${itemName} 사용`);
        saveSelfFull();
        updateUI();
        showCustomAlert(`${itemName}\n\n${msg.join(' · ')}`);
    };
})();

// 확인 팝업을 거쳐 오도록
(function bridgeConfirm() {
    const _u = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (cat && cat.birth && window._invOk === itemName) {
            window._birthOk = itemName;
        }
        return _u.apply(this, arguments);
    };
})();

// 행운 효과 연결
(function hookLuckChild() {
    if (typeof facilityLuckMult !== 'function') return;
    const _f = facilityLuckMult;
    facilityLuckMult = function (user) {
        let m = _f.apply(this, arguments);
        const u = user || currentUser;
        if (u && (u.timedEffects || []).some(e => e.name === '아이의 운')) m *= 2;
        return m;
    };
})();

// 재굴림 연결
(function hookRerollChild() {
    if (typeof luckReroll !== 'function' || typeof nUse !== 'function') return;
    const _l = luckReroll;
    luckReroll = function (roll) {
        roll = _l.apply(this, arguments);
        if (darkRun && roll <= 7 && nUse('c_reroll')) {
            const nr = Math.floor(Math.random() * 20) + 1;
            if (typeof showDarkToast === 'function') showDarkToast(`◈ 다시 굴린다. (${roll} → ${nr})`);
            return nr;
        }
        return roll;
    };
})();

console.log('[DNA] 출산 아이템 70종 등록');
;

// ---------- dna-gifts.js ----------
// ==========================================
// ★ 유전자 고유 아이템 — 60종 (이름·성능 전부 다름)
// index.html 에서 dna.js 다음에 불러온다
// ==========================================
//
// 사원마다 하나씩, 이름도 성능도 겹치지 않는다.
// 장착형이다. 차고 있는 동안만 힘이 돈다.
//
//   gim   기믹 파훼 (탐사당 N회)
//   eva   판정 회피 (탐사당 N회)
//   luck  행운 (탐사당 N회 — 나쁜 결과를 한 번 뒤집는다)
//   bon   판정 보정 (탐사 내내 +N)
//   death 즉사 회피 (탐사당 1회)
//   pct   공용시설 행운 배율 (착용 중 영구)
//   dark  어둠 탐사 횟수 (착용 중 영구)
//   fac   공용시설 이용 횟수 (착용 중 영구)

const DNA_GIFTS = [
    { n:'불이 붙지 않는 성냥', e:{ death:1 }, p:100, d:'즉사 회피 1회' },
    { n:'눈을 감은 나침반', e:{ pct:600 }, p:125, d:'공용시설 행운 600%' },
    { n:'별빛을 담은 구슬', e:{ gim:1, luck:2, pct:300 }, p:102, d:'기믹 파훼 1회 · 행운 2회 · 공용시설 행운 300%' },
    { n:'하늘색 조각 퍼즐', e:{ eva:3, gim:1, pct:250 }, p:102, d:'기믹 파훼 1회 · 회피 3회 · 공용시설 행운 250%' },
    { n:'반쯤 녹은 서리 꽃', e:{ eva:2, gim:1, pct:280 }, p:99, d:'기믹 파훼 1회 · 회피 2회 · 공용시설 행운 280%' },
    { n:'잠들지 않는 등불', e:{ dark:3, luck:4 }, p:102, d:'행운 4회 · 어둠 탐사 +3회' },
    { n:'물결이 멈춘 유리병', e:{ bon:3, dark:3 }, p:102, d:'판정 +3 · 어둠 탐사 +3회' },
    { n:'달을 삼킨 조개', e:{ dark:3, gim:1 }, p:100, d:'기믹 파훼 1회 · 어둠 탐사 +3회' },
    { n:'첫눈이 남긴 실', e:{ eva:3, gim:2 }, p:98, d:'기믹 파훼 2회 · 회피 3회' },
    { n:'빛이 고인 깃털', e:{ bon:3, eva:4, luck:3 }, p:103, d:'회피 4회 · 행운 3회 · 판정 +3' },
    { n:'숨을 쉬는 모래시계', e:{ bon:2, dark:2, gim:1 }, p:102, d:'기믹 파훼 1회 · 판정 +2 · 어둠 탐사 +2회' },
    { n:'안개로 짠 손수건', e:{ bon:1, dark:1, gim:2 }, p:102, d:'기믹 파훼 2회 · 판정 +1 · 어둠 탐사 +1회' },
    { n:'여덟 번 접힌 종이학', e:{ dark:2, fac:8, gim:1 }, p:102, d:'기믹 파훼 1회 · 어둠 탐사 +2회 · 공용시설 +8회' },
    { n:'녹지 않는 얼음 열쇠', e:{ bon:3, eva:3, luck:4 }, p:102, d:'회피 3회 · 행운 4회 · 판정 +3' },
    { n:'소리가 나지 않는 방울', e:{ dark:2, eva:4, luck:2 }, p:102, d:'회피 4회 · 행운 2회 · 어둠 탐사 +2회' },
    { n:'노을을 가둔 호박', e:{ dark:2, eva:4, fac:6 }, p:102, d:'회피 4회 · 어둠 탐사 +2회 · 공용시설 +6회' },
    { n:'뿌리 없는 유리 꽃', e:{ dark:3, fac:6, luck:2 }, p:102, d:'행운 2회 · 어둠 탐사 +3회 · 공용시설 +6회' },
    { n:'밤을 적신 리본', e:{ bon:1, dark:3, fac:8 }, p:102, d:'판정 +1 · 어둠 탐사 +3회 · 공용시설 +8회' },
    { n:'그림자가 없는 촛대', e:{ eva:4, gim:1, luck:3 }, p:101, d:'기믹 파훼 1회 · 회피 4회 · 행운 3회' },
    { n:'바람이 새긴 문양', e:{ bon:1, fac:7, gim:2 }, p:101, d:'기믹 파훼 2회 · 판정 +1 · 공용시설 +7회' },
    { n:'이슬이 굳은 목걸이', e:{ dark:2, eva:3, luck:3 }, p:101, d:'회피 3회 · 행운 3회 · 어둠 탐사 +2회' },
    { n:'금이 가지 않는 거울 조각', e:{ dark:2, fac:7, luck:4 }, p:101, d:'행운 4회 · 어둠 탐사 +2회 · 공용시설 +7회' },
    { n:'별자리를 옮긴 지도', e:{ bon:3, dark:2, fac:7 }, p:101, d:'판정 +3 · 어둠 탐사 +2회 · 공용시설 +7회' },
    { n:'심장을 닮은 씨앗', e:{ eva:3, gim:1, luck:4 }, p:100, d:'기믹 파훼 1회 · 회피 3회 · 행운 4회' },
    { n:'잠긴 물의 반지', e:{ bon:3, eva:3, gim:1 }, p:100, d:'기믹 파훼 1회 · 회피 3회 · 판정 +3' },
    { n:'구름을 뜬 국자', e:{ bon:1, eva:2, gim:2 }, p:100, d:'기믹 파훼 2회 · 회피 2회 · 판정 +1' },
    { n:'빗물로 만든 방울', e:{ bon:2, eva:4, luck:4 }, p:100, d:'회피 4회 · 행운 4회 · 판정 +2' },
    { n:'시들지 않는 마른 잎', e:{ dark:2, eva:2, luck:4 }, p:100, d:'회피 2회 · 행운 4회 · 어둠 탐사 +2회' },
    { n:'온기가 남은 재', e:{ eva:4, fac:8, luck:4 }, p:100, d:'회피 4회 · 행운 4회 · 공용시설 +8회' },
    { n:'파도가 놓고 간 열쇠', e:{ bon:3, dark:2, eva:2 }, p:100, d:'회피 2회 · 판정 +3 · 어둠 탐사 +2회' },
    { n:'천천히 도는 팽이', e:{ bon:3, eva:4, fac:8 }, p:100, d:'회피 4회 · 판정 +3 · 공용시설 +8회' },
    { n:'깃털보다 가벼운 돌', e:{ dark:2, fac:7, gim:1 }, p:99, d:'기믹 파훼 1회 · 어둠 탐사 +2회 · 공용시설 +7회' },
    { n:'두 번 피는 꽃봉오리', e:{ bon:1, dark:3, fac:7 }, p:99, d:'판정 +1 · 어둠 탐사 +3회 · 공용시설 +7회' },
    { n:'이름이 지워진 부적', e:{ bon:2, eva:4, gim:1 }, p:98, d:'기믹 파훼 1회 · 회피 4회 · 판정 +2' },
    { n:'빛을 먹는 수정', e:{ dark:2, eva:2, gim:1 }, p:98, d:'기믹 파훼 1회 · 회피 2회 · 어둠 탐사 +2회' },
    { n:'흐르지 않는 모래', e:{ eva:4, fac:8, gim:1 }, p:98, d:'기믹 파훼 1회 · 회피 4회 · 공용시설 +8회' },
    { n:'메아리를 담은 잔', e:{ bon:1, gim:2, luck:2 }, p:98, d:'기믹 파훼 2회 · 행운 2회 · 판정 +1' },
    { n:'서리로 쓴 편지', e:{ bon:1, fac:6, gim:2 }, p:98, d:'기믹 파훼 2회 · 판정 +1 · 공용시설 +6회' },
    { n:'꺼지지 않는 반딧불', e:{ dark:1, eva:4, luck:4 }, p:98, d:'회피 4회 · 행운 4회 · 어둠 탐사 +1회' },
    { n:'바늘 없는 나침반', e:{ bon:1, dark:3, eva:2 }, p:98, d:'회피 2회 · 판정 +1 · 어둠 탐사 +3회' },
    { n:'무게가 없는 열매', e:{ bon:2, dark:2, eva:3 }, p:98, d:'회피 3회 · 판정 +2 · 어둠 탐사 +2회' },
    { n:'은빛으로 굳은 물방울', e:{ bon:3, dark:1, eva:4 }, p:98, d:'회피 4회 · 판정 +3 · 어둠 탐사 +1회' },
    { n:'하늘을 비춘 손거울', e:{ dark:2, eva:3, fac:8 }, p:98, d:'회피 3회 · 어둠 탐사 +2회 · 공용시설 +8회' },
    { n:'뒤집히지 않는 모래시계', e:{ bon:3, dark:2, luck:2 }, p:98, d:'행운 2회 · 판정 +3 · 어둠 탐사 +2회' },
    { n:'달빛으로 뜬 실타래', e:{ dark:2, fac:6, luck:4 }, p:98, d:'행운 4회 · 어둠 탐사 +2회 · 공용시설 +6회' },
    { n:'소리를 삼킨 종', e:{ bon:3, dark:2, fac:6 }, p:98, d:'판정 +3 · 어둠 탐사 +2회 · 공용시설 +6회' },
    { n:'계절을 건너뛴 봉오리', e:{ bon:3, gim:1, luck:3 }, p:97, d:'기믹 파훼 1회 · 행운 3회 · 판정 +3' },
    { n:'젖지 않는 종이배', e:{ eva:4, fac:7, luck:4 }, p:97, d:'회피 4회 · 행운 4회 · 공용시설 +7회' },
    { n:'빛이 새는 조약돌', e:{ bon:3, eva:4, fac:7 }, p:97, d:'회피 4회 · 판정 +3 · 공용시설 +7회' },
    { n:'닫히지 않는 작은 문', e:{ bon:1, eva:3, gim:1, luck:3 }, p:103, d:'기믹 파훼 1회 · 회피 3회 · 행운 3회 · 판정 +1' },
    { n:'별을 세던 주판', e:{ dark:1, eva:2, gim:1, luck:3 }, p:103, d:'기믹 파훼 1회 · 회피 2회 · 행운 3회 · 어둠 탐사 +1회' },
    { n:'녹슬지 않는 나사', e:{ eva:3, fac:7, gim:1, luck:2 }, p:103, d:'기믹 파훼 1회 · 회피 3회 · 행운 2회 · 공용시설 +7회' },
    { n:'숨을 참은 풍선', e:{ bon:2, fac:6, gim:1, luck:3 }, p:103, d:'기믹 파훼 1회 · 행운 3회 · 판정 +2 · 공용시설 +6회' },
    { n:'안개가 고인 병뚜껑', e:{ bon:1, fac:7, gim:1, luck:4 }, p:103, d:'기믹 파훼 1회 · 행운 4회 · 판정 +1 · 공용시설 +7회' },
    { n:'빛으로 엮은 매듭', e:{ bon:1, dark:2, eva:2, luck:3 }, p:103, d:'회피 2회 · 행운 3회 · 판정 +1 · 어둠 탐사 +2회' },
    { n:'돌아오지 않는 부메랑', e:{ bon:2, dark:1, eva:3, luck:3 }, p:103, d:'회피 3회 · 행운 3회 · 판정 +2 · 어둠 탐사 +1회' },
    { n:'얼지 않는 샘물 한 방울', e:{ bon:2, eva:4, fac:7, luck:2 }, p:103, d:'회피 4회 · 행운 2회 · 판정 +2 · 공용시설 +7회' },
    { n:'떨어지지 않는 낙엽', e:{ bon:1, eva:4, fac:8, luck:3 }, p:103, d:'회피 4회 · 행운 3회 · 판정 +1 · 공용시설 +8회' },
    { n:'시간이 비껴간 태엽', e:{ dark:2, eva:2, fac:7, luck:2 }, p:103, d:'회피 2회 · 행운 2회 · 어둠 탐사 +2회 · 공용시설 +7회' },
    { n:'처음을 기억하는 단추', e:{ dark:1, eva:3, fac:8, luck:3 }, p:103, d:'회피 3회 · 행운 3회 · 어둠 탐사 +1회 · 공용시설 +8회' }
];


// ==========================================
// 번호 배정 — 한 번 받으면 바뀌지 않는다
// ==========================================
// 제대로 된 사원인가 — 유령에게는 번호를 주지 않는다
function isRealUser(u) {
    return !!(u && typeof u === 'object'
        && u.code && typeof u.code === 'string'
        && u.name && typeof u.name === 'string'
        && u.code !== 'kario0987');
}

function dnaGiftIndex(user) {
    if (!isRealUser(user)) return -1;
    if (user.dnaGift !== undefined && user.dnaGift !== null) return user.dnaGift;

    // 이미 쓰인 번호를 피해 가장 작은 빈 번호를 준다
    // 유령이 잡고 있는 번호는 빈 것으로 친다
    const used = new Set();
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!isRealUser(u)) return;
        if (u.dnaGift !== undefined && u.dnaGift !== null) used.add(u.dnaGift);
    });

    let idx = 0;
    while (used.has(idx) && idx < DNA_GIFTS.length) idx++;
    if (idx >= DNA_GIFTS.length) {
        // 60명을 넘으면 사번 기반으로 돌려쓴다
        idx = seedOf('gift|' + user.code) % DNA_GIFTS.length;
    }

    user.dnaGift = idx;
    if (currentUser && user.code === currentUser.code) saveFields({ dnaGift: 1 });
    else updateUserFields(user.code, { dnaGift: idx });
    return idx;
}

function dnaGiftOf(user) {
    const i = dnaGiftIndex(user);
    return (i >= 0 && DNA_GIFTS[i]) ? DNA_GIFTS[i] : null;
}

// 이름 — 뒤에 DNA 를 붙여 한 번 더 갈라 둔다
function dnaItemName(user) {
    const g = dnaGiftOf(user);
    if (!g) return '';
    return g.n + ' · ' + dnaOf(user);
}

function ensureDnaItem(user) {
    if (!isRealUser(user)) return null;
    const g = dnaGiftOf(user);
    if (!g) return null;
    const nm = dnaItemName(user);
    if (!nm) return null;
    if (ITEM_CATALOG[nm]) return nm;

    ITEM_CATALOG[nm] = {
        price: 30000, usable: true, targetable: false,
        effect: 'equip_dna', dnaOwner: user.code, dnaEff: g.e,
        desc: '[고유] ' + user.name + ' 사원의 것. 장착하면 ' + g.d + '.'
    };
    if (typeof NO_SELL_ITEMS !== 'undefined' && !NO_SELL_ITEMS.includes(nm)) NO_SELL_ITEMS.push(nm);
    return nm;
}

function buildAllDnaItems() {
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (isRealUser(u)) ensureDnaItem(u);
    });
}

// ==========================================
// 장착
// ==========================================
function myDnaEquip() {
    if (!currentUser || !currentUser.equippedWeapons) return null;
    for (let i = 0; i < currentUser.equippedWeapons.length; i++) {
        const w = currentUser.equippedWeapons[i];
        const cat = ITEM_CATALOG[getEquipBaseName(w)] || ITEM_CATALOG[w];
        if (cat && cat.effect === 'equip_dna') return cat.dnaEff || null;
    }
    return null;
}

(function hookEquip() {
    if (typeof useInventoryItem !== 'function') return;
    const _u = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'equip_dna') return _u.apply(this, arguments);
        if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 장착할 수 없습니다.'); return; }

        if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
        if (myDnaEquip()) { showCustomAlert('고유 아이템은 하나만 찰 수 있습니다.'); return; }
        if (currentUser.equippedWeapons.length >= 8) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }

        currentUser.equippedWeapons.push(itemName);
        setEquipOwner(currentUser, itemName, currentUser.code);
        removeItemFromInventory(currentUser, itemName, 1);

        const e = cat.dnaEff || {};
        if (e.fac) {
            currentUser.dnaFacBonus = e.fac;
        }
        appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName.split(' · ')[0]);
        addHistoryLog(currentUser, '[고유 장비] ' + itemName.split(' · ')[0] + ' 장착');
        saveSelfFull();
        updateUI();
        showCustomAlert(itemName.split(' · ')[0] + '\n\n' + (cat.desc.split('장착하면 ')[1] || ''));
    };
})();

(function hookUnequip() {
    if (typeof unequipWeapon !== 'function') return;
    const _f = unequipWeapon;
    unequipWeapon = function (index) {
        const w = currentUser.equippedWeapons && currentUser.equippedWeapons[index];
        const cat = w ? (ITEM_CATALOG[getEquipBaseName(w)] || ITEM_CATALOG[w]) : null;
        const isDna = cat && cat.effect === 'equip_dna';
        const r = _f.apply(this, arguments);
        if (isDna && currentUser.dnaFacBonus) {
            currentUser.dnaFacBonus = 0;
            saveFields({ facilityMax: 1, dnaFacBonus: 1 });
            updateUI();
        }
        return r;
    };
})();

// ==========================================
// 효과 연결
// ==========================================

// 공용시설 행운
(function hookLuckPct() {
    if (typeof facilityLuckMult !== 'function') return;
    const _f = facilityLuckMult;
    facilityLuckMult = function (user) {
        let m = _f.apply(this, arguments);
        const u = user || currentUser;
        if (u && currentUser && u.code === currentUser.code) {
            const e = myDnaEquip();
            if (e && e.pct) m *= (e.pct / 100);
        }
        return m;
    };
})();

// 어둠 탐사 횟수
(function hookDarkTries() {
    if (typeof getDarkTriesLeft !== 'function') return;
    const _f = getDarkTriesLeft;
    getDarkTriesLeft = function () {
        let n = _f.apply(this, arguments);
        const e = myDnaEquip();
        if (e && e.dark) n += e.dark;
        return n;
    };
})();

// 판정 보정 — 탐사 내내 붙는다
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._dnaHooked) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            let b = _r.apply(this, arguments);
            const e = myDnaEquip();
            if (e && e.bon) b += e.bon;
            return b;
        };
        rollDarkBonus._dnaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 탐사에 들어갈 때 회수를 채운다
let dnaCharge = { gim: 0, eva: 0, luck: 0, death: 0 };

function resetDnaCharge() {
    const e = myDnaEquip() || {};
    dnaCharge = {
        gim: e.gim || 0, eva: e.eva || 0,
        luck: e.luck || 0, death: e.death || 0
    };
}

(function hookRunStart() {
    ['startDarkRun', 'launchPartyRun'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(resetDnaCharge, 200);
            return r;
        };
    });
})();

function dnaUse(key) {
    if (!dnaCharge[key] || dnaCharge[key] <= 0) return false;
    dnaCharge[key]--;
    return true;
}

// 즉사 · 회피
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._dnaHooked) { clearInterval(iv); return; }
        const _d = darkDeath;
        darkDeath = function (reason) {
            if (darkRun && !darkRun._dead) {
                if (dnaUse('death') || dnaUse('eva')) {
                    darkRun.fail = Math.max(0, darkRun.fail - 1);
                    applyPollutionToUser(currentUser, 4);
                    const g = myDnaEquip();
                    darkBodyEl().innerHTML = darkBox('—',
                        reason + '<br><br><span style="color:#8fd4ff;">— 품 안의 것이 먼저 반응했다.<br>' +
                        '빛이 한 번 일렁이고, 그것으로 끝이었다.</span>',
                        darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                    mountDarkChat('normal');
                    saveDB();
                    return;
                }
            }
            return _d.apply(this, arguments);
        };
        darkDeath._dnaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 행운 — 낮은 눈을 한 번 되돌린다
(function hookLuckRoll() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._dnaHooked) { clearInterval(iv); return; }
        const _l = luckReroll;
        luckReroll = function (roll) {
            roll = _l.apply(this, arguments);
            if (darkRun && roll <= 6 && dnaUse('luck')) {
                const nr = Math.floor(Math.random() * 20) + 1;
                if (typeof showDarkToast === 'function') showDarkToast('✦ 고유의 운 (' + roll + ' → ' + nr + ')');
                return nr;
            }
            return roll;
        };
        luckReroll._dnaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 기믹 파훼 — 작두와 같은 자리에 버튼이 선다
(function hookSmash() {
    const iv = setInterval(function () {
        if (typeof jakduAvailable !== 'function') return;
        if (jakduAvailable._dnaHooked) { clearInterval(iv); return; }
        const _j = jakduAvailable;
        jakduAvailable = function () {
            if (_j.apply(this, arguments)) return true;
            return dnaCharge.gim > 0;
        };
        jakduAvailable._dnaHooked = true;

        if (typeof smashWeapon === 'function') {
            const _s = smashWeapon;
            smashWeapon = function () {
                const w = _s.apply(this, arguments);
                if (w) return w;
                const e = myDnaEquip();
                if (e && dnaCharge.gim > 0) {
                    const nm = (currentUser.equippedWeapons || [])
                        .find(x => { const c = ITEM_CATALOG[getEquipBaseName(x)] || ITEM_CATALOG[x]; return c && c.effect === 'equip_dna'; });
                    return nm ? nm.split(' · ')[0] : '고유의 것';
                }
                return w;
            };
        }
        if (typeof useJakdu === 'function') {
            const _u = useJakdu;
            useJakdu = function () {
                if (_u.apply(this, arguments)) return true;
                return dnaUse('gim');
            };
        }
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 목록
// ==========================================
function listDnaItems() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (!isRealUser(u)) return null;
        ensureDnaItem(u);
        const g = dnaGiftOf(u);
        if (!g) return null;
        return {
            번호: dnaGiftIndex(u), 사원: u.name, 사번: u.no,
            DNA: dnaOf(u), 아이템: g.n, 성능: g.d
        };
    }).filter(Boolean).sort((a, b) => a.번호 - b.번호);

    console.log('%c===== 유전자 고유 아이템 (' + rows.length + '명) =====', 'color:#c9a8ff; font-size:13px');
    console.table(rows);
    console.log('전체 ' + DNA_GIFTS.length + '종 · 이름과 성능이 서로 겹치지 않습니다.');
    console.log('출현 확률: 기본 0.01% · 돌봄 16회를 다 채우면 0.04%');
    return rows;
}

// 아직 안 쓰인 것까지 전부
function listAllDnaGifts() {
    const taken = {};
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (isRealUser(u) && u.dnaGift !== undefined && u.dnaGift !== null) taken[u.dnaGift] = u.name;
    });
    console.log('%c===== 고유 아이템 전체 ' + DNA_GIFTS.length + '종 =====', 'color:#c9a8ff; font-size:13px');
    console.table(DNA_GIFTS.map(function (g, i) {
        return { 번호: i, 아이템: g.n, 성능: g.d, 주인: taken[i] || '-' };
    }));
}

setTimeout(buildAllDnaItems, 2500);
console.log('[DNA] 고유 아이템 ' + DNA_GIFTS.length + '종 — listAllDnaGifts() 로 전체 보기');

// ==========================================
// 번호 재배정 — 유령이 물고 있던 것을 되찾는다
// ==========================================
// resetDnaGifts()       훑기만
// resetDnaGifts(true)   실제로 다시 짬
function resetDnaGifts(doIt) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }

    const ghosts = [], real = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (c === 'kario0987') return;
        if (isRealUser(u)) real.push({ code: c, u: u });
        else ghosts.push({ code: c, u: u || {} });
    });

    // 사번 순으로 줄 세운다 — 배정이 흔들리지 않게
    real.sort(function (a, b) {
        const na = String(a.u.no || '9999'), nb = String(b.u.no || '9999');
        if (na !== nb) return na < nb ? -1 : 1;
        return a.code < b.code ? -1 : 1;
    });

    console.log('%c===== 고유 아이템 번호 재배정 =====', 'color:#c9a8ff; font-size:13px');

    if (ghosts.length) {
        console.warn('사원이 아닌 항목 ' + ghosts.length + '건');
        console.table(ghosts.map(function (x) {
            return {
                키: x.code,
                이름: x.u.name === undefined ? '(없음)' : x.u.name,
                사번: x.u.no === undefined ? '(없음)' : x.u.no,
                물고있던번호: x.u.dnaGift === undefined ? '-' : x.u.dnaGift,
                아이템: (x.u.dnaGift != null && DNA_GIFTS[x.u.dnaGift]) ? DNA_GIFTS[x.u.dnaGift].n : '-'
            };
        }));
    } else console.log('사원이 아닌 항목은 없습니다.');

    const plan = real.map(function (x, i) {
        return {
            사원: x.u.name, 사번: x.u.no,
            이전: x.u.dnaGift === undefined ? '-' : x.u.dnaGift,
            새번호: i,
            아이템: DNA_GIFTS[i] ? DNA_GIFTS[i].n : '?',
            성능: DNA_GIFTS[i] ? DNA_GIFTS[i].d : '?'
        };
    });
    console.log('사원 ' + real.length + '명');
    console.table(plan);

    if (doIt !== true) {
        console.log('%c훑기만 했습니다. 다시 짜려면 resetDnaGifts(true)', 'color:#ffd700');
        return;
    }

    // 옛 이름으로 만들어 둔 목록 항목을 지운다
    Object.keys(ITEM_CATALOG).forEach(function (k) {
        if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner) delete ITEM_CATALOG[k];
    });

    const updates = {};
    ghosts.forEach(function (x) { updates['users/' + x.code + '/dnaGift'] = null; });
    real.forEach(function (x, i) {
        x.u.dnaGift = i;
        updates['users/' + x.code + '/dnaGift'] = i;
    });

    database.ref('/').update(updates).then(function () {
        buildAllDnaItems();
        console.log('%c✓ ' + real.length + '명에게 다시 배정했습니다.', 'color:#4CAF50; font-size:13px');
        if (ghosts.length) console.log('  유령 ' + ghosts.length + '건의 번호를 회수했습니다.');
        console.log('  새로고침하면 반영됩니다.');
        if (typeof updateUI === 'function') updateUI();
    }).catch(function (e) {
        console.error('재배정 실패:', e);
    });
}
;

// ---------- dna-extra.js ----------
// ==========================================
// ★ 고유 아이템 — 상담사가 따로 얹어 주기
// index.html 에서 dna-gifts.js 다음에 불러온다
// ==========================================
//
// 표 원본은 안 건드린다.
// 사원에게 dnaExtra 를 붙이면 그 사람 것에만 더해진다.

const DNA_EX_NAME = {
    death: '즉사 회피',
    gim:   '기믹 파훼',
    eva:   '회피',
    luck:  '행운',
    bon:   '판정',
    pct:   '공용시설 행운',
    dark:  '어둠 탐사',
    fac:   '공용시설'
};

function dnaDescOf(e) {
    const order = ['death', 'gim', 'eva', 'luck', 'bon', 'pct', 'dark', 'fac'];
    const out = [];
    order.forEach(function (k) {
        if (!e[k]) return;
        const nm = DNA_EX_NAME[k];
        if (k === 'pct') out.push(nm + ' ' + e[k] + '%');
        else if (k === 'bon') out.push(nm + ' +' + e[k]);
        else if (k === 'dark' || k === 'fac') out.push(nm + ' +' + e[k] + '회');
        else out.push(nm + ' ' + e[k] + '회');
    });
    return out.join(' · ');
}

// dnaGiftOf 를 감싸서 얹은 것을 합친다
(function hookGiftOf() {
    if (typeof dnaGiftOf !== 'function') {
        console.warn('[고유] dna-gifts.js 가 먼저 올라와야 합니다.');
        return;
    }
    const _g = dnaGiftOf;
    dnaGiftOf = function (user) {
        const base = _g.apply(this, arguments);
        if (!base) return base;

        const ex = user && user.dnaExtra;
        if (!ex || Object.keys(ex).length === 0) return base;

        const e = Object.assign({}, base.e);
        Object.keys(ex).forEach(function (k) {
            e[k] = (e[k] || 0) + ex[k];
        });

        return { n: base.n, e: e, p: base.p, d: dnaDescOf(e), boosted: true };
    };
})();

// ==========================================
// 얹기
// ==========================================
// giveDnaExtra('4892', { eva:2, bon:1 })
// 여러 명이면 giveDnaExtra({ '4892':{eva:2}, '4368':{luck:2} })
function giveDnaExtra(a, b) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const map = (typeof a === 'string') ? { [a]: b } : a;
    if (!map || typeof map !== 'object') { console.error('입력이 잘못되었습니다.'); return; }

    const updates = {}, rows = [];
    Object.keys(map).forEach(function (no) {
        const c = Object.keys(db.users).find(function (x) {
            return db.users[x] && db.users[x].no === no;
        });
        if (!c) { console.error('사번 없음:', no); return; }

        const u = db.users[c];
        const before = dnaGiftOf(u);
        if (!before) { console.error('번호가 없는 사원:', no); return; }

        u.dnaExtra = Object.assign({}, u.dnaExtra || {}, map[no]);

        Object.keys(ITEM_CATALOG).forEach(function (k) {
            if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner === c) delete ITEM_CATALOG[k];
        });
        ensureDnaItem(u);

        const after = dnaGiftOf(u);
        updates['users/' + c + '/dnaExtra'] = u.dnaExtra;
        rows.push({
            사번: no, 이름: u.name, 아이템: after.n,
            이전: before.d, 이후: after.d
        });
    });

    if (rows.length === 0) { console.warn('바꾼 사원이 없습니다.'); return; }
    console.table(rows);

    database.ref('/').update(updates).then(function () {
        console.log('%c✓ ' + rows.length + '명에게 얹었습니다.', 'color:#4CAF50');
        if (typeof updateUI === 'function') updateUI();
    }).catch(function (e) { console.error('실패:', e); });
}

// 되돌리기
function clearDnaExtra(no) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const c = Object.keys(db.users).find(function (x) {
        return db.users[x] && db.users[x].no === no;
    });
    if (!c) { console.error('사번 없음:', no); return; }

    const u = db.users[c];
    delete u.dnaExtra;
    Object.keys(ITEM_CATALOG).forEach(function (k) {
        if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner === c) delete ITEM_CATALOG[k];
    });
    ensureDnaItem(u);

    database.ref('users/' + c + '/dnaExtra').remove().then(function () {
        console.log(u.name + ' 사원 — 원래대로 돌렸습니다.');
        console.log('  ' + dnaGiftOf(u).d);
        if (typeof updateUI === 'function') updateUI();
    });
}

// 얹은 사람 보기
function listDnaExtra() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (!isRealUser(u) || !u.dnaExtra || !Object.keys(u.dnaExtra).length) return null;
        const g = dnaGiftOf(u);
        return {
            사번: u.no, 이름: u.name, 아이템: g.n,
            얹은것: dnaDescOf(u.dnaExtra), 현재: g.d
        };
    }).filter(Boolean);

    if (!rows.length) { console.log('얹어 준 사원이 없습니다.'); return; }
    console.table(rows);
}

console.log('[고유] 추가 부여 적용 — giveDnaExtra() · clearDnaExtra() · listDnaExtra()');
;

// ---------- dna-once.js ----------
// ==========================================
// ★ 고유 아이템 — 평생 한 번만
// index.html 에서 dna-extra.js 다음에 불러온다
// ==========================================
//
// 한 번 받은 사람에게는 다시 나오지 않는다.
// 받은 기록은 dnaGotItem 에 남는다.

// 이미 받았는가
function hasGotDna(user) {
    if (!user) return true;                 // 모르면 안 주는 쪽으로
    if (user.dnaGotItem) return true;

    // 기록이 없어도 지금 가지고 있으면 받은 것으로 친다
    const nm = (typeof dnaItemName === 'function') ? dnaItemName(user) : '';
    if (!nm) return true;
    if ((user.inventory || []).indexOf(nm) !== -1) return true;
    if ((user.equippedWeapons || []).some(function (w) {
        return (typeof getEquipBaseName === 'function' ? getEquipBaseName(w) : w) === nm;
    })) return true;

    return false;
}

// 받았다고 적어 둔다
function markGotDna(user) {
    if (!user || user.dnaGotItem) return;
    user.dnaGotItem = true;
    if (currentUser && user.code === currentUser.code) saveFields({ dnaGotItem: 1 });
    else updateUserFields(user.code, { dnaGotItem: true });
}

// ==========================================
// 추첨에서 뺀다
// ==========================================
(function hookRoll() {
    if (typeof rollBirthItem !== 'function') {
        console.warn('[고유] dna.js 가 먼저 올라와야 합니다.');
        return;
    }
    const _r = rollBirthItem;

    rollBirthItem = function (a, b, fill) {
        // 이미 받은 사람은 후보에서 뺀다
        const pa = hasGotDna(a) ? null : a;
        const pb = hasGotDna(b) ? null : b;

        // 둘 다 받았으면 고유가 아예 안 나온다
        if (!pa && !pb) {
            for (let i = 0; i < 40; i++) {
                const x = _r.call(this, null, null, fill);
                const c = ITEM_CATALOG[x];
                if (!c || !c.dnaOwner) return x;
            }
            return BIRTH_ITEMS[Math.floor(Math.random() * BIRTH_ITEMS.length)].n;
        }

        return _r.call(this, pa, pb, fill);
    };
})();

// ==========================================
// 나온 순간 기록한다
// ==========================================
(function hookBirth() {
    const iv = setInterval(function () {
        if (typeof checkPregBirth !== 'function') return;
        if (checkPregBirth._onceHooked) { clearInterval(iv); return; }
        const _c = checkPregBirth;

        checkPregBirth = function () {
            const r = _c.apply(this, arguments);
            setTimeout(stampGotDna, 600);
            return r;
        };
        checkPregBirth._onceHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 소지품에 자기 고유 아이템이 들어온 사람을 찾아 기록한다
function stampGotDna() {
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (typeof isRealUser === 'function' && !isRealUser(u)) return;
        if (!u || u.dnaGotItem) return;
        const nm = dnaItemName(u);
        if (!nm) return;
        const has = (u.inventory || []).indexOf(nm) !== -1
            || (u.equippedWeapons || []).some(function (w) {
                return getEquipBaseName(w) === nm;
            });
        if (has) markGotDna(u);
    });
}

// 들어올 때 한 번, 그 뒤로는 가끔
setTimeout(stampGotDna, 4000);
setInterval(stampGotDna, 60000);

// ==========================================
// 확인
// ==========================================
function listDnaGot() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (typeof isRealUser === 'function' && !isRealUser(u)) return null;
        const nm = dnaItemName(u);
        const has = (u.inventory || []).indexOf(nm) !== -1;
        const eq = (u.equippedWeapons || []).some(function (w) { return getEquipBaseName(w) === nm; });
        return {
            사번: u.no, 이름: u.name,
            아이템: nm ? nm.split(' · ')[0] : '-',
            받음: u.dnaGotItem ? 'O' : '-',
            소지: has ? 'O' : '-',
            장착: eq ? 'O' : '-',
            '또 나오나': hasGotDna(u) ? '아니오' : '예'
        };
    }).filter(Boolean);

    console.table(rows);
    const done = rows.filter(r => r['또 나오나'] === '아니오').length;
    console.log('받은 사원 ' + done + ' / ' + rows.length + '명');
}

// 상담사용 — 다시 나올 수 있게 되돌린다
function resetDnaGot(no) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    const c = Object.keys(db.users).find(function (x) {
        return db.users[x] && db.users[x].no === no;
    });
    if (!c) { console.error('사번 없음:', no); return; }

    delete db.users[c].dnaGotItem;
    database.ref('users/' + c + '/dnaGotItem').remove().then(function () {
        console.log(db.users[c].name + ' 사원 — 다시 나올 수 있습니다.');
    });
}

console.log('[고유] 평생 1회 제한 적용 — listDnaGot() 으로 확인');
;

// ---------- guard.js ----------
// ==========================================
// ★ 유령 계정 쓰기 차단
// index.html 에서 dna-once.js 다음에 불러온다
// ==========================================
//
// 사원을 지워도 undefined 껍데기가 다시 생긴다.
// dnaOf 나 dnaGiftIndex 가 없는 계정에 값을 써서
// 파이어베이스가 그 경로를 새로 만들기 때문이다.
// 사원이 아닌 계정에는 아예 쓰지 않게 막는다.

(function guardGhostWrite() {

    function realUser(code) {
        const u = db.users && db.users[code];
        return !!(u && u.code && u.name && u.name !== '기본사원');
    }

    // --- 남의 계정에 쓰는 길을 막는다 ---
    if (typeof updateUserFields === 'function' && !updateUserFields._ghostGuard) {
        const _u = updateUserFields;
        updateUserFields = function (code, fields) {
            const me = currentUser && code === currentUser.code;
            if (!realUser(code) && !me) {
                console.warn('[차단] 사원이 아닌 계정:', code, '·', Object.keys(fields || {}).join(', '));
                return Promise.resolve();
            }
            return _u.apply(this, arguments);
        };
        updateUserFields._ghostGuard = true;
    }

    // --- dna 를 심는 것도 막는다 ---
    if (typeof dnaOf === 'function' && !dnaOf._ghostGuard) {
        const _d = dnaOf;
        dnaOf = function (user) {
            if (!user || !user.code || !user.name) return '----';
            return _d.apply(this, arguments);
        };
        dnaOf._ghostGuard = true;
    }

    // --- 기본사원 잔재를 화면에서도 뺀다 ---
    function dropDefault() {
        if (!db.users) return;
        Object.keys(db.users).forEach(function (c) {
            const u = db.users[c];
            if (!u) { delete db.users[c]; return; }
            if (u.name === '기본사원') { delete db.users[c]; return; }
            if (!u.code || !u.name) delete db.users[c];
        });
    }
    dropDefault();
    setInterval(dropDefault, 5000);

    console.log('[유령] 쓰기 차단 적용 — cleanGhostUsers() 로 정리');
})();

// ==========================================
// 이미 생긴 껍데기 치우기 — 상담사 전용
// ==========================================
function cleanGhostUsers() {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }
    database.ref('users').once('value').then(function (s) {
        const srv = s.val() || {};
        const bad = Object.keys(srv).filter(function (c) {
            const u = srv[c];
            if (c === 'kario0987') return false;
            return !u || !u.name || !u.code || u.name === '기본사원';
        });

        if (!bad.length) { console.log('%c서버가 깨끗합니다.', 'color:#4CAF50'); return; }

        console.table(bad.map(function (c) {
            return { 키: c, 가진필드: Object.keys(srv[c] || {}).join(', ') || '(빈 객체)' };
        }));

        const up = {};
        bad.forEach(function (c) { up['users/' + c] = null; delete db.users[c]; });

        return database.ref('/').update(up).then(function () {
            console.log('%c✓ ' + bad.length + '건 지웠습니다: ' + bad.join(', '), 'color:#4CAF50; font-size:13px');
            console.log('  새로고침하면 반영됩니다.');
        });
    }).catch(function (e) { console.error('실패:', e); });
}

// 지금 껍데기가 있는지만 본다
function checkGhostUsers() {
    database.ref('users').once('value').then(function (s) {
        const srv = s.val() || {};
        const bad = Object.keys(srv).filter(function (c) {
            const u = srv[c];
            if (c === 'kario0987') return false;
            return !u || !u.name || !u.code || u.name === '기본사원';
        });
        if (!bad.length) { console.log('%c서버가 깨끗합니다.', 'color:#4CAF50'); return; }
        console.warn('껍데기 ' + bad.length + '건');
        console.table(bad.map(function (c) {
            return { 키: c, 가진필드: Object.keys(srv[c] || {}).join(', ') || '(빈 객체)' };
        }));
        console.log('지우려면 cleanGhostUsers()');
    });
}
;

// ---------- sapphire.js ----------
// ==========================================
// ★ 사파이어 장비 2종
// index.html 에서 dna-once.js 다음에 불러온다
// ==========================================
//
// 둘 다 남이 채워 주었을 때만 힘이 돈다.
// 스스로 찬 것에는 아무 일도 일어나지 않는다.

ITEM_CATALOG['사파이어 요도 플러그'] = {
    price: 21000, usable: true, targetable: true, effect: 'equip_sap_urethra',
    desc: '타인이 채워 주었을 때만 힘이 돈다. 임신한 사원에게 채우면 낳는 것의 수가 늘어난다.'
};

ITEM_CATALOG['사파이어 젖꼭지 클램프'] = {
    price: 21000, usable: true, targetable: true, effect: 'equip_sap_clamp',
    desc: '타인이 채워 주었을 때만 힘이 돈다. 임신한 사원에게 채우면 드문 것이 나올 여지가 생긴다.'
};

// ==========================================
// 우주 쇼핑몰 진열
// ==========================================
(function putInAlien() {
    const names = ['사파이어 요도 플러그', '사파이어 젖꼭지 클램프'];
    if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
        names.forEach(function (n) {
            if (!ALIEN_ITEMS_POOL.includes(n)) ALIEN_ITEMS_POOL.push(n);
        });
    }
    // 진열 후보에 오를 확률 2%
    if (!window.RARE_ALIEN_RATE) window.RARE_ALIEN_RATE = {};
    names.forEach(function (n) { window.RARE_ALIEN_RATE[n] = 0.02; });
})();

// ==========================================
// 착용 판정 — 남이 채워 준 것만
// ==========================================
function sapActive(user, name) {
    if (!user || !user.equippedWeapons) return false;
    return user.equippedWeapons.some(function (w) {
        if (getEquipBaseName(w) !== name) return false;
        const o = getEquipOwner(user, w);
        return o && o !== user.code;      // 스스로 찬 건 안 친다
    });
}

function hasSapUrethra(user) { return sapActive(user, '사파이어 요도 플러그'); }
function hasSapClamp(user)   { return sapActive(user, '사파이어 젖꼭지 클램프'); }

// ==========================================
// 장착
// ==========================================
(function hookEquip() {
    const EFF = ['equip_sap_urethra', 'equip_sap_clamp'];

    // 본인 장착 — 슬롯만 먹고 아무 일도 안 일어난다
    if (typeof useInventoryItem === 'function') {
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || EFF.indexOf(cat.effect) === -1) return _u.apply(this, arguments);
            if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 장착할 수 없습니다.'); return; }

            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.length >= 8) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }

            currentUser.equippedWeapons.push(itemName);
            setEquipOwner(currentUser, itemName, currentUser.code);
            removeItemFromInventory(currentUser, itemName, 1);
            appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName);
            addHistoryLog(currentUser, '[장비 장착] ' + itemName);
            saveSelfFull();
            updateUI();
            showCustomAlert('채웠습니다.\n\n다만 스스로 채운 것에는 힘이 돌지 않습니다.');
        };
    }

    // 타인 장착 — 이때만 힘이 돈다
    if (typeof applyItemEffect === 'function') {
        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || EFF.indexOf(cat.effect) === -1) return _a.apply(this, arguments);
            if (!targetUser) return false;

            if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
            if (targetUser.equippedWeapons.length >= 8) {
                showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.');
                return false;
            }

            const label = isOthers
                ? itemName + ' (장착자: ' + currentUser.name + ')'
                : itemName;
            targetUser.equippedWeapons.push(label);
            setEquipOwner(targetUser, label, isOthers ? currentUser.code : targetUser.code);
            appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
            addHistoryLog(targetUser, '[장착] ' + currentUser.name + ' 사원이 ' + itemName + '을(를) 채웠습니다.');

            const preg = (typeof isPregnant === 'function') && isPregnant(targetUser);
            showCustomAlert(
                targetUser.name + ' 사원에게 ' + itemName + '을(를) 채웠습니다.'
                + (isOthers
                    ? (preg ? '\n\n푸른빛이 한 번 돌았습니다.' : '\n\n아직은 아무 일도 없습니다.')
                    : '\n\n스스로 채운 것에는 힘이 돌지 않습니다.')
            );
            return true;
        };
    }
})();

// ==========================================
// 요도 플러그 — 낳는 수가 는다
// ==========================================
(function hookCount() {
    if (typeof checkPregBirth !== 'function') return;

    // 출산 직전에 아버지 수를 부풀리지 않고, 개수 계산만 손본다
    // pregnancy2.js 의 count 식을 그대로 쓰되 보정만 얹는다
    window.sapCountBonus = function (user) {
        return hasSapUrethra(user) ? 2 : 0;
    };
})();

// ==========================================
// 젖꼭지 클램프 — 고유 아이템 확률이 오른다
// ==========================================
(function hookRate() {
    if (typeof rollBirthItem !== 'function') return;
    const _r = rollBirthItem;

    rollBirthItem = function (a, b, fill) {
        // 어미가 클램프를 차고 있으면 고유 확률을 따로 굴린다
        const mom = a;
        if (mom && hasSapClamp(mom)) {
            const f = Math.max(0, Math.min(1, fill || 0));
            const rate = 0.01 + f * 0.03;          // 1% → 4%
            const own = function (u) {
                if (!u) return false;
                if (typeof hasGotDna === 'function' && hasGotDna(u)) return false;
                return true;
            };
            const r = Math.random();
            if (r < rate && own(a)) { ensureDnaItem(a); return dnaItemName(a); }
            if (r < rate * 2 && own(b)) { ensureDnaItem(b); return dnaItemName(b); }
        }
        return _r.call(this, a, b, fill);
    };
})();

// ==========================================
// 확인
// ==========================================
function sapState(no) {
    const u = no
        ? Object.keys(db.users).map(c => db.users[c]).find(x => x && x.no === no)
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' =====', 'color:#4fc3f7; font-size:13px');
    console.log('  요도 플러그:', hasSapUrethra(u) ? '남이 채움 (작동)' : '없음 또는 스스로 채움');
    console.log('  젖꼭지 클램프:', hasSapClamp(u) ? '남이 채움 (작동)' : '없음 또는 스스로 채움');
    console.log('  임신 중:', (typeof isPregnant === 'function' && isPregnant(u)) ? '예' : '아니오');
    (u.equippedWeapons || []).forEach(function (w) {
        const base = getEquipBaseName(w);
        if (base.indexOf('사파이어') !== 0) return;
        const o = getEquipOwner(u, w);
        console.log('   ·', w, '→ 장착자', o === u.code ? '본인' : ((db.users[o] || {}).name || o));
    });
}

console.log('[사파이어] 2종 등록 — sapState() 로 확인');
;

// ---------- equip-fix.js ----------
// ==========================================
// ★ 타인 장착 마무리 — 소지품에서 빼고 양쪽을 저장
// index.html 에서 sapphire.js · newitems.js 보다 뒤에 불러온다
// ==========================================
//
// 타인 장착 처리가 대상에게 밀어 넣는 일만 하고
// 건네준 사람의 소지품은 그대로 두었다.
// 그래서 같은 것을 두 번, 세 번 채울 수 있었고
// 소지품에 남은 쪽이 해제 대상으로 잡히지 않았다.
//
// 여기서는 밑의 처리가 끝난 뒤에만 뒷정리를 한다.
// 이미 빼 간 경우에는 손대지 않는다.

(function fixOtherEquip() {

    function invCount(user, nm) {
        return (user && user.inventory ? user.inventory : []).filter(function (x) { return x === nm; }).length;
    }

    function isEquipItem(nm) {
        const c = (typeof ITEM_CATALOG !== 'undefined') && ITEM_CATALOG[nm];
        if (!c || !c.effect) return false;
        return String(c.effect).indexOf('equip_') === 0;
    }

    function pushTarget(t) {
        if (!t || !t.code) return;
        if (typeof updateUserFields !== 'function') return;
        const f = {
            equippedWeapons: t.equippedWeapons || [],
            equipOwner: t.equipOwner || {}
        };
        if (t.badgeNotes != null) f.badgeNotes = t.badgeNotes;
        try { updateUserFields(t.code, f); } catch (e) { }
    }

    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._equipTidy) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            if (!isEquipItem(itemName)) return _a.apply(this, arguments);

            const before = invCount(currentUser, itemName);
            const r = _a.apply(this, arguments);
            if (!r) return r;                       // 실패했으면 그대로 둔다

            // 밑에서 이미 빼 갔으면 두 번 빼지 않는다
            if (invCount(currentUser, itemName) === before && before > 0) {
                if (typeof removeItemFromInventory === 'function') {
                    removeItemFromInventory(currentUser, itemName, 1);
                }
            }

            // 남에게 채운 것은 대상 쪽도 서버에 적는다
            if (isOthers && targetUser && targetUser.code !== currentUser.code) {
                pushTarget(targetUser);
            }
            if (typeof saveSelfFull === 'function') saveSelfFull();
            if (typeof updateUI === 'function') updateUI();

            return r;
        };
        applyItemEffect._equipTidy = true;
        clearInterval(iv);
        console.log('[장착] 타인 장착 뒷정리 연결');
    }, 500);
})();

// ==========================================
// 이미 두 번 들어간 것을 치운다
// ==========================================
// cleanEquipDupe()            — 나
// cleanEquipDupe('밥')        — 그 사원
// cleanEquipDupe(null, true)  — 전 사원 훑어보기만
function cleanEquipDupe(who, scanOnly) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);

    let list;
    if (scanOnly) list = all;
    else if (!who) list = [currentUser];
    else {
        const t = all.find(function (u) { return u.name === who || u.no === who || u.code === who; });
        if (!t) { console.warn('사원을 못 찾았습니다: ' + who); return; }
        list = [t];
    }

    let hit = 0;
    list.forEach(function (u) {
        const eq = u.equippedWeapons || [];
        const seen = {}, keep = [], drop = [];
        eq.forEach(function (w) {
            if (seen[w]) { drop.push(w); return; }
            seen[w] = 1; keep.push(w);
        });
        if (!drop.length) return;
        hit++;
        console.log('%c' + u.name + ' (' + (u.no || u.code) + ')', 'color:#d4af37; font-size:12px');
        drop.forEach(function (w) { console.log('   겹침 ×1 → ' + w); });

        if (scanOnly) return;

        u.equippedWeapons = keep;
        if (typeof updateUserFields === 'function') {
            updateUserFields(u.code, { equippedWeapons: keep });
        }
        console.log('%c   ✓ ' + drop.length + '개를 정리했습니다.', 'color:#4CAF50');
    });

    if (!hit) console.log('겹쳐 들어간 장착이 없습니다.');
    if (typeof updateUI === 'function') updateUI();
}

// ==========================================
// 확인
// ==========================================
function equipState(who) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who
        ? all.find(function (x) { return x.name === who || x.no === who || x.code === who; })
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' 장착 =====', 'color:#4fc3f7; font-size:13px');
    const rows = (u.equippedWeapons || []).map(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        return {
            칸: w,
            본이름: base,
            채운사람: !o ? '(기록 없음)' : (o === u.code ? '본인' : ((db.users[o] || {}).name || o)),
            소지품에도: (u.inventory || []).indexOf(base) >= 0 ? '✗ 남아 있음' : ''
        };
    });
    if (rows.length) console.table(rows); else console.log('  (없음)');
    console.log('  뒷정리 연결:', (typeof applyItemEffect === 'function' && applyItemEffect._equipTidy) ? 'O' : '-');
}

console.log('[장착] cleanEquipDupe() · equipState() 준비');
;

// ---------- pregnancy.js ----------
// ==========================================
// ★ 임신 — 판정 · 동의 · 티커
// index.html 에서 dna.js 다음에 불러온다
// ==========================================

const PREG_HOURS = 48;            // 이틀 뒤 출산
const PREG_CARE_DAILY = 5;        // 하루 돌봄 횟수
const PREG_MAX_SIRES = 5;         // 한 명이 받을 수 있는 최대 인원
const PREG_COST_MAX = 3000;       // 포인트로 낼 때 상한

// 사택 비치 전용 아이템 5종
const PREG_ITEMS = {
    '미지근한 물수건': { price: 400,  care: 1, d:'임신한 사원을 한 번 돌볼 수 있다.' },
    '흔들의자':       { price: 900,  care: 2, d:'임신한 사원을 두 번 돌볼 수 있다.' },
    '식지 않는 죽':   { price: 1500, care: 3, d:'임신한 사원을 세 번 돌볼 수 있다.' },
    '두꺼운 담요':    { price: 2600, care: 5, d:'임신한 사원을 다섯 번 돌볼 수 있다.' },
    '밤새 켜 둔 등':  { price: 5000, care: 9, d:'임신한 사원을 아홉 번 돌볼 수 있다.' }
};
Object.keys(PREG_ITEMS).forEach(function (n) {
    const it = PREG_ITEMS[n];
    ITEM_CATALOG[n] = { price: it.price, usable: false, care: it.care, pregItem: true,
        desc: '[돌봄] ' + it.d };
});

// ==========================================
// 상태 읽기
// ==========================================
function pregOf(user) {
    if (!user) return null;
    if (!user.preg) return null;
    return user.preg;    // { sires:[{code,name,at}], due, careAt:{code:time} }
}
function isPregnant(user) {
    const p = pregOf(user);
    return !!(p && p.sires && p.sires.length > 0);
}
function sireCount(user) {
    const p = pregOf(user);
    return p && p.sires ? p.sires.length : 0;
}
function isMySire(user) {
    const p = pregOf(user);
    if (!p || !p.sires) return false;
    return p.sires.some(s => s.code === currentUser.code);
}
function isPartner(a, b) {
    if (!a || !b) return false;
    if (a.couple && a.couple.partner === b.code) return true;
    const h = getHouse(a);
    return h && h.roomie === b.code;
}

// ==========================================
// 티커
// ==========================================
function pregBroadcast(text) {
    if (!database) return;
    database.ref('notices').push({ text: text, at: Date.now(), kind: 'preg' });
}

(function watchNotice() {
    if (!database) return;
    database.ref('notices').limitToLast(1).on('child_added', function (snap) {
        const v = snap.val();
        if (!v || Date.now() - v.at > 20000) return;
        if (typeof pushNotice === 'function') { pushNotice(v.text); return; }
        showPregTicker(v.text);
    });
    setInterval(function () {
        if (!database || !currentUser || currentUser.code !== 'kario0987') return;
        database.ref('notices').once('value').then(function (s) {
            const v = s.val() || {};
            const del = {};
            Object.keys(v).forEach(function (k) { if (Date.now() - (v[k].at || 0) > 120000) del[k] = null; });
            if (Object.keys(del).length) database.ref('notices').update(del);
        });
    }, 120000);
})();

function showPregTicker(text) {
    const bar = document.getElementById('notice-ticker');
    const el = document.getElementById('notice-ticker-text');
    if (!bar || !el) return;
    bar.style.display = 'block';
    el.innerHTML = text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'pregSlide 13s linear 1';
    clearTimeout(window._pregTick);
    window._pregTick = setTimeout(function () { bar.style.display = 'none'; }, 13000);
}

(function tickerCSS() {
    const st = document.createElement('style');
    st.textContent = `@keyframes pregSlide { 0%{transform:translateX(100%);} 100%{transform:translateX(-140%);} }`;
    document.head.appendChild(st);
})();

// ==========================================
// 정보 열람에 버튼
// ==========================================
(function hookDetail() {
    if (typeof openEmpDetailModal !== 'function') return;
    const _o = openEmpDetailModal;
    openEmpDetailModal = function (code) {
        const r = _o.apply(this, arguments);
        setTimeout(function () { addPregBtn(code); }, 60);
        return r;
    };
})();

function addPregBtn(code) {
    const box = document.getElementById('emp-detail-card-container');
    if (!box || !currentUser || code === currentUser.code) return;
    if (document.getElementById('preg-btn-box')) return;
    const t = db.users[code];
    if (!t) return;

    let html = '';

    // 상대 임신 상태
    if (isPregnant(t)) {
        const p = pregOf(t);
        const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
        html += `<div style="background:rgba(255,105,180,0.08); border:1px solid #c2185b; border-radius:6px; padding:10px; margin-top:12px; font-size:11px; line-height:1.8;">
            <b style="color:#ff8fb1;">임신 중</b> · 아버지 ${p.sires.length}명 · 출산까지 ${left}시간
            ${isMySire(t) ? `<div style="font-size:10px; color:#ffd700; margin-top:4px;">당신이 아버지 중 한 명입니다.</div>` : ''}
        </div>`;
        if (isMySire(t)) {
            const last = (p.careAt || {})[currentUser.code] || 0;
            const gap = (typeof CARE_GAP !== 'undefined') ? CARE_GAP : 3600000;
            const dayLeft = (typeof careLeftToday === 'function') ? careLeftToday(p) : 8;
            const ok = Date.now() - last >= gap && dayLeft > 0;
            const nx = Math.max(0, Math.ceil((last + gap - Date.now()) / 60000));
            html += `<button class="game-btn" style="width:100%; margin-top:8px; padding:11px; ${ok ? 'background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;' : 'opacity:0.4;'}" onclick="openCarePanel('${code}')" ${ok ? '' : 'disabled'}>
                ${ok ? `🤍 돌본다 <span style="font-size:10px; color:#ffd76a;">(오늘 ${dayLeft}회 남음)</span>` : (dayLeft <= 0 ? '오늘은 다 돌봤습니다' : `다음 돌봄까지 ${nx}분`)}
            </button>`;
        }
    }

    // 임신시키기
    const meSire = canSire(currentUser);
    const tBear = (typeof canBearNow === 'function') ? canBearNow(t) : canBear(t);

    // 플러그 때문에 막힌 경우는 이유를 알려 준다
    if (meSire && canBear(t) && !tBear && !isPregnant(t)) {
        html += `<div style="background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:9px 11px; margin-top:10px; font-size:11px; color:#aaa; line-height:1.7;">
            상대가 <b style="color:#c9a8ff;">다이아 보지 플러그</b>를 차고 있습니다.<br>
            <span style="font-size:10px; color:#888;">빼면 할 수 있습니다.</span>
        </div>`;
    }

    if (meSire && tBear && sireCount(t) < PREG_MAX_SIRES && !isMySire(t)) {
        const near = isPartner(currentUser, t);
        html += `<button id="preg-do-btn" class="game-btn" style="width:100%; margin-top:8px; padding:11px; background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;" onclick="tryPregnancy('${code}')">
            임신시키기 ${near ? '' : '<span style="font-size:10px; color:#ffd76a;">(동의 필요)</span>'}
        </button>`;
    }

    if (!html) return;
    box.insertAdjacentHTML('beforeend', `<div id="preg-btn-box">${html}</div>`);
}

// ==========================================
// 임신 시도
// ==========================================
function tryPregnancy(code) {
    if (!buyGuard()) return;
    const t = db.users[code];
    if (!t) return;
    if (!canSire(currentUser)) { showCustomAlert('지금은 할 수 없는 상태입니다.'); return; }
    if (!canBear(t)) { showCustomAlert('상대가 받을 수 있는 상태가 아닙니다.'); return; }
    if (typeof hasVaginaPlug === 'function' && hasVaginaPlug(t)) {
        showCustomAlert('상대가 다이아 보지 플러그를 차고 있습니다.\n\n빼야 할 수 있습니다.');
        return;
    }
    if (sireCount(t) >= PREG_MAX_SIRES) { showCustomAlert(`이미 ${PREG_MAX_SIRES}명이 있습니다.`); return; }
    if (isMySire(t)) { showCustomAlert('이미 당신의 아이를 가지고 있습니다.'); return; }

    if (isPartner(currentUser, t)) { doPregnancy(code); return; }

    if (!database) { showCustomAlert('서버 연결이 필요합니다.'); return; }
    const id = 'pg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    database.ref('pregAsk/' + id).set({
        id: id, from: currentUser.code, fromName: currentUser.name,
        to: code, at: Date.now()
    });
    showCustomAlert(`${t.name} 사원에게 동의를 요청했습니다.\n수락하면 진행됩니다.`);
}

function doPregnancy(code) {
    const t = db.users[code];
    if (!t) return;
    // 수락 직전에 플러그를 채운 경우를 막는다
    if (typeof hasVaginaPlug === 'function' && hasVaginaPlug(t)) {
        showCustomAlert(`${t.name} 사원이 다이아 보지 플러그를 차고 있습니다.\n\n진행되지 않았습니다.`);
        return;
    }
    if (!canBear(t)) { showCustomAlert('상대가 받을 수 있는 상태가 아닙니다.'); return; }

    const sure = hasSureBear(t);                   // 딸기맛 물약 — 한 번에 된다
    const myR = roleFlipped(currentUser) ? sireRateAlt(currentUser) : sireRate(currentUser);
    const tR = roleFlipped(t) ? bearRateAlt(t) : bearRate(t);
    const chance = (myR / 100) * (tR / 100) * 6;   // 합산 보정

    const ok = sure || Math.random() < chance;

    if (!ok) {
        addHistoryLog(currentUser, `[시도] ${t.name} 사원 — 이번에는 되지 않았습니다.`);
        saveFields({ history: 1 });
        showCustomAlert('이번에는 되지 않았습니다.');
        return;
    }

    const p = pregOf(t) || { sires: [], due: Date.now() + PREG_HOURS * 3600000, careAt: {} };
    if (!p.sires) p.sires = [];
    p.sires.push({ code: currentUser.code, name: currentUser.name, at: Date.now() });
    if (!p.due) p.due = Date.now() + PREG_HOURS * 3600000;
    if (!p.careAt) p.careAt = {};
    p.careAt[currentUser.code] = Date.now();

    t.preg = p;
    appendBadgeNoteToUser(t, `[${currentUser.name} 사원의 아이를 임신했습니다]`);
    addHistoryLog(t, `[임신] ${currentUser.name} 사원의 아이를 가졌습니다.`);
    addHistoryLog(currentUser, `[임신] ${t.name} 사원을 임신시켰습니다.`);

    updateUserFields(code, { preg: p, badge: t.badge, history: t.history });
    saveFields({ history: 1 });
    updateUI();

    pregBroadcast(`축! <b style="color:#ff8fb1;">${currentUser.name}</b> 사원이 <b style="color:#ff8fb1;">${t.name}</b> 사원을 임신시켰습니다! 하!`);
    showCustomAlert(`성공했습니다.${sure ? '\n(딸기맛 물약)' : ''}\n\n${t.name} 사원이 당신의 아이를 가졌습니다.\n${PREG_HOURS}시간 뒤에 나옵니다.\n\n하루 ${PREG_CARE_DAILY}번까지 돌볼 수 있습니다. (최소 1시간 간격)\n8시간 넘게 방치하면 상담실로 이송됩니다.\n(자정부터 오전 10시까지는 세지 않습니다.)`);
    closeEmpDetailModal();
}

// ==========================================
// 동의 요청 수신
// ==========================================
(function watchAsk() {
    if (!database) return;
    database.ref('pregAsk').on('value', function (snap) {
        if (!currentUser) return;
        const v = snap.val() || {};
        const mine = Object.values(v).find(x => x && x.to === currentUser.code && Date.now() - x.at < 120000);
        if (!mine) { closePregAsk(); return; }
        if (window._pregAskId === mine.id) return;
        window._pregAskId = mine.id;
        openPregAsk(mine);
    });
})();

function openPregAsk(ask) {
    if (!document.getElementById('preg-ask-overlay')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="preg-ask-overlay" class="modal-overlay" style="display:none; z-index:10007;">
                <div class="modal-content" style="max-width:360px; text-align:center; border-color:#c2185b;">
                    <div style="font-size:28px; margin-bottom:10px;">🤍</div>
                    <div id="preg-ask-text" style="font-size:13px; color:#eee; line-height:1.9; margin-bottom:18px;"></div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-cancel" style="flex:1; background:#444; border-color:#555 !important;" onclick="rejectPregAsk()">거절</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:12px; background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;" onclick="acceptPregAsk()">수락</button>
                    </div>
                </div>
            </div>`);
    }
    const r = myRates(currentUser);
    document.getElementById('preg-ask-text').innerHTML =
        `<b style="color:#ff8fb1;">${ask.fromName}</b> 사원이<br>당신에게 동의를 구하고 있습니다.<br><br>
         <span style="font-size:11px; color:#888;">당신이 받을 확률 <b style="color:#ffd700;">${r.bear !== null ? r.bear + '%' : '-'}</b></span>`;
    document.getElementById('preg-ask-overlay').style.display = 'flex';
}
function closePregAsk() {
    const el = document.getElementById('preg-ask-overlay');
    if (el) el.style.display = 'none';
    window._pregAskId = null;
}
function acceptPregAsk() {
    const id = window._pregAskId;
    closePregAsk();
    if (!id || !database) return;
    database.ref('pregAsk/' + id).once('value').then(function (s) {
        const a = s.val();
        database.ref('pregAsk/' + id).remove();
        if (!a) return;
        database.ref('pregGo/' + a.from).set({ to: currentUser.code, at: Date.now() });
    });
}
function rejectPregAsk() {
    const id = window._pregAskId;
    closePregAsk();
    if (id && database) database.ref('pregAsk/' + id).remove();
}

// 수락 신호를 받으면 신청자 쪽에서 판정
(function watchGo() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        database.ref('pregGo/' + currentUser.code).on('value', function (s) {
            const v = s.val();
            if (!v || Date.now() - v.at > 60000) return;
            database.ref('pregGo/' + currentUser.code).remove();
            doPregnancy(v.to);
        });
    }, 1500);
})();

// ==========================================
// 확률 표시 — 사원증 탭
// ==========================================
(function showMyRate() {
    function rateHTML() {
        const r = myRates(currentUser);
        return `
            <div style="font-size:10px; color:#c9a8ff; letter-spacing:1px; margin-bottom:4px;">[생체 기록]</div>
            DNA <b style="font-family:monospace; color:#4fc3f7;">${dnaOf(currentUser)}</b><br>
            ${r.sire !== null ? `임신시킬 확률 <b style="color:#ffd700;">${r.sire}%</b><br>` : ''}
            ${r.bear !== null ? `임신될 확률 <b style="color:#ff8fb1;">${r.bear}%</b>` : ''}
            ${r.sire === null && r.bear === null ? '<span style="color:#888;">해당 없음</span>' : ''}
            <div style="font-size:9px; color:#666; margin-top:5px;">본인에게만 보입니다.</div>`;
    }
    function put() {
        const panel = document.getElementById('rec-badge');
        if (!panel || !currentUser) return;

        const old = document.getElementById('preg-rate-box');
        if (old) {
            // 이미 있으면 내용만 바꾼다. 지웠다 붙이면 높이가 출렁여 깜빡인다.
            const next = rateHTML();
            if (old.innerHTML !== next) old.innerHTML = next;
            return;
        }

        const btn = panel.querySelector('button[onclick*="saveBadgeInfo"]');
        if (!btn) return;
        btn.insertAdjacentHTML('beforebegin',
            `<div id="preg-rate-box" style="background:rgba(0,0,0,0.28); border:1px solid #4a3a6a; border-radius:6px; padding:10px 12px; margin:11px 0; font-size:11px; line-height:1.9;">${rateHTML()}</div>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
    if (typeof updateUI === 'function') {
        const _u = updateUI;
        let tick = null;
        updateUI = function () {
            const r = _u.apply(this, arguments);
            clearTimeout(tick);
            tick = setTimeout(put, 40);
            return r;
        };
    }
})();

console.log('[임신] 판정 · 동의 · 티커 적용');
;

// ---------- pregnancy2.js ----------
// ==========================================
// ★ 임신 — 돌봄 · 출산 · 이송
// index.html 에서 pregnancy.js 다음에 불러온다
// ==========================================

const CARE_GAP = 1 * 3600000;      // 최소 1시간 간격
const CARE_GRACE = 30 * 60000;     // 30분 유예
const NEGLECT_HOURS = 8;           // 이만큼 안 돌보면 방치 (밤 시간 제외)
const NIGHT_END_HOUR = 10;         // 자정~이 시각까지는 안 센다

// 오늘 돌본 횟수 / 남은 횟수
function careDayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function careUsedToday(p) {
    if (!p || !p.careDay) return 0;
    const v = p.careDay[currentUser.code];
    if (!v || v.d !== careDayKey()) return 0;
    return v.n || 0;
}
function careLeftToday(p) {
    const cap = (typeof PREG_CARE_DAILY !== 'undefined') ? PREG_CARE_DAILY : 8;
    return Math.max(0, cap - careUsedToday(p));
}
function careAddToday(p, n) {
    if (!p.careDay) p.careDay = {};
    const k = careDayKey();
    const v = p.careDay[currentUser.code];
    if (!v || v.d !== k) p.careDay[currentUser.code] = { d: k, n: n };
    else v.n = (v.n || 0) + n;
}

// ==========================================
// 돌봄 화면
// ==========================================
function openCarePanel(code) {
    const t = db.users[code];
    if (!t || !isPregnant(t)) return;
    const p = pregOf(t);
    const last = (p.careAt || {})[currentUser.code] || 0;
    if (Date.now() - last < CARE_GAP) {
        const m = Math.ceil((last + CARE_GAP - Date.now()) / 60000);
        showCustomAlert(`아직 이릅니다.\n${m}분 뒤에 다시 오세요.`);
        return;
    }
    const left = careLeftToday(p);
    if (left <= 0) {
        showCustomAlert(`오늘은 다 돌봤습니다.\n\n하루 ${PREG_CARE_DAILY}번까지입니다.`);
        return;
    }

    const inv = currentUser.inventory || [];
    const owned = Object.keys(PREG_ITEMS).filter(n => inv.includes(n));

    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.8; margin-bottom:13px;">
            <b style="color:#ff8fb1;">${t.name}</b> 사원을 돌봅니다.<br>
            포인트를 쓰거나, 사택에서 산 물건을 쓸 수 있습니다.<br>
            오늘 <b style="color:#ffd76a;">${left}회</b> 남았습니다. (하루 ${PREG_CARE_DAILY}회 · 최소 1시간 간격)<br>
            ${careBank() > 0 ? `쌓아 둔 회분 <b style="color:#4CAF50;">${careBank()}회</b><br>` : ''}
            <span style="color:#ff9800;">${NEGLECT_HOURS}시간 넘게 돌보지 않으면 당신이 상담실로 갑니다.</span><br>
            <span style="font-size:10px; color:#888;">자정부터 오전 ${NIGHT_END_HOUR}시까지는 세지 않습니다.</span>
        </div>

        <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px; margin-bottom:9px;">
            <div style="font-size:12px; color:#c9a8ff; font-weight:bold; margin-bottom:7px;">포인트로</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px;">보유 ${currentUser.points.toLocaleString()} P</div>
            <div style="display:flex; gap:5px;">
                ${[500, 1200, 3000].map(v => `
                    <button class="game-btn" style="flex:1; margin:0; padding:9px 4px; font-size:11px;" onclick="doCare('${code}', ${v}, '')" ${currentUser.points >= v ? '' : 'disabled'}>
                        ${v.toLocaleString()} P
                    </button>`).join('')}
            </div>
        </div>

        <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px;">
            <div style="font-size:12px; color:#c9a8ff; font-weight:bold; margin-bottom:7px;">물건으로</div>
            ${owned.length ? owned.map(n => {
                const cnt = inv.filter(x => x === n).length;
                return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:5px; padding:8px 10px; margin-bottom:5px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:11px; color:#fff;">${n} <span style="color:#888;">x${cnt}</span></div>
                        <div style="font-size:9px; color:#888;">${PREG_ITEMS[n].care}회분</div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px;" onclick="doCare('${code}', 0, '${n}')">쓴다</button>
                </div>`;
            }).join('') : '<div style="font-size:10px; color:#666;">가진 물건이 없습니다. 사택 매점에서 살 수 있습니다.</div>'}
        </div>

        ${careBank() > 0 ? `
        <div style="border:1px solid #2e7d32; border-radius:6px; padding:11px; margin-top:9px;">
            <div style="font-size:12px; color:#81c784; font-weight:bold; margin-bottom:7px;">쌓아 둔 회분</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px;">
                지난번에 다 못 쓴 것입니다. ${careBank()}회 남아 있습니다.
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="doCare('${code}', 0, '@bank')">
                ${Math.min(careBank(), left)}회분 쓴다
            </button>
        </div>` : ''}`;

    openGearModal('돌봄', html);
}

function doCare(code, cost, item) {
    if (!buyGuard()) return;
    const t = db.users[code];
    if (!t || !isPregnant(t)) return;
    const p = pregOf(t);

    const left = careLeftToday(p);
    if (left <= 0) { showCustomAlert(`오늘은 다 돌봤습니다.\n\n하루 ${PREG_CARE_DAILY}번까지입니다.`); return; }

    let uses = 1;
    let banked = 0;
    if (item === '@bank') {
        if (careBank() <= 0) { showCustomAlert('쌓아 둔 회분이 없습니다.'); return; }
        uses = Math.min(careBank(), left);
        careBankUse(uses);
        banked = careBank();
    } else if (item) {
        if (!(currentUser.inventory || []).includes(item)) { showCustomAlert('그 물건이 없습니다.'); return; }
        const give = PREG_ITEMS[item] ? PREG_ITEMS[item].care : 1;
        removeItemFromInventory(currentUser, item, 1);
        // 하루 한도를 넘는 회분은 버리지 않고 쌓아 둔다
        careBankAdd(give);
        uses = Math.min(careBank(), left);
        careBankUse(uses);
        banked = careBank();
    } else {
        if (currentUser.points < cost) { showLuxuryAlert(); return; }
        currentUser.points -= cost;
        uses = cost >= 3000 ? 3 : cost >= 1200 ? 2 : 1;
        if (uses > left) uses = left;
    }
    if (uses <= 0) { showCustomAlert('오늘은 더 돌볼 수 없습니다.'); return; }

    if (!p.careAt) p.careAt = {};
    p.careAt[currentUser.code] = Date.now() + (uses - 1) * CARE_GAP;
    careAddToday(p, uses);
    if (!p.careCount) p.careCount = {};
    p.careCount[currentUser.code] = (p.careCount[currentUser.code] || 0) + uses;

    t.preg = p;
    addHistoryLog(currentUser, `[돌봄] ${t.name} 사원을 돌봤습니다. (${uses}회분)`);
    addHistoryLog(t, `[돌봄] ${currentUser.name} 사원이 들렀습니다.`);
    t.satiety = Math.min(100, (t.satiety || 100) + 5);
    t.pollution = Math.max(0, (t.pollution || 0) - 3);

    updateUserFields(code, { preg: p, history: t.history, satiety: t.satiety, pollution: t.pollution });
    saveFields({ points: 1, inventory: 1, history: 1, pregCareBank: 1 });
    closeGearModal();
    updateUI();
    showCustomAlert(`${t.name} 사원을 돌봤습니다. (${uses}회분)\n\n다음 돌봄까지 ${uses}시간입니다.\n오늘 ${careLeftToday(p)}회 남았습니다.`
        + (banked > 0 ? `\n\n남은 회분 ${banked}회는 다음에 쓸 수 있습니다.` : ''));
}

// ==========================================
// 쌓아 둔 돌봄 회분
// ==========================================
function careBank() {
    return (currentUser && currentUser.pregCareBank) || 0;
}
function careBankAdd(n) {
    if (!currentUser) return;
    currentUser.pregCareBank = careBank() + n;
}
function careBankUse(n) {
    if (!currentUser) return;
    currentUser.pregCareBank = Math.max(0, careBank() - n);
}

// ==========================================
// 방치 감시 — 8시간 (자정~오전 10시 제외)
// ==========================================
// 자정~오전 10시는 안 센다. 그 시간을 뺀 실제 경과를 구한다.
function awakeMs(from, to) {
    if (!from || to <= from) return 0;
    let total = 0;
    let cur = from;
    let guard = 0;
    while (cur < to && guard++ < 400) {
        const d = new Date(cur);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const wake = dayStart + NIGHT_END_HOUR * 3600000;   // 그날 오전 10시
        const nextDay = dayStart + 24 * 3600000;
        const segEnd = Math.min(to, nextDay);
        const segStart = Math.max(cur, wake);
        if (segEnd > segStart) total += segEnd - segStart;
        cur = nextDay;
    }
    return total;
}

// 지금이 안 세는 시간대인가
function inNightWindow(t) {
    return new Date(t || Date.now()).getHours() < NIGHT_END_HOUR;
}

function checkPregNeglect() {
    if (!currentUser || !database) return;
    if (currentUser.code === 'kario0987') return; 
    if (inNightWindow()) return;                 // 자정~오전 10시는 넘어간다

    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !isPregnant(u)) return;
        const p = pregOf(u);
        (p.sires || []).forEach(function (s) {
            if (s.code !== currentUser.code) return;
            const last = (p.careAt || {})[currentUser.code] || s.at || 0;
            if (!last) return;
                        
                    
                       // 오늘 한 번이라도 돌봤으면 방치로 세지 않는다
            if (careUsedToday(p) > 0) return;
            if (awakeMs(last, Date.now()) < NEGLECT_HOURS * 3600000) return;
            if (currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) return;

            currentUser.quarantineUntil = Date.now() + 3 * 3600000;
            currentUser.quarantineExitPollution = 30;
            currentUser.quarantineHospital = false;
            currentUser.foxRoomAnswered = true;
            if (!p.careAt) p.careAt = {};
            p.careAt[currentUser.code] = Date.now();
            u.preg = p;

            addHistoryLog(currentUser, `[방치] ${u.name} 사원을 돌보지 않아 상담실로 이송되었습니다.`);
            updateUserFields(c, { preg: p });
            saveFields({ quarantineUntil: 1, quarantineExitPollution: 1, foxRoomAnswered: 1, history: 1 });
            updateUI();
            showCustomAlert(`${u.name} 사원을 ${NEGLECT_HOURS}시간 넘게 돌보지 않았습니다.\n\n상담실로 이송됩니다. (3시간)`);
        });
    });
}

// ==========================================
// 출산
// ==========================================
function checkPregBirth() {
    if (!currentUser || !database) return;
    if (!isPregnant(currentUser)) return;
    const p = pregOf(currentUser);
    if (Date.now() < p.due) return;
    if (currentUser._birthing) return;
    currentUser._birthing = true;

    const sires = p.sires || [];
    const n = sires.length;
    let count = n >= 5 ? 5 : n >= 2 ? Math.min(n, 4) : (1 + Math.floor(Math.random() * 3));
    // 사파이어 요도 플러그 — 남이 채워 준 경우에만
    if (typeof sapCountBonus === 'function') count += sapCountBonus(currentUser);
    count = Math.min(8, count);

    const fill = (typeof careFill === 'function') ? careFill(p) : 0;

    // 고유 아이템인지, 누구 것인지 판별
    const ownerOf = function (nm) {
        const c = ITEM_CATALOG[nm];
        return (c && c.dnaOwner) ? c.dnaOwner : null;
    };
    // 고유가 아닌 것을 하나 뽑는다
    const plainItem = function (a, b) {
        for (let k = 0; k < 40; k++) {
            const x = rollBirthItem(a, b, fill);
            if (!ownerOf(x)) return x;
        }
        return BIRTH_ITEMS[Math.floor(Math.random() * BIRTH_ITEMS.length)].n;
    };

    // got[i] 는 i 번째 아버지와의 몫
    const got = [];
    for (let i = 0; i < count; i++) {
        const other = sires[i % n];
        const oUser = other ? db.users[other.code] : null;
        got.push(rollBirthItem(currentUser, oUser, fill));
    }

    // 어미 몫 · 아비 몫을 따로 담는다
    // 고유 아이템은 주인에게만 간다. 상대는 다른 것을 받는다.
    const mineGot = [];
    const sireGot = {};
    for (let i = 0; i < count; i++) {
        const other = sires[i % n];
        const oCode = other ? other.code : null;
        const oUser = oCode ? db.users[oCode] : null;
        const item = got[i];
        const own = ownerOf(item);

        if (!own) {
            // 고유가 아니면 양쪽 다 같은 것
            mineGot.push(item);
            if (oCode) (sireGot[oCode] = sireGot[oCode] || []).push(item);
            continue;
        }

        if (own === currentUser.code) {
            mineGot.push(item);
            if (oCode) (sireGot[oCode] = sireGot[oCode] || []).push(plainItem(currentUser, oUser));
        } else if (oCode && own === oCode) {
            (sireGot[oCode] = sireGot[oCode] || []).push(item);
            mineGot.push(plainItem(currentUser, oUser));
        } else {
            // 둘 다 주인이 아니면 고유가 아닌 것으로 바꾼다
            const sub = plainItem(currentUser, oUser);
            got[i] = sub;
            mineGot.push(sub);
            if (oCode) (sireGot[oCode] = sireGot[oCode] || []).push(sub);
        }
    }

        // 아버지가 count 보다 많으면 뒤쪽 사람이 빈손이 된다 — 한 개씩은 챙겨 준다
    sires.forEach(function (s) {
        if (sireGot[s.code] && sireGot[s.code].length) return;
        const oUser = db.users[s.code] || null;
        sireGot[s.code] = [plainItem(currentUser, oUser)];
    });

    mineGot.forEach(x => currentUser.inventory.push(x));

      
    // 특이사항 정리
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ').filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    currentUser.preg = null;

    addHistoryLog(currentUser, `[출산] ${count}개가 나왔습니다. (${mineGot.join(', ')})`);
    saveSelfFull();
    updateUI();

    // 아버지들에게도
    sires.forEach(function (s) {
        const f = db.users[s.code];
        if (!f) return;
        const list = sireGot[s.code] || [];
        if (!list.length) return;
        if (!f.inventory) f.inventory = [];
        list.forEach(function (item) {
            f.inventory.push(item);
            addHistoryLog(f, `[출산] ${currentUser.name} 사원에게서 '${item}'이(가) 나왔습니다.`);
        });
        updateUserFields(s.code, { inventory: f.inventory, history: f.history });
    });

    pregBroadcast(`<b style="color:#ff8fb1;">${currentUser.name}</b> 사원이 ${count}개를 낳았습니다.`);
    const totalCare = Object.values(p.careCount || {}).reduce((a, b) => a + b, 0);
    const goal = PREG_CARE_DAILY * 2;
    showCustomAlert(`나왔습니다.\n\n${mineGot.join('\n')}\n\n돌봄 ${totalCare} / ${goal}회`
        + (fill >= 1 ? '\n다 채웠습니다. 좋은 것이 나왔을 겁니다.' : '')
        + `\n\n아버지들에게도 하나씩 갔습니다.`);
    setTimeout(function () { if (currentUser) currentUser._birthing = false; }, 5000);
}

// ==========================================
// 물약 만료 시 임신 해제
// ==========================================
function checkPregPotion() {
    if (!currentUser || !isPregnant(currentUser)) return;
    if (genderOf(currentUser) === '여성') return;
    if (canBear(currentUser)) return;

    const p = pregOf(currentUser);
    (p.sires || []).forEach(function (s) {
        const f = db.users[s.code];
        if (!f) return;
        addHistoryLog(f, `[임신 해제] ${currentUser.name} 사원의 몸이 조건을 잃었습니다.`);
        updateUserFields(s.code, { history: f.history });
    });

    currentUser.preg = null;
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ').filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    addHistoryLog(currentUser, `[임신 해제] 물약의 효과가 끝나 임신 상태가 사라졌습니다.`);
    saveSelfFull();
    updateUI();
    showCustomAlert('몸이 돌아왔습니다.\n임신 상태가 사라졌습니다.');
}

setInterval(function () {
    if (!currentUser) return;
    checkPregBirth();
    checkPregPotion();
    checkPregNeglect();
}, 60000);
setTimeout(function () {
    if (!currentUser) return;
    checkPregBirth();
    checkPregPotion();
}, 4000);

// ==========================================
// 사택 매점 비치
// ==========================================
(function hookStore() {
    function put() {
        const box = document.getElementById('house-main-body');
        if (!box || !currentUser || document.getElementById('preg-store')) return;
        if (box.innerHTML.length < 50) return;

        const rows = Object.keys(PREG_ITEMS).map(function (n) {
            const it = PREG_ITEMS[n];
            return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:5px; padding:8px 10px; margin-bottom:5px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:#fff;">${n}</div>
                    <div style="font-size:9px; color:#888;">${it.d}</div>
                </div>
                <button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px; flex-shrink:0;" onclick="buyPregItem('${n}')">${it.price.toLocaleString()} P</button>
            </div>`;
        }).join('');

        box.insertAdjacentHTML('beforeend', `
            <div id="preg-store" style="border:1px solid #c2185b; border-radius:6px; padding:12px; margin-top:13px; background:rgba(194,24,91,0.05);">
                <div style="font-size:11px; color:#ff8fb1; font-weight:bold; margin-bottom:8px;">🤍 돌봄 용품</div>
                <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.6;">
                    임신한 사원을 돌볼 때 씁니다. 여러 번치를 한 번에 채울 수 있습니다.
                </div>
                ${rows}
            </div>`);
    }
    if (typeof renderHouse === 'function') {
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            setTimeout(put, 90);
            return r;
        };
    }
    setTimeout(put, 1500);
})();

function buyPregItem(n) {
    if (!buyGuard()) return;
    const it = PREG_ITEMS[n];
    if (!it) return;
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 살 수 없습니다.'); return; }
    if (currentUser.points < it.price) { showLuxuryAlert(); return; }
    currentUser.points -= it.price;
    currentUser.inventory.push(n);
    addHistoryLog(currentUser, `[사택 매점] ${n} 구입 (-${it.price} P)`);
    saveFields({ points: 1, inventory: 1, history: 1 });
    updateUI();
    showCustomAlert(`${n}을(를) 샀습니다.`);
}

// ==========================================
// 내 방에 임신 상태 표시
// ==========================================
(function showMyPreg() {
    if (typeof renderHouse !== 'function') return;
    const _r = renderHouse;
    renderHouse = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('house-main-body');
            if (!box || !currentUser || document.getElementById('my-preg-box')) return;
            if (!isPregnant(currentUser)) return;
            const p = pregOf(currentUser);
            const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
            box.insertAdjacentHTML('afterbegin', `
                <div id="my-preg-box" style="background:rgba(194,24,91,0.08); border:1px solid #c2185b; border-radius:6px; padding:11px; margin-bottom:11px; font-size:11px; line-height:1.9;">
                    <b style="color:#ff8fb1;">임신 중</b> · 출산까지 <b>${left}시간</b><br>
                    아버지 ${p.sires.map(s => s.name).join(', ')}<br>
                    <span style="font-size:10px; color:#888;">나오는 수는 아버지 수에 따라 정해집니다.</span>
                </div>`);
        }, 70);
        return r;
    };
})();

console.log('[임신] 돌봄 · 출산 · 이송 적용');
;

// ---------- preg-dark-fix.js ----------
// ==========================================
// ★ 유산 처리 · 어둠 사망 정리
// index.html 에서 pregnancy2.js 다음에 불러온다
// ==========================================

// ==========================================
// 1. 임신 중에 몸이 바뀌면 아이가 사라진다
//    (여성이 우유맛·포도맛을 마신 경우 등)
// ==========================================
function checkMiscarriage() {
    if (!currentUser) return;
    if (typeof isPregnant !== 'function' || !isPregnant(currentUser)) return;
    if (typeof canBear !== 'function' || canBear(currentUser)) return;   // 아직 받을 수 있는 몸

    if (currentUser._losing) return;
    currentUser._losing = true;

    const p = pregOf(currentUser);
    const sires = (p && p.sires) || [];
    const n = sires.length;

    currentUser.preg = null;

    // 특이사항 정리
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ')
            .filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }

    addHistoryLog(currentUser, `[유산] 몸이 바뀌어 아이가 남지 않았습니다. (${n}명분)`);
    saveSelfFull();
    updateUI();

    // 아버지들에게도 알린다
    sires.forEach(function (s) {
        const f = db.users[s.code];
        if (!f) return;
        addHistoryLog(f, `[유산] ${currentUser.name} 사원의 몸이 바뀌어 아이가 사라졌습니다.`);
        updateUserFields(s.code, { history: f.history });
    });

    if (typeof pregBroadcast === 'function') {
        pregBroadcast(`<b style="color:#888;">${currentUser.name}</b> 사원의 아이가 사라졌습니다.`);
    }

    showCustomAlert('몸이 바뀌었습니다.\n\n가지고 있던 것이 남지 않았습니다.'
        + (n ? `\n\n(아버지 ${n}명분 전부)` : ''));

    setTimeout(function () { if (currentUser) currentUser._losing = false; }, 5000);
}

// 물약을 쓰는 순간 바로 확인
(function hookPotionUse() {
    ['useInventoryItem', 'confirmItemTarget', 'applyItemEffect'].forEach(function (nm) {
        if (typeof window[nm] !== 'function') return;
        const _f = window[nm];
        window[nm] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(checkMiscarriage, 400);
            return r;
        };
    });
})();

// 주기 확인 — 남이 먹였거나 상담사가 걸었을 때
setInterval(checkMiscarriage, 15000);
setTimeout(checkMiscarriage, 4000);

// ==========================================
// 2. 어둠에서 죽으면 그 자리에서 기록을 지운다
//    안 지우면 새로고침 때 복귀 창이 떠서 다시 들어간다
// ==========================================
(function fixDeathState() {
    function wipe(why) {
        try {
            if (typeof clearDarkRunState === 'function') clearDarkRunState();
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId && database) {
                database.ref(`darkParties/${darkRun.partyId}/alive/${currentUser.code}`).remove();
            }
            console.log('[어둠] 탐사 기록을 지웠습니다. (' + why + ')');
        } catch (e) { console.warn('[어둠] 기록 정리 실패:', e); }
    }

    let tries = 0;
    const iv = setInterval(function () {
        let done = 0;

        if (typeof darkDeath === 'function' && !darkDeath._wiped) {
            const _d = darkDeath;
            darkDeath = function () {
                const r = _d.apply(this, arguments);
                // 장비로 살아난 경우에는 _dead 가 다시 false 가 된다
                if (typeof darkRun !== 'undefined' && darkRun && darkRun._dead) wipe('사망');
                return r;
            };
            darkDeath._wiped = true;
        }
        if (typeof darkDeath === 'function' && darkDeath._wiped) done++;

        if (typeof useResignLetter === 'function' && !useResignLetter._wiped) {
            const _u = useResignLetter;
            useResignLetter = function () {
                const r = _u.apply(this, arguments);
                wipe('사직');
                return r;
            };
            useResignLetter._wiped = true;
        }
        if (typeof useResignLetter === 'function' && useResignLetter._wiped) done++;

        if (done >= 2 || ++tries > 60) clearInterval(iv);
    }, 500);
})();

// 복귀 창이 떴는데 이미 죽어 있던 경우를 막는다
(function guardResume() {
    if (typeof showDarkResumePrompt !== 'function') return;
    const _s = showDarkResumePrompt;
    showDarkResumePrompt = function (st, away) {
        // 상담실에 있거나 오염도가 100이면 죽어서 나온 것이다
        const dead = currentUser &&
            ((currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) ||
             (currentUser.pollution || 0) >= 100);
        if (dead) {
            if (typeof clearDarkRunState === 'function') clearDarkRunState();
            console.log('[어둠] 사망 상태여서 복귀 창을 띄우지 않았습니다.');
            return;
        }
        return _s.apply(this, arguments);
    };
})();

console.log('[임신] 유산 처리 적용 · [어둠] 사망 기록 정리 적용');
;

// ---------- cure-fix.js ----------
// ==========================================
// ★ 제거약 — 신규 물약 10종도 풀리게
// index.html 에서 preg-guard.js 앞에 불러온다
// ==========================================
//
// 원래 제거약은 이름 목록으로 대상을 거른다.
//     const POTION_NAMES = ['포도맛 물약', ... '바나나맛 물약'];
// newitems.js 의 10종이 목록에 없어서 안 풀린다.
// 투명 물약으로 고정하면 영영 안 풀리는 문제가 생긴다.
//
// 이름 목록 대신 '물약으로 끝나는 효과'를 전부 대상으로 삼는다.

function isPotionEffect(eff) {
    if (!eff || !eff.name) return false;
    return /물약$/.test(String(eff.name).trim());
}

(function fixCurePotion() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'cure_potion') return _f.apply(this, arguments);
        if (!targetUser) return false;

        const candidates = [];

        (targetUser.timedEffects || []).forEach(function (eff, i) {
            if (isPotionEffect(eff)) candidates.push({ type: 'effect', idx: i, name: eff.name });
        });

        if (targetUser.slaveUntil && (targetUser.slaveFixed || Date.now() < targetUser.slaveUntil)) {
            candidates.push({ type: 'slave', name: '노예 계약' });
        }

        if (candidates.length === 0) {
            if (!isOthers) showCustomAlert('제거할 효과가 없습니다.');
            return false;
        }

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const removedName = pick.name;
        const wasFixed = pick.type === 'effect'
            ? !!targetUser.timedEffects[pick.idx].fixed
            : !!targetUser.slaveFixed;

        if (pick.type === 'effect') {
            targetUser.timedEffects.splice(pick.idx, 1);
        } else {
            targetUser.slaveUntil = 0;
            targetUser.slaveFixed = false;
            targetUser.masterName = null;
        }

        // 특이사항에서도 걷어 낸다
        if (targetUser.badge && targetUser.badge.notes) {
            const key = pick.type === 'slave' ? '노예 계약' : removedName;
            const arr = targetUser.badge.notes.split(' | ')
                .filter(n => n.trim() !== '' && !n.includes(key));
            targetUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
        }

        addHistoryLog(targetUser, `[제거약] ${removedName} 효과가 씻겨 나갔습니다.`
            + (wasFixed ? ' (고정되어 있던 것)' : ''));

        if (!isOthers) {
            showCustomAlert(`[제거약 효과]\n${removedName}의 효과가 사라졌습니다.`
                + (wasFixed ? '\n\n고정되어 있던 것이 풀렸습니다.' : ''));
        }
        return true;
    };
})();

// 확인용 — 지금 제거약으로 풀 수 있는 것
function curableOf(code) {
    const u = code ? db.users[code] : currentUser;
    if (!u) { console.warn('대상이 없습니다.'); return; }

    const rows = (u.timedEffects || []).map(function (e) {
        return {
            효과: e.name,
            내용: e.desc,
            고정: e.fixed ? 'O' : '-',
            제거약: isPotionEffect(e) ? '가능' : '불가'
        };
    });
    if (u.slaveUntil && (u.slaveFixed || Date.now() < u.slaveUntil)) {
        rows.push({ 효과: '노예 계약', 내용: (u.masterName || '') + ' 사원과', 고정: u.slaveFixed ? 'O' : '-', 제거약: '가능' });
    }

    console.log('%c===== ' + u.name + ' =====', 'color:#c9a8ff; font-size:13px');
    if (!rows.length) { console.log('걸린 효과가 없습니다.'); return; }
    console.table(rows);
    const n = rows.filter(r => r.제거약 === '가능').length;
    console.log('제거약으로 풀 수 있는 것: ' + n + '개 (무작위로 하나)');
}

console.log('[물약] 제거약 대상 확장 — curableOf() 로 확인');
;

// ---------- equip-lock.js ----------
// ==========================================
// ★ 남이 채운 것은 스스로 못 뺀다
// index.html 에서 equip-fix.js 다음에 불러온다
// ==========================================
//
// unequipWeapon 은 번호로 바로 빼낸다. 누가 채웠는지 보지 않는다.
// 아래 목록에 든 물건은, 채운 사람이 따로 있으면 본인이 뺄 수 없다.
// 채운 사람은 예전처럼 retrieveEquipFromUser 로 거둬 간다.

(function equipLock() {

// 잠글 물건 — 여기에 이름을 더하면 같이 잠긴다
const LOCKED = [
    '루비 클리 피어싱',
    '루비 유두 피어싱'
];

function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
}

function lockedBy(w) {
    if (LOCKED.indexOf(baseOf(w)) === -1) return null;
    const o = (typeof getEquipOwner === 'function') ? getEquipOwner(currentUser, w) : null;
    if (!o || o === currentUser.code) return null;
    return o;
}

(function hookUnequip() {
    const iv = setInterval(function () {
        if (typeof unequipWeapon !== 'function') return;
        if (unequipWeapon._ownerLock) { clearInterval(iv); return; }

        const _f = unequipWeapon;
        unequipWeapon = function (index) {
            if (!window.__equipForce) {
                const w = (currentUser.equippedWeapons || [])[index];
                const o = w ? lockedBy(w) : null;
                if (o) {
                    const nm = (db.users[o] || {}).name || o;
                    showCustomAlert(baseOf(w) + '\n\n'
                        + nm + ' 사원이 채운 것입니다.\n스스로는 뺄 수 없습니다.');
                    return;
                }
            }
            return _f.apply(this, arguments);
        };
        unequipWeapon._ownerLock = true;
        clearInterval(iv);
        console.log('[장착잠금] ' + LOCKED.join(' · ') + ' — 본인 해제 차단');
    }, 500);
})();

// ==========================================
// 상담사용 — 억지로 뺀다
// ==========================================
window.forceUnequip = function (index) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.warn('상담사만 쓸 수 있습니다.'); return;
    }
    window.__equipForce = true;
    try { unequipWeapon(index); }
    finally { window.__equipForce = false; }
};

// 남의 계정에서 억지로 뺀다 — forceUnequipFor('4892', '루비 클리 피어싱')
window.forceUnequipFor = function (who, name) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.warn('상담사만 쓸 수 있습니다.'); return;
    }
    const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .find(function (u) { return u && (u.no === who || u.code === who || u.name === who); });
    if (!t) { console.warn('사원을 못 찾았습니다: ' + who); return; }
    const eq = t.equippedWeapons || [];
    const i = eq.findIndex(function (w) { return baseOf(w) === name; });
    if (i < 0) { console.warn(t.name + ' 사원은 ' + name + ' 을(를) 차고 있지 않습니다.'); return; }
    const full = eq[i];
    eq.splice(i, 1);
    if (t.equipOwner) delete t.equipOwner[full];
    updateUserFields(t.code, { equippedWeapons: eq, equipOwner: t.equipOwner || {} });
    console.log('%c✓ ' + t.name + ' 사원에게서 ' + full + ' 을(를) 뺐습니다.', 'color:#4CAF50');
};

// ==========================================
// 확인
// ==========================================
window.equipLockState = function (who) {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x.no === who || x.code === who || x.name === who; })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' 장착 =====', 'color:#c9a8ff; font-size:13px');
    const rows = (u.equippedWeapons || []).map(function (w, i) {
        const b = baseOf(w);
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        const locked = LOCKED.indexOf(b) >= 0 && o && o !== u.code;
        return {
            번호: i,
            물건: b,
            '채운 사람': !o ? '(기록 없음)' : (o === u.code ? '본인' : ((db.users[o] || {}).name || o)),
            '본인 해제': locked ? '✗ 막힘' : '가능'
        };
    });
    if (rows.length) console.table(rows); else console.log('  (없음)');
    console.log('  잠금 대상:', LOCKED.join(' · '));
};

console.log('[장착잠금] equipLockState() · forceUnequip(번호) · forceUnequipFor(사번, 이름)');

})();
;

// ---------- preg-guard.js ----------
// ==========================================
// ★ 임신 중 보호 — 남이 쓰는 물약을 막는다
// index.html 에서 preg-dark-fix.js 다음에 불러온다
// ==========================================
//
// 임신한 사원에게 남이 제거약 · 우유맛 · 포도맛을 쓰면
// 몸이 바뀌어 아이가 사라진다. 본인이 쓰는 것은 막지 않는다.

const PREG_GUARD_ITEMS = ['제거약', '우유맛 물약', '포도맛 물약'];

function pregGuarded(user, itemName) {
    if (!user || !itemName) return false;
    if (PREG_GUARD_ITEMS.indexOf(itemName) === -1) return false;
    if (typeof isPregnant !== 'function') return false;
    return isPregnant(user);
}

// --- 1. 대상을 지정해 쓰는 경우 ---
(function guardTargeted() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (isOthers && pregGuarded(targetUser, itemName)) {
            showCustomAlert(`${targetUser.name} 사원은 지금 받을 수 없습니다.\n\n임신 중인 사원에게는 '${itemName}'을(를) 쓸 수 없습니다.`);
            return false;
        }
        return _f.apply(this, arguments);
    };
})();

// --- 2. 대상 목록에서 아예 빼 둔다 ---
(function guardTargetList() {
    if (typeof openItemTargetModal !== 'function') return;
    const _o = openItemTargetModal;

    openItemTargetModal = function (itemName, isPotion) {
        const r = _o.apply(this, arguments);
        if (PREG_GUARD_ITEMS.indexOf(itemName) === -1) return r;

        setTimeout(function () {
            const sel = document.getElementById('item-target-select');
            if (!sel) return;
            let removed = 0;
            Array.from(sel.options).forEach(function (op) {
                if (!op.value) return;
                const u = db.users[op.value];
                if (!u || !isPregnant(u)) return;
                op.remove();
                removed++;
            });
            if (!removed) return;

            const title = document.getElementById('target-modal-title');
            if (title && !document.getElementById('preg-guard-note')) {
                title.insertAdjacentHTML('afterend',
                    `<div id="preg-guard-note" style="font-size:10px; color:#ff8fb1; margin:-6px 0 10px 0; line-height:1.6;">
                        임신 중인 사원 ${removed}명은 목록에서 빠졌습니다.
                     </div>`);
            }
        }, 60);
        return r;
    };
})();

// --- 3. 석류맛 물약 — 무작위 대상에서 임신한 사원을 뺀다 ---
(function guardPomegranate() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (itemName !== '석류맛 물약') return _f.apply(this, arguments);

        const pool = ['grape_potion', 'milk_potion', 'apple_potion', 'orange_potion',
                      'peach_potion', 'cherry_potion', 'pineapple_potion', 'plum_potion', 'persimmon_potion'];
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const risky = (picked === 'grape_potion' || picked === 'milk_potion');

        let cands = Object.keys(db.users).filter(c => c !== 'kario0987');
        if (risky) cands = cands.filter(c => !isPregnant(db.users[c]));   // 임신한 사원은 뺀다
        if (cands.length === 0) { showCustomAlert('적용할 사원이 없습니다.'); return false; }

        const victim = db.users[cands[Math.floor(Math.random() * cands.length)]];
        if (!victim) return false;
        if (!victim.timedEffects) victim.timedEffects = [];

        const finish = function (name, desc) {
            const hrs = (name === '오렌지맛 물약' || name === '바나나맛 물약') ? 3 : 24;
            victim.timedEffects.push({ name: name, desc: desc, expireAt: Date.now() + hrs * 3600000 });
            victim.hasItemUsedOnMe = true;
            addHistoryLog(victim, `[석류맛 물약] 누군가 던진 물약이 당신에게 닿았습니다. (${name})`);
            if (victim.code === currentUser.code) saveSelfFull();
            else updateUserFields(victim.code, {
                timedEffects: victim.timedEffects, history: victim.history, hasItemUsedOnMe: true
            });
            updateUI();
            showCustomAlert(`${victim.name} 님에게 적용되었습니다.\n\n${name}\n${desc}`);
        };

        if (picked === 'cherry_potion') {
            openTextInput('석류맛 물약',
                `개발될 부위를 적어 주세요.<br><span style="color:#888; font-size:10px;">누구에게 갈지는 알 수 없습니다.</span>`,
                '예: 목덜미',
                part => finish('체리맛 물약', `${part} 부위가 예민하게 개발됨`));
            return true;
        }
        if (picked === 'persimmon_potion') {
            openTextInput('석류맛 물약',
                `입힐 코스튬을 적어 주세요.<br><span style="color:#888; font-size:10px;">누구에게 갈지는 알 수 없습니다.</span>`,
                '예: 토끼 옷',
                cos => finish('곶감맛 물약', `${cos} 착용 상태`));
            return true;
        }

        const NAMES = {
            grape_potion:     ['포도맛 물약', '신체 파동 변조 (성별 반전 상태)'],
            milk_potion:      ['우유맛 물약', '신체 변이 (컨트/딕걸)'],
            apple_potion:     ['사과맛 물약', `${ANIMAL_LIST[Math.floor(Math.random() * ANIMAL_LIST.length)]}의 귀와 꼬리 발현 및 습성 발현`],
            orange_potion:    ['오렌지맛 물약', '신체 퇴행 (어린아이 상태)'],
            peach_potion:     ['복숭아맛 물약', '신체 감각 과민 (예민한 몸 상태)'],
            pineapple_potion: ['파인애플맛 물약', '신체 축소 (손바닥 크기)'],
            plum_potion:      ['자두맛 물약', `신체에서 ${CAKE_LIST[Math.floor(Math.random() * CAKE_LIST.length)]} 케이크 맛이 남`]
        };
        const pair = NAMES[picked];
        if (!pair) return false;
        finish(pair[0], pair[1]);
        return true;
    };
})();

// --- 4. 상담사 강제 지급도 막는다 ---
(function guardAdmin() {
    if (typeof adminGiveItem !== 'function') return;
    const _f = adminGiveItem;
    adminGiveItem = function () {
        const items = Array.from(document.querySelectorAll('.adm-item-cb:checked')).map(c => c.value);
        const risky = items.filter(n => PREG_GUARD_ITEMS.indexOf(n) !== -1);
        if (risky.length === 0) return _f.apply(this, arguments);

        // 지급 자체는 막지 않는다. 쓰는 쪽에서 걸린다는 것만 알린다.
        console.log('[임신 보호] 지급 물품 중 보호 대상:', risky.join(', '));
        return _f.apply(this, arguments);
    };
})();

// --- 확인용 ---
function pregGuardState() {
    const pregs = Object.keys(db.users || {}).filter(c => isPregnant(db.users[c]));
    console.log('%c===== 임신 중 보호 =====', 'color:#ff8fb1; font-size:13px');
    console.log('보호 물품:', PREG_GUARD_ITEMS.join(', '));
    if (!pregs.length) { console.log('지금 임신 중인 사원이 없습니다.'); return; }
    console.table(pregs.map(function (c) {
        const u = db.users[c];
        return {
            사번: c, 이름: u.name,
            아버지: (pregOf(u).sires || []).length,
            보호됨: PREG_GUARD_ITEMS.every(n => pregGuarded(u, n)) ? 'O' : 'X'
        };
    }));
}

console.log('[임신] 보호 조치 적용 — pregGuardState() 로 확인');
;

// ---------- preg-leave.js ----------
// ==========================================
// ★ 육아휴직 — 아홉 회분 물건은 허가를 받아야 쓴다
// index.html 에서 preg-guard.js 다음에 불러온다
// ==========================================
//
// '밤새 켜 둔 등'(9회분)은 한 번에 하루치를 다 써 버린다.
// 상담사에게 육아휴직을 신청해 허가를 받아야 쓸 수 있게 한다.

// 허가가 필요한 물건 — 6회분 이상
const LEAVE_MIN_CARE = 5;

function needsLeave(itemName) {
    const it = (typeof PREG_ITEMS !== 'undefined') ? PREG_ITEMS[itemName] : null;
    return !!(it && it.care >= LEAVE_MIN_CARE);
}

function leaveRef(code) {
    return database.ref('pregLeave/' + (code || currentUser.code));
}

// 내 허가 상태 (메모리 사본)
let myLeave = null;

(function watchLeave() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        leaveRef(currentUser.code).on('value', function (s) {
            const prev = myLeave && myLeave.state;
            myLeave = s.val();
            if (!myLeave) return;
            if (prev === 'PENDING' && myLeave.state === 'APPROVED') {
                showCustomAlert('육아휴직이 승인되었습니다.\n\n아홉 회분 물건을 ' + (myLeave.uses || 1) + '번 쓸 수 있습니다.');
            }
            if (prev === 'PENDING' && myLeave.state === 'REJECTED') {
                showCustomAlert('육아휴직이 반려되었습니다.'
                    + (myLeave.memo ? '\n\n' + myLeave.memo : ''));
            }
        });
    }, 1500);
})();

function leaveUsesLeft() {
    if (!myLeave || myLeave.state !== 'APPROVED') return 0;
    return Math.max(0, myLeave.uses || 0);
}

// ==========================================
// 신청
// ==========================================
function requestPregLeave(targetCode) {
    if (!database || !currentUser) return;
    const t = db.users[targetCode];
    if (!t) { showCustomAlert('대상을 찾을 수 없습니다.'); return; }
    if (!isMySire(t)) { showCustomAlert('당신의 아이가 아닙니다.'); return; }

    if (myLeave && myLeave.state === 'PENDING') {
        showCustomAlert('이미 낸 신청서가 처리되지 않았습니다.');
        return;
    }
    if (leaveUsesLeft() > 0) {
        showCustomAlert(`아직 쓸 수 있는 허가가 ${leaveUsesLeft()}번 남아 있습니다.`);
        return;
    }

    openTextInput('육아휴직 신청',
        `<b style="color:#ff8fb1;">${t.name}</b> 사원을 돌보기 위한 신청서입니다.<br>
         <span style="color:#888; font-size:10px;">사유를 적으면 상담사가 보고 판단합니다.</span>`,
        '예: 밤에 자리를 비울 수 없습니다',
        function (reason) {
            leaveRef(currentUser.code).set({
                code: currentUser.code,
                name: currentUser.name,
                no: currentUser.no,
                target: targetCode,
                targetName: t.name,
                reason: reason,
                state: 'PENDING',
                at: Date.now(),
                uses: 0
            }).then(function () {
                addHistoryLog(currentUser, `[육아휴직] ${t.name} 사원을 위한 신청서를 냈습니다.`);
                saveFields({ history: 1 });
                showCustomAlert('신청서를 냈습니다.\n\n상담사의 허가를 기다려 주세요.');
                closeGearModal();
            }).catch(function (e) {
                console.error('신청 실패:', e);
                showCustomAlert('신청 중 오류가 발생했습니다.');
            });
        });
}

// ==========================================
// 돌봄 패널에 신청 칸을 붙인다
// ==========================================
(function hookCarePanel() {
    if (typeof openCarePanel !== 'function') return;
    const _o = openCarePanel;
    openCarePanel = function (code) {
        const r = _o.apply(this, arguments);
        setTimeout(function () { addLeaveBox(code); }, 80);
        return r;
    };
})();

function addLeaveBox(code) {
    const body = document.getElementById('gear-modal-body');
    if (!body || document.getElementById('preg-leave-box')) return;

    const inv = currentUser.inventory || [];
    const big = Object.keys(PREG_ITEMS).filter(n => needsLeave(n) && inv.includes(n));
    const left = leaveUsesLeft();
    const pending = myLeave && myLeave.state === 'PENDING';

    let html = '';
    if (left > 0) {
        html = `
            <div style="font-size:12px; color:#81c784; font-weight:bold; margin-bottom:7px;">육아휴직 승인됨</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px; line-height:1.7;">
                남은 사용 <b style="color:#4CAF50;">${left}회</b><br>
                ${big.length ? '아래 물건을 쓸 수 있습니다.' : '여러 회분 물건이 없습니다.'}
            </div>
            ${big.map(n => `
                <button class="game-btn" style="width:100%; margin:0 0 5px 0; padding:9px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="doCare('${code}', 0, '${n}')">
                    ${n} 쓴다 <span style="font-size:9px; color:#c8e6c9;">(${PREG_ITEMS[n].care}회분)</span>
                </button>`).join('')}`;
    } else if (pending) {
        html = `
            <div style="font-size:12px; color:#ffb74d; font-weight:bold; margin-bottom:7px;">육아휴직 심사 중</div>
            <div style="font-size:10px; color:#888; line-height:1.7;">
                ${myLeave.targetName} 사원 건으로 신청서를 냈습니다.<br>
                상담사가 보고 있습니다.
            </div>`;
    } else if (big.length) {
        html = `
            <div style="font-size:12px; color:#ff8fb1; font-weight:bold; margin-bottom:7px;">육아휴직 신청</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px; line-height:1.7;">
                <b style="color:#ddd;">${big.join(', ')}</b> 은(는) 하루치를 한 번에 씁니다.<br>
                상담사의 허가를 받아야 쓸 수 있습니다.
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;" onclick="requestPregLeave('${code}')">
                신청서를 낸다
            </button>`;
    } else {
        return;   // 해당 물건이 없으면 칸 자체를 안 만든다
    }

    body.insertAdjacentHTML('beforeend',
        `<div id="preg-leave-box" style="border:1px solid #5a4a2a; border-radius:6px; padding:11px; margin-top:9px; background:rgba(212,175,55,0.04);">${html}</div>`);
}

// ==========================================
// 목록에서는 큰 물건을 뺀다
// ==========================================
(function hideBigInList() {
    const iv = setInterval(function () {
        const body = document.getElementById('gear-modal-body');
        if (!body) return;
        body.querySelectorAll('button').forEach(function (b) {
            const oc = b.getAttribute('onclick') || '';
            const m = oc.match(/doCare\('[^']*',\s*0,\s*'([^']+)'\)/);
            if (!m) return;
            if (!needsLeave(m[1])) return;
            if (b.closest('#preg-leave-box')) return;   // 허가 칸 안의 버튼은 그대로
            const row = b.parentElement;
            if (row) row.style.display = 'none';
        });
    }, 600);
    window._leaveHideTimer = iv;
})();

// ==========================================
// 실제 사용 시 검사
// ==========================================
(function guardDoCare() {
    if (typeof doCare !== 'function') return;
    const _d = doCare;
    doCare = function (code, cost, item) {
        if (item && needsLeave(item)) {
            if (leaveUsesLeft() <= 0) {
                showCustomAlert(`'${item}'은(는) 육아휴직 허가를 받아야 쓸 수 있습니다.\n\n돌봄 창에서 신청서를 내 주세요.`);
                return;
            }
            // 허가 한 번 소모
            const rest = leaveUsesLeft() - 1;
            leaveRef(currentUser.code).update({
                uses: rest,
                state: rest > 0 ? 'APPROVED' : 'USED',
                usedAt: Date.now()
            });
        }
        return _d.apply(this, arguments);
    };
})();

// ==========================================
// 상담사 화면
// ==========================================
function renderPregLeaveList() {
    const box = document.getElementById('admin-leave-list');
    if (!box || !database) return;

    database.ref('pregLeave').once('value').then(function (snap) {
        const all = snap.val() || {};
        const rows = Object.keys(all).map(c => all[c]).filter(v => v && v.state === 'PENDING');

        if (rows.length === 0) {
            box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:16px 0;">처리할 신청서가 없습니다.</div>`;
            return;
        }

        box.innerHTML = rows.map(function (v) {
            const ago = Math.floor((Date.now() - (v.at || 0)) / 60000);
            return `
                <div style="background:rgba(0,0,0,0.35); border:1px solid #5a4a2a; border-radius:6px; padding:11px; margin-bottom:9px;">
                    <div style="font-size:12px; color:#fff; font-weight:bold;">
                        ${v.name} <span style="font-size:10px; color:#888; font-weight:normal;">사번 ${v.no}</span>
                    </div>
                    <div style="font-size:10px; color:#ff8fb1; margin-top:3px;">
                        대상 · ${v.targetName}
                    </div>
                    <div style="font-size:11px; color:#ddd; margin-top:7px; padding:8px 10px; background:rgba(0,0,0,0.3); border-radius:4px; line-height:1.6;">
                        ${v.reason || '(사유 없음)'}
                    </div>
                    <div style="font-size:9px; color:#666; margin-top:5px;">${ago}분 전</div>
                    <div style="display:flex; gap:5px; margin-top:9px;">
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 1)">승인 (1회)</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#0288d1,#01579b) !important; border-color:#01579b !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 3)">승인 (3회)</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 0)">반려</button>
                    </div>
                </div>`;
        }).join('');
    });
}

function pregLeaveDecide(code, uses) {
    if (!database) return;
    const u = db.users[code];

    if (uses > 0) {
        leaveRef(code).update({
            state: 'APPROVED', uses: uses, by: currentUser.name, decidedAt: Date.now()
        }).then(function () {
            if (u) {
                addHistoryLog(u, `[육아휴직] 신청이 승인되었습니다. (${uses}회)`);
                updateUserFields(code, { history: u.history });
            }
            showCustomAlert(`${u ? u.name : code} 사원의 육아휴직을 승인했습니다. (${uses}회)`);
            renderPregLeaveList();
        });
        return;
    }

    openTextInput('반려 사유',
        `적지 않아도 됩니다.`,
        '예: 인력이 모자랍니다',
        function (memo) {
            leaveRef(code).update({
                state: 'REJECTED', uses: 0, memo: memo, by: currentUser.name, decidedAt: Date.now()
            }).then(function () {
                if (u) {
                    addHistoryLog(u, `[육아휴직] 신청이 반려되었습니다.`);
                    updateUserFields(code, { history: u.history });
                }
                showCustomAlert('반려했습니다.');
                renderPregLeaveList();
            });
        });
}

// 통제 콘솔에 칸을 끼워 넣는다
(function injectAdminPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-leave-box')) return true;

        const anchor = scr.querySelector('.action-buttons');
        const html = `
            <div class="admin-panel-box" id="admin-leave-box" style="border-color:#c2185b; background-color:#1f1015;">
                <h4 style="color:#ff8fb1;">🍼 육아휴직 심사</h4>
                <div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.5;">
                    여러 회분 물건('밤새 켜 둔 등')을 쓰려면 허가가 필요합니다.<br>
                    승인 횟수만큼 쓸 수 있고, 다 쓰면 다시 신청해야 합니다.
                </div>
                <button class="game-btn" style="width:100%; margin:0 0 9px 0; padding:9px;" onclick="renderPregLeaveList()">새로고침</button>
                <div id="admin-leave-list"></div>
            </div>`;

        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
        return true;
    }

    if (typeof openAdminScreen === 'function') {
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); renderPregLeaveList(); }, 120);
            return r;
        };
    }

    // 신청이 들어오면 콘솔 버튼에 점을 찍는다
    if (database) {
        const iv = setInterval(function () {
            if (!currentUser) return;
            if (currentUser.code !== 'kario0987') { clearInterval(iv); return; }
            clearInterval(iv);
            database.ref('pregLeave').on('value', function (s) {
                const all = s.val() || {};
                const n = Object.keys(all).filter(c => all[c] && all[c].state === 'PENDING').length;
                const btn = document.getElementById('btn-admin-console');
                if (!btn) return;
                if (n > 0) btn.classList.add('notify-dot');
                const box = document.getElementById('admin-leave-list');
                if (box) renderPregLeaveList();
            });
        }, 1500);
    }
})();

// 확인용
function leaveState() {
    console.log('내 허가:', myLeave ? myLeave.state : '없음',
                '/ 남은 사용:', leaveUsesLeft());
    console.log('허가 필요 물건:',
        Object.keys(PREG_ITEMS || {}).filter(needsLeave).join(', ') || '없음');
}

console.log('[임신] 육아휴직 제도 적용 — leaveState() 로 확인');
;

// ---------- preg-roster.js ----------
// ==========================================
// ★ 사택 — 내가 임신시킨 사원 명단
// index.html 에서 preg-leave.js 다음에 불러온다
// ==========================================
//
// 한 명이 다섯 명까지 임신시킬 수 있다.
// 사택 돌봄 용품 밑에 명단을 세워 바로 돌볼 수 있게 한다.

function myPregList() {
    const out = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !isPregnant(u)) return;
        if (!isMySire(u)) return;
        out.push({ code: c, u: u, p: pregOf(u) });
    });
    // 출산이 가까운 순
    out.sort(function (a, b) { return (a.p.due || 0) - (b.p.due || 0); });
    return out;
}

function renderPregRoster() {
    const box = document.getElementById('house-main-body');
    if (!box || !currentUser) return;
    if (box.innerHTML.length < 50) return;

    const old = document.getElementById('preg-roster');
    const list = myPregList();

    // 아무도 없으면 칸을 만들지 않는다
    if (list.length === 0) { if (old) old.remove(); return; }

    const gap = (typeof CARE_GAP !== 'undefined') ? CARE_GAP : 3600000;
    const nh = (typeof NEGLECT_HOURS !== 'undefined') ? NEGLECT_HOURS : 8;

    const rows = list.map(function (x) {
        const p = x.p;
        const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
        const last = (p.careAt || {})[currentUser.code] || 0;
        const dayLeft = (typeof careLeftToday === 'function') ? careLeftToday(p) : 8;
        const ok = Date.now() - last >= gap && dayLeft > 0;
        const nx = Math.max(0, Math.ceil((last + gap - Date.now()) / 60000));

        // 방치까지 남은 시간 (밤 시간 제외)
        let warn = '';
        if (last && typeof awakeMs === 'function') {
            const used = awakeMs(last, Date.now()) / 3600000;
            const rest = nh - used;
            if (rest <= 0) warn = `<span style="color:#f44336; font-weight:bold;">방치 넘김</span>`;
            else if (rest <= 2) warn = `<span style="color:#ff9800; font-weight:bold;">방치까지 ${rest.toFixed(1)}시간</span>`;
        }

        const mine = (p.careCount || {})[currentUser.code] || 0;
        const total = Object.values(p.careCount || {}).reduce((a, b) => a + b, 0);
        const goal = (typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8) * 2;

        const label = ok
            ? `돌보기 <span style="font-size:9px; color:#ffd76a;">(오늘 ${dayLeft})</span>`
            : (dayLeft <= 0 ? '오늘 끝' : `${nx}분 뒤`);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:9px;
                        background:rgba(0,0,0,0.25); border-radius:5px; padding:9px 11px; margin-bottom:6px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:12px; color:#fff; font-weight:bold;">
                        ${x.u.name} <span style="font-size:10px; color:#888; font-weight:normal;">사원</span>
                    </div>
                    <div style="font-size:9px; color:#999; margin-top:3px; line-height:1.6;">
                        출산까지 ${left}시간 · 아버지 ${(p.sires || []).length}명<br>
                        내 돌봄 ${mine}회 · 전체 ${total}/${goal}회
                        ${warn ? '<br>' + warn : ''}
                    </div>
                </div>
                <button class="game-btn" style="margin:0; padding:8px 12px; font-size:10px; flex-shrink:0; min-width:74px;
                        ${ok ? 'background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;' : 'opacity:0.45;'}"
                        onclick="openCarePanel('${x.code}')" ${ok ? '' : 'disabled'}>
                    ${label}
                </button>
            </div>`;
    }).join('');

    const html = `
        <div id="preg-roster" style="border:1px solid #c2185b; border-radius:6px; padding:12px; margin-top:13px; background:rgba(194,24,91,0.05);">
            <div style="font-size:11px; color:#ff8fb1; font-weight:bold; margin-bottom:8px;">
                🤱 내 아이를 가진 사원 <span style="color:#888; font-weight:normal;">(${list.length}명)</span>
            </div>
            <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.6;">
                여기서 바로 돌볼 수 있습니다. 최소 ${gap / 3600000}시간 간격, 하루 ${typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8}회까지입니다.
            </div>
            ${rows}
        </div>`;

    if (old) old.outerHTML = html;
    else {
        // 돌봄 용품 칸 바로 아래에 놓는다
        const store = document.getElementById('preg-store');
        if (store) store.insertAdjacentHTML('afterend', html);
        else box.insertAdjacentHTML('beforeend', html);
    }
}

// 사택 화면이 그려질 때마다
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._rosterHooked) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            setTimeout(renderPregRoster, 140);
            return r;
        };
        renderHouse._rosterHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 돌본 뒤 바로 갱신
(function hookAfterCare() {
    const iv = setInterval(function () {
        if (typeof doCare !== 'function') return;
        if (doCare._rosterHooked) { clearInterval(iv); return; }
        const _d = doCare;
        doCare = function () {
            const r = _d.apply(this, arguments);
            setTimeout(renderPregRoster, 300);
            return r;
        };
        doCare._rosterHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 남은 시간 표시가 흐르도록
setInterval(function () {
    const panel = document.getElementById('house-main');
    if (!panel || !panel.classList.contains('active')) return;
    if (!document.getElementById('preg-roster')) return;
    renderPregRoster();
}, 30000);

setTimeout(renderPregRoster, 2000);

console.log('[사택] 돌봄 명단 적용');
;

// ---------- plea.js ----------
// ==========================================
// ★ 탄원서 — 격리 중인 사원이 상담사에게 보낸다
// index.html 에서 preg-roster.js 다음에 불러온다
// ==========================================
//
// 여우 상담실 · 선녀탕에 들어간 사원이 탄원서를 쓰면
// 상담사가 보고 시간을 줄여 주거나 내보낼 수 있다.

const PLEA_MAX = 300;        // 글자 수
const PLEA_COOL = 30 * 60000; // 같은 사람이 다시 낼 때까지

function pleaRef(code) {
    return database.ref('pleas/' + (code || currentUser.code));
}

let myPlea = null;

(function watchPlea() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        pleaRef(currentUser.code).on('value', function (s) {
            const prev = myPlea && myPlea.state;
            myPlea = s.val();
            if (!myPlea || prev !== 'PENDING') { paintPleaBox(); return; }

            if (myPlea.state === 'CUT') {
                showCustomAlert(`탄원이 받아들여졌습니다.\n\n격리가 ${myPlea.cut}시간 줄었습니다.`
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            } else if (myPlea.state === 'OUT') {
                showCustomAlert('탄원이 받아들여졌습니다.\n\n나가셔도 좋습니다.'
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            } else if (myPlea.state === 'NO') {
                showCustomAlert('탄원이 반려되었습니다.'
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            }
            paintPleaBox();
        });
    }, 1500);
})();

// ==========================================
// 사원 쪽 — 격리 안내 칸에 붙인다
// ==========================================
function paintPleaBox() {
    const lock = document.getElementById('quarantine-lock-box');
    if (!lock) return;

    const inside = typeof isQuarantined === 'function' && isQuarantined(currentUser);
    const old = document.getElementById('plea-box');
    if (!inside) { if (old) old.remove(); return; }

    const agent = typeof isBathUser === 'function' && isBathUser(currentUser);
    const color = agent ? '#7fd4d4' : '#d4af37';
    const where = agent ? '초개 요원' : '상담사';

    const st = myPlea && myPlea.state;
    const fresh = myPlea && (Date.now() - (myPlea.at || 0) < 24 * 3600000);

    let inner;
    if (st === 'PENDING' && fresh) {
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">탄원서 접수됨</div>
            <div style="font-size:10px; color:#888; line-height:1.7;">
                ${where}가 읽고 있습니다.<br>
                답이 오면 알려 드리겠습니다.
            </div>`;
    } else if ((st === 'NO' || st === 'CUT' || st === 'OUT') && fresh
               && Date.now() - (myPlea.decidedAt || 0) < PLEA_COOL) {
        const label = st === 'NO' ? '반려되었습니다' : st === 'CUT' ? `${myPlea.cut}시간 줄었습니다` : '풀려났습니다';
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">${label}</div>
            ${myPlea.memo ? `<div style="font-size:11px; color:#ddd; line-height:1.7; padding:8px 10px; background:rgba(0,0,0,0.3); border-radius:4px;">"${myPlea.memo}"</div>` : ''}
            <div style="font-size:10px; color:#666; margin-top:7px;">30분 뒤에 다시 낼 수 있습니다.</div>`;
    } else {
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">탄원서</div>
            <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.7;">
                ${where}에게 사정을 적어 보낼 수 있습니다.<br>
                읽고 시간을 줄여 주거나 내보내 줄 수 있습니다.
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;
                    background:linear-gradient(145deg,${agent ? '#2a4a5a,#152830' : '#5a4a2a,#3a2f18'}) !important;
                    border-color:${color} !important; color:${color} !important;"
                    onclick="writePlea()">탄원서를 쓴다</button>`;
    }

    const html = `<div id="plea-box" style="border-top:1px dashed ${color}55; margin-top:16px; padding-top:14px; text-align:left;">${inner}</div>`;

    if (old) old.outerHTML = html;
    else lock.insertAdjacentHTML('beforeend', html);
}

function writePlea() {
    if (!database || !currentUser) return;
    if (!isQuarantined(currentUser)) { showCustomAlert('지금은 낼 수 없습니다.'); return; }

    if (myPlea && myPlea.state === 'PENDING' && Date.now() - (myPlea.at || 0) < 24 * 3600000) {
        showCustomAlert('이미 낸 탄원서가 처리되지 않았습니다.');
        return;
    }
    if (myPlea && myPlea.decidedAt && Date.now() - myPlea.decidedAt < PLEA_COOL) {
        const m = Math.ceil((PLEA_COOL - (Date.now() - myPlea.decidedAt)) / 60000);
        showCustomAlert(`아직 ${m}분 남았습니다.`);
        return;
    }

    const agent = isBathUser(currentUser);
    openTextInput('탄원서',
        `${agent ? '초개 요원' : '상담사'}에게 보낼 글입니다.<br>
         <span style="color:#888; font-size:10px;">사정을 적으면 읽고 판단합니다. (최대 ${PLEA_MAX}자)</span>`,
        '예: 맡은 일이 남아 있습니다',
        function (text) {
                        if (fld) fld.setAttribute('maxlength', 30);
            const remain = Math.max(0, currentUser.quarantineUntil - Date.now());
            pleaRef(currentUser.code).set({
                code: currentUser.code,
                name: currentUser.name,
                no: currentUser.no,
                text: String(text).slice(0, PLEA_MAX),
                where: agent ? 'bath' : 'fox',
                pollution: currentUser.pollution || 0,
                remainH: Math.round(remain / 3600000 * 10) / 10,
                state: 'PENDING',
                at: Date.now()
            }).then(function () {
                addHistoryLog(currentUser, `[탄원서] ${agent ? '선녀탕' : '여우 상담실'}에서 탄원서를 냈습니다.`);
                saveFields({ history: 1 });
                showCustomAlert('탄원서를 냈습니다.\n\n답을 기다려 주세요.');
                paintPleaBox();
            }).catch(function (e) {
                console.error('탄원 실패:', e);
                showCustomAlert('접수 중 오류가 발생했습니다.');
            });
        });

            // 공용 입력칸이 30자로 묶여 있다 — 탄원서 동안만 늘린다
    const fld = document.getElementById('text-input-field');
    if (fld) fld.setAttribute('maxlength', PLEA_MAX);

}

// 격리 안내가 다시 그려질 때마다
(function hookUI() {
    const iv = setInterval(function () {
        if (typeof updateUI !== 'function') return;
        if (updateUI._pleaHooked) { clearInterval(iv); return; }
        const _u = updateUI;
        updateUI = function () {
            const r = _u.apply(this, arguments);
            paintPleaBox();
            return r;
        };
        updateUI._pleaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 상담사 쪽
// ==========================================
function renderPleaList() {
    const box = document.getElementById('admin-plea-list');
    if (!box || !database) return;

    database.ref('pleas').once('value').then(function (snap) {
        const all = snap.val() || {};
        const rows = Object.keys(all).map(c => all[c])
            .filter(v => v && v.state === 'PENDING')
            .sort((a, b) => (a.at || 0) - (b.at || 0));

        if (rows.length === 0) {
            box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:16px 0;">접수된 탄원서가 없습니다.</div>`;
            return;
        }

        box.innerHTML = rows.map(function (v) {
            const u = db.users[v.code];
            const now = u && u.quarantineUntil ? Math.max(0, (u.quarantineUntil - Date.now()) / 3600000) : 0;
            const ago = Math.floor((Date.now() - (v.at || 0)) / 60000);
            const agent = v.where === 'bath';

            return `
                <div style="background:rgba(0,0,0,0.35); border:1px solid ${agent ? '#2a4a5a' : '#5a4a2a'}; border-radius:6px; padding:11px; margin-bottom:9px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; color:#fff; font-weight:bold;">
                                ${v.name} <span style="font-size:10px; color:#888; font-weight:normal;">사번 ${v.no}</span>
                            </div>
                            <div style="font-size:10px; color:${agent ? '#7fd4d4' : '#d4af37'}; margin-top:3px;">
                                ${agent ? '♨ 선녀탕' : '🦊 여우 상담실'} · 오염도 ${v.pollution}% · 남은 격리 ${now.toFixed(1)}시간
                            </div>
                        </div>
                        <div style="font-size:9px; color:#666; flex-shrink:0;">${ago}분 전</div>
                    </div>
                    <div style="font-size:11px; color:#ddd; margin-top:8px; padding:9px 11px; background:rgba(0,0,0,0.35); border-radius:4px; line-height:1.7; word-break:break-all;">
                        ${v.text || '(내용 없음)'}
                    </div>
                    <div style="display:flex; gap:4px; margin-top:9px; flex-wrap:wrap;">
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',1)">-1시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',3)">-3시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',6)">-6시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="pleaDecide('${v.code}','OUT',0)">내보냄</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="pleaDecide('${v.code}','NO',0)">반려</button>
                    </div>
                </div>`;
        }).join('');
    });
}

function pleaDecide(code, kind, hours) {
    if (!database) return;
    const u = db.users[code];
    if (!u) { showCustomAlert('사원을 찾을 수 없습니다.'); return; }

    const finish = function (memo) {
        const patch = {
            state: kind, cut: hours || 0, memo: memo || '',
            by: currentUser.name, decidedAt: Date.now()
        };

        if (kind === 'CUT') {
            const nu = (u.quarantineUntil || 0) - hours * 3600000;
            if (nu <= Date.now()) { kind = 'OUT'; patch.state = 'OUT'; }
            else {
                const tmp = { history: (u.history || []).slice() };
                addHistoryLog(tmp, `[탄원] 받아들여져 격리가 ${hours}시간 줄었습니다.`);
                const f = { quarantineUntil: nu, history: tmp.history };
                if (code === currentUser.code) Object.assign(currentUser, f);
                updateUserFields(code, f);
            }
        }

        if (patch.state === 'OUT') {
            const notes = ((u.badge && u.badge.notes) || '').split(' | ')
                .filter(n => n.trim() && !/의식 불명|긴급 이송|사직 반려/.test(n));
            const badge = Object.assign({}, u.badge || {},
                { notes: notes.length ? notes.join(' | ') : '특이사항 없음' });
            const tmp = { history: (u.history || []).slice() };
            addHistoryLog(tmp, `[탄원] 받아들여져 격리가 풀렸습니다.`);
            const f = {
                quarantineUntil: 0,
                quarantineExitPollution: 0,
                quarantineHospital: false,
                pollution: u.quarantineExitPollution || 0,
                lastPollutionTime: Date.now(),
                foxRoomAnswered: false,
                badge: badge,
                history: tmp.history
            };
            if (code === currentUser.code) Object.assign(currentUser, f);
            updateUserFields(code, f);
        }

        if (kind === 'NO') {
            const tmp = { history: (u.history || []).slice() };
            addHistoryLog(tmp, `[탄원] 반려되었습니다.`);
            updateUserFields(code, { history: tmp.history });
        }

        pleaRef(code).update(patch).then(function () {
            const msg = patch.state === 'OUT' ? '내보냈습니다.'
                      : patch.state === 'CUT' ? `${hours}시간 줄였습니다.`
                      : '반려했습니다.';
            showCustomAlert(`${u.name} 사원 — ${msg}`);
            renderPleaList();
            updateUI();
        });
    };

    openTextInput('한마디',
        `사원에게 함께 전할 말입니다.<br><span style="color:#888; font-size:10px;">비워도 됩니다.</span>`,
        kind === 'NO' ? '예: 조금 더 쉬셔야 합니다' : '예: 다음부터는 조심하세요',
        finish);
}

// 통제 콘솔에 칸을 끼워 넣는다
(function injectPleaPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-plea-box')) return;
        const anchor = scr.querySelector('.action-buttons');
        const html = `
            <div class="admin-panel-box" id="admin-plea-box" style="border-color:#8a6cb3; background-color:#17121f;">
                <h4 style="color:#c9a8ff;">📜 탄원서 심사</h4>
                <div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.5;">
                    상담실·선녀탕에 있는 사원이 보낸 글입니다.<br>
                    시간을 줄여 주거나 바로 내보낼 수 있습니다.
                </div>
                <button class="game-btn" style="width:100%; margin:0 0 9px 0; padding:9px;" onclick="renderPleaList()">새로고침</button>
                <div id="admin-plea-list"></div>
            </div>`;
        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
    }

    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._pleaHooked) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); renderPleaList(); }, 140);
            return r;
        };
        openAdminScreen._pleaHooked = true;
        clearInterval(iv);
    }, 500);

    // 탄원이 들어오면 콘솔 버튼에 점
    if (database) {
        const iv2 = setInterval(function () {
            if (!currentUser) return;
            if (currentUser.code !== 'kario0987') { clearInterval(iv2); return; }
            clearInterval(iv2);
            database.ref('pleas').on('value', function (s) {
                const all = s.val() || {};
                const n = Object.keys(all).filter(c => all[c] && all[c].state === 'PENDING').length;
                const btn = document.getElementById('btn-admin-console');
                if (btn && n > 0) btn.classList.add('notify-dot');
                if (document.getElementById('admin-plea-list')) renderPleaList();
            });
        }, 1500);
    }
})();

function pleaState() {
    console.log('내 탄원:', myPlea ? myPlea.state : '없음');
    if (myPlea) console.log(JSON.stringify(myPlea, null, 1));
}

console.log('[탄원서] 적용 — pleaState() 로 확인');
;

// ---------- pollution-fix.js ----------
// ==========================================
// ★ 오염 100% — 새로고침 후 격리 누락 보정
// index.html 에서 pregnancy2.js 다음에 불러온다
// ==========================================
//
// attemptLogin() 이 로그인 시점에
//     hasShownFoxAlert = currentUser.pollution >= 100;
// 으로 잠금 플래그를 미리 켜 버려서,
// updateUI() 의 checkFoxRoomEntry() 가 영영 안 불린다.
// 그래서 100%인데도 메인 화면에 남아 소지품을 쓸 수 있다.

(function fixPollutionQuarantine() {

    // 지금 이송되어야 하는 상태인가
    function needsRoom() {
        if (!currentUser) return false;
        if ((currentUser.pollution || 0) < 100) return false;
        if (currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) return false;
        if (typeof darkRun !== 'undefined' && darkRun) return false;   // 탐사 중이면 사망 처리가 먼저
        return true;
    }

    // 이미 절차가 떠 있는가
    function alreadyOpen() {
        const ids = ['quarantine-pick-overlay', 'fox-loading-overlay',
                     'fox-room-overlay', 'fox-nameplate-overlay',
                     'fox-modal', 'bath-modal'];
        return ids.some(function (id) {
            const el = document.getElementById(id);
            return el && el.style.display && el.style.display !== 'none';
        });
    }

    function force(reason) {
        if (!needsRoom()) return;
        if (alreadyOpen()) return;
        if (typeof checkFoxRoomEntry !== 'function') return;

        // 남아 있던 잠금 플래그를 푼다
        hasShownFoxAlert = false;
        currentUser.foxRoomAnswered = false;
        currentUser.quarantineHospital = false;   // 탐사 사망 잔재가 남아 있으면 절차가 막힌다

        console.log('[오염] 100% 상태인데 격리가 안 걸려 있습니다. 이송 절차를 시작합니다. (' + reason + ')');
        checkFoxRoomEntry();
    }

    // --- 로그인 직후 ---
    if (typeof attemptLogin === 'function') {
        const _login = attemptLogin;
        attemptLogin = function () {
            const r = _login.apply(this, arguments);
            setTimeout(function () { force('로그인'); }, 1500);
            return r;
        };
    }

    // --- 주기 점검 ---
    // 격리가 만료됐는데 오염도가 그대로 100인 경우도 여기서 잡는다
    setInterval(function () { force('주기 점검'); }, 20000);

    // --- 붙자마자 한 번 ---
    setTimeout(function () { force('적재'); }, 2500);

    // --- 잠금이 풀린 상태로 시설을 쓰는 것을 막는다 ---
    ['useInventoryItem', 'sellInventoryItem', 'useFacility',
     'buyRegularShopItem', 'buyAlienItem', 'sendP2PDeal', 'openDarkBriefing']
        .forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            const _f = window[n];
            window[n] = function () {
                if (needsRoom()) {
                    showCustomAlert('오염도가 한계치입니다.\n안정 조치가 필요합니다.');
                    force('차단');
                    return;
                }
                return _f.apply(this, arguments);
            };
        });

    // --- 수동 실행용 ---
    window.forceQuarantine = function () {
        if (!currentUser) { console.warn('로그인 안 됨'); return; }
        console.log('오염도:', currentUser.pollution,
                    '/ quarantineUntil:', currentUser.quarantineUntil,
                    '/ foxRoomAnswered:', currentUser.foxRoomAnswered,
                    '/ hasShownFoxAlert:', typeof hasShownFoxAlert !== 'undefined' ? hasShownFoxAlert : '?');
        hasShownFoxAlert = false;
        currentUser.foxRoomAnswered = false;
        currentUser.quarantineHospital = false;
        if (typeof checkFoxRoomEntry === 'function') checkFoxRoomEntry();
    };

    console.log('[오염] 격리 누락 보정 적용 — forceQuarantine() 으로 수동 실행');
})();
;

// ---------- wine-fix.js ----------
// ==========================================
// ★ 고급진 술 — 10시간 뒤 만료되게
// index.html 에서 pollution-fix.js 다음에 불러온다
// ==========================================
//
// 원래 코드는 특이사항에 글자만 붙이고 끝난다.
//     appendBadgeNoteToUser(targetUser, `[취함] 알코올 섭취 (10시간 지속)`);
// 만료를 재는 주체가 없어서 영영 안 사라진다.
// timedEffects 로 바꿔 달면 checkPassivePollution 이 알아서 지운다.

const WINE_HOURS = 10;

(function fixWine() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (itemName !== '고급진 술') return _f.apply(this, arguments);
        if (!targetUser) return false;

        // 예전 방식으로 붙어 있던 글자는 걷어 낸다
        stripWineNote(targetUser);

        addTimedEffect(targetUser, '고급진 술', '취함 (알코올 섭취)', WINE_HOURS);
        addHistoryLog(targetUser, `[음주] 고급진 술을 마셨습니다. (${WINE_HOURS}시간)`);

        if (!isOthers) showCustomAlert('술을 마셨습니다... 세상이 빙글빙글 돕니다.');
        return true;
    };
})();

// --- 특이사항에서 취함 줄만 걷어 낸다 ---
function stripWineNote(user) {
    if (!user || !user.badge || !user.badge.notes) return false;
    const arr = user.badge.notes.split(' | ').filter(function (n) {
        const t = n.trim();
        if (!t) return false;
        return !(t.includes('취함') || t.includes('알코올'));
    });
    const next = arr.length ? arr.join(' | ') : '특이사항 없음';
    if (next === user.badge.notes) return false;
    user.badge.notes = next;
    return true;
}

// --- 이미 박혀 있는 사람 정리 ---
(function cleanStuckWine() {
    setTimeout(function () {
        if (!currentUser) return;
        if (!stripWineNote(currentUser)) return;
        addHistoryLog(currentUser, `[효과 종료] 취기가 가셨습니다.`);
        saveFields({ badge: 1, history: 1 });
        updateUI();
        console.log('[술] 만료 안 되던 취함 표시를 지웠습니다.');
    }, 3000);
})();

// --- 상담사용: 전원 정리 ---
function cleanWineNotes() {
    if (currentUser.code !== 'kario0987') { console.warn('상담사 전용입니다.'); return; }
    const done = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!stripWineNote(u)) return;
        addHistoryLog(u, `[효과 종료] 취기가 가셨습니다.`);
        updateUserFields(c, { badge: u.badge, history: u.history });
        done.push(u.name);
    });
    if (!done.length) { console.log('[술] 정리할 사원이 없습니다.'); return; }
    console.log('[술] ' + done.length + '명 정리 완료 —', done.join(', '));
    updateUI();
}

console.log('[술] 고급진 술 만료 보정 적용 — cleanWineNotes() 로 전원 정리');
;

// ---------- empcard-scroll.js ----------
// ==========================================
// ★ 사원 기록 카드 — 길어지면 스크롤
// index.html 에서 wine-fix.js 다음에 불러온다
// ==========================================
//
// 특이사항이 길면 카드가 화면을 넘어가서
// 아래에 붙는 임신·돌봄 버튼이 안 보인다.
// 카드 속을 스크롤되게 만든다.

(function fixEmpDetailScroll() {
    const CSS = `
#emp-detail-modal .modal-content {
    max-height: 85vh !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 20px 20px 16px 20px !important;
}
#emp-detail-modal .modal-content > h3 { flex-shrink: 0; }
#emp-detail-modal .modal-btn-group { flex-shrink: 0; margin-top: 14px !important; }

#emp-detail-card-container {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-right: 6px;
    margin-right: -4px;
}

/* 스크롤이 더 있다는 표시 */
#emp-detail-card-container::-webkit-scrollbar { width: 5px; }
#emp-detail-card-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
#emp-detail-card-container::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }

/* 특이사항 칸이 혼자 너무 길어지지 않게 */
#emp-detail-card-container .badge-table td { max-height: 160px; overflow-y: auto; }
`;
    const st = document.createElement('style');
    st.id = 'emp-detail-scroll-fix';
    st.textContent = CSS;
    document.head.appendChild(st);

    // 열릴 때 맨 위로 돌려놓는다
    if (typeof openEmpDetailModal === 'function') {
        const _o = openEmpDetailModal;
        openEmpDetailModal = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () {
                const box = document.getElementById('emp-detail-card-container');
                if (box) box.scrollTop = 0;
            }, 80);
            setTimeout(addHint, 220);
            return r;
        };
    }

    // 아래에 더 있다는 표시
    // addPregBtn 은 감싸지 않는다. 감싸면 원본을 못 읽어 점검이 어긋난다.
    function addHint() {
        const box = document.getElementById('emp-detail-card-container');
        const btn = document.getElementById('preg-btn-box');
        if (!box || !btn) return;
        if (box.scrollHeight <= box.clientHeight) return;   // 스크롤 없으면 그만
        if (document.getElementById('preg-scroll-hint')) return;
        btn.insertAdjacentHTML('beforebegin',
            `<div id="preg-scroll-hint" style="text-align:center; font-size:10px; color:#888; margin-top:10px;">▾ 아래에 더 있습니다</div>`);
    }

    console.log('[사원 카드] 스크롤 보정 적용');
})();
;

// ---------- solo.js ----------
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
;

// ---------- solo-s010.js ----------
// ==========================================
// ★ Qtrew-S-010 「검역 실패」 — 1인 체험 확장
// index.html 에서 solo.js 다음에 불러온다
// ==========================================
//
// 45장면 · 감염도 · 검역 기록 5장 수집
// solo.js 의 기본 S-010 시나리오를 덮어쓴다.

// --- 수집품 ---
const S010_PV_DOCS = [
    '근무 인원표', '검사 기록지', '마지막 무전 기록', '격리 지시서', '폐기 명단'
];

// --- 탐색 판정 ---
function pvFind(i) {
    if (!pv || pv.over) return;
    const st = PREVIEW[pv.zone].steps[pv.idx];
    const spot = st.spots[i];
    const hit = (i === (st.at != null ? st.at : 0));

    if (!pv.found) pv.found = [];

    if (hit) {
        pv.ok++;
        pv.found.push(st.item);
        darkBodyEl().innerHTML = darkBox(st.title,
            `${spot}을(를) 뒤진다.<br><br>${st.good}<br><br>
             <span style="color:#4CAF50; font-weight:bold;">✦ ${st.item} 확보 (${pv.found.length} / 5)</span>`,
            pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
    } else {
        pv.no++;
        pvMeter(st.mBad || 0);
        if (pvMeterBroke()) {
            const fin = PREVIEW[pv.zone].steps.find(s => s.type === 'final');
            if (fin && fin.meterLose) { pvEnd(false, fin.meterLose); return; }
        }
        darkBodyEl().innerHTML = darkBox(st.title,
            `${spot}을(를) 뒤진다.<br><br>${st.bad}`,
            pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
    }
}

// --- 엔진 확장: 탐색 화면 ---
(function extendPv() {
    const _pvRender = pvRender;
    pvRender = function () {
        if (!pv) return;
        const st = PREVIEW[pv.zone].steps[pv.idx];
        if (!st || st.type !== 'find') return _pvRender.apply(this, arguments);

        // 뒤질 자리를 매번 섞는다
        if (st.at == null || st._forStep !== pv.idx) {
            st.at = Math.floor(Math.random() * st.spots.length);
            st._forStep = pv.idx;
        }
        // 행운이 높으면 한 자리가 지워진다
        const luck = gearValue(currentUser, 'luck');
        let hint = '';
        if (luck > 0 && Math.random() < luck) {
            const wrong = st.spots.map((s, i) => i).filter(i => i !== st.at);
            const drop = wrong[Math.floor(Math.random() * wrong.length)];
            hint = drop;
        }

        darkBodyEl().innerHTML = darkBox(st.title, st.text,
            pvBar() +
            st.spots.map((s, i) =>
                (i === hint)
                    ? `<button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal; opacity:0.35;" disabled>${s} <span style="font-size:10px; color:#c9a8ff;">✺ 비어 있다</span></button>`
                    : darkChoiceBtn(s, `pvFind(${i})`)
            ).join(''));
    };

    const _pvBar = pvBar;
    pvBar = function () {
        const base = _pvBar.apply(this, arguments);
        if (!pv || pv.zone !== 'Qtrew-S-010') return base;
        const n = (pv.found || []).length;
        return base + `<div style="font-size:9px; color:#666; margin:-6px 0 10px 0;">검역 기록 ${n} / 5${n ? ' — ' + pv.found.join(', ') : ''}</div>`;
    };
})();

// ==========================================
PREVIEW['Qtrew-S-010'] = {
    meter: { name:'감염도', color:'#ff6b6b', start:0, limit:60, up:true },
    steps: [

// ───────── 1구간 · 진입 ─────────
{ type:'narr', img:'intro', text:`사이렌이 멎은 직후다.<br><br>
    복도에 비닐이 겹겹이 쳐져 있다. 검역 구역을 나누던 것이다.<br>
    전부 찢겨 있다. 안쪽에서 찢은 것이다.<br><br>
    벽에 붙은 안내가 아직 읽힌다.<br>
    <span style="color:#7fd4d4;">"물린 인원은 즉시 신고하십시오. 숨기면 전원이 위험합니다."</span><br>
    그 아래에 손으로 쓴 글씨가 있다.<br>
    <span style="color:#ff6b6b;">"신고해도 똑같았다"</span>` },

{ type:'narr', text:`혼자다.<br><br>
    같이 들어온 사람이 없다. 처음부터 없었다.<br>
    그게 낫다고 생각했는데, 막상 들어오니 세어 볼 인원이 없다는 게 이상하다.<br><br>
    세지 않아도 되는 건 편하다.<br>
    다만 누가 줄었는지도 알 수 없다.` },

{ type:'pick', title:'비닐 통로', kind:'hide',
  text:`겹겹이 쳐진 비닐을 지나야 한다.<br><br>
    젖히면 소리가 난다. 얇은 비닐이 서로 스치는 소리.<br>
    안쪽에서 무언가 그 소리를 기다리고 있다.`,
  opts:[
    { l:'① 한 겹씩 천천히 젖힌다.', dc:11,
      good:`손목만 써서 젖힌다.<br><br>세 겹을 지나는 데 한참 걸렸다.<br>그동안 아무것도 오지 않았다.`,
      bad:`세 번째 겹에서 손이 미끄러졌다.<br><br>비닐이 크게 흔들린다.<br>안쪽에서 뭔가 일어서는 소리가 난다. 느리게, 관절을 하나씩 펴면서.`, mBad:6 },
    { l:'② 아래쪽을 잘라 기어간다.', dc:9,
      good:`바닥이 끈적하다. 무릎에 묻는 걸 신경 쓰지 않기로 한다.<br><br>소리는 나지 않았다.`,
      bad:`기어가다 손을 짚었다.<br><br>짚은 게 바닥이 아니었다. 미지근했다.<br>손을 떼는 데 용기가 들었다.`, mBad:8 },
    { l:'③ 단숨에 밀고 지나간다.', dc:15,
      good:`소리가 크게 났다. 그런데 아무 반응이 없다.<br><br>운이 좋았거나, 저쪽이 아직 배가 안 고팠거나.`,
      bad:`비닐이 통째로 뜯겨 나간다.<br><br>안쪽이 전부 보인다. 안쪽에서도 이쪽이 전부 보인다.`, mBad:12 }
  ] },

{ type:'narr', text:`발밑에서 소리가 났다.<br><br>
    내려다보니 명찰이다. 밟은 자리에 금이 갔다.<br>
    이름 칸이 지워져 있다. 사번만 남았다. 네 자리.<br><br>
    주워서 주머니에 넣는다. 왜 그랬는지는 모르겠다.<br>
    나중에 대조할 일이 있을 것 같아서였다.` },

{ type:'find', title:'복도 — 탐색', item:'근무 인원표', mBad:5,
  text:`벽에 종이가 몇 장 붙어 있다.<br><br>
    대부분 젖어 떨어졌고, 남은 것도 글씨가 번졌다.<br>
    쓸 만한 게 하나는 있을 것이다.<br><br>
    <span style="font-size:11px; color:#888;">한 곳만 뒤질 수 있습니다.</span>`,
  spots:['게시판 왼쪽 구석', '소화전 문 안쪽', '넘어진 링거대 아래'],
  good:`근무 인원표가 나왔다. 코팅이 되어 있어 멀쩡하다.<br><br>
    <span style="color:#7fd4d4;">주간 14명 · 야간 9명</span><br><br>
    그 아래 손글씨로 덧붙인 것이 있다.<br>
    <span style="color:#ff6b6b;">"현재 확인된 생존 4"</span><br>
    날짜는 적혀 있지 않다.`,
  bad:`젖은 종이뭉치뿐이다.<br><br>
    손에 붙어서 떨어지지 않는다. 털어 내는 데 시간이 걸렸다.<br>
    그동안 복도 끝에서 무언가 방향을 바꿨다.` },

{ type:'pick', title:'첫 무리', kind:'hide',
  text:`복도 중간이 막혔다.<br><br>
    넷쯤 된다. 아직 이쪽을 못 봤다.<br>
    벽을 따라가면 돌아갈 수 있는데, 그러려면 등을 보여야 한다.`,
  opts:[
    { l:'① 벽을 따라 돌아간다.', dc:12,
      good:`어깨가 벽을 긁는다. 소리가 날까 봐 옷을 말아 쥔다.<br><br>등 뒤로 지나간다. 돌아보지 않았다.`,
      bad:`벽에 붙어 돌다가 팔이 닿았다.<br><br>손톱이 팔을 긁었다. 피는 안 났는데 자국이 남았다.<br>자국을 보지 않기로 한다.`, mBad:10 },
    { l:'② 반대쪽에 소리를 낸다.', dc:10,
      good:`깨진 유리 조각을 던진다.<br><br>전부 그쪽으로 고개를 돌린다. 몸까지 돌리는 데 시간이 걸린다.<br>그 사이에 지나간다.`,
      bad:`던진 것이 엉뚱한 데 맞았다.<br><br>소리가 이쪽으로 튕겨 왔다.<br>전부 이쪽을 본다. 넷이 동시에 같은 각도로.`, mBad:14 },
    { l:'③ 틈으로 달려 지나간다.', dc:15,
      good:`손이 옷깃을 스쳤다. 잡히지는 않았다.<br><br>반 발자국 차이였다.`,
      bad:`잡혔다.<br><br>어깨, 팔, 목덜미. 이로 무는 감각은 생각보다 둔했다.<br>겨우 빠져나왔다. 팔뚝이 뜨겁다.`, mBad:20 }
  ] },

{ type:'narr', text:`처음 마주친 것은 사람 모양이었다.<br><br>
    작업복을 입었고, 사원증을 걸고 있었다.<br>
    걸음이 이상하다. 무릎이 한 박자 늦게 따라온다.<br><br>
    가까이서 보니 목이 돌아가 있다. 앞을 보려고 몸 전체를 돌린다.<br>
    그게 더 빨랐다. 생각한 것보다.` },

{ type:'check', title:'자가 검진', q:`지금 손끝에 감각이 있습니까?`,
  answers:['네','예','있다','응','yes','있음'],
  good:`적는다.<br><br>규정대로라면 한 시간마다 서로를 확인해야 한다.<br>혼자라 스스로 확인한다. 이게 무슨 의미가 있나 싶지만, 안 하는 것보다는 낫다.`,
  bad:`적으려다 멈춘다.<br><br>손끝을 본다. 움직인다. 움직이는 건 알겠는데 느껴지지는 않는다.<br>결국 아무거나 적었다.`,
  mGood:-3, mBad:12 },

{ type:'pick', title:'셔터', kind:'sense',
  text:`셔터가 허리 높이에서 멈춰 있다.<br><br>
    기어서 지나갈 수 있다. 다만 지나는 동안 무방비다.<br>
    억지로 올릴 수도 있다. 소리가 크게 날 것이다.<br><br>
    셔터 아래쪽에 긁힌 자국이 여럿이다. 손톱 자국이다.<br>
    안에서 나오려던 것인지, 밖에서 들어가려던 것인지.`,
  opts:[
    { l:'① 기어서 지나간다.', dc:12,
      good:`등이 셔터에 닿는다. 차갑다.<br><br>중간에 옷이 걸려 한 번 멈췄다. 그때가 제일 길었다.`,
      bad:`셔터가 내려왔다.<br><br>어깨를 눌렀다. 빠져나오는 데 시간이 걸렸다.<br>그 사이 무언가 발목을 잡았다. 차서 떼어 냈다.`, mBad:9 },
    { l:'② 소화기를 괴고 통과한다.', dc:10,
      good:`셔터가 그 위에 얹힌다. 무게가 실리는 소리가 난다.<br><br>지나간 뒤에 소화기를 뺐다. 셔터가 내려앉는다.<br>뒤쪽이 막혔다는 뜻이기도 하다.`,
      bad:`소화기가 미끄러진다.<br><br>셔터가 떨어지면서 손등을 쳤다.<br>피가 났다. 피 냄새가 났다.`, mBad:11 }
  ] },

// ───────── 2구간 · 보급소 ─────────
{ type:'narr', img:'step1', text:`보급소다.<br><br>
    문이 안쪽에서 잠겨 있었다. 열쇠는 밖에 걸려 있었다.<br>
    안에 있던 사람들은 나오지 못했고, 밖에 있던 사람은 넣어주지 않았다.<br><br>
    선반이 대부분 비어 있다. 급하게 쓸어 담은 흔적.<br>
    바닥에 떨어진 것들만 남았다.` },

{ type:'find', title:'보급소 — 탐색', item:'검사 기록지', mBad:6,
  text:`쓸 만한 것이 남아 있을지 모른다.<br><br>
    뒤지는 데는 시간이 걸리고, 시간이 걸리면 저것들이 온다.`,
  spots:['넘어진 선반 뒤', '잠긴 캐비닛', '천장 배관 위'],
  good:`검사 기록지 한 뭉치가 나왔다.<br><br>
    전부 음성이다. 한 장도 빠짐없이.<br>
    마지막 기록이 새벽 세 시에 멈춰 있다.<br><br>
    세 시에 무슨 일이 있었는지는 적혀 있지 않다.<br>
    적을 사람이 없었기 때문일 것이다.`,
  bad:`안쪽에 뭔가 웅크리고 있었다.<br><br>
    열자마자 튀어나왔다. 겨우 밀어냈다.<br>
    손목에 이가 스쳤다. 깊지는 않다.` },

{ type:'pick', title:'바리케이드', kind:'sense',
  text:`문을 막아야 한다.<br><br>
    쓸 만한 것은 많은데 시간이 없다.<br>
    튼튼하게 쌓으면 오래 걸리고, 빨리 쌓으면 약하다.<br><br>
    <span style="font-size:11px; color:#888;">혼자서 드는 것이라 더 오래 걸린다.</span>`,
  opts:[
    { l:'① 시간을 들여 단단히 쌓는다.', dc:14,
      good:`책상, 캐비닛, 침상 프레임까지 얹는다.<br><br>혼자라 세 배쯤 걸렸다.<br>밀어 보니 꿈쩍도 안 한다.`,
      bad:`쌓다가 무너뜨렸다.<br><br>소리가 크게 났다. 바깥에서 반응이 왔다.<br>다시 쌓을 시간은 없다.`, mBad:10 },
    { l:'② 경첩 자체를 망가뜨린다.', dc:12,
      good:`문이 틀에 끼인 채로 굳었다.<br><br>여는 것보다 부수는 게 어려워졌다.<br>저쪽도 그럴 것이다.`,
      bad:`경첩이 부서지면서 문이 통째로 쓰러졌다.<br><br>막으려던 것이 도리어 길이 됐다.`, mBad:12 },
    { l:'③ 되는 대로 빨리 막는다.', dc:9,
      good:`모양은 엉망인데 일단 막혔다.<br><br>얼마나 버틸지는 모르겠다.`,
      bad:`밀어 붙인 것이 도로 밀려 나온다.<br><br>문틈으로 손이 들어왔다.<br>손가락이 문틀을 쥐고 있다. 놓지 않는다.`, mBad:8 }
  ] },

{ type:'narr', text:`숨을 돌린다.<br><br>
    바깥 소리가 잦아든다. 잦아든 게 아니라 멀어진 것이다.<br>
    멀어진 것들은 다시 온다. 그걸 안다.<br><br>
    물을 마신다. 미지근하다.<br>
    나눠 줄 사람이 없으니 다 마셔도 된다. 그게 좋은 건지 모르겠다.` },

{ type:'quiz', title:'기억', q:`벽에 붙어 있던 근무 인원표의 야간 인원은?`, hint:`숫자로 입력`,
  answers:['9','9명','아홉','구'],
  good:`기억하고 있었다.<br><br>잊는 것이 첫 증상이라고 했다.<br>아직은 괜찮다.`,
  bad:`기억나지 않는다.<br><br>분명히 읽었는데 숫자가 안 떠오른다.<br>읽은 게 맞는지도 이제 확신이 없다.`,
  mGood:-4, mBad:12 },

// ───────── 3구간 · 의무실 ─────────
{ type:'narr', img:'step2', text:`의무실이다.<br><br>
    커튼이 전부 쳐져 있다. 하나씩 걷는다.<br>
    세 번째 침상에서 손을 멈춘다. 커튼 아래로 발이 보인다.<br><br>
    신발을 신고 있다. 환자는 신발을 신지 않는다.` },

{ type:'pick', title:'세 번째 침상', kind:'hide',
  text:`커튼을 걷을지 정해야 한다.<br><br>
    안쪽에서 소리는 나지 않는다.<br>
    소리가 나지 않는 게 더 신경 쓰인다.`,
  opts:[
    { l:'① 걷는다.', dc:13,
      good:`걷는다.<br><br>사람이 누워 있다. 움직이지 않는다.<br>목에 볼트가 박혀 있다. 누가 확실하게 끝내 놓고 갔다.<br><br>손에 무언가 쥐고 있다. 빼내는 데 시간이 걸렸다.`,
      bad:`걷는 순간 손이 올라왔다.<br><br>목을 노린 게 아니라 옷깃을 잡았다.<br>붙잡고 놓지 않는다. 떼어 내는 동안 손등이 긁혔다.`, mBad:13 },
    { l:'② 그대로 둔다.', dc:9,
      good:`지나친다.<br><br>등 뒤에서 커튼이 흔들렸다. 바람은 없었다.<br>돌아보지 않았다.`,
      bad:`지나치는데 커튼이 손에 감겼다.<br><br>안쪽에서 당긴 것이다.<br>겨우 풀고 물러났다.`, mBad:9 }
  ] },

{ type:'pick', title:'물린 자리', kind:'sense',
  text:`팔뚝에 자국이 있다.<br><br>
    깊지는 않다. 다만 가장자리가 검게 죽어 가고 있다.<br>
    지금 처치하면 진행이 늦어진다. 아마도.<br><br>
    <span style="font-size:11px; color:#888;">혼자라 감아 줄 사람도 본인이다.</span>`,
  opts:[
    { l:'① 소독하고 붕대를 감는다.', dc:9,
      good:`소독약을 붓는다. 숨을 참는다.<br><br>감는 손이 떨려서 두 번 다시 감았다.`, mGood:-6,
      bad:`한 손으로 감으려니 자꾸 풀린다.<br><br>이로 물어 고정했다. 물었던 자리가 찝찝하다.`, mBad:7 },
    { l:'② 불로 지진다.', dc:13,
      good:`라이터를 댄다.<br><br>소리를 내지 않으려고 옷자락을 물었다.<br>냄새가 한참 남았다.`, mGood:-12,
      bad:`손이 떨려 엉뚱한 데를 지졌다.<br><br>검은 자국은 그대로다. 화상만 늘었다.`, mBad:6 },
    { l:'③ 도려낸다.', dc:16,
      good:`깊게, 한 번에. 망설이면 못 한다.<br><br>피가 많이 났다. 그래도 검은 부분은 없어졌다.`, mGood:-18,
      bad:`손이 멈췄다.<br><br>혼자서 자기 살을 도려내는 건 생각보다 어렵다.<br>절반만 하고 그만뒀다. 절반은 아무 의미가 없다.`, mBad:14 },
    { l:'④ 그냥 둔다.', dc:99,
      good:``,
      bad:`그냥 둔다.<br><br>지금은 아프지 않다. 그게 더 나쁜 신호라는 걸 안다.<br>소매를 내려 덮는다.`, mBad:15 }
  ] },

{ type:'narr', text:`약을 챙긴다.<br><br>
    라벨이 대부분 뜯겨 있다. 남은 것 중에 쓸 만한 걸 고른다.<br>
    고르는 기준이 뭔지 모르겠다. 그냥 많이 남은 걸 가져간다.<br><br>
    붕대가 한 롤 나왔다. 반쯤 쓰여 있다.<br>
    쓰던 사람이 끝까지 못 감았다는 뜻이다.` },

{ type:'find', title:'의무실 — 탐색', item:'마지막 무전 기록', mBad:7,
  text:`간호 데스크에 기기가 몇 대 있다.<br><br>
    전원이 들어온 것도 있다. 화면에 뭔가 떠 있다.`,
  spots:['무전 단말기', '약품 냉장고', '의료 폐기물통'],
  good:`무전 기록이 남아 있다. 마지막 송신은 새벽 세 시 십분.<br><br>
    <span style="color:#7fd4d4;">"3층 확보. 아직 넷."</span><br>
    <span style="color:#7fd4d4;">"셋."</span><br>
    <span style="color:#7fd4d4;">"..."</span><br>
    <span style="color:#ff6b6b;">"들어오지 마세요."</span><br><br>
    마지막 문장은 목소리가 달랐다.`,
  bad:`열어 보니 비어 있다.<br><br>
    비어 있는 게 아니라, 안쪽에 뭔가 눌어붙어 있다.<br>
    손을 넣지 않기로 한다.` },

// ───────── 4구간 · 어둠 ─────────
{ type:'narr', img:'step3', text:`불이 전부 나갔다.<br><br>
    비상등만 남았다. 붉은 빛이 일정한 간격으로 깜빡인다.<br>
    깜빡이는 사이사이에 무언가 위치가 바뀐다.<br><br>
    눈을 감고 걷는 편이 나을 것 같다는 생각이 든다.<br>
    그런 생각을 한 사람이 어떻게 됐는지는 아까 봤다.` },

{ type:'pick', title:'비상등', kind:'sense',
  text:`깜빡이는 주기에 맞춰 움직여야 한다.<br><br>
    밝을 때 보면 아무것도 없고, 어두울 때 뭔가 움직인다.`,
  opts:[
    { l:'① 주기를 세고 맞춰 움직인다.', dc:12,
      good:`하나, 둘, 셋에 꺼지고 다섯에 켜진다.<br><br>박자에 맞춰 세 걸음씩 옮긴다.<br>끝까지 어긋나지 않았다.`,
      bad:`박자를 놓쳤다.<br><br>불이 켜졌을 때 한가운데 서 있었다.<br>전부 이쪽을 보고 있었다.`, mBad:12 },
    { l:'② 밝을 때만 움직인다.', dc:10,
      good:`보이는 동안만 걷는다. 그게 제일 마음이 놓인다.<br><br>다만 이쪽도 보인다는 뜻이었다. 운이 좋았다.`,
      bad:`밝을 때 움직였다.<br><br>정확히 그때 저쪽도 움직였다.<br>같은 규칙을 쓰고 있었던 것이다.`, mBad:10 },
    { l:'③ 눈을 감고 소리로 간다.', dc:14,
      good:`발소리와 숨소리만으로 방향을 잡는다.<br><br>어둠 속에서 눈을 뜨고 있는 것보다 낫다.<br>끝까지 뜨지 않았다.`,
      bad:`눈을 감았다.<br><br>소리가 사방에서 났다. 세어 보니 숨소리가 하나 많다.<br>이쪽 것까지 세었는데도 하나 많다.`, mBad:13 }
  ] },

{ type:'narr', text:`손등을 본다.<br><br>
    아까부터 자꾸 확인하게 된다.<br>
    깨끗하다. 깨끗한데도 계속 본다.<br><br>
    확인해 줄 사람이 없으니 스스로 봐야 한다.<br>
    스스로 보는 건 믿을 수가 없다. 그게 문제다.` },

{ type:'check', title:'자가 검진', q:`마지막으로 먹은 것은 무엇입니까?`, answers:null,
  good:`적는다.<br><br>기억났다는 게 중요하다. 무엇이었는지는 중요하지 않다.<br>손이 떨리지 않았다.`,
  bad:``,
  mGood:-4, mBad:0 },

// ───────── 5구간 · 검역소 ─────────
{ type:'narr', img:'step4', text:`검역소다.<br><br>
    비닐 커튼이 층층이 쳐져 있다. 통과할 때마다 소독약이 뿌려진다.<br>
    작동은 한다. 이 안에서 유일하게 정상인 것.<br><br>
    안쪽 벽에 도장 찍힌 서류가 잔뜩 붙어 있다.<br>
    <span style="color:#7fd4d4;">"음성"</span><br>
    전부 음성이다. 한 장도 빠짐없이.` },

{ type:'find', title:'검역소 — 탐색', item:'격리 지시서', mBad:6,
  text:`서류함이 여럿이다.<br><br>
    대부분 비어 있고, 잠긴 것도 있다.<br>
    무엇을 잠가 두었는지가 궁금해진다.`,
  spots:['검사 기록함', '방호복 걸이 뒤', '격리실 침대 밑'],
  good:`격리 지시서가 나왔다. 서명이 되어 있다.<br><br>
    <span style="color:#7fd4d4;">"3층 전원 격리. 해제 권한은 본부에 있음."</span><br><br>
    그 아래 손글씨.<br>
    <span style="color:#ff6b6b;">"본부 응답 없음. 자체 판단으로 문을 잠급니다. 미안합니다."</span><br><br>
    서명한 사람의 이름이 아까 주운 명찰의 사번과 같다.`,
  bad:`잠긴 것을 억지로 열었다.<br><br>
    안쪽에서 뭔가가 쏟아졌다. 젖은 것들이다.<br>
    피하지 못했다. 옷에 배었다.` },

{ type:'pick', title:'소독실', kind:'sense',
  text:`소독실을 통과해야 한다.<br><br>
    안개처럼 뿌옇다. 약품이 계속 분사된다.<br>
    오래 있으면 폐가 상하고, 빨리 지나면 덜 씻긴다.`,
  opts:[
    { l:'① 끝까지 서서 다 맞는다.', dc:14,
      good:`눈을 뜰 수 없다. 목이 타고 피부가 따갑다.<br><br>이 분을 세었다. 두 번 세었다.<br>나오니 팔의 검은 자국이 옅어져 있다.`, mGood:-16,
      bad:`분사기가 중간에 멎는다.<br><br>약품이 다 떨어진 것이다.<br>반쯤 젖은 채로 나왔다. 아무것도 씻기지 않았다.`, mBad:4 },
    { l:'② 절반만 맞고 지나간다.', dc:11,
      good:`충분하지 않다는 걸 안다. 그래도 시간이 없다.`, mGood:-8,
      bad:`절반도 못 맞고 나왔다.<br><br>문이 닫히는 속도가 예상보다 빨랐다.`, mBad:3 }
  ] },

{ type:'quiz', title:'기억', q:`검역 기록의 마지막 시각은 몇 시였는가?`, hint:`숫자로 입력`,
  answers:['3','3시','세시','세','삼'],
  good:`기억하고 있었다.<br><br>세 시. 그 시각에 멈춘 것들이 여럿이다.<br>무전도, 검사도, 아마 사람도.`,
  bad:`기억나지 않는다.<br><br>본 지 한 시간도 안 됐는데.<br>소매를 걷어 본다. 자국이 아까보다 넓다.`,
  mGood:-4, mBad:14 },

{ type:'narr', text:`명단을 꺼낸다.<br><br>
    주워 온 명찰과 대조한다. 사번이 맞아떨어지는 것도 있고 아닌 것도 있다.<br><br>
    맞아떨어지지 않는 사번이 하나 있다.<br>
    죽은 사람 것도 아니고, 근무표에도 없다.<br><br>
    그럼 누구 것인가.<br>
    혼자 들어왔는데 왜 하나가 남는가.` },

{ type:'pick', title:'남는 사번', kind:'sense',
  text:`대조를 계속할지 정해야 한다.<br><br>
    알면 무언가 해야 하고, 모르면 아무것도 안 해도 된다.`,
  opts:[
    { l:'① 끝까지 대조한다.', dc:13,
      good:`사번 앞자리를 본다. 검역반 소속이다.<br><br>검역반은 이 층에 배치된 적이 없다.<br>그럼 왜 여기 있었나.<br><br>답은 하나뿐이다. 밖에서 들어온 것이다.`,
      bad:`숫자가 자꾸 어긋난다. 세 번 세었는데 세 번 다 다르다.<br><br>명찰을 주머니에 도로 넣었다.<br>주머니가 아까보다 무겁다.`, mBad:8 },
    { l:'② 명찰을 버린다.', dc:9,
      good:`버린다.<br><br>알아서 좋을 게 없다고 생각했다.<br>버린 자리를 한 번 더 봤다. 명찰이 없었다.<br>누가 주워 갔다.`,
      bad:`버리려는데 손이 안 펴진다.<br><br>쥐고 있는 줄도 몰랐다.<br>억지로 폈다. 손바닥에 사번이 찍혀 있었다.`, mBad:10 }
  ] },

// ───────── 6구간 · 탈출로 ─────────
{ type:'narr', text:`환기구로 들어간다.<br><br>
    좁다. 어깨가 걸린다. 몸을 비틀어 밀어 넣는다.<br>
    안쪽에 먼지가 두껍게 앉아 있는데, 한 줄만 쓸려 있다.<br><br>
    누가 먼저 지나갔다는 뜻이다. 얼마 전에.<br>
    쓸린 자국이 이쪽으로 오고 있었는지 저쪽으로 갔는지는 알 수 없다.` },

{ type:'pick', title:'환기구', kind:'hide',
  text:`갈래가 둘이다.<br><br>
    한쪽은 쓸린 자국이 이어지고, 한쪽은 먼지가 그대로다.`,
  opts:[
    { l:'① 자국을 따라간다.', dc:13,
      good:`끝에서 멈춘다. 사람이 하나 엎드려 있다.<br><br>움직이지 않는다. 오래 그러고 있었던 자세다.<br>넘어서 지나간다. 손이 닿았는데 차가웠다.`,
      bad:`자국을 따라가니 막다른 곳이다.<br><br>먼지가 쓸린 이유는 무언가 여기서 나갔기 때문이 아니라,<br>여기로 끌려 들어왔기 때문이었다.`, mBad:11 },
    { l:'② 먼지가 그대로인 쪽으로.', dc:11,
      good:`더 좁다. 어깨가 걸려 한참 못 움직였다.<br><br>그래도 아무것도 없었다.<br>아무것도 없는 게 이렇게 반가운 건 처음이다.`,
      bad:`중간에서 걸렸다.<br><br>빠져나오려고 몸을 트는데 아래쪽 격자가 뜯어진다.<br>떨어졌다. 소리가 크게 났다.`, mBad:13 }
  ] },

{ type:'find', title:'마지막 탐색', item:'폐기 명단', mBad:8,
  text:`셔터 앞 사무실이다.<br><br>
    여기서 마지막으로 서류를 정리한 흔적이 있다.<br>
    정리하다 만 흔적이다.`,
  spots:['책상 서랍', '파쇄기 안', '벽에 걸린 클립보드'],
  good:`폐기 명단이다. 이름이 스물세 개 적혀 있다.<br><br>
    근무 인원은 스물셋이었다. 전원 음성이었고.<br>
    그런데 명단에는 스물넷이 적혀 있다.<br><br>
    마지막 줄의 이름을 읽는다.<br>
    <span style="color:#ff6b6b;">읽고 나서 한참 서 있었다.</span>`,
  bad:`파쇄기 안에 손을 넣었다.<br><br>전원이 들어와 있었다. 꺼져 있는 줄 알았다.<br>겨우 뺐다. 손가락은 다 있다. 세 번 세었다.` },

{ type:'narr', text:`셔터 앞이다.<br><br>
    조작반이 있다. 전원은 들어와 있다.<br>
    올리는 데 걸리는 시간이 표시된다. 40초.<br><br>
    40초 동안 누군가는 버텨야 한다.<br>
    그 누군가가 하나뿐이라는 게 문제다.` },

{ type:'pick', title:'40초', kind:'sense',
  text:`버튼을 누르면 되돌릴 수 없다.<br><br>
    누르고 나서 뒤를 막을지, 먼저 막아 두고 누를지 정해야 한다.`,
  opts:[
    { l:'① 먼저 막아 두고 누른다.', dc:12,
      good:`캐비닛을 통로에 밀어 넣는다. 세 개쯤.<br><br>그리고 누른다.<br>셔터가 올라가는 동안 캐비닛이 밀리는 소리가 났다.<br>다 밀리기 전에 올라갔다.`,
      bad:`막는 데 시간을 다 썼다.<br><br>누르고 나니 40초가 너무 길다.<br>막아 둔 것이 20초 만에 넘어갔다.`, mBad:16 },
    { l:'② 누르고 문 앞에서 버틴다.', dc:15,
      good:`등으로 문을 받친다.<br><br>밀린다. 신발이 바닥을 긁는다.<br>어깨가 빠질 것 같을 때 셔터가 허리 높이까지 올라왔다.`,
      bad:`밀렸다.<br><br>문틈으로 손이 여럿 들어온다. 유리에 팔이 갈리는데도 계속 들어온다.<br>물리면서 기어 나갔다.`, mBad:22 },
    { l:'③ 누르고 그냥 달아난다.', dc:10,
      good:`누르자마자 뛴다.<br><br>어차피 혼자다. 지킬 것도 없다.<br>셔터가 올라가는 쪽으로 몸을 던졌다.`,
      bad:`달아나다 미끄러졌다.<br><br>일어서는 사이에 셔터가 절반쯤 올라갔고,<br>안쪽 것들이 그 틈으로 먼저 나갔다.`, mBad:14 }
  ] },

{ type:'final', title:'밖으로', kind:'sense',
  text:`셔터 너머가 아침이다.<br><br>
    밖에는 사람이 있다. 출근하는 사람들, 지나가는 사람들.<br>
    지금 나가면 무엇이 같이 나가는지 아무도 모른다.<br><br>
    확인해 줄 사람도 없다. 혼자 판단해야 한다.`,
  opts:[
    { l:'① 밖에 알리고 검역을 요청한다.', dc:12 },
    { l:'② 그냥 나간다.', dc:10 },
    { l:'③ 셔터를 다시 내린다.', dc:16 }
  ],
  win:`밖을 향해 소리친다. 검역이라고, 물러나라고.<br><br>
    처음엔 아무도 안 믿었다. 팔을 걷어 보이고 나서야 흩어졌다.<br>
    차단선이 쳐지는 데 20분 걸렸다.<br>
    그 20분 동안 아무도 이쪽을 건드리지 않았다.<br><br>
    셔터가 등 뒤에서 내려온다.<br>
    밖은 아침이다. 아무 일도 없었던 것처럼 밝다.<br>
    손등을 확인한다. 팔을 걷어 본다. 두 번 확인한다.<br><br>
    눈을 뜨니 현관 앞이다.<br>
    한동안 사람이 많은 곳에서 숨을 참는 버릇이 생겼다.`,
  lose:`나간다.<br><br>
    몇 걸음 못 가서 무릎이 꺾였다.<br>
    누가 부축하려고 다가온다. 밀어냈다.<br><br>
    밀어낸 손에 힘이 너무 많이 들어갔다.<br>
    그 사람이 놀란 얼굴로 손목을 감싼다.<br><br>
    손목에서 피가 난다. 냄새가 좋다.<br>
    그 생각을 한 자신을 뒤늦게 알아차렸다.`,
  meterLose:`열이 내린다.<br><br>
    아까까지 아프던 자리가 아무렇지 않다.<br>
    숨이 편하다. 오래 참고 있었다는 걸 이제야 안다.<br><br>
    주변이 아주 또렷하다. 소리가 층층이 들린다.<br>
    셔터 너머 사람들의 위치를 눈을 감고도 알 수 있다.<br><br>
    배가 고프다.<br>
    그게 지금 유일하게 확실한 감각이다.<br><br>
    <span style="color:#ff6b6b;">셔터는 아직 올라가는 중이다.</span>` }

]};
;

// ---------- solo-s003.js ----------
// ==========================================
// ★ Qtrew-S-003 「동화의 뒷면」 — 1인 체험 확장
// index.html 에서 solo-s010.js 다음에 불러온다
// ==========================================
//
// 공용 장면 + 배역 전용 3장면 · 이해도 · 찢어진 장 5장 수집 · 금기 2회면 그 이야기대로 끝난다.

// --- 엔진 확장 ---
(function extendS003() {

    // 찢어진 장·배역·금기 표시
    const _pvBar = pvBar;
    pvBar = function () {
        const base = _pvBar.apply(this, arguments);
        if (!pv || pv.zone !== 'Qtrew-S-003') return base;
        const n = (pv.found || []).length;
        const r = pv.role ? TALE_ROLES[pv.role] : null;
        return base +
            `<div style="font-size:9px; color:#666; margin:-6px 0 10px 0; line-height:1.7;">
                찢어진 장 ${n} / 5${n ? ' — ' + pv.found.join(', ') : ''}
                ${r ? `<br>${r.icon} <b style="color:#d4af37;">${r.name}</b> · 금기 ${r.taboo} <span style="color:${(pv.taboo || 0) ? '#ff6b6b' : '#666'};">(${pv.taboo || 0} / 2)</span>` : ''}
            </div>`;
    };

    // 배역 전용 장면
    const _pvRender = pvRender;
    pvRender = function () {
        if (!pv) return;
        const st = PREVIEW[pv.zone].steps[pv.idx];
        if (!st || st.type !== 'rolepick') return _pvRender.apply(this, arguments);

        const set = S003_ROLE_SCENES[pv.role];
        const sc = set ? set[st.round - 1] : null;
        if (!sc) { pvNext(); return; }

        const r = TALE_ROLES[pv.role];
        darkBodyEl().innerHTML = darkBox(`${r.icon} ${r.name}의 장`, sc.text,
            pvBar() +
            `<div style="font-size:10px; color:#ff6b6b; margin-bottom:9px; padding:7px 9px; background:rgba(255,107,107,0.08); border-radius:5px;">
                금기 — ${r.taboo}
             </div>` +
            sc.opts.map((o, i) => darkChoiceBtn(o.l, `pvRolePick(${i})`)).join(''));
    };

    // 참된 결말
    const _pvPick = pvPick;
    pvPick = function (i) {
        if (!pv || pv.zone !== 'Qtrew-S-003') return _pvPick.apply(this, arguments);
        const st = PREVIEW[pv.zone].steps[pv.idx];
        if (!st || st.type !== 'final') return _pvPick.apply(this, arguments);

        const o = st.opts[i];
        const roll = Math.floor(Math.random() * 20) + 1;
        const bonus = rollDarkBonus('sense') + (pv.found || []).length * 2;
        const ok = roll !== 1 && (roll + bonus) >= o.dc;
        if (ok) pv.ok++; else pv.no++;

        if (pvMeterBroke()) { pvEnd(false, st.meterLose, roll, bonus, o.dc); return; }
        if (ok && (pv.found || []).length >= 5) { pvEnd(true, st.winTrue, roll, bonus, o.dc); return; }
        pvEnd(ok, ok ? st.win : st.lose, roll, bonus, o.dc);
    };
})();

function pvRolePick(i) {
    if (!pv || pv.over) return;
    const sc = S003_ROLE_SCENES[pv.role][PREVIEW[pv.zone].steps[pv.idx].round - 1];
    const o = sc.opts[i];
    const r = TALE_ROLES[pv.role];

    if (o.taboo) {
        pv.taboo = (pv.taboo || 0) + 1;
        if (pv.taboo >= 2) { pvEnd(false, r.death); return; }
        pvMeter(12);
        if (pvMeterBroke()) {
            const fin = PREVIEW[pv.zone].steps.find(s => s.type === 'final');
            pvEnd(false, fin.meterLose);
            return;
        }
        darkBodyEl().innerHTML = darkBox(`${r.name}의 장`,
            `<span style="color:#ff6b6b;">— 하마터면.</span><br><br>
             몸이 먼저 멈췄다. 이유는 모르겠다.<br>
             다만 계속했으면 안 됐다는 것만은 안다.<br><br>
             <span style="font-size:11px; color:#888;">${r.warn}</span>`,
            pvBar() + darkChoiceBtn('물러선다.', 'pvNext()'));
        return;
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    const bonus = rollDarkBonus('sense');
    const ok = roll !== 1 && (roll + bonus) >= o.dc;
    if (ok) pv.ok++; else pv.no++;
    pvMeter(ok ? (o.mGood != null ? o.mGood : (o.m || 0)) : (o.mBad != null ? o.mBad : ((o.m || 0) + 6)));

    if (pvMeterBroke()) {
        const fin = PREVIEW[pv.zone].steps.find(s => s.type === 'final');
        pvEnd(false, fin.meterLose, roll, bonus, o.dc);
        return;
    }

    darkBodyEl().innerHTML = darkBox(`${r.name}의 장 — 결과`,
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${o.dc})</span></div>` +
        (ok ? o.good : o.bad),
        pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
}

// ==========================================
// 배역 전용 장면 — 배역마다 3장
// ==========================================
const S003_ROLE_SCENES = {

dorothy: [
 { text:`길이 갈린다.<br><br>
    한쪽은 노란 벽돌, 한쪽은 벽돌을 뜯어낸 자리다.<br>
    뜯어낸 쪽에서 바람이 분다. 집 냄새가 난다.<br><br>
    구두가 발에 꽉 낀다. 아까보다 조여 온다.`,
   opts:[
     { l:'① 노란 길로 간다.', dc:10, m:2,
       good:`벽돌을 밟는다. 밟을 때마다 소리가 난다. 종이 넘기는 소리다.<br><br>길이 이쪽을 인정한 것 같다.`,
       bad:`벽돌 하나가 빠져 있다.<br><br>아래를 보니 또 길이 있다. 그 아래에도.<br>몇 층인지 세다가 그만뒀다.` },
     { l:'② 집 냄새를 따라간다.', dc:14, m:8,
       good:`따라간다. 냄새가 점점 진해진다.<br><br>모퉁이를 도니 부엌이다. 낯익은 부엌이다.<br>다만 창이 없다. 원래 있었는데.`,
       bad:`따라간다.<br><br>도착해 보니 냄새만 있고 집이 없다.<br>냄새가 어디서 나는지 알고 나서 한참 못 움직였다.` },
     { l:'③ 구두를 느슨하게 한다.', taboo:true }
   ] },

 { text:`허수아비가 서 있다.<br><br>
    머리에 짚이 아니라 종이가 들어 있다. 글씨가 적힌 종이다.<br><br>
    <span style="color:#888;">"뇌를 주신다고 했는데, 대신 이걸 넣어 주셨어요."</span><br><br>
    읽어 달라고 한다. 읽으면 무슨 일이 생길지는 말해 주지 않는다.`,
   opts:[
     { l:'① 종이를 빼 준다.', dc:11, m:2,
       good:`빼내자 고개가 툭 떨어진다.<br><br>안쪽이 비어 있다. 원래 비어 있어야 하는 자리다.<br>허수아비가 고맙다고 한다. 입은 없는데 들렸다.`,
       bad:`빼내려는데 종이가 늘어난다.<br><br>끝이 없다. 머리 안쪽이 아니라 다른 데로 이어져 있었다.` },
     { l:'② 읽어 준다.', dc:13, m:12,
       good:`읽는다. 회사 규정이다. 3조 4항.<br><br>왜 이게 허수아비 머리에 들어 있는지 알 것 같다.<br>알겠다는 게 문제다.`,
       bad:`읽는다.<br><br>읽는 동안 입이 저절로 움직였다.<br>다 읽고 나니 그 문장이 외워져 있었다.` },
     { l:'③ 그냥 지나간다.', dc:9, m:0,
       good:`지나간다. 뒤에서 부르지 않는다.<br><br>부르지 않는 게 더 신경 쓰였다.`,
       bad:`지나치는데 종이가 손에 붙었다.<br><br>털어도 안 떨어진다. 글씨가 손바닥으로 옮아 왔다.` }
   ] },

 { text:`구두를 세 번 부딪치면 돌아간다고 한다.<br><br>
    한 번 부딪쳤다. 발밑이 얇아진다.<br>
    두 번 부딪쳤다. 주변이 종이로 돌아간다.<br><br>
    세 번째를 부딪치기 전에, 누가 옷자락을 잡는다.<br>
    아무도 없는데 잡혔다.`,
   opts:[
     { l:'① 잡힌 채로 친다.', dc:12, m:4,
       good:`친다.<br><br>옷자락이 찢어지는 소리가 났다. 이쪽 옷은 멀쩡했다.<br>찢어진 건 저쪽이었다.`,
       bad:`친다.<br><br>같이 딸려 온다. 무엇이 딸려 왔는지는 보지 않기로 한다.` },
     { l:'② 옷자락을 떼어 내고 친다.', dc:14, m:2,
       good:`손가락을 하나씩 폈다. 다섯 개였다. 세었다.<br><br>떼어 내고 친다. 세 번째.`,
       bad:`떼어 내는 데 시간이 걸렸다.<br><br>그 사이에 두 번이 지워졌다. 처음부터 다시다.` },
     { l:'③ 구두를 벗어 건넨다.', taboo:true }
   ] }
],

jack: [
 { text:`콩나무 아래다.<br><br>
    줄기가 굵다. 사람 팔뚝만 한 덩굴이 꼬여 있는데,<br>
    자세히 보면 덩굴이 아니라 손가락이다.<br><br>
    올라가려면 그걸 잡아야 한다.`,
   opts:[
     { l:'① 잡고 올라간다.', dc:11, m:3,
       good:`잡는다. 따뜻하다.<br><br>잡을 때마다 조금씩 오므라든다. 잡아 주는 것이다.<br>고맙다고 해야 하나 잠깐 고민했다.`,
       bad:`잡는 순간 손가락이 움켜쥔다.<br><br>빼내는 데 시간이 걸렸다. 손톱 자국이 남았다.` },
     { l:'② 다른 곳을 잡고 오른다.', dc:14, m:2,
       good:`잎사귀를 잡고 오른다. 미끄럽지만 따뜻하지는 않다.<br><br>따뜻하지 않은 게 이렇게 반가울 줄 몰랐다.`,
       bad:`잎이 찢어진다.<br><br>떨어지면서 반사적으로 아래를 볼 뻔했다.<br>눈을 감아서 겨우 넘겼다.` },
     { l:'③ 얼마나 왔는지 확인한다.', taboo:true }
   ] },

 { text:`구름 위다.<br><br>
    거인의 집이 있다. 문이 열려 있다.<br>
    안쪽에 사람이 쌓여 있다. 정확히는 사람이었던 것들이.<br><br>
    전부 같은 자세다. 올려다보는 자세다.`,
   opts:[
     { l:'① 황금 거위를 찾는다.', dc:11, m:3,
       good:`찾았다. 알을 낳는 중이었다.<br><br>알에서 소리가 난다. 알이 아니라 다른 것 같다.<br>안 보기로 하고 거위만 안았다.`,
       bad:`찾다가 자루를 건드렸다.<br><br>안에서 뭔가 자세를 바꿨다. 거위는 아니었다.` },
     { l:'② 무엇을 봤는지 확인한다.', dc:15, m:14,
       good:`쌓인 것들의 시선을 따라가 본다.<br><br>천장이다. 천장에 아무것도 없다.<br>아무것도 없는 걸 저렇게 오래 볼 수는 없다.`,
       bad:`따라 올려다봤다.<br><br>있었다. 아주 잠깐.<br>본 것을 설명할 수가 없어서 설명하지 않기로 했다.` },
     { l:'③ 바로 내려간다.', taboo:true }
   ] },

 { text:`거인이 냄새를 맡는다.<br><br>
    <span style="color:#888;">"피 냄새가 난다."</span><br><br>
    손을 본다. 피가 묻어 있다. 언제 묻었는지 모르겠다.<br>
    씻을 물이 없고, 숨길 곳도 없다.`,
   opts:[
     { l:'① 가만히 있는다.', dc:12, m:2,
       good:`숨을 멈춘다. 냄새는 숨으로 나가지 않는데도 그랬다.<br><br>거인이 고개를 돌린다. 반대쪽으로.`,
       bad:`가만히 있는데 심장 소리가 크다.<br><br>거인이 그쪽으로 얼굴을 돌린다.<br>냄새가 아니라 소리였다.` },
     { l:'② 옷에 문지른다.', dc:14, m:4,
       good:`문지른다. 옷이 검게 물든다.<br><br>냄새가 옅어진다. 옅어진 만큼 옷이 무거워졌다.`,
       bad:`문지를수록 번진다.<br><br>냄새가 더 진해졌다. 문지르면서 덥혀진 것이다.` },
     { l:'③ 누구 피인지 확인한다.', dc:13, m:14,
       good:`손을 본다. 상처가 없다.<br><br>그럼 누구 피인가.<br>묻은 자리가 손바닥이 아니라 손등이라는 걸 알아차렸다.`,
       bad:`확인하려고 냄새를 맡았다.<br><br>아는 냄새였다.<br>어디서 아는지 떠올리지 않기로 한다.` }
   ] }
],

hood: [
 { text:`숲길이다.<br><br>
    꽃이 피어 있다. 길 밖에만 피어 있다.<br>
    할머니가 좋아하던 색이다. 정확히 그 색이다.<br><br>
    누가 알고 심은 것 같다.`,
   opts:[
     { l:'① 길만 따라간다.', dc:10, m:2,
       good:`꽃을 보지 않고 걷는다.<br><br>길 밖에서 부스럭 소리가 났다. 꽃이 내는 소리는 아니었다.<br>그래도 길만 봤다.`,
       bad:`길만 따라가는데 길이 좁아진다.<br><br>양옆으로 꽃이 밀려 들어온다.<br>밟지 않으려면 벗어나야 할 것 같다.` },
     { l:'② 바구니를 확인한다.', dc:12, m:4,
       good:`열어 본다. 빵과 포도주. 그리고 하나 더.<br><br>넣은 기억이 없는 것이다.<br>덮고 다시 걷는다.`,
       bad:`열어 본다.<br><br>안쪽이 젖어 있다. 빵이 아니라 다른 게 젖었다.<br>덮는 데 손이 떨렸다.` },
     { l:'③ 꽃을 꺾는다.', taboo:true }
   ] },

 { text:`할머니 집이다.<br><br>
    침대에 누가 누워 있다. 이불이 높다.<br><br>
    <span style="color:#888;">"얘야, 문을 잠갔니?"</span><br><br>
    할머니 목소리다. 다만 방향이 이상하다.<br>
    침대가 아니라 등 뒤에서 들렸다.`,
   opts:[
     { l:'① 침대 쪽을 본 채로 대답한다.', dc:12, m:3,
       good:`잠갔다고 한다. 실제로는 안 잠갔다.<br><br>등 뒤가 조용해진다. 만족한 것 같다.<br>침대 쪽은 처음부터 조용했다.`,
       bad:`대답하는데 목소리가 갈라졌다.<br><br>등 뒤에서 웃는 소리가 났다.<br>할머니는 그렇게 웃지 않는다.` },
     { l:'② 문으로 물러난다.', dc:13, m:2,
       good:`뒷걸음질한다. 양쪽 다 시야에 두고.<br><br>문에 닿았다. 손잡이가 따뜻하다.<br>누가 방금 잡았다는 뜻이다. 그래도 나갔다.`,
       bad:`물러나다 무언가에 걸렸다.<br><br>바닥에 놓인 것이다. 신발이었다.<br>할머니 것이 아니었다.` },
     { l:'③ 돌아본다.', taboo:true }
   ] },

 { text:`늑대의 배를 가른다.<br><br>
    안에 할머니가 있다. 멀쩡하다. 너무 멀쩡하다.<br>
    삼켜진 사람의 얼굴이 아니다.<br><br>
    <span style="color:#888;">"늦었구나. 안에서 기다렸단다."</span>`,
   opts:[
     { l:'① 배를 다시 꿰맨다.', dc:13, m:3,
       good:`꿰맨다. 안에서 아무 말도 하지 않는다.<br><br>마지막 한 땀을 뜨는데 안쪽에서 손이 닿았다.<br>고맙다는 뜻이었는지는 모르겠다.`,
       bad:`꿰매는데 실이 모자란다.<br><br>틈이 남았다. 그 틈으로 이쪽을 본다.` },
     { l:'② 꺼낸다.', dc:15, m:6,
       good:`꺼낸다. 가볍다. 사람 무게가 아니다.<br><br>세워 놓으니 혼자 선다. 그게 더 이상했다.`,
       bad:`꺼낸다.<br><br>꺼내고 보니 둘이다. 하나는 할머니고, 하나는 빨간 망토를 입고 있다.` },
     { l:'③ 얼마나 있었는지 묻는다.', dc:11, m:12,
       good:`묻는다.<br><span style="color:#888;">"글쎄. 세는 걸 그만둔 지 오래됐구나."</span><br><br>세는 걸 그만둘 만큼 있었다는 뜻이다.`,
       bad:`묻는다. 대답 대신 숫자를 센다.<br><br>세다가 이쪽 나이를 지나쳤다.<br>거기서 멈춰 달라고 하고 싶었다.` }
   ] }
],

peter: [
 { text:`날 수 있다고 한다.<br><br>
    <span style="color:#888;">"즐거운 생각을 하면 돼."</span><br><br>
    즐거운 생각을 떠올리려는데, 떠오르는 게 전부 오래된 것들이다.<br>
    오래됐다는 건 그만큼 시간이 지났다는 뜻이고,<br>
    그 사실을 의식하는 순간 발이 무거워진다.`,
   opts:[
     { l:'① 가장 최근의 즐거움을 떠올린다.', dc:11, m:2,
       good:`떠올린다. 작고 사소한 것이었다.<br><br>그래도 발이 떴다. 크기는 상관없는 모양이다.`,
       bad:`떠올리려는데 최근이 비어 있다.<br><br>언제부터 비었는지 세어 보려다 그만뒀다.` },
     { l:'② 어릴 적을 떠올린다.', dc:13, m:8,
       good:`떠올린다. 선명하다.<br><br>너무 선명해서 지금이 흐려진다.<br>발은 떴는데 어디로 가는지 모르겠다.`,
       bad:`떠올린다.<br><br>그 기억 속의 이쪽이 지금보다 작다.<br>작아지는 감각이 실제로 왔다.` },
     { l:'③ 몇 년 전인지 세어 본다.', taboo:true }
   ] },

 { text:`그림자가 떨어져 나갔다.<br><br>
    구석에서 혼자 움직인다. 이쪽을 흉내 내는 게 아니라 다른 짓을 한다.<br>
    꿰매 붙여야 한다는데, 실이 없다.<br><br>
    그림자가 손짓한다. 제 쪽으로 오라고.`,
   opts:[
     { l:'① 붙잡아 꿰맨다.', dc:12, m:2,
       good:`머리카락을 뽑아 꿰맸다.<br><br>붙는다. 다만 조금 어긋나게 붙었다.<br>걸을 때마다 반 발자국씩 늦는다.`,
       bad:`붙잡으려는데 미끄럽다.<br><br>손에 잡힌 건 그림자가 아니라 다른 것이었다.<br>놓자마자 사라졌다.` },
     { l:'② 무엇을 하는지 본다.', dc:12, m:11,
       good:`본다. 종이에 뭔가 쓰고 있다.<br><br>가까이 가니 멈춘다. 쓴 것을 읽었다.<br>이쪽 이름과 숫자가 적혀 있었다.`,
       bad:`본다.<br><br>그림자가 이쪽을 향해 손을 흔든다. 인사가 아니었다.<br>세고 있었다. 손가락으로.` },
     { l:'③ 그냥 둔다.', dc:10, m:0,
       good:`둔다. 그림자 없이 걷는다.<br><br>가볍다. 가벼운 게 좋은 건지는 모르겠다.`,
       bad:`두고 걷는데 뒤에서 따라온다.<br><br>붙으려는 게 아니라 따라오는 것이다.<br>거리가 일정하다.` }
   ] },

 { text:`아이들이 돌아가겠다고 한다.<br><br>
    창문을 열어 주면 돌아갈 수 있다.<br>
    다만 열어 준 쪽은 남는다. 그게 규칙이다.<br><br>
    아이 하나가 묻는다. <span style="color:#888;">"형은 몇 살이야?"</span>`,
   opts:[
     { l:'① 창문을 연다.', dc:12, m:3,
       good:`연다. 아이들이 하나씩 나간다.<br><br>마지막 아이가 돌아본다. 고맙다고 하지는 않았다.<br>고맙다고 하면 못 나갈 것 같아서였을 것이다.`,
       bad:`열려는데 창틀이 굳어 있다.<br><br>오래 안 연 창이다. 여기 사람은 창을 안 쓴다는 뜻이다.` },
     { l:'② 모른다고 한다.', dc:11, m:2,
       good:`모른다고 한다. 실제로도 잘 모르겠다.<br><br>아이가 웃는다. 그 대답이 마음에 든 모양이다.`,
       bad:`모른다고 하는데 목소리가 떨렸다.<br><br>아이가 고개를 기울인다.<br>세어 주려는 자세였다.` },
     { l:'③ 대답한다.', taboo:true }
   ] }
],

ariel: [
 { text:`뭍이다.<br><br>
    다리로 걷는 게 익숙하지 않다. 한 걸음마다 유리 위를 딛는 느낌이다.<br>
    아프다. 아프다고 말할 수가 없다.<br><br>
    옆에서 누가 괜찮냐고 묻는다.`,
   opts:[
     { l:'① 고개를 끄덕인다.', dc:10, m:2,
       good:`끄덕인다. 상대가 웃는다.<br><br>웃어 준 것으로 충분했다. 말은 원래 그렇게 중요하지 않았다.`,
       bad:`끄덕이는데 목이 아프다.<br><br>목이 아플 이유가 없다. 쓰지 않았으니까.` },
     { l:'② 손으로 적어 보인다.', dc:13, m:4,
       good:`모래에 적는다. 상대가 읽는다.<br><br>읽고 나서 표정이 변했다.<br>무엇을 적었는지 이쪽은 기억나지 않는다.`,
       bad:`적는다. 글씨가 안 써진다.<br><br>손가락이 지나간 자리가 바로 메워진다.<br>모래가 아니었다.` },
     { l:'③ 대답한다.', taboo:true }
   ] },

 { text:`바다에서 누가 올라온다.<br><br>
    상체만 있다. 아래가 없는 게 아니라, 아래를 어디에 두고 왔다.<br>
    눈이 풀려 있고 웃고 있다.<br><br>
    <span style="color:#888;">"언니, 나 이제 안 아파. 안 아픈 게 이런 거였어."</span><br><br>
    손을 내민다. 잡으라는 건지 잡아 달라는 건지 모르겠다.`,
   opts:[
     { l:'① 물러난다.', dc:11, m:3,
       good:`물러난다. 손이 그대로 내밀어져 있다.<br><br>파도가 한 번 치고 나니 없었다.<br>손만 없었다.`,
       bad:`물러나는데 발목이 잡혔다.<br><br>모래가 아니라 손이었다.<br>차서 떼어 냈다. 미안한 마음이 들었다.` },
     { l:'② 무엇을 주고 그렇게 됐는지 살핀다.', dc:13, m:12,
       good:`목을 본다. 비어 있다.<br><br>목소리가 아니라 목을 준 것이다.<br>그래서 저렇게 말할 수 있는 거였다. 반대였다.`,
       bad:`살피려고 가까이 갔다.<br><br>가까이서 보니 얼굴이 익숙하다.<br>거울에서 본 얼굴이었다.` },
     { l:'③ 손을 잡는다.', dc:15, m:10,
       good:`잡는다. 차갑지 않다.<br><br>잠깐 잡고 놓았다. 놓을 때 저쪽이 먼저 놓았다.<br>그게 고마웠다.`,
       bad:`잡는다. 놓아지지 않는다.<br><br>당긴다. 힘이 세지 않은데 안 놓인다.<br>겨우 뺐다. 손가락 자국이 남았다.` }
   ] },

 { text:`칼이 주어졌다.<br><br>
    왕자를 찌르면 돌아갈 수 있다고 한다. 언니들이 머리카락과 바꿔 온 칼이다.<br>
    손잡이에 머리카락이 아직 감겨 있다.<br><br>
    바다가 밝아 온다. 시간이 없다.`,
   opts:[
     { l:'① 칼을 버린다.', dc:11, m:2,
       good:`버린다. 물에 닿자마자 녹는다.<br><br>녹으면서 소리가 났다. 여럿이 한숨 쉬는 소리였다.<br>안도한 쪽인지 실망한 쪽인지는 모르겠다.`,
       bad:`버리려는데 손이 안 펴진다.<br><br>손잡이의 머리카락이 손가락에 감겨 있었다.` },
     { l:'② 머리카락을 확인한다.', dc:13, m:14,
       good:`풀어 본다. 여러 사람 것이다. 색이 다 다르다.<br><br>그중 하나가 이쪽 색이다.<br>언제 잘렸는지 기억나지 않는다.`,
       bad:`확인한다.<br><br>전부 같은 색이다. 이쪽 색이다.<br>세어 보니 사람 하나 분량이 넘는다.` },
     { l:'③ 소리 내어 부정한다.', taboo:true }
   ] }
],

pinocchio: [
 { text:`여우가 서 있다.<br><br>
    눈이 하나 없다. 빠진 자리를 그대로 두고 웃는다.<br>
    빠진 쪽으로도 이쪽을 보는 것 같다.<br><br>
    <span style="color:#888;">"학교에 가는 것보다 좋은 게 있단다. 뭘 갖고 있니?"</span>`,
   opts:[
     { l:'① 가진 것을 말한다.', dc:10, m:3,
       good:`가진 것을 전부 말한다. 얼마 없었다.<br><br>여우가 실망한다. 실망한 여우는 덜 위험하다.`,
       bad:`말하는데 하나가 빠졌다.<br><br>빠뜨린 건지 잊은 건지 구분이 안 간다.<br>여우는 알아차린 눈치였다.` },
     { l:'② 되묻는다.', dc:12, m:9,
       good:`뭘 갖고 있냐고 되묻는다.<br><br>여우가 빈 눈구멍을 가리킨다.<br><span style="color:#888;">"이거. 좋은 값에 팔았단다."</span>`,
       bad:`되묻는다.<br><br>여우가 대답 대신 이쪽 얼굴을 본다.<br>무엇을 보는지 알겠다. 손으로 눈을 가렸다.` },
     { l:'③ 아무것도 없다고 한다.', taboo:true }
   ] },

 { text:`고래 배 속이다.<br><br>
    아버지가 있다. 늙었다. 너무 늙었다.<br><br>
    <span style="color:#888;">"몇 년이나 기다렸는지 아니?"</span><br><br>
    숫자를 말해 준다. 그 숫자가 이쪽이 기억하는 것보다 훨씬 크다.`,
   opts:[
     { l:'① 미안하다고 한다.', dc:11, m:3,
       good:`미안하다고 한다.<br><br>아버지가 고개를 젓는다. 괜찮다고 한다.<br>괜찮다는 말이 제일 아팠다.`,
       bad:`미안하다고 하는데 말이 나오지 않는다.<br><br>나무는 원래 말을 못 한다.<br>그 사실을 지금 떠올린 게 이상했다.` },
     { l:'② 왜 그렇게 됐는지 묻는다.', dc:12, m:12,
       good:`묻는다.<br><span style="color:#888;">"여기서는 기다리는 쪽만 늙는단다."</span><br><br>그럼 이쪽은 기다리지 않았다는 뜻이다.`,
       bad:`묻는다. 대답 대신 손을 보여 준다.<br><br>손에 나뭇결이 있다.<br>누가 누구를 기다렸는지 헷갈리기 시작했다.` },
     { l:'③ 아니라고 한다.', taboo:true }
   ] },

 { text:`요정이 나타났다.<br><br>
    <span style="color:#888;">"사람이 되고 싶니?"</span><br><br>
    되고 싶다고 하면 된다. 다만 사람이 되면 여기서 나갈 수 없다.<br>
    나무는 종이에 그려질 수 있지만, 사람은 종이에 갇힌다.`,
   opts:[
     { l:'① 나무로 남겠다고 한다.', dc:11, m:2,
       good:`나무로 남겠다고 한다.<br><br>요정이 고개를 끄덕인다. 아쉬워하지 않는다.<br>아쉬워하지 않는 걸 보니 맞는 답이었다.`,
       bad:`말하는데 목소리가 갈라졌다.<br><br>갈라지는 건 나무가 하는 일이다.<br>맞는 답을 했는데도 무서웠다.` },
     { l:'② 대답하지 않는다.', dc:10, m:7,
       good:`입을 다문다.<br><br>요정이 기다린다. 오래 기다린다.<br>기다리다 사라졌다. 사라질 때 조금 웃었다.`,
       bad:`대답하지 않는데 고개가 끄덕여졌다.<br><br>끄덕인 건 이쪽이 아니었다.` },
     { l:'③ 사람이 되겠다고 한다.', dc:15, m:16,
       good:`말한다.<br><br>아무 일도 일어나지 않았다.<br>요정이 미안하다고 한다. <span style="color:#888;">"그건 제 권한이 아니에요."</span>`,
       bad:`말한다.<br><br>손끝부터 살이 된다. 따뜻하다.<br>따뜻해진 만큼 종이가 가까워졌다.` }
   ] }
],

alice: [
 { text:`문이 작다.<br><br>
    옆에 병이 있다. 이름표에 <b>마셔라</b>라고 적혀 있다.<br>
    아래에 작은 글씨가 있다. 읽으려면 몸을 굽혀야 한다.<br><br>
    굽히면 문이 한 뼘 더 작아진다.`,
   opts:[
     { l:'① 문을 부순다.', dc:12, m:2,
       good:`걷어찬다. 문이 종이처럼 찢어진다.<br><br>실제로 종이였다.<br>찢어진 자리로 다음 장이 보인다.`,
       bad:`걷어찬다. 발이 튕겨 나온다.<br><br>문이 작아진 게 아니라 이쪽이 커진 것이었다.<br>언제부터인지 모르겠다.` },
     { l:'② 작은 글씨를 읽는다.', dc:11, m:12,
       good:`굽혀서 읽는다.<br><span style="color:#888;">"마신 뒤에는 되돌릴 수 없습니다."</span><br><br>안 마시기로 한다. 읽은 값은 했다.`,
       bad:`읽는다. 문장이 길다.<br><br>다 읽고 고개를 드니 문이 손톱만 해져 있었다.` },
     { l:'③ 그냥 마신다.', dc:14, m:8,
       good:`마신다. 아무 맛도 안 난다.<br><br>작아진다. 문을 지나고 나서 다시 커졌다.<br>커질 줄은 몰랐다.`,
       bad:`마신다.<br><br>작아지는데 멈추지 않는다.<br>문이 산처럼 커졌을 때쯤 겨우 멎었다.` }
   ] },

 { text:`모자 장수가 수수께끼를 낸다.<br><br>
    <span style="color:#888;">"까마귀는 왜 책상을 닮았을까?"</span><br><br>
    답이 있는 질문이 아니라고 들은 적 있다.<br>
    그런데 이쪽은 답을 아는 얼굴로 기다린다.`,
   opts:[
     { l:'① 모르겠다고 한다.', dc:10, m:2,
       good:`모르겠다고 한다.<br><br>모자 장수가 박수를 친다.<br><span style="color:#888;">"저도요!"</span><br>그게 정답이었던 모양이다.`,
       bad:`모르겠다고 하는데 목소리가 작았다.<br><br>모자 장수가 되묻는다.<br>되묻는 것도 질문이다.` },
     { l:'② 같은 질문을 되돌려 준다.', dc:12, m:9,
       good:`똑같이 묻는다.<br><br>모자 장수가 굳는다. 찻잔을 든 자세 그대로.<br>그 틈에 지나갔다.`,
       bad:`되묻는다.<br><br>모자 장수가 기뻐한다.<br>기뻐하는 걸 보니 잘못 물었다.` },
     { l:'③ 답한다.', taboo:true }
   ] },

 { text:`카드들이 덤빈다.<br><br>
    <span style="color:#888;">"너희는 그냥 카드일 뿐이야."</span><br>
    그렇게 말하면 흩어진다고 들었다.<br><br>
    그런데 카드 하나하나에 얼굴이 그려져 있다.<br>
    전부 아는 얼굴이다. 회사 사람들 얼굴이다.`,
   opts:[
     { l:'① 그래도 말한다.', dc:12, m:3,
       good:`말한다.<br><br>흩어진다. 종이가 흩날리는 소리가 났다.<br>바닥에 떨어진 카드를 밟지 않으려고 돌아서 걸었다.`,
       bad:`말한다. 흩어지지 않는다.<br><br>카드가 아니었다는 뜻이다.<br>아니면 이쪽이 카드라는 뜻이거나.` },
     { l:'② 눈을 감는다.', dc:11, m:5,
       good:`눈을 감는다. 얼굴을 안 보니 말할 수 있었다.<br><br>흩어지는 소리만 들었다. 그게 나았다.`,
       bad:`눈을 감았는데 얼굴이 더 선명하다.<br><br>안쪽에 그려져 있었던 것이다.` },
     { l:'③ 얼굴을 확인한다.', dc:14, m:16,
       good:`한 장씩 본다. 전부 아는 얼굴이다.<br><br>마지막 한 장만 모르는 얼굴이었다.<br>모르는 게 다행이었다.`,
       bad:`한 장씩 본다.<br><br>마지막 장에 이쪽 얼굴이 있다.<br>웃고 있다. 이쪽은 안 웃었는데.` }
   ] }
]
};

// ==========================================
PREVIEW['Qtrew-S-003'] = {
    meter: { name:'이해도', color:'#d4af37', start:0, limit:60, up:true },
    steps: [

{ type:'narr', img:'intro', text:`책이 펼쳐져 있다.<br><br>
    아무도 펼치지 않았는데 펼쳐져 있다.<br>
    종이가 두껍고, 가장자리가 축축하다.<br><br>
    그림이 그려져 있다. 어릴 때 본 적 있는 그림이다.<br>
    다만 인물들의 눈이 전부 정면을 보고 있다.<br><br>
    첫 장에 적혀 있다.<br>
    <span style="color:#d4af37;">"등장인물이 모자랍니다."</span><br>
    <span style="color:#ff6b6b;">"채워 주십시오."</span>` },

{ type:'narr', text:`책 안이다.<br><br>
    바닥이 종이다. 걸을 때마다 사각거린다.<br>
    멀리 지평선이 보이는데, 자세히 보면 문장의 끝이다.<br><br>
    혼자다.<br>
    등장인물이 모자란다고 했는데, 채우러 온 것이 하나뿐이다.<br>
    그럼 나머지는 어떻게 되는가.` },

{ type:'cast' },

{ type:'narr', text:`이름이 불린 뒤로 몸이 달라졌다.<br><br>
    옷이 바뀐 것은 아니다. 다만 어깨가 자꾸 어떤 자세를 취하려 한다.<br>
    그 자세가 무엇을 하던 자세인지는 모르겠다.<br><br>
    손을 본다. 손이다. 아직은.` },

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

{ type:'find', title:'찢어진 장 · 첫째', item:'첫째 장', mBad:6,
  text:`한 장이 없다.<br><br>
    찢긴 자리가 들쭉날쭉하다. 누가 급하게 뜯었다.<br>
    근처에 있을 것이다.`,
  spots:['젖은 표지 안쪽', '삽화 뒤', '접힌 모서리'],
  good:`종이가 축축하다. 글씨가 번져 있는데 읽을 수는 있다.<br><br>
    <span style="color:#d4af37;">"처음에는 일곱이었다."</span>`,
  bad:`없다.<br><br>대신 손톱 자국이 난 종이가 나왔다.<br>누가 여기를 먼저 뒤졌다는 뜻이다.<br>그 사람은 찾았을까.` },

{ type:'narr', text:`삽화가 걸려 있다.<br><br>
    액자가 아니라 공중에 그냥 떠 있다.<br>
    그림 속에서 누가 이쪽을 보고 있다.<br><br>
    가까이 가니 그림이 한 칸 옆으로 옮겨 간다.<br>
    쫓아가면 계속 옮겨 갈 것 같아서 멈췄다.` },

{ type:'rolepick', round:1 },

{ type:'pick', title:'길', kind:'hide',
  text:`길이 접힌다.<br><br>
    뒤쪽부터 종이처럼 접혀 올라온다. 접힌 자리는 다시 펴지지 않는다.<br>
    앞쪽은 노란 벽돌. 군데군데 빠져 있다.`,
  opts:[
    { l:'① 전력으로 달린다.', dc:11, m:3,
      good:`발뒤꿈치 바로 뒤까지 접혀 올라온다.<br><br>마지막 벽돌에서 뛰었다.<br>착지했을 땐 다음 문단이었다.`,
      bad:`벽돌 하나가 빠진다.<br><br>그 아래에도 같은 길이 있다.<br>한 층 내려간 셈이다.` },
    { l:'② 벽돌만 골라 밟는다.', dc:10, m:2,
      good:`빠진 자리를 피해서. 천천히.<br><br>길이 접히는 속도보다 아주 조금 빨랐다.`,
      bad:`색이 바랜 벽돌을 밟았다.<br><br>노란색이 아니었다. 원래 노란색이었던 것이었다.<br>발목까지 빠졌다.` },
    { l:'③ 여백으로 뛰어내린다.', dc:13, m:6,
      good:`길 밖으로 뛴다.<br><br>여백에 떨어졌다. 아무것도 없는 흰 곳.<br>길이 알아서 지나가고, 다시 내려온다.`,
      bad:`여백은 바닥이 아니었다.<br><br>떨어지는 동안 위를 봤다. 문단이 멀어진다.<br>누가 손을 뻗어 끌어올렸다. 손이 종이였다.` }
  ] },

{ type:'narr', text:`숲이다.<br><br>
    나무가 전부 같은 모양이다. 복사해 붙여 놓은 것처럼.<br>
    한 그루만 다르게 생겼는데, 다가가면 다른 나무가 그 자리에 있다.<br><br>
    돌아보니 지나온 길이 없다.<br>
    없는 게 아니라, 아직 안 그려졌다.` },

{ type:'find', title:'찢어진 장 · 둘째', item:'둘째 장', mBad:6,
  text:`나무 사이에 종이가 끼어 있다.<br><br>
    한 장이 아니라 여러 장처럼 보인다. 대부분 백지다.`,
  spots:['늑대의 배 속', '할머니의 침대 밑', '바구니 바닥'],
  good:`찾았다. 이번 것은 마르지 않았다.<br><br>
    <span style="color:#d4af37;">"하나씩 읽혔다. 읽히면 그림이 된다."</span>`,
  bad:`백지뿐이다.<br><br>백지인 줄 알았는데, 비스듬히 보니 눌린 자국이 있다.<br>읽으려고 각도를 바꾸는 동안 눈이 아팠다.` },

{ type:'lorecheck', title:'질문', q:`이 이야기의 결말을 아십니까.`,
  safe:['아니오','아니요','아뇨','모른다','몰라','모름'],
  good:`모른다고 적었다.<br><br>글자가 잠시 머물다 사라진다.<br>만족한 것 같지는 않다. 다만 더 묻지 않는다.`,
  bad:`적었다.<br><br>적고 나서 그게 어디서 나온 답인지 생각한다.<br>생각나지 않는다. 그런데 맞는 것 같다.<br><br><span style="color:#d4af37;">알게 되었다. 알면 안 되는 쪽으로.</span>` },

{ type:'narr', text:`탁자가 차려져 있다.<br><br>
    의자가 하나보다 많다. 여섯 개 많다.<br>
    찻잔에 김이 오르는데 차는 없다.<br><br>
    앉으라는 말은 없었다. 다만 서 있으면 의자가 천천히 뒤로 온다.<br>
    비어 있는 자리들이 채워지기를 기다리는 것 같다.` },

{ type:'pick', title:'차 마시기', kind:'hide',
  text:`모자 쓴 것이 찻주전자를 든다.<br><br>
    <span style="color:#d4af37;">"누구 차례지?"</span><br><br>
    비어 있는 의자 여섯 개를 한 번씩 본다.<br>
    그리고 이쪽을 본다.`,
  opts:[
    { l:'① 마시는 척한다.', dc:10, m:3,
      good:`잔을 들고 입에 대는 척만 한다.<br><br>모자 쓴 것이 만족스럽게 고개를 끄덕인다.<br>다음 자리로 옮기라는 손짓.`,
      bad:`입에 대는 척했는데 입술이 젖었다.<br><br>차는 없었는데 젖었다.<br>무슨 맛이었는지는 말하고 싶지 않다.` },
    { l:'② 빈 의자를 하나씩 세어 본다.', dc:13, m:13,
      good:`여섯이다.<br><br>일곱에서 하나 뺀 수다.<br>그 하나가 지금 서 있다.`,
      bad:`세는데 자꾸 늘어난다.<br><br>일곱, 여덟.<br>세는 동안 이쪽도 하나로 세어진 것 같다.` },
    { l:'③ 자리를 옮긴다.', dc:11, m:2,
      good:`모두가 옮길 때 같이 옮긴다. 한 칸씩. 규칙대로.<br><br>세 번째 옮겼을 때 탁자 끝에 문이 있었다.`,
      bad:`옮기다 빈 의자에 앉았다.<br><br>앉자마자 의자가 기뻐했다.<br>일어나는 데 한참 걸렸다.` }
  ] },

{ type:'rolepick', round:2 },

{ type:'narr', text:`무언가 잘못 읽히고 있다.<br><br>
    늑대가 할머니 옷을 입고 있는 게 아니라, 할머니가 늑대 안에 있다.<br>
    고래가 배를 삼킨 게 아니라, 배가 고래 안에서 자랐다.<br><br>
    앞뒤가 바뀌어 있다. 원래 그랬던 것 같기도 하다.<br>
    그렇게 생각하기 시작한 게 언제부터인지 모르겠다.` },

{ type:'find', title:'찢어진 장 · 셋째', item:'셋째 장', mBad:7,
  text:`찻잔 근처에 종이가 있다.<br><br>
    젖어서 탁자에 붙었다. 떼면 찢어질 것 같다.`,
  spots:['찻잔 아래', '거울 뒤', '시계 안'],
  good:`조심스럽게 떼어 냈다. 절반만 찢어졌다.<br><br>
    <span style="color:#d4af37;">"그림이 된 것들은 이름을 잃는다.<br>이름을 잃으면 부를 수 없고, 부를 수 없으면 꺼낼 수 없다."</span>`,
  bad:`떼는 순간 종이가 녹았다.<br><br>손에 잉크만 남았다. 문지르니 번진다.<br>번진 모양이 글자 같아서 읽어 보려다 그만뒀다.` },

{ type:'pick', title:'삼켜진 장', kind:'sense',
  text:`사방이 종이다.<br><br>
    페이지들이 뭉쳐서 벽이 됐다. 축축하고, 미지근하다.<br>
    무언가의 배 속 같다. 늑대인지 고래인지는 모르겠다.<br><br>
    벽이 아주 천천히 조여 온다.`,
  opts:[
    { l:'① 찢고 나간다.', dc:11, m:3,
      good:`찢는다. 한 장, 두 장.<br><br>찢긴 틈으로 바깥 문단이 보인다.<br>종이 조각이 손에 한참 붙어 있었다.`,
      bad:`찢으려는데 종이가 늘어난다.<br><br>찢기는 게 아니라 늘어난다. 살처럼.<br>손을 뗐다. 손바닥에 글자가 찍혀 있다.` },
    { l:'② 불을 붙인다.', dc:10, m:8,
      good:`잘 탄다. 타면서 문장을 읊는 소리가 난다.<br><br>다 타기 전에 빠져나왔다.`,
      bad:`너무 잘 붙었다.<br><br>연기에서 글자 냄새가 난다.<br>들이마신 만큼 알게 됐다.` },
    { l:'③ 틈을 찾아 비집는다.', dc:13, m:2,
      good:`얇다. 숨을 내쉬고 옆으로 비집는다.<br><br>빠져나왔을 때 옷에 글자가 몇 개 묻어 있었다.`,
      bad:`틈에 끼었다.<br><br>앞뒤로 문장이 짓누른다.<br>한참 버둥거린 뒤에야 빠져나왔다.` }
  ] },

{ type:'narr', text:`인원을 센다.<br><br>
    하나다. 당연히 하나다.<br>
    그런데 배역이 여섯 남는다.<br><br>
    아무도 맡지 않은 이름이 계속 불린다.<br>
    대답하지 않으면 계속 부를 것이다.<br>
    대답하면 그 이름이 될 것이다.` },

{ type:'pick', title:'불리는 이름', kind:'sense',
  text:`책이 이름을 부른다.<br><br>
    한 번에 하나씩. 순서가 있는 것 같지는 않다.<br>
    부를 때마다 잠깐 멈춘다. 대답을 기다리는 길이만큼.`,
  opts:[
    { l:'① 귀를 막는다.', dc:11, m:3,
      good:`막는다. 그래도 들린다.<br><br>다만 대답하고 싶은 마음은 줄었다.<br>그걸로 충분했다.`,
      bad:`막았는데 안쪽에서 들린다.<br><br>목 안쪽이다.<br>대답이 이미 거기 와 있었다.` },
    { l:'② 다른 이름을 크게 부른다.', dc:13, m:7,
      good:`이쪽 이름을 부른다. 진짜 이름을.<br><br>책이 멈춘다. 그 이름은 목록에 없는 모양이다.<br>없는 게 다행이다.`,
      bad:`불렀는데 목소리가 안 나왔다.<br><br>대신 책이 그 이름을 받아 적었다.<br>이제 목록에 있다.` },
    { l:'③ 어떤 이름인지 들어 본다.', dc:12, m:15,
      good:`듣는다. 일곱 개다. 여섯은 모르는 이름이고 하나는 안다.<br><br>아는 쪽이 지금 맡은 배역이다.<br>나머지 여섯은 누구였을까.`,
      bad:`듣는다.<br><br>여섯 개 중 둘이 아는 이름이다. 회사 사람들이다.<br>들어온 적 없는 사람들인데.` }
  ] },

{ type:'find', title:'찢어진 장 · 넷째', item:'넷째 장', mBad:7,
  text:`고래 배 속에서 나온 뒤로 종이가 자주 보인다.<br><br>
    이번 것은 깊숙이 박혀 있다.`,
  spots:['고래의 이 사이', '배의 늑골', '기름 램프 옆'],
  good:`끼어 있던 것을 빼냈다. 이가 놓아주지 않아 힘을 썼다.<br><br>
    <span style="color:#d4af37;">"채워 달라고 한 적 없다.<br>모자란다고 적혀 있었을 뿐이다."</span>`,
  bad:`손을 넣었다가 뺐다.<br><br>안쪽이 따뜻했다. 삼킨 것이 아직 살아 있다는 뜻이다.<br>종이는 없었다.` },

{ type:'rolepick', round:3 },

{ type:'lorecheck', title:'질문', q:`당신의 이름은 무엇입니까.`, safe:null,
  good:`적는다.<br><br>손이 기억하고 있었다. 머리보다 먼저.<br>적고 나서 소리 내어 읽었다. 읽히는 이름이었다.`,
  bad:`적는다.<br><br>적고 나서 읽어 보니 배역 이름이었다.<br>고쳐 적으려는데 손이 같은 글자를 다시 썼다.` },

{ type:'narr', text:`종이 끝이 보인다.<br><br>
    책의 끝이 아니라 종이의 끝이다. 그 너머는 아무것도 안 그려져 있다.<br>
    흰색도 아니다. 색이 없다.<br><br>
    거기로 걸어간 사람이 있었다고 한다.<br>
    돌아오지는 않았고, 다만 그 자리에 문장이 한 줄 늘었다고 한다.` },

{ type:'find', title:'찢어진 장 · 다섯째', item:'다섯째 장', mBad:8,
  text:`마지막 한 장이다.<br><br>
    있어야 할 자리에 없다. 애초에 그 자리가 어디인지도 모르겠다.`,
  spots:['마지막 문장 다음', '페이지 번호 자리', '없는 줄'],
  good:`없는 줄에 손을 넣었다. 들어갔다.<br><br>
    <span style="color:#d4af37;">"일곱 번째는 책을 덮는 역이다.<br>덮는 쪽은 안에 남는다. 그래서 늘 모자란다."</span><br><br>
    다섯 장이 손안에서 맞물린다.`,
  bad:`세 군데를 다 뒤졌는데 없다.<br><br>없는 게 아니라, 아직 찢기지 않은 것 같다.<br>찢을 사람이 남아 있다는 뜻이다.` },

{ type:'narr', text:`마지막 장이다.<br><br>
    "그리고 모두 오래오래 행복하게 살았습니다."<br>
    그 아래 작게 덧붙어 있다.<br><br>
    <span style="color:#d4af37;">"— 누가?"</span><br><br>
    답을 적을 수 있는 빈칸이 있다.<br>
    빈칸이 하나다. 일곱이 아니라 하나.` },

{ type:'final', title:'빈칸', kind:'sense',
  text:`결말 바로 앞 장이다.<br><br>
    빈 줄이 하나 있고, 그 옆에 문장 세 개가 연필로 흐리게 적혀 있다.<br>
    그중 하나가 원래 이 자리에 있던 문장이다.<br><br>
    <span style="font-size:11px; color:#888;">찢어진 장을 모았다면 무엇이 원래 문장인지 알 수 있다.</span>`,
  opts:[
    { l:'① "그리고 모두 돌아왔다."', dc:13 },
    { l:'② "그리고 아무도 기억하지 않았다."', dc:13 },
    { l:'③ "그리고 이야기는 계속되었다."', dc:13 }
  ],
  win:`문장이 종이에 스며든다. 거부당하지 않았다.<br><br>
    책이 조금 가벼워진다. 그리고 스스로 덮인다.<br>
    덮이면서 이쪽을 밀어낸다.<br><br>
    책이 덮인다. 표지가 낯설다. 제목이 없다.<br>
    펼쳐 보려는데 손이 말을 듣지 않는다.<br><br>
    눈을 뜨니 도서관 앞이다. 비가 오고 있다.`,
  winTrue:`다섯 장을 제자리에 끼운다.<br><br>
    맞물리자 문장이 다시 읽힌다.<br>
    원래 이야기가 아니다. 원래 이야기였던 것이다.<br><br>
    <span style="color:#d4af37;">"등장인물이 모자랍니다."</span><br>
    그 문장 아래 원래 적혀 있던 것이 드러난다.<br>
    <span style="color:#d4af37;">"— 모자란 것은 덮을 사람입니다."</span><br><br>
    빈칸에 적는다. 이쪽 이름이 아니라, 책의 이름을.<br>
    책에는 제목이 없었다. 없는 것을 적자 생겼다.<br><br>
    생기자마자 덮였다. 안에서가 아니라 밖에서.<br>
    밀려나는 게 이렇게 반가운 일인 줄 몰랐다.<br><br>
    눈을 뜨니 도서관 앞이다. 비가 오고 있다.<br>
    한동안 동화책을 읽어 주지 못했다.<br>
    읽으면 그 안의 누군가가 이쪽을 볼 것 같아서.`,
  lose:`문장이 튕겨 나온다. 이 책의 문장이 아니라는 듯이.<br><br>
    대신 다른 문장이 그 자리에 적힌다.<br>
    읽어 보니 이쪽 이름이 들어 있었다.<br><br>
    빈칸이 하나 줄었다. 여섯이 남았다.`,
  meterLose:`이제 알겠다.<br><br>
    왜 늑대가 말을 하는지, 왜 콩나무가 하늘까지 자라는지.<br>
    전부 말이 된다. 처음부터 말이 됐다.<br><br>
    이상하다고 느꼈던 게 이상했던 것이다.<br><br>
    <span style="color:#d4af37;">책장이 넘어간다. 이제 이쪽이 그림이다.</span><br>
    등장인물이 하나 채워졌다. 여섯 남았다.` }

]};

// --- 질문 장면 (이해도 전용) ---
(function addLoreCheck() {
    const _pvRender = pvRender;
    pvRender = function () {
        if (!pv) return;
        const st = PREVIEW[pv.zone].steps[pv.idx];
        if (!st || st.type !== 'lorecheck') return _pvRender.apply(this, arguments);

        darkBodyEl().innerHTML = darkBox(st.title,
            `책이 멈춘다.<br><br>
             글자가 줄지어 있다가, 한 줄만 남기고 흩어진다.<br>
             읽으라는 뜻이다. 대답하라는 뜻이기도 하다.<br><br>
             <span style="color:#d4af37; font-size:14px;">${st.q}</span><br><br>
             <span style="font-size:10px; color:#888;">답하지 않아도 됩니다. 답하면 더 알게 됩니다.</span>`,
            pvBar() +
            `<input type="text" id="pv-input" maxlength="24" placeholder="" style="width:100%; padding:12px; font-size:14px; text-align:center; box-sizing:border-box; margin-bottom:10px;" onkeypress="if(event.key==='Enter') pvLore()">
             <button class="game-btn" style="width:100%; margin:0 0 8px 0; padding:12px;" onclick="pvLore()">답한다</button>
             <button class="game-btn" style="width:100%; margin:0; padding:11px; font-size:11px; background:linear-gradient(145deg,#333,#1a1a1a) !important;" onclick="pvSilent()">입을 다문다</button>`);
        setTimeout(() => { const f = document.getElementById('pv-input'); if (f) f.focus(); }, 200);
    };
})();

function pvLore() {
    const el = document.getElementById('pv-input');
    if (!el || !pv) return;
    const v = el.value.trim();
    if (!v) { showCustomAlert('적어 주세요.'); return; }

    const st = PREVIEW[pv.zone].steps[pv.idx];
    const safe = st.safe ? checkQuizAnswer(v, st.safe) : false;

    if (pv.role === 'alice') {
        pv.taboo = (pv.taboo || 0) + 1;
        if (pv.taboo >= 2) { pvEnd(false, TALE_ROLES.alice.death); return; }
    }

    pv.ok++;
    pvMeter(safe ? 3 : 15);

    if (pvMeterBroke()) {
        const fin = PREVIEW[pv.zone].steps.find(s => s.type === 'final');
        pvEnd(false, fin.meterLose);
        return;
    }

    darkBodyEl().innerHTML = darkBox(st.title, safe ? st.good : st.bad,
        pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
}

function pvSilent() {
    if (!pv) return;
    const st = PREVIEW[pv.zone].steps[pv.idx];
    darkBodyEl().innerHTML = darkBox(st.title,
        `입을 다물었다.<br><br>
         글자가 오래 머문다. 기다리는 것 같다.<br>
         끝내 답하지 않자 한 줄이 덧붙는다.<br><br>
         <span style="color:#888;">"그럼 나중에 묻겠습니다."</span>`,
        pvBar() + darkChoiceBtn('계속 간다.', 'pvNext()'));
}
;

// ---------- epic.js ----------
// ==========================================
// ★ Qtrew-???-■■■ — 1차 뼈대
// index.html 에서 solo-s003.js 다음에 불러온다
// ==========================================
//
// 직업 24종 · 속성 8종 × 3 · 지도 이동 · 개인 목표 · 동료 구조
// 정해진 결말 없음. 목표를 이루면 그 자리에서 정산하고 빠져나온다.
// 장소별 본편은 2차 파일에서 채운다.

const EPIC_CODE = 'Qtrew-???-■■■';

// ==========================================
// 구역 등록
// ==========================================
DARK_ZONES[EPIC_CODE] = {
    code: EPIC_CODE, grade: '?', name: '■■의 ■■■',
    brief: '(기록이 오래되어 대부분 읽히지 않습니다.)',
    warn: '장시간 탐사 — 중도 이탈 가능',
    danger: '가늠 불가', survival: '??%', min: 1, max: 24,
    reward: [300, 25000], ready: false, epic: true,
    intro: `문이 아니다. 문이 있던 자리다.<br><br>
        돌이 무너져 아치만 남았고, 그 너머가 밝다.<br>
        밝은데 해는 없다.<br><br>
        발을 들이자 등 뒤에서 소리가 난다.<br>
        돌이 제자리로 돌아가는 소리다. 천천히, 빠짐없이.<br><br>
        벽에 글자가 새겨져 있다. 대부분 깎여 나갔다.<br>
        <span style="color:#d4af37;">"■■이 ■■를 ■■하던 시절의 ■■■"</span><br><br>
        읽을 수 있는 글자는 둘뿐이다.<br>
        <span style="color:#d4af37;">"영웅"</span>`,
    outro: `돌아 나온다.<br><br>
        아치가 다시 무너져 있다. 들어갈 때와 같은 모양으로.<br>
        손에 쥔 것이 있다. 여기 것이 아닌데 여기 것 같다.<br><br>
        눈을 뜨니 복도다.<br>
        한동안 오래된 이야기를 들으면 목이 말랐다.`,
    images: { intro:'epic_1.jpg', step1:'epic_2.jpg', step2:'epic_3.jpg', step3:'epic_4.jpg', step4:'epic_5.jpg' }
};

// ==========================================
// 직업 24종
// ==========================================
const EPIC_JOBS = {
    // ✦ 회피
    thief:    { name:'도적',     icon:'🗝', attr:'evade', desc:'잠긴 것을 열고, 열린 것은 그냥 지나친다.',
                start:'market', goal:{ id:'g_thief',  text:'성의 금고에서 이름이 적힌 열쇠를 꺼낸다.', grade:2 } },
    jester:   { name:'광대',     icon:'🃏', attr:'evade', desc:'웃기면 살고, 웃기면 죽는다.',
                start:'castle', goal:{ id:'g_jester', text:'왕의 앞에서 한 번 웃게 만든다.', grade:2 } },
    spy:      { name:'밀정',     icon:'🕵', attr:'evade', desc:'양쪽에 이름이 있고, 어느 쪽도 본명이 아니다.',
                start:'castle', goal:{ id:'g_spy',    text:'두 진영의 전언을 모두 전달한다.', grade:3 } },

    // ✧ 파괴
    swordsman:{ name:'검사',     icon:'⚔', attr:'break', desc:'베는 법만 배웠고, 그것으로 충분했다.',
                start:'ruin',   goal:{ id:'g_sword',  text:'봉인된 문을 베어 연다.', grade:2 } },
    smith:    { name:'대장장이', icon:'🔨', attr:'break', desc:'만드는 손이 부수는 법도 안다.',
                start:'market', goal:{ id:'g_smith',  text:'부러진 명검을 다시 잇는다.', grade:3 } },
    warden:   { name:'파수꾼',   icon:'🛡', attr:'break', desc:'막는 것이 본분이고, 막다 죽는 것도 본분이다.',
                start:'gate',   goal:{ id:'g_warden', text:'성문을 한 번 지켜 낸다.', grade:3 } },

    // ❋ 치유
    priest:   { name:'사제',     icon:'✝', attr:'heal',  desc:'기도가 듣는지는 모르지만 계속한다.',
                start:'temple', goal:{ id:'g_priest', text:'말라붙은 성수를 다시 흐르게 한다.', grade:3 } },
    herbal:   { name:'약초꾼',   icon:'🌿', attr:'heal',  desc:'숲에서 자란 것은 숲에서 쓴다.',
                start:'forest', goal:{ id:'g_herbal', text:'전설의 약초를 찾아 달인다.', grade:2 } },
    midwife:  { name:'산파',     icon:'🕯', attr:'heal',  desc:'처음 우는 소리를 가장 많이 들은 사람.',
                start:'village',goal:{ id:'g_midwife',text:'마을에서 아이 하나를 받아 낸다.', grade:2 } },

    // ✺ 행운
    fisher:   { name:'낚시꾼',   icon:'🎣', attr:'luck',  desc:'기다리는 데는 이골이 났다.',
                start:'lake',   goal:{ id:'g_fisher', text:'말하는 물고기를 낚는다.', grade:2 } },
    gambler:  { name:'도박사',   icon:'🎲', attr:'luck',  desc:'잃은 것을 세지 않는 편이 오래 산다.',
                start:'market', goal:{ id:'g_gambler',text:'판에서 한 번 전부 딴다.', grade:2 } },
    bard:     { name:'음유시인', icon:'🎻', attr:'luck',  desc:'노래로 남지 않으면 없었던 일이 된다.',
                start:'village',goal:{ id:'g_bard',   text:'아무도 모르는 노래를 한 곡 완성한다.', grade:3 } },

    // ◈ 감각
    archer:   { name:'궁수',     icon:'🏹', attr:'sense', desc:'멀리 보는 눈이 먼저고 손은 나중이다.',
                start:'gate',   goal:{ id:'g_archer', text:'보이지 않는 것을 맞힌다.', grade:3 } },
    hunter:   { name:'사냥꾼',   icon:'🐗', attr:'sense', desc:'발자국만 보고도 며칠 전인지 안다.',
                start:'forest', goal:{ id:'g_hunter', text:'숲의 주인을 추적해 마주한다.', grade:3 } },
    seer:     { name:'점성술사', icon:'🔮', attr:'sense', desc:'하늘을 읽지만 하늘은 읽어 주지 않는다.',
                start:'tower',  goal:{ id:'g_seer',   text:'사라진 별자리 하나를 다시 그린다.', grade:3 } },

    // ◐ 은신
    assassin: { name:'암살자',   icon:'🗡', attr:'hide',  desc:'이름을 남기지 않는 것이 실력이다.',
                start:'castle', goal:{ id:'g_assassin',text:'아무에게도 들키지 않고 성을 관통한다.', grade:3 } },
    poacher:  { name:'밀렵꾼',   icon:'🪤', attr:'hide',  desc:'금지된 곳에만 좋은 것이 있다.',
                start:'forest', goal:{ id:'g_poacher',text:'금렵구에서 산 채로 하나 얻어 나온다.', grade:2 } },
    digger:   { name:'도굴꾼',   icon:'⛏', attr:'hide',  desc:'죽은 자는 항의하지 않는다. 대개는.',
                start:'grave',  goal:{ id:'g_digger', text:'왕의 부장품을 하나 꺼낸다.', grade:3 } },

    // ⊙ 연결
    merchant: { name:'상인',     icon:'⚖', attr:'bond',  desc:'값이 붙지 않는 것은 없다고 믿는다.',
                start:'market', goal:{ id:'g_merch',  text:'값이 없는 것에 값을 매겨 판다.', grade:2 } },
    courier:  { name:'전령',     icon:'📜', attr:'bond',  desc:'내용을 읽지 않는 것이 규칙이다.',
                start:'road',   goal:{ id:'g_courier',text:'끊긴 길 너머로 편지를 전한다.', grade:2 } },
    driver:   { name:'마부',     icon:'🐎', attr:'bond',  desc:'말이 먼저 알고 사람이 나중에 안다.',
                start:'road',   goal:{ id:'g_driver', text:'누구도 지나지 못한 다리를 건넌다.', grade:3 } },

    // ❂ 응시
    mage:     { name:'마법사',   icon:'✨', attr:'gaze',  desc:'읽은 것이 많아 잊는 법을 잊었다.',
                start:'tower',  goal:{ id:'g_mage',   text:'탑 꼭대기의 문장을 끝까지 읽는다.', grade:3 } },
    scribe:   { name:'서기',     icon:'🖋', attr:'gaze',  desc:'적히지 않은 일은 일어나지 않은 일이다.',
                start:'temple', goal:{ id:'g_scribe', text:'지워진 연대기 한 줄을 복원한다.', grade:3 } },
    keeper:   { name:'묘지기',   icon:'⚰', attr:'gaze',  desc:'이름을 세는 것이 일이다.',
                start:'grave',  goal:{ id:'g_keeper', text:'이름 없는 무덤에 이름을 준다.', grade:2 } }
};

const EPIC_ATTR_NAME = { evade:'회피', break:'파괴', heal:'치유', luck:'행운',
                         sense:'감각', hide:'은신', bond:'연결', gaze:'응시' };
const EPIC_ATTR_ICON = { evade:'✦', break:'✧', heal:'❋', luck:'✺',
                         sense:'◈', hide:'◐', bond:'⊙', gaze:'❂' };

// ==========================================
// 지도
// ==========================================
// open: 이 장소에 들어갈 수 있는 속성 (없으면 전원)
const EPIC_PLACES = {
    gate:    { name:'무너진 성문', icon:'🏛', risk:1, open:null,
               desc:'아치만 남았다. 들어온 자리이자 나가는 자리다.' },
    road:    { name:'끊긴 길',     icon:'🛤', risk:1, open:['bond','luck'],
               desc:'중간이 사라졌다. 사라진 자리에 안개가 고여 있다.' },
    village: { name:'빈 마을',     icon:'🏚', risk:2, open:null,
               desc:'사람이 없는데 굴뚝에서 연기가 난다.' },
    market:  { name:'열린 장터',   icon:'⚖', risk:2, open:['bond','luck','evade'],
               desc:'파는 사람은 있는데 사는 사람이 없다.' },
    forest:  { name:'검은 숲',     icon:'🌲', risk:3, open:['sense','hide','heal'],
               desc:'나무가 전부 같은 방향으로 기울어 있다.' },
    lake:    { name:'거울 호수',   icon:'🌊', risk:3, open:['luck','heal','gaze'],
               desc:'비친 하늘이 실제 하늘과 다르다.' },
    temple:  { name:'무너진 신전', icon:'⛪', risk:3, open:['heal','gaze'],
               desc:'제단은 깨졌는데 촛불은 켜져 있다.' },
    grave:   { name:'이름 없는 묘', icon:'⚰', risk:4, open:['hide','gaze'],
               desc:'비석이 전부 백지다. 깎인 게 아니라 원래 그랬다.' },
    ruin:    { name:'폐허 회랑',   icon:'🏚', risk:4, open:['break','evade','sense'],
               desc:'기둥이 서 있는데 지붕이 없다. 지붕이 있던 적도 없어 보인다.' },
    tower:   { name:'기울어진 탑', icon:'🗼', risk:5, open:['gaze','sense'],
               desc:'계단이 안쪽이 아니라 바깥으로 돈다.' },
    castle:  { name:'잠긴 성',     icon:'🏰', risk:5, open:['evade','hide','bond'],
               desc:'문이 안에서 잠겼다. 안에 아무도 없는데.' },
    deep:    { name:'■■■',        icon:'❓', risk:6, open:null, hidden:true,
               desc:'여기부터는 지도에 없다.' }
};

// 장소별 장면은 2차 파일에서 채운다
const EPIC_SCENES = {};

// ==========================================
// 진행 상태
// ==========================================
let er = null;

function epicIsHere() {
    return darkRun && darkRun.zone === EPIC_CODE;
}

function epicAttr() {
    return er && EPIC_JOBS[er.job] ? EPIC_JOBS[er.job].attr : null;
}

function epicCanEnter(key) {
    const p = EPIC_PLACES[key];
    if (!p) return false;
    if (p.hidden && !(er.flags && er.flags.deepFound)) return false;
    if (!p.open) return true;
    return p.open.includes(epicAttr());
}

// ==========================================
// 입장 — 직업 선택
// ==========================================
function epicStart(isParty, pid) {
    darkRun = {
        zone: EPIC_CODE, step: 0, modifier: 0, success: 0, fail: 0,
        carryEquips: [], carryItems: [], lostItems: [], log: [],
        isParty: !!isParty, partyId: pid || null,
        isLeader: false, counted: true, epic: true
    };
    er = {
        job: null, place: 'gate', idx: 0, moved: 0,
        score: 0, found: [], flags: {}, goalDone: false,
        helped: 0, danger: null, started: Date.now()
    };

    if (!isParty) {
        currentUser.darkDate = getTodayStr();
        currentUser.darkTries = (currentUser.darkTries || 0) + 1;
    }
    applyDarkSatiety(EPIC_CODE);
    saveFields({ darkDate:1, darkTries:1, satiety:1 });

    if (typeof clearDarkRunState === 'function') clearDarkRunState();
   
    darkAmbienceStart(EPIC_CODE);
    openDarkOverlay();
    const el = document.getElementById('dro-code');
    if (el) el.innerText = EPIC_CODE;

    epicJobPick();
}

function epicJobPick() {
    const taken = epicTakenJobs();
    const byAttr = {};
    Object.keys(EPIC_JOBS).forEach(k => {
        const j = EPIC_JOBS[k];
        (byAttr[j.attr] = byAttr[j.attr] || []).push(k);
    });

    const html = Object.keys(byAttr).map(a => `
        <div style="margin-bottom:11px;">
            <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:5px;">
                ${EPIC_ATTR_ICON[a]} ${EPIC_ATTR_NAME[a]}
                ${gearValue(currentUser, a) > 0 ? `<span style="color:#4CAF50; font-size:9px; margin-left:5px;">장비 보정 있음</span>` : ''}
            </div>
            ${byAttr[a].map(k => {
                const j = EPIC_JOBS[k];
                const dup = taken[k];
                return `
                    <button class="game-btn" style="width:100%; margin:0 0 6px 0; padding:10px; text-align:left; font-size:12px; font-weight:normal; ${dup ? 'opacity:0.35;' : ''}"
                        onclick="epicPickJob('${k}')" ${dup ? 'disabled' : ''}>
                        ${j.icon} <b>${j.name}</b>
                        <span style="font-size:10px; color:#888; margin-left:5px;">${dup ? '— ' + dup + ' 사원이 맡음' : j.desc}</span>
                    </button>`;
            }).join('')}
        </div>`).join('');

    darkBodyEl().innerHTML = darkBox('배역', DARK_ZONES[EPIC_CODE].intro +
        `<br><br><div style="border-top:1px dashed #333; padding-top:12px;">
            맡을 자리를 고른다.<br>
            <span style="font-size:11px; color:#888;">같은 자리는 둘이 맡을 수 없다. 자리마다 갈 수 있는 곳이 다르다.</span>
         </div>`,
        html, 'intro');
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicTakenJobs() {
    const out = {};
    if (!darkRun.isParty) return out;
    const p = darkParties[darkRun.partyId];
    const jobs = (p && p.epicJobs) || {};
    Object.keys(jobs).forEach(c => {
        if (c === currentUser.code) return;
        const nm = (p.members && p.members[c]) ? p.members[c].name : safeName(c);
        out[jobs[c]] = nm;
    });
    return out;
}

function epicPickJob(k) {
    if (!er || er.job) return;
    const j = EPIC_JOBS[k];
    if (!j) return;

    if (darkRun.isParty && database) {
        database.ref(`darkParties/${darkRun.partyId}/epicJobs`).transaction(cur => {
            cur = cur || {};
            if (Object.values(cur).includes(k) && cur[currentUser.code] !== k) return;
            cur[currentUser.code] = k;
            return cur;
        }).then(res => {
            if (!res.committed) { showCustomAlert('방금 다른 사원이 맡았습니다.'); epicJobPick(); return; }
            epicAfterJob(k);
        });
    } else {
        epicAfterJob(k);
    }
}

function epicAfterJob(k) {
    er.job = k;
    er.place = EPIC_JOBS[k].start;
    const j = EPIC_JOBS[k];
    darkRun.log.push(`[배역] ${j.name}`);
    if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원이 ${j.name}의 자리를 맡았습니다.`, true);

    darkBodyEl().innerHTML = darkBox('배역',
        `자리가 정해진다.<br><br>
         옷이 바뀐 것은 아니다. 다만 손이 무언가를 쥐던 모양으로 굳는다.<br><br>
         <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:6px; padding:14px; text-align:center;">
            <div style="font-size:30px; margin-bottom:8px;">${j.icon}</div>
            <div style="font-size:16px; color:#d4af37; font-weight:bold;">${j.name}</div>
            <div style="font-size:11px; color:#888; margin-top:4px;">${j.desc}</div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #5a4a2a; font-size:11px; color:#ccc;">
                ${EPIC_ATTR_ICON[j.attr]} <b>${EPIC_ATTR_NAME[j.attr]}</b> 쪽 일에 손이 익다.<br>
                <span style="font-size:10px; color:#888;">그 속성의 전용 장비가 있으면 유리하다.</span>
            </div>
         </div>
         <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-top:10px;">
            <div style="font-size:10px; color:var(--theme-focus); font-weight:bold; margin-bottom:5px;">◇ 하려던 일</div>
            <div style="font-size:12px; color:#ddd; line-height:1.7;">${j.goal.text}</div>
            <div style="font-size:10px; color:#888; margin-top:6px;">이루면 그 자리에서 빠져나올 수 있다. 더 머물러도 된다.</div>
         </div>`,
        epicBar() + darkChoiceBtn('걸음을 옮긴다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// ==========================================
// 상태 표시
// ==========================================
function epicBar() {
    if (!er) return '';
    const j = EPIC_JOBS[er.job];
    const p = EPIC_PLACES[er.place];
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#888; margin-bottom:10px; padding:7px 10px; background:rgba(0,0,0,0.3); border-radius:5px;">
            <span>${j ? j.icon + ' ' + j.name : ''} <span style="color:#555;">·</span> ${p ? p.icon + ' ' + p.name : ''}</span>
            <span style="color:var(--theme-focus); font-weight:bold;">${er.score.toLocaleString()} P</span>
        </div>
        ${er.goalDone ? `<div style="font-size:10px; color:#4CAF50; margin:-4px 0 10px 0;">◇ 하려던 일을 이뤘다. 언제든 나갈 수 있다.</div>` : ''}`;
}

// ==========================================
// 지도 — 갈림길
// ==========================================
function epicMap() {
    if (!er) return;
    epicWatchHelp();

        if (database) {
        database.ref('darkRuns/' + currentUser.code).set({
            zone: EPIC_CODE, step: 0, savedAt: Date.now(),
            success: darkRun.success, fail: darkRun.fail,
            log: darkRun.log.slice(-20), lostItems: [],
            isParty: !!darkRun.isParty, partyId: darkRun.partyId || null,
            epic: true
        });
    }

    const cur = EPIC_PLACES[er.place];
    const list = Object.keys(EPIC_PLACES).filter(k => k !== er.place && epicCanEnter(k));

    const help = epicHelpBanner();

    darkBodyEl().innerHTML = darkBox(cur.icon + ' ' + cur.name,
        `${cur.desc}<br><br>
         길이 여럿이다. 갈 수 있는 곳만 보인다.<br>
         <span style="font-size:11px; color:#888;">맡은 자리에 따라 열리는 길이 다르다.</span>`,
        epicBar() + help +
        `<button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:12px; background:linear-gradient(145deg,#3a2f18,#1c1608) !important; border-color:#5a4a2a !important; color:#d4af37 !important;" onclick="epicEnter()">${cur.icon} 이곳을 더 살핀다</button>
         <div style="font-size:10px; color:#666; margin-bottom:6px;">— 다른 곳으로 —</div>` +
        list.map(k => {
            const p = EPIC_PLACES[k];
            return `<button class="game-btn" style="width:100%; margin:0 0 6px 0; padding:10px; text-align:left; font-size:12px; font-weight:normal;" onclick="epicMove('${k}')">
                ${p.icon} ${p.name}
                <span style="font-size:10px; color:#888; margin-left:5px;">위험 ${'●'.repeat(p.risk)}</span>
            </button>`;
        }).join('') +
        (er.goalDone
            ? `<button class="game-btn" style="width:100%; margin:10px 0 0 0; padding:12px; background:linear-gradient(145deg,#2e7d32,#1b5e20) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="epicSettle('goal')">◇ 여기서 빠져나간다</button>`
            : ''),
        cur.img || null);
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicMove(k) {
    if (!er) return;
    er.place = k;
    er.moved++;
    er.idx = 0;
    darkRun.log.push(`[이동] ${EPIC_PLACES[k].name}`);
    epicMap();
}

// ==========================================
// 장소 진입 — 2차 파일이 채울 자리
// ==========================================
function epicEnter() {
    if (!er) return;
    const key = er.place;
    const set = EPIC_SCENES[key];

    if (!set || set.length === 0) { epicStub(); return; }

    const sc = set[er.idx % set.length];
    if (typeof sc === 'function') { sc(); return; }
    epicScene(sc);
}

// 아직 채우지 않은 장소 (임시 진행)
function epicStub() {
    const p = EPIC_PLACES[er.place];
    const j = EPIC_JOBS[er.job];
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus(j.attr);
    const dc = 8 + p.risk * 2;
    const ok = roll !== 1 && (roll + bonus) >= dc;

    if (ok) { er.score += 120 * p.risk; darkRun.success++; }
    else { darkRun.fail++; applyPollutionToUser(currentUser, p.risk); }

    // 목표 진척
    if (!er.goalDone && ok && j.goal && er.place === j.start && Math.random() < 0.35) {
        er.goalDone = true;
        er.score += j.goal.grade * 1500;
    }

    darkBodyEl().innerHTML = darkBox(p.icon + ' ' + p.name,
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>` +
        (ok
            ? `${j.name}의 눈으로 본다.<br><br>남들이 못 보는 게 보인다.<br>여기서 쓸 만한 것을 하나 챙겼다.`
            : `헛걸음이다.<br><br>여기는 ${j.name}의 자리가 아니다.<br>그걸 확인하는 데도 대가가 든다.`) +
        (er.goalDone ? `<br><br><span style="color:#4CAF50; font-weight:bold;">◇ 하려던 일을 이뤘다.</span>` : ''),
        epicBar() + darkChoiceBtn('물러난다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// 2차 파일이 쓰는 공용 장면 렌더
function epicScene(sc) {
    const p = EPIC_PLACES[er.place];
    darkBodyEl().innerHTML = darkBox(sc.title || (p.icon + ' ' + p.name), sc.text,
        epicBar() + (sc.opts || []).map((o, i) =>
            darkChoiceBtn(o.l, `epicPick(${i})`)).join(''),
        sc.img || null);
    er._sc = sc;
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicPick(i) {
    const sc = er._sc;
    if (!sc) return;
    const o = sc.opts[i];
    const j = EPIC_JOBS[er.job];

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus(o.kind || j.attr);
    const ok = roll !== 1 && (roll + bonus) >= (o.dc || 11);

    if (ok) { darkRun.success++; er.score += o.p || 150; }
    else { darkRun.fail++; if (o.poll) applyPollutionToUser(currentUser, o.poll); }

    if (o.flag) er.flags[o.flag] = true;
    if (o.goal && ok) { er.goalDone = true; er.score += j.goal.grade * 1500; }
    if (o.die && !ok) { epicDeath(o.dieTxt || '거기서 끝났다.'); return; }

    er.idx++;
    darkBodyEl().innerHTML = darkBox((sc.title || '') + ' — 결과',
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${o.dc || 11})</span></div>` +
        (ok ? o.good : o.bad) +
        (o.goal && ok ? `<br><br><span style="color:#4CAF50; font-weight:bold;">◇ 하려던 일을 이뤘다.</span>` : ''),
        epicBar() + darkChoiceBtn('계속한다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// ==========================================
// 동료 구조
// ==========================================
function epicCallHelp(reason) {
    if (!darkRun.isParty || !database) return false;
    const p = darkParties[darkRun.partyId];
    const others = p && p.alive ? Object.keys(p.alive).filter(c => c !== currentUser.code) : [];
    if (others.length === 0) return false;

    er.danger = { reason: reason, at: Date.now() };
    database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).set({
        name: currentUser.name,
        job: EPIC_JOBS[er.job].name,
        place: er.place,
        placeName: EPIC_PLACES[er.place].name,
        reason: reason,
        at: Date.now()
    });
    sendPartyChat(`⚠ ${currentUser.name} 사원이 ${EPIC_PLACES[er.place].name}에서 위험합니다.`, true);
    return true;
}

function epicWatchHelp() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (er._helpWatch) return;
    er._helpWatch = true;
    database.ref(`darkParties/${darkRun.partyId}/epicHelp`).on('value', snap => {
        er.help = snap.val() || {};
        const map = document.getElementById('epic-help-box');
        if (map) map.outerHTML = epicHelpBanner();
    });
}

function epicHelpBanner() {
    const list = Object.keys(er.help || {}).filter(c => c !== currentUser.code);
    if (list.length === 0) return `<div id="epic-help-box"></div>`;

    return `<div id="epic-help-box">` + list.map(c => {
        const h = er.help[c];
        const near = h.place === er.place;
        return `
            <div style="background:rgba(127,0,0,0.18); border:1px solid #b71c1c; border-radius:6px; padding:11px; margin-bottom:9px;">
                <div style="font-size:11px; color:#ff6b6b; font-weight:bold;">⚠ ${h.name} · ${h.job}</div>
                <div style="font-size:10px; color:#ccc; margin:4px 0 7px 0; line-height:1.6;">
                    ${h.placeName}에서 ${h.reason}<br>
                    ${near ? '<span style="color:#4CAF50;">같은 곳에 있다. 바로 갈 수 있다.</span>' : '<span style="color:#888;">달려가려면 한 번 움직여야 한다.</span>'}
                </div>
                <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important;" onclick="epicRescue('${c}')">달려간다</button>
            </div>`;
    }).join('') + `</div>`;
}

function epicRescue(code) {
    const h = (er.help || {})[code];
    if (!h) { epicMap(); return; }
    const j = EPIC_JOBS[er.job];
    const far = h.place !== er.place;

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('rejoin') + (j.attr === 'bond' ? 3 : 0) + Math.round(gearValue(currentUser, 'heal') * 8);
    const dc = (far ? 14 : 10) + (EPIC_PLACES[h.place] ? EPIC_PLACES[h.place].risk : 0);
    const ok = roll !== 1 && (roll + bonus) >= dc;

    if (far) { er.place = h.place; er.moved++; }

    if (ok) {
        er.helped++;
        er.score += 900;
        darkRun.success++;
        if (database) database.ref(`darkParties/${darkRun.partyId}/epicHelp/${code}`).remove();
        sendPartyChat(`${currentUser.name} 사원이 ${h.name} 사원을 붙잡았습니다.`, true);
    } else {
        darkRun.fail++;
        applyPollutionToUser(currentUser, 6);
    }

    darkBodyEl().innerHTML = darkBox('구조',
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>` +
        (ok
            ? `${far ? '달린다. 가는 동안 길이 몇 번 바뀌었다.<br><br>' : ''}도착했다.<br><br>
               ${h.name} 사원이 벽을 짚고 서 있다. 손톱이 몇 개 벗겨져 있다.<br>
               아무도 묻지 않았다.`
            : `${far ? '달린다. 길이 늘어난다.<br><br>' : ''}늦었다.<br><br>
               도착했을 때 그 자리에 아무도 없다.<br>
               자국은 있다. 자국만 있다.`),
        epicBar() + darkChoiceBtn('돌아선다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// 구조받은 쪽
function epicSaved() {
    if (!er) return;
    er.danger = null;
    if (database) database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).remove();
    darkBodyEl().innerHTML = darkBox('—',
        `누가 왔다.<br><br>
         이름을 부르지 않았다. 부를 힘이 없었을 것이다.<br>
         그냥 팔을 잡아 끌어냈다.<br><br>
         고맙다는 말은 나중에 하기로 한다. 나중이 있다면.`,
        epicBar() + darkChoiceBtn('일어선다.', 'epicMap()'));
}

// ==========================================
// 사망
// ==========================================
function epicDeath(txt) {
    if (!er || er.dead) return;

    // 동료가 있으면 한 번은 구조를 기다린다
    if (!er._calledHelp && epicCallHelp('쓰러졌습니다')) {
        er._calledHelp = true;
        darkBodyEl().innerHTML = darkBox('위험', txt +
            `<br><br><span style="color:#ff6b6b;">— 아직 끝나지 않았다.</span>`,
            epicBar() +
            `<div style="text-align:center; font-size:11px; color:#ff6b6b; padding:14px; background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px;">
                동료가 오기를 기다리는 중...<br>
                <span style="font-size:10px; color:#888;">아무도 오지 않으면 여기서 끝납니다.</span>
             </div>
             <button class="game-btn" style="width:100%; margin:12px 0 0 0; padding:11px; font-size:11px;" onclick="epicGiveUp()">기다리지 않는다.</button>`);

        // 구조 수신 감시
        if (database) {
            database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).on('value', s => {
                if (!er || er.dead) return;
                if (!s.val() && er._calledHelp) {
                    database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).off();
                    epicSaved();
                }
            });
        }
        setTimeout(() => { if (er && er._calledHelp && !er.dead) epicGiveUp(); }, 90000);
        return;
    }

    er.dead = true;
    darkRun.fail += 2;

    // ★ 행운 — 일부 보존
    const luckRate = gearValue(currentUser, 'luck');
    const saved = luckRate > 0 && Math.random() < luckRate;
    let lostPoints = 0;

    if (saved) {
        const keepRatio = 0.30 + Math.random() * 0.15;
        const kept = Math.floor(currentUser.points * keepRatio);
        lostPoints = currentUser.points - kept;
        currentUser.points = kept;
        er.luckSaved = true;
    } else {
        lostPoints = currentUser.points;
        currentUser.points = 0;
    }

    const lostItems = [];
    [].concat(darkRun.carryEquips || [], darkRun.carryItems || []).forEach(it => {
        removeItemFromInventory(currentUser, it, 1);
        lostItems.push(it);
    });

    er.lostPoints = lostPoints;
    er.lostItems = lostItems;

    // 상담실 · 선녀탕 이송
    currentUser.pollution = 100;
     currentUser.quarantineUntil = Date.now() + (2 * 60 * 60 * 1000);
     currentUser.quarantineHospital = true;
    currentUser.quarantineExitPollution = 40;
    currentUser.foxRoomAnswered = true;
    appendBadgeNoteToUser(currentUser, `[${EPIC_CODE}] 탐사 중 의식 불명 — 긴급 이송됨`);

    addHistoryLog(currentUser, `[${EPIC_CODE}] 쓰러짐. 포인트 ${lostPoints.toLocaleString()} P 소실${lostItems.length ? ' · 반입품 ' + lostItems.join(', ') + ' 소실' : ''}`);
    saveSelfFull();

    if (database && darkRun.isParty) {
        database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).remove();
        database.ref(`darkParties/${darkRun.partyId}/alive/${currentUser.code}`).remove();
        sendPartyChat(`${currentUser.name} 사원의 소식이 끊겼습니다.`, true);
    }

    epicSettle('dead', txt);
}

function epicGiveUp() {
    if (!er) return;
    er._calledHelp = false;
    er.dead = false;
    epicDeath('더 버티지 못했다.');
}

// ==========================================
// 정산
// ==========================================
function epicSettle(how, txt) {
    if (!er || er._settled) return;
    er._settled = true;

    const j = EPIC_JOBS[er.job];
    let total = 300 + er.score;

    // 가산
    total += er.moved * 60;
    total += er.helped * 900;
    total += (er.found || []).length * 400;
    if (er.goalDone) total += 2000;
    if (er.flags && er.flags.deepFound) total += 3000;

    // 오래 남을수록
    const mins = Math.floor((Date.now() - er.started) / 60000);
    total += Math.min(3000, mins * 50);

    if (how === 'dead') total = Math.floor(total * 0.35);
    total = Math.max(300, Math.min(25000, Math.round(total)));

    changePoints(total);
    addHistoryLog(currentUser, `[${EPIC_CODE}] ${j.name}으로 ${how === 'dead' ? '쓰러짐' : '귀환'} (+${total.toLocaleString()} P)`);
    bankAddScore(how === 'dead' ? -5 : 12);

    if (!currentUser.darkLogs) currentUser.darkLogs = [];
    currentUser.darkLogs.unshift({
        date: new Date().toLocaleString(), zone: EPIC_CODE, zoneName: DARK_ZONES[EPIC_CODE].name,
        reward: total, success: darkRun.success, fail: darkRun.fail,
        loot: er.found || [], lost: [], detail: darkRun.log,
        died: how === 'dead', party: !!darkRun.isParty
    });
    if (currentUser.darkLogs.length > 15) currentUser.darkLogs.pop();
    saveFields({ history:1, darkLogs:1 });

    darkBodyEl().innerHTML = darkBox(how === 'dead' ? '종료' : '귀환',
        (txt ? txt + '<br><br>' : '') +
        (how === 'dead' ? '' : DARK_ZONES[EPIC_CODE].outro),
        `<div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:6px; padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">
            <div style="font-weight:bold; color:var(--theme-focus); margin-bottom:8px; border-bottom:1px dashed #444; padding-bottom:6px;">[정산]</div>
            맡은 자리 <b>${j.icon} ${j.name}</b><br>
            하려던 일 <b style="color:${er.goalDone ? '#4CAF50' : '#888'};">${er.goalDone ? '이룸' : '이루지 못함'}</b><br>
            지나온 곳 <b>${er.moved}</b>곳 · 머문 시간 <b>${mins}</b>분<br>
            ${er.helped ? `붙잡은 동료 <b style="color:#4CAF50;">${er.helped}</b>명<br>` : ''}
                       ${how === 'dead' ? `
                <div style="margin-top:6px; padding-top:6px; border-top:1px dashed #7f0000; color:#f44336;">
                    보유 포인트 <b>-${(er.lostPoints || 0).toLocaleString()} P</b> (전액 소실)<br>
                    ${(er.lostItems || []).length ? `반입품 <b>${er.lostItems.join(', ')}</b> 소실<br>` : `<span style="color:#aaa;">반입한 물품이 없어 소실 없음</span><br>`}
                    ${er.luckSaved ? `<span style="color:#4CAF50;">✺ 행운 — 일부를 지켜냈습니다.</span><br>` : ''}
                    오염도 <span style="color:#ff9800;">100%</span>
                    <div style="margin-top:6px; color:#d4af37;">
                        🦊 상담실로 긴급 이송됩니다.<br>
                        <span style="font-size:10px; color:#aaa;">회복 예상 시간 2시간 (퇴원 시 오염도 40%)</span>
                    </div>
                </div>` : ''}
            <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #444;">
                지급 <b style="color:#ffd700; font-size:14px;">+${total.toLocaleString()} P</b>
            </div>
         </div>` +
        darkChoiceBtn('단말로 복귀한다.', 'epicFinish()'));
    showPointGainEffect(total);
}

function epicFinish() {
    const pid = darkRun ? darkRun.partyId : null;
    closeDarkOverlay();
    darkAmbienceStop();
    detachChatListener();
    if (pid && database) {
        try { database.ref(`darkParties/${pid}/epicHelp`).off(); } catch (e) {}
        partyRunCleanup(pid, EPIC_CODE);
    }

        if (typeof clearDarkRunState === 'function') clearDarkRunState();
    else if (database) database.ref('darkRuns/' + currentUser.code).remove();


    er = null;
    darkRun = null;
    updateUI();
    renderDarkness();
        hasShownFoxAlert = false;
    currentUser.foxRoomAnswered = false;
    currentUser.quarantineUntil = currentUser.quarantineUntil || 0;
    setTimeout(() => { if (currentUser.pollution >= 100) startFoxRoomSequence(); }, 600);
}

// ==========================================
// 연결
// ==========================================
(function hookEpic() {
    // 진행 분기
    const _renderDarkStep = renderDarkStep;
    renderDarkStep = function () {
        if (darkRun && darkRun.zone === EPIC_CODE) {
            if (!er) { epicStart(darkRun.isParty, darkRun.partyId); return; }
            if (!er.job) { epicJobPick(); return; }
            epicMap();
            return;
        }
        return _renderDarkStep.apply(this, arguments);
    };

    // 입구
    const _renderDarkness = renderDarkness;
    renderDarkness = function () {
        const r = _renderDarkness.apply(this, arguments);
        const body = document.getElementById('darkness-body');
        if (!body || darkRun) return r;
        if (document.getElementById('epic-entry')) return r;
        if (!isZoneOpen(EPIC_CODE)) return r;

        body.insertAdjacentHTML('afterbegin', `
            <div id="epic-entry" style="background:linear-gradient(145deg,#1e1a14,#141110); border:1px solid #5a4a2a; border-radius:8px; padding:14px; margin-bottom:14px; text-align:left;">
                <div style="font-family:monospace; font-size:11px; color:#d4af37; font-weight:bold;">${EPIC_CODE}</div>
                <div style="font-size:15px; color:#fff; font-weight:bold; margin:4px 0;">${DARK_ZONES[EPIC_CODE].name}</div>
                <div style="font-size:10px; color:#999; line-height:1.6;">${DARK_ZONES[EPIC_CODE].brief}</div>
                <div style="font-size:10px; color:#777; margin-top:6px;">1~24인 · 자리 24종 · 보상 300~25,000 P</div>
                <div style="font-size:10px; color:#ff6b6b; margin-top:4px;">※ 쓰러지면 보유 포인트 전액과 반입품이 소멸하고 상담실로 이송됩니다.</div>
                <div style="display:flex; gap:6px; margin-top:11px;">
                    <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="epicSoloEnter()">혼자 들어간다</button>
                    <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="createParty('${EPIC_CODE}')">일행을 모은다</button>
                </div>
            </div>`);
        return r;
    };
})();

function epicSoloEnter() {
    if (darkRun) return;
    if (getDarkTriesLeft() <= 0) { showCustomAlert('금일 탐사 횟수를 모두 소진했습니다.'); return; }
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 들어갈 수 없습니다.'); return; }
    if (currentUser.pollution >= 100) { showCustomAlert('오염도가 한계치라 들어갈 수 없습니다.'); return; }
    epicStart(false, null);
}
;
