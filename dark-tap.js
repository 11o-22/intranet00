// ==========================================
// ★ 어둠 탐사 — 선택지를 여러 번 눌러야 넘어가던 것
// bundles.json 마지막 묶음, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   renderDarkStep 앞에 120ms 짜리 자물쇠가 걸려 있다.
//
//       if (window._rdsLock) return;          ← 그냥 버린다
//       window._rdsLock = true;
//       setTimeout(function () { window._rdsLock = false; }, 120);
//
//   너무 자주 다시 그리지 말자는 뜻인데, 못 그린 한 번을 **버린다**.
//   미뤄 두지 않는다. 그래서 이런 일이 난다 —
//
//       선택지를 누른다 → darkRun.step 은 올라간다
//                       → 그릴 차례인데 자물쇠가 잡혀 있다 → 버린다
//                       → 화면은 그대로다
//       한 번 더 누른다 → 이번엔 자물쇠가 풀려 있다 → 그제야 넘어간다
//
//   파티에서 더 자주 난다. 방의 curStep 감시자, 준비 인원 확인, 투표
//   감시자가 저마다 다시 그리라고 하므로 자물쇠가 거의 늘 따뜻하다.
//   혼자 걸을 때는 부를 일이 적어 잘 안 드러났다.
//
// ■ 또 하나 — 손가락 밑에서 단추가 사라진다
//
//   선택지 단추는 다시 그릴 때마다 통째로 새로 만들어진다. 누르기
//   시작한 단추가 떼기 전에 없어지면, 그 누름은 click 이 되지 못하고
//   그냥 사라진다. 휴대폰에서 특히 그렇다.
//
// ■ 무엇을 했나
//
//   1. 버리지 말고 미뤄 둔다. 자물쇠가 풀릴 때 마지막 한 번을 그린다.
//   2. 손가락이 닿아 있는 동안에는 안 그린다. 떼고 조금 뒤에 그린다.
//      (떼자마자 그리면 click 이 닿기 전에 단추가 사라진다)
//
//   그리는 횟수는 전과 같이 묶인다. 잃어버리지만 않는다.
//
// ■ 콘솔
//   darkTapState()   미뤄 둔 것이 있나 · 지금까지 몇 번을 건졌나

(function darkTap() {

const GAP = 130;        // 이만큼은 묶어서 한 번만 그린다
const AFTER = 70;       // 손가락을 뗀 뒤 이만큼 기다렸다 그린다 (click 이 먼저 닿도록)
const STUCK = 1500;     // 손가락이 닿은 채로 이만큼 지나면 놓은 것으로 친다

let lock = false;       // 방금 그렸다
let pend = false;       // 미뤄 둔 것이 있다
let hold = false;       // 손가락이 닿아 있다
let holdAt = 0;
let saved = 0;          // 버려졌을 것을 건져 낸 횟수
let painted = 0;

function held() {
    if (!hold) return false;
    if (Date.now() - holdAt > STUCK) { hold = false; return false; }   // 떼는 것을 놓쳤다
    return true;
}

function flush() {
    if (!pend || lock || held()) return;
    pend = false;
    if (typeof renderDarkStep === 'function') renderDarkStep();
}

// ==========================================
// 1. 버리지 말고 미뤄 둔다
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof renderDarkStep !== 'function') return;
        if (renderDarkStep._tap) { clearInterval(iv); return; }
        const _r = renderDarkStep;

        const w = function () {
            if (lock || held()) { pend = true; saved++; return; }
            lock = true;
            setTimeout(function () { lock = false; flush(); }, GAP);

            // 안쪽에도 같은 자물쇠가 있다. 묶는 일은 이제 바깥에서 하므로
            // 안쪽 것이 걸리지 않게 비켜 준다.
            window._rdsLock = false;
            painted++;
            try { return _r.apply(this, arguments); }
            finally { window._rdsLock = false; }
        };
        w._tap = true;
        renderDarkStep = w;
        clearInterval(iv);
        console.log('[어둠] 선택지 — 못 그린 한 번을 버리지 않고 미뤄 둡니다');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 2. 손가락이 닿아 있는 동안에는 안 그린다
// ==========================================
(function finger() {
    function inDark(t) {
        try {
            return !!(t && t.closest
                && t.closest('#dark-run-overlay, #darkness-body, #dro-body'));
        } catch (e) { return false; }
    }
    function down(e) {
        if (!inDark(e.target)) return;
        hold = true; holdAt = Date.now();
    }
    function up() {
        if (!hold) return;
        hold = false;
        // 떼자마자 그리면 click 이 닿기 전에 단추가 사라진다. 조금 기다린다.
        setTimeout(flush, AFTER);
    }
    try {
        document.addEventListener('pointerdown', down, true);
        document.addEventListener('pointerup', up, true);
        document.addEventListener('pointercancel', up, true);
        // 포인터를 모르는 낡은 화면
        document.addEventListener('touchstart', down, true);
        document.addEventListener('touchend', up, true);
        document.addEventListener('touchcancel', up, true);
        document.addEventListener('mousedown', down, true);
        document.addEventListener('mouseup', up, true);
    } catch (e) { }
})();

// ==========================================
// 확인
// ==========================================
window.darkTapState = function () {
    console.log('%c===== 어둠 선택지 =====', 'color:#9fd8ef; font-size:13px');
    console.log('  연결       :', (typeof renderDarkStep === 'function' && renderDarkStep._tap) ? 'O' : '✗');
    console.log('  미뤄 둔 것 :', pend ? 'O' : '없음');
    console.log('  손가락     :', held() ? '닿아 있음' : '뗌');
    console.log('  그린 횟수  :', painted);
    console.log('  건져 낸 것 :', saved + '번 (예전 같으면 버려졌을 그리기)');
};

console.log('[어둠] darkTapState()');

})();
