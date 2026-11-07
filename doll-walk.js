// ==========================================
// ★ 🧸 데리고 다니는 봉제인형 — 광장 방마다 (출몰지 · 광장 · 공방 …)
// bundles.json 마지막 묶음 — doll-party.js 다음
// ==========================================
//
//   2026-11-07 사용자 「펫 동행 누르면 펫이 아예 출몰지나 광장 같은 곳에서 같이 다닐 수 있게」
//
//   데리고 다닐 인형 하나가 주인 뒤를 졸졸 따라다닌다 — 인형 돌보기(인형 목록)에서 인형을 눌러 고른다
//   (u.petWalk = 인형 번호 · '0' 이면 아무도 · 안 정했으면 동행 첫째 — 2026-11-07 사용자 「따라다니는 동행 여부는 인형 돌보기에서 눌렀을 때 뜨게」).
//   튜토리얼 · 여정 맵(doll-scene.js)에서 따라오던 것과 같은 그림(doll/pf.webp) · 같은 걸음.
//   같은 방 사람들에게도 보인다 — 자리 묶음(plaza.js send)에 pt(종 번호)를 실어 보내고,
//   받은 쪽은 그 사람 뒤에 같은 인형을 세운다.
//
//   콘솔: dollWalkState() · DOLLWALK.key() 지금 데리고 다니는 인형 · DOLLWALK.set(번호 | null)

(function dollWalk() {
'use strict';

const SZ = 0.20;                 // 인형 키 — 사람 키의 몫 (2026-11-07 사용자 「두 배 더 작게」 · 전에는 0.40)
const GAP = 120;                 // 주인 뒤 이만큼 (방 그림 px · 「너무 붙어 있다」 → 전에는 62)
const TRAIL = 120;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function D() { return window.DOLL; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
// 데리고 다니는 인형의 번호 — 없으면 null
function walkKey(u) {
    try {
        const M = D(), ds = M.dolls(u);
        const v = u.petWalk;
        let k = null;
        if (v === 0 || v === '0') return null;                       // 아무도 안 데리고 다닌다
        if (v != null && ds[String(v)]) k = String(v);                 // 고른 인형 — 동행이 아니어도 따라온다 (2026-11-07 사용자 「동행에서 뺀 인형도 데리고 다니기 가능하게」)
        else if (v == null) { const w = M.withList(u); k = w[0] || null; }   // 안 정했으면 동행 첫째 (전처럼) · 「그만 데리고 다닌다」(0)면 아무도
        if (!k) return null;
        const d = ds[k];
        if (!d) return null;
        if (d.out && d.out.till && d.out.till > M.now()) return null;   // 탐사 중
        return k;
    } catch (e) { return null; }
}
function leadSp(u) {
    try {
        const k = walkKey(u);
        if (!k) return null;
        const d = D().dolls(u)[k];
        return d ? Number(d.sp) : null;
    } catch (e) { return null; }
}
// 인형 돌보기에서 고른다 — key 면 그 인형, null 이면 아무도
function setWalk(key, u) {
    u = u || u_();
    if (!u) return false;
    const v = key == null ? '0' : String(key);
    if (v !== '0' && !D().dolls(u)[v]) return false;
    u.petWalk = v;
    try { D().put({ petWalk: v }, u); } catch (e) { }
    return true;
}
window.DOLLWALK = { key: walkKey, set: setWalk };

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
function mk(sp, px, old) {
    css();
    const el = document.createElement('div');
    el.className = 'plaza-doll';
    el.style.width = px + 'px'; el.style.height = px + 'px';
    const i = document.createElement('i');
    i.style.cssText = D().spriteCss(sp, px, false, !!old);
    el.appendChild(i);
    return { el: el, sp: sp, px: px, old: !!old, trail: [], L: null, T: null, face: 1 };
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
function want(o, st, sp, old) {
    const px = sizeOf(st);
    if (o && (o.sp !== sp || o.px !== px || o.old !== !!old || o.el.parentNode !== st.el)) { drop(o); o = null; }
    if (!o && sp != null) { o = mk(sp, px, old); st.el.appendChild(o.el); }
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
    F.me = want(F.me, st, sp, D().artOld(u));
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
        F.peers[c] = want(F.peers[c], st, Number(q.pt), !!q.po);
        if (F.peers[c]) put(F.peers[c], st, q.x, q.y, q.face, q.moving);
    });
    Object.keys(F.peers).forEach(function (c) { if (!seen[c]) { drop(F.peers[c]); delete F.peers[c]; } });
}
(function loop() { try { tick(); } catch (e) { } requestAnimationFrame(loop); })();

// 자리 묶음에 실어 보내는 것 — 데리고 다니는 인형의 종
window.plazaExtra = function () { const sp = leadSp(u_()); if (sp == null) return {}; const o = { pt: sp }; try { if (D().artOld(u_())) o.po = 1; } catch (e) { } return o; };

window.dollWalkState = function () {
    const o = { 방: F.room, 데리고: walkKey(u_()), 내_인형: F.me ? F.me.sp : null, 남: Object.keys(F.peers).map(function (c) { return c + ':' + F.peers[c].sp; }) };
    console.log(o);
    return o;
};
console.log('[🧸] 데리고 다니기 — dollWalkState()');
})();
