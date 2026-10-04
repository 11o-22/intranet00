// ==========================================
// ★ [전설] 칭호 — 물약이 듣지 않는다
// bundles.json 마지막 그룹, titles.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 언제 듣는가
//
//   [전설] 을 「달고 있을 때」만입니다. 가지고만 있고 안 달았으면 그냥 맞습니다.
//   titles.js 가 달린 칭호를 user.titleOn 에 적고, 진짜 가진 것인지는
//   user.titleAdmin 으로 봅니다. 둘 다 맞아야 면역입니다.
//
// ■ 막는 길이 셋입니다
//
//   물약이 몸에 닿는 길이 세 갈래라서, 한 군데만 막으면 샙니다.
//
//   1. applyItemEffect — 먹이거나 마시는 보통 길
//      무지개 물약도 여기로 옵니다 (index.html:7033 이 다른 물약 하나를 골라
//      같은 자리로 돌립니다).
//
//   2. addTimedEffect — 이름표가 붙는 자리
//      newitems.js 의 p_* 열 가지가 이쪽으로만 옵니다 (newitems.js:480~488).
//      1번을 지나왔더라도 여기서 한 번 더 걸립니다.
//
//   3. 석류맛 물약 — 사원을 무작위로 골라 timedEffects 에 바로 밀어 넣습니다
//      (index.html:7388). addTimedEffect 를 안 거쳐서 2번에 안 걸립니다.
//      그래서 고르는 동안만 [전설] 을 단 사람을 명단에서 빼 둡니다.
//
// ■ 안 막는 것
//
//   제거약(cure_potion)   — 걸린 것을 푸는 쪽이라 막으면 손해입니다
//   하급·중급 물약(heal)  — 오염도 회복뿐이라 상태이상이 아닙니다
//   석류맛을 「던지는」 것 — 맞는 쪽만 막습니다. 전설도 남에게 던질 수 있습니다
//
//   감자맛(행운 +100)과 먹물맛(회피 +2)은 이로운 물약인데도 막습니다.
//   「모든 물약이 안 듣는다」를 글자 그대로 둔 것입니다.
//   통하게 하시려면 아래 BLOCK 목록에서 p_potato · p_ink 를 빼시면 됩니다.

(function legendImmune() {

const TITLE = '전설';

// 막을 물약 — 여기서 빼면 그 물약은 전설에게도 듣습니다
const BLOCK = {
    grape_potion: 1, pineapple_potion: 1, clear_potion: 1, plum_potion: 1,
    rainbow_potion: 1, milk_potion: 1, banana_potion: 1, apple_potion: 1,
    orange_potion: 1, peach_potion: 1, cherry_potion: 1, persimmon_potion: 1,
    p_durian: 1, p_lychee: 1, p_mango: 1, p_melon: 1, p_berry: 1,
    p_potato: 1, p_sweet: 1, p_melon2: 1, p_ink: 1, p_blue: 1
};

// 이름표로 들어오는 물약 — addTimedEffect 쪽에서 쓴다
function isPotionName(n) {
    return /물약$/.test(String(n || '').trim());
}

// ==========================================
// [전설] 을 달고 있는가
// ==========================================
function legend(u) {
    if (!u) return false;
    if (u.titleOn !== TITLE) return false;                      // 달고 있어야 한다
    return (u.titleAdmin || []).indexOf(TITLE) >= 0;            // 진짜 가진 것이어야 한다
}
window.isLegend = legend;

function bounced(u, what) {
    const me = currentUser && u.code === currentUser.code;
    if (typeof showCustomAlert === 'function') {
        showCustomAlert(me
            ? '[🎤 전설]\n\n' + what + '이(가) 몸에 닿지 못하고 흩어졌습니다.'
            : u.name + ' 사원에게는 통하지 않았습니다.\n\n[🎤 전설] 칭호가 물약을 밀어냈습니다.');
    }
    if (typeof addHistoryLog === 'function') {
        try { addHistoryLog(u, '[전설] ' + what + '이(가) 듣지 않았습니다.'); } catch (e) { }
    }
}

// ==========================================
// 1. 먹이거나 마시는 길
// ==========================================
(function hookApply() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._legend) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName] || {};

            // 석류맛은 던지는 것이라 막지 않는다 — 고르는 명단에서만 뺀다 (3번)
            if (cat.effect === 'pomegranate_potion') return withoutLegends(_a, this, arguments);

            if (targetUser && BLOCK[cat.effect] && legend(targetUser)) {
                bounced(targetUser, itemName);
                return false;                       // false 면 아이템이 소모되지 않는다
            }
            return _a.apply(this, arguments);
        };
        applyItemEffect._legend = true;
        clearInterval(iv);
        console.log('[전설] 물약 면역 연결');
    }, 400);
})();

// ==========================================
// 2. 이름표가 붙는 자리 — p_* 열 가지가 이쪽으로만 온다
// ==========================================
(function hookTimed() {
    const iv = setInterval(function () {
        if (typeof addTimedEffect !== 'function') return;
        if (addTimedEffect._legend) { clearInterval(iv); return; }

        const _t = addTimedEffect;
        addTimedEffect = function (user, name, desc, hours) {
            if (user && legend(user) && isPotionName(name)) {
                bounced(user, name);
                return;
            }
            return _t.apply(this, arguments);
        };
        addTimedEffect._legend = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 3. 석류맛 — 고르는 동안만 전설을 명단에서 뺀다
// ==========================================
//
// index.html:7379 가 Object.keys(db.users) 로 맞을 사람을 고릅니다.
// 그 한 호흡 동안만 db.users 를 전설 없는 것으로 바꿔 둡니다.
function withoutLegends(fn, self, args) {
    if (typeof db === 'undefined' || !db || !db.users) return fn.apply(self, args);

    const full = db.users;
    const thin = {};
    let cut = 0;
    Object.keys(full).forEach(function (c) {
        if (legend(full[c])) { cut++; return; }
        thin[c] = full[c];
    });

    if (!cut) return fn.apply(self, args);
    if (Object.keys(thin).length === 0) {            // 전부 전설이면 맞을 사람이 없다
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('던질 곳이 없습니다.\n\n남은 사원이 전부 [🎤 전설] 입니다.');
        }
        return false;
    }

    db.users = thin;
    try { return fn.apply(self, args); }
    finally { db.users = full; }
}

// ==========================================
// 확인
// ==========================================
window.legendState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 전설 면역 =====', 'color:#d4af37; font-size:13px');
    console.log('  가진 칭호:', (u.titleAdmin || []).join(' · ') || '없음');
    console.log('  달고 있는 것:', u.titleOn || '없음');
    console.log('  물약 면역:', legend(u) ? 'O' : '✗'
        + ((u.titleAdmin || []).indexOf(TITLE) >= 0 && u.titleOn !== TITLE ? '  (가지고만 있고 안 달았습니다)' : ''));
    console.log('  막는 물약 ' + Object.keys(BLOCK).length + '종 · 안 막는 것: 제거약 · 하급/중급 물약');
    console.log('  연결 —',
        'applyItemEffect', (typeof applyItemEffect === 'function' && applyItemEffect._legend) ? 'O' : '✗',
        '· addTimedEffect', (typeof addTimedEffect === 'function' && addTimedEffect._legend) ? 'O' : '✗');
};

window.legendList = function () {
    const rows = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || (u.titleAdmin || []).indexOf(TITLE) < 0) return;
        rows.push({ 사원: u.name || c, 사번: u.no || '-', 달았나: u.titleOn === TITLE ? 'O' : '-', 면역: legend(u) ? 'O' : '-' });
    });
    console.log('%c===== [🎤 전설] 을 가진 사원 =====', 'color:#d4af37; font-size:13px');
    if (rows.length) console.table(rows); else console.log('  없습니다.');
};

console.log('[전설] legendState(사번) · legendList()');

})();