// ==========================================
// ★ 📺 망상 홈쇼핑 — 의상숍 · 악세서리숍 (뽑기)
// bundles.json 마지막 묶음, firsthead.js 바로 뒤
// ==========================================
//
// ■ 무엇인가
//
//   재난관리국 앞 지하의 망상 홈쇼핑에 가게 둘이 더 생겼다.
//
//       의상숍      1회 30,000 P · 10연 300,000 P
//       악세서리숍  1회 15,000 P · 10연 150,000 P
//
//   10연은 열 번을 한 번에 돌리는 것일 뿐, 값은 같다(열 배). 덤은 없다.
//   이미 가진 것이 또 나오면 **값의 ⅓** 을 돌려 준다.
//
// ■ 등급
//
//       S  2%   ·  A  10%  ·  B  30%  ·  C  58%
//
//   등급을 먼저 뽑고, 그 등급 안에서 하나를 고른다. 그래서 같은 등급에
//   몇 가지가 들었느냐에 따라 한 가지가 나올 확률이 달라진다.
//
//   ★ 등급표는 **일단 제가 매긴 것**입니다. 아래 WEAR·ACC 의 g 를
//     고치시면 그대로 됩니다 (S A B C 넷 중 하나).
//
// ■ 커플링
//
//   커플링을 가졌거나 차고 있으면 — u.couple 이 있거나 소지품에 💍 커플링이
//   있으면 — 아래 다섯 가지가 **제 등급 안에서 세 배** 잘 나온다.
//
//       드레스 · 턱시도 · 면사포 · 검은 구두 · 검은 장갑
//
//   (전에 이야기하던 50만 P 커플 세트 패키지는 없앴습니다 — 뽑기로만 갑니다.)
//
// ■ 뽑은 것은 어디로 가나
//
//   u.wardrobe 에 적힌다 — { dress: 1, ac07: 1, … }.
//   옷장(closet.js)과 광장 가방이 그 표를 보고, **가진 것만** 고를 수 있게
//   보여 준다 (closet.js 의 allowed · plaza.js 의 allowedIt 에 own 을 더했다).
//   상담사는 전처럼 다 보인다.
//
// ■ 보여 주는 모습
//
//   뽑힌 것은 **얼굴 없는 기본 몸**에 입혀서 보여 준다. 머리를 안 올리므로
//   누구의 얼굴도 아니다. 여섯 칸을 돌려 **걷는 모습**으로 보여 주어,
//   움직이게 그려 주신 것은 움직이는 채로 보인다.
//
// ■ 콘솔
//       gachaState()        내가 가진 것 · 등급별 가짓수
//       gachaOdds('wear')   지금 내 확률표 (커플링 보정까지)
//       gachaGive('ac07')   (상담사) 하나 넣어 준다

// ==========================================
// 값 · 등급표
// ==========================================
const GACHA = {
    wear: { n: '의상숍',     ic: 'wearshop', one: 30000, ten: 300000 },
    acc:  { n: '악세서리숍', ic: 'accshop',  one: 15000, ten: 150000 },
    // 등급이 나올 확률 (합이 100)
    ODDS: { S: 2, A: 10, B: 30, C: 58 },
    GRADE: { S: { c: '#ffd479', n: 'S' }, A: { c: '#c7a3ff', n: 'A' },
             B: { c: '#8fc7ef', n: 'B' }, C: { c: '#9a9284', n: 'C' } },
    COUPLE_X: 3,                     // 커플링이 있으면 세트 옷이 몇 배 잘 나오나
    BACK: 3                          // 중복이면 값의 1/3 을 돌려 준다
};

// ── 의상 (옷장 칸에 이미 있는 것들 — 여기서는 등급만 매긴다)
//    k   : u.wardrobe 에 적히는 열쇠 (= 그림 이름)
//    s   : 겹쳐 그릴 장 (여러 장이면 배열)
//    set : 커플링 보정을 받는 것
const GACHA_WEAR = [
    { k: 'robe',        n: '검은 장포',  g: 'S', s: ['robe'] },
    { k: 'dress',       n: '드레스',     g: 'S', s: ['dress'],       set: 1 },
    { k: 'tuxedo',      n: '턱시도',     g: 'S', s: ['tuxedo'],      set: 1 },
    { k: 'veil',        n: '면사포',     g: 'S', s: ['veil'],        set: 1 },
    { k: 'cape',        n: '하얀 망토',  g: 'A', s: ['cape'] },
    { k: 'han-inner',   n: '내의',       g: 'A', s: ['han-inner'] },
    { k: 'brown-suit',  n: '브라운 정장', g: 'A', s: ['brown-suit'] },
    { k: 'dream-suit',  n: '백일몽 정장', g: 'B', s: ['dream-suit'] },
    // 요원복 두 벌 — 등급은 말씀이 없으셔서 B 로 두었습니다 (고치셔도 됩니다)
    { k: 'agent1',      n: '요원복 1',   g: 'B', s: ['agent1'] },
    { k: 'agent2',      n: '요원복 2',   g: 'B', s: ['agent2'] },
    { k: 'han-duru',    n: '두루마기',   g: 'B', s: ['han-duru'] },
    // 다섯 벌 더 (2026-10-23) — 이름 · 등급은 말씀이 없으셔서 그림을 보고 붙이고 B 로 두었습니다 (고치셔도 됩니다)
    { k: 'dress-yellow', n: '유치원 앞치마', g: 'B', s: ['dress-yellow'] },
    { k: 'dress-green',  n: '룩키마트 앞치마', g: 'B', s: ['dress-green'] },
    { k: 'maid',         n: '메이드복',    g: 'B', s: ['maid'] },
    { k: 'maid-long',    n: '롱 메이드복', g: 'B', s: ['maid-long'] },
    { k: 'band-outfit',  n: '룩키마트 의상', g: 'B', s: ['band-outfit'] },
    { k: 'knit',         n: '가을 니트',    g: 'B', s: ['knit'] },
    { k: 'gym-suit',     n: '체육복',       g: 'B', s: ['gym-suit'] },
    { k: 'shoes-black', n: '검은 구두',  g: 'B', s: ['shoes-black'], set: 1 },
    { k: 'glove',       n: '검은 장갑',  g: 'B', s: ['glove'],       set: 1 },
    { k: 'shoes',       n: '구두',       g: 'C', s: ['shoes'] },
    { k: 'han-shoes',   n: '신',         g: 'C', s: ['han-shoes'] },
    { k: 'bungeo',      n: '붕어빵 의상', g: 'C', s: ['bungeo'] }
];

// ── 악세 마흔아홉 가지. 이름은 주신 파일 이름 그대로입니다.
//    (베일은 의상숍 쪽 「면사포」로 들어가 여기에는 없습니다)
const GACHA_ACC = [
    { k: 'ac45', n: '텐시',                   g: 'S' , c: '머리' },
    { k: 'ac46', n: '하회탈',                 g: 'S' , c: '얼굴' },
    { k: 'ac39', n: '작두',                   g: 'S' , c: '손' },
    { k: 'ac13', n: '등불',                   g: 'S' , c: '손' },
    { k: 'ac01', n: '가나디',                 g: 'A' , c: '귀' },
    // ★ 갓만 열쇠가 ac** 가 아니다 — 악세 쉰 가지보다 먼저 들어와 있던
    //   상담사 전용 물건이라 장 이름이 han-gat 이다. 옷장 쪽 줄은 i:'gat'
    //   그대로 두고 own 만 달았으므로, 아래 fillSlots 는 own 으로도 견준다.
    { k: 'han-gat', n: '갓',                  g: 'A' , c: '머리' },
    { k: 'ac07', n: '냐냐냥 머리띠',          g: 'A' , c: '머리' },
    { k: 'ac11', n: '돌고래 꼬리',            g: 'A' , c: '등' },
    { k: 'ac14', n: '롭이어 토끼',            g: 'A' , c: '머리' },
    { k: 'ac27', n: '삿갓',                   g: 'A' , c: '머리' },
    { k: 'ac32', n: '아쿠마',                 g: 'A' , c: '머리' },
    { k: 'ac34', n: '에메랄드 하네스',        g: 'A' , c: '등' },
    { k: 'ac44', n: '크로스백',               g: 'A' , c: '등' },
    { k: 'ac49', n: '호랑이 꼬리',            g: 'A' , c: '등' },
    { k: 'ac04', n: '곰방대',                 g: 'B' , c: '얼굴' },
    { k: 'ac05', n: '귀갑묶기',               g: 'B' , c: '등' },
    { k: 'ac08', n: '냥냥수염',               g: 'B' , c: '얼굴' },
    { k: 'ac09', n: '냥냥펀치',               g: 'B' , c: '손' },
    { k: 'ac12', n: '두건',                   g: 'B' , c: '머리' },
    { k: 'ac17', n: '마패',                   g: 'B' , c: '손' },
    { k: 'ac18', n: '목도리',                 g: 'B' , c: '목' },
    { k: 'ac19', n: '목줄',                   g: 'B' , c: '목' },
    { k: 'ac22', n: '볼개그',                 g: 'B' , c: '얼굴' },
    { k: 'ac24', n: '부적',                   g: 'B' , c: '손' },
    { k: 'ac25', n: '부채',                   g: 'B' , c: '손' },
    { k: 'ac26', n: '비녀',                   g: 'B' , c: '머리' },
    { k: 'ac28', n: '솜사탕',                 g: 'B' , c: '손' },
    { k: 'ac30', n: '스카프',                 g: 'B' , c: '목' },
    { k: 'ac38', n: '읍궁 문신',              g: 'B' , c: '등' },
    { k: 'ac48', n: '헤드폰',                 g: 'B' , c: '귀' },
    { k: 'sexy-pantsu', n: '섹시빤츄',        g: 'B' , c: '등' },   // 2026-10-23 · 옷 밑에 입는다 (closet.js 에 over 로 따로 적어 둠)
    { k: 'ac02', n: '검역용 볼트',            g: 'C' , c: '귀' },
    { k: 'ac03', n: '검역 핏자국',            g: 'C' , c: '얼굴' },
    { k: 'ac06', n: '난 차라리 웃고 있는',    g: 'C' , c: '얼굴' },
    { k: 'ac10', n: '담배',                   g: 'C' , c: '얼굴' },
    { k: 'ac15', n: '리본 (검정)',            g: 'C' , c: '머리' },
    { k: 'ac16', n: '리본 (빨강)',            g: 'C' , c: '목' },
    { k: 'ac20', n: '백사헌 안구',            g: 'C' , c: '얼굴' },
    { k: 'ac23', n: '볼터치',                 g: 'C' , c: '얼굴' },
    { k: 'ac29', n: '스마일 스티커',          g: 'C' , c: '얼굴' },
    { k: 'ac31', n: '신용카드',               g: 'C' , c: '손' },
    { k: 'ac33', n: '안대',                   g: 'C' , c: '얼굴' },
    { k: 'ac35', n: '여우구슬',               g: 'C' , c: '손' },
    { k: 'ac36', n: '연지곤지',               g: 'C' , c: '얼굴' },
    { k: 'ac37', n: '유리손포',               g: 'C' , c: '손' },
    { k: 'ac40', n: '지나가버린 어린 시절에', g: 'C' , c: '손' },
    { k: 'ac41', n: '지사 스티커',            g: 'C' , c: '얼굴' },
    { k: 'ac42', n: '차카니 친구',            g: 'C' , c: '머리' },
    { k: 'ac43', n: '최요원 목 흉터',         g: 'C' , c: '목' },
    { k: 'ac47', n: '행맨',                   g: 'C' , c: '목' },
    { k: 'ac50', n: '흉터',                   g: 'C' , c: '얼굴' }
];

// ── 뽑기에 **안 들어가는** 것 — 악세서리숍에서 바로 산다
//
//   토끼 전용 악세 둘. 토끼(h-rabbit)가 어둠 소속만 고를 수 있는 머리라,
//   이 둘도 **어둠 소속에게만** 보이고 팔린다. 값은 둘 다 5만 P.
//   뽑기 표(GACHA_ACC)와 따로 두어야 뽑기에 안 섞인다.
//   ★ 움직이는 쪽(rab-friend)은 **여기에 없다.** 팔지 않고 사번 3764
//     한 사람에게만 보인다 (closet.js 의 nos).
const GACHA_BUY = {
    acc: [
        { k: 'rab-friend-q', n: '친구 리본', p: 50000, dark: true,
          d: '토끼 전용. 품에 안고 다닌다.' }
    ]
};

(function gacha() {

const POOL = { wear: GACHA_WEAR, acc: GACHA_ACC };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdm(u) { const x = u || u_(); return !!(x && x.code === 'kario0987'); }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function won(n) { return Number(n).toLocaleString('ko-KR'); }
// 어둠 소속 — 소속이나 팀 이름에 「어둠」이 들어 있으면 어둠이다
// (newitems2.js · closet.js 와 같은 잣대)
function isDark(u) {
    const x = u || u_();
    return /어둠/.test(((x && x.affiliation) || '') + ' ' + ((x && x.team) || ''));
}
// 이 사람에게 보이는 「사는 물건」
function buyList(kind) {
    const u = u_();
    return (GACHA_BUY[kind] || []).filter(function (x) {
        return !x.dark || isAdm(u) || isDark(u);
    });
}

// ── 가진 것
function bag(u) {
    const x = u || u_(); if (!x) return {};
    if (!x.wardrobe || typeof x.wardrobe !== 'object') x.wardrobe = {};
    return x.wardrobe;
}
function has(key, u) {
    const x = u || u_();
    if (!x) return false;
    return !!(x.wardrobe && x.wardrobe[key]);
}
window.dotOwned = has;        // 옷장·가방이 이것을 본다

// ── 커플링을 가졌나 (가졌거나 차고 있거나)
function couple(u) {
    const x = u || u_(); if (!x) return false;
    if (x.couple && x.couple.partner) return true;
    try { return (x.inventory || []).indexOf('💍 커플링') >= 0; } catch (e) { return false; }
}
window.gachaCouple = couple;

// ==========================================
// 뽑기
// ==========================================
//
//   등급을 먼저 고르고, 그 등급 안에서 하나를 고른다.
//   커플링이 있으면 세트 옷의 몫(weight)만 세 배로 둔다 — 등급 자체의
//   확률은 안 건드린다. 그래서 「S 가 더 잘 나온다」가 아니라
//   「S 가 나왔을 때 드레스·턱시도·면사포 쪽일 때가 많다」가 된다.
function gradePick() {
    const o = GACHA.ODDS;
    let r = Math.random() * (o.S + o.A + o.B + o.C);
    if ((r -= o.S) < 0) return 'S';
    if ((r -= o.A) < 0) return 'A';
    if ((r -= o.B) < 0) return 'B';
    return 'C';
}

function weightOf(it, cp) { return (cp && it.set) ? GACHA.COUPLE_X : 1; }

function pickOne(kind) {
    const list = POOL[kind] || [];
    const cp = couple();
    let g = gradePick();
    let on = list.filter(function (x) { return x.g === g; });
    // 그 등급이 비어 있으면 (등급표를 고치다 비울 수 있다) 아래 등급으로 내려간다
    const order = ['S', 'A', 'B', 'C'];
    let gi = order.indexOf(g);
    while (!on.length && gi < order.length - 1) { gi++; g = order[gi]; on = list.filter(function (x) { return x.g === g; }); }
    if (!on.length) on = list.slice();
    if (!on.length) return null;
    let sum = 0;
    on.forEach(function (x) { sum += weightOf(x, cp); });
    let r = Math.random() * sum;
    for (let i = 0; i < on.length; i++) {
        r -= weightOf(on[i], cp);
        if (r < 0) return on[i];
    }
    return on[on.length - 1];
}

// 한 판 — n 번 뽑고, 중복은 ⅓ 을 돌려 준다
function roll(kind, n) {
    const u = u_(); if (!u) return null;
    const g = GACHA[kind];
    const cost = (n === 10) ? g.ten : g.one;
    if ((u.points || 0) < cost) {
        if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
        else showCustomAlert('포인트가 모자랍니다.');
        return null;
    }
    u.points -= cost;
    const one = g.one, back = Math.floor(one / GACHA.BACK);
    const got = [], w = bag(u);
    let refund = 0;
    for (let i = 0; i < n; i++) {
        const it = pickOne(kind);
        if (!it) break;
        const dup = !!w[it.k];
        if (dup) refund += back;
        else w[it.k] = Date.now();
        got.push({ it: it, dup: dup });
    }
    u.points += refund;
    const names = got.map(function (x) { return x.it.n + (x.dup ? '(중복)' : ''); }).join(', ');
    try {
        addHistoryLog(u, '[' + g.n + '] ' + n + '회 (-' + won(cost) + ' P'
            + (refund ? ' · 중복 환급 +' + won(refund) + ' P' : '') + ') — ' + names);
        saveFields({ points: 1, wardrobe: 1, history: 1 });
        updateUI();
    } catch (e) { }
    return { got: got, cost: cost, refund: refund };
}

// ==========================================
// 얼굴 없는 몸에 입혀 보여 준다
// ==========================================
//
//   머리를 안 올린다 — 그래서 누구의 얼굴도 아니다.
//   여섯 칸을 돌려 **걷는 모습**으로 보여 준다. 움직이게 그려 주신 것은
//   그대로 움직이고, 가만히 있는 것은 가만히 있는 채로 보인다.
const VIEW = { x: 86, y: 100, w: 260, h: 272 };     // 사람이 들어오는 네모 (칸 안 자리)
function spec() {
    try { if (typeof window.dotSpec === 'function') return window.dotSpec(); } catch (e) { }
    return { W: 352, H: 384, FOOT: 32 };
}

function fig(sheets, k) {
    const sp = spec();
    const SW = sp.W * 6, SH = sp.H * 2;
    const cut = document.createElement('div');
    cut.className = 'gc-cut';
    cut.style.width = Math.round(VIEW.w * k) + 'px';
    cut.style.height = Math.round(VIEW.h * k) + 'px';
    const box = document.createElement('div');
    box.className = 'gc-fig';
    box.style.width = (sp.W * k) + 'px';
    box.style.height = (sp.H * k) + 'px';
    box.style.left = (-VIEW.x * k) + 'px';
    box.style.top = (-VIEW.y * k) + 'px';
    const els = sheets.map(function (s) {
        const e = document.createElement('div');
        e.className = 'gc-layer';
        e.style.backgroundImage = 'url("dot/' + s + '.png")';
        e.style.backgroundSize = (SW * k) + 'px ' + (SH * k) + 'px';
        box.appendChild(e);
        return e;
    });
    let f = 0;
    const put = function () {
        els.forEach(function (e) { e.style.backgroundPosition = '-' + (f * sp.W * k) + 'px 0px'; });
    };
    put();
    cut._t = setInterval(function () { f = (f + 1) % 6; put(); }, 140);
    cut.appendChild(box);
    return cut;
}
function figStop(el) {
    if (!el) return;
    Array.prototype.forEach.call(el.querySelectorAll('.gc-cut'), function (c) { clearInterval(c._t); });
    if (el._t) clearInterval(el._t);
}

// 그 물건 하나를 몸에 입힌 그림 (의상이면 옷 장, 악세면 악세 장)
function sheetsOf(it) {
    return ['body'].concat(it.s || [it.k]);
}

// ==========================================
// 가게 창
// ==========================================
let shopKind = null;

function card(r) {
    const G = GACHA.GRADE[r.it.g] || GACHA.GRADE.C;
    const d = document.createElement('div');
    d.className = 'gc-card' + (r.dup ? ' dup' : '');
    d.innerHTML = '<div class="gc-g" style="color:' + G.c + ';border-color:' + G.c + '">' + G.n + '</div>'
        + '<div class="gc-pic"></div>'
        + '<div class="gc-nm">' + esc(r.it.n) + '</div>'
        + (r.dup ? '<div class="gc-dup">중복 · 환급</div>' : '<div class="gc-new">NEW</div>');
    d.querySelector('.gc-pic').appendChild(fig(sheetsOf(r.it), 0.36));
    return d;
}

function result(kind, out) {
    const ov = document.getElementById('gc-res');
    if (ov) { figStop(ov); ov.remove(); }
    const d = document.createElement('div');
    d.id = 'gc-res';
    d.innerHTML = '<div class="gc-rc">'
        + '<h4>' + esc(GACHA[kind].n) + ' — ' + out.got.length + '회</h4>'
        + '<div class="gc-grid"></div>'
        + '<div class="gc-sum">쓴 포인트 <b>' + won(out.cost) + ' P</b>'
        + (out.refund ? '<span class="sp">·</span>중복 환급 <b class="ok">+' + won(out.refund) + ' P</b>' : '')
        + '</div>'
        + '<button class="gc-btn go" id="gc-res-x">확인</button>'
        + '</div>';
    const grid = d.querySelector('.gc-grid');
    out.got.forEach(function (r) { grid.appendChild(card(r)); });
    document.body.appendChild(d);
    d.querySelector('#gc-res-x').onclick = function () { figStop(d); d.remove(); paintShop(); };
}

function listHtml(kind) {
    const u = u_(), list = POOL[kind];
    const by = { S: [], A: [], B: [], C: [] };
    list.forEach(function (x) { (by[x.g] || by.C).push(x); });
    return ['S', 'A', 'B', 'C'].map(function (g) {
        if (!by[g].length) return '';
        const G = GACHA.GRADE[g];
        return '<div class="gc-row"><span class="gc-g" style="color:' + G.c + ';border-color:' + G.c + '">'
            + G.n + '</span><div class="gc-its">' + by[g].map(function (x) {
                const own = isAdm(u) || has(x.k, u);
                return '<span class="' + (own ? 'on' : '') + '">' + esc(x.n)
                    + (x.set ? '<i>세트</i>' : '') + '</span>';
            }).join('') + '</div></div>';
    }).join('');
}

// ==========================================
// ★ 바로 사는 것 — 뽑기 말고 값을 치르고 가져간다
// ==========================================
//
//   토끼 전용 악세 둘뿐이다. 어둠 소속이 아니면 **줄 자체가 안 그려진다** —
//   토끼를 못 고르는 사람에게 보여 줄 까닭이 없다.
function buyHtml(kind) {
    const list = buyList(kind);
    if (!list.length) return '';
    const u = u_();
    return '<div class="gc-cp" style="margin-bottom:9px;">🌑 어둠 소속 전용 — 뽑기에는 안 나옵니다.</div>'
        + list.map(function (x) {
            const has = !!bag(u)[x.k];
            return '<div style="border:1px solid #3a3a3a; border-radius:6px; padding:9px 11px; margin-bottom:6px;">'
                + '<div style="font-size:12px; color:#fff; font-weight:bold;">' + esc(x.n) + '</div>'
                + '<div style="font-size:10px; color:#999; margin:4px 0 7px 0; line-height:1.6;">'
                + esc(x.d || '') + '</div>'
                + (has
                    ? '<button class="game-btn" style="width:100%; margin:0; padding:7px; font-size:11px;" disabled>이미 가지고 있습니다</button>'
                    : '<button class="game-btn gc-get" data-k="' + esc(x.k) + '"'
                      + ' style="width:100%; margin:0; padding:7px; font-size:11px;">'
                      + won(x.p) + ' P 에 산다</button>')
                + '</div>';
        }).join('');
}

function buyOne(kind, key) {
    const u = u_(); if (!u) return;
    const x = buyList(kind).filter(function (y) { return y.k === key; })[0];
    if (!x) { showCustomAlert('살 수 없는 물건입니다.'); return; }
    const w = bag(u);
    if (w[x.k]) { showCustomAlert('이미 가지고 있습니다.'); return; }
    if ((u.points || 0) < x.p) {
        if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
        else showCustomAlert('포인트가 모자랍니다.');
        return;
    }
    u.points -= x.p;
    w[x.k] = Date.now();
    try {
        addHistoryLog(u, '[' + GACHA[kind].n + '] ' + x.n + ' 구입 (-' + won(x.p) + ' P)');
        saveFields({ points: 1, wardrobe: 1, history: 1 });
        updateUI();
    } catch (e) { }
    paintShop();
    showCustomAlert(x.n + '을(를) 샀습니다.\n\n옷장 — 악세 칸에서 답니다.\n토끼일 때만 보입니다.');
}

function paintShop() {
    const box = document.getElementById('gc-body');
    if (!box || !shopKind) return;
    const u = u_(), g = GACHA[shopKind], list = POOL[shopKind];
    const mine = list.filter(function (x) { return has(x.k, u); }).length;
    const cp = couple();
    box.innerHTML =
        '<div class="gc-top">'
        + '<div class="gc-pt">가진 포인트 <b>' + won((u && u.points) || 0) + ' P</b></div>'
        + '<div class="gc-have">모은 것 <b>' + mine + '</b> / ' + list.length + '</div>'
        + '</div>'
        // ★ 「세 배 잘 나온다」가 아니라 **등급 안에서 세 배 몫**이다.
        //   등급이 나올 확률(S 2% …)은 그대로이므로, 나온 뒤에 그쪽일 때가
        //   많아지는 것이다. 숨기지 않고 그대로 적는다.
        + (cp ? '<div class="gc-cp">💍 커플링 — 드레스 · 턱시도 · 면사포 · 검은 구두 · 검은 장갑이 '
                + '같은 등급 안에서 <b>' + GACHA.COUPLE_X + '배 몫</b>을 받습니다.</div>' : '')
        + '<div class="gc-buy">'
        + '<button class="gc-btn" data-n="1">1회<b>' + won(g.one) + ' P</b></button>'
        + '<button class="gc-btn go" data-n="10">10연속<b>' + won(g.ten) + ' P</b></button>'
        + '</div>'
        + '<div class="gc-note">같은 것이 또 나오면 <b>' + won(Math.floor(g.one / GACHA.BACK))
        + ' P</b> 를 돌려 드립니다.<br>등급 확률 — S ' + GACHA.ODDS.S + '% · A ' + GACHA.ODDS.A
        + '% · B ' + GACHA.ODDS.B + '% · C ' + GACHA.ODDS.C + '%</div>'
        + buyHtml(shopKind)
        + '<div class="gc-list">' + listHtml(shopKind) + '</div>';
    // ★ **그 단추 위에서 눌렀다 뗀 것**만 뽑기로 친다.
    //
    //   한 장에 30,000 P 가 나가는 단추다. 다른 데서 눌린 손가락이
    //   흘러들어 눌리는 일이 없게, 눌림(pointerdown)이 이 단추에서
    //   시작했을 때만 받는다. (광장 입구를 누르자마자 그 밑에 가게가
    //   깔리면서 「1회」가 저절로 눌리던 일이 있었다 — plaza.js 쪽도
    //   손을 뗄 때 열도록 고쳤고, 여기는 두 번째 자물쇠다.)
    // 바로 사는 것 — 뽑기와 같은 자물쇠를 건다 (눌림이 그 단추에서 시작해야 한다)
    Array.prototype.forEach.call(box.querySelectorAll('.gc-get'), function (b) {
        let mine = false;
        b.addEventListener('pointerdown', function () { mine = true; });
        b.addEventListener('pointercancel', function () { mine = false; });
        b.onclick = function (ev) {
            if (ev && ev.pointerType !== undefined && !mine) return;
            if (ev && ev.detail > 0 && !mine) return;
            mine = false;
            if (typeof buyGuard === 'function' && !buyGuard()) return;
            buyOne(shopKind, b.dataset.k);
        };
    });
    Array.prototype.forEach.call(box.querySelectorAll('.gc-buy button'), function (b) {
        let mine = false;
        b.addEventListener('pointerdown', function () { mine = true; });
        b.addEventListener('pointercancel', function () { mine = false; });
        b.onclick = function (ev) {
            // 손가락·마우스로 누른 것이 아니면(자판 등) 눌림이 없다 — 그건 받는다
            if (ev && ev.pointerType !== undefined && !mine) return;
            if (ev && ev.detail > 0 && !mine) return;
            mine = false;
            if (typeof buyGuard === 'function' && !buyGuard()) return;
            const out = roll(shopKind, Number(b.dataset.n));
            if (out) result(shopKind, out);
        };
    });
}

function open(kind) {
    if (!u_()) return;
    if (typeof DOT_SLOTS === 'undefined') { showCustomAlert('옷장이 아직 안 올라왔습니다.'); return; }
    shopKind = kind;
    const old = document.getElementById('gc-ov'); if (old) old.remove();
    const d = document.createElement('div');
    d.id = 'gc-ov';
    d.innerHTML = '<div class="gc-card-big">'
        + '<div class="gc-head"><span class="pico" style="--ic:url(\'ico/' + GACHA[kind].ic + '.png\')"></span>'
        + esc(GACHA[kind].n) + '<button id="gc-x">✕</button></div>'
        + '<div id="gc-body"></div></div>';
    document.body.appendChild(d);
    d.addEventListener('pointerdown', function (e) { if (e.target === d) { figStop(d); d.remove(); } });
    d.querySelector('#gc-x').onclick = function () { figStop(d); d.remove(); };
    paintShop();
}

window.wearShopOpen = function () { open('wear'); };
window.accShopOpen = function () { open('acc'); };

// ==========================================
// 옷장 칸에 악세 마흔아홉 가지를 얹는다
// ==========================================
//
//   의상 쪽은 closet.js 에 이미 있던 줄에 own 만 붙여 두었다.
//   악세는 가짓수가 많아 여기서 한 번에 밀어 넣는다.
(function fillSlots() {
    if (typeof DOT_SLOTS === 'undefined') return;
    const acc = DOT_SLOTS.filter(function (s) { return s.k === 'acc'; })[0];
    if (!acc) return;
    GACHA_ACC.forEach(function (x) {
        // ★ **열쇠(i)와 가진 표(own) 둘 다** 견준다.
        //   갓은 옷장에 이미 i:'gat' 으로 들어 있고 own 만 'han-gat' 이다.
        //   i 만 보면 못 알아보고 똑같은 줄을 하나 더 밀어 넣는다.
        if (acc.items.some(function (y) { return y.i === x.k || y.own === x.k; })) return;
        // cat 은 가방에서 「머리 · 귀 · 얼굴 · 목 · 손 · 등」으로 갈라 보일 때 쓴다
        acc.items.push({ i: x.k, n: x.n, top: [x.k], own: x.k, cat: x.c });
    });
})();

// ==========================================
// 가게 둘을 목록과 망상 홈쇼핑 안에 놓는다
// ==========================================
(function place() {
    if (typeof PLAZA === 'undefined') return;
    const M = PLAZA.MENU, R = PLAZA.ROOMS;
    const rows = [
        { n: '의상숍',     i: '👗', ic: 'wearshop', fn: 'wearShopOpen' },
        { n: '악세서리숍', i: '💍', ic: 'accshop',  fn: 'accShopOpen' }
    ];
    // ★ 목록(☰)에는 **안 넣는다.** 두 가게는 망상 홈쇼핑 안에 서 있으므로
    //   목록에까지 두면 같은 데로 가는 줄이 셋이 된다.
    //   ✗ 전에는 망상 홈쇼핑 바로 뒤에 두 줄을 끼워 넣었다.
    const put = rows.slice();
    // ── 망상 홈쇼핑 안 — 홈쇼핑 · 의상숍 · 악세서리숍 세 자리가 한 줄에 선다
    const r = R && R.dshop;
    if (!r) return;
    const add = put.filter(function (x) {
        return !(r.spots || []).some(function (s) { return s.fn === x.fn; });
    }).map(function (x) { return { x: 0, n: x.n, ic: x.ic, fn: x.fn }; });
    if (add.length) r.spots.splice.apply(r.spots, [1, 0].concat(add));
    // 나가는 자리(go)는 제자리에 두고, 가게만 고르게 벌린다
    r.spots.filter(function (s) { return !s.go; })
        .forEach(function (s, i) { s.x = 560 + i * 380; });
})();

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('gc-css')) return;
    const s = document.createElement('style');
    s.id = 'gc-css';
    s.textContent = [
        '#gc-ov,#gc-res{position:fixed;inset:0;z-index:10006;display:flex;align-items:center;',
        '  justify-content:center;background:rgba(4,4,8,.86);padding:16px;}',
        '#gc-res{z-index:10007;}',
        '.gc-card-big,.gc-rc{width:min(94vw,430px);max-height:90dvh;overflow-y:auto;',
        '  display:flex;flex-direction:column;gap:11px;padding:15px 14px;border-radius:17px;',
        '  background:linear-gradient(180deg,#15151f,#0a0a10);border:1px solid #2b2b38;}',
        '.gc-head{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:bold;color:#ffe9bd;}',
        '.gc-head button{margin-left:auto;width:32px;height:32px;border-radius:50%;cursor:pointer;',
        '  background:rgba(255,255,255,.05);border:1px solid #2b2b38;color:#ded5c4;font-family:inherit;}',
        '.gc-top{display:flex;gap:9px;font-size:11.5px;color:#9a9284;}',
        '.gc-top b{color:#ffe9bd;}',
        '.gc-have{margin-left:auto;}',
        '.gc-cp{padding:8px 10px;border-radius:9px;font-size:11px;line-height:1.6;',
        '  background:rgba(217,160,90,.12);border:1px solid #6a5226;color:#ffd79a;}',
        '.gc-buy{display:flex;gap:8px;}',
        '.gc-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;',
        '  padding:12px 0;border-radius:12px;font-size:12.5px;cursor:pointer;font-family:inherit;',
        '  background:rgba(255,255,255,.05);border:1px solid #2b2b38;color:#ded5c4;}',
        '.gc-btn b{font-size:11px;color:#9a9284;font-weight:normal;}',
        '.gc-btn.go{background:linear-gradient(145deg,#4a3a1e,#2a2112);border-color:#8a6a2a;color:#ffe9bd;}',
        '.gc-btn.go b{color:#d9b375;}',
        '.gc-note{font-size:10.5px;color:#8d8578;line-height:1.7;text-align:center;}',
        '.gc-list{display:flex;flex-direction:column;gap:7px;}',
        '.gc-row{display:flex;gap:8px;align-items:flex-start;}',
        '.gc-g{flex:0 0 auto;width:22px;height:22px;border-radius:7px;border:1px solid;',
        '  display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;}',
        '.gc-its{display:flex;flex-wrap:wrap;gap:4px;}',
        '.gc-its span{padding:3px 7px;border-radius:7px;font-size:10.5px;color:#6f685c;',
        '  background:rgba(255,255,255,.03);border:1px solid #23232e;}',
        '.gc-its span.on{color:#ded5c4;border-color:#4a4436;background:rgba(255,255,255,.06);}',
        '.gc-its i{font-style:normal;margin-left:4px;font-size:9px;color:#d9a05a;}',
        // ── 뽑힌 것
        '.gc-grid{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;}',
        '.gc-card{width:100px;display:flex;flex-direction:column;align-items:center;gap:2px;overflow:hidden;',
        '  padding:7px 4px 8px 4px;border-radius:11px;',
        '  background:rgba(255,255,255,.04);border:1px solid #2b2b38;}',
        '.gc-card.dup{opacity:.62;}',
        '.gc-pic{display:flex;justify-content:center;}',
        '.gc-nm{font-size:9.5px;color:#ded5c4;text-align:center;line-height:1.3;}',
        '.gc-new{font-size:9px;font-weight:bold;color:#ffd479;}',
        '.gc-dup{font-size:9px;color:#8d8578;}',
        '.gc-sum{font-size:11.5px;color:#9a9284;text-align:center;}',
        '.gc-sum b{color:#ffe9bd;} .gc-sum b.ok{color:#9fe0a8;} .gc-sum .sp{opacity:.4;margin:0 7px;}',
        // 얼굴 없는 몸
        '.gc-cut{position:relative;overflow:hidden;flex:0 0 auto;}',
        '.gc-fig{position:absolute;}',
        '.gc-layer{position:absolute;inset:0;background-repeat:no-repeat;',
        '  image-rendering:pixelated;image-rendering:crisp-edges;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 콘솔
// ==========================================
window.gachaState = function () {
    const u = u_(); if (!u) { console.log('로그인 먼저'); return; }
    console.log('%c===== 📺 뽑기 =====', 'color:#ffcf8f; font-size:13px');
    console.log('  커플링 :', couple() ? 'O (세트 ' + GACHA.COUPLE_X + '배)' : '✗');
    ['wear', 'acc'].forEach(function (k) {
        const list = POOL[k];
        const mine = list.filter(function (x) { return has(x.k, u); });
        const by = {};
        list.forEach(function (x) { by[x.g] = (by[x.g] || 0) + 1; });
        console.log('  ' + GACHA[k].n + ' :', mine.length + ' / ' + list.length,
            '· 등급', JSON.stringify(by));
    });
    console.log('  가진 것 :', Object.keys(bag(u)).join(' · ') || '없음');
};

window.gachaOdds = function (kind) {
    const k = kind === 'acc' ? 'acc' : 'wear';
    const cp = couple();
    const rows = [];
    ['S', 'A', 'B', 'C'].forEach(function (g) {
        const on = POOL[k].filter(function (x) { return x.g === g; });
        let sum = 0; on.forEach(function (x) { sum += weightOf(x, cp); });
        on.forEach(function (x) {
            rows.push({ 등급: g, 이름: x.n, 세트: x.set ? 'O' : '',
                        확률: (GACHA.ODDS[g] * weightOf(x, cp) / sum).toFixed(3) + '%' });
        });
    });
    console.log('%c===== ' + GACHA[k].n + ' 확률' + (cp ? ' (커플링 O)' : '') + ' =====',
        'color:#ffcf8f; font-size:13px');
    console.table(rows);
};

window.gachaGive = function (key) {
    const u = u_(); if (!u) return;
    if (!isAdm(u)) { console.warn('상담사만.'); return; }
    bag(u)[key] = Date.now();
    try { saveFields({ wardrobe: 1 }); } catch (e) { }
    console.log('넣었습니다 —', key);
};

console.log('[뽑기] 의상숍 ' + GACHA.wear.one + ' P · 악세서리숍 ' + GACHA.acc.one
    + ' P — gachaState() · gachaOdds()');

})();
