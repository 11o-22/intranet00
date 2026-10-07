// ==========================================
// ★ 속성 변경 — 변경권 없이, 주 3회
// index.html 에서 reattr.js · titles.js 보다 뒤에 불러온다
// ==========================================
//
// ■ 무엇을 하나
//   변경권이 없어졌으므로(reattr-off.js) 속성 바꾸기 자체를 모두에게 연다.
//   다만 한 주에 세 번까지다.
//
//   자리와 등급 규칙은 그대로다. (reattr.js)
//       첫 번째 자리(메인)  본체 등급을 그대로 따른다
//       두세 번째 자리      D 등급부터 다시 (빈 각인지를 썼으면 C)
//
//   세는 단위는 **지우는 쪽**이다. 비워 놓고 새로 안 고르더라도 한 번 쓴 것이다.
//   변경권이 지울 때 없어지던 것과 같다.
//
//   주는 월요일 0시에 바뀐다.
//
// ■ ⛓️‍💥 이레귤러
//   이 칭호는 「변경권 없이 자유롭게 바꾼다」가 본래 효과이므로 횟수를 세지 않는다.
//   세고 싶으면 아래 IRR_FREE 를 false 로 고친다.
//
// ■ 저장되는 자리
//   currentUser.reattrWeek = { k: '주 열쇠', n: 쓴 횟수 }
//
// ■ 콘솔
//   reattrLeft()

if (window.REATTR_WEEKLY === undefined) window.REATTR_WEEKLY = 3;
if (window.REATTR_IRR_FREE === undefined) window.REATTR_IRR_FREE = true;

(function reattrFree() {

const BTN = 'gear-reattr-free';
const LABEL = '주간 변경';

// ==========================================
// 1. 주 단위 세기 — 월요일 0시에 바뀐다
// ==========================================
function weekKey() {
    const d = new Date();
    const back = (d.getDay() + 6) % 7;          // 월 0 · 일 6
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - back);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
        + '-' + String(d.getDate()).padStart(2, '0') + '-w';
}

function bag() {
    if (!currentUser) return { k: weekKey(), n: 0 };
    const k = weekKey();
    if (!currentUser.reattrWeek || currentUser.reattrWeek.k !== k) {
        currentUser.reattrWeek = { k: k, n: 0 };
    }
    return currentUser.reattrWeek;
}

function freeOne() {
    if (!currentUser) return false;
    if (currentUser.code === 'kario0987') return true;
    if (window.REATTR_IRR_FREE && typeof window._irregular === 'function') {
        try { if (window._irregular(currentUser)) return true; } catch (e) { }
    }
    return false;
}

window.reattrLeftN = function () {
    if (freeOne()) return Infinity;
    return Math.max(0, window.REATTR_WEEKLY - (bag().n || 0));
};

function spend() {
    if (freeOne()) return;
    const b = bag();
    b.n = (b.n || 0) + 1;
    if (typeof saveFields === 'function') { try { saveFields({ reattrWeek: 1 }); } catch (e) { } }
}

function leftText() {
    const n = window.reattrLeftN();
    return (n === Infinity) ? '제한 없음' : ('이번 주 ' + n + ' / ' + window.REATTR_WEEKLY + '회 남음');
}

// ==========================================
// 2. 지울 때 — 횟수를 보고 깎는다
//
//   reattr.js 와 titles.js 도 같은 함수를 감싼다. 이 파일이 가장 바깥이라
//   먼저 막아서고, 통과하면 그대로 넘긴다.
// ==========================================
(function hookDo() {
    const iv = setInterval(function () {
        if (typeof doGearReattr !== 'function') return;
        if (doGearReattr._weekly) { clearInterval(iv); return; }
        const _do = doGearReattr;
        doGearReattr = function (attr, itemName) {
            if (window.reattrLeftN() <= 0) {
                showCustomAlert('이번 주 속성 변경을 다 썼습니다.\n\n'
                    + '한 주에 ' + window.REATTR_WEEKLY + '번까지 바꿀 수 있습니다.\n'
                    + '월요일 0시에 다시 채워집니다.');
                return;
            }
            spend();
            return _do.call(this, attr, itemName || LABEL);
        };
        doGearReattr._weekly = true;
        clearInterval(iv);
        console.log('[속성 변경] 주 ' + window.REATTR_WEEKLY + '회 제한 연결');
    }, 400);
})();

// ==========================================
// 3. 안내 글 — 「변경권은 즉시 소모됩니다」를 남은 횟수로 바꾼다
// ==========================================
(function hookOpen() {
    const iv = setInterval(function () {
        if (typeof openGearReattr !== 'function') return;
        if (openGearReattr._weekly) { clearInterval(iv); return; }
        const _open = openGearReattr;
        openGearReattr = function (itemName) {
            const r = _open.call(this, itemName || LABEL);
            const body = document.getElementById('gear-modal-body');
            if (body) {
                body.innerHTML = body.innerHTML.replace(
                    /<span style="color:#ff9800;">변경권은 즉시 소모됩니다\.<\/span>/,
                    '<span style="color:#ff9800;">지운 그 순간 한 번 쓴 것이 됩니다. ('
                    + leftText() + ')</span>');
            }
            return r;
        };
        openGearReattr._weekly = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 4. 전용 장비 칸에 단추를 붙인다 (모두에게)
//
//   titles.js 가 이레귤러에게 붙이는 단추와 같은 자리다.
//   이레귤러는 그쪽 단추를 쓰므로 여기서는 붙이지 않는다.
// ==========================================
function attachBtn() {
    if (!currentUser) return;
    if (document.getElementById(BTN)) return;
    if (document.getElementById('irr-reattr-btn')) return;   // 이레귤러 단추가 이미 있다
    if (typeof getGear !== 'function') return;

    let g = null;
    try { g = getGear(currentUser); } catch (e) { return; }
    if (!g || !g.attrs || !g.attrs.length) return;           // 새길 것이 없으면 안 붙인다

    const box = document.getElementById('inventory-list-container');
    if (!box) return;

    let card = null;
    for (let i = 0; i < box.children.length; i++) {
        if ((box.children[i].textContent || '').indexOf('[전용 장비]') >= 0) { card = box.children[i]; break; }
    }
    if (!card) return;

    let row = null;
    const divs = card.getElementsByTagName('div');
    for (let i = divs.length - 1; i >= 0; i--) {
        if (divs[i].getElementsByTagName('button').length) { row = divs[i]; break; }
    }
    if (!row) return;

    const left = window.reattrLeftN();
    const b = document.createElement('button');
    b.id = BTN;
    b.className = 'inv-btn';
    b.style.cssText = 'flex:1; min-width:84px;'
        + (left > 0
            ? ' background:linear-gradient(145deg,#4a2c73,#2a0c43); color:#fff; border-color:#8a6cb3;'
            : ' background:#161616; color:#8a8a8a; border-color:#333; cursor:default;');
    b.textContent = '🔁 속성 바꾸기'
        + (left === Infinity ? '' : ' (' + left + '/' + window.REATTR_WEEKLY + ')');
    if (left > 0) {
        b.onclick = function () { if (typeof openGearReattr === 'function') openGearReattr(LABEL); };
    } else {
        b.disabled = true;
    }
    row.appendChild(b);
}

(function wrapRender() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._weeklyBtn) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const r = _r.apply(this, arguments);
            try { attachBtn(); } catch (e) { }
            return r;
        };
        renderInventory._weeklyBtn = true;
        clearInterval(iv);
    }, 400);
})();

setInterval(function () { try { attachBtn(); } catch (e) { } }, 2500);

// ==========================================
// 5. 확인
// ==========================================
window.reattrLeft = function () {
    console.log('%c===== 속성 변경 =====', 'color:#d4bbff; font-size:13px');
    if (!currentUser) { console.log('  로그인 후에 쓰세요.'); return; }
    const b = bag();
    console.log('  이번 주:', b.k);
    console.log('  쓴 횟수:', (b.n || 0) + ' / ' + window.REATTR_WEEKLY,
        freeOne() ? '(제한 없음)' : '');
    console.log('  남은 횟수:', leftText());
    console.log('  연결 — 횟수:', (typeof doGearReattr === 'function' && doGearReattr._weekly) ? 'O' : '✗',
        '· 단추:', document.getElementById(BTN) ? 'O' : '-');
    console.log('  규칙: 첫 자리(메인)는 본체 등급 유지 · 두세 번째 자리는 D 등급부터');
};

console.log('[속성 변경] 변경권 없이 주 ' + window.REATTR_WEEKLY + '회 — reattrLeft()');

})();
