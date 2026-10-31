// ==========================================
// ★ 「이상한 나라의 ■■■」 — 서큐버스 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음 (wonder-text-succubus.js 뒤)
// ==========================================
//
//   원고: 사용자 원고 01~10 · 공통 배드엔딩 (c_intro · c_ball · c_meet · c_bad)
//         + 새 장면 11~16 (c_new, 「서큐버스의 장 · 몽환 — 원고」 문서)
//   01 달빛 아래의 초대 → 02 정원 → 03 가면(개인 판정) → 04 문 앞
//   → 사건 셋(춤 · 만찬 · 거울 — 개인 판정, 선택지마다 성공 범위가 다름) → 셋 다 실패면 「사랑받는다는 것」(죽음)
//   → 10 붉은 장막 → 11 · 14 → 16 부탁 → 작은 문 → K의 방 「던전의 손님」판 (wonder-link-succubus.js)
//   (2026-10-31 줄이기 — 12 · 13 · 15 는 흐름에서 뺌, 남은 장면은 X.cut 으로 문단을 덜어 냄)
//
//   이벤트 샵: 빌린 가면(춤 · 만찬 · 거울 판정 +5, 한 번) · 무도회 구두끈(춤 실패 한 번을 없던 일로)
//             · 거울 닦개(「사랑받는다는 것」 한 번 막기). 장미 꽃잎 차 · 꿈결 사탕은 연계판에서.

(function wonderSuccubus() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'succubus';

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function paras(x) { return String(x || '').split('<br><br>'); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
// 원고에 남은 「선택 — X.」 머리 줄과 「성공」 · 「실패」 머리 줄은 화면에 내지 않는다
function noHead(x) {
    return paras(x).filter(function (p) {
        const t = p.replace(/<[^>]+>/g, '').trim();
        return !/^선택 — /.test(t) && t !== '성공' && t !== '실패';
    }).join('<br><br>');
}
function deep(seq, fn) { (seq || []).forEach(function (pg) { fn(pg); (pg.o || []).forEach(function (o) { if (o.b) deep(o.b, fn); }); }); }
// 조건 메모 문단 — show(메모) 가 참일 때만 남기고, 메모는 지운다
function cond(x, show) {
    return paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || show(m[1]);
    }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
}
function maskShow(n) {
    const f = F() || {};
    if (n === '가면을 쓴 탐사자') return f.cmask !== 'exempt';
    if (n === '가면 착용을 면제받은 탐사자') return f.cmask === 'exempt';
    if (n === '팀일 때') return X.isTeam();
    return false;
}
X.C = X.C || {};
X.C.cond = cond; X.C.noHead = noHead; X.C.maskShow = maskShow;

// ==========================================
// 고친 장면
// ==========================================
X.FIX.c_door = function () {
    const s = clone('c_intro', 1);
    deep(s.p, function (pg) { pg.x = noHead(pg.x); });
    const b = s.p[0].o[1].b;
    b[b.length - 1].x += '<br><br>(즉사)';
    return s;
};
X.FIX.c_07 = function () {
    const s = clone('c_ball', 3);
    return { h: '07. 자정의 초대', p: [s.p[7]] };
};
X.FIX.c_bad = function () {
    const s = clone('c_bad', 0);
    s.h = '「사랑받는다는 것」';
    s.p[s.p.length - 1].x += '<br><br>(사망)';
    return s;
};
function condFix(i) {
    return function () {
        const s = clone('c_new', i);
        s.p.forEach(function (pg) { pg.x = cond(pg.x, maskShow); });
        deep(s.p, function (pg) { pg.x = cond(pg.x, maskShow); });
        return s;
    };
}
X.FIX.c_11 = condFix(3);
X.FIX.c_13 = condFix(5);
X.FIX.c_15 = condFix(8);
X.FIX.c_16 = function () {
    const s = clone('c_new', 9);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.c_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('c_new', team ? 11 : 10);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(cond(pg.x, maskShow));
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
X.FIX.c_door2 = function () {
    const s = clone('c_new', 12);
    s.h = '작은 문';
    if (F() && F().mis === 'T7') s.p[0].x = s.p[0].x.replace('그녀는 유리병에 남아 있던 장미 꽃잎을 한 장 떼어', '그녀는 드레스 자락에서 꽃잎을 한 장 떼어');
    return s;
};

// ★ 줄이기 (2026-10-31 사용자 — 챕터마다 절반쯤 · 연계판은 그대로) — 문단을 통째로 뺀다 (wonder-core.js X.cut)
//   새 장면 12 · 13 · 15 는 흐름(SEQ)에서 뺐다. 11(장막 안의 방 · 침대 맡의 작은 문) · 14(유리병의 장미 — 작은 문 장면이 가리킨다)는 남긴다.
//   선택지 · 판정 안내 · 조건 메모 · 미션 · 작은 문 쪽은 그대로. 뒤에서 다시 가리키는 것(구두 · 이름 없는 손님 · 하트 가면 · 명부 · 은쟁반 · 거울 속 웃는 얼굴 · 장미 가면 손님)은 남겼다.
// 01. 달빛 아래의 초대 — 5문단
X.cut('c_intro', 1, [
    '정원 한가운데 놓인 분수대', '마치 당신에게 길을 안내하', '멀리서 종소리가 울립니다.', '문 너머에서는 여전히 아름', '은은한 장미 향기가 코끝을'
]);
// 02. 장미 정원의 손님 — 24문단
X.cut('c_intro', 2, [
    '당신이 뒤를 돌아보면 조금', '정원에는 여러 갈래의 산책', '「무도회장으로 가는 길」', '「무도회장으로 가는 조금', '「무도회장으로 가는 가장',
    '표지판 아래에는 작은 글씨', '「어느 길을 선택하셔도 후', '분수대 한가운데에는 두 사', '높은 창문 너머로는 화려한', '저택의 현관 앞에는 붉은',
    '그런데 현관 앞에 도착하자', '여인은 당신을 위아래로 살', '신사도 고개를 기울입니다.', '“정말이군요. 얼굴을 그대', '“오늘 밤의 무도회에서는',
    '여인은 안타깝다는 듯 말하', '“물론 가면을 고르는 데에', '신사가 엄숙하게 말합니다.', '“어떤 가면은 얼굴에 잘', '“어머, 손님을 놀라게 하',
    '여인은 신사의 팔을 가볍게', '“그보다 서두르셔야겠어요.', '그녀는 저택의 문을 가리킵', '“안으로 들어가시면 입구에'
]);
// 03. 가면 없는 손님 — 46문단
X.cut('c_intro', 3, [
    '높은 천장에는 수백 개의', '어떤 거울에는 사람들이 왈', '그런데 정작 거울 앞에는', '홀 안쪽에서는 경쾌한 음악', '남자는 허리를 깊이 숙입니',
    '그는 당신의 얼굴을 살펴보', '그중에는 눈을 감고 있는', '남자는 진열장 앞에 서서', '그가 손짓하자 가면들이 저', '“어떤 가면이든 좋습니다.',
    '당신은 진열장에 놓인 가면', '가까이 다가가자 가면들이', '“천천히 골라 보십시오.', '남자는 흐뭇한 표정으로 당', '“다만 가면에게도 취향이',
    '가면은 놀라울 만큼 가볍습', '“아, 그 아이를 고르셨군', '남자가 손뼉을 칩니다.', '리본은 당신을 더욱 단단히', '리본은 처음에는 아쉬운 듯',
    '“벌써 서로를 이해하게 되', '하나를 풀면 둘이 달라붙고', '“그 아이가 얼마나 손님을', '잘려 나간 리본들은 바닥에', '“흐음. 이건 조금 곤란하',
    '남자는 잠깐 고민하더니 은', '그는 당신의 어깨를 가볍게', '당신이 가면을 벗으려 해도', '그러자 남자는 눈을 동그랗', '그는 진열장을 돌아봅니다.',
    '남자는 무척 난처한 표정을', '당신이 거절의 뜻을 거듭', '남자는 가면을 들어 당신에', '당신이 물러서자 남자도 한', '“어려운 일이 아닙니다.',
    '남자는 여전히 친절하게 웃', '그가 가면을 떨어뜨리자 진', '남자는 바닥에 떨어진 가면', '그는 잠깐 고민하더니 진열', '그는 당신에게 정중히 허리',
    '당신은 균형을 잃고 제자리', '남자는 안도한 듯 웃습니다', '남자는 당신의 얼굴을 살펴', '“아주 잘 어울리십니다!”', '가면은 생각보다 단단히 고',
    '그는 아무 일도 없었다는'
]);
// 04. 무도회장의 문 앞에서 — 3문단
X.cut('c_intro', 4, [
    '문 너머에서는 경쾌한 왈츠', '그가 양문을 활짝 엽니다.', '찬란한 불빛과 음악이 한꺼'
]);
// 04. 끝나지 않는 춤 — 54문단
X.cut('c_ball', 1, [
    '천장에는 수백 개의 수정', '무도회장은 수많은 손님으로', '“정말이군요. 오늘 밤은', '“좋아요! 아주 잘 어울리', '“어서요, 음악이 기다리고',
    '악단이 기다렸다는 듯 새로', '그런데 춤을 추다 보니 이', '당신은 춤추는 법을 알고', '“정말 잘 추시네요!”', '손님이 감탄합니다.', '“이렇게 호흡이 잘 맞는',
    '“어머, 벌써 다음 곡이네', '손님은 당신의 손을 놓지', '“어머?”', '손님은 아쉬운 듯 당신을', '“벌써 그만두시려고요?”', '손님은 기쁜 듯 웃습니다.',
    '“저도 지지 않을 거예요!', '“더 빠르게!”', '“조금만 더!”', '“아, 가 버리셨네.”', '손님은 아쉬운 듯 중얼거리', '“그렇다면 이번에는 저와',
    '아무 일도 없었다는 듯 새', '주변에서 구경하던 손님들도', '“왜요?”', '“음악이 마음에 들지 않으', '“혹시 구두가 불편하신가요', '“아니면 춤 상대가 마음에',
    '손님은 가슴에 손을 얹습니', '“그렇다면 무척 슬픈 일이', '그녀가 고개를 숙이자 주변', '“세상에, 저렇게 아름다운', '“무도회에서 춤을 추지 않',
    '“맞아요! 혼자 춤추는 게', '“모두 함께라면 괜찮겠지요', '“걱정하지 마세요. 춤은', '“발만 움직이면 된답니다!', '“먼저 추세요!”', '“아니에요, 먼저 추시지요',
    '“그럴 수야 없지요. 손님', '“어머, 어디 가셨지?”', '“부끄러우셨나 봐요.”', '“그렇다면 다음에 다시 청', '다른 손님이 반대쪽 손을', '“이제 시작해도 되겠네요!',
    '“잘하시네요!”', '“역시 함께 추니까 훨씬', '손님들은 당신을 붙잡은 채', '“어머, 날아오르셨어요!”', '“정말 멋져요!”', '당신의 몸이 공중에서 흔들',
    '“어머, 벌써 끝났나요?”', '“아쉽네요!”'
]);
// 05. 무도회장의 가장자리 — 5문단
X.cut('c_ball', 2, [
    '춤추는 사람들 사이에서 벗', '당신이 안내문을 읽고 있을', '“춤을 추셨으니 배가 고프', '그녀는 접시 하나를 들어', '접시 위에는 붉은 크림으로'
]);
// 06. 달콤한 만찬 — 66문단
X.cut('c_ball', 3, [
    '새하얀 식탁보 위에는 온갖', '손님들은 저마다 접시를 들', '“마음에 드는 걸 골라 보', '“이 아이는 특히 자신감이', '손님이 즐겁게 웃습니다.',
    '“어머, 정말 기쁜가 봐요', '손님이 두 손을 모읍니다.', '“어서 드셔 보세요. 분명', '목소리는 케이크에서 들려오', '당신이 입을 벌리자 케이크',
    '“어머나, 세상에!”', '손님이 감탄합니다.', '“이렇게까지 마음에 들어', '“아아, 벌써 끝인가요?”', '작은 목소리가 들려옵니다.', '“저는 어때요? 저도 맛있',
    '그녀는 당신에게 작은 손수', '“입가에 크림이 묻었답니다', '당신은 손수건으로 입가를', '“조금만 더!”', '“아직 다 먹지 않았잖아요', '“어머, 어머!”',
    '“하지만 좋아하는걸요!”', '“좋아해도 예의는 지켜야지', '“아이고, 정말 죄송해요.', '손님이 미안한 듯 고개를', '그녀는 접시를 탁자 위에',
    '“다음에는 조금 더 얌전한', '“어머?”', '생크림이 조금씩 흘러내립니', '손님은 안타까운 듯 케이크', '“아이고, 이를 어쩌나.', '“저라면 어떠세요?”',
    '옆 접시의 마카롱이 묻습니', '“저는 아주 달콤하답니다!', '포도알들이 송이째 몸을 흔', '“저희는 상큼해요!”', '초콜릿 분수에서는 기다란', '“저도 있어요!”',
    '손님은 반갑게 웃습니다.', '“어머, 다들 손님을 좋아', '“어머나!”', '“아아, 가 버렸어요!”', '“잡았다!”', '“이제 먹어 주실 거죠?”',
    '“저부터요!”', '“아니, 저부터!”', '“하지만…….”', '“안 돼요!”', '“정말 죄송해요.”', '손님이 손수건을 내밉니다.', '그녀는 아무 일도 없었다는',
    '손님들은 여전히 춤을 추고', '종소리가 울릴 때마다 샹들', '그는 손에 든 금빛 종을', '“오래 기다리셨습니다. 드', '손님들이 일제히 환호합니다',
    '“드디어!”', '“기다리고 있었어요!”', '“오늘은 누구일까요?”', '그가 봉투를 펼칩니다.', '“축하드려요!”', '“정말 부러워요!”', '남자는 계단 아래로 내려와'
]);
// 08. 가장 사랑받는 손님 — 8문단
X.cut('c_ball', 4, [
    '봉투에서는 은은한 장미 향', '초대장을 읽고 고개를 들자', '“참으로 영광스러운 일입니', '주변의 손님들도 저마다 축', '“정말 부러워요!”', '“얼마나 아름다운 분이시기',
    '“다녀오시면 꼭 이야기를', '누군가는 당신에게 장미꽃을'
]);
// 09. 사랑의 회랑 — 68문단
X.cut('c_ball', 5, [
    '계단을 오르자 무도회장의', '남자는 당신보다 두어 걸음', '“이 저택에는 참으로 많은', '그가 장난스럽게 웃습니다.', '“그곳은 주인님께서 계시는',
    '그런데 당신이 지나갈 때마', '“새로운 손님이군요.”', '“어머, 참 사랑스럽게 생', '“오늘 밤은 저분인가 봐요', '작은 속삭임이 복도를 따라',
    '남자는 익숙하다는 듯 그림', '“자자, 여러분. 손님이', '그러자 초상화 속 사람들이', '“아, 여기서 잠깐!”', '그는 당신에게 몸을 돌립니',
    '남자는 거울을 가리킵니다.', '“보십시오! 벌써 저렇게', '남자가 감탄합니다.', '“주인님을 뵙게 되어 무척', '“자, 손님.”', '거울 속의 당신이 환하게',
    '“반가워요.”', '당신과 똑같은 목소리가 들', '“드디어 만났네요.”', '“여기는 정말 좋은 곳이에', '거울 속의 당신이 속삭입니', '맞잡은 손에 조금씩 힘이',
    '당신의 몸이 거울 쪽으로', '당신이 손을 빼내자 거울', '“조금만 더 함께 있어 주', '그는 거울을 향해 손가락을', '“너도 너무 욕심부리지 말',
    '거울 속의 당신은 마지못해', '“다음에 또 만나요.”', '“왜 그러세요?”', '거울 속의 당신이 슬픈 표', '“우리는 이렇게나 닮았는데', '그가 당신의 손을 더욱 단',
    '“당신을 가장 잘 이해하는', '“이제 곧 함께할 수 있겠', '“싫어요! 조금만 더!”', '“안 된다니까! 손님은 아', '“너무해요.”', '남자는 옷매무새를 정돈하며',
    '“정말이지, 요즘 거울들은', '그는 당신을 일으켜 세웁니', '“괜찮으십니까? 어디 다치', '거울 속의 당신은 대답하지', '손이 당신을 따라 움직입니',
    '“잠깐만요.”', '“인사도 안 하고 가시려고', '남자가 난처한 듯 웃습니다', '“아이고, 손님. 저 아이', '“나를 보고 가요.”', '“딱 한 번만요.”',
    '거울 표면이 크게 일렁입니', '그는 당신에게 돌아서서 정', '“실례했습니다, 손님. 이', '“이제야 만났네요.”', '당신과 똑같은 목소리가 귓',
    '“정말 보고 싶었어요.”', '“어서 와요.”', '“기다리고 있었어요.”', '“이제 외롭지 않을 거예요', '“조금만 더요.”', '“안 된다니까!”',
    '“정말 큰일 날 뻔했습니다', '그는 당신의 옷에 묻은 먼'
]);
// 10. 붉은 장막 너머 — 10문단
X.cut('c_meet', 1, [
    '복도 끝에는 커다란 문 하', '문 앞에는 두꺼운 붉은 장', '그는 당신을 향해 몸을 돌', '“손님께서 도착하셨음을 알', '남자는 만족스럽게 웃습니다',
    '“주인님께서 기다리고 계시', '그는 한 걸음 물러나 당신', '당신이 장막을 바라보자 남', '“너무 긴장하지 마십시오.', '장막 아래로 은은한 장미'
]);
// 11. 장막 안의 방 — 5문단
X.cut('c_new', 3, [
    '장막은 생각보다 무겁습니다', '그런데 이상합니다. 분명히', '목소리도 어딘가 낯익습니다', '그녀는 손끝으로 맞은편 자', '당신이 자리에 앉자, 등받'
]);
// 14. 시드는 장미 — 1문단
X.cut('c_new', 7, [
    '그녀는 침대 맡의 작은 문'
]);

// ==========================================
// 흐름
// ==========================================
//   [ 'w', 키, 장면 ] 걷기 · [ 'f', 고친 장면 ] · [ 'v', 화면 ] 판정 화면
const SEQ = [
    ['f', 'c_door'], ['w', 'c_intro', 2], ['w', 'c_intro', 3, { only0: 1 }], ['v', 'cMask'], ['w', 'c_intro', 4],
    ['v', 'cEv', 'dance'], ['w', 'c_ball', 2], ['v', 'cEv', 'dinner'], ['f', 'c_07'], ['w', 'c_ball', 4], ['v', 'cEv', 'mirror'],
    ['v', 'cVerdict'], ['w', 'c_meet', 1], ['f', 'c_11'], ['w', 'c_new', 7], ['f', 'c_16']
    // ★ 줄이기 (2026-10-31) — 12 초상화가 없는 액자 ['w', 'c_new', 4] · 13 한 사람만을 위한 만찬 ['f', 'c_13'] · 15 마지막 한 곡 ['f', 'c_15'] 를 뺐다
];
X.FIX.c_03a = function () { const s = clone('c_intro', 3); return { h: s.h, p: [s.p[0]] }; };
function seqGo(i) {
    const f = F();
    f.cseq = i;
    X.save();
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (st[0] === 'w' && st[3] && st[3].only0) return X.walk('c_intro', 'c03a', 'cSeq', { fix: 'c_03a' });
    if (st[0] === 'w') return X.walk(st[1], st[2], 'cSeq');
    if (st[0] === 'f') return X.walk('c_new', st[1], 'cSeq', { fix: st[1] });
    X.go({ id: st[1], e: st[2] || null });
}
X.THEN.cSeq = function () { seqGo((F().cseq || 0) + 1); };
X.cNext = function () { X.THEN.cSeq(); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.cmask = null; f.cev = {}; f.cfails = 0; f.cseq = 0; f.cused = {};
        seqGo(0);
    },
    mission: function () { X.walk('c_new', 'mis', 'cDoor', { fix: 'c_mis' }); }
};
X.THEN.cDoor = function () { X.walk('c_new', 'door2', 'cLink', { fix: 'c_door2' }); };
X.THEN.cLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 판정 화면 공통 — 기다림 · 아이템
// ==========================================
function gateKey(name) { return 'c_' + rk() + '_' + name; }
function waitOr(name, draw) {
    const f = F();
    const key = gateKey(name);
    if (f.wait && f.wait.key === key) {
        if (X.gateDone(key)) { f.wait = null; X.save(); return X.cNext(); }
        draw(X.waitHtml(key));
        return true;
    }
    return false;
}
X.cDone = function (name) {
    const f = F();
    if (!X.isTeam()) return X.cNext();
    const key = gateKey(name);
    X.gatePress(key);
    f.wait = { key: key };
    X.save(); X.view();
};
function rollDc(dc, bonus) {
    const raw = 1 + Math.floor(Math.random() * 30);
    const total = raw + (bonus || 0);
    const ok = total >= dc;
    try { darkRun.log.push('[판정] d30 ' + raw + (bonus ? '+' + bonus : '') + ' vs ' + dc + ' → ' + (ok ? '성공' : '실패')); } catch (e) { }
    return { raw: raw, bonus: bonus || 0, total: total, ok: ok, dc: dc };
}
function rHtml(r) {
    return '<div class="wd-roll" style="color:' + (r.ok ? '#4CAF50' : '#f44336') + ';">' + r.total
        + (r.bonus ? ' <small>(' + r.raw + (r.bonus > 0 ? ' + ' : ' − ') + Math.abs(r.bonus) + ')</small>' : '') + ' <small>/ ' + r.dc + '</small></div>';
}
X.C.rollDc = rollDc; X.C.rHtml = rHtml;
function dcOf(label) { const m = String(label || '').replace(/<[^>]+>/g, '').match(/^(\d+)~30/); return m ? +m[1] : 16; }

// ==========================================
// 03 가면 — 「가면을 고른다」 16+ · 「가면을 쓰지 않겠다고 한다」 26+
// ==========================================
X.LIVE.cMask = 1;
X.VIEW.cMask = function () {
    const f = F();
    const pg = X.scene('c_intro', 3).p[1];
    const s = f.cms = f.cms || {};
    if (waitOr('mask', function (w) { X.draw('—', s.r ? rHtml(s.r) : '', w); })) return;
    if (s.j == null) {
        X.draw('가면 없는 손님', X.clip(pg.x), pg.o.map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.cMask(' + j + ')'); }).join(''));
        return;
    }
    const br = pg.o[s.j].b[0];
    if (!s.r) {
        X.draw('—', noHead(X.clip(br.x)) + '<div class="wd-sys">[개인 판정 — 1~30 · ' + dcOf(br.o[0].l) + ' 이상 성공]</div>', X.btn('판정한다.', 'WONDER.cMaskRoll()'));
        return;
    }
    const res = br.o[s.r.ok ? 2 : 3].b[0];
    X.draw('—', rHtml(s.r) + noHead(X.clip(res.x)), X.btn(X.clip((res.o && res.o[0] && res.o[0].l) || '무도회장으로 향한다.'), "WONDER.cDone('mask')"));
};
X.cMask = function (j) { const s = F().cms; if (s.j != null) return; s.j = j; X.save(); X.view(); };
X.cMaskRoll = function () {
    const f = F(), s = f.cms;
    if (s.r || s.j == null) return;
    const br = X.scene('c_intro', 3).p[1].o[s.j].b[0];
    s.r = rollDc(dcOf(br.o[0].l), 0);
    f.cmask = (s.j === 1 && s.r.ok) ? 'exempt' : 'worn';
    X.save(); X.view();
};

// ==========================================
// 사건 셋 — 춤(c_ball 1) · 만찬(c_ball 3) · 거울(c_ball 5)
// ==========================================
//   쪽 [0] 도입 + 두 선택 · [1..3] 첫째 선택(판정 · 성공 · 실패) · [4..6] 둘째 선택
const EV = { dance: 1, dinner: 3, mirror: 5 };
const EVN = { dance: '끝나지 않는 춤', dinner: '달콤한 만찬', mirror: '사랑의 회랑' };
X.LIVE.cEv = 1;
X.VIEW.cEv = function (sc) {
    const f = F();
    const e = sc.e;
    const pgs = X.scene('c_ball', EV[e]).p;
    const s = f.cev[e] = f.cev[e] || {};
    if (waitOr('ev_' + e, function (w) { X.draw('—', s.r ? rHtml(s.r) : '', w); })) return;
    if (s.j == null) {
        X.draw(EVN[e], X.clip(pgs[0].x), pgs[0].o.map(function (o, j) { return X.btn(X.clip(o.l), "WONDER.cEvPick('" + e + "'," + j + ')'); }).join(''));
        return;
    }
    const b = 1 + s.j * 3;
    const dc = dcOf(pgs[b].o[0].l);
    if (!s.r) {
        let btns = X.btn('판정한다.', "WONDER.cEvRoll('" + e + "',0)");
        if (X.has && X.has('빌린 가면') && !f.cused['빌린 가면']) btns += X.btn('빌린 가면을 고쳐 쓰고 판정한다. <span style="font-size:10px;color:#d4af37;">(빌린 가면 · +5)</span>', "WONDER.cEvRoll('" + e + "',1)");
        X.draw('—', noHead(X.clip(pgs[b].x)) + '<div class="wd-sys">[개인 판정 — 1~30 · ' + dc + ' 이상 성공]</div>', btns);
        return;
    }
    const res = pgs[s.r.ok ? b + 1 : b + 2];
    let extra = '';
    if (s.cancel) extra = '<div class="wd-sys">무도회 구두끈 — 이번 실패는 없던 일이 됩니다.</div>';
    let btns = '';
    if (!s.r.ok && !s.cancel && e === 'dance' && X.has && X.has('무도회 구두끈') && !f.cused['무도회 구두끈']) btns += X.btn('구두끈을 단단히 묶는다. <span style="font-size:10px;color:#d4af37;">(무도회 구두끈 · 이번 실패를 없던 일로)</span>', 'WONDER.cLace()');
    btns += X.btn(X.clip((res.o && res.o[0] && res.o[0].l) || '계속 간다.'), "WONDER.cDone('ev_" + e + "')");
    X.draw('—', rHtml(s.r) + noHead(X.clip(res.x)) + extra + failBar(), btns);
};
function failBar() {
    const f = F();
    return '<div class="wd-sys">실패 ' + (f.cfails || 0) + ' / 3</div>';
}
X.cEvPick = function (e, j) { const s = F().cev[e]; if (s.j != null) return; s.j = j; X.save(); X.view(); };
X.cEvRoll = function (e, mask) {
    const f = F(), s = f.cev[e];
    if (s.r || s.j == null) return;
    let bonus = 0;
    if (mask && !f.cused['빌린 가면'] && X.spend('빌린 가면')) { bonus = 5; f.cused['빌린 가면'] = 1; }
    const pgs = X.scene('c_ball', EV[e]).p;
    s.r = rollDc(dcOf(pgs[1 + s.j * 3].o[0].l), bonus);
    if (!s.r.ok) f.cfails = (f.cfails || 0) + 1;
    X.pub('cEv/' + rk() + '/' + ME() + '/' + e, s.r.ok ? 1 : 0);
    X.save(); X.view();
};
X.cLace = function () {
    const f = F(), s = f.cev.dance;
    if (!s || !s.r || s.r.ok || s.cancel) return;
    if (!X.spend('무도회 구두끈')) return;
    f.cused['무도회 구두끈'] = 1;
    s.cancel = 1;
    f.cfails = Math.max(0, (f.cfails || 0) - 1);
    X.save(); X.view();
};

// ==========================================
// 최종 판정 — 셋 다 실패면 「사랑받는다는 것」
// ==========================================
X.VIEW.cVerdict = function () {
    const f = F();
    const fails = f.cfails || 0;
    if (fails < 3) return X.cNext();
    if (!f.cmirrorAsk && X.has && X.has('거울 닦개') && !f.cused['거울 닦개']) {
        X.draw('—', '어쩐지 몸이 무겁습니다. 손님들이 하나둘 다가옵니다.<div class="wd-sys">세 번의 판정에 모두 실패했습니다.</div>',
            X.btn('거울 닦개로 회랑의 거울을 닦는다. <span style="font-size:10px;color:#d4af37;">(거울 닦개 · 「사랑받는다는 것」 한 번 막기)</span>', 'WONDER.cWipe()') + X.btn('그대로 둔다.', 'WONDER.cBad()'));
        return;
    }
    if (f.cwiped) {
        X.draw('—', '닦아 낸 거울 속에서 당신의 얼굴이 당신의 얼굴로 돌아옵니다. 다가오던 손님들이 걸음을 멈추고, 아쉬운 듯 길을 비켜 줍니다.', X.btn('남자를 따라간다.', 'WONDER.cNext()'));
        return;
    }
    X.cBad();
};
X.cWipe = function () {
    const f = F();
    if (!X.spend('거울 닦개')) return;
    f.cused['거울 닦개'] = 1; f.cwiped = 1; f.cmirrorAsk = 1;
    X.save(); X.view();
};
X.cBad = function () {
    const f = F();
    f.cmirrorAsk = 1;
    X.pub('pl/' + ME() + '/doom', true);
    try { darkRun.log.push('[서큐버스] 세 판정 모두 실패 — 사랑받는다는 것'); } catch (e) { }
    X.walk('c_bad', 'bad', null, { fix: 'c_bad', solo: true });
};

console.log('[이상한 나라] 서큐버스 (몽환) 연결');
})();
