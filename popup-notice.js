// ==========================================
// ★ 📢 팝업 알림권 — 상담사 지급 전용 (2026-10-21)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
// ■ 무엇인가
//
//   소모품이다. 소지품에서 [사용] 을 누르면 창이 뜨고, 문구를 적고 색을 골라
//   [띄우기] 를 누르면 **전체 사원**의 화면에 팝업으로 뜬다. 한 장에 한 번.
//   상점 · 우주 쇼핑몰 · 장터 어디에도 안 깔리고 팔 수도 없다.
//   주는 법은 noticeGive(사번, 장 수) 와 당국 화면의 「물품 강제 꽂기」뿐이다.
//
// ■ 색 — 열 가지. 바탕과 글씨를 짝으로 박아 두어 글씨가 묻히지 않는다
//
// ■ 적히는 자리
//
//   popupNotices/<열쇠> = { by, byName, text, c(색 번호), at }
//     받는 쪽은 최근 20개를 듣고, 1시간 안에 띄운 것 가운데 아직 안 본 것을 차례로 띄운다
//     (자리에 없던 사람도 1시간 안에 들어오면 본다). 본 것은 이 기기에 적어 둔다 (localStorage).
//     하루가 지난 것은 아무 화면이나 지운다.
//
// ■ 콘솔
//   noticeGive(사번, n)   상담사가 n 장 준다 (1~10)

const PNOTE = {
    NAME: '📢 팝업 알림권',
    ADMIN: 'kario0987',
    MAX: 200,                        // 글자 수
    SHOW_MS: 60 * 60 * 1000,         // 이만큼 지난 것은 새로 들어온 사람에게 안 띄운다
    KEEP_MS: 24 * 60 * 60 * 1000,    // 이만큼 지난 것은 지운다
    NODE: 'popupNotices',
    // 바탕 · 글씨 · 테두리 — 글씨가 묻히지 않게 짝을 박아 둔다
    COLORS: [
        { n: '먹',   bg: '#17171c', fg: '#f7f7f7', bd: '#5a5a66' },
        { n: '백',   bg: '#ffffff', fg: '#1a1a1a', bd: '#bdbdbd' },
        { n: '홍',   bg: '#b3261e', fg: '#ffffff', bd: '#ff8a80' },
        { n: '주황', bg: '#f08a24', fg: '#1f1300', bd: '#ffd0a0' },
        { n: '노랑', bg: '#ffd54f', fg: '#2b2100', bd: '#fff3b0' },
        { n: '초록', bg: '#2e7d32', fg: '#ffffff', bd: '#a5d6a7' },
        { n: '하늘', bg: '#8fd8f8', fg: '#0b2533', bd: '#e1f5fe' },
        { n: '파랑', bg: '#1e40af', fg: '#ffffff', bd: '#93c5fd' },
        { n: '보라', bg: '#6a1b9a', fg: '#ffffff', bd: '#ce93d8' },
        { n: '분홍', bg: '#f8bbd0', fg: '#3d0a1d', bd: '#fce4ec' }
    ]
};

(function popupNotice() {

const NAME = PNOTE.NAME;
const ADMIN = PNOTE.ADMIN;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(function (u) { return u && u.name; });
}
function find(who) {
    return users().filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
function colorOf(i) { return PNOTE.COLORS[Math.max(0, Math.min(PNOTE.COLORS.length - 1, Number(i) || 0))]; }

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'popup_notice', noSell: true,
            desc: '문구를 적어 띄우면 전체 사원의 화면에 팝업으로 뜬다. 색은 열 가지 중에서 고른다. 한 장에 한 번.'
        };
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME); } catch (e) { }
        console.log('[알림권] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();
setInterval(function () {
    try {
        if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
        let i;
        while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
        if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
    } catch (e) { }
}, 5000);
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._pnote) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._pnote = true;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 쓰는 쪽 — 문구 · 색 · 띄우기
// ==========================================
let pick = 0;
function shut() { const w = document.getElementById('pnote-write'); if (w) w.remove(); }
window.pnoteShut = shut;
function write() {
    const u = me();
    if (!u) return;
    if ((u.inventory || []).indexOf(NAME) < 0) { alert_('가지고 있지 않습니다.'); return; }
    shut();
    const w = document.createElement('div');
    w.id = 'pnote-write';
    w.style.cssText = 'position:fixed; inset:0; z-index:100003; display:flex; align-items:center; justify-content:center;'
        + ' background:rgba(0,0,0,0.78); padding:16px;';
    const sw = PNOTE.COLORS.map(function (c, i) {
        return '<button type="button" data-pc="' + i + '" title="' + c.n + '" style="width:30px; height:30px; margin:0 6px 6px 0; border-radius:50%;'
            + ' border:2px solid ' + c.bd + '; background:' + c.bg + '; color:' + c.fg + '; font-size:10px; font-weight:bold; cursor:pointer; padding:0;">가</button>';
    }).join('');
    w.innerHTML = '<div style="background:#14161a; border:1px solid #3a3f4a; border-radius:14px; padding:15px; max-width:400px; width:100%;'
        + ' max-height:88vh; overflow-y:auto; color:#e8e8e8;">'
        + '<div style="font-size:14px; font-weight:bold; color:#ffd479; margin-bottom:8px;">📢 팝업 알림권</div>'
        + '<div style="font-size:11px; color:#9aa; margin-bottom:8px; line-height:1.6;">적은 문구가 <b style="color:#fff;">전체 사원</b>의 화면에 팝업으로 뜹니다. 한 장을 씁니다.</div>'
        + '<textarea id="pnote-text" maxlength="' + PNOTE.MAX + '" placeholder="띄울 문구" style="width:100%; box-sizing:border-box; min-height:90px;'
        + ' padding:10px; border-radius:8px; border:1px solid #3a3f4a; background:#0d0f12; color:#f2f2f2; font-size:13px; font-family:inherit; resize:vertical;"></textarea>'
        + '<div style="font-size:10px; color:#778; text-align:right; margin:3px 0 8px;"><span id="pnote-n">0</span> / ' + PNOTE.MAX + '</div>'
        + '<div style="font-size:11px; color:#9aa; margin-bottom:6px;">색</div>'
        + '<div id="pnote-sw" style="display:flex; flex-wrap:wrap;">' + sw + '</div>'
        + '<div style="font-size:11px; color:#9aa; margin:8px 0 6px;">미리 보기</div>'
        + '<div id="pnote-prev"></div>'
        + '<div style="display:flex; gap:8px; margin-top:12px;">'
        + '<button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:12px;" onclick="pnoteShut()">취소</button>'
        + '<button class="game-btn" id="pnote-go" style="flex:1; margin:0; padding:11px; font-size:12px; background:linear-gradient(145deg,#6a4c10,#2e2004) !important;'
        + ' border-color:#d4a84a !important; color:#ffe6a8 !important;">띄우기</button></div></div>';
    document.body.appendChild(w);
    const ta = w.querySelector('#pnote-text');
    const paint = function () {
        w.querySelector('#pnote-n').textContent = String((ta.value || '').length);
        Array.prototype.forEach.call(w.querySelectorAll('[data-pc]'), function (b) {
            b.style.outline = Number(b.getAttribute('data-pc')) === pick ? '3px solid #ffd479' : 'none';
            b.style.outlineOffset = '2px';
        });
        w.querySelector('#pnote-prev').innerHTML = card({ byName: u.name || '', text: ta.value || '띄울 문구', c: pick }, true);
    };
    ta.addEventListener('input', paint);
    Array.prototype.forEach.call(w.querySelectorAll('[data-pc]'), function (b) {
        b.onclick = function () { pick = Number(b.getAttribute('data-pc')) || 0; paint(); };
    });
    w.querySelector('#pnote-go').onclick = function () { send(ta.value); };
    paint();
    setTimeout(function () { try { ta.focus(); } catch (e) { } }, 50);
}
let sending = false;
function send(raw) {
    const u = me(), d = db_();
    if (!u || sending) return;
    const text = String(raw || '').replace(/\r/g, '').trim().slice(0, PNOTE.MAX);
    if (!text) { alert_('띄울 문구를 적어 주세요.'); return; }
    if ((u.inventory || []).indexOf(NAME) < 0) { alert_('가지고 있지 않습니다.'); shut(); return; }
    if (!d) { alert_('연결이 끊겨 띄울 수 없습니다.'); return; }
    sending = true;
    const row = { by: u.code, byName: String(u.name || ''), text: text, c: pick, at: Date.now() };
    // push() 로 열쇠만 받고 set 으로 쓴다 — 쓰기가 끝난 것을 확인하고 나서 한 장을 뗀다
    let key = '';
    try { key = d.ref(PNOTE.NODE).push().key; } catch (e) { }
    if (!key) key = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    Promise.resolve(d.ref(PNOTE.NODE + '/' + key).set(row)).then(function () {
        sending = false;
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, NAME, 1);
        else { const i = u.inventory.indexOf(NAME); if (i > -1) u.inventory.splice(i, 1); }
        log_(u, '[' + NAME + '] 전체 사원에게 팝업을 띄웠습니다 — 「' + text.slice(0, 40) + (text.length > 40 ? '…' : '') + '」');
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        shut();
    }).catch(function () { sending = false; alert_('띄우지 못했습니다. 잠시 뒤 다시 해 주세요.'); });
}
(function useHook() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._pnote) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'popup_notice') return _u.apply(this, arguments);
            write();
        };
        useInventoryItem._pnote = true;
        window.useInventoryItem = useInventoryItem;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 받는 쪽 — 팝업
// ==========================================
function card(v, small) {
    const c = colorOf(v.c);
    return '<div style="background:' + c.bg + '; color:' + c.fg + '; border:2px solid ' + c.bd + '; border-radius:14px;'
        + ' padding:' + (small ? '12px 13px' : '18px 18px 14px') + '; box-shadow:0 10px 36px rgba(0,0,0,0.5); text-align:left;">'
        + '<div style="font-size:' + (small ? '10px' : '11px') + '; font-weight:bold; letter-spacing:1px; opacity:0.85; margin-bottom:8px;">📢 '
        + esc(v.byName || '사원') + ' 사원의 알림</div>'
        + '<div style="font-size:' + (small ? '13px' : '15px') + '; line-height:1.75; white-space:pre-wrap; word-break:break-word;">' + esc(v.text) + '</div></div>';
}
const SEEN_K = 'pnoteSeen';
function seenGet() { try { return JSON.parse(localStorage.getItem(SEEN_K) || '{}') || {}; } catch (e) { return {}; } }
function seenPut(id) {
    try {
        const s = seenGet(); s[id] = Date.now();
        Object.keys(s).forEach(function (k) { if (Date.now() - s[k] > PNOTE.KEEP_MS * 2) delete s[k]; });
        localStorage.setItem(SEEN_K, JSON.stringify(s));
    } catch (e) { }
}
const seenMem = {};           // 저장이 막힌 기기에서도 한 화면에서 두 번 안 띄운다
const queue = [];
function showNext() {
    if (document.getElementById('pnote-pop') || !queue.length) return;
    const it = queue.shift();
    const w = document.createElement('div');
    w.id = 'pnote-pop';
    w.style.cssText = 'position:fixed; inset:0; z-index:99999980; display:flex; flex-direction:column; align-items:center; justify-content:center;'
        + ' background:rgba(0,0,0,0.62); padding:18px;';
    w.innerHTML = '<div style="max-width:420px; width:100%;">' + card(it.v, false)
        + '<button class="game-btn" style="width:100%; margin:12px 0 0 0; padding:11px; font-size:13px;">확인</button></div>';
    w.querySelector('button').onclick = function () { w.remove(); setTimeout(showNext, 150); };
    document.body.appendChild(w);
}
window.pnoteShow = function (v) { queue.push({ id: 'test', v: v }); showNext(); };
let ref = null, refCode = '';
function onRow(snap) {
    const id = snap.key, v = snap.val();
    if (!v || !v.text) return;
    const age = Date.now() - (Number(v.at) || 0);
    if (age > PNOTE.KEEP_MS) { try { db_().ref(PNOTE.NODE + '/' + id).remove(); } catch (e) { } return; }
    if (age > PNOTE.SHOW_MS) return;
    if (seenMem[id] || seenGet()[id]) return;
    seenMem[id] = 1;
    seenPut(id);
    queue.push({ id: id, v: v });
    showNext();
}
setInterval(function () {
    const u = me(), d = db_();
    if (!u || !d) return;
    if (ref && refCode === u.code) return;
    try { if (ref) ref.off(); } catch (e) { }
    refCode = u.code;
    ref = d.ref(PNOTE.NODE).limitToLast(20);
    ref.on('child_added', onRow);
}, 1500);

// ==========================================
// 상담사
// ==========================================
window.noticeGive = function (who, n) {
    const a = me();
    if (!a || a.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(10, n || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '장 지급');
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '장을 줬습니다.', 'color:#4CAF50');
};

})();
