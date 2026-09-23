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
// 색: 이름 붙은 팔레트 46종 (어두운 28 · 밝은 18)
// base 바탕 · panel 겉면 · accent 강조 · text 글씨
const SKIN_PALETTES = [
    // --- 어두운 계열 ---
    { name:'루비와 골드',          base:'#1a0709', panel:'#2a0e12', accent:'#d4af37' },
    { name:'버건디와 샴페인',      base:'#1c0a10', panel:'#2d1119', accent:'#e6c98f' },
    { name:'가닛과 로즈 골드',     base:'#1d0b0b', panel:'#2e1413', accent:'#e0a899' },
    { name:'코냑과 황동',          base:'#1b0f07', panel:'#2b180c', accent:'#c9a063' },
    { name:'호박과 앤틱 골드',     base:'#1a1206', panel:'#2a1d0b', accent:'#d9b25a' },
    { name:'마호가니와 골드',      base:'#190c08', panel:'#2a140d', accent:'#d4af37' },
    { name:'초콜릿과 샴페인',      base:'#140c08', panel:'#22150e', accent:'#e6c98f' },
    { name:'올리브와 브론즈',      base:'#12130a', panel:'#1e2012', accent:'#b58d57' },
    { name:'압생트와 샴페인',      base:'#0e150b', panel:'#182314', accent:'#d8d08a' },
    { name:'에메랄드와 골드',      base:'#06140e', panel:'#0c2218', accent:'#d4af37' },
    { name:'포레스트와 실버',      base:'#0a130d', panel:'#132117', accent:'#c0c7cf' },
    { name:'비취와 진주',          base:'#071413', panel:'#0e2220', accent:'#efe6d8' },
    { name:'딥 틸과 골드',         base:'#061416', panel:'#0c2326', accent:'#d4af37' },
    { name:'공작과 로즈 골드',     base:'#06121a', panel:'#0b1f2a', accent:'#e0a899' },
    { name:'사파이어와 플래티넘',  base:'#070d1c', panel:'#0e1830', accent:'#d9dde3' },
    { name:'코발트와 실버',        base:'#080c1a', panel:'#111a31', accent:'#c0c7cf' },
    { name:'네이비와 황동',        base:'#0a1020', panel:'#131c33', accent:'#c9a063' },
    { name:'미드나잇과 골드',      base:'#07091a', panel:'#0f132b', accent:'#d4af37' },
    { name:'인디고와 진주',        base:'#0c0b1f', panel:'#161433', accent:'#efe6d8' },
    { name:'자수정과 샴페인',      base:'#120a1c', panel:'#1e122d', accent:'#e6c98f' },
    { name:'로열 퍼플과 골드',     base:'#150821', panel:'#231034', accent:'#d4af37' },
    { name:'자두와 로즈 골드',     base:'#190a17', panel:'#2a1226', accent:'#e0a899' },
    { name:'로즈와 진주',          base:'#1c0b12', panel:'#2d131e', accent:'#efe6d8' },
    { name:'와인과 플래티넘',      base:'#1a0810', panel:'#2b0f1c', accent:'#d9dde3' },
    { name:'오닉스와 골드',        base:'#0b0b0c', panel:'#161618', accent:'#d4af37' },
    { name:'흑단과 실버',          base:'#0d0c0b', panel:'#1a1816', accent:'#c0c7cf' },
    { name:'차콜과 로즈 골드',     base:'#121315', panel:'#1d1f22', accent:'#e0a899' },
    { name:'슬레이트와 샴페인',    base:'#0f1318', panel:'#1a2029', accent:'#e6c98f' },
    // --- 밝은 계열 ---
    { name:'아이보리와 골드',      base:'#f7f1e3', panel:'#efe6d2', accent:'#9a7b2e', text:'#2b2418', light:true },
    { name:'진주와 로즈 골드',     base:'#f6efec', panel:'#ecdfd9', accent:'#a8665a', text:'#2e2220', light:true },
    { name:'샴페인 크림과 브론즈', base:'#f4ecdc', panel:'#e9dcc4', accent:'#8a6433', text:'#2a2016', light:true },
    { name:'포슬린과 코발트',      base:'#f4f6fa', panel:'#e6ebf3', accent:'#2c4a8a', text:'#1b2233', light:true },
    { name:'크림과 사파이어',      base:'#f6f2e8', panel:'#ebe4d4', accent:'#23407a', text:'#1d2230', light:true },
    { name:'스카이와 네이비',      base:'#eef4f9', panel:'#dde8f2', accent:'#2f4f6f', text:'#1a2632', light:true },
    { name:'민트와 골드',          base:'#eef6f1', panel:'#dfece4', accent:'#8c6e22', text:'#1c2a22', light:true },
    { name:'스노우와 에메랄드',    base:'#f5f7f6', panel:'#e6ece9', accent:'#1f6b4f', text:'#1a2621', light:true },
    { name:'세이지와 황동',        base:'#eef1ea', panel:'#dfe4d8', accent:'#7d6a2e', text:'#22271d', light:true },
    { name:'버터와 올리브',        base:'#faf5e3', panel:'#efe7cc', accent:'#5f6a2c', text:'#26281a', light:true },
    { name:'라벤더와 자수정',      base:'#f3f0f8', panel:'#e6e0f0', accent:'#5e3f8a', text:'#251e33', light:true },
    { name:'블러시와 버건디',      base:'#f8eeee', panel:'#efdede', accent:'#7a2436', text:'#2e1a1e', light:true },
    { name:'로즈 쿼츠와 로즈 골드', base:'#f7ecef', panel:'#eedce2', accent:'#9c5a66', text:'#2e2024', light:true },
    { name:'피치와 코퍼',          base:'#faf0e8', panel:'#f1e0d2', accent:'#9a5a34', text:'#2f2119', light:true },
    { name:'린넨과 월넛',          base:'#f3eee6', panel:'#e7dfd2', accent:'#6b4a2e', text:'#2a2118', light:true },
    { name:'페일 골드와 흑단',     base:'#f6f0dc', panel:'#ebe2c6', accent:'#3a3226', text:'#221e16', light:true },
    { name:'그레이지와 샴페인 골드', base:'#eeebe6', panel:'#e0dbd3', accent:'#8a7442', text:'#26231e', light:true },
    { name:'마블과 오닉스',        base:'#f2f2f0', panel:'#e4e4e1', accent:'#2a2a2a', text:'#1e1e1e', light:true }
];
const SKIN_PATTERNS = [
    { name: '핀스트라이프', css: a => `repeating-linear-gradient(90deg, ${a}1c 0 1px, transparent 1px 14px)`, size: 'auto' },
    { name: '다이아몬드',   css: a => `linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%), linear-gradient(45deg, ${a}12 25%, transparent 25% 75%, ${a}12 75%)`, size: '28px 28px', pos: '0 0, 14px 14px' },
    { name: '아르데코',     css: a => `radial-gradient(circle at 50% 100%, transparent 38%, ${a}22 39% 41%, transparent 42% 58%, ${a}18 59% 61%, transparent 62%)`, size: '40px 20px' },
    { name: '격자',         css: a => `linear-gradient(${a}14 1px, transparent 1px), linear-gradient(90deg, ${a}14 1px, transparent 1px)`, size: '22px 22px' },
    { name: '진주 점',      css: a => `radial-gradient(${a}26 1.2px, transparent 1.7px)`, size: '16px 16px' },
    { name: '헤링본',       css: a => `repeating-linear-gradient(45deg, ${a}12 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, ${a}0e 0 2px, transparent 2px 12px)`, size: 'auto' },
    { name: '비단 결',      css: a => `repeating-linear-gradient(170deg, ${a}0c 0 1px, transparent 1px 5px), linear-gradient(180deg, ${a}10, transparent 40%, ${a}0a)`, size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' },
    { name: '민무늬',       css: a => 'none', size: 'auto' }
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
    const pal = skinPick(SKIN_PALETTES);
    const pattern = skinPick(SKIN_PATTERNS);
    const font = skinPick(SKIN_FONTS);
    return {
        palette: pal.name,
        light: !!pal.light,
        base: pal.base,
        panel: pal.panel,
        accent: pal.accent,
        text: pal.text || '#f3ead8',
        pattern: SKIN_PATTERNS.indexOf(pattern),
        font: font.family,
        name: `${pal.name} · ${pattern.name} · ${font.label}`,
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
    const parts = (Array.isArray(list) ? list : list.split(',')).map(x => x.trim()).filter(Boolean);
    return SK_AREAS.flatMap(a => parts.map(x => `body[data-ui-skin] ${a} ${x}`)).join(',\n');
}
function skLight(list) {
    const parts = (Array.isArray(list) ? list : list.split(',')).map(x => x.trim()).filter(Boolean);
    return SK_AREAS.flatMap(a => parts.map(x => `body[data-ui-skin-tone="light"] ${a} ${x}`)).join(',\n');
}
const V = n => `var(--sk-${n})`;

// 코드 곳곳에 직접 박혀 있는 어두운 배경들 (밝은 벽지에서 밝게 덮는다)
const SK_DARK_BG = [
    '[style*="background:#0"]', '[style*="background:#1"]', '[style*="background:#2"]', '[style*="background:#3"]',
    '[style*="background: #0"]', '[style*="background: #1"]', '[style*="background: #2"]',
    '[style*="background-color:#0"]', '[style*="background-color:#1"]', '[style*="background-color:#2"]',
    '[style*="background:rgba(0"]', '[style*="background: rgba(0"]', '[style*="background-color:rgba(0"]',
    '[style*="background:linear-gradient(145deg"]', '[style*="background: linear-gradient(145deg"]',
    '[style*="background:linear-gradient(160deg"]', '[style*="background:linear-gradient(180deg"]'
];

const SKIN_CSS = `
${skSel('.tabs-grid, .sub-tabs-grid')} {
    background: transparent !important;
    border-color: ${V('line')} !important;
}
${skSel('.tab-content')} {
    background: ${V('card')} !important;
    border: 1px solid ${V('line')} !important;
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px ${V('shadow')} !important;
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
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 2px 7px ${V('shadow')} !important;
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
    box-shadow: inset 0 1px 0 ${V('glint')}, 0 6px 18px ${V('shadow')} !important;
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

${skLight('[style*="color:#fff"], [style*="color: #fff"], [style*="color:#eee"], [style*="color:#ddd"], [style*="color: #ddd"], [style*="color:#ccc"], [style*="color:#bbb"], [style*="color:var(--theme-text)"]')} {
    color: ${V('text')} !important;
}
${skLight('[style*="color:#aaa"], [style*="color:#999"], [style*="color:#888"], [style*="color: #888"], [style*="color:#777"], [style*="color:#666"], [style*="color:#555"]')} {
    color: ${V('text-dim')} !important;
}
${skLight('[style*="color:#ffd700"], [style*="color:#d4af37"], [style*="color:#c9a8ff"], [style*="color:#d4bbff"], [style*="color:#7fd4d4"], [style*="color:#4fc3f7"]')} {
    color: ${V('accent')} !important;
}
${skLight(SK_DARK_BG)} {
    background: ${V('well')} !important;
    border-color: ${V('line')} !important;
    color: ${V('text')} !important;
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
    const L = !!s.light;
    return {
        'accent': s.accent,
        'base': s.base,
        'panel': s.panel,
        'text': s.text,
        'text-dim': s.text + (L ? 'a6' : 'b3'),
        'accent-deep': L ? skinBlend(s.accent, '#000000', 0.25) : skinBlend(s.accent, s.base, 0.3),
        'card': skinBlend(s.panel, s.accent, L ? 0.04 : 0.07),
        'well': L ? skinBlend(s.base, '#ffffff', 0.35) : skinBlend(s.base, s.accent, 0.05),
        'tab': skinBlend(s.panel, s.accent, L ? 0.05 : 0.06),
        'btn-top': L ? skinBlend(s.base, '#ffffff', 0.5) : skinBlend(s.panel, s.accent, 0.22),
        'press-top': skinBlend(s.panel, s.accent, L ? 0.2 : 0.38),
        'press-bot': skinBlend(s.panel, s.accent, L ? 0.08 : 0.12),
        'edge': s.accent + (L ? '99' : '8c'),
        'edge-soft': s.accent + (L ? '66' : '59'),
        'line': s.accent + (L ? '40' : '47'),
        'glint': L ? '#ffffffb3' : s.accent + '38',
        'halo': s.accent + '40',
        'shadow': L ? 'rgba(70,50,20,0.12)' : 'rgba(0,0,0,0.4)'
    };
}

// --- 적용 / 해제 ---
const SKIN_VAR_NAMES = ['accent','base','panel','text','text-dim','accent-deep','card','well','tab','btn-top','press-top','press-bot','edge','edge-soft','line','glint','halo','shadow'];
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

    const key = `${s.since}|${s.accent}|${s.base}`;
    body.dataset.uiSkin = key;
    body.dataset.uiSkinTone = s.light ? 'light' : 'dark';
}

function clearUiSkin(user) {
    const body = document.body;
    SKIN_BODY_PROPS.forEach(k => body.style.removeProperty(k));
    const cont = document.querySelector('.container');
    if (cont) ['background-color', 'background-image', 'background-size', 'background-position'].forEach(k => cont.style.removeProperty(k));
    delete body.dataset.uiSkin;
    delete body.dataset.uiSkinTone;

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
            <div style="font-size:10px; color:${s.text}b3; margin-top:6px;">해제하면 견본첩은 사라집니다. 다른 견본첩을 쓰면 새로 꾸며집니다.</div>
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