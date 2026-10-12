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
//   받은 그림은 한 칸이 144 였는데 코트 자락이 칸 밖으로 여덟 도트 삐져나가
//   **다음 칸에 남의 자락이 묻어 보였다.** 그래서 전부 208 로 다시 깔았다.
//   그림은 한 점도 안 고치고 칸 안에서 똑같이 여섯 도트씩 밀기만 했으므로,
//   겹쳐도 그대로 맞물린다. (한 장은 216x128 도트 1:1 로 와서 네 배로 키웠다)
//
// ■ 겹치는 차례 — 이 순서가 아니면 모양이 틀어진다
//
//       몸 → 하의 → 신발 → 상의 → 겉옷 → 망토 → 머리
//
//   ★ 「구두 → 정장 → 망토」는 눈대중이 아니라 재서 찾은 차례다.
//     여섯 가지 차례를 다 겹쳐 보고 주신 「다 입은 모양」과 견주었더니
//     이 차례만 **한 도트도 안 틀렸다**. (다른 차례는 688~689 도트가 어긋난다)
//
// ■ 몸판은 셋뿐이다
//
//       body.png        보통 몸
//       body-brown.png  브라운 전용 몸  ← h-brown 과 반드시 짝
//       coat.png        옛 코트 (몸까지 한 장에 그려진 것 — 지금은 안 쓴다)
//
//   ★ h05 는 h09 와 같은 얼굴인데 **안대가 반대쪽**이다. 움직일 때 좌우를
//     가르려고 두 벌 그려 두신 것인데, 이 게임은 옆모습 한 방향만 쓰므로
//     안대가 왼쪽 눈을 가린 h09 만 쓴다. h05.png 는 지우지 않고 남겨 둔다.
//
//   브라운은 몸이 따로 있다. 머리를 브라운으로 고르면 몸도 같이 바뀌고,
//   옷은 못 갈아입는다. 어느 쪽으로 어긋나게 적혀 있어도 look() 이
//   **보이는 모습을 늘 말이 되게** 맞춰 준다.
//
// ■ 칸(슬롯)마다 따로 고른다
//
//       상의  없음 · 잠옷 상의
//       하의  없음 · 잠옷 하의
//       겉옷  없음 · 정장                        ← 상담사만
//       구두  없음 · 구두                        ← 상담사만
//       망토  없음 · 망토                        ← 상담사만
//
//   상·하의는 따로 입고 벗는다. 겉옷·구두·망토 줄은 상담사 옷장에만 보인다.
//   옷을 더 그려 주시면 아래 DOT_SLOTS 에 한 줄씩 보태면 된다.
//   def 가 붙은 것이 「아직 한 번도 안 골랐을 때」 입고 있는 것이다.
//
// ■ 움직임 — 한 숫자로 같이 돌리면 안 된다
//
//     머리  여섯 칸이 눈 깜빡임이다 (0=1=5 뜸 · 2=4 반 · 3 감음).
//           오래 뜨고 잠깐 감게 칸마다 머무는 시간을 달리 둔다.
//     몸    서기 여섯 칸이 전부 같은 그림이라 0 에 세워 둔다.
//     옷    서기 줄에서 **짝수 칸(0·2·4)만** 알맹이가 있다. 홀수 칸은
//           비어 있어서 같이 돌리면 옷이 깜빡 사라진다. 그래서 flap 이
//           붙은 장만 0·2·4 를 돈다. 나머지(상의·하의·구두)는 서 있을 때
//           움직이지 않으므로 0 에 세워 둔다.
//
//   ★ 걷기 줄의 **5·6번째 칸은 3·2번째와 같다** — 그린 이의 규칙이다.
//     상의·하의는 실제로 픽셀 하나 안 틀리고 같았다. 정장·망토·구두는
//     그 두 칸이 비어 온 것을 이 규칙대로 채워 넣었다. 채운 뒤 몸 위에
//     겹쳐 옛 코트 장과 견주니 칸마다 80픽셀(5도트)밖에 안 달랐다.
//
// ■ 밖에서 쓰는 것 (광장이 이걸 그대로 쓴다)
//
//       dotLook(u)              고른 것을 풀어 준다 {head, body, layers[]}
//       dotSprite(u, 설정)      그 모습이 든 칸을 만들어 준다
//         설정 = { pose:'stand'|'walk', scale:1, live:true }
//       dotStop(칸)             움직임을 멈춘다 (칸을 지우기 전에)
//
// ■ 콘솔
//       closetState()   지금 고른 것
//       closetAll()     있는 머리·옷을 전부 늘어놓고 본다

const DOT = {
    DIR: 'dot/',
    W: 208, H: 256,
    SHEET_W: 1248, SHEET_H: 512,
    BODY: 'body', BROWN_BODY: 'body-brown', BROWN_HEAD: 'h-brown',
    ADMIN: 'kario0987',
    BLINK: [1900, 110, 110, 110, 110, 110],   // 머리 칸마다 머무는 시간
    FLAP: 300,                                 // 옷자락 나부끼는 빠르기
    WALK: 120,                                 // 걷는 빠르기 (광장에서 쓴다)
    // 겹치는 차례 — 앞에 있는 것이 아래로 간다
    Z: ['pj-bottom', 'shoes', 'pj-top', 'suit', 'cape'],
    // 서 있을 때 0·2·4 로 나부끼는 장
    FLAPS: ['suit', 'cape'],
};

// 머리 — 이름은 제가 보고 붙인 것입니다. 파일명이 제 쪽으로 안 와서,
//        올리신 차례대로 번호를 매겨 두었습니다. 여기만 고치면 됩니다.
const DOT_HEADS = [
    { i: 'h01', n: '은발 · 노란 눈' },        // 올리신 차례 1
    { i: 'h02', n: '연보라 · 붉은 눈' },      // 2
    { i: 'h03', n: '검은머리 · 푸른 눈' },    // 3
    { i: 'h04', n: '갈색 긴머리' },           // 4
    { i: 'h06', n: '갈색 · 푸른 눈' },        // 8
    { i: 'h07', n: '검은머리 · 안경' },       // 9
    { i: 'h08', n: '남색 올림머리' },         // 10
    { i: 'h09', n: '갈색 · 안대' },           // 11  (h05 는 안대가 오른쪽인 짝 — 안 씀)
    { i: 'h10', n: '금발 · 주황 눈' },        // 12
    { i: 'h11', n: '보라 묶음머리' },         // 13
    { i: 'h12', n: '검은머리 · 붉은 눈' },    // 15
    { i: 'h13', n: '검은 긴머리' },           // 16
    { i: 'h14', n: '검은 긴머리 · 안경' },    // 17
    { i: 'h15', n: '남보라 · 청록 눈' },      // 18
    { i: 'h16', n: '검은머리 · 노란 눈' },    // 19
    { i: 'h17', n: '회청 땋은머리' },         // 20
    { i: 'h-brown', n: '브라운', solo: true } // 6 — 전용 몸과 짝, 옷을 못 입는다
];

// 칸(슬롯)마다 고를 수 있는 것. admin 이 붙은 것은 상담사 옷장에만 보인다.
const DOT_SLOTS = [
    {
        k: 'top', n: '상의', items: [
            { i: '', n: '없음', over: [] },
            { i: 'pj', n: '잠옷 상의', over: ['pj-top'], def: true }
        ]
    },
    {
        k: 'bottom', n: '하의', items: [
            { i: '', n: '없음', over: [] },
            { i: 'pj', n: '잠옷 하의', over: ['pj-bottom'], def: true }
        ]
    },
    {
        k: 'outer', n: '겉옷', items: [
            { i: '', n: '없음', over: [] },
            { i: 'suit', n: '정장', over: ['suit'], admin: true }
        ]
    },
    {
        k: 'shoes', n: '구두', items: [
            { i: '', n: '없음', over: [] },
            { i: 'shoes', n: '구두', over: ['shoes'], admin: true }
        ]
    },
    {
        k: 'cape', n: '망토', items: [
            { i: '', n: '없음', over: [] },
            { i: 'cape', n: '망토', over: ['cape'], admin: true }
        ]
    }
];

(function closet() {

const D = DOT;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function isAdm(user) {
    const u = user || u_();
    return !!(u && u.code === D.ADMIN);
}
// 이 사람 옷장에 보이는 것만 추린다
function items(slot, user) {
    return slot.items.filter(function (it) { return !it.admin || isAdm(user); });
}
function slotOf(k) { return DOT_SLOTS.filter(function (s) { return s.k === k; })[0]; }
function wrap(n, len) { return ((n % len) + len) % len; }
function headIdx(id) { const k = DOT_HEADS.findIndex(function (h) { return h.i === id; }); return k < 0 ? 0 : k; }

// ==========================================
// 고른 것을 풀어 준다
// ==========================================
function look(user, override) {
    const u = user || u_() || {};
    const d = override || u.dot || {};
    const head = DOT_HEADS.some(function (h) { return h.i === d.head; }) ? d.head : DOT_HEADS[0].i;
    if (head === D.BROWN_HEAD) {
        return { head: head, body: D.BROWN_BODY, layers: [], solo: true, pick: {} };
    }
    const over = [], pick = {};
    DOT_SLOTS.forEach(function (s) {
        const list = items(s, u);
        let it;
        if (Object.prototype.hasOwnProperty.call(d, s.k)) {
            // 한 번이라도 고른 적이 있으면 그 뜻을 지킨다 (「없음」도 고른 것이다)
            it = list.filter(function (x) { return x.i === (d[s.k] || ''); })[0];
        } else {
            // 아직 안 골랐으면 기본으로 입혀 둔다
            it = list.filter(function (x) { return x.def; })[0];
        }
        if (!it) it = list.filter(function (x) { return x.def; })[0] || list[0];
        pick[s.k] = it.i;
        (it.over || []).forEach(function (o) { over.push(o); });
    });
    over.sort(function (a, b) { return D.Z.indexOf(a) - D.Z.indexOf(b); });
    return { head: head, body: D.BODY, layers: over, solo: false, pick: pick };
}
window.dotLook = look;

// ==========================================
// 모습이 든 칸을 만든다
// ==========================================
function layer(sheet, k) {
    const el = document.createElement('div');
    el.className = 'dot-layer';
    el.dataset.sheet = sheet;
    el.style.backgroundImage = 'url("' + D.DIR + sheet + '.png")';
    el.style.backgroundSize = (D.SHEET_W * k) + 'px ' + (D.SHEET_H * k) + 'px';
    return el;
}

function sprite(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const pose = o.pose === 'walk' ? 'walk' : 'stand';
    const L = look(user, o.dot);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const sheets = [L.body].concat(L.layers).concat([L.head]);
    const els = sheets.map(function (s) { const e = layer(s, k); box.appendChild(e); return e; });

    const row = (pose === 'walk') ? 0 : 1;
    const put = function (el, col) {
        el.style.backgroundPosition = '-' + (col * D.W * k) + 'px -' + (row * D.H * k) + 'px';
    };
    els.forEach(function (e) { put(e, 0); });

    box._dot = { els: els, sheets: sheets, timers: [] };
    if (o.live === false) return box;

    if (pose === 'walk') {
        // 걷기 — 여섯 칸을 다 같이 돈다
        let f = 0;
        box._dot.timers.push(setInterval(function () {
            f = (f + 1) % 6;
            els.forEach(function (e) { put(e, f); });
        }, D.WALK));
    } else {
        // 서기 — 몸·신발은 세워 두고, 옷자락은 0·2·4 로 나부끼고, 머리는 깜빡인다
        let g = 0;
        const flaps = els.filter(function (e, i) { return D.FLAPS.indexOf(sheets[i]) >= 0; });
        if (flaps.length) {
            box._dot.timers.push(setInterval(function () {
                g = (g + 1) % 3;
                flaps.forEach(function (e) { put(e, g * 2); });
            }, D.FLAP));
        }
        const head = els[els.length - 1];
        let f = 0;
        const blink = function () {
            put(head, f);
            const ms = D.BLINK[f];
            f = (f + 1) % 6;
            box._dot.timers.push(setTimeout(blink, ms));
        };
        blink();
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
let pick = null;
let stage = null;
let saveT = null;

function cur() {
    const u = u_();
    if (!pick) {
        const L = look(u);
        pick = { head: L.head };
        DOT_SLOTS.forEach(function (s) { pick[s.k] = L.pick[s.k] || ''; });
    }
    return pick;
}

function paint() {
    const host = document.getElementById('closet-stage');
    if (!host) return;
    if (stage) { stop(stage); stage.remove(); stage = null; }
    const u = u_(), p = cur();
    stage = sprite(u, { pose: 'stand', scale: 1, dot: p });
    host.insertBefore(stage, host.firstChild);

    const hi = headIdx(p.head), h = DOT_HEADS[hi];
    const solo = !!h.solo;
    const set = function (id, text, n, of) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = text + '<span class="num">' + n + ' / ' + of + '</span>';
    };
    set('closet-head-name', h.n, hi + 1, DOT_HEADS.length);

    DOT_SLOTS.forEach(function (s) {
        const list = items(s, u);
        const row = document.getElementById('closet-row-' + s.k);
        if (row) row.style.display = (list.length > 1 || !solo) ? 'flex' : 'flex';
        let k = list.findIndex(function (x) { return x.i === p[s.k]; });
        if (k < 0) k = 0;
        const lock = solo || list.length < 2;
        set('closet-' + s.k + '-name', solo ? '—' : list[k].n, solo ? 1 : k + 1, solo ? 1 : list.length);
        ['l', 'r'].forEach(function (d) {
            const b = document.getElementById('closet-' + s.k + '-' + d);
            if (b) b.disabled = lock;
        });
    });

    const note = document.getElementById('closet-note');
    if (note) {
        note.innerText = solo
            ? '브라운은 몸이 따로라 옷을 갈아입지 못합니다.'
            : (isAdm(u) ? '고르는 대로 저장됩니다.'
                : '고르는 대로 저장됩니다. 지금은 잠옷 한 벌뿐입니다.');
    }
}

function step(what, d) {
    const u = u_(), p = cur();
    if (what === 'head') {
        p.head = DOT_HEADS[wrap(headIdx(p.head) + d, DOT_HEADS.length)].i;
    } else {
        if (DOT_HEADS[headIdx(p.head)].solo) return;
        const s = slotOf(what); if (!s) return;
        const list = items(s, u); if (list.length < 2) return;
        let k = list.findIndex(function (x) { return x.i === p[what]; });
        if (k < 0) k = 0;
        p[what] = list[wrap(k + d, list.length)].i;
    }
    paint();
    clearTimeout(saveT);
    saveT = setTimeout(function () {
        const me = u_(); if (!me) return;
        const out = { head: p.head };
        DOT_SLOTS.forEach(function (s) { out[s.k] = p[s.k] || ''; });
        me.dot = out;
        save({ dot: 1 });
    }, 600);
}
window.closetStep = step;

function rowHtml(k, n) {
    return '<div class="closet-row" id="closet-row-' + k + '">'
        + '  <span class="lab">' + n + '</span>'
        + '  <button class="game-btn closet-arrow" id="closet-' + k + '-l" onclick="closetStep(\'' + k + '\',-1)">◀</button>'
        + '  <span class="mid" id="closet-' + k + '-name"></span>'
        + '  <button class="game-btn closet-arrow" id="closet-' + k + '-r" onclick="closetStep(\'' + k + '\',1)">▶</button>'
        + '</div>';
}

function render() {
    const body = document.getElementById('house-closet-body');
    if (!body) return;
    const u = u_(); if (!u) return;
    pick = null;
    let rows = '<div class="closet-row">'
        + '  <span class="lab">머리</span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',-1)">◀</button>'
        + '  <span class="mid" id="closet-head-name"></span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',1)">▶</button>'
        + '</div>';
    DOT_SLOTS.forEach(function (s) {
        if (items(s, u).length < 2) return;   // 고를 것이 하나뿐이면 줄을 안 만든다
        rows += rowHtml(s.k, s.n);
    });
    body.innerHTML =
        '<div class="panel-title">[사택 옷장]</div>'
        + '<div id="closet-stage"><div id="closet-floor"></div></div>'
        + rows + '<div id="closet-note"></div>';
    paint();
}
window.renderCloset = render;

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
    console.log('  적힌 것   :', JSON.stringify(u.dot || {}));
    console.log('  보이는 것 : 몸', L.body, '· 겹침', L.layers.join(' → ') || '없음', '· 머리', L.head);
    console.log('  상담사인가:', isAdm(u) ? 'O' : '✗');
    DOT_SLOTS.forEach(function (s) {
        console.log('  ' + s.n + ' :', items(s, u).map(function (x) { return x.n; }).join(' · '));
    });
};

window.closetAll = function () {
    const u = u_();
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:#0d0d0d;overflow:auto;padding:14px;';
    box.onclick = function () { box.querySelectorAll('.dot-box').forEach(stop); box.remove(); };
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
    DOT_HEADS.forEach(function (h, k) {
        const c = document.createElement('div');
        c.style.cssText = 'text-align:center;';
        c.appendChild(sprite(u, { pose: 'stand', scale: 0.5, dot: { head: h.i, wear: 'uniform' } }));
        const t = document.createElement('div');
        t.style.cssText = 'font-size:9px;color:#9a948a;';
        t.innerText = (k + 1) + '. ' + h.n;
        c.appendChild(t);
        grid.appendChild(c);
    });
    box.appendChild(grid);
    document.body.appendChild(box);
    console.log('아무 데나 누르면 닫힙니다.');
};

console.log('[옷장] 머리 ' + DOT_HEADS.length + '종 · 칸 ' + DOT_SLOTS.length
    + '개 — closetState() · closetAll()');

})();
