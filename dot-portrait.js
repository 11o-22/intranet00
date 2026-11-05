// ==========================================
// ★ 사원증 · 사원 열람 — 사진 대신 캐릭터 (2026-11-05 사용자)
// bundles.json — closet.js · plaza.js · nuow-text.js 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//   「사원 열람, 사원증에 사진이 아니라 캐릭터로 보이게 해 주고, 캐릭터 배경 색을 원하는 대로 정할 수 있게」
//
// ■ 어디에
//   · 사원증 칸(기록 › 사원증)의 큰 사진 칸 (#badge-photo-display) — 온몸
//   · 옛 화면 위쪽 사원증의 작은 사진 (#card-mini-photo) — 윗몸
//   · 사원 열람 목록 (.emp-list-card .emp-list-avatar) — 윗몸 · 접속 중은 초록 불 대신 이름 줄의 「온라인 · 오프라인」 글자 (index.html)
//   · 사원 열람 › 한 사람 (#emp-detail-card-container .id-avatar-mini) — 윗몸
//   · 광장 왼쪽 위 사원증 칸 (#plaza-me .pm-pic) — 얼굴 (plaza.js paintMe 가 부른다)
//   그림은 옷장과 같은 것(dotSprite · 지금 입은 옷 · 물들인 색 · 악세)을 멈춘 채로 쓴다.
//   다른 파일들이 그 칸을 다시 그려도(사진 테두리 · 특이사항 …) 사진이 다시 끼면 곧바로 캐릭터로 바꾼다 (MutationObserver).
//
// ■ 배경 색
//   · 사원증 칸의 「배경 색」 — 고른 색 열둘 + 마음대로 고르기. 누르는 즉시 저장 (badge.cbg = '#rrggbb').
//   · 남의 사원 열람에도 그 사람이 고른 색으로 나온다. 안 골랐으면 DEF.
//   · 「사진 등록 / 변경」 단추는 걷었다 (사진은 더 안 쓰인다 — 남아 있는 사진 자료는 지우지 않는다).
//
// ■ 콘솔
//   dotPortraitState()

(function dotPortrait() {
'use strict';

const DEF = '#3a3550';
const SW = ['#3a3550', '#1f2937', '#111111', '#f6f2ea', '#ffd6e0', '#ffe8a3', '#c8f2d0', '#b9e3ff', '#d9c8ff', '#ff9eb5', '#7fb3d5', '#8d6e63'];
// 그림 칸(352 x 384) 안에서 보일 자리 — 온몸 · 윗몸 · 얼굴
const VIEW = {
    full: { y0: 78, y1: 362, cx: 176 },
    bust: { y0: 88, y1: 262, cx: 176 },
    face: { y0: 96, y1: 214, cx: 172 }
};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function users() { try { return (typeof db !== 'undefined' && db && db.users) || {}; } catch (e) { return {}; } }
function okHex(c) { return /^#[0-9a-fA-F]{6}$/.test(String(c || '')); }
function bgOf(u) { const c = u && u.badge && u.badge.cbg; return okHex(c) ? c : DEF; }

// 캐릭터 한 칸 — w x h 상자에 view 자리를 맞춰 넣는다
const cache = {};
let made = 0;
function keyOf(u, view, w, h) {
    let d = '';
    try { d = JSON.stringify((u && u.dot) || {}); } catch (e) { }
    const g = (typeof window.dotGrapeOn === 'function' && window.dotGrapeOn(u)) ? '|g' : '';   // 🍇 포도맛 물약 — 바뀐 머리
    return (u && u.code) + '|' + view + '|' + w + 'x' + h + '|' + bgOf(u) + '|' + d + g;
}
function build(u, view, w, h) {
    const V = VIEW[view] || VIEW.bust;
    const wrap = document.createElement('div');
    wrap.className = 'dp-pt';
    wrap.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;background:' + bgOf(u) + ';border-radius:inherit;';
    if (typeof window.dotSprite !== 'function' || !u) return wrap;
    const k = h / (V.y1 - V.y0);
    let el = null;
    try { el = window.dotSprite(u, { pose: 'stand', scale: k, live: false }); } catch (e) { el = null; }
    if (!el) return wrap;
    el.style.position = 'absolute';
    el.style.left = Math.round(w / 2 - V.cx * k) + 'px';
    el.style.top = Math.round(-V.y0 * k) + 'px';
    el.style.pointerEvents = 'none';
    wrap.appendChild(el);
    made++;
    return wrap;
}
// 같은 사람 · 같은 옷 · 같은 칸이면 만들어 둔 것을 베낀다 (목록을 자주 다시 그린다)
function portrait(u, view, w, h) {
    const k = keyOf(u, view, w, h);
    let t = cache[k];
    if (!t) {
        t = build(u, view, w, h);
        cache[k] = t;
        // 말풍선 글씨 장(nuow)처럼 늦게 갈아 끼는 층이 있다 — 조금 뒤 다시 만든다
        setTimeout(function () { if (cache[k] === t) delete cache[k]; }, 4000);
        return t.cloneNode(true);
    }
    return t.cloneNode(true);
}
window.dotPortrait = function (u, view, w, h) { return portrait(u, view || 'bust', w || 55, h || 70); };

// 상자 하나를 캐릭터로 — 이미 같은 것이면 그대로 둔다
function put(box, u, view, w, h) {
    if (!box || !u) return;
    const k = keyOf(u, view, w, h);
    const cur = box.querySelector(':scope > .dp-pt');
    if (cur && cur.dataset.k === k && !box.querySelector(':scope > img, :scope > span:not(.dp-keep)')) return;
    // 사진 · 「PHOTO」 · 묵은 캐릭터를 걷는다 (접속 중 불 같은 다른 것은 둔다)
    Array.prototype.slice.call(box.children).forEach(function (c) {
        if (c.tagName === 'IMG' || c.classList.contains('dp-pt') || (c.tagName === 'SPAN' && !c.classList.contains('dp-keep'))) c.remove();
    });
    Array.prototype.slice.call(box.childNodes).forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) n.remove(); });
    const p = portrait(u, view, w, h);
    p.dataset.k = k;
    box.appendChild(p);
}

// ==========================================
// 칸마다
// ==========================================
function paintBadge() {
    const u = u_(); if (!u) return;
    put(document.getElementById('badge-photo-display'), u, 'full', 130, 160);
    put(document.getElementById('card-mini-photo'), u, 'bust', 55, 70);
}
function codeOfCard(card) {
    const m = (card.getAttribute('onclick') || '').match(/openEmpDetailModal\('([^']+)'\)/);
    return m ? m[1] : null;
}
function paintList() {
    const box = document.getElementById('employee-cards-container');
    if (!box) return;
    const U = users();
    Array.prototype.forEach.call(box.querySelectorAll('.emp-list-card'), function (card) {
        const c = codeOfCard(card); const u = c && U[c];
        if (!u) return;
        put(card.querySelector('.emp-list-avatar'), u, 'bust', 45, 55);
    });
}
let detailCode = null;
function paintDetail() {
    const box = document.getElementById('emp-detail-card-container');
    if (!box || !detailCode) return;
    const u = users()[detailCode];
    if (!u) return;
    put(box.querySelector('.id-avatar-mini'), u, 'bust', 55, 70);
}
window.dotPortraitMe = function (el, size) {           // 광장 사원증 칸 (plaza.js paintMe)
    const u = u_(); if (!el || !u) return false;
    put(el, u, 'face', size || 32, size || 32);
    return true;
};

// 다시 그려지면 따라 바꾼다
function watch(id, fn) {
    let el = null, mo = null, busy = false;
    const hook = function () {
        const e = document.getElementById(id);
        if (!e || e === el) return;
        el = e;
        if (mo) mo.disconnect();
        mo = new MutationObserver(function () {
            if (busy) return;
            busy = true;
            try { fn(); } catch (x) { }
            setTimeout(function () { busy = false; }, 0);
        });
        mo.observe(e, { childList: true, subtree: true });
        try { fn(); } catch (x) { }
    };
    hook();
    setInterval(hook, 2000);
}
watch('badge-photo-display', paintBadge);
watch('card-mini-photo', paintBadge);
watch('employee-cards-container', paintList);
watch('emp-detail-card-container', paintDetail);

// 한 사람 열람 — 누구를 열었는지 적어 둔다 (여러 파일이 감싸 쓰므로 바깥에서 한 번 더 감싼다)
(function hookDetail() {
    const wrap = function () {
        const f = window.openEmpDetailModal;
        if (typeof f !== 'function' || f._dp) return;
        const w = function (code) { detailCode = code; const r = f.apply(this, arguments); try { paintDetail(); } catch (e) { } return r; };
        w._dp = true;
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        try { openEmpDetailModal = w; } catch (e) { }
        window.openEmpDetailModal = w;
    };
    wrap();
    setInterval(wrap, 1500);
})();

// 내 옷이 바뀌면(옷장 · 팔레트) 내 칸들도 — dot 이 바뀌면 열쇠가 달라져 저절로 새로 만든다
setInterval(function () {
    try {
        if (!u_()) return;
        paintBadge();
        const pm = document.querySelector('#plaza-me .pm-pic');
        if (pm) window.dotPortraitMe(pm, 32);
    } catch (e) { }
}, 2500);

// ==========================================
// 배경 색 고르기 — 사원증 칸, 사진 단추 자리에
// ==========================================
(function css() {
    const s = document.createElement('style');
    s.textContent = [
        '.dp-pt .dot-box{image-rendering:pixelated;}',
        '#dp-bg{display:flex;flex-direction:column;align-items:center;gap:7px;margin:0 auto 15px;}',
        '#dp-bg .dp-l{font-size:11px;color:#9a9182;}',
        '#dp-bg .dp-sw{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:260px;}',
        '#dp-bg .dp-sw button{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.22);padding:0;cursor:pointer;}',
        '#dp-bg .dp-sw button.on{border-color:#fff;box-shadow:0 0 0 2px #d4af37;}',
        '#dp-bg .dp-sw label{position:relative;width:24px;height:24px;border-radius:50%;border:2px dashed rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:12px;color:#ccc;cursor:pointer;overflow:hidden;}',
        '#dp-bg .dp-sw label input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}',
        '#badge-photo-display{background:transparent;}'
    ].join('\n');
    document.head.appendChild(s);
})();
function setBg(c) {
    const u = u_(); if (!u || !okHex(c)) return;
    if (!u.badge || typeof u.badge !== 'object') u.badge = {};
    if (u.badge.cbg === c) return;
    u.badge.cbg = c.toLowerCase();
    try { if (typeof saveFields === 'function') saveFields({ badge: 1 }); } catch (e) { }
    paintBadge(); paintPicker();
    try { const pm = document.querySelector('#plaza-me .pm-pic'); if (pm) window.dotPortraitMe(pm, 32); } catch (e) { }
    try { paintList(); } catch (e) { }
}
function paintPicker() {
    const box = document.getElementById('dp-bg'); if (!box) return;
    const cur = bgOf(u_());
    Array.prototype.forEach.call(box.querySelectorAll('.dp-sw button'), function (b) { b.classList.toggle('on', b.getAttribute('data-c') === cur); });
    const ci = box.querySelector('input[type=color]'); if (ci && ci.value !== cur) ci.value = cur;
    const lb = box.querySelector('label'); if (lb) lb.style.background = SW.indexOf(cur) < 0 ? cur : '';
}
function mountPicker() {
    const btn = document.querySelector('#rec-badge button[onclick*="badge-photo-input"]');
    const host = btn ? btn.parentNode : null;
    if (!host || document.getElementById('dp-bg')) return !!document.getElementById('dp-bg');
    host.style.display = 'none';                         // 사진 등록 / 변경
    const box = document.createElement('div');
    box.id = 'dp-bg';
    box.innerHTML = '<div class="dp-l">캐릭터 배경 색</div><div class="dp-sw">'
        + SW.map(function (c) { return '<button type="button" data-c="' + c + '" style="background:' + c + ';" title="' + c + '"></button>'; }).join('')
        + '<label title="마음대로 고르기">＋<input type="color" value="' + bgOf(u_()) + '"></label></div>';
    host.parentNode.insertBefore(box, host.nextSibling);
    Array.prototype.forEach.call(box.querySelectorAll('.dp-sw button'), function (b) { b.onclick = function () { setBg(b.getAttribute('data-c')); }; });
    const ci = box.querySelector('input[type=color]');
    ci.addEventListener('input', function () { setBg(ci.value); });
    ci.addEventListener('change', function () { setBg(ci.value); });
    paintPicker();
    return true;
}
(function () {
    const iv = setInterval(function () { if (mountPicker()) { paintPicker(); } }, 1000);
    setTimeout(function () { clearInterval(iv); setInterval(function () { mountPicker(); paintPicker(); }, 5000); }, 60000);
})();

window.dotPortraitState = function () {
    const u = u_();
    console.log('[사원증 캐릭터] 내 배경 색', bgOf(u), '· 만든 것', made, '· 쟁여 둔 것', Object.keys(cache).length, '· 열람 중', detailCode);
};
})();
