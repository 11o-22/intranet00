// ==========================================
// ★ 영상 테두리 — L등급
// index.html 에서 frames-img.js 다음에 불러온다
// ==========================================
//
// 검은 바탕 영상을 mix-blend-mode:screen 으로 덮는다.
// 검은 부분이 사라지고 번개만 남는다.
//
// 영상은 무겁다. 아무 데나 깔면 화면이 버벅인다.
// 그래서 기본은 사원증 사진과 사원 카드에만 켠다.
// where 를 고치면 범위가 바뀐다.

const VIDEO_FRAMES = [
    {
        id: 'v01', g: 'L', n: '뇌명',
        src: 'frames/lightning.webm',
        poster: '',                     // 첫 장면 그림 (없어도 된다)
        opacity: 0.95,
        border: '2px solid rgba(90,200,255,0.55)',
        bg: '#02080e',
        // 어디에 틀 것인가
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card']
    }
];

(function addVideoFrames() {
    if (typeof FRAMES === 'undefined') {
        console.warn('[영상테두리] frames.js 가 먼저 올라와야 합니다.');
        return;
    }

    // --- 표에 넣는다 ---
    const have = new Set(FRAMES.map(f => f.id));
    let added = 0;
    VIDEO_FRAMES.forEach(function (f) {
        if (have.has(f.id)) return;
        FRAMES.push({ id: f.id, g: f.g, n: f.n, c: '' });
        added++;
    });

    // --- 바탕 규칙 ---
    const SCOPE = [
        '', 'html body ',
        'body[data-ui-skin] #app-container ',
        'body[data-ui-skin] .modal-overlay ',
        'body[data-ui-skin] #custom-alert-overlay ',
        'body[data-ui-skin] #luxury-alert-overlay ',
        'body[data-ui-skin] #vip-invite-overlay ',
        'body[data-ui-skin] #fox-nameplate-overlay '
    ];

    let css = `
.fv-layer {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    mix-blend-mode: screen !important;
    pointer-events: none !important;
    z-index: 0 !important;
    border-radius: 6px;
}
`;
    VIDEO_FRAMES.forEach(function (f) {
        const sel = SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap').join(',\n');
        css += `
${sel} {
    position: relative !important;
    border: ${f.border} !important;
    border-radius: 7px !important;
    overflow: hidden !important;
    background-color: ${f.bg} !important;
}
`;
        css += SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap > *:not(.fv-layer)').join(',\n')
            + ' { position: relative !important; z-index: 2 !important; }\n';
        css += SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap .fv-layer').join(',\n')
            + ` { opacity: ${f.opacity} !important; }\n`;
    });

    const st = document.createElement('style');
    st.id = 'frame-video-css';
    st.textContent = css;
    document.head.appendChild(st);

    // --- 영상 심기 ---
    function plant() {
        VIDEO_FRAMES.forEach(function (f) {
            // 이 테두리를 쓰는 칸 중, 허용된 자리만
            document.querySelectorAll('.fr-' + f.id + '.fr-wrap').forEach(function (el) {
                const ok = f.where.some(function (s) {
                    return el.matches(s) || el.closest(s);
                });
                if (!ok) return;
                if (el.querySelector('.fv-layer')) return;

                const v = document.createElement('video');
                v.className = 'fv-layer';
                v.src = f.src;
                if (f.poster) v.poster = f.poster;
                v.autoplay = true;
                v.loop = true;
                v.muted = true;
                v.defaultMuted = true;
                v.playsInline = true;
                v.setAttribute('muted', '');
                v.setAttribute('playsinline', '');
                v.setAttribute('webkit-playsinline', '');
                v.preload = 'auto';
                el.insertBefore(v, el.firstChild);
                v.play().catch(function () { /* 자동 재생이 막히면 조용히 넘긴다 */ });
            });

            // 테두리가 바뀌었으면 영상을 뗀다
            document.querySelectorAll('.fv-layer').forEach(function (v) {
                const host = v.parentElement;
                if (!host) return;
                if (!host.classList.contains('fr-' + f.id)) {
                    v.pause();
                    v.remove();
                }
            });
        });
    }

    setInterval(plant, 1200);
    setTimeout(plant, 800);

    // 다른 곳에 갔다 오면 다시 튼다
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) return;
        document.querySelectorAll('.fv-layer').forEach(function (v) {
            v.play().catch(function () { });
        });
    });

    console.log('[영상테두리] ' + added + '종 추가 — 전체 ' + FRAMES.length + '종');

    // 파일이 있는지 본다
    VIDEO_FRAMES.forEach(function (f) {
        fetch(f.src, { method: 'HEAD' }).then(function (r) {
            if (r.ok) {
                const kb = Math.round((r.headers.get('content-length') || 0) / 1024);
                console.log('  ✓ ' + f.n + ' — ' + f.src + (kb ? ' (' + kb + ' KB)' : ''));
            } else {
                console.warn('  ✗ ' + f.n + ' — ' + f.src + ' 응답 ' + r.status);
            }
        }).catch(function () {
            console.warn('  ✗ ' + f.n + ' — ' + f.src + ' 을(를) 못 찾았습니다.');
        });
    });
})();

// 확인
function videoFrameState() {
    console.log('%c===== 영상 테두리 =====', 'color:#5ac8ff; font-size:13px');
    console.table(VIDEO_FRAMES.map(function (f) {
        return { 번호: f.id, 등급: f.g, 이름: f.n, 파일: f.src, 자리: f.where.join(' · ') };
    }));
    const on = document.querySelectorAll('.fv-layer');
    console.log('  지금 도는 영상:', on.length + '개');
    on.forEach(function (v, i) {
        console.log('   ' + (i + 1) + '. ' + (v.paused ? '멈춤' : '재생 중') +
            ' · ' + (v.readyState >= 3 ? '준비됨' : '받는 중'));
    });
    if (on.length > 6) console.warn('  영상이 여섯 개를 넘으면 화면이 버벅일 수 있습니다.');
}