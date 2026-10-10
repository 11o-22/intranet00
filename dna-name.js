// ==========================================
// ★ 출산 고유 아이템 — 「알 수 없는 물품입니다」 고치기
// bundles.json 마지막 묶음, dna-gifts.js · dna-extra.js 보다 뒤
// ==========================================
//
// ■ 무엇이 안 됐나
//
//   소지품에서 고유 아이템 설명이 「알 수 없는 물품입니다.」 로 떴다.
//   값도 「-」, 장착 단추도 안 섰다.
//
//   renderInventory 는 이렇게 그린다 (index.html:6391).
//
//       const cat = ITEM_CATALOG[item];
//       const desc = cat ? cat.desc : '알 수 없는 물품입니다.';
//
//   즉 **그 이름이 ITEM_CATALOG 에 없다**는 뜻이다. 고유 아이템은
//   파일에 박혀 있지 않고 `ensureDnaItem(사원)` 이 접속 중에 만들어
//   올린다. 그래서 다음 세 가지 때 비어 버린다.
//
//     ① 사원 목록이 다 안 내려왔을 때 올라온다
//        buildAllDnaItems() 는 접속 **2.5초 뒤 딱 한 번** 돈다
//        (dna-gifts.js:414). 그때 db.users 에 안 들어와 있던 사원의
//        것은 영영 안 만들어진다.
//     ② 주인의 번호가 바뀌었을 때
//        이름이 「선물 이름 · DNA」 라서, 번호가 바뀌면 **새 이름**으로
//        올라간다. 예전에 낳아서 받아 둔 물건은 옛 이름 그대로 남아
//        짝이 없어진다.
//     ③ 주인이 회사에 없을 때
//        isRealUser 가 아니면 ensureDnaItem 이 건너뛴다.
//
// ■ 어떻게 고쳤나
//
//   **이름에서 되살린다.** 이름이 「선물 이름 · DNA 여덟 자」 라서,
//   이름만 있으면 무엇인지 다 알 수 있다.
//
//       '별빛을 담은 구슬 · ATGCATGC'
//          └ 선물 이름 → DNA_GIFTS 에서 성능을 찾고
//                 └ DNA → 그 DNA 를 가진 사원이 주인
//
//   들고 있거나 차고 있는 것 가운데 ITEM_CATALOG 에 없는 것을 찾아
//   그 자리에서 채워 넣는다. 주인을 찾으면 추가 부여(dnaExtra)까지
//   합쳐서 적는다.
//
//   번호는 **건드리지 않는다.** dnaGiftOf·dnaOf 는 값이 없으면 그
//   자리에서 만들어 서버에 적으므로 여기서는 부르지 않는다.
//   이미 번호가 적혀 있는 사원의 것만 미리 올려 둔다.
//
// ■ 콘솔
//   dnaFixNames()   지금 떠도는 것을 찾아 채운다 (무엇을 채웠는지 적어 준다)

(function dnaName() {

const SEP = ' · ';
const RE_DNA = /^[ATGC]{6,12}$/;

function users() { return (typeof db !== 'undefined' && db.users) ? db.users : {}; }
function gifts() { return (typeof DNA_GIFTS !== 'undefined') ? DNA_GIFTS : []; }
function cat() { return (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG : null; }
function base(w) {
    try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
    catch (e) { return String(w || ''); }
}

// 「선물 이름 · DNA」 로 갈라 본다. 아니면 null.
function split_(nm) {
    const s = String(nm || '');
    const i = s.lastIndexOf(SEP);
    if (i <= 0) return null;
    const dna = s.slice(i + SEP.length).trim();
    if (!RE_DNA.test(dna)) return null;
    const gname = s.slice(0, i).trim();
    if (!gname) return null;
    const g = gifts().filter(function (x) { return x && x.n === gname; })[0];
    if (!g) return null;
    return { g: g, dna: dna, name: s };
}

function ownerOfDna(dna) {
    const U = users();
    const keys = Object.keys(U);
    for (let i = 0; i < keys.length; i++) {
        const u = U[keys[i]];
        if (u && u.dna === dna && u.name) return u;
    }
    return null;
}

function descOf(e) {
    try { if (typeof dnaDescOf === 'function') return dnaDescOf(e); } catch (err) { }
    return '';
}

// 이름 하나를 카탈로그에 올린다. 이미 있으면 그대로 둔다.
function put(nm) {
    const C = cat();
    if (!C || !nm) return null;
    if (C[nm]) return null;                       // 이미 있다
    const p = split_(nm);
    if (!p) return null;

    const owner = ownerOfDna(p.dna);
    const e = Object.assign({}, p.g.e);
    if (owner && owner.dnaExtra) {
        Object.keys(owner.dnaExtra).forEach(function (k) {
            e[k] = (e[k] || 0) + owner.dnaExtra[k];
        });
    }
    const d = descOf(e) || p.g.d;

    C[nm] = {
        price: 30000, usable: true, targetable: false,
        effect: 'equip_dna',
        dnaOwner: owner ? owner.code : '',
        dnaEff: e,
        desc: '[고유] ' + (owner ? owner.name + ' 사원의 것' : '주인을 찾지 못한 것')
            + '. 장착하면 ' + d + '.'
    };
    try {
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(nm) < 0) NO_SELL_ITEMS.push(nm);
    } catch (e2) { }
    return { 이름: nm, 주인: owner ? owner.name : '(못 찾음)', 성능: d };
}

// ① 이미 번호가 적혀 있는 사원의 것을 미리 올려 둔다 (번호는 안 나눠 준다)
function fromRoster() {
    const out = [];
    const U = users(), G = gifts();
    Object.keys(U).forEach(function (c) {
        const u = U[c];
        if (!u || !u.name || !u.dna) return;
        if (u.dnaGift == null || !G[u.dnaGift]) return;
        const r = put(G[u.dnaGift].n + SEP + u.dna);
        if (r) out.push(r);
    });
    return out;
}

// ② 내가 들고 있거나 차고 있는 것 가운데 짝이 없는 것
function fromMine() {
    const out = [];
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) return out;
    const list = [].concat(
        Array.isArray(u.inventory) ? u.inventory : [],
        (Array.isArray(u.equippedWeapons) ? u.equippedWeapons : []).map(base)
    );
    const seen = {};
    list.forEach(function (nm) {
        if (!nm || seen[nm]) return;
        seen[nm] = 1;
        const r = put(nm);
        if (r) out.push(r);
    });
    return out;
}

// ③ 남들이 들고 있는 것까지 (사원 목록이 올라와 있을 때)
function fromEveryone() {
    const out = [];
    const U = users();
    const seen = {};
    Object.keys(U).forEach(function (c) {
        const u = U[c];
        if (!u) return;
        const list = [].concat(
            Array.isArray(u.inventory) ? u.inventory : [],
            (Array.isArray(u.equippedWeapons) ? u.equippedWeapons : []).map(base)
        );
        list.forEach(function (nm) {
            if (!nm || seen[nm]) return;
            seen[nm] = 1;
            const r = put(nm);
            if (r) out.push(r);
        });
    });
    return out;
}

function sweep() {
    if (!cat() || !gifts().length) return [];
    const got = [].concat(fromRoster(), fromMine(), fromEveryone());
    return got;
}

window.dnaFixNames = function () {
    const got = sweep();
    console.log('%c===== 고유 아이템 이름 되살리기 =====', 'color:#c9a8ff; font-size:13px');
    if (!got.length) { console.log('채울 것이 없습니다 — 전부 멀쩡합니다.'); return []; }
    console.table(got);
    console.log(got.length + '개를 채웠습니다.');
    try { if (typeof renderInventory === 'function'
        && document.getElementById('inventory-list')) renderInventory(); } catch (e) { }

    // 그래도 짝을 못 찾은 것
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (u && Array.isArray(u.inventory)) {
        const lost = u.inventory.filter(function (nm) {
            return nm.indexOf(SEP) > 0 && !cat()[nm];
        });
        if (lost.length) {
            console.warn('아직 짝을 못 찾은 것 — ' + Array.from(new Set(lost)).join(', '));
            console.log('  (선물 이름이 표에 없는 것입니다. dnaWho() 로 견줘 보십시오)');
        }
    }
    return got;
};

// ==========================================
// 돌리기
// ==========================================
//
//   사원 목록은 늦게 내려온다. 한 번만 훑으면 또 빈다.
//   처음 삼십 초 동안 세 번, 그 뒤로는 소지품을 그릴 때마다 본다.
let quiet = 0;
function tick() {
    try {
        const got = sweep();
        if (got.length) {
            quiet = 0;
            console.log('[고유] 떠돌던 이름 ' + got.length + '개를 채웠습니다.');
        } else quiet++;
    } catch (e) { }
}
setTimeout(tick, 3200);
setTimeout(tick, 8000);
setTimeout(tick, 20000);
const iv = setInterval(function () {
    tick();
    if (quiet > 8) clearInterval(iv);       // 한참 조용하면 그만둔다
}, 15000);

// 소지품을 그리기 **전에** 채운다 — 그래야 첫 그림부터 제대로 뜬다
(function hookInv() {
    const t = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._dnaName) { clearInterval(t); return; }
        const _r = renderInventory;
        const w = function () {
            try { sweep(); } catch (e) { }
            return _r.apply(this, arguments);
        };
        w._dnaName = true;
        renderInventory = w;
        window.renderInventory = w;
        clearInterval(t);
        console.log('[고유] 소지품 이름 되살리기 연결');
    }, 400);
    setTimeout(function () { clearInterval(t); }, 40000);
})();

console.log('[고유] dnaFixNames()');

})();
