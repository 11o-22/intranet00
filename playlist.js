// ==========================================
// ★ 🎧 플레이리스트 (2026-11-11 사용자)
// bundles.json 마지막 묶음 — rhythm.js 바로 뒤
// ==========================================
//
//   「인트라넷 생활 쪽에 플레이 리스트를 둬서 거기에다가 리듬게임 음악을 들을 수 있게 하자.
//     그 안에서 내 플리를 만들어서 원하는 음악을 들을 수도 있게 하고. 백그라운드에서도 들을 수 있게.
//     전체 반복재생, 무작위 재생, 한 곡 반복재생도 다 가능하게」
//
// ■ 어디에
//   광장 ☰ 「생활」 — 🎧 플레이리스트 (광장 위에 띄운다)
//
// ■ 곡
//   리듬 게임 곡 그대로 (rhythm.js 의 window.rhythmSongs) — 리듬 게임에 곡을 넣으면 여기에도 저절로 들어온다.
//
// ■ 내 플리
//   여러 개 만들 수 있다 (이름 · 곡 넣기 · 빼기 · 순서 바꾸기 · 이름 바꾸기 · 지우기).
//   playlists/<사번> = { <id>: { n: 이름, s: [곡 열쇠 …], at } } — 사원 기록(users)과 따로 둔다
//   (사원 기록을 건드리면 화면이 통째로 다시 그려진다). 어느 기기에서 열어도 같은 플리.
//
// ■ 듣기
//   <audio> 하나로 튼다 — 창을 닫아도 · 다른 화면으로 가도 · 화면을 끄거나 다른 앱으로 가도 이어진다.
//   잠금 화면 · 알림창의 재생 단추(Media Session)도 붙였다 (앞 · 뒤 곡 · 재생 · 멈춤 · 넘기기).
//   반복 — 전체 반복 → 한 곡 반복 → 반복 끔 (단추를 누를 때마다 바뀐다) · 무작위 — 켬 · 끔.
//   창을 닫으면 위 오른쪽에 작은 재생기가 남는다 (재생 · 멈춤 · 다음 곡 · ✕ 끄기 · 제목을 누르면 창).
//   리듬 게임을 열면 잠시 멈추고, 닫으면 이어 튼다. 이상한 나라 배경 음악은 플리가 도는 동안 쉰다 (event-bgm.js).
//   반복 · 무작위는 이 기기에 적어 둔다.
//
// ■ 콘솔
//   playlistState()

(function playlist() {
'use strict';

const PATH = 'playlists';
const SET_KEY = 'plSet';
const MAX_LISTS = 20;
// 곡 길이 (ms) — 목록에 미리 적어 둔다 (리듬 채보의 dur). 새 곡은 한 번 틀면 재서 이 기기에 적어 둔다
const DUR = { airplane: 147120, client: 168240, devotion: 159680, evilhigh: 147640, returnhome: 100600, cheonjiin: 153120, handicap: 147555,
              winterfloat: 163080, whitexmas: 120800, showtime: 126800 };

function u_() { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; }
// ⏰ 쉬는 시간(셧다운) 덮개가 떠 있나 — 그동안은 로그아웃되어 있어도 듣는다 (2026-11-11 사용자 「셧다운 중에도 플레이 리스트는 들을 수 있게」)
function restOn() { const el = document.getElementById('rest-time-overlay'); return !!(el && el.style.display === 'flex'); }
// 누구의 플리 · 해금인가 — 들어와 있으면 그 사원, 쉬는 시간에 나와 있으면 이 기기에서 마지막으로 들어왔던 사원
function who() {
    const u = u_();
    if (u && u.code) return String(u.code);
    if (!restOn()) return null;
    try { return localStorage.getItem('corp_logged_code') || null; } catch (e) { return null; }
}
// 해금 — 들어와 있으면 rhythm.js 가 매긴 대로, 쉬는 시간이면 그 사원의 서버 기록(users/<사번>/rhythmOwn)으로
let OWN = null, ownFor = null;
function loadOwn() {
    const c = who(), db = db_();
    if (!c || u_() || !db || ownFor === c) return Promise.resolve(OWN);
    ownFor = c;
    const R_ORDER = ['L', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
    return db.ref('users/' + c + '/rhythmOwn').once('value').then(function (snap) {
        OWN = Object.assign({}, (snap && snap.val()) || {});
        // 조건으로 여는 곡(Handicap ← 내담자 여러분께 HARD B 이상) — 아직 rhythmOwn 에 안 적혔어도 랭킹 기록이 채웠으면 연다 (읽기만)
        return Promise.all(songs().filter(function (s) { return s.needSpec && !OWN[s.key]; }).map(function (s) {
            const n = s.needSpec;
            return db.ref('rhythmRank/' + n.song + '/' + n.diff + '/' + c).once('value').then(function (r) {
                const v = r && r.val();
                if (v && v.r && R_ORDER.indexOf(v.r) >= 0 && R_ORDER.indexOf(v.r) <= R_ORDER.indexOf(n.rank)) OWN[s.key] = 1;
            }).catch(function () { });
        })).then(function () { return OWN; });
    }).catch(function () { return OWN; });
}
function isLocked(s) {
    if (!s || (!s.price && !s.needSpec)) return false;
    if (u_()) return !!s.locked;
    const c = who();
    if (c === 'kario0987') return false;
    return !(OWN && OWN[s.key]);
}
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function loadJ(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function songs() { try { return (typeof window.rhythmSongs === 'function') ? window.rhythmSongs() : []; } catch (e) { return []; } }
function song(k) { return songs().filter(function (s) { return s.key === k; })[0] || null; }
function fmt(ms) { if (!(ms > 0)) return ''; const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function vals(o) {                                       // 파이어베이스가 배열을 { 0: …, 1: … } 로 돌려줄 때
    if (Array.isArray(o)) return o.filter(function (x) { return x != null; });
    if (o && typeof o === 'object') return Object.keys(o).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return o[k]; }).filter(function (x) { return x != null; });
    return [];
}

// ==========================================
// 설정 · 내 플리
// ==========================================
const SET = Object.assign({ rep: 'all', shuf: false }, loadJ(SET_KEY, {}));
if (['all', 'one', 'off'].indexOf(SET.rep) < 0) SET.rep = 'all';
function saveSet() { saveJ(SET_KEY, { rep: SET.rep, shuf: !!SET.shuf }); }
const durCache = loadJ('plDur', {});
function durOf(k) { return DUR[k] || durCache[k] || 0; }

let LISTS = {};             // id → { n, s: [], at }
let listsFor = null;        // 누구 것을 받아 왔나
let loading = null;
function loadLists() {
    const code = who(), db = db_();
    if (!code) return Promise.resolve(LISTS);
    if (listsFor === code) return Promise.resolve(LISTS);
    if (!db) { listsFor = code; LISTS = loadJ('plLocal_' + code, {}); return Promise.resolve(LISTS); }
    if (loading) return loading;
    loading = db.ref(PATH + '/' + code).once('value').then(function (snap) {
        const v = (snap && snap.val()) || {};
        LISTS = {};
        Object.keys(v).forEach(function (id) {
            const x = v[id];
            if (!x || typeof x !== 'object') return;
            LISTS[id] = { n: String(x.n || '내 플리').slice(0, 24), s: vals(x.s).map(String), at: Number(x.at) || 0 };
        });
        listsFor = code;
        loading = null;
        return LISTS;
    }).catch(function () { loading = null; listsFor = code; return LISTS; });
    return loading;
}
let saveT = null;
function saveLists() {
    const code = listsFor || who(), db = db_();
    if (!code) return;
    if (!db) { saveJ('plLocal_' + code, LISTS); return; }
    clearTimeout(saveT);
    saveT = setTimeout(function () {
        const out = {};
        Object.keys(LISTS).forEach(function (id) { out[id] = { n: LISTS[id].n, s: LISTS[id].s.slice(), at: LISTS[id].at }; });
        try { db.ref(PATH + '/' + code).set(out); } catch (e) { }
    }, 250);
}
function listIds() { return Object.keys(LISTS).sort(function (a, b) { return (LISTS[a].at || 0) - (LISTS[b].at || 0); }); }
function newList(name) {
    if (listIds().length >= MAX_LISTS) return null;
    const id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
    LISTS[id] = { n: (String(name || '').trim() || ('내 플리 ' + (listIds().length + 1))).slice(0, 24), s: [], at: Date.now() };
    saveLists();
    return id;
}

// ==========================================
// 재생기
// ==========================================
let A = null;
const Q = { src: 'all', base: [], order: [], i: -1, key: null };
let byRhythm = false;

function audio() {
    if (A) return A;
    A = new Audio();
    A.preload = 'auto';
    A.setAttribute('playsinline', '');
    A.addEventListener('ended', function () { step(1, true); });
    A.addEventListener('play', function () { paint(); mediaState(); });
    A.addEventListener('playing', function () { errs = 0; });
    A.addEventListener('pause', function () { paint(); mediaState(); });
    A.addEventListener('loadedmetadata', function () {
        if (Q.key && isFinite(A.duration) && A.duration > 0 && !DUR[Q.key]) { durCache[Q.key] = Math.round(A.duration * 1000); saveJ('plDur', durCache); }
        paintTime();
    });
    let lastPos = 0;
    A.addEventListener('timeupdate', function () {
        paintTime();
        const now = Date.now();
        if (now - lastPos > 4000) { lastPos = now; mediaPos(); }
    });
    A.addEventListener('error', function () {
        // 받지 못한 곡 — 다음 곡으로 (한 바퀴를 다 돌면 멈춘다)
        if (!Q.key) return;
        errs++;
        if (errs < Math.max(1, Q.order.length)) step(1, true);
    });
    return A;
}
let errs = 0;

function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
}
// 🔒 해금하지 않은 곡(rhythm.js price)은 차례에서 뺀다 — 목록에는 자물쇠로 보이고, 누르면 그 자리에서 해금 (2026-11-11 사용자 「천지인」)
function baseOf(src) {
    const all = songs().filter(function (s) { return !isLocked(s); }).map(function (s) { return s.key; });
    if (src === 'all') return all;
    const l = LISTS[src];
    return l ? l.s.filter(function (k) { return all.indexOf(k) >= 0; }) : [];
}
// 곡 차례를 만든다 — 무작위면 지금 곡을 맨 앞에 두고 나머지를 섞는다
function makeOrder(cur) {
    Q.base = baseOf(Q.src);
    if (SET.shuf) {
        const rest = Q.base.filter(function (k) { return k !== cur; });
        Q.order = (cur && Q.base.indexOf(cur) >= 0 ? [cur] : []).concat(shuffled(rest));
    } else Q.order = Q.base.slice();
    Q.i = cur ? Q.order.indexOf(cur) : -1;
}
function sessionOn() { try { if (navigator.audioSession && 'type' in navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { } }

function playKey(k) {
    const s = song(k);
    if (!s) return;
    const a = audio();
    Q.key = k;
    const want = new URL(s.audio, location.href).href;
    if (a.src !== want) { a.src = s.audio; try { a.load(); } catch (e) { } }
    else a.currentTime = 0;
    sessionOn();
    const p = a.play();
    if (p && p.catch) p.catch(function () { paint(); });
    mediaMeta();
    paint();
}
// 어느 목록에서 어느 곡부터
function playFrom(src, k) {
    Q.src = src;
    makeOrder(k);
    if (!Q.order.length) return;
    if (Q.i < 0) Q.i = 0;
    errs = 0;
    playKey(Q.order[Q.i]);
}
// 다음 · 앞 — auto 는 곡이 끝나서 넘어가는 것 (한 곡 반복 · 반복 끔이 여기에만 걸린다)
function step(dir, auto) {
    if (!Q.order.length) return;
    if (auto && SET.rep === 'one') { playKey(Q.key); return; }
    let i = Q.i + dir;
    if (i >= Q.order.length) {
        if (auto && SET.rep === 'off') { Q.i = Q.order.length - 1; try { A.pause(); A.currentTime = 0; } catch (e) { } paint(); return; }
        if (SET.shuf) {                                   // 한 바퀴 돌았으면 다시 섞는다 — 방금 곡이 바로 또 나오지 않게
            const last = Q.order[Q.order.length - 1];
            let o = shuffled(Q.base);
            if (o.length > 1 && o[0] === last) { o.push(o.shift()); }
            Q.order = o;
        }
        i = 0;
    }
    if (i < 0) i = Q.order.length - 1;
    Q.i = i;
    playKey(Q.order[i]);
}
function prev() {
    if (A && A.currentTime > 3) { A.currentTime = 0; return; }
    step(-1, false);
}
function toggle() {
    if (!A || !Q.key) {
        // 아무것도 안 틀었으면 — 보고 있는 목록(없으면 전체 곡)의 처음부터
        const src = (V.tab === 'mine' && V.list && LISTS[V.list]) ? V.list : 'all';
        const b = baseOf(src);
        if (b.length) playFrom(src, SET.shuf ? b[Math.floor(Math.random() * b.length)] : b[0]);
        return;
    }
    if (A.paused) { sessionOn(); const p = A.play(); if (p && p.catch) p.catch(function () { }); }
    else A.pause();
}
function stop() {
    if (A) { try { A.pause(); A.removeAttribute('src'); A.load(); } catch (e) { } }
    Q.key = null; Q.i = -1;
    byRhythm = false;
    try { if (navigator.mediaSession) navigator.mediaSession.metadata = null; } catch (e) { }
    paint();
}
function setShuf(on) {
    SET.shuf = !!on; saveSet();
    makeOrder(Q.key);
    paint();
}
function cycleRep() {
    SET.rep = SET.rep === 'all' ? 'one' : SET.rep === 'one' ? 'off' : 'all';
    saveSet();
    paint();
}
function playing() { return !!(A && Q.key && !A.paused); }
window.playlistOn = playing;

// ==========================================
// 잠금 화면 · 알림창 (Media Session)
// ==========================================
function mediaMeta() {
    try {
        if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
        const s = song(Q.key);
        if (!s) return;
        const art = s.cover ? [{ src: new URL(s.cover, location.href).href, sizes: '512x512', type: /\.png$/i.test(s.cover) ? 'image/png' : 'image/jpeg' }] : [];
        navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist || 'Benz', album: srcName(Q.src), artwork: art });
    } catch (e) { }
}
function mediaState() { try { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = Q.key ? (A && !A.paused ? 'playing' : 'paused') : 'none'; } catch (e) { } }
function mediaPos() {
    try {
        if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState || !A) return;
        if (!isFinite(A.duration) || !(A.duration > 0)) return;
        navigator.mediaSession.setPositionState({ duration: A.duration, playbackRate: A.playbackRate || 1, position: Math.min(A.duration, Math.max(0, A.currentTime)) });
    } catch (e) { }
}
(function mediaHandlers() {
    if (!('mediaSession' in navigator)) return;
    const on = function (k, f) { try { navigator.mediaSession.setActionHandler(k, f); } catch (e) { } };
    on('play', function () { if (Q.key) { sessionOn(); A.play(); } else toggle(); });
    on('pause', function () { if (A) A.pause(); });
    on('previoustrack', function () { prev(); });
    on('nexttrack', function () { step(1, false); });
    on('seekto', function (d) { if (A && d && d.seekTime != null) { A.currentTime = d.seekTime; mediaPos(); } });
    on('stop', function () { stop(); });
})();

// ==========================================
// 창
// ==========================================
const V = { tab: 'all', list: null, adding: null, naming: null, picker: null };
let OV = null;

function srcName(src) { return src === 'all' ? '전체 곡' : (LISTS[src] ? LISTS[src].n : '내 플리'); }

const IC = {
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
    next: '<path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/>',
    prev: '<path d="M18 6l-8.5 6L18 18zM6 6h2v12H6z"/>',
    shuf: '<path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>',
    rep: '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>',
    rep1: '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>'
};
function svg(k, sz) { return '<svg viewBox="0 0 24 24" width="' + (sz || 22) + '" height="' + (sz || 22) + '" fill="currentColor" aria-hidden="true">' + IC[k] + '</svg>'; }
const REP_TXT = { all: '전체 반복', one: '한 곡 반복', off: '반복 끔' };

function css() {
    if (document.getElementById('pl-css')) return;
    const s = document.createElement('style');
    s.id = 'pl-css';
    s.textContent = [
        '#pl-ov{position:fixed;inset:0;z-index:10005;display:flex;align-items:center;justify-content:center;background:rgba(4,4,8,.82);padding:14px;font-family:inherit;}',
        '#pl-ov *{box-sizing:border-box;}',
        '.pl-card{width:min(94vw,430px);max-height:92dvh;display:flex;flex-direction:column;border-radius:17px;overflow:hidden;',
        '  background:linear-gradient(180deg,#16151f,#0a0a10);border:1px solid #2b2b38;color:#e8e2d6;}',
        '.pl-head{display:flex;align-items:center;gap:8px;padding:13px 14px 4px;font-size:14px;font-weight:bold;color:#ffe9bd;}',
        '.pl-head button{margin-left:auto;width:32px;height:32px;border-radius:50%;cursor:pointer;background:rgba(255,255,255,.05);border:1px solid #2b2b38;color:#ded5c4;font-family:inherit;}',
        '.pl-now{display:flex;gap:12px;align-items:center;padding:10px 14px 4px;}',
        '.pl-cov{width:74px;height:74px;border-radius:10px;flex-shrink:0;background:#1d1c27 center/cover no-repeat;border:1px solid #2b2b38;}',
        '.pl-ti{min-width:0;flex:1;}',
        '.pl-ti b{display:block;font-size:15px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.pl-ti span{display:block;font-size:11.5px;color:#9a9284;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.pl-bar{display:flex;align-items:center;gap:8px;padding:6px 14px 0;font-size:10.5px;color:#9a9284;font-variant-numeric:tabular-nums;}',
        '.pl-bar input{flex:1;accent-color:var(--pc,#ffd79a);height:18px;}',
        '.pl-ctl{display:flex;align-items:flex-start;justify-content:space-between;padding:6px 18px 10px;}',
        '.pl-ctl button{background:none;border:none;color:#ded5c4;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;font-family:inherit;font-size:9.5px;min-width:52px;padding:4px 0;}',
        '.pl-ctl button.off{color:#5f5a52;}',
        '.pl-ctl button.on{color:var(--pc,#ffd79a);}',
        '.pl-ctl .pl-big{width:54px;height:54px;border-radius:50%;background:var(--pc,#ffd79a);color:#14131b;justify-content:center;min-width:54px;padding:0;}',
        '.pl-ctl .pl-mid{justify-content:center;height:54px;}',
        '.pl-tabs{display:flex;gap:6px;padding:0 14px 8px;border-bottom:1px solid #22212c;}',
        '.pl-tabs button{flex:1;padding:8px 0;border-radius:9px;border:1px solid #2b2b38;background:rgba(255,255,255,.03);color:#9a9284;font-family:inherit;font-size:12px;cursor:pointer;}',
        '.pl-tabs button.on{background:rgba(255,215,154,.12);border-color:#6a5226;color:#ffe9bd;font-weight:bold;}',
        '.pl-body{overflow-y:auto;padding:6px 10px 12px;flex:1;min-height:120px;}',
        '.pl-row{display:flex;align-items:center;gap:9px;padding:7px 6px;border-radius:10px;cursor:pointer;}',
        '.pl-row:hover{background:rgba(255,255,255,.03);}',
        '.pl-row.cur{background:rgba(255,215,154,.08);}',
        '.pl-row .pl-th{width:40px;height:40px;border-radius:7px;flex-shrink:0;background:#1d1c27 center/cover no-repeat;}',
        '.pl-row .pl-tx{flex:1;min-width:0;}',
        '.pl-row .pl-tx b{display:block;font-size:13px;color:#eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.pl-row.cur .pl-tx b{color:var(--rc,#ffd79a);}',
        '.pl-row.on .pl-tx b::before{content:"♪ ";}',
        '.pl-row .pl-tx span{display:block;font-size:10.5px;color:#8a847a;margin-top:2px;}',
        '.pl-mini-b{flex-shrink:0;min-width:30px;height:30px;border-radius:8px;border:1px solid #2b2b38;background:rgba(255,255,255,.04);color:#ded5c4;font-family:inherit;font-size:13px;cursor:pointer;padding:0 7px;}',
        '.pl-mini-b:disabled{opacity:.3;cursor:default;}',
        '.pl-sub{display:flex;align-items:center;gap:6px;padding:6px 4px 8px;flex-wrap:wrap;}',
        '.pl-sub b{font-size:13.5px;color:#ffe9bd;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.pl-btn{padding:7px 11px;border-radius:9px;border:1px solid #2b2b38;background:rgba(255,255,255,.04);color:#ded5c4;font-family:inherit;font-size:11.5px;cursor:pointer;}',
        '.pl-btn.go{background:rgba(255,215,154,.14);border-color:#6a5226;color:#ffe9bd;}',
        '.pl-btn.bad{color:#e59a9a;}',
        '.pl-empty{padding:22px 8px;text-align:center;font-size:12px;color:#7d776d;line-height:1.7;}',
        '.pl-in{flex:1;min-width:0;padding:8px 10px;border-radius:9px;border:1px solid #3a3848;background:#0d0d14;color:#fff;font-family:inherit;font-size:13px;}',
        '.pl-pick{position:absolute;inset:0;background:rgba(4,4,8,.7);display:flex;align-items:flex-end;justify-content:center;}',
        '.pl-pick>div{width:100%;max-height:70%;overflow-y:auto;background:#14131c;border-top:1px solid #2b2b38;border-radius:14px 14px 0 0;padding:12px;}',
        '.pl-chk{width:22px;height:22px;border-radius:6px;border:1px solid #4a4658;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;color:#14131b;}',
        '.pl-chk.on{background:#ffd79a;border-color:#ffd79a;}',
        // 작은 재생기 — 창을 닫으면 위 오른쪽에 남는다
        '#pl-mini{position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 60px);z-index:9500;display:flex;align-items:center;gap:6px;',
        '  max-width:min(250px,64vw);padding:5px 6px 5px 5px;border-radius:12px;background:rgba(14,13,20,.9);border:1px solid #2b2b38;',
        '  box-shadow:0 4px 14px rgba(0,0,0,.5);color:#e8e2d6;font-family:inherit;}',
        '#pl-mini .pl-mc{width:30px;height:30px;border-radius:7px;flex-shrink:0;background:#1d1c27 center/cover no-repeat;cursor:pointer;}',
        '#pl-mini .pl-mt{min-width:0;flex:1;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;max-width:120px;}',
        '#pl-mini button{flex-shrink:0;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,.07);color:#ded5c4;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}'
    ].join('\n');
    document.head.appendChild(s);
}

function cov(s) { return s && s.cover ? 'background-image:url(\'' + s.cover + '\')' : ''; }

function open() {
    if (!who()) return;
    css();
    if (OV) OV.remove();
    OV = document.createElement('div');
    OV.id = 'pl-ov';
    if (restOn()) OV.style.zIndex = '2147483647';          // 쉬는 시간 덮개 위로
    OV.innerHTML = '<div class="pl-card" style="position:relative;">'
        + '<div class="pl-head">🎧 플레이리스트<button data-a="x" aria-label="닫기">✕</button></div>'
        + '<div class="pl-now"></div><div class="pl-bar"></div><div class="pl-ctl"></div>'
        + '<div class="pl-tabs"><button data-a="tab" data-v="all">전체 곡</button><button data-a="tab" data-v="mine">내 플리</button></div>'
        + '<div class="pl-body"></div></div>';
    document.body.appendChild(OV);
    ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (t) { OV.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
    OV.addEventListener('click', onClick);
    OV.addEventListener('input', onInput);
    OV.addEventListener('change', onInput);
    OV.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.classList.contains('pl-in')) { e.preventDefault(); commitName(); } });
    OV.addEventListener('pointerdown', function (e) { if (e.target === OV) close(); });
    full();
    const chk = (u_() && typeof window.rhythmCheckNeeds === 'function') ? window.rhythmCheckNeeds() : Promise.resolve(false);
    Promise.all([loadLists(), loadOwn(), chk]).then(function () { if (OV) full(); });
}
function close() {
    if (OV) { OV.remove(); OV = null; }
    V.picker = null; V.naming = null; V.nameVal = null; V.adding = null;
    paint();
}

function paint() {
    paintMini();
    if (!OV) return;
    const s = song(Q.key);
    const card = OV.querySelector('.pl-card');
    card.style.setProperty('--pc', (s && s.color) || '#ffd79a');
    OV.querySelector('.pl-now').innerHTML = '<div class="pl-cov" style="' + cov(s) + '"></div>'
        + '<div class="pl-ti"><b>' + (s ? esc(s.title) : '고른 곡이 없습니다') + '</b><span>'
        + (s ? esc(s.artist || 'Benz') + ' · ' + esc(srcName(Q.src)) : '곡을 누르면 틉니다') + '</span></div>';
    paintTime();
    const isOn = playing();
    OV.querySelector('.pl-ctl').innerHTML =
        '<button data-a="shuf" class="' + (SET.shuf ? 'on' : 'off') + '">' + svg('shuf', 21) + '<span>무작위 ' + (SET.shuf ? '켬' : '끔') + '</span></button>'
        + '<button data-a="prev" class="pl-mid" aria-label="앞 곡">' + svg('prev', 26) + '</button>'
        + '<button data-a="play" class="pl-big" aria-label="' + (isOn ? '멈춤' : '재생') + '">' + svg(isOn ? 'pause' : 'play', 30) + '</button>'
        + '<button data-a="next" class="pl-mid" aria-label="다음 곡">' + svg('next', 26) + '</button>'
        + '<button data-a="rep" class="' + (SET.rep === 'off' ? 'off' : 'on') + '">' + svg(SET.rep === 'one' ? 'rep1' : 'rep', 21) + '<span>' + REP_TXT[SET.rep] + '</span></button>';
    Array.prototype.forEach.call(OV.querySelectorAll('.pl-tabs button'), function (b) { b.classList.toggle('on', b.dataset.v === V.tab); });
    markRows();
}
// 지금 곡 줄 표시만 — 몸통을 다시 그리지 않는다
function markRows() {
    if (!OV) return;
    const on = playing();
    Array.prototype.forEach.call(OV.querySelectorAll('.pl-body .pl-row[data-k]'), function (r) {
        const cur = r.dataset.k === Q.key && r.dataset.src === Q.src && !!Q.key;
        r.classList.toggle('cur', cur); r.classList.toggle('on', cur && on);
    });
    Array.prototype.forEach.call(OV.querySelectorAll('.pl-body .pl-row[data-id][data-a="openlist"]'), function (r) {
        const cur = r.dataset.id === Q.src && !!Q.key;
        r.classList.toggle('cur', cur); r.classList.toggle('on', cur && on);
    });
}
function renderBody() { if (OV) { paintBody(); markRows(); } }
function full() { paint(); renderBody(); }
function paintTime() {
    if (!OV) return;
    const bar = OV.querySelector('.pl-bar');
    if (!bar) return;
    const dur = (A && isFinite(A.duration) && A.duration > 0) ? A.duration : (Q.key ? durOf(Q.key) / 1000 : 0);
    const cur = A && Q.key ? A.currentTime : 0;
    const pct = dur > 0 ? Math.round(cur / dur * 1000) : 0;
    let r = bar.querySelector('input');
    if (!r) {
        bar.innerHTML = '<span class="pl-c">0:00</span><input type="range" min="0" max="1000" step="1" value="0" data-a="seek" aria-label="재생 위치"><span class="pl-d">0:00</span>';
        r = bar.querySelector('input');
    }
    if (!seeking) r.value = String(pct);
    r.disabled = !Q.key;
    bar.querySelector('.pl-c').textContent = fmt(cur * 1000) || '0:00';
    bar.querySelector('.pl-d').textContent = fmt(dur * 1000) || '0:00';
}
let seeking = false;

function songRow(s, opts) {
    const cur = Q.key === s.key && Q.src === opts.src;
    return '<div class="pl-row' + (cur ? ' cur' : '') + '" data-a="pick" data-k="' + esc(s.key) + '" data-src="' + esc(opts.src) + '" style="--rc:' + esc(s.color || '#ffd79a') + '">'
        + '<div class="pl-th" style="' + cov(s) + '"></div>'
        + '<div class="pl-tx"><b>' + esc(s.title) + '</b><span>' + esc(s.artist || 'Benz') + (durOf(s.key) ? ' · ' + fmt(durOf(s.key)) : '') + '</span></div>'
        + (isLocked(s) ? '<button class="pl-mini-b" data-a="buy" data-k="' + esc(s.key) + '" style="color:#ffd79a;">🔒 ' + (s.price ? Number(s.price).toLocaleString() + 'P' : '조건') + '</button>' : '')
        + (opts.tail || '') + '</div>';
}

function paintBody() {
    const body = OV.querySelector('.pl-body');
    const oldIn = OV.querySelector('.pl-in');
    if (oldIn && V.naming) V.nameVal = oldIn.value;
    const all = songs();
    let h = '';
    if (V.tab === 'all') {
        h += '<div class="pl-sub"><b>전체 곡 · ' + all.length + '곡</b><button class="pl-btn go" data-a="playall" data-src="all">▶ 처음부터</button></div>';
        h += all.map(function (s) {
            return songRow(s, { src: 'all', tail: '<button class="pl-mini-b" data-a="addto" data-k="' + esc(s.key) + '" aria-label="내 플리에 넣기">＋</button>' });
        }).join('');
    } else if (!V.list || !LISTS[V.list]) {
        V.list = null;
        const ids = listIds();
        h += '<div class="pl-sub"><b>내 플리 · ' + ids.length + '개</b>'
            + (ids.length < MAX_LISTS ? '<button class="pl-btn go" data-a="newlist">＋ 새 플리</button>' : '') + '</div>';
        if (V.naming === '__new') h += nameRow('');
        if (!ids.length && V.naming !== '__new') h += '<div class="pl-empty">아직 만든 플리가 없습니다.<br>「＋ 새 플리」로 만들고, 듣고 싶은 곡을 넣어 보세요.</div>';
        h += ids.map(function (id) {
            const l = LISTS[id];
            const first = song(l.s[0]);
            const on = Q.src === id && Q.key;
            return '<div class="pl-row' + (on ? ' cur' : '') + '" data-a="openlist" data-id="' + id + '">'
                + '<div class="pl-th" style="' + cov(first) + '"></div>'
                + '<div class="pl-tx"><b>' + esc(l.n) + '</b><span>' + l.s.length + '곡</span></div>'
                + '<button class="pl-mini-b" data-a="playlist" data-id="' + id + '"' + (l.s.length ? '' : ' disabled') + ' aria-label="재생">▶</button></div>';
        }).join('');
    } else {
        const id = V.list, l = LISTS[id];
        h += '<div class="pl-sub"><button class="pl-btn" data-a="back">‹ 목록</button>';
        if (V.naming === id) h += '</div>' + nameRow(l.n);
        else h += '<b>' + esc(l.n) + '</b></div>';
        h += '<div class="pl-sub" style="padding-top:0;">'
            + '<button class="pl-btn go" data-a="playlist" data-id="' + id + '"' + (l.s.length ? '' : ' disabled') + '>▶ 재생</button>'
            + '<button class="pl-btn" data-a="addsongs">＋ 곡 넣기</button>'
            + '<button class="pl-btn" data-a="rename">이름 바꾸기</button>'
            + '<button class="pl-btn bad" data-a="dellist">지우기</button></div>';
        const ss = l.s.map(song).filter(Boolean);
        if (!ss.length) h += '<div class="pl-empty">곡이 없습니다. 「＋ 곡 넣기」로 넣어 보세요.</div>';
        h += ss.map(function (s, i) {
            return songRow(s, { src: id, tail:
                '<button class="pl-mini-b" data-a="up" data-i="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="위로">▲</button>'
                + '<button class="pl-mini-b" data-a="down" data-i="' + i + '"' + (i < ss.length - 1 ? '' : ' disabled') + ' aria-label="아래로">▼</button>'
                + '<button class="pl-mini-b" data-a="rm" data-i="' + i + '" aria-label="빼기">✕</button>' });
        }).join('');
    }
    body.innerHTML = h;
    // 고르는 판 (곡을 어느 플리에 넣나 · 플리에 어떤 곡을 넣나)
    const old = OV.querySelector('.pl-pick');
    if (old) old.remove();
    if (V.picker) {
        const pk = document.createElement('div');
        pk.className = 'pl-pick';
        pk.dataset.a = 'pickx';
        pk.innerHTML = '<div>' + pickerHtml() + '</div>';
        OV.querySelector('.pl-card').appendChild(pk);
    }
    const inp = OV.querySelector('.pl-in');
    if (inp && document.activeElement !== inp) { inp.focus(); try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { } }
}
function nameRow(v) {
    if (V.nameVal != null) v = V.nameVal;
    return '<div class="pl-sub"><input class="pl-in" maxlength="24" placeholder="플리 이름" value="' + esc(v) + '">'
        + '<button class="pl-btn go" data-a="nameok">확인</button><button class="pl-btn" data-a="namex">취소</button></div>';
}
function pickerHtml() {
    const P = V.picker;
    if (V.naming === '__newwith') return '<div class="pl-sub"><b>새 플리 이름</b><button class="pl-btn" data-a="pickx">닫기</button></div>' + nameRow('');
    if (P.kind === 'song') {                              // 이 곡을 어느 플리에
        const s = song(P.k);
        const ids = listIds();
        let h = '<div class="pl-sub"><b>「' + esc(s ? s.title : '') + '」 넣을 플리</b><button class="pl-btn" data-a="pickx">닫기</button></div>';
        if (!ids.length) h += '<div class="pl-empty" style="padding:10px;">아직 만든 플리가 없습니다.</div>';
        h += ids.map(function (id) {
            const has = LISTS[id].s.indexOf(P.k) >= 0;
            return '<div class="pl-row" data-a="tgl" data-id="' + id + '"><div class="pl-chk' + (has ? ' on' : '') + '">' + (has ? '✓' : '') + '</div>'
                + '<div class="pl-tx"><b>' + esc(LISTS[id].n) + '</b><span>' + LISTS[id].s.length + '곡</span></div></div>';
        }).join('');
        if (ids.length < MAX_LISTS) h += '<div class="pl-sub"><button class="pl-btn go" data-a="newwith">＋ 새 플리를 만들어 넣기</button></div>';
        return h;
    }
    // 이 플리에 어떤 곡을
    const l = LISTS[P.id];
    let h = '<div class="pl-sub"><b>「' + esc(l ? l.n : '') + '」에 넣을 곡</b><button class="pl-btn" data-a="pickx">다 됐어요</button></div>';
    h += songs().map(function (s) {
        const has = l && l.s.indexOf(s.key) >= 0;
        return '<div class="pl-row" data-a="tgls" data-k="' + esc(s.key) + '"><div class="pl-chk' + (has ? ' on' : '') + '">' + (has ? '✓' : '') + '</div>'
            + '<div class="pl-th" style="' + cov(s) + ';width:34px;height:34px;"></div>'
            + '<div class="pl-tx"><b>' + esc(s.title) + '</b><span>' + esc(s.artist || 'Benz') + (isLocked(s) ? ' · 🔒 해금해야 들림' : '') + '</span></div></div>';
    }).join('');
    return h;
}

function commitName() {
    const inp = OV && OV.querySelector('.pl-in');
    const v = inp ? inp.value.trim() : '';
    if (V.naming === '__new' || V.naming === '__newwith') {
        const id = newList(v);
        if (id && V.naming === '__newwith' && V.picker && V.picker.k) { LISTS[id].s.push(V.picker.k); saveLists(); }
        if (V.naming === '__new' && id) V.list = id;
    } else if (V.naming && LISTS[V.naming]) {
        if (v) { LISTS[V.naming].n = v.slice(0, 24); saveLists(); }
    }
    V.naming = null; V.nameVal = null;
    if (Q.key) mediaMeta();
    full();
}

function onInput(e) {
    const t = e.target;
    if (!t || t.dataset.a !== 'seek') return;
    if (e.type === 'input') { seeking = true; const dur = A && isFinite(A.duration) ? A.duration : 0; const c = OV.querySelector('.pl-c'); if (c && dur) c.textContent = fmt(Number(t.value) / 1000 * dur * 1000); return; }
    seeking = false;
    if (A && isFinite(A.duration) && A.duration > 0) { A.currentTime = Number(t.value) / 1000 * A.duration; mediaPos(); }
}

function onClick(e) {
    const el = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
    if (!el || !OV || !OV.contains(el)) return;
    const a = el.dataset.a;
    if (a === 'pickx' && el.classList.contains('pl-pick') && e.target !== el) return;   // 판 안쪽 빈 곳
    switch (a) {
        case 'x': close(); return;
        case 'pickx': V.picker = null; if (V.naming === '__newwith') { V.naming = null; V.nameVal = null; } renderBody(); return;
        case 'tab': V.tab = el.dataset.v; V.list = null; V.naming = null; V.nameVal = null; V.picker = null; full(); return;
        case 'play': toggle(); return;
        case 'next': step(1, false); return;
        case 'prev': prev(); return;
        case 'shuf': setShuf(!SET.shuf); return;
        case 'rep': cycleRep(); return;
        case 'buy': e.stopPropagation(); buy(el.dataset.k); return;
        case 'pick': {
            const k = el.dataset.k, src = el.dataset.src;
            const sg = song(k);
            if (sg && isLocked(sg)) { buy(k, src); return; }
            if (Q.key === k && Q.src === src && A) { toggle(); return; }
            playFrom(src, k); return;
        }
        case 'playall': {
            const b = baseOf('all');
            if (b.length) playFrom('all', SET.shuf ? b[Math.floor(Math.random() * b.length)] : b[0]);
            return;
        }
        case 'playlist': {
            e.stopPropagation();
            const id = el.dataset.id, l = LISTS[id];
            if (!l || !l.s.length) return;
            const b = baseOf(id);
            if (b.length) playFrom(id, SET.shuf ? b[Math.floor(Math.random() * b.length)] : b[0]);
            return;
        }
        case 'addto': e.stopPropagation(); V.picker = { kind: 'song', k: el.dataset.k }; full(); return;
        case 'tgl': {
            const l = LISTS[el.dataset.id], k = V.picker && V.picker.k;
            if (!l || !k) return;
            const i = l.s.indexOf(k);
            if (i >= 0) l.s.splice(i, 1); else l.s.push(k);
            saveLists(); afterListEdit(el.dataset.id); full(); return;
        }
        case 'newwith': V.naming = '__newwith'; V.nameVal = null; renderBody(); return;
        case 'newlist': V.naming = '__new'; V.nameVal = null; full(); return;
        case 'nameok': commitName(); return;
        case 'namex': V.naming = null; V.nameVal = null; full(); return;
        case 'openlist': V.list = el.dataset.id; V.naming = null; full(); return;
        case 'back': V.list = null; V.naming = null; full(); return;
        case 'rename': V.naming = V.list; V.nameVal = null; full(); return;
        case 'dellist': {
            const id = V.list, l = LISTS[id];
            if (!l || !confirm('「' + l.n + '」 플리를 지울까요?\n(곡 파일은 그대로입니다)')) return;
            delete LISTS[id];
            saveLists();
            if (Q.src === id) { Q.src = 'all'; makeOrder(Q.key); }
            V.list = null; full(); return;
        }
        case 'addsongs': V.picker = { kind: 'list', id: V.list }; full(); return;
        case 'tgls': {
            const id = V.picker && V.picker.id, l = LISTS[id], k = el.dataset.k;
            if (!l) return;
            const i = l.s.indexOf(k);
            if (i >= 0) l.s.splice(i, 1); else l.s.push(k);
            saveLists(); afterListEdit(id); full(); return;
        }
        case 'up': case 'down': case 'rm': {
            e.stopPropagation();
            const id = V.list, l = LISTS[id];
            if (!l) return;
            const keys = l.s.filter(function (k) { return !!song(k); });
            const i = Number(el.dataset.i);
            if (a === 'rm') keys.splice(i, 1);
            else {
                const j = a === 'up' ? i - 1 : i + 1;
                if (j < 0 || j >= keys.length) return;
                const t = keys[i]; keys[i] = keys[j]; keys[j] = t;
            }
            l.s = keys;
            saveLists(); afterListEdit(id); full(); return;
        }
    }
}
// 🔒 해금 — rhythm.js 가 포인트를 빼고 적는다 · 되면 그 곡을 바로 튼다
function buy(k, src) {
    const s = song(k);
    if (!s || !isLocked(s)) return;
    if (!s.price) {                                        // 조건으로 여는 곡 — 포인트로 못 연다
        const msg = '「' + s.title + '」은(는) 리듬 게임에서 ' + (s.need || '조건') + ' 을 받으면 열립니다.';
        try { if (typeof showCustomAlert === 'function' && !restOn()) showCustomAlert(msg); else alert(msg); } catch (e) { }
        return;
    }
    if (!u_()) {                                           // 쉬는 시간 — 로그아웃되어 있어 포인트를 쓸 수 없다
        try { if (typeof showCustomAlert === 'function' && !restOn()) showCustomAlert('들어와서 해금할 수 있습니다.'); else alert('「' + s.title + '」은(는) 해금해야 들을 수 있습니다.\n쉬는 시간이 끝나고 들어와서 해금해 주세요.'); } catch (e) { }
        return;
    }
    if (typeof window.rhythmBuy !== 'function') return;
    if (!confirm('「' + s.title + '」은(는) 해금해야 들을 수 있습니다.\n' + Number(s.price || 0).toLocaleString() + 'P 로 해금할까요?\n(리듬 게임에서도 같이 열립니다)')) return;
    const r = window.rhythmBuy(k);
    if (!r || !r.ok) {
        const msg = '해금하지 못했습니다.\n\n' + ((r && r.why) || '');
        try { if (typeof showCustomAlert === 'function') showCustomAlert(msg); else alert(msg); } catch (e) { }
        return;
    }
    full();
    playFrom(src || 'all', k);
}
// 듣고 있는 플리를 고치면 — 다음 곡 차례도 맞춘다 (지금 곡은 그대로 · 지금 곡을 뺐으면 그 곡이 끝난 뒤 남은 차례로)
function afterListEdit(id) {
    if (Q.src !== id || !Q.key) return;
    const cur = Q.key;
    const inList = LISTS[id] && LISTS[id].s.indexOf(cur) >= 0;
    if (inList) { makeOrder(cur); return; }
    const before = Q.order.slice(0, Q.i);
    makeOrder(null);
    // 지금 곡이 빠졌다 — 차례에서 지금 곡 앞에 있던 곡들 다음 자리에 선 것처럼
    let i = -1;
    for (let k = before.length - 1; k >= 0 && i < 0; k--) i = Q.order.indexOf(before[k]);
    Q.i = i;                                               // 끝나면 step(+1) 로 i+1 번째
}


// ==========================================
// 작은 재생기 (창을 닫았을 때)
// ==========================================
let MINI = null;
function paintMini() {
    // 곡이 걸려 있으면 늘 (쉬는 시간이 끝나 로그인 화면에 있어도 — 듣던 곡을 끌 수 있게) · 쉬는 시간 덮개 위로
    const show = !!(Q.key && !OV);
    if (!show) { if (MINI) { MINI.remove(); MINI = null; } return; }
    css();
    if (!MINI) {
        MINI = document.createElement('div');
        MINI.id = 'pl-mini';
        document.body.appendChild(MINI);
        ['pointerdown', 'touchstart'].forEach(function (t) { MINI.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
        MINI.addEventListener('click', function (e) {
            const b = e.target.closest('[data-m]');
            const m = b ? b.dataset.m : '';
            if (m === 'play') toggle();
            else if (m === 'next') step(1, false);
            else if (m === 'stop') stop();
            else if (m === 'open') { if (who()) open(); }
        });
    }
    MINI.style.zIndex = restOn() ? '2147483647' : '';
    const s = song(Q.key);
    const on = playing();
    MINI.innerHTML = '<div class="pl-mc" data-m="open" style="' + cov(s) + '"></div>'
        + '<div class="pl-mt" data-m="open">' + (on ? '♪ ' : '') + esc(s ? s.title : '') + '</div>'
        + '<button data-m="play" aria-label="' + (on ? '멈춤' : '재생') + '">' + svg(on ? 'pause' : 'play', 16) + '</button>'
        + '<button data-m="next" aria-label="다음 곡">' + svg('next', 16) + '</button>'
        + '<button data-m="stop" aria-label="끄기" style="font-size:12px;">✕</button>';
}

// ==========================================
// 다른 것과 맞물리기
// ==========================================
// 리듬 게임 — 열면 잠시 멈추고, 닫히면 이어 튼다
(function hookRhythm() {
    const iv = setInterval(function () {
        if (typeof window.rhythmOpen !== 'function') return;
        if (window.rhythmOpen._pl) { clearInterval(iv); return; }
        const _o = window.rhythmOpen;
        const w = function () {
            if (playing()) { byRhythm = true; A.pause(); }
            if (OV) close();
            return _o.apply(this, arguments);
        };
        w._pl = true;
        window.rhythmOpen = w;
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
    setInterval(function () {
        if (!byRhythm) return;
        if (document.getElementById('rg-ov')) return;
        byRhythm = false;
        if (A && Q.key && A.paused) { sessionOn(); const p = A.play(); if (p && p.catch) p.catch(function () { }); }
    }, 1000);
})();
// 단말을 끄면(로그아웃) 멈춘다 — 다음 사람이 이어 듣지 않게
//   ★ 쉬는 시간이 되어 내보내는 것(rest-time.js __restKick)은 예외 — 이어 튼다 · 플리와 해금 기록은 그 사원 것 그대로 쥐고 있는다
(function hookLogout() {
    const iv = setInterval(function () {
        if (typeof window.logout !== 'function') return;
        if (window.logout._pl) { clearInterval(iv); return; }
        const _o = window.logout;
        const w = function () {
            if (window.__restKick) {
                try {
                    const u = u_();
                    if (u && u.code) { OWN = Object.assign({}, (u.rhythmOwn && typeof u.rhythmOwn === 'object') ? u.rhythmOwn : {}); ownFor = String(u.code); }
                } catch (e) { }
                const r = _o.apply(this, arguments);
                setTimeout(function () { try { paint(); if (OV) { OV.style.zIndex = '2147483647'; renderBody(); } } catch (e) { } }, 50);
                return r;
            }
            try { stop(); close(); } catch (e) { }
            LISTS = {}; listsFor = null; OWN = null; ownFor = null;
            return _o.apply(this, arguments);
        };
        w._pl = true;
        window.logout = w;
        try { logout = w; } catch (e) { }
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// 쉬는 시간 덮개가 뜨고 걷힐 때 — 창 · 작은 재생기를 덮개 위 · 아래로
(function restWatch() {
    let last = null;
    setInterval(function () {
        const r = restOn();
        if (r === last) return;
        last = r;
        if (OV) OV.style.zIndex = r ? '2147483647' : '';
        paintMini();
    }, 700);
})();

// 광장 ☰ 「생활」 — 포토존 다음
(function menu() {
    if (typeof PLAZA === 'undefined' || !PLAZA.MENU) return;
    if (PLAZA.MENU.some(function (m) { return m.fn === 'playlistOpen'; })) return;
    const row = { g: 'life', n: '플레이리스트', i: '🎧', fn: 'playlistOpen', stay: 1 };
    let at = -1;
    PLAZA.MENU.forEach(function (m, i) { if (m.g === 'life' && m.n === '포토존') at = i; });
    if (at < 0) PLAZA.MENU.forEach(function (m, i) { if (m.g === 'life') at = i; });
    PLAZA.MENU.splice(at + 1, 0, row);
})();

window.playlistOpen = open;
window.playlistState = function () {
    const out = { 곡: Q.key, 목록: srcName(Q.src), 차례: Q.order, 몇째: Q.i, 반복: REP_TXT[SET.rep], 무작위: SET.shuf, 재생중: playing(), 플리: LISTS };
    console.log(out);
    return out;
};
window.playlistDebug = { A: function () { return A; }, Q: Q, SET: SET, lists: function () { return LISTS; }, step: step, playFrom: playFrom };
console.log('[🎧 플레이리스트] 광장 ☰ 생활 · playlistOpen()');
})();
