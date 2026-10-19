// ==========================================
// ★ 삼킨 마침표 — 한 번에 하나만 (2026-10-19)
// bundles.json 마지막 묶음, disaster.js 뒤
// ==========================================
//
// ■ 무엇이 문제였나
//   「이해도가 한계를 넘어도 한 번은 버틴다」인데 계속 버티는 일이 있었다.
//
//   ① 다 쓴 뒤에도 서버에 한 번이 남았다 — 쓰면 nFlags 가 {} 가 되는데 빈 객체는 서버에
//      안 간다. 새로고침 · 다음 탐사 때 되살아났다. → birth-end.js 의 keepFlags 에서 고쳤다
//      (0 이 된 칸은 null 로 지운다 — 물린 손수건 · 진통제 같은 다른 횟수형도 같은 자리).
//   ② 여러 개를 쓰면 쓴 만큼 쌓였다 (nPending 에 +1 씩). 삼킨 마침표를 세 개 먹으면 세 번 버텼다.
//
// ■ 이제
//   · 한 번에 하나만 든다. 이미 들어 있으면(다음 탐사에 들어갈 것 · 이번 탐사에 남은 것) 더 못 쓴다.
//     물건은 소지품에 그대로 남는다.
//   · 이미 둘 이상 쌓여 있던 사람은 들어올 때 하나로 줄인다.
//
// ■ 콘솔
//   periodState()

(function s3Period() {

const NAME = '삼킨 마침표';
const KEY = 's3_period';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function cnt(u) {
    const f = (u && u.nFlags) || {}, p = (u && u.nPending) || {};
    return { now: Number(f[KEY]) || 0, next: Number(p[KEY]) || 0 };
}

// ── 쓰기 전에 본다
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._s3period) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName === NAME) {
                const c = cnt(u_());
                if (c.now + c.next >= 1) {
                    try {
                        showCustomAlert('이미 삼킨 마침표가 있습니다.\n\n한 번에 하나만 듭니다. '
                            + (c.now ? '이번 탐사에서 아직 쓰지 않았습니다.' : '다음 탐사에 들어갑니다.'));
                    } catch (e) { }
                    return;
                }
            }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._s3period = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ── 이미 쌓여 있던 것은 하나로
let fixedFor = '';
setInterval(function () {
    const u = u_();
    if (!u || !u.code || fixedFor === u.code) return;
    fixedFor = u.code;
    const c = cnt(u);
    if (c.now <= 1 && c.next <= 1 && !(c.now && c.next)) return;
    const up = {};
    if (c.now >= 1) {                                   // 지금 쓸 수 있는 것이 있으면 그것 하나만
        u.nFlags[KEY] = 1; up['nFlags/' + KEY] = 1;
        if (c.next) { delete u.nPending[KEY]; up['nPending/' + KEY] = null; }
    } else {
        u.nPending[KEY] = 1; up['nPending/' + KEY] = 1;
    }
    try { database.ref('users/' + u.code).update(up); } catch (e) { }
    console.log('[삼킨 마침표] 쌓여 있던 것을 하나로 줄였습니다 (지금 ' + c.now + ' · 다음 ' + c.next + ')');
}, 3000);

window.periodState = function () {
    const c = cnt(u_());
    console.log('%c===== 삼킨 마침표 =====', 'color:#d4af37; font-size:13px');
    console.log('  이번 탐사에 남은 것:', c.now, '· 다음 탐사에 들어갈 것:', c.next);
    console.log('  소지품:', ((u_() && u_().inventory) || []).filter(function (x) { return x === NAME; }).length + '개');
};

})();
