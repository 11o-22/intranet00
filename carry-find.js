// ==========================================
// ★ 어둠 반입품 — 이름으로 찾기
// bundles.json 마지막 묶음, equip-kind.js 보다 뒤
// ==========================================
//
// ■ 무엇이 생기나
//
//   반입품 고르는 자리에 찾는 칸이 하나 생긴다. 적으면 이름이 맞는 것만
//   남고 나머지는 접힌다. 소지품이 백 줄이 넘어가면 고르는 것이 일이었다.
//
//   창이 두 가지다 — 혼자 들어가는 창(dark-eq / dark-cs)과
//   파티 반입품 창(pt-eq / pt-cs). 둘 다 붙인다.
//
// ■ 고른 것은 안 숨긴다
//
//   이미 체크한 것은 글자가 안 맞아도 그대로 남겨 둔다. 접혀 버리면
//   「분명 골랐는데 없어졌다」가 되고, 접힌 채로도 반입은 되므로
//   무엇을 들고 가는지 모르게 된다.
//
// ■ 다시 그려도 살아남는다
//
//   두 창 다 글째로 다시 그려진다(파티 쪽은 방이 바뀔 때마다). 그때 칸도
//   같이 지워지므로, 0.7초마다 보고 없으면 다시 붙인다. 적어 둔 말은
//   들고 있다가 그대로 되돌린다. 창이 아주 닫히면 그때 비운다.
//
// ■ 콘솔
//   carryFindState()

(function carryFind() {

const KINDS = [
    { id: 'cfind-dark', eq: 'dark-eq', cs: 'dark-cs', n: '혼자' },
    { id: 'cfind-pt',   eq: 'pt-eq',   cs: 'pt-cs',   n: '파티' }
];
const q = {};              // 창마다 적어 둔 말

function labels(cls) {
    return Array.prototype.slice.call(document.querySelectorAll('input.' + cls))
        .map(function (i) { return i.closest ? i.closest('label') : null; })
        .filter(Boolean);
}
function boxOf(cls) {
    const i = document.querySelector('input.' + cls);
    const l = (i && i.closest) ? i.closest('label') : null;
    return l ? l.parentElement : null;
}
function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ''); }

function apply(k) {
    const v = norm(q[k.id] || '');
    let on = 0, all = 0, keep = 0;
    [k.eq, k.cs].forEach(function (cls) {
        labels(cls).forEach(function (l) {
            all++;
            // ★ textContent 로 본다 — 접힌 줄은 innerText 가 빈 글자라
            //   한 번 접히면 다시 펼 수 없게 된다
            const t = norm(l.textContent);
            const box = l.querySelector('input');
            const checked = !!(box && box.checked);
            const hit = !v || t.indexOf(v) >= 0;
            if (hit) on++;
            if (!hit && checked) keep++;
            l.style.display = (hit || checked) ? '' : 'none';
        });
    });
    const c = document.getElementById(k.id + '-n');
    if (c) c.innerText = v ? (on + ' / ' + all + (keep ? ' (+' + keep + ')' : '')) : (all + '개');
    return { on: on, all: all, keep: keep };
}

window.carryFindType = function (id) {
    const k = KINDS.filter(function (x) { return x.id === id; })[0];
    if (!k) return;
    const el = document.getElementById(id + '-in');
    q[id] = el ? el.value : '';
    apply(k);
};
window.carryFindClear = function (id) {
    const k = KINDS.filter(function (x) { return x.id === id; })[0];
    q[id] = '';
    const el = document.getElementById(id + '-in');
    if (el) { el.value = ''; try { el.focus(); } catch (e) { } }
    if (k) apply(k);
};

function mount(k) {
    const base = boxOf(k.eq) || boxOf(k.cs);
    if (!base || !base.parentNode) return false;
    if (document.querySelector('#' + k.id)) { apply(k); return true; }

    // 「장비 (최대 2)」 같은 제목이 바로 위에 있으면 그 앞에 넣는다
    const prev = base.previousElementSibling;
    const anchor = (prev && /장비|소모품/.test(prev.textContent || '')) ? prev : base;

    const d = document.createElement('div');
    d.id = k.id;
    d.style.cssText = 'display:flex; gap:6px; align-items:center; margin:0 0 10px 0;';
    d.innerHTML =
        '<input type="text" id="' + k.id + '-in" maxlength="24" placeholder="반입품 찾기"'
        + ' style="flex:1; min-width:0; padding:8px; font-size:11px; box-sizing:border-box;"'
        + ' oninput="carryFindType(\'' + k.id + '\')">'
        + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:8px 11px; font-size:10px;"'
        + ' onclick="carryFindClear(\'' + k.id + '\')">지움</button>'
        + '<span id="' + k.id + '-n" style="flex:0 0 auto; font-size:10px; color:#777;'
        + ' min-width:52px; text-align:right;"></span>';
    anchor.parentNode.insertBefore(d, anchor);

    const el = document.getElementById(k.id + '-in');
    if (el && q[k.id]) el.value = q[k.id];
    apply(k);
    return true;
}

setInterval(function () {
    KINDS.forEach(function (k) {
        try {
            const live = !!document.querySelector('input.' + k.eq + ', input.' + k.cs);
            if (!live) { q[k.id] = ''; return; }      // 창이 닫혔다
            mount(k);
        } catch (e) { }
    });
}, 700);

window.carryFindState = function () {
    console.log('%c===== 반입품 찾기 =====', 'color:#9fd0ff; font-size:13px');
    KINDS.forEach(function (k) {
        const live = !!document.querySelector('input.' + k.eq + ', input.' + k.cs);
        const on = !!document.getElementById(k.id);
        console.log('  ' + k.n + ' 창 :', live ? '열림' : '닫힘',
            '· 찾기 칸', on ? 'O' : '✗', '· 적어 둔 말', JSON.stringify(q[k.id] || ''));
        if (live) {
            const r = apply(k);
            console.log('    보이는 것 ' + r.on + ' / ' + r.all
                + (r.keep ? ' · 고른 것이라 남겨 둔 것 ' + r.keep : ''));
        }
    });
};

console.log('[어둠] 반입품 찾기 — carryFindState()');

})();
