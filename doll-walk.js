// ==========================================
// ★ 🧸 데리고 다니는 봉제인형 — 광장 방마다 (출몰지 · 광장 · 공방 …)
// bundles.json 마지막 묶음 — doll-party.js 다음
// ==========================================
//
//   2026-11-07 사용자 「펫 동행 누르면 펫이 아예 출몰지나 광장 같은 곳에서 같이 다닐 수 있게」
//
//   동행(사택 방에 내놓은 셋 · petShow) 가운데 첫째 인형이 주인 뒤를 졸졸 따라다닌다.
//   튜토리얼 · 여정 맵(doll-scene.js)에서 따라오던 것과 같은 그림(doll/pf.webp) · 같은 걸음.
//   같은 방 사람들에게도 보인다 — 자리 묶음(plaza.js send)에 pt(종 번호)를 실어 보내고,
//   받은 쪽은 그 사람 뒤에 같은 인형을 세운다.
//
//   콘솔: dollWalkState()

(function dollWalk() {
'use strict';

const SZ = 0.40;                 // 인형 키 — 사람 키의 몫
const GAP = 62;                  // 주인 뒤 이만큼 (방 그림 px)
const TRAIL = 80;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function D() { return window.DOLL; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function leadSp(u) {
    try {
        const w = D().withList(u);
        if (!w.length) return null;
        const d = D().dolls(u)[w[0]];
        return d ? Number(d.sp) : null;
    } catch (e) { return null; }
}

function css() {
    if (document.getElementById('dw-css')) return;
    const s = document.createElement('style');
    s.id = 'dw-css';
    s.textContent = '.plaza-doll{position:absolute;left:0;top:0;pointer-events:none;will-change:transform}'
        + '.plaza-doll>i{display:block;image-rendering:pixelated;animation:dwbob .5s steps(2) infinite paused}'
        + '.plaza-doll.walk>i{animation-play-state:running}'
        + '@keyframes dwbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6%)}}';
    document.head.appendChild(s);
}

// 한 사람의 인형 — { el, sp, px, trail, L, T }
const F = { me: null, peers: {}, room: null };
function mk(sp, px) {
    css();
    const el = document.createElement('div');
    el.className = 'plaza-doll';
    el.style.width = px + 'px'; el.style.height = px + 'px';
    const i = document.createElement('i');
    i.style.cssText = D().spriteCss(sp, px);
    el.appendChild(i);
    return { el: el, sp: sp, px: px, trail: [], L: null, T: null, face: 1 };
}
function sizeOf(st) {
    // 사람 키(dot 384 × k) 의 몫 — 도트가 고르게 찍히게 4 의 배수로
    let h = 128;
    try { h = (window.dotSpec ? window.dotSpec().H : 384) * st.k; } catch (e) { }
    return Math.max(24, Math.round(h * SZ / 4) * 4);
}
// 지나온 자리 가운데 GAP 뒤 — 아직 덜 걸었으면 바라보는 쪽의 반대편에
function spotOf(o, x, y, face) {
    const tr = o.trail;
    const last = tr[tr.length - 1];
    if (!last || Math.hypot(last[0] - x, last[1] - y) > 2) { tr.push([x, y]); if (tr.length > TRAIL) tr.shift(); }
    let need = GAP, cur = [x, y], p = null;
    for (let i = tr.length - 1; i >= 0; i--) {
        const q = tr[i];
        const d = Math.hypot(cur[0] - q[0], cur[1] - q[1]);
        if (d >= need) { const t = need / d; p = [cur[0] + (q[0] - cur[0]) * t, cur[1] + (q[1] - cur[1]) * t]; need = 0; break; }
        need -= d; cur = q;
    }
    if (!p || need > 0) p = [x + face * GAP * 0.7, y];      // face 1 = 왼쪽을 본다 → 뒤는 오른쪽
    return p;
}
function put(o, st, x, y, face, moving) {
    const z = st.z;
    const p = spotOf(o, x, y, face);
    const L = Math.round(p[0] * z - o.px / 2), T = Math.round(p[1] * z - o.px * 0.94);
    if (o.L !== L || o.T !== T) { o.el.style.transform = 'translate3d(' + L + 'px,' + T + 'px,0)'; o.L = L; o.T = T; }
    o.el.style.zIndex = String(100 + Math.round(p[1]) - 1);
    const walking = !!moving && Math.hypot(p[0] - (o.px0 || p[0]), p[1] - (o.py0 || p[1])) > 0.3;
    o.px0 = p[0]; o.py0 = p[1];
    if (walking !== o.walk) { o.walk = walking; o.el.classList.toggle('walk', walking); }
}
function drop(o) { if (o && o.el) { try { o.el.remove(); } catch (e) { } } }
function want(o, st, sp) {
    const px = sizeOf(st);
    if (o && (o.sp !== sp || o.px !== px || o.el.parentNode !== st.el)) { drop(o); o = null; }
    if (!o && sp != null) { o = mk(sp, px); st.el.appendChild(o.el); }
    return o;
}

let lastX = null, lastY = null, lastT = 0;
function tick() {
    const st = stage(), u = u_();
    if (!st || !u || !D()) { if (F.me) { drop(F.me); F.me = null; } Object.keys(F.peers).forEach(function (c) { drop(F.peers[c]); }); F.peers = {}; return; }
    if (F.room !== st.room) { F.room = st.room; if (F.me) { drop(F.me); F.me = null; } Object.keys(F.peers).forEach(function (c) { drop(F.peers[c]); }); F.peers = {}; }
    // 나
    const w = window.plazaWhere ? window.plazaWhere() : null;
    const sp = leadSp(u);
    F.me = want(F.me, st, sp);
    if (F.me && w) {
        const moving = (lastX != null) && (Math.abs(w.x - lastX) > 0.3 || Math.abs(w.y - lastY) > 0.3);
        lastX = w.x; lastY = w.y;
        put(F.me, st, w.x, w.y, window.plazaMeFace ? window.plazaMeFace() : 1, moving);
    }
    // 같은 방 사람들
    const codes = (window.plazaPeerCodes ? window.plazaPeerCodes() : []);
    const seen = {};
    codes.forEach(function (c) {
        const q = window.plazaPeerPos ? window.plazaPeerPos(c) : null;
        if (!q || q.pt == null || q.hid) { if (F.peers[c]) { drop(F.peers[c]); delete F.peers[c]; } return; }
        seen[c] = 1;
        F.peers[c] = want(F.peers[c], st, Number(q.pt));
        if (F.peers[c]) put(F.peers[c], st, q.x, q.y, q.face, q.moving);
    });
    Object.keys(F.peers).forEach(function (c) { if (!seen[c]) { drop(F.peers[c]); delete F.peers[c]; } });
}
(function loop() { try { tick(); } catch (e) { } requestAnimationFrame(loop); })();

// 자리 묶음에 실어 보내는 것 — 데리고 다니는 인형의 종
window.plazaExtra = function () { const sp = leadSp(u_()); return sp != null ? { pt: sp } : {}; };

window.dollWalkState = function () {
    const o = { 방: F.room, 내_인형: F.me ? F.me.sp : null, 남: Object.keys(F.peers).map(function (c) { return c + ':' + F.peers[c].sp; }) };
    console.log(o);
    return o;
};
console.log('[🧸] 데리고 다니기 — dollWalkState()');
})();
