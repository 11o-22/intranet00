// ==========================================
// 묶음 02.js — 13개
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
            if (currentUser.equippedWeapons.length >= 12) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
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
            if (targetUser.equippedWeapons.length >= 12) { showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false; }
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
            if (currentUser.equippedWeapons.length >= 12) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
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
                if (targetUser.equippedWeapons.length >= 12) {
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
                if (targetUser.equippedWeapons.length >= 12) {
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
    return Math.max(0, 10 - (currentUser.purchaseRecord[key]['frame_book'] || 0));
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
                            <span style="color:#888;">금일 잔여 <b style="color:${left ? '#4CAF50' : '#f44336'}">${left}</b> / 10개</span>
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

const LIGHTNING_SRC = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAZjbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAE4gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAABY10cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAE4gAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAZEVQADiAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAABOIAAAIAAABAAAAAAUFbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAA4AAABGABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAAEsG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAABHBzdGJsAAAAyHN0c2QAAAAAAAAAAQAAALhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAZAA4gBIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAAPmF2Y0MBZAAW/+EAIGdkABascgRBkf+I/8EVwRUEAAADAAQAAAMAcDxYthGAAQAHaOhDhEsiwP34+AAAAAAQcGFzcAAAxjEAAMWoAAAAFGJ0cnQAAAAAAAGe2QABntkAAAAYc3R0cwAAAAAAAAABAAAARgAABAAAAAAUc3RzcwAAAAAAAAABAAAAAQAAAhhjdHRzAAAAAAAAAEEAAAABAAAIAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAGAAAAAABAAAIAAAAAAEAAAAAAAAAAgAABAAAAAABAAAcAAAAAAEAAAwAAAAAAgAAAAAAAAACAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAUAAAAAAEAAAgAAAAAAQAAAAAAAAABAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAUAAAAAAEAAAgAAAAAAQAAAAAAAAABAAAEAAAAAAEAABgAAAAAAQAACAAAAAABAAAAAAAAAAIAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAYAAAAAAEAAAgAAAAAAQAAAAAAAAACAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAAQAAFAAAAAABAAAIAAAAAAEAAAAAAAAAAQAABAAAAAABAAAUAAAAAAEAAAgAAAAAAQAAAAAAAAABAAAEAAAAAAEAABQAAAAAAQAACAAAAAABAAAAAAAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAABGAAAAAQAAASxzdHN6AAAAAAAAAAAAAABGAAAOWwAACA4AAATbAAAB/gAAAWgAAAe4AAAFBQAAAS4AAAIkAAAB/QAAB90AAAYRAAAByQAAAdQAAAGpAAAB/wAAB10AAAPZAAABEQAAAW0AAAc7AAAEPgAAATkAAAF7AAAHRQAAA+4AAAEbAAABOgAAB3wAAASWAAABUAAAATUAAAdUAAAEdwAAAVwAAAESAAAHtwAABHYAAAHCAAABPgAAB88AAAVsAAABIQAAAaQAAAHqAAAHRAAABDYAAAF5AAABRQAAB+IAAAVbAAABPAAAAYAAAAGNAAAHdQAABGUAAAEaAAABUgAABzgAAARMAAABEQAAAS0AAAcsAAAEQAAAAQwAAAFUAAAFvgAABGIAAAD3AAABZgAAABRzdGNvAAAAAAAAAAEAAAaTAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY2MC4xNi4xMDAAAAAIZnJlZQABA1BtZGF0AAACsAYF//+s3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTE2IGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMzMgbWU9dW1oIHN1Ym1lPTEwIHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MjQgY2hyb21hX21lPTEgdHJlbGxpcz0yIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MyBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTggYl9weXJhbWlkPTIgYl9hZGFwdD0yIGJfYmlhcz0wIGRpcmVjdD0zIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MTQgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD02MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTMwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAujZYiBAB///Tke/kYwXSxRmRuCPOjqgwXV4bnUwCRuMGhF5XRi0SM1CV9gJL6K+2fKmp5ZahE9TJLcSU/ZbodtM7bjHfBy+ElJ2/PcNSzqrL9aSa9USvHZD/yz69vzoWg7+rBgh0In4H9SETzpdVvNrBlqA/qJEc0ZbnIrsVCgnE9UhW3Atc4Hnkc/dLMYcuFV//Sa5pTnCT00Um6EKfTXbR7uJbtiMaKVH+Hw1OUNdvRynK+IFSZqPtP1UtIwctnxCdzhlXILvAtw4CWiCA3AGYJvC3HhX62WMwZNS9c15mBR7Budh6tWDyET0Fxg26AhUD7rkvUOdq5rjzTOVV+HFSS4ohHxHO9/MCe2tlynm5d9s3ZY981P6cVqloVQly67vVA7L4VFu4EfIx5UzA6gMAhVeE5A3wDsWF0bC2b35lJrVx/icyFrrM7mnEXEF36F42AGYNrwaSAn0NARzfqwe2obIlqeY+iISMLK5ILzh0chDADjwgs3CLi+DCcSm9QajDfw0ytsOD0a5u+aQVAz+qo7kzfwcuhu6b4jJLjomzZaeGAh6p4KkMHMEyNx+EtvgP4LhiaklEvpIGRl3sHR7kfTXXonJ7xweTtCJJ8AqxcJtdjkyzxm7+G62GhZsLzrNOd2uAa5ttuLW40FzHyt4GjJ4dyHqx0bIah5ZMPO6CJuzNFhOhdmSCIjtwqqjgNebdRHaTSSZX7ivwDNOMkdzLD/eZGcosrloHVxe7uV+KXhpig2cf7KphmSu85j5i3Js8qTPCldP9886jmeCKM3b/9jjJnJgRS0X4nzOCoTBq62XfbvW5NeawT+CwR3ug85BiVmM98pXkd3C54+0HXyGbyvET/A7m9Rm0gUK7L5KOjB/01xBN1v1kukdkF/3hcZKAO/2RkB5USGHxRej2qeXjWBQVkUa//l4iMvWoHIPpqwmbpVjRDy7VR+caBnmy9yz1IO8qRVyQOeBRBcLr2YtdoiMyRDYUCum/NPLeiMpQUZ7FUNcP81Fle9kl7+SWiPdkj9x9xRadbN/GzEKtNPAgDcQYoT5iQjQcLQR1iXJ7PNcCJ48SI1uN2l3AcdZPKngnVT2QVqhRuyjmtqZFMtBdZl9RHrtnJaj85Z2unrJtg6RJ+Ea7LENC6ouWej+Ut6BkhGDWDjc1yrlB9GlkFfo85APl/n9b+7er/4kRGyXaQ/pvu0dmW9rHRrJeAe7UW+dRyid7AcS1ucks3bz1NHz/y4I+wnMMIuiPuXcnk/a+k3Rj03TpJpxOVGo3XCdjd3jrr51zhXeyDOgptIriQ9eBpYmVyWuycLE80YMFCocxILmB4uy2bMvIuslkycgR45ADuZFh42GrWe7Q1OYuTKmDWvHhheo+Fl2jdCr4a0RnhNEpR5D1jvTlUyHHeFagkPccdsu3vE+cTwDnZWRCiBSvZanRfxdhWi6j5Xg12O6+LNl5E5DrtjnBzjGV5/BlsfxZUnhcljAiECh/XwG+SU96b8HQyaET8DaZT12nvAa/a1n3td4WuviuY+lieoilfJ9F7M+lVZUF/Yadq0O2XSryyO0bcAA4UqSyerP1OgmxYYKYWWZbHA7ANx9vCc+2hTa+d3OGzDUA5U7qYASs531QMkwZvkNO3CHLFu4se+MFY2KDEJJS8mbJSuAFr/BaCTH+lgsDWg5fbbRGtqRnVVJWomqqIRi5A8AvmK74Df7vv0ez+CUmPNBHnWvnI/MsnfuPUHxSd9F6YgCPKzcvOCDXSleqKpQ10J/SpqN9i3MSoWY+EAe67Ue968qQDFV9TPY0NEboyHXka/cHRsWxXGHif4wAiG99DsX6XuFUcG85B0z5lMN68WclvlJKHxJz1xZziIUk2yTsBh7j/KgN+8Zd+VHr5qnlSTUFlWD93dKuft8nGYO18nwnBUe/8suVpTSuXQxBwdV3iXZY4/mdWCKCioCeTEJWxPRqUjkxo5KMzusVCk5zmc0TcvOibMpsIywvY1+63yOkfpR6gGbiVMhASF32aypsHVeZ3trg1Ym25c5uYys51ypfAk5LvcZqRngwcuWT5Gkp6RrweKMibTJl2ttPHVucp2X/7pjE5/NPzJ7be0VcZlJaLxC8eiccVct8PlPIjmCExr9kWeorJh9Mqy+RKpVW7IXnyGbe/m3V4vUxygppynBfAkIC6ORu1jgW/S7t9wJeN8GryZSSvLgMF2HuE+URaJIsJLHUJMG0OTQJ8Z+BsN2GkP7I+qNBtkltlRF0jk0wdGVhb9O1Fl2aZru1LHGgaocedJkCEwcdGua6q+LA7sjcTRSHeT5qZwrJeA7HfGnD2JYVMHiWqzCmfUAIhq3ChinDnaQaxdKMLQ7nxwISse9pNgRzMIsAgBXm34uzW/cR1irWKru5y5LedeVIOyXwfercNOWXyrX8NKL0DHJnS/o38+JjaVRSVCWF79iaLspwfKBqxVKzey9dWCsrnll5f833O4cFYDJZmNwuheCDj06aGn35rJuzi5l8L6lrUOw97UsWlgmMB4SPPKJjybf+w+mx3BtiKugxulDYjzB3Ty5ssuUNVVjei/+BlIEnuTLklMhlVinxLDRC6ktvBicUwNXs6mT2mMWTnyY+zibX8Wj9zdbeBSPflwoy01Vwho/goM8dNlz2fkVb8ZfOD8jVPQnFXt/rqHK+ze9B4ylB/DHyKon4SiOZpnB8BRw7oFNogubaC5xtosKLLCemtdUF5N4+qi1VS2BRc8dCZusdQj0enLyeGwZW3whZik8VMingwEouk6txbBjdYXl19gXIh11EHyPnL2Qr2f1xEkRUVkj73anmEh5BMPHOHasZUPvpLsgY+FvL4ip4XzjHhbwKxR3+15VtHYY7RuzeiRAnuhwE3Rp1hnnYqdVa+8QyqwSn6vwMwfAiUID8uIMm8OhNr0BCYC+4fpmsAyh8i6L6u+wwGWFPWnC5pHMzQOv2Q3CH5P8xBijy7Uhz6z5oVRon2GOX9w/PIap12/lNUto3zYG580v6T6Vhsojls6eU3NBGpleNFj3ON10//Yr9AEfqff5xyWozb9rcAOHeBiDLSsPLwwoPKjSP98iMCBTWmDUkctAdPMZUp0B9/SRSGVug2aQeVx4+9sWuw5UPQwF1fw7DO4kIHQEHy39PYFf8Dyp9sOvvT7lL4wADbY1+u2jkT/X6yl3oPln4nK61y4wJLgrsae/pmulW+OvIsS1TIyLOwBnRLCSqzleMMHGWKt6s4an8Q24tzhDuG5OG6PKMwW3ls7uJscQty17behUO7fttNJdJKCkQRiip2Aqi6/Ndpd4rlfNlvlLGxVQJZ+Wkl8R/HT5bJssgs26E8MFqfPqYQj0bCTgfTm+eauJ2FiuD28umgBUaod1YkrczbnvJNXRMVvdaQfx7YMT7WnWMI+5ugKUkBnoewPcX7Lf8NJ4Qk3m6feJbd6eF1oY/zPM6XhFDX2rx13SRv4OzB3UIbCYDF1uEB+Vbd5QEb3gv9zFH3lu0rh3xGe6ymlin6WIQcBNtz4eGM0+HQsKlkoLe1CI6CAoTPYpYOfomh0YIGezUBNRHYuDRSfYrFWvQGWiKmIeh21ZfFE6bf9DHdXXSGy+VFFsxnX+08At/vaJ6JIG/EKNrbfK9Ud+Wy8NxBMsL3Vrk8U8ZEVYwLzeBuUKN3/Kk4HSGysRG01BP3XQAEuk/4+fUTfzcQSP/edL87aBEgAUHDQ793kpbN/0vVEZY6jhb39uBd+g59ZsAl7i4KqWR7yVT5KcSQrNMPNK7+LCWd5cf6z8OVKw8EbiLJ2WP6zu3a9HlBn+lGq1d+6BhPtcxUe/uJ8RlvasKQQmZ5o3FmrvJ+n0WWYJyCZDFVA53TztIxz08p+eLIhhMUMaysbwQnOtzNzb63UTG454/yM7yxNzkuDkHaIOEsT3EL0BxRPHppOs/+utY6Hq3C8LgacZnPBX07qHtI0vL/1c3AdIBS8tLxn7pNkKixVen6RAAAICkGaCI2J/8X1MEX4ptplle7lK7irlFcU1Q6tpKyMUK0j+Wl0/eyYk2wyQGIzzS4A5qaCHKuiP0OM1k6YsdmEnVqABEX6ZQeV03mlz0lThdIygrHo9LK6Ga2AOOwnFwpjwb3/X6VZMYBQZvCaZIAtEz4LFnAbHzDpBgfijcDvBZgUQ5DM3p++EXTNwK2FUlZK9Yifhd4FIlp4/HiyMmfzY/sq+OniVeSJElubAe5vPPdC4YBHVNw5J+VZ9ExQAqjNTICSU+TbJYWXP24a3NmSDe32l4a5u50ADvZc/9NOsvPgVSKuI+1XNCzHtPb+Qa+idmV2wUfhUWkNW7GOvmLAWbYEdEoSA76/JW4+fhZikjZ31wVDooUDKuAfjPEZuyEH8T0jkbq1cal6ZiIprOn9kdhNa1lJIPMLjBbam9/EETNcFAT4nQb8kn5c37jEdPZ0j8JtaMFE/N01SaB+zv1zqrPoYb3zeq+wo4FInNzMjT0emMA4kIsZgKSZnvquQnpB4tRk1El/VC+jtZMpgH1oiQton4pAqlW/Bkp/BVx87DysutV4e8mg0aqDkcLpynEc6Hmca+WIBLOqw5Pe+K1sRmkpbZohHcZh/Ucp4t104pEhQ9YUYa//kVoPdwW9Ahgxm9JJN/m/aB2+gM3PVOaHFtLRrIBlqJO63LxZLE4TvERQi4lVnOU1tigcMs7fW091QBFGW5alEZ1mJdqzuXglnKO0IHW16t8oBFGSzdtQH0RiB0JeswkF7YknRv1+yjKeNUqDwfd9zGn6Sn9k/RVQVleTVFbtLB9/UE5JNSWfWq/N8/WY3N5z3cOi1wjcrrSTrEQio2dDg48RIDZyiKr1qMxMbCe6lzYrVOxGIEJ/7ogqLCE3DgtLacghdeX7yWdAc2eq6QGRXPxOelDNwKZNO7/L939yprKovbFpCnUg4CK18yAIhJ6XkuTz4AX6z15KvXQn320B/d98rrtFJCtInmm4zN4AFSFRXW0f018B7mguLOYLVPPR83xZmdqdgtORUyk4Mg2N+0J9bmoSbB4ePxkW8Flu1263x3x7+mDz8JbArd0tZGKtLEoCLRnxx4yQ5QEoaUK3uSs2lMRvN38tS4yCie9hT5s4B24g5CY7hBjuqHA9YaL1mP+pjPDh2SwNBsPZg+fcjwj5akCDjSJYLaqTSlH8IZ3vbVG0wx4mJI7jqT+xwm7Lp484ZhZtrcrjiR7PzdydL+bV+gMNaQZ0p49fNV+ss2lNmaPHm+7EarRK5V5Jp5chn4akNx7frBIv3PZ+SRAGNk7OqAgJPobeSrHgpk0EbndDg/hvrcUzAppzZxnD2Jm8sjjwAsp62jCjDR+SE8xZ9QKbX6u1Gxmkxi0xNTVe9MaK/F8HQBCnSZ6oUxYVziKRgaLAI3GnBEr6UcBS2uhgpyM0BtZGiTGkO62iS+13O/exQCT4/CduK2NUYVwjto3D6eTwDES1aWAKThDCulHYKEmzXbx8y9kj2B58f+Tv7OAJLOY7cY+a607RZY1EBjQtRQ8BuF1cStaIBl7SO0092WaRJh4CwVIGv4lkCNHNPaCUvHS2jAEpz8nADak//bdt27wcWzdZLX7WuNAgm8yKrV3tPnGDqt2v9WVBH6lXWC4Fd+2oQyRtbxlG+G9xrr+BiYtcbkQIkgJDgEyNSJ8qRijJsCcnm0OzuVGLWZZ0We1DM5Ej3dFRuYspORR5OmLm4T8oYInRVg5BIazbSinJ723P9odptnCSQn5nNN6VPu/4vPZ6kSoWFcFrjHNmvt/oe4XbGVklNVC8HcGU+GwyroyNYuq6lG5SpqBm9LsmkfnDFnF486ljDNE/dh7lGv2RfsHJPQbEI4m3mkcuzEvsfJ1rWpM8yp0P4F4KlbRNIlz3Ad/YxnT5e3TkjtHkEv+A453wOvjuzzRCxyL3/LToinFw81WnykNbOw7sRTOGX2PjPVwKVeJaY5Junph2j8WjX+OlNRLzRwpxgcs3fXgqgkHiYQ6A/12O7eY2I4noIXn19PQ7lbb0X03qqYt+xNCz6fbs7BltsJ1SydJSuXX54CSKdw6YHVJvKIlA5K8LH8RN1neMH5++Yk/dqyq3Eiiz04W76eCoFyHqlYc0gyF8WVg5Wm3LNIOwKQ0g2DhyzOtPqJ+2n92zi/V0nMfEIBsR3og6m7nPqzQGwmX/Y/lDGPCMY/PQt1eOsDdaKNWW034ScNnr95rv/ddOVUHWNYTcl6QGZ9jNYB9sDfD2fa6dlURwuVKh/ksrSuxkcTMUnaA/O4HBYVWPu/shpMuPeaiwD5jNn2CPpsUkS30DiHqwMjssOWJBbZ1KqUQfK3RC4HqAtidVL/6vpubS35mB7jO4umncn+8pUpTvfm5gpdeqK+Zn55eullMB6Cs65HSCiOz1t09esoD/ctipBwK4sbg+/dvDheOjbW9PDTrlLt5Feb3XRTtx/j+ruhSD7akfxaG1zrNuvZhz/O52YR3YxvAemDawqrRee1/Dv9JugFP3PQbVzWeYEBHljM0F6yv2Hrof3rh6lv1YvtUbN94B25wB0Sog+0omjaj8gZhCITtQsd+8C9r9c4Zbz2D2bT3mcKUPjxJf48Z+Xc+piwvy7nWnzaaBadIIo88pMCflmXz/U64hkfr70QFQytbGWWjzEZ54fE3BbmzSl4YF8mf8JAAXJ35XV9op/p33UWq+jiX3tQoDh8unh6xz2+4dDaPf4Fo6lVVt0yV/r88I+V4Yk2LnRiKtgAAABNdBnhBHEv/cZxFzxeO9lICy4j2hXOhwbPsGWmNfVVFJphpCpNhcOE/gG0IzYeSV4GOdNdgQWAcR+cIASXgMWMOHEWwfP3lXaSqFM9uiRNF4QuSu9kiI6Aj7HyR7sPvXRB6mvEybWFllUTWYAcjf2mC3lqS6kq//LpXICdIF9XSxauiG4NyNv3ngXbU7TGgDSOegRwRbeVIWGA3sFKTiOafkq5gupNZhhAjIf6RUHSe6zmlZWQpyUo4TuwAdaktyRQEMI9rdyl9n6PhHgsHo0nXWYtnA9pNAUk368V4JWfQleFmhILIw7n0p6WCVBFP/Gn4vksmmMSnyEOzBWwC+kITDz9kFgjTnWxh0d6RfoWx+m1RgdJOo0gF4Z4yQmhonWxr1r1Dmu6e0s3yER74ZG41yEPm156PwGtz6PA1NQopND6+F1ztzbOm9YBcgxVG14BMGzGnfPBUOEatmZ/Z0Xrry8ZIEmVX70ys4sIewJAenelvmz9Ko6FlJkbSOaz15oiDGUVQe6cybognKduOGZ9GfYx2ceQIfrd9Z50Eil+Un3GVO6eOxqwVHspY6pElsPmroXNv71lAwHLmw9oOn3HHSUqaimOhzMZmnLKTEP07U39KzW3DtGXY4SZrmJr/lFNiuPsPyR7HGfY1Y83NE/IbxG4dydOUELTGS9hvhirJloVMhwhINr+xjBPyo0zX7QYXLDNdgR0Eh+QSoTLT8CLaTbHhwvfyiFR7VSQCzrzTK+wmAx6TqZZ34kAL7mNjocMvYMF5sDfypyii1YJF5q0oQ95lVKzQwL0Rg+Pq155fCbmhzv83jHSHuVYkjjnFc3kLaSEXsBQjdwj0o61GH60cjtQRjarbX5LIVhaNI/mM+rUyO4M5DM694GSmQjzvaV5wd75YClxu5pWMvhA96lS0EjkiOXBr/JCkK10faTjwFxMrr5PjIJwMu2EkeEFiQMcGjh1wsWuiNTdTdDYpv5GCbSSDJoWyC6m5xFnwEI6InwIwzXvGST5qwT9VTHHxAfoBUMHSy+3oOOK+jyxgZKgeBXkc3qX8utSVHZE0mthFj9XKlIdjQli4L5XF1UztjMgMBXqY2kT+UjX8OIkOGIsAdu/XUBGJmH1bZiWUb4ODyEvlK+9k4BVEteziQW49szrHdLf+u7IJfXWxLAxQurShkKjTDvSnVi7TCrUdkTPAYOYxMURsrLR0hSOugfAOeJRnr7HpXtiTBmCGbxvCQMPQoBC4bzKvHKPQWDuo3DKCDqDuNwke58+CyI8FUVR79rRj1tmGb88zpNqTkqqxUbsthHxCRZvfgvAvm5vkbGwZ9+AYmSC7OPWNm2HbyI3rfR/rXD2S2fKx4/E5HATZRT4Q58ZfTT+GNKWa1r99xX/GLXHKRoo3+QdF7CmkNXQ+Q61Nv/7R8aDntopiWXwn+bwEgDWGWbgZ3bT75zR2h2SjsC77zi1lunEKp8NlTF8oeusoRYIquN4N62JwQ+BHoesAEIww3Kk7gJ+3Bc3un1v82J4C2b8Z4+lbsi3Ow6rQoOTWHTCr3KYU3NgQP145YOW8esowDLr4yuCdPCrcmdF2u566SwCcFR6+OrmC0Cjy/yI+3SNi7OUd8xShoQZQqb6KLKZTNdUJfc6WgDQ7dN70jNuuWjWJfsvEAAAH6AZ4YJo//2Mv/qcpUVpw3ZQL/1BnEexgQXJiWEb4EVQmaPd/o9NlgPm5sqGHZsZcpZ+7ZZmus1IFRKV4vfKfbSz7/bg7Bf8ZirJIkF4i8+jsIZux1ivL9Xd3hSRbghPM0bv6zyuDINr5NFmrl1bNH6oTDYBSiLUqgI2G82q/mflo4tarnq2geWJgFr+BufNA+ElZ7skZpxxFWOsJOktnCpepVtwzVOJzFteW4mPMpmHdXf1epdMGUGx094RxaF9cMibBO8RRzHRU4TVKOMCw/mrLSLwLuzVVigfDapUYNK1LFF6M0aKlE6WGV7UywGXavjosxu8wwwMtm7jXZGbRbNwd0rhnMwKuFqTqn3Pjg2E+IeN6grZc0QFfrHaCE8B+tgsBnqMQ81FZZ3ywYV/ybsYcGyW2PIT75WZJ6iuD3tNrlLMJAUMv+hGihctpO/jAQGluwDvYp3vFH87CNZlk77zVhI6C5u2DvlPGr3/NYB5oDTbb23+40qKBBkTrvEe9H7DRGqAoD65BVy+llXkd5XQfRcLzffVSwBQEhzQjO/G2W0K+cw8v7iXG3DIF5Bk6BpAoQ5caVoVvlZX9mAsv6wAOuhbzu/yRrGUQMViSa2NGVK5Jd6vCCjYFidVbQ0Lja1PMJ85+BQe9/QgiW1we6SxobMx57wYdVoEAAAAFkAZ4YbUv/v+/LRR6+bJn+sHM9sAxYNCiFh6sr3jQmSP/MywSIo3MEb/VOYgPtTVCaQ04fCpy2uRP9BklCHq6JSj/Jwgjmxb1UdkQMkDwecCN35JlsAY5e9l4mNVAFrpgD+BrnfZ55IGgG+YuubaS7HjCpx8UGYCpJZ2XGNQUjwMnnSJPAMzJVXyJI0UL1kHwXA93HzOGL17FHyOSYUFiKfPXQ81pZQb8lg3eiJ7tRpSTwhRxmEByH+Bzmfp80XqGTVeOqL5eLAm2VbTGfBgL/lCfaEVCWlgaeF8tyOMmPYUTxH/NGEeyxeTnpHEkzOGL8LcWe5xmdnVr/79Q6wCPZ7sbxB2HiWABvl6iQWb+/UGSvwajzvLVmeIU+Qp36m/VZOGbIcrettpFy1j0/uY0mVY+io6lchNSb6SF6iaX9k3LlIWbPxKpcnKUPidAvY7rdxwygyCU/TB/jJV3bkULkSTA3pIEAAAe0QZoZKTUCAtEymBF/nzEsmMJXlk6nDDciuvmeWO3HbqgdokqdcMAa4iAwyAXw5GGGj284uNYM+oXk1/P89DUO40wnpsq3qdzmthfPecgDcY9wAkQiSHRLQrJVReF6GDThzYkPs4iOwN+yJAj47R6gjh54tXvhqQeR5xvCnKveLOqAbyF3NMBdW6CB+Yn7tg1NrFENsuRZDM82rjNx+luktoi7koBAr78pDpdueUo4eqMykyykNiEye9JxmvzJ+j9oi4tif0Zk1y+/TggAov/YSSmn07+S7dUvf0NLqS/04mJO/Rkvi5lHNR9n5wHqAXv+sRZc31ndbA6IMR/u7mRm8qcbb+3ifSHR/eTpqueleUUSJuIiFtzcCLRSysTX5gDuCjcRFgjDxbFBylF/A8riNMAM71Jdv/I6wIBmmfRgL37Ab/xcEes1qVQ/O3cqihSF3dhC7/Qox4UI1hQkERpLHR7Yq8/u/wVtXeoqH4X/PhjFFOC/5cmNeFky5hFDm/lv0Wg6w01Fa/OKuEAooHhxUrxNMJ573k/86XGunZXm2BaEqvofTHiZIk++mJGxD+qpKb0UHC0/S07Z/uTnmTPfNTHUyM8Tb5ICNWctEBFLn8gTZOFWOgdvKUEMB+sTvDES3tEXCJivOndlqS7f+l2swilQxad+6imNJ4eV5nYAE2st/R30WwLOWn5c59CSX8f3Ya5DO5/jlaT/HUtjxb8yw/nrQvjtkcfRvjEotRF3zjqEuVyw4Feeb81Xz1FfTom2Vr6jVGcIVpOctAY7SjiT99+uFpzxUzeG1tM71AJuxxjiATIKCrGTLXyZrlUeCgWeCHfqeh88JigL6vBVakRmCdrkmrb3uyxDqEqr/jpMnmApdvjh9dGIJztdTOB/5i+ecVXgnT8EkQKeF3W+8jr8xWzaevQHMuyuXE9mioNvLQ4xhoLp4yv5E8+GR3YqP6mnv1rfWG4odCzFHfgqSH1bd3tNuq714fPPn6KuVY0ma/eDfFNWJ8JXMwdKRRn3BshYoiVsgtfCRX23I0lWWC4TjIv0rCcpWzmCfzASr8KCBBEB02jq05+9paCKXYX3+18k7tlU1YDtRLFHP/8OJaReLwvzgy6h/pjGflq0TAG/XqCaGsCj1RiZ2oK0kOpsPkYAdUik65PayT7dIa4Ye3OlUuzvCLHPwmIj6OTA/UMssstcP51hAAmqjh2MGhMLDhNiRrOUJ1eBZTKMjakTMi46zaoPpA3Na2cUGO/cSSVDD2PhtQGLc9BDN1aBCoH0NaSbviTC8M3V2DMGr2FBIHVZ4eYVl3vzjeLJpf3pXm1MhSay5BUT854LpykKGJafN2BTLJTxLUdJfB0JAZUPE/SbchdYk/goPv7bCCFGofBy+iBuH3ImmrbS0fa15laWKyZ1qD+XFEpy91DFbnnpZhl7yb6Ni/E060mW7bG9siSMexjS0sHXxYQOP/RxiEBZG0aNvJiInhvoZxjsEc1FB8Svrk2UGFcpBUiXwN97ATf7s2CQwSJ+9gCY1i+ul2UKMuKjOAYDLcSnci5hOXiM++TecYiWIQ1w1zCatnCukgIBrqDgTNSNTQ9PgUb40Q8SguHZDo3gfZIefQwJPr5m+ZTnwbhwURR1jkojf5C58o89a3LyUtjfBnSyhOZBMiTLY4qe34reHmFHyhKQXyOLSidbMQWbyJNI8t61Jsvz4yNA+KsUy4xysN4qd6EhO5WPxbjqn0PvQU0leOnSEycNTI+Fp1jQUvNpdBk+ecp9gVX3TyfS3fRvtvE5DaSppLKHm0m60VNGHtagxoBM2fNfc4+/4Gm9nkKZNuJ6ONoPrrl+hoJRbETgM8euwsDmNGijtz3CJFZtxf7akYWHj3Jdv3I4M9lJpOYVH4nP7JYzi6K6rWNFbJu/wdzOX30BJ0xYOaE0E29DNU6JxxNaAKU2gK/zWTakxU9smkReBLhcfVcy9p9qAT7rRcJOsolg+1mMM8V1Uk8celVX0xNTbsU8BSfop4rpUaqKotDGrgW4qIefyYm9b2DZnCvJ5AAcCYJ4Zk3MPcR6JSIzxFEffnhNysSja9YYeFcl0xeMvVTfRBi3TTZ1tleN4sh64khBZEH3b8XifaUOAGhMGoyhqEtWeKxOB/0c9xIA/H0CTZXgxWiJowSD0hNlSmKRFr6zNajIUMRHv3o/t2u3bgbPC0lO2qVOXO50Hd2o85Bm/iT7irBuDvOBu1K1hXUAO2BDH819A3vI5XkQIPwWsFDt3NkF1bTW6uIbYpSGh2pPhcd55txFlqS8Jkl8/xn3VFmtwF93nW252F35cYt6GglKQNuLge3kmAbNMp/VNm9HOLhgQkIJ0DIVWKX+HRGbQ7KJwh97FsKfKm2prNJnFfLLCznELhzck+6e2g1bx2tAjCEgEdPnPRWCEkzmw9Wch2OqtnlCrfzh0bPct3wg1t0WODsJ5ixGjp+y8Wp3Z56NcOeFkG9PTLVvPGjx405Amj9uTCDHf74pixgvu8U87CxHEvQ2OSG+2wdjmK53YqGOeSrZ8vPTXJ3IEcErtcyDWnMErtMZt/4Gd5ZMg7MH57/q3g+6oNtGnb+Q95rZzn2xW4hrwnsCKhFLZqMB0NKiKeEcIEuwv7Fkhcw98QAABQFBniDNxP+9CAxkzCgNp+3MdGOCGSMV4wE3nMB9rfAE6tH8i9UDa36m2cln6P9stB8DT+4SJt9dlXw+hGrSnOHHnnrmZGBpDkA5Pi5JYtAf+0GzFaXpq+G0kv0xEBgupzfmYSFTRETUy0zmsZz4rVcDyWcShmsmxloRED1AISuAv7iCBdm7qZJHpl+rbH5KXTwJLHG/D2JKzZrSJ1xtxWGNEvEIIa6UaUUlc3W22bnP8mkKUE7etn9v+VyzS228vVP2ZBL9iAJjwXElSGc7JpqSuNNsEnkW7FiFuTAlSdvPuR0V/r4CzwqORm86DDMmySEYwe1bdoU8TWtYLFniQS5o5qODtVomqzjTN+1ADeL6IRDJD6mFHNGuu41morAagAkVF5IURCPCUePl2J9UwOcIz2ct+Ri1oJsUAXjGe1kc7ud86JWEl8FTtJ+q6eutAmNj1u3R51PBO+ujZsaHn2x63UZbpmhpPKf/Jx2FThsk/HddD9G0T4nqRToDqgXHlSKN5TGeEjpQeLjxA93i37keOL+ddwrI4ZDJqjGfeci9ubp8LQrDtydFoeIu25GXMgw0LbYnA0YjS5aW/JSVvloKJwKBVPzbxTlSDqZDGb0arWHWzkMZgj/Sm+FK3bz64OzPRmTWAGzE2dKB+4cvaIM/hE9zj6nPKz/7S/PHGUkVQy1keYwrae8fU75vquaMYj9stYebUiWYKT1pg+AwAqe+2o2ekuMJuqiX7nQFX8w7tE+h8ucVGcA1RNziYDT36lmhg/LhTQi3ULsI1XQ59oC3joSeKXZrqEEd7A3Pd77f2k31QWXiVlm2IynvOo6ufymR2HI6yzx0kHkBNEozNVfMWBBl6p2EltxiDafsOp2SKt6xovSeCkU4Bq8BlpTczNeC5g9oS361xQ5ehdr4Um9JIteF9tD7maFy+d1lsXJl0HIZOv7AbAKlFSY+0yQ5MuV/fKvmQz27r7FpSBaOSKk8kUky06Mbai5RNEhdJAmaeYJ/oauCxlbgvKh2QJ7qwNg5RpZ0BAiU7jijSVK+R52iRACF+D1FM4dlMEG8fiD0fTGz+NqUoL+2xExmPF4cf61nkUsAHbNJAJocwAYNW6goZO5XXBHLpYUmBM1PiAI9McfOmjHC9NgwD5ECnDofahSwOzLiwDBFA/NlB+PqVMBdkYeB+GjvbM5sZgZ92fnRBVBLgZJ64TlN2NStBNRiBhIpGMwK9YaE8Deze3XB9CHktynQHRl0E9X+NG0a7aDka9q/dbtuo3PU5SL1Hu0fr5HdC1PF0FLComAIPvKhcmP1NqXTM+xJs6c3h8zldRU9ifmZVUZKd+ip1tBCMGhjihdXFXq2c8UEoO+35dVfRTVzXHrvudtnNaIMcBCBP+JgZv/SrfeaYVSER4tC062l2LbozX5LFpDBTT01mAFXiktlmttWZPfHnZUmSpiJVeEi+Ip2iePAe4SgZK3poWIb/BxFQBkOOFCBHordbT4UTnNt4TMzc2FHJlAAGDva9j7ptXxpBx3+aYMjt/yLONvyIIKSIeSBssxCYFllDLdu67/ALYoOYt9t55vGZ7PbIfkHXL48ZX43Xhc0xNb5e7ppd67dAo2upUtxpZzUfOgf4oNduut8iwSw4FlpmDGUTBURopbiNUMKZD3Ro9sJ3e9rTd0MJxstLCmXV7yG+24d0oE5vRqZ4VeD3Cnfah+w5F13KWUAAAEqAZ4oraL/1RSdGaI/Lf97KUwCz50QWBnWPbv377AjBIWUvaDmMyvXf9mO6nIbQRBICSVz87M+Mbe+T8/2pOBc9kPtecQ7/86Pzv1GrA3cnF2hCkFe0C7jDHlNXEgFXrEEPhZ/oOK6xTrZIXmwMQsE1hmN+N5+EftfR/Kk/pX5RovqRphqypxE/VB1triKPBY0Czi6E3QEC21h37/sRAxXLTOTlGVHfP/mOD6fYq15UNZWH6E1/JoCXcbl2I5oOxjFb/N/3AY1K5urpcQSs4iXvwb6RT0eLqZKQ2TkYTePyaBvTmnKa7AcDenFogg0trEUcF8d/tNtMM6MB6DicaZ/BUd6WQhH9XPuwPdc6nWdle4WFhI/JxyJqPrrmeJQp9ErWS1BCyXQbRWLtwAAAiABnijskl/Zp+D4GUAGJIrXKKFH2AvwVratIdGIgeBh6pbEv/7/5Tue2WAf30UCBipVflT90YOBq4F4yQOozKmidEC78zYDPU5AhUZjkQHQqMYzc9Ax9lLg0hk9rtOBxRwmjtb4ZgJkMW9qRJNsoO2+ltubHb6S6I5pYDwCSWPddYJLjPJ9RysEh5LpeE/9o02O8IsmKu0wZest8wH3gRZzUclMKIpVZJjJpLptt6axHTCf2QnognodvRstAuBRM0po+ihS2Axrva97wKNN2e1+SnNwCn7p66owRAz3NvkWpjGYB02fOBHmU+lratM9+Fm+yd3tzQIwt3IJCqLSGEYamWX4nHURTVDcGcNdPce8ERann/L37VaEyp75FCjU+ZX1qbt55IzsbnKGE8AcS5Yzrywm/QuSSDdRK6Cq2H0GiZBiU4Xa/ejgN87Fum/u4YNe7272WZJSpvDMmnThoc+gjzZo0mza6seaumAFVc+qqhTv4ULkrA09l7RpH2Ntr+9fBruY6vZVe4i4t/nznb/BzJ0pQBaQfWaCLChWIlVbDRRCQjNONA9TZrixriRx/zmvXOwKeD4i4+4pD8frjeLgQ/cDMniXUf0g9m6I3rBjE7Wc4xcyOr4f6RTxzoLUwFD/StmYzO6g7l1jaOatxN2nh05Ae7IOC43gncz8Y2WjRAXBFxRCPGbpk9wb4//eRXgd11EkXog/VZtvSjCrxZCNAAAB+QGeKQySf7kYiCMXhL2BNO4rAMtP7M8zjSkVIRv2rVd1E0juznundH40kQzPQX+BnJGXEZDUF4aQWqjti9m/Ba9WTGORtunSYS5hLDV9GLdhwPRaP0KaEZrfkX7Pa2Ra5Xv3XUGkjj2bld1Eu2c2JYKVnhexW+9xxMKdB1kDnG1XocbhCZjDm8R56UvQ0vK2xe5IOEWvf2qfHcpsnEvFJgbj5m3HXOFyY8iJaA2amK0aCwkVLTzWqLh1mhueXG6eBF610l5ssIvDraBu5Zd79UnKT/VulafOZIDwDsxEQf7fXucMRzg99m0PARFyYuMaMZZwSriyJEqwVbNv5BJO40ZkValhP8hx4pn38PYPSFRR/84ACr9VDT0CT81MDtzOxyDq9NgqCek1xHW1KKiQRWvA5VsujXBId/2gNllARSFwSU1SngbRawBYBI4B/siEsQYy9opmzami7C8t8yBijrLydD/Ujh3RT3+O3b6WyyF12hKqtuuxhRtUQXxzZcv+0tXLEoHLc+nmk8XuuIW35WyVHUyn5+snx/w+GgpxGtvYqst+wefBCZgB+yDOQ4cLcRjRO3+Vk87bplsg586vteXIJf+cCHn3phPZSIF63I5PQWIVbZgVdGfhpF6hWT6wYW4OfezmXUl0sqQfPXIEaPOHHYL1FpElk8oAAAfZQZop6bUCAtrRMpgBX8/tvD3cPRtdntUJeTru2w4WUVezVB8SXMU9/3KJRiKutLJKZQi445uDjbKcoV4/jj+uvsxgLwbZiCWECiVRQAj1OkhAJX7jcsmGj50sjvQHyoZfZUSBPVIAt4QJpDwjCOua9pk4FkB9cKuZaA4A8B4Ggj5jQ2hH6trY1PWHb2VnvepqkLziU9anS53LkbrzKXIodFwkxgTsjzIyB4M/hzcf/8Imif5xWn/3Flqo/+P7so2UmtcpKFOHlagGBijUvw8LADjW/j7LnNgzpHB5qv2LBFavxNrLhzie/jDr5uIKwtEfjfm48bW+d9AqPNZg1TM+/gqTeEiLoUjkQ1I6gI2WlmFwwAde0d6Sm7V3yhVUjfNt0l2Z7DoFus++nKxIo0+lDjrubKd40LsSwyvRtLIDUbl8X8v0Fq/KQ2w3BuVJZk9a4sFtPCzBxwW054MSKerdJlyCBUHDK61Od19nvLWPz3E6KRB+6TpDaAI9s7yKtjhAZY5boPdD8swiWsSF6dGLoP2cz99WSGT9jxPxk3lyVWm6UxIR28X9aV7pPdLhXvm2Ut7qZdHxiChFH/x2k2vaVfFOXsW1c47HtXQoYPEnQKr8K3THGDS09Z5IjymWMInrnMQThAbb/0C0C39I/pvdiusDngJvug+BJBKmdffk1izBTh1IJ6vq4HZEAXuYfIo2PPoHQN1F4bw5A3UjqM4pnNC6/LbBr1azlVKgm1Lv4m71ordoB12JE8GNWQ081bJFduApS5gicPKOMu3z0ju6iQFecwVQdLehrxFOSrXxKBjLg1AnI08eOnzlWSKaMHyV6AJF34rYc0i+qx2Dy/TWsfGQoyvdqfOtRUN3Lb9XydLpTUj76THzOYV3GBLYUZwmaBxE+FKCAPuq3EOGllcgNsnMz7mShKeEDMuWGSHVfb45ZOppyWh3Mk2crfSH/1nlNeJ+NIW7EjLvzqtoVjLbHvJkWt8FhnsaxYymnbBxNpTNK1d1Dn52q+WqzKvSxHFoJppgfTnY3QDVFNnHwBGBukuM3jzFrDOod0SLA55EE75ML3ElEQKK+b18mHe999NY1N4Z8GdhjKkUOuYkgDJu8av293pT8mOzRCrwi1SLh1NRNAzsgNr3w6yK6/AOTB9HUM/9Pw0tGFRxetsd/sMAog72AsxjTDiZ/UYoIFZspVvzG3Ki52rbIqUKKO7DXjEcFDwf5kZQyr1llyLpmPQ4c2aK3/Wt5ZJauNT+tvN6/fBzBW2os5nxDdkyZY6CZokYWq7Vp4dxez2wUR+Ozi5D1Su7RyQVYyKSI3Y10n8/awl0sbJ63HMiat8+qvnZ2E8rwElZiaD2A41ffhR542sqNArb4k3Sox2lg02q4v4cg3uOuF4ze83pgq3W9BaSY+ENIIWDgd4xJC+U7COX5e/S+h6KSuk5lvRLMEogKKw3X0j/C15SQL3/skO0esXpiR/P0J9YoTthAEYwDl/0wHv9Vk3KGKWAg3kJ5Er6HXZ9MhMT5Xu1yAlldws9Ha3DXFRiNEbMac6oh4sA74okXgFtgIRQiV0Dwa6kCeArD0/KoZFGB/Hzev1+VDWhT1PVDeIFe3snVNGj99t4X2Klr9O4PqDzKMqmkHF/aDYlJG2L86GTQNtObPk8Ta5S6BqKsmN47dN+yoDM4sQRkQnUqPDfukfchloC+EL1K1j71Z4cc5oJ2oLFpDexn+SPkEwJG//yPSn6ZhYnYZQjwkNN4sHzcv2PtHcvz8QsscUnZeFcCy3AIJ7+qQbNN3n8NUrOJ3hBnZoXPktPAs0BWSskKUQkdrztPHVtAQm/+K5T7GIvp8LeYfGUb24sChfCwSgTHhoClQTRvGmn8fpRKvFDOqMZ323RQz+3CWJlS87iIVqTIkPHnuRfmv7b6H40DfAhBNHAMQtjGnvRRsAGdKRBYQtslo7ePl20/mIBoIhwQhfChwW5H9nuSGNO3dc+fKEHlEB15v//fPQCYTr9fkXMn8Kd4otmhO4OA43Bz+j0zd2FLqNJz5JQPGVyrVZUJcxLXF91y2MSNTaTKv0DWUQMEhaTPTVVAB0S6aYV/Hu197yxRw6j+McSp3Mg89xZSjKOSBXFNB9E1VSW283Y2kqn5jjeeA/77edxjrrjYM5q6p+Z2J7xSDzamkNzLDvce+R6xVHh5ktieFQPvq5/9ZLw+8RIx04opVW5WaaCcXCSrSQSooOh8WBYyqXgEknreUpOAeLEs8t02oPgqvr7fUtmOIa24JC4mk1neZ9VdQ8RtU16qr4B4W5eXno3TmAtdCSUPFF66i16QqX9O5Z0UwK56GJYuNaYeK6WRCYfwG8azneVQNr7G7W94BuDVMaPthUjSFY3dZfTydkBOrLzcy5Qv5TcKywFOk2nh4mpjmWBjjl8cZIdXtd6PTkVfA3nC7+QQRYqt2v3sWvJrzlKabfQB1ULlJ+Eh/SWn+rAJ8aGdziLR7Zvt5cCaxToxDJZYIT9i1e82CguK/2PE1OKDkMJ1fs89Ax5lj6sFgalNhBRh4YRZ2yaVbcfMXQAm8xnwQ6n7woWzTv2ghJ5IpvMX3wwyEOEmBuL/ioGFSnhRwbnjKOI0VmG1VX71Dv6GirRY30rDmFoy9OGp31cg2Xqn/smt6CI2UnbF/h7HFHtnSTRUhKYgvLGhfDk6nkXOjcAAAYNQZ4xjLF/1/v3WeO/x2xU9fpjnjHyPFM70350hkU7DDCIOZI+GFLozPdyMjVqL5NPcqbifp+2hEA8xDWP1Rp5/GAgV0IrdPLAg2dpxsryQNVT2LTSxWrT3Oxjc8rAxwC//6CdBuDA0a8/k3I/3VOAoIjoPO/MpqZfVHGW5jfhb2Dcs7pGSnHlhUBdu4WNyhhYmQr7CuT7WWDNqaSsw20Pavy6/r5eJVWVNnie5JelMAChcwuc6P0VpdHkoItXTtttuHcwmlHDXSDb3bYhiMDa6GvyYeTl+dxFPMm1ic/ewgK4SwCtN9V+K6dO6hvent4dqzMs5L7JheghcE/52qA9ZkNkKqBFGbAqmNUlA4VOj71k959+8fiFfU6IzIOwdckrcFmmiWJpYJzJnipQUsszz9fof1FkdXDfWqKxuI8c2+3mgmly2OpWmRhJG+BdliqYoo3mJwsedvpFbuIEzNGRNtDWa5MsULCtZNGbUX+qyqgkkx4TiJJ+CjeLanhz2wHmjNfowm3GtimuIvTNXVxccklYc9lTN5DfXwROrjT9Ido5LZtBbXhPMjtPhBWz2rSlTX5LRxArKMcA8dCbdjvfdcRfYWJTMomjyNQB9UbtNMIzMmlUC92VUL1RBX2o+w+qJyhuYKSPqGYFe5nVi2IjVyQoACk/Ng47cPtsXaj/OtBjF++848JxPmHdgjz9Wg8saEWCMen2FJ8T3UumvIzjLZmIHOrqV3SIKUeNjiWfA+HNL1XI+yATlmH3iRCHi3sk1HB7V1gvMohl+DpWn9yjJzKtFYd9wa8Bb/BC1Gz1ujOizh0gW2HXn+UWfsrsr7TAm1DiztzWuyA2vJhnq21DykHm2/wXjXMD9gfWK8kS14IQg6ttAZi6UlJ/i1cdbVkrF79NxRGOwseZ6A4AQzBTwdx/9oR5KKWh9jQm2FKssRIqHYP73VBe/7OdRJ9iEAo9W0Nt/8hUaDYdkILwa4fGRWCER1nUPntTl1dReF8jMhTulC1bo9lObRInCBts2guIIYxN1zZdTysHnIzmPSOM1Ntpl9JGCpE3DqSJC8byIl0AbiAl29QF5QC7BaTcl57wsV90uCxupDJOjMaIXK9xdeXaJXTF7ctP1Iwydls61fwLNtVJz/iv4Rq7XGuy3v4zKXFNOyE1QbKue1ShkH3tpIM03T/gGe5Lth1Adk1E4czB2zhAXntElWTtq6c0vtSEJckrtIyIas7dtbKh3Ahg7Gl6hAbbq0dghgg1AGXYAsjeAV9rEXA4rxBbveh+JmcGGkFtTue+fpYg8g7h69yO6g15OrRhcP9R/gQvgT2x0x1sHnROZSHDze1aQ1LUWzP/tND1h+Ob/MnCWPEgWTcF2LvkmMSAdqOsNu69qUWt5SomYNSEoGdTrzq/+BOjYHeo6MOFKF9AjFXjIF4RprnkEkHdRkxlpEsYaXw7TtOX7WJM9O6rv8FiLeRNDO+wAjzZCS8FAhlVeu1SNnKCgC/Db1HDqElPBLfvqQW4ysQaKmpTAKI3A2nULRHBFiKTI0OmrEbS+XuV/CTveGLt2WfysmxNclT2oKi6Qi71TQNLmYf19dyeXS8bx+1LkzqrXxBBtihxuJbh2wKxXqayES28SroOJ4GQi+tmHf3KBiwwLes20XLYinPgMubRhdk0JM4N9bLvASO3DTtSLmnX3FsvzuYMohgPsVGBj85qsprzS+bJMLt9XgIdttIaCyWE3b9ip/12u/zh79m1KsVJ5yayHUuU5BKEVY3EdPjHFXHRSWh/Q5lMw4TUIUEHS/I9bCv+lWS1WnbtUhXwb7SaSI9pNFTj4Mbv/sIvJDB8aY0nIO+a6mTOsVsn8acsai3eidUyeEw9R4P0vBe1EOb0lBmcFN4rJYByGaCwBFeqaiRK4piR2qxJlOXu5i/NwLLJ55mQvp1FQEshIrv5qRoBADNlufxbw+rYzkfU/NE79fuNz9KNEzHXF2OZ25vjWozw+pOqHk5P3CUnxMaw5BqhhdFHcrrnCk7NB4rdztgAFWsT3SLzuTt3RnwgkpVG5XQ1QjcJ778jO75U3xHUfCypkAAAAcUBnjlMqI3//Ns6w00WrQwL3VbT8c/HkMQ52/575iliD+rXLArOYkW7TroC2wZVvEHFL93WuiID9FfTM3WW3AiNThl80y/Pfe8QCUm5EfHT6XwqNieH3yrtGDw+2gveR3cza6/ftv4Zw8ujzwVBszXWQZ7Ts5hvqbvamjc9UKGfbLoCW+FfA2Ut1EsOgxZ7Qz8e922jNSq7gXm752ws2rFMoJIk71Kzmn1oaNgwyLqQzK4YXaVEtjH20oNa9f8dPzuVzB41r9lWyEonAtNWQkcXXI1dqQJGK9jhQzvlSHDO8RgsLtrKWPBElUE2/v4he0OM0PzHMIspaDGgp+mPxM+VJtPZ5d/HX4Z49wnmTjBek537/PaKjsvQV5vcMFx+mzi3oKm49Sm9yIWmuH+NWQ5eJl6y+SM9k7/rpSC3xIhU6ZBSM8mo+2U1WHsfLbxfZxlCTVGckOLoyVqanQ5SMPqXLyiXgh7nyLbKqp6mfJqG1ZjF71IBnWmdIfOMjgkgN4ZGXGcnxNNtifr3KzdLEWqP1bPlZQjl2qWLC0Vcdn9mz+hcuBzhHQJ8X8sajQRDeNIqW62x2TcxDBQR0JB4YJ3oDOY7X8wAAAHQAZ45bKiJ//O3d+en5OEpt6bDwb4Rp7EesnjFKK6NH0lvOVN3VvfwTbzkYtigxT0YCWojpevVIO3rdwIjLfzmngCGOYR9ku1N06y7Ym5J0L9IDi7vk7EdLs5x5bkLD0/WXD6yjAJPugBtR0MtUYqesIFdk8xqLCikQLPyqUiS2xEcqcwJ2C9z/YuR9Q9gbezhnDG9uTsNlYLTkAXl7ID0fpWPpCKYQ5uC001q48UEjFVR2Vf0UfoU3S2WkKkA6+ise+GnxRBU4XLiWkvs0ZID3NvygEaxbWoGY97nE5YsjuOixRF/PsgR+rUvlDQRSj8drMqvBeWzZWXpVZ3ZikESCZ+cbfDdCDxdAqUakxYg5d87XKAwkiNe21Kt9Q7ZQl/p30DgTSGnWbIS+SLiRkWSH3beG4nvQxtZBp9sJH3PxhgI1vEmJu6bUO5wH3vT0CumNLmefDXdpeG8IvYRf3CgJZndvmbvsJ2V21kVKjJ0Pkf9Nns05DpzBVg3WIUkD1QMW93MadNzRqPoh89A0/R79dPbiSnTv+An5uDvul+fUUL/F1JMW4toj2rZe+PZGs0dXRCOI/romv1wJnKQiSArVkST3KSD+KMynvZZL/cZNIEAAAGlAZ45rNJP/lbq/HABACdzZcy9UUFC3kBcMrOFikef+kUY8DdlTKOp9RpZ2VdBNblSvwK/QkJikup0yU262lJ0sFq35P1A2Mat/EYV5fOqMtNl0F+hs+G6B4epQDBCj03Jiak/USc1Hrk3njvk5R+6kJeNN0UAR55DcH6rOc3op8klFL9GpkQOv5xmMPi+7go4ygPYEGxwD8Nm7RPU/WRAe3ztfuoM+TCpunSyQA8lj10/nkBM7aXZigrZrGeGcLT2u+q2Um3QeU8urZ72Bjvzvr5b35RVt0tk0xj5XUzTIKrGBbapTNI3zxDKCy730bpVDFGeG/CRhPUqmLMgQTwH6imT+Qmd0BAI6ZGCCjNRoP17ccvTkpOITNaHPGDr9A3Q7LxDZCl9P84M+eGfvbOczQgdTb9bzYMH0gHvVXvCL3lyTpmMV7j5rSMWYGvmLEi5wE48+lZZHpA+vUprHNAxe24j8EHzAsChNVcJxzzkpkarfM4Tjz/GkcnupaozUGhqb8P5DJjobEBZ55zL7auM4jyw9brkf13vLIXGetD2ZPTyTNlIYQAAAfsBnjnM0m/5NZ4sLq/Pi9ocosBL694dz2aHSfjG2tRprGTPit3kS4eMb2v4vGuqfLH96goDL2bjc4xvH9KYZ7+GA0SFhJRPw9e7wQng0Cpp/7Dimc+W08i4Pv59ZhDtN4A9TxMC4e4CK9z3RgJY2bZ6XhQmmDny2blbBMyADpfDtr84L/741he78xvsdh6LAaO9J/uT+vXw/9JcPnQkrLUBqiTO+KR2XQBnLqu4508W73Bgcfuk+4hrdHfhBK+LH8g2GDocTiMAFwbEZXb72QL3bj2lpEa0u1a98yj4TV/WOtI4FflbaV8bgR9Y8X45j/VkZyMe3UrZWoAXTsFSHzjyfCCfZp90K+5BfENIM1r/MalHwi2NG7qfu31JsediK5WiX39dXbwl5XMld7FRgY4e1YeU7+wu3R+zWJLL2gwHMRts5SliTPcEZ2sdsrnJ9UOLd5GLqsEaABP5ZbqoZRitqP5dvsBe66j5wMcOZxHrtJNkjIC0dXT/hPxdiAQ5GPxkO/FTpfq335Ker7yMm3YdOVu6/YDmjGy3GBOLG1sX87SO4ymijFyDUW2emZauFgInhydtgCPVOpcEEKx7Lx+p/8HWoBDJmCcd9RtOPSQ6VVBaOVs619FUOA7SbhQ7dG+QKptSeg50EnxliotVFRnqdmsiqukNAt9vfXEAAAdZQZo6aI1AgLa2tEymAAX/26sCVs1VnDCOnuK4V4kRxRutsYce6g0LYOAuq7xE5EfMcz+Qb5nd2hPpWA92VMZgaH9l3wYnYHc6vbqV/tPsIIiHvqWXtXEzYX4Bd89DpsQKh1XIcsw2/poU1h5jCxGk0Fk0Eltwb9on1Uh6ONzIjywCYRB/8HjEAmjY9v2VwoOPHZacm6NYXpJ5H9KN33fmN6FHi10YndrtVryvf3ekYwpqusI6vDDrh34pk+dJV1mChyCyLIcopoAgeyB6GueXiF5rlFXmttgdoHLzPcttSLDUr4lEcD4c3n4I0zhabCwWqF+QVuY/1xl45no0jhbWJwl5rImWyAwxRD+WN/eJH4lUfBJKK5VY32GKd3sDhhSfA10eCsetVCVAEeqlnDUHd35PbpUgfX+f0xJDFeBjIr3JnxOTWJPVrn/HQ0LOHoHKnlcu0gQyH8lHpZEHp1sft/ScvHBTplU/eX6HNB0QBNOW9KYPZS3qz0xq+LDU6kdMbCmrUqD2gYYJh6z20n599KPKLXePvir2LxHECTam8QtqeSRFSS+wb4TKj8b6uOBlVC2HW44raluV4phnc7ol1++9GIuQciYPpmH3JVdstCTIzhP4QR3pqSBMzFxHWid3uwdimDDJ4fs4P00uLgD9DH2/ng4S3aYrJUEdrn87njcZk/GKWsThNBS4OCEP8pwb3ozjl+ufCcRRzn2w6+XOq/pOnCVRTOnmlxb84N+LOCC0Se9uIcwvUKyBlW+6GAbucClcUJvDnalcRCwi/AzWctY0Piv2PsmLF7ArKxOGLshBlIp5QTAeZlfGMkrKItbvH7Vcy/PlClXonx02YpvKoKBaxz+eTs5dHpLH1YO9JvJulsLlE2J+o1RywguzPM01tmLkUBwuIRWKVvqdmU/OrbipZroOf9sNDKUjDvQ/pOooHy9CEEEOlJEDnwju8x1yiB+zwvGRm3stqPQikYxR+tutvvOK/FhFPhUcYOJj0EPbiJtjAJdb7sNBuOofgcPwLdi274xqHLyGkunfIYCScF8QFffKm58shCR0XmIQ9QSKoks1a7R2orNaHGIR9j2mi8qOBYvLis7/9jSs7oRjUi0XrQ8Xc2C1BONbjo2kMZmptQNJYAms6srye4bqyUVPzWK/uhJCWovL1k4S0Dr4caw++XNzW/qvyI60C2obg7caFivp1vF9l1xzqC3BP/fsq1o+MQ6RrIPXG7QyZrrGlempHztwYJlV5aC+dhx2EzJ0w4UC+/r6DFA7fPPHs7uKEOmhdpzLoBd1QpdsAxNHO4EycbbYjfBs+wPHzFEkOTdBMLEdd3rmwrugSYdcgs0PDF6eSfGRiQdTahXL63W4qz6xDAP7Sr5p5TbZjfWK13okoAj5Vc8CQV1hXqO2gxTpZndU5pHd4sc03puyISyaLl7zkEO5/l0jAOgj4+7jdLUqnUqpxXAEsgt/K4wsSjPO8laqubLIdem5UWEBQrGI36JSePX3iZDWEtBGNqHnmIQTA6rK1CPpNF0tAubsyU8LAkW63DwdMpksliQix29GdF3RcnmTmQsBY6ar5vizMo91MQq8q66gl+39NTIagf14N93GRcshscp4juLtWtcifa++fhtyKn3MvyPQg9n6gYPrzX0m+Yf/KP+7EZ61maQwSGsvWYnbrdyJN+8AgUix5xoOGpNBAYDbcZLH3eUF9XWTL97h0E1nDXNGTuxRDIBwrhujOhgILEP6dXgKRBQs2H/9dPQiykN32H4G5j1COMBZ7T7iqUL1hWKBQ9DoJGsD8nWBBfvRnwW96Z6rt7XWgfCZwQZ1I3zeOCbuay2cliJZL9aXudIoiJqvLHeDaCysqnRePcw6I3614wg3h12uOufIc2W/z9qg6prSDoL5AWi0wV9QLiJSNQ2TnpqMnGES/6nZltoD6lLh68vSpOQHq6l1ZAf55Re1nyE5KFYeBJiItU+7iO1kw5wVxbCj5tOtYNQt0zSvSEUCWaILsUJZ4G6JR0a5OHotdVnhHViaTD02BFbtaq6YqTGeDC2wpa0+NLkBiSgMz7YjigRjovuY+CCJjisdzFM4FX830BklQOY301QDvCssAAsalo4ivejWwRSdC8i0I0y1IvAUeDg4djf1yA7yMts8m56k7035SOx+a1EHuvPNLBC0iu0pbKF4ct99RvnDe4/URcOjqOMbmypHQBKe3gx8w1HzXUciu+Hx++JkFemKXBx/v1AkdQo6B7mVzI2ckCjaP0YzXhVmEN+MzplqUQY7QPDlDK1yfFoWEqnJl486Gb4Vo3zlB4n09KVGmUTlHGIMQNL0xEe2873lxP1Scqal/+jTPg/7u6KChrMQgnnAdiFHqS/pr+KHzTsUXamNPIDkTEz/E+6g1r1047z0T5MaK9D1UaDoBnStIMg223aoP/b90WSsFbMku0Hq4xt77dQQpQgdy8geQglLSl6vOMhd0O8s4htVEZH99bSRMN+Nv5XkryW7pKauGJl83bcSdFpoAAAD1UGeQizx/+VcwfTmO+Z8dSAYDGyv3ObCCFMjrps9xIEI+vKbal6CLeR2xh6NUaI2o7CenPK3v0ewRDV466WAl66KgCsX9+Hv/6o2AcuLTgqw4mLrjpdB/hWq0nCZNPLBm/7jh8kU/LtuHOUomJH73ni9llOWkuf8lrQ6nco9+2dHPlWtd3DlL1Gj7DjoL6oOrRb29cSA2AgGv9DTiNoywCeof4tJjap6NX2uY26OkfKXJH/oIkuFwJ1MES1HT8gjl/wioAutJLsttY6oKMuWwl5fLXGTcfkyQ3Q7JCBkPStbRSStAIqK6NSGHZiU2LJjZ7jhmiBdIxKHk//4DXV4LUSb3YkZkKOgxIphNUURfE7T9FfifRXo1dKZNzvGPl5TRL+bKuB1E8n19z7xBbRS0U802mYyKBouD44OxRfNgGwWkcp/qKaGIydNPreYvCdcNPUuTBNsYXH6KkGcG/0JcmSty1iJ7lTWU/oIXeW4li9CxM5TbrYPEYSnkZtqgz3Xysupj2r56tfgnRsUFSvHMTz7Ckgk/o411YlGM8sVXFp1L4vv1M9CEPjeHPYSKKLfONaOi0nwke2WyNhNYRv99eaM4CUfDaylUXyaj+2ABE/h/SKV08twtRt3gtTxTnIcSd3/E4ipmWjZwnwuKXJ+5G7vdLwb+HkAs1HNO8KhIc2FwX5n5x3WZG4Nk9QWW2E4ysfEFMhs0CCE2CWuTiTvjNSklc9YwSWy41oyV1jmJ7cO/QD2hzluLdfbxmDJWJYeuiLSMuV0hYBRT1G0r7ZLM3L8vWiG+m5sy6lRgOIQVagazuQDYVsK+yWqQhyuyAWtgPDyPnfAxWH51z3Qvu82kuC4Gfv3SmfXrKaYc185IiB1fPmOB0aFp2P72V23c6g2ndGkAMZh9xIQvAQmMfzqATk8ZyxhsmnXh6ciS+aJfz5UWTIUfWAP1IVsU2OQLbjIZgP9y/N/kuicS4cZk4wKQAzgNFXlqLZ16xgSCTveD5dgV4CdI8AfEV4zx0I6W+fTNqomkJ9vw5BEI+UFQE723hTpHvODSdR9u6Csd/vdW0Z/Gu2huJv0zKwaFeQopwhsjVoiM+THZkerYfDjiCFb+kHi5qkCprXIcLrHVu4QjE+bDap3Fuc2TRN11JC2HDITV1xJuTsRpWJo56QYjNnmvtDoag+ygOXDaWW44yfxso2V0Q7wsspSmEvPI8LOnNYqN3f9y5ygHyT1rKieXqKRUKy8Ficad6sMsV85SbN4bw2J2Re0q1l3FZMIIR6HFZHlk7UwIUqSuVEkM+UVJvliUMrf+rQCgAAAAQ0BnkoM6JP/vcOLLBtGOzMyFqZfTeETd7Pfc/Cv1gMSpAxZdrFQkJW38O5E/fDIeDvnp5INdW168x7PcqCAIYP5DALT0dan3KykL0tlx25mQGeab4IfPvj1yImDHZ8nLuyGYY1Ie1Qx+f73Qe8+xQ4nTLtw5zPrz1vz8N/t+Ti9M+W4hZljWj0P6iYpb5YaIIeCPL/pL+2t5iM7wYXz5jps5pPS/uXYwZMpNEHpIz1Pybv3ef9oodSWuhhad9jErTYMBMSIGEfetfVC3UHQxE+GEm+RECCdN6/bS0VP2wVflsSQcFweyAgMpyYOJcKKJajRNyjg8TA1dN5CAstl3GePqDfzI4D84c3rye296QAAAWkBnkpMRJP/1BtQYneYNiSiCmK9bJxWxMhyV2TZ3KTeVIndcO7U6ZN0e3Cf/5nUEx20B+WKf2s4REpaH8m/5vNX0S5kkZH0b2LyRwuqP1wryRFpSL69f6nvOfqScha7lA8hvwAIcalzayjMIPpGAeAFTZyfCHNs9hqwi/zkkAXDqugreaLRIHU08lmksnCW9SnCPCqcS+nmOs6pJWSvnoqG3pe/INQjWFuhTr0k7v2YHVT7W+V0CxAstGIuF3dfk73nhRuvrMgo9qKAujdO6rW4NBLb/CYDNLsFaxD7d5cOVsWBGaQhsW4xdY3zpHhyTDMAGnmfkjP55FgkTsfFMFVKfMZljb7hNP17qPz7ZovuF5CGOpglujP7P5hUAgSMBAqXaoo6sFJL1gMpAYBbvcuEpAbJegz54uJAbzTqTFEJlO9pKWnjp8l79gE1BxH+LloB8GwwCayuf+8dWWr4+dBXbj+gxYzDJHjAAAAHN0GaSui9QIECAtra2tEEHgPZQPQwBAYD2gAAH80AeoCgrMXSYgFldbv0TVuYLyt1yL824pLush6Vg+7jcSagihAM+Aaj7SCpo/17Thr+fEKyJDdrnTBj0kZrW+6wlbxvhGlgy5NzPfX4IIHStgda4uPpPIVVsRMtaO7AvIn8Tb4sTXCTSuG/OQGmTcwO3HvSKVziki3PNqRliUw7Di6AhjVQx/2fR3ihVTF9sdKtJ9jw48MiR8gcseEdRAuzdPL0uAx27JQ1i2jog1pxW/mQWkLNF+cmIYIIiscoPfXWf7TKHuQ2ekCpmAcDi8UqD574Ez3xrzi5hcrGtEBaejsIr9RZphiUcEoCtdGWCICJyWGYVkhRPpVpcnw4MxY5fdJIqbZs9gPLpqGohnubJjriH8eauPhAfhmvMQyO6BLZmobW0HVE1qPWDUGACnj9KMglyKL1i4BI/sM1C+Rpit06peQEDO1nM7rUIBzOilKxWB0UrPBtV3BGoQA2jxL0UNwpvFldlBD6M4Wl7niMV0pnsEnwUn/YJg0dKue/XEZyhIDtzurXFsK0aEd28j1b9T4JXOODE1SyZSINuEnb62tkI9bn1oMiIGxFkX+S0zOPtpkpaTdvKrC6ukooAVpskedDmd7cvJmvPUXPudR3+KwtAKIrpQMGTiy4DMKF79G6W/qJpJ9iv74AnofkrE+D7spj+CCfcvWKlg45p2RLi7PongBjjgvSG3eZLa+1E4P52JCavj7BOCNSL8Yp8TMtT+CaT/5Kfj1GMJlRkxOnZapeiMt6ROYfzbntM68dZMcnuGIlE7DeEr+9DiP6oGftZ2034UUnZtsb+wOmFuArIRITA1OrjbqA0sTfjzUO42qUmjJsysISMEbhkjyqFlRT7rrTG/9wuvBeTuFbEUOanBSdazoQUa+H6v0MZQGunmIawog47egwQSoNMduMaZ2C/h4GHXVdMviWBTVc5NJhEGCMh9C5YSwM7MrW2C6BG60IpfdNh5Zc5d0/C7xTrk5jc7OmBDXAiCKWgkPMw5Ibyhncdq2+q/Dw+i1qFynrVnfg1ChbqrpMWIH4liOGsVYLJee/9bTxf+lytVEE9yoSwZvcpo6x9dCNqLpCCsO7tmkcJomCj9VzRsujELCQEVStnAcB1YcV9IisNQ1vtKD4YSqC57NqdCRPIkget2ejfFvE8RML24FEjQYeOvCdJYSVEFpsMqikIWtK0PuOA3Ht0M2+y2E9RAGcMSrrQdQSbzoDY0HS4/L+UzxE6YxKVs6B1N1LBlnbf/f9la39WXWbNTX7wtohT4MLsD1qaefZAEFXqj6nBm7kXGzAb9b+bLaNx0AMBzP4ZGGvnDI5d/BbEA6J66scTUIKeXbx8QEgqVhVgWMFdbl/JVtAS/OyBjt9Z0ib6G4/T6Psk5Zms7r4sDS28v0HBpXPCmNONdbiYiv4AkEs3Z/oXJeQdTqXy4uwoWhucWvP2guRzKBPvMFDvB5RmlP87YR8TXmaRdrikKsRFKYww/dk7mYEvQAxUCtfznFicO8tJ6KH6eYNLSfJ6oAaReab7M4EFiHbAB/D9On6eZY5/QYlxrGUE2NR1wNGawNszmdXHhWlYMkobH017qjOiHKVQU3bWh4Afota8WYrRYU/PmhsuXlpApdKkKD0H7SygcvF7tPCMy3tk4/yt8jBIObqrG4VzlTdA4w8BfcVYTgubjBEcQQ3SiYqcWlafoBIH/YVzdODDVnzl9hdtHyYxPUNmlmZNVwEsucOqXlobqCPOOT+HSYnAjgEzf7ku9vI3Zm2d1regF7gw3XoQWqzOV60ziwGVA1UcSqQIbDTJuXH11D/PeXvYKE6jWSyILdGz8+HaYNyPINn3x45TIiY/fLmmmKWKwPB5Uxw27j/S9Ep3Pyvj8yz1PFfwhZyspw2EtPRVQARI+Jad4ugArCpshYFluuKiORIifFuyPVDhpWwqMPGamZ0yvI4UN7PaZIt/vEH2FcbS3YjQw1VCz4bfieCynithIfvrW1Kw08DJoNU00cFCfS6jAQ1o7GuPiGOyIh1VmmR/v7y54qTIOR9NicgtGs+qIqMXEYVJHwwHIyaPNGoUB7PrAOauMNnT3WF3buOBC6MbM/VBBZc/kG02knP+QPqX4kGUcWTt1QqFHX4qWihciU8kl62uQjxMAo10utN/0cwRkZuviwc50QJYkn7GeXnkXLjL+0uRlVTrVCiHpMTbxewAtI6XeAdAz4O3U7xfsNTaHRY0NeLZnctSbf1p6BytsbZSrq6FKveMgVj6HSP9dP6E+lhhvQ92VUEmkdQ/b8J9OHXEsVSZAAuD/9HltpmefUEExDOwWWkcGBEQHpo2QvDU7nersdY2XlLufsGA9pJC8iDe7s0HOKcEHDNd0HdvOvJbLPHIZJA2CrpXdJBMBTdZzzS7c3POawGkqVY5TYI4mld3KGDd0LOtzfD895wO8awAAAEOkGeUqxMf9BZHEFtIQIAtvV9SPmTTz4HcneibbEh9jk0HOILjzmYiILqAIPEPruuIWxz+rVwt21ALGpwJLLBhrZA62HGomipCnK+RSiwwb+L4RV9HcoEmgZmu8xJtTpBPWQWqJrFY5FsAZ0eRKwjew6wRAn9Y27sOuN5dDsFqIrdvWejy5PIW6OQtzANoeZlcpPKkZbQsBocVtJjgH3GzVIMDFnxwjsMx56/Uc1Cn1elA7LVhCTEExMChNpgGNB88Q/esFYn2faSeiYFGMyese6ugjU9Ozy80h/A72Z9uNBSjLDnXTlxXeusmRh4Tvtm7UoOel43UqeDt7nBOsXU661Vv5q3xrpLYW+u3y3ZZcTnmZkZzviPGMdbeFVy73gsx3TQAwAPfrR+fXCYmHDoD62sVI9R1BRTJmsH9UGkjN7O7TGQP2Cu5IBlVC5DjWu03+jL9oD2m3bYV9+tlErPCARUzVuKPPDUz916UkZHs1EsBSGNKRv9EzzXM84cEp2Jc+6XtLXUoaOwzuLBn+qeVT6TFt6uZKE49mrzoKMH3wtwTpweu8+e2P0sbmTfNNTp73usWVEphafcz/+2r98KkHuXIZ3J7yT9zNeTiOu48GnRFlhMsViGRSBkTZ5gJXT95Oy0VIC9a0dkKZKhlN0KEIKhPUJdUYnrBMQ1uoabE9YICiOMWTZxX1ROZ6dJC/qxtI9JEfpUlaxbmpTOZ6/MxyfyCkLv1WzjV7Z+YB3t0oF2vl/5Pc/lwSjliAVZbyMSu66JrE7jydrSUzhzKmMXOA9GcJBa4vb0pZBHSehZh9d83PA3DG+lYFTJI6oZEQ3XDBdbtKrjBCMQMOjp8agCQnMoy6R9GmhvE8SE0hNoC41nwIcWolzqKVsheN+MiRkZmsYERvV740IuhEH1C2/9fhWeE5H3UC4Xc/Xudld7Wicqia3/9JPIwIoIAmBOfrM5TZ94EL1x9r8EWoe/B1TUXauXkB7SPchHel25R2Z8spweL9ZjOn3LVM+xc+FlkYcw/kC1bd8Mj5leUa9dRlq69b7SAR+TG4ZLtsysScoopxEtROzUWVO9EgDK+ESz4i1TjJ2Yi3n1yVL4SvmAsFcLDJYA3LRjzksXWT++OcXfGCHmC5gLtsJUM3pj4s1XObOP0THK+jEgc0KLwdRQGKU9tlN+8YpevHdQ1Gwv5HcMOxx1ZjP2vg9D/o9DURV4r7MXJXbtw5p1ZphqAOoPT8qDuRO0tsoyMvRn7VtjaT7nGCbXygxQEk2P60JBp0RDOduu9mAPo6pbfCH09ujitkqLub/QnRPBRn8W6ByE1m0Qq97uQPNgxaJUeL4MsSb1bysthutfH3x7GuW4cNpXqocnx+1C6ZKe49UTlgXp6liljuBWR/tLFpi/TcuBNHaFirWJisJxKRo8hzsAYem4h86+L+2g0CnYBIm0Pv61AAABNQGeWoxKJP+SQaugXC5294v5JKTAe353vPB9D7RWBT5EKfKE8ITmVXZ5Na74DxyZiu4kvU43XCqMzEb/qm9hW2tl5CKvwpvEoXZwz8V+0CF5136pP3voh/Bmm75IDLFRhucfbH/i0juBjSw2x6fSmyKkMd+kWfaRIKwjZsYOvz7H9abN9QNyP6fWMSrwiowtWcTGZ2jkefupukoJYNF6/clwxB/JA4FDd4c08oFId6UmMv+/hDZUj5HXC/YoULz/UMqnv0N1Vn79KTlAZY+wGcMnIM0cQ5Dponz73gcqFwG7z9Wtv1W1XONjVymf1a60ltZoz1lNh6qnu204lnaFOIzryvXzTdcUc47Bi83qiQ8jKCOvsx7GU7Hs9NYAuFtfOAbR0nqmhb8Z2fAvU04UJAcCDGKEgAAAAXcBnlrMVK/W/lGxzj1B1tvnWyoPT1EkNSIJU43P/oLK1G28B9V/AC1RVpPyOlSp+vh7ypIOErsyWxZIKYWUbW6Owl86YBphcc0ZF7/QRZQWgf89aUM/X0qqoxt0fHZtlA9bUmHfe3gnChCfME2vIjh4u5QDKBzVj6ZxFqC4gLyRd8LC7FUR2ee+44I2fvy2QddHLhIYfqr/ShKlzl42BopZ237G5CZ7BbAO+KMtjvAAhTr16M0AUXPWi/qquePuQha+LQF46cxw71I6wg1a8eoquE0Qa/tCbANF7lw+oqIkr6j+chn6yCPq7uC3JvViBIXTQeqQevg4kKePtDhz6OdhlogIRTNIeGmdnHtL6uGks2B5L5WuqNRzYfjtOh560n5CK5ncFR1+skZGg8TLPbBrtd2hNPBHyQKTaMAIv1MfqgcTLtfgGRiaNk1tepP5vE3HWbH1RvsT1dNFas6etCLyt2W6sqGdSNIjZ17QkjSyXMIet6N9rIEAAAdBQZpbaN1AgQIC2tra2tEOeB+wPQwBAYH5gAAAT//TZJ+Eb9z9kw09XeN4uhX0SA8CgYVcB8L5HS+SgOGWx6nX2NbEu+Dbiri+vTHw+/dskRiP1s07ZLAPgHJyECzh87h5SEuDKo6uHZiAXuU62HTTaasvJ8e5s0D3HtW8eq3m6yjT+2N0e2b8MNT/8oW39L1Ethj2NzLnMGUBNmw6zK0jwUSvp6H61m7FXkjhhLREkN7ONRWLctDrOWIZpbNZBVBCTz+g56+S8S3r2O67DccOFXHrPjwJVRq0vlOccJVGhL5ic3HGgZ/TGErWskV7pLeYUzgGuQHrDr5zwdOTN7WYz2j0uzxiz9BLg3mSkMnAWGfm+t8b5F5a6Xwvbn631hrcNT6IaC5Eam7yU+DwxqAO0bjLpc3ilIfaxlEvzVAODlf4RjhlInQ+oHRl+flmQQ8GCPQwUGxJCo44bvSZnOQ2C1P10bG8osbl1XDy35tgv0v7dPSIWOGlfxHR++QKxYIONy8uyMBmSuM26Pl/yD2N53wqQI6PaHbTRKdJu+bX+aRfVCrPHEjpfIgQRE5DRybK4+hmdgJq+5bgzJftppM1KtrzajfMes95XlGVh0L6YgmXMJOwwjsJHl2u/ZQ0aQUFOBivr9xaTqTVSS1mpNP/JPtP5h4x7cMN5jCgtudFmO6fDACEwT6AcTWFR4I8JZpcpWE3UfqL3X46BqiBR+tU8lKd8yS7pwbtzhgdb6AQfStSBntr2xJlDfKi+hPRQ8di2oWYNWkcYC03QAqOD0seejLevjeqJGSJ7ELqTs2dqunyB/rioi6u43/JecOndz3bTx0LXapcF4x2nR6QotY4eRoUI1TPSzM8CST1ItAyDUk2F3a+6X41s22q9f9eD1uoK2Vq/AI/zzNv+X5n8QtqsIkbPxi8O2fX7FfKPEQ9apC1/cGeFrp15CuYs1xXczhzTUZB12Tuhbt0ticKVBL7kydrYgYuBQLv4seLaK38J2amEVF739nM1tBTUsPALb7T8A4uBbNQeZl8hheaMnzYtuIXxLl5OmYGx/cAcmSCkLkrOjnU4KCtOhnVHe7sGBAXDv215XdzoYH0c/qGS5TEScPF153LkbM2UuzvGKcw196PNTHAzwd2r3cT8ko1/UXKf0c9eSEgwXmncIZzuUKdQCrP9xMgX7QNKSgsQgquoPjME4JvzBZ2uKHcri3IroXNCQiYbmXoO3tv9J+5YTxivLhxfbb8G7kpQdoh44BlhLnqOQS3HBmTJsgaYbvb+XPlEAq6a0CMffgqAWrYSavNjGvXDaPBx3V3vPPz/KIH9awK9jWXtwQqfm64ptNFyM4wCaxK2sS5Ak0j+LzYkCKEZ54oYUJuCQpzvA8KZcKrimpPYkKiGLdJ+lkKV7NBens1YQkDhO/tbh5he27ToG4lSDNJrtnKzvoMgU9oWbNkaz5PuvtDoS0ZHiH5s6NYTTOfz3b0GQ8H/toEV6hJQ2wNY+B85oThM7iGGYOV13bA7+HKsMCWyGv3Y0jRYA9IsXYjMV7q0kr00iD2ejKYdWAsf0QlJ8TFEktaxCQKgSWGBrN5WfNF8DA4XeDPqxE/qia/4dcc1eAzafmdMb8eEHxcPHVck34rOblKZ+0G7pM/iifgfvFq8FYaDldApkPffgIx02gUnk7l15fb6LpYjnvG3m8/nPzkA2AJ+74s0E+funoa1kbhzhFvUSCs/SYDjxOwqt5ECAg/Gxg2vsbbv5Ck2AMLIr5vJJ+OGAmLGxoH/DP5lPE//WtWvLIToj05r1VMClNKw9JBLoG877Z2SVDffxwJyUsHzWYHQzK2vKV8YT50Qi/MOK5ae5dmzi3RybdSuM+5Ns45Hmwe/w+vdz8NpLENHfAZfFs12aNpOjSnWhWnZhV4AU2fwQi277ZbHbpUI/Zxpg7x1YRH9B3aSFbwPHXNtS2K0FH97W7BKa59rSqbJSprhUbAuhcBO/uhfjH4tQQTK3H/Wog8Vo0vwp+2f7BnjqAwVEEIAU7/45+a6qB88uVxD+kAuK9o0btYEK7G7SLHoVN48Y3VVQoBRICVkGuM/ucbFTvqsdDa85JEBETLrCPIX+3oi1qLqIaMv3aW9XY9no734wyfQrNxmiCnXzvVkmg8hDPAx3hmPw2Qtt0z9JSm6YOIq14nLmaWVAuL5kfLBLsJBly2aNVvOAR+9zd6vVc6PDBbZhOtXDygPMRcODEOJFMC5mxm1kngF3pAs1NKPMmfUkmEVMyl3Yq+q0DkzL19mOVKb+QXxdRPaUn+cxTaBsKW/hT14oM/RhgSLSpglOTJ0eTUgXBxLkH0en8Q43pNkUqrLtjYWBX1iYGDZm7FJnwF+KRcYFQWX2K7QWUOH8Q1puN1hc1G3JTuf9+rRbmEbUDN2PcqqSdq4CNJW1iQR4cp0gfBHKdvOZ+pA8258YUJKu/xE8CZNjtFY4UpMYqGEjo19fViiDo3/4StAAAD6kGeYyxcX9j7sTfEhI8NslK+J6MotJZxOfZ7OXfKcrg1aIus4MSqX4RkBoUzbcCwwn5SGjd8xzVN44xETBk9K3s4ccPkCafCpzZviXXbvAkrQZZBMSJLImJRWzuioLDComjTvRAbVZNQ5wQuc5GosbNXEXdDI7BGjJDqxtzVRW1NjN/ucYYNzK2470Gq4R68sqOxS0WooRFjr6cI8fxEgcGfcMN2PDMounjSG32hyMMp5xBL2xwScnG/4PR/0U8p/U5Ax8Mtu9zzRj8rUzuK9jIxmDlzQDjkczEXDN9yEZBqDt1hHGsC189REq8u7sS9qAREFLBMrlCDc1XznDE3AduRUCld/oWJ7QuYBjb5OCnT2KiI+TfIwIzJyxRtlJiJVf6UaMepE3PBJ/MIbmFqp9dHJ79rqAq4WRjUO2GEbdHEJktfbUu0ICLtnoIH0M3NfNAKoJSs85XKFZiMPdAOAGNKqMAn0oq5r14dJzHL3pXSuBlr11oVrBpptK5vtuLM0XumNkU9s86CPmfNbmin9of7xTedKi4EO6eEn20cO5eycQDgFUFy6mUfsb9SuS9iIZS4jzB686MPiALf6b3L3ql1xHuOZ2IUv5Anl569z8FGUiHPX7gMM6E2BgA6+OPaAG+v2Il5frX4w0gKpgWteISEgiJb5hspG8hIrICRYw3z0WohmjgaBQB4jhIDgszRt3cguw0gk2QGrHS3tM8MHjL3OSkbTUKlpzPyX+ZtreimOjBZ2mvvjZje088KG/r23YfMZXJMbYCmmPC7/V795u9JYT07qIxVBToBEfECxPuiMVdRqBI/LpamV2D1IalE9zgT74gDGhmA1V8Qk2WB0Riq0X81X5th+tbNuoAM2OrQzvAua3+ddOcaq/c0kaGuayjSQtFH66kONc7u49cEevjoZoDC6+L5+hErgnpGkRdxun8XuzTvmRZHOaBDH3BBdZt+Cz0NL+GvLNuPoaUWNbXdXub5LJWM1W1L+BcbUfwwbPSXVj+JoqSrGedmDwb6G+gpwcacV031sh9za4RsUKwrfwceM8e3Li+tO/+Ol1FS0CbivoquJ3dx+JYwIVI/RXuFR87QNCU9dqqW3TIdDfLFE/vPek20c2RBOdvrKbu6g2co5Nhhc0T1z/bqcMLRA5IV42wISZ4lGt21bfjPUyK4ISAk6k5cLNA9BEKtSxcPNLSSKar+xZDc6dh/6AU4HRUWVWdUE2FQd8QSYg9y+Fpi/ocNDB5U/rjFmgPrIy+HvLT40QC7/wAlMpfYlG1GUHS46wHL4w2XnSCx2pUci4s0RMAf3t3QqIo8yNayeM8f41MrKAl/8a4C4AAAARcBnmsMWj+EGERJ9VpWeImo6NdhCLLfb5bvS1rwMz0b0qZEYNnJ3Z+qIIvqcpAfOEQ1g5LZu19d6AqQtsjhk3rrIi5C+j14YC1vQuvs3YHKNDqZaPrfL/u936eS6iKNBfnsmkgOKzLjxAateYKrHMBun3Oq6UVv5MQgR8srLZlmlw0vNxW4IoNvi3eBo8lwOhUuON1y45RiUbJSmuIfZ5yI8CGw2YRbGoeMz2qGpQTpPbQ8bb3Y7t1b5icSUIMiOFVnfLkk46d+e3a9ypVG4d1NO7Gm+Z5HL7qsVLfsVfd9CVPvygiyzfDjaC2YhU1PUEEqoxvNVvIPm/DhMaS1nhpxVv7K6q0RsKU1skOLIiv7GDZgPndsD+MAAAE2AZ5rTGS/pd5Rby87OlLHrieUD+9cTjDEX1JLODkKRQ6CkC81AMWCN+kuW21/paX8lnKVeK4KlyZ758rJee72Z5OHGNa2zb7ZP0x+uVbC+kD9kSSo/Z2rCuL8WnFsKC8QX+Mm1YMc4nZJRIlEsRJNk5qXydoLDMmYetIOK/Uhn4Sf5zykGxfEayzlzJQ5t/MPRG8P06LChytPgRK2vd1gZQPfqOzbOLLxRfCwgCSTY0UElHFB2poRRhTAOy2ICbujAGKs2U7ApnXjrz1Cdzfehyetb5OTrXyNxW4TlAqRiigpxXnK6zcooUzFescOj75I//lV1cunajysohrfxzU3Bdu3wvVrFBaKd3749ZKTLbFJnLByk9yMcROdqurqoCLhnDP5WiIHM0sQsAWesRc1NNli6cUICAAAB3hBmmvo7UCAtra2tra0TKYAAAMARP/PAY8X5evM2wzop+7SIxwxdPc85o0QWTa0JMg+vdzJ9TH4XnS9h5HwQpqP9w46SE92ue/rRdUOhhZZbNVmch53pUgevI2Y19E1cOgKtCvxzDe0qwHtmZEz0CTW2LTJAdSFtD+5IRZUdaFFYaQ4yJJiSOzsP5O1/rbg2Rgm1Ii/smSHS0fbX24MtzwTlUmrOnprmZoMSOIModwQzrWD+XS54/uQECLd7a0UVQaY0zj9Uf0kTkOTla279ZTnglQ95SBqu5/5aRI4VtXq7I8F76p2DSPYN5LR78qIjjdcmF0l6teuRLhe4EyGej5DNp+EM7aFuhBJTbclUR5d4H7uzlXmejqEY5X8J0ktwW3/tpTh5VzURk6aiAJAQoSDiJx4R8+u6GakVMLVBYYQkDxbPzymh8b4ubY1dEnV+udmCbB9NEcTpxtLuUCMH2Yx6ogRmwrvatG0YvLdIR2kHJwQJ/BuU8V3444qRew7gzNxaZ0CqZle6MCVAjFNsMCQooB/FcT70FV/AM32m5l0b2LG3ELM4syzF1P0DB8UWbJ1mwHfxKrVrV5iWr0NOfMvY1zm0U639x+4k4Bwd4oNM1FzZUhL/APeBtshpDnAObu1qLdfwJ6JRgeug1Bgwu6BdX4mT9J/T973lBIxLSmw73RbcyvdP2ZQDy1vM/LeOH6TTL4hVzcCgEuOtdHFq8+RXKq+uMmusCmqum4kawl4da2GWBlE+xWi/MLMxkzBAPD9jGzFeNOf4SVw8mRtGiI62TXcnuX78SOmPnEzICzhRL92PfQV136J6uCVLc2WVPUxj/NO9ItDUkNtRbMpmiMMFKLiRIrKrsPTHSBg0S3XhrIvQirfEqWbib2tu8TRQbOm3+JdkuQaLMSFcDe4gsPY8dwk7fv4Efr2mddcKuN0swIsND4foT2ueX3A01L7oVDMTxVChTjRY8uHxi6H0HyT5EElnF003u/nGrA19OLJ7n1JiFtkbT6FAqf4DMRKodYLX/HfdAg3/1nmc6QMIDEiMdqAbJm74MkCpq7Fre2i5SFC+Ocf40aSDbJwUvG2P4DsLlupPEpakXLGMNKFpBxWx1Ee9tyu2kQWQizOLjyIScHRRpdDUJQKu3yhFwarb5ACVPEhwSXIl4xus3WnxjY+K3F7P0INhfw+WO7IKcvgLyt1bMoIEOHwP3gffDGhkVL32IoANSrnTtcpHeY0gYRflh6s6Zv5cUVtdyoq+7D6D1e8OPFO0HaoVAb6qkSJx8TQb7ai+ons2DIxk9/0rjiwndLLUgZId2u+7UJD6m9ZEx/q1oeOzniyEc/I93SLnMu3Xq4zDUHM5oy/MIRTGviz2yzGKFi+dS37y8V5ofMQ4LzqzS1H4rPeC+MmXMhZKZfw9Gt+YljQEZ+gt5vC28ABS0MBe9jMKB0LNpxN0klq+CCWGA+yeDZzb653sk47YbCskI7Uvzx8NCviEAoAAajErkeJcHMig3QP62gPI9Cmyy+TKnoyHc5uekRg2SgZZVOcAztqBeMZ3yxOiDZUJWMJwyOzpLX0GfMYOHLgB1WgleGhz9qm5xfgXu52rnIpbuDtTZiZ3jcC0BvagClL1Hb0bGgTise55SUQ1Zkk+gL70hRdRxZMGtA8S3K5qD2F1Rex94kPpUlvFhWnMJ5v7ZhwPdtF303o5Q3d6/s2M94OhB94tNZcyLL2U+kfuDtY7eCi0CvB+TBCllNst/IGvbxhwfSZ7rzAiot38PjU8Ja9sAzvKcbM4qNioTc4BoiWN7nhqC/8G/UIr49dasFnV6xoahiKL8oWQJ7J2WSuJ5Z7hGuIndPEdekr3r9HeKt66Vc3zO80ILcS4iXUIrCkux9a0wFJlF5ewN9PVNSLt968OYWIa94jBtEeU8VSqZRWP/Wm97bqxCSoZuC0gtglvb8kJkcNNEDmx18Q2HL/LqFmQNGowaHbD6zCULSLhcLbDXNOwj3+3rQSYAsGhlIYQOqxx4RpVNkUpgL52aIj2xrdRudHqPQhYPfk5CONVwZ6fzpra6rbxFIUiTFp9HZkfaezJ/5GNIHFIO2G+kYf26JeItEU9VuI+yuKm8plw/D/sbFekNCqd5thr8BEzhgqTIZG2LOOf25Jl9EFsx7TJps8vV03ORQYJ1xrRKC5GVaufHye5UpJ8kbJsfG71YYm9V9MKfX2Xq/gm4HLaG4KavTTnidy6jYsFI2WkwjEQIUJth2sn9URua7jreXG+ROseXXfHCLO9xmmqeo68qcakbFbo4yDmaHrAejwzf+iHBxI2meZmhl1vIYPgoJRzqc6OnLlTqLe7/RjGJoUbAcxs3L/7X0Q1MFipQWNtH2dhu3g2o6zX5S7Qaeob6SMXLLhty2ScikdWoUgR3u7hzJjXnpPQQSlhM8NZybRXzUpwznz7wlagHwbZjBr3gy0nPJdq6yzYY4lo6YlaAxg6QqbjbJ3QFQ8EMkRtXNVgr81dtI4m/tv+uIKR2EXKIFsel41B/m5ngJuHSPHHePzEKbL5o9yqTPAm9gR9OXxAAAEkkGec6xsS/+6Sfa+oEFW5QhK5HIhlxEX+DwzTu28jVIae1RB2yXD5HvwaaBi5lyogtoadB2Un+MEg7P/VEAIiJJe8ddp7eWVLWMTtO1T6TRkGgiMkB0ywYZD6rzlfo6pzWhsLpV5Reb/JcPeGvC1MZ+cgkIy2hzfEZxRyq348dyauq6ax/3p0j9L5YcmWEh0O0R/hkRG3VzCgOOIeq2+kAa1QIrGSrXk0f0f8j7C+odHhNlUgTnNAQr85TEdiZKul2Wa93Y8HIIuJwlMI0prfvjaZ9K8vVGXnCcP2iGbsNzn2IY8Hc82yDxJWaC+yoltwSjLFxh8GFIJERu6dW3aUhH+mCow8VpUU28KnBrNgseGaMHfNb22jUhnXwSQxUwFTYfadRcoFGMiESSTR4sorDsc9fsXBi+mrt8QWbCv39UjvZ4RcJZG2DKAYoslZkbbtSeUm82SHBynMXkzTMO9KvCJRwp/mhz3d71geXVpMOJ+xCT1ZiLqeJ4LPDSIe74KTO3qdgnbul7LjpFr+D3ewRMNi1bK3edppAl/0Sp9RXplcZxphBHSPS3IWCerwR2Xw1/1YzeJdcICk/0mpCulx/UE6u3p5LRKtVn0XZJYWC7WnvVPT5zyVMvmSEhDZV2lo3VI7Bn/Z/2zkX0iUNcEWlgx4EmMECSe7nGt/s0v7ZnPGiguC/1s8AQd4CR5AdZh0EjkvwRr86N2F690fy0cHFPdlcvtVDRAgkKSJYT+p+iQT+phKsW727omyzm2O6mj78H2PDxQ+UwAhngYEgtwLIl+7qV9S0+dRLPXNe09FsSMmVzVnhDU3JGdKkpYe3XsBIv3UG9VPPInjbhEKfZRT0Tzo6Bm1Fa5KcPPLA2VKCBT5GoSlzIh0xANY2USjBSrsVAijMqKTz9ZCVIcqMRRADLrThfonTT7nUzmXucLaDpH2u3S8M664z0KZF3JyAhC61RatQwz9gqYkZGuQY7RqFKo6AiW/irq1IeBV822Hj0a55tUVDHqrn/GKM4akvQlCBhoPWsdx8nrlRgg+OZMHt4FbQxcGxf9/a8gM131ex8omTx0x9JjtS8YHcAn/u+Nb7qgpSY6F1fn8/hB4fRVK+7Bztyaj9ZWNR9uf7/V7P9N9nfMn4FqO+34wJOmea7mLPgLv579rxtW8/pEvXWg5NDo5WqQcvzbxVdYSMDXxpwYL2MISZ/TmFLq5TvokW9zob9IC/udPgAHRUlCJ9ybhkmGJgNJA+0ofZbXuHZMk9pM/Tx6NIIUWg8vA9mTFIFVWjqQK65qUv3g2DHIusd1532hPB4Sg17MBBLHIwIzrvhfAi+/iNdOifTeyVtlEzv92Wmblzk8xUG7/piYW0XoJ0tzeDBLCM0rFjaiGW3TQrIXt7pqzl6XcSVEtTNTRLJ7jkV97PvqTxMzoCGadTDNKg7MvibjzMsxnrNKfyPF9XqBD/B0IKm3r9LPVuUGAMMC5NYVK3frM9DnBtMpef4wNYBzvudoB/zL/185K6ZndnrR47k+lWmf+V88Si5DSaT3M45JmFIS/nFRioN8JAY2PjCIVwAAAUwBnnuMai//h3wWn3ry1v7IYpeuAXnvQNajEK2IUoD+PbIn0v3Vky/ckQ7sWDs7CX6Z+c2T/824Icb3X7jW7CdHfP77u28ii6LE6n26PiFgdaW3xPbr5eE4tga8LOGGlcnRahV8taqz7PZ9gq5AxPlSBD53ZJ9U8YhkIALTJLrIk6+p8+/MFkl3zExmFRE3s7z2NpjIFd4Ju715C8rFg1NYABdW6/6X0k2Xj+zCDgEPywZtrXcbVtyNPXI1j6qPfQXNop62MNe5GtqNnq7xLBn/ycoF2qsxOT8BV5jy1PX4wu/7/ga9vrBroBGMBsW7G/rISN+rw0roy6BDiKVr3ZfI/6uo00idWBWEX0w4M1FVpCBdwUCQucOsWIUlHdQaHx6QGEKVaBlkWeCUSlHHHTZ2oYRNXn074xl5lO08zyWaSIjNs1s4zhHuPZ9IgAAAATEBnnvMdL+CeTT7oKl0sRjG9zNemYQY7Jp17PA8k88poDn6AhMz6p8wRfGX1AMrSn1t2xvtQ0WpaESJLSzhC57n5S4C2axC8MQK0sEr61J0smWDuLL3Bd0Q4gdYvYN1HrEvxXOtA4YLvvywAQB1+RSBHF21+soZdgHiR/p8kPE/VH8z3bDcFZ8s4PENUel9AYjZ2oO9oeC1d9H5hWRSo0nSa7EMouYh4DoiiRsOsjsRREQOmbnsLmTsxjQUYRVZtisgSf/JofAVLjbzn+kL/fT95u//7t3h2i845kkOfX+vGfkNOp2AbWqqo4iLpLij5j/oKzvjsvmMpnll3+L7tm7F7lpZn3WcM6m3lbhBSyaV4W/QqFiv9GSiLw5SgkKOkb19QXwWXUWAk7jKe/mvlm4Y6AAAB1BBmnxmoEBbW1tbW1taJlMAAAMAAif/htTB4CtqFM5iLUjsOhXbNnWr1SKf4KEgEUaC9z/nlJCRdLnxDh6l6xkwBiTBfmWBNYF3M792uUhT5zDQ69ePeImK7plZtsUoJAS5ZclEekehqdp3bMC7jBhQy4BHS/mdD8HQNi/pntpPBpg15cHJz1okakxenJwk0rAFKH1DOg1iGb/H9ZWyQaVtIaM6iuNBzAZ1s+LwYu1dmUaGzv4FQjAvKRtuzcjYDfF2zsWYokLrgFXp4x8RH3NfgdfSKJmiG6bZ68vpeKqRr9wsPMZzLW+TNBvfgJdr1/YE8NfKL3553BZVu49iGzrMveFIq+Jy4bcYkveEVCqe698th56PyrxScJP5lq2mcq6IhDaW44qcHlZmrwWYUqilGQa2EqNv/KanRlC35eP8Gq+vdn22hb767FcWAwaNEZxxD2uwpMzsy2dz0IDuKwSqMm6PQ/kbVvtTqY8uVIz5t91UmFCFTAU9m+/d066E5UukxWDUPqtW1+qe1SLj0h7DC3ZMtiV6OEjuTVjxRW9oxVeC05B/C/sElmbUxaWgQVUoJJRpeo1r3VqJ99xqkNeMXfgIys2dujflUqU/RwEWHDbLxnbCEgo4jSjdvVjyycS2l+bKNlC/TW1Y9J0YXfucS3E+ohibiLKHuHCyMtGiEWlRUYp3iCFLIO1jLO4ItejGkMd+9H3uzDo6UylERFuwzi/qgdifIK5oAAzDchoI0KoRTpXK3yc0Go0u+p2qYfT3A6wRHxWn/l/gbUy51aYeCX9T6jqdB8mLoeEx/s0Ywn0/4Rey716De8zHac7W9ZrqlsfbZygTmM6GX1zEjWPsR3NyPgsyek5iMPzedQoEVuFvBt/Opb+/ZuojUL7ZJaP8HIjDT2+EJoYfQMjSQQqmccvV6vt2gVjtvxm660Nt01RGh7JGzCH/WPz7v9H1vzIYuMBWs8fLwIib9MyEgz1/VVEuIjd5fnavwb7IfwL54ILUfik4A9eFnLtc2vK8TbR2P5pHit+3gsHhxd18ff+KQcADhUQnzZN3qt5ZoGRyABEdRNPHy6sC4ELi123f9tZqLW6TBY7B0bVmD1XJNf7zasUeD5bngTJ+207ACX3TA/6YXLNAxiioCpwz+OFFOLubmzlIxyoqhx5Gl8mYzVAQLt2UqZCK3I7gM1dxOCDsakoElFiX4g8d8lEDSFhG/MfPGTwvE41zBrDsixWIK7f/h+/n+fEdp7UNnNRb7sV0oNLfKJhMP9cc51g0fiRaJAaMqPPKnMr4+RUh7uXm7+K4UEhv3JodUkIPJWAvYgW/fTRaLKCYpiH+wGUaUdBP5o/GJ+utGS6kHWGMPZslWO+IVZYco3xaKAUCoWwuOYaM90h1eAk7K6y0dxfkiyWP8tvqRNtGn0Jd1l5VxN0T5PGDxIxjjPAJ1GlQowbyq3is2yDnzLYzlzanX78/aMZ+EYWW+daPNuCBLUxnjIJWElsAzevkO+EnIvgHyVkdMHFQEatcizK+s2USa+rCTdBprmLq1QyC+7M1TzXKfIkBPyKoLJAZDSURuE8tX3v5P1G0zsOIsomHY3C9GDmzvvVpP4F3VWRtAZ2kOO5RVRHgsOkw3LWJKxSeRls8rmMvW+kzS8oMKNmLHcQ7JbPW2YApEItLBf4S+XlU452xB6x0rGDyRqS9H2zBgfi6IdKlQ/EAwfs2TWAx6yFgx30rSS9CgqjLDAjjkj8F/y799Zv+sIJL7btdm1VZOSw7BF1GAenUg3JV0UhCAdYZ9HjLkuJHYtGgY2AJaeZLVSC7FUKvOvWQ4VnW/hJHVa5huXBZZK6PaM2FCg8fMzRObp7FBnkU/pIMvgccpQCoMBbO2md5PJIgmo3PfL58gBXtgvj3CmCxRjKUSUUoFYrbarWO1lszelpFLagS4D+JP2m4fdojLhSREwayVfmjIFm9qS1x7/fCGVNF+zmeN9ZgiYO+689TTpSbo03D9e+4NrJV8rNRcVNu2OUIj5S2hF9aiiqqBQ/6iVkf6iP9JBW8D+vzU7R1X3Do5ZIk+2OOOAohvf4kOX1uj4QpIDFePuo5/68PoRdYQhh2ZD6swvM5dd1DLw1QjG80E8yzAFWlw02mItc9MFZPSM07cT3R31uqHgxW95nVJJmLBK0zsDJ3x14Iwc/zwkpf2zs5uPAW0hNqoaXckbxG5ZIqomwZH7REpkMGfpr71LANDAPwQHhKsQDd6net0yoW09yOaavO3Ldr4ujuZn4jYccsB9FT7JEkVLIW3MmHX93JCESWvpxjvbUkXJvDiUEqO0Zb8NUmNojQsiZX9Zz1eqsM5WEcf7CmvEad56VrYiw7hwRakzhQVyonykoii3qqdXsvZfp3YgQClnSEJSj29+ac3YaZ8uOJRTDGZdMkkG2Uk4CjbFgZrkJ4Ft6s2/f/yNTbB9t9kj5G+uufGJT6Ru68TPgDMas7nEy0/AlgiHZ2GPwBWZSNmAJuoKcXfP8AAARzQZ6ELHyggh2X/9wmPjQMEPrtkybPfhw8aj+GCqtoXCczq8G3p7ohVjxjza8aEBS/smbkAgK385mFCf1lYN+eMZ2YYrObJFYiP75m1i5kfb0EAGBBm8FZnth0MmXqhhHjfTVZRS//r/fh6mb9HiuFWIoATTNv0W4ChZ1CarIEwRutJhCL24vC+wCpU8f+iOkdY4Hv/LeqC7QZ/GmsYkmJ2J6JGq5SG11rV7fOjS4i+PQ6JjwWzsteRNZ2e3gD+QbjC2Wph3j8gC2NmfK8KxOMW/KEWTaZEqd2tScKrsLL+gAv8cXjusu/i4xrI5vjpAauY6XLnp2IF8Pyj+tunRNfWIpcYgt3fs5EPdTg/OyASyhrSl1s5Z+NvEKhknQ3cob8pN+h+olmflP2JN+w6hch8cAMgN4Ya89PBxEdTyC2PCl5TnUu9gt/Rhhfnmc0WDCwbgklJnRLatG0MXUIelFXEe/ePqs+0r+eIm5nTfIKK8VQqDCr2KKx74CKqcyzbLxfYmb8ra2YNoBwhDcRE6BuW3diBML7aZIc5/zgMoi0/4Vldo3ize/GKnHqeRyG/ym6LpE7UYLKMWxOWcT6EeQSTRO8uYybfix0xJIT7m1wbuGWz+SG3VgkyE8/O7+2ZNuPGib2yTVsz/8q6zPdlwcWbaocXGT63s3tW8xo8oTlfXT8ZGHtTYEL1UFpczlreIhG45sI4rhxdoMARWGT1PrRZqGYSvVuEDg1p9GVXCV6ieYJUTazpFdRjTvASaZmcPbpeanrjBX4nMPWmQTZURHETjeHIeynZLdRk8muMqE4TnLJk7Yb1+Aht//DvTgypMBhgKBngDyN1hHJ1I1aUASxncZajYEw4BAS5toNMOb+8qZ0kSy8euLD4XQdpERAjwIzN8dxM+pnXuX+zqSaTe1/JRa2FCzm4NscnULsma08M/8HIAZMCJ+hJEClkIZWOrB2xVjqRMwy7fy3BOyPutOLjvA18EKRYWeUgJXvaxLBS6Oz6NCOIN27AY20gDoUO0P44U0HeMs5tvajkD/NgsdYpiGDsGNyIAE2RuwTUEu/S3XiBJ3Xaeop4evTpnDdWc8oKOg+h45iDmhVpol/0+cb+B1VW7PyavKVUxz+EUoXcaZZQcQ++cDkjkDWz4OQ9lZVu4GaPhA6KHdZPVhxJF5qGB+Ui+DbbSuAkBxqdLPCYT8FauDbihHmzAzmNnI3w9TKXPeeVh9OofOzd0aq7ryfm1Kpf+dYccLojlGacX/7QyatMsmiYEffuTWK2/nptZMljNmxds5KGg+iFFSijsMt4S31aaQUjeFf9ZnYAOIpVLTc4gf+Hfq8cpxAPT922GqYkO654X3F02vTsNqaIe+UErt96NzdT97W9kcLyLORyRYQV87SjabUlDRGZm4jMMgRf+psPDe6ldmFFYJQrYPduJOtrE+qp7e63GsSJzsaRUsgZurLet6q1nsX5Xfq1VJxj+/26foPXRoouYf7oDFZ6/EiGHac3529MV8QThUNNIN9Z3gAAAFYAZ6MDGov/9JllesJdCe3d8pSULmInrg5tmxJWGss2wZB6we81uXjhNDn6atfM4bCqa/M6xOtcDMnqaKxS36jPM1t6dbZfBpqKQ1//qH++QHxojO0sdwkN0LbO4vvBwC0T3VazEbRnW8IIKI30RlumcuHJAasCbDAHrWnfGGBTBbOJppH2R8zOiFQwJFgPWOGVtUECIgsVu0altBM1jQl8BIByP/ssfhUOWVP0IIYxZgj/ex+5aNFymfaOTKgPnTMTzS8bqkjix8DKzwDak3P404/JSYKVaZD9O6YtktxHYbzCSU2LBegYB42ZGicw8RjftJ4JXQyCSM1u7HtyHm1CcY4Mebo/6RqHDRaUpSOrANgjiblrT6A4o4JeMV87U2KPEtyHWnxg7O0ANWJXOuTsXRGSw8C+1wOTsObMkEtNAUCTzhuhOb281l5lSuN0HJ/zREm8pJP0vMAAAEOAZ6MTHS/x+ZLebQcY45D4XgnW4Mcj7yjnBkW0/sXaNbeOfus5TzVdpWBkjenEyUMqo7Qg627C7aAVjwSRKN8ylKtQj53y5TzB9kFpZ/UfILNM4+H3D1u3ldfKw9l8ITLVzVJ2Yfby1q+3ZukqsHx5lE2Ux0o+94v3OTGSSu2vFgNBc0dUpUi3lOThvvYbgY/+C8XyG0b40Lcom9hQsVwqpEokKWPFKdLg4OIZeH537B7OMYTlr1pVxOz5H040Iqae5gODs3k9hsUzvdA28ruIizCLbr9EH1a0QA6i3jgGCrUwCFO6y1fEIsPelLgRzMjcOcO8lsjVbEf8Ul9gyo5uWxoCOuqaLqrz8OHNHmpAAAHs0GajOagQFtbW1tbW1smUwAAAwACJ/+oyGsEMEqltreKT9UPNyu9ZJfF/wKYUWPtruLwGn1LzzImFMihE3s7g0sgudaQnmffaVPMHKfQRFn6aTGPAz/zRxHqmnXYsoXTFPi5DQF7XySHBQNryp4ZEDxqmPWjpp8r6jrTccPS+k0617uYJ/aVgo20pay3ZVdQpDD7VRumdlrYgu8B9GPtK/XVBA7WnC+nX1BEylgrJdTcXbsirZR+0YIuy6aCTcH10dTua1UymSglnrcJ5EStB1o0cNT8LUYFhFZnXi8Lf1UX/R+XmiHyHrXrBHHz8UhmyW+FEmeppLOtOh3J888BXZ0LfKT44Js2guHVZosY9vyKE16ThV3gs5VpEbemuPIjNjAL4bNg8djSyu5MZxRAJXdbP75fgXlQvyJB7qBwhuVlUvfDwq+d573Ha7yXCFbaabMjpg15AbvgiXHV9k6i33AY+1QAdvOZVoGTccUAVIe3liSleRmqN8gFhRq1HIfIVeQq3SsoszMZUyw2ktEiJjz2HLNPo71jppMwD9PQarvPJEm1tnkVwQ5myiSeIsrJKZoiE3ulZw5rcizrzop81UlFUvX5PQjJgrWxCEt9dKLdhKyPrG5rF8ziAKK/TnCOHE6syBFbc5t4Os9ckw9bD3zcYstOv5pn+pAA2BckeSiE5AnSu3bkjzkBmTUsG8ybeCbnZCsTUQwzp7wHIYrbBWrei7iSYxwGn+g/407NaJmmMt66DywCs/SFS7nxXX5a79uNxsRhX17AN9q+ouo9CXmd87Lveq9UHca4pfPsTUfITsLKPQtdWOuaw6rjJ4rOWXdStG61eK2b0ypBLA+efO+eA4oI11WlorsGkknOSjG4dSdujZ8gfsVKO8EtjrDapt6cbdIhgvLO4H6a0Z3fnJq1GdkML/d6vTOR3CeKRxJsUzBGaDJnp21T8yJ5rI5me3zS0YeRAWHTkvNUpbAHtVoXQ0xyi9zwXSe3x05zENuorZMCkYCs+j1aBVkWN9Fk0N+L4BzNEk/f8EjKHMGIgfjtad/H1Dk0FYqUc5m/cMj+XKX4aiJDTp5zxNBZpcdWosPE15Q59dJrJtFN2FYfXvII0ZYF0USZr30FxXV5D6D65QdZA5lVJhEiQRHuIH443mbPNsumBJvaK0cTYXKwPChkDBD6cfEX/cnnYhajBDxFXF+Z2um3bKTDFDJs2uuMjx6+nWDFqcSALhjo5QaWbvadrpEh/uYXRPLYv1qAo2PJS/xO0EAfEwyz923tAK1NeJhC5Vh6XOsRoHCObn9gdJ7D1FxU3gBzJpV6sBiFv1YMEHJTm9W8djTmqOvjvPzpb0b8MYDHcUXeS+17Y7yF2OVBc1YQ0Ag58rE9HkNmeOoL9yxXfP5WVlQ9XBKhhFocgNlsv3yBu26y4FQsuqbNjWUiR2LRCNcLPpYEGdVvvGX99Ylnuppdf+7zQ1Bkq16HJDASrFKoCoeR1YJ6upQ0UhwGKXZ4WbZHHR07o79SrmnhgkSYgbXNz5zk0EBschktwiZdgsCABeHK2PpNweyEkBzN5pMaZKRnktdULqg8sMf75Fw8D/T+In9Y8fD14OpYODpUNTl14W40Q1uHcj0NB+BRp/ZIM+ZJ1BGRufNdv6YTtqyJPAbGq0NExmxj5AVlEZhyye3+uxF/fqJqdk7ZSoz8jzHUIsZLhnZ+9eYYVcr39gq1RadPM3J1wtV1sqlXLQK1uxGFASrVfcf26U1mWEsObcM3gmtf0B/Gfi2M5xAQW+CD5kgF7KXaHEuUoIMk+45HLGNHzkitXRxrk5CJud123EaC7/OqLTEINGpYQZuMkQ5EITa6zQInAJ+/uXvGWh9U3vcXzGP3S/KktUNm52fKlF7CkrUhDaf9xXbGqQ2Kw4MNT4R3Vh5JRKry73uAq5xQNiwPFATwrwBmQCmVNEseAz+RlC6LdumHAZ1IF7RNqUB0qGTFYykXexA3RHLwynxN9v3vZKF5w7Rc9kEHDfc20bpbPp4l8D/0WIhZf42gIObKr3lCFLno+ZIOx3rMWGctiikX4g1Ye3PwcSd8k6HzlSz5dIljQafYOGQCtp7sRcGatGu2axP+xLUOBsNalJgzFVsI21Pi//qw+11DkuMqYPy0W7xbydesN0yQ/hjXD9YXRwfMYL97a/CkjvmKlKVueLi4biV31dU3athWBudzXJWcr31ZgPLN9JANVsA4uZ5AqISNyJPNZOxSYlfmbCc7ffcLGSbXujZisil7zHURTYk/I/CCoy/LydglfwpF19JiMTCn8I4ibE+X57u2v3/rfHiEGoSd0sAPliHLNnnfF9IhgrUFGxSkPhL2tBc8DFhku3z0Nl4zc5kA/iM/kUj4H+8BYh2pJmxqvm4ZNCck6OEpfGX6j1qrlgk1QC4FrXLXlf+62zfkTNRqUKPl04ELZTMDf/spGjvpj8Yc9z0pFusa7rZ6cV9RIW1A5XIT2H5guFYNsGH5oAYQLc+YXZ9FOKFAL/fWghiHb1O9w4aUlVbW4qtGknfUSP3YttYOLOVpVSv2WxapA/gXtsVPunbSf1/3eOc+mq6tx78ZmR1bPW1JbeLNpG2phnYMrGIDYO11V5lr4gJQkDKBvlKgGxQ7IwAABHJBnpSsfKCKHZ//m2RkImOnmj7a68isZzmNy1EtVjDRPmyPZkB898hneJP943IGj5D9lCFjQl3IGq+dItpl9TH0twH/WNseg2AUzifvViGBnm6Qgv5jn1hSVIVGg/c9zxYX9dPC3Ux9LGZcZb9MDaojm4/eLgZ+MvHBY9VYcK1sNoBWNvUbGdcqASj1ip19gyBTYzQTV85B7a5A75qeoGuNjr+fTeb+KgjFCnB+sWeaOBC2oq+NoadYwb/XXRGpxoyFo+/oujiY0roU5oS1b0KWUsb/NTXxVhixQmGeSpPNIEUCVO2ukd79fh3Ax64+HPtB+tACtrThbaZi7ZEN5pUjHR8DjdeqUuaBuqCc7thS8LLC983FLMpYOkXeRVE8Xa4qznQinWDuZGQAmFswzZrq+HkWJtHm7eElt3y1Dw4oviB2s05bKjh/k2xxcJb9/j1o4ymND0lNqOQRHp8v8vXebDzWNWhoHq42YVzkCAIsY8+dVxsNFuzRMgs3d9bUDyJSnufSatOF5v8UYWI1olfOX2+/ID24YuY7/YJPEBToaq5eVLNGwNBEQLRyIGFRnAcENL2r1A0K/Lg5lKIBDikUHM7m64s+vSkOIzb+SjPz3AgDAZR9oqyYc15DA4otefPiToXNH+v+mqRN8+2UPx3X5NRS5Z8jZVXKHNWAZtX81bwbHOfhunpG3n2QNoefdDJ9Ab3gACYUdUQ9WHALYY1KQvda5zYRyDhBpG/i5HkQG66MuEwvH0qrrgJTkvk9dFviqt0grFoBg6rrnfH6JQUstS/GYMvbOMW45Uz5zDH3krTe0vZ6KeVVHwPfLlCMXCeE1fHRbZNzY6XcbJtZyy8/QDNFBUEYpLwZTkF7uyfseTxa8FUAuVqMztZkF9xEkOK6gIYuVyICRuJ/OD+WhAq7CywiizkOBuXVO5gVZsozGA+KvLOzsyESDf3XzWe+qC09yrPBgbfi6hmvfAl7dvEVOCxD1f6c2YLoqN0T+28xeDFSNGa5DdNWx51MZO2+I03owbS81gK6r1P0w1RGzB3vZ9CJTo9uBBlmLDqbyjQPw+lj6hKVBSE0osh4vAB0etbkW0CrhY9HN+6eiCfckFVRLhOWtGEXE8P5JrnEdQ9DmfiWJHziw7twAGZ61VQFxaBY0Y5jZWYuH2PcWPa2PcGkeYWhd7RDyn5LB0vP2khkhKs59++Frgb9/g+12k27wy88uz3u1ApYlCSW5IJAldQo149IrXq4O0Sfvdn+jMSzwKus4KOrSxQGIO6jz5os8vdE1mhQoRvFYlZ/UNxYFihswzX2b6fjw/srswegDuIIf9WjZ6M0KPA7WoqkUsDMQYS4O5+z2RgrBOZjAEKqxHYAAPIz6rQzbwXk4fu4Ca8jqXhrVWPRrDkBE2wi1QMte4lMHJXZ3SK2Y1Fmq/hB94j2/H7PIV6t6c7KHbjw9wQHj3XLrK6ePPzVdRDBiD7hc2a6l0TxIbsd9gUKDhqz8r5Pq9UZ97+gdo+CFdO+ghhA2ZvBAAABvgGenIxqL//cBt/qjrWokuT3UbhWrmwc7Wddo01zkW8O7bJrszoxemwWyvxF1lmPfmn/ssxwTACe3AtB2QyrXNixISCNVXig0PqPYeRYG57cMlqP13x4eIo+q0d071X+hJEGCCNSDw2s4VLzXEmf3qzT31oHMPOSExOQEVZleIpVgjCd6EX6suFMH3/s65OeJmFissyWJPBKpZZMMmT9QhUVEFL4f/5GpTrtLmpjuqr+U3MMRrRAWl8wb3WhITiI4VDOAWYOc9q5FgP7ysvSz8PI3pvybyhtRdBy5uhTayM1bs8AyjovV96ljYKz5EvkaUTJehgA15geN9vbhATnP2RnOGANA/VS4ENR9zVT20rKcSEscPUYQMrP8drzgZ/Ypl/bE3HpjUO1/oHsiB7BE1TuptMrWsJ0ti0MgZt2foK7+/ZKI5q8YWy3vJctsWjqsMXigvZEjA8sJJ2xGXYuF/Vx0OKOGfH8YQjv97K+L1qOH+PEPdTGanjDwvk5Bowdx40UHMprlVaulgTwJ9Fhkskz53Z57ArBLRTRZHY2bx7clVthCSd/bbL0jwTdpr47XwFs4wTEzAqBtafWnCiBAAABOgGenMx0l//Not7lQQO0RtzXg99fV52Y3+HE42ARV6PQJ8E3maUHnQRYmZFd2fK16a8Hg/hQUOQrCpYivA9BWNrEs8v5TdTrd75M2qXkRGwhQVzz5q0omQGgLvAcDxtPmoov3KPsiMj2sdglHqgYxwie7Ynk6ZYqw9KNp2rc9Hw117XPsdsvFeQtVN7/Gms5PVW051ZWprVjSoVEqxf9FI0aVYkJyGaGG2TjLi4sl57NQLNvQKaHPQUDWk56unJWv5T+/rDTx0s28PEXVq+22m4iCnHlLrKPBCdKiZONj7GHYao0sgkLphyPG6mFOsLUkq7f3Jk1ZZHkYwh1QJuXOPwu7jnrdIIiS4a+A6Dg9ZdR0WVs1qw/IYjigWaYCiUesqAvAgLEbgF4ztRRaajqBBoYUEodpwN8T/2BAAAHy0GanYagQFtbW1tbW1smUwAAAwACL/+464miyKg/LYzN2kev+6pWtpXUxDFmNLvyBVQf+SXvjxKIc7YG+Xi7OGR4ZhtWBAYH0OM2i6S9qUL7+jQkOQa4CAFjnpdRnXkwcfiU0sK9FCL7eEzbC6bATW75vQDBqx9sjv5S42NmOpb6FZyHapdeMWXz1BFCm4U53JSRr4U0VcD6kMfAyp3YXbM0Cuabh4xMzWInhzJBUCbCAJXDzDULV5y1mS5o0XCuzuA0Inl1uQZAuIOv67o3LXm/2ZythCn0aA2dIk7nRYkYlhyioSOubpnRFej9M2SwY9TxgvoEOOFVa2MAds6MC6mxO3SUMGvuIk1y903is5JPlmy4jNgNO6LtTiT3ckj+T2Ru70asEwfgGnJIhnn1qQ08cmb6SyppHGw1znyyjxn6rM4AKGFVx6qjUQ1ZH7JOWWZdzVGWCOEwqQOMZbZy70TfY/X4rNYXtKdA4GIIvAo6iJRsFnIbsuurxuvKXZXi44Q+VpEqMdt3w1/Qk8XoJmxuTk4ZTH3bnx+nDkrlzMDFfX7/1DUHVJGFIXjSi3q1QVdzcQXDEdNMeu+FF8yC3s4LdxI6/n3Ve3g3f8Dlds0znnA7M3M5atqJmblLT31KZmw7ObecviOlLOkevX5di6lY2vnRTKsOTAQduJwfm8t7pBVcfNET6PEF0JAU1m/LT9LEUfrLKoD4Y3MTcw9OM3hPsNm5VgLcbyZ1tlbt0wPvBhUgyzBIzPGzjj9E2Uvq039ejgf6xll7ayf7IBRfRbfqX/7wRGV45OiilOITpZAx9GW3Kej9s57z+mLtuReMRZrk6QpIUH6o/71uw5NsWo00fnrRo08Z1gCp3VexKWtX7+ZDh7RqmJlUBd7GV+qtokqbxYQ4+p0qOg0vigWdSolvMNPGBlUfbwvGchuPbWwx+tfbR2FVnMOeoRJqGbZrwVuOgRzoBEnPn0m5HwHiWI9Hz1YtWALOifUJZu1x+bFl5u2LFzfB6W9hBWH8LoMstkQDk8HbkclkkQKWr+zP1mDVbPtxZsHEBtrQyVKKmwi1m68BCP2jCyBfc9Axcl77tSsPrRVLb31xGLBQ0FW86FrZFoR2kreloRrokcakdRTMsxh5kE/rvN9lMvrdEWkPabNiNL6e8TSp62Te//7BpBizlux6G+IHqrCohoZsR35akvvboQKQTYvE6RFK2SVk2ViS/iMc1xr1/0kqigUcZh+jQ/iuw1FwyXMooAA3Bx6zpNErDFwZEeenExKlaUAQRldqnHj1MDR81irn0VJ9sNPOg0eTiOIuPAVXUUG5hnyynLRFBvvZQMV6cXJMmWrYIJNZImndic1PaBJiV4j3s/XOh6cuLRs+l+sSTJ+0ybM2gZ6bsZOPEvBtcihDPaCP0Tsp1Raxc99oPu62b4Xa9E/TMkFUSSdgVZ7cEj3LfQgm6OUlBQob9HXSyqtEIsgLWPeJXkE0b4LctDdUizWKkYckcdmEMkBYy+HU0UtISAOdGJuAJ3hHSIQ7NFzR2g8i3Dj+N3W3QYkkXTHesZ5P7N0Yr2qKaMVpiUOMcUPIXgBj9RMiqSYJQ6zUAMHjgR3Bm7lDj2JYO/JWBdTgPH8KsfkSe2gfdhw09UJgySduxTubCFCGI6+p00LmpHm3RhhOTx0m0mbqreqdIAGUsQEA3gX2ADglEd9AbYENYcXhsH/7+jvSVawKrpunSDaLzQ+y1ktHtT5jfxI+lfCL/3SmVdTW7s6dSu1YB8HDHg0qERh1sNtUGW1j2qcbZJeOWhp25szbNoMpU8HC+/opRuZ5iy+3OqULg5PRy2m96QwApLabyLjO4ztAIWi8a1TFlJFJnbZQL0s9JM5cLw1Av6XxopmHGBkUr/wCYiIuWby+5l+oKCOwPLO5x1Hj4P8RMtR0qA5VVBTo3nQDDJT+aPpp6rfCeS/80nij89ehClDF4z1a93mUMmSL4GlAquv8Kl9DicCJpvsSZOQdojk4v/Q4RYzKAIVdB/2bjAXoouCZ/7dxf9bXug1SqP5ZgusN+lyIH5y64nGZfgDGpYMqPtRDWhRBluVH4acVntx0sWYS2G60SBEEI796dMlo7U8S86bDv9PlvLGFkJyWdLCOmuA3LSSlANQ9mr4vYTaWpP1VbHzmoaNaNIamXbMmh9optArhmctLJCPGgpQZrvil7U0GkIdJQpXdE/3dB1ewu+LhPHRZMD9K9dB1HKwxU41WOzHJ8eD/XLQsOY2Tfp0IMWdX7W+ZWMFgoWsuPXNbmpvAwQyDYGYKtlWw5HDg5UGJhue1ZjzD5RPiPtgiQ2KhI6KrYZJKXhudh6wqFUC2omJkql6Del5yEiLw/mtmEQ8sE0jei97feexrMHQTqinLZt9i5hAWj2Hr5ZEr4G3diFLgDIc2TF32d2cf3lN/jOXc7JqPMmC/0aTX8FPWipv2a8rdiZEy1BApqo/91Ow+BdFue51MFeQeZ3daS2apINB88SkcHsQvB4Kl20LRqAXqQRZlfmZY0dkyylfRW2mx3DRADXW7o0hxOWRJCwZw+X+3+AgY726j+UcaqBoEreeJzypVgCaQ35z65kE1yyGmSu5V9mvLf7UkenWmWhTlzlC4mSrfi03SeaZwED1MYZ6AK0gqrKNh2NDVRjMX1byCDgAABWhBnqUsfKCKHYn/2UahNudYbUn66gcP0byJ69TgOp5tpydeklfPy7/vPJFF9ghhH4Jz4iZdwymwoiVxW/por+xim12i1oxM+WsD5niW18n3+HlHRLQPFOV7AOp41iKkq0pJ9kvaZAXdiPhfUhV7/KzzN8EKKnekFJEO3VhAW419QSFWsECM9H6hj0IiRci4DhGuO3G1+MY+4fYfGJFZcJYvGNpy33Q1g3j34ZN/0R8nHBe75xRE8v+tliSn3Pfsc6BNkMnlcReaBAI5xnRKod7PNRsLmVCFwjKj0WGtq0ijhta5yUlwzt+eftoMi4rjuVh0s96j8YigMS0osPrnTKOdBkVkh+asPvr1GRJrutUGtBFDXyCairiz5Y3cwjvOxBqCOThgjxGsXuw+nr6rfTxrKxyarLU+uYSJZtt22BFLPYZzarX9eyf6/Ad2XDz+JPaSe/JaojzQKHQmMjxjJfzigyFRd6aPoVLnKh2vOQeLrwqc7V+h1ypX4O5/IpQxmillhnsSRuDHG+EvKYqmDKKlV1iP5dJcbvdvr67a6ZpExjsI00oy30KD1yL3mwny7g10MMXMv/CMuaTGHQ412nKQE2coQuzCnWLtR2EyD/eosqXHh6csys5EaCyyffowAwR62KxV8X2+lY3qOx7KApa4M8BihIFhu5WjUXAsM2yrz75kwO+BiEtS8EzTRDHpLUQ93TbzSBVJGaLvZmeU1EmB56q2JD4jQXS6lVEdK54NmouVaCAH/DjtMrNqZylT04OVYgEGHOWqrXvF184RgFt8bJcrNASJ86eTtSBerd1yvxNzDA42qVeVMs6Z+nL6G+1/eA6K4XS/K7FkJKkcB4u0lPCLY25wuy3z/j4DyFMRLob+DxWwiKDrPOGe/wVG8P63LNqxdE9TKI1xSNoS3MUQ/EHjtmA+2Rbe2LXJoQ88Tx0T5vmfFY4s8yB2lCchqGjvOSrV7sAABhWn7knKTIyZLFJAmrDD86eYolzn1J/3sUf3rF84UsdSyD9ifcm1ymEHk4pMhHz4P4Q6PctAeNynhwLnJSgs9rknNgjU5iixRRlHXqluyT0C4DWUNaRhS2f3Df+1l08cAUBaGMv5pMMKf0MpsvthgCD7FP+2Z3Uz3G3zzcaiedw4Ugwjsm4fzZ4hh1ZUGiLzAqYXnmquDGBYrQ9K9H5qdKL4UBZDWl9WC04F2mEk1BdpaFMAioq30e5ul47iUfZAMNuLZuBZlbjc9Zvhd371SBQxHbwmbCN3Zx3KwF4HKVfdC6DkwTZLkyZLhfGnNbKhNJoqTBUZZI7+jcs6zUjSk+LtfFYikZdHWCYYq6/ZKfLnDBDWCjwT7RZ3e2g7hY+ewyt534Vu1SNDv2abRyAiczVq+W7BO+xxNs6PBRTikmgIDzCWgyEemuvxr2yF3jT9v4XvlqeZDmyi5wEvl3jgMOcNZWbLG2fe7f0rHgbANMXebO9UMmWLDTRfsRapwC1l/jOkTglx6TbXlCp2XTKrZq1q2EzVqeNQ7SSkwKMwsZB7GDE3q/K5Fa/UxPj/iqvpGxxGeJPywBAqy6bCpPtkSYh7cO/uvsusW0HgLg37mdfrWxT5EacXR3K0JZZbgBAwwFHXfXT3GVziGqt/oI7ecLFMH43xxDbQPLC/gbpAhLaY/GZp3e6WfoEE8iOrmSaRJpMSjIXM78xGrDg2l1grBiWqIygffJQ+R6EIzZ9I0zz+xYhRHfAShSHbz+TiuA4JoAU1O30msAVcKBN7tWAEQD+GjqsB/aRMOp0vJQNkKer0F8S8bHMPhR7EZwaeMj4zbSBaK7RGNRdr7V5yZD9tCq75hGouAH9sLiDfwz1ZEq1QAAABHQGerQxqJf99U4vn5CsWhhXK3oQIReiU1G6V4fDMOvjXZAnaJxreC2osqWwWP1A/GjlsyADWp8Et0emTYcETneH3oWA4oVmQ24N+6ptf/li0A9sq2Jb7JRXAhlYliAWDzb8lrc75on7swHtlQltgu6TSfek6i5YknFDiBoAug7R6nY9Iiwa0nhJVb2AfPwiD3kEWI5VOuhHWUxnyEkn5pFUILVNiw3rxmDuFv3Lyb0pLyTiATVh5Deth2871npspmYrMOJ0fimNuWmuvnkHUxWeeoEsMqKowxkxEsYvOKn09/VcfAOc2AGqTYHKWwzOEagJZl/In7ePRaD5BIdv6iaph0NqzijMilBEHPNfoS2M1sUjrzTNrwru3J0E7DQAAAaABnq1MdJ//Yv+GXI3ot91FXf13n+fpCgOy8dgClqVw1g2QRWp4/OLoAIAeEqHUq2aZofbU2uq7vDT5z8izC702ML/6GWdyQWF92r2wIrLy9ncE8MPaNhlGNEoJqxldlI6RCnAHJCOLsoospleX1lrwPfr+7jRHjtL5IFOoJxpZAFmlcEwMTNOTDMNPd0oKZU1grguAz5x/wAyaSAGeW9Sk8jIfVIMbfZoXxGyjeqQwaY+MFGmSws96BmYvk0Lf1cJqk+2MNLObR6AWIWeQ40sxVVAYP6Vw51Ec+g8gERV7ZXdHzchoaxiid95YUnZ3BoKZreOMLJnoIdSA9WVmajfkY/osNYRI6PYgXmtcKvoX/5N0jZa1uaeOgrPSLUvnBlfdXRooMVwwwp4gt5tGpP2UBQ8F0R6bT83/6DEnngugHD4MpWLZjaCfkWBoQmkADzsMmuTAHJ6sdlVkw2ITC/U9ui4uXKwyLQPH8d9T3FYf52SAQZWkihYFImXmlqh42wXnQAL3c8NaFGaEWKPwBc00SRKQF4U6Pnhi9Uw11ax77AAAAeYBnq1sdIn/09vmhCJw7u5Bc9rK3p+0q8SzeBldBvlVHfmTPRKgSk+wwhT3p0D/DnEBSu6fvX8e3EkdY9bfCMkUEq+X+TXjITbBlD4b58sd9MmJwB3Tm8kaCn/Q/UCn+3zU9Pbzhlv3jVJtLb1TLbpi2vWYiippu1FgSmfYZ6Iu4L5gnzaB6gydnccQViMIJreQk8cC7C1ogX6VVDDptGefTX6S7g9blGf9wP0KROj8EaB16XMFzwt10rczXzZWXHM5nBnz+rrdVZIiQSV7unrB+Oi5fLUXNbVi60QOJZlyEh53QxwNXQeo+oKEMIkIm2lI2VqC0htQ/jpa02X0QxuXjCB+kVjTONKF+CGRVoB3dlEpX/wUnJMfJloI4675vsIMYajgbeIlCJZLYzODZ1WryE9cErBip9TtsoQMwry1jJnHAV4+1NPiHgxXP+BpJKwSzw8IExy+rGRKAZamAe1Ppt4mt3eaxqvCc12ilfk/nARE9Exf5aSB0gp4+SUaVxSv/OviXdzorvKUTuIkhq1iTKnfEsR919MaMg/YX5qQh2zqIUuMKp7agvv8SxpaSlSLKdpEmBqQxdMvjryFEcy+VUD19qpJ8OHRQ4jC8F7Uv1Wwn9UrqsHhZUnv8t0WR7Jg2Ivz+EAAAAdAQZquBqBAW1tbW1tbWyZTAAADAAL/x85WEWEPD2B0rCr5rwm+es77adyjYKkeuH3r2gua2O8lytjG744PxipaM8bIVcG1axshg13dBwskbrkxcRhNrmey0KbfAcxFBJfoieD4XEZGPqm1ZFfXwocaTVblwrIMk4RD3cLT8QuPNmeXacm+LKv/6pS+g1F45TjzF8fkerfp8ydM2PV5RYMF8rtSxc57YsIhmtuqvdnxF7RkApECu5Y4Gz4uCTgbjUi9rQ2UyeWV+LEu/KcrQ15PPHIYK9tUCq+qdSJcA2ekKcKYxWhyq5DM6/hUCtqkU+qFHhmXcJdw9rQrqKCwS8UUuUGMyYgvJd9eaEw+tJXuATz7S5z0RyNaZiPew9rx3yeEaWbWO0voZWiVrRMQn1em0gzt5HnEjtiTupOI/1zHfOxaWpPwdpg1ORjp52QI8w/gqW58WeqjsDN1k07tan44f9Mxj3vweKYjpwSle9osTR/Jo6E+FQEiVNr8dKRVfvLo8+l/2Pt4QN9CgUILxDQNZ8r8bcPToZkwODhbzXaERgjdaayRbYAvQnb3FUtymRzHqlChiPN6NufGeDz/XKgRAbNX1zwKRK6+IVne3Hj3Gm7eiCU/mR7cpZsD/pgHqn1YW3Dw1mdFBcfDa0ZWtrohiX81xdM6zkVLePj83OtlBPeCuMRPmMjNh1D1bK9f+R02uewWnKOiWZivFZ3L6vc83kl9r9L7R2VcoHixBYerGNsZTOPY+d3zOjSJMPeQjQ312Zg/72kS01xTplZeSEFWCw019eHvyTLGxvKfSEncyXfV8/FWGN+Tn3Qm0eTDLXRVuGG3GTRRG2bBCyX3aVROCkUm7DM6rbE7eJpQ7waAH3OdI4j1Mt1KSJEafIuS64oDms9dngIZFO3141ewgCY63AXFzfSz7csoXLfjzJoqZNV318IJDO8FXGax57vDfw8AARWdCki5YJJvio2/foKTWELhZT/aNiU9ctwyzpOa/TVQLTLVGcxMe6cEOY0fTIqmqdTf2c862/8Kboa+R/uqbGv6XdMiee3tiG++OosH9venYZrt/ZJ4/TIwO4hIBv45OT8IsoJ75Aaz4O4f4CHcvitr94PPB2ygeYU8znxOZH+xdGyg+Rt8FG2PYfN+NgFj2WqkyXRqzBeHksfDLCOUPkTd1axuBc8z9aNbx3SAfKbyvhLt4JmqWPu4MYtWOwTQqrj6lIfS0AjVrPDOE00i8WJcIqV1uwSwrVH2PM8pDNf7hmhPoZDVXMrPb1OPFWPGkcI4sHizRTzpMFgeCl3l/wd+GiGvN0Yxh9jw/clrhfl/g/rXg1HGe4Xkyi6T3bqZg7iTFsTMM9ss56A6A79bP5B8ck1mEGlUfMjWD1KH0gPHmR/8DyzU95G2zGFvczaWA0qk/Aa+EEuasNfBib+qV5LAlTCei6P9MjjMOF/pMRKKpawnJbNMl4ydGcVwgFLfkr8MANmVXFgLwM5cBfmkOC4+ohFqKSOyTGCrU2c3wec+04ItJGfLAngqStAKogNOXtQk0HCtmcp25E4YmH5fgM3yfasnCe50pw98T0dgs0qwpnAf+GO9STaqIUazaFQbikEQ655/yavLfASxPLXifzjm0+2dUkZ52A9som3/hYQfN3GnRYSxwr8b8XSM0TBifrUv+xcNeLDn1VywqhLqDT6eiYsHyJNB2dbXADwCzwwXAZU4ojTuNgNqIGT99iW4gezKvIojEo/VBRScgle7i186FUGgv9g2gZm3m5IosTR0HuqC0BWZdO4bjjDgeRxSgB4drttpVGhNppQLW1K0GedKokiQO/hxQZhiLseMiuyKqEeBNW6UpI1SsYUsAmtkcw9CNi7W/HT3f5ageqNaTVMSlxPqkaHN9iSe5xt2/yQ8crCS9CqUg/d1b2RuTTz0u5NOKPJ3feUEIN8iwU0Om4Y9WadOY67G+3ZBe0jXH1mg5qj5xvSjZy9i7JeOC5Ku0/V4rwHJ5h+L+6b6Wd+70WdmrCQN2B2FymiUt8bEv6Dgny1y+w+k0Wmq/T4BGuN19PWZQNOk7r9eWpGwV81l8+DV5OwyAEbPn58WwEMUPeK9xJXTgF1GTPPc421CWMn3mW8uPzp2VK7GbDnAS1fFiJ4DhfV9dq4dJWSQQq3ZaKwngeRMgX5KRk2naNSYxXFSBfEOwSx3t1xCj5Ep5MwtTVi4G7RTo4q0Ng2qYVxYrHw4yzhmNKbNPiywPqHPKpZsVPUsJeLatvAO5Nb148GLs5P+6RYQOqe+kpIP2ev93aZQxCDeGBfRsnr9nC5I9doNEd61Y6qVN2y5bkg1zM3nBTtdZ2sAMl7LX74PNG3dPN6QLuPZRJ3rUtHSx3OlvOrtwGJXeNswJFNiNPVd2D9TwoiBVrDTyHgCo361JfgMXSY12ISPxMQyAdfaJthTRKWyGYhiXfYp0iYTo4wdsNnb3FZYuadnph+ws78MCUXtp8EAAAQyQZ61zHygih2J//LrdIZdb76uWYM6+HwT8REnYRsDIyBSGka+DKHqc2/fMdwW5fd9jdhC+qq9K+uKzn0DBFYlJCZLF03QccDZuGbqi5kPISe7FqOmVPhpueIEplAWHmiXAGU/hgTKY51U1fI5v1YTYvpEOH1kt3DSbGCGZxbLvZm3OkR93p3kWaQ3Nt7ugmGWX9JAUAPAQeMnFPLpL1k/sFSxVkQi2ocsSkYlWWEmtPlGCfgnaTUKmQndf6+ttrQ64qqJ13AOpIk0RxS+8shPygKMB3htVSaQcQph3phUoyccYui8/FVQUYpbkNd8FRu8xFPpOE8BfkaOgehFRebhNFaUJ6D+oyZt1g03RXzsa83+m0wMoflPQrOnuhGcr3dCh475ZNr4sZcyuJcYQFi5AAt9SituWmok2/QGKL5vkinKC8KzfY9xFcgG7WNiyyDO2ktiijs1llQhpExc2suaWMM7CKxyXqjbcx6VhZekySeyYjnOX7fiYkt5ywqIWb2Kd6xorhEn2dNt/p7kDRK+lstnLoy+SNryh0iMNo5BUVvzoO6q7w9x1sLkVgvHOCdBAkjV0IdfUGkvG7t4TaJgRBxTfS2fuCOVofj8U/YdlCPmSfKB8PbUIWFGFcTaDNczo9jCdLjb0bTs+76EbYfNI07nUsW93Z9eTrbhjygcfDJ+adgNXD1mcBZP1zbqBOEihqwehoW3eclEz9PZp4V9f3FY5IwGibfwZfIgu9obPMvUVWKgFIW6Y1E1zGswKjUXKtP0OspFVAUvjc1Yk6jH+Utbtej4XZIDFKQpLmos6gf5MLioSul7d/RjF11H4j8/WqU+GrESyTmvJulA70aBKM5ut8oaJYzzjasTVRK4BVx0rKQIBSUrmL7SV2COfOPDuRtPZm+j4EFV/KSWNw5djKv9luGMwrPyfwnt4FztBtKJKYnXTLd5xJli6b3k+HqNJ+I14pJiRHBnYM7KC5xXdZG/RUGOiq9vW3Pish+3Gkoa1q8UJ/S98yjXsxya65XNxGFIvs6noIzN4N2oqyclxfb+9jUe1iCpHFvUpwpcMQReSMjPtZR0Xg6WweahoUUvBmxCAS5VlYy3qIHIW9r4Vfv6W8YPRClnwMoXr60NVah9Q6Adp0kQbWM+7QIgg3JYNlIgB5BsBihRodjRJZjj86xH3+8yIhQUpeHACaOXjOebgfBRTnDV4f5LFHClXKuTURxu44BMHiDl+628LZL88AnnOi71sj6ok/YbUIm57qdESXQhDgpBDP9AV524aHDM1uAFg0OWvkI68UdfsUL5/6aDyVRnLxI1Fd2XiyD18cvwnFuP8rQLbtBUcc+94M/J/PpSnezrfLaf1sN3YbfKegzramNEUO2Y8WYRTI6teK/702JGbHfI582D1i/0EDFkb8kSOu1dvxAo/ix341D6JqFBAAABdQGevaxqIv/xQzRPtbYMqioMsRJvKhH/RZR9s+6nhw+EG1KqOGB0j1ujCe0yNVzb6zChRTpv5GkqB3c2qjUBTbzAKMcocImoDITZlcoV/4iDn8itJzZJXYFNkbLHuW/3sYaGnq3JdOhyfbRI7PaDug3JEy4YSU5XhsZ0hGp6d/1uxkzVlC3olkW6fPkzvEel4gW/z+VaUlXwQI0amkGWYTzlbvIljrlI7fEw6ObEB1bHU9HD6bmqFdpl/IrxV4bcrWQ4eC6dARc6xzOzxP8aS1M8z8KcvFOKet5NTIUXCxPDafPYkJXLyKdZLS+5NZASXI2FIBy+IsDKEDEe0yJ6dz7mE+eDCGfrlgY12U27sXrzbr2pzaiO4Htd5SdmTNvzvoynWDaIQyupQIM0gvy6NXW01fTYlJBg/3a9OUSh2sO5uBfAazCdqpz03dmd3z6AJ9+Ne/325djZawWRWe9upWxqo7rJW1206O3SfMK6CmRbHCoF97EAAAFBAZ697HSv5uRsWTrHVHAvz8YdXYdTvsvaDQjrzJFR05H/8xofUkNiVeobLXSVra7qik8e8GoBjaJ3/rs4vJsqCniYG/w6jAafvRmA0yiPsxrA5Yu0sRLZ+2EksiN9dSk+JIaH/1PAhAZDWVFq9d5uTyRHGui0xOcVIvcaPGDwrYGp2p8AG4vOggW681KdXM+eW1KcbvILyCbGi5VLE4fTRYZDbDolM63K7sOF1DkLvfrQBZ28lEnAwKidmleyz5fa3DY+uSZ2w6dPXdYqbncXFYdeEo9HVKwPtTGLkcZuca8WnT3ygkIMkNsXjWbR9eKnLIS0kH/RHsYYrgu9sJbIoU92Ur6YxxxLplAgj0hQ9WGIngDyXkfffFWagQQZpi8c7VEUUicxiFiOsFIPkaOCISiJc7KI0Bszh1hqERKarkLYAAAH3kGavqagQFtbW1tbW1smUwAAAwAD/+GRhGJu4YaeodD6/teTxwE2pRFdn+N1j5vXsJ//Se30G84+QkED1KPlk9G/OWvUHtYPHdUSZa+/Iv7qWluwN/MTIjbHA/k5Sr0fCw0X4UT3UfqJ9x/bj4QIFNRXpLM7lN9WyZu3w+e1BQJbl73pM+Ds1K1xvcCFnzEfq6YyJ9BOCw/rfbXi2OD5w2QG1H/IO5fhbpHK/IuK2y0/WZNGNqmM8d7xtNWdPmklHFv+lYyTe5xBGliU9YepHa/Z//lD8rUcUZyIi+dilk9zTjPyL513ZxYvERhCmm2+6HB/Jw+9/kHtrfNAA5kqc7s+tayl6BnQQQrdPMjlmSCZkuotJh0oRbKju/OyeXoJ1As/xWl+mfjiWS58YqO1gOahIs03q50gXiIssKSG+/eiLMAySYaH0ksP5sDZrVfqovLf3OMihA/o2yl6D9uaeWr+GM195Jb8LacgTHlB7WEeQ6575flujOX0qX1Dmb6UwwKZX6/uGYG609NySVuvqWgbISq/7wdXMVxbiaSObPJ30sVvb2CCXbG4FaxqCNVBUbIuviball6wxbCAtE4YT+J3eV63JhkCBa3/wYybAV4e1MD5Oso/eoZ5tJFkoAhB3KwKm8RpkE1SJ4L0RO/K8DTxyubyNkGbp30msjQUTV4/GKt/H6zIT7/M6PTdW/9RkyEpVlvGMMsPiDMwAXYtZCl2p6k7/wP9pg8v7BG7AkTv76IAb92M3Xd8jlwhtmWMmwVl17nwTKqsI0VRd15K0KcglYBkPa8VexM/i900JUltMtjlx0dx3gnLWNLMcsW4J6NCvxT8qZtdd4H4HRxBw/57CHMVbqH7H08s9JIIzkWaCvBLT/ukBMs/FeLU6SK3KSKm7rDJt3S6lRbyUCdE58S9PbBVPvjBRxDbTJTukcH5KC0bKMTHj9WlHSLL8uC2rQNjiFKf0uotr2mhMJv/rhtWCTQOfPusTYdvczt/6Nm3S2IKdkS6+t3U2OqD5IJYvbkRxULPzI/TruoRhTrp20WK9AJCA7lsTGsA0Cc4YYRGCnNev2z4QWr8ggDkXAHUsKrfN4Js0Rgr34kNGsGiCSgOKcihOKQij1qfkWhE8OuA/a1GY0Lal8BQNgbi9rjPA718z6S2Hfiphx+iak0eAa5x7JZ997WcNjD01IQlEx/y8drmpoC8dCmr9VDoDuMSqy6j2hgAuDj++44nPTFpiQN0sKukKNg/VZ9f3vYlwJxH4k/9toW+SfORG1blau7pHPd6/gTZrZWHEQEfogDSfe5Esi3VX6L0zeEOsrQ6qflOKm/5IF+DVJ+mr28wdGzQ0oN//S0qY+UQMqptDZhm+UJ4deSJ2fxggmbYgJus1FUg/VRfbWQmMtIkWPAd9DQBlgDfpnu+ynD93GuxHUsyMVaNFvKnUgY2HomMJDQDUpEakfm0RP7zdZ9nOqeIFLOgaMfRUrS/oJjWuoqdXlzGRoDqdVxYsdgqW9bhE4Dr4OtQyeSMckCFGLZKFT/B8zNoWwkhamK3+NCJVUflQJnZ9ZiOqHssdDGOkxxCizpJ3cgZLzBbSiKgIyds+ZLcdbSj4rZwCQD7osssUFmbAuqOjH0Ja75W3q8IWGq0BUUWgII8tfwPyqiKKF+yPN08C/faHmh+m0i06PGoa+BZoVdErSDH5KtRL0wwDB7Wo61b+ju0PwH9TRaij8+ErNoJGBUu5fMh10Z5d4Xys6yS7hPEbdZjl4TlN49WAG9/8A2sA7MkKZPMT4Ma82/WRqDVrkYmAE/RuziZIPFiZe4bfyH40NiiQVbkJqqOUyVAYtCVJSVTGoqFTMzU7RtIQ4Ey5dNpkVlm0mxrWOHWYCzkNsJNaCzcatUqCsX5bOR9hIJWjvDAypTReoop5FF2g508zIUALok6QHqD09/T9e2cA22n+rP+pXI5A71U11xDp16krAetOpmMXvoBgofl7CfiX1jN4xUNcur9WUxuc/gcy4g+tCE3enP1NvkJ2UnbeNSBBc1UUlTLEgFqN63Ck/4HdNeSjjlcD6fjEkBJk9bKdHGrlTZP4Lt+cwtAAoLN+kaR+pL61uv36Cw58kwj/WnBcfOlYdQ1Hs2ftDSyHszVJlv8OGORcYmKyIAWH4lEOq1PCyjtPOejYcl6YKWbhXxvyVq4nwXX8A5IvbVCA6QN+wfHDXchPZgDscUkmtjtVzt1OK9lyibfYsHOoUXhivk83XzXPSY2omO3Tqp29d2XNewdnX+RhTbfL4Mb4cBTZJ1YQkz6sXzSy5MDIr1Zl7zPCkuAmSPjVADokxo9/yX2FJIJJOOGO93pDEYDJv9z262oxFXUgmtPyIK7WN9KwVnAFmhuuaM1cPyv6E5Fsa63fF1QyC3sYBpY5gZfe0UXT/KJCnQ990LgFtIikBf3lTQf/Py0EoaJuzDlg8fPkBAhVvuNC5QSuOXUBBQBqhVVKXmgDRr2kuSUk/2tWgfC+fC+cDI7lk4MHRQi/ycCVhj0pJo4QicwyRcbtodq3VUjyZ/qyofmSgsfbuVq4cGF1427d5qCAF8A7jDj9IL0P9EU9Bk6hBJSsJCB5PoSxBGq+2IeRCwQGMRHu0XHyNz0m3CN+XOzN4GSYPdlyJRmdvxkwdbk7BlXM9mnKS7Bg3BTaC2MUM/L8wMwZuOatwx9X5x2D4AAAAVXQZ7GTHygih2v6BLhEe5OcQ779uz4OJdG9MiTy9xwVSRxu3hiIT1tJMVEMbkNxFA97XIj48wJt8l2Je/u2OlroEpVhQlgXIxPNk0e8pwIje1Kg6WD7DCipP84rNfp2g2mpPjzvxVV5aYocVADN1UE5vmlboA/MKHEOZQCUalBk7Vt+t2j6lBH3j0bBcsd9ovQBb83AFpmpBOmS1epMOVn+lcRPaow6oRdW5yCPS6c3vzGm2vEjOtF192XrClZ4qZblgzexth86jXNxu7MKpzsA56Rc6hhEVtf4rPOtbKsvlDTBb4Bna12nyCxKxdkPuJYkoWEezvZ0HJmXYe7+/IoLJd3Sl0Y6aHjyqV6/WF1I29Vfs5Ys6rubqwhqWHhXsf9vmi9qZAUe4gyb7mKOGE4Fc4PmRMEzyM4tiJe7zbD6HKQ9mjAz+wm4OtSdWsfOL+8ZoiT+7TG2N7AvHODz1MX0ZNbSpQ5SjOdWuMN+jJperTM9SH8v4J5JWyJCvdxU7sc+6Cu9lP8Ccutu6M8wRuXxtvi/r+8PzyKwafano+I9tk3RQYv9Fj40/jImCsJ5MK6MEFsanIKvOd6+U8IkKO55h2H2tWeZg4fICDCkw7KHibwd291gdOOw07Hs4ORZx2HaZDcLcWAPIOdiG+nAjnC/ntwrL+T1HNtb6j7Xa+EZ3t0OcPRFevfjgJrmvLML/unFR8ggqNnrJWZjRqiiE3WO3UcIF8qtsrjeRILKr9q0ySaC1PZwJrP/wSqTaAzWkoufspmc/KzBSDwbGb4dmL4RxT6zWtD/PXAK+MGsPwMG+IV+YVW81HDKmyfAW3H3PiMUL1Dyvtiyj23I9/y+FLD5U10qn2PNLlxI/EnJbnv9DpmPjr3nW+c4lpq352X0V2uVraCilXef3xE+MIIr2LIUXstDUoYNujvQNUZy99Be0vcgHs5ipcK6JUquh/b733BsDTl7KBJShPpk/ejFJnQ6jGcg3Unmo+dMimxCF0XwtPp3pCvIYKv3g8OiPfvoG79iLWPseakWN8/9LGxSqOaeP+32sDKHLw8ds0Gu34Q85OxctHpZXarLVKsshTJiOWoFGQCmi4JmCc9xgrxzCfBXZyTVftnk2tcMcpx9wppQUrRzv2hiAr1FtvDz2YTPSB1sGVjxv8iERdAk9vf5Zt42nwvUMKYVgwzPpvY7KHDc2mv+iw0RvPhPwrFw2gxhQbE2FWxDe2rq7fgAw97/1mL/C4o1NSlZkuQv5EttybY2zrXx7hiVh5r2UbaKufKvi9YG8CL5nm67mhcxLfUizsKLwta3rFfzZC7xz7F0odfpgWi65Wz9hftEgGM0rLbeacZn94VGMjqqV28+waEA4/mfG4EQdKRR/gZaW7TcCmyncWagPuxgtOfMzHfRFBXZKIlSXcXwUW1tJfvqCFzFqiIz2tAZCyzQEj6kzztGD0LnineOhMLjycj4PnH0hjT64oEpT5Qmgb0CJM+11kqZMZ6D2LbDNsigA8Q80IcTr+wVjlFVr6q9ZDY/yd3NR4mrCmBY9EjEPI7itfRcEpCzUm3BzgqOnUVL7Gd/p+zuN7fdCM3nJyeNqv8iHLsPJQWzFdUsfMFR6lMGeXZnAdKyURZZzr+ITzhq4sE0rjzhDWJ0XDv1sarrPMT1AgaOR4nML4gHMWQPpsn7Gnwh7cY50Zi5m5n/9IXFFKkraQzGN7w/F3IynxTVl1ax7qvYYlZ06kU/PdjBQ+T0+5sMpYQjYOZIm4AUU2hrqgh6A97sJZIj1mqOTv07mjtLqpCNvCfnlqYNKDJfEKGbYtxp4Ar7cCjhsFLBJpULIcAAAE4AZ7OLGok/8ljOnAMR4WGQe4J0bc9CC/tgkck+gz22SJ5h4GNGmx/XQrOLwdE9ZjzArp3hXOrUkDfNjOT4BCXaRHFR0rbxeWfx/A2e0ppfunervWoop5c6+Y4ObQky+xZpwK1ezxpd9M6GU/hQ+7d3X0apMS3DXPFWOrkfEGFXA1SqsBxgrmXcDHWHJ+2p3pZxLJ8YbiQzEyetZjenQaKY2OPa8AABM46B2tY7zcblDpVBThbHR4wEkiZ52wiIqxBWGyCYukOVJzfwOT3NdHsiLL7Lqk0F2lC/v8f2CS3KtBDRbGTXu2YzA+z3sHfsm5vXbRuKy6dSbV5vxqnI7YxEBuuruJEp1eBp6/eD2h0MI2TwM2G9pJPEA2qZtaZpKVBPoUk0Cn72Okjry+xvtZhnYpBIZTVwZQIAAABfAGezmx0k//Yh79dW74zgFSOJWCvUznvXuhf7Ni/eGtt1CddTV73CF3UIrp+iMvJ4Vyq47GH/7zAljSSn7kGH7Fl3f0F25MC05BIEO+qbd8NxWIlI1syogU1mwVXwJJQlAk1oX93buMvVUwlWoMDpuv4IIqtw7cAr1xbjPzmBDVBAQFAJT/wWSdaw9nAXXXqVgR33zGYrcspadqTNMv4JCRmge/br9s3J2sVf7d1SfWgPLw9q/rFBqvZvYu292HwuBwTs0+Dx9ps8zs/INsUmFI0iuIguhHVyVMjby6aIExpx5STEeOus25BSWwFM0lfAkomsI9ZTRAyXkpA6VpxfeqtApRRAic1r+EZpP+Cvh178YebfTJJIVNiYBuRlW+h4KeDRctvZapI0JmXF5CsgC7Bzf3eNLhhIaFsT2u8EVyPMwToAgZy79/bv+fo0oXaJTxlM2JQj8Q8L/ih/XqxMpRykm0ebOeyS98/KPLbyueNatYAf81v1S1JCqggAAABiQGezox0k//d4/NfdvpXo0/z2KrtoYaHHCQfTk0EGrdGicgkap8wa+pKYoRVyVLkLJhohZ4ChQZSUpSWIjG7jMxx+APfBbwAeiAeXvBGF8V+KqzRs3PDKcbjeWZoCzEmuBe7vnGrdjaJyHL8/3785INE+GtyD5vzHG2IOitv7EBUC3txGCdbGLoMHRwmKHqLhTdKZfbwnTZQL+URnn6jpHicYGCkh+zWPuTPHjDDqqiiAPV/CUrOka4O/EE9zS2miG6QVFilEE8GMrw65v+tVRaL2jpeWQLs86T0I8E0aMqN7e+RhhBwkRCsOq1eVQ6u3miyHkoLTXDmbUvkeLVvjW77uuM0d37JvFuit4wjoHDKb2id2S/PWqDWkGuSxR8DDQVNMp4v4hsf7i0cSLvRLINC4zwHLI2RSx4Y9PEZXtw3EUrsT9yCwZbFrG3mXLOeANqsH2c1tXQX4pMJNX9N0AlsIyZBAoMfV+w4uciUcwZwloroskw2fr/n0obKUnp/b2O8bB6rTqk5QwAAB3FBms8moEBbW1tbW1tbJlMAAAMAA//hR4DgmaybPOcnqlniyfhaq0l48br8DjTrj1dzAgJv9dt2u0luKOmTZTV7oVVXnzvQmQQ1RIal+YO9vdCaK3PC/9O0pn5ZtwXb6vQ/H8T6ECD3Es97hZaQ+muO6w7JlOi1b/h/i25Ro7aBA970oMRZutBxPp2uuNNCvczDebRSoTzs3WE1QrupPbhvmgWm8iwDcFojnCgOOVbCQchEWagcOQRaoIroRRJZWJVUTiBunSPgbC4yua1WOX+pbnuUdJlLC2whPAgU+XGXQ/VzcsQlItHoakMDR/b5myxOtmkk/tUWKTfZ9+nvyPI46I3o7Ar2HLcG7da3MmZ9DhUEKaVmUZwFDEY46YfQ09dzpjZUoQl0uoumZzBPpqBcVdzT3wqxsNgTfPj25dTjdVgGncGjp4sZjJs9Bume/HuDk6ubRdt4Vh5bpZTtgFUkEM+QNvfolC6RbG5hxOFs6kgH+idiwX60+Pml2gBGUozsO+W9gCx4q+59GTyyLMG4PlsKPBUkkcObKQiA5ZV21yx1018IRmfMsTzDJvrDw7cnA5PjXUyQLiJFSnPwtxsXNghyxoH9PW4kru8KDwfX8cIzbXxw1mMAS5SYwqirFM91Y7Ab88MGNvEzkuAZeJF1ncrWSth8/BKIaMUwAcMcFQCUkzfdekJxN5xE0G8HfeeoPOUwFWtJNnt4BI6DOxShG+j+ZYYYaq4CHHv2De9Vog+qVEekjxbnRaguQ+FmLcJs2fg0HBRQW4pG+o4QBar77JdzpDC+sov3ar033ZdX7lxjG1MEZxdryeNdpX0poStX4E9K+IgjGWPonXTb7q9GXJ/yBxumMEgnSh8Wb4cXSYVDcJXWx+K2a+ILhPaTjq1YfCY2VC/EBOf7VwRVxU239hco1c+wYdGIvYV4aZQhG7e8gWBMCA52jbzzCyuSKrVsbF7viAeaHc1yhUyhs+Q3BGSLEy8SNdEM+RZFMOIF/FKK8mDB0vrMU1WAhRGgXAKnN/obR7/JZo2eZNy/387iQcdfthLVQVS+g/KXyFqD7oiMJqF8brHWaXsNkuqmgoyOObEuZ5zKpBfOiRlDsReKMZvvgdX8nb826pvBtKFWvbKpTNHdBLYvk1PdjXvhGSBGXZeNQWfOHf7+R9QPay4M5Rpfn/9v01DJuTw8IYYNdvwdKmQ9zYNsZ2wKxkOfTJFFdcrS/JTB0ld2Mkt99Iehn45ioxoNJbk1g+Okpn3tGD45b94kpbdehs+Im2u9Me/8YEndl/g2PfcBpa92Vb27/PR9FOZGMrJH7RlITtS4aG/b6yCisr3U+glqYJ9HrLC7pZuvEJyjrHsD4qgrUGQokw/nDNUp0uHfGAsj8f3X9qV2H9I+uTckyMmgo/aqwTU7dC642HXVCph9p4PGil4N9bJm3dCrBRuZkL6+1X/2Nm/WEYwDyF5G/55Msc5YuLfNk4XFqhR6VxVPSkyIGt2q7o61yczsXpytE0FHv833Ng89H9p71TnSQLx/LEdD9N9IMyZAgT+d1H2YsRhQc8XfT7vblmNdqSKURaJCrp5fhsvGdxVPVf5YYi8A9oNeJ1lmsuocKREUcxoJZRAuP91LX42jQGFU9ki00hHfY57NKAXAN+aq0MClanCC8sN56AHoCNbgGXtLg2Vyfhid3u2Ax6LXklWmgkRxXydZXNvv8QJBhSHrYjOG0e0i4FGfrZDh/iiamqc0wA/qByt5EQTxkT2/Iv4OFk+XJZ+SDjRy0ARr89IcJZBt6i0VOqY6aVPpfBxHQAi4VJ7igH0AH3Cz1hCqS3XuZU+FXXnVXVtYhIsdWJY72qJePzerasXEvDeBzE2R1QZDlXHNw1cH7LYjBFidzNZJfbyrCVl2GgdFRG6jXhoawr53xuojIL7VXF2jZXCdb16HXFPjnvULZYz0gESAowazi5T9HCdE4nwPsURcmviI8AEwdviT4LNcGo0WaL+/HYHFmO2ORJbYZ8IqesIEuSqbN1dPV1mOChJlweAxLScZuwGY+wTEZiryzCv+YG0+JbKLnqtGkUbbXIdRsb2bQxk5Gf3qkb/a5lQCKx+hE0BAbhySeR2KIpsyG8LWVpRrYGbJN9qonnlcwGFdFJdX2thGXpJzVFeqyIoLPxrz5LRcnxTPNxs8WxYh799JUersdp7MzN7H2OVlZFRz1yc4GIzwHUmH49/nzkd4QK8xuwd8AL41Goz1EJimwc28iS5VAxcf5TQ+rwLV8ulprg8bzMkDfunaSGdRh4CcJAHjXCOnUhVMjl5vYAfgeG5bmR51LId4Ap94lVzdmH2xs2Pmz1wWhSD1wJwTOPWu0WJYgGjlQLOD7+cr/xsOiWTOvWQ1kqGr2kGEJDiUxfzHsppmunzHWV41UpJUHIhRjBh5cxqhHZh4uz7BI11KjY65qtzRLICDmU7YvAeoRFqcPGdri22IW7B3Wgj8K91x/TzG9GaJXE+qVgsuVVnix3jqiIzACT7R52xOLfJObCS9ZvuDhfSG1wvtznSWoMtgs7QAAARhQZ7W7Hygih2v7om/lq/lbv1U3X0q9lzgBqXm9twqm+F52IjDpBOAc2LVwWHKVVb5vXy8PuIl3QccDJOcgzlPg3mz+YQ8mWuT8lWZHPRBmBh9MPToR0SRgtNd6rBIYq5feLEznZHIewgmcPg2ApOqUy/KWV4bX0vYNOYynt/DcXmI80tnUVkRQ2sRUZYESCHEuKOdKu57UFUcDKaBP8GUc5U+4WoUki/1Dzk3natz9Z8H3Dvmt3dRzdt72RQJqDrV2ZG+PEh8OGIzhAsiAztqhrOr5wIbu58Ip5rMsZ1rHH1ndsInVTag5Vsdkjb0HMr/z+U7px9ZvBzVqKy81QbeQ5w9SqvsKMtSJcD/zFVT5k/FP7N1LRnD04o+DwD4Nusax9sBHTCMFsRGy6rsuMhNFS40c/Orw4pUPdp2/3znkgvpolh4Pnvf/qzgMDrXYjxeAEO/sNEsCz7LeaG4QKhqkIrm0+pHsI7nAmfetYNk3qyb93zHA365vi3ePkvU3/c4uWjlDH8G9zGHx7i8diRMjFEgkrc5GOic+6HozUu57FEAHzpY34VZ1Ggq7VWBtqZamlkSev4iiUzXTyFMlh+TN4gYaLxRxUHsgdA6oHUhEVJb12eSjmAW0x7flmgzbHkubD/VVlRzB+QQVNC7ZnmTvvo0et+xKj8czKsPcAI6CAI2u5RyC2hIe+VnTjYb5DwwgFN4WZAPpTKa7L024NqAjCfOxLtsYPof92O1KoduLDFi/Fbx1zAyqT+lAP9ZsHu29Lr1FsOr8Rsxi8XxJWBA1HqCm2x7UUQfftuXBdg9U4/vY3jyXBbsxLnCaRsjaJcyyV4dtdHTO6Bm9kk9RWX9vymPaI+6KGw/PPUxyl/c7U1m4VzvuSiIYjmcTiv5oc82opcCScpfh6r6VRO/NYna8e8qr6MeeQ4HtHV+8wo8wNbM/EieKnQKLRneE/amVvJqJrT/pNbIqxm6TyvwBKgZ5eT60GuJukLMKqr7sN0JcdjuAAxL9cCmGUqr9X9j8RfdAnz8jYyre2eRW75CbMcd0y1I2HWrW53dOHhWvffPf/04T9ErU4Sp+KNO8m6vSDg0oAkUHNCEaTPpTDWyuVtF2nnxRBclRzFFVzaIJZeXxAoePtNqqtI1oAsSTWpc0+3BQFrQqsXmF6Gl5R7FjHR9if3X9vIaRC+t139hcj0U3RjFuySYFQCMQ6KB/SgsEjQsBln8YAVqDpBRMlRg1h6O1ZGZitylw4qa/PiSdFGSZbuP7vHA5rjBlZUlwaXSpC89fV8sDyzo1ZcIv/UsY9S+MspNa2V8t+YCT9rgIGXDS5q1F16gv77kDim/ySzmwbhcECg+s95g858DALL4ReQ7v2w7VvGTRYaut8QSBtiSedrcbgWHzJCeE0NIflsytqYH/hNvKdbM0mkahxgSNvW5jJOEyxRTQzR7auVL4W9WpVCbaWmwqkogFmGpzonKnoTDMRcpo7cXjnP+D9EF0oARdYEAAAEWAZ7ezGok/7qk4TGdOOyocwHUBnL3uapn8XBgmc7o3jgzDDupNgMoaKRgM8vzNAam29vP0xKElx2tFUtsEEP8EkSqnKIAliSpOhiWoMieBQWne+lHwOyaQW74joxeO///hgQSKgx2EfxKoROwbpKfkWqE6MKfhc7IdgYpQiKauzjfd2biH5BNJUr/MXc8b5yZiIAv6ISv9G1s/JIS740iReY2jGqie2+ZCDclpx9xiJ3So2iEhsACrQ+3D0+siSs26DuMvhG5Q92zg7o072W43LuyhvhO4k6lZPIb0vmR6vmU+nFlJDUtfxLOnqygaaQbiO4J2HpJ1KSJNGGQ9kRkNvSHmUb5MjoeBugs/CXJnWbTYmnnRoEAAAFOAZ7fDHST/67lV0TJ5kIdg7VDQT/yy46ro0gDVVrC4v8aEKGXUuYqpTdsfQ+woe+Jt6sxNut+KScRoaeYcyWbsznpx0LgVSXqdE9iOcsMkXPZe2UshJvjFnvrnb3k70mFxyOE7qQEwYbtFo5z5AbQcgJkJEMRo5d31A+YUnv9LQmCkGRKeiZBJdM2dxa+4/ynTe6KI8e1ELbgmKjTfOvqGjL65+hY3kKpGD70b4Z82rL4exxAzm7QiEA6Nz8cFVRNUULSr9fDSa9uIcJMM9AkuE+5wMa63uW8462gQt+OGsC//9Eb4eee3YLWY4NWiXApZRjTyGYTcPOhCPoB1jlCLM+8BxFMNS94dSV+jt2XV/4FFqyeV1rXkZl2vg+Mu25yPGu//2G3LS+LXMcOvOCY6PSpDsHaMbbTbo3jHeYS4AcSehhl/2xzWSwaU+DwQAAABzRBmt+moEBbW1tbW1tbJlMAAAMAAv+jTyUyhJBCh0gbQMquelkhfbLcdI7QiZ8mvFVlCCJDiHmIZdnBDrQ0Yfxfrn+gYowMsYjUFePFpqUf8btzfNFsz8R3IATbvLLpOaA1v+SFCRwNVWzWdjLoQF6HCZcRJY9Vvm3WWgba94pcPUTCOj377xF14HBOqq2fLZIMQ+h71BxkBHwpC1kr4M5Ki+qg8/Ii4irO90loEl8eSTqQNWUmhOmMsQJNsMt1XRDUaU+tJMX6pZ03aMpCfcCrsZXfWLYo9lCNxqiETibUXKpMiKKK9WNi9/FHxtkzt26DQohM49vLd/GHTn0lhjLvtAyB/rol2bEfQCOdtKspnvt7Fw4m/EY3Gjw+JWJ2lD0GPXwAXxjzcUoAt0jk68hTm8uUPvtsVL/dsXW9a6EDcJLIsK/MgsStWHWlyfY6Y2SSZf9CRO/+d84nQFL5Z2iR52CI8FRvVwmIVZeRPRKC5iIqSlngLIKBVrrbr60NCdLRkPHvWf9D0CfH1i3yrwgCoOX8BzGrblvyzJknp9iajVDE02xJ1qsJex+NO7SvJNygD4Pr4/mKWFxXzdmGc4fm0IeOujapHpWKFScKiYjiJLDHASBJAXgf94nhaxZfg84UfJcaYVI4It12Klti5K3jadTKIWdGVaR8SkbRdFxCCQix82N7TyAaG+AyLeLsgltOo4KtcNuRi7AX2mqTa8brb//8KDMY3lg0cJA7SkoussXEVJPSmNNX2QO305AJ2xCEijuzFeltGdXtMJhImTy4qbKPzqxAkd12dWvH19PqVzZLhh4d0aXgiuu1I69vCKI0l7uSN7JImhIjRurOLxfGAqkqP57KLgfP/u8AzAAd0Wu+Zq16w56L+IPW1zYXyFSEjhCkRO0KJQ/IqHQGYAHyIX1ksuLCrPSS5EN5dnsPOSTHqO9zvwZvEpl36vD2AZjR99209gz5lAKCecMYGvOibiUd8lrPxUGf5b2Js8Ru7MF1UJVYDAuzeq0nPa8sMBiaLPm5EtmWTB73AN+2HdzvYK1RQnLX1dzDAUmlKhubFVbKcct5Cp4B+bVfP/tg6hpwrhxdsMwY6AE5TOXdHU6uHujiU7Gzs7xAuet9DZicy3S4MUnDsUtwqavEJZ5KAf6xFVgUReWb0XgET2KWWi4Sy1wYGJTeNlGSXpxkjFOQqCEQAQstmv85YPY+I8lVbDq2T6S6plq8NHqRb4AIRsEjwuRGZS4CyWW2kZwns4JPdQB4iogmKk8303+ikbXYcMrhiJhTFSj5Y12+ygFsvmogU2Ba0nWYhN7khLOcG4uuqLJMoSiGAAPn4k91yR3XLCUSd42vce0CVNf5FpqMnlMMFwDe88QHGIGEcNvzOBj0UeerCvMnnQJtuKK1G6OKvKWnKN812rpwPMpFrL2EA2O/ExyhwfvOVMDC4bvdV0IA/8LaW9VVO9Z+SDeI2kjHhaDn0S4prih4YVBNABWy7eV7qUQZVUFU3Skf1MYkCaDCU03OhQ4SrHFZxMvpdVnmgffVSZjXvzqUiEaDPg3K37y+2O61u3vJb2EJHiwR0Mt9pcv3J+H1+i09L7fOXXwv5g+l6wdmObFpMYM8nKFIP0FfnuiNC9kU3/eZR02DK1JDTfxkzCyBjknOy340LV689isz9I6lem7QFa6s3KJNw1zDCebE8t/2CHjaIy/kXXfjYs0fwm4MsNyC02f1IckQdtSu6+2h6NDUDXH4hyPHAoo9VIQU6070TvQs79sJNBggoxqv8OsTa9Z9BhV9zRJtC88Kz9jZxGLxiKfk9bsyPBLo0leQGGHgewSNtPJLwpqP7Ig0MJVu2RUauKplZf5f6CtIx9u4amRp0MaY+ylhoKvp+gfovk1WV0m7RjqhOsMuO+LsODjm6/ZANXUTp/2x4ZNfwdFtSHOG4uwS8Vr9YjNgatvfRdN+K7Rxqbrdol1zrE/5lUFd8hhJQFmCKUDeX9/i1jLquDTYnoAZ9wZK8xu3JL61BKLFqBtV8RBI2dQZW8qZItb5E2UO/67G+LsIEMv2nE/oAlLgJjsabbjD0405PLYi5FihaDBzpH1MAfAJnRwWDZpKCyTBmki2faftJm32j1Gf5tSXu7x9WjFDLH47IDx7TiTD0mx0v4EH7dvoklFK4mfDyBxsvIqw1csUM2p/TMF/X6A8QVAoB1uTRT7eIWUcC5qbXREYTyxCgXpac6tsXT8d8VLl3FidqIjTbqpklGLhe6cGf4nOQCtTWrotYlzkv02cwTv/LNam0ZnNmOfUgeLE8l9RX6tCX7gjeQTbstdaO1BP/yQqtoTYmY604j6SQipP88OTLxd4nz2AGiFWJuLADSlS6EBozUtj02leLGgkYx1hiiD0SRxbJua8u/9C0R2agyfrNpmasMVhWwS3tsqvZ9a59kBHEQSFZ6dCAZ1iyndrYAfT07SAELausKUAQQAABEhBnudsfKCKHf/UdQA4AnAkgxs7IG2GTLc/Ev1TVk/cSuq5pTdle4Zi5v14tFc41oqwO8G4RttNQwf1HyhORyS0Nuqmg0ybdzA4stuoIHYO0BP4XqYAktjRkbfIFqFEj4zxtX+tielWAQJYfTc/pwEwpicoGAvUYeUBMeH2NXqSrYhIM0i92ikP8bi2D754A8Ypd3mNaKPtQa2AYjsC87YWtNZZd2hsbFs1Fyy71BccxSBFKoG5/E3AOwQzKu7DjS0iXragPLrLqsE6hL6GuAYz38cd0JnzKIKPZhp/z8Fm+jkC8qcaAieh7LBUoA5MpqEKi0nUaDYh8TR9gWxAFUhIi72+pSpJCJmn85g+AbGVuqJ60NU5Tx3bf39o190Xh49RWx+GBLGPzORw7JqQ89f1LdbFUpz+r0bcOAogDvq/lLOZFjFU9UQ7TH+wYOJ9Fd2Fna1pCQfWQrWQ5gsge+8zKc1hUJwgeoEKDYZb9TK9bwhOdWJI7FOPctrNWux6bpUmjFqBI0GDRLHhRdqzhKJE11w+XjdOAoGmvtPTqVLmy/S+gUtde/4fQDudUP21qk25fWk8HoarYORGYMj2CdZ8LgsccUenPi3fA17XNZXLw4WQlqKMsN8VmykHhh8bh9CI14Ah+fBwjsZZr8CQwbzLeZecUWOFOMbPo9mA0nQRdvR2THUl3kvh0msSIsSZp0rgrJy1O39na2ec5UHFD19xQl6PCHxXxt55l2EH1FJ2GmlM2T4Qwynbrq/jQoT+d/897/YAAbHu4MOFatjelSoRr1l7GeLtk4cTbysPtG4LbLYjUXD+jTHgJsx5k1Gsy9AvtgnezQ+BgCuRcM1cvR455PhIaxDuIVZDpA1oR55UjqxjtuBw14jm8u07p9FmAwNqUyDauweXYMHmb77vnOxRQKcqS0B0ZRpI945EwshEncOW33sLf9wgrUwZa7Rc8GQS1LY6tD4M9zTiqbwzaHFKfzaBa0vzC2hvNfZb8MeHNn3rsYxcn5pSSXMGsczNrgkB00wnEBKi6Ztsn56/nCxaA8YYi0VcFfy3C9FCY4iVRri282kFR3oRxgPYyVZn5Nc9O1/5EH1CFexR+t+8/g50iVnicW4f0U0ZMuCDbP/9fr4zEi0zE+EWW1tRDeVJgEIWUoqUSfpfdSginInUoNDmd1DL2cduPXAFO4wKZVD+/3n8qqvcXcHa58kwpJzNqYDtnc2c7qM9HEOBjktj0iFdN2/zOVFY4NmWLCXcoxkJ8g1zFK//ivOO58nOF4zNm81/mtwPHodejBEVU5NeYmNXeTuReaxG9Zn68ovlLXgAQ5UBQnYCjsWfw/8+ldTvGu48dIzW6j+du/bp816kMz8K+wtSgsBfvibIaRuYCaRt1PGUl9LfSs2nYJPEMMW+x/P2V8pfCPJowJjbhWHVoo4YRyJespNgnFVtKEvwW2mm4TdVvJorDttRAAABDQGe70xqK/9swq9L9o8aYkW8vSSg7WzUbhAF+W1A+q7XrnExINdHzifSDtnmlQFjpEPVXngX/+OsAq5nI0IBn/IJ6fM8gz6vUTDlVNAvjidAqeW9/GlHYZ61CVXN54VGhhHzCeFVC91OzmNEZ/HQQLhfeLwWYbr7C2Uoh7rs8iET2cWolzSATP4PPGdFRbyIVty+GIBvRGzEOEmTuUnOEP74lgBL/qWW1tk1RrVKq+k6bvmVAGCW8f/SxJPZcgirOT+MpgMC5UGUxXcpG9XGYP0e54huKVkPR6n5U3x5vpvX3e0kytOtVAnm9rRWucyngSLZshSR0kd5C3iVahoK4442LisXeEwj9ZJc1ClNAAABKQGe74x0r4G5fOV2+tn0B9kIbGKw3ECsAPLZJ30GUj4KLqNAp8JH4tYUqGxjkgIfjobx0A1UPh/+3Med+tClvqS6BCW0ABc+zRz579e9DKhiZod9PDAUF9dD42mjOet0zvJ9DW4zKNrJroS/waXGs/zf8Q/69bxfiqnWo1MpLUwIygoPncWroeRXTPa4+2XjrSc52OV5E0560JdD08GFecirqds/crV7A4enKTgEgnSluB5z0kcCuU6/tSP3gchlBVeJ1PkHtS3v3sRLkrDIQDllyncn23iH6Cyxyfeh3s4T26+ed9ONE0Y2M1Cj88BqSWk7wUSySQP5ULog6gcUUc9OKwGYKTSaAE0gIabxtj5GoQIS0nDJO6YlVXa1+NbFPFaZeHMj+G8KYQAAByhBmugmoECBAW1tbW1tbUh8D9QPzAAAAwAL/8PKGXJyVgABBJEVflG67UA4Adbmiia43rcHNQWhHfuF3GA6qILegB4qzQ0o/sHrJ7/QQjK0A0a/dgiSuqBoqtw0BDtgbNfAQZR6CsKK3w2iFyepWEsyZZDA0V70Ry3am4fJEoEotKF6ak4hVmpqSKLA9vMZHxevrweu0qvkiadX6ZWqe4gfErTwP2SecxQ/0jNuvKVuMy3n9h2c68ekMEuz+1Jx+6WGn3l3e/ASCsfT2fYZUEc4x0IncW5FgJlMw8cALZJpaf4XYf6q5JvgUw85ltTFaohxuOcfI/nEwLaBuKcxDjnU4n71GF5kpWxt/QzrDB8/QgMEwC5NaBIt7uhphxlpnE536h3xEO23S9vUFmkUoSca3GtQEBZCECTcvwrLZ+eu7JLXgN695xtk2lc6B9g5YGbUKMRbx85DI0z9ifwpFtutrpakABhLlUvkFsdHsQa5BHeqM83o7jTHOlgNflKiMuHBJNTgp0bvy7jtqniyTqr2ydDFrwL2h2k31AZcJ6T+aqPw1kAblE8rcWkIiwa85TUCCBG0E9srS3P5Er0MFqxy71mhDAOs2I8TuCbPSreBon0LoxAjsclPp5rR5bZ1YcPFtuyXIZg1gd5md3Gk9LjjIluDIBdXopy+fsB3rFxa0myor8PPqMVznGVIfU11jNc8GPTkgjcfaFLCg5+euksKQsJCq1BNg7JHx+pJBSS+x45AKZLQXF3nHwGPOHfWD8BLjFebtAEVmfC4tXE8vk5vDF7wuCmoORYJ3QqjzVmkqKzy67Ljzsmby5usE4tqY2iXKHSJY2BkflslKq+sHALu07eJpUy04j0g4edVqDsiBNT5F3soJnEUJ8zB6hEtgHLajFiGl2Kg1g2r5eU3uZNHVoDQJU3S/OQEhElxcplg2jx6GYmEiSUsIska9W+0zV3OGkkL5EdyI8pCJU5Uicmn1UiW8mrrLAfoZG4mNSfomz8r7APRXaWprQ2sX8Ko2RufnMhv6CTP0N0r+S6d5m6LYIViYeplDFFgELuWxMEbS6AMSTa1n38F0UwnKh5KytXlV9yst2bOiTo1d7wwydzgIFc+eEwjY+PrnSTyYhUbcJE4tbJGRVE0+VvzmTzbmO2+dPEUCWNp+MbNtw4Ofs/PvQSGqktj4tw5LG9RK2vMkj7QEaXX1k1ETM7U3AWD787yR4ZNfLl20Yx1/BJ16p1t7/vLbz2J4swyP06r1ZfqhIX40VV4T7zVcmwxWIVvCu5VyfiScloDybN/EM3wCS02Qgd8P/sHF8YWsO77iMEP916PRonUnav5/h/5KLJ03yQnZ7ZxEdzktZRgXCT2Gz2ChJJ1kogO6bQdzSE1nHf1pClxFa2E0APBXW2Q1o6Kb4vpJirT5TMkKYgC/h6jM+waYZsG8nrARETIrZuy1m41YGlQC/rULJtjEnWaFosHiUAaVwlPFvVMgAQ0WqtjdnXbehkO9O/w3gU3J4R0REX3SpmZ1G1nkmjWwgfH4Jokgc1A0w3te09GGWBtiRudJ9MOYKXehB31zqbaMRDbEmxos8IPQiCEXyG8XZKOL7niicmS8UzmiebuM3S5iPZTj7vDvBS7Y3VUhnV/xAIuDpd2jM/WW0r4fKb+I8rt1nTBC8kmRpxn313h2tAFk+qK//hGhWwUwQNqqcjdNPkKLwSyNyqSqEVdJZxSmVTuehEcabBVJkDG5JxTBzZtgwesKV3p5sBq24YkTQ6OO6lBMO17PHnZAEXlu6kFOrvNIuu66vJkub8L1HZyfCkJBUEov1UnTWJ6sVhXMtCZpIq1bbdCyDVVq1HS9rJTas+IzbX68HzbU/2U2oXLKsAnfmbHArRVm2KYH1gtpia5+4c8fan/6dnE1uem685++ClE63Xv+FnQXFzLE8Cug4n86DtB1d1qwUlcBDDFqUTUm5c4ZA2yQRQOETg2XH6WDShTa+Uk/XrLkN0rD5GNOu22GeLhq/h1plWF1dONP5+2XehHCYGfkEfe22qtIRt2IxpFPZ9gsvNzZ0dgBrQz4Bg+VzSszYVTEuMrpah5qsrGiLnYHkczj75d9T3q/iV8Y5VrIeuMKL3GE3wCsL6c6lfgA9lkJYDtl5yoFT09OcaCO4LRACSgVLyea6aBUlrO4HkHfOPjtBcSrtiX+R76w/PcuNFaNTeEtmQhCyaMwRZ5Ejei8hhgoGElLbUFbfvgbD1DVI1fquX/fsJ1O98W/ITsfmsRZKR0o0AYIY9QGhj+duO8dWy3W3bMew3T293/8k624556tWEhchi91XbbxRmM+q04OkelJXvYE9Yv1FONz6RZJeNrSJZwiXfZcVyfn5f9xvgg845ZiyIqRdm1AM1/4xX+g0SjhId/efOtmjeZ5IIZEJNG+j5wa9Y7r28UvPjhpSd7YpqBZ2BDJN13gAAABDxBnvfsfKCKHb/QuzspROrGVgIBO++4peEDUHQDGFPkRcNO+EHKqdN4wM3EdJf5ZqGqqGwvmjLf3VzFlHMk1BGLcw0ioXDAsGzI9CbHgquDrgspG5zgMuPe4HnjbbosJP+rtg5IyjDMHHCZllthj4r6mvPw6XPn6uXo2alW8kXOh9HKmCEjiRB65pzP19Ziv+KHwlPCTgK/IfgtwYj3wObk6jobi6TW/v+rqZx39sI55yMgiQzL/YfKj7Pl9Lb2sJ0rJkc7SgpWY1q8LN5PL+X4bqJnPDYPCRUMGDXfv3O41sU5Tixi98ycliliyW3eEt8YPpq6yNRNY5Ycu8HlF74Ckm00hULbe2hx5rOYhoTk0GbbqjhyBVkMBknvZVMQ+aRijHyy0eUuS0L6dyBfJgv7+do09MwUySbrNzTE/KrUMR943d4Vx3ugnrS53GDAmr6BXDq7yCWVfUQez05/kS8+bQgouFwvp9JoGtQnrF83NWLdkZN7gdpeD/XhWLRugbDNcbNK6wPgffmiQMHAIzoSF4er28KrAF2D/d81L3IxvJAYHgbR/LzfaSOc0MeE9ysP8VxJbgs7lik3UKBYqfVlB/8yTmbrw8Ol1LfJV2M/aXNV2d6N85iYLjLVjjfJnL/SnKdkM7x/QQuoovCrYllqTWyrEZXM11gRHsku6akEETUj7S2af5cv7IpEJ979xvTyrg6RQxHJ+mA2ZN6OcIm63+YgixQaVTSQigL4I7wg2apvAYj+jPKhAh2YyrvtXs+tAdfBpm8EC6QVdSQYWLVBDwbDrJlSydmBHc1wUGaR1QMWH2UpAbGlkfNAZxw55inN2/9Zdogm2lQSj/Vy068A3HJ6lMfBP9wYRu9Pp3tdXRFrfCKOGOKoDeWINTKVFZ8kenZcv5h46w8Si2e1APL8cMz0kT0yfLmCUpG6jBDrjzHN+OV2U/7lN8Kkl+GMR3CaYlxdUP+dftTidG+z3AV3DOGSANu3XHUXHcQZLxmuoy/eyAMgGPY6unS220u5uSNO5ypI6KJzumV+8Upg8CW8iraJ/gSpjVzZKtn3F77qeR+gKH/8dqsiPKIrRk9eQnbXdOa3M91LXrmFTeVW7V9yoVm7oyMGSoPbxmrTi4a7NLuWKP6RMC8uWlq0e9d8WwSUMQ84vquIIv4G8ES/e/4RSL1UYdaH66gmNYsue/to/7KQ2a13ao31+g6bZEwhJHDTlo76yg+yoN7zg25cQLv/mu0wV1d6iSZd0TBvusrWCEjthxxMYONlR1c/wqWKsj90cvKBJRci05CMQKExNu35JOR2FiOlWTD6IDuwnO94n+eJk1x6dNS10avLOr7LfpIYbWpwnJKu0zHu6EkhReoEbWohH/ndn6vL5Hs7ifQnU7wEDaQxqZ1RSC2rsIoVB6kWsavYTWoEqTwbPjW9iCY1jt8LKQUgutlcjGzgAAABCAGe/8xqP7UWx1qDg458gZuw7ZoOG6Y4AY69VaDThghUMhpN344fXI6Hq9TrAD5fQDEfiNEUcGu68UpNyvLY/+7Xnu7z8hEBLfpspsN+HbKuilWnwQhjFr7u9Tq8DjlnyGcL+NIcg1JH1bZDJX5cux/bjitFoNWH2ncD83FZ5nf+HB2GXO4GB6xaQh7AfXoWdDV6GVv5OBHjVstl/21KqftjqEfpwGm85hFysIZdOwDF3fyl335TyMLaZouatKzN0JUu0utrIR7Wklgl1WHTORdh6FSxtjkX856UpEkNdQWsIjosN+er7eySGDceQSGNjlYQ98xeayEfPde5iOV37gJDqWh7YPtGxQAAAVABnvgMdP+dxv/T/l0Y94cSOMpmEvx2YjqEpchTR5ULVoak+a1k8N1YmTrZCCNqhsxDsZEwaKTEEbv3cljH8sjnTo2xVRZz9LsN2uj4tNJnd187SwKCyZGyCBV+oI5S+R2d5ZpOSzrCHhbKR9aspBmCE4WoXbh21NmFaU7utLIFXD4k8LuTQtuaBYX6XM2rEnAre1jaS0jFoycwF9mOq8MLPYLlicL3twsMzjoPo31h5hhQTCDHgCUByCGFmKdw7VuJGuxuMIcE1bAIvqSSB6bZm9VSSdcM1uQ/szN3XYgMqYO9C2lSCdLOXRYBq06nB387y4hcylbKcg+VrRZOWBYtwfq+0lUgqeN+Qc/+8UmIl4FReiwEgX6AArpIcbhTJOrrCEPZzn7QCTo6gGqGd5ki2cEB1If6BcBc6rzCUHWO8z2uwZDZHIqIuiRdUY8ONmAAAAW6QZr4pqBAW1tbW1tbWyZTAAADAAL/x4MtKo5rz6FIVcvN3Sj+sIwiU8c5MQnk8uHKNaODLZc4D3OgXWcFSNLboSXczs29rnPl5WH2gmH7zmEpeuEnFmyTbOsnQBshFYfRQtuDoqHrbwhkqtYJzbaSeKHNkSkNTPXJ8C2zVGG30Fv3lkeEVC8pWHmb+y/s2A2aOPN3QNISe32YRyFZUJN9kOL3mUVKa3AHGH5cnxBljR48DsxnnStqcwOS7Y51vq0kOTViB16NKH9cslI13zw4tVPxtDzwTvioS2/PqxOvQjJoLfFHiqdaBwM03xT6wGb2fcV5v0Rp90V1IIJjwyncnAhC9qh+XOZv1VRf1luyYbmirgtO+11h0F5OVMg4BiU1igljN2sn4XwP8c/4dCingXVmszsSJyMAS/YakTKII4yzspZx2MCmyuQMaWA0AQWn+P87OHZi0rFoY8gbIvf9of7XZRY+JfHZLOebyMtdRfSg/Ia7Kc4f9kAyHUo4p00OOSPBhP+6NgDLLmhp7WbJhA9cTBY/6vB64DUGvbM2P71DypEexDIv9l9f2bRAgQtMdzfXV30WMvhKfqq52I7Qio++RTLcQ/g5TTdahSYkHLLloWzYaWkIECawAfvzdqJVd0h8/ekLqeOhneqCfM67SxUzah58CKcGtd0IYLpX4JShgRzD1AcmDOei3NZH4XbdfuahBJ85+LEbgTNKeQqHNtwiryfZ6OCdlCWCydk+nuCMNJRFG+7RmpH5SKHrUcB4lxYcybWw1XiOUgqepZ44nL8dOMl5YYJKBAiS5YZW43NRi3vu0ILP1uANbREwWJJV6x7Fb07xbcRZLV5z7RbbbCwsYfpJNRSfdU66pLLx+wELPnWtxb1/67roMS2lsYtOFkxDbYZvemqZcTt77f3nvpx7d3mkQkuUoJlh/9KHQX1NMb2YcT6/LeTCokCVIvbYBFSKg4DbzlIBxsOJetMl4yF7Zm+r5zvpyX1oiin+hW99FomtsLDzNEor5Bcj2t38sNz+Ta85KkMblmxvthyRVIZO1CtsA6MGkCgNhUtSDMTq6kAo953p8hUyR5TD2wgWMWDaxEpXHLUjEk22n5LSZVoSR6PanhAQu5tL374U6IAO4nKkeJrpHXg5R3eU5JnKPgHpqCwQpqXFAKqch9Lasz3MLZP33+VqcGvauUFNfZhBJdSuPSUUkB4FoBQJVGE9dC4c3goQ8wlRBpMU93/uaiijsUcqUAz9HbRNQdNwNWajeQhtrp4k3C6FdLmnB2jICpkS6LoOwbq2wDY7dQ77Kz7/VDGcB7v9Xi4Rp22+42BncVzMXPGBBNR6O0orhQ4eaHEFeFBIpuNumH/xFpIelm7hP/ZzRQVQWfTQ2Ra9Hf/eMNlEpTnEArZUfxkxb9WrhsvBX7T5f7jwpccqSRLwMZuhpcmYJKyYTG1vH3cMAxzaHpXqtDc11aYKOsZomal2QrrVv8Eo74ZoyzRK9TI5IocK/F+KjxIkz5ELjunT2Qw+n3Bd2S8ewIvIAcFaweymmywaqWyVCLo/5loX4PYgN4XaZOV87hGPvJtNd3OeylWPiTX7y5wsKxAnAARV8H9//5xw7M10FH+jhL4Ns3gQu6d6FEznA6twGbvx6jjPS7wE42nL/hIiPSoa3C5tAkuhuCquwGsGQRNL6gqANfxCrpHpScq6eN7HyQgl+AEgsJmWJvc6m5PCTeCMWlAk4fuqNtjdVtrohIYlRdo/2dyNN9SmoBwa5NiVWzhC+R7OXaJCEqAQq7CkAcQIM9+aRjwHc3ZKBv55/mlxJjKn+UKnB0Dz5kRVtLUdx3ihvBCZJPflmpp8+ld/jl7QTfKjku6UFV1NQbj+Jozt0dMS24BFNu254NeA8+bzMacO9LsVYp/PaexEL7gaQHejWMCI3NTaJ2mERL90/ZEFMJEXrM34xl+IiXgNngEag8MAAAReQZ8AbHygih2/5qTtAhowL6ZGH6NG8rXubpA7+EQY2lnEt6TwmnVBp6EfvtGWvrZWFgBYCUSmOh6lqVj7HLnlQHBLQjKqHdWTDkrxYSKoTDtWkVghf3FrvW60jrN5N4x/kKi/9xZjzHgoa1KFzij+Zb3SNKcpC/+S+w1mcaG65kRVDmpbvNDFxdiWoksgwnHSWPk2KnbFq7ZW2ynVZzfqddTpMkxmZI9FhH7vhaYfobn269SygzOWDlMemyqF1bGgZc+1zE0/FfdzTSx2X/I2wfVO9YAeUBUDpAJtNYw3NwRVnObuXM/o0GWxp0kz5xKA+6DFkm5xmETeCL8gB6PGrRttg6yN/XiMp9ckLL7ruDaey6mYV/CtDuXculsPe6l+FQamxkT4WGUM/YefB2m37z7NQvUM+oCYralsgFphC8j6FJ4iUquWoVik+hHySJD3T2WFqqKrM2/tycrGqQ3ba5NSV9IPSofGA/CyZ72z46ZBgKK+TI8e5GWXXNU08EaH39Px3fVGev6kvPNCwPEIG1JmZSW1M9WZKasdsBSqwNevCs/pHHSo/Q5d5GWS+XRAM+c+UAmJHLIiOAL/BUeZicrOTOwK0Th7bI1gP7UgLtEYyHyLJAoXGMqAKmpa6KIl/a4gkGEuw8zmHyBkDaVj1RtlUU9q70cqkr3NvB5tg0ZGoagrOepLJrN9UVAJj8+p+L1U0ddNwsVat81LFT6nPy+qMUHiZZ24LhHPrkpRDZuwfHgUSYTVY7sneKcRR6qzSpCIMuh9uJpPNX5mB6A6PpCvyv3LNJFAOBnfPv+qWSCFnukXuKYfip2X2D1M4FtLtXyD42hLsn/A1pAxtbXZgIxCAYwb9MQ+hFlqJGGJzmr1sH5NmeW46JFBNE0ejKU8VOxjVhpuyf98T1q651l2RRPRK001P6MKwZdd2CYJsGb/1kcgde4jzwW2v05MZM+xMD/mj6PXW9qpU3HQxyMhnkmuit4LsEohJTYnuMJq8WWkloSj6Q3qziFcUhvwRnoWBtRUCZIO3tJ9kZluRmrPW9nQIGEkuWHyvAdlp7+Z7SV6GJnfIpPQvm+2HasMO8qY7UkX9wzE7S0n5fljPimSMsItuKiclNSzdSYMEa70VttR4vY2iz4Z9ftgTH+/PZSZOFcEX0+m1X4bwrgSG0Bux5GPUPyWdNGKXuFaKxk0cEYMExfR4GmFwAB+I6NK74hoU0v2HJJdciER1RlMJprgQe58IbrFEHsyyFktdXaq0uJptlQqty8RBhSViOavn/MTb5qfAmt5R6CrkJ7LEMD8Orhp307GtnjS4e5+8Tb8veh2x3kpH0eNHLHCZlsgJvQEFqzignk99Bf3vxbpsbsLkBkPvadjLpLL4O4bNC79n8s9+oAps09RUvxg3EzEkrYSS7z5l2FRjDk1qSc3hpgopYjAnB/IEWbAG908I0NcVGUR8AlX7F4k6qzpbfB2VCDGnrbnGXrwD8hSiFR5vDwAAADzAZ8ITGo/o+XO28iTwGexs69sCZTdLibwx7OT1vSRPS3XIc6ZM6mAY7TvW/LGhktVGhqDUTWH7PlgV+frm7RRWfv4x6g/QCo8vwjNrsst1B7emGMc2w0s1Oaju+Cg3Muxb3zCx1PXz7Vqt+LYU5PEJrkC4vNrJz7xJRxVWE8RdwE9e9NODYopvC+AwCDYFNUWlrVHpLNCd0Jf4piuOQ5pTdHaZvqgUhxl5xRy/FEPxbwHRUhPcndoir+v+k1YKW6aXqkR9wv93BJdb20Fvw4YYuHsnVPNjoq6p8gY89msMTZgdFXGLVFWd6w/Nwh6ZUmKjTaPAAABYgGfCIx0v3rcn/+YrYqqn3/yqn7lJvSwdmOBRtvRutm35atDx+HV9tEILONoRb/l3gpoJOzOmNtfXL3/xdVGvg3uxeEiAIBXMInbPr+YTFMWVGy7p8ktNM6TGrrebv9HKMl5GxA5GCIOEHk0zuO0JUDImNICM4k1wRh3I5CHUqbx0iw0STvx48XfsNnXkEaLmS29FEyRmNwPVUCFNP0gxwsmYvQoIo8POvJYcRNJ7UVwUV4NSOYoBFRgarGX6c/UaL0/6QWi+etLBn/8Ad+/ujwtOuel3o9viYzZvepoff5aBMT5+AIeFDn5JPgPcgCOg8xGxqbK/1Lg4ehHrTWTV7mB6cMYtIfR9O4n0QTVnsE0HhhDD23+GyHk68NCNphmTH4Ghfr5JqAIbWKGfJKi/c3YXKTGWLKl6ByitDj3ANnvsOhBIUX45M3NGPQG9mgssKPeixNTQUxmJAtAjhwrEnpQhw==';

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
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card',
                 '#history-list-container', '#gear-modal-body']
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

const SRC_NEON = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAa8bW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAALIgAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAABeZ0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAALIgAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAUAAAAJ0AAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAACyIAAAAAAABAAAAAAVebWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAoAAAByAAVxwAAAAAALGhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZQAAAAUKbWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAEynN0YmwAAADCc3RzZAAAAAAAAAABAAAAsmF2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAABQAJ0AEgAAABIAAAAAAAAAAEVTGF2YzYwLjMxLjEwMiBsaWJ4MjY0AAAAAAAAAAAAAAAY//8AAAA1YXZjQwFCwB7/4QAcZ0LAHtiwUBR+eagICAoAAAMAAgAAAwBQHixcXAEABmjIqBksgAAAABNjb2xybmNseAABAAEAAQAAAAAUYnRydAAAAAAAAQbIAAEGyAAAABhzdHRzAAAAAAAAAAEAAADkAAACAAAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAADkAAAAAQAAA6RzdHN6AAAAAAAAAAAAAADkAAAKVwAAAUsAAAG9AAAAXwAAAbEAAAIgAAABtgAAAfsAAAJuAAACEwAAAFQAAAIuAAACiQAAAiQAAABMAAABwQAAAn0AAAFCAAAANQAAAbkAAAF7AAACtwAAADsAAAGDAAABugAAAxkAAABVAAABUwAAAiMAAACTAAABigAAAdYAAATAAAAC8gAAAD8AAAEtAAACSgAAAiIAAABHAAAB+QAAAowAAAKFAAAAQwAAAb8AAAKTAAACFQAAADMAAAGIAAACHgAAAEUAAAH4AAACCAAAAlEAAAN2AAAAYgAAAUwAAAJcAAACZwAAAGYAAAAlAAADHQAAAmgAAABUAAAB2AAAAEYAAAImAAACNAAAAbEAAAIoAAAAYAAAAWwAAAJnAAAB0gAAAu4AAABWAAABzQAAAfAAAABqAAABygAAAEoAAAGkAAADuwAAAEYAAAGDAAABmwAAAlcAAABAAAACaQAAArAAAAB9AAAB+QAAArAAAAG8AAADCAAAAFgAAAIuAAACsAAAAGoAAAFNAAAATgAAAy0AAAJjAAAAUQAAATAAAAItAAACpgAAAFUAAAFRAAACCQAAAGgAAAFsAAACRAAAAfMAAAK/AAAAWQAAAboAAAJ5AAAARQAAAUQAAAHwAAAB4AAAArsAAABgAAABjQAAAfwAAAKtAAAAagAAAi0AAAJeAAAAWQAAAXoAAAH+AAACuQAAAjcAAABKAAAB8AAAAf4AAAILAAAAOAAAAnsAAAIAAAADJgAAAEwAAAAXAAABZgAABC8AAABUAAABGgAAAb8AAABdAAABiwAAAX0AAAH7AAAARQAAACUAAAQTAAABawAAADgAAACoAAACAgAAAdsAAAKjAAAARwAAAgcAAAGHAAACgQAAAIwAAAGIAAACHAAAAFgAAAFDAAACEAAAAkIAAAKVAAAAeAAAACwAAAGwAAACKQAAAZkAAAHqAAABswAAAjIAAABRAAABmQAAAjQAAAMUAAAAYgAAARgAAAKGAAAAdQAAAkMAAAKTAAAB8gAAAu0AAAA6AAABnwAAAvIAAABfAAABjAAAAbkAAAHwAAACuwAAADgAAAE4AAABuQAAAmAAAAA8AAABzAAAAfQAAAB8AAABZAAAAiQAAAHhAAACoAAAAGgAAAHkAAACJwAAALcAAAF6AAACCAAAANYAAAJyAAAAaQAAAU0AAAJLAAAASQAAAcIAAAECAAAAFHN0Y28AAAAAAAAAAQAABuwAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjYwLjE2LjEwMAAAAAhmcmVlAAF2gG1kYXQAAAJzBgX//2/cRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTY0IHIzMTA4IDMxZTE5ZjkgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDIzIC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MCByZWY9MTAgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDEzMSBtZT11bWggc3VibWU9MTAgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0yNCBjaHJvbWFfbWU9MSB0cmVsbGlzPTIgOHg4ZGN0PTAgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0zIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MCB3ZWlnaHRwPTAga2V5aW50PTI1MCBrZXlpbnRfbWluPTIwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NjAgcmM9Y3JmIG1idHJlZT0xIGNyZj0zMi4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAH3GWIhH//3ouooAAgD/1zZXE8RtBeYNkf//LqNr9tv/7qPQ8vWqMNx7yMqG1pp+1tZ1VrW1tZ1XrW1nVWtZ19a2hzB/+o30QIXuouJAhaHFQ8P+3EThZUy4SoFTfSjT02//n50NMLyAk61Kay8u9c94GfHPt/HH2ud3ofCtdL+0E5WOBivHJL4M7GFW/2hAcZZra2sWtjpm32trOvrW0RJqja2tr/U1QlVeQF48BR9Yzxb+SAwYwqa/5r5p0Tw3P5GZd5IYZxwWGXzdzc3Lz/NhooGRVrqoF/xx3/b6jKP+9wmQQAWNWixa3vWL3viKZ8vBpgk51f8SkK3tZ19abtbW1tZ1va2tpxKt+/Of6UhrfvDfT3NHf/h0h9jlWVDtZ1pt8Czb13uKdW+tf+VoW2GFq3Kz98fBP9rXm6Z52nE/NDD5sNivc8PM7/mJFf5ld519aHuVbW1nXe1tbW1tYnd5kFAyqJvL/8mHRXfEDlKv6ZXme1MtMrmd3nj3/a2tra2tra2tra2siExEKN3i1IpmrX548moKBp6enp6eaP/paRaWlpaWkWlpaWUmLhw3W9/M70tvT08zMhSp6emCGuuuuuurrrrvk54Lhy5VPTEzM2qenp6YJ6lrrrrrq66665OZgs6p6enme9PTDtMXUtdddddXXXXXfTBURdPMxJe9OdlPT09MN1PXXXXXV111zdpveVgmKuR6bp6enp6YdqeuuuuurrrrrpjlTzP/T0ww2nmYZT6npi6uuuuuurrrrrrmYW9T08zNvT0z0xNM9T111111ddddLfT09PT09PT09ddddddddddf/D/h8Ek35dP/wRIn5OphWmEkJMzGnphWumEalrrrrrq6665o5aqOUzMOUvTG0xzpmbM+pWFa6Y+p666666uuuuuaGtU9PT09PTLXT1CtdddddXXXXNHBetfw8lUnOEAp1rAxyon09odkC8EP+mnp5nvMx2qemCGunrqepa6665vVYu4WUTrfbU3X6+OFGkyv69bvr+f0w+Gz79Ow/eZsnqnp4p/Vr9PNH/11zPqrq6Z65tanhQP5KiaW8TQnl4klb/08s7EEE1N683GvE/J5naeJ3/M+qenp6Y+aP9XT1zfq66+VKm8MzE4cBBUDuSvozD943Ev9Ob5jdf/UtZcqS9qrqVY2stt/1H3/6M10ZsWJT39/9/+gsQt+ajO8fvu//0LBu86/F3IScmct4ygUP//XRxj+jrNnki/+uuQ73tuXq61Mop6enp6YTpjaRaeuunrriIcLpadMIFUVOpu8SSfTu//SxwiK1XrBRSz5D95LvN/3FZsC5Vb8E7SHua7MvSB/bo73f/yRIbjU7bh2yRkKtuLfnvxC0G/p/p4WaOoe973ve9/rWnp6YRpianp666675FtBZS/8i+knYdGVm6gY5DI+QPipAIPfk/8ifJ3N69aiePngv/v7kR1q0v/kOV/39xgzISS47U0Xp6enphenm71c36upa65/18uIc0zWtOvBYCKem/N/Otlv+kxWpaGvayyt5Kuv0h9gk7+p6bpx+ienphGZu9RtdPS11111yLEoNF9LMQUPoGmdCT09PM9PTE09PTDdS109dc36uub9XK9Ph6/XTBcCQTyJLCiJIA/be8zagrU9PT09PTDtdLV10tdLS1yczHBvxrywbJnk7kiK9Drhs8MdUQy3I2tdeCzE6+qaf/a/2C8QZjpz9F17/FOTgrq1/+dPtRgj13pmdPTC9PTFzdqum6666666jDf6EieB7DS6zdRZLjffr7ouyrrXcQL1/+SZ7vlXmzRU4/c3fT//7BIK12meymdtPTyMXTLTE110y1111111isSRP6YgIn43M7E9MSqbhJmYnv97/lT0wnTdEPSLSdddddddddPTzMOZ6em6IZ09PT10wS111111111yvgW4NImuWwgCDU2Q375NDL9UNoD5/0/P2ivsERNfFdPT09O6YVpnm710xdddddddddPosBqac03D0mbsmt+J/4Ol+31e+dmw5KHNnnn4RAyqS9jjfj50OO7olZVK9bpkP08jCNMtMfXTddddddddczDDtMwo/pnL6lYRU27zMQdd5nvTCNPTCddN111111111Dj/D/TYRpv/RUtOw7TqEaXQ9T5P/OrLzP+msvZh/D+wiMT09MI08zH+pHq666666675oW1/P/yBwVu3Gqc0affvbNEQG1DqcUbeCeX2cjcf9iXp8jMUWrcWoJSau9tNZmIn8R3pxLzN7UxtPTCdXXXXXXXXXUJKbTtM91PFP/e/zSn+qJmdi/M61J3LL33333333za1EkGOap5nf9PV/h/SiMcupf6k8U+fXsszieDaRJPpVtbW1tbW1tbW1nXaVEUpP4fLZjYdJ1umP3Bna1/09v7DXfvL+vzO/V/zn/wWa5Zd+/NPNzXWowYFZUh5UjXgsMFnNy+Pz5sBeadF1a2tra2traqddWtqp0KNSp0cJURl9WEz7m/94b8IV4rD7H8qaX3rx5QAh7/pk+ftZrdnI+G/Jv/IUVvxigIX17iWY+noiLflntS1qTDoZqVZ0nIlraxa1p/lW1tbW1tZyHNzryE/+vICIg152ZLobD/k7/6DTrszbKv309vc1/b0kBE73ei6Jps6VyoI1PS2tra2tra2s66tb5/0nEoVvOmXzzqIH+iP2AAAABR0GaOPhQv//RKquYpdKxHyVZJA1OuvR0lWXCnHE+xq+8IRiWD3XydXjzvnfwP6ss7x+AuV7wL61v1nSXjhnZ2A2FhSdXhD0LZi94SX+A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';

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
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card',
                 '#history-list-container', '#gear-modal-body']
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
        where: ['#badge-photo-display', '#emp-detail-card-container', '.emp-list-card',
                 '#history-list-container', '#gear-modal-body']
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

               // 작은 칸(관리 화면의 34px 예시)에서는 띠를 줄인다
        const cv = L.cv, ctx = L.ctx;
        const T = Math.max(3, Math.min(L.f.ring, Math.round(Math.min(W, H) * 0.30)));

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

// ---------- frames-video3.js ----------
// ==========================================
// ★ 영상 테두리 3 — L등급 「성운」·「격광」 · S등급 「자전」·「세광」
// bundles.json 에서 frames-video2.js 다음에 둔다
// ==========================================
//
// 영상 네 개를 이 파일 안에 글자로 심었다. 따로 올릴 파일이 없다.
//
// ■ 검은 바탕은 어떻게 사라지나
//
//   알파 채널이 없는 보통 mp4 다. 대신 칸 네 변에만 그리고,
//   어두운 판을 깐 위에 'lighter' 로 더한다. 검은 화소는 더해도 0 이라
//   판 그대로 남고, 밝은 빛만 떠오른다. frames-video2.js 와 같은 방식이다.
//
// ■ 원본에서 손본 것
//
//   · 왼쪽 위를 가리던 흰 뒤로가기 단추 — 오른쪽 절반을 좌우로 뒤집어 덮었다.
//     조각만 덮으면 이음새가 보여서, 절반을 통째로 비췄다. 좌우 대칭이 된다.
//   · 「세광」의 오른쪽에 걸쳐 있던 회색 테두리 — 잘라 냈다.
//   · 바깥 검은 여백을 잘라 내고, 폭 240~280 으로 줄이고, 5초만 끊어 담았다.
//
// ■ 값 바꾸기
//
//   fvTune3('성운', { ring: 18, bandX: 0.3 })   — 새로고침 없이 바로 반영
//   videoFrameState3()                          — 지금 상태

const SRC_NEBULA = 'data:video/mp4;base64,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';

const SRC_EDGE = 'data:video/mp4;base64,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';

const SRC_BOLT = 'data:video/mp4;base64,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';

const SRC_LINE = 'data:video/mp4;base64,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OjEuMDAAgAAABF9liIQTxFigACG7tGRgXqBnIF/P/Ohw8yH6db///VBE4IfOsEPiLeJUePfr77lnmU1GRxsBeZdvzoyi7TpmILRal4tP124iPEPBQMYKP49cMxQIfU3x9f/mLEP/C6ISWrtNubU//MiJNP86tdFqE90Ap/6eLsPMmFNP9PT111xVhnIRWn/j//oFZFZvBORU+nnQomESdMYZUijzOX+gWFZ8ua/p6eu1tbW+eGf5kV/11112tpEw6yJazr6IV8qRakd9989/23T1zamVfM/q666665v1c3/SH0tLS1xUcbm3v55ltF+3r6Z6QulpaRaWunm/5oQ1TPXXXXTxMOEwjp8vJUwzV11dXXNEZVc0wXqCzvMPw/DYhazfg9BKwvufphOuuuu1tbWuuuuuabX0+B/IGwpWnVYKOvPD4lvU2oLzTNBooArJT1DNdddddddddXVxUKG5pvf+keH4MNuvVTrg8UFG973iCf4rHkAuj93fvD//sNkN5V+sm1r6eoTrrrrrrrrrqWriWONxu//8bBWEOTjavXyvTPM0T2p6hWuuuuuuuuupaunphonTExUYXAEBKr/wY2tn/h33fl8n/p6heuuuuuuuuuuuKpy2/foCFlr/BUFh7Jev6JcRvyzp+p6666666666667QVnWRLWbjupalrrrrrrrrrrpuuuuuub9XXN+rm/V1111109dddddPS0tddPXN+pa5v1dPXXXXUUoZkCHHn+9/gNuv0xdXXXXXXXXXXTddcLQgE+Of/XwGN3+mLiooL1BZm9/FMwQ0cBWStetMJ1ddJ0tLS0tLS0tXXNEG5tw/8ew2OrquNCgVvdd5ybzPBfQk0CuQe/3v8StT1DtddddddddddSxrDTZu9//x/Sw3p1XOuCjueHxDyeZmU2hZoMUzK/5Xyv/Sa19PUK1111111111dcpMzDAWoLTE3meKaKcM4uJVp96eoZrrrrrrrrrq65mFPaAH+VdhvJ++VFWT6rMR/xFCBwEAxxi0JJEUnJ/6euuuuuuuuuuuu1jSIuFXT/nz5+blylqLrrrrrrrrrrqWuu1pa665u9c3eubvXN3rm71zd6665u9dddddddddddddddddddc3elpaWlpaWlpaWlpOlpa65o5QXo2ECclWv0wvV1111111111LXXFQwE9HAUde/xD6mo3poSaD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qsPUz3kFH73iGc2JkMoFxSCC/73//j2GzFX1m+sgrWtaqnrrrrrrrrrrrripQ/QQX/e9KdKTx2GzL1UnXo0K39SEzNKjczICFkHJKIPJ09ddRtdddddddSxLMNUdnT+GOyhRV9ZuujaGMaX+/r+2HpSwWEm/d93uEmiL7r54TX5qenrrqEa66666666f//9hcKTMdPqnjJwiQ6xA8gP5f0ZWl/6GmKvr3vugTfrzM5+9MfXV111111111xkcXUv79GQy/6yDiRKve/fmPl64kk+J2I347aulrqEauuuuuuuuuu1tCiYI3ebdlIXS0tLSLS0tLS0tLS0tLS0tddddS11ddddddddddddddddddddddddddddddamhQPlBBfX+zI3w2bN3N830WHrWmNq66lrrrrrrrrrqZf/BKeGwt1p1QV/vTxkaC6kKCz+f3h/t4yBsQsN0yZ1kTdc1kY+uuuuuuuuuuuuKw/QQX/e9eXSlew2O1HkxZ16NK39RBB5t6ZjFRuZoIaOJJmPTap666666666664lwlFHEHGmYWCejkjNEEqZmN2hJoFMmb/e/2p6666666666666eZiBxA1PMxYcHkFKh/kr+QEhAor9ICeuuuuuuuuuuuuZ3fQE+jI3seTXY7e7off9OZhMuJUMxAOcGg/08/QWoQx4relpaTpaWlpaWlpaWltYxDhlkjK9NPPJeuo2uuurrrrrrrrrrrtb66666urrrrrrrrrrrrpa6666666666666666665oUHFTJPXXXXXXXXXXXXUXNFGxMk80oXKoLPa3h/hsUs3rrIm61rbCNS1dS111111111zQkbpvh//DZpPXk9B5d73ielQqx5BTf7/w6J1IFza25vowxJLvEQibWKZa666666665pg+GRDcokkeVBf/Wlm9hcVrrJyQVnY2mmiBlUU5pNdfXOGhi/GtNHPy9umE0VL/SJuTUtz1XS7/sNvLcun0Z+byemF66666uuuuaEjdN9MaJ+5NQYr3Ogj7L9EQvn7ZfHlyf79Bg2jHtFvcf/D8FZDQ5pV68zCpcYmiCqPyEKfnRUuKJSDHUJ1PXXXXXXXWmdDhPo0zraJJdHGa/8AAAAcZBmjgv4Evjd2MT3A3ALJeP4TBl/wMPAj+D8H2EEYn9/t4F8B4f/wZ8RPiL8BF8BD8X/3YHIEQWC54Oou29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wCT/Bl3L8mB6+Fhev9YCs1ygM0FSj7laUlyhjnhXk+X5db8uo5o+AAAGAGWIgg/EWDUAAQuUCX/6WJJ4zquvVVhetAqf8nOkJOX+eo6j1QX9VrzTqIeja6dOi6mgUX+vgvPGgVwzQnQ2hEb5k++9REKAmWVUimF6Am7FF//2xtDB/ppnSCdVYlR0wLOqEYrqutavVKBRf6tJp4gII6zhuURC7lVUhc9CoNv4LBUzS4X6Zd+b9xv/+gsOdTrfp0EyCQh9Hzb/8To5BQeGR8fw+/DQt3eN+v+Htt4SsINNbX//aIYXae1taSZSPf/8cFlNTE6Adl7v6dfbzpCOsok6jX/10U69V95EOM6hIqhOo1qjmP9Dq3cuffTj98S4dY15TxEeK039f/QYN3vvOkzuWjnw6IXsTqcj60PEuKYsT+9p09qbtJISoz4iOmqtZ5gjmrSPXa2htra3dcTMbpZ5Da8sg5RMWfuW+++++uouuuuuuuJYcDdS89p0qE4apj0xaqEa66lrpaWoUNgQmAGdru6//+f/UJ1LXXXFQsFhyX6/rlUdvMOxPhzz+987TW0FcZ1wRCMT5cT0wQitRtdddf/5JpggDFYWqv+uXoSzLqvrWghw+O38NmN40mJlV0/3vTCtddddraITGtTn66666jASLQdtDRcPx5pvRxdRHtzrG0DI/rWJe80wTpVlGK8op/yBtG6rk65Ij/e9MJgpSYouuuuuuuuuuupY2OAm7KONEn+tf/7dx1VWq1WZhcrRgr1q5CTbpJLMyyBuECqb9e3mz9amZCKoKqenqGa66666666664kg4JRjjISYoDVCk3+9/oxRmYYTDzPSzOTp6eofrrrrrrrrrrrommCAcomddc0TP6wVveVASi+b8GRmbU/4K9MNKZ8VHn/TG111111111111/RE/BOSgbESo9d3jQguIBzvV8jr5uf4mw+yeiIRBkBshPGhR1L+k3XXXXUTXXXN6rrrtCBpTogYyz5f6/oEffFXb111111111111132tk109dddddddddddddddPXT1111111110tLS0tLS1zYJhxVSMV4eH+G0sL10dMkvVP/eZhe9J0tLS0tLS0tLS0tLSCBv25qjoHw2asLVU3Ijis9BI/1lJ2YpfpliCV6rrWgh/H+Y5B47N8r7yT/e9MMk6ia6666666666uJhgF1I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B8ZlBvzw+CsRlyKerTv09Q/XXXXXXXXXXXFTBFZou3v8KYlQv4MAx0rvBtF91TrzPKkRuO9Oh79TCNddddddddddddrOjSJazTPKunrrrrrrrrrrrrrrrrrp666666666666666666euuuuuuuuuuuuouurrhaEgjyX/v8Brr9MI1111111111111wtHAja+f/XwGu/1xWF6gs/3+wB//hsJG/1z1r3ph+rrrrrrrrrrrrmjpqFmYAxei+dfrHrnxoUfuushMzQ8gBeX/H/sLyr6m+sFYj09QQ11111111111xTDBvW9/w/zw2FwlnXJxtDWI8UzHifN5mMJyT09QQ11111111111xLHB2mGlmYWEVF4phkKaarX6enp6hWuuuuuuuuuuunjmCxP/6fp4qFwgAi1gFEAxp0/wmhQxqn//yCpheuuuuuuuuuuuudBDULqCKlT1P//EpcvT/EZcBaqI/Tof9UtddddddddddddLa1zf03aub2KWlpZntXN2K5valpaWuZ7UtdLS0tLS0tLS110tLS0tLS0tdddddddddddddddc3qnmjDcF6F4WGEz/vf5Lr9MEdddddddddddddf/w/hsPdadQVu/082t8P/42G2uq8k/96YbqLrrrrrrrrrrrioUNzXv4phIcWn/rITFTjyAbt7///9gilXrp6eoZrrrrrrrrrrriWKGqDfhJhAJ6OWU7/nfNDx8dmY0neZsT+lmYaJ709QX11111111111zMdqKYaMzfWvp4qLDg8Ag2/8G/Uv4KzZcl6vfph2uuuuuuuuuuuuLjDdb/0BGb8fgrDHY51+vK///8EYdfggBmtEdPXXXXXXXXXXXXazrIlrW6ja666666666666666uTrrm5kmpTJORNGSJX1PXXNzJMQUbDJKnXUtdN1ddc0YPca/6x3LhAVrJnJgx7jT7baafb79VHT0vNmqxevpV3XH/od2lzZX3/T2qPn95fYJL7jNT1/yV7Y/XXNiOlstmYLMu3Tp2zoyO86IWjQmk//b22/vN9bDv2C0aTPe3T+nphmuurnXUyxp8kY2ySWdZaIxDx2mb1SLEzclnolytZlcaqnScdqemEa8A=';

(function videoFramesL2() {

// 테두리를 그릴 자리
//
//   #history-list-container  기록 줄        (frames.js:357 이 fr- 클래스를 붙인다)
//   #gear-modal-body         테두리 관리 화면의 34px 예시 칸 (frames.js:310)
//
// scan() 이 el.matches(s) || el.closest(s) 로 보므로 바깥 상자만 적어도 된다.
const WHERE = [
    '#badge-photo-display',
    '#emp-detail-card-container',
    '.emp-list-card',
    '#history-list-container',
    '#gear-modal-body'
];



const VIDEO_FRAMES_3 = [
    {
        id: 'v04', g: 'L', n: '성운',
        src: SRC_NEBULA,
        ring: 15,          // 띠 두께 (px)
        bandX: 0.26,       // 영상에서 좌우 띠가 차지하는 비율
        bandY: 0.19,       // 영상에서 위아래 띠가 차지하는 비율
        cutX: 0, cutY: 0,  // 영상 끝을 잘라 낼 때만 쓴다
        over: 8,           // 칸 안쪽으로 파고드는 깊이 (px)
        corner: true,      // 모서리를 영상 모서리에서 떠 온다 (이음새 없음)
        plate: 'rgba(5,4,10,0.95)',
        opacity: 1,
        bg: '#07060c',
        where: WHERE
    },
    {
        id: 'v05', g: 'L', n: '격광',
        src: SRC_EDGE,
        ring: 15,
        bandX: 0.16,
        bandY: 0.11,
        cutX: 0, cutY: 0,
        over: 8,
        corner: true,
        plate: 'rgba(6,4,9,0.95)',
        opacity: 1,
        bg: '#0a0509',
        where: WHERE
    },
    {
        id: 'v06', g: 'S', n: '자전',
        src: SRC_BOLT,
        ring: 14,
        bandX: 0.17,
        bandY: 0.12,
        cutX: 0, cutY: 0,
        over: 8,
        corner: true,
        plate: 'rgba(6,4,12,0.95)',
        opacity: 1,
        bg: '#0a0512',
        where: WHERE
    },
    {
        id: 'v07', g: 'S', n: '세광',
        src: SRC_LINE,
        ring: 13,
        bandX: 0.11,
        bandY: 0.07,
        cutX: 0, cutY: 0,
        over: 8,
        corner: true,
        plate: 'rgba(4,4,10,0.95)',
        opacity: 1,
        bg: '#06060e',
        where: WHERE
    }
];

if (typeof FRAMES === 'undefined') {
    console.warn('[영상테두리3] frames.js 가 먼저 올라와야 합니다.');
    return;
}

// --- 표에 넣는다 ---
const have = new Set(FRAMES.map(function (f) { return f.id; }));
let added = 0;
VIDEO_FRAMES_3.forEach(function (f) {
    if (have.has(f.id)) return;
    FRAMES.push({ id: f.id, g: f.g, n: f.n, c: '' });
    added++;
});

// --- 영상은 종류마다 하나씩만 받아서 모든 칸이 나눠 쓴다 ---
VIDEO_FRAMES_3.forEach(function (f) {
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
    VIDEO_FRAMES_3.forEach(function (f) { if (f._vid) f._vid.play().catch(function () { }); });
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
.fv3-canvas {
    position: absolute !important;
    pointer-events: none !important;
    mix-blend-mode: normal !important;
    z-index: 3 !important;
    border-radius: 7px;
}
`;
VIDEO_FRAMES_3.forEach(function (f) {
    const sel = SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap'; }).join(',\n');
    css += `
${sel} {
    position: relative !important;
    overflow: visible !important;
    outline: none !important;
    box-shadow: none !important;
}
`;
    css += SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap > *:not(.fv3-canvas)'; }).join(',\n')
        + ' { position: relative !important; z-index: 2 !important; }\n';
    css += SCOPE.map(function (p) { return p + '.fr-' + f.id + '.fr-wrap .fv3-canvas'; }).join(',\n')
        + ` { opacity: ${f.opacity} !important; }\n`;
});

// 회색 구분선 제거 — 영상 테두리에는 덧선을 그리지 않는다
(function noLine() {
    const base = [];
    VIDEO_FRAMES_3.forEach(function (f) {
        [
            '.fr-' + f.id + '.fr-wrap',
            'html body .fr-' + f.id + '.fr-wrap',
            'body[data-ui-skin] .fr-' + f.id + '.fr-wrap',
            '#employee-cards-container .fr-' + f.id + '.fr-wrap',
            '#emp-detail-card-container .fr-' + f.id + '.fr-wrap',
            '#history-list-container .fr-' + f.id + '.fr-wrap'
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
css += VIDEO_FRAMES_3.map(function (f) {
    return '#history-list-container .fr-' + f.id + '.fr-wrap *, '
         + '#employee-cards-container .fr-' + f.id + '.fr-wrap *';
}).join(',\n') + ` {
    text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 0 7px rgba(0,0,0,0.85) !important;
}
`;

const st = document.createElement('style');
st.id = 'frame-video-css-3';
st.textContent = css;
document.head.appendChild(st);

// ==========================================
// 영상 테두리를 두른 칸만 속을 비운다
// ==========================================
const cardSt = document.createElement('style');
cardSt.id = 'frame-video-card-3';
document.head.appendChild(cardSt);

window.fvCardBg3 = function (a) {
    a = (a == null) ? 0.15 : a;
    const sel = [];
    VIDEO_FRAMES_3.forEach(function (f) {
        [
            '#employee-cards-container .fr-' + f.id + '.fr-wrap',
            'html body #employee-cards-container .fr-' + f.id + '.fr-wrap',
            'body[data-ui-skin] #employee-cards-container .fr-' + f.id + '.fr-wrap',
            'html body[data-ui-skin] #employee-cards-container .emp-list-card.fr-' + f.id + '.fr-wrap',
            '#emp-detail-card-container .fr-' + f.id + '.fr-wrap',
            'html body[data-ui-skin] #emp-detail-card-container .fr-' + f.id + '.fr-wrap'
        ].forEach(function (x) { sel.push(x); });
    });
    cardSt.textContent = sel.join(',\n') + ` {
    background-color: rgba(8,8,11,${a}) !important;
    background-image: none !important;
}`;
};
fvCardBg3(0.15);

// --- 캔버스 달기 ---
const live = [];

function scan() {
    VIDEO_FRAMES_3.forEach(function (f) {
        document.querySelectorAll('.fr-' + f.id + '.fr-wrap').forEach(function (el) {
            const ok = f.where.some(function (s) { return el.matches(s) || el.closest(s); });
            if (!ok) return;
            if (el.querySelector(':scope > .fv3-canvas')) return;
            const cv = document.createElement('canvas');
            cv.className = 'fv3-canvas';
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

        // 작은 칸(관리 화면의 34px 예시)에서는 띠를 줄인다.
        // 그대로 두면 속이 거의 없어져 덩어리로 보인다.
        const cv = L.cv, ctx = L.ctx;
        const T = Math.max(3, Math.min(L.f.ring, Math.round(Math.min(W, H) * 0.30)));

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

        const plate = L.f.plate || 'rgba(4,4,9,0.95)';

        // ==========================================
        // 모서리는 영상의 모서리를 그대로 떠 온다
        // ==========================================
        //
        // 네 변을 45도로 맞물리면, 변마다 색이 다른 영상에서는 그 맞물린 선이
        // 밝기 차이로 드러난다. 「자전」처럼 위가 분홍이고 아래가 파랑이면
        // 좁은 화면에서 특히 눈에 띈다.
        //
        // 그래서 모서리 네 조각은 영상의 네 모서리에서 그대로 떠 오고,
        // 변은 그 사이만 채운다. 원본이 이미 테두리 모양이라 모서리가 그대로 맞는다.
        if (L.f.corner !== false) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = plate;
            ctx.fillRect(0, 0, CW, T);
            ctx.fillRect(0, CH - T, CW, T);
            ctx.fillRect(0, T, T, Math.max(0, CH - T * 2));
            ctx.fillRect(CW - T, T, T, Math.max(0, CH - T * 2));

            ctx.globalCompositeOperation = 'lighter';
            const mw = Math.max(1, vw - bx * 2), mh = Math.max(1, vh - by * 2);
            const DW = CW - T * 2, DH = CH - T * 2;

            ctx.drawImage(vid, 0, 0, bx, by, 0, 0, T, T);                       // 왼쪽 위
            ctx.drawImage(vid, vw - bx, 0, bx, by, CW - T, 0, T, T);            // 오른쪽 위
            ctx.drawImage(vid, 0, vh - by, bx, by, 0, CH - T, T, T);            // 왼쪽 아래
            ctx.drawImage(vid, vw - bx, vh - by, bx, by, CW - T, CH - T, T, T); // 오른쪽 아래

            if (DW > 0) {
                ctx.drawImage(vid, bx, 0, mw, by, T, 0, DW, T);                 // 위
                ctx.drawImage(vid, bx, vh - by, mw, by, T, CH - T, DW, T);      // 아래
            }
            if (DH > 0) {
                ctx.drawImage(vid, 0, by, bx, mh, 0, T, T, DH);                 // 왼쪽
                ctx.drawImage(vid, vw - bx, by, bx, mh, CW - T, T, T, DH);      // 오른쪽
            }
            ctx.globalCompositeOperation = 'source-over';
            return;
        }

        // 예전 방식 — 네 변을 45도로 맞물린다 (corner: false 일 때)
        ctx.globalCompositeOperation = 'lighter';
        const edge = function (sx, sy, sW, sH, dx, dy, dW, dH, pts) {
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < pts.length; i++) {
                if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
                else ctx.lineTo(pts[i][0], pts[i][1]);
            }
            ctx.closePath();
            ctx.clip();
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

window._fv3Frames = VIDEO_FRAMES_3;
window._fv3Live = live;

// 확인
window.videoFrameState3 = function () {
    console.log('%c===== 영상 테두리 (L2 · S2) =====', 'color:#c9a8ff; font-size:13px');
    console.table(VIDEO_FRAMES_3.map(function (f) {
        return {
            번호: f.id, 등급: f.g, 이름: f.n, 띠: f.ring + 'px',
            좌우: f.bandX, 위아래: f.bandY, 겹침: (f.over || 0) + 'px',
            영상: f._vid ? (f._vid.paused ? '멈춤' : '재생 중') + ' ' + f._vid.videoWidth + '×' + f._vid.videoHeight : '(없음)',
            크기: Math.round(f.src.length / 1024) + ' KB'
        };
    }));
    console.log('  그리는 칸:', live.length + '개');
    console.log('  전체 테두리:', FRAMES.length + '종');
};

// 두께·띠 비율 조절 — 새로고침 없이 바로 반영
window.fvTune3 = function (id, o) {
    const f = VIDEO_FRAMES_3.find(function (x) { return x.id === id || x.n === id; });
    if (!f) { console.warn('v04~v07 또는 이름(성운·격광·자전·세광)을 넣으세요.'); return; }
    Object.assign(f, o || {});
    live.forEach(function (L) { L.cv._w = -1; });
    console.log(f.n + ' — 띠 ' + f.ring + 'px · 좌우 ' + f.bandX + ' · 위아래 ' + f.bandY
        + ' · 겹침 ' + (f.over || 0) + 'px · 진하기 ' + f.opacity);
};

console.log('[영상테두리3] ' + added + '종 추가 (L 2 · S 2) — videoFrameState3()');

})();
;

// ---------- frame-give.js ----------
// ==========================================
// ★ 테두리 붙여 보기 — 콘솔용
// bundles.json 마지막 그룹, frames-video3.js 보다 뒤면 어디든 된다
// ==========================================
//
// 테두리는 user.frames 에 들어 있다. (frames.js:143)
//
//     user.frames = { owned: { v04:1, ... }, badge: '', list: '', hist: '' }
//
//   owned  가지고 있는 것
//   badge  사원증 사진 칸
//   list   사원 열람 — 사원 목록의 칸
//   hist   기록 줄
//
// 원래는 상자에서 뽑아야 owned 에 들어가고, 그다음 직접 골라 다는 구조다.
// 여기서는 그 두 단계를 한 번에 해 준다.
//
//     frameList()                  어떤 테두리가 있는지 본다
//     frameGive('3079', 'v04')     그 사번에게 성운을 주고 사원 열람에 단다
//     frameGive('또류', '성운')     이름과 테두리 이름으로도 된다
//     frameGive('v04')             사번을 빼면 나에게 단다
//     frameGive('3079', 'v04', 'badge')   사원증 칸에 단다
//     frameClear('3079')           떼기만 한다 (보유는 남는다)
//     frameTake('3079', 'v04')     보유 목록에서도 지운다
//     frameTake('3079', 'all')     그 사원의 테두리를 전부 지운다
//
// 남에게 거는 것은 상담사만 할 수 있다.

(function frameGive() {

const SLOTS = { list: '사원 열람', badge: '사원증', hist: '기록' };

function findFrame(key) {
    if (typeof FRAMES === 'undefined') return null;
    const k = String(key || '').trim();
    return FRAMES.find(function (f) { return f.id === k || f.n === k; }) || null;
}

function findUser(key) {
    if (typeof db === 'undefined' || !db.users) return null;
    const k = String(key || '').trim();
    if (db.users[k]) return db.users[k];
    const hit = Object.keys(db.users).filter(function (c) {
        const u = db.users[c];
        return u && (u.name === k || String(u.no) === k);
    });
    if (hit.length === 1) return db.users[hit[0]];
    if (hit.length > 1) {
        console.warn('같은 이름이 ' + hit.length + '명입니다. 사번으로 넣으세요: '
            + hit.map(function (c) { return db.users[c].name + '(' + c + ')'; }).join(', '));
    }
    return null;
}

function bagOf(u) {
    if (!u.frames) u.frames = { owned: {}, badge: '', list: '', hist: '' };
    if (!u.frames.owned) u.frames.owned = {};
    return u.frames;
}

function push(u) {
    if (currentUser && u.code === currentUser.code) {
        if (typeof saveFields === 'function') {
            try { saveFields({ frames: 1 }); } catch (e) { console.error(e); }
        }
    } else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { frames: u.frames });
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderEmployeeCards === 'function') renderEmployeeCards();
    if (typeof frRefresh === 'function') setTimeout(frRefresh, 80);
}

// ==========================================
window.frameList = function () {
    if (typeof FRAMES === 'undefined') { console.warn('frames.js 가 아직 안 올라왔습니다.'); return; }
    const mine = (currentUser && currentUser.frames) || {};
    const own = mine.owned || {};
    console.log('%c===== 테두리 ' + FRAMES.length + '종 =====', 'color:#c9a8ff; font-size:13px');
    const vids = (window._fv3Frames || []).map(function (f) { return f.id; })
        .concat((window._fv2Frames || []).map(function (f) { return f.id; }))
        .concat(['v01']);
    console.table(FRAMES.map(function (f) {
        const where = [];
        Object.keys(SLOTS).forEach(function (s) { if (mine[s] === f.id) where.push(SLOTS[s]); });
        return {
            번호: f.id, 등급: f.g, 이름: f.n,
            종류: vids.indexOf(f.id) >= 0 ? '영상' : '그림',
            '내 보유': own[f.id] > 0 ? 'O' : '-',
            '내가 단 곳': where.join(' · ') || '-'
        };
    }));
    console.log("  걸기 — frameGive('사번', '번호 또는 이름')");
};

window.frameGive = function (who, what, slot) {
    // 사번을 빼고 테두리만 넣은 경우
    if (what === undefined) { what = who; who = currentUser && currentUser.code; }
    slot = slot || 'list';
    if (!SLOTS[slot]) { console.warn("칸은 list · badge · hist 중 하나입니다."); return; }

    const f = findFrame(what);
    if (!f) { console.warn('그런 테두리가 없습니다. frameList() 로 확인하세요.'); return; }

    const u = findUser(who);
    if (!u) { console.warn('그런 사원을 찾지 못했습니다.'); return; }

    const isMe = currentUser && u.code === currentUser.code;
    if (!isMe && (!currentUser || currentUser.code !== 'kario0987')) {
        console.warn('남에게 거는 것은 상담사만 할 수 있습니다.');
        return;
    }

    const bag = bagOf(u);
    bag.owned[f.id] = Math.max(1, bag.owned[f.id] || 0);   // 없으면 하나 준다
    bag[slot] = f.id;
    push(u);

    console.log('%c✓ ' + (u.name || u.code) + ' — [' + f.n + '] ' + f.g + '등급을 '
        + SLOTS[slot] + ' 칸에 걸었습니다.', 'color:#4CAF50');
    if (slot === 'list') console.log('  사원 목록을 열면 그 사원 칸에 둘러져 있습니다.');
};

window.frameClear = function (who, slot) {
    const u = findUser(who === undefined ? (currentUser && currentUser.code) : who);
    if (!u) { console.warn('그런 사원을 찾지 못했습니다.'); return; }
    const isMe = currentUser && u.code === currentUser.code;
    if (!isMe && (!currentUser || currentUser.code !== 'kario0987')) {
        console.warn('남에게 거는 것은 상담사만 할 수 있습니다.'); return;
    }
    const bag = bagOf(u);
    if (slot) { if (!SLOTS[slot]) { console.warn('칸은 list · badge · hist'); return; } bag[slot] = ''; }
    else { bag.list = ''; bag.badge = ''; bag.hist = ''; }
    push(u);
    console.log('%c✓ ' + (u.name || u.code) + ' — ' + (slot ? SLOTS[slot] : '전부') + ' 떼었습니다.',
        'color:#4CAF50');
};

// 보유 목록에서까지 지운다
window.frameTake = function (who, what) {
    // 사번을 빼고 테두리만 넣은 경우
    if (what === undefined) { what = who; who = currentUser && currentUser.code; }

    const u = findUser(who);
    if (!u) { console.warn('그런 사원을 찾지 못했습니다.'); return; }

    const isMe = currentUser && u.code === currentUser.code;
    if (!isMe && (!currentUser || currentUser.code !== 'kario0987')) {
        console.warn('남의 것을 지우는 것은 상담사만 할 수 있습니다.'); return;
    }

    const bag = bagOf(u);
    const all = String(what || '').trim() === 'all';

    if (all) {
        const n = Object.keys(bag.owned).length;
        bag.owned = {};
        bag.list = ''; bag.badge = ''; bag.hist = '';
        push(u);
        console.log('%c✓ ' + (u.name || u.code) + ' — 테두리 ' + n + '종을 모두 지웠습니다.',
            'color:#4CAF50');
        return;
    }

    const f = findFrame(what);
    if (!f) { console.warn('그런 테두리가 없습니다. frameList() 로 확인하세요.'); return; }

    if (!bag.owned[f.id]) {
        console.warn((u.name || u.code) + ' 사원은 [' + f.n + ']을(를) 가지고 있지 않습니다.');
        return;
    }
    delete bag.owned[f.id];

    // 달고 있던 자리는 비운다
    const off = [];
    Object.keys(SLOTS).forEach(function (s) {
        if (bag[s] === f.id) { bag[s] = ''; off.push(SLOTS[s]); }
    });
    push(u);

    console.log('%c✓ ' + (u.name || u.code) + ' — [' + f.n + ']을(를) 보유 목록에서 지웠습니다.'
        + (off.length ? ' (' + off.join(' · ') + ' 칸에서도 뗌)' : ''), 'color:#4CAF50');
};

console.log('[테두리] frameList() · frameGive(사번, 테두리) · frameClear(사번) · frameTake(사번, 테두리)');

})();
;
