// ==========================================
// 💤 밀실 거래 — 꿈결(D)도 주고받는다 (2026-10-19)
// bundles.json 마지막 묶음, p2p-multi.js 뒤
// ==========================================
//
// ■ 무엇을 더하나
//
//   제물 · 대가 줄에 「꿈결 (D)」를 하나 더 넣는다. 포인트처럼 숫자를 적어
//   건네기(일방 양도)에도, 바꾸기(조건부 교환)에도 쓰고, 「담기」 바구니에
//   물건 · 포인트 · 의상과 섞어 담을 수 있다.
//
// ■ 세 파일이 나눠 맡는다 (의상 · 악세와 같은 길)
//
//       p2p-dream.js  (이 파일) 고르는 줄과 숫자 칸
//       p2p-multi.js  바구니에 담기 · 가진 만큼인지 보기 · 제안서 만들기   (kind 'dream')
//       p2p-fix.js    실제로 옮기기 — users/<열쇠>/kroom/dream 트랜잭션    (kind 'dream')
//
//   옮길 때 덮어쓰지 않는다. 서버 값에서 빼고(모자라면 그만둔다) 더한다.
//
// ■ 콘솔
//   p2pDreamState()

(function p2pDream() {

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function el(id) { return document.getElementById(id); }
function val(id) { const e = el(id); return e ? e.value : ''; }
function myDream() {
    const u = u_();
    try { return Math.max(0, Math.floor(Number(u && u.kroom && u.kroom.dream) || 0)); } catch (e) { return 0; }
}

function addOpt(sel, v, n) {
    if (!sel) return;
    if (Array.prototype.some.call(sel.options, function (o) { return o.value === v; })) return;
    const o = document.createElement('option');
    o.value = v; o.textContent = n;
    sel.appendChild(o);
}
// 고르는 줄에 「꿈결 (D)」 · 숫자 칸을 붙인다 — 포인트 칸 바로 뒤
function mount() {
    const oT = el('p2p-offer-type'), dT = el('p2p-demand-type');
    if (!oT || !dT) return false;
    addOpt(oT, 'dream', '꿈결 (D)');
    addOpt(dT, 'dream', '꿈결 (D)');
    ['offer', 'demand'].forEach(function (side) {
        if (el('p2p-' + side + '-dream')) return;
        const near = el('p2p-' + side + '-points');
        if (!near || !near.parentNode) return;
        const i = document.createElement('input');
        i.type = 'number'; i.min = '1';
        i.id = 'p2p-' + side + '-dream';
        i.placeholder = '꿈결 (D)';
        i.style.cssText = 'display:none; flex:2 1 120px; min-width:0;';
        near.parentNode.insertBefore(i, near.nextSibling);
    });
    // 가진 꿈결 — 칸이 좁아(320px) 글자 칸 안에 못 넣으므로 줄 아래에 작게 적는다
    if (!el('p2p-offer-dream-have')) {
        const t = el('p2p-offer-type'), row = t && t.parentElement;
        if (row) {
            const h = document.createElement('div');
            h.id = 'p2p-offer-dream-have';
            h.style.cssText = 'display:none; font-size:10px; color:#c9a8ff; margin:-4px 0 8px 0;';
            row.insertAdjacentElement('afterend', h);
        }
    }
    return !!(el('p2p-offer-dream') && el('p2p-demand-dream'));
}
function hint() {
    const h = el('p2p-offer-dream-have');
    if (!h) return;
    const t = '보유 꿈결 ' + myDream().toLocaleString('ko-KR') + ' D';
    if (h.textContent !== t) h.textContent = t;
}

// 줄을 고르면 그 칸만 보인다
function showHide(side) {
    const d = el('p2p-' + side + '-dream');
    if (!d) return;
    const on = (val('p2p-' + side + '-type') === 'dream');
    d.style.display = on ? 'inline-block' : 'none';
    const h = (side === 'offer') ? el('p2p-offer-dream-have') : null;
    if (h) h.style.display = on ? 'block' : 'none';
    if (!on) return;
    // 꿈결일 때는 소지품 · 포인트 · 수량 · 의상 칸을 모두 감춘다
    ['item', 'points', 'qty', 'wear'].forEach(function (x) {
        const e = el('p2p-' + side + '-' + x);
        if (!e) return;
        // 수량 칸은 style.css 가 display:inline-block !important 로 늘 세워 둔다 — 같은 무게로 눕힌다
        //   (다른 줄로 바꾸면 원래 함수가 style.display = … 로 다시 적어 이 표시는 풀린다)
        if (x === 'qty') e.style.setProperty('display', 'none', 'important');
        else e.style.display = 'none';
    });
    if (side === 'offer') hint();
}
window.p2pDreamShow = function () { showHide('offer'); showHide('demand'); };

// 원래 함수 뒤에 한 가지를 더 한다 (표식은 옮겨 둔다 — 다른 파일이 다시 감싸지 않게)
function after(name, fn) {
    const f = window[name];
    if (typeof f !== 'function' || f._dream) return false;
    const g = function () {
        const r = f.apply(this, arguments);
        try { fn.apply(this, arguments); } catch (e) { console.warn('[밀실·꿈결]', name, e); }
        return r;
    };
    Object.keys(f).forEach(function (k) { try { g[k] = f[k]; } catch (e) { } });
    g._dream = 1;
    window[name] = g;
    return true;
}

let on = false;
function install() {
    if (on) return true;
    if (!mount()) return false;
    after('toggleP2POfferType', function () { showHide('offer'); });
    after('toggleP2PDemandType', function () { showHide('demand'); });
    after('renderP2PSelectBoxes', function () { mount(); hint(); });
    showHide('offer'); showHide('demand');
    on = true;
    console.log('[밀실·꿈결] 꿈결(D)을 주고받을 수 있습니다');
    return true;
}
const iv = setInterval(function () { if (install()) clearInterval(iv); }, 600);
setTimeout(function () { clearInterval(iv); }, 30000);

// 화면을 옮겼다 돌아와도 따라붙는다
setInterval(function () {
    try {
        const p = el('shop-p2p');
        if (!p || !p.offsetParent) return;
        if (mount()) { hint(); }
    } catch (e) { }
}, 1000);

window.p2pDreamState = function () {
    console.log('%c===== 밀실 — 꿈결 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  내 꿈결   :', myDream().toLocaleString() + ' D');
    console.log('  고르는 줄 :', (el('p2p-offer-dream') && el('p2p-demand-dream')) ? 'O' : '✗ (밀실 거래 칸이 아직 안 그려졌을 수 있습니다)');
};

})();
