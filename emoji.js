// ==========================================
// ★ 사내 이모티콘 22종 — 파티 채팅 · 사택 채팅 · 사내 채팅
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
//   22장 · 가로세로 150 · 팔레트 80색 · 합쳐 140 KB.
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
    { i: 'e01', n: '연락 줘요~',        d: 'emo/e01.webp' },
    { i: 'e02', n: '허접?ㅋㅋ',         d: 'emo/e02.webp' },
    { i: 'e03', n: '묵겠습니다',         d: 'emo/e03.webp' },
    { i: 'e04', n: '포인트가 X으로 보여?',  d: 'emo/e04.webp' },
    { i: 'e05', n: '도박… 하실래요',      d: 'emo/e05.webp' },
    { i: 'e06', n: '내놔요 그거',        d: 'emo/e06.webp' },
    { i: 'e07', n: '자네… 쫄인가?',      d: 'emo/e07.webp' },
    { i: 'e08', n: '넌… 오만하군',       d: 'emo/e08.webp' },
    { i: 'e09', n: '밥은…? 먹었어요?',    d: 'emo/e09.webp' },
    { i: 'e10', n: '유감이네요',         d: 'emo/e10.webp' },
    { i: 'e11', n: '탐사 갈까요?',       d: 'emo/e11.webp' },
    { i: 'e12', n: '망겜',            d: 'emo/e12.webp' },
    { i: 'e13', n: '저도 낄래요',        d: 'emo/e13.webp' },
    { i: 'e14', n: '토크쇼로 가시죠!!',    d: 'emo/e14.webp' },
    { i: 'e15', n: '매너가 없군요',       d: 'emo/e15.webp' },
    { i: 'e16', n: '반가워',           d: 'emo/e16.webp' },
    { i: 'e17', n: '물약 드세요!',       d: 'emo/e17.webp' },
    { i: 'e18', n: '우주 쇼핑몰 물건 팝니다', d: 'emo/e18.webp' },
    { i: 'e19', n: '왔냐? 임신ㄱ?ㅋㅋ',    d: 'emo/e19.webp' },
    { i: 'e20', n: '뭐.',            d: 'emo/e20.webp' },
    { i: 'e21', n: '또! 갇혔어…',       d: 'emo/e21.webp' },
    { i: 'e22', n: '밥! 먹었나여?',      d: 'emo/e22.webp' },
    { i: 'e23', n: '선녀탕 오시게?',      d: 'emo/e23.webp' },
    { i: 'e24', n: '도핑 챙겨 가는 중…',   d: 'emo/e24.webp' },
    { i: 'e25', n: '이딴게 꼴리냐?',      d: 'emo/e25.webp' },
    { i: 'e26', n: '일 가는 중~',       d: 'emo/e26.webp' },
    { i: 'e27', n: '시러 시러',         d: 'emo/e27.webp' },
    { i: 'e28', n: '배째여~',          d: 'emo/e28.webp' },
    { i: 'e29', n: '친구… 나를 잊었나요?',  d: 'emo/e29.webp' },
    { i: 'e30', n: '나만 믿어!',        d: 'emo/e30.webp' },
    { i: 'e31', n: '기다리다 지쳤어…',     d: 'emo/e31.webp' },
    { i: 'e32', n: '쇼비맙!',          d: 'emo/e32.webp' }
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
    d.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:0;'
        + ' width:100%; max-width:450px; max-height:46dvh; overflow-y:auto; z-index:9999999;'
        + ' background:var(--sk-panel, #141414); border-top:1px solid var(--sk-line, #444);'
        + ' border-radius:10px 10px 0 0;'
        + ' box-shadow:0 -6px 20px rgba(0,0,0,0.8); padding:10px 10px calc(10px + env(safe-area-inset-bottom)) 10px;'
        + ' -webkit-overflow-scrolling:touch;';
    d.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">'
        + '<span style="font-size:11px; color:var(--sk-text-dim, #aaa); font-weight:bold;">사내 이모티콘</span>'
        + '<button id="emo-close" style="background:none; border:1px solid var(--sk-line, #333);'
        + ' color:var(--sk-text-dim, #888);'
        + ' font-size:11px; padding:3px 9px; border-radius:4px; cursor:pointer;">닫기</button></div>'
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
        + '</div>';
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
