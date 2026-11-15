// ==========================================
// ★ 오염도 동결 (두번째 재앙) — 재앙을 맞은 사원은 6 시간 동안 오염도가 95% 에 묶인다 (2026-11-15 사용자)
// bundles.json 마지막 묶음 맨 끝 (party-ghost.js 뒤)
// ==========================================
//
//   「재앙의 길을 완수한 자한테 『 두번째 재앙 : 오염도 동결 』 을 내리겠습니까? 라고 띄워주고 첫번째 처럼 내린다 / 보류한다.
//    선택하게 해주고 히든 중 랜덤으로 두 명한테. 맞는 조건은 첫번째랑 동일. 그리고 맞은 사람은 오염도가 95퍼에서 안 내려가고
//    빨간 헤일로는 안 뜨고 오른쪽 상단에 재앙에 걸렸습니다. 라고 빨간색으로 글씨만 띄워줘. 지속시간은 6 시간.」
//                                                                              (거는 쪽 — kroom-core.js 13. 재앙)
//
//   users/<사번>/calamFreeze = { until, at, n }     until 까지 동결 (서버 시계 — clock.js serverNow)
//   ※ 물건이 거는 「오염 동결」(pollFreezeUntil · poll-freeze.js — 오르지 않게 해 주는 것)과는 다른 것이다. 둘이 같이 걸릴 수도 있다.
//
// ■ 동결 동안
//   바닥      오염도가 95% 아래로 내려가지 않는다. 걸리는 순간 95% 보다 낮았으면 95% 가 된다.
//             내리는 길이 스무 군데가 넘어 하나씩 막지 않는다 — 무엇이 내렸든 **맞은 사원의 화면이** 다시 95% 로 올려 적는다
//             (화면을 그리기 직전 · 0.3 초마다). 남이 내려 적는 것(updateUserFields)은 적기 전에 95% 로 맞춘다.
//             격리에서 풀려 나올 때 · 상담사가 고쳐 적었을 때도 같다. 풀려면 calamFreezeLift.
//   오름      물건의 「오염 동결」과 같은 규칙으로 오르지 않는다 — applyPollutionToUser · addPollution · 세 시간마다 3%.
//             그 길을 건너뛰는 것(탐사 사망의 100% · 붉은 헤일로의 +15 처럼 「동결과 무관하게」 적는 것)은 그대로 오른다.
//   붉은 막   오염도 90% 부터 화면 가장자리에 뜨는 붉은 막(pollution-danger)과 어두워지는 것이 뜨지 않는다.
//   글씨      화면 오른쪽 위(머리 단추 줄 바로 밑)에 붉은 글씨 「재앙에 걸렸습니다.」 — 글씨만. 눌리지 않는다 (밑의 것이 그대로 눌린다).
//             로그인해 있는 동안 어느 화면에서나 떠 있다 (재앙 화면이 뜰 때만 그 밑에 깔린다).
//   그대로    오염도 숫자 · 「완전 오염」 표시 · 오염도에 따른 판정 보정 · 100% 에서 일어나는 일.
//
// ■ 콘솔
//   calamFreezeState()        지금 동결 · 남은 시간 · 어디에 걸려 있는지
//   calamFreezeLift(사원)     상담사 — 그 사원의 동결을 푼다 (이름 · 사번). 오염도는 그 자리에 둔다

(function calamFreezeFx() {
'use strict';

const ADMIN = 'kario0987';
const FLOOR = 95;
const TEXT = '재앙에 걸렸습니다.';
const TAG_ID = 'calam-frz-tag';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function book() { try { return (typeof db !== 'undefined' && db && db.users) || {}; } catch (e) { return {}; } }
function srv() { try { if (typeof window.serverNow === 'function') return window.serverNow(); } catch (e) { } return Date.now(); }
function left(u) {
    const s = u && u.calamFreeze;
    const t = (s && typeof s === 'object' && Number(s.until)) || 0;
    return Math.max(0, t - srv());
}
function frozen(u) { return !!u && left(u) > 0; }
window.calamFrozen = function (u) { return frozen(u === undefined ? u_() : u); };
window.calamFreezeLeft = function (u) { return left(u === undefined ? u_() : u); };
window.CALAM_FREEZE_FLOOR = FLOOR;

function leftText(ms) {
    const m = Math.max(1, Math.ceil(ms / 60000));
    return (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' : '') : '') + (m % 60 ? (m % 60) + '분' : '');
}

// ==========================================
// 감싸기 — 바깥에서 한 겹. 다른 파일의 표(_xxx)는 그대로 넘긴다. 뒤늦게 감싸는 파일이 있어도 여덟 겹까지만
// ==========================================
const HOOKS = {}, TRIES = {};
function wrap(name, make) {
    const f = window[name];
    if (typeof f !== 'function' || f._calamFrz) return false;
    if ((TRIES[name] || 0) >= 8) return false;
    TRIES[name] = (TRIES[name] || 0) + 1;
    const w = make(f);
    Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
    w._calamFrz = true;
    window[name] = w;
    HOOKS[name] = true;
    return true;
}

// ==========================================
// 1. 바닥 — 95% 아래로 내려가 있으면 올려 적는다 (내 것만)
// ==========================================
const stat = { fixed: 0, last: '' };
function hold() {
    const u = u_();
    if (!u || !frozen(u)) return false;
    if ((Number(u.pollution) || 0) >= FLOOR) return false;
    const was = u.pollution;
    u.pollution = FLOOR;
    stat.fixed++;
    stat.last = new Date().toLocaleTimeString() + ' ' + was + ' → ' + FLOOR;
    try { if (typeof saveFields === 'function') saveFields({ pollution: 1 }); } catch (e) { }
    return true;
}

const MAKERS = {
    // 그리기 직전에 먼저 맞춘다 — 낮아진 숫자가 잠깐 보이지 않게
    updateUI: function (_f) {
        return function () {
            try { hold(); } catch (e) { }
            return _f.apply(this, arguments);
        };
    },
    // 남이 내려 적는 것 — 적기 전에 맞춘다
    updateUserFields: function (_f) {
        return function (code, fields) {
            try {
                if (fields && typeof fields === 'object' && typeof fields.pollution === 'number' && fields.pollution < FLOOR) {
                    const me = u_();
                    const t = (me && me.code === code) ? me : book()[code];
                    if (t && frozen(t)) {
                        fields.pollution = FLOOR;
                        if (!((Number(t.pollution) || 0) >= FLOOR)) t.pollution = FLOOR;
                    }
                }
            } catch (e) { }
            return _f.apply(this, arguments);
        };
    },
    // 2. 오름 — 물건의 오염 동결(poll-freeze.js)과 같은 세 길
    applyPollutionToUser: function (_f) {
        return function (user, amount) {
            if (frozen(user) && (Number(amount) || 0) > 0) return;       // 오르는 몫만 버린다
            return _f.apply(this, arguments);
        };
    },
    addPollution: function (_f) {
        return function (amount) {
            if (frozen(u_()) && (Number(amount) || 0) > 0) return;
            return _f.apply(this, arguments);
        };
    },
    // 세 시간마다 3% — 동결 동안은 시간이 흐르지 않은 것으로 둔다 (poll-freeze.js 와 같은 방식)
    checkPassivePollution: function (_f) {
        return function (user) {
            try { if (user && frozen(user)) user.lastPollutionTime = Date.now(); } catch (e) { }
            return _f.apply(this, arguments);
        };
    },
    // 「오르지 않는 중인가」 를 묻는 곳(pollWhy)에도 같은 답을 준다
    isPollFrozen: function (_f) {
        return function (u) {
            if (frozen(u)) return true;
            return _f.apply(this, arguments);
        };
    },
    // 3. 붉은 막 — 동결 동안은 오염도 0 인 화면처럼 그린다 (막도 어두워지는 것도 없다)
    updateVisualDistortion: function (_f) {
        return function (p) {
            if (frozen(u_())) return _f.call(this, 0);
            return _f.apply(this, arguments);
        };
    }
};
function hookAll() { Object.keys(MAKERS).forEach(function (k) { try { wrap(k, MAKERS[k]); } catch (e) { } }); }
hookAll();
setInterval(hookAll, 1500);

// ==========================================
// 4. 글씨 — 오른쪽 위 「재앙에 걸렸습니다.」
// ==========================================
function css() {
    if (document.getElementById('calam-frz-css')) return;
    const st = document.createElement('style');
    st.id = 'calam-frz-css';
    // 맨 위 줄에는 광장 머리 단추(알림 · 선물 · 소리 · 목록 — 위에서 10~52px)가 있다. 그 바로 밑에 둔다 — 단추와 겹치지 않게
    st.textContent = '#' + TAG_ID + '{position:fixed;top:calc(var(--plaza-safe-top,env(safe-area-inset-top,0px)) + 57px);right:calc(env(safe-area-inset-right,0px) + 12px);'
        + 'z-index:2147483100;margin:0;padding:0;background:none;border:0;pointer-events:none;user-select:none;-webkit-user-select:none;'
        + 'color:#ff2a1f;font-size:12px;font-weight:bold;letter-spacing:.5px;line-height:1.3;white-space:nowrap;'
        + 'text-shadow:0 0 3px #000,0 0 6px rgba(0,0,0,.85);}';
    document.head.appendChild(st);
}
function tag(on) {
    let el = document.getElementById(TAG_ID);
    if (!on) { if (el) el.remove(); return; }
    if (el) return;
    css();
    el = document.createElement('div');
    el.id = TAG_ID;
    el.textContent = TEXT;
    document.body.appendChild(el);
}

// ==========================================
// 돌리기 — 바닥 · 글씨 · 걸리고 풀리는 순간에 화면을 다시 그린다 (붉은 막이 바로 걷히고 돌아오게)
// ==========================================
let wasOn = null;
function tick() {
    const u = u_();
    const on = !!u && frozen(u);
    tag(on);
    let paint = false;
    if (on && hold()) paint = true;
    if (wasOn !== null && wasOn !== on) paint = true;
    wasOn = u ? on : null;
    if (paint && u) { try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }
}
setInterval(function () { try { tick(); } catch (e) { } }, 300);

// ==========================================
// 콘솔
// ==========================================
window.calamFreezeState = function () {
    const u = u_();
    if (!u) { console.log('로그인 후에 보세요.'); return; }
    const ms = left(u);
    console.log('%c===== ☄ 오염도 동결 (두번째 재앙) =====', 'color:#ff8a76; font-size:13px');
    console.log('  지금:', ms > 0 ? '동결 중 — 남은 시간 ' + leftText(ms) + ' (' + new Date(u.calamFreeze.until).toLocaleString() + ' 까지)' : '없음',
        '· 오염도 ' + u.pollution + '% (바닥 ' + FLOOR + '%)');
    console.log('  걸린 자리:', Object.keys(MAKERS).map(function (k) { return k + (HOOKS[k] ? ' O' : ' ✗'); }).join(' · '));
    console.log('  바닥으로 올려 적은 횟수 ' + stat.fixed + (stat.last ? ' · 마지막 ' + stat.last : '') + ' · 글씨 ' + (document.getElementById(TAG_ID) ? '떠 있음' : '없음'));
};
window.calamFreezeLift = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = book();
    const code = Object.keys(all).filter(function (c) { const x = all[c] || {}; return x.name === who || String(x.no) === String(who); })[0];
    if (!code) { console.warn('사원을 못 찾았습니다 (이름 · 사번).'); return; }
    try { delete all[code].calamFreeze; } catch (e) { }
    try { database.ref('users/' + code + '/calamFreeze').remove(); } catch (e) { console.warn(e); return; }
    console.log('%c✓ ' + (all[code].name || '') + ' — 오염도 동결을 풀었습니다. (오염도는 그대로 — 지금 ' + all[code].pollution + '%)', 'color:#4CAF50');
};

console.log('[재앙] 오염도 동결 연결 — calamFreezeState()');

})();
