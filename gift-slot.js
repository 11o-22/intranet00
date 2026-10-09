// ==========================================
// ★ 「우리가 도움」으로 연 자리 — L 로 시작하고 L 로 남는다
// bundles.json 마지막 묶음, spaceitems.js 바로 뒤
// ==========================================
//
// ■ 무엇을 하나
//
//   「우리가 도움」이 자리를 하나 열 때, 그 자리의 번호를
//   g.giftSlots 에 적어 둔다. (spaceitems.js)
//   여기서는 그 번호에 앉은 속성의 등급을 늘 L 로 지킨다.
//
//     · 속성을 처음 새기면 D 가 아니라 L 로 시작한다
//     · 속성 변경권으로 갈아 끼워도 다시 L 이 된다
//     · 강화·손상으로도 달라지지 않는다 (L 은 원래 안 상한다)
//
// ■ 왜 「지키는 쪽」으로 짰나
//
//   등급을 적는 자리가 한 군데가 아니다.
//
//       dark.js      pickGearAttr   새로 새길 때      D (빈 각인지면 C)
//       reattr.js    pickGearAttr   자리를 되돌릴 때  D (빈 각인지면 C)
//       dark.js      강화            성공하면 한 단계
//       gear-break   손상            한 단계 아래로
//       gear-repair  수리·되돌리기
//       index.html   상담사 손지정
//
//   이 여섯을 다 잡으려면 같은 겹을 여섯 번 둘러야 하고, 겹치는
//   순서까지 맞아야 한다. 대신 반대로 두었다 — 「적힌 값이 무엇이든
//   선물 자리면 L 로 되돌린다」. 어느 길로 바뀌었든 돌아온다.
//
//   읽는 쪽(gearAttrGrade)도 한 겹 둘러, 적히기 전에 읽어도 L 이 나온다.
//
// ■ 자리 번호
//
//   「우리가 도움」은 늘 지금 열린 자리의 다음을 연다. 첫 자리(0번)는
//   본체 등급을 쓰므로 선물 자리가 될 일이 없다. 1번부터다.
//   손상으로 자리가 닫혀 번호가 열린 자리 수를 넘으면 그 번호는 쉰다.
//   (다시 열리면 그대로 되살아난다.)
//
//   번호가 안 적혀 있어도 **네 번째 자리부터는 선물 자리**로 친다.
//   조합으로 열 수 있는 것은 세 자리까지이고(두 번째 자리·세 번째 자리),
//   그 위는 「우리가 도움」밖에 길이 없기 때문이다.
//   이 파일이 생기기 전에 이미 네 번째를 연 사람도 이 길로 L 이 된다.
//   ⛓️‍💥 이레귤러가 임시로 올려 둔 네 번째는 제 힘으로 연 것이 아니므로
//   원래 자리 수(slotsReal)로 세어 제외한다.
//
// ■ 콘솔
//   giftSlotState()   어느 자리가 선물 자리인지 · 지금 등급
//   giftSlotPin()     손으로 한 번 맞추기

(function giftSlot() {

const TICK = 2500;

function gear(u) {
    u = u || (typeof currentUser !== 'undefined' ? currentUser : null);
    if (!u) return null;
    if (typeof getGear === 'function') { try { return getGear(u); } catch (e) { } }
    return u.soulGear || null;
}

// 칭호가 올려 둔 몫을 뺀, 제 힘으로 열려 있는 자리 수
function realOpen(g) {
    if (!g) return 1;
    return (g.slotsReal !== undefined) ? (g.slotsReal || 1) : (g.slots || 1);
}

// 지금 살아 있는 선물 자리 번호 — 열린 자리 안쪽만
//
// ① g.giftSlots 에 적어 둔 번호 (이 파일이 생긴 뒤에 연 자리)
// ② 번호가 안 적혀 있어도 네 번째부터는 선물 자리다.
//    조합으로는 세 자리까지만 열리고(두 번째 자리·세 번째 자리),
//    그 위는 「우리가 도움」밖에 길이 없다. 이 파일이 생기기 전에
//    연 자리도 이 길로 되짚는다.
//    ⛓️‍💥 이레귤러가 올려 둔 네 번째는 제 힘으로 연 것이 아니므로
//    realOpen(원래 자리 수)으로 센다.
const BY_ITEM_FROM = 3;          // 0부터 세어 네 번째 자리

function giftIdx(g) {
    if (!g) return [];
    const open = realOpen(g);
    const out = [];
    const add = function (n) {
        n = Number(n);
        if (!(n >= 1) || n >= open) return;          // 0번(본체)과 닫힌 자리는 뺀다
        if (out.indexOf(n) < 0) out.push(n);
    };
    if (Array.isArray(g.giftSlots)) g.giftSlots.forEach(add);
    for (let i = BY_ITEM_FROM; i < open; i++) add(i);
    out.sort(function (a, b) { return a - b; });
    return out;
}
window.giftSlotIdx = giftIdx;

// 이 속성이 선물 자리에 앉아 있나
function isGiftAttr(g, attr) {
    if (!g || !Array.isArray(g.attrs)) return false;
    const i = g.attrs.indexOf(attr);
    if (i < 1) return false;
    return giftIdx(g).indexOf(i) >= 0;
}
window.isGiftAttr = isGiftAttr;

// ==========================================
// 1. 적힌 등급을 L 로 되돌린다
// ==========================================
function pin(u, quiet) {
    u = u || (typeof currentUser !== 'undefined' ? currentUser : null);
    const g = gear(u);
    if (!g || !Array.isArray(g.attrs)) return 0;
    const idx = giftIdx(g);
    if (!idx.length) return 0;

    let n = 0;
    if (!g.attrGrades) g.attrGrades = {};
    idx.forEach(function (i) {
        const a = g.attrs[i];
        if (!a) return;                              // 아직 안 새긴 자리
        if (g.attrGrades[a] === 'L') return;
        g.attrGrades[a] = 'L';
        n++;
        if (!quiet) {
            const nm = (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[a]) ? GEAR_ATTRS[a].name : a;
            console.log('[우리가 도움] ' + (i + 1) + '번째 자리 ' + nm + ' — L 로 둡니다');
        }
    });
    if (!n) return 0;

    try { if (typeof saveFields === 'function') saveFields({ soulGear: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    return n;
}
window.giftSlotPin = function () {
    const n = pin(null, false);
    console.log(n ? ('✓ ' + n + '자리를 맞췄습니다.') : '맞출 것이 없습니다.');
};

setInterval(function () { try { pin(null, true); } catch (e) { } }, TICK);
setTimeout(function () { try { pin(null, true); } catch (e) { } }, 2000);

// ==========================================
// 2. 읽는 쪽 — 적히기 전에 읽어도 L
// ==========================================
(function hookRead() {
    const iv = setInterval(function () {
        if (typeof gearAttrGrade !== 'function') return;
        if (gearAttrGrade._gift) { clearInterval(iv); return; }
        const _g = gearAttrGrade;
        gearAttrGrade = function (g, attr) {
            try { if (isGiftAttr(g, attr)) return 'L'; } catch (e) { }
            return _g.apply(this, arguments);
        };
        gearAttrGrade._gift = true;
        clearInterval(iv);
        console.log('[우리가 도움] 선물 자리 등급 L 고정 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 3. 새로 새기거나 갈아 끼운 직후 — 기다리지 않고 바로
// ==========================================
//
// pickGearAttr 은 reattr.js 도 두르고 있어, 겹치는 순서에 따라
// 자리를 되돌리는 일이 내 뒤에 올 수 있다. 그래서 그 자리에서
// 맞추지 않고 한 박자 뒤에 맞춘다. 순서와 상관없이 맞는다.
(function hookPick() {
    const iv = setInterval(function () {
        if (typeof pickGearAttr !== 'function') return;
        if (pickGearAttr._gift) { clearInterval(iv); return; }
        const _p = pickGearAttr;
        pickGearAttr = function () {
            const r = _p.apply(this, arguments);
            setTimeout(function () { try { pin(null, false); } catch (e) { } }, 60);
            return r;
        };
        pickGearAttr._gift = true;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 확인
// ==========================================
window.giftSlotState = function (who) {
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const g = gear(u);
    console.log('%c===== ' + u.name + ' · 우리가 도움으로 연 자리 =====', 'color:#8fc9ff; font-size:13px');
    if (!g) { console.log('  전용 장비가 없습니다.'); return; }
    console.log('  자리 ' + (g.slots || 1) + '개'
        + (g.slotsReal !== undefined ? ' (칭호가 올려 둠 · 원래 ' + g.slotsReal + '개)' : '')
        + ' · 최대 ' + (window.GEAR_SLOT_MAX || 5) + '개');
    const idx = giftIdx(g);
    if (!idx.length) { console.log('  선물로 연 자리가 없습니다.'); return; }
    console.table((g.attrs || []).map(function (a, i) {
        const nm = (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[a]) ? GEAR_ATTRS[a].name : a;
        return {
            자리: i + 1, 속성: nm,
            등급: (i === 0) ? g.grade : ((g.attrGrades || {})[a] || 'D'),
            '우리가 도움': idx.indexOf(i) >= 0 ? 'O' : ''
        };
    }));
    const empty = idx.filter(function (i) { return !(g.attrs || [])[i]; });
    if (empty.length) console.log('  아직 안 새긴 선물 자리:', empty.map(function (i) { return (i + 1) + '번째'; }).join(' · '));
};

console.log('[우리가 도움] 선물 자리 — giftSlotState(사번) · giftSlotPin()');

})();
