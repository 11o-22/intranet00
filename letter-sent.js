// ==========================================
// ★ 익명 편지 — 내가 보낸 편지도 볼 수 있게
// bundles.json 마지막 묶음, letterbox.js 보다 뒤
// ==========================================
//
// ■ 무엇이 없었나
//
//   보내고 나면 그 글이 어디에도 안 남았다. 받는 쪽 기록(users/<상대>/letters)
//   에만 들어가고, 보낸 쪽에는 활동 기록 한 줄
//   「[익명 편지] 사번 0000 대상 서신 전송」 뿐이었다. 무슨 말을 썼는지,
//   몇 장을 어디로 보냈는지 돌아볼 길이 없었다.
//
// ■ 어떻게 남기나
//
//   보낸 글을 **내 기록**(currentUser.sentLetters)에 적어 둔다. 상대의
//   기록에는 아무것도 더 넣지 않으므로 익명은 그대로다 — 내 쪽에서만 보인다.
//
//   편지가 정말 나갔을 때만 적는다. sendAnonymousLetter 은 받는 사람을
//   안 골랐거나 글이 비었거나 격리 중이면 그냥 돌아서므로, 부르기 전후로
//   「익명 편지」 장수가 줄었는지를 보고 가린다. 돌려주는 값으로는 못 가린다.
//
//   받은 편지와 같이 여덟 장까지 남긴다. 넘치면 오래된 것부터 밀려난다.
//   보관함(letterbox.js)과 같은 꼴로 익명 편지 칸 아래에 접어 둔다.
//
// ■ 콘솔
//   sentLetters()   보낸 편지 목록

(function letterSent() {

const KEEP = 8;                 // index.html 의 LETTER_KEEP 과 맞춰 둔다
const BOX = 'sent-letters-box';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function list() {
    const u = me();
    if (!u) return [];
    if (!Array.isArray(u.sentLetters)) u.sentLetters = [];
    return u.sentLetters;
}
function papers(u) {
    return ((u && u.inventory) || []).filter(function (x) { return x === '익명 편지'; }).length;
}

// ==========================================
// 보낼 때 적어 둔다
// ==========================================
(function hookSend() {
    const iv = setInterval(function () {
        if (typeof sendAnonymousLetter !== 'function') return;
        if (sendAnonymousLetter._sent) { clearInterval(iv); return; }
        const _s = sendAnonymousLetter;
        const w = function () {
            const u = me();
            const sel = document.getElementById('letter-target-select');
            const ta  = document.getElementById('letter-content-input');
            const to   = sel ? String(sel.value || '') : '';
            const text = ta ? String(ta.value || '').trim() : '';
            const had  = papers(u);

            const done = function () {
                try {
                    // 편지지가 줄었으면 정말 나간 것이다
                    if (to && text && me() && papers(me()) < had) note(to, text);
                } catch (e) { console.warn('[편지]', e); }
            };

            let out;
            try { out = _s.apply(this, arguments); }
            catch (e) { done(); throw e; }
            if (out && typeof out.then === 'function') {
                return out.then(function (r) { done(); return r; },
                                function (e) { done(); throw e; });
            }
            done();
            return out;
        };
        w._sent = true;
        sendAnonymousLetter = w;
        window.sendAnonymousLetter = w;
        clearInterval(iv);
        console.log('[편지] 보낸 편지 남기기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function note(code, text) {
    const u = me();
    if (!u) return;
    const t = ((typeof db !== 'undefined' && db.users) ? db.users[code] : null) || {};
    const arr = list();
    arr.unshift({
        id: Date.now(),
        date: new Date().toLocaleString(),
        toCode: code,
        toName: t.name || '?',
        toNo: t.no || '',
        content: text
    });
    while (arr.length > KEEP) arr.pop();
    try { if (typeof saveFields === 'function') saveFields({ sentLetters: 1 }); } catch (e) { }
    try { paint(); } catch (e) { }
}

// ==========================================
// 지우기
// ==========================================
window.deleteSentLetter = function (i) {
    const arr = list();
    if (!arr[i]) return;
    arr.splice(i, 1);
    try { if (typeof saveFields === 'function') saveFields({ sentLetters: 1 }); } catch (e) { }
    paint();
};

window.toggleSentBox = function () {
    const u = me();
    if (!u) return;
    u.sentOpen = !u.sentOpen;
    try { if (typeof saveFields === 'function') saveFields({ sentOpen: 1 }); } catch (e) { }
    paint();
};

// ==========================================
// 그리기 — 보관함과 같은 꼴로 접어 둔다
// ==========================================
function paint() {
    const box = document.getElementById(BOX);
    const u = me();
    if (!box || !u) return;
    const arr = list();
    const open = !!u.sentOpen;

    box.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;'
        + ' padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);'
        + ' border:1px solid var(--theme-border); border-left:3px solid #6fa8cf; margin-bottom:8px;"'
        + ' onclick="toggleSentBox()">'
        + '<span style="font-size:12px; color:#9fd8ef; font-weight:bold;">✉ 보낸 편지 '
        + '<span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">'
        + arr.length + '장 <span style="color:#666;">/ 최대 ' + KEEP + '</span></span></span>'
        + '<span style="font-size:10px; color:#888;">' + (open ? '▼' : '▲') + '</span>'
        + '</div>'
        + '<div style="' + (open ? '' : 'display:none;') + '">'
        + (arr.length === 0
            ? '<div style="font-size:11px; color:#666; padding:10px 0; text-align:center;">보낸 편지가 없습니다.</div>'
            : arr.map(function (l, i) {
                return '<div class="letter-card" style="position:relative;">'
                    + '<div class="letter-meta">받는 사람: ' + esc(l.toName)
                    + (l.toNo ? ' <span style="color:#777;">(NO.' + esc(l.toNo) + ')</span>' : '')
                    + ' | ' + esc(l.date) + '</div>'
                    + '<div class="letter-body">' + esc(l.content) + '</div>'
                    + '<button onclick="deleteSentLetter(' + i + ')"'
                    + ' style="position:absolute; top:8px; right:8px; background:transparent; border:none;'
                    + ' color:#888; cursor:pointer; font-size:10px; font-weight:bold;">지움</button>'
                    + '</div>';
            }).join(''))
        + '</div>';
}

// 칸이 없으면 만든다 — 익명 편지 칸 맨 아래 (보관함 다음)
function mount() {
    if (document.getElementById(BOX)) return true;
    const panel = document.getElementById('rec-letters');
    if (!panel) return false;
    panel.insertAdjacentHTML('beforeend',
        '<div style="margin-top:14px; border-top:1px dashed #333; padding-top:12px;">'
        + '<div id="' + BOX + '"></div></div>');
    return true;
}

// renderLetters 는 letterbox.js 가 이미 한 겹 감쌌다. 그 바깥에서 한 번 더
// 그린다 — 보관함 칸이 먼저 붙고 그 아래에 보낸 편지가 붙는다.
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderLetters !== 'function') return;
        if (renderLetters._sent) { clearInterval(iv); return; }
        const _r = renderLetters;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { if (mount()) paint(); } catch (e) { console.warn('[편지]', e); }
            return out;
        };
        w._sent = true;
        renderLetters = w;
        window.renderLetters = w;
        clearInterval(iv);
        console.log('[편지] 보낸 편지 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 편지 칸을 열었을 때 renderLetters 가 안 불릴 수도 있다 — 느린 시계를 하나 둔다
setInterval(function () {
    try {
        const panel = document.getElementById('rec-letters');
        if (!panel || !me()) return;
        if (panel.style.display === 'none') return;
        if (mount() && !document.getElementById(BOX).innerHTML) paint();
    } catch (e) { }
}, 1500);

// ==========================================
// 확인
// ==========================================
window.sentLetters = function () {
    const arr = list();
    console.log('%c===== 보낸 익명 편지 =====', 'color:#9fd8ef; font-size:13px');
    if (!arr.length) { console.log('  아직 없습니다.'); return []; }
    console.table(arr.map(function (l) {
        return { 때: l.date, 받는사람: l.toName + (l.toNo ? '(' + l.toNo + ')' : ''), 글: l.content };
    }));
    console.log('  ' + arr.length + ' / ' + KEEP + '장');
    return arr;
};

console.log('[편지] sentLetters()');

})();
