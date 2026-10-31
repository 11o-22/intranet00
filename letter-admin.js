// ==========================================
// ★ 익명 편지 — 상담사 열람 (2026-11-01 사용자)
// bundles.json — letter-sent.js 바로 뒤
// ==========================================
//
// ■ 무엇을
//
//   「상담사는 다른 사람이 익명편지 보내는 거 볼 수 있게」
//   「받은 사람이 삭제하지 않았으면 남아 있는 것들도 볼 수 있게」
//
//   상담사(kario0987)의 익명 편지 칸 맨 아래에 「모든 익명 편지」 칸을 둔다.
//   누가 누구에게 언제 무엇을 보냈는지 새것부터 늘어놓는다.
//
// ■ 어디서 모으나
//
//   ① letterLog/<번호>   — 이제부터 보내는 편지는 보내는 그 자리에서 여기에 한 장씩 적는다
//                          (letter-sent.js 가 「정말 나갔다」를 가린 뒤 부른다 — WINDOW.letterLogPut)
//   ② 받은 사람의 편지함(letters) · 보관함(keptLetters) — 받은 사람이 지우지 않은 것
//   ③ 보낸 사람의 「보낸 편지」(sentLetters) — 보낸 사람이 지우지 않은 것
//
//   같은 편지가 여러 곳에 있으면 한 장으로 합친다 (보낸 사람 · 받은 사람 · 글이 같고 5분 안).
//   받은 쪽에 지금 남아 있는지도 적는다 — 편지함 · 보관함 · 없음(지웠거나 여덟 장이 넘어 밀려남).
//
//   받는 사람 기록에는 아무것도 더 넣지 않는다 — 다른 사원에게는 여전히 익명이다.
//
// ■ 콘솔
//   allLetters()   상담사만 — 모은 편지를 표로

(function letterAdmin() {

const ADMIN = 'kario0987';
const BOX = 'admin-letters-box';
const SHOW = 60;                 // 처음에 보이는 장수 (더 보기로 늘린다)
const LOG_READ = 500;            // letterLog 에서 읽는 끝

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdmin() { const u = me(); return !!(u && u.code === ADMIN); }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function arr(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; }).filter(Boolean);
    return [];
}
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function who(code) {
    const u = users()[code];
    return u ? { name: u.name || '?', no: u.no || '' } : { name: '?', no: '' };
}
function fmt(t) {
    try {
        const d = new Date(Number(t));
        if (isNaN(d.getTime())) return '';
        const p = function (n) { return (n < 10 ? '0' : '') + n; };
        return d.getFullYear() + '.' + p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return ''; }
}

// ==========================================
// ① 보낼 때 적는다 — letter-sent.js 가 부른다
// ==========================================
window.letterLogPut = function (toCode, text) {
    const u = me(), d = db_();
    if (!u || !d || !toCode || !text) return;
    const t = who(toCode);
    try {
        d.ref('letterLog').push({
            at: Date.now(), fromCode: u.code, fromName: u.name || '', fromNo: u.no || '',
            toCode: toCode, toName: t.name, toNo: t.no, content: String(text)
        });
    } catch (e) { console.warn('[편지 열람] 적기', e); }
};

// ==========================================
// 모으기
// ==========================================
let logCache = [], logAt = 0, logBusy = false;
function loadLog(force) {
    const d = db_();
    if (!d || logBusy) return;
    if (!force && Date.now() - logAt < 20000) return;
    logBusy = true;
    let ref = d.ref('letterLog');
    try { if (ref.limitToLast) ref = ref.limitToLast(LOG_READ); } catch (e) { }
    ref.once('value').then(function (s) {
        logCache = arr(s.val());
        logAt = Date.now();
        logBusy = false;
        paint();
    }).catch(function () { logBusy = false; });
}

function collect() {
    const out = [];
    const add = function (o) {
        if (!o.content) return;
        // 같은 편지 — 보낸 사람 · 받은 사람 · 글이 같고 5분 안
        for (let i = 0; i < out.length; i++) {
            const x = out[i];
            if (x.from === o.from && x.to === o.to && x.content === o.content && Math.abs((x.at || 0) - (o.at || 0)) < 5 * 60000) {
                if (o.where) x.where = o.where;
                if (!x.at && o.at) x.at = o.at;
                return;
            }
        }
        out.push(o);
    };
    const U = users();
    // ② 받은 쪽에 남은 것 — 편지함 · 보관함
    Object.keys(U).forEach(function (code) {
        const u = U[code]; if (!u) return;
        arr(u.letters).forEach(function (l) {
            add({ at: Number(l.id) || 0, date: l.date, from: l.fromCode || '', fromName: l.fromName, to: code, content: l.content, where: '편지함' });
        });
        arr(u.keptLetters).forEach(function (l) {
            add({ at: Number(l.id) || 0, date: l.date, from: l.fromCode || '', fromName: l.fromName, to: code, content: l.content, where: '보관함' });
        });
    });
    // ① 보낼 때 적은 것
    logCache.forEach(function (l) {
        add({ at: Number(l.at) || 0, from: l.fromCode || '', fromName: l.fromName, to: l.toCode || '', toName: l.toName, content: l.content, where: '' });
    });
    // ③ 보낸 쪽에 남은 것
    Object.keys(U).forEach(function (code) {
        const u = U[code]; if (!u) return;
        arr(u.sentLetters).forEach(function (l) {
            add({ at: Number(l.id) || 0, date: l.date, from: code, fromName: u.name, to: l.toCode || '', toName: l.toName, content: l.content, where: '' });
        });
    });
    out.sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    return out;
}

// ==========================================
// 그리기 — 익명 편지 칸 맨 아래 (보관함 · 보낸 편지 다음)
// ==========================================
let open = true, more = 0, lastSig = '';
window.toggleAdminLetters = function () { open = !open; lastSig = ''; paint(); };
window.moreAdminLetters = function () { more += SHOW; lastSig = ''; paint(); };
window.reloadAdminLetters = function () { lastSig = ''; loadLog(true); paint(); };

function mount() {
    if (document.getElementById(BOX)) return true;
    const panel = document.getElementById('rec-letters');
    if (!panel) return false;
    panel.insertAdjacentHTML('beforeend',
        '<div style="margin-top:14px; border-top:1px dashed #5a3a1a; padding-top:12px;">'
        + '<div id="' + BOX + '"></div></div>');
    return true;
}

function paint() {
    if (!isAdmin()) return;
    if (!mount()) return;
    const box = document.getElementById(BOX);
    if (!box) return;
    const list = collect();
    const n = SHOW + more;
    const sig = (open ? 1 : 0) + '|' + n + '|' + list.length + '|' + (list[0] ? list[0].at + list[0].where : '')
        + '|' + list.slice(0, n).map(function (x) { return x.where ? x.where.charAt(0) : '-'; }).join('');
    if (sig === lastSig && box.innerHTML) return;
    lastSig = sig;

    let h = '<div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;'
        + ' padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);'
        + ' border:1px solid var(--theme-border); border-left:3px solid #ff9800; margin-bottom:8px;"'
        + ' onclick="toggleAdminLetters()">'
        + '<span style="font-size:12px; color:#ffb74d; font-weight:bold;">🔍 모든 익명 편지'
        + '<span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">' + list.length + '장 · 상담사 열람</span></span>'
        + '<span style="font-size:10px; color:#888;">' + (open ? '▼' : '▲') + '</span></div>';
    if (open) {
        h += '<div style="font-size:10px; color:#777; line-height:1.6; margin:-2px 0 8px 2px;">'
            + '받은 사람이 지우지 않은 편지와, 이제부터 보내는 편지가 모두 보입니다. 다른 사원에게는 그대로 익명입니다.'
            + ' <a href="javascript:void(0)" onclick="reloadAdminLetters()" style="color:#ffb74d;">새로 읽기</a></div>';
        if (!list.length) h += '<div style="font-size:11px; color:#666; padding:10px 0; text-align:center;">편지가 없습니다.</div>';
        list.slice(0, n).forEach(function (l) {
            const f = who(l.from), t = who(l.to);
            const fName = (f.name !== '?' ? f.name : (l.fromName || '알 수 없음'));
            const tName = (t.name !== '?' ? t.name : (l.toName || '알 수 없음'));
            const tag = l.where === '편지함' ? '<span style="color:#7fe0a0;">받은 편지함에 있음</span>'
                : l.where === '보관함' ? '<span style="color:#9fd8ef;">받은 사람 보관함에 있음</span>'
                : '<span style="color:#888;">받은 쪽에 없음 (지웠거나 밀려남)</span>';
            h += '<div class="letter-card" style="border-left:3px solid #a0682a;">'
                + '<div class="letter-meta">' + esc(l.at ? fmt(l.at) : (l.date || ''))
                + ' · <b style="color:#ffcc80;">' + esc(fName) + '</b>' + (f.no ? ' <span style="color:#777;">(NO.' + esc(f.no) + ')</span>' : '')
                + ' → <b style="color:#ffcc80;">' + esc(tName) + '</b>' + (t.no ? ' <span style="color:#777;">(NO.' + esc(t.no) + ')</span>' : '')
                + '<br><span style="font-size:10px;">' + tag + '</span></div>'
                + '<div class="letter-body">' + esc(l.content) + '</div></div>';
        });
        if (list.length > n) {
            h += '<button onclick="moreAdminLetters()" style="width:100%; margin-top:4px; padding:8px; font-size:11px;'
                + ' background:rgba(0,0,0,0.3); border:1px solid #5a3a1a; color:#ffb74d; border-radius:5px; cursor:pointer;">'
                + '더 보기 (' + (list.length - n) + '장 남음)</button>';
        }
    }
    box.innerHTML = h;
}

// renderLetters 바깥에서 한 번 더 그린다 (letter-sent.js 의 「보낸 편지」 다음)
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderLetters !== 'function' || !renderLetters._sent) return;
        if (renderLetters._adminLetters) { clearInterval(iv); return; }
        const _r = renderLetters;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { if (isAdmin()) { loadLog(false); paint(); } } catch (e) { console.warn('[편지 열람]', e); }
            return out;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._adminLetters = true;
        renderLetters = w;
        window.renderLetters = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 45000);
})();

// 편지 칸이 열려 있는 동안 — 남이 보낸 편지가 들어오면 고친다 (바뀐 게 없으면 손대지 않는다)
setInterval(function () {
    try {
        if (!isAdmin()) return;
        const panel = document.getElementById('rec-letters');
        if (!panel || panel.offsetParent === null) return;
        loadLog(false);
        paint();
    } catch (e) { }
}, 3000);

window.allLetters = function () {
    if (!isAdmin()) { console.log('상담사만'); return; }
    const list = collect();
    console.table(list.map(function (l) {
        return { 때: l.at ? fmt(l.at) : l.date, 보낸사람: who(l.from).name, 받는사람: who(l.to).name, 남음: l.where || '없음', 글: l.content };
    }));
    return list;
};

})();
