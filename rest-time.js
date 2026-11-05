// ==========================================
// ★ ⏰ 쉬는 시간(셧다운제) — 2026-11-05 부터 날마다 오전 10시 ~ 오후 6시 (한국 시각) · 인트라넷 전체 (사용자)
//   처음(2026-11-03)에는 그날 하루 오후 7시 ~ 9시였다 → 11-04 사용자 「19~21시 없애고 내일부터 10:00~18:00」
//   → 11-05 사용자 「10~12, 14~18시까지 유지하고 주말에는 아예 없애는 식. 월~금만」 · 「그건 내일부터 하고, 오늘 하루는 아예 셧다운제 풀자」
//     · 2026-11-05(목) — 10:00 부터 막다가 그날 낮(CUT)에 풀었다. 그날 쉬는 시간은 10:00 ~ CUT 한 칸뿐.
//     · 2026-11-06(금) 부터 — 월~금 10:00 ~ 12:00 · 14:00 ~ 18:00 (한국). 토 · 일은 없다.
//     time-freeze.js 는 끝난 칸마다 그만큼 시계를 민다 (칸 이름 'YYYY-MM-DD' + a/b — 글자 순서가 곧 시간 순서).
// bundles.json 첫 묶음 맨 앞 — 다른 파일이 깨져도 이것은 돈다
// ==========================================
//
//   · 그동안은 화면 전체를 「휴식을 취하실 시간입니다.」로 덮고 들어오지 못하게 한다 (로그인 · 자동 로그인 막음).
//   · 이미 들어와 있던 사원은 10시가 되는 순간 로그아웃시킨다 (점검 때 쫓아내는 것과 같은 logout()).
//   · 상담사(kario0987) 계정만 예외 — 들어갈 수 있다. 저장해 둔 자동 로그인으로 들어가거나, 덮개 아래 「상담사 로그인」을 누르면
//     덮개가 2분 걷혀 로그인 칸이 보인다 (다른 사번을 넣으면 그 자리에서 다시 덮인다).
//   · 시각은 서버 시각(clock.js serverNow)으로 잰다. 기기 시계를 바꿔도 안 된다. 날짜 · 시는 한국 시각(+9)으로 센다.
//   · 12시 · 오후 6시가 지나면 덮개가 저절로 걷힌다.
//
// ■ 콘솔
//   restTimeState()

(function restTime() {
'use strict';

const KST = 9 * 3600000;
const START = Date.UTC(2026, 10, 4, 15, 0, 0);    // 한국 2026-11-05 00:00 — 이날부터
const SLOTS = [[10, 12, 'a'], [14, 18, 'b']];      // 월~금 한국 10:00 ~ 12:00 · 14:00 ~ 18:00 (끝 시각 정각에 걷힌다)
const DAY0 = '2026-11-05';                        // 이날만 따로 — 10:00 ~ CUT 한 칸 (오늘 하루 아예 풂)
const CUT = Date.UTC(2026, 10, 5, 4, 20, 0);      // 한국 2026-11-05 13:20 — 그날 푼 때 (올린 때)
const MSG = '휴식을 취하실 시간입니다.';
const ADMIN = 'kario0987';

function now() {
    try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { }
    return Date.now();
}
function inTime() {
    const t = now();
    return wins(t, t + 1).length > 0;
}
function cu() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
// 그 사번이 막히나 — 사번이 없으면(로그인 전) 막힌다
function blocked(code) { return inTime() && code !== ADMIN; }
window.restTimeOn = function (code) { return blocked(code == null ? ((cu() && cu().code) || '') : code); };
window.restTimeMsg = MSG;
// 쉬는 시간 칸들 — [t0, t1) 와 겹치는 것 (time-freeze.js 가 시간을 멈춘 만큼 되돌릴 때 쓴다)
//   { id: 'YYYY-MM-DD'+'a'|'b' (한국 날짜 · 그날 몇째 칸) — 2026-11-05 는 'YYYY-MM-DD' 하나, a: 시작 ms, b: 끝 ms }
function wins(t0, t1) {
    const out = [];
    t0 = Math.max(Number(t0) || 0, START); t1 = Number(t1) || 0;
    if (t1 <= t0) return out;
    let d = Math.floor((t0 + KST) / 86400000) * 86400000 - KST;     // t0 가 든 한국 날짜의 0시
    for (let n = 0; d < t1 && n < 800; n++, d += 86400000) {
        const k = new Date(d + KST);
        const day = k.getUTCFullYear() + '-' + String(k.getUTCMonth() + 1).padStart(2, '0') + '-' + String(k.getUTCDate()).padStart(2, '0');
        const wd = k.getUTCDay();                                     // 0 일 · 6 토
        let slots;
        if (day === DAY0) slots = [[d + 10 * 3600000, CUT, '']];
        else if (wd === 0 || wd === 6) slots = [];
        else slots = SLOTS.map(function (x) { return [d + x[0] * 3600000, d + x[1] * 3600000, x[2]]; });
        slots.forEach(function (x) {
            if (x[1] <= t0 || x[0] >= t1) return;
            out.push({ id: day + x[2], a: x[0], b: x[1] });
        });
    }
    return out;
}
window.restWindows = wins;
window.restNow = now;

// 덮개
function cover(show) {
    let el = document.getElementById('rest-time-overlay');
    if (!show) { if (el) el.style.display = 'none'; return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'rest-time-overlay';
        el.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;background:#0d0d0d;z-index:2147483646;'
            + 'display:flex;justify-content:center;align-items:center;flex-direction:column;touch-action:none;user-select:none;';
        el.innerHTML = '<div style="font-size:42px;margin-bottom:18px;">🌙</div>'
            + '<div style="color:#d4af37;font-size:15px;font-weight:bold;letter-spacing:1px;text-align:center;padding:0 24px;">' + MSG + '</div>'
            // 상담사만 들어갈 수 있다 — 덮개를 잠시 걷어 로그인 칸을 보이게 한다 (다른 사번은 로그인에서 다시 막힌다)
            + '<button id="rest-adm" style="position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);left:50%;transform:translateX(-50%);'
            + 'background:none;border:1px solid #2a2a2a;border-radius:8px;color:#555;font-size:11px;padding:6px 12px;cursor:pointer;">상담사 로그인</button>';
        ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend', 'wheel', 'contextmenu'].forEach(function (ev) {
            el.addEventListener(ev, function (e) {
                if (e.target && e.target.closest && e.target.closest('#rest-adm')) {
                    e.stopPropagation();
                    if (ev === 'click') { e.preventDefault(); peekUntil = Date.now() + 120000; cover(false); }
                    return;
                }
                e.stopPropagation(); if (ev !== 'touchstart' && ev !== 'wheel') e.preventDefault();
            }, { passive: false });
        });
        (document.body || document.documentElement).appendChild(el);
    }
    if (el.style.display !== 'flex') el.style.display = 'flex';
    if (el.parentNode && el !== el.parentNode.lastElementChild) el.parentNode.appendChild(el);   // 나중에 붙은 창보다 위로
}
// 덮개가 있는 동안 자판도 막는다 (광장 방향키 · 채팅 엔터 등)
document.addEventListener('keydown', function (e) {
    const el = document.getElementById('rest-time-overlay');
    if (el && el.style.display === 'flex') { e.stopPropagation(); e.preventDefault(); }
}, true);

// 로그인 막기 — attemptLogin 을 감싼다 (자동 로그인도 이것을 부른다)
function wrapLogin() {
    const f = window.attemptLogin;
    if (typeof f !== 'function' || f._rest) return typeof f === 'function';
    const w = function () {
        let code = '';
        try { code = String((document.getElementById('code-input') || {}).value || '').trim(); } catch (e) { }
        if (blocked(code)) {
            peekUntil = 0;
            cover(true);
            try { if (typeof showAutoLoginOverlay === 'function') showAutoLoginOverlay(false); } catch (e) { }
            return Promise.resolve(null);
        }
        // ⏸ 끝난 쉬는 시간만큼 시계를 아직 안 밀었으면(time-freeze.js) 밀 때까지 잠깐 기다렸다 들어간다 (12초까지)
        const self = this, args = arguments;
        if (typeof window.timeFreezePending === 'function' && window.timeFreezePending()) {
            return new Promise(function (res) {
                const t0 = Date.now();
                const wait = function () {
                    try { if (typeof window.timeFreezeRun === 'function') window.timeFreezeRun(); } catch (e) { }
                    if (!window.timeFreezePending() || Date.now() - t0 > 12000) { res(f.apply(self, args)); return; }
                    setTimeout(wait, 250);
                };
                wait();
            });
        }
        return f.apply(this, arguments);
    };
    w._rest = true;
    window.attemptLogin = w;
    return true;
}

let kicked = false, peekUntil = 0;       // peekUntil — 「상담사 로그인」을 눌러 로그인 칸을 잠시(2분) 보이는 동안
function tick() {
    wrapLogin();
    const u = cu();
    const on = inTime();
    if (!on) { cover(false); kicked = false; return; }
    if (u && u.code === ADMIN) { cover(false); return; }
    if (!u && peekUntil > Date.now()) { cover(false); return; }
    cover(true);
    if (u && !kicked) {
        kicked = true;
        try { if (typeof window.logout === 'function') window.logout(); } catch (e) { console.warn('[쉬는 시간] 로그아웃', e); }
    }
    if (!u) kicked = false;
}
tick();
setInterval(tick, 1000);
document.addEventListener('visibilitychange', tick);
window.addEventListener('DOMContentLoaded', tick);

window.restTimeState = function () {
    const t = now();
    console.log('[쉬는 시간] 지금(한국) ' + new Date(t + 9 * 3600000).toISOString().slice(11, 19) + ' · 쉬는 중 ' + inTime() + ' · 덮개 ' + !!(document.getElementById('rest-time-overlay') && document.getElementById('rest-time-overlay').style.display === 'flex'));
};
})();
