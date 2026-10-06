// ==========================================
// ★ 칭호 시스템
// index.html 에서 맨 뒤(save-merge.js 앞)에 불러온다
// ==========================================
//
// 칭호 15종은 조건을 채우면 저절로 붙는다. 부가 기능은 없다.
// 상담사가 손으로 붙이는 칭호 3종은 따로 있다.
//
// ■ 세는 시점
//   누적 횟수를 세는 칭호들은 「이 파일이 올라간 날」부터 센다.
//   지난 기록은 어디에도 남아 있지 않아 거슬러 셀 수 없다.
//   처음 들어온 사원은 그 자리에서 0 부터 시작한다.
//
// ■ 저장되는 자리
//   currentUser.ti        누적 횟수 묶음
//   currentUser.titles    저절로 얻은 칭호
//   currentUser.titleAdmin 상담사가 붙인 칭호
//
// ■ 보는 곳
//   사원증 화면 위쪽에 줄이 하나 생긴다.
//   콘솔에서는 myTitles() · titleProgress()

(function titles() {

const HOUR = 3600 * 1000, DAY = 24 * HOUR;

// ==========================================
// 칭호 표
// ==========================================
//
// need 는 화면에 보여 줄 조건 글이고, check 가 실제 판정이다.
const DEFS = [
    { id:'saint',   n:'성자',        need:'구출 200회',
      check:(u,s)=> s.resc >= 200 },

    { id:'collect', n:'콜렉터',      need:'우주 쇼핑몰 물품 전부 보유 (상담사 전용 제외)',
      check:(u)=> poolSettled && allOwned(u, alienPool()) },

    { id:'frame',   n:'프레임',      need:'테두리 전부 보유 (영상 테두리 포함)',
      check:(u)=> framesAll(u) },

    { id:'spy',     n:'스파이',      need:'반대 소속 물품 전부 보유',
      check:(u)=> { if (!poolSettled) return false;
                    const o = otherSideItems(u); return o.length > 0 && allOwned(u, o); } },

    { id:'mola',    n:'개복치',      need:'어둠에서 50번 사망',
      check:(u,s)=> s.dead >= 50 },

    { id:'tamer',   n:'조련사',      need:'펫 전부 보유',
      check:(u)=> petsAllOwned(u) },            // 펫 시스템이 생기면 켜진다

    { id:'weapon',  n:'웨폰 마스터', need:'전용 장비 세 자리 전부 L',
      check:(u)=> allAttrsL(u) },

    { id:'virile',  n:'정력왕',      need:'임신시킨 횟수 500',
      check:(u,s)=> s.sire >= 500 },

    { id:'fertile', n:'다산왕',      need:'임신한 횟수 500',
      check:(u,s)=> s.bear >= 500 },

    { id:'lucky',   n:'럭키',        need:'주사위 15 이상 100회',
      check:(u,s)=> s.d15 >= 100 },

    { id:'breaker', n:'파괴왕',      need:'기믹 파훼 300회',
      check:(u,s)=> s.smash >= 300 },

    { id:'helper',  n:'도우미',      need:'헬퍼로 100회 동행',
      check:(u,s)=> s.help >= 100 },

    { id:'pure',    n:'순수',        need:'10일간 오염도 100 미도달',
      check:(u,s)=> s.pureFrom > 0 && Date.now() - s.pureFrom >= 10 * DAY },

    { id:'health',  n:'건강',        need:'10일간 포만도 0 미도달',
      check:(u,s)=> s.healthFrom > 0 && Date.now() - s.healthFrom >= 10 * DAY },

    { id:'exorc',   n:'퇴마',        need:'작두·버터 나이프로 파훼 250회',
      check:(u,s)=> s.exor >= 250 },

    { id:'gold',    n:'金緞',        need:'은행 VIP 승인 (2급 보안 인가와 다름)',
      check:(u)=> isVip(u) }
];

// 상담사가 손으로 붙이는 것
const ADMIN_TITLES = ['또류', '뉴비', '고인물', '전설', '이레귤러', '페르소나'];

// 상담사 칭호에 붙는 그림
//
// 저장되는 이름은 그대로 두고 보일 때만 앞에 붙인다.
// 이름을 바꾸면 이미 받아 간 사람의 titleAdmin 과 어긋난다.
const ADMIN_ICON = { '또류': '🐋', '뉴비': '🌱', '고인물': '👑', '전설': '🎤', '이레귤러': '⛓️‍💥',
                     '페르소나': '🎭' };

// 상담사 칭호에 붙는 설명 — 적지 않으면 아무것도 안 붙는다
const ADMIN_DESC = { '페르소나': '대학교 이벤트 MVP 전용 칭호.' };

// 이름을 바꾼 칭호 — 예전 이름으로 받아 간 사람을 새 이름으로 옮긴다
const RENAMED = { '신입': '뉴비' };

function label(n) {
    if (!n) return '';
    const ic = ADMIN_ICON[n];
    return ic ? ic + ' ' + n : n;
}

// ==========================================
// 조건 판정에 쓰는 것들
// ==========================================
function owned(u) {
    const m = {};
    (u.inventory || []).forEach(function (n) { m[n] = true; });
    (u.equippedWeapons || []).forEach(function (w) {
        m[(typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w] = true;
    });
    return m;
}
function allOwned(u, list) {
    if (!list || !list.length) return false;
    const m = owned(u);
    return list.every(function (n) { return m[n]; });
}
// ==========================================
// 콜렉터 — 상담사 전용만 뺀다
// ==========================================
//
// 아무에게도 진열되지 않는 것은 두 가지뿐이다. (index.html:9076·9153)
//     여우구슬 · 금고   →  상담사(kario0987) 에게만 나온다
// 이 둘은 평사원이 손에 넣을 길이 없으므로 셈에서 뺀다.
//
// 소속·직급·팀으로 막히는 것들(작두 · 버터 나이프 · 은반지 · 노스텔지어 끈 …)은
// 그대로 센다. 진열이 안 되더라도 선물이나 거래로 넘겨받을 수 있고,
// 사원마다 분모가 달라지는 것도 피한다.
//
// ITEM_CATALOG 에 없는 이름은 진열 단계에서 그냥 지워지므로 (index.html:9165)
// 영원히 가질 수 없다. 그것만 함께 뺀다.
const ADMIN_ONLY = ['여우구슬', '금고'];

// 진열 확률이 0.1% 라 사실상 막혀 있는 것 (newitems2.js RARE_RATE)
const TOO_RARE = ['황룡의 눈', '산군의 도움'];

// ==========================================
// 컬렉터 — 테두리 전부
// ==========================================
//
// 테두리는 견본첩 하나에서만 나온다. frDraw() 가 FRAMES 전체에서 뽑으므로
// 영상 테두리까지 전부 뽑을 수 있다. (frames.js:154)
//
// 다만 등급 가중치가 이렇다. (frames.js:7)
//     D 60  ·  C 25  ·  B 10  ·  A 4.5  ·  S 0.5  ·  L 0.05
// 같은 등급끼리 다시 나눠 가지므로 L 한 종이 0.017%, 평균 6,000권이다.
// 47종을 다 모으려면 중앙값 9,500권쯤 든다.
//
// 너무 멀면 아래에서 등급을 빼면 된다. 뺀 등급은 세지 않는다.
//     TITLE_FRAME_SKIP = ['L']        L등급은 빼고 센다
//     TITLE_FRAME_SKIP = ['S', 'L']   S·L 둘 다 뺀다
if (window.TITLE_FRAME_SKIP === undefined) window.TITLE_FRAME_SKIP = [];

// 테두리 표도 여러 파일이 나눠서 채운다 (frames · frames-video 1·2·3)
let framesSettled = false;
(function settleFrames() {
    let last = -1, same = 0;
    const iv = setInterval(function () {
        const n = (typeof FRAMES !== 'undefined') ? FRAMES.length : -1;
        if (n === last) same++; else { last = n; same = 0; }
        if (n > 0 && same >= 5) {            // 6초쯤 변동이 없으면 다 찬 것으로 본다
            framesSettled = true;
            clearInterval(iv);
            check();
        }
    }, 1200);
})();

function frameTargets() {
    if (typeof FRAMES === 'undefined') return [];
    const skip = window.TITLE_FRAME_SKIP || [];
    return FRAMES.filter(function (f) { return skip.indexOf(f.g) < 0; });
}

function frameHave(u) {
    const own = (u && u.frames && u.frames.owned) || {};
    return frameTargets().filter(function (f) { return own[f.id] > 0; }).length;
}

function framesAll(u) {
    if (!framesSettled) return false;
    const t = frameTargets();
    if (!t.length) return false;
    return frameHave(u) >= t.length;
}

// 풀은 여러 파일이 나눠서 채운다. (newitems · newitems2 · sapphire · skin …)
// 다 차기 전에 세면 적게 세어 그냥 칭호를 줘 버리므로, 멈춘 뒤에 센다.
let poolSettled = false;
(function settle() {
    let last = -1, same = 0;
    const iv = setInterval(function () {
        const n = (typeof ALIEN_ITEMS_POOL !== 'undefined') ? ALIEN_ITEMS_POOL.length : -1;
        if (n === last) same++; else { last = n; same = 0; }
        if (n > 0 && same >= 5) {            // 6초쯤 변동이 없으면 다 찬 것으로 본다
            poolSettled = true;
            clearInterval(iv);
            check();
        }
    }, 1200);
})();

let poolCache = null, poolKey = 0;
function alienPool() {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return [];
    if (poolKey === ALIEN_ITEMS_POOL.length && poolCache) return poolCache.slice();

    const out = ALIEN_ITEMS_POOL.filter(function (n) {
        if (ADMIN_ONLY.indexOf(n) >= 0) return false;
        if (TOO_RARE.indexOf(n) >= 0) return false;
        if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[n]) return false;
        return true;
    });

    poolKey = ALIEN_ITEMS_POOL.length;
    poolCache = out;
    const cut = ALIEN_ITEMS_POOL.length - out.length;
    console.log('[칭호] 콜렉터 — ' + out.length + '종'
        + (cut > 0 ? ' (목록 ' + ALIEN_ITEMS_POOL.length + '종 중 상담사 전용·극희귀·진열 불가 '
                     + cut + '종 제외)' : ''));
    return out.slice();
}

// 반대 소속 물품 — EQUIP_AFFIL 에 적힌 소속이 내 쪽이 아닌 것
//
// 콜렉터와 같은 이유로 극희귀품과 상담사 전용은 뺀다.
// 하나라도 못 구하는 것이 섞이면 칭호 자체가 막힌다.
function otherSideItems(u) {
    if (typeof EQUIP_AFFIL === 'undefined') return [];
    const where = (u.affiliation || '') + ' ' + (u.team || '');
    const out = [];
    Object.keys(EQUIP_AFFIL).forEach(function (n) {
        const need = EQUIP_AFFIL[n];
        if (!need) return;
        if (TOO_RARE.indexOf(n) >= 0) return;
        if (ADMIN_ONLY.indexOf(n) >= 0) return;
        if (where.indexOf(need) < 0) out.push(n);   // 내가 못 쓰는 쪽 = 반대 소속
    });
    return out;
}

// ==========================================
// 웨폰 마스터 — 세 자리가 다 L 이어야 한다
// ==========================================
//
// 전용 장비는 자리가 셋까지 열린다. (thirdslot.js)
// 첫 자리의 등급은 본체 등급(g.grade)이고, 둘째·셋째는 g.attrGrades 에 따로 있다.
// gearAttrGrade 가 그 규칙을 담고 있지만 dark.js 안쪽에 있어 밖에서 안 닿을 수도 있어서
// 같은 식을 여기에 둔다.
//
// 전에는 첫 자리를 두 번 셌다. (gearAttrGrade 가 이미 본체 등급을 돌려주는데
// 거기에 g.grade === 'L' 을 또 더했다.) 분모도 열린 자리 수에 맞춰 움직여서
// 한 자리만 열어 둔 사람은 2/2 가 되어 그 자리에서 칭호를 받아 버렸다.
const GEAR_SLOTS = 3;

function attrGradeOf(g, attr) {
    if (!g || !g.attrs) return 'D';
    // ⛓️‍💥 이레귤러가 올려 놓은 본체 등급은 빼고 원래 값으로 본다
    const body = (g.gradeReal !== undefined) ? g.gradeReal : g.grade;
    const i = g.attrs.indexOf(attr);
    if (i <= 0) return body;                          // 첫 자리는 본체 등급
    return (g.attrGrades && g.attrGrades[attr]) || 'D';
}

function gearOf(u) {
    return (u && u.soulGear) ? u.soulGear : null;
}

// 지금 L 인 자리가 몇 개인가
function lSlots(u) {
    const g = gearOf(u);
    if (!g || !Array.isArray(g.attrs)) return 0;
    return g.attrs.filter(function (a) { return attrGradeOf(g, a) === 'L'; }).length;
}

function allAttrsL(u) {
    const g = gearOf(u);
    if (!g || !Array.isArray(g.attrs)) return false;
    // ⛓️‍💥 이레귤러가 만든 L 은 attrGradeOf 가 걸러 낸다 (gradeReal 을 본다).
    // 그래서 이 칭호만으로는 붙지 않고, 제 힘으로 세 자리를 L 로 만든
    // 사람은 이 칭호를 달고 있어도 칭호를 잃지 않는다.
    if (g.attrs.length < GEAR_SLOTS) return false;    // 자리를 다 열지 않았으면 아직이다
    return lSlots(u) >= GEAR_SLOTS;
}

// ==========================================
// 金緞 — 은행 VIP
// ==========================================
//
// 전에는 u.hasVIP 를 먼저 봤다. 그것은 2급 보안 인가(VIP 라운지 출입증)이고
// 은행과 아무 상관이 없다. 당국이 손으로 발급하는 것이다. (index.html:6989)
// 그래서 은행 등급이 1등급이든 계좌가 아예 없든 칭호가 붙었다.
//
// 그리고 bankGrade() 는 등급 「객체」를 돌려준다. 'VIP' 와 비교하면
// 영원히 거짓이라 뒤의 줄은 애초에 돌지 않았다.
//
// 은행 VIP 는 bank/{사번}.vip 에 승인 기록이 붙은 상태다. (bank.js:663)
// 블랙리스트에 오르면 그 자리가 지워진다. (bank.js:129)
const vipSeen = {};        // 사번 → true / false

function isVip(u) {
    if (!u) return false;
    try {
        if (typeof bankState !== 'undefined' && bankState
            && currentUser && u.code === currentUser.code) {
            return !!(bankState.vip && !bankState.blacklist);
        }
    } catch (e) { }
    return vipSeen[u.code] === true;
}

// 은행 화면을 한 번도 열지 않아도 판정이 돌게, 내 계좌를 따로 지켜본다
(function watchBank() {
    let key = null;
    setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (!currentUser) return;
        if (key === currentUser.code) return;
        key = currentUser.code;
        database.ref('bank/' + key).on('value', function (s) {
            const b = s.val();
            vipSeen[key] = !!(b && b.vip && !b.blacklist);
            repair();          // 잘못 붙은 것을 떼어 낸다 (딱 한 번)
            check();
        });
    }, 1500);
})();

// ==========================================
// 잘못 붙은 칭호 회수
// ==========================================
//
// 위의 두 가지는 조건이 틀려 있었으므로 이미 받아 간 사람이 있다.
// 지금 조건으로 다시 재어 보고 아니면 뗀다.
// 계좌를 읽은 뒤에 한 번만 돈다. 먼저 돌면 VIP 인 사람을 잘못 뗀다.
// 누적 횟수로 받는 칭호(구출·사망 …)는 건드리지 않는다.
let repaired = false;
// 예전 이름으로 받아 간 상담사 칭호를 새 이름으로 옮긴다
(function rename() {
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        if (!Array.isArray(currentUser.titleAdmin)) return;
        let moved = 0;
        currentUser.titleAdmin = currentUser.titleAdmin.map(function (n) {
            if (!RENAMED[n]) return n;
            moved++;
            return RENAMED[n];
        });
        if (RENAMED[currentUser.titleOn]) currentUser.titleOn = RENAMED[currentUser.titleOn];
        if (!moved) return;
        save({ titleAdmin: 1, titleOn: 1 });
        paint();
        console.log('[칭호] 이름이 바뀐 칭호 ' + moved + '개를 옮겼습니다.');
    }, 1500);
})();

function repair() {
    if (repaired || !currentUser) return;
    if (!Array.isArray(currentUser.titles)) return;   // 아직 안 읽혔으면 다음 기회에
    repaired = true;

    const take = [];
    [['gold', isVip], ['weapon', allAttrsL]].forEach(function (p) {
        const i = currentUser.titles.indexOf(p[0]);
        if (i < 0) return;
        let ok = false;
        try { ok = !!p[1](currentUser); } catch (e) { ok = false; }
        if (!ok) { currentUser.titles.splice(i, 1); take.push(p[0]); }
    });
    if (!take.length) return;

    const names = take.map(function (id) {
        const d = DEFS.filter(function (x) { return x.id === id; })[0];
        return d ? d.n : id;
    });
    // 떼어 낸 것을 달고 있었다면 벗긴다
    const f = { titles:1 };
    if (currentUser.titleOn && names.indexOf(currentUser.titleOn) >= 0) {
        currentUser.titleOn = '';
        f.titleOn = 1;
    }
    save(f);
    paint();
    console.log('[칭호] 조건이 맞지 않아 회수 — ' + names.join(', '));
}

// 펫 시스템이 아직 없으면 항상 거짓
function petsAllOwned(u) {
    if (typeof PET_SPECIES === 'undefined') return false;
    const have = {};
    (u.pets || []).forEach(function (p) { if (p && p.sp) have[p.sp] = true; });
    return PET_SPECIES.length > 0 && PET_SPECIES.every(function (s) { return have[s.id || s]; });
}

// ==========================================
// 누적 횟수 묶음
// ==========================================
function ti(u) {
    u = u || currentUser;
    if (!u) return {};
    if (!u.ti) {
        u.ti = { resc:0, dead:0, sire:0, bear:0, d15:0, smash:0, help:0, exor:0,
                 pureFrom:Date.now(), healthFrom:Date.now(), _born:Date.now() };
        save({ ti:1 });
        console.log('[칭호] 오늘부터 셉니다.');
    }
    if (!u.ti.pureFrom) u.ti.pureFrom = Date.now();
    if (!u.ti.healthFrom) u.ti.healthFrom = Date.now();
    return u.ti;
}
function save(f) {
    if (typeof saveFields === 'function') { try { saveFields(f); } catch (e) { } }
}
let pending = null;
function bump(key, n) {
    if (!currentUser) return;
    const s = ti(currentUser);
    s[key] = (s[key] || 0) + (n || 1);
    // 자잘한 증가를 모아서 한 번에 저장한다
    if (pending) clearTimeout(pending);
    pending = setTimeout(function () { pending = null; save({ ti:1 }); check(); }, 4000);
}

// 남의 누적도 올려야 하는 경우 (임신시킨 쪽)
function bumpOther(code, key) {
    if (!database || !code || !db.users[code]) return;
    const u = db.users[code];
    if (!u.ti) u.ti = { resc:0, dead:0, sire:0, bear:0, d15:0, smash:0, help:0, exor:0,
                        pureFrom:Date.now(), healthFrom:Date.now(), _born:Date.now() };
    u.ti[key] = (u.ti[key] || 0) + 1;
    if (typeof updateUserFields === 'function') updateUserFields(code, { ti: u.ti });
}

// ==========================================
// 칭호 판정 · 지급
// ==========================================
let announcing = false;
function check() {
    if (!currentUser) return;
    const s = ti(currentUser);
    if (!Array.isArray(currentUser.titles)) currentUser.titles = [];

    const got = [];
    DEFS.forEach(function (d) {
        if (currentUser.titles.indexOf(d.id) >= 0) return;
        let ok = false;
        try { ok = !!d.check(currentUser, s); } catch (e) { ok = false; }
        if (ok) { currentUser.titles.push(d.id); got.push(d); }
    });
    if (!got.length) return;

    save({ titles:1 });
    if (typeof addHistoryLog === 'function') {
        got.forEach(function (d) { addHistoryLog(currentUser, '[칭호] ' + d.n + ' 획득'); });
        save({ history:1 });
    }
    paint();
    announce(got);
}

function announce(list) {
    if (announcing) { setTimeout(function () { announce(list); }, 1500); return; }
    announcing = true;
    const d = list[0];
    const rest = list.slice(1);
    setTimeout(function () {
        showCustomAlert('[' + d.n + ']\n\n칭호를 얻었습니다.\n\n' + d.need);
        announcing = false;
        if (rest.length) announce(rest);
    }, 400);
}

// ==========================================
// 세는 자리들
// ==========================================
function hook(name, fn) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._ti) { clearInterval(iv); return; }
        const _o = f;
        window[name] = function () { return fn.call(this, _o, arguments); };
        window[name]._ti = true;
        clearInterval(iv);
    }, 600);
}

// 주사위 15 이상 — 거의 모든 판정이 luckReroll 을 지난다
hook('luckReroll', function (_o, a) {
    const r = _o.apply(this, a);
    if (typeof r === 'number' && r >= 15) bump('d15');
    return r;
});

// 개복치 — 「입원중」이 될 때 센다
//
// 전에는 finishDarkDeath 하나만 보았다. 그런데 어둠에서 쓰러지는 길이
// 여러 개라 그 함수를 지나지 않는 경우가 많고, 쓰러져도 격리로 가지 않는
// 길도 있어서 거의 세어지지 않았다.
//
// 그래서 기준을 눈에 보이는 것으로 바꿨다 — 상담실이나 선녀탕에 간 뒤
// 상태가 「입원」이 되는 경우다. (index.html:4675 getQuarantineBadge)
//     입원  = quarantineHospital 이거나 나올 때 오염도가 40 이상
//     상담중 · 온천욕 은 세지 않는다
// 격리 한 번에 한 번만 센다 (quarantineUntil 값을 열쇠로 쓴다).
(function mola() {
    function hospital(u) {
        return !!u.quarantineHospital || (u.quarantineExitPollution || 0) >= 40;
    }
    setInterval(function () {
        if (!currentUser) return;
        const until = currentUser.quarantineUntil || 0;
        if (!until || Date.now() >= until) return;        // 격리 중이 아니다
        if (!hospital(currentUser)) return;               // 상담중 · 온천욕
        const s = ti(currentUser);
        if (s.deadKey === until) return;                  // 이 격리는 이미 셌다
        s.deadKey = until;
        bump('dead');
        console.log('[칭호] 입원 ' + (s.dead || 0) + '회');
    }, 5000);
})();

// 구출 — epic 두 가지
['epicRescue', 'epicDoomRescue'].forEach(function (n) {
    hook(n, function (_o, a) {
        const before = (typeof er !== 'undefined' && er) ? (er.helped || 0) : 0;
        const r = _o.apply(this, a);
        setTimeout(function () {
            const after = (typeof er !== 'undefined' && er) ? (er.helped || 0) : before;
            if (after > before) bump('resc', after - before);
        }, 2600);
        return r;
    });
});

// 구출 — 은심장·이동장이 세던 자리에 같이 얹는다
(function watchSaves() {
    let last = null;
    setInterval(function () {
        if (!currentUser) { last = null; return; }
        const v = currentUser.heartSaves || 0;
        if (last === null) { last = v; return; }
        if (v > last) bump('resc', v - last);
        last = v;
    }, 3000);
})();

// 기믹 파훼 — 루비·사인참사검
hook('rubySmash', function (_o, a) {
    bump('smash');
    return _o.apply(this, a);
});

// 기믹 파훼 — 작두·버터 나이프 (퇴마와 파괴왕 둘 다 센다)
hook('useJakdu', function (_o, a) {
    const r = _o.apply(this, a);
    if (r === true) { bump('exor'); bump('smash'); }
    return r;
});

// 헬퍼 동행 — 탐사가 출발할 때 한 번
hook('launchPartyRun', function (_o, a) {
    const r = _o.apply(this, a);
    setTimeout(function () {
        if (typeof darkRun !== 'undefined' && darkRun && darkRun.helper) bump('help');
    }, 1500);
    return r;
});

// 임신 — 아이를 가진 쪽과 시킨 쪽을 함께 센다
(function watchPreg() {
    let last = null;
    setInterval(function () {
        if (!currentUser) { last = null; return; }
        const p = currentUser.preg;
        const list = (p && p.sires) || [];
        if (last === null) { last = list.length; return; }
        if (list.length > last) {
            const added = list.slice(last);
            bump('bear', added.length);
            added.forEach(function (x) { if (x && x.code) bumpOther(x.code, 'sire'); });
        }
        last = list.length;
    }, 4000);
})();

// 순수 · 건강 — 한 번이라도 닿으면 그날부터 다시 센다
(function watchClean() {
    setInterval(function () {
        if (!currentUser) return;
        const s = ti(currentUser);
        let moved = false;
        if ((currentUser.pollution || 0) >= 100) { s.pureFrom = Date.now(); moved = true; }
        if ((currentUser.satiety === undefined ? 100 : currentUser.satiety) <= 0) {
            s.healthFrom = Date.now(); moved = true;
        }
        if (moved) save({ ti:1 });
    }, 60000);
})();

// 주기 판정 — 보유형 칭호(콜렉터·스파이·웨폰 마스터·VIP)를 위해
setInterval(function () { if (currentUser) check(); }, 30000);

// ==========================================
// 사원증에 보이기
// ==========================================
// 가지고 있는 칭호 전부
function myList(u) {
    u = u || currentUser;
    if (!u) return [];
    const auto = (u.titles || []).map(function (id) {
        const d = DEFS.find(function (x) { return x.id === id; });
        return d ? d.n : null;
    }).filter(Boolean);
    return (u.titleAdmin || []).concat(auto);
}

// 지금 달고 있는 칭호 하나 — 없으면 null
//
// 얻었다고 저절로 달리지 않는다. 가진 것 중에서 직접 고른다.
// 달아 둔 것을 잃었거나(상담사가 회수) 하면 저절로 떨어진다.
function worn(u) {
    u = u || currentUser;
    if (!u || !u.titleOn) return null;
    return myList(u).indexOf(u.titleOn) >= 0 ? u.titleOn : null;
}

// 달기 · 떼기
window.wearTitle = function (name) {
    if (!currentUser) return;
    if (name && myList(currentUser).indexOf(name) < 0) {
        showCustomAlert('가지고 있지 않은 칭호입니다.'); return;
    }
    currentUser.titleOn = (currentUser.titleOn === name) ? null : (name || null);
    save({ titleOn: 1 });
    paint();
    renderTitleList();
    if (typeof updateUI === 'function') updateUI();
};

function paint() {
    const host = document.getElementById('rec-badge');
    if (!host || !currentUser) return;
    let box = document.getElementById('title-row');
    if (!box) {
        box = document.createElement('div');
        box.id = 'title-row';
        box.style.cssText = 'border:1px solid #2a2a2a; border-radius:6px; padding:9px 11px;'
            + ' margin-bottom:9px; background:rgba(0,0,0,0.22);';
        host.insertBefore(box, host.firstChild);
    }
    const w = worn(currentUser);
    const own = myList(currentUser).length;
    box.innerHTML = '<div style="font-size:10px; color:#888; margin-bottom:5px;">칭호</div>'
        + (w
            ? '<span style="font-size:11px; color:#d4af37; border:1px solid #6a5a2a;'
              + ' border-radius:3px; padding:2px 7px;">[' + label(w) + ']</span>'
            : '<div style="font-size:11px; color:#666;">'
              + (own ? '달고 있지 않습니다. 칭호 탭에서 하나 고르세요.' : '아직 없습니다.')
              + '</div>')
        + (own ? '<div style="font-size:10px; color:#777; margin-top:5px;">보유 ' + own + '개</div>' : '');
}
setInterval(paint, 2500);

// ==========================================
// 다른 자리에도 보이기 — 사원 목록 · 파티챗 · 정보 열람
// ==========================================
//
// 세 곳 모두 innerHTML 로 통째로 다시 그린다.
// 그려진 뒤에 칸을 찾아 붙이고, 같은 칸에 두 번 붙지 않게 표시를 남긴다.
function tagHtml(u, size) {
    const n = worn(u);                     // 달고 있는 하나만 보인다
    if (!n) return '';
    const s = size || 9;
    return '<span style="font-size:' + s + 'px; color:#d4af37; border:1px solid #6a5a2a;'
        + ' border-radius:3px; padding:0 4px; margin-right:3px; white-space:nowrap;">'
        + label(n) + '</span>';
}

function after(name, fn) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._tiAfter) { clearInterval(iv); return; }
        const _o = f;
        window[name] = function () {
            const r = _o.apply(this, arguments);
            try { fn.apply(this, arguments); } catch (e) { }
            return r;
        };
        window[name]._tiAfter = true;
        clearInterval(iv);
    }, 600);
}

// --- 사원 목록 ---
after('renderEmployeeCards', function () {
    document.querySelectorAll('.emp-list-card').forEach(function (card) {
        const t = card.querySelector('.emp-list-title');
        if (!t || t.dataset.ti) return;
        const m = (card.getAttribute('onclick') || '').match(/openEmpDetailModal\('([^']+)'\)/);
        const u = m && db.users[m[1]];
        t.dataset.ti = '1';
        if (!u) return;
        const h = tagHtml(u, 9);
        if (h) t.insertAdjacentHTML('afterbegin', h + ' ');     // 이름 왼쪽
    });
});

// --- 파티챗 ---
//
// 줄과 기록이 1:1 로 대응한다 (시스템 줄도 한 칸을 쓴다).
after('renderChatLog', function () {
    const msgs = document.querySelectorAll('#pchat-log .pchat-msg');
    if (!msgs.length || typeof partyChatLog === 'undefined') return;
    partyChatLog.forEach(function (m, i) {
        const el = msgs[i];
        if (!el || !m || m.code === 'SYSTEM') return;
        const nameEl = el.querySelector('.pchat-name');
        if (!nameEl || nameEl.dataset.ti) return;
        nameEl.dataset.ti = '1';
        const u = db.users[m.code];
        if (!u) return;
        const h = tagHtml(u, 8);
        if (h) nameEl.insertAdjacentHTML('beforebegin', h + ' ');   // 이름 왼쪽
    });
});

// --- 정보 열람 (사원 상세) ---
//
// 전에는 카드 아래에 따로 상자를 붙였다. 이제 이름 왼쪽에 둔다.
// 상자에는 보유 개수만 남긴다. 같은 화면에 두 번 쓸 일이 없다.
after('openEmpDetailModal', function (code) {
    const box = document.getElementById('emp-detail-card-container');
    const u = db.users[code];
    if (!box || !u) return;

    // 이름 왼쪽
    const nameEl = box.querySelector('.emp-name');
    if (nameEl && !nameEl.dataset.ti) {
        nameEl.dataset.ti = '1';
        const h = tagHtml(u, 10);
        if (h) nameEl.insertAdjacentHTML('afterbegin', h + ' ');
    }

    const old = document.getElementById('emp-title-row');
    if (old) old.remove();
    const own = myList(u).length;
    if (!own) return;

    const row = document.createElement('div');
    row.id = 'emp-title-row';
    row.style.cssText = 'font-size:10px; color:#777; margin:8px 0 0 0;';
    row.innerText = '보유 칭호 ' + own + '개'
        + (worn(u) ? '' : ' · 달고 있지 않습니다.');
    box.appendChild(row);
});

// ==========================================
// 칭호 목록 — 정보 열람에 서브탭 하나
// ==========================================
//
// 15종을 전부 줄 세운다.
// 얻은 것은 이름이 보이고, 못 얻은 것은 [미획득] 로만 보인다.
// 줄을 누르면 어떻게 얻는지와 지금 얼마나 왔는지가 펼쳐진다.

// 칭호별 진행도 — [지금, 목표, 꼬리말]
function prog(d, u, s) {
    switch (d.id) {
        case 'saint':   return [s.resc, 200, '회'];
        case 'mola':    return [s.dead, 50, '회'];
        case 'virile':  return [s.sire, 500, '회'];
        case 'fertile': return [s.bear, 500, '회'];
        case 'lucky':   return [s.d15, 100, '회'];
        case 'breaker': return [s.smash, 300, '회'];
        case 'helper':  return [s.help, 100, '회'];
        case 'exorc':   return [s.exor, 250, '회'];
        case 'pure':    return [Math.floor((Date.now() - s.pureFrom) / DAY), 10, '일'];
        case 'health':  return [Math.floor((Date.now() - s.healthFrom) / DAY), 10, '일'];
        case 'collect': {
            const pool = alienPool(), m = owned(u);
            return [pool.filter(function (n) { return m[n]; }).length, pool.length, '종'];
        }
        case 'frame':   return [frameHave(u), frameTargets().length, '종'];
        case 'spy': {
            const o = otherSideItems(u), m = owned(u);
            return [o.filter(function (n) { return m[n]; }).length, o.length, '종'];
        }
        // 분모는 언제나 세 자리다. 자리를 덜 열었어도 목표는 줄지 않는다.
        case 'weapon':  return [lSlots(u), GEAR_SLOTS, '자리'];
        case 'gold':    return [isVip(u) ? 1 : 0, 1, ''];
        case 'tamer':   return [0, 1, ''];
        default:        return [0, 1, ''];
    }
}

window.toggleTitleRow = function (id) {
    const el = document.getElementById('tdet-' + id);
    if (!el) return;
    const open = el.style.display !== 'none';
    document.querySelectorAll('[id^="tdet-"]').forEach(function (x) { x.style.display = 'none'; });
    el.style.display = open ? 'none' : 'block';
};

function renderTitleList() {
    const box = document.getElementById('rec-titles');
    if (!box || !currentUser) return;
    const s = ti(currentUser);
    const have = currentUser.titles || [];

    const rows = DEFS.map(function (d) {
        const got = have.indexOf(d.id) >= 0;
        const p = prog(d, currentUser, s);
        const cur = Math.min(p[0], p[1]);
        const pctv = p[1] > 0 ? Math.min(100, Math.round(cur / p[1] * 100)) : 0;
        const dormant = (d.id === 'tamer' && typeof PET_SPECIES === 'undefined');
        const on = got && currentUser.titleOn === d.n;

        return ''
          + '<div style="border:1px solid ' + (on ? '#d4af37' : got ? '#6a5a2a' : '#2a2a2a') + '; border-radius:6px;'
          + ' margin-bottom:7px; background:rgba(0,0,0,' + (got ? '0.3' : '0.18') + ');">'
          + '<div onclick="toggleTitleRow(\'' + d.id + '\')" style="padding:10px 12px; cursor:pointer;'
          + ' display:flex; justify-content:space-between; align-items:center; gap:8px;">'
          + '<span style="font-size:12px; font-weight:bold; color:' + (got ? '#d4af37' : '#666') + ';">['
          + (got ? d.n : '미획득') + ']</span>'
          + '<span style="font-size:10px; color:' + (got ? (on ? '#d4af37' : '#81c784') : '#777') + ';">'
          + (got ? (on ? '◆ 달고 있음' : '보유') : (dormant ? '준비 중' : pctv + '%')) + '</span>'
          + '</div>'
          + '<div id="tdet-' + d.id + '" style="display:none; padding:0 12px 11px 12px;'
          + ' border-top:1px dashed #2f2f2f;">'
          + '<div style="font-size:11px; color:#bbb; margin:9px 0 7px 0; line-height:1.7;">'
          + d.need + '</div>'
          + (dormant
              ? '<div style="font-size:10px; color:#888;">아직 열리지 않은 칭호입니다.</div>'
              : '<div style="font-size:10px; color:#888;">'
                + (got ? '이미 얻었습니다.'
                       : '지금 ' + cur.toLocaleString() + ' / ' + p[1].toLocaleString() + (p[2] || ''))
                + '</div>'
                + (got ? '' :
                   '<div style="height:5px; background:#1a1a1a; border-radius:3px; margin-top:7px; overflow:hidden;">'
                   + '<div style="height:100%; width:' + pctv + '%; background:#6a5a2a;"></div></div>'))
          + (got
              ? '<button class="game-btn" style="width:100%; margin:9px 0 0 0; padding:9px; font-size:11px;'
                + (on ? ' background:linear-gradient(145deg,#6a5a2a,#3a2f18) !important;'
                      + ' border-color:#d4af37 !important; color:#fff !important;' : '')
                + '" onclick="wearTitle(\'' + d.n + '\')">'
                + (on ? '뗀다' : '단다') + '</button>'
              : '')
          + '</div></div>';
    }).join('');

    const adm = (currentUser.titleAdmin || []);
    const admHtml = adm.length
        ? '<div style="margin-top:12px; padding-top:11px; border-top:1px dashed #333;">'
          + '<div style="font-size:10px; color:#888; margin-bottom:6px;">상담사가 붙여 준 칭호</div>'
          + adm.map(function (n) {
                const on = currentUser.titleOn === n;
                return '<div style="display:flex; justify-content:space-between; align-items:center;'
                    + ' gap:8px; border:1px solid ' + (on ? '#d4af37' : '#6a5a2a') + '; border-radius:6px;'
                    + ' padding:8px 11px; margin-bottom:6px; background:rgba(0,0,0,0.3);">'
                    + '<div style="min-width:0;">'
                    + '<span style="font-size:12px; font-weight:bold; color:#d4af37;">[' + label(n) + ']</span>'
                    + (ADMIN_DESC[n]
                        ? '<div style="font-size:10px; color:#7d7870; margin-top:3px; line-height:1.5;">'
                          + ADMIN_DESC[n] + '</div>'
                        : '')
                    + '</div>'
                    + '<button class="game-btn" style="margin:0; padding:6px 12px; font-size:10px;'
                    + (on ? ' background:linear-gradient(145deg,#6a5a2a,#3a2f18) !important;'
                          + ' border-color:#d4af37 !important; color:#fff !important;' : '')
                    + '" onclick="wearTitle(\'' + n + '\')">' + (on ? '뗀다' : '단다') + '</button>'
                    + '</div>';
            }).join('') + '</div>'
        : '';

    box.innerHTML = '<div style="font-size:10px; color:#888; margin-bottom:10px; line-height:1.7;">'
        + '얻은 칭호 ' + have.length + ' / ' + DEFS.length + '종. 줄을 누르면 얻는 방법이 보입니다.<br>'
        + '<span style="color:#d4af37;">달 수 있는 것은 한 번에 하나뿐입니다.</span> 지금: '
        + (worn(currentUser) ? '<b style="color:#d4af37;">[' + worn(currentUser) + ']</b>' : '없음')
        + '</div>'
        + rows + admHtml;
}

(function mountTab() {
    const iv = setInterval(function () {
        if (document.getElementById('rec-titles')) { clearInterval(iv); return; }
        const host = document.getElementById('tab-record');
        const grid = host && host.querySelector('.sub-tabs-grid');
        if (!grid) return;

        const btn = document.createElement('button');
        btn.className = 'sub-tab';
        btn.innerText = '칭호';
        btn.setAttribute('onclick', "switchRecordSubTab('rec-titles', this); renderTitleList();");
        grid.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'rec-titles';
        panel.className = 'sub-panel';
        host.appendChild(panel);

        clearInterval(iv);
        console.log('[칭호] 정보 열람에 목록 탭 연결');
    }, 800);
})();
window.renderTitleList = renderTitleList;

// 열려 있는 동안에는 숫자를 갱신한다
setInterval(function () {
    const p = document.getElementById('rec-titles');
    if (p && p.classList.contains('active')) renderTitleList();
}, 5000);

// ==========================================
// ⛓️‍💥 이레귤러 — 상담사 전용
// ==========================================
//
// 달고 있는 동안에만:
//     · 전용 장비의 모든 자리가 L 로 보이고 L 로 계산된다
//     · 속성 변경권이 없어도 자유롭게 속성을 바꿀 수 있다
//     · 네 번째 자리가 열린다 (원래 상한은 3)
//
// ■ 데이터는 건드리지 않는다
//   등급을 L 로 「써 넣지」 않는다. 읽는 함수만 가로채 L 로 답한다.
//   그래서 칭호를 떼면 원래 등급이 그대로 돌아온다.
//
// ■ 웨폰 마스터가 저절로 붙지 않는 까닭
//   웨폰 마스터는 titles.js 안의 attrGradeOf 로 재는데, 그것은
//   g.attrGrades 와 g.grade 를 바로 읽는다. 가로챈 쪽(dark.js 의
//   gearAttrGrade)을 쓰지 않으므로 이 칭호의 L 은 보이지 않는다.
//   아래 allAttrsL 앞에 한 겹 더 막아 둔다.
//
// ■ 네 번째 자리
//   g.slots 를 4 로 올리고 원래 값을 g.slotsReal 에 적어 둔다.
//   칭호를 떼면 되돌린다. 5초마다 맞춰 보므로 어긋난 채로 남지 않는다.

const IRR = '이레귤러';
const IRR_SLOTS = 4;

function irregular(u) {
    u = u || currentUser;
    return !!(u && u.titleOn === IRR && (u.titleAdmin || []).indexOf(IRR) >= 0);
}
window._irregular = irregular;

// 지금 보고 있는 장비가 「이 칭호를 단 사람」의 것인가
function irrGear(g) {
    if (!g || !currentUser || !irregular(currentUser)) return false;
    return g === currentUser.soulGear;
}

// --- 등급을 L 로 답한다 ---
(function hookGrade() {
    const iv = setInterval(function () {
        if (typeof gearAttrGrade !== 'function') return;
        if (gearAttrGrade._irr) { clearInterval(iv); return; }
        const _g = gearAttrGrade;
        gearAttrGrade = function (g, attr) {
            if (irrGear(g)) return 'L';
            return _g.apply(this, arguments);
        };
        gearAttrGrade._irr = true;
        clearInterval(iv);
        console.log('[칭호] 이레귤러 — 속성 등급 L 고정 연결');
    }, 500);
})();

// 본체 등급도 L 로 보이게 (첫 자리는 본체 등급을 쓴다)
// 화면이 g.grade 를 바로 읽는 곳이 있어 거기까지 맞춘다.
(function hookBody() {
    setInterval(function () {
        const g = currentUser && currentUser.soulGear;
        if (!g) return;
        if (irregular(currentUser)) {
            if (g.gradeReal === undefined) g.gradeReal = g.grade;
            if (g.grade !== 'L') g.grade = 'L';
            if (g.slotsReal === undefined) g.slotsReal = (g.slots || 1);
            if (g.slots !== IRR_SLOTS) g.slots = IRR_SLOTS;
        } else {
            let back = false;
            if (g.gradeReal !== undefined) { g.grade = g.gradeReal; delete g.gradeReal; back = true; }
            if (g.slotsReal !== undefined) { g.slots = g.slotsReal; delete g.slotsReal; back = true; }
            if (back) {
                // 자리를 줄였으면 넘치는 속성은 뒤에서 덜어낸다
                if (Array.isArray(g.attrs) && g.attrs.length > (g.slots || 1)) {
                    const cut = g.attrs.splice(g.slots || 1);
                    cut.forEach(function (a) { if (g.attrGrades) delete g.attrGrades[a]; });
                    console.log('[칭호] 이레귤러를 떼어 네 번째 자리의 ' + cut.length + '개를 덜어냈습니다.');
                }
                save({ soulGear: 1 });
                if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
                console.log('[칭호] 이레귤러를 떼고 원래 등급·자리로 되돌렸습니다.');
            }
        }
    }, 5000);
})();

// --- 변경권 없이 속성 변경 ---
//
// doGearReattr(attr, itemName) 은 itemName 을 소지품에서 뺀다.
// 이 칭호를 달고 있으면 빼는 그 한 번만 비켜 세운다.
(function hookFree() {
    const iv = setInterval(function () {
        if (typeof doGearReattr !== 'function' || typeof removeItemFromInventory !== 'function') return;
        if (doGearReattr._irr) { clearInterval(iv); return; }
        const _do = doGearReattr;
        doGearReattr = function (attr, itemName) {
            if (!irregular(currentUser)) return _do.apply(this, arguments);
            const _rm = removeItemFromInventory;
            removeItemFromInventory = function () { };          // 변경권을 쓰지 않는다
            try { return _do.call(this, attr, itemName || IRR); }
            finally { removeItemFromInventory = _rm; }
        };
        doGearReattr._irr = true;

        // 변경권을 들고 있지 않아도 창을 열 수 있게
        if (typeof openGearReattr === 'function' && !openGearReattr._irr) {
            const _op = openGearReattr;
            openGearReattr = function (itemName) { return _op.call(this, itemName || IRR); };
            openGearReattr._irr = true;
        }
        clearInterval(iv);
        console.log('[칭호] 이레귤러 — 변경권 없이 속성 변경 연결');
    }, 500);
})();

// --- 소지품 화면의 전용 장비 칸에 단추를 하나 붙인다 ---
//
// 전에는 1.2초마다 살펴 붙였다. 그런데 renderInventory 가 칸을 통째로
// 다시 쓰기 때문에, 다시 쓰인 뒤 붙기까지 한 번씩 비어 보였다.
// 그래서 깜박이고, 붙는 자리도 그때그때 달라 움직여 보였다.
//
// 지금은 두 가지로 바꿨다.
//   1. renderInventory 가 끝나는 그 자리에서 바로 붙인다 (화면에 그려지기 전)
//   2. 그 밖의 파일이 칸을 고쳐도 MutationObserver 가 그려지기 전에 다시 붙인다
// 붙는 자리는 「단추가 든 마지막 줄」로 못박아 두어 움직이지 않는다.
(function hookButton() {
    const BTN = 'irr-reattr-btn';

    function stick() {
        const box = document.getElementById('inventory-list-container');
        if (!box) return;

        if (!irregular(currentUser)) {
            const old = document.getElementById(BTN);
            if (old) old.remove();
            return;
        }
        if (document.getElementById(BTN)) return;

        let card = null;
        for (let i = 0; i < box.children.length; i++) {
            if ((box.children[i].textContent || '').indexOf('[전용 장비]') >= 0) { card = box.children[i]; break; }
        }
        if (!card) return;

        // 단추가 들어 있는 마지막 줄 — 「속성 선택 · 강화」가 놓인 자리다
        let row = null;
        const divs = card.getElementsByTagName('div');
        for (let i = divs.length - 1; i >= 0; i--) {
            if (divs[i].getElementsByTagName('button').length) { row = divs[i]; break; }
        }
        if (!row) return;

        const b = document.createElement('button');
        b.id = BTN;
        b.className = 'inv-btn';
        b.style.cssText = 'flex:1; min-width:78px; background:linear-gradient(145deg,#4a2c73,#2a0c43);'
            + ' color:#fff; border-color:#8a6cb3;';
        b.textContent = '⛓️‍💥 속성 바꾸기';
        b.onclick = function () { if (typeof openGearReattr === 'function') openGearReattr(IRR); };
        row.appendChild(b);
    }

    // 1. 다시 그린 그 자리에서 바로
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._irrBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._irrBtn = true;
            clearInterval(iv);
        }, 400);
    })();

    // 2. 남이 칸을 고쳤을 때 — 그려지기 전에 다시
    (function watch() {
        const iv = setInterval(function () {
            const box = document.getElementById('inventory-list-container');
            if (!box) return;
            clearInterval(iv);
            try {
                new MutationObserver(function () { try { stick(); } catch (e) { } })
                    .observe(box, { childList: true });
            } catch (e) { }
            stick();
        }, 400);
    })();

    // 3. 칭호를 달거나 뗀 순간에도 (화면을 다시 그리지 않을 수 있다)
    let was = null;
    setInterval(function () {
        const on = irregular(currentUser);
        if (on === was) return;
        was = on;
        try { stick(); } catch (e) { }
    }, 1000);
})();

// ==========================================
// 상담사 — 손으로 붙이기
// ==========================================
// 지금 「주기」인가 「떼기」인가
//
// 전에는 같은 단추를 다시 누르면 떼였다. 그런데 화면에 지금 상태가
// 안 보여서, 주려고 눌렀다가 떼는 일이 생겼다.
// 그래서 모드를 겉으로 드러낸다.
let titleMode = 'give';          // 'give' 또는 'take'

window.setTitleMode = function (m) {
    titleMode = (m === 'take') ? 'take' : 'give';
    const btn = document.getElementById('title-mode-btn');
    if (btn) {
        btn.textContent = (titleMode === 'take') ? '떼기' : '주기';
        btn.style.background = (titleMode === 'take')
            ? 'linear-gradient(145deg,#6a2a2a,#3a1818)' : 'linear-gradient(145deg,#2a4a2a,#183018)';
        btn.style.borderColor = (titleMode === 'take') ? '#a04a4a' : '#4a8a4a';
    }
    const row = document.getElementById('title-admin-row');
    if (row) row.setAttribute('data-mode', titleMode);
};

window.adminGiveTitle = function (name, force) {
    if (typeof getAdminTargets !== 'function') return;
    const targets = getAdminTargets();
    if (!targets.length) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    const mode = force || titleMode;                 // 'give' · 'take'
    const done = [], off = [], skip = [];
    targets.forEach(function (code) {
        const u = db.users[code];
        if (!u) return;
        if (!Array.isArray(u.titleAdmin)) u.titleAdmin = [];
        const at = u.titleAdmin.indexOf(name);

        if (mode === 'take') {
            if (at < 0) { skip.push(u.name); return; }
            u.titleAdmin.splice(at, 1);
            off.push(u.name);
        } else {
            if (at >= 0) { skip.push(u.name); return; }
            u.titleAdmin.push(name);
            done.push(u.name);
        }

        const f = { titleAdmin: u.titleAdmin, history: u.history };
        // 떼었는데 그걸 달고 있었으면 벗긴다
        if (mode === 'take' && u.titleOn === name) { u.titleOn = ''; f.titleOn = ''; }

        if (typeof addHistoryLog === 'function') {
            addHistoryLog(u, '[칭호] ' + name + (mode === 'take' ? ' 회수' : ' 부여'));
        }
        u._adminStamp = Date.now();
        if (typeof updateUserFields === 'function') updateUserFields(code, f);
    });
    paint();
    if (typeof updateUI === 'function') updateUI();

    const lines = [];
    if (done.length) lines.push('[' + label(name) + '] 부여 — ' + done.join(', '));
    if (off.length) lines.push('[' + label(name) + '] 회수 — ' + off.join(', '));
    if (skip.length) lines.push((mode === 'take' ? '안 가지고 있어 건너뜀 — ' : '이미 가지고 있어 건너뜀 — ')
        + skip.join(', '));
    showCustomAlert(lines.join('\n\n'));
};

// 콘솔에서 — titleTake('이레귤러', 사번) · titleGive('이레귤러', 사번)
function oneTarget(name, who, mode) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(u.titleAdmin)) u.titleAdmin = [];
    const at = u.titleAdmin.indexOf(name);
    if (mode === 'take') {
        if (at < 0) { console.log(u.name + ' 사원은 [' + label(name) + '] 을 가지고 있지 않습니다.'); return; }
        u.titleAdmin.splice(at, 1);
    } else {
        if (at >= 0) { console.log(u.name + ' 사원은 이미 [' + label(name) + '] 을 가지고 있습니다.'); return; }
        u.titleAdmin.push(name);
    }
    const f = { titleAdmin: u.titleAdmin };
    if (mode === 'take' && u.titleOn === name) { u.titleOn = ''; f.titleOn = ''; }
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[칭호] ' + name + (mode === 'take' ? ' 회수' : ' 부여'));
        f.history = u.history;
    }
    if (typeof updateUserFields === 'function') updateUserFields(u.code, f);
    paint();
    if (typeof updateUI === 'function') updateUI();
    console.log('%c\u2713 ' + u.name + ' 사원 [' + label(name) + '] '
        + (mode === 'take' ? '회수' : '부여'), 'color:#4CAF50');
}
window.titleGive = function (name, who) { oneTarget(name, who, 'give'); };
window.titleTake = function (name, who) { oneTarget(name, who, 'take'); };
window.titleOf = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' 사원의 칭호 =====', 'color:#d4af37; font-size:13px');
    console.log('  달고 있는 것:', u.titleOn ? '[' + label(u.titleOn) + ']' : '없음');
    console.log('  상담사 부여:', (u.titleAdmin || []).map(function (n) { return '[' + label(n) + ']'; }).join(' ') || '없음');
    console.log('  저절로 얻은 것:', (u.titles || []).length + '개');
};

(function mountAdmin() {
    const iv = setInterval(function () {
        if (document.getElementById('title-admin-row')) { clearInterval(iv); return; }
        const anchor = document.querySelector('button[onclick="adminSeizeSafe()"]');
        if (!anchor) return;
        const row = document.createElement('div');
        row.id = 'title-admin-row';
        row.style.cssText = 'font-size:12px; margin:10px 0; display:flex; gap:6px;'
            + ' align-items:center; flex-wrap:wrap;';
        row.innerHTML = '<span style="font-size:10px; color:#888; flex-shrink:0;">칭호</span>'
            + '<button id="title-mode-btn" class="game-btn" style="flex:0 0 56px; margin:0; padding:9px;'
            + ' font-size:11px; background:linear-gradient(145deg,#2a4a2a,#183018) !important;'
            + ' border-color:#4a8a4a !important;"'
            + ' onclick="setTitleMode(this.textContent.trim() === \'주기\' ? \'take\' : \'give\')">주기</button>'
            + ADMIN_TITLES.map(function (n) {
                return '<button class="game-btn" style="flex:1 1 68px; margin:0; padding:9px; font-size:11px;'
                    + ' background:linear-gradient(145deg,#5a4a2a,#3a2f18) !important;'
                    + ' border-color:#7a6a3a !important;" onclick="adminGiveTitle(\'' + n + '\')">'
                    + label(n) + '</button>';
            }).join('');
        const holder = anchor.parentNode;
        holder.parentNode.insertBefore(row, holder.nextSibling);
        clearInterval(iv);
        console.log('[칭호] 상담사 단추 연결 — 왼쪽 「주기/떼기」로 바꿔 누릅니다');
        console.log('       콘솔: titleGive(\'이레귤러\', 사번) · titleTake(\'이레귤러\', 사번) · titleOf(사번)');
    }, 800);
})();

// ==========================================
// 확인
// ==========================================
window.myTitles = function (code) {
    const u = code ? db.users[code] : currentUser;
    if (!u) { console.log('사원을 찾지 못했습니다.'); return; }
    console.log('%c===== ' + u.name + ' 사원의 칭호 =====', 'color:#d4af37; font-size:13px');
    const list = myList(u);
    const w = worn(u);
    console.log('  달고 있음:', w ? '[' + label(w) + ']' : '없음');
    console.log('  보유:', list.length ? list.map(function (n) { return '[' + label(n) + ']'; }).join(' ') : '아직 없습니다.');
};

window.titleProgress = function () {
    if (!currentUser) return;
    const s = ti(currentUser);
    const rows = DEFS.map(function (d) {
        let ok = false;
        try { ok = !!d.check(currentUser, s); } catch (e) { }
        const have = (currentUser.titles || []).indexOf(d.id) >= 0;
        // 화면의 칭호 목록과 같은 계산을 쓴다
        let now = ok ? '충족' : '-';
        try {
            const pv = prog(d, currentUser, s);
            if (pv && pv[1] > 1) now = pv[0] + ' / ' + pv[1] + (pv[2] ? ' ' + pv[2] : '');
        } catch (e) { }
        return {
            칭호: '[' + d.n + ']', 조건: d.need,
            지금: now,
            상태: have ? '보유' : (ok ? '곧 지급' : '-')
        };
    });
    console.log('%c===== 칭호 진행 =====', 'color:#d4af37; font-size:13px');
    console.table(rows);
    console.log('  세기 시작:', s._born ? new Date(s._born).toLocaleString() : '-');
    if (currentUser.titleAdmin && currentUser.titleAdmin.length) {
        console.log('  상담사 부여:', currentUser.titleAdmin.map(function (n) { return '[' + label(n) + ']'; }).join(' '));
    }
};

console.log('[칭호] myTitles() · titleProgress()');

})();