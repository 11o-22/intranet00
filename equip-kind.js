// ==========================================
// ★ 이름만으로 장착형을 가르던 것 — 꿈결 수집기가 소모품으로 세어졌다
// bundles.json 마지막 묶음, newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   장착형인지 아닌지를 **효과 이름이 'equip' 으로 시작하는가**로 갈라 왔다.
//
//       index.html:3621   if (c.effect && c.effect.startsWith('equip')) equips.push(it);
//                         else if (c.usable) consums.push(it);        ← 소모품으로 간다
//
//   그런데 newitems2.js 의 장착형 다섯 가지는 이름이 그렇지 않다.
//
//       꿈결 수집기      n_dream     (장착)
//       은색 저울        n_scale     (장착)
//       부적이 깃든 등    n_lamp      (장착)
//       포승줄           n_rope      (장착)
//       공기 누름돌      n_stone     (장착)
//
//   채우는 자리(newitems2.js:1802)는 SELF 표에 손질이 없으면 장착형으로 보므로
//   제대로 걸린다. 그런데 **그 바깥의 모든 자리가 소모품으로 센다.**
//
//       · 어둠 반입 창에서 「장비」가 아니라 「소모품」 칸에 뜬다
//         → 죽으면 소모품처럼 소지품에서 지워진다. 「사라진다」가 이것이다
//       · 어둠 안에서 소모품처럼 꺼내 쓸 수 있다 (dark-items.js:37 — 장비 칸으로
//         옮기면 반입 목록에서 빠지므로 여기도 같이 풀린다)
//       · 소지품 단추가 「장착」이 아니라 「사용」으로 뜬다
//       · 물어보는 창도 「사용하시겠습니까」로 뜬다
//       · 소지품 분류가 장비 칸이 아니라 딴 칸으로 간다
//
// ■ 어떻게 고치나
//
//   효과 이름을 바꾸면 SELF 표·luck-all·itemfix 까지 줄줄이 손봐야 하고,
//   이미 서버에 쌓인 자료와도 어긋난다. 그래서 **가르는 자리만** 고친다.
//
//   물품 목록에 장착형이라는 표(equipKind)를 달고, 'equip' 으로 시작하는지
//   보던 자리들이 그 표도 같이 보게 한다.
//
//   isEquipItem(이름) 하나로 모은다. 앞으로 장착형을 더 넣을 때는 아래
//   WORN 에 이름만 보태면 된다.
//
// ■ 콘솔
//   equipKind()   어느 물건이 장착형으로 세어지는지

(function equipKind() {

// 이름이 equip 으로 시작하지 않는 장착형
const WORN = ['꿈결 수집기', '은색 저울', '부적이 깃든 등', '포승줄', '공기 누름돌'];

function mark() {
    if (typeof ITEM_CATALOG === 'undefined') return false;
    let n = 0;
    WORN.forEach(function (nm) {
        const c = ITEM_CATALOG[nm];
        if (!c || c.equipKind) return;
        c.equipKind = true;
        n++;
    });
    return n;
}

// 장착형인가 — 이름이든 물품 칸이든 받는다
function isEquipItem(x) {
    const c = (x && typeof x === 'object') ? x
        : ((typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[x] : null);
    if (!c) return false;
    if (c.equipKind) return true;
    return String(c.effect || '').indexOf('equip') === 0;
}
window.isEquipItem = isEquipItem;

// ==========================================
// 1. 어둠 반입 — 장비 칸으로 보낸다
// ==========================================
//
// 고르는 창을 그리는 두 함수(혼자·여럿)가 같은 줄을 쓴다. 그 줄은
// 물품 목록을 보고 가르므로, 가르기 전에 ITEM_CATALOG 쪽 표만 달아 두면
// 그대로 장비 칸으로 간다. 표는 아래에서 미리 달아 둔다.
//
// 다만 index.html 은 c.effect 만 보므로, 그 비교가 참이 되도록
// 「effect 가 equip 으로 시작하는 것처럼」 보이게 할 수는 없다.
// 그래서 창을 그린 뒤에 칸을 옮겨 준다.
// 소모품 칸에 잘못 들어간 장착형을 장비 칸으로 옮긴다.
// 창이 두 가지다 — 혼자 들어가는 창(dark-eq/dark-cs)과 파티 창(pt-eq/pt-cs).
function equipBoxFor(csName) {
    if (csName === 'dark-cs') return document.getElementById('dark-equip-box');
    const one = document.querySelector('input.pt-eq');
    if (one) return one.closest('div');
    // 장비가 하나도 없을 때 — 「장비 (최대 2)」 다음 칸을 찾는다
    const head = Array.from(document.querySelectorAll('div')).find(function (d) {
        return d.children.length === 0 && /^장비 \(최대/.test((d.textContent || '').trim());
    });
    return head ? head.nextElementSibling : null;
}

function moveToEquipBox(csName, eqName) {
    const list = Array.from(document.querySelectorAll('input.' + csName))
        .filter(function (cb) { return isEquipItem(cb.value); });
    if (!list.length) return 0;
    const box = equipBoxFor(csName);
    if (!box) return 0;

    let moved = 0, csBox = null;
    list.forEach(function (cb) {
        const lab = cb.closest('label');
        if (!lab) return;
        if (!csBox) csBox = lab.parentNode;
        cb.className = eqName;
        const none = box.querySelector('div');
        if (none && /없습니다/.test(none.textContent || '')) none.remove();
        box.appendChild(lab);
        moved++;
    });
    if (moved && csBox && !csBox.querySelector('label')) {
        csBox.innerHTML = '<div style="font-size:10px; color:#666;">반입 가능한 소모품이 없습니다.</div>';
    }
    return moved;
}

(function hookBrief() {
    // 창이 열릴 때마다 한 번씩 옮긴다 — 어느 함수가 그리든 상관없이 본다
    let onDark = false, onParty = false;
    setInterval(function () {
        try {
            const d = !!document.getElementById('dark-equip-box');
            if (d && !onDark) moveToEquipBox('dark-cs', 'dark-eq');
            onDark = d;

            const p = !!document.querySelector('input.pt-eq, input.pt-cs');
            if (p && !onParty) moveToEquipBox('pt-cs', 'pt-eq');
            onParty = p;
        } catch (e) { console.warn('[장착형]', e); }
    }, 300);
})();

// ==========================================
// 2. 소지품 단추 글자 — 「사용」이 아니라 「장착」
// ==========================================
function paintBtn() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    box.querySelectorAll('.inv-card').forEach(function (card) {
        const nm = card.querySelector('.inv-card-name');
        if (!nm || !isEquipItem(nm.textContent.trim())) return;
        card.querySelectorAll('button.inv-btn-use').forEach(function (b) {
            if (b.textContent.trim() === '사용') b.textContent = '장착';
        });
    });
}
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._worn) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const r = _r.apply(this, arguments);
            try { paintBtn(); } catch (e) { }
            return r;
        };
        renderInventory._worn = true;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 3. 물어보는 창 — 「장착하시겠습니까」
// ==========================================
(function hookConfirm() {
    const iv = setInterval(function () {
        if (typeof openInvConfirm !== 'function') return;
        if (openInvConfirm._worn) { clearInterval(iv); return; }
        const _o = openInvConfirm;
        openInvConfirm = function (icon, text, sub, okLabel, cb) {
            try {
                const m = /<b>([^<]+)<\/b>/.exec(String(text || ''));
                if (m && isEquipItem(m[1]) && okLabel === '사용한다') {
                    icon = '⚙';
                    text = String(text).replace('사용하시겠습니까?', '장착하시겠습니까?');
                    okLabel = '장착한다';
                }
            } catch (e) { }
            return _o.call(this, icon, text, sub, okLabel, cb);
        };
        openInvConfirm._worn = true;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 4. 소지품 분류 — 장비 칸으로
// ==========================================
(function hookCat() {
    const iv = setInterval(function () {
        if (typeof invCatOf !== 'function') return;
        if (invCatOf._worn) { clearInterval(iv); return; }
        const _c = invCatOf;
        invCatOf = function (n) {
            if (isEquipItem(n)) return 'equip';
            return _c.apply(this, arguments);
        };
        invCatOf._worn = true;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 20000);
})();

// ==========================================
// 표 달기 — 물품 목록이 다 차려진 뒤에
// ==========================================
(function start() {
    const iv = setInterval(function () {
        const n = mark();
        if (n === false) return;
        clearInterval(iv);
        console.log('[장착형] 이름이 equip 으로 시작하지 않는 장착형 ' + WORN.length + '가지를 장비로 셉니다');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 20000);
})();

window.equipKind = function () {
    console.log('%c===== 장착형 가르기 =====', 'color:#c9a8ff; font-size:13px');
    console.table(WORN.map(function (n) {
        const c = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[n] : null;
        return { 물건: n, 효과이름: c ? c.effect : '(목록에 없음)',
                 표: (c && c.equipKind) ? 'O' : '✗',
                 장착형으로세나: isEquipItem(n) ? 'O' : '✗' };
    }));
    console.log('  이 표가 전부 O 여야 어둠 반입에서 장비 칸으로 갑니다.');
};

})();
