// ==========================================
// ★ 비밀 박스 — 상담사만 줄 수 있는 상자
// bundles.json 마지막 그룹, house-L.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 들어 있나
//
//   열면 칭호는 반드시 나오고, 나머지 둘 중 하나가 반반으로 나온다.
//
//       [🎭 페르소나]      100%
//       그립톡             50%  ┐ 둘 중 하나만
//       찢어진 메모지      50%  ┘
//
// ■ 세 가지
//
//   그립톡          일주일에 한 번. 쓰면 모든 상점의 품목이 한 번에 펼쳐지고
//                   그중 하나만 살 수 있다. **쓰는 물건이 아니라 지니는 것**이라
//                   사라지지 않는다. 주가 바뀌면 다시 쓸 수 있다.
//
//                   「모든 상점」은 셋이다.
//                       일반 상점      ALL_10_ITEMS 25종 (평소엔 하루 5종만 보인다)
//                       유쾌 판매소    ITEM_CATALOG 의 qShop 전부 (평소엔 4시간마다 몇 종)
//                       우주 쇼핑몰    ALIEN_ITEMS_POOL 전부 (평소엔 진열된 9칸만)
//                   소속·직급으로 막힌 품목은 평소 규칙대로 빼고 보여 준다.
//
//   찢어진 메모지   쓰면 사택이 L 등급이 된다. houseL 자리에 적어 두므로
//                   이사로 내려가지 않는다. (house-L.js 의 isL 이 이 자리를 본다)
//
//   칭호            titleAdmin 에 넣는다. 그림은 titles.js 의 ADMIN_ICON 이 붙인다.
//
// ■ 상자는 상담사만 준다
//
//   어느 상점 후보에도 넣지 않고, 장터 팝니다·구합니다에서도 가린다.
//   (은심장 · 호사수구 · 심야 토크 쇼와 같은 길)
//
// ■ 쓰는 법
//
//   boxGive(사번[, 개수])   상담사가 비밀 박스를 준다
//   boxState()              내 그립톡이 이번 주에 쓰였나 · 사택 등급
//   gripOpen()              그립톡 창을 다시 연다 (살 몫이 남아 있을 때)

(function secretBox() {

const ADMIN = 'kario0987';
const BOX   = '비밀 박스';
const GRIP  = '그립톡';
const MEMO  = '찢어진 메모지';
const TITLE = '페르소나';           // 보일 때는 titles.js 가 🎭 를 붙인다

const DESC = {};
DESC[BOX]  = '봉인이 뜯긴 적 없는 상자. 열면 칭호 하나와, 그립톡이나 찢어진 메모지 '
           + '가운데 하나가 나온다. 무엇이 나올지는 열어 봐야 안다.';
DESC[GRIP] = '빨간 X 자가 그려진 반 원 모양의 그립톡. 일주일에 한 번 사용이 가능하며 '
           + '사용 시 모든 상점의 아이템 목록을 볼 수 있고, 딱 하나만 구매가 가능하다.';
DESC[MEMO] = '사용 시 사택을 L로 올릴 수 있다.';

function isAdmin(u) { return !!(u && u.code === ADMIN); }

// 주 열쇠 — 월요일을 주의 시작으로 본다
function weekKey(d) {
    d = d ? new Date(d) : new Date();
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (t.getDay() + 6) % 7;              // 월=0 … 일=6
    t.setDate(t.getDate() - dow);                  // 그 주의 월요일
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
}

function toast(m) {
    if (typeof showCustomAlert === 'function') showCustomAlert(m);
    else console.log(m);
}
function save(f) { if (typeof saveFields === 'function') { try { saveFields(f); } catch (e) { } } }
function log(u, m) { if (typeof addHistoryLog === 'function') { try { addHistoryLog(u, m); } catch (e) { } } }
function paint() { if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } } }

// ==========================================
// 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);

        ITEM_CATALOG[BOX]  = { price: 0, usable: true, targetable: false,
                               effect: 'secret_box', noSell: true, desc: DESC[BOX] };
        ITEM_CATALOG[GRIP] = { price: 0, usable: true, targetable: false,
                               effect: 'secret_grip', noSell: true, desc: DESC[GRIP] };
        ITEM_CATALOG[MEMO] = { price: 0, usable: true, targetable: false,
                               effect: 'secret_memo', noSell: true, desc: DESC[MEMO] };

        if (typeof NO_SELL_ITEMS !== 'undefined') {
            [BOX, GRIP, MEMO].forEach(function (n) {
                if (NO_SELL_ITEMS.indexOf(n) < 0) NO_SELL_ITEMS.push(n);
            });
        }
        console.log('[비밀 박스] ' + BOX + ' · ' + GRIP + ' · ' + MEMO + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 어느 상점 후보에도 오르지 않게 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    [BOX, GRIP, MEMO].forEach(function (n) {
        const i = ALIEN_ITEMS_POOL.indexOf(n);
        if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    });
}, 5000);

// 장터 팝니다·구합니다에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._boxHide) { clearInterval(iv); return; }
        const _m = marketSellable;
        const wrapped = function () {
            const pool = _m.apply(this, arguments);
            try { [BOX, GRIP, MEMO].forEach(function (n) { pool.delete(n); }); } catch (e) { }
            return pool;
        };
        wrapped._boxHide = true;
        marketSellable = wrapped;
        clearInterval(iv);
        console.log('[비밀 박스] 장터에서 숨김');
    }, 500);
})();

// ==========================================
// 상자를 연다
// ==========================================
function openBox() {
    const u = currentUser;
    if (!u) return;

    // 칭호는 반드시
    if (!Array.isArray(u.titleAdmin)) u.titleAdmin = [];
    const hadTitle = u.titleAdmin.indexOf(TITLE) >= 0;
    if (!hadTitle) u.titleAdmin.push(TITLE);

    // 둘 중 하나만
    const grip = Math.random() < 0.5;
    const got = grip ? GRIP : MEMO;
    if (!Array.isArray(u.inventory)) u.inventory = [];
    u.inventory.push(got);

    // 상자는 사라진다
    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, BOX, 1);

    log(u, '[비밀 박스] ' + got + ' · 칭호 ' + TITLE + (hadTitle ? ' (이미 있음)' : ''));
    save({ inventory: 1, titleAdmin: 1, history: 1 });
    paint();

    toast(BOX + '을 열었습니다.\n\n' + got + '\n칭호 [🎭 ' + TITLE + ']'
        + (hadTitle ? '\n\n(칭호는 이미 가지고 있었습니다)' : ''));
}

// ==========================================
// 찢어진 메모지 — 사택을 L 로
// ==========================================
function useMemo() {
    const u = currentUser;
    if (!u) return;

    let grade = '';
    try { if (typeof houseGrade === 'function') grade = houseGrade(u) || ''; } catch (e) { }
    if (grade === 'L') { toast('이미 관사입니다.'); return; }

    u.houseL = true;
    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, MEMO, 1);
    log(u, '[' + MEMO + '] 사택이 L 등급이 되었습니다.');
    save({ houseL: 1, inventory: 1, history: 1 });
    paint();
    toast('메모지의 글자가 번졌습니다.\n\n사택이 L 등급이 되었습니다.');
}

// ==========================================
// 그립톡 — 모든 상점을 한 번에 펼친다
// ==========================================
//
// 평소 규칙대로 소속·직급으로 막힌 품목은 뺀다. (index.html:9074 와 같은 걸러내기)
function alienAllowed(u, it) {
    const a = (u.affiliation || ''), t = (u.team || ''), admin = isAdmin(u);
    const dis  = a.indexOf('재난관리국') >= 0 || t.indexOf('재난관리') >= 0 || admin
              || /어둠/.test(a + ' ' + t);
    const day  = a.indexOf('백일몽 주식회사') >= 0 || admin || /어둠/.test(a + ' ' + t);
    const high = ['과장', '차장', '부장', '이사', '대표', '사장'].indexOf(u.position) >= 0 || admin;
    const sec  = t.indexOf('보안팀') >= 0 || t.indexOf('경비팀') >= 0 || admin;

    if (['작두', '유리손포', '누군가가 쓴 부적', '사자탈'].indexOf(it) >= 0 && !dis) return false;
    if (['착한 친구', '보안팀 의상 세트', '버터 나이프'].indexOf(it) >= 0 && !day) return false;
    if (['은반지', '빨간 리본', '고급진 술', '금고'].indexOf(it) >= 0 && !high) return false;
    if (it === '노스텔지어 끈' && !sec) return false;
    if (it === '여우구슬' && !admin) return false;
    if (it === '금고' && !admin) return false;
    return true;
}

// 살 수 있는 품목인가 — 값이 매겨져 있고, 고유 아이템이 아니고, 우리 셋이 아니다
function buyable(nm) {
    if (!nm || [BOX, GRIP, MEMO].indexOf(nm) >= 0) return false;
    const cat = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[nm] : null;
    if (!cat) return false;
    if (cat.dnaOwner) return false;                       // 남의 고유 아이템
    if (!(Number(cat.price) > 0)) return false;           // 값이 없는 것은 상담사 지급품
    return true;
}

function shopLists(u) {
    const out = [];
    const seen = {};
    const add = function (where, names) {
        (names || []).forEach(function (nm) {
            if (!buyable(nm) || seen[nm]) return;
            seen[nm] = 1;
            out.push({ where: where, name: nm, price: Number(ITEM_CATALOG[nm].price) });
        });
    };

    if (typeof ALL_10_ITEMS !== 'undefined') add('일반 상점', ALL_10_ITEMS);
    if (typeof ITEM_CATALOG !== 'undefined') {
        add('유쾌 판매소', Object.keys(ITEM_CATALOG).filter(function (k) {
            return ITEM_CATALOG[k] && ITEM_CATALOG[k].qShop;
        }));
    }
    if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
        add('우주 쇼핑몰', ALIEN_ITEMS_POOL.filter(function (it) { return alienAllowed(u, it); }));
    }
    return out;
}

function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.grip-modal'), function (x) { x.remove(); });
}

function openGrip() {
    const u = currentUser;
    if (!u) return;
    if (!(Number(u.gripBuy) > 0)) {
        toast(GRIP + '\n\n이번 주에 쓸 몫이 남아 있지 않습니다.');
        return;
    }
    const rows = shopLists(u);
    if (!rows.length) { toast('펼칠 품목이 없습니다.'); return; }

    shut();
    const w = document.createElement('div');
    w.className = 'grip-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:100020; display:flex; align-items:center;'
        + ' justify-content:center; background:rgba(0,0,0,0.8); padding:16px;';

    const pts = Number(u.points) || 0;
    const body = rows.map(function (r, i) {
        const can = pts >= r.price;
        const cat = ITEM_CATALOG[r.name] || {};
        const d = String(cat.desc || '').replace('[???] ', '');
        return '<div style="display:flex; align-items:center; gap:9px; padding:8px 0;'
            + ' border-bottom:1px solid #262626;">'
            + '<div style="flex:1; min-width:0;">'
            + '<span style="font-size:9px; color:#8a6; margin-right:5px;">' + r.where + '</span>'
            + '<span style="font-size:12px; font-weight:bold; color:#e8e4da;">' + r.name + '</span>'
            + (d ? '<div style="font-size:10px; color:#7d7870; line-height:1.5; margin-top:2px;">'
                   + d + '</div>' : '')
            + '</div>'
            + '<button class="game-btn grip-buy" data-i="' + i + '"' + (can ? '' : ' disabled')
            + ' style="margin:0; padding:7px 11px; font-size:11px; flex-shrink:0;'
            + (can ? '' : ' opacity:.4;') + '">' + r.price.toLocaleString() + ' P</button>'
            + '</div>';
    }).join('');

    w.innerHTML = '<div style="background:linear-gradient(145deg,#17120f,#0c0a09);'
        + ' border:1px solid #a33; border-radius:10px; padding:16px; max-width:460px; width:100%;'
        + ' max-height:84vh; display:flex; flex-direction:column;">'
        + '<div style="font-size:14px; color:#ff6b6b; font-weight:bold;">✕ ' + GRIP + '</div>'
        + '<div style="font-size:10px; color:#888; margin:6px 0 12px 0; line-height:1.6;">'
        + '모든 상점의 품목이 펼쳐졌습니다. <b style="color:#e8e4da;">딱 하나만</b> 살 수 있습니다.'
        + '<br>보유 ' + pts.toLocaleString() + ' P · 모두 ' + rows.length + '종</div>'
        + '<div style="overflow-y:auto; flex:1; margin:-4px 0 10px 0;">' + body + '</div>'
        + '<button id="grip-no" class="game-btn" style="width:100%; margin:0; padding:10px;'
        + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">'
        + '나중에 고른다</button>'
        + '</div>';
    document.body.appendChild(w);

    w.querySelector('#grip-no').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.grip-buy'), function (b) {
        b.onclick = function () {
            const r = rows[parseInt(b.getAttribute('data-i'), 10)];
            if (!r) return;
            buyOne(r);
        };
    });
}
window.gripOpen = openGrip;

function buyOne(r) {
    const u = currentUser;
    if (!u) return;
    if (!(Number(u.gripBuy) > 0)) { shut(); toast('이미 하나를 골랐습니다.'); return; }
    if ((Number(u.points) || 0) < r.price) {
        if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
        else toast('포인트가 모자랍니다.');
        return;
    }

    u.gripBuy = 0;
    if (!Array.isArray(u.inventory)) u.inventory = [];
    u.inventory.push(r.name);
    if (typeof changePoints === 'function') changePoints(-r.price);
    else u.points = Math.max(0, (Number(u.points) || 0) - r.price);

    log(u, '[' + GRIP + '] ' + r.where + ' — ' + r.name + ' (-' + r.price.toLocaleString() + ' P)');
    save({ inventory: 1, history: 1, gripBuy: 1, points: 1 });
    paint();
    shut();
    toast(r.name + '\n\n' + r.where + '에서 가져왔습니다.\n-' + r.price.toLocaleString() + ' P');
}

function useGrip() {
    const u = currentUser;
    if (!u) return;

    // 아직 고르지 않은 몫이 남아 있으면 주를 쓰지 않고 창만 다시 연다
    if (Number(u.gripBuy) > 0) { openGrip(); return; }

    const wk = weekKey();
    if (u.gripWeek === wk) {
        toast(GRIP + '\n\n이번 주에는 이미 썼습니다.\n다음 주 월요일에 다시 쓸 수 있습니다.');
        return;
    }
    u.gripWeek = wk;
    u.gripBuy = 1;
    save({ gripWeek: 1, gripBuy: 1 });
    openGrip();
}

// ==========================================
// 쓰는 자리에 붙인다
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._secretBox) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        const wrapped = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            const e = cat && cat.effect;
            if (e === 'secret_box')  { openBox(); return; }
            if (e === 'secret_memo') { useMemo(); return; }
            if (e === 'secret_grip') { useGrip(); return; }
            return _u.apply(this, arguments);
        };
        wrapped._secretBox = true;
        useInventoryItem = wrapped;
        clearInterval(iv);
        console.log('[비밀 박스] 쓰는 자리 연결');
    }, 400);
})();

// ==========================================
// 지급 · 확인
// ==========================================
window.boxGive = function (who, n) {
    if (!isAdmin(currentUser)) { console.warn('상담사만 줄 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    const q = Math.max(1, Math.min(5, n || 1));
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < q; i++) u.inventory.push(BOX);
    log(u, '[당국 개입] ' + BOX + ' ' + q + '개 지급');

    if (u.code === currentUser.code) save({ inventory: 1, history: 1 });
    else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    }
    console.log('%c✓ ' + u.name + ' 사원에게 ' + BOX + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.boxState = function () {
    const u = currentUser;
    if (!u) return;
    console.log('%c===== ' + BOX + ' =====', 'color:#ff6b6b; font-size:13px');
    const inv = u.inventory || [];
    console.log('  지닌 것:', BOX, inv.filter(function (x) { return x === BOX; }).length + '개',
        '·', GRIP, inv.filter(function (x) { return x === GRIP; }).length + '개',
        '·', MEMO, inv.filter(function (x) { return x === MEMO; }).length + '개');
    console.log('  칭호:', (u.titleAdmin || []).indexOf(TITLE) >= 0 ? '[🎭 ' + TITLE + '] 있음' : '없음');
    let grade = '?';
    try { if (typeof houseGrade === 'function') grade = houseGrade(u); } catch (e) { }
    console.log('  사택 등급:', grade, '· houseL 자리:', u.houseL ? 'O' : '✗');
    console.log('  그립톡 — 이번 주(' + weekKey() + ') 쓴 적:', u.gripWeek === weekKey() ? 'O' : '✗',
        '· 아직 고를 몫:', Number(u.gripBuy) || 0);
    if (typeof ALL_10_ITEMS !== 'undefined') {
        console.log('  펼칠 품목:', shopLists(u).length + '종');
    }
    console.log('  연결:', (typeof useInventoryItem === 'function' && useInventoryItem._secretBox) ? 'O' : '✗');
};

console.log('[비밀 박스] boxGive(사번) · boxState() · gripOpen()');

})();
