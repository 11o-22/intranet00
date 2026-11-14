// ==========================================
// ★ 밀실 거래에 못 올리는 것 — 두 번째 자리 · 세 번째 자리(와 그 재료) · 확정 승인서 (2026-10-27)
//   ★ 2026-11-11 사용자 「확정 승인서 재료는 거래 가능하게」 — 확정 승인서 재료 넷은 목록에서 뺐다 (완성품 확정 승인서는 그대로 못 올린다)
//   ★ 2026-11-14 사용자 「도깨비 방망이랑 소원권은 밀실 거래가 안 되게」 — 🪄 도깨비 방망이 · 🫙 소원권을 목록에 넣었다
//     · 이미 와 있는 제안서에 이 목록의 물품이 들어 있으면 수락도 막는다 (hookAccept — 거절 · 철회는 된다)
// bundles.json 마지막 묶음 (p2p-multi.js · p2p-wear.js 뒤)
// ==========================================
//
//   완성품   두 번째 자리 · 세 번째 자리 · 확정 승인서
//   재료     두 번째 자리 — 맞물리지 않는 조각 · 지워지지 않는 자국 · 반죽에 섞이지 않은 것
//            세 번째 자리 — 덮이지 않은 장 · 아물지 않은 자리 · 떠오르지 않는 숨
//            확정 승인서 — 맨발의 자국 · 여섯 번째 손가락 · 누군가의 왼쪽 신발 · 아직 쓰이지 않은 이름  ← 2026-11-11 부터 거래 됨
//
//   그 밖에   🪄 도깨비 방망이 · 🫙 소원권 (2026-11-14)
//
//   건네는 쪽에도 · 요구하는 쪽에도 못 올린다. 고르는 칸에서 빠지고, 담아서 보내도 제안 직전에 막힌다.
//   이미 와 있던 제안서도 수락할 때 막힌다.

(function p2pBan() {
'use strict';

const BAN = [
    '두 번째 자리', '세 번째 자리', '확정 승인서',
    '맞물리지 않는 조각', '지워지지 않는 자국', '반죽에 섞이지 않은 것',
    '덮이지 않은 장', '아물지 않은 자리', '떠오르지 않는 숨',
    '🪄 도깨비 방망이', '🫙 소원권', '도깨비 방망이', '소원권'      // 2026-11-14 (뒤의 둘은 그림을 달기 전 이름)
];
const WHY = '(두 번째 · 세 번째 자리와 그 재료 · 확정 승인서 · 🪄 도깨비 방망이 · 🫙 소원권)';
function banned(n) { return BAN.indexOf(String(n || '')) >= 0; }
window.p2pBanned = banned;
window.P2P_BAN = BAN;

// 제안 직전 — 담긴 것 가운데 하나라도 있으면 막는다 (p2p-multi.js 가 p2pWearCheck 를 부른다)
(function hookCheck() {
    const iv = setInterval(function () {
        const f = window.p2pWearCheck;
        if (typeof f !== 'function' || f._ban) return;
        const w = function (oBu, dBu, to) {
            const hit = [].concat(oBu || [], dBu || []).filter(function (x) { return x && x.k === 'item' && banned(x.v); });
            if (hit.length) return "'" + hit[0].v + "' 은(는) 밀실 거래로 주고받을 수 없습니다.\n\n" + WHY;
            return f.apply(this, arguments);
        };
        w._ban = true;
        window.p2pWearCheck = w;
        clearInterval(iv);
    }, 500);
})();

// 수락 직전 — 이미 와 있던 제안서에 들어 있어도 막는다 (2026-11-14)
//   p2p-fix.js 가 acceptP2PDeal 을 통째로 갈아 끼운 뒤(_txn)에 그 바깥을 한 번 감싼다. 제안서는 그대로 둔다 — 받은 쪽이 거절하거나 보낸 쪽이 철회한다.
function dealOf(id) {
    try {
        const raw = (typeof db !== 'undefined' && db && db.p2pDeals) || [];
        const arr = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) { return raw[k]; });
        return arr.filter(function (d) { return d && String(d.id) === String(id); })[0] || null;
    } catch (e) { return null; }
}
function dealHit(deal) {
    if (!deal) return null;
    let all = [];
    try {
        if (typeof window.p2pBundle === 'function') all = [].concat(window.p2pBundle(deal, 'offer') || [], deal.mode === 'trade' ? (window.p2pBundle(deal, 'demand') || []) : []);
    } catch (e) { all = []; }
    if (!all.length) {                                   // p2pBundle 이 아직 없을 때 — 옛 세 칸만 본다
        if (deal.offerType === 'item' && deal.offerValue) all.push({ k: 'item', v: String(deal.offerValue) });
        if (deal.mode === 'trade' && deal.demandType === 'item' && deal.demandValue) all.push({ k: 'item', v: String(deal.demandValue) });
    }
    const hit = all.filter(function (x) { return x && x.k === 'item' && banned(x.v); })[0];
    return hit ? hit.v : null;
}
(function hookAccept() {
    const iv = setInterval(function () {
        if (typeof acceptP2PDeal !== 'function' || !acceptP2PDeal._txn) return;      // p2p-fix.js 가 갈아 끼운 뒤에
        if (acceptP2PDeal._ban) { clearInterval(iv); return; }
        const _a = acceptP2PDeal;
        const w = function (dealId) {
            const v = dealHit(dealOf(dealId));
            if (v) {
                try { showCustomAlert("'" + v + "' 은(는) 밀실 거래로 주고받을 수 없습니다.\n\n" + WHY + '\n\n이 제안은 수락할 수 없습니다. 거절해 주세요.'); } catch (e) { }
                return;
            }
            return _a.apply(this, arguments);
        };
        Object.keys(_a).forEach(function (k) { try { w[k] = _a[k]; } catch (e) { } });
        w._ban = true;
        acceptP2PDeal = w; try { window.acceptP2PDeal = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();

// 고르는 칸에서 뺀다 — 건넬 것 · 요구할 것
function prune() {
    ['p2p-offer-item', 'p2p-demand-item'].forEach(function (id) {
        const s = document.getElementById(id);
        if (!s) return;
        Array.prototype.slice.call(s.options).forEach(function (o) { if (banned(o.value)) o.remove(); });
    });
}
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderP2PSelectBoxes !== 'function' || renderP2PSelectBoxes._ban) return;
        const _r = renderP2PSelectBoxes;
        const w = function () { const out = _r.apply(this, arguments); try { prune(); } catch (e) { } return out; };
        w._ban = true;
        renderP2PSelectBoxes = w; try { window.renderP2PSelectBoxes = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();
setInterval(function () { try { prune(); } catch (e) { } }, 2000);

})();
