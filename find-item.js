// ==========================================
// ★ 물품 검색칸 — 밀실 거래 · 상담사 물품 제거
// bundles.json 마지막 묶음, p2p-fix.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 어디가 불편했나
//
//   고르는 칸이 전부 그냥 <select> 다. 손가락으로 수백 줄을 훑어야 했다.
//
//       p2p-offer-item    밀실 거래 — 내가 건넬 소지품
//       p2p-demand-item   밀실 거래 — 상대에게 요구할 물품 (물품 목록 전체)
//       adm-remove-item   상담사 — 물품 제거
//
//   「물품 강제 꽂기」 쪽에는 이미 검색칸이 있다 (index.html:1095).
//   같은 것을 이 셋에도 붙인다.
//
// ■ 어떻게 하나
//
//   칸 위에 검색 줄을 하나 끼워 넣고, 적은 글자가 든 것만 남긴다.
//
//   숨기는 것(display:none)으로 거르면 아이폰 사파리에서 안 먹는다 —
//   <select> 를 운영체제가 제 방식으로 그리기 때문이다. 그래서 **줄을
//   실제로 빼고 다시 넣는다.** 어디서나 똑같이 걸린다.
//
//   원래 줄은 따로 적어 두었다가, 게임이 칸을 다시 채우면 받아 적는다.
//   (renderP2PSelectBoxes 는 updateUI 마다 돈다)
//
//   띄어쓰기는 무시한다 — 「상비약」도 「상 비약」도 걸린다.
//   고르고 있던 것이 거른 뒤에도 남아 있으면 그대로 둔다.
//
// ■ 콘솔
//   findItemState()   검색칸이 붙었는지

(function findItem() {

const BOXES = [
    { id: 'p2p-offer-item',  ph: '🔍 건넬 소지품 검색' },
    { id: 'p2p-demand-item', ph: '🔍 요구할 물품 검색' },
    { id: 'adm-remove-item', ph: '🔍 제거할 물품 검색' }
];

function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '');
}

// 지금 칸에 들어 있는 줄이 내가 그린 것인가 — 다르면 게임이 다시 채운 것이다
function mark(sel) {
    const n = sel.options.length;
    if (!n) return '0';
    return n + '|' + sel.options[0].value + '|' + sel.options[n - 1].value;
}
function capture(sel) {
    return Array.prototype.map.call(sel.options, function (o) {
        return { v: o.value, t: o.text };
    });
}
function fullList(sel) {
    if (sel._fiMine !== mark(sel)) sel._fiFull = capture(sel);   // 게임이 다시 채웠다
    return sel._fiFull || [];
}

function apply(sel, q) {
    const list = fullList(sel);
    const s = norm(q);
    const keep = sel.value;
    const out = s ? list.filter(function (o) {
        return norm(o.t + ' ' + o.v).indexOf(s) >= 0;
    }) : list;

    while (sel.firstChild) sel.removeChild(sel.firstChild);

    if (!out.length) {
        const o = document.createElement('option');
        o.value = '';
        o.text = '(찾는 물품이 없습니다)';
        sel.appendChild(o);
    } else {
        out.forEach(function (x) {
            const o = document.createElement('option');
            o.value = x.v;
            o.text = x.t;
            sel.appendChild(o);
        });
        if (out.some(function (x) { return x.v === keep; })) sel.value = keep;
    }
    sel._fiMine = mark(sel);
}

function attach(cfg) {
    const sel = document.getElementById(cfg.id);
    if (!sel) return false;
    if (sel._fiBox) return true;
    const row = sel.parentNode;
    if (!row || !row.parentNode) return false;

    const box = document.createElement('input');
    box.type = 'search';
    box.id = cfg.id + '-find';
    box.placeholder = cfg.ph;
    box.setAttribute('autocomplete', 'off');
    box.style.cssText = 'width:100%; margin-bottom:6px; font-size:11px;';
    box.addEventListener('input', function () { apply(sel, box.value); });

    row.parentNode.insertBefore(box, row);
    sel._fiBox = box;
    sel._fiFull = capture(sel);
    sel._fiMine = mark(sel);
    return true;
}

(function start() {
    let left = BOXES.length;
    const iv = setInterval(function () {
        left = BOXES.filter(function (c) { return !attach(c); }).length;
        if (!left) {
            clearInterval(iv);
            console.log('[검색] 물품 검색칸 ' + BOXES.length + '군데 연결');
        }
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 칸을 다시 채우면 적어 둔 글자로 다시 거른다
// ==========================================
['renderP2PSelectBoxes', 'adminLoadInventory'].forEach(function (n) {
    const iv = setInterval(function () {
        if (typeof window[n] !== 'function') return;
        if (window[n]._fi) { clearInterval(iv); return; }
        const _o = window[n];
        window[n] = function () {
            const r = _o.apply(this, arguments);
            try {
                BOXES.forEach(function (c) {
                    const sel = document.getElementById(c.id);
                    if (sel && sel._fiBox && sel._fiBox.value) apply(sel, sel._fiBox.value);
                });
            } catch (e) { }
            return r;
        };
        window[n]._fi = true;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
});

// 칸이 숨겨지면(포인트로 바꾸면) 검색 줄도 같이 숨긴다
setInterval(function () {
    BOXES.forEach(function (c) {
        const sel = document.getElementById(c.id);
        if (!sel || !sel._fiBox) return;
        const hidden = (sel.style.display === 'none');
        const want = hidden ? 'none' : '';
        if (sel._fiBox.style.display !== want) sel._fiBox.style.display = want;
    });
}, 400);

// ==========================================
// 확인
// ==========================================
window.findItemState = function () {
    console.log('%c===== 물품 검색칸 =====', 'color:#9fd0ff; font-size:13px');
    BOXES.forEach(function (c) {
        const sel = document.getElementById(c.id);
        if (!sel) { console.log('  ' + c.id + ' — 칸을 못 찾음'); return; }
        console.log('  ' + c.id + ' — 검색칸:', sel._fiBox ? 'O' : '✗',
            '· 전체 ' + ((sel._fiFull || []).length) + '줄 · 지금 보이는 ' + sel.options.length + '줄'
            + (sel._fiBox && sel._fiBox.value ? ' · 「' + sel._fiBox.value + '」' : ''));
    });
};

console.log('[검색] 밀실 거래 · 물품 제거에 검색칸 — findItemState()');

})();
