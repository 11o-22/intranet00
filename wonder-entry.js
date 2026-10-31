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
// 콘솔
// ==========================================
window.wonderTries = function () { console.log('이상한 나라 — 오늘 남은 횟수', left() + ' / ' + DAY_MAX, use); return left(); };
window.wonderTriesReset = function () {
    const u = me(), d = db_();
    if (!u || u.code !== 'kario0987') { console.log('관리자만'); return; }
    use = { d: today(), n: 0, k: [] };
    if (d) d.ref('wonderUse/' + u.code).set(use);
    console.log('오늘 횟수를 되돌렸습니다.');
};

console.log('[이상한 나라] 입장 — 1~' + PEOPLE_MAX + '인 · 하루 ' + DAY_MAX + '번 · 동시 입장 허용');
})();
