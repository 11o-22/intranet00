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
//   ★ 악세만 **세 개까지 겹쳐 단다** (칸에 max:3). 옷장에서는 「악세 1·2·3」
//     세 줄로, 광장 가방에서는 눌러서 달고 다시 눌러 벗는 식이다.
//     적힐 때는 쉼표로 이은 한 줄 — 'cat,veil,gat'.
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
// ■ 코디 (2026-10-23) — 옷장 마네킹 아래 「코디」 줄. 지금 모습(머리 · 옷 · 악세 · 색)을 다섯 칸까지 적어 두고
//   눌러 입는다. u.dotSets 에 적힌다 (아래 「코디」 칸 참고).
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
    //   ★ 사운드 코트의 그림자(sound-coat-in)는 **맨 앞** — 몸 바로 위 · 모든 옷 뒤 (2026-10-23)
    //   ★ 상의 칸으로 옮긴 셋(룩키마트 의상 · 가을 니트 · 체육복)은 잠옷 상의 바로 뒤 — 겉옷이 그 위에 덮인다 (2026-10-23)
    //   ★ 섹시빤츄(악세 · 2026-10-23)는 맨 앞 — 몸 바로 위 · 모든 옷 밑 (옷을 입으면 가려진다)
    //   ★ LP 판(악세 · 2026-10-23)도 맨 앞 — 발밑에 깔리고 날아다니는 조각은 옷 뒤로 지나간다 (몸 자리는 그림에서 비워 두었다)
    //   ★ 뉴비 세트 (2026-10-25) — 장화는 신발 줄 끝 · 의상은 겉옷 줄(사운드 의상 다음) · 병아리 후드 그림자(newbie-hood-in)는
    //     늑대 잠옷 그림자 다음 (머리카락 뒤 · 옷 위). 후드 바깥(newbie-hood)은 머리 위(top).
    Z: ['sound-lp', 'sexy-pantsu', 'sound-coat-in', 'pj-bottom', 'shoes', 'shoes-black', 'han-shoes', 'maker-shoes', 'sound-shoes', 'newbie-boots', 'pj-top', 'band-outfit', 'knit', 'gym-suit', 'han-inner',
        'dress', 'tuxedo', 'suit', 'black-suit', 'dream-suit', 'brown-suit', 'agent1', 'agent2', 'maker-outfit', 'sound-outfit', 'newbie-outfit',
        'dress-yellow', 'dress-green', 'maid', 'maid-long',
        'robe', 'han-duru', 'cape', 'sound-coat', 'maker-outer-in', 'wolf-pj-in', 'newbie-hood-in', 'glove', 'bungeo'],
    // ★ 몸보다 **뒤**에 까는 장 (2026-10-25 · 잎 우산) — 몸 · 옷 · 머리 · 악세 모두가 이 위에 그려진다.
    //   적힌 차례대로 아래부터 — 물 웅덩이(무조건 신발 밑) → 줄기(무조건 등 뒤).
    //   칸(item)에 back: [...] 으로 적는다. 토끼(bare)에게는 안 깐다 (악세와 같다) — RAB_OK 에 적힌 것만 깐다.
    //   ✗ 처음엔 잎을 뒤 · 줄기를 앞에 두었다 — 정반대였다 (같은 날 바로잡음).
    BACK_Z: ['leaf-puddle', 'leaf-stem'],
    // ★ **맨 앞**에 두는 장 — 악세를 몇 개 달아도 이것들이 제일 위다. 적힌 차례대로 — 잎(무조건 앞) → 빗물(잎 위).
    FRONT: ['leaf-umb', 'leaf-rain'],
    // ★ 토끼(bare)에게도 얹는 장 — 잎 우산은 내리는 비와 우산만 (발밑 웅덩이는 뺀다 · 2026-10-25)
    //   자리는 사람 것 그대로다 — 토끼 머리 위로 잎이 조금 높이 뜨고 줄기가 손 옆에서 땅까지 닿아,
    //   큰 잎을 받쳐 든 모양이 된다 (16도트 내려 보았더니 줄기 끝이 발밑으로 빠져 그대로 두었다).
    RAB_OK: ['leaf-stem', 'leaf-umb', 'leaf-rain'],
    // 이름표 높이를 잴 때 빼는 장 — 칸 맨 위까지 떨어지는 빗물 · 발밑 웅덩이 (plaza.js tagPlace)
    NO_TAG: ['leaf-rain', 'leaf-puddle'],
    // ★ 좌우로 따로 그린 머리 — 오른쪽을 볼 때는 짝 쪽 그림을 쓴다.
    //   그냥 뒤집으면 안대가 반대 눈으로 가 버리기 때문이다.
    //   h05 ↔ h09   백사헌 — 안대가 반대쪽
    //   rab-friend ↔ rab-friend-r   친구 리본 — 서 있을 때 뜨는 글씨가 반대쪽
    //     (걷는 줄은 글씨가 없어 두 장이 똑같다 — 서 있는 줄만 다르다)
    FACE_PAIR: { h05: 'h09', 'rab-friend': 'rab-friend-r' },
    // 서 있을 때 나부끼는 장 — 서 있기 줄의 0·2·4 칸을 돌아가며 쓴다
    FLAPS: ['suit', 'cape'],
    // ★ 칸 수가 다른 장은 여기에 **쓸 칸을 적어** 둔다.
    //   장옷은 서 있기 줄에 두 칸만 그려져 있어 0·2·4 로 돌리면
    //   빈 칸에서 옷이 사라졌다 — 그래서 0·1 로 돈다.
    //   ★ 친구 리본은 **서 있을 때가 본 모습**이다 — 서기 줄 여섯 칸에
    //     반짝임과 「친구!」가 차례로 그려져 있다. 여섯 칸을 다 돈다.
    //     (가만히 있으면 0번 칸만 보여 리본만 덩그러니 있었다)
    //   ★ 유리 펜도 서기 줄 여섯 칸이 다 다른 그림이다 (펜이 손 옆에서 떠 논다).
    //   ★ 제작자 겉옷(바깥 · 안쪽)은 서기 줄 여섯 칸에 꼬리가 흔들린다 — 두 장이 같이 돈다.
    //   ★ 뉴비 새싹은 서기 줄 두 칸(하트가 바뀐다).
    FLAP_COLS: { robe: [0, 1], 'rab-friend': [0, 1, 2, 3, 4, 5], 'glass-pen': [0, 1, 2, 3, 4, 5],
                 'maker-outer': [0, 1, 2, 3, 4, 5], 'maker-outer-in': [0, 1, 2, 3, 4, 5], 'newbie-sprout': [0, 1],
                 'wolf-pj': [0, 1, 2, 3, 4, 5], 'wolf-pj-in': [0, 1, 2, 3, 4, 5],
                 // ★ 사운드 코트 — 서기 줄 두 칸에 자락이 흔들린다 (그림자도 같이 돈다 · 두 칸이 같은 그림이라 티는 안 난다)
                 //   사운드 레빗 헤드셋 — 서기 줄 여섯 칸에 귀가 흔들린다 (2026-10-23)
                 'sound-coat': [0, 1], 'sound-coat-in': [0, 1], 'sound-headset': [0, 1, 2, 3, 4, 5],
                 // LP 판 — 서기 줄 여섯 칸에 판이 돈다 (2026-10-23)
                 'sound-lp': [0, 1, 2, 3, 4, 5],
                 // 의상 뽑기 다섯 벌 (2026-10-23) — 서기 줄이 칸마다 다르게 그려진 셋은 여섯 칸을 돈다
                 'dress-green': [0, 1, 2, 3, 4, 5], 'maid-long': [0, 1, 2, 3, 4, 5], 'band-outfit': [0, 1, 2, 3, 4, 5],
                 // 잎 우산 (2026-10-25) — 서 있으면 빗물이 떨어지고 웅덩이가 번진다 (잎 · 줄기는 서기 여섯 칸이 같은 그림이라 0 에 세운다)
                 'leaf-rain': [0, 1, 2, 3, 4, 5], 'leaf-puddle': [0, 1, 2, 3, 4, 5] },
    // ★ 가만히 서 있으면 나오는 동작 — 사번 0000 · 8449 두 사람만 (2026-10-17)
    //
    //   주신 그림(sit-swing.png)은 **한 벌이 통째로** 그려진 열두 칸이다 —
    //   호유원 머리(h10)에 검은 정장. 윗줄은 그네로 가서 앉는 여섯 칸,
    //   아랫줄은 앉아서 흔들거리는 여섯 칸이다.
    //   그래서 그 모습(머리 h10 + 검은 정장)일 때만 튼다 — 다른 옷·머리인데
    //   틀면 앉는 순간 다른 사람으로 바뀐다.
    //
    //   after  이만큼 가만히 서 있으면 시작한다
    //   sit    윗줄(앉기) 한 칸에 머무는 시간 — 한 번만 지나간다
    //   loop   아랫줄(앉아 있기) 한 칸에 머무는 시간 — 계속 돈다
    //   움직이면 바로 원래 모습으로 돌아온다.
    //
    // ★ 대기모션 2 — 드레스 (2026-10-19). 같은 두 사람 · 같은 얼굴(h10) · 겉옷이 드레스일 때.
    //   주신 그림은 여섯 장으로 나뉘어 있다 (아래부터 몸 · 드레스 · 그네 · 면사포 · 손 · 반짝이).
    //   칸 288 → 352 로 넓히며 가로 +30 (다른 옛 규격 그림과 같다 · 얼굴이 h10 서기와 딱 겹친다).
    //   물들이기 — 드레스 장은 **입은 드레스 색**을 그대로 따른다.
    //              그네 · 면사포는 대기 동작 몫으로 따로 물들인다 (옷장 · 팔레트에 「대기 동작」 알로 뜬다).
    //              면사포는 따로 안 물들였으면 쓰고 있는 면사포 악세 색을 따른다.
    //   sheets 의 줄마다 [장, 색 열쇠…] — 색 열쇠를 앞에서부터 보고 처음 적힌 색을 쓴다.
    IDLES: [
        { id: 'swing', sheets: [['sit-swing']], head: 'h10', outer: 'ksuit', nos: ['0000', '8449'],
          after: 10000, sit: 170, loop: 300 },
        { id: 'swing-dress', head: 'h10', outer: 'dress', nos: ['0000', '8449'],
          sheets: [['idle2-body'], ['idle2-dress', 'dress'], ['idle2-swing', 'idle2-swing'],
                   ['idle2-veil', 'idle2-veil', 'veil'], ['idle2-hand'], ['idle2-fx']],
          dye: [{ sheet: 'idle2-swing', name: '그네' }, { sheet: 'idle2-veil', name: '면사포' }],
          after: 10000, sit: 170, loop: 300 }
    ],
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
    // ★ 브라운 셋(브라운 · 브라운 특전 · 토끼)은 **어둠 소속만** 고른다.
    { i: 'h-brown', n: '브라운', body: 'body-brown', dark: true },  // 18 — 전용 몸과 짝 (옷은 그대로 입는다)
    // 19 — 한 벌이 통째로 그려진 것. 몸판은 비우고 옷은 안 겹친다.
    { i: 'h-brown-tv', n: '[브라운 특전]', body: 'none', solo: true, dark: true },
    // 20 — 토끼. 브라운 특전과 같은 특수체형이다 (몸판 없음 · 옷 안 겹침).
    //
    //   주신 그림은 1728x768 — 칸이 **288** 이었다 (지난 규격). 지금 칸은
    //   352 라 가로로 22 밀어 넣었다.
    //
    //   ★ 22 인 까닭. 도트 눈금이 **어긋나 있었다** — 사람 그림은 가로로
    //     색이 x ≡ 2 (mod 4) 에서 바뀌는데, 받은 토끼는 x ≡ 0 이었다.
    //     그래서 4의 배수로 밀면 안 되고 **2를 더한 만큼** 밀어야 눈금이
    //     맞는다 (22 또는 26). 22 로 두니 토끼 왼끝이 사람 몸 왼끝(126)과
    //     같아졌다. 가운데는 173.5 — 칸 가운데(176)와 머리들 가운뎃값
    //     (171.5) 사이다.
    //   세로는 안 건드렸다. 받은 그림의 발바닥이 이미 351 로, 사람 발바닥과
    //   같았다 (걷기 세 번째 칸만 355 까지 내려간다 — 뛰는 그림이라 그대로 둔다).
    //   bare — 악세도 안 얹는다. 머리가 한참 아래라 갓이 허공에 뜬다 (look 참고).
    { i: 'h-rabbit', n: '[토끼]', body: 'none', solo: true, bare: true, dark: true }
];

// 칸(슬롯)마다 고를 수 있는 것. admin 이 붙은 것은 상담사 옷장에만 보인다.
const DOT_SLOTS = [
    {
        k: 'top', n: '상의', items: [
            { i: '', n: '없음', over: [] },
            { i: 'pj', n: '잠옷 상의', over: ['pj-top'], def: true },
            // ★ 겉옷 칸에서 옮겨 왔다 (2026-10-23) — 윗옷만 그려진 셋. 겉옷에 적혀 있던 묵은 기록은 moveOld 가 상의로 읽는다.
            //   그림 사연은 겉옷 칸에 적힌 줄 그대로 (룩키마트 의상 = 의상 뽑기 다섯 벌 · 가을 니트 · 체육복 = 통짜에서 몸을 뺀 것)
            { i: 'band', n: '룩키마트 의상', over: ['band-outfit'], own: 'band-outfit' },
            { i: 'knit', n: '가을 니트', over: ['knit'], own: 'knit' },
            { i: 'gym', n: '체육복', over: ['gym-suit'], own: 'gym-suit' }
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
            // ★ 노란 정장은 **상담사 전용**이다 — 뽑기에 안 넣는다
            { i: 'suit', n: '정장', over: ['suit'], admin: true },
            // ★ 검은 정장 — 사번 0000 · 8449 두 사람만 (2026-10-17).
            //   주신 그림은 1728x768 (칸 288 — 지난 규격)이라 칸마다 가로로 30 밀어
            //   352 칸에 넣었다. 그러면 몸통 왼끝이 몸판(126)과 같아지고 도트
            //   눈금(x ≡ 2 mod 4)도 맞는다. 세로는 발바닥이 이미 352 라 그대로다.
            { i: 'ksuit', n: '검은 정장', over: ['black-suit'], nos: ['0000', '8449'] },
            // ★ 백일몽 정장 — 주신 그림은 머리·손·발까지 그려진 **통짜**였다.
            //   그대로 겹치면 민머리가 얼굴을 덮으므로, 몸 그림과 **자리·색이
            //   똑같은 칸을 빼서** 옷만 남겼다 (7만 5천 칸이 몸과 같았다).
            //   자리는 요원복과 같은 가로 +102 · 세로 +100 — 옮기고 나니 테두리가
            //   몸(126~225 · 116~351)과 딱 맞았다.
            { i: 'dsuit', n: '백일몽 정장', over: ['dream-suit'], own: 'dream-suit' },
            // 브라운 정장 — 요원복과 같은 ¼ 규격(216x128)으로 주셔서 같은 길로 넣었다
            { i: 'bsuit', n: '브라운 정장', over: ['brown-suit'], own: 'brown-suit' },
            // 서 있을 때 두 칸(0·1)으로 나부낀다 — FLAP_COLS 참고
            { i: 'robe', n: '검은 장포', over: ['robe'], own: 'robe' },
            { i: 'han', n: '내의', over: ['han-inner'], own: 'han-inner' },
            { i: 'dress', n: '드레스', over: ['dress'], own: 'dress' },
            { i: 'tuxedo', n: '턱시도', over: ['tuxedo'], own: 'tuxedo' },
            // ★ 요원복 — 한 벌이 통째로 그려져 있다 (웃옷·바지·신까지).
            //
            //   주신 그림은 216x128 (칸 36x64) 로, 쓰던 악세 규격(144x256)의
            //   **네 배 작은** 것이었다. 네 배로 늘려(도트 한 칸이 그대로 4픽셀)
            //   **신발 밑바닥을 몸 발바닥에 맞춰** 옮겼다 — 가로 +102 · 세로 +100.
            //     맨 아랫줄 x 146~213 (몸 발바닥과 같다) · 밑바닥 y 351 (몸과 같다)
            //
            //   ✗ 악세와 같은 +104·+106 으로 놓았더니 어긋났다. 악세는 칸 자리를
            //     그대로 옮기면 되지만, 이것은 **몸에 신겨야 하는 옷**이라 발이
            //     기준이다. 그때는 신이 여섯 픽셀 밑으로 빠지고 두 칸 오른쪽으로
            //     밀려, 손이 옷 밖으로 비어져 나왔다.
            { i: 'agent1', n: '요원복 1', over: ['agent1'], own: 'agent1' },
            { i: 'agent2', n: '요원복 2', over: ['agent2'], own: 'agent2' },
            // ★ 제작자 세트 (2026-10-19) — **상담사가 선물함으로 보내 준 사람만** 가진다.
            //   물품 「제작자 의상 · 겉옷 · 신발」을 선물함에서 받는 순간 옷장으로 들어간다
            //   (wear-gift.js). 밀실 거래로는 주고받을 수 있다 (2026-10-19).
            //   받은 그림은 1728x768 (칸 288 — 지난 규격)이라 칸마다 가로로 30 밀어 352 칸에 넣었다
            //   (검은 정장 · 유리 펜과 같다). 꼬리가 옆 칸으로 몇 픽셀 넘어가 있어 칸마다 288 폭을
            //   40 늦게 떠서 옮겼다. 걷기 줄은 네 칸만 그려져 있어 5·6번째를 3·2번째로 채웠다.
            //   의상과 겉옷은 따로 입는다 — 의상은 이 칸(겉옷), 겉옷은 망토 칸.
            { i: 'maker', n: '제작자 의상', over: ['maker-outfit'], own: 'maker-outfit' },
            // ★ 늑대 잠옷 (2026-10-21) — 늑대 귀 후드에 꼬리까지. 제작자 겉옷과 같은 두 장이다.
            //   **겉옷 칸**이다 (처음엔 망토 칸 — 같은 날 겉옷 칸으로 옮겼다. 망토 칸에 적힌 것은 wear-gift.js 가 옮겨 준다).
            //   바깥(wolf-pj)은 머리 위(top) · 후드 안쪽 그림자(wolf-pj-in)는 머리카락 뒤(over).
            //   **상담사가 선물함으로 보내 준 사람만** 가진다 (wear-gift.js) · 밀실 거래로 넘기지 않는다 (noTrade).
            //   받은 그림은 1728x768 (칸 288 — 지난 규격) · 제작자 겉옷과 같이 칸마다 가로 +30 으로 352 칸에 옮겼다.
            //   덩어리마다 제 폭만큼 떠서 옮겼고(꼬리가 옆 칸으로 넘어가 있다), 352 칸 밖으로 나가는 꼬리 끝
            //   몇 픽셀(걷기 넷째 6 · 서기 둘째~넷째 2·10·2)은 잘랐다 — 안 자르면 다음 칸 왼쪽에 묻는다.
            //   걷기 줄은 네 칸만 그려져 있어 5·6번째를 3·2번째로 채웠다. 서기 줄 여섯 칸에 꼬리가 흔들린다.
            //   ★ 걷기 2·3·4번째 칸은 바깥 그림에 후드 그림자가 같이 그려져 왔다 (그린 이가 빼는 것을 잊음).
            //     그 그림자 색(67,70,102)만 바깥에서 걷어 내고 그림자는 뒤 장으로 — 2·3번째는 따로 준 그림자와
            //     자리가 똑같다. 4번째는 따로 준 그림자가 그 자리를 안 덮어서(후드 안쪽이 뚫려 보였다)
            //     걷어 낸 그림자를 뒤 장에 같이 넣었다.
            { i: 'wolf', n: '늑대 잠옷', over: ['wolf-pj-in'], top: ['wolf-pj'], own: 'wolf-pj', noTrade: true },
            // ★ 사운드 세트 (2026-10-23) — 의상 · 코트 · 레빗 헤드셋. **상담사가 선물함으로 보내 준 사람만** 가진다 (wear-gift.js).
            //   받은 그림은 1728x768 (칸 288 — 지난 규격) · 칸마다 가로 +30 으로 352 칸에 옮겼다 (세로는 그대로 맞았다).
            //   걷기 줄은 네 칸만 그려져 있어 5·6번째를 3·2번째로 채웠다 (헤드셋은 여섯 칸 다 그려져 왔다).
            //   서기 줄은 두 칸 — 의상은 두 칸이 같은 그림이라 0 에 세워 둔다.
            { i: 'sound', n: '사운드 의상', over: ['sound-outfit'], own: 'sound-outfit' },   // 밀실 거래 됨 (2026-10-24)
            // ★ 의상 뽑기 다섯 벌 (2026-10-23) — 한 벌씩 통째로 그려져 있다.
            //   주신 그림은 432x192 (칸 72x96) — 지난 규격(1728x768 · 칸 288)의 ¼ 이라 네 배로 늘려
            //   (도트 한 칸이 4픽셀 · 요원복 · 브라운 정장과 같다) 칸마다 가로 +30 으로 352 칸에 옮겼다.
            //   몸에 대 보니 어깨 · 발이 그대로 맞았다. 걷기 줄은 여섯 칸 다 그려져 왔다.
            //   이름 — 유치원 앞치마 · 룩키마트 앞치마 · 룩키마트 의상은 정해 주신 것 · 메이드복 둘은 그림을 보고 붙였다.
            { i: 'ydress', n: '유치원 앞치마', over: ['dress-yellow'], own: 'dress-yellow' },
            { i: 'gdress', n: '룩키마트 앞치마', over: ['dress-green'], own: 'dress-green' },
            { i: 'maid', n: '메이드복', over: ['maid'], own: 'maid' },
            { i: 'maidl', n: '롱 메이드복', over: ['maid-long'], own: 'maid-long' },
            // ★ 붕어빵 의상 (2026-10-25 · 의상 뽑기 C) — 몸통을 통째로 감싸는 탈. 1728x768 (칸 288) 이라
            //   칸마다 가로 +30 으로 352 칸에 옮겼다. 걷기 줄은 네 칸만 와서 5·6번째를 3·2번째로 채웠다.
            //   서기 줄은 한 칸 — 0 에 세운다. 겹 차례는 맨 위 (D.Z 끝) — 겉옷 · 장갑까지 덮는다.
            { i: 'bungeo', n: '붕어빵 의상', over: ['bungeo'], own: 'bungeo' },
            // ★ 뉴비 세트 (2026-10-25) — 뉴비 의상 · 뉴비 장화 · 뉴비 병아리 후드 · 잎 우산. **상담사가 꽂아 넣어 준 사람만** (wear-gift.js) ·
            //   뉴비 새싹처럼 밀실 거래로 넘기지 않는다 (noTrade).
            //   받은 그림은 1728x768 (칸 288 — 지난 규격) · 칸마다 가로 +30 으로 352 칸에 옮겼다 (세로는 그대로 맞았다).
            //   의상 · 장화 · 후드는 걷기 줄 네 칸만 와서 5·6번째를 3·2번째로 채웠다 · 서기는 첫 칸.
            //   뉴비 의상 — 노란 윗옷에 보라 반바지가 한 장 (겉옷 칸)
            { i: 'newbie', n: '뉴비 의상', over: ['newbie-outfit'], own: 'newbie-outfit', noTrade: true }
            // (룩키마트 의상 · 가을 니트 · 체육복은 2026-10-23 상의 칸으로 옮겼다)
            // ★ 가을 니트 (2026-10-23) — 주신 그림은 1728x768 (칸 288) 에 머리 · 손 · 다리까지 그려진 통짜.
            //   칸마다 가로 +30 으로 352 칸에 옮기니 몸 그림과 자리가 딱 맞아, 몸과 자리 · 색이 똑같은 칸을 빼고
            //   (백일몽 정장과 같은 길) 귀 · 턱 밑에 남은 살색 몇 점도 걷어 니트와 셔츠만 남겼다. 다리는 맨다리라 하의는 따로 입는다.
            // 체육복 (2026-10-23) — 가을 니트와 같은 규격 · 같은 길 (몸과 같은 칸을 빼고 윗옷만 남겼다)
        ]
    },
    {
        k: 'shoes', n: '구두', items: [
            { i: '', n: '없음', over: [] },
            { i: 'shoes', n: '구두', over: ['shoes'], own: 'shoes' },
            { i: 'han', n: '신', over: ['han-shoes'], own: 'han-shoes' },
            { i: 'black', n: '검은 구두', over: ['shoes-black'], own: 'shoes-black' },
            { i: 'maker', n: '제작자 신발', over: ['maker-shoes'], own: 'maker-shoes' },
            // ★ 사운드 신발 (2026-10-23) — 사운드 세트 · 상담사가 선물함으로 보내 준 사람만 (wear-gift.js) · 거래하지 않는다.
            //   받은 그림은 1728x768 (칸 288) · 칸마다 +30. 걷기 줄은 네 칸만 그려져 있어 5·6번째를 3·2번째로 채웠다. 서기는 첫 칸.
            { i: 'sound', n: '사운드 신발', over: ['sound-shoes'], own: 'sound-shoes' },   // 밀실 거래 됨 (2026-10-24)
            // ★ 뉴비 장화 (2026-10-25 · 뉴비 세트) — 잎 우산의 물 웅덩이는 언제나 이 밑이다 (BACK_Z)
            { i: 'newbie', n: '뉴비 장화', over: ['newbie-boots'], own: 'newbie-boots', noTrade: true }
        ]
    },
    {
        // ★ 장갑은 **맨 위**다 (Z 의 끝). 손이 옷소매 위로 나와야 한다.
        k: 'glove', n: '장갑', items: [
            { i: '', n: '없음', over: [] },
            { i: 'black', n: '검은 장갑', over: ['glove'], own: 'glove' }
        ]
    },
    {
        k: 'cape', n: '망토', items: [
            { i: '', n: '없음', over: [] },
            { i: 'cape', n: '하얀 망토', over: ['cape'], own: 'cape' },
            { i: 'duru', n: '두루마기', over: ['han-duru'], own: 'han-duru' },
            // ★ 제작자 겉옷 — 두 장이다.
            //   바깥(maker-outer)은 **머리 위**(top)에 얹는다 — 얼굴을 두르는 모자라 머리카락
            //   가장자리를 덮어야 한다. 안쪽 채색(maker-outer-in)은 **무조건 머리카락 뒤**
            //   (over — 머리보다 먼저 그린다). 한 장으로 주면 안쪽 색이 머리카락을 묻혀서 그린
            //   이가 따로 주었다.
            { i: 'maker', n: '제작자 겉옷', over: ['maker-outer-in'], top: ['maker-outer'], own: 'maker-outer' },
            // ★ 사운드 코트 (2026-10-23) — 두 장이다. 그림자(sound-coat-in)는 코트와 같이 입고 **모든 옷 뒤**(Z 맨 앞),
            //   코트(sound-coat)는 망토 자리. 서기 줄 두 칸에 자락이 흔들린다.
            { i: 'sound', n: '사운드 코트', over: ['sound-coat-in', 'sound-coat'], own: 'sound-coat' },   // 밀실 거래 됨 (2026-10-24)
            // ★ 뉴비 병아리 후드 (2026-10-25 · 뉴비 세트) — 두 장. 제작자 겉옷 · 늑대 잠옷과 같은 길이다.
            //   바깥(newbie-hood)은 머리 위(top) · 그림자(newbie-hood-in)는 **무조건 머리카락 뒤**(over — 머리보다 먼저 그린다).
            { i: 'newbie', n: '뉴비 병아리 후드', over: ['newbie-hood-in'], top: ['newbie-hood'], own: 'newbie-hood', noTrade: true }
        ]
    },
    {
        // ★ 악세는 **머리 위**에 얹는다 (over 가 아니라 top).
        //   고양이 귀가 머리카락에 가려지면 안 되기 때문이다.
        //
        // ★ max — 이 칸만 **세 개까지 겹쳐 단다.**
        //   적힐 때는 쉼표로 이은 한 줄이다 ('cat,veil,gat'). 'cat' 하나만
        //   적힌 묵은 자료도 그대로 읽힌다 (accSplit 참고). 겹침 차례는
        //   적힌 차례 그대로다 — 먼저 적힌 것이 아래로 간다.
        k: 'acc', n: '악세', max: 3, items: [
            { i: '', n: '없음', top: [] },
            { i: 'cat', n: '고양이', top: ['cat'], nos: ['9013', '8634', '8449'], cat: '머리' },
            // ★ 베일은 일부러 **덜 비치게** 그려 주셨다 (알파 163).
            //   그림을 그대로 쓴다 — 코드에서 투명도를 건드리지 않는다.
            { i: 'veil', n: '면사포', top: ['veil'], own: 'veil', cat: '머리' },
            // ★ 갓 — 새로 주신 그림(2026-10-14)으로 다시 넣었다. 상담사 옷장에만 보인다.
            //
            //   받은 그림은 864x512 에 두 모양이 288 간격으로 그려져 있었다.
            //   288 은 지난 규격의 칸 너비지만 칸에 맞춰 그려진 것이 아니라,
            //   칸 자리로는 어디에 놓을지 알 수 없었다. 그래서 **쓰던 갓**에
            //   맞췄다 — 둘 다 폭이 152 로 같아서 왼쪽을 98 에 맞추고,
            //   **챙(제일 넓은 줄)** 이 옛 갓과 같은 높이(칸 안 152)에 오도록
            //   위를 88 로 잡았다가, 두 번 더 올리고 왼쪽으로 옮겨 **x 94 · y 72**
            //   로 두었다 (주신 그림의 빨간 자리에 맞춤). 4의 배수로만 옮긴다 —
            //   그림이 4픽셀 눈금이라 어긋나면 사람과 따로 논다.
            //   ★ 가로는 **머리마다 다르다.** 머리 스무 가지의 가운데가 163.5~177.5
            //     로 흩어져 있어(가운뎃값 171.5) 어느 하나에 딱 맞출 수가 없다.
            //     갓 가운데를 169.5 에 두어 가운데쯤에 세웠다.
            //   ✗ 위끝끼리 맞추면 안 된다 — 새 갓은 꼭지가 12픽셀(세 도트)
            //     더 높아서, 그러면 챙이 그만큼 내려와 눈을 가린다.
            //   칸 채우기는 쓰던 갓과 같은 규칙 — 걷기 줄은 두 모양을 번갈아,
            //   서기 줄은 한 모양으로.
            // ★ 상담사 전용이었다가 **악세 뽑기(A)** 로 돌렸다.
            //   줄 이름(i)은 'gat' 그대로다 — 이미 고른 분의 적힌 것이 틀어진다.
            //   가진 표(own)만 장 이름과 같은 'han-gat' 이다 (gacha.js 참고).
            { i: 'gat', n: '갓', top: ['han-gat'], own: 'han-gat', cat: '머리' },
            // ★ 섹시빤츄 (2026-10-23 · 의상 뽑기 악세 B) — 악세지만 **옷 밑**에 입는다 (over · Z 맨 앞).
            //   주신 그림은 1440x640 JPG(칸 240 — 1728 규격을 줄인 것)라 1728 로 되늘려, 몸 그림과 색이 다른 자리 중
            //   어둡고 색끼 없는 것(끈 · 천 · 니플 패치)만 떠서 세 가지 어둠으로 고쳐 칠했다. 몸 테두리 · 귀는 뺐다.
            //   서기 줄은 마지막 칸에만 그려져 있어 그 칸을 여섯 칸 모두에 깔았다 (몸 서기 그림은 여섯 칸이 같다).
            { i: 'sexy-pantsu', n: '섹시빤츄', over: ['sexy-pantsu'], own: 'sexy-pantsu', cat: '등' },
            // ★ 토끼 전용 둘 — 악세 뽑기에 **안 넣는다**. 악세서리숍에서
            //   어둠 소속이 5만 P 에 산다 (gacha.js 의 BUY).
            //
            //   받은 그림은 1728x768 — 토끼와 같은 **지난 규격(칸 288)** 이라,
            //   토끼와 똑같이 칸마다 가로로 22 밀어 352 칸에 넣었다
            //   (도트 눈금이 x ≡ 2 (mod 4) 라 4의 배수로는 못 민다).
            //   세로는 안 건드렸다 — 받은 그림이 이미 맞았다.
            //
            //   rab — **토끼에게만** 얹는다. 사람 몸에 올리면 가슴 한참
            //   아래 허공에 뜬다 (토끼 자리에 맞춰 그려져 있다). look 참고.
            // ★ 움직이는 쪽은 **팔지 않는다** — 사번 3764 한 사람 것이다.
            //   (nos 는 상담사 + 적어 둔 사번만 본다 — allowed 참고)
            { i: 'rab-friend',   n: '친구 리본',        top: ['rab-friend'],
              nos: ['3764'],       cat: '손', rab: true },
            // 파는 쪽 — 반짝임도 글자도 없다
            { i: 'rab-friend-q', n: '친구 리본',        top: ['rab-friend-q'],
              own: 'rab-friend-q', cat: '손', rab: true },
            // ★ 유리 펜 (2026-10-18). 달면 광장 오른쪽 아래에 펜 단추가 뜨고,
            //   누르면 방 바닥 그림 위에 그린다 (pen.js).
            //   **상담사가 선물함으로 보내 준 사람만** 가진다 — 물품 「유리 펜」을
            //   선물함에서 받는 순간 옷장(u.wardrobe['glass-pen'])으로 들어간다.
            //   밀실 거래로는 주고받을 수 있다 (2026-10-19). 처음 주는 것만 상담사다.
            //
            //   받은 그림은 1728x768 — 지난 규격(칸 288)이다. 칸마다 가로로 70
            //   밀어 352 칸에 넣었다 (도트 눈금 x ≡ 2 mod 4 를 지킨다). 그래야
            //   펜이 몸 오른손 옆에 온다. 세로는 그대로 맞았다.
            //   걷기 줄은 네 칸만 그려져 있어 **5·6번째 칸을 3·2번째로** 채웠다
            //   (그린 이의 규칙) — 펜이 흩어졌다가 거꾸로 다시 모인다.
            { i: 'glass-pen', n: '유리 펜', top: ['glass-pen'], own: 'glass-pen', cat: '손' },
            // ★ 뉴비 새싹 (2026-10-19) — 상담사가 선물함으로 보내 준 사람만. 머리 위 새싹 + 하트.
            //   지난 규격(칸 288) → 칸마다 +30. 걷기 5·6 = 3·2, 서기 두 칸이 번갈아 돈다.
            { i: 'newbie-sprout', n: '뉴비 새싹', top: ['newbie-sprout'], own: 'newbie-sprout', noTrade: true, cat: '머리' },
            // ★ 사운드 레빗 헤드셋 (2026-10-23) — 사운드 세트. 걷기 · 서기 줄 여섯 칸 다 그려져 있다 (귀가 흔들린다).
            { i: 'sound-headset', n: '사운드 레빗 헤드셋', top: ['sound-headset'], own: 'sound-headset', cat: '머리' },   // 밀실 거래 됨 (2026-10-24)
            // ★ LP 판 (2026-10-23) — 사운드 세트 · 상담사가 선물함으로 보내 준 사람만 · 거래하지 않는다.
            //   달면 광장에 LP 단추가 뜬다 — 피아노 · 디스코 (lp.js). 누르는 동안만 높은음자리표 · 음표가 둘레에 뜬다 (sound-lp-fx).
            //   받은 그림은 1728x768 (칸 288) · 덩어리마다 주인 칸을 가려 +30 으로 옮겼다 (칸 밖으로 나간 조각 끝은 잘랐다).
            //   서기 줄 여섯 칸에 판이 돈다. 옷 밑(over · Z 맨 앞)에 깔고, 몸(다리 · 발) 자리는 그림에서 비워 발밑에 깔린 것처럼 보인다.
            { i: 'sound-lp', n: 'LP 판', over: ['sound-lp'], own: 'sound-lp', cat: '그 밖' },   // 밀실 거래 됨 (2026-10-24)
            // ★ 잎 우산 (2026-10-25 · 뉴비 세트) — 네 장이다. 물 웅덩이 · 빗물은 **이것을 달았을 때만** 내리고 고인다 (이 칸에만 적혀 있다).
            //     물 웅덩이(leaf-puddle)  몸 뒤 · 맨 아래 — 무조건 신발(과 발) 밑
            //     줄기(leaf-stem)         몸 뒤 — 무조건 등 뒤
            //     잎(leaf-umb)            맨 앞 — 무조건 앞 (FRONT · 머리 · 후드 · 다른 악세보다도 위)
            //     빗물(leaf-rain)         맨 앞 · 잎 위 — 잎에 떨어져 끝으로 흘러내린다
            //   서기 줄 — 빗물 · 웅덩이는 여섯 칸을 돈다 (FLAP_COLS) · 잎 · 줄기는 여섯 칸이 같은 그림이라 0 에 세운다.
            { i: 'leaf-umb', n: '잎 우산', back: ['leaf-puddle', 'leaf-stem'], top: ['leaf-umb', 'leaf-rain'], own: 'leaf-umb', noTrade: true, cat: '손' }
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
//   dark: true         상담사 + **어둠 소속**만
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
// ★ own: '<열쇠>'  뽑기(gacha.js)로 **뽑은 사람만**
//   u.wardrobe 에 그 열쇠가 적혀 있으면 보인다. 상담사는 전처럼 다 보인다.
function hasOwn(it, user) {
    const u = user || u_();
    try { return !!(u && u.wardrobe && u.wardrobe[it.own]); } catch (e) { return false; }
}
// ★ 어둠 소속 — 소속이나 팀 이름에 「어둠」이 들어 있으면 어둠이다.
//   newitems2.js 의 isDark 와 같은 잣대를 쓴다 (칸 이름이 제각각이라
//   소속·팀을 붙여 놓고 본다).
function isDark(user) {
    const u = user || u_();
    return /어둠/.test(((u && u.affiliation) || '') + ' ' + ((u && u.team) || ''));
}
// ★ 얼굴은 상담사가 정해 준 것만 (2026-10-23 · faces.js) — 정해 준 것이 있으면 그것만(어둠 · 사번 전용이어도),
//   아직 안 정했으면 지금 얼굴 하나로 고정. 상담사는 전부. faces.js 가 아직 없으면 예전 규칙.
function allowed(it, user) {
    if (DOT_HEADS.indexOf(it) >= 0 && typeof window.faceList === 'function') {
        const u = user || u_();
        if (isAdm(u)) return true;
        const l = window.faceList(u);
        if (l) return l.indexOf(it.i) >= 0;
    }
    if (it.admin) return isAdm(user);
    if (it.dark) return isAdm(user) || isDark(user);
    if (it.nos) return isAdm(user) || hasNo(it, user);
    if (it.own) return isAdm(user) || hasOwn(it, user);
    return true;
}
// 이 사람 옷장에 보이는 것만 추린다
// 밖(처음 얼굴 고르기 — firsthead.js)에서도 같은 걸름망을 쓰게 내어 준다
window.dotHeadAllowed = function (id, user) {
    const h = DOT_HEADS.filter(function (x) { return x.i === id; })[0];
    return h ? allowed(h, user) : false;
};

function items(slot, user) {
    return slot.items.filter(function (it) { return allowed(it, user); });
}
function slotOf(k) { return DOT_SLOTS.filter(function (s) { return s.k === k; })[0]; }

// ★ 여러 개 겹쳐 다는 칸(악세) — 적힌 한 줄을 목록으로 푼다
//
//   'cat'          → ['cat']        (하나만 달던 묵은 자료)
//   'cat,veil'     → ['cat','veil']
//   ''             → []             (아무것도 안 단 것)
//   혹시 배열로 적혀 있어도(묶음 파일을 거치며 그리 될 수 있다) 읽어 준다.
//   같은 것을 두 번 적어 두면 한 번만 센다 — 겹쳐 그려 봐야 똑같다.
function accSplit(v) {
    if (Array.isArray(v)) v = v.join(',');
    return String(v == null ? '' : v).split(',')
        .map(function (x) { return x.trim(); })
        .filter(function (x, i, a) { return x && a.indexOf(x) === i; });
}
function accJoin(a, max) { return a.filter(Boolean).slice(0, max || 3).join(','); }
// 밖(광장 가방)에서도 몇 개까지인지 알아야 한다
window.dotAccMax = function () { const s = slotOf('acc'); return (s && s.max) || 1; };
window.dotAccList = accSplit;

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

// ★ 가만히 서 있을 때 틀 동작 — 없으면 null
//   남(광장의 다른 사람)은 자리 기록에 사번이 안 실려 오므로 사원 명부(db.users)에서 찾는다.
//   돌려주는 것 — { m: 그 동작(D.IDLES 한 줄), layers: [{ s: 장, hue: 색 }] }
function idleOf(user, L) {
    const list = D.IDLES || [];
    if (!list.length || !user || !L) return null;
    let no = noOf(user);
    if (!no && user.code) {
        try { const x = (typeof db !== 'undefined' && db.users) ? db.users[user.code] : null; no = noOf(x); } catch (e) { }
    }
    if (!no) return null;
    const p = no.length < 4 ? ('0000' + no).slice(-4) : no;
    const col = L.col || {};
    for (let i = 0; i < list.length; i++) {
        const I = list[i];
        if (I.nos.indexOf(no) < 0 && I.nos.indexOf(p) < 0) continue;
        if (L.head !== I.head || (L.pick || {}).outer !== I.outer) continue;
        return {
            m: I,
            layers: I.sheets.map(function (row) {
                let hue = null;
                for (let j = 1; j < row.length; j++) { if (col[row[j]] != null && col[row[j]] !== '') { hue = col[row[j]]; break; } }
                return { s: row[0], hue: hue };
            })
        };
    }
    return null;
}
window.dotIdleOf = function (user) { const r = idleOf(user, look(user, null, true)); return r ? r.m.id : null; };
function headIdx(id) { const k = DOT_HEADS.findIndex(function (h) { return h.i === id; }); return k < 0 ? 0 : k; }

// ==========================================
// 고른 것을 풀어 준다
// ==========================================
// all 이 참이면 **가진 것을 따지지 않는다.**
//   남이 입은 모습을 그릴 때 쓴다 — 남의 소지 목록은 이쪽에 없으므로
//   따지면 남의 옷이 통째로 안 보인다 (옷장에서 고를 때만 따지면 된다).
// ★ 겉옷 칸 → 상의 칸으로 옮긴 옷 (2026-10-23) — 겉옷에 적혀 있는 묵은 기록(내 것 · 남의 것 · 코디)을 상의로 읽는다
const MOVED_TOP = { band: 1, knit: 1, gym: 1 };
function moveOld(d) {
    if (!d || typeof d !== 'object' || !MOVED_TOP[d.outer]) return d;
    const x = Object.assign({}, d);
    x.top = d.outer; x.outer = '';
    return x;
}
function look(user, override, all) {
    const u = user || u_() || {};
    const d = moveOld(override || u.dot || {});
    const head = DOT_HEADS.some(function (h) { return h.i === d.head; }) ? d.head : DOT_HEADS[0].i;
    // ★ 머리가 전용 몸을 들고 있으면 그것을 쓴다 (브라운).
    //   몸 겉모양이 보통 몸과 100% 같으므로 옷은 그대로 다 맞는다.
    const hd = DOT_HEADS[headIdx(head)];
    const bodySheet = hd.body || D.BODY;
    const over = [], tops = [], rabTops = [], backs = [], pick = {};
    DOT_SLOTS.forEach(function (s) {
        const list = all ? s.items.slice() : items(s, u);
        // ★ 여러 개 겹치는 칸(악세) — 적힌 차례대로 다 얹는다
        if (s.max) {
            let ids;
            if (Object.prototype.hasOwnProperty.call(d, s.k)) ids = accSplit(d[s.k]);
            else ids = list.filter(function (x) { return x.def; }).map(function (x) { return x.i; });
            const got = [];
            ids.forEach(function (id) {
                if (got.length >= s.max) return;
                const x = list.filter(function (y) { return y.i === id; })[0];
                if (!x || !x.i) return;          // 없거나 못 가진 것은 건너뛴다
                got.push(x.i);
                (x.back || []).forEach(function (o) { backs.push(o); });
                (x.over || []).forEach(function (o) { over.push(o); });
                (x.top || []).forEach(function (o) { (x.rab ? rabTops : tops).push(o); });
            });
            pick[s.k] = got.join(',');
            return;
        }
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
        (it.back || []).forEach(function (o) { backs.push(o); });
        (it.over || []).forEach(function (o) { over.push(o); });
        (it.top || []).forEach(function (o) { tops.push(o); });
    });
    over.sort(function (a, b) { return D.Z.indexOf(a) - D.Z.indexOf(b); });
    // 한 벌로 그려진 머리는 옷을 안 겹친다 — 고른 것은 그대로 두되 안 그린다
    if (hd.solo) over.length = 0;
    // ★ 악세까지 안 얹는 몸 — 사람 꼴이 아닌 것 (토끼)
    //   악세는 **사람 머리 자리**에 맞춰 그려져 있다. 토끼는 머리가 한참
    //   아래라, 갓도 고양이 귀도 허공에 둥둥 떴다 (재 봄). 브라운 특전은
    //   사람 키라 그대로 맞으므로 solo 와 따로 둔다.
    //   ★ 토끼 자리에 맞춰 그린 악세(rab)는 그 반대다 — **토끼에게만** 얹는다.
    //     사람 몸에 올리면 가슴 한참 아래 허공에 뜬다.
    if (hd.bare) {
        // ★ 토끼에게도 얹는 사람 악세 (RAB_OK · 2026-10-25) — 잎 우산의 잎 · 빗물 · 줄기. 발밑 웅덩이는 뺀다.
        const ok = D.RAB_OK || [];
        const keepT = tops.filter(function (o) { return ok.indexOf(o) >= 0; });
        const keepB = backs.filter(function (o) { return ok.indexOf(o) >= 0; });
        tops.length = 0;
        backs.length = 0;                                 // 몸 뒤에 까는 것 — 웅덩이는 사람 발 자리에 맞춰 그려져 있다
        rabTops.forEach(function (o) { tops.push(o); });
        keepT.forEach(function (o) { tops.push(o); });
        keepB.forEach(function (o) { backs.push(o); });
    }
    // ★ 몸 뒤에 까는 장 — BACK_Z 차례 (아래부터) · 맨 앞에 둘 장(FRONT)은 악세 끝으로 옮긴다
    backs.sort(function (a, b) { return D.BACK_Z.indexOf(a) - D.BACK_Z.indexOf(b); });
    (D.FRONT || []).forEach(function (f) {
        const i = tops.indexOf(f);
        if (i >= 0) { tops.splice(i, 1); tops.push(f); }
    });
    // ★ 장마다 물들인 색 — { 장이름: 0~359 }. 광장이 dot 을 통째로 주고받으므로
    //   남의 화면에서도 같은 색으로 보인다 (따로 보낼 것이 없다).
    const col = (d.col && typeof d.col === 'object') ? d.col : {};
    return { head: head, body: bodySheet, layers: over, tops: tops, backs: backs, pick: pick, col: col };
}
window.dotLook = look;
window.dotNoTag = {}; (DOT.NO_TAG || []).forEach(function (n) { window.dotNoTag[n] = 1; });
// 내 기록도 상의 칸으로 고쳐 적는다 (지금 입은 것 · 코디 다섯 칸) — 한 번 고치면 더 할 일이 없다
setInterval(function () {
    try {
        const u = u_();
        if (!u) return;
        const f = {};
        if (u.dot && MOVED_TOP[u.dot.outer]) { u.dot = moveOld(u.dot); f.dot = 1; }
        if (u.dotSets && typeof u.dotSets === 'object') {
            Object.keys(u.dotSets).forEach(function (k) {
                const e = u.dotSets[k];
                if (e && e.d && MOVED_TOP[e.d.outer]) { e.d = moveOld(e.d); f.dotSets = 1; }
            });
        }
        if (Object.keys(f).length && typeof saveFields === 'function') {
            saveFields(f);
            console.log('[옷장] 겉옷 칸에 입은 룩키마트 의상 · 가을 니트 · 체육복 → 상의 칸으로 옮겨 적었습니다', f);
        }
    } catch (e) { }
}, 3000);
// 칸 크기를 밖에서도 쓴다 (광장이 베껴 적지 않게)
window.dotSpec = function () { return { W: D.W, H: D.H, FOOT: D.FOOT }; };

// ==========================================
// 물들일 수 있는 자리 — 지금 입고 있는 옷·악세의 장 목록
// ==========================================
//   컬러 팔레트(palette.js)와 옷장이 같이 쓴다. 몸과 머리는 뺀다 —
//   살갗과 얼굴까지 물들면 사람이 아니게 된다.
function wornParts(user) {
    const u = user || u_();
    const L = look(u);
    const order = (L.backs || []).concat(L.layers || []).concat(L.tops || []);
    const seen = {}, out = [];
    DOT_SLOTS.forEach(function (s) {
        s.items.forEach(function (x) {
            (x.back || []).concat(x.over || []).concat(x.top || []).forEach(function (sh) {
                if (order.indexOf(sh) < 0 || seen[sh]) return;
                seen[sh] = 1;
                out.push({
                    sheet: sh, slot: s.n, name: x.n,
                    keep: (typeof window.dotTintKeep === 'function' && window.dotTintKeep(sh)) || '',
                    hue: (L.col || {})[sh]
                });
            });
        });
    });
    out.sort(function (a, b) { return order.indexOf(a.sheet) - order.indexOf(b.sheet); });
    // ★ 대기 동작에만 나오는 장(그네 · 면사포) — 그 동작이 나오는 사람에게만 알을 더 붙인다
    try {
        const idl = idleOf(u, L);
        ((idl && idl.m.dye) || []).forEach(function (x) {
            if (seen[x.sheet]) return;
            seen[x.sheet] = 1;
            out.push({ sheet: x.sheet, slot: '대기 동작', name: x.name + ' (대기 동작)', keep: '', hue: (L.col || {})[x.sheet] });
        });
    } catch (e) { }
    return out;
}
window.dotWornParts = wornParts;

// ★ 한 장에 색을 적는다 (팔레트가 부르는 문).
//   hue 가 비면 물든 것을 지운다. 적자마자 옷장 마네킹과 광장 사람을
//   그 자리에서 갈아입힌다.
window.dotSetCol = function (sheet, hue) {
    const me = u_();
    if (!me || !sheet) return false;
    // 아직 한 번도 안 고른 사람이면 지금 보이는 대로 적어 둔다
    if (!me.dot || typeof me.dot !== 'object') {
        const L = look(me);
        const d = { head: L.head };
        DOT_SLOTS.forEach(function (s) { d[s.k] = L.pick[s.k] || ''; });
        me.dot = d;
    }
    const col = (me.dot.col && typeof me.dot.col === 'object') ? me.dot.col : {};
    // 0~359 아니면 'w'(흰색) — 가리는 것은 recolor.js 한 곳에서만 한다
    const h = (typeof window.dotHue === 'function') ? window.dotHue(hue) : hue;
    if (h == null) delete col[sheet]; else col[sheet] = h;
    me.dot.col = col;
    if (pick) pick.col = Object.assign({}, col);     // 옷장이 열려 있으면 같이 맞춘다
    save({ dot: 1 });
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    try { if (document.getElementById('closet-stage')) { paintDoll(); markOn(); } } catch (e) { }
    return true;
};

// ==========================================
// 모습이 든 칸을 만든다
// ==========================================
// ★ hue 가 있으면 **색을 갈아 끼운 그림**을 깐다 (recolor.js).
//   아직 안 만들어졌으면 원래 그림을 깔아 두고, 다 되면 갈아 끼운다
//   (아래 dotTintOn). 그래서 기다리는 빈 칸이 안 보인다.
function layer(sheet, k, hue) {
    const el = document.createElement('div');
    el.className = 'dot-layer';
    el.dataset.sheet = sheet;
    // ★ 절반 크기 그림이 있으면 그것을 깐다 (dot2/ · tools/dot2.py) — 점 하나 안 잃고 풀린 크기는 4분의 1.
    //   배경 크기는 아래에서 원본 크기로 적으므로 같은 자리 · 같은 크기로 그려진다 (사람이 많을 때 끊기던 것 · 2026-10-24)
    let src = ((window.DOT2 && window.DOT2[sheet]) ? 'dot2/' : D.DIR) + sheet + '.png';
    if (hue != null && hue !== '' && typeof window.dotTint === 'function') {
        el.dataset.hue = hue;
        const t = window.dotTint(sheet, hue);
        if (t) src = t;
    }
    el.style.backgroundImage = 'url("' + src + '")';
    el.style.backgroundSize = (D.SHEET_W * k) + 'px ' + (D.SHEET_H * k) + 'px';
    return el;
}
// 색을 다 칠하면 지금 떠 있는 칸들을 갈아 끼운다
if (typeof window.dotTintOn === 'function') {
    window.dotTintOn(function (sheet, hue, url) {
        const sel = '.dot-layer[data-sheet="' + sheet + '"][data-hue="' + hue + '"]';
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (e) {
            e.style.backgroundImage = 'url("' + url + '")';
        });
    });
}

function sprite(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const pose = o.pose === 'walk' ? 'walk' : 'stand';
    const L = look(user, o.dot, o.all);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const sheets = (L.backs || []).concat([L.body]).concat(L.layers).concat([L.head]).concat(L.tops || []);
    const headAt = (L.backs || []).length + 1 + L.layers.length;   // 머리가 몇 번째 층인가 (몸 뒤에 깐 장까지 센다)
    const col = L.col || {};
    const els = sheets.map(function (s) {
        const e = layer(s, k, col[s]); box.appendChild(e); return e;
    });

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
// 서 있는 남들의 시계 — 하나로 모든 사람을 한 번에 바꿔 칠한다 (깜빡임 한 칸 0.11초)
const BLINK_SUM = D.BLINK.reduce(function (a, b) { return a + b; }, 0);
const crowd = new Set();
let crowdT = 0;
function crowdTick() {
    if (document.hidden) return;                          // 창이 뒤로 가면 칠하지 않는다
    const t = Date.now();
    crowd.forEach(function (m) { m.paint(t); });
}
function crowdIn(m) {
    crowd.add(m);
    if (!crowdT) crowdT = setInterval(crowdTick, Math.min.apply(null, D.BLINK));
}
function crowdOut(m) {
    crowd.delete(m);
    if (!crowd.size && crowdT) { clearInterval(crowdT); crowdT = 0; }
}
window.dotCrowd = function () { return crowd.size; };

// ★ 걷는 남들의 시계도 하나로 (2026-10-24 · 광장에 사람이 많으면 끊기던 것)
//   전에는 걷는 사람마다 시계를 하나씩 돌려 0.12초마다 그 사람의 장 대여섯 개를 다시 칠했다.
//   열 명이 걸으면 시계 열 개가 제각각 깨어 1초에 여든 번 넘게 사람을 다시 칠한다.
//   이제 시계 하나가 걷는 남들을 한꺼번에 본다. 그리고 **걷는 사람이 많으면 걸음 그림을 조금 느리게** 넘긴다
//   (자리를 옮기는 빠르기는 그대로 — 발 바꾸는 그림만). 나 자신의 걸음은 그대로 0.12초다.
//       걷는 남 3명까지 ×1 · 6명까지 ×1.25 · 그 위 ×1.5
const walkers = new Set();
let walkT = 0;
function walkInt(n) { return D.WALK * (n > 6 ? 1.5 : (n > 3 ? 1.25 : 1)); }
function walkTick() {
    if (document.hidden) return;
    const t = Date.now(), iv = walkInt(walkers.size);
    walkers.forEach(function (m) { m.walk(t, iv); });
}
function walkIn(m) {
    walkers.add(m);
    if (!walkT) walkT = setInterval(walkTick, Math.round(D.WALK / 2));
}
function walkOut(m) {
    walkers.delete(m);
    if (!walkers.size && walkT) { clearInterval(walkT); walkT = 0; }
}
window.dotWalkers = function () { return walkers.size; };

function actor(user, opt) {
    const o = opt || {};
    const k = o.scale || 1;
    const L = look(user, o.dot, o.all);

    const box = document.createElement('div');
    box.className = 'dot-box';
    box.style.width = (D.W * k) + 'px';
    box.style.height = (D.H * k) + 'px';

    const sheets = (L.backs || []).concat([L.body]).concat(L.layers).concat([L.head]).concat(L.tops || []);
    const col = L.col || {};
    const els = sheets.map(function (s) {
        const e = layer(s, k, col[s]); box.appendChild(e); return e;
    });
    const head = els[(L.backs || []).length + 1 + L.layers.length];   // 악세가 머리 뒤에 더 붙는다 · 몸 뒤에 깐 장이 앞에 있다
    const flaps = flapsOf(els, sheets);

    // ★ 가만히 서 있으면 나오는 동작 (DOT.IDLES) — 해당하는 사람만 장을 더 깔아 둔다
    //   (한 장짜리도, 여러 장을 겹친 것도 있다 — 아래 장부터 차례로 깐다)
    const idl = (o.idle === false) ? null : idleOf(user, L);
    const IM = idl ? idl.m : null;
    let idleEl = null, idleEls = [], idleOn = false, idleWait = 0, idleT = 0;
    if (idl) {
        idleEls = idl.layers.map(function (x) {
            const e = layer(x.s, k, x.hue);
            e.dataset.idle = '1';
            e.style.display = 'none';
            box.appendChild(e);
            return e;
        });
        idleEl = idleEls[0];
    }
    const idleOff = function () {
        if (idleWait) { clearTimeout(idleWait); idleWait = 0; }
        if (idleT) { clearInterval(idleT); idleT = 0; }
        if (!idleOn) return;
        idleOn = false;
        idleEls.forEach(function (e) { e.style.display = 'none'; });
        els.forEach(function (e) { e.style.display = ''; });
    };
    const idleGo = function () {
        idleWait = 0;
        if (!idleEl || walking || held) return;
        // 서 있는 동안 돌던 것(깜빡임·펄럭임)은 멈춘다 — 안 보이는 층을 칠할 까닭이 없다
        timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); timers = [];
        crowdOut(member);
        idleOn = true;
        els.forEach(function (e) { e.style.display = 'none'; });
        idleEls.forEach(function (e) { e.style.display = ''; put(e, 0, 0); });
        let f = 0, row = 0;
        const I = IM;
        const step = function () {
            f++;
            if (row === 0 && f > 5) { row = 1; f = 0; clearInterval(idleT); idleT = setInterval(step, I.loop); }
            else if (row === 1) f = f % 6;
            idleEls.forEach(function (e) { put(e, f, row); });
        };
        idleT = setInterval(step, I.sit);
    };

    // ★ calm — 서 있을 때의 눈 깜빡임 · 악세 펄럭임을 사람마다 따로 돌리지 않고
    //   **시계 하나(crowd)에 묶는다.** 광장의 남들에게 쓴다.
    //   사람마다 시계가 서너 개씩 돌며 제각각 그림을 바꿔 칠하면 열 명만 돼도
    //   1초에 수십 번 화면을 다시 그리느라 끊긴다 (plaza.js 머리말 참고).
    //   한때는 아예 첫 장에 멈춰 두었는데, 다들 굳어 서 있으니 어색했다.
    //   이제 한 시계가 모두를 한 번에 바꿔 칠한다 — 깜빡이는 때는 사람마다 어긋나게.
    // ★ held — 화면 밖에 나간 사람은 **걷는 것까지** 멈춘다 (hold).
    const calm = !!o.calm;
    let held = false;
    let walking = false, dir = 1, timers = [];
    const put = function (el, col, row) {
        el.style.backgroundPosition = '-' + (col * D.W * k) + 'px -' + (row * D.H * k) + 'px';
    };
    // 시계 하나에 묶인 몫 — 지금 몇 번째 칸인지 보고, 바뀌었을 때만 칠한다
    const ph = Math.floor(Math.random() * BLINK_SUM);           // 깜빡이는 때를 사람마다 흩는다
    let headF = 0, seen = false, walkF = -1;
    const member = {
        // 걷는 남 — 시계 하나(walkers)가 부른다. 걸음 칸이 바뀌었을 때만 칠한다
        walk: function (t, iv) {
            if (box.isConnected) seen = true;
            else if (seen) { walkOut(member); return; }
            const f = Math.floor((t + ph) / iv) % 6;
            if (f === walkF) return;
            walkF = f;
            els.forEach(function (e) { put(e, f, 0); });
        },
        paint: function (t) {
            if (box.isConnected) seen = true;
            else if (seen) { crowdOut(member); return; }      // 지워진 칸 — 알아서 빠진다
            let m = (t + ph) % BLINK_SUM, f = 0;
            while (f < D.BLINK.length - 1 && m >= D.BLINK[f]) { m -= D.BLINK[f]; f++; }
            if (f !== headF) { headF = f; put(head, f, 1); }
            flaps.forEach(function (fl) {
                const g = Math.floor((t + ph) / D.FLAP) % fl.cols.length;
                if (g !== fl.g) { fl.g = g; put(fl.el, fl.cols[g], 1); }
            });
        }
    };
    const clear = function () {
        timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); timers = [];
        crowdOut(member);
        walkOut(member);
        if (idleEl) idleOff();
    };

    const start = function () {
        clear();
        if (held) return;                                   // 안 보이는 동안은 그대로 둔다
        if (idleEl && !walking) idleWait = setTimeout(idleGo, IM.after);
        if (walking) {
            let f = 0;
            els.forEach(function (e) { put(e, 0, 0); });
            if (calm) { walkF = 0; walkIn(member); return; }     // 걷는 남은 시계 하나에 묶는다
            timers.push(setInterval(function () {
                f = (f + 1) % 6;
                els.forEach(function (e) { put(e, f, 0); });
            }, D.WALK));
        } else {
            els.forEach(function (e) { put(e, 0, 1); });
            if (calm) {                                     // 서 있는 남은 시계 하나에 묶는다
                headF = 0; flaps.forEach(function (fl) { fl.g = 0; });
                crowdIn(member);
                return;
            }
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
        // 화면 밖이면 시계를 멈추고, 다시 들어오면 그때 모습으로 다시 돌린다
        hold: function (on) { on = !!on; if (on === held) return; held = on; start(); },
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
        //   ★ 머리뿐 아니라 **어느 층이든** 짝이 있을 수 있다.
        //     친구 리본(rab-friend)은 서 있을 때 작은 글씨가 뜨는데, 통째로
        //     뒤집으면 그 글씨도 뒤집혀 읽을 수 없다. 그래서 **글씨만 미리
        //     뒤집어 그린 짝**(rab-friend-r)을 두고, 오른쪽을 볼 때 그것으로
        //     바꿔 단다 — h09 와 똑같은 방식이다.
        face: function (d) {
            if (d === dir) return;
            dir = d;
            box.style.transform = (d < 0 ? 'scaleX(-1)' : '');
            // 짝이 적힌 층은 그림만 짝으로 바꾼다 (뒤집기는 몸과 함께 한 번뿐)
            sheets.forEach(function (nm, i) {
                const pair = D.FACE_PAIR[nm];
                if (!pair || !els[i]) return;
                const use = (d < 0) ? pair : nm;
                let src = D.DIR + use + '.png';
                // 물들인 층이면 짝도 같은 빛깔로 물들여 쓴다
                const hue = els[i].dataset.hue;
                if (hue != null && hue !== '' && typeof window.dotTint === 'function') {
                    const t = window.dotTint(use, hue);
                    if (t) src = t;
                }
                els[i].style.backgroundImage = 'url("' + src + '")';
            });
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
        // ★ 사람을 **가운데** 세운다.
        //   칸이 352 라 좁은 화면(340 쯤)에서는 칸이 넘친다. 그때 margin:0 auto
        //   는 0 으로 떨어져 칸이 왼쪽에 붙고, 사람이 오른쪽으로 치우쳐 보였다.
        //   flex 로 가운데 모으면 넘치는 몫이 양쪽으로 똑같이 나뉘어 가운데 선다.
        '#closet-stage{position:relative;padding:14px 0 0 0;text-align:center;',
        '  display:flex;flex-direction:column;align-items:center;',
        '  background:linear-gradient(180deg,rgba(0,0,0,0.30),rgba(0,0,0,0.12));',
        '  border:1px solid var(--theme-border,#4a5160);border-radius:8px;overflow:hidden;}',
        // ★ 칸이 384 로 커져 위아래에 빈 자리가 생겼다. 위는 걷어 내고,
        //   아래는 발바닥(FOOT)만큼 당겨 그림자가 발에 붙게 한다.
        // ★ margin:0 auto 를 여기서 **0 으로 덮는다.**
        //   flex 칸에서 auto 여백은 남는 자리를 먹는데, 칸이 넘칠 때는 둘 다
        //   0 으로 떨어져 **왼쪽에 붙는다** (align-items 보다 세다). 그래서
        //   사람이 오른쪽으로 치우쳐 보였다 — 가운데에서 17픽셀.
        '#closet-stage .dot-box{margin:-64px 0 -26px 0;}',
        '#closet-floor{height:16px;margin-top:-8px;align-self:stretch;',
        '  background:radial-gradient(ellipse at 50% 0,rgba(0,0,0,0.55),rgba(0,0,0,0) 70%);}',
        // ── 부위마다 한 줄, 옆으로 밀어 고른다 (가방과 같은 모양새)
        '.cl-h{font-size:10px;color:#8d8578;letter-spacing:.06em;margin:15px 2px 7px 2px;',
        '  display:flex;align-items:center;gap:7px;}',
        '.cl-h i{font-style:normal;color:#6f6a60;font-size:9.5px;}',
        '.cl-h:after{content:"";flex:1;height:1px;background:var(--theme-border,#2b2b38);}',
        '.cl-row{display:flex;align-items:center;gap:8px;margin-top:7px;}',
        '.cl-row .lab{flex:0 0 40px;font-size:10px;color:#9a948a;text-align:left;}',
        // ★ 옆으로 미는 칸. 고른 뒤에 **다시 그리지 않아야** 밀어 둔 자리가 남는다.
        '.cl-row .pick{flex:1;min-width:0;display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;',
        '  scrollbar-width:thin;}',
        '.cl-b{flex:0 0 auto;padding:9px 13px;font-size:11px;border-radius:9px;cursor:pointer;',
        '  background:rgba(255,255,255,.04);border:1px solid var(--theme-border,#4a5160);',
        '  color:var(--theme-text,#ded5c4);white-space:nowrap;font-family:inherit;}',
        // ★ 고른 단추 — 글씨색을 **박아 두면 안 된다.**
        //   ✗ color:#ffe9bd 로 두었더니 밝은 살가죽(흰 바탕)에서 글씨가
        //     바탕에 묻혀 안 보였다. 살가죽마다 바탕색이 다르므로 글씨는
        //     그 살가죽의 글씨색(--theme-text)을 그대로 쓰고, **금테와
        //     진하기**로만 골랐다는 것을 보인다.
        '.cl-b.on{background:rgba(217,160,90,.28);border-color:#8a6a2a;border-width:2px;',
        '  padding:8px 12px;color:var(--theme-text,#ffe9bd);font-weight:bold;}',
        '.cl-row .cnt{flex:0 0 auto;align-self:center;font-size:10px;color:#9a948a;}',
        // 색 알 — 왼쪽 동그라미가 지금 물든 색이다 (안 물들었으면 비어 있다)
        '.cl-b .sw{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;',
        '  border:1px solid rgba(255,255,255,.4);vertical-align:middle;background:transparent;}',
        '.cl-b .ou{font-style:normal;font-size:9px;color:#9a948a;margin-left:5px;}',
        '.cl-none{font-size:11px;color:#7d7568;padding:8px 2px;}',
        // 코디 — 빈 칸은 점선 · 이름 적는 칸
        '.cl-b.cl-empty{border-style:dashed;color:#8d8578;}',
        '.cl-in{flex:1;min-width:0;padding:8px 10px;font-size:12px;border-radius:9px;font-family:inherit;',
        '  background:rgba(255,255,255,.06);border:1px solid var(--theme-border,#4a5160);color:var(--theme-text,#ded5c4);}',
        '#closet-note{font-size:10px;color:#8d8578;margin-top:12px;line-height:1.6;}'
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
        pick = { head: L.head, col: Object.assign({}, L.col) };
        DOT_SLOTS.forEach(function (s) { pick[s.k] = L.pick[s.k] || ''; });
    }
    return pick;
}

// 가운데 선 사람만 다시 그린다 (고르는 줄들은 **건드리지 않는다**)
function paintDoll() {
    const host = document.getElementById('closet-stage');
    if (!host) return;
    if (stage) { stop(stage); stage.remove(); stage = null; }
    stage = sprite(u_(), { pose: 'stand', scale: 1, dot: cur() });
    host.insertBefore(stage, host.firstChild);
}

// ==========================================
// 고르는 줄 — 부위마다 벌여 놓고 눌러 고른다
// ==========================================
//
// ★ 전에는 ◀ ▶ 로 한 칸씩 돌렸다. 악세가 쉰 가지가 되고부터는 원하는 것
//   하나를 찾는 데 마흔 번을 눌러야 했다. 이제 가방처럼 **다 벌여 놓고**
//   누른다.
//
// ★ 고른 뒤에 **줄을 다시 그리지 않는다.** 다시 그리면 옆으로 밀어 둔
//   자리가 0 으로 돌아가, 방금 고른 단추가 화면 밖으로 사라진다.
//   그래서 켜짐 표시(on)만 갈아 끼우고 칸은 그대로 둔다.
//
// 악세는 세 개까지 겹친다 (DOT_SLOTS 의 max). 누르면 달고 다시 누르면 벗는다.
const ACC_CATS = ['머리', '귀', '얼굴', '목', '손', '등', '그 밖'];

function esc_(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function btn(kind, key, val, text, on) {
    return '<button class="cl-b' + (on ? ' on' : '') + '" data-kind="' + kind
        + '" data-k="' + esc_(key) + '" data-v="' + esc_(val) + '">' + esc_(text) + '</button>';
}
function rowOf(lab, inner, extra) {
    return '<div class="cl-row"><span class="lab">' + esc_(lab) + '</span>'
        + '<div class="pick">' + inner + (extra || '') + '</div></div>';
}

function buildRows(u) {
    const p = cur();
    let html = '';

    // ① 얼굴
    html += '<div class="cl-h">얼굴</div>'
        // ★ 어둠 전용 머리는 어둠 소속에게만 보인다.
        //   다만 **지금 쓰고 있는 머리**는 소속이 바뀌었더라도 그대로 보여
        //   준다 — 안 그러면 제 얼굴이 목록에서 사라져 아무것도 눌린 데가
        //   없어 보인다.
        + rowOf('머리', DOT_HEADS.filter(function (h) {
            return allowed(h, u) || h.i === p.head;
        }).map(function (h) {
            return btn('head', 'head', h.i, h.n, h.i === p.head);
        }).join(''));

    // ② 의상 — 부위마다 한 줄
    let wear = '';
    DOT_SLOTS.forEach(function (s) {
        if (s.max) return;                       // 악세는 아래에서 따로
        const list = items(s, u);
        if (list.length < 2) return;             // 고를 것이 하나뿐이면 줄을 안 만든다
        wear += rowOf(s.n, list.map(function (x) {
            return btn('one', s.k, x.i, x.n, x.i === (p[s.k] || ''));
        }).join(''));
    });
    html += '<div class="cl-h">의상</div>' + (wear
        || '<div class="cl-none">갈아입을 것이 없습니다.</div>');

    // ③ 악세 — 다는 자리(머리·귀·얼굴·목·손·등)로 갈라 놓는다
    const s = slotOf('acc');
    if (s) {
        const max = s.max || 1;
        const sel = accSplit(p[s.k]);
        const on = items(s, u);
        const none = on.filter(function (x) { return !x.i; });
        const wearables = on.filter(function (x) { return x.i; });
        let acc = '';
        if (wearables.length) {
            acc += rowOf('벗기',
                btn('acc', s.k, '', (none[0] && none[0].n) || '없음', sel.length === 0),
                '<span class="cnt">' + sel.length + ' / ' + max + '</span>');
            ACC_CATS.forEach(function (c) {
                const list = wearables.filter(function (x) { return (x.cat || '그 밖') === c; });
                if (!list.length) return;
                acc += rowOf(c, list.map(function (x) {
                    return btn('acc', s.k, x.i, x.n, sel.indexOf(x.i) >= 0);
                }).join(''));
            });
        }
        html += '<div class="cl-h">악세 <i>세 개까지</i></div>'
            + (acc || '<div class="cl-none">가진 악세가 없습니다.</div>');
    }

    // ④ 색 — 지금 입은 것마다 한 알씩. 누르면 색고리가 뜬다 (palette.js)
    //    ★ 물들이는 데에는 [ 🎨 컬러 팔레트 ] 가 한 개 든다. 되돌리는 것은 공짜다.
    if (typeof window.dotPalette === 'function') {
        html += '<div class="cl-h">색 <i>🎨 컬러 팔레트 한 개</i></div>'
            + '<div id="closet-cols">' + colHtml() + '</div>';
    }
    return html;
}

// 색 알 — 갈아입을 때마다 **이 줄만** 다시 그린다 (다른 줄의 민 자리는 지킨다)
// ★ 지금 고르는 중인 것(pick)으로 본다 — me.dot 은 0.6초 뒤에야 적힌다
function colHtml() {
    const parts = wornParts(Object.assign({}, u_() || {}, { dot: cur() }));
    if (!parts.length) return '<div class="cl-none">입은 것이 없습니다.</div>';
    // ★ 물든 표시(동그라미·켜짐)를 **여기서 같이** 박는다.
    //   ✗ markOn 에만 맡겼더니 render() 는 markOn 을 안 불러서, 옷장을 열자마자는
    //     이미 물든 옷도 빈 동그라미로 떴다.
    return rowOf('물들이기', parts.map(function (x) {
        const h = (typeof window.dotHue === 'function') ? window.dotHue(x.hue) : null;
        const bg = (h == null) ? 'transparent' : window.dotHueCss(x.hue);
        return '<button class="cl-b cl-col' + (h == null ? '' : ' on') + '" data-kind="col" data-k="'
            + esc_(x.sheet) + '" data-v=""><i class="sw" style="background:' + bg + '"></i>'
            + esc_(x.name) + (x.keep ? '<i class="ou">겉만</i>' : '') + '</button>';
    }).join(''));
}

function paintCols() {
    const box = document.getElementById('closet-cols');
    if (!box) return;
    box.innerHTML = colHtml();
    Array.prototype.forEach.call(box.querySelectorAll('.cl-b'), function (b) {
        b.onclick = function () { tap(b.dataset.kind, b.dataset.k, b.dataset.v); };
    });
}

// 켜짐 표시만 갈아 끼운다 — 칸은 그대로 두어 밀어 둔 자리를 지킨다
function markOn() {
    const body = document.getElementById('house-closet-body');
    if (!body) return;
    const p = cur();
    const s = slotOf('acc');
    const sel = s ? accSplit(p[s.k]) : [];
    const col = p.col || {};
    Array.prototype.forEach.call(body.querySelectorAll('.cl-b'), function (b) {
        const kind = b.dataset.kind, k = b.dataset.k, v = b.dataset.v;
        if (kind === 'set' || kind === 'sa') return;          // 코디 단추는 paintSets 가 칠한다
        // ★ 색 알은 고르는 단추가 아니다 — 물든 색만 보여 준다.
        //   ✗ 아래 일반 셈에 섞으면 ('' === '') 이라 전부 켜진 것으로 보인다.
        if (kind === 'col') {
            const h = (typeof window.dotHue === 'function') ? window.dotHue(col[k]) : col[k];
            const sw = b.querySelector('.sw');
            if (sw) sw.style.background = (h == null) ? 'transparent' : window.dotHueCss(col[k]);
            b.classList.toggle('on', h != null);
            return;
        }
        let on;
        if (kind === 'head') on = (p.head === v);
        else if (kind === 'acc') on = v ? (sel.indexOf(v) >= 0) : (sel.length === 0);
        else on = ((p[k] || '') === v);
        b.classList.toggle('on', !!on);
    });
    const cnt = body.querySelector('.cnt');
    if (cnt && s) cnt.innerText = sel.length + ' / ' + (s.max || 1);
}

function saveSoon() {
    clearTimeout(saveT);
    saveT = setTimeout(function () {
        const me = u_(); if (!me) return;
        const p = cur();
        const out = { head: p.head };
        DOT_SLOTS.forEach(function (s) { out[s.k] = p[s.k] || ''; });
        // ★ 물들인 색도 같이 적는다 — 안 적으면 갈아입을 때마다 색이 날아간다
        out.col = Object.assign({}, p.col || {});
        me.dot = out;
        save({ dot: 1 });
        // ★ 광장에 서 있는 내 모습도 그 자리에서 갈아입힌다.
        //   ✗ 안 부르면 옷장에서는 갈아입었는데 **광장 사람은 옛 옷 그대로**다.
        //     (광장은 칸 뒤에 열린 채 깔려 있고, 사람을 만든 뒤로는 다시 안 만든다)
        //     전에는 광장 가방에서 갈아입어 saveDot 이 해 주던 일이다 —
        //     옷을 옷장으로 옮기면서 그 길이 끊겼다.
        try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    }, 600);
}

function tap(kind, k, v) {
    if (kind === 'set' || kind === 'sa') { setTap(kind, k); return; }
    const p = cur();
    // 색 알 — 고르는 것이 아니라 색고리를 띄운다
    if (kind === 'col') {
        if (typeof window.dotPalette === 'function') window.dotPalette(k);
        return;
    }
    if (kind === 'head') {
        // ★ 목록에 없는 머리는 눌러도 안 바뀐다 (어둠 전용 · 상담사 전용)
        const hd = DOT_HEADS.filter(function (h) { return h.i === v; })[0];
        if (hd && !allowed(hd, u_()) && v !== p.head) {
            const n = document.getElementById('closet-note');
            if (n) { n.innerText = (typeof window.faceList === 'function') ? '상담사가 정해 준 얼굴만 쓸 수 있습니다.' : '어둠 소속만 고를 수 있습니다.'; setTimeout(note_, 1800); }
            return;
        }
        p.head = v;
    }
    else if (kind === 'acc') {
        const s = slotOf('acc'); if (!s) return;
        const max = s.max || 1;
        let sel = accSplit(p[s.k]);
        if (!v) sel = [];                                            // 「없음」은 전부 벗는다
        else if (sel.indexOf(v) >= 0) sel = sel.filter(function (x) { return x !== v; });
        else if (sel.length >= max) {
            const n = document.getElementById('closet-note');
            if (n) { n.innerText = '악세는 ' + max + '개까지 답니다.'; setTimeout(note_, 1800); }
            return;
        } else sel.push(v);
        p[s.k] = accJoin(sel, max);
    } else { p[k] = v; }
    if (setSel) { setSel = null; setAsk = null; paintSets(); }     // 손으로 갈아입었다 — 고른 코디 표시를 푼다
    markOn();
    paintCols();      // 갈아입었으니 물들일 거리도 달라진다
    paintDoll();
    saveSoon();
}
window.closetTap = tap;
// 밖(faces.js)에서 내 얼굴을 갈아 끼웠을 때 — 옷장이 들고 있던 고른 것을 버리고 다시 그린다
window.closetReset = function () {
    pick = null;
    try { if (document.getElementById('house-closet-body')) render(); } catch (e) { }
};

// ==========================================
// 코디 — 지금 모습을 다섯 칸까지 적어 두고 눌러 입는다 (2026-10-23)
// ==========================================
//   u.dotSets = { s1: { n: 이름, d: { head, top, bottom, outer, shoes, glove, cape, acc, col }, at }, … s5 }
//   빈 칸을 누르면 지금 모습을 적는다. 찬 칸을 누르면 그 모습으로 갈아입고,
//   아래에 「덮어쓰기 · 이름 · 지우기」가 뜬다 (덮어쓰기 · 지우기는 한 번 더 눌러야 된다).
//   ★ 색(col)도 같이 적고 같이 입는다 — 다시 입을 때 팔레트는 안 든다.
//   ★ 입을 때 지금 못 고르는 것(가진 표에서 빠진 옷 · 소속이 바뀐 어둠 전용 머리)은 빼고 입는다.
//     그 칸은 기본(잠옷 · 없음)으로 · 머리는 지금 머리 그대로. 적을 때 없던 칸(나중에 생긴 칸)은 지금 것 그대로.
const SET_N = 5;
const SET_NAME_MAX = 12;
let setSel = null;          // 고른 칸 's1' … 's5'
let setAsk = null;          // 'over' | 'del' — 한 번 더 눌러야 되는 것 · 'name' — 이름 적는 중

function setsOf(u) {
    const raw = u && u.dotSets, out = {};
    if (raw && typeof raw === 'object') {
        Object.keys(raw).forEach(function (k) { if (/^s[1-5]$/.test(k) && raw[k] && raw[k].d) out[k] = raw[k]; });
    }
    return out;
}
function setSnap() {
    const p = cur();
    const d = { head: p.head };
    DOT_SLOTS.forEach(function (s) { d[s.k] = p[s.k] || ''; });
    d.col = Object.assign({}, p.col || {});
    return d;
}
function setFit(d, u) {
    d = moveOld(d);
    const p = cur();
    const out = { col: Object.assign({}, (d && d.col) || {}) };
    const hd = DOT_HEADS.filter(function (h) { return h.i === d.head; })[0];
    out.head = (hd && allowed(hd, u)) ? d.head : p.head;
    DOT_SLOTS.forEach(function (s) {
        const list = items(s, u);
        if (!Object.prototype.hasOwnProperty.call(d, s.k)) { out[s.k] = p[s.k] || ''; return; }
        if (s.max) {
            out[s.k] = accJoin(accSplit(d[s.k]).filter(function (id) { return list.some(function (x) { return x.i === id; }); }), s.max);
            return;
        }
        const v = d[s.k] || '';
        out[s.k] = list.some(function (x) { return x.i === v; }) ? v : ((list.filter(function (x) { return x.def; })[0] || list[0] || {}).i || '');
    });
    return out;
}
function setWrite(k, v) {
    const u = u_(); if (!u) return;
    const raw = (u.dotSets && typeof u.dotSets === 'object' && !Array.isArray(u.dotSets)) ? u.dotSets : {};
    if (v) raw[k] = v; else delete raw[k];
    u.dotSets = raw;
    save({ dotSets: 1 });
}
function setSay(t) {
    const n = document.getElementById('closet-note');
    if (n) { n.innerText = t; clearTimeout(setSay._t); setSay._t = setTimeout(note_, 2200); }
}
function setsHtml() {
    const S = setsOf(u_());
    let chips = '';
    for (let i = 1; i <= SET_N; i++) {
        const k = 's' + i, x = S[k];
        chips += '<button class="cl-b' + (x ? '' : ' cl-empty') + (setSel === k ? ' on' : '') + '" data-kind="set" data-k="' + k + '" data-v="">'
            + (x ? esc_(x.n || ('코디 ' + i)) : '＋ 저장') + '</button>';
    }
    let act = '';
    if (setSel && S[setSel]) {
        if (setAsk === 'name') {
            act = '<div class="cl-row"><span class="lab">이름</span><div class="pick">'
                + '<input id="closet-set-name" class="cl-in" maxlength="' + SET_NAME_MAX + '" value="' + esc_(S[setSel].n || '') + '">'
                + '<button class="cl-b" data-kind="sa" data-k="nameok" data-v="">확인</button>'
                + '<button class="cl-b" data-kind="sa" data-k="back" data-v="">그만</button></div></div>';
        } else {
            act = rowOf('', '<button class="cl-b" data-kind="sa" data-k="over" data-v="">' + (setAsk === 'over' ? '한 번 더 누르면 덮어씁니다' : '지금 모습으로 덮어쓰기') + '</button>'
                + '<button class="cl-b" data-kind="sa" data-k="name" data-v="">이름 바꾸기</button>'
                + '<button class="cl-b" data-kind="sa" data-k="del" data-v="">' + (setAsk === 'del' ? '한 번 더 누르면 지웁니다' : '지우기') + '</button>');
        }
    }
    return '<div class="cl-h">코디 <i>다섯 개까지</i></div>' + rowOf('불러오기', chips) + act;
}
function paintSets() {
    const box = document.getElementById('closet-sets');
    if (!box) return;
    box.innerHTML = setsHtml();
    Array.prototype.forEach.call(box.querySelectorAll('.cl-b'), function (b) {
        b.onclick = function () { tap(b.dataset.kind, b.dataset.k, b.dataset.v); };
    });
    const inp = document.getElementById('closet-set-name');
    if (inp) {
        inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); setTap('sa', 'nameok'); } };
        try { inp.focus(); inp.select(); } catch (e) { }
    }
}
function setTap(kind, k) {
    const u = u_(); if (!u) return;
    const S = setsOf(u);
    if (kind === 'set') {
        const no = Number(k.slice(1));
        setAsk = null;
        if (!S[k]) {                                             // 빈 칸 — 지금 모습을 적는다
            setWrite(k, { n: '코디 ' + no, d: setSnap(), at: Date.now() });
            setSel = k;
            paintSets();
            setSay('코디 ' + no + ' 에 지금 모습을 저장했습니다.');
            return;
        }
        pick = setFit(S[k].d, u);                                // 찬 칸 — 그 모습으로 갈아입는다
        setSel = k;
        paintSets(); markOn(); paintCols(); paintDoll(); saveSoon();
        setSay((S[k].n || ('코디 ' + no)) + ' 을(를) 입었습니다.');
        return;
    }
    if (!setSel || !S[setSel]) { setSel = null; setAsk = null; paintSets(); return; }
    const x = S[setSel], nm = x.n || ('코디 ' + setSel.slice(1));
    if (k === 'over') {
        if (setAsk !== 'over') { setAsk = 'over'; paintSets(); return; }
        setWrite(setSel, { n: x.n || nm, d: setSnap(), at: Date.now() });
        setAsk = null; paintSets();
        setSay(nm + ' 을(를) 지금 모습으로 덮어썼습니다.');
    } else if (k === 'del') {
        if (setAsk !== 'del') { setAsk = 'del'; paintSets(); return; }
        setWrite(setSel, null);
        setSel = null; setAsk = null; paintSets();
        setSay(nm + ' 을(를) 지웠습니다.');
    } else if (k === 'name') {
        setAsk = 'name'; paintSets();
    } else if (k === 'nameok') {
        const inp = document.getElementById('closet-set-name');
        const t = String((inp && inp.value) || '').replace(/\s+/g, ' ').trim().slice(0, SET_NAME_MAX);
        setWrite(setSel, Object.assign({}, x, { n: t || ('코디 ' + setSel.slice(1)) }));
        setAsk = null; paintSets();
        setSay('이름을 바꿨습니다.');
    } else if (k === 'back') {
        setAsk = null; paintSets();
    }
}

function note_() {
    const n = document.getElementById('closet-note');
    if (!n) return;
    n.innerText = isAdm(u_()) ? '고르는 대로 저장됩니다.'
        : '고르는 대로 저장됩니다. 옷과 악세는 망상 홈쇼핑 뽑기에서 늘립니다.';
}

function render() {
    const body = document.getElementById('house-closet-body');
    if (!body) return;
    const u = u_(); if (!u) return;
    pick = null;
    setSel = null; setAsk = null;
    body.innerHTML =
        '<div class="panel-title">[사택 옷장]</div>'
        + '<div id="closet-stage"><div id="closet-floor"></div></div>'
        + '<div id="closet-sets">' + setsHtml() + '</div>'
        + '<div id="closet-rows">' + buildRows(u) + '</div>'
        + '<div id="closet-note"></div>';
    Array.prototype.forEach.call(body.querySelectorAll('.cl-b'), function (b) {
        b.onclick = function () { tap(b.dataset.kind, b.dataset.k, b.dataset.v); };
    });
    note_();
    paintDoll();
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
    console.log('  악세      :', (L.tops || []).join(' → ') || '없음',
        '(' + (L.tops || []).length + ' / ' + window.dotAccMax() + ')');
    console.log('  상담사인가:', isAdm(u) ? 'O' : '✗', '· 사번', noOf(u) || '(없음)');
    const S = setsOf(u);
    console.log('  코디      :', Object.keys(S).sort().map(function (k) { return k + ' ' + (S[k].n || ''); }).join(' · ') || '없음');
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
