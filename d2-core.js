// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 바탕 (개체치 · 성격 · 레벨 1~100 · 경험치 · 각성 돌파 · 노력치)
// bundles.json 마지막 묶음 — doll-data.js · awk-rune.js 뒤 (DOLL · PET · AWK 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 1단계
//   기획 탭 「개체치」「레벨링」「노력치」「공통 규칙 10」 을 그대로 옮겼다.
//   ★ 아직 전투 · 화면에 쓰지 않는다. 플레이어에게는 그대로 보이고, 상담사 콘솔 d2State() · d2Roll() 로만 본다.
//     전투 코어(3단계)가 서면 한꺼번에 갈아 끼운다 (migrateAll).
//
// ■ 능력치 여섯 — HP 와 다섯 (공격력 atk · 매력 chm · 방어력 def · 굳건함 sta · 속도 spd)
//   개체치 B   Lv.1 기본값. 특기 2종은 15~30, 일반 3종은 0~20, HP(H₀)는 18~22. 개체마다 다르고 한 번 정해지면 안 바뀐다.
//   성격 pr    특기 2종의 조합 번호 1~10 (당돌한 … 침착한). 이름일 뿐 보정은 없다.
//   레벨 성장  특기 +2 / 일반 +1 · HP +2 (레벨마다)
//   노력치 E   능력치마다 유효 행동 N 회 (0~1500) → E = min(30, floor(N ÷ 50)). HP 에는 없다.
//   현재 능력치 S = B + (L − 1) × G + E      최대 HP = H₀ + 2 × (L − 1)
//
// ■ 레벨 · 등급 · 돌파
//   Lv 1~100. 등급은 레벨 구간 — D 1~10 · C 11~20 · B 21~30 · A 31~40 · S 41~100.
//   R(L) = ceil(20 + 4L + 0.6L²) 가 다음 레벨까지 필요한 경험치. Lv.100 누적 218,830.
//   10 · 20 · 30 · 40 에서는 **각성 돌파**(기존 각성의 룬 · awk-rune.js) 전에는 안 오른다 — 경험치는 R(L) 까지만 쌓이고 넘치는 몫은 사라진다.
//   돌파하면 레벨은 그대로, 등급만 다음으로 (예전처럼 Lv 1 로 되돌리지 않는다). 쌓인 경험치가 R(L) 이면 바로 다음 레벨.
//   승리 경험치  X₀ = 12 + 6 × L상대 · M = clamp(1 + 0.05 × (L상대 − L자신), 0.2, 1.75) · X = ceil((X₀ ÷ N) × M)   (PvE 승리 · 기절 안 한 참가 개체만)
//   레벨이 오르면 최대 HP 와 현재 HP 가 같은 만큼(2 × 오른 레벨 수) 는다 — 잃은 HP 는 그대로.
//
// ■ 야생 — D(Lv 1~10) 또는 C(Lv 11~20) 로만 나온다. 비율은 기획에서 미정 → 예전 rollGrade 의 D:C 비율대로 D 70% · C 30%. 노력치는 0.
//
// ■ 인형 기록에 더해지는 것 (u.pets[열쇠])
//   iv  { atk, chm, def, sta, spd, hp }   Lv.1 개체치 (B · H₀)
//   pr  1~10                              성격(특기 조합) 번호
//   ev  { atk, chm, def, sta, spd }       유효 행동 누적 횟수 N (노력치는 여기서 센다)
//   lv · xp · g · hp                      예전 자리 그대로 (lv 는 갈아 끼울 때 구간으로 옮긴다 — 아래 lvMap)
//   d2  1                                 새 모델로 옮겨 왔다는 표
//
// ■ 옮겨 오기 (migrateAll — 3단계 뒤 한 번)
//   개체치 · 성격이 없는 인형은 열쇠·태어난 때로 늘 같은 값을 뽑는다(결정적 난수) — 기기마다 같은 값이 나오게. 지금은 iv · pr 만 미리 적어 둔다 (fixIv · 5초마다).
//   레벨은 예전 「등급마다 Lv 1 부터」 를 새 구간으로 — 등급 구간 안에 들어오게 (C Lv 3 → 11 · C Lv 15 → 15). 등급은 안 내려간다.
//   HP 는 비율을 지킨다.
//
// ■ 콘솔
//   d2State()        내 인형들 — 새 모델의 능력치
//   d2Roll(종, 등급)  야생 한 마리 뽑아 보기 (저장 안 함)
//   d2Xp(자신Lv, 상대Lv, N)  승리 경험치 셈

(function d2core() {
'use strict';

const KEYS = ['atk', 'chm', 'def', 'sta', 'spd'];
const NAME = { atk: '공격력', chm: '매력', def: '방어력', sta: '굳건함', spd: '속도', hp: 'HP' };
const SHORT = { atk: '공', chm: '매', def: '방', sta: '굳', spd: '속', hp: 'HP' };
// 성격 10 — 특기 두 가지의 조합 (기획 「개체치」 3)
const PERS = [
    null,
    { a: 'atk', b: 'chm', n: '당돌한' }, { a: 'atk', b: 'def', n: '씩씩한' }, { a: 'atk', b: 'sta', n: '고집 센' }, { a: 'atk', b: 'spd', n: '성급한' },
    { a: 'chm', b: 'def', n: '다정한' }, { a: 'chm', b: 'sta', n: '의젓한' }, { a: 'chm', b: 'spd', n: '명랑한' },
    { a: 'def', b: 'sta', n: '신중한' }, { a: 'def', b: 'spd', n: '부지런한' },
    { a: 'sta', b: 'spd', n: '침착한' }
];
const IV = { spec: [15, 30], norm: [0, 20], hp: [18, 22] };
const GROW = { spec: 2, norm: 1, hp: 2 };
const EV_PER = 50, EV_MAX = 30, EV_N_MAX = 1500;
const LV_MAX = 100;
const GRADES = ['D', 'C', 'B', 'A', 'S'];
const CAP = { D: 10, C: 20, B: 30, A: 40, S: 100 };          // 등급의 상한 레벨 (돌파 지점)
const MIN = { D: 1, C: 11, B: 21, A: 31, S: 41 };
const WILD_C = 0.30;                                           // 야생 C 비율 (D 70%)

function P() { return window.PET; }
function DL() { return window.DOLL; }
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function int(v, d) { v = Number(v); return isFinite(v) ? Math.floor(v) : (d || 0); }

// ── 결정적 난수 — 같은 열쇠 · 같은 태어난 때면 어느 기기에서나 같은 값
function hash(s) { let h = 2166136261 >>> 0; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rngOf(seed) {
    let a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function rint(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }

// ==========================================
// 개체치 · 성격
// ==========================================
function perOf(d) { const p = PERS[int(d && d.pr)]; return p || PERS[1]; }
function isSpec(d, k) { const p = perOf(d); return p.a === k || p.b === k; }
function growth(d, k) { return k === 'hp' ? GROW.hp : (isSpec(d, k) ? GROW.spec : GROW.norm); }
// 개체치 뽑기 — 성격 1~10 균등, 특기 15~30, 일반 0~20, HP 18~22 (r 은 난수 함수 · 없으면 Math.random)
function rollIv(r) {
    r = r || Math.random;
    const pr = rint(r, 1, 10), p = PERS[pr], iv = {};
    KEYS.forEach(function (k) { const spec = (p.a === k || p.b === k); iv[k] = spec ? rint(r, IV.spec[0], IV.spec[1]) : rint(r, IV.norm[0], IV.norm[1]); });
    iv.hp = rint(r, IV.hp[0], IV.hp[1]);
    return { pr: pr, iv: iv };
}
// 기록이 없는 인형의 개체치 — 열쇠 · 태어난 때 · 종으로 늘 같은 값
function ivFallback(d) { return rollIv(rngOf('d2:' + String((d && d.id) || '') + ':' + String((d && d.at) || 0) + ':' + String((d && d.sp) || ''))); }
function ivOf(d) {
    if (d && d.iv && PERS[int(d.pr)]) { const iv = {}; KEYS.concat(['hp']).forEach(function (k) { iv[k] = int(d.iv[k]); }); return { pr: int(d.pr), iv: iv }; }
    return ivFallback(d);
}
function baseOf(d, k) { return ivOf(d).iv[k] || 0; }

// ==========================================
// 노력치
// ==========================================
function evN(d, k) { return clamp(int(d && d.ev && d.ev[k]), 0, EV_N_MAX); }
function evOf(d, k) { return k === 'hp' ? 0 : Math.min(EV_MAX, Math.floor(evN(d, k) / EV_PER)); }
function evLeft(d, k) { const e = evOf(d, k); return e >= EV_MAX ? 0 : EV_PER - (evN(d, k) % EV_PER); }
// 유효 행동을 더한다 — 돌려주는 값 { n, e, up } (전투 끝에 한 번 정산한다 · 기획 노력치 27)
function evAdd(d, k, n) {
    if (KEYS.indexOf(k) < 0) return null;
    const was = evOf(d, k);
    d.ev = d.ev || {};
    d.ev[k] = clamp(evN(d, k) + Math.max(0, int(n)), 0, EV_N_MAX);
    return { n: d.ev[k], e: evOf(d, k), up: evOf(d, k) - was };
}

// ==========================================
// 레벨 · 등급 · 경험치
// ==========================================
function lvOf(d) { return clamp(int(d && d.lv) || 1, 1, LV_MAX); }
function gOf(d) { const g = d && d.g; return GRADES.indexOf(g) >= 0 ? g : gradeOfLv(lvOf(d)); }
function gradeOfLv(lv) { lv = clamp(int(lv) || 1, 1, LV_MAX); return lv <= 10 ? 'D' : lv <= 20 ? 'C' : lv <= 30 ? 'B' : lv <= 40 ? 'A' : 'S'; }
function capOf(d) { return CAP[gOf(d)] || LV_MAX; }
function R(lv) { lv = clamp(int(lv) || 1, 1, LV_MAX); return lv >= LV_MAX ? 0 : Math.ceil(20 + 4 * lv + 0.6 * lv * lv); }
function cum(lv) { let s = 0; for (let k = 1; k < clamp(int(lv) || 1, 1, LV_MAX); k++) s += R(k); return s; }
// 승리 경험치 — 자신 Lv · 상대 Lv · 나눠 받는 수 N (기획 「레벨링」 2)
function xpWin(myLv, foeLv, N) {
    myLv = clamp(int(myLv) || 1, 1, LV_MAX); foeLv = clamp(int(foeLv) || 1, 1, LV_MAX); N = Math.max(1, int(N) || 1);
    if (myLv >= LV_MAX) return 0;
    const X0 = 12 + 6 * foeLv;
    const M = clamp(1 + 0.05 * (foeLv - myLv), 0.2, 1.75);
    return Math.ceil((X0 / N) * M);
}
// 경험치를 더한다 — 돌파 지점(등급 상한)에서는 R(L) 까지만 쌓고 넘치는 몫은 사라진다. 돌려주는 값 { lv0, lv, up, xp, lost, dHp }
function addXp(d, n) {
    const lv0 = lvOf(d), cap = capOf(d);
    let lv = lv0, xp = Math.max(0, int(d && d.xp)) + Math.max(0, int(n)), lost = 0;
    while (lv < cap && lv < LV_MAX && xp >= R(lv)) { xp -= R(lv); lv++; }
    if (lv >= LV_MAX) { lost += xp; xp = 0; }
    else if (lv >= cap) { const keep = R(lv); if (xp > keep) { lost += xp - keep; xp = keep; } }
    const up = lv - lv0, dHp = GROW.hp * up;
    d.lv = lv; d.xp = xp;
    if (up && d.hp != null) d.hp = Math.max(0, int(d.hp)) + dHp;       // 잃은 HP 는 그대로 — 최대와 현재가 같이 는다
    return { lv0: lv0, lv: lv, up: up, xp: xp, lost: lost, dHp: dHp, wait: lv >= cap && lv < LV_MAX && xp >= R(lv) };
}
// 돌파를 기다리나 — 상한 레벨이고 경험치가 R(L) 에 닿았나 (룬이 있는지는 따로 — breakNeed)
function waiting(d) { const lv = lvOf(d); return lv >= capOf(d) && lv < LV_MAX; }
function breakNeed(d, u) {
    const g = gOf(d), gi = GRADES.indexOf(g);
    if (gi >= GRADES.length - 1) return { ok: false, why: '이미 S 등급입니다.' };
    const lv = lvOf(d), cap = CAP[g];
    if (lv < cap) return { ok: false, why: 'Lv ' + cap + ' 이 되어야 합니다.', cap: cap };
    const g1 = GRADES[gi + 1], A = window.AWK;
    const rune = A ? A.RUNE(g1) : g1 + '급 각성의 룬', have = A ? A.have(rune, u || u_()) : 0;
    if (!have) return { ok: false, why: rune + '이 필요합니다.', rune: rune, have: 0, cap: cap };
    return { ok: true, rune: rune, have: have, to: g1, cap: cap };
}
// 돌파 — 등급만 다음으로. 레벨 그대로. 쌓인 경험치가 R(L) 이면 바로 오른다. (룬은 부르는 쪽에서 뺀다 — 3단계 통합 때)
function breakUp(d) {
    const g = gOf(d), gi = GRADES.indexOf(g);
    if (gi >= GRADES.length - 1 || lvOf(d) < CAP[g]) return null;
    d.g = GRADES[gi + 1];
    const r = addXp(d, 0);
    return { from: g, to: d.g, lv: r.lv, up: r.up };
}

// ==========================================
// 현재 능력치
// ==========================================
function stat(d, k) {
    const lv = lvOf(d);
    if (k === 'hp') return baseOf(d, 'hp') + GROW.hp * (lv - 1);
    return baseOf(d, k) + (lv - 1) * growth(d, k) + evOf(d, k);
}
function maxHp(d) { return stat(d, 'hp'); }
function hpOf(d) { const m = maxHp(d); const h = (d && d.hp != null) ? int(d.hp) : m; return clamp(h, 0, m); }
function statsOf(d) {
    const o = { lv: lvOf(d), g: gOf(d), pr: ivOf(d).pr, per: perOf(d).n, max: maxHp(d), hp: hpOf(d) };
    KEYS.forEach(function (k) { o[k] = stat(d, k); });
    return o;
}
function statText(d) { const s = statsOf(d); return 'HP ' + s.hp + '/' + s.max + ' · ' + KEYS.map(function (k) { return SHORT[k] + ' ' + s[k] + (isSpec(d, k) ? '★' : ''); }).join(' · '); }

// ==========================================
// 야생 · 새 인형 만들기
// ==========================================
//   D(Lv 1~10) 70% · C(Lv 11~20) 30%. 노력치 0. 돌려주는 값은 기록 조각 { g, lv, xp, iv, pr, ev, hp, d2 } — sp · att · at 는 부르는 쪽이 붙인다.
function rollWild(opt) {
    opt = opt || {};
    const r = opt.rng || Math.random;
    const g = opt.g && CAP[opt.g] ? opt.g : (r() < WILD_C ? 'C' : 'D');
    const lv = opt.lv ? clamp(int(opt.lv), MIN[g], CAP[g]) : rint(r, MIN[g], CAP[g]);
    const iv = rollIv(r);
    const d = { g: g, lv: lv, xp: 0, iv: iv.iv, pr: iv.pr, ev: { atk: 0, chm: 0, def: 0, sta: 0, spd: 0 }, d2: 1 };
    d.hp = maxHp(d);
    return d;
}
// 아무 레벨의 개체 (상대 · 시험용)
function mk(lv, opt) { const d = rollWild({ rng: opt && opt.rng, g: gradeOfLv(lv), lv: lv }); if (opt && opt.pr) { d.pr = opt.pr; } if (opt && opt.iv) { d.iv = Object.assign({}, d.iv, opt.iv); d.hp = maxHp(d); } return d; }

// ==========================================
// 옮겨 오기
// ==========================================
// 예전 레벨(등급마다 Lv 1 부터) → 새 구간 레벨. 등급은 그대로, 구간 안으로.
function lvMap(g, lv) { g = GRADES.indexOf(g) >= 0 ? g : 'D'; return clamp(int(lv) || 1, MIN[g], CAP[g]); }
// 한 마리 — 기록 조각을 돌려준다 (저장은 부르는 쪽). all 이 참이면 레벨 · HP 까지 (갈아 끼울 때), 아니면 iv · pr 만.
function fixOne(d, all) {
    const p = {};
    if (!(d.iv && PERS[int(d.pr)])) { const f = ivFallback(d); p.iv = f.iv; p.pr = f.pr; }
    if (all) {
        const g = GRADES.indexOf(d.g) >= 0 ? d.g : 'D';
        const was = Object.assign({}, d, p), max0 = (function () { try { return DL().stats(d).max; } catch (e) { return 0; } })();
        p.lv = lvMap(g, d.lv); p.g = g;
        if (!d.ev) p.ev = { atk: 0, chm: 0, def: 0, sta: 0, spd: 0 };
        const tmp = Object.assign({}, was, p);
        const max1 = maxHp(tmp);
        p.hp = (max0 > 0 && d.hp != null) ? Math.max(1, Math.round(max1 * clamp(int(d.hp) / max0, 0, 1))) : max1;
        if (int(d.xp) > R(p.lv)) p.xp = R(p.lv);
        p.d2 = 1;
    }
    return p;
}
// 내 인형들 — iv · pr 만 미리 적어 둔다 (지금 · 5초마다). 값은 결정적이라 어느 기기에서 적어도 같다.
let fixBusy = false;
function fixIv() {
    const u = u_(), D = DL();
    if (!u || !u.code || !D || fixBusy) return;
    try { if (typeof window.clockReady === 'function' && !window.clockReady()) return; } catch (e) { }
    const ds = D.dolls(u), p = {};
    let n = 0;
    Object.keys(ds).forEach(function (id) {
        const d = ds[id];
        if (!d || (d.iv && PERS[int(d.pr)])) return;
        const f = fixOne(d, false);
        if (!f.iv) return;
        d.iv = f.iv; d.pr = f.pr; p['pets/' + id + '/iv'] = f.iv; p['pets/' + id + '/pr'] = f.pr; n++;
    });
    if (!n) return;
    fixBusy = true;
    D.put(p, u).then(function () { fixBusy = false; }, function () { fixBusy = false; });
}
// 전부 — 갈아 끼울 때 한 번 (3단계). 돌려주는 값은 쓴 조각 수.
function migrateAll(u) {
    u = u || u_(); const D = DL();
    if (!u || !u.code || !D) return Promise.resolve(0);
    const ds = D.dolls(u), p = {};
    let n = 0;
    Object.keys(ds).forEach(function (id) {
        const d = ds[id];
        if (!d || d.d2) return;
        const f = fixOne(d, true);
        Object.keys(f).forEach(function (k) { p['pets/' + id + '/' + k] = f[k]; d[k] = f[k]; });
        n++;
    });
    if (!n) return Promise.resolve(0);
    return D.put(p, u).then(function () { return n; });
}
setInterval(function () { try { fixIv(); } catch (e) { } }, 5000);

// ==========================================
// 바깥에 내어 준다
// ==========================================
window.D2 = {
    KEYS: KEYS, NAME: NAME, SHORT: SHORT, PERS: PERS, IV: IV, GROW: GROW, GRADES: GRADES, CAP: CAP, MIN: MIN, LV_MAX: LV_MAX,
    EV_PER: EV_PER, EV_MAX: EV_MAX, EV_N_MAX: EV_N_MAX, WILD_C: WILD_C,
    rngOf: rngOf, hash: hash,
    perOf: perOf, isSpec: isSpec, growth: growth, rollIv: rollIv, ivOf: ivOf, baseOf: baseOf,
    evN: evN, evOf: evOf, evLeft: evLeft, evAdd: evAdd,
    lvOf: lvOf, gOf: gOf, gradeOfLv: gradeOfLv, capOf: capOf, R: R, cum: cum, xpWin: xpWin, addXp: addXp, waiting: waiting, breakNeed: breakNeed, breakUp: breakUp,
    stat: stat, maxHp: maxHp, hpOf: hpOf, statsOf: statsOf, statText: statText,
    rollWild: rollWild, mk: mk,
    lvMap: lvMap, fixOne: fixOne, fixIv: fixIv, migrateAll: migrateAll
};

// ==========================================
// 콘솔
// ==========================================
window.d2State = function () {
    const u = u_(), D = DL();
    console.log('%c===== 🧸 인형 전투 2차 · 능력치 =====', 'color:#ffb74d; font-size:13px');
    if (!u || !D) { console.log('  로그인 전입니다.'); return; }
    const ds = D.dolls(u), keys = Object.keys(ds);
    if (!keys.length) { console.log('  인형이 없습니다.'); return; }
    console.table(keys.map(function (id) {
        const d = Object.assign({ id: id }, ds[id]);
        const v = Object.assign({}, d, fixOne(d, true));           // 갈아 끼웠을 때의 모습
        const s = statsOf(v), p = perOf(v);
        return { 열쇠: id, 이름: D.nickOf(d), 등급: s.g, '예전 Lv': d.lv || 1, '새 Lv': s.lv, 성격: p.n + ' (' + NAME[p.a] + '·' + NAME[p.b] + ')',
                 HP: s.hp + '/' + s.max, 공격력: s.atk, 매력: s.chm, 방어력: s.def, 굳건함: s.sta, 속도: s.spd,
                 '다음 Lv': R(s.lv) ? (int(v.xp) + '/' + R(s.lv)) : '최대', 돌파: waiting(v) ? '필요' : '-', 적혔나: d.d2 ? '✓' : (d.iv ? 'iv·pr 만' : '아직') };
    }));
};
window.d2Roll = function (g) {
    const d = rollWild({ g: g });
    const s = statsOf(d), p = perOf(d);
    console.log('%c야생 ' + s.g + ' Lv ' + s.lv + ' · ' + p.n + ' (' + NAME[p.a] + '·' + NAME[p.b] + ')', 'color:#9fd8ef');
    console.table([{ 구분: '개체치(Lv1)', HP: d.iv.hp, 공격력: d.iv.atk, 매력: d.iv.chm, 방어력: d.iv.def, 굳건함: d.iv.sta, 속도: d.iv.spd },
                   { 구분: '지금(Lv ' + s.lv + ')', HP: s.max, 공격력: s.atk, 매력: s.chm, 방어력: s.def, 굳건함: s.sta, 속도: s.spd }]);
    return d;
};
window.d2Xp = function (my, foe, N) { const x = xpWin(my, foe, N); console.log('자신 Lv ' + my + ' · 상대 Lv ' + foe + ' · N ' + (N || 1) + ' → ' + x + ' EXP'); return x; };
console.log('[🧸 2차] d2State() · d2Roll(등급) · d2Xp(자신Lv, 상대Lv, N)');
})();
