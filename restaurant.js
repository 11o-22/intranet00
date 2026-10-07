// ==========================================
// ★ 행복 식당 — 장터가 있던 자리
// index.html 에서 뒤쪽(save-merge.js 앞)에 불러온다
// ==========================================
//
// ■ 무엇인가
//   재료를 사서 섞어 요리를 만든다. 만들 때마다 눈금 맞추기를 한 번 거친다.
//
//   재료  평범 20가지 · 괴상 10가지 (전부 포인트로 산다)
//   요리  100가지 · D~S 다섯 등급
//         D 두 가지 · C 세 가지 · B 네 가지 · A 다섯 가지 · S 여섯 가지를 섞는다
//
//   평범끼리만  포만감이 오르거나(5~60) 오염도가 내린다(10~40)
//   괴상끼리만  나쁜 것만 나온다
//   섞으면      등급에 따라 좋은 것과 나쁜 것이 함께 나온다
//   S 등급      1% 로 공용시설 +1~2 · 어둠 탐사 +1~2 · 행운 50~100% 중
//               한둘이 더 붙는다 (이름 끝에 ★ 가 붙는다)
//
//   눈금을 놓치면 「실패한 요리」가 나온다. 먹으면 오염도가 5% 오른다.
//   S 등급은 [요리사] 칭호가 있어야 만들 수 있다. (A 등급 이상 50번 성공)
//
// ■ 저장되는 자리
//   currentUser.cookBook   { 요리번호: 만든 횟수 }
//   currentUser.cookStat   { ok: 성공 횟수, hi: A 이상 성공 횟수 }
//
// ■ 콘솔
//   foodState() · foodBook() · foodDish(번호)

(function restaurant() {

const GRADES = ['D', 'C', 'B', 'A', 'S'];
const MATS_BY_GRADE = { D: 2, C: 3, B: 4, A: 5, S: 6 };
const GCOLOR = { D: '#8d8d8d', C: '#6fa8dc', B: '#8bc34a', A: '#d4af37', S: '#ff8a65' };
const COOK_TITLE = '요리사';
// titles.js 는 칭호를 **이름이 아니라 번호**로 적어 둔다. (titles.js:452)
// 같은 자리를 써야 칭호 목록·진도와 어긋나지 않는다.
const COOK_ID = 'cook';
const HI_NEED = 50;            // A 등급 이상 50번이면 요리사

// ==========================================
// 1. 재료
// ==========================================
const PLAIN = [
    ['쌀 한 되', 60], ['햇감자', 70], ['양파', 50], ['당근', 55], ['달걀 한 판', 90],
    ['버터', 120], ['굵은 소금', 40], ['흑설탕', 60], ['조선간장', 80], ['청양고추', 65],
    ['통마늘', 70], ['대파', 50], ['두부 한 모', 85], ['삼겹살', 220], ['닭 한 마리', 200],
    ['고등어', 160], ['우유', 70], ['밀가루', 55], ['표고버섯', 110], ['묵은지', 130]
];
const ODD = [
    ['눅눅한 각설탕', 420], ['식은 손가락 과자', 520], ['거꾸로 자란 무', 560],
    ['우는 조개', 640], ['어제의 국물', 700], ['뼈만 남은 생선', 760],
    ['검게 변한 우유', 820], ['숨 쉬는 반죽', 900], ['눈이 달린 감자', 1000],
    ['녹지 않는 얼음', 1200]
];
const PLAIN_N = PLAIN.map(function (x) { return x[0]; });
const ODD_N = ODD.map(function (x) { return x[0]; });
const MAT_PRICE = {};
PLAIN.concat(ODD).forEach(function (x) { MAT_PRICE[x[0]] = x[1]; });

const FAIL_ITEM = '실패한 요리';

// ==========================================
// 2. 요리 이름 — 유형과 등급별로 적어 둔다
// ==========================================
const NAMES = {
    // 평범끼리만
    good: {
        D: ['흰 주먹밥', '감자채 볶음', '양파 수프', '당근 라페', '달걀 말이', '버터 구이 감자',
            '소금 구이', '설탕 조림', '간장 계란밥', '고추 장아찌', '마늘 빵', '대파 전',
            '두부 조림', '묵은지 볶음'],
        C: ['삼겹 김치찌개', '닭 육수 국수', '고등어 조림', '버섯 전골', '우유 수프',
            '감자 그라탕', '달걀 장조림', '두부 김치', '마늘 닭볶음', '양파 불고기', '대파 제육'],
        B: ['묵은지 찜', '버섯 불고기', '닭 백숙', '고등어 구이 정식', '삼겹 수육',
            '감자 옹심이', '달걀 샌드위치', '두부 스테이크', '버터 치킨'],
        A: ['묵은지 등갈비찜', '버섯 크림 파스타', '닭 한 마리 전골', '고등어 미소 조림',
            '삼겹 김치말이', '궁중 떡볶이'],
        S: ['한상 차림', '열두 첩 반상', '야참 특선', '식당 최고의 날']
    },
    // 평범과 괴상을 섞은 것
    mix: {
        D: ['조금 쉰 주먹밥', '식은 감자전', '흐린 양파국', '눅눅한 튀김', '덜 익은 달걀',
            '비린 전', '탄 마늘빵', '질긴 두부', '맹물 국', '어제의 볶음밥'],
        C: ['금이 간 그릇의 찌개', '숨이 붙은 수제비', '이상한 냄새의 조림',
            '검은 알갱이가 섞인 밥', '되직한 죽', '식지 않는 국', '울음이 섞인 전골',
            '무거운 국수', '짜디짠 볶음'],
        B: ['그림자가 비치는 전골', '뼈가 섞인 찜', '거꾸로 익은 구이', '숨 쉬는 만두',
            '눈이 마주치는 조림', '이름이 적힌 도시락', '세어지지 않는 반찬'],
        A: ['두 번 끓인 어제의 탕', '손가락이 든 튀김', '녹지 않는 빙수',
            '울음소리가 나는 전골', '거꾸로 자란 뿌리 찜', '검은 우유 스튜'],
        S: ['끝나지 않는 한 그릇', '식당의 비밀 메뉴', '셰프의 농담', '이름 없는 코스']
    },
    // 괴상끼리만
    bad: {
        D: ['상한 주먹밥', '곰팡이 전', '쉰 국', '탄 덩어리', '비린 죽', '썩은 조림'],
        C: ['벌레 먹은 찜', '검게 변한 수프', '굳어 버린 떡', '숨 막히는 국', '피 섞인 볶음'],
        B: ['뼈만 남은 탕', '눈알이 뜨는 전골', '숨 쉬는 반죽 튀김', '얼어붙은 손'],
        A: ['어제의 어제', '돌아오지 않는 맛', '먹으면 안 되는 것'],
        S: ['식당의 바닥', '아무도 못 먹은 것']
    }
};

// ==========================================
// 3. 요리 100가지를 짠다
//
//   누구에게나 같은 표가 나와야 하므로 번호로 돌리는 주사위를 쓴다.
// ==========================================
function rng(seed) {
    let a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function pickSome(list, n, r) {
    const pool = list.slice();
    const out = [];
    while (out.length < n && pool.length) {
        out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    }
    return out;
}
function band(lo, hi, g, r) {
    const i = GRADES.indexOf(g);
    const w = (hi - lo) / GRADES.length;
    const a = lo + w * i;
    return Math.round(a + r() * w);
}

const DISHES = [];
(function build() {
    let id = 0;
    GRADES.forEach(function (g) {
        ['good', 'mix', 'bad'].forEach(function (kind) {
            (NAMES[kind][g] || []).forEach(function (name) {
                const r = rng(0x9E3779B9 ^ (id * 2654435761));
                const need = MATS_BY_GRADE[g];
                let mats;
                if (kind === 'good') mats = pickSome(PLAIN_N, need, r);
                else if (kind === 'bad') mats = pickSome(ODD_N, need, r);
                else {
                    const odd = Math.max(1, Math.floor(need / 2));
                    mats = pickSome(ODD_N, odd, r).concat(pickSome(PLAIN_N, need - odd, r));
                }

                const eff = {};
                if (kind === 'good') {
                    // 반은 포만감, 반은 오염도
                    if (id % 2 === 0) eff.sat = band(5, 60, g, r);
                    else eff.cure = band(10, 40, g, r);
                } else if (kind === 'bad') {
                    eff.poll = band(5, 24, g, r);
                    eff.hunger = band(4, 24, g, r);
                } else {
                    if (id % 2 === 0) eff.sat = Math.round(band(5, 60, g, r) * 0.75);
                    else eff.cure = Math.round(band(10, 40, g, r) * 0.75);
                    // 나쁜 쪽은 등급이 오를수록 덜 아프다
                    const hurt = Math.max(3, Math.round(band(5, 20, g, r) * (1 - GRADES.indexOf(g) * 0.12)));
                    if (id % 4 < 2) eff.poll = hurt; else eff.hunger = hurt;
                }

                DISHES.push({ id: id, name: name, grade: g, kind: kind, mats: mats, eff: eff });
                id++;
            });
        });
    });
})();

function dishOf(id) { return DISHES[id] || null; }
function dishByName(n) {
    const base = String(n || '').replace(/ ★$/, '');
    for (let i = 0; i < DISHES.length; i++) if (DISHES[i].name === base) return DISHES[i];
    return null;
}
function effText(d) {
    const e = d.eff, out = [];
    if (e.sat) out.push('포만감 +' + e.sat);
    if (e.cure) out.push('오염도 -' + e.cure + '%');
    if (e.poll) out.push('오염도 +' + e.poll + '%');
    if (e.hunger) out.push('포만감 -' + e.hunger);
    return out.join(' · ');
}

// ==========================================
// 4. 물품 목록에 올린다
// ==========================================
(function register() {
    if (typeof ITEM_CATALOG === 'undefined') return;
    PLAIN.concat(ODD).forEach(function (x) {
        ITEM_CATALOG[x[0]] = { price: x[1], usable: false, cookMat: true, foodMat: true,
            odd: ODD_N.indexOf(x[0]) >= 0,
            desc: '[재료] 행복 식당에서 요리에 쓴다.' };
    });
    DISHES.forEach(function (d) {
        // 값은 들어간 재료의 6할 — 팔 수도 있게 해 둔다
        const worth = Math.round(d.mats.reduce(function (a, m) { return a + (MAT_PRICE[m] || 0); }, 0) * 0.6);
        d.price = worth;
        ITEM_CATALOG[d.name] = { price: worth, usable: true, targetable: false,
            effect: 'food_dish', dish: d.id, foodDish: true,
            desc: '[' + d.grade + '등급 요리] ' + effText(d) };
        if (d.grade === 'S') {
            ITEM_CATALOG[d.name + ' ★'] = { price: worth, usable: true, targetable: false,
                effect: 'food_dish', dish: d.id, foodDish: true, star: true,
                desc: '[S등급 요리 ★] ' + effText(d) + ' · 그 밖에 무언가가 더 붙어 있다.' };
        }
    });
    ITEM_CATALOG[FAIL_ITEM] = { price: 10, usable: true, targetable: false,
        effect: 'food_fail', foodDish: true, desc: '[실패] 먹으면 오염도가 5% 오른다.' };
})();

// ==========================================
// 5. 사원 쪽 기록
// ==========================================
function book() {
    if (!currentUser) return {};
    if (!currentUser.cookBook) currentUser.cookBook = {};
    return currentUser.cookBook;
}
function stat() {
    if (!currentUser) return { ok: 0, hi: 0 };
    if (!currentUser.cookStat) currentUser.cookStat = { ok: 0, hi: 0 };
    return currentUser.cookStat;
}
function isCook(u) {
    u = u || currentUser;
    if (!u) return false;
    if (u.code === 'kario0987') return true;
    const t = u.titles || [];
    if (t.indexOf(COOK_ID) >= 0) return true;
    if (t.indexOf(COOK_TITLE) >= 0) return true;          // 예전 묶음이 이름으로 적어 둔 것
    const a = u.titleAdmin;
    if (a === COOK_TITLE || (Array.isArray(a) && a.indexOf(COOK_TITLE) >= 0)) return true;
    return false;
}
function save(f) {
    if (typeof saveFields === 'function') { try { saveFields(f); } catch (e) { } }
}

// ==========================================
// 6. 눈금 맞추기
//
//   등급이 오를수록 눈금은 좁아지고 빨라지고 횟수가 는다.
// ==========================================
const MINI = {
    D: { zone: 26, speed: 0.90, rounds: 1 },
    C: { zone: 20, speed: 1.25, rounds: 1 },
    B: { zone: 15, speed: 1.65, rounds: 2 },
    A: { zone: 10.5, speed: 2.10, rounds: 2 },
    S: { zone: 7, speed: 2.70, rounds: 3 }
};

let mini = null;

function miniClose() {
    if (mini && mini.raf) cancelAnimationFrame(mini.raf);
    mini = null;
    const el = document.getElementById('cook-mini');
    if (el) el.remove();
}

function miniOpen(d, done) {
    miniClose();
    const cfg = MINI[d.grade];
    const el = document.createElement('div');
    el.id = 'cook-mini';
    el.style.cssText = 'position:fixed; inset:0; z-index:9999999; background:rgba(0,0,0,0.9);'
        + ' display:flex; align-items:center; justify-content:center; padding:18px;';
    el.innerHTML =
        '<div style="width:100%; max-width:420px; background:#0d0d0d; border:1px solid #5a4a2a;'
        + ' border-radius:8px; padding:18px; text-align:center;">'
        + '<div style="font-size:13px; font-weight:bold; color:' + GCOLOR[d.grade] + ';">'
        + d.name + ' <span style="font-size:10px; color:#888;">' + d.grade + '등급</span></div>'
        + '<div id="cook-round" style="font-size:10px; color:#888; margin:6px 0 14px 0;"></div>'
        + '<div id="cook-bar" style="position:relative; height:34px; background:#1a1a1a;'
        + ' border:1px solid #333; border-radius:5px; overflow:hidden;">'
        + '<div id="cook-zone" style="position:absolute; top:0; bottom:0; background:rgba(76,175,80,0.30);'
        + ' border-left:1px solid #4CAF50; border-right:1px solid #4CAF50;"></div>'
        + '<div id="cook-pin" style="position:absolute; top:0; bottom:0; width:3px; background:#ffd700;'
        + ' box-shadow:0 0 6px rgba(255,215,0,0.8);"></div>'
        + '</div>'
        + '<div style="font-size:10px; color:#777; margin-top:9px; line-height:1.6;">'
        + '바늘이 초록 칸에 있을 때 멈추세요.</div>'
        + '<button class="game-btn" id="cook-stop" style="width:100%; margin:14px 0 0 0; padding:14px;'
        + ' font-size:13px; background:linear-gradient(145deg,#7f5a00,#4a3300) !important;'
        + ' border-color:#b07000 !important; color:#ffd9a0 !important;">멈춘다</button>'
        + '<button class="game-btn" style="width:100%; margin:7px 0 0 0; padding:9px; font-size:11px;'
        + ' opacity:0.7;" onclick="cookCancel()">그만둔다</button>'
        + '</div>';
    document.body.appendChild(el);

    mini = { d: d, cfg: cfg, round: 0, pos: 0, dir: 1, raf: null, done: done, over: false };
    nextRound();

    document.getElementById('cook-stop').onclick = function () { miniHit(); };
}

function nextRound() {
    if (!mini) return;
    mini.round++;
    const z = mini.cfg.zone;
    mini.zoneA = 8 + Math.random() * (92 - z - 8);
    mini.pos = 0; mini.dir = 1;
    const zo = document.getElementById('cook-zone');
    if (zo) { zo.style.left = mini.zoneA + '%'; zo.style.width = z + '%'; }
    const rr = document.getElementById('cook-round');
    if (rr) rr.innerText = mini.round + ' / ' + mini.cfg.rounds + ' 번째';
    mini.last = performance.now();
    tick();
}

function tick() {
    if (!mini || mini.over) return;
    const now = performance.now();
    const dt = Math.min(64, now - mini.last);
    mini.last = now;
    mini.pos += mini.dir * mini.cfg.speed * (dt / 16.67) * 0.9;
    if (mini.pos >= 100) { mini.pos = 100; mini.dir = -1; }
    if (mini.pos <= 0) { mini.pos = 0; mini.dir = 1; }
    const pin = document.getElementById('cook-pin');
    if (pin) pin.style.left = mini.pos + '%';
    mini.raf = requestAnimationFrame(tick);
}

function miniHit() {
    if (!mini || mini.over) return;
    const inZone = mini.pos >= mini.zoneA && mini.pos <= mini.zoneA + mini.cfg.zone;
    if (!inZone) {
        mini.over = true;
        if (mini.raf) cancelAnimationFrame(mini.raf);
        const fn = mini.done;
        const pin = document.getElementById('cook-pin');
        if (pin) pin.style.background = '#f44336';
        setTimeout(function () { miniClose(); fn(false); }, 450);
        return;
    }
    if (mini.round >= mini.cfg.rounds) {
        mini.over = true;
        if (mini.raf) cancelAnimationFrame(mini.raf);
        const fn = mini.done;
        setTimeout(function () { miniClose(); fn(true); }, 250);
        return;
    }
    if (mini.raf) cancelAnimationFrame(mini.raf);
    nextRound();
}

window.cookCancel = function () {
    if (!mini) return;
    mini.over = true;
    miniClose();
    showCustomAlert('요리를 그만두었습니다.\n\n재료는 그대로입니다.');
};

// ==========================================
// 7. 요리하기
// ==========================================
function haveAll(d) {
    const inv = (currentUser && currentUser.inventory) || [];
    const left = inv.slice();
    return d.mats.every(function (m) {
        const i = left.indexOf(m);
        if (i < 0) return false;
        left.splice(i, 1);
        return true;
    });
}

window.foodCook = function (id) {
    if (!currentUser) return;
    const d = dishOf(id);
    if (!d) return;
    if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
        showCustomAlert('격리 중에는 요리할 수 없습니다.'); return;
    }
    if (d.grade === 'S' && !isCook(currentUser)) {
        showCustomAlert('S 등급은 [' + COOK_TITLE + '] 칭호가 있어야 만들 수 있습니다.\n\n'
            + 'A 등급 이상을 ' + HI_NEED + '번 성공하면 받습니다. (지금 ' + (stat().hi || 0) + '번)');
        return;
    }
    if (!haveAll(d)) { showCustomAlert('재료가 모자랍니다.'); return; }

    miniOpen(d, function (ok) { finishCook(d, ok); });
};

function finishCook(d, ok) {
    // 재료는 성공하든 실패하든 들어간다
    d.mats.forEach(function (m) {
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, m, 1);
    });

    let made;
    if (!ok) {
        made = FAIL_ITEM;
        addHistoryLog(currentUser, '[식당] ' + d.name + ' 실패');
    } else {
        const star = (d.grade === 'S' && Math.random() < 0.01);
        made = star ? (d.name + ' ★') : d.name;
        const s = stat();
        s.ok = (s.ok || 0) + 1;
        if (d.grade === 'A' || d.grade === 'S') s.hi = (s.hi || 0) + 1;
        const bk = book();
        bk[d.id] = (bk[d.id] || 0) + 1;
        addHistoryLog(currentUser, '[식당] ' + made + ' 완성 (' + d.grade + '등급)');
    }
    currentUser.inventory.push(made);

    save({ inventory: 1, cookBook: 1, cookStat: 1, history: 1 });
    if (typeof saveSelfFull === 'function') saveSelfFull();
    if (typeof updateUI === 'function') updateUI();
    renderFood();

    if (!ok) {
        showCustomAlert('눈금을 놓쳤습니다.\n\n「' + FAIL_ITEM + '」이(가) 남았습니다.');
    } else {
        showCustomAlert('「' + made + '」 완성.\n\n' + effText(d)
            + (/ ★$/.test(made) ? '\n\n그릇 밑에 무언가 더 들어 있습니다.' : ''));
        checkCookTitle();
    }
}

// ==========================================
// 8. 먹기
// ==========================================
function eatDish(itemName) {
    const star = / ★$/.test(itemName);
    const d = dishByName(itemName);
    if (!d) return false;

    const msg = [];
    const e = d.eff;
    if (e.sat) {
        currentUser.satiety = Math.min(100, (currentUser.satiety || 0) + e.sat);
        currentUser.lastSatietyTime = Date.now();
        msg.push('포만감 +' + e.sat);
    }
    if (e.hunger) {
        currentUser.satiety = Math.max(0, (currentUser.satiety || 0) - e.hunger);
        currentUser.lastSatietyTime = Date.now();
        msg.push('포만감 -' + e.hunger);
    }
    if (e.cure) {
        currentUser.pollution = Math.max(0, (currentUser.pollution || 0) - e.cure);
        currentUser.lastPollutionTime = Date.now();
        msg.push('오염도 -' + e.cure + '%');
    }
    if (e.poll) {
        if (typeof applyPollutionToUser === 'function') applyPollutionToUser(currentUser, e.poll);
        else currentUser.pollution = Math.min(100, (currentUser.pollution || 0) + e.poll);
        msg.push('오염도 +' + e.poll + '%');
    }

    if (star) msg.push(rareBonus());

    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
    addHistoryLog(currentUser, '[식당] ' + itemName + ' 섭취');
    save({ inventory: 1, pollution: 1, satiety: 1, lastPollutionTime: 1, lastSatietyTime: 1, history: 1 });
    if (typeof saveSelfFull === 'function') saveSelfFull();
    if (typeof updateUI === 'function') updateUI();
    showCustomAlert(itemName + '\n\n' + msg.filter(Boolean).join('\n'));
    return true;
}

// S 등급 ★ — 공용시설 · 어둠 탐사 · 행운 중 한둘
function rareBonus() {
    const HOUR = 3600 * 1000;
    const pool = ['fac', 'dark', 'pct'];
    const howMany = Math.random() < 0.5 ? 1 : 2;
    const got = [];
    for (let i = 0; i < howMany && pool.length; i++) {
        const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        let v, word;
        if (k === 'fac') { v = 1 + Math.floor(Math.random() * 2); word = '공용시설 +' + v + '회'; }
        else if (k === 'dark') { v = 1 + Math.floor(Math.random() * 2); word = '어둠 탐사 +' + v + '회'; }
        else { v = 50 + Math.floor(Math.random() * 51); word = '행운 +' + v + '%'; }
        if (typeof ibAdd === 'function') ibAdd(currentUser, k, v, 24 * HOUR, '식당 ★');
        got.push(word);
    }
    return '★ ' + got.join(' · ') + ' (24시간)';
}

function eatFail() {
    if (typeof applyPollutionToUser === 'function') applyPollutionToUser(currentUser, 5);
    else currentUser.pollution = Math.min(100, (currentUser.pollution || 0) + 5);
    if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, FAIL_ITEM, 1);
    addHistoryLog(currentUser, '[식당] ' + FAIL_ITEM + ' 섭취 (오염도 +5%)');
    save({ inventory: 1, pollution: 1, lastPollutionTime: 1, history: 1 });
    if (typeof saveSelfFull === 'function') saveSelfFull();
    if (typeof updateUI === 'function') updateUI();
    showCustomAlert(FAIL_ITEM + '\n\n먹을 것이 아니었습니다. 오염도 +5%');
    return true;
}

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._food) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (cat && cat.effect === 'food_dish') { eatDish(itemName); return; }
            if (cat && cat.effect === 'food_fail') { eatFail(); return; }
            return _u.apply(this, arguments);
        };
        useInventoryItem._food = true;
        clearInterval(iv);
        console.log('[식당] 먹기 연결');
    }, 500);
})();

// ==========================================
// 9. 칭호
// ==========================================
function checkCookTitle() {
    if (!currentUser) return;
    if ((stat().hi || 0) < HI_NEED) return;
    if (!Array.isArray(currentUser.titles)) currentUser.titles = [];
    if (currentUser.titles.indexOf(COOK_ID) >= 0) return;
    // 예전 묶음이 이름으로 적어 둔 것은 번호로 옮긴다
    const old = currentUser.titles.indexOf(COOK_TITLE);
    if (old >= 0) currentUser.titles.splice(old, 1);
    currentUser.titles.push(COOK_ID);
    addHistoryLog(currentUser, '[칭호] ' + COOK_TITLE + ' 획득');
    save({ titles: 1, history: 1 });
    showCustomAlert('[' + COOK_TITLE + '] 칭호를 얻었습니다.\n\n이제 S 등급을 만들 수 있습니다.');
}

// ==========================================
// 10. 화면
// ==========================================
let foodTab = 'cook';
let foodGrade = 'D';

window.foodSwitch = function (t) { foodTab = t; renderFood(); };
window.foodGradeTab = function (g) { foodGrade = g; renderFood(); };

window.foodBuyMat = function (name) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const price = MAT_PRICE[name];
    if (!price || !currentUser) return;
    if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
        showCustomAlert('격리 중에는 살 수 없습니다.'); return;
    }
    if ((currentUser.points || 0) < price) {
        if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
        else showCustomAlert('포인트가 모자랍니다.');
        return;
    }
    currentUser.points -= price;
    currentUser.inventory.push(name);
    addHistoryLog(currentUser, '[식당] ' + name + ' 구입 (-' + price + ' P)');
    save({ points: 1, inventory: 1, history: 1 });
    if (typeof saveSelfFull === 'function') saveSelfFull();
    if (typeof updateUI === 'function') updateUI();
    renderFood();
};

function countOf(name) {
    return ((currentUser && currentUser.inventory) || []).filter(function (x) { return x === name; }).length;
}

function matRows(list, odd) {
    return list.map(function (x) {
        const n = x[0], p = x[1], have = countOf(n);
        return '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;'
            + ' padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.05);">'
            + '<div style="flex:1; min-width:0;">'
            + '<span style="font-size:11px; color:' + (odd ? '#c9a8ff' : '#ddd') + ';">' + n + '</span>'
            + (have ? '<span style="font-size:10px; color:#ff9800; margin-left:5px;">보유 ' + have + '</span>' : '')
            + '</div>'
            + '<button class="inv-btn inv-btn-use" style="flex-shrink:0;" onclick="foodBuyMat(\'' + n + '\')">'
            + p + ' P</button></div>';
    }).join('');
}

function dishCard(d, showBtn) {
    const bk = book();
    const made = bk[d.id] || 0;
    const ok = haveAll(d);
    const locked = (d.grade === 'S' && !isCook(currentUser));
    const can = ok && !locked;
    return '<div style="border:1px solid ' + (can ? GCOLOR[d.grade] + '66' : '#2a2a2a') + ';'
        + ' border-left:3px solid ' + GCOLOR[d.grade] + '; border-radius:6px; padding:11px;'
        + ' margin-bottom:8px; background:rgba(0,0,0,0.25);' + (can ? '' : ' opacity:0.72;') + '">'
        + '<div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">'
        + '<span style="font-size:12px; font-weight:bold; color:' + GCOLOR[d.grade] + ';">' + d.name + '</span>'
        + '<span style="font-size:10px; color:#888;">' + d.grade + '등급'
        + (made ? ' · 만든 횟수 ' + made : '') + '</span></div>'
        + (made
            ? '<div style="font-size:10px; color:#9fd0ff; margin:5px 0 6px 0;">' + effText(d) + '</div>'
            : '<div style="font-size:10px; color:#666; margin:5px 0 6px 0;">'
              + '??? <span style="font-size:9px;">— 한 번 만들어 보면 알 수 있습니다.</span></div>')
        + '<div style="font-size:10px; line-height:1.7;">'
        + d.mats.map(function (m) {
            const h = countOf(m) > 0;
            const isOdd = ODD_N.indexOf(m) >= 0;
            return '<span style="color:' + (h ? (isOdd ? '#c9a8ff' : '#4CAF50') : '#777') + ';">'
                + (h ? '✔' : '○') + ' ' + m + '</span>';
        }).join('<span style="color:#444;"> · </span>')
        + '</div>'
        + (locked ? '<div style="font-size:10px; color:#ff8a65; margin-top:6px;">['
            + COOK_TITLE + '] 칭호가 있어야 만들 수 있습니다.</div>' : '')
        + (showBtn ? (can
            ? '<button class="game-btn" style="width:100%; margin:9px 0 0 0; padding:9px; font-size:11px;'
              + ' background:linear-gradient(145deg,#7f5a00,#4a3300) !important;'
              + ' border-color:#b07000 !important; color:#ffd9a0 !important;"'
              + ' onclick="foodCook(' + d.id + ')">만든다</button>'
            : '<button class="game-btn" style="width:100%; margin:9px 0 0 0; padding:9px; font-size:11px;'
              + ' background:#161616 !important; border-color:#333 !important; color:#8a8a8a !important;'
              + ' cursor:default;" disabled>' + (locked ? '칭호가 필요합니다' : '재료가 모자랍니다')
              + '</button>') : '')
        + '</div>';
}

window.renderFood = function () {
    const box = document.getElementById('food-body');
    if (!box || !currentUser) return;
    const s = stat();

    const tab = function (id, label) {
        return '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;'
            + (foodTab === id ? ' background:linear-gradient(145deg,#7f5a00,#4a3300) !important;'
                + ' border-color:#b07000 !important; color:#ffd9a0 !important;' : '')
            + '" onclick="foodSwitch(\'' + id + '\')">' + label + '</button>';
    };

    let body = '';
    if (foodTab === 'mat') {
        body = '<div style="font-size:10px; color:#d4af37; font-weight:bold; margin:4px 0 6px 0;">평범한 재료</div>'
            + matRows(PLAIN, false)
            + '<div style="font-size:10px; color:#c9a8ff; font-weight:bold; margin:14px 0 6px 0;">괴상한 재료</div>'
            + '<div style="font-size:10px; color:#777; margin-bottom:4px; line-height:1.6;">'
            + '이것들끼리만 섞으면 좋은 일은 없습니다.</div>'
            + matRows(ODD, true);
    } else {
        const gtabs = '<div style="display:flex; gap:4px; margin:10px 0 12px 0;">'
            + GRADES.map(function (g) {
                return '<button class="game-btn" style="flex:1; margin:0; padding:7px 2px; font-size:11px;'
                    + (foodGrade === g ? ' border-color:' + GCOLOR[g] + ' !important; color:'
                        + GCOLOR[g] + ' !important;' : '')
                    + '" onclick="foodGradeTab(\'' + g + '\')">' + g + '</button>';
            }).join('') + '</div>';
        // 만들어 본 것을 위로 올린다 (많이 만든 순, 그다음은 본래 차례)
        const bk0 = book();
        const list = DISHES.filter(function (d) { return d.grade === foodGrade; })
            .slice().sort(function (a, b) {
                const ma = bk0[a.id] || 0, mb = bk0[b.id] || 0;
                if (ma !== mb) return mb - ma;
                return a.id - b.id;
            });
        if (foodTab === 'book') {
            const madeN = list.filter(function (d) { return bk0[d.id]; }).length;
            body = gtabs
                + '<div style="font-size:10px; color:#888; margin-bottom:9px;">'
                + foodGrade + '등급 ' + madeN + ' / ' + list.length + '가지를 만들어 봤습니다.</div>'
                + list.map(function (d) { return dishCard(d, false); }).join('');
        } else {
            const madeN = list.filter(function (d) { return bk0[d.id]; }).length;
            body = gtabs
                + '<div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.6;">'
                + (madeN ? '만들어 본 ' + madeN + '가지를 위에 두었습니다. ' : '')
                + '효과는 한 번 만들어 보면 알 수 있습니다. <span style="color:#666;">'
                + '(레시피 북에서도 볼 수 있습니다)</span></div>'
                + list.map(function (d) { return dishCard(d, true); }).join('');
        }
    }

    box.innerHTML =
        '<div style="font-size:10px; color:#888; margin-bottom:10px; line-height:1.7;">'
        + '재료를 섞어 요리를 만듭니다. 만들 때마다 눈금을 맞춰야 합니다.<br>'
        + '<span style="color:#666;">요리 ' + DISHES.length + '가지 · 성공 ' + (s.ok || 0) + '번 · '
        + 'A 등급 이상 ' + (s.hi || 0) + ' / ' + HI_NEED + '번'
        + (isCook(currentUser) ? ' <span style="color:#d4af37;">· 🍳 ' + COOK_TITLE + '</span>' : '')
        + '</span></div>'
        + '<div style="display:flex; gap:6px; margin-bottom:12px;">'
        + tab('cook', '요리하기') + tab('mat', '재료 구입') + tab('book', '레시피 북')
        + '</div>' + body;
};

// ==========================================
// 11. 소지품 분류에 [행복 식당] 칸을 만든다
//
//   invcat.js 가 소지품 카드를 칸별로 나눈다. 거기에 칸 하나를 더 끼우고,
//   식당에서 나온 것(요리 · ★ · 실패한 요리)을 그쪽으로 보낸다.
//   재료는 「음식」 칸에 그대로 둔다.
// ==========================================
const INV_CAT = { id: 'food_shop', name: '행복 식당', icon: '🍳', color: '#ffb74d' };

(function invTab() {
    const iv = setInterval(function () {
        if (typeof INV_CATS === 'undefined' || typeof invCatOf !== 'function') return;
        if (invCatOf._foodShop) { clearInterval(iv); return; }

        // 「기타」 바로 앞에 끼운다
        if (!INV_CATS.some(function (c) { return c.id === INV_CAT.id; })) {
            let at = -1;
            INV_CATS.forEach(function (c, i) { if (c.id === 'etc' && at < 0) at = i; });
            if (at >= 0) INV_CATS.splice(at, 0, INV_CAT); else INV_CATS.push(INV_CAT);
        }

        const _c = invCatOf;
        invCatOf = function (name) {
            const cat = (typeof ITEM_CATALOG !== 'undefined') && ITEM_CATALOG[name];
            if (cat && cat.foodDish) return INV_CAT.id;
            return _c.apply(this, arguments);
        };
        invCatOf._foodShop = true;
        clearInterval(iv);
        if (typeof renderInventory === 'function') { try { renderInventory(); } catch (e) { } }
        console.log('[식당] 소지품에 [행복 식당] 칸을 만들었습니다.');
    }, 400);
})();

// ==========================================
// 12. 확인
// ==========================================
window.foodState = function () {
    console.log('%c===== 행복 식당 =====', 'color:#d4af37; font-size:13px');
    console.log('  요리:', DISHES.length + '가지');
    const by = {};
    DISHES.forEach(function (d) {
        const k = d.grade + '/' + d.kind;
        by[k] = (by[k] || 0) + 1;
    });
    console.table(GRADES.map(function (g) {
        return { 등급: g, 재료수: MATS_BY_GRADE[g],
            평범만: by[g + '/good'] || 0, 섞음: by[g + '/mix'] || 0, 괴상만: by[g + '/bad'] || 0,
            눈금: MINI[g].zone + '% · ' + MINI[g].rounds + '번' };
    }));
    if (!currentUser) return;
    const s = stat();
    console.log('  내 성공:', s.ok || 0, '· A 이상:', (s.hi || 0) + ' / ' + HI_NEED,
        '· 요리사:', isCook(currentUser) ? 'O' : '-');
    console.log('  먹기 연결:', (typeof useInventoryItem === 'function' && useInventoryItem._food) ? 'O' : '✗');
};
window.foodBook = function () {
    if (!currentUser) return;
    const bk = book();
    const rows = DISHES.filter(function (d) { return bk[d.id]; });
    console.log('%c===== 만들어 본 요리 =====', 'color:#d4af37; font-size:13px');
    if (!rows.length) { console.log('  아직 없습니다.'); return; }
    console.table(rows.map(function (d) {
        return { 번호: d.id, 이름: d.name, 등급: d.grade, 횟수: bk[d.id], 효과: effText(d) };
    }));
};
window.foodDish = function (id) {
    const d = dishOf(id);
    if (!d) { console.log('그런 번호가 없습니다.'); return; }
    console.log('%c' + d.name + ' (' + d.grade + '등급)', 'color:' + GCOLOR[d.grade] + '; font-size:13px');
    console.log('  재료:', d.mats.join(' · '));
    console.log('  효과:', effText(d));
    console.log('  유형:', { good: '평범만', mix: '섞음', bad: '괴상만' }[d.kind]);
};
window.FOOD_DISHES = DISHES;

console.log('[식당] 행복 식당 — 요리 ' + DISHES.length + '가지 · foodState()');

})();
