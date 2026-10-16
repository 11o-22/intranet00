// ==========================================
// ★ 말풍선 관리 — 광장 머리 위 말풍선의 빛깔을 고른다
// ==========================================
//
// ■ 무엇인가
//
//   광장에서 말하면 머리 위에 뜨는 말풍선(.plaza-say)은 여태 한 가지
//   빛깔(#f4efe2)뿐이었다. 네 가지를 더 두고 사원증 칸에서 고르게 한다.
//
//       아이보리   #fbf3f1      연노랑   #fffae4
//       하늘       #e6eff4      풀빛     #e9efe5
//
//   테두리는 넷 다 연필로 그은 듯한 잿빛 한 줄(#8c8c88)이고,
//   꼬리에도 같은 줄이 둘러진다.
//
//   빛깔 네 가지는 보여 주신 테마 그림에서 안쪽 색을 집어 와 썼다.
//   (테마에 얹혀 있던 그림 인물은 남의 것이라 가져오지 않았다.)
//
//   말풍선 위에는 **이 게임에 이미 있는 사내 이모티콘**을 하나씩 얹는다.
//   emo/e34·e42·e28·e30 에서 **글씨만 걷어 내고** 작게 줄인 것이다
//   (emo/bub-*.webp). 어느 것에서 떴는지는 아래 SB 의 em 에 적어 두었다.
//
//       아이보리 ← e34 처리하겠습니다   연노랑 ← e42 힘내요~
//       하늘     ← e28 배째여~         풀빛   ← e30 나만 믿어!
//
// ■ 누가 쓰나
//
//   단추는 **전 사원**에게 선다. 처음에는 「기본」 하나뿐이고, 나머지는
//   [ 💭 말풍선 선택권 ] 한 장으로 하나씩 얻는다 (얻은 것은 sbubOwn).
//   표는 상담사만 준다. 상담사는 표 없이 다 쓴다.
//
//   고른 빛깔은 자리 기록의 b 칸에 실려 **같은 방 사람 화면에도** 그대로
//   보인다 — 그 길은 열려 있으니, 상담사가 고른 말풍선은 남들 눈에도
//   그 빛깔로 뜬다.
//
// ■ 어디에 붙나
//
//   사원증 칸(#rec-badge)의 「🖼 테두리 관리」 **오른쪽**에 나란히 선다.
//   frames.js 가 혼자 한 줄을 다 쓰고 있어서, 그 단추를 줄 상자에
//   담고 둘로 나눈다.
//
// ■ 어디에 적히나
//
//   currentUser.sbub 한 칸. 광장에 나갈 때 자리 기록의 b 칸에 실려
//   같은 방 사람에게도 그대로 보인다 (plaza.js 의 sbMine·bubble).

(function speechBubbles() {

const ADMIN = 'kario0987';
// ★ 2026-10-16 (저녁) — **표를 가진 사람만** 으로 바꿨다.
//
//   단추(💬 말풍선 관리)는 전 사원에게 선다. 다만 처음에는 **「기본」 하나뿐**
//   이고, 나머지는 [ 💭 말풍선 선택권 ] 한 장으로 하나씩 얻는다.
//   표는 **상담사만** 준다 (통제 콘솔의 「물품 강제 꽂기」).
//
//   얻은 것은 currentUser.sbubOwn 에 쌓인다. 한 번 얻으면 그 뒤로는
//   표 없이 골랐다 풀었다 할 수 있다. 상담사는 표 없이 다 쓴다.
const TICKET = '[ 💭 말풍선 선택권 ]';

// 그림에서 안쪽 빛깔을 집어 와 그대로 쓴다.
//
//   ★ 말풍선 위에 **사내 이모티콘**을 하나씩 얹는다 (emo/ 에 이미 있는 것).
//     글씨만 걷어 내고 쓴다 — 어느 것에서 떴는지는 em 에 적어 둔다.
//     w 는 높이 TOP 일 때의 가로 (그림의 가로세로비 그대로).
const SB = [
    // 아이보리 ← e34 「처리하겠습니다」 분홍 토끼
    { id: 'ivory', n: '아이보리', bg: '#fbf3f1', fg: '#3a3433', em: 'e34', w: 25 },
    // 연노랑 ← e42 「힘내요~」 노랑 고양이
    { id: 'lemon', n: '연노랑',   bg: '#fffae4', fg: '#3c3a2c', em: 'e42', w: 32 },
    // 하늘 ← e28 「배째여~」 늘어진 하양
    { id: 'sky',   n: '하늘',     bg: '#e6eff4', fg: '#2c3338', em: 'e28', w: 39 },
    // 풀빛 ← e30 「나만 믿어!」 식칼 든 갈색머리
    { id: 'grass', n: '풀빛',     bg: '#e9efe5', fg: '#303630', em: 'e30', w: 30 },
];
// ==========================================
// ★ 그려 주신 말풍선 스물일곱 가지 (2026-10-16)
// ==========================================
//
//   보내 주신 그림 석 장에서 떠 왔다. 한 칸마다
//     · 막대 **속빛**(bg) 과 **테두리빛**(ln) 을 그림에서 집어 오고,
//     · 막대 윗선 **위쪽에 얹힌 그림**(머리·장식)만 오려 emo/sb/ 에 넣었다.
//
//   ✗ 막대 자체를 그림으로 쓰지 않았다. 말은 길이가 그때그때 달라서
//     말풍선이 늘었다 줄었다 해야 하는데, 그려진 막대를 늘리면 **기울기가
//     무너지고 글이 테두리를 넘는다.** 그래서 막대는 전처럼 CSS 로 그리고
//     (빛깔은 그림 것 그대로), 얹힌 그림만 올린다.
//     그림의 **살짝 기울어진 멋**은 그래서 못 살렸다.
//
//   한 가지에 조각이 여럿일 수 있다 (도깨비불+술, 안테나 둘+토끼, 여우 귀
//   양쪽+코). s 는 어느 쪽에 붙나(L 왼 · R 오른), o 는 그쪽 끝에서 몇 칸
//   떨어지나 — 그림에서 잰 값 그대로다. bh 는 그림 속 막대 높이로,
//   얹는 그림을 **그 막대에 견준 비율**로 줄일 때 쓴다.
//
//   ✗ 여우(03) 의 **아래로 늘어진 꼬리**는 못 넣었다. 말풍선 밑으로는
//     꼬리(세모)가 이미 나가 있어 자리가 겹친다.
const SB2 = [
    { id: 'b01', n: '01 하늘', bg: '#dce1ff', ln: '#2f3a82', fg: '#252b53', bh: 87,
      p: [{f:'b01-1.webp',w:72,h:83,s:'L',o:-14},{f:'b01-2.webp',w:70,h:34,s:'R',o:-3}] },
    { id: 'b02', n: '02 잿빛', bg: '#d2d2d2', ln: '#000000', fg: '#0b0b0b', bh: 104,
      p: [{f:'b02-1.webp',w:33,h:42,s:'C',o:300},{f:'b02-2.webp',w:52,h:38,s:'C',o:637},{f:'b02-3.webp',w:53,h:71,s:'R',o:2}] },
    { id: 'b03', n: '03 주황', bg: '#ffebd7', ln: '#2b1500', fg: '#23170b', bh: 88,
      p: [{f:'b03-1.webp',w:63,h:48,s:'L',o:-1},{f:'b03-2.webp',w:60,h:34,s:'C',o:501},{f:'b03-3.webp',w:61,h:41,s:'R',o:-2}] },
    { id: 'b04', n: '04 분홍', bg: '#ffe7e9', ln: '#f00012', fg: '#8f0b15', bh: 86,
      p: [{f:'b04-1.webp',w:164,h:136,s:'L',o:-27}] },
    { id: 'b05', n: '05 붉은', bg: '#c78d7c', ln: '#410f00', fg: '#2f130b', bh: 79,
      p: [{f:'b05-1.webp',w:153,h:121,s:'L',o:-43}] },
    { id: 'b06', n: '06 하늘', bg: '#f2faff', ln: '#2fa7ff', fg: '#3a3634', bh: 88,
      p: [{f:'b06-1.webp',w:182,h:92,s:'L',o:-27}] },
    { id: 'b07', n: '07 하늘', bg: '#e8ebf6', ln: '#303d6b', fg: '#262d46', bh: 88,
      p: [{f:'b07-1.webp',w:133,h:104,s:'L',o:-26}] },
    { id: 'b08', n: '08 붉은', bg: '#ffefef', ln: '#b12b2a', fg: '#6d2322', bh: 91,
      p: [{f:'b08-1.webp',w:139,h:113,s:'L',o:-31}] },
    { id: 'b09', n: '09 보라', bg: '#fff1fb', ln: '#ffd1f2', fg: '#3a3634', bh: 88,
      p: [{f:'b09-1.webp',w:125,h:118,s:'L',o:-14}] },
    { id: 'b10', n: '10 노랑', bg: '#ffffd8', ln: '#feff9a', fg: '#3a3634', bh: 91,
      p: [{f:'b10-1.webp',w:191,h:135,s:'L',o:-30}] },
    { id: 'b11', n: '11 주황', bg: '#fff2ec', ln: '#461d0c', fg: '#321b12', bh: 84,
      p: [{f:'b11-1.webp',w:153,h:127,s:'L',o:-15}] },
    { id: 'b12', n: '12 노랑', bg: '#fff1cc', ln: '#fdb700', fg: '#3a3634', bh: 81,
      p: [{f:'b12-1.webp',w:162,h:136,s:'L',o:-18}] },
    { id: 'b13', n: '13 잿빛', bg: '#ededed', ln: '#3f3f3f', fg: '#2e2e2e', bh: 86,
      p: [{f:'b13-1.webp',w:125,h:112,s:'L',o:-23}] },
    { id: 'b14', n: '14 잿빛', bg: '#f1f1f1', ln: '#838383', fg: '#3a3634', bh: 85,
      p: [{f:'b14-1.webp',w:133,h:110,s:'L',o:-25}] },
    { id: 'b15', n: '15 흰빛', bg: '#eaeaea', ln: '#dadada', fg: '#3a3634', bh: 84,
      p: [{f:'b15-1.webp',w:144,h:119,s:'L',o:-33}] },
    { id: 'b16', n: '16 흰빛', bg: '#eaeaea', ln: '#ffd3cd', fg: '#3a3634', bh: 87,
      p: [{f:'b16-1.webp',w:131,h:119,s:'L',o:-23}] },
    { id: 'b17', n: '17 하늘', bg: '#edf9ff', ln: '#4bacdf', fg: '#3a3634', bh: 90,
      p: [{f:'b17-1.webp',w:195,h:117,s:'L',o:-10}] },
    { id: 'b18', n: '18 주황', bg: '#fff4e9', ln: '#d96b00', fg: '#83460b', bh: 89,
      p: [{f:'b18-1.webp',w:150,h:115,s:'L',o:-36}] },
    { id: 'b19', n: '19 붉은', bg: '#e7dcda', ln: '#6d0000', fg: '#470b0b', bh: 92,
      p: [{f:'b19-1.webp',w:187,h:124,s:'L',o:-59}] },
    { id: 'b20', n: '20 남보라', bg: '#d2c4d6', ln: '#750e8f', fg: '#4c135a', bh: 91,
      p: [{f:'b20-1.webp',w:118,h:97,s:'L',o:-2}] },
    { id: 'b21', n: '21 풀빛', bg: '#e8ffed', ln: '#3abb56', fg: '#3a3634', bh: 91,
      p: [{f:'b21-1.webp',w:145,h:98,s:'L',o:-36}] },
    { id: 'b22', n: '22 주황', bg: '#fff4ea', ln: '#ffa14a', fg: '#3a3634', bh: 88,
      p: [{f:'b22-1.webp',w:180,h:78,s:'L',o:-14}] },
    { id: 'b23', n: '23 주황', bg: '#fff8ee', ln: '#ffb553', fg: '#3a3634', bh: 89,
      p: [{f:'b23-1.webp',w:173,h:117,s:'L',o:-46}] },
    { id: 'b24', n: '24 남보라', bg: '#e3e1ff', ln: '#24164f', fg: '#1f1737', bh: 83,
      p: [{f:'b24-1.webp',w:194,h:136,s:'L',o:-19}] },
    { id: 'b25', n: '25 남보라', bg: '#fbf2ff', ln: '#450069', fg: '#310b45', bh: 87,
      p: [{f:'b25-1.webp',w:149,h:132,s:'L',o:-9}] },
    { id: 'b26', n: '26 청록', bg: '#eefcff', ln: '#74e4ff', fg: '#3a3634', bh: 85,
      p: [{f:'b26-1.webp',w:154,h:140,s:'L',o:2}] },
    { id: 'b27', n: '27 하늘', bg: '#edf0ff', ln: '#6375c5', fg: '#424c78', bh: 89,
      p: [{f:'b27-1.webp',w:139,h:98,s:'L',o:-18}] },
];
const SBDIR = 'emo/sb/';
// 얹는 그림 크기 — 그림 속 막대 높이를 이만큼으로 친다 (px).
//   말풍선 한 줄 높이가 28px 쯤이라, 그보다 조금 작게 잡아야 머리가
//   사람보다 커 보이지 않는다.
const SB2_BAR = 24;

const LINE = '#8c8c88';         // 연필로 그은 듯한 테두리
const TAIL = 6;                 // 꼬리 크기 (px)
const TOP  = 31;                // 얹는 그림 높이 (px)
const DIP  = 9;                 // 말풍선 윗선에 걸치는 깊이 (px)

// ==========================================
// 모양
// ==========================================
//
//   ✗ border 로 테두리를 두르면 꼬리(:after)가 **테두리 안쪽**에서
//     시작한다 (가로세로 백분율이 안쪽 상자를 기준으로 잡힌다).
//     그러면 말풍선 밑줄이 꼬리를 가로질러 그어져 보인다.
//     그래서 테두리는 box-shadow 로 두르고, 꼬리는 세모 둘을 겹친다 —
//     큰 세모(:before)가 테두리, 그 위에 작은 세모(:after)가 속살.
(function css() {
    if (document.getElementById('sbub-css')) return;
    const L = [];
    SB.forEach(function (s) {
        const k = '.plaza-say.sb-' + s.id;
        L.push(k + '{background:' + s.bg + ';color:' + s.fg + ';'
                 + 'box-shadow:0 0 0 1.6px ' + LINE + ',0 2px 7px rgba(0,0,0,.45);'
                 + 'border-radius:11px;}');
        // 속살 세모 — 테두리 세모 위에 얹힌다
        L.push(k + ':after{margin-left:-' + TAIL + 'px;border-width:' + TAIL + 'px;'
                 + 'border-top-color:' + s.bg + ';}');
        // 위에 얹는 그림 — 말풍선 왼쪽 어깨에 걸터앉는다
        L.push(k + ' .sbi{width:' + s.w + 'px;'
                 + 'background-image:url(emo/bub-' + s.id + '.webp);}');
    });
    // ★ 그려 주신 스물일곱 가지
    SB2.forEach(function (s) {
        const k = '.plaza-say.sb-' + s.id;
        const z = SB2_BAR / s.bh;                 // 그림 → 화면 줄임비
        L.push(k + '{background:' + s.bg + ';color:' + s.fg + ';'
                 + 'box-shadow:0 0 0 1.6px ' + s.ln + ',0 2px 7px rgba(0,0,0,.45);'
                 + 'border-radius:4px;}');        // 그려진 막대는 모서리가 각지다
        L.push(k + ':after{margin-left:-' + TAIL + 'px;border-width:' + TAIL + 'px;'
                 + 'border-top-color:' + s.bg + ';}');
        L.push(k + ':before{border-top-color:' + s.ln + ';}');
        s.p.forEach(function (p, i) {
            const w = Math.round(p.w * z), h = Math.round(p.h * z);
            const o = (p.s === 'C') ? p.o : Math.round(p.o * z);
            // 왼쪽에 붙는 것은 left, 오른쪽에 붙는 것은 right 로 잡는다 —
            //   말풍선이 길어져도 **제 끝에 붙어 있어야** 그림이 안 어긋난다.
            // L·R 은 그 끝에서 몇 px, C 는 **가로 비율 자리**(천분율)다.
            //   끝에 붙은 것은 말풍선이 길어져도 제 끝을 붙들고, 가운데
            //   것(안테나·여우 코)은 늘어난 만큼 같이 벌어진다.
            const put = (p.s === 'L') ? 'left:' + o + 'px;right:auto;'
                      : (p.s === 'R') ? 'right:' + o + 'px;left:auto;'
                      : 'left:' + (p.o / 10) + '%;right:auto;transform:translateX(-50%);';
            L.push(k + ' .sbi.p' + (i + 1) + '{width:' + w + 'px;height:' + h + 'px;'
                     + put + 'bottom:calc(100% - 2px);'
                     + 'background-image:url(' + SBDIR + p.f + ');}');
        });
    });
    // 얹는 자리 — 네 가지가 똑같다
    L.push('.plaza-say .sbi{position:absolute;left:1px;bottom:calc(100% - ' + DIP + 'px);'
         + 'height:' + TOP + 'px;background-repeat:no-repeat;'
         + 'background-position:bottom center;background-size:contain;'
         + 'pointer-events:none;}');
    // 테두리 세모 — 네 빛깔이 똑같아 한 번만 적는다
    L.push('.plaza-say[class*="sb-"]:before{content:"";position:absolute;left:50%;top:100%;'
         + 'margin-left:-' + (TAIL + 2) + 'px;margin-top:-1px;'
         + 'border:' + (TAIL + 2) + 'px solid transparent;border-top-color:' + LINE + ';}');
    const st = document.createElement('style');
    st.id = 'sbub-css';
    st.textContent = L.join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 고른 것
// ==========================================
function sbAll() { return SB.concat(SB2); }
function sbById(id) { return sbAll().find(function (s) { return s.id === id; }) || null; }

// plaza.js 가 묻는다 — 이 말풍선은 얹는 그림이 몇 조각인가
window.sbParts = function (id) {
    const s = sbById(id);
    return (s && s.p) ? s.p.length : 1;
};

// ==========================================
// 가진 것
// ==========================================
function isAdm(u) { return !!(u && u.code === ADMIN); }
function ownList(u) {
    const a = u && u.sbubOwn;
    return Array.isArray(a) ? a : [];
}
// 이 사람이 **이 말풍선**을 쓸 수 있나 (상담사는 다 쓴다)
function sbHas(u, id) {
    if (!id) return true;                         // 기본은 누구나
    if (!sbById(id)) return false;
    if (isAdm(u)) return true;
    return ownList(u).indexOf(id) >= 0;
}
// 가진 표가 몇 장인가
function tickets(u) {
    return ((u && u.inventory) || []).filter(function (n) { return n === TICKET; }).length;
}

// plaza.js 가 이것을 부른다 — 없는 이름이면 빈 글자(전처럼)
//
// ★ 쓸 수 없는 사원이 **전에 골라 둔 것**은 안 쳐 준다.
//   하루쯤 전 사원에게 열어 두었던 적이 있어, 그때 고른 사람의 sbub 가
//   칸에 남아 있다. 단추를 닫기만 하면 그 사람은 **풀 수도 없이** 그
//   말풍선을 영영 쓰게 된다. 여기서 막으면 제 화면에서도, 남의 화면에서도
//   (자리 기록의 b 는 보내는 쪽이 적는다) 바로 보통 말풍선으로 돌아간다.
window.sbOf = function (u) {
    const id = u && u.sbub;
    if (!id || !sbById(id)) return '';
    return sbHas(u, id) ? id : '';            // 안 가진 것은 안 쳐 준다
};

// ★ 남이 고른 것도 **받는 쪽에서 한 번 더 본다.**
//   자리 기록의 b 칸은 **보내는 사람이 적는다.** 보내는 쪽에서 이미
//   걸렀지만(sbOf), 칸을 손으로 적어 보내면 남들 화면에 뜰 수 있다.
//   그래서 plaza.js 가 남의 말풍선을 띄우기 전에 이것을 묻는다 —
//   그 사번이 상담사가 아니면 빛깔을 안 입힌다.
//   그 사번이 **그 말풍선을 가졌는지** 사원 칸을 보고 가린다.
window.sbAllowedCode = function (code, id) {
    const c = String(code || '');
    if (c === ADMIN) return true;
    if (!id) return true;                                  // 기본은 누구나
    let u = null;
    try { u = (typeof db !== 'undefined' && db.users) ? db.users[c] : null; } catch (e) { }
    if (!u) return false;                                  // 모르는 사람이면 안 입힌다
    return sbHas(u, id);
};

// ★ 남아 있는 칸도 치운다 — 들어올 때 한 번.
//   화면에서는 위에서 이미 막았고, 이것은 **적힌 값**을 지우는 일이다.
//   ★ 한 번만 보고 그만두면 안 된다 — 사원 칸은 **나중에 서버에서 한 번 더
//     내려온다.** 그때 sbub 가 되살아나므로, 들어온 뒤 한동안 거듭 본다.
(function sweepMine() {
    let left = 15;                                   // 2초마다 열다섯 번 (30초)
    const iv = setInterval(function () {
        if (--left < 0) { clearInterval(iv); return; }
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (!currentUser.sbub) return;
        if (sbHas(currentUser, currentUser.sbub)) return;   // 가진 것은 둔다
        currentUser.sbub = null;
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
        console.log('[말풍선] 안 가진 말풍선이라 풀었습니다.');
    }, 2000);
})();

// ★ 한 번에 거두기 — 상담사 전용 (들어오기를 기다리지 않는다)
window.sbubClearAll = function () {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) { console.warn('서버에 닿지 못했습니다.'); return; }
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {}, who = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!u.sbub) return;
            if (sbHas(u, u.sbub)) return;             // 가진 사람 것은 둔다
            up['users/' + c + '/sbub'] = null;
            who.push((u.name || c) + ' (' + u.sbub + ')');
        });
        if (!who.length) { console.log('거둘 것이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ ' + who.length + '명에게서 거뒀습니다: ' + who.join(', '), 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

function sbSet(id) {
    if (!currentUser) return;
    // ★ 안 가진 것은 못 고른다 — 콘솔에서 불러도 안 먹힌다
    if (id && !sbHas(currentUser, id)) {
        console.warn('가지고 있지 않은 말풍선입니다. ' + TICKET + ' 으로 먼저 얻으십시오.');
        return;
    }
    if (id && !sbById(id)) return;
    currentUser.sbub = id || null;
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    openBubblePanel();
}
window.sbSet = sbSet;

// ★ 표 한 장을 내고 하나 얻는다
//
//   ✗ 「쓴다」와 한 단추로 묶지 않았다. 표가 사라지는 일이라 **묻고 나서**
//     거둔다. 얻고 나면 그 뒤로는 표 없이 골랐다 풀었다 할 수 있다.
function sbBuy(id) {
    const u = currentUser;
    if (!u || !id || !sbById(id)) return;
    if (sbHas(u, id)) { sbSet(id); return; }                 // 이미 가졌다
    if (tickets(u) < 1) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(TICKET + ' 이 없습니다.\n\n상담사에게 받아야 얻을 수 있습니다.');
        }
        return;
    }
    const s = sbById(id);
    const go = function () {
        const i = (u.inventory || []).indexOf(TICKET);
        if (i < 0) return;                                   // 그 사이에 없어졌다
        u.inventory.splice(i, 1);
        if (!Array.isArray(u.sbubOwn)) u.sbubOwn = [];
        if (u.sbubOwn.indexOf(id) < 0) u.sbubOwn.push(id);
        u.sbub = id;                                         // 얻자마자 달아 준다
        if (typeof addHistoryLog === 'function') {
            try { addHistoryLog(u, '[말풍선] ' + s.n + ' 을(를) 얻었습니다.'); } catch (e) { }
        }
        if (typeof saveFields === 'function') {
            try { saveFields({ inventory: 1, sbubOwn: 1, sbub: 1, history: 1 }); } catch (e) { }
        } else if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
        try { updateUI(); } catch (e) { }
        openBubblePanel();
    };
    if (!confirm(TICKET + ' 한 장으로 「' + s.n + '」 말풍선을 얻습니다.\n'
        + '가진 표 ' + tickets(u) + '장. 쓰면 돌려받지 못합니다.\n\n얻을까요?')) return;
    go();
}
window.sbBuy = sbBuy;

// ==========================================
// 관리 화면
// ==========================================
//
//   고르기 전에 **그대로 생긴 것**을 보여 준다. 광장과 같은 갈래 이름을
//   쓰되, 광장 칸이 아니라서 자리 잡는 값만 따로 준다.
function sample(s, on) {
    const cls = s ? ' sb-' + s.id : '';
    const bg = s ? s.bg : '#f4efe2';
    // 조각이 여럿인 것은 그만큼 얹는다 (광장과 같은 모양으로 보여 준다)
    const ii = s ? Array.from({ length: (s.p ? s.p.length : 1) },
        function (_, i) { return '<i class="sbi p' + (i + 1) + '"></i>'; }).join('') : '';
    return `<div style="position:relative; height:70px;">
        <div class="plaza-say${cls}" style="position:absolute; left:50%; top:30px; bottom:auto;
             transform:translateX(-50%); margin:0; width:max-content;
             ${s ? '' : 'background:' + bg + ';color:#1a1a1a;'}">
            ${on ? '지금 이걸 쓰는 중' : '안녕하세요'}${ii}
        </div>
    </div>`;
}

function openBubblePanel() {
    const u = currentUser || {};
    const cur = u.sbub || '';
    const tk = tickets(u);
    const row = function (s) {
        const id = s ? s.id : '';
        const on = (cur === id);
        const got = sbHas(u, id);
        // 단추 — 쓰는 중 / 이걸로 쓴다 / 표를 내고 얻는다
        const btn = on
            ? `<button class="game-btn" style="width:100%; margin:4px 0 0 0; padding:7px; font-size:11px;"
                    disabled>고른 것</button>`
            : got
            ? `<button class="game-btn" style="width:100%; margin:4px 0 0 0; padding:7px; font-size:11px;"
                    onclick="sbSet('${id}')">이걸로 쓴다</button>`
            : `<button class="game-btn" style="width:100%; margin:4px 0 0 0; padding:7px; font-size:11px;
                    ${tk ? 'background:linear-gradient(145deg,#4c6a93,#2c4a73) !important; border-color:#6c8ab3 !important;'
                         : 'opacity:.55;'}"
                    onclick="sbBuy('${id}')">${tk ? '선택권 1장으로 얻는다' : '선택권이 있어야 얻습니다'}</button>`;
        return `<div style="border:1px solid ${on ? '#8a6cb3' : (got ? '#3a3a3a' : '#2a2a2a')}; border-radius:6px;
                     padding:9px 11px; margin-bottom:7px; background:${on ? 'rgba(106,76,147,.18)' : 'transparent'};
                     ${got ? '' : 'opacity:.82;'}">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:12px; color:#fff; font-weight:bold;">${s ? s.n : '기본'}</span>
                <span style="font-size:10px; color:${on ? '#c9a8ff' : (got ? '#666' : '#7d7568')};">
                    ${on ? '쓰는 중' : (got ? '' : '아직 안 가짐')}</span>
            </div>
            ${sample(s, on)}
            ${btn}
        </div>`;
    };
    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">
            광장에서 말할 때 머리 위에 뜨는 말풍선입니다.<br>
            고른 빛깔은 <b style="color:#c9a8ff;">같은 방 사람에게도</b> 그대로 보입니다.<br>
            「기본」 말고는 <b style="color:#c9a8ff;">${TICKET}</b> 한 장으로 하나씩 얻습니다.
            <span style="color:#7d7568;">(상담사에게 받습니다)</span><br>
            지금 가진 선택권 <b style="color:${tk ? '#4CAF50' : '#7d7568'};">${tk}장</b>
        </div>
        <div style="max-height:52vh; overflow-y:auto; padding-right:4px;">
            ${[null].concat(sbAll()).map(row).join('')}
        </div>`;
    openGearModal('말풍선', html);
}
window.openBubblePanel = openBubblePanel;

// ==========================================
// 사원증 칸에 단추 — 「테두리 관리」 오른쪽
// ==========================================
(function addBtn() {
    function put() {
        if (!currentUser) return;
        // 단추는 **전 사원**에게 선다 — 안에서 가진 것만 고를 수 있다
        if (document.getElementById('bub-open-btn')) return;
        const fb = document.getElementById('frame-open-btn');
        if (!fb) return;

        // 테두리 단추가 한 줄을 다 쓰고 있다 — 줄 상자에 담아 둘로 나눈다
        let row = document.getElementById('frame-bub-row');
        if (!row) {
            row = document.createElement('div');
            row.id = 'frame-bub-row';
            row.style.cssText = 'display:flex; gap:6px; margin-top:8px;';
            fb.parentElement.insertBefore(row, fb);
            row.appendChild(fb);
            fb.style.width = 'auto';
            fb.style.flex = '1';
            fb.style.marginTop = '0';
        }
        const b = document.createElement('button');
        b.id = 'bub-open-btn';
        b.className = 'game-btn';
        b.style.cssText = 'flex:1; margin:0; padding:10px;'
            + ' background:linear-gradient(145deg,#4c6a93,#2c4a73) !important;'
            + ' border-color:#6c8ab3 !important; color:#fff !important;';
        b.textContent = '💬 말풍선 관리';
        b.onclick = openBubblePanel;
        row.appendChild(b);
    }
    put();
    [700, 1600, 3000, 5000].forEach(function (t) { setTimeout(put, t); });
    // 사원증 칸을 다시 그릴 때마다 단추가 날아간다 — 그때 또 단다
    ['updateUI', 'renderBadgePhoto'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(put, 60);
            return r;
        };
    });
})();

// ==========================================
// [ 💭 말풍선 선택권 ] — 상담사 지급 전용
// ==========================================
//
//   통제 콘솔의 「물품 강제 꽂기」로 준다. 어디에도 안 깔리고 안 팔린다.
//   소지품에서 **쓰는 물건이 아니다** (usable:false) — 말풍선 관리 창에서
//   하나를 고를 때 거둬 간다. 그래야 「썼는데 아무 일도 안 일어났다」가
//   없다.
(function regTicket() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[TICKET] = {
            price: 0, usable: false, noSell: true,
            desc: '광장 말풍선 하나를 얻는다. 사원증 칸의 「💬 말풍선 관리」 에서 쓴다. '
                + '한 장에 하나이며, 한 번 얻은 말풍선은 그 뒤로 마음대로 골라 쓴다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(TICKET) < 0) {
            NO_SELL_ITEMS.push(TICKET);
        }
        console.log('[말풍선] ' + TICKET + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 우주 쇼핑몰 후보에 들어가도 계속 빼 둔다 (개명권과 같은 수)
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    const i = ALIEN_ITEMS_POOL.indexOf(TICKET);
    if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
}, 5000);

// 장터(팝니다·구합니다)에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._sbub) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(TICKET); } catch (e) { }
            return pool;
        };
        marketSellable._sbub = true;
        clearInterval(iv);
    }, 400);
})();

// ★ 콘솔 — 상담사가 손으로 한 장 준다
window.sbubTicket = function (who, n) {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) ? db.users : {};
    const code = Object.keys(book).filter(function (c) {
        const x = book[c] || {};
        return c === who || String(x.no) === String(who) || x.name === who;
    })[0];
    if (!code) { console.warn('사원을 못 찾았습니다.'); return; }
    const cnt = Math.max(1, Number(n) || 1);
    const u = book[code];
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < cnt; i++) u.inventory.push(TICKET);
    u._adminStamp = Date.now();
    if (typeof database !== 'undefined' && database) {
        database.ref('users/' + code + '/inventory').set(u.inventory);
    }
    console.log('%c✓ ' + (u.name || code) + ' 사원에게 ' + TICKET + ' ' + cnt + '장', 'color:#4CAF50');
};

console.log('[말풍선] ' + (SB.length + SB2.length) + '종 — 기본은 누구나, 나머지는 ' + TICKET);

})();
