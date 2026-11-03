// ==========================================
// ★ ⏰ 쉬는 시간 — 2026-11-03 오후 7시 ~ 9시 (한국 시각) · 인트라넷 전체 (사용자 · 오늘만 잠시)
// bundles.json 첫 묶음 맨 앞 — 다른 파일이 깨져도 이것은 돈다
// ==========================================
//
//   · 그동안은 화면 전체를 「휴식을 취하실 시간입니다.」로 덮고 들어오지 못하게 한다 (로그인 · 자동 로그인 막음).
//   · 이미 들어와 있던 사원은 7시가 되는 순간 로그아웃시킨다 (점검 때 쫓아내는 것과 같은 logout()).
//   · 상담사(kario0987)만 예외 — 점검 때처럼 들어가 볼 수 있다 (저장해 둔 자동 로그인으로).
//   · 시각은 서버 시각(clock.js serverNow)으로 잰다. 기기 시계를 바꿔도 안 된다.
//   · 9시가 지나면 덮개가 저절로 걷힌다.
//
// ■ 콘솔
//   restTimeState()

(function restTime() {
'use strict';

const FROM = Date.UTC(2026, 10, 3, 10, 0, 0);     // 한국 19:00
const TO = Date.UTC(2026, 10, 3, 12, 0, 0);       // 한국 21:00
const MSG = '휴식을 취하실 시간입니다.';
const ADMIN = 'kario0987';

function now() {
    try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { }
    return Date.now();
}
function inTime() { const t = now(); return t >= FROM && t < TO; }
function cu() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
// 그 사번이 막히나 — 사번이 없으면(로그인 전) 막힌다
function blocked(code) { return inTime() && code !== ADMIN; }
window.restTimeOn = function (code) { return blocked(code == null ? ((cu() && cu().code) || '') : code); };
window.restTimeMsg = MSG;

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
            + '<div style="color:#d4af37;font-size:15px;font-weight:bold;letter-spacing:1px;text-align:center;padding:0 24px;">' + MSG + '</div>';
        ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend', 'wheel', 'contextmenu'].forEach(function (ev) {
            el.addEventListener(ev, function (e) { e.stopPropagation(); if (ev !== 'touchstart' && ev !== 'wheel') e.preventDefault(); }, { passive: false });
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
            cover(true);
            try { if (typeof showAutoLoginOverlay === 'function') showAutoLoginOverlay(false); } catch (e) { }
            return Promise.resolve(null);
        }
        return f.apply(this, arguments);
    };
    w._rest = true;
    window.attemptLogin = w;
    return true;
}

let kicked = false;
function tick() {
    wrapLogin();
    const u = cu();
    const on = inTime();
    if (!on) { cover(false); kicked = false; return; }
    if (u && u.code === ADMIN) { cover(false); return; }
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
