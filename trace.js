// ==========================================
// ★ 🫧 흔적 — 상담사가 붙이는 칭호 (2026-10-24)
// bundles.json 마지막 묶음 맨 끝 — titles.js · eye.js · chilseong.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//
//   titles.js 의 상담사 칭호 「흔적」(그림 🫧). **달고 있을 때만** 듣는다 (이레귤러 · 전설과 같다).
//
//   ① 파티 어둠 솔플   최소 인원이 둘 이상인 구역(S · A · B-330 · B-508 · C-119 …)에도 혼자 들어간다.
//                      흔적을 단 사람이 **혼자** 방에 있을 때만 최소 인원이 1인 (둘 이상이면 원래 인원을 채워야 한다).
//   ② 감지하는 눈 솔플  혼자 든 탐사에서 눈을 나에게 연다 — 버프 하나 · 살아 나오면 ×3 (eye.js 가 window.traceSolo 를 본다)
//   ③ 솔플 생존        혼자 든 탐사(어둠 · EPIC · K의 방)에서 판정 +3 · 즉사를 한 판에 한 번 버틴다
//
//   「혼자 든 탐사」 = 처음 들어간 인원이 나 하나 (1인 파티 · 혼자 들어가는 구역 · EPIC 혼자 · K의 방 혼자).
//   인원은 칠성(chilseong.js)이 판을 열 때 세어 둔 것을 쓴다 (chilRunSize).
//
// ■ 콘솔
//   traceState()

(function traceTitle() {
'use strict';

const TR = {
    NAME: '흔적',
    MARK: '🫧',
    BON: 3,          // 혼자 든 탐사 — 판정 +3
    GUARD: 1         // 혼자 든 탐사 — 즉사를 버티는 횟수 (한 판)
};

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function userOf(c) { try { return (typeof db !== 'undefined' && db.users) ? db.users[c] : null; } catch (e) { return null; } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }

// 달고 있나 — 가진 것(titleAdmin)이면서 단 것(titleOn)
function on(u) {
    u = u || me();
    return !!(u && u.titleOn === TR.NAME && Array.isArray(u.titleAdmin) && u.titleAdmin.indexOf(TR.NAME) >= 0);
}
window._trace = on;

// 이번 판에 처음 들어간 인원
function size() {
    try { if (typeof window.chilRunSize === 'function') return Number(window.chilRunSize()) || 1; } catch (e) { }
    const r = run();
    return r ? (Number(r.memberCount) || 1) : 0;
}
// 흔적을 달고 혼자 든 탐사인가
function solo() {
    const r = run();
    return !!(r && on() && size() <= 1);
}
window.traceSolo = solo;

// ==========================================
// ① 파티 어둠 솔플 — 혼자 방에 있으면 최소 인원 1인
// ==========================================
//   칠성 거문 · 아기 여우 분신과 같은 자리 — 방을 그릴 때(출발 단추)와 출발할 때(launchParty)만
//   잠깐 z.min 을 낮췄다가 되돌린다.
function aloneWearer(p) {
    try {
        if (!p || !p.members) return false;
        const ks = Object.keys(p.members);
        if (ks.length !== 1) return false;
        const u = (me() && me().code === ks[0]) ? me() : userOf(ks[0]);
        return on(u);
    } catch (e) { return false; }
}
(function hookRoom() {
    const iv = setInterval(function () {
        if (typeof renderPartyRoom !== 'function' || typeof launchParty !== 'function' || typeof DARK_ZONES === 'undefined') return;
        if (renderPartyRoom._trace && launchParty._trace) { clearInterval(iv); return; }
        if (!renderPartyRoom._trace) {
            const _r = renderPartyRoom;
            const w = function (p) {
                let z = null, min0 = null;
                try { if (p && DARK_ZONES[p.zone] && aloneWearer(p)) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; } } catch (e) { }
                try { return _r.apply(this, arguments); } finally { if (z && min0 != null) z.min = min0; }
            };
            w._trace = true;
            renderPartyRoom = w; window.renderPartyRoom = w;
        }
        if (!launchParty._trace) {
            const _l = launchParty;
            const w2 = function () {
                let z = null, min0 = null;
                try {
                    const p = (typeof getMyParty === 'function') ? getMyParty() : null;
                    if (p && DARK_ZONES[p.zone] && aloneWearer(p)) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; }
                } catch (e) { }
                try { return _l.apply(this, arguments); } finally { if (z && min0 != null) z.min = min0; }
            };
            w2._trace = true;
            launchParty = w2; window.launchParty = w2;
        }
        clearInterval(iv);
        console.log('[흔적] 파티 어둠 솔플 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ③ 솔플 생존 — 판정 +3
// ==========================================
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._trace) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        const w = function () {
            let b = _r.apply(this, arguments);
            try { if (solo()) b += TR.BON; } catch (e) { }
            return b;
        };
        w._trace = true;
        rollDarkBonus = w; window.rollDarkBonus = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ③ 솔플 생존 — 즉사를 한 번 버틴다 (어둠 · EPIC · K의 방)
// ==========================================
//   판(darkRun)에 쓴 횟수를 적는다. EPIC · K의 방은 들어갈 때 darkRun 을 새로 만드니 판마다 새로 센다.
function guard(reasonText, nextFn) {
    const u = me(), r = run();
    if (!u || !r || !solo()) return false;
    if ((r._traceGuard || 0) >= TR.GUARD) return false;
    r._traceGuard = (r._traceGuard || 0) + 1;
    r.fail = Math.max(0, (r.fail || 0) - 1);
    try { r.log.push('[' + TR.MARK + ' 흔적] 즉사를 버팀'); } catch (e) { }
    log_(u, '[' + TR.MARK + ' 흔적] 혼자 든 탐사에서 즉사를 한 번 버텼습니다.');
    try {
        darkBodyEl().innerHTML = darkBox('—', String(reasonText || '') + '<br><br><span style="color:#9fe3ff;">— 그 자리에 물방울 하나가 터진다. ' + TR.MARK + '<br>'
            + '남은 것은 흔적뿐이다. 당신은 이미 한 걸음 옆에 있다.</span>', darkChoiceBtn('숨을 고른다.', nextFn));
        if (r.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
    return true;
}
// 어둠 — darkDeath (EPIC · K의 방은 아래 각자의 자리에서)
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._trace) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            const r = run();
            if (r && !r._dead && !r.epic && !r.kroom && guard(reasonText, 'renderDarkStep();')) return;
            return _d.apply(this, arguments);
        };
        w._trace = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
        console.log('[흔적] 즉사 버팀 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// EPIC — epicDeath
(function hookEpicDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._trace) { clearInterval(iv); return; }
        const _d = epicDeath;
        const w = function (txt) {
            let E = null; try { E = er; } catch (e) { }
            if (E && !E.dead && guard(txt, 'epicMap()')) return;
            return _d.apply(this, arguments);
        };
        w._trace = true;
        epicDeath = w; window.epicDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// K의 방 — kroomDie
(function hookKDie() {
    const iv = setInterval(function () {
        if (typeof window.kroomDie !== 'function' || !window.KROOM) return;
        if (window.kroomDie._trace) { clearInterval(iv); return; }
        const _d = window.kroomDie;
        const w = function (text) {
            const kr = window.KROOM.state();
            if (kr && !kr.dead && !kr._settled) {
                const why = (typeof text === 'string' && text) || (kr._doomCfg && kr._doomCfg.dieText) || '거기서 끝났다.';
                if (guard(why, 'kroomNext()')) {
                    try { if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; } } catch (e) { }
                    if (kr.down) { kr.down = false; if (kr.stats && kr.stats.hp <= 0) kr.stats.hp = 20; }
                    return;
                }
            }
            return _d.apply(this, arguments);
        };
        w._trace = true;
        window.kroomDie = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 콘솔
// ==========================================
window.traceState = function () {
    const u = me(), r = run();
    console.log('%c===== ' + TR.MARK + ' 흔적 =====', 'color:#9fe3ff; font-size:13px');
    console.log({
        가졌나: !!(u && (u.titleAdmin || []).indexOf(TR.NAME) >= 0),
        달았나: on(u),
        탐사중: !!r,
        인원: r ? size() : null,
        혼자: solo(),
        즉사버팀: r ? ((r._traceGuard || 0) + ' / ' + TR.GUARD) : null
    });
};

})();
