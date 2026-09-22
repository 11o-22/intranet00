// ==========================================
// ★ 벽지 견본첩 — 무작위 고급 인터페이스
// index.html 에서 bank.js 다음에 불러온다
// ==========================================

// --- 아이템 등록 ---
ITEM_CATALOG['벽지 견본첩'] = {
    price: 4500, usable: true, targetable: false, effect: 'ui_skin',
    desc: '넘길 때마다 다른 방이 나온다. 사용하면 단말의 색·무늬·글꼴이 무작위로 바뀐다. 해제하면 견본첩은 사라진다.'
};
if (typeof ALIEN_ITEMS_POOL !== 'undefined' && !ALIEN_ITEMS_POOL.includes('벽지 견본첩')) {
    ALIEN_ITEMS_POOL.push('벽지 견본첩');
}

// --- 재료 ---
// 색: 모든 색상(0~359도)을 깊은 보석 톤 바탕으로 쓰고, 금속 또는 같은 계열의 밝은 광택을 강조색으로 얹는다
const SKIN_HUES = [
    [0, '루비'], [14, '가닛'], [26, '코냑'], [38, '호박'], [50, '샴페인'],
    [66, '올리브'], [88, '압생트'], [118, '에메랄드'], [150, '비취'], [172, '공작'],
    [192, '사파이어'], [214, '코발트'], [232, '미드나잇'], [252, '자수정'], [274, '로열 퍼플'],
    [298, '자두'], [318, '로즈'], [338, '버건디']
];
const SKIN_METALS = [
    { name: '골드',        hex: '#d4af37' },
    { name: '샴페인 골드', hex: '#e6c98f' },
    { name: '로즈 골드',   hex: '#e0a899' },
    { name: '플래티넘',    hex: '#d9dde3' },
    { name: '앤틱 브론즈', hex: '#b58d57' },
    { name: '실버',        hex: '#c0c7cf' },
    { name: '진주',        hex: '#efe6d8' }
];
const SKIN_PATTERNS = [
    { name: '핀스트라이프', css: a => `repeating-linear-gradient(90deg, ${a}1c 0 1px, transparent 1px 14px)`, size: 'auto' },
    { name: '다이아몬드',   css: a => `linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%), linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%)`, size: '28px 28px', pos: '0 0, 14px 14px' },
    { name: '아르데코',     css: a => `radial-gradient(circle at 50% 100%, transparent 38%, ${a}22 39% 41%, transparent 42% 58%, ${a}18 59% 61%, transparent 62%)`, size: '40px 20px' },
    { name: '격자',         css: a => `linear-gradient(${a}14 1px, transparent 1px), linear-gradient(90deg, ${a}14 1px, transparent 1px)`, size: '22px 22px' },
    { name: '진주 점',      css: a => `radial-gradient(${a}26 1.2px, transparent 1.7px)`, size: '16px 16px' },
    { name: '헤링본',       css: a => `repeating-linear-gradient(45deg, ${a}12 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, ${a}0e 0 2px, transparent 2px 12px)`, size: 'auto' },
    { name: '비단 결',      css: a => `repeating-linear-gradient(170deg, ${a}0c 0 1px, transparent 1px 5px), linear-gradient(180deg, ${a}10, transparent 40%, ${a}0a)`, size: 'auto' }
];
const SKIN_FONTS = [
    { family: 'Nanum Myeongjo', label: '나눔명조' },
    { family: 'Gowun Batang',   label: '고운바탕' },
    { family: 'Noto Serif KR',  label: '본명조' },
    { family: 'Hahmlet',        label: '함렛' },
    { family: 'Song Myung',     label: '송명' },
    { family: 'Diphylleia',     label: '산하엽' },
    { family: 'Gowun Dodum',    label: '고운돋움' }
];

// --- 도우미 ---
function skinPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function skinHslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return '#' + to(f(0)) + to(f(8)) + to(f(4));
}

function skinHueName(h) {
    let name = SKIN_HUES[0][1];
    SKIN_HUES.forEach(([deg, nm]) => { if (h >= deg) name = nm; });
    return name;
}

let _skinFontsLoaded = false;
function loadSkinFonts() {
    if (_skinFontsLoaded) return;
    _skinFontsLoaded = true;
    const fam = SKIN_FONTS.map(f => 'family=' + f.family.replace(/ /g, '+') + ':wght@400;700').join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fam}&display=swap`;
    document.head.appendChild(link);
}

// --- 무작위 조합 ---
function rollUiSkin() {
    const hue = Math.floor(Math.random() * 360);
    const useMetal = Math.random() < 0.6;
    const metal = skinPick(SKIN_METALS);
    const accent = useMetal ? metal.hex : skinHslToHex(hue, 58, 70);
    const pattern = skinPick(SKIN_PATTERNS);
    const font = skinPick(SKIN_FONTS);
    return {
        hue: hue,
        base:  skinHslToHex(hue, 40, 9),
        panel: skinHslToHex(hue, 34, 14),
        accent: accent,
        text: '#f3ead8',
        pattern: SKIN_PATTERNS.indexOf(pattern),
        font: font.family,
        name: `${skinHueName(hue)} · ${useMetal ? metal.name : '광택'} · ${pattern.name} · ${font.label}`,
        since: Date.now()
    };
}


// --- 전체 인터페이스 스타일 ---
// 벽지가 적용되면 body 에 data-ui-skin 이 붙고, 아래 규칙이 소속·커플 테마 위에 덮인다.
// 색 섞기는 전부 JS 에서 미리 계산해 변수로 넣는다 (구형 모바일 브라우저 호환).
// 어둠 탐사 화면·오락기·여우 상담실·선녀탕은 고유 분위기를 지키도록 제외한다.
const SK_AREAS = [
    '#app-container',
    '.modal-overlay:not(#fox-modal):not(#bath-modal)',
    '#custom-alert-overlay',
    '#luxury-alert-overlay',
    '#vip-invite-overlay',
    '#fox-nameplate-overlay'
];
function skSel(list) {
    const parts = list.split(',').map(x => x.trim()).filter(Boolean);
    return SK_AREAS.flatMap(a => parts.map(x => `body[data-ui-skin] ${a} ${x}`)).join(',\n');
}
const V = n => `var(--sk-${n})`;

const SKIN_CSS = `
${skSel('.tabs-grid, .sub-tabs-grid')} {
    background: transparent !important;
    border-color: ${V('line')} !important;
}
${skSel('.tab-content')} {
    background: ${V('card')} !important;
    border: 1px solid ${V('line')} !important;
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px rgba(0,0,0,0.45) !important;
}
${skSel('.sub-panel')} {
    background: ${V('well')} !important;
    border: 1px solid ${V('line')} !important;
    color: ${V('text')} !important;
}

${skSel('.game-btn, .action-buttons button, .step-btn, .btn-cancel, .admin-access-btn, .ranking-toggle-btn, .shop-item button, .inv-btn, .vip-nav-btn')} {
    background: linear-gradient(160deg, ${V('btn-top')}, ${V('panel')}) !important;
    border: 1px solid ${V('edge')} !important;
    color: ${V('accent')} !important;
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 2px 7px rgba(0,0,0,0.35) !important;
    text-shadow: none !important;
    letter-spacing: 0.03em;
}
${skSel('.game-btn:active, .action-buttons button:active, .step-btn:active, .shop-item button:active, .inv-btn:active')} {
    background: linear-gradient(160deg, ${V('press-top')}, ${V('press-bot')}) !important;
}
${skSel('.game-btn:disabled, .shop-item button:disabled, .inv-btn:disabled, .step-btn:disabled')} {
    opacity: 0.4 !important;
    box-shadow: none !important;
}
${skSel('.inv-btn-use, .btn-submit, .login-btn, .custom-alert-btn, .luxury-alert-btn, #rec-badge .game-btn')} {
    background: linear-gradient(160deg, ${V('accent')}, ${V('accent-deep')}) !important;
    border: 1px solid ${V('accent')} !important;
    color: ${V('base')} !important;
    font-weight: 700 !important;
}
${skSel('.inv-btn-sell, .btn-cancel')} {
    background: transparent !important;
    color: ${V('text-dim')} !important;
    border-color: ${V('line')} !important;
}

${skSel('.tab, .sub-tab')} {
    background: ${V('tab')} !important;
    border: 1px solid ${V('line')} !important;
    color: ${V('text-dim')} !important;
    box-shadow: none !important;
}
${skSel('.tab.active, .sub-tab.active')} {
    background: linear-gradient(160deg, ${V('accent')}, ${V('accent-deep')}) !important;
    border-color: ${V('accent')} !important;
    color: ${V('base')} !important;
    font-weight: 700 !important;
}

${skSel('input, select, textarea, .bet-input, .badge-input, .bet-display')} {
    background: ${V('base')} !important;
    color: ${V('text')} !important;
    border: 1px solid ${V('edge-soft')} !important;
}
${skSel('input:focus, select:focus, textarea:focus')} {
    outline: none !important;
    border-color: ${V('accent')} !important;
    box-shadow: 0 0 0 2px ${V('halo')} !important;
}

${skSel('.id-card-badge, .modal-content, .inv-card, .shop-item, .emp-list-card, .status-item, .history-item, .letter-card, .suggestion-item, .admin-panel-box, .seotda-arena, .slot-window, .ranking-body, .custom-alert-box, .luxury-alert-box, .badge-photo-box, .badge-table, .pollution-container, .status-section')} {
    background: ${V('card')} !important;
    border-color: ${V('line')} !important;
    color: ${V('text')};
}
${skSel('.id-card-badge, .modal-content, .custom-alert-box, .luxury-alert-box')} {
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px rgba(0,0,0,0.45) !important;
}
${skSel('.pollution-container, .status-section, .status-item')} {
    background: transparent !important;
    box-shadow: none !important;
}

${skSel('.panel-title, h2, h3, h4, .status-label, .serial-row, .pollution-header, .badge-table th')} {
    color: ${V('accent')} !important;
    border-color: ${V('line')} !important;
    letter-spacing: 0.04em;
}
${skSel('.status-value, .emp-name, .badge-table td, .emp-list-title, .inv-card-name, .header-info, .emp-meta')} {
    color: ${V('text')} !important;
}
${skSel('.status-value')} {
    color: ${V('accent')} !important;
}
${skSel('.emp-role-tag, .inv-card-qty, .status-tag')} {
    background: transparent !important;
    border: 1px solid ${V('edge')} !important;
    color: ${V('accent')} !important;
}
${skSel('.badge-table th')} {
    background: ${V('well')} !important;
}
${skSel('.badge-table th, .badge-table td')} {
    border-color: ${V('line')} !important;
}
${skSel('.pollution-bar-bg')} {
    background: ${V('base')} !important;
    border: 1px solid ${V('line')} !important;
}
${skSel('.inv-card-desc, .emp-list-sub, .history-time, .letter-meta')} {
    color: ${V('text-dim')} !important;
}

body[data-ui-skin] #app-container *::-webkit-scrollbar-thumb { background: ${V('edge')} !important; }
body[data-ui-skin] #app-container *::-webkit-scrollbar-track { background: transparent !important; }
`;

function injectSkinStyle() {
    let st = document.getElementById('ui-skin-style');
    if (!st) {
        st = document.createElement('style');
        st.id = 'ui-skin-style';
        document.head.appendChild(st);
    }
    if (st.textContent !== SKIN_CSS) st.textContent = SKIN_CSS;
    // style.css 보다 뒤에 오도록 항상 맨 끝으로
    if (document.head.lastElementChild !== st) document.head.appendChild(st);
}

// 두 색을 섞는다 (t = b 쪽 비율 0~1)
function skinBlend(a, b, t) {
    const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
    return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

function skinVars(s) {
    return {
        'accent': s.accent,
        'base': s.base,
        'panel': s.panel,
        'text': s.text,
        'text-dim': s.text + 'b3',
        'accent-deep': skinBlend(s.accent, s.base, 0.3),
        'card': skinBlend(s.panel, s.accent, 0.07),
        'well': skinBlend(s.base, s.accent, 0.05),
        'tab': skinBlend(s.panel, s.accent, 0.06),
        'btn-top': skinBlend(s.panel, s.accent, 0.22),
        'press-top': skinBlend(s.panel, s.accent, 0.38),
        'press-bot': skinBlend(s.panel, s.accent, 0.12),
        'edge': s.accent + '8c',
        'edge-soft': s.accent + '59',
        'line': s.accent + '47',
        'glint': s.accent + '38',
        'halo': s.accent + '40'
    };
}

// --- 적용 / 해제 ---
const SKIN_VAR_NAMES = ['accent','base','panel','text','text-dim','accent-deep','card','well','tab','btn-top','press-top','press-bot','edge','edge-soft','line','glint','halo'];
const SKIN_BODY_PROPS = SKIN_VAR_NAMES.map(n => '--sk-' + n).concat(['--theme-focus', '--theme-accent', '--theme-border', '--theme-text', '--theme-sub', '--theme-bg-grad', 'background-color', 'font-family']);

function applyUiSkin(user) {
    const s = user && user.uiSkin;
    const body = document.body;
    if (!s) {
        if (body.dataset.uiSkin) clearUiSkin(user);
        return;
    }
    loadSkinFonts();
    injectSkinStyle();

    // 소속·커플 테마 클래스를 걷어 낸다 (해제하면 다시 붙는다)
    Array.from(body.classList).forEach(c => {
        if (c.startsWith('theme-') || c.startsWith('cp-') || c === 'couple-themed') body.classList.remove(c);
    });

    const set = (k, v) => body.style.setProperty(k, v, 'important');
    const vars = skinVars(s);
    Object.keys(vars).forEach(k => set('--sk-' + k, vars[k]));
    set('--theme-focus', s.accent);
    set('--theme-accent', s.accent);
    set('--theme-border', s.accent + '66');
    set('--theme-text', s.text);
    set('--theme-sub', s.accent + 'aa');
    set('--theme-bg-grad', `linear-gradient(180deg, ${s.panel} 0%, ${s.base} 60%, ${s.panel} 100%)`);
    set('background-color', s.base);
    set('font-family', `'${s.font}', 'Noto Serif KR', serif`);

    const pat = SKIN_PATTERNS[s.pattern] || SKIN_PATTERNS[0];
    const cont = document.querySelector('.container');
    if (cont) {
        cont.style.setProperty('background-color', s.panel, 'important');
        cont.style.setProperty('background-image', pat.css(s.accent), 'important');
        cont.style.setProperty('background-size', pat.size || 'auto', 'important');
        cont.style.setProperty('background-position', pat.pos || '0 0', 'important');
    }

    // 커플링 무늬는 가린다
    const cp = document.getElementById('couple-emoji-bg');
    if (cp) cp.remove();

    const key = `${s.since}|${s.accent}`;
    body.dataset.uiSkin = key;
}

function clearUiSkin(user) {
    const body = document.body;
    SKIN_BODY_PROPS.forEach(k => body.style.removeProperty(k));
    const cont = document.querySelector('.container');
    if (cont) ['background-color', 'background-image', 'background-size', 'background-position'].forEach(k => cont.style.removeProperty(k));
    delete body.dataset.uiSkin;

    // 원래 테마로 복귀
    if (user && user.couple) applyCoupleTheme(user);
    else if (user) applyDepartmentTheme(user);
}

// --- 사용 ---
function useUiSkin(itemName) {
    if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 소지품을 사용할 수 없습니다.'); return; }
    if (!(currentUser.inventory || []).includes(itemName)) return;

    const had = !!currentUser.uiSkin;
    const s = rollUiSkin();
    currentUser.uiSkin = s;
    removeItemFromInventory(currentUser, itemName, 1);
    addHistoryLog(currentUser, `[벽지 견본첩] ${had ? '방을 다시 꾸몄습니다' : '방을 꾸몄습니다'} — ${s.name}`);
    saveFields({ uiSkin: 1, inventory: 1, history: 1 });
    updateUI();
    showCustomAlert(`견본첩을 넘겼습니다.\n\n${s.name}\n\n해제하면 견본첩은 사라집니다.`);
}

function releaseUiSkin() {
    if (!currentUser || !currentUser.uiSkin) return;
    if (!confirm('해제하면 견본첩이 사라집니다.\n다시 쓰려면 새로 구해야 합니다.\n\n해제할까요?')) return;
    const name = currentUser.uiSkin.name;
    currentUser.uiSkin = null;
    addHistoryLog(currentUser, `[벽지 견본첩] 원래 방으로 돌아왔습니다. (${name})`);
    saveFields({ uiSkin: 1, history: 1 });
    clearUiSkin(currentUser);
    updateUI();
    showCustomAlert('원래 방으로 돌아왔습니다.');
}

function uiSkinCardHtml() {
    const s = currentUser && currentUser.uiSkin;
    if (!s) return '';
    return `
        <div style="background:${s.panel}; border:1px solid ${s.accent}; padding:12px; margin-bottom:12px; border-radius:6px;">
            <div style="font-size:10px; color:${s.accent}; font-weight:bold; margin-bottom:5px;">[벽지]</div>
            <div style="font-size:14px; color:${s.text}; font-weight:bold;">${s.name}</div>
            <div style="font-size:10px; color:#999; margin-top:6px;">해제하면 견본첩은 사라집니다. 다른 견본첩을 쓰면 새로 꾸며집니다.</div>
            <button class="inv-btn" style="width:100%; margin-top:9px; padding:8px; background:linear-gradient(145deg,#555,#333); color:#ddd;" onclick="releaseUiSkin()">해제</button>
        </div>`;
}

// --- 기존 함수에 연결 ---
(function hookUiSkin() {
    const _useInventoryItem = useInventoryItem;
    useInventoryItem = function (itemName) {
        const c = ITEM_CATALOG[itemName];
        if (c && c.effect === 'ui_skin') { useUiSkin(itemName); return; }
        return _useInventoryItem.apply(this, arguments);
    };

    const _updateUI = updateUI;
    updateUI = function () {
        const r = _updateUI.apply(this, arguments);
        if (currentUser) applyUiSkin(currentUser);
        return r;
    };

    const _renderInventory = renderInventory;
    renderInventory = function () {
        const r = _renderInventory.apply(this, arguments);
        const box = document.getElementById('inventory-list-container');
        if (box && currentUser && currentUser.uiSkin) box.insertAdjacentHTML('afterbegin', uiSkinCardHtml());
        return r;
    };

    const _logout = logout;
    logout = function () {
        const r = _logout.apply(this, arguments);
        clearUiSkin(null);
        return r;
    };
})();
