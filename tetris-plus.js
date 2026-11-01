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
    const tc = function (vh) { return 'max(14px, min(24px, calc((100vw - 140px) / 10), calc((' + vh + ' - 330px) / 20)))'; };
    s.textContent = [
        '#tetris-overlay{overflow-y:auto; -webkit-overflow-scrolling:touch; --tc:' + tc('100vh') + ';}',
        '@supports (height:100dvh){ #tetris-overlay{--tc:' + tc('100dvh') + ';} }',
        '#tetris-overlay > div{margin:auto;}',
        '#tetris-pad{margin:16px auto 0 auto; max-width:380px; display:flex; flex-direction:column; gap:12px;}',
        '#tetris-pad .tet-row{display:flex; justify-content:space-between; align-items:center; gap:16px;}',
        '#tetris-pad .tet-cluster{display:flex; gap:10px;}',
        '#tetris-pad .tet-btn{margin:0 !important; touch-action:manipulation; -webkit-user-select:none; user-select:none;'
            + ' -webkit-touch-callout:none; -webkit-tap-highlight-color:transparent; box-sizing:border-box; transition:transform .06s, filter .06s;}',
        '#tetris-pad .tet-arrow{width:60px !important; height:56px !important; padding:0 !important; font-size:20px !important;}',
        '#tetris-pad .tet-rot{width:80px !important; height:56px !important; padding:0 !important; font-size:26px !important; border-radius:28px !important;'
            + ' background:linear-gradient(145deg,#4a3a6a,#2a2040) !important; border-color:#7a6aa0 !important; color:#e6dcff !important;}',
        '#tetris-pad .tet-hold,#tetris-pad .tet-drop{min-width:120px; height:44px !important; padding:0 16px !important; font-size:12px !important;}',
        '#tetris-pad .tet-hold{background:linear-gradient(145deg,#2a4a5a,#152830) !important; border-color:#3a6a7a !important; color:#7fd4d4 !important;}',
        '#tetris-pad .tet-drop{background:linear-gradient(145deg,#5a2a2a,#301515) !important; border-color:#7a3a3a !important; color:#ffb4a8 !important;}',
        '#tetris-pad .tet-key{font-size:9px; opacity:.6; margin-left:3px;}',
        '@media (pointer:coarse){ #tetris-pad .tet-key{display:none;} }',
        '#tetris-pad .tet-btn.on{filter:brightness(1.4); transform:scale(.95);}',
        '@media (max-width:350px){ #tetris-pad .tet-arrow{width:52px !important;} #tetris-pad .tet-cluster{gap:8px;} #tetris-pad .tet-rot{width:70px !important;} }'
    ].join('\n');
    document.head.appendChild(s);
})();

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
