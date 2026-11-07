// ==========================================
// ★ 🧸 봉제인형 전투 화면 — 포켓몬처럼 (시연 영상 · 펫 전투 시스템 구현 기획안)
// bundles.json 마지막 묶음 — doll-scene.js 다음
// ==========================================
//
// ■ 레이어 (뒤에서 앞으로 — 기획안 순서 그대로)
//   7 펫 전투 전용 배경 (doll/bt/<장소>.webp)  6 대전 바닥  5 상대 앞모습  4 내 인형 뒷모습
//   3 스테이터스  2 버튼 아래  1 버튼 (1번_2 → 버튼용 펫 앞모습 → 1번_1) · 싸운다! 다음 칸은 버튼 2번
//   공통 그림은 모두 314×685 (주신 1256×2740 의 도트 한 칸) — 한 좌표에 겹쳐 놓고 화면에 맞춰 통째로 키운다 (또렷하게).
//   펫 그림 — 상대 앞모습 64칸(1배) · 내 뒷모습 · 버튼 속 앞모습 128칸(2배, 주신 8배율 그림과 같은 몫)
//
// ■ 흐름 (영상대로)
//   번쩍 → 바닥이 양쪽에서 미끄러져 들어온다 → 「따라쟁이 봉제인형이 나타났다!」 → 「…으로 변신했다!」
//   → 「가자, ○○!」 → 「○○은(는) 무엇을 할까?」
//   [싸운다!] 공격 셋 · 방어 둘 (동물마다 — journey.js 스킬표) → 내가 먼저, 그다음 상대
//   [소지품]  🎀 포옹 리본 (야생만) · 🔁 동행 인형 바꾸기
//   [도망친다] 야생은 거의 성공 · 괴담은 70% · 보스는 못 도망친다
//   쓰러지면 다음 동행 인형이 나온다. 다 쓰러지면 「더 이상 싸울 수 있는 봉제인형이 없다!」
//
// ■ 콘솔
//   dollBattleTest()        상담사 — 야생 인형 하나와 붙어 본다
//   dollBattleTest(10)      상담사 — 괴담(번호)과 붙어 본다

(function dollBattle() {
'use strict';

const OV = 'dbt-ov';
const W = 314, H = 685;
const D = function () { return window.DOLL; };
const BG = { wild: 'wild', arcade: 'arcade', garden: 'garden', plaza: 'plaza', casino: 'casino', dfront: 'dfront', dream: 'dream', post: 'post', gate: 'gate', bureau: 'bureau', dshop: 'dshop' };   // garden — 🏚 첫번째 여정(저택) 전투 (2026-11-07)
const WILD = '따라쟁이 봉제인형';
const CATCH = { D: 0.85, C: 0.65, B: 0.45, A: 0.28, S: 0.14 };
const XP = { wild: 8, mon: 10, boss: 25 };
const REST = 0.25;                     // 괴담을 이기고 나면 숨을 고른다 (동행 모두 25% 회복)

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
    foe: { cx: 230, foot: 218 }, me: { l: 22, t: 178, px: 96 }, btnPet: { l: 31, t: 346, px: 128 }
};

// ==========================================
// 지문 — 「따라쟁이 봉제인형 — 전투 출력 지문」
// ==========================================
const TX = {
    start: ['{w이} 당신을 발견했다!', '{w이} 호기심 가득한 눈으로 당신을 바라본다.', '{w이} 당신 앞에서 폴짝폴짝 뛰고 있다.', '{w이} 무언가를 흉내 내기 시작했다!'],
    morph: ['{w이} {s로} 변신했다!', '{w이} {s}의 모습을 흉내 냈다!', '{w이} 빙글 돌더니 {s로} 변신했다!', '{w이} {s}의 모습을 완벽하게 따라 했다!'],
    use: ['{a}의 {m}!', '{a이} {m을} 사용했다!', '{a이} 힘차게 {m을} 사용했다!', '{a이} 있는 힘껏 {m을} 사용했다!', '{a이} 자신만만하게 {m을} 선보였다!'],
    hit: ['{d}에게 피해를 입혔다!', '{a이} 공격을 제대로 맞혔다!', '{a}의 공격이 멋지게 성공했다!'],
    hitJoy: ['{a이} 신이 나서 폴짝 뛰었다!'],
    miss: ['하지만 공격은 빗나갔다!', '{d이} 공격을 피했다!', '{d이} 재빠르게 몸을 피했다!', '{d이} 아슬아슬하게 공격을 피했다!', '{d이} 몸을 웅크려 공격을 피했다!', '{d이} 넘어질 뻔했지만 간신히 균형을 잡았다!'],
    crit: ['급소에 맞았다!', '{a}의 공격이 급소에 적중했다!', '{a이} 생각보다 훨씬 강한 일격을 날렸다!'],
    great: ['효과가 굉장했다!'],
    weak: ['효과가 별로인 듯하다……'],
    hurt: ['{d이} 공격을 받고 비틀거렸다.', '{d}의 몸에서 솜이 조금 삐져나왔다!', '{d이} 아픈 곳을 문질렀다.', '{d이} 깜짝 놀라 몸을 움츠렸다.', '{d이} 휘청거리더니 다시 자세를 잡았다.', '{d이} 당신을 힐끔 바라보았다.'],
    low: ['{d이} 지친 기색을 보인다.', '{d}의 움직임이 눈에 띄게 느려졌다.', '{d이} 힘겹게 몸을 일으켰다.', '{d}의 솜이 여기저기 삐져나와 있다.', '{d이} 당신을 바라보며 애써 웃었다.', '{d이} 아직 싸울 수 있다는 듯 고개를 끄덕였다.'],
    faint: ['{d이} 쓰러졌다!', '{d이} 더는 움직일 수 없게 되었다.', '{d이} 힘없이 주저앉았다.', '{d이} 풀썩 쓰러졌다!', '{d}의 몸에서 힘이 빠졌다.', '{d이} 축 늘어졌다.'],
    heal: ['{a이} 기운을 차렸다!', '{a이} 다시 생기를 되찾았다!', '{a이} 기분 좋게 몸을 흔들었다.', '{a이} 기운차게 일어났다!', '{a이} 당신을 향해 방긋 웃었다.'],
    flee: ['{w이} 도망쳤다!', '{w이} 쏜살같이 달아났다!', '{w이} 당신의 눈치를 보더니 도망쳤다!', '{w이} 뒤도 돌아보지 않고 달아났다!', '{w이} 호다닥 도망쳐 버렸다!', '{w이} 손을 흔들더니 달아났다!'],
    ribbon: ['포옹 리본을 사용했다!', '{d}에게 포옹 리본을 던졌다!'],
    wrap: ['포옹 리본이 {d을} 감쌌다!', '{d이} 포옹 리본에 감싸였다!', '포옹 리본이 반짝이며 {d을} 끌어안았다!'],
    caught: ['{d이} 새로운 친구가 되었다!', '{d이} 당신의 품에 안겼다!', '{d이} 당신을 새로운 주인으로 받아들였다!', '{d이} 기쁜 듯 당신에게 달려왔다!', '{d이} 당신을 올려다보며 방긋 웃었다!'],
    miss2: ['앗! {d이} 포옹 리본에서 빠져나왔다!', '{d이} 포옹 리본을 풀어버렸다!', '아쉽게도 {d을} 포획하지 못했다!', '{d이} 포옹 리본을 피해 달아났다!', '{d이} 아직 당신을 따라갈 생각이 없는 모양이다.'],
    go: ['가자, {a}!', '{a}! 네 차례야!', '{a을} 내보냈다!', '{a이} 기운차게 뛰어나왔다!', '{a이} 당신의 부름에 응했다!', '{a이} 의욕에 가득 차 있다!'],
    back: ['{a}! 돌아와!', '{a을} 불러들였다.', '{a이} 당신의 곁으로 돌아왔다.', '{a이} 아쉬운 듯 뒤돌아보았다.', '{a이} 당신의 품으로 돌아왔다.'],
    win: ['{a이} 승리를 기뻐하고 있다!', '{a이} 칭찬을 기다리는 눈치다.', '{a이} 자랑스럽게 가슴을 폈다!', '{a이} 신이 나서 폴짝폴짝 뛰었다!', '{a이} 당신을 향해 두 팔을 활짝 벌렸다!', '{a이} 당신에게 머리를 쓰다듬어 달라는 듯 다가왔다.'],
    idle: ['{a이} 당신을 빤히 바라보고 있다.', '{a이} 당신의 관심을 끌려고 애쓰고 있다.', '{a이} 제자리에서 폴짝 뛰었다.', '{a이} 의기양양하게 가슴을 폈다.', '{a이} 자신의 솜을 꾹꾹 눌러 정리했다.', '{a이} 당신에게 손을 흔들었다.', '{a이} 당신의 명령을 기다리고 있다.', '{a이} 상대를 열심히 노려보고 있다.', '{a이} 용감한 척하고 있다.', '{a이} 당신을 흉내 내고 있다.', '{a이} 괜히 멋진 자세를 취했다.', '{a이} 두 팔을 벌려 자신을 크게 보이려 한다.', '{a이} 당신에게 칭찬받을 생각에 들떠 있다.', '{a이} 삐져나온 실밥을 황급히 감췄다.', '{a이} 당신에게 잘 보이려고 꼿꼿이 섰다.'],
    lose: ['더 이상 싸울 수 있는 봉제인형이 없다!', '봉제인형들이 모두 지쳐버렸다.', '봉제인형들을 데리고 전투에서 물러났다.'],
    hold: ['{d이} 당신에게 칭찬받기 위해 버텼다!', '{d이} 당신을 실망시키고 싶지 않아 버텼다!', '{d이} 당신과 더 함께하고 싶어 버텼다!', '{d이} 마지막 힘을 쥐어짜 버텼다!', '{d이} 쓰러지려다 당신을 보고 다시 일어섰다!', '{d이} 당신의 응원을 떠올리고 간신히 버텼다!', '{d이} 당신 앞에서 멋진 모습을 보이려고 버텼다!', '{d이} 당신의 칭찬을 기다리며 꿋꿋이 버텼다!']
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
function rnd(a, b) { return a + Math.random() * (b - a); }
function skills(sp) {
    const J = window.JOURNEY_SK;
    const sk = (J && J.SK && (J.SK[Number(sp)] || J.SK[1])) || { a: [['몸통 박치기', 'hit'], ['솜 뭉치기', 'multi'], ['꾹 누르기', 'heavy']], d: [['웅크리기', 'guard'], ['폴짝 피하기', 'dodge']] };
    return sk;
}
function T() {
    const J = window.JOURNEY_SK || {};
    return {
        ATK: J.ATK_T || { hit: { m: 1, h: 95 }, heavy: { m: 1.6, h: 75 }, multi: { m: 0.65, h: 90, n: 2 }, pierce: { m: 1.1, h: 90, pierce: 1 }, drain: { m: 0.9, h: 95, drain: 0.4 }, sure: { m: 0.85, h: 100, crit: 25 } },
        DEF: J.DEF_T || { guard: { take: 0.5 }, dodge: { dodge: 75 }, counter: { take: 0.7, reflect: 0.6 }, heal: { heal: 0.3 }, taunt: { take: 0.65, taunt: 1 } },
        NAME: J.T_NAME || {}
    };
}

// ==========================================
// 싸우는 것 둘
// ==========================================
function fromDoll(id) {
    const M = D(), d = M.dolls()[id];
    if (!d) return null;
    const s = M.stats(d);
    return { id: id, sp: d.sp, g: s.g, lv: s.lv, name: M.nickOf(d), att: s.att, hp: M.hpOf(d), max: s.max, atk: s.atk, def: s.def, eva: s.eva, crit: s.crit, sk: skills(d.sp), xp: 0, bond: M.bondOf(d) };
}
function wildFoe(o) {
    const M = D(), u = u_();
    let sp = o.sp;
    if (!sp) {
        // 그 사람이 기억하는 모습을 흉내 낸다 — 기르는 펫의 종이면 조금 더 자주
        let mine = [];
        try { mine = Object.keys(window.PET.pets(u)).filter(function (k) { return window.PET.BY[k]; }); } catch (e) { }
        sp = (mine.length && Math.random() < 0.4) ? Number(pick(mine)) : (1 + Math.floor(Math.random() * 25));
    }
    const g = o.g || (o.tut ? 'D' : M.rollGrade());
    const lv = o.lv || (o.tut ? 1 : 1 + Math.floor(Math.random() * 3));
    const fake = { sp: sp, g: g, lv: lv };
    const s = M.stats(fake);
    return { wild: 1, sp: sp, g: g, lv: lv, name: M.spName(sp), att: s.att, hp: s.max, max: s.max, atk: s.atk, def: s.def, eva: s.eva, crit: s.crit, sk: skills(sp) };
}
function monFoe(i) {
    const m = D().MON_BY[i];
    return { mon: i, boss: !!m.boss, name: m.n, kind: m.k, g: m.boss ? '보스' : m.k, att: m.a, hp: m.hp, max: m.hp, atk: m.atk, def: m.def, eva: 5, crit: 5,
             sk: { a: m.mv, d: [] } };
}

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
        '#dbt-ov .st{position:absolute;left:50%;top:50%;transform-origin:0 0}',
        '#dbt-ov .ly{position:absolute;left:0;top:0;width:314px;height:685px;image-rendering:pixelated;pointer-events:none}',
        '#dbt-ov .grp{position:absolute;left:0;top:0;width:314px;height:685px;pointer-events:none;transition:transform .7s cubic-bezier(.2,.8,.3,1)}',
        '#dbt-ov .spr{position:absolute;transition:transform .18s, opacity .35s, filter .25s}',
        '#dbt-ov .stt{position:absolute;color:#fff;font-weight:bold;pointer-events:none;white-space:nowrap}',
        '#dbt-ov .hpb{position:absolute;height:5px;background:#2b2b2b;border:1px solid #777;border-radius:2px;overflow:hidden}',
        '#dbt-ov .hpb i{display:block;height:100%;background:#4cd964;transition:width .55s linear, background .3s}',
        '#dbt-ov .txt{position:absolute;left:12px;top:282px;width:290px;height:58px;color:#f4f0ff;font-size:11.5px;line-height:1.55;font-weight:bold;pointer-events:none;overflow:hidden;word-break:keep-all}',
        '#dbt-ov .hit{position:absolute;background:transparent;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}',
        '#dbt-ov .hit:active{background:rgba(255,255,255,.12)}',
        '#dbt-ov .sk{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#2a2140;font-weight:bold;pointer-events:none;line-height:1.25;word-break:keep-all}',
        '#dbt-ov .sk small{font-size:7.5px;color:#5a4a80;font-weight:normal;margin-top:2px}',
        '#dbt-ov .menu{position:absolute;left:28px;top:363px;width:258px;max-height:238px;overflow:auto;background:#d5cbea;border:3px solid #aa91db;padding:6px;box-sizing:border-box}',
        '#dbt-ov .menu button{display:block;width:100%;margin:0 0 5px;padding:7px 6px;background:#c9b9e8;border:2px solid #524173;color:#2a2140;font-size:10px;font-weight:bold;text-align:left}',
        '#dbt-ov .menu button[disabled]{opacity:.45}',
        '#dbt-ov .fx{position:absolute;pointer-events:none;font-size:22px;transition:all .45s ease-in}',
        '#dbt-ov .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .12s}',
        '#dbt-ov .nx{position:absolute;left:292px;top:330px;font-size:8px;color:#c9b8ff;animation:dbnx 1s infinite;pointer-events:none}',
        '@keyframes dbnx{0%,100%{opacity:.25}50%{opacity:1}}',
        // ★ 들고 나는 것은 모두 서서히 (2026-11-07 하단 버튼 영상) — 하얗게 들어와 까맣게 나간다 · 버튼 판은 눌린 뒤 꺼졌다 켜진다
        '#dbt-ov .veil{position:absolute;inset:0;z-index:9;opacity:0;pointer-events:none;background:#fff}',
        '#dbt-ov .dim{position:absolute;left:0;top:346px;width:314px;height:339px;background:#05040a;opacity:.55;pointer-events:none;transition:opacity .25s ease-out}',
        '#dbt-ov .pane{transition:opacity .18s ease-out, transform .2s ease-out;transform-origin:50% 70%}',
        '#dbt-ov .pane.off .hit{pointer-events:none !important}',
        '#dbt-ov .hit.prs{background:rgba(0,0,0,.32)}',
        '#dbt-ov .menu{animation:dbfi .22s ease-out}',
        '@keyframes dbfi{from{opacity:0}to{opacity:1}}',
        // ★ 포획(야생) 전투 — 봉제인형들이 제자리에서 조금씩 위아래로 (2026-11-07 사용자)
        '#dbt-ov .bob{animation:dbbob 1.3s ease-in-out infinite}',
        '#dbt-ov .bob2{animation:dbbob 1.3s ease-in-out -.65s infinite}',
        '@keyframes dbbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}',
        '@keyframes dbwob{0%,100%{transform:rotate(0)}25%{transform:rotate(-24deg)}75%{transform:rotate(24deg)}}',
        // 🎀 포옹 리본 — 주신 그림 (doll/ribbon.webp · 2026-11-07) · 날아가며 빙글 돈다
        '#dbt-ov .rib{position:absolute;width:30px;height:18px;background:url(doll/ribbon.webp) no-repeat;background-size:30px 18px;image-rendering:pixelated;pointer-events:none;transform-origin:50% 50%}',
        '#dbt-ov .rib i{display:block;width:100%;height:100%}',
        '@keyframes dbspin{to{transform:rotate(720deg)}}'
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
    // 7 배경
    st.appendChild(el('img', 'ly bg')).src = 'doll/bt/' + (BG[loc] || 'wild') + '.webp';
    // 6 · 5 — 상대 쪽 (바닥 + 앞모습) · 6 · 4 — 내 쪽 (바닥 + 뒷모습)  — 바닥은 한 장을 둘로 잘라 따로 미끄러지게
    const gF = el('div', 'grp gfoe', 'transform:translateX(120%)');
    const fl1 = el('img', 'ly', clipCss(AT.foeFloor)); fl1.src = 'doll/bt-floor.webp'; gF.appendChild(fl1);
    const foe = el('div', 'spr foe'); gF.appendChild(foe);
    const gM = el('div', 'grp gme', 'transform:translateX(-120%)');
    const fl2 = el('img', 'ly', clipCss(AT.myFloor)); fl2.src = 'doll/bt-floor.webp'; gM.appendChild(fl2);
    const me = el('div', 'spr me', 'left:' + AT.me.l + 'px;top:' + AT.me.t + 'px;opacity:0'); gM.appendChild(me);
    st.appendChild(gF); st.appendChild(gM);
    // 3 스테이터스 — 둘로 잘라 따로 들어온다
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
    // 2 버튼 아래 · 지문
    st.appendChild(el('img', 'ly')).src = 'doll/bt-under.webp';
    st.appendChild(el('div', 'txt'));
    st.appendChild(el('div', 'nx', 'display:none', '▼'));
    st.appendChild(el('div', 'dim'));                 // 기다리는 동안 버튼 자리는 어둑하게
    // 1 버튼 — 1번_2 → 버튼용 펫 → 1번_1  /  버튼 2번
    const b1 = el('div', 'grp b1 pane off', 'display:none;opacity:0');
    const b12 = el('img', 'ly'); b12.src = 'doll/bt-b12.webp'; b1.appendChild(b12);
    b1.appendChild(el('div', 'spr bpet', 'left:' + AT.btnPet.l + 'px;top:' + AT.btnPet.t + 'px'));
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

// ── 그림
function paintFoe(silhouette) {
    const f = B.foe, e = B.ui.foe;
    if (silhouette === 'base') {                       // 🧸 따라쟁이 봉제인형 원형 (doll/base.webp · 64칸)
        e.innerHTML = '<div class="bob" style="background:url(doll/base.webp) no-repeat;background-size:64px 64px;image-rendering:pixelated;width:64px;height:64px"></div>';
        e.style.left = (AT.foe.cx - 32) + 'px'; e.style.top = (AT.foe.foot - 62) + 'px';
        e.style.filter = '';
        return;
    }
    if (f.mon != null) {
        const px = f.boss ? 100 : 86;
        e.innerHTML = '<div style="' + D().monCss(f.mon, px) + '"></div>';
        e.style.left = (AT.foe.cx - px / 2) + 'px'; e.style.top = (AT.foe.foot - px + 2) + 'px';
    } else {
        e.innerHTML = '<div class="bob" style="' + D().spriteCss(f.sp, 64) + '"></div>';
        e.style.left = (AT.foe.cx - 32) + 'px'; e.style.top = (AT.foe.foot - 62) + 'px';
    }
    e.style.filter = silhouette ? 'brightness(0) invert(1) opacity(.9)' : '';
}
function paintMe() {
    const m = B.me, e = B.ui.me, bp = q('.bpet');
    if (!m) { e.innerHTML = ''; if (bp) bp.innerHTML = ''; return; }
    e.innerHTML = '<div' + (B.foe && B.foe.wild ? ' class="bob2"' : '') + ' style="' + D().spriteCss(m.sp, AT.me.px, true) + '"></div>';
    if (bp) bp.innerHTML = '<div style="' + D().spriteCss(m.sp, AT.btnPet.px) + '"></div>';
}
function hpColor(p) { return p > 0.5 ? '#4cd964' : (p > 0.2 ? '#ffcc00' : '#ff3b30'); }
function paintStat() {
    const f = B.foe, m = B.me, A = D().ATTR;
    q('.fnm').textContent = f.name + '  ' + (f.mon != null ? (f.boss ? '보스' : f.kind) : f.g);
    q('.fat').textContent = (A[f.att] || {}).e || '';
    const fp = Math.max(0, f.hp) / f.max;
    const fi = q('.fhp i'); fi.style.width = (fp * 100) + '%'; fi.style.background = hpColor(fp);
    if (m) {
        q('.mnm').textContent = m.name + '  ' + m.g + ' Lv.' + m.lv;
        q('.mat').textContent = (A[m.att] || {}).e || '';
        const mp = Math.max(0, m.hp) / m.max;
        const mi = q('.mhp i'); mi.style.width = (mp * 100) + '%'; mi.style.background = hpColor(mp);
        q('.mhn').textContent = Math.max(0, Math.ceil(m.hp)) + ' / ' + m.max;
    }
}
function showStat(foe, me) {
    B.ui.sF.style.transform = foe ? 'translateX(0)' : 'translateX(-110%)';
    B.ui.sM.style.transform = me ? 'translateX(0)' : 'translateX(110%)';
}

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
    const old = q('.menu'); if (old) fadeRm(old);
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
// 들어올 때 — 하얗게 덮였다가 걷힌다 / 나갈 때 — 까맣게 덮였다가 지도가 드러난다
async function enterFx(ui, dark) {
    const v = ui.veil;
    ui.ov.style.background = 'transparent'; ui.st.style.opacity = '0';
    v.style.background = '#fff'; v.style.transition = 'opacity .45s ease-in';
    await sleep(30); v.style.opacity = '1';
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

// ── 움직임
function lunge(who) {
    const e = (who === 'me') ? B.ui.me : B.ui.foe;
    const dx = (who === 'me') ? 14 : -14, dy = (who === 'me') ? -8 : 6;
    e.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    return sleep(160).then(function () { e.style.transform = ''; return sleep(140); });
}
async function blink(who) {
    const e = (who === 'me') ? B.ui.me : B.ui.foe;
    for (let i = 0; i < 4; i++) { e.style.opacity = (i % 2) ? '1' : '0.15'; await sleep(90); }
    e.style.opacity = '1';
}
async function faintFx(who) {
    const e = (who === 'me') ? B.ui.me : B.ui.foe;
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
async function whiteIn(who) {
    const e = (who === 'me') ? B.ui.me : B.ui.foe;
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
// 🧸 원형이 모자이크로 흐려졌다가, 흉내 낸 모습으로 또렷해진다 (2026-11-07 사용자 「원형이 먼저 등장하고, 모자이크되면서 다른 봉제인형으로」)
const IMG = {};
function img(src) {
    if (!IMG[src]) IMG[src] = new Promise(function (r) { const i = new Image(); i.onload = function () { r(i); }; i.onerror = function () { r(null); }; i.src = src; });
    return IMG[src];
}
async function mosaicMorph() {
    const f = B.foe, e = B.ui.foe;
    const base = await img('doll/base.webp'), sheet = await img('doll/pf.webp');
    if (!B || !base || !sheet) { if (B) paintFoe(false); return; }
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    c.className = 'bob'; c.style.cssText = 'width:64px;height:64px;image-rendering:pixelated;display:block';
    const t = document.createElement('canvas'); t.width = 64; t.height = 64;
    const cx = c.getContext('2d'), tx = t.getContext('2d');
    const cell = D().cellOf(f.sp);
    const draw = function (src, sx, sy, b) {
        const n = Math.max(1, Math.round(64 / b));
        tx.clearRect(0, 0, 64, 64); tx.imageSmoothingEnabled = true;
        tx.drawImage(src, sx, sy, 64, 64, 0, 0, n, n);           // 칸마다 빛깔을 고르게 (모자이크 한 칸 = 그 자리의 평균)
        cx.clearRect(0, 0, 64, 64); cx.imageSmoothingEnabled = false;
        cx.drawImage(t, 0, 0, n, n, 0, 0, 64, 64);
    };
    e.innerHTML = ''; e.appendChild(c);
    const ST = [1, 2, 3, 4, 6, 8, 11, 16];
    for (let i = 0; i < ST.length; i++) { if (!B) return; draw(base, 0, 0, ST[i]); await sleep(i ? 70 : 160); }
    for (let i = ST.length - 1; i >= 0; i--) { if (!B) return; draw(sheet, cell.c * 64, cell.r * 64, ST[i]); await sleep(i ? 70 : 120); }
    if (B) paintFoe(false);
}
async function flashAll(n) {
    for (let i = 0; i < n; i++) { B.ui.fl.style.opacity = '.85'; await sleep(110); B.ui.fl.style.opacity = '0'; await sleep(110); }
}

// ==========================================
// 셈
// ==========================================
//   공격 하나 — { dmg, hit, crit, eff, n } (n 은 몇 번 맞았나)
function strike(a, d, type, guard) {
    const t = T().ATK[type] || T().ATK.hit;
    const hits = t.n || 1;
    let total = 0, landed = 0, crit = false;
    const eff = D().eff(a.att, d.att);
    for (let i = 0; i < hits; i++) {
        let hc = (t.h || 95) - (d.eva || 0) / 2;
        if (guard && guard.dodge) hc = Math.min(hc, 100 - guard.dodge);
        if (Math.random() * 100 >= hc) continue;
        const c = Math.random() * 100 < (a.crit || 5) + (t.crit || 0);
        if (c) crit = true;
        const def = t.pierce ? 0 : (d.def || 0) * 0.6;
        let dm = (a.atk * (t.m || 1) * 1.6 - def) * rnd(0.88, 1.12) * eff * (c ? 1.5 : 1);
        if (guard && guard.take) dm *= guard.take;
        total += Math.max(1, Math.round(dm));
        landed++;
    }
    return { dmg: total, hit: landed > 0, crit: crit, eff: eff, n: landed, drain: t.drain ? Math.round(total * t.drain) : 0 };
}
async function setHp(who, v) {
    const c = (who === 'me') ? B.me : B.foe;
    c.hp = Math.max(0, Math.min(c.max, v));
    paintStat();
    await sleep(560);
}

// 한 쪽의 공격 — atkr / dfdr 는 'me' · 'foe'
async function attack(atkr, sk, guard) {
    const A = (atkr === 'me') ? B.me : B.foe, Dd = (atkr === 'me') ? B.foe : B.me;
    const vName = { a: A.name, d: Dd.name, m: sk[0] };
    await say(fmt(pick(TX.use), vName), 1100);
    await lunge(atkr);
    const r = strike(A, Dd, sk[1], guard);
    if (!r.hit) { await say(fmt(pick(TX.miss), vName), 1200); return r; }
    await blink(atkr === 'me' ? 'foe' : 'me');
    // 호감도가 가득 찬 인형은 한 싸움에 한 번 — 쓰러지기 직전에 버틴다 (지문 9)
    let held = false;
    if (atkr === 'foe' && Dd.hp - r.dmg <= 0 && (Number(Dd.bond) || 0) >= 100 && !Dd.held) { Dd.held = 1; held = true; r.dmg = Math.max(0, Dd.hp - 1); }
    await setHp(atkr === 'me' ? 'foe' : 'me', Dd.hp - r.dmg);
    if (held) await say(fmt(pick(TX.hold), { d: Dd.name }), 1500);
    if (r.n > 1) await say(r.n + '번 맞았다!', 900);
    if (r.crit) await say(fmt(pick(TX.crit), vName), 1000);
    if (r.eff > 1) await say(pick(TX.great), 1000);
    else if (r.eff < 1) await say(pick(TX.weak), 1000);
    if (r.drain && A.hp > 0) { await setHp(atkr, A.hp + r.drain); await say(fmt('{a이} 기운을 조금 빨아들였다!', vName), 900); }
    // 되받기
    if (guard && guard.reflect && Dd.hp > 0) {
        const back = Math.max(1, Math.round(r.dmg * guard.reflect));
        await lunge(atkr === 'me' ? 'foe' : 'me');
        await setHp(atkr, A.hp - back);
        await say(fmt('{d이} 맞받아쳤다! ' + back + '만큼 되돌려 주었다!', vName), 1100);
    }
    if (Dd.hp > 0 && Dd.hp / Dd.max < 0.25 && Math.random() < 0.5) await say(fmt(pick(TX.low), { d: Dd.name }), 1000);
    else if (Dd.hp > 0 && Math.random() < 0.35) await say(fmt(pick(TX.hurt), { d: Dd.name }), 1000);
    else if (Dd.hp > 0 && atkr === 'me' && Math.random() < 0.15) await say(fmt(pick(TX.hitJoy), vName), 900);
    return r;
}
// 방어 기술 — 이번 턴 상대 공격에 쓰는 것 (heal 은 곧바로)
async function defend(sk) {
    const t = T().DEF[sk[1]] || {};
    const m = B.me;
    await say(fmt(pick(TX.use), { a: m.name, m: sk[0] }), 1100);
    const ic = { guard: '🛡️', dodge: '💨', counter: '🔁', heal: '💚', taunt: '😤' }[sk[1]] || '✨';
    fx(ic, [60, 170]);
    if (t.heal) {
        await setHp('me', m.hp + Math.round(m.max * t.heal));
        await say(fmt(pick(TX.heal), { a: m.name }), 1000);
        return null;
    }
    const nm = (T().NAME || {})[sk[1]] || '';
    await say(m.name + D().josa(m.name, '이') + ' 자세를 잡았다. (' + nm + ')', 900);
    return t;
}

// 상대 차례
async function foeTurn(guard) {
    const f = B.foe;
    if (!B.me) {                                   // 맞설 인형이 없다 — 따라쟁이는 사람을 치지 않는다
        if (f.wild) await say(fmt(pick(TX.idle), { a: WILD }), 1300);
        else await say(f.name + D().josa(f.name, '이') + ' 이쪽을 노려보고 있다……', 1200);
        return;
    }
    const mv = pick(f.sk.a);
    const r = await attack('foe', mv, guard);
    if (B.me.hp <= 0) await myFaint();
    return r;
}
async function myFaint() {
    const m = B.me;
    await faintFx('me');
    await say(fmt(pick(TX.faint), { d: m.name }), 1300);
    B.out[m.id] = m;
    const next = nextDoll();
    if (!next) { B.me = null; return; }
    B.me = next;
    paintMe(); paintStat();
    await say(fmt(pick(TX.go), { a: next.name }), 1100);
    await whiteIn('me');
}
function nextDoll() {
    const M = D(), u = u_();
    const ids = M.withList(u).filter(function (id) { return !B.out[id] && (!B.me || B.me.id !== id); });
    for (let i = 0; i < ids.length; i++) {
        const c = B.cache[ids[i]] || fromDoll(ids[i]);
        if (c && c.hp > 0) { B.cache[ids[i]] = c; return c; }
    }
    return null;
}

// ==========================================
// 싸움
// ==========================================
async function begin(opt) {
    if (B) return { res: 'busy' };
    const M = D();
    const ui = build(opt.loc);
    B = { ui: ui, opt: opt, foe: opt.foe, me: null, out: {}, cache: {}, kind: opt.kind, tut: !!opt.tut, pick: null, wrapped: false };
    ui.ov.addEventListener('pointerdown', onTap);
    paintFoe(B.foe.wild ? 'base' : false);
    paintStat();
    await enterFx(ui, !B.foe.wild);
    await sleep(60);
    ui.gF.style.transform = 'translateX(0)';
    ui.gM.style.transform = 'translateX(0)';
    await sleep(750);
    if (!B.foe.wild) ui.foe.style.filter = '';         // 그림자였던 괴담에 빛이 든다
    await sleep(200);
    // ─ 나타났다
    if (B.foe.wild) {
        M.dexSeen(B.foe.sp);
        await say(fmt(pick(TX.start), { w: WILD }), 1500);
        if (B.tut) await say('도깨비: 「어어어! 나왔다! 나왔어! 김서방! 저놈이야! 저놈!」', 1800);
        await mosaicMorph();
        await say(fmt(pick(TX.morph), { w: WILD, s: B.foe.name }), 1500);
    } else {
        const fresh = M.darkSeen(B.foe.mon);
        await say((B.foe.boss ? '무대 위의 ' : '') + B.foe.name + D().josa(B.foe.name, '이') + ' 나타났다!' + (fresh ? ' (어둠 도감에 적혔다)' : ''), 1500);
    }
    showStat(true, false);
    await sleep(400);
    // ─ 내 인형
    B.me = nextDoll();
    if (B.me) {
        paintMe(); paintStat();
        await say(fmt(pick(TX.go), { a: B.me.name }), 1100);
        await whiteIn('me');
        showStat(true, true);
        await sleep(400);
    } else if (B.tut) {
        await say('도깨비: 「자네 봉제인형이 없으니, 이번엔 내가 옆에서 도와주겠네!」', 1900);
    }
    if (B.tut) {
        await say('도깨비: 「우선 상대를 얌전하게 만들어야 해. 너무 팔팔한 놈은 리본으로 감싸기도 어렵거든!」', 2200);
        await say('도깨비: 「기회가 왔다 싶으면 아까 준 포옹 리본(소지품)을 써보게! 자, 어서! 김서방만 믿겠네!」', 2400);
    }
    return loop();
}

async function loop() {
    const M = D();
    for (;;) {
        if (!B) return { res: 'gone' };
        // 지문 — 무엇을 할까
        const who = B.me ? B.me.name : '당신';
        const idle = B.me && Math.random() < 0.3;
        B.ui.txt.textContent = idle ? fmt(pick(TX.idle), { a: B.me.name }) : (who + D().josa(who, '은') + ' 무엇을 할까?');
        menu(1);
        const k = await wait();
        if (k === 'run') {
            menu(0);
            const r = await tryRun();
            if (r) return r;
            continue;
        }
        if (k === 'bag') {
            const r = await bagMenu();
            if (r === 'back') continue;
            if (r && r.res) return r;
            // 썼다 — 상대 차례
            const end = await afterMine(null);
            if (end) return end;
            continue;
        }
        // 싸운다
        if (!B.me) {
            if (B.tut) {
                menu(0);
                await say('도깨비가 ' + WILD + '을 콕 찔렀다!', 1200);
                await lunge('foe');
                await blink('foe');
                await setHp('foe', Math.max(1, B.foe.hp - Math.round(B.foe.max * 0.35)));
                await say('따라쟁이가 깜짝 놀라 몸을 움츠렸다.', 1100);
                const end = await afterMine(null);
                if (end) return end;
            } else {
                await say('싸울 수 있는 봉제인형이 없다! (소지품 · 도망친다)', 1500);
            }
            continue;
        }
        const sk = B.me.sk;
        AT.atk.forEach(function (_, i) { const s = sk.a[i]; q('.ska' + i).innerHTML = s ? esc(s[0]) + '<small>' + esc((T().NAME || {})[s[1]] || '') + '</small>' : ''; });
        AT.def.forEach(function (_, i) { const s = sk.d[i]; q('.skd' + i).innerHTML = s ? esc(s[0]) + '<small>' + esc((T().NAME || {})[s[1]] || '') + '</small>' : ''; });
        B.ui.txt.textContent = B.me.name + D().josa(B.me.name, '은') + ' 무엇을 쓸까? (위 셋은 공격 · 아래 둘은 방어)';
        menu(2);
        const k2 = await wait();
        if (k2 === 'back') continue;
        menu(0);
        let guard = null;
        if (k2.charAt(0) === 'a') {
            const s = sk.a[Number(k2.slice(1))];
            if (!s) continue;
            await attack('me', s, null);
        } else {
            const s = sk.d[Number(k2.slice(1))];
            if (!s) continue;
            guard = await defend(s);
        }
        const end = await afterMine(guard);
        if (end) return end;
    }
}

// 내 차례가 끝난 뒤 — 상대가 쓰러졌나 · 상대 차례 · 내가 다 쓰러졌나
async function afterMine(guard) {
    const M = D();
    if (B.foe.hp <= 0) return winFoe();
    // 야생이 달아난다
    if (B.foe.wild && !B.tut && !B.wrapped) {
        const pr = (B.foe.hp / B.foe.max < 0.25) ? 0.10 : 0.04;
        if (Math.random() < pr) {
            await say(fmt(pick(TX.flee), { w: WILD }), 1400);
            return finish({ res: 'fled' });
        }
    }
    await foeTurn(guard);
    if (B.me == null && !B.tut && (B.kind === 'mon' || hadDolls())) return loseAll();
    if (B.foe.hp <= 0) return winFoe();
    return null;
}
function hadDolls() { return Object.keys(B.out).length > 0; }

async function winFoe() {
    const M = D(), f = B.foe;
    await faintFx('foe');
    if (f.wild) await say(WILD + '이 쓰러졌다! 솜뭉치로 돌아가 데굴데굴 굴러갔다.', 1500);
    else await say(fmt(pick(TX.faint), { d: f.name }), 1300);
    if (B.me) await say(fmt(pick(TX.win), { a: B.me.name }), 1300);
    if (B.me) { try { const g = M.bondUp(B.me.id); if (g) await say(B.me.name + '의 교감 +' + g, 800); } catch (e) { } }
    const gain = f.wild ? XP.wild : (f.boss ? XP.boss : XP.mon);
    await giveXp(gain);
    if (!f.wild && !f.boss) await rest();
    return finish({ res: 'win' });
}
async function giveXp(n) {
    const M = D(), u = u_();
    const ids = Object.keys(B.out).concat(B.me ? [B.me.id] : []);
    for (let i = 0; i < ids.length; i++) {
        const c = (B.me && B.me.id === ids[i]) ? B.me : (B.out[ids[i]] || B.cache[ids[i]]);
        if (!c) continue;
        saveHp(c);
        const r = M.giveXp(ids[i], n, u);
        await say(c.name + D().josa(c.name, '은') + ' 경험치 ' + n + '을 얻었다!', 900);
        if (r && r.up) await say(c.name + '의 Lv이 ' + r.lv + D().josa(String(r.lv), '로') + ' 올랐다!', 1200);
    }
}
async function rest() {
    const M = D(), u = u_();
    const ds = M.dolls(u);
    M.withList(u).forEach(function (id) {
        const d = ds[id]; if (!d) return;
        const h = M.hpOf(d);
        if (h <= 0) return;
        const mx = M.stats(d).max;
        M.patchDoll(id, { hp: Math.min(mx, h + Math.round(mx * REST)) }, u);
    });
    await say('봉제인형들이 숨을 고른다. (동행 인형 체력 ' + Math.round(REST * 100) + '% 회복 · 쓰러진 인형 빼고)', 1500);
}
function saveHp(c) {
    if (!c || !c.id) return;
    D().patchDoll(c.id, { hp: Math.max(0, Math.round(c.hp)) });
}
async function loseAll() {
    for (let i = 0; i < TX.lose.length; i++) await say(TX.lose[i], 1300);
    return finish({ res: 'lose' });
}

async function tryRun() {
    const f = B.foe;
    if (f.boss) { await say('무대 위의 것에게서는 도망칠 수 없다!', 1400); return null; }
    const ok = f.wild ? (B.tut || Math.random() < 0.9) : Math.random() < 0.7;
    if (!ok) {
        await say('도망칠 수 없었다!', 1100);
        const end = await afterMine(null);
        return end;
    }
    await say('무사히 도망쳤다!', 1200);
    return finish({ res: 'run' });
}

// 소지품 — 🎀 포옹 리본 · 🔁 인형 바꾸기
function bagMenu() {
    return new Promise(function (resolve) {
        const M = D(), u = u_();
        menu(3);
        const n = M.bagHas(M.ITEM.RIBBON, u);
        const others = M.withList(u).filter(function (id) { return !B.out[id] && (!B.me || B.me.id !== id); })
            .map(function (id) { return B.cache[id] || fromDoll(id); }).filter(function (c) { return c && c.hp > 0; });
        const box = el('div', 'menu');
        box.innerHTML = '<button data-k="ribbon"' + ((B.foe.wild && n > 0) ? '' : ' disabled') + '>🎀 포옹 리본 ×' + n + (B.foe.wild ? '' : ' — 괴담은 감쌀 수 없다') + '</button>'
            + others.map(function (c) { return '<button data-k="sw:' + c.id + '">🔁 ' + esc(c.name) + ' 내보내기 · ' + Math.ceil(c.hp) + '/' + c.max + '</button>'; }).join('')
            + '<button data-k="back">돌아간다</button>';
        B.ui.st.appendChild(box);
        B.ui.txt.textContent = '무엇을 쓸까?';
        Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
            b.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
            b.onclick = async function (ev) {
                ev.stopPropagation();
                if (b.disabled) return;
                fadeRm(box); menu(0);
                const k = b.dataset.k;
                if (k === 'back') return resolve('back');
                if (k === 'ribbon') return resolve(await throwRibbon());
                if (k.indexOf('sw:') === 0) { await swapTo(k.slice(3)); return resolve('used'); }
                resolve('back');
            };
        });
    });
}
async function swapTo(id) {
    const c = B.cache[id] || fromDoll(id);
    if (!c) return;
    B.cache[id] = c;
    if (B.me) {
        await say(fmt(pick(TX.back), { a: B.me.name }), 1000);
        B.cache[B.me.id] = B.me;
        await faintFx('me');
        B.ui.me.style.transform = '';
    }
    B.me = c;
    paintMe(); paintStat(); showStat(true, true);
    await say(fmt(pick(TX.go), { a: c.name }), 1000);
    await whiteIn('me');
}
async function throwRibbon() {
    const M = D(), u = u_(), f = B.foe;
    if (!M.bagAdd(M.ITEM.RIBBON, -1, u)) { await say('포옹 리본이 없다!', 1000); return 'back'; }
    await say(fmt(pick(TX.ribbon), { d: f.name }), 1000);
    // 던진다 — 내 쪽(왼쪽 아래)에서 상대 머리 위로 포물선 · 빙글 돌며
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
    // 잡힐 몫 — 등급이 높을수록 · 체력이 많을수록 어렵다
    let p = (CATCH[f.g] || 0.5) * (1 - 0.66 * f.hp / f.max) + 0.1;
    p = Math.max(0.05, Math.min(0.95, p));
    if (B.tut) p = 1;
    const ok = Math.random() < p;
    const wob = ok ? 3 : 1 + Math.floor(Math.random() * 3);
    const sit = el('div', 'rib', 'left:' + (AT.foe.cx - 15) + 'px;top:' + (AT.foe.foot - 28) + 'px');
    B.ui.st.appendChild(sit);
    setTimeout(function () { sit.remove(); }, 4000);
    for (let i = 0; i < wob; i++) { sit.style.animation = 'dbwob .5s 1'; await sleep(560); sit.style.animation = ''; await sleep(260); }
    if (!ok) {
        sit.remove();
        B.ui.foe.style.transform = ''; B.ui.foe.style.opacity = '1';
        await say(fmt(pick(TX.miss2), { d: f.name }), 1300);
        return 'used';
    }
    fx('✨', [AT.foe.cx - 12, AT.foe.foot - 50], 900);
    await sleep(500);
    sit.remove();
    B.wrapped = true;
    const r = M.addDoll({ sp: f.sp, g: f.g, lv: f.lv, hp: Math.max(1, Math.round(f.hp)) }, u);
    if (!r) {
        await say('보관함이 가득 차 있다! ' + f.name + D().josa(f.name, '이') + ' 리본을 풀고 달아났다……', 1800);
        return finish({ res: 'full' });
    }
    await say(fmt(pick(TX.caught), { d: f.name }), 1500);
    await say(f.name + ' (' + f.g + ' · Lv.' + f.lv + ')' + D().josa(f.name, '은') + (r.where === 'with' ? ' 동행 목록에 들어갔다!' : ' 보관함(펫 박스)으로 보내졌다!') + ' 봉제인형 도감에 적혔다.', 1800);
    M.log('[🧸 포획] ' + f.name + ' (' + f.g + ' · Lv.' + f.lv + ') — ' + (r.where === 'with' ? '동행' : '보관함'), u);
    M.saveHist();
    if (B.me) saveHp(B.me);
    Object.keys(B.out).forEach(function (id) { saveHp(B.out[id]); });
    return finish({ res: 'caught', id: r.id });
}

async function finish(r) {
    if (!B) return r;
    // 체력을 적는다 (쓰러진 것 · 지금 것 · 갈아 넣은 것)
    try {
        Object.keys(B.out).forEach(function (id) { saveHp(B.out[id]); });
        Object.keys(B.cache).forEach(function (id) { saveHp(B.cache[id]); });
        if (B.me) saveHp(B.me);
    } catch (e) { }
    menu(0);
    const ov = B.ui.ov;
    await exitFx(B.ui);
    window.removeEventListener('resize', B.ui.fit);
    ov.remove();
    B = null;
    tapNow = null;
    return r;
}


// ==========================================
// 🐾 여럿이 같이 싸우는 괴담 전투 — 펫 동행 어둠 (doll-party.js 가 판을 쥔다)
// ==========================================
//   판 (dollRun/<열쇠>/fight) = { m, foe, round, roundAt, picks: { 사번: 고른 것 }, log: { 판: [지문…] }, part: { 사번: { 인형: 1 } }, res }
//   사원마다 제 인형 하나(act)를 내보내 고른다 — 다 고르면(또는 시간이 지나면) 파티장 화면이 한 판을 풀어 log 에 적는다.
//   모든 화면은 log 를 받아 같은 연출로 보여 주고, 제 인형의 체력 · 경험치 · 조각만 제 기록에 적는다.
const MUL = { hp: [0.6, 1.2, 1.85, 2.5, 3.2], atk: [0.55, 0.95, 1.3, 1.65, 2.0], def: [1, 1.6, 2.2, 2.8, 3.4] };   // 난이도 D~S (시험 셈으로 맞춘 값)
const GR5 = ['D', 'C', 'B', 'A', 'S'];
function foeFor(mi, diff, n) {
    const m = D().MON_BY[mi], di = Math.max(0, GR5.indexOf(diff));
    const hp = Math.round(m.hp * MUL.hp[di] * (1 + 0.9 * Math.max(0, n - 1)));
    return { i: mi, name: m.n, kind: m.k, boss: !!m.boss, att: m.a, hp: hp, max: hp, atk: Math.round(m.atk * MUL.atk[di] * 10) / 10,
             def: Math.round(m.def * MUL.def[di] * 10) / 10, eva: 5, crit: 5 };
}
function xpFor(diff, boss) { const di = Math.max(0, GR5.indexOf(diff)); return Math.round((boss ? XP.boss : XP.mon) * (1 + 0.5 * di)); }
function aliveKey(m, prefer) {
    const ds = m.dolls || {};
    if (prefer && ds[prefer] && ds[prefer].hp > 0) return prefer;
    const ks = Object.keys(ds).filter(function (k) { return ds[k] && ds[k].hp > 0; });
    return ks.length ? ks[0] : null;
}
// 한 판을 푼다 — 돌려주는 값은 run 아래에 적을 칸들 (update 한 번)
function resolveRound(run, now) {
    const F = run.fight, foe = Object.assign({}, F.foe), P = {}, log = [];
    const order = (run.order || Object.keys(run.members || {})).filter(function (c) { const m = run.members[c]; return m && !m.left; });
    const mem = {};
    order.forEach(function (c) { mem[c] = JSON.parse(JSON.stringify(run.members[c])); });
    const picks = F.picks || {};
    const guards = {};
    const touch = function (c, k) { P['fight/part/' + c + '/' + k] = 1; P['members/' + c + '/dolls/' + k + '/hp'] = Math.max(0, Math.round(mem[c].dolls[k].hp)); };
    const live = function () { return order.filter(function (c) { const m = mem[c]; return !m.out && m.act && m.dolls && m.dolls[m.act] && m.dolls[m.act].hp > 0; }); };
    // 내보낸 인형이 없으면 다음 것으로
    order.forEach(function (c) {
        const m = mem[c];
        if (m.out) return;
        const k = aliveKey(m, m.act);
        if (!k) { m.out = 1; P['members/' + c + '/out'] = 1; return; }
        if (k !== m.act) { m.act = k; P['members/' + c + '/act'] = k; }
        P['fight/part/' + c + '/' + k] = 1;
    });
    let won = false;
    // ① 사원들 차례 (들어온 차례대로)
    for (let i = 0; i < order.length && !won; i++) {
        const c = order[i], m = mem[c];
        if (m.out) continue;
        const d = m.dolls[m.act], k = picks[c] || 'a0';
        const nm = d.nick || D().spName(d.sp);
        if (k === 'run' && c === run.lead && !foe.boss) {
            log.push({ t: m.name + ' 사원이 물러서자고 손짓했다. 파티가 괴담에게서 물러났다!', run: 1 });
            P['fight/res'] = 'run'; P['stage'] = 'walk';
            P['fight/log/' + F.round] = log; P['fight/foe/hp'] = foe.hp;
            return P;
        }
        if (k.indexOf('sw:') === 0) {
            const k2 = k.slice(3);
            if (k2 !== m.act && m.dolls[k2] && m.dolls[k2].hp > 0) {
                log.push({ t: fmt(pick(TX.back), { a: nm }), sw: c, key: m.act, out: 1 });
                m.act = k2; P['members/' + c + '/act'] = k2;
                const d2 = m.dolls[k2], n2 = d2.nick || D().spName(d2.sp);
                log.push({ t: fmt(pick(TX.go), { a: n2 }), go: c, key: k2 });
                touch(c, k2);
            }
            continue;
        }
        const sk = skills(d.sp);
        // 💠 먹인 속성 룬으로 친다 — 세고 빗나가지 않는다 (급소 자주) · 룬 공격은 속성을 안 탄다
        if (k.indexOf('rn:') === 0) {
            const rl = Array.isArray(d.runes) ? d.runes : (d.runes ? Object.keys(d.runes).map(function (x) { return d.runes[x]; }) : []);
            const rn = rl[Number(k.slice(3))];
            if (rn) {
                const RT = window.PETRUNE, rtag = RT ? RT.tag(rn) : rn;
                log.push({ t: fmt(pick(TX.use), { a: nm, m: rtag + ' 룬' }), a: c });
                const dm = Math.max(1, Math.round((d.atk * 1.45 * 1.6 - (foe.def || 0) * 0.6) * rnd(0.92, 1.08) * (Math.random() * 100 < (d.crit || 5) + 20 ? 1.5 : 1)));
                foe.hp = Math.max(0, foe.hp - dm);
                log.push({ t: fmt(pick(TX.hit), { a: nm, d: foe.name }) + ' (룬 ' + dm + ')', hit: 'foe', hp: foe.hp });
                if (foe.hp <= 0) won = true;
                continue;
            }
        }
        if (k.charAt(0) === 'd') {
            const s1 = sk.d[Number(k.slice(1))] || sk.d[0];
            const t = T().DEF[s1[1]] || {};
            log.push({ t: fmt(pick(TX.use), { a: nm, m: s1[0] }), a: c, def: s1[1] });
            if (t.heal) { d.hp = Math.min(d.max, d.hp + Math.round(d.max * t.heal)); touch(c, m.act); log.push({ t: fmt(pick(TX.heal), { a: nm }), heal: c, key: m.act, hp: d.hp }); }
            else { guards[c] = t; log.push({ t: nm + D().josa(nm, '이') + ' 자세를 잡았다. (' + ((T().NAME || {})[s1[1]] || '') + ')' }); }
            continue;
        }
        const s1 = sk.a[Number(k.slice(1))] || sk.a[0];
        log.push({ t: fmt(pick(TX.use), { a: nm, m: s1[0] }), a: c });
        const r = strike(d, foe, s1[1], null);
        if (!r.hit) { log.push({ t: fmt(pick(TX.miss), { a: nm, d: foe.name }) }); continue; }
        foe.hp = Math.max(0, foe.hp - r.dmg);
        log.push({ t: (r.n > 1 ? r.n + '번 맞았다! ' : '') + (r.crit ? fmt(pick(TX.crit), { a: nm }) : fmt(pick(TX.hit), { a: nm, d: foe.name })), hit: 'foe', hp: foe.hp });
        if (r.eff > 1) log.push({ t: pick(TX.great) }); else if (r.eff < 1) log.push({ t: pick(TX.weak) });
        if (r.drain && d.hp > 0) { d.hp = Math.min(d.max, d.hp + r.drain); touch(c, m.act); log.push({ t: nm + D().josa(nm, '이') + ' 기운을 조금 빨아들였다!', heal: c, key: m.act, hp: d.hp }); }
        if (foe.hp <= 0) won = true;
    }
    // ② 괴담 차례
    if (!won) {
        const hits = (foe.boss && order.length >= 2) ? 2 : 1;
        for (let h = 0; h < hits && !won; h++) {
            const al = live();
            if (!al.length) break;
            const tau = al.filter(function (c) { return guards[c] && guards[c].taunt; });
            const c = (tau.length ? tau : al)[Math.floor(Math.random() * (tau.length ? tau.length : al.length))];
            const m = mem[c], d = m.dolls[m.act], nm = d.nick || D().spName(d.sp);
            const mv = pick(D().MON_BY[foe.i].mv);
            log.push({ t: fmt(pick(TX.use), { a: foe.name, m: mv[0] }), f: 1 });
            const r = strike(foe, d, mv[1], guards[c]);
            if (!r.hit) { log.push({ t: fmt(pick(TX.miss), { a: foe.name, d: nm }) }); continue; }
            let dmg = r.dmg, held = false;
            if (d.hp - dmg <= 0 && (Number(d.bond) || 0) >= 100 && !d.held) { d.held = 1; held = true; dmg = Math.max(0, d.hp - 1); P['members/' + c + '/dolls/' + m.act + '/held'] = 1; }
            d.hp = Math.max(0, d.hp - dmg);
            touch(c, m.act);
            log.push({ t: (r.crit ? '급소에 맞았다! ' : '') + fmt(pick(TX.hurt), { d: nm }), hit: c, key: m.act, hp: d.hp });
            if (held) log.push({ t: fmt(pick(TX.hold), { d: nm }) });
            if (r.eff > 1) log.push({ t: pick(TX.great) });
            const g = guards[c];
            if (g && g.reflect && d.hp > 0) {
                const back = Math.max(1, Math.round(r.dmg * g.reflect));
                foe.hp = Math.max(0, foe.hp - back);
                log.push({ t: nm + D().josa(nm, '이') + ' 맞받아쳤다! ' + back + '만큼 되돌려 주었다!', hit: 'foe', hp: foe.hp });
                if (foe.hp <= 0) won = true;
            }
            if (d.hp <= 0) {
                log.push({ t: fmt(pick(TX.faint), { d: nm }), ko: c, key: m.act });
                const k2 = aliveKey(m, null);
                if (k2) {
                    m.act = k2; P['members/' + c + '/act'] = k2;
                    const d2 = m.dolls[k2];
                    log.push({ t: m.name + ' — ' + fmt(pick(TX.go), { a: d2.nick || D().spName(d2.sp) }), go: c, key: k2 });
                    P['fight/part/' + c + '/' + k2] = 1;
                } else { m.out = 1; P['members/' + c + '/out'] = 1; log.push({ t: m.name + ' 사원의 봉제인형이 모두 지쳤다.' }); }
            }
        }
    }
    P['fight/foe/hp'] = foe.hp;
    if (won || foe.hp <= 0) {
        log.push({ t: fmt(pick(TX.faint), { d: foe.name }), ko: 'foe' });
        const drops = {};
        order.forEach(function (c) { if (window.AWK) { const g = window.AWK.rollDrop(run.diff || 'D', foe.boss); if (g.length) drops[c] = g; } });
        log.push({ t: foe.boss ? '무대 위의 것이 쓰러졌다!' : '괴담이 흩어졌다!', win: 1, xp: xpFor(run.diff, foe.boss), drops: drops, boss: foe.boss ? 1 : 0 });
        if (!foe.boss) {
            order.forEach(function (c) {
                const m = mem[c];
                Object.keys(m.dolls || {}).forEach(function (k) { const d = m.dolls[k]; if (d.hp > 0) { d.hp = Math.min(d.max, d.hp + Math.round(d.max * REST)); P['members/' + c + '/dolls/' + k + '/hp'] = Math.round(d.hp); } });
                if (m.out && aliveKey(m, null)) { P['members/' + c + '/out'] = null; }
            });
            log.push({ t: '봉제인형들이 숨을 고른다. (체력 ' + Math.round(REST * 100) + '% 회복 · 쓰러진 인형 빼고)', rest: 1 });
        }
        P['fight/res'] = 'win';
        P['mons/' + F.m + '/dead'] = 1;
        P['stage'] = foe.boss ? 'clear' : 'walk';
    } else if (!live().length) {
        TX.lose.forEach(function (t) { log.push({ t: t }); });
        log[log.length - 1].lose = 1;
        P['fight/res'] = 'lose';
        P['stage'] = 'lose';
    }
    P['fight/log/' + F.round] = log;
    P['fight/round'] = F.round + 1;
    P['fight/picks'] = null;
    P['fight/roundAt'] = now;
    return P;
}

// ── 화면 (모든 사원)
//   o = { code, lead, loc, get() 지금 판, pick(k), waitLog(round) → Promise(log | null) }
function allyPaint() {
    let box = q('.allies');
    if (!box) { box = el('div', 'allies', 'position:absolute;left:150px;top:99px;width:160px;pointer-events:none'); B.ui.st.appendChild(box); }
    const rows = Object.keys(B.mates).map(function (c) {
        const a = B.mates[c];
        if (!a || !a.d) return '<div class="ally" data-c="' + c + '" style="font-size:7px;color:#aaa;background:rgba(0,0,0,.55);margin-bottom:2px;padding:1px 4px;border-radius:3px">' + esc(a ? a.name : '') + ' — 지침</div>';
        const p = Math.max(0, a.d.hp) / a.d.max;
        return '<div class="ally" data-c="' + c + '" style="display:flex;align-items:center;gap:3px;font-size:7px;color:#fff;background:rgba(0,0,0,.55);margin-bottom:2px;padding:1px 4px;border-radius:3px;transition:transform .15s,opacity .2s">'
            + '<div style="' + D().spriteCss(a.d.sp, 16) + '"></div><div style="flex:1;min-width:0"><div style="white-space:nowrap;overflow:hidden">' + esc(a.name) + ' · ' + esc(a.d.nick || D().spName(a.d.sp)) + '</div>'
            + '<div style="height:3px;background:#333"><i style="display:block;height:100%;width:' + Math.round(p * 100) + '%;background:' + hpColor(p) + '"></i></div></div></div>';
    });
    box.innerHTML = rows.join('');
}
function myFrom(run, code) {
    const m = run.members[code];
    if (!m || m.out || !m.act || !m.dolls || !m.dolls[m.act]) return null;
    const d = m.dolls[m.act];
    return { id: m.act, sp: d.sp, g: d.g, lv: d.lv, name: d.nick || D().spName(d.sp), att: d.att, hp: d.hp, max: d.max, sk: skills(d.sp), bond: d.bond };
}
function matesFrom(run, code) {
    const out = {};
    (run.order || Object.keys(run.members || {})).forEach(function (c) {
        if (c === code) return;
        const m = run.members[c];
        if (!m || m.left) return;
        const d = (!m.out && m.act && m.dolls) ? m.dolls[m.act] : null;
        out[c] = { name: m.name, d: d ? { sp: d.sp, nick: d.nick, hp: d.hp, max: d.max } : null };
    });
    return out;
}
async function playEntry(e, o) {
    const code = o.code;
    const ally = function (c) { return q('.ally[data-c="' + c + '"]'); };
    if (e.a) { if (e.a === code) await lunge('me'); else { const r = ally(e.a); if (r) { r.style.transform = 'translateX(-6px)'; await sleep(160); r.style.transform = ''; } } }
    if (e.f) await lunge('foe');
    if (e.hit === 'foe') { await blink('foe'); B.foe.hp = e.hp; paintStat(); await sleep(450); }
    else if (e.hit) {
        if (e.hit === code && B.me && B.me.id === e.key) { await blink('me'); B.me.hp = e.hp; paintStat(); await sleep(450); }
        else if (B.mates[e.hit] && B.mates[e.hit].d) { const r = ally(e.hit); B.mates[e.hit].d.hp = e.hp; allyPaint(); const r2 = ally(e.hit); if (r2) { r2.style.opacity = '.3'; await sleep(120); r2.style.opacity = '1'; } }
    }
    if (e.heal) { if (e.heal === code && B.me && B.me.id === e.key) { B.me.hp = e.hp; paintStat(); } else if (B.mates[e.heal] && B.mates[e.heal].d) { B.mates[e.heal].d.hp = e.hp; allyPaint(); } }
    if (e.ko === 'foe') await faintFx('foe');
    else if (e.ko === code) { await faintFx('me'); }
    if (e.sw === code && e.out) { await faintFx('me'); B.ui.me.style.transform = ''; }
    await say(e.t, e.win || e.lose ? 1500 : 1150);
    if (e.go) {
        const run = o.get();
        if (e.go === code) { B.me = myFrom(run, code); paintMe(); paintStat(); showStat(true, !!B.me); if (B.me) await whiteIn('me'); }
        else { B.mates = matesFrom(run, code); allyPaint(); }
    }
}
async function partyFight(o) {
    if (B) return { res: 'busy' };
    const run0 = o.get();
    const F0 = run0.fight;
    const ui = build(o.loc || 'arcade');
    B = { ui: ui, foe: Object.assign({ mon: F0.foe.i, g: F0.foe.boss ? '보스' : F0.foe.kind }, F0.foe), me: myFrom(run0, o.code), mates: matesFrom(run0, o.code), out: {}, cache: {}, kind: 'party', pick: null };
    B.foe.mon = F0.foe.i;
    ui.ov.addEventListener('pointerdown', onTap);
    paintFoe(false); paintMe(); paintStat(); allyPaint();
    await enterFx(ui, true);
    await sleep(60);
    ui.gF.style.transform = 'translateX(0)'; ui.gM.style.transform = 'translateX(0)';
    await sleep(750);
    ui.foe.style.filter = '';
    await sleep(200);
    const fresh = D().darkSeen(B.foe.mon);
    if (F0.intro) await say(F0.intro, 2600);
    await say((B.foe.boss ? '무대 위의 ' : '') + B.foe.name + D().josa(B.foe.name, '이') + ' 나타났다!' + (fresh ? ' (어둠 도감에 적혔다)' : ''), 1500);
    showStat(true, false);
    if (B.me) { await say(fmt(pick(TX.go), { a: B.me.name }), 1000); await whiteIn('me'); showStat(true, true); }
    for (;;) {
        const run = o.get();
        if (!run || !run.fight) return partyEnd({ res: 'gone' }, o);
        const F = run.fight;
        if (F.res && !(F.log && F.log[F.round - 1] && !B.seen)) { /* 끝난 판 — 마지막 log 는 아래에서 */ }
        const r = F.round;
        // 내 차례
        if (!F.res) {
            B.me = myFrom(run, o.code) || B.me;
            if (B.me && B.me.hp <= 0) B.me = myFrom(run, o.code);
            const mine = myFrom(run, o.code);
            if (mine && !(F.picks && F.picks[o.code])) {
                B.ui.txt.textContent = (Math.random() < 0.3) ? fmt(pick(TX.idle), { a: mine.name }) : (mine.name + D().josa(mine.name, '은') + ' 무엇을 할까?');
                const k = await pickOne(o, run, mine);
                if (k) o.pick(k);
            }
            menu(0);
            B.ui.txt.textContent = Object.keys(B.mates).length ? '다른 사원이 고르기를 기다리는 중…' : '…';
        }
        const lg = await o.waitLog(r);
        if (!B) return { res: 'gone' };
        if (!lg) return partyEnd({ res: 'gone' }, o);
        for (let i = 0; i < lg.length; i++) await playEntry(lg[i], o);
        o.applyLog(lg);
        const nowRun = o.get();
        B.mates = matesFrom(nowRun, o.code); allyPaint();
        if (nowRun.fight && nowRun.fight.res) return partyEnd({ res: nowRun.fight.res, log: lg }, o);
    }
}
function pickOne(o, run, mine) {
    return new Promise(function (resolve) {
        const loop = async function () {
            menu(1);
            const k = await wait();
            if (k === 'run') {
                if (!o.lead) { await say('물러서는 것은 파티장만 정할 수 있다.', 1200); return loop(); }
                if (run.fight.foe.boss) { await say('무대 위의 것에게서는 도망칠 수 없다!', 1200); return loop(); }
                menu(0); return resolve('run');
            }
            if (k === 'bag') {
                menu(3);
                const m = run.members[o.code];
                const others = Object.keys(m.dolls || {}).filter(function (x) { return x !== m.act && m.dolls[x].hp > 0; });
                // 💠 지금 인형에게 먹인 속성 룬 — 여정에서도 친다 (전투 7번이면 깨진다 · pet-rune.js)
                const cur = m.dolls[m.act] || {};
                const rl = Array.isArray(cur.runes) ? cur.runes : (cur.runes ? Object.keys(cur.runes).map(function (x) { return cur.runes[x]; }) : []);
                const rn = Array.isArray(cur.runeN) ? cur.runeN : (cur.runeN ? Object.keys(cur.runeN).map(function (x) { return cur.runeN[x]; }) : []);
                const RT = window.PETRUNE;
                const box = el('div', 'menu');
                box.innerHTML = rl.map(function (r, i) { return '<button data-k="rn:' + i + '">💠 ' + esc(RT ? RT.tag(r) : r) + ' 룬으로 친다 <small style="color:#524173">(' + (Number(rn[i]) || 0) + '/' + (RT ? RT.WEAR_MAX : 7) + ')</small></button>'; }).join('')
                    + others.map(function (x) { const d = m.dolls[x]; return '<button data-k="sw:' + x + '">🔁 ' + esc(d.nick || D().spName(d.sp)) + ' 내보내기 · ' + Math.ceil(d.hp) + '/' + d.max + '</button>'; }).join('')
                    + '<div style="font-size:8.5px;color:#524173;margin:2px 0 6px">🎀 포옹 리본은 어둠에서 쓸 수 없다' + (rl.length ? '' : ' · 룬을 먹인 인형은 룬으로도 친다') + '</div><button data-k="back">돌아간다</button>';
                B.ui.st.appendChild(box);
                Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
                    b.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
                    b.onclick = function (ev) { ev.stopPropagation(); fadeRm(box); menu(0); if (b.dataset.k === 'back') loop(); else resolve(b.dataset.k); };
                });
                return;
            }
            // 싸운다
            const sk = mine.sk;
            AT.atk.forEach(function (_, i) { const s1 = sk.a[i]; q('.ska' + i).innerHTML = s1 ? esc(s1[0]) + '<small>' + esc((T().NAME || {})[s1[1]] || '') + '</small>' : ''; });
            AT.def.forEach(function (_, i) { const s1 = sk.d[i]; q('.skd' + i).innerHTML = s1 ? esc(s1[0]) + '<small>' + esc((T().NAME || {})[s1[1]] || '') + '</small>' : ''; });
            B.ui.txt.textContent = mine.name + D().josa(mine.name, '은') + ' 무엇을 쓸까? (위 셋은 공격 · 아래 둘은 방어)';
            menu(2);
            const k2 = await wait();
            if (k2 === 'back') return loop();
            menu(0);
            resolve(k2);
        };
        loop();
    });
}
async function partyEnd(r, o) {
    if (!B) return r;
    menu(0);
    if (r.res === 'win' && B.me) await say(fmt(pick(TX.win), { a: B.me.name }), 1100);
    const ov = B.ui.ov;
    await exitFx(B.ui);
    window.removeEventListener('resize', B.ui.fit);
    ov.remove();
    B = null; tapNow = null;
    return r;
}

window.DOLLBT = {
    wild: function (o) { o = o || {}; return begin({ kind: 'wild', loc: o.loc || 'wild', tut: !!o.tut, foe: wildFoe(o) }); },
    monster: function (o) { o = o || {}; return begin({ kind: 'mon', loc: o.loc || 'arcade', foe: monFoe(o.mon != null ? o.mon : 9) }); },
    busy: function () { return !!B; },
    party: partyFight, resolve: resolveRound, foeFor: foeFor, xpFor: xpFor, MUL: MUL
};
window.dollBattleTest = function (mon) {
    if (!D() || !D().isAdmin()) { console.warn('상담사만'); return; }
    const p = (mon != null) ? window.DOLLBT.monster({ mon: mon, loc: 'arcade' }) : window.DOLLBT.wild({ loc: 'wild' });
    p.then(function (r) { console.log('[🧸 전투] 끝 —', r); });
};

console.log('[🧸] 전투 — dollBattleTest()');
})();
