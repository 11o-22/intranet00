// ==========================================
// ★ 「이상한 나라의 ■■■」 — 입장 (2026-10-31)
// bundles.json 마지막 묶음 — wonder-core.js 다음
// ==========================================
//
//   · 인원 1~5.
//   · 하루 5번 — 이 어둠만의 횟수다. 다른 어둠의 「금일 탐사 횟수」는 쓰지도 막지도 않는다.
//       진짜 값은 wonderUse/{사번} = { d: 날짜, n: 들어간 수, k: [최근 판 열쇠] } 하나 (트랜잭션으로 +1).
//       파티는 파티 번호로 한 번만 센다(다시 붙어도 두 번 세지 않게).
//   · 동시 입장 제한 없음 — 이 구역은 점유 잠금(darkOccupancy)을 쓰지 않고, 파티가 여럿 있어도 막지 않는다.
//
//   일반 어둠은 손대지 않는다: 아래 감싸기는 전부 「구역이 이상한 나라일 때」만 다르게 움직인다.
//   (이어지는 어둠 — 빛을 찾아서 · 물고기가 인간이 되었다 · 피날레 · K의 방 · 검역 실패 · 동화의 뒷면 — 은
//    이상한 나라 안에서 따로 돌리는 연계판이고, 그 어둠에 그냥 들어가면 예전 그대로다.)
//
// ■ 콘솔
//   wonderTries()        오늘 남은 횟수
//   wonderTriesReset()   오늘 횟수 되돌리기 (관리자)

(function wonderEntry() {
'use strict';
const X = window.WONDER;
if (!X) return;
const W = X.CODE;
const DAY_MAX = 5;
const PEOPLE_MAX = 5;

if (typeof DARK_ZONES !== 'undefined' && DARK_ZONES[W]) { DARK_ZONES[W].min = 1; DARK_ZONES[W].max = PEOPLE_MAX; }

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function today() { try { return getTodayStr(); } catch (e) { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); } }
function alertMsg(m) { try { showCustomAlert(m); } catch (e) { console.log(m); } }

// ==========================================
// 하루 5번
// ==========================================
let use = null, useCode = null, useRef = null;
(function listen() {
    setInterval(function () {
        const u = me(), d = db_();
        if (!u || !d || useCode === u.code) return;
        if (useRef) { try { useRef.off(); } catch (e) { } }
        useCode = u.code;
        useRef = d.ref('wonderUse/' + u.code);
        useRef.on('value', function (s) { use = s.val(); });
    }, 500);
})();
function left() {
    const u = use || {};
    return (u.d === today()) ? Math.max(0, DAY_MAX - (u.n || 0)) : DAY_MAX;
}
X.triesLeft = left;
function countEntry(key) {
    const u = me(), d = db_();
    if (!u || !d) return;
    const t = today();
    // 화면 값도 바로 올린다 (서버 소식이 늦어도 다음 판정이 맞게)
    const cur = (use && use.d === t) ? use : { d: t, n: 0, k: [] };
    if (!(key && (cur.k || []).indexOf(key) >= 0)) use = { d: t, n: (cur.n || 0) + 1, k: (cur.k || []).concat(key ? [key] : []).slice(-10) };
    d.ref('wonderUse/' + u.code).transaction(function (c) {
        if (!c || c.d !== t) c = { d: t, n: 0, k: [] };
        c.k = c.k || [];
        if (key && c.k.indexOf(key) >= 0) return c;
        c.n = (c.n || 0) + 1;
        if (key) c.k = c.k.concat([key]).slice(-10);
        return c;
    });
}

// 이상한 나라로 들어가는 길에서만 「남은 횟수」를 이 어둠 것으로 바꿔 끼우고, 일반 횟수는 쓰지 않은 것으로 되돌린다
function asWonder(fn, self, args, after) {
    const u = me();
    const g = window.getDarkTriesLeft;
    const keepT = u ? u.darkTries : undefined, keepD = u ? u.darkDate : undefined;
    const before = (typeof darkRun !== 'undefined') ? darkRun : null;
    window.getDarkTriesLeft = function () { return left(); };
    let out;
    try { out = fn.apply(self, args); }
    finally {
        window.getDarkTriesLeft = g;
        if (u) { u.darkTries = keepT; u.darkDate = keepD; }
    }
    if (after) { try { after(before); } catch (e) { console.error(e); } }
    return out;
}
function zoneOfParty(pid) { try { return (darkParties[pid] || {}).zone; } catch (e) { return null; } }

function wrap(name, make) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        clearInterval(iv);
        const w = make(window[name]);
        w._wonderEntry = true;
        window[name] = w;
    }, 80);
}
wrap('createParty', function (_f) { return function (zone) { if (zone !== W) return _f.apply(this, arguments); return asWonder(_f, this, arguments); }; });
wrap('joinParty', function (_f) { return function (pid) { if (zoneOfParty(pid) !== W) return _f.apply(this, arguments); return asWonder(_f, this, arguments); }; });
wrap('openDarkBriefing', function (_f) { return function (zone) { if (zone !== W) return _f.apply(this, arguments); return asWonder(_f, this, arguments); }; });
wrap('startDarkRun', function (_f) {
    return function (zone) {
        if (zone !== W) return _f.apply(this, arguments);
        if (left() <= 0) { alertMsg('「이상한 나라의 ■■■」는 하루에 ' + DAY_MAX + '번까지 들어갈 수 있습니다.\n자정에 초기화됩니다.'); return; }
        return asWonder(_f, this, arguments, function (before) {
            if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W) countEntry('s' + Date.now());
        });
    };
});
wrap('launchPartyRun', function (_f) {
    return function (party) {
        if (!party || party.zone !== W) return _f.apply(this, arguments);
        return asWonder(_f, this, arguments, function (before) {
            if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W) countEntry('p' + party.id);
        });
    };
});

// ==========================================
// 동시 입장 제한 없음
// ==========================================
wrap('getZoneOccupant', function (_f) { return function (zone) { if (zone === W) return null; return _f.apply(this, arguments); }; });
wrap('occupyZone', function (_f) { return function (zone) { if (zone === W) return; return _f.apply(this, arguments); }; });
wrap('isZoneTaken', function (_f) { return function (zone) { if (zone === W) return false; return _f.apply(this, arguments); }; });

// ==========================================
// 목록 — 맨 위 보라색 「이벤트 어둠」 카드 (2026-10-31 사용자)
// ==========================================
//   원래 목록(renderDarkness)이 그린 이 어둠 칸은 걷어 내고, #darkness-body 맨 첫 자리에 따로 그린다.
//   EPIC · K의 방 입구가 뒤에 「afterbegin」으로 끼어들어도 다시 맨 위로 올린다.
const CARD = 'wonder-entry-card';
const PURPLE = { bg1: '#2c1745', bg2: '#170b26', line: '#9b6ad6', soft: '#c9a3f0', text: '#f1e6ff', dim: '#a993c6' };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function isOpen() { try { return typeof isZoneOpen !== 'function' || !!isZoneOpen(W); } catch (e) { return true; } }
function cardHtml() {
    const z = (typeof DARK_ZONES !== 'undefined' && DARK_ZONES[W]) || {};
    const open = isOpen();
    const n = left();
    const BTN = 'flex:1; margin:0; padding:11px; font-size:11px; background:linear-gradient(145deg,#7a4bb8,#4a2577) !important; border-color:' + PURPLE.line + ' !important; color:#fff !important;';
    return '<div id="' + CARD + '" style="background:linear-gradient(145deg,' + PURPLE.bg1 + ',' + PURPLE.bg2 + '); border:1px solid ' + PURPLE.line + '; border-radius:8px; padding:14px; margin-bottom:14px; text-align:left; box-shadow:0 0 16px rgba(155,106,214,0.28);' + (open ? '' : ' opacity:0.55;') + '">'
        + '<div style="display:flex; align-items:center; gap:7px; flex-wrap:wrap;">'
        + '<span style="font-size:9.5px; font-weight:bold; color:#1a0d29; background:' + PURPLE.soft + '; border-radius:10px; padding:2px 9px; letter-spacing:1px;">🦇 이벤트 어둠 🎃</span>'
        + '<span style="font-family:monospace; font-size:10px; color:' + PURPLE.soft + '; font-weight:bold;">' + W + '</span></div>'
        + '<div style="font-size:15px; color:' + PURPLE.text + '; font-weight:bold; margin:7px 0 3px;">' + esc(z.name || '이상한 나라의 ■■■') + '</div>'
        + '<div style="font-size:10px; color:' + PURPLE.dim + '; line-height:1.6;">' + esc(z.brief || '') + '</div>'
        + '<div style="font-size:10px; color:' + PURPLE.dim + '; margin-top:6px; line-height:1.6;">1~' + PEOPLE_MAX + '인 · 하루 ' + DAY_MAX + '번 (오늘 남은 <b id="wonder-card-left" style="color:' + PURPLE.text + ';">' + n + '</b> / ' + DAY_MAX + ') · 이곳에서는 어떤 장비도 통하지 않습니다</div>'
        + (open
            ? '<div style="display:flex; gap:6px; margin-top:11px;">'
                + '<button class="game-btn" style="' + BTN + '" onclick="openDarkBriefing(\'' + W + '\')">혼자 들어간다</button>'
                + '<button class="game-btn" style="' + BTN + '" onclick="createParty(\'' + W + '\')">파티 편성</button></div>'
            : '<div style="font-size:10px; color:#888; margin-top:10px; text-align:center;">🔒 지금은 닫혀 있습니다</div>')
        + '</div>';
}
// 원래 목록이 그린 칸 — 구역 번호 글자(monospace) → 세 칸 위가 카드
function dropBase(body) {
    const ds = body.querySelectorAll('div');
    for (let i = 0; i < ds.length; i++) {
        const d = ds[i];
        if (d.childElementCount || (d.textContent || '').trim() !== W) continue;
        if (d.closest('#' + CARD)) continue;
        if (!/monospace/.test(d.getAttribute('style') || '')) continue;
        const c = d.parentElement && d.parentElement.parentElement && d.parentElement.parentElement.parentElement;
        if (c && c !== body && body.contains(c) && c.style && c.style.marginBottom === '10px') c.remove();
    }
}
function listShown(body) {
    if (typeof darkRun !== 'undefined' && darkRun) return false;
    if (typeof darkBriefingOpen !== 'undefined' && darkBriefingOpen) return false;
    return !!body.querySelector('[onclick*="createParty("], [onclick*="openDarkBriefing("]');
}
function place() {
    const body = document.getElementById('darkness-body');
    if (!body || !me()) return;
    if (!listShown(body)) return;
    dropBase(body);
    let card = document.getElementById(CARD);
    if (!card) {
        body.insertAdjacentHTML('afterbegin', cardHtml());
        return;
    }
    if (body.firstElementChild !== card) body.insertBefore(card, body.firstChild);
    const l = document.getElementById('wonder-card-left');
    if (l && l.textContent !== String(left())) l.textContent = String(left());
}
wrap('renderDarkness', function (_f) {
    return function () {
        const out = _f.apply(this, arguments);
        try { const c = document.getElementById(CARD); if (c) c.remove(); place(); } catch (e) { console.warn('[이상한 나라] 목록 카드', e); }
        return out;
    };
});
setInterval(function () { try { place(); } catch (e) { } }, 700);
// 다른 입구(EPIC · K의 방)가 뒤늦게 맨 앞에 끼어들면 그 자리에서 다시 올린다 — 깜박이지 않게
(function keepTop() {
    const iv = setInterval(function () {
        const body = document.getElementById('darkness-body');
        if (!body || typeof MutationObserver === 'undefined') return;
        clearInterval(iv);
        new MutationObserver(function () {
            const c = document.getElementById(CARD);
            if (c && c.parentElement === body && body.firstElementChild !== c) body.insertBefore(c, body.firstChild);
        }).observe(body, { childList: true });
    }, 300);
})();

// ==========================================
// 🦇🎃 — 혼자 들어가든 파티를 편성하든, 이 어둠에 있는 동안 아래에서 비눗방울처럼 올라온다
// ==========================================
let briefW = false;      // 지금 열린 반입 화면이 이 어둠 것인가
wrap('openDarkBriefing', function (_f) { return function (zone) { briefW = (zone === W); return _f.apply(this, arguments); }; });
function inCtx() {
    try { if (X.inW && X.inW()) return true; } catch (e) { }
    try { const p = (typeof getMyParty === 'function') ? getMyParty() : null; if (p && p.zone === W) return true; } catch (e) { }
    try { if (briefW && typeof darkBriefingOpen !== 'undefined' && darkBriefingOpen) return true; } catch (e) { }
    return false;
}
const BUB = 'wonder-bubbles';
let bubT = null;
(function css() {
    if (document.getElementById('wonder-bub-css')) return;
    const st = document.createElement('style');
    st.id = 'wonder-bub-css';
    st.textContent = '#' + BUB + '{position:fixed;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:9998;overflow:hidden}'
        + '#' + BUB + ' span{position:absolute;bottom:-40px;font-size:20px;opacity:0;animation:wdRise 10s linear forwards;will-change:transform,opacity}'
        + '@keyframes wdRise{0%{opacity:0;transform:translateY(0) translateX(0)}12%{opacity:.55}70%{opacity:.4}100%{opacity:0;transform:translateY(-104vh) translateX(var(--wdx,0px))}}';
    document.head.appendChild(st);
})();
function bubbles(on) {
    let box = document.getElementById(BUB);
    if (!on) {
        if (bubT) { clearInterval(bubT); bubT = null; }
        if (box) box.remove();
        return;
    }
    if (!box) { box = document.createElement('div'); box.id = BUB; document.body.appendChild(box); }
    if (bubT) return;
    const pop = function () {
        const b = document.getElementById(BUB);
        if (!b || b.childElementCount > 8) return;
        const s = document.createElement('span');
        s.textContent = Math.random() < 0.5 ? '🦇' : '🎃';
        s.style.left = (6 + Math.random() * 88) + 'vw';
        s.style.fontSize = (15 + Math.random() * 11) + 'px';
        s.style.setProperty('--wdx', (Math.random() * 44 - 22) + 'px');
        s.style.animationDuration = (8 + Math.random() * 4) + 's';
        b.appendChild(s);
        setTimeout(function () { try { s.remove(); } catch (e) { } }, 13000);
    };
    pop();
    bubT = setInterval(pop, 1700);
}
setInterval(function () { try { bubbles(inCtx()); } catch (e) { } try { theme(inCtx()); } catch (e) { } }, 800);

// ==========================================
// 🎃 화면 — 이 어둠에 있는 동안 어두운 보라색 · 바탕에 🎃 가 넓게 깔린다 (2026-10-31 사용자)
// ==========================================
//   칠하는 것은 벽지(skin.js)의 기계를 빌린다 (토크쇼와 같은 길). applyUiSkin · clearUiSkin 을 감싸서,
//   켜져 있는 동안은 누가 벽지를 다시 칠하라고 해도 보라색을 칠한다. 끄면 원래 벽지(또는 소속 테마)로 돌아간다.
//   글꼴은 바꾸지 않는다.
const WSKIN = {
    palette: '이상한 나라', light: false,
    base: '#150a22', panel: '#22123a', accent: '#b98cf0', text: '#efe4ff',
    pattern: 0, font: 'Noto Serif KR', name: '이상한 나라의 ■■■', since: 0
};
const PK_BG = (function () {
    // 220 칸에 둘 — 엇갈려 놓아 줄이 져 보이지 않게, 크기 · 기울기를 조금씩 다르게
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">'
        + '<text x="34" y="66" font-size="30" opacity="0.3" transform="rotate(-10 49 56)">🎃</text>'
        + '<text x="142" y="176" font-size="24" opacity="0.24" transform="rotate(8 154 168)">🎃</text>'
        + '</svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
})();
// 사원 화면은 칸(#main-screen.solo)이 제 바탕을 따로 깔고, 그 안의 탭 · 하위 칸도 벽지 색으로 꽉 칠해진다.
//   🎃 바탕이 보이게 칸에 무늬를 깔고, 탭 · 하위 칸은 반쯤 비치게 한다 (벽지 규칙보다 세게 — 아이디 둘).
(function themeCss() {
    if (document.getElementById('wonder-theme-css')) return;
    const st = document.createElement('style');
    st.id = 'wonder-theme-css';
    st.textContent = ''
        + 'body.wonder-on #app-container #main-screen.solo{background:#150a22 ' + PK_BG + ' 0 0/220px 220px !important;}'
        + 'body.wonder-on #app-container #main-screen .tab-content.active{background-color:rgba(36,19,60,.28) !important;background-image:none !important;}'
        + 'body.wonder-on #app-container #main-screen .sub-panel.active{background-color:rgba(18,9,30,.12) !important;background-image:none !important;}'
        + 'body.wonder-on #shell-top{background:linear-gradient(180deg,rgba(21,10,34,.96),rgba(21,10,34,.72) 62%,rgba(21,10,34,0)) !important;}';
    document.head.appendChild(st);
})();
let themeOn = false, rawApply = null, rawClear = null;
(function hookSkin() {
    const iv = setInterval(function () {
        if (typeof window.applyUiSkin !== 'function' || typeof window.clearUiSkin !== 'function') return;
        if (window.applyUiSkin._wonder) { clearInterval(iv); return; }
        clearInterval(iv);
        rawApply = window.applyUiSkin; rawClear = window.clearUiSkin;
        const a = function () { if (themeOn) { paintPurple(); return; } return rawApply.apply(this, arguments); };
        const c = function () { if (themeOn) { paintPurple(); return; } return rawClear.apply(this, arguments); };
        a._wonder = true; c._wonder = true;
        window.applyUiSkin = a; window.clearUiSkin = c;
    }, 200);
})();
function paintPurple() {
    if (!rawApply) return;
    try { rawApply({ uiSkin: WSKIN }); } catch (e) { console.warn('[이상한 나라] 보라색 화면', e); }
    const body = document.body;
    body.style.removeProperty('font-family');            // 글꼴은 그대로
    body.style.setProperty('background-image', PK_BG, 'important');
    body.style.setProperty('background-size', '220px 220px', 'important');
    const cont = document.querySelector('.container');
    if (cont) {
        cont.style.setProperty('background-color', WSKIN.base, 'important');
        cont.style.setProperty('background-image', PK_BG, 'important');
        cont.style.setProperty('background-size', '220px 220px', 'important');
        cont.style.setProperty('background-position', '0 0', 'important');
    }
}
const WKEY = WSKIN.since + '|' + WSKIN.accent + '|' + WSKIN.base;     // skin.js 가 body.dataset.uiSkin 에 적는 값
function theme(on) {
    on = !!on;
    if (!rawApply) return;
    const body = document.body;
    if (on === themeOn) {
        // 켜져 있는 동안 — 소속 테마가 body 의 class 를 통째로 갈아 끼우거나(「테마 초기화」) 벽지가 바뀌면 다시 입힌다
        if (on) {
            if (!body.classList.contains('wonder-on')) body.classList.add('wonder-on');
            if (body.dataset.uiSkin !== WKEY) paintPurple();
        }
        return;
    }
    themeOn = on;
    if (on) {
        body.classList.add('wonder-on');
        paintPurple();
    } else {
        body.classList.remove('wonder-on');
        ['background-image', 'background-size'].forEach(function (k) { body.style.removeProperty(k); });
        // 원래대로 — 벽지가 있으면 그 벽지, 없으면 소속 · 커플 테마
        try { rawClear(currentUser); } catch (e) { }
        try { if (currentUser && currentUser.uiSkin) rawApply(currentUser); } catch (e) { }
    }
}
window.wonderThemeOn = function () { return themeOn; };

// ==========================================
// 콘솔
// ==========================================
window.wonderTries =function () { console.log('이상한 나라 — 오늘 남은 횟수', left() + ' / ' + DAY_MAX, use); return left(); };
window.wonderTriesReset = function () {
    const u = me(), d = db_();
    if (!u || u.code !== 'kario0987') { console.log('관리자만'); return; }
    use = { d: today(), n: 0, k: [] };
    if (d) d.ref('wonderUse/' + u.code).set(use);
    console.log('오늘 횟수를 되돌렸습니다.');
};

console.log('[이상한 나라] 입장 — 1~' + PEOPLE_MAX + '인 · 하루 ' + DAY_MAX + '번 · 동시 입장 허용');
})();
