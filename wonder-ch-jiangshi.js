// ==========================================
// ★ 「이상한 나라의 ■■■」 — 강시 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음, wonder-link-jiangshi.js 앞
// ==========================================
//
//   원고: 사용자 원고 01~10 (j_intro · j_hide · j_end) + 새 장면 11~16 (j_new, 「강시의 장 · 몽환 — 원고」 문서)
//   01 달빛이 머무는 마을(닫힌 문) → 02 → 03 → 숨바꼭질 네 번 → 09 → 10 → 11 → 13 → 15 → 16 부탁 → 마을 끝으로 → 검역 실패 연계판
//   (2026-10-31 줄이기 — 12 · 14 는 흐름에서 빼고, 남은 장면은 X.cut 으로 문단을 덜어 냄. 14 를 빼서 F().jWreath 는 늘 false)
//
//   숨바꼭질 (사용자 원고 「진행 구조 및 시스템 설명」 그대로)
//     · 주사위 판정 없음. 매 회차 다섯 은신처 가운데 하나, 술래는 서로 다른 두 곳을 무작위로 — 일행 모두에게 같다.
//     · 발각은 쌓인다. 두 번째 발각은 그 자리에서 죽음(「영원한 놀이 친구」). 남은 사람은 네 번째까지.
//     · 이벤트 샵: 「홍등 성냥」 — 숨기 전에 술래가 올 곳 하나를 미리 본다.
//                  「작은 방울」 — 발각 한 번을 없던 일로 한다(발각되는 순간 묻는다).
//   새 장면의 조건 줄: 11 「한 번 발각된 적이 있다면」 · 15 「14에서 화환을 받았다면」 · 16 미션 메모 — 여기서 고친다.
//   12의 「이번엔 내가 숨을게」 — 술래가 다섯 곳 가운데 하나에 숨고, 세 번 안에 찾는다 (판정 없음, 개인).

(function wonderJiangshi() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'jiangshi';
const PLACES = ['A. 홍등 찻집', 'B. 종이 인형 가게', 'C. 연꽃 연못', 'D. 달맞이 사당', 'E. 청죽 숲'];

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function jh() { const f = F(); f.jh = f.jh || { found: 0 }; return f.jh; }
// 조건 메모 문단 — show(메모) 가 참이면 메모만 지우고 남긴다
function cond(x, show) {
    return paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || show(m[1]);
    }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
}

// ==========================================
// 고친 장면
// ==========================================
X.FIX.j_found2 = function () {
    const s = clone('j_hide', 11);
    s.p[0].x = s.p[0].x.replace(/^\(여기서부터 이미 사망 판정\)\s*(<br><br>)?/, '');
    return s;
};
X.FIX.j_11 = function () {
    const s = clone('j_new', 3);
    s.p[0].x = cond(s.p[0].x, function (n) { return n.indexOf('한 번 발각된 적이 있다면') >= 0 && jh().found >= 1; });
    return s;
};
X.FIX.j_12 = function () {
    const s = clone('j_new', 4);
    s.p = [s.p[0]];
    return s;
};
X.FIX.j_15 = function () {
    const s = clone('j_new', 8);
    s.p[0].x = cond(s.p[0].x, function (n) { return n.indexOf('화환을 받았다면') >= 0 && !!F().jWreath; });
    return s;
};
X.FIX.j_16 = function () {
    const s = clone('j_new', 9);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.j_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('j_new', team ? 11 : 10);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
// 14 — 화환을 받았는지 기억한다 (15 · 연계판 진입 문단)
const _choose = X.CHOOSE.j_new;
X.CHOOSE.j_new = function (w, pg, i) {
    if (w.h === 7 && w.loc.length === 1 && w.loc[0] === 0 && F()) { F().jWreath = (i === 0); X.save(); }
    return _choose ? _choose.apply(this, arguments) : false;
};

// ★ 줄이기 (2026-10-31 사용자 — 챕터마다 절반쯤 · 연계판은 그대로) — 문단을 통째로 뺀다 (wonder-core.js X.cut)
//   흐름에서 새 장면 12(이번엔 내가 숨을게 · jSeek) · 14(술래의 하품)를 뺐다 — 아래 「흐름」.
//   남긴 것: 숨바꼭질 규칙(02 · 03 · 04 · 술래 출발) · 방울 규칙(02) · 종이꽃 화환(06 — S2) · 황동 방울(09 · 10) · 회색 건물과 사이렌(13 — 연계판 진입) · 조건 메모 · 즉사 문단
X.cut('j_intro', '01.', ['혀끝에 닿자마자 사탕이', '마을 입구에 걸린 붉은 현수막', '「달이 뜨면 모두 함께', '그 아래에는 조금 작은 글씨가', '「처음 오신 손님도']);
X.cut('j_intro', '02.', [
    '발끝이 돌바닥에 닿자', '그런데 자세히 보니 조금 이상합니다', '이곳 사람들은 누구 하나',
    '당신이 대답하기도 전에 여인은', '여인의 말에 근처에 있던', '“새로운 놀이 친구라고요?”', '“정말요? 어디요', '“우와! 이번에는 오래오래',
    '아이가 대답을 기다리는 사이', '“아, 물론 좋아하셔야 해요', '“맞아요! 오늘은 특별히', '“그럼요. 아까부터 새 친구가',
    '여인은 앞장서서 콩콩', '그녀는 무척 당연한 사실을', '“아, 그렇다고 숨바꼭질을',
    '여인은 당신을 광장 한가운데로', '“자, 여기서 잠깐 기다려', '마침 광장에 모여 있던 사람들이', '잠깐의 정적 후', '“새로운 놀이 친구가 왔어요!”', '와아!',
    '광장이 순식간에 환호성으로', '“허허, 아주 좋구먼', '노인은 당신을 찬찬히 살펴보더니', '“그렇다면 슬슬 놀이를', '그가 나무망치를 들어 올립니다',
    '“자, 자! 모두들 주목하시게', '광장에 모인 사람들이 일제히 입을', '노인은 빙그레 웃습니다.', '잠시 말을 멈춘 노인이', '“두 번이나 찾았는데도 또',
    '“맞아요, 맞아!”', '“술래 마음도 생각해'
]);
X.cut('j_intro', '03.', [
    '노인은 손가락을 하나씩 접으며', '“오늘도 길이 다섯 개로군', '마을 사람들이 그 말에 즐겁게',
    '그곳에는 붉은 등불이 줄지어', '찻집 창가에 놓인 찻잔 하나가',
    '노인은 다음 길을 가리킵니다', '좁은 골목 끝에 작은 가게가', '그 말을 들었는지 가게 앞의',
    '광장 남쪽에는 작은 돌다리가', '마침 커다란 금붕어 한 마리가',
    '서쪽으로 뻗은 길 끝에는', '사당의 처마 아래에서 방울',
    '노인은 마지막으로 북쪽을', '마을 끝자락에는 푸른 대나무가', '그때 숲에서 사르륵',
    '노인은 다섯 장소를 모두 소개하고는', '“어떤가? 마음에 드는 곳이', '마을 사람들도 저마다 한마디씩', '“저는 찻집이 좋아요', '“인형 가게가 더 재미있어요',
    '“연못에 가면 금붕어가', '“사당도 좋지요', '“대나무 숲에서는 달이', '모두 자기 마음에 드는 장소를', '사람들이 조용해집니다',
    '노인은 손가락 네 개를', '“맞아요! 술래는 변덕쟁이', '누군가 외치자 사람들이', '노인이 손가락 하나를 들어 올립니다', '그는 잠시 말을 멈추고 당신을',
    '마을 사람 하나가 묻습니다', '그러자 다른 주민이 신이 나서', '“아무도 모르는 곳이겠지요', '“그렇지! 아무도 모르는 곳이라네', '사람들이 다시 웃습니다',
    '노인은 당신을 향해 친절하게', '그는 마지막으로 한 가지를', '“아, 그리고 술래가 어느 곳에', '노인은 자기 농담이',
    '마을 사람들이 일제히 소리가 난 쪽으로', '“술래가 준비됐나 봐요', '“벌써요? 오늘은 부지런하기도', '노인은 서둘러 나무망치를', '“이런, 이런! 우리도', '그가 청동 종 앞으로 다가갑니다'
]);
X.cut('j_hide', '04.', ['종소리가 마을의 지붕을 넘어', '조금 전까지 시끌벅적하던', '멀리서 다시 한번 둔탁한']);
X.cut('j_hide', '05.', ['광장에 청동 종소리가 울려', '노인이 수염을 쓰다듬으며 여러분을', '노인은 너털웃음을', '마을 사람들은 박수를 치며', '광장 바깥으로는 여전히 다섯', '“자, 그럼 다시 시작해 볼까', '노인이 나무망치를 들어 올립니다', '두 번째 숨바꼭질이 시작됩니다']);
X.cut('j_hide', '06.', ['또다시 종소리가 울립니다', '노인은 기분 좋게 수염을', '“어떤가? 우리 마을의 숨바꼭질은', '대답을 기다리는 듯 여러분을', '“그럼, 그럼. 재미있고말고', '“아아, 그렇지! 그런 친구에게는', '노인도 맞장구를 칩니다', '그 말에 주민들이 즐겁게', '광장 너머에서는 붉은 등불들이', '노인은 청동 종 앞으로 다가갑니다', '그가 나무망치를 들어 올립니다']);
X.cut('j_hide', '07.', [
    '광장은 여전히 아름답습니다', '노인은 무척 기쁜 얼굴로', '“여기까지 왔으니 이제 딱', '그는 손가락 하나를 펼쳐', '주민들이 환호성을 지릅니다', '“마지막이에요!”', '“조금만 더 숨어요!”', '“술래에게 들키지만 않으면',
    '그들의 목소리는 밝고 다정합니다', '다른 사람도 웃으며 손을', '소리는 더 이어지지 않습니다', '“술래가 벌써 기다리나 봐요', '“성질도 급하시지', '“조금만 기다리세요! 이제 곧',
    '노인은 청동 종을 향해 돌아섭니다', '“허허, 알겠네, 알겠어', '그가 여러분을 마지막으로 돌아봅니다', '“뭐, 이제 와서 다시 설명할', '나무망치가 청동 종을 두드립니다'
]);
X.cut('j_hide', '숨기 공통', ['가게 안에는 따뜻한 차 향기가', '천장에서는 형형색색의 종이 인형들이', '달빛이 내려앉은 수면 위로', '오래된 나무 기둥마다 붉은 끈이', '높이 솟은 대나무 사이로']);
X.cut('j_hide', '술래 출발', ['그 소리를 끝으로 마을이 조용해집니다', '일정한 간격으로 울리던 발소리가', '발소리가 가까워지는 것 같다가도']);
X.cut('j_hide', '무사히 숨음', ['당신은 숨을 죽이고 귀를 기울입니다', '마을 광장에서 맑은 종소리가', '이제 밖으로 나가도 좋겠습니다']);
X.cut('j_hide', '1차 발각', ['술래는 당신을 발견하자 무척', '“여기 있었구나!”', '그는 두 발을 모은 채 제자리에서 폴짝', '“찾았다, 찾았어! 내가', '그가 고개를 끄덕입니다', '술래는 무척 아쉽다는 듯', '“다음에는 꼭 다시 만나자', '당신은 한동안 그 자리에 남아', '마침내 광장에서 종소리가']);
X.cut('j_end', '09.', [
    '당신은 몸을 숨겼던 곳에서 나와', '커다란 노란 부적을 이마에 붙인 노인이', '노인은 수염을 쓰다듬으며 흐뭇하게', '“정말 축하해요!”', '“우리 술래가 이렇게나 열심히',
    '사람들은 두 발을 모은 채 제자리에서 폴짝폴짝', '종이 인형 가게의 인형들도', '마치 온 마을이 당신의 승리를', '“자아, 자아! 잠깐만 조용히', '노인이 나무망치로 청동 종을 가볍게', '뎅.',
    '그는 품속을 뒤적이더니', '“그것은 바로', '노인은 뜸을 들입니다', '주민들이 다시 환호성을', '“정말 부러워요!”', '“술래도 무척 기뻐하겠어요', '“오늘 밤에는 특별한 손님이',
    '노인은 만족스럽게 고개를 끄덕입니다', '문 위에는 둥근 달을 닮은', '마을 사람들이 길 양옆으로 물러섭니다', '“다녀오세요!”', '“즐거운 시간 보내세요', '“다음에도 꼭 놀러 오세요', '그들의 환송을 받으며'
]);
X.cut('j_end', '10.', ['붉은 등불이 비추는 돌계단 위에는', '인형들은 서로를 돌아보더니', '“그렇다면 들여보내 드려야', '“그렇고말고요.”', '인형들은 양옆으로 한 걸음씩', '맑은 소리가 밤공기 속으로', '규칙적인 발소리가 문 가까이', '누군가 바로 저편에 서 있습니다']);
X.cut('j_new', '11.', ['안쪽에서 따뜻한 향 냄새가', '“와!”', '그러다 금세 부끄러운 듯', '노인의 말대로 술래는 낯을', '술래는 눈을 감고 그 소리를']);
X.cut('j_new', '13.', ['정말입니다. 돌계단 아래로', '술래가 말합니다.', '술래는 그 소리가 무척 부러운']);
X.cut('j_new', '15.', ['주민들이 입을 모아 따라 합니다', '“두 번은 안 돼요!”', '그는 나무망치를 들어 올립니다']);

// ==========================================
// 흐름
// ==========================================
X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.jh = { found: 0 };
        f.jWreath = false;
        f.jSeek = null;
        X.walk('j_intro', 1, 'jI2');
    },
    mission: function () {
        X.walk('j_new', 'mis', 'jExit', { fix: 'j_mis' });
    },
    link: function (api, mid) { if (X.L && X.L.run) X.L.run(CH, mid); }
};
X.THEN.jI2 = function () { X.walk('j_intro', 2, 'jI3'); };
X.THEN.jI3 = function () { X.walk('j_intro', 3, 'jH0'); };
X.THEN.jH0 = function () { X.go({ id: 'jHide', r: 0 }); };
X.THEN.jE9 = function () { X.walk('j_end', 1, 'jE10'); };
X.THEN.jE10 = function () { X.walk('j_end', 2, 'jN11'); };
// 줄이기 (2026-10-31) — 11 → 13 → 15 (12 · 14 는 흐름에서 뺌). jN12 · jSeek · jN14 는 이미 그 장면에 들어가 있던 탐사가 이어 가도록 남겨 둔다.
X.THEN.jN11 = function () { X.walk('j_new', 'n11', 'jN13', { fix: 'j_11' }); };
X.THEN.jN12 = function () { X.walk('j_new', 'n12', 'jSeek', { fix: 'j_12' }); };
X.THEN.jSeek = function () { F().jSeek = { spot: Math.floor(Math.random() * 5), tries: 0, done: 0, last: null }; X.go({ id: 'jSeek' }); };
X.THEN.jN13 = function () { X.walk('j_new', 5, 'jN15'); };
X.THEN.jN14 = function () { X.walk('j_new', 7, 'jN15'); };
X.THEN.jN15 = function () { X.walk('j_new', 'n15', 'jN16', { fix: 'j_15' }); };
X.THEN.jN16 = function () { X.walk('j_new', 'n16', 'jMis', { fix: 'j_16' }); };
X.THEN.jMis = function () { X.toMission(); };
X.THEN.jExit = function () { X.walk('j_new', 12, 'jLink'); };
X.THEN.jLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 숨바꼭질 네 번
// ==========================================
function visitsOf(r) { return ((S().jh || {})[rk()] || {})[r] || null; }
function hkey(r, k) { return ('jh_' + rk() + '_' + r + '_' + k).replace(/[.#$\[\]\/]/g, '_'); }
X.LIVE.jHide = 1;
X.VIEW.jHide = function (sc) {
    const f = F();
    const r = sc.r;
    const v = visitsOf(r);
    const head = '<div class="wd-sys">발각 ' + jh().found + ' / 2</div>';
    if (!v) {
        const a = Math.floor(Math.random() * 5);
        let b = Math.floor(Math.random() * 4); if (b >= a) b++;
        X.tx('jh/' + rk() + '/' + r, function (cur) { return cur || [a, b]; });
        X.draw('—', '', X.waitHtml('_none', '청동 종이 울리기를 기다립니다…'));
        return;
    }
    const start = X.scene('j_hide', 2 + r);
    if (sc.pick == null) {
        let x = X.clip(start.p[0].x) + head;
        if (sc.peek != null) x += '<div class="wd-sys">🔥 홍등 성냥 — 성냥불 그림자가 「' + PLACES[sc.peek] + '」 쪽으로 먼저 갑니다. 술래가 그곳에 옵니다.</div>';
        let b = (start.p[0].o || []).map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.jPick(' + j + ')'); }).join('');
        if (sc.peek == null && X.has && X.has('홍등 성냥')) b += X.btn('🔥 홍등 성냥을 긋는다. <span style="font-size:10px;color:#d4af37;">(술래가 올 곳 하나를 미리 본다)</span>', 'WONDER.jPeek()');
        X.draw(r === 0 ? '첫 번째 숨바꼭질' : '—', x, b);
        return;
    }
    const hideTx = X.clip(X.scene('j_hide', 6).p[sc.pick].x);
    const k1 = hkey(r, 'h');
    if (X.isTeam() && !X.gateDone(k1)) { X.draw('—', hideTx, X.waitHtml(k1, '다른 일행이 숨기를 기다립니다.')); return; }
    if (!sc.go) {
        X.draw('—', X.clip(X.scene('j_hide', 7).p[0].x), X.btn('숨을 죽인다.', 'WONDER.jGo()'));
        return;
    }
    const hit = v.indexOf(sc.pick) >= 0;
    if (hit && !sc.res && !sc.bellAsk && X.has && X.has('작은 방울')) {
        X.draw('—', '콩. 콩.<br><br>발소리가 당신이 숨은 곳 앞에서 멈춥니다.', X.btn('🔔 작은 방울을 울린다. <span style="font-size:10px;color:#d4af37;">(이번 발각을 없던 일로)</span>', 'WONDER.jBell(1)') + X.btn('숨을 참는다.', 'WONDER.jBell(0)'));
        return;
    }
    if (!sc.res) {
        let res = 'safe';
        if (hit && !sc.bell) { jh().found++; res = jh().found >= 2 ? 'dead' : 'found'; }
        sc.res = res;
        try { darkRun.log.push('[강시] 숨바꼭질 ' + (r + 1) + ' — ' + PLACES[sc.pick] + ' · ' + res); } catch (e) { }
        X.save();
        if (res === 'dead') {
            X.pub('pl/' + ME() + '/doom', true);
            return X.walk('j_hide', 'found2', null, { fix: 'j_found2', solo: true });
        }
    }
    const k2 = hkey(r, 'b');
    if (sc.back) {
        if (!X.isTeam() || X.gateDone(k2)) return nextRound(r);
        X.draw('—', '광장으로 돌아왔습니다.', X.waitHtml(k2, '모든 생존자가 광장으로 돌아오기를 기다립니다.'));
        return;
    }
    const pg = sc.res === 'found' ? X.scene('j_hide', 9).p[0] : X.scene('j_hide', 8).p[0];
    X.draw('—', (sc.bell ? '<div class="wd-sys">🔔 작은 방울이 먼저 울렸습니다 — 술래가 그쪽으로 돌아섭니다.</div>' : '') + X.clip(pg.x) + '<div class="wd-sys">발각 ' + jh().found + ' / 2</div>',
        X.btn('광장으로 돌아간다.', 'WONDER.jBack()'));
};
X.jPick = function (j) {
    const sc = F().sc;
    if (!sc || sc.id !== 'jHide' || sc.pick != null) return;
    sc.pick = j;
    if (X.isTeam()) X.gatePress(hkey(sc.r, 'h'));
    X.save(); X.view();
};
X.jPeek = function () {
    const sc = F().sc;
    const v = visitsOf(sc.r);
    if (!v || sc.peek != null || !X.spend('홍등 성냥')) return;
    sc.peek = v[Math.floor(Math.random() * 2)];
    X.save(); X.view();
};
X.jGo = function () { const sc = F().sc; sc.go = 1; X.save(); X.view(); };
X.jBell = function (k) {
    const sc = F().sc;
    if (sc.bellAsk) return;
    sc.bellAsk = 1;
    if (k && X.spend('작은 방울')) sc.bell = 1;
    X.save(); X.view();
};
X.jBack = function () {
    const sc = F().sc;
    sc.back = 1;
    if (X.isTeam()) X.gatePress(hkey(sc.r, 'b'));
    X.save(); X.view();
};
function nextRound(r) {
    if (r < 3) return X.go({ id: 'jHide', r: r + 1 });
    X.THEN.jE9();
}

// ==========================================
// 12 — 이번엔 내가 숨을게 (세 번 안에)
// ==========================================
X.VIEW.jSeek = function () {
    const f = F();
    const q = f.jSeek || (f.jSeek = { spot: Math.floor(Math.random() * 5), tries: 0, done: 0, last: null });
    const sc = X.scene('j_new', 4);
    const opts = sc.p[1].o || [];
    const ps = paras(sc.p[2].x);
    const iW = ps.findIndex(function (p) { return /^<b>틀린 곳<\/b>/.test(p); });
    const iF = ps.findIndex(function (p) { return /^<b>찾았다<\/b>/.test(p); });
    const wrong = ps.slice(iW + 1, iF).join('<br><br>');
    const found = ps.slice(iF + 1).join('<br><br>');
    if (q.done) {
        X.draw('—', (q.self ? '참다 못한 술래가 스스로 나옵니다.<br><br>' : '') + found, X.btn('계속 간다.', 'WONDER.jSeekEnd()'));
        return;
    }
    let x = X.clip(sc.p[1].x);
    if (q.last != null) x = wrong + '<div class="wd-sys">남은 기회 ' + (3 - q.tries) + ' / 3</div>';
    X.draw('—', x, opts.map(function (o, j) { return (q.tried || []).indexOf(j) >= 0 ? '' : X.btn(X.clip(o.l), 'WONDER.jSeekPick(' + j + ')'); }).join(''));
};
X.jSeekPick = function (j) {
    const q = F().jSeek;
    if (!q || q.done) return;
    q.tried = (q.tried || []).concat([j]);
    if (j === q.spot) { q.done = 1; }
    else { q.tries++; q.last = j; if (q.tries >= 3) { q.done = 1; q.self = 1; } }
    X.save(); X.view();
};
X.jSeekEnd = function () { X.THEN.jN13(); };

console.log('[이상한 나라] 강시 (몽환) 연결');
})();
