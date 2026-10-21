// ==========================================
// ★ 내린 물품 — 들고 있던 사원에게 값만큼 돌려준다 (2026-10-21)
// bundles.json 마지막 그룹, rare-odds.js 바로 뒤
// ==========================================
//
// ■ 무엇을
//
//   정갈한 문패 · 오색 신발끈 — 우주 쇼핑몰에서 내렸다 (rare-odds.js NEVER).
//   그날 소지품에 들고 있던 것은 우주 쇼핑몰 값(7,000 P)만큼 포인트로 돌려주고 소지품에서 뺀다.
//   복사기로 만든 「[복제품] …」 도 같은 물건으로 보고 같이 돌려준다.
//
// ■ 한 번만
//
//   사원마다 u.retired['2026-10-21'] 를 찍어 둔다. 찍힌 뒤에 들어온 것(웰컴 패키지 · 선물 등)은 건드리지 않는다.
//   사원이 들어올 때 그 사원의 화면이 제 몫을 처리한다 (남의 기록은 건드리지 않는다).
//   사택 보관함 · 장터 · 선물함에 있는 것은 소지품이 아니라 그대로 둔다.
//
// ■ 콘솔
//   retireState()   이번 판에 무엇을 얼마로 돌려주는지 · 내가 받았나

(function retire() {

const ROUND = '2026-10-21';
const ITEMS = { '정갈한 문패': 7000, '오색 신발끈': 7000 };
const COPY = '[복제품] ';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }

function run() {
    const u = me();
    if (!u || !u.code || u.code === 'kario0987') return;
    if (!Array.isArray(u.inventory)) return;
    if (u.retired && u.retired[ROUND]) return;
    const got = {};
    let pts = 0;
    const keep = [];
    u.inventory.forEach(function (x) {
        const s = String(x == null ? '' : x);
        const base = s.indexOf(COPY) === 0 ? s.slice(COPY.length) : s;
        if (ITEMS[base] != null) {
            got[s] = (got[s] || 0) + 1;
            pts += ITEMS[base];
            return;
        }
        keep.push(x);
    });
    if (!u.retired || typeof u.retired !== 'object') u.retired = {};
    u.retired[ROUND] = 1;
    if (!pts) { try { saveFields({ retired: 1 }); } catch (e) { } return; }
    u.inventory = keep;
    const lines = Object.keys(got).map(function (n) { return n + ' ×' + got[n]; });
    try { if (typeof changePoints === 'function') changePoints(pts); else u.points = (Number(u.points) || 0) + pts; }
    catch (e) { u.points = (Number(u.points) || 0) + pts; }
    try { addHistoryLog(u, '[당국] 우주 쇼핑몰에서 내린 물품 환불 — ' + lines.join(', ') + ' (+' + pts.toLocaleString() + ' P)'); } catch (e) { }
    try { saveFields({ inventory: 1, retired: 1, history: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    try {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('우주 쇼핑몰에서 내린 물품을 환불했습니다.\n\n' + lines.join('\n')
                + '\n\n+' + pts.toLocaleString() + ' P');
        }
    } catch (e) { }
    console.log('[환불] ' + lines.join(', ') + ' → +' + pts + ' P');
}

// 들어와서 기록이 다 올라온 뒤에 (소지품이 비어 보이는 순간에 찍어 버리지 않게 조금 기다린다)
let seen = '', seenAt = 0;
setInterval(function () {
    try {
        const u = me();
        if (!u || !u.code) { seen = ''; return; }
        if (seen !== u.code) { seen = u.code; seenAt = Date.now(); return; }
        if (Date.now() - seenAt < 6000) return;
        run();
    } catch (e) { }
}, 2000);

window.retireState = function () {
    const u = me();
    console.log('%c===== 내린 물품 환불 (' + ROUND + ') =====', 'color:#d4af37; font-size:13px');
    Object.keys(ITEMS).forEach(function (n) { console.log('  ' + n + ' — ' + ITEMS[n].toLocaleString() + ' P (복제품도 같은 값)'); });
    console.log('  나 :', u && u.retired && u.retired[ROUND] ? '처리함' : '아직');
};

})();
