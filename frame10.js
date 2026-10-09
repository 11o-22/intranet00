// ==========================================
// ★ 테두리 견본첩 — 열 장을 한 번에
// bundles.json 에서 frames.js · frames-new.js · frames-video*.js ·
// frames-sl.js 보다 뒤 (테두리가 다 들어온 뒤에 세야 한다) · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 달라지나
//
//   한 장씩 까던 것을 열 장씩 깐다. 열 장을 한 번에 까면 높은 등급이
//   나올 몫이 커지고, 열 장에 한 번은 A 이상이 반드시 들어간다.
//
//                        한 장씩        열 장씩
//       D                 60.3%          40.0%
//       C                 25.1%          26.0%
//       B                 10.0%          19.0%
//       A                  4.5%          12.0%
//       S                  0.5%           2.5%
//       L                  0.05%          0.5%
//
//   거기에 열 장 중 A 이상이 하나도 없으면 마지막 한 장을 A 이상으로
//   다시 뽑는다. 그래서 열 장을 까면 A 이상이 적어도 하나는 나온다.
//
// ■ 보여 주는 것
//
//   열 장을 글로만 알려 주면 깐 맛이 없다. 그래서 테두리를 **그려서**
//   한 장씩 차례로 뒤집는다. 테두리 규칙은 frames.js 가 '.fr-<id>.fr-wrap'
//   로 깔아 두었으므로, 같은 class 를 주면 그대로 입는다.
//
// ■ 어디서 까나
//
//   유쾌 판매소의 「📕 테두리 견본첩」 칸 아래에 단추가 붙는다.
//   열 장 넘게 가지고 있을 때만 눌린다. 콘솔로는 frOpen10().
//
// ■ 확률을 바꾸려면
//   아래 BOOST 와 FLOOR 를 고치면 된다.

const FRAME10_BOOST = { D: 40, C: 26, B: 19, A: 12, S: 2.5, L: 0.5 };
const FRAME10_FLOOR = 'A';        // 열 장에 한 번은 이 등급 이상
const FRAME10_N     = 10;

(function frame10() {

const BOOK = '테두리 견본첩';
const ORDER = ['D', 'C', 'B', 'A', 'S', 'L'];

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function frames() { return (typeof FRAMES !== 'undefined' && Array.isArray(FRAMES)) ? FRAMES : []; }
function refund(g) { return (typeof FRAME_REFUND !== 'undefined' ? FRAME_REFUND[g] : 0) || 0; }
function colorOf(g) { return (typeof FRAME_COLOR !== 'undefined' ? FRAME_COLOR[g] : '') || '#888'; }
function books() {
    const u = me();
    return u ? (u.inventory || []).filter(function (x) { return x === BOOK; }).length : 0;
}
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

// ==========================================
// 뽑기 — 등급 몫을 먼저 정하고 그 안에서 고르게 나눈다
// ==========================================
//
// frames.js 의 frDraw 와 같은 셈법이다. 등급 전체 몫을 그 등급의 종 수로
// 나눈다. 테두리를 나중에 더 넣어도 그 등급 전체 몫이 불어나지 않는다.
function pick(table, minGrade) {
    const list = frames().filter(function (f) {
        if (!f || !table[f.g]) return false;
        if (minGrade && ORDER.indexOf(f.g) < ORDER.indexOf(minGrade)) return false;
        return true;
    });
    if (!list.length) return null;

    const cnt = {};
    list.forEach(function (f) { cnt[f.g] = (cnt[f.g] || 0) + 1; });

    let total = 0;
    const w = list.map(function (f) { const v = table[f.g] / cnt[f.g]; total += v; return v; });
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
}

function drawTen() {
    const out = [];
    for (let i = 0; i < FRAME10_N; i++) {
        const f = pick(FRAME10_BOOST, null);
        if (f) out.push(f);
    }
    // 바닥 보장 — A 이상이 하나도 없으면 마지막 한 장을 다시 뽑는다
    const hi = out.some(function (f) { return ORDER.indexOf(f.g) >= ORDER.indexOf(FRAME10_FLOOR); });
    if (!hi && out.length) {
        const up = pick(FRAME10_BOOST, FRAME10_FLOOR);
        if (up) out[out.length - 1] = up;
    }
    return out;
}

// ==========================================
// 깐다
// ==========================================
window.frOpen10 = function () {
    const u = me();
    if (!u) return;
    if (typeof frBag !== 'function' || typeof frOwned !== 'function') {
        showCustomAlert('테두리 자료가 아직 올라오지 않았습니다.'); return;
    }
    if (typeof isQuarantined === 'function' && isQuarantined(u)) {
        showCustomAlert('격리 중에는 열 수 없습니다.'); return;
    }
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const have = books();
    if (have < FRAME10_N) {
        showCustomAlert('견본첩이 ' + FRAME10_N + '장 있어야 합니다.\n\n지금 ' + have + '장 가지고 있습니다.');
        return;
    }

    const got = drawTen();
    if (!got.length) { showCustomAlert('꺼낼 것이 없습니다.'); return; }

    // 먼저 소모한다 — 그리는 도중에 끊겨도 겹쳐 까지지 않게
    for (let i = 0; i < FRAME10_N; i++) {
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, BOOK, 1);
    }

    const bag = frBag();
    let back = 0, fresh = 0;
    const rows = got.map(function (f) {
        const dup = frOwned(f.id);
        if (dup) {
            const b = refund(f.g);
            back += b;
            bag.owned[f.id] = (bag.owned[f.id] || 0) + 1;
            return { f: f, dup: true, back: b };
        }
        bag.owned[f.id] = 1;
        fresh++;
        return { f: f, dup: false, back: 0 };
    });

    if (back) u.points = (Number(u.points) || 0) + back;

    const tally = {};
    got.forEach(function (f) { tally[f.g] = (tally[f.g] || 0) + 1; });
    const line = ORDER.filter(function (g) { return tally[g]; })
        .map(function (g) { return g + ' ' + tally[g]; }).reverse().join(' · ');
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[견본첩 10장] ' + line + ' · 새것 ' + fresh + '종'
            + (back ? ' · 중복 +' + back.toLocaleString() + ' P' : ''));
    }
    if (typeof saveSelfFull === 'function') saveSelfFull();
    if (typeof updateUI === 'function') updateUI();
    if (back && typeof showPointGainEffect === 'function') { try { showPointGainEffect(back); } catch (e) { } }

    show(rows, fresh, back, line);
};

// ==========================================
// 보여 준다 — 한 장씩 뒤집는다
// ==========================================
function show(rows, fresh, back, line) {
    const cards = rows.map(function (r, i) {
        const f = r.f, c = colorOf(f.g);
        return '<div class="f10-cell" data-i="' + i + '" style="opacity:0; transform:scale(0.82);'
            + ' transition:opacity 0.28s ease, transform 0.28s cubic-bezier(.2,1.5,.4,1);">'
            + '<div class="fr-wrap fr-' + f.id + '" style="height:46px; border-radius:7px;'
            + ' display:flex; align-items:center; justify-content:center;'
            + ' background:#0d0d0d; overflow:hidden;">'
            + '<span style="font-size:10px; font-weight:bold; color:' + c + ';'
            + ' text-shadow:0 1px 3px #000;">' + esc(f.g) + '</span></div>'
            + '<div style="font-size:9px; color:#bbb; text-align:center; margin-top:3px;'
            + ' white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + esc(f.n) + '</div>'
            + '<div style="font-size:8px; text-align:center; color:' + (r.dup ? '#777' : '#4CAF50') + ';">'
            + (r.dup ? '+' + r.back + ' P' : '새것') + '</div>'
            + '</div>';
    }).join('');

    const html =
        '<div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">'
        + '열 장을 한 번에 열었습니다.<br>'
        + '<span style="color:#c9a8ff;">' + esc(line) + '</span>'
        + ' <span style="color:#888;">· 새것 ' + fresh + '종'
        + (back ? ' · 중복 ' + back.toLocaleString() + ' P 반환' : '') + '</span></div>'
        + '<div id="f10-grid" style="display:grid; grid-template-columns:repeat(5,1fr); gap:7px;">'
        + cards + '</div>'
        + '<div style="font-size:9px; color:#666; margin-top:11px; line-height:1.6;">'
        + '열 장을 한 번에 열면 높은 등급이 나올 몫이 커지고,<br>'
        + 'A 이상이 적어도 한 장은 들어갑니다.</div>';

    if (typeof openGearModal === 'function') openGearModal('📕 견본첩 ' + FRAME10_N + '장', html);
    else { showCustomAlert(line); return; }

    // 한 장씩 뒤집는다
    const cells = document.querySelectorAll('#f10-grid .f10-cell');
    cells.forEach(function (el, i) {
        setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'scale(1)'; }, 90 + i * 110);
    });
}

// ==========================================
// 유쾌 판매소에 단추를 붙인다
// ==========================================
(function pin() {
    const ID = 'f10-btn-box';
    function stick() {
        const box = document.getElementById('regular-shop-items-container');
        if (!box) return;
        const n = books();
        const old = document.getElementById(ID);
        const enough = n >= FRAME10_N;
        const html =
            '<div id="' + ID + '" style="background:linear-gradient(145deg,#1d1730,#120e1f);'
            + ' border:1px solid ' + (enough ? '#c9a8ff' : '#3a3050') + '; border-radius:7px;'
            + ' padding:10px 12px; margin:-6px 0 12px 0; display:flex; align-items:center;'
            + ' justify-content:space-between; gap:10px;">'
            + '<div style="font-size:10px; color:#aaa; line-height:1.6;">'
            + '가진 견본첩 <b style="color:' + (enough ? '#4CAF50' : '#f44336') + ';">' + n + '</b>장'
            + '<br><span style="color:#777;">열 장을 한 번에 열면 높은 등급이 잘 나옵니다</span></div>'
            + '<button class="game-btn" style="margin:0; padding:9px 13px; font-size:12px; flex-shrink:0;"'
            + ' onclick="frOpen10()"' + (enough ? '' : ' disabled') + '>'
            + (enough ? '10장 열기' : '10장 필요') + '</button></div>';

        if (old) { if (old.getAttribute('data-n') !== String(n)) old.outerHTML = html; }
        else box.insertAdjacentHTML('afterbegin', html);
        const now = document.getElementById(ID);
        if (now) now.setAttribute('data-n', String(n));
    }

    const iv = setInterval(function () {
        if (typeof renderRegularShop !== 'function') return;
        if (renderRegularShop._f10) { clearInterval(iv); return; }
        const _r = renderRegularShop;
        const wrapped = function () {
            const out = _r.apply(this, arguments);
            try { stick(); } catch (e) { }
            return out;
        };
        wrapped._f10 = true;
        renderRegularShop = wrapped;
        clearInterval(iv);
        console.log('[테두리] 10장 열기 연결');
    }, 400);

    // 다른 파일이 상점을 다시 그려도 따라붙는다
    setInterval(function () { try { if (me()) stick(); } catch (e) { } }, 1500);
})();

// ==========================================
// 확인
// ==========================================
window.frame10Odds = function (n) {
    n = n || 20000;
    const base = (typeof FRAME_WEIGHT !== 'undefined') ? FRAME_WEIGHT : null;
    const cnt = {}, cnt2 = {}, ten = {};
    for (let i = 0; i < n; i++) {
        const a = pick(FRAME10_BOOST, null); if (a) cnt[a.g] = (cnt[a.g] || 0) + 1;
        if (base) { const b = pick(base, null); if (b) cnt2[b.g] = (cnt2[b.g] || 0) + 1; }
    }
    // 열 장 묶음을 통째로 — 바닥 보장이 걸린 뒤의 실제 분포
    const runs = Math.max(200, Math.round(n / 10));
    let noHi = 0;
    for (let i = 0; i < runs; i++) {
        const got = drawTen();
        got.forEach(function (f) { ten[f.g] = (ten[f.g] || 0) + 1; });
        if (!got.some(function (f) { return ORDER.indexOf(f.g) >= ORDER.indexOf(FRAME10_FLOOR); })) noHi++;
    }
    console.log('%c===== 테두리 등급 확률 =====', 'color:#c9a8ff; font-size:13px');
    const have = {};
    frames().forEach(function (f) { have[f.g] = (have[f.g] || 0) + 1; });
    console.table(ORDER.map(function (g) {
        return { 등급: g, 종수: have[g] || 0,
                 '한 장씩': base ? ((cnt2[g] || 0) / n * 100).toFixed(2) + '%' : '-',
                 '열 장씩(보장 전)': ((cnt[g] || 0) / n * 100).toFixed(2) + '%',
                 '열 장씩(실제)': ((ten[g] || 0) / (runs * FRAME10_N) * 100).toFixed(2) + '%' };
    }));
    console.log('  열 장을 ' + runs + '번 깠을 때 ' + FRAME10_FLOOR + ' 이상이 하나도 없던 판: ' + noHi + '번');
    console.log('  가진 견본첩 ' + books() + '장 · 바닥 보장 ' + FRAME10_FLOOR + ' 이상');
    return { noHi: noHi, runs: runs };
};

console.log('[테두리] frOpen10() · frame10Odds()');

})();
