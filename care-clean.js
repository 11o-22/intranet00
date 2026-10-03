// ==========================================
// ★ 돌보기 잔해 치우기
// index.html 에서 preg-v2.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 왜 아직 떠 있나
//
//   preg-v2.js 는 ITEM_CATALOG 에서만 5종을 지운다. (preg-v2.js:37)
//   그런데 사택 매점의 「🤍 돌봄 용품」 칸은 ITEM_CATALOG 를 보지 않는다.
//   PREG_ITEMS 를 직접 읽어서 줄을 만든다. (pregnancy2.js:404)
//   PREG_ITEMS 는 아무도 비우지 않았으므로 칸은 그대로 그려진다.
//
//       pregnancy2.js:398  (function hookStore() {
//       pregnancy2.js:401     if (... document.getElementById('preg-store')) return;   ← 여기
//       pregnancy2.js:416     <div id="preg-store" ...>🤍 돌봄 용품
//
//   put() 은 IIFE 안에 있어 밖에서 못 고친다.
//   대신 같은 id 를 가진 빈 칸을 미리 넣어 둔다. 위 줄에서 스스로 돌아간다.
//
//   같은 이유로 남아 있는 것들
//     · preg-roster.js 의 「여기서 바로 돌볼 수 있습니다」 명단
//       — 돌본다 단추가 doCare 를 부르는데 그것은 이미 빈 함수다. 눌러도 아무 일이 없다.
//     · 전에 사 둔 물건이 소지품에 그대로 남아 있다. 쓸 수도, 버릴 수도 없다.
//
// ■ 무엇을 하나
//
//   1. PREG_ITEMS 를 비운다 — 어디서 읽어도 줄이 생기지 않는다
//   2. ITEM_CATALOG 에서 5종을 지운다 (preg-v2 가 이미 했지만 순서가 어긋날 수 있다)
//   3. 사택 매점 칸을 빈 칸으로 막는다
//   4. 돌봄 명단을 그리지 않게 한다
//   5. 소지품에 남은 것을 거둔다 — 거둔 내역은 기록에 남는다
//
//   포인트는 돌려주지 않는다. 돌려주려면 바로 아래 줄을 true 로 고친다.

// 샀던 값만큼 돌려줄지 — 파일을 올리기 전에 여기를 고친다
if (window.CARE_REFUND === undefined) window.CARE_REFUND = false;

(function careClean() {

// 이름은 PREG_ITEMS 에서 가져오고, 없으면 적어 둔 것을 쓴다
const FALLBACK = {
    '미지근한 물수건': 400,
    '흔들의자':       900,
    '식지 않는 죽':   1500,
    '두꺼운 담요':    2600,
    '밤새 켜 둔 등':  5000
};

const PRICE = {};
(function names() {
    try {
        if (typeof PREG_ITEMS !== 'undefined' && PREG_ITEMS) {
            Object.keys(PREG_ITEMS).forEach(function (n) {
                PRICE[n] = (PREG_ITEMS[n] && PREG_ITEMS[n].price) || FALLBACK[n] || 0;
            });
        }
    } catch (e) { }
    Object.keys(FALLBACK).forEach(function (n) {
        if (PRICE[n] === undefined) PRICE[n] = FALLBACK[n];
    });
})();
const ITEMS = Object.keys(PRICE);

// ==========================================
// 1·2. 목록에서 지운다
// ==========================================
(function drop() {
    const iv = setInterval(function () {
        let done = false;

        try {
            if (typeof PREG_ITEMS !== 'undefined' && PREG_ITEMS) {
                Object.keys(PREG_ITEMS).forEach(function (n) { delete PREG_ITEMS[n]; });
                done = true;
            }
        } catch (e) { }

        if (typeof ITEM_CATALOG !== 'undefined') {
            ITEMS.forEach(function (n) { delete ITEM_CATALOG[n]; });
            done = true;
        }

        // 혹시 어느 상점 목록에 이름이 들어가 있으면 뺀다
        ['ALL_10_ITEMS', 'ALIEN_ITEMS_POOL', 'NO_SELL_ITEMS'].forEach(function (k) {
            let arr;
            try { arr = window[k] || eval(k); } catch (e) { return; }
            if (!Array.isArray(arr)) return;
            ITEMS.forEach(function (n) {
                let i;
                while ((i = arr.indexOf(n)) >= 0) arr.splice(i, 1);
            });
        });

        if (!done) return;
        clearInterval(iv);
        console.log('[돌보기] 목록에서 ' + ITEMS.length + '종 제거');
    }, 500);
})();

// 남은 단추가 있어도 사지지 않게
(function noBuy() {
    const iv = setInterval(function () {
        if (typeof buyPregItem !== 'function') return;
        if (buyPregItem._gone) { clearInterval(iv); return; }
        buyPregItem = function () {
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('돌봄 용품은 없어졌습니다.');
            }
        };
        buyPregItem._gone = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 3. 사택 매점 칸 막기
// ==========================================
//
// pregnancy2.js 의 put() 은 #preg-store 가 이미 있으면 그냥 돌아간다.
// 그러니 빈 칸을 먼저 넣어 두면 영원히 그려지지 않는다.
// put() 은 renderHouse 뒤 90ms 에 돈다. 우리가 그보다 먼저 넣는다.
function seal() {
    const box = document.getElementById('house-main-body');
    if (!box) return;

    const ex = document.getElementById('preg-store');
    if (ex) {
        if (ex.dataset.sealed) return;      // 우리가 넣은 빈 칸이다
        ex.remove();                        // 진짜 칸이 들어왔으면 걷어낸다
    }
    const ph = document.createElement('div');
    ph.id = 'preg-store';
    ph.dataset.sealed = '1';
    ph.style.display = 'none';
    box.appendChild(ph);
}

(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._careSealed) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            seal();                         // put() 이 예약된 직후, 돌기 전에 막는다
            return r;
        };
        renderHouse._careSealed = true;
        clearInterval(iv);
        console.log('[돌보기] 사택 매점 칸 차단');
    }, 500);
})();
setInterval(seal, 900);                     // 처음 1.5초 지연 호출까지 덮는다

// ==========================================
// 4. 돌봄 명단 치우기
// ==========================================
//
// 돌본다 단추가 부르는 doCare 는 이미 빈 함수다. 눌러도 아무 일이 없으므로
// 칸 자체를 그리지 않는다. (preg-roster.js 가 없으면 아무 일도 하지 않는다)
(function noRoster() {
    const iv = setInterval(function () {
        if (typeof renderPregRoster !== 'function') return;
        if (renderPregRoster._gone) { clearInterval(iv); return; }
        renderPregRoster = function () {
            const el = document.getElementById('preg-roster');
            if (el) el.remove();
        };
        renderPregRoster._gone = true;
        clearInterval(iv);
        const el = document.getElementById('preg-roster');
        if (el) el.remove();
        console.log('[돌보기] 돌봄 명단 제거');
    }, 500);
})();

// ==========================================
// 5. 소지품에 남은 것 거두기
// ==========================================
let swept = false;
function sweep() {
    if (swept || !currentUser) return;
    if (!Array.isArray(currentUser.inventory)) return;
    swept = true;

    const took = {};
    let back = 0;
    const keep = [];
    currentUser.inventory.forEach(function (n) {
        if (PRICE[n] === undefined) { keep.push(n); return; }
        took[n] = (took[n] || 0) + 1;
        back += PRICE[n];
    });

    // 장착 칸에 잘못 꽂혀 있던 것도 뺀다
    const eq = currentUser.equippedWeapons;
    let eqCut = 0;
    if (Array.isArray(eq)) {
        for (let i = eq.length - 1; i >= 0; i--) {
            const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(eq[i]) : eq[i];
            if (PRICE[base] !== undefined) { eq.splice(i, 1); eqCut++; }
        }
    }

    const names = Object.keys(took);
    if (!names.length && !eqCut) return;

    if (names.length) {
        currentUser.inventory.length = 0;
        keep.forEach(function (n) { currentUser.inventory.push(n); });
    }

    const f = { inventory: 1, history: 1 };
    if (eqCut) f.equippedWeapons = 1;

    let line = '[돌봄 폐지] ' + names.map(function (n) {
        return n + (took[n] > 1 ? ' ' + took[n] + '개' : '');
    }).join(', ') + '을(를) 거두었습니다.';

    if (window.CARE_REFUND && back > 0) {
        currentUser.points = (currentUser.points || 0) + back;
        f.points = 1;
        line += ' (' + back.toLocaleString() + ' P 환급)';
    }

    if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, line);
    if (typeof saveFields === 'function') {
        try { saveFields(f); } catch (e) { console.error('[돌보기] 저장 실패:', e); }
    }
    if (typeof updateUI === 'function') updateUI();
    console.log('[돌보기] 소지품에서 거둠 — ' + line);
}
(function waitMe() {
    const iv = setInterval(function () {
        if (!currentUser || !Array.isArray(currentUser.inventory)) return;
        sweep();
        clearInterval(iv);
    }, 1200);
})();

// ==========================================
// 확인
// ==========================================
window.careState = function () {
    console.log('%c===== 돌보기 잔해 =====', 'color:#ff8fb1; font-size:13px');

    let pregLeft = '없음';
    try {
        if (typeof PREG_ITEMS !== 'undefined' && PREG_ITEMS) {
            const k = Object.keys(PREG_ITEMS);
            pregLeft = k.length ? k.join(', ') : '비었음';
        }
    } catch (e) { pregLeft = '못 읽음'; }

    const catLeft = (typeof ITEM_CATALOG !== 'undefined')
        ? ITEMS.filter(function (n) { return !!ITEM_CATALOG[n]; }) : [];
    const inv = (currentUser && currentUser.inventory) || [];
    const invLeft = ITEMS.filter(function (n) { return inv.indexOf(n) >= 0; });

    const store = document.getElementById('preg-store');
    console.table([
        { 자리: 'PREG_ITEMS',        상태: pregLeft },
        { 자리: 'ITEM_CATALOG',      상태: catLeft.length ? catLeft.join(', ') : '비었음' },
        { 자리: '사택 매점 칸',       상태: !store ? '없음' : (store.dataset.sealed ? '빈 칸으로 막음' : '★ 아직 떠 있음') },
        { 자리: '돌봄 명단',          상태: document.getElementById('preg-roster') ? '★ 아직 떠 있음' : '없음' },
        { 자리: '내 소지품',          상태: invLeft.length ? invLeft.join(', ') : '비었음' }
    ]);
    console.log('  환급: ' + (window.CARE_REFUND ? '켜짐' : '꺼짐')
        + ' — 켜려면 care-clean.js 의 CARE_REFUND 줄을 true 로 고친다');
};

console.log('[돌보기] careState()');

})();