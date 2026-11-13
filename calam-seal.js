// ==========================================
// ★ 장비 봉인 (재앙) — 재앙을 맞은 사원은 3 시간 동안 가진 장비를 쓰지 못한다 (2026-11-13 사용자)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
//   「재앙을 맞은 사람이 L 을 찍었을 경우에는 다이스를 굴려서 확률적으로 쳐낼 수 있고
//    그게 아니면 가지고 있는 장비들을 3 시간동안 아예 사용 못 하게.」      (거는 쪽 — kroom-core.js 13. 재앙)
//
//   users/<사번>/calamSeal = { until, at, n }     until 까지 봉인 (서버 시계 — clock.js serverNow)
//   ※ newitems2.js 의 gearSeal(황룡의 눈 · 산군의 도움 — 그날 하루 장착칸 봉인)과는 다른 것이다. 둘이 같이 걸릴 수도 있다.
//
// ■ 봉인 동안
//   전용 장비     속성 수치가 0 (gearValue) — 판정 보정 · 기믹 DC · 회피 · 행운 · 치유 … 어디에도 안 붙는다.
//                 남의 화면에서도 0 이다 (같은 일행의 「보정」 몫에 안 든다).
//   커스텀 장비   이벤트 어둠에서 꺼지는 것과 같은 스위치(WONDER_GEAR_OFF)로 꺼진다 — 탐사 안의 능력 · 배수 · 솔로 방.
//                 (장착칸에 차는 출산 고유 아이템도 이 스위치를 본다 — 같이 꺼진다)
//                 이 스위치를 안 보는 것은 「차고 있나」에서 막는다 — 🐯 호가호위(foxtail.js) · 📖 지산(jisan.js) · 뿅망치(ppyong.js) ·
//                 🔎 눈 · 📺 토크 쇼(hasEquip 으로 묻는다).
//   장착한 장비   hasEquip · plugActive · rubyActive · sapActive 가 거짓, 공용시설 행운(facilityLuckMult) · 오염 배율
//                 (getPollutionMultiplier)은 장착칸이 빈 것으로 셈한다 — newitems2.js 가 「빌려 온 능력」을 얹는 바로 그 함수들.
//                 newitems2.js 의 꿈결 수집기 · 이동장 · 은색 저울 · 부적이 깃든 등 · 공기 누름돌 · 확정 구출(끈 · 포승줄 · 단추)은 eqOn 으로 본다.
//                 장착칸을 실제로 비우지는 않는다 — 봉인이 풀리면 그대로다. 해제는 된다.
//   새로 차기     장착형 물건은 쓰지(차지 · 남에게 채우지) 못한다.
//   그대로인 것   물약 · 소모품 · 이미 걸어 둔 버프 · K 의 방 직업(전용 장비의 속성으로 연 것) · 남이 내게 채우는 것 ·
//                 꾸미는 것(이름 색 · 광장 모습) · 🎻 신성의 바이올린(임자 자리를 맞추는 것이라 건드리지 않는다).
//
// ■ 콘솔
//   calamSealState()        지금 봉인 · 남은 시간 · 어디에 걸려 있는지
//   calamSealLift(사원)     상담사 — 그 사원의 봉인을 푼다 (이름 · 사번)

(function calamSeal() {
'use strict';

const ADMIN = 'kario0987';
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function srv() { try { if (typeof window.serverNow === 'function') return window.serverNow(); } catch (e) { } return Date.now(); }
function left(u) {
    const s = u && u.calamSeal;
    const t = (s && typeof s === 'object' && Number(s.until)) || 0;
    return Math.max(0, t - srv());
}
function sealed(u) { return !!u && left(u) > 0; }
function mine() { return sealed(u_()); }
window.calamSealed = function (u) { return sealed(u === undefined ? u_() : u); };
window.calamSealLeft = function (u) { return left(u === undefined ? u_() : u); };

function leftText(ms) {
    const m = Math.max(1, Math.ceil(ms / 60000));
    return (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' : '') : '') + (m % 60 ? (m % 60) + '분' : '');
}
function base(n) {
    try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(n) : String(n || ''); }
    catch (e) { return String(n || ''); }
}
// 장착형인가 — 물품 목록의 효과 이름에 equip 이 들었거나(커스텀 장비의 eye_equip · chil_equip 포함) 장착형 표가 붙었다
function isGear(name) {
    if (typeof ITEM_CATALOG === 'undefined' || !name) return false;
    const c = ITEM_CATALOG[name] || ITEM_CATALOG[base(name)];
    if (!c) return false;
    try { if (typeof window.isEquipItem === 'function' && window.isEquipItem(c)) return true; } catch (e) { }
    return /equip/i.test(String(c.effect || ''));
}
window.calamSealIsGear = isGear;

// ==========================================
// 감싸기 — 바깥에서 한 겹. 다른 파일의 표(_xxx)는 그대로 넘겨 다시 감기지 않게 한다
// ==========================================
const HOOKS = {};
function wrap(name, make) {
    const f = window[name];
    if (typeof f !== 'function' || f._calamSeal) return false;
    const w = make(f);
    Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
    w._calamSeal = true;
    window[name] = w;
    HOOKS[name] = true;
    return true;
}
// 장착칸을 잠깐 빈 것으로 — 능력을 읽는 함수 안에서만 (newitems2.js withBorrowed 와 같은 방식 · 반드시 되돌린다)
let depth = 0;
function withEmpty(u, fn, ctx, args) {
    if (!u || depth > 0 || !sealed(u)) return fn.apply(ctx, args);
    const keepE = u.equippedWeapons, keepB = u.borrowedGear;
    u.equippedWeapons = [];
    if (keepB !== undefined) u.borrowedGear = [];
    depth++;
    try { return fn.apply(ctx, args); }
    finally {
        depth--;
        u.equippedWeapons = keepE;
        if (keepB !== undefined) u.borrowedGear = keepB;
    }
}
const MAKERS = {
    // 전용 장비 — 속성 수치
    gearValue: function (_f) { return function (user) { if (sealed(user)) return 0; return _f.apply(this, arguments); }; },
    // 장착한 장비 — 이름으로 묻는 것들
    hasEquip: function (_f) { return function (user) { if (sealed(user)) return false; return _f.apply(this, arguments); }; },
    plugActive: function (_f) { return function (user) { if (sealed(user)) return false; return _f.apply(this, arguments); }; },
    rubyActive: function (_f) { return function (user) { if (sealed(user)) return false; return _f.apply(this, arguments); }; },
    sapActive: function (_f) { return function (user) { if (sealed(user)) return false; return _f.apply(this, arguments); }; },
    // 장착한 장비 — 여러 파일이 장착칸을 바로 읽어 얹는 몫
    facilityLuckMult: function (_f) { return function (user) { return withEmpty(user || u_(), _f, this, arguments); }; },
    getPollutionMultiplier: function (_f) { return function (user) { return withEmpty(user || u_(), _f, this, arguments); }; },
    // 새로 차기 — 착용 조건 (내가 차거나 남에게 채우는 것만 · 남이 내게 채우는 것은 그대로)
    canWearItem: function (_f) {
        return function (user, itemName) {
            const me = u_();
            if (me && user && user.code === me.code && sealed(me) && isGear(itemName)) return false;
            return _f.apply(this, arguments);
        };
    },
    // 커스텀 장비 · 출산 고유 아이템 — 이벤트 어둠에서 끄는 스위치
    WONDER_GEAR_OFF: function (_f) {
        return function () {
            if (mine()) return true;
            return _f.apply(this, arguments);
        };
    }
};
function hookAll() { Object.keys(MAKERS).forEach(function (k) { try { wrap(k, MAKERS[k]); } catch (e) { } }); }
hookAll();
setInterval(hookAll, 1500);

// ==========================================
// 새로 차기 — 장착형 물건을 쓰지 못한다 (늘 맨 바깥에서 먼저 본다)
// ==========================================
function tell() {
    const ms = left(u_());
    try {
        showCustomAlert('☄ 재앙이 내려 장비가 봉인되어 있습니다.\n\n남은 시간 ' + leftText(ms) + ' — 그동안은 장비를 차거나 쓸 수 없습니다.');
    } catch (e) { }
}
let useW = null, useN = 0;
function hookUse() {
    const f = window.useInventoryItem;
    if (typeof f !== 'function' || f === useW || useN >= 12) return;      // 뒤늦게 감싸는 파일이 있어도 열두 겹까지만
    useN++;
    const w = function (itemName) {
        try { if (mine() && isGear(itemName)) { tell(); return; } } catch (e) { }
        return f.apply(this, arguments);
    };
    Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
    w._calamUse = true;
    useW = w;
    window.useInventoryItem = w;
}
hookUse();
setInterval(hookUse, 1500);

// ==========================================
// 소지품 창 맨 위에 한 줄 — 봉인 중 · 남은 시간
// ==========================================
function banner() {
    const box = document.getElementById('inventory-list-container');
    const old = document.getElementById('calam-seal-line');
    const ms = left(u_());
    if (!box || ms <= 0) { if (old) old.remove(); return; }
    const txt = '☄ 재앙 — 장비 봉인 중 · 남은 시간 ' + leftText(ms);
    if (old && old.parentElement === box) { if (old.dataset.t !== txt) { old.dataset.t = txt; old.firstChild.textContent = txt; } return; }
    if (old) old.remove();
    const el = document.createElement('div');
    el.id = 'calam-seal-line';
    el.dataset.t = txt;
    el.style.cssText = 'margin:0 0 8px 0;padding:9px 11px;border:1px solid #a3362a;border-radius:6px;'
        + 'background:rgba(60,10,10,.85);color:#ffb8a4;font-size:12px;line-height:1.6;letter-spacing:.3px;';
    el.appendChild(document.createTextNode(txt));
    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:10px;color:#c4948a;';
    sub.textContent = '전용 장비 · 커스텀 장비 · 장착한 장비가 먹히지 않고, 새로 찰 수도 없습니다.';
    el.appendChild(sub);
    box.insertBefore(el, box.firstChild);
}
setInterval(function () { try { banner(); } catch (e) { } }, 1000);

// ==========================================
// 콘솔
// ==========================================
window.calamSealState = function () {
    const u = u_();
    if (!u) { console.log('로그인 후에 보세요.'); return; }
    const ms = left(u);
    console.log('%c===== ☄ 장비 봉인 (재앙) =====', 'color:#ff8a76; font-size:13px');
    console.log('  지금:', ms > 0 ? '봉인 중 — 남은 시간 ' + leftText(ms) + ' (' + new Date(u.calamSeal.until).toLocaleString() + ' 까지)' : '없음');
    console.log('  걸린 자리:', Object.keys(MAKERS).map(function (k) { return k + (HOOKS[k] ? ' O' : ' ✗'); }).join(' · '),
        '· useInventoryItem', (useW && window.useInventoryItem === useW) ? 'O (맨 바깥 · ' + useN + '겹)' : (useW ? 'O (' + useN + '겹)' : '✗'));
};
window.calamSealLift = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) || {};
    const code = Object.keys(book).filter(function (c) { const x = book[c] || {}; return x.name === who || String(x.no) === String(who); })[0];
    if (!code) { console.warn('사원을 못 찾았습니다 (이름 · 사번).'); return; }
    try { delete book[code].calamSeal; } catch (e) { }
    try { database.ref('users/' + code + '/calamSeal').remove(); } catch (e) { console.warn(e); return; }
    console.log('%c✓ ' + (book[code].name || '') + ' — 장비 봉인을 풀었습니다.', 'color:#4CAF50');
};

console.log('[재앙] 장비 봉인 연결 — calamSealState()');

})();
