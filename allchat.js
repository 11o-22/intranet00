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
// ■ 🐾 아기 여우 (2026-10-21)
//
//   여우가 붙은 사람 · 아기 여우 장착자에게는 적는 줄 옆에 [🐾] 단추가 뜬다.
//   누르면 서버(/api/disaster · act kitcall)가 아이들을 불러낸다 —
//     붙은 사람이 부르면 곁의 아이가, 장착자가 부르면 남에게 안 붙은 아이가 다 나온다.
//   나와 있는 동안 누가 말하면 2.5초 뒤 서버(act kitchat)가 대답을 올린다 (여럿이 잇달아 말하면 마지막 한 번만).
//   한 아이가 하루에 나누는 말은 스무 마디 — 스무 번째는 「이제 가 봐야겠다」는 작별 인사고, 그러고 나간다.
//   여우 줄은 allChat 에 { code: 'fox_<주인>_<속성>', fox: 속성, oN: 주인 이름, onN: 곁의 사람 } 으로 선다.
//   allChatFox/on 에 지금 나와 있는 아이가 적힌다 (서버가 쓴다).
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
let kitRef = null, kitHere = {}, kitBusy = false, kitTimer = 0;
const BABY = '🐾 아기 여우';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
// 🖍 반짝 크레용 (crayon.js) — 장착한 사람의 이름 · 글 색. 없으면 그대로
function cyN(c, h) { try { return (typeof window.crayonName === 'function') ? window.crayonName(c, h) : h; } catch (e) { return h; } }
function cyS(c, h) { try { return (typeof window.crayonSay === 'function') ? window.crayonSay(c, h) : h; } catch (e) { return h; } }
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
    if (kitRef) { try { kitRef.off(); } catch (e) { } kitRef = null; }
    log = []; kitHere = {};
}

// ==========================================
// 🐾 아기 여우
// ==========================================
function kstDay() { return new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10); }
function kitAttach() {
    if (kitRef || !db_()) return;
    kitRef = db_().ref('allChatFox/on');
    kitRef.on('value', function (s) {
        kitHere = s.val() || {};
        paintKit();
    });
}
function kitLive() {
    const d = kstDay();
    return Object.keys(kitHere || {}).filter(function (id) { return kitHere[id] && kitHere[id].day === d; });
}
function kitNameOf(f) { return (f && (f.nick || ({ evade: '코코', sense: '잭슨', heal: '쭈니', hide: '루팡', luck: '앙냥', break: '디트', bond: '메리', gaze: '니케' })[f.k])) || '아기 여우'; }
// 부를 수 있는 사람 — 아기 여우를 찼거나, 누가 붙여 준 아이가 있거나
function kitCan() {
    const u = me();
    if (!u) return false;
    const base = function (w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } };
    if (Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return base(w) === BABY; })) return true;
    return !!(u.kitOn && typeof u.kitOn === 'object' && Object.keys(u.kitOn).some(function (k) { return u.kitOn[k] && u.kitOn[k].by; }));
}
function kitApi(body) {
    return fetch('/api/disaster', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._st = r.status; return j; }); });
}
function kitSay(t) { try { if (typeof showCustomAlert === 'function') showCustomAlert(t); } catch (e) { } }
window.allChatKitCall = function () {
    const u = me();
    if (!u || kitBusy) return;
    if (!kitCan()) { kitSay('부를 아기 여우가 없습니다.'); return; }
    kitBusy = true; paintKit();
    kitApi({ act: 'kitcall', run: 'allchat', code: u.code }).then(function (j) {
        if (j && j.ok) return;
        const why = j && j.why;
        if (why === 'here') kitSay('🐾 이미 나와 있습니다.' + (j.spent && j.spent.length ? '\n\n오늘 다 놀고 들어간 아이: ' + j.spent.join(' · ') : ''));
        else if (why === 'spent') kitSay('🐾 오늘은 다 놀고 들어갔습니다.\n내일 다시 불러 주세요.');
        else if (why === 'none') kitSay('부를 아기 여우가 없습니다.\n(남에게 붙여 주었거나 오늘 소멸한 아이는 나오지 않습니다)');
        else if (why === 'daily') kitSay('🐾 오늘은 아이들이 너무 많이 놀았습니다. 내일 다시 불러 주세요.');
        else kitSay('아기 여우를 부르지 못했습니다.' + (j && j.error ? '\n(' + j.error + ')' : ''));
    }).catch(function () { kitSay('아기 여우를 부르지 못했습니다.'); })
      .then(function () { kitBusy = false; paintKit(); });
};
// 말한 뒤 — 나와 있는 아이가 있으면 2.5초 뒤 대답을 청한다 (잇달아 말하면 마지막 한 번만)
function kitPoke() {
    if (!kitLive().length) return;
    const u = me();
    if (!u) return;
    if (kitTimer) clearTimeout(kitTimer);
    kitTimer = setTimeout(function () {
        kitTimer = 0;
        if (!kitLive().length) return;
        kitApi({ act: 'kitchat', run: 'allchat', code: u.code }).catch(function () { });
    }, 2500);
}
function paintKit() {
    const b = document.getElementById('allchat-kit');
    if (b) {
        b.style.display = kitCan() ? '' : 'none';
        b.disabled = !!kitBusy;
        b.style.opacity = kitBusy ? '0.5' : '1';
    }
    const k = document.getElementById('allchat-kit-on');
    if (k) {
        const ids = kitLive();
        k.style.display = ids.length ? '' : 'none';
        k.textContent = ids.length ? '🐾 ' + ids.map(function (id) { return kitNameOf(kitHere[id]); }).join(' · ') + ' 나와 있음' : '';
    }
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

// ==========================================
// 뒤로가기로 닫기 — 갤럭시 등의 기기 뒤로가기·쓸기
// ==========================================
//
//   index.html 에도 뒤로가기 처리가 있지만, 거기 목록은 코드 안에
//   박혀 있어 밖에서 한 칸 보탤 수가 없다. 그래서 우리 것은 따로 단다.
//   열 때 히스토리를 한 칸 밀어 넣고, 뒤로가기가 오면 그 칸을 쓴다.
//   닫기 단추로 닫을 때는 밀어 넣은 칸을 우리가 도로 빼므로, 그 뒤에
//   한 번 더 뒤로가면 평소대로 앱 밖으로 나간다.
let histOn = false;      // 내가 밀어 넣은 칸이 남아 있나
let histSelf = false;    // 내가 history.back() 을 불러 생긴 것인가

function histPush() {
    if (histOn) return;
    try { history.pushState({ allChat: 1 }, '', ''); histOn = true; } catch (e) { }
}
function histPop() {
    if (!histOn) return;
    histOn = false;
    histSelf = true;
    try { history.back(); } catch (e) { histSelf = false; }
    setTimeout(function () { histSelf = false; }, 400);
}
try {
    window.addEventListener('popstate', function () {
        if (histSelf) { histSelf = false; return; }   // 닫기 단추가 부른 것
        if (!open_ || !histOn) return;
        histOn = false;                               // 칸은 이미 빠졌다
        window.closeAllChat(true);
    });
} catch (e) { }

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
        // 🐾 아기 여우 부르기 단추 — 부를 수 있는 사람에게만 보인다
        const row0 = el.querySelector('#allchat-row');
        if (row0) {
            const kb = document.createElement('button');
            kb.type = 'button'; kb.id = 'allchat-kit'; kb.textContent = '🐾'; kb.title = '아기 여우 부르기';
            kb.style.cssText = 'margin:0; padding:0 10px; font-size:15px; line-height:1; flex-shrink:0;'
                + ' background:var(--sk-tab, rgba(255,184,112,0.08));'
                + ' border:1px solid var(--sk-line, #5a4630); border-radius:5px; cursor:pointer; display:none;';
            kb.onclick = function () { window.allChatKitCall(); };
            row0.insertBefore(kb, row0.firstChild);
        }
        const sub0 = el.querySelector('#allchat-sub');
        if (sub0) sub0.insertAdjacentHTML('afterend', '<div id="allchat-kit-on" style="display:none; font-size:9px; color:#ffb870; margin-top:2px;"></div>');
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
    kitAttach();
    paintKit();
    histPush();
    markRead();
    paintLog(true);
    paintBtn();
    const sub = document.getElementById('allchat-sub');
    if (sub) sub.textContent = '접속 ' + onlineCount() + '명 · 최근 ' + ALLCHAT.KEEP + '줄';
};

// fromBack 이 참이면 뒤로가기가 이미 칸을 뺀 뒤라 history 는 안 건드린다
window.closeAllChat = function (fromBack) {
    open_ = false;
    const el = document.getElementById(OV);
    if (el) el.style.display = 'none';
    try { if (typeof emoClose === 'function') emoClose(); } catch (e) { }
    if (fromBack !== true) histPop();
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
        if (m.fox) return sep + foxRow(m, time);
        const mine = u && m.code === u.code;
        const body = (m.st && typeof emoTag === 'function' && emoTag(m.st))
            ? emoTag(m.st, 86)
            : '<span style="font-size:12px; color:var(--sk-text, #ddd); line-height:1.6;'
              + ' word-break:break-word;">'
              + cyS(m.code, esc(m.text)) + '</span>';
        // 내 글은 오른쪽에서 나온다 — 사진도 이름줄도 글도 통째로 뒤집는다
        const head = '<div style="font-size:10px; margin-bottom:2px; display:flex; gap:5px;'
            + ' align-items:baseline; min-width:0;' + (mine ? ' flex-direction:row-reverse;' : '') + '">'
            // data-ac-code — 칭호를 붙일 자리를 알려 준다 (titles.js 의 「사내 채팅」)
            + '<b data-ac-code="' + esc(m.code || '') + '"'
            + ' style="color:' + (mine ? 'var(--sk-accent-on-base, #d4af37)' : 'var(--sk-text, #9fd8ef)')
            + '; flex-shrink:0;">' + cyN(m.code, esc(m.name)) + '</b>'
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

// 🐾 아기 여우 줄 — 사진 자리에 여우 · 이름 옆에 누구의 아이인지
function foxRow(m, time) {
    const whose = (m.oN ? m.oN + '의 아기 여우' : '아기 여우') + (m.on && m.o && m.on !== m.o && m.onN ? ' · ' + m.onN + ' 곁' : '');
    return '<div style="display:flex; gap:8px; margin-bottom:9px; align-items:flex-start;">'
        + '<div style="width:30px; height:30px; flex-shrink:0; border-radius:50%; background:rgba(255,184,112,0.14);'
        + ' border:1px solid rgba(255,184,112,0.45); display:flex; align-items:center; justify-content:center; font-size:16px;">🦊</div>'
        + '<div style="min-width:0; flex:1;">'
        + '<div style="font-size:10px; margin-bottom:2px; display:flex; gap:5px; align-items:baseline; min-width:0;">'
        + '<b style="color:#ffb870; flex-shrink:0;">' + esc(m.name || '🐾 아기 여우') + '</b>'
        + '<span style="color:var(--sk-text-dim, #6b5a48); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(whose) + '</span>'
        + '<span style="color:var(--sk-text-dim, #444); flex-shrink:0;">' + time + '</span></div>'
        + '<div><span style="font-size:12px; color:#f3dcc4; line-height:1.6; word-break:break-word;">' + esc(m.text) + '</span></div>'
        + '</div></div>';
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
    // 격리 중에도 쓸 수 있다 — 상담실·선녀탕 안에서는 시설이 막힐 뿐,
    // 말까지 막을 까닭은 없다. (전에는 여기서 돌려보냈다)
    if (push({ text: v.slice(0, ALLCHAT.MAX) })) { inp.value = ''; markRead(); kitPoke(); }
};

window.emoSendAll = function (id) {
    const e = (typeof emoById === 'function') ? emoById(id) : null;
    if (!e) return;
    if (push({ text: '[이모티콘] ' + e.n, st: id })) { markRead(); kitPoke(); }
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
            kitAttach();
            paintKit();
            const sub = document.getElementById('allchat-sub');
            if (sub) sub.textContent = '접속 ' + onlineCount() + '명 · 최근 ' + ALLCHAT.KEEP + '줄';
            paintSkin();     // 열어 둔 채로 벽지를 갈아도 따라오게
        }
    } catch (e) { }
}, 2500);

// ==========================================
// 확인
// ==========================================
window.allChatRepaint = function () { try { paintLog(false); } catch (e) { } };
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
