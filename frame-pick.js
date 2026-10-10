// ==========================================
// ★ 🎟 테두리 선택권 — 상담사 지급 전용
// bundles.json 마지막 묶음, frames*.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   견본첩은 한 장을 **뽑아** 준다. 무엇이 나올지는 열어야 안다.
//   선택권은 반대다. 지금 있는 테두리를 전부 펼쳐 놓고 **고르게** 한다.
//   등급을 가리지 않는다. L 도 바로 고를 수 있다.
//
//   종 수는 글로 못 박지 않고 FRAMES 를 그때그때 센다. 테두리가
//   늘어나면 고를 것도 저절로 늘어난다. (지금 60종)
//
//   이미 가진 테두리는 고를 수 없다. 겹쳐 받을 이유가 없고, 겹침
//   환급을 노리고 쓰는 길도 막아 둔다. 다 모았으면 아예 쓰이지
//   않는다 — 권도 안 없어진다.
//
// ■ 상담사만 줄 수 있다
//
//   특급 견본첩·사원명 변경권과 같다. 상점 어디에도 안 깔리고,
//   우주 쇼핑몰 후보에도 안 들어가고, 장터에도 안 뜨고, 팔 수도 없다.
//   주는 법은 frPickGive(사번) 또는 당국 화면의 「물품 강제 꽂기」다.
//   (꽂기는 선물함으로 간다 — 사원이 🎁 에서 받아야 들어간다)
//
// ■ 고르고 나면
//
//   얻은 테두리를 그 자리에서 사원증에 둘러 준다. 열람 카드와 기록은
//   원래 쓰던 것을 건드리지 않는다. 바로 테두리 관리 화면을 띄운다.
//
// ■ 콘솔
//   frPickGive(사번, 개수)   상담사가 준다
//   frPickState(사번)        가진 권 · 남은 종 수

const FRAME_PICK = '🎟 테두리 선택권';

(function framePick() {

const NAME = FRAME_PICK;
const ADMIN = 'kario0987';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function list() { return (typeof FRAMES !== 'undefined' && Array.isArray(FRAMES)) ? FRAMES : []; }
function owned(id) { try { return !!frOwned(id); } catch (e) { return false; } }
function color(g) {
    try { return FRAME_COLOR[g] || '#aaa'; } catch (e) { return '#aaa'; }
}
function have(u) { return ((u || me() || {}).inventory || []).filter(function (x) { return x === NAME; }).length; }
function leftKinds() { return list().filter(function (f) { return !owned(f.id); }).length; }

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'frame_pick', noSell: true,
            desc: '견본첩은 뽑아 주고 이것은 고르게 한다. 지금 있는 테두리를 전부 펼쳐 놓고 '
                + '그 가운데 하나를 가져간다. 등급을 가리지 않는다. 이미 가진 것은 고를 수 없다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        console.log('[테두리] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
    let i;
    while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
}, 5000);

(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._frPick) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._frPick = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 고르는 창
// ==========================================
let q = '';

function render() {
    const u = me();
    if (!u) return;
    const all = list();
    const mine = have(u);
    const want = q.trim();
    const hit = function (f) {
        if (!want) return true;
        return (f.n || '').indexOf(want) >= 0 || (f.g || '').toUpperCase() === want.toUpperCase();
    };

    const body = ['L', 'S', 'A', 'B', 'C', 'D'].map(function (g) {
        const rows = all.filter(function (f) { return f.g === g && hit(f); });
        if (!rows.length) return '';
        const yet = all.filter(function (f) { return f.g === g && !owned(f.id); }).length;
        return '<div style="font-size:11px; color:' + color(g) + '; font-weight:bold;'
            + ' margin:11px 0 6px 0; border-bottom:1px solid #333; padding-bottom:4px;">'
            + g + '등급 <span style="color:#888; font-weight:normal;">고를 수 있는 것 ' + yet + ' / '
            + all.filter(function (f) { return f.g === g; }).length + '종</span></div>'
            + rows.map(function (f) {
                const own = owned(f.id);
                return '<div style="border:1px solid ' + (own ? '#2c2c2c' : '#3a3a3a') + '; border-radius:6px;'
                    + ' padding:9px 11px; margin-bottom:6px; display:flex; align-items:center; gap:9px;'
                    + (own ? ' opacity:0.45;' : '') + '">'
                    + '<div class="fr-wrap fr-' + f.id + '" style="width:34px; height:34px; flex-shrink:0;"></div>'
                    + '<div style="flex:1; min-width:0;">'
                    + '<div style="font-size:12px; color:#fff; font-weight:bold;">' + esc(f.n) + '</div>'
                    + '<div style="font-size:10px; color:' + color(f.g) + ';">' + f.g + '등급'
                    + (own ? ' <span style="color:#888;">· 이미 있음</span>' : '') + '</div>'
                    + '</div>'
                    + (own
                        ? '<button class="game-btn" style="margin:0; padding:7px 11px; font-size:10px; flex-shrink:0;'
                          + ' background:#2a2a2a !important; border-color:#3c3c3c !important; color:#777 !important;" disabled>있음</button>'
                        : '<button class="game-btn" style="margin:0; padding:7px 11px; font-size:10px; flex-shrink:0;"'
                          + ' onclick="frPickTake(\'' + f.id + '\')">고른다</button>')
                    + '</div>';
            }).join('');
    }).join('');

    const html = '<div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:10px;">'
        + '가진 선택권 <b style="color:#c9a8ff;">' + mine + '</b>장 · '
        + '고를 수 있는 테두리 <b style="color:#c9a8ff;">' + leftKinds() + '</b> / ' + all.length + '종<br>'
        + '<span style="color:#888;">하나를 고르면 선택권 한 장이 쓰입니다. 고른 것은 사원증에 바로 둘러집니다.</span>'
        + '</div>'
        + '<input id="fr-pick-q" type="text" value="' + esc(q) + '" placeholder="이름 또는 등급(L·S·A·B·C·D)으로 찾기"'
        + ' autocapitalize="off" autocorrect="off" spellcheck="false"'
        + ' style="width:100%; padding:9px; font-size:12px; margin-bottom:8px;">'
        + '<div style="max-height:52vh; overflow-y:auto; padding-right:4px;">'
        + (body || '<div style="font-size:11px; color:#666; padding:14px 0; text-align:center;">찾는 것이 없습니다.</div>')
        + '</div>';

    if (typeof openGearModal === 'function') openGearModal('🎟 테두리 선택권', html);

    const f = document.getElementById('fr-pick-q');
    if (f) {
        f.oninput = function () { q = f.value; render(); };
        if (q) { try { f.focus(); f.setSelectionRange(q.length, q.length); } catch (e) { } }
    }
}
window.frPickOpen = function () { q = ''; render(); };

// ==========================================
// 고른다
// ==========================================
window.frPickTake = function (id) {
    const u = me();
    if (!u) return;
    const f = list().filter(function (x) { return x.id === id; })[0];
    if (!f) { alert_('그 테두리를 찾지 못했습니다.'); return; }
    if (owned(id)) { alert_('이미 가지고 있는 테두리입니다.'); return; }
    if (have(u) <= 0) { alert_(NAME + ' 이 없습니다.'); return; }
    if (typeof isQuarantined === 'function' && isQuarantined(u)) {
        alert_('격리 중에는 쓸 수 없습니다.'); return;
    }

    const bag = frBag();
    if (!bag.owned) bag.owned = {};
    bag.owned[f.id] = 1;
    bag.badge = f.id;                       // 고른 것은 바로 사원증에
    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, NAME, 1);
    log_(u, '[테두리 선택권] ' + f.g + '등급 「' + f.n + '」 을(를) 골랐습니다.');
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

    alert_('골랐습니다.\n\n' + f.g + '등급 — ' + f.n + '\n\n사원증에 둘렀습니다.\n'
        + '남은 선택권 ' + have(u) + '장');
    setTimeout(function () {
        try { if (typeof openFramePanel === 'function') openFramePanel(); } catch (e) { }
    }, 400);
};

// ==========================================
// 쓰기
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._frPick) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'frame_pick') return _u.apply(this, arguments);
            const u = me();
            if (!u) return;
            if (have(u) <= 0) { alert_('가지고 있지 않습니다.'); return; }
            if (typeof isQuarantined === 'function' && isQuarantined(u)) {
                alert_('격리 중에는 쓸 수 없습니다.'); return;
            }
            if (leftKinds() <= 0) {
                alert_('테두리 ' + list().length + '종을 모두 가지고 있습니다.\n\n'
                    + '고를 것이 없어 선택권은 그대로 둡니다.');
                return;
            }
            // 여기서는 소모하지 않는다 — 고른 뒤에 한 장이 쓰인다
            window.frPickOpen();
        };
        useInventoryItem._frPick = true;
        clearInterval(iv);
        console.log('[테두리] 선택권 쓰기 연결');
    }, 400);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
function find(who) {
    if (typeof db === 'undefined' || !db.users) return null;
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    if (!who) return me();
    return all.filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}

window.frPickGive = function (who, n) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const qn = Math.max(1, Math.min(10, n || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < qn; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + qn + '장 지급');
    try {
        if (typeof updateUserFields === 'function') {
            updateUserFields(t.code, { inventory: t.inventory, history: t.history });
        }
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + qn + '장을 줬습니다.', 'color:#4CAF50');
};

window.frPickState = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const all = list();
    const mine = (u.frames && u.frames.owned) || {};
    const yet = all.filter(function (f) { return !mine[f.id]; });
    console.log('%c===== ' + u.name + ' · ' + NAME + ' =====', 'color:#c9a8ff; font-size:13px');
    console.log('  가진 선택권 :', (u.inventory || []).filter(function (x) { return x === NAME; }).length + '장');
    console.log('  가진 테두리 :', (all.length - yet.length) + ' / ' + all.length + '종');
    const by = {};
    yet.forEach(function (f) { (by[f.g] = by[f.g] || []).push(f.n); });
    ['L', 'S', 'A', 'B', 'C', 'D'].forEach(function (g) {
        if (by[g]) console.log('  아직 없는 ' + g + ' :', by[g].join(', '));
    });
};

console.log('[테두리] frPickGive(사번) · frPickState(사번)');

})();
