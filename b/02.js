// ==========================================
// 묶음 02.js — 11개
// build.mjs 가 만든 것입니다. 여기를 고치지 말고 원본 파일을 고치세요.
// ==========================================

// ---------- thirdslot.js ----------
// ==========================================
// ★ 세 번째 자리 — 재료와 조합
// index.html 에서 dark.js 다음에 불러온다
// ==========================================

// --- 재료 ---
ITEM_CATALOG['덮이지 않은 장'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 책이 덮일 때 딸려 나온 한 장. 접히지 않는다."
};
ITEM_CATALOG['아물지 않은 자리'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 물린 자국이 아니라 물기 전의 자리. 아직 비어 있다."
};
ITEM_CATALOG['떠오르지 않는 숨'] = {
    price: 2400, usable: false, darkOnly: true,
    desc: "[조합 재료] 내쉬었는데 올라가지 않았다. 손안에서 무겁다."
};

// --- 드롭 등록 (기존 재료의 1/5 확률) ---
(function registerThirdMats() {
    const base = { '맞물리지 않는 조각': 0, '지워지지 않는 자국': 0, '반죽에 섞이지 않은 것': 0 };

    Object.keys(DARK_LOOT_BY_ZONE).forEach(z => {
        DARK_LOOT_BY_ZONE[z].forEach(l => {
            if (base[l.name] !== undefined && l.chance > base[l.name]) base[l.name] = l.chance;
        });
    });

    const avg = (base['맞물리지 않는 조각'] + base['지워지지 않는 자국'] + base['반죽에 섞이지 않은 것']) / 3;
    const rate = (avg > 0 ? avg : 0.05) / 5;

    const add = (zone, name) => {
        if (!DARK_LOOT_BY_ZONE[zone]) DARK_LOOT_BY_ZONE[zone] = [];
        if (DARK_LOOT_BY_ZONE[zone].some(l => l.name === name)) return;
        DARK_LOOT_BY_ZONE[zone].push({ name: name, chance: rate });
    };

    add('Qtrew-S-003', '덮이지 않은 장');
    add('Qtrew-S-010', '아물지 않은 자리');
    add('Qtrew-A-667', '떠오르지 않는 숨');

    console.log(`[세 번째 자리] 재료 드롭률 ${(rate * 100).toFixed(2)}% (기존 재료의 1/5)`);
})();

// --- 조합 ---
const THIRD_MATS = ['덮이지 않은 장', '아물지 않은 자리', '떠오르지 않는 숨'];

function hasThirdMats() {
    if (!currentUser) return false;
    return THIRD_MATS.every(m => (currentUser.inventory || []).includes(m));
}

function combineThirdSlot() {
    if (!buyGuard()) return;
    const g = getGear(currentUser);
    if (!g) { showCustomAlert('전용 장비가 없습니다.'); return; }
    if ((g.slots || 1) < 2) { showCustomAlert('두 번째 자리를 먼저 열어야 합니다.'); return; }
    if ((g.slots || 1) >= 3) { showCustomAlert('이미 세 자리가 모두 열려 있습니다.'); return; }
    if ((currentUser.inventory || []).includes('세 번째 자리')) {
        showCustomAlert('이미 조합해 둔 것이 있습니다.'); return;
    }
    if (!hasThirdMats()) { showCustomAlert('재료가 모자랍니다.'); return; }

    THIRD_MATS.forEach(m => removeItemFromInventory(currentUser, m, 1));
    currentUser.inventory.push('세 번째 자리');
    addHistoryLog(currentUser, `[조합] 세 번째 자리를 만들었습니다.`);
    saveSelfFull();
    updateUI();

    showCustomAlert(
        '세 조각이 맞물립니다.\n\n' +
        '덮이지 않은 장이 자리를 만들고,\n' +
        '아물지 않은 자리가 그것을 붙잡고,\n' +
        '떠오르지 않는 숨이 그 안을 채웁니다.\n\n' +
        '소지품에서 사용하세요.'
    );
}
;

// ---------- newitems.js ----------
// ==========================================
// ★ 신규 아이템 50종
// index.html 에서 thirdslot.js 다음에 불러온다
// ==========================================
//
// 물약 10 · ??? S-003 전용 10 · ??? 범용 20 · 우주 쇼핑몰 10

// ==========================================
// 횟수형 효과 저장소
// ==========================================
function nBag(user) {
    user = user || currentUser;
    if (!user) return {};
    if (!user.nFlags) user.nFlags = {};
    return user.nFlags;
}
function nPend(user) {
    user = user || currentUser;
    if (!user) return {};
    if (!user.nPending) user.nPending = {};
    return user.nPending;
}
function nAdd(key, n) {
    if (!currentUser) return;
    const bag = darkRun ? nBag() : nPend();
    bag[key] = (bag[key] || 0) + (n || 1);
}
function nHas(key) {
    return !!(currentUser && currentUser.nFlags && currentUser.nFlags[key] > 0);
}
function nUse(key) {
    if (!nHas(key)) return false;
    currentUser.nFlags[key]--;
    if (currentUser.nFlags[key] <= 0) delete currentUser.nFlags[key];
    return true;
}

(function hookMove() {
    if (typeof moveUserQFlags !== 'function') return;
    const _move = moveUserQFlags;
    moveUserQFlags = function () {
        const r = _move.apply(this, arguments);
        if (currentUser && currentUser.nPending) {
            currentUser.nFlags = Object.assign({}, currentUser.nPending);
            currentUser.nPending = {};
        }
        return r;
    };
})();

// ==========================================
// 물약 10종
// ==========================================
const NEW_POTIONS = {
    "두리안맛 물약":   { effect:"p_durian", desc:"사용 시 하루 동안 성별과 무관하게 모유가 난다." },
    "리치맛 물약":     { effect:"p_lychee", desc:"사용 시 하루 동안 공용 육변기·육자지가 된다." },
    "망고맛 물약":     { effect:"p_mango",  desc:"사용 시 하루 동안 성별과 무관하게 아랫배에 자궁 문신이 새겨진다." },
    "메론맛 물약":     { effect:"p_melon",  desc:"사용 시 하루 동안 정액이나 애액이 끊이지 않는다." },
    "딸기맛 물약":     { effect:"p_berry",  desc:"사용 시 하루 동안 확정적으로 임신한 상태가 된다." },
    "감자맛 물약":     { effect:"p_potato", desc:"사용 시 하루 동안 행운이 100 오른다. 공용시설 승률이 크게 뛴다." },
    "고구마맛 물약":   { effect:"p_sweet",  desc:"사용 시 하루 동안 클리·자지가 거대해진다." },
    "수박맛 물약":     { effect:"p_melon2", desc:"사용 시 하루 동안 오감 중 하나를 무작위로 잃는다." },
    "먹물맛 물약":     { effect:"p_ink",    desc:"사용 시 하루 동안 회피 판정에 +2." },
    "블루베리맛 물약": { effect:"p_blue",   desc:"세 시간 동안 어떤 물음에도 '네'라고만 답하게 된다." }
};
Object.keys(NEW_POTIONS).forEach(n => {
    ITEM_CATALOG[n] = { price: 4000, usable: true, targetable: true,
        effect: NEW_POTIONS[n].effect, desc: NEW_POTIONS[n].desc };
});
const SENSE_LIST = ['시각', '청각', '후각', '미각', '촉각'];

// ==========================================
// ??? — S-003 전용 10종
// ==========================================
const S003_ITEMS = {
    "뜯어낸 목차":      { price:1200, effect:"s3_index",  desc:"[???] 찢어진 장을 찾는 탐색 1회가 반드시 성공한다." },
    "남의 배역표":      { price:1400, effect:"s3_cast",   desc:"[???] 이름이 불리기 전에, 남은 자리 중 하나를 골라 맡는다." },
    "물린 손수건":      { price:900,  effect:"s3_taboo",  desc:"[???] 금기를 한 번 어겨도 없던 일이 된다." },
    "접힌 귀퉁이":      { price:1100, effect:"s3_fold",   desc:"[???] 이번 탐사의 이해도 상승이 30% 줄어든다." },
    "삼킨 마침표":      { price:1600, effect:"s3_period", desc:"[???] 이해도가 한계를 넘어도 한 번은 버틴다." },
    "빈 삽화":          { price:1000, effect:"s3_plate",  desc:"[???] 다음 기믹에서 안전한 선택지가 표시된다." },
    "연필 끝":          { price:800,  effect:"s3_pencil", desc:"[???] 적는 단계의 오답 1회를 없던 것으로 한다." },
    "덧쓴 이름":        { price:1300, effect:"s3_name",   desc:"[???] 이름이 불릴 때 한 번은 대답하지 않아도 된다." },
    "마지막 줄의 여백": { price:1800, effect:"s3_margin", desc:"[???] 마지막 판정에 +5." },
    "읽어 준 목소리":   { price:2000, effect:"s3_voice",  desc:"[???] 사용 즉시 이해도가 15 내려간다. 탐사 중에만." }
};
Object.keys(S003_ITEMS).forEach(n => {
    const it = S003_ITEMS[n];
    ITEM_CATALOG[n] = { price: it.price, usable: true, targetable: false, effect: it.effect, qShop: true, desc: it.desc };
});

// ==========================================
// ??? — 범용 20종
// ==========================================
const COMMON_ITEMS = {
    "덧댄 밑창":     { price:600,  effect:"c_sole",    desc:"[???] 이번 탐사의 합류·이동 판정에 +3." },
    "두꺼운 장갑":   { price:550,  effect:"c_glove2",  desc:"[???] 만지는 판정 2회를 안전하게 넘긴다." },
    "방수 주머니":   { price:500,  effect:"c_pouch",   desc:"[???] 반입품 1개가 소실되지 않는다." },
    "비상 호루라기": { price:700,  effect:"c_whistle", desc:"[???] 구조와 합류 판정에 +5." },
    "마른 성냥":     { price:450,  effect:"c_match",   desc:"[???] 어두운 곳에서 판정에 +3. 탐사 1회 지속." },
    "두 겹 마스크":  { price:800,  effect:"c_mask2",   desc:"[???] 오염 상승 2회를 막는다." },
    "얇은 철사":     { price:600,  effect:"c_wire",    desc:"[???] 잠긴 것 2개를 연다." },
    "작은 거울":     { price:650,  effect:"c_mirror",  desc:"[???] 시선 판정 2회를 무효화한다." },
    "접이식 지도":   { price:900,  effect:"c_map2",    desc:"[???] 찾지 못한 물건 2개의 위치가 드러난다." },
    "무게추":        { price:500,  effect:"c_weight",  desc:"[???] 균형을 재는 판정 1회가 자동 성공한다." },
    "메모지 묶음":   { price:400,  effect:"c_memo",    desc:"[???] 적는 단계에서 힌트를 한 번 볼 수 있다." },
    "연고":          { price:350,  effect:"heal", value:12, desc:"[???] 오염도가 12% 회복된다." },
    "진통제":        { price:600,  effect:"c_pain",    desc:"[???] 치명적인 상황을 한 번 중상으로 바꾼다. 오염도가 크게 오른다." },
    "보온병":        { price:550,  effect:"c_flask",   desc:"[???] 포만감이 20 회복된다." },
    "예비 배터리":   { price:700,  effect:"c_batt",    desc:"[???] 이번 탐사의 모든 판정에 +1." },
    "낡은 목줄":     { price:850,  effect:"c_leash",   desc:"[???] 흩어지는 상황을 한 번 넘긴다." },
    "납작한 돌":     { price:300,  effect:"c_stone",   desc:"[???] 주목도가 15 내려간다." },
    "실뭉치":        { price:750,  effect:"c_thread",  desc:"[???] 이번 탐사에서 길을 잃지 않는다." },
    "깨끗한 붕대":   { price:900,  effect:"c_gauze",   desc:"[???] 이번 탐사의 감염도 상승이 30% 줄어든다." },
    "눈가리개":      { price:1000, effect:"c_blind",   desc:"[???] 오래 보아서 생기는 치명적 상황을 한 번 넘긴다." }
};
Object.keys(COMMON_ITEMS).forEach(n => {
    const it = COMMON_ITEMS[n];
    ITEM_CATALOG[n] = Object.assign(
        { price: it.price, usable: true, targetable: false, effect: it.effect, qShop: true, desc: it.desc },
        it.value != null ? { value: it.value } : {}
    );
});

// ==========================================
// 우주 쇼핑몰 10종
// ==========================================
ITEM_CATALOG["루비 클리 피어싱"] = { price:5521, usable:true, targetable:true, effect:"equip_ruby_clit",
    desc:"루비 유두 피어싱과 한 쌍. 타인이 채워 주었을 때만 힘이 돈다. 어둠에서 회피 +2, 하루 한 번 기믹을 부순다. 세트로 갖추면 두 번이 된다." };
ITEM_CATALOG["루비 유두 피어싱"] = { price:5521, usable:true, targetable:true, effect:"equip_ruby_nip",
    desc:"루비 클리 피어싱과 한 쌍. 타인이 채워 주었을 때만 힘이 돈다. 공용시설 행운 200% 상승, 어둠에서 하루 두 번 다시 굴릴 수 있다. 세트로 갖추면 네 번이 된다." };
ITEM_CATALOG["사인참사검"] = { price:9999, usable:true, targetable:false, effect:"equip_sain",
    desc:"삿된 것을 물리치는 검. 날은 무디나 삿된 것들은 한 번에 흐트러트린다. 하루 세 번 기믹을 부수고, 행운 판정에 +2." };
ITEM_CATALOG["사원증 뱃지"] = { price:5999, usable:true, targetable:false, effect:"equip_badge",
    desc:"오래된 사원증 뱃지. 장착 시 슬롯머신의 당첨 확률이 상승한다." };
ITEM_CATALOG["가터밸트"] = { price:4000, usable:true, targetable:true, effect:"equip_garter",
    desc:"장착 시 오염도 상승이 절반으로 줄어든다. 24시간이 지나면 끊어져 사라진다." };
ITEM_CATALOG["??? 안경"] = { price:3000, usable:true, targetable:false, effect:"equip_glasses",
    desc:"보이지 않던 것이 보인다. 착용 시 행운 판정에 +2. 48시간이 지나면 내구도가 다해 깨진다." };
ITEM_CATALOG["유리구슬"] = { price:700, usable:true, targetable:false, effect:"glass_bead",
    desc:"사용 시 다섯 시간 동안 행운이 300% 늘어난다." };
ITEM_CATALOG["■■ 씨앗"] = { price:400, usable:true, targetable:false, effect:"black_seed",
    desc:"■■■를 넣지 마세요." };
ITEM_CATALOG["소원권"] = { price:5000000, usable:true, targetable:false, effect:"wish_ticket", noSell:true,
    desc:"사용 시 ??? 에게 소원을 적어 보낼 수 있다." };
ITEM_CATALOG["도깨비 불"] = { price:1234567, usable:true, targetable:false, effect:"equip_dokkaebi",
    desc:"착용 시 도깨비 불을 부릴 수 있다. 행운 100% 상승, 상태이상 면역, 어둠의 갈림길에서 유리한 쪽이 드러난다." };

EQUIP_AFFIL["사인참사검"]  = "재난관리";
EQUIP_AFFIL["유리구슬"]    = "재난관리";
EQUIP_AFFIL["도깨비 불"]   = "재난관리";
EQUIP_AFFIL["사원증 뱃지"] = "백일몽";
EQUIP_AFFIL["■■ 씨앗"]    = "백일몽";
EQUIP_AFFIL["소원권"]      = "백일몽";

["루비 클리 피어싱","루비 유두 피어싱","사인참사검","사원증 뱃지","가터밸트",
 "??? 안경","유리구슬","■■ 씨앗","소원권","도깨비 불"]
 .concat(Object.keys(NEW_POTIONS))
 .forEach(n => {
    if (!ALIEN_ITEMS_POOL.includes(n)) ALIEN_ITEMS_POOL.push(n);
});
if (typeof NO_SELL_ITEMS !== 'undefined') NO_SELL_ITEMS.push("소원권");

window.RARE_ALIEN_RATE = {
    "다이아 애널 플러그": 0.01,
    "다이아 보지 플러그": 0.01,
    "루비 클리 피어싱": 0.005,
    "루비 유두 피어싱": 0.005,
    "사인참사검": 0.005,
    "소원권": 0.01,
    "도깨비 불": 0.01
};

// ==========================================
// 우주 장비 판정
// ==========================================
function rubyActive(user, name) {
    if (typeof plugActive === 'function') return plugActive(user, name);
    if (!user || !user.equippedWeapons) return false;
    return user.equippedWeapons.some(w => {
        if (getEquipBaseName(w) !== name) return false;
        const o = getEquipOwner(user, w);
        return o && o !== user.code;
    });
}
function hasWear(name) {
    return currentUser && typeof hasEquip === 'function' && hasEquip(currentUser, name);
}

function smashCharges() {
    if (!currentUser) return 0;
    let n = currentUser.dnaSmash || 0;
    const clit = rubyActive(currentUser, '루비 클리 피어싱');
    const nip  = rubyActive(currentUser, '루비 유두 피어싱');
    if (clit) n += nip ? 2 : 1;
    if (hasWear('사인참사검')) n += 3;
    return n;
}
function smashLeft() {
    const cap = smashCharges();
    if (cap === 0) return 0;
    if (currentUser.smashDate !== getTodayStr()) return cap;
    return Math.max(0, cap - (currentUser.smashUsed || 0));
}
function smashAvailable() {
    return !!darkRun && smashLeft() > 0;
}
function rubySmash() {
    if (!smashAvailable()) return;
    if (currentUser.smashDate !== getTodayStr()) {
        currentUser.smashDate = getTodayStr();
        currentUser.smashUsed = 0;
    }
    currentUser.smashUsed = (currentUser.smashUsed || 0) + 1;
    const left = smashLeft();
    const sword = hasWear('사인참사검');

    darkRun.success += 2;
    darkRun.modifier = (darkRun.modifier || 0) + 1;
    darkRun.log.push(`[${sword ? '사인참사검' : '루비'}] 기믹 파괴 (잔여 ${left})`);
    saveFields({ smashDate:1, smashUsed:1, history:1 });
    if (darkRun.isParty && typeof sendPartyChat === 'function')
        sendPartyChat(`${currentUser.name} 사원 쪽에서 붉은 빛이 번졌습니다.`, true);

    darkBodyEl().innerHTML = darkBox(sword ? '사인참사검' : '루비',
        sword
            ? `칼을 뽑는다. 날이 무디다.<br><br>
               그런데 앞을 막고 있던 것이 흐트러진다. 베인 게 아니라 흩어진 것이다.<br>
               삿된 것은 베는 게 아니라 물리치는 것이다.<br><br>
               <span style="font-size:11px; color:#888;">금일 잔여 ${left}회</span>`
            : `붉은 빛이 몸 안쪽에서 번진다.<br><br>
               앞을 막고 있던 것이 부서진다. 소리는 나지 않았다.<br><br>
               <span style="font-size:11px; color:#888;">금일 잔여 ${left}회</span>`,
        darkChoiceBtn('지나간다.', `partyAdvance(${darkRun.step + 1})`));
    mountDarkChat('normal');
}

function rerollCharges() {
    if (!currentUser) return 0;
    const clit = rubyActive(currentUser, '루비 클리 피어싱');
    const nip  = rubyActive(currentUser, '루비 유두 피어싱');
    if (!nip) return 0;
    return clit ? 4 : 2;
}
function rerollLeft() {
    const cap = rerollCharges();
    if (cap === 0) return 0;
    if (currentUser.rubyDate !== getTodayStr()) return cap;
    return Math.max(0, cap - (currentUser.rubyUsed || 0));
}

(function hookReroll() {
    if (typeof luckReroll !== 'function') return;
    const _lr = luckReroll;
    luckReroll = function (roll) {
        roll = _lr.apply(this, arguments);
        if (!darkRun || roll > 8 || rerollLeft() <= 0) return roll;
        if (currentUser.rubyDate !== getTodayStr()) {
            currentUser.rubyDate = getTodayStr();
            currentUser.rubyUsed = 0;
        }
        currentUser.rubyUsed = (currentUser.rubyUsed || 0) + 1;
        const nr = Math.floor(Math.random() * 20) + 1;
        darkRun.log.push(`[루비] 재굴림 ${roll} → ${nr} (잔여 ${rerollLeft()})`);
        if (typeof showDarkToast === 'function') showDarkToast(`◈ 루비의 빛 — 다시 굴린다. (${roll} → ${nr})`);
        saveFields({ rubyDate:1, rubyUsed:1 });
        return nr;
    };
})();

// 선택지 렌더 후처리 — 유리한 쪽 표시 + 파괴 버튼
(function hookChoice() {
    if (typeof renderChoiceStep !== 'function') return;
    const _rc = renderChoiceStep;
    renderChoiceStep = function (title, text, options, imgKey) {
        try {
            if (hasWear('도깨비 불') && Array.isArray(options) && options.length
                && typeof options[0].label === 'string' && !options[0].label.startsWith('◈')) {
                options[0].label = '◈ ' + options[0].label;
            }
        } catch (e) {}
        const r = _rc.apply(this, arguments);
        try {
            if (!smashAvailable()) return r;
            const body = darkBodyEl();
            if (!body || document.getElementById('smash-btn')) return r;
            const sword = hasWear('사인참사검');
            body.insertAdjacentHTML('beforeend',
                `<button id="smash-btn" class="game-btn" style="width:100%; margin:8px 0 0 0; padding:12px; font-size:12px; background:linear-gradient(145deg,#7a1f3a,#40101f) !important; border-color:#c2185b !important; color:#fff !important;" onclick="rubySmash()">◈ ${sword ? '사인참사검으로 흩어 버린다' : '루비의 빛으로 부순다'} (잔여 ${smashLeft()}회)</button>`);
        } catch (e) {}
        return r;
    };
})();

// ==========================================
// 사용 처리
// ==========================================
const NEW_USE = {
    s3_index:  { key:'s3_find',   n:1, msg:'목차를 손에 쥐었습니다. 다음 탐색은 헛돌지 않습니다.' },
    s3_cast:   { key:'s3_cast',   n:1, msg:'남의 배역표를 외웠습니다. 배역을 고를 수 있습니다.' },
    s3_taboo:  { key:'s3_taboo',  n:1, msg:'손수건을 물었습니다. 금기를 한 번 어겨도 넘어갑니다.' },
    s3_fold:   { key:'s3_fold',   n:1, msg:'귀퉁이를 접어 두었습니다. 이해도가 덜 오릅니다.' },
    s3_period: { key:'s3_period', n:1, msg:'마침표를 삼켰습니다. 한 번은 버팁니다.' },
    s3_plate:  { key:'safe_hint', n:1, msg:'빈 삽화를 펼쳤습니다. 다음 기믹에서 한쪽이 보입니다.', useQ:true },
    s3_pencil: { key:'quiz_undo', n:1, msg:'연필 끝을 남겨 두었습니다. 오답 하나를 고칠 수 있습니다.', useQ:true },
    s3_name:   { key:'no_mark',   n:1, msg:'이름을 덧써 두었습니다. 한 번은 불려도 됩니다.', useQ:true },
    s3_margin: { key:'s3_margin', n:1, msg:'여백을 확보했습니다. 마지막 판정에 +5.' },

    c_sole:    { key:'c_sole',   n:1, msg:'밑창을 덧댔습니다. 합류와 이동이 수월해집니다.' },
    c_glove2:  { key:'safe_touch', n:2, msg:'장갑을 꼈습니다. 만지는 판정 두 번이 안전합니다.' },
    c_pouch:   { key:'c_pouch',  n:1, msg:'주머니에 넣었습니다. 하나는 잃지 않습니다.' },
    c_whistle: { key:'c_whistle',n:1, msg:'호루라기를 챙겼습니다. 구조와 합류에 +5.' },
    c_match:   { key:'c_match',  n:1, msg:'성냥을 챙겼습니다. 어두운 곳에서 +3.' },
    c_mask2:   { key:'block_poll', n:2, msg:'마스크를 두 겹 썼습니다. 오염 상승 두 번을 막습니다.' },
    c_wire:    { key:'force_open', n:2, msg:'철사를 챙겼습니다. 잠긴 것 둘을 열 수 있습니다.' },
    c_mirror:  { key:'immune_sight', n:2, msg:'거울을 들었습니다. 시선 판정 두 번이 무효가 됩니다.' },
    c_map2:    { key:'reveal_doc', n:2, msg:'지도를 펼쳤습니다. 두 곳이 드러납니다.' },
    c_weight:  { key:'c_weight', n:1, msg:'무게추를 챙겼습니다. 균형 판정 하나가 자동으로 맞습니다.' },
    c_memo:    { key:'c_memo',   n:1, msg:'메모지를 챙겼습니다. 힌트를 한 번 볼 수 있습니다.' },
    c_pain:    { key:'c_pain',   n:1, msg:'진통제를 삼켰습니다. 한 번은 죽지 않고 버팁니다.' },
    c_batt:    { key:'c_batt',   n:1, msg:'배터리를 갈았습니다. 이번 탐사 판정에 +1.' },
    c_leash:   { key:'c_leash',  n:1, msg:'목줄을 묶었습니다. 흩어지지 않습니다.' },
    c_thread:  { key:'c_thread', n:1, msg:'실을 풀며 갑니다. 길을 잃지 않습니다.' },
    c_gauze:   { key:'c_gauze',  n:1, msg:'붕대를 감았습니다. 감염이 덜 퍼집니다.' },
    c_blind:   { key:'c_blind',  n:1, msg:'눈가리개를 챙겼습니다. 오래 보아도 한 번은 괜찮습니다.' }
};

const NEW_EQUIP = ['equip_ruby_clit','equip_ruby_nip','equip_sain','equip_badge',
                   'equip_garter','equip_glasses','equip_dokkaebi'];

(function hookUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat) return _use.apply(this, arguments);
        const mine = NEW_EQUIP.includes(cat.effect) || NEW_USE[cat.effect] ||
            ['c_flask','c_stone','s3_voice','glass_bead','black_seed','wish_ticket'].includes(cat.effect);
        if (!mine) return _use.apply(this, arguments);

        if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
            showCustomAlert('격리 중에는 소지품을 사용할 수 없습니다.'); return;
        }
        if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
            showCustomAlert('착용 조건이 맞지 않습니다.'); return;
        }

        // --- 우주 장비 ---
        if (NEW_EQUIP.includes(cat.effect)) {
            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.length >= 8) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
            currentUser.equippedWeapons.push(itemName);
            if (typeof setEquipOwner === 'function') setEquipOwner(currentUser, itemName, currentUser.code);
            if (cat.effect === 'equip_garter') currentUser.garterExpire = Date.now() + 24 * 3600 * 1000;
            if (cat.effect === 'equip_glasses') currentUser.glassesExpire = Date.now() + 48 * 3600 * 1000;
            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, `[장비 장착] ${itemName}`);
            saveSelfFull(); updateUI();
            showCustomAlert(
                (cat.effect === 'equip_ruby_clit' || cat.effect === 'equip_ruby_nip')
                    ? '채웠습니다.\n\n다만 스스로 채운 것에는 힘이 돌지 않습니다.'
                    : `${itemName}을(를) 장착했습니다.`);
            return;
        }

        if (cat.effect === 'glass_bead') {
            addTimedEffect(currentUser, '유리구슬', '행운 300% 상승', 5);
            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, `[아이템 사용] 유리구슬`);
            saveSelfFull(); updateUI();
            showCustomAlert('구슬이 손안에서 데워집니다.\n다섯 시간 동안 운이 따릅니다.');
            return;
        }

        if (cat.effect === 'black_seed') {
            if (typeof getGear === 'function' && !getGear(currentUser)) { showCustomAlert('전용 장비가 없습니다.'); return; }
            currentUser.gearPolish = Math.min(0.80, (currentUser.gearPolish || 0) + 0.50);
            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, `[아이템 사용] ■■ 씨앗`);
            saveSelfFull(); updateUI();
            showCustomAlert('씨앗이 어딘가에 스몄습니다.');
            return;
        }

        if (cat.effect === 'wish_ticket') {
            openTextInput('소원권',
                `소원을 적어 주세요.<br><span style="color:#888; font-size:10px;">적은 내용은 ??? 에게 전해집니다. 되돌릴 수 없습니다.</span>`,
                '소원 내용',
                function (wish) {
                    if (!wish || !wish.trim()) return;
                    if (!db.suggestions) db.suggestions = [];
                    db.suggestions.unshift({
                        id: Date.now(), code: currentUser.code, author: currentUser.name, no: currentUser.no,
                        date: new Date().toLocaleString(),
                        title: `[소원권] ${currentUser.name} 사원의 소원`,
                        content: wish, status: 'PENDING', reply: ''
                    });
                    if (database) database.ref('suggestions').set(db.suggestions);
                    removeItemFromInventory(currentUser, itemName, 1);
                    addHistoryLog(currentUser, `[소원권] 소원을 적어 보냈습니다.`);
                    saveSelfFull(); updateUI();
                    showCustomAlert('종이가 손에서 사라졌습니다.\n\n누가 읽었는지는 알 수 없습니다.');
                });
            return;
        }

        if (cat.effect === 'c_flask') {
            if (currentUser.satiety === undefined) currentUser.satiety = 100;
            if (currentUser.satiety >= 100) { showCustomAlert('이미 배가 부릅니다.'); return; }
            currentUser.satiety = Math.min(100, currentUser.satiety + 20);
            currentUser.lastSatietyTime = Date.now();
            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, `[??? 사용] 보온병 (포만감 +20)`);
            saveSelfFull(); updateUI();
            showCustomAlert('따뜻한 것이 들어갑니다. 포만감 +20.');
            return;
        }

        if (cat.effect === 'c_stone') {
            if (!darkRun) { showCustomAlert('탐사 중에만 쓸 수 있습니다.'); return; }
            if (typeof addNotice === 'function') addNotice(-15, '납작한 돌');
            removeItemFromInventory(currentUser, itemName, 1);
            saveSelfFull(); renderDarkStep();
            showCustomAlert('돌을 멀리 던졌습니다. 시선이 그쪽으로 갑니다.');
            return;
        }

        if (cat.effect === 's3_voice') {
            if (!darkRun || darkRun.zone !== 'Qtrew-S-003') { showCustomAlert('동화의 뒷면에서만 쓸 수 있습니다.'); return; }
            if (typeof addLore === 'function') addLore(-15, '읽어 준 목소리');
            removeItemFromInventory(currentUser, itemName, 1);
            saveSelfFull(); renderDarkStep();
            showCustomAlert('누가 대신 읽어 줍니다.\n알던 것이 조금 흐려집니다. (이해도 -15)');
            return;
        }

        const def = NEW_USE[cat.effect];
        if (def) {
            if (def.useQ) {
                if (darkRun && typeof setQFlag === 'function') setQFlag(def.key, true);
                else if (typeof addPendingFlag === 'function') addPendingFlag(def.key, true);
            } else {
                nAdd(def.key, def.n);
            }
            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, `[??? 사용] ${itemName}`);
            saveSelfFull(); updateUI();
            if (darkRun) { renderDarkStep(); if (typeof showDarkToast === 'function') showDarkToast('◈ ' + itemName); }
            showCustomAlert(def.msg);
            return;
        }

        return _use.apply(this, arguments);
    };
})();

// ==========================================
// 타인 적용
// ==========================================
(function hookApply() {
    const _apply = applyItemEffect;
    applyItemEffect = function (targetUser, itemName, isOthers) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat) return _apply.apply(this, arguments);

        if (['equip_ruby_clit','equip_ruby_nip','equip_garter'].includes(cat.effect)) {
            if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
            if (targetUser.equippedWeapons.length >= 8) { showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false; }
            const label = isOthers ? `${itemName} (장착자: ${currentUser.name})` : itemName;
            targetUser.equippedWeapons.push(label);
            if (typeof setEquipOwner === 'function')
                setEquipOwner(targetUser, label, isOthers ? currentUser.code : targetUser.code);
            if (cat.effect === 'equip_garter') targetUser.garterExpire = Date.now() + 24 * 3600 * 1000;
            if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(targetUser, `[장착됨] ${label}`);
            addHistoryLog(targetUser, `[장착] ${currentUser.name} 사원이 ${itemName}을(를) 채웠습니다.`);
            showCustomAlert(`${targetUser.name} 사원에게 ${itemName}을(를) 채웠습니다.`);
            return true;
        }

        const P = {
            p_durian: ['두리안맛 물약', '성별과 무관하게 모유가 남', 24],
            p_lychee: ['리치맛 물약', '공용 육변기·육자지 상태', 24],
            p_mango:  ['망고맛 물약', '아랫배에 자궁 문신이 새겨짐', 24],
            p_melon:  ['메론맛 물약', '정액·애액이 끊이지 않음', 24],
            p_berry:  ['딸기맛 물약', '임신한 상태', 24],
            p_potato: ['감자맛 물약', '행운 +100 (공용시설 승률 대폭 상승)', 24],
            p_sweet:  ['고구마맛 물약', '클리·자지 거대화', 24],
            p_ink:    ['먹물맛 물약', '회피 판정 +2', 24],
            p_blue:   ['블루베리맛 물약', "어떤 물음에도 '네'라고만 답하게 됨", 3]
        };
        if (P[cat.effect]) {
            const a = P[cat.effect];
            addTimedEffect(targetUser, a[0], a[1], a[2]);
            showCustomAlert(isOthers ? `${targetUser.name} 사원에게 ${a[0]}을(를) 사용했습니다.` : `${a[0]}\n\n${a[1]}`);
            return true;
        }
        if (cat.effect === 'p_melon2') {
            const lost = SENSE_LIST[Math.floor(Math.random() * SENSE_LIST.length)];
            addTimedEffect(targetUser, '수박맛 물약', `${lost}을(를) 잃음`, 24);
            showCustomAlert(isOthers ? `${targetUser.name} 사원이 ${lost}을(를) 잃었습니다.` : `수박맛 물약\n\n${lost}이(가) 사라졌습니다.`);
            return true;
        }

        return _apply.apply(this, arguments);
    };
})();

// ==========================================
// 효과 연결
// ==========================================
(function hookRoll() {
    if (typeof rollDarkBonus !== 'function') return;
    const _roll = rollDarkBonus;
    rollDarkBonus = function (kind) {
        let b = _roll.apply(this, arguments);
        if (!currentUser) return b;
        if (nHas('c_batt')) b += 1;
        if (nHas('c_match')) b += 3;
        if (nHas('c_sole') && (kind === 'rejoin' || kind === 'bond')) b += 3;
        if (nHas('c_whistle') && kind === 'rejoin') b += 5;
        if (rubyActive(currentUser, '루비 클리 피어싱')) b += 2;
        if (hasWear('사인참사검')) b += 2;
        if (hasWear('??? 안경')) b += 2;
        const ink = (currentUser.timedEffects || []).some(e => e.name === '먹물맛 물약');
        if (ink && (kind === 'evade' || kind === 'hide')) b += 2;
        return b;
    };
})();

(function hookLuck() {
    if (typeof facilityLuckMult !== 'function') return;
    const _luck = facilityLuckMult;
    facilityLuckMult = function (user) {
        let m = _luck.apply(this, arguments);
        const u = user || currentUser;
        if (!u) return m;
        const eff = u.timedEffects || [];
        if (eff.some(e => e.name === '감자맛 물약')) m *= 2;
        if (eff.some(e => e.name === '유리구슬')) m *= 4;
        if (rubyActive(u, '루비 유두 피어싱')) m *= 3;
        if (typeof hasEquip === 'function') {
            if (hasEquip(u, '도깨비 불')) m *= 2;
            if (hasEquip(u, '사원증 뱃지')) m *= 1.15;
        }
        return m;
    };
})();

(function hookPollMult() {
    if (typeof getPollutionMultiplier !== 'function') return;
    const _gm = getPollutionMultiplier;
    getPollutionMultiplier = function (user) {
        let m = _gm.apply(this, arguments);
        if (user && user.equippedWeapons &&
            user.equippedWeapons.some(w => getEquipBaseName(w) === '가터밸트')) m *= 0.5;
        return m;
    };
})();

(function hookPoll() {
    if (typeof applyPollutionToUser !== 'function') return;
    const _poll = applyPollutionToUser;
    applyPollutionToUser = function (user, amount) {
        if (darkRun && currentUser && user && user.code === currentUser.code && amount > 0) {
            if (nUse('block_poll')) { if (typeof showDarkToast === 'function') showDarkToast('마스크가 걸러 냈다.'); return; }
        }
        return _poll.apply(this, arguments);
    };
})();

(function hookDeath() {
    if (typeof darkDeath !== 'function') return;
    const _death = darkDeath;
    darkDeath = function (reasonText) {
        if (darkRun && !darkRun._dead) {
            if (nUse('c_pain')) {
                darkRun.fail = Math.max(0, darkRun.fail - 1);
                applyPollutionToUser(currentUser, 30);
                darkBodyEl().innerHTML = darkBox('—',
                    `${reasonText}<br><br><span style="color:#4fc3f7;">— 아프지 않다.<br>아프지 않은 것이 나은 상황이 있다.<br><br>일어섰다. 어딘가 잘못됐다는 걸 알면서.</span>`,
                    darkChoiceBtn('계속한다.', 'renderDarkStep();'));
                mountDarkChat('normal'); saveSelfFull(); return;
            }
            if (nUse('c_blind')) {
                darkRun.fail = Math.max(0, darkRun.fail - 1);
                darkBodyEl().innerHTML = darkBox('—',
                    `${reasonText}<br><br><span style="color:#4fc3f7;">— 눈가리개를 내렸다.<br>보지 않으면 붙잡히지 않는다.<br><br>더듬어서 물러났다.</span>`,
                    darkChoiceBtn('물러선다.', 'renderDarkStep();'));
                mountDarkChat('normal'); saveSelfFull(); return;
            }
        }
        return _death.apply(this, arguments);
    };
})();

(function hookLore() {
    if (typeof addLore !== 'function') return;
    const _lore = addLore;
    addLore = function (amount, why) {
        if (amount > 0 && nHas('s3_fold')) amount = Math.round(amount * 0.7);
        if (amount > 0 && typeof getLore === 'function' && typeof LORE_LIMIT !== 'undefined') {
            if (getLore() + amount >= LORE_LIMIT && nUse('s3_period')) {
                if (typeof showDarkToast === 'function') showDarkToast('마침표를 삼켰다. 아직 끝이 아니다.');
                amount = Math.max(0, LORE_LIMIT - 1 - getLore());
            }
        }
        return _lore.call(this, amount, why);
    };
})();

(function hookInfect() {
    if (typeof addInfect !== 'function') return;
    const _inf = addInfect;
    addInfect = function (amount, why) {
        if (amount > 0 && nHas('c_gauze')) amount = Math.round(amount * 0.7);
        return _inf.call(this, amount, why);
    };
})();

(function hookImmune() {
    if (typeof addTimedEffect !== 'function') return;
    const _add = addTimedEffect;
    addTimedEffect = function (user, name, desc, hours) {
        if (user && typeof hasEquip === 'function' && hasEquip(user, '도깨비 불')
            && name !== '유리구슬') {
            if (currentUser && user.code === currentUser.code)
                showCustomAlert('도깨비 불이 달라붙는 것을 태워 버렸습니다.');
            return;
        }
        return _add.apply(this, arguments);
    };
})();

(function hookExpire() {
    if (typeof checkPassivePollution !== 'function') return;
    const _chk = checkPassivePollution;
    checkPassivePollution = function (user) {
        const r = _chk.apply(this, arguments);
        if (!user || !user.equippedWeapons) return r;
        const now = Date.now();
        let changed = false;
        const drop = function (base, key, msg) {
            const i = user.equippedWeapons.findIndex(w => getEquipBaseName(w) === base);
            if (i < 0 || !user[key] || now < user[key]) return;
            const full = user.equippedWeapons[i];
            user.equippedWeapons.splice(i, 1);
            if (typeof clearEquipOwner === 'function') clearEquipOwner(user, full);
            if (typeof stripNoteByItem === 'function') stripNoteByItem(user, base);
            user[key] = 0;
            addHistoryLog(user, msg);
            changed = true;
        };
        drop('가터밸트', 'garterExpire', '[장비 소멸] 가터밸트가 끊어져 사라졌습니다.');
        drop('??? 안경', 'glassesExpire', '[장비 소멸] ??? 안경이 깨졌습니다.');
        if (changed && currentUser && user.code === currentUser.code) { saveSelfFull(); updateUI(); }
        return r;
    };
})();

(function hookLoss() {
    if (typeof removeItemFromInventory !== 'function') return;
    const _rm = removeItemFromInventory;
    removeItemFromInventory = function (user, itemName, qty) {
        if (darkRun && darkRun._losing && currentUser && user && user.code === currentUser.code) {
            if (nUse('c_pouch')) { if (typeof showDarkToast === 'function') showDarkToast('주머니가 지켜 냈다.'); return; }
        }
        return _rm.apply(this, arguments);
    };
})();

// 각성 돌파권 — S-003 · S-010 전용, 0.2%
(function fixAwaken() {
    const n = '각성 돌파권';
    Object.keys(DARK_LOOT_BY_ZONE).forEach(z => {
        const i = DARK_LOOT_BY_ZONE[z].findIndex(l => l.name === n);
        if (i < 0) return;
        if (z === 'Qtrew-S-003' || z === 'Qtrew-S-010') DARK_LOOT_BY_ZONE[z][i].chance = 0.002;
        else DARK_LOOT_BY_ZONE[z].splice(i, 1);
    });
    ['Qtrew-S-003', 'Qtrew-S-010'].forEach(z => {
        if (!DARK_LOOT_BY_ZONE[z]) DARK_LOOT_BY_ZONE[z] = [];
        if (!DARK_LOOT_BY_ZONE[z].some(l => l.name === n))
            DARK_LOOT_BY_ZONE[z].push({ name: n, chance: 0.002 });
    });
})();

console.log('[신규 아이템] 물약 10 · S-003 10 · 범용 20 · 우주 10 = 50종 등록 완료');


// B-330 합류 자동 성립
(function autoRejoin() {
    if (typeof b330Rejoin !== 'function') return;
    const _r = b330Rejoin;
    b330Rejoin = function (v) {
        if (!darkRun) return;
        const attempt = (darkRun.rejoinTries || 0) + 1;
        darkRun.rejoinTries = attempt;
        darkRun.modifier = (darkRun.modifier || 0) + 2;
        darkRun.solo = false;
        darkRun.soloMet = false;
        darkRun.log.push(`[합류 ${attempt}차] 자동 합류`);
        if (database) {
            database.ref(`darkParties/${darkRun.partyId}/solo/${currentUser.code}`).remove();
            database.ref(`darkParties/${darkRun.partyId}/rj${attempt}`).remove();
        }
        if (typeof sendPartyChat === 'function') sendPartyChat(`합류했습니다.`, true);

        darkBodyEl().innerHTML = darkBox(`합류 — ${attempt}차`,
            `한참 헤맸다.<br><br>모퉁이를 돌자 일행이 서 있었다.<br>서로 아무 말도 하지 않는다.<br><br>수를 세지 않고 그냥 뒤에 붙는다.`,
            darkChoiceBtn('계속 간다.', `partyAdvance(${darkRun.step + 1})`));
        mountDarkChat('normal');
    };
})();
;

// ---------- newitems2.js ----------
// ==========================================
// ★ 신규 아이템 26종
//   백일몽 15 · 재난관리국 10 · 뱃지 1
// index.html 에서 맨 뒤(equip-fix.js 다음)에 불러온다
// ==========================================
//
// 행운·판정·회피·공용시설·어둠 횟수·기믹 파훼는
// 기존 DNA 효과 배선(dnaGiftOf)에 임시 버프로 얹는다.
// 오염 동결은 addPollution 을, 정산 보너스는 renderDarkResult 를,
// 확정 구출은 attemptRescue 를 잡아서 처리한다.

(function () {

// ==========================================
// 0. 공용 도구
// ==========================================
const HOUR = 3600 * 1000;

function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return h;
}

// 하루 동안 고정되는 굴림 — 다시 그려도 결과가 안 바뀐다
function dayRoll(name, pct) {
    const c = (currentUser && currentUser.code) || '?';
    return (hash(c + '|' + name + '|' + today()) % 100) < pct;
}

function affilText(u) {
    return ((u && u.affiliation) || '') + ' ' + ((u && u.team) || '');
}

function isCounsel(u) { return u && u.code === 'kario0987'; }

// 오늘 자정까지 남은 시간
function msToMidnight() {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return Math.max(60000, d.getTime() - Date.now());
}

// 이 파일이 맡는 효과인지 — n_… 과 equip_n_… 둘 다
function isNewEff(e) {
    e = String(e || '');
    return e.indexOf('n_') === 0 || e.indexOf('equip_n_') === 0;
}

// ==========================================
// 1. 임시 버프 — dnaGiftOf 에 얹는다
// ==========================================
function ibList(u) {
    u = u || currentUser;
    if (!u.itemBuffs) u.itemBuffs = [];
    return u.itemBuffs;
}

function ibClean(u) {
    const now = Date.now();
    const keep = ibList(u).filter(function (b) {
        if (b.run) return true;                 // 다음 어둠 1회짜리
        return !b.until || b.until > now;
    });
    u.itemBuffs = keep;
    return keep;
}

function ibAdd(u, k, v, ms, src, opt) {
    u = u || currentUser;
    const b = { k: k, v: v, src: src || '' };
    if (opt && opt.run) b.run = 1; else b.until = Date.now() + (ms || 24 * HOUR);
    ibList(u).push(b);
    if (u.code === currentUser.code) saveFields({ itemBuffs: 1 });
    else if (typeof updateUserFields === 'function') updateUserFields(u.code, { itemBuffs: u.itemBuffs });
    return b;
}

function ibSum(u) {
    const out = {};
    ibClean(u).forEach(function (b) { out[b.k] = (out[b.k] || 0) + b.v; });
    return out;
}

// 은심장 누적 보정
function heartBonus(u) {
    if (!hasSilverHeart(u)) return {};
    const n = u.heartSaves || 0;
    const step = Math.min(5, Math.floor(n / 2));
    const out = {};
    if (step) { out.luck = step; out.eva = step; out.bon = step; }
    if (n >= 50) out.gim = (out.gim || 0) + 1;
    return out;
}

// 장착 중인 신규 장비의 상시 효과
const PASSIVE = {
    '꿈결 수집기': { pct: 100, fac: 1 },
    '포승줄':      { bon: 5 },
    '공기 누름돌': { luck: 2 },
    '은색 저울':   {}
};

function passiveSum(u) {
    const out = {};
    (u.equippedWeapons || []).forEach(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        const p = PASSIVE[base];
        if (!p) return;
        Object.keys(p).forEach(function (k) { out[k] = (out[k] || 0) + p[k]; });
    });
    return out;
}

(function hookGift() {
    const iv = setInterval(function () {
        if (typeof dnaGiftOf !== 'function') return;
        if (dnaGiftOf._newItems) { clearInterval(iv); return; }
        const _d = dnaGiftOf;
        dnaGiftOf = function (user) {
            const base = _d.apply(this, arguments) || {};
            const u = user || currentUser;
            if (!u) return base;
            // 효과는 바깥이 아니라 e 안에 들어간다
            const out = Object.assign({}, base);
            out.e = Object.assign({}, base.e || {});
            [ibSum(u), passiveSum(u), heartBonus(u)].forEach(function (m) {
                Object.keys(m).forEach(function (k) { out.e[k] = (out.e[k] || 0) + m[k]; });
            });
            return out;
        };
        dnaGiftOf._newItems = true;
        clearInterval(iv);
        console.log('[신규] 임시 버프 배선 연결');
    }, 500);
})();

// ==========================================
// 2. 사용 횟수 — 하루 제한 · 총 횟수
// ==========================================
function dayLeft(u, name, max) {
    u = u || currentUser;
    if (!u.dayUse) u.dayUse = {};
    const r = u.dayUse[name];
    if (!r || r.d !== today()) { u.dayUse[name] = { d: today(), n: 0 }; }
    return max - u.dayUse[name].n;
}

function daySpend(u, name) {
    u = u || currentUser;
    u.dayUse[name].n++;
    saveFields({ dayUse: 1 });
}

// 총 N회 쓰면 사라지는 물건
function totalSpend(name, max) {
    if (!currentUser.useCnt) currentUser.useCnt = {};
    const n = (currentUser.useCnt[name] || 0) + 1;
    currentUser.useCnt[name] = n;
    if (n >= max) {
        delete currentUser.useCnt[name];
        removeItemFromInventory(currentUser, name, 1);
        unequipByName(name);
        saveFields({ useCnt: 1 });
        return { gone: true, left: 0 };
    }
    saveFields({ useCnt: 1 });
    return { gone: false, left: max - n };
}

function unequipByName(name) {
    const eq = currentUser.equippedWeapons || [];
    const i = eq.findIndex(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
    if (i < 0) return false;
    const full = eq[i];
    eq.splice(i, 1);
    if (currentUser.equipOwner) delete currentUser.equipOwner[full];
    saveSelfFull();
    return true;
}

function hasEquipped(u, name) {
    if (!u) return false;
    return (u.equippedWeapons || []).some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}

function hasAny(u, name) {
    if (!u) return false;
    return hasEquipped(u, name) || (u.inventory || []).indexOf(name) >= 0;
}

// 소지품에 둔 채로 몸에 걸치는 것들 — 표적 버튼을 같이 남기기 위해
function wornOn(u, name) {
    if (!u) return false;
    if (u.wornItems && u.wornItems[name]) return true;
    return hasEquipped(u, name);
}

// 특이사항 글이 담긴 칸을 찾는다.
// badge 는 { nickname, gender, posTag, ... } 객체다. 통째로 덮으면 안 된다.
function badgeNoteKey(u) {
    const b = u && u.badge;
    if (!b || typeof b !== 'object') return null;
    const want = ['note', 'notes', 'memo', 'special', 'etc', 'desc', 'text'];
    for (let i = 0; i < want.length; i++) {
        if (typeof b[want[i]] === 'string') return want[i];
    }
    // 못 찾으면 가장 긴 글 칸
    let best = null, len = -1;
    Object.keys(b).forEach(function (k) {
        if (typeof b[k] === 'string' && b[k].length > len) { best = k; len = b[k].length; }
    });
    return best;
}

// 특이사항에서 한 줄을 지운다
function removeBadgeLine(u, needle) {
    if (!u || !u.badge) return;

    if (typeof u.badge === 'object') {
        const key = badgeNoteKey(u);
        if (!key) return;
        const raw = String(u.badge[key] || '');
        const br = /<br\s*\/?>/i.test(raw);
        const parts = raw.split(/<br\s*\/?>|\n/);
        const keep = parts.filter(function (x) { return x.indexOf(needle) < 0; });
        if (keep.length === parts.length) return;
        u.badge[key] = keep.join(br ? '<br>' : '\n');
    } else {
        const raw = String(u.badge);
        const br = /<br\s*\/?>/i.test(raw);
        const parts = raw.split(/<br\s*\/?>|\n/);
        const keep = parts.filter(function (x) { return x.indexOf(needle) < 0; });
        if (keep.length === parts.length) return;
        u.badge = keep.join(br ? '<br>' : '\n');
    }

    if (u.code === currentUser.code) saveFields({ badge: 1 });
    else if (typeof updateUserFields === 'function') updateUserFields(u.code, { badge: u.badge });
}

function toggleWorn(name) {
    const u = currentUser;
    const on = !hasEquipped(u, name);

    if (on) {
        if (!u.equippedWeapons) u.equippedWeapons = [];
        if (visibleSlots(u) >= 8) { showCustomAlert('장착칸이 가득 찼습니다.'); return; }
        if ((u.inventory || []).indexOf(name) === -1) { showCustomAlert('소지품에 없습니다.'); return; }
        u.equippedWeapons.push(name);
        if (typeof setEquipOwner === 'function') setEquipOwner(u, name, u.code);
        removeItemFromInventory(u, name, 1);
        appendBadgeNoteToUser(u, '[장착됨] ' + name);
        addHistoryLog(u, '[장착] ' + name);
        saveSelfFull();
        updateUI();
        showCustomAlert(name + '을(를) 몸에 걸었습니다.\n\n장착칸의 「표적」을 눌러 사원을 고르세요.');
        return;
    }

    // 내려놓기 — 빼앗은 것을 전부 돌려주고 소지품으로
    const backCnt = returnBySource(name);
    const eq = u.equippedWeapons || [];
    const at = eq.indexOf(name);
    if (at >= 0) eq.splice(at, 1);
    if (u.equipOwner) delete u.equipOwner[name];
    u.inventory = u.inventory || [];
    u.inventory.push(name);
    removeBadgeLine(u, '[장착됨] ' + name);
    addHistoryLog(u, '[해제] ' + name);
    saveSelfFull();
    updateUI();
    showCustomAlert(name + '을(를) 내려놓았습니다.'
        + (backCnt ? '\n\n빼앗았던 ' + backCnt + '건이 제자리로 돌아갔습니다.' : ''));
}

// 보이는 칸 수 — 빼앗아 온 것은 세지 않는다
function visibleSlots(u) {
    return (u.equippedWeapons || []).filter(function (w) {
        return !((u.stolenGear || {})[w]);
    }).length;
}

// 그 물건으로 빼앗은 것을 전부 돌려준다
function returnBySource(srcName) {
    const bag = stolenBag(currentUser);
    let n = 0;
    Object.keys(bag).forEach(function (k) {
        if (bag[k] && bag[k].src !== srcName) return;
        if (returnStolen(k, true)) n++;
    });
    return n;
}

// ==========================================
// 3. 정산 보너스 — 어둠이 끝날 때 받는다
// ==========================================
function addDarkPt(u, v, why) {
    u = u || currentUser;
    u.darkPtPend = (u.darkPtPend || 0) + v;
    if (why) {
        if (!u.darkPtWhy) u.darkPtWhy = [];
        u.darkPtWhy.push(why + ' +' + v.toLocaleString() + 'P');
    }
    if (u.code === currentUser.code) saveFields({ darkPtPend: 1, darkPtWhy: 1 });
    else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { darkPtPend: u.darkPtPend, darkPtWhy: u.darkPtWhy || [] });
    }
}

function payDarkPt() {
    const u = currentUser;
    let v = u.darkPtPend || 0;

    // 보유만으로 붙는 것들
    if (hasEquipped(u, '꿈결 수집기')) { v += 5000; (u.darkPtWhy = u.darkPtWhy || []).push('꿈결 수집기 +5,000P'); }
    if (hasSilverHeart(u) && (u.heartSaves || 0) >= 30) {
        v += 5000; (u.darkPtWhy = u.darkPtWhy || []).push('은심장 +5,000P');
    }
    const cage = u.cageSaved || 0;
    if (hasEquipped(u, '％＄＠＆ 이동장') && cage > 0) {
        const got = Math.min(9000, cage * 1500);
        v += got; (u.darkPtWhy = u.darkPtWhy || []).push('％＄＠＆ 이동장 +' + got.toLocaleString() + 'P');
        u.cageSaved = 0;
    }

    const why = (u.darkPtWhy || []).slice();
    u.darkPtPend = 0; u.darkPtWhy = [];

    // 1회짜리 버프를 걷는다
    u.itemBuffs = ibList(u).filter(function (b) { return !b.run; });

    if (v > 0) {
        u.points = (u.points || 0) + v;
        addHistoryLog(u, '[추가 정산] +' + v.toLocaleString() + 'P — ' + why.join(' · '));
        saveFields({ points: 1, darkPtPend: 1, darkPtWhy: 1, itemBuffs: 1, cageSaved: 1 });
        setTimeout(function () {
            showCustomAlert('추가 정산\n\n' + why.join('\n') + '\n\n합계 +' + v.toLocaleString() + 'P');
        }, 900);
    } else {
        saveFields({ itemBuffs: 1 });
    }
}

(function hookSettle() {
    const iv = setInterval(function () {
        let hit = 0;
        ['renderDarkResult', 'epicSettle'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newPay) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                try { payDarkPt(); } catch (e) { console.warn('[신규] 정산 보너스', e); }
                return r;
            };
            window[n]._newPay = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] 정산 보너스 연결'); }
    }, 500);
})();

// ==========================================
// 4. 오염 동결
// ==========================================
function freezePoll(h, src) {
    const till = Date.now() + h * HOUR;
    if ((currentUser.pollFreezeUntil || 0) < till) currentUser.pollFreezeUntil = till;
    saveFields({ pollFreezeUntil: 1 });
    addHistoryLog(currentUser, '[' + src + '] 오염 ' + h + '시간 동결');
}

(function hookPoll() {
    const iv = setInterval(function () {
        if (typeof addPollution !== 'function') return;
        if (addPollution._newFreeze) { clearInterval(iv); return; }
        const _a = addPollution;
        addPollution = function (amt) {
            const u = currentUser;
            if (u && (u.pollFreezeUntil || 0) > Date.now() && (amt || 0) > 0) return;
            if (u && ibSum(u).noPoll && (amt || 0) > 0) return;      // 부적이 깃든 등 — 오염 동결
            return _a.apply(this, arguments);
        };
        addPollution._newFreeze = true;
        clearInterval(iv);
        console.log('[신규] 오염 동결 연결');
    }, 500);
})();

// ==========================================
// 5. 확정 구출
// ==========================================
// 남을 살릴 때 쓰는 확정권이 남아 있는지
function rescueGuarantee() {
    const u = currentUser;
    if (hasSilverHeart(u) && (u.heartSaves || 0) >= 10) return '은심장';
    if (hasEquipped(u, '％＄＠＆ 이동장')) {
        if (!u.cageRun || u.cageRun !== (darkRun && darkRun.zone) + '|' + today()) return '％＄＠＆ 이동장';
    }
    if ((u.paperBoat | 0) > 0) return '종이배';
    if (hasAny(u, '전용 자전거') && dayLeft(u, '전용 자전거', 2) > 0) return '전용 자전거';
    if (hasEquipped(u, '포승줄')) return '포승줄';
    if (hasEquipped(u, '통신 단추') && (u.buttonUses | 0) > 0) return '통신 단추';
    return null;
}

function spendGuarantee(src) {
    const u = currentUser;

    if (src === '％＄＠＆ 이동장') {
        u.cageRun = (darkRun && darkRun.zone) + '|' + today();

    } else if (src === '전용 자전거') {
        daySpend(u, src);

    } else if (src === '종이배') {
        u.paperBoat = Math.max(0, (u.paperBoat | 0) - 1);
        if (u.paperBoat === 0) {
            removeBadgeLine(u, '🛶 종이배');
            setTimeout(function () { showCustomAlert('종이배가 물에 풀렸습니다.'); }, 900);
        }
        saveFields({ paperBoat: 1 });

    } else if (src === '통신 단추') {
        u.buttonUses = Math.max(0, (u.buttonUses | 0) - 1);
        if (u.buttonUses === 0) {
            const eq = u.equippedWeapons || [];
            const at = eq.findIndex(function (w) {
                return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === '통신 단추';
            });
            if (at >= 0) {
                const full = eq[at];
                eq.splice(at, 1);
                if (u.equipOwner) delete u.equipOwner[full];
            }
            removeBadgeLine(u, '[장착됨] 통신 단추');
            setTimeout(function () { showCustomAlert('단추가 부서졌습니다.'); }, 900);
        }
        saveFields({ buttonUses: 1 });
    }

    u.cageSaved = (u.cageSaved || 0) + 1;
    u.heartSaves = (u.heartSaves || 0) + 1;
    saveFields({ cageRun: 1, cageSaved: 1, heartSaves: 1 });
    saveSelfFull();
}

// 굴림을 한 번 확정으로 만든다
function withLucky(fn, ctx, args) {
    const _r = Math.random;
    Math.random = function () { return 0.0001; };
    try { return fn.apply(ctx, args); }
    finally { Math.random = _r; }
}

(function hookRescue() {
    const iv = setInterval(function () {
        if (typeof attemptRescue !== 'function') return;
        if (attemptRescue._newSure) { clearInterval(iv); return; }
        const _a = attemptRescue;
        attemptRescue = function () {
            const src = rescueGuarantee();
            const u = currentUser;

            // 진실 마스크 — 채워 준 쪽과 채운 쪽 모두 정산
            (u.equippedWeapons || []).forEach(function (w) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                if (base !== '진실 마스크') return;
                const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
                addDarkPt(u, 5000, '진실 마스크');
                if (o && o !== u.code && db.users[o]) addDarkPt(db.users[o], 5000, '진실 마스크');
            });

            if (!src) {
                u.heartSaves = (u.heartSaves || 0) + 1;
                saveFields({ heartSaves: 1 });
                return _a.apply(this, arguments);
            }

            const r = withLucky(_a, this, arguments);
            spendGuarantee(src);
            addHistoryLog(u, '[확정 구출] ' + src);
            setTimeout(function () {
                showCustomAlert(src + '이(가) 손을 대신 뻗었습니다.\n\n구출이 확정되었습니다.');
            }, 700);
            return r;
        };
        attemptRescue._newSure = true;
        clearInterval(iv);
        console.log('[신규] 확정 구출 연결');
    }, 500);
})();

// epic 쪽 구출 — epicDoomRescue 는 luckReroll 로 한 번 굴린다
(function hookEpicRescue() {
    const iv = setInterval(function () {
        if (typeof epicDoomRescue !== 'function' || typeof luckReroll !== 'function') return;
        if (epicDoomRescue._newSure) { clearInterval(iv); return; }

        // 깃발이 서 있을 때 딱 한 번만 20
        const _l = luckReroll;
        luckReroll = function () {
            if (window.__epicSureRoll) { window.__epicSureRoll = false; return 20; }
            return _l.apply(this, arguments);
        };

        const _e = epicDoomRescue;
        epicDoomRescue = function () {
            const u = currentUser;
            const src = rescueGuarantee();

            // 진실 마스크 — 양쪽 정산
            (u.equippedWeapons || []).forEach(function (w) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                if (base !== '진실 마스크') return;
                const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
                addDarkPt(u, 5000, '진실 마스크');
                if (o && o !== u.code && db.users[o]) addDarkPt(db.users[o], 5000, '진실 마스크');
            });

            if (!src) {
                u.heartSaves = (u.heartSaves || 0) + 1;
                saveFields({ heartSaves: 1 });
                return _e.apply(this, arguments);
            }

            window.__epicSureRoll = true;
            setTimeout(function () { window.__epicSureRoll = false; }, 8000);   // 안전장치
            spendGuarantee(src);
            addHistoryLog(u, '[확정 구출] ' + src);
            setTimeout(function () {
                showCustomAlert(src + '이(가) 손을 대신 뻗었습니다.\n\n구출이 확정되었습니다.');
            }, 1400);
            return _e.apply(this, arguments);
        };
        epicDoomRescue._newSure = true;
        clearInterval(iv);
        console.log('[신규] epic 확정 구출 연결');
    }, 500);
})();

// 끌려감 방어 — epic 쪽 저항도 같이
(function hookMoreResist() {
    const NAMES = ['b508Resist', 'a667Grab', 'dark087Roll'];
    const iv = setInterval(function () {
        let hit = 0;
        NAMES.forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newLine) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const u = currentUser;
                if (!u.lineGuard || u.lineGuard <= 0) return _f.apply(this, arguments);
                u.lineGuard--;
                saveFields({ lineGuard: 1 });
                window.__epicSureRoll = true;
                setTimeout(function () { window.__epicSureRoll = false; }, 8000);
                const out = withLucky(_f, this, arguments);
                setTimeout(function () {
                    showCustomAlert('낚시 줄이 손목을 붙들었습니다.\n\n남은 방어 ' + u.lineGuard + '회');
                }, 700);
                return out;
            };
            window[n]._newLine = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] epic 끌려감 방어 연결'); }
    }, 500);
})();

// 은색 저울 — 같이 가라앉을 확률을 늘 보여 준다
function scaleRisk(u) {
    u = u || currentUser;
    if (!u) return 0;
    const poll = u.pollution || 0;
    const g = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(u) || {}) : {};
    const e = g.e || {};
    const bon = (e.bon || 0) + (e.luck || 0) / 2;
    return Math.round(Math.max(5, Math.min(92, 34 + poll * 0.45 - bon * 4)));
}

(function scaleBoard() {
    const ID = 'silver-scale-box';

    function draw() {
        if (typeof currentUser === 'undefined' || !currentUser) {
            const b0 = document.getElementById(ID);
            if (b0) b0.remove();
            return;
        }
        const on = hasEquipped(currentUser, '은색 저울')
                || (currentUser.borrowedGear || []).some(function (w) {
                       return String(w).indexOf('은색 저울') === 0;
                   });
        const inRun = (typeof darkRun !== 'undefined') && darkRun;
        let box = document.getElementById(ID);

        if (!on || !inRun) { if (box) box.remove(); return; }

        const risk = scaleRisk(currentUser);
        currentUser._scaleRisk = risk;

        if (!box) {
            box = document.createElement('div');
            box.id = ID;
            box.style.cssText = 'position:fixed;right:10px;bottom:84px;z-index:9998;'
                + 'padding:8px 12px;border:1px solid #6b7a8f;border-radius:4px;'
                + 'background:rgba(12,16,22,0.92);color:#cfd8e3;font-size:12px;'
                + 'letter-spacing:0.3px;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,0.5)';
            document.body.appendChild(box);
        }
        box.innerHTML = '은색 저울<br><b style="color:'
            + (risk > 50 ? '#ff8f8f' : '#9fe0a6') + ';font-size:15px">'
            + risk + '%</b> <span style="color:#8a8f98">함께 가라앉을 확률</span>';
    }

    setInterval(draw, 1200);
    setTimeout(draw, 1500);
    window.scaleBoardNow = draw;
})();

// 저울이 나쁘다고 했는데도 살렸다면 — 조용히 얹는다
(function hookScalePay() {
    const iv = setInterval(function () {
        if (typeof attemptRescue !== 'function' || !attemptRescue._newSure) return;
        if (attemptRescue._newScalePay) { clearInterval(iv); return; }
        const _a = attemptRescue;
        attemptRescue = function () {
            const risk = currentUser._scaleRisk || 0;
            if (hasEquipped(currentUser, '은색 저울') && risk > 50) {
                addDarkPt(currentUser, 5000, '저울');
            }
            currentUser._scaleRisk = 0;
            return _a.apply(this, arguments);
        };
        attemptRescue._newScalePay = true;
        clearInterval(iv);
    }, 700);
})();

// ==========================================
// 6. 끌려감 방어 — 낚시 줄
// ==========================================
(function hookAbduct() {
    const iv = setInterval(function () {
        if (typeof resistAbduction !== 'function') return;
        if (resistAbduction._newLine) { clearInterval(iv); return; }
        const _r = resistAbduction;
        resistAbduction = function () {
            const u = currentUser;
            if (!u.lineGuard || u.lineGuard <= 0) return _r.apply(this, arguments);
            u.lineGuard--;
            saveFields({ lineGuard: 1 });
            const out = withLucky(_r, this, arguments);
            setTimeout(function () {
                showCustomAlert('낚시 줄이 손목을 붙들었습니다.\n\n남은 방어 ' + u.lineGuard + '회');
            }, 600);
            return out;
        };
        resistAbduction._newLine = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 7. 은심장
// ==========================================
const HEART = '🩶 은심장';

function hasSilverHeart(u) {
    if (!u) return false;
    return (u.inventory || []).indexOf(HEART) >= 0 || hasEquipped(u, HEART);
}

// 잃어버리지 않는다 — 소지품에서 빠지지 않게 막는다
(function hookHeartKeep() {
    const iv = setInterval(function () {
        if (typeof removeItemFromInventory !== 'function') return;
        if (removeItemFromInventory._heartLock) { clearInterval(iv); return; }
        const _r = removeItemFromInventory;
        removeItemFromInventory = function (user, name) {
            if (name === HEART && !window.__heartUnlock) {
                console.warn('[은심장] 사라지지 않습니다.');
                return false;
            }
            return _r.apply(this, arguments);
        };
        removeItemFromInventory._heartLock = true;
        clearInterval(iv);
    }, 500);
})();

// 상담사만 줄 수 있다
window.giveSilverHeart = function (no) {
    if (!isCounsel(currentUser)) { console.warn('상담사만 줄 수 있습니다.'); return; }
    const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .find(function (u) { return u && (u.no === no || u.code === no || u.name === no); });
    if (!t) { console.warn('사원을 못 찾았습니다: ' + no); return; }
    if (hasSilverHeart(t)) { console.log(t.name + ' 사원은 이미 지니고 있습니다.'); return; }
    t.inventory = t.inventory || [];
    t.inventory.push(HEART);
    if (t.heartSaves == null) t.heartSaves = 0;
    updateUserFields(t.code, { inventory: t.inventory, heartSaves: t.heartSaves });
    appendBadgeNoteToUser(t, '[뱃지] ' + HEART);
    addHistoryLog(t, '[수여] ' + HEART);
    console.log('%c✓ ' + t.name + ' 사원에게 ' + HEART + ' 을 주었습니다.', 'color:#4CAF50');
};

window.heartState = function (no) {
    const u = no
        ? Object.keys(db.users).map(function (c) { return db.users[c]; })
            .find(function (x) { return x && (x.no === no || x.code === no || x.name === no); })
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const n = u.heartSaves || 0;
    console.log('%c===== ' + u.name + ' · ' + HEART + ' =====', 'color:#cfd8e3; font-size:13px');
    console.log('  지님:', hasSilverHeart(u) ? '예' : '아니오');
    console.log('  구한 횟수:', n);
    console.log('  행운·회피·판정:', '+' + Math.min(5, Math.floor(n / 2)));
    console.log('  확정 구출(10회):', n >= 10 ? 'O' : '-');
    console.log('  고정 5,000P(30회):', n >= 30 ? 'O' : '-');
    console.log('  기믹 파훼(50회):', n >= 50 ? 'O' : '-');
};

// ==========================================
// 8. 어둠 진입 — 파티 배포분
// ==========================================
const LAMP_BUFF = [
    { k: 'bon', v: 2, t: '판정 +2' },
    { k: 'noPoll', v: 1, t: '오염 동결' },
    { k: 'gim', v: 1, t: '기믹 파훼 1회' },
    { k: 'luck', v: 2, t: '행운 +2' },
    { k: 'resc', v: 3, t: '구출 확률 +3' }
];

function onDarkEnter() {
    const u = currentUser;
    const pid = darkRun && darkRun.partyId;

    // 부적이 깃든 등 — 팀원에게 무작위 버프
    if (hasEquipped(u, '부적이 깃든 등') && pid) {
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            const alive = Object.keys(s.val() || {});
            const lines = [];
            alive.forEach(function (c) {
                const t = db.users[c]; if (!t) return;
                const b = LAMP_BUFF[Math.floor(Math.random() * LAMP_BUFF.length)];
                ibAdd(t, b.k, b.v, 6 * HOUR, '부적이 깃든 등', { run: true });
                lines.push((t.name || c) + ' — ' + b.t);
            });
            if (lines.length) {
                showCustomAlert('등이 한 번 흔들렸습니다.\n\n' + lines.join('\n'));
                // 같은 글을 파티원 각자에게도 띄운다
                database.ref('darkParties/' + pid + '/lampNotice').set({
                    at: Date.now(), by: currentUser.name, lines: lines
                });
            }
        });
    }

    // 공기 누름돌 — 파티 전체 보호막
    if (hasEquipped(u, '공기 누름돌') && dayLeft(u, '공기 누름돌', 5) > 0 && pid) {
        daySpend(u, '공기 누름돌');
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            Object.keys(s.val() || {}).forEach(function (c) {
                const t = db.users[c]; if (!t) return;
                ibAdd(t, 'luck', 2, 6 * HOUR, '공기 누름돌', { run: true });
                ibAdd(t, 'resist', 3, 6 * HOUR, '공기 누름돌', { run: true });
            });
        });
    }

    // 은심장 — 같이 든 사람에게 행운 +1
    if (hasSilverHeart(u) && pid) {
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            Object.keys(s.val() || {}).forEach(function (c) {
                if (c === u.code) return;
                const t = db.users[c]; if (!t) return;
                ibAdd(t, 'luck', 1, 6 * HOUR, '은심장', { run: true });
            });
        });
    }

    // 장기말 — 선택지에 난이도를 덧붙인다
    if (u.pieceHint) {
        u.pieceHint = 0;
        saveFields({ pieceHint: 1 });
        showPieceHint();
    }
}

// epic 에 들어가도 저울을 띄운다
(function scaleOnEpic() {
    const iv = setInterval(function () {
        if (typeof epicStart !== 'function') return;
        if (epicStart._scaleShow) { clearInterval(iv); return; }
        const _e = epicStart;
        epicStart = function () {
            const r = _e.apply(this, arguments);
            setTimeout(function () { if (window.scaleBoardNow) window.scaleBoardNow(); }, 1500);
            return r;
        };
        epicStart._scaleShow = true;
        clearInterval(iv);
    }, 500);
})();

(function hookEnter() {
    const iv = setInterval(function () {
        let hit = 0;
        ['launchPartyRun', 'openDarkBriefing', 'epicStart'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newEnter) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                setTimeout(function () { try { onDarkEnter(); } catch (e) { } }, 1200);
                return r;
            };
            window[n]._newEnter = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] 어둠 진입 연결'); }
    }, 500);
})();

// 선택지에 난이도를 붙인다 — 한 판 동안만
function showPieceHint() {
    let stop = false;
    const ob = new MutationObserver(function () {
        if (stop) return;
        document.querySelectorAll('[data-dc]').forEach(function (b) {
            if (b.dataset.pieceDone) return;
            b.dataset.pieceDone = '1';
            const dc = parseInt(b.dataset.dc, 10);
            if (!isNaN(dc)) b.insertAdjacentHTML('beforeend',
                '<span style="margin-left:6px;color:#9ec7ff;font-size:11px">(' + dc + ')</span>');
        });
    });
    ob.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { stop = true; ob.disconnect(); }, 30 * 60 * 1000);
    showCustomAlert('장기말이 굴렀습니다.\n\n이번 탐사에서는 선택지의 무게가 보입니다.');
}

// 등불 알림을 각자 받아 띄운다
(function lampNotice() {
    let seen = 0;
    setInterval(function () {
        if (typeof darkRun === 'undefined' || !darkRun || !darkRun.partyId) return;
        if (!database) return;
        database.ref('darkParties/' + darkRun.partyId + '/lampNotice').once('value').then(function (s) {
            const v = s.val();
            if (!v || !v.at || v.at === seen) return;
            if (Date.now() - v.at > 5 * 60 * 1000) return;      // 오래된 것은 넘긴다
            seen = v.at;
            const mine = (v.lines || []).filter(function (x) {
                return String(x).indexOf(currentUser.name) === 0;
            });
            showCustomAlert('부적이 깃든 등\n\n' + (v.by || '') + ' 사원의 등이 흔들렸습니다.\n\n'
                + (v.lines || []).join('\n')
                + (mine.length ? '\n\n— 내게 걸린 것: ' + mine[0].split('—').pop().trim() : ''));
        });
    }, 2500);
})();

// ==========================================
// 9. 버프 강탈 — 황룡의 눈 · 산군의 도움
// ==========================================
// ==========================================
// 빼앗기 — 열람 → 가져온다 / 닫기
// ==========================================
const SEAL = '✗ ';          // 봉인 표시 — 이름이 바뀌므로 그 장비의 효과가 끊긴다

function stolenBag(u) {
    u = u || currentUser;
    if (!u.stolenGear) u.stolenGear = {};
    return u.stolenGear;
}

// Firebase 는 undefined 를 거부한다 — 저장 직전에 걷어 낸다
function noUndef(o) {
    Object.keys(o || {}).forEach(function (k) {
        if (o[k] === undefined) delete o[k];
        else if (o[k] && typeof o[k] === 'object') noUndef(o[k]);
    });
    return o;
}

// 물약·소모품처럼 몸에 남아 있는 것들 — 이것도 가져올 수 있다
// kind: 'time' 남은 시각 · 'num' 횟수 · 'bool' 있고 없고
const TIMED = [
    ['blindfoldUntil',        '눈가리개',      'time'],
    ['butterKnifeExpireTime', '버터 나이프',   'time'],
    ['noteGlowUntil',         '빛나는 쪽지',   'time'],
    ['pollFreezeUntil',       '오염 동결',     'time'],
    ['hairUntil',             '탈모약',        'time'],
    ['dollPt',                '봉제 인형',     'time'],
    ['buttonUses',            '통신 단추',     'num'],
    ['lineGuard',             '낚시 줄 방어',  'num'],
    ['gearProtect',           '등급 보호',     'bool'],
    ['paperBoat',             '종이배',        'num'],
    ['hasVIP',                'VIP',           'bool']
];
// 상담실(quarantineUntil)은 벌이라 목록에서 뺀다

function timedOf(u) {
    const now = Date.now(), out = [];
    TIMED.forEach(function (x) {
        const f = x[0], nm = x[1], kind = x[2];
        const v = u[f];
        if (kind === 'time') {
            if (!v || v <= now) return;
            out.push({ f: f, kind: kind, t: nm, sub: Math.round((v - now) / 60000) + '분 남음' });
        } else if (kind === 'num') {
            if (!v || v <= 0) return;
            out.push({ f: f, kind: kind, t: nm, sub: v + '회' });
        } else {
            if (!v) return;
            out.push({ f: f, kind: kind, t: nm, sub: '' });
        }
    });
    return out;
}

// 표적 — 사원을 고른다
function pickTargetFor(srcName) {
    if (!hasEquipped(currentUser, srcName)) {
        showCustomAlert(srcName + '을(를) 먼저 몸에 걸어야 합니다.'); return;
    }
    const left = dayLeft(currentUser, srcName, 2);
    if (left <= 0) { showCustomAlert('오늘은 더 쓸 수 없습니다.\n\n자정이 지나면 다시 열립니다.'); return; }

    const list = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.code && u.name && u.code !== currentUser.code; })
        .sort(function (a, b) { return String(a.no || '').localeCompare(String(b.no || '')); });

    const back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);'
        + 'display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:400px;width:100%;max-height:78vh;overflow:auto;padding:18px;'
        + 'background:#14161c;border:1px solid #d4af37;color:#e8e4da;font-size:13px;line-height:1.7';
    box.innerHTML = '<div style="font-size:15px;color:#d4af37;margin-bottom:4px">' + srcName + '</div>'
        + '<div style="margin-bottom:12px;color:#a9a49a">표적을 고르세요. '
        + '<span style="font-size:11px;color:#7d7870">오늘 남은 횟수 ' + left + '회</span></div>'
        + list.map(function (u) {
            return '<div data-c="' + u.code + '" style="padding:8px 10px;margin-bottom:5px;border:1px solid #33363f;'
                + 'cursor:pointer">' + (u.no ? u.no + ' · ' : '') + u.name + '</div>';
        }).join('')
        + '<div style="margin-top:14px;text-align:right">'
        + '<button data-no="1" style="padding:7px 14px;background:#2a2d36;border:0;color:#a9a49a;cursor:pointer">닫기</button></div>';
    back.appendChild(box);
    document.body.appendChild(back);

    box.querySelector('[data-no]').onclick = function () { back.remove(); };
    box.querySelectorAll('[data-c]').forEach(function (el) {
        el.onclick = function () {
            const t = db.users[el.getAttribute('data-c')];
            back.remove();
            if (t) stealPanel(t, srcName, 2);
        };
    });
}

function stealPanel(target, srcName, maxPick, dayCap) {
    const back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);'
        + 'display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:430px;width:100%;max-height:80vh;overflow:auto;padding:18px;'
        + 'background:#14161c;border:1px solid #d4af37;color:#e8e4da;font-size:13px;line-height:1.7';
    back.appendChild(box);
    document.body.appendChild(back);

    const btn = function (t, key, main) {
        return '<button data-' + key + '="1" style="padding:7px 14px;border:0;cursor:pointer;'
            + (main ? 'background:#d4af37;color:#14161c' : 'background:#2a2d36;color:#a9a49a') + '">' + t + '</button>';
    };

    // ---------- 1단계 : 열람할지 묻는다 ----------
    function askLook() {
        box.innerHTML =
            '<div style="font-size:15px;color:#d4af37;margin-bottom:10px">' + srcName + '</div>'
            + '<div style="margin-bottom:16px;color:#a9a49a">표적 — <b style="color:#e8e4da">'
            + target.name + '</b> 사원<br>'
            + '<span style="font-size:11px;color:#7d7870">지닌 것을 들여다봅니다. 보는 것만으로는 아무 일도 일어나지 않습니다.'
            + (dayCap ? '<br>오늘 남은 횟수 ' + dayLeft(currentUser, srcName, dayCap) + '회' : '')
            + '</span></div>'
            + '<div style="text-align:right">' + btn('열람', 'look', true) + ' ' + btn('닫기', 'no') + '</div>';
        box.querySelector('[data-no]').onclick = function () { back.remove(); };
        box.querySelector('[data-look]').onclick = showList;
    }

    // ---------- 2단계 : 지닌 것을 펼친다 ----------
    let ownList = [];

    function showList() {
        // 이미 빼앗겨 상쇄 중인 것은 가져올 대상이 아니다
        const bag = ibClean(target).filter(function (b) {
            return !/빼앗김/.test(String(b.src || '')) && b.v > 0;
        });
        const gear = (target.equippedWeapons || []).slice();
        const g0 = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(target) || {}) : {};
        const e = g0.e || {};
        const tmp = ibSum(target);                 // 임시로 얹힌 몫 (음수 상쇄 포함)
        const own = [];
        ['luck', 'pct', 'eva', 'bon', 'fac', 'dark', 'gim'].forEach(function (k) {
            const base = (e[k] || 0) - (tmp[k] || 0);   // 순수한 제 몫
            if (base > 0) own.push({ k: k, v: base });
        });
        ownList = own;
        const timed = timedOf(target);

        let html = '<div style="font-size:15px;color:#d4af37;margin-bottom:4px">' + srcName + '</div>'
            + '<div style="margin-bottom:12px;color:#a9a49a">' + target.name
            + ' 사원이 지닌 것 <span style="font-size:11px;color:#7d7870">— 전부 가져옵니다</span></div>';

        const head = function (t) {
            return '<div style="font-size:11px;color:#d4af37;margin:12px 0 5px 0;'
                + 'border-bottom:1px solid #333;padding-bottom:3px">' + t + '</div>';
        };
        const row = function (attrs, label, sub) {
            return '<div style="margin:5px 0;padding-left:2px">· ' + label
                + (sub ? '<br><span style="font-size:11px;color:#7d7870">&nbsp;&nbsp;' + sub + '</span>' : '')
                + '</div>';
        };

        if (gear.length) {
            html += head('장착 중인 것 — 물건은 그대로 두고 능력만 가져옵니다');
            gear.forEach(function (w, i) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                const c = ITEM_CATALOG[base];
                html += row('data-t="gear" data-i="' + i + '"', base,
                    (c && c.desc ? c.desc.slice(0, 60) : ''));
            });
        }
        if (bag.length) {
            html += head('걸려 있는 효과');
            bag.forEach(function (b, i) {
                html += row('data-t="ib" data-i="' + i + '"',
                    buffName(b.k) + ' +' + b.v, b.src || '');
            });
        }
        if (own.length) {
            html += head('본래 능력치');
            own.forEach(function (x) {
                html += row('data-t="own" data-k="' + x.k + '" data-v="' + x.v + '"',
                    buffName(x.k) + ' +' + x.v, '자정까지 빼앗습니다');
            });
        }
        if (timed.length) {
            html += head('몸에 남아 있는 것');
            timed.forEach(function (x, i) {
                html += row('data-t="state" data-i="' + i + '"', x.t, x.sub);
            });
        }
        if (!gear.length && !bag.length && !own.length && !timed.length) {
            html += '<div style="color:#7d7870;padding:18px 0;text-align:center">가져올 것이 없습니다.</div>';
        }

        html += '<div style="margin-top:16px;text-align:right">'
             + btn('확정', 'go', true) + ' ' + btn('닫기', 'no') + '</div>';
        box.innerHTML = html;

        box.querySelector('[data-no]').onclick = function () { back.remove(); };
        box.querySelector('[data-go]').onclick = function () { doTake(gear, bag, timed); };
    }

    // ---------- 가져온다 ----------
    function doTake(gear, bag, timed) {
        const life = msToMidnight();
        const took = [];
        let movedGear = false;

        // 고른 것이 아니라 지닌 것을 전부 가져온다
        const on = [];
        gear.forEach(function (_, i) { on.push({ dataset: { t: 'gear', i: String(i) } }); });
        bag.forEach(function (_, i) { on.push({ dataset: { t: 'ib', i: String(i) } }); });
        timed.forEach(function (_, i) { on.push({ dataset: { t: 'state', i: String(i) } }); });
        ownList.forEach(function (x) {
            on.push({ dataset: { t: 'own', k: x.k, v: String(x.v) } });
        });
        if (!on.length) { back.remove(); return; }

        on.forEach(function (inp) {
            const t = inp.dataset.t;

            if (t === 'gear') {
                const w = gear[parseInt(inp.dataset.i, 10)];
                if (!w) return;
                const eq = target.equippedWeapons || [];
                const at = eq.indexOf(w);
                if (at < 0) return;
                // 빼앗은 것은 장착칸에 보이지 않으므로 칸 수를 세지 않는다
                // 이름을 바꾸면 카탈로그에 없는 이름이 되어 목록을 그리다 터진다.
                // 그래서 상대 칸에서는 잠시 빼 두고, 돌려줄 때 그대로 되돌린다.
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                eq.splice(at, 1);
                const ownerWas = (target.equipOwner && target.equipOwner[w] != null)
                    ? target.equipOwner[w] : null;
                if (target.equipOwner) delete target.equipOwner[w];

                // 빼앗긴 동안에는 다시 차지 못하게 잠근다
                if (!target.gearLock) target.gearLock = {};
                target.gearLock[base] = { by: currentUser.code, src: srcName, day: today() };

                // 특이사항에 무엇을 빼앗겼는지 남기지 않는다
                removeBadgeLine(target, '[장착됨] ' + base);

                const label = base + ' (' + srcName + ')';
                // 장착칸에는 넣지 않는다. 능력을 읽는 함수들만 따로 본다.
                if (!Array.isArray(currentUser.borrowedGear)) currentUser.borrowedGear = [];
                if (currentUser.borrowedGear.indexOf(label) < 0) currentUser.borrowedGear.push(label);
                stolenBag(currentUser)[label] = { kind: 'gear', from: target.code, orig: w,
                    owner: ownerWas, day: today(), src: srcName };
                took.push(base + ' 의 능력');
                movedGear = true;

            } else if (t === 'state') {
                const x = timed[parseInt(inp.dataset.i, 10)];
                if (!x) return;
                // Firebase 는 undefined 를 받지 않는다 — 기본값으로 눌러 둔다
                const zero = (x.kind === 'bool') ? false : 0;
                const mine = (currentUser[x.f] == null) ? zero : currentUser[x.f];
                const theirs = (target[x.f] == null) ? zero : target[x.f];
                if (x.kind === 'time') {
                    currentUser[x.f] = Math.max(mine || 0, theirs || 0);
                    target[x.f] = 0;
                } else if (x.kind === 'num') {
                    currentUser[x.f] = (mine || 0) + (theirs || 0);
                    target[x.f] = 0;
                } else {
                    currentUser[x.f] = true;
                    target[x.f] = false;
                }
                stolenBag(currentUser)['상태:' + x.f] = {
                    kind: 'state', field: x.f, from: target.code, src: srcName,
                    theirs: theirs, mine: mine, day: today(), t: x.t || x.f
                };
                const f = {}; f[x.f] = target[x.f];
                updateUserFields(target.code, f);
                const g = {}; g[x.f] = 1;
                saveFields(g);
                took.push(x.t);
                movedGear = true;

            } else if (t === 'ib') {
                const b = bag[parseInt(inp.dataset.i, 10)];
                if (!b) return;
                ibAdd(currentUser, b.k, b.v, life, srcName);
                ibAdd(target, b.k, -b.v, life, srcName + '에 빼앗김');
                took.push(buffName(b.k) + ' +' + b.v);

            } else {
                const k = inp.dataset.k, v = parseInt(inp.dataset.v, 10);
                ibAdd(currentUser, k, v, life, srcName);
                ibAdd(target, k, -v, life, srcName + '에 빼앗김');
                took.push(buffName(k) + ' +' + v);
            }
        });

        if (!took.length) { back.remove(); return; }
        if (dayCap) daySpend(currentUser, srcName);
        try { putSeal(target, srcName); } catch (e) { }

        if (movedGear) {
            noUndef(currentUser.stolenGear);
            saveFields({ borrowedGear: 1 });
            updateUserFields(target.code, {
                equippedWeapons: target.equippedWeapons || [],
                equipOwner: target.equipOwner || {},
                gearLock: target.gearLock || {}
            });
            saveFields({ stolenGear: 1 });
        }

        const word = (srcName === '황룡의 눈')
            ? '황룡의 눈길을 받았습니다. 가지고 있는 버프가 일시적으로 사라집니다.'
            : '산군의 숨결이 닿았습니다. 가지고 있는 버프가 일시적으로 사라집니다.';

        addHistoryLog(currentUser, '[' + srcName + '] ' + target.name + ' 사원에게서 ' + took.join(', '));
        addHistoryLog(target, '[' + srcName + '] ' + word);
        appendBadgeNoteToUser(target, word);

        // 가져온 쪽에는 무엇을 가져왔는지 적지 않는다. 썼다는 것만 한 줄.
        removeBadgeLine(currentUser, srcName + '을(를) 썼습니다');
        appendBadgeNoteToUser(currentUser, srcName + '을(를) 썼습니다.');
        saveSelfFull();
        updateUI();
        back.remove();
        showCustomAlert('가져왔습니다.\n\n' + took.join('\n')
            + '\n\n해제하거나 자정이 지나면 ' + target.name + ' 사원에게 돌아갑니다.');
    }

    askLook();
}

// ==========================================
// 빼앗은 장비를 돌려준다 — 해제할 때 · 자정에
// ==========================================
function returnStolen(label, quiet) {
    const rec = stolenBag(currentUser)[label];
    if (!rec) return false;
    const t = db.users[rec.from];
    let what = label;

    if (rec.kind === 'state') {
        what = rec.t || rec.field;
        currentUser[rec.field] = (rec.mine == null) ? 0 : rec.mine;
        const g = {}; g[rec.field] = 1;
        saveFields(g);
        if (t) {
            const back = (rec.theirs == null) ? 0 : rec.theirs;
            t[rec.field] = back;
            const f = {}; f[rec.field] = back;
            updateUserFields(t.code, f);
        }
    } else {
        what = rec.orig;
        if (Array.isArray(currentUser.borrowedGear)) {
            const bi = currentUser.borrowedGear.indexOf(label);
            if (bi >= 0) currentUser.borrowedGear.splice(bi, 1);
            saveFields({ borrowedGear: 1 });
        }
        const eq = currentUser.equippedWeapons || [];
        const at = eq.indexOf(label);
        if (at >= 0) eq.splice(at, 1);                     // 예전 판본 정리
        if (currentUser.equipOwner) delete currentUser.equipOwner[label];

        if (t) {
            const te = t.equippedWeapons || [];
            const si = te.indexOf(SEAL + rec.orig);
            if (si >= 0) {
                te[si] = rec.orig;                      // 예전 봉인판을 푼다
                if (t.equipOwner && t.equipOwner[SEAL + rec.orig] != null) {
                    t.equipOwner[rec.orig] = t.equipOwner[SEAL + rec.orig];
                    delete t.equipOwner[SEAL + rec.orig];
                }
            } else if (te.indexOf(rec.orig) < 0) {
                te.push(rec.orig);
                if (rec.owner != null) {
                    if (!t.equipOwner) t.equipOwner = {};
                    t.equipOwner[rec.orig] = rec.owner;
                }
            }
            t.equippedWeapons = te;
            const baseBack = (typeof getEquipBaseName === 'function') ? getEquipBaseName(rec.orig) : rec.orig;
            if (t.gearLock) delete t.gearLock[baseBack];
            if (typeof appendBadgeNoteToUser === 'function') {
                appendBadgeNoteToUser(t, '[장착됨] ' + baseBack);
            }
            updateUserFields(t.code, {
                equippedWeapons: t.equippedWeapons,
                equipOwner: t.equipOwner || {},
                gearLock: t.gearLock || {}
            });
        }
    }

    delete currentUser.stolenGear[label];
    noUndef(currentUser.stolenGear);
    saveFields({ stolenGear: 1 });

    // 남은 것이 없으면 특이사항의 눈길·숨결 문구도 걷는다
    if (t) {
        const still = Object.keys(currentUser.stolenGear || {}).some(function (k) {
            return currentUser.stolenGear[k] && currentUser.stolenGear[k].from === t.code;
        });
        if (!still) {
            removeBadgeLine(t, '황룡의 눈길을 받았습니다');
            removeBadgeLine(t, '산군의 숨결이 닿았습니다');
            liftSeal(t);
        }
        if (rec.src && !Object.keys(currentUser.stolenGear || {}).some(function (k) {
                return currentUser.stolenGear[k] && currentUser.stolenGear[k].src === rec.src;
            })) {
            removeBadgeLine(currentUser, rec.src + '을(를) 썼습니다');
        }
        addHistoryLog(t, '[반환] ' + what + ' 이(가) 돌아왔습니다.');
    }
    saveSelfFull();
    updateUI();
    if (!quiet) showCustomAlert((t ? t.name + ' 사원에게 ' : '') + what + ' 을(를) 돌려주었습니다.');
    return true;
}

// 빼앗은 상태를 한꺼번에 돌려준다 — 장착칸에 없는 것(상태분)까지
window.returnAllStolen = function () {
    const bag = stolenBag(currentUser);
    const keys = Object.keys(bag);
    if (!keys.length) { console.log('빼앗아 둔 것이 없습니다.'); return; }
    keys.forEach(function (k) { returnStolen(k, true); });
    console.log('%c✓ ' + keys.length + '건을 돌려주었습니다.', 'color:#4CAF50');
};

(function hookUnequipReturn() {
    const iv = setInterval(function () {
        if (typeof unequipWeapon !== 'function') return;
        if (unequipWeapon._stolenBack) { clearInterval(iv); return; }
        const _f = unequipWeapon;
        unequipWeapon = function (index) {
            const w = (currentUser.equippedWeapons || [])[index];
            if (w && stolenBag(currentUser)[w]) { returnStolen(w); return; }
            // 황룡의 눈·산군의 도움을 내려놓으면 빼앗은 것을 전부 돌려준다
            const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w || '') : w;
            if (base === '황룡의 눈' || base === '산군의 도움') {
                const n = returnBySource(base);
                const r = _f.apply(this, arguments);
                if (n) setTimeout(function () {
                    showCustomAlert('빼앗았던 ' + n + '건이 제자리로 돌아갔습니다.');
                }, 400);
                return r;
            }
            return _f.apply(this, arguments);
        };
        unequipWeapon._stolenBack = true;
        window.__stolenBackOn = true;
        clearInterval(iv);
        console.log('[신규] 빼앗은 장비 반환 연결');
    }, 500);
})();

// 자정이 지나면 알아서 돌아간다
(function watchStolen() {
    setInterval(function () {
        if (!currentUser || !currentUser.stolenGear) return;
        const now = today();
        Object.keys(currentUser.stolenGear).forEach(function (label) {
            const rec = currentUser.stolenGear[label];
            if (rec && rec.day !== now) returnStolen(label, true);
        });
    }, 60000);
})();

function buffName(k) {
    return ({ luck: '행운', pct: '행운%', eva: '회피', bon: '판정', fac: '공용시설',
              dark: '어둠 탐사', gim: '기믹 파훼', resc: '구출 확률', resist: '저항',
              noPoll: '오염 동결' })[k] || k;
}

// ==========================================
// 10. 아이템 등록
// ==========================================
const DREAM = '백일몽';      // 백일몽 주식회사
const DISAS = '재난관리';    // 재난관리국

const NEW = [
    // ---------- 백일몽 주식회사 ----------
    ['꿈결 수집기', 10000, DREAM, 'n_dream', false,
     '행운 100%, 공용시설 이용 +1. 어둠 탐사마다 추가 정산 +5,000P. (장착)', 3],
    ['종이배', 3000, DREAM, 'n_boat', true,
     '타인에게 접어 주면, 그 사람은 어둠에서 하루 네 번까지 확정으로 남을 구할 수 있다.'],
    ['통신 단추', 5000, DREAM, 'equip_n_button', false,
     '누군가의 단추. 몸에 걸어 두면 위급할 때 세 번까지 저절로 눌린다. 세 번을 쓰면 부서진다. (장착)'],
    ['연구 보고서', 700, DREAM, 'n_report', false,
     '어둠 내역이 적힌 보고서. 세 시간 동안 행운 300%. (1회용)'],
    ['일기장', 9000, DREAM, 'n_diary', false,
     '퇴사한 사원의 일기장. 오염도가 세 시간 멈추고, 다음 어둠에 +2,000P. (1회용)'],
    ['달빛 타투 스티커', 1004, DREAM, 'n_tattoo', false,
     '붙이면 세 가지 중 하나가 무작위로 남는다. 효과가 나오면 자국이 사라진다. (1회용)'],
    ['정갈한 문패', 7000, DREAM, 'n_plate', false,
     '상담실에서 곧바로 나올 수 있다. 다섯 번 쓰면 사라진다.'],
    ['은화 뱀', 15555, DREAM, 'n_snake', false,
     '하루 세 번 튕길 수 있다. 절반은 꽝, 절반은 행운·판정·공용시설 중 하나가 +3.'],
    ['％＄＠＆ 이동장', 444444, DREAM, 'equip_n_cage', true,
     '어떤 것을 담기 위해 만들어졌다. 어둠마다 한 번 확정으로 남을 살리고, 살린 만큼 최대 9,000P. '
     + '남에게 채울 수도 있으며, 채운 사람만 뺄 수 있다. (장착)', 3],
    ['엽서', 500, DREAM, 'n_card', false,
     '한 번 찢으면 네 가지 중 하나가 무작위로 나온다. (1회용)'],
    ['장기말', 5000, DREAM, 'n_piece', false,
     '어느 연구소의 부속품. 던지면 다음 탐사에서 선택지의 무게가 보인다. 세 번 던지면 사라진다.'],
    ['황룡의 눈', 10000000, DREAM, 'equip_n_dragon', true,
     '몸에 걸고 표적을 고른다. 그 사원이 지닌 것을 보고, 원하는 것을 가져온다. '
     + '하루 두 번. 가져간 것도 빼앗긴 것도 자정이 지나면 제자리로 돌아간다. '
     + '본인만 걸 수 있고, 걸어도 닳지 않는다.', 3],
    ['다 헐은 공략집', 500, DREAM, 'n_guide', false,
     '오염도가 두 시간 진행되지 않는다. (1회용)'],
    ['봉제 인형 키트', 140000, DREAM, 'n_doll', false,
     '사용자의 DNA를 읽어 사흘짜리 인형을 짓는다. 기능은 두 가지가 붙는다.'],
    ['탈모약', 3000, DREAM, 'n_hair', false,
     '효과가 죽여준다. 열 시간 동안 머리카락이 풍성해진다.'],

    // ---------- 재난관리국 ----------
    ['오색 신발끈', 7000, DISAS, 'n_lace', false,
     '선녀탕에 들어갔을 때 곧바로 나올 수 있다. 다섯 번 쓰면 사라진다.'],
    ['은색 저울', 90000, DISAS, 'n_scale', false,
     '어둠에서 남을 살릴 때, 자신이 함께 가라앉을 확률이 보인다. (장착)'],
    ['부적이 깃든 등', 10000, DISAS, 'n_lamp', false,
     '장착하고 어둠에 들면 같은 팀에게 무작위 효과가 하나씩 걸린다. (장착)'],
    ['전용 자전거', 15000, DISAS, 'n_bike', false,
     '죽을 위기의 동료를 확정으로 두 번 구한다. 하루 두 번.'],
    ['산군의 도움', 10000000, DISAS, 'equip_n_tiger', true,
     '몸에 걸고 표적을 고른다. 그 사원이 지닌 것 하나를 가져온다. '
     + '하루 두 번. 가져간 것도 빼앗긴 것도 자정이 지나면 제자리로 돌아간다. '
     + '본인만 걸 수 있고, 걸어도 닳지 않는다.', 3],
    ['주의 설명서', 500, DISAS, 'n_manual', false,
     '오염도가 두 시간 진행되지 않는다. (1회용)'],
    ['낚시 줄', 3000, DISAS, 'n_line', false,
     '기믹의 눈을 한 번 끈다. 끌려갈 때 한 번 막아 준다. 다섯 번 쓰면 사라진다.'],
    ['진실 마스크', 9000, DISAS, 'n_mask', true,
     '타인에게만 채울 수 있다. 채운 사람이 어둠에서 자신을 구하면 양쪽에 5,000P. 다섯 번이면 부서진다.'],
    ['포승줄', 12000, DISAS, 'n_rope', false,
     '남을 구할 확률이 크게 늘고 판정 +5. 열 번 쓰면 끊어진다. (장착)'],
    ['공기 누름돌', 5000, DISAS, 'n_stone', false,
     '어둠에 들면 파티 전체에 보호막이 돈다. 저항이 오르고 행운 +2. 하루 다섯 번. (장착)']
];

// 품목별 노출 확률 — 적지 않으면 3%
const RARE_RATE = {
    '황룡의 눈':      0.001,
    '산군의 도움':    0.001,
    '％＄＠＆ 이동장': 0.001,
    '꿈결 수집기':    0.03
};

const RARE3 = [];
if (!window.RARE_ALIEN_RATE) window.RARE_ALIEN_RATE = {};
NEW.forEach(function (row) {
    const nm = row[0], price = row[1], affil = row[2], eff = row[3], tgt = row[4], desc = row[5], rare = row[6];
    ITEM_CATALOG[nm] = { price: price, usable: true, targetable: !!tgt, effect: eff, desc: desc };
    if (typeof EQUIP_AFFIL !== 'undefined') EQUIP_AFFIL[nm] = affil;
    if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(nm) < 0) ALIEN_ITEMS_POOL.push(nm);
    if (rare) { RARE3.push(nm); window.RARE_ALIEN_RATE[nm] = RARE_RATE[nm] || 0.03; }
});

// 은심장 — 쇼핑몰에 올리지 않는다
ITEM_CATALOG[HEART] = {
    price: 0, usable: true, targetable: false, effect: 'n_heart',
    desc: '많은 사람을 구한 이의 심장을 본떠 만든 뱃지. 부서지지 않고 잃어버리지 않는다. '
        + '남을 구한 만큼 행운·회피·판정이 오르고(최대 5), 열 번을 넘기면 구출이 확정된다. '
        + '서른 번을 넘기면 어둠마다 5,000P, 쉰 번을 넘기면 기믹을 한 번 깬다. '
        + '함께 든 파티에게 행운 +1.'
};
// 은심장은 소속을 묻지 않는다 — 상담사가 준 사람만 지닌다

const SHOP_AFFIL = {};
NEW.forEach(function (row) { SHOP_AFFIL[row[0]] = row[2]; });

// ==========================================
// 어둠 소속은 어느 소속 물건이든 찬다
// ==========================================
function isDark(u) {
    return /어둠/.test(((u && u.affiliation) || '') + ' ' + ((u && u.team) || ''));
}

(function hookWear() {
    const iv = setInterval(function () {
        if (typeof canWearItem !== 'function') return;
        if (canWearItem._darkFree) { clearInterval(iv); return; }
        const _c = canWearItem;
        canWearItem = function (user, itemName) {
            if (isDark(user)) return true;
            return _c.apply(this, arguments);
        };
        canWearItem._darkFree = true;
        clearInterval(iv);
        console.log('[신규] 어둠 소속 착용 제한 해제');
    }, 500);
})();

// ==========================================
// 11. 쇼핑몰 노출 — 소속과 확률
// ==========================================
function shopAllowed(nm) {
    const need = SHOP_AFFIL[nm];
    if (!need) return true;
    if (isCounsel(currentUser)) return true;
    if (isDark(currentUser)) return true;          // 어둠 소속은 전부 본다
    return affilText(currentUser).includes(need);
}

function withPool(fn, ctx, args) {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return fn.apply(ctx, args);
    const keep = ALIEN_ITEMS_POOL.slice();
    const use = keep.filter(shopAllowed);
    ALIEN_ITEMS_POOL.length = 0;
    use.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); });
    try { return fn.apply(ctx, args); }
    finally { ALIEN_ITEMS_POOL.length = 0; keep.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); }); }
}

(function hookShop() {
    const iv = setInterval(function () {
        let hit = 0;
        ['renderAlienShop', 'buyAlienItem'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newAffil) { hit++; return; }
            const _f = window[n];
            window[n] = function () { return withPool(_f, this, arguments); };
            window[n]._newAffil = true;
            hit++;
        });
        if (hit < 2) return;
        clearInterval(iv);
        console.log('[신규] 우주 쇼핑몰 소속 제한 연결');
    }, 500);
})();

// ==========================================
// 딴 품목이 소속에 안 맞으면 — 지우지 않고 바꿔 준다
// (진열은 alienUnlockedItems 에 하루치로 쌓인다.
//  지우면 칸이 비어 1~2개만 보이게 되므로, 같은 수를 유지한다.)
// ==========================================
function fixUnlocked() {
    const u = currentUser;
    if (!u || !Array.isArray(u.alienUnlockedItems)) return;
    if (isCounsel(u)) return;

    const bad = u.alienUnlockedItems.filter(function (nm) { return !shopAllowed(nm); });
    if (!bad.length) return;

    const pool = (typeof ALIEN_ITEMS_POOL !== 'undefined' ? ALIEN_ITEMS_POOL : [])
        .filter(function (nm) {
            if (!shopAllowed(nm)) return false;
            if (u.alienUnlockedItems.indexOf(nm) >= 0) return false;
            if (RARE3.indexOf(nm) >= 0) return false;         // 희귀는 대체품으로 주지 않는다
            return true;
        });

    let swapped = 0;
    u.alienUnlockedItems = u.alienUnlockedItems.map(function (nm) {
        if (shopAllowed(nm)) return nm;
        if (!pool.length) return nm;                           // 바꿀 게 없으면 그냥 둔다
        const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        swapped++;
        return pick;
    });

    if (swapped) {
        saveFields({ alienUnlockedItems: 1 });
        console.log('[신규] 소속이 맞지 않던 진열 ' + swapped + '개를 바꿨습니다.');
        if (typeof renderAlienShop === 'function') renderAlienShop();
    }
}

(function watchUnlocked() {
    let last = '';
    setInterval(function () {
        if (!currentUser || !Array.isArray(currentUser.alienUnlockedItems)) return;
        const now = currentUser.alienUnlockedItems.join('|');
        if (now === last) return;
        last = now;
        try { fixUnlocked(); } catch (e) { }
    }, 1200);
})();

// ==========================================
// 12. 효과 — 본인 사용
// ==========================================
const TATTOO = [
    { t: '다음 탐사 +10,000P', run: function () { addDarkPt(currentUser, 10000, '달빛'); } },
    { t: '행운 +300',          run: function () { ibAdd(currentUser, 'luck', 300, 12 * HOUR, '달빛'); } },
    { t: '기믹 파훼 1회',      run: function () { ibAdd(currentUser, 'gim', 1, 24 * HOUR, '달빛'); } }
];

const POSTCARD = [
    { t: '행운 +100',          run: function () { ibAdd(currentUser, 'luck', 100, 12 * HOUR, '엽서'); } },
    { t: '어둠 탐사 +1',       run: function () {
        currentUser.darkTries = Math.max(0, (currentUser.darkTries || 0) - 1);
        saveFields({ darkTries: 1 });
    } },
    { t: '전용 무기 등급 보호', run: function () {
        currentUser.gearProtect = true; saveFields({ gearProtect: 1 });
    } },
    { t: '판정 +1',            run: function () { ibAdd(currentUser, 'bon', 1, 12 * HOUR, '엽서'); } }
];

const DOLL = [
    { k: 'pt',   v: 3000, t: '어둠 추가 정산 +3,000P' },
    { k: 'eva',  v: 2,    t: '회피 +2' },
    { k: 'luck', v: 2,    t: '행운 +2' },
    { k: 'bon',  v: 2,    t: '판정 +2' },
    { k: 'pct',  v: 150,  t: '행운 +150%' }
];

const SNAKE = [
    { k: 'luck', v: 3, t: '행운 +3' },
    { k: 'bon',  v: 3, t: '판정 +3' },
    { k: 'fac',  v: 3, t: '공용시설 이용 +3' }
];

function gone(nm) {
    removeItemFromInventory(currentUser, nm, 1);
    saveSelfFull(); updateUI();
}

const SELF = {

    n_dream: null, n_scale: null, n_lamp: null, n_rope: null, n_stone: null,
    equip_n_cage: null, equip_n_button: null,                           // 장착형

    equip_n_dragon: function (nm) { toggleWorn(nm); },
    equip_n_tiger:  function (nm) { toggleWorn(nm); },

    n_report: function (nm) {
        ibAdd(currentUser, 'pct', 300, 3 * HOUR, '연구 보고서');
        addHistoryLog(currentUser, '[연구 보고서] 행운 300% (3시간)');
        gone(nm);
        showCustomAlert('보고서를 펼쳤습니다.\n\n세 시간 동안 행운 300%.');
    },

    n_diary: function (nm) {
        freezePoll(3, '일기장');
        addDarkPt(currentUser, 2000, '일기장');
        gone(nm);
        showCustomAlert('남의 사흘을 읽었습니다.\n\n오염도 3시간 정지 · 다음 어둠 +2,000P');
    },

    n_tattoo: function (nm) {
        const p = TATTOO[Math.floor(Math.random() * TATTOO.length)];
        p.run();
        appendBadgeNoteToUser(currentUser, '[달빛] ' + p.t);
        addHistoryLog(currentUser, '[달빛 타투] ' + p.t);
        gone(nm);
        showCustomAlert('달빛이 살에 붙었습니다.\n\n' + p.t);
    },

    n_plate: function (nm) {
        if (!(currentUser.quarantineUntil > Date.now())) {
            showCustomAlert('상담실에 있지 않습니다.'); return;
        }
        currentUser.pollution = currentUser.quarantineExitPollution || 0;
        currentUser.quarantineExitPollution = 0;
        currentUser.quarantineUntil = 0;
        currentUser.quarantineDest = null;
        currentUser.quarantineHospital = null;
        saveFields({ pollution: 1, quarantineExitPollution: 1, quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1 });
        const r = totalSpend(nm, 5);
        updateUI();
        showCustomAlert('문패를 내렸습니다.\n\n상담실에서 나왔습니다.'
            + (r.gone ? '\n\n문패가 닳아 없어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_snake: function (nm) {
        if (dayLeft(currentUser, nm, 3) <= 0) { showCustomAlert('오늘은 더 튕길 수 없습니다.'); return; }
        daySpend(currentUser, nm);
        if (Math.random() < 0.5) {
            addHistoryLog(currentUser, '[은화 뱀] 꽝');
            showCustomAlert('뱀이 몸을 뒤집었습니다.\n\n아무 일도 없었습니다.\n\n남은 횟수 '
                + dayLeft(currentUser, nm, 3) + '회');
            return;
        }
        const p = SNAKE[Math.floor(Math.random() * SNAKE.length)];
        ibAdd(currentUser, p.k, p.v, 24 * HOUR, '은화 뱀');
        addHistoryLog(currentUser, '[은화 뱀] ' + p.t);
        showCustomAlert('비늘이 한 번 울었습니다.\n\n' + p.t + '\n\n남은 횟수 '
            + dayLeft(currentUser, nm, 3) + '회');
    },

    n_card: function (nm) {
        const p = POSTCARD[Math.floor(Math.random() * POSTCARD.length)];
        p.run();
        addHistoryLog(currentUser, '[엽서] ' + p.t);
        gone(nm);
        showCustomAlert('엽서를 찢었습니다.\n\n' + p.t);
    },

    n_piece: function (nm) {
        currentUser.pieceHint = 1;
        saveFields({ pieceHint: 1 });
        const r = totalSpend(nm, 3);
        showCustomAlert('장기말을 던졌습니다.\n\n다음 탐사에서 선택지의 무게가 보입니다.'
            + (r.gone ? '\n\n장기말이 닳아 사라졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_guide:  function (nm) { freezePoll(2, '공략집'); gone(nm); showCustomAlert('접힌 자리를 따라 읽었습니다.\n\n오염도 2시간 정지.'); },
    n_manual: function (nm) { freezePoll(2, '주의 설명서'); gone(nm); showCustomAlert('주의 사항을 끝까지 읽었습니다.\n\n오염도 2시간 정지.'); },

    n_doll: function (nm) {
        const pool = DOLL.slice();
        const pick = [];
        for (let i = 0; i < 2; i++) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        pick.forEach(function (p) {
            if (p.k === 'pt') {
                currentUser.dollPt = Date.now() + 3 * 24 * HOUR;
                saveFields({ dollPt: 1 });
            } else ibAdd(currentUser, p.k, p.v, 3 * 24 * HOUR, '봉제 인형');
        });
        appendBadgeNoteToUser(currentUser, '[인형] ' + pick.map(function (p) { return p.t; }).join(' · '));
        addHistoryLog(currentUser, '[봉제 인형] ' + pick.map(function (p) { return p.t; }).join(' · '));
        gone(nm);
        showCustomAlert('자신을 닮은 것이 하나 지어졌습니다. (사흘)\n\n'
            + pick.map(function (p) { return p.t; }).join('\n'));
    },

    n_hair: function (nm) {
        currentUser.hairUntil = Date.now() + 10 * HOUR;
        saveFields({ hairUntil: 1 });
        appendBadgeNoteToUser(currentUser, '[탈모약] 머리카락이 풍성하다');
        addHistoryLog(currentUser, '[탈모약] 열 시간');
        gone(nm);
        showCustomAlert('효과가 죽여줍니다.\n\n열 시간 동안 머리카락이 풍성해집니다.');
    },

        n_plate: function (nm) {
        if (!(currentUser.quarantineUntil > Date.now())) {
            showCustomAlert('상담실에 있지 않습니다.'); return;
        }
        currentUser.quarantineUntil = 0;
        currentUser.quarantineDest = null;
        currentUser.quarantineHospital = null;

        // ★ 정상 해제와 같게 — 오염도를 내려놓고 나온다
        let out = currentUser.quarantineExitPollution || 0;
        if (out >= 100) out = 99;                      // 100으로 나오면 바로 다시 들어간다
        currentUser.pollution = out;
        currentUser.quarantineExitPollution = 0;
        currentUser.lastPollutionTime = Date.now();    // 오염 시계도 다시 맞춘다

        // 탐사 사고 문구도 같이 거둔다
        if (currentUser.badge && currentUser.badge.notes) {
            const arr = currentUser.badge.notes.split(' | ').filter(function (n) {
                return n.trim() !== ''
                    && n.indexOf('의식 불명') < 0
                    && n.indexOf('긴급 이송') < 0
                    && n.indexOf('사직 반려') < 0;
            });
            currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
        }

        saveFields({
            quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1,
            pollution: 1, quarantineExitPollution: 1, lastPollutionTime: 1, badge: 1
        });
        const r = totalSpend(nm, 5);
        updateUI();
        showCustomAlert('문패를 내렸습니다.\n\n상담실에서 나왔습니다. (오염도 ' + out + '%)'
            + (r.gone ? '\n\n문패가 닳아 없어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_bike: function (nm) {
        const left = dayLeft(currentUser, nm, 2);
        showCustomAlert(left > 0
            ? '자전거는 어둠에서 저절로 굴러갑니다.\n\n오늘 남은 확정 구출 ' + left + '회'
            : '오늘은 더 굴러가지 않습니다.');
    },

    n_line: function (nm) {
        currentUser.lineGuard = (currentUser.lineGuard || 0) + 1;
        saveFields({ lineGuard: 1 });
        const r = totalSpend(nm, 5);
        showCustomAlert('줄을 감았습니다.\n\n끌려갈 때 한 번 막습니다.'
            + (r.gone ? '\n\n줄이 다 풀렸습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    }
};

(function hookSelf() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._newItems2) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || !isNewEff(cat.effect)) return _u.apply(this, arguments);

            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)
                && itemName !== '정갈한 문패') {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
                showCustomAlert('소속이 맞지 않습니다.'); return;
            }
            if ((currentUser.inventory || []).indexOf(itemName) === -1) return;

            const fn = SELF[cat.effect];
            if (fn) { fn(itemName); return; }

            // 장착형
            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.length >= 8) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
            currentUser.equippedWeapons.push(itemName);
            setEquipOwner(currentUser, itemName, currentUser.code);
            if (itemName === '통신 단추' && !(currentUser.buttonUses | 0)) {
                currentUser.buttonUses = 3;
                saveFields({ buttonUses: 1 });
            }
            // 은심장은 잃어버리지 않게 막아 두었으니, 옮길 때만 잠금을 푼다
            window.__heartUnlock = true;
            removeItemFromInventory(currentUser, itemName, 1);
            window.__heartUnlock = false;
            appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName);
            addHistoryLog(currentUser, '[장비 장착] ' + itemName);
            saveSelfFull(); updateUI();
            showCustomAlert(itemName + '을(를) 몸에 걸었습니다.');
        };
        useInventoryItem._newItems2 = true;
        clearInterval(iv);
        console.log('[신규] 사용 처리 연결');
    }, 500);
})();

// ==========================================
// 13. 효과 — 타인에게
// ==========================================
(function hookOther() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._newItems2) { clearInterval(iv); return; }
        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || !isNewEff(cat.effect)) return _a.apply(this, arguments);
            if (!targetUser) return false;
            if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
                showCustomAlert('소속이 맞지 않습니다.'); return false;
            }

            if (cat.effect === 'n_boat') {
                targetUser.paperBoat = 4;
                updateUserFields(targetUser.code, { paperBoat: 4 });
                removeBadgeLine(targetUser, '🛶 종이배');
                appendBadgeNoteToUser(targetUser, '🛶 종이배 — 확정 구출 4회 남음');
                addHistoryLog(targetUser, '[종이배] ' + currentUser.name + ' 사원이 접어 주었습니다.');
                addHistoryLog(currentUser, '[종이배] ' + targetUser.name + ' 사원에게');
                showCustomAlert(targetUser.name + ' 사원의 손에 배를 띄웠습니다.\n\n확정 구출 네 번.');
                return true;
            }

            if (cat.effect === 'equip_n_dragon' || cat.effect === 'equip_n_tiger') {
                const isDragon = (cat.effect === 'equip_n_dragon');
                const nm2 = isDragon ? '황룡의 눈' : '산군의 도움';
                const cap = 2;

                if (!hasEquipped(currentUser, nm2)) {
                    showCustomAlert(nm2 + '을(를) 먼저 몸에 걸어야 합니다.\n\n'
                        + '소지품에서 「장착」을 누르세요.'); return false;
                }
                if (targetUser.code === currentUser.code) {
                    showCustomAlert('자기 자신은 고를 수 없습니다.'); return false;
                }
                const left = dayLeft(currentUser, nm2, cap);
                if (left <= 0) {
                    showCustomAlert('오늘은 더 쓸 수 없습니다.\n\n자정이 지나면 다시 열립니다.');
                    return false;
                }
                // 바깥(index.html)에서 소지품을 한 개 빼가므로 도로 채워 넣는다
                const had = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                setTimeout(function () {
                    const now = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                    if (now < had) {
                        currentUser.inventory.push(itemName);
                        saveFields({ inventory: 1 });
                        updateUI();
                    }
                }, 350);

                stealPanel(targetUser, nm2, 2, cap);
                return true;     // 아이템은 사라지지 않는다
            }

            if (cat.effect === 'equip_n_cage') {
                if (!isOthers || targetUser.code === currentUser.code) {
                    return _a.apply(this, arguments);           // 본인 장착은 기본 경로로
                }
                if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
                if (targetUser.equippedWeapons.length >= 8) {
                    showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false;
                }
                const lab = itemName + ' (장착자: ' + currentUser.name + ')';
                targetUser.equippedWeapons.push(lab);
                setEquipOwner(targetUser, lab, currentUser.code);
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + lab);
                addHistoryLog(targetUser, '[이동장] ' + currentUser.name + ' 사원이 채웠습니다.');
                addHistoryLog(currentUser, '[이동장] ' + targetUser.name + ' 사원에게 채웠습니다.');

                // 대상 쪽을 서버에 적는다. 실패하면 물건을 되돌린다.
                const had = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                const undo = function () {
                    const at = targetUser.equippedWeapons.indexOf(lab);
                    if (at >= 0) targetUser.equippedWeapons.splice(at, 1);
                    if (targetUser.equipOwner) delete targetUser.equipOwner[lab];
                    const now = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                    if (now < had) {
                        currentUser.inventory = currentUser.inventory || [];
                        currentUser.inventory.push(itemName);
                    }
                    saveFields({ inventory: 1 });
                    updateUI();
                    showCustomAlert('서버에 적지 못했습니다.\n\n' + itemName + '을(를) 되돌렸습니다.');
                };

                // 값이 있는 것만 담는다 — undefined 가 하나라도 있으면 Firebase 가 통째로 거부한다
                const payload = {
                    equippedWeapons: targetUser.equippedWeapons || [],
                    equipOwner: targetUser.equipOwner || {}
                };
                if (targetUser.badge !== undefined) payload.badge = targetUser.badge;
                if (Array.isArray(targetUser.history)) payload.history = targetUser.history;

                let p;
                try {
                    p = updateUserFields(targetUser.code, payload);
                } catch (e) { console.warn('[이동장] 쓰기 실패:', e); undo(); return false; }

                if (p && typeof p.then === 'function') {
                    p.then(function () {
                        showCustomAlert(targetUser.name + ' 사원에게 채웠습니다.\n\n'
                            + '뺄 수 있는 사람은 채운 쪽뿐입니다.');
                    }).catch(function (e) {
                        console.warn('[이동장] 쓰기 거부:', e && e.message ? e.message : e);
                        undo();
                    });
                } else {
                    showCustomAlert(targetUser.name + ' 사원에게 채웠습니다.\n\n'
                        + '뺄 수 있는 사람은 채운 쪽뿐입니다.');
                }
                return true;
            }

            if (cat.effect === 'n_mask') {
                if (!isOthers || targetUser.code === currentUser.code) {
                    showCustomAlert('타인에게만 채울 수 있습니다.'); return false;
                }
                if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
                if (targetUser.equippedWeapons.length >= 8) {
                    showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false;
                }
                const label = itemName + ' (장착자: ' + currentUser.name + ')';
                targetUser.equippedWeapons.push(label);
                setEquipOwner(targetUser, label, currentUser.code);
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
                addHistoryLog(targetUser, '[진실 마스크] ' + currentUser.name + ' 사원이 채웠습니다.');
                try {
                    const pl = {
                        equippedWeapons: targetUser.equippedWeapons || [],
                        equipOwner: targetUser.equipOwner || {}
                    };
                    if (targetUser.badge !== undefined) pl.badge = targetUser.badge;
                    if (Array.isArray(targetUser.history)) pl.history = targetUser.history;
                    updateUserFields(targetUser.code, pl);
                } catch (e) { console.warn('[진실 마스크]', e); }
                showCustomAlert(targetUser.name + ' 사원의 얼굴에 씌웠습니다.\n\n'
                    + '이제 그 사원의 안쪽이 보입니다.');
                return true;
            }

            return _a.apply(this, arguments);
        };
        applyItemEffect._newItems2 = true;
        clearInterval(iv);
        console.log('[신규] 타인 사용 처리 연결');
    }, 500);
})();

// 봉제 인형 사흘 정산분
(function hookDollPt() {
    const _p = payDarkPt;
    payDarkPt = function () {
        if ((currentUser.dollPt || 0) > Date.now()) addDarkPt(currentUser, 3000, '봉제 인형');
        return _p.apply(this, arguments);
    };
})();

// ==========================================
// 빼앗은 장비는 장착칸에 보이지 않게 — 능력만 돈다
// ==========================================
(function stolenOutOfSight() {
    const EYES = ['황룡의 눈', '산군의 도움'];

    // 줄 하나로 볼 수 있는 크기인지 — 큰 상자는 건드리지 않는다
    function looksLikeRow(el) {
        if (!el) return false;
        if (el === document.body || el === document.documentElement) return false;
        const id = el.id || '';
        if (/app-container|main-screen|login-screen|tab|modal-content|modal-overlay/.test(id)) return false;
        const cls = (el.className || '').toString();
        if (/\bcontainer\b|\btab\b|modal-content|modal-overlay|sub-panel/.test(cls)) return false;
        const t = el.textContent || '';
        if (t.length > 260) return false;
        if (el.querySelectorAll('button').length > 3) return false;
        return true;
    }

    // 줄을 찾는다 — 너무 크지만 않으면 받아 준다
    function findRow(b) {
        let row = b.parentElement, hops = 0;
        while (row && hops < 5) {
            const t = row.textContent || '';
            if (t.length < 700 && row.querySelectorAll('button').length <= 4) {
                for (let j = 0; j < EYES.length; j++) {
                    if (t.indexOf(EYES[j]) >= 0) return { row: row, nm: EYES[j] };
                }
            }
            const id = row.id || '';
            const cls = (row.className || '').toString();
            if (/app-container|main-screen|login-screen/.test(id)
                || /\bcontainer\b|modal-content|modal-overlay/.test(cls)) break;
            row = row.parentElement; hops++;
        }
        return null;
    }

    // 장착칸 줄에 숫자를 덧붙인다 — 은심장 구출 횟수 · 단추 남은 횟수 · 종이배
    const COUNT_OF = {
        '🩶 은심장': function (u) { return '구출 ' + (u.heartSaves || 0) + '회'; },
        '통신 단추': function (u) { return '남은 ' + (u.buttonUses | 0) + '회'; }
    };

    function addCount() {
        if (typeof currentUser === 'undefined' || !currentUser) return;
        const btns = document.querySelectorAll('button');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if ((b.textContent || '').trim() !== '해제') continue;
            let row = b.parentElement, hops = 0, nm = null;
            while (row && hops < 5) {
                const t = row.textContent || '';
                if (t.length < 700) {
                    const keys = Object.keys(COUNT_OF);
                    for (let j = 0; j < keys.length; j++) {
                        if (t.indexOf(keys[j]) >= 0) { nm = keys[j]; break; }
                    }
                }
                if (nm) break;
                const id = row.id || '', cls = (row.className || '').toString();
                if (/app-container|main-screen/.test(id) || /container|modal-content/.test(cls)) break;
                row = row.parentElement; hops++;
            }
            if (!nm || !row) continue;

            const txt = COUNT_OF[nm](currentUser);
            let tag = row.querySelector('.cnt-tag');
            if (!tag) {
                tag = document.createElement('span');
                tag.className = 'cnt-tag';
                tag.style.cssText = 'margin-right:6px;padding:3px 8px;border-radius:3px;'
                    + 'background:rgba(212,175,55,0.18);color:#e8c87a;font-size:11px;white-space:nowrap';
                b.parentElement.insertBefore(tag, b);
            }
            if (tag.textContent !== txt) tag.textContent = txt;
        }
    }

    // 장착칸의 그 줄에 「표적」 버튼을 붙인다
    function addAim() {
        const btns = document.querySelectorAll('button');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if ((b.textContent || '').trim() !== '해제') continue;
            if (b.parentElement && b.parentElement.querySelector('.aim-btn')) continue;
            const found = findRow(b);
            if (!found) continue;
            const a = document.createElement('button');
            a.className = 'aim-btn';
            a.textContent = '표적';
            a.style.cssText = 'margin-right:5px;padding:5px 11px;border:0;cursor:pointer;'
                + 'background:#d4af37;color:#14161c;font-size:11px';
            a.onclick = function (ev) { ev.stopPropagation(); pickTargetFor(found.nm); };
            b.parentElement.insertBefore(a, b);
        }
    }

    // 왜 안 붙는지 보고 싶을 때
    window.aimDebug = function () {
        const btns = Array.from(document.querySelectorAll('button'))
            .filter(function (b) { return (b.textContent || '').trim() === '해제'; });
        console.log('해제 버튼 ' + btns.length + '개');
        btns.forEach(function (b, i) {
            const f = findRow(b);
            const p = b.parentElement;
            console.log((i + 1) + '. 찾음:', f ? f.nm : '✗',
                '| 부모 글자수', (p ? (p.textContent || '').length : 0),
                '| 부모 버튼수', p ? p.querySelectorAll('button').length : 0,
                '| 글:', (p ? (p.textContent || '').trim().slice(0, 40) : ''));
        });
        console.log('붙은 표적 버튼:', document.querySelectorAll('.aim-btn').length + '개');
    };

    let busy = false;
    const run = function () {
        if (busy) return;
        busy = true;
        try { addAim(); addCount(); } catch (e) { }
        busy = false;
    };
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    setTimeout(run, 900);
})();

// ==========================================
// 빼앗긴 장비는 다시 차지 못한다
// ==========================================
function gearLockedOn(u, name) {
    if (!u || !u.gearLock) return null;
    const rec = u.gearLock[name];
    if (!rec) return null;
    if (rec.day && rec.day !== today()) { delete u.gearLock[name]; return null; }   // 자정이 지나면 풀린다
    return rec;
}

(function hookEquipLock() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._gearLock) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const rec = gearLockedOn(currentUser, itemName);
            if (rec) {
                const who = (db.users[rec.by] || {}).name || rec.by;
                showCustomAlert(itemName + '\n\n지금은 손에 잡히지 않습니다.\n'
                    + (rec.src || '') + ' — ' + who + ' 사원이 가져갔습니다.');
                return;
            }
            return _u.apply(this, arguments);
        };
        useInventoryItem._gearLock = true;
        window.__gearLockOn = true;
        clearInterval(iv);
        console.log('[신규] 빼앗긴 장비 잠금 연결');
    }, 500);
})();

// ==========================================
// 빼앗은 것은 장착칸에 넣지 않는다
// 능력을 읽는 함수만 잠깐 같이 보게 한다
// ==========================================
let borrowDepth = 0;
function withBorrowed(fn, ctx, args) {
    const u = currentUser;
    const bor = (u && Array.isArray(u.borrowedGear)) ? u.borrowedGear : [];
    if (!bor.length) return fn.apply(ctx, args);
    if (borrowDepth > 0) return fn.apply(ctx, args);     // 이미 얹은 채로 들어왔으면 그대로
    const keep = (u.equippedWeapons || []).slice();
    u.equippedWeapons = keep.concat(bor);
    borrowDepth++;
    try {
        return fn.apply(ctx, args);
    } finally {
        borrowDepth--;
        u.equippedWeapons = keep;                        // 반드시 되돌린다
    }
}

// 능력을 읽는 함수만 골라 감싼다 — 넓게 쓸면 편집·저장까지 건드린다
// 화면을 건드리는 함수는 넣지 않는다.
// 그 안에서 다시 그리기가 돌면, 잠깐 얹어 둔 목록이 장착칸에 그대로 보인다.
const READERS = [
    'hasEquip', 'plugActive', 'rubyActive', 'hasVaginaPlug', 'myDnaEquip',
    'sapActive', 'isBlindfolded', 'getPollutionMultiplier',
    'facilityLuckMult', 'gearValue', 'dnaGiftOf', 'hasSureBear', 'roleFlipped'
];

(function hookReaders() {
    let tries = 0;
    const iv = setInterval(function () {
        let n = 0, left = 0;
        READERS.forEach(function (k) {
            const f = window[k];
            if (typeof f !== 'function') { left++; return; }
            if (f._seeBorrowed) { n++; return; }
            const _f = f;
            window[k] = function () { return withBorrowed(_f, this, arguments); };
            window[k]._seeBorrowed = true;
            n++;
        });
        if (!left || ++tries > 30) {
            clearInterval(iv);
            console.log('[신규] 빌려 온 능력을 읽는 함수 ' + n + '개 연결');
        }
    }, 600);
})();

// ==========================================
// 표적이 된 사람의 장착칸을 봉인한다
// ==========================================
const SEAL_WORD = {
    '황룡의 눈': '황룡의 시선을 받았습니다.',
    '산군의 도움': '산군의 기운에 억눌립니다.'
};

function sealOn(u) {
    if (!u || !u.gearSeal) return null;
    const r = u.gearSeal;
    if (r.day && r.day !== today()) { delete u.gearSeal; return null; }
    return r;
}

function putSeal(target, srcName) {
    target.gearSeal = { by: currentUser.code, src: srcName, day: today() };
    updateUserFields(target.code, { gearSeal: target.gearSeal });
    removeBadgeLine(target, '황룡의 시선을 받았습니다');
    removeBadgeLine(target, '산군의 기운에 억눌립니다');
    appendBadgeNoteToUser(target, SEAL_WORD[srcName] || '봉인되었습니다.');
}

function liftSeal(t) {
    if (!t || !t.gearSeal) return;
    delete t.gearSeal;
    updateUserFields(t.code, { gearSeal: null });
    removeBadgeLine(t, '황룡의 시선을 받았습니다');
    removeBadgeLine(t, '산군의 기운에 억눌립니다');
}

// 봉인 중에는 아무것도 차지 못한다
(function hookSealEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._gearSeal) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const r = sealOn(currentUser);
            const cat = ITEM_CATALOG[itemName] || {};
            const eff = String(cat.effect || '');
            const isEquip = eff.indexOf('equip_') === 0;
            // 힘을 얹는 물건은 전부 막는다 — 물약·부적·쪽지까지
            const isBuff = /luck|pct|eva|bon|gim|fac|dark|guard|protect|reroll|bonus|b_/.test(eff)
                || /행운|판정|회피|기믹|공용시설|어둠 탐사|보호/.test(String(cat.desc || ''));
            if (r && (isEquip || isBuff)) {
                const who = (db.users[r.by] || {}).name || r.by;
                showCustomAlert((SEAL_WORD[r.src] || '봉인되었습니다.')
                    + '\n\n몸이 묶여 있습니다.\n' + who + ' 사원이 풀 때까지 장착도 힘을 얹는 물건도 쓸 수 없습니다.');
                return;
            }
            return _u.apply(this, arguments);
        };
        useInventoryItem._gearSeal = true;
        window.__gearSealOn = true;
        clearInterval(iv);
        console.log('[신규] 장착칸 봉인 연결');
    }, 500);
})();

// 봉인 문구를 장착칸 위에 올린다
(function showSealBanner() {
    function draw() {
        const r = sealOn(currentUser);
        const old = document.getElementById('gear-seal-line');
        if (!r) { if (old) old.remove(); return; }
        if (old) return;

        // 「장착 중 슬롯 1」 줄을 찾아 그 앞에 끼운다
        const all = document.querySelectorAll('div');
        for (let i = 0; i < all.length; i++) {
            const el = all[i];
            const t = (el.textContent || '');
            if (t.indexOf('[장착 중 슬롯 1]') < 0) continue;
            if (t.length > 400) continue;                   // 큰 상자는 건너뛴다
            const box = document.createElement('div');
            box.id = 'gear-seal-line';
            box.style.cssText = 'margin:8px 0;padding:9px 11px;border:1px solid #8a6b2f;'
                + 'background:rgba(40,28,8,0.85);color:#e8c87a;font-size:12px;letter-spacing:0.3px';
            box.textContent = (SEAL_WORD[r.src] || '봉인되었습니다.') + ' 장착칸이 묶여 있습니다.';
            el.parentElement.insertBefore(box, el);
            return;
        }
    }
    let busy = false;
    const run = function () { if (busy) return; busy = true; try { draw(); } catch (e) { } busy = false; };
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    setInterval(run, 1500);
})();

// ==========================================
// 소지품 버튼 글자 — 「타인」을 「표적」으로
// ==========================================
(function renameTargetBtn() {
    const NAMES = ['황룡의 눈', '산군의 도움'];
    function fix() {
        const btns = document.querySelectorAll('button[onclick]');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const oc = b.getAttribute('onclick') || '';
            let hit = false;
            for (let j = 0; j < NAMES.length; j++) {
                if (oc.indexOf(NAMES[j]) >= 0) { hit = true; break; }
            }
            if (!hit) continue;
            const t = (b.textContent || '').trim();
            if (t === '표적') continue;
            if (/타인|대상|에게|사용/.test(t)) b.textContent = '표적';
        }
    }
    // 그린 직후에 바로 바꾼다 — 주기로 돌리면 다시 그릴 때마다 글자가 왔다 갔다 한다
    let busy = false;
    const run = function () {
        if (busy) return;
        busy = true;
        try { fix(); } catch (e) { }
        busy = false;
    };

    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });

    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._targetLabel) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const out = _r.apply(this, arguments);
            run();
            return out;
        };
        renderInventory._targetLabel = true;
        clearInterval(iv);
    }, 500);

    setTimeout(run, 900);
})();

// ==========================================
// 14. 확인
// ==========================================
window.newItemState = function () {
    const u = currentUser;
    console.log('%c===== 신규 아이템 =====', 'color:#d4af37; font-size:13px');
    console.log('  소속:', affilText(u).trim(), isCounsel(u) ? '(상담사 — 전부 보임)' : '');
    console.log('  등록:', NEW.length + 1 + '종 (뱃지 포함)');

    console.log('%c--- 지금 쇼핑몰에 보이는 신규분 ---', 'color:#4fc3f7');
    const show = Object.keys(SHOP_AFFIL).filter(shopAllowed);
    console.log('  ' + (show.join(' · ') || '(없음)'));
    console.log('  3% 희귀분:', RARE3.map(function (n) {
        return n + ' (' + ((window.RARE_ALIEN_RATE || {})[n] * 100 || 0) + '%)';
    }).join(' · '));
    console.log('  내 진열:', (u.alienUnlockedItems || []).join(' · ') || '(없음)');

    console.log('%c--- 걸려 있는 버프 ---', 'color:#4fc3f7');
    const b = ibClean(u);
    if (b.length) console.table(b.map(function (x) {
        return { 항목: buffName(x.k), 값: x.v, 출처: x.src,
                 남은: x.run ? '다음 탐사 1회' : Math.round((x.until - Date.now()) / 60000) + '분' };
    })); else console.log('  (없음)');

    console.log('%c--- 그밖 ---', 'color:#4fc3f7');
    console.log('  오염 동결:', (u.pollFreezeUntil || 0) > Date.now()
        ? Math.round((u.pollFreezeUntil - Date.now()) / 60000) + '분 남음' : '없음');
    console.log('  대기 정산:', (u.darkPtPend || 0).toLocaleString() + 'P', (u.darkPtWhy || []).join(' · '));
    console.log('  확정 구출권:', rescueGuarantee() || '없음');
    console.log('  낚시 줄 방어:', u.lineGuard || 0);
    console.log('  종이배:', (u.paperBoat | 0) + '회 남음');
    console.log('  통신 단추:', hasEquipped(u, '통신 단추') ? (u.buttonUses | 0) + '회 남음' : '장착 안 함');
    console.log('  은색 저울 확률:', hasEquipped(u, '은색 저울') ? scaleRisk(u) + '%' : '없음');
    console.log('  은심장:', hasSilverHeart(u) ? (u.heartSaves || 0) + '회' : '없음');
    console.log('  빼앗아 둔 것:', Object.keys(u.stolenGear || {}).join(' · ') || '(없음)');
    console.log('  내가 잠긴 장비:', Object.keys(u.gearLock || {}).join(' · ') || '(없음)');
    console.log('  빌려 온 능력:', (u.borrowedGear || []).join(' · ') || '(없음)');
    console.log('  내 장착칸 봉인:', sealOn(u) ? (SEAL_WORD[sealOn(u).src] || '봉인') : '없음');
    ['황룡의 눈', '산군의 도움'].forEach(function (n) {
        if (!hasAny(u, n)) return;
        console.log('  ' + n + ' — 장착', hasEquipped(u, n) ? 'O' : '-',
                    '· 오늘 남은 횟수', dayLeft(u, n, 2));
    });
};

console.log('[신규] 26종 등록 — newItemState() · heartState() · giveSilverHeart(사번)');

})();
;

// ---------- reattr.js ----------
// ==========================================
// ★ 속성 변경권 — 자리와 등급 보존
// index.html 에서 newitems.js 다음에 불러온다
// ==========================================
//
// 지운 자리의 번호와 등급을 기억해 두었다가,
// 새로 고른 속성이 그 자리에 같은 등급으로 들어간다.

// --- 지울 때 ---
(function hookReattr() {
    if (typeof doGearReattr !== 'function') return;
    const _do = doGearReattr;

    doGearReattr = function (attr, itemName) {
        const g = getGear(currentUser);
        if (!g || !g.attrs) return _do.apply(this, arguments);

        const idx = g.attrs.indexOf(attr);
        if (idx < 0) return _do.apply(this, arguments);

        // 뒤 칸들의 등급을 먼저 못박아 둔다 (밀려도 안 내려가게)
        if (!g.attrGrades) g.attrGrades = {};
        g.attrs.forEach(function (a, i) {
            if (i > 0 && !g.attrGrades[a]) g.attrGrades[a] = gearAttrGrade(g, a);
        });

        currentUser.gearReattrIdx = idx;
        currentUser.gearReattrGrade = gearAttrGrade(g, attr);

        return _do.apply(this, arguments);
    };
})();

// --- 새로 새길 때 ---
(function hookPick() {
    if (typeof pickGearAttr !== 'function') return;
    const _pick = pickGearAttr;

    pickGearAttr = function (attr) {
        const g = getGear(currentUser);
        const idx = currentUser ? currentUser.gearReattrIdx : undefined;
        const keep = currentUser ? currentUser.gearReattrGrade : undefined;
        const usedBlank = !!(currentUser && currentUser.gearBlank);
        const waiting = (idx !== undefined && idx !== null && keep);

        const r = _pick.apply(this, arguments);

        if (!waiting || !g || !g.attrs || !g.attrs.includes(attr)) return r;

        // 맨 뒤에 붙은 것을 원래 자리로 되돌린다
        g.attrs = g.attrs.filter(a => a !== attr);
        g.attrs.splice(idx, 0, attr);

        if (!g.attrGrades) g.attrGrades = {};

                if (idx === 0) {
            // 첫 칸은 메인 — 본체 등급을 그대로 따른다
            delete g.attrGrades[attr];
        } else {
            // 두세 번째 칸은 언제나 D부터. 빈 각인지를 썼을 때만 C.
            g.attrGrades[attr] = usedBlank ? 'C' : 'D';
        }

        const grade = (idx === 0) ? g.grade : g.attrGrades[attr];

        delete currentUser.gearReattrIdx;
        delete currentUser.gearReattrGrade;

        addHistoryLog(currentUser, `[속성 변경] ${GEAR_ATTRS[attr].name}이(가) ${idx + 1}번째 자리에 ${grade}등급으로 새겨졌습니다.`);
        saveSelfFull();
        updateUI();
        return r;
    };
})();

// --- 지우는 화면에 자리와 등급 표시 ---
(function hookModal() {
    if (typeof openGearReattr !== 'function') return;
    const _open = openGearReattr;

    openGearReattr = function (itemName) {
        const g = getGear(currentUser);
        if (!g || !g.attrs || g.attrs.length === 0) return _open.apply(this, arguments);

        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                지울 속성을 고르세요.<br>
                <span style="color:#4CAF50;">자리는 그대로 남습니다.</span> 첫 번째 자리는 본체 등급을 따르고, 두세 번째 자리는 D등급부터 다시 시작합니다.<br>
                <span style="color:#ff9800;">변경권은 즉시 소모됩니다.</span>
            </div>` +
            g.attrs.map(function (a, i) {
                const gr = gearAttrGrade(g, a);
                return `
                    <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px; margin-bottom:8px;">
                        <div style="font-size:10px; color:#888; margin-bottom:4px;">${i + 1}번째 자리</div>
                        <div style="font-size:13px; color:#d4bbff; font-weight:bold;">
                            ${GEAR_ATTRS[a].icon} ${GEAR_ATTRS[a].name}
                            <span style="color:#fff; font-size:11px; margin-left:5px;">${gr}등급</span>
                        </div>
                        <div style="font-size:10px; color:#999; margin:5px 0 8px 0;">${GEAR_ATTRS[a].desc}</div>
                        <button class="game-btn" style="width:100%; margin:0; padding:8px; font-size:11px;" onclick="doGearReattr('${a}','${itemName}')">이 자리를 비운다${i === 0 ? '' : ' (D등급부터 다시)'}</button>
                    </div>`;
            }).join('');

        openGearModal('속성 변경', html);
    };
})();

// --- 비워 둔 자리 안내 ---
(function hookPickModal() {
    if (typeof openGearAttrPick !== 'function') return;
    const _open = openGearAttrPick;

    openGearAttrPick = function () {
        const r = _open.apply(this, arguments);
        const idx = currentUser ? currentUser.gearReattrIdx : undefined;
        const keep = currentUser ? currentUser.gearReattrGrade : undefined;
        if (idx === undefined || idx === null || !keep) return r;

        const body = document.getElementById('gear-modal-body');
        if (!body) return r;
        body.insertAdjacentHTML('afterbegin',
            `<div style="background:rgba(76,175,80,0.08); border:1px solid #2e7d32; border-radius:6px; padding:10px; margin-bottom:11px; font-size:11px; color:#a5d6a7; line-height:1.7;">
                <b>${idx + 1}번째 자리</b>가 비어 있습니다.<br>
             고른 속성이 그 자리에 <b>${idx === 0 ? '본체 등급' : (currentUser.gearBlank ? 'C등급' : 'D등급')}</b>으로 들어갑니다.
             </div>`);
        return r;
    };
})();

console.log('[속성 변경] 자리·등급 보존 적용');
;

// ---------- awaken.js ----------
// ==========================================
// ★ 각성 돌파권 — 자리별로 따로 적용
// index.html 에서 reattr.js 다음에 불러온다
// ==========================================
//
// 본체 · 2번째 속성 · 3번째 속성에 각각 한 장씩 필요하다.

// --- 기존 값 옮기기 (true → 본체만 각성) ---
(function migrate() {
    if (!currentUser) return;
    if (currentUser.gearAwakened === true) currentUser.gearAwakened = { 0: true };
})();

function awakenBag() {
    if (!currentUser) return {};
    if (currentUser.gearAwakened === true) currentUser.gearAwakened = { 0: true };
    if (!currentUser.gearAwakened || typeof currentUser.gearAwakened !== 'object') currentUser.gearAwakened = {};
    return currentUser.gearAwakened;
}
function isAwakened(idx) {
    return !!awakenBag()[idx];
}
function slotGrade(idx) {
    const g = getGear(currentUser);
    if (!g) return null;
    if (idx === 0) return g.grade;
    const a = (g.attrs || [])[idx];
    return a ? gearAttrGrade(g, a) : null;
}
function slotName(idx) {
    const g = getGear(currentUser);
    if (!g) return '';
    if (idx === 0) return '본체';
    const a = (g.attrs || [])[idx];
    return a ? `${GEAR_ATTRS[a].icon} ${GEAR_ATTRS[a].name}` : `${idx + 1}번째 자리`;
}

// --- 돌파권 사용 ---
(function hookUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'awaken') return _use.apply(this, arguments);

        const g = getGear(currentUser);
        if (!g) { showCustomAlert('전용 장비가 없습니다.'); return; }

        const list = [];
        for (let i = 0; i < (g.slots || 1); i++) {
            const gr = slotGrade(i);
            if (!gr) continue;
            list.push({ idx: i, grade: gr, done: isAwakened(i) });
        }

        const usable = list.filter(x => x.grade === 'S' && !x.done);
        if (usable.length === 0) {
            const why = list.some(x => x.grade === 'S' && x.done)
                ? '이미 한계를 넘은 자리뿐입니다.'
                : 'S등급인 자리가 없습니다.';
            showCustomAlert(why + '\n\n각성 돌파권은 S등급 자리에만 쓸 수 있습니다.');
            return;
        }

        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                어느 자리의 한계를 풀지 고르세요.<br>
                <span style="color:#ff9800;">자리마다 따로 필요합니다.</span> 한 장은 한 자리에만 쓰입니다.
            </div>` +
            list.map(x => {
                const ok = x.grade === 'S' && !x.done;
                return `
                    <div style="border:1px solid ${ok ? '#4a3a6a' : '#333'}; border-radius:6px; padding:11px; margin-bottom:8px; ${ok ? '' : 'opacity:0.4;'}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:13px; color:#d4bbff; font-weight:bold;">${slotName(x.idx)}</span>
                            <span style="font-size:12px; color:#fff;">${x.grade}등급</span>
                        </div>
                        <div style="font-size:10px; color:#888; margin:5px 0 8px 0;">
                            ${x.done ? '이미 한계를 넘었습니다.' : x.grade === 'S' ? 'L등급 승급이 열립니다.' : 'S등급이어야 합니다.'}
                        </div>
                        <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;" onclick="doAwaken(${x.idx},'${itemName}')" ${ok ? '' : 'disabled'}>
                            ${x.done ? '각성 완료' : ok ? '이 자리를 푼다' : '조건 미달'}
                        </button>
                    </div>`;
            }).join('');

        openGearModal('각성 돌파권', html);
    };
})();

function doAwaken(idx, itemName) {
    const g = getGear(currentUser);
    if (!g) return;
    if (slotGrade(idx) !== 'S') { showCustomAlert('S등급 자리에만 쓸 수 있습니다.'); return; }
    if (isAwakened(idx)) { showCustomAlert('이미 한계를 넘은 자리입니다.'); return; }
    if (!(currentUser.inventory || []).includes(itemName)) { showCustomAlert('돌파권이 없습니다.'); return; }

    awakenBag()[idx] = true;
    removeItemFromInventory(currentUser, itemName, 1);
    addHistoryLog(currentUser, `[각성] '${g.name}'의 ${slotName(idx)} 한계가 풀렸습니다.`);
    saveSelfFull();
    closeGearModal();
    updateUI();
    showCustomAlert(`무언가가 풀리는 소리가 났습니다.\n\n${slotName(idx)} — 이제 L등급으로 올릴 수 있습니다.`);
}

// --- 승급 차단 ---
(function hookUpgrade() {
    if (typeof tryGearUpgrade !== 'function') return;
    const _try = tryGearUpgrade;
    tryGearUpgrade = function (idx) {
        if (slotGrade(idx) === 'S' && !isAwakened(idx)) {
            showCustomAlert(`${slotName(idx)}은(는) 아직 한계에 막혀 있습니다.\n\n각성 돌파권을 그 자리에 써야 합니다.`);
            return;
        }
        return _try.apply(this, arguments);
    };
})();

// --- 강화 화면에 표시 ---
(function hookPanel() {
    if (typeof openGearUpgrade !== 'function') return;
    const _open = openGearUpgrade;
    openGearUpgrade = function () {
        const r = _open.apply(this, arguments);
        try {
            const g = getGear(currentUser);
            if (!g) return r;
            const body = document.getElementById('gear-modal-body');
            if (!body) return r;
            const boxes = body.querySelectorAll('div[style*="border:1px solid #4a3a6a"]');
            boxes.forEach(function (box, i) {
                if (slotGrade(i) !== 'S') return;
                const tag = isAwakened(i)
                    ? `<div style="font-size:10px; color:#4CAF50; margin-top:6px;">◈ 한계 해제됨 — L등급 승급 가능</div>`
                    : `<div style="font-size:10px; color:#ff9800; margin-top:6px;">◈ 각성 돌파권이 필요합니다</div>`;
                box.insertAdjacentHTML('beforeend', tag);
                if (!isAwakened(i)) {
                    const btn = box.querySelector('button');
                    if (btn) { btn.disabled = true; btn.innerText = '한계에 막힘'; }
                }
            });
        } catch (e) {}
        return r;
    };
})();

console.log('[각성 돌파권] 자리별 적용');
;

// ---------- chatcontrast.js ----------
// ==========================================
// ★ AI 대화창 자동 대비
// index.html 에서 awaken.js 다음에 불러온다
// ==========================================
//
// 배경 밝기를 재서 글자색을 자동으로 뒤집는다.
// 테마를 새로 추가해도 따로 손볼 필요가 없다.

(function injectChatContrast() {
    const css = `
/* 대화창 바탕 — 테마와 무관하게 확실한 대비 */
#fox-chat-log, #bath-chat-log {
    background: rgba(0,0,0,0.42) !important;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    padding: 12px 11px !important;
}
#fox-chat-log *, #bath-chat-log * {
    color: #f0f0f0 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.9);
}
/* 상대 발언 강조색만 따로 */
#fox-chat-log .ai-say, #fox-chat-log b {
    color: #ffd76a !important;
}
#bath-chat-log .ai-say, #bath-chat-log b {
    color: #9fe8e8 !important;
}
/* 내 발언 */
#fox-chat-log .me-say, #bath-chat-log .me-say {
    color: #cfcfcf !important;
}
/* 입력칸 */
#fox-input, #bath-input {
    background: rgba(0,0,0,0.55) !important;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.22) !important;
}
#fox-input::placeholder, #bath-input::placeholder { color: #999 !important; }

/* 모달 본문 전반 */
#fox-modal .modal-content, #bath-modal .modal-content {
    background: #10100c !important;
}
#bath-modal .modal-content { background: #0b1418 !important; }

/* 어둠 탐사 대화 */
/* 어둠 탐사 대화 — 바탕을 어둡게 깔고 글자를 밝게 */
.pchat-wrap, .pchat-body, .pchat-log {
    background: rgba(0,0,0,0.55) !important;
}
.pchat-head {
    background: rgba(0,0,0,0.7) !important;
    color: #f0f0f0 !important;
}
.pchat-head * { color: #f0f0f0 !important; }
.pchat-log, .pchat-log * {
    color: #f2f2f2 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.95);
}
.pchat-log .pchat-sys, .pchat-log .pchat-sys * {
    color: #d8d8d8 !important;
    font-style: italic;
}
.pchat-log .pchat-name { color: #ffd76a !important; }
.pchat-log .pchat-time { color: #b0b0b0 !important; }
.pchat-log .pchat-me .pchat-name { color: #9fe8e8 !important; }
#pchat-input {
    background: rgba(0,0,0,0.55) !important;
    color: #fff !important;
    border: 1px solid rgba(255,255,255,0.22) !important;
}
`;
    const st = document.createElement('style');
    st.id = 'chat-contrast';
    st.textContent = css;
    document.head.appendChild(st);
})();

// --- 밝은 바탕 위에 올라간 글자를 자동으로 뒤집는다 ---
(function autoContrast() {
    function lum(rgb) {
        const m = String(rgb).match(/\d+/g);
        if (!m || m.length < 3) return null;
        const v = m.slice(0, 3).map(function (x) {
            x = x / 255;
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    }

    function bgOf(el) {
        let n = el;
        while (n && n !== document.documentElement) {
            const c = getComputedStyle(n).backgroundColor;
            const m = String(c).match(/[\d.]+/g);
            if (m && (m.length < 4 || parseFloat(m[3]) > 0.3)) return c;
            n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
    }

    function fix(root) {
        if (!root) return;
        const l = lum(bgOf(root));
        if (l === null) return;
        const light = l > 0.45;
        root.querySelectorAll('*').forEach(function (el) {
            if (!el.childNodes.length) return;
            const has = Array.prototype.some.call(el.childNodes, function (n) {
                return n.nodeType === 3 && n.textContent.trim();
            });
            if (!has) return;
            el.style.setProperty('color', light ? '#161616' : '#f0f0f0', 'important');
            el.style.setProperty('text-shadow',
                light ? '0 1px 1px rgba(255,255,255,0.7)' : '0 1px 2px rgba(0,0,0,0.9)', 'important');
        });
    }

       window.fixChatContrast = function () {
        ['fox-chat-log', 'bath-chat-log'].forEach(function (id) {
            fix(document.getElementById(id));
        });
    };

    // 대화가 갱신될 때마다 다시 잡는다
    const mo = new MutationObserver(function () {
        clearTimeout(window._ccT);
        window._ccT = setTimeout(window.fixChatContrast, 60);
    });
    ['fox-chat-log', 'bath-chat-log'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) mo.observe(el, { childList: true, subtree: true });
    });

    const chatSlot = document.getElementById('dro-chat');
    if (chatSlot) mo.observe(chatSlot, { childList: true, subtree: true });

    setTimeout(window.fixChatContrast, 300);
})();

// 모달을 열 때도 한 번
(function hookOpen() {
    ['openFoxRoom', 'openBathRoom', 'enterQuarantineRoom'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(window.fixChatContrast, 200);
            return r;
        };
    });
})();

console.log('[대화창] 자동 대비 적용');
;

// ---------- bank.js ----------
// ==========================================
// ★ 사내 은행
// ==========================================
const BANK_GRADES = [
    { g:1, min:850, cap:10000000, rate:0.006, loan:60000, fee:0.03, label:'1등급' },
    { g:2, min:700, cap:3000000,  rate:0.005, loan:20000, fee:0.05, label:'2등급' },
    { g:3, min:500, cap:500000,   rate:0.004, loan:5000,  fee:0.08, label:'3등급' },
    { g:4, min:300, cap:200000,   rate:0.003, loan:1000,  fee:0.12, label:'4등급' },
    { g:5, min:0,   cap:50000,    rate:0.002, loan:0,     fee:0,    label:'5등급' }
];
const BANK_VIP = { cap: 30000000, label: 'VIP' };
const BANK_LOAN_DAYS = 3;
const BANK_DAY = 24 * 60 * 60 * 1000;

// ★ 꼼수 방지
const BANK_MIN_HOLD      = 12 * 60 * 60 * 1000;  // 최소 보유 시간
const BANK_MIN_RATIO     = 0.3;                  // 한도 대비 최소 대출 비율
const BANK_GAIN_COOLDOWN = BANK_DAY;             // 신용 가산 간격
const BANK_BL_LOANS      = 3;                    // 이 횟수째 대출 시 블랙리스트
const BANK_BL_WINDOW     = BANK_DAY;             // 집계 기간

let bankState = null, bankRef = null, bankKey = null;

function bankPath(code) { return 'bank/' + code; }
function bankGrade(score) {
    return BANK_GRADES.find(x => (score || 0) >= x.min) || BANK_GRADES[BANK_GRADES.length - 1];
}
function bankCap(b) {
    const base = (b && b.vip && !b.blacklist) ? BANK_VIP.cap : bankGrade(b && b.score).cap;
    return base + ((b && b.capBonus) || 0);
}
function bankClamp(s) { return Math.max(0, Math.min(1000, s)); }
function bankOverdue(b) { return !!(b && b.loan && Date.now() > b.loan.dueAt); }
function bankBlack(b) { return !!(b && b.blacklist); }
function bankRecentLoans(b) {
    const now = Date.now();
    return (b && b.loanTimes ? b.loanTimes : []).filter(t => now - t < BANK_BL_WINDOW).length;
}

function bankFmtLeft(ms) {
    if (ms <= 0) return '기한 지남';
    const d = Math.floor(ms / BANK_DAY);
    const h = Math.floor((ms % BANK_DAY) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return d > 0 ? `${d}일 ${h}시간` : `${h}시간 ${m}분`;
}

function bankReadAmt(id) {
    const el = document.getElementById(id);
    const v = parseInt(el && el.value, 10);
    if (isNaN(v) || v <= 0) { showCustomAlert('올바른 금액을 입력해주세요.'); return 0; }
    return v;
}

// --- 내 계좌 실시간 연결 ---
function attachBank() {
    if (!database || !currentUser) return;
    if (bankKey === currentUser.code) return;
    if (bankRef) { try { bankRef.off(); } catch (e) {} }
    bankKey = currentUser.code;
    bankState = null;
    bankRef = database.ref(bankPath(currentUser.code));
    bankRef.on('value', s => {
        bankState = s.val();
        checkVIPStatus();
        const panel = document.getElementById('tab-vip');
        if (panel && panel.classList.contains('active')) renderBank();
    });
    bankSettle();
}

// --- 개설 · 이자 · 연체 정산 ---
function bankSettle() {
    if (!database || !currentUser) return;
    const me = currentUser;
    const now = Date.now();
    const initScore = me.code === 'kario0987' ? 1000 : (me.hasVIP ? 700 : 500);

    database.ref(bankPath(me.code)).transaction(b => {
        if (!b) b = {};
        if (b.createdAt == null) {
            b.deposit = b.deposit || 0;
            b.lastInterest = now;
            b.score = (b.score != null) ? b.score : initScore;
            b.capBonus = b.capBonus || 0;
            b.createdAt = now;
        }

         if (me.code === 'kario0987') {
            if (!b.vip) b.vip = { at: now, by: 'system' };
            b.score = 1000;
            b.blacklist = null;
            b.vipRequest = null;
        }

        // 이자 (블랙리스트는 없음)
        const gr = bankGrade(b.score);
        const cap = bankCap(b);
        const days = Math.floor((now - (b.lastInterest || now)) / BANK_DAY);
        if (days > 0) {
            if ((b.deposit || 0) > 0 && !b.blacklist) {
                let d = b.deposit;
                for (let i = 0; i < Math.min(days, 30); i++) d *= (1 + gr.rate);
                b.deposit = Math.min(cap, Math.max(b.deposit, Math.floor(d)));
            }
            b.lastInterest = (b.lastInterest || now) + days * BANK_DAY;
        }

        // 연체
        if (b.loan && now > b.loan.dueAt) {
            const overDays = Math.floor((now - b.loan.dueAt) / BANK_DAY) + 1;
            const applied = b.loan.penaltyDays || 0;
            if (overDays > applied) {
                const add = overDays - applied;
                b.loan.owe = Math.ceil(b.loan.owe * Math.pow(1.05, add));
                b.score = bankClamp((b.score || 0) - (applied === 0 ? 80 : 0) - 20 * add);
                if (applied === 0) b.loan.notice = true;
                b.loan.penaltyDays = overDays;
            }
            if (overDays >= 3 && (b.deposit || 0) > 0) {
                const take = Math.min(b.deposit, b.loan.owe);
                b.deposit -= take;
                b.loan.owe -= take;
            }
            if (b.loan.owe <= 0) b.loan = null;
            else if (overDays >= 5) b.loan.seize = true;
        }

        if (b.blacklist) { b.score = 0; b.vip = null; b.vipRequest = null; }
        return b;
    }).then(res => {
                const b = res.snapshot && res.snapshot.val();
        if (!b || !currentUser) return;

        if (b.loan && b.loan.notice) {
            database.ref(bankPath(me.code) + '/loan/notice').set(false);
            applyPollutionToUser(currentUser, 10);
            addHistoryLog(currentUser, '[은행] 대출 상환 기한을 넘겼습니다. (오염도 +10%)');
            saveFields({ pollution: 1, history: 1 });
        }

        if (b.loan && b.loan.seize && currentUser.points > 0) {
            const take = Math.min(currentUser.points, b.loan.owe);
            database.ref(bankPath(me.code)).transaction(x => {
                if (!x || !x.loan) return;
                x.loan.owe -= take;
                x.loan.seize = false;
                if (x.loan.owe <= 0) x.loan = null;
                return x;
                        }).then(r => {
                if (!r.committed || !currentUser) return;
                changePoints(-take);
                addHistoryLog(currentUser, `[은행 압류] 연체 대출금 ${take.toLocaleString()} P가 회수되었습니다.`);
                saveFields({ history: 1 });
            });
        }

        const safes = currentUser.safeBoxes || [];
        if (safes.length > 0 && !currentUser.safeMigrated) {
            const total = safes.reduce((a, s) => a + (s.amount || 0), 0);
            const bonus = safes.length * 50000;
            database.ref(bankPath(me.code)).transaction(x => {
                if (!x) return;
                x.deposit = (x.deposit || 0) + total;
                x.capBonus = (x.capBonus || 0) + bonus;
                return x;
            }).then(r => {
                if (!r.committed || !currentUser) return;
                currentUser.safeBoxes = [];
                currentUser.safeMigrated = true;
                addHistoryLog(currentUser, `[은행] 금고 ${safes.length}개의 ${total.toLocaleString()} P가 예금으로 이전되었습니다.`);
                saveSelfFull();
            });
        }
    });
}

// --- 신용 점수 가감 (블랙리스트는 오르지 않음) ---
function bankAddScore(delta, code) {
    if (!database) return;
    const c = code || (currentUser && currentUser.code);
    if (!c) return;
    database.ref(bankPath(c)).transaction(b => {
        if (!b) return;
        if (b.blacklist && delta > 0) return;
        b.score = bankClamp((b.score == null ? 500 : b.score) + delta);
        return b;
    });
}

// --- 예금 ---
function bankDeposit() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태입니다.\n입금할 수 없습니다.'); return; }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;
    if (amt > currentUser.points) { showLuxuryAlert(); return; }

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || b.blacklist) return;
        const room = bankCap(b) - (b.deposit || 0);
        if (room <= 0) return;
        const put = Math.min(room, amt);
        b.deposit = (b.deposit || 0) + put;
        b.lastOp = put;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('예금 한도가 가득 찼습니다.'); return; }
        const put = res.snapshot.val().lastOp;
        changePoints(-put);
        addHistoryLog(currentUser, `[은행 입금] ${put.toLocaleString()} P`);
        saveFields({ history: 1 });
        showCustomAlert(put < amt
            ? `${put.toLocaleString()} P를 넣었습니다.\n한도 때문에 ${(amt - put).toLocaleString()} P는 넣지 못했습니다.`
            : `${put.toLocaleString()} P를 넣었습니다.`);
    });
}

function bankWithdraw() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    if (bankOverdue(bankState)) { showCustomAlert('연체 중에는 출금할 수 없습니다.'); return; }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || (b.deposit || 0) < amt) return;
        b.deposit -= amt;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('예금 잔액이 부족합니다.'); return; }
        changePoints(amt);
        addHistoryLog(currentUser, `[은행 출금] ${amt.toLocaleString()} P`);
        saveFields({ history: 1 });
        showPointGainEffect(amt);
    });
}

// --- 대출 ---
function bankBorrow() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태입니다.\n대출할 수 없습니다.'); return; }
    const gr = bankGrade(bankState.score);
    if (gr.loan <= 0) { showCustomAlert('신용 4등급부터 대출할 수 있습니다.'); return; }
    if (bankState.loan) { showCustomAlert('이미 대출 중입니다. 먼저 상환해주세요.'); return; }
    const amt = bankReadAmt('bank-loan-amt');
    if (!amt) return;
    if (amt > gr.loan) { showCustomAlert(`대출 한도는 ${gr.loan.toLocaleString()} P입니다.`); return; }

    const now = Date.now();
    const owe = Math.ceil(amt * (1 + gr.fee));

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || b.loan || b.blacklist) return;

        const recent = (b.loanTimes || []).filter(t => now - t < BANK_BL_WINDOW);
        recent.push(now);
        b.loanTimes = recent.slice(-10);

        // ★ 반복 대출 → 블랙리스트
        if (recent.length >= BANK_BL_LOANS) {
            b.blacklist = { at: now, reason: '24시간 안에 대출을 반복함', by: 'system' };
            b.score = 0;
            b.vip = null;           // ★ 추가
            b.vipRequest = null;
            b.lastOp = 'blacklisted';
            return b;
        }

        b.loan = {
            principal: amt, owe: owe, limitAt: gr.loan,
            takenAt: now, dueAt: now + BANK_LOAN_DAYS * BANK_DAY, penaltyDays: 0
        };
        b.lastOp = 'ok';
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('대출을 처리하지 못했습니다.'); return; }
        const v = res.snapshot.val();

        if (v.lastOp === 'blacklisted') {
            addHistoryLog(currentUser, '[은행] 대출 반복으로 거래가 정지되었습니다. (블랙리스트)');
            saveFields({ history: 1 });
            showCustomAlert('창구 직원이 서류를 넘기다 멈춥니다.\n\n24시간 안에 대출을 너무 여러 번 했습니다.\n거래가 정지되고 신용이 초기화되었습니다.');
            return;
        }

        changePoints(amt);
        addHistoryLog(currentUser, `[은행 대출] ${amt.toLocaleString()} P (상환액 ${owe.toLocaleString()} P, ${BANK_LOAN_DAYS}일)`);
        saveFields({ history: 1 });
        showPointGainEffect(amt);
        showCustomAlert(`${amt.toLocaleString()} P를 빌렸습니다.\n\n${BANK_LOAN_DAYS}일 안에 ${owe.toLocaleString()} P를 갚아야 합니다.`);
    });
}

function bankRepay(all) {
    if (!buyGuard()) return;
    if (!bankState || !bankState.loan) { showCustomAlert('갚을 대출이 없습니다.'); return; }
    let amt = all ? bankState.loan.owe : bankReadAmt('bank-repay-amt');
    if (!amt) return;
    amt = Math.min(amt, bankState.loan.owe);
    if (amt > currentUser.points) { showLuxuryAlert(); return; }

    const now = Date.now();
    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || !b.loan) return;
        const pay = Math.min(amt, b.loan.owe);
        b.loan.owe -= pay;
        b.lastOp = pay;
        b.lastCleared = false;
        b.lastGain = 0;
        b.lastWhy = '';

        if (b.loan.owe <= 0) {
            const onTime  = now <= b.loan.dueAt;
            const held    = now - (b.loan.takenAt || now);
            const limit   = b.loan.limitAt || bankGrade(b.score).loan || 1;
            const bigEnough = b.loan.principal >= Math.ceil(limit * BANK_MIN_RATIO);
            const cooled  = !b.lastGainAt || (now - b.lastGainAt) >= BANK_GAIN_COOLDOWN;

            let gain = 0, why = '';
            if (b.blacklist)            why = '거래 정지 상태라 신용에 반영되지 않았습니다.';
            else if (held < BANK_MIN_HOLD) why = '빌린 지 12시간이 지나지 않아 신용에 반영되지 않았습니다.';
            else if (!bigEnough)        why = '대출 금액이 한도의 30% 미만이라 신용에 반영되지 않았습니다.';
            else if (!cooled)           why = '신용 가산은 24시간에 한 번만 됩니다.';
            else gain = onTime ? 40 : 10;

            if (gain) {
                b.score = bankClamp((b.score || 0) + gain);
                b.lastGainAt = now;
            }
            b.lastGain = gain;
            b.lastWhy = why;
            b.lastCleared = true;
            b.loan = null;
        }
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('상환을 처리하지 못했습니다.'); return; }
        const v = res.snapshot.val();
        changePoints(-v.lastOp);
        addHistoryLog(currentUser, `[은행 상환] ${v.lastOp.toLocaleString()} P`);
        saveFields({ history: 1 });

        if (!v.lastCleared) { showCustomAlert(`${v.lastOp.toLocaleString()} P를 갚았습니다.`); return; }
        showCustomAlert(v.lastGain
            ? `전액 상환했습니다.\n신용 점수가 ${v.lastGain} 올랐습니다.`
            : `전액 상환했습니다.\n\n${v.lastWhy}`);
    });
}

// --- 아이템 연동 ---
function bankUseVipPass(itemName) {
    if (!database) return;
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태에서는 제출할 수 없습니다.'); return; }
    removeItemFromInventory(currentUser, itemName, 1);
    bankAddScore(150);
    addHistoryLog(currentUser, `[은행] ${itemName}을(를) 제출했습니다. (신용 점수 +150)`);
    saveFields({ inventory: 1, history: 1 });
    updateUI();
    showCustomAlert('출입증을 제출했습니다.\n신용 점수가 150 올랐습니다.');
}

function bankAddSafeCap(itemName) {
    if (!database) return;
    removeItemFromInventory(currentUser, itemName, 1);
    database.ref(bankPath(currentUser.code) + '/capBonus').transaction(c => (c || 0) + 50000);
    addHistoryLog(currentUser, `[은행] 금고를 설치했습니다. (예금 한도 +50,000 P)`);
    saveFields({ inventory: 1, history: 1 });
    updateUI();
    showCustomAlert('금고를 설치했습니다.\n예금 한도가 50,000 P 늘었습니다.');
}

// --- 사원증 표시 ---
function checkVIPStatus() {
    attachBank();
    const el = document.getElementById('display-vip');
    if (!el) return;
    if (!bankState) { el.innerHTML = '-'; return; }
    if (bankBlack(bankState)) { el.innerHTML = '<span style="color:#f44336;">블랙리스트</span>'; return; }
    const late = bankOverdue(bankState) ? '<span style="color:#f44336;"> 연체</span>' : '';
    if (bankState.vip) { el.innerHTML = '<span style="color:#d4af37;">VIP</span>' + late; return; }
    el.innerHTML = bankGrade(bankState.score).label + late;
}

// --- 화면 ---
function renderBank() {
    const box = document.getElementById('bank-body');
    if (!box || !currentUser) return;
    attachBank();

    if (!bankState) {
        box.innerHTML = `<div class="panel-title">[사내 은행]</div>
            <div style="text-align:center; color:#888; font-size:12px; padding:30px 0;">계좌를 여는 중...</div>`;
        return;
    }

    const b = bankState;
    const black = bankBlack(b);
    const vip = !!b.vip && !black;
    const score = b.score || 0;
    const gr = bankGrade(score);
    const cap = bankCap(b);
    const next = BANK_GRADES.filter(x => x.min > score).sort((x, y) => x.min - y.min)[0];
    const loan = b.loan;
    const overdue = bankOverdue(b);
    const recent = bankRecentLoans(b);
    const gradeColor = black ? '#f44336' : vip ? '#d4af37' : ({ 1:'#d4af37', 2:'#c9a8ff', 3:'#4fc3f7', 4:'#aaa', 5:'#777' }[gr.g]);
    const man = n => (n >= 10000 ? (n / 10000).toLocaleString() + '만' : n.toLocaleString());

    let html = `<div class="panel-title">[사내 은행]</div>`;

    if (black) {
        html += `
            <div style="background:rgba(127,0,0,0.2); border:1px solid #b71c1c; border-radius:6px; padding:13px; margin-bottom:14px; font-size:11px; color:#ff9baa; line-height:1.8;">
                <div style="font-size:13px; color:#f44336; font-weight:bold; margin-bottom:6px;">⛔ 거래 정지 (블랙리스트)</div>
                사유: ${b.blacklist.reason || '-'}<br>
                등록: ${new Date(b.blacklist.at).toLocaleString()}<br>
                <span style="color:#aaa;">입금·대출이 막히고 이자가 붙지 않습니다. 출금과 상환은 가능합니다.<br>해제는 상담사에게 문의하세요.</span>
            </div>`;
    }

    // 신용
    html += `
        <div style="background:rgba(0,0,0,0.35); border:1px solid ${vip ? '#d4af37' : 'var(--theme-border)'}; border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="font-size:11px; color:#888;">신용 등급</span>
                <span style="font-size:20px; font-weight:bold; color:${gradeColor};">${black ? '블랙리스트' : vip ? 'VIP' : gr.label}</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden; margin:9px 0 5px 0;">
                <div style="height:100%; width:${score / 10}%; background:${gradeColor};"></div>
            </div>
            <div style="font-size:10px; color:#888; display:flex; justify-content:space-between;">
                <span>${score} / 1000</span>
                <span>${black ? '점수 동결' : vip ? 'VIP 회원' : next ? `${next.label}까지 ${next.min - score}점` : 'VIP는 심사가 필요합니다'}</span>
            </div>
        </div>`;

    // VIP
    html += `<div style="background:rgba(212,175,55,0.06); border:1px solid #5a4a2a; border-radius:6px; padding:13px; margin-bottom:14px;">
        <div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:8px;">VIP</div>`;
    if (vip) {
        html += `<div style="font-size:11px; color:#ccc; line-height:1.8;">
                VIP 회원입니다. 예금 한도 <b style="color:#d4af37;">${man(BANK_VIP.cap)} P</b><br>
                <span style="font-size:10px; color:#888;">승인일 ${new Date(b.vip.at).toLocaleDateString()}</span>
            </div>`;
    } else if (b.vipRequest) {
        html += `<div style="font-size:11px; color:#ffb74d; line-height:1.8;">
                심사 대기 중입니다.<br>
                <span style="color:#aaa;">상담사에게 찾아가 심사를 받으세요.</span>
            </div>`;
    } else if (black) {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:6px 0;">거래 정지 상태에서는 신청할 수 없습니다.</div>`;
    } else if (score >= 850) {
        const cool = b.vipRejectedAt && (Date.now() - b.vipRejectedAt < BANK_DAY);
        html += `<div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:10px;">
                1등급 사원은 VIP 심사를 신청할 수 있습니다.<br>
                승인되면 예금 한도가 ${man(BANK_VIP.cap)} P가 됩니다.
                ${cool ? `<br><span style="color:#ff9800;">최근 반려되었습니다. ${bankFmtLeft(BANK_DAY - (Date.now() - b.vipRejectedAt))} 뒤 다시 신청할 수 있습니다.</span>` : ''}
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:10px;" onclick="bankApplyVip()" ${cool || overdue ? 'disabled' : ''}>VIP 심사 신청</button>`;
    } else {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:6px 0;">🔒 1등급 달성 후 심사를 신청할 수 있습니다.</div>`;
    }
    html += `</div>`;

    // 예금
    html += `
        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:13px; margin-bottom:14px;">
            <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">예금</div>
            <div style="font-size:18px; font-weight:bold; color:#ffd700;">${(b.deposit || 0).toLocaleString()} P</div>
            <div style="font-size:10px; color:#888; margin:4px 0 11px 0; line-height:1.6;">
                한도 ${cap.toLocaleString()} P${b.capBonus ? ` <span style="color:#aaa;">(금고 +${b.capBonus.toLocaleString()})</span>` : ''} · 일 이자 ${black ? '없음' : (gr.rate * 100).toFixed(1) + '%'}<br>
                어둠에서 사망해도 잃지 않습니다.
            </div>
            <input type="number" id="bank-dep-amt" min="1" placeholder="금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankDeposit()" ${black ? 'disabled' : ''}>입금</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankWithdraw()" ${overdue ? 'disabled' : ''}>출금</button>
            </div>
            ${overdue ? `<div style="font-size:10px; color:#f44336; margin-top:7px; text-align:center;">연체 중에는 출금할 수 없습니다.</div>` : ''}
        </div>`;

    // 대출
    html += `<div style="background:rgba(0,0,0,0.3); border:1px solid ${overdue ? '#7f0000' : 'var(--theme-border)'}; border-radius:6px; padding:13px; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">대출</div>`;

    if (loan) {
        const left = loan.dueAt - Date.now();
        const held = Date.now() - (loan.takenAt || Date.now());
        html += `
            <div style="font-size:11px; color:#aaa; line-height:1.8;">
                빌린 금액 ${loan.principal.toLocaleString()} P<br>
                갚을 금액 <b style="color:${overdue ? '#f44336' : '#ffd700'}; font-size:15px;">${loan.owe.toLocaleString()} P</b><br>
                ${overdue
                    ? `<span style="color:#f44336;">연체 ${loan.penaltyDays || 1}일째 — 매일 5%씩 불어납니다.</span><br>
                       <span style="font-size:10px; color:#888;">3일째부터 예금에서, 5일째부터 보유 포인트에서 회수됩니다.</span>`
                    : `남은 기한 <b>${bankFmtLeft(left)}</b>`}
                ${(!overdue && held < BANK_MIN_HOLD)
                    ? `<br><span style="font-size:10px; color:#ff9800;">지금 갚으면 신용에 반영되지 않습니다. (신용 반영까지 ${bankFmtLeft(BANK_MIN_HOLD - held)})</span>`
                    : ''}
            </div>
            <input type="number" id="bank-repay-amt" min="1" placeholder="상환 금액" style="width:100%; text-align:center; margin:10px 0 8px 0; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(false)">일부 상환</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(true)">전액 상환</button>
            </div>`;
    } else if (black) {
        html += `<div style="font-size:11px; color:#f44336; text-align:center; padding:8px 0;">⛔ 거래 정지 상태입니다.</div>`;
    } else if (gr.loan <= 0) {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:8px 0;">🔒 신용 4등급부터 이용할 수 있습니다.</div>`;
    } else {
        html += `
            <div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:10px;">
                한도 <b style="color:#ddd;">${gr.loan.toLocaleString()} P</b> · 수수료 ${(gr.fee * 100).toFixed(0)}% · 기한 ${BANK_LOAN_DAYS}일<br>
                신용 +40 조건: 12시간 이상 보유 · 한도 30% 이상 · 기한 내 전액 상환 · 24시간에 1번<br>
                <span style="color:${recent >= BANK_BL_LOANS - 1 ? '#f44336' : '#ff9800'};">
                    최근 24시간 대출 ${recent}회 — ${BANK_BL_LOANS}번째 대출 시 거래 정지
                </span>
            </div>
            <input type="number" id="bank-loan-amt" min="1" max="${gr.loan}" placeholder="대출 금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <button class="game-btn" style="width:100%; margin:0; padding:10px;" onclick="bankBorrow()">빌린다</button>`;
    }
    html += `</div>`;

    // 등급표
    html += `
        <details style="font-size:10px; color:#888;">
            <summary style="cursor:pointer; margin-bottom:8px;">등급별 혜택 보기</summary>
            <div style="display:flex; justify-content:space-between; padding:5px 3px; border-bottom:1px solid rgba(255,255,255,0.05); color:#d4af37; ${vip ? 'font-weight:bold;' : ''}">
                <span>VIP (심사)</span>
                <span>예금 ${man(BANK_VIP.cap)} · 1등급 혜택 동일</span>
            </div>
            ${BANK_GRADES.map(x => `
                <div style="display:flex; justify-content:space-between; padding:5px 3px; border-bottom:1px solid rgba(255,255,255,0.05); ${(!black && !vip && x.g === gr.g) ? 'color:var(--theme-focus); font-weight:bold;' : ''}">
                    <span>${x.label} (${x.min}+)</span>
                    <span>예금 ${man(x.cap)} · ${(x.rate * 100).toFixed(1)}% · 대출 ${x.loan ? man(x.loan) : '불가'}</span>
                </div>`).join('')}
        </details>`;

    box.innerHTML = html;
}
// --- 관리자: 신용 점수 조정 ---
function adminAdjustCredit() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    openTextInput('신용 점수 조정',
        `더하거나 뺄 점수를 적어 주세요. (예: 100, -80)<br><span style="font-size:10px; color:#888;">0 ~ 1000 범위 · 블랙리스트는 올라가지 않습니다.</span>`,
        '100',
        v => {
            const d = parseInt(v, 10);
            if (isNaN(d)) { showCustomAlert('숫자를 입력해주세요.'); return; }
            targets.forEach(code => bankAddScore(d, code));
            showCustomAlert(`${targets.length}명의 신용 점수를 ${d >= 0 ? '+' : ''}${d} 조정했습니다.`);
        });
}

// --- 관리자: 블랙리스트 ---
function adminBankBlacklist(on) {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    if (!database) return;

    if (on) {
        openTextInput('블랙리스트 등록', '사유를 적어 주세요.', '예: 대출 반복 악용', reason => {
            targets.forEach(code => {
                database.ref(bankPath(code)).transaction(b => {
                    b = b || {};
                    b.blacklist = { at: Date.now(), reason: reason, by: 'admin' };
                    b.score = 0;
                    b.vip = null;           // ★ 추가
                    b.vipRequest = null;  
                    return b;
                });
            });
            showCustomAlert(`${targets.length}명을 블랙리스트에 올렸습니다.`);
        });
    } else {
        targets.forEach(code => {
            database.ref(bankPath(code)).transaction(b => {
                if (!b) return;
                b.blacklist = null;
                b.loanTimes = [];
                b.score = Math.max(b.score || 0, 300);
                return b;
            });
        });
        showCustomAlert(`${targets.length}명의 블랙리스트를 해제했습니다.\n신용 300점(4등급)부터 다시 시작합니다.`);
    }
}

// ==========================================
// ★ VIP 심사
// ==========================================
function bankApplyVip() {
    if (!buyGuard()) return;
    const b = bankState;
    if (!b || !database) return;
    if (b.vip) { showCustomAlert('이미 VIP 회원입니다.'); return; }
    if (bankBlack(b)) { showCustomAlert('거래 정지 상태에서는 신청할 수 없습니다.'); return; }
    if ((b.score || 0) < 850) { showCustomAlert('1등급만 신청할 수 있습니다.'); return; }
    if (b.vipRequest) { showCustomAlert('이미 심사 대기 중입니다.'); return; }
    if (bankOverdue(b)) { showCustomAlert('연체 중에는 신청할 수 없습니다.'); return; }
    if (b.vipRejectedAt && Date.now() - b.vipRejectedAt < BANK_DAY) { showCustomAlert('반려 후 24시간이 지나야 다시 신청할 수 있습니다.'); return; }

    database.ref(bankPath(currentUser.code) + '/vipRequest').set({
        at: Date.now(), score: b.score, name: currentUser.name, no: currentUser.no
    });
    addHistoryLog(currentUser, '[은행] VIP 심사를 신청했습니다.');
    saveFields({ history: 1 });
    showCustomAlert('VIP 심사를 신청했습니다.\n\n상담사에게 찾아가 심사를 받으세요.');
}

// --- 관리자 ---
function renderAdminVipList() {
    const box = document.getElementById('admin-vip-list');
    if (!box || !database) return;
    box.innerHTML = `<div style="font-size:10px; color:#888; padding:8px 0;">불러오는 중...</div>`;

    database.ref('bank').once('value').then(snap => {
        const all = snap.val() || {};
        const reqs = [], vips = [];
        Object.keys(all).forEach(code => {
            const b = all[code];
            if (b && b.vipRequest) reqs.push({ code, b });
            if (b && b.vip) vips.push({ code, b });
        });
        const nameOf = c => db.users[c] ? `${db.users[c].name} · ${db.users[c].no}` : c;

        let html = `<div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:6px;">심사 대기 (${reqs.length})</div>`;
        html += reqs.length ? reqs.map(({ code, b }) => `
            <div style="background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; border-radius:5px; padding:9px 10px; margin-bottom:6px;">
                <div style="font-size:12px; color:#fff; font-weight:bold;">${nameOf(code)}</div>
                <div style="font-size:10px; color:#888; margin:3px 0 8px 0;">
                    신용 ${b.score} · 예금 ${(b.deposit || 0).toLocaleString()} P · 신청 ${new Date(b.vipRequest.at).toLocaleString()}
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="adminVipDecide('${code}', true)">승인</button>
                    <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:11px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="adminVipDecide('${code}', false)">반려</button>
                </div>
            </div>`).join('')
            : `<div style="font-size:10px; color:#666; padding:4px 0 10px 0;">대기 중인 신청이 없습니다.</div>`;

        html += `<div style="font-size:10px; color:#d4af37; font-weight:bold; margin:10px 0 6px 0;">VIP 회원 (${vips.length})</div>`;
        html += vips.length ? vips.map(({ code, b }) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid #333; border-radius:5px; padding:7px 10px; margin-bottom:5px;">
                <span style="font-size:11px; color:#ddd;">${nameOf(code)}
                    <span style="font-size:9px; color:#888;"> · ${new Date(b.vip.at).toLocaleDateString()}</span>
                </span>
                <button class="game-btn" style="margin:0; padding:5px 10px; font-size:10px;" onclick="adminVipRevoke('${code}')">박탈</button>
            </div>`).join('')
            : `<div style="font-size:10px; color:#666; padding:4px 0;">VIP 회원이 없습니다.</div>`;

        box.innerHTML = html;
    });
}

function adminVipDecide(code, ok) {
    if (!database) return;
    database.ref(bankPath(code)).transaction(b => {
        if (!b || !b.vipRequest) return;
        if (ok) b.vip = { at: Date.now(), by: 'admin' };
        else b.vipRejectedAt = Date.now();
        b.vipRequest = null;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('이미 처리된 신청입니다.'); renderAdminVipList(); return; }
        const u = db.users[code];
        if (u) {
            addHistoryLog(u, ok ? '[은행] VIP 심사를 통과했습니다.' : '[은행] VIP 심사에서 반려되었습니다.');
            updateUserFields(code, { history: u.history });
        }
        showCustomAlert(ok ? 'VIP로 승인했습니다.' : '반려했습니다.');
        renderAdminVipList();
    });
}

function adminVipRevoke(code) {
    if (!database) return;
    database.ref(bankPath(code)).transaction(b => {
        if (!b || !b.vip) return;
        b.vip = null;
        return b;
    }).then(res => {
        if (!res.committed) return;
        const u = db.users[code];
        if (u) {
            addHistoryLog(u, '[은행] VIP 자격이 박탈되었습니다.');
            updateUserFields(code, { history: u.history });
        }
        showCustomAlert('VIP 자격을 박탈했습니다.');
        renderAdminVipList();
    });
}
;

// ---------- allamount.js ----------
// ==========================================
// ★ 은행 · 금고 — 전액 버튼
// index.html 에서 chatcontrast.js 다음에 불러온다
// ==========================================

// --- 값 채우기 ---
function fillAmt(id, v) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = Math.max(0, Math.floor(v || 0));
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

// 은행 — 넣을 수 있는 최대 (보유 포인트와 남은 한도 중 작은 쪽)
function bankMaxIn() {
    if (!bankState) return 0;
    const room = bankCap(bankState) - (bankState.deposit || 0);
    return Math.max(0, Math.min(currentUser.points || 0, room));
}
function bankMaxOut() {
    if (!bankState) return 0;
    return Math.max(0, bankState.deposit || 0);
}

// 금고
function safeMaxIn() {
    const room = safeCapacity(currentUser) - safeTotal(currentUser);
    return Math.max(0, Math.min(currentUser.points || 0, room));
}
function safeMaxOut() {
    return Math.max(0, safeTotal(currentUser));
}

// --- 은행 화면에 버튼 붙이기 ---
(function hookBank() {
    if (typeof renderBank !== 'function') return;
    const _r = renderBank;
    renderBank = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const inp = document.getElementById('bank-dep-amt');
            if (!inp || document.getElementById('bank-allbtn')) return;

            const row = document.createElement('div');
            row.id = 'bank-allbtn';
            row.style.cssText = 'display:flex; gap:5px; margin:7px 0 0 0;';
            row.innerHTML = `
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', bankMaxIn())">전액 입금액</button>
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', bankMaxOut())">전액 출금액</button>
                <button class="game-btn" style="flex:0 0 58px; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('bank-dep-amt', 0)">지움</button>`;
            inp.parentElement.insertBefore(row, inp.nextSibling);

            const info = document.createElement('div');
            info.style.cssText = 'font-size:10px; color:#888; margin-top:5px; line-height:1.6;';
            info.innerHTML = `넣을 수 있는 최대 <b style="color:#4CAF50;">${bankMaxIn().toLocaleString()} P</b> · 뺄 수 있는 최대 <b style="color:#ffd700;">${bankMaxOut().toLocaleString()} P</b>`;
            row.parentElement.insertBefore(info, row.nextSibling);
        }, 60);
        return r;
    };
})();

// --- 금고 화면에 버튼 붙이기 ---
(function hookSafe() {
    if (typeof openSafePanel !== 'function') return;
    const _o = openSafePanel;
    openSafePanel = function () {
        const r = _o.apply(this, arguments);
        setTimeout(function () {
            const inp = document.getElementById('safe-amount');
            if (!inp || document.getElementById('safe-allbtn')) return;

            const row = document.createElement('div');
            row.id = 'safe-allbtn';
            row.style.cssText = 'display:flex; gap:5px; margin:7px 0 0 0;';
            row.innerHTML = `
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', safeMaxIn())">전액 입금액</button>
                <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', safeMaxOut())">전액 출금액</button>
                <button class="game-btn" style="flex:0 0 58px; margin:0; padding:8px; font-size:11px;" onclick="fillAmt('safe-amount', 0)">지움</button>`;
            inp.parentElement.insertBefore(row, inp.nextSibling);

            const info = document.createElement('div');
            info.style.cssText = 'font-size:10px; color:#888; margin-top:5px; line-height:1.6;';
            info.innerHTML = `넣을 수 있는 최대 <b style="color:#4CAF50;">${safeMaxIn().toLocaleString()} P</b> · 뺄 수 있는 최대 <b style="color:#ffd700;">${safeMaxOut().toLocaleString()} P</b>`;
            row.parentElement.insertBefore(info, row.nextSibling);
        }, 60);
        return r;
    };
})();

console.log('[은행·금고] 전액 버튼 적용');
;

// ---------- frames.js ----------
// ==========================================
// ★ 사원증 테두리 — 견본첩 40종
// index.html 에서 allamount.js 다음에 불러온다
// ==========================================

const FRAME_REFUND = { D: 20, C: 30, B: 40, A: 50, S: 60, L: 120 };
const FRAME_WEIGHT = { D: 60, C: 25, B: 10, A: 4.5, S: 0.5, L: 0.05 };
const FRAME_COLOR  = { D: '#9e9e9e', C: '#4fc3f7', B: '#c9a8ff', A: '#ffd700', S: '#ff6b9d', L: '#00e5ff' };

const FRAMES = [
    // ===== D 16종 · 사무 =====
    { id:'d01', g:'D', n:'무지', c:`border:2px solid #8a8a8a;` },
    { id:'d02', g:'D', n:'철선', c:`border:2px solid #6b6b6b; box-shadow:inset 0 0 0 1px #3a3a3a;` },
    { id:'d03', g:'D', n:'갱지', c:`border:2px solid #b8a888; background-image:linear-gradient(0deg, rgba(180,160,120,0.06), transparent);` },
    { id:'d04', g:'D', n:'복사용지', c:`border:2px solid #d8d8d8; box-shadow:0 0 6px rgba(255,255,255,0.12);` },
    { id:'d05', g:'D', n:'형광펜', c:`border:2px solid #d4e157; animation:frBreath 3.4s ease-in-out infinite;` },
    { id:'d06', g:'D', n:'연필선', c:`border:2px dashed #7a7a6a;` },
    { id:'d07', g:'D', n:'압정', c:`border:2px solid #8a8a8a; box-shadow:0 0 0 3px rgba(200,60,60,0.25);` },
    { id:'d08', g:'D', n:'스테이플러', c:`border:2px solid #9a9a9a; border-top-width:4px;` },
    { id:'d09', g:'D', n:'마스킹 테이프', c:`border:3px solid rgba(220,200,150,0.55);` },
    { id:'d10', g:'D', n:'모눈', c:`border:2px solid #6a7a8a; background-image:linear-gradient(rgba(120,150,180,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,180,0.10) 1px, transparent 1px); background-size:9px 9px;` },
    { id:'d11', g:'D', n:'점선', c:`border:2px dotted #909090;` },
    { id:'d12', g:'D', n:'이중선', c:`border:3px double #a0a0a0;` },
    { id:'d13', g:'D', n:'낡은 종이', c:`border:2px solid #9a8a70; filter:sepia(0.15);` },
    { id:'d14', g:'D', n:'커피 자국', c:`border:2px solid #7a5a3a; box-shadow:inset 0 0 12px rgba(120,80,40,0.28);` },
    { id:'d15', g:'D', n:'접힌 자국', c:`border:2px solid #8a8a8a; background-image:linear-gradient(135deg, transparent 47%, rgba(255,255,255,0.10) 50%, transparent 53%);` },
    { id:'d16', g:'D', n:'지문', c:`border:2px solid #7a7a7a; box-shadow:inset 0 0 10px rgba(150,150,150,0.20);` },

    // ===== C 12종 · 건물 =====
    { id:'c01', g:'C', n:'형광등', c:`border:2px solid #cfd8dc; box-shadow:0 0 10px rgba(207,216,220,0.45); animation:frFlicker 5s linear infinite;` },
    { id:'c02', g:'C', n:'비상구', c:`border:2px solid #4CAF50; box-shadow:0 0 10px rgba(76,175,80,0.5); animation:frBreath 2.6s ease-in-out infinite;` },
    { id:'c03', g:'C', n:'복도 조명', c:`border:2px solid #b0bec5; background-image:linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent); background-size:200% 100%; animation:frSlide 5s linear infinite;` },
    { id:'c04', g:'C', n:'엘리베이터', c:`border:2px solid #90a4ae; border-left-width:5px; border-right-width:5px;` },
    { id:'c05', g:'C', n:'창틀', c:`border:3px solid #78909c; box-shadow:inset 0 0 0 2px rgba(255,255,255,0.10);` },
    { id:'c06', g:'C', n:'블라인드', c:`border:2px solid #90a4ae; background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 7px);` },
    { id:'c07', g:'C', n:'카펫', c:`border:3px solid #6d4c41; box-shadow:inset 0 0 8px rgba(110,70,50,0.35);` },
    { id:'c08', g:'C', n:'명패', c:`border:2px solid #b8a060; box-shadow:0 0 0 1px #5a4a2a, inset 0 0 6px rgba(200,170,100,0.25);` },
    { id:'c09', g:'C', n:'사원증 케이스', c:`border:3px solid rgba(180,200,220,0.45); box-shadow:inset 0 0 14px rgba(255,255,255,0.12);` },
    { id:'c10', g:'C', n:'안전선', c:`border:3px solid #ffb300; background-image:repeating-linear-gradient(45deg, rgba(255,179,0,0.14) 0 7px, transparent 7px 14px);` },
    { id:'c11', g:'C', n:'주의 테이프', c:`border:3px solid #000; background-image:repeating-linear-gradient(45deg, #ffca28 0 9px, #1a1a1a 9px 18px); background-clip:border-box; box-shadow:inset 0 0 0 99px rgba(0,0,0,0.78);` },
    { id:'c12', g:'C', n:'소화전', c:`border:2px solid #e53935; box-shadow:0 0 9px rgba(229,57,53,0.45); animation:frBreath 3s ease-in-out infinite;` },

    // ===== B 7종 · 어둠 =====
    { id:'b01', g:'B', n:'어둠 가장자리', c:`border:2px solid #4a2a4a; box-shadow:inset 0 0 18px rgba(0,0,0,0.9), 0 0 12px rgba(90,40,90,0.45); animation:frBreath 4.2s ease-in-out infinite;` },
    { id:'b02', g:'B', n:'꺼진 가로등', c:`border:2px solid #5a5a3a; box-shadow:0 0 14px rgba(200,180,90,0.30); animation:frFlicker 3.2s linear infinite;` },
    { id:'b03', g:'B', n:'거울', c:`border:2px solid #8fa8c8; background-image:linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%); background-size:250% 100%; animation:frSlide 3.6s linear infinite;` },
    { id:'b04', g:'B', n:'미로', c:`border:2px solid #7a6a5a; background-image:repeating-linear-gradient(90deg, rgba(180,160,130,0.12) 0 3px, transparent 3px 10px), repeating-linear-gradient(0deg, rgba(180,160,130,0.12) 0 3px, transparent 3px 10px);` },
    { id:'b05', g:'B', n:'안개', c:`border:2px solid rgba(200,210,220,0.45); box-shadow:0 0 20px rgba(200,210,220,0.25), inset 0 0 16px rgba(200,210,220,0.12); animation:frBreath 5s ease-in-out infinite;` },
    { id:'b06', g:'B', n:'물그림자', c:`border:2px solid #2a6a7a; background-image:linear-gradient(180deg, transparent, rgba(60,160,180,0.14)); animation:frWave 4.5s ease-in-out infinite;` },
    { id:'b07', g:'B', n:'꺼지지 않는 초', c:`border:2px solid #c8922a; box-shadow:0 0 14px rgba(255,180,60,0.40); animation:frFlame 2.2s ease-in-out infinite;` },

    // ===== A 4종 · 구역 =====
    { id:'a01', g:'A', n:'검역', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(90deg,#e53935,#ffb300,#e53935); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 200% 100%; animation:frSlide 3s linear infinite; box-shadow:0 0 16px rgba(229,57,53,0.40);` },
    { id:'a02', g:'A', n:'심해', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(135deg,#01579b,#4fc3f7,#00363a,#4fc3f7); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 300% 300%; animation:frDrift 7s ease-in-out infinite; box-shadow:0 0 18px rgba(79,195,247,0.35);` },
    { id:'a03', g:'A', n:'동화의 뒷면', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(120deg,#8d6e63,#d7ccc8,#6d4c41,#d7ccc8); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 260% 260%; animation:frDrift 8s ease-in-out infinite; box-shadow:0 0 16px rgba(215,204,200,0.30);` },
    { id:'a04', g:'A', n:'별자리', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), conic-gradient(from 0deg,#1a237e,#5c6bc0,#e8eaf6,#5c6bc0,#1a237e); background-origin:border-box; background-clip:padding-box,border-box; animation:frSpin 9s linear infinite; box-shadow:0 0 20px rgba(92,107,192,0.45);` },

    // ===== S 1종 =====
    { id:'s01', g:'S', n:'■■의 ■■■', c:`` }
];

// ==========================================
// 스타일
// ==========================================
(function injectFrameCSS() {
    let css = `
@keyframes frBreath { 0%,100%{filter:brightness(1);} 50%{filter:brightness(1.55);} }
@keyframes frFlicker { 0%,92%,96%,100%{opacity:1;} 94%{opacity:0.45;} 98%{opacity:0.7;} }
@keyframes frSlide { 0%{background-position:0% 50%, 0% 50%;} 100%{background-position:0% 50%, 200% 50%;} }
@keyframes frDrift { 0%,100%{background-position:0% 50%, 0% 50%;} 50%{background-position:0% 50%, 100% 50%;} }
@keyframes frSpin { 0%{--fra:0deg; transform:rotate(0);} 100%{--fra:360deg;} }
@keyframes frWave { 0%,100%{box-shadow:inset 0 -6px 14px rgba(60,160,180,0.20);} 50%{box-shadow:inset 0 -14px 22px rgba(60,160,180,0.38);} }
@keyframes frFlame { 0%,100%{box-shadow:0 0 12px rgba(255,180,60,0.35);} 50%{box-shadow:0 0 22px rgba(255,210,110,0.65);} }

.fr-wrap {
    position:relative;
    border-radius:7px;
    isolation:isolate;
}

/* ===== S — ■■의 ■■■ ===== */
@keyframes frSRing { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
@keyframes frSSweep { 0%{transform:translateX(-140%) skewX(-22deg);} 55%,100%{transform:translateX(240%) skewX(-22deg);} }
@keyframes frSPulse { 0%,100%{box-shadow:0 0 18px rgba(212,175,55,0.35), inset 0 0 22px rgba(0,0,0,0.85);} 50%{box-shadow:0 0 34px rgba(212,175,55,0.70), 0 0 60px rgba(180,40,80,0.30), inset 0 0 26px rgba(0,0,0,0.9);} }

.fr-s01 {
    position:relative;
    border:2px solid rgba(212,175,55,0.75) !important;
    border-radius:7px;
    background-color:#0a0a08;
    animation:frSPulse 3.8s ease-in-out infinite;
    overflow:hidden;
    isolation:isolate;
}
.fr-s01::before {
    content:''; position:absolute; inset:-60%;
    background:conic-gradient(from 0deg,
        transparent 0deg, rgba(212,175,55,0.55) 28deg, transparent 56deg,
        transparent 150deg, rgba(180,40,80,0.45) 178deg, transparent 206deg,
        transparent 290deg, rgba(212,175,55,0.35) 318deg, transparent 346deg);
    animation:frSRing 6.5s linear infinite;
    pointer-events:none; z-index:0;
}
.fr-s01::after {
    content:''; position:absolute; top:0; bottom:0; width:38%;
    background:linear-gradient(90deg, transparent, rgba(255,240,190,0.30), transparent);
    animation:frSSweep 4.6s ease-in-out infinite;
    pointer-events:none; z-index:1;
}
.fr-s01 > * { position:relative; z-index:2; }
`;
    // 벽지(skin.js)가 background·border-color 를 !important 로 덮어쓴다.
    // 같은 !important 끼리는 명시도가 먼저이므로, 벽지보다 높은 명시도로 깐다.
    const FR_SCOPE = [
        '',
        'html body ',
        'body[data-ui-skin] #app-container ',
        'body[data-ui-skin] .modal-overlay ',
        'body[data-ui-skin] #custom-alert-overlay ',
        'body[data-ui-skin] #luxury-alert-overlay ',
        'body[data-ui-skin] #vip-invite-overlay ',
        'body[data-ui-skin] #fox-nameplate-overlay '
    ];
    function frBang(decl) {
        return decl.split(';').map(s => s.trim()).filter(Boolean)
            .map(d => /!important/.test(d) ? d : d + ' !important').join('; ') + ';';
    }
    FRAMES.forEach(function (f) {
        if (!f.c) return;
        const sel = FR_SCOPE.map(p => `${p}.fr-${f.id}.fr-wrap`).join(',\n');
        css += `${sel} { ${frBang(f.c)} border-radius:7px !important; }\n`;
    });
    // S등급은 자체 규칙을 쓰므로 명시도만 올려 준다
    css += FR_SCOPE.map(p => `${p}.fr-s01.fr-wrap`).join(',\n') +
        ` { border:2px solid rgba(212,175,55,0.75) !important; background-color:#0a0a08 !important; }\n`;
    const st = document.createElement('style');
    st.id = 'frame-css';
    st.textContent = css;
    document.head.appendChild(st);
})();

// ==========================================
// 소지 관리
// ==========================================
function frBag() {
    if (!currentUser) return { owned: {} };
    if (!currentUser.frames) currentUser.frames = { owned: {}, badge: '', list: '', hist: '' };
    if (!currentUser.frames.owned) currentUser.frames.owned = {};
    return currentUser.frames;
}
function frOwned(id) { return (frBag().owned || {})[id] > 0; }
function frById(id) { return FRAMES.find(f => f.id === id); }

function frDraw() {
    let total = 0;
    FRAMES.forEach(f => { total += FRAME_WEIGHT[f.g] / FRAMES.filter(x => x.g === f.g).length; });
    let r = Math.random() * total;
    for (let i = 0; i < FRAMES.length; i++) {
        const w = FRAME_WEIGHT[FRAMES[i].g] / FRAMES.filter(x => x.g === FRAMES[i].g).length;
        r -= w;
        if (r <= 0) return FRAMES[i];
    }
    return FRAMES[0];
}

// ==========================================
// 견본첩
// ==========================================
ITEM_CATALOG['테두리 견본첩'] = {
    price: 1200, usable: true, targetable: false, effect: 'frame_book',
    desc: '사원증에 두를 테두리가 한 장 들어 있다. 무엇이 나올지는 열어야 안다.'
};
if (typeof NO_SELL_ITEMS !== 'undefined') NO_SELL_ITEMS.push('테두리 견본첩');

function frameBookLeft() {
    if (!currentUser) return 0;
    const key = getShopCycleKey();
    if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
    if (!currentUser.purchaseRecord[key]) currentUser.purchaseRecord[key] = {};
    return Math.max(0, 5 - (currentUser.purchaseRecord[key]['frame_book'] || 0));
}

function buyFrameBook() {
    if (!buyGuard()) return;
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 상점을 이용할 수 없습니다.'); return; }
    if (frameBookLeft() <= 0) { showCustomAlert('금일 구매 한도를 모두 사용했습니다.'); return; }
    const price = ITEM_CATALOG['테두리 견본첩'].price;
    if (currentUser.points < price) { showLuxuryAlert(); return; }

    const key = getShopCycleKey();
    currentUser.purchaseRecord[key]['frame_book'] = (currentUser.purchaseRecord[key]['frame_book'] || 0) + 1;
    currentUser.points -= price;
    currentUser.inventory.push('테두리 견본첩');
    addHistoryLog(currentUser, `[상점 구매] 테두리 견본첩 (-${price} P)`);
    saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
    updateUI();
}

// 유쾌 판매소 상단 고정
(function pinShop() {
    if (typeof renderRegularShop !== 'function') return;
    const _r = renderRegularShop;
    renderRegularShop = function () {
        const r = _r.apply(this, arguments);
        const box = document.getElementById('regular-shop-items-container');
        if (!box) return r;
        const left = frameBookLeft();
        box.insertAdjacentHTML('afterbegin', `
            <div style="background:linear-gradient(145deg,#1d1730,#120e1f); border:1px solid #6a4c93; border-radius:7px; padding:12px; margin-bottom:12px;">
                <div style="font-size:10px; color:#c9a8ff; letter-spacing:1px; margin-bottom:5px;">[상시 비치]</div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:14px; color:#fff; font-weight:bold;">📕 테두리 견본첩</div>
                        <div style="font-size:10px; color:#aaa; margin-top:5px; line-height:1.6;">
                            사원증에 두를 테두리가 한 장 들어 있다.<br>
                            <span style="color:#888;">금일 잔여 <b style="color:${left ? '#4CAF50' : '#f44336'}">${left}</b> / 5개</span>
                        </div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:9px 13px; font-size:12px; flex-shrink:0;" onclick="buyFrameBook()" ${left ? '' : 'disabled'}>
                        ${left ? '1,200 P' : '품절'}
                    </button>
                </div>
            </div>`);
        return r;
    };
})();

// ==========================================
// 개봉
// ==========================================
(function hookOpen() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        if (!ITEM_CATALOG[itemName] || ITEM_CATALOG[itemName].effect !== 'frame_book')
            return _use.apply(this, arguments);
        if (!buyGuard()) return;

        const f = frDraw();
        const bag = frBag();
        const dup = frOwned(f.id);
        removeItemFromInventory(currentUser, '테두리 견본첩', 1);

        let msg;
        if (dup) {
            const back = FRAME_REFUND[f.g];
            currentUser.points += back;
            bag.owned[f.id] = (bag.owned[f.id] || 0) + 1;
            addHistoryLog(currentUser, `[견본첩] ${f.n} (중복 · +${back} P)`);
            msg = `${f.g}등급 — ${f.n}\n\n이미 가지고 있던 것입니다.\n${back} P로 돌려받았습니다.`;
        } else {
            bag.owned[f.id] = 1;
            addHistoryLog(currentUser, `[견본첩] ${f.g}등급 '${f.n}' 획득`);
            msg = `${f.g}등급 — ${f.n}\n\n새로 얻었습니다.`;
        }

        saveSelfFull();
        updateUI();
        if (dup) showPointGainEffect(FRAME_REFUND[f.g]);
        showCustomAlert(msg);
        setTimeout(function () { if (!dup) openFramePanel(); }, 400);
    };
})();

// ==========================================
// 관리 화면
// ==========================================
function openFramePanel() {
    const bag = frBag();
    const owned = FRAMES.filter(f => frOwned(f.id));
    const total = FRAMES.length;

    const slotRow = (key, label) => {
        const cur = bag[key] ? frById(bag[key]) : null;
        return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:5px; padding:9px 11px; margin-bottom:6px;">
            <span style="font-size:11px; color:#aaa;">${label}</span>
            <span style="font-size:11px; color:${cur ? FRAME_COLOR[cur.g] : '#666'}; font-weight:bold;">${cur ? cur.g + ' · ' + cur.n : '없음'}</span>
        </div>`;
    };

    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">
            보유 <b style="color:#c9a8ff;">${owned.length}</b> / ${total}종<br>
            테두리를 고르고 어디에 쓸지 지정하세요.
        </div>
        ${slotRow('badge', '사원증')}
        ${slotRow('list', '열람 카드')}
        ${slotRow('hist', '기록')}
        <div style="display:flex; gap:5px; margin:9px 0 13px 0;">
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('badge','')">사원증 해제</button>
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('list','')">열람 해제</button>
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('hist','')">기록 해제</button>
        </div>
        <div style="max-height:46vh; overflow-y:auto; padding-right:4px;">
        ${['L','S','A','B','C','D'].map(g => {
            const list = FRAMES.filter(f => f.g === g);
            const have = list.filter(f => frOwned(f.id));
            return `
            <div style="font-size:11px; color:${FRAME_COLOR[g]}; font-weight:bold; margin:11px 0 6px 0; border-bottom:1px solid #333; padding-bottom:4px;">
                ${g}등급 <span style="color:#888; font-weight:normal;">${have.length} / ${list.length}</span>
            </div>` +
            list.map(f => {
                const own = frOwned(f.id);
                if (!own) return `<div style="border:1px dashed #333; border-radius:6px; padding:9px 11px; margin-bottom:6px; font-size:11px; color:#555;">??? <span style="font-size:10px;">미획득</span></div>`;
                return `
                <div style="border:1px solid #3a3a3a; border-radius:6px; padding:9px 11px; margin-bottom:6px;">
                    <div style="display:flex; align-items:center; gap:9px; margin-bottom:7px;">
                        <div class="fr-wrap fr-${f.id}" style="width:34px; height:34px; flex-shrink:0;"></div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; color:#fff; font-weight:bold;">${f.n}</div>
                            <div style="font-size:10px; color:${FRAME_COLOR[f.g]};">${f.g}등급</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('badge','${f.id}')">사원증</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('list','${f.id}')">열람</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('hist','${f.id}')">기록</button>
                    </div>
                </div>`;
            }).join('');
        }).join('')}
        </div>`;

    openGearModal('테두리', html);
}

function frSet(slot, id) {
    const bag = frBag();
    if (id && !frOwned(id)) { showCustomAlert('아직 얻지 못한 테두리입니다.'); return; }
    bag[slot] = id;
    saveSelfFull();
    updateUI();
    openFramePanel();
}

// ==========================================
// 적용
// ==========================================
function frOf(user, slot) {
    if (!user || !user.frames) return '';
    return user.frames[slot] || '';
}
function frApply(el, id) {
    if (!el) return;
    // 이미 같은 상태면 건드리지 않는다.
    // 클래스를 지웠다 붙이면 애니메이션이 처음부터 다시 돌아 깜빡인다.
    const cur = Array.from(el.classList).find(c => /^fr-/.test(c) && c !== 'fr-wrap') || '';
    const want = id ? 'fr-' + id : '';
    if (cur === want && el.classList.contains('fr-wrap') === !!id) return;

    Array.from(el.classList).forEach(c => { if (/^fr-/.test(c)) el.classList.remove(c); });
    el.classList.remove('fr-wrap');
    if (!id) return;
    el.classList.add('fr-wrap', 'fr-' + id);
}

let _frTick = null;
function frRefresh() {
    if (!currentUser) return;
    frApply(document.getElementById('badge-photo-display'), frOf(currentUser, 'badge'));
    document.querySelectorAll('#history-list-container .history-item')
        .forEach(el => frApply(el, frOf(currentUser, 'hist')));
    document.querySelectorAll('#employee-cards-container .emp-list-card').forEach(function (el) {
        const m = (el.getAttribute('onclick') || '').match(/'([^']+)'/);
        if (!m) return;
        const u = db.users[m[1]];
        frApply(el, frOf(u, 'list'));
    });
}

['updateUI', 'renderHistory', 'renderEmployeeCards', 'renderBadgePhoto'].forEach(function (n) {
    if (typeof window[n] !== 'function') return;
    const _f = window[n];
    window[n] = function () {
        const r = _f.apply(this, arguments);
        clearTimeout(_frTick);
        _frTick = setTimeout(frRefresh, 40);   // 연속 호출은 한 번으로 묶는다
        return r;
    };
});

// 사원증 탭에 버튼
(function addBtn() {
    function put() {
        const panel = document.getElementById('rec-badge');
        if (!panel || document.getElementById('frame-open-btn')) return;
        const save = panel.querySelector('button[onclick*="saveBadgeInfo"]');
        if (!save) return;
        save.insertAdjacentHTML('afterend',
            `<button id="frame-open-btn" class="game-btn" style="width:100%; margin-top:8px; padding:10px; background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;" onclick="openFramePanel()">🖼 테두리 관리</button>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
})();

console.log('[테두리] 40종 등록 완료');
;

// ---------- frames-video.js ----------
// ==========================================
// ★ 영상 테두리 — L등급 「뇌명」
// index.html 에서 frames.js 다음에 불러온다
// ==========================================
//
// 영상을 이 파일 안에 글자로 심었다. 따로 올릴 영상 파일이 없다.
//
// 영상을 통째로 늘리지 않는다.
// 네 변에서 번개 띠만 잘라 내어 칸 네 변에 같은 두께로 그린다.
// 그래서 칸이 가로로 길든 세로로 길든 띠 두께가 일정하다.
//
// 영상은 하나만 받아서 모든 칸이 나눠 쓴다. 칸마다 캔버스만 하나씩 붙는다.

const LIGHTNING_SRC = 'data:video/mp4;base64,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';

const VIDEO_FRAMES = [
    {
        id: 'v01', g: 'L', n: '뇌명',
        ring: 13,          // 띠 두께 (px)
        bandX: 0.17,       // 영상에서 좌우 번개가 차지하는 비율
        bandY: 0.22,    
        padL: 0.018, padR: 0.023, padT: 0, padB: 0,   // 원본 검은 여백   // 영상에서 위아래 번개가 차지하는 비율
        cutX: 0.20, cutY: 0.26,   // 원본 모서리를 버리는 비율
        opacity: 1,
        bg: '#02080e',
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card']
    }
];

(function addVideoFrames() {
    if (typeof FRAMES === 'undefined') {
        console.warn('[영상테두리] frames.js 가 먼저 올라와야 합니다.');
        return;
    }

    // --- 표에 넣는다 ---
    const have = new Set(FRAMES.map(f => f.id));
    let added = 0;
    VIDEO_FRAMES.forEach(function (f) {
        if (have.has(f.id)) return;
        FRAMES.push({ id: f.id, g: f.g, n: f.n, c: '' });
        added++;
    });

    // --- 영상은 하나만 받아서 모두가 나눠 쓴다 ---
    const vid = document.createElement('video');
    vid.src = LIGHTNING_SRC;
    vid.loop = true; vid.muted = true; vid.defaultMuted = true;
    vid.autoplay = true; vid.playsInline = true; vid.preload = 'auto';
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.style.cssText = 'position:fixed; left:-9999px; top:0; width:2px; height:2px; opacity:0.01; pointer-events:none;';
    document.body.appendChild(vid);
    vid.play().catch(function () { });

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) vid.play().catch(function () { });
    });
    // 자동 재생이 막히면 첫 손짓에 튼다
    ['click', 'touchstart', 'keydown'].forEach(function (ev) {
        document.addEventListener(ev, function once() {
            vid.play().catch(function () { });
            document.removeEventListener(ev, once);
        }, { once: true });
    });

    // --- 바탕 규칙 ---
    const SCOPE = [
        '', 'html body ',
        'body[data-ui-skin] #app-container ',
        'body[data-ui-skin] .modal-overlay ',
        'body[data-ui-skin] #custom-alert-overlay ',
        'body[data-ui-skin] #luxury-alert-overlay ',
        'body[data-ui-skin] #vip-invite-overlay ',
        'body[data-ui-skin] #fox-nameplate-overlay '
    ];

    let css = `
.fv-canvas {
    position: absolute !important;
    pointer-events: none !important;
    mix-blend-mode: screen !important;
    z-index: 3 !important;
    border-radius: 7px;
}
`;
    VIDEO_FRAMES.forEach(function (f) {
        const sel = SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap').join(',\n');
        css += `
${sel} {
    position: relative !important;
        border: none !important;
    border-radius: 7px !important;
        overflow: hidden !important;
}
`;
        css += SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap > *:not(.fv-canvas)').join(',\n')
            + ' { position: relative !important; z-index: 2 !important; }\n';
                     const t0 = Math.round(f.ring * 0.5), t1 = f.ring;
        const ringMask = `
        linear-gradient(to right, #000 0 ${t0}px, rgba(0,0,0,0) ${t1}px, rgba(0,0,0,0) calc(100% - ${t1}px), #000 calc(100% - ${t0}px) 100%),
        linear-gradient(to bottom, #000 0 ${t0}px, rgba(0,0,0,0) ${t1}px, rgba(0,0,0,0) calc(100% - ${t1}px), #000 calc(100% - ${t0}px) 100%)`;
        css += SCOPE.map(p => p + '.fr-' + f.id + '.fr-wrap .fv-canvas').join(',\n')
            + ` {
    inset: 0 !important;
    opacity: ${f.opacity} !important;
    -webkit-mask-image: ${ringMask};
    -webkit-mask-composite: source-over;
    mask-image: ${ringMask};
    mask-composite: add;
}\n`;

                    css += `
#employee-cards-container .emp-list-card.fr-${f.id}.fr-wrap,
#history-list-container .history-item.fr-${f.id}.fr-wrap,
#badge-photo-display.fr-${f.id}.fr-wrap,
#emp-detail-card-container.fr-${f.id}.fr-wrap,
html body .fr-${f.id}.fr-wrap {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
}
`;
    });

    const st = document.createElement('style');
    st.id = 'frame-video-css';
    st.textContent = css;
    document.head.appendChild(st);

    // --- 캔버스 달기 ---
    const live = [];   // { el, cv, ctx, f }

    function scan() {
        VIDEO_FRAMES.forEach(function (f) {
            document.querySelectorAll('.fr-' + f.id + '.fr-wrap').forEach(function (el) {
                const ok = f.where.some(function (s) { return el.matches(s) || el.closest(s); });
                if (!ok) return;
                if (el.querySelector(':scope > .fv-canvas')) return;
                const cv = document.createElement('canvas');
                cv.className = 'fv-canvas';
                el.appendChild(cv);
                live.push({ el: el, cv: cv, ctx: cv.getContext('2d'), f: f });
            });
        });
        // 떨어져 나간 것 치우기
        for (let i = live.length - 1; i >= 0; i--) {
            const L = live[i];
            if (!L.el.isConnected || !L.el.classList.contains('fr-' + L.f.id)) {
                L.cv.remove();
                live.splice(i, 1);
            }
        }
    }
    setInterval(scan, 1200);
    setTimeout(scan, 600);

    // --- 그리기 ---
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let last = 0;

    function paint(now) {
        requestAnimationFrame(paint);
        if (now - last < 50) return;          // 20fps
        last = now;
        if (vid.readyState < 2) return;
        if (document.hidden) return;

        const vw = vid.videoWidth, vh = vid.videoHeight;
        if (!vw || !vh) return;

        live.forEach(function (L) {
            const r = L.el.getBoundingClientRect();
            // 화면 밖이면 건너뛴다
            if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
            const W = Math.round(r.width), H = Math.round(r.height);
            if (W < 8 || H < 8) return;

            const cv = L.cv, ctx = L.ctx, T = L.f.ring;
            if (cv._w !== W || cv._h !== H) {
                cv.width = Math.round(W * DPR);
                cv.height = Math.round(H * DPR);
                cv.style.width = W + 'px';
                cv.style.height = H + 'px';
                cv._w = W; cv._h = H;
            }

            const bx = Math.max(2, Math.round(vw * L.f.bandX));
            const by = Math.max(2, Math.round(vh * L.f.bandY));
            


            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = 'lighter';

                      const mL = Math.round(vw * (L.f.padL || 0)), mR = Math.round(vw * (L.f.padR || 0));
            const mT = Math.round(vh * (L.f.padT || 0)), mB = Math.round(vh * (L.f.padB || 0));
            const iw = vw - mL - mR, ih = vh - mT - mB;

                        const cx = Math.round(iw * (L.f.cutX || 0)), cy = Math.round(ih * (L.f.cutY || 0));
            const sw = Math.max(4, iw - cx * 2), sh = Math.max(4, ih - cy * 2);

            // 위 · 아래 · 왼쪽 · 오른쪽
            ctx.drawImage(vid, mL + cx, mT, sw, by, 0, 0, W, T);
            ctx.drawImage(vid, mL + cx, vh - mB - by, sw, by, 0, H - T, W, T);
            ctx.drawImage(vid, mL, mT + cy, bx, sh, 0, 0, T, H);
            ctx.drawImage(vid, vw - mR - bx, mT + cy, bx, sh, W - T, 0, T, H);

            ctx.globalCompositeOperation = 'source-over';
        });
    }
    requestAnimationFrame(paint);

    window._fvVideo = vid;
    window._fvLive = live;
    console.log('[영상테두리] ' + added + '종 추가 — 전체 ' + FRAMES.length + '종'
        + ' · 영상 ' + Math.round(LIGHTNING_SRC.length / 1024) + ' KB (파일 안에 포함)');
})();

// 확인
function videoFrameState() {
    console.log('%c===== 영상 테두리 =====', 'color:#5ac8ff; font-size:13px');
    console.table(VIDEO_FRAMES.map(function (f) {
        return { 번호: f.id, 등급: f.g, 이름: f.n, 띠: f.ring + 'px', 자리: f.where.join(' · ') };
    }));
    const v = window._fvVideo;
    console.log('  영상:', v ? (v.paused ? '멈춤' : '재생 중') + ' · ' + v.videoWidth + '×' + v.videoHeight : '(없음)');
    console.log('  그리는 칸:', (window._fvLive || []).length + '개');
}

// 띠 두께·번개 비율 조절 — 새로고침 없이 바로 반영
function fvTune(o) {
    const f = VIDEO_FRAMES[0];
    Object.assign(f, o || {});
    const st = document.getElementById('frame-video-css');
    if (st) st.textContent = st.textContent.replace(/border: \d+px solid transparent/g, 'border: ' + f.ring + 'px solid transparent')
                                           .replace(/inset: -\d+px/g, 'inset: -' + f.ring + 'px');
    (window._fvLive || []).forEach(function (L) { L.cv._w = -1; });
    console.log('띠 ' + f.ring + 'px · 좌우 ' + f.bandX + ' · 위아래 ' + f.bandY + ' · 진하기 ' + f.opacity);
}
;

// ---------- frames-video2.js ----------
// ==========================================
// ★ 영상 테두리 2 — S등급 「맥광」 · 「화등」
// index.html 에서 frames-video.js 다음에 불러온다
// ==========================================
//
// 영상 두 개를 이 파일 안에 글자로 심었다. 따로 올릴 파일이 없다.
//
// 영상을 통째로 늘리지 않는다.
// 네 변에서 띠만 잘라 내어 칸 네 변에 같은 두께로 그린다.
// 그래서 칸이 가로로 길든 세로로 길든 띠 두께가 일정하다.
//
// 이름·두께·띠 비율은 아래 VIDEO_FRAMES_S 에서 바꾼다.

(function videoFramesS() {

const SRC_NEON = 'data:video/mp4;base64,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uKdW+tf+VoW2GFq3Kz98fBP9rXm6Z52nE/NDD5sNivc8PM7/mJFf5ld519aHuVbW1nXe1tbW1tYnd5kFAyqJvL/8mHRXfEDlKv6ZXme1MtMrmd3nj3/a2tra2tra2tra2siExEKN3i1IpmrX548moKBp6enp6eaP/paRaWlpaWkWlpaWUmLhw3W9/M70tvT08zMhSp6emCGuuuuuurrrrvk54Lhy5VPTEzM2qenp6YJ6lrrrrrq66665OZgs6p6enme9PTDtMXUtdddddXXXXXfTBURdPMxJe9OdlPT09MN1PXXXXXV111zdpveVgmKuR6bp6enp6YdqeuuuuurrrrrpjlTzP/T0ww2nmYZT6npi6uuuuuurrrrrrmYW9T08zNvT0z0xNM9T111111ddddLfT09PT09PT09ddddddddddf/D/h8Ek35dP/wRIn5OphWmEkJMzGnphWumEalrrrrrq6665o5aqOUzMOUvTG0xzpmbM+pWFa6Y+p666666uuuuuaGtU9PT09PTLXT1CtdddddXXXXNHBetfw8lUnOEAp1rAxyon09odkC8EP+mnp5nvMx2qemCGunrqepa6665vVYu4WUTrfbU3X6+OFGkyv69bvr+f0w+Gz79Ow/eZsnqnp4p/Vr9PNH/11zPqrq6Z65tanhQP5KiaW8TQnl4klb/08s7EEE1N683GvE/J5naeJ3/M+qenp6Y+aP9XT1zfq66+VKm8MzE4cBBUDuSvozD943Ev9Ob5jdf/UtZcqS9qrqVY2stt/1H3/6M10ZsWJT39/9/+gsQt+ajO8fvu//0LBu86/F3IScmct4ygUP//XRxj+jrNnki/+uuQ73tuXq61Mop6enp6YTpjaRaeuunrriIcLpadMIFUVOpu8SSfTu//SxwiK1XrBRSz5D95LvN/3FZsC5Vb8E7SHua7MvSB/bo73f/yRIbjU7bh2yRkKtuLfnvxC0G/p/p4WaOoe973ve9/rWnp6YRpianp666675FtBZS/8i+knYdGVm6gY5DI+QPipAIPfk/8ifJ3N69aiePngv/v7kR1q0v/kOV/39xgzISS47U0Xp6enphenm71c36upa65/18uIc0zWtOvBYCKem/N/Otlv+kxWpaGvayyt5Kuv0h9gk7+p6bpx+ienphGZu9RtdPS11111yLEoNF9LMQUPoGmdCT09PM9PTE09PTDdS109dc36uub9XK9Ph6/XTBcCQTyJLCiJIA/be8zagrU9PT09PTDtdLV10tdLS1yczHBvxrywbJnk7kiK9Drhs8MdUQy3I2tdeCzE6+qaf/a/2C8QZjpz9F17/FOTgrq1/+dPtRgj13pmdPTC9PTFzdqum6666666jDf6EieB7DS6zdRZLjffr7ouyrrXcQL1/+SZ7vlXmzRU4/c3fT//7BIK12meymdtPTyMXTLTE110y1111111isSRP6YgIn43M7E9MSqbhJmYnv97/lT0wnTdEPSLSdddddddddPTzMOZ6em6IZ09PT10wS111111111yvgW4NImuWwgCDU2Q375NDL9UNoD5/0/P2ivsERNfFdPT09O6YVpnm710xdddddddddPosBqac03D0mbsmt+J/4Ol+31e+dmw5KHNnnn4RAyqS9jjfj50OO7olZVK9bpkP08jCNMtMfXTddddddddczDDtMwo/pnL6lYRU27zMQdd5nvTCNPTCddN111111111Dj/D/TYRpv/RUtOw7TqEaXQ9T5P/OrLzP+msvZh/D+wiMT09MI08zH+pHq666666675oW1/P/yBwVu3Gqc0affvbNEQG1DqcUbeCeX2cjcf9iXp8jMUWrcWoJSau9tNZmIn8R3pxLzN7UxtPTCdXXXXXXXXXUJKbTtM91PFP/e/zSn+qJmdi/M61J3LL33333333za1EkGOap5nf9PV/h/SiMcupf6k8U+fXsszieDaRJPpVtbW1tbW1tbW1nXaVEUpP4fLZjYdJ1umP3Bna1/09v7DXfvL+vzO/V/zn/wWa5Zd+/NPNzXWowYFZUh5UjXgsMFnNy+Pz5sBeadF1a2tra2traqddWtqp0KNSp0cJURl9WEz7m/94b8IV4rD7H8qaX3rx5QAh7/pk+ftZrdnI+G/Jv/IUVvxigIX17iWY+noiLflntS1qTDoZqVZ0nIlraxa1p/lW1tbW1tZyHNzryE/+vICIg152ZLobD/k7/6DTrszbKv309vc1/b0kBE73ei6Jps6VyoI1PS2tra2tra2s66tb5/0nEoVvOmXzzqIH+iP2AAAABR0GaOPhQv//RKquYpdKxHyVZJA1OuvR0lWXCnHE+xq+8IRiWD3XydXjzvnfwP6ss7x+AuV7wL61v1nSXjhnZ2A2FhSdXhD0LZi94SX+A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';

const SRC_VINE = 'data:video/mp4;base64,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';

const VIDEO_FRAMES_S = [
    {
        id: 'v02', g: 'S', n: '맥광',
        src: SRC_NEON,
        ring: 14,          // 띠 두께 (px)
        bandX: 0.15,       // 영상에서 좌우 띠가 차지하는 비율
        bandY: 0.075,      // 영상에서 위아래 띠가 차지하는 비율
        cutX: 0,           // 영상 끝을 잘라 낼 때만 쓴다 (보통 0)
        cutY: 0,
        over: 9,           // 칸 안쪽으로 파고드는 깊이 (px) — 검은 틀을 덮는다
        plate: 'rgba(4,4,9,0.95)',   // 띠 밑에 까는 어두운 판 (밝은 스킨 대비)
        opacity: 1,
        bg: '#05030c',
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card']
    },
    {
        id: 'v03', g: 'S', n: '화등',
        src: SRC_VINE,
        ring: 16,
        bandX: 0.094,
        bandY: 0.055,
        cutX: 0,
        cutY: 0,
        over: 0,
        plate: 'rgba(6,4,9,0.95)',
        opacity: 1,
        bg: '#0a0509',
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card']
    }
];

if (typeof FRAMES === 'undefined') {
    console.warn('[영상테두리2] frames.js 가 먼저 올라와야 합니다.');
    return;
}

// --- 표에 넣는다 ---
const have = new Set(FRAMES.map(function (f) { return f.id; }));
let added = 0;
VIDEO_FRAMES_S.forEach(function (f) {
    if (have.has(f.id)) return;
    FRAMES.push({ id: f.id, g: f.g, n: f.n, c: '' });
    added++;
});

// --- 영상은 종류마다 하나씩만 받아서 모든 칸이 나눠 쓴다 ---
VIDEO_FRAMES_S.forEach(function (f) {
    const vid = document.createElement('video');
    vid.src = f.src;
    vid.loop = true; vid.muted = true; vid.defaultMuted = true;
    vid.autoplay = true; vid.playsInline = true; vid.preload = 'auto';
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.style.cssText = 'position:fixed; left:-9999px; top:0; width:2px; height:2px; opacity:0.01; pointer-events:none;';
    document.body.appendChild(vid);
    vid.play().catch(function () { });
    f._vid = vid;
});

function wakeAll() {
    VIDEO_FRAMES_S.forEach(function (f) { if (f._vid) f._vid.play().catch(function () { }); });
}
document.addEventListener('visibilitychange', function () { if (!document.hidden) wakeAll(); });
['click', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function once() {
        wakeAll();
        document.removeEventListener(ev, once);
    }, { once: true });
});

// --- 바탕 규칙 ---
const SCOPE = [
    '', 'html body ',
    'body[data-ui-skin] #app-container ',
    'body[data-ui-skin] .modal-overlay ',
    'body[data-ui-skin] #custom-alert-overlay ',
    'body[data-ui-skin] #luxury-alert-overlay ',
    'body[data-ui-skin] #vip-invite-overlay ',
    'body[data-ui-skin] #fox-nameplate-overlay '
];

let css = `
.fv2-canvas {
    position: absolute !important;
    pointer-events: none !important;
    mix-blend-mode: normal !important;
    z-index: 3 !important;
    border-radius: 7px;
}
`;
VIDEO_FRAMES_S.forEach(function (f) {
    const sel = SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap'; }).join(',\n');
    css += `
${sel} {
    position: relative !important;
    overflow: visible !important;
    outline: none !important;
    box-shadow: none !important;
}
`;
    css += SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap > *:not(.fv2-canvas)'; }).join(',\n')
        + ' { position: relative !important; z-index: 2 !important; }\n';
    css += SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap .fv2-canvas'; }).join(',\n')
        + ` { opacity: ${f.opacity} !important; }\n`;
});

// 회색 구분선 제거 — 영상 테두리에는 덧선을 그리지 않는다
(function noLine() {
    const ids = ['v01'].concat(VIDEO_FRAMES_S.map(function (f) { return f.id; }));
    const base = [];
    ids.forEach(function (id) {
        [
            '.fr-' + id + '.fr-wrap',
            'html body .fr-' + id + '.fr-wrap',
            'body[data-ui-skin] .fr-' + id + '.fr-wrap',
            '#employee-cards-container .fr-' + id + '.fr-wrap',
            '#emp-detail-card-container .fr-' + id + '.fr-wrap',
            '#history-list-container .fr-' + id + '.fr-wrap'
        ].forEach(function (x) { base.push(x); });
    });
    css += `
${base.join(',\n')} {
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
}
${base.map(function (x) { return x + '::before'; })
   .concat(base.map(function (x) { return x + '::after'; })).join(',\n')} {
    display: none !important;
    content: none !important;
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
}
`;
})();

// 글자가 빛에 묻히지 않게
css += `
#history-list-container .fr-v02.fr-wrap *, #history-list-container .fr-v03.fr-wrap *,
#employee-cards-container .fr-v02.fr-wrap *, #employee-cards-container .fr-v03.fr-wrap * {
    text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 7px rgba(0,0,0,0.85) !important;
}
`;

const st = document.createElement('style');
st.id = 'frame-video-css-2';
st.textContent = css;
document.head.appendChild(st);

// ==========================================
// 영상 테두리를 두른 칸만 속을 비운다
// ==========================================
const cardSt = document.createElement('style');
cardSt.id = 'frame-video-card-2';
document.head.appendChild(cardSt);

window.fvCardBg = function (a) {
    a = (a == null) ? 0.15 : a;
    const ids = ['v01'].concat(VIDEO_FRAMES_S.map(function (f) { return f.id; }));
    const sel = [];
    ids.forEach(function (id) {
        [
            '#employee-cards-container .fr-' + id + '.fr-wrap',
            'html body #employee-cards-container .fr-' + id + '.fr-wrap',
            'body[data-ui-skin] #employee-cards-container .fr-' + id + '.fr-wrap',
            'html body[data-ui-skin] #employee-cards-container .emp-list-card.fr-' + id + '.fr-wrap',
            '#emp-detail-card-container .fr-' + id + '.fr-wrap',
            'html body[data-ui-skin] #emp-detail-card-container .fr-' + id + '.fr-wrap'
        ].forEach(function (x) { sel.push(x); });
    });
    cardSt.textContent = sel.join(',\n') + ` {
    background-color: rgba(8,8,11,${a}) !important;
    background-image: none !important;
}`;
    console.log('영상 테두리 칸 속 진하기 ' + a);
};
fvCardBg(0.15);

// --- 캔버스 달기 ---
const live = [];   // { el, cv, ctx, f }

function scan() {
    VIDEO_FRAMES_S.forEach(function (f) {
        document.querySelectorAll('.fr-' + f.id + '.fr-wrap').forEach(function (el) {
            const ok = f.where.some(function (s) { return el.matches(s) || el.closest(s); });
            if (!ok) return;
            if (el.querySelector(':scope > .fv2-canvas')) return;
            const cv = document.createElement('canvas');
            cv.className = 'fv2-canvas';
            el.appendChild(cv);
            live.push({ el: el, cv: cv, ctx: cv.getContext('2d'), f: f });
        });
    });
    for (let i = live.length - 1; i >= 0; i--) {
        const L = live[i];
        if (!L.el.isConnected || !L.el.classList.contains('fr-' + L.f.id)) {
            L.cv.remove();
            live.splice(i, 1);
        }
    }
}
setInterval(scan, 1200);
setTimeout(scan, 600);

// --- 그리기 ---
const DPR = Math.min(window.devicePixelRatio || 1, 2);
let last = 0;

function paint(now) {
    requestAnimationFrame(paint);
    if (now - last < 50) return;          // 20fps
    last = now;
    if (document.hidden) return;

    live.forEach(function (L) {
        const vid = L.f._vid;
        if (!vid || vid.readyState < 2) return;
        const vw = vid.videoWidth, vh = vid.videoHeight;
        if (!vw || !vh) return;

        const r = L.el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
        const W = Math.round(r.width), H = Math.round(r.height);
        if (W < 8 || H < 8) return;

        const cv = L.cv, ctx = L.ctx, T = L.f.ring;

        // 칸을 감싼다 — over 만큼은 칸 안쪽까지 파고든다
        const bw = parseFloat(getComputedStyle(L.el).borderTopWidth) || 0;
        const OV = Math.max(0, Math.min(T, Math.round(L.f.over || 0)));
        const OUT = T - OV;
        const CW = W + OUT * 2, CH = H + OUT * 2;
        if (cv._w !== CW || cv._h !== CH || cv._ov !== OV) {
            cv.width = Math.round(CW * DPR);
            cv.height = Math.round(CH * DPR);
            cv.style.width = CW + 'px';
            cv.style.height = CH + 'px';
            cv.style.left = -(bw + OUT) + 'px';
            cv.style.top = -(bw + OUT) + 'px';
            cv.style.right = 'auto';
            cv.style.bottom = 'auto';
            cv._w = CW; cv._h = CH; cv._ov = OV;
        }

        const bx = Math.max(2, Math.round(vw * L.f.bandX));
        const by = Math.max(2, Math.round(vh * L.f.bandY));

        const cx = Math.round(vw * (L.f.cutX || 0));
        const cy = Math.round(vh * (L.f.cutY || 0));
        const sw = Math.max(4, vw - cx * 2);
        const sh = Math.max(4, vh - cy * 2);

        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, CW, CH);
        ctx.globalCompositeOperation = 'lighter';

        // 액자처럼 모서리를 45도로 맞물린다 —
        // 네 변이 영상의 네 변을 통째로 받으므로 빛이 끊기지 않고,
        // 서로 겹치지 않으므로 이음새도 생기지 않는다.
        const plate = L.f.plate || 'rgba(4,4,9,0.95)';
        const edge = function (sx, sy, sW, sH, dx, dy, dW, dH, pts) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < pts.length; i++) {
                if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
                else ctx.lineTo(pts[i][0], pts[i][1]);
            }
            ctx.closePath();
            ctx.clip();
            // 밝은 스킨에서도 빛이 묻히지 않도록 어두운 판을 먼저 깐다
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = plate;
            ctx.fill();
            ctx.globalCompositeOperation = 'lighter';
            ctx.drawImage(vid, sx, sy, sW, sH, dx, dy, dW, dH);
            ctx.restore();
        };

        edge(cx, 0, sw, by, 0, 0, CW, T,
             [[0, 0], [CW, 0], [CW - T, T], [T, T]]);                       // 위
        edge(cx, vh - by, sw, by, 0, CH - T, CW, T,
             [[0, CH], [CW, CH], [CW - T, CH - T], [T, CH - T]]);           // 아래
        edge(0, cy, bx, sh, 0, 0, T, CH,
             [[0, 0], [T, T], [T, CH - T], [0, CH]]);                       // 왼쪽
        edge(vw - bx, cy, bx, sh, CW - T, 0, T, CH,
             [[CW, 0], [CW - T, T], [CW - T, CH - T], [CW, CH]]);           // 오른쪽

        ctx.globalCompositeOperation = 'source-over';
    });
}
requestAnimationFrame(paint);

window._fv2Frames = VIDEO_FRAMES_S;
window._fv2Live = live;

// 확인
window.videoFrameState2 = function () {
    console.log('%c===== 영상 테두리 (S) =====', 'color:#c9a8ff; font-size:13px');
    console.table(VIDEO_FRAMES_S.map(function (f) {
        return {
            번호: f.id, 등급: f.g, 이름: f.n, 띠: f.ring + 'px',
            좌우: f.bandX, 위아래: f.bandY, 모서리자름: (f.cutX || 0) + ' / ' + (f.cutY || 0), 겹침: (f.over || 0) + 'px',
            영상: f._vid ? (f._vid.paused ? '멈춤' : '재생 중') + ' ' + f._vid.videoWidth + '×' + f._vid.videoHeight : '(없음)',
            크기: Math.round(f.src.length / 1024) + ' KB'
        };
    }));
    console.log('  그리는 칸:', live.length + '개');
    console.log('  전체 테두리:', FRAMES.length + '종');
};

// 두께·띠 비율 조절 — 새로고침 없이 바로 반영
window.fvTune2 = function (id, o) {
    const f = VIDEO_FRAMES_S.find(function (x) { return x.id === id || x.n === id; });
    if (!f) { console.warn('v02 / v03 또는 이름을 넣으세요.'); return; }
    Object.assign(f, o || {});
    live.forEach(function (L) { L.cv._w = -1; });
    console.log(f.n + ' — 띠 ' + f.ring + 'px · 좌우 ' + f.bandX + ' · 위아래 ' + f.bandY + ' · 진하기 ' + f.opacity);
};

console.log('[영상테두리2] ' + added + '종 추가 (S) — videoFrameState2() 로 확인');

})();
;
