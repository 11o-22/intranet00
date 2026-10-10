// ==========================================
// ★ 사원 열람 — 테두리 크기를 맞추고, 새는 빛을 가둔다
// bundles.json 마지막 묶음 맨 끝 (규칙이 제일 나중에 깔려야 이긴다)
// ==========================================
//
// ■ 1. 칸마다 크기가 달랐다
//
//   테두리는 저마다 제 두께를 쓴다. 재 보니 이랬다 —
//
//       두께 0px   영상 테두리 열 종 (v01~v10)
//       두께 2px   마흔한 종
//       두께 3px   여덟 종
//       두께 4px   한 종 (d08)
//
//   칸 바깥 폭은 420px 로 같은데 두께가 다르니 **글자가 들어갈 속 폭**이
//   388 · 392 · 394 · 398 로 벌어졌다. 그 10px 때문에 어떤 칸은 소속이
//   한 줄에 들어가고 어떤 칸은 두 줄로 넘어가, 칸 높이까지 달라졌다.
//   테두리가 없는 칸은 또 따로 놀았다 (안쪽 여백 12px · 두께 1px).
//
//   여기서 넷을 한 값으로 못 박는다 — 두께 2px · 안쪽 여백 11px ·
//   바깥 여백 같게 · box-sizing 은 테두리를 포함하게.
//   테두리가 있든 없든 속 폭이 같아진다.
//
// ■ 2. 빛이 칸 밖으로 새어 가로 스크롤이 출렁였다
//
//   「룬 문양」(A · fr-n02)과 「■■의 ■■■」(S · fr-s01)은 칸 안에서
//   도는 부채꼴 빛을 쓴다. 그 층은 inset:-55% · -60% 로 칸보다 훨씬
//   크게 깔아 두고, 대신 제 규칙에 overflow:hidden 을 달아 가둬 두었다.
//
//   그런데 frames-fix.js 가 「빛이 잘리지 않게」 하려고
//
//       .fr-wrap { overflow: visible; }
//
//   를 나중에 깔았다. 명시도가 같고 뒤에 오므로 이게 이긴다. 가둬 두려던
//   것이 풀려 버렸다. 재 보니 칸은 416px 인데 안쪽이 664px 까지 뻗었고,
//   그 빛이 도는 동안 문서 가로 폭이 430 ↔ 673 사이를 오갔다.
//   그래서 가로 스크롤이 늘었다 줄었다 했다.
//
//   테두리 칸은 다시 가둔다. 칸 **바깥**으로 퍼지는 빛(box-shadow)은
//   제 칸의 overflow 에 안 걸리므로 그대로 보인다. 잘리는 것은 칸 안에
//   깔아 둔 층뿐이다 — 애초에 가두려던 그것이다.

(function frameSize() {

const FRAME_SIZE = {
    border: 2,      // 테두리 두께 (px)
    pad: 11,        // 안쪽 여백 (px)
    gapX: 3,        // 좌우 바깥 여백
    gapB: 9         // 아래 바깥 여백
};
window.FRAME_SIZE = FRAME_SIZE;

function css(o) {
    const c = Object.assign({}, FRAME_SIZE, o || {});
    return `
/* --- 1. 사원 열람 칸을 전부 같은 크기로 --- */
#employee-cards-container .emp-list-card,
#employee-cards-container .emp-list-card.fr-wrap {
    box-sizing: border-box !important;
    border-width: ${c.border}px !important;
    border-style: solid !important;
    padding: ${c.pad}px !important;
    margin: 0 ${c.gapX}px ${c.gapB}px ${c.gapX}px !important;
}

/* --- 2. 칸 안에 깔아 둔 빛은 칸 안에서만 --- */
#employee-cards-container .emp-list-card.fr-wrap,
#history-list-container .history-item.fr-wrap {
    overflow: hidden !important;
}
`;
}

// 자리는 들고 있는다. getElementById 를 거치면 못 찾는 자리가 있다.
let ST = null;
function apply(o) {
    if (!ST || !ST.isConnected) {
        ST = document.createElement('style');
        ST.id = 'frame-size-css';
    }
    const t = css(o);
    if (ST.textContent !== t) ST.textContent = t;
    // 늘 맨 끝에 — 나중에 깔린 규칙이 이긴다
    const head = document.head || document.documentElement;
    if (head.lastElementChild !== ST) head.appendChild(ST);
}
apply();
setInterval(function () { try { apply(); } catch (e) { } }, 4000);

// ==========================================
// 3. 테두리를 아예 안 두르는 것들 — 여백으로 메운다
// ==========================================
//
//   영상 테두리(v01~)는 고리를 캔버스로 그리므로 border 를 일부러 없앤다.
//
//       #employee-cards-container .emp-list-card.fr-v01.fr-wrap {
//           border: none !important;
//       }
//
//   명시도가 (1,3,0) 이라 위의 (1,2,0) 규칙이 못 이긴다. 억지로 이겨
//   선을 그으면 캔버스 고리와 두 줄이 되니, 대신 **없는 두께만큼 안쪽
//   여백을 더해** 속 폭을 맞춘다. 두께를 글로 못 박지 않고 그때그때
//   재서 메우므로, 나중에 어떤 테두리가 들어와도 저절로 맞는다.
function fit() {
    const box = document.getElementById('employee-cards-container');
    if (!box || !box.offsetParent) return;          // 안 보이면 아무것도 안 한다
    const cards = box.querySelectorAll('.emp-list-card');
    if (!cards.length) return;
    for (let i = 0; i < cards.length; i++) {
        const el = cards[i];
        const bw = parseFloat(getComputedStyle(el).borderTopWidth) || 0;
        const pad = Math.max(0, Math.round(FRAME_SIZE.pad + FRAME_SIZE.border - bw));
        const want = pad + 'px';
        if (el.style.getPropertyValue('padding') !== want) {
            el.style.setProperty('padding', want, 'important');
        }
    }
}
setInterval(function () { try { fit(); } catch (e) { } }, 1200);
['renderEmployeeCards', 'openEmployeeListModal'].forEach(function (n) {
    const iv = setInterval(function () {
        if (typeof window[n] !== 'function') return;
        if (window[n]._frSize) { clearInterval(iv); return; }
        const _f = window[n];
        const w = function () { const r = _f.apply(this, arguments); setTimeout(fit, 60); return r; };
        w._frSize = true; window[n] = w; clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 20000);
});

// ==========================================
// 확인 · 조절
//   frameSizeState()                   지금 칸들이 정말 같은 크기인가
//   frameSize({ border:3, pad:12 })    바꿔 보기
// ==========================================
window.frameSize = function (o) {
    if (o === 'off') { if (ST) ST.textContent = ''; return; }
    if (o && typeof o === 'object') Object.assign(FRAME_SIZE, o);
    if (ST) ST.textContent = '';
    apply();
    console.log('%c✓ 테두리 크기 ' + JSON.stringify(FRAME_SIZE), 'color:#4CAF50');
};

window.frameSizeState = function () {
    const box = document.getElementById('employee-cards-container');
    if (!box) { console.log('사원 열람을 먼저 열어 주십시오.'); return; }
    const rows = [];
    const outs = {}, ins = {};
    let spill = 0;
    box.querySelectorAll('.emp-list-card').forEach(function (el) {
        const cs = getComputedStyle(el);
        const w = Math.round(el.getBoundingClientRect().width);
        const inner = Math.round(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
        outs[w] = (outs[w] || 0) + 1;
        ins[inner] = (ins[inner] || 0) + 1;
        if (el.scrollWidth > el.clientWidth + 2) spill++;
        rows.push({ 테두리: (el.className.match(/fr-([a-z0-9]+)/) || [, '없음'])[1],
                    바깥폭: w, 속폭: inner, 두께: cs.borderTopWidth, 넘침: el.scrollWidth - el.clientWidth });
    });
    console.log('%c===== 사원 열람 칸 =====', 'color:#d4af37; font-size:13px');
    console.log('  칸 수        :', rows.length);
    console.log('  바깥 폭 종류 :', Object.keys(outs).join(', ') + (Object.keys(outs).length === 1 ? '  ✓' : '  ← 제각각'));
    console.log('  속 폭 종류   :', Object.keys(ins).join(', ') + (Object.keys(ins).length === 1 ? '  ✓' : '  ← 제각각'));
    console.log('  밖으로 새는 칸:', spill ? spill + '개  ← 가로 스크롤이 출렁입니다' : '없음  ✓');
    console.log('  문서 가로 폭 :', document.documentElement.scrollWidth, '/ 창', window.innerWidth,
        document.documentElement.scrollWidth > window.innerWidth + 2 ? ' ← 가로로 넘칩니다' : '  ✓');
    if (rows.length <= 40) console.table(rows);
};

console.log('[테두리] 사원 열람 칸 크기 맞춤 · 새는 빛 가둠 — frameSizeState()');

})();
