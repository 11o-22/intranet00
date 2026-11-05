// ==========================================
// ★ 뒤로가기로 앱이 바로 꺼지지 않게 — 「종료하시겠습니까?」 (2026-11-05 사용자)
// bundles.json 첫 묶음 앞쪽 — 다른 뒤로가기 손잡이(index.html 창 · shell.js 칸 · 채팅 · 테트리스)보다 먼저 듣는다
// ==========================================
//
// ■ 어떻게
//   · 맨 밑 칸(앱을 연 그 칸 — history.state 가 null) 위에 「지킴 칸」({ exitGuard: 1 })을 하나 깔아 둔다.
//     창 · 채팅 · 테트리스가 미는 칸은 그 위에 쌓인다. 그것들은 전처럼 뒤로가기로 닫힌다.
//   · 뒤로가기로 맨 밑 칸까지 내려왔는데, 그 뒤로가기로 닫힌 것(창 · 사택 칸 · 채팅 …)이 없으면 → 「종료하시겠습니까?」
//     이때는 지킴 칸이 없으므로 **뒤로가기를 한 번 더 누르면 앱이 꺼진다**.
//     닫힌 것이 있었으면 묻지 않고 지킴 칸만 다시 깐다.
//   · 「취소」 — 지킴 칸을 다시 깐다. 「종료」 — window.close() 를 해 본다.
//     ✗ 칸을 밀어 둔 앱은 브라우저가 스스로 닫지 못하게 막는다(설치한 앱 포함) — 그러면 「뒤로가기를 한 번 더 누르면
//       종료됩니다」를 눈에 띄게 다시 보인다.
//   · 스스로 history.back() 을 부른 것(창을 닫기 단추로 닫을 때 그 칸을 빼는 것)은 묻지 않는다 — history.back · go 를 감싸 그때를 적는다.
//   · 지킴 칸은 사람이 화면을 누를 때 깐다 — 크롬은 누르지 않고 민 칸을 뒤로가기에서 건너뛴다.
//   · 어둠 탐사 중에는 index.html 이 뒤로가기를 막는다 — 묻지 않는다.
//
// ■ 새로고침 · 누르기 전 (2026-11-05 사용자 「뒤로가기 하고, 새로고침 한 뒤에 다시 뒤로가기 누르면 팝업이 안 떠」)
//   ✗ 지킴 칸은 화면을 누를 때만 깔았다 — 새로고침 뒤 아무것도 안 누르고 뒤로가기를 누르면 지킴 칸이 없어 그대로 꺼졌다.
//     누르지 않고 밀어 둔 칸은 크롬이 뒤로가기에서 건너뛰므로(그 화면의 칸을 통째로) 미리 밀어 둘 수도 없다.
//     같은 까닭으로 뒤로가기로 무엇을 닫은 직후 · 알림을 확인 단추로 닫은 직후(스스로 뒤로)에 다시 민 지킴 칸도
//     크롬이 건너뛰어, 그다음 뒤로가기에 그대로 꺼졌다.
//   → 안드로이드에서는 그럴 때 지킴 칸 대신 **닫기 감시(CloseWatcher)** 를 하나 세운다. 기기 뒤로가기는 기록보다 이것이 먼저 받는다.
//     누르지 않아도 하나는 세울 수 있다 (크롬 126+). 받으면 「종료하시겠습니까?」 — 그동안은 감시가 없어 한 번 더 누르면 꺼진다.
//     화면을 누르면(지킴 칸을 깔 수 있게 되면) 감시를 걷고 지킴 칸으로 돌아간다. 누가 칸을 밀어도(창 · 채팅 …) 걷는다 — 그 칸이 뒤로가기를 받는다.
//     감시가 받았는데 사택 칸이 떠 있으면 칸만 닫는다 (shell.js 가 뒤로가기로 하던 것).
//     PC 에서는 감시가 Esc 키에 걸리므로 안 세운다 — 열 때 지킴 칸을 바로 깐다 (누르기 전이면 크롬은 건너뛰지만, 누르는 순간 살아난다).
//   · 새로고침하면 전 화면이 밀어 둔 칸의 이름표(지킴 칸 · 창)가 그대로 남아 있다 — 이 화면의 맨 밑으로 지운다 (replaceState).
//   · 뒤로가기로 전 화면의 칸에 내려와 새로 열렸으면(back_forward) — 나가려던 것이므로 감시를 세우지 않는다.
//
// ■ 「종료」가 안 눌린다 (2026-11-05 사용자 「팝업이 뜨면, 확인을 눌러서 나가야 하는데 확인이 안 눌려」)
//   ✗ 「종료」는 window.close() 를 불렀는데, 크롬은 **기록이 두 칸 이상인 창**은 스스로 닫지 못하게 막는다.
//     지킴 칸 · 창 · 채팅 · 테트리스가 기록(pushState)을 밀어 두므로 늘 두 칸이 넘어 한 번도 닫히지 않았다.
//   → 안드로이드(닫기 감시가 있는 곳)에서는 **기록을 아예 쌓지 않는다** — 「가짜 기록」.
//     · history.pushState(상태) — 진짜 기록 대신 상태를 제 목록(V)에 쌓고 닫기 감시를 하나 세운다.
//       기기 뒤로가기는 맨 위 감시부터 받으므로, 받으면 그 칸을 빼고 popstate(상태)를 대신 쏜다 — 창 · 채팅 · 테트리스는 전과 같이 닫힌다.
//     · history.back() · go(-n) — 쌓인 칸이 있으면 감시를 걷고 빼고 popstate 를 쏜다. history.state — 맨 위 칸의 상태.
//     · 맨 밑에는 늘 「지킴 감시」(G) 하나 — 받으면 「종료하시겠습니까?」. 진짜 기록이 한 칸이라 「종료」 의 window.close() 가 앱을 닫는다.
//     · 누르지 않고 세운 감시는 크롬이 앞 감시와 한 묶음으로 묶어 뒤로가기 한 번에 함께 닫는다 — 지킴 감시가 위 칸과 함께 닫혔으면 묻지 않고 다시 세운다.
//   · 그 밖(PC · 감시가 없는 브라우저)은 전처럼 진짜 기록에 지킴 칸 — 「종료」가 막히면 「한 번 더 누르면 종료」를 밝힌다.
//   · 이 바꿈 앞에 쌓여 있던 진짜 기록은 앱을 새로 열 때까지 남는다 — 그동안은 「종료」가 막힐 수 있다.
//
// ■ 콘솔
//   backExitState()

(function backExit() {
'use strict';

let progQ = [];          // 스스로 history.back · go 를 부른 때들 — popstate 하나에 하나씩 지운다 (1.5초 지나면 버린다)
let asking = false;      // 「종료하시겠습니까?」가 떠 있나
let leaving = false;     // 「종료」를 눌렀다
let shown = 0, guards = 0, watches = 0;
let W = null;            // 닫기 감시 (진짜 기록 쪽)
const CW = typeof window.CloseWatcher === 'function' && /Android/i.test(navigator.userAgent || '');
const H = window.history;
const NAT = { push: H.pushState, replace: H.replaceState, back: H.back, go: H.go };
const NAT_STATE = (function () { try { return (Object.getOwnPropertyDescriptor(History.prototype, 'state') || {}).get; } catch (e) { return null; } })();
function natState() { try { return NAT_STATE ? NAT_STATE.call(H) : null; } catch (e) { return null; } }
// 가짜 기록을 쓰나 — 안드로이드 + 닫기 감시 + state 를 덮어쓸 수 있을 때
let VIRT = false;
if (CW && NAT_STATE) {
    try {
        Object.defineProperty(H, 'state', { configurable: true, get: function () { return VIRT && V.length ? V[V.length - 1].state : natState(); } });
        VIRT = true;
    } catch (e) { VIRT = false; }
}

// ==========================================
// 가짜 기록 (안드로이드)
// ==========================================
const V = [];            // 쌓인 칸 { state, w: 닫기 감시 }
let G = null;            // 맨 밑 지킴 감시
let lastVClose = 0, vPushes = 0;
function vTopState() { return V.length ? V[V.length - 1].state : null; }
function fire() {
    const st = vTopState();
    setTimeout(function () { try { window.dispatchEvent(new PopStateEvent('popstate', { state: st })); } catch (e) { } }, 0);
}
function vPush(state) {
    const ent = { state: state === undefined ? null : state, w: null };
    try { const w = new window.CloseWatcher(); w.onclose = function () { vClosed(ent); }; ent.w = w; } catch (e) { }
    V.push(ent); vPushes++;
}
// 기기 뒤로가기가 이 칸의 감시를 닫았다
function vClosed(ent) {
    const i = V.indexOf(ent);
    if (i < 0) return;
    lastVClose = Date.now();
    V.splice(i).forEach(function (x) { if (x !== ent && x.w) { try { x.w.onclose = null; x.w.destroy(); } catch (e) { } } });
    fire();
    if (!V.length && !G) gArm();
}
// 스스로 뒤로 — 맨 위 칸부터 감시를 걷고 뺀다
function vBack(n) {
    let any = false;
    while (n-- > 0 && V.length) {
        const x = V.pop(); any = true;
        if (x.w) { try { x.w.onclose = null; x.w.destroy(); } catch (e) { } }
    }
    if (any) { fire(); if (!V.length && !G) gArm(); }
    return any;
}
function gArm() {
    if (!VIRT || G || asking || leaving || V.length) return false;
    try { G = new window.CloseWatcher(); G.onclose = gClosed; watches++; return true; } catch (e) { G = null; return false; }
}
function gClosed() {
    G = null;
    if (leaving || asking) return;
    if (V.length || Date.now() - lastVClose < 80) { gArm(); return; }   // 위 칸과 한 묶음으로 함께 닫혔다 — 그 뒤로가기는 위 칸 몫
    if (darkOn()) { gArm(); return; }                                    // 탐사 중 — 뒤로가기를 막는다 (index.html 과 같이)
    if (panelOpen()) { try { window.plazaPanelClose(); } catch (e) { } gArm(); return; }   // 사택 칸만 닫는다
    ask();
}

// history 를 감싼다 — 가짜 기록이면 가짜로, 아니면 진짜로 (스스로 부른 뒤로가기는 적어 둔다)
function sameUrl(url) {
    if (url == null || url === '') return true;
    try { return new URL(String(url), location.href).href === location.href; } catch (e) { return false; }
}
try {
    H.pushState = function (state, title, url) {
        if (VIRT && sameUrl(url)) { vPush(state); return; }
        unwatch();                                            // 누가 칸을 밀면 감시를 걷는다 — 그 칸이 뒤로가기를 받는다
        return NAT.push.apply(H, arguments);
    };
    H.replaceState = function (state, title, url) {
        if (VIRT && V.length && sameUrl(url)) { V[V.length - 1].state = state === undefined ? null : state; return; }
        return NAT.replace.apply(H, arguments);
    };
    H.back = function () {
        if (VIRT && vBack(1)) return;
        progQ.push(Date.now());
        return NAT.back.apply(H, arguments);
    };
    H.go = function (n) {
        n = Number(n) || 0;
        if (VIRT && n < 0 && V.length) { vBack(-n); return; }
        if (n !== 0) progQ.push(Date.now());
        return NAT.go.apply(H, arguments);
    };
} catch (e) { }

function atBottom() { return history.state == null; }
function guard() {
    if (VIRT || !atBottom() || asking || leaving) return;
    try { history.pushState({ exitGuard: 1 }, '', ''); guards++; } catch (e) { }
}
// 닫기 감시 — 맨 밑에서 지킴 칸을 깔 수 없을 때 (누르기 전 · 뒤로가기 직후)
function watch() {
    if (VIRT || !CW || W || asking || leaving || !atBottom()) return false;
    try { W = new window.CloseWatcher(); W.onclose = onWatch; watches++; return true; } catch (e) { W = null; return false; }
}
function unwatch() {
    if (!W) return;
    const w = W; W = null;
    try { w.onclose = null; w.destroy(); } catch (e) { }
}
function panelOpen() {
    const m = document.getElementById('main-screen');
    return !!(m && m.classList.contains('solo') && m.style.display !== 'none' && typeof window.plazaPanelClose === 'function');
}
function onWatch() {
    W = null;
    if (leaving || asking) return;
    if (darkOn()) { watch(); return; }                                   // 탐사 중 — 뒤로가기를 막는다 (index.html 과 같이)
    if (panelOpen()) { try { window.plazaPanelClose(); } catch (e) { } watch(); return; }   // 사택 칸만 닫는다
    ask();
}
// 뒤로가기 직후 맨 밑 — 감시를 세울 수 있으면 감시, 아니면 지킴 칸
function rearm() { if (!watch()) { try { history.pushState({ exitGuard: 1 }, '', ''); guards++; } catch (e) { } } }
// 사람이 누를 때 — 맨 밑이면 지킴 칸을 깐다 (다른 손잡이가 칸을 밀기 전에 — 잡는 단계에서)
['click', 'touchend', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function (e) { if (e && e.key === 'Escape') return; guard(); }, true);   // Esc 는 닫기 요청이다 (누른 것으로 치지 않는다)
});

// 지금 떠 있는 것들 — 뒤로가기 앞뒤로 견줘 무엇이 닫혔는지 본다
function sig() {
    const out = [];
    try {
        Array.prototype.forEach.call(document.querySelectorAll('body > *, #plaza-ov > *, #main-screen'), function (e) {
            if (e.id === 'exit-ask' || e.tagName === 'SCRIPT' || e.tagName === 'STYLE' || e.tagName === 'LINK') return;
            if (!e.getClientRects().length) return;
            const cs = getComputedStyle(e);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            out.push(e.id || String(e.className || e.tagName));
        });
        const bar = document.getElementById('plaza-bar');
        if (bar && bar.classList.contains('typing')) out.push('typing');
    } catch (e) { }
    return out.join('|');
}

function darkOn() { try { return typeof darkRun !== 'undefined' && !!darkRun; } catch (e) { return false; } }

window.addEventListener('popstate', function (e) {
    if (VIRT) { if (asking && e && e.isTrusted) hide(); return; }       // 가짜 기록 — 묻는 것은 지킴 감시가 한다
    if (leaving) return;
    if (asking) { hide(); return; }
    const now = Date.now();
    progQ = progQ.filter(function (t) { return now - t < 1500; });
    const prog = progQ.length > 0;
    if (prog) progQ.shift();
    const pre = sig();
    // 다른 손잡이들이 제 할 일(창 닫기 · 칸 다시 밀기)을 다 한 뒤에 본다
    setTimeout(function () {
        if (!atBottom()) return;                          // 아직 위에 칸이 있다
        if (prog || darkOn() || sig() !== pre) {          // 스스로 뺀 칸 · 탐사 중 · 이 뒤로가기로 무엇이 닫혔다
            rearm();
            return;
        }
        ask();
    }, 80);
}, true);

// ==========================================
// 「종료하시겠습니까?」
// ==========================================
(function css() {
    const s = document.createElement('style');
    s.textContent = [
        '#exit-ask{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.66);padding:16px;}',
        '#exit-ask .ea-card{width:min(86vw,300px);background:linear-gradient(180deg,#1c1a17,#0f0e0c);border:1px solid #6b5a2e;border-radius:14px;padding:20px 16px 14px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.6);}',
        '#exit-ask .ea-t{color:#e8d9b0;font-size:15.5px;font-weight:bold;margin-bottom:7px;}',
        '#exit-ask .ea-s{color:#8d8470;font-size:11.5px;margin-bottom:16px;transition:color .2s;}',
        '#exit-ask .ea-s.hot{color:#ffcf6b;}',
        '#exit-ask .ea-b{display:flex;gap:8px;}',
        '#exit-ask .ea-b button{flex:1;padding:10px 0;border-radius:10px;border:1px solid #4a4236;background:#24211c;color:#d8cfbf;font-weight:bold;font-size:13.5px;cursor:pointer;}',
        '#exit-ask .ea-b button.go{background:linear-gradient(145deg,#d4af37,#9c7a1c);color:#1a1405;border-color:#e6c870;}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
})();
function box() {
    let el = document.getElementById('exit-ask');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'exit-ask';
    el.innerHTML = '<div class="ea-card"><div class="ea-t">종료하시겠습니까?</div>'
        + '<div class="ea-s" id="ea-s">뒤로가기를 한 번 더 누르면 종료됩니다.</div>'
        + '<div class="ea-b"><button id="ea-no">취소</button><button class="go" id="ea-yes">종료</button></div></div>';
    ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        if (e.target === el || (e.target.closest && e.target.closest('#ea-no'))) { cancel(); return; }
        if (e.target.closest && e.target.closest('#ea-yes')) quit();
    });
    (document.body || document.documentElement).appendChild(el);
    return el;
}
function ask() {
    asking = true; shown++;
    const el = box();
    const s = el.querySelector('#ea-s'); if (s) s.classList.remove('hot');
    el.style.display = 'flex';
}
function hide() {
    asking = false;
    const el = document.getElementById('exit-ask');
    if (el) el.style.display = 'none';
}
function cancel() {
    hide();
    if (VIRT) { gArm(); return; }            // 누른 손으로 지킴 감시를 다시 세운다
    guard();                                 // 누른 손으로 지킴 칸을 다시 깐다
    if (atBottom()) watch();                 // 못 깔았으면 감시라도
}
function quit() {
    leaving = true;
    try { window.close(); } catch (e) { }
    // 브라우저가 막았다 — 뒤로가기 한 번이면 꺼진다는 것을 눈에 띄게
    setTimeout(function () {
        leaving = false;
        const s = document.getElementById('ea-s');
        if (s) { s.classList.remove('hot'); void s.offsetWidth; s.classList.add('hot'); }
    }, 300);
}
// 다른 데서 맨 밑으로 돌아왔을 때 떠 있으면 걷는다 (앞으로 가기 등)
window.addEventListener('pageshow', function () { if (!VIRT && asking && !atBottom()) hide(); });

// 열 때 — 새로고침이면 전 화면의 칸 이름표를 지워 이 화면의 맨 밑으로 · 뒤로가기로 열린 것이 아니면 감시를 세운다
(function boot() {
    let nav = '';
    try { const e = performance.getEntriesByType('navigation')[0]; nav = (e && e.type) || ''; } catch (e) { }
    if (natState() != null && (nav === 'reload' || nav === 'back_forward')) { try { NAT.replace.call(H, null, '', ''); } catch (e) { } }
    if (VIRT) { if (nav !== 'back_forward') gArm(); return; }
    // 감시를 못 쓰는 곳(PC · 오래된 브라우저)은 지킴 칸을 바로 깐다 — 누르기 전에 민 칸은 크롬이 건너뛰지만(그러면 전과 같다),
    //   한 번이라도 누르면 그 칸이 살아난다. 건너뛰지 않는 브라우저에서는 그대로 지킨다.
    if (nav !== 'back_forward' && !watch() && atBottom()) { try { history.pushState({ exitGuard: 1 }, '', ''); guards++; } catch (e) { } }
})();
window.backExitWatching = function () { return VIRT ? !!(G || V.length) : !!W; };

window.backExitState = function () {
    console.log('[뒤로가기 종료] 맨 밑', atBottom(), '· 지금 칸', JSON.stringify(history.state), '· 칸 수', history.length,
        '· 묻는 중', asking, '· 물은 횟수', shown, '· 지킴 칸 깐 횟수', guards, '· 닫기 감시', CW ? (W ? '서 있음' : '없음') : '못 씀', '· 세운 횟수', watches,
        '· 가짜 기록', VIRT ? ('씀 — 쌓인 칸 ' + V.length + ' · 지킴 감시 ' + (G ? '서 있음' : '없음') + ' · 쌓은 횟수 ' + vPushes) : '안 씀');
};
})();
