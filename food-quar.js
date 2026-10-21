// ==========================================
// ★ 🍽 음식으로 갇혔나 — 2026-10-21
// bundles.json 마지막 묶음 · eye.js 뒤 · save-merge.js 앞
// ==========================================
//
//   상담실 · 선녀탕에 갇혔다가 나올 때(또는 갇혀 있는 동안) 포인트가 생기는
//   장비들이 있다. 음식을 먹어 오른 오염도로 갇힌 경우에는 그 포인트를 주지 않는다.
//   횟수를 쓰는 능력이면 횟수는 그대로 줄어든다.
//
//       🔎 감지하는 눈      값을 치르고 나와도 세 배로 돌려받을 몫이 안 생긴다 ·
//                          음식으로 갇힐 때는 쌓아 둔 몫을 내주지 않는다 (다음에 갇힐 때까지 남는다)
//       🌟 칠성 · 녹존      꺼내 주기는 하고 횟수도 줄지만 포인트는 없다
//       🌙 골든 마스코트    계약서는 쓰이고 꺼내 주지만 포인트는 없다
//       📖 종말예언 [복원]  그 사람이 음식으로 갇혀 있는 동안은 둘 다 받지 않는다
//
// ■ 어떻게 아나
//
//   1. 음식을 먹는 동안(useInventoryItem · applyItemEffect 의 음식) 오염도가
//      100 을 넘어서면 그 사람에게 quarFood = 시각 을 적는다.
//   2. 여우 상담실 · 선녀탕 문답이 끝나 갇히는 순간(finishFoxRoomSequence)
//      quarFood 가 있으면 quarCause = { k: 'food', at, until } 으로 바꿔 적는다.
//      음식이 아니면 quarCause 를 지운다.
//   3. 나와 있으면(갇힌 게 아니면) quarCause 는 곧 지운다. 오염도가 100 밑이면
//      quarFood 도 지운다.
//
//   window.quarFood(사람) — 그 사람이 지금 음식 때문에 갇혀 있으면 참.
//   남이 읽을 때는 서버 글(users/<사번>/quarCause)을 본다.
//
// ■ 콘솔
//   quarFoodState()   내 표시

(function foodQuar() {

const KEEP = 30 * 3600 * 1000;           // 이보다 오래된 표시는 믿지 않는다 (갇힘은 길어야 24시간)

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function inRoom(x) { return !!(x && x.quarantineUntil && Date.now() < Number(x.quarantineUntil)); }
function isFood(cat) {
    return !!(cat && (cat.effect === 'food' || cat.effect === 'food_dish' || cat.effect === 'food_fail' || cat.foodDish));
}
function catOf(n) { return (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG) ? ITEM_CATALOG[n] : null; }

// 지금 음식 때문에 갇혀 있나
function quarFood(x) {
    if (!x || !inRoom(x)) return false;
    const c = x.quarCause;
    if (c && typeof c === 'object' && c.k === 'food') {
        const at = Number(c.at) || 0, until = Number(c.until) || 0;
        if (Date.now() - at < KEEP && (!until || Number(x.quarantineUntil) <= until + 60000)) return true;
    }
    // 갇히는 순간 — 아직 quarCause 로 옮겨 적기 전
    const f = Number(x.quarFood) || 0;
    return !!(f && Date.now() - f < KEEP && !x.quarantineHospital);
}
window.quarFood = quarFood;

// ==========================================
// 1. 먹는 동안 — 100 을 넘으면 적는다
// ==========================================
let eating = 0;
function during(fn, self, args) {
    eating++;
    try { return fn.apply(self, args); } finally { eating--; }
}

(function hookPoll() {
    const iv = setInterval(function () {
        if (typeof applyPollutionToUser !== 'function') return;
        if (applyPollutionToUser._fq) { clearInterval(iv); return; }
        const _a = applyPollutionToUser;
        const w = function (user) {
            const before = user ? (Number(user.pollution) || 0) : 0;
            const out = _a.apply(this, arguments);
            try {
                if (eating > 0 && user && before < 100 && (Number(user.pollution) || 0) >= 100) {
                    user.quarFood = Date.now();
                    const me = u_();
                    if (me && user.code === me.code) save({ quarFood: 1 });
                    else if (user.code && typeof updateUserFields === 'function') updateUserFields(user.code, { quarFood: user.quarFood });
                    console.log('[음식 격리] 먹은 것으로 오염도 100 — ' + (user.name || user.code));
                }
            } catch (e) { }
            return out;
        };
        w._fq = true;
        applyPollutionToUser = w;
        clearInterval(iv);
    }, 400);
})();

// 식당 요리(food_dish · food_fail)는 restaurant.js 가 useInventoryItem 앞에서 가로챈다.
// 그래서 그쪽이 감싼 뒤에(_food) 그 바깥을 감싼다.
(function hookUse() {
    const t0 = Date.now();
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (!useInventoryItem._food && Date.now() - t0 < 15000) return;   // 식당이 늦으면 15초 뒤엔 그냥 감싼다
        if (useInventoryItem._fq) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (!isFood(catOf(itemName))) return _u.apply(this, arguments);
            return during(_u, this, arguments);
        };
        w._fq = true;
        // 다른 파일이 표식을 보고 다시 감싸지 않게 아래 표식은 넘겨 둔다
        Object.keys(_u).forEach(function (k) { if (k.charAt(0) === '_') w[k] = _u[k]; });
        useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

(function hookEffect() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._fq) { clearInterval(iv); return; }
        const _a = applyItemEffect;
        const w = function (targetUser, itemName) {
            if (!isFood(catOf(itemName))) return _a.apply(this, arguments);
            return during(_a, this, arguments);
        };
        w._fq = true;
        Object.keys(_a).forEach(function (k) { if (k.charAt(0) === '_') w[k] = _a[k]; });
        applyItemEffect = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

// ==========================================
// 2. 갇히는 순간 — 까닭을 적는다
// ==========================================
function mark() {
    const me = u_();
    if (!me || !inRoom(me) || me.quarantineHospital) return;
    const f = Number(me.quarFood) || 0;
    if (f && Date.now() - f < KEEP) {
        me.quarCause = { k: 'food', at: Date.now(), until: Number(me.quarantineUntil) || 0 };
        console.log('[음식 격리] 음식으로 갇혔습니다 — 갇힘으로 생기는 포인트를 받지 않습니다.');
    } else {
        me.quarCause = null;
    }
    me.quarFood = null;
    save({ quarCause: 1, quarFood: 1 });
}
(function hookLockup() {
    const iv = setInterval(function () {
        if (typeof finishFoxRoomSequence !== 'function') return;
        if (finishFoxRoomSequence._fq) { clearInterval(iv); return; }
        const _f = finishFoxRoomSequence;
        const w = function () {
            try { return _f.apply(this, arguments); }
            finally { try { mark(); } catch (e) { } }
        };
        w._fq = true;
        Object.keys(_f).forEach(function (k) { if (k.charAt(0) === '_') w[k] = _f[k]; });
        finishFoxRoomSequence = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

// ==========================================
// 3. 나와 있으면 지운다
// ==========================================
setInterval(function () {
    try {
        const me = u_();
        if (!me) return;
        const f = {};
        if (me.quarCause && !inRoom(me)) { me.quarCause = null; f.quarCause = 1; }
        if (me.quarFood && (Number(me.pollution) || 0) < 100 && !inRoom(me)) { me.quarFood = null; f.quarFood = 1; }
        if (me.quarFood && Date.now() - (Number(me.quarFood) || 0) >= KEEP) { me.quarFood = null; f.quarFood = 1; }
        if (Object.keys(f).length) save(f);
    } catch (e) { }
}, 3000);

window.quarFoodState = function () {
    const me = u_();
    if (!me) { console.log('로그인 전입니다.'); return; }
    console.log('%c===== 🍽 음식 격리 =====', 'color:#ffb74d; font-size:13px');
    console.log('  갇혀 있나       :', inRoom(me) ? 'O' : '✗');
    console.log('  먹고 100 넘음   :', me.quarFood ? new Date(Number(me.quarFood)).toLocaleString() : '-');
    console.log('  갇힌 까닭       :', me.quarCause ? JSON.stringify(me.quarCause) : '-');
    console.log('  음식으로 갇힘   :', quarFood(me) ? 'O — 갇힘으로 생기는 포인트 없음' : '✗');
};

})();
