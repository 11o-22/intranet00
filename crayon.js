// ==========================================
// 🖍 반짝 크레용 — 닉네임 · 채팅 글자 · 닉네임 테두리 색 (2026-10-19)
// bundles.json 마지막 묶음, shop-bulk.js 뒤
// ==========================================
//
// ■ 물건
//   이름   🖍 반짝 크레용   (장비 · 상담사가 「물품 강제 꽂기」로만 준다 — 상점 · 뽑기에 없다)
//   거래   밀실 거래로 주고받는다 (건넬 것 · 요구할 것 모두). 상점에 되팔 수는 없다.
//
// ■ 장착하면
//   · 닉네임에 은은하게 빛나는 테두리가 둘러진다 (처음 색 #cfffd3).
//   · 장착 중 슬롯의 [해제] 왼쪽에 [색상] 단추가 생긴다.
//       [색상] → 닉네임 / 채팅 / 닉테두리 고르기 → 색 고르기(100가지) → 적용한다 / 그만둔다
//   · 해제하면 색이 다 빠진다. 고른 색은 남아 있다가 다시 장착하면 돌아온다.
//
// ■ 어디에 보이나 — 이름과 말이 뜨는 채팅 자리 전부
//       사내 채팅 (allchat.js)       광장 — 머리 위 이름 · 말풍선 · 글줄 · 채팅 창 (plaza.js)
//       파티 채팅 (index.html)       사택 대화 (dark.js)
//   각 자리는 그릴 때 window.crayonName · crayonSay · crayonBubbleCss 를 부른다
//   (이 파일이 없으면 전처럼 그린다). 남의 색은 내 화면의 사원 명부(db.users)에서 읽는다.
//
// ■ 서버 자리
//   users/<사번>/crayon = { n: 닉네임 색, c: 채팅 색, r: 테두리 색 }   ('#rrggbb', 없으면 기본)
//
// ■ 콘솔
//   crayonState()

(function crayon() {

const NAME = '🖍 반짝 크레용';
const RING0 = '#cfffd3';                 // 테두리 처음 색
const KINDS = [
    { k: 'n', t: '닉네임' },
    { k: 'c', t: '채팅' },
    { k: 'r', t: '닉테두리' }
];
// 100가지 — 맨 윗줄은 흰 · 회 · 금빛, 그 아래 아홉 줄은 같은 열이 같은 빛깔(옅은 → 짙은)
const COLORS = [
    '#ffffff', '#cfffd3', '#fff6dc', '#e6e6e6', '#c0c0c0', '#8c8c8c', '#5a5a5a', '#ffd700', '#e8c07a', '#b08d57',
    '#ffdbdb', '#ffeadb', '#fff8db', '#edffdb', '#dbffe4', '#dbfff6', '#dbf9ff', '#dbeaff', '#eadbff', '#ffdbf6',
    '#fdb9b9', '#fdd6b9', '#fdf0b9', '#dbfdb9', '#b9fdca', '#b9fdec', '#b9f2fd', '#b9d6fd', '#d6b9fd', '#fdb9ec',
    '#f99494', '#f9be94', '#f9e594', '#c7f994', '#94f9ae', '#94f9e0', '#94e9f9', '#94bef9', '#be94f9', '#f994e0',
    '#f56666', '#f5a166', '#f5d866', '#adf566', '#66f589', '#66f5d1', '#66ddf5', '#66a1f5', '#a166f5', '#f566d1',
    '#f43434', '#f48434', '#f4ce34', '#94f434', '#34f464', '#34f4c4', '#34d4f4', '#3484f4', '#8434f4', '#f434c4',
    '#f20d0d', '#f26c0d', '#f2c40d', '#80f20d', '#0df246', '#0df2b9', '#0dccf2', '#0d6cf2', '#6c0df2', '#f20db9',
    '#c11515', '#c15d15', '#c19f15', '#6bc115', '#15c140', '#15c196', '#15a4c1', '#155dc1', '#5d15c1', '#c11596',
    '#931a1a', '#934d1a', '#937b1a', '#57931a', '#1a9338', '#1a9375', '#1a7f93', '#1a4d93', '#4d1a93', '#931a75',
    '#6d1717', '#6d3b17', '#6d5c17', '#426d17', '#176d2d', '#176d58', '#175f6d', '#173b6d', '#3b176d', '#6d1758'
];

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function hex(v) { return (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v.toLowerCase() : ''; }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w; } catch (e) { return w; } }
function wearing(u) {
    return !!u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
function userOf(code) {
    const me = u_();
    if (me && code && me.code === code) return me;
    try { return (code && typeof db !== 'undefined' && db.users) ? (db.users[code] || null) : null; } catch (e) { return null; }
}
// 지금 보이는 색 — 장착하지 않았으면 null
function look(code) {
    const u = userOf(code);
    if (!wearing(u)) return null;
    const c = (u.crayon && typeof u.crayon === 'object') ? u.crayon : {};
    return { n: hex(c.n), c: hex(c.c), r: hex(c.r) || RING0 };
}
function light(h) {
    h = hex(h); if (!h) return false;
    const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
}

// ==========================================
// 1. 물건 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = {
                price: '???', usable: true, targetable: false, effect: 'equip', adminOnly: true,
                desc: '[장비] 반짝이는 크레용. 장착하면 닉네임에 은은하게 빛나는 테두리가 둘러지고, 닉네임 · 채팅 글자 · 테두리 색을 바꿀 수 있다.'
            };
        }
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME); } catch (e) { }
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 2. 그리는 자리가 부르는 것
// ==========================================
//   html 은 이미 이스케이프된 글이다 (부르는 쪽이 하던 그대로 넘긴다).
window.crayonName = function (code, html) {
    const L = look(code);
    if (!L) return html;
    return '<span class="cy-name" style="--cy-r:' + L.r + ';' + (L.n ? 'color:' + L.n + ' !important;' : '') + '">' + html + '</span>';
};
window.crayonSay = function (code, html) {
    const L = look(code);
    if (!L || !L.c) return html;
    return '<span class="cy-say" style="color:' + L.c + ' !important;">' + html + '</span>';
};
// 광장 말풍선 — 바탕이 밝아(#f4efe2) 옅은 색이면 글자에 어두운 테를 두른다
window.crayonBubbleCss = function (code) {
    const L = look(code);
    if (!L || !L.c) return '';
    return 'color:' + L.c + ';' + (light(L.c) ? 'text-shadow:0 0 2px rgba(0,0,0,.95),0 0 1px #000,0 1px 1px #000;' : '');
};
window.crayonOn = function (code) { return !!look(code); };

(function css() {
    const st = document.createElement('style');
    st.id = 'crayon-css';
    st.textContent = [
        // 닉네임 테두리 — 빛은 ::after 의 불투명도만 오르내린다 (줄이 많아도 가볍게)
        '.cy-name{position:relative;display:inline-block;padding:0 5px;margin:0 1px;border:1px solid var(--cy-r);',
        '  border-radius:6px;line-height:1.35;box-shadow:0 0 3px var(--cy-r);}',
        '.cy-name::after{content:"";position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;',
        '  box-shadow:0 0 9px 1px var(--cy-r),inset 0 0 4px var(--cy-r);opacity:.25;animation:cy-glow 2.8s ease-in-out infinite;}',
        '@keyframes cy-glow{0%,100%{opacity:.18;}50%{opacity:.7;}}',
        '@media (prefers-reduced-motion:reduce){.cy-name::after{animation:none;opacity:.4;}}',
        // 색 고르는 창
        '#cy-ov{position:fixed;inset:0;z-index:100060;display:flex;align-items:center;justify-content:center;',
        '  background:rgba(0,0,0,.74);padding:16px;}',
        '#cy-box{width:100%;max-width:360px;max-height:92dvh;overflow-y:auto;background:#17151c;border:1px solid #4a4058;',
        '  border-radius:10px;padding:16px 14px 14px;box-shadow:0 10px 30px rgba(0,0,0,.6);color:#ddd;}',
        '#cy-box h4{margin:0 0 12px;font-size:14px;text-align:center;color:#f0e6ff;letter-spacing:1px;}',
        '#cy-kinds{display:flex;gap:6px;margin-bottom:10px;}',
        '#cy-kinds button{flex:1;padding:9px 0;font-size:12px;border-radius:6px;cursor:pointer;background:#24212b;',
        '  color:#bbb;border:1px solid #3c3648;font-family:inherit;}',
        '#cy-kinds button.on{background:#3b2f52;color:#fff;border-color:#b59cf0;box-shadow:0 0 6px rgba(181,156,240,.35);}',
        '#cy-prev{background:#0e0d12;border:1px solid #2c2834;border-radius:8px;padding:12px 10px;margin-bottom:10px;',
        '  font-size:12px;line-height:1.7;text-align:left;}',
        '#cy-prev b{font-weight:bold;color:#9fd8ef;}',
        '#cy-now{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;color:#999;margin-bottom:8px;min-height:24px;}',
        '#cy-now i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:5px;border:1px solid #555;}',
        '#cy-def{padding:3px 9px;font-size:10px;border-radius:5px;background:#24212b;color:#aaa;border:1px solid #3c3648;cursor:pointer;font-family:inherit;}',
        '#cy-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-bottom:12px;transition:opacity .15s;}',
        '#cy-grid.off{opacity:.25;pointer-events:none;}',
        '#cy-grid button{aspect-ratio:1;border-radius:5px;border:1px solid rgba(255,255,255,.12);padding:0;cursor:pointer;min-width:0;}',
        '#cy-grid button.on{outline:2px solid #fff;outline-offset:1px;box-shadow:0 0 0 3px #000;}',
        '#cy-hint{font-size:11px;color:#8d8598;text-align:center;margin:-4px 0 10px;}',
        '#cy-btns{display:flex;gap:8px;}',
        '#cy-btns button{flex:1;padding:11px 0;font-size:13px;border-radius:6px;cursor:pointer;font-family:inherit;}',
        '#cy-no{background:#2a2730;color:#bbb;border:1px solid #444;}',
        '#cy-ok{background:linear-gradient(145deg,#6d55a8,#4a3a78);color:#fff;border:1px solid #9a84d8;font-weight:bold;}',
        '#cy-ok:disabled{opacity:.4;cursor:default;}'
    ].join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 3. [색상] — 고르는 창
// ==========================================
let pend = null, kind = '';
function close() { const o = document.getElementById('cy-ov'); if (o) o.remove(); pend = null; kind = ''; }
function curOf(k) {
    if (!pend) return '';
    return pend[k] || '';
}
function paint() {
    const ov = document.getElementById('cy-ov');
    if (!ov || !pend) return;
    const me = u_();
    ov.querySelectorAll('#cy-kinds button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === kind); });
    // 미리 보기
    const ring = pend.r || RING0;
    ov.querySelector('#cy-prev').innerHTML =
        '<b><span class="cy-name" style="--cy-r:' + ring + ';' + (pend.n ? 'color:' + pend.n + ' !important;' : '') + '">'
        + esc(me ? me.name : '나') + '</span></b> '
        + '<span style="' + (pend.c ? 'color:' + pend.c + ';' : 'color:#ddd;') + '">반짝 크레용으로 칠했습니다.</span>';
    // 지금 고른 곳의 색
    const now = ov.querySelector('#cy-now');
    if (!kind) {
        now.innerHTML = '<span>바꿀 곳을 먼저 고르세요.</span>';
    } else {
        const t = KINDS.filter(function (x) { return x.k === kind; })[0].t;
        const v = curOf(kind);
        const show = v || (kind === 'r' ? RING0 : '');
        now.innerHTML = '<span>' + t + ' · ' + (show ? '<i style="background:' + show + '"></i>' + show + (v ? '' : ' (기본)') : '기본') + '</span>'
            + '<button id="cy-def" type="button">기본으로</button>';
        now.querySelector('#cy-def').onclick = function () { pend[kind] = ''; paint(); };
    }
    const grid = ov.querySelector('#cy-grid');
    grid.classList.toggle('off', !kind);
    const sel = kind ? curOf(kind) : '';
    grid.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', !!sel && b.getAttribute('data-c') === sel); });
    ov.querySelector('#cy-hint').style.display = kind ? 'none' : 'block';
}
window.crayonOpen = function () {
    const me = u_();
    if (!me) return;
    if (!wearing(me)) { alert_(NAME + '을(를) 장착해야 색을 바꿀 수 있습니다.'); return; }
    close();
    const c = (me.crayon && typeof me.crayon === 'object') ? me.crayon : {};
    pend = { n: hex(c.n), c: hex(c.c), r: hex(c.r) };
    kind = '';
    const ov = document.createElement('div');
    ov.id = 'cy-ov';
    ov.innerHTML = '<div id="cy-box">'
        + '<h4>' + esc(NAME) + '</h4>'
        + '<div id="cy-kinds">' + KINDS.map(function (x) { return '<button type="button" data-k="' + x.k + '">' + x.t + '</button>'; }).join('') + '</div>'
        + '<div id="cy-prev"></div>'
        + '<div id="cy-now"></div>'
        + '<div id="cy-hint">닉네임 · 채팅 · 닉테두리 중 하나를 누르면 색을 고를 수 있습니다.</div>'
        + '<div id="cy-grid">' + COLORS.map(function (h) { return '<button type="button" data-c="' + h + '" title="' + h + '" style="background:' + h + '"></button>'; }).join('') + '</div>'
        + '<div id="cy-btns"><button type="button" id="cy-no">그만둔다</button><button type="button" id="cy-ok">적용한다</button></div>'
        + '</div>';
    document.body.appendChild(ov);
    ov.querySelectorAll('#cy-kinds button').forEach(function (b) { b.onclick = function () { kind = b.getAttribute('data-k'); paint(); }; });
    ov.querySelectorAll('#cy-grid button').forEach(function (b) { b.onclick = function () { if (!kind) return; pend[kind] = b.getAttribute('data-c'); paint(); }; });
    ov.querySelector('#cy-no').onclick = close;
    ov.querySelector('#cy-ok').onclick = apply;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    paint();
};
function apply() {
    const me = u_();
    if (!me || !pend) { close(); return; }
    if (!wearing(me)) { close(); alert_(NAME + '을(를) 장착하고 있지 않습니다.'); return; }
    const next = {};
    ['n', 'c', 'r'].forEach(function (k) { if (pend[k]) next[k] = pend[k]; });
    const before = JSON.stringify(me.crayon || {});
    me.crayon = next;
    close();
    if (JSON.stringify(next) === before) return;
    try { saveFields({ crayon: 1 }); } catch (e) { try { saveSelfFull(); } catch (x) { } }
    refreshAll();
    alert_('색을 바꿨습니다.');
}
// 바꾼 색이 바로 보이게 — 열려 있는 채팅들을 다시 그린다
function refreshAll() {
    ['renderChatLog', 'renderHouseChatLog', 'allChatRepaint', 'plazaRepaintChat'].forEach(function (n) {
        try { if (typeof window[n] === 'function') window[n](); } catch (e) { }
    });
}

// ==========================================
// 4. 장착 중 슬롯 — [해제] 왼쪽에 [색상]
// ==========================================
function decorate() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    box.querySelectorAll('button[onclick^="unequipWeapon"]').forEach(function (un) {
        const row = un.parentNode;                              // 이름 칸 + 단추
        if (!row || row.querySelector('.cy-btn')) return;
        const info = row.firstElementChild;
        const nm = info && Array.prototype.filter.call(info.querySelectorAll('span'), function (s) {
            return baseOf((s.textContent || '').trim()) === NAME;
        })[0];
        if (!nm) return;
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; gap:6px; flex-shrink:0; align-items:flex-start;';
        const b = document.createElement('button');
        b.className = 'game-btn cy-btn';
        b.textContent = '색상';
        b.style.cssText = 'margin:0; padding:6px 12px; flex-shrink:0; background:linear-gradient(145deg,#6d55a8,#4a3a78) !important; border-color:#9a84d8 !important; color:#fff !important;';
        b.onclick = function (e) { e.stopPropagation(); window.crayonOpen(); };
        row.insertBefore(wrap, un);
        wrap.appendChild(b);
        wrap.appendChild(un);
    });
}
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._crayon) { clearInterval(iv); return; }
        const _r = renderInventory;
        const w = function () {
            const r = _r.apply(this, arguments);
            try { decorate(); } catch (e) { console.warn('[반짝 크레용] 화면:', e); }
            return r;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._crayon = true;
        renderInventory = w; window.renderInventory = w;
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () { try { if (u_()) decorate(); } catch (e) { } }, 1500);   // 다른 길로 다시 그려졌을 때

// ==========================================
// 5. 밀실 거래 — 요구할 것 목록에도 넣는다
// ==========================================
//   되팔 수 없는 것(NO_SELL_ITEMS)은 요구 목록에서 빠지는데, 이것은 주고받는 물건이다.
function demandOpt() {
    const s = document.getElementById('p2p-demand-item');
    if (!s) return;
    if (Array.prototype.some.call(s.options, function (o) { return o.value === NAME; })) return;
    const o = document.createElement('option');
    o.value = NAME; o.textContent = NAME;
    s.appendChild(o);
}
(function hookP2P() {
    const iv = setInterval(function () {
        if (typeof renderP2PSelectBoxes !== 'function') return;
        if (renderP2PSelectBoxes._crayon) { clearInterval(iv); return; }
        const _r = renderP2PSelectBoxes;
        const w = function () {
            const r = _r.apply(this, arguments);
            try { demandOpt(); } catch (e) { }
            return r;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._crayon = true;
        renderP2PSelectBoxes = w; window.renderP2PSelectBoxes = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () { try { demandOpt(); } catch (e) { } }, 2000);

window.crayonState = function () {
    const me = u_();
    console.log('%c===== 🖍 반짝 크레용 =====', 'color:#cfffd3; font-size:13px');
    console.log('  물품 표 :', (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[NAME]) ? 'O' : '✗');
    console.log('  장착    :', wearing(me) ? 'O' : '-');
    console.log('  고른 색 :', JSON.stringify((me && me.crayon) || {}), '(테두리 기본 ' + RING0 + ')');
    console.log('  색 가짓수:', COLORS.length);
};

})();
