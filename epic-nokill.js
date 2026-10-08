// ==========================================
// ★ epic — 가만히 있는데 죽던 것
// bundles.json 마지막 묶음, epic-heal-solo.js · epic-show.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무슨 일이 있었나
//
//   쓰러지면 동료를 부르고 90초를 기다린다. 그 자리에 시계를 하나 걸어 둔다.
//
//       epic.js:573
//       setTimeout(() => { if (er && er._calledHelp && !er.dead) epicGiveUp(); }, 90000);
//
//   그런데 **동료가 와서 살려 줘도 이 시계를 끄지 않는다.**
//
//       epic.js:533  function epicSaved() {
//                        er.danger = null;        ← _calledHelp 는 그대로 true
//
//   그래서 살아나 다시 걷고 있어도, 쓰러졌던 때로부터 90초가 되면 시계가
//   울리고 epicGiveUp() → epicDeath() 가 돈다. **아무것도 안 했는데 죽는다.**
//
//   더 나쁜 자리도 있다. 정산 화면까지 갔는데 「단말로 복귀한다」를 아직 안
//   눌렀으면 er 이 살아 있다. 그 사이에 시계가 울리면 **이미 끝난 판에서
//   다시 죽어** 포인트와 반입품을 잃는다.
//
//   한 판에 두 번 쓰러져도 어긋난다. 첫 번째 시계가 두 번째 기다림을 보고
//   울려, 90초가 차기 전에 끊어 버린다.
//
// ■ 어떻게 고치나
//
//   걸어 둔 시계는 밖에서 끌 수 없다 (손잡이를 안 들고 있다).
//   대신 **울렸을 때 들어야 할 자리인지 확인한다.**
//
//     1. epicSaved — 살아나면 「기다리는 중」 표를 내린다 (이것만으로 거의 다 막힌다)
//     2. epicGiveUp — 묵은 시계면 아무 일도 안 한다
//          · 기다리는 중이 아니다        → 묵은 것
//          · 이미 죽었거나 정산이 끝났다 → 묵은 것
//          · 쓰러진 지 90초가 안 됐다    → 앞 시계가 먼저 울린 것
//        「기다리지 않는다」를 손으로 누른 것은 그대로 통과시킨다.
//     3. epicDeath — 정산이 끝난 판에서는 더 죽지 않는다
//     4. epicDoom — 앞 기믹의 초읽기가 남아 있으면 끄고 시작한다
//        (두 기믹이 겹치면 지난 초읽기가 혼자 돌다가 끌어내린다)
//
// ■ 콘솔
//   epicNoKillState()   지금 걸려 있는 기다림과 시계

(function epicNoKill() {

const WAIT_MS = 90000;        // epic.js 가 걸어 둔 시계와 같은 값
const SLACK = 4000;           // 시계가 조금 일찍/늦게 울리는 몫

function run() { return (typeof er !== 'undefined') ? er : null; }

// ==========================================
// 1. 살아나면 「기다리는 중」 표를 내린다
// ==========================================
(function hookSaved() {
    const NAMES = ['epicSaved', 'epicDoomSaved'];
    const iv = setInterval(function () {
        let left = 0;
        NAMES.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._noKill) return;
            const _s = f;
            window[n] = function () {
                const r = _s.apply(this, arguments);
                try {
                    const e = run();
                    if (e) {
                        e._calledHelp = false;       // ★ 이것이 빠져 있었다
                        e._helpAt = 0;
                        e.danger = null;
                        if (e._doomTick) { clearInterval(e._doomTick); e._doomTick = null; }
                    }
                } catch (x) { }
                return r;
            };
            window[n]._noKill = true;
        });
        if (!left) { clearInterval(iv); console.log('[epic] 구조된 뒤 묵은 시계 끄기 연결'); }
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 2. 쓰러진 때를 적어 둔다 · 정산 뒤에는 안 죽는다
// ==========================================
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._noKill) { clearInterval(iv); return; }

        const _d = epicDeath;
        epicDeath = function () {
            const e = run();
            // ★ 정산까지 끝난 판에서는 더 죽지 않는다
            if (e && e._settled) {
                console.warn('[epic] 정산이 끝난 판이라 사망 처리를 건너뜁니다.');
                return;
            }
            const before = !!(e && e._calledHelp);
            const r = _d.apply(this, arguments);
            try {
                const now = run();
                if (now && !before && now._calledHelp) {
                    now._helpAt = Date.now();        // 이번 기다림이 시작된 때
                    markBtn();
                }
            } catch (x) { }
            return r;
        };
        epicDeath._noKill = true;
        clearInterval(iv);
        console.log('[epic] 쓰러진 때 적기 연결');
    }, 400);
})();

// 「기다리지 않는다」 단추는 손으로 누른 것이므로 그대로 통과시킨다.
// 화면에 그려진 뒤에 부르는 자리를 바꿔 준다.
function markBtn() {
    setTimeout(function () {
        try {
            document.querySelectorAll('button[onclick*="epicGiveUp()"]').forEach(function (b) {
                b.removeAttribute('onclick');
                b.onclick = function () { window.epicGiveUpNow(); };
            });
        } catch (e) { }
    }, 60);
}

window.epicGiveUpNow = function () {
    window._epicGiveUpByHand = true;
    try { if (typeof epicGiveUp === 'function') epicGiveUp(); }
    finally { window._epicGiveUpByHand = false; }
};

// ==========================================
// 3. 묵은 시계는 울려도 듣지 않는다
// ==========================================
(function hookGiveUp() {
    const iv = setInterval(function () {
        if (typeof epicGiveUp !== 'function') return;
        if (epicGiveUp._noKill) { clearInterval(iv); return; }

        const _g = epicGiveUp;
        epicGiveUp = function () {
            const e = run();
            if (!e) return;                                   // 판이 끝났다
            if (window._epicGiveUpByHand) return _g.apply(this, arguments);

            if (e.dead || e._settled) {
                console.warn('[epic] 묵은 시계 — 이미 끝난 판이라 그냥 둡니다.');
                return;
            }
            if (!e._calledHelp) {
                console.warn('[epic] 묵은 시계 — 기다리는 중이 아니라 그냥 둡니다.');
                return;
            }
            const at = Number(e._helpAt || 0);
            if (at && Date.now() - at < WAIT_MS - SLACK) {
                console.warn('[epic] 묵은 시계 — 앞 기다림의 것이라 그냥 둡니다. ('
                    + Math.round((Date.now() - at) / 1000) + '초밖에 안 됐습니다)');
                return;
            }
            return _g.apply(this, arguments);
        };
        epicGiveUp._noKill = true;
        clearInterval(iv);
        console.log('[epic] 묵은 시계 거르기 연결');
    }, 400);
})();

// ==========================================
// 4. 앞 기믹의 초읽기를 끄고 시작한다
// ==========================================
(function hookDoom() {
    const iv = setInterval(function () {
        if (typeof epicDoom !== 'function') return;
        if (epicDoom._noKill) { clearInterval(iv); return; }

        const _o = epicDoom;
        epicDoom = function () {
            try {
                const e = run();
                if (e && e._doomTick) { clearInterval(e._doomTick); e._doomTick = null; }
            } catch (x) { }
            return _o.apply(this, arguments);
        };
        epicDoom._noKill = true;
        clearInterval(iv);
        console.log('[epic] 앞 기믹 초읽기 끄기 연결');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.epicNoKillState = function () {
    console.log('%c===== epic · 묵은 시계 =====', 'color:#90caf9; font-size:13px');
    const e = run();
    if (!e) { console.log('  지금 탐사 중이 아닙니다.'); }
    else {
        const at = Number(e._helpAt || 0);
        console.log('  기다리는 중:', e._calledHelp ? 'O' : '✗',
            at ? ('· 쓰러진 지 ' + Math.round((Date.now() - at) / 1000) + '초') : '');
        console.log('  죽음:', e.dead ? 'O' : '✗', '· 정산 끝남:', e._settled ? 'O' : '✗');
        console.log('  기믹 초읽기:', e._doomTick ? '돌고 있음' : '없음');
        if (e._calledHelp && at) {
            const left = Math.max(0, WAIT_MS - (Date.now() - at));
            console.log('  이 기다림의 시계까지:', Math.round(left / 1000) + '초');
        }
    }
    console.log('  연결 — epicSaved:', (typeof epicSaved === 'function' && epicSaved._noKill) ? 'O' : '✗',
        '· epicDeath:', (typeof epicDeath === 'function' && epicDeath._noKill) ? 'O' : '✗',
        '· epicGiveUp:', (typeof epicGiveUp === 'function' && epicGiveUp._noKill) ? 'O' : '✗',
        '· epicDoom:', (typeof epicDoom === 'function' && epicDoom._noKill) ? 'O' : '✗');
    console.log('  (✗ 로 보여도 다른 파일이 바깥에서 한 번 더 감쌌을 수 있습니다)');
};

console.log('[epic] 가만히 있는데 죽던 것 — epicNoKillState()');

})();
