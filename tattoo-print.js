// ==========================================
// ★ 🖨 달빛 타투기 — 상담사 지급 전용
// bundles.json 마지막 묶음, newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   장착하는 것이 아니라 쓰는 것이다. 그런데 닳지 않는다.
//   하루 두 번, 「달빛 타투 스티커」를 뽑아 준다. 스티커는 원래 있던
//   그것이라 쓰는 법도 효과도 전과 같다 —
//
//       다음 탐사 +10,000 P · 행운 +300 (12시간) · 기믹 파훼 1회 (24시간)
//
//   셋 중 하나가 무작위로 남고, 붙이면 스티커는 사라진다.
//   타투기는 사라지지 않는다. 자정이 지나면 다시 두 번이 된다.
//
// ■ 상담사만 줄 수 있다
//
//   상점 어디에도 안 깔리고, 우주 쇼핑몰 후보에도 안 들어가고,
//   장터(팝니다·구합니다)에도 안 뜬다. 팔 수도 없다.
//   주는 법은 tattooGive(사번) 또는 당국 화면의 「물품 강제 꽂기」다.
//
// ■ 콘솔
//   tattooGive(사번)   상담사가 하나 준다
//   tattooState()      오늘 몇 번 남았나

const TATTOO_PRINT = {
    NAME:    '🖨 달빛 타투기',
    STICKER: '달빛 타투 스티커',
    DAY:     2                      // 하루 몇 장
};

(function tattooPrinter() {

const NAME = TATTOO_PRINT.NAME;
const STICKER = TATTOO_PRINT.STICKER;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t);
}
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }

function has(u) {
    const x = u || me();
    if (!x) return false;
    return (x.inventory || []).indexOf(NAME) >= 0;
}

// 오늘 남은 장수 — 자정이 지나면 저절로 돌아온다
function left(u) {
    u = u || me();
    if (!u) return 0;
    if (u.moonPrintDay !== today()) return TATTOO_PRINT.DAY;
    return Math.max(0, TATTOO_PRINT.DAY - (Number(u.moonPrintUsed) || 0));
}
window.tattooLeft = left;

// ==========================================
// 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'tattoo_print', noSell: true,
            desc: '달빛을 찍어 내는 작은 기계. 하루 두 번 「' + STICKER + '」를 뽑아 준다. '
                + '기계는 닳지 않는다. 자정이 지나면 다시 두 번이 된다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        console.log('[타투기] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 어느 상점 후보에도 안 들어가게 — 다른 파일이 밀어 넣어도 계속 뺀다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
    let i;
    while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
}, 5000);

// 장터에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._moonPrint) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._moonPrint = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 뽑는다 — 기계는 닳지 않는다
// ==========================================
(function use() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._moonPrint) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'tattoo_print') return _u.apply(this, arguments);

            const u = me();
            if (!u) return;
            if ((u.inventory || []).indexOf(itemName) < 0) { alert_('가지고 있지 않습니다.'); return; }
            if (typeof isQuarantined === 'function' && isQuarantined(u)) {
                alert_('격리 중에는 쓸 수 없습니다.'); return;
            }
            if (!ITEM_CATALOG[STICKER]) {
                alert_('스티커 자료가 아직 올라오지 않았습니다.\n잠시 뒤에 다시 눌러 주십시오.');
                return;
            }
            const n = left(u);
            if (n <= 0) {
                alert_('오늘 몫을 다 썼습니다. (하루 ' + TATTOO_PRINT.DAY + '장)\n\n자정이 지나면 다시 채워집니다.');
                return;
            }

            if (u.moonPrintDay !== today()) { u.moonPrintDay = today(); u.moonPrintUsed = 0; }
            u.moonPrintUsed = (Number(u.moonPrintUsed) || 0) + 1;

            if (!Array.isArray(u.inventory)) u.inventory = [];
            u.inventory.push(STICKER);                      // 기계는 그대로 둔다

            log_(u, '[' + NAME + '] ' + STICKER + ' 한 장 (금일 ' + u.moonPrintUsed + '/' + TATTOO_PRINT.DAY + ')');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

            alert_('기계가 한 번 울었습니다.\n\n「' + STICKER + '」 한 장이 나왔습니다.\n'
                + '남은 장수 ' + left(u) + '장\n\n'
                + '소지품에서 붙이면 셋 중 하나가 남습니다.');
        };
        useInventoryItem._moonPrint = true;
        clearInterval(iv);
        console.log('[타투기] 뽑기 연결');
    }, 400);
})();

// ==========================================
// 소지품에 남은 장수를 적어 준다
// ==========================================
(function badge() {
    const ID = 'moon-print-left';
    setInterval(function () {
        const u = me();
        const box = document.getElementById('inventory-list-container');
        const old = document.getElementById(ID);
        if (!box || !u || !has(u)) { if (old) old.remove(); return; }
        const txt = '🖨 오늘 남은 달빛 ' + left(u) + ' / ' + TATTOO_PRINT.DAY + '장';
        if (old) { if (old.textContent !== txt) old.textContent = txt; return; }
        const d = document.createElement('div');
        d.id = ID;
        d.textContent = txt;
        d.style.cssText = 'margin:0 0 10px 0; padding:8px 11px; border-radius:6px; font-size:11px;'
            + ' background:rgba(150,170,220,0.10); border:1px solid #3d4a6a; color:#c3d0ee;';
        box.insertAdjacentElement('afterbegin', d);
    }, 2000);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
function find(who) {
    if (typeof db === 'undefined' || !db.users) return null;
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    return all.filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
window.tattooGive = function (who, n) {
    const u = me();
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, n || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '개 지급');
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.tattooState = function () {
    const u = me();
    if (!u) { console.log('로그인 전입니다.'); return; }
    console.log('%c===== ' + NAME + ' =====', 'color:#c3d0ee; font-size:13px');
    console.log('  가지고 있나 :', has(u) ? 'O' : '✗');
    console.log('  오늘 남은 몫:', left(u) + ' / ' + TATTOO_PRINT.DAY + '장 (자정 초기화)');
    console.log('  가진 스티커 :', (u.inventory || []).filter(function (x) { return x === STICKER; }).length + '장');
};

console.log('[타투기] tattooGive(사번) · tattooState()');

})();
