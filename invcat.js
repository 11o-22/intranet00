// ==========================================
// ★ 소지품 분류 — 카테고리별 접기
// index.html 에서 skin.js 다음에 불러온다
// ==========================================

const INV_CATS = [
    { id:'food',   name:'음식',        icon:'🍚', color:'#8bc34a' },
    { id:'heal',   name:'회복',        icon:'💊', color:'#4CAF50' },
    { id:'potion', name:'물약',        icon:'🧪', color:'#ba68c8' },
    { id:'equip',  name:'장비',        icon:'⚔',  color:'#d4af37' },
    { id:'dark',   name:'어둠 회수품', icon:'🕯', color:'#ff6b6b' },
    { id:'qshop',  name:'???',         icon:'◈',  color:'#c9a8ff' },
    { id:'alien',  name:'우주 쇼핑몰', icon:'🛸', color:'#00A2E8' },
    { id:'craft',  name:'조합 재료',   icon:'⚗',  color:'#7fd4d4' },
    { id:'etc',    name:'기타',        icon:'📦', color:'#888' }
];

// 물품 하나가 어느 칸에 들어가는지
function invCatOf(name) {
    const c = ITEM_CATALOG[name];
    if (!c) return 'etc';

    if (c.effect === 'food' || c.cookMat) return 'food';
    if (name.endsWith('물약')) return 'potion';
    if (String(c.effect || '').startsWith('equip')) return 'equip';

    // 조합 재료 — 레시피에 쓰이는 것
    if (typeof CRAFT_RECIPES !== 'undefined' &&
        CRAFT_RECIPES.some(r => r.mats.includes(name))) return 'craft';
    if (['두 번째 자리', '세 번째 자리', '확정 승인서'].includes(name)) return 'craft';

    if (c.darkOnly) return 'dark';
    if (c.qShop) return 'qshop';
    if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.includes(name)) return 'alien';
    if (c.effect === 'heal' || c.effect === 'radio' || c.effect === 'candy') return 'heal';

    return 'etc';
}

// 접힘 상태 — 사원 데이터에 남긴다
function invFolded(id) {
    const f = (currentUser && currentUser.invFold) || {};
    return !!f[id];
}

function toggleInvCat(id) {
    if (!currentUser) return;
    if (!currentUser.invFold) currentUser.invFold = {};
    currentUser.invFold[id] = !currentUser.invFold[id];
    saveFields({ invFold: 1 });
    renderInventory();
}

function invFoldAll(on) {
    if (!currentUser) return;
    currentUser.invFold = {};
    if (on) INV_CATS.forEach(c => { currentUser.invFold[c.id] = true; });
    saveFields({ invFold: 1 });
    renderInventory();
}

// 카드 하나를 어느 칸에 넣을지 — 이름표를 붙여 둔다
function invTagCards() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    Array.from(box.querySelectorAll('.inv-card')).forEach(el => {
        const nameEl = el.querySelector('.inv-card-name');
        if (!nameEl) return;
        el.dataset.invName = nameEl.innerText.trim();
    });
}

// 그려진 소지품 카드를 카테고리 박스로 옮긴다
function applyInvCats() {
    const box = document.getElementById('inventory-list-container');
    if (!box || !currentUser) return;
    if (box.querySelector('.inv-cat-wrap')) return;   // 이미 처리됨

    invTagCards();
    const cards = Array.from(box.querySelectorAll('.inv-card'));
    if (cards.length === 0) return;

    // 카드 앞쪽의 고정 블록(전용 장비·금고·커플링·장착 중 등)은 그대로 둔다
    const firstCard = cards[0];
    const head = [];
    let node = box.firstChild;
    while (node && node !== firstCard) {
        const next = node.nextSibling;
        head.push(node);
        node = next;
    }

    const groups = {};
    cards.forEach(el => {
        const id = invCatOf(el.dataset.invName || '');
        if (!groups[id]) groups[id] = [];
        groups[id].push(el);
    });

    const wrap = document.createElement('div');
    wrap.className = 'inv-cat-wrap';

    const bar = document.createElement('div');
    bar.style.cssText = 'display:flex; gap:6px; margin-bottom:10px;';
    bar.innerHTML = `
        <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:10px;" onclick="invFoldAll(false)">모두 펼치기</button>
        <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:10px;" onclick="invFoldAll(true)">모두 접기</button>`;
    wrap.appendChild(bar);

    INV_CATS.forEach(cat => {
        const list = groups[cat.id];
        if (!list || list.length === 0) return;

        const folded = invFolded(cat.id);
        const sec = document.createElement('div');
        sec.style.cssText = 'margin-bottom:10px;';

        const head2 = document.createElement('div');
        head2.style.cssText = `display:flex; justify-content:space-between; align-items:center; cursor:pointer;
            padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);
            border:1px solid ${cat.color}55; border-left:3px solid ${cat.color};`;
        head2.onclick = () => toggleInvCat(cat.id);
        head2.innerHTML = `
            <span style="font-size:12px; color:${cat.color}; font-weight:bold;">
                ${cat.icon} ${cat.name}
                <span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">${list.length}종</span>
            </span>
            <span style="font-size:10px; color:#888;">${folded ? '▲' : '▼'}</span>`;
        sec.appendChild(head2);

        const body = document.createElement('div');
        body.style.cssText = `margin-top:7px; ${folded ? 'display:none;' : ''}`;
        list.forEach(el => body.appendChild(el));
        sec.appendChild(body);

        wrap.appendChild(sec);
    });

    box.innerHTML = '';
    head.forEach(n => box.appendChild(n));
    box.appendChild(wrap);
}

// --- 기존 함수에 연결 ---
(function hookInvCat() {
    const _renderInventory = renderInventory;
    renderInventory = function () {
        const r = _renderInventory.apply(this, arguments);
        try { applyInvCats(); } catch (e) { console.warn('소지품 분류 실패:', e); }
        return r;
    };
})();