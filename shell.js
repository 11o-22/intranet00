// ==========================================
// ★ 🏠 사원 화면 — 광장이 집이다
// bundles.json 마지막 묶음, plaza.js 바로 뒤
// ==========================================
//
// ■ 무엇이 달라지나
//
//   사원은 로그인하면 **바로 광장**에 선다. 머리말·사원증 띠·탭 띠로 된
//   옛 메인 화면은 안 보인다. 대신 ☰ 메뉴에서 고르면 그 칸 하나만
//   광장 위에 떠오르고, 닫으면 광장으로 돌아온다.
//
//   상담사(kario0987)는 **지금 그대로**다 — 옛 화면으로 들어간다.
//   통제 콘솔이 그 화면에 매여 있어서다.
//
// ■ 칸을 옮겨 심지 않는다
//
//   칸(tab-record · tab-shop …)과 그 안의 코드는 한 줄도 안 건드린다.
//   옮겨 심으면 거기 걸린 수백 군데가 같이 흔들린다. 그 대신
//
//       · #main-screen 에 .solo 를 붙여 **머리말·사원증 띠·탭 띠만 감춘다**
//       · 고른 칸 하나만 active 로 둔다 (switchTabById 가 하던 일 그대로)
//       · 광장 위에 띄우고, 닫는 단추를 하나 얹는다
//
//   그래서 칸 안의 코드는 제가 어디에 떠 있는지 몰라도 된다.
//
// ■ 쌓임 차례 — 광장을 **맨 아래**로 내린다
//
//   광장 덮개는 z-index 999995 다. 사내 창(모달)들은 10000·99999 라
//   그대로 두면 광장 **뒤에** 가려 안 보인다. 그래서 지금까지는 창을
//   열기 전에 광장을 닫았다.
//
//   이제 광장은 닫히지 않고 **바탕**이 되어야 하므로, 사원 쪽에서는
//   광장을 z-index 1 로 내린다. 그러면 칸이든 모달이든 다 그 위에 뜬다.
//   상담사 쪽은 옛 화면을 덮어야 하니 999995 그대로 둔다.
//
// ■ 콘솔
//       shellState()    지금 어느 쪽으로 돌고 있나

(function shell() {

const ADMIN = 'kario0987';
const MS = 'main-screen';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isBoss() { const u = me(); return !!(u && u.code === ADMIN); }
// ★ getElementById 가 아니라 querySelector 를 쓴다.
//   시험틀의 가짜 firebase 쪽 getElementById 는 **없는 칸을 만들어 돌려주는**
//   버릇이 있어, 「광장이 이미 열렸나」를 그것으로 물으면 늘 열렸다고 한다.
function el(id) { return document.querySelector('#' + id); }

// 사원 쪽으로 돌고 있나 (= 광장이 집이다)
let solo = false;
let openTab = null;

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('shell-css')) return;
    const s = document.createElement('style');
    s.id = 'shell-css';
    s.textContent = [
        // 광장이 바탕일 때 — 맨 아래로 내린다 (위 설명 참고)
        '#plaza-ov.plaza-base{z-index:1;}',
        // 칸 하나만 띄운 꼴
        //
        // ★ z-index 를 **2** 로 둔다 (한때 999990 이었다).
        //
        //   사내 창(모달)들은 10000·10003·99999 로 떠 있다. 칸을 999990 에
        //   두면 그 위를 칸이 덮어, 칸 안에서 연 것이 **안 보인다.** 사택
        //   오락실 테트리스(10003)가 그래서 상담사만 되고 사원은 안 됐다 —
        //   상담사는 칸이 그냥 흐름 속에 있어(auto) 창이 제대로 떴다.
        //   광장을 1 로 깔아 두었으니 칸은 2 면 충분하고, 그러면 창들은
        //   상담사 쪽과 똑같이 그 위로 뜬다. (머리 띠는 3)
        '#main-screen.solo{position:fixed;inset:0;z-index:2;width:100%;max-width:none;',
        '  margin:0;overflow-y:auto;-webkit-overflow-scrolling:touch;',
        '  background:linear-gradient(180deg,#0c0c12,#08080c);',
        '  padding:calc(var(--shell-top,0px) + 56px) 14px calc(var(--shell-bot,0px) + 18px) 14px;}',
        // 머리말 · 사원증 띠 · 탭 띠는 감춘다 (칸 안쪽은 그대로 둔다)
        '#main-screen.solo > .header-info,',
        '#main-screen.solo > .id-card-badge,',
        '#main-screen.solo > .tabs-grid{display:none !important;}',
        // ★ 칸 안의 **위 고르는 줄**도 없앤다 — 거기 있는 것은 이미 목록에서
        //   바로 고를 수 있어서, 두 번 고르게 되는 꼴이었다.
        //   다만 **목록에 없는 것**이 든 줄(공용시설의 슬롯·룰렛…, 사택의
        //   대화·보관함…, 어둠 탐사의 기록 소실·탐사 기록)은 남겨 둔다.
        //   없애면 그 안으로 들어갈 길이 사라진다.
        //   (상점 쪽은 한 겹 더 들어가 있어 > 가 아니라 자손으로 집는다)
        '#main-screen.solo #tab-record > .sub-tabs-grid,',
        '#main-screen.solo #tab-shop .sub-tabs-grid{display:none !important;}',
        // 띄운 칸의 머리 — 이름과 닫는 단추
        '#shell-top{position:fixed;left:0;right:0;top:0;z-index:3;display:none;',
        '  align-items:center;gap:10px;pointer-events:none;',
        '  padding:calc(var(--shell-top,0px) + 9px) 12px 14px 12px;',
        '  background:linear-gradient(180deg,rgba(8,8,12,.96),rgba(8,8,12,.72) 62%,rgba(8,8,12,0));}',
        '#shell-top > *{pointer-events:auto;}',
        '#shell-top .nm{flex:1;min-width:0;display:flex;align-items:center;gap:8px;',
        '  font-size:13px;font-weight:bold;color:#f1e7d6;',
        '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#shell-top button{flex:0 0 auto;width:40px;height:40px;border-radius:50%;cursor:pointer;',
        '  border:1px solid rgba(190,170,120,.3);background:rgba(20,20,28,.8);color:#f1e7d6;',
        '  font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;}',
        '#shell-top button:active{background:rgba(44,40,30,.9);}',
        // 그림 아이콘 — 흰 그림을 **마스크**로 써서 글자색을 그대로 입는다
        '.pico{display:inline-block;width:1.45em;height:1.45em;background:currentColor;',
        '  vertical-align:-.35em;flex:0 0 auto;',
        '  -webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}'
    ].join('\n');
    document.head.appendChild(s);
})();

function stampSafe() {
    const d = document.documentElement;
    const t = getComputedStyle(d).getPropertyValue('--sat') || '';
    d.style.setProperty('--shell-top', 'env(safe-area-inset-top, 0px)');
    d.style.setProperty('--shell-bot', 'env(safe-area-inset-bottom, 0px)');
}

// ==========================================
// ★ 칸 하나만 띄운다
// ==========================================
// ==========================================
// ★ 못 들어가는 칸 — 왜 못 들어가는지 **말해 준다**
// ==========================================
//
//   옛 화면에는 「굶으면 시설이 잠긴다」는 규칙이 있다. 포만감이 0 이면
//   공용시설·은행·상점·어둠 탐사가 잠기고, 열려 있던 칸은 updateUI 가
//   돌 때 **사택으로 밀어낸다** (사택 주방에서 먹으라는 뜻이다).
//
//   그런데 사원 화면은 칸 하나만 띄우는 꼴이라, 그 밀어내기가 일어나면
//   머리말은 「장기 은행」인데 안은 사택인 괴상한 모양이 됐다.
//   은행을 눌렀더니 은행이 떴다가 사택이 되는 일이 그래서 생겼다.
//
//   그래서 **들어가기 전에 막고 까닭을 알린다.** 이미 들어가 있다가
//   굶게 되면 칸을 닫고 알린다.
const LOCK_STARVE = ['tab-public', 'tab-vip', 'tab-shop', 'tab-darkness'];
const LOCK_QUAR = ['tab-public', 'tab-vip', 'tab-shop', 'tab-darkness', 'tab-house'];

function lockedWhy(tab) {
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u || !tab) return '';
    try {
        // 🔎 감지하는 눈 — 갇혀 있어도 은행은 열린다 (eye.js)
        const eyeBank = tab === 'tab-vip' && typeof window.wearsEye === 'function' && window.wearsEye(u);
        if (typeof isQuarantined === 'function' && isQuarantined(u)
            && LOCK_QUAR.indexOf(tab) >= 0 && !eyeBank) {
            return '여우 상담실 격리 중에는 들어갈 수 없습니다.';
        }
    } catch (e) { }
    if ((u.satiety || 0) <= 0 && LOCK_STARVE.indexOf(tab) >= 0) {
        return '포만감이 0 입니다.\n사택 주방에서 무엇이든 먹어야 다른 곳에 갈 수 있습니다.';
    }
    return '';
}
function say_(t) {
    try { if (typeof showCustomAlert === 'function') { showCustomAlert(t); return; } } catch (e) { }
    console.warn(t);
}

function openPanel(tab, sub, title) {
    const m = el(MS);
    if (!m || !tab) return false;
    // ★ 못 들어가는 칸이면 열지 않고 까닭만 알린다.
    //   그래도 **참을 돌려준다** — 거짓을 주면 광장이 「내가 못 맡았구나」
    //   하고 광장을 닫은 뒤 옛 화면을 띄운다.
    const why = lockedWhy(tab);
    if (why) { say_(why); return true; }
    stampSafe();
    try { if (typeof switchTabById === 'function') switchTabById(tab); } catch (e) { }
    // 칸을 열 때 하던 일 — switchTab 안에 박혀 있어 여기서 한 번 더 부른다
    try {
        if (tab === 'tab-house' && typeof renderHouse === 'function') renderHouse();
        if (tab === 'tab-vip' && typeof renderBank === 'function') renderBank();
    } catch (e) { }
    if (sub) setTimeout(function () { clickSub(sub); }, 30);

    m.classList.add('solo');
    m.style.display = 'flex';
    // 광장은 반드시 바탕(z-index 1)이어야 한다 — 칸이 2 라서 그렇다.
    //   로그인할 때 한 번 붙이지만, 광장을 닫았다 다시 열면 새로 만들어져
    //   표가 사라진다. 칸을 열 때마다 한 번 더 붙여 둔다.
    const pov = el('plaza-ov');
    if (pov) pov.classList.add('plaza-base');
    openTab = tab;
    const top = el('shell-top');
    if (top) {
        top.style.display = 'flex';
        top.querySelector('.nm').innerHTML = title || nameOfTab(tab);
    }
    try { m.scrollTop = 0; } catch (e) { }
    setTimeout(facLine, 40);     // 포인트 · 포만감 · 오염도 (공용시설이면 남은 횟수도)
    return true;
}

// 아래 칸(sub-tab)은 **단추를 눌러** 연다 — 눌렀을 때 하는 일이 단추에 걸려 있다
function clickSub(sub) {
    const b = Array.prototype.filter.call(document.querySelectorAll('.sub-tab'), function (e) {
        return (e.getAttribute('onclick') || '').indexOf("'" + sub + "'") >= 0;
    })[0];
    if (b) { try { b.click(); } catch (e) { } }
}

function nameOfTab(tab) {
    const t = Array.prototype.filter.call(document.querySelectorAll('.tabs-grid .tab'), function (e) {
        return (e.getAttribute('onclick') || '').indexOf("'" + tab + "'") >= 0;
    })[0];
    return t ? t.innerText : '';
}

function closePanel() {
    try { const f = document.querySelector('#shell-fac'); if (f) f.remove(); } catch (e) { }
    const m = el(MS);
    if (m) { m.classList.remove('solo'); m.style.display = 'none'; }
    const top = el('shell-top');
    if (top) top.style.display = 'none';
    openTab = null;
}

// 광장이 쓰는 문 — 칸을 띄워 달라고 한다. 사원 쪽일 때만 받는다.
window.plazaPanel = function (tab, sub, title) {
    if (!solo) return false;
    return openPanel(tab, sub, title);
};
window.plazaPanelClose = closePanel;
// 지금 사원 쪽으로 돌고 있나 — 광장이 이것으로 길을 가른다
window.plazaSolo = function () { return solo; };

// ==========================================
// ★ 로그인한 뒤 — 사원은 광장으로, 상담사는 옛 화면으로
// ==========================================
function toPlaza() {
    if (isBoss()) return;                     // 상담사는 건드리지 않는다
    solo = true;
    const m = el(MS);
    if (m) { m.style.display = 'none'; m.classList.remove('solo'); }
    const r = el('ranking-bottom-bar');
    if (r) r.style.display = 'none';          // 옛 화면에 딸린 띠다
    const top = el('shell-top');
    if (top) top.style.display = 'none';
    // plazaOpen 은 이미 열려 있으면 제가 알아서 그냥 돌아온다
    try { if (typeof plazaOpen === 'function') plazaOpen(); } catch (e) { }
    const ov = el('plaza-ov');
    if (ov) ov.classList.add('plaza-base');   // 창들이 광장 위에 뜨게 내려 놓는다
}

(function hookLogin() {
    const old = window.attemptLogin;
    if (typeof old !== 'function') return;
    window.attemptLogin = function () {
        const r = old.apply(this, arguments);
        // ★ 들어오지 못했으면(사원명 · 인가 코드가 틀림 등) 광장을 열지 않는다 (2026-10-21)
        //   열면 광장의 「아직 들어갈 수 없습니다.」가 로그인의 알림을 덮어썼다
        const after = function () { setTimeout(function () { const u = me(); if (u && u.code) toPlaza(); }, 60); };
        try { Promise.resolve(r).then(after, after); } catch (e) { after(); }
        return r;
    };
})();

// ★ 자동 로그인이 이 묶음보다 먼저 끝났을 때 (2026-10-20)
//
//   자동 로그인(index.html tryAutoLogin)은 첫 화면 글 안에서 바로 돈다. 그런데 이 파일은
//   **마지막 묶음(b/08.js · 4MB 넘음)** 에 들어 있어서, 내 기록을 읽어 오는 것이 이 묶음이
//   다 내려오는 것보다 빠르면 위 hookLogin 이 걸리기 **전에** 로그인이 끝나 버린다.
//   그러면 toPlaza 가 한 번도 안 불려 사원이 옛 화면으로 들어갔다 (묶음이 커질수록 자주).
//   → 이 파일이 올라온 뒤 잠깐 지켜보다가, 이미 들어와 있는 사원이면 그때 광장으로 보낸다.
//     (로그인이 도중이었으면 끝나기를 기다린다 · 상담사는 건드리지 않는다)
(function lateStart() {
    let n = 0;
    const iv = setInterval(function () {
        n++;
        const u = me();
        const login = el('login-screen');
        const inNow = !!(u && u.code && (!login || getComputedStyle(login).display === 'none'));
        if (inNow) {
            clearInterval(iv);
            if (!isBoss() && !solo) { toPlaza(); console.log('[사원 화면] 로그인이 먼저 끝나 있어 광장으로 보냈습니다'); }
            return;
        }
        if (n > 80) clearInterval(iv);              // 20초 — 그 뒤 로그인은 hookLogin 이 받는다
    }, 250);
})();

// 나갈 때 되돌려 놓는다 — 다음에 상담사로 들어올 수도 있다
(function hookLogout() {
    const old = window.logout;
    if (typeof old !== 'function') return;
    window.logout = function () {
        closePanel();
        solo = false;
        try { if (typeof plazaClose === 'function') plazaClose(); } catch (e) { }
        const m = el(MS);
        if (m) m.classList.remove('solo');
        return old.apply(this, arguments);
    };
})();

// ==========================================
// 닫는 단추를 하나 얹어 둔다
// ==========================================
(function bar() {
    const make = function () {
        if (el('shell-top')) return;
        const d = document.createElement('div');
        d.id = 'shell-top';
        d.innerHTML = '<div class="nm"></div><button id="shell-x" title="닫는다">✕</button>';
        document.body.appendChild(d);
        d.querySelector('#shell-x').onclick = closePanel;
    };
    if (document.body) make();
    else document.addEventListener('DOMContentLoaded', make);
})();

// ==========================================
// ★ 공용시설 — 남은 횟수를 칸 안에 보여 준다
// ==========================================
//
//   하루 몇 번 쓸 수 있는지는 위 띠(.header-info)의 「공용시설 이용 n / 20회」
//   한 곳에만 적혀 있었다. 사원 화면은 그 띠를 감추므로, 사원은 몇 번
//   남았는지 볼 길이 아예 없었다. 그래서 칸 맨 위에 한 줄 얹는다.
//
//   한도에 닿으면 원래 있던 빨간 안내가 뜨므로, 여기서는 수만 알린다.
function facLine() {
    if (!solo) return;
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) return;
    // 띄운 칸 맨 위에 붙인다 — 칸마다 담는 그릇이 다르다.
    //   ★ #public-content-box 는 **늘 문서에 있다** (안 보일 뿐이다). 그래서
    //     그것부터 찾으면 소지품을 열어도 공용시설 안에 붙어 안 보였다.
    //     지금 띄운 칸(openTab)으로 가른다.
    if (!openTab) return;
    const pub = (openTab === 'tab-public');
    const box = (pub && document.querySelector('#public-content-box'))
             || document.getElementById(openTab);
    if (!box) return;
    let e = document.querySelector('#shell-fac');
    if (!e) {
        e = document.createElement('div');
        e.id = 'shell-fac';
    }
    if (e.parentNode !== box) box.insertBefore(e, box.firstChild);

    const cut = function (v) { return Math.max(0, Math.min(100, Math.round(Number(v) || 0))); };
    const sat = (u.satiety === undefined) ? 100 : cut(u.satiety);
    const pol = cut(u.pollution);
    const pt = Number(u.points || 0).toLocaleString('ko-KR');
    // 공용시설에서만 남은 횟수를 같이 적는다
    let html = '<div class="row"><span>포인트 <b>' + pt + ' P</b></span>';
    if (pub) {
        const max = u.facilityMax || 20;
        const used = Math.max(0, u.facilityCount || 0);
        const left = Math.max(0, max - used);
        // 쓴 수와 남은 수를 **둘 다** 적는다 — 몇 번 썼는지만 보여서는
        // 「얼마나 남았는지」를 머리로 빼야 한다. 다 쓰면 0회가 붉어진다.
        html += '<span class="sp">·</span><span>쓴 횟수 <b>' + used + '</b> / ' + max + '회</span>'
             + '<span class="sp">·</span><span>남은 횟수 <b class="' + (left ? '' : 'no') + '">'
             + left + '회</b></span>';
    }
    html += '</div>'
        + '<div class="bars">'
        + '<span class="lab">포만감</span><span class="bar sat"><i style="width:' + sat + '%"></i></span>'
        + '<b>' + sat + '</b>'
        + '<span class="lab">오염도</span><span class="bar pol"><i style="width:' + pol + '%"></i></span>'
        + '<b class="' + (pol >= 80 ? 'no' : '') + '">' + pol + '</b>'
        + '</div>';
    e.innerHTML = html;
}

(function facCss() {
    if (document.getElementById('shell-fac-css')) return;
    const s = document.createElement('style');
    s.id = 'shell-fac-css';
    s.textContent = [
        '#shell-fac{margin:0 0 11px 0;padding:9px 12px;border-radius:9px;font-size:11.5px;',
        '  color:#b5ab9a;background:rgba(255,255,255,.04);border:1px solid #2b2b38;',
        '  display:flex;flex-direction:column;gap:7px;}',
        // 공용시설은 적을 것이 셋이라 좁은 화면에서 넘친다 — 줄바꿈을 허락한다
        '#shell-fac .row{display:flex;justify-content:center;align-items:center;',
        '  flex-wrap:wrap;row-gap:4px;}',
        '#shell-fac b{color:#ffe9bd;}',
        '#shell-fac b.no{color:#ff8b7b;}',
        '#shell-fac .sp{opacity:.4;margin:0 7px;}',
        '#shell-fac .bars{display:grid;grid-template-columns:auto 1fr 28px auto 1fr 28px;',
        '  align-items:center;gap:5px 7px;font-size:10.5px;}',
        '#shell-fac .lab{color:#8d8578;white-space:nowrap;}',
        '#shell-fac .bar{height:7px;border-radius:999px;overflow:hidden;',
        '  background:rgba(8,8,12,.6);border:1px solid #2b2b38;}',
        '#shell-fac .bar i{display:block;height:100%;border-radius:999px;transition:width .3s;}',
        '#shell-fac .sat i{background:linear-gradient(90deg,#f44336,#ff9800,#8bc34a);}',
        '#shell-fac .pol i{background:linear-gradient(90deg,#4caf50,#ff9800,#f44336);}',
        '#shell-fac .bars b{text-align:right;font-size:10.5px;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// 한 번 쓸 때마다 수가 줄어든다 — 그릴 때마다 같이 고쳐 준다
(function hookUI() {
    const iv = setInterval(function () {
        if (typeof window.updateUI !== 'function') return;
        if (window.updateUI._fac) { clearInterval(iv); return; }
        const old = window.updateUI;
        window.updateUI = function () {
            const r = old.apply(this, arguments);
            try { facLine(); } catch (e) { }
            // 들어가 있는 사이에 굶거나 격리되면 — 밀려나기 전에 닫고 알린다
            try {
                if (solo && openTab) {
                    const why = lockedWhy(openTab);
                    if (why) { closePanel(); say_(why); }
                }
            } catch (e) { }
            return r;
        };
        window.updateUI._fac = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// ★ 물리 뒤로가기로도 닫히게 — 다만 **창이 닫히며 생긴 것**은 빼고
// ==========================================
//
//   index.html 은 창(모달)을 열 때 히스토리를 한 칸 밀어 넣고, 창을 닫을 때
//   history.back() 으로 그 칸을 뺀다 (물리 뒤로가기로 창을 닫게 하려고).
//   그런데 그 back() 도 popstate 를 일으킨다. 그래서 소지품에서 물건을
//   쓰고 「사용했습니다」 알림의 확인을 누르면, 알림이 빠지며 생긴 popstate
//   가 **칸까지 닫아** 소지품에서 그대로 튕겨 나왔다.
//
//   창이 스스로 뺀 것인지 가려내야 하는데, 그 표(isSystemAction·modalStack)는
//   index.html 안에만 있다. 그래서 **닫는 함수들을 감싸** 그때를 적어 두고,
//   그 직후에 온 popstate 는 넘긴다.
let backAt = 0;
(function modalBack() {
    const names = ['closeCustomAlert', 'closeLuxuryAlert', 'closeItemTargetModal',
                   'closeEmployeeListModal', 'closeEmpDetailModal', 'closeSuggestionModal',
                   'closeAdminScreen', 'closeVipGameOverlay'];
    const iv = setInterval(function () {
        let left = 0;
        names.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._shellBack) return;
            const old = f;
            window[n] = function () { backAt = Date.now(); return old.apply(this, arguments); };
            window[n]._shellBack = true;
        });
        if (!left) clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 20000);
})();

window.addEventListener('popstate', function () {
    if (Date.now() - backAt < 600) return;     // 창이 닫히며 빠진 칸이다
    if (openTab) closePanel();
});

window.shellState = function () {
    console.log('%c===== 🏠 사원 화면 =====', 'color:#ffcf8f; font-size:13px');
    console.log('  쪽     :', solo ? '사원 (광장이 집)' : '상담사 (옛 화면)');
    console.log('  띄운 칸 :', openTab || '없음');
    const ov = el('plaza-ov');
    console.log('  광장   :', ov ? (ov.classList.contains('plaza-base') ? '바탕으로 깔림' : '덮개로 떠 있음') : '안 열림');
};

console.log('[사원 화면] shellState() — 사원은 광장이 집, 상담사는 옛 화면 그대로');

})();
