// ==========================================
// ★ 🧸 따라쟁이 봉제인형 — 바탕 (펫 = 봉제인형 · 동행 · 보관함 · 주머니 · 도감)
// bundles.json 마지막 묶음 — journey.js · pet-data.js · pet-gear.js 보다 뒤, doll-scene · doll-battle · doll-gong 보다 앞
// ==========================================
//
// 2026-11-07 사용자 「여정 시스템을 이렇게 구현하자. 야생 펫 조우 맵. 펫 전투 화면. + 도깨비 공방 추가」
// 2026-11-07 사용자 「기존의 펫들을 싹 없애고 그 부분을 봉제인형으로 매꾸자」
//   → 「인형으로 바꿔 줌」 · 「인형이 모두 이어받음」 · 「알에서 인형이 나옴」
//
// ■ 무엇인가
//   펫이 곧 봉제인형이다. 따로 두던 인형 칸(u.dolls)은 없앴고, 펫 칸(u.pets)에 그대로 들어간다.
//   그래서 사택 방 · 쓰다듬기 · 먹이 · 몰래 따라오기 · 펫 결투 · 알 부화 같은 펫 기능을 인형이 그대로 이어받는다.
//   그림만 봉제인형 그림으로 바뀌었다 (pet/p○○ · s○○ 를 인형 그림으로 다시 만들었다).
//   같은 동물을 여럿 가질 수 있다 — 둘째부터 열쇠에 100 씩 얹는다 (13 · 113 · 213 …, pet-data.js PET.sp · newKey).
//
// ■ 사원 기록에 적히는 자리
//   u.pets[열쇠]  펫 칸 그대로 + { hp(전투 체력), fav(즐겨찾기), ord(보관함 순서) }  — 등급 g · lv · xp · bond · nick · fedAt 은 원래 있던 것
//   u.petShow    [열쇠 셋]  동행 = 집(방에 내놓은 셋). 나머지는 보관함(펫 박스). u.petShowSet 이 있으면 저절로 채우지 않는다
//   u.dollBag    { '🎀 포옹 리본': n, '🍶 청주': n, '🥣 메밀묵': n, '🧶 솜뭉치 간식': n }  — 소지품과 따로
//   u.dollDex    { 종: { s: 처음 본 때, c: 처음 잡은 때, n: 잡은 수 } }      봉제인형 도감
//   u.darkDex    { 괴담 번호: 처음 만난 때 }                                    어둠 · 재난 도감 (잡을 수 없다)
//   u.dollTut    { step, done }   도깨비 공방 튜토리얼 · u.dollSort 보관함 정렬 · u.dollMig 옮겨 왔나
//
// ■ 옮겨 오기 (사원마다 한 번 — u.dollMig)
//   예전 인형 칸(u.dolls · u.dollWith)이 있으면 펫 칸으로 옮기고, 가진 펫은 모두 도감에 「잡은 것」으로 적는다.
//   옮기는 날 먹이 시계를 새로 맞춰 준다 — 바뀐 규칙(7일이면 탈출) 때문에 바로 달아나지 않게.
//
// ■ 굶주림 · 탈출
//   동행(집) 셋은 펫처럼 사흘 굶으면 교감 -70 (pet-data.js). 보관함에 있는 동안은 도깨비가 돌봐서 교감이 안 깎인다.
//   어디에 있든 7일 동안 먹이를 못 받으면 **탈출** — 목록에서 사라지고 원형의 야생 인형으로 돌아간다.
//   🧶 솜뭉치 간식 · 사택 먹이 모두 먹이로 친다 (fedAt).
//
// ■ 콘솔
//   dollState()                 내 인형 · 동행 · 주머니
//   dollGive(종, 등급)           상담사 — 내게 인형 하나
//   dollBagGive('🎀 포옹 리본', 5)   상담사 — 내 주머니에

(function dollData() {
'use strict';

const ADMIN = 'kario0987';
const PARTY_MAX = 3;
const BOX_N = 10;                       // 보관함 칸 수
const BOX_SIZE = 12;                    // 한 칸에 4 × 3
const BOX_MAX = BOX_N * BOX_SIZE;       // 동행 빼고 120
const ESCAPE_MS = 7 * 24 * 3600 * 1000;
const LV_MAX = 10;
const GRADES = ['D', 'C', 'B', 'A', 'S'];

// 속성 — 펫의 「주의 문구」 다섯 갈래를 그대로 속성으로 쓴다. 이기는 쪽이 한 바퀴로 돈다.
//   💧 물 › 🔥 불 › ❄️ 얼음 › 🌸 꽃 › 🔔 소리 › 💧 물
const ATTR = {
    wet:   { e: '💧', n: '물' },
    heat:  { e: '🔥', n: '불' },
    cold:  { e: '❄️', n: '얼음' },
    scent: { e: '🌸', n: '꽃' },
    noise: { e: '🔔', n: '소리' }
};
const BEATS = { wet: 'heat', heat: 'cold', cold: 'scent', scent: 'noise', noise: 'wet' };
function effOf(a, d) {
    if (!a || !d) return 1;
    if (BEATS[a] === d) return 1.5;
    if (BEATS[d] === a) return 0.75;
    return 1;
}
// ★ 속성은 인형마다 — 같은 종이라도 한 마리씩 다르다 (2026-11-08 사용자 「인형들마다 고정하지 말고 같은 인형인데도 랜덤으로 다 다른 속성」)
//   · 잡을 때(야생이 들고 나온 속성) · 알에서 깨어날 때 · 받을 때 — 인형 기록(pets/<id>/att)에 적힌다
//   · 적힌 것이 없는 인형(예전 것)은 열쇠·시각으로 늘 같은 값을 뽑고(attOf), attFix 가 한 번 적어 둔다
//   · 종의 w(주의 문구 · 알 묶음)는 그대로 — 먹이·알 쪽에서 쓴다
const ATTR_KEYS = Object.keys(ATTR);
function randAtt() { return ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)]; }
function attOf(d) {
    if (d && ATTR[d.att]) return d.att;
    const key = String((d && d.id) || '') + ':' + String((d && d.at) || 0) + ':' + String((d && d.sp) || '');
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return ATTR_KEYS[h % ATTR_KEYS.length];
}

// 주머니 물건
const ITEM = {
    RIBBON: '🎀 포옹 리본',
    WINE: '🍶 청주',
    JELLY: '🥣 메밀묵',
    SNACK: '🧶 솜뭉치 간식'
};
const ITEM_DESC = {
    '🎀 포옹 리본': '야생의 따라쟁이 봉제인형을 감싸 잡는다. 성공하든 못 하든 하나 쓴다.',
    '🍶 청주': '수선소 도깨비가 좋아한다. 수선 재료.',
    '🥣 메밀묵': '수선소 도깨비가 좋아한다. 수선 재료.',
    '🧶 솜뭉치 간식': '봉제인형 먹이. 한 마리에 하나 — 7일을 채워 준다.'
};

// ==========================================
// 어둠 · 재난 — 괴담 열네 가지 (doll/mon.webp · 100×100 칸 · 7 × 2)
// ==========================================
//   첫 줄(0~6)은 『 첫번째 여정 』 의 것들과 같은 그림이다. 둘째 줄(7~13)은 매직버니 아케이드존.
//   a 속성 · hp · atk · def · mv 기술 [이름, 종류]
const MON = [
    { i: 0,  n: '문틈손',          k: '요괴', a: 'noise', hp: 55,  atk: 8,  def: 2, mv: [['긴 손 뻗기', 'hit'], ['문 쾅 닫기', 'heavy']] },
    { i: 1,  n: '젖은 신발',       k: '괴물', a: 'wet',   hp: 60,  atk: 8,  def: 2, mv: [['젖은 발 밟기', 'hit'], ['신발끈 휘감기', 'drain']] },
    { i: 2,  n: '네발이',          k: '마수', a: 'scent', hp: 65,  atk: 9,  def: 2, mv: [['네 발로 덮치기', 'heavy'], ['손톱 긁기', 'multi']] },
    { i: 3,  n: '등불이',          k: '마물', a: 'heat',  hp: 70,  atk: 10, def: 3, mv: [['빛 떨어뜨리기', 'pierce'], ['그림자 늘이기', 'hit']] },
    { i: 4,  n: '가짜 주인',       k: '보스', a: 'scent', hp: 170, atk: 12, def: 3, boss: 1, mv: [['주인의 목소리', 'sure'], ['뒤에서 끌어안기', 'drain'], ['냄새 벗어 던지기', 'heavy']] },
    { i: 5,  n: '방울 여우',       k: '요괴', a: 'cold',  hp: 70,  atk: 10, def: 3, mv: [['방울 흔들기', 'sure'], ['꼬리 휘감기', 'hit']] },
    { i: 6,  n: '핏물 우산',       k: '괴물', a: 'wet',   hp: 65,  atk: 9,  def: 3, mv: [['우산살 찌르기', 'pierce'], ['핏물 뿌리기', 'multi']] },
    { i: 7,  n: '손 뻗는 거울',    k: '괴담', a: 'cold',  hp: 70,  atk: 10, def: 3, mv: [['거울 속 손', 'drain'], ['깨진 조각', 'multi']] },
    { i: 8,  n: '눈알 사탕병',     k: '괴담', a: 'wet',   hp: 60,  atk: 9,  def: 2, mv: [['굴러오는 눈알', 'multi'], ['빤히 보기', 'sure']] },
    { i: 9,  n: '깜짝 선물 토끼',  k: '괴담', a: 'scent', hp: 65,  atk: 9,  def: 2, mv: [['깜짝 상자', 'heavy'], ['리본 조이기', 'drain']] },
    { i: 10, n: '북 치는 토끼',    k: '보스', a: 'noise', hp: 190, atk: 13, def: 4, boss: 1, mv: [['둥둥 북소리', 'sure'], ['북채 내리치기', 'heavy'], ['박자 맞추기', 'multi']] },
    { i: 11, n: '튀어나오는 토끼', k: '괴담', a: 'heat',  hp: 60,  atk: 10, def: 2, mv: [['용수철 박치기', 'heavy'], ['폭죽 웃음', 'hit']] },
    { i: 12, n: '멈추지 않는 목마', k: '괴담', a: 'cold', hp: 75,  atk: 9,  def: 3, mv: [['빙글빙글', 'multi'], ['발굽 차기', 'hit']] },
    { i: 13, n: '풍선 광대 토끼',  k: '괴담', a: 'noise', hp: 65,  atk: 10, def: 2, mv: [['풍선 터뜨리기', 'pierce'], ['광대 웃음', 'sure']] }
];
const MON_BY = {}; MON.forEach(function (m) { MON_BY[m.i] = m; });

// ==========================================
// 바탕
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function P() { return window.PET; }
function now() { try { return P().now(); } catch (e) { return Date.now(); } }
function today() { try { return P().today(); } catch (e) { return new Date().toDateString(); } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function log_(t, u) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u || u_(), t); } catch (e) { } }
function josa(w, k) {
    try { const j = P().josa(w, k); if (j) return j; } catch (e) { }
    return k;
}
function isAdmin(u) { u = u || u_(); return !!(u && (u.code === ADMIN || u.isAdmin)); }
function spOf(sp) { try { return P().BY[sp] || null; } catch (e) { return null; } }
function spName(sp) { const s = spOf(sp); return s ? s.n : '봉제인형'; }

// 파이어베이스가 숫자 열쇠를 배열로 돌려줄 때가 있다 — 열쇠가 있는 것만 되살린다
function objOf(v) {
    if (!v || typeof v !== 'object') return {};
    if (Array.isArray(v)) { const o = {}; v.forEach(function (x, i) { if (x != null) o[i] = x; }); return o; }
    return v;
}
// 인형 = 펫 칸. 열쇠(id) · 종(sp)을 칸 안에 붙여 둔다 (화면에서만 · 서버에는 안 쓴다)
function dolls(u) {
    u = u || u_();
    if (!u) return {};
    let ps = {};
    try { ps = P().pets(u); } catch (e) { return {}; }
    const out = {};
    Object.keys(ps).forEach(function (k) {
        const r = ps[k];
        if (!r || typeof r !== 'object' || !P().BY[k]) return;
        if (r.id !== k) { try { Object.defineProperty(r, 'id', { value: k, enumerable: false, configurable: true, writable: true }); } catch (e) { r.id = k; } }
        const sp = P().sp(k);
        if (r.sp !== sp) { try { Object.defineProperty(r, 'sp', { value: sp, enumerable: false, configurable: true, writable: true }); } catch (e) { r.sp = sp; } }
        out[k] = r;
    });
    return out;
}
function bag(u) { u = u || u_(); if (!u) return {}; u.dollBag = objOf(u.dollBag); return u.dollBag; }
function dex(u) { u = u || u_(); if (!u) return {}; u.dollDex = objOf(u.dollDex); return u.dollDex; }
function darkDex(u) { u = u || u_(); if (!u) return {}; u.darkDex = objOf(u.darkDex); return u.darkDex; }
// 동행 = 방에 내놓은 셋 (pet-data.js petShowList · 저절로 채우기는 u.petShowSet 이 없을 때만)
function withList(u) {
    u = u || u_();
    if (!u) return [];
    try { return P().show(u).map(String).slice(0, PARTY_MAX); } catch (e) { return []; }
}
function boxList(u) {
    u = u || u_();
    const w = withList(u), ds = dolls(u);
    return Object.keys(ds).filter(function (id) { return w.indexOf(id) < 0; });
}

// ==========================================
// 쓰기 — 한 칸씩 (users/<사번>/…)
// ==========================================
function put(paths, u) {
    u = u || u_();
    if (!u || !u.code) return Promise.resolve(false);
    const d = db_();
    if (d) {
        return d.ref('users/' + u.code).update(paths).then(function () { return true; })
            .catch(function (e) { console.warn('[인형] 저장 실패', e); return false; });
    }
    const f = {};
    Object.keys(paths).forEach(function (k) { f[k.split('/')[0]] = 1; });
    try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { }
    return Promise.resolve(true);
}
function saveHist() { try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { } }

// ==========================================
// 인형 하나의 수치 — 펫 수치 그대로 (pet-gear.js PETGEAR.stats · 등급 · Lv · 장비)
// ==========================================
function gradeIdx(g) { const i = GRADES.indexOf(g); return i < 0 ? 0 : i; }
function stats(d, u) {
    u = u || u_();
    const sp = spOf(d && d.sp) || { st: {}, w: 'wet' };
    let s = null;
    try { if (d && d.id && window.PETGEAR && P().pets(u)[d.id] === d) s = window.PETGEAR.stats(d.id, u); } catch (e) { s = null; }
    if (!s) {                               // 남의 인형(교환 창) — 같은 셈을 직접
        const gi = gradeIdx(d && d.g), lv = Math.max(1, Math.min(lvMax(gi), Number(d && d.lv) || 1));
        const st = (gi >= 2) ? (sp.st || {}) : {};
        const n = function (k) { return Number(st[k]) || 0; };
        const luck = n('luck') >= 10 ? n('luck') / 20 : n('luck');
        s = { max: Math.round(60 + lv * 6 + gi * 20 + n('resist') * 4), atk: Math.round((8 + lv * 1.5 + gi * 4 + n('bon') * 2) * 10) / 10,
              def: Math.round((2 + lv * 0.5 + gi * 2 + n('resist') * 1.5) * 10) / 10, eva: Math.min(60, 5 + n('eva') * 3),
              crit: Math.min(60, Math.round(5 + luck * 8)), lv: lv, gi: gi };
    }
    return { max: s.max, atk: s.atk, def: s.def, eva: s.eva, crit: s.crit, lv: s.lv, gi: s.gi, g: GRADES[s.gi] || 'D', att: attOf(d) };
}
function gOf(d) { return stats(d).g; }
// ★ 등급마다 레벨 상한 — D 10 · C 20 · B 30 · A 40 · S 50 (pet-gear.js LV_CAP)
function lvMax(gi) { try { return window.PETGEAR.lvMax(gi); } catch (e) { return [10, 20, 30, 40, 50][Math.max(0, Math.min(4, Number(gi) || 0))]; } }
function lvMaxOf(d) { return lvMax(gradeIdx(d && d.g)); }
function hpOf(d) {
    const s = stats(d);
    const h = (d && d.hp != null) ? Number(d.hp) : s.max;
    return Math.max(0, Math.min(s.max, isFinite(h) ? h : s.max));
}
function nickOf(d) {
    if (d && d.nick && String(d.nick).trim()) return String(d.nick).trim();
    return spName(d && d.sp);
}
function xpNeed(lv) { try { return window.PETGEAR.needXp(lv); } catch (e) { return 20 + lv * 10; } }
// 등급을 무게로 뽑는다 — 야생에서 만나는 것
function rollGrade(luck) {
    const r = Math.random() * 100 - (Number(luck) || 0);
    if (r < 1) return 'S';
    if (r < 5) return 'A';
    if (r < 15) return 'B';
    if (r < 40) return 'C';
    return 'D';
}

// 그림 — 앞(pf · 64칸 · 1~25) / 뒤(pb · 64칸 · 그려 쓸 때 두 배) · 5 × 5
// 🧸 캐릭터 봉제인형(26~)은 doll/cf.webp · cb.webp — 96칸 6×3 (2026-11-07 사용자). 동물(1~25)은 doll/pf · pb — 64칸 5×5
function isChr(sp) { try { return !!(P() && P().isChr && P().isChr(sp)); } catch (e) { return false; } }
function cellOf(sp) {
    const n = (P() && P().sp ? P().sp(sp) : Number(sp)) || 1;
    if (isChr(n)) { const j = Math.max(0, n - 26); return { c: j % 6, r: Math.floor(j / 6), chr: true, cs: 96, cols: 6, rows: 3 }; }
    const i = Math.max(1, Math.min(25, n)) - 1;
    return { c: i % 5, r: Math.floor(i / 5), chr: false, cs: 64, cols: 5, rows: 5 };
}
// 캐릭터 봉제인형 — 동물과 같은 도트 크기로, 칸(96)이 64보다 커서 상자를 1.5배로 키우고 음수 여백으로 발끝 · 가운데를 맞춘다
function chrCss(sp, px, back) {
    const c = cellOf(sp), k = px * 1.5;
    return 'background-image:url(doll/' + (back ? 'cb' : 'cf') + '.webp);background-repeat:no-repeat;image-rendering:pixelated;'
        + 'background-size:' + (k * 6) + 'px ' + (k * 3) + 'px;background-position:' + (-c.c * k) + 'px ' + (-c.r * k) + 'px;'
        + 'width:' + k + 'px;height:' + k + 'px;margin:' + (-px * 0.5) + 'px 0 0 ' + (-px * 0.25) + 'px;';
}
//   px — 한 칸을 몇 px 로 그리나. back 이면 뒷모습
// 🎨 예전 펫 그림으로 보는 사원 — u.petArt 'old' / 'doll' 로 정하고, 안 정했으면 이름이 Benz 인 사원 (2026-11-07 사용자 「Benz 사원한테는 봉제인형이 아니라 기존에 있던 펫 그림으로」)
//   상담사 콘솔: dollArtSet('사번', 'old' | 'doll' | null) — 사번 0010 은 코드에 고정
const ART_OLD_CODES = ['0010'];                                        // ★ 사번으로 고정 — Benz 사원 (2026-11-07 사용자 「사번으로 고정해 줘. 0010」)
function artOld(u) {
    u = u || u_();
    if (!u) return false;
    if (u.petArt === 'old') return true;
    if (u.petArt === 'doll') return false;
    return ART_OLD_CODES.indexOf(String(u.code || '')) >= 0;
}
// 🔘 외형 고르기 스위치 — 인형 돌보기 · 사택 방 (2026-11-07 사용자 「옛 펫 외형 혹은 지금 봉제인형 외형을 선택할 수 있는 버튼 … 기본은 봉제인형」)
function artSet(v, u) {
    u = u || u_();
    if (!u) return;
    const val = (v === 'old') ? 'old' : 'doll';
    u.petArt = val;
    put({ petArt: val }, u);
}
function artSwitchCss() {
    if (document.getElementById('pet-artsw-css')) return;
    const s = document.createElement('style');
    s.id = 'pet-artsw-css';
    s.textContent = '.pet-artsw{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:#b8ac97;padding:7px 0;cursor:pointer;user-select:none}'
        + '.pet-artsw .sw{position:relative;flex:0 0 auto;width:44px;height:24px;border-radius:12px;background:#555;transition:background .18s}'
        + '.pet-artsw .sw i{position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.5);transition:left .18s}'
        + '.pet-artsw .sw.on{background:#d4af37}.pet-artsw .sw.on i{left:23px}';
    document.head.appendChild(s);
}
function artSwitchHtml() {
    artSwitchCss();
    return '<div class="pet-artsw"><span>옛 펫 외형으로 보기 <span style="color:#6f685e;">— 광장 · 전투 · 보관함 (끄면 봉제인형)</span></span><span class="sw' + (artOld() ? ' on' : '') + '" role="switch"><i></i></span></div>';
}
function artSwitchWire(root, after) {
    const row = root && root.querySelector('.pet-artsw');
    if (!row) return;
    row.onclick = function (ev) {
        ev.stopPropagation();
        const sw = row.querySelector('.sw');
        const v = sw.classList.contains('on') ? 'doll' : 'old';
        artSet(v);
        sw.classList.toggle('on', v === 'old');
        try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e) { }
        if (typeof after === 'function') after(v);
    };
}
//   옛 그림은 pet/old/ — 2026-11-07 봉제인형으로 바꾸기 전(0ea31b2^)의 pet/sNN · pNN 을 그대로 꺼내 둔 것
// 🐾 옛 펫 외형을 켠 사원에게는 글도 「인형」이 아니라 「펫」 (2026-11-07 사용자 「옛 펫으로 보기 버튼을 한 사람한텐 인형이 아니라 펫으로 뜨게」)
//   펫 화면들(목록 · 방 · 배틀 · 전투 · 공방 · 보관함 · 광장 목록 · 표 · 지도)에 새로 그려지는 글에서 봉제인형 → 펫 · 인형 → 펫 · 🧸 → 🐾
const WORD_ROOTS = '#pet-modal,#pet-room-box,#pet-bond-modal,#pet-battle-modal,#pet-rune-modal,#pet-gear-modal,#dbt-ov,.gb-pan,.db-all,#plaza-sheet,.plaza-spot,#ds-ov,#ds-dlg,#custom-alert-overlay,.plaza-tag';
function wordFix(s) { return String(s).replace(/봉제인형/g, '펫').replace(/인형/g, '펫').replace(/🧸/g, '🐾'); }
function wordNode(n) {
    if (n.nodeType === 3) { const t = n.nodeValue; if (t && /인형|🧸/.test(t)) n.nodeValue = wordFix(t); return; }
    if (n.nodeType !== 1) return;
    if (n.hasAttribute && n.hasAttribute('placeholder')) { const ph = n.getAttribute('placeholder'); if (/인형|🧸/.test(ph)) n.setAttribute('placeholder', wordFix(ph)); }
    const w = document.createTreeWalker(n, 4);
    let x; const list = [];
    while ((x = w.nextNode())) list.push(x);
    list.forEach(function (tn) { const t = tn.nodeValue; if (t && /인형|🧸/.test(t)) tn.nodeValue = wordFix(t); });
}
function inRoot(n) { const e = (n.nodeType === 1) ? n : n.parentNode; return !!(e && e.closest && e.closest(WORD_ROOTS)); }
(function wordWatch() {
    if (typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(function (recs) {
        if (!artOld()) return;
        recs.forEach(function (r) {
            if (r.type === 'characterData') { if (inRoot(r.target)) wordNode(r.target); return; }
            Array.prototype.forEach.call(r.addedNodes, function (n) { if (inRoot(n)) wordNode(n); });
        });
    });
    const start = function () { if (document.body) mo.observe(document.body, { childList: true, subtree: true, characterData: true }); else setTimeout(start, 200); };
    start();
})();
function oldCss(sp, px) {
    const n = String(Math.max(1, Number(sp) || 1)).padStart(2, '0');
    return 'background-image:url(pet/old/' + (px > 64 ? 'p' : 's') + n + '.webp);background-repeat:no-repeat;background-position:center bottom;background-size:contain;image-rendering:pixelated;'
        + 'width:' + px + 'px;height:' + px + 'px;';
}
function spriteCss(sp, px, back, old) {
    if (isChr(sp)) return chrCss(sp, px, back);                       // 캐릭터 봉제인형은 옛 그림이 없다
    if (old) return oldCss(sp, px);
    const c = cellOf(sp);
    return 'background-image:url(doll/' + (back ? 'pb' : 'pf') + '.webp);background-repeat:no-repeat;image-rendering:pixelated;'
        + 'background-size:' + (px * 5) + 'px ' + (px * 5) + 'px;background-position:' + (-c.c * px) + 'px ' + (-c.r * px) + 'px;'
        + 'width:' + px + 'px;height:' + px + 'px;';
}
function monCss(i, px) {
    const c = i % 7, r = Math.floor(i / 7);
    return 'background-image:url(doll/mon.webp);background-repeat:no-repeat;image-rendering:pixelated;'
        + 'background-size:' + (px * 7) + 'px ' + (px * 2) + 'px;background-position:' + (-c * px) + 'px ' + (-r * px) + 'px;'
        + 'width:' + px + 'px;height:' + px + 'px;';
}

// ==========================================
// 주머니
// ==========================================
function bagHas(name, u) { return Math.max(0, Number(bag(u)[name]) || 0); }
//   n 만큼 더한다 (빼려면 음수). 모자라면 false
function bagAdd(name, n, u) {
    u = u || u_();
    if (!u) return false;
    const b = bag(u);
    const cur = Math.max(0, Number(b[name]) || 0);
    const nx = cur + (Number(n) || 0);
    if (nx < 0) return false;
    if (nx === 0) delete b[name]; else b[name] = nx;
    const p = {}; p['dollBag/' + name] = nx || null;
    put(p, u);
    return true;
}

// ==========================================
// 도감
// ==========================================
function dexSeen(sp, u) {
    u = u || u_();
    sp = P().sp(sp);
    const dx = dex(u), k = String(sp);
    if (dx[k] && dx[k].s) return;
    dx[k] = Object.assign({}, dx[k] || {}, { s: now() });
    const p = {}; p['dollDex/' + k] = dx[k]; put(p, u);
}
function dexCaught(sp, u) {
    u = u || u_();
    sp = P().sp(sp);
    const dx = dex(u), k = String(sp);
    const o = Object.assign({}, dx[k] || {});
    if (!o.s) o.s = now();
    if (!o.c) o.c = now();
    o.n = (Number(o.n) || 0) + 1;
    dx[k] = o;
    const p = {}; p['dollDex/' + k] = o; put(p, u);
}
function darkSeen(i, u) {
    u = u || u_();
    const dx = darkDex(u), k = String(i);
    if (dx[k]) return false;
    dx[k] = now();
    const p = {}; p['darkDex/' + k] = dx[k]; put(p, u);
    return true;
}

// ==========================================
// 인형 넣기 · 빼기 · 옮기기
// ==========================================
//   잡은 인형 — 펫 칸의 빈 열쇠로. 동행에 자리가 있으면 동행으로, 없으면 보관함으로. 보관함도 가득이면 null
function addDoll(o, u) {
    u = u || u_();
    if (!u) return null;
    if (boxList(u).length >= BOX_MAX && withList(u).length >= PARTY_MAX) return null;
    const sp = P().sp(o.sp) || 1;
    const id = P().newKey(sp, u);
    const t = now();
    const d = { g: o.g || 'D', lv: Math.max(1, Math.min(lvMax(gradeIdx(o.g || 'D')), Number(o.lv) || 1)), xp: Number(o.xp) || 0, at: o.at || t, fedAt: t, bond: Math.max(0, Number(o.bond) || 0), ord: t,
                att: ATTR[o.att] ? o.att : randAtt() };          // ★ 속성 — 야생이 들고 온 것 · 없으면 아무거나 (인형마다)
    if (o.nick) d.nick = String(o.nick).slice(0, 12);
    P().pets(u)[id] = d;
    const s = stats(Object.assign({ id: id, sp: sp }, d), u);
    d.hp = (o.hp != null) ? Math.max(1, Math.min(s.max, Number(o.hp))) : s.max;
    const p = {}; p['pets/' + id] = d;
    put(p, u);
    try { P().fedNote(id, d, t); } catch (e) { }
    const w = withList(u);
    let where = 'box';
    if (w.length < PARTY_MAX) { setWith(w.concat([id]), u); where = 'with'; }
    dexCaught(sp, u);
    dolls(u);
    return { id: id, where: where, d: d };
}
function patchDoll(id, fields, u) {
    u = u || u_();
    try { return P().patch(String(id), fields); } catch (e) { return false; }
}
function removeDoll(id, u) {
    u = u || u_();
    const ps = P().pets(u);
    if (!ps[id]) return false;
    delete ps[id];
    const w = withList(u).filter(function (x) { return x !== String(id); });
    const p = {}; p['pets/' + id] = null;
    u.petShow = w.map(Number); u.petShowSet = 1;
    p.petShow = w.length ? u.petShow : null; p.petShowSet = 1;
    if (String(u.petWith || '') === String(id)) { u.petWith = null; p.petWith = null; }
    put(p, u);
    const d = db_();
    if (d && u.code) d.ref('petFed/' + u.code + '/' + id).remove().catch(function () { });
    return true;
}
function setWith(list, u) {
    u = u || u_();
    const ds = dolls(u);
    const w = [];
    (list || []).forEach(function (id) { id = String(id); if (ds[id] && w.indexOf(id) < 0 && w.length < PARTY_MAX) w.push(id); });
    u.petShow = w.map(Number);
    u.petShowSet = 1;
    put({ petShow: w.length ? u.petShow : null, petShowSet: 1 }, u);
    try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e) { }
    return w;
}

// ==========================================
// 먹이 · 탈출
// ==========================================
function fedLeft(d) { return Math.max(0, (Number(d && d.fedAt) || 0) + ESCAPE_MS - now()); }
function fullPct(d) { return Math.round(fedLeft(d) / ESCAPE_MS * 100); }
//   ids 에게 간식을 하나씩 — 간식이 모자라면 배고픈 쪽부터. 돌려주는 값 { fed:[…], short }
function feed(ids, u) {
    u = u || u_();
    const ds = dolls(u);
    // ★ 포만도(사흘 시계 · pet-data full)가 가득한 인형은 건너뛴다 — 먹이 주기와 같은 셈 (2026-11-08)
    const full = function (id) { try { return P().full(id, u) >= 100; } catch (e) { return false; } };
    const all = (ids || []).map(String).filter(function (id) { return ds[id]; });
    const list = all.filter(function (id) { return !full(id); })
        .sort(function (a, b) { return fedLeft(ds[a]) - fedLeft(ds[b]); });
    const have = bagHas(ITEM.SNACK, u);
    const n = Math.min(have, list.length);
    const fed = list.slice(0, n);
    if (!n) return { fed: [], short: list.length, skipped: all.length - list.length };
    const t = now();
    fed.forEach(function (id) { patchDoll(id, { fedAt: t }, u); bondUp(id, u); });
    bagAdd(ITEM.SNACK, -n, u);
    return { fed: fed, short: list.length - n, skipped: all.length - list.length };
}

let sweepBusy = false;
function sweep() {
    const u = u_(), d = db_();
    if (!u || !u.code || sweepBusy || !u.dollMig) return;
    try { if (typeof window.clockReady === 'function' && !window.clockReady()) return; } catch (e) { }
    const ds = dolls(u);
    const gone = Object.keys(ds).filter(function (id) { return fedLeft(ds[id]) <= 0; });
    if (!gone.length) return;
    // 서버 것으로 한 번 더 본다 — 다른 기기에서 먹였을 수 있다
    sweepBusy = true;
    const finish = function (srv) {
        sweepBusy = false;
        const out = [];
        gone.forEach(function (id) {
            const s = srv ? srv[id] : ds[id];
            if (!s) return;
            if (srv && fedLeft(s) > 0) { P().pets(u)[id] = s; return; }
            out.push({ id: id, n: nickOf(ds[id]), sp: spName(ds[id].sp) });
            removeDoll(id, u);
        });
        if (!out.length) return;
        out.forEach(function (o) { log_('[🧸 탈출] ' + o.n + josa(o.n, '이') + ' 7일 동안 먹이를 못 받아 지루해져 달아났습니다. 원형의 야생 인형으로 돌아갔습니다.', u); });
        saveHist();
        alert_('🧸 봉제인형이 탈출했습니다\n\n' + out.map(function (o) { return '· ' + o.n + (o.n !== o.sp ? ' (' + o.sp + ')' : ''); }).join('\n')
            + '\n\n7일 동안 먹이를 받지 못해 지루해진 인형은\n흉내 내던 모습을 잃고 어디론가 떠나 버립니다.');
        try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
    };
    if (!d) { finish(null); return; }
    d.ref('users/' + u.code + '/pets').once('value').then(function (s) {
        const v = objOf(s.val());
        Object.keys(v).forEach(function (k) { /* 열쇠 그대로 */ });
        finish(v);
    }).catch(function () { sweepBusy = false; });
}
// ★ 지금 있는 B · A · S 인형은 전부 C 로 내린다 — 사원마다 한 번 (2026-11-07 사용자 「지금 있는 B~S 펫들은 전부 D~C로 내려줘」)
//   레벨은 C 상한(20)에 맞춰 자르고 경험치는 비운다. u.petGradeCut 에 적어 두어 다시 안 돈다.
function gradeCut() {
    const u = u_();
    if (!u || !u.code || u.petGradeCut || !u.dollMig) return;
    try { if (typeof window.clockReady === 'function' && !window.clockReady()) return; } catch (e) { }
    const ds = dolls(u), p = {}, names = [];
    Object.keys(ds).forEach(function (id) {
        const d = ds[id];
        if (!d || gradeIdx(d.g) < 2) return;
        const lv = Math.max(1, Math.min(lvMax(1), Number(d.lv) || 1));
        d.g = 'C'; d.lv = lv; d.xp = 0;
        p['pets/' + id + '/g'] = 'C'; p['pets/' + id + '/lv'] = lv; p['pets/' + id + '/xp'] = 0;
        names.push(nickOf(d));
    });
    u.petGradeCut = 1; p.petGradeCut = 1;
    put(p, u);
    if (names.length) {
        log_('[🧸 인형] 등급 조정 — ' + names.join(' · ') + ' : C 등급으로 (B~S 인형은 모두 C 로 내렸습니다)', u);
        saveHist();
        try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e) { }
    }
}
setInterval(function () { try { gradeCut(); } catch (e) { } }, 4000);
// ★ 속성이 안 적힌 인형(예전 것 · 알 · 받은 것)에 한 번 적어 둔다 — attOf 가 뽑는 값 그대로라 보이던 것과 같다 (2026-11-08)
function attFix() {
    const u = u_();
    if (!u || !u.code || !u.dollMig) return;
    const ds = dolls(u), p = {};
    let n = 0;
    Object.keys(ds).forEach(function (id) {
        const d = ds[id];
        if (!d || ATTR[d.att]) return;
        d.att = attOf(d); p['pets/' + id + '/att'] = d.att; n++;
    });
    if (n) put(p, u);
}
setInterval(function () { try { attFix(); } catch (e) { } }, 5000);
setInterval(function () { try { sweep(); } catch (e) { } }, 60 * 1000);
setTimeout(function () { try { sweep(); } catch (e) { } }, 15000);

// ==========================================
// 경험치 · 호감도 · 등급업 — 펫과 같은 길 (pet-gear.js · pet-data.js · awk-rune.js)
// ==========================================
//   돌려주는 값 { lv, up } (up 은 오른 Lv 수)
function giveXp(id, n, u) {
    u = u || u_();
    const d = dolls(u)[id];
    if (!d || !window.PETGEAR) return null;
    const was = stats(d, u).max, h0 = hpOf(d);
    const r = window.PETGEAR.addXp(id, n);
    if (!r) return null;
    const up = r.lv - r.lv0;
    if (up && h0 > 0) patchDoll(id, { hp: Math.min(stats(d, u).max, h0 + (stats(d, u).max - was)) }, u);
    return { lv: r.lv, up: up };
}
const BOND_MAX = 100;
function bondOf(d, u) { try { return P().bond(d.id, u || u_()); } catch (e) { return 0; } }
function bondUp(id, u) {
    try { const patch = {}; const got = P().bondUp(String(id), patch); if (got) P().patch(String(id), patch); return got; } catch (e) { return 0; }
}
function gradeNeed(id, u) { try { return window.PETGEAR.gradeNeed(String(id), u || u_()); } catch (e) { return { ok: false, why: '등급업을 할 수 없습니다.' }; } }
function gradeUp(id) { try { return window.PETGEAR.gradeUp(String(id)); } catch (e) { return { ok: false, why: '등급업을 할 수 없습니다.' }; } }

// ==========================================
// 옮겨 오기 — 사원마다 한 번
// ==========================================
let migBusy = false;
function migrate() {
    const u = u_(), d = db_();
    if (!u || !u.code || u.dollMig || migBusy) return;
    try { if (typeof window.clockReady === 'function' && !window.clockReady()) return; } catch (e) { }
    migBusy = true;
    const done = function (srv) {
        const t = now();
        const p = {};
        const ps = P().pets(u);
        // ① 예전 인형 칸 → 펫 칸
        const old = objOf(srv ? srv.dolls : u.dolls);
        const oldWith = Array.isArray(srv ? srv.dollWith : u.dollWith) ? (srv ? srv.dollWith : u.dollWith) : [];
        const map = {};
        Object.keys(old).forEach(function (oid) {
            const o = old[oid];
            if (!o || !o.sp) return;
            const k = P().newKey(o.sp, u);
            const rec = { g: o.g || 'D', lv: Number(o.lv) || 1, xp: Number(o.xp) || 0, at: o.at || t, fedAt: t, bond: 0, ord: o.ord || o.at || t };
            if (o.nick) rec.nick = o.nick;
            if (o.fav) rec.fav = 1;
            if (o.hp != null) rec.hp = Number(o.hp);
            ps[k] = rec;
            p['pets/' + k] = rec;
            map[oid] = k;
        });
        // ② 가진 펫 — 먹이 시계를 새로 · 도감에 「잡은 것」
        const dx = dex(u);
        Object.keys(ps).forEach(function (k) {
            if (!P().BY[k]) return;
            if (!p['pets/' + k]) { ps[k].fedAt = t; p['pets/' + k + '/fedAt'] = t; }
            const sp = String(P().sp(k));
            const e = Object.assign({}, dx[sp] || {});
            if (!e.s) e.s = t; if (!e.c) e.c = t; e.n = (Number(e.n) || 0) + 1;
            dx[sp] = e;
            p['dollDex/' + sp] = e;
        });
        // ③ 동행 — 예전 인형 동행이 있으면 그것을, 아니면 방에 내놓은 셋 그대로
        //     (저절로 채워 보이던 셋도 그대로 적어 둔다 — 옮긴 뒤 방이 비지 않게)
        const w = oldWith.map(function (x) { return map[x]; }).filter(Boolean);
        const cur = withList(u).filter(function (k) { return w.indexOf(k) < 0; });
        const nw = w.concat(cur).slice(0, PARTY_MAX);
        if (nw.length) {
            u.petShow = nw.map(Number); p.petShow = u.petShow;
            u.petShowSet = 1; p.petShowSet = 1;
        }
        p.dolls = null; p.dollWith = null;
        delete u.dolls; delete u.dollWith;
        u.dollMig = t; p.dollMig = t;
        put(p, u).then(function () {
            migBusy = false;
            Object.keys(ps).forEach(function (k) { try { P().fedNote(k, ps[k], t); } catch (e) { } });
            if (Object.keys(map).length) log_('[🧸] 봉제인형 ' + Object.keys(map).length + '마리를 펫 칸으로 옮겼습니다.', u);
            try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
        });
    };
    if (!d) { done(null); return; }
    d.ref('users/' + u.code).once('value').then(function (s) {
        const v = s.val() || {};
        if (v.dollMig) { u.dollMig = v.dollMig; migBusy = false; return; }
        try { if (v.pets) u.pets = v.pets; } catch (e) { }
        done({ dolls: v.dolls, dollWith: v.dollWith });
    }).catch(function () { migBusy = false; });
}
setInterval(function () { try { migrate(); } catch (e) { } }, 3000);

// ==========================================
// 콘솔
// ==========================================
window.dollState = function () {
    const u = u_();
    if (!u) { console.log('로그인 전입니다.'); return; }
    const ds = dolls(u), w = withList(u);
    console.log('%c===== 🧸 봉제인형 =====', 'color:#ffcf8f; font-size:13px');
    console.table(Object.keys(ds).map(function (id) {
        const d = ds[id], s = stats(d);
        return { 열쇠: id, 이름: nickOf(d), 종: spName(d.sp), 등급: s.g, Lv: s.lv, 체력: hpOf(d) + '/' + s.max, 교감: bondOf(d),
                 자리: w.indexOf(id) >= 0 ? '동행 ' + (w.indexOf(id) + 1) : '보관함', 먹이: fullPct(d) + '%', 즐겨찾기: d.fav ? '★' : '' };
    }));
    console.log('주머니', JSON.stringify(bag(u)), '· 도감', Object.keys(dex(u)).length, '종 · 어둠 도감', Object.keys(darkDex(u)).length);
};
window.dollGive = function (sp, g) {
    if (!isAdmin()) { console.warn('상담사만'); return; }
    const r = addDoll({ sp: sp || (1 + Math.floor(Math.random() * 25)), g: g || 'D' });
    console.log(r ? '넣었습니다 — ' + r.id + ' · ' + r.where : '자리가 없습니다');
    try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
};
window.dollBagGive = function (name, n) {
    if (!isAdmin()) { console.warn('상담사만'); return; }
    bagAdd(name, Number(n) || 1);
    console.log(name, bagHas(name));
};

window.DOLL = {
    PARTY_MAX: PARTY_MAX, BOX_N: BOX_N, BOX_SIZE: BOX_SIZE, BOX_MAX: BOX_MAX, ESCAPE_MS: ESCAPE_MS, LV_MAX: LV_MAX,
    GRADES: GRADES, ATTR: ATTR, BEATS: BEATS, ITEM: ITEM, ITEM_DESC: ITEM_DESC, MON: MON, MON_BY: MON_BY,
    eff: effOf, attOf: attOf, randAtt: randAtt, me: u_, now: now, today: today, esc: esc, alert: alert_, log: log_, josa: josa, isAdmin: isAdmin,
    spOf: spOf, spName: spName, objOf: objOf,
    dolls: dolls, bag: bag, dex: dex, darkDex: darkDex, withList: withList, boxList: boxList,
    put: put, saveHist: saveHist,
    stats: stats, hpOf: hpOf, nickOf: nickOf, xpNeed: xpNeed, rollGrade: rollGrade, gradeIdx: gradeIdx, gOf: gOf, lvMax: lvMax, lvMaxOf: lvMaxOf,
    spriteCss: spriteCss, monCss: monCss, cellOf: cellOf, isChr: isChr, artOld: artOld, oldCss: oldCss, artSet: artSet, artSwitchHtml: artSwitchHtml, artSwitchWire: artSwitchWire, wordFix: wordFix,
    bagHas: bagHas, bagAdd: bagAdd,
    dexSeen: dexSeen, dexCaught: dexCaught, darkSeen: darkSeen,
    addDoll: addDoll, patchDoll: patchDoll, removeDoll: removeDoll, setWith: setWith,
    fedLeft: fedLeft, fullPct: fullPct, feed: feed, sweep: sweep, giveXp: giveXp,
    bondOf: bondOf, bondUp: bondUp, BOND_MAX: BOND_MAX, gradeNeed: gradeNeed, gradeUp: gradeUp, migrate: migrate
};

window.dollArtSet = function (code, v) {
    const me = u_(), d = db_();
    if (!me || !isAdmin(me) || !d) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const val = (v === 'old' || v === 'doll') ? v : null;
    d.ref('users/' + code + '/petArt').set(val).then(function () { console.log('%c✓ ' + code + ' — 펫 그림 ' + (val || '기본(사번 0010 은 예전 그림)'), 'color:#4CAF50'); });
};
console.log('[🧸] 따라쟁이 봉제인형 (= 펫) — dollState() · dollArtSet(사번, old|doll)');
})();
