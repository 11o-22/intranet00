// ==========================================
// ★ 사내 이모티콘 8종 — 파티 채팅 · 사택 채팅 · 사내 채팅
//   ★ 2026-10-26 — 여덟 가지만 남기고 나머지는 판에서 지웠다 (흥… · 토크쇼 갈 토크쇼! · 멈추십시오!! · 낑! · 빠—안 · 비몽사몽… · 나 불렀어~? · 탐사 갑시다!)
// bundles.json 마지막 묶음, chat-fix.js 보다 뒤 (채팅 함수가 다 올라온 뒤)
// ==========================================
//
// ■ 어떻게 오가나
//
//   글 대신 그림을 보내는 것이 아니라, 글에 **표만 하나 더 붙인다.**
//
//       { code, name, text: '[이모티콘] 반가워', at, st: 'e16' }
//
//   st 가 있으면 그림으로 그리고, 없으면 전처럼 글로 그린다.
//   st 를 모르는 묵은 판에서는 text 가 그대로 보인다 — 깨지지 않는다.
//
// ■ 그림은 이 파일 안에 글자로 심었다
//
//   91장 · 긴 쪽 180 · 합쳐 1.2 MB 쯤. 이모티콘 칸을 열 때만 받는다.
//   흰 바탕은 가장자리에서 타고 들어가며 지웠다. 가운·눈처럼 **속에 있는
//   흰색은 남는다.** 칸 경계에서 묻어 온 얇은 띠도 따로 걷어 냈다.
//
// ■ 붙는 자리
//
//   파티 채팅  #pchat-input 줄에 ☺ 단추      (renderChatLog 를 덧그린다)
//   사택 채팅  #hchat-input 줄에 ☺ 단추      (renderHouseChatLog 를 덧그린다)
//   사내 채팅  allchat.js 가 emoOpen() 을 불러 쓴다
//
//   파티 채팅의 renderChatLog 는 titles.js 가 「줄 수가 로그 수와 같다」를
//   믿고 뱃지를 붙인다. 그래서 이모티콘 줄도 .pchat-msg 하나에 .pchat-name
//   하나를 그대로 지킨다.
//
// ■ 콘솔
//   emoList()   무엇이 있나

const EMO_LIST = [
    // 그림은 emo/ 안에 webp 파일로 둔다. 예전처럼 글자로 박아 넣으면
    // 묶음 파일이 400KB 넘게 불어나고, 안 여는 사람도 통째로 받는다.
    // 파일로 두면 이모티콘 칸을 열 때만 받고, 그 뒤로는 브라우저가 들고 있다.
    // ── 2026-10-14 받은 일곱 장. 한 장에 흩어 그려 주신 것을 덩어리로 갈라
    //    떼어 냈다 (글씨도 그림의 한 덩어리라 같이 붙어 온다).
    //    ★ 이름은 **그림에 적힌 글씨를 그대로** 옮겼습니다. 「검 너오줄」은
    //      읽은 그대로라, 뜻이 다르면 이 줄만 고치시면 됩니다.
    // 2026-10-15 에 주신 한 장 — 아홉 짝을 떼어 넣었다. 이름은 적힌 글에서
    // 따온 제 짐작이니, 다르면 이 줄의 n 만 고치면 된다.
    // 2026-10-18 에 주신 한 장 — 여섯 짝. 바탕이 이미 투명이라 칸마다 잘라 줄이기만 했다.
    // 이름은 그림에 적힌 글씨를 옮긴 것이다 (첫 장은 작은 말풍선의 「흥…」).
    { i: 'e92', n: '흥…',               d: 'emo/e92.webp' },
    { i: 'e93', n: '토크쇼 갈 토크쇼!',     d: 'emo/e93.webp' },
    { i: 'e94', n: '낑!',               d: 'emo/e94.webp' },
    { i: 'e95', n: '멈추십시오!!',         d: 'emo/e95.webp' },
    { i: 'e96', n: '빠—안',              d: 'emo/e96.webp' },
    { i: 'e97', n: '비몽사몽…',           d: 'emo/e97.webp' },
    // 2026-10-23 에 주신 두 장 — 아홉 짝씩 열여덟. 바탕이 이미 투명이라 덩어리마다 떼어 내 칸에 나눠 줄이기만 했다
    // (글씨 뒤의 흰 테두리는 그린 그대로 둔다). 이름은 그림에 적힌 글씨를 옮긴 것이다.
    // 2026-10-23 에 주신 한 장 — 아홉 짝. 앞의 두 장(나 불렀어 · 탐사 갑시다)만 흰 네모 바탕이 깔려 와서
    // 가장자리에서 타고 들어가며 지우고 다른 장들처럼 흰 테두리를 둘렀다 (말풍선 · 가운 속 흰색은 남는다).
    { i: 'e116', n: '나 불렀어~?', d: 'emo/e116.webp' },
    { i: 'e117', n: '탐사 갑시다!', d: 'emo/e117.webp' }

];

(function emoticons() {

const MAP = {};
EMO_LIST.forEach(function (e) { MAP[e.i] = e; });

window.emoById = function (id) { return MAP[id] || null; };
window.emoTag = function (id, size) {
    const e = MAP[id];
    if (!e) return '';
    const s = size || 96;
    return '<img src="' + e.d + '" alt="' + e.n + '" title="' + e.n + '"'
        + ' style="width:auto; height:' + s + 'px; max-width:100%; vertical-align:middle;'
        + ' image-rendering:auto; pointer-events:none;">';
};

// ==========================================
// 고르는 칸
// ==========================================
const PID = 'emo-pick';
let openFor = null;          // 지금 누구를 위해 열려 있나

function panel(onPick) {
    close();
    const d = document.createElement('div');
    d.id = PID;
    // ★ 창은 그대로 두고 **이모티콘 칸만** 흐른다 — 윗줄(사내 이모티콘 · 닫기)은 늘 창 위에 붙어 있다 (2026-10-21)
    //   ✗ 전에는 창 전체가 흘러, 내려 고르다가 닫으려면 다시 끝까지 올려야 했다.
    d.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:0;'
        + ' width:100%; max-width:450px; max-height:46dvh; overflow:hidden; z-index:9999999;'
        + ' display:flex; flex-direction:column; box-sizing:border-box;'
        + ' background:var(--sk-panel, #141414); border-top:1px solid var(--sk-line, #444);'
        + ' border-radius:10px 10px 0 0;'
        + ' box-shadow:0 -6px 20px rgba(0,0,0,0.8); padding:10px 10px 0 10px;';
    d.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex:0 0 auto;">'
        + '<span style="font-size:11px; color:var(--sk-text-dim, #aaa); font-weight:bold;">사내 이모티콘</span>'
        + '<button id="emo-close" style="background:none; border:1px solid var(--sk-line, #333);'
        + ' color:var(--sk-text-dim, #888);'
        + ' font-size:11px; padding:3px 9px; border-radius:4px; cursor:pointer;">닫기</button></div>'
        + '<div id="emo-scroll" style="flex:1 1 auto; min-height:0; overflow-y:auto; -webkit-overflow-scrolling:touch;'
        + ' overscroll-behavior:contain; padding-bottom:calc(10px + env(safe-area-inset-bottom));">'
        + '<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px;">'
        + EMO_LIST.map(function (e) {
            return '<button data-emo="' + e.i + '" title="' + e.n + '"'
                + ' style="background:var(--sk-well, rgba(255,255,255,0.04));'
                + ' border:1px solid var(--sk-line, #2e2e2e); border-radius:7px;'
                + ' padding:5px; cursor:pointer; display:flex; align-items:center; justify-content:center;'
                + ' min-height:74px;">'
                + '<img src="' + e.d + '" alt="' + e.n + '" style="max-width:100%; max-height:66px;'
                + ' pointer-events:none;"></button>';
        }).join('')
        + '</div></div>';
    document.body.appendChild(d);
    d.querySelector('#emo-close').onclick = close;
    d.querySelectorAll('[data-emo]').forEach(function (b) {
        b.onclick = function () {
            const id = b.getAttribute('data-emo');
            close();
            try { onPick(id); } catch (e) { console.warn('[이모티콘] 보내기 실패:', e && e.message); }
        };
    });
}
function close() {
    const o = document.getElementById(PID);
    if (o) o.remove();
    openFor = null;
}
window.emoClose = close;

// 같은 자리를 다시 누르면 닫힌다
window.emoOpen = function (who, onPick) {
    if (openFor === who) { close(); return; }
    openFor = who;
    panel(onPick);
};

// ==========================================
// 보내기
// ==========================================
window.emoSendParty = function (id) {
    const e = MAP[id];
    if (!e || typeof database === 'undefined' || !database) return;
    const pid = (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId)
        || (typeof myPartyId !== 'undefined' ? myPartyId : null);
    if (!pid) return;
    database.ref('darkChats/' + pid).push({
        code: currentUser.code, name: currentUser.name,
        text: '[이모티콘] ' + e.n, st: id, at: Date.now()
    });
};

window.emoSendHouse = function (id) {
    const e = MAP[id];
    if (!e || typeof database === 'undefined' || !database) return;
    let rid = null;
    try { rid = houseRoomId(); } catch (x) { }
    if (!rid) return;
    database.ref('houseChats/' + rid).push({
        code: currentUser.code, name: currentUser.name,
        text: '[이모티콘] ' + e.n, st: id, at: Date.now()
    });
    try {
        const r = getRoomie(currentUser);
        if (r) database.ref('users/' + r.code + '/houseChatUnread').set(Date.now());
    } catch (x) { }
};

// ==========================================
// 단추 붙이기 · 그림으로 바꿔 그리기
// ==========================================
function stickBtn(rowSel, id, onPick) {
    const row = document.querySelector(rowSel);
    if (!row || document.getElementById(id)) return;
    const b = document.createElement('button');
    b.id = id;
    b.type = 'button';
    b.textContent = '☺';
    b.style.cssText = 'margin:0; padding:0 11px; font-size:17px; line-height:1; flex-shrink:0;'
        + ' background:var(--sk-tab, rgba(255,255,255,0.05)); border:1px solid var(--sk-line, #333);'
        + ' border-radius:5px; color:var(--sk-accent-text, #d4af37); cursor:pointer;';
    b.onclick = function () { window.emoOpen(id, onPick); };
    row.insertBefore(b, row.firstChild);
}

// 그림으로 그리는 법 — DOM 을 뒤지지 않는다
//
//   두 채팅 모두 ${m.text} 를 innerHTML 에 그대로 꽂는다.
//   그래서 **그리기 직전에 text 를 <img> 로 바꿔 두고, 끝나면 되돌린다.**
//   그리는 일은 원래 함수가 통째로 하므로 줄 수도 구조도 하나도 안 달라진다.
//   (파티 채팅은 titles.js 가 「줄 수 = 로그 수」를 믿고 뱃지를 붙인다)
function around(name, getLog, size, flag) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f[flag]) { clearInterval(iv); return; }
        const _o = f;
        const w = function () {
            let arr = null, keep = null;
            try {
                arr = getLog();
                if (Array.isArray(arr)) {
                    keep = [];
                    for (let i = 0; i < arr.length; i++) {
                        const m = arr[i];
                        if (m && m.st && MAP[m.st]) {
                            keep.push([m, m.text]);
                            m.text = window.emoTag(m.st, size);
                        }
                    }
                }
            } catch (e) { keep = null; }
            try { return _o.apply(this, arguments); }
            finally {
                if (keep) { for (let i = 0; i < keep.length; i++) keep[i][0].text = keep[i][1]; }
            }
        };
        w[flag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 600);
}

function after(name, fn, flag) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f[flag]) { clearInterval(iv); return; }
        const _o = f;
        const w = function () {
            const r = _o.apply(this, arguments);
            try { fn.apply(this, arguments); } catch (e) { }
            return r;
        };
        w[flag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 600);
}

// --- 파티 채팅 ---
around('renderChatLog',
    function () { return (typeof partyChatLog !== 'undefined') ? partyChatLog : null; },
    92, '_emoAround');
after('renderChatLog', function () {
    stickBtn('.pchat-input-row', 'emo-btn-party', window.emoSendParty);
}, '_emoBtn');

// --- 사택 채팅 ---
around('renderHouseChatLog',
    function () { return (typeof houseChatLog !== 'undefined') ? houseChatLog : null; },
    88, '_emoAround');
after('renderHouseChatLog', function () {
    const inp = document.getElementById('hchat-input');
    if (!inp || !inp.parentElement || document.getElementById('emo-btn-house')) return;
    const b = document.createElement('button');
    b.id = 'emo-btn-house';
    b.type = 'button';
    b.textContent = '☺';
    b.style.cssText = 'margin:0; padding:0 11px; font-size:17px; line-height:1; flex-shrink:0;'
        + ' background:var(--sk-tab, rgba(255,255,255,0.05)); border:1px solid var(--sk-line, #333);'
        + ' border-radius:5px; color:var(--sk-accent-text, #d4af37); cursor:pointer;';
    b.onclick = function () { window.emoOpen('emo-btn-house', window.emoSendHouse); };
    inp.parentElement.insertBefore(b, inp);
}, '_emoBtn');

// ==========================================
// 확인
// ==========================================
window.emoList = function () {
    console.log('%c===== 사내 이모티콘 =====', 'color:#d4af37; font-size:13px');
    console.table(EMO_LIST.map(function (e) {
        return { 번호: e.i, 이름: e.n, 그림: e.d };
    }));
    console.log('  보내기 — emoSendParty("e01") · emoSendHouse("e01") · emoSendAll("e01")');
};

console.log('[이모티콘] ' + EMO_LIST.length + '종 — emoList()');

})();
