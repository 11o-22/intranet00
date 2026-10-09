// ==========================================
// ★ 위쪽 알림 띠가 안 사라지던 것
// bundles.json 마지막 묶음, inv-shout.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 한 자리를 두 사람이 몬다
//
//   화면 맨 위 검은 띠(#notice-ticker)를 미는 길이 두 가지다.
//
//       pushNotice / runNotice   dark.js:13295   출산·결투 알림
//       showPregTicker           pregnancy.js:110  확성기(inv-shout.js)
//
//   둘은 글자를 흘리는 방식도, 띠를 접는 방식도 다르다.
//
//       runNotice        .running 클래스 → CSS 의 tickerSlide 14초
//                        14초 뒤 줄이 비어 있을 때만 접는다
//       showPregTicker   el.style.animation 에 직접 pregSlide 13초
//                        13초 뒤 무조건 접는다
//
//   ① **직접 적은 animation 이 클래스를 이긴다.** 확성기가 한 번 돌고 나면
//      그 줄이 글자 칸에 눌러앉아, 그 뒤로 runNotice 가 아무리 클래스를
//      붙였다 떼도 글자가 흐르지 않는다. 제자리에 그냥 서 있는다.
//
//   ② 접는 자리가 **줄이 비어 있을 때만** 돈다. 화면을 끄거나 다른 앱으로
//      넘어가면 그 14초짜리 시계가 제때 안 울린다 (휴대폰은 뒤로 넘어간 탭의
//      시계를 미뤄 둔다). 돌아와 보면 띠가 그대로 떠 있다.
//
//   ③ 글자 칸을 못 찾으면 runNotice 가 그냥 물러나는데, 그때 「도는 중」
//      표가 켜진 채로 굳어 다시는 안 접힌다.
//
// ■ 어떻게 고치나
//
//   1. 모는 사람을 하나로 — showPregTicker 를 pushNotice 로 넘긴다.
//      흘리는 방식도 접는 방식도 하나가 된다.
//   2. 눌러앉은 직접 animation 을 떼어 낸다.
//   3. 지켜보는 눈을 하나 둔다 — 띠가 18초 넘게 떠 있으면 접고,
//      굳은 표(noticeRunning)와 남은 줄도 비운다.
//
// ■ 콘솔
//   tickerState()   지금 띠가 떠 있는지 · 남은 줄

(function tickerFix() {

const LIMIT = 18000;        // 이보다 오래 떠 있으면 접는다 (한 줄은 14초)

function bar() { return document.getElementById('notice-ticker'); }
function textEl() { return document.getElementById('notice-ticker-text'); }
function shown() {
    const b = bar();
    return !!b && b.style.display !== 'none';
}

// ==========================================
// 1. 확성기도 같은 길로 보낸다
// ==========================================
(function oneOwner() {
    const iv = setInterval(function () {
        if (typeof showPregTicker !== 'function' || typeof pushNotice !== 'function') return;
        if (showPregTicker._one) { clearInterval(iv); return; }
        showPregTicker = function (text) {
            clearTimeout(window._pregTick);          // 옛 길이 걸어 둔 시계를 끈다
            try { pushNotice(text); } catch (e) { console.warn('[알림띠]', e); }
        };
        showPregTicker._one = true;
        clearInterval(iv);
        console.log('[알림띠] 확성기도 같은 길로 보냅니다');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 2·3. 지켜보는 눈
// ==========================================
let since = 0;

function fold(why) {
    const b = bar(), el = textEl();
    if (b) b.style.display = 'none';
    if (el) {
        el.classList.remove('running');
        el.style.animation = '';                     // 눌러앉은 줄을 떼어 낸다
    }
    clearTimeout(window._pregTick);
    try { if (typeof noticeQueue !== 'undefined') noticeQueue.length = 0; } catch (e) { }
    try { if (typeof noticeRunning !== 'undefined') noticeRunning = false; } catch (e) { }
    since = 0;
    console.log('[알림띠] 접었습니다 — ' + why);
}
window.tickerFold = function () { fold('손으로'); };

setInterval(function () {
    try {
        const el = textEl();
        // 눌러앉은 직접 animation 은 보이는 동안에도 떼어 둔다
        if (el && /pregSlide/.test(el.style.animation || '')) el.style.animation = '';

        if (!shown()) { since = 0; return; }
        if (!since) { since = Date.now(); return; }
        if (Date.now() - since < LIMIT) return;
        fold('18초가 넘었습니다');
    } catch (e) { }
}, 1000);

// 화면으로 돌아왔을 때도 한 번 본다 (뒤로 넘어가 있던 동안 시계가 밀린다)
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    setTimeout(function () {
        if (shown() && since && Date.now() - since >= LIMIT) fold('돌아와 보니 떠 있었습니다');
    }, 600);
});

// ==========================================
// 확인
// ==========================================
window.tickerState = function () {
    console.log('%c===== 위쪽 알림 띠 =====', 'color:#ffd700; font-size:13px');
    const el = textEl();
    console.log('  떠 있나:', shown() ? 'O' : '✗',
        since ? ('· ' + Math.round((Date.now() - since) / 1000) + '초째') : '');
    console.log('  글자:', el ? (el.innerText || '(비어 있음)') : '(칸 없음)');
    console.log('  직접 적힌 animation:', (el && el.style.animation) || '(없음)',
        '· running 클래스:', (el && el.classList.contains('running')) ? 'O' : '✗');
    try { console.log('  남은 줄:', (typeof noticeQueue !== 'undefined') ? noticeQueue.length : '?',
        '· 도는 중 표:', (typeof noticeRunning !== 'undefined') ? noticeRunning : '?'); } catch (e) { }
    console.log('  확성기 연결:', (typeof showPregTicker === 'function' && showPregTicker._one) ? 'O' : '✗');
    console.log('  손으로 접으려면 tickerFold()');
};

console.log('[알림띠] 안 사라지던 것 — tickerState()');

})();
