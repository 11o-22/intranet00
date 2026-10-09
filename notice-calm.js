// ==========================================
// ★ 위쪽 알림 띠 — 같은 글이 계속 떠다니는 것
// bundles.json 마지막 묶음, ticker-fix.js 바로 뒤
// ==========================================
//
// ■ 왜 안 멈추나
//
//   ticker-fix.js 는 「18초 넘게 떠 있으면 접는다」를 맡는다. 그런데
//   접는 순간 새 줄이 또 들어오면 띠는 곧바로 다시 뜬다. 접는 쪽만
//   고쳐서는 끝이 없다. **들어오는 쪽**을 막아야 한다.
//
//   줄이 들어오는 길은 하나다. (pregnancy.js:93)
//
//       database.ref('notices').limitToLast(1).on('child_added', …)
//           → pushNotice(v.text)
//
//   누군가의 창에서 같은 알림을 거푸 올리면(출산이 안 끝나고 1분마다
//   다시 도는 식으로) 이쪽에서는 20초 안쪽의 새 줄이 계속 들어온다.
//   글자는 같은데 서버 열쇠가 매번 달라서 열쇠로는 못 거른다.
//
// ■ 어떻게 막나
//
//   1. **같은 글은 10분에 한 번만.** 숫자는 빼고 견준다 — 「3개를
//      낳았습니다」와 「2개를 낳았습니다」는 같은 소식으로 본다.
//   2. 서로 다른 글이라도 **8초에 하나씩**, 1분에 여섯 줄까지.
//      그 이상은 버린다.
//   3. 기다리는 줄은 세 줄까지만 쌓는다.
//
//   막은 줄은 콘솔에 남긴다. 조용히 사라지지 않는다.
//
// ■ 콘솔
//   noticeState()    지금 떠 있는지 · 막은 줄 수
//   noticeClear()    상담사 — 서버의 알림 자리를 통째로 비운다

(function noticeCalm() {

const SAME_MS = 10 * 60 * 1000;     // 같은 글을 다시 올리기까지
const GAP_MS = 8000;                // 줄과 줄 사이
const PER_MIN = 6;                  // 1분에 올릴 수 있는 줄
const QUEUE_MAX = 3;                // 쌓아 둘 줄

const seen = {};                    // 다듬은 글 → 마지막으로 올린 때
let lastAt = 0;
let recent = [];                    // 최근 1분에 올린 때들
let dropped = 0, passed = 0;
let lastDrop = '';

// 숫자와 꾸밈을 뺀다 — 「3개를 낳았습니다」와 「2개를 낳았습니다」를 같게 본다
function key(text) {
    return String(text || '')
        .replace(/<[^>]*>/g, '')
        .replace(/[0-9０-９,]+/g, '#')
        .replace(/\s+/g, ' ')
        .trim();
}

function allow(text) {
    const t = Date.now();
    const k = key(text);
    if (!k) return false;

    if (seen[k] && t - seen[k] < SAME_MS) { lastDrop = '같은 글 (' + k + ')'; return false; }
    if (t - lastAt < GAP_MS) { lastDrop = '너무 잦음 (' + k + ')'; return false; }
    recent = recent.filter(function (x) { return t - x < 60000; });
    if (recent.length >= PER_MIN) { lastDrop = '1분에 ' + PER_MIN + '줄까지 (' + k + ')'; return false; }

    seen[k] = t; lastAt = t; recent.push(t);
    Object.keys(seen).forEach(function (x) { if (t - seen[x] > SAME_MS * 3) delete seen[x]; });
    return true;
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof pushNotice !== 'function') return;
        if (pushNotice._calm) { clearInterval(iv); return; }
        const _p = pushNotice;
        pushNotice = function (text) {
            if (!allow(text)) {
                dropped++;
                console.warn('[알림띠] 막았습니다 — ' + lastDrop);
                return;
            }
            passed++;
            const r = _p.apply(this, arguments);
            // 쌓인 줄이 너무 많으면 앞엣것을 버린다
            try {
                if (typeof noticeQueue !== 'undefined' && noticeQueue.length > QUEUE_MAX) {
                    noticeQueue.splice(0, noticeQueue.length - QUEUE_MAX);
                }
            } catch (e) { }
            return r;
        };
        pushNotice._calm = true;
        clearInterval(iv);
        console.log('[알림띠] 거푸 뜨는 줄 막기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 확인 · 치우기
// ==========================================
window.noticeState = function () {
    console.log('%c===== 위쪽 알림 띠 =====', 'color:#ffd700; font-size:13px');
    const b = document.getElementById('notice-ticker');
    console.log('  떠 있나:', (b && b.style.display !== 'none') ? 'O' : '✗');
    try { console.log('  기다리는 줄:', (typeof noticeQueue !== 'undefined') ? noticeQueue.length : '?'); } catch (e) { }
    console.log('  올린 줄:', passed, '· 막은 줄:', dropped, dropped ? ('· 마지막: ' + lastDrop) : '');
    const t = Date.now();
    const rows = Object.keys(seen).map(function (k) {
        return { 글: k.slice(0, 40), '올린 지': Math.round((t - seen[k]) / 1000) + '초' };
    });
    if (rows.length) console.table(rows);
    console.log('  손으로 접으려면 tickerFold() · 서버 알림을 비우려면 noticeClear()');
};

window.noticeClear = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    database.ref('notices').set(null).then(function () {
        try { if (typeof noticeQueue !== 'undefined') noticeQueue.length = 0; } catch (e) { }
        if (typeof window.tickerFold === 'function') window.tickerFold();
        console.log('%c✓ 서버의 알림 자리를 비웠습니다.', 'color:#4CAF50');
    }).catch(function (e) { console.error(e); });
};

console.log('[알림띠] 거푸 뜨는 줄 막기 — noticeState() · noticeClear()');

})();
