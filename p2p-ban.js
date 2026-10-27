// ==========================================
// ★ 밀실 거래에 못 올리는 것 — 두 번째 자리 · 세 번째 자리 · 확정 승인서와 그 재료 (2026-10-27)
// bundles.json 마지막 묶음 (p2p-multi.js · p2p-wear.js 뒤)
// ==========================================
//
//   완성품   두 번째 자리 · 세 번째 자리 · 확정 승인서
//   재료     두 번째 자리 — 맞물리지 않는 조각 · 지워지지 않는 자국 · 반죽에 섞이지 않은 것
//            세 번째 자리 — 덮이지 않은 장 · 아물지 않은 자리 · 떠오르지 않는 숨
//            확정 승인서 — 맨발의 자국 · 여섯 번째 손가락 · 누군가의 왼쪽 신발 · 아직 쓰이지 않은 이름
//
//   건네는 쪽에도 · 요구하는 쪽에도 못 올린다. 고르는 칸에서 빠지고, 담아서 보내도 제안 직전에 막힌다.

(function p2pBan() {
'use strict';

const BAN = [
    '두 번째 자리', '세 번째 자리', '확정 승인서',
    '맞물리지 않는 조각', '지워지지 않는 자국', '반죽에 섞이지 않은 것',
    '덮이지 않은 장', '아물지 않은 자리', '떠오르지 않는 숨',
    '맨발의 자국', '여섯 번째 손가락', '누군가의 왼쪽 신발', '아직 쓰이지 않은 이름'
];
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
            if (hit.length) return "'" + hit[0].v + "' 은(는) 밀실 거래로 주고받을 수 없습니다.\n\n(두 번째 · 세 번째 자리 · 확정 승인서와 그 재료)";
            return f.apply(this, arguments);
        };
        w._ban = true;
        window.p2pWearCheck = w;
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
