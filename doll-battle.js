// ==========================================
// ★ 🧸 봉제인형 전투 화면 — 포켓몬처럼 (시연 영상 · 펫 전투 시스템 구현 기획안) · 셈은 인형 전투 2차 엔진 (d2-battle.js D2BT)
// bundles.json 마지막 묶음 — doll-scene.js 다음 (d2-*.js 보다 뒤)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 6단계(마지막 전환)
//   화면(314×685 · 그림 · 연출)은 그대로 두고, 싸움의 셈은 전부 D2BT 가 한다. 이 파일은 엔진에 행동을 넣고 출력문을 연출로 보여 준다.
//     · 기술 판 — 공격기 3칸(위) · 유틸기 2칸(아래) = 조는 도깨비 기술 관리의 칸 그대로 (PP 표시)
//     · 소지품 — 🎀 포옹 리본(야생) · 🔁 동행 인형 바꾸기(한 턴) · 🧷 아이템 20종(d2-items.js · 한 턴) · 💠 먹인 룬으로 친다 / 막는다(결투)
//     · 쓰러지면 다음 인형 고르기(선택창 · MSG-094) · 다 쓰러지면 패배
//     · 포획 · 도망은 기존 그대로 (기획 「도주·포획은 기존 시스템을 따른다」) — 둘 다 그 턴을 쓴다 (엔진 pass)
//     · 전투 뒤 — 경험치 · 노력치 · HP · PP · 상태 · 훈련 보조를 기록에 (D2BT.settle · applyGrow). 전투 끝 자동 회복은 없다.
//
// ■ 레이어 (뒤에서 앞으로 — 기획안 순서 그대로)
//   7 펫 전투 전용 배경 (doll/bt/<장소>.webp)  6 대전 바닥  5 상대 앞모습  4 내 인형 뒷모습
//   3 스테이터스  2 버튼 아래  1 버튼 (1번_2 → 버튼용 펫 앞모습 → 1번_1) · 싸운다! 다음 칸은 버튼 2번
//   공통 그림은 모두 314×685 (주신 1256×2740 의 도트 한 칸) — 한 좌표에 겹쳐 놓고 화면에 맞춰 통째로 키운다 (또렷하게).
//
// ■ 세 가지 싸움 — 엔진 상태 S 는 그냥 자료라 서버에 그대로 둔다
//   혼자(출몰 · 야생)   S 는 내 화면에만. 상대는 엔진 AI (auto B).
//   여럿이(여정)        dollRun/<열쇠>/fight.d2 = S. 사원마다 제 진영(A · C · D)이 있어 같이 싸운다 (동시 출전). 방장이 판을 푼다 (resolveParty).
//   결투(사원 대 사원)  petBattle/<열쇠>/d2 = S. 신청한 쪽이 A · 받은 쪽이 B. 둘 다 고르면 트랜잭션으로 한 턴 (resolvePvp).
//   선택이 필요하면(기절 · 바통) 엔진이 need 를 돌려준다 → 그 진영의 화면이 고르고 → 같은 S 로 다시 푼다 (되감기).
//
// ■ 콘솔
//   dollBattleTest()        상담사 — 야생 인형 하나와 붙어 본다
//   dollBattleTest(10)      상담사 — 괴담(번호)과 붙어 본다

(function dollBattle() {
'use strict';

const OV = 'dbt-ov';
const W = 314, H = 685;
const D = function () { return window.DOLL; };
const BT = function () { return window.D2BT; };
const D2 = function () { return window.D2; };
const SK = function () { return window.D2SK; };
const IT = function () { return window.D2IT; };
const BG = { wild: 'wild', arcade: 'arcade', garden: 'garden', plaza: 'plaza', casino: 'casino', dfront: 'dfront', dream: 'dream', post: 'post', gate: 'gate', bureau: 'bureau', dshop: 'dshop' };   // garden — 🏚 첫번째 여정(저택) 전투 (2026-11-07)
const WILD = '따라쟁이 봉제인형';
const CATCH = { D: 0.85, C: 0.65, B: 0.45, A: 0.28, S: 0.14 };

// 자리 — 주신 그림에서 쟀다 (314×685)
const AT = {
    foeFloor: [166, 198, 295, 226], myFloor: [0, 231, 164, 281],
    foeStat: [10, 111, 143, 157], myStat: [175, 222, 308, 268],
    text: [10, 280, 304, 342],
    fight: [28, 363, 286, 467], run: [28, 484, 151, 596], bag: [163, 484, 286, 596],
    atk: [[28, 363, 110, 467], [116, 363, 198, 467], [204, 363, 286, 467]],
    def: [[28, 477, 151, 537], [163, 477, 286, 537]],
    back: [28, 547, 287, 601],
    // ★ 내 뒷모습 — 주신 그림이 8배율 → 6배율로 바뀌었다 (2026-11-07): 판(4배) 기준 2배(128) → 1.5배(96). 발끝 274 · 가운데 70 그대로
    foe: { cx: 230, foot: 218 }, me: { l: 22, t: 178, px: 96 }, btnPet: { l: 31, t: 346, px: 128 },
    // ★ 싸운다! 단추 속 확대 그림 (2026-11-08 사용자 「싸울 때 버튼에 저런식으로」) — 단추 안쪽(테두리 3) 왼쪽, 글자 「싸운다!」 앞까지
    btnPic: { l: 32, t: 367, w: 112, h: 96 }
};

// ==========================================
// 지문 — 「따라쟁이 봉제인형 — 전투 출력 지문」 (등장 · 포획 · 도망 · 승리 같은 분위기 글 — 싸움의 셈 출력문은 엔진 MSG)
// ==========================================
const TX = {
    start: ['{w이} 당신을 발견했다!', '{w이} 호기심 가득한 눈으로 당신을 바라본다.', '{w이} 당신 앞에서 폴짝폴짝 뛰고 있다.', '{w이} 무언가를 흉내 내기 시작했다!'],
    morph: ['{w이} {s로} 변신했다!', '{w이} {s}의 모습을 흉내 냈다!', '{w이} 빙글 돌더니 {s로} 변신했다!', '{w이} {s}의 모습을 완벽하게 따라 했다!'],
    flee: ['{w이} 도망쳤다!', '{w이} 쏜살같이 달아났다!', '{w이} 당신의 눈치를 보더니 도망쳤다!', '{w이} 뒤도 돌아보지 않고 달아났다!', '{w이} 호다닥 도망쳐 버렸다!', '{w이} 손을 흔들더니 달아났다!'],
    ribbon: ['포옹 리본을 사용했다!', '{d}에게 포옹 리본을 던졌다!'],
    wrap: ['포옹 리본이 {d을} 감쌌다!', '{d이} 포옹 리본에 감싸였다!', '포옹 리본이 반짝이며 {d을} 끌어안았다!'],
    caught: ['{d이} 새로운 친구가 되었다!', '{d이} 당신의 품에 안겼다!', '{d이} 당신을 새로운 주인으로 받아들였다!', '{d이} 기쁜 듯 당신에게 달려왔다!', '{d이} 당신을 올려다보며 방긋 웃었다!'],
    miss2: ['앗! {d이} 포옹 리본에서 빠져나왔다!', '{d이} 포옹 리본을 풀어버렸다!', '아쉽게도 {d을} 포획하지 못했다!', '{d이} 포옹 리본을 피해 달아났다!', '{d이} 아직 당신을 따라갈 생각이 없는 모양이다.'],
    go: ['가자, {a}!', '{a}! 네 차례야!', '{a을} 내보냈다!', '{a이} 기운차게 뛰어나왔다!', '{a이} 당신의 부름에 응했다!', '{a이} 의욕에 가득 차 있다!'],
    win: ['{a이} 승리를 기뻐하고 있다!', '{a이} 칭찬을 기다리는 눈치다.', '{a이} 자랑스럽게 가슴을 폈다!', '{a이} 신이 나서 폴짝폴짝 뛰었다!', '{a이} 당신을 향해 두 팔을 활짝 벌렸다!', '{a이} 당신에게 머리를 쓰다듬어 달라는 듯 다가왔다.'],
    idle: ['{a이} 당신을 빤히 바라보고 있다.', '{a이} 당신의 관심을 끌려고 애쓰고 있다.', '{a이} 제자리에서 폴짝 뛰었다.', '{a이} 의기양양하게 가슴을 폈다.', '{a이} 자신의 솜을 꾹꾹 눌러 정리했다.', '{a이} 당신에게 손을 흔들었다.', '{a이} 당신의 명령을 기다리고 있다.', '{a이} 상대를 열심히 노려보고 있다.', '{a이} 용감한 척하고 있다.', '{a이} 당신을 흉내 내고 있다.', '{a이} 괜히 멋진 자세를 취했다.', '{a이} 두 팔을 벌려 자신을 크게 보이려 한다.', '{a이} 당신에게 칭찬받을 생각에 들떠 있다.', '{a이} 삐져나온 실밥을 황급히 감췄다.', '{a이} 당신에게 잘 보이려고 꼿꼿이 섰다.'],
    lose: ['더 이상 싸울 수 있는 봉제인형이 없다!', '봉제인형들이 모두 지쳐버렸다.', '봉제인형들을 데리고 전투에서 물러났다.']
};
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
//   {a} {a이} {a을} {a은} {a와} {a로} — 받침을 맞춘다
function fmt(t, v) {
    return t.replace(/\{([a-z])(이|을|은|와|로)?\}/g, function (_, k, j) {
        const w = v[k] == null ? '' : String(v[k]);
        return j ? w + D().josa(w, j) : w;
    });
}

// ==========================================
// 바탕
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function copy(o) { return JSON.parse(JSON.stringify(o)); }
function arrOf(v) { return Array.isArray(v) ? v : (v && typeof v === 'object') ? Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; }) : []; }
function objOf(v) { if (!v || typeof v !== 'object') return {}; if (Array.isArray(v)) { const o = {}; v.forEach(function (x, i) { if (x != null) o[i] = x; }); return o; } return v; }
// 파이어베이스에서 돌아온 엔진 상태 — 숫자 열쇠 칸(pp)이 배열로 바뀌었으면 되돌린다 · 빠진 배열은 채운다
function normS(S) {
    if (!S || !S.sides) return S;
    S.order = arrOf(S.order); S.allies = arrOf(S.allies); S.log = S.log ? arrOf(S.log) : []; S.tlog = [];
    Object.keys(S.sides).forEach(function (s) {
        const sd = S.sides[s]; sd.units = arrOf(sd.units);
        sd.units.forEach(function (u) {
            u.pp = objOf(u.pp); u.used = objOf(u.used); u.met = u.met || {}; u.evN = u.evN || { atk: 0, chm: 0, def: 0, sta: 0, spd: 0 };
            u.rank = u.rank || {}; u.dope = u.dope || {}; u.boost = arrOf(u.boost); u.runes = arrOf(u.runes);
            u.mv = u.mv || {}; u.mv.a = arrOf(u.mv.a); u.mv.u = arrOf(u.mv.u);
            if (!u.st) u.st = {}; if (!u.rec) u.rec = {};
            u.rec.iv = u.rec.iv || {}; u.rec.ev = u.rec.ev || {};
        });
    });
    S.field = S.field || {}; S.in = S.in || {};
    return S;
}
// 기록 → 엔진에 넣을 인형 (열쇠 · 종을 칸 안에 — 서버에서 온 것은 enumerable 이 아니라 사라진다)
function recOf(d, id) { const r = copy(d); r.id = String(id != null ? id : d.id); r.sp = d.sp || (window.PET && window.PET.sp ? window.PET.sp(r.id) : Number(r.id)); return r; }
function myRecs(u) {
    const M = D(); u = u || u_();
    const ds = M.dolls(u);
    return M.withList(u).filter(function (id) { return ds[id]; }).map(function (id) { return recOf(ds[id], id); });
}
function aliveRecs(recs) { return recs.filter(function (r) { return D().hpOf(r) > 0; }); }
function unitArt(u) { return !!(u && u.art); }

// ==========================================
// 상대 만들기 — 야생 · 괴담
// ==========================================
//   야생 — D(Lv 1~10) · C(Lv 11~20) 만 (기획 「개체치」). 레벨은 내 앞 인형 레벨 언저리(−3 ~ +2) 로 맞춘다 (2026-11-07 사용자 「데리고 다니는 펫들 등급에 맞춰서」)
function leadLv(u) {
    const M = D();
    let lv = 0;
    try { M.withList(u).some(function (id) { const d = M.dolls(u)[id]; if (d && M.hpOf(d) > 0) { lv = M.stats(d).lv; return true; } return false; }); } catch (e) { }
    if (!lv) { try { M.withList(u).forEach(function (id) { const d = M.dolls(u)[id]; if (d) lv = Math.max(lv, M.stats(d).lv); }); } catch (e) { } }
    return lv || 1;
}
function wildSpec(o) {
    const M = D(), u = u_();
    let sp = o.sp;
    if (!sp) {
        // 그 사람이 기억하는 모습을 흉내 낸다 — 기르는 펫의 종이면 조금 더 자주
        let mine = [];
        try { mine = Object.keys(window.PET.pets(u)).filter(function (k) { return window.PET.BY[k]; }).map(function (k) { return window.PET.sp(k); }); } catch (e) { }
        // 🧸 캐릭터 봉제인형 — 열에 하나 반쯤 (15%) · 나머지는 동물 (내 펫 종이면 조금 더 자주)
        const chrs = []; try { window.PET.LIST.forEach(function (p) { if (p.chr) chrs.push(p.i); }); } catch (e) { }
        if (chrs.length && Math.random() < 0.15) sp = pick(chrs);
        else sp = (mine.length && Math.random() < 0.4) ? Number(pick(mine)) : (1 + Math.floor(Math.random() * 25));
    }
    let lv = o.lv || (o.tut ? 1 : Math.max(1, Math.min(20, leadLv(u) + (Math.floor(Math.random() * 6) - 3))));
    if (o.g && D2().CAP[o.g]) lv = Math.max(D2().MIN[o.g], Math.min(D2().CAP[o.g], lv));
    const att = o.att || (M.randAtt ? M.randAtt() : 'wet');      // ★ 속성은 한 마리씩 아무거나 — 잡으면 그대로 따라온다 (2026-11-08)
    const trait = window.D2TR ? window.D2TR.roll() : 0;           // 특성 — 희귀 2% (기획 08.2)
    return { wild: 1, sp: sp, lv: lv, el: att, name: M.spName(sp), trait: trait, id: 'wild', art: M.artOld(u) };
}
//   괴담(doll-data.js MON) — 난이도 등급 구간의 레벨 · 어둠(dark) · 속성은 표의 것 · 여럿이면 HP 가 는다 (사람 수 −1 마다 75%)
const LV_OF_DIFF = { D: [6, 10], C: [14, 20], B: [24, 30], A: [34, 40], S: [44, 55] };
const GR5 = ['D', 'C', 'B', 'A', 'S'];
function monSpec(mi, diff, n, seed) {
    const m = D().MON_BY[mi] || D().MON_BY[0];
    const r = D2().rngOf(seed || ('mon:' + mi + ':' + Date.now()));
    const rg = LV_OF_DIFF[diff] || LV_OF_DIFF.D;
    let lv = rg[0] + Math.floor(r() * (rg[1] - rg[0] + 1));
    if (m.boss) lv = Math.min(100, lv + 3);
    const hpMul = (1 + 0.75 * Math.max(0, (n || 1) - 1)) * (m.boss ? 1.6 : 1);
    return { mon: mi, boss: !!m.boss, name: m.n, kind: m.k, lv: lv, el: m.a, dark: true, hpMul: Math.round(hpMul * 100) / 100, id: 'mon' + mi, seed: seed || null };
}
function xpOfSpec(spec) { return 12 + 6 * (spec.lv || 5); }

// ==========================================
// 화면
// ==========================================
let B = null;     // 지금 싸움

function css() {
    if (document.getElementById('dbt-css')) return;
    const s = document.createElement('style');
    s.id = 'dbt-css';
    s.textContent = [
        '#dbt-ov{position:fixed;inset:0;z-index:99995;background:#131214;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}',
        '#dbt-ov .st{position:absolute;left:50%;top:50%;transform-origin:0 0;overflow:hidden}',
        '#dbt-ov .ly{position:absolute;left:0;top:0;width:314px;height:685px;image-rendering:pixelated;pointer-events:none}',
        '#dbt-ov .grp{position:absolute;left:0;top:0;width:314px;height:685px;pointer-events:none;transition:transform .7s cubic-bezier(.2,.8,.3,1)}',
        '#dbt-ov .spr{position:absolute;transition:transform .18s, opacity .35s, filter .25s}',
        '#dbt-ov .bpic{position:absolute;overflow:hidden;pointer-events:none}',
        '#dbt-ov .bpic img{position:absolute;left:0;top:-4px;height:134px;width:auto;image-rendering:pixelated}',
        '#dbt-ov .bpic img.fit{left:50%;top:50%;height:auto;width:auto;max-width:100%;max-height:100%;transform:translate(-50%,-50%)}',
        '#dbt-ov .stt{position:absolute;color:#fff;font-weight:bold;pointer-events:none;white-space:nowrap}',
        '#dbt-ov .hpb{position:absolute;height:5px;background:#2b2b2b;border:1px solid #777;border-radius:2px;overflow:hidden}',
        '#dbt-ov .hpb i{display:block;height:100%;background:#4cd964;transition:width .55s linear, background .3s}',
        '#dbt-ov .txt{position:absolute;left:12px;top:282px;width:290px;height:58px;color:#f4f0ff;font-size:11.5px;line-height:1.55;font-weight:bold;pointer-events:none;overflow:hidden;word-break:keep-all;white-space:pre-line}',
        '#dbt-ov .hit{position:absolute;background:transparent;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}',
        '#dbt-ov .hit:active{background:rgba(255,255,255,.12)}',
        '#dbt-ov .sk{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#2a2140;font-weight:bold;pointer-events:none;line-height:1.25;word-break:keep-all}',
        '#dbt-ov .sk small{font-size:7.5px;color:#5a4a80;font-weight:normal;margin-top:2px}',
        '#dbt-ov .sk.no{opacity:.4}',
        '#dbt-ov .menu{position:absolute;left:28px;top:363px;width:258px;max-height:238px;overflow:auto;background:#d5cbea;border:3px solid #aa91db;padding:6px;box-sizing:border-box}',
        '#dbt-ov .menu button{display:block;width:100%;margin:0 0 5px;padding:7px 6px;background:#c9b9e8;border:2px solid #524173;color:#2a2140;font-size:10px;font-weight:bold;text-align:left}',
        '#dbt-ov .menu button[disabled]{opacity:.45}',
        '#dbt-ov .menu .lb{font-size:7.5px;color:#524173;margin:4px 0 2px}',
        // 💠 룬 속성 공격 — 기술 판 아래 빈 자리(610~680)에 가로로 (2026-11-07 사용자)
        '#dbt-ov .rrow{top:608px;max-height:74px;padding:4px 5px;display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start}',
        '#dbt-ov .rrow .lb{flex:0 0 100%;font-size:7.5px;color:#524173;margin:0 0 1px}',
        '#dbt-ov .rrow button{flex:1 1 40%;width:auto;margin:0;padding:6px 4px;font-size:9.5px;text-align:center}',
        // 🧸 동행 셋 — 소지품에 그림으로 띄워 바꿔 내보낸다 (2026-11-07 사용자)
        '#dbt-ov .dstrip{display:flex;gap:5px;margin:0 0 6px}',
        '#dbt-ov .dstrip button{flex:1 1 0;min-width:0;margin:0;padding:5px 3px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:2px}',
        '#dbt-ov .dstrip button.cur{background:#ffe9bd;border-color:#b07a1d}',
        '#dbt-ov .dstrip button.ko{opacity:.5}',
        '#dbt-ov .dstrip .sp{width:48px;height:48px;image-rendering:pixelated}',
        '#dbt-ov .dstrip .nm{font-size:8.5px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '#dbt-ov .dstrip .hp{width:100%;height:5px;background:#6e5f8f;border:1px solid #524173;box-sizing:border-box}',
        '#dbt-ov .dstrip .hp i{display:block;height:100%}',
        '#dbt-ov .dstrip small{font-size:7.5px;color:#524173;font-weight:normal}',
        '#dbt-ov .fx{position:absolute;pointer-events:none;font-size:22px;transition:all .45s ease-in}',
        '#dbt-ov .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .12s}',
        '#dbt-ov .nx{position:absolute;left:292px;top:330px;font-size:8px;color:#c9b8ff;animation:dbnx 1s infinite;pointer-events:none}',
        '@keyframes dbnx{0%,100%{opacity:.25}50%{opacity:1}}',
        '#dbt-ov .veil{position:absolute;inset:0;z-index:9;opacity:0;pointer-events:none;background:#fff}',
        '#dbt-ov .dim{position:absolute;left:0;top:346px;width:314px;height:339px;background:#05040a;opacity:.55;pointer-events:none;transition:opacity .25s ease-out}',
        '#dbt-ov .pane{transition:opacity .18s ease-out, transform .2s ease-out;transform-origin:50% 70%}',
        '#dbt-ov .pane.off .hit{pointer-events:none !important}',
        '#dbt-ov .hit.prs{background:rgba(0,0,0,.32)}',
        '#dbt-ov .menu{animation:dbfi .22s ease-out}',
        '@keyframes dbfi{from{opacity:0}to{opacity:1}}',
        '#dbt-ov .bob{animation:dbbob 1.3s ease-in-out infinite}',
        '#dbt-ov .bob2{animation:dbbob 1.3s ease-in-out -.65s infinite}',
        '@keyframes dbbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}',
        '@keyframes dbwob{0%,100%{transform:rotate(0)}25%{transform:rotate(-24deg)}75%{transform:rotate(24deg)}}',
        '#dbt-ov .rib{position:absolute;width:30px;height:18px;background:url(doll/ribbon.webp) no-repeat;background-size:30px 18px;image-rendering:pixelated;pointer-events:none;transform-origin:50% 50%}',
        '#dbt-ov .rib i{display:block;width:100%;height:100%}',
        '@keyframes dbspin{to{transform:rotate(720deg)}}',
        // 상태 꼬리표 (독 · 마비 · 아홉여우병 · 방어 · 집중) — 이름 옆 작은 글씨
        '#dbt-ov .tag{font-size:6.5px;color:#ffd0d0;font-weight:normal;margin-left:3px}'
    ].join('\n');
    document.head.appendChild(s);
}

function el(tag, cls, style, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) e.style.cssText = style;
    if (html != null) e.innerHTML = html;
    return e;
}
function rectCss(r) { return 'left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + (r[2] - r[0]) + 'px;height:' + (r[3] - r[1]) + 'px;'; }
function clipCss(r) { return 'clip-path:inset(' + r[1] + 'px ' + (W - r[2]) + 'px ' + (H - r[3]) + 'px ' + r[0] + 'px);'; }

function build(loc) {
    css();
    const ov = el('div', null, null);
    ov.id = OV;
    const st = el('div', 'st', 'width:' + W + 'px;height:' + H + 'px;');
    ov.appendChild(st);
    st.appendChild(el('img', 'ly bg')).src = 'doll/bt/' + (BG[loc] || 'wild') + '.webp';
    const gF = el('div', 'grp gfoe', 'transform:translateX(120%)');
    const fl1 = el('img', 'ly', clipCss(AT.foeFloor)); fl1.src = 'doll/bt-floor.webp'; gF.appendChild(fl1);
    const foe = el('div', 'spr foe'); gF.appendChild(foe);
    const gM = el('div', 'grp gme', 'transform:translateX(-120%)');
    const fl2 = el('img', 'ly', clipCss(AT.myFloor)); fl2.src = 'doll/bt-floor.webp'; gM.appendChild(fl2);
    const me = el('div', 'spr me', 'left:' + AT.me.l + 'px;top:' + AT.me.t + 'px;opacity:0'); gM.appendChild(me);
    st.appendChild(gF); st.appendChild(gM);
    const sF = el('div', 'grp sfoe', 'transform:translateX(-110%)');
    const s1 = el('img', 'ly', clipCss(AT.foeStat)); s1.src = 'doll/bt-stat.webp'; sF.appendChild(s1);
    sF.appendChild(el('div', 'stt fnm', 'left:16px;top:114px;font-size:9.5px'));
    sF.appendChild(el('div', 'stt fat', 'left:113px;top:113px;font-size:10px'));
    sF.appendChild(el('div', 'stt', 'left:16px;top:139px;font-size:6.5px;color:#ffcf4d', 'HP'));
    sF.appendChild(el('div', 'hpb fhp', 'left:28px;top:140px;width:92px', '<i style="width:100%"></i>'));
    const sM = el('div', 'grp sme', 'transform:translateX(110%)');
    const s2 = el('img', 'ly', clipCss(AT.myStat)); s2.src = 'doll/bt-stat.webp'; sM.appendChild(s2);
    sM.appendChild(el('div', 'stt mnm', 'left:194px;top:225px;font-size:9.5px'));
    sM.appendChild(el('div', 'stt mat', 'left:286px;top:224px;font-size:10px'));
    sM.appendChild(el('div', 'stt', 'left:194px;top:243px;font-size:6.5px;color:#ffcf4d', 'HP'));
    sM.appendChild(el('div', 'hpb mhp', 'left:206px;top:244px;width:92px', '<i style="width:100%"></i>'));
    sM.appendChild(el('div', 'stt mhn', 'left:206px;top:252px;width:92px;text-align:right;font-size:8px;color:#e8e4ff'));
    st.appendChild(sF); st.appendChild(sM);
    st.appendChild(el('img', 'ly')).src = 'doll/bt-under.webp';
    st.appendChild(el('div', 'txt'));
    st.appendChild(el('div', 'nx', 'display:none', '▼'));
    st.appendChild(el('div', 'dim'));
    const b1 = el('div', 'grp b1 pane off', 'display:none;opacity:0');
    const b12 = el('img', 'ly'); b12.src = 'doll/bt-b12.webp'; b1.appendChild(b12);
    b1.appendChild(el('div', 'bpic bpet', 'left:' + AT.btnPic.l + 'px;top:' + AT.btnPic.t + 'px;width:' + AT.btnPic.w + 'px;height:' + AT.btnPic.h + 'px'));
    const b11 = el('img', 'ly'); b11.src = 'doll/bt-b11.webp'; b1.appendChild(b11);
    [['fight', AT.fight], ['run', AT.run], ['bag', AT.bag]].forEach(function (x) {
        const h = el('button', 'hit', rectCss(x[1]) + 'pointer-events:auto'); h.dataset.k = x[0]; b1.appendChild(h);
    });
    st.appendChild(b1);
    const b2 = el('div', 'grp b2 pane off', 'display:none;opacity:0');
    const b2i = el('img', 'ly'); b2i.src = 'doll/bt-b2.webp'; b2.appendChild(b2i);
    AT.atk.forEach(function (r, i) { b2.appendChild(el('div', 'sk ska' + i, rectCss(r) + 'font-size:9.5px;padding:0 4px;box-sizing:border-box')); const h = el('button', 'hit', rectCss(r) + 'pointer-events:auto'); h.dataset.k = 'a' + i; b2.appendChild(h); });
    AT.def.forEach(function (r, i) { b2.appendChild(el('div', 'sk skd' + i, rectCss(r) + 'font-size:9.5px;padding:0 4px;box-sizing:border-box')); const h = el('button', 'hit', rectCss(r) + 'pointer-events:auto'); h.dataset.k = 'd' + i; b2.appendChild(h); });
    const hb = el('button', 'hit', rectCss(AT.back) + 'pointer-events:auto'); hb.dataset.k = 'back'; b2.appendChild(hb);
    st.appendChild(b2);
    st.appendChild(el('div', 'flash'));
    ov.appendChild(el('div', 'veil'));
    document.body.appendChild(ov);
    const fit = function () {
        const v = { w: ov.clientWidth || window.innerWidth, h: ov.clientHeight || window.innerHeight };
        const S = Math.min(v.w / W, v.h / H);
        st.style.transform = 'translate(' + (-W * S / 2) + 'px,' + (-H * S / 2) + 'px) scale(' + S + ')';
    };
    fit();
    window.addEventListener('resize', fit);
    return { ov: ov, st: st, fit: fit, foe: foe, me: me, gF: gF, gM: gM, sF: sF, sM: sM, b1: b1, b2: b2,
             txt: st.querySelector('.txt'), nx: st.querySelector('.nx'), fl: st.querySelector('.flash'), dim: st.querySelector('.dim'), veil: ov.querySelector('.veil') };
}
function q(sel) { return B && B.ui.st.querySelector(sel); }

// ── 엔진 상태에서 그림 정보를 꺼낸다
function mySide() { return B.side || 'A'; }
function foeSide() { return mySide() === 'B' ? 'A' : 'B'; }
function sideUnit(s) { const sd = B.S && B.S.sides[s]; return sd ? sd.units[sd.act] : null; }
function me_() { return sideUnit(mySide()); }
function foe_() { return sideUnit(foeSide()); }
function unitG(u) { return (u && (u.g || (u.rec && u.rec.g))) || 'D'; }
// 결투에서 B 쪽 화면은 「아군 진영 · 상대 진영」이 거꾸로다
function tx(t) { if (mySide() !== 'B') return t; return String(t).replace(/아군 진영|상대 진영/g, function (m) { return m === '아군 진영' ? '상대 진영' : '아군 진영'; }); }

// ── 그림
function paintFoe(silhouette) {
    const f = foe_(), e = B.ui.foe;
    if (silhouette === 'base') {                       // 🧸 따라쟁이 봉제인형 원형 (doll/base.webp · 64칸)
        e.innerHTML = '<div class="bob" style="background:url(doll/base.webp) no-repeat;background-size:64px 64px;image-rendering:pixelated;width:64px;height:64px"></div>';
        e.style.left = (AT.foe.cx - 32) + 'px'; e.style.top = (AT.foe.foot - 62) + 'px';
        e.style.filter = '';
        return;
    }
    if (!f) { e.innerHTML = ''; return; }
    if (B.mon != null) {
        const px = B.boss ? 100 : 86;
        e.innerHTML = '<div style="' + D().monCss(B.mon, px) + '"></div>';
        e.style.left = (AT.foe.cx - px / 2) + 'px'; e.style.top = (AT.foe.foot - px + 2) + 'px';
    } else {
        e.innerHTML = '<div class="bob" style="' + D().spriteCss(f.sp || 1, 64, false, unitArt(f)) + '"></div>';
        e.style.left = (AT.foe.cx - 32) + 'px'; e.style.top = (AT.foe.foot - 62) + 'px';
    }
    e.style.filter = silhouette ? 'brightness(0) invert(1) opacity(.9)' : '';
}
function paintMe() {
    const m = me_(), e = B.ui.me, bp = q('.bpet');
    if (!m) { e.innerHTML = ''; if (bp) bp.innerHTML = ''; return; }
    e.innerHTML = '<div' + (B.kind === 'wild' ? ' class="bob2"' : '') + ' style="' + D().spriteCss(m.sp || 1, AT.me.px, true, unitArt(m)) + '"></div>';
    if (bp) bp.innerHTML = '<img class="' + (D().isChr(m.sp) ? '' : 'fit') + '" src="' + portraitSrc(m.sp || 1, unitArt(m)) + '" alt="">';
}
function portraitSrc(sp, old) {
    return ((old && !D().isChr(sp)) ? 'pet/old/' : 'pet/') + 'p' + String(sp).padStart(2, '0') + '.webp';
}
function hpColor(p) { return p > 0.5 ? '#4cd964' : (p > 0.2 ? '#ffcc00' : '#ff3b30'); }
const ST_SHORT = { poison: '독', para: '마비', fox: '아홉여우병' };
function tagOf(u, hideRanks) {
    if (!u) return '';
    const t = [];
    if (u.status) t.push(ST_SHORT[u.status] || u.status);
    if (u.guard === 'full') t.push('방어'); else if (u.guard === 'half') t.push('받아치기'); else if (u.guard === 'endure') t.push('버티기');
    if (u.focus) t.push('집중');
    if (u.runeGuard) t.push('룬 방어');
    const rk = hideRanks ? [] : ['atk', 'chm', 'def', 'sta', 'spd'].filter(function (k) { return u.rank && u.rank[k]; }).map(function (k) { return ({ atk: '공', chm: '매', def: '방', sta: '굳', spd: '속' })[k] + (u.rank[k] > 0 ? '+' : '') + u.rank[k]; });
    if (rk.length) t.push(rk.join(' '));
    return t.length ? '<span class="tag">' + esc(t.join(' · ')) + '</span>' : '';
}
// HP 숫자는 보이는 값(B.shown) — 출력문을 따라 한 줄씩 움직인다
function paintStat() {
    const f = foe_(), m = me_(), A = D().ATTR;
    const sh = B.shown;
    if (f) {
        q('.fnm').innerHTML = esc(f.name) + '  ' + (B.mon != null ? (B.boss ? '보스' : (B.kind2 || '괴담')) : (unitG(f) + ' Lv.' + f.lv)) + tagOf(f, true);   // 상대 랭크는 숨긴다
        q('.fat').textContent = (A[f.el] || {}).e || '';
        const fh = sh[foeSide()] != null ? sh[foeSide()] : f.hp;
        const fp = Math.max(0, fh) / f.max;
        const fi = q('.fhp i'); fi.style.width = (fp * 100) + '%'; fi.style.background = hpColor(fp);
    }
    if (m) {
        q('.mnm').innerHTML = esc(m.name) + '  ' + unitG(m) + ' Lv.' + m.lv + tagOf(m);
        q('.mat').textContent = (A[m.el] || {}).e || '';
        const mh = sh[mySide()] != null ? sh[mySide()] : m.hp;
        const mp = Math.max(0, mh) / m.max;
        const mi = q('.mhp i'); mi.style.width = (mp * 100) + '%'; mi.style.background = hpColor(mp);
        q('.mhn').textContent = Math.max(0, Math.ceil(mh)) + ' / ' + m.max;
    } else { q('.mnm').textContent = ''; q('.mhn').textContent = ''; }
}
function showStat(foe, me) {
    B.ui.sF.style.transform = foe ? 'translateX(0)' : 'translateX(-110%)';
    B.ui.sM.style.transform = me ? 'translateX(0)' : 'translateX(110%)';
}
// 동료 진영(여정) — 작은 칸 (이름 · 인형 · HP)
function allyPaint() {
    if (!B.S || B.S.allies.length <= 1) return;
    let box = q('.allies');
    if (!box) { box = el('div', 'allies', 'position:absolute;left:150px;top:99px;width:160px;pointer-events:none'); B.ui.st.appendChild(box); }
    const rows = B.S.allies.filter(function (s) { return s !== mySide(); }).map(function (s) {
        const sd = B.S.sides[s], a = sd.units[sd.act], nm = sd.owner || s;
        if (!a || sd.out || !(a.hp > 0) && !BT().bench(B.S, s).length) return '<div class="ally" data-c="' + s + '" style="font-size:7px;color:#aaa;background:rgba(0,0,0,.55);margin-bottom:2px;padding:1px 4px;border-radius:3px">' + esc(nm) + ' — 지침</div>';
        const hp = B.shown[s] != null ? B.shown[s] : a.hp;
        const p = Math.max(0, hp) / a.max;
        return '<div class="ally" data-c="' + s + '" style="display:flex;align-items:center;gap:3px;font-size:7px;color:#fff;background:rgba(0,0,0,.55);margin-bottom:2px;padding:1px 4px;border-radius:3px;transition:transform .15s,opacity .2s">'
            + '<div style="' + D().spriteCss(a.sp || 1, 16, false, unitArt(a)) + '"></div><div style="flex:1;min-width:0"><div style="white-space:nowrap;overflow:hidden">' + esc(nm) + ' · ' + esc(a.name) + ' Lv.' + a.lv + '</div>'
            + '<div style="height:3px;background:#333"><i style="display:block;height:100%;width:' + Math.round(p * 100) + '%;background:' + hpColor(p) + '"></i></div></div></div>';
    });
    box.innerHTML = rows.join('');
}
function allyEl(s) { return q('.ally[data-c="' + s + '"]'); }

// ── 지문 — 한 줄 띄우고 잠깐 기다린다 (누르면 빨리 넘어간다)
let tapNow = null;
function say(t, ms) {
    return new Promise(function (r) {
        if (!B) return r();
        B.ui.txt.textContent = t;
        B.ui.nx.style.display = '';
        let done = false;
        const fin = function () { if (done) return; done = true; tapNow = null; if (B) B.ui.nx.style.display = 'none'; r(); };
        setTimeout(function () { tapNow = fin; }, 220);
        setTimeout(fin, ms || 1500);
    });
}
//   0 지문만 (버튼 자리 어둑) · 1 첫 판 · 2 기술 판 · 3 소지품 목록 (더 어둡게)
function pane(e, on) {
    if (on) {
        if (e._on) return;
        e._on = 1; e.classList.remove('off');
        e.style.display = ''; e.style.transitionDelay = '.06s';
        e.style.opacity = '0'; e.style.transform = 'scale(.97)';
        void e.offsetWidth;
        e.style.opacity = '1'; e.style.transform = 'scale(1)';
    } else {
        if (!e._on) return;
        e._on = 0; e.classList.add('off');
        e.style.transitionDelay = '0s'; e.style.opacity = '0';
        setTimeout(function () { if (!e._on) e.style.display = 'none'; }, 200);
    }
}
function fadeRm(e) {
    if (!e) return;
    e.style.animation = 'none'; e.style.transition = 'opacity .16s'; e.style.pointerEvents = 'none'; e.style.opacity = '0';
    setTimeout(function () { e.remove(); }, 170);
}
function menu(mode) {
    if (!B) return;
    pane(B.ui.b1, mode === 1);
    pane(B.ui.b2, mode === 2);
    B.ui.dim.style.opacity = (mode === 1 || mode === 2) ? '0' : (mode === 3 ? '.82' : '.55');
    Array.prototype.forEach.call(B.ui.st.querySelectorAll('.menu'), fadeRm);
}
// 누른 칸이 잠깐 눌려 보인 뒤에 넘어간다
function onTap(ev) {
    const h = ev.target.closest && ev.target.closest('.hit');
    if (h && B && B.pick) {
        ev.stopPropagation();
        const f = B.pick; B.pick = null;
        h.classList.add('prs');
        setTimeout(function () { h.classList.remove('prs'); f(h.dataset.k); }, 120);
        return;
    }
    if (tapNow) tapNow();
}
async function enterFx(ui, dark) {
    const v = ui.veil;
    ui.ov.style.background = 'transparent'; ui.st.style.opacity = '0';
    v.style.background = '#fff'; v.style.transition = 'opacity .45s ease-in';
    await sleep(30); v.style.opacity = '.7';
    await sleep(480);
    ui.ov.style.background = ''; ui.st.style.opacity = '1';
    if (dark) ui.foe.style.filter = 'brightness(0)';
    await sleep(380);
    v.style.transition = 'opacity .55s ease-out'; v.style.opacity = '0';
}
async function exitFx(ui) {
    const v = ui.veil;
    v.style.background = '#000'; v.style.transition = 'opacity .4s ease-in'; v.style.opacity = '1';
    await sleep(430);
    ui.st.style.display = 'none'; ui.ov.style.background = 'transparent';
    await sleep(320);
    v.style.transition = 'opacity .45s ease-out'; v.style.opacity = '0';
    await sleep(470);
}
function wait() { return new Promise(function (r) { B.pick = r; }); }
// 판 메뉴(.menu) 안의 단추 — 누르면 wait() 가 data-k 로 풀린다
function menuBox(html, cls) {
    const box = el('div', 'menu' + (cls ? ' ' + cls : ''));
    box.innerHTML = html;
    B.ui.st.appendChild(box);
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        b.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
        b.onclick = function (ev) { ev.stopPropagation(); if (b.disabled) return; const f = B && B.pick; if (!f) return; B.pick = null; b.classList.add('prs'); setTimeout(function () { f(b.dataset.k); }, 100); };
    });
    return box;
}

// ── 움직임
function sprOf(s) { if (s === mySide()) return B.ui.me; if (s === foeSide()) return B.ui.foe; return allyEl(s); }
function lunge(s) {
    const e = sprOf(s); if (!e) return sleep(10);
    const mine = s === mySide(), ally = (s !== mySide() && s !== foeSide());
    if (ally) { e.style.transform = 'translateX(-6px)'; return sleep(160).then(function () { e.style.transform = ''; return sleep(100); }); }
    const dx = mine ? 14 : -14, dy = mine ? -8 : 6;
    e.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    return sleep(160).then(function () { e.style.transform = ''; return sleep(140); });
}
async function blink(s) {
    const e = sprOf(s); if (!e) return;
    if (s !== mySide() && s !== foeSide()) { e.style.opacity = '.3'; await sleep(120); e.style.opacity = '1'; return; }
    for (let i = 0; i < 4; i++) { e.style.opacity = (i % 2) ? '1' : '0.15'; await sleep(90); }
    e.style.opacity = '1';
}
async function faintFx(s) {
    const e = sprOf(s); if (!e) return;
    if (s !== mySide() && s !== foeSide()) { e.style.opacity = '.3'; await sleep(300); return; }
    e.style.transition = 'transform .45s ease-in, opacity .45s';
    e.style.transform = 'translateY(40px)'; e.style.opacity = '0';
    await sleep(480);
    e.style.transition = '';
}
function fx(txt, r, ms) {
    const e = el('div', 'fx', 'left:' + r[0] + 'px;top:' + r[1] + 'px', txt);
    B.ui.st.appendChild(e);
    setTimeout(function () { e.remove(); }, ms || 700);
    return e;
}
async function whiteIn(s) {
    const e = sprOf(s); if (!e) return;
    if (s !== mySide() && s !== foeSide()) return;
    e.style.transition = 'none';
    e.style.filter = 'brightness(0) invert(1)';
    e.style.transform = 'scale(.2)'; e.style.opacity = '1';
    await sleep(30);
    e.style.transition = '';
    e.style.transform = 'scale(1)';
    await sleep(260);
    e.style.filter = '';
    await sleep(120);
}
// 🧸 원형이 모자이크로 흐려졌다가, 흉내 낸 모습으로 또렷해진다 (2026-11-07 사용자)
const IMG = {};
function img(src) {
    if (!IMG[src]) IMG[src] = new Promise(function (r) { const i = new Image(); i.onload = function () { r(i); }; i.onerror = function () { r(null); }; i.src = src; });
    return IMG[src];
}
async function mosaicMorph() {
    const f = foe_(), e = B.ui.foe;
    const cell = D().cellOf(f.sp);
    const base = await img('doll/base.webp'), sheet = await img(cell.chr ? 'doll/cf.webp' : 'doll/pf.webp');
    const old = (unitArt(f) && !cell.chr) ? await img('pet/old/s' + String(f.sp).padStart(2, '0') + '.webp') : null;
    if (!B || !base || !sheet) { if (B) paintFoe(false); return; }
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    c.className = 'bob'; c.style.cssText = 'width:64px;height:64px;image-rendering:pixelated;display:block';
    const t = document.createElement('canvas'); t.width = 64; t.height = 64;
    const cx = c.getContext('2d'), tx2 = t.getContext('2d');
    const draw = function (src, sx, sy, b, cs) {
        const n = Math.max(1, Math.round(64 / b));
        tx2.clearRect(0, 0, 64, 64); tx2.imageSmoothingEnabled = true;
        tx2.drawImage(src, sx, sy, cs || 64, cs || 64, 0, 0, n, n);
        cx.clearRect(0, 0, 64, 64); cx.imageSmoothingEnabled = false;
        cx.drawImage(t, 0, 0, n, n, 0, 0, 64, 64);
    };
    const drawFit = function (src, b) {
        const n = Math.max(1, Math.round(64 / b));
        const sc = Math.min(64 / src.width, 64 / src.height), w = src.width * sc, h = src.height * sc, ox = (64 - w) / 2, oy = 64 - h;
        tx2.clearRect(0, 0, 64, 64); tx2.imageSmoothingEnabled = true;
        tx2.drawImage(src, 0, 0, src.width, src.height, ox * n / 64, oy * n / 64, w * n / 64, h * n / 64);
        cx.clearRect(0, 0, 64, 64); cx.imageSmoothingEnabled = false;
        cx.drawImage(t, 0, 0, n, n, 0, 0, 64, 64);
    };
    e.innerHTML = ''; e.appendChild(c);
    const ST = [1, 2, 3, 4, 6, 8, 11, 16];
    for (let i = 0; i < ST.length; i++) { if (!B) return; draw(base, 0, 0, ST[i]); await sleep(i ? 70 : 160); }
    for (let i = ST.length - 1; i >= 0; i--) { if (!B) return; if (old) drawFit(old, ST[i]); else draw(sheet, cell.c * cell.cs, cell.r * cell.cs, ST[i], cell.cs); await sleep(i ? 70 : 120); }
    if (B) paintFoe(false);
}

// ==========================================
// 엔진 출력문을 연출로 — 한 줄씩. 줄에 적힌 HP 스냅샷(f)으로 체력 바를 움직인다
// ==========================================
//   e { t, k, id, f: { 진영: [칸, HP, 최대] }, s, i, act }
function hpTick(e) {
    const out = [];
    if (!e.f || !B.S) return out;
    Object.keys(e.f).forEach(function (s) {
        const v = arrOf(e.f[s]); if (v.length < 2) return;
        const idx = Number(v[0]), hp = Number(v[1]);
        const sd = B.S.sides[s]; if (!sd) return;
        if (B.shownIdx[s] !== idx) { B.shownIdx[s] = idx; B.shown[s] = hp; return; }
        const was = B.shown[s];
        if (was == null) { B.shown[s] = hp; return; }
        if (hp !== was) { out.push({ s: s, from: was, to: hp }); B.shown[s] = hp; }
    });
    return out;
}
// 상대 진영인가 — 나(아군 진영 A · C · D)에게는 B, 결투의 B 에게는 A
function oppSide(s) { if (!s || !B) return false; return mySide() === 'B' ? s !== 'B' : s === 'B'; }
async function playLine(e, opt) {
    opt = opt || {};
    if (!B) return;
    const k = e.k, id = e.id;
    // ★ 상대의 랭크 변화(증가 · 감소 · 상한 · 하한 · 초기화 · 바통 계승 · 아홉여우병 전이)는 보이지 않는다 (2026-11-10 사용자)
    if (e.rk && oppSide(e.rk)) return;
    // 행동 — 기술 사용 줄이면 그 진영이 앞으로 나선다
    if (e.act && e.s) await lunge(e.s);
    // 등장 · 회수 · 기절 — 그림을 갈아 끼운다
    if (k === 'recall' && e.s) { await say(tx(e.t), 900); await faintFx(e.s); const sp = sprOf(e.s); if (sp) sp.style.transform = ''; return; }
    if (k === 'faint' && e.s) { hpTick(e); paintStat(); allyPaint(); await faintFx(e.s); await say(tx(e.t), 1300); return; }
    if (k === 'enter' && e.s) {
        if (B.S.sides[e.s]) { B.S.sides[e.s].act = e.i; }
        B.shownIdx[e.s] = e.i; B.shown[e.s] = (e.f && e.f[e.s]) ? Number(arrOf(e.f[e.s])[1]) : null;
        if (e.s === mySide()) { paintMe(); paintStat(); showStat(true, true); } else if (e.s === foeSide()) { paintFoe(false); paintStat(); } else allyPaint();
        if (!opt.quietEnter) await say(tx(e.t), 1000);
        await whiteIn(e.s);
        return;
    }
    if (k === 'ui') return;                                          // 「다음으로 내보낼 인형을 선택해 주세요」 — 선택창이 따로 뜬다
    // HP 변화 — 깜빡이고(맞음) 바가 움직인다 · 회복이면 💚
    const ch = hpTick(e);
    const hurt = ch.filter(function (c) { return c.to < c.from; }), healed = ch.filter(function (c) { return c.to > c.from; });
    for (let i = 0; i < hurt.length; i++) await blink(hurt[i].s);
    healed.forEach(function (c) { fx('💚', c.s === mySide() ? [60, 170] : c.s === foeSide() ? [230, 60] : [160, 100]); });
    paintStat(); allyPaint();
    const ms = (k === 'over') ? 1500 : (id === 1 ? 1000 : (k === 'grow' ? 1200 : 1100));
    await say(tx(e.t), ms);
    if (ch.length) await sleep(250);
}
async function playLog(entries, opt) {
    for (let i = 0; i < entries.length; i++) { if (!B) return; await playLine(entries[i], opt); }
}
// 지금 상태로 보이는 값 맞추기 (판을 풀기 전 · 선택 뒤)
function syncShown() {
    if (!B.S) return;
    B.S.order.forEach(function (s) { const sd = B.S.sides[s]; const u = sd.units[sd.act]; B.shownIdx[s] = sd.act; B.shown[s] = u ? u.hp : 0; });
}

// ==========================================
// 고르기 — 기술 판 · 소지품 · 다음 인형
// ==========================================
function skillPane(u) {
    const S2 = SK(), mv = S2.mvOf(u);
    const can = function (no) { return no && (u.pp[no] | 0) > 0 && BT().allowedBy(u, no); };
    AT.atk.forEach(function (_, i) { const no = mv.a[i]; const s = no ? S2.get(no) : null; const e = q('.ska' + i); e.className = 'sk ska' + i + (s && !can(no) ? ' no' : ''); e.innerHTML = s ? esc(s.n) + '<small>' + esc(S2.elName(s.el, u.rec)) + ' · PP ' + (u.pp[no] | 0) + '/' + s.pp + '</small>' : '<small>빈칸</small>'; });
    AT.def.forEach(function (_, i) { const no = mv.u[i]; const s = no ? S2.get(no) : null; const e = q('.skd' + i); e.className = 'sk skd' + i + (s && !can(no) ? ' no' : ''); e.innerHTML = s ? esc(s.n) + '<small>PP ' + (u.pp[no] | 0) + '/' + s.pp + '</small>' : '<small>빈칸</small>'; });
}
// 💠 룬 줄 — 기술 판과 함께 (먹인 룬으로 친다 · 결투에서는 막기도)
function runeRow(u, withGuard) {
    const RT = window.PETRUNE;
    const rl = arrOf(u.runes);
    if (!rl.length) return null;
    const rn = (function () { try { return RT ? RT.uses(u.key) : []; } catch (e) { return []; } })();
    let h = '<div class="lb">💠 먹인 룬 — 필중 · 무속성 · 위력 60 · 전투 ' + (RT ? RT.WEAR_MAX : 7) + '번이면 깨진다</div>'
        + rl.map(function (r, i) { return '<button data-k="rn:' + i + '">💠 ' + esc(RT ? RT.tag(r) : r) + ' 룬으로 친다 <small>(' + (Number(rn[i]) || 0) + '/' + (RT ? RT.WEAR_MAX : 7) + ')</small></button>'; }).join('');
    if (withGuard) h += rl.map(function (r, i) { return '<button data-k="rd:' + i + '">🛡 ' + esc(RT ? RT.tag(r) : r) + ' 룬으로 막는다</button>'; }).join('');
    return menuBox(h, 'rrow');
}
// 내 진영의 인형들을 그림으로 — 누르면 'sw:칸'
function dollStrip(units, act, mode) {
    if (!units.length) return '';
    return '<div class="dstrip">' + units.map(function (u, i) {
        const ko = !(u.hp > 0) || u.fainted, isCur = i === act;
        const p = Math.max(0, Math.min(1, u.hp / Math.max(1, u.max)));
        const dis = mode === 'target' ? false : (isCur || ko);
        return '<button data-k="sw:' + i + '" class="' + (isCur ? 'cur' : '') + (ko ? ' ko' : '') + '"' + (dis ? ' disabled' : '') + '>'
            + '<span class="sp" style="' + D().spriteCss(u.sp || 1, 48, false, unitArt(u)) + '"></span>'
            + '<span class="nm">' + esc(u.name) + '</span>'
            + '<span class="hp"><i style="width:' + Math.round(p * 100) + '%;background:' + hpColor(p) + '"></i></span>'
            + '<small>' + Math.ceil(Math.max(0, u.hp)) + '/' + u.max + (mode === 'target' ? '' : (isCur ? ' · 나와 있음' : ko ? ' · 쓰러짐' : ' · 내보내기')) + '</small>'
            + '</button>';
    }).join('') + '</div>';
}
// 다음 인형 고르기 (기절 · 바통) — cands 는 칸 번호들
function pickNext(cands, why) {
    return new Promise(function (resolve) {
        const sd = B.S.sides[mySide()];
        menu(3);
        B.ui.txt.textContent = why === 'baton' ? '마음을 이어받을 인형을 고르세요.' : '다음으로 내보낼 인형을 선택해 주세요.';
        const box = menuBox(dollStrip(sd.units, sd.act, 'pick'));
        Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) { const i = Number(String(b.dataset.k).slice(3)); b.disabled = cands.indexOf(i) < 0; });
        B.pick = function (k) { fadeRm(box); menu(0); resolve(Number(String(k).slice(3))); };
    });
}
// 🎀 하루 포획 횟수 — 20마리 (2026-11-07 사용자) · u.dollCatch = { d: 날짜, n: 잡은 수 } · 튜토리얼은 안 센다
const CATCH_MAX = 20;
function dayStr() { try { return (typeof getTodayStr === 'function') ? getTodayStr() : new Date().toISOString().slice(0, 10); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function catchN(u) { u = u || u_(); const c = u && u.dollCatch; return (c && c.d === dayStr()) ? (Number(c.n) || 0) : 0; }
function catchLeft(u) { return Math.max(0, CATCH_MAX - catchN(u)); }
function catchAdd(u) {
    u = u || u_(); if (!u) return;
    const v = { d: dayStr(), n: catchN(u) + 1 };
    u.dollCatch = v;
    try { D().put({ dollCatch: v }, u); } catch (e) { }
}
// 소지품 — 🎀 포옹 리본 · 🔁 인형 바꾸기 · 🧷 아이템 · (결투) 💠 룬 방어. 돌려주는 값: 행동 { k … } · 'ribbon' · 'back'
async function bagMenu(opt) {
    opt = opt || {};
    const M = D(), u = u_(), I = IT();
    const sd = B.S.sides[mySide()];
    for (;;) {
        menu(3);
        const n = M.bagHas(M.ITEM.RIBBON, u);
        const items = I ? I.ORDER.filter(function (nm) { return I.count(nm, u) > 0; }) : [];
        let h = dollStrip(sd.units, sd.act, 'switch');
        if (B.kind === 'wild') h += '<button data-k="ribbon"' + ((n > 0 && (B.tut || catchLeft(u) > 0)) ? '' : ' disabled') + '>🎀 포옹 리본 ×' + n + (B.tut ? '' : (catchLeft(u) > 0 ? ' <small style="color:#524173">(오늘 포획 ' + catchN(u) + '/' + CATCH_MAX + ')</small>' : ' — 오늘은 더 잡을 수 없다 (' + CATCH_MAX + '마리)')) + '</button>';
        else if (B.kind === 'pvp') h += '<div class="lb">🎀 포옹 리본은 사원의 인형에게 쓸 수 없다</div>';
        else h += '<div class="lb">🎀 포옹 리본은 어둠에서 쓸 수 없다</div>';
        // 🧷 펫 용품 — 분류별로 (HP 회복 · PP 회복 · 상태 치료 · 기절 회복 · 도핑 · 훈련 보조 · 2026-11-10 사용자)
        if (items.length) h += '<div class="lb">🧷 펫 용품 — 쓰면 그 턴을 쓴다 (교체 다음 · 방어보다 먼저)</div>' + I.GROUPS.map(function (g) {
            const gs = items.filter(function (nm) { return I.get(nm).g === g; });
            if (!gs.length) return '';
            return '<div class="lb" style="color:#7a4a6a;margin-top:6px">· ' + esc(I.G[g]) + '</div>' + gs.map(function (nm) { const it = I.get(nm); return '<button data-k="it:' + esc(nm) + '">' + esc(nm) + ' ×' + I.count(nm, u) + ' <small style="color:#524173;font-weight:normal">— ' + esc(it.d) + '</small></button>'; }).join('');
        }).join('');
        else h += '<div class="lb">🧷 펫 용품이 없다 — 도깨비 공방 잡화점에서 꿈결로 산다</div>';
        h += '<button data-k="back">돌아간다</button>';
        menuBox(h);
        B.ui.txt.textContent = '무엇을 쓸까?';
        const k = await wait();
        menu(0);
        if (!B) return 'back';
        if (k === 'back') return 'back';
        if (k === 'ribbon') return 'ribbon';
        if (k.indexOf('sw:') === 0) return { k: 'switch', idx: Number(k.slice(3)) };
        if (k.indexOf('it:') === 0) {
            const r = await itemPick(k.slice(3));
            if (r) return r;
            continue;
        }
    }
}
// 아이템 하나 — 대상 인형 → (PP 한 기술이면) 기술 → 행동 { k:'item', item, idx, no }
async function itemPick(name) {
    const I = IT(), sd = B.S.sides[mySide()], it = I.get(name);
    menu(3);
    B.ui.txt.textContent = name + ' — 누구에게 쓸까?';
    const views = sd.units.map(function (u, i) { return I.check(I.viewOfUnit(u, i === sd.act), name, null, true); });
    let h = dollStrip(sd.units, sd.act, 'target') + '<div class="lb">' + esc(it.d) + '</div><button data-k="back">돌아간다</button>';
    const box = menuBox(h);
    Array.prototype.forEach.call(box.querySelectorAll('.dstrip button'), function (b) { const i = Number(String(b.dataset.k).slice(3)); const v = views[i]; b.disabled = !v.ok; if (!v.ok) b.title = v.why; });
    const k = await wait();
    menu(0);
    if (!B || k === 'back') return null;
    const idx = Number(k.slice(3));
    const v = views[idx];
    if (!v.needSkill) return { k: 'item', item: name, idx: idx };
    // PP 회복 — 기술 고르기
    const u = sd.units[idx], S2 = SK();
    menu(3);
    B.ui.txt.textContent = 'PP를 회복할 기술을 고르세요.';
    const eq = S2.equipped(u).filter(function (no) { return no !== 59; });
    menuBox(eq.map(function (no) { const s = S2.get(no), pp = u.pp[no] | 0; return '<button data-k="no:' + no + '"' + (pp >= s.pp ? ' disabled' : '') + '>' + esc(s.n) + ' <small>PP ' + pp + '/' + s.pp + (pp >= s.pp ? ' · 가득' : '') + '</small></button>'; }).join('') + '<button data-k="back">돌아간다</button>');
    const k2 = await wait();
    menu(0);
    if (!B || k2 === 'back') return null;
    return { k: 'item', item: name, idx: idx, no: Number(k2.slice(3)) };
}
// 소모된 아이템을 소지품에서 뺀다 (엔진이 돌려준 cons 가운데 내 진영 것)
function consume(cons) {
    const u = u_();
    (cons || []).forEach(function (c) {
        if (c.s !== mySide()) return;
        try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, c.item, 1); } catch (e) { }
    });
    if ((cons || []).some(function (c) { return c.s === mySide(); })) { try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { } try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }
}
// 내 턴의 행동 하나를 고른다 — 돌려주는 값: 행동 또는 'run' · 'ribbon'
async function chooseAction(opt) {
    opt = opt || {};
    const m = me_();
    for (;;) {
        if (!B) return null;
        const idle = Math.random() < 0.3;
        B.ui.txt.textContent = idle ? fmt(pick(TX.idle), { a: m.name }) : (m.name + D().josa(m.name, '은') + ' 무엇을 할까?');
        menu(1);
        const k = await wait();
        if (!B) return null;
        if (k === 'run') return 'run';
        if (k === 'bag') {
            const r = await bagMenu(opt);
            if (r === 'back') continue;
            return r;
        }
        // 싸운다
        const u = me_();
        skillPane(u);
        B.ui.txt.textContent = u.name + D().josa(u.name, '은') + ' 무엇을 쓸까? (위 셋은 공격기 · 아래 둘은 유틸기)';
        menu(2);
        runeRow(u, B.kind === 'pvp');
        const k2 = await wait();
        if (!B) return null;
        if (k2 === 'back') continue;
        menu(0);
        if (k2.indexOf('rn:') === 0) return { k: 'rune', i: Number(k2.slice(3)) };
        if (k2.indexOf('rd:') === 0) return { k: 'rd', i: Number(k2.slice(3)) };
        const mv = SK().mvOf(u);
        const no = k2.charAt(0) === 'a' ? mv.a[Number(k2.slice(1))] : mv.u[Number(k2.slice(1))];
        if (!no) { await say('빈칸이다.', 700); continue; }
        if ((u.pp[no] | 0) <= 0) { await say(SK().get(no).n + '의 PP가 없다!', 900); continue; }
        if (!BT().allowedBy(u, no)) { await say('지금은 쓸 수 없는 기술이다!', 900); continue; }
        const sk = SK().get(no);
        const act = { k: 'skill', no: no };
        if (sk.tgt === 'ally' || no === 74) {                           // 아군 대상 — 대기 인형 고르기
            const b = BT().bench(B.S, mySide());
            if (!b.length) { await say('대기 중인 인형이 없다!', 900); continue; }
            const idx = await pickNext(b, 'ally');
            if (!B) return null;
            act.idx = idx;
        }
        return act;
    }
}

// ==========================================
// 혼자 싸움 — 출몰(야생) · 괴담 하나 (상대는 엔진 AI)
// ==========================================
//   opt { kind:'wild'|'mon', loc, tut, spec }  → { res: 'win'|'lose'|'run'|'fled'|'caught'|'full'|'none'|'gone'|'busy', id }
async function begin(opt) {
    if (B) return { res: 'busy' };
    const M = D(), u = u_();
    const ui = build(opt.loc);
    const spec = opt.spec;
    B = { ui: ui, opt: opt, kind: opt.kind, tut: !!opt.tut, pick: null, wrapped: false, side: 'A', S: null, shown: {}, shownIdx: {}, recs: [], mon: spec.mon != null ? spec.mon : null, boss: !!spec.boss, kind2: spec.kind || null, spec: spec };
    window.D2BT_ACTIVE = true;
    ui.ov.addEventListener('pointerdown', onTap);
    // 내 인형 — 동행 가운데 체력이 남은 것 (순서대로)
    const recs = myRecs(u), live = aliveRecs(recs);
    B.recs = recs;                                                      // 쓰러진 인형도 같이 — 기절 회복 아이템의 대상이 된다
    const seed = 'solo:' + Date.now() + ':' + Math.floor(Math.random() * 1e6);
    B.seed = seed;
    if (live.length) {
        try { B.S = BT().start({ my: recs, foe: [spec], auto: { A: false, B: true }, seed: seed, mode: 'pve', art: { A: M.artOld(u) } }); }
        catch (e) { console.warn('[🧸] 전투 시작', e); return finish({ res: 'gone' }); }
    } else {
        // 인형이 없다 — 상대만 만들어 둔다 (리본 · 도망 · 튜토리얼 도깨비)
        B.S = { turn: 1, me: 'A', order: ['A', 'B'], allies: ['A'], sides: { A: { units: [], act: 0 }, B: { units: [BT().foeOf(spec, D2().rngOf(seed))], act: 0 } }, over: null, log: [] };
        B.noDoll = true;
    }
    syncShown();
    paintFoe(B.kind === 'wild' ? 'base' : false);
    paintStat();
    await enterFx(ui, B.kind !== 'wild');
    await sleep(60);
    ui.gF.style.transform = 'translateX(0)';
    ui.gM.style.transform = 'translateX(0)';
    await sleep(750);
    if (B.kind !== 'wild') ui.foe.style.filter = '';
    await sleep(200);
    // ─ 나타났다
    const f = foe_();
    if (B.kind === 'wild') {
        M.dexSeen(f.sp);
        await say(fmt(pick(TX.start), { w: WILD }), 1500);
        if (B.tut) await say('도깨비: 「어어어! 나왔다! 나왔어! 김서방! 저놈이야! 저놈!」', 1800);
        await mosaicMorph();
        await say(fmt(pick(TX.morph), { w: WILD, s: f.name }), 1500);
    } else {
        const fresh = M.darkSeen(B.mon);
        await say((B.boss ? '무대 위의 ' : '') + f.name + D().josa(f.name, '이') + ' 나타났다!' + (fresh ? ' (어둠 도감에 적혔다)' : ''), 1500);
    }
    showStat(true, false);
    await sleep(400);
    // ─ 내 인형 — 시작 로그(등장 · 등장 특성)는 등장 줄만 「가자」 로 바꿔 보여 준다
    if (!B.noDoll) {
        const m = me_();
        paintMe(); paintStat();
        await say(fmt(pick(TX.go), { a: m.name }), 1100);
        await whiteIn(mySide());
        showStat(true, true);
        await sleep(300);
        const rest = B.S.log.filter(function (e) { return e.k !== 'enter'; });
        if (rest.length) await playLog(rest);
    } else if (B.tut) {
        await say('도깨비: 「자네 봉제인형이 없으니, 이번엔 내가 옆에서 도와주겠네!」', 1900);
    }
    if (B.tut) {
        await say('도깨비: 「우선 상대를 얌전하게 만들어야 해. 너무 팔팔한 놈은 리본으로 감싸기도 어렵거든!」', 2200);
        await say('도깨비: 「기회가 왔다 싶으면 아까 준 포옹 리본(소지품)을 써보게! 자, 어서! 김서방만 믿겠네!」', 2400);
    }
    return B.noDoll ? noDollLoop() : loop();
}

// 한 턴을 엔진에 넣고, 선택이 필요하면 고르고, 출력문을 보여 준다 → { over, grow } 또는 null(끝났음 · 화면 닫힘)
async function runTurn(action) {
    let picks = [];
    for (;;) {
        if (!B) return null;
        const r = BT().turn(B.S, { A: action, picks: picks, seed: B.seed });
        if (r.need) {
            // 선택 전까지의 출력문은 need 에 없다 — 엔진이 상태를 안 바꾸므로 고른 뒤 한 번에 본다
            const idx = await pickNext(r.need.cands, r.need.why);
            if (!B) return null;
            picks.push(idx);
            continue;
        }
        consume(r.cons);
        await playLog(r.log);                                       // 이전 상태 위에서 보여 준다 (등장 줄이 칸을 옮긴다)
        if (!B) return null;
        B.S = r.S; syncShown(); paintStat(); allyPaint();
        B.turns = (B.turns || 0) + 1;
        return r;
    }
}
async function loop() {
    for (;;) {
        if (!B) return { res: 'gone' };
        if (B.S.over) return endSolo();
        const act = await chooseAction();
        if (!B) return { res: 'gone' };
        if (act === 'run') {
            menu(0);
            const r = await tryRun();
            if (r) return r;
            const t = await runTurn({ k: 'pass' });
            if (!t) return { res: 'gone' };
            if (t.over) return endSolo(t.grow);
            if (await wildFlee()) return finish({ res: 'fled' });
            continue;
        }
        if (act === 'ribbon') {
            menu(0);
            const r = await throwRibbon();
            if (r && r.res) return r;
            const t = await runTurn({ k: 'pass' });
            if (!t) return { res: 'gone' };
            if (t.over) return endSolo(t.grow);
            continue;
        }
        menu(0);
        const t = await runTurn(act);
        if (!t) return { res: 'gone' };
        if (t.over) return endSolo(t.grow);
        if (await wildFlee()) return finish({ res: 'fled' });
    }
}
// 야생이 달아난다 — 체력이 적게 남았으면 3% · 아니면 1.2% (2026-11-07 사용자 「봉제인형이 너무 도망가」)
async function wildFlee() {
    if (B.kind !== 'wild' || B.tut || B.wrapped) return false;
    const f = foe_(); if (!f || !(f.hp > 0)) return false;
    const pr = (f.hp / f.max < 0.25) ? 0.03 : 0.012;
    if (Math.random() >= pr) return false;
    await say(fmt(pick(TX.flee), { w: WILD }), 1400);
    return true;
}
// 인형이 없을 때 — 리본 · 도망 · (튜토리얼) 도깨비가 콕 찌른다
async function noDollLoop() {
    const f = foe_();
    for (;;) {
        if (!B) return { res: 'gone' };
        B.ui.txt.textContent = '당신은 무엇을 할까?';
        menu(1);
        const k = await wait();
        if (!B) return { res: 'gone' };
        if (k === 'run') { menu(0); const r = await tryRun(true); if (r) return r; continue; }
        if (k === 'bag') {
            menu(3);
            const M = D(), u = u_(), n = M.bagHas(M.ITEM.RIBBON, u);
            menuBox('<button data-k="ribbon"' + ((B.kind === 'wild' && n > 0 && (B.tut || catchLeft(u) > 0)) ? '' : ' disabled') + '>🎀 포옹 리본 ×' + n + '</button><div class="lb">싸울 인형이 없어 바꿔 내보낼 것도, 아이템을 쓸 대상도 없다</div><button data-k="back">돌아간다</button>');
            B.ui.txt.textContent = '무엇을 쓸까?';
            const k2 = await wait(); menu(0);
            if (!B) return { res: 'gone' };
            if (k2 === 'ribbon') { const r = await throwRibbon(); if (r && r.res) return r; await say(fmt(pick(TX.idle), { a: WILD }), 1200); }
            continue;
        }
        menu(0);
        if (B.tut) {
            await say('도깨비가 ' + WILD + '을 콕 찔렀다!', 1200);
            await lunge(foeSide()); await blink(foeSide());
            f.hp = Math.max(1, f.hp - Math.round(f.max * 0.35)); B.shown[foeSide()] = f.hp; paintStat();
            await sleep(400);
            await say('따라쟁이가 깜짝 놀라 몸을 움츠렸다.', 1100);
        } else await say('싸울 수 있는 봉제인형이 없다! (소지품 · 도망친다)', 1500);
    }
}
async function tryRun(noDoll) {
    const f = foe_();
    if (B.boss) { await say('무대 위의 것에게서는 도망칠 수 없다!', 1400); return null; }
    const ok = B.kind === 'wild' ? (B.tut || Math.random() < 0.9) : Math.random() < 0.7;
    if (!ok) { await say('도망칠 수 없었다!', 1100); return null; }
    await say('무사히 도망쳤다!', 1200);
    return finish({ res: 'run' });
}
// 전투 끝 — 성장 기록 · 승리 · 패배 지문
async function endSolo(grow) {
    const M = D(), u = u_();
    const win = B.S.over && B.S.over.win === mySide();
    if (!grow && B.S.over) { try { grow = BT().settle(B.S); } catch (e) { grow = null; } }
    if (win) {
        const f = foe_();
        await faintFx(foeSide());
        if (B.kind === 'wild') await say(WILD + '이 쓰러졌다! 솜뭉치로 돌아가 데굴데굴 굴러갔다.', 1500);
        const m = me_();
        if (m && m.hp > 0) await say(fmt(pick(TX.win), { a: m.name }), 1300);
        if (m && m.key) { try { const g = M.bondUp(m.key, u); if (g) await say(m.name + '의 교감 +' + g, 800); } catch (e) { } }
    } else {
        for (let i = 0; i < TX.lose.length; i++) await say(TX.lose[i], 1300);
    }
    return finish({ res: win ? 'win' : 'lose' }, grow);
}
async function finish(r, grow) {
    if (!B) return r;
    const u = u_();
    // 기록 — HP · PP · 상태 · 훈련 보조 · 경험치 · 노력치 (settle 이 없으면 HP · PP 만)
    try {
        if (B.S && B.S.sides && B.recs.length) {
            if (!grow) grow = partialGrow(B.S, mySide());
            const pr = BT().applyGrow(grow, B.recs, mySide(), u);
            mirror(B.recs, u);
            await pr;
        }
    } catch (e) { console.warn('[🧸] 전투 기록', e); }
    // 💠 나왔던 인형의 먹인 룬은 전투 한 번을 치렀다 — 일곱 번이면 깨진다 (튜토리얼은 안 센다)
    try { wearRunes(B.S, mySide(), u); } catch (e) { }
    menu(0);
    const ov = B.ui.ov;
    await exitFx(B.ui);
    window.removeEventListener('resize', B.ui.fit);
    ov.remove();
    B = null; tapNow = null; window.D2BT_ACTIVE = false;
    try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
    return r;
}
// 기록 사본(recOf)에 적힌 것을 지금 들고 있는 인형 기록에도 — 화면이 바로 맞게 (서버 값이 돌아오기 전)
function mirror(recs, u) {
    const ds = D().dolls(u);
    (recs || []).forEach(function (r) {
        if (!r || !r.id) return;
        const live = ds[String(r.id)]; if (!live) return;
        ['hp', 'pp', 'st', 'aid', 'lv', 'xp', 'ev', 'g'].forEach(function (k) { if (r[k] !== undefined) { if (r[k] === null) delete live[k]; else live[k] = r[k]; } });
    });
}
// 끝나지 않은 싸움(도망 · 포획)의 기록 — 경험치 없이 HP · PP · 상태 · 보조만
function partialGrow(S, side) {
    const list = S.sides[side].units.map(function (u, i) { return { side: side, idx: i, key: u.key, hp: u.hp, pp: u.pp, status: u.status ? { k: u.status, c: u.sc } : null, aid: u.aid, xp: 0, ev: {} }; });
    const by = {}; by[side] = list;
    return { win: null, units: list, bySide: by };
}
function wearRunes(S, side, u) {
    const RT = window.PETRUNE; if (!RT || !S || !S.sides || !S.sides[side] || (B && B.tut)) return;
    let broke = [];
    S.sides[side].units.forEach(function (x) { if (x.key && (x.enteredTurn || x.participated)) { try { broke = broke.concat(RT.wear(x.key, u) || []); } catch (e) { } } });
    if (broke.length) { setTimeout(function () { try { window.DOLLSCENE.sys('💠 ' + broke.map(RT.tag).join(' · ') + ' 룬이 깨졌다 (전투 ' + RT.WEAR_MAX + '번)', 4000); } catch (x) { } }, 1600); }
}

// 🎀 포옹 리본 — 던진다 · 잡힐 몫은 등급(레벨 구간)과 남은 체력 (기존 그대로)
async function throwRibbon() {
    const M = D(), u = u_(), f = foe_();
    if (!B.tut && catchLeft(u) <= 0) { await say('오늘은 더 잡을 수 없다! (하루 ' + CATCH_MAX + '마리)', 1200); return null; }
    if (!M.bagAdd(M.ITEM.RIBBON, -1, u)) { await say('포옹 리본이 없다!', 1000); return null; }
    await say(fmt(pick(TX.ribbon), { d: f.name }), 1000);
    const rb = el('div', 'rib', 'left:40px;top:300px;animation:dbspin .6s linear 1');
    B.ui.st.appendChild(rb);
    const x0 = 40, y0 = 300, x1 = AT.foe.cx - 15, y1 = AT.foe.foot - 46;
    const t0 = performance.now(), DUR = 560;
    await new Promise(function (res) {
        const step = function (t) {
            if (!B) return res();
            const k = Math.min(1, (t - t0) / DUR);
            rb.style.left = Math.round(x0 + (x1 - x0) * k) + 'px';
            rb.style.top = Math.round(y0 + (y1 - y0) * k - 70 * Math.sin(k * Math.PI)) + 'px';
            if (k < 1) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
    });
    rb.style.animation = '';
    await sleep(60);
    rb.remove();
    B.ui.foe.style.transform = 'scale(.1)'; B.ui.foe.style.opacity = '0';
    await say(fmt(pick(TX.wrap), { d: f.name }), 1100);
    const g = unitG(f);
    let p = (CATCH[g] || 0.5) * (1 - 0.85 * f.hp / f.max) + 0.05;
    p = Math.max(0.05, Math.min(0.95, p));
    if (B.tut) p = 1;
    const ok = Math.random() < p;
    const wob = ok ? 3 : 1 + Math.floor(Math.random() * 3);
    const sit = el('div', 'rib', 'left:' + (AT.foe.cx - 15) + 'px;top:' + (AT.foe.foot - 28) + 'px');
    B.ui.st.appendChild(sit);
    setTimeout(function () { sit.remove(); }, 4000);
    for (let i = 0; i < wob; i++) { sit.style.animation = 'dbwob .5s 1'; await sleep(560); sit.style.animation = ''; await sleep(260); }
    if (!ok) {
        fx('💥', [AT.foe.cx - 12, AT.foe.foot - 50], 700);
        sit.style.transition = 'transform .4s ease-in, opacity .4s'; sit.style.transform = 'translate(26px,-70px) rotate(260deg)'; sit.style.opacity = '0';
        const e = B.ui.foe;
        e.style.transition = 'transform .38s cubic-bezier(.2,1.7,.4,1), opacity .15s'; e.style.transform = 'scale(1)'; e.style.opacity = '1';
        await sleep(420);
        e.style.transition = ''; e.style.transform = '';
        sit.remove();
        await say(fmt(pick(TX.miss2), { d: f.name }), 1300);
        return null;
    }
    fx('✨', [AT.foe.cx - 12, AT.foe.foot - 50], 900);
    await sleep(500);
    sit.remove();
    B.wrapped = true;
    // 잡은 인형은 지금 모습 그대로 — 개체치 · 성격 · 레벨 · 기술 · 특성 · 남은 HP · 상태
    const rec = f.rec || {};
    const r = M.addDoll({ sp: f.sp, g: g, lv: f.lv, hp: Math.max(1, Math.round(f.hp)), att: f.el, iv: rec.iv, pr: rec.pr, ev: rec.ev || {}, mv: f.mv, pp: f.pp, tr: f.trait, xp: rec.xp || 0 }, u);
    if (!r) {
        await say('보관함이 가득 차 있다! ' + f.name + D().josa(f.name, '이') + ' 리본을 풀고 달아났다……', 1800);
        return finish({ res: 'full' });
    }
    if (f.status) { try { M.patchDoll(r.id, { st: { k: f.status, c: f.sc | 0 } }, u); } catch (e) { } }
    if (!B.tut) catchAdd(u);
    await say(fmt(pick(TX.caught), { d: f.name }), 1500);
    const trN = (window.D2TR && window.D2TR.get(f.trait)) ? window.D2TR.get(f.trait).n : '';
    await say(f.name + ' (' + g + ' · Lv.' + f.lv + (trN ? ' · ' + trN : '') + ')' + D().josa(f.name, '은') + (r.where === 'with' ? ' 동행 목록에 들어갔다!' : ' 보관함(펫 박스)으로 보내졌다!') + ' 봉제인형 도감에 적혔다.' + (B.tut ? '' : ' (오늘 ' + catchN(u) + '/' + CATCH_MAX + ')'), 1800);
    M.log('[🧸 포획] ' + f.name + ' (' + g + ' · Lv.' + f.lv + ') — ' + (r.where === 'with' ? '동행' : '보관함'), u);
    M.saveHist();
    return finish({ res: 'caught', id: r.id });
}

// ==========================================
// 🐾 여럿이 같이 싸우는 괴담 전투 — 펫 동행 어둠 (doll-party.js 가 판을 쥔다 · 동시 출전)
// ==========================================
//   판 (dollRun/<열쇠>/fight) = { id, m, foe(spec), round, roundAt, d2: S, picks: { 사번: 행동 }, pickq: [칸…], need: { side, code, cands, why, at }, log: { 판: [출력문…] }, res, grow, drops, cons }
//   사원마다 제 진영 — S.sides[진영].code 가 사번. 방장이 A. 다 고르면(또는 시간이 지나면) 방장 화면이 한 턴을 푼다 (resolveParty).
//   모든 화면은 log 를 받아 같은 연출로 보여 주고, 제 진영 인형의 HP · PP · 상태 · 경험치 · 노력치만 제 기록에 적는다.
function sideOfCode(S, code) { const o = arrOf(S.order); for (let i = 0; i < o.length; i++) if (S.sides[o[i]] && S.sides[o[i]].code === code) return o[i]; return null; }
// 전투 시작 — 방장이 만든다. members[code].dolls 는 그 사원 인형의 기록(전체) · order 차례로 진영 A · C · D
function partyStart(run, spec, seed) {
    const order = arrOf(run.order).filter(function (c) { const m = run.members[c]; return m && !m.left && m.dolls; });
    const recsOf = function (c) { const ds = objOf(run.members[c].dolls); return Object.keys(ds).map(function (k) { return recOf(ds[k], k); }).filter(function (r) { return D().hpOf(r) > 0; }); };
    let lead = run.lead && order.indexOf(run.lead) >= 0 ? run.lead : order[0];
    if (!recsOf(lead).length) lead = order.filter(function (c) { return recsOf(c).length; })[0];   // 방장 인형이 다 지쳤으면 다음 사원이 A
    if (!lead) throw new Error('싸울 인형이 없습니다.');
    const rest = order.filter(function (c) { return c !== lead && recsOf(c).length; });
    const artOf = function (c) { const ds = objOf(run.members[c].dolls); const k = Object.keys(ds)[0]; return !!(k && ds[k] && ds[k].art); };
    const S = BT().start({ my: recsOf(lead), owner: run.members[lead].name, code: lead, art: { A: artOf(lead) },
        allies: rest.map(function (c) { return { my: recsOf(c), owner: run.members[c].name, code: c, art: artOf(c) }; }),
        foe: [spec], auto: { B: true }, seed: seed, mode: 'pve' });
    S.log = [];
    return copy(S);                                                     // ★ 서버에 적는다 — undefined 가 한 칸이라도 있으면 실서버가 쓰기를 통째로 거부한다 (2026-11-10)
}
// ★ 판마다 run 의 인형 사본(members/<사번>/dolls)에도 HP · PP · 상태 · 보조를 적는다 (2026-11-10 사용자)
//   다음 괴담(partyStart)은 이 사본으로 판을 연다 — 안 적으면 매번 데려왔던 체력 · 상태로 되돌아갔다.
//   인형 기록(users/<사번>/pets)은 각자 화면이 판마다 적는다 (writeMine) — 수선소에서 고치기 전까지 그대로 남는다.
function snapBack(P, run, S) {
    if (!S || !S.sides || !run || !run.members) return;
    arrOf(S.allies).forEach(function (s) {
        const sd = S.sides[s], c = sd && sd.code;
        if (!c || !run.members[c]) return;
        const ds = objOf(run.members[c].dolls);
        arrOf(sd.units).forEach(function (u) {
            if (!u || u.key == null || !ds[String(u.key)]) return;
            const b = 'members/' + c + '/dolls/' + u.key + '/';
            P[b + 'hp'] = Math.max(0, Math.round(Number(u.hp) || 0));
            P[b + 'pp'] = copy(objOf(u.pp));
            P[b + 'st'] = u.status ? { k: u.status, c: u.sc | 0 } : null;
            P[b + 'aid'] = Math.max(0, u.aid | 0);
        });
    });
}
// 한 턴을 푼다 — 돌려주는 값은 run 아래에 적을 칸들 (update 한 번) · 방장(또는 대신 푸는 사람)이 부른다
function resolveParty(run, now) {
    const F = run.fight, P = {};
    const S = normS(copy(F.d2));
    const picks = F.picks || {};
    // 물러서기 — 파티장이 고르면 그 자리에서 (보스는 못 물러선다)
    const leadPick = picks[run.lead];
    if (leadPick === 'run' && !F.foe.boss) {
        P['fight/res'] = 'run'; P['stage'] = 'walk';
        P['fight/log/' + F.round] = [{ t: (run.members[run.lead] || {}).name + ' 사원이 물러서자고 손짓했다. 파티가 괴담에게서 물러났다!', k: 'sys', run: 1, f: {} }];
        P['fight/round'] = F.round + 1; P['fight/picks'] = null; P['fight/roundAt'] = now;
        snapBack(P, run, S);
        return P;
    }
    const input = { picks: arrOf(F.pickq), seed: F.id + ':' + F.round };
    arrOf(S.allies).forEach(function (s) { const c = S.sides[s].code; const a = picks[c]; if (a && typeof a === 'object' && a.k) input[s] = a; });
    let r;
    try { r = BT().turn(S, input); } catch (e) { console.warn('[🐾] 판 풀기', e); P['fight/res'] = 'lose'; P['stage'] = 'lose'; return P; }
    if (r.need) {
        P['fight/need'] = { side: r.need.pick, code: S.sides[r.need.pick].code || null, cands: r.need.cands, why: r.need.why, at: arrOf(F.pickq).length };
        P['fight/lock'] = null;
        return P;
    }
    const S2 = r.S; S2.log = []; delete S2.tlog;
    P['fight/d2'] = copy(S2);                                           // undefined 가 섞이지 않게 (서버가 거부한다)
    P['fight/log/' + F.round] = copy(r.log);
    P['fight/round'] = F.round + 1;
    P['fight/picks'] = null; P['fight/pickq'] = null; P['fight/need'] = null;
    P['fight/roundAt'] = now;
    P['fight/cons'] = r.cons && r.cons.length ? r.cons : null;
    snapBack(P, run, S2);
    if (r.over) {
        if (r.over.win === 'A') {
            const drops = {};
            arrOf(S2.allies).forEach(function (s) { const c = S2.sides[s].code; if (c && window.AWK) { const g = window.AWK.rollDrop(run.diff || 'D', F.foe.boss); if (g.length) drops[c] = g; } });
            P['fight/res'] = 'win'; P['fight/grow'] = copy(r.grow); P['fight/drops'] = drops;
            P['mons/' + F.m + '/dead'] = 1;
            P['stage'] = F.foe.boss ? 'clear' : 'walk';
        } else { P['fight/res'] = 'lose'; P['stage'] = 'lose'; }
    }
    return P;
}
// 내 진영 인형의 기록 — 판마다 HP · PP · 상태 · 보조 (이기면 경험치 · 노력치는 grow 로)
function writeMine(S, side, u, grow) {
    const recs = myRecs(u);
    const sd = S.sides[side]; if (!sd) return;
    const byKey = {}; recs.forEach(function (r) { byKey[String(r.id)] = r; });
    const list = sd.units.map(function (x, i) { return byKey[String(x.key)] || null; });
    const g = grow || partialGrow(S, side);
    try { BT().applyGrow(g, list, side, u); mirror(list, u); } catch (e) { console.warn('[🧸] 기록', e); }
}
//   o = { code, lead, loc, get() 지금 판, pick(행동), pickq(칸), waitLog(round) → Promise(log | null), applyWin(grow, drops) }
async function partyFight(o) {
    if (B) return { res: 'busy' };
    const run0 = o.get();
    const F0 = run0.fight;
    if (!F0 || !F0.d2) return { res: 'gone' };
    const S = normS(copy(F0.d2));
    const side = sideOfCode(S, o.code);
    const ui = build(o.loc || 'arcade');
    B = { ui: ui, kind: 'party', side: side || 'A', watch: !side, S: S, shown: {}, shownIdx: {}, pick: null, mon: F0.foe.mon, boss: !!F0.foe.boss, kind2: F0.foe.kind || '괴담', recs: [], code: o.code, lead: !!o.lead };
    window.D2BT_ACTIVE = true;
    ui.ov.addEventListener('pointerdown', onTap);
    syncShown();
    paintFoe(false); paintMe(); paintStat(); allyPaint();
    await enterFx(ui, true);
    await sleep(60);
    ui.gF.style.transform = 'translateX(0)'; ui.gM.style.transform = 'translateX(0)';
    await sleep(750);
    ui.foe.style.filter = '';
    await sleep(200);
    const fresh = D().darkSeen(B.mon);
    if (F0.intro) await say(F0.intro, 2600);
    const f = foe_();
    await say((B.boss ? '무대 위의 ' : '') + f.name + D().josa(f.name, '이') + ' 나타났다!' + (fresh ? ' (어둠 도감에 적혔다)' : ''), 1500);
    showStat(true, false);
    const m = me_();
    if (m) { await say(fmt(pick(TX.go), { a: m.name }), 1000); await whiteIn(mySide()); showStat(true, true); }
    let next = Number(F0.round) || 1;                                  // 아직 안 본 판
    for (;;) {
        const run = o.get();
        if (!B) return { res: 'gone' };
        if (!run || !run.fight) return partyEnd({ res: 'gone' }, o);
        const F = run.fight;
        const r = next;
        if (!F.res && Number(F.round) === r) {
            const sd = B.S.sides[mySide()];
            const meLive = !B.watch && sd && !sd.out && sd.units.some(function (x) { return x.hp > 0 && !x.fainted; });
            if (F.need && F.need.side === mySide() && arrOf(F.pickq).length <= Number(F.need.at || 0)) {
                const idx = await pickNext(arrOf(F.need.cands).map(Number), F.need.why);
                if (!B) return { res: 'gone' };
                o.pickq(idx);
            } else if (meLive && !(F.picks && F.picks[o.code]) && !F.need) {
                const act = await chooseAction({ party: true });
                if (!B) return { res: 'gone' };
                if (act === 'run') {
                    if (!o.lead) { await say('물러서는 것은 파티장만 정할 수 있다.', 1200); continue; }
                    if (F.foe.boss) { await say('무대 위의 것에게서는 도망칠 수 없다!', 1200); continue; }
                    menu(0); o.pick('run');
                } else if (act && act.k) { menu(0); o.pick(act); }
            }
            menu(0);
            B.ui.txt.textContent = !meLive ? '내 봉제인형이 모두 지쳤다 — 동료의 싸움을 지켜본다…' : (F.need ? '동료가 다음 인형을 고르는 중…' : '다른 사원이 고르기를 기다리는 중…');
        }
        const lg = await o.waitLog(r);
        if (!B) return { res: 'gone' };
        if (lg === 'need') continue;                                     // 내가 다음 인형을 골라야 한다 — 위에서 선택창
        if (!lg) return partyEnd({ res: 'gone' }, o);
        await playLog(arrOf(lg));
        if (!B) return { res: 'gone' };
        next = r + 1;
        const nowRun = o.get();
        if (nowRun && nowRun.fight) {
            const caught = Number(nowRun.fight.round) < next || !!nowRun.fight.res && Number(nowRun.fight.round) <= next;
            if (nowRun.fight.d2 && caught) { B.S = normS(copy(nowRun.fight.d2)); syncShown(); paintStat(); allyPaint(); }
            // 내 기록 — 판마다 · 소모한 아이템
            try { if (side && caught) { writeMine(B.S, side, u_(), null); consume(arrOf(nowRun.fight.cons)); } } catch (e) { }
            if (nowRun.fight.res && caught) {
                const res = nowRun.fight.res;
                if (res === 'win') { try { if (side && nowRun.fight.grow) o.applyWin(nowRun.fight.grow, side); } catch (e) { } const mm = me_(); if (mm && mm.hp > 0) await say(fmt(pick(TX.win), { a: mm.name }), 1100); }
                return partyEnd({ res: res }, o);
            }
        }
    }
}
async function partyEnd(r, o) {
    if (!B) return r;
    try { if (B.S && B.side && !B.watch) wearRunes(B.S, B.side, u_()); } catch (e) { }
    menu(0);
    const ov = B.ui.ov;
    await exitFx(B.ui);
    window.removeEventListener('resize', B.ui.fit);
    ov.remove();
    B = null; tapNow = null; window.D2BT_ACTIVE = false;
    try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
    return r;
}

// ==========================================
// ⚔ 인형 배틀 — 사원 대 사원 (pet-battle.js 가 판을 쥔다)
// ==========================================
//   판 (petBattle/<열쇠>) = { a: { code, name, doll, dolls, … }, b: { … }, d2: S, round, pick: { a: 행동, b: 행동 }, pickq, need, play: { 판: [출력문…] }, grow, stage, winner }
//   신청한 쪽(a)이 진영 A · 받은 쪽(b)이 B. 둘 다 고르면 어느 화면이든 트랜잭션으로 한 턴을 푼다 (resolvePvp). 출력문(play)은 두 화면이 같은 연출로.
//   싸우는 것은 인형 — 한쪽 인형이 다 쓰러지면 진다. 끝나면 양쪽이 제 인형의 HP · PP · 상태를 기록에 적는다 (경험치 없음 · 노력치는 적는다).
function pvpStart(cur, seed) {
    const recs = function (sd) { const ds = objOf(sd.dolls); return Object.keys(ds).map(function (k) { return recOf(ds[k], k); }).filter(function (r) { return D().hpOf(r) > 0; }); };
    const ra = recs(cur.a), rb = recs(cur.b);
    const S = BT().start({ my: ra, owner: cur.a.name, code: cur.a.code, art: { A: !!(cur.a.doll && cur.a.doll.art) },
        foe: rb.map(function (r) { return { rec: r, name: r.nick || D().spName(r.sp), art: !!(cur.b.doll && cur.b.doll.art) }; }),
        auto: { A: false, B: false }, seed: seed, mode: 'pvp' });
    S.sides.B.owner = cur.b.name; S.sides.B.code = cur.b.code;
    S.log = [];
    return copy(S);                                                     // ★ 서버에 적는다 — undefined 를 빼고
}
//   트랜잭션 안에서 — cur 를 고쳐 돌려준다 (둘 다 골랐을 때만)
function resolvePvp(cur) {
    if (!cur || cur.stage !== 'fight' || !cur.pick || !cur.pick.a || !cur.pick.b || !cur.d2) return;
    const round = Number(cur.round) || 1;
    if (cur.play && cur.play[round]) return;
    const S = normS(copy(cur.d2));
    const input = { A: cur.pick.a, B: cur.pick.b, picks: arrOf(cur.pickq), seed: (cur._k || 'pvp') + ':' + round };
    let r;
    try { r = BT().turn(S, input); } catch (e) { console.warn('[⚔] 판 풀기', e); cur.stage = 'done'; cur.winner = 'a'; cur.why = 'error'; cur.endAt = Date.now(); return cur; }
    if (r.need) { cur.need = { side: r.need.pick, cands: r.need.cands, why: r.need.why, at: arrOf(cur.pickq).length }; return cur; }
    const S2 = r.S; S2.log = []; delete S2.tlog;
    cur.d2 = copy(S2);                                                  // undefined 가 섞이지 않게 (서버가 거부한다)
    cur.play = cur.play || {}; cur.play[round] = copy(r.log);
    cur.pick = null; cur.pickq = null; cur.need = null;
    // 광장 연출용 납작한 기록 (pet-arena.js) — 누가 · 얼마나 · 막았나
    const flat = arrOf(cur.log).filter(Boolean);
    let who = null;
    r.log.forEach(function (e) { if (e.act && e.s) who = e.s === 'A' ? 'a' : 'b'; if (e.id === 13 && who) { const m = String(e.t).match(/(\d+)의 피해/); flat.push({ r: round, who: who, atk: 'skill', dmg: m ? Number(m[1]) : 0, blocked: /받아 넘겼다|막아냈다/.test(e.t) }); } });
    cur.log = flat;
    // 보이는 체력 — 옛 창 · 정산이 읽는다
    ['A', 'B'].forEach(function (s) {
        const sd = S2.sides[s], k = s === 'A' ? 'a' : 'b'; const cu = sd.units[sd.act];
        if (!cur[k] || !cu) return;
        cur[k].hp = cu.hp; if (cur[k].doll) { cur[k].doll.hp = cu.hp; cur[k].doll.max = cu.max; } cur[k].act = cu.key;
        const used = {};
        sd.units.forEach(function (x) { if (cur[k].dolls && cur[k].dolls[x.key]) cur[k].dolls[x.key].hp = x.hp; if (x.key && (x.enteredTurn || x.participated)) used[x.key] = 1; });
        cur[k].used = used;                                             // 나왔던 인형 — 정산(pet-battle.js)이 먹인 룬을 닳게 한다
    });
    if (r.over) { cur.stage = 'done'; cur.winner = r.over.win === 'A' ? 'a' : 'b'; cur.why = 'hp'; cur.endAt = Date.now(); cur.grow = copy(r.grow); }
    else { cur.round = round + 1; cur.roundAt = Date.now(); }
    return cur;
}
//   o = { side 'a'|'b', loc, names: { a, b }, get() 지금 판, pick(행동), pickq(칸), forfeit(), waitPlay(round) → Promise(출력문 | null) }
async function pvpFight(o) {
    if (B) return { res: 'busy' };
    const v0 = o.get();
    if (!v0 || !v0.d2) return { res: 'gone' };
    const side = o.side === 'b' ? 'B' : 'A', osd = side === 'A' ? 'B' : 'A';
    const ui = build(o.loc || 'plaza');
    B = { ui: ui, kind: 'pvp', side: side, S: normS(copy(v0.d2)), shown: {}, shownIdx: {}, pick: null, recs: [], mon: null, boss: false };
    window.D2BT_ACTIVE = true;
    ui.ov.addEventListener('pointerdown', onTap);
    syncShown();
    paintFoe(false); paintMe(); paintStat();
    await enterFx(ui, false);
    await sleep(60);
    ui.gF.style.transform = 'translateX(0)'; ui.gM.style.transform = 'translateX(0)';
    await sleep(750);
    const f = foe_(), m = me_();
    await say((o.names[osd === 'A' ? 'a' : 'b'] || '상대') + ' 사원의 ' + f.name + D().josa(f.name, '이') + ' 나섰다!', 1500);
    showStat(true, false);
    if (m) { await say(fmt(pick(TX.go), { a: m.name }), 1000); await whiteIn(mySide()); showStat(true, true); }
    let lastPlayed = Number(v0.round || 1) - 1;
    for (;;) {
        const v = o.get();
        if (!B) return { res: 'gone' };
        if (!v || (v.stage !== 'fight' && v.stage !== 'done')) return pvpEnd({ res: 'gone' });
        const r = Number(v.round) || 1;
        const me = o.side;
        if (v.stage === 'fight') {
            if (v.need && v.need.side === side && arrOf(v.pickq).length <= Number(v.need.at || 0)) {
                const idx = await pickNext(arrOf(v.need.cands).map(Number), v.need.why);
                if (!B) return { res: 'gone' };
                o.pickq(idx);
            } else if (!(v.pick && v.pick[me]) && !v.need) {
                const act = await chooseAction({ pvp: true });
                if (!B) return { res: 'gone' };
                if (act === 'run') {
                    menu(3);
                    menuBox('<div class="lb">결투에서 물러서면 진 것으로 — 건 것을 잃고 가두리 한 시간</div><button data-k="give">정말 기권한다</button><button data-k="back">아니, 계속한다</button>');
                    const k = await wait(); menu(0);
                    if (!B) return { res: 'gone' };
                    if (k === 'give') { try { o.forfeit(); } catch (e) { } }
                    continue;
                }
                if (act && act.k) { menu(0); o.pick(act); }
            }
        }
        menu(0);
        B.ui.txt.textContent = (v.need && v.need.side !== side) ? '상대가 다음 인형을 고르는 중…' : '상대가 고르기를 기다리는 중…';
        const pl = await o.waitPlay(r);
        if (!B) return { res: 'gone' };
        if (pl === 'need') continue;                                     // 내가 다음 인형을 골라야 한다 — 위에서 선택창
        if (!pl) { const v3 = o.get(); if (v3 && v3.stage === 'done') return pvpEnd({ res: v3.winner === me ? 'win' : 'lose' }); return pvpEnd({ res: 'gone' }); }
        if (lastPlayed !== r) {
            lastPlayed = r;
            await playLog(arrOf(pl));
            if (!B) return { res: 'gone' };
            const v2 = o.get();
            if (v2 && v2.d2) { B.S = normS(copy(v2.d2)); syncShown(); paintStat(); }
            try { if (v2 && v2.cons) consume(arrOf(v2.cons)); } catch (e) { }
            if (v2 && v2.stage === 'done') {
                const won = v2.winner === me;
                const mm = me_();
                if (won && mm && mm.hp > 0) await say(fmt(pick(TX.win), { a: mm.name }), 1200);
                try { writeMine(B.S, side, u_(), v2.grow || null); } catch (e) { }
                return pvpEnd({ res: won ? 'win' : 'lose' });
            }
        }
    }
}
async function pvpEnd(r) {
    if (!B) return r;
    // (먹인 룬 닳기는 pet-battle.js 정산이 cur[side].used 로 한다)
    menu(0);
    const ov = B.ui.ov;
    await exitFx(B.ui);
    window.removeEventListener('resize', B.ui.fit);
    ov.remove();
    B = null; tapNow = null; window.D2BT_ACTIVE = false;
    try { if (typeof window.dollRepaint === 'function') window.dollRepaint(); } catch (e) { }
    return r;
}

window.DOLLBT = {
    wild: function (o) { o = o || {}; return begin({ kind: 'wild', loc: o.loc || 'wild', tut: !!o.tut, spec: wildSpec(o) }); },
    monster: function (o) { o = o || {}; return begin({ kind: 'mon', loc: o.loc || 'arcade', spec: monSpec(o.mon != null ? o.mon : 9, o.diff || 'D', 1) }); },
    busy: function () { return !!B; },
    party: partyFight, partyStart: partyStart, resolve: resolveParty, monSpec: monSpec, foeFor: monSpec, xpFor: xpOfSpec, LV_OF_DIFF: LV_OF_DIFF,
    pvp: pvpFight, pvpStart: pvpStart, resolvePvp: resolvePvp, CATCH_MAX: CATCH_MAX, catchN: catchN, catchLeft: catchLeft, wildSpec: wildSpec, recOf: recOf,
    _st: function () { return B; }, _tap: function () { if (tapNow) tapNow(); }
};
window.dollBattleTest = function (mon, diff) {
    if (!D() || !D().isAdmin()) { console.warn('상담사만'); return; }
    const p = (mon != null) ? window.DOLLBT.monster({ mon: mon, loc: 'arcade', diff: diff }) : window.DOLLBT.wild({ loc: 'wild' });
    p.then(function (r) { console.log('[🧸 전투] 끝 —', r); });
};

console.log('[🧸] 전투 — dollBattleTest()');
})();
