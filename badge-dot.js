// ==========================================
// ★ 사원증이 바뀌면 초록 불 — 광장 왼쪽 위 사원증 칸 · ☰ 목록의 「사원증」 · 기록 탭의 「사원증」
// bundles.json 마지막 묶음 (plaza.js 뒤)
// ==========================================
//
//   서버의 users/<나>/badge 를 듣는다. 마지막으로 **본** 사원증(이 기기에 적어 둔 것)과 다르면
//   불이 붙는다 — 남이 특이사항을 적었든, 상담사가 고쳤든, 물건이 닿았든(hasItemUsedOnMe).
//   내가 고친 것은 내 화면이 먼저 알고 있으니 불이 붙지 않는다.
//   사원증 탭을 열면 꺼진다 (본 것으로 적는다).
//
//   badgeDotState()   지금 상태

(function badgeDot() {
'use strict';

let code = '', ref = null, cb = null, srv = undefined, seen = undefined;
let flag = false;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function hash(b) {
    try { if (!b || typeof b !== 'object') return ''; const o = {}; Object.keys(b).sort().forEach(function (k) { if (b[k] !== '' && b[k] != null) o[k] = b[k]; }); return JSON.stringify(o); } catch (e) { return ''; }
}
function key() { return 'badgeSeen_' + code; }
function loadSeen() { try { return localStorage.getItem(key()); } catch (e) { return null; } }
function markSeen(h) {
    seen = (h === undefined) ? (srv === undefined ? hash((u_() || {}).badge) : srv) : h;
    try { localStorage.setItem(key(), seen || ''); } catch (e) { }
    flag = false;
    paint();
}
function bind() {
    const u = u_(), d = db_();
    if (!u || !u.code || !d) { if (code) unbind(); return; }
    if (code === u.code) return;
    unbind();
    code = u.code;
    const s = loadSeen();
    seen = (s === null) ? undefined : s;                       // 처음이면 지금 것을 본 것으로 (아래)
    ref = d.ref('users/' + code + '/badge');
    cb = function (snap) {
        srv = hash(snap.val());
        if (seen === undefined) { markSeen(srv); return; }
        if (srv === seen) { flag = false; paint(); return; }
        if (looking()) { markSeen(srv); return; }               // 보고 있는 중 — 내가 고쳤거나 눈앞에서 바뀌었다
        flag = true; paint();
    };
    ref.on('value', cb);
}
function unbind() {
    try { if (ref && cb) ref.off('value', cb); } catch (e) { }
    ref = null; cb = null; code = ''; srv = undefined; seen = undefined; flag = false;
}
setInterval(function () { try { bind(); } catch (e) { } }, 1000);

window.badgeNew = function () {
    const u = u_();
    return !!(flag || (u && u.hasItemUsedOnMe));
};

// 불빛 — 광장 왼쪽 위 사원증 칸 · 기록 탭 「사원증」
function paint() {
    const on = window.badgeNew();
    const me = document.getElementById('plaza-me');
    if (me) { css(); me.classList.toggle('notify-dot', on); }
    const tb = document.getElementById('tab-btn-badge');
    if (tb) tb.classList.toggle('notify-dot', on);
}
// 사진(왼쪽 32px 동그라미)의 오른쪽 위에 붙인다 — 단추 오른쪽 끝이 아니라
function css() {
    if (document.getElementById('badge-dot-css')) return;
    const st = document.createElement('style');
    st.id = 'badge-dot-css';
    st.textContent = '#plaza-me.notify-dot::after{top:3px;left:33px;right:auto;width:11px;height:11px;border:2px solid #15120d;box-sizing:content-box;}';
    document.head.appendChild(st);
}
setInterval(function () { try { paint(); } catch (e) { } }, 1500);

// 사원증 탭을 열면 본 것으로
(function hookOpen() {
    const iv = setInterval(function () {
        if (typeof switchRecordSubTab !== 'function' || switchRecordSubTab._badgeDot) return;
        const _s = switchRecordSubTab;
        const w = function (panelId) {
            const r = _s.apply(this, arguments);
            if (panelId === 'rec-badge') { try { markSeen(); } catch (e) { } }
            return r;
        };
        w._badgeDot = true;
        switchRecordSubTab = w; try { window.switchRecordSubTab = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();
// 사원증 탭을 보고 있는 동안 바뀐 것은 본 것이다 (내가 고치는 것도 여기서 한다)
function looking() {
    try {
        const t = document.getElementById('tab-record'), b = document.getElementById('rec-badge');
        if (!t || !b || !t.classList.contains('active') || !b.classList.contains('active')) return false;
        if (typeof darkRun !== 'undefined' && darkRun) return false;
        if (document.getElementById('plaza-ov')) return false;          // 광장이 덮고 있다
        return document.visibilityState !== 'hidden';
    } catch (e) { return false; }
}
(function hookSave() {
    const iv = setInterval(function () {
        if (typeof saveBadgeInfo !== 'function' || saveBadgeInfo._badgeDot) return;
        const _f = saveBadgeInfo;
        const w = function () { const r = _f.apply(this, arguments); try { markSeen(hash((u_() || {}).badge)); } catch (e) { } return r; };
        w._badgeDot = true;
        saveBadgeInfo = w; try { window.saveBadgeInfo = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();

window.badgeDotState = function () {
    console.log('%c===== 사원증 불빛 =====', 'color:#4CAF50; font-size:13px');
    console.log('  켜짐:', window.badgeNew(), '· 서버와 본 것이 다름:', flag, '· 물건이 닿음:', !!((u_() || {}).hasItemUsedOnMe));
    console.log('  서버:', srv, '\n  본 것:', seen);
};

})();
