// ==========================================
// ★ 상담사 — 같은 방 직원만 임신시킨다 · 상담사의 출산 고유 아이템 (2026-10-18)
// bundles.json 마지막 묶음, pen.js 뒤
// ==========================================
//
// ■ 임신시키기
//
//   상담사 계정도 임신시킬 수 있다. 성별 · 물약과 상관없이 「시키는 쪽」으로 본다
//   (canSire). 대신 **같은 방을 쓰는 직원** — 관사로 데려온 동거인
//   (house.roomie, house-L.js) — 한 사람에게만 된다.
//     · 사원 열람에서 동거인이 아니면 「임신시키기」 단추를 빼고 까닭을 적는다.
//     · tryPregnancy · doPregnancy 도 동거인이 아니면 멈춘다 (동의 요청으로 돌아와도).
//     · 동거인이라 동의 없이 바로 판정한다 (원래 규칙 isPartner 그대로).
//
// ■ 출산 고유 아이템
//
//   고유 아이템 표(DNA_GIFTS, 60종)는 사원에게 번호로 나눠 준다. 상담사는 거기서
//   빠져 있어(isRealUser) 고유 아이템이 아예 없었다. 표에 넣으면 번호가 모자랄 때
//   다른 사원에게 돌아갈 수 있으므로 넣지 않고, 상담사에게만 따로 둔다.
//
//       닫히지 않는 상담실 문고리 · <DNA>    공용시설 행운 1000%  (pct 1000 → ×10)
//
//   dnaGiftOf · ensureDnaItem 을 감싸 상담사일 때 이것을 돌려준다. 출산 추첨
//   (rollBirthItem → dnaItemName)이 그대로 이 이름을 꺼내고, 주인(dnaOwner)이
//   상담사라 다른 고유 아이템처럼 주인에게만 간다. 평생 한 번(dna-once.js)도 같다.
//   어느 화면에서든 장착 · 설명이 되도록 물품 표에는 늘 올려 둔다.
//
// ■ 콘솔
//   pregAdminState()

(function pregAdmin() {

const ADMIN = 'kario0987';
const GIFT = { n: '닫히지 않는 상담실 문고리', e: { pct: 1000 }, p: 100, d: '공용시설 행운 1000%' };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function isAdm(u) { return !!(u && u.code === ADMIN); }
function roomieOf(u) {
    try {
        const h = (u && u.house) || null;
        return (h && h.roomie) || null;
    } catch (e) { return null; }
}
// 상담사와 같은 방을 쓰는가
function sameRoom(code) {
    const me = u_();
    return !!(isAdm(me) && code && roomieOf(me) === code);
}
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

// 늘 맨 바깥에 있게 감싼다 — 다른 파일이 나중에 또 감싸면 다시 바깥으로
function keepOuter(name, flag, make) {
    function tick() {
        const f = window[name];
        if (typeof f !== 'function' || f[flag]) return;
        const w = make(f);
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w[flag] = true;
        window[name] = w;
    }
    tick();
    setInterval(function () { try { tick(); } catch (e) { } }, 700);
}

// ==========================================
// 1. 시킬 수 있나 — 상담사는 늘 시키는 쪽
// ==========================================
keepOuter('canSire', '_pregAdmin', function (f) {
    return function (user) {
        if (isAdm(user)) return true;
        return f.apply(this, arguments);
    };
});

// ==========================================
// 2. 같은 방 직원에게만
// ==========================================
const NOTE = '상담사는 같은 방(관사)을 쓰는 직원만 임신시킬 수 있습니다.';
keepOuter('tryPregnancy', '_pregAdmin', function (f) {
    return function (code) {
        if (isAdm(u_()) && !sameRoom(code)) { alert_(NOTE); return; }
        return f.apply(this, arguments);
    };
});
keepOuter('doPregnancy', '_pregAdmin', function (f) {
    return function (code) {
        if (isAdm(u_()) && !sameRoom(code)) { alert_(NOTE + '\n\n진행되지 않았습니다.'); return; }
        return f.apply(this, arguments);
    };
});
keepOuter('addPregBtn', '_pregAdmin', function (f) {
    return function (code) {
        const r = f.apply(this, arguments);
        try {
            const me = u_();
            if (!isAdm(me) || sameRoom(code)) return r;
            const box = document.getElementById('preg-btn-box');
            if (!box) return r;
            const btn = box.querySelector('#preg-do-btn');
            if (btn) btn.remove();
            if (!document.getElementById('preg-admin-note') && users()[code] && !(typeof isPregnant === 'function' && isPregnant(users()[code]))) {
                box.insertAdjacentHTML('beforeend',
                    '<div id="preg-admin-note" style="font-size:10px; color:#888; margin-top:8px; line-height:1.6;">' + NOTE + '</div>');
            }
        } catch (e) { }
        return r;
    };
});

// ==========================================
// 3. 상담사의 출산 고유 아이템
// ==========================================
// DNA — 적혀 있으면 그것, 없으면 dna.js 와 같은 식으로 센다 (남의 화면에서는 적지 않는다)
function dnaOfAdmin(u) {
    if (!u) return '';
    if (u.dna) return u.dna;
    const me = u_();
    if (me && me.code === u.code && typeof dnaOf === 'function') return dnaOf(u);
    try {
        const s = seedOf(u.code + '|' + (u.no || ''));
        let d = '';
        for (let i = 0; i < 8; i++) d += ['A', 'T', 'G', 'C'][Math.floor(seedRand(s, i) * 4)];
        return d;
    } catch (e) { return ''; }
}
function giftName(u) {
    const d = dnaOfAdmin(u);
    return d ? GIFT.n + ' · ' + d : '';
}
function ensureAdminItem(u) {
    if (typeof ITEM_CATALOG === 'undefined' || !u) return null;
    const nm = giftName(u);
    if (!nm) return null;
    if (!ITEM_CATALOG[nm] || ITEM_CATALOG[nm].dnaOwner !== ADMIN) {
        ITEM_CATALOG[nm] = {
            price: 30000, usable: true, targetable: false,
            effect: 'equip_dna', dnaOwner: ADMIN, dnaEff: Object.assign({}, GIFT.e),
            desc: '[고유] 상담사의 것. 장착하면 ' + GIFT.d + '.'
        };
    }
    try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(nm) < 0) NO_SELL_ITEMS.push(nm); } catch (e) { }
    return nm;
}
keepOuter('dnaGiftOf', '_pregAdmin', function (f) {
    return function (user) {
        if (isAdm(user)) return { n: GIFT.n, e: Object.assign({}, GIFT.e), p: GIFT.p, d: GIFT.d };
        return f.apply(this, arguments);
    };
});
keepOuter('ensureDnaItem', '_pregAdmin', function (f) {
    return function (user) {
        if (isAdm(user)) return ensureAdminItem(user);
        return f.apply(this, arguments);
    };
});
// 어느 화면에서든 물품 표에 올려 둔다 (장착 · 설명 · 소지품 분류)
setInterval(function () {
    try {
        const a = users()[ADMIN] || (isAdm(u_()) ? u_() : null);
        if (a) ensureAdminItem(a);
    } catch (e) { }
}, 3000);

window.pregAdminState = function () {
    const me = u_();
    const a = users()[ADMIN] || (isAdm(me) ? me : null);
    console.log('%c===== 상담사 — 임신 · 고유 아이템 =====', 'color:#ff8fb1; font-size:13px');
    console.log('  같은 방 직원 :', a ? (roomieOf(a) ? ((users()[roomieOf(a)] || {}).name || roomieOf(a)) + ' (' + roomieOf(a) + ')' : '없음') : '-');
    console.log('  시킬 수 있나 :', (typeof canSire === 'function' && a) ? (canSire(a) ? 'O' : '✗') : '-');
    const nm = a ? giftName(a) : '';
    console.log('  고유 아이템  :', nm || '-', nm && typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[nm] ? '— ' + GIFT.d : '');
};

})();
