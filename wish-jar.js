// ==========================================
// ★ 「소원권」 → 「🫙 소원권」 이름 갈아타기
// bundles.json 마지막 묶음, newitems.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
//   소원권에 🫙 를 달면서 물품 이름 자체가 바뀌었다. 이 게임은 소지품을
//   이름 문자열로 들고 있어서, 이미 가지고 있던 사람의 것은 ITEM_CATALOG
//   에서 사라진 옛 이름으로 남는다. 설명도 안 뜨고 쓸 수도 없다.
//
//   그래서 들어올 때 한 번 갈아 끼운다. 소지품과 사택 보관함 두 곳이다.
//   (금고는 포인트만 담는다. 장터·선물함에 올라가 있는 것은 건드리지
//    않는다 — 거기서 내려받을 때 이름 그대로 돌아오므로 다음 접속에 잡힌다)
//
//   옛 이름은 ITEM_CATALOG 에 남겨 두지 않는다. 남겨 두면 둘이 따로 쌓인다.

(function wishJar() {

const OLD = '소원권';
const NEW = '🫙 소원권';

function swapList(list) {
    if (!Array.isArray(list)) return 0;
    let n = 0;
    for (let i = 0; i < list.length; i++) {
        const v = list[i];
        if (v === OLD) { list[i] = NEW; n++; }
        else if (v && typeof v === 'object' && v.name === OLD) { v.name = NEW; n++; }
    }
    return n;
}

function run() {
    if (typeof currentUser === 'undefined' || !currentUser) return false;
    if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[NEW]) return false;   // 아직 안 올라왔다

    let n = 0;
    n += swapList(currentUser.inventory);
    if (currentUser.house) n += swapList(currentUser.house.storage);
    if (!n) return true;

    const f = { inventory: 1 };
    if (currentUser.house) f.house = 1;
    try {
        if (typeof saveFields === 'function') saveFields(f);
        else if (typeof saveSelfFull === 'function') saveSelfFull();
    } catch (e) { console.warn('[소원권] 저장 건너뜀:', e && e.message); }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

    console.log('[소원권] 「' + OLD + '」 ' + n + '개를 「' + NEW + '」 으로 바꿨습니다.');
    return true;
}

// 로그인이 끝나고 물품 목록이 다 올라올 때까지 기다린다
let tries = 0;
const iv = setInterval(function () {
    let done = false;
    try { done = run(); } catch (e) { console.warn('[소원권] 건너뜀:', e && e.message); done = true; }
    if (done || ++tries > 120) clearInterval(iv);     // 2분
}, 1000);

// 상담사가 남의 것을 고칠 때
window.wishJarFix = function (code) {
    if (typeof db === 'undefined' || !db.users || !db.users[code]) { console.warn('그런 사번이 없습니다.'); return; }
    const u = db.users[code];
    let n = swapList(u.inventory);
    if (u.house) n += swapList(u.house.storage);
    if (!n) { console.log(u.name + ' 사원에게는 옛 이름이 없습니다.'); return; }
    if (typeof updateUserFields === 'function') {
        updateUserFields(code, { inventory: u.inventory, house: u.house });
    }
    console.log(u.name + ' 사원 — ' + n + '개를 「' + NEW + '」 으로 바꿨습니다.');
};

})();
