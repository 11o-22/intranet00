// ==========================================
// ★ 펫 — 망상 홈쇼핑 (환몽알 · 돌봄 물품 마흔 가지)
// bundles.json 마지막 묶음, pet-data.js 보다 뒤
// ==========================================
//
// ■ 무엇을 파나
//
//   환몽알 500,000 P
//     알마다 주의 문구가 하나 적혀 있다. 다섯 가지 가운데 하나다.
//     그 문구를 어기는 물품을 대면 알이 그 자리에서 상한다.
//
//     하루에 하나. 그리고 들고 있는 알을 끝내야 다음 알을 살 수 있다.
//     (깨어나거나, 상한 것을 버리거나)
//
//   돌봄 물품 40종
//     💧 수분 · 🔥 열기 · ❄ 냉기 · 🔔 소리 · 🌸 향 여섯 가지씩, 아무 표식도
//     없는 것 열 가지. 사택에서 알에 대어 준다.
//
//     소지품이 아니라 **돌봄 주머니**(u.petBag)에 들어간다. 어둠에 들고
//     가지지도, 팔리지도, 남에게 넘어가지도 않는다.
//
// ■ 콘솔
//   dreamShop()   지금 살 수 있나
//   petGiveBag('이슬 적신 솜', 3)   상담사 — 돌봄 물품 지급

(function petShop() {

const BODY = 'dream-body';
let openTag = 'wet';            // 지금 펼친 칸
const QMAX = 10;                // 한 번에 살 수 있는 수

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function log_(txt) {
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), txt); } catch (e) { }
}
function quar() {
    try { return (typeof isQuarantined === 'function') && isQuarantined(u_()); } catch (e) { return false; }
}
function ui() {
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
}

// ==========================================
// 알을 살 수 있나
// ==========================================
//
//   돌려주는 값 — { ok:true } 또는 { ok:false, why:'…' }
function canBuyEgg() {
    const u = u_();
    if (!u) return { ok: false, why: '로그인 뒤에 살 수 있습니다.' };
    if (quar()) return { ok: false, why: '격리 중에는 살 수 없습니다.' };
    if (u.petEgg && u.petEgg.warn) {
        return { ok: false, why: u.petEgg.ruin
            ? '품에 상한 알이 있습니다.\n사택에서 치우고 나서 다시 오십시오.'
            : '품에 알이 하나 있습니다.\n그 알이 깨어난 뒤에 다시 오십시오.' };
    }
    if (u.petEggAt === P().today())
        return { ok: false, why: '알은 하루에 하나입니다.\n자정이 지나면 다시 가져가실 수 있습니다.' };
    if ((Number(u.points) || 0) < P().EGG_PRICE)
        return { ok: false, why: '포인트가 모자랍니다.\n\n' + P().EGG_NAME + ' '
            + P().EGG_PRICE.toLocaleString() + ' P' };
    return { ok: true };
}

window.dreamBuyEgg = function () {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const r = canBuyEgg();
    if (!r.ok) { alert_(r.why); return; }
    const u = u_();

    u.points = (Number(u.points) || 0) - P().EGG_PRICE;
    u.petEgg = P().make();
    u.petEggAt = P().today();

    log_('[망상 홈쇼핑] ' + P().EGG_NAME + ' 구입 (-' + P().EGG_PRICE.toLocaleString() + ' P)');
    P().save({ points: 1, history: 1 });
    P().eggSave();
    ui();
    render();

    alert_(P().EGG_NAME + '을 받았습니다.\n\n'
        + '알에 적힌 주의 문구\n「' + P().WARN[u.petEgg.warn].n + '」\n\n'
        + P().WARN[u.petEgg.warn].hint + '\n\n'
        + '사택에서 돌봐 주십시오.');
};

// ==========================================
// 돌봄 물품
// ==========================================
function readQty(qid) {
    const el = document.getElementById(qid);
    let q = el ? parseInt(el.value, 10) : 1;
    if (!isFinite(q) || q < 1) q = 1;
    if (q > QMAX) q = QMAX;
    return q;
}

window.dreamQty = function (qid, name) {
    const el = document.getElementById(qid);
    if (!el) return;
    let q = parseInt(el.value, 10);
    if (el.value !== '' && (!isFinite(q) || q < 1)) { el.value = 1; q = 1; }
    if (q > QMAX) { el.value = QMAX; q = QMAX; }
    const b = document.getElementById(qid + '-b');
    const pr = (P().CARE_BY[name] || {}).price || 0;
    if (b) b.innerText = (pr * (q || 1)).toLocaleString() + ' P';
};

window.dreamBuyCare = function (name, qid) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const u = u_();
    const it = P().CARE_BY[name];
    if (!u || !it) return;
    if (quar()) { alert_('격리 중에는 살 수 없습니다.'); return; }

    const qty = readQty(qid);
    const cost = it.price * qty;
    if ((Number(u.points) || 0) < cost) {
        const can = Math.floor((Number(u.points) || 0) / it.price);
        alert_('포인트가 모자랍니다.\n\n' + name + ' ' + qty + '개 = '
            + cost.toLocaleString() + ' P\n지금 가진 것으로는 ' + can + '개까지 살 수 있습니다.');
        return;
    }

    u.points = (Number(u.points) || 0) - cost;
    P().bagAdd(name, qty);
    log_('[망상 홈쇼핑] ' + name + ' ' + qty + '개 구입 (-' + cost.toLocaleString() + ' P)');
    P().save({ points: 1, history: 1 });
    ui();
    render();
};

window.dreamFold = function (tag) {
    openTag = (openTag === tag) ? null : tag;   // '' 는 「무난」 칸이라 못 쓴다
    render();
};

// ==========================================
// 그리기
// ==========================================
function eggBox() {
    const u = u_();
    const r = canBuyEgg();
    const mine = u && u.petEgg && u.petEgg.warn ? u.petEgg : null;

    const warns = P().WARN_KEYS.map(function (k, i) {
        return '<div style="font-size:10px; color:#8d8578; padding:2px 0;">'
            + '<span style="color:#6f685e;">' + (i + 1) + '.</span> ' + esc(P().WARN[k].n) + '</div>';
    }).join('');

    return '<div style="display:flex; gap:12px; align-items:flex-start;'
        + ' background:rgba(60,44,22,0.14); border:1px solid #4a3a26; border-radius:7px;'
        + ' padding:12px; margin-bottom:16px;">'
        + '<div style="flex:0 0 70px; text-align:center;">'
        + '<img src="pet/egg0.webp" alt="" style="width:62px; image-rendering:pixelated;">'
        + '</div>'
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:12px; color:#ffcf8f; font-weight:bold;">' + esc(P().EGG_NAME) + '</div>'
        + '<div style="font-size:10px; color:#c9a227; margin:2px 0 7px 0;">'
        + P().EGG_PRICE.toLocaleString() + ' P</div>'
        + '<div style="font-size:10px; color:#8d8578; line-height:1.55; margin-bottom:7px;">'
        + '안에서 무엇이 자라는지는 깨어나 봐야 압니다. 알마다 아래 가운데'
        + ' <b style="color:#b8ac97;">한 줄</b>이 적혀 있고, 그 줄을 어기면 그 자리에서 상합니다.'
        + '</div>'
        + '<div style="border-top:1px solid #2a241c; border-bottom:1px solid #2a241c;'
        + ' padding:5px 0; margin-bottom:9px;">' + warns + '</div>'
        + (mine
            ? '<div style="font-size:10px; color:' + (mine.ruin ? '#e07a5f' : '#9fd8ef') + ';">'
              + (mine.ruin
                 ? '품에 상한 알이 있습니다. 사택에서 치워 주십시오.'
                 : '품에 알이 하나 있습니다 — 「' + esc(P().WARN[mine.warn].n) + '」')
              + '</div>'
            : '')
        + '<button class="game-btn" ' + (r.ok ? '' : 'disabled ')
        + 'onclick="dreamBuyEgg()" style="width:100%; margin:6px 0 0 0; padding:10px; font-size:12px;'
        + (r.ok ? '' : ' opacity:.42;') + '">'
        + (r.ok ? '한 알 가져간다' : '지금은 못 가져갑니다') + '</button>'
        + (r.ok ? '' : '<div style="font-size:9.5px; color:#6f685e; margin-top:5px;">'
            + esc(String(r.why).replace(/\n/g, ' ')) + '</div>')
        + '</div></div>';
}

function careRows(tag) {
    const u = u_();
    return P().CARE.filter(function (x) { return x[1] === tag; }).map(function (x, i) {
        const n = x[0], pr = x[2];
        const have = P().bagHas(n, u);
        const qid = 'dm-' + (tag || 'z') + i;
        return '<div style="display:flex; justify-content:space-between; align-items:center; gap:7px;'
            + ' padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05);">'
            + '<div style="flex:1; min-width:0;">'
            + '<span style="font-size:11px; color:#ddd;">' + esc(n) + '</span>'
            + (have ? '<span style="font-size:10px; color:#ff9800; margin-left:5px;">보유 ' + have + '</span>' : '')
            + '<div style="font-size:9px; color:#666; margin-top:2px;">개당 ' + pr.toLocaleString() + ' P</div>'
            + '</div>'
            + '<input type="number" id="' + qid + '" value="1" min="1" max="' + QMAX + '"'
            + ' oninput="dreamQty(\'' + qid + '\',\'' + esc(n) + '\')"'
            + ' style="flex:0 0 50px; width:50px; font-size:12px; text-align:center; padding:5px 2px;">'
            + '<button class="inv-btn inv-btn-use" id="' + qid + '-b" style="flex:0 0 auto; min-width:66px;"'
            + ' onclick="dreamBuyCare(\'' + esc(n) + '\',\'' + qid + '\')">'
            + pr.toLocaleString() + ' P</button>'
            + '</div>';
    }).join('');
}

function careBox() {
    const u = u_();
    const tags = P().WARN_KEYS.concat(['']);
    const rows = tags.map(function (t) {
        const open = (openTag === t);
        const mine = P().CARE.filter(function (x) { return x[1] === t; })
            .reduce(function (a, x) { return a + P().bagHas(x[0], u); }, 0);
        return '<div style="margin-bottom:6px;">'
            + '<div onclick="dreamFold(\'' + t + '\')" style="display:flex;'
            + ' justify-content:space-between; align-items:center; cursor:pointer;'
            + ' padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);'
            + ' border:1px solid #2f2a22;">'
            + '<span style="font-size:11px; color:#e8d7b4; font-weight:bold;">'
            + esc(P().TAGS[t]) + '</span>'
            + '<span style="font-size:10px; color:#8d8578;">'
            + (mine ? '가진 것 ' + mine + '개 · ' : '') + (open ? '▼' : '▲') + '</span>'
            + '</div>'
            + (open ? '<div style="padding:2px 4px 6px 4px;">' + careRows(t) + '</div>' : '')
            + '</div>';
    }).join('');

    return '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">돌봄 물품</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:10px; line-height:1.55;">'
        + '소지품이 아니라 돌봄 주머니에 들어갑니다. 사택에서 알에 대어 주십시오.'
        + ' 알에 적힌 줄을 어기는 표식을 대면 그 자리에서 상합니다.</div>'
        + rows;
}

function render() {
    const el = document.getElementById(BODY);
    if (!el) return;
    if (!u_()) { el.innerHTML = '<div style="font-size:11px; color:#666; text-align:center;'
        + ' padding:20px 0;">로그인 뒤에 보입니다.</div>'; return; }
    el.innerHTML = eggBox() + careBox();
}

window.renderDream = render;

// 상점 칸을 눌렀을 때 — index.html 쪽에서 불러 주지만, 늦게 붙는 경우를 받친다
setInterval(function () {
    try {
        const el = document.getElementById(BODY);
        if (!el || !u_()) return;
        const panel = document.getElementById('shop-dream');
        if (!panel || !panel.classList.contains('active')) return;
        if (!el.innerHTML) render();
    } catch (e) { }
}, 1500);

// ==========================================
// 상담사 · 확인
// ==========================================
window.petGiveBag = function (name, n) {
    if (!P().CARE_BY[name]) { console.warn('그런 돌봄 물품이 없습니다 —', name); return; }
    const v = P().bagAdd(name, Math.max(1, Number(n) || 1));
    console.log('%c✓ ' + name + ' → ' + v + '개', 'color:#4CAF50');
    render();
};

window.dreamShop = function () {
    const u = u_();
    console.log('%c===== 망상 홈쇼핑 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const r = canBuyEgg();
    console.log('  ' + P().EGG_NAME + ' :', r.ok ? '살 수 있습니다' : ('✗ ' + String(r.why).replace(/\n/g, ' ')));
    console.log('  오늘 산 날짜 :', u.petEggAt || '-', '· 오늘', P().today());
    const bag = P().bag(u);
    const k = Object.keys(bag).filter(function (x) { return bag[x] > 0; });
    console.log('  돌봄 주머니 :', k.length ? k.map(function (x) { return x + '×' + bag[x]; }).join(', ') : '비었음');
};

console.log('[펫] dreamShop() · petGiveBag()');

})();
