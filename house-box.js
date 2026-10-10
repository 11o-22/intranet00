// ==========================================
// ★ 사택 보관함 — 종류별로 나누고, 여러 개를 한 번에
// bundles.json 마지막 묶음, storage-dup.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 달라지나
//
//   1. 보관 중인 것과 넣을 것을 **종류별로** 묶어 보여 준다.
//      소지품에서 쓰는 분류(invcat.js 의 INV_CATS · invCatOf)를 그대로
//      쓰므로, 소지품에서 보던 그 칸 이름이 여기서도 똑같이 나온다.
//      칸 이름을 누르면 접힌다.
//
//   2. 같은 물건은 한 줄로 묶고 개수를 적는다. 스무 개를 넣어 두면
//      스무 줄이 아니라 한 줄에 「x20」 이다.
//
//   3. 넣을 때 **개수를 적어 한 번에** 넣는다. 「전부」도 있다.
//
// ■ 넣기를 다시 쓴 까닭
//
//   storage-dup.js 가 세워 둔 넣기는 한 개짜리다. 같은 이름으로 잠금을
//   걸어 두므로 반복해 부를 수가 없다. 그래서 여러 개를 **한 트랜잭션에**
//   밀어 넣는 것으로 새로 쓴다. 안전장치는 그대로 가져온다 —
//
//       연결이 끊겼으면 아예 안 누르게 한다
//       먼저 소지품에서 빼서 목록에서 지운다 (다시 누를 일이 없게)
//       서버가 받기 전에는 내 화면도 안 늘어난다 (applyLocally false)
//       못 들어가면 뺐던 만큼 도로 넣는다
//       자리가 모자라면 들어갈 만큼만 넣고 몇 개가 남았는지 알린다
//
// ■ 콘솔
//   houseBoxState()   지금 보관함 상태 · 종류별 수

(function houseBox() {

const SLOW = '연결이 고르지 않습니다.\n\n잠시 뒤에 다시 해 주십시오.';
// 끊겼다고 막는 것은 **한 번이라도 붙은 적이 있을 때만**.
//   .info/connected 를 못 읽는 자리에서는 늘 false 로 보여 아무것도 못 넣게 된다.
let online = true, sawOnline = false;
let busy = false;
const fold = {};          // 접힌 칸

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function cats() {
    return (typeof INV_CATS !== 'undefined' && INV_CATS.length)
        ? INV_CATS
        : [{ id: 'etc', name: '전체', icon: '📦', color: '#888' }];
}
function catOf(n) {
    try { if (typeof invCatOf === 'function') return invCatOf(n); } catch (e) { }
    return 'etc';
}

(function watchNet() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        database.ref('.info/connected').on('value', function (s) {
            online = (s.val() === true);
            if (online) sawOnline = true;
        });
    }, 500);
})();

// ==========================================
// 여러 개를 한 번에 넣는다
// ==========================================
window.putManyToStorage = function (itemName, qty) {
    if (!currentUser || typeof database === 'undefined' || !database) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);

    const inv = currentUser.inventory || [];
    const have = inv.filter(function (x) { return x === itemName; }).length;
    if (have <= 0) { alert_('해당 물품이 없습니다.'); return; }
    if (have < qty) qty = have;

    if (busy) { alert_('넣는 중입니다.\n\n잠시만 기다려 주십시오.'); return; }
    if (sawOnline && !online) { alert_(SLOW); return; }
    if (typeof buyGuard === 'function' && !buyGuard()) return;

    const max = (typeof houseStorageMax === 'function') ? houseStorageMax(currentUser) : 999;
    const ownerCode = houseStorageRef(currentUser);

    // 먼저 뺀다 — 목록에서 사라지니 다시 누를 일이 없다
    busy = true;
    for (let i = 0; i < qty; i++) {
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
    }
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    redraw();

    let done = false;
    let put = 0;                      // 실제로 들어간 수
    const giveBack = function (n, msg) {
        if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
        for (let i = 0; i < n; i++) currentUser.inventory.push(itemName);
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        redraw();
        if (msg) alert_(msg);
    };

    database.ref('users/' + ownerCode + '/house/storage').transaction(function (arr) {
        arr = arr ? (Array.isArray(arr) ? arr : Object.keys(arr).map(function (k) { return arr[k]; })) : [];
        const room = Math.max(0, max - arr.length);
        put = Math.min(qty, room);
        if (put <= 0) return;                        // 가득 찼다 — 그만둔다
        for (let i = 0; i < put; i++) {
            arr.push({ name: itemName, by: currentUser.name, byCode: currentUser.code, at: Date.now() + i });
        }
        return arr;
    }, null, false)                                   // 서버가 받기 전에는 내 화면도 안 늘어난다
    .then(function (res) { finish(null, !!(res && res.committed), res && res.snapshot); })
    .catch(function (e) { finish(e, false, null); });

    function finish(err, committed, snap) {
        if (done) return;
        done = true; busy = false;
        if (err) { giveBack(qty, '넣지 못했습니다.\n\n' + (err.message || '연결이 끊겼습니다.')); return; }
        if (!committed) { giveBack(qty, '보관함이 가득 찼습니다.'); return; }

        const owner = (db.users || {})[ownerCode];
        if (owner && typeof getHouse === 'function') getHouse(owner).storage = (snap && snap.val()) || [];
        try { database.ref('users/' + ownerCode + '/_adminStamp').set(Date.now()); } catch (e) { }

        const left = qty - put;
        if (left > 0) giveBack(left, null);          // 자리가 모자라 남은 것은 되돌린다

        try {
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(currentUser, "[사택] '" + itemName + "' " + put + '개를 보관함에 넣었습니다.');
            }
            if (typeof saveFields === 'function') saveFields({ history: 1 });
        } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        redraw();
        if (left > 0) alert_('자리가 모자라 ' + put + '개만 넣었습니다.\n\n' + left + '개는 그대로 있습니다.');
    }

    setTimeout(function () {
        if (done) return;
        busy = false;
        alert_('아직 답이 없습니다.\n\n연결이 돌아오면 저절로 들어갑니다.\n다시 누르지 마십시오.');
    }, 8000);
};

// 한 개짜리는 여기로 모은다 (옛 자리에서 부르는 곳이 있다)
(function one() {
    const iv = setInterval(function () {
        if (typeof putToStorage !== 'function') return;
        if (putToStorage._many) { clearInterval(iv); return; }
        putToStorage = function (n) { return window.putManyToStorage(n, 1); };
        putToStorage._many = true;
        putToStorage._noDup = true;          // storage-dup.js 가 또 바꾸지 않게
        clearInterval(iv);
        console.log('[보관함] 넣기를 여러 개짜리로 모았습니다');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

window.houseBoxFold = function (id) {
    fold[id] = !fold[id];
    redraw();
};
function redraw() {
    // renderHouseStorage 는 mobile-scroll.js 가 2.5초에 한 번으로 묶어 두었다.
    // 넣은 직후에는 바로 보여야 하므로 그 한 번만 묶음을 건너뛴다.
    window.renderNow = 1;
    try { if (typeof renderHouseStorage === 'function') renderHouseStorage(); } catch (e) { }
    finally { window.renderNow = 0; }
}

// ==========================================
// 화면 — 종류별로 나눠 그린다
// ==========================================
function group(names) {
    const by = {};
    names.forEach(function (n) {
        const c = catOf(n);
        (by[c] = by[c] || []).push(n);
    });
    return by;
}

function head(c, n, extra) {
    return '<div onclick="houseBoxFold(\'' + c.id + '\')" style="display:flex; align-items:center;'
        + ' gap:6px; cursor:pointer; margin:10px 0 5px 0; padding-bottom:3px;'
        + ' border-bottom:1px solid rgba(255,255,255,0.08);">'
        + '<span style="font-size:11px;">' + c.icon + '</span>'
        + '<span style="font-size:10px; font-weight:bold; color:' + c.color + ';">' + c.name + '</span>'
        + '<span style="font-size:9px; color:#777;">' + n + '종' + (extra || '') + '</span>'
        + '<span style="margin-left:auto; font-size:9px; color:#666;">' + (fold[c.id] ? '▸' : '▾') + '</span>'
        + '</div>';
}

function install() {
    if (typeof renderHouseStorage !== 'function') return false;
    if (renderHouseStorage._box) return true;

    renderHouseStorage = function () {
        const box = document.getElementById('house-storage-body');
        if (!box || !currentUser) return;
        if (typeof getSharedStorage !== 'function') return;

        const storage = getSharedStorage() || [];
        const r = (typeof getRoomie === 'function') ? getRoomie(currentUser) : null;
        const max = (typeof houseStorageMax === 'function') ? houseStorageMax(currentUser) : 999;

        // --- 보관 중 : 같은 이름끼리 묶고, 종류로 나눈다 ---
        const kept = {};                 // 이름 → { n, first, by }
        storage.forEach(function (s, i) {
            if (!s || !s.name) return;
            const k = kept[s.name] || (kept[s.name] = { n: 0, first: i, by: s.by, at: s.at });
            k.n++;
            if (i < k.first) k.first = i;
        });
        const keptNames = Object.keys(kept);
        const keptBy = group(keptNames);

        let keptHtml = '';
        if (!keptNames.length) {
            keptHtml = '<div style="font-size:11px; color:#666; padding:8px 0;">비어 있습니다.</div>';
        } else {
            cats().forEach(function (c) {
                const ns = (keptBy[c.id] || []).sort();
                if (!ns.length) return;
                const total = ns.reduce(function (a, n) { return a + kept[n].n; }, 0);
                keptHtml += head(c, ns.length, ' · ' + total + '개');
                if (fold[c.id]) return;
                keptHtml += ns.map(function (n) {
                    const k = kept[n];
                    return '<div style="display:flex; justify-content:space-between; align-items:center;'
                        + ' gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04);">'
                        + '<div style="flex:1; min-width:0;">'
                        + '<span style="font-size:12px; color:#ddd;">' + esc(n) + '</span>'
                        + (k.n > 1 ? ' <span style="color:#ff9800; font-size:11px;">x' + k.n + '</span>' : '')
                        + '<div style="font-size:9px; color:#666;">' + esc(k.by || '') + ' 보관'
                        + (k.at ? ' · ' + new Date(k.at).toLocaleDateString() : '') + '</div></div>'
                        + '<button class="inv-btn inv-btn-use" style="flex-shrink:0;"'
                        + ' onclick="takeFromStorage(' + k.first + ')">꺼내기</button></div>';
                }).join('');
            });
        }

        // --- 넣기 : 소지품을 종류로 나누고, 개수를 적게 한다 ---
        const cnt = {};
        (currentUser.inventory || []).forEach(function (n) { cnt[n] = (cnt[n] || 0) + 1; });
        const mine = Object.keys(cnt);
        const mineBy = group(mine);

        let putHtml = '';
        if (!mine.length) {
            putHtml = '<div style="font-size:11px; color:#666;">넣을 물건이 없습니다.</div>';
        } else {
            cats().forEach(function (c) {
                const ns = (mineBy[c.id] || []).sort();
                if (!ns.length) return;
                putHtml += head(c, ns.length);
                if (fold[c.id]) return;
                putHtml += ns.map(function (n) {
                    const q = cnt[n];
                    const nm = esc(n).replace(/'/g, '&#39;');
                    const id = 'hb-q-' + encodeURIComponent(n).replace(/[^a-zA-Z0-9]/g, '');
                    return '<div style="display:flex; align-items:center; gap:5px; padding:5px 0;">'
                        + '<span style="font-size:11px; color:#ddd; flex:1; min-width:0;">' + esc(n)
                        + ' <span style="color:#ff9800;">x' + q + '</span></span>'
                        + (q > 1
                            ? '<input type="number" id="' + id + '" value="1" min="1" max="' + q + '"'
                              + ' style="flex:0 0 46px; min-width:0; padding:4px; font-size:11px;'
                              + ' text-align:center;">'
                            : '')
                        + '<button class="inv-btn inv-btn-target" style="flex-shrink:0;"'
                        + ' onclick="houseBoxPut(\'' + nm + '\', \'' + id + '\')">넣기</button>'
                        + (q > 1
                            ? '<button class="inv-btn" style="flex-shrink:0; background:rgba(255,255,255,0.05);'
                              + ' border:1px solid #555; color:#bbb;"'
                              + ' onclick="putManyToStorage(\'' + nm + '\', ' + q + ')">전부</button>'
                            : '')
                        + '</div>';
                }).join('');
            });
        }

        box.innerHTML =
            '<div class="panel-title">[보관함]</div>'
            + '<div style="font-size:11px; color:#888; line-height:1.7; margin-bottom:12px;">'
            + (r ? esc(r.name) + ' 사원과 함께 쓰는 공간입니다. 서로 꺼낼 수 있습니다.'
                 : '혼자 쓰는 보관함입니다.')
            + '<br><span style="color:#4CAF50;">여기 둔 물건은 어둠에서 잃지 않습니다.</span></div>'

            + '<div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border);'
            + ' border-radius:6px; padding:12px; margin-bottom:14px;">'
            + '<div style="font-size:10px; color:#d4af37; font-weight:bold;">보관 중 ('
            + storage.length + ' / ' + max + ')</div>'
            + keptHtml + '</div>'

            + '<div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border);'
            + ' border-radius:6px; padding:12px;">'
            + '<div style="font-size:10px; color:#888; font-weight:bold;">내 소지품에서 넣기</div>'
            + putHtml + '</div>';
    };
    renderHouseStorage._box = true;
    console.log('[보관함] 종류별로 나눠 그립니다 · 개수를 적어 한 번에 넣습니다');
    return true;
}

window.houseBoxPut = function (name, qtyId) {
    const el = document.getElementById(qtyId);
    const q = el ? Math.max(1, parseInt(el.value, 10) || 1) : 1;
    window.putManyToStorage(name, q);
};

const iv = setInterval(function () { if (install()) clearInterval(iv); }, 400);
setTimeout(function () { clearInterval(iv); }, 30000);

// ==========================================
// 확인
// ==========================================
window.houseBoxState = function () {
    if (typeof getSharedStorage !== 'function') { console.log('사택을 먼저 열어 주십시오.'); return; }
    const st = getSharedStorage() || [];
    const max = (typeof houseStorageMax === 'function') ? houseStorageMax(currentUser) : '?';
    console.log('%c===== 사택 보관함 =====', 'color:#4fc3f7; font-size:13px');
    console.log('  보관 중 :', st.length + ' / ' + max);
    const by = {};
    st.forEach(function (s) { if (s && s.name) { const c = catOf(s.name); by[c] = (by[c] || 0) + 1; } });
    const rows = cats().filter(function (c) { return by[c.id]; })
        .map(function (c) { return { 칸: c.icon + ' ' + c.name, 개수: by[c.id] }; });
    if (rows.length) console.table(rows); else console.log('  비어 있습니다.');
    console.log('  넣기 :', (typeof putToStorage === 'function' && putToStorage._many) ? '여러 개짜리 O' : '✗');
    console.log('  그리기:', (typeof renderHouseStorage === 'function' && renderHouseStorage._box) ? '종류별 O' : '✗');
};

console.log('[보관함] houseBoxState()');

})();
