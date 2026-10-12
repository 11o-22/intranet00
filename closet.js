// ==========================================
// ★ 👗 사택 옷장 — 마네킹 앞에서 옆으로 눌러 고른다
// bundles.json 마지막 묶음, save-merge.js 앞
// ==========================================
//
// ■ 그림이 어떻게 생겼나
//
//   dot/ 안의 장들은 모두 **1248 x 512 픽셀** 한 장이고, 한 칸이
//   **208 x 256 픽셀**로 6칸 x 2줄이다. 도트 한 칸은 4픽셀이다.
//
//       윗줄   걷기 여섯 칸 (광장에서 쓴다)
//       아랫줄 서기 여섯 칸 (옷장 마네킹에서 쓴다)
//
//   원래 받은 그림은 한 칸이 144 였는데, 코트 자락이 칸 밖으로 여덟 도트
//   삐져나가 **다음 칸에 남의 자락이 묻어 보였다.** 그래서 스물한 장을
//   모두 208 로 다시 깔았다. 그림은 한 점도 안 고치고 칸 안에서 똑같이
//   여섯 도트씩 밀기만 했으므로, 겹쳐도 그대로 맞물린다.
//
// ■ 겹치는 차례 — 몸 다음에 머리
//
//   ★ 「옷」은 덧입히는 것이 아니라 **몸을 통째로 바꾸는 것**이다.
//     coat.png 안에 몸까지 함께 그려져 있기 때문이다. 그래서 옷을 고르면
//     몸판 자체가 바뀐다. 머리만 그 위에 얹는다.
//
//       맨몸   body.png        + 머리
//       코트   coat.png        + 머리
//       브라운 body-brown.png  + h-brown   ← 이 둘은 반드시 짝이다
//
//   브라운은 몸이 따로 있다. 머리를 브라운으로 고르면 몸도 같이 바뀌고,
//   브라운이 아닌 머리를 고르면 몸도 같이 돌아온다. 옷은 못 갈아입는다.
//
// ■ 움직임
//
//   세 가지가 따로 돈다. 한 숫자로 같이 돌리면 안 된다.
//
//     머리  여섯 칸이 눈 깜빡임이다 (0=1=5 뜸 · 2=4 반 · 3 감음).
//           오래 뜨고 잠깐 감게 칸마다 머무는 시간을 달리 둔다.
//     몸    서기 여섯 칸이 전부 같은 그림이라 0 에 세워 둔다.
//     코트  서기 줄의 **짝수 칸(0·2·4)만** 코트가 있다. 홀수 칸에는
//           코트가 아예 없어서, 같이 돌리면 코트가 깜빡 사라진다.
//           그래서 짝수 칸만 돌린다.
//
// ■ 밖에서 쓰는 것 (광장이 이걸 그대로 쓴다)
//
//       dotLook(u)              고른 것을 풀어 준다 {head, wear, body}
//       dotSprite(u, 설정)      그 모습이 든 칸을 만들어 준다
//         설정 = { pose:'stand'|'walk', scale:1, live:true }
//       dotStop(칸)             움직임을 멈춘다 (칸을 지우기 전에)
//
// ■ 콘솔
//       closetState()   지금 고른 것
//       closetAll()     있는 머리·옷을 전부 늘어놓고 본다

const DOT = {
    DIR: 'dot/',
    W: 208, H: 256,            // 한 칸
    SHEET_W: 1248, SHEET_H: 512,
    BODY: 'body', BROWN_BODY: 'body-brown', BROWN_HEAD: 'h-brown',
    BLINK: [1900, 110, 110, 110, 110, 110],   // 머리 칸마다 머무는 시간
    FLAP: 260,                                 // 코트 나부끼는 빠르기
    WALK: 120                                  // 걷는 빠르기 (광장에서 쓴다)
};

// 머리 — 이름은 제가 보고 붙인 것이라 마음에 안 드시면 여기만 고치면 됩니다
const DOT_HEADS = [
    { i: 'h01', n: '은발 · 노란 눈' },
    { i: 'h02', n: '연보라 · 붉은 눈' },
    { i: 'h03', n: '검은머리 · 푸른 눈' },
    { i: 'h04', n: '갈색 긴머리' },
    { i: 'h05', n: '갈색 · 선글라스' },
    { i: 'h06', n: '갈색 · 푸른 눈' },
    { i: 'h07', n: '검은머리 · 안경' },
    { i: 'h08', n: '남색 올림머리' },
    { i: 'h09', n: '갈색 · 선글라스 2' },
    { i: 'h10', n: '금발 · 주황 눈' },
    { i: 'h11', n: '보라 묶음머리' },
    { i: 'h12', n: '검은머리 · 붉은 눈' },
    { i: 'h13', n: '검은 긴머리' },
    { i: 'h14', n: '검은 긴머리 · 안경' },
    { i: 'h15', n: '남보라 · 청록 눈' },
    { i: 'h16', n: '검은머리 · 노란 눈' },
    { i: 'h17', n: '회청 땋은머리' },
    { i: 'h-brown', n: '브라운', solo: true }   // solo — 전용 몸과 짝, 옷을 못 입는다
];

// 옷 = 몸판
const DOT_WEARS = [
    { i: '', n: '맨몸', body: 'body' },
    { i: 'coat', n: '코트', body: 'coat' }
];

(function closet() {

const D = DOT;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function headAt(i) { return DOT_HEADS[((i % DOT_HEADS.length) + DOT_HEADS.length) % DOT_HEADS.length]; }
function wearAt(i) { return DOT_WEARS[((i % DOT_WEARS.length) + DOT_WEARS.length) % DOT_WEARS.length]; }
function headIdx(id) { const k = DOT_HEADS.findIndex(function (h) { return h.i === id; }); return k < 0 ? 0 : k; }
function wearIdx(id) { const k = DOT_WEARS.findIndex(function (w) { return w.i === (id || ''); }); return k < 0 ? 0 : k; }

// ==========================================
// 고른 것을 풀어 준다
// ==========================================
//
//   브라운은 몸이 따로다. 머리가 브라운이면 옷은 무시하고 전용 몸을 쓴다.
//   거꾸로 브라운이 아닌데 전용 몸이 적혀 있으면 그것도 무시한다.
//   어느 쪽으로 어긋나 있어도 **보이는 모습은 늘 말이 되게** 맞춰 준다.
function look(user) {
    const u = user || u_() || {};
    const d = u.dot || {};
    const head = DOT_HEADS.some(function (h) { return h.i === d.head; }) ? d.head : DOT_HEADS[0].i;
    if (head === D.BROWN_HEAD) return { head: head, wear: '', body: D.BROWN_BODY, solo: true };
    const w = DOT_WEARS[wearIdx(d.wear)];
    return { head: head, wear: w.i, body: w.body, solo: false };
}
window.dotLook = look;

// ==========================================
// 모습이 든 칸을 만든다
// ==========================================
function layer(sheet) {
    const el = document.createElement('div');
    el.className = 'dot-layer';
    el.style.backgroundImage = 'url("' + D.DIR + sheet + '.png")';
    return el;
}

function sprite(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const pose = o.pose === 'walk' ? 'walk' : 'stand';
    const L = look(user);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const body = layer(L.body), head = layer(L.head);
    box.appendChild(body); box.appendChild(head);
    [body, head].forEach(function (el) {
        el.style.backgroundSize = (D.SHEET_W * k) + 'px ' + (D.SHEET_H * k) + 'px';
    });

    const row = (pose === 'walk') ? 0 : 1;
    const put = function (el, col) {
        el.style.backgroundPosition = '-' + (col * D.W * k) + 'px -' + (row * D.H * k) + 'px';
    };
    put(body, 0); put(head, 0);

    box._dot = { body: body, head: head, row: row, k: k, L: L, timers: [] };
    if (o.live === false) return box;

    if (pose === 'walk') {
        // 걷기 — 몸과 머리가 같은 칸으로 간다
        let f = 0;
        box._dot.timers.push(setInterval(function () {
            f = (f + 1) % 6; put(body, f); put(head, f);
        }, D.WALK));
    } else {
        // 서기 — 몸은 세워 두고, 머리는 깜빡이고, 코트만 나부낀다
        let f = 0;
        const blink = function () {
            put(head, f);
            const ms = D.BLINK[f];
            f = (f + 1) % 6;
            box._dot.timers.push(setTimeout(blink, ms));
        };
        blink();
        if (L.body === 'coat') {
            let g = 0;
            box._dot.timers.push(setInterval(function () {
                g = (g + 1) % 3; put(body, g * 2);     // 0 · 2 · 4 — 코트가 있는 칸만
            }, D.FLAP));
        }
    }
    return box;
}
window.dotSprite = sprite;

function stop(box) {
    if (!box || !box._dot) return;
    box._dot.timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    box._dot.timers = [];
}
window.dotStop = stop;

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('closet-css')) return;
    const s = document.createElement('style');
    s.id = 'closet-css';
    s.textContent = [
        '.dot-box{position:relative;margin:0 auto;}',
        '.dot-layer{position:absolute;inset:0;background-repeat:no-repeat;',
        '  image-rendering:pixelated;image-rendering:crisp-edges;}',
        '#closet-stage{position:relative;padding:14px 0 0 0;text-align:center;',
        '  background:linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.12));',
        '  border:1px solid var(--theme-border,#4a5160);border-radius:8px;overflow:hidden;}',
        '#closet-floor{height:12px;margin-top:-6px;',
        '  background:radial-gradient(ellipse at 50% 0,rgba(0,0,0,0.55),rgba(0,0,0,0) 70%);}',
        '.closet-row{display:flex;align-items:center;gap:8px;margin-top:10px;}',
        '.closet-row .lab{width:38px;font-size:10px;color:#9a948a;text-align:left;flex:none;}',
        '.closet-row .mid{flex:1;text-align:center;font-size:12px;color:var(--theme-text,#e8e4da);',
        '  background:rgba(0,0,0,0.25);border:1px solid var(--theme-border,#4a5160);',
        '  border-radius:5px;padding:9px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.closet-row .mid .num{font-size:9px;color:#8d8578;margin-left:6px;}',
        '.closet-arrow{flex:none;width:44px;padding:10px 0;font-size:14px;}',
        '.closet-arrow:disabled{opacity:0.3;}',
        '#closet-note{font-size:10px;color:#8d8578;margin-top:9px;line-height:1.6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 옷장 화면
// ==========================================
let pick = null;            // 지금 고르는 중인 것 {head, wear}
let stage = null;           // 마네킹 칸
let saveT = null;

function cur() {
    const u = u_(); if (!u) return { head: DOT_HEADS[0].i, wear: '' };
    if (!pick) { const L = look(u); pick = { head: L.head, wear: L.wear }; }
    return pick;
}

function paint() {
    const host = document.getElementById('closet-stage');
    if (!host) return;
    if (stage) { stop(stage); stage.remove(); stage = null; }
    const p = cur();
    stage = sprite({ dot: p }, { pose: 'stand', scale: 1 });
    host.insertBefore(stage, host.firstChild);

    const h = headAt(headIdx(p.head)), hi = headIdx(p.head);
    const solo = !!h.solo;
    const wi = wearIdx(p.wear), w = wearAt(wi);
    const set = function (id, text, n, of) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = text + '<span class="num">' + n + ' / ' + of + '</span>';
    };
    set('closet-head-name', h.n, hi + 1, DOT_HEADS.length);
    set('closet-wear-name', solo ? '브라운 전용 몸' : w.n, solo ? 1 : wi + 1, solo ? 1 : DOT_WEARS.length);
    ['closet-wear-l', 'closet-wear-r'].forEach(function (id) {
        const b = document.getElementById(id); if (b) b.disabled = solo;
    });
    const note = document.getElementById('closet-note');
    if (note) {
        note.innerText = solo
            ? '브라운은 몸이 따로라 옷을 갈아입지 못합니다.'
            : '고르는 대로 저장됩니다.';
    }
}

function step(what, d) {
    const p = cur();
    if (what === 'head') {
        p.head = headAt(headIdx(p.head) + d).i;
        if (headAt(headIdx(p.head)).solo) p.wear = '';
    } else {
        if (headAt(headIdx(p.head)).solo) return;
        p.wear = wearAt(wearIdx(p.wear) + d).i;
    }
    paint();
    // 누를 때마다 쓰지 않고 잠깐 모았다가 한 번에 적는다
    clearTimeout(saveT);
    saveT = setTimeout(function () {
        const u = u_(); if (!u) return;
        u.dot = { head: p.head, wear: p.wear };
        save({ dot: 1 });
    }, 600);
}
window.closetStep = step;

function render() {
    const body = document.getElementById('house-closet-body');
    if (!body) return;
    const u = u_(); if (!u) return;
    pick = null;
    body.innerHTML =
        '<div class="panel-title">[사택 옷장]</div>'
        + '<div id="closet-stage"><div id="closet-floor"></div></div>'
        + '<div class="closet-row">'
        + '  <span class="lab">머리</span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',-1)">◀</button>'
        + '  <span class="mid" id="closet-head-name"></span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',1)">▶</button>'
        + '</div>'
        + '<div class="closet-row">'
        + '  <span class="lab">옷</span>'
        + '  <button class="game-btn closet-arrow" id="closet-wear-l" onclick="closetStep(\'wear\',-1)">◀</button>'
        + '  <span class="mid" id="closet-wear-name"></span>'
        + '  <button class="game-btn closet-arrow" id="closet-wear-r" onclick="closetStep(\'wear\',1)">▶</button>'
        + '</div>'
        + '<div id="closet-note"></div>';
    paint();
}
window.renderCloset = render;

// 다른 칸으로 넘어가면 움직임을 멈춘다 (안 멈추면 뒤에서 계속 돈다)
setInterval(function () {
    const p = document.getElementById('house-closet');
    if (stage && p && !p.classList.contains('active')) { stop(stage); stage.remove(); stage = null; }
}, 2000);

// ==========================================
// 사택에 탭을 단다 — titles.js 가 정보 열람에 붙이는 것과 같은 길
// ==========================================
(function mountTab() {
    const iv = setInterval(function () {
        if (document.querySelector('#house-closet')) { clearInterval(iv); return; }
        const host = document.getElementById('tab-house');
        const grid = host && host.querySelector('.sub-tabs-grid');
        if (!grid) return;

        const btn = document.createElement('button');
        btn.className = 'sub-tab';
        btn.innerText = '옷장';
        btn.setAttribute('onclick', "switchHousePanel('house-closet', this); renderCloset();");
        grid.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'house-closet';
        panel.className = 'sub-panel';
        panel.innerHTML = '<div id="house-closet-body"></div>';
        host.appendChild(panel);

        clearInterval(iv);
        console.log('[옷장] 사택에 탭 연결');
    }, 700);
})();

// ==========================================
// 콘솔
// ==========================================
window.closetState = function () {
    const u = u_(); if (!u) { console.log('로그인 먼저'); return; }
    const L = look(u);
    console.log('%c===== 사택 옷장 =====', 'color:#e8c27a; font-size:13px');
    console.log('  적힌 것 :', JSON.stringify(u.dot || {}));
    console.log('  보이는 것 : 머리', L.head, '· 옷', L.wear || '맨몸', '· 몸판', L.body);
    console.log('  머리', DOT_HEADS.length, '종 · 옷', DOT_WEARS.length, '종');
};

window.closetAll = function () {
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:#0d0d0d;overflow:auto;padding:14px;';
    box.onclick = function () { box.querySelectorAll('.dot-box').forEach(stop); box.remove(); };
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
    DOT_HEADS.forEach(function (h) {
        DOT_WEARS.forEach(function (w) {
            if (h.solo && w.i) return;
            const c = document.createElement('div');
            c.style.cssText = 'text-align:center;';
            const s = sprite({ dot: { head: h.i, wear: w.i } }, { pose: 'stand', scale: 0.5 });
            c.appendChild(s);
            const t = document.createElement('div');
            t.style.cssText = 'font-size:9px;color:#9a948a;';
            t.innerText = h.n + (w.i ? ' · ' + w.n : '');
            c.appendChild(t);
            grid.appendChild(c);
        });
    });
    box.appendChild(grid);
    document.body.appendChild(box);
    console.log('아무 데나 누르면 닫힙니다.');
};

console.log('[옷장] 머리 ' + DOT_HEADS.length + '종 · 옷 ' + DOT_WEARS.length
    + '종 — closetState() · closetAll()');

})();
