// ==========================================
// ★ 펫 자리를 서버와 맞춰 둔다
// bundles.json 마지막 묶음, empty-null.js 보다 뒤
// ==========================================
//
// ■ 왜 필요한가
//
//   save-merge.js 가 켜져 있으면 index.html 의 applyMine 이 서버 모습을
//   currentUser 에 덮어쓰지 않는다 (index.html:1372).
//
//       if (!(typeof saveSelfFull === 'function' && saveSelfFull._merge))
//           applyServerMe(srv);
//
//   돈·소지품처럼 save-merge 가 따로 맞춰 주는 칸은 그래도 된다. 그런데
//   펫 칸은 save-merge 가 모른다. 그래서 **켜 둔 화면은 펫이 생긴 것을
//   끝까지 모른다.** 휴대폰에서 알을 깨워도 PC 쪽은 계속 「입양 전」이고,
//   알을 샀는지도 모른다.
//
//   모르는 것으로 끝나지 않았다. 그 화면이 아무거나 한 번 저장하면
//   비어 있는 펫 칸이 서버로 올라가 **휴대폰에서 깨운 펫을 지웠다.**
//   (그 지우는 쪽은 empty-null.js 가 막는다. 여기서는 모르는 쪽을 고친다.)
//
// ■ 무엇을 하나
//
//   내 자리의 펫 칸 일곱에 귀를 달아 두고, 서버가 바뀌면 currentUser 를
//   맞추고 화면을 다시 그린다.
//
//       pets · petEgg · petEggAt · petBag · petFood · petShow · petWith · petRune · petRuneDay · petStayUntil · petSleepUntil
//
//   내가 쓴 것은 파이어베이스가 바로 되돌려 주므로 값이 같아 그냥 넘어간다.
//   저장이 날아가는 중(pendingSaves)에 「없음」이 오면 받지 않는다 —
//   내 쓰기가 아직 서버에 안 닿은 때라서다.
//
// ■ 콘솔
//   petSyncState()   무엇을 보고 있나 · 몇 번 맞췄나

(function petSync() {

const KEYS = ['pets', 'petEgg', 'petEggAt', 'petBag', 'petFood', 'petShow', 'petWith', 'petRune', 'petRuneDay',   // ★ 룬 주머니 (pet-rune.js · 2026-10-27)
              'petStayUntil', 'petSleepUntil'];   // ★ 🏠 집 지킴이 방석 · 💤 잠듦 (2026-10-28) — 휴대폰에서 깐 방석을 PC 가 몰라 펫이 K 의 방에 따라붙던 것

let bound = '';
let refs = [];
let hits = 0;
const last = {};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }

function same(a, b) {
    try {
        return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
    } catch (e) { return false; }
}

function saving() {
    try { return (typeof pendingSaves === 'number') && pendingSaves > 0; } catch (e) { return false; }
}

function repaint() {
    try { if (typeof petRoomPaint === 'function') petRoomPaint(); } catch (e) { }
    try { if (window.PETFOOD && PETFOOD.paint) PETFOOD.paint(); } catch (e) { }
    try {
        const sh = document.getElementById('shop-dream');
        if (sh && sh.classList.contains('active') && typeof renderDream === 'function') renderDream();
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
}

function off() {
    refs.forEach(function (r) { try { r.off(); } catch (e) { } });
    refs = [];
}

function bind() {
    const u = u_();
    if (!u || !u.code) return;
    if (typeof database === 'undefined' || !database) return;
    if (bound === u.code) return;

    off();
    bound = u.code;
    const code = u.code;

    KEYS.forEach(function (k) {
        const r = database.ref('users/' + code + '/' + k);
        refs.push(r);
        r.on('value', function (sn) {
            const me = u_();
            if (!me || me.code !== code || bound !== code) return;
            const v = sn.val();
            if (same(me[k], v)) return;
            // 내 쓰기가 아직 안 닿았는데 「없음」이 온 것이면 받지 않는다
            if (v === null && saving()) return;

            if (v === null) delete me[k]; else me[k] = v;
            last[k] = new Date().toLocaleTimeString();
            hits++;
            repaint();
        });
    });
    console.log('[펫] 서버와 맞춰 둡니다 — petSyncState()');
}

setInterval(function () { try { bind(); } catch (e) { } }, 1200);

window.petSyncState = function () {
    console.log('%c===== 펫 맞추기 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  보고 있는 사원 :', bound || '없음', '· 귀', refs.length, '개');
    console.log('  맞춘 횟수 :', hits);
    const u = u_();
    if (u) {
        const ps = (window.PET ? PET.pets(u) : (u.pets || {}));
        console.log('  지금 펫 :', Object.keys(ps).length, '마리',
            '· 알', (u.petEgg && u.petEgg.warn) ? '있음' : '없음',
            '· 산 날', u.petEggAt || '-');
    }
    if (Object.keys(last).length) console.table(last);
};

})();
