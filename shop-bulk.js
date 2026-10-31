// ==========================================
// ★ 일괄 구매 — 유쾌 판매소 · ??? (2026-10-19)
// bundles.json 마지막 묶음, wear-gift.js 뒤
// ==========================================
//
// ■ 무엇이 생기나
//
//   두 가게의 줄마다 「일괄」 단추 — 그 물품을 남은 만큼 한 번에 산다.
//   가게 맨 위에 「전 품목 일괄 구매」 — 진열된 것을 전부 남은 만큼 산다 (한 번 묻는다).
//   포인트가 모자라거나 한도에 닿으면 그 자리에서 멈추고, 무엇을 몇 개 샀는지 한 창에 모아 알린다.
//
// ■ 어떻게 사나
//
//   새로 셈하지 않는다. 줄의 단추가 부르는 그 함수(buyRegularShopItem · buyQShopItem)를
//   같은 값으로 한 개씩 되풀이해 부른다. 그래서 한도(하루 3개 · 진열당 5개 · 스킵권 ·
//   견본첩처럼 따로 세는 것), 할인(감지하는 눈), 격리 중 막기가 낱개로 살 때와 똑같이 걸린다.
//   되풀이하는 동안만
//     · 연달아 누름 자물쇠(buyGuard)를 연다 — 한 번 누른 것이다
//     · 알림창은 띄우지 않고 받아 둔다 — 멈춘 까닭으로 쓴다
//     · 저장 · 다시 그리기는 미뤘다가 끝에 한 번 한다
//   한 개가 들어왔는지는 포인트가 줄었거나 소지품이 늘었는지로 본다. 안 들어왔으면 멈춘다.
//
// ■ 콘솔
//   shopBulkState()

(function shopBulk() {

// ★ ??? 자리에는 이벤트 샵(wonder-shop.js — buyWonderItem)이 대신 열릴 때가 있다 (2026-11-01 사용자 「이벤트샵 전체구매가 막힌다」)
//   예전에는 buyQShopItem 단추만 찾아서, 이벤트 샵이 열려 있으면 「살 수 있는 물품이 없습니다」로 막혔다.
const SHOPS = [
    { box: 'regular-shop-items-container', fn: 'buyRegularShopItem', fns: ['buyRegularShopItem'], name: '유쾌 판매소' },
    { box: 'qshop-body',                   fn: 'buyQShopItem',       fns: ['buyQShopItem', 'buyWonderItem'], name: '???' }
];
function shopName(shop) {
    try { if (shop.box === 'qshop-body' && window.WONDER && WONDER.shopOn && WONDER.shopOn()) return '이벤트 샵'; } catch (e) { }
    return shop.name;
}
const CAP = 30;            // 한 품목을 한 번에 사는 끝 (한도가 없는 상담사도 여기까지)
const CAP_ADMIN = 10;
const stat = { runs: 0, bought: 0 };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }

// 줄의 단추가 부르는 것을 읽는다 — buyQShopItem('이름', 30) · buyRegularShopItem('item_이름', '이름', 42)
function parseCall(btn, fn) {
    const oc = btn && btn.getAttribute('onclick');
    if (!oc || oc.indexOf(fn + '(') < 0) return null;
    const inner = oc.slice(oc.indexOf(fn + '(') + fn.length + 1, oc.lastIndexOf(')'));
    const args = [];
    const re = /'((?:[^'\\]|\\.)*)'|(-?\d+(?:\.\d+)?)/g;
    let m;
    while ((m = re.exec(inner))) args.push(m[1] != null ? m[1].replace(/\\'/g, "'") : Number(m[2]));
    if (!args.length) return null;
    const name = (fn === 'buyRegularShopItem') ? args[1] : args[0];
    return { fn: fn, args: args, name: name };
}
// fn — 함수 이름 하나 또는 여럿(가게 줄마다 다를 수 있다)
function fnOf(b, fn) {
    const oc = (b && b.getAttribute('onclick')) || '';
    const list = Array.isArray(fn) ? fn : [fn];
    for (let i = 0; i < list.length; i++) if (oc.indexOf(list[i] + '(') >= 0) return list[i];
    return null;
}
function mainBtn(row, fn) {
    return Array.prototype.filter.call(row.querySelectorAll('button'), function (b) {
        return !b.classList.contains('shop-bulk-one') && !!fnOf(b, fn);
    })[0] || null;
}
function callOf(row, shop) {
    const b = mainBtn(row, shop.fns);
    const fn = b && fnOf(b, shop.fns);
    return fn ? parseCall(b, fn) : null;
}

// ==========================================
// 사기 — 같은 함수를 되풀이해서
// ==========================================
function withQuiet(run) {
    const keep = {}, msgs = [];
    const swap = function (name, fake) {
        if (typeof window[name] !== 'function') return;
        keep[name] = window[name];
        try { window[name] = fake; } catch (e) { }
    };
    let full = false;
    const fields = {};
    swap('buyGuard', function () { return true; });
    swap('showCustomAlert', function (m) { msgs.push(String(m || '')); });
    swap('showLuxuryAlert', function () { msgs.push('포인트가 모자랍니다.'); });
    swap('saveSelfFull', function () { full = true; return Promise.resolve(); });
    swap('saveFields', function (f) { Object.keys(f || {}).forEach(function (k) { fields[k] = 1; }); return Promise.resolve(); });
    ['updateUI', 'renderQShop', 'renderRegularShop'].forEach(function (n) { swap(n, function () { }); });
    let out;
    try { out = run(msgs); }
    finally {
        Object.keys(keep).forEach(function (n) { try { window[n] = keep[n]; } catch (e) { } });
    }
    // 저장은 끝에 한 번 — 낱개로 살 때 부르던 그 저장을 모아서
    try { if (Object.keys(fields).length && typeof saveFields === 'function') saveFields(fields); } catch (e) { }
    try { if (full && typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    // 다시 그리기 묶음(mobile-scroll.js — 1.5초 · 2.5초)에 걸려 품절 표시가 늦지 않게 바로 그린다
    const rn = window.renderNow;
    window.renderNow = true;
    try { if (typeof renderRegularShop === 'function') renderRegularShop(); } catch (e) { }
    try { if (typeof renderQShop === 'function') renderQShop(); } catch (e) { }
    window.renderNow = rn;
    return out;
}
function buyMany(call, msgs, cap) {
    const u = u_();
    let n = 0, spent = 0, why = '';
    for (let i = 0; i < cap; i++) {
        const p0 = Number(u.points) || 0, i0 = (u.inventory || []).length;
        msgs.length = 0;
        try { window[call.fn].apply(null, call.args); }
        catch (e) { why = '오류 — ' + (e && e.message); break; }
        const p1 = Number(u.points) || 0, i1 = (u.inventory || []).length;
        if (p1 < p0 || i1 > i0) { n++; spent += Math.max(0, p0 - p1); continue; }
        why = msgs[msgs.length - 1] || '';
        break;
    }
    return { n: n, spent: spent, why: why };
}
function capFor() { const u = u_(); return (u && u.code === 'kario0987') ? CAP_ADMIN : CAP; }

function report(title, rows, stopWhy) {
    const got = rows.filter(function (r) { return r.n > 0; });
    const total = got.reduce(function (a, r) { return a + r.spent; }, 0);
    stat.runs++; stat.bought += got.reduce(function (a, r) { return a + r.n; }, 0);
    let t = title + '\n\n';
    if (!got.length) t += '산 것이 없습니다.';
    else t += got.map(function (r) { return '· ' + r.name + ' ×' + r.n; }).join('\n') + '\n\n모두 −' + total.toLocaleString('ko-KR') + ' P';
    if (stopWhy) t += '\n\n' + String(stopWhy).replace(/\s+$/, '');
    alert_(t);
}
// 멈춘 까닭을 사람 말로
function whyText(why) {
    if (!why) return '';
    if (/모자/.test(why)) return '포인트가 모자라 멈췄습니다.';
    return '멈춘 까닭 — ' + why.replace(/\n+/g, ' ');
}

// 한 번 누른 것이 두 번 돌지 않게
let busyAt = 0;
function lock() {
    const t = Date.now();
    if (t - busyAt < 900) return false;
    busyAt = t;
    return true;
}

function bulkOne(shop, row) {
    if (!lock()) return;
    const call = callOf(row, shop);
    if (!call) return;
    const r = withQuiet(function (msgs) { return buyMany(call, msgs, capFor()); });
    report(shopName(shop) + ' — 일괄 구매', [{ name: call.name, n: r.n, spent: r.spent }],
        r.n ? (/모자/.test(r.why) ? whyText(r.why) : '') : whyText(r.why));
}
function bulkAll(shop) {
    const box = document.getElementById(shop.box);
    if (!box) return;
    const calls = Array.prototype.map.call(box.querySelectorAll('.shop-item'), function (row) {
        const b = mainBtn(row, shop.fns);
        return (b && !b.disabled) ? callOf(row, shop) : null;
    }).filter(Boolean);
    runCalls(shopName(shop) + ' — 전 품목 일괄 구매', calls);
}
// 물품 목록을 차례로 남은 만큼 산다 — calls: [{ fn, args, name }]
function runCalls(title, calls) {
    if (!lock()) return;
    if (!calls.length) { alert_('살 수 있는 물품이 없습니다.'); return; }
    let stop = '';
    const rows = withQuiet(function (msgs) {
        const out = [];
        for (let i = 0; i < calls.length; i++) {
            const r = buyMany(calls[i], msgs, capFor());
            out.push({ name: calls[i].name, n: r.n, spent: r.spent });
            if (/모자/.test(r.why)) { stop = whyText(r.why); break; }      // 돈이 떨어지면 다음 것도 못 산다
        }
        return out;
    });
    report(title, rows, stop);
}
function ask(title, what, yes) {
    const old = document.getElementById('shop-bulk-ask'); if (old) old.remove();
    const d = document.createElement('div');
    d.id = 'shop-bulk-ask';
    d.style.cssText = 'position:fixed;inset:0;z-index:100050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);padding:20px;';
    d.innerHTML = '<div class="modal-content" style="max-width:330px;width:100%;text-align:center;">'
        + '<div style="font-size:14px;font-weight:bold;margin-bottom:10px;">' + esc(title) + '</div>'
        + '<div style="font-size:12px;color:#aaa;line-height:1.8;margin-bottom:16px;">' + esc(what) + '을 모두 남은 수량만큼 삽니다.<br>포인트가 모자라면 그 자리에서 멈춥니다.</div>'
        + '<div style="display:flex;gap:8px;"><button class="btn-cancel" style="flex:1;" id="sb-no">그만둔다</button>'
        + '<button class="game-btn" style="flex:1;margin:0;padding:11px;" id="sb-yes">산다</button></div></div>';
    document.body.appendChild(d);
    d.querySelector('#sb-no').onclick = function () { d.remove(); };
    d.querySelector('#sb-yes').onclick = function () { d.remove(); yes(); };
}
function askAll(shop) {
    ask(shopName(shop) + ' — 전 품목 일괄 구매', '진열된 물품', function () { bulkAll(shop); });
}
// 다른 가게 파일이 부른다
//   shopBulkAll('qshop-body')                       그 상자의 전 품목 (한 번 묻는다)
//   shopBulkBuy(제목, [{fn, args, name}], 무엇)      그 물품들만 (한 번 묻는다) — 이벤트 샵 테마별 전체 구매
window.shopBulkAll = function (boxId) {
    const sh = SHOPS.filter(function (s) { return s.box === boxId; })[0];
    if (sh) askAll(sh);
};
window.shopBulkBuy = function (title, calls, what) {
    ask(title, what || '이 물품들', function () { runCalls(title, (calls || []).filter(Boolean)); });
};

// ==========================================
// 단추 달기 — 가게가 다시 그려질 때마다
// ==========================================
(function css() {
    const st = document.createElement('style');
    st.textContent = [
        '.shop-bulk-one{flex-shrink:0;margin:0 0 0 6px !important;padding:6px 8px !important;font-size:10px !important;',
        '  min-width:0 !important;width:auto !important;opacity:.92;}',
        '.shop-bulk-all{display:block;width:100%;margin:0 0 12px 0;padding:10px;font-size:12px;}',
        '.shop-item .shop-bulk-wrap{display:flex;align-items:center;flex-shrink:0;}'
    ].join('\n');
    document.head.appendChild(st);
})();
function decorate(shop) {
    const box = document.getElementById(shop.box);
    if (!box) return;
    const rows = box.querySelectorAll('.shop-item');
    if (!rows.length) return;
    // 맨 위 — 전 품목
    if (!box.querySelector('.shop-bulk-all')) {
        const b = document.createElement('button');
        b.className = 'game-btn shop-bulk-all';
        b.textContent = '전 품목 일괄 구매';
        b.onclick = function (e) { e.stopPropagation(); askAll(shop); };
        box.insertBefore(b, rows[0].parentNode === box ? rows[0] : box.firstChild);
    }
    // 줄마다
    Array.prototype.forEach.call(rows, function (row) {
        if (row.querySelector('.shop-bulk-one')) return;
        const mb = mainBtn(row, shop.fns);
        if (!mb || mb.disabled) return;
        const b = document.createElement('button');
        b.className = 'shop-bulk-one';
        b.textContent = '일괄';
        b.title = '남은 만큼 한 번에 산다';
        b.onclick = function (e) { e.stopPropagation(); bulkOne(shop, row); };
        const wrap = document.createElement('div');
        wrap.className = 'shop-bulk-wrap';
        mb.parentNode.insertBefore(wrap, mb);
        wrap.appendChild(mb);           // 값 단추가 줄의 첫 단추로 남게 (다른 파일들이 querySelector('button') 으로 찾는다)
        wrap.appendChild(b);
    });
}
// 가게가 다시 그려지면(innerHTML) 그 자리에서 다시 단다.
//   그리는 함수를 감싸지 않는다 — 그 함수들은 이미 여러 겹(스크롤 보정 · 깜박임 막기 · 묶음)이
//   서로 바깥을 잡으려고 다투는 자리라, 겹을 하나 더 얹지 않고 상자만 지켜본다.
const watched = {};
function watch() {
    SHOPS.forEach(function (sh) {
        if (watched[sh.box]) return;
        const box = document.getElementById(sh.box);
        if (!box || typeof MutationObserver !== 'function') return;
        new MutationObserver(function () { try { if (u_()) decorate(sh); } catch (e) { } })
            .observe(box, { childList: true });
        watched[sh.box] = true;
        try { if (u_()) decorate(sh); } catch (e) { }
    });
}
watch();
setInterval(function () {
    try { watch(); if (u_()) SHOPS.forEach(decorate); } catch (e) { }
}, 1500);

window.shopBulkState = function () {
    console.log('%c===== 일괄 구매 =====', 'color:#ffd08a; font-size:13px');
    console.log('  돌린 횟수 ' + stat.runs + ' · 산 개수 ' + stat.bought + ' · 한 품목 끝 ' + capFor());
};

})();
