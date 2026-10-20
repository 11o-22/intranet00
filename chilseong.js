// ==========================================
// ★ 🐯 제 칠(七) 성군(星君) — 상담사 지급 전용 (2026-10-20)
// bundles.json 마지막 묶음 맨 끝 — babyfox.js · moon.js · dark-count.js · dna-gifts.js · itemfix.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//
//   장착품이다. 차고 있으면 장착칸의 「해제」 옆에 [🐯 칠성] 이 붙고, 거기서
//   일곱 성군에게 청하거나 치성을 드린다. 은심장 · 호사수구 · K·LEE 와 같은 결 —
//   상점 · 우주 쇼핑몰 · 장터 어디에도 안 깔리고 팔 수도 없다.
//   주는 법은 chilGive(사번) 과 당국 화면의 「물품 강제 꽂기」뿐이다.
//
//   「재난」은 어둠 탐사를 말한다 (사용자가 정함). 기록 소실(3시 33분 방송국)에는 걸지 않는다.
//
// ■ 치성 — ★ 달린 음식을 바친다
//
//   행복 식당의 S 등급 요리 ★ (이름 끝이 「 ★」 · ITEM_CATALOG[이름].star) 만 받는다.
//   ★ 요리의 격 — 평범끼리(한상 차림 …) 3 · 섞은 것(셰프의 농담 …) 2 · 괴상끼리(식당의 바닥 …) 1.
//   치성은 그날 하루 걸린다 (자정이 지나면 걷힌다).
//
// ■ 일곱
//
//   ① 탐랑  하루 1번 ★ 음식 다섯 → 상점 · 횟수 하나를 초기화 (격이 높을수록 드문 쪽이 잘 뜬다)
//            유쾌 판매소 40 · ??? 상점 30 · 우주 쇼핑몰 10 · 어둠 탐사 횟수 10 · 공용 시설 횟수 5 · 망상 홈쇼핑 5
//   ② 거문  차고 있는 사람이 방에 있으면 최소 인원이 1인 — 혼자서도 어느 구역이든 들어간다.
//            3인 이하로 들어가면 (차고 있는 사람에게) 안전한 선택지 표시 🐯 · 판정 +3 · 행운 +2 (낮은 굴림 다시 굴림 두 번)
//            치성(★ 하나 · 하루 세 번) — 다음 홀로 탐사 한 번: 즉사 한 번 피함 · 그래도 죽으면 오염도 0 으로 귀환 (격리 없음)
//   ③ 녹존  하루 3번 — 선녀탕 · 상담실에 갇힌 사원을 꺼낸다. 나는 10,000~20,000 P · 그 사원은 오염도 0~20% 로 나온다 (옥방울 소리)
//            치성(★ 다섯) — 다음 탐사 한 번: 죽어서 선녀탕 · 상담실로 가게 되면 녹존의 선물(유쾌 · ??? · 우주 물품 하나)을 들고 바로 나온다
//   ④ 문곡  하루 1번 — 「청한다」를 눌러 두면 다음 생환 때 그 구역 회수품 셋 중 하나를 확정으로 고른다
//            고르고 나면 그날 회수품 확률 ×1.5~2.5 · 치성(★ 셋) — 셋 중 둘
//   ⑤ 염정  열 가지 속성(회피 · 파괴 · 치유 · 행운 · 감각 · 은신 · 연결 · 응시 · 보정 · 굳건) 중 하나를 준다 — 탐사 중 D 로 함께한다
//            치성(★ 다섯 · 하루 1번) — 그날 그 속성 L · 두 개까지. 내 전용 장비 등급이 더 높으면 그쪽을 쓴다
//   ⑥ 무곡  생환 포인트 ×1.5~2 · 같이 간 파티원 한 명에게 10~15% 를 더 준다
//            파티(2인 이상)가 아무도 죽지 않고 나오면 ×2~4 · 포인트가 가장 적은 사원에게 5% 확정
//            치성(★ 일곱 · 하루 1번) — 다음 탐사 한 번: 내가 살아 나오면 ×7 · 같이 간 파티원은 ×5
//   ⑦ 파군  탐사 중 쓰러져 가는 일행(구조 화면)을 구한다 — 하루 3번 확정 (+2,000 P), 그 뒤로는 다이스 (DC 10 · 9,000~15,000 P)
//            치성(★ 셋 · 하루 1번) — 그날 구한 사람 셋도 같은 포인트를 받는다
//
//   늘어난 포인트(무곡 몫 · 파군 몫)는 남의 것을 덜어 주는 것이 아니라 새로 얹는다.
//   남에게 가는 포인트는 payouts/<사번> 으로 보낸다 (그 사람이 들어오면 받는다).
//
// ■ 적히는 자리 — users/<사번>/chil (날짜를 안에 둔다 · 날이 바뀌면 그 자리에서 다시 센다)
//
//   { day, tam, geo, geoArm, nok, nokArm, mun, munArm, munJi, munX, yeom:[], yeomJi, mugJi, mugArm, pag, pagJi, pagShare }
//   users/<사번>/chilFreed  { by, byName, at }    녹존에게 구출받은 쪽 (화면이 방을 닫고 알린다)
//   darkParties/<방>/chilMug { by, n }             무곡 치성이 걸린 파티 — 같이 간 사람 ×5
//
// ■ 콘솔
//   chilGive(사번)    상담사가 하나 준다
//   chilState(사번)   오늘 쓴 것 · 걸린 치성
//   chilReset(사번)   상담사 — 오늘 쓴 것을 지운다

const CHIL = {
    NAME: '🐯 제 칠(七) 성군(星君)',
    ADMIN: 'kario0987',
    GEO_DAY: 3, NOK_DAY: 3, PAG_DAY: 3,
    NOK_PT: [10000, 20000], NOK_POLL: [0, 20],
    PAG_PT: 2000, PAG_DC: 10, PAG_DICE: [9000, 15000],
    SMALL: 3, GEO_BON: 3, GEO_LUCK: 2,
    MUN_X: [1.5, 2.5],
    MUG: { x: [1.5, 2.0], all: [2.0, 4.0], share: [0.10, 0.15], poor: 0.05, me7: 7, mate5: 5 },
    JI: { geo: 1, nok: 5, mun: 3, yeom: 5, mug: 7, pag: 3 },     // 치성에 드는 ★ 음식 수
    TAM_N: 5
};

(function chilSeong() {

const NAME = CHIL.NAME;
const ADMIN = CHIL.ADMIN;

// ==========================================
// 손에 잡히는 것들
// ==========================================
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function baseOf(w) { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
window.chilWears = wears;
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code && u.code !== ADMIN; });
}
function userOf(code) { return (typeof db !== 'undefined' && db.users) ? db.users[code] || null : null; }
function nameOf(code) { const u = userOf(code); return (u && u.name) || '사원'; }
function find(who) {
    if (!who) return me();
    return users().filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
function rnd(a, b) { return a + Math.random() * (b - a); }
function rint(a, b) { return Math.floor(rnd(a, b + 1)); }
function won(n) { return (Math.round(Number(n) || 0)).toLocaleString() + ' P'; }
function pay(n) {
    n = Math.round(Number(n) || 0);
    if (!n) return;
    try { if (typeof changePoints === 'function') { changePoints(n); return; } } catch (e) { }
    const u = me(); if (u) u.points = Math.max(0, (Number(u.points) || 0) + n);
}
function sendPay(code, n, note) {
    n = Math.round(Number(n) || 0);
    const d = db_();
    if (!d || !code || n <= 0) return;
    try { d.ref('payouts/' + code).push({ amount: n, note: note, at: Date.now() }); } catch (e) { }
}
function arr(v) {
    if (Array.isArray(v)) return v.filter(function (x) { return x != null; });
    if (v && typeof v === 'object') return Object.keys(v).sort().map(function (k) { return v[k]; }).filter(function (x) { return x != null; });
    return [];
}
function save(f) { try { if (typeof saveFields === 'function') saveFields(Object.assign({ chil: 1 }, f || {})); } catch (e) { } }
function ui() { try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }

// ==========================================
// 하루 자리 — 날짜를 안에 둔다
// ==========================================
//   날이 바뀌면 그날 쓴 것 · 걸린 치성을 걷는다. 염정에게 준 첫 속성만 남긴다 (D 로).
function st(u) {
    u = u || me();
    if (!u) return {};
    const d = today();
    let s = u.chil;
    if (!s || typeof s !== 'object' || s.day !== d) {
        const old = (s && typeof s === 'object') ? s : {};
        const y = arr(old.yeom);
        s = { day: d, yeom: y.length ? [y[0]] : [] };
        u.chil = s;
    }
    if (!Array.isArray(s.yeom)) s.yeom = arr(s.yeom);
    return s;
}

// ==========================================
// ★ 음식 — 치성
// ==========================================
const TIER = {};
['한상 차림', '열두 첩 반상', '야참 특선', '식당 최고의 날'].forEach(function (n) { TIER[n] = 3; });
['끝나지 않는 한 그릇', '식당의 비밀 메뉴', '셰프의 농담', '이름 없는 코스'].forEach(function (n) { TIER[n] = 2; });
['식당의 바닥', '아무도 못 먹은 것'].forEach(function (n) { TIER[n] = 1; });
function isStar(name) {
    const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[name] : null;
    return !!((c && c.star) || /\s★$/.test(String(name || '')));
}
function tierOf(name) { return TIER[String(name || '').replace(/\s*★$/, '')] || 1; }
// 가진 ★ 음식 — [{ n, t, c }] (격 낮은 것부터)
function stars(u) {
    u = u || me();
    const cnt = {};
    (u && Array.isArray(u.inventory) ? u.inventory : []).forEach(function (x) { if (isStar(x)) cnt[x] = (cnt[x] || 0) + 1; });
    return Object.keys(cnt).map(function (n) { return { n: n, t: tierOf(n), c: cnt[n] }; })
        .sort(function (a, b) { return a.t - b.t || (a.n < b.n ? -1 : 1); });
}
function starCount(u) { return stars(u).reduce(function (a, x) { return a + x.c; }, 0); }

// ==========================================
// 창
// ==========================================
function topZ() {
    try {
        const ov = document.getElementById('dark-run-overlay');
        if (ov && ov.style.display !== 'none') return 10000000;
    } catch (e) { }
    return 100002;
}
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = 'chil-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:' + topZ() + '; display:flex; align-items:center;'
        + ' justify-content:center; background:rgba(0,0,0,0.8); padding:16px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#1a1408,#0b0904); border:1px solid #8a6a2a;'
        + ' border-radius:14px; padding:15px; max-width:400px; width:100%; max-height:86vh; display:flex;'
        + ' flex-direction:column; box-shadow:0 10px 36px rgba(0,0,0,0.6); color:#efe4c8;">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function shut() { Array.prototype.forEach.call(document.querySelectorAll('.chil-modal'), function (x) { x.remove(); }); }
window.chilShut = shut;
const HEAD = 'font-size:14px; font-weight:bold; color:#ffd479; margin-bottom:8px; letter-spacing:1px;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1; min-height:0; margin-bottom:10px;';
const CARD = 'border:1px solid #4a3a1a; border-radius:9px; padding:10px 11px; margin-bottom:9px; background:rgba(255,212,121,0.04);';
const BTN = 'margin:6px 6px 0 0; padding:7px 11px; font-size:11px;';
const GOLD = ' background:linear-gradient(145deg,#6a4c10,#2e2004) !important; border-color:#d4a84a !important; color:#ffe6a8 !important;';
const GREY = ' background:#232323 !important; border-color:#3c3c3c !important; color:#8a8a8a !important;';
function btn(label, fn, off, gold) {
    return '<button class="game-btn" style="' + BTN + (off ? GREY : (gold ? GOLD : '')) + '"' + (off ? ' disabled' : '')
        + ' onclick="' + fn + '">' + label + '</button>';
}
function closeBtn() {
    return '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;" onclick="chilShut()">닫기</button>';
}

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'chil_equip', noSell: true, equipKind: 'chil',
            desc: '북두의 일곱 성군이 곁에 선다. 장착하면 장착칸의 [🐯 칠성] 에서 일곱 성군에게 청하거나 '
                + '★ 달린 음식으로 치성을 드릴 수 있다. — 탐랑 · 거문 · 녹존 · 문곡 · 염정 · 무곡 · 파군'
        };
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME); } catch (e) { }
        if (/[.#$\[\]\/]/.test(NAME)) console.error('[칠성] 물품 이름에 파이어베이스 열쇠로 못 쓰는 글자가 있습니다: ' + NAME);
        console.log('[칠성] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();
setInterval(function () {
    try {
        if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
        let i;
        while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
        if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
    } catch (e) { }
}, 5000);
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._chil) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._chil = true;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 장착
// ==========================================
(function equip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._chil) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'chil_equip') return _u.apply(this, arguments);
            const u = me();
            if (!u) return;
            if ((u.inventory || []).indexOf(itemName) < 0) { alert_('가지고 있지 않습니다.'); return; }
            if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
            if (wears(u)) { alert_('이미 차고 있습니다.'); return; }
            if (u.equippedWeapons.length >= 12) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            u.equippedWeapons.push(NAME);
            if (typeof setEquipOwner === 'function') setEquipOwner(u, NAME, u.code);
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, itemName, 1);
            if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, '[장착됨] ' + NAME);
            log_(u, '[장착] ' + NAME);
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            ui();
            alert_('🐯 북두의 일곱 성군이 곁에 섭니다.\n\n장착칸의 [🐯 칠성] 을 누르면 성군께 청하거나 치성을 드릴 수 있습니다.');
        };
        useInventoryItem._chil = true;
        clearInterval(iv);
        console.log('[칠성] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 장착칸 [🐯 칠성]
(function slotBtn() {
    const ID = 'chil-list-btn';
    function stick() {
        const box2 = document.getElementById('inventory-list-container');
        if (!box2) return;
        const old = document.getElementById(ID);
        if (!wears(me())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < box2.children.length; i++) {
            const t = box2.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = box2.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;' + GOLD;
        b.textContent = '🐯 칠성';
        b.onclick = function () { menu(); };
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._chilBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._chilBtn = true;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 60000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 목록 — 일곱 성군
// ==========================================
const GODS = [
    { k: 'tam', n: '제일 탐랑성군(貪狼星君)', s: '자손에게 만덕을 베풀고 번영을 도우며, 기운을 돋우는 생기를 주관하는 성군' },
    { k: 'geo', n: '제이 거문성군(巨文星君)', s: '인간의 장애와 재난을 없애 주고 의식을 풍족하게 하며 장수를 돕는 성군' },
    { k: 'nok', n: '제삼 녹존성군(祿存星君)', s: '전생과 이승의 업장을 소멸시켜 주며, 인간의 재난을 다스리는 성군' },
    { k: 'mun', n: '제사 문곡성군(文曲星君)', s: '구하는 바와 소원을 성취하게 도우며, 하늘의 이법과 지혜, 때를 주관하는 성군' },
    { k: 'yeom', n: '제오 염정성군(廉貞星君)', s: '살아가며 겪는 백 가지 장애를 제거해 주고, 중앙에서 사방을 도우며 형벌을 다스리는 성군' },
    { k: 'mug', n: '제육 무곡성군(武曲星君)', s: '인간에게 복덕과 재물을 두루 갖추게 하여 평안한 삶을 살 수 있도록 돕는 성군' },
    { k: 'pag', n: '제칠 파군성군(破軍星君)', s: '수명과 영원한 생명을 관장하며, 적을 격파하는 강력한 위력을 상징하는 성군' }
];
function line(t) { return '<div style="font-size:11px; color:#d8cba8; line-height:1.75; margin-top:5px;">' + t + '</div>'; }
function tag(t, on) { return '<span style="font-size:10px; color:' + (on ? '#ffd479' : '#8a7a5a') + ';">' + t + '</span>'; }

function menu() {
    const u = me();
    if (!u) return;
    if (!wears(u)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    const s = st(u), sc = starCount(u);
    const yl = s.yeom.length ? s.yeom.map(function (a) { return attrName(a) + ' ' + (s.yeomJi ? 'L' : 'D'); }).join(' · ') : '없음';
    const h = GODS.map(function (g) {
        let body = '';
        if (g.k === 'tam') {
            body = line('하루 한 번 ★ 음식 다섯을 바친다. 만족하시는 만큼 — 유쾌 판매소 · ??? 상점 · 우주 쇼핑몰 · 어둠 탐사 횟수 · 공용 시설 횟수 · 망상 홈쇼핑 중 하나를 초기화한다. 격이 높은 음식일수록 드문 쪽이 잘 뜬다.')
                + '<div>' + btn('★ 다섯을 바친다', 'chilTamOpen()', !!s.tam || sc < CHIL.TAM_N, true) + tag(s.tam ? '오늘 바침' : '오늘 1번', !s.tam) + '</div>';
        } else if (g.k === 'geo') {
            body = line('내가 방에 있으면 최소 인원이 1인 — 어느 구역이든 혼자서도 들어간다. 3인 이하로 들어가면 안전한 선택지가 🐯 로 보이고 판정 +3 · 행운 +2.')
                + line('치성(★ 하나 · 하루 세 번) — 다음 홀로 탐사 한 번: 즉사를 한 번 피하고, 그래도 죽으면 오염도 0 으로 귀환한다.')
                + '<div>' + btn('치성 (★1)', "chilJi('geo')", (s.geo || 0) >= CHIL.GEO_DAY || sc < CHIL.JI.geo, true)
                + tag('치성 ' + (s.geo || 0) + ' / ' + CHIL.GEO_DAY + ' · 걸린 보호 ' + (s.geoArm || 0), (s.geoArm || 0) > 0) + '</div>';
        } else if (g.k === 'nok') {
            body = line('선녀탕 · 상담실에 갇힌 사원을 꺼낸다 (하루 세 번). 구출할 때마다 10,000~20,000 P · 그 사원은 옥방울 소리와 함께 오염도 0~20% 로 나온다.')
                + line('치성(★ 다섯) — 다음 탐사 한 번: 죽어서 선녀탕 · 상담실로 가게 되면 녹존의 선물을 들고 바로 나온다.')
                + '<div>' + btn('갇힌 사원 보기', 'chilNokList()', (s.nok || 0) >= CHIL.NOK_DAY, true)
                + btn('치성 (★5)', "chilJi('nok')", !!s.nokArm || sc < CHIL.JI.nok)
                + tag('구출 ' + (s.nok || 0) + ' / ' + CHIL.NOK_DAY + (s.nokArm ? ' · 치성 걸림' : ''), !!s.nokArm) + '</div>';
        } else if (g.k === 'mun') {
            body = line('하루 한 번 — 청해 두면 다음 생환 때 그 구역 회수품 셋 중 하나를 확정으로 고른다. 고르고 나면 그날 회수품 확률이 1.5~2.5배.')
                + line('치성(★ 셋) — 셋 중 둘을 고른다.')
                + '<div>' + btn(s.munArm ? '청해 두었습니다' : '청한다', 'chilMunArm()', !!s.mun || !!s.munArm, true)
                + btn('치성 (★3)', "chilJi('mun')", !!s.munJi || !!s.mun || sc < CHIL.JI.mun)
                + tag(s.mun ? '오늘 고름' + (s.munX ? ' · 회수품 ×' + Number(s.munX).toFixed(1) : '') : (s.munArm ? '다음 생환 때' + (s.munJi ? ' · 둘' : '') : '오늘 1번'), !!(s.munArm || s.munX)) + '</div>';
        } else if (g.k === 'yeom') {
            body = line('열 가지 속성 중 하나를 드리면, 염정성군이 그 속성(D)으로 탐사에 함께 든다. 내 전용 장비 등급이 더 높으면 그쪽을 쓴다.')
                + line('치성(★ 다섯 · 하루 한 번) — 그날 그 속성 L · 두 개까지 (자정이 지나면 첫 속성 D 로 돌아간다).')
                + '<div>' + btn('속성을 드린다', 'chilYeomOpen()', false, true)
                + btn('치성 (★5)', "chilJi('yeom')", !!s.yeomJi || sc < CHIL.JI.yeom)
                + tag('지금: ' + esc(yl), s.yeom.length > 0) + '</div>';
        } else if (g.k === 'mug') {
            body = line('생환하면 얻은 포인트 ×1.5~2, 같이 간 파티원 한 명에게 그 10~15% 를 더 준다. 파티가 아무도 죽지 않고 나오면 ×2~4 · 포인트가 가장 적은 사원에게 5%.')
                + line('치성(★ 일곱 · 하루 한 번) — 다음 탐사 한 번: 살아 나오면 ×7 · 같이 간 파티원은 ×5.')
                + '<div>' + btn('치성 (★7)', "chilJi('mug')", !!s.mugJi || sc < CHIL.JI.mug, true)
                + tag(s.mugArm ? '치성 걸림 — 다음 탐사' : (s.mugJi ? '오늘 치성 씀' : '늘 함께한다'), !!s.mugArm) + '</div>';
        } else if (g.k === 'pag') {
            body = line('탐사 중 일행이 쓰러져 가면 구조 화면에 파군성군이 선다. 하루 세 번은 확정 구출 (+2,000 P), 그 뒤로는 다이스 (DC 10 · 9,000~15,000 P).')
                + line('치성(★ 셋 · 하루 한 번) — 그날 구한 사람 셋도 같은 포인트를 받는다.')
                + '<div>' + btn('치성 (★3)', "chilJi('pag')", !!s.pagJi || sc < CHIL.JI.pag, true)
                + tag('확정 ' + Math.max(0, CHIL.PAG_DAY - (s.pag || 0)) + ' / ' + CHIL.PAG_DAY + (s.pagShare ? ' · 나눔 ' + s.pagShare + '명' : ''), (s.pag || 0) < CHIL.PAG_DAY) + '</div>';
        }
        return '<div style="' + CARD + '"><div style="font-size:12px; font-weight:bold; color:#ffd479;">' + esc(g.n) + '</div>'
            + '<div style="font-size:10px; color:#9a8a6a; margin-top:2px;">' + esc(g.s) + '</div>' + body + '</div>';
    }).join('');
    box('<div style="' + HEAD + '">🐯 제 칠(七) 성군(星君)</div>'
        + '<div style="font-size:10px; color:#9a8a6a; margin-bottom:9px;">가진 ★ 음식 ' + sc + '개 · 치성은 그날 하루 걸린다</div>'
        + '<div style="' + SCROLL + '">' + h + '</div>' + closeBtn());
}
window.chilMenu = menu;

// ==========================================
// ★ 고르기 — n 개를 바친다 (격 낮은 것부터 미리 골라 둔다)
// ==========================================
let pick = null;   // { need, sel:{name:count}, title, go }
function picker(need, title, go) {
    const list = stars();
    const sel = {};
    let left = need;
    list.forEach(function (x) { const k = Math.min(x.c, left); if (k > 0) { sel[x.n] = k; left -= k; } });
    pick = { need: need, sel: sel, title: title, go: go };
    drawPick();
}
function drawPick() {
    if (!pick) return;
    const list = stars();
    const tot = Object.keys(pick.sel).reduce(function (a, k) { return a + (pick.sel[k] || 0); }, 0);
    const rows = list.map(function (x, i) {
        const k = pick.sel[x.n] || 0;
        return '<div style="display:flex; align-items:center; gap:6px; padding:7px 0; border-bottom:1px dashed #3a2e14;">'
            + '<div style="flex:1; min-width:0; font-size:12px;">' + esc(x.n)
            + ' <span style="font-size:10px; color:#9a8a6a;">격 ' + '★'.repeat(x.t) + ' · ' + x.c + '개</span></div>'
            + '<button class="game-btn" style="margin:0; padding:4px 10px; font-size:12px;" onclick="chilPick(' + i + ',-1)">−</button>'
            + '<b style="min-width:18px; text-align:center; color:#ffd479;">' + k + '</b>'
            + '<button class="game-btn" style="margin:0; padding:4px 10px; font-size:12px;" onclick="chilPick(' + i + ',1)">+</button></div>';
    }).join('');
    box('<div style="' + HEAD + '">' + esc(pick.title) + '</div>'
        + '<div style="font-size:11px; color:#d8cba8; margin-bottom:8px;">★ 음식 <b style="color:#ffd479;">' + tot + ' / ' + pick.need + '</b></div>'
        + '<div style="' + SCROLL + '">' + (rows || '<div style="font-size:11px; color:#8a7a5a;">★ 음식이 없습니다.</div>') + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;' + (tot === pick.need ? GOLD : GREY) + '"'
        + (tot === pick.need ? '' : ' disabled') + ' onclick="chilPickGo()">바친다</button>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;" onclick="chilMenu()">돌아간다</button>');
}
window.chilPick = function (i, d) {
    if (!pick) return;
    const x = stars()[i]; if (!x) return;
    const tot = Object.keys(pick.sel).reduce(function (a, k) { return a + (pick.sel[k] || 0); }, 0);
    const cur = pick.sel[x.n] || 0;
    const nx = Math.max(0, Math.min(x.c, cur + d));
    if (d > 0 && tot >= pick.need) return;
    pick.sel[x.n] = nx;
    drawPick();
};
window.chilPickGo = function () {
    if (!pick) return;
    const u = me();
    const have = {}; stars(u).forEach(function (x) { have[x.n] = x.c; });
    const out = [];
    Object.keys(pick.sel).forEach(function (n) { for (let i = 0; i < (pick.sel[n] || 0) && i < (have[n] || 0); i++) out.push(n); });
    if (out.length !== pick.need) { alert_('★ 음식이 모자랍니다.'); return; }
    out.forEach(function (n) { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, n, 1); });
    const go = pick.go;
    pick = null;
    shut();
    try { go(out); } catch (e) { console.error('[칠성]', e); }
};

// ==========================================
// 치성 — 거문 · 녹존 · 문곡 · 염정 · 무곡 · 파군
// ==========================================
const JI_NAME = { geo: '거문성군', nok: '녹존성군', mun: '문곡성군', yeom: '염정성군', mug: '무곡성군', pag: '파군성군' };
window.chilJi = function (k) {
    const u = me();
    if (!u || !wears(u)) return;
    const s = st(u), need = CHIL.JI[k];
    if (k === 'geo' && (s.geo || 0) >= CHIL.GEO_DAY) { alert_('오늘 거문성군께 드릴 치성은 다 드렸습니다.'); return; }
    if (k === 'nok' && s.nokArm) { alert_('녹존성군의 치성이 이미 걸려 있습니다.'); return; }
    if (k === 'mun' && (s.munJi || s.mun)) { alert_('오늘은 문곡성군께 더 청할 수 없습니다.'); return; }
    if (k === 'yeom' && s.yeomJi) { alert_('오늘 염정성군께는 이미 치성을 드렸습니다.'); return; }
    if (k === 'mug' && s.mugJi) { alert_('오늘 무곡성군께는 이미 치성을 드렸습니다.'); return; }
    if (k === 'pag' && s.pagJi) { alert_('오늘 파군성군께는 이미 치성을 드렸습니다.'); return; }
    if (starCount(u) < need) { alert_('★ 달린 음식이 ' + need + '개 있어야 합니다.'); return; }
    picker(need, JI_NAME[k] + '께 치성 — ★ ' + need + '개', function (foods) {
        const s2 = st(u);
        let msg = '';
        if (k === 'geo') { s2.geo = (s2.geo || 0) + 1; s2.geoArm = (s2.geoArm || 0) + 1; msg = '다음 홀로 탐사 한 번 — 즉사를 한 번 피하고, 그래도 죽으면 오염도 0 으로 귀환합니다.'; }
        if (k === 'nok') { s2.nokArm = 1; msg = '다음 탐사 한 번 — 죽어서 선녀탕 · 상담실로 가게 되면 녹존의 선물을 들고 바로 나옵니다.'; }
        if (k === 'mun') { s2.munJi = 1; s2.munArm = 1; msg = '다음 생환 때 회수품 셋 중 둘을 고릅니다.'; }
        if (k === 'yeom') { s2.yeomJi = 1; msg = '오늘 하루 염정성군의 속성이 L 로 굳고, 두 개까지 드릴 수 있습니다.'; }
        if (k === 'mug') { s2.mugJi = 1; s2.mugArm = 1; msg = '다음 탐사 한 번 — 살아 나오면 ×7, 같이 간 파티원은 ×5.'; }
        if (k === 'pag') { s2.pagJi = 1; s2.pagShare = 3; msg = '오늘 파군성군이 구한 사람 셋도 같은 포인트를 받습니다.'; }
        log_(u, '[🐯 ' + JI_NAME[k] + '] 치성 — ' + foods.join(', '));
        save({ inventory: 1, history: 1 });
        ui();
        alert_('🐯 ' + JI_NAME[k] + '께 치성을 드렸습니다.\n\n' + msg);
        if (k === 'yeom') setTimeout(window.chilYeomOpen, 300);
    });
};

// ==========================================
// ① 탐랑 — ★ 다섯 → 초기화 하나
// ==========================================
const TAM = [
    { k: 'joy',   n: '유쾌 판매소 초기화',     w: 40, b: -0.5 },
    { k: 'q',     n: '??? 상점 초기화',        w: 30, b: 0 },
    { k: 'alien', n: '우주 쇼핑몰 초기화',     w: 10, b: 1 },
    { k: 'dark',  n: '어둠 탐사 횟수 초기화',  w: 10, b: 2 },
    { k: 'fac',   n: '공용 시설 횟수 초기화',  w: 5,  b: 3 },
    { k: 'dream', n: '망상 홈쇼핑 초기화',     w: 5,  b: 3 }
];
// 격 합 5~15 → 기울기 0~1. 드문 쪽(b 가 큰 쪽)이 그만큼 무거워진다
//   전부 괴상 ★(5) — 40 · 30 · 10 · 10 · 5 · 5
//   전부 평범 ★(15) — 20 · 30 · 20 · 30 · 20 · 20
function tamWeights(sum) {
    const tilt = Math.max(0, Math.min(1, (sum - 5) / 10));
    return TAM.map(function (x) { return Math.max(0.1, x.w * (1 + tilt * x.b)); });
}
window.chilTamWeights = tamWeights;
function tamRoll(sum) {
    const w = tamWeights(sum), tot = w.reduce(function (a, b) { return a + b; }, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return TAM[i]; }
    return TAM[0];
}
function rmRemote(path) { const d = db_(); if (!d) return; try { d.ref(path).remove().catch(function () { }); } catch (e) { } }
function tamDo(k) {
    const u = me(), d = today();
    const f = {};
    if (k === 'joy') {
        let ck = ''; try { ck = getShopCycleKey(); } catch (e) { }
        if (ck && u.purchaseRecord && u.purchaseRecord[ck]) delete u.purchaseRecord[ck];
        if (ck) rmRemote('users/' + u.code + '/purchaseRecord/' + ck);
        u.chilShop = { k: ck, s: Math.floor(Math.random() * 1e9) };      // 진열도 새로 섞는다
        f.chilShop = 1;
    } else if (k === 'q') {
        let sk = ''; try { sk = qshopSlotKey(); } catch (e) { }
        if (sk && u.qshopRecord && u.qshopRecord[sk]) delete u.qshopRecord[sk];
        if (sk) rmRemote('users/' + u.code + '/qshopRecord/' + sk);
    } else if (k === 'alien') {
        u.alienTries = 0; u.alienDailyUsed = 0; u.lastAlienPlayTime = 0;
        try { u.alienDate = get22HourCycleStr(); } catch (e) { }
        u.alienUnlockedItems = []; u.alienBoughtItems = [];
        Object.assign(f, { alienTries: 1, alienDailyUsed: 1, lastAlienPlayTime: 1, alienDate: 1 });
        rmRemote('users/' + u.code + '/alienUnlockedItems');
        rmRemote('users/' + u.code + '/alienBoughtItems');
    } else if (k === 'dark') {
        u.darkDate = d; u.darkTries = 0;            // dark-count.js 가 차이를 서버(darkUse)로 보낸다
    } else if (k === 'fac') {
        u.facilityCount = 0; u.lastFacilityDate = d;
        Object.assign(f, { facilityCount: 1, lastFacilityDate: 1 });
    } else if (k === 'dream') {
        u.petEggAt = '';
        f.petEggAt = 1;
    }
    return f;
}
// 유쾌 판매소 — 탐랑이 섞은 진열 (그 주기 안에서만)
(function hookShop() {
    const iv = setInterval(function () {
        if (typeof getToday5ShopItems !== 'function' || typeof ALL_10_ITEMS === 'undefined') return;
        if (getToday5ShopItems._chil) { clearInterval(iv); return; }
        const _g = getToday5ShopItems;
        const w = function () {
            const u = me();
            try {
                const ck = getShopCycleKey();
                if (u && u.code !== ADMIN && u.chilShop && u.chilShop.k === ck) {
                    const key = ck + u.code + '#' + u.chilShop.s;
                    let seed = 0;
                    for (let i = 0; i < key.length; i++) seed += key.charCodeAt(i) * (i + 3);
                    return ALL_10_ITEMS.slice().sort(function (a, b) {
                        const r1 = Math.sin(seed + a.length * 13 + a.charCodeAt(0)) * 10000;
                        const r2 = Math.sin(seed + b.length * 13 + b.charCodeAt(0)) * 10000;
                        return (r1 - Math.floor(r1)) - (r2 - Math.floor(r2));
                    }).slice(0, 8);
                }
            } catch (e) { }
            return _g.apply(this, arguments);
        };
        w._chil = true;
        getToday5ShopItems = w;
        window.getToday5ShopItems = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
window.chilTamOpen = function () {
    const u = me();
    if (!u || !wears(u)) return;
    if (st(u).tam) { alert_('오늘 탐랑성군께는 이미 바쳤습니다.'); return; }
    if (starCount(u) < CHIL.TAM_N) { alert_('★ 달린 음식이 ' + CHIL.TAM_N + '개 있어야 합니다.'); return; }
    picker(CHIL.TAM_N, '탐랑성군께 바친다 — ★ ' + CHIL.TAM_N + '개', function (foods) {
        const s = st(u);
        const sum = foods.reduce(function (a, n) { return a + tierOf(n); }, 0);
        const r = tamRoll(sum);
        const f = tamDo(r.k);
        s.tam = 1;
        log_(u, '[🐯 탐랑성군] ' + foods.join(', ') + ' → ' + r.n);
        save(Object.assign({ inventory: 1, history: 1 }, f));
        ui();
        try { if (typeof renderRegularShop === 'function') renderRegularShop(); } catch (e) { }
        try { if (typeof renderQShop === 'function') renderQShop(); } catch (e) { }
        const mood = sum >= 13 ? '크게 흡족해하신다' : (sum >= 9 ? '흡족해하신다' : '음식을 거두신다');
        alert_('🐯 탐랑성군께서 ' + mood + '.\n\n「' + r.n + '」\n\n(바친 음식의 격 ' + sum + ' / 15)');
    });
};

// ==========================================
// ② 거문 — 최소 인원 1인 · 작은 파티의 길잡이 · 홀로 탐사 보호
// ==========================================
function partyHasWearer(p) {
    try {
        if (!p || !p.members) return false;
        return Object.keys(p.members).some(function (c) {
            const u = (me() && me().code === c) ? me() : userOf(c);
            return wears(u);
        });
    } catch (e) { return false; }
}
(function hookRoom() {
    const iv = setInterval(function () {
        if (typeof renderPartyRoom !== 'function' || typeof launchParty !== 'function' || typeof DARK_ZONES === 'undefined') return;
        if (renderPartyRoom._chil && launchParty._chil) { clearInterval(iv); return; }
        if (!renderPartyRoom._chil) {
            const _r = renderPartyRoom;
            const w = function (p) {
                let z = null, min0 = null;
                try { if (p && DARK_ZONES[p.zone] && partyHasWearer(p)) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; } } catch (e) { }
                try { return _r.apply(this, arguments); } finally { if (z && min0 != null) z.min = min0; }
            };
            w._chil = true;
            renderPartyRoom = w; window.renderPartyRoom = w;
        }
        if (!launchParty._chil) {
            const _l = launchParty;
            const w2 = function () {
                let z = null, min0 = null;
                try {
                    const p = (typeof getMyParty === 'function') ? getMyParty() : null;
                    if (p && DARK_ZONES[p.zone] && partyHasWearer(p)) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; }
                } catch (e) { }
                try { return _l.apply(this, arguments); } finally { if (z && min0 != null) z.min = min0; }
            };
            w2._chil = true;
            launchParty = w2; window.launchParty = w2;
        }
        clearInterval(iv);
        console.log('[칠성] 거문 — 최소 인원 1인 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 지금 탐사가 거문의 작은 파티인가 (차고 있는 사람 · 3인 이하)
function geoSmall() {
    const r = run(), u = me();
    return !!(r && u && wears(u) && (Number(r.memberCount) || 1) <= CHIL.SMALL);
}
window.chilGeoSmall = geoSmall;
// 안전한 선택지 — 0번이 가장 안전한 쪽이다 (safe_hint 관례 · babyfox 감각과 같은 약속)
(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._chil) { clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            try {
                if (geoSmall() && Array.isArray(options) && options.length > 1 && options[0] && String(options[0].label || '').indexOf('🐯') < 0) {
                    const safe = Object.assign({}, options[0]);
                    safe.label = '🐯 ' + safe.label;
                    options = [safe].concat(options.slice(1));
                    text = String(text || '') + '<br><br><span style="color:#ffd479;">— 거문성군이 삿된 쪽을 가린다. 🐯 가 안전한 길이다.</span>';
                }
            } catch (e) { }
            return _c.call(this, title, text, options, imgKey);
        };
        w._chil = true;
        renderChoiceStep = w; window.renderChoiceStep = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 판정 +3
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._chil) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        const w = function () {
            let b = _r.apply(this, arguments);
            try { if (geoSmall()) b += CHIL.GEO_BON; } catch (e) { }
            return b;
        };
        w._chil = true;
        rollDarkBonus = w; window.rollDarkBonus = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 행운 +2 — 탐사 들 때 채우는 행운(낮은 굴림 다시 굴림) 횟수에 얹는다 (dna-gifts.js dnaCharge.luck)
(function hookCharge() {
    const iv = setInterval(function () {
        if (typeof resetDnaCharge !== 'function') return;
        if (resetDnaCharge._chil) { clearInterval(iv); return; }
        const _c = resetDnaCharge;
        const w = function () {
            const r = _c.apply(this, arguments);
            try { if (geoSmall() && typeof dnaCharge === 'object' && dnaCharge) dnaCharge.luck = (dnaCharge.luck || 0) + CHIL.GEO_LUCK; } catch (e) { }
            return r;
        };
        w._chil = true;
        resetDnaCharge = w; window.resetDnaCharge = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 탐사가 시작될 때 — 걸어 둔 치성을 이번 판에 싣는다
// ==========================================
function onRunStart(party) {
    const r = run(), u = me();
    if (!r || !u || r._chilStart) return;
    r._chilStart = true;
    if (!wears(u)) return;
    const s = st(u);
    const n = Number(r.memberCount) || 1;
    let ch = false;
    if (n <= 1 && (s.geoArm || 0) > 0) { s.geoArm--; r._geo = 1; ch = true; }
    if (s.nokArm) { s.nokArm = 0; r._nok = 1; ch = true; }
    if (s.mugArm) {
        s.mugArm = 0; r._mug = 1; ch = true;
        if (r.isParty && r.partyId && db_()) {
            try { db_().ref('darkParties/' + r.partyId + '/chilMug').set({ by: u.code, n: u.name || '' }); } catch (e) { }
        }
    }
    // 같이 간 사람 — 끝날 때는 방이 이미 비어 있을 수 있어 처음에 적어 둔다
    try {
        if (r.isParty && r.partyId) {
            const p = (party && party.members) ? party : ((typeof darkParties !== 'undefined' && darkParties[r.partyId]) || null);
            if (p && p.members) r._chilMates = Object.keys(p.members).filter(function (c) { return c !== u.code; });
        }
    } catch (e) { }
    if (ch) save();
}
['startDarkRun', 'launchPartyRun'].forEach(function (fn) {
    const iv = setInterval(function () {
        if (typeof window[fn] !== 'function') return;
        if (window[fn]._chil) { clearInterval(iv); return; }
        const _f = window[fn];
        const w = function (arg) {
            const out = _f.apply(this, arguments);
            const party = (arg && typeof arg === 'object') ? arg : null;      // launchPartyRun(party)
            try { onRunStart(party); } catch (e) { }
            setTimeout(function () { try { onRunStart(party); } catch (e) { } }, 300);
            return out;
        };
        w._chil = true;
        window[fn] = w;
        try { if (fn === 'startDarkRun') startDarkRun = w; else launchPartyRun = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
});

// ==========================================
// 죽음 — 거문의 보호 · 녹존의 선물
// ==========================================
const SHUT_ROOMS = ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay', 'quarantine-pick-overlay', 'fox-loading-overlay'];
function freeSelf(poll) {
    const u = me();
    u.pollution = poll; u.lastPollutionTime = Date.now();
    u.quarantineUntil = 0; u.quarantineExitPollution = 0; u.quarantineHospital = false; u.quarantineDest = null;
    u.foxRoomAnswered = false;
    try { if (typeof saveFields === 'function') saveFields({ pollution: 1, lastPollutionTime: 1, quarantineUntil: 1, quarantineExitPollution: 1, quarantineHospital: 1, quarantineDest: 1, foxRoomAnswered: 1, history: 1, inventory: 1 }); } catch (e) { }
}
function giftOf() {
    const pools = [];
    try { pools.push((ALL_10_ITEMS || []).slice()); } catch (e) { }
    try { pools.push(Object.keys(ITEM_CATALOG).filter(function (k) { return ITEM_CATALOG[k] && ITEM_CATALOG[k].qShop; })); } catch (e) { }
    try { pools.push((ALIEN_ITEMS_POOL || []).slice()); } catch (e) { }
    const ok = pools.map(function (p) {
        return p.filter(function (n) { return n && n !== NAME && n.indexOf('소원권') < 0 && typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[n]; });
    }).filter(function (p) { return p.length; });
    if (!ok.length) return null;
    const p = ok[Math.floor(Math.random() * ok.length)];
    return p[Math.floor(Math.random() * p.length)];
}
function patchReport(html) {
    try {
        const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
        if (!body) return;
        const t = body.innerHTML;
        const a = t.indexOf('🦊 여우 상담실로 긴급 이송됩니다.');
        if (a >= 0) {
            const b = t.indexOf('</span>', a);
            body.innerHTML = t.slice(0, a) + html + (b >= 0 ? t.slice(b + 7) : '');
        } else {
            const btn0 = body.querySelector('button');
            if (btn0) btn0.insertAdjacentHTML('beforebegin', '<div style="margin:0 0 12px; font-size:12px; line-height:1.8;">' + html + '</div>');
        }
        body.innerHTML = body.innerHTML.replace('오염도 <b style="color:#ff9800;">100%</b>', '오염도 <b style="color:#ffd479;">' + Math.round(me().pollution || 0) + '%</b>');
    } catch (e) { }
}
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._chil) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            const r = run(), u = me();
            // 거문 — 홀로 든 탐사에서 즉사를 한 번 피한다
            if (r && u && r._geo && !r._dead && !r._geoUsed && wears(u)) {
                r._geoUsed = true;
                r.fail = Math.max(0, (r.fail || 0) - 1);
                try { r.log.push('[🐯 거문성군] 즉사를 피함'); } catch (e) { }
                try {
                    darkBodyEl().innerHTML = darkBox('—', String(reasonText || '') + '<br><br><span style="color:#ffd479;">— 어디선가 큰 손이 등을 받친다.<br>'
                        + '거문성군이 삿된 것을 비껴 세웠다. 한 걸음, 딱 그만큼.</span>', darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                    if (typeof mountDarkChat === 'function') mountDarkChat('normal');
                } catch (e) { }
                try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                return;
            }
            const out = _d.apply(this, arguments);
            try {
                const died = !!(r && r._dead && u && u.pollution >= 100 && u.quarantineHospital === true);
                if (died && wears(u)) {
                    if (r._geo) {
                        freeSelf(0);
                        log_(u, '[🐯 거문성군] 홀로 든 탐사에서 쓰러졌으나 오염도 0 으로 귀환했습니다.');
                        patchReport('🐯 거문성군의 보호 — 오염도 0% 로 귀환합니다.<br><span style="font-size:10px; color:#aaa;">상담실 · 선녀탕으로 가지 않습니다.</span>');
                        save({ history: 1 });
                    } else if (r._nok) {
                        const poll = rint(CHIL.NOK_POLL[0], CHIL.NOK_POLL[1]);
                        const g = giftOf();
                        if (g) { if (!Array.isArray(u.inventory)) u.inventory = []; u.inventory.push(g); }
                        freeSelf(poll);
                        log_(u, '[🐯 녹존성군] 옥방울 소리 — 이송되기 전에 풀려났습니다 (오염도 ' + poll + '%)' + (g ? ' · 선물 「' + g + '」' : ''));
                        patchReport('🔔 옥방울 소리가 들려온다 — 녹존성군이 업장을 거두었습니다.<br>'
                            + '<span style="font-size:10px; color:#aaa;">이송되지 않고 오염도 ' + poll + '% 로 나옵니다.</span>'
                            + (g ? '<br><span style="color:#ffd479;">녹존의 선물 — 「' + esc(g) + '」</span>' : ''));
                        save({ history: 1, inventory: 1 });
                    }
                }
            } catch (e) { console.warn('[칠성] 죽음 처리 건너뜀', e && e.message); }
            return out;
        };
        w._chil = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
        console.log('[칠성] 거문 · 녹존 — 죽음 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ③ 녹존 — 갇힌 사원을 꺼낸다
// ==========================================
function inQ(u) {
    if (!u) return false;
    try { if (typeof isQuarantined === 'function') return !!isQuarantined(u); } catch (e) { }
    return !!(u.quarantineUntil && Date.now() < u.quarantineUntil);
}
window.chilNokList = function () {
    const u = me();
    if (!u || !wears(u)) return;
    const s = st(u);
    if ((s.nok || 0) >= CHIL.NOK_DAY) { alert_('오늘 녹존성군께 청할 수 있는 구출은 다 썼습니다.'); return; }
    const list = users().filter(function (x) { return x.code !== u.code && inQ(x); });
    const rows = list.map(function (x) {
        const bath = (x.quarantineDest || 'fox') === 'bath';
        const mins = Math.max(0, Math.round((Number(x.quarantineUntil) - Date.now()) / 60000));
        return '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px dashed #3a2e14;">'
            + '<div style="flex:1; min-width:0; font-size:12px;">' + (bath ? '♨ ' : '🦊 ') + esc(x.name)
            + ' <span style="font-size:10px; color:#9a8a6a;">' + (bath ? '선녀탕' : '상담실') + ' · ' + Math.floor(mins / 60) + '시간 ' + (mins % 60) + '분 남음</span></div>'
            + '<button class="game-btn" style="margin:0; padding:6px 11px; font-size:11px;' + GOLD + '" onclick="chilNokGo(\'' + esc(x.code) + '\')">꺼낸다</button></div>';
    }).join('');
    box('<div style="' + HEAD + '">🔔 녹존성군 — 갇힌 사원</div>'
        + '<div style="font-size:10px; color:#9a8a6a; margin-bottom:8px;">오늘 남은 구출 ' + (CHIL.NOK_DAY - (s.nok || 0)) + ' / ' + CHIL.NOK_DAY + '</div>'
        + '<div style="' + SCROLL + '">' + (rows || '<div style="font-size:11px; color:#8a7a5a;">지금 선녀탕 · 상담실에 갇힌 사원이 없습니다.</div>') + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;" onclick="chilMenu()">돌아간다</button>');
};
function cleanBadge(x) {
    if (x && x.badge && typeof x.badge.notes === 'string') {
        const a = x.badge.notes.split(' | ').filter(function (n) {
            return n.trim() !== '' && n.indexOf('의식 불명') < 0 && n.indexOf('긴급 이송') < 0 && n.indexOf('사직 반려') < 0;
        });
        x.badge.notes = a.length ? a.join(' | ') : '특이사항 없음';
        return true;
    }
    return false;
}
let nokBusy = false;
window.chilNokGo = function (code) {
    const u = me();
    if (!u || !wears(u) || nokBusy) return;
    if ((st(u).nok || 0) >= CHIL.NOK_DAY) { alert_('오늘 녹존성군께 청할 수 있는 구출은 다 썼습니다.'); return; }
    nokBusy = true;
    shut();
    const go = function (srv) {
        nokBusy = false;
        const s = st(u);
        if ((s.nok || 0) >= CHIL.NOK_DAY) return;
        const local = userOf(code), cur = srv || local;
        if (!cur || !inQ(cur)) { alert_('그 사원은 이미 나왔습니다.'); return; }
        const now = Date.now();
        const bath = (cur.quarantineDest || 'fox') === 'bath';
        const poll = rint(CHIL.NOK_POLL[0], CHIL.NOK_POLL[1]);
        const x = { badge: cur.badge ? JSON.parse(JSON.stringify(cur.badge)) : undefined, history: Array.isArray(cur.history) ? cur.history.slice() : [] };
        const f = { quarantineUntil: 0, quarantineExitPollution: 0, quarantineHospital: false, quarantineDest: null,
                    pollution: poll, lastPollutionTime: now, foxRoomAnswered: false,
                    chilFreed: { by: u.code, byName: u.name || '', at: now }, hasItemUsedOnMe: true };
        if (cleanBadge(x)) f.badge = x.badge;
        log_(x, '[🐯 녹존성군] 옥방울 소리 — ' + (u.name || '') + ' 사원의 청으로 ' + (bath ? '선녀탕' : '상담실') + '에서 나왔습니다. (오염도 ' + poll + '%)');
        f.history = x.history;
        if (local) Object.keys(f).forEach(function (k) { local[k] = f[k]; });
        try { if (typeof updateUserFields === 'function') updateUserFields(code, Object.assign({}, f)); } catch (e) { }
        const got = rint(CHIL.NOK_PT[0], CHIL.NOK_PT[1]);
        pay(got);
        s.nok = (s.nok || 0) + 1;
        log_(u, '[🐯 녹존성군] ' + (cur.name || nameOf(code)) + ' 사원을 ' + (bath ? '선녀탕' : '상담실') + '에서 꺼냈습니다 (+' + won(got) + ')');
        save({ history: 1 });
        ui();
        alert_('🔔 옥방울 소리가 들려온다.\n\n' + (cur.name || nameOf(code)) + ' 사원이 ' + (bath ? '선녀탕' : '상담실') + '에서 나왔습니다. (오염도 ' + poll + '%)\n\n+'
            + won(got) + '\n\n오늘 남은 구출 ' + (CHIL.NOK_DAY - s.nok) + ' / ' + CHIL.NOK_DAY);
    };
    const d = db_();
    if (!d) { go(null); return; }
    d.ref('users/' + code).once('value').then(function (sn) { go(sn && sn.val ? sn.val() : null); }).catch(function () { go(null); });
};
// 구출받은 쪽 — 방을 닫고 알린다 (자리에 없었으면 들어올 때)
setInterval(function () {
    try {
        const u = me();
        if (!u || !u.chilFreed || !u.chilFreed.at) return;
        const at = Number(u.chilFreed.at) || 0;
        if (at <= (Number(u.chilFreedSeen) || 0)) return;
        if (inQ(u)) return;
        u.chilFreedSeen = at;
        try { if (typeof saveFields === 'function') saveFields({ chilFreedSeen: 1 }); } catch (e) { }
        SHUT_ROOMS.forEach(function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
        try { document.body.style.overflow = ''; } catch (e) { }
        try { hasShownFoxAlert = false; } catch (e) { }
        ui();
        alert_('🔔 옥방울 소리가 들려온다.\n\n' + (u.chilFreed.byName || '누군가') + ' 사원이 녹존성군께 청해 당신을 꺼냈습니다.\n오염도 ' + Math.round(u.pollution || 0) + '% 로 나왔습니다.');
    } catch (e) { }
}, 2000);

// ==========================================
// ④ 문곡 — 회수품 셋 중 하나 (치성이면 둘) · 그 뒤 회수품 확률
// ==========================================
window.chilMunArm = function () {
    const u = me();
    if (!u || !wears(u)) return;
    const s = st(u);
    if (s.mun) { alert_('오늘 문곡성군께는 이미 청했습니다.'); return; }
    s.munArm = 1;
    save();
    alert_('🐯 문곡성군께 청해 두었습니다.\n\n다음 생환 때 그 구역 회수품 셋 중 ' + (s.munJi ? '둘' : '하나') + '를 확정으로 고릅니다.');
    menu();
};
let munPick = null;   // { zone, cand:[], need, sel:[] }
function munOpen(zone) {
    const u = me(), s = st(u);
    const pool = [];
    try { (DARK_LOOT_BY_ZONE[zone] || []).forEach(function (l) { if (l && l.name && pool.indexOf(l.name) < 0) pool.push(l.name); }); } catch (e) { }
    if (!pool.length) return false;
    const cand = pool.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 3);
    munPick = { zone: zone, cand: cand, need: Math.min(cand.length, s.munJi ? 2 : 1), sel: [] };
    munDraw();
    return true;
}
function munDraw() {
    if (!munPick) return;
    const rows = munPick.cand.map(function (n, i) {
        const on = munPick.sel.indexOf(i) >= 0;
        const c = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[n]) ? ITEM_CATALOG[n] : {};
        return '<div onclick="chilMunToggle(' + i + ')" style="cursor:pointer; ' + CARD + (on ? ' border-color:#ffd479; background:rgba(255,212,121,0.14);' : '') + '">'
            + '<div style="font-size:13px; font-weight:bold; color:' + (on ? '#ffd479' : '#efe4c8') + ';">' + (on ? '✔ ' : '') + esc(n) + '</div>'
            + (c.desc ? '<div style="font-size:10px; color:#9a8a6a; margin-top:3px;">' + esc(String(c.desc).slice(0, 90)) + '</div>' : '') + '</div>';
    }).join('');
    const okk = munPick.sel.length === munPick.need;
    box('<div style="' + HEAD + '">📜 문곡성군 — 회수품을 고른다</div>'
        + '<div style="font-size:11px; color:#d8cba8; margin-bottom:8px;">셋 중 <b style="color:#ffd479;">' + munPick.need + '</b>개 — 확정으로 손에 들어온다.</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;' + (okk ? GOLD : GREY) + '"' + (okk ? '' : ' disabled') + ' onclick="chilMunGo()">고른다</button>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:11px;" onclick="chilShut()">다음 생환으로 미룬다</button>');
}
window.chilMunToggle = function (i) {
    if (!munPick) return;
    const k = munPick.sel.indexOf(i);
    if (k >= 0) munPick.sel.splice(k, 1);
    else { if (munPick.sel.length >= munPick.need) munPick.sel.shift(); munPick.sel.push(i); }
    munDraw();
};
window.chilMunGo = function () {
    const u = me();
    if (!u || !munPick || munPick.sel.length !== munPick.need) return;
    const s = st(u);
    if (s.mun) { shut(); return; }
    const got = munPick.sel.map(function (i) { return munPick.cand[i]; });
    if (!Array.isArray(u.inventory)) u.inventory = [];
    got.forEach(function (n) { u.inventory.push(n); });
    s.mun = 1; s.munArm = 0; s.munX = Math.round(rnd(CHIL.MUN_X[0], CHIL.MUN_X[1]) * 10) / 10;
    log_(u, '[🐯 문곡성군] 회수품 확정 — ' + got.join(', ') + ' · 오늘 회수품 확률 ×' + s.munX);
    munPick = null;
    save({ inventory: 1, history: 1 });
    ui();
    shut();
    alert_('📜 문곡성군께서 때를 열어 주셨습니다.\n\n「' + got.join('」 「') + '」\n\n오늘 남은 탐사의 회수품 확률 ×' + s.munX);
};
// 회수품 확률 — 고른 뒤 그날
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof window.emLootMult !== 'function') return;
        if (window.emLootMult._chil) { clearInterval(iv); return; }
        const _e = window.emLootMult;
        const w = function (user) {
            let m = _e.apply(this, arguments);
            try {
                const u = user || me();
                if (u && wears(u) && u.chil && u.chil.day === today() && u.chil.munX) m *= Number(u.chil.munX) || 1;
            } catch (e) { }
            return m;
        };
        w._chil = true;
        window.emLootMult = w;
        try { emLootMult = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ⑤ 염정 — 속성을 드린다 · 탐사 중 함께한다
// ==========================================
const ATTRS = ['evade', 'break', 'heal', 'luck', 'sense', 'hide', 'bond', 'gaze', 'fix', 'steady'];
const ATTR_N = { evade: '회피', break: '파괴', heal: '치유', luck: '행운', sense: '감각', hide: '은신', bond: '연결', gaze: '응시', fix: '보정', steady: '굳건' };
function attrName(a) {
    try { if (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[a]) return GEAR_ATTRS[a].name; } catch (e) { }
    return ATTR_N[a] || a;
}
window.chilYeomOpen = function () {
    const u = me();
    if (!u || !wears(u)) return;
    const s = st(u), max = s.yeomJi ? 2 : 1;
    const rows = ATTRS.map(function (a) {
        const on = s.yeom.indexOf(a) >= 0;
        const ic = (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[a]) ? GEAR_ATTRS[a].icon : '';
        return '<button class="game-btn" style="margin:0 6px 6px 0; padding:8px 11px; font-size:12px;' + (on ? GOLD : '') + '" onclick="chilYeomSet(\'' + a + '\')">'
            + (on ? '✔ ' : '') + ic + ' ' + esc(attrName(a)) + '</button>';
    }).join('');
    box('<div style="' + HEAD + '">⚖ 염정성군 — 속성을 드린다</div>'
        + '<div style="font-size:11px; color:#d8cba8; margin-bottom:8px; line-height:1.7;">' + max + '개까지 · 등급 <b style="color:#ffd479;">' + (s.yeomJi ? 'L (오늘 치성)' : 'D') + '</b><br>'
        + '<span style="font-size:10px; color:#9a8a6a;">탐사 중에만 함께한다 · 내 전용 장비가 같은 속성을 더 높게 지녔으면 그쪽을 쓴다</span></div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;" onclick="chilMenu()">돌아간다</button>');
};
window.chilYeomSet = function (a) {
    const u = me();
    if (!u || !wears(u) || ATTRS.indexOf(a) < 0) return;
    if (run()) { alert_('탐사 중에는 바꿀 수 없습니다.'); return; }
    const s = st(u), max = s.yeomJi ? 2 : 1;
    const k = s.yeom.indexOf(a);
    if (k >= 0) s.yeom.splice(k, 1);
    else { if (s.yeom.length >= max) s.yeom.shift(); s.yeom.push(a); }
    save();
    window.chilYeomOpen();
};
// 염정이 함께하는 속성 — { attr: grade } (탐사 중 · 차고 있을 때)
function yeomOf(u) {
    if (!u || !wears(u) || !run()) return null;
    const s = u.chil;
    if (!s || typeof s !== 'object') return null;
    const y = arr(s.yeom);
    if (!y.length) return null;
    const live = s.day === today();
    const L = !!(live && s.yeomJi);
    const out = {};
    (L ? y.slice(0, 2) : y.slice(0, 1)).forEach(function (a) { out[a] = L ? 'L' : 'D'; });
    return out;
}
window.chilYeomOf = yeomOf;
function yeomVal(a, grade) {
    try {
        const mult = GEAR_MULT[grade] || 1, base = GEAR_BASE[a] || 0;
        if (a === 'break' || a === 'sense' || a === 'hide' || a === 'bond' || a === 'gaze') return Math.round(base * mult);
        return base * mult;
    } catch (e) { return 0; }
}
(function hookGear() {
    const iv = setInterval(function () {
        if (typeof gearValue !== 'function' || typeof gearHas !== 'function' || typeof GEAR_MULT === 'undefined') return;
        if (gearValue._chil) { clearInterval(iv); return; }
        const _v = gearValue, _h = gearHas;
        const v = function (user, attr) {
            const own = _v.apply(this, arguments);
            try {
                const y = yeomOf(user);
                if (y && y[attr]) return Math.max(own || 0, yeomVal(attr, y[attr]));
            } catch (e) { }
            return own;
        };
        const h = function (user, attr) {
            const own = _h.apply(this, arguments);
            if (own) return own;
            try { const y = yeomOf(user); if (y && y[attr]) return true; } catch (e) { }
            return own;
        };
        v._chil = true; h._chil = true;
        gearValue = v; window.gearValue = v;
        gearHas = h; window.gearHas = h;
        clearInterval(iv);
        console.log('[칠성] 염정 — 속성 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ⑥ 무곡 · ④ 문곡 — 생환
// ==========================================
function deathsSeen() {
    try {
        return (partyChatLog || []).some(function (m) { return m && m.code === 'SYSTEM' && /신호가 끊겼습니다/.test(String(m.text || '')); });
    } catch (e) { return false; }
}
function poorest(exclude) {
    const list = users().filter(function (x) {
        if (exclude.indexOf(x.code) >= 0) return false;
        try { if (typeof isRealUser === 'function' && !isRealUser(x)) return false; } catch (e) { }
        return true;
    });
    list.sort(function (a, b) { return (Number(a.points) || 0) - (Number(b.points) || 0); });
    return list[0] || null;
}
function addReport(html) {
    try {
        const body = darkBodyEl();
        if (!body) return;
        const all = body.querySelectorAll('div');
        let rep = null;
        for (let i = 0; i < all.length; i++) { if ((all[i].textContent || '').indexOf('[탐사 정산서]') >= 0 && all[i].children.length > 1) rep = all[i]; }
        const el = '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #6a5420; color:#ffd479; font-size:12px; line-height:1.8;">' + html + '</div>';
        if (rep) rep.insertAdjacentHTML('beforeend', el);
        else { const b = body.querySelector('button'); if (b) b.insertAdjacentHTML('beforebegin', el); }
    } catch (e) { }
}
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._chil) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const r = run(), u = me();
            const will = !!(r && u && !r._dead && !r._settled);
            let pre = null;
            if (will) {
                let mugBy = null;
                try { const p = r.partyId && darkParties[r.partyId]; mugBy = p && p.chilMug && p.chilMug.by ? p.chilMug : null; } catch (e) { }
                pre = { zone: r.zone, pid: r.partyId || null, n: Number(r.memberCount) || 1, mug: !!r._mug,
                        mates: (r._chilMates || []).slice(), dead: deathsSeen(), mugBy: mugBy, logs0: (u.darkLogs || []).length ? u.darkLogs[0] : null };
            }
            const out = _r.apply(this, arguments);
            if (!pre) return out;
            try {
                const lg = (u.darkLogs || [])[0];
                if (!lg || lg === pre.logs0 || lg.died) return out;
                const total = Math.max(0, Number(lg.reward) || 0);
                const lines = [];
                if (wears(u)) {
                    // 무곡
                    const all = pre.n >= 2 && !pre.dead;
                    const x = pre.mug ? CHIL.MUG.me7 : (all ? rnd(CHIL.MUG.all[0], CHIL.MUG.all[1]) : rnd(CHIL.MUG.x[0], CHIL.MUG.x[1]));
                    const xr = Math.round(x * 10) / 10;
                    const extra = Math.round(total * (xr - 1));
                    if (extra > 0) {
                        pay(extra);
                        lines.push('🐯 무곡성군 — 생환 포인트 ×' + xr + (pre.mug ? ' (치성)' : (all ? ' (전원 생환)' : '')) + ' <b>+' + won(extra) + '</b>');
                        log_(u, '[🐯 무곡성군] 생환 포인트 ×' + xr + ' (+' + won(extra) + ')');
                    }
                    const got = total + Math.max(0, extra);
                    if (pre.mates.length) {
                        const m = pre.mates[Math.floor(Math.random() * pre.mates.length)];
                        const sh = Math.round(got * rnd(CHIL.MUG.share[0], CHIL.MUG.share[1]));
                        if (sh > 0) {
                            sendPay(m, sh, '[🐯 무곡성군] ' + (u.name || '') + ' 사원과 함께한 탐사의 복덕 (+' + won(sh) + ')');
                            lines.push('· 함께 간 ' + esc(nameOf(m)) + ' 사원에게 ' + won(sh));
                        }
                    }
                    if (all) {
                        const pz = poorest([u.code]);
                        const pp = Math.round(got * CHIL.MUG.poor);
                        if (pz && pp > 0) {
                            sendPay(pz.code, pp, '[🐯 무곡성군] 전원 생환의 복덕이 닿았습니다 (+' + won(pp) + ')');
                            lines.push('· 가장 가난한 ' + esc(pz.name) + ' 사원에게 ' + won(pp));
                        }
                    }
                } else if (pre.mugBy && pre.mugBy.by !== u.code) {
                    // 같이 간 사람 — 무곡 치성 ×5
                    const extra = Math.round(total * (CHIL.MUG.mate5 - 1));
                    if (extra > 0) {
                        pay(extra);
                        lines.push('🐯 ' + esc(pre.mugBy.n || '동료') + ' 사원의 무곡성군 치성 — 생환 포인트 ×' + CHIL.MUG.mate5 + ' <b>+' + won(extra) + '</b>');
                        log_(u, '[🐯 무곡성군] ' + (pre.mugBy.n || '동료') + ' 사원의 치성 — 생환 포인트 ×' + CHIL.MUG.mate5 + ' (+' + won(extra) + ')');
                    }
                }
                if (lines.length) {
                    addReport(lines.join('<br>'));
                    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
                }
                // 문곡 — 청해 둔 날
                if (wears(u)) {
                    const s = st(u);
                    if (s.munArm && !s.mun) setTimeout(function () { munOpen(pre.zone); }, 500);
                }
            } catch (e) { console.warn('[칠성] 생환 처리 건너뜀', e && e.message); }
            return out;
        };
        w._chil = true;
        renderDarkResult = w; window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[칠성] 무곡 · 문곡 — 생환 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ⑦ 파군 — 쓰러져 가는 일행을 구한다
// ==========================================
let pagArgs = null;
(function hookRescue() {
    const iv = setInterval(function () {
        if (typeof renderRescuePrompt !== 'function') return;
        if (renderRescuePrompt._chil) { clearInterval(iv); return; }
        const _r = renderRescuePrompt;
        const w = function (info, code) {
            const out = _r.apply(this, arguments);
            try {
                const u = me(), r = run();
                if (u && r && wears(u) && code && !(r._pagTried && r._pagTried[code])) {
                    pagArgs = { info: info, code: code };
                    const s = st(u), left = Math.max(0, CHIL.PAG_DAY - (s.pag || 0));
                    const body = darkBodyEl();
                    const html = '<div id="chil-pag-box" style="border:1px solid #d4a84a; border-radius:6px; padding:11px; margin-bottom:9px; background:rgba(255,212,121,0.06);">'
                        + '<div style="font-size:12px; color:#ffd479; font-weight:bold;">🐯 제칠 파군성군께 청한다</div>'
                        + '<div style="font-size:10px; color:#bba; margin:4px 0 8px 0;">' + (left > 0
                            ? '확정으로 구한다 — 오늘 남은 확정 ' + left + ' / ' + CHIL.PAG_DAY + ' · +' + won(CHIL.PAG_PT)
                            : '다이스로 구한다 — DC ' + CHIL.PAG_DC + ' · 성공하면 ' + won(CHIL.PAG_DICE[0]) + '~' + won(CHIL.PAG_DICE[1])) + '</div>'
                        + '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;' + GOLD + '" onclick="chilPagGo(\'' + esc(code) + '\')">'
                        + (left > 0 ? '파군성군이 끌어낸다' : '🎲 파군성군께 굴린다') + '</button></div>';
                    const b = body && Array.prototype.filter.call(body.querySelectorAll('button'), function (x) { return /보고만 있는다/.test(x.textContent || ''); })[0];
                    if (b) b.insertAdjacentHTML('beforebegin', html);
                    else if (body) body.insertAdjacentHTML('beforeend', html);
                }
            } catch (e) { }
            return out;
        };
        w._chil = true;
        renderRescuePrompt = w; window.renderRescuePrompt = w;
        clearInterval(iv);
        console.log('[칠성] 파군 — 구조 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
window.chilPagGo = function (code) {
    const u = me(), r = run();
    if (!u || !r || !wears(u) || !code) return;
    if (!r._pagTried) r._pagTried = {};
    if (r._pagTried[code]) return;
    r._pagTried[code] = 1;
    const s = st(u);
    const sure = (s.pag || 0) < CHIL.PAG_DAY;
    let roll = 0, ok = true, got = CHIL.PAG_PT;
    if (sure) s.pag = (s.pag || 0) + 1;
    else {
        roll = Math.floor(Math.random() * 20) + 1;
        try { if (typeof luckReroll === 'function') roll = luckReroll(roll); } catch (e) { }
        ok = roll !== 1 && roll >= CHIL.PAG_DC;
        got = ok ? Math.round(CHIL.PAG_DICE[0] + (Math.min(20, roll) - CHIL.PAG_DC) * (CHIL.PAG_DICE[1] - CHIL.PAG_DICE[0]) / (20 - CHIL.PAG_DC)) : 0;
    }
    const who = (pagArgs && pagArgs.code === code && pagArgs.info && pagArgs.info.name) || nameOf(code);
    let txt;
    if (ok) {
        r.success = (r.success || 0) + 1;
        try { if (db_()) db_().ref('darkParties/' + r.partyId + '/dying/' + code).remove(); } catch (e) { }
        try { sendPartyChat(u.name + ' 사원이 파군성군의 힘으로 ' + who + ' 사원을 끌어냈습니다.', true); } catch (e) { }
        pay(got);
        let share = '';
        if ((s.pagShare || 0) > 0) {
            s.pagShare--;
            sendPay(code, got, '[🐯 파군성군] ' + (u.name || '') + ' 사원에게 구출받으며 받은 몫 (+' + won(got) + ')');
            share = '<br><span style="font-size:11px; color:#ffd479;">치성 — ' + esc(who) + ' 사원도 ' + won(got) + ' 를 받는다.</span>';
        }
        log_(u, '[🐯 파군성군] ' + who + ' 사원 구출 — ' + (sure ? '확정' : '다이스 ' + roll) + ' (+' + won(got) + ')');
        txt = '하늘이 갈라지는 소리가 난다. 흐려지던 윤곽을 커다란 손이 움켜쥐고 끌어낸다.<br><br>파군성군이 적을 격파했다.<br>'
            + '<b style="color:#ffd479;">+' + won(got) + '</b>' + share;
    } else {
        try { sendPartyChat(u.name + ' 사원이 파군성군께 청했으나 닿지 않았습니다.', true); } catch (e) { }
        log_(u, '[🐯 파군성군] ' + who + ' 사원 구출 실패 — 다이스 ' + roll);
        txt = '별빛이 내려오다 흩어진다.<br><br>닿지 않았다. 다른 손을 써야 한다.';
    }
    try { r.log.push('[🐯 파군] ' + (sure ? '확정' : 'd20 ' + roll + ' vs DC' + CHIL.PAG_DC) + ' — ' + (ok ? '성공' : '실패')); } catch (e) { }
    save({ history: 1 });
    const head = sure ? '' : '<div style="text-align:center; font-size:26px; font-weight:bold; color:' + (ok ? '#ffd479' : '#f44336') + '; margin-bottom:12px;">🎲 ' + roll
        + ' <span style="font-size:13px; color:#888;">(DC ' + CHIL.PAG_DC + ')</span></div>';
    let next;
    if (ok) {
        r._rescueShown = false;
        next = r.isLeader ? darkChoiceBtn('계속 간다.', 'partyAdvance(' + (r.step + 1) + ')')
            : '<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...<br>'
              + '<button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(' + (r.step + 1) + ')">먼저 간다</button></div>';
    } else {
        next = darkChoiceBtn('다른 방법을 쓴다.', 'chilPagBack()');
    }
    try {
        darkBodyEl().innerHTML = darkBox(ok ? '구조 — 파군성군' : '구조 — 닿지 않음', head + txt, next);
        if (typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
};
window.chilPagBack = function () {
    if (!pagArgs) return;
    try { renderRescuePrompt(pagArgs.info, pagArgs.code); } catch (e) { }
};

// ==========================================
// 상담사 · 확인
// ==========================================
window.chilGive = function (who, n) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(3, n || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '개 지급');
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    ui();
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};
window.chilState = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const s = (u.chil && u.chil.day === today()) ? u.chil : {};
    console.log('%c===== ' + u.name + ' · ' + NAME + ' =====', 'color:#ffd479; font-size:13px');
    console.log('  장착 :', wears(u) ? 'O' : '✗', ' · ★ 음식', starCount(u) + '개');
    console.log('  탐랑 :', s.tam ? '오늘 바침' : '-');
    console.log('  거문 :', '치성 ' + (s.geo || 0) + '/' + CHIL.GEO_DAY + ' · 걸린 보호 ' + (s.geoArm || 0));
    console.log('  녹존 :', '구출 ' + (s.nok || 0) + '/' + CHIL.NOK_DAY + (s.nokArm ? ' · 치성 걸림' : ''));
    console.log('  문곡 :', s.mun ? '고름 ×' + s.munX : (s.munArm ? '청해 둠' + (s.munJi ? ' (둘)' : '') : '-'));
    console.log('  염정 :', arr((u.chil || {}).yeom).join(', ') || '-', s.yeomJi ? '(오늘 L)' : '(D)');
    console.log('  무곡 :', s.mugArm ? '치성 걸림' : (s.mugJi ? '오늘 치성 씀' : '-'));
    console.log('  파군 :', '확정 ' + (s.pag || 0) + '/' + CHIL.PAG_DAY + (s.pagShare ? ' · 나눔 ' + s.pagShare : ''));
};
window.chilReset = function (who) {
    const a = me();
    if (!a || a.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const y = arr((t.chil || {}).yeom);
    t.chil = { day: today(), yeom: y.slice(0, 1) };
    try { if (typeof updateUserFields === 'function') updateUserFields(t.code, { chil: t.chil }); } catch (e) { }
    console.log('%c✓ ' + t.name + ' — 오늘 쓴 것을 지웠습니다.', 'color:#4CAF50');
};

})();
