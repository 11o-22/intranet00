// ==========================================
// ★ 망상 홈쇼핑 — 칸을 갈래 탭으로 나눈다 (2026-10-29 사용자 요청)
// bundles.json 마지막 묶음 — pet-shop.js · pet-sneak.js · pet-stay.js · pet-rune.js · pet-gear.js 보다 뒤
// ==========================================
//
// ■ 왜
//
//   망상 홈쇼핑(#dream-body)은 치료 물품 · 집 지킴이 방석 · 속성 룬 · 반려동물용 장비 ·
//   환몽알 · 돌봄 물품 마흔 가지가 한 줄로 길게 깔려 있어 찾으러 끝까지 내려가야 했다.
//   어둠 탐사 · 행복 식당처럼 위에 탭을 두고 한 갈래씩 보인다.
//
// ■ 어떻게
//
//   칸은 저마다 다른 파일이 #dream-body 맨 위에 끼워 넣고(pet-sneak · pet-stay · pet-rune · pet-gear),
//   환몽알 · 돌봄은 pet-shop 의 render 가 #dream-body 를 통째로 다시 쓴다. 그래서 칸을 옮기지 않고
//   **보이고 안 보이고만** 정한다 — #dream-body 의 바로 아래 자식을 id 로 갈래에 넣고, 고른 갈래가
//   아니면 display:none. 누가 다시 그려도 MutationObserver 가 바로 다시 가린다.
//
//     🩹 치료      #pet-med-box
//     🥚 환몽알·돌봄  그 밖의 것 전부 (pet-shop 의 알 칸 · 돌봄 물품)
//     🐾 펫 숍     #pet-rune-box · #pet-gear-box
//     🏠 방석      #pet-stay-box
//
//   처음 열 때는 다친 펫이 있으면 「치료」, 아니면 지난번에 보던 갈래(없으면 환몽알·돌봄).
//
// ■ 콘솔
//   dreamTab('med' | 'care' | 'shop' | 'stay')   갈래를 바꾼다

(function dreamTabs() {
'use strict';

const BAR = 'dream-tabs';
const TABS = [
    { k: 'med',  n: '🩹 치료',        ids: ['pet-med-box'] },
    { k: 'care', n: '🥚 환몽알 · 돌봄', ids: [] },                 // 나머지 전부
    { k: 'shop', n: '🐾 펫 숍',       ids: ['pet-rune-box', 'pet-gear-box'] },
    { k: 'stay', n: '🏠 방석',        ids: ['pet-stay-box'] }
];
const KNOWN = {};
TABS.forEach(function (t) { t.ids.forEach(function (id) { KNOWN[id] = t.k; }); });
const LS = 'dreamTab';
let cur = '';
let mo = null;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function body() { return document.getElementById('dream-body'); }
function panel() { return document.getElementById('shop-dream'); }
function groupOf(el) { return KNOWN[el.id] || 'care'; }
function anyHurt() {
    try {
        const P = window.PET, me = u_();
        if (!P || !me) return false;
        const ps = P.pets(me) || {};
        return Object.keys(ps).some(function (k) { return ps[k] && ps[k].hurt; });
    } catch (e) { return false; }
}
function pickFirst() {
    if (anyHurt()) return 'med';
    let v = '';
    try { v = localStorage.getItem(LS) || ''; } catch (e) { }
    return TABS.some(function (t) { return t.k === v; }) ? v : 'care';
}

function apply() {
    const b = body(); if (!b) return;
    if (!cur) cur = pickFirst();
    Array.prototype.forEach.call(b.children, function (el) {
        if (el.id === BAR) return;
        const want = (groupOf(el) === cur) ? '' : 'none';
        if (el.style.display !== want) el.style.display = want;
    });
    const bar = document.getElementById(BAR);
    if (bar) Array.prototype.forEach.call(bar.querySelectorAll('.sub-tab'), function (x) { x.classList.toggle('active', x.dataset.k === cur); });
}
function set(k) {
    if (!TABS.some(function (t) { return t.k === k; })) return;
    cur = k;
    try { localStorage.setItem(LS, k); } catch (e) { }
    apply();
    const b = body(); if (b) try { b.scrollIntoView({ block: 'nearest' }); } catch (e) { }
}
window.dreamTab = set;

function mount() {
    const p = panel(), b = body();
    if (!p || !b) return false;
    let bar = document.getElementById(BAR);
    if (!bar) {
        bar = document.createElement('div');
        bar.id = BAR;
        // ★ 클래스는 sub-tabs-grid 를 쓰지 않는다 (2026-10-29) — 광장 바탕의 한 칸 꼴(shell.js)에서는
        //   「#tab-shop .sub-tabs-grid { display:none !important }」 로 상점 안의 고르는 줄을 다 감추므로,
        //   그 이름을 쓰면 탭이 안 보여 치료 · 룬 · 장비 칸이 「사라진」 것처럼 됐다 (점검표 10.29 14:21)
        bar.className = 'dream-tabs-bar';
        bar.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; row-gap:4px; margin-bottom:10px;';
        bar.innerHTML = TABS.map(function (t) { return '<button class="sub-tab" data-k="' + t.k + '" style="flex:1 1 22%; font-size:10.5px;">' + t.n + '</button>'; }).join('');
        Array.prototype.forEach.call(bar.querySelectorAll('.sub-tab'), function (x) { x.onclick = function () { set(x.dataset.k); }; });
        p.insertBefore(bar, b);
    }
    if (!mo) {
        mo = new MutationObserver(function () { try { apply(); } catch (e) { } });
        mo.observe(b, { childList: true });
    }
    apply();
    return true;
}

// 칸이 처음 그려질 때(늦게 붙는 묶음까지) · 다시 열 때마다
setInterval(function () {
    try {
        const p = panel();
        if (!p) return;
        if (!document.getElementById(BAR)) { mount(); return; }
        if (p.classList.contains('active')) apply();
    } catch (e) { }
}, 1200);
(function first() { const iv = setInterval(function () { if (mount()) clearInterval(iv); }, 500); setTimeout(function () { clearInterval(iv); }, 60000); })();

console.log('[망상 홈쇼핑] 갈래 탭 — 치료 · 환몽알·돌봄 · 펫 숍 · 방석');
})();
