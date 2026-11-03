// ==========================================
// ★ 사택 오락실 테트리스 — 조작 단추 · 팝업 막기 · 뒤로가기 (2026-11-01 사용자)
// bundles.json 마지막 묶음 — shell.js · allchat.js · plaza.js 보다 앞 (뒤로가기를 그쪽보다 먼저 받으려고)
// ==========================================
//
// ■ 무엇을
//
//   1. 조작 단추 — index.html #tetris-pad (간격을 두고 크게)
//        tetPadDown('L' | 'R' | 'down' | 'rot' | 'hold' | 'drop') · tetPadUp()
//        ◀ ▶ 는 누르고 있으면 이어서 움직인다 (170ms 뒤부터 50ms 마다) · ▼ 는 누르고 있으면 빠르게 내려간다 (dark.js tetSoftStart)
//      판 크기 — 화면 높이 · 폭에 맞춰 칸 크기(--tc)를 정한다 (14 ~ 24px). 넘치면 위아래로 밀린다.
//
//   2. 테트리스 도중에는 팝업이 뜨지 않는다 — 「테트리스 도중 테트리스 신청이나 여러 팝업이 안 뜨게 (임신 신청도)」
//        · 대전(테트리스) 신청 — 창을 띄우지 않고 저절로 물린다. 신청한 쪽에는 「지금 오락기 앞에 있어 받지 못했습니다」 (dark.js busy)
//        · 알림창(showCustomAlert) — 판이 끝날 때까지 모아 두었다가 끝나면 한꺼번에 보인다
//        · 그 밖의 창(임신 신청 · 우유 신청 · 여러 모달 …) — 테트리스 위로 뜨는 것(z-index 10003 넘는 것)은 판이 끝날 때까지
//          감춰 두었다가, 판이 끝나거나 나가면 되돌린다 (그 사이에 스스로 닫힌 것은 되돌리지 않는다)
//        「도중」 = 오락기 창이 떠 있고 판이 아직 끝나지 않았을 때 (솔로 · 대전)
//
//   3. 뒤로가기 — 오락기 창이 뜨면 히스토리를 한 칸 넣는다. 물리 뒤로가기를 누르면 앱이 꺼지지 않고
//      테트리스를 나와 광장으로 간다 (사택 칸은 shell.js 의 popstate 가 닫는다). 대전이 진행 중이면 나가지 않는다.
//      「나간다」 단추로 나오면 넣어 둔 칸을 스스로 뺀다 (그때 생긴 popstate 는 다른 곳에 넘기지 않는다 — 사택 칸이 닫히지 않게).
//
// ■ 콘솔
//   tetrisPlusState()

(function tetrisPlus() {
'use strict';

const OV = 'tetris-overlay';
const Z_TET = 10003;
function ov() { return document.getElementById(OV); }
function ovOpen() { const o = ov(); return !!(o && o.style.display === 'flex'); }
function T() { try { return (typeof tet !== 'undefined') ? tet : null; } catch (e) { return null; } }
function playing() { const t = T(); return ovOpen() && !!t && !t.over; }
window.tetPlaying = playing;
function say(html) {
    const m = document.getElementById('tetris-msg');
    if (!m) return;
    m.innerHTML = html;
    setTimeout(function () { if (m.innerHTML === html) m.innerHTML = ''; }, 1600);
}

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('tetris-plus-css')) return;
    const s = document.createElement('style');
    s.id = 'tetris-plus-css';
    // 크기는 모두 칸 하나(--tc)의 몇 배로 — tetFit 이 화면에 맞춰 --tc 를 정한다 (처음 값은 화면이 정해지기 전 임시)
    const U = function (k) { return 'calc(var(--tc) * ' + k + ')'; };
    s.textContent = [
        '#tetris-overlay{overflow:auto; -webkit-overflow-scrolling:touch; --tc:22px;}',
        '#tet-wrap{margin:auto; text-align:center; width:max-content; max-width:100%;}',
        '#tetris-title{font-size:10px; line-height:14px; color:#666; letter-spacing:1px; margin-bottom:8px;}',
        '#tet-main{display:grid; width:max-content; margin:0 auto; justify-content:center;'
            + ' grid-template-columns:auto ' + U(3.6) + '; column-gap:' + U(0.4) + ';'
            + ' grid-template-areas:"board side" "pad pad";}',
        '#tetris-board{grid-area:board; display:grid; grid-template-columns:repeat(10, var(--tc)); grid-template-rows:repeat(20, var(--tc));'
            + ' gap:1px; background:#050505; border:2px solid #2a2a2a; padding:3px; border-radius:4px; align-self:start;}',
        '#tetris-side{grid-area:side; text-align:left; min-width:0;}',
        '.tet-lab{font-size:max(10px, ' + U(0.42) + '); color:#888; margin-bottom:' + U(0.15) + ';}',
        '.tet-mini{display:grid; grid-template-columns:repeat(4, ' + U(0.6) + '); grid-template-rows:repeat(4, ' + U(0.6) + '); gap:1px; margin-bottom:' + U(0.55) + ';}',
        '#tetris-lines{font-size:' + U(1) + '; font-weight:bold; color:#d4af37; line-height:1.15; margin-bottom:' + U(0.4) + ';}',
        '#tetris-score{font-size:' + U(0.68) + '; font-weight:bold; color:#ddd; line-height:1.2; margin-bottom:' + U(0.4) + ';}',
        '#tetris-level{font-size:' + U(0.6) + '; font-weight:bold; color:#7fd4d4; line-height:1.2; margin-bottom:' + U(0.4) + ';}',
        '#tetris-rival{font-size:max(10px, ' + U(0.42) + '); color:#888; line-height:1.6;}',
        '#tetris-msg{font-size:12px; color:#aaa; margin-top:8px; min-height:18px; line-height:1.6;}',
        '#tetris-quit{display:block; width:100%; margin:8px 0 0 0 !important; height:34px; padding:0 !important; font-size:11px !important;'
            + ' background:#333 !important; border-color:#444 !important;}',
        // 단추 — 세로 꼴
        '#tetris-pad{grid-area:pad; margin-top:' + U(0.6) + '; display:flex; flex-direction:column; gap:' + U(0.45) + ';}',
        '#tetris-pad .tet-row{display:flex; justify-content:space-between; align-items:center; gap:' + U(0.5) + ';}',
        '#tetris-pad .tet-cluster{display:flex; gap:' + U(0.4) + '; width:100%; justify-content:space-between;}',
        '#tetris-pad .tet-btn{margin:0 !important; padding:0 !important; touch-action:manipulation; -webkit-user-select:none; user-select:none;'
            + ' -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; box-sizing:border-box; transition:transform .06s, filter .06s;}',
        // ◀ ▼ ▶ ↻ 드롭 한 줄 (2026-11-03 사용자) — 판 폭(칸 열넷쯤)에 들게 줄였다
        '#tetris-pad .tet-arrow{width:' + U(2.3) + ' !important; height:' + U(2.4) + ' !important; font-size:' + U(0.85) + ' !important;}',
        '#tetris-pad .tet-rot{width:' + U(2.5) + ' !important; height:' + U(2.4) + ' !important; font-size:' + U(1.1) + ' !important; border-radius:' + U(1.2) + ' !important;'
            + ' background:linear-gradient(145deg,#4a3a6a,#2a2040) !important; border-color:#7a6aa0 !important; color:#e6dcff !important;}',
        '#tetris-pad .tet-hold{width:' + U(5.2) + ' !important; height:' + U(1.8) + ' !important; font-size:max(12px, ' + U(0.52) + ') !important;}',
        '#tetris-pad .tet-drop{width:' + U(3.2) + ' !important; height:' + U(2.4) + ' !important; font-size:max(12px, ' + U(0.55) + ') !important; line-height:1.15 !important;}',
        '#tetris-pad .tet-hold{background:linear-gradient(145deg,#2a4a5a,#152830) !important; border-color:#3a6a7a !important; color:#7fd4d4 !important;}',
        '#tetris-pad .tet-drop{background:linear-gradient(145deg,#5a2a2a,#301515) !important; border-color:#7a3a3a !important; color:#ffb4a8 !important;}',
        '#tetris-pad .tet-key{font-size:9px; opacity:.6; margin-left:3px;}',
        '@media (pointer:coarse){ #tetris-pad .tet-key{display:none;} }',
        '#tetris-pad .tet-btn.on{filter:brightness(1.4); transform:scale(.95);}',
        // 넓은 화면 꼴 — 판 양옆에 홀드 · 다음 · 점수, 판 아래(「나간다」 위)에 ◀ ▼ ▶ ↻ 드롭 (2026-11-01 · 11-03 사용자)
        '#tet-main.wide{grid-template-columns:' + U(3.2) + ' auto ' + U(3.2) + '; column-gap:' + U(0.6) + ';'
            + ' grid-template-rows:auto auto 1fr auto auto auto;'
            + ' grid-template-areas:"holdbox board nextbox" ". board stats" ". board ." ". board ." "holdbtn board ." "dpad dpad dpad";}',
        '#tet-main.wide #tetris-side,#tet-main.wide #tetris-pad,#tet-main.wide .tet-row{display:contents;}',
        '#tet-main.wide #tetris-board{grid-row:1 / 6;}',
        '#tet-main.wide #tet-holdbox{grid-area:holdbox; text-align:left;}',
        '#tet-main.wide #tet-nextbox{grid-area:nextbox; text-align:left;}',
        '#tet-main.wide #tet-stats{grid-area:stats; text-align:left;}',
        '#tet-main.wide .tet-hold{grid-area:holdbtn; align-self:end; width:100% !important;}',
        '#tet-main.wide .tet-cluster{grid-area:dpad; display:flex; justify-content:center; gap:' + U(0.6) + '; margin-top:' + U(0.5) + '; width:auto;}',
        '#tet-main.wide .tet-arrow{width:' + U(2.8) + ' !important; height:' + U(1.9) + ' !important; font-size:' + U(0.8) + ' !important;}',
        // 넓은 화면에서도 ↻ · 드롭은 화살표 옆 (dpad 한 줄)
        '#tet-main.wide .tet-rot{width:' + U(2.8) + ' !important; height:' + U(1.9) + ' !important;}',
        '#tet-main.wide .tet-drop{width:' + U(3.6) + ' !important; height:' + U(1.9) + ' !important;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 0. 화면에 맞추기 — 칸 크기(--tc)와 꼴(세로 · 넓은 화면)
// ==========================================
//   두 꼴을 칸 20px · 30px 로 한 번씩 그려 높이 · 폭이 칸 크기에 따라 어떻게 느는지 재고,
//   화면(오락기 창의 안쪽)에 들어가는 가장 큰 칸 크기를 꼴마다 구해 더 큰 쪽을 쓴다 (12 ~ 60px).
//   폴드를 펼친 화면처럼 넓으면 「넓은 화면」 꼴이 이기고, 보통 폰은 세로 꼴이 이긴다.
let fitKey = '';
function tetFit(force) {
    const o = ov();
    if (!o || !ovOpen()) return;
    const wrap = document.getElementById('tet-wrap'), main = document.getElementById('tet-main');
    if (!wrap || !main) return;
    const cs = getComputedStyle(o);
    const W = o.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const H = o.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const key = W + 'x' + H;
    if (!force && key === fitKey) return;
    fitKey = key;
    const measure = function (wide, tc) {
        main.classList.toggle('wide', wide);
        o.style.setProperty('--tc', tc + 'px');
        return { w: main.offsetWidth, h: wrap.offsetHeight };
    };
    let best = { tc: 0, wide: false };
    [false, true].forEach(function (wide) {
        const a = measure(wide, 20), b = measure(wide, 30);
        const kw = (b.w - a.w) / 10, kh = (b.h - a.h) / 10;
        const tw = kw > 0 ? 20 + (W - a.w) / kw : 60, th = kh > 0 ? 20 + (H - a.h) / kh : 60;
        const tc = Math.max(12, Math.min(60, Math.floor(Math.min(tw, th) * 2) / 2));
        if (tc > best.tc + 0.5) best = { tc: tc, wide: wide };      // 거의 같으면 세로 꼴
    });
    // 글자 크기의 아랫단(최소 10 · 12px) 때문에 줄이 조금 휠 수 있다 — 넘치면 반 칸씩 줄인다
    let r = measure(best.wide, best.tc), n = 0;
    while ((r.h > H + 0.5 || r.w > W + 0.5) && best.tc > 12 && n++ < 40) { best.tc -= 0.5; r = measure(best.wide, best.tc); }
    o.dataset.fit = (best.wide ? 'wide' : 'tall') + ' ' + best.tc;
    try { if (T() && typeof tetDraw === 'function') tetDraw(); } catch (e) { }
}
window.tetFit = tetFit;
window.addEventListener('resize', function () { setTimeout(function () { tetFit(true); }, 60); });
window.addEventListener('orientationchange', function () { setTimeout(function () { tetFit(true); }, 300); });
let fitOpen = false;
setInterval(function () {
    const open = ovOpen();
    if (open && !fitOpen) { fitKey = ''; tetFit(true); setTimeout(function () { tetFit(true); }, 250); }
    else if (open) tetFit(false);
    fitOpen = open;
}, 150);

// ==========================================
// 1. 조작 단추
// ==========================================
let padT = null, padK = null;
window.tetPadDown = function (k) {
    window.tetPadUp();
    const t = T();
    if (!t || t.over) return;
    if (k === 'L' || k === 'R') {
        const d = k === 'L' ? -1 : 1;
        padK = k;
        tetMove(d);
        const rep = function () {
            if (padK !== k) return;
            const t2 = T(); if (!t2 || t2.over) { window.tetPadUp(); return; }
            tetMove(d);
            padT = setTimeout(rep, 50);
        };
        padT = setTimeout(rep, 170);
    } else if (k === 'down') { padK = k; tetSoftStart(); }
    else if (k === 'rot') tetRotate();
    else if (k === 'hold') tetHold();
    else if (k === 'drop') tetDrop();
};
window.tetPadUp = function () {
    if (padT) { clearTimeout(padT); padT = null; }
    if (padK === 'down') { try { tetSoftEnd(); } catch (e) { } }
    padK = null;
};
// 누른 단추 — 살짝 빛나게 (손가락이 어디 닿았는지 보이게)
function lit(on, e) {
    const b = e && e.target && e.target.closest ? e.target.closest('#tetris-pad .tet-btn') : null;
    if (on) { if (b) b.classList.add('on'); return; }
    Array.prototype.forEach.call(document.querySelectorAll('#tetris-pad .tet-btn.on'), function (x) { x.classList.remove('on'); });
}
document.addEventListener('pointerdown', function (e) { lit(true, e); }, true);
document.addEventListener('pointerup', function (e) { lit(false, e); }, true);
document.addEventListener('pointercancel', function (e) { lit(false, e); window.tetPadUp(); }, true);
window.addEventListener('blur', function () { window.tetPadUp(); });

// ==========================================
// 2. 테트리스 도중 팝업 막기
// ==========================================
// 2-1. 알림창 — 모아 두었다가 판이 끝나면
let allowUntil = 0;                      // 테트리스가 스스로 띄우는 알림 (대전 중에는 나갈 수 없습니다 …)
const held = [];
function allow(ms) { allowUntil = Date.now() + (ms || 900); }
(function hookAlert() {
    setInterval(function () {
        const f = window.showCustomAlert;
        if (typeof f !== 'function' || f._tetq) return;
        const w = function (msg) {
            if (playing() && Date.now() > allowUntil) { held.push(String(msg == null ? '' : msg)); return; }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._tetq = true;
        window.showCustomAlert = w;
        try { showCustomAlert = w; } catch (e) { }
    }, 700);
})();
(function hookExit() {
    const iv = setInterval(function () {
        if (typeof window.exitTetris !== 'function' || window.exitTetris._tetp) return;
        const f = window.exitTetris;
        const w = function () { allow(); window.tetPadUp(); return f.apply(this, arguments); };
        w._tetp = true;
        window.exitTetris = w;
        try { exitTetris = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 2-2. 대전 신청 — 창을 띄우지 않고 저절로 물린다
function busyDuel() {
    const m = document.getElementById('duel-invite-modal');
    if (!m || m.style.display === 'none') return;
    let inv = null;
    try { inv = (typeof duelInvite !== 'undefined') ? duelInvite : null; } catch (e) { inv = null; }
    m.style.display = 'none';
    if (inv && inv.id && typeof database !== 'undefined' && database) {
        try { database.ref('duels/' + inv.id).update({ busy: true, state: 'REJECTED' }); } catch (e) { }
    }
    try { duelInvite = null; } catch (e) { }
    console.log('[테트리스] 대전 신청을 물렸습니다 — 오락 중', inv && inv.hostName);
}

// 2-3. 그 밖의 창 — 테트리스 위로 뜨는 것을 감춰 두었다가 되돌린다
const HID = [];                         // { el, d } — 감출 때의 display 값
const SKIP_TAG = { SCRIPT: 1, STYLE: 1, LINK: 1, META: 1, NOSCRIPT: 1, TEMPLATE: 1, AUDIO: 1, VIDEO: 1 };
const NAMED = ['custom-alert-overlay', 'luxury-alert-overlay', 'duel-invite-modal', 'preg-ask-overlay', 'milk-ask-overlay'];
function above(el) {
    const o = ov();
    if (!el || el === o || SKIP_TAG[el.tagName] || (o && (el.contains(o) || o.contains(el)))) return false;
    if (el.id === 'custom-alert-overlay' && Date.now() <= allowUntil) return false;
    if (el.style.display === 'none') return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (cs.position !== 'fixed' && cs.position !== 'absolute') return false;
    const z = parseInt(cs.zIndex, 10);
    return z > Z_TET;
}
function hideOne(el) {
    let rec = null;
    for (let i = 0; i < HID.length; i++) if (HID[i].el === el) { rec = HID[i]; break; }
    const d = el.style.getPropertyValue('display');
    if (!rec) HID.push({ el: el, d: d });
    else rec.d = d;                      // 스스로 다시 띄웠다 — 그 값으로
    el.style.setProperty('display', 'none', 'important');
}
function sweep() {
    busyDuel();
    const seen = [];
    Array.prototype.forEach.call(document.body.children, function (el) { seen.push(el); });
    NAMED.forEach(function (id) { const el = document.getElementById(id); if (el && seen.indexOf(el) < 0) seen.push(el); });
    Array.prototype.forEach.call(document.querySelectorAll('.modal-overlay'), function (el) { if (seen.indexOf(el) < 0) seen.push(el); });
    seen.forEach(function (el) { try { if (above(el)) hideOne(el); } catch (e) { } });
}
function restore() {
    const list = HID.splice(0, HID.length);
    list.forEach(function (r) {
        const el = r.el;
        if (!el || !el.isConnected) return;
        // 우리가 감춘 그대로일 때만 (!important 가 붙은 none) — 그 사이에 스스로 닫혔으면 그대로 둔다
        if (el.style.getPropertyValue('display') !== 'none' || el.style.getPropertyPriority('display') !== 'important') return;
        el.style.removeProperty('display');
        if (r.d) el.style.display = r.d;
    });
    if (held.length) {
        const msgs = held.splice(0, held.length);
        const uniq = msgs.filter(function (m, i) { return m && msgs.indexOf(m) === i; });
        const text = uniq.length > 1 ? uniq.slice(-6).join('\n\n— — —\n\n') : (uniq[0] || '');
        if (text) setTimeout(function () { try { allow(); window.showCustomAlert(text); } catch (e) { } }, 250);
    }
}

let wasPlaying = false;
setInterval(function () {
    const p = playing();
    if (p) sweep();
    else if (wasPlaying || HID.length || held.length) restore();
    wasPlaying = p;
}, 200);

// ==========================================
// 3. 뒤로가기 — 테트리스를 나와 광장으로
// ==========================================
let tetHist = false, selfBack = false;
setInterval(function () {
    const open = ovOpen();
    if (open && !tetHist) {
        try { history.pushState({ tetris: 1 }, '', ''); tetHist = true; } catch (e) { }
    } else if (!open && tetHist) {
        tetHist = false;
        // 넣어 둔 칸이 맨 위에 있을 때만 스스로 뺀다
        if (history.state && history.state.tetris) { selfBack = true; try { history.back(); } catch (e) { selfBack = false; } setTimeout(function () { selfBack = false; }, 1500); }
    }
}, 150);
window.addEventListener('popstate', function (e) {
    if (selfBack) { selfBack = false; e.stopImmediatePropagation(); return; }     // 「나간다」로 나와 스스로 뺀 칸 — 사택 칸은 그대로
    if (!tetHist) return;
    if (history.state && history.state.tetris) return;                            // 위에 쌓였던 다른 칸이 빠졌다 — 테트리스는 그대로
    tetHist = false;
    if (!ovOpen()) return;
    const t = T();
    if (t && !t.over && t.mode === 'duel') {                                       // 대전 중 — 나가지 않는다
        e.stopImmediatePropagation();
        try { history.pushState({ tetris: 1 }, '', ''); tetHist = true; } catch (err) { }
        say('<span style="color:#f44336;">대전 중에는 나갈 수 없습니다.</span>');
        return;
    }
    try { window.exitTetris(); } catch (err) { console.warn('[테트리스] 나가기', err); }
    // 사택 칸은 shell.js 의 popstate 가 닫는다 → 광장
}, true);

// ==========================================
// 4. 블럭 모양 — 오락실에서 고른다 (2026-11-01 사용자 · 보내 준 그림 셋 · 같은 날 「S 에 한정하지 않고 전 사택에서」)
// ==========================================
//   base  기본 — 지금 그대로 (dark.js)
//   bevel 입체 — 고전 테트리스처럼 모서리가 깎인 블럭 (밝은 위 · 왼쪽 / 어두운 아래 · 오른쪽)
//   line  테두리 — 조각마다 바깥 테두리만 둥글게 (칸 사이 금 없이 한 조각이 한 덩어리 · dark.js tet.gid 로 조각을 가른다)
//   jelly 젤리 — 둥근 칸 · 윤이 나는 사탕 같은 블럭 (빈칸도 둥근 칸)
//   u.tetSkin = 'base' | 'bevel' | 'line' | 'jelly'   — 모든 사택 등급에서 고른다 (처음에는 S 사택 이상만이었다)
const SKIN_MIN = 'D';                 // 가장 낮은 등급부터 — 모든 사택 (2026-11-01 사용자 · 전에는 'S')
const SKINS = {
    base:  { n: '기본' },
    bevel: { n: '입체',   board: '#3a3a3a', gap: '0px',
             pal: { I: '#3fcfe0', O: '#e4cd3a', T: '#9a3ed6', S: '#4cc13a', Z: '#d83232', J: '#2a4ad8', L: '#e3922e', G: '#6d6d6d' } },
    line:  { n: '테두리', board: '#2a2d33', gap: '0px',
             // ★ 일곱 모양 모두 다른 색 (2026-11-01 사용자 — 전에는 I · J 가 파랑, O · L 이 흰색으로 겹쳤다)
             pal: { I: '#4a90e2', O: '#ececec', T: '#f2c14e', S: '#8fd14f', Z: '#e8584a', J: '#b07ce8', L: '#f0903a', G: '#6d717a' } },
    jelly: { n: '젤리',   board: '#232325', gap: '1px', empty: '#38383b',
             pal: { I: '#5fd23e', O: '#3d9df2', T: '#b44fe3', S: '#f4bf2f', Z: '#ea4a2e', J: '#d35fe0', L: '#f28b30', G: '#77777b' } }
};
const SKIN_KEYS = ['base', 'bevel', 'line', 'jelly'];
function me_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function skinOk(u) {
    try {
        if (!u) return false;
        if (SKIN_MIN === 'D') return true;
        if (typeof houseGrade !== 'function' || typeof HOUSE_GRADES === 'undefined') return false;
        return HOUSE_GRADES.indexOf(houseGrade(u)) >= HOUSE_GRADES.indexOf(SKIN_MIN);
    } catch (e) { return false; }
}
function skinNow() { const u = me_(); const k = u && u.tetSkin; return (skinOk(u) && SKINS[k]) ? k : 'base'; }
function rgb(h) { h = String(h).replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(h, to, t) { const a = rgb(h); return 'rgb(' + a.map(function (v) { return Math.round(v + (to - v) * t); }).join(',') + ')'; }
function lt(h, t) { return mix(h, 255, t); }
function dk(h, t) { return mix(h, 0, t); }
// 칸 하나 — view: 종류 글자 격자 · ids: 조각 번호 격자 · mini: 미리보기(작은 칸)
// 지금 칸 크기 (px) — 테두리 · 깎인 모서리 굵기를 칸에 맞춰 키운다 (폴드처럼 칸이 클 때 금이 가늘어 보이지 않게)
let TCPX = 22;
function tcNow() { try { const v = parseFloat(getComputedStyle(ov()).getPropertyValue('--tc')); return v > 0 ? v : 22; } catch (e) { return 22; } }
function cellHtml(sk, view, ids, x, y, mini, dim) {
    const S = SKINS[sk], c = view[y][x];
    if (sk === 'jelly') {
        const mg = mini ? '0.5px' : '1px';
        if (!c) return '<div style="margin:' + mg + '; border-radius:24%; background:' + (mini ? 'transparent' : S.empty) + ';"></div>';
        const col = dim ? S.pal.G : S.pal[c];
        return '<div style="margin:' + mg + '; border-radius:30%; background:linear-gradient(180deg,' + lt(col, .5) + ' 0%,' + lt(col, .18) + ' 24%,' + col + ' 46%,' + col + ' 78%,' + dk(col, .14) + ' 100%);'
            + ' box-shadow:inset 0 0 0 1px ' + lt(col, .32) + ';"></div>';
    }
    if (!c) return '<div></div>';
    const col = dim ? S.pal.G : S.pal[c];
    if (sk === 'bevel') {
        const b = mini ? 2 : Math.max(3, Math.round(TCPX * 0.13));
        return '<div style="box-sizing:border-box; background:linear-gradient(135deg,' + lt(col, .14) + ',' + col + ' 60%); border:' + b + 'px solid;'
            + ' border-color:' + lt(col, .38) + ' ' + dk(col, .28) + ' ' + dk(col, .36) + ' ' + lt(col, .22) + ';"></div>';
    }
    // line — 같은 조각이 이웃하면 그쪽은 열어 두고, 다르면 테두리. 볼록한 모서리는 둥글게, 오목한 모서리는 금을 이어 준다
    const id = ids[y][x];
    const same = function (dx, dy) {
        const yy = y + dy, xx = x + dx;
        return yy >= 0 && yy < view.length && xx >= 0 && xx < view[0].length && !!view[yy][xx] && ids[yy][xx] === id;
    };
    const m = mini ? 1 : Math.max(2, Math.round(TCPX * 0.08)), w = mini ? Math.max(1.5, Math.round(TCPX * 0.06 * 2) / 2) : Math.max(2, Math.round(TCPX * 0.09)),
          r = mini ? 2 : Math.max(4, Math.round(TCPX * 0.2));
    const T = same(0, -1), B = same(0, 1), L = same(-1, 0), R = same(1, 0);
    const ins = 'top:' + (T ? 0 : m) + 'px; bottom:' + (B ? 0 : m) + 'px; left:' + (L ? 0 : m) + 'px; right:' + (R ? 0 : m) + 'px;';
    const bw = (T ? 0 : w) + 'px ' + (R ? 0 : w) + 'px ' + (B ? 0 : w) + 'px ' + (L ? 0 : w) + 'px';
    const rad = (!T && !L ? r : 0) + 'px ' + (!T && !R ? r : 0) + 'px ' + (!B && !R ? r : 0) + 'px ' + (!B && !L ? r : 0) + 'px';
    const g = 'linear-gradient(' + col + ',' + col + ')';
    const bg = [];
    const corner = function (vx, vy) {            // vx 'left' | 'right' · vy 'top' | 'bottom'
        bg.push(g + ' ' + vx + ' ' + m + 'px ' + vy + ' 0 / ' + w + 'px ' + (m + w) + 'px no-repeat');
        bg.push(g + ' ' + vx + ' 0 ' + vy + ' ' + m + 'px / ' + (m + w) + 'px ' + w + 'px no-repeat');
    };
    if (T && R && !same(1, -1)) corner('right', 'top');
    if (T && L && !same(-1, -1)) corner('left', 'top');
    if (B && R && !same(1, 1)) corner('right', 'bottom');
    if (B && L && !same(-1, 1)) corner('left', 'bottom');
    return '<div style="position:relative;' + (bg.length ? ' background:' + bg.join(',') + ';' : '') + '">'
        + '<div style="position:absolute; ' + ins + ' box-sizing:border-box; border-style:solid; border-color:' + col + '; border-width:' + bw + '; border-radius:' + rad + ';"></div></div>';
}
function gridHtml(sk, view, ids, mini, dim) {
    let out = '';
    for (let y = 0; y < view.length; y++) for (let x = 0; x < view[y].length; x++) out += cellHtml(sk, view, ids, x, y, mini, dim);
    return out;
}
function boardStyle(board, sk) {
    const S = SKINS[sk];
    const bg = (sk === 'base') ? '#050505' : S.board, gap = (sk === 'base') ? '1px' : S.gap;
    if (board.dataset.sk !== sk) {
        board.style.background = bg;
        board.style.gap = gap;
        board.dataset.sk = sk;
    }
}
window.tetSkinBoard = function (board, view, ids) {
    const sk = skinNow();
    boardStyle(board, sk);
    if (sk === 'base') return false;
    TCPX = tcNow();
    board.innerHTML = gridHtml(sk, view, ids, false, false);
    return true;
};
function miniView(type) {
    const v = Array.from({ length: 4 }, function () { return Array(4).fill(null); });
    const ids = Array.from({ length: 4 }, function () { return Array(4).fill(null); });
    if (type && typeof tetCells === 'function') tetCells(type, 0, 0, 0).forEach(function (c) { if (c[1] < 4 && c[0] < 4) { v[c[1]][c[0]] = type; ids[c[1]][c[0]] = 'p'; } });
    return { v: v, ids: ids };
}
window.tetSkinMini = function (box, type, dim) {
    const sk = skinNow();
    if (sk === 'base') { if (box.dataset.sk && box.dataset.sk !== 'base') { box.style.gap = '1px'; box.dataset.sk = 'base'; } return false; }
    if (box.dataset.sk !== sk) { box.style.gap = (sk === 'jelly') ? '0px' : '0px'; box.dataset.sk = sk; }
    const mv = miniView(type);
    TCPX = tcNow();
    box.innerHTML = gridHtml(sk, mv.v, mv.ids, true, dim);
    return true;
};

// 오락실 — 블럭 모양 고르기 (기본 · 입체 · 테두리 · 젤리)
function preview(sk) {
    const mv = miniView('T');
    const v = mv.v.slice(0, 2), ids = mv.ids.slice(0, 2);
    const bg = sk === 'base' ? '#050505' : SKINS[sk].board;
    const inner = sk === 'base'
        ? v.map(function (row) { return row.map(function (c) { return '<div style="background:' + (c ? (typeof TET_COLORS !== 'undefined' ? TET_COLORS[c] : '#ba68c8') : 'rgba(255,255,255,0.03)') + '; border-radius:2px;"></div>'; }).join(''); }).join('')
        : (TCPX = 22, gridHtml(sk, v, ids, false, false));
    return '<div style="display:inline-grid; grid-template-columns:repeat(4, 13px); grid-template-rows:repeat(2, 13px); gap:' + (sk === 'base' ? '1px' : SKINS[sk].gap) + ';'
        + ' background:' + bg + '; padding:3px; border-radius:3px;">' + inner + '</div>';
}
window.tetSkinPick = function (k) {
    const u = me_();
    if (!u || !SKINS[k]) return;
    if (!skinOk(u)) { try { showCustomAlert('블럭 모양은 S 사택(옥탑) 이상에서 고를 수 있습니다.'); } catch (e) { } return; }
    u.tetSkin = k;
    try { if (typeof saveFields === 'function') saveFields({ tetSkin: 1 }); } catch (e) { }
    try { renderTetrisLobby(); } catch (e) { }
    try { const t = T(); if (t && typeof tetDraw === 'function') tetDraw(); } catch (e) { }
};
function skinBox() {
    const u = me_();
    const ok = skinOk(u), cur = skinNow();
    return '<div id="tet-skin-box" style="margin:4px 0 9px 0; padding:10px; background:rgba(0,0,0,0.25); border:1px solid ' + (ok ? '#3a3a4a' : '#2a2a2a') + '; border-radius:6px;">'
        + '<div style="font-size:11px; color:' + (ok ? '#cfd8e6' : '#777') + '; margin-bottom:8px;">🎨 블럭 모양' + (ok ? '' : ' <span style="font-size:10px; color:#666;">🔒 S 사택(옥탑) 이상</span>') + '</div>'
        + '<div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px;">'
        + SKIN_KEYS.map(function (k) {
            const on = ok && cur === k;
            return '<button class="game-btn" ' + (ok ? 'onclick="tetSkinPick(\'' + k + '\')"' : 'disabled') + ' style="margin:0; padding:7px 2px; font-size:10px; line-height:1.5;'
                + (on ? ' background:linear-gradient(145deg,#4a5a70,#2a3240) !important; border-color:#9fb4d0 !important; color:#fff !important;' : '')
                + (ok ? '' : ' opacity:.45; cursor:default;') + '">' + preview(k) + '<br>' + SKINS[k].n + '</button>';
        }).join('') + '</div></div>';
}
(function hookLobby() {
    const iv = setInterval(function () {
        if (typeof window.renderTetrisLobby !== 'function' || window.renderTetrisLobby._skin) return;
        const f = window.renderTetrisLobby;
        const w = function () {
            const out = f.apply(this, arguments);
            try {
                const box = document.getElementById('tetris-lobby');
                if (box && !document.getElementById('tet-skin-box')) {
                    const last = box.lastElementChild;                      // 아래 「지운 줄 …」 안내 앞에
                    if (last) last.insertAdjacentHTML('beforebegin', skinBox()); else box.insertAdjacentHTML('beforeend', skinBox());
                }
            } catch (e) { console.warn('[테트리스] 블럭 모양', e); }
            return out;
        };
        w._skin = true;
        window.renderTetrisLobby = w;
        try { renderTetrisLobby = w; } catch (e) { }
        clearInterval(iv);
        try { if (document.getElementById('tetris-lobby') && document.getElementById('tetris-lobby').innerHTML) w(); } catch (e) { }
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

window.tetrisPlusState = function () {
    const t = T();
    console.log('%c===== 🎮 테트리스 =====', 'color:#7fd4d4; font-size:13px');
    console.log('  창', ovOpen() ? '열림' : '닫힘', '· 판', t ? (t.over ? '끝' : t.mode + ' 진행 중') : '없음',
        t ? '· 줄 ' + t.lines + ' · 속도 ' + t.speed + 'ms' : '');
    console.log('  가방 남은 것', (typeof tetBag !== 'undefined') ? tetBag.join(' ') : '-');
    console.log('  감춰 둔 창', HID.map(function (r) { return r.el.id || r.el.className; }), '· 모아 둔 알림', held.length);
    console.log('  히스토리 칸', tetHist);
};

console.log('[테트리스] 가방제 · 속도 · 단추 · 팝업 막기 · 뒤로가기 — tetrisPlusState()');
})();
