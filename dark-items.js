// ==========================================
// ★ 탐사 중 소지품 열기
// index.html 에서 fix1002.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 무엇이 문제였나
//
//   「읽어 준 목소리」는 이렇게 생겼다. (newitems.js:428)
//       if (!darkRun || darkRun.zone !== 'Qtrew-S-003') {
//           showCustomAlert('동화의 뒷면에서만 쓸 수 있습니다.'); return;
//       }
//   탐사 중에, 그것도 S-003 안에서만 쓸 수 있다.
//
//   그런데 탐사가 시작되면 #dark-run-overlay 가 화면을 통째로 덮는다.
//   그 안에 있는 버튼은 ↻(다시 맞춤)와 🔊(소리) 둘뿐이다.
//   소지품을 열 방법이 없다. 즉 이 아이템은 쓸 수가 없었다.
//
//   같은 이유로 「납작한 돌」(c_stone)과 「빵조각」(q_crumb)도 못 썼다.
//
// ■ 어떻게 고치나
//
//   탐사 화면 위쪽에 🎒 버튼을 하나 붙인다.
//   누르면 지금 쓸 수 있는 소모품만 추려 보여 주고, 고르면 바로 쓴다.
//   장비나 물약처럼 탐사와 상관없는 것은 올라오지 않는다.

(function darkItems() {

// 탐사 중에 의미가 있는 것만 추린다
function usableNow(name) {
    const cat = (typeof ITEM_CATALOG !== 'undefined') && ITEM_CATALOG[name];
    if (!cat || cat.usable === false) return false;
    const e = String(cat.effect || '');
    if (!e || e.indexOf('equip') === 0) return false;
    // ??? 상점 소모품과 구역 전용품
    return cat.qShop === true
        || /^q_/.test(e) || /^s3_/.test(e) || /^s003_/.test(e) || /^c_/.test(e);
}

// 구역을 가리는 것들 — 어느 구역에서만 되는지 이름까지 적어 둔다.
// (「이 구역에서는 쓸 수 없습니다」 만 뜨면 어디로 가야 하는지 알 수가 없다)
const ZONE_ONLY = {
    s3_voice: { zone: 'Qtrew-S-003', label: '동화의 뒷면' }
};

// 이 구역에서 쓸 수 있는가
function zoneOk(name) {
    const need = ZONE_ONLY[(ITEM_CATALOG[name] || {}).effect];
    if (!need) return true;
    return !!(darkRun && darkRun.zone === need.zone);
}

function zoneWhy(name) {
    const need = ZONE_ONLY[(ITEM_CATALOG[name] || {}).effect];
    return need ? (need.label + '(' + need.zone + ')에서만 쓸 수 있습니다.') : '이 구역에서는 쓸 수 없습니다.';
}

function listMine() {
    const inv = (currentUser && currentUser.inventory) || [];
    const cnt = {};
    inv.forEach(function (n) { if (usableNow(n)) cnt[n] = (cnt[n] || 0) + 1; });
    return Object.keys(cnt).sort().map(function (n) {
        return { name: n, n: cnt[n], ok: zoneOk(n), why: zoneWhy(n),
                 desc: (ITEM_CATALOG[n] || {}).desc || '' };
    });
}

window.closeDarkItems = function () {
    const el = document.getElementById('dark-item-overlay');
    if (el) el.remove();
};

window.useDarkItem = function (name) {
    closeDarkItems();
    if (typeof useInventoryItem === 'function') useInventoryItem(name);
};

window.openDarkItems = function () {
    if (!darkRun) { showCustomAlert('탐사 중에만 열 수 있습니다.'); return; }
    closeDarkItems();

    const rows = listMine();
    const body = rows.length
        ? rows.map(function (r) {
            const dim = r.ok ? '' : ' opacity:0.78;';
            const safe = r.name.replace(/'/g, "\\'");
            const btn = r.ok
                ? '<button class="game-btn" style="margin:8px 0 0 0; padding:9px; width:100%; font-size:11px;'
                  + ' background:linear-gradient(145deg,#1e5f7f,#0d3a52) !important; border-color:#2f7f9f !important;'
                  + ' color:#dff3ff !important;" onclick="useDarkItem(\'' + safe + '\')">사용하기</button>'
                : '<button class="game-btn" style="margin:8px 0 0 0; padding:9px; width:100%; font-size:11px;'
                  + ' background:#161616 !important; border-color:#333 !important; color:#8a8a8a !important;'
                  + ' cursor:default;" disabled>여기서는 못 씁니다</button>';
            return '<div style="border:1px solid #2a2a2a; border-radius:6px; padding:11px 12px; margin-bottom:7px;'
                + ' background:rgba(0,0,0,0.3);' + dim + '">'
                + '<div style="font-size:12px; font-weight:bold; color:' + (r.ok ? '#4fc3f7' : '#777') + ';">'
                + r.name + (r.n > 1 ? ' <span style="color:#888; font-size:10px;">×' + r.n + '</span>' : '') + '</div>'
                + '<div style="font-size:10px; color:#999; margin-top:4px; line-height:1.6;">' + r.desc + '</div>'
                + (r.ok ? '' : '<div style="font-size:10px; color:#ff8a65; margin-top:4px;">' + r.why + '</div>')
                + btn
                + '</div>';
        }).join('')
        : '<div style="color:#777; font-size:12px; text-align:center; padding:28px 0;">'
          + '지금 쓸 수 있는 소모품이 없습니다.</div>';

    const el = document.createElement('div');
    el.id = 'dark-item-overlay';
    el.style.cssText = 'position:fixed; inset:0; z-index:9999999; background:rgba(0,0,0,0.88);'
        + ' display:flex; align-items:center; justify-content:center; padding:18px;';
    el.innerHTML =
        '<div style="width:100%; max-width:400px; max-height:78vh; overflow-y:auto;'
        + ' background:#0d0d0d; border:1px solid #2f5f7f; border-radius:8px; padding:16px;">'
        + '<div style="font-size:13px; font-weight:bold; color:#4fc3f7; margin-bottom:4px;">소지품</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:13px; line-height:1.6;">'
        + '탐사 중에 쓸 수 있는 것만 보입니다.</div>'
        + body
        + '<button class="game-btn" style="width:100%; margin:10px 0 0 0; padding:11px; font-size:11px;"'
        + ' onclick="closeDarkItems()">닫는다</button>'
        + '</div>';
    document.body.appendChild(el);
};

// ==========================================
// 탐사 화면 위쪽에 버튼 붙이기
// ==========================================
(function mount() {
    setInterval(function () {
        const ov = document.getElementById('dark-run-overlay');
        if (!ov || ov.style.display === 'none') return;
        if (document.getElementById('dark-item-btn')) return;

        const mute = document.getElementById('dark-mute-btn');
        if (!mute) return;

        const b = document.createElement('button');
        b.id = 'dark-item-btn';
        b.style.cssText = 'background:none; border:1px solid #333; color:#888; font-size:12px;'
            + ' padding:4px 8px; border-radius:4px; cursor:pointer;';
        b.innerText = '🎒';
        b.setAttribute('onclick', 'openDarkItems()');
        mute.parentNode.insertBefore(b, mute);
        console.log('[어둠] 소지품 버튼 연결');
    }, 1200);
})();

// ==========================================
// 확인
// ==========================================
window.darkItemState = function () {
    if (!darkRun) { console.log('탐사 중이 아닙니다.'); return; }
    const rows = listMine();
    console.log('%c===== 지금 쓸 수 있는 소모품 =====', 'color:#4fc3f7; font-size:13px');
    if (!rows.length) { console.log('  없습니다.'); return; }
    console.table(rows.map(function (r) {
        return { 이름: r.name, 개수: r.n, '이 구역에서': r.ok ? 'O' : '✗',
                 효과: (ITEM_CATALOG[r.name] || {}).effect };
    }));
};

console.log('[어둠] 탐사 중 소지품 — openDarkItems() · darkItemState()');

})();