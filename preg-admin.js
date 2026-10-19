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
//
// ■ 위 알림띠 (2026-10-18)
//   상담사가 낀 임신 · 착정 · 출산 · 유산 소식은 알림띠(notices)에 올리지 않는다 — 아래 4.
//
// ■ 동거인이 상담사를 임신시킨다 (2026-10-19) — 아래 5
//   상담사는 성별 · 물약과 상관없이 「받는 쪽」도 된다 (canBear). 다이아 보지 플러그는 그대로 막는다.
//   단 **상담사와 같은 방을 쓰는 동거인**만 — 다른 사원은 상담사를 임신시킬 수 없다.
//   동거인의 사택 화면 「동거인」 칸에 [🤍 임신시키기] 가 생긴다 (상담사가 동거인이면).
//   동거인이라 동의 없이 바로 판정한다. 상담사가 임신 중이고 내가 아버지면 [🤍 돌본다] 도 생긴다.

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
// 나는 상담사의 동거인인가 — 내 쪽이 상담사를 가리키고, 상담사 쪽도 나를 가리켜야 한다 (유령 동거인 막기)
function adminRoomie(me) {
    if (!me || isAdm(me)) return false;
    if (roomieOf(me) !== ADMIN) return false;
    const a = users()[ADMIN];
    return !a || !a.house || !a.house.roomie || a.house.roomie === me.code;
}
const NOTE_IN = '상담사는 같은 방(관사)을 쓰는 동거인만 임신시킬 수 있습니다.';

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
        if (code === ADMIN && !isAdm(u_()) && !adminRoomie(u_())) { alert_(NOTE_IN); return; }
        return f.apply(this, arguments);
    };
});
keepOuter('doPregnancy', '_pregAdmin', function (f) {
    return function (code) {
        if (isAdm(u_()) && !sameRoom(code)) { alert_(NOTE + '\n\n진행되지 않았습니다.'); return; }
        if (code === ADMIN && !isAdm(u_()) && !adminRoomie(u_())) { alert_(NOTE_IN + '\n\n진행되지 않았습니다.'); return; }
        // 알림띠 — 상담사가 시키거나 상담사가 받으면 안 띄운다 (아래 4)
        const was = forced;
        forced = (isAdm(u_()) || code === ADMIN) ? 'quiet' : 'loud';
        try { return f.apply(this, arguments); }
        finally { forced = was; }
    };
});
keepOuter('addPregBtn', '_pregAdmin', function (f) {
    return function (code) {
        const r = f.apply(this, arguments);
        try {
            const me = u_();
            // 상담사 카드 — 동거인이 아니면 임신시키기를 뺀다
            if (code === ADMIN && !isAdm(me) && !adminRoomie(me)) {
                const b = document.getElementById('preg-do-btn');
                if (b) b.remove();
                return r;
            }
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

// ==========================================
// 4. 위 알림띠 — 상담사가 낀 임신은 띄우지 않는다
// ==========================================
//
//   pregBroadcast 하나가 notices 로 올려 모두의 화면 위에 흐른다. 상담사가 낀 것은
//   거기로 안 보낸다 (기록 · 특이사항 · 본인 알림창은 그대로).
//     · 임신시키기      상담사가 시켰거나, 상담사가 받았다     (doPregnancy 를 감싸 그때만 본다)
//     · 착정 · 출산 · 유산  상담사의 몸이거나, 아버지 중에 상담사가 있다
//       — 출산 · 유산은 알림을 올리기 직전에 임신 기록을 지우므로, 바로 전까지 본
//         아버지 명단을 잠깐 들고 있다가 본다.
let forced = null;              // 'quiet' | 'loud' | null — 임신시키기 도중에만
let lastSires = null, lastAt = 0;
function adminIn(list) {
    return Array.isArray(list) && list.some(function (s) { return s && s.code === ADMIN; });
}
setInterval(function () {
    try {
        const me = u_();
        const p = me && me.preg;
        if (p && Array.isArray(p.sires) && p.sires.length) { lastSires = p.sires.slice(); lastAt = Date.now(); }
    } catch (e) { }
}, 500);
function quietNow() {
    if (forced === 'quiet') return true;
    if (forced === 'loud') return false;
    const me = u_();
    if (isAdm(me)) return true;
    if (me && me.preg && adminIn(me.preg.sires)) return true;
    if (lastSires && Date.now() - lastAt < 20000 && adminIn(lastSires)) return true;
    return false;
}
let hushed = 0;
keepOuter('pregBroadcast', '_pregAdmin', function (f) {
    return function () {
        try { if (quietNow()) { hushed++; console.log('[임신] 상담사가 낀 소식 — 알림띠에 올리지 않았습니다.'); return; } } catch (e) { }
        return f.apply(this, arguments);
    };
});

// ==========================================
// 5. 동거인이 상담사를 — 상담사도 받는 쪽이 된다
// ==========================================
keepOuter('canBear', '_pregAdmin', function (f) {
    return function (user) {
        if (isAdm(user)) return true;
        return f.apply(this, arguments);
    };
});
// 동거인의 사택 화면 — 「동거인」 칸 단추 줄에 붙인다
function houseBtns() {
    const me = u_();
    if (!adminRoomie(me)) return;
    const box = document.getElementById('house-main-body');
    if (!box || box.querySelector('#preg-admin-house')) return;
    const treat = box.querySelector('button[onclick="houseTreat()"]');
    const row = treat && treat.parentNode;
    if (!row) return;
    const a = users()[ADMIN];
    if (!a) return;
    const preg = (typeof isPregnant === 'function') && isPregnant(a);
    const mine = preg && (typeof isMySire === 'function') && isMySire(a);
    let full = false;
    try { full = preg && ((sireCount(a) >= maxSires(a)) || mySireFull(a)); } catch (e) { }
    const wrap = document.createElement('div');
    wrap.id = 'preg-admin-house';
    wrap.style.cssText = 'display:flex; gap:5px; width:100%; flex-basis:100%;';
    let h = '';
    if (!full) {
        h += '<button class="inv-btn" style="flex:1; min-width:78px; background:linear-gradient(145deg,#6a4c93,#4a2c73); color:#fff; border-color:#8a6cb3;" onclick="tryPregnancy(\'' + ADMIN + '\')">🤍 임신시키기</button>';
    }
    if (mine) {
        h += '<button class="inv-btn" style="flex:1; min-width:78px; background:linear-gradient(145deg,#c2185b,#880e4f); color:#fff; border-color:#e91e63;" onclick="openCarePanel(\'' + ADMIN + '\')">🤍 돌본다</button>';
    }
    if (!h) return;
    wrap.innerHTML = h;
    row.appendChild(wrap);
}
keepOuter('renderHouse', '_pregAdminHouse', function (f) {
    return function () {
        const r = f.apply(this, arguments);
        try { houseBtns(); } catch (e) { }
        return r;
    };
});
setInterval(function () { try { houseBtns(); } catch (e) { } }, 2000);

window.pregAdminState = function () {
    const me = u_();
    const a = users()[ADMIN] || (isAdm(me) ? me : null);
    console.log('%c===== 상담사 — 임신 · 고유 아이템 =====', 'color:#ff8fb1; font-size:13px');
    console.log('  같은 방 직원 :', a ? (roomieOf(a) ? ((users()[roomieOf(a)] || {}).name || roomieOf(a)) + ' (' + roomieOf(a) + ')' : '없음') : '-');
    console.log('  시킬 수 있나 :', (typeof canSire === 'function' && a) ? (canSire(a) ? 'O' : '✗') : '-');
    const nm = a ? giftName(a) : '';
    console.log('  고유 아이템  :', nm || '-', nm && typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[nm] ? '— ' + GIFT.d : '');
    console.log('  알림띠에서 뺀 소식 :', hushed + '번 (이 화면)');
};

})();
