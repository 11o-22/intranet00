// ==========================================
// 🔒 가두리 — 상담사가 사원을 광장 · 백일몽 가두리에 가둔다 (2026-10-19)
// bundles.json 마지막 묶음, crayon.js 뒤
// ==========================================
//
// ■ 무엇인가
//   광장(plaza)과 백일몽 로비(dream)에 쇠창살 가두리가 하나씩 서 있다 (그림 plaza/gaduri.png).
//   상담사가 통제 콘솔 「가두리」 칸에서 광장 / 백일몽 을 고르고 사원을 고르면
//   그 사원은 광장에 있는 동안 그 가두리 안에서만 움직인다. 가두리마다 세 명까지.
//
//   걷기 · 방 옮기기를 막는 것은 plaza.js 의 「가두리」 (cageMine · cageHold · goRoom).
//   이 파일은 누가 어디 갇혔는지 적고 읽는 것과 상담사 칸을 맡는다.
//
// ■ 서버 자리
//   gaduri/<방>/<사번> = { at, by, name }          방은 plaza · dream
//
// ■ 콘솔
//   gaduriState()

(function gaduri() {

const ADMIN = 'kario0987';
const NODE = 'gaduri';
const MAX = 3;
const ROOMS = [ { k: 'plaza', n: '광장' }, { k: 'dream', n: '백일몽' } ];
const NAME = {}; ROOMS.forEach(function (r) { NAME[r.k] = r.n; });

let all = {};          // { plaza: { 사번: {...} }, dream: {...} }
let loaded = false;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

// 이 사원이 갇힌 방 — 없으면 ''
function roomOf(code) {
    if (!code) return '';
    for (let i = 0; i < ROOMS.length; i++) {
        const box = all[ROOMS[i].k];
        if (box && box[code]) return ROOMS[i].k;
    }
    return '';
}
window.gaduriOf = roomOf;
window.gaduriList = function () {
    const out = {};
    ROOMS.forEach(function (r) { out[r.k] = Object.keys(all[r.k] || {}); });
    return out;
};

// ==========================================
// 1. 듣기 — 모두가 듣는다 (작은 자리다)
// ==========================================
let mineWas = null;
(function listen() {
    const iv = setInterval(function () {
        const d = db_();
        if (!d) return;
        clearInterval(iv);
        d.ref(NODE).on('value', function (snap) {
            all = snap.val() || {};
            loaded = true;
            try { paintAdmin(); } catch (e) { }
        });
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 갇힌 사람에게 — 들어와서 처음 볼 때는 말없이, 그 뒤로 바뀌면 알린다
setInterval(function () {
    const me = u_();
    if (!me || !loaded) { if (!me) mineWas = null; return; }
    if (me.code === ADMIN) return;
    const now = roomOf(me.code);
    if (mineWas === null || mineWas.code !== me.code) { mineWas = { code: me.code, room: now }; return; }
    if (now === mineWas.room) return;
    const was = mineWas.room;
    mineWas.room = now;
    if (now) alert_('🔒 가두리\n\n상담사가 당신을 ' + NAME[now] + ' 가두리에 가뒀습니다.\n광장에 있는 동안 가두리 밖으로 나갈 수 없습니다.');
    else if (was) alert_('🔓 가두리\n\n' + NAME[was] + ' 가두리에서 풀려났습니다.');
}, 1000);

// ==========================================
// 2. 상담사 — 가둔다 · 풀어 준다
// ==========================================
window.gaduriPut = function (room, code) {
    const me = u_(), d = db_();
    if (!me || me.code !== ADMIN || !d) return;
    if (!NAME[room]) { alert_('가두리를 골라 주십시오.'); return; }
    const t = users()[code];
    if (!code || !t) { alert_('사원을 골라 주십시오.'); return; }
    if (code === ADMIN) { alert_('상담사는 가둘 수 없습니다.'); return; }
    const was = roomOf(code);
    if (was === room) { alert_(t.name + ' 사원은 이미 ' + NAME[room] + ' 가두리에 있습니다.'); return; }
    // 세 명까지 — 트랜잭션으로 센다 (둘이 동시에 넣어도 넘지 않게)
    d.ref(NODE + '/' + room).transaction(function (box) {
        box = box || {};
        if (box[code]) return box;
        if (Object.keys(box).length >= MAX) return;            // 찼다 — 그만둔다
        box[code] = { at: Date.now(), by: me.code, name: t.name || code };
        return box;
    }).then(function (res) {
        if (!res || !res.committed) { alert_(NAME[room] + ' 가두리가 찼습니다. (' + MAX + '명까지)'); return; }
        if (was) d.ref(NODE + '/' + was + '/' + code).remove();     // 다른 가두리에서 옮겨 왔다
        try {
            if (typeof addHistoryLog === 'function' && typeof updateUserFields === 'function') {
                addHistoryLog(t, '[가두리] ' + NAME[room] + ' 가두리에 갇혔습니다.');
                updateUserFields(code, { history: t.history });
            }
        } catch (e) { }
        alert_(t.name + ' 사원을 ' + NAME[room] + ' 가두리에 가뒀습니다.' + (was ? '\n(' + NAME[was] + ' 가두리에서 옮김)' : ''));
    }).catch(function (e) { alert_('적지 못했습니다.\n\n' + (e && e.message)); });
};
window.gaduriFree = function (code) {
    const me = u_(), d = db_();
    if (!me || me.code !== ADMIN || !d) return;
    const room = roomOf(code);
    if (!room) return;
    const t = users()[code];
    d.ref(NODE + '/' + room + '/' + code).remove().then(function () {
        try {
            if (t && typeof addHistoryLog === 'function' && typeof updateUserFields === 'function') {
                addHistoryLog(t, '[가두리] ' + NAME[room] + ' 가두리에서 풀려났습니다.');
                updateUserFields(code, { history: t.history });
            }
        } catch (e) { }
        alert_(((t && t.name) || code) + ' 사원을 풀어 줬습니다.');
    });
};

// 통제 콘솔 칸
function paintAdmin() {
    const box = document.getElementById('admin-gaduri-box');
    if (!box) return;
    const book = users();
    // 사원 고르기 — 상담사 빼고, 이름 차례
    const sel = box.querySelector('#gaduri-who');
    if (sel) {
        const was = sel.value;
        const list = Object.keys(book).filter(function (c) { return c !== ADMIN && book[c]; })
            .sort(function (a, b) { return String(book[a].name || a).localeCompare(String(book[b].name || b), 'ko'); });
        const html = '<option value="">-- 가둘 사원 --</option>' + list.map(function (c) {
            const r = roomOf(c);
            return '<option value="' + esc(c) + '">' + esc(book[c].name || c) + ' (사번: ' + esc(book[c].no || '') + ')' + (r ? ' · ' + NAME[r] + ' 가두리' : '') + '</option>';
        }).join('');
        if (sel._h !== html) { sel.innerHTML = html; sel._h = html; if (was) sel.value = was; }
    }
    const lst = box.querySelector('#gaduri-list');
    if (lst) {
        lst.innerHTML = ROOMS.map(function (r) {
            const codes = Object.keys(all[r.k] || {});
            return '<div style="margin-top:10px;">'
                + '<div style="font-size:11px; color:#cfc6dc; font-weight:bold; margin-bottom:5px;">' + r.n + ' 가두리 <span style="color:#888; font-weight:normal;">' + codes.length + ' / ' + MAX + '</span></div>'
                + (codes.length ? codes.map(function (c) {
                    const v = (all[r.k] || {})[c] || {};
                    const u = book[c];
                    return '<div style="display:flex; align-items:center; gap:8px; padding:7px 9px; margin-bottom:5px; border:1px solid #3a3446; border-radius:6px; background:rgba(255,255,255,.03);">'
                        + '<span style="font-size:12px; color:#fff;">' + esc((u && u.name) || v.name || c) + '</span>'
                        + '<span style="font-size:10px; color:#777;">' + esc((u && u.no) || '') + '</span>'
                        + '<button class="game-btn" style="margin:0 0 0 auto; padding:5px 10px; font-size:10px;" onclick="gaduriFree(\'' + esc(c) + '\')">풀어 준다</button></div>';
                }).join('') : '<div style="font-size:10px; color:#666;">비어 있습니다.</div>')
                + '</div>';
        }).join('');
    }
}
(function adminPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-gaduri-box')) return;
        const anchor = scr.querySelector('.action-buttons');
        const html = '<div class="admin-panel-box" id="admin-gaduri-box" style="border-color:#6a5f7a; background-color:#141218;">'
            + '<h4 style="color:#d9d4e0;">🔒 가두리</h4>'
            + '<div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.6;">'
            + '광장 · 백일몽 로비에 하나씩 서 있습니다. 가둔 사원은 광장에 있는 동안 그 가두리 안에서만 움직이고 다른 방으로 못 갑니다. 가두리마다 ' + MAX + '명까지.'
            + '</div>'
            + '<div style="display:flex; gap:6px; margin-bottom:7px;">'
            + '<select id="gaduri-room" style="flex:0 0 38%; min-width:0;">' + ROOMS.map(function (r) { return '<option value="' + r.k + '">' + r.n + ' 가두리</option>'; }).join('') + '</select>'
            + '<select id="gaduri-who" style="flex:1; min-width:0;"></select>'
            + '</div>'
            + '<button class="game-btn" style="width:100%; margin:0; padding:10px; background:linear-gradient(145deg,#5a4f6a,#3a3246) !important; border-color:#8a7fa0 !important; color:#fff !important;" '
            + 'onclick="gaduriPut(document.getElementById(\'gaduri-room\').value, document.getElementById(\'gaduri-who\').value)">가둔다</button>'
            + '<div id="gaduri-list"></div></div>';
        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
    }
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._gaduri) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); paintAdmin(); }, 180);
            return r;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._gaduri = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 사원이 늘거나 이름이 바뀌면 고르는 칸도 따라간다
setInterval(function () { try { const me = u_(); if (me && me.code === ADMIN) paintAdmin(); } catch (e) { } }, 4000);

window.gaduriState = function () {
    console.log('%c===== 🔒 가두리 =====', 'color:#d9d4e0; font-size:13px');
    ROOMS.forEach(function (r) {
        const codes = Object.keys(all[r.k] || {});
        console.log('  ' + r.n + ' (' + codes.length + '/' + MAX + ') :', codes.map(function (c) { return ((users()[c] || {}).name || c) + '(' + c + ')'; }).join(', ') || '없음');
    });
    const me = u_();
    if (me) console.log('  나 :', roomOf(me.code) ? NAME[roomOf(me.code)] + ' 가두리에 갇힘' : '갇히지 않음');
};

})();
