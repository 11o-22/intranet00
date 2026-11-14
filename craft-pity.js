// ==========================================
// ★ 조합 재료 — 10판을 뛰면 하나는 꼭 나온다 (2026-11-14)
// bundles.json 마지막 묶음 맨 끝 (alien-weekly.js 뒤)
// ==========================================
//
// 2026-11-14 사용자
//   「그리고 조합 재료들, 10 판에 하나씩 나오게 하자.」
//   「그 두번째 자리랑 세번째 자리랑 확정 승인서 재료들.」
//   「10판을 뛰면 하나는 꼭 나오도록 하자」
//   「아 그리고 회수품이 10회 중 한 번 뜨는 거, 커스텀 장비를 가진 (뿅망치 제외.) 사람들은 제외로 하자.」
//     → 커스텀 장비를 가진 사원은 이 보장에서 빠진다 — 세지도 주지도 않고 제 확률로만 나온다 (쌓여 있던 판 수는 그대로 둔다)
//       커스텀 장비 = alien-weekly.js CUSTOM (상담사 지급 장비 · 뿅망치는 세지 않는다) — 소지품 · 장착칸 어디에 있든 (hasCustomGear)
//
// ■ 어느 재료
//   두 번째 자리   맞물리지 않는 조각(C-119) · 지워지지 않는 자국(B-330) · 반죽에 섞이지 않은 것(B-508)
//   세 번째 자리   덮이지 않은 장(S-003) · 아물지 않은 자리(S-010) · 떠오르지 않는 숨(A-667)
//   확정 승인서    맨발의 자국(A-214) · 여섯 번째 손가락(A-667) · 아직 쓰이지 않은 이름(영웅 구역 · 살아 돌아오면)
//
// ■ 어떻게
//   제 확률로 굴리는 것은 그대로 둔다 (dark.js · thirdslot.js · guarantee-fix.js — 행운 · 크리티컬 따위 배수도 그대로).
//   재료마다 「그 재료가 나오는 구역을 안 나온 채로 몇 판 뛰었나」 를 센다 (사원 기록 craftPity/<재료>).
//     · 제 확률로 나오면 0 으로 되돌린다
//     · 안 나오면 +1 — 10 이 되는 판에 하나를 꼭 주고 0 으로 되돌린다
//   세는 판 = 회수품을 굴리는 판 (귀환 정산 · A-214 에서 신도에게 당한 판 · 영웅 구역에서 살아 돌아온 판).
//     쓰러져 회수품을 못 굴린 판 · 헬퍼로 든 판(보상 없음) · 커스텀 장비를 가진 사원의 판은 세지 않는다.
//   ★ 커스텀 장비로 만든 방(gear-room.js — 회수품 확률 ×0.1)에서는 한 판을 0.1 판으로 센다 (그 방에서만 뛰면 100판).
//     2026-11-10 사용자 「커스텀 장비로 방을 만들어서 돌 때에는 회수품이 나올 확률을 10 배 더 낮춰줘」 와 같은 셈.
//
// ■ 부르는 곳 — 회수품을 굴린 바로 뒤
//   index.html renderDarkResult · a214-kill.js (신도에게 당함) · guarantee-fix.js epicDrop
//     craftPityAfter(이 판에서 굴린 이름들, 이번에 나온 이름들, 판 무게) → 꼭 줘야 할 이름들 (부르는 쪽이 소지품에 넣는다)
//
// ■ 콘솔
//   craftPityState()   재료마다 몇 판째인가

(function craftPity() {
'use strict';

const NEED = 10;
const MATS = [
    '맞물리지 않는 조각', '지워지지 않는 자국', '반죽에 섞이지 않은 것',
    '덮이지 않은 장', '아물지 않은 자리', '떠오르지 않는 숨',
    '맨발의 자국', '여섯 번째 손가락', '아직 쓰이지 않은 이름'
];

function u_() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
function book(u) {
    if (!u.craftPity || typeof u.craftPity !== 'object' || Array.isArray(u.craftPity)) u.craftPity = {};
    return u.craftPity;
}
function isHelper() { try { return typeof window.iAmHelper === 'function' && !!window.iAmHelper(); } catch (e) { return false; } }
// 커스텀 장비를 가진 사원 — 보장에서 빠진다 (뿅망치는 커스텀 장비로 세지 않는다 · alien-weekly.js)
function hasCustom(u) { try { return typeof window.hasCustomGear === 'function' && !!window.hasCustomGear(u); } catch (e) { return false; } }

window.craftPityIs = function (name) { return MATS.indexOf(String(name || '')) >= 0; };
// 회수품을 굴린 바로 뒤에 부른다 — 꼭 줘야 할 재료 이름들을 돌려준다
window.craftPityAfter = function (names, gained, weight) {
    const u = u_();
    if (!u || isHelper() || hasCustom(u)) return [];
    let w = Number(weight);
    if (!(w > 0)) w = 1;
    if (w > 1) w = 1;                                    // 한 판은 한 판 — 배수가 붙어도 더 빨리 세지 않는다
    const p = book(u), out = [], seen = {};
    let touched = false;
    (Array.isArray(names) ? names : []).forEach(function (n) {
        n = String(n || '');
        if (MATS.indexOf(n) < 0 || seen[n]) return;
        seen[n] = 1; touched = true;
        if ((gained || []).indexOf(n) >= 0) { p[n] = 0; return; }        // 제 확률로 나왔다 — 처음부터 다시 센다
        const v = Math.round(((Number(p[n]) || 0) + w) * 10) / 10;
        if (v >= NEED) { p[n] = 0; out.push(n); }
        else p[n] = v;
    });
    if (touched) { try { if (typeof saveFields === 'function') saveFields({ craftPity: 1 }); } catch (e) { } }
    return out;
};

window.craftPityState = function () {
    const u = u_();
    console.log('%c===== ⚗ 조합 재료 — 10판을 뛰면 하나는 꼭 =====', 'color:#7fd4d4; font-size:13px');
    if (!u) { console.log('  들어와 있지 않다'); return; }
    if (hasCustom(u)) console.log('  ★ 커스텀 장비를 가진 사원 — 이 보장에서 빠진다 (제 확률로만 나온다 · 아래 판 수는 더 쌓이지 않는다)');
    const p = book(u), where = {};
    try { Object.keys(DARK_LOOT_BY_ZONE).forEach(function (z) { (DARK_LOOT_BY_ZONE[z] || []).forEach(function (l) { if (MATS.indexOf(l.name) >= 0) where[l.name] = z + ' · ' + (l.chance * 100).toFixed(1) + '%'; }); }); } catch (e) { }
    console.table(MATS.map(function (n) {
        return { 재료: n, '나오는 곳 · 제 확률': where[n] || (n === '아직 쓰이지 않은 이름' ? '영웅 구역 (살아 돌아오면)' : '-'),
                 '안 나온 판': Number(p[n]) || 0, '꼭 나오는 판까지': Math.max(0, Math.round((NEED - (Number(p[n]) || 0)) * 10) / 10) };
    }));
    console.log('  커스텀 장비로 만든 방에서는 한 판을 0.1 판으로 센다 · 헬퍼로 든 판과 쓰러진 판은 세지 않는다 · 커스텀 장비를 가진 사원은 빠진다');
};

console.log('[⚗ 조합 재료] ' + NEED + '판을 뛰면 하나는 꼭 — 재료 ' + MATS.length + '종 · craftPityState()');
})();
