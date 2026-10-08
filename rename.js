// ==========================================
// ★ 📝 사원명 변경권 — 상담사 지급 전용
// bundles.json 마지막 묶음, invmark.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   쓰면 이름을 한 번 바꿀 수 있다. 상담사가 「물품 강제 꽂기」로만 준다.
//   상점·우주 쇼핑몰·장터(팝니다·구합니다) 어디에도 안 뜨고 팔 수도 없다.
//   호사수구·뿅망치와 같은 자리다.
//
// ■ 이름을 바꾸는 것만으로는 안 된다
//
//   사원을 가르는 열쇠는 사번(code)이고 이름은 보여 주기용이다. 그래서
//   users/<사번>/name 한 칸만 바꿔도 대부분은 바로 따라온다.
//
//   그런데 이 게임은 **일이 일어난 그 순간의 이름을 여기저기 베껴 적어
//   둔다.** 84군데다. 이름만 바꾸면 그 베낀 것들이 옛 이름으로 남는다.
//
//       preg.sires[].name      임신한 사원이 보는 아버지 이름
//       darkParties/…/name     파티·토크쇼 명단, 어둠 안의 동료 이름
//       market/…/sellerName    장터 글
//       p2pDeals/…/fromName    밀실 거래
//       duels/…/fromName       결투
//       masterName             노예 계약 주인 이름
//       nostalgiaSender        향수병을 보낸 사람
//
//   지난 기록(기록 탭 문장·특이사항에 이미 적힌 줄)은 **일부러 그대로
//   둔다.** 그때의 이름이니 그게 맞다.
//
// ■ 어떻게 따라가나
//
//   이름 칸을 하나하나 적어 두면 빠뜨린다. 그래서 규칙으로 찾는다.
//
//     · 값이 옛 이름과 같고
//     · 칸 이름이 name 으로 끝나고
//     · 같은 칸에 내 사번이 들어 있다   (name↔code · fromName↔fromCode …)
//
//   세 가지를 다 만족하는 자리만 고친다. 짝이 없는 두 칸(masterName ·
//   nostalgiaSender)은 값만 보고 고친다 — 그래서 **같은 이름을 금지한다.**
//
//   고칠 때는 잎사귀 경로 하나씩만 쓴다. 가지를 통째로 덮지 않으므로
//   그 사이에 남이 바꾼 것을 지우지 않는다.
//
//   사원 목록(users)은 이미 화면이 들고 있는 것을 뒤진다 — 서버에서 다시
//   내려받지 않는다. 나머지 자잘한 칸만 한 번씩 읽는다.
//
// ■ 이름 규칙 (아래 RULE 에서 바꾼다)
//     2~8자 · 앞뒤 공백 제거 · | < > " ' 금지 · 이미 쓰는 이름 금지
//
// ■ 콘솔
//   renameGive(사번, 개수)   상담사가 변경권을 준다
//   renameState()            규칙과 내가 가진 장수

const RENAME_ITEM = '📝 사원명 변경권';
window.RENAME_RULE = {
    min: 2,
    max: 8,
    ban: /[|<>"'\\]/,        // 특이사항은 ' | ' 로 잇고, 이름은 화면에 그대로 박힌다
    unique: true             // 이미 쓰는 이름은 막는다
};

(function renameTicket() {

const NAME = RENAME_ITEM;
const R = window.RENAME_RULE;
const ADMIN = 'kario0987';

// 짝이 없어 값만 보고 고치는 칸
const BARE = { masterName: 1, nostalgiaSender: 1 };
// 서버에서 한 번씩 읽어 뒤지는 자리 (users 는 화면이 들고 있는 것을 쓴다)
const NODES = ['darkParties', 'market', 'p2pDeals', 'duels', 'darkInvites',
               'pregAsk', 'milkAsk', 'pregLeave', 'roomPoke', 'roomConfirm'];

function allUsers() {
    return Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
}

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'rename_ticket', noSell: true,
            desc: '사원명을 한 번 바꾼다. ' + R.min + '~' + R.max + '자. '
                + '이미 쓰는 이름은 쓸 수 없다. 쓰면 사라진다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        console.log('[개명] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 우주 쇼핑몰 후보에 들어가도 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    const i = ALIEN_ITEMS_POOL.indexOf(NAME);
    if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
}, 5000);

// 장터(팝니다·구합니다)에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._rename) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._rename = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 이름 규칙
// ==========================================
function whyBad(want) {
    const s = String(want == null ? '' : want).trim();
    if (!s) return '이름을 적어 주세요.';
    if (s.length < R.min) return R.min + '자 이상이어야 합니다.';
    if (s.length > R.max) return R.max + '자 이하여야 합니다.';
    if (R.ban.test(s)) return '쓸 수 없는 글자가 들어 있습니다. ( | < > " \' \\ )';
    if (currentUser && s === currentUser.name) return '지금 쓰고 있는 이름입니다.';
    if (R.unique) {
        const taken = allUsers().some(function (u) {
            return u.code !== (currentUser || {}).code && String(u.name || '').trim() === s;
        });
        if (taken) return '이미 그 이름을 쓰는 사원이 있습니다.';
    }
    return '';
}

// ==========================================
// 베껴 적힌 이름 찾기
// ==========================================
//
// name 으로 끝나는 칸 가운데, 같은 칸에 내 사번이 들어 있는 것만 고친다.
// (name↔code · fromName↔fromCode · byName↔byCode · sellerName↔seller …)
// 그냥 name 인 칸은 짝 이름이 제각각이다 — talkShow 는 { by, name } 꼴이다
const CODEISH = ['code', 'by', 'from', 'to', 'owner', 'host', 'leader', 'seller', 'buyer', 'sire', 'who'];

function partnersOf(k) {
    if (k === 'name') return CODEISH;
    const base = k.replace(/Name$/, '');
    return [base + 'Code', base];
}

function scan(node, path, oldName, myCode, out) {
    if (!node || typeof node !== 'object') return;
    Object.keys(node).forEach(function (k) {
        if (k === 'photo') return;                       // 사원증 사진 — 볼 것 없다
        const v = node[k];
        if (typeof v === 'string') {
            if (v !== oldName) return;
            if (BARE[k]) { out.push(path + '/' + k); return; }
            if (!/name$/i.test(k)) return;
            const mine = partnersOf(k).some(function (p) { return node[p] === myCode; });
            if (mine) out.push(path + '/' + k);
            return;
        }
        if (v && typeof v === 'object') scan(v, path + '/' + k, oldName, myCode, out);
    });
}

// 서버에서 자잘한 자리를 읽어 모은다
function gatherServer(oldName, myCode) {
    if (typeof database === 'undefined' || !database) return Promise.resolve([]);
    return Promise.all(NODES.map(function (n) {
        return database.ref(n).once('value')
            .then(function (s) {
                const out = [];
                scan(s.val(), n, oldName, myCode, out);
                return out;
            })
            .catch(function (e) {
                console.warn('[개명] ' + n + ' 는 건너뜁니다:', e && e.message);
                return [];
            });
    })).then(function (lists) {
        return lists.reduce(function (a, b) { return a.concat(b); }, []);
    });
}

// 화면이 들고 있는 사원 목록에서 모은다 (다시 내려받지 않는다)
function gatherUsers(oldName, myCode) {
    const out = [];
    const users = (typeof db !== 'undefined' && db.users) || {};
    Object.keys(users).forEach(function (c) {
        const u = users[c];
        if (!u || typeof u !== 'object') return;
        if (c === myCode) return;                        // 내 자리는 따로 쓴다
        scan(u, 'users/' + c, oldName, myCode, out);
    });
    return out;
}

// ==========================================
// 바꾸기
// ==========================================
function doRename(want) {
    if (!currentUser) return;
    const s = String(want).trim();
    const bad = whyBad(s);
    if (bad) { showCustomAlert(bad); return; }
    if ((currentUser.inventory || []).indexOf(NAME) < 0) {
        showCustomAlert('변경권이 없습니다.'); return;
    }

    const old = currentUser.name;
    const code = currentUser.code;

    gatherServer(old, code).then(function (far) {
        const near = gatherUsers(old, code);
        const paths = near.concat(far);

        const up = {};
        paths.forEach(function (p) { up[p] = s; });
        up['users/' + code + '/name'] = s;
        up['users/' + code + '/_adminStamp'] = Date.now();

        // 화면 쪽도 같이 바꾼다
        currentUser.name = s;
        try { if (db && db.users && db.users[code]) db.users[code].name = s; } catch (e) { }
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, NAME, 1);
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(currentUser, '[개명] ' + old + ' → ' + s);
        }
        if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 });

        const run = (typeof database !== 'undefined' && database)
            ? database.ref().update(up) : Promise.resolve();

        return run.then(function () {
            if (typeof updateUI === 'function') updateUI();
            showCustomAlert('이름을 바꿨습니다.\n\n' + old + ' → ' + s
                + (paths.length ? '\n\n함께 고친 자리 ' + paths.length + '군데' : ''));
            console.log('[개명] ' + old + ' → ' + s + ' · 따라 고친 자리 ' + paths.length + '군데');
            if (paths.length) console.log(paths);
        });
    }).catch(function (e) {
        console.error('[개명] 실패:', e);
        showCustomAlert('이름을 바꾸지 못했습니다.\n잠시 뒤에 다시 해 주세요.');
    });
}
window.renameDo = doRename;

// ==========================================
// 쓰기 — 확인 창을 거친 뒤 이름을 묻는다
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._rename) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);

            // 확인 창을 먼저 거친다 (확인을 누르면 _invOk 를 달고 다시 온다)
            if (window._invOk !== NAME) return _u.apply(this, arguments);
            window._invOk = null;

            if (!currentUser) return;
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('여우 상담실 격리 중에는 소지품을 사용할 수 없습니다.'); return;
            }
            if ((currentUser.inventory || []).indexOf(NAME) < 0) {
                showCustomAlert('해당 물품이 없습니다.'); return;
            }
            if (typeof openTextInput !== 'function') {
                showCustomAlert('이름 입력 창을 열지 못했습니다.'); return;
            }

            openTextInput('사원명 변경',
                '새 이름을 적어 주세요.<br>'
                + '<span style="color:#888; font-size:10px;">'
                + R.min + '~' + R.max + '자 · 이미 쓰는 이름은 쓸 수 없습니다.<br>'
                + '지난 기록에 적힌 옛 이름은 그대로 남습니다.</span>',
                currentUser.name,
                function (v) { doRename(v); });
        };
        useInventoryItem._rename = true;
        clearInterval(iv);
        console.log('[개명] 쓰기 연결');
    }, 400);
})();

// ==========================================
// 상담사 — 지급
// ==========================================
window.renameGive = function (who, n) {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = who ? allUsers().filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, Number(n) || 1));
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < q; i++) u.inventory.push(NAME);
    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[당국 개입] ' + NAME + ' ' + q + '장 지급');
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    }
    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + u.name + ' 사원에게 ' + q + '장을 줬습니다.', 'color:#4CAF50');
};

// ==========================================
// 확인
// ==========================================
window.renameState = function () {
    console.log('%c===== 사원명 변경권 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  물품 등록:', (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[NAME]) ? 'O' : '✗');
    console.log('  규칙:', R.min + '~' + R.max + '자 · 같은 이름 금지:', R.unique ? 'O' : '✗');
    if (!currentUser) { console.log('  로그인 후에 쓰세요.'); return; }
    const have = (currentUser.inventory || []).filter(function (x) { return x === NAME; }).length;
    console.log('  내 이름:', currentUser.name, '· 가진 장수:', have);
    console.log('  쓰기 연결:', (typeof useInventoryItem === 'function' && useInventoryItem._rename) ? 'O' : '✗');
};

console.log('[개명] 사원명 변경권 — renameGive(사번, 장수) · renameState()');

})();
