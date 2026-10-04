// ==========================================
// ★ 사택 보관함 — 연결이 나쁠 때 넣으면 불어나는 것
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 일어나고 있나
//
//   넣기는 이렇게 생겼습니다. (dark.js:8417)
//
//       database.ref(`users/${주인}/house/storage`).transaction(arr => {
//           arr.push(entry);
//           return arr;
//       }).then(res => {
//           ...
//           removeItemFromInventory(currentUser, itemName, 1);   ← 여기서야 빠진다
//       });
//
//   소지품에서 빠지는 것이 **서버가 답한 뒤**입니다.
//   그래서 연결이 끊기거나 느리면 이렇게 됩니다.
//
//     1. 넣기를 누른다 → 거래가 떠 있는 채로 멈춘다
//     2. 소지품에 그대로 보이니 「안 들어갔나?」 싶어 다시 누른다
//        (buyGuard 는 0.7초만 막습니다 — index.html:7671)
//     3. 연결이 돌아오면 **밀려 있던 거래가 전부 한꺼번에 들어간다**
//     4. 보관함에 같은 물건이 서넛 생긴다. 소지품에서는 하나만 빠진다
//
//   파이어베이스 거래는 눌린 즉시 내 쪽 화면에도 먼저 반영돼서,
//   끊긴 채로 눌러도 보관함 목록은 늘어나 보입니다. 그래서 더 누르게 됩니다.
//
// ■ 어떻게 고치나
//
//   넣기를 다시 세웁니다. 세 가지가 달라집니다.
//
//     1. 끊겨 있으면 아예 안 받는다
//        .info/connected 로 지금 붙어 있는지 봅니다. (index.html:2427 과 같은 자리)
//
//     2. 소지품에서 **먼저** 뺀다
//        누른 순간 목록에서 사라지니 다시 누를 까닭이 없어집니다.
//        실패하면 도로 넣어 줍니다.
//
//     3. 그 물건은 답이 올 때까지 다시 못 넣는다
//        0.7초가 아니라 「끝날 때까지」입니다.
//
//   거래에 applyLocally = false 를 줘서, 서버가 받아 주기 전에는
//   내 화면의 보관함도 안 늘어나게 했습니다.
//
// ■ 이미 불어난 것
//
//   storageDup() 으로 보관함에서 겹친 것을 찾습니다.
//   같은 물건을 같은 사람이 **같은 순간에** 넣은 것만 겹침으로 봅니다
//   (entry 에 넣은 시각 at 이 들어 있어 가려낼 수 있습니다).
//   storageDupFix() 로 하나만 남기고 걷어냅니다.

(function storageDup() {

const SLOW = '연결이 불안정합니다.\n\n연결이 돌아온 뒤에 넣어 주세요.\n(지금 넣으면 같은 물건이 여러 개 들어갈 수 있습니다)';

let online = true;
let busy = {};              // 지금 넣는 중인 물건

(function watchNet() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        database.ref('.info/connected').on('value', function (s) {
            online = s.val() === true;
        });
    }, 500);
})();

(function swap() {
    const iv = setInterval(function () {
        if (typeof putToStorage !== 'function') return;
        if (typeof houseStorageRef !== 'function' || typeof houseStorageMax !== 'function') return;
        if (putToStorage._noDup) { clearInterval(iv); return; }

        putToStorage = function (itemName) {
            if (!currentUser || typeof database === 'undefined' || !database) return;
            if (!(currentUser.inventory || []).includes(itemName)) {
                showCustomAlert('해당 물품이 없습니다.'); return;
            }
            if (busy[itemName]) {
                showCustomAlert('넣는 중입니다.\n\n잠시만 기다려 주세요.'); return;
            }
            if (!online) { showCustomAlert(SLOW); return; }
            if (typeof buyGuard === 'function' && !buyGuard()) return;

            const ownerCode = houseStorageRef(currentUser);
            const entry = { name: itemName, by: currentUser.name, byCode: currentUser.code, at: Date.now() };

            // ★ 먼저 뺀다 — 목록에서 사라지니 다시 누를 일이 없다
            busy[itemName] = true;
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
            if (typeof saveFields === 'function') saveFields({ inventory: 1 });
            if (typeof updateUI === 'function') updateUI();
            if (typeof renderHouseStorage === 'function') renderHouseStorage();

            let done = false;
            const giveBack = function (msg) {
                if (done) return; done = true;
                delete busy[itemName];
                if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
                currentUser.inventory.push(itemName);        // 도로 넣어 준다
                if (typeof saveFields === 'function') saveFields({ inventory: 1 });
                if (typeof updateUI === 'function') updateUI();
                if (typeof renderHouseStorage === 'function') renderHouseStorage();
                if (msg) showCustomAlert(msg);
            };

            database.ref('users/' + ownerCode + '/house/storage').transaction(function (arr) {
                arr = arr ? (Array.isArray(arr) ? arr : Object.values(arr)) : [];
                if (arr.length >= houseStorageMax(currentUser)) return;    // 가득 참
                arr.push(entry);
                return arr;
            }, function (err, committed, snap) {
                if (err) { giveBack('넣지 못했습니다.\n\n' + (err.message || '연결이 끊겼습니다.')); return; }
                if (!committed) { giveBack('보관함이 가득 찼습니다.'); return; }
                if (done) return; done = true;
                delete busy[itemName];

                const owner = db.users[ownerCode];
                if (owner && typeof getHouse === 'function') getHouse(owner).storage = (snap && snap.val()) || [];
                database.ref('users/' + ownerCode + '/_adminStamp').set(Date.now());

                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, "[사택] '" + itemName + "'을(를) 보관함에 넣었습니다.");
                }
                if (typeof saveFields === 'function') saveFields({ history: 1 });
                if (typeof updateUI === 'function') updateUI();
                if (typeof renderHouseStorage === 'function') renderHouseStorage();
            }, false);    // ← applyLocally false : 서버가 받기 전에는 내 화면도 안 늘어난다

            // 답이 너무 늦으면 알려만 준다 (되돌리지는 않는다 — 나중에 들어갈 수 있다)
            setTimeout(function () {
                if (done) return;
                showCustomAlert('아직 답이 없습니다.\n\n연결이 돌아오면 저절로 들어갑니다.\n다시 누르지 마세요.');
            }, 8000);
        };
        putToStorage._noDup = true;
        clearInterval(iv);
        console.log('[보관함] 넣기 다시 세움 — 끊기면 막고, 먼저 빼고, 끝날 때까지 잠금');
    }, 400);
})();

// ==========================================
// 이미 불어난 것 — 같은 사람이 같은 순간에 넣은 것만 겹침으로 본다
// ==========================================
function dupOf(arr) {
    const seen = {}, dup = [];
    (arr || []).forEach(function (s, i) {
        if (!s || !s.name) return;
        const k = s.name + '|' + (s.byCode || '') + '|' + (s.at || 0);
        if (seen[k]) dup.push({ i: i, name: s.name, by: s.by || s.byCode, at: s.at });
        else seen[k] = 1;
    });
    return dup;
}

window.storageDup = function () {
    if (!currentUser || typeof getSharedStorage !== 'function') return;
    const arr = getSharedStorage();
    const dup = dupOf(arr);
    console.log('%c===== 사택 보관함 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  들어 있는 것:', (arr || []).length + '칸'
        + (typeof houseStorageMax === 'function' ? ' / ' + houseStorageMax(currentUser) : ''));
    if (!dup.length) { console.log('  겹쳐 들어간 것이 없습니다.'); return; }
    console.table(dup.map(function (d) {
        return { 자리: d.i, 물건: d.name, 넣은사람: d.by, 넣은때: new Date(d.at).toLocaleString() };
    }));
    console.warn('  같은 사람이 같은 순간에 넣은 것 ' + dup.length + '개 — 연결이 끊겼을 때 겹쳐 들어간 것입니다.');
    console.log('  걷어내려면 storageDupFix()');
};

window.storageDupFix = function () {
    if (!currentUser || typeof database === 'undefined' || !database) return;
    if (typeof houseStorageRef !== 'function') return;
    const ownerCode = houseStorageRef(currentUser);

    database.ref('users/' + ownerCode + '/house/storage').transaction(function (arr) {
        arr = arr ? (Array.isArray(arr) ? arr : Object.values(arr)) : [];
        const seen = {}, keep = [];
        arr.forEach(function (s) {
            if (!s || !s.name) return;
            const k = s.name + '|' + (s.byCode || '') + '|' + (s.at || 0);
            if (seen[k]) return;
            seen[k] = 1; keep.push(s);
        });
        if (keep.length === arr.length) return;        // 고칠 것이 없다
        return keep;
    }, function (err, committed, snap) {
        if (err) { console.error(err); return; }
        if (!committed) { console.log('겹쳐 들어간 것이 없습니다.'); return; }
        const owner = db.users[ownerCode];
        if (owner && typeof getHouse === 'function') getHouse(owner).storage = (snap && snap.val()) || [];
        console.log('%c✓ 겹친 것을 걷어냈습니다. 지금 ' + ((snap && snap.val()) || []).length + '칸',
            'color:#4CAF50');
        if (typeof renderHouseStorage === 'function') renderHouseStorage();
        if (typeof updateUI === 'function') updateUI();
    }, false);
};

window.storageState = function () {
    console.log('%c===== 보관함 넣기 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  지금 연결:', online ? 'O' : '✗ 끊김');
    console.log('  넣는 중:', Object.keys(busy).join(' · ') || '없음');
    console.log('  고침 연결:', (typeof putToStorage === 'function' && putToStorage._noDup) ? 'O' : '✗');
};

console.log('[보관함] storageDup() · storageDupFix() · storageState()');

})();