// ==========================================
// ★ 🧸 따라쟁이 봉제인형 — 바탕 (자료 · 동행 · 보관함 · 주머니 · 도감)
// bundles.json 마지막 묶음 — journey.js · pet-data.js 보다 뒤, doll-scene · doll-battle · doll-gong 보다 앞
// ==========================================
//
// 2026-11-07 사용자 「여정 시스템을 이렇게 구현하자. 야생 펫 조우 맵. 펫 전투 화면. + 도깨비 공방 추가」
//   (기획안 — 펫 시스템 확장 기획안 · 펫 전투 · 수선소 · 잡화점 · 교환소 · 보관함 · 펫 로스 · 튜토리얼)
//
// ■ 무엇인가
//   야생에서 잡는 「따라쟁이 봉제인형」. 탐사자가 기억하는 동물(펫 25종)의 모습을 흉내 낸다.
//   기존 펫(u.pets — 진짜 동물 · 종마다 한 마리)과는 **따로** 둔다. 같은 종을 여럿 잡을 수 있어야 해서다
//   (중복 포획 → 교환소). 그림은 봉제인형 그림(doll/pf · pb)을 쓴다.
//
// ■ 사원 기록에 적히는 자리
//   u.dolls     { 열쇠: { id, sp(종 1~25), nick, g(D~S), lv, xp, hp, at(잡은 때), fedAt, fav, ord } }
//   u.dollWith  [열쇠, 열쇠, 열쇠]   동행 — 세 마리까지. 나머지는 보관함(펫 박스)
//   u.dollBag   { '🎀 포옹 리본': n, '🍶 청주': n, '🥣 메밀묵': n, '🧶 솜뭉치 간식': n }  — 소지품과 따로
//   u.dollDex   { 종: { s: 처음 본 때, c: 처음 잡은 때, n: 잡은 수 } }      봉제인형 도감
//   u.darkDex   { 괴담 번호: 처음 만난 때 }                                    어둠 · 재난 도감 (잡을 수 없다)
//   u.dollTut   { step, done }   도깨비 공방 튜토리얼
//   u.dollSort  'dex' | 'cap' | 'own'   보관함 정렬
//
//   쓸 때는 users/<사번>/dolls/<열쇠> 처럼 **한 칸씩** 쓴다 (통째로 덮지 않는다). pet-sync.js 가 다른 기기에서 받아 온다.
//
// ■ 탈출 (펫 로스 개선안)
//   7일 동안 먹이(🧶 솜뭉치 간식)를 안 주면 **탈출**한다 — 목록에서 사라지고 원형의 야생 인형으로 돌아간다.
//   동행 · 보관함 둘 다 같다. 보관함의 「일괄 먹이 주기」로 한꺼번에 준다.
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
function dolls(u) { u = u || u_(); if (!u) return {}; u.dolls = objOf(u.dolls); return u.dolls; }
function bag(u) { u = u || u_(); if (!u) return {}; u.dollBag = objOf(u.dollBag); return u.dollBag; }
function dex(u) { u = u || u_(); if (!u) return {}; u.dollDex = objOf(u.dollDex); return u.dollDex; }
function darkDex(u) { u = u || u_(); if (!u) return {}; u.darkDex = objOf(u.darkDex); return u.darkDex; }
function withList(u) {
    u = u || u_();
    if (!u) return [];
    const ds = dolls(u);
    const raw = Array.isArray(u.dollWith) ? u.dollWith : (u.dollWith && typeof u.dollWith === 'object' ? Object.keys(u.dollWith).sort().map(function (k) { return u.dollWith[k]; }) : []);
    const out = [];
    raw.forEach(function (id) { if (id && ds[id] && out.indexOf(id) < 0 && out.length < PARTY_MAX) out.push(String(id)); });
    return out;
}
function boxList(u) {
    u = u || u_();
    const w = withList(u), ds = dolls(u);
    return Object.keys(ds).filter(function (id) { return w.indexOf(id) < 0; });
}

// ==========================================
// 쓰기 — 한 칸씩 (users/<사번>/…)
// ==========================================
//   paths 는 { 'dolls/열쇠': 값, 'dollBag/이름': 값 … } — 내 화면(currentUser)은 부르는 쪽이 먼저 고쳐 둔다.
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
// 인형 하나의 수치
// ==========================================
//   종 능력치(pet-data st)는 등급 B 부터 붙는다 — 펫과 같은 규칙 (그래서 D · C 는 종 차이가 속성뿐이다)
//     체력 50 + Lv·6 + 등급·15 + 저항·4      공격 8 + Lv·1.5 + 등급·3 + 판정·2
//     방어 2 + Lv·0.5 + 등급·1.5 + 저항       회피% 5 + 회피·3         치명% 5 + 행운/10
function gradeIdx(g) { const i = GRADES.indexOf(g); return i < 0 ? 0 : i; }
function stats(d) {
    const sp = spOf(d && d.sp) || { st: {}, w: 'wet' };
    const gi = gradeIdx(d && d.g), lv = Math.max(1, Math.min(LV_MAX, Number(d && d.lv) || 1));
    const st = (gi >= 2) ? (sp.st || {}) : {};
    const n = function (k) { return Number(st[k]) || 0; };
    return {
        max: Math.round(50 + lv * 6 + gi * 15 + n('resist') * 4),
        atk: Math.round((8 + lv * 1.5 + gi * 3 + n('bon') * 2) * 10) / 10,
        def: Math.round((2 + lv * 0.5 + gi * 1.5 + n('resist')) * 10) / 10,
        eva: Math.min(40, 5 + n('eva') * 3),
        crit: Math.min(40, Math.round(5 + n('luck') / 10)),
        att: sp.w || 'wet', lv: lv, gi: gi
    };
}
function hpOf(d) {
    const s = stats(d);
    const h = (d && d.hp != null) ? Number(d.hp) : s.max;
    return Math.max(0, Math.min(s.max, isFinite(h) ? h : s.max));
}
function nickOf(d) { return (d && d.nick) ? String(d.nick) : spName(d && d.sp); }
// 경험치 — Lv 마다 20 · 30 · 40 … (Lv·10 + 10)
function xpNeed(lv) { return lv * 10 + 10; }
// 등급을 무게로 뽑는다 — 야생에서 만나는 것
function rollGrade(luck) {
    const r = Math.random() * 100 - (Number(luck) || 0);
    if (r < 1) return 'S';
    if (r < 5) return 'A';
    if (r < 15) return 'B';
    if (r < 40) return 'C';
    return 'D';
}
function newId() { return 'd' + now().toString(36) + Math.random().toString(36).slice(2, 6); }

// 그림 — 앞(pf · 64칸 · 1~25) / 뒤(pb · 64칸 · 그려 쓸 때 두 배) · 5 × 5
function cellOf(sp) { const i = Math.max(1, Math.min(25, Number(sp) || 1)) - 1; return { c: i % 5, r: Math.floor(i / 5) }; }
//   px — 한 칸을 몇 px 로 그리나. back 이면 뒷모습
function spriteCss(sp, px, back) {
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
    const dx = dex(u), k = String(sp);
    if (dx[k] && dx[k].s) return;
    dx[k] = Object.assign({}, dx[k] || {}, { s: now() });
    const p = {}; p['dollDex/' + k] = dx[k]; put(p, u);
}
function dexCaught(sp, u) {
    u = u || u_();
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
//   잡은 인형 — 동행에 자리가 있으면 동행으로, 없으면 보관함으로. 보관함도 가득이면 null
function addDoll(o, u) {
    u = u || u_();
    if (!u) return null;
    const ds = dolls(u);
    if (boxList(u).length >= BOX_MAX && withList(u).length >= PARTY_MAX) return null;
    const id = o.id || newId();
    const t = now();
    const d = { id: id, sp: Number(o.sp) || 1, g: o.g || 'D', lv: Number(o.lv) || 1, xp: 0, at: o.at || t, fedAt: t, ord: t };
    if (o.nick) d.nick = String(o.nick).slice(0, 12);
    const s = stats(d);
    d.hp = (o.hp != null) ? Math.max(1, Math.min(s.max, Number(o.hp))) : s.max;
    ds[id] = d;
    const p = {}; p['dolls/' + id] = d;
    const w = withList(u);
    let where = 'box';
    if (w.length < PARTY_MAX) { w.push(id); u.dollWith = w; p.dollWith = w; where = 'with'; }
    put(p, u);
    dexCaught(d.sp, u);
    return { id: id, where: where, d: d };
}
function patchDoll(id, fields, u) {
    u = u || u_();
    const ds = dolls(u);
    if (!ds[id]) return false;
    const p = {};
    Object.keys(fields).forEach(function (k) {
        const v = fields[k];
        if (v == null) delete ds[id][k]; else ds[id][k] = v;
        p['dolls/' + id + '/' + k] = (v == null) ? null : v;
    });
    put(p, u);
    return true;
}
function removeDoll(id, u) {
    u = u || u_();
    const ds = dolls(u);
    if (!ds[id]) return false;
    delete ds[id];
    const w = withList(u).filter(function (x) { return x !== id; });
    u.dollWith = w;
    const p = { dollWith: w.length ? w : null }; p['dolls/' + id] = null;
    put(p, u);
    return true;
}
function setWith(list, u) {
    u = u || u_();
    const ds = dolls(u);
    const w = [];
    (list || []).forEach(function (id) { if (ds[id] && w.indexOf(id) < 0 && w.length < PARTY_MAX) w.push(id); });
    u.dollWith = w;
    put({ dollWith: w.length ? w : null }, u);
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
    const list = (ids || []).filter(function (id) { return ds[id]; })
        .sort(function (a, b) { return fedLeft(ds[a]) - fedLeft(ds[b]); });
    const have = bagHas(ITEM.SNACK, u);
    const n = Math.min(have, list.length);
    const fed = list.slice(0, n);
    if (!n) return { fed: [], short: list.length };
    const t = now();
    const p = {};
    fed.forEach(function (id) { ds[id].fedAt = t; p['dolls/' + id + '/fedAt'] = t; });
    const b = bag(u);
    const left = have - n;
    if (left) b[ITEM.SNACK] = left; else delete b[ITEM.SNACK];
    p['dollBag/' + ITEM.SNACK] = left || null;
    put(p, u);
    return { fed: fed, short: list.length - n };
}

let sweepBusy = false;
function sweep() {
    const u = u_(), d = db_();
    if (!u || !u.code || sweepBusy) return;
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
            if (srv && fedLeft(s) > 0) { ds[id] = s; return; }
            out.push({ id: id, n: nickOf(ds[id] || s), sp: spName((ds[id] || s).sp) });
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
    d.ref('users/' + u.code + '/dolls').once('value').then(function (s) { finish(objOf(s.val())); })
        .catch(function () { sweepBusy = false; });
}
setInterval(function () { try { sweep(); } catch (e) { } }, 60 * 1000);
setTimeout(function () { try { sweep(); } catch (e) { } }, 15000);

// ==========================================
// 경험치
// ==========================================
//   돌려주는 값 { lv, up } (up 은 오른 Lv 수)
function giveXp(id, n, u) {
    u = u || u_();
    const d = dolls(u)[id];
    if (!d) return null;
    let lv = Math.max(1, Number(d.lv) || 1), xp = (Number(d.xp) || 0) + Math.max(0, Number(n) || 0), up = 0;
    while (lv < LV_MAX && xp >= xpNeed(lv)) { xp -= xpNeed(lv); lv++; up++; }
    if (lv >= LV_MAX) xp = 0;
    const was = stats(d).max;
    const f = { lv: lv, xp: xp };
    if (up) {                               // 오른 몫만큼 체력도 같이 오른다 (쓰러진 것은 그대로)
        const nd = Object.assign({}, d, f);
        const gain = stats(nd).max - was;
        if (hpOf(d) > 0) f.hp = Math.min(stats(nd).max, hpOf(d) + gain);
    }
    patchDoll(id, f, u);
    return { lv: lv, up: up };
}

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
        return { 열쇠: id, 이름: nickOf(d), 종: spName(d.sp), 등급: d.g, Lv: d.lv, 체력: hpOf(d) + '/' + s.max,
                 자리: w.indexOf(id) >= 0 ? '동행 ' + (w.indexOf(id) + 1) : '보관함', 포만: fullPct(d) + '%', 즐겨찾기: d.fav ? '★' : '' };
    }));
    console.log('주머니', JSON.stringify(bag(u)), '· 도감', Object.keys(dex(u)).length, '종 · 어둠 도감', Object.keys(darkDex(u)).length);
};
window.dollGive = function (sp, g) {
    if (!isAdmin()) { console.warn('상담사만'); return; }
    const r = addDoll({ sp: sp || (1 + Math.floor(Math.random() * 25)), g: g || 'D' });
    console.log(r ? '넣었습니다 — ' + r.where : '자리가 없습니다');
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
    eff: effOf, me: u_, now: now, today: today, esc: esc, alert: alert_, log: log_, josa: josa, isAdmin: isAdmin,
    spOf: spOf, spName: spName, objOf: objOf,
    dolls: dolls, bag: bag, dex: dex, darkDex: darkDex, withList: withList, boxList: boxList,
    put: put, saveHist: saveHist,
    stats: stats, hpOf: hpOf, nickOf: nickOf, xpNeed: xpNeed, rollGrade: rollGrade, gradeIdx: gradeIdx,
    spriteCss: spriteCss, monCss: monCss, cellOf: cellOf,
    bagHas: bagHas, bagAdd: bagAdd,
    dexSeen: dexSeen, dexCaught: dexCaught, darkSeen: darkSeen,
    addDoll: addDoll, patchDoll: patchDoll, removeDoll: removeDoll, setWith: setWith,
    fedLeft: fedLeft, fullPct: fullPct, feed: feed, sweep: sweep, giveXp: giveXp
};

console.log('[🧸] 따라쟁이 봉제인형 — dollState()');
})();
