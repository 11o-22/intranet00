// ==========================================
// 👗 밀실 거래 — 의상·악세도 주고받는다
// bundles.json 마지막 묶음, p2p-fix.js 뒤 · p2p-multi.js 앞
// ==========================================
//
// ■ 무엇을 더하나
//
//   밀실 거래는 **포인트**와 **소지품** 두 가지만 주고받을 수 있었습니다.
//   세 번째로 **의상·악세**를 더합니다. 건네기(일방 양도)와 바꾸기
//   (조건부 교환) 어느 쪽으로도 되고, 「담기」 바구니에 섞어 담아
//   「옷 한 벌 + 3만 P 를 주고 저 악세를 받는다」 같은 것도 됩니다.
//
// ■ 어디에 적히나
//
//   옷은 소지품과 달리 **개수가 없습니다.** users/<열쇠>/wardrobe/<옷열쇠>
//   하나가 있다·없다 뿐입니다. 그래서 수량 칸을 안 씁니다.
//
// ■ 세 파일이 나눠 맡습니다
//
//       p2p-wear.js   (이 파일) 무엇이 있나 · 누가 가졌나 · 고르는 칸
//       p2p-multi.js  바구니에 담기 · 제안서 만들기
//       p2p-fix.js    실제로 옮기기 (트랜잭션)
//
//   이 파일은 아래 넷을 내어 주고, 나머지 둘이 그것을 불러 씁니다.
//
//       p2pWearName(열쇠)             「면사포 (악세)」
//       p2pWearHas(사람, 열쇠)        가지고 있나
//       p2pWearAll()                  주고받을 수 있는 것 전부
//       p2pWearCheck(제물, 대가, 상대) 보내도 되나 (안 되면 까닭을 글로)
//
// ■ ★ 이미 가진 옷은 못 주고받습니다
//
//   옷장은 있다·없다 뿐이라, 이미 가진 옷을 또 받으면 **늘지 않는데 준
//   쪽에서는 없어집니다** — 한 벌이 그냥 사라집니다. 그래서 두 번 막습니다.
//
//       보낼 때   p2pWearCheck — 내 화면에 있는 상대 자료로 미리 본다
//       받을 때   p2p-fix.js   — 서버에서 상대 옷장을 읽어 다시 본다
//
//   보낼 때 것만으로는 모자랍니다. 제안서를 넣어 둔 사이에 상대가 그 옷을
//   뽑아 버릴 수 있기 때문입니다.
//
// ■ 이름표는 옷장 표(DOT_SLOTS)가 들고 있습니다
//
//   own 이 붙은 줄이 「뽑기로 가지는 것」입니다. 상담사 전용(admin)이나
//   사번 지정(nos)은 주고받을 거리가 아니라 빠집니다. 악세 마흔아홉 가지는
//   gacha.js 가 나중에 밀어 넣으므로, 가짓수가 바뀌면 표를 다시 셉니다.
//
// ■ 콘솔
//       p2pWearList()   주고받을 수 있는 옷 전부
//       p2pWearMine()   내가 가진 것

(function p2pWear() {

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function el(id) { return document.getElementById(id); }
function val(id) { const e = el(id); return e ? e.value : ''; }

// ==========================================
// 무엇이 있나
// ==========================================
function build() {
    const out = [];
    if (typeof DOT_SLOTS === 'undefined') return out;
    DOT_SLOTS.forEach(function (s) {
        s.items.forEach(function (it) {
            if (!it.own) return;
            out.push({ k: it.own, n: it.n, slot: s.n });
        });
    });
    return out;
}
let CACHE = null, COUNT = -1;
function all() {
    // 악세는 gacha.js 가 나중에 밀어 넣는다 — 가짓수가 바뀌면 다시 센다
    const n = (typeof DOT_SLOTS === 'undefined') ? 0
        : DOT_SLOTS.reduce(function (a, s) { return a + s.items.length; }, 0);
    if (!CACHE || n !== COUNT) { CACHE = build(); COUNT = n; }
    return CACHE;
}
function byKey(k) {
    const got = all().filter(function (x) { return x.k === k; });
    return got[0] || null;
}
function has(u, k) {
    try { return !!(u && u.wardrobe && u.wardrobe[k]); } catch (e) { return false; }
}
function mine() {
    const u = u_();
    return all().filter(function (x) { return has(u, x.k); });
}

window.p2pWearAll = all;
window.p2pWearHas = has;
window.p2pWearName = function (k) {
    const x = byKey(k);
    return x ? (x.n + ' (' + x.slot + ')') : String(k);
};

// ★ 보내도 되나 — 안 되면 **까닭을 글로** 돌려준다 (되면 빈 글)
//
//   oBu/dBu 는 [{k,v,q}, …] 묶음이다 (p2p-fix.js 의 bundle 과 같은 꼴).
window.p2pWearCheck = function (oBu, dBu, to) {
    const me = u_();
    const o = (oBu || []).filter(function (x) { return x.k === 'wear'; });
    const d = (dBu || []).filter(function (x) { return x.k === 'wear'; });
    for (let i = 0; i < o.length; i++) {
        if (!has(me, o[i].v)) return '가지고 있지 않은 의상·악세입니다 — ' + window.p2pWearName(o[i].v);
        if (to && has(to, o[i].v)) {
            return (to.name || '상대') + ' 사원은 ' + window.p2pWearName(o[i].v) + ' 을(를) 이미 가지고 있습니다.'
                + '\n\n보내도 늘지 않고 제 것만 없어집니다.';
        }
    }
    for (let i = 0; i < d.length; i++) {
        if (has(me, d[i].v)) {
            return '이미 가지고 계신 ' + window.p2pWearName(d[i].v) + ' 입니다.'
                + '\n\n받아도 늘지 않고 상대 것만 없어집니다.';
        }
        if (to && !has(to, d[i].v)) {
            return (to.name || '상대') + ' 사원은 ' + window.p2pWearName(d[i].v) + ' 을(를) 가지고 있지 않습니다.';
        }
    }
    return '';
};

// ==========================================
// 고르는 칸을 붙인다
// ==========================================
//
//   제물·대가 줄에 「의상·악세」를 하나 더 넣고, 그것을 고를 select 를
//   소지품 칸 옆에 세운다.
//   ★ 소지품 칸을 같이 쓰면 안 된다 — renderP2PSelectBoxes 가 그 칸을
//     주기적으로 다시 그려서 옷 목록을 덮어쓴다.
function addOpt(sel, v, n) {
    if (!sel) return;
    const got = Array.prototype.some.call(sel.options, function (o) { return o.value === v; });
    if (got) return;
    const o = document.createElement('option');
    o.value = v; o.textContent = n;
    sel.appendChild(o);
}
function mount() {
    const oT = el('p2p-offer-type'), dT = el('p2p-demand-type');
    if (!oT || !dT) return false;
    addOpt(oT, 'wear', '의상·악세');
    addOpt(dT, 'wear', '의상·악세');
    ['offer', 'demand'].forEach(function (side) {
        if (el('p2p-' + side + '-wear')) return;
        const near = el('p2p-' + side + '-item');
        if (!near || !near.parentNode) return;
        const s = document.createElement('select');
        s.id = 'p2p-' + side + '-wear';
        s.style.cssText = 'display:none; flex:2 1 140px; min-width:0;';
        near.parentNode.insertBefore(s, near.nextSibling);
    });
    return !!el('p2p-offer-wear');
}

// 고르던 것을 잃지 않게 — 내용이 같으면 손대지 않는다 (index.html 과 같은 길)
const seen = {};
function put(e, html) {
    if (!e || seen[e.id] === html) return;
    const was = e.value;
    e.innerHTML = html;
    seen[e.id] = html;
    if (was) e.value = was;
}
function opts(list, none) {
    return list.length ? list.map(function (x) {
        return '<option value="' + esc(x.k) + '">' + esc(x.n) + ' (' + esc(x.slot) + ')</option>';
    }).join('') : '<option value="">' + none + '</option>';
}
function fill() {
    // 건넬 쪽은 **내가 가진 것**, 요구할 쪽은 있는 것 전부
    put(el('p2p-offer-wear'), opts(mine(), '(가진 의상·악세 없음)'));
    put(el('p2p-demand-wear'), opts(all(), '(없음)'));
}

// 줄을 고르면 그 칸만 보인다
function showHide(side) {
    const w = el('p2p-' + side + '-wear');
    if (!w) return;
    const on = (val('p2p-' + side + '-type') === 'wear');
    w.style.display = on ? 'inline-block' : 'none';
    if (!on) return;
    // 의상·악세일 때는 소지품·포인트·수량 칸을 모두 감춘다
    ['item', 'points', 'qty'].forEach(function (x) {
        const e = el('p2p-' + side + '-' + x);
        if (e) e.style.display = 'none';
    });
}
window.p2pWearShow = function () { showHide('offer'); showHide('demand'); };

// 원래 함수 뒤에 한 가지를 더 한다
function after(name, fn) {
    const f = window[name];
    if (typeof f !== 'function' || f._wear) return false;
    const g = function () {
        const r = f.apply(this, arguments);
        try { fn.apply(this, arguments); } catch (e) { console.warn('[밀실·옷]', name, e); }
        return r;
    };
    g._wear = 1;
    window[name] = g;
    return true;
}

// ==========================================
// 붙이기 — 화면이 다시 그려져도 따라붙는다
// ==========================================
let on = false;
function install() {
    if (on) return true;
    if (!mount()) return false;
    after('toggleP2POfferType', function () { showHide('offer'); });
    after('toggleP2PDemandType', function () { showHide('demand'); });
    after('renderP2PSelectBoxes', function () { mount(); fill(); });
    fill();
    showHide('offer'); showHide('demand');
    on = true;
    console.log('[밀실·옷] 의상·악세 ' + all().length + '가지를 주고받을 수 있습니다');
    return true;
}
const iv = setInterval(function () { if (install()) clearInterval(iv); }, 600);
setTimeout(function () { clearInterval(iv); }, 30000);

// 칸이 다시 그려지면 (화면을 옮겼다 돌아오면) 다시 붙인다
setInterval(function () {
    try {
        const p = el('shop-p2p');
        if (!p || !p.offsetParent) return;        // 안 보이면 아무것도 안 한다
        if (mount()) fill();
    } catch (e) { }
}, 1000);

// ==========================================
// 콘솔
// ==========================================
window.p2pWearList = function () {
    console.log('%c===== 주고받을 수 있는 의상·악세 =====', 'color:#c9a8ff; font-size:13px');
    console.table(all().map(function (x) { return { 열쇠: x.k, 이름: x.n, 칸: x.slot }; }));
};
window.p2pWearMine = function () {
    const m = mine();
    if (!m.length) { console.log('[밀실·옷] 가진 의상·악세가 없습니다.'); return; }
    console.table(m.map(function (x) { return { 열쇠: x.k, 이름: x.n, 칸: x.slot }; }));
};

console.log('[밀실·옷] p2pWearList() · p2pWearMine()');

})();
