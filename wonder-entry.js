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
//   · 부탁(미션)을 받으면 「이들의 부탁을 들어 주러 간다.」 로 이 어둠을 나간다 (2026-10-31 사용자).
//     어둠 목록에서 그 연계 어둠 칸이 나에게만 보라색 「이상한 나라의 부탁」 칸으로 바뀌고,
//     거기서 혼자 들어가거나(혼자 받은 부탁) 파티를 편성하면(함께 받은 부탁) 받아 둔 부탁에서 이어진다.
//     속은 이 어둠(구역 W)으로 돌린다 — 그 어둠의 방 수 · 정원 · 다른 팀 진행과 상관없이 들어가고, 횟수도 쓰지 않는다.
//     부탁이 남아 있는 동안 이상한 나라에는 새로 들어가지 않는다 (그 칸의 「부탁을 포기한다」로 실패 처리 가능).
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
//   link 면 부탁을 들어 주러 연계 어둠으로 들어가는 길 — 이상한 나라 횟수도 일반 횟수도 쓰지 않는다
function asWonder(fn, self, args, after, link) {
    const u = me();
    const g = window.getDarkTriesLeft;
    const keepT = u ? u.darkTries : undefined, keepD = u ? u.darkDate : undefined;
    const before = (typeof darkRun !== 'undefined') ? darkRun : null;
    window.getDarkTriesLeft = function () { return link ? 99 : left(); };
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
function partyOf(pid) { try { return darkParties[pid] || null; } catch (e) { return null; } }

function wrap(name, make) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        clearInterval(iv);
        const w = make(window[name]);
        w._wonderEntry = true;
        window[name] = w;
    }, 80);
}

// ==========================================
// 부탁 표 (wonder-core.js) — 받아 둔 부탁이 있으면 이상한 나라 대신 그 연계 어둠으로
// ==========================================
let linkArm = null;            // 보라색 칸에서 누른 표 — 다음 한 번의 입장이 「부탁을 들어 주러」 가는 길
function tk() { try { return X.ticket ? X.ticket() : null; } catch (e) { return null; } }
function clone(o) { try { return JSON.parse(JSON.stringify(o)); } catch (e) { return null; } }
function zoneName(z) { try { return (DARK_ZONES[z] && DARK_ZONES[z].name) || z; } catch (e) { return z; } }
function pendingMsg(t) {
    return '🎃 이상한 나라에서 받아 둔 부탁이 있습니다.\n「' + (t.misName || '') + '」\n\n어둠 탐사 목록에서 보라색으로 바뀐 【' + zoneName(t.zone) + '】(으)로 들어가십시오.\n(그만두려면 그 칸의 「부탁을 포기한다」)';
}

wrap('createParty', function (_f) {
    return function (zone) {
        if (zone !== W) return _f.apply(this, arguments);
        const t = tk();
        if (linkArm && t) {
            const arm = linkArm; linkArm = null;
            const out = asWonder(_f, this, arguments, null, true);
            try {
                if (typeof myPartyId !== 'undefined' && myPartyId && darkParties[myPartyId] && darkParties[myPartyId].zone === W) {
                    const mark = { pid: arm.pid, zone: arm.zone, ch: arm.ch, mis: arm.mis || '', misName: arm.misName || '', linkName: arm.linkName || '' };
                    darkParties[myPartyId].wonderGo = mark;
                    const d = db_(); if (d) d.ref('darkParties/' + myPartyId + '/wonderGo').set(mark);
                    try { renderPartyPanel(); } catch (e) { }
                }
            } catch (e) { }
            return out;
        }
        if (t) { alertMsg(pendingMsg(t)); return; }
        return asWonder(_f, this, arguments);
    };
});
wrap('joinParty', function (_f) {
    return function (pid) {
        if (zoneOfParty(pid) !== W) return _f.apply(this, arguments);
        const p = partyOf(pid), t = tk();
        if (p && p.wonderGo) {
            if (!t || t.pid !== p.wonderGo.pid) { alertMsg('🎃 이상한 나라에서 같은 부탁을 함께 받은 사원만 들어올 수 있는 파티입니다.'); return; }
            return asWonder(_f, this, arguments, null, true);
        }
        if (t) { alertMsg(pendingMsg(t)); return; }
        return asWonder(_f, this, arguments);
    };
});
wrap('openDarkBriefing', function (_f) {
    return function (zone) {
        if (zone !== W) { linkArm = null; return _f.apply(this, arguments); }
        const t = tk();
        if (linkArm && t) {
            const out = asWonder(_f, this, arguments, null, true);
            try { dressBrief(t); } catch (e) { }
            try { keepLine(); } catch (e) { }
            return out;
        }
        if (t) { alertMsg(pendingMsg(t)); return; }
        const out = asWonder(_f, this, arguments);
        try { keepLine(); } catch (e) { }
        return out;
    };
});
// 반입 화면의 초록 줄 — 「본 구역은 D등급으로, 사망 시 재산 소멸 규정이 적용되지 않습니다.」 대신 (2026-10-31 사용자)
const KEEP_LINE = '해당 어둠 내에서 얻은 재산은 사망 시 소실되지 않습니다.';
function keepLine() {
    const body = document.getElementById('darkness-body');
    if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll('span'), function (sp) {
        if (/재산 소멸 규정이 적용되지 않습니다/.test(sp.textContent || '')) sp.textContent = KEEP_LINE;
    });
}
wrap('startDarkRun', function (_f) {
    return function (zone) {
        if (zone !== W) return _f.apply(this, arguments);
        const t = tk();
        if (linkArm && t) {
            linkArm = null;
            X._armed = clone(t);                 // 탐사가 그려지기 전에 wonder-core 의 begin 이 받는다
            return asWonder(_f, this, arguments, function (before) {
                if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W && !darkRun.wonderLink) darkRun.wonderLink = clone(t);
                X._armed = null;
            }, true);
        }
        if (t) { alertMsg(pendingMsg(t)); return; }
        if (left() <= 0) { alertMsg('「이상한 나라의 ■■■」는 하루에 ' + DAY_MAX + '번까지 들어갈 수 있습니다.\n자정에 초기화됩니다.'); return; }
        return asWonder(_f, this, arguments, function (before) {
            if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W) countEntry('s' + Date.now());
        });
    };
});
wrap('launchPartyRun', function (_f) {
    return function (party) {
        if (!party || party.zone !== W) return _f.apply(this, arguments);
        if (party.wonderGo) {
            const t = tk();
            if (!t || t.pid !== party.wonderGo.pid) return;      // 같은 부탁을 쥔 사람만 (들어올 때 이미 막는다)
            X._armed = clone(t);
            return asWonder(_f, this, arguments, function (before) {
                if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W && !darkRun.wonderLink) darkRun.wonderLink = clone(t);
                X._armed = null;
            }, true);
        }
        return asWonder(_f, this, arguments, function (before) {
            if (!before && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W) countEntry('p' + party.id);
        });
    };
});
// 반입 화면 — 이상한 나라 대신 그 연계 어둠의 이름으로 보이게
function dressBrief(t) {
    const body = document.getElementById('darkness-body');
    if (!body) return;
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
        if (n.nodeValue.trim() === W) n.nodeValue = n.nodeValue.replace(W, t.zone);
        else if (n.nodeValue.trim() === '(Eat me.)') { try { n.nodeValue = DARK_ZONES[t.zone].brief || n.nodeValue; } catch (e) { } }
        else if (n.nodeValue.indexOf('이상한 나라의 ■■■') >= 0) n.nodeValue = n.nodeValue.replace('이상한 나라의 ■■■', zoneName(t.zone));
    });
    const box = body.querySelector('div[style*="border-radius:6px"]');
    if (box && !document.getElementById('wonder-link-note')) {
        box.insertAdjacentHTML('beforebegin', '<div id="wonder-link-note" style="background:linear-gradient(145deg,#2c1745,#170b26); border:1px solid #9b6ad6; border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:11px; line-height:1.7; color:#efe4ff;">'
            + '🎃 <b>이상한 나라의 부탁</b> — 「' + esc(t.misName || '') + '」<br><span style="color:#a993c6; font-size:10px;">들어가면 이상한 나라에서 받은 부탁이 이어집니다. 탐사 횟수를 쓰지 않습니다.</span></div>');
    }
}
// 파티 대기실 — 부탁 파티는 그 연계 어둠의 이름으로
wrap('renderPartyPanel', function (_f) {
    return function () {
        const out = _f.apply(this, arguments);
        try {
            const p = (typeof getMyParty === 'function') ? getMyParty() : null;
            if (p && p.wonderGo) {
                const host = document.getElementById('dark-party') || document.body;
                const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
                const nodes = [];
                while (walker.nextNode()) nodes.push(walker.currentNode);
                nodes.forEach(function (n) {
                    if (n.nodeValue.indexOf(W) >= 0) n.nodeValue = n.nodeValue.split(W).join(p.wonderGo.zone);
                    if (n.nodeValue.indexOf('이상한 나라의 ■■■') >= 0) n.nodeValue = n.nodeValue.split('이상한 나라의 ■■■').join(zoneName(p.wonderGo.zone) + ' — 🎃 「' + (p.wonderGo.misName || '') + '」');
                    if (n.nodeValue.trim() === '(Eat me.)') { try { n.nodeValue = DARK_ZONES[p.wonderGo.zone].brief || n.nodeValue; } catch (e) { } }
                });
            }
        } catch (e) { }
        return out;
    };
});

// 보라색 칸의 단추
window.wonderLinkSolo = function () {
    const t = tk(); if (!t) return;
    if (t.team) { alertMsg('🎃 함께 받은 부탁입니다. 「파티 편성」으로 동료들과 들어가십시오.'); return; }
    linkArm = t;
    openDarkBriefing(W);
};
window.wonderLinkParty = function () {
    const t = tk(); if (!t) return;
    // 같은 부탁을 받은 동료가 이미 꾸린 파티가 있으면 그리로
    try {
        const ids = Object.keys(darkParties || {});
        for (let i = 0; i < ids.length; i++) {
            const p = darkParties[ids[i]];
            if (p && p.zone === W && p.wonderGo && p.wonderGo.pid === t.pid && p.state === 'RECRUIT') return joinParty(ids[i]);
        }
    } catch (e) { }
    linkArm = t;
    createParty(W);
    linkArm = null;
};
window.wonderLinkGiveUp = function () {
    const t = tk(); if (!t) return;
    const go = function () {
        try { X.abandon(); } catch (e) { console.error(e); }
        try { renderDarkness(); } catch (e) { }
        alertMsg('부탁을 포기했습니다.\n「' + (t.misName || '') + '」 — 실패로 넘기고, 이상한 나라에 다시 들어가면 다음 챕터부터 이어집니다.');
    };
    try { if (typeof showCustomConfirm === 'function') { showCustomConfirm('「' + (t.misName || '') + '」 부탁을 포기하겠습니까?\n이 챕터는 실패로 넘어갑니다.', go); return; } } catch (e) { }
    if (window.confirm('「' + (t.misName || '') + '」 부탁을 포기하겠습니까?\n이 챕터는 실패로 넘어갑니다.')) go();
};

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
        + (tk()
            ? '<div style="font-size:10.5px; color:' + PURPLE.text + '; margin-top:10px; padding:9px 10px; border:1px dashed ' + PURPLE.line + '; border-radius:6px; line-height:1.7;">🎃 받아 둔 부탁 — 「' + esc(tk().misName || '') + '」<br><span style="color:' + PURPLE.dim + ';">보라색으로 바뀐 【' + esc(zoneName(tk().zone)) + '】(으)로 들어가면 이어집니다.</span></div>'
            : open
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
// ── 부탁을 받은 연계 어둠 — 그 칸을 보라색 「부탁」 칸으로 바꿔 그린다 (나에게만)
const LCARD = 'wonder-link-card';
function baseCardOf(body, zone) {
    if (zone === 'Qtrew-???-999') return document.getElementById('kroom-entry');
    const ds = body.querySelectorAll('div');
    for (let i = 0; i < ds.length; i++) {
        const d = ds[i];
        if (d.childElementCount || (d.textContent || '').trim() !== zone) continue;
        if (d.closest('#' + LCARD) || d.closest('#' + CARD)) continue;
        if (!/monospace/.test(d.getAttribute('style') || '')) continue;
        const c = d.parentElement && d.parentElement.parentElement && d.parentElement.parentElement.parentElement;
        if (c && c !== body && body.contains(c)) return c;
    }
    return null;
}
function linkCardHtml(t) {
    const z = (typeof DARK_ZONES !== 'undefined' && DARK_ZONES[t.zone]) || {};
    const BTN = 'flex:1; margin:0; padding:11px; font-size:11px; background:linear-gradient(145deg,#7a4bb8,#4a2577) !important; border-color:' + PURPLE.line + ' !important; color:#fff !important;';
    return '<div id="' + LCARD + '" data-k="' + esc(t.pid + '|' + t.rid + '|' + t.idx) + '" style="background:linear-gradient(145deg,' + PURPLE.bg1 + ',' + PURPLE.bg2 + '); border:1px solid ' + PURPLE.line + '; border-radius:8px; padding:14px; margin-bottom:10px; text-align:left; box-shadow:0 0 16px rgba(155,106,214,0.28);">'
        + '<div style="display:flex; align-items:center; gap:7px; flex-wrap:wrap;">'
        + '<span style="font-size:9.5px; font-weight:bold; color:#1a0d29; background:' + PURPLE.soft + '; border-radius:10px; padding:2px 9px; letter-spacing:1px;">🎃 이상한 나라의 부탁</span>'
        + '<span style="font-family:monospace; font-size:10px; color:' + PURPLE.soft + '; font-weight:bold;">' + esc(t.zone) + '</span></div>'
        + '<div style="font-size:14px; color:' + PURPLE.text + '; font-weight:bold; margin:7px 0 3px;">' + esc(z.name || t.linkName || '') + '</div>'
        + '<div style="font-size:10px; color:' + PURPLE.dim + '; line-height:1.6;">' + esc(z.brief || '') + '</div>'
        + '<div style="font-size:11px; color:' + PURPLE.text + '; margin-top:8px; line-height:1.7;">「' + esc(t.misName || '') + '」 — ' + (t.team ? '함께 받은 부탁' : '혼자 받은 부탁') + '</div>'
        + '<div style="font-size:10px; color:' + PURPLE.dim + '; margin-top:3px; line-height:1.6;">들어가면 이상한 나라에서 이어집니다 · 다른 팀 진행 · 방 수와 상관없이 들어갑니다 · 탐사 횟수를 쓰지 않습니다</div>'
        + '<div style="display:flex; gap:6px; margin-top:11px;">'
        + (t.team
            ? '<button class="game-btn" style="' + BTN + '" onclick="wonderLinkParty()">파티 편성</button>'
            : '<button class="game-btn" style="' + BTN + '" onclick="wonderLinkSolo()">혼자 들어간다</button>')
        + '</div>'
        + '<div style="text-align:right; margin-top:7px;"><button class="game-btn" style="margin:0; padding:5px 9px; font-size:9.5px; background:transparent !important; border-color:#4a2f6e !important; color:#8f7aac !important;" onclick="wonderLinkGiveUp()">부탁을 포기한다</button></div>'
        + '</div>';
}
function paintLink(body) {
    const t = tk();
    let card = document.getElementById(LCARD);
    // 감춰 둔 원래 칸 — 표가 없어졌거나 다른 어둠이면 되돌린다
    Array.prototype.forEach.call(body.querySelectorAll('[data-wonder-hid]'), function (e) {
        if (!t || e.getAttribute('data-wonder-hid') !== t.zone) { e.style.display = ''; e.removeAttribute('data-wonder-hid'); }
    });
    if (!t) { if (card) card.remove(); return; }
    const key = t.pid + '|' + t.rid + '|' + t.idx;
    if (card && card.getAttribute('data-k') !== key) { card.remove(); card = null; }
    const base = baseCardOf(body, t.zone);
    if (base && base.style.display !== 'none') { base.style.display = 'none'; base.setAttribute('data-wonder-hid', t.zone); }
    if (!card) {
        if (base) base.insertAdjacentHTML('beforebegin', linkCardHtml(t));
        else {
            const w = document.getElementById(CARD);
            if (w) w.insertAdjacentHTML('afterend', linkCardHtml(t));
            else body.insertAdjacentHTML('afterbegin', linkCardHtml(t));
        }
    } else if (base && card.nextElementSibling !== base) {
        base.parentElement.insertBefore(card, base);
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
    try { paintLink(body); } catch (e) { console.warn('[이상한 나라] 부탁 칸', e); }
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
        linkArm = null;
        const out = _f.apply(this, arguments);
        try { const c = document.getElementById(CARD); if (c) c.remove(); const l = document.getElementById(LCARD); if (l) l.remove(); place(); } catch (e) { console.warn('[이상한 나라] 목록 카드', e); }
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
