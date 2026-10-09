// ==========================================
// ★ 기준이 서기 전에 움직인 돈 — 덮어쓰지 않고 모아 둔다
// bundles.json 마지막 묶음, save-merge.js 바로 앞
// ==========================================
//
// ■ 남아 있던 구멍
//
//   save-merge.js 는 돈을 「값」이 아니라 **「움직인 몫」** 으로 보낸다.
//   그래서 두 창이 겹쳐도 둘 다 살아남는다. 다만 그러려면 **기준**
//   (서버에서 마지막으로 본 내 모습)이 서 있어야 한다.
//
//       changePoints = function (delta) {
//           if (!ready || …) return _c.apply(this, arguments);   ← 원래 길
//           …움직인 몫으로 보낸다
//       };
//
//   기준은 로그인한 뒤 서버에서 내 자리를 한 번 받아야 선다. 그 사이
//   몇 초 동안은 **원래 길**, 곧 값을 통째로 밀어 넣는 길로 간다.
//   들어가자마자 상비약을 받거나 이자가 붙거나 누가 돈을 보내 주면
//   그 창에서 어긋난다.
//
//   그리고 들어오자마자 도는 일이 적지 않다 — 상비약 정기 지급, 은행
//   이자, 공용 통장 정산, 선물함. 짧지만 비어 있는 창이 아니다.
//
// ■ 어떻게 막나
//
//   기준이 서기 전에는 **서버에 쓰지 않는다.** 화면의 숫자만 움직이고
//   「보낼 것이 있다」고 적어 둔다. 기준이 서면 그때 한 번 보낸다.
//
//   그때 save-merge 는 「지금 값 − 기준」을 보내는데, 그 차이가 바로
//   모아 둔 몫이다. 따로 다시 세지 않아도 정확히 맞는다.
//
//   기준이 영영 안 서면(병합이 안 올라왔다면) 8초 뒤에 원래 길로 보낸다.
//   돈을 들고 있다가 잃는 것보다는 낫다.
//
// ■ 겹쳐 두르는 순서
//
//   이 파일은 save-merge.js 보다 **먼저** 선다. 그래서 save-merge 가
//   바깥, 이 파일이 안쪽이 된다. 기준이 섰을 때는 바깥이 알아서
//   처리하고, 기준이 없을 때만 안쪽인 여기로 내려온다. 딱 맞는 자리다.
//
// ■ 콘솔
//   ptsSafeState()     모아 둔 몫이 있는지

(function pointsSafe() {

const GIVE_UP = 8000;          // 이만큼 지나도 기준이 안 서면 원래 길로

let held = 0;                  // 모아 둔 몫
let since = 0;                 // 언제부터 모았나
let sent = 0;                  // 지금까지 몇 번 흘려보냈나

function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : Infinity; }
function merged() { return typeof window.mergeReady === 'function' && window.mergeReady(); }
function hasMerge() { return typeof window.mergeReady === 'function'; }

(function hook() {
    const iv = setInterval(function () {
        if (typeof changePoints !== 'function') return;
        if (changePoints._safe) { clearInterval(iv); return; }

        const _c = changePoints;
        const wrapped = function (delta) {
            const d = Number(delta) || 0;
            // 병합이 아예 없거나 이미 기준이 섰으면 원래 길로 (바깥이 처리한다)
            if (!d || !currentUser || !hasMerge() || merged()) return _c.apply(this, arguments);

            // 기준이 서기 전 — 화면만 움직이고 모아 둔다
            const was = Number(currentUser.points) || 0;
            currentUser.points = Math.max(0, Math.min(cap(), was + d));
            held += d;
            if (!since) since = Date.now();
            console.warn('[돈] 기준이 서기 전입니다 — ' + (d > 0 ? '+' : '') + d.toLocaleString()
                + ' P 를 모아 둡니다 (모은 몫 ' + held.toLocaleString() + ' P)');
            if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
        };
        wrapped._safe = true;
        changePoints = wrapped;
        clearInterval(iv);
        console.log('[돈] 기준 서기 전 모아 두기 연결');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// 기준이 서면 흘려보낸다
setInterval(function () {
    try {
        if (!held || !currentUser) return;

        if (merged()) {
            const n = held;
            held = 0; since = 0; sent++;
            // save-merge 가 「지금 값 − 기준」을 보낸다. 그 차이가 모아 둔 몫이다.
            if (typeof saveFields === 'function') saveFields({ points: 1 });
            console.log('[돈] 기준이 섰습니다 — 모아 둔 ' + (n > 0 ? '+' : '') + n.toLocaleString() + ' P 를 보냅니다');
            return;
        }

        // 기준이 끝내 안 선다 — 원래 길로라도 보낸다
        if (since && Date.now() - since > GIVE_UP) {
            const n = held;
            held = 0; since = 0; sent++;
            console.warn('[돈] 기준이 서지 않아 원래 길로 보냅니다 — ' + n.toLocaleString() + ' P');
            if (typeof saveFields === 'function') saveFields({ points: 1 });
        }
    } catch (e) { }
}, 700);

window.ptsSafeState = function () {
    console.log('%c===== 기준 서기 전 모아 둔 돈 =====', 'color:#ffd700; font-size:13px');
    console.log('  병합 올라옴:', hasMerge() ? 'O' : '✗',
        '· 기준 섰나:', merged() ? 'O' : '✗');
    console.log('  모아 둔 몫:', held.toLocaleString() + ' P',
        since ? ('· ' + Math.round((Date.now() - since) / 1000) + '초째') : '');
    console.log('  흘려보낸 횟수:', sent);
    console.log('  움직인 내역은 ptsState() 에서 봅니다');
};

console.log('[돈] 기준 서기 전 모아 두기 — ptsSafeState()');

})();
