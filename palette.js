// ==========================================
// ★ 🎨 컬러 팔레트 — 옷·악세를 아무 색으로나 물들인다
// bundles.json 마지막 묶음, skip.js 바로 뒤
// ==========================================
//
// ■ 무엇인가
//
//       유쾌 판매소에서 1000 P · 하루 다섯 개 · 늘 진열
//       한 개에 한 번 물들인다. 되돌리는 것(원래대로)은 공짜다.
//
//   색고리를 돌려 360가지 중 아무 색이나 고른다. 지금 입고 있는
//   옷·악세는 전부 물들일 수 있다 (몸과 얼굴은 뺀다).
//
//   ★ 정장처럼 **안쪽이 하얀 셔츠**인 옷은 겉만 물든다. 어느 자리를
//     남길지는 recolor.js 의 KEEP 이 쥐고 있다 (알 옆에 「겉만」이 붙는다).
//
// ■ 어디서 여나
//
//       사택 → 옷장 → 「색」 줄의 알              그 옷을 바로 연다
//       가방 → [ 🎨 컬러 팔레트 ] → 사용         입은 것을 고르는 데부터
//
//   둘 다 같은 창이다 (아래 open). 창 안에서 다른 옷으로 갈아 고를 수 있다.
//
// ■ 어디에 적히나
//
//       u.dot.col = { tuxedo: 210 }     장 이름마다 색(0~359)
//
//   광장은 u.dot 을 통째로 주고받으므로 **남의 화면에도 같은 색으로** 간다.
//   따로 보낼 것이 없다.
//
// ■ 콘솔
//       paletteState()   가진 개수 · 오늘 산 개수 · 지금 물든 것
//
// ■ ✗ 해 본 것
//
//   ✗ CSS filter: hue-rotate — 흑백으로 그린 옷(드레스·망토)에는 아무
//     일도 안 일어난다. 돌릴 색이 없기 때문이다. 그래서 칸마다 직접
//     칠한다 (recolor.js).
//   ✗ 색고리를 돌리는 **동안마다** 다시 칠하기 — 한 장에 70ms 라 손가락이
//     끌렸다. 돌리는 동안에는 고리와 가운데 색만 바꾸고, 그림은 120ms
//     쉬었다 칠한다.

const PAL_ITEM = '[ 🎨 컬러 팔레트 ]';
const PAL_DAILY = 5;        // 유쾌 판매소 하루 구매 한도
const PAL_PRICE = 1000;
// ★ 산 횟수를 적는 열쇠는 **이름을 쓰지 않는다.**
//
//   다른 물품은 'item_' + 이름 으로 적는데, 이 이름에는 대괄호가 들어 있다.
//   파이어베이스 열쇠에는 . # $ [ ] / 를 못 쓴다 — 하나라도 섞이면 그
//   꾸러미가 **통째로 거절된다.** empty-null.js 가 그 열쇠를 빼고 보내므로
//   저장은 살지만 **산 횟수가 안 적힌다** — 하루 다섯 개 한도가 영영
//   안 걸린다. (재 봄: 여섯 번을 내리 샀고 기록은 null 이었다)
//   그래서 이름과 상관없는 고정 열쇠를 쓴다.
const PAL_KEY = 'item_palette_color';

ITEM_CATALOG[PAL_ITEM] = {
    price: PAL_PRICE, usable: true, targetable: false, effect: 'color_palette',
    desc: '입고 있는 옷이나 악세 하나를 아무 색으로나 물들인다. 한 개에 한 번.'
};

// 우주 쇼핑몰에는 안 넣는다 (유쾌 판매소 고정 진열)
if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
    const _p = ALIEN_ITEMS_POOL.indexOf(PAL_ITEM);
    if (_p > -1) ALIEN_ITEMS_POOL.splice(_p, 1);
}

(function palette() {

const Z = 99999990;         // 알림창(99999999)보다는 아래
let ov = null;              // 떠 있는 창
let run = null;             // { sheet, hue, prev, paintT }

function me_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function have() {
    const u = me_();
    return ((u && u.inventory) || []).filter(function (n) { return n === PAL_ITEM; }).length;
}
function boughtToday() {
    try {
        const key = getShopCycleKey();
        return ((currentUser.purchaseRecord || {})[key] || {})[PAL_KEY] || 0;
    } catch (e) { return 0; }
}
function parts() {
    try { return (typeof window.dotWornParts === 'function') ? window.dotWornParts() : []; }
    catch (e) { return []; }
}
function curHue(sheet) {
    const u = me_();
    const c = (u && u.dot && u.dot.col) || {};
    const v = c[sheet];
    return (v == null || v === '') ? null : Number(v);
}

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('pal-css')) return;
    const s = document.createElement('style');
    s.id = 'pal-css';
    s.textContent = [
        '#pal-ov{position:fixed;inset:0;z-index:' + Z + ';background:rgba(0,0,0,.72);',
        '  display:flex;align-items:center;justify-content:center;padding:14px;}',
        '#pal-box{width:100%;max-width:330px;max-height:92vh;overflow-y:auto;',
        '  background:#16161b;border:1px solid #4a4336;border-radius:12px;padding:14px;',
        '  box-shadow:0 10px 40px rgba(0,0,0,.6);}',
        '#pal-box .t{font-size:13px;color:#e8c27a;text-align:center;margin-bottom:3px;}',
        '#pal-box .s{font-size:10px;color:#8d8578;text-align:center;margin-bottom:10px;}',
        '#pal-who{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px;',
        '  scrollbar-width:thin;}',
        '#pal-who button{flex:0 0 auto;padding:7px 11px;font-size:11px;border-radius:8px;',
        '  background:rgba(255,255,255,.04);border:1px solid #4a5160;color:#ded5c4;',
        '  white-space:nowrap;cursor:pointer;font-family:inherit;}',
        '#pal-who button.on{background:rgba(217,160,90,.28);border-color:#8a6a2a;',
        '  border-width:2px;padding:6px 10px;font-weight:bold;}',
        '#pal-mid{display:flex;align-items:center;justify-content:center;gap:12px;}',
        '#pal-wheel{touch-action:none;cursor:pointer;flex:0 0 auto;}',
        '#pal-prev{flex:0 0 auto;width:118px;height:150px;position:relative;overflow:hidden;}',
        '#pal-prev .dot-box{position:absolute;left:-22px;top:-22px;}',
        '#pal-num{text-align:center;font-size:11px;color:#9a948a;margin:8px 0 2px 0;}',
        '#pal-keep{text-align:center;font-size:10px;color:#8d8578;min-height:14px;}',
        '#pal-btns{display:flex;gap:7px;margin-top:11px;}',
        '#pal-btns button{flex:1;padding:11px 4px;font-size:11px;border-radius:9px;cursor:pointer;',
        '  background:rgba(255,255,255,.05);border:1px solid #4a5160;color:#ded5c4;font-family:inherit;}',
        '#pal-btns button.go{background:rgba(217,160,90,.3);border-color:#8a6a2a;font-weight:bold;}',
        '#pal-btns button:disabled{opacity:.4;cursor:default;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 색고리
// ==========================================
const R_OUT = 76, R_IN = 46, CV = 168;

function drawWheel(cv, hue) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = CV * dpr; cv.height = CV * dpr;
    cv.style.width = CV + 'px'; cv.style.height = CV + 'px';
    const x = cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, CV, CV);
    const c = CV / 2;
    // 고리 — 1도씩 부채꼴로 채운다 (가장자리가 안 벌어지게 1.5도씩 겹친다)
    for (let d = 0; d < 360; d++) {
        const a0 = (d - 90 - 0.75) * Math.PI / 180;
        const a1 = (d - 90 + 0.75) * Math.PI / 180;
        x.beginPath();
        x.arc(c, c, R_OUT, a0, a1);
        x.arc(c, c, R_IN, a1, a0, true);
        x.closePath();
        x.fillStyle = 'hsl(' + d + ',85%,52%)';
        x.fill();
    }
    // 가운데 — 고른 색
    x.beginPath(); x.arc(c, c, R_IN - 7, 0, Math.PI * 2);
    x.fillStyle = 'hsl(' + hue + ',72%,55%)'; x.fill();
    x.lineWidth = 2; x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke();
    // 손잡이
    const a = (hue - 90) * Math.PI / 180;
    const r = (R_OUT + R_IN) / 2;
    x.beginPath(); x.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 9, 0, Math.PI * 2);
    x.lineWidth = 3; x.strokeStyle = '#fff'; x.stroke();
    x.lineWidth = 1.5; x.strokeStyle = 'rgba(0,0,0,.6)'; x.stroke();
}

// 그림은 돌리는 동안 쉬었다 칠한다 (한 장 70ms)
function previewSoon() {
    clearTimeout(run.paintT);
    run.paintT = setTimeout(function () {
        const box = document.getElementById('pal-prev');
        if (!box || !run) return;
        const el = box.querySelector('.dot-layer[data-sheet="' + run.sheet + '"]');
        if (!el) return;
        el.dataset.hue = run.hue;
        const t = (typeof window.dotTint === 'function') ? window.dotTint(run.sheet, run.hue) : null;
        // 아직 안 만들어졌으면 closet.js 의 알림이 다 됐을 때 갈아 끼운다
        if (t) el.style.backgroundImage = 'url("' + t + '")';
    }, 120);
}

function setHue(h) {
    run.hue = ((Math.round(h) % 360) + 360) % 360;
    const cv = document.getElementById('pal-wheel');
    if (cv) drawWheel(cv, run.hue);
    const n = document.getElementById('pal-num');
    if (n) n.innerText = '색 ' + run.hue + '°';
    const go = document.getElementById('pal-go');
    if (go) {
        const same = (curHue(run.sheet) === run.hue);
        go.disabled = same || have() < 1;
        go.innerText = same ? '이미 그 색' : (have() < 1 ? '팔레트 없음' : '물들이기 (1개)');
    }
    previewSoon();
}

function wheelHit(cv, ev) {
    const r = cv.getBoundingClientRect();
    const dx = ev.clientX - (r.left + r.width / 2);
    const dy = ev.clientY - (r.top + r.height / 2);
    if (!dx && !dy) return;
    setHue(Math.atan2(dy, dx) * 180 / Math.PI + 90);
}

// ==========================================
// 창
// ==========================================
function shut() {
    if (run) {
        clearTimeout(run.paintT);
        if (typeof run.off === 'function') run.off();     // window 에 건 것을 떼어 낸다
    }
    const box = document.getElementById('pal-prev');
    if (box && typeof window.dotStop === 'function') {
        Array.prototype.forEach.call(box.querySelectorAll('.dot-box'), window.dotStop);
    }
    if (ov) ov.remove();
    ov = null; run = null;
}

function paintPrev() {
    const box = document.getElementById('pal-prev');
    if (!box) return;
    if (typeof window.dotStop === 'function') {
        Array.prototype.forEach.call(box.querySelectorAll('.dot-box'), window.dotStop);
    }
    box.innerHTML = '';
    const u = me_();
    if (!u || typeof window.dotSprite !== 'function') return;
    // ★ 지금 입은 그대로에 **고른 색만 얹어** 그린다 (live:false — 멈춘 그림)
    const L = window.dotLook(u);
    const dot = { head: L.head, col: Object.assign({}, L.col) };
    Object.keys(L.pick).forEach(function (k) { dot[k] = L.pick[k]; });
    dot.col[run.sheet] = run.hue;
    box.appendChild(window.dotSprite(u, { pose: 'stand', scale: 0.46, live: false, dot: dot }));
}

function paintWho() {
    const box = document.getElementById('pal-who');
    if (!box) return;
    box.innerHTML = '';
    parts().forEach(function (x) {
        const b = document.createElement('button');
        if (x.sheet === run.sheet) b.className = 'on';
        b.innerText = x.name;
        b.onclick = function () { pickPart(x.sheet); };
        box.appendChild(b);
    });
}

function pickPart(sheet) {
    run.sheet = sheet;
    const now = curHue(sheet);
    run.hue = (now == null) ? 0 : now;
    const p = parts().filter(function (x) { return x.sheet === sheet; })[0] || {};
    const k = document.getElementById('pal-keep');
    if (k) k.innerText = p.keep ? '안쪽 하얀 셔츠는 그대로 둡니다 — 겉만 물듭니다.' : '';
    const off = document.getElementById('pal-off');
    if (off) off.disabled = (now == null);
    paintWho();
    paintPrev();
    setHue(run.hue);
}

function open(sheet) {
    const list = parts();
    if (!list.length) {
        showCustomAlert('물들일 옷이나 악세를 먼저 입어 주세요.\n(사택 → 옷장)');
        return;
    }
    if (!list.some(function (x) { return x.sheet === sheet; })) sheet = list[0].sheet;
    shut();
    run = { sheet: sheet, hue: 0, paintT: null };

    ov = document.createElement('div');
    ov.id = 'pal-ov';
    ov.innerHTML =
        '<div id="pal-box">'
        + '<div class="t">🎨 컬러 팔레트</div>'
        + '<div class="s">가진 것 <b id="pal-cnt"></b>개 · 한 번에 한 개</div>'
        + '<div id="pal-who"></div>'
        + '<div id="pal-mid"><canvas id="pal-wheel"></canvas><div id="pal-prev"></div></div>'
        + '<div id="pal-num"></div>'
        + '<div id="pal-keep"></div>'
        + '<div id="pal-btns">'
        + '<button id="pal-off">원래대로</button>'
        + '<button id="pal-go" class="go">물들이기 (1개)</button>'
        + '<button id="pal-x">그만</button>'
        + '</div></div>';
    document.body.appendChild(ov);
    ov.onclick = function (e) { if (e.target === ov) shut(); };

    const cv = ov.querySelector('#pal-wheel');
    let down = false;
    cv.addEventListener('pointerdown', function (e) { down = true; wheelHit(cv, e); e.preventDefault(); });
    // ★ 손가락을 고리 밖으로 끌어도 따라오게 window 에 건다.
    //   ✗ setPointerCapture 는 쓰지 않는다 — 조이스틱에서 lostpointercapture 가
    //     거품처럼 올라와 떼어진 것으로 읽혔던 적이 있다 (plaza.js 참고).
    const mv = function (e) { if (down) { wheelHit(cv, e); e.preventDefault(); } };
    const up = function () { down = false; };
    window.addEventListener('pointermove', mv, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    run.off = function () {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
    };

    ov.querySelector('#pal-x').onclick = shut;
    ov.querySelector('#pal-off').onclick = wipe;
    ov.querySelector('#pal-go').onclick = apply;
    cnt();
    pickPart(sheet);
}

function cnt() {
    const c = document.getElementById('pal-cnt');
    if (c) c.innerText = have();
}

// ── 되돌린다 (공짜)
function wipe() {
    if (!run || typeof window.dotSetCol !== 'function') return;
    if (curHue(run.sheet) == null) return;
    window.dotSetCol(run.sheet, '');
    const off = document.getElementById('pal-off');
    if (off) off.disabled = true;
    setHue(run.hue);
    paintPrev();
}

// ── 물들인다 (팔레트 한 개)
function apply() {
    if (!run) return;
    const u = me_(); if (!u || typeof window.dotSetCol !== 'function') return;
    if (curHue(run.sheet) === run.hue) { showCustomAlert('이미 그 색입니다.'); return; }
    const i = (u.inventory || []).indexOf(PAL_ITEM);
    if (i < 0) { showCustomAlert('컬러 팔레트가 없습니다.\n유쾌 판매소에서 ' + PAL_PRICE + ' P 에 삽니다.'); return; }
    u.inventory.splice(i, 1);
    const p = parts().filter(function (x) { return x.sheet === run.sheet; })[0] || {};
    window.dotSetCol(run.sheet, run.hue);
    addHistoryLog(u, '[컬러 팔레트] ' + (p.name || run.sheet) + ' 을(를) ' + run.hue + '° 로 물들였습니다.');
    saveFields({ inventory: 1, history: 1 });
    try { updateUI(); } catch (e) { }
    cnt();
    const off = document.getElementById('pal-off');
    if (off) off.disabled = false;
    setHue(run.hue);
    paintPrev();
}

window.dotPalette = open;

// ==========================================
// 기존 함수에 이어 붙인다 (skin.js · skip.js 가 하던 그대로)
// ==========================================
(function hook() {
    const _useInventoryItem = useInventoryItem;
    useInventoryItem = function (itemName) {
        const c = ITEM_CATALOG[itemName];
        if (c && c.effect === 'color_palette') {
            const l = parts();
            open(l.length ? l[0].sheet : '');
            return;
        }
        return _useInventoryItem.apply(this, arguments);
    };

    // 유쾌 판매소 — 늘 진열한다 (스킵권 바로 뒤)
    const _getToday5ShopItems = getToday5ShopItems;
    getToday5ShopItems = function () {
        const list = _getToday5ShopItems.apply(this, arguments)
            .filter(function (n) { return n !== PAL_ITEM; });
        // 스킵권 바로 뒤에 세운다 (이름을 베껴 적지 않고 effect 로 찾는다)
        let at = -1;
        list.forEach(function (n, i) {
            const c = ITEM_CATALOG[n];
            if (c && c.effect === 'skip_pass') at = i;
        });
        list.splice(at + 1, 0, PAL_ITEM);
        return list;
    };

    const _buyRegularShopItem = buyRegularShopItem;
    buyRegularShopItem = function (itemId, itemName, price) {
        if (itemName !== PAL_ITEM) return _buyRegularShopItem.apply(this, arguments);
        if (!buyGuard()) return;
        if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 상점을 이용할 수 없습니다.'); return; }
        const key = getShopCycleKey();
        if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
        if (!currentUser.purchaseRecord[key]) currentUser.purchaseRecord[key] = {};
        const bought = currentUser.purchaseRecord[key][PAL_KEY] || 0;
        if (currentUser.code !== 'kario0987' && bought >= PAL_DAILY) {
            showCustomAlert('컬러 팔레트는 하루 ' + PAL_DAILY + '개까지 살 수 있습니다.'); return;
        }
        if (currentUser.points < price) { showLuxuryAlert(); return; }
        currentUser.points -= price;
        currentUser.purchaseRecord[key][PAL_KEY] = bought + 1;
        currentUser.inventory.push(itemName);
        addHistoryLog(currentUser, '[상점 구매] ' + itemName + ' (-' + price + ' P)');
        saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
        updateUI();
    };

    // 진열 줄의 잔여 표기를 하루 한도에 맞춘다
    const _renderRegularShop = renderRegularShop;
    renderRegularShop = function () {
        const r = _renderRegularShop.apply(this, arguments);
        const box = document.getElementById('regular-shop-items-container');
        if (!box || !currentUser) return r;
        const left = currentUser.code === 'kario0987' ? 99 : Math.max(0, PAL_DAILY - boughtToday());
        Array.prototype.forEach.call(box.querySelectorAll('.shop-item'), function (el) {
            if (el.innerText.indexOf(PAL_ITEM) < 0) return;
            const info = el.querySelector('span[style*="color:#888"]');
            if (info) info.innerHTML = ITEM_CATALOG[PAL_ITEM].desc
                + ' (잔여: ' + (left === 99 ? '무제한' : left + '/' + PAL_DAILY + '개') + ')';
            const btn = el.querySelector('button');
            if (btn) {
                const out = left === 0;
                btn.disabled = out;
                btn.innerText = out ? '품절' : PAL_PRICE + ' P';
                el.classList.toggle('sold-out', out);
            }
        });
        return r;
    };
})();

window.paletteState = function () {
    const u = me_();
    console.log('%c===== 🎨 컬러 팔레트 =====', 'color:#e8c27a; font-size:13px');
    console.log('  가진 개수  :', have());
    console.log('  오늘 산 것 :', boughtToday(), '/', PAL_DAILY, '· 한 개', PAL_PRICE, 'P');
    console.log('  물든 것    :', JSON.stringify(((u && u.dot) || {}).col || {}));
    console.log('  물들일 거리:', parts().map(function (x) {
        return x.name + '(' + x.sheet + (x.keep ? ' 겉만' : '') + ')';
    }).join(' · ') || '없음');
};

console.log('[팔레트] 유쾌 판매소 ' + PAL_PRICE + ' P · 하루 ' + PAL_DAILY + '개 — paletteState()');

})();
