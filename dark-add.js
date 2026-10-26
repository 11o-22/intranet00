// ==========================================
// ★ 「어둠 탐사 +n회」 — 쓴 횟수를 깎지 않고 그날 한도에 얹는다 (어둠 · K 의 방 둘 다)
// bundles.json 마지막 묶음 (dark-count.js · count-cap.js 뒤)
// ==========================================
//
// ■ 무엇이 안 됐나 (2026-10-27)
//
//   돈코츠 라멘 · 뜨겁지 않은 국 · 밤샘 신청서 · 엽서의 「어둠 탐사 +1」 · 출산품의 「어둠 탐사 +n」은
//   모두 「쓴 횟수(darkTries)를 하나 깎는」 식이었다.
//     · 아직 한 번도 안 갔으면 깎을 것이 없다 (0 에서 멈춘다) — 「+1회」 알림만 뜨고 그대로 8회.
//     · 가고 나서 써도, 쓴 횟수는 darkUse 한 곳에서 센다(dark-count.js). 소지품을 쓰면서 통째 저장이
//       같이 나가 그 값이 「사원 기록에서 받아 온 값」으로 읽혀 되돌려졌다 — 역시 그대로.
//   K 의 방은 횟수 칸(kroomUse)이 따로라 처음부터 닿지 않았다.
//
// ■ 어떻게 두나
//
//   그날 더 받은 횟수를 darkAdd/<사번> = { d: 날짜, n: 더 받은 수 } 한 곳에 트랜잭션으로 더한다.
//   (사원 기록 밖이라 통째 저장이 덮지 못한다 — darkUse · kroomUse 와 같은 까닭. 자정에 저절로 0)
//     어둠 탐사   남은 횟수 = 8 + 더 받은 수 − 쓴 횟수  (index.html getDarkTriesLeft)
//     K 의 방     한도     = 지금 한도 + 더 받은 수      (kroom-core.js kLimit)
//   더 받은 수는 천장(어둠 12 · 15 / K 의 방 55 · 70) 밖에 얹는다 — 적힌 「+n회」가 그대로 들어간다.
//   (밤샘 신청서의 하루 2번은 그대로)
//
//   식당 ★ · 디저트 · 🦊 호사수구 · 고유 아이템처럼 버프(itemBuffs)로 얹는 것은 원래대로 —
//   어둠 · K 의 방 한도에 이미 들어간다.
//
// ■ 콘솔
//   darkAddState()      오늘 더 받은 수 · 어둠 · K 의 방 남은 횟수
//   darkAddGive(n)      내게 n 을 더한다 (시험용)

(function darkAdd() {

const NODE = 'darkAdd';
const S = { code: '', ref: null, synced: null, ready: false, pend: 0 };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function today() { try { return getTodayStr(); } catch (e) { return ''; } }
function view(v) { const t = today(); return (v && v.d === t) ? Math.max(0, Number(v.n) || 0) : 0; }
function cache(v) { try { localStorage.setItem(NODE + '_' + S.code, JSON.stringify(v || {})); } catch (e) { } }
function cached(code) { try { return JSON.parse(localStorage.getItem(NODE + '_' + code) || 'null'); } catch (e) { return null; } }

function bind() {
    const u = u_(), d = db_();
    if (!u || !u.code || !d) return;
    if (S.code === u.code) return;
    try { if (S.ref) S.ref.off(); } catch (e) { }
    S.code = u.code; S.synced = cached(u.code); S.ready = false; S.pend = 0;
    S.ref = d.ref(NODE + '/' + u.code);
    S.ref.on('value', function (s) { S.synced = s.val() || null; S.ready = true; cache(S.synced); repaint(); });
}
setInterval(function () { try { bind(); } catch (e) { } }, 1000);

function repaint() {
    try {
        const box = document.getElementById('darkness-body');
        if (box && box.offsetParent && typeof renderDarkness === 'function'
            && !(typeof darkRun !== 'undefined' && darkRun)) renderDarkness();
    } catch (e) { }
}

// 오늘 더 받은 수 (내 것)
window.darkAddToday = function () {
    const u = u_();
    if (!u || !u.code) return 0;
    if (S.code !== u.code) { try { bind(); } catch (e) { } }
    return view(S.synced) + Math.max(0, S.pend);
};

// 더한다 — 내 것이면 화면에 바로 얹고 서버에는 트랜잭션으로
function giveTo(code, n) {
    const d = db_();
    n = Math.max(0, Math.floor(Number(n) || 0));
    if (!d || !code || !n) return Promise.resolve(false);
    const t = today();
    const mine = (S.code && code === S.code);
    if (mine) S.pend += n;
    const ref = mine ? S.ref : d.ref(NODE + '/' + code);
    return ref.transaction(function (cur) {
        const base = (cur && cur.d === t) ? Math.max(0, Number(cur.n) || 0) : 0;
        return { d: t, n: base + n };
    }).then(function (r) {
        if (mine) {
            S.pend = Math.max(0, S.pend - n);
            if (r && r.snapshot) { S.synced = r.snapshot.val(); cache(S.synced); }
            repaint();
        }
        return !!(r && r.committed);
    }).catch(function (e) {
        if (mine) S.pend = Math.max(0, S.pend - n);
        console.warn('[횟수] 더 받은 횟수 적기 실패', e && e.message);
        return false;
    });
}
window.darkAddGive = function (n) { const u = u_(); return u ? giveTo(u.code, n) : Promise.resolve(false); };
window.darkAddGiveTo = giveTo;

window.darkAddState = function () {
    console.log('%c===== 어둠 탐사 +n (darkAdd) =====', 'color:#ff8a80; font-size:13px');
    console.log('  오늘 더 받은 수:', window.darkAddToday(), '· 서버', JSON.stringify(S.synced), S.pend ? '· 보내는 중 ' + S.pend : '');
    console.log('  어둠 남은 횟수:', (typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft() : '-',
        '· K 의 방 남은 횟수:', (typeof window.kroomTriesLeft === 'function') ? window.kroomTriesLeft() : '-',
        '/ 한도', (typeof window.kroomTryLimit === 'function') ? window.kroomTryLimit() : '-');
};

})();
