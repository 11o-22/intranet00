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
        '#main-screen.solo{position:fixed;inset:0;z-index:999990;width:100%;max-width:none;',
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
        '#shell-top{position:fixed;left:0;right:0;top:0;z-index:999991;display:none;',
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
function openPanel(tab, sub, title) {
    const m = el(MS);
    if (!m || !tab) return false;
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
    openTab = tab;
    const top = el('shell-top');
    if (top) {
        top.style.display = 'flex';
        top.querySelector('.nm').innerHTML = title || nameOfTab(tab);
    }
    try { m.scrollTop = 0; } catch (e) { }
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
        const after = function () { setTimeout(toPlaza, 60); };
        try { Promise.resolve(r).then(after, after); } catch (e) { after(); }
        return r;
    };
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

// 물리 뒤로가기로도 닫히게 — 칸이 떠 있으면 그것부터 닫는다
window.addEventListener('popstate', function () { if (openTab) closePanel(); });

window.shellState = function () {
    console.log('%c===== 🏠 사원 화면 =====', 'color:#ffcf8f; font-size:13px');
    console.log('  쪽     :', solo ? '사원 (광장이 집)' : '상담사 (옛 화면)');
    console.log('  띄운 칸 :', openTab || '없음');
    const ov = el('plaza-ov');
    console.log('  광장   :', ov ? (ov.classList.contains('plaza-base') ? '바탕으로 깔림' : '덮개로 떠 있음') : '안 열림');
};

console.log('[사원 화면] shellState() — 사원은 광장이 집, 상담사는 옛 화면 그대로');

})();
