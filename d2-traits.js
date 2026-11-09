// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 특성 35 (이름표 · 뽑기 · 택 로고 각인)
// bundles.json 마지막 묶음 — d2-battle.js 뒤 (D2 · D2BT · DOLL · PET 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 4단계
//   기획 탭 「특성」 과 「공통 규칙 08 · 11」「조는 도깨비 04」 를 옮겼다. 전투 중 발동은 d2-battle.js 에 이미 있다.
//
// ■ 특성   개체당 하나 (u.pets[열쇠].tr = 1~35). 일반 30 · 희귀 5 (31~35).
//   야생 등장  희귀 2% (다섯 가지 균등 → 각 0.4%) · 일반 98% (서른 가지 균등). 결정적 난수로 기록 없는 인형에게도 늘 같은 값.
//   공개      전투에서 발동할 때 알림으로 공개 (D2BT MSG-035). 「잠깐, 실례!」 가 맞으면 미리 확인한다.
//
// ■ 택 로고 각인기  '🏷️ 택 로고 각인기' — 조는 도깨비 상점에서 100,000 꿈결 (5단계 상점). 소지품에서 쓴다 · 장소 제한 없음 · 전투 중 불가.
//   소유 인형(동행이든 보관함이든) 하나 → 일반 특성 30 가운데 하나로 바꾼다. 희귀 5 는 새길 수 없고, 희귀를 일반으로 덮으면 되돌릴 수 없다 (따로 확인).
//   같은 특성은 못 고른다 (MSG-107). 확정할 때만 1개 소모 · 레벨 · 개체치 · 성격 · 노력치 · 기술 · PP 는 그대로.
//
// ■ 콘솔
//   d2Traits()          특성 표
//   d2EngraveOpen()     각인 창 (소지품에서 쓰는 것과 같다)

(function d2traits() {
'use strict';

const ITEM = '🏷️ 택 로고 각인기';
const PRICE_DREAM = 100000;
const RARE_P = 0.02;
const TRAITS = {
    1: { n: '장난꾸러기', cat: '공격형', rare: 0, eng: 1,
        e: "공격 기술의 부가효과 확률 +15%p. 35% 효과는 50%. 최종 발동 확률은 min(100%, 기본 확률+15%p)이며 초과분은 버린다.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    2: { n: '정밀함', cat: '공격형', rare: 0, eng: 1,
        e: "즉사기를 제외한 공격 기술 명중률 +10%p.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    3: { n: '기회주의', cat: '공격형', rare: 0, eng: 1,
        e: "자신의 공격보다 먼저 상대가 이번 턴 유틸기를 실제 발동했을 때 공격 피해 +20%. 선택만 했거나 실패했거나 자신의 공격 뒤에 발동하면 미적용. 최종 적중·실제 HP 감소 시만 전투당 1회 소모. 실패 시 미소모이나 원래 턴 조건은 계속 필요.",
        c: "전투당 1회" },
    4: { n: '승부욕', cat: '공격형', rare: 0, eng: 1,
        e: "상대에 의해 자신의 능력치가 하락하면 공격력 +1.",
        c: "전투당 1회" },
    5: { n: '독기', cat: '공격형', rare: 0, eng: 1,
        e: "독 상태인 동안 공격 피해 +30%.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    6: { n: '막판승부', cat: '공격형', rare: 0, eng: 1,
        e: "현재 HP가 최대 HP의 1/3 이하이면 공격 피해 +20%.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    7: { n: '절제', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "자신 +2 / 자신 다른 능력치 -1 강화기의 -1 대가 무시.",
        c: "전투당 1회" },
    8: { n: '배짱', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "상대에 의한 자신의 능력치 하락 무효화.",
        c: "전투당 1회" },
    9: { n: '앙갚음', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "상대에 의해 자신의 능력치가 하락하면 상대 속도 -1.",
        c: "전투당 1회" },
    10: { n: '바통 장인', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "바통터치로 교체한 후속 아군 속도 +1.",
        c: "전투당 1회" },
    11: { n: '성장통', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "-2 이하인 능력치에 랭크 상승 유틸기를 사용하면 해당 능력치 상승량 +1.",
        c: "전투당 1회 랭크 한도여도 트리거 성립 시 사용 기회 소모. 발동 알림 후 한도 문구만 출력하며, 실제 상승이 없으면 증가 문구는 출력하지 않는다." },
    12: { n: '준비만전', cat: '랭크 조작형', rare: 0, eng: 1,
        e: "등장 시 자신의 명중률 +1. 전투 최초 출전에도 적용하며, 첫 턴 행동 순서를 정하기 전에 처리한다.",
        c: "전투당 1회 랭크 한도여도 트리거 성립 시 사용 기회 소모. 발동 알림 후 한도 문구만 출력하며, 실제 상승이 없으면 증가 문구는 출력하지 않는다." },
    13: { n: '허세', cat: '교체형', rare: 0, eng: 1,
        e: "등장 시 상대 공격력 -1. 전투 최초 출전에도 적용하며, 첫 턴 행동 순서를 정하기 전에 처리한다.",
        c: "전투당 1회" },
    14: { n: '재빠른 발', cat: '교체형', rare: 0, eng: 1,
        e: "등장 시 자신의 속도 +1. 전투 최초 출전에도 적용하며, 첫 턴 행동 순서를 정하기 전에 처리한다.",
        c: "전투당 1회" },
    15: { n: '복수심', cat: '교체형', rare: 0, eng: 1,
        e: "상대 공격으로 아군이 기절한 직후 등장하면 자신의 공격력 +1.",
        c: "전투당 1회" },
    16: { n: '완충솜', cat: '교체형', rare: 0, eng: 1,
        e: "일반 교체·바통터치·기절 후 선택 교체 등 모든 종류의 교체로 등장한 턴 받는 공격 피해 20% 감소.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    17: { n: '털어내기', cat: '교체형', rare: 0, eng: 1,
        e: "털어내기는 기절하지 않은 인형이 일반 교체 또는 바통터치로 실제 물러날 때만 발동하여 자신의 독·마비를 치료한다(전투당 1회). 기절 후 선택 교체에는 발동·공개·횟수 소모하지 않으며, 기절 개체의 상태이상과 경과 카운트는 보존한다.",
        c: "전투당 1회" },
    18: { n: '눈치', cat: '교체형', rare: 0, eng: 1,
        e: "상대가 이번 턴 일반 교체·바통터치·기절 후 선택 교체 중 어느 방식으로든 교체했다면 공격 피해 +20%. 최종 적중·실제 HP 감소 시에만 전투당 1회 소모. 실패 시 미소모이며 해당 턴 조건은 계속 필요.",
        c: "전투당 1회" },
    19: { n: '끈질김', cat: '생존·방어형', rare: 0, eng: 1,
        e: "최대 HP에서 기절할 상대 공격을 받으면 HP 1로 생존. 즉사도 견딤. 기절할 상대 공격에 버티기와 생존 특성 조건이 겹치면 버티기를 먼저 적용한다. 버티기로 HP 1 생존이 성립하면 끈질김·마지막 한 땀은 발동·공개·횟수 소모하지 않는다. 버티기가 적용되지 않은 기절 상황에서만 해당 생존 특성의 조건·남은 횟수를 확인한다.",
        c: "전투당 1회" },
    20: { n: '반사신경', cat: '생존·방어형', rare: 0, eng: 1,
        e: "받아치기의 반사 비율을 실제 받은 피해의 50%에서 75%로 변경.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    21: { n: '회복체질', cat: '생존·방어형', rare: 0, eng: 1,
        e: "회복체질은 보유자가 자신의 회복 기술로 자기 HP를 회복하는 부분에만 ×1.2 적용한다. 상대에게 주는 회복에는 적용하지 않는다. 회복4의 상대 회복량은 ⌈상대 최대 HP×0.5⌉ 그대로이며 회복 기술 사용자의 특성 보너스를 전달하지 않는다. 실제 회복량은 부족 HP 이내다. 도넛 먹기의 자기 지속 회복도 회복체질 적용 대상이다. 보유 인형 자신의 회복량 Q=min(부족 HP,⌈최대 HP×(1/16)×1.2⌉). 미보유 시 ×1.0. 중간 올림 없이 모든 보정 뒤 최종 한 번 올림한다. 아이템·상대 또는 다른 아군에게 주는 회복에는 보너스를 전달하지 않는다.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    22: { n: '불굴', cat: '생존·방어형', rare: 0, eng: 1,
        e: "버티기로 HP 1에 살아남으면 공격력 +1.",
        c: "전투당 1회" },
    23: { n: '경계심', cat: '생존·방어형', rare: 0, eng: 1,
        e: "완전 방어로 공격을 막으면 다음 공격 피해 +20%. 일회성 증가는 최종 적중·실제 HP 감소 시만 소모. 실패 시 미소모, 원래 발동 조건 유지. 획득한 미소모 다음 공격 강화는 일반 교체·기절 시 제거, 바통터치 시 후속에게 이전. 전투당 사용 기록은 보존.",
        c: "전투당 1회" },
    24: { n: '튼튼한 박음질', cat: '생존·방어형', rare: 0, eng: 1,
        e: "현재 HP가 최대 HP의 50% 이하일 때 받는 공격 피해 15% 감소.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    25: { n: '선봉장', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "선제태세 지속 3턴을 4턴으로 변경. 사용 턴 포함, 실제 활용 최대 3턴.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" },
    26: { n: '허를 찌르기', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "집중하기 이후 최초로 최종 적중하고 실제 HP 감소가 발생하는 공격의 피해 +20%. 집중 해제·빗나감·회피·방어·무효·실제 피해 0에도 대기 효과 보존. 실제 피해 발생에 적용 후 소모. 획득한 미소모 다음 공격 강화는 일반 교체·기절 시 제거, 바통터치 시 후속에게 이전. 전투당 사용 기록은 보존.",
        c: "전투당 1회" },
    27: { n: '낚시꾼', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "상대가 완전 방어를 사용한 턴 자신이 유틸기를 사용하면 다음 공격 피해 +20%. 일회성 증가는 최종 적중·실제 HP 감소 시만 소모. 실패 시 미소모, 원래 발동 조건 유지. 획득한 미소모 다음 공격 강화는 일반 교체·기절 시 제거, 바통터치 시 후속에게 이전. 전투당 사용 기록은 보존.",
        c: "전투당 1회" },
    28: { n: '숨 고르기', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "기술에 의한 강제 휴식 턴을 실제로 마치면 최대 HP의 1/16 회복. 교체로 휴식이 초기화된 경우에는 발동하지 않는다.",
        c: "전투당 1회" },
    29: { n: '위기감지', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "상대가 집중하기를 사용하면 자신의 속도 +1.",
        c: "전투당 1회" },
    30: { n: '유언', cat: '심리전·특수기형', rare: 0, eng: 1,
        e: "동귀어진으로 자신이 기절하면 다음에 등장하는 아군 공격력 +1.",
        c: "전투당 1회" },
    31: { n: '연쇄반응', cat: '공격형', rare: 1, eng: 0,
        e: "위력 40 복합 공격의 35% 부가효과를 두 번 독립 판정. 두 판정 중 1회 이상 성공 57.75%, 2회 성공 12.25%. 첫 적용 시도의 성공·실패와 무관하게 전투당 1회 소모. 빗나감·회피·차단 또는 두 확률 판정 모두 실패해도 돌려주지 않는다.",
        c: "전투당 1회. 첫 위력 40 복합 공격 시도에서 소모. 선택만 하고 기절로 시도하지 못한 행동은 제외." },
    32: { n: '전화위복', cat: '랭크 조작형', rare: 1, eng: 0,
        e: "처음 사용하는 +2/-1 강화기의 -1 대가를 +1로 변경.",
        c: "전투당 1회" },
    33: { n: '대역 인형', cat: '교체형', rare: 1, eng: 0,
        e: "탐사자가 직접 교체를 선택해 1턴을 소모하는 일반 교체로 등장한 턴, 자신 대상 첫 공격 기술 무효. 즉사 포함·동귀어진 제외. 바통터치·기절 후 선택 교체에는 미적용. 공격이 없으면 보호 기회는 턴 종료 시 소멸. 교체 턴 추가 기술 사용 불가.",
        c: "전투당 1회" },
    34: { n: '마지막 한 땀', cat: '생존·방어형', rare: 1, eng: 0,
        e: "현재 HP와 무관하게 상대 공격으로 기절할 때 HP 1로 생존. 즉사 포함. 독·자기 희생 제외. 기절할 상대 공격에 버티기와 생존 특성 조건이 겹치면 버티기를 먼저 적용한다. 버티기로 HP 1 생존이 성립하면 끈질김·마지막 한 땀은 발동·공개·횟수 소모하지 않는다. 버티기가 적용되지 않은 기절 상황에서만 해당 생존 특성의 조건·남은 횟수를 확인한다.",
        c: "전투당 1회" },
    35: { n: '고요한 심장', cat: '심리전·특수기형', rare: 1, eng: 0,
        e: "집중하기를 실제 발동한 시점부터 해당 턴 종료까지 받는 공격 피해 50% 감소. 선택만 한 시점·발동 전 공격에는 미적용. 즉사 효과·상태이상은 막지 못함.",
        c: "효과에 적힌 조건·범위마다 적용(별도 횟수 제한 없음)" }
};
const NORMAL = Object.keys(TRAITS).map(Number).filter(function (k) { return !TRAITS[k].rare; });
const RARE = Object.keys(TRAITS).map(Number).filter(function (k) { return TRAITS[k].rare; });

function D2() { return window.D2; }
function DL() { return window.DOLL; }
function P() { return window.PET; }
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function int(v) { v = Number(v); return isFinite(v) ? Math.floor(v) : 0; }
function fix(t) { try { return window.D2BT.fix(t); } catch (e) { return String(t).replace(/(은\/는|이\/가|을\/를|으로\/로)/g, function (m) { return m.split('/')[1]; }); } }   // 조사 — 전투 코어의 것을 빌린다
function get(no) { return TRAITS[int(no)] || null; }
function name(no) { const t = get(no); return t ? t.n : '없음'; }
function isRare(no) { const t = get(no); return !!(t && t.rare); }

// ── 뽑기 — 희귀 2% · 일반 98%
function roll(r) { r = r || Math.random; if (r() < RARE_P) return RARE[Math.floor(r() * RARE.length)]; return NORMAL[Math.floor(r() * NORMAL.length)]; }
function fallback(d) { return roll(D2().rngOf('d2tr:' + String((d && d.id) || '') + ':' + String((d && d.at) || 0))); }
function trOf(d) { const v = int(d && d.tr); return TRAITS[v] ? v : fallback(d); }
// 기록 조각 — tr 이 없으면
function fixTr(d) { return (d && TRAITS[int(d.tr)]) ? null : { tr: fallback(d) }; }
// 글
function text(no, short) { const t = get(no); if (!t) return '특성 없음'; return short ? t.n + ' — ' + t.e : t.n + ' (' + t.cat + (t.rare ? ' · 희귀' : '') + ')\n' + t.e + '\n' + t.c; }

// ── 각인
function inBattle() { try { if (window.D2BT_ACTIVE) return true; if (document.getElementById('dbt-ov')) return true; } catch (e) { } return false; }
function count(u) { u = u || u_(); return ((u && u.inventory) || []).filter(function (x) { return x === ITEM; }).length; }
function canEngrave(d, no, u) {
    u = u || u_();
    if (inBattle()) return { ok: false, why: '택 로고 각인기는 전투 중에 사용할 수 없다!' };
    if (!count(u)) return { ok: false, why: ITEM + '이 부족하다!' };
    const t = get(no);
    if (!t) return { ok: false, why: '그런 특성이 없습니다.' };
    if (t.rare || !t.eng) return { ok: false, why: '이 특성은 택 로고 각인기로 새길 수 없다!' };
    if (trOf(d) === int(no)) return { ok: false, why: '이미 같은 택 로고가 새겨져 있다!' };
    return { ok: true, from: trOf(d), to: int(no), rareLoss: isRare(trOf(d)) };
}
function engrave(d, no, u) {
    u = u || u_();
    const c = canEngrave(d, no, u);
    if (!c.ok) return c;
    try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, ITEM, 1); else { const i = u.inventory.indexOf(ITEM); if (i >= 0) u.inventory.splice(i, 1); } } catch (e) { }
    d.tr = c.to;
    const p = {}; p['pets/' + d.id + '/tr'] = c.to;
    try { DL().put(p, u); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
    try { if (typeof addHistoryLog === 'function') { addHistoryLog(u, '[🏷️ 각인] ' + DL().nickOf(d) + ' — ' + name(c.from) + ' → ' + name(c.to)); saveFields({ history: 1 }); } } catch (e) { }
    return { ok: true, from: c.from, to: c.to, msg: fix(DL().nickOf(d) + '의 택 로고가 ' + name(c.to) + '으로/로 바뀌었다!') };
}

// ── 각인 창 (소지품 → 사용) — 소유 인형 → 일반 특성 → 확인
function css() {
    if (document.getElementById('d2e-css')) return;
    const s = document.createElement('style'); s.id = 'd2e-css';
    s.textContent = [
        '.d2e-dim{position:fixed;inset:0;z-index:99998;background:rgba(5,3,10,.6);display:flex;align-items:flex-end;justify-content:center}',
        '.d2e-pan{width:100%;max-width:440px;max-height:86vh;overflow:auto;background:#1c1528;border:2px solid #a78bdb;border-bottom:0;border-radius:14px 14px 0 0;padding:14px 14px calc(env(safe-area-inset-bottom) + 14px);color:#eee;font-size:13px}',
        '.d2e-pan h3{margin:0 0 8px;font-size:15px;color:#ffe6b8;display:flex;justify-content:space-between;align-items:center}',
        '.d2e-x{background:none;border:1px solid #666;color:#ccc;border-radius:6px;padding:3px 9px;font-size:12px}',
        '.d2e-row{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid #3d2f5c;border-radius:8px;margin:6px 0;background:rgba(0,0,0,.25)}',
        '.d2e-row.on{border-color:#ffd766}',
        '.d2e-row .n{flex:1}.d2e-row .n b{display:block;font-size:13px}.d2e-row .n small{color:#a99cc4;font-size:11px}',
        '.d2e-btn{background:linear-gradient(145deg,#6b4a1d,#38250e);border:1px solid #ffd766;color:#ffe6b8;border-radius:8px;padding:8px 12px;font-size:13px}',
        '.d2e-btn[disabled]{opacity:.4}.d2e-ghost{background:#2a2a2a;border:1px solid #555;color:#ccc;border-radius:8px;padding:8px 12px;font-size:13px}',
        '.d2e-sub{color:#a99cc4;font-size:11px;margin:4px 0 8px}.d2e-eff{background:rgba(255,255,255,.04);border-radius:8px;padding:8px;margin:6px 0;font-size:12px;line-height:1.5;white-space:pre-wrap}'
    ].join('\n');
    document.head.appendChild(s);
}
function shut() { const e = document.getElementById('d2e-dim'); if (e) e.remove(); }
function open(step, st) {
    const u = u_(), D = DL(); if (!u || !D) return;
    css(); shut();
    st = st || {};
    const dim = document.createElement('div'); dim.id = 'd2e-dim'; dim.className = 'd2e-dim';
    dim.addEventListener('click', function (e) { if (e.target === dim) shut(); });
    const pan = document.createElement('div'); pan.className = 'd2e-pan';
    dim.appendChild(pan); document.body.appendChild(dim);
    const ds = D.dolls(u), keys = Object.keys(ds);
    if (inBattle()) { pan.innerHTML = '<h3>특성 각인 <button class="d2e-x">닫기</button></h3><div class="d2e-eff">택 로고 각인기는 전투 중에 사용할 수 없다!</div>'; pan.querySelector('.d2e-x').onclick = shut; return; }
    if (step === 'doll' || !step) {
        let h = '<h3>특성 각인 <button class="d2e-x">닫기</button></h3><div class="d2e-sub">' + esc(ITEM) + ' ' + count(u) + '개 · 택 로고를 바꿀 인형을 고르세요 (동행 · 보관함 모두)</div>';
        if (!keys.length) h += '<div class="d2e-eff">선택할 수 있는 인형이 없다!</div>';
        keys.forEach(function (k) { const d = ds[k]; const s = D2().statsOf(d); const t = trOf(d); h += '<div class="d2e-row" data-k="' + esc(k) + '"><div class="n"><b>' + esc(D.nickOf(d)) + '</b><small>Lv ' + s.lv + ' · ' + s.g + ' · ' + esc(D2().perOf(d).n) + ' · 특성 ' + esc(name(t)) + (isRare(t) ? ' ★희귀' : '') + '</small></div><button class="d2e-ghost">고르기</button></div>'; });
        pan.innerHTML = h;
        pan.querySelector('.d2e-x').onclick = shut;
        Array.prototype.forEach.call(pan.querySelectorAll('.d2e-row'), function (row) { row.querySelector('button').onclick = function () { open('trait', { k: row.getAttribute('data-k') }); }; });
        return;
    }
    const d = ds[st.k]; if (!d) { shut(); return; }
    if (step === 'trait') {
        const t0 = trOf(d);
        let h = '<h3>' + esc(D.nickOf(d)) + ' — 새 택 로고 <button class="d2e-x">닫기</button></h3><div class="d2e-eff">지금 특성: <b>' + esc(name(t0)) + '</b>' + (isRare(t0) ? ' ★희귀' : '') + '\n' + esc(get(t0) ? get(t0).e : '') + '</div><div class="d2e-sub">일반 특성 30 가운데 하나 · 희귀 5 는 새길 수 없다</div>';
        NORMAL.forEach(function (no) { const t = TRAITS[no]; h += '<div class="d2e-row' + (no === t0 ? ' on' : '') + '" data-no="' + no + '"><div class="n"><b>' + esc(t.n) + '</b><small>' + esc(t.cat) + ' · ' + esc(t.c) + '</small></div><button class="d2e-ghost d2e-eff-btn">효과</button><button class="d2e-btn d2e-pick"' + (no === t0 ? ' disabled' : '') + '>선택</button></div>'; });
        pan.innerHTML = h;
        pan.querySelector('.d2e-x').onclick = shut;
        Array.prototype.forEach.call(pan.querySelectorAll('.d2e-row'), function (row) {
            const no = Number(row.getAttribute('data-no'));
            row.querySelector('.d2e-eff-btn').onclick = function () { alert_(text(no)); };
            row.querySelector('.d2e-pick').onclick = function () { if (no === t0) { alert_('이미 같은 택 로고가 새겨져 있다!'); return; } open('confirm', { k: st.k, no: no }); };
        });
        return;
    }
    if (step === 'confirm') {
        const c = canEngrave(d, st.no, u);
        let h = '<h3>각인 확인 <button class="d2e-x">닫기</button></h3>';
        if (!c.ok) h += '<div class="d2e-eff">' + esc(c.why) + '</div>';
        else {
            h += '<div class="d2e-eff">' + esc(fix(D.nickOf(d) + '의 택 로고를 ' + name(c.from) + '에서 ' + name(c.to) + '으로/로 바꿀까요?')) + '\n' + esc(ITEM) + ' 1개를 사용합니다.</div>';
            if (c.rareLoss) h += '<div class="d2e-eff" style="border:1px solid #d9534f">현재 희귀 특성은 각인기로 다시 복구할 수 없습니다.\n' + esc(fix(name(c.from) + '을/를 ' + name(c.to) + '으로/로 바꿀까요?')) + '</div>';
            h += '<div class="d2e-eff">' + esc(text(c.to)) + '</div>';
            h += '<div style="display:flex;gap:8px;margin-top:8px"><button class="d2e-ghost d2e-back" style="flex:1">' + (c.rareLoss ? '유지하기' : '취소') + '</button><button class="d2e-btn d2e-go" style="flex:1">' + (c.rareLoss ? '변경하기' : '각인 확정 · 1개 사용') + '</button></div>';
        }
        pan.innerHTML = h;
        pan.querySelector('.d2e-x').onclick = shut;
        const back = pan.querySelector('.d2e-back'); if (back) back.onclick = function () { open('trait', { k: st.k }); };
        const go = pan.querySelector('.d2e-go'); if (go) go.onclick = function () { go.disabled = true; const r = engrave(d, st.no, u); if (!r.ok) { alert_(r.why); go.disabled = false; return; } shut(); alert_(r.msg); try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } };
        return;
    }
}

// ── 소지품 연결 — 품목 등록 · 사용 가로채기 (상점은 5단계)
(function hook() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || typeof useInventoryItem !== 'function') return;
        if (!ITEM_CATALOG[ITEM]) ITEM_CATALOG[ITEM] = { price: 0, usable: true, targetable: false, effect: 'd2_engrave', noSell: true, desc: '봉제인형의 택 로고(특성)를 원하는 일반 특성으로 바꾼다. 희귀 특성은 새길 수 없다. 전투 중에는 쓸 수 없다. (조는 도깨비 상점 · ' + PRICE_DREAM.toLocaleString('ko-KR') + ' 꿈결)' };
        if (!useInventoryItem._d2e) {
            const _u = useInventoryItem;
            useInventoryItem = function (itemName) { if (itemName !== ITEM) return _u.apply(this, arguments); if (inBattle()) { alert_('택 로고 각인기는 전투 중에 사용할 수 없다!'); return; } open('doll'); };
            useInventoryItem._d2e = true;
        }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

window.D2TR = { ITEM: ITEM, PRICE_DREAM: PRICE_DREAM, RARE_P: RARE_P, TRAITS: TRAITS, NORMAL: NORMAL, RARE: RARE, get: get, name: name, isRare: isRare, roll: roll, trOf: trOf, fixTr: fixTr, text: text, count: count, canEngrave: canEngrave, engrave: engrave, open: open, shut: shut, inBattle: inBattle };
window.d2EngraveOpen = function () { open('doll'); };
window.d2Traits = function () {
    console.log('%c===== 🧸 특성 35 =====', 'color:#ffb74d; font-size:13px');
    console.table(Object.keys(TRAITS).map(function (k) { const t = TRAITS[k]; return { 번호: Number(k), 이름: t.n, 분류: t.cat, 희귀: t.rare ? '★' : '', 각인: t.eng ? '가능' : '불가', 효과: t.e.slice(0, 60), 횟수: t.c.slice(0, 30) }; }));
};
console.log('[🧸 2차] d2Traits() · d2EngraveOpen()');
})();
