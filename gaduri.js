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
//   gaduri/<방>/<사번> = { at, by, name, auto?, until?, fed: { 던진사번: 횟수 } }   방은 plaza · dream
//                        by 'petbt' 는 ⚔ 펫 배틀 패배 (pet-battle.js · until 15분이 지나면 누구의 화면이든 치운다)
//                        by 'journey' 는 🐾 여정에서 펫 대신 맞은 주인 (journey.js · until 한 시간)
//   gaduriFood/<받는사번>/<번호> = { from, fromName, room, at }
//
// ■ 상담실 · 선녀탕 (2026-10-19)
//   격리 중인 사원은 제 화면이 스스로 광장 → 백일몽 차례로 빈 가두리에 들어간다 (auto).
//   둘 다 찼으면 밖에 둔다. 격리가 끝나면 스스로 나온다 (접속하지 않았으면 다른 사람의 화면이 치운다).
//   상담사가 가둔 사람은 그대로다.
//
// ■ 🍖 먹이 던지기
//   가두리 위 [먹이 던지기] (plaza.js) → 그 가두리에 갇힌 사원 고르기 → 개당 50,000 P.
//   던지는 사람마다 **하루 통틀어 두 번** (누구에게 던지든 · 자정에 새로 · users/<사번>/gdFeed). 갇힌 사람은 못 던진다.
//   받은 사원에게 「먹는다 / 안 먹는다」가 뜬다. 먹으면 격리(상담실 · 선녀탕) 시간이 15분 준다.
//   안 먹으면 버려진다 (포인트는 돌아가지 않는다).
//
// ■ 콘솔
//   gaduriState()
//   gaduriWhy()  · gaduriWhy('사번')   — 왜 갇혔나 (격리 까닭 · 오염도 · 최근 탐사 · 관련 기록)

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
// 갇힌 기록 그대로 — { room, at, by, until?, auto?, … } (없으면 null) · plaza.js 가 남은 시간을 적는 데 쓴다 (2026-10-30)
window.gaduriEntry = function (code) {
    const r = roomOf(code);
    if (!r) return null;
    return Object.assign({ room: r }, (all[r] || {})[code] || {});
};
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
})();
// ★ 단말을 껐다 켜도 갇혀 있게 (2026-10-19)
//   · 갇힌 사원이 들어와 있는데 광장이 안 열려 있으면 연다 (plaza.js 의 goRoom 이 가두리 방으로 보낸다)
//   · 갇힌 동안 광장은 닫히지 않는다 (plaza.js shut) — 단말 종료(logout)만 닫는다
(function keepIn() {
    setInterval(function () {
        const me = u_();
        if (!me || me.code === ADMIN || !loaded || !roomOf(me.code)) return;
        if (typeof darkRun !== 'undefined' && darkRun) return;              // 어둠 탐사 중에는 덮지 않는다 — 나오면 그때 연다
        if (document.getElementById('plaza-ov') || typeof window.plazaOpen !== 'function') return;
        const ms = document.getElementById('main-screen');
        if (!ms) return;
        try { window.plazaOpen(); } catch (e) { return; }
        try {
            const ov = document.getElementById('plaza-ov');
            if (ov && typeof window.plazaSolo === 'function' && window.plazaSolo()) ov.classList.add('plaza-base');
        } catch (e) { }
    }, 2000);
    const iv = setInterval(function () {
        if (typeof window.logout !== 'function' || window.logout._gaduri) { if (window.logout && window.logout._gaduri) clearInterval(iv); return; }
        const _l = window.logout;
        const w = function () {
            window._plazaForceShut = true;
            try { return _l.apply(this, arguments); }
            finally { window._plazaForceShut = false; }
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._gaduri = true;
        window.logout = w;
        try { logout = w; } catch (e) { }
    }, 700);
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
    const ent = now ? ((all[now] || {})[me.code] || {}) : {};
    const auto = ent.auto;
    // 🎐 여우 신도가 가뒀다 (무례하게 군 사람 · 서버가 적는다 · until 이 지나면 풀린다 — foxcult.js · api/_disaster)
    const fd = !auto && ent.by === 'foxd';
    const bt = !auto && ent.by === 'petbt';                              // ⚔ 펫 배틀에서 졌다 (pet-battle.js · until 이 지나면 풀린다)
    const jr = !auto && ent.by === 'journey';                            // 🐾 여정에서 펫 대신 맞았다 (journey.js · 한 시간)
    if (fd) {
        try { if (typeof addHistoryLog === 'function') { addHistoryLog(me, '[가두리] ' + (ent.byName || '🎐 여우 신도') + '가 당신을 ' + NAME[now] + ' 가두리에 가뒀습니다.' + (ent.why ? ' (' + ent.why + ')' : '')); if (typeof saveFields === 'function') saveFields({ history: 1 }); } } catch (e) { }
    }
    if (now) alert_('🔒 가두리\n\n' + (auto ? '격리되어 있는 동안 ' + NAME[now] + ' 가두리에 갇힙니다.'
            : bt ? '펫 배틀에서 져서 ' + NAME[now] + ' 가두리에 갇힙니다.' + (ent.until ? '\n(' + Math.max(1, Math.round((ent.until - Date.now()) / 60000)) + '분 뒤에 풀립니다)' : '')
            : jr ? '여정에서 펫 대신 맞아(또는 기권해), ' + NAME[now] + ' 가두리에서 쉽니다.' + (ent.until ? '\n(' + Math.max(1, Math.round((ent.until - Date.now()) / 60000)) + '분 뒤에 풀립니다)' : '') + '\n삼십분 동안은 어떠한 행위로도 가두리를 나올 수 없습니다.'
            : fd ? (ent.byName || '🎐 여우 신도') + '가 당신을 ' + NAME[now] + ' 가두리에 가뒀습니다.' + (ent.until ? '\n(' + Math.max(1, Math.round((ent.until - Date.now()) / 60000)) + '분 뒤에 풀립니다)' : '')
            : '상담사가 당신을 ' + NAME[now] + ' 가두리에 가뒀습니다.')
        + '\n광장에 있는 동안 가두리 밖으로 나갈 수 없습니다.');
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
                        + (v.auto ? '<span style="font-size:10px; color:#ff9f80;">격리 중 (저절로)</span>' : '')
                        + (v.by === 'foxd' ? '<span style="font-size:10px; color:#f0c987;">' + esc(v.byName || '🎐 여우 신도') + (v.until ? ' · ' + Math.max(0, Math.round((v.until - Date.now()) / 60000)) + '분' : '') + '</span>' : '')
                        + (v.by === 'petbt' ? '<span style="font-size:10px; color:#ffb74d;">⚔ 펫 배틀 패배' + (v.until ? ' · ' + Math.max(0, Math.round((v.until - Date.now()) / 60000)) + '분' : '') + '</span>' : '')
                        + (v.by === 'journey' ? '<span style="font-size:10px; color:#c9b8ff;">🐾 여정 — 펫 대신 맞음' + (v.until ? ' · ' + Math.max(0, Math.round((v.until - Date.now()) / 60000)) + '분' : '') + '</span>' : '')
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

// ==========================================
// 3. 상담실 · 선녀탕 — 스스로 가두리로
// ==========================================
function quar(u) { try { return !!(u && typeof isQuarantined === 'function' && isQuarantined(u)); } catch (e) { return false; } }
let autoTry = 0;
setInterval(function () {
    const me = u_(), d = db_();
    if (!me || !d || !loaded || me.code === ADMIN) return;
    const at = roomOf(me.code);
    const ent = at ? (all[at] || {})[me.code] : null;
    if (quar(me)) {
        if (at) {                                                       // 격리가 늘었으면 끝 시각을 따라간다
            if (ent && ent.auto && ent.until !== me.quarantineUntil) d.ref(NODE + '/' + at + '/' + me.code + '/until').set(me.quarantineUntil || 0);
            return;
        }
        if (Date.now() - autoTry < 30000) return;                       // 찼으면 한동안 다시 안 본다
        autoTry = Date.now();
        const put = function (i) {
            if (i >= ROOMS.length) return;                              // 둘 다 찼다 — 밖에 둔다
            const k = ROOMS[i].k;
            d.ref(NODE + '/' + k).transaction(function (box) {
                box = box || {};
                if (box[me.code]) return box;
                if (Object.keys(box).length >= MAX) return;
                box[me.code] = { at: Date.now(), by: 'auto', auto: true, until: me.quarantineUntil || 0, name: me.name || me.code };
                return box;
            }).then(function (res) { if (!res || !res.committed) put(i + 1); }).catch(function () { });
        };
        put(0);
    } else if (ent && ent.auto) {
        d.ref(NODE + '/' + at + '/' + me.code).remove();               // 격리가 끝났다
    }
}, 4000);
// 접속하지 않은 채 격리가 끝난 사람 — 누구의 화면이든 치운다
setInterval(function () {
    const d = db_();
    if (!d || !loaded) return;
    ROOMS.forEach(function (r) {
        Object.keys(all[r.k] || {}).forEach(function (c) {
            const v = all[r.k][c] || {};
            if ((v.by === 'foxd' || v.by === 'petbt' || v.by === 'journey') && Number(v.until) > 0 && Date.now() > Number(v.until)) { d.ref(NODE + '/' + r.k + '/' + c).remove(); return; }   // 🎐 여우 신도 · ⚔ 펫 배틀 · 🐾 여정이 정한 시간이 다 됐다
            if (!v.auto) return;
            const u = users()[c];
            const end = Math.max(Number(v.until) || 0, Number(u && u.quarantineUntil) || 0);
            if (end && Date.now() > end + 60000) d.ref(NODE + '/' + r.k + '/' + c).remove();
        });
    });
}, 20000);

// ==========================================
// 4. 🍖 먹이 던지기
// ==========================================
const FEED_PRICE = 50000, FEED_MAX = 2, FEED_CUT = 15 * 60 * 1000;
function today_() { try { return getTodayStr(); } catch (e) { return new Date().toDateString(); } }
// 오늘 던진 수 — 누구에게 던졌든 통틀어
function usedToday(me) { const g = me && me.gdFeed; return (g && g.day === today_()) ? (Number(g.n) || 0) : 0; }
function closeFeed() { const o = document.getElementById('gd-feed-ov'); if (o) o.remove(); }
window.gaduriFeedOpen = function (room) {
    const me = u_();
    if (!me || !NAME[room]) return;
    if (roomOf(me.code)) { alert_('가두리 안에서는 던질 수 없습니다.'); return; }
    const codes = Object.keys(all[room] || {}).filter(function (c) { return c !== me.code; });
    const left = FEED_MAX - usedToday(me);
    if (left <= 0) { alert_('오늘은 먹이를 다 던졌습니다. (하루 ' + FEED_MAX + '번)'); return; }
    closeFeed();
    const book = users();
    const rows = codes.length ? codes.map(function (c) {
        const u = book[c], v = (all[room] || {})[c] || {};
        const q = u && typeof isQuarantined === 'function' && isQuarantined(u);
        return '<button type="button" data-c="' + esc(c) + '"'
            + ' style="display:flex; align-items:center; gap:8px; width:100%; padding:11px 12px; margin-bottom:7px; border-radius:7px; cursor:pointer;'
            + ' background:#221e28; border:1px solid #4a4058; color:#eee; font-family:inherit; text-align:left;">'
            + '<span style="font-size:13px; font-weight:bold;">' + esc((u && u.name) || v.name || c) + '</span>'
            + (q ? '<span style="font-size:10px; color:#ff9f80;">격리 ' + Math.max(1, Math.ceil((u.quarantineUntil - Date.now()) / 60000)) + '분 남음</span>' : '')
            + '</button>';
    }).join('') : '<div style="font-size:12px; color:#888; text-align:center; padding:18px 0;">가두리에 아무도 없습니다.</div>';
    const ov = document.createElement('div');
    ov.id = 'gd-feed-ov';
    ov.style.cssText = 'position:fixed; inset:0; z-index:100060; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.72); padding:16px;';
    ov.innerHTML = '<div style="width:100%; max-width:340px; background:#17151c; border:1px solid #4a4058; border-radius:10px; padding:16px 14px 14px; color:#ddd;">'
        + '<div style="font-size:14px; font-weight:bold; text-align:center; margin-bottom:6px;">🍖 먹이 던지기 — ' + NAME[room] + ' 가두리</div>'
        + '<div style="font-size:11px; color:#999; text-align:center; line-height:1.7; margin-bottom:12px;">개당 ' + FEED_PRICE.toLocaleString('ko-KR') + ' P · 하루 ' + FEED_MAX + '번 (오늘 남은 ' + left + '번)<br>받은 사원이 먹으면 격리 시간이 15분 줍니다.</div>'
        + rows
        + '<button type="button" id="gd-feed-no" style="width:100%; margin-top:4px; padding:10px; border-radius:6px; background:#2a2730; color:#bbb; border:1px solid #444; font-family:inherit; cursor:pointer;">그만둔다</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#gd-feed-no').onclick = closeFeed;
    ov.addEventListener('click', function (e) { if (e.target === ov) closeFeed(); });
    ov.querySelectorAll('button[data-c]').forEach(function (b) {
        b.onclick = function () { closeFeed(); throwFood(room, b.getAttribute('data-c')); };
    });
};
let throwing = false;
function throwFood(room, target) {
    const me = u_(), d = db_();
    if (!me || !d || throwing) return;
    const t = users()[target];
    if (roomOf(target) !== room) { alert_('그 사이 가두리에서 나갔습니다.'); return; }
    if (usedToday(me) >= FEED_MAX) { alert_('오늘은 먹이를 다 던졌습니다. (하루 ' + FEED_MAX + '번)'); return; }
    if ((Number(me.points) || 0) < FEED_PRICE) { if (typeof showLuxuryAlert === 'function') showLuxuryAlert(); else alert_('포인트가 모자랍니다.'); return; }
    throwing = true;
    // 하루 두 번 — 내 기록에서 트랜잭션으로 센다 (두 창에서 눌러도 넘지 않게)
    d.ref('users/' + me.code + '/gdFeed').transaction(function (g) {
        const day = today_();
        if (!g || g.day !== day) g = { day: day, n: 0 };
        if ((Number(g.n) || 0) >= FEED_MAX) return;
        g.n = (Number(g.n) || 0) + 1;
        return g;
    }).then(function (res) {
        throwing = false;
        if (!res || !res.committed) { alert_('오늘은 먹이를 다 던졌습니다. (하루 ' + FEED_MAX + '번)'); return; }
        try { me.gdFeed = res.snapshot.val(); } catch (e) { }
        try { changePoints(-FEED_PRICE); } catch (e) { me.points = (Number(me.points) || 0) - FEED_PRICE; try { saveFields({ points: 1 }); } catch (x) { } }
        d.ref('gaduriFood/' + target).push({ from: me.code, fromName: me.name || me.code, room: room, at: Date.now() });
        try { addHistoryLog(me, '[먹이 던지기] ' + ((t && t.name) || target) + ' 사원에게 (-' + FEED_PRICE.toLocaleString('ko-KR') + ' P)'); saveFields({ history: 1 }); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_('🍖 ' + ((t && t.name) || target) + ' 사원에게 먹이를 던졌습니다.\n(-' + FEED_PRICE.toLocaleString('ko-KR') + ' P · 오늘 남은 ' + (FEED_MAX - usedToday(me)) + '번)');
    }).catch(function (e) { throwing = false; alert_('던지지 못했습니다.\n\n' + (e && e.message)); });
}
// 받는 쪽 — 하나씩 묻는다
let foodRef = null, foodFor = '', asking = '';
setInterval(function () {
    const me = u_(), d = db_();
    if (!me || !d) return;
    if (foodFor === me.code) return;
    if (foodRef) { try { foodRef.off(); } catch (e) { } }
    foodFor = me.code;
    foodRef = d.ref('gaduriFood/' + me.code);
    foodRef.on('value', function (snap) {
        const v = snap.val() || {};
        const keys = Object.keys(v).sort();
        if (!keys.length || asking) return;
        askFood(keys[0], v[keys[0]] || {});
    });
}, 1500);
function askFood(key, f) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    asking = key;
    const old = document.getElementById('gd-eat-ov'); if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'gd-eat-ov';
    ov.style.cssText = 'position:fixed; inset:0; z-index:100070; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.72); padding:16px;';
    ov.innerHTML = '<div style="width:100%; max-width:320px; background:#17151c; border:1px solid #6a5a3a; border-radius:10px; padding:18px 14px 14px; color:#ddd; text-align:center;">'
        + '<div style="font-size:30px; margin-bottom:6px;">🍖</div>'
        + '<div style="font-size:13px; line-height:1.8; margin-bottom:14px;"><b style="color:#ffcf8f;">' + esc(f.fromName || '누군가') + '</b> 사원이<br>가두리 안으로 먹이를 던졌습니다.<br>'
        + '<span style="font-size:11px; color:#999;">먹으면 격리 시간이 15분 줍니다.</span></div>'
        + '<div style="display:flex; gap:8px;"><button type="button" id="gd-eat-no" style="flex:1; padding:11px; border-radius:6px; background:#2a2730; color:#bbb; border:1px solid #444; font-family:inherit; cursor:pointer;">안 먹는다</button>'
        + '<button type="button" id="gd-eat-yes" style="flex:1; padding:11px; border-radius:6px; background:linear-gradient(145deg,#a0642a,#6a3e14); color:#fff; border:1px solid #d49a5a; font-weight:bold; font-family:inherit; cursor:pointer;">먹는다</button></div></div>';
    document.body.appendChild(ov);
    const done = function (eat) {
        ov.remove();
        d.ref('gaduriFood/' + me.code + '/' + key).remove().then(function () { asking = ''; foodFor = ''; });   // 다음 것을 다시 묻게
        if (eat) {
            const q = (typeof isQuarantined === 'function') && isQuarantined(me);
            if (q) me.quarantineUntil = Math.max(Date.now(), Number(me.quarantineUntil) - FEED_CUT);
            try { addHistoryLog(me, '[먹이] ' + (f.fromName || '누군가') + ' 사원이 던진 먹이를 먹었습니다.' + (q ? ' (격리 15분 줄어듦)' : '')); } catch (e) { }
            try { saveFields(q ? { quarantineUntil: 1, history: 1 } : { history: 1 }); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            if (q) alert_('먹이를 먹었습니다.\n\n격리 시간이 15분 줄었습니다.');
        } else {
            try { addHistoryLog(me, '[먹이] ' + (f.fromName || '누군가') + ' 사원이 던진 먹이를 먹지 않았습니다.'); saveFields({ history: 1 }); } catch (e) { }
        }
    };
    ov.querySelector('#gd-eat-yes').onclick = function () { done(true); };
    ov.querySelector('#gd-eat-no').onclick = function () { done(false); };
}

window.gaduriState = function () {
    console.log('%c===== 🔒 가두리 =====', 'color:#d9d4e0; font-size:13px');
    ROOMS.forEach(function (r) {
        const codes = Object.keys(all[r.k] || {});
        console.log('  ' + r.n + ' (' + codes.length + '/' + MAX + ') :', codes.map(function (c) { return ((users()[c] || {}).name || c) + '(' + c + ')'; }).join(', ') || '없음');
    });
    const me = u_();
    if (me) console.log('  나 :', roomOf(me.code) ? NAME[roomOf(me.code)] + ' 가두리에 갇힘' : '갇히지 않음');
};

// 왜 갇혔나 — 갇힌 사람마다 격리 까닭 · 오염도 · 마지막 탐사 · 최근 기록 (2026-10-26)
//   입원(사망 이송)인지 · 오염 100 상담인지 · 격리가 이미 끝났는데 남은 자리인지 가린다
window.gaduriWhy = function (code) {
    const mins = function (t) { t = Number(t) || 0; return t > Date.now() ? Math.ceil((t - Date.now()) / 60000) + '분 남음' : (t ? '끝남' : '없음'); };
    const KEY = /어둠|이송|상담실|선녀탕|격리|쓰러|사망|의식|오염|구출|불러|살렸|사직|가두리/;
    const out = [];
    ROOMS.forEach(function (r) {
        Object.keys(all[r.k] || {}).forEach(function (c) {
            if (code && c !== code) return;
            const v = all[r.k][c] || {}, u = users()[c] || {};
            const q = Number(u.quarantineUntil) || 0;
            const why = !q || q <= Date.now() ? '격리 끝남 — 자리만 남음'
                : u.quarantineHospital ? '입원 (어둠에서 쓰러져 이송)'
                : '상담 (오염 100 · 방치 등)';
            const lg = (Array.isArray(u.darkLogs) ? u.darkLogs : []).slice(0, 3).map(function (l) {
                return (l.date || '') + ' ' + (l.zone || '') + ' ' + (l.died ? '✖ 사망' : '✔ 귀환 +' + (l.reward || 0) + 'P');
            });
            const hs = (Array.isArray(u.history) ? u.history : []).map(function (h) {
                return typeof h === 'string' ? h : ((h.time ? h.time + ' ' : '') + (h.text || ''));
            }).filter(function (t) { return KEY.test(t); }).slice(0, 6);
            out.push({ c: c, n: u.name || v.name || c, room: r.n, v: v, u: u, q: q, why: why, lg: lg, hs: hs });
        });
    });
    console.log('%c===== 🔒 가두리 — 왜 갇혔나 (' + out.length + '명) =====', 'color:#d9d4e0; font-size:13px');
    out.forEach(function (o) {
        console.log('%c■ ' + o.n + ' (' + o.c + ') — ' + o.room + ' 가두리 · ' + (o.v.auto ? '격리 중 (저절로)' : o.v.by === 'foxd' ? '여우 신도' : o.v.by === 'petbt' ? '펫 배틀 패배' : o.v.by === 'journey' ? '여정 — 펫 대신 맞음' : '상담사'), 'color:#ffcc80; font-weight:bold');
        console.log('   까닭 : ' + o.why + ' · 격리 ' + mins(o.q) + ' · 자리 끝 ' + mins(o.v.until));
        console.log('   오염도 ' + (o.u.pollution == null ? '?' : o.u.pollution) + '% · 퇴원 시 ' + (o.u.quarantineExitPollution || 0) + '% · 행선 ' + (o.u.quarantineDest || '-') + ' · 들어간 때 ' + (o.v.at ? new Date(o.v.at).toLocaleString() : '?'));
        console.log('   최근 탐사 : ' + (o.lg.length ? '\n     ' + o.lg.join('\n     ') : '없음'));
        console.log('   관련 기록 : ' + (o.hs.length ? '\n     ' + o.hs.join('\n     ') : '없음'));
    });
    if (!out.length) console.log('  갇힌 사람이 없습니다.');
    return out.length;
};

})();
