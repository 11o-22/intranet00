// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 전투 코어 (순서 처리 · 피해 공식 · 상태변화 · 특성 발동 · 공통 출력문)
// bundles.json 마지막 묶음 — d2-skills.js 뒤 (D2 · D2SK · DOLL · PET 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 3단계
//   기획 탭 「최종 데미지」「순서 처리」「공통 규칙」「공통 출력문」 과 「특성」 의 전투 중 발동을 옮겼다.
//   ★ 6단계(2026-11-10) — 화면(doll-battle.js)이 이 엔진을 쓴다. 출몰 · 여정(여럿이) · 결투 모두.
//
// ■ 쓰는 법 — 되감기 가능한 한 턴
//   S = D2BT.start({ my: [인형 기록…], foe: [상대…], allies: [{ my, owner, code }…], auto: { B: true }, seed, mode })   전투 최초 B1 (등장 · 등장 특성)
//       allies 가 있으면 진영 C · D 가 A 와 함께 B 를 친다 — 여정(여럿이 · 동시 출전). S.order = ['A','C','D','B'] · S.allies.
//   r = D2BT.turn(S, { A: 행동, B: 행동, C: 행동, picks: [], seed })                      한 턴 전부 (-2 → +4 → P1 → +3 → +2/+1/0 → -1)
//       행동  { k: 'skill', no }  ·  { k: 'switch', idx }  ·  { k: 'item', item, idx, no }  ·  { k: 'rune', i } 먹인 룬으로 친다  ·  { k: 'rd', i } 룬으로 막는다  ·  { k: 'pass' } 아무것도 안 한다(포획 · 도망 턴)
//             (B 가 auto 면 B 행동은 엔진이 고른다 — D2BT.ai · 안 준 진영의 행동도 엔진이 고른다)
//       출력문 한 줄 { t, k, id, f: { 진영: [칸, HP, 최대] }, s, i, act, rk } — f 는 그 순간의 HP 스냅샷 (화면이 체력 바를 따라 그린다)
//       rk = 랭크가 바뀐 인형의 진영 (MSG-031~034 · 049 · 050 · 060) — 화면은 상대 진영의 랭크 변화를 보여 주지 않는다 (2026-11-10 사용자)
//       r.need = { pick: 'A', why: 'faint'|'baton', cands: [idx…] }  → 기절·바통 선택이 필요하면 S 는 그대로 두고 멈춘다.
//              선택을 picks 에 덧붙여 **같은 S 로 다시** turn() 을 부른다 (같은 seed → 같은 결과 · 그래서 되감기가 된다).
//       r.S     새 상태 (입력 S 는 안 건드린다) · r.log [{ t, k }] 이번 턴 출력문 · r.over { win: 'A'|'B' } · r.grow 전투 뒤 성장 (E1)
//   D2BT.ai(S, 'B')  상대 행동 고르기 (쓸 수 있는 기술 중 무작위 · 공격 둘 중 하나 우선)
//
// ■ 상태 S 는 그냥 자료 (함수 없음) — 그대로 저장 · 전송할 수 있다
//   S.turn · S.sides.A/B { units: [u…], act: 지금 나온 칸, decoy {hp,max}|null, nail 0~2, auto, switched(이번 턴), usedUtil(이번 턴), baton 예약 }
//   u { rec(기록 사본) · name · sp · el · lv · max · hp · st{atk,chm,def,sta,spd} · erase{k,v} · rank{7} · status 'poison'|'para'|'fox'|null · sc · trait · used{} … }
//   S.field { reverse {from,to}|null } · S.over · S.log(전체)
//
// ■ ★ 더블 배틀 (2:2 · 2026-11-12 사용자 「펫 전투 더블 추가」 — 1단계: 두 자리 · 대상 지정 · 빈자리 실패 · 다음 준비 단계 충원)
//   start({ dbl: true, my, foe }) — 자리마다 진영 하나: A(아군 왼쪽 · 3) · C(아군 오른쪽 · 4) · B(상대 왼쪽 · 1) · E(상대 오른쪽 · 2)
//     같은 편 두 자리는 인형 목록을 함께 쓴다 (sd.tk = 그 편 첫 진영 · units 는 같은 배열 — 복사한 뒤 link(S) 로 다시 잇는다)
//     sd.act 가 -1 이면 빈자리. S.dbl · S.allies ['A','C'] · S.foes ['B','E'] · S.order ['A','C','B','E']
//   행동에 tgt (진영 = 자리) — 공격기는 그 자리의 지금 인형 · 상대에게 거는 유틸기도 그 자리 인형 (1단계는 자리 이동이 없어 같다)
//     그 자리가 비었으면 「그러나 실패했다!」 · PP 는 이미 썼다 (DB06.2) · 상대(B · E)는 AI 가 살아 있는 자리를 고른다
//   기절하면 그 자리는 비워 두고(DB05.1) · 다음 턴 준비(-2.0)에 대기 인형으로 채운다 (A · C 는 고르기 — need · B · E 는 엔진)
//   한 편 인형이 다 쓰러지면 끝 (자리가 비어도 대기가 있으면 안 진다 · DB05.2)
//   ★ 2단계 (같은 날 「2단계도 이어서 · 끝까지 다」) — 기획 탭 「더블배틀 기술 · 특성」「순서 처리 10.3~10.6」「최종 데미지 12」
//     대상 지정(tgtKind · aim)  공격기 = 자리(그 자리의 지금 인형 · 나를 봐! 유도 먼저) · 상대에게 거는 유틸 = 인형(a.tgtKey — 자리를 옮겨도 따라가고 교체 · 기절이면 실패)
//                               옆자리 아군 인형(널 응원해! · 할 수 있어!) · 아홉여우병은 랭크 변화를 받을 아군 인형도 (a.tgt2 → foxTo)
//     범위 공격(attackRange · DB-A1~5)  자신 빼고 전원(145 · 153 · 155 · 157 · 159) · 상대 진영(146 · 154 · 156 · 158 · 160) — 느린 순으로 따로 판정 → 반사 → 네일팁 한 번
//     MD = 응원 1.3 × 확인 사살 1.2 × 불굴의 의지 1.5 · 무속성 기술은 MS = MT = 1 · 일회성 강화는 대상마다 제 조건으로 곱하고 공격 한 번에 한 번만 쓴다 (strike → spend)
//     나를 봐!(편 첫 자리의 lure — 쓴 턴만 · 기절 · 교체면 풀림) · 널 응원해!(u.cheer = 턴) · 자리 바꾸기(swapPos — 편마다 한 턴에 한 번 · swapTurn) · 자리잡기(특성 36 · seat — 등장 특성보다 먼저)
//     선제(+1) 안의 여섯 묶음 — 풀죽음 공격 → 자리 바꾸기 → 나를 봐! → 널 응원해! → 그 밖의 선제 유틸 → 일반 선제 공격 (prioOf)
//     자리를 옮긴 인형의 아직 안 한 행동은 인형을 따라간다 · 대타(희생양)는 자리에 남는다 · 네일팁은 편에
//   ★ 3단계 — 탐사자 둘 (start({ dbl, team: [{ code, owner, my }…] })): 탐사자당 한 자리(sd.own) · 제 인형만 낸다(bench) · 내보낼 인형이 없으면 물러나고 자리를 넘긴다(leaveCheck · S.crew)
//     싱글에도 같이 고친 것 (기획 본문이 바뀜) — 똑바로 붙어! 는 맞은 인형의 랭크만 0 · 경험치는 「한 번이라도 나왔고 끝까지 살아남은 인형」이 나눈다 (레벨링 5 · 9 · 10)
//
// ■ 규칙 ID 는 기획 그대로 (R0~R6 · A1.1~A7 · U1~U9 · S1~S5 · -1.1~-1.6 · -2.1~-2.3 · +5 · E1). 출력문은 MSG 번호 그대로.
//   피해  U = {[(0.4L+2)·P÷50]·[(A·RA+20)÷(B·RB+20)]}+2 · D = ⌈U·MS·MT·MO·MI·MG⌉ · 반동 ⌈ΔHP·0.25⌉ · 반사 ⌈ΔHP·0.5⌉(반사신경 0.75) · 독 ⌈최대÷16⌉
//   랭크 배율 r≥0 → (2+r)/2 · r<0 → 2/(2−r) · 회피 0/20/35/45/50/55/60%
//
// ■ 특성 35 — 전투 중 발동은 여기서 한다 (4단계는 이름표 · 뽑기 · 각인 UI). u.trait 가 번호(1~35) · 0 이면 없음.
//
// ■ 콘솔
//   d2Fight(내Lv, 상대Lv, 턴수)   무작위 인형 둘로 시연 — 출력문을 그대로 찍는다

(function d2battle() {
'use strict';

const K = function () { return window.D2SK; };
const C = function () { return window.D2; };
const DL = function () { return window.DOLL; };
const RANKS = ['atk', 'chm', 'def', 'sta', 'spd', 'acc', 'eva'];
const STATS5 = ['atk', 'chm', 'def', 'sta', 'spd'];
const EVA = [0, 20, 35, 45, 50, 55, 60];
const EL_NAME = { wet: '물', heat: '불', cold: '얼음', scent: '꽃', noise: '소리' };
const BEATS = { wet: 'heat', heat: 'cold', cold: 'scent', scent: 'noise', noise: 'wet' };
const ST_NAME = { poison: '독', para: '마비', fox: '아홉여우병' };
const TRAIT = { 1: '장난꾸러기', 2: '정밀함', 3: '기회주의', 4: '승부욕', 5: '독기', 6: '막판승부', 7: '절제', 8: '배짱', 9: '앙갚음', 10: '바통 장인',
    11: '성장통', 12: '준비만전', 13: '허세', 14: '재빠른 발', 15: '복수심', 16: '완충솜', 17: '털어내기', 18: '눈치', 19: '끈질김', 20: '반사신경',
    21: '회복체질', 22: '불굴', 23: '경계심', 24: '튼튼한 박음질', 25: '선봉장', 26: '허를 찌르기', 27: '낚시꾼', 28: '숨 고르기', 29: '위기감지', 30: '유언',
    31: '연쇄반응', 32: '전화위복', 33: '대역 인형', 34: '마지막 한 땀', 35: '고요한 심장', 36: '자리잡기' };
const ONCE = { 3: 1, 4: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 17: 1, 18: 1, 19: 1, 22: 1, 23: 1, 26: 1, 27: 1, 28: 1, 29: 1, 30: 1, 31: 1, 32: 1, 33: 1, 34: 1, 36: 1 };   // 전투당 1회

// ── 공통 출력문 (기획 번호 그대로 · {…} 치환 · 조사는 fix 가 맞춘다)
const MSG = {
    // ★ 더블 배틀 (기획에 따로 번호가 없는 안내 — 기존 출력 틀에 맞춘 글)
    d1: '{사용자}은/는 시선을 끌어모았다! 이번 턴 상대의 공격이 {사용자}에게 쏠린다!', d2: '공격이 {대상}에게 쏠렸다!',
    d3: '{사용자}은/는 {대상}을/를 응원했다! {대상}의 이번 턴 공격이 강해졌다!', d4: '{사용자}은/는 옆자리로 자리를 옮겼다!', d5: '{대상}에게는 공격이 빗나갔다!',
    1: '{사용자}의 {기술명}!', 2: '그러나 실패했다!', 3: '{사용자}은/는 풀죽어서 움직이지 못했다!', 4: '그러나 아직 지쳐서 움직이지 못했다!', 5: '{사용자}은/는 몸이 마비되어 움직이지 못했다!',
    7: '{사용자}은/는 사용할 수 있는 기술을 전부 써버렸다.\n하는 수 없이…… 발버둥!',
    8: '{대상}은/는 공격을 막아냈다!', 9: '그러나 공격이 빗나갔다!', 10: '{대상}은/는 공격을 피했다!', 11: '그러나 효과가 없었다!',
    13: '{대상}은/는 {수치}의 피해를 입었다!', 14: '{사용자}은/는 반동으로 {수치}의 피해를 입었다!', 15: '{사용자}은/는 되돌아온 공격으로 {수치}의 피해를 입었다!',
    16: '{대상}의 HP가 {수치} 회복되었다!', 17: '{대상}의 HP는 이미 가득 차 있다!', 18: '{대상}은/는 간신히 버텨냈다!', 19: '{대상}의 HP가 1이 되었다!',
    20: '{대상}은/는 일격에 쓰러졌다!', 21: '{대상}은/는 더 이상 움직일 수 없다!', 22: '전투에서 승리했다!', '22b': '전투에서 패배했다!',
    23: '{대상}은/는 {상태이상} 상태가 되었다!', 24: '{대상}은/는 독으로 {수치}의 피해를 입었다!', 25: '{대상}의 {상태이상}이/가 해제되었다!', 26: '{사용자}은/는 다시 힘을 냈다!',
    27: '{사용자}은/는 다음 공격에 집중했다!', 28: '{사용자}의 집중이 풀렸다!', 29: '{사용자}은/는 재빠르게 움직일 준비를 했다!', 30: '{사용자}의 {효과명} 효과가 끝났다!',
    31: '{대상}의 {능력치}이/가 증가했다!', 32: '{대상}의 {능력치}이/가 감소했다!', 33: '그러나 {대상}의 {능력치}은/는 더 이상 오를 수 없다!', 34: '{대상}의 {능력치}은/는 더 내려갈 수 없다!',
    35: '{사용자}의 특성 「{특성명}」 발동!', 36: '{사용자}의 「{특성명}」에 의해 효과가 무효가 되었다!',
    37: '{사용자}을/를 불러들였다!', 38: '{사용자}이/가 나왔다!', 39: '{사용자}은/는 다음 인형에게 마음을 전할 준비를 했다!',
    40: '{사용자}은/는 경험치 {수치}을/를 얻었다!', 41: '{사용자}의 레벨이 {레벨}이/가 되었다!', 42: '각성 돌파가 필요하다!', 43: '{사용자}의 {능력치} 노력치가 {수치} 증가했다!',
    44: '{사용자}은/는 공격을 막을 준비를 했다!', 45: '{사용자}은/는 공격을 받아칠 자세를 잡았다!', 46: '{사용자}은/는 마지막 실 한 올로 몸을 붙들었다!', 47: '{사용자}은/는 힘을 쏟아 다음 턴에는 쉬어야 한다!',
    48: '{사용자}의 다음 공격이 강해졌다!', 49: '{대상}의 능력치 랭크가 모두 원래대로 돌아갔다!', 50: '{대상}은/는 앞선 인형의 랭크와 남은 강화 효과를 이어받았다!',
    51: '{사용자}은/는 지금 사용할 수 있는 기술이 없다.\n하는 수 없이…… 발버둥!',
    52: '{사용자}은/는 자신의 HP를 {수치} 내어주었다!', 53: '{진영}에 HP {수치}의 대타가 나타났다!', 54: '이미 대타가 나와 있다!', 55: '{진영}의 대타가 대신 {수치}의 피해를 입었다!',
    56: '{진영}의 대타가 일격을 대신 받았다!', 57: '{진영}의 대타가 사라졌다!', 58: '{사용자}은/는 {대상}의 능력치에서 지울 차이를 찾아냈다!', 59: '{대상}의 {능력치} 수치가 {적용값}이/가 되었다!',
    60: '아홉여우병으로 랭크 변화가 {대상}에게 옮겨갔다!', 61: '{진영}에 나비 네일팁이 뿌려졌다! ({중첩수}/2)', 62: '{사용자}은/는 나비 네일팁에 찔려 {수치}의 피해를 입었다!',
    63: '{대상}의 특성: {특성명}\n특기 개체치: {특기1}, {특기2}',
    64: '다음 턴부터 2턴간 느린 인형이 먼저 움직인다!', 65: '황룡의 계약으로 행동 순서가 뒤바뀌었다!', 66: '{효과명} 효과가 끝났다!',
    67: '{대상}은/는 다음 턴부터 2턴간 유틸기만 쓸 수 있다!', 68: '{대상}은/는 유틸기만 사용할 수 있게 되었다!', 69: '{대상}은/는 다음 턴부터 마지막으로 쓴 기술만 반복해야 한다!', 70: '{대상}은/는 2턴간 {제한기술명}만 사용할 수 있게 되었다!',
    71: '양초의 불빛이 {결과명}의 힘을 비추었다!', 72: '{사용자}은/는 도넛을 먹기 시작했다!', 73: '이미 먹고 있다!', 74: '무대의 막이 내려가기 시작했다!', 75: '{대상}에게 남은 턴: {남은턴}', 76: '{사용자}의 카운트다운이 취소되었다!',
    80: '{대상}에게 {아이템명}을/를 사용했다!', 81: '{대상}의 {기술명} PP가 {수치} 회복되었다!', 82: '{대상}은/는 HP {회복후HP}로 다시 움직일 수 있게 되었다!', 91: '{대상}의 훈련이 {횟수}회의 유효 행동 동안 2배로 기록된다!', 93: '{대상}의 훈련 보조가 끝났다!', 94: '다음으로 내보낼 인형을 선택해 주세요.', 112: '더 이상 경험치를 보관할 수 없다!', 113: '카운트다운은 이미 시작되고 있다!'
};
// 조사 — 마지막 글자의 받침 (숫자 · 영문도)
function jong(s) {
    s = String(s || ''); if (!s) return false;
    const ch = s[s.length - 1], c = ch.charCodeAt(0);
    if (c >= 0xAC00 && c <= 0xD7A3) return ((c - 0xAC00) % 28) !== 0;
    if (ch >= '0' && ch <= '9') return '0136789'.indexOf(ch) >= 0 ? (ch !== '9' && ch !== '2' && ch !== '4' && ch !== '5') : false;
    if (/[a-zA-Z]/.test(ch)) return 'lmnrLMNR'.indexOf(ch) >= 0;
    return false;
}
function fix(t) { return String(t).replace(/(\S)(은\/는|이\/가|을\/를|과\/와|으로\/로|이\/×)/g, function (m, ch, p) { const j = jong(ch); const a = p.split('/'); return ch + (j ? a[0] : a[1]); }); }
function fmt(id, v) { let t = MSG[id] || String(id); v = v || {}; Object.keys(v).forEach(function (k) { t = t.split('{' + k + '}').join(String(v[k])); }); return fix(t); }

// ── 난수 (D2.rngOf 와 같은 씨앗 방식)
function rngOf(seed) { return C().rngOf(seed); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function ceil(v) { return Math.ceil(v - 1e-9); }
function copy(o) { return JSON.parse(JSON.stringify(o)); }
function rankMul(r) { return r >= 0 ? (2 + r) / 2 : 2 / (2 - r); }
// ── 진영 — A(나) · B(상대) 가 기본. 여정(여럿이)은 동료 진영 C · D 가 A 와 함께 B 를 친다 (6단계 · 2026-11-10 사용자 「동시 출전」)
//   S.order  모든 진영 차례 ['A','C','D','B'] · S.allies ['A','C','D'] · S.tgt  B 가 이번 행동에서 노리는 아군 진영
//   other(S, s) — 아군 진영이면 'B', B 면 지금 노리는 아군 진영 (없으면 살아 있는 첫 아군)
function allies(S) { return S.allies || ['A']; }
function foes(S) { return S.foes || ['B']; }
function isFoe(S, s) { return foes(S).indexOf(s) >= 0; }
function tkOf(S, s) { const sd = S.sides[s]; return (sd && sd.tk) || s; }              // 더블 — 같은 편 두 자리가 함께 쓰는 진영 (목록 · 네일팁 · 만남 기록)
// 더블 — 복사(JSON)하면 같은 편 두 자리의 인형 목록이 따로 갈라진다 → 첫 자리 것으로 다시 잇는다
function link(S) {
    if (!S || !S.dbl || !S.sides) return S;
    Object.keys(S.sides).forEach(function (s) { const sd = S.sides[s], t = sd && sd.tk; if (t && t !== s && S.sides[t]) sd.units = S.sides[t].units; });
    return S;
}
function sideOf(S, u) {
    const o = S.order || ['A', 'B'];
    if (S.dbl) { for (let i = 0; i < o.length; i++) if (cur(S, o[i]) === u) return o[i]; }
    for (let i = 0; i < o.length; i++) if (S.sides[o[i]].units.indexOf(u) >= 0) return o[i];
    return 'A';
}
function liveAllies(S) { return allies(S).filter(function (s) { return !S.sides[s].out && alive(cur(S, s)); }); }
function other(S, s) {
    if (S.dbl) {
        if (S.atk && S.atk.s === s && S.atk.tgt) return S.atk.tgt;                     // 지금 하는 행동이 고른 자리
        const os = isFoe(S, s) ? allies(S) : foes(S);
        return os.filter(function (x) { return alive(cur(S, x)); })[0] || os[0];
    }
    if (s !== 'B') return 'B';
    if (S.tgt && !S.sides[S.tgt].out && alive(cur(S, S.tgt))) return S.tgt;
    const la = liveAllies(S); return la.length ? la[0] : allies(S)[0];
}
// 상대편에 나와 있는 인형들 (B 에게는 아군 전부 · 아군에게는 B 하나)
function oppUnits(S, s) {
    if (S.dbl) return (isFoe(S, s) ? allies(S) : foes(S)).map(function (x) { return cur(S, x); }).filter(alive);
    if (s !== 'B') return [cur(S, 'B')].filter(alive); return liveAllies(S).map(function (x) { return cur(S, x); });
}
function fieldUnits(S) { return (S.order || ['A', 'B']).filter(function (s) { return !S.sides[s].out; }).map(function (s) { return cur(S, s); }).filter(alive); }
// B 의 표적 — 살아 있는 아군 진영 가운데 무작위 (전에 고른 것이 아직 서 있으면 그대로)
function pickTgt(S, rng) {
    const la = liveAllies(S);
    if (!la.length) return null;
    if (S.tgt && la.indexOf(S.tgt) >= 0 && S.tgtTurn === S.turn) return S.tgt;
    S.tgt = la.length === 1 ? la[0] : la[Math.floor(rng() * la.length)]; S.tgtTurn = S.turn;
    return S.tgt;
}
function sideName(S, s) { return isFoe(S, s) ? '상대 진영' : '아군 진영'; }
function rankName(k) { return K().RANK_NAME[k] || k; }
// 💠 속성 룬 — 먹인 룬으로 친다 (옛 출몰 전투의 룬 공격 · 2026-11-10 사용자 「전투 행동으로 유지」)
//   위력 60 · 필중 · 무속성(속성 상성 · 자속 보정 없음) · 물리 · PP 없음 · 룬 상성(애교 › 근력 › 경청 › 인내 › 눈치 › 애교)으로 막으면 피해 1/3
const RUNE_BEATS = { '애교': '근력', '근력': '경청', '경청': '인내', '인내': '눈치', '눈치': '애교' };
const RUNE_PW = 60;
function runeSk(name) { return { no: 'rune', n: '💠 ' + name + ' 룬', slot: 'A', pp: null, pw: RUNE_PW, acc: 'sure', kind: 'phys', pri: 0, tgt: 'foe', el: 'none', cat: '공격', fx: {}, rune: name }; }
function runesOf(u) { const r = u.runes; return Array.isArray(r) ? r.filter(Boolean) : (r && typeof r === 'object') ? Object.keys(r).sort().map(function (k) { return r[k]; }).filter(Boolean) : []; }
function skOf(a) { if (a.sk) return a.sk; return a.no === 'rune' ? runeSk(a.rune || '') : K().get(a.no); }

// ==========================================
// 개체 만들기
// ==========================================
function unitOf(rec, opt) {
    opt = opt || {};
    const D2 = C(), SK = K();
    const s = D2.statsOf(rec);
    const mv = SK.mvOf(rec);
    const pp = {}; mv.a.concat(mv.u).forEach(function (no) { if (no) pp[no] = SK.ppOf(rec, no); });
    const name = opt.name || (function () { try { return DL().nickOf(rec); } catch (e) { return rec.nick || ('인형' + (rec.id || '')); } })();
    let el = opt.el || rec.att; try { if (!el) el = DL().attOf(rec); } catch (e) { } if (!EL_NAME[el]) el = 'wet';
    return {
        key: rec.id != null ? String(rec.id) : null, name: name, sp: rec.sp || null, el: el, lv: s.lv, max: s.max, hp: clamp(rec.hp != null ? Math.floor(rec.hp) : s.max, 0, s.max),
        st: { atk: s.atk, chm: s.chm, def: s.def, sta: s.sta, spd: s.spd }, erase: null,
        rank: { atk: 0, chm: 0, def: 0, sta: 0, spd: 0, acc: 0, eva: 0 },
        status: (rec.st && ST_NAME[rec.st.k]) ? rec.st.k : null, sc: (rec.st && rec.st.c) | 0,
        mv: mv, pp: pp, trait: opt.trait != null ? opt.trait : (window.D2TR ? window.D2TR.trOf(rec) : ((rec.tr | 0) || 0)), used: {},   // 특성 — 기록 없으면 d2-traits 의 결정적 값
        dark: !!opt.dark, rec: { lv: s.lv, xp: rec.xp | 0, g: rec.g || s.g, iv: rec.iv, pr: rec.pr, ev: rec.ev, at: rec.at, id: rec.id, sp: rec.sp, att: el },
        guard: null, guardFired: false, guardLast: false, restUntil: 0, focus: false, calmTurn: 0, prio3: 0, baton: false, boost: [], flinch: false, flinchUsed: false, chainUsed: false,
        donut: false, show: null, limit: null, pendLimit: null, pendErase: null, enteredTurn: 0, enteredBy: '', lastMove: 0, fainted: false, evN: { atk: 0, chm: 0, def: 0, sta: 0, spd: 0 }, met: {}, aid: Math.max(0, rec.aid | 0), dope: { atk: 0, chm: 0, def: 0, sta: 0, spd: 0, acc: 0, eva: 0 },
        runes: runesOf(rec), runeGuard: null, g: rec.g || s.g, art: !!opt.art,
        own: opt.own || null, cheer: 0, focusOn: null, foxTo: null       // 더블 — 주인(사번) · 널 응원해!(턴) · 집중 대상 · 아홉여우병 수신 인형
    };
}
// 상대(야생 · 괴담) — spec { name, lv, el, g, pr, iv, mv:{a,u}, trait, dark, hp }
function foeOf(spec, rng) {
    const D2 = C(), SK = K();
    const rec = spec.rec || D2.mk(spec.lv || 5, { rng: rng, pr: spec.pr, iv: spec.iv });
    rec.id = spec.id || null; rec.sp = spec.sp || null; if (rec.at == null) rec.at = 0; rec.att = spec.el || rec.att || (function () { const ks = Object.keys(EL_NAME); return ks[Math.floor((rng || Math.random)() * ks.length)]; })();
    if (spec.mv) rec.mv = spec.mv; else if (!rec.mv) { const f = SK.fixMv(Object.assign({ id: spec.id || 'foe' }, rec), rng); rec.mv = f.mv; rec.pp = f.pp; }
    if (spec.hp != null) rec.hp = spec.hp;
    const u = unitOf(rec, { name: spec.name || '따라쟁이 봉제인형', el: rec.att, trait: spec.trait || 0, dark: !!spec.dark, art: !!spec.art });
    if (spec.hpMul && spec.hpMul > 0) { u.max = ceil(u.max * spec.hpMul); u.hp = spec.hp != null ? Math.min(u.max, u.hp) : u.max; }   // 여럿이 치는 괴담은 더 질기다
    if (spec.mon != null) { u.mon = spec.mon; u.boss = !!spec.boss; }    // 괴담 — 화면이 그림을 고른다 (더블은 둘이 함께 나온다)
    return u;
}
function cur(S, s) { const sd = S.sides[s]; return (sd && sd.act >= 0) ? sd.units[sd.act] : undefined; }
function alive(u) { return !!u && !u.fainted && u.hp > 0; }
function bench(S, s) {
    const sd = S.sides[s];
    // 더블 — 같은 편의 다른 자리에 나와 있는 인형도 대기가 아니다 (DB04.3) · 자리 주인의 인형만 (DB01.2 · 탐사자는 자기 인형만 낸다)
    const on = {}; if (S.dbl) (S.order || []).forEach(function (x) { if (tkOf(S, x) === tkOf(S, s)) { const y = S.sides[x]; if (y.act >= 0 && alive(y.units[y.act])) on[y.act] = 1; } });
    const own = S.dbl ? (sd.own || null) : null;
    return sd.units.map(function (u, i) { return i; }).filter(function (i) { return i !== sd.act && !on[i] && alive(sd.units[i]) && (!S.dbl || (sd.units[i].own || null) === own); });
}
// 한 편(같은 목록)에 살아 있는 인형이 있나 — 더블 승패 (DB05.2)
function teamAlive(S, s) { return S.sides[tkOf(S, s)].units.some(alive); }
function teamAliveCount(S, s) { return S.sides[tkOf(S, s)].units.filter(alive).length; }
// ── 더블 — 같은 편 자리들 · 옆자리 · 상대 자리들 · 인형 열쇠(편:칸 — 자리를 옮겨도 그 인형을 가리킨다)
function teamSides(S, s) { return (S.order || []).filter(function (x) { return tkOf(S, x) === tkOf(S, s); }); }
function mateSide(S, s) { if (!S.dbl) return null; return teamSides(S, s).filter(function (x) { return x !== s; })[0] || null; }
function oppSides(S, s) { return (S.order || ['A', 'B']).filter(function (x) { return isFoe(S, x) !== isFoe(S, s); }); }
function ukey(S, s, idx) { return tkOf(S, s) + ':' + idx; }
function ukeyOfUnit(S, u) { const o = S.order || []; for (let i = 0; i < o.length; i++) { const j = S.sides[o[i]].units.indexOf(u); if (j >= 0) return tkOf(S, o[i]) + ':' + j; } return null; }
//   그 인형이 지금 서 있는 자리 (나와 있고 살아 있을 때만 · 아니면 null — 교체 · 기절)
function sideOfKey(S, key) {
    if (!key) return null;
    const p = String(key).split(':'), idx = Number(p[1]), o = S.order || [];
    for (let i = 0; i < o.length; i++) if (tkOf(S, o[i]) === p[0] && S.sides[o[i]].act === idx && alive(cur(S, o[i]))) return o[i];
    return null;
}
// 대기 인형 — 주인을 가리지 않고 (괜찮습니다, 제가 할게요 · 아이템)
function benchTeam(S, s) {
    const sd = S.sides[s], on = {};
    teamSides(S, s).forEach(function (x) { const y = S.sides[x]; if (y.act >= 0 && alive(y.units[y.act])) on[y.act] = 1; });
    return sd.units.map(function (u, i) { return i; }).filter(function (i) { return !on[i] && alive(sd.units[i]); });
}
// 나를 봐! — s 가 치려 할 때 상대편에 살아 있는 유도자가 있으면 그 자리 (DB07.1)
function lureOf(S, s) {
    if (!S.dbl) return null;
    const os = oppSides(S, s); if (!os.length) return null;
    const T = S.sides[tkOf(S, os[0])], L = T && T.lure;
    if (!L || L.turn !== S.turn) return null;
    return sideOfKey(S, tkOf(S, os[0]) + ':' + L.idx);
}
function base(u, k) { return (u.erase && u.erase.k === k) ? u.erase.v : u.st[k]; }
function eff(u, k) { return base(u, k) * rankMul(u.rank[k]); }
function speed(u) { return eff(u, 'spd'); }
// 출력문 한 줄 — 화면이 그 순간의 HP 를 따라 그리도록 나와 있는 인형들의 HP 스냅샷(f)을 같이 적는다 { 진영: [칸, HP, 최대] }
function snap(S) { const o = {}; (S.order || ['A', 'B']).forEach(function (s) { const sd = S.sides[s], u = sd.act >= 0 ? sd.units[sd.act] : null; if (u) o[s] = [sd.act, u.hp, u.max]; }); return o; }
function log(S, id, v, kind, meta) { const t = fmt(id, v); const e = Object.assign({ t: t, k: kind || 'msg', id: id, f: snap(S) }, meta || {}); S.log.push(e); S.tlog.push(e); }
function say(S, t, kind, meta) { const e = Object.assign({ t: t, k: kind || 'sys', f: snap(S) }, meta || {}); S.log.push(e); S.tlog.push(e); }

// 특성 — 가졌나 · 전투당 1회 소모
function has(u, no) { return u.trait === no; }
function canUse(u, no) { return has(u, no) && !(ONCE[no] && u.used[no]); }
function fire(S, u, no) { if (ONCE[no]) u.used[no] = 1; log(S, 35, { 사용자: u.name, 특성명: TRAIT[no] }, 'trait'); }

const STOP = { stop: 1 }, NEED = { need: 1 };

// ── 유효 훈련 — 한 행동에 능력치마다 최대 1회 · 훈련 보조(aid)가 남아 있으면 2회로 적고 보조 1 소모 (노력치 21 · 아이템 08)
function credit(S, u, keys) {
    const ks = Object.keys(keys || {}).filter(function (k) { return keys[k] && STATS5.indexOf(k) >= 0; });
    if (!ks.length) return;
    const two = u.aid > 0;
    ks.forEach(function (k) { u.evN[k] += two ? 2 : 1; });
    if (two) { u.aid--; if (u.aid === 0) log(S, 93, { 대상: u.name }); }
}
function dopeClear(u) { RANKS.forEach(function (k) { u.dope[k] = 0; }); }

// ==========================================
// 랭크 변화 (U5 · A6 · T2) — 돌려주는 값은 실제 변화량
//   src: 'self' | 'foe' (상대에 의한 하락인가) · byUnit: 원인 인형 · quiet: 문구 없이(바통 대입 등은 쓰지 않는다 — 대입은 따로)
// ==========================================
function rankChange(S, u, k, n, src, opt) {
    opt = opt || {};
    if (!alive(u) || !n) return 0;
    const so = sideOf(S, u);
    // T2 — 상대에 의한 하락: 배짱(무효) → 승부욕 · 앙갚음
    if (n < 0 && src === 'foe') {
        if (canUse(u, 8)) { fire(S, u, 8); log(S, 36, { 사용자: u.name, 특성명: TRAIT[8] }); return 0; }
    }
    const lo = k === 'eva' ? 0 : -6, hi = 6;
    const was = u.rank[k], now = clamp(was + n, lo, hi), d = now - was;
    if (d === 0) {
        log(S, n > 0 ? 33 : 34, { 대상: u.name, 능력치: rankName(k) }, 'msg', { rk: so });
        return 0;
    }
    u.rank[k] = now;
    if (d < 0 && u.dope && u.dope[k] > 0) u.dope[k] = Math.max(0, u.dope[k] + d);        // 하락은 도핑 몫부터 (아이템 08)
    if (opt.dope && d > 0) u.dope[k] += d;
    log(S, d > 0 ? 31 : 32, { 대상: u.name, 능력치: rankName(k) }, 'msg', { rk: so });
    if (d < 0 && src === 'foe') {
        if (canUse(u, 4)) { fire(S, u, 4); rankChange(S, u, 'atk', 1, 'self', { trait: 1 }); }
        if (canUse(u, 9)) { fire(S, u, 9); const f = (opt.by && alive(opt.by)) ? opt.by : cur(S, other(S, so)); if (alive(f)) rankChange(S, f, 'spd', -1, 'foe', { trait: 1, by: u }); }   // 원인이 된 그 상대에게만
    }
    // 아홉여우병 — 대상의 실제 변화를 병을 옮긴 쪽의 필드 인형에게 (복사된 것은 다시 복사하지 않는다)
    if (u.status === 'fox' && !opt.copied && (u.foxBy || u.foxTo)) {
        // 더블 — 지정한 아군 인형에게만 (자리를 옮겨도 따라간다 · 필드에 없거나 기절했으면 복사하지 않는다)
        const ts = u.foxTo ? sideOfKey(S, u.foxTo) : null;
        const t = u.foxTo ? (ts ? cur(S, ts) : null) : cur(S, u.foxBy);
        if (alive(t) && t !== u) { log(S, 60, { 대상: t.name }, 'msg', { rk: sideOf(S, t) }); rankChange(S, t, k, d, 'self', { copied: 1 }); }
    }
    return d;
}
function resetRanks(u) { RANKS.forEach(function (k) { u.rank[k] = 0; }); }

// ==========================================
// 기절 (+5) · 교체 (S1~S5)
// ==========================================
function clearTemp(u) { u.cheer = 0; u.focusOn = null; dopeClear(u); u.guard = null; u.guardFired = false; u.focus = false; u.prio3 = 0; u.boost = []; u.flinch = false; u.donut = false; u.show = null; u.limit = null; u.pendLimit = null; u.baton = false; u.restUntil = 0; u.calmTurn = 0; resetRanks(u); }
function faint(S, u, cause) {
    cause = cause || {};
    if (u.fainted) return;
    u.hp = 0; u.fainted = true;
    const s = sideOf(S, u), sd = S.sides[s];
    log(S, 21, { 대상: u.name }, 'faint', { s: s, i: sd.units.indexOf(u) });
    clearTemp(u);
    // 이 인형이 건 예약 취소 — 상대에게 건 삭제 예약
    (S.order || ['A', 'B']).forEach(function (x) { if (x === s) return; S.sides[x].units.forEach(function (y) { if (y.pendErase && y.pendErase.by === u.key + '@' + s) y.pendErase = null; }); });
    sd.lastFaint = { turn: S.turn, by: cause.k || '', will: !S.dbl && has(u, 30) && cause.k === 'destiny' };
    if (S.dbl) {                                                        // 더블 — 자리는 비워 두고 다음 턴 준비에 채운다 (DB05.1~3)
        goneFx(S, u);                                                   // 나를 봐! 해제 · 이 인형을 겨눈 집중 해제
        if (has(u, 30) && cause.k === 'destiny') S.sides[tkOf(S, s)].will = { name: u.name };   // 유언 — 이 편에 다음으로 실제 등장하는 인형에게 (DB-D3)
        if (isFoe(S, s)) { if (!foes(S).some(function (x) { return teamAlive(S, x); })) { S.over = { win: 'A' }; log(S, 22, {}, 'over'); throw STOP; } }
        else if (!allies(S).some(function (x) { return teamAlive(S, x); })) { S.over = { win: 'B' }; log(S, '22b', {}, 'over'); throw STOP; }
        leaveCheck(S);                                                  // 내보낼 인형이 없는 탐사자는 물러나고 자리를 넘긴다 (DB5.5)
        return;
    }
    if (!bench(S, s).length) {
        if (s === 'B') { S.over = { win: 'A' }; log(S, 22, {}, 'over'); throw STOP; }
        sd.out = true;                                                  // 이 아군 진영은 다 쓰러졌다
        if (!liveAllies(S).length) { S.over = { win: 'B' }; log(S, '22b', {}, 'over'); throw STOP; }
        if (allies(S).length > 1) say(S, (sd.owner || '동료') + ' 사원의 봉제인형이 모두 지쳤다.', 'sys', { s: s });
        return;
    }
    enterPick(S, s, 'faint');
}
// ── 더블 — 인형이 필드를 떠났다 (기절 · 실제 교체): 나를 봐! 해제 · 이 인형을 겨눈 집중 해제 (DB07.1 · 기술 56)
function goneFx(S, u) {
    if (!S.dbl) return;
    const k = ukeyOfUnit(S, u); if (!k) return;
    const tk = k.split(':')[0], T = S.sides[tk];
    if (T && T.lure && tk + ':' + T.lure.idx === k) T.lure = null;
    (S.order || []).forEach(function (x) { const y = cur(S, x); if (alive(y) && y.focus && y.focusOn === k) { y.focus = false; y.focusOn = null; log(S, 28, { 사용자: y.name }); } });
}
// ── 더블 — 탐사자 이탈 · 자리 양도 (DB03.2~3 · DB5.5): 내보낼 인형이 없는 탐사자의 자리는 같은 편에 남은 탐사자에게. 새 인형은 다음 준비 단계에.
function crewAlive(S, c) { return S.sides.A.units.some(function (u) { return (u.own || null) === (c.code || null) && alive(u); }); }
function leaveCheck(S) {
    if (!S.dbl || !S.crew || S.crew.length < 2) return;
    S.crew.forEach(function (c) {
        if (c.out || crewAlive(S, c)) return;
        const rest = S.crew.filter(function (x) { return x !== c && !x.out && crewAlive(S, x); });
        if (!rest.length) return;
        c.out = true;
        const to = rest[0];
        let moved = false;
        allies(S).forEach(function (x) { const sd = S.sides[x]; if ((sd.own || null) === (c.code || null)) { sd.own = to.code || null; sd.code = to.code || null; sd.owner = to.name || null; sd.auto = !!to.auto; moved = true; } });
        say(S, (c.name || '동료') + ' 사원의 봉제인형이 모두 지쳤다.' + (moved ? ' 그 자리는 ' + (to.name || '동료') + ' 사원이 맡는다.' : ''), 'sys', { leave: c.code || null });
    });
}
//   물러났던 탐사자의 인형이 되살아났다 (아이템) — 그 편에 주인이 둘을 맡은 빈자리가 있으면 돌려받는다
function reown(S) {
    if (!S.dbl || !S.crew || S.crew.length < 2) return;
    S.crew.forEach(function (c) {
        if (!c.out || !crewAlive(S, c)) return;
        const sides = allies(S);
        const empty = sides.filter(function (x) { return !alive(cur(S, x)) && (S.sides[x].own || null) !== (c.code || null) && sides.filter(function (y) { return (S.sides[y].own || null) === (S.sides[x].own || null); }).length > 1; })[0];
        if (!empty) return;
        c.out = false;
        const sd = S.sides[empty]; sd.own = c.code || null; sd.code = c.code || null; sd.owner = c.name || null; sd.auto = !!c.auto;
        say(S, (c.name || '동료') + ' 사원이 다시 자리를 맡았다.', 'sys');
    });
}
// 선택 — auto 면 엔진이 고르고, 아니면 picks 에서 꺼낸다. 없으면 NEED. (in.autoPick — 기다리다 지쳤으면 엔진이 첫 후보로)
function enterPick(S, s, why, opt) {
    const sd = S.sides[s], cands = bench(S, s);
    let idx;
    if (sd.auto) idx = cands[0];
    else {
        const q = S.in.picks || [];
        const p = q.length > S.pickAt ? q[S.pickAt] : null;
        if (p == null) {
            if (S.in.autoPick) idx = cands[0];
            else { S.need = { pick: s, why: why, cands: cands }; throw NEED; }
        } else { S.pickAt++; idx = cands.indexOf(Number(p)) >= 0 ? Number(p) : cands[0]; }
    }
    if (!sd.auto) log(S, 94, {}, 'ui', { s: s });
    enter(S, s, idx, why, null, opt);
}
// S3~S5 등장 · 등장 특성 — opt.hold 면 세우기만 하고 등장 특성은 부르는 쪽이 모아서 (더블 진입 · 충원 — 자리잡기 먼저 · DB6.3~4 · -2.0.3~4)
function enter(S, s, idx, why, carry, opt) {
    const sd = S.sides[s]; sd.act = idx;
    const u = sd.units[idx];
    u.enteredTurn = S.turn; u.enteredBy = why; u.flinchUsed = false;
    log(S, 38, { 사용자: u.name }, 'enter', { s: s, i: idx });
    if (carry) {               // 바통 계승
        RANKS.forEach(function (k) { u.rank[k] = carry.rank[k]; });
        u.boost = carry.boost.slice(); u.focus = carry.focus; u.focusOn = carry.focusOn || null; u.prio3 = carry.prio3;
        if (RANKS.some(function (k) { return carry.rank[k]; }) || carry.boost.length || carry.focus || carry.prio3) log(S, 50, { 대상: u.name }, 'msg', { rk: s });
        if (carry.masterTrait) { log(S, 35, { 사용자: carry.masterName, 특성명: TRAIT[10] }, 'trait'); rankChange(S, u, 'spd', 1, 'self'); }
    }
    // 상대의 집중은 대상이 바뀌면 풀린다 (더블은 겨눈 인형이 떠날 때 goneFx 가 푼다) · 만남 기록
    const meet = function () {
        const sn = sideOf(S, u);
        oppUnits(S, sn).forEach(function (f) {
            if (!S.dbl && f.focus && why !== 'first') { f.focus = false; log(S, 28, { 사용자: f.name }); }
            const fs = sideOf(S, f);
            u.met[tkOf(S, fs) + ':' + S.sides[fs].act] = u.lv; f.met[tkOf(S, sn) + ':' + idx] = f.lv;
        });
    };
    if (opt && opt.hold) { meet(); return; }
    seat(S, u);                                                         // ★ 자리잡기 — 다른 등장 특성보다 먼저
    entryTraits(S, sideOf(S, u), u, why);
    meet();
}
// ★ 자리잡기 (특성 36) — 등장 시 옆자리와 맞바꾼다 (비어 있어도) · 전투당 1회 · 더블만 (싱글은 옆자리가 없어 그대로)
function seat(S, u) {
    if (!S.dbl || !alive(u) || !canUse(u, 36)) return false;
    const s = sideOf(S, u), m = mateSide(S, s);
    if (!m || cur(S, s) !== u) return false;
    fire(S, u, 36);
    swapPos(S, s, m, u);
    return true;
}
//   여럿이 한꺼번에 — 속도 높은 순 → 레벨 높은 순 → 무작위 (DB6.3 · -2.0.3)
function bySpeedDesc(us, rng) { return us.map(function (u) { return { u: u, r: rng() }; }).sort(function (a, b) { return (speed(b.u) - speed(a.u)) || (b.u.lv - a.u.lv) || (a.r - b.r); }).map(function (x) { return x.u; }); }
function seatAll(S, us, rng) { bySpeedDesc(us.filter(function (u) { return alive(u) && canUse(u, 36); }), rng).forEach(function (u) { seat(S, u); }); }
function entryAll(S, us, why, rng) { bySpeedDesc(us.filter(alive), rng).forEach(function (u) { const s = sideOf(S, u); if (cur(S, s) === u) entryTraits(S, s, u, why); }); }
// ★ 두 자리를 맞바꾼다 (자리 바꾸기 152 · 자리잡기 36 · DB04.1~2) — 교체 · 등장이 아니다: HP · PP · 상태 · 랭크 · 예약은 인형을 따라간다
//   인형 · 자리 주인 · 그 인형의 이번 턴 기록(유틸 사용 · 완전 방어 · 꿈 잇기 예약)이 함께 옮겨 가고, 빈자리의 기절 원인 기록도 그 빈자리를 따라간다
//   대타(희생양)는 자리에 남는다 (DB06.3)
function swapPos(S, a, b, u) {
    const x = S.sides[a], y = S.sides[b];
    ['act', 'own', 'code', 'owner', 'auto', 'batonDue', 'usedUtil', 'guard1Turn', 'lastFaint'].forEach(function (k) {
        const t = x[k] === undefined ? null : x[k]; x[k] = y[k] === undefined ? null : y[k]; y[k] = t;
    });
    log(S, 'd4', { 사용자: u.name }, 'swap', { a: a, b: b });
}
// S4 등장 특성 — 준비만전 · 재빠른 발 · 허세 · 복수심 · 유언(앞 인형)
function entryTraits(S, s, u, why) {
    const sd = S.sides[s];
    if (canUse(u, 12)) { fire(S, u, 12); rankChange(S, u, 'acc', 1, 'self'); }
    if (canUse(u, 14)) { fire(S, u, 14); rankChange(S, u, 'spd', 1, 'self'); }
    if (canUse(u, 13)) {
        const fs = S.dbl ? oppUnits(S, s) : [cur(S, other(S, s))].filter(alive);               // 더블 — 나와 있는 상대 모두
        if (fs.length) { fire(S, u, 13); fs.forEach(function (f) { rankChange(S, f, 'atk', -1, 'foe', { by: u }); }); }
    }
    if (why === 'faint' && sd.lastFaint && sd.lastFaint.by === 'foeAttack' && canUse(u, 15)) { fire(S, u, 15); rankChange(S, u, 'atk', 1, 'self'); }
    if (why === 'faint' && sd.lastFaint && sd.lastFaint.will) { sd.lastFaint.will = false; log(S, 35, { 사용자: sd.lastFaint.name || '앞선 인형', 특성명: TRAIT[30] }, 'trait'); rankChange(S, u, 'atk', 1, 'self'); }
    // 더블 유언 — 그 뒤 이 편에 처음으로 실제 등장하는 인형 하나 (충원 · 교체 · 꿈 잇기 · 자리 이동은 아니다)
    if (S.dbl && why !== 'first') { const T = S.sides[tkOf(S, s)]; if (T.will) { const w = T.will; T.will = null; log(S, 35, { 사용자: w.name || '앞선 인형', 특성명: TRAIT[30] }, 'trait'); rankChange(S, u, 'atk', 1, 'self'); } }
}
// S2 회수 (일반 · 바통 · B조 교대) — 돌려주는 값: 바통이면 계승 묶음
function recall(S, s, why) {
    const sd = S.sides[s], u = cur(S, s);
    let carry = null;
    if (why === 'baton') { RANKS.forEach(function (k) { u.rank[k] = Math.max(k === 'eva' ? 0 : -6, u.rank[k] - (u.dope[k] || 0)); }); dopeClear(u); }
    if (why === 'baton') carry = { rank: copy(u.rank), boost: u.boost.filter(function (b) { return !b.dope; }), focus: u.focus, focusOn: u.focusOn || null, prio3: u.prio3, masterTrait: has(u, 10) && canUse(u, 10), masterName: u.name };
    if (carry && carry.masterTrait) u.used[10] = 1;
    log(S, 37, { 사용자: u.name }, 'recall', { s: s, i: sd.act });
    if (u.show != null) { u.show = null; log(S, 76, { 사용자: u.name }); }
    if (canUse(u, 17) && (u.status === 'poison' || u.status === 'para')) { fire(S, u, 17); log(S, 25, { 대상: u.name, 상태이상: ST_NAME[u.status] }); u.status = null; u.sc = 0; }
    if (u.status === 'fox') { log(S, 25, { 대상: u.name, 상태이상: ST_NAME.fox }); u.status = null; u.foxBy = null; u.foxTo = null; }
    if (u.focus && why !== 'baton') log(S, 28, { 사용자: u.name });
    if (u.prio3 && why !== 'baton') log(S, 30, { 사용자: u.name, 효과명: '선제태세' });
    goneFx(S, u);                                                       // 더블 — 나를 봐! · 이 인형을 겨눈 집중 해제 (실제 교체)
    const keepStatus = u.status, keepSc = u.sc;
    clearTemp(u); u.status = keepStatus; u.sc = keepSc;
    sd.switched = S.turn;
    return carry;
}

// ==========================================
// 전투 시작 (B1)
// ==========================================
//   opt.my [기록…] 내 인형 (진영 A) · opt.foe [상대…] (진영 B) · opt.allies [{ my: [기록…], owner: 이름, code }] 동료 진영 C · D (여정 여럿이)
//   opt.auto { A, B, C, D } — 엔진이 고르나 (B 는 기본 참) · opt.owner A 의 주인 이름 · opt.art { A: 옛 그림? … }
function mkSide(auto) { return { units: [], act: 0, decoy: null, nail: 0, auto: !!auto, switched: 0, usedUtil: 0, lastFaint: null, guard1Turn: 0, out: false, owner: null, code: null,
    own: null, batonDue: false, lure: null, swapTurn: 0, will: null }; }   // 더블 — 자리 주인 · (편 첫 자리에) 나를 봐! · 이번 턴 자리 바꾸기 성공 · 유언
function start(opt) {
    opt = opt || {};
    if (opt.dbl) return startDbl(opt);
    const rng = rngOf(opt.seed || ('d2bt:' + Date.now()));
    const S = { turn: 1, me: 'A', mode: opt.mode || 'pve', log: [], tlog: [], over: null, need: null, pickAt: 0, in: {}, field: { reverse: null, pendReverse: null },
        order: ['A'], allies: ['A'], tgt: null, tgtTurn: 0,
        sides: { A: mkSide(opt.auto && opt.auto.A), B: mkSide(!(opt.auto && opt.auto.B === false)) } };
    S.sides.A.owner = opt.owner || null; S.sides.A.code = opt.code || null;
    (opt.my || []).forEach(function (rec) { S.sides.A.units.push(unitOf(rec, { art: !!(opt.art && opt.art.A) })); });
    // 동료 진영 — C · D
    const AK = ['C', 'D'];
    (opt.allies || []).slice(0, AK.length).forEach(function (al, i) {
        const s = AK[i]; S.sides[s] = mkSide(opt.auto && opt.auto[s]); S.sides[s].owner = al.owner || null; S.sides[s].code = al.code || null;
        (al.my || []).forEach(function (rec) { S.sides[s].units.push(unitOf(rec, { art: !!al.art })); });
        if (!S.sides[s].units.length) { delete S.sides[s]; return; }
        S.order.push(s); S.allies.push(s);
    });
    S.order.push('B');
    (opt.foe || []).forEach(function (f) { S.sides.B.units.push(f.rec ? unitOf(f.rec, { name: f.name, dark: !!f.dark, trait: f.trait, el: f.el, art: !!f.art }) : foeOf(f, rng)); });
    if (opt.foeUnits) opt.foeUnits.forEach(function (u) { S.sides.B.units.push(u); });
    if (!S.sides.A.units.length || !S.sides.B.units.length) throw new Error('양쪽에 인형이 있어야 합니다.');
    S.order.forEach(function (s) { S.sides[s].act = firstAlive(S, s); });
    S.tlog = [];
    // 등장 — 속도 높은 쪽부터 (같으면 무작위)
    const ord = S.order.slice();
    const tb = {}; if (ord.length > 2) ord.forEach(function (s) { tb[s] = rng(); });
    if (ord.length === 2) { const a = cur(S, 'A'), b = cur(S, 'B'); if (speed(a) < speed(b) || (speed(a) === speed(b) && rng() >= 0.5)) ord.reverse(); }
    else ord.sort(function (x, y) { const d = speed(cur(S, y)) - speed(cur(S, x)); return d || (tb[x] - tb[y]); });
    ord.forEach(function (s) { enter(S, s, S.sides[s].act, 'first'); });
    return S;
}
function firstAlive(S, s) { const i = S.sides[s].units.findIndex(alive); return i < 0 ? 0 : i; }
// ★ 더블 시작 — 진입(DB6.0~6.5): 자리 확정 → 상대 전원 등장(빠른 순) → 우리 전원 등장(빠른 순) → 자리잡기 → 그 밖의 등장 특성
//   opt.team [{ code, owner, my: [기록…], art, auto }] — 우리 편 탐사자 (둘까지 · 탐사자당 한 자리 · 혼자면 두 자리 다 — DB03.1)
//   opt.my 만 주면 한 사람이 두 자리 (출몰지). S.crew [{ code, name, auto, out }] — 이탈 · 양도 (DB03.2 · leaveCheck)
function startDbl(opt) {
    const rng = rngOf(opt.seed || ('d2bt:' + Date.now()));
    const S = { turn: 1, me: 'A', mode: opt.mode || 'pve', log: [], tlog: [], over: null, need: null, pickAt: 0, in: {}, field: { reverse: null, pendReverse: null },
        dbl: true, order: ['A', 'C', 'B', 'E'], allies: ['A', 'C'], foes: ['B', 'E'], tgt: null, tgtTurn: 0, sides: {} };
    const autoA = !!(opt.auto && opt.auto.A), autoB = !(opt.auto && opt.auto.B === false);
    S.sides.A = mkSide(autoA); S.sides.C = mkSide(autoA); S.sides.B = mkSide(autoB); S.sides.E = mkSide(autoB);
    S.sides.A.tk = 'A'; S.sides.C.tk = 'A'; S.sides.B.tk = 'B'; S.sides.E.tk = 'B';
    S.sides.A.pos = 3; S.sides.C.pos = 4; S.sides.B.pos = 1; S.sides.E.pos = 2;
    const team = ((opt.team && opt.team.length) ? opt.team : [{ code: opt.code || null, owner: opt.owner || null, my: opt.my || [], art: !!(opt.art && opt.art.A), auto: autoA }])
        .filter(function (t) { return t && (t.my || []).length; }).slice(0, 2);
    if (!team.length) throw new Error('양쪽에 인형이 있어야 합니다.');
    S.crew = team.map(function (t) { return { code: t.code || null, name: t.owner || null, auto: !!t.auto, out: false }; });
    team.forEach(function (t) { (t.my || []).forEach(function (rec) { S.sides.A.units.push(unitOf(rec, { art: !!t.art, own: t.code || null })); }); });
    (opt.foe || []).forEach(function (f) { S.sides.B.units.push(f.rec ? unitOf(f.rec, { name: f.name, dark: !!f.dark, trait: f.trait, el: f.el, art: !!f.art }) : foeOf(f, rng)); });
    link(S);
    if (!S.sides.A.units.some(alive) || !S.sides.B.units.some(alive)) throw new Error('양쪽에 인형이 있어야 합니다.');
    // 자리 주인 — 탐사자당 한 자리 (혼자면 둘 다)
    ['A', 'C'].forEach(function (x, i) { const c = S.crew[Math.min(i, S.crew.length - 1)], sd = S.sides[x]; sd.own = c.code; sd.code = c.code; sd.owner = c.name; sd.auto = c.auto; });
    // 자리 — 주인의 살아 있는 인형을 앞에서부터 (모자라면 빈자리 -1)
    S.order.forEach(function (x) { S.sides[x].act = -1; });
    ['B', 'E', 'A', 'C'].forEach(function (x) { const b = bench(S, x); S.sides[x].act = b.length ? b[0] : -1; });
    leaveCheck(S); S.log = [];
    S.tlog = [];
    const tb = {}; S.order.forEach(function (x) { tb[x] = rng(); });
    const bySpd = function (list) { return list.filter(function (x) { return S.sides[x].act >= 0; }).sort(function (x, y) { const a = cur(S, x), b = cur(S, y); return (speed(b) - speed(a)) || (b.lv - a.lv) || (tb[x] - tb[y]); }); };
    const placed = bySpd(['B', 'E']).concat(bySpd(['A', 'C']));
    placed.forEach(function (x) { enter(S, x, S.sides[x].act, 'first', null, { hold: 1 }); });    // DB6.1~6.2 등장 장면
    const us = placed.map(function (x) { return cur(S, x); });
    seatAll(S, us, rng);                                                                          // DB6.3 자리잡기
    entryAll(S, us, 'first', rng);                                                                // DB6.4 그 밖의 등장 특성
    return S;
}

// ==========================================
// 상대 행동 (간단한 AI)
// ==========================================
function usableList(S, s, u) {
    const SK = K();
    return SK.equipped(u).filter(function (no) { return (u.pp[no] | 0) > 0 && allowedBy(u, no); });
}
function allowedBy(u, no) {
    if (!u.limit) return true;
    const sk = K().get(no);
    if (u.limit.kind === 'util') return sk && sk.slot === 'U';
    if (u.limit.kind === 'last') return u.limit.move && no === u.limit.move;
    return true;
}
function ai(S, s, rng) {
    rng = rng || Math.random;
    const u = cur(S, s);
    const list = usableList(S, s, u);
    if (!list.length) return { k: 'skill', no: 59 };
    const atks = list.filter(function (no) { return K().get(no).slot === 'A'; });
    const pool = (atks.length && rng() < 0.7) ? atks : list;
    const pick = pool[Math.floor(rng() * pool.length)];
    const act = { k: 'skill', no: pick };
    const sk = K().get(pick);
    if (S.dbl) {
        const kd = tgtKind(sk);
        if (kd === 'pos' || kd === 'foe') {                              // 더블 — 살아 있는 상대 자리 가운데 하나
            const os = oppSides(S, s).filter(function (x) { return alive(cur(S, x)); });
            act.tgt = os.length ? os[Math.floor(rng() * os.length)] : null;
        } else if (kd === 'mate') {                                      // 옆자리 인형이 있어야 쓴다
            const m = mateSide(S, s);
            if (!m || !alive(cur(S, m))) return ai2(S, s, rng, list.filter(function (n) { return n !== pick; }));
            act.tgt = m;
        }
    } else if (sk.fx && (sk.fx.swap || sk.fx.cheer || sk.fx.mateHeal)) { const l2 = list.filter(function (n) { return n !== pick; }); if (l2.length) return ai2(S, s, rng, l2); }   // 싱글에서 안 되는 것은 되도록 피한다
    if (sk.tgt === 'ally' || pick === 74) { const b = (sk.fx && sk.fx.allyHeal) ? benchTeam(S, s) : bench(S, s); if (!b.length) return ai2(S, s, rng, list.filter(function (n) { return n !== pick; })); act.idx = b[0]; }
    return act;
}
function ai2(S, s, rng, list) {
    list = list.filter(function (n) { const k = K().get(n); return !(k && (k.tgt === 'ally' || n === 74 || k.tgt === 'mate')); });      // 대상을 따로 골라야 하는 것은 뺀다
    if (!list.length) return { k: 'skill', no: 59 };
    const act = { k: 'skill', no: list[Math.floor(rng() * list.length)] };
    if (S.dbl) { const kd = tgtKind(K().get(act.no)); if (kd === 'pos' || kd === 'foe') { const os = oppSides(S, s).filter(function (x) { return alive(cur(S, x)); }); act.tgt = os.length ? os[Math.floor(rng() * os.length)] : null; } }
    return act;
}
// ── 더블 — 기술의 대상 지정 방식 (DB06.1 · 각 목록의 「대상 지정 방식」)
//   'pos' 공격기 — 자리 지정 (그 자리의 지금 인형 · 유도 판정) · 'foe' 상대 인형 지정 (자리 이동을 따라간다 · 교체 · 기절이면 실패)
//   'mate' 옆자리 아군 인형 지정 (널 응원해! · 할 수 있어!) · 'none' 자신 · 필드 · 진영 · 대기 · 범위 · 자리 바꾸기
function tgtKind(sk) {
    if (!sk) return 'none';
    if (sk.slot === 'A') return (sk.fx && sk.fx.range) ? 'none' : 'pos';
    if (sk.tgt === 'mate') return 'mate';
    if (sk.tgt === 'foe' || (sk.fx && (sk.fx.healFoe || sk.fx.focus))) return 'foe';
    return 'none';
}

// ==========================================
// 한 턴
// ==========================================
function turn(S0, input) {
    const S = link(copy(S0));
    S.in = input || {}; S.pickAt = 0; S.need = null; S.tlog = []; S.tcons = [];
    const seed = (S.in.seed != null ? String(S.in.seed) : 'd2t') + ':' + S.turn;
    const rng = rngOf(seed);
    S.rng = null;
    try {
        if (S.over) throw STOP;
        runTurn(S, rng);
    } catch (e) {
        if (e === NEED) { const need = S.need; return { S: S0, need: need, log: [], over: null }; }
        if (e !== STOP) throw e;
    }
    let grow = null;
    if (S.over) grow = settle(S);
    delete S.in; delete S.rng;
    const cons = S.tcons; delete S.tcons;
    return { S: S, log: S.tlog, over: S.over, grow: grow, need: null, cons: cons };
}

// ★ 더블 빈자리 충원 (DB05.3 · -2.0.1~0.4) — 턴을 다 보여 준 뒤 다음 행동 고르기 전에 따로 부른다.
//   상대 → 우리 · 왼쪽 → 오른쪽. 자리 주인의 대기 후보가 있으면 반드시 (auto 는 엔진이 · 아니면 picks · 없으면 need · in.autoPick 이면 첫 후보)
//   세운 뒤 — 새로 나온 인형들의 자리잡기 먼저, 그다음 그 밖의 등장 특성 (이미 있던 인형의 것은 다시 부르지 않는다)
function refillCore(S, rng) {
    reown(S);
    const fresh = [];
    foes(S).concat(allies(S)).forEach(function (s) { if (!alive(cur(S, s)) && bench(S, s).length) { enterPick(S, s, 'faint', { hold: 1 }); fresh.push(cur(S, s)); } });
    if (!fresh.length) return;
    seatAll(S, fresh, rng);
    entryAll(S, fresh, 'faint', rng);
}
function refill(S0, input) {
    if (!S0 || !S0.dbl || S0.over) return { S: S0, log: [], need: null, over: S0 ? S0.over : null };
    const S = link(copy(S0));
    S.in = input || {}; S.pickAt = 0; S.need = null; S.tlog = [];
    const rng = rngOf((S.in.seed != null ? String(S.in.seed) : 'd2t') + ':rf:' + S.turn);
    try { refillCore(S, rng); }
    catch (e) { if (e === NEED) return { S: S0, need: S.need, log: [], over: null }; if (e !== STOP) throw e; }
    delete S.in;
    return { S: S, log: S.tlog, need: null, over: S.over };
}
// 빈자리 가운데 내가 골라 채워야 하는 곳 (auto 아님 · 대기 후보 있음)
function refillNeed(S, sides) {
    if (!S || !S.dbl || S.over) return [];
    return (sides || foes(S).concat(allies(S))).filter(function (s) { return !alive(cur(S, s)) && bench(S, s).length; });
}
function runTurn(S, rng) {
    const T = S.turn;
    const ORD = S.order || ['A', 'B'];
    // ── -2.1 다음 턴 효과 활성화
    ORD.forEach(function (s) {
        S.sides[s].units.forEach(function (u) {
            if (!alive(u)) return;
            if (u.pendErase && u.pendErase.at === T) {
                const vals = STATS5.map(function (k) { return { k: k, v: u.st[k] }; });
                const mx = Math.max.apply(null, vals.map(function (x) { return x.v; })), mn = Math.min.apply(null, vals.map(function (x) { return x.v; }));
                const tops = vals.filter(function (x) { return x.v === mx; }); const pick = tops[Math.floor(rng() * tops.length)];
                u.erase = { k: pick.k, v: mn }; u.pendErase = null;
                log(S, 59, { 대상: u.name, 능력치: rankName(pick.k), 적용값: mn });
            }
            if (u.pendLimit && u.pendLimit.at === T) {
                const pl = u.pendLimit; u.pendLimit = null;
                if (pl.kind === 'util') { u.limit = { kind: 'util', until: T + 1 }; log(S, 68, { 대상: u.name }); }
                else { u.limit = { kind: 'last', until: T + 1, move: pl.move || u.lastMove || 0 }; log(S, 70, { 대상: u.name, 제한기술명: u.limit.move ? K().get(u.limit.move).n : '(없음)' }); }
            }
        });
    });
    if (S.field.pendReverse && S.field.pendReverse.from === T) { S.field.reverse = S.field.pendReverse; S.field.pendReverse = null; log(S, 65); }
    // ── ★ 더블 -2.0 빈자리 충원 — 왼쪽 → 오른쪽 · 대기 후보가 있으면 반드시 (DB05.3 · -2.0.1~0.3)
    if (S.dbl) refillCore(S, rng);
    // ── -2.2 행동 결정 (입력 · auto 는 엔진) — 다 쓰러진 아군 진영은 건너뛴다
    const acts = {};
    const LIVE = ORD.filter(function (s) { return !S.sides[s].out && alive(cur(S, s)); });
    if (S.tgtTurn !== T) S.tgt = null;
    LIVE.forEach(function (s) {
        const u = cur(S, s);
        let a = S.sides[s].auto ? ai(S, s, rng) : (S.in[s] || null);
        if (!a) a = ai(S, s, rng);
        a = copy(a);
        if (a.k === 'rune') {                                             // 💠 먹인 룬으로 친다 → 기술 행동(no 'rune')
            const rl = runesOf(u), nm = rl[a.i | 0];
            if (nm) { a = { k: 'skill', no: 'rune', rune: nm, i: a.i | 0, tgt: a.tgt || null }; }
            else { const list = usableList(S, s, u); a = list.length ? { k: 'skill', no: list[0] } : { k: 'skill', no: 59, why: usableAny(u) ? 51 : 7 }; }
        } else if (a.k === 'rd') {                                        // 💠 룬으로 막는다 — 룬이 없으면 아무것도 안 한다
            const rl = runesOf(u), nm = rl[a.i | 0];
            a = nm ? { k: 'rd', rune: nm } : { k: 'pass' };
        }
        if (a.k === 'skill' && a.no !== 'rune') {
            const no = a.no | 0, sk = K().get(no);
            const list = usableList(S, s, u);
            const equipped = K().equipped(u);
            if (no === 59 || !sk || equipped.indexOf(no) < 0 || (u.pp[no] | 0) <= 0) {
                // 쓸 것이 하나도 없으면 발버둥 · 있으면 그중 하나(auto) 또는 입력 오류 → 첫 번째 쓸 수 있는 것
                if (!list.length) { a = { k: 'skill', no: 59, why: usableAny(u) ? 51 : 7 }; }
                else a = { k: 'skill', no: list[0], idx: a.idx };
            } else if (!list.length) { a = { k: 'skill', no: 59, why: 51 }; }
            // 금지 기술을 골랐는데 다른 쓸 것이 있으면 그대로 시도 → R5 에서 실패
        }
        if (a.k === 'switch') { const b = bench(S, s); if (b.indexOf(a.idx | 0) < 0) a = b.length ? { k: 'switch', idx: b[0] } : ai(S, s, rng); }
        if (S.sides[s].batonDue) a = { k: 'baton' };            // 바통 예약 실행 턴 — 이것이 이번 턴 행동
        if (S.dbl && a.k === 'skill') {
            // ★ 대상 — 행동을 고를 때 정하고 발동 직전에 다시 본다 (DB06.1~2)
            const sk0 = skOf(a), kd = tgtKind(sk0);
            if (!S.sides[a.tgt]) a.tgt = null;
            if (kd === 'pos') {                                         // 공격기 — 자리 (자신만 빼고 어디든 · 빈자리도)
                if (a.tgt === s) a.tgt = null;
                if (!a.tgt) { const os = oppSides(S, s).filter(function (x) { return alive(cur(S, x)); }); a.tgt = os.length ? os[0] : oppSides(S, s)[0]; }
            } else if (kd === 'foe') {                                  // 상대 인형 — 고른 때 그 자리에 있던 인형을 따라간다
                if (a.tgt && isFoe(S, a.tgt) === isFoe(S, s)) a.tgt = null;
                if (!a.tgt) { const os = oppSides(S, s).filter(function (x) { return alive(cur(S, x)); }); a.tgt = os.length ? os[0] : oppSides(S, s)[0]; }
                a.tgtKey = alive(cur(S, a.tgt)) ? ukey(S, a.tgt, S.sides[a.tgt].act) : null;
            } else if (kd === 'mate') {                                 // 옆자리 아군 인형
                a.tgt = mateSide(S, s);
                a.tgtKey = (a.tgt && alive(cur(S, a.tgt))) ? ukey(S, a.tgt, S.sides[a.tgt].act) : null;
            } else a.tgt = null;
            // 아홉여우병 — 랭크 변화를 받을 아군 인형 (안 골랐으면 자신)
            if (sk0 && sk0.fx && sk0.fx.status === 'fox') {
                let t2 = (S.sides[a.tgt2] && isFoe(S, a.tgt2) === isFoe(S, s) && alive(cur(S, a.tgt2))) ? a.tgt2 : s;
                a.toKey = ukey(S, t2, S.sides[t2].act);
            }
        }
        if (a.k === 'skill') a.sk = skOf(a);
        acts[s] = a; acts[s].side = s; acts[s].unit = cur(S, s); acts[s].unitIdx = S.sides[s].act;
    });
    // ── -2.3 순서 기준 (우선도 · 속도 · 황룡)
    function prioOf(a) {
        if (a.k === 'switch' || a.k === 'baton') return 4;
        if (a.k === 'item') return 3;
        if (a.k === 'rd') return 2;
        if (a.k !== 'skill') return 0;
        const sk = a.sk; if (!sk) return 0;
        if (a.no === 74) return 4;
        if (a.no === 69) return a.candle === 'guard' ? 2 : 0;
        let p = sk.pri | 0;
        if (sk.slot === 'A' && a.unit.prio3 > 0) p = Math.max(p, 1);
        // ★ 더블 +1 안의 여섯 묶음 (순서 처리 10.3) — 풀죽음 공격 +1.1 → 자리 바꾸기 +1.2 → 나를 봐! +1.3 → 널 응원해! +1.4 → 그 밖의 선제 유틸 +1.5 → 일반 선제 공격 +1.6
        //   같은 묶음 안에서만 속도를 견준다 (묶음이 다르면 앞 묶음이 먼저)
        if (S.dbl && p === 1) {
            const sub = sk.slot === 'A' ? ((sk.fx && sk.fx.flinch && (sk.pri | 0) >= 1) ? 1.1 : 1.6) : (sk.sub || 1.5);
            return 2 - (sub - 1);                                         // 1.1 → 1.9 … 1.6 → 1.4 (큰 값이 먼저 · +2 보다는 뒤)
        }
        return p;
    }
    const spdNow = {}, lvNow = {};
    LIVE.forEach(function (s) { spdNow[s] = speed(cur(S, s)); lvNow[s] = cur(S, s).lv; });
    // x 가 y 보다 먼저인가 — 우선도 → 속도(황룡은 역 · 아이템은 안 탄다) → 아이템이면 레벨 → 무작위
    function before(x, y, px, py, isItem) {
        if (px !== py) return px > py;
        const rev = !!S.field.reverse && !isItem;
        if (spdNow[x] !== spdNow[y]) { const fast = spdNow[x] > spdNow[y]; return rev ? !fast : fast; }
        if (isItem && lvNow[x] !== lvNow[y]) return lvNow[x] > lvNow[y];
        const lead = ORD.indexOf(x) < ORD.indexOf(y) ? x : y;             // 비기면 무작위 — 차례표 앞쪽이 절반 확률로 먼저
        const w = rng() < 0.5 ? lead : (lead === x ? y : x);
        return w === x;
    }
    // 삽입 정렬 — 비교 순서가 늘 같아 어느 기기에서 돌려도 같은 차례 (무작위는 비길 때만 뽑는다)
    function order(list, isItem) {
        const out = [];
        list.forEach(function (s) {
            let i = out.length;
            while (i > 0 && before(s, out[i - 1], prioOf(acts[s]), prioOf(acts[out[i - 1]]), isItem)) i--;
            out.splice(i, 0, s);
        });
        return out;
    }
    ORD.forEach(function (s) { S.sides[s].usedUtil = 0; });
    const bTgt = function () { if (acts.B && !S.dbl) pickTgt(S, rng); };
    // ── +4 교체 (일반 · 바통 실행 · B조 교대) — 여럿이면 속도순
    const sw = order(LIVE.filter(function (s) { return prioOf(acts[s]) === 4; }));
    sw.forEach(function (s) { if (!S.over) { if (s === 'B') bTgt(); doSwitch(S, s, acts[s], rng); } });
    // ── P1 양초 추첨
    LIVE.forEach(function (s) { const a = acts[s]; if (a.k === 'skill' && a.no === 69 && alive(a.unit) && !a.done) { const r = rng(); a.candle = r < 0.4 ? 'guard' : r < 0.8 ? 'heal' : 'rank'; if (a.candle === 'rank') a.candleK = RANKS[Math.floor(rng() * 7)]; } });
    // ── +3 아이템
    const it = order(LIVE.filter(function (s) { return acts[s].k === 'item'; }), true);
    it.forEach(function (s) { if (!S.over) { if (s === 'B') bTgt(); doItem(S, s, acts[s], rng); } });
    // ── +2 룬 방어 (선언) · +2 / +1 / 0 기술 — 우선도 큰 쪽부터, 같으면 속도(황룡은 역)
    const rest = order(LIVE.filter(function (s) { return (acts[s].k === 'skill' && !acts[s].done) || acts[s].k === 'rd'; }));
    rest.forEach(function (s) {
        if (S.over) return;
        const a = acts[s];
        if (a.k === 'rd') { if (alive(a.unit) && S.sides[s].units[a.unitIdx] === a.unit) { a.unit.runeGuard = a.rune; a.unit.participated = 1; say(S, fix(a.unit.name + '은/는 💠 ' + a.rune + ' 룬을 들어 막을 채비를 했다!'), 'msg', { s: s }); } return; }
        if (s === 'B') bTgt();
        // 더블 — 그 사이 자리를 옮겼으면 지금 서 있는 자리에서 (미실행 행동은 인형과 함께 옮겨 간다 · DB04.2)
        const sNow = S.dbl ? (sideOfKey(S, ukey(S, s, a.unitIdx)) || s) : s;
        a.side = sNow;
        doSkill(S, sNow, a, rng);
    });
    // ── -1 턴 사이 정비
    endTurn(S, rng);
    S.turn++;
}
function usableAny(u) { return K().equipped(u).some(function (no) { return (u.pp[no] | 0) > 0; }); }

// ==========================================
// 교체 (+4)
// ==========================================
function doSwitch(S, s, a, rng) {
    const sd = S.sides[s];
    if (a.k === 'baton') {
        sd.batonDue = false;
        const u = cur(S, s);
        if (!alive(u) || !u.baton) return;
        u.baton = false;
        if (!bench(S, s).length) return;
        const carry = recall(S, s, 'baton');
        // 선택창
        let idx;
        if (sd.auto) idx = bench(S, s)[0];
        else { const q = S.in.picks || []; const p = q.length > S.pickAt ? q[S.pickAt] : null; if (p == null) { S.need = { pick: s, why: 'baton', cands: bench(S, s) }; throw NEED; } S.pickAt++; idx = bench(S, s).indexOf(Number(p)) >= 0 ? Number(p) : bench(S, s)[0]; log(S, 94, {}, 'ui'); }
        enter(S, s, idx, 'baton', carry);
        return;
    }
    if (a.k === 'skill' && a.no === 74) {                   // B조, 교대! — R 먼저
        const u = a.unit;
        if (!tryR(S, s, a, rng)) { a.done = true; return; }
        const b = bench(S, s);
        if (!b.length) { log(S, 2); a.done = true; return; }
        fired(S, s, a);
        recall(S, s, 'switch');
        const idx = b.indexOf(a.idx | 0) >= 0 ? (a.idx | 0) : b[0];
        enter(S, s, idx, 'switch');
        const n = cur(S, s); const q = Math.min(n.max - n.hp, ceil(n.max / 8));
        if (q > 0) { n.hp += q; log(S, 16, { 대상: n.name, 수치: q }); } else log(S, 17, { 대상: n.name });
        a.done = true; return;
    }
    // 일반 교체 — 탐사자의 1턴 행동
    recall(S, s, 'switch');
    enter(S, s, a.idx, 'switch');
    a.done = true;
}
// 아이템 (+3) — 5단계 d2-items.js 가 D2IT.use 를 준다. 없으면 안내만.
function doItem(S, s, a, rng) {
    a.done = true;
    if (window.D2IT && typeof window.D2IT.use === 'function') { window.D2IT.use(S, s, a, rng, { log: log, say: say, cur: cur, alive: alive, ceil: ceil, faint: faint, rankChange: rankChange, heal: heal, ST_NAME: ST_NAME }); return; }
    say(S, '(아이템은 아직 없다)');
}

// ==========================================
// 기술 — R (시도 · 실패 차례) → A / U
// ==========================================
//   돌려주는 값 참이면 R5 까지 통과 (R6 발동은 fired())
function tryR(S, s, a, rng) {
    const u = a.unit, no = a.no, sk = skOf(a);
    if (!alive(u) || S.sides[s].units[a.unitIdx] !== u) return false;      // R0 — 기절 · 교체됨
    if (S.dbl && cur(S, s) !== u) return false;                            //      더블 — 지금 필드에 없다
    // R0.1 PP · 기회 소모 (룬은 PP 가 없다)
    if (no === 59) log(S, a.why === 51 ? 51 : 7, { 사용자: u.name }, 'msg', { s: s });
    else if (no === 'rune') log(S, 1, { 사용자: u.name, 기술명: sk.n }, 'msg', { s: s, act: 1 });
    else { u.pp[no] = Math.max(0, (u.pp[no] | 0) - 1); log(S, 1, { 사용자: u.name, 기술명: sk.n }, 'msg', { s: s, act: 1 }); }
    u.lastMove = no;
    if (sk.fx.oncePerAppear) { a.flinchWasUsed = u.flinchUsed; u.flinchUsed = true; }
    if (sk.cat === '복합 공격' && has(u, 31) && !u.chainUsed) { u.chainUsed = true; a.chain = true; }
    // R1 풀죽음
    if (u.flinch) { log(S, 3, { 사용자: u.name }); return false; }
    // R2 강제 휴식
    if (u.restUntil === S.turn) { log(S, 4); return false; }
    // R3 방어1 연속
    const isGuard1 = (no === 22) || (no === 69 && a.candle === 'guard');
    if (isGuard1 && u.guardLast) { log(S, 2); return false; }
    // R4 마비
    if (u.status === 'para' && rng() < 0.3) { log(S, 5, { 사용자: u.name }); return false; }
    // R5 고유 실패 · 제한
    if (no !== 59 && !allowedBy(u, no)) { log(S, 2); return false; }
    if (sk.fx.oncePerAppear && a.flinchWasUsed) { log(S, 2); return false; }
    if (no === 54 || no === 74) { if (!bench(S, s).length) { log(S, 2); return false; } }
    if (no === 61) { if (S.sides[s].decoy) { log(S, 54); return false; } if (Math.min(ceil(u.max / 4), u.hp - 1) <= 0) { log(S, 2); return false; } }
    if (no === 76) { if (Math.min(ceil(u.max / 4), u.hp - 1) <= 0 || !bench(S, s).length) { log(S, 2); return false; } }
    if (no === 71 && u.donut) { log(S, 73); return false; }
    if (no === 73) { if (fieldUnits(S).some(function (x) { return x.show != null; })) { log(S, 113); return false; } }
    // ★ 더블 — 대상 확정 (DB06.2 · DB07.1): 유도 · 자리 이동 추적. 유효한 대상이 없으면 실패 · PP 는 이미 썼다
    if (S.dbl && !aim(S, s, a)) { log(S, 2); return false; }
    // ★ 지금 전투에서 쓸 수 없는 기술 (DB-D1 · 모드 부적합) — 고를 수는 있고 시도하면 실패
    if (sk.fx.swap) { const m = mateSide(S, s); if (!m || S.sides[tkOf(S, s)].swapTurn === S.turn) { log(S, 2); return false; } }   // 싱글 · 이번 턴 이 편이 이미 바꿨다
    if ((sk.fx.cheer || sk.fx.mateHeal) && !S.dbl) { log(S, 2); return false; }                                                  // 싱글 — 자신이 아닌 출전 아군이 없다
    if (sk.fx.lure && S.dbl) { const L = S.sides[tkOf(S, s)].lure; if (L && L.turn === S.turn && sideOfKey(S, tkOf(S, s) + ':' + L.idx)) { log(S, 2); return false; } }   // 이 편에 유도가 유지 중
    if (sk.fx.range && !rangeSides(S, s, sk).length) { log(S, 2); return false; }                                                // 범위 안에 아무도 없다
    if (S.dbl && sk.fx.healFoe) { const f = cur(S, other(S, s)); if (!alive(f) || f.hp >= f.max) { log(S, 2); return false; } }   // 함께 꿰맨 꿈 — 상대를 회복시킬 수 없으면 통째로 실패 (DB06.5)
    if (no === 60) { const f = cur(S, other(S, s)); if (!alive(f) || f.erase || f.pendErase) { log(S, 11); return false; } const vs = STATS5.map(function (k) { return f.st[k]; }); if (Math.max.apply(null, vs) === Math.min.apply(null, vs)) { log(S, 11); return false; } }
    if (no === 70) { if (S.sides[other(S, s)].switched === S.turn) { log(S, 2); return false; } }
    if (no === 64) { if (S.sides[tkOf(S, other(S, s))].nail >= 2) { log(S, 11); return false; } }
    return true;
}
// ★ 더블 — 이 행동이 실제로 향할 자리를 정한다 (S.atk · other() 가 돌려준다). 돌려주는 값이 거짓이면 유효한 대상이 없다.
//   공격기(자리 지정) — 상대편에 살아 있는 「나를 봐!」 가 있으면 그 인형에게 (상대의 단일 공격만 · 범위기 · 유틸 · 아이템은 아니다)
//                       유도가 풀렸으면 원래 고른 자리의 지금 인형 · 그 자리가 비었을 때만 실패
//   인형 지정(상대 인형 · 옆자리 아군) — 고른 인형이 지금 서 있는 자리 (자리 이동은 따라가고 · 교체 · 기절이면 실패)
function aim(S, s, a) {
    const sk = skOf(a), kd = tgtKind(sk);
    S.atk = { s: s, tgt: null };
    if (kd === 'none') return true;
    if (kd === 'pos') {
        let t = a.tgt;
        if (a.no === 59 && !alive(cur(S, t))) { const os = oppSides(S, s).filter(function (x) { return alive(cur(S, x)); }); t = os[0] || t; }   // 발버둥 — 살아 있는 상대에게
        const L = lureOf(S, s);
        if (L && L !== t) { t = L; a.lured = 1; }
        if (!t || t === s || !alive(cur(S, t))) return false;
        S.atk.tgt = t;
        return true;
    }
    const t = sideOfKey(S, a.tgtKey);
    if (!t || t === s) return false;
    S.atk.tgt = t;
    return true;
}
// 범위 공격이 닿는 자리들 — 'all' 자신 빼고 나와 있는 모두 · 'foes' 상대 진영 (DB08.1 · 빈자리 · 대기는 빠진다)
function rangeSides(S, s, sk) {
    const o = (S.order || ['A', 'B']).filter(function (x) { return x !== s && !S.sides[x].out && alive(cur(S, x)); });
    return sk.fx.range === 'foes' ? o.filter(function (x) { return isFoe(S, x) !== isFoe(S, s); }) : o;
}
// R6 — 실제 발동 기록 · 유효 훈련
function fired(S, s, a) {
    const u = a.unit, sk = skOf(a);
    u.participated = 1;
    a.ev = a.ev || {};
    if (sk.slot === 'A' && a.no !== 59) {
        if (sk.kind === 'phys') a.ev.atk = 1; else if (sk.kind === 'mag') a.ev.chm = 1;
        if ((sk.pri | 0) >= 1 || u.prio3 > 0) a.ev.spd = 1;
    }
    if (sk.slot === 'U') S.sides[s].usedUtil = S.turn;
    a.fired = true;
}
function doSkill(S, s, a, rng) {
    S.atk = null;                                                       // 더블 — 이 행동이 향하는 자리 (tryR 의 aim 이 정한다 · other() 가 돌려준다)
    try {
        if (!tryR(S, s, a, rng)) { a.done = true; return; }
        const sk = skOf(a);
        fired(S, s, a);
        a.done = true;
        if (a.lured) log(S, 'd2', { 대상: cur(S, S.atk.tgt).name });
        if (sk.slot === 'A') attack(S, s, a, rng); else util(S, s, a, rng);
        if (alive(a.unit) || a.ev) credit(S, a.unit, a.ev);
    } finally { S.atk = null; }
}

// ==========================================
// 공격 A1.1 ~ A7
// ==========================================
function elOfSkill(sk, u) { return sk.el === 'self' ? u.el : sk.el; }
// ── 한 대상에게 — A1.1 차단 → A1.2 명중 → A1.3 회피 → A1.4 → A1.5 피해 → A2 기절 (+5)
//   돌려주는 값 { f 대상, os 자리, was 처음에 살아 있었나, hit, dHP, decoy 대타가 받았나, half 받아치기 자세였나, use [소모할 일회성 강화…] }
//   일회성 강화(기회주의 · 눈치 · 경계심 · 허를 찌르기 · 낚시꾼 · 응원)는 여기서 쓰지 않고 돌려준다 — 부른 쪽이 실제 피해가 났을 때 한 번만 쓴다 (spend)
function strike(S, s, a, rng, os, o) {
    o = o || {};
    const u = a.unit, sk = skOf(a), fsd = S.sides[os], f = cur(S, os);
    const R = { f: f, os: os, was: alive(f), hit: false, dHP: 0, decoy: false, half: false, use: [] };
    if (!R.was) return R;
    const isStruggle = a.no === 59, isOhko = !!sk.fx.ohko, isRune = a.no === 'rune';
    // 집중 — 더블은 겨눈 그 인형에게만 필중 (다른 대상은 보통 판정 · DB06.5)
    const focused = u.focus && (!S.dbl || !u.focusOn || u.focusOn === ukeyOfUnit(S, f));
    const sureHit = sk.acc === 'sure' || (focused && !(isOhko && f.dark) && !f.dark);
    let hit = false, dHP = 0, receiverDecoy = false;
    R.half = f.guard === 'half';
    // A1.1 완전 방어 · 무효
    let blocked = false;
    if (f.guard === 'full') { log(S, 8, { 대상: f.name }); blocked = true; if (!isStruggle && (sk.kind === 'phys' || sk.kind === 'mag')) defEv(S, f, sk.kind); }
    else if (canUse(f, 33) && f.enteredBy === 'switch' && f.enteredTurn === S.turn && !f.decoyUsedTurn) { fire(S, f, 33); log(S, 36, { 사용자: f.name, 특성명: TRAIT[33] }); f.decoyUsedTurn = S.turn; blocked = true; }
    else if (isOhko && f.dark) { log(S, 11); blocked = true; }
    if (!blocked) {
        // A1.2 명중 · A1.3 회피
        if (!sureHit) {
            let acc;
            if (isOhko) acc = 10;
            else { acc = Math.round((sk.acc === 1 ? 100 : sk.acc * 100) + 5 * u.rank.acc + (has(u, 2) ? 10 : 0)); }
            acc = clamp(acc, 0, 100);
            if (rng() * 100 >= acc) { if (o.range) log(S, 'd5', { 대상: f.name }); else log(S, 9); }
            else if (f.rank.eva > 0 && rng() * 100 < EVA[clamp(f.rank.eva, 0, 6)]) { log(S, 10, { 대상: f.name }); }
            else hit = true;
        } else hit = true;
    }
    if (hit) {
        // A1.4 — 똑바로 붙어! : 실제로 맞은 인형의 랭크만 0 으로 (쓴 쪽 · 다른 인형은 그대로 — 2026-11-12 기획 고침)
        if (sk.fx.resetRanks) { resetRanks(f); log(S, 49, { 대상: f.name }, 'msg', { rk: sideOf(S, f) }); }
        // A1.5b 수신 대상
        receiverDecoy = !!fsd.decoy;
        if (isOhko) {
            if (receiverDecoy) { log(S, 56, { 진영: sideName(S, os) }); fsd.decoy = null; log(S, 57, { 진영: sideName(S, os) }); }
            else {
                if (f.guard === 'endure') { f.hp = Math.max(1, f.hp); log(S, 18, { 대상: f.name }); unyield(S, f); dHP = 0; }
                else if (canUse(f, 19) && f.hp === f.max) { fire(S, f, 19); dHP = f.hp - 1; f.hp = 1; }
                else if (canUse(f, 34)) { fire(S, f, 34); dHP = f.hp - 1; f.hp = 1; }
                else { dHP = f.hp; f.hp = 0; log(S, 20, { 대상: f.name }); faint(S, f, { k: 'foeAttack' }); }
            }
        } else {
            // A1.5a 기본 피해
            const L = u.lv, P = sk.fx.pw || sk.pw || 0;
            let A, B, RA, RB;
            if (isStruggle) {
                const pa = base(u, 'atk') * rankMul(u.rank.atk), pc = base(u, 'chm') * rankMul(u.rank.chm);
                if (pa >= pc) { A = base(u, 'atk'); RA = rankMul(u.rank.atk); B = base(f, 'def'); RB = rankMul(f.rank.def); }
                else { A = base(u, 'chm'); RA = rankMul(u.rank.chm); B = base(f, 'sta'); RB = rankMul(f.rank.sta); }
            } else if (sk.kind === 'mag') { A = base(u, 'chm'); RA = rankMul(u.rank.chm); B = base(f, 'sta'); RB = rankMul(f.rank.sta); }
            else { A = base(u, 'atk'); RA = rankMul(u.rank.atk); B = base(f, 'def'); RB = rankMul(f.rank.def); }
            const U = ((0.4 * L + 2) * P / 50) * ((A * RA + 20) / (B * RB + 20)) + 2;
            const el = elOfSkill(sk, u);
            const noEl = isStruggle || isRune || !el;                     // 발버둥 · 룬 · 무속성 기술 — 자속 · 상성 없음 (MS = MT = 1)
            const MS = noEl ? 1 : (el === u.el ? 1 : 0.8);
            const MT = noEl ? 1 : (BEATS[el] === f.el ? 1.5 : BEATS[f.el] === el ? 0.75 : 1);
            // MO 공격자 특성 — 일회성은 use 에 모은다 (대상마다 제 조건으로 · 최종 데미지 12)
            let MO = 1; const use = R.use;
            const foeTgt = isFoe(S, os) !== isFoe(S, s);
            if (canUse(u, 3) && fsd.usedUtil === S.turn && !a.foeUtilAfter) { MO *= 1.2; use.push(3); }                    // 기회주의 — 먼저 유틸을 쓴 그 상대에게만
            if (has(u, 6) && u.hp * 3 <= u.max) MO *= 1.2;
            if (canUse(u, 18) && (S.dbl ? (foeTgt && oppSides(S, s).some(function (x) { return S.sides[x].switched === S.turn; })) : fsd.switched === S.turn)) { MO *= 1.2; use.push(18); }   // 눈치 — 상대 진영에 교체가 있었으면 그 편 누구에게든
            if (has(u, 5) && u.status === 'poison') MO *= 1.3;
            const fk = S.dbl ? ukeyOfUnit(S, f) : null;
            const bo = u.boost.filter(function (x) { return !x.vs || x.vs === fk; })[0];                                  // 낚시꾼은 그 방어를 쓴 상대에게만 (vs)
            if (bo) { MO *= 1.2; use.push(bo); }
            // MI 방어자 특성
            let MI = 1;
            if (has(f, 16) && f.enteredTurn === S.turn && f.enteredBy) MI *= 0.8;
            if (has(f, 24) && f.hp * 2 <= f.max) MI *= 0.85;
            if (has(f, 35) && f.calmTurn === S.turn) MI *= 0.5;
            const MG = f.guard === 'half' ? 0.5 : 1;
            // ★ MD 추가 기술 배율 = 응원 × 확인 사살 × 불굴의 의지 (최종 데미지 12 — 다른 배율과 곱해 마지막에 한 번 올림)
            let MD = 1;
            if (u.cheer === S.turn) { MD *= 1.3; use.push('cheer'); }
            if (sk.fx.mk && teamAliveCount(S, os) === 1) MD *= sk.fx.mk;                                                   // 상대 편 전체(출전 · 대기)에 하나만 살아 있을 때
            if (sk.fx.mw && teamAliveCount(S, s) === 1) MD *= sk.fx.mw;                                                    // 우리 편 전체에 나만 살아 있을 때
            // 💠 룬 상성 — 받는 쪽이 들고 있는 룬이 치는 룬을 이기면 1/3
            const runeBlock = isRune && f.runeGuard && RUNE_BEATS[f.runeGuard] === sk.rune;
            if (runeBlock) say(S, fix(f.name + '은/는 💠 ' + f.runeGuard + ' 룬으로 받아 넘겼다! (피해 1/3)'), 'msg');
            const D = runeBlock ? ceil(ceil(U * MS * MT * MO * MI * MG * MD) / 3) : ceil(U * MS * MT * MO * MI * MG * MD);
            if (receiverDecoy) {
                const dec = fsd.decoy; dHP = Math.min(dec.hp, D); dec.hp -= dHP;
                log(S, 55, { 진영: sideName(S, os), 수치: dHP });
                if (dec.hp <= 0) { fsd.decoy = null; log(S, 57, { 진영: sideName(S, os) }); }
            } else {
                const H = f.hp;
                let after = Math.max(0, H - D), survived = false;
                if (after === 0) {
                    if (f.guard === 'endure') { after = 1; survived = 'endure'; }
                    else if (canUse(f, 19) && H === f.max) { after = 1; survived = 19; }
                    else if (canUse(f, 34)) { after = 1; survived = 34; }
                }
                dHP = H - after; f.hp = after;
                if (survived === 'endure') { log(S, 13, { 대상: f.name, 수치: dHP }); log(S, 18, { 대상: f.name }); unyield(S, f); }
                else if (survived) { fire(S, f, survived); log(S, 13, { 대상: f.name, 수치: dHP }); }
                else log(S, 13, { 대상: f.name, 수치: dHP });
                if (dHP > 0 && !o.hold) spend(u, use);
                R.real = dHP > 0;                                           // 인형이 실제로 HP 를 잃었다 (일회성 강화 소모 조건)
                if (!isStruggle && (sk.kind === 'phys' || sk.kind === 'mag') && (MG < 1 || survived === 'endure')) defEv(S, f, sk.kind);   // 받아치기 경감 · 버티기 생존 → 방어력/굳건함 훈련
                R.hit = hit; R.dHP = dHP; R.decoy = receiverDecoy;
                if (f.hp === 0) faint(S, f, { k: 'foeAttack' });             // A2 (+5) — 끝나면 STOP 이거나 (싱글) 새 인형이 나와 있다
            }
        }
    }
    R.hit = hit; R.dHP = dHP; R.decoy = receiverDecoy;
    return R;
}
// 일회성 강화를 쓴다 — 특성 번호(전투당 1회) · 강화 한 겹(경계심 · 허를 찌르기 · 낚시꾼) · 'cheer' 응원
function spend(u, use) {
    (use || []).forEach(function (c) {
        if (c === 'cheer') u.cheer = 0;
        else if (c && typeof c === 'object') { const i = u.boost.indexOf(c); if (i >= 0) u.boost.splice(i, 1); }
        else u.used[c] = 1;
    });
}
function attack(S, s, a, rng) {
    const u = a.unit, sk = skOf(a);
    if (sk.fx.range) return attackRange(S, s, a, rng);
    const os = other(S, s), fsd = S.sides[os];
    const R = strike(S, s, a, rng, os);
    if (!R.was) return;
    const f = R.f, hit = R.hit, dHP = R.dHP, receiverDecoy = R.decoy;
    const isOhko = !!sk.fx.ohko;
    const atkAlive = alive(u);
    // A3 반동
    if (hit && sk.fx.recoil && dHP > 0 && atkAlive) { const q = ceil(dHP * sk.fx.recoil); if (q > 0) { u.hp = Math.max(0, u.hp - q); log(S, 14, { 사용자: u.name, 수치: q }); if (u.hp === 0) { faint(S, u, { k: 'recoil' }); } } }
    // A4 반사 — 방어자(받아치기 소유)가 살아 있고 공격자도 살아 있을 때
    if (hit && dHP > 0 && alive(u) && f.guard === 'half' && alive(f)) { const q = ceil(dHP * (has(f, 20) ? 0.75 : 0.5)); if (q > 0) { u.hp = Math.max(0, u.hp - q); log(S, 15, { 사용자: u.name, 수치: q }); if (u.hp === 0) faint(S, u, { k: 'reflect' }); } }
    // A5 네일팁 — 물리 공격을 실제 발동한 진영
    if (alive(u) && S.sides[tkOf(S, s)].nail > 0 && sk.kind === 'phys') { const q = ceil(u.max * (S.sides[tkOf(S, s)].nail >= 2 ? 1 / 8 : 1 / 16)); u.hp = Math.max(0, u.hp - q); log(S, 62, { 사용자: u.name, 수치: q }); if (u.hp === 0) faint(S, u, { k: 'nail' }); }
    // A6 부가효과 — 공격자가 살아 있을 때 · 상대 대상은 상대가 살아 있을 때
    if (hit && alive(u) && !isOhko) {
        const tgtAlive = alive(f) && !receiverDecoy && cur(S, os) === f;
        const fx = sk.fx;
        if (fx.status && tgtAlive) giveStatus(S, f, fx.status, s);
        if (fx.flinch && tgtAlive) f.flinch = true;
        if (fx.rank) {
            const p = fx.rank.p + (has(u, 1) ? 0.15 : 0);
            const rolls = a.chain ? 2 : 1;
            let ok = 0; for (let i = 0; i < rolls; i++) if (rng() < Math.min(1, p)) ok++;
            if (a.chain) fire(S, u, 31);
            for (let i = 0; i < ok; i++) {
                if (fx.rank.who === 'self') { const d = rankChange(S, u, fx.rank.k, fx.rank.n, 'self'); if (fx.rank.k === 'spd' && d > 0) a.ev.spd = 1; }
                else if (tgtAlive) { const d = rankChange(S, f, fx.rank.k, fx.rank.n, 'foe', { by: u }); if (fx.rank.k === 'spd' && d < 0) a.ev.spd = 1; }
            }
        }
        if (fx.reveal && tgtAlive) { const pr = C().perOf(f.rec); log(S, 63, { 대상: f.name, 특성명: TRAIT[f.trait] || '없음', 특기1: C().NAME[pr.a], 특기2: C().NAME[pr.b] }); f.revealed = 1; }
    }
    // A7 사용 후
    if (alive(u)) {
        if (u.focus) { u.focus = false; u.focusOn = null; log(S, 28, { 사용자: u.name }); }
        if (sk.fx.rest) { u.restUntil = S.turn + 1; log(S, 47, { 사용자: u.name }); }
    }
}
// ★ 범위 공격 (DB08 · 순서 처리 10.4 DB-A1~5) — 기술 한 번 · PP 한 번
//   DB-A1 범위 · 순서 확정 (느린 순 → 낮은 레벨 → 무작위 · 한 번 고정) → DB-A2 대상마다 따로 판정 · 피해 (기절은 그 자리에서 · 한 대상이 빗나가도 나머지는 그대로)
//   → DB-A3 받아치기 반사 (직접 피해를 다 낸 뒤 · 방어자 빠른 순 → 높은 레벨 → 무작위) → DB-A4 네일팁 한 번 → DB-A5 사용 후 효과 한 번
//   일회성 강화는 대상마다 제 조건으로 곱하고, 실제 피해가 하나라도 났으면 공격 한 번으로 한 번만 쓴다 (최종 데미지 12)
function attackRange(S, s, a, rng) {
    const u = a.unit, sk = skOf(a);
    const ts = rangeSides(S, s, sk).map(function (x) { return { s: x, u: cur(S, x), r: rng() }; });
    ts.sort(function (p, q) { return (speed(p.u) - speed(q.u)) || (p.u.lv - q.u.lv) || (p.r - q.r); });
    const res = [], use = [];
    for (let i = 0; i < ts.length; i++) {
        const t = ts[i];
        if (S.over || !alive(u)) break;
        if (cur(S, t.s) !== t.u || !alive(t.u)) continue;                 // 그 사이 사라졌다 (싱글 — 기절 뒤 새 인형은 이번 범위가 아니다)
        const R = strike(S, s, a, rng, t.s, { range: 1, hold: 1 });
        res.push(R);
        if (R.real) R.use.forEach(function (c) { if (use.indexOf(c) < 0) use.push(c); });
    }
    spend(u, use);
    // DB-A3 반사 — 살아 있는 받아치기 방어자마다 따로
    res.filter(function (R) { return R.hit && R.dHP > 0 && R.half; }).map(function (R) { return { R: R, r: rng() }; })
        .sort(function (p, q) { return (speed(q.R.f) - speed(p.R.f)) || (q.R.f.lv - p.R.f.lv) || (p.r - q.r); })
        .forEach(function (x) {
            const f = x.R.f;
            if (S.over || !alive(u) || !alive(f) || f.guard !== 'half') return;
            const q = ceil(x.R.dHP * (has(f, 20) ? 0.75 : 0.5));
            if (q > 0) { u.hp = Math.max(0, u.hp - q); log(S, 15, { 사용자: u.name, 수치: q }); if (u.hp === 0) faint(S, u, { k: 'reflect' }); }
        });
    // DB-A4 네일팁 — 기술 한 번 기준
    if (alive(u) && S.sides[tkOf(S, s)].nail > 0 && sk.kind === 'phys') { const q = ceil(u.max * (S.sides[tkOf(S, s)].nail >= 2 ? 1 / 8 : 1 / 16)); u.hp = Math.max(0, u.hp - q); log(S, 62, { 사용자: u.name, 수치: q }); if (u.hp === 0) faint(S, u, { k: 'nail' }); }
    // DB-A5 사용 후
    if (alive(u)) {
        if (u.focus) { u.focus = false; u.focusOn = null; log(S, 28, { 사용자: u.name }); }
        if (sk.fx.rest) { u.restUntil = S.turn + 1; log(S, 47, { 사용자: u.name }); }
    }
}
// 버티기로 살았다 — 불굴
// 방어류 유틸기로 실제로 막거나 줄였다 — 물리면 방어력 · 마법이면 굳건함 (한 발동에 유형별 최대 1회 · 노력치 18)
function defEv(S, f, kind) {
    f.defEvTurn = f.defEvTurn || {};
    const k = kind === 'phys' ? 'def' : 'sta';
    if (f.defEvTurn[k] === S.turn) return;
    f.defEvTurn[k] = S.turn;
    const o = {}; o[k] = 1; credit(S, f, o);
}
function unyield(S, f) { if (canUse(f, 22)) { fire(S, f, 22); rankChange(S, f, 'atk', 1, 'self'); } }
function giveStatus(S, t, k, bySide, toKey) {
    if (!alive(t)) return false;
    if (t.status === k) { log(S, 11); return false; }
    if (t.status) { log(S, 25, { 대상: t.name, 상태이상: ST_NAME[t.status] }); }
    t.status = k; t.sc = 0; t.stTurn = S.turn; t.foxBy = k === 'fox' ? bySide : null;      // 부여 턴에는 카운트가 안 는다 (03.2)
    t.foxTo = (k === 'fox' && toKey) ? toKey : null;                                        // 더블 — 랭크 변화를 받을 아군 인형 (그 인형을 따라간다)
    log(S, 23, { 대상: t.name, 상태이상: ST_NAME[k] });
    return true;
}

// ==========================================
// 유틸 U1 ~ U9
// ==========================================
function heal(S, t, q, quietFull) {
    const got = Math.min(t.max - t.hp, Math.max(0, q));
    if (got > 0) { t.hp += got; log(S, 16, { 대상: t.name, 수치: got }); }
    else if (!quietFull) log(S, 17, { 대상: t.name });
    return got;
}
function util(S, s, a, rng) {
    const u = a.unit, sk = skOf(a), fx = sk.fx, os = other(S, s), f = cur(S, os), sd = S.sides[s];
    // 낚시꾼 — 상대가 이번 턴 완전 방어를 썼고 내가 유틸을 쓴다 (더블 — 그 방어를 쓴 상대를 칠 때만 강해진다 · vs)
    if (canUse(u, 27)) {
        const gs = S.dbl ? oppSides(S, s).filter(function (x) { return S.sides[x].guard1Turn === S.turn && alive(cur(S, x)); }) : (S.sides[os].guard1Turn === S.turn ? [os] : []);
        if (gs.length) { fire(S, u, 27); u.boost.push({ trait: 27, vs: S.dbl ? ukey(S, gs[0], S.sides[gs[0]].act) : null }); log(S, 48, { 사용자: u.name }); }
    }
    if (a.no === 69) {                                                  // 양초 — 추첨 결과 실행
        const nm = a.candle === 'guard' ? '완전 방어' : a.candle === 'heal' ? '회복' : rankName(a.candleK) + ' 상승';
        log(S, 71, { 결과명: nm });
        if (a.candle === 'guard') { u.guard = 'full'; u.guardFired = true; sd.guard1Turn = S.turn; log(S, 44, { 사용자: u.name }); }
        else if (a.candle === 'heal') heal(S, u, ceil(u.max * 0.25 * (has(u, 21) ? 1.2 : 1)));
        else rankChange(S, u, a.candleK, 2, 'self');
        return;
    }
    if (fx.heal) {
        heal(S, u, ceil(u.max * fx.heal * (has(u, 21) ? 1.2 : 1)));
        if (fx.healFoe && alive(f)) heal(S, f, ceil(f.max * fx.healFoe));
        if (fx.rest) { u.restUntil = S.turn + 1; log(S, 47, { 사용자: u.name }); }
        return;
    }
    if (fx.guard === 'full') { u.guard = 'full'; u.guardFired = true; sd.guard1Turn = S.turn; log(S, 44, { 사용자: u.name }); return; }
    if (fx.guard === 'half') { u.guard = 'half'; log(S, 45, { 사용자: u.name }); return; }
    if (fx.endure) { u.guard = 'endure'; log(S, 46, { 사용자: u.name }); return; }
    if (fx.status) { if (alive(f)) giveStatus(S, f, fx.status, s, (S.dbl && fx.status === 'fox') ? (a.toKey || null) : null); return; }
    if (fx.ranks) {
        const plusMinus = fx.ranks.length === 2 && fx.ranks[0].who === 'self' && fx.ranks[0].n === 2 && fx.ranks[1].who === 'self' && fx.ranks[1].n === -1;
        fx.ranks.forEach(function (r, i) {
            let n = r.n;
            const tgt = r.who === 'self' ? u : f;
            if (!alive(tgt)) return;
            if (plusMinus && i === 1) {
                if (canUse(u, 32)) { fire(S, u, 32); n = 1; }
                else if (canUse(u, 7)) { fire(S, u, 7); return; }
            }
            if (r.who === 'self' && n > 0 && sk.cat.indexOf('랭크 상승') >= 0 && u.rank[r.k] <= -2 && canUse(u, 11)) { fire(S, u, 11); n += 1; }
            const d = rankChange(S, tgt, r.k, n, r.who === 'self' ? 'self' : 'foe', r.who === 'self' ? null : { by: u });
            if (r.k === 'spd' && d && ((r.who === 'self' && d > 0) || (r.who === 'foe' && d < 0))) a.ev.spd = 1;
        });
        return;
    }
    if (fx.baton) { u.baton = true; sd.batonDue = true; log(S, 39, { 사용자: u.name }); return; }
    if (fx.prio3) { u.prio3 = has(u, 25) ? 4 : 3; a.ev.spd = 1; log(S, 29, { 사용자: u.name }); return; }
    if (fx.focus) {
        u.focus = true; u.focusOn = (S.dbl && alive(f)) ? ukeyOfUnit(S, f) : null;       // 더블 — 겨눈 그 인형에게만 필중
        if (has(u, 35)) u.calmTurn = S.turn; log(S, 27, { 사용자: u.name });
        if (alive(f) && canUse(f, 29)) { fire(S, f, 29); rankChange(S, f, 'spd', 1, 'self'); }
        return;
    }
    if (fx.destiny) {                                                   // U8
        if (alive(f)) { if (f.guard === 'full') log(S, 8, { 대상: f.name }); else { f.hp = 1; log(S, 19, { 대상: f.name }); } }
        u.hp = 0; sd.lastFaint = null;
        const had = has(u, 30); const nm = u.name;
        faint(S, u, { k: 'destiny' });
        if (had && sd.lastFaint) sd.lastFaint.name = nm;
        return;
    }
    // U9 고유
    if (fx.erase) { if (alive(f)) { f.pendErase = { at: S.turn + 1, by: u.key + '@' + s }; log(S, 58, { 사용자: u.name, 대상: f.name }); } return; }
    if (fx.decoy) { const c = Math.min(ceil(u.max / 4), u.hp - 1); u.hp -= c; log(S, 52, { 사용자: u.name, 수치: c }); sd.decoy = { hp: c, max: c }; log(S, 53, { 진영: sideName(S, s), 수치: c }); return; }
    if (fx.reverse) { S.field.pendReverse = { from: S.turn + 1, to: S.turn + 2 }; log(S, 64); return; }
    if (fx.nailtip) { const o = S.sides[tkOf(S, os)]; o.nail = Math.min(2, o.nail + 1); log(S, 61, { 진영: sideName(S, os), 중첩수: o.nail }); return; }
    if (fx.limit === 'util') { if (alive(f)) { f.pendLimit = { kind: 'util', at: S.turn + 1 }; log(S, 67, { 대상: f.name }); } return; }
    if (fx.limit === 'last') { if (alive(f)) { f.pendLimit = { kind: 'last', at: S.turn + 1 }; log(S, 69, { 대상: f.name }); } return; }
    if (fx.donut) { u.donut = true; log(S, 72, { 사용자: u.name }); return; }
    // ★ 더블 배틀 유틸 (149~152)
    if (fx.lure) { if (S.dbl) S.sides[tkOf(S, s)].lure = { turn: S.turn, idx: sd.act }; log(S, 'd1', { 사용자: u.name }); return; }   // 나를 봐! — 이번 턴 남은 상대 단일 공격을 나에게 (싱글은 말뿐)
    if (fx.cheer) { if (alive(f)) { f.cheer = S.turn; log(S, 'd3', { 사용자: u.name, 대상: f.name }); } return; }                       // 널 응원해! — 이번 턴 공격 한 번 ×1.3 (겹치지 않는다)
    if (fx.mateHeal) { if (alive(f)) heal(S, f, ceil(f.max * fx.mateHeal)); return; }                                                  // 할 수 있어! — 옆 인형 최대 HP 25% (회복체질은 자기 회복만)
    if (fx.swap) { const m = mateSide(S, s); swapPos(S, s, m, u); S.sides[tkOf(S, s)].swapTurn = S.turn; return; }                      // 자리 바꾸기 — 편마다 한 턴에 한 번
    if (fx.showtime) { fieldUnits(S).forEach(function (x) { x.show = 2; }); u.showBy = s; S.field.showBy = s; log(S, 74); return; }
    if (fx.allyHeal) {
        const c = Math.min(ceil(u.max / 4), u.hp - 1); u.hp -= c; log(S, 52, { 사용자: u.name, 수치: c });
        const b = S.dbl ? benchTeam(S, s) : bench(S, s); const idx = b.indexOf(a.idx | 0) >= 0 ? (a.idx | 0) : b[0]; const t = sd.units[idx];   // 더블 — 같은 편 다른 탐사자의 대기 인형도
        heal(S, t, 2 * c); return;
    }
}

// ==========================================
// -1 턴 사이 정비
// ==========================================
function endTurn(S, rng) {
    const T = S.turn;
    const ORD = (S.order || ['A', 'B']).filter(function (s) { return !S.sides[s].out; });
    const field = ORD.map(function (s) { return { s: s, u: cur(S, s) }; }).filter(function (x) { return alive(x.u); });
    // -1.1 독 — 느린 쪽 → 낮은 레벨 → 무작위
    const poisoned = field.filter(function (x) { return x.u.status === 'poison'; });
    poisoned.sort(function (a, b) { const d = speed(a.u) - speed(b.u); if (d) return d; const l = a.u.lv - b.u.lv; if (l) return l; return rng() < 0.5 ? -1 : 1; });
    poisoned.forEach(function (x) {
        const u = x.u; if (!alive(u)) return;
        const q = ceil(u.max / 16); const H = u.hp;
        let after = Math.max(0, H - q);
        if (after === 0 && u.guard === 'endure') { after = 1; }
        u.hp = after; log(S, 24, { 대상: u.name, 수치: H - after });
        if (after === 1 && H - q <= 0) { log(S, 18, { 대상: u.name }); unyield(S, u); }
        if (u.hp === 0) faint(S, u, { k: 'poison' });
    });
    // -1.2 도넛 지속 회복 (빠른 쪽부터)
    const donuts = ORD.map(function (s) { return cur(S, s); }).filter(function (u) { return alive(u) && u.donut; }).sort(function (a, b) { return speed(b) - speed(a); });
    donuts.forEach(function (u) { heal(S, u, ceil(u.max / 16 * (has(u, 21) ? 1.2 : 1))); });
    // -1.3 강제 휴식 해제
    ORD.forEach(function (s) { const u = cur(S, s); if (alive(u) && u.restUntil === T) { u.restUntil = 0; log(S, 26, { 사용자: u.name }); if (canUse(u, 28)) { fire(S, u, 28); heal(S, u, ceil(u.max / 16)); } } });
    // -1.4 상태 카운트 · 자연 해제 (이번 턴에 등장한 인형은 제외)
    ORD.forEach(function (s) { const u = cur(S, s); if (!alive(u) || !(u.status === 'poison' || u.status === 'para') || (u.enteredTurn === T && u.enteredBy !== 'first') || u.stTurn === T) return; if (field.every(function (x) { return x.u !== u; })) return; u.sc++; if (u.sc >= 3 && rng() < 0.3) { log(S, 25, { 대상: u.name, 상태이상: ST_NAME[u.status] }); u.status = null; u.sc = 0; } });
    // -1.5 기간 종료 (더블 — 같은 목록을 두 번 돌지 않게 편마다 한 번)
    (S.order || ['A', 'B']).forEach(function (s) {
        if (S.dbl && tkOf(S, s) !== s) return;
        const sd = S.sides[s];
        sd.lure = null; sd.swapTurn = 0;                                 // 나를 봐! 는 쓴 턴만 · 자리 바꾸기 성공 기록도 넘기지 않는다
        sd.units.forEach(function (u) {
            u.cheer = 0;                                                 // 널 응원해! — 안 쓴 것도 턴이 끝나면 사라진다
            u.guardLast = (u.guard === 'full' && u.guardFired && alive(u));
            u.guard = null; u.guardFired = false; u.flinch = false; u.decoyUsedTurn = 0; u.runeGuard = null;
            if (u.prio3 > 0) { u.prio3--; if (u.prio3 === 0 && alive(u)) log(S, 30, { 사용자: u.name, 효과명: '선제태세' }); }
            if (u.limit && u.limit.until <= T) { if (alive(u)) log(S, 30, { 사용자: u.name, 효과명: u.limit.kind === 'util' ? '유틸기 제한' : '반복 기술 제한' }); u.limit = null; }
        });
    });
    if (S.field.reverse && S.field.reverse.to <= T) { S.field.reverse = null; log(S, 66, { 효과명: '황룡의 계약' }); }
    // -1.6 쇼 타임!
    const shows = field.filter(function (x) { return alive(x.u) && x.u.show != null && cur(S, x.s) === x.u; });
    const showTeam = S.field.showBy ? isFoe(S, S.field.showBy) : null;
    shows.forEach(function (x) { x.r = rng(); });
    shows.sort(function (a, b) {
        const d = speed(a.u) - speed(b.u); if (d) return d; const l = a.u.lv - b.u.lv; if (l) return l;
        if (!S.dbl) return (a.s === S.field.showBy) ? 1 : -1;
        const ma = isFoe(S, a.s) === showTeam, mb = isFoe(S, b.s) === showTeam;      // 더블 — 시전자 기준 상대 진영 먼저 · 같은 진영이면 무작위
        if (ma !== mb) return ma ? 1 : -1;
        return a.r - b.r;
    });
    shows.forEach(function (x) { const u = x.u; if (!alive(u) || u.show == null) return; log(S, 75, { 대상: u.name, 남은턴: u.show }); if (u.show === 0) { u.hp = 0; faint(S, u, { k: 'show' }); } else u.show--; });
}

// ==========================================
// E1 — 전투 뒤 성장 (돌려줄 뿐 — 기록에 쓰는 것은 부르는 쪽)
// ==========================================
//   돌려주는 값 { win, units: [A 진영 인형들], bySide: { A: [...], C: [...], B: [...] } } — 상대(B) 쪽도 적어 둔다 (결투에서 양쪽이 제 기록을 쓴다)
function settle(S) {
    const D2 = C();
    const out = { win: S.over.win, units: [], bySide: {} };
    const win = S.over.win === 'A';
    const AL = allies(S);
    const joined = function (u) { return alive(u) && (u.enteredTurn | 0) > 0; };
    let NJ = 0; AL.forEach(function (x) { if (S.dbl && tkOf(S, x) !== x) return; S.sides[x].units.forEach(function (y) { if (joined(y)) NJ++; }); });
    (S.order || ['A', 'B']).forEach(function (s) {
        const list = [];
        if (S.dbl && tkOf(S, s) !== s) { out.bySide[s] = list; return; }      // 더블 — 같은 편 두 자리는 첫 자리에 모아 적는다
        S.sides[s].units.forEach(function (u, i) {
            const g = { side: s, idx: i, key: u.key, own: u.own || null, hp: u.hp, pp: u.pp, status: u.status ? { k: u.status, c: u.sc } : null, aid: u.aid, xp: 0, ev: {}, lv0: u.lv, lv: u.lv, up: 0, wait: false, lost: 0, part: !!(u.participated || u.enteredTurn) };
            // 노력치 — 완료한 유효 행동은 승패 무관
            STATS5.forEach(function (k) { if (u.evN[k]) g.ev[k] = u.evN[k]; });
            // 경험치 — PvE 승리 · 이 전투에 한 번이라도 나왔고 끝까지 살아남은 인형 (대기로 돌아가 있어도 · 레벨링 5 · 9 · 10 · DB-D4)
            //   N = 그런 아군 인형 수 (Lv 100 도 센다 · 받지는 않는다) — 쓰러뜨린 상대마다 같은 참여 집합으로 나눈다
            if (!isFoe(S, s) && win && S.mode === 'pve' && joined(u)) {
                S.sides.B.units.forEach(function (f) {
                    if (!f.fainted || f.caught) return;                         // 포옹 리본으로 데려간 인형은 경험치가 없다
                    if (NJ) g.xp += D2.xpWin(u.lv, f.lv, NJ);
                });
            }
            list.push(g);
        });
        out.bySide[s] = list;
    });
    out.units = out.bySide.A;
    AL.forEach(function (s) {
        (out.bySide[s] || []).forEach(function (g) {
            const u = S.sides[s].units[g.idx];
            if (g.xp) {
                log(S, 40, { 사용자: u.name, 수치: g.xp }, 'grow', { s: s });
                const rec = copy(u.rec); rec.hp = u.hp;
                const r = D2.addXp(rec, g.xp);
                g.lv = r.lv; g.up = r.up; g.xpNow = r.xp; g.lost = r.lost; g.wait = r.wait; g.hpAfter = rec.hp; g.gAfter = rec.g;
                if (r.up) log(S, 41, { 사용자: u.name, 레벨: r.lv }, 'grow', { s: s });
                if (r.wait) log(S, 42, {}, 'grow', { s: s });
                if (r.lost) log(S, 112, {}, 'grow', { s: s });
            }
            Object.keys(g.ev).forEach(function (k) {
                const rec = copy(u.rec); const r = D2.evAdd(rec, k, g.ev[k]);
                if (r && r.up) log(S, 43, { 사용자: u.name, 능력치: D2.NAME[k], 수치: r.up }, 'grow', { s: s });
            });
        });
    });
    return out;
}
// 기록에 적는다 — grow 를 받아 u.pets 에 (hp · pp · 상태 · 경험치 · 노력치). side 를 주면 그 진영의 것을 (기본 A) · u 는 기록 주인
function applyGrow(grow, recs, side, u) {
    const D2 = C(), D = DL();
    const p = {};
    const list = (grow.bySide && grow.bySide[side || 'A']) || grow.units || [];
    list.forEach(function (g) {
        const rec = recs[g.idx]; if (!rec || !rec.id) return;
        const id = rec.id;
        const gpp = (g.pp && typeof g.pp === 'object') ? g.pp : {}, gev = (g.ev && typeof g.ev === 'object') ? g.ev : {};   // 서버를 거치면 빈 칸이 사라진다
        rec.hp = Math.max(0, g.hp | 0); p['pets/' + id + '/hp'] = rec.hp;
        rec.pp = Object.assign({}, rec.pp || {}); Object.keys(gpp).forEach(function (no) { if (gpp[no] != null) rec.pp[no] = gpp[no]; }); p['pets/' + id + '/pp'] = rec.pp;
        rec.st = g.status || null; p['pets/' + id + '/st'] = g.status || null;
        rec.aid = g.aid | 0; p['pets/' + id + '/aid'] = g.aid | 0;
        if (g.xp) { D2.addXp(rec, g.xp); p['pets/' + id + '/lv'] = rec.lv; p['pets/' + id + '/xp'] = rec.xp; p['pets/' + id + '/hp'] = rec.hp; }
        Object.keys(gev).forEach(function (k) { D2.evAdd(rec, k, gev[k]); }); if (Object.keys(gev).length) p['pets/' + id + '/ev'] = rec.ev;
    });
    if (D && Object.keys(p).length) return D.put(p, u);
    return Promise.resolve(false);
}

window.D2BT = { MSG: MSG, TRAIT: TRAIT, ONCE: ONCE, EVA: EVA, ST_NAME: ST_NAME, fmt: fmt, fix: fix, jong: jong, rankMul: rankMul,
    unitOf: unitOf, foeOf: foeOf, start: start, turn: turn, refill: refill, refillNeed: refillNeed, link: link, foes: foes, allies: allies, isFoe: isFoe, teamAlive: teamAlive, tkOf: tkOf, tgtKind: tgtKind, mateSide: mateSide, benchTeam: benchTeam, sideOfKey: sideOfKey, ai: ai, settle: settle, applyGrow: applyGrow, cur: cur, alive: alive, bench: bench, usableList: usableList, allowedBy: allowedBy, speed: speed, eff: eff };

// ==========================================
// 콘솔 — 시연
// ==========================================
window.d2Fight = function (lvA, lvB, turns, seed) {
    const D2 = C(), SK = K();
    seed = seed || ('demo' + Date.now());
    const r = D2.rngOf(seed);
    const mk = function (lv, id) { const d = D2.mk(lv, { rng: r }); d.id = id; d.att = ['wet', 'heat', 'cold', 'scent', 'noise'][Math.floor(r() * 5)]; const f = SK.fixMv(d, r); d.mv = f.mv; d.pp = f.pp; d.nick = (id === 'a' ? '내 인형' : '상대'); return d; };
    const my = [mk(lvA || 10, 'a')], foe = [mk(lvB || 10, 'b')];
    let S = start({ my: my, foe: foe.map(function (d) { return { rec: d, name: '상대 인형' }; }), auto: { A: true, B: true }, seed: seed });
    S.log.forEach(function (l) { console.log('  ' + l.t); });
    for (let t = 0; t < (turns || 20) && !S.over; t++) {
        console.log('%c── ' + S.turn + '턴', 'color:#9fd8ef');
        const o = turn(S, { seed: seed });
        o.log.forEach(function (l) { console.log('  ' + l.t); });
        S = o.S;
        if (o.need) { console.log('  (선택 필요)', o.need); break; }
    }
    const a = cur(S, 'A'), b = cur(S, 'B');
    console.log('끝 — 내 인형 HP ' + a.hp + '/' + a.max + ' · 상대 HP ' + b.hp + '/' + b.max + (S.over ? ' · ' + (S.over.win === 'A' ? '승' : '패') : ''));
    return S;
};
console.log('[🧸 2차] d2Fight(내Lv, 상대Lv, 턴수, 씨앗)');
})();
