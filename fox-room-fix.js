// ==========================================
// 🦊 상담실 · ♨ 선녀탕 — 들어가는 도중에 「어디로 갈까」 칸이 다시 뜨던 것
// bundles.json 마지막 묶음, pollution-fix.js 뒤
// ==========================================
//
// ■ 무엇이 일어나고 있었나
//
//   오염이 100% 가 되면 이런 차례로 갑니다.
//
//       ① 경고 (fox-loading-overlay)        3초
//       ② 어디로 갈까 (quarantine-pick-overlay)
//       ③ 문답 (fox-room-overlay)           여러 쪽
//       ④ 들어간다 (fox-modal · bath-modal)
//
//   그런데 ③ 문답을 하는 **도중에** updateUI() 가 한 번 돌면,
//
//       index.html:5864
//       if (오염 >= 100 && !darkRun) {
//           if (격리시각이 없거나 지났으면) {
//               if (!foxRoomAnswered) {
//                   if (!hasShownFoxAlert) { … checkFoxRoomEntry(); }
//
//   이 줄이 그대로 맞아떨어집니다. 문답 중에는 **격리시각이 아직 0 이고
//   foxRoomAnswered 도 아직 false** 이기 때문입니다. hasShownFoxAlert 는
//   pollution-fix.js 가 20초마다 풀어 주므로 막아 주지 못합니다.
//
//   그러면 startFoxRoomSequence() 가 **한 번 더** 돌고, 그 안의 3초 시계가
//   나중에 터져서 「어디로 갈까」 칸이 **이미 들어가 있는 상담실·선녀탕 위로
//   다시 올라옵니다.** 들어가자마자 고르는 화면이 덮어 버리는 꼴입니다.
//
//   실제로 재어 본 차례 (선녀탕을 고른 경우)
//
//          2ms  startFoxRoomSequence         ← 처음
//       3004ms  고르는 칸 뜸
//       3619ms  고르는 칸 닫힘 (선녀탕 고름)
//       5912ms  startFoxRoomSequence         ← updateUI 가 또 부른다 (문답 중)
//       8914ms  고르는 칸 **다시 뜸**         ← 선녀탕 위로 덮인다
//
// ■ 어떻게 고치나
//
//   ① 절차가 이미 돌고 있으면 startFoxRoomSequence() 를 **안 돈다.**
//      (경고·고르기·문답·명패 칸이 떠 있거나, 이미 들어가 있으면)
//   ② 이미 격리된 사람(격리시각이 앞으로)에게도 **안 돈다.**
//      ①과 ② 사이에 틈이 없다 — 문답이 끝나면 바로 격리시각이 적히고,
//      그 1.2초 뒤에 방이 열린다.
//   ③ 그래도 먼저 걸려 있던 3초 시계가 터질 수 있으므로, 고르는 칸이
//      **뜨는 순간** 다시 한 번 본다. 이미 격리됐거나 방이 열려 있으면
//      그 자리에서 도로 닫는다.
//
// ■ 확인
//       foxRoomCheck()   지금 어느 칸이 떠 있나 · 막힌 적이 있나

(function foxRoomFix() {

const IDS = ['fox-loading-overlay', 'quarantine-pick-overlay',
             'fox-room-overlay', 'fox-nameplate-overlay',
             'fox-modal', 'bath-modal'];
const blocked = [];

function shown(id) {
    const e = document.getElementById(id);
    if (!e) return false;
    // display 를 인라인으로만 여닫는 칸들이라 computed 로 본다 (더 안전하다)
    try { return getComputedStyle(e).display !== 'none'; } catch (x) { return false; }
}
function anyOpen() { return IDS.some(shown); }
function quarantined() {
    try {
        const u = currentUser;
        return !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil);
    } catch (x) { return false; }
}
function note(why) {
    blocked.push({ 때: new Date().toLocaleTimeString(), 까닭: why });
    while (blocked.length > 40) blocked.shift();
    console.log('[상담실] 절차를 또 시작하려는 것을 막았습니다 — ' + why);
}

// ── ①·② 절차를 두 번 시작하지 않는다
let on = false;
function install() {
    if (on) return true;
    if (typeof startFoxRoomSequence !== 'function') return false;
    if (startFoxRoomSequence._once) { on = true; return true; }
    const _s = startFoxRoomSequence;
    startFoxRoomSequence = function () {
        if (quarantined()) { note('이미 격리 중'); return; }
        if (anyOpen()) { note('절차가 이미 떠 있음'); return; }
        return _s.apply(this, arguments);
    };
    startFoxRoomSequence._once = true;
    on = true;
    console.log('[상담실] 들어가는 도중에 고르는 칸이 다시 뜨던 것을 막았습니다');
    return true;
}
const iv = setInterval(function () { if (install()) clearInterval(iv); }, 500);
setTimeout(function () { clearInterval(iv); }, 30000);

// ── ③ 먼저 걸려 있던 3초 시계가 터져도 — 뜨는 순간 다시 본다
(function watch() {
    const el = document.getElementById('quarantine-pick-overlay');
    if (!el) { setTimeout(watch, 500); return; }
    new MutationObserver(function () {
        if (getComputedStyle(el).display === 'none') return;
        // 이미 격리됐거나 방에 들어가 있으면 고를 일이 없다
        if (quarantined() || shown('fox-modal') || shown('bath-modal')) {
            el.style.display = 'none';
            note('늦게 터진 시계 — 도로 닫음');
        }
    }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
})();

// ── 확인
window.foxRoomCheck = function () {
    console.log('%c===== 상담실 · 선녀탕 =====', 'color:#d4af37; font-size:13px');
    IDS.forEach(function (id) { console.log('  ' + id + ' :', shown(id) ? '떠 있음' : '닫힘'); });
    try {
        console.log('  오염도 :', currentUser.pollution,
            '· 격리까지 :', currentUser.quarantineUntil
                ? Math.round((currentUser.quarantineUntil - Date.now()) / 36e5 * 10) / 10 + '시간' : '안 걸림',
            '· 간 곳 :', currentUser.quarantineDest || '(안 고름)',
            '· 문답 끝났나 :', !!currentUser.foxRoomAnswered);
    } catch (e) { }
    if (!blocked.length) { console.log('  막은 적 없음'); return; }
    console.table(blocked);
};

console.log('[상담실] foxRoomCheck()');

})();
