// ==========================================
// ★ 파티 칸의 곁 화면이 혼자 닫히던 것
//   (반입품 선택 · 사원 초대)
// bundles.json 마지막 묶음, party-stay.js 보다 뒤
// ==========================================
//
// ■ 무엇이 일어나고 있었나
//
//   반입품 선택과 사원 초대는 따로 뜨는 창이 아니다. 둘 다 파티 칸의
//   **같은 자리**(#dark-party-body)를 글째로 갈아 끼워 쓴다.
//
//       function openPartyCarryModal() { … body.innerHTML = `…`; }
//       function openInviteSelect()    { … body.innerHTML = `…`; }
//
//   그런데 방(darkParties)이 바뀔 때마다 그 자리를 다시 그린다.
//   (index.html:1890 의 on('value') 안)
//
//       const panel = document.getElementById('dark-party');
//       if (panel && panel.classList.contains('active')) renderPartyPanel();
//
//   방은 자주 바뀐다 — 누가 「준비 완료」를 누를 때, 누가 반입품을
//   확정할 때(members/<사번> 를 쓴다), 누가 들어오고 나갈 때, 자리가
//   비어 다시 앉을 때(party-stay.js). 여럿이 모여 있으면 몇 초에 한 번씩
//   바뀐다.
//
//   그래서 반입품을 고르는 도중에 화면이 통째로 파티 칸으로 **되돌아간다.**
//   사원 초대도 마찬가지다 — 눌러서 목록이 떴다가 곧바로 지워지니
//   「초대가 안 눌린다」로 보인다. 둘은 같은 고장이다.
//
// ■ 어떻게 고치나
//
//   곁 화면이 열려 있는 동안에는 renderPartyPanel 이 그 자리를 덮지
//   않는다. 사람이 나갈 때만 닫는다 —
//
//       돌아가기 · 취소        → partySubBack() 으로 바꿔 끼운다
//       확정 · 초대장 발송      → 그 함수가 돌기 전에 놓아 준다
//       다른 칸으로 가기        → 놓아 준다
//       탐사 시작 · 파티 해산   → 스스로 놓는다 (stale)
//
//   10분이 지나면 무슨 일이 있어도 놓는다 — 붙잡힌 채 굳지 않게.
//
// ■ 콘솔
//   partySubState()

(function partySub() {

const BODY = 'dark-party-body';
const CAP = 10 * 60 * 1000;          // 아무리 길어도 10분

let sub = null;                      // 'carry' | 'invite' | null
let at = 0;
let held = 0;                        // 덮지 않고 넘긴 횟수

function body() { return document.getElementById(BODY); }
function panelOn() {
    const el = document.getElementById('dark-party');
    return !!(el && el.classList.contains('active'));
}
function myParty() {
    try { return (typeof getMyParty === 'function') ? getMyParty() : null; } catch (e) { return null; }
}

// 더 붙잡아 둘 수 없는 때 — 스스로 놓는다
function stale() {
    if (!sub) return true;
    if (Date.now() - at > CAP) return true;
    if (typeof darkRun !== 'undefined' && darkRun) return true;   // 탐사가 시작됐다
    if (!panelOn()) return true;                                  // 다른 칸으로 갔다
    if (!myParty()) return true;                                  // 파티가 없어졌다
    const b = body();
    if (!b || !b.innerHTML) return true;
    return false;
}

// 곁 화면이 열렸다 — 「돌아가기 / 취소」를 내 것으로 바꿔 둔다
function open_(kind) {
    sub = kind;
    at = Date.now();
    const b = body();
    if (!b) return;
    Array.prototype.forEach.call(b.querySelectorAll('button'), function (x) {
        const on = x.getAttribute('onclick') || '';
        if (/renderPartyPanel\s*\(\s*\)/.test(on)) x.setAttribute('onclick', 'partySubBack()');
    });
}

function free() { sub = null; at = 0; }

window.partySubBack = function () {
    free();
    try { if (typeof renderPartyPanel === 'function') renderPartyPanel(); } catch (e) { }
};

// ==========================================
// 감싸기
// ==========================================
function after(name, fn, flag) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        if (window[name][flag]) { clearInterval(iv); return; }
        const _f = window[name];
        const w = function () {
            const r = _f.apply(this, arguments);
            try { fn.apply(null, arguments); } catch (e) { console.warn('[파티]', e); }
            return r;
        };
        w[flag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
}
function before(name, fn, flag) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        if (window[name][flag]) { clearInterval(iv); return; }
        const _f = window[name];
        const w = function () {
            try { fn.apply(null, arguments); } catch (e) { }
            return _f.apply(this, arguments);
        };
        w[flag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
}

// 곁 화면을 여는 둘
after('openPartyCarryModal', function () { open_('carry'); }, '_psub');
after('openInviteSelect',    function () { open_('invite'); }, '_psub');

// 곁 화면을 끝내는 것들 — 저쪽이 renderPartyPanel 을 부르므로 먼저 놓는다
['savePartyCarry', 'sendDarkInvite', 'leaveParty', 'launchParty',
 'switchDarknessPanel', 'switchTab', 'switchTabById', 'joinParty', 'createParty']
    .forEach(function (n) { before(n, free, '_psub'); });

// 파티 칸을 다시 그리는 자리 — 곁 화면이 열려 있으면 덮지 않는다
(function hold() {
    const iv = setInterval(function () {
        if (typeof renderPartyPanel !== 'function') return;
        if (renderPartyPanel._psub) { clearInterval(iv); return; }
        const _r = renderPartyPanel;
        const w = function () {
            if (sub) {
                if (!stale()) { held++; return; }    // 고르는 중이다 — 그대로 둔다
                free();
            }
            return _r.apply(this, arguments);
        };
        w._psub = true;
        renderPartyPanel = w;
        window.renderPartyPanel = w;
        clearInterval(iv);
        console.log('[파티] 반입품·초대 화면을 붙잡아 둡니다');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 붙잡아 둔 채로 조건이 깨졌으면 그 자리에서 놓고 한 번 그린다
setInterval(function () {
    try {
        if (!sub) return;
        if (!stale()) return;
        free();
        if (panelOn() && typeof renderPartyPanel === 'function') renderPartyPanel();
    } catch (e) { }
}, 1500);

// ==========================================
// 확인
// ==========================================
window.partySubState = function () {
    console.log('%c===== 파티 곁 화면 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  지금 열린 것 :', sub || '없음',
        sub ? ('· ' + Math.round((Date.now() - at) / 1000) + '초째') : '');
    console.log('  덮지 않고 넘긴 횟수 :', held);
    console.log('  감쌈 :',
        (typeof renderPartyPanel === 'function' && renderPartyPanel._psub) ? '다시 그리기 O' : '다시 그리기 ✗',
        (typeof openPartyCarryModal === 'function' && openPartyCarryModal._psub) ? '· 반입품 O' : '· 반입품 ✗',
        (typeof openInviteSelect === 'function' && openInviteSelect._psub) ? '· 초대 O' : '· 초대 ✗');
    console.log('  파티 칸 열림 :', panelOn(), '· 파티 :', myParty() ? '있음' : '없음');
};

console.log('[파티] partySubState()');

})();
