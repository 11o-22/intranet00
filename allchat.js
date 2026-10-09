// ==========================================
// ★ 사내 채팅 — 인트라넷 전체 대화
// bundles.json 마지막 묶음, emoji.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   로그인한 사원 전부가 한자리에서 말한다. 이름만 뜨지 않고 사원증
//   사진이 작게 같이 뜬다. 사진이 없으면 PHOTO 칸이 그대로 뜬다 —
//   사원 목록(index.html:5412)과 같은 식이다.
//
//       allChat/<키> = { code, name, no, team, text, st, at }
//
//   st 가 있으면 이모티콘이다. emoji.js 가 그려 준다.
//   마지막 120줄만 읽는다. 그 위는 서버에 남아 있어도 안 내려온다.
//
// ■ 랭킹 칸 자리를 쓴다
//
//   바닥에 고정된 칸은 「사내 포인트 Top 3」 하나뿐이었다(#ranking-bottom-bar).
//   그 칸의 속만 갈아 끼운다. 칸 자체는 그대로 두므로 로그인·로그아웃·
//   당국 화면에서 그 칸을 켜고 끄던 다섯 자리를 건드릴 필요가 없다.
//   랭킹을 그리던 renderPointRanking 은 #ranking-items-wrapper 가 없으면
//   첫 줄에서 그냥 돌아간다 — 그대로 둬도 아무 일도 안 한다.
//
// ■ 안 읽은 줄
//
//   마지막으로 본 때를 이 기기에 적어 둔다(localStorage). 그보다 뒤에
//   남의 말이 올라오면 단추에 빨간 점이 붙는다.
//
// ■ 콘솔
//   allChatState()        지금 몇 줄 · 접속자 몇 명
//   allChatClear()        상담사 — 전부 지운다

const ALLCHAT = {
    NODE: 'allChat',
    KEEP: 120,          // 내려받는 줄 수
    MAX:  300           // 한 줄 글자 수
};

(function allChat() {

const KEY = 'allChat.read.v1';
let ref = null, log = [], open_ = false, lastSeen = 0;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function readAt() {
    try { return Number(localStorage.getItem(KEY)) || 0; } catch (e) { return lastSeen; }
}
function markRead() {
    const t = Date.now();
    lastSeen = t;
    try { localStorage.setItem(KEY, String(t)); } catch (e) { }
}
function unread() {
    const r = readAt();
    const u = me();
    return log.filter(function (m) { return m && m.at > r && (!u || m.code !== u.code); }).length;
}
function onlineCount() {
    try {
        const m = (typeof onlineUsersMap !== 'undefined') ? onlineUsersMap : {};
        return Math.max(1, Object.keys(m).filter(function (c) { return c !== 'kario0987'; }).length);
    } catch (e) { return 1; }
}

// 사원증 사진 — 사원 목록과 같은 식
function avatar(code, size) {
    const s = size || 30;
    let u = null;
    try { u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null; } catch (e) { }
    const inner = (u && u.badge && u.badge.photo)
        ? '<img src="' + u.badge.photo + '" alt="사진" style="width:100%; height:100%; object-fit:cover;">'
        : '<span style="font-size:' + Math.max(6, Math.round(s / 4)) + 'px;'
            + ' color:var(--sk-text-dim, #555);">PHOTO</span>';
    let dot = '';
    try {
        if (typeof onlineUsersMap !== 'undefined' && onlineUsersMap[code]) {
            dot = '<div style="position:absolute; top:-2px; left:-2px; width:8px; height:8px;'
                + ' background:#4CAF50; border-radius:50%; box-shadow:0 0 6px #4CAF50;'
                + ' border:1.5px solid var(--sk-panel, #141414);"></div>';
        }
    } catch (e) { }
    return '<div style="position:relative; width:' + s + 'px; height:' + s + 'px; flex-shrink:0;'
        + ' border-radius:5px; overflow:hidden; background:var(--sk-well, #222);'
        + ' border:1px solid var(--sk-line, #3a3a3a);'
        + ' display:flex; align-items:center; justify-content:center;">' + dot + inner + '</div>';
}

// ==========================================
// 듣기
// ==========================================
function attach() {
    if (ref || !db_()) return;
    ref = db_().ref(ALLCHAT.NODE).limitToLast(ALLCHAT.KEEP);
    ref.on('value', function (s) {
        const v = s.val() || {};
        // 올라온 때로 줄을 세운다. 열쇠 순서를 믿지 않는다.
        log = Object.keys(v).map(function (k) { return v[k]; })
            .filter(function (m) { return m && m.at; })
            .sort(function (a, b) { return a.at - b.at; });
        paintLog();
        paintBtn();
    });
}
function detach() {
    if (ref) { try { ref.off(); } catch (e) { } ref = null; }
    log = [];
}

// ==========================================
// 바닥 단추 — 랭킹 칸 자리를 쓴다
// ==========================================

// 초록 불 — 글이 올라와 있으면 켜진다
function lampCss() {
    if (document.getElementById('allchat-lamp-css')) return;
    const s = document.createElement('style');
    s.id = 'allchat-lamp-css';
    s.textContent =
        '@keyframes allchatLamp {'
        + '  0%,100% { box-shadow:0 0 5px rgba(47,191,90,0.75), 0 0 1px rgba(47,191,90,0.9); }'
        + '  50%     { box-shadow:0 0 13px rgba(47,191,90,1), 0 0 4px rgba(47,191,90,1); }'
        + '}'
        + '.allchat-lamp { animation: allchatLamp 1.6s ease-in-out infinite; }'
        + '@media (prefers-reduced-motion: reduce) {'
        + '  .allchat-lamp { animation:none; box-shadow:0 0 8px rgba(47,191,90,0.9); }'
        + '}';
    (document.head || document.documentElement).appendChild(s);
}

function paintBtn() {
    const bar = document.getElementById('ranking-bottom-bar');
    if (!bar) return;
    if (!document.getElementById('allchat-btn')) {
        bar.innerHTML =
            '<div style="display:flex; align-items:center; gap:8px; padding:8px 12px;'
            + ' padding-bottom:calc(8px + env(safe-area-inset-bottom));">'
            + '<button id="allchat-btn" class="ranking-toggle-btn" onclick="openAllChat()"'
            + ' style="width:auto; flex:0 0 auto; border:none; border-radius:6px; padding:9px 14px;'
            + ' display:inline-flex; gap:7px; align-items:center; position:relative;">'
            + '<span>💬 사내 채팅</span>'
            + '<span id="allchat-dot" style="display:none; min-width:16px; height:16px; padding:0 4px;'
            + ' border-radius:8px; background:#2fbf5a; color:#06260f; font-size:9px; line-height:16px;'
            + ' text-align:center; font-weight:bold;"></span></button>'
            + '<span id="allchat-online" style="font-size:10px; color:#666; margin-left:auto;"></span>'
            + '</div>';
    }
    lampCss();
    const dot = document.getElementById('allchat-dot');
    const n = unread();
    if (dot) {
        dot.style.display = n ? 'inline-block' : 'none';
        dot.textContent = n > 99 ? '99+' : String(n);
        dot.className = n ? 'allchat-lamp' : '';
    }
    const on = document.getElementById('allchat-online');
    if (on) on.textContent = '접속 ' + onlineCount() + '명';
}

// ==========================================
// 대화 칸
// ==========================================
const OV = 'allchat-overlay';

// 벽지를 쓰고 있으면 바깥 어둠도 벽지 색으로 — 안 쓰면 원래대로 검다.
// 안쪽 색들은 inline 에 var(--sk-…) 로 박아 뒀으니 벽지를 갈아 끼우면 저절로 따라온다.
function paintSkin(el) {
    if (!el) el = document.getElementById(OV);
    if (!el) return;
    const on = !!(document.body && document.body.dataset && document.body.dataset.uiSkin);
    el.style.background = on ? 'var(--sk-panel, #0f0f0f)' : 'rgba(0,0,0,0.88)';
    const sheet = el.firstElementChild;
    if (sheet) {
        sheet.style.boxShadow = on
            ? '0 0 0 1px var(--sk-line, transparent)'
            : '0 0 50px rgba(0,0,0,0.9)';
    }
}

window.openAllChat = function () {
    if (!me()) return;
    attach();
    open_ = true;
    let el = document.getElementById(OV);
    if (!el) {
        el = document.createElement('div');
        el.id = OV;
        el.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100dvh;'
            + ' background:rgba(0,0,0,0.88); z-index:99998; display:flex;'
            + ' justify-content:center; align-items:flex-start; box-sizing:border-box;'
            + ' padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom);';
        el.innerHTML =
            '<div style="width:100%; max-width:450px; height:100%; display:flex; flex-direction:column;'
            + ' background:var(--sk-base, #0f0f0f); box-shadow:0 0 50px rgba(0,0,0,0.9);">'
            + '<div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center;'
            + ' padding:12px 14px; border-bottom:1px solid var(--sk-line, #2a2a2a);'
            + ' background:var(--sk-panel, #141414);">'
            + '<div><div style="font-size:13px; color:var(--sk-accent-text, #d4af37);'
            + ' font-weight:bold;">💬 사내 채팅</div>'
            + '<div id="allchat-sub" style="font-size:9px; color:var(--sk-text-dim, #666);'
            + ' margin-top:2px;"></div></div>'
            + '<button onclick="closeAllChat()" style="background:none;'
            + ' border:1px solid var(--sk-line, #333); color:var(--sk-text-dim, #888);'
            + ' font-size:11px; padding:5px 11px; border-radius:5px; cursor:pointer;">닫기</button>'
            + '</div>'
            + '<div id="allchat-log" style="flex:1; overflow-y:auto; padding:12px 12px 4px 12px;'
            + ' -webkit-overflow-scrolling:touch; min-height:0;"></div>'
            + '<div id="allchat-row" style="flex-shrink:0; display:flex; gap:6px; padding:10px 12px;'
            + ' border-top:1px solid var(--sk-line, #2a2a2a); background:var(--sk-panel, #141414);">'
            + '<input type="text" id="allchat-input" maxlength="' + ALLCHAT.MAX + '"'
            + ' placeholder="사내 전체에 보냅니다…" style="flex:1; min-width:0; font-size:12px; padding:9px;'
            + ' background:var(--sk-base, #0a0a0a); color:var(--sk-text, #ddd);'
            + ' border:1px solid var(--sk-edge-soft, #333); border-radius:5px;"'
            + ' onkeypress="if(event.key===\'Enter\') sendAllChat()">'
            + '<button class="game-btn" style="margin:0; padding:9px 15px; font-size:11px; flex-shrink:0;'
            + ' background:var(--sk-tab, #222); border:1px solid var(--sk-edge, #444);'
            + ' color:var(--sk-accent-text, #d4af37);"'
            + ' onclick="sendAllChat()">전송</button></div>'
            + '</div>';
        document.body.appendChild(el);
        // 이모티콘 단추
        const row = el.querySelector('#allchat-row');
        if (row && typeof emoOpen === 'function') {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = '☺';
            b.style.cssText = 'margin:0; padding:0 11px; font-size:17px; line-height:1; flex-shrink:0;'
                + ' background:var(--sk-tab, rgba(255,255,255,0.05));'
                + ' border:1px solid var(--sk-line, #333); border-radius:5px;'
                + ' color:var(--sk-accent-text, #d4af37); cursor:pointer;';
            b.onclick = function () { emoOpen('allchat', window.emoSendAll); };
            row.insertBefore(b, row.firstChild);
        }
    }
    el.style.display = 'flex';
    paintSkin(el);
    markRead();
    paintLog(true);
    paintBtn();
    const sub = document.getElementById('allchat-sub');
    if (sub) sub.textContent = '접속 ' + onlineCount() + '명 · 최근 ' + ALLCHAT.KEEP + '줄';
};

window.closeAllChat = function () {
    open_ = false;
    const el = document.getElementById(OV);
    if (el) el.style.display = 'none';
    try { if (typeof emoClose === 'function') emoClose(); } catch (e) { }
    markRead();
    paintBtn();
};

function paintLog(force) {
    const box = document.getElementById('allchat-log');
    if (!box) return;
    if (!log.length) {
        box.innerHTML = '<div style="color:var(--sk-text-dim, #555); font-size:11px;'
            + ' text-align:center; padding:30px 0;">'
            + '아직 오간 말이 없습니다.</div>';
        return;
    }
    const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    const u = me();
    let lastDay = '';
    box.innerHTML = log.map(function (m) {
        const d = new Date(m.at);
        const day = d.toLocaleDateString();
        let sep = '';
        if (day !== lastDay) {
            lastDay = day;
            sep = '<div style="text-align:center; font-size:9px; color:var(--sk-text-dim, #4a4a4a);'
                + ' margin:12px 0 8px 0;">— '
                + esc(day) + ' —</div>';
        }
        const time = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        const mine = u && m.code === u.code;
        const body = (m.st && typeof emoTag === 'function' && emoTag(m.st))
            ? emoTag(m.st, 86)
            : '<span style="font-size:12px; color:var(--sk-text, #ddd); line-height:1.6;'
              + ' word-break:break-word;">'
              + esc(m.text) + '</span>';
        // 내 글은 오른쪽에서 나온다 — 사진도 이름줄도 글도 통째로 뒤집는다
        const head = '<div style="font-size:10px; margin-bottom:2px; display:flex; gap:5px;'
            + ' align-items:baseline; min-width:0;' + (mine ? ' flex-direction:row-reverse;' : '') + '">'
            + '<b style="color:' + (mine ? 'var(--sk-accent-on-base, #d4af37)' : 'var(--sk-text, #9fd8ef)')
            + '; flex-shrink:0;">' + esc(m.name) + '</b>'
            + (m.team ? '<span style="color:var(--sk-text-dim, #555); flex-shrink:0;">'
                + esc(m.team) + '</span>' : '')
            + '<span style="color:var(--sk-text-dim, #444); flex-shrink:0;">' + time + '</span></div>';
        return sep
            + '<div style="display:flex; gap:8px; margin-bottom:9px; align-items:flex-start;'
            + (mine ? ' flex-direction:row-reverse;' : '') + '">'
            + avatar(m.code, 30)
            + '<div style="min-width:0; flex:1;' + (mine ? ' text-align:right;' : '') + '">'
            + head + '<div>' + body + '</div></div></div>';
    }).join('');
    if (force || atBottom) box.scrollTop = box.scrollHeight;
}

// ==========================================
// 보내기
// ==========================================
function push(obj) {
    const u = me();
    if (!u || !db_()) return false;
    db_().ref(ALLCHAT.NODE).push(Object.assign({
        code: u.code, name: u.name, no: u.no || '', team: u.team || '', at: Date.now()
    }, obj));
    return true;
}

window.sendAllChat = function () {
    const inp = document.getElementById('allchat-input');
    if (!inp) return;
    const v = String(inp.value || '').trim();
    if (!v) return;
    const u = me();
    if (!u) return;
    if (typeof isQuarantined === 'function' && isQuarantined(u)) {
        showCustomAlert('격리 중에는 사내 채팅을 쓸 수 없습니다.'); return;
    }
    if (push({ text: v.slice(0, ALLCHAT.MAX) })) { inp.value = ''; markRead(); }
};

window.emoSendAll = function (id) {
    const e = (typeof emoById === 'function') ? emoById(id) : null;
    if (!e) return;
    const u = me();
    if (u && typeof isQuarantined === 'function' && isQuarantined(u)) {
        showCustomAlert('격리 중에는 사내 채팅을 쓸 수 없습니다.'); return;
    }
    if (push({ text: '[이모티콘] ' + e.n, st: id })) markRead();
};

// ==========================================
// 돌리기
// ==========================================
setInterval(function () {
    try {
        if (!me()) { detach(); return; }
        attach();
        paintBtn();
        if (open_) {
            const sub = document.getElementById('allchat-sub');
            if (sub) sub.textContent = '접속 ' + onlineCount() + '명 · 최근 ' + ALLCHAT.KEEP + '줄';
            paintSkin();     // 열어 둔 채로 벽지를 갈아도 따라오게
        }
    } catch (e) { }
}, 2500);

// ==========================================
// 확인
// ==========================================
window.allChatState = function () {
    console.log('%c===== 사내 채팅 =====', 'color:#d4af37; font-size:13px');
    console.log('  받아 둔 줄 :', log.length + ' (최근 ' + ALLCHAT.KEEP + '줄만 내려옵니다)');
    console.log('  안 읽은 줄 :', unread());
    console.log('  접속       :', onlineCount() + '명');
    console.log('  마지막 줄  :', log.length ? (log[log.length - 1].name + ' — ' + log[log.length - 1].text) : '-');
};

window.allChatClear = function () {
    const u = me();
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!db_()) return;
    db_().ref(ALLCHAT.NODE).remove();
    console.log('%c✓ 사내 채팅을 비웠습니다.', 'color:#4CAF50');
};

console.log('[사내채팅] allChatState() · allChatClear()');

})();
