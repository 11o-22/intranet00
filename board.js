// ==========================================
// ★ 사내 게시판 — 광장 분수대 앞에 세운 판
// bundles.json 마지막 묶음, giftbox.js 다음
// ==========================================
//
// ■ 무엇인가
//
//   글을 올리고, 댓글을 달고, **특정 사람에게만** 남길 수도 있는 판.
//   광장 가운데(분수대 그림 앞)에 서 있고, 누르면 창이 열린다 (plaza.js).
//   건의함(상담사만 봄)과 흘러가는 채팅 사이에 비어 있던 **남는 글** 자리다.
//
// ■ 어디에 쌓이나
//
//       board/posts/<번호>        = { at, by, name, text, to?, toName?, cn }
//       board/comments/<글번호>/<번호> = { at, by, name, text }
//
//   cn 은 댓글 수다 (목록에 숫자를 띄우려고 글에 붙여 둔다).
//
// ■ 누가 보나
//
//   · 그냥 글 — 사원 모두.
//   · 특정 사람에게 남긴 글(to) — **쓴 사람 · 받는 사람 · 상담사** 만.
//     그 글의 댓글도 같다.
//
//   ✗ 이것은 **화면에서 거르는** 것이다. 이 게임의 다른 칸(선물함 · 편지)이
//     그렇듯 서버 규칙으로 막은 것이 아니다.
//
// ■ 지우기
//
//   글 — 쓴 사람 · 상담사.   댓글 — 쓴 사람 · 글쓴이 · 상담사.
//
// ■ 초록 불
//
//   마지막으로 판을 연 뒤로 **내가 볼 수 있는 새 글**(남이 쓴 것)이 있으면
//   판 모서리에 초록 점이 켜진다. 나에게 남긴 글도 여기로 알게 된다.
//
// ■ 콘솔
//   boardState()      지금 들고 있는 글 수 · 안 읽은 글 수

(function board() {

const ROOT = 'board';
const COUNSEL = 'kario0987';
const MAX_POST = 600;
const MAX_COM = 240;
const KEEP = 80;                 // 판이 들고 있는 글 수 (최근 것부터)
const POST_GAP = 6000;           // 연달아 쓰는 사이 (ms)
const COM_GAP = 2000;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function isCounsel(u) { return !!(u && u.code === COUNSEL); }
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function when(t) {
    if (!t) return '';
    const d = new Date(Number(t)), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + p(d.getHours()) + ':' + p(d.getMinutes());
}
function users() { try { return (typeof db !== 'undefined' && db && db.users) || {}; } catch (e) { return {}; } }
function nameOf(code) { const u = users()[code]; return (u && u.name) || code || '?'; }

// ==========================================
// 판 그림 — 광장에 세우는 것 (plaza.js 가 가져다 쓴다)
// ==========================================
window.plazaBoardArt = function () {
    const R = function (x, y, w, h, c) {
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
    };
    return '<svg viewBox="0 0 34 42" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">'
        // 다리
        + R(6, 26, 3, 16, '#4a2f17') + R(25, 26, 3, 16, '#4a2f17')
        + R(6, 26, 1, 16, '#6b4423') + R(25, 26, 1, 16, '#6b4423')
        + R(4, 40, 7, 2, '#2f1f10') + R(23, 40, 7, 2, '#2f1f10')
        // 지붕 · 틀
        + R(0, 0, 34, 3, '#3b2412') + R(1, 3, 32, 1, '#6b4423')
        + R(1, 3, 32, 25, '#6b4423') + R(2, 4, 30, 23, '#c8964f')
        + R(2, 4, 30, 1, '#a87a38') + R(2, 26, 30, 1, '#a87a38')
        // 붙인 쪽지들
        + R(4, 6, 8, 8, '#f4efe2') + R(5, 8, 6, 1, '#9a9488') + R(5, 10, 6, 1, '#9a9488') + R(5, 12, 4, 1, '#9a9488')
        + R(15, 7, 7, 9, '#ffd979') + R(16, 9, 5, 1, '#b8923a') + R(16, 11, 5, 1, '#b8923a') + R(16, 13, 3, 1, '#b8923a')
        + R(24, 6, 6, 7, '#9fd3ff') + R(25, 8, 4, 1, '#5b8db4') + R(25, 10, 3, 1, '#5b8db4')
        + R(6, 17, 9, 8, '#ffb3a7') + R(7, 19, 7, 1, '#b86a60') + R(7, 21, 5, 1, '#b86a60')
        + R(18, 18, 8, 7, '#f4efe2') + R(19, 20, 6, 1, '#9a9488') + R(19, 22, 4, 1, '#9a9488')
        // 핀
        + R(7, 6, 2, 2, '#d64535') + R(18, 7, 2, 2, '#d64535') + R(26, 6, 2, 2, '#d64535')
        + R(10, 17, 2, 2, '#d64535') + R(21, 18, 2, 2, '#d64535')
        + '</svg>';
};

// ==========================================
// 글 — 지켜본다
// ==========================================
let posts = {};
let watching = false;
let ref_ = null;
let comsRef = null;
let comsOf = null;
let coms = {};

function seenKey() { const u = me(); return 'bd_seen_' + (u ? u.code : ''); }
function getSeen() { try { return Number(localStorage.getItem(seenKey())) || 0; } catch (e) { return 0; } }
function setSeen(t) { try { localStorage.setItem(seenKey(), String(t)); } catch (e) { } }

function canSee(p) {
    const u = me(); if (!u || !p) return false;
    if (!p.to) return true;
    return p.by === u.code || p.to === u.code || isCounsel(u);
}
function visible() {
    return Object.keys(posts).map(function (k) { const p = posts[k]; if (p) p._id = k; return p; })
        .filter(function (p) { return p && canSee(p); })
        .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
}
function unread() {
    const u = me(); if (!u) return 0;
    const s = getSeen();
    return visible().filter(function (p) { return (p.at || 0) > s && p.by !== u.code; }).length;
}

function start() {
    if (watching) return;
    const d = db_(), u = me(); if (!d || !u) return;
    watching = true;
    try { if (!localStorage.getItem(seenKey())) setSeen(Date.now()); } catch (e) { }
    ref_ = d.ref(ROOT + '/posts').limitToLast(KEEP);
    const put = function (s) { posts[s.key] = s.val(); changed(); };
    ref_.on('child_added', put);
    ref_.on('child_changed', put);
    ref_.on('child_removed', function (s) { delete posts[s.key]; changed(); });
}
function changed() {
    dot();
    if (P && P.el && P.el.isConnected) paint();
}

// 광장이 열려 있는 동안만 지켜본다 — 다른 데서 괜히 내려받지 않는다
setInterval(function () {
    if (!me() || !db_()) return;
    if (document.getElementById('plaza-ov')) start();
}, 2500);

function dot() {
    const e = document.querySelector('.plaza-board');
    if (e) e.classList.toggle('new', unread() > 0);
}
setInterval(dot, 1500);

// ==========================================
// 창
// ==========================================
let P = null;      // { el, view, filter, tid, mode, to, q }

function css() {
    if (document.getElementById('bd-css')) return;
    const s = document.createElement('style'); s.id = 'bd-css';
    s.textContent = [
        '#bd-ov{position:fixed;inset:0;z-index:1000000;display:flex;flex-direction:column;justify-content:flex-end;',
        '  background:rgba(4,4,8,.66);font-family:inherit;color:#e8e2d6;}',
        '#bd-ov .bd-card{background:linear-gradient(180deg,#15151f,#0a0a10);border:1px solid #2b2b38;border-bottom:0;',
        '  border-radius:20px 20px 0 0;padding:12px 14px 16px;max-height:90dvh;height:90dvh;display:flex;flex-direction:column;',
        '  box-shadow:0 -10px 34px rgba(0,0,0,.6);width:100%;max-width:560px;margin:0 auto;box-sizing:border-box;}',
        '#bd-ov .grip{width:38px;height:4px;border-radius:2px;background:#39394a;margin:0 auto 8px;flex:0 0 auto;}',
        '#bd-ov .hd{display:flex;align-items:center;gap:8px;flex:0 0 auto;margin-bottom:8px;}',
        '#bd-ov .hd h4{flex:1;margin:0;font-size:15px;color:#ffe9bd;}',
        '#bd-ov button{font-family:inherit;cursor:pointer;}',
        '#bd-ov .bt{padding:7px 12px;border-radius:10px;border:1px solid #8a6a2a;background:rgba(217,160,90,.16);',
        '  color:#ffe9bd;font-size:12px;font-weight:bold;}',
        '#bd-ov .bt.g{border-color:#3a3a4a;background:rgba(255,255,255,.04);color:#b5ab9a;font-weight:normal;}',
        '#bd-ov .bt:disabled{opacity:.45;}',
        '#bd-ov .tabs{display:flex;gap:6px;flex:0 0 auto;margin-bottom:8px;}',
        '#bd-ov .tabs button{flex:1;padding:7px 4px;border-radius:10px;border:1px solid #2b2b38;',
        '  background:rgba(255,255,255,.04);color:#a79e8f;font-size:12px;}',
        '#bd-ov .tabs button.on{background:rgba(217,160,90,.16);border-color:#8a6a2a;color:#ffe9bd;}',
        '#bd-ov .bd-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
        '#bd-ov .post{padding:10px 11px;margin-bottom:8px;border-radius:12px;background:rgba(255,255,255,.045);',
        '  border:1px solid #2b2b38;}',
        '#bd-ov .post.me{border-color:#5c4a22;}',
        '#bd-ov .post.new{border-color:#3e7d44;}',
        '#bd-ov .meta{display:flex;align-items:center;gap:6px;font-size:11px;color:#8d8578;margin-bottom:5px;flex-wrap:wrap;}',
        '#bd-ov .meta b{color:#ffe9bd;font-size:12px;}',
        '#bd-ov .tag{padding:1px 6px;border-radius:7px;font-size:10px;background:rgba(214,120,200,.22);color:#f4b8ea;}',
        '#bd-ov .tag.in{background:rgba(76,175,80,.22);color:#b9e8bd;}',
        '#bd-ov .txt{font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:#ded7c8;}',
        '#bd-ov .ft{display:flex;align-items:center;gap:10px;margin-top:7px;font-size:11px;color:#8d8578;}',
        '#bd-ov .ft .x{margin-left:auto;background:none;border:0;color:#8d8578;font-size:11px;padding:2px 4px;}',
        '#bd-ov .ft .x.ask{color:#ff7b6b;font-weight:bold;}',
        '#bd-ov .empty{padding:34px 0;text-align:center;color:#6f685c;font-size:12px;}',
        '#bd-ov textarea,#bd-ov input[type=text]{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid #33333f;',
        '  background:#101018;color:#e8e2d6;font-family:inherit;font-size:13px;padding:9px 10px;outline:none;}',
        '#bd-ov textarea{min-height:130px;resize:none;line-height:1.5;}',
        '#bd-ov .row{display:flex;gap:6px;margin-bottom:8px;}',
        '#bd-ov .row button{flex:1;padding:8px 4px;border-radius:10px;border:1px solid #2b2b38;background:rgba(255,255,255,.04);',
        '  color:#a79e8f;font-size:12px;}',
        '#bd-ov .row button.on{background:rgba(217,160,90,.16);border-color:#8a6a2a;color:#ffe9bd;}',
        '#bd-ov .pick{max-height:150px;overflow-y:auto;margin:6px 0 8px;}',
        '#bd-ov .pick button{display:block;width:100%;text-align:left;padding:8px 10px;margin-bottom:4px;border-radius:9px;',
        '  border:1px solid #2b2b38;background:rgba(255,255,255,.04);color:#ded7c8;font-size:12px;}',
        '#bd-ov .chip{display:inline-block;padding:4px 10px;border-radius:12px;background:rgba(214,120,200,.22);',
        '  color:#f4b8ea;font-size:12px;margin:2px 0 8px;}',
        '#bd-ov .cnt{font-size:10px;color:#6f685c;text-align:right;margin:-4px 2px 8px;}',
        '#bd-ov .com{padding:8px 10px;margin-bottom:6px;border-radius:10px;background:rgba(255,255,255,.035);',
        '  border:1px solid #262633;}',
        '#bd-ov .cin{display:flex;gap:6px;flex:0 0 auto;margin-top:8px;}',
        '#bd-ov .cin input{flex:1;}',
        '#bd-ov .msg{flex:0 0 auto;min-height:16px;font-size:11px;color:#ff9a8a;margin:4px 2px 0;}'
    ].join('\n');
    document.head.appendChild(s);
}

function close() {
    unwatchComs();
    if (P && P.el) P.el.remove();
    P = null;
}
function unwatchComs() {
    if (comsRef) { try { comsRef.off(); } catch (e) { } }
    comsRef = null; comsOf = null; coms = {};
}

window.plazaBoardOpen = function () {
    const u = me(); if (!u) return;
    css(); start();
    close();
    const el = document.createElement('div');
    el.id = 'bd-ov';
    el.innerHTML = '<div class="bd-card"></div>';
    el.addEventListener('pointerdown', function (e) { if (e.target === el) close(); e.stopPropagation(); });
    document.body.appendChild(el);
    P = { el: el, view: 'list', filter: 'all', tid: null, mode: 'all', to: null, q: '', msg: '', last: 0, lastC: 0, ask: null };
    setSeen(Date.now());
    dot();
    paint();
};

function card() { return P.el.querySelector('.bd-card'); }
function msg(t) {
    if (!P) return;
    P.msg = t || '';
    const m = P.el.querySelector('.msg'); if (m) m.textContent = P.msg;
}
function canDelPost(p) { const u = me(); return !!u && (p.by === u.code || isCounsel(u)); }

function paint() {
    if (!P || !P.el.isConnected) return;
    if (P.view === 'write') return paintWrite();
    if (P.view === 'thread') return paintThread();
    paintList();
}

function postHtml(p, full) {
    const u = me();
    let tag = '';
    if (p.to) {
        tag = (p.to === u.code) ? '<span class="tag in">나에게</span>'
            : '<span class="tag">→ ' + esc(p.toName || nameOf(p.to)) + '</span>';
    }
    const isNew = !full && (p.at || 0) > getSeenOpen() && p.by !== u.code;
    return '<div class="post' + (p.by === u.code ? ' me' : '') + (isNew ? ' new' : '') + '" data-id="' + esc(p._id) + '">'
        + '<div class="meta"><b>' + esc(p.name || nameOf(p.by)) + '</b>' + tag + '<span>' + esc(when(p.at)) + '</span></div>'
        + '<div class="txt">' + esc(p.text) + '</div>'
        + (full ? '' : '<div class="ft"><span>💬 ' + (Number(p.cn) || 0) + '</span>'
            + (canDelPost(p) ? '<button class="x" data-del="' + esc(p._id) + '">' + (P.ask === p._id ? '정말 지웁니다' : '지우기') + '</button>' : '')
            + '</div>')
        + '</div>';
}
// 창을 연 순간의 「마지막으로 본 때」 — 열자마자 setSeen 으로 덮이므로 따로 들고 있는다
function getSeenOpen() { return (P && P.seen0 != null) ? P.seen0 : 0; }

function paintList() {
    const u = me();
    const all = visible();
    const list = all.filter(function (p) {
        if (P.filter === 'me') return p.to === u.code;
        if (P.filter === 'mine') return p.by === u.code;
        return true;
    });
    card().innerHTML = '<div class="grip"></div>'
        + '<div class="hd"><h4>📌 사내 게시판</h4><button class="bt" id="bd-new">글쓰기</button>'
        + '<button class="bt g" id="bd-x">✕</button></div>'
        + '<div class="tabs">'
        + [['all', '전체'], ['me', '나에게'], ['mine', '내 글']].map(function (t) {
            return '<button data-f="' + t[0] + '"' + (P.filter === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>';
        }).join('') + '</div>'
        + '<div class="bd-body">' + (list.length ? list.map(function (p) { return postHtml(p, false); }).join('')
            : '<div class="empty">' + (P.filter === 'me' ? '나에게 남긴 글이 없습니다.'
                : P.filter === 'mine' ? '쓴 글이 없습니다.' : '아직 글이 없습니다.') + '</div>') + '</div>'
        + '<div class="msg">' + esc(P.msg) + '</div>';
    const c = card();
    c.querySelector('#bd-x').onclick = close;
    c.querySelector('#bd-new').onclick = function () { P.view = 'write'; P.mode = 'all'; P.to = null; P.q = ''; P.msg = ''; paint(); };
    Array.prototype.forEach.call(c.querySelectorAll('.tabs button'), function (b) {
        b.onclick = function () { P.filter = b.dataset.f; paint(); };
    });
    Array.prototype.forEach.call(c.querySelectorAll('.post'), function (e) {
        e.onclick = function (ev) {
            if (ev.target.closest('[data-del]')) return;
            openThread(e.dataset.id);
        };
    });
    Array.prototype.forEach.call(c.querySelectorAll('[data-del]'), function (b) {
        b.onclick = function () {
            const id = b.dataset.del;
            if (P.ask !== id) { P.ask = id; paint(); setTimeout(function () { if (P && P.ask === id) { P.ask = null; if (P.view === 'list') paint(); } }, 3000); return; }
            P.ask = null;
            delPost(id);
        };
    });
}

// ── 쓰기
function candidates(q) {
    const u = me(), us = users();
    q = String(q || '').trim().toLowerCase();
    if (!q) return [];
    return Object.keys(us).filter(function (c) {
        const x = us[c];
        if (!x || c === u.code || !x.name) return false;
        return String(x.name).toLowerCase().indexOf(q) >= 0 || String(x.no || '').toLowerCase().indexOf(q) >= 0;
    }).slice(0, 8);
}

function paintWrite() {
    const keep = (card().querySelector('#bd-t') || {}).value;
    if (keep != null) P.draft = keep;
    card().innerHTML = '<div class="grip"></div>'
        + '<div class="hd"><h4>글쓰기</h4><button class="bt g" id="bd-back">← 목록</button></div>'
        + '<div class="bd-body">'
        + '<div class="row"><button data-m="all"' + (P.mode === 'all' ? ' class="on"' : '') + '>모두에게</button>'
        + '<button data-m="one"' + (P.mode === 'one' ? ' class="on"' : '') + '>특정 사람에게만</button></div>'
        + (P.mode === 'one'
            ? (P.to ? '<div class="chip">→ ' + esc(nameOf(P.to)) + ' <span style="opacity:.7;cursor:pointer" id="bd-unto">✕</span></div>'
                : '<input type="text" id="bd-q" placeholder="이름이나 사번으로 찾기" value="' + esc(P.q) + '">'
                + '<div class="pick">' + candidates(P.q).map(function (c) {
                    const x = users()[c];
                    return '<button data-c="' + esc(c) + '">' + esc(x.name) + (x.no ? ' · ' + esc(x.no) : '') + '</button>';
                }).join('') + '</div>')
            : '')
        + '<textarea id="bd-t" maxlength="' + MAX_POST + '" placeholder="' + (P.mode === 'one' ? '받는 사람과 상담사만 볼 수 있습니다.' : '모두가 볼 수 있습니다.') + '">' + esc(P.draft || '') + '</textarea>'
        + '<div class="cnt" id="bd-n">0 / ' + MAX_POST + '</div>'
        + '<button class="bt" id="bd-go" style="width:100%;padding:10px">올리기</button>'
        + '</div><div class="msg">' + esc(P.msg) + '</div>';
    const c = card();
    const t = c.querySelector('#bd-t');
    const cnt = function () { c.querySelector('#bd-n').textContent = t.value.length + ' / ' + MAX_POST; P.draft = t.value; };
    t.oninput = cnt; cnt();
    c.querySelector('#bd-back').onclick = function () { P.view = 'list'; P.msg = ''; paint(); };
    Array.prototype.forEach.call(c.querySelectorAll('.row button'), function (b) {
        b.onclick = function () { P.mode = b.dataset.m; if (P.mode === 'all') P.to = null; paintWrite(); };
    });
    const q = c.querySelector('#bd-q');
    if (q) {
        q.oninput = function () { P.q = q.value; P.draft = t.value; paintWrite(); const q2 = P.el.querySelector('#bd-q'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } };
    }
    Array.prototype.forEach.call(c.querySelectorAll('.pick button'), function (b) {
        b.onclick = function () { P.to = b.dataset.c; paintWrite(); };
    });
    const un = c.querySelector('#bd-unto'); if (un) un.onclick = function () { P.to = null; paintWrite(); };
    c.querySelector('#bd-go').onclick = submitPost;
}

function submitPost() {
    const u = me(), d = db_(); if (!u || !d) return;
    const t = String((P.el.querySelector('#bd-t') || {}).value || '').trim().slice(0, MAX_POST);
    if (!t) { msg('내용을 적어 주십시오.'); return; }
    if (P.mode === 'one' && !P.to) { msg('받는 사람을 골라 주십시오.'); return; }
    if (Date.now() - (P.last || 0) < POST_GAP) { msg('잠시 뒤에 다시 올려 주십시오.'); return; }
    P.last = Date.now();
    const o = { at: Date.now(), by: u.code, name: u.name || u.code, text: t, cn: 0 };
    if (P.mode === 'one' && P.to) { o.to = P.to; o.toName = nameOf(P.to); }
    const key = d.ref(ROOT + '/posts').push().key;
    const b = P.el.querySelector('#bd-go'); if (b) b.disabled = true;
    d.ref(ROOT + '/posts/' + key).set(o).then(function () {
        posts[key] = o; P.draft = ''; P.view = 'list'; P.filter = 'all'; P.msg = ''; paint();
        setSeen(Date.now());
    }).catch(function (e) {
        console.error('[게시판] 올리지 못했습니다', e);
        if (b) b.disabled = false; msg('올리지 못했습니다.');
    });
}

function delPost(id) {
    const d = db_(); const p = posts[id]; if (!d || !p || !canDelPost(p)) return;
    const up = {}; up[ROOT + '/posts/' + id] = null; up[ROOT + '/comments/' + id] = null;
    d.ref('/').update(up).then(function () { delete posts[id]; changed(); })
        .catch(function () { msg('지우지 못했습니다.'); });
}

// ── 글 하나 + 댓글
function openThread(id) {
    if (!posts[id]) return;
    P.view = 'thread'; P.tid = id; P.msg = ''; P.cask = null;
    unwatchComs();
    const d = db_(); if (!d) return;
    comsOf = id; coms = {};
    comsRef = d.ref(ROOT + '/comments/' + id);
    comsRef.on('value', function (s) {
        coms = s.val() || {};
        if (P && P.view === 'thread' && P.tid === id) paintThread(true);
    });
    paintThread();
}

function canDelCom(c, p) {
    const u = me(); return !!u && (c.by === u.code || p.by === u.code || isCounsel(u));
}

function paintThread(soft) {
    const p = posts[P.tid];
    if (!p || !canSee(p)) { P.view = 'list'; unwatchComs(); return paint(); }
    p._id = P.tid;
    const keep = soft ? (card().querySelector('#bd-ci') || {}).value : '';
    const list = Object.keys(coms).map(function (k) { const c = coms[k]; if (c) c._id = k; return c; })
        .filter(Boolean).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    card().innerHTML = '<div class="grip"></div>'
        + '<div class="hd"><h4>글</h4>'
        + (canDelPost(p) ? '<button class="bt g" id="bd-dp">' + (P.ask === 'T' ? '정말 지웁니다' : '지우기') + '</button>' : '')
        + '<button class="bt g" id="bd-back">← 목록</button></div>'
        + '<div class="bd-body">' + postHtml(p, true)
        + '<div class="meta" style="margin:10px 2px 6px">댓글 ' + list.length + '</div>'
        + (list.length ? list.map(function (c) {
            return '<div class="com"><div class="meta"><b>' + esc(c.name || nameOf(c.by)) + '</b><span>' + esc(when(c.at)) + '</span>'
                + (canDelCom(c, p) ? '<button class="x" data-dc="' + esc(c._id) + '" style="margin-left:auto;background:none;border:0;color:'
                    + (P.cask === c._id ? '#ff7b6b' : '#8d8578') + ';font-size:11px">' + (P.cask === c._id ? '정말 지웁니다' : '지우기') + '</button>' : '')
                + '</div><div class="txt">' + esc(c.text) + '</div></div>';
        }).join('') : '<div class="empty" style="padding:14px 0">아직 댓글이 없습니다.</div>')
        + '</div>'
        + '<div class="cin"><input type="text" id="bd-ci" maxlength="' + MAX_COM + '" placeholder="댓글"><button class="bt" id="bd-cs">달기</button></div>'
        + '<div class="msg">' + esc(P.msg) + '</div>';
    const c = card();
    const ci = c.querySelector('#bd-ci'); if (keep) ci.value = keep;
    c.querySelector('#bd-back').onclick = function () { unwatchComs(); P.view = 'list'; P.msg = ''; paint(); };
    const dp = c.querySelector('#bd-dp');
    if (dp) dp.onclick = function () {
        if (P.ask !== 'T') { P.ask = 'T'; paintThread(true); setTimeout(function () { if (P && P.ask === 'T') { P.ask = null; if (P.view === 'thread') paintThread(true); } }, 3000); return; }
        P.ask = null; const id = P.tid; unwatchComs(); P.view = 'list'; delPost(id); paint();
    };
    const go = function () { addCom(ci.value); };
    c.querySelector('#bd-cs').onclick = go;
    ci.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    Array.prototype.forEach.call(c.querySelectorAll('[data-dc]'), function (b) {
        b.onclick = function () {
            const id = b.dataset.dc;
            if (P.cask !== id) { P.cask = id; paintThread(true); setTimeout(function () { if (P && P.cask === id) { P.cask = null; if (P.view === 'thread') paintThread(true); } }, 3000); return; }
            P.cask = null; delCom(id);
        };
    });
}

function bumpCn(id, n) {
    const d = db_(); if (!d) return;
    d.ref(ROOT + '/posts/' + id + '/cn').transaction(function (v) { return Math.max(0, (Number(v) || 0) + n); });
}

function addCom(text) {
    const u = me(), d = db_(); if (!u || !d || !P) return;
    const id = P.tid, p = posts[id];
    const t = String(text || '').trim().slice(0, MAX_COM);
    if (!t) return;
    if (!p || !canSee(p)) return;
    if (Date.now() - (P.lastC || 0) < COM_GAP) { msg('잠시 뒤에 다시 달아 주십시오.'); return; }
    P.lastC = Date.now();
    const ck = d.ref(ROOT + '/comments/' + id).push().key;
    d.ref(ROOT + '/comments/' + id + '/' + ck).set({ at: Date.now(), by: u.code, name: u.name || u.code, text: t })
        .then(function () { bumpCn(id, 1); })
        .catch(function () { msg('달지 못했습니다.'); });
    const ci = P.el.querySelector('#bd-ci'); if (ci) ci.value = '';
}

function delCom(cid) {
    const d = db_(); if (!d || !P) return;
    const id = P.tid, p = posts[id], c = coms[cid];
    if (!p || !c || !canDelCom(c, p)) return;
    d.ref(ROOT + '/comments/' + id + '/' + cid).remove().then(function () { bumpCn(id, -1); });
}

// 열 때 「마지막으로 본 때」를 붙잡아 둔다 (새 글 테두리용)
const _open = window.plazaBoardOpen;
window.plazaBoardOpen = function () {
    const s0 = getSeen();
    _open();
    if (P) { P.seen0 = s0; paint(); }
};

window.boardState = function () {
    console.log('[게시판] 글 ' + Object.keys(posts).length + '개 · 내가 볼 수 있는 글 ' + visible().length
        + '개 · 안 읽은 글 ' + unread() + '개');
};

console.log('[게시판] board — boardState()');

})();
