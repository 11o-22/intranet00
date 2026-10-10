// ==========================================
// ★ 밀실 거래 — 여러 가지를 한 번에 주고받기
// bundles.json 마지막 묶음, p2p-fix.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 달라지나
//
//   예전 제안서는 한 가지만 담았다. 물건 하나(수량은 여럿) 또는 포인트.
//   이제 「담기」로 바구니에 여러 가지를 쌓아 한 장에 실어 보낸다.
//   건넬 쪽도, 요구할 쪽도 똑같이 된다.
//
//       제물   유리손포 1개 · 사과맛 물약 3개 · 50,000 P
//       대가   작두 1개 · 20,000 P
//
// ■ 옛 제안서·옛 화면과 섞여도 괜찮게
//
//   제안서에 offerList / demandList 를 새로 둔다. [{k,v,q}, …] 꼴이다.
//   그러면서 예전 세 칸(offerType·offerValue·offerQty)도 **첫 줄로**
//   채워 둔다. 아직 새 파일을 안 받은 사람의 화면에도 「무언가 온 것」이
//   보이고, 수락은 p2p-fix.js 가 목록을 읽어 전부 옮긴다.
//
//   거꾸로 옛 제안서에는 목록이 없다. 그때는 세 칸을 읽어 한 줄짜리
//   묶음으로 친다 (p2p-fix.js 의 bundle()).
//
// ■ 하나라도 모자라면
//
//   빼는 걸음에서 하나라도 실패하면 이미 뺀 것을 전부 도로 넣고 그만둔다.
//   건네는 걸음은 다 빼고 난 뒤에만 하므로 실패하지 않는다.
//
// ■ 콘솔
//   p2pBag()        지금 바구니에 담긴 것
//   p2pBagClear()   비우기

(function p2pMulti() {

const BAG = { offer: [], demand: [] };
const MAX = 8;                 // 한쪽에 담을 수 있는 가짓수

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function el(id) { return document.getElementById(id); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }

function descOne(x) {
    return (x.k === 'point')
        ? ((Number(x.v) || 0).toLocaleString() + ' P')
        : (x.v + ' ' + x.q + '개');
}
function descBag(bu) {
    if (!bu || !bu.length) return '(없음)';
    return bu.map(descOne).join(' · ');
}
window.p2pBag = function () {
    console.log('%c===== 밀실 바구니 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  건넬 것 :', descBag(BAG.offer));
    console.log('  요구할 것:', descBag(BAG.demand));
};
window.p2pBagClear = function () { BAG.offer = []; BAG.demand = []; paintBag(); };

// 같은 물건은 한 줄로 합친다. 포인트도 한 줄로.
function add(side, x) {
    const bag = BAG[side];
    if (x.k === 'point') {
        const i = bag.findIndex(function (y) { return y.k === 'point'; });
        if (i >= 0) { bag[i].v = Number(bag[i].v) + Number(x.v); return true; }
    } else {
        const i = bag.findIndex(function (y) { return y.k === 'item' && y.v === x.v; });
        if (i >= 0) { bag[i].q += x.q; return true; }
    }
    if (bag.length >= MAX) { alert_('한 번에 ' + MAX + '가지까지만 담을 수 있습니다.'); return false; }
    bag.push(x);
    return true;
}

// ==========================================
// 바구니 칸 그리기
// ==========================================
function bagHtml(side) {
    const bag = BAG[side];
    if (!bag.length) {
        return '<span style="font-size:10px; color:#777;">담은 것이 없습니다. '
            + '고르고 「담기」를 누르면 여러 가지를 한 번에 보낼 수 있습니다.</span>';
    }
    return bag.map(function (x, i) {
        return '<span style="display:inline-flex; align-items:center; gap:5px; font-size:10px;'
            + ' padding:3px 5px 3px 8px; border-radius:11px; margin:0 4px 4px 0;'
            + ' background:rgba(201,168,255,0.12); border:1px solid #5a4a7a; color:#ddd;">'
            + esc(descOne(x))
            + '<button type="button" data-bag="' + side + '" data-i="' + i + '"'
            + ' style="all:unset; cursor:pointer; color:#ff8a8a; font-size:12px;'
            + ' line-height:1; padding:0 3px;">×</button></span>';
    }).join('');
}

function paintBag() {
    ['offer', 'demand'].forEach(function (side) {
        const box = el('p2p-' + side + '-bag');
        if (!box) return;
        const h = bagHtml(side);
        if (box.innerHTML !== h) box.innerHTML = h;
        box.querySelectorAll('[data-bag]').forEach(function (b) {
            b.onclick = function () {
                BAG[b.getAttribute('data-bag')].splice(Number(b.getAttribute('data-i')), 1);
                paintBag();
            };
        });
    });
}

// 「담기」 단추와 바구니 칸을 화면에 붙인다
function mount() {
    const panel = el('shop-p2p');
    if (!panel) return;

    [['offer', 'p2p-offer-qty', '#c9a8ff'], ['demand', 'p2p-demand-qty', '#ff9800']].forEach(function (t) {
        const side = t[0];
        if (el('p2p-' + side + '-bag')) return;
        const anchor = el('p2p-' + side + '-type');
        if (!anchor) return;
        const row = anchor.parentElement;             // 고르는 줄
        if (!row) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'p2p-' + side + '-add';
        btn.textContent = '담기';
        btn.style.cssText = 'flex:0 0 46px; min-width:0; padding:0 6px; font-size:11px;'
            + ' border-radius:4px; cursor:pointer; background:rgba(255,255,255,0.06);'
            + ' border:1px solid ' + t[2] + '; color:' + t[2] + ';';
        btn.onclick = function () { pick(side); };
        row.appendChild(btn);

        const bag = document.createElement('div');
        bag.id = 'p2p-' + side + '-bag';
        bag.style.cssText = 'margin:-4px 0 10px 0; line-height:1.9;';
        row.insertAdjacentElement('afterend', bag);
    });
    paintBag();
}
window.p2pMount = mount;

// 지금 고른 것을 바구니에 담는다
function pick(side) {
    const type = (el('p2p-' + side + '-type') || {}).value;
    if (type === 'point') {
        const n = parseInt((el('p2p-' + side + '-points') || {}).value, 10);
        if (isNaN(n) || n <= 0) { alert_('포인트를 올바르게 입력해 주십시오.'); return; }
        if (side === 'offer' && n > (Number(currentUser.points) || 0)) {
            if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
            else alert_('포인트가 부족합니다.');
            return;
        }
        if (add(side, { k: 'point', v: n, q: 1 })) {
            const e = el('p2p-' + side + '-points'); if (e) e.value = '';
        }
    } else {
        const nm = (el('p2p-' + side + '-item') || {}).value;
        if (!nm) { alert_('물품을 골라 주십시오.'); return; }
        const q = Math.max(1, parseInt((el('p2p-' + side + '-qty') || {}).value, 10) || 1);
        if (side === 'offer') {
            const have = (currentUser.inventory || []).filter(function (x) { return x === nm; }).length;
            const already = BAG.offer.filter(function (x) { return x.k === 'item' && x.v === nm; })
                .reduce(function (a, x) { return a + x.q; }, 0);
            if (have < already + q) {
                alert_("'" + nm + "' 은(는) " + have + '개 가지고 있습니다.'
                    + (already ? '\n이미 ' + already + '개 담아 두었습니다.' : ''));
                return;
            }
        }
        add(side, { k: 'item', v: nm, q: q });
    }
    paintBag();
}

// 바구니가 비어 있으면 지금 고른 것 한 가지로 친다 (예전처럼 쓰는 분을 위해)
function bagOrPick(side) {
    if (BAG[side].length) return BAG[side].slice();
    const type = (el('p2p-' + side + '-type') || {}).value;
    if (type === 'point') {
        const n = parseInt((el('p2p-' + side + '-points') || {}).value, 10);
        return (isNaN(n) || n <= 0) ? [] : [{ k: 'point', v: n, q: 1 }];
    }
    const nm = (el('p2p-' + side + '-item') || {}).value;
    if (!nm) return [];
    return [{ k: 'item', v: nm, q: Math.max(1, parseInt((el('p2p-' + side + '-qty') || {}).value, 10) || 1) }];
}

// 내가 정말 다 가지고 있나
function canPay(bu) {
    const inv = (currentUser.inventory || []);
    let pts = 0;
    for (let i = 0; i < bu.length; i++) {
        const x = bu[i];
        if (x.k === 'point') { pts += Number(x.v) || 0; continue; }
        const have = inv.filter(function (y) { return y === x.v; }).length;
        if (have < x.q) return { ok: false, why: "'" + x.v + "' 이(가) 모자랍니다. (가진 것 " + have + '개)' };
    }
    if (pts > (Number(currentUser.points) || 0)) return { ok: false, why: 'point' };
    return { ok: true };
}

// ==========================================
// 제안서 보내기 — 목록을 실어 보낸다
// ==========================================
function install() {
    if (typeof sendP2PDeal !== 'function') return false;
    if (sendP2PDeal._multi) return true;

    sendP2PDeal = function () {
        if (!currentUser) return;
        if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
            alert_('여우 상담실 격리 중에는 거래를 제안할 수 없습니다.'); return;
        }
        const targetCode = (el('p2p-target-user') || {}).value;
        if (!targetCode) { alert_('상대 사원을 선택해 주십시오.'); return; }
        const target = (db.users || {})[targetCode];
        if (!target) { alert_('상대 사원을 찾을 수 없습니다.'); return; }

        const mode = (el('p2p-deal-mode') || {}).value;
        const offer = bagOrPick('offer');
        if (!offer.length) { alert_('건넬 것을 담아 주십시오.'); return; }

        const pay = canPay(offer);
        if (!pay.ok) {
            if (pay.why === 'point') {
                if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
                else alert_('포인트가 부족합니다.');
            } else alert_(pay.why);
            return;
        }

        let demand = [];
        if (mode === 'trade') {
            demand = bagOrPick('demand');
            if (!demand.length) { alert_('요구할 것을 담아 주십시오.'); return; }
        }

        const first = function (bu) {
            const x = bu[0] || null;
            return x ? { t: x.k, v: x.v, q: x.q } : { t: null, v: null, q: 1 };
        };
        const fo = first(offer), fd = first(demand);

        const deal = {
            id: Date.now(),
            fromCode: currentUser.code, fromName: currentUser.name, fromNo: currentUser.no,
            toCode: targetCode, toName: target.name, toNo: target.no,
            mode: mode,
            // 새 칸 — 여럿
            offerList: offer, demandList: (mode === 'trade' ? demand : null),
            // 옛 칸 — 첫 줄만. 새 파일을 아직 안 받은 화면도 뭔가 보이도록
            offerType: fo.t, offerValue: fo.v, offerQty: fo.q,
            demandType: (mode === 'trade' ? fd.t : null),
            demandValue: (mode === 'trade' ? fd.v : null),
            demandQty: (mode === 'trade' ? fd.q : 1),
            status: 'PENDING', createdAt: Date.now()
        };

        if (typeof addHistoryLog === 'function') {
            addHistoryLog(currentUser, '[밀실 제안] ' + target.name + '(NO.' + target.no + ') 대상 '
                + (mode === 'give' ? '양도' : '교환') + ' — ' + descBag(offer));
        }

        const done = function () {
            BAG.offer = []; BAG.demand = [];
            paintBag();
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            try { if (typeof renderP2PLists === 'function') renderP2PLists(); } catch (e) { }
            alert_(target.name + ' 사원에게 제안을 보냈습니다.\n\n' + descBag(offer)
                + (mode === 'trade' ? '\n요구: ' + descBag(demand) : ''));
        };

        if (typeof database !== 'undefined' && database) {
            database.ref('p2pDeals').once('value').then(function (snap) {
                const v = snap.val() || [];
                const len = Array.isArray(v) ? v.length : Object.keys(v).length;
                return database.ref('p2pDeals/' + len).set(deal);
            }).then(done).catch(function (err) {
                console.error('[밀실] 제안 전송 실패:', err);
                alert_('서버 전송 중 오류가 발생했습니다.');
            });
        } else {
            if (!db.p2pDeals) db.p2pDeals = [];
            db.p2pDeals.unshift(deal);
            try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
            done();
        }
    };
    sendP2PDeal._multi = true;
    sendP2PDeal._txn = true;          // p2p-fix.js 가 또 감싸지 않게
    console.log('[밀실] 여러 가지를 한 번에 보낼 수 있게 했습니다');
    return true;
}

// ==========================================
// 목록 — 담긴 것을 전부 적는다
// ==========================================
function installList() {
    if (typeof renderP2PLists !== 'function') return false;
    if (renderP2PLists._multi) return true;
    const _r = renderP2PLists;
    renderP2PLists = function () {
        const out = _r.apply(this, arguments);
        try { relabel(); } catch (e) { }
        return out;
    };
    renderP2PLists._multi = true;
    return true;
}

function bundleOf(deal, side) {
    if (typeof window.p2pBundle === 'function') return window.p2pBundle(deal, side);
    return [];
}

// 원래 그려진 줄의 설명만 갈아 끼운다 (단추와 생김새는 그대로 둔다)
function relabel() {
    const all = (typeof db !== 'undefined' && db.p2pDeals) ? db.p2pDeals : [];
    const byId = {};
    (Array.isArray(all) ? all : Object.keys(all).map(function (k) { return all[k]; }))
        .forEach(function (d) { if (d && d.id != null) byId[d.id] = d; });

    ['p2p-received-list', 'p2p-sent-list'].forEach(function (boxId) {
        const box = el(boxId);
        if (!box) return;
        box.querySelectorAll('.shop-item').forEach(function (row) {
            const b = row.querySelector('button[onclick*="P2PDeal"]');
            if (!b) return;
            const m = (b.getAttribute('onclick') || '').match(/\((\d+)\)/);
            if (!m) return;
            const deal = byId[m[1]];
            if (!deal) return;
            const oBu = bundleOf(deal, 'offer');
            if (oBu.length < 2 && (deal.mode !== 'trade' || bundleOf(deal, 'demand').length < 2)) return;

            const lines = row.querySelectorAll('span');
            if (boxId === 'p2p-received-list') {
                if (lines[0]) lines[0].innerHTML = '[제공] ' + esc(descBag(oBu));
                if (lines[1]) {
                    lines[1].innerHTML = '발신: ' + esc(deal.fromName) + ' | '
                        + (deal.mode === 'give'
                            ? '<span style="color:#4CAF50;">무상 양도 (대가 없음)</span>'
                            : esc(descBag(bundleOf(deal, 'demand'))) + ' 요구');
                }
            } else {
                if (lines[1]) lines[1].innerHTML = '제물: ' + esc(descBag(oBu));
            }
        });
    });
}

// ==========================================
// 붙이기 — 화면이 다시 그려져도 따라붙는다
// ==========================================
const iv = setInterval(function () {
    const a = install(), b = installList();
    if (a && b) clearInterval(iv);
}, 500);
setTimeout(function () { clearInterval(iv); }, 30000);

setInterval(function () {
    try {
        const panel = el('shop-p2p');
        if (!panel || !panel.offsetParent) return;      // 안 보이면 아무것도 안 한다
        mount();
    } catch (e) { }
}, 1000);

console.log('[밀실] p2pBag() · p2pBagClear()');

})();
