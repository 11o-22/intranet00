// ==========================================
// ★ A-214 「빛을 찾아서」 — 더 깊게
// bundles.json 마지막 묶음, a214-kill.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 전에는 이랬다
//
//   걸음표(A214_STEPS)가 0~40 **고정 순서**였다. 장면도 기믹도 늘 같은
//   자리에 같은 것이 나왔다. 판마다 달라지는 것은 **누가 신도인지와
//   주사위뿐**이었다. 그리고 —
//
//     · 신도 과업 10개 중 m04·m06 은 진행시키는 코드가 아예 없었다.
//       매판 3개를 뽑으니, 둘 중 하나가 걸리면 그 판 신도는 시작부터
//       3/3 이 불가능했다.
//     · 과업을 다 채워도 **보상이 같았다.** done 값을 읽는 곳이 화면
//       표시뿐이라, 3/3 이든 0/3 이든 마지막 저지의 결과가 똑같았다.
//     · 비신도에게는 개인 목표가 없었다. 신도만 숙제가 있고 나머지는
//       구경하다 지목만 했다.
//     · 지목은 걸음표에 네 번 있는데 즉사는 「3차」에만 걸려 있었다.
//       4차는 맞혀도 아무 일이 없었다.
//
// ■ 이제 이렇다
//
//   ① 장면 열두 개와 기믹 넷을 더했다 (장면 18 → 30, 기믹 8 → 12).
//   ② 걸음표를 **매판 새로 조립한다.** 선임이 굴려 방에 적고 전원이
//      그것을 읽는다. 같은 글이라도 만나는 차례가 달라진다.
//   ③ 과업을 진짜로 만들었다. m04·m06 을 배선하고, 완수 수가
//      마지막 저지의 난이도와 지급에 **실제로** 들어간다.
//   ④ 비신도에게 네 가지 자리를 준다. 자리마다 이득과 제 숙제가 있다.
//   ⑤ 시간이 자원이 된다. 기믹에 성공하면 시계가 돌아오고, 실패하면
//      깎인다. 신도는 시간을 태울 수 있다.
//   ⑥ 흔적과 단서. 신도가 무슨 짓을 할 때마다 자리에 흔적이 남고,
//      사원은 그것을 주워 지목에 쓴다.
//   ⑦ 지목을 세 번으로 맞췄다. 마지막 지목에서 맞히면 끝난다.
//
// ■ 기믹은 성공 쪽이 유리하다
//
//   A-214 안에서는 판정 보정이 +3 붙는다. 다만 **종류를 적어 부르는
//   판정에만** 붙는다 — rollDarkBonus('hide') 처럼. 신도와 겨루는
//   주사위는 rollDarkBonus() 로 빈손으로 부르므로 보정을 안 탄다.
//   사람을 상대하는 칼부림까지 쉬워지면 안 되기 때문이다.
//
// ■ 콘솔
//   a214PlusState()   걸음표 · 내 자리 · 흔적 · 시간
//   a214Plan()        이번 판 걸음표를 통째로 본다

(function a214Plus() {

const ZONE = 'Qtrew-A-214';
const BONUS_OK  = 25000;      // 기믹 성공 — 시계가 이만큼 돌아온다
const BONUS_BAD = -12000;     // 실패 — 깎인다
const BONUS_MIN = -4 * 60000;
const BONUS_MAX = 6 * 60000;
const BURN_MS   = 90000;      // 신도가 한 번에 태우는 시간
const BURN_CAP  = 2;          // 몇 번까지
const DICE_PLUS = 3;          // 구역 보정 — 종류를 적은 판정에만

function db_() { return (typeof database !== 'undefined') ? database : null; }
function run()  { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function here() { const r = run(); return !!(r && r.zone === ZONE); }
// 방 기록은 두 군데에 있다 —
//   a214State   a214 가지 하나만 보는 리스너가 들고 있는 것
//   darkParties 방 전체를 보는 리스너가 들고 있는 것 (index.html)
// 뒤엣것이 더 자주 갱신된다. 시계 보너스나 흔적처럼 **아랫가지만 바뀌는**
// 값은 앞엣것이 한 박자 늦게 올 때가 있어서, 방 쪽을 먼저 본다.
function st() {
    const r = run();
    try {
        if (r && r.partyId && typeof darkParties !== 'undefined'
            && darkParties[r.partyId] && darkParties[r.partyId].a214) {
            return darkParties[r.partyId].a214;
        }
    } catch (e) { }
    return (typeof a214State !== 'undefined') ? a214State : null;
}
function path() { const r = run(); return r && r.partyId ? 'darkParties/' + r.partyId + '/a214' : null; }
function me()   { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function cult() { const s = st(); return s ? s.traitor : null; }
function amCult() { const u = me(); return !!(u && cult() === u.code); }
function nameOf(c) {
    try { if (typeof safeName === 'function') return safeName(c); } catch (e) { }
    return c;
}
function shuffle(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = x[i]; x[i] = x[j]; x[j] = t;
    }
    return x;
}

// ==========================================
// ① 장면 — 열두 개를 더한다 (19 ~ 30)
// ==========================================
const MORE_NARR = {
19: { text: `세면장이다.<br><br>
    거울이 걸려 있던 자리만 벽지가 덜 바랬다. 네모가 일곱 개.<br>
    떼어 간 것이 아니라 뜯어 간 자국이다. 급했던 모양이다.<br><br>
    수도꼭지를 돌려 본다. 물이 나온다. 따뜻하다.<br>
    여기 아직 누가 쓰고 있다는 뜻이다.` },

20: { text: `배식구가 열려 있다.<br><br>
    식판이 줄지어 놓여 있고, 전부 깨끗하다. 설거지를 한 것이 아니라<br>
    처음부터 쓰지 않은 것처럼 깨끗하다.<br><br>
    그런데 숟가락만 전부 닳아 있다.<br>
    한쪽 면만 고르게. 같은 손이 같은 각도로 오래 썼을 때 나는 자국이다.<br><br>
    식판 수를 세다가 그만둔다. 일행 수보다 많다.` },

21: { text: `신발장이다.<br><br>
    신발이 전부 같은 방향을 보고 있다. 안쪽이 아니라 바깥쪽.<br>
    언제든 나갈 수 있게 벗어 둔 모양새다.<br><br>
    그런데 먼지가 고르게 앉았다. 오래 그대로였다는 뜻이다.<br>
    나갈 준비를 해 두고 나가지 않은 사람들의 신발이다.<br><br>
    한 켤레가 비어 있다. 자리만 비었고 먼지는 똑같이 앉았다.` },

22: { text: `명부가 펼쳐져 있다.<br><br>
    이름이 빼곡하다. 날짜도 적혀 있다. 전부 다른 날이다.<br>
    그런데 글씨가 전부 같다. 획을 긋는 버릇까지 같다.<br><br>
    한 사람이 받아 적은 것이다. 아니면 —<br>
    오래 쓰다 보면 글씨가 같아지는 것인지도 모른다.<br><br>
    마지막 줄이 비어 있다. 날짜만 적혀 있다. 오늘이다.` },

23: { text: `기둥에 금이 그어져 있다.<br><br>
    키를 잰 자국이다. 바닥에서 손바닥 두 개 높이부터 시작해서<br>
    어른 키까지 촘촘히 올라간다.<br><br>
    이름은 없고 날짜만 있다. 같은 사람을 오래 잰 것 같다.<br><br>
    맨 위 금은 천장에 닿아 있다.<br>
    거기서 멈춘 것인지, 거기서 더 잴 수 없게 된 것인지 모르겠다.` },

24: { text: `방송실이다.<br><br>
    탁자에 마이크가 하나, 스위치가 하나. 스위치는 올라가 있다.<br>
    지금도 나가고 있다는 뜻이다.<br><br>
    귀를 기울인다. 복도의 소리와 박자가 맞는다.<br>
    사람들이 따라 하는 게 아니라, 이쪽이 사람들을 맞추고 있었다.<br><br>
    의자는 비어 있다. 앉은 자국만 깊다.` },

25: { text: `빨랫줄이 걸려 있다.<br><br>
    흰 옷이 널려 있다. 스무 벌쯤. 전부 같은 치수다.<br>
    마르지 않았다. 손을 대면 축축하다.<br><br>
    물이 떨어진 자리가 바닥에 점점이 남아 있는데,<br>
    그 점들이 한쪽으로 줄지어 이어진다. 문 쪽이 아니라 벽 쪽으로.<br><br>
    벽에는 문이 없다.` },

26: { text: `계단참이다.<br><br>
    먼지에 발자국이 찍혀 있다. 세어 보면 꽤 많다.<br>
    전부 내려가는 방향이다.<br><br>
    올라오는 자국은 하나도 없다.<br>
    우리가 찍은 것 말고는.<br><br>
    뒤를 돌아본다. 우리 자국도 벌써 흐려져 있다.` },

27: { text: `의무실이다.<br><br>
    침상이 넷. 시트가 전부 반듯하다. 각을 잡아 접었다.<br>
    머리맡에 차트가 걸려 있는데 칸이 비어 있다.<br><br>
    「증상」 칸만 전부 같은 글자로 채워져 있다.<br>
    <span style="color:#d4af37;">"호전됨."</span><br><br>
    무엇이 호전되었는지는 어디에도 안 적혀 있다.` },

28: { text: `옷장 안이다.<br><br>
    숨은 것이 아니라 지나가다 들어와 본 것이다. 그런데 문이 닫혔다.<br>
    밖에서 발소리가 지나간다. 여럿이다.<br><br>
    옷장 안쪽 벽에 글씨가 있다. 손톱으로 긁었다.<br>
    <span style="color:#888;">「세지 마라」</span><br><br>
    무엇을 세지 말라는 건지 모르겠는데, 발소리를 세고 있었다.<br>
    열일곱에서 멈췄다. 소리가 멎어서가 아니라 세기가 무서워져서.` },

29: { text: `천장에 환풍구가 있다.<br><br>
    바람이 아래로 내려온다. 따뜻하다. 아래가 더 따뜻하다는 뜻이다.<br><br>
    날개가 천천히 돈다. 전기가 들어오고 있다.<br>
    그런데 소리가 안 난다. 기름칠을 자주 한 물건이다.<br><br>
    환풍구 안쪽에 천이 걸려 있다. 흰 천이다.<br>
    누가 올라갔다가 걸린 자국인데, 어느 쪽으로 가다 걸렸는지는 모르겠다.` },

30: { text: `물탱크실이다.<br><br>
    탱크가 셋. 둘은 비었고 하나는 차 있다.<br>
    찬 쪽에 사다리가 걸쳐져 있다. 위로 올라가는 사다리다.<br><br>
    수면이 흔들리지 않는다. 바닥까지 비친다.<br>
    바닥에 천이 가라앉아 있다. 흰 천이 여러 장.<br><br>
    고개를 든다. 사다리 끝이 뚜껑에 닿아 있고, 뚜껑은 안에서 잠겼다.` }
};

// ==========================================
// ② 기믹 넷 — 성공 쪽이 넉넉히 유리하게
// ==========================================
//
//   기존 기믹과 같은 꼴로 짠다. 판정이 있는 것은 DC 를 낮게 두고,
//   구역 보정 +3 까지 얹히므로 어지간하면 넘는다. 실패해도 죽지는
//   않는다 — 시간이 깎이고 다음이 조금 나빠진다.
function bar() { return (typeof a214BarHtml === 'function') ? a214BarHtml() : ''; }
function paintBar() { try { renderA214Bar(); } catch (e) { } }
function chat() { try { mountDarkChat('normal'); } catch (e) { } }
function next() { const r = run(); return r ? r.step + 1 : 1; }
function go(label) { return darkChoiceBtn(label, 'partyAdvance(' + next() + ')'); }

// 시계는 여기서 건드리지 않는다 — 아래 watchScore() 가 success/fail 이
// 움직이는 것을 보고 한 번만 얹는다. 두 군데서 더하면 두 배가 된다.
function okMore(mod) {
    const r = run();
    r.success++;
    r.modifier = (r.modifier || 0) + (mod || 1);
}
function badMore(mod) {
    const r = run();
    r.fail++;
    r.modifier = (r.modifier || 0) - (mod || 1);
}

// ── 기믹 9 · 명부 ──────────────────────────
function g9() {
    renderChoiceStep('기믹 9 — 명부',
        `명부 앞이다.<br><br>
         마지막 줄에 오늘 날짜가 적혀 있고 이름 칸이 비어 있다.<br>
         펜이 놓여 있다. 뚜껑이 열린 채다.<br><br>
         적으라는 뜻인지, 적지 말라는 뜻인지 알 수 없다.<br>
         다만 비워 두고 지나간 사람은 없어 보인다.`,
        [
            { id:'blank', label:'① 빈칸 그대로 둔다.',      fn:'a214G9R', arg:'blank' },
            { id:'false', label:'② 없는 이름을 적는다.',    fn:'a214G9R', arg:'false' },
            { id:'tear',  label:'③ 그 장을 찢는다.',        fn:'a214G9R', arg:'tear'  },
            { id:'read',  label:'④ 앞장을 거꾸로 읽는다.',  fn:'a214G9R', arg:'read'  }
        ], null);
    paintBar(); chat();
}
window.a214G9R = function (pick) {
    let txt;
    if (pick === 'blank') {
        okMore(1);
        txt = `펜을 내려놓는다.<br><br>
            적지 않은 채로 돌아선다. 뒤에서 종이 넘어가는 소리가 난다.<br>
            돌아보니 명부는 그대로다. 마지막 줄도 그대로 비어 있다.<br><br>
            비워 둔 것이 맞았던 모양이다. 뭔가가 한 박자 늦게 지나갔다.`;
    } else if (pick === 'false') {
        okMore(2);
        txt = `없는 이름을 적는다. 글씨를 일부러 비뚤게 썼다.<br><br>
            잉크가 마르기 전에 글씨가 번진다. 번지면서 획이 펴진다.<br>
            다 펴지고 나니 아까 본 그 글씨체다.<br><br>
            <span style="color:#d4af37;">"한 분 더 오셨군요."</span><br><br>
            없는 사람을 세어 두면 한 자리가 빈다. 그 자리로 넘어간다.`;
        traceDrop('명부에 없는 이름이 적혔다.');
    } else if (pick === 'tear') {
        badMore(1);
        txt = `찢는다. 소리가 크다.<br><br>
            찢긴 자리에서 다음 장이 올라온다. 거기에도 오늘 날짜가 있다.<br>
            그 아래도, 그 아래도. 몇 장을 찢어도 같다.<br><br>
            손을 멈춘다. 종이는 얼마든지 있다.`;
    } else {
        okMore(1);
        txt = `뒤에서부터 읽는다.<br><br>
            날짜가 거꾸로 올라간다. 올라갈수록 글씨가 흔들린다.<br>
            맨 앞장의 글씨는 아예 다르다. 서툴고, 크고, 눌러썼다.<br><br>
            첫 줄에 이름이 하나뿐이다.<br>
            그 뒤로는 전부 같은 손이 받아 적었다.`;
        clueDrop('명부의 첫 줄은 한 사람이었다.');
    }
    run().log.push('[기믹 9] ' + pick);
    darkBodyEl().innerHTML = darkBox('기믹 9 — 결과', txt, bar() + go('덮는다.'));
    paintBar(); chat();
};

// ── 기믹 10 · 방송 ────────────────────────
function g10() {
    renderChoiceStep('기믹 10 — 방송',
        `방송실 스위치 앞이다.<br><br>
         올라가 있다. 내리면 복도의 박자가 끊긴다.<br>
         끊기면 저쪽도 끊긴 걸 안다.<br><br>
         마이크가 하나 더 있다. 이쪽에서 말할 수도 있다는 뜻이다.`,
        [
            { id:'cut',  label:'① 스위치를 내린다.',          fn:'a214G10R', arg:'cut'  },
            { id:'over', label:'② 마이크를 켜고 덮어 읽는다.', fn:'a214G10R', arg:'over' },
            { id:'wire', label:'③ 선만 끊어 둔다.',            fn:'a214G10R', arg:'wire' },
            { id:'pass', label:'④ 건드리지 않고 지나간다.',    fn:'a214G10R', arg:'pass' }
        ], null);
    paintBar(); chat();
}
window.a214G10R = function (pick) {
    const roll = (typeof luckReroll === 'function')
        ? luckReroll(Math.floor(Math.random() * 20) + 1) : Math.floor(Math.random() * 20) + 1;
    const bns = (typeof rollDarkBonus === 'function') ? (rollDarkBonus('sense') || 0) : 0;
    const DC = { cut: 11, over: 13, wire: 9, pass: 0 }[pick];
    const ok = pick === 'pass' || (roll !== 1 && (roll + bns) >= DC);
    let txt;

    if (pick === 'pass') {
        okMore(1);
        txt = `지나간다.<br><br>
            등 뒤에서 박자가 그대로 이어진다. 끊지 않았으니 저쪽도 모른다.<br>
            모르는 채로 두는 것도 하나의 수다.<br><br>
            복도 끝까지 아무 일도 없었다. 그게 좀 서운할 지경이다.`;
    } else if (ok && pick === 'cut') {
        okMore(2);
        txt = `내린다.<br><br>
            복도가 조용해진다. 사람 소리가 아니라 기계 소리였다는 뜻이다.<br>
            조용한 채로 열을 센다. 아무도 오지 않는다.<br><br>
            <span style="color:#4CAF50;">열하나에서 다시 걷기 시작한다. 발소리가 우리 것뿐이다.</span><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / ${DC}</span>`;
    } else if (ok && pick === 'over') {
        okMore(3);
        txt = `마이크를 켜고, 복도의 문장을 **반 박자 먼저** 읽는다.<br><br>
            사람들이 따라온다. 박자가 이쪽으로 넘어온다.<br>
            한 소절을 끌고 가다가 그대로 끊어 버린다.<br><br>
            <span style="color:#d4af37;">아래에서 노래가 흐트러진다. 처음 있는 일인 듯하다.</span><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / ${DC}</span>`;
        clueDrop('박자를 끊었을 때, 한 사람만 따라 부르지 않았다.');
    } else if (ok) {
        okMore(1);
        txt = `선만 끊어 둔다. 스위치는 올라간 채다.<br><br>
            소리는 그대로 나오는데 어디서 나오는지 알 수 없게 되었다.<br>
            저쪽도 당분간은 모를 것이다.<br><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / ${DC}</span>`;
    } else {
        badMore(1);
        txt = `손이 미끄러진다.<br><br>
            스위치가 반쯤 내려갔다 올라온다. 그 반 박자 동안 복도가 조용했다.<br>
            조용했던 것을 저쪽도 들었다.<br><br>
            <span style="color:#ff6b6b;">복도의 문장이 한 번 멈췄다가, 아까보다 크게 다시 시작된다.</span><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / ${DC}</span>`;
    }
    run().log.push('[기믹 10] ' + pick + (ok ? ' 성공' : ' 실패'));
    darkBodyEl().innerHTML = darkBox('기믹 10 — 결과', txt, bar() + go('나간다.'));
    paintBar(); chat();
};

// ── 기믹 11 · 흔적 ────────────────────────
//   사원은 여기서 단서를 줍는다. 신도 화면에는 **지우는 쪽**이 뜬다.
function g11() {
    const list = traces();
    if (amCult()) {
        darkBodyEl().innerHTML = darkBox('기믹 11 — 흔적',
            `바닥에 자국이 남아 있다.<br><br>
             내가 낸 자국이다. 아까는 못 봤는데 여기서 보니 보인다.<br>
             남들도 곧 지나간다.<br><br>
             ${list.length
                ? '<span style="color:#ff6b6b;">남아 있는 자국 ' + list.length + '개.</span>'
                : '<span style="color:#888;">아직 남긴 것이 없다.</span>'}`,
            bar()
            + (list.length
                ? darkChoiceBtn('지운다. (시간이 든다)', 'a214Wipe()')
                : '')
            + go('그냥 간다.'));
        paintBar(); chat();
        return;
    }
    const mine = clues().length;
    darkBodyEl().innerHTML = darkBox('기믹 11 — 흔적',
        `바닥에 자국이 남아 있다.<br><br>
         우리 것이 아니다. 아니, 우리 중 하나의 것이다.<br>
         어느 쪽이든 읽어 둘 값은 있다.<br><br>
         ${list.length
            ? '<span style="color:#d4af37;">읽을 수 있는 자국 ' + list.length + '개.</span>'
            : '<span style="color:#888;">아직 아무 자국도 없다. 너무 이른 자리다.</span>'}
         <div style="font-size:11px; color:#888; margin-top:9px;">
            지금 가진 단서 ${mine}개 — 둘을 모으면 지목에서 내 손가락이 두 몫이 된다.
         </div>`,
        bar()
        + (list.length ? darkChoiceBtn('읽는다.', 'a214Read()') : '')
        + go('지나친다.'));
    paintBar(); chat();
}

window.a214Read = function () {
    const list = traces();
    if (!list.length) return;
    const take = roleOf() === 'rec' ? 2 : 1;          // 기록자는 하나 더 읽는다
    const got = shuffle(list).slice(0, take);
    got.forEach(function (t) { clueKeep(t.id, t.hint); });
    const r = run();
    r.success++;                       // 시계는 watchScore() 가 얹는다
    roleTick('clue', got.length);
    r.log.push('[흔적] ' + got.length + '개');
    darkBodyEl().innerHTML = darkBox('흔적 — 읽음',
        `쪼그려 앉아 들여다본다.<br><br>
         ${got.map(function (t) {
            return '<div style="margin:6px 0; padding:8px 10px; border-left:2px solid #d4af37;'
                + ' background:rgba(212,175,55,0.07); font-size:12px; color:#e8d9a8;">'
                + esc(t.hint) + '</div>';
         }).join('')}
         <br>일어선다. 무릎이 축축하다.<br>
         아무에게도 말하지 않기로 한다. 아직은.`,
        bar() + go('따라붙는다.'));
    paintBar(); chat();
};

window.a214Wipe = function () {
    const p = path();
    if (p && db_()) db_().ref(p + '/traces').remove();
    addTime(-20000, '흔적 지우기');     // 지우는 데에도 시간이 든다
    const r = run();
    r.log.push('[신도] 흔적 지움');
    darkBodyEl().innerHTML = darkBox('흔적 — 지움',
        `소매로 문지른다. 생각보다 잘 지워진다.<br><br>
         지우고 나니 지운 자리가 더 깨끗해서 눈에 띈다.<br>
         주변을 똑같이 문질러 고르게 만든다. 시간이 좀 걸렸다.<br><br>
         <span style="color:#ff6b6b;">이제 읽을 것이 없다.</span>`,
        bar() + go('돌아간다.'));
    paintBar(); chat();
};

// ── 기믹 12 · 빈자리 ──────────────────────
//   사람이 줄었을 때만 뜻이 있다. 아무도 안 죽었으면 조용히 지나간다.
function g12() {
    const gone = deadList();
    if (!gone.length) {
        darkBodyEl().innerHTML = darkBox('기믹 12 — 빈자리',
            `인원을 센다.<br><br>
             맞다. 들어온 수 그대로다.<br>
             세고 나서야 왜 세고 있었는지 생각한다.<br><br>
             <span style="color:#888;">아직은 아무도 빠지지 않았다.</span>`,
            bar() + go('계속 간다.'));
        okMore(1);
        paintBar(); chat();
        return;
    }
    const nm = esc(gone[gone.length - 1].name || '누군가');
    if (amCult()) {
        darkBodyEl().innerHTML = darkBox('기믹 12 — 빈자리',
            `흰 천을 덮어 둔 자리로 다시 왔다.<br><br>
             덮은 모양이 흐트러져 있다. 바람이 아니다.<br>
             누가 들췄다 놓았다.<br><br>
             <span style="color:#ff6b6b;">${nm} 사원이다. 아직 여기 있다.</span>`,
            bar()
            + darkChoiceBtn('더 깊이 옮겨 둔다.', 'a214Hide()')
            + go('그냥 둔다.'));
        paintBar(); chat();
        return;
    }
    darkBodyEl().innerHTML = darkBox('기믹 12 — 빈자리',
        `인원을 센다.<br><br>
         하나 모자란다. 두 번 세어도 모자란다.<br>
         ${nm} 사원이다. 언제부터인지는 아무도 모른다.<br><br>
         <span style="color:#888;">여기서는 뒤를 돌아보는 일이 드물다.<br>
         돌아보면 세어야 하고, 세면 알게 되니까.</span>`,
        bar()
        + darkChoiceBtn('자리를 살핀다.', 'a214Look()')
        + go('묵념하고 간다.'));
    paintBar(); chat();
}

window.a214Look = function () {
    const roll = (typeof luckReroll === 'function')
        ? luckReroll(Math.floor(Math.random() * 20) + 1) : Math.floor(Math.random() * 20) + 1;
    const bns = (typeof rollDarkBonus === 'function') ? (rollDarkBonus('sense') || 0) : 0;
    const ok = roll !== 1 && (roll + bns) >= 10;
    let txt;
    if (ok) {
        okMore(2);
        clueKeep('body|' + Date.now(), '천을 덮은 손은 왼손잡이다. 매듭이 반대로 묶여 있었다.');
        roleTick('clue', 1);
        txt = `천을 들춘다.<br><br>
            덮은 사람은 급하지 않았다. 매듭까지 지어 두었다.<br>
            매듭이 반대 방향이다. 왼손으로 묶은 매듭이다.<br><br>
            <span style="color:#d4af37;">단서를 하나 챙겼다.</span><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / 10</span>`;
    } else {
        badMore(1);
        txt = `천을 들추려다 만다.<br><br>
            손이 닿기 전에 뒤에서 기척이 났다. 돌아보니 아무도 없다.<br>
            다시 보니 천이 아까보다 반듯하게 덮여 있다.<br><br>
            <span style="color:#ff6b6b;">누가 지켜보고 있었다는 뜻이다.</span><br>
            <span style="font-size:11px; color:#888;">주사위 ${roll}+${bns} / 10</span>`;
    }
    run().log.push('[기믹 12] 살핌 ' + (ok ? '성공' : '실패'));
    darkBodyEl().innerHTML = darkBox('기믹 12 — 결과', txt, bar() + go('일어선다.'));
    paintBar(); chat();
};

window.a214Hide = function () {
    const p = path();
    if (p && db_()) db_().ref(p + '/traces').remove();
    addTime(-20000, '자리 옮기기');
    const r = run();
    r.log.push('[신도] 자리 옮김');
    darkBodyEl().innerHTML = darkBox('기믹 12 — 옮김',
        `끌고 간다. 생각보다 가볍다.<br><br>
         물탱크 쪽이 낫겠다 싶었는데 사다리가 걸려 있어 그만둔다.<br>
         결국 옷장에 세워 두고 문을 닫았다.<br><br>
         <span style="color:#ff6b6b;">문이 잘 닫히지 않아서 한참 눌렀다.</span>`,
        bar() + go('손을 턴다.'));
    paintBar(); chat();
};

const MINE = { 9: g9, 10: g10, 11: g11, 12: g12 };

// ==========================================
// ③ 걸음표를 매판 조립한다
// ==========================================
//
//   선임이 한 번 굴려 방(a214/plan)에 적고, 전원이 그것을 읽어 쓴다.
//   같은 표를 봐야 걸음 번호(curStep)가 어긋나지 않는다.
//
//   뼈대는 지킨다 —
//     · 0 은 진입, 마지막은 기믹 8(마지막 저지)
//     · 갈림과 합류는 **짝으로** 같은 번호끼리, 갈림이 먼저
//     · 갈림 다섯 쌍 (a214-kill.js 의 사냥 셈이 다섯을 기준으로 돈다)
//     · 지목 세 번 — 마지막에 맞히면 그 자리에서 끝난다
const NARR_POOL = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
                   19,20,21,22,23,24,25,26,27,28,29,30];
const GIM_POOL  = [1,2,3,4,5,6,7,9,10,11,12];     // 8 은 마지막 고정

function buildPlan() {
    const narr = shuffle(NARR_POOL);
    // 흔적(11)·빈자리(12)는 **늘 넣는다** — 단서와 추리가 여기서만 나온다.
    // 그리고 뒤쪽에 둬야 읽을 것이 쌓여 있다.
    const late = shuffle([11, 12]);
    const early = shuffle(GIM_POOL.filter(function (n) { return n !== 11 && n !== 12; })).slice(0, 7);

    const steps = [{ t: 'intro' }];
    let ni = 0;
    const takeNarr = function (k) {
        for (let i = 0; i < k; i++) {
            if (ni < narr.length) steps.push({ t: 'narr', n: narr[ni++] });
        }
    };

    // 다섯 마당. 마당마다 [장면 → 기믹 → 갈림 → (장면) → 합류] 를 깐다.
    // 지목은 세 번. 마지막 한 번은 반드시 끝 마당에 둔다 —
    // 세 번째에 맞히면 그 자리에서 끝나므로, 일찍 나오면 남은 길이 허전하다.
    const votesAt = [shuffle([0, 1])[0], shuffle([2, 3])[0], 4];
    for (let s = 1; s <= 5; s++) {
        takeNarr(2);
        if (early.length) steps.push({ t: 'gimmick', n: early.shift() });
        steps.push({ t: 'split', n: s });
        if (Math.random() < 0.6) takeNarr(1);
        steps.push({ t: 'rejoin', n: s });
        if (early.length && Math.random() < 0.7) steps.push({ t: 'gimmick', n: early.shift() });
        if (votesAt.indexOf(s - 1) >= 0) steps.push({ t: 'vote', n: votesAt.indexOf(s - 1) + 1 });
        if (late.length && s >= 3) steps.push({ t: 'gimmick', n: late.shift() });
    }
    // 남은 기믹과 장면을 꼬리에 붙인다
    while (early.length) steps.push({ t: 'gimmick', n: early.shift() });
    while (late.length)  steps.push({ t: 'gimmick', n: late.shift() });
    takeNarr(1);
    steps.push({ t: 'gimmick', n: 8 });               // 마지막 저지
    return steps;
}

let applied = '';
function applyPlan(plan) {
    if (!Array.isArray(plan) || !plan.length) return false;
    const key = plan.map(function (x) { return x.t + (x.n || ''); }).join(',');
    if (applied === key) return true;
    if (typeof A214_STEPS === 'undefined') return false;
    Object.keys(A214_STEPS).forEach(function (k) { delete A214_STEPS[k]; });
    plan.forEach(function (x, i) {
        A214_STEPS[i] = (x.n == null) ? { type: x.t } : { type: x.t, n: x.n };
    });
    A214_STEPS[99] = { type: 'result' };
    applied = key;
    console.log('[A-214] 걸음표 ' + plan.length + '칸을 받았습니다.');
    return true;
}

let planning = false;
function ensurePlan() {
    const r = run(), s = st(), p = path();
    if (!here() || !r || !s || !p || !db_()) return;
    if (Array.isArray(s.plan) && s.plan.length) { applyPlan(s.plan); return; }
    if (!r.isLeader || planning) return;
    planning = true;
    const mk = buildPlan();
    db_().ref(p + '/plan').transaction(function (cur) {
        return (cur && cur.length) ? undefined : mk;
    }, null, false).then(function (res) {
        planning = false;
        const v = res && res.snapshot && res.snapshot.val();
        if (v) applyPlan(v);
    }).catch(function () { planning = false; });
}

// ==========================================
// ④ 자리 — 비신도에게도 할 일을 준다
// ==========================================
const ROLES = {
    rec:  { icon:'📓', name:'기록자',   goal:3,
            good:'흔적을 읽을 때 하나를 더 읽는다.',
            task:'흔적이나 단서를 3개 모은다.',  cnt:'clue' },
    lamp: { icon:'🕯', name:'등불지기', goal:4,
            good:'기믹에 성공하면 돌아오는 시간이 한 배 반이 된다.',
            task:'기믹에 4번 성공한다.',         cnt:'gim' },
    eye:  { icon:'👁', name:'감시자',   goal:3,
            good:'갈림길에서 누가 혼자 갔는지 보인다.',
            task:'갈림길을 3번 지난다.',         cnt:'split' },
    gate: { icon:'🔒', name:'문지기',   goal:2,
            good:'혼자 떨어져도 한 번은 저절로 합류한다.',
            task:'합류에 2번 성공한다.',         cnt:'join' }
};
const ROLE_KEYS = ['rec', 'lamp', 'eye', 'gate'];

function roleOf() {
    const s = st(), u = me();
    if (!s || !u || amCult()) return null;
    return (s.roles || {})[u.code] || null;
}
function roleDef() { const k = roleOf(); return k ? ROLES[k] : null; }

let rolling = false;
function ensureRoles() {
    const r = run(), s = st(), p = path();
    if (!here() || !r || !r.isLeader || !s || !p || !db_()) return;
    if (s.roles && Object.keys(s.roles).length) return;
    if (rolling) return;
    rolling = true;
    const codes = rosterCodes();
    const pool = shuffle(ROLE_KEYS);
    const map = {};
    codes.filter(function (c) { return c !== s.traitor; })
         .forEach(function (c, i) { map[c] = pool[i % pool.length]; });
    if (!Object.keys(map).length) { rolling = false; return; }
    db_().ref(p + '/roles').transaction(function (cur) {
        return (cur && Object.keys(cur).length) ? undefined : map;
    }, null, false).then(function () { rolling = false; })
      .catch(function () { rolling = false; });
}

function rosterCodes() {
    const r = run();
    try {
        const party = darkParties[r.partyId] || {};
        return Object.keys(party.members || party.alive || {});
    } catch (e) { return []; }
}

// 제 숙제는 제 화면에서 센다 (남이 셀 수 없는 것들이다)
function roleTick(kind, n) {
    const r = run(), d = roleDef();
    if (!r || !d || d.cnt !== kind) return;
    r._a214RoleDone = Math.min(d.goal, (r._a214RoleDone || 0) + (n || 1));
}

// ==========================================
// ⑤ 시간 — 자원으로 쓴다
// ==========================================
function bonusMs() {
    const s = st();
    const v = (s && s.timeBonus) || 0;
    return Math.max(BONUS_MIN, Math.min(BONUS_MAX, v));
}
function addTime(ms, why) {
    const p = path();
    if (!p || !db_() || !ms) return;
    let v = ms;
    if (ms > 0 && roleOf() === 'lamp') v = Math.round(ms * 1.5);   // 등불지기
    db_().ref(p + '/timeBonus').transaction(function (cur) {
        const was = Number(cur) || 0;
        return Math.max(BONUS_MIN, Math.min(BONUS_MAX, was + v));
    }, null, false).catch(function () { });
    try {
        if (typeof showDarkToast === 'function') {
            showDarkToast((v > 0 ? '시간 +' : '시간 −') + Math.round(Math.abs(v) / 1000) + '초'
                + (why ? ' (' + why + ')' : ''));
        }
    } catch (e) { }
}

window.a214Burn = function () {
    if (!amCult()) return;
    const s = st(), p = path();
    if (!s || !p) return;
    const used = Number(s.burned) || 0;
    if (used >= BURN_CAP) { showCustomAlert('더 태울 것이 없습니다.'); return; }
    db_().ref(p + '/burned').transaction(function (cur) {
        const was = Number(cur) || 0;
        if (was >= BURN_CAP) return;
        return was + 1;
    }, null, false).then(function (res) {
        if (!res || !res.committed) return;
        addTime(-BURN_MS, '태움');
        traceDrop('어딘가에서 등불 하나가 꺼졌다. 기름 냄새가 났다.');
        const r = run();
        if (r) r.log.push('[신도] 시간을 태움');
        try { showCustomAlert('등불 하나를 껐습니다.\n\n모두의 시계가 '
            + Math.round(BURN_MS / 1000) + '초 줄었습니다.\n아무도 누가 껐는지는 모릅니다.'); } catch (e) { }
    }).catch(function () { });
};

// ==========================================
// ⑥ 흔적과 단서
// ==========================================
function traces() {
    const s = st();
    const t = (s && s.traces) || {};
    return Object.keys(t).map(function (k) {
        return { id: k, hint: (t[k] || {}).hint || '', at: (t[k] || {}).at || 0 };
    }).filter(function (x) { return x.hint; });
}
function traceDrop(hint) {
    const p = path();
    if (!p || !db_() || !hint) return;
    db_().ref(p + '/traces').push({ hint: hint, at: Date.now() }).catch(function () { });
}
function clues() {
    const r = run();
    if (!r) return [];
    if (!Array.isArray(r._a214Clues)) r._a214Clues = [];
    return r._a214Clues;
}
function clueKeep(id, hint) {
    const r = run();
    if (!r) return;
    const c = clues();
    if (c.some(function (x) { return x.id === id; })) return;
    c.push({ id: id, hint: hint });
}
function clueDrop(hint) { clueKeep('x|' + Date.now() + '|' + Math.random(), hint); }

// 신도가 과업을 깰 때마다 자리에 흔적이 남는다
const TRACE_BY = {
    m01: '복도 한쪽에 발자국이 둘로 갈렸다가 하나만 돌아왔다.',
    m02: '의식 도구 하나가 제자리에 있다. 먼지만 자리를 안 맞췄다.',
    m03: '봉인 재료 수가 하나 모자란다. 센 사람이 두 번 세었다.',
    m04: '같은 쪽으로 간 두 사람의 발자국 간격이 고르다. 끌려간 것이 아니다.',
    m05: '지목을 받지 않은 사람이 제일 먼저 자리를 옮겼다.',
    m06: '손가락을 들기 전에 한 사람이 다른 쪽을 봤다.',
    m07: '갈라진 길마다 발자국이 하나씩이다. 아무도 같이 가지 않았다.',
    m08: '끌려가는 소리를 들은 자리에 신발 자국이 하나 서 있다가 돌아섰다.',
    m09: '등불 심지가 젖어 있다. 물을 끼얹은 자국이다.',
    m10: '집회의 문장에 한 목소리가 반 박자 빨랐다.'
};

// ==========================================
// 배선 — 기존 함수에 얹는다
// ==========================================

// ── 판정 보정 +3 — 종류를 적어 부른 판정에만 ──
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._a214p) { clearInterval(iv); return; }
        const _b = rollDarkBonus;
        const w = function (kind) {
            let v = 0;
            try { v = _b.apply(this, arguments) || 0; } catch (e) { v = 0; }
            // 빈손으로 부른 것(신도와 겨루는 주사위)에는 안 붙인다
            if (here() && arguments.length > 0 && kind) v += DICE_PLUS;
            return v;
        };
        w._a214p = true;
        rollDarkBonus = w;
        window.rollDarkBonus = w;
        clearInterval(iv);
        console.log('[A-214] 판정 보정 연결');
    }, 400);
})();

// ── 시계 — 방에 적힌 보너스를 얹는다 ──
(function hookTotal() {
    const iv = setInterval(function () {
        if (typeof a214Total !== 'function') return;
        if (a214Total._a214p) { clearInterval(iv); return; }
        const _t = a214Total;
        const w = function () {
            let v = 0;
            try { v = _t.apply(this, arguments); } catch (e) { v = 15 * 60000; }
            try { v += bonusMs(); } catch (e) { }
            return Math.max(60000, v);
        };
        w._a214p = true;
        a214Total = w;
        window.a214Total = w;
        clearInterval(iv);
        console.log('[A-214] 시계 연결');
    }, 400);
})();

// ── 그리기 — 걸음표를 맞추고, 내 기믹을 그린다 ──
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderStepA214 !== 'function') return;
        if (renderStepA214._a214p) { clearInterval(iv); return; }
        const _r = renderStepA214;
        const w = function () {
            try { if (here()) { ensurePlan(); ensureRoles(); } } catch (e) { }
            const out = _r.apply(this, arguments);
            try { mine(); } catch (e) { console.warn('[A-214]', e); }
            return out;
        };
        w._a214p = true;
        renderStepA214 = w;
        window.renderStepA214 = w;
        clearInterval(iv);
        console.log('[A-214] 걸음표 연결');
    }, 400);
})();

// 원래 함수는 기믹 1~8 만 안다. 9 이상은 아무것도 안 그리고 끝나므로
// (자리 준비·시계·채팅은 그쪽이 다 해 두었다) 여기서 본문만 채운다.
function mine() {
    const r = run();
    if (!here() || !r || !st()) return;
    if (r.rejoined) return;
    const def = (typeof A214_STEPS !== 'undefined') ? A214_STEPS[r.step] : null;
    if (!def || def.type !== 'gimmick') return;
    if (!MINE[def.n]) return;
    if (r._a214MyStep === r.step) return;      // 같은 걸음을 두 번 그리지 않는다
    r._a214MyStep = r.step;
    MINE[def.n]();
}

// ── 과업 — 흔적을 남기고, 못 깨던 둘을 배선한다 ──
(function hookProgress() {
    const iv = setInterval(function () {
        if (typeof a214Progress !== 'function') return;
        if (a214Progress._a214p) { clearInterval(iv); return; }
        const _p = a214Progress;
        const w = function (id, amt) {
            const out = _p.apply(this, arguments);
            try { if (amCult() && TRACE_BY[id]) traceDrop(TRACE_BY[id]); } catch (e) { }
            return out;
        };
        w._a214p = true;
        a214Progress = w;
        window.a214Progress = w;
        clearInterval(iv);
        console.log('[A-214] 과업 흔적 연결');
    }, 400);
})();

// m04 「인도하기」 — 내가 고른 길을 대상이 따라왔는가
// m07·m01 은 원래대로 두고, 자리 세기와 감시자 눈만 얹는다
(function hookSplit() {
    const iv = setInterval(function () {
        if (typeof a214AfterSplit !== 'function') return;
        if (a214AfterSplit._a214p) { clearInterval(iv); return; }
        const _a = a214AfterSplit;
        const w = function (n, v) {
            const out = _a.apply(this, arguments);
            try { afterSplit(n, v); } catch (e) { console.warn('[A-214]', e); }
            return out;
        };
        w._a214p = true;
        a214AfterSplit = w;
        window.a214AfterSplit = w;
        clearInterval(iv);
        console.log('[A-214] 갈림 연결');
    }, 400);
})();

function afterSplit(n, v) {
    roleTick('split');
    const p = path();
    if (!p || !db_()) return;
    db_().ref(p + '/split' + n).once('value').then(function (s) {
        const picks = s.val() || {};
        const u = me();
        // m04 — 내가 고른 길로 대상이 따라왔다
        if (amCult()) {
            const ms = ((st() || {}).missions || []);
            const m4 = ms.filter(function (x) { return x.id === 'm04'; })[0];
            if (m4 && m4.target && m4.done < m4.goal) {
                const t = picks[m4.target];
                if (t && t.pick === v) {
                    try { a214Progress('m04', 1); } catch (e) { }
                }
            }
        }
        // 감시자 — 누가 혼자 갔는지 보인다
        if (roleOf() === 'eye') {
            const cnt = {};
            Object.keys(picks).forEach(function (c) {
                const k = (picks[c] || {}).pick;
                if (k) cnt[k] = (cnt[k] || 0) + 1;
            });
            const alone = Object.keys(picks).filter(function (c) {
                return c !== (u || {}).code && cnt[(picks[c] || {}).pick] === 1;
            }).map(function (c) { return (picks[c] || {}).name || nameOf(c); });
            const box = document.getElementById('a214-eye');
            const html = '<div id="a214-eye" style="margin:10px 0 0 0; padding:9px 11px;'
                + ' border-radius:6px; background:rgba(47,111,159,0.12); border:1px solid #2f6f9f;'
                + ' font-size:11px; color:#bcdcf2; line-height:1.7;">'
                + '👁 <b>감시자</b> — '
                + (alone.length
                    ? '혼자 간 사람: <b style="color:#ffd700;">' + esc(alone.join(', ')) + '</b>'
                    : '아무도 혼자 가지 않았다.')
                + '</div>';
            if (box) box.outerHTML = html;
            else {
                const b = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (b) b.insertAdjacentHTML('beforeend', html);
            }
        }
    }).catch(function () { });
}

// m06 「거짓 신호」 — 내 손가락이 결과를 뒤집었는가
// 합류 세기 · 지목을 세 번으로
(function hookVote() {
    const iv = setInterval(function () {
        if (typeof a214ShowVoteResult !== 'function') return;
        if (a214ShowVoteResult._a214p) { clearInterval(iv); return; }
        const _v = a214ShowVoteResult;
        const w = function (n, top, nm, hit) {
            try { if (amCult()) checkFlip(n, top); } catch (e) { }
            return _v.apply(this, arguments);
        };
        w._a214p = true;
        a214ShowVoteResult = w;
        window.a214ShowVoteResult = w;
        clearInterval(iv);
        console.log('[A-214] 지목 연결');
    }, 400);
})();

function checkFlip(n, top) {
    const s = st(), u = me();
    if (!s || !u || !top) return;
    const votes = ((s.votes || {})['vote' + n]) || {};
    if (!votes[u.code]) return;
    const tally = function (skip) {
        const t = {};
        Object.keys(votes).forEach(function (c) {
            if (c === skip) return;
            t[votes[c]] = (t[votes[c]] || 0) + 1;
        });
        let best = null, max = 0;
        Object.keys(t).forEach(function (c) { if (t[c] > max) { max = t[c]; best = c; } });
        return best;
    };
    // 내 손가락을 빼면 결과가 달라진다 = 내가 뒤집었다
    if (tally(u.code) !== top) {
        try { a214Progress('m06', 1); } catch (e) { }
    }
}

// ── 지목 화면 — 모아 둔 단서를 펼친다 ──
//
//   표를 조작하지 않는다. 표 수를 손대면 「전원 투표하면 자동 마감」이
//   사람 수보다 먼저 차서 혼자 마감돼 버린다. 대신 **읽을 것**을 준다.
//     단서 1개 이상 — 주운 글귀를 지목 화면에서 다시 본다
//     단서 3개 이상 — 마지막 지목에서 용의자가 둘로 좁혀진다
(function hookVoteView() {
    const iv = setInterval(function () {
        if (typeof renderA214Vote !== 'function') return;
        if (renderA214Vote._a214p) { clearInterval(iv); return; }
        const _v = renderA214Vote;
        const w = function (n) {
            const out = _v.apply(this, arguments);
            try { voteClues(n); } catch (e) { }
            return out;
        };
        w._a214p = true;
        renderA214Vote = w;
        window.renderA214Vote = w;
        clearInterval(iv);
        console.log('[A-214] 지목 화면 연결');
    }, 400);
})();

function voteClues(n) {
    if (amCult()) return;
    const c = clues();
    if (!c.length) return;
    const b = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
    if (!b || document.getElementById('a214-clue-box')) return;

    let narrow = '';
    if (c.length >= 3 && n >= 3) {
        const s = st() || {};
        const pool = rosterCodes().filter(function (x) { return x !== (me() || {}).code; });
        const others = shuffle(pool.filter(function (x) { return x !== s.traitor; }));
        const two = shuffle([s.traitor, others[0]].filter(Boolean));
        if (two.length === 2) {
            narrow = '<div style="margin-top:7px; padding-top:7px; border-top:1px dashed #5a4a2a;'
                + ' color:#ffd700;">단서를 모으고 보니 둘 중 하나다 — <b>'
                + esc(two.map(nameOf).join('</b> 또는 <b>')) + '</b></div>';
        }
    }
    b.insertAdjacentHTML('beforeend',
        '<div id="a214-clue-box" style="margin-top:10px; padding:10px 12px; border-radius:6px;'
        + ' background:rgba(212,175,55,0.07); border:1px solid #5a4a2a; font-size:11px;'
        + ' color:#e8d9a8; line-height:1.8;">'
        + '<div style="font-weight:bold; color:#d4af37; margin-bottom:5px;">[모아 둔 단서 '
        + c.length + '개]</div>'
        + c.map(function (x) { return '· ' + esc(x.hint); }).join('<br>')
        + narrow + '</div>');
}

// ── 합류 — 문지기와 세기 ──
(function hookRejoin() {
    const iv = setInterval(function () {
        if (typeof renderA214Rejoin !== 'function') return;
        if (renderA214Rejoin._a214p) { clearInterval(iv); return; }
        const _j = renderA214Rejoin;
        const w = function () {
            const out = _j.apply(this, arguments);
            try { roleTick('join'); } catch (e) { }
            return out;
        };
        w._a214p = true;
        renderA214Rejoin = w;
        window.renderA214Rejoin = w;
        clearInterval(iv);
    }, 400);
})();

// ── 시계 아래 칸 — 자리 · 단서 · 남은 사람 · 태우기 ──
(function hookBar() {
    const iv = setInterval(function () {
        if (typeof renderA214Bar !== 'function') return;
        if (renderA214Bar._a214p) { clearInterval(iv); return; }
        const _b = renderA214Bar;
        const w = function () {
            const out = _b.apply(this, arguments);
            try { extraBar(); } catch (e) { }
            return out;
        };
        w._a214p = true;
        renderA214Bar = w;
        window.renderA214Bar = w;
        clearInterval(iv);
        console.log('[A-214] 시계 칸 연결');
    }, 400);
})();

function deadList() {
    const s = st();
    const k = (s && s.kills) || {};
    return Object.keys(k).map(function (c) {
        return { code: c, name: (k[c] || {}).name || nameOf(c), at: (k[c] || {}).at || 0 };
    }).sort(function (a, b) { return a.at - b.at; });
}

function extraBar() {
    const el = document.getElementById('a214-bar');
    const s = st();
    if (!el || !s || !here()) return;

    const roster = rosterCodes();
    const gone = deadList();
    const live = Math.max(0, (s.roster && s.roster.length ? s.roster.length : roster.length) - gone.length);
    const bn = bonusMs();

    let h = '<div style="margin-top:7px; display:flex; gap:6px; flex-wrap:wrap; align-items:center;">';
    h += '<span style="font-size:10px; color:' + (gone.length ? '#ff6b6b' : '#888') + ';">'
       + '남은 사람 <b>' + live + '</b>' + (gone.length ? ' <span style="color:#888;">· 빠진 사람 '
       + esc(gone.map(function (x) { return x.name; }).join(', ')) + '</span>' : '') + '</span>';
    if (bn) {
        h += '<span style="font-size:10px; color:' + (bn > 0 ? '#4CAF50' : '#ff9800') + ';">'
           + '시계 ' + (bn > 0 ? '+' : '−') + Math.round(Math.abs(bn) / 1000) + '초</span>';
    }
    h += '</div>';

    const d = roleDef();
    if (d) {
        const done = Math.min(d.goal, (run() || {})._a214RoleDone || 0);
        h += '<div style="margin-top:7px; padding:8px 10px; border-radius:5px;'
           + ' background:rgba(47,111,159,0.12); border:1px solid #2f6f9f;">'
           + '<div style="font-size:10px; color:#7fb6dd; font-weight:bold; margin-bottom:4px;">'
           + d.icon + ' ' + d.name + ' — 숙제 ' + done + ' / ' + d.goal + '</div>'
           + '<div style="font-size:10px; color:#aaa; line-height:1.6;">' + d.task + '<br>'
           + '<span style="color:#8ab4cf;">' + d.good + '</span></div>';
        const c = clues();
        if (c.length) {
            h += '<div style="font-size:10px; color:#d4af37; margin-top:5px;">단서 ' + c.length + '개'
               + (c.length >= 2 ? ' — 지목에서 두 몫' : '') + '</div>';
        }
        h += '</div>';
    }

    if (amCult()) {
        const used = Number(s.burned) || 0;
        h += '<div style="margin-top:7px;">'
           + '<button class="game-btn" style="width:100%; margin:0; padding:8px; font-size:10px;'
           + ' border-color:#7f0000 !important; color:#ff8a65 !important;"'
           + (used >= BURN_CAP ? ' disabled' : '') + ' onclick="a214Burn()">'
           + '등불을 끈다 — 모두의 시계 ' + Math.round(BURN_MS / 1000) + '초 (' + (BURN_CAP - used)
           + '번 남음)</button></div>';
    }

    const old = document.getElementById('a214-plus-bar');
    const html = '<div id="a214-plus-bar">' + h + '</div>';
    if (old) { if (old.innerHTML !== h) old.outerHTML = html; }
    else el.insertAdjacentHTML('beforeend', html);
}

// ── 마지막 저지 — 과업 수가 실제로 들어간다 ──
//
//   원래는 done 을 글귀에만 썼다. 3/3 이든 0/3 이든 밀어내는 데
//   필요한 횟수가 24 로 똑같았다. 이제 과업 하나당 넷씩 깎인다
//   (3/3 이면 24 → 12). 화면에 적히는 숫자까지 같이 고친다.
let blockCut = 0;
(function hookBlock() {
    const iv = setInterval(function () {
        if (typeof a214TraitorBlock !== 'function') return;
        if (a214TraitorBlock._a214p) { clearInterval(iv); return; }
        const _t = a214TraitorBlock;
        const w = function () {
            const ms = ((st() || {}).missions) || [];
            const done = ms.filter(function (x) { return x.done >= x.goal; }).length;
            blockCut = done * 4;
            const r = run();
            if (r) r._a214Missions = done;
            try { return _t.apply(this, arguments); }
            finally { blockCut = 0; }
        };
        w._a214p = true;
        a214TraitorBlock = w;
        window.a214TraitorBlock = w;
        clearInterval(iv);
    }, 400);
})();

(function hookCombat() {
    const iv = setInterval(function () {
        if (typeof startCombat !== 'function') return;
        if (startCombat._a214p) { clearInterval(iv); return; }
        const _s = startCombat;
        const w = function (cfg) {
            if (blockCut && cfg && cfg.need) {
                cfg = Object.assign({}, cfg, { need: Math.max(8, cfg.need - blockCut) });
                cfg.text = cfg.text + '<br><br><span style="color:#d4af37; font-size:11px;">'
                    + '마친 과업이 손에 남아 있다. 밀어내는 것이 그만큼 수월하다.</span>';
            }
            return _s.call(this, cfg);
        };
        w._a214p = true;
        startCombat = w;
        window.startCombat = w;
        clearInterval(iv);
        console.log('[A-214] 저지 연결');
    }, 400);
})();

// ── 정산 — 과업과 자리의 몫 ──
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._a214p) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            let plan = null;
            try { plan = here() ? payout() : null; } catch (e) { }
            const before = (me() || {}).points || 0;
            const out = _r.apply(this, arguments);
            try { if (plan) pay(plan, before); } catch (e) { console.warn('[A-214]', e); }
            return out;
        };
        w._a214p = true;
        renderDarkResult = w;
        window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[A-214] 정산 연결');
    }, 400);
})();

function payout() {
    const s = st(), r = run(), u = me();
    if (!s || !r || !u) return null;
    const rows = [];
    let sum = 0;

    if (amCult()) {
        const ms = s.missions || [];
        const done = ms.filter(function (x) { return x.done >= x.goal; }).length;
        if (done >= 3) { rows.push(['과업 3 / 3 — 마쳤다', 8000]); sum += 8000; }
        else if (done > 0) { rows.push(['과업 ' + done + ' / 3', done * 2000]); sum += done * 2000; }
        else rows.push(['과업 0 / 3 — 아무것도 못 했다', 0]);
    } else {
        const d = roleDef();
        if (d) {
            const done = Math.min(d.goal, r._a214RoleDone || 0);
            if (done >= d.goal) { rows.push([d.icon + ' ' + d.name + ' — 숙제를 마쳤다', 4000]); sum += 4000; }
            else if (done > 0) {
                const v = Math.round(4000 * (done / d.goal) * 0.5);
                rows.push([d.icon + ' ' + d.name + ' — ' + done + ' / ' + d.goal, v]);
                sum += v;
            }
        }
        const c = clues().length;
        if (c) { rows.push(['단서 ' + c + '개', c * 700]); sum += c * 700; }
    }
    if (!rows.length) return null;
    return { rows: rows, sum: sum };
}

function pay(plan, before) {
    const u = me();
    if (!u || !plan) return;
    if (plan.sum > 0) {
        u.points = (u.points || 0) + plan.sum;
        try { if (typeof addHistoryLog === 'function')
            addHistoryLog(u, '[A-214] ' + (amCult() ? '과업' : '맡은 자리')
                + ' — +' + plan.sum.toLocaleString() + ' P'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    }
    const b = document.getElementById('dro-body')
        || (typeof darkBodyEl === 'function' ? darkBodyEl() : null);
    if (!b) return;
    const d = document.createElement('div');
    d.style.cssText = 'margin:0 0 12px 0; padding:10px 12px; border-radius:6px; font-size:11px;'
        + ' line-height:1.8; background:rgba(212,175,55,0.08); border:1px solid #5a4a2a; color:#e8d9a8;';
    d.innerHTML = '<div style="font-weight:bold; color:#d4af37; margin-bottom:5px;">[A-214 — '
        + (amCult() ? '신도' : '맡은 자리') + ']</div>'
        + plan.rows.map(function (x) {
            return esc(x[0]) + ' <b style="float:right; color:'
                + (x[1] > 0 ? '#ffd700' : '#888') + ';">'
                + (x[1] > 0 ? '+' + x[1].toLocaleString() + ' P' : '—') + '</b><br>';
        }).join('');
    b.insertBefore(d, b.firstChild);
}

// ==========================================
// 기믹 성공·실패를 시계에 반영한다 (기존 기믹까지 전부)
// ==========================================
//
//   기존 기믹 여덟 개는 제각각 darkRun.success++ / fail++ 만 한다.
//   한 자리씩 손대는 대신, 그 수가 움직이는 것을 보고 시계에 얹는다.
//   신도가 사람을 처리한 것도 성공으로 세어진다 — 그래야 칼이 시간을
//   벌어 주고, 등불을 끄는 것과 셈이 맞는다.
(function watchScore() {
    let sOk = null, sBad = null, lastKey = '';
    setInterval(function () {
        const r = run();
        // 방 기록이 한 호흡 비는 일이 있다. 그때마다 셈을 처음부터 다시
        // 잡으면 그 사이의 성공 한 번이 통째로 사라진다. 판이 바뀔 때만
        // 다시 잡는다.
        if (!here() || !r || !r.partyId) { sOk = sBad = null; lastKey = ''; return; }
        const key = r.partyId;
        if (lastKey !== key) { lastKey = key; sOk = r.success || 0; sBad = r.fail || 0; return; }
        const ok = r.success || 0, bad = r.fail || 0;
        if (sOk == null) { sOk = ok; sBad = bad; return; }
        if (ok > sOk) { addTime(BONUS_OK * (ok - sOk), '성공'); roleTick('gim', ok - sOk); }
        if (bad > sBad) addTime(BONUS_BAD * Math.min(2, bad - sBad), '실패');
        sOk = ok; sBad = bad;
    }, 1500);
})();

// ==========================================
// 확인
// ==========================================
window.a214Plan = function () {
    if (typeof A214_STEPS === 'undefined') { console.warn('걸음표가 없습니다.'); return; }
    const ks = Object.keys(A214_STEPS).map(Number).sort(function (a, b) { return a - b; });
    console.log('%c===== A-214 걸음표 (' + ks.length + '칸) =====', 'color:#d4af37; font-size:13px');
    ks.forEach(function (k) {
        const d = A214_STEPS[k];
        console.log('  ' + String(k).padStart(2, ' ') + '  ' + d.type + (d.n != null ? ' ' + d.n : '')
            + ((run() && run().step === k) ? '   ← 지금' : ''));
    });
};

window.a214PlusState = function () {
    console.log('%c===== A-214 — 더 깊게 =====', 'color:#d4af37; font-size:13px');
    if (!here()) { console.log('  지금 A-214 에 있지 않습니다.'); return; }
    const s = st() || {};
    console.log('  걸음표     :', Object.keys(A214_STEPS).length + '칸',
        (Array.isArray(s.plan) && s.plan.length) ? '(방에서 받음)' : '(아직 못 받음)');
    console.log('  내 자리    :', amCult() ? '◉ 신도'
        : (roleDef() ? roleDef().icon + ' ' + roleDef().name
            + ' — 숙제 ' + ((run() || {})._a214RoleDone || 0) + '/' + roleDef().goal : '아직 안 정해짐'));
    console.log('  시계 보너스:', Math.round(bonusMs() / 1000) + '초',
        '· 태운 횟수', (s.burned || 0) + '/' + BURN_CAP);
    console.log('  남은 흔적  :', traces().length + '개 · 내 단서', clues().length + '개');
    console.log('  빠진 사람  :', deadList().map(function (x) { return x.name; }).join(', ') || '없음');
    if (amCult()) {
        const ms = s.missions || [];
        console.log('  과업       :', ms.map(function (m) {
            return m.name + ' ' + m.done + '/' + m.goal;
        }).join(' · '));
    }
};

// 장면을 얹는다
(function addNarr() {
    const iv = setInterval(function () {
        if (typeof A214_NARR === 'undefined') return;
        Object.keys(MORE_NARR).forEach(function (k) {
            if (!A214_NARR[k]) A214_NARR[k] = MORE_NARR[k];
        });
        clearInterval(iv);
        console.log('[A-214] 장면 ' + Object.keys(A214_NARR).length + '개');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

console.log('[A-214] a214PlusState() · a214Plan()');

})();
