// ==========================================
// ★ 👗 사택 옷장 — 마네킹 앞에서 옆으로 눌러 고른다
// bundles.json 마지막 묶음, save-merge.js 앞
// ==========================================
//
// ■ 그림이 어떻게 생겼나
//
//   dot/ 안의 장들은 모두 **2112 x 768 픽셀** 한 장이고, 한 칸이
//   **352 x 384 픽셀**로 6칸 x 2줄이다. 도트 한 칸은 4픽셀이다.
//   몸은 칸 **한가운데**에 선다 (x 126~225, 가운데 175.5 = 칸 가운데).
//
//   ★ 전에는 칸이 208 x 256 이었다. 그 칸은 머리 위가 4도트뿐이라
//     갓이 칸 맨 윗줄에 닿아 잘렸고, 드레스처럼 자락이 긴 옷은 아예
//     안 들어갔다. 그래서 그린 이가 준 새 규격(72 x 96 도트)으로
//     서른다섯 장을 통째로 옮겼다 — 칸마다 (48, 100) 픽셀씩 밀어
//     넣기만 했고 **그림은 한 점도 안 고쳤다.** 겹치는 자리도 그대로다.
//
//         여백(도트)   위  4 → 29 · 아래 1 → 8 · 왼 12 → 31 · 오 15 → 31
//
//   ★ 받은 규격은 칸이 288 인데 **352 로 넓혀** 깐다. 드레스 자락이
//     가장 긴 칸에서 312 픽셀을 써서, 288 로는 자락 끝 24픽셀(6도트)이
//     잘리고 그 몫이 다음 칸 왼쪽에 조각으로 묻어 보였다. 칸마다 30픽셀씩
//     밀어 넣어 넓혔으므로 **몸과 옷이 겹치는 자리는 하나도 안 달라진다.**
//     새 그림을 288 칸으로 주셔도 그대로 받아 이 폭으로 옮기면 된다.
//
//       윗줄   걷기 여섯 칸 (광장에서 쓴다)
//       아랫줄 서기 여섯 칸 (옷장 마네킹에서 쓴다)
//
//   받은 그림은 한 칸이 144 였는데 코트 자락이 칸 밖으로 여덟 도트 삐져나가
//   **다음 칸에 남의 자락이 묻어 보였다.** 그래서 전부 208 로 다시 깔았다.
//   그림은 한 점도 안 고치고 칸 안에서 똑같이 여섯 도트씩 밀기만 했으므로,
//   겹쳐도 그대로 맞물린다. (한 장은 216x128 도트 1:1 로 와서 네 배로 키웠다)
//
// ■ 겹치는 차례 — 이 순서가 아니면 모양이 틀어진다
//
//       몸 → 하의 → 신발 → 상의 → 겉옷 → 망토 → 머리 → 악세
//
//   ★ 악세(고양이 귀)만은 **머리 위**다. 머리 아래에 깔면 귀가 머리카락에
//     가려져 아예 안 보인다. 그래서 칸에 over 가 아니라 top 을 적으면
//     머리보다 뒤에(위에) 붙는다.
//
//   ★ 「구두 → 정장 → 망토」는 눈대중이 아니라 재서 찾은 차례다.
//     여섯 가지 차례를 다 겹쳐 보고 주신 「다 입은 모양」과 견주었더니
//     이 차례만 **한 도트도 안 틀렸다**. (다른 차례는 688~689 도트가 어긋난다)
//
// ■ 몸판은 셋뿐이다
//
//       body.png        보통 몸
//       body-brown.png  브라운 전용 몸  ← h-brown 과 반드시 짝 (겉모양은 보통 몸과 같다)
//       coat.png        옛 코트 (몸까지 한 장에 그려진 것 — 지금은 안 쓴다)
//       none.png        아무것도 없는 몸 (속이 다 비친다)
//
//   ★ 머리 한 장에 **한 벌이 통째로** 그려진 것이 있다 ([브라운 특전] —
//     상자 머리에 갈색 양복까지 한 그림이다). 그런 것은
//
//         body: 'none'   몸판을 비워 두고 (맨몸이 비어져 나오지 않게)
//         solo: true     옷을 안 겹친다 (잠옷이 기본이라 그냥 두면 삐져나온다)
//
//     로 적는다. 그러면 그 한 장만 그려지고, 서 있을 때의 잔동작도
//     머리 층이 그대로 돌려 준다. 두 장으로 겹쳐 그리면 멈춘 칸이 뒤에
//     남아 유령처럼 비친다 — 그래서 한 장으로만 그린다.
//
//   ★ h05 와 h09 는 같은 얼굴(백사헌)인데 **안대가 반대쪽**이다. 뒤집은
//     그림이 아니라(머리와 얼굴 자국은 같은 방향, 겉모양 96% 겹침) 안대와
//     눈 자리만 옮겨 그린 **좌우 한 쌍**이다.
//
//         h05  왼쪽으로 갈 때   ← 옷장 마네킹도 왼쪽을 보므로 이것을 쓴다
//         h09  오른쪽으로 갈 때
//
//     그래서 오른쪽을 볼 때 h05 를 그냥 뒤집으면 안 된다 — 안대가 반대 눈으로
//     간다. FACE_PAIR 에 적어 두고, 짝이 있는 머리는 **그림만 짝으로 바꾼다.**
//     뒤집기는 남들과 똑같이 몸과 함께 한 번만 한다 — h09 가 그 뒤집기를
//     염두에 두고 그려진 짝이라, 뒤집고 나면 안대가 제 눈에 돌아온다.
//
//   ★ 이름 옆 번호는 **주신 차례**다. 파일 이름(h01…)과는 어긋나 있는데,
//     파일 이름은 저장된 값이라 그대로 두고 보이는 차례만 맞춘 것이다.
//
//   브라운은 몸이 따로 있다. 머리를 브라운으로 고르면 몸도 같이 바뀐다.
//   ★ 몸 겉모양이 보통 몸과 **100% 같아서** 옷은 그대로 다 맞는다 —
//     그래서 브라운도 남들처럼 갈아입는다. 전용 몸은 머리 목록의
//     body 칸에 적어 둔다 (DOT_HEADS 의 h-brown).
//   어느 쪽으로 어긋나게 적혀 있어도 look() 이 **보이는 모습을 늘
//   말이 되게** 맞춰 준다.
//
// ■ 칸(슬롯)마다 따로 고른다
//
//       악세  없음 · 고양이                      ← 머리 **위**에 얹는다
//                                                  상담사와 사번 9013·8634·8449 만
//       상의  없음 · 잠옷 상의
//       하의  없음 · 잠옷 하의
//       겉옷  없음 · 정장                        ← 상담사만
//       구두  없음 · 구두                        ← 상담사만
//       망토  없음 · 망토                        ← 상담사만
//
//   상·하의는 따로 입고 벗는다. 겉옷·구두·망토 줄은 상담사 옷장에만 보이고,
//   악세는 상담사와 적어 둔 사번에게만 보인다 (nos).
//   옷을 더 그려 주시면 아래 DOT_SLOTS 에 한 줄씩 보태면 된다.
//   def 가 붙은 것이 「아직 한 번도 안 골랐을 때」 입고 있는 것이다.
//
// ■ 움직임 — 한 숫자로 같이 돌리면 안 된다
//
//     머리  여섯 칸이 눈 깜빡임이다 (0=1=5 뜸 · 2=4 반 · 3 감음).
//           오래 뜨고 잠깐 감게 칸마다 머무는 시간을 달리 둔다.
//     몸    서기 여섯 칸이 전부 같은 그림이라 0 에 세워 둔다.
//     옷    서기 줄에서 **짝수 칸(0·2·4)만** 알맹이가 있다. 홀수 칸은
//           비어 있어서 같이 돌리면 옷이 깜빡 사라진다. 그래서 flap 이
//           붙은 장만 0·2·4 를 돈다. 나머지(상의·하의·구두)는 서 있을 때
//           움직이지 않으므로 0 에 세워 둔다.
//
//   ★ 걷기 줄의 **5·6번째 칸은 3·2번째와 같다** — 그린 이의 규칙이다.
//     상의·하의는 실제로 픽셀 하나 안 틀리고 같았다. 정장·망토·구두는
//     그 두 칸이 비어 온 것을 이 규칙대로 채워 넣었다. 채운 뒤 몸 위에
//     겹쳐 옛 코트 장과 견주니 칸마다 80픽셀(5도트)밖에 안 달랐다.
//
// ■ 밖에서 쓰는 것 (광장이 이걸 그대로 쓴다)
//
//       dotLook(u)              고른 것을 풀어 준다 {head, body, layers[], tops[]}
//       dotSprite(u, 설정)      그 모습이 든 칸을 만들어 준다
//         설정 = { pose:'stand'|'walk', scale:1, live:true }
//       dotStop(칸)             움직임을 멈춘다 (칸을 지우기 전에)
//       dotActor(u, 설정)       걷다 멈췄다 하는 사람
//                               (사택 광장 시범이 쓰던 것. 시범은 걷었지만
//                                나중에 광장을 다시 할 때 그대로 쓴다)
//
// ■ 콘솔
//       closetState()   지금 고른 것
//       closetAll()     있는 머리·옷을 전부 늘어놓고 본다

const DOT = {
    DIR: 'dot/',
    W: 352, H: 384,
    SHEET_W: 2112, SHEET_H: 768,
    // ★ 칸 **아래끝에서 발바닥까지** 비어 있는 몫.
    //   옛 칸(256)은 1도트밖에 안 비어서 「칸 아래끝 = 발」로 놓아도
    //   맞았는데, 새 칸(384)은 8도트가 빈다. 그대로 두면 사람이
    //   땅에서 32px 떠 보인다. 광장과 옷장 둘 다 이만큼 내려 놓는다.
    FOOT: 32,
    BODY: 'body', BROWN_BODY: 'body-brown', BROWN_HEAD: 'h-brown',
    ADMIN: 'kario0987',
    BLINK: [1900, 110, 110, 110, 110, 110],   // 머리 칸마다 머무는 시간
    FLAP: 300,                                 // 옷자락 나부끼는 빠르기
    WALK: 120,                                 // 걷는 빠르기 (광장에서 쓴다)
    // 겹치는 차례 — 앞에 있는 것이 아래로 간다
    Z: ['pj-bottom', 'shoes', 'han-shoes', 'pj-top', 'han-inner',
        'dress', 'suit', 'robe', 'han-duru', 'cape'],
    // ★ 좌우로 따로 그린 머리 — 오른쪽을 볼 때는 짝 쪽 그림을 쓴다.
    //   그냥 뒤집으면 안대가 반대 눈으로 가 버리기 때문이다.
    FACE_PAIR: { h05: 'h09' },
    // 서 있을 때 나부끼는 장 — 서 있기 줄의 0·2·4 칸을 돌아가며 쓴다
    FLAPS: ['suit', 'cape'],
    // ★ 칸 수가 다른 장은 여기에 **쓸 칸을 적어** 둔다.
    //   장옷은 서 있기 줄에 두 칸만 그려져 있어 0·2·4 로 돌리면
    //   빈 칸에서 옷이 사라졌다 — 그래서 0·1 로 돈다.
    FLAP_COLS: { robe: [0, 1] },
};

// 머리 — 이름은 제가 보고 붙인 것입니다. 파일명이 제 쪽으로 안 와서,
//        올리신 차례대로 번호를 매겨 두었습니다. 여기만 고치면 됩니다.
const DOT_HEADS = [
    { i: 'h01', n: 'J3' },               //  1
    { i: 'h02', n: '이자헌' },            //  2
    { i: 'h03', n: '류재관' },            //  3
    { i: 'h04', n: '고영은' },            //  4
    { i: 'h06', n: '최요원' },            //  5
    { i: 'h07', n: '포도' },              //  6   김솔음과 같은 얼굴에 안경
    { i: 'h08', n: '청달래' },            //  7
    { i: 'h05', n: '백사헌' },            //  8   왼쪽용. 오른쪽용 짝은 h09 (FACE_PAIR)
    { i: 'h10', n: '호유원' },            //  9
    { i: 'h11', n: '진나솔' },            // 10
    { i: 'h12', n: '김솔음' },            // 11
    { i: 'h13', n: '김솔음 (여)' },       // 12
    { i: 'h14', n: '포도 (여)' },         // 13   김솔음(여)와 같은 얼굴에 안경
    { i: 'h15', n: '은하제' },            // 14
    { i: 'h16', n: 'B조 조장' },          // 15
    { i: 'h17', n: '이성해' },            // 16
    { i: 'h18', n: '곽제강' },            // 17
    { i: 'h-brown', n: '브라운', body: 'body-brown' },  // 18 — 전용 몸과 짝 (옷은 그대로 입는다)
    // 19 — 한 벌이 통째로 그려진 것. 몸판은 비우고 옷은 안 겹친다.
    { i: 'h-brown-tv', n: '[브라운 특전]', body: 'none', solo: true }
];

// 칸(슬롯)마다 고를 수 있는 것. admin 이 붙은 것은 상담사 옷장에만 보인다.
const DOT_SLOTS = [
    {
        k: 'top', n: '상의', items: [
            { i: '', n: '없음', over: [] },
            { i: 'pj', n: '잠옷 상의', over: ['pj-top'], def: true }
        ]
    },
    {
        k: 'bottom', n: '하의', items: [
            { i: '', n: '없음', over: [] },
            { i: 'pj', n: '잠옷 하의', over: ['pj-bottom'], def: true }
        ]
    },
    {
        k: 'outer', n: '겉옷', items: [
            { i: '', n: '없음', over: [] },
            { i: 'suit', n: '정장', over: ['suit'], admin: true },
            // 서 있을 때 두 칸(0·1)으로 나부낀다 — FLAP_COLS 참고
            { i: 'robe', n: '장옷', over: ['robe'], admin: true },
            { i: 'han', n: '내의', over: ['han-inner'], admin: true },
            { i: 'dress', n: '드레스', over: ['dress'], admin: true }
        ]
    },
    {
        k: 'shoes', n: '구두', items: [
            { i: '', n: '없음', over: [] },
            { i: 'shoes', n: '구두', over: ['shoes'], admin: true },
            { i: 'han', n: '신', over: ['han-shoes'], admin: true }
        ]
    },
    {
        k: 'cape', n: '망토', items: [
            { i: '', n: '없음', over: [] },
            { i: 'cape', n: '망토', over: ['cape'], admin: true },
            { i: 'duru', n: '두루마기', over: ['han-duru'], admin: true }
        ]
    },
    {
        // ★ 악세는 **머리 위**에 얹는다 (over 가 아니라 top).
        //   고양이 귀가 머리카락에 가려지면 안 되기 때문이다.
        k: 'acc', n: '악세', items: [
            { i: '', n: '없음', top: [] },
            { i: 'cat', n: '고양이', top: ['cat'], nos: ['9013', '8634', '8449'] },
            // ★ 베일은 일부러 **덜 비치게** 그려 주셨다 (알파 163).
            //   그림을 그대로 쓴다 — 코드에서 투명도를 건드리지 않는다.
            { i: 'veil', n: '베일', top: ['veil'], admin: true }
            // 갓은 뺐다. 그림(dot/han-gat.png)은 그대로 두었으니, 다시 넣으려면
            //   { i: 'gat', n: '갓', top: ['han-gat'], admin: true }
            // 한 줄만 되살리면 된다.
        ]
    }
];

(function closet() {

const D = DOT;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function isAdm(user) {
    const u = user || u_();
    return !!(u && u.code === D.ADMIN);
}
// ★ 누구 옷장에 보이나
//
//   admin: true        상담사만
//   nos: ['9013',…]    상담사 + 적어 둔 **사번**(u.no)만
//   아무것도 없으면     모두
//
//   사번은 u.code(계정 열쇠)가 아니라 u.no 다. 앞에 0 이 붙는 사번이
//   있으므로 글자로 견주고, 네 자리로 채워서도 한 번 더 본다.
function noOf(u) { return (u && u.no != null) ? String(u.no).trim() : ''; }
function hasNo(it, u) {
    const n = noOf(u); if (!n) return false;
    const p = n.length < 4 ? ('0000' + n).slice(-4) : n;
    return it.nos.some(function (x) { return x === n || x === p; });
}
function allowed(it, user) {
    if (it.admin) return isAdm(user);
    if (it.nos) return isAdm(user) || hasNo(it, user);
    return true;
}
// 이 사람 옷장에 보이는 것만 추린다
function items(slot, user) {
    return slot.items.filter(function (it) { return allowed(it, user); });
}
function slotOf(k) { return DOT_SLOTS.filter(function (s) { return s.k === k; })[0]; }

// 서 있을 때 나부끼는 장 — 장마다 **쓸 칸이 다를 수 있다**
//
//   정장·망토는 서 있기 줄에 0·2·4 세 칸이 그려져 있다. 장옷은 두 칸뿐이라
//   0·2·4 로 돌리면 2·4 에서 옷이 사라졌다. 그래서 장마다 제 칸 목록을 들고
//   따로 돈다 (칸 수가 달라 한 시계로는 못 돌린다).
function standCols(sheet) {
    if (D.FLAP_COLS && D.FLAP_COLS[sheet]) return D.FLAP_COLS[sheet];
    if (D.FLAPS.indexOf(sheet) >= 0) return [0, 2, 4];
    return null;
}
function flapsOf(els, sheets) {
    const out = [];
    els.forEach(function (e, i) {
        const c = standCols(sheets[i]);
        if (c && c.length > 1) out.push({ el: e, cols: c, g: 0 });
    });
    return out;
}
function wrap(n, len) { return ((n % len) + len) % len; }
function headIdx(id) { const k = DOT_HEADS.findIndex(function (h) { return h.i === id; }); return k < 0 ? 0 : k; }

// ==========================================
// 고른 것을 풀어 준다
// ==========================================
function look(user, override) {
    const u = user || u_() || {};
    const d = override || u.dot || {};
    const head = DOT_HEADS.some(function (h) { return h.i === d.head; }) ? d.head : DOT_HEADS[0].i;
    // ★ 머리가 전용 몸을 들고 있으면 그것을 쓴다 (브라운).
    //   몸 겉모양이 보통 몸과 100% 같으므로 옷은 그대로 다 맞는다.
    const hd = DOT_HEADS[headIdx(head)];
    const bodySheet = hd.body || D.BODY;
    const over = [], tops = [], pick = {};
    DOT_SLOTS.forEach(function (s) {
        const list = items(s, u);
        let it;
        if (Object.prototype.hasOwnProperty.call(d, s.k)) {
            // 한 번이라도 고른 적이 있으면 그 뜻을 지킨다 (「없음」도 고른 것이다)
            it = list.filter(function (x) { return x.i === (d[s.k] || ''); })[0];
        } else {
            // 아직 안 골랐으면 기본으로 입혀 둔다
            it = list.filter(function (x) { return x.def; })[0];
        }
        if (!it) it = list.filter(function (x) { return x.def; })[0] || list[0];
        pick[s.k] = it.i;
        (it.over || []).forEach(function (o) { over.push(o); });
        (it.top || []).forEach(function (o) { tops.push(o); });
    });
    over.sort(function (a, b) { return D.Z.indexOf(a) - D.Z.indexOf(b); });
    // 한 벌로 그려진 머리는 옷을 안 겹친다 — 고른 것은 그대로 두되 안 그린다
    if (hd.solo) over.length = 0;
    return { head: head, body: bodySheet, layers: over, tops: tops, pick: pick };
}
window.dotLook = look;
// 칸 크기를 밖에서도 쓴다 (광장이 베껴 적지 않게)
window.dotSpec = function () { return { W: D.W, H: D.H, FOOT: D.FOOT }; };

// ==========================================
// 모습이 든 칸을 만든다
// ==========================================
function layer(sheet, k) {
    const el = document.createElement('div');
    el.className = 'dot-layer';
    el.dataset.sheet = sheet;
    el.style.backgroundImage = 'url("' + D.DIR + sheet + '.png")';
    el.style.backgroundSize = (D.SHEET_W * k) + 'px ' + (D.SHEET_H * k) + 'px';
    return el;
}

function sprite(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const pose = o.pose === 'walk' ? 'walk' : 'stand';
    const L = look(user, o.dot);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const sheets = [L.body].concat(L.layers).concat([L.head]).concat(L.tops || []);
    const headAt = 1 + L.layers.length;                 // 머리가 몇 번째 층인가
    const els = sheets.map(function (s) { const e = layer(s, k); box.appendChild(e); return e; });

    const row = (pose === 'walk') ? 0 : 1;
    const put = function (el, col) {
        el.style.backgroundPosition = '-' + (col * D.W * k) + 'px -' + (row * D.H * k) + 'px';
    };
    els.forEach(function (e) { put(e, 0); });

    box._dot = { els: els, sheets: sheets, timers: [] };
    if (o.live === false) return box;

    if (pose === 'walk') {
        // 걷기 — 여섯 칸을 다 같이 돈다
        let f = 0;
        box._dot.timers.push(setInterval(function () {
            f = (f + 1) % 6;
            els.forEach(function (e) { put(e, f); });
        }, D.WALK));
    } else {
        // 서기 — 몸·신발은 세워 두고, 옷자락은 제 칸을 돌고, 머리는 깜빡인다
        flapsOf(els, sheets).forEach(function (f) {
            box._dot.timers.push(setInterval(function () {
                f.g = (f.g + 1) % f.cols.length;
                put(f.el, f.cols[f.g]);
            }, D.FLAP));
        });
        const head = els[headAt];
        let f = 0;
        const blink = function () {
            put(head, f);
            const ms = D.BLINK[f];
            f = (f + 1) % 6;
            box._dot.timers.push(setTimeout(blink, ms));
        };
        blink();
    }
    return box;
}
window.dotSprite = sprite;

// ==========================================
// 돌아다니는 사람 — 걷다 멈췄다 하는 손잡이
// ==========================================
//
//   옷장 마네킹은 가만히 서 있기만 하면 되지만, 돌아다니는 사람은
//   걷다 멈췄다 하고 좌우를 바꾼다. 그래서 「서기/걷기」를 밖에서
//   켜고 끌 수 있는 것을 따로 둔다.
//
//   ★ 지금은 아무도 안 쓴다. 사택 광장 시범(plaza.js)이 쓰던 것인데
//     시범을 걷으면서 이것만 남겼다. 광장을 다시 할 때 그대로 쓰면 된다.
//
//       const a = dotActor(user, { scale: 0.75 });
//       a.el                 칸 (화면에 붙인다)
//       a.moving(true)       걷는 모습으로
//       a.face(-1)           오른쪽을 보게 (그림은 왼쪽을 보고 그려져 있다)
//       a.stop()             움직임을 멈춘다 (칸을 지우기 전에)
function actor(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const L = look(user, o.dot);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const sheets = [L.body].concat(L.layers).concat([L.head]).concat(L.tops || []);
    const els = sheets.map(function (s) { const e = layer(s, k); box.appendChild(e); return e; });
    const head = els[1 + L.layers.length];              // 악세가 머리 뒤에 더 붙는다
    const flaps = flapsOf(els, sheets);

    let walking = false, dir = 1, timers = [];
    const put = function (el, col, row) {
        el.style.backgroundPosition = '-' + (col * D.W * k) + 'px -' + (row * D.H * k) + 'px';
    };
    const clear = function () { timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); timers = []; };

    const start = function () {
        clear();
        if (walking) {
            let f = 0;
            els.forEach(function (e) { put(e, 0, 0); });
            timers.push(setInterval(function () {
                f = (f + 1) % 6;
                els.forEach(function (e) { put(e, f, 0); });
            }, D.WALK));
        } else {
            els.forEach(function (e) { put(e, 0, 1); });
            flaps.forEach(function (f) {
                timers.push(setInterval(function () {
                    f.g = (f.g + 1) % f.cols.length;
                    put(f.el, f.cols[f.g], 1);
                }, D.FLAP));
            });
            let f = 0;
            const blink = function () {
                put(head, f, 1);
                const ms = D.BLINK[f];
                f = (f + 1) % 6;
                timers.push(setTimeout(blink, ms));
            };
            blink();
        }
    };
    start();

    return {
        el: box,
        moving: function (on) { on = !!on; if (on === walking) return; walking = on; start(); },
        // 그림은 **왼쪽을 보고** 그려져 있다. 오른쪽을 보게 하려면 뒤집는다.
        //
        // ★ 머리 가운데에는 **좌우를 따로 그려 둔 것**이 있다 (백사헌 — 안대).
        //   h09 는 h05 에서 **눈과 안대만 반대쪽으로 옮겨 그린 것**이다
        //   (한 칸에 864 도트만 다르다 · 나머지는 똑같다). 통째로 뒤집는 것을
        //   **염두에 두고 그린 짝**이라, 오른쪽을 볼 때 h09 로 바꾼 뒤 몸과
        //   같이 뒤집으면 머리는 남들처럼 오른쪽으로 돌고 안대는 제 눈에
        //   그대로 남는다.
        //
        //   ✗ 전에는 머리 층만 한 번 더 뒤집어 바깥 뒤집기를 되돌렸다. 그러면
        //     **머리가 안 돌고** 안대만 반대 눈으로 건너가서, 오른쪽으로 걸어도
        //     얼굴이 왼쪽을 본 채였다. 재어 보면 초록 눈이 h05 는 머리 왼쪽
        //     28%, 「뒤집은 h09」 는 43% — 같은 쪽이다. 되돌리면 57% 로 건너간다.
        face: function (d) {
            if (d === dir) return;
            dir = d;
            box.style.transform = (d < 0 ? 'scaleX(-1)' : '');
            const pair = D.FACE_PAIR[L.head];
            if (!pair) return;
            head.style.backgroundImage = 'url("' + D.DIR + (d < 0 ? pair : L.head) + '.png")';
        },
        facing: function () { return dir; },
        stop: clear
    };
}
window.dotActor = actor;

function stop(box) {
    if (!box || !box._dot) return;
    box._dot.timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    box._dot.timers = [];
}
window.dotStop = stop;

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('closet-css')) return;
    const s = document.createElement('style');
    s.id = 'closet-css';
    s.textContent = [
        '.dot-box{position:relative;margin:0 auto;}',
        '.dot-layer{position:absolute;inset:0;background-repeat:no-repeat;',
        '  image-rendering:pixelated;image-rendering:crisp-edges;}',
        '#closet-stage{position:relative;padding:14px 0 0 0;text-align:center;',
        '  background:linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.12));',
        '  border:1px solid var(--theme-border,#4a5160);border-radius:8px;overflow:hidden;}',
        // ★ 칸이 384 로 커져 위아래에 빈 자리가 생겼다. 위는 걷어 내고,
        //   아래는 발바닥(FOOT)만큼 당겨 그림자가 발에 붙게 한다.
        '#closet-stage .dot-box{margin-top:-64px;margin-bottom:-26px;}',
        '#closet-floor{height:16px;margin-top:-8px;',
        '  background:radial-gradient(ellipse at 50% 0,rgba(0,0,0,0.55),rgba(0,0,0,0) 70%);}',
        '.closet-row{display:flex;align-items:center;gap:8px;margin-top:10px;}',
        '.closet-row .lab{width:38px;font-size:10px;color:#9a948a;text-align:left;flex:none;}',
        '.closet-row .mid{flex:1;text-align:center;font-size:12px;color:var(--theme-text,#e8e4da);',
        '  background:rgba(0,0,0,0.25);border:1px solid var(--theme-border,#4a5160);',
        '  border-radius:5px;padding:9px 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.closet-row .mid .num{font-size:9px;color:#8d8578;margin-left:6px;}',
        '.closet-arrow{flex:none;width:44px;padding:10px 0;font-size:14px;}',
        '.closet-arrow:disabled{opacity:0.3;}',
        '#closet-note{font-size:10px;color:#8d8578;margin-top:9px;line-height:1.6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 옷장 화면
// ==========================================
let pick = null;
let stage = null;
let saveT = null;

function cur() {
    const u = u_();
    if (!pick) {
        const L = look(u);
        pick = { head: L.head };
        DOT_SLOTS.forEach(function (s) { pick[s.k] = L.pick[s.k] || ''; });
    }
    return pick;
}

function paint() {
    const host = document.getElementById('closet-stage');
    if (!host) return;
    if (stage) { stop(stage); stage.remove(); stage = null; }
    const u = u_(), p = cur();
    stage = sprite(u, { pose: 'stand', scale: 1, dot: p });
    host.insertBefore(stage, host.firstChild);

    const hi = headIdx(p.head), h = DOT_HEADS[hi];
    const set = function (id, text, n, of) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = text + '<span class="num">' + n + ' / ' + of + '</span>';
    };
    set('closet-head-name', h.n, hi + 1, DOT_HEADS.length);

    DOT_SLOTS.forEach(function (s) {
        const list = items(s, u);
        let k = list.findIndex(function (x) { return x.i === p[s.k]; });
        if (k < 0) k = 0;
        set('closet-' + s.k + '-name', list[k].n, k + 1, list.length);
        ['l', 'r'].forEach(function (d) {
            const b = document.getElementById('closet-' + s.k + '-' + d);
            if (b) b.disabled = (list.length < 2);
        });
    });

    const note = document.getElementById('closet-note');
    if (note) {
        note.innerText = isAdm(u) ? '고르는 대로 저장됩니다.'
            : '고르는 대로 저장됩니다. 지금은 잠옷 한 벌뿐입니다.';
    }
}

function step(what, d) {
    const u = u_(), p = cur();
    if (what === 'head') {
        p.head = DOT_HEADS[wrap(headIdx(p.head) + d, DOT_HEADS.length)].i;
    } else {
        const s = slotOf(what); if (!s) return;
        const list = items(s, u); if (list.length < 2) return;
        let k = list.findIndex(function (x) { return x.i === p[what]; });
        if (k < 0) k = 0;
        p[what] = list[wrap(k + d, list.length)].i;
    }
    paint();
    clearTimeout(saveT);
    saveT = setTimeout(function () {
        const me = u_(); if (!me) return;
        const out = { head: p.head };
        DOT_SLOTS.forEach(function (s) { out[s.k] = p[s.k] || ''; });
        me.dot = out;
        save({ dot: 1 });
    }, 600);
}
window.closetStep = step;

function rowHtml(k, n) {
    return '<div class="closet-row" id="closet-row-' + k + '">'
        + '  <span class="lab">' + n + '</span>'
        + '  <button class="game-btn closet-arrow" id="closet-' + k + '-l" onclick="closetStep(\'' + k + '\',-1)">◀</button>'
        + '  <span class="mid" id="closet-' + k + '-name"></span>'
        + '  <button class="game-btn closet-arrow" id="closet-' + k + '-r" onclick="closetStep(\'' + k + '\',1)">▶</button>'
        + '</div>';
}

function render() {
    const body = document.getElementById('house-closet-body');
    if (!body) return;
    const u = u_(); if (!u) return;
    pick = null;
    let rows = '<div class="closet-row">'
        + '  <span class="lab">머리</span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',-1)">◀</button>'
        + '  <span class="mid" id="closet-head-name"></span>'
        + '  <button class="game-btn closet-arrow" onclick="closetStep(\'head\',1)">▶</button>'
        + '</div>';
    DOT_SLOTS.forEach(function (s) {
        if (items(s, u).length < 2) return;   // 고를 것이 하나뿐이면 줄을 안 만든다
        rows += rowHtml(s.k, s.n);
    });
    body.innerHTML =
        '<div class="panel-title">[사택 옷장]</div>'
        + '<div id="closet-stage"><div id="closet-floor"></div></div>'
        + rows + '<div id="closet-note"></div>';
    paint();
}
window.renderCloset = render;

setInterval(function () {
    const p = document.getElementById('house-closet');
    if (stage && p && !p.classList.contains('active')) { stop(stage); stage.remove(); stage = null; }
}, 2000);

// ==========================================
// 사택에 탭을 단다 — titles.js 가 정보 열람에 붙이는 것과 같은 길
// ==========================================
(function mountTab() {
    const iv = setInterval(function () {
        if (document.querySelector('#house-closet')) { clearInterval(iv); return; }
        const host = document.getElementById('tab-house');
        const grid = host && host.querySelector('.sub-tabs-grid');
        if (!grid) return;

        const btn = document.createElement('button');
        btn.className = 'sub-tab';
        btn.innerText = '옷장';
        btn.setAttribute('onclick', "switchHousePanel('house-closet', this); renderCloset();");
        grid.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'house-closet';
        panel.className = 'sub-panel';
        panel.innerHTML = '<div id="house-closet-body"></div>';
        host.appendChild(panel);

        clearInterval(iv);
        console.log('[옷장] 사택에 탭 연결');
    }, 700);
})();

// ==========================================
// 콘솔
// ==========================================
window.closetState = function () {
    const u = u_(); if (!u) { console.log('로그인 먼저'); return; }
    const L = look(u);
    console.log('%c===== 사택 옷장 =====', 'color:#e8c27a; font-size:13px');
    console.log('  적힌 것   :', JSON.stringify(u.dot || {}));
    console.log('  보이는 것 : 몸', L.body, '· 겹침', L.layers.join(' → ') || '없음', '· 머리', L.head);
    console.log('  상담사인가:', isAdm(u) ? 'O' : '✗', '· 사번', noOf(u) || '(없음)');
    DOT_SLOTS.forEach(function (s) {
        console.log('  ' + s.n + ' :', items(s, u).map(function (x) { return x.n; }).join(' · '));
    });
};

window.closetAll = function () {
    const u = u_();
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:9999999;background:#0d0d0d;overflow:auto;padding:14px;';
    box.onclick = function () { box.querySelectorAll('.dot-box').forEach(stop); box.remove(); };
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
    DOT_HEADS.forEach(function (h, k) {
        const c = document.createElement('div');
        c.style.cssText = 'text-align:center;';
        c.appendChild(sprite(u, { pose: 'stand', scale: 0.5, dot: { head: h.i, wear: 'uniform' } }));
        const t = document.createElement('div');
        t.style.cssText = 'font-size:9px;color:#9a948a;';
        t.innerText = (k + 1) + '. ' + h.n;
        c.appendChild(t);
        grid.appendChild(c);
    });
    box.appendChild(grid);
    document.body.appendChild(box);
    console.log('아무 데나 누르면 닫힙니다.');
};

console.log('[옷장] 머리 ' + DOT_HEADS.length + '종 · 칸 ' + DOT_SLOTS.length
    + '개 — closetState() · closetAll()');

})();
