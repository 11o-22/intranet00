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
    "남의 배역표":      { price:1400, effect:"s3_cast",   desc:"[???] 배역 판정에 +6. 맡고 싶은 자리가 있다면." },
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
    let n = 0;
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
    s3_cast:   { key:'s3_cast',   n:1, msg:'남의 배역표를 외웠습니다. 배역 판정에 +6.' },
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
            if (currentUser.equippedWeapons.length >= 5) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
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
            if (targetUser.equippedWeapons.length >= 5) { showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false; }
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
