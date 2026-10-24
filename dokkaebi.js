// ==========================================
// ★ 🔥 도깨비 불 — 다시 짠 것 (2026-10-24)
// bundles.json 마지막 묶음 맨 끝 — newitems.js · dokkaebi-fix.js · chilseong.js · trace.js 보다 뒤
// ==========================================
//
// ■ 사용자가 정한 것 (설명에는 「길을 밝히는 장난꾸러기 불」 한 줄만 — 아래는 화면에 쓰지 않는다)
//
//   · 물약 상쇄(남이 거는 물약을 태우던 것) — 없앴다 (dokkaebi-fix.js · newitems.js)
//   · 판정 +2
//   · 그날 **세 번째로 남을 구해 내면** 「도깨비의 가호」 — 12시간 무적
//       어둠 · EPIC · K의 방에서 쓰러지지 않는다 · 오염도가 오르지 않는다 (재난 — 기록 소실은 빼고)
//   · 가호가 끝나면 12시간 동안 도깨비 불이 **아무 효과도 없다** (쿨타임 — 행운 · 판정 · 갈림길 표시까지)
//   · 쿨타임이 끝나는 때 200,000 P 가 들어온다 (그때 화면이 꺼져 있었으면 다음에 들어올 때)
//   · 값 2,500,000 P · 복사기로 못 베낀다 (spaceitems.js NO_COPY)
//   · K의 방은 쇼핑몰 물건 효과를 빼고 세는데, 도깨비 불만은 든다 (kroom-core.js)
//
// ■ 적히는 자리 — users/<사번>/dok = { day, n, on, cd, paid }
//     day · n   그날 남을 구한 수 (날이 바뀌면 0)
//     on        가호가 끝나는 때 · cd 쿨타임이 끝나는 때 (on + 12시간) · paid 20만 P 를 준 쿨타임(cd 값)
//
// ■ 남을 구했다는 신호 — window.dokRescued(어디서)
//     어둠 attemptRescue 성공 (dark.js) · EPIC 붙잡기 · 끌어내기 (epic.js · epic-core2.js)
//     K의 방 끌어내기 · 치유로 일으키기 (kroom-core.js) · 🌟 파군으로 구한 것 (chilseong.js)
//
// ■ 콘솔
//   dokNow(사번)        지금 상태
//   dokSet(사번, 칸, 값) 상담사 — n · on · cd 손보기 (예: dokSet('5345', 'cd', 0))

(function dokkaebi() {
'use strict';

const DOK = {
    NAME: '도깨비 불',
    PRICE: 2500000,
    DESC: '길을 밝히는 장난꾸러기 불',
    BON: 2,                       // 판정 +2
    NEED: 3,                      // 그날 몇 번째 구출에서 가호가 켜지나
    ON_MS: 12 * 3600 * 1000,      // 가호 — 무적
    CD_MS: 12 * 3600 * 1000,      // 그 뒤 쿨타임 — 효과 없음
    PAY: 200000                   // 쿨타임이 끝날 때
};
window.DOK_CFG = DOK;
const ADMIN = 'kario0987';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function now() { return Date.now(); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function toast(t) { try { if (typeof showDarkToast === 'function' && run()) { showDarkToast(t); return; } } catch (e) { } try { showCustomAlert(t); } catch (e) { } }
function base(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }

// 차고 있나 — 장착칸 그대로 본다 (쿨타임 · K의 방 가림과 상관없이)
function wears(u) {
    return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return base(w) === DOK.NAME; }));
}
function st(u) {
    if (!u.dok || typeof u.dok !== 'object') u.dok = {};
    if (u.dok.day !== today()) { u.dok.day = today(); u.dok.n = 0; }
    return u.dok;
}
function guarded(u) { return !!(u && u.dok && Number(u.dok.on) > now()); }                     // 가호 중
function cooling(u) { return !!(u && u.dok && Number(u.dok.on) <= now() && Number(u.dok.cd) > now()); }   // 쿨타임
// 효과가 도나 — 차고 있고 쿨타임이 아니다 (다른 파일들이 이것을 본다)
function on(u) { u = u || me(); return wears(u) && !cooling(u); }
window.dokOn = on;
window.dokGuarded = function (u) { u = u || me(); return wears(u) && guarded(u); };

// ==========================================
// 목록 — 값 · 설명 (그 밖은 newitems.js 그대로)
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[DOK.NAME]) return;
        const c = ITEM_CATALOG[DOK.NAME];
        c.price = DOK.PRICE;
        c.desc = DOK.DESC;
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 판정 +2
// ==========================================
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._dok) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        const w = function () {
            let b = _r.apply(this, arguments);
            try { if (on(me())) b += DOK.BON; } catch (e) { }
            return b;
        };
        w._dok = true;
        rollDarkBonus = w; window.rollDarkBonus = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 남을 구했다 — 그날 세 번째면 가호
// ==========================================
window.dokRescued = function (where) {
    const u = me();
    if (!u || !wears(u)) return;
    if (guarded(u) || cooling(u)) return;              // 가호 · 쿨타임 동안은 세지 않는다
    const s = st(u);
    s.n = (Number(s.n) || 0) + 1;
    if (s.n >= DOK.NEED) {
        const t = now();
        s.on = t + DOK.ON_MS;
        s.cd = s.on + DOK.CD_MS;
        s.paid = 0;
        s.n = 0;
        log_(u, '[' + DOK.NAME + '] 도깨비의 가호');
        setTimeout(function () { toast('🔥 도깨비가 웃는다. — 도깨비의 가호가 깃듭니다.'); }, 900);
    }
    save({ dok: 1, history: 1 });
};

// ==========================================
// 가호 — 쓰러지지 않는다 (어둠 · EPIC · K의 방 · 재난은 빼고)
// ==========================================
const LINE = '<br><br><span style="color:#ff9e5e;">— 불씨 하나가 앞을 가로막는다. 깔깔 웃는 소리가 난다.<br>도깨비의 가호다. 아무것도 닿지 않았다.</span>';
function block(reasonText, nextFn) {
    const u = me(), r = run();
    if (!u || !r || !wears(u) || !guarded(u)) return false;
    r.fail = Math.max(0, (r.fail || 0) - 1);
    try { r.log.push('[🔥 도깨비의 가호] 쓰러지지 않음'); } catch (e) { }
    try {
        darkBodyEl().innerHTML = darkBox('—', String(reasonText || '') + LINE, darkChoiceBtn('숨을 고른다.', nextFn));
        if (r.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
    return true;
}
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._dok) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            const r = run();
            if (r && !r._dead && !r.epic && !r.kroom && block(reasonText, 'renderDarkStep();')) return;
            return _d.apply(this, arguments);
        };
        w._dok = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookEpicDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._dok) { clearInterval(iv); return; }
        const _d = epicDeath;
        const w = function (txt) {
            let E = null; try { E = er; } catch (e) { }
            if (E && !E.dead && block(txt, 'epicMap()')) return;
            return _d.apply(this, arguments);
        };
        w._dok = true;
        epicDeath = w; window.epicDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookKDie() {
    const iv = setInterval(function () {
        if (typeof window.kroomDie !== 'function' || !window.KROOM) return;
        if (window.kroomDie._dok) { clearInterval(iv); return; }
        const _d = window.kroomDie;
        const w = function (text) {
            const kr = window.KROOM.state();
            if (kr && !kr.dead && !kr._settled) {
                const why = (typeof text === 'string' && text) || (kr._doomCfg && kr._doomCfg.dieText) || '거기서 끝났다.';
                if (block(why, 'kroomNext()')) {
                    try { if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; } } catch (e) { }
                    if (kr.down) { kr.down = false; if (kr.stats && kr.stats.hp <= 0) kr.stats.hp = 20; }
                    return;
                }
            }
            return _d.apply(this, arguments);
        };
        w._dok = true;
        window.kroomDie = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 가호 — 오염도가 오르지 않는다 (재난 — 기록 소실 창이 떠 있으면 빼고)
(function hookPoll() {
    const iv = setInterval(function () {
        if (typeof applyPollutionToUser !== 'function') return;
        if (applyPollutionToUser._dok) { clearInterval(iv); return; }
        const _a = applyPollutionToUser;
        const w = function (user, amt) {
            try {
                const u = me();
                if (u && user && user.code === u.code && (Number(amt) || 0) > 0 && wears(u) && guarded(u)
                    && !document.querySelector('#dz-ov')) return;
            } catch (e) { }
            return _a.apply(this, arguments);
        };
        w._dok = true;
        applyPollutionToUser = w; window.applyPollutionToUser = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// K의 방 — 갈림길에서 유리한 쪽 (어둠의 ◈ 와 같다 · 즉사로 이어지지 않는 선택지에)
// ==========================================
(function hookKNext() {
    const iv = setInterval(function () {
        if (typeof window.kroomNext !== 'function' || !window.KROOM) return;
        if (window.kroomNext._dok) { clearInterval(iv); return; }
        const _n = window.kroomNext;
        const w = function () {
            const out = _n.apply(this, arguments);
            try {
                if (!on(me())) return out;
                const kr = window.KROOM.state();
                const o = kr && kr.cur && kr.cur.sc && kr.cur.sc.o;
                if (!Array.isArray(o)) return out;
                const body = darkBodyEl();
                const rows = Array.prototype.filter.call(body.querySelectorAll('button'), function (b) { return /^kroomPick\(/.test(b.getAttribute('onclick') || ''); })
                    .map(function (b) { const m = (b.getAttribute('onclick') || '').match(/\((-?\d+)\)/); return { b: b, i: m ? Number(m[1]) : -1 }; })
                    .filter(function (x) { return x.i >= 0; });
                const bad = rows.filter(function (x) { return o[x.i] && o[x.i].doom; });
                if (!bad.length || bad.length === rows.length) return out;
                rows.forEach(function (x) {
                    if (o[x.i] && o[x.i].doom) return;
                    if ((x.b.textContent || '').indexOf('◈') < 0) x.b.insertAdjacentHTML('afterbegin', '◈ ');
                });
            } catch (e) { }
            return out;
        };
        w._dok = true;
        window.kroomNext = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 쿨타임이 끝났다 — 200,000 P
// ==========================================
function payTick() {
    const u = me();
    if (!u || !u.dok || typeof u.dok !== 'object') return;
    const cd = Number(u.dok.cd) || 0;
    if (!cd || now() < cd || u.dok.paid === cd) return;
    u.dok.paid = cd;
    u.points = (Number(u.points) || 0) + DOK.PAY;
    log_(u, '[' + DOK.NAME + '] 도깨비가 두고 간 것 (+' + DOK.PAY.toLocaleString() + ' P)');
    save({ dok: 1, points: 1, history: 1 });
    try { if (typeof showPointGainEffect === 'function') showPointGainEffect(DOK.PAY); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    setTimeout(function () { try { showCustomAlert('🔥 불씨가 남기고 간 것이 있습니다.\n\n+' + DOK.PAY.toLocaleString() + ' P'); } catch (e) { } }, 600);
}
setInterval(function () { try { payTick(); } catch (e) { } }, 20000);
setTimeout(function () { try { payTick(); } catch (e) { } }, 6000);

// ==========================================
// 콘솔
// ==========================================
function find(who) {
    if (!who) return me();
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    return all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); }) || null;
}
function hm(ms) { ms = Math.max(0, ms); return Math.floor(ms / 3600000) + '시간 ' + Math.round((ms % 3600000) / 60000) + '분'; }
window.dokNow = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const s = u.dok || {}, t = now();
    console.log('%c===== 🔥 ' + u.name + ' · ' + DOK.NAME + ' =====', 'color:#ff9e5e; font-size:13px');
    console.log({ 차고있나: wears(u), 효과: on(u) ? '켜짐' : (wears(u) ? '쿨타임 — 꺼짐' : '-'),
        오늘구출: (s.day === today() ? (s.n || 0) : 0) + ' / ' + DOK.NEED,
        가호: guarded(u) ? hm(s.on - t) + ' 남음' : '-',
        쿨타임: cooling(u) ? hm(s.cd - t) + ' 남음' : '-',
        '20만P': s.cd ? (s.paid === s.cd ? '받음' : (t >= s.cd ? '곧 받음' : '쿨타임 끝에')) : '-' });
};
window.dokSet = function (who, k, v) {
    const a = me();
    if (!a || a.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    if (['n', 'on', 'cd'].indexOf(k) < 0) { console.warn("칸은 'n' · 'on' · 'cd'"); return; }
    if (!u.dok || typeof u.dok !== 'object') u.dok = { day: today(), n: 0 };
    u.dok[k] = Number(v) || 0;
    try { if (typeof updateUserFields === 'function') updateUserFields(u.code, { dok: u.dok }); } catch (e) { }
    console.log('%c✓ ' + u.name + ' — dok.' + k + ' = ' + u.dok[k], 'color:#4CAF50');
};

})();
