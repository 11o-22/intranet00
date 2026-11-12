// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 아이템 20 · 꿈결 상점 · 소지품 사용 (전투 안 · 밖)
// bundles.json 마지막 묶음 — d2-traits.js 뒤 (D2 · D2SK · D2BT · D2TR · DOLL · PET 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 5단계
//   기획 탭 「아이템」 과 「공통 규칙 09 · 13」「조는 도깨비 03」 을 옮겼다.
//   ★ 상점 창(D2IT.shopOpen)은 아직 조는 도깨비 메뉴에 안 붙였다 (마지막 단계에서 붙인다). 소지품 사용은 연결돼 있다 — 가진 사람이 아직 없다.
//
// ■ 일반 소모품 20 — 이름은 기획 그대로 (이모지 없음). 가격은 꿈결.
//   HP 회복   작은 솜뭉치 20 · 폭신한 솜뭉치 40 · 최고급 충전솜 70
//   PP 회복   작은 실타래 30 (기술 하나 +3) · 튼튼한 실타래 55 (기술 하나 전부) · 무지개 실타래 95 (끼운 것 전부)
//   상태 치료 보랏빛 얼룩제거제 20 (독) · 엉킨 실 풀개 20 (마비) · 만능 수선도구 35 (독·마비·아홉여우병)
//   기절 회복 응급 바느질 세트 85 (25%) · 기적의 금실 100 (가득)
//   도핑      뾰족한 바늘 · 반짝이 단추 · 두꺼운 덧댐천 · 촘촘한 박음질 75 · 태엽 발바닥 · 초점 단추눈 · 미끄러운 안감 80 — 전투 중 필드 인형만 · 랭크 +1 · 어떤 교체로든 사라진다
//   훈련 보조 연습용 바늘쌈지 90 (유효 행동 10회) · 숙련공의 바늘쌈지 100 (20회) — 노력치 진행도 2배 (u.pets[열쇠].aid)
//   + 택 로고 각인기 100,000 (d2-traits.js · 비전투 전용)
//
// ■ 사용 (공통 규칙 13 · 아이템 07~09)
//   소지품 → 사용 → 동행 인형 목록(MSG-077) → 조건 확인(MSG-084·085·086·017·088·089·090·092) → (단일 PP 는 기술창 MSG-078) → 확인(MSG-079) → 적용(MSG-080 + 결과) → 성공할 때만 1개 차감
//   전투 중에는 탐사자의 1턴 행동(+3) — 엔진이 D2IT.use 를 부른다. 확정 뒤 무효면 「그러나 효과가 없었다!」 · 턴은 쓰고 물건은 안 쓴다.
//   도핑은 전투 중에만(MSG-087) · 각인기는 전투 밖에서만(MSG-114).
//
// ■ 콘솔
//   d2Items()      아이템 표
//   d2ShopOpen()   꿈결 상점 창 (조는 도깨비 「도깨비 상점」 이 될 것)
//   d2ItemUse(이름) 소지품에서 쓰는 것과 같다

(function d2items() {
'use strict';

const G = { hp: 'HP 회복', pp: 'PP 회복', cure: '상태 치료', revive: '기절 회복', dope: '전투용 도핑', aid: '노력치 훈련 보조', eng: '각인' };
const ITEMS = {
    '작은 솜뭉치':      { g: 'hp', p: 20,  fx: { heal: 0.25 }, d: '벌어진 솔기를 살짝 메워 주는 부드러운 솜. 인형 하나의 최대 HP의 25%를 회복한다.' },
    '폭신한 솜뭉치':    { g: 'hp', p: 40,  fx: { heal: 0.5 },  d: '빈틈을 꾹꾹 채워 주는 폭신한 솜. 인형 하나의 최대 HP의 50%를 회복한다.' },
    '최고급 충전솜':    { g: 'hp', p: 70,  fx: { heal: 1 },    d: '풀이 죽은 몸을 새것처럼 채워 주는 충전솜. 인형 하나의 HP를 모두 회복한다.' },
    '작은 실타래':      { g: 'pp', p: 30,  fx: { pp: 3 },      d: '느슨해진 기술의 매듭을 다시 잇는 실. 인형 하나의 선택한 기술 PP를 3 회복한다.' },
    '튼튼한 실타래':    { g: 'pp', p: 55,  fx: { pp: 'full' }, d: '해진 기술의 실을 끝까지 이어 주는 튼튼한 실. 인형 하나의 선택한 기술 PP를 전부 회복한다.' },
    '무지개 실타래':    { g: 'pp', p: 95,  fx: { pp: 'all' },  d: '다섯 매듭을 한꺼번에 고쳐 잇는 알록달록한 실. 인형 하나가 현재 장착한 모든 기술의 PP를 전부 회복한다.' },
    '보랏빛 얼룩제거제': { g: 'cure', p: 20, fx: { cure: ['poison'] }, d: '천에 스민 보랏빛 얼룩을 말끔히 닦아 낸다. 인형 하나의 독을 치료한다.' },
    '엉킨 실 풀개':     { g: 'cure', p: 20, fx: { cure: ['para'] },   d: '꼬인 실을 풀어 뻣뻣해진 몸을 움직이게 한다. 인형 하나의 마비를 치료한다.' },
    '만능 수선도구':    { g: 'cure', p: 35, fx: { cure: ['poison', 'para', 'fox'] }, d: '까다로운 얼룩과 매듭도 손보는 작은 도구함. 인형 하나에게 걸린 독·마비·아홉여우병을 치료한다.' },
    '응급 바느질 세트': { g: 'revive', p: 85,  fx: { revive: 0.25 }, d: '풀려 버린 솔기를 급히 이어 다시 움직이게 한다. 기절한 인형 하나를 최대 HP의 25%로 되살린다.' },
    '기적의 금실':      { g: 'revive', p: 100, fx: { revive: 1 },    d: '끊어진 꿈까지 이어 준다는 귀한 금빛 실. 기절한 인형 하나를 HP가 가득 찬 상태로 되살린다.' },
    '뾰족한 바늘':      { g: 'dope', p: 75, fx: { dope: 'atk' }, d: '힘을 실어 주는 날카로운 바늘. 이번 전투에서 공격력을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '반짝이 단추':      { g: 'dope', p: 75, fx: { dope: 'chm' }, d: '표정을 반짝이게 해 주는 새 단추. 이번 전투에서 매력을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '두꺼운 덧댐천':    { g: 'dope', p: 75, fx: { dope: 'def' }, d: '약한 솔기를 감싸 주는 두꺼운 천. 이번 전투에서 방어력을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '촘촘한 박음질':    { g: 'dope', p: 75, fx: { dope: 'sta' }, d: '마음까지 단단히 붙드는 작은 수선 키트. 이번 전투에서 굳건함을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '태엽 발바닥':      { g: 'dope', p: 80, fx: { dope: 'spd' }, d: '솜발의 발걸음을 재촉하는 작은 태엽. 이번 전투에서 속도를 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '초점 단추눈':      { g: 'dope', p: 80, fx: { dope: 'acc' }, d: '상대를 또렷이 보게 해 주는 단추눈. 이번 전투에서 명중률을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '미끄러운 안감':    { g: 'dope', p: 80, fx: { dope: 'eva' }, d: '공격을 비껴 가기 좋은 매끈한 안감. 이번 전투에서 회피율을 1랭크 올린다. 어떤 교체로든 효과가 사라진다.' },
    '연습용 바늘쌈지':  { g: 'aid', p: 90,  fx: { aid: 10 }, d: '서툰 바느질을 도와 주는 연습 도구. 인형 하나의 다음 유효 훈련 행동 10회에서 노력치 진행 횟수를 2배로 기록한다.' },
    '숙련공의 바늘쌈지': { g: 'aid', p: 100, fx: { aid: 20 }, d: '익숙한 손놀림을 빌려 주는 숙련공의 도구. 인형 하나의 다음 유효 훈련 행동 20회에서 노력치 진행 횟수를 2배로 기록한다.' }
};
const ORDER = Object.keys(ITEMS);
const GROUPS = ['hp', 'pp', 'cure', 'revive', 'dope', 'aid'];

function D2() { return window.D2; }
function SK() { return window.D2SK; }
function BT() { return window.D2BT; }
function TR() { return window.D2TR; }
function DL() { return window.DOLL; }
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function fix(t) { try { return BT().fix(t); } catch (e) { return String(t); } }
function fmtN(n) { return (Number(n) || 0).toLocaleString('ko-KR'); }
function ceil(v) { return Math.ceil(v - 1e-9); }
function get(n) { return ITEMS[n] || null; }
function isItem(n) { return !!ITEMS[n]; }
function count(n, u) { u = u || u_(); return ((u && u.inventory) || []).filter(function (x) { return x === n; }).length; }
function dream(u) { u = u || u_(); return Math.max(0, Math.floor(Number(u && u.kroom && u.kroom.dream) || 0)); }
function inBattle() { try { return !!(window.D2BT_ACTIVE || document.getElementById('dbt-ov')); } catch (e) { return false; } }
function ST(k) { return BT().ST_NAME[k]; }

// ==========================================
// 쓸 수 있나 — 대상 조건 (아이템 09 · 2단계) · t 는 개체(전투) 또는 기록(밖) 을 감싼 공통 모양
//   view = { hp, max, status, equipped:[번호], ppOf(no), ppMax(no), aid, onField, alive }
// ==========================================
function viewOfUnit(u, onField) { return { hp: u.hp, max: u.max, status: u.status, equipped: SK().equipped(u), ppOf: function (no) { return u.pp[no] | 0; }, ppMax: function (no) { return SK().ppMax(no); }, aid: u.aid | 0, onField: !!onField, alive: !u.fainted && u.hp > 0 }; }
function viewOfRec(d) { const s = D2().statsOf(d); return { hp: s.hp, max: s.max, status: d.st && d.st.k ? d.st.k : null, equipped: SK().equipped(d), ppOf: function (no) { return SK().ppOf(d, no); }, ppMax: function (no) { return SK().ppMax(no); }, aid: d.aid | 0, onField: false, alive: s.hp > 0 }; }
function check(v, name, no, battle) {
    const it = get(name); if (!it) return { ok: false, why: '그런 아이템이 없습니다.' };
    const fx = it.fx;
    if (fx.dope) { if (!battle) return { ok: false, why: '이 아이템은 전투 중에만 사용할 수 있다!' }; if (!v.onField || !v.alive) return { ok: false, why: '현재 전투에 나와 있는 인형에게만 사용할 수 있다!' }; return { ok: true }; }
    if (fx.revive) { if (v.alive) return { ok: false, why: '기절한 인형에게만 사용할 수 있다!' }; return { ok: true }; }
    if (!v.alive) return { ok: false, why: '기절한 인형에게는 이 아이템을 사용할 수 없다!' };
    if (fx.heal) { if (v.hp >= v.max) return { ok: false, why: fix('{대상}의 HP는 이미 가득 차 있다!') }; return { ok: true }; }
    if (fx.cure) { if (!v.status || fx.cure.indexOf(v.status) < 0) return { ok: false, why: '이 아이템으로 치료할 상태이상이 없다!' }; return { ok: true }; }
    if (fx.aid) { if (v.aid > 0) return { ok: false, why: '이미 훈련을 돕고 있다!' }; return { ok: true }; }
    if (fx.pp) {
        const eq = v.equipped.filter(function (n) { return n !== 59; });
        if (fx.pp === 'all') { if (!eq.some(function (n) { return v.ppOf(n) < v.ppMax(n); })) return { ok: false, why: 'PP를 회복할 기술이 없다!' }; return { ok: true }; }
        if (!eq.some(function (n) { return v.ppOf(n) < v.ppMax(n); })) return { ok: false, why: 'PP를 회복할 기술이 없다!' };
        if (no == null) return { ok: true, needSkill: true };
        if (eq.indexOf(Number(no)) < 0) return { ok: false, why: 'PP를 회복할 기술이 없다!' };
        if (v.ppOf(no) >= v.ppMax(no)) return { ok: false, why: SK().get(no).n + '의 PP는 이미 가득 차 있다!' };
        return { ok: true };
    }
    return { ok: false, why: '그러나 효과가 없었다!' };
}

// ==========================================
// 전투 중 (+3 · I1~I2) — 엔진이 부른다. a = { k:'item', item, idx, no } · 성공하면 S.tcons 에 적어 두고 화면이 소지품에서 뺀다
// ==========================================
function use(S, s, a, rng, H) {
    const sd = S.sides[s], u = sd.units[a.idx != null ? a.idx : sd.act];
    const it = get(a.item);
    if (!u || !it) { H.log(S, 11); return; }
    H.log(S, 80, { 대상: u.name, 아이템명: a.item });
    // 더블 — 같은 편 다른 자리에 나와 있는 인형도 「나와 있음」 (도핑 등 · 같은 목록을 쓴다)
    const onF = S.dbl ? (S.order || []).some(function (x) { const y = S.sides[x]; return y && (y.tk || x) === (sd.tk || s) && y.act >= 0 && y.units[y.act] === u; }) : sd.units[sd.act] === u;
    const v = viewOfUnit(u, onF);
    const c = check(v, a.item, a.no, true);
    if (!c.ok || c.needSkill) { H.log(S, 11); return; }
    const fx = it.fx;
    let done = false;
    if (fx.heal) { const q = Math.min(u.max - u.hp, ceil(u.max * fx.heal)); if (q > 0) { u.hp += q; H.log(S, 16, { 대상: u.name, 수치: q }); done = true; } else H.log(S, 17, { 대상: u.name }); }
    else if (fx.pp) { done = ppApply(u, fx.pp, a.no, function (no, q) { H.log(S, 81, { 대상: u.name, 기술명: SK().get(no).n, 수치: q }); }); if (!done) H.log(S, 11); }
    else if (fx.cure) { if (u.status && fx.cure.indexOf(u.status) >= 0) { H.log(S, 25, { 대상: u.name, 상태이상: ST(u.status) }); u.status = null; u.sc = 0; u.foxBy = null; done = true; } else H.log(S, 11); }
    else if (fx.revive) { if (u.fainted || u.hp <= 0) { u.fainted = false; u.hp = Math.max(1, ceil(u.max * fx.revive)); H.log(S, 82, { 대상: u.name, 회복후HP: u.hp }); done = true; } else H.log(S, 11); }
    else if (fx.dope) { const d = H.rankChange(S, u, fx.dope, 1, 'self', { dope: 1 }); done = d > 0; if (!done) { /* 상한 — 한도 문구는 rankChange 가 냈다 */ } }
    else if (fx.aid) { if (u.aid > 0) H.log(S, 11); else { u.aid = fx.aid; H.log(S, 91, { 대상: u.name, 횟수: fx.aid }); done = true; } }
    if (done) { S.tcons.push({ s: s, item: a.item }); a.consumed = true; }
}
function ppApply(t, mode, no, say) {
    const eq = SK().equipped(t).filter(function (n) { return n !== 59; });
    let any = false;
    const setPp = function (n, v) { if (t.pp && typeof t.pp === 'object' && !t.rec) { t.pp[n] = v; } else if (t.pp) { t.pp[n] = v; } };
    const ppOf = function (n) { return t.rec ? (t.pp[n] | 0) : (t.pp && t.pp[n] != null ? Number(t.pp[n]) : SK().ppMax(n)); };
    if (mode === 'all') { eq.forEach(function (n) { const was = ppOf(n), mx = SK().ppMax(n); if (was < mx) { setPp(n, mx); say(n, mx - was); any = true; } }); return any; }
    if (eq.indexOf(Number(no)) < 0) return false;
    const was = ppOf(no), mx = SK().ppMax(no);
    const to = mode === 'full' ? mx : Math.min(mx, was + mode);
    if (to <= was) return false;
    setPp(no, to); say(no, to - was); return true;
}

// ==========================================
// 전투 밖 — 기록에 바로 (hp · pp · st · aid) · 저장
// ==========================================
function applyRec(d, name, no, u) {
    u = u || u_();
    const it = get(name), v = viewOfRec(d), c = check(v, name, no, false);
    if (!c.ok || c.needSkill) return { ok: false, why: c.why || '기술을 골라 주세요.' };
    const fx = it.fx, out = [], p = {}, id = d.id;
    out.push(fix('{대상}에게 {아이템명}을/를 사용했다!'.replace('{대상}', DL().nickOf(d)).replace('{아이템명}', name)));
    if (fx.heal) { const q = Math.min(v.max - v.hp, ceil(v.max * fx.heal)); d.hp = v.hp + q; p['pets/' + id + '/hp'] = d.hp; out.push(fix(DL().nickOf(d) + '의 HP가 ' + q + ' 회복되었다!')); }
    else if (fx.pp) { const rec = Object.assign(d, { pp: Object.assign({}, d.pp || {}) }); const got = ppApply({ pp: rec.pp, mv: d.mv, rec: 1 }, fx.pp, no, function (n, q) { out.push(fix(DL().nickOf(d) + '의 ' + SK().get(n).n + ' PP가 ' + q + ' 회복되었다!')); }); if (!got) return { ok: false, why: '그러나 효과가 없었다!' }; p['pets/' + id + '/pp'] = d.pp; }
    else if (fx.cure) { out.push(fix(DL().nickOf(d) + '의 ' + ST(v.status) + '이/가 해제되었다!')); d.st = null; p['pets/' + id + '/st'] = null; }
    else if (fx.revive) { d.hp = Math.max(1, ceil(v.max * fx.revive)); p['pets/' + id + '/hp'] = d.hp; out.push(fix(DL().nickOf(d) + '은/는 HP ' + d.hp + '로 다시 움직일 수 있게 되었다!')); }
    else if (fx.aid) { d.aid = fx.aid; p['pets/' + id + '/aid'] = d.aid; out.push(fix(DL().nickOf(d) + '의 훈련이 ' + fx.aid + '회의 유효 행동 동안 2배로 기록된다!')); }
    try { DL().put(p, u); } catch (e) { }
    try { if (window.DOLLPARTY && window.DOLLPARTY.syncDoll) window.DOLLPARTY.syncDoll(id); } catch (e) { }   // 여정 중이면 이 판의 인형 사본에도
    try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, name, 1); else { const i = u.inventory.indexOf(name); if (i >= 0) u.inventory.splice(i, 1); } } catch (e) { }
    try { if (typeof addHistoryLog === 'function') { addHistoryLog(u, '[🧸 아이템] ' + name + ' → ' + DL().nickOf(d)); } } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
    return { ok: true, msg: out.join('\n') };
}

// ==========================================
// 창 — 소지품 사용 (동행 인형 → 기술 → 확인)
// ==========================================
function css() {
    if (document.getElementById('d2i-css')) return;
    const s = document.createElement('style'); s.id = 'd2i-css';
    s.textContent = [
        '.d2i-dim{position:fixed;inset:0;z-index:99998;background:rgba(5,3,10,.6);display:flex;align-items:flex-end;justify-content:center}',
        '.d2i-pan{width:100%;max-width:440px;max-height:86vh;overflow:auto;background:#1c1528;border:2px solid #a78bdb;border-bottom:0;border-radius:14px 14px 0 0;padding:14px 14px calc(env(safe-area-inset-bottom) + 14px);color:#eee;font-size:13px}',
        '.d2i-pan h3{margin:0 0 8px;font-size:15px;color:#ffe6b8;display:flex;justify-content:space-between;align-items:center}',
        '.d2i-x{background:none;border:1px solid #666;color:#ccc;border-radius:6px;padding:3px 9px;font-size:12px}',
        '.d2i-row{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid #3d2f5c;border-radius:8px;margin:6px 0;background:rgba(0,0,0,.25)}',
        '.d2i-row .n{flex:1;min-width:0}.d2i-row .n b{display:block;font-size:13px}.d2i-row .n small{color:#a99cc4;font-size:11px;display:block}',
        '.d2i-btn{background:linear-gradient(145deg,#6b4a1d,#38250e);border:1px solid #ffd766;color:#ffe6b8;border-radius:8px;padding:8px 12px;font-size:13px;white-space:nowrap}',
        '.d2i-btn[disabled]{opacity:.4}.d2i-ghost{background:#2a2a2a;border:1px solid #555;color:#ccc;border-radius:8px;padding:8px 12px;font-size:13px;white-space:nowrap}',
        '.d2i-sub{color:#a99cc4;font-size:11px;margin:4px 0 8px}.d2i-eff{background:rgba(255,255,255,.04);border-radius:8px;padding:8px;margin:6px 0;font-size:12px;line-height:1.5;white-space:pre-wrap}',
        '.d2i-grp{color:#ffd766;font-size:12px;margin:10px 0 2px;border-bottom:1px solid #3d2f5c;padding-bottom:2px}',
        '.d2i-qty{display:flex;align-items:center;gap:6px}.d2i-qty button{width:26px;height:26px;border-radius:6px;border:1px solid #666;background:#2a2a2a;color:#eee}',
        '.d2i-bar{position:sticky;bottom:0;background:#1c1528;padding:8px 0 0;border-top:1px solid #3d2f5c;margin-top:8px;font-size:12px}'
    ].join('\n');
    document.head.appendChild(s);
}
let onShut = null;
function shut() { const e = document.getElementById('d2i-dim'); if (e) e.remove(); const f = onShut; onShut = null; if (typeof f === 'function') { try { f(); } catch (x) { } } }
function panel(title) {
    css(); shut();
    const dim = document.createElement('div'); dim.id = 'd2i-dim'; dim.className = 'd2i-dim';
    dim.addEventListener('click', function (e) { if (e.target === dim) shut(); });
    const pan = document.createElement('div'); pan.className = 'd2i-pan';
    dim.appendChild(pan); document.body.appendChild(dim);
    pan.innerHTML = '<h3>' + esc(title) + ' <button class="d2i-x">닫기</button></h3>';
    pan.querySelector('.d2i-x').onclick = shut;
    return pan;
}
function withDolls(u) { const D = DL(); const ds = D.dolls(u); let list = []; try { list = D.withList(u); } catch (e) { list = Object.keys(ds); } return list.map(function (k) { return ds[String(k)]; }).filter(Boolean); }
function useOpen(name) {
    const u = u_(), D = DL(); if (!u || !D || !isItem(name)) return;
    const it = get(name);
    if (it.fx.dope && !inBattle()) { alert_('이 아이템은 전투 중에만 사용할 수 있다!'); return; }
    if (inBattle()) { alert_('전투 중에는 전투 화면의 [소지품] 에서 쓴다.'); return; }
    const pan = panel(name + ' — 아이템을 사용할 동행 인형을 선택해 주세요.');
    let h = '<div class="d2i-sub">' + esc(it.d) + ' · 가진 것 ' + count(name, u) + '개</div>';
    const dolls = withDolls(u);
    if (!dolls.length) h += '<div class="d2i-eff">선택할 수 있는 인형이 없다!</div>';
    dolls.forEach(function (d, i) {
        const v = viewOfRec(d), c = check(v, name, null, false);
        h += '<div class="d2i-row" data-i="' + i + '"><div class="n"><b>' + esc(D.nickOf(d)) + '</b><small>Lv ' + D2().lvOf(d) + ' · HP ' + v.hp + '/' + v.max + (v.status ? ' · ' + esc(ST(v.status)) : '') + (v.aid ? ' · 훈련 보조 ' + v.aid + '회' : '') + '</small>' + (c.ok ? '' : '<small style="color:#d9534f">' + esc(c.why.replace('{대상}', D.nickOf(d))) + '</small>') + '</div><button class="d2i-btn"' + (c.ok ? '' : ' disabled') + '>선택</button></div>';
    });
    pan.insertAdjacentHTML('beforeend', h);
    Array.prototype.forEach.call(pan.querySelectorAll('.d2i-row'), function (row) {
        const d = dolls[Number(row.getAttribute('data-i'))];
        row.querySelector('button').onclick = function () { const c = check(viewOfRec(d), name, null, false); if (!c.ok) { alert_(c.why.replace('{대상}', D.nickOf(d))); return; } if (c.needSkill) skillOpen(name, d); else confirmOpen(name, d, null); };
    });
}
function skillOpen(name, d) {
    const D = DL(), pan = panel('PP를 회복할 기술을 선택해 주세요.');
    const v = viewOfRec(d);
    let h = '<div class="d2i-sub">' + esc(D.nickOf(d)) + ' · ' + esc(name) + '</div>';
    v.equipped.forEach(function (no) { const sk = SK().get(no); const full = v.ppOf(no) >= v.ppMax(no); h += '<div class="d2i-row" data-no="' + no + '"><div class="n"><b>' + esc(sk.n) + '</b><small>PP ' + v.ppOf(no) + '/' + v.ppMax(no) + (full ? ' · 이미 가득' : '') + '</small></div><button class="d2i-btn"' + (full ? ' disabled' : '') + '>선택</button></div>'; });
    h += '<div style="margin-top:8px"><button class="d2i-ghost d2i-back">뒤로</button></div>';
    pan.insertAdjacentHTML('beforeend', h);
    pan.querySelector('.d2i-back').onclick = function () { useOpen(name); };
    Array.prototype.forEach.call(pan.querySelectorAll('.d2i-row'), function (row) { row.querySelector('button').onclick = function () { confirmOpen(name, d, Number(row.getAttribute('data-no'))); }; });
}
function confirmOpen(name, d, no) {
    const D = DL(), pan = panel('아이템 사용 확인');
    let h = '<div class="d2i-eff">' + esc(fix(D.nickOf(d) + '에게 ' + name + ' 1개를 사용할까요?')) + '\n' + (no != null ? '대상 기술: ' + esc(SK().get(no).n) + '\n' : '') + esc(get(name).d) + '</div>';
    h += '<div style="display:flex;gap:8px;margin-top:8px"><button class="d2i-ghost d2i-back" style="flex:1">취소</button><button class="d2i-btn d2i-go" style="flex:1">사용 · 1개</button></div>';
    pan.insertAdjacentHTML('beforeend', h);
    pan.querySelector('.d2i-back').onclick = function () { useOpen(name); };
    pan.querySelector('.d2i-go').onclick = function () { const go = pan.querySelector('.d2i-go'); go.disabled = true; if (!count(name)) { alert_(fix(name + '이/가 부족하다!')); go.disabled = false; return; } const r = applyRec(d, name, no); if (!r.ok) { alert_(r.why); go.disabled = false; return; } shut(); alert_(r.msg); try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } };
}

// ==========================================
// 상점 — 꿈결 · 잡화점 「아이템」(20종) / 조는 도깨비 「도깨비 상점」(택 로고 각인기)
// ==========================================
function shopList() { const T = TR(); const out = ORDER.map(function (n) { return { n: n, g: ITEMS[n].g, p: ITEMS[n].p, d: ITEMS[n].d }; }); if (T) out.push({ n: T.ITEM, g: 'eng', p: T.PRICE_DREAM, d: '원하는 일반 특성으로 택 로고 변경 (전투 밖에서 소지품으로 사용)' }); return out; }
function buy(name, n, u) {
    u = u || u_();
    const it = shopList().find(function (x) { return x.n === name; });
    if (!it) return Promise.resolve({ ok: false, why: '그런 물건이 없습니다.' });
    n = Math.floor(Number(n));
    if (!(n >= 1)) return Promise.resolve({ ok: false, why: '구매 수량은 1개 이상의 정수로 선택해 주세요.' });
    const tot = it.p * n;
    if (dream(u) < tot) return Promise.resolve({ ok: false, why: '꿈결이 부족하다!' });
    const give = function () {
        if (!Array.isArray(u.inventory)) u.inventory = [];
        for (let i = 0; i < n; i++) u.inventory.push(name);
        try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[👺 ' + (it.g === 'eng' ? '도깨비 상점' : '잡화점') + '] ' + name + ' ×' + n + ' (-' + fmtN(tot) + ' 꿈결)'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        return { ok: true, msg: name + ' ' + n + '개를 구매했다!', tot: tot };
    };
    const d = db_();
    if (!d) { u.kroom = u.kroom || {}; u.kroom.dream = dream(u) - tot; return Promise.resolve(give()); }
    return d.ref('users/' + u.code + '/kroom/dream').transaction(function (v) { const c = Math.max(0, Math.floor(Number(v) || 0)); if (c < tot) return; return c - tot; })
        .then(function (r) { if (!r || !r.committed) return { ok: false, why: '꿈결이 부족하다!' }; if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {}; u.kroom.dream = Math.max(0, Math.floor(Number(r.snapshot.val()) || 0)); return give(); })
        .catch(function () { return { ok: false, why: '사지 못했습니다. 다시 해 주세요.' }; });
}
//   mode 'gob'  조는 도깨비 「도깨비 상점」 — 택 로고 각인기만 (기획 「조는 도깨비」 03)
//   mode 'shop' 도깨비 공방 잡화점 「아이템」 — 일반 소모품 20종 (기획 「아이템」 10) · 기본
//   onClose     닫힐 때 부른다 (대화 흐름으로 돌아가게)
function shopOpen(mode, onClose) {
    const u = u_(); if (!u) return;
    const gob = mode === 'gob';
    const title = gob ? '👺 도깨비 상점 — 꿈결' : '🧷 봉제인형 아이템 — 꿈결';
    const pan = panel(title);
    onShut = (typeof onClose === 'function') ? onClose : null;
    const qty = {}; const list = shopList().filter(function (x) { return gob ? x.g === 'eng' : x.g !== 'eng'; });
    const paint = function () {
        let h = '<div class="d2i-sub">보유 꿈결 ' + fmtN(dream(u)) + ' D' + (gob ? ' · 각인기는 소지품에서 사용 — 소유 인형 선택 → 일반 특성 30종 가운데 하나로 (전투 중 불가)' : ' · 산 것은 소지품에 들어가고, 쓸 때 동행 인형을 고른다 · 전투 중에도 쓴다 (한 턴)') + '</div>';
        (gob ? ['eng'] : GROUPS).forEach(function (g) {
            const rows = list.filter(function (x) { return x.g === g; }); if (!rows.length) return;
            h += '<div class="d2i-grp">' + esc(G[g]) + '</div>';
            rows.forEach(function (x) {
                const q = qty[x.n] || 1, tot = x.p * q, poor = dream(u) < tot;
                h += '<div class="d2i-row" data-n="' + esc(x.n) + '"><div class="n"><b>' + esc(x.n) + ' <span style="color:#ffd766;font-weight:normal">' + fmtN(x.p) + ' D</span></b><small>' + esc(x.d) + '</small><small>가진 것 ' + count(x.n, u) + '개 · 합계 ' + fmtN(tot) + ' D · 구매 후 ' + fmtN(Math.max(0, dream(u) - tot)) + ' D</small></div><div class="d2i-qty"><button class="d2i-m">−</button><span>' + q + '</span><button class="d2i-p">+</button></div><button class="d2i-btn d2i-buy"' + (poor ? ' disabled' : '') + '>구매</button></div>';
            });
        });
        pan.innerHTML = '<h3>' + title + ' <button class="d2i-x">닫기</button></h3>' + h;
        pan.querySelector('.d2i-x').onclick = shut;
        Array.prototype.forEach.call(pan.querySelectorAll('.d2i-row'), function (row) {
            const n = row.getAttribute('data-n');
            row.querySelector('.d2i-m').onclick = function () { qty[n] = Math.max(1, (qty[n] || 1) - 1); paint(); };
            row.querySelector('.d2i-p').onclick = function () { qty[n] = Math.min(99, (qty[n] || 1) + 1); paint(); };
            row.querySelector('.d2i-buy').onclick = function () {
                const q = qty[n] || 1, it = list.find(function (x) { return x.n === n; });
                if (!confirm_(n + ' ' + q + '개를 ' + fmtN(it.p * q) + '꿈결에 구매할까요?')) return;
                row.querySelector('.d2i-buy').disabled = true;
                buy(n, q, u).then(function (r) { if (!r.ok) alert_(r.why); else alert_(r.msg); if (document.getElementById('d2i-dim')) paint(); });
            };
        });
    };
    paint();
}
function confirm_(t) { try { if (typeof window.d2Confirm === 'function') return window.d2Confirm(t); } catch (e) { } return window.confirm(t); }

// ==========================================
// 소지품 연결 — 품목 등록 · 사용 가로채기
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || typeof useInventoryItem !== 'function') return;
        ORDER.forEach(function (n) { if (!ITEM_CATALOG[n]) ITEM_CATALOG[n] = { price: 0, usable: true, targetable: false, effect: 'd2_item', noSell: true, desc: ITEMS[n].d + ' (도깨비 공방 잡화점 · ' + ITEMS[n].p + ' 꿈결)' }; });
        if (!useInventoryItem._d2i) {
            const _u = useInventoryItem;
            useInventoryItem = function (itemName) { if (!isItem(itemName)) return _u.apply(this, arguments); useOpen(itemName); };
            useInventoryItem._d2i = true;
        }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 소지품 — 「🧸 펫 용품」 칸 · 안에서 분류별로 (2026-11-10 사용자 「펫 용품(전투 중 사용하는 용품) 카테고리별로 보일 수 있게」)
//   invcat.js 의 칸 목록에 한 칸을 더하고(회복 다음), 그 칸 안에서 HP 회복 · PP 회복 · 상태 치료 · 기절 회복 · 도핑 · 훈련 보조 · 각인 차례로 작은 제목을 단다.
// ==========================================
function invItemG(n) { if (ITEMS[n]) return ITEMS[n].g; if (TR() && n === TR().ITEM) return 'eng'; return null; }
(function invHook() {
    const iv = setInterval(function () {
        if (typeof INV_CATS === 'undefined' || typeof invCatOf !== 'function' || typeof applyInvCats !== 'function') return;
        if (!INV_CATS.some(function (c) { return c.id === 'pet'; })) {
            const at = INV_CATS.findIndex(function (c) { return c.id === 'heal'; });
            INV_CATS.splice(at < 0 ? INV_CATS.length - 1 : at + 1, 0, { id: 'pet', name: '펫 용품', icon: '🧸', color: '#ffb3d1' });
        }
        if (!invCatOf._d2pet) {
            const _c = invCatOf;
            invCatOf = function (n) { if (invItemG(n)) return 'pet'; return _c.apply(this, arguments); };
            invCatOf._d2pet = true;
        }
        if (!applyInvCats._d2pet) {
            const _a = applyInvCats;
            applyInvCats = function () { const r = _a.apply(this, arguments); try { invSubGroups(); } catch (e) { console.warn('[🧸] 펫 용품 분류', e); } return r; };
            applyInvCats._d2pet = true;
        }
        clearInterval(iv);
        try { if (typeof renderInventory === 'function' && document.getElementById('inventory-list-container')) renderInventory(); } catch (e) { }
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
function invSubGroups() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    const cards = Array.from(box.querySelectorAll('.inv-card')).filter(function (el) { return invItemG(el.dataset.invName || ''); });
    if (!cards.length) return;
    const body = cards[0].parentNode;
    if (!body || body.querySelector('.d2-inv-sub')) return;
    const order = ORDER.concat(TR() ? [TR().ITEM] : []);
    GROUPS.concat(['eng']).forEach(function (g) {
        const list = cards.filter(function (el) { return invItemG(el.dataset.invName) === g; })
            .sort(function (a, b) { return order.indexOf(a.dataset.invName) - order.indexOf(b.dataset.invName); });
        if (!list.length) return;
        const h = document.createElement('div');
        h.className = 'd2-inv-sub';
        h.style.cssText = 'font-size:10.5px; color:#ffb3d1; margin:8px 2px 4px; padding-bottom:2px; border-bottom:1px dashed rgba(255,179,209,.35);';
        h.textContent = G[g] + ' · ' + list.length + '종';
        body.appendChild(h);
        list.forEach(function (el) { body.appendChild(el); });
    });
}

window.D2IT = { invItemG: invItemG, ITEMS: ITEMS, ORDER: ORDER, GROUPS: GROUPS, G: G, get: get, isItem: isItem, count: count, dream: dream, check: check, viewOfUnit: viewOfUnit, viewOfRec: viewOfRec, use: use, applyRec: applyRec, useOpen: useOpen, shopOpen: shopOpen, shopList: shopList, buy: buy, shut: shut };
window.d2ShopOpen = shopOpen;
window.d2ItemUse = useOpen;
window.d2Items = function () { console.log('%c===== 🧸 아이템 20 + 각인기 =====', 'color:#ffb74d; font-size:13px'); console.table(shopList().map(function (x) { return { 이름: x.n, 분류: G[x.g], 가격: x.p + ' D', 가진것: count(x.n), 설명: x.d.slice(0, 50) }; })); };
console.log('[🧸 2차] d2Items() · d2ShopOpen() · d2ItemUse(이름)');
})();
