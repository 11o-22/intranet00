// ==========================================
// ★ 익명 편지 — 답신 (2026-11-01 사용자)
// bundles.json — letter-admin.js 바로 뒤
// ==========================================
//
// ■ 무엇을
//
//   「익명편지 받은 사람은 익명편지를 준 사람한테 '답신'이 가능하게. 대신 서로 익명인 것으로.」
//
//   받은 편지(편지함 · 보관함)마다 「답신」 단추를 단다. 누르면 짧은 글을 적어
//   그 편지를 보낸 사람의 편지함으로 보낸다. 받는 쪽에는 여느 익명 편지처럼
//   「발신인: [익명]」으로만 보이고, 어느 편지에 온 답인지(내가 쓴 글의 앞부분)만 붙는다.
//   보낸 사람이 누구인지는 어느 쪽 화면에도 나오지 않는다 (상담사 열람 칸에만 — letter-admin.js).
//
//   · 편지 한 장에 답신은 한 번 (l.replied 에 적는다)
//   · 답신에도 다시 답신할 수 있다 — 답신 역시 보낸 사람(fromCode)을 품은 익명 편지이므로
//   · 편지지(「익명 편지」)는 쓰지 않는다 — 답신은 받은 편지에 딸린 것
//   · 격리(상담실 · 선녀탕) 중에는 못 보낸다 — 익명 편지와 같다
//   · 받는 쪽 편지함은 여느 편지처럼 여덟 장까지 (LETTER_KEEP)
//   · 내 「보낸 편지」 칸에는 받는 사람을 「익명 (답신)」으로 적는다 — 내 화면에서도 상대가 드러나지 않게
//
// ■ 콘솔
//   letterReplyState()

(function letterReply() {
'use strict';

const MAX = 300;
const KEEP_N = (typeof LETTER_KEEP !== 'undefined') ? LETTER_KEEP : 8;
const RE_LEN = 24;            // 어느 편지에 온 답인지 — 그 편지 글의 앞부분

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); else console.log(m); } catch (e) { } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function plain(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }
function arr(v) { if (Array.isArray(v)) return v; if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; }); return []; }

function listOf(where) {
    const u = me(); if (!u) return [];
    if (where === 'kept') { if (!Array.isArray(u.keptLetters)) u.keptLetters = arr(u.keptLetters); return u.keptLetters; }
    if (!Array.isArray(u.letters)) u.letters = arr(u.letters);
    return u.letters;
}
function canReply(l) { const u = me(); return !!(l && l.fromCode && u && l.fromCode !== u.code); }

// ==========================================
// 보내기
// ==========================================
let busy = false;
window.letterReplyOpen = function (where, i) {
    const u = me();
    const l = listOf(where)[i];
    if (!u || !canReply(l)) { alert_('답신할 수 없는 편지입니다.'); return; }
    if (l.replied) { alert_('이 편지에는 이미 답신을 보냈습니다.'); return; }
    if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('여우 상담실 격리 중에는 서신을 보낼 수 없습니다.'); return; }
    if (typeof openTextInput !== 'function') return;
    const id = l.id;
    openTextInput('답신',
        '이 편지를 보낸 사람에게 익명으로 답합니다.<br>'
        + '<span style="color:#888; font-size:10px;">「' + esc(plain(l.content).slice(0, RE_LEN)) + (plain(l.content).length > RE_LEN ? '…' : '') + '」<br>'
        + '서로 누구인지는 드러나지 않습니다. 편지 한 장에 한 번 · 편지지는 쓰지 않습니다. (최대 ' + MAX + '자)</span>',
        '답신을 적어 주세요',
        function (text) { send(where, id, text); });
    const f = document.getElementById('text-input-field');
    if (f) f.setAttribute('maxlength', MAX);
};

function send(where, id, text) {
    const u = me(), d = db_();
    if (!u || busy) return;
    const list = listOf(where);
    const i = list.findIndex(function (x) { return x && x.id === id; });
    const l = list[i];
    if (!canReply(l) || l.replied) return;
    text = String(text || '').slice(0, MAX);
    if (!text) return;
    const to = l.fromCode;
    const letter = {
        id: Date.now(), date: new Date().toLocaleString(), content: text,
        fromCode: u.code, fromName: u.name,
        reply: true, re: plain(l.content).slice(0, RE_LEN), reMore: plain(l.content).length > RE_LEN
    };
    const done = function () {
        l.replied = Date.now();
        // 내 「보낸 편지」 — 받는 사람은 드러내지 않는다 (상담사 열람이 사번으로 잇는다)
        try {
            if (!Array.isArray(u.sentLetters)) u.sentLetters = arr(u.sentLetters);
            u.sentLetters.unshift({ id: letter.id, date: letter.date, toCode: to, toName: '익명 (답신)', toNo: '', content: text, reply: true });
            while (u.sentLetters.length > 8) u.sentLetters.pop();
        } catch (e) { }
        try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[익명 편지] 받은 편지에 답신을 보냈습니다.'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields(where === 'kept' ? { keptLetters: 1, sentLetters: 1, history: 1 } : { letters: 1, sentLetters: 1, history: 1 }); } catch (e) { }
        try { if (typeof window.letterLogPut === 'function') window.letterLogPut(to, '↩ 답신 — ' + text); } catch (e) { }
        try { if (typeof renderLetters === 'function') renderLetters(); } catch (e) { }
        alert_('답신을 보냈습니다.');
    };
    if (!d) {
        const t = (typeof db !== 'undefined' && db.users) ? db.users[to] : null;
        if (!t) { alert_('받을 사람을 찾지 못했습니다.'); return; }
        if (!Array.isArray(t.letters)) t.letters = arr(t.letters);
        t.letters.unshift(letter);
        while (t.letters.length > KEEP_N) t.letters.pop();
        t.hasNewLetter = true;
        done();
        return;
    }
    busy = true;
    d.ref('users/' + to + '/letters').once('value').then(function (s) {
        const letters = arr(s.val());
        letters.unshift(letter);
        while (letters.length > KEEP_N) letters.pop();
        const up = {};
        up['users/' + to + '/letters'] = letters;
        up['users/' + to + '/hasNewLetter'] = true;
        up['users/' + to + '/_adminStamp'] = Date.now();
        return d.ref('/').update(up);
    }).then(function () { busy = false; done(); })
      .catch(function (e) { busy = false; console.error('[답신]', e); alert_('전송 중 오류가 발생했습니다.'); });
}

// ==========================================
// 단추 달기 — 편지함 · 보관함 카드마다
// ==========================================
function btnHtml(where, i, l, right) {
    if (!canReply(l)) return '';
    if (l.replied) return '<span class="reply-btn" style="position:absolute; top:8px; right:' + right + 'px; color:#666; font-size:10px; font-weight:bold;">답신함</span>';
    return '<button class="reply-btn" onclick="letterReplyOpen(\'' + where + '\',' + i + ')" style="position:absolute; top:8px; right:' + right + 'px; background:transparent; border:none; color:#9fd8ef; cursor:pointer; font-size:10px; font-weight:bold;">답신</button>';
}
function tagReply(card, l) {
    if (!l || !l.reply || card.querySelector('.reply-tag')) return;
    const meta = card.querySelector('.letter-meta');
    if (!meta) return;
    meta.insertAdjacentHTML('beforeend', '<div class="reply-tag" style="color:#9fd8ef; margin-top:3px;">↩ 내 편지'
        + (l.re ? ' 「' + esc(l.re) + (l.reMore ? '…' : '') + '」' : '') + '에 온 답신</div>');
}
function decorate() {
    const u = me(); if (!u) return;
    // 받은 편지 — 삭제(오른쪽 8) · 보관(44) 다음 자리
    const box = document.getElementById('received-letters-container');
    if (box) {
        const ls = listOf('in');
        Array.prototype.forEach.call(box.querySelectorAll('.letter-card'), function (card, i) {
            const l = ls[i];
            const want = btnHtml('in', i, l, 80);
            const old = card.querySelector('.reply-btn');
            if (!old || old.outerHTML !== want) { if (old) old.remove(); if (want) card.insertAdjacentHTML('beforeend', want); }
            tagReply(card, l);
        });
    }
    // 보관함 — 지움(8) 다음 자리
    const kb = document.getElementById('kept-letters-box');
    if (kb) {
        const ks = listOf('kept');
        Array.prototype.forEach.call(kb.querySelectorAll('.letter-card'), function (card, i) {
            const l = ks[i];
            const want = btnHtml('kept', i, l, 44);
            const old = card.querySelector('.reply-btn');
            if (!old || old.outerHTML !== want) { if (old) old.remove(); if (want) card.insertAdjacentHTML('beforeend', want); }
            tagReply(card, l);
        });
    }
}
(function hook() {
    const iv = setInterval(function () {
        if (typeof renderLetters !== 'function') return;
        if (renderLetters._reply) { clearInterval(iv); return; }
        const _r = renderLetters;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { decorate(); } catch (e) { console.warn('[답신]', e); }
            return out;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._reply = true;
        renderLetters = w;
        window.renderLetters = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 45000);
})();
// 보관함만 다시 그려질 때도 · 칸이 열려 있는 동안
setInterval(function () {
    try {
        const panel = document.getElementById('rec-letters');
        if (!panel || panel.offsetParent === null) return;
        decorate();
    } catch (e) { }
}, 1200);

window.letterReplyState = function () {
    const ls = listOf('in'), ks = listOf('kept');
    console.log('%c===== ↩ 답신 =====', 'color:#9fd8ef; font-size:13px');
    console.log('  편지함', ls.length, '장 · 답신한 것', ls.filter(function (l) { return l && l.replied; }).length,
        '· 받은 답신', ls.filter(function (l) { return l && l.reply; }).length);
    console.log('  보관함', ks.length, '장 · 답신한 것', ks.filter(function (l) { return l && l.replied; }).length);
};

})();
