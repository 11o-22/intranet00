// ==========================================
// ★ 👺 도깨비 공방 — 수선소 · 잡화점 · 교환소 · 보관소(펫 박스) · 도감
// bundles.json 마지막 묶음 — doll-battle.js 다음
// ==========================================
//
// 2026-11-07 사용자 기획안 (도깨비 공방 — 수선소 · 잡화점 · 펫 교환소 · 봉제인형 보관함 · 튜토리얼)
//
// ■ 수선소   청주 1 · 메밀묵 1 로 인형 하나를 체력 가득 · 상태이상 해제 · PP 가득 (2026-11-10 사용자 · 일괄 수선 — 고른 것 모두 · 필요한 수를 먼저 보여 준다)
// ■ 잡화점   🎀 포옹 리본 100 D · 🧶 솜뭉치 간식 30 D (꿈결) · 🍶 청주 3,000 P · 🥣 메밀묵 2,000 P (포인트) · 🧷 봉제인형 아이템 20종 (꿈결 · d2-items.js · 2026-11-10)
//            ※ 망상 홈쇼핑 물건을 옮겨 오는 것은 꿈결 값이 정해지면 넣는다 (지금은 자리만)
// ■ 교환소   1 : 1 — 둘 다 한 마리씩 올리고, 둘 다 「준비 완료」 → 둘 다 「최종 승인」 해야 바뀐다.
//            dollTrade/<열쇠> = { at, ac, bc, a:{code,name,doll,ready,ok}, b:{…}, state, exec }
//              state  ask 신청 · open 여는 중 · done 끝 · cancel 그만
//            바꾸는 순간은 **한 번의 여러 칸 쓰기**로 두 사람 것을 같이 옮긴다 (복제 · 소실 막기)
// ■ 보관소   펫 박스 — 4 × 3 칸 · 10 칸(보관함) · 아래에 동행 셋. 누르면 상세 · 즐겨찾기 · 놓아주기 · 동행/보관,
//            길게 눌러 끌면 순서를 바꾸거나 동행 칸으로 옮긴다. ① 일괄 먹이 ② 펫 선택(여럿) ③ 자동 정렬 · 검색 · ★만
// ■ 도감     가운데 계산대 — 봉제인형 도감 25 · 어둠 · 재난 도감 14
//
// ■ 콘솔
//   dollTradeState()

(function dollGong() {
'use strict';

const D = function () { return window.DOLL; };
const PRICE = {
    '🎀 포옹 리본':   { c: 'D', p: 100 },
    '🧶 솜뭉치 간식': { c: 'D', p: 30 },
    '🍶 청주':        { c: 'P', p: 3000 },
    '🥣 메밀묵':      { c: 'P', p: 2000 }
};
const FIX = { '🍶 청주': 1, '🥣 메밀묵': 1 };      // 인형 하나 수선에 드는 것
const TRADE = 'dollTrade';
// ★ 교환 신청에 한도를 두지 않는다 (2026-11-07 사용자 「봉제인형 교환 신청은 한도 두지 말고」)
//   여럿에게 동시에 신청할 수 있고, 교환 중에 온 신청은 끝날 때까지 기다렸다가 차례로 묻는다. 시간 제한도 없다.

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function fmtN(n) { return (Number(n) || 0).toLocaleString('ko-KR'); }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function dream(u) { u = u || u_(); return Math.max(0, Math.floor(Number(u && u.kroom && u.kroom.dream) || 0)); }
function tutDone() { const u = u_(); return !!(u && u.dollTut && u.dollTut.done); }

// ==========================================
// 창 — 공방 화면 위 (밖에서도 뜬다)
// ==========================================
function css() {
    if (document.getElementById('gb-css')) return;
    const s = document.createElement('style');
    s.id = 'gb-css';
    s.textContent = [
        '.gb-dim{position:fixed;inset:0;z-index:99997;background:rgba(5,3,10,.55);display:flex;align-items:flex-end;justify-content:center}',
        '.gb-pan{width:100%;max-width:440px;max-height:86vh;overflow:auto;background:#1c1528;border:2px solid #a78bdb;border-bottom:0;border-radius:14px 14px 0 0;padding:14px 14px calc(env(safe-area-inset-bottom,0px) + 14px);color:#ece6ff;font-size:12px;box-sizing:border-box}',
        // 잡화점 안에 들인 망상 홈쇼핑 칸 — 제목은 감추고, 원래 꾸밈대로 보이게
        '.gb-pan #shop-dream.in-gong{display:block;background:rgba(0,0,0,.25);border:1px solid #3d2f5c;border-radius:10px;padding:8px;margin:0}',
        '.gb-pan #shop-dream.in-gong>.panel-title{display:none}',
        '.gb-pan h3{margin:0 0 4px;font-size:14px;color:#ffe6b8}',
        '.gb-pan .sub{font-size:10.5px;color:#a99ccc;line-height:1.55;margin-bottom:10px}',
        '.gb-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid rgba(255,255,255,.07)}',
        '.gb-row .ic{flex:0 0 auto}',
        '.gb-row .tx{flex:1;min-width:0}',
        '.gb-row .tx b{color:#fff3d6;font-size:12px}',
        '.gb-row .tx div{font-size:10px;color:#9f93c4;margin-top:2px}',
        '.gb-btn{background:#3a2d5c;color:#f2ecff;border:1px solid #a78bdb;border-radius:8px;padding:8px 11px;font-size:12px;cursor:pointer}',
        '.gb-btn[disabled]{opacity:.4}',
        '.gb-btn.pri{background:#6b4fb0}',
        '.gb-btns{display:flex;gap:6px;margin-top:12px}',
        '.gb-btns .gb-btn{flex:1}',
        '.gb-q{display:flex;align-items:center;gap:4px}',
        '.gb-q button{width:26px;height:26px;border-radius:6px;background:#2b2140;color:#fff;border:1px solid #6d5aa0}',
        '.gb-q span{min-width:22px;text-align:center}',
        '.gb-hp{height:4px;background:#2b2b2b;border-radius:2px;overflow:hidden;margin-top:3px}',
        '.gb-hp i{display:block;height:100%}',
        '.gb-tab{display:flex;gap:6px;margin-bottom:10px}',
        '.gb-tab button{flex:1}',
        '.gb-dex{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}',
        '.gb-dex .c{background:#261d38;border:1px solid #3d2f5c;border-radius:8px;padding:4px 2px;text-align:center;font-size:9px;color:#b8acd8}',
        '.gb-dex .c .no{color:#7f72a8}',
        // 펫 박스
        // ★ 보관함 판 · 동행 판 모두 화면 위쪽에 — 한 그림을 둘로 잘라 붙여 놓는다 (2026-11-07 사용자 「노란색 친 만큼 올려」 · 「아래것도 같이 위로」)
        '.db-all{position:fixed;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 12vh);z-index:99997;display:flex;flex-direction:column;align-items:center;pointer-events:none}',
        '.db-wrap{display:flex;justify-content:center;pointer-events:none}',
        '.db-box{position:relative;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none}',
        '.db-box .bg{position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none}',
        '.db-box .a{position:absolute;box-sizing:border-box}',
        '.db-slot{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;border-radius:6px;background:rgba(255,255,255,.28);border:1px solid rgba(120,90,180,.35);overflow:hidden}',
        '.db-slot.sel{outline:2px solid #ff5fa2;background:rgba(255,95,162,.25)}',
        '.db-slot.drop{outline:2px dashed #6b4fb0}',
        '.db-slot .nm{font-size:7px;color:#3a2d5c;font-weight:bold;white-space:nowrap;overflow:hidden;max-width:100%;line-height:1.2}',
        '.db-slot .st{position:absolute;right:2px;top:1px;font-size:8px;color:#e6b400}',
        '.db-slot .hb{position:absolute;left:3px;right:3px;top:2px;height:2px;background:rgba(0,0,0,.15)}',
        '.db-slot .hb i{display:block;height:100%}',
        // ★ 둘째 막대 — 배고픔(포만도 · 흰색) (2026-11-08 사용자 「게이지를 하나 더 — 흰색 배고픔 게이지」)
        '.db-slot .hb2{position:absolute;left:3px;right:3px;top:5px;height:2px;background:rgba(0,0,0,.15)}',
        '.db-slot .hb2 i{display:block;height:100%;background:#fff}',
        // 🔘 옛 펫 외형 ↔ 봉제인형 — 판 위 (2026-11-08 사용자 「펫박스 역시 기존 외형 보기 on/off 버튼을 상단에」)
        '.db-sw{pointer-events:auto;box-sizing:border-box;background:rgba(24,18,40,.92);border:1px solid #6b56a0;border-radius:8px;padding:0 10px;margin-bottom:4px}',
        '.db-sw .pet-artsw{color:#d8ceff;padding:6px 0}',
        '.db-tbtn{display:flex;align-items:center;justify-content:center;border-radius:7px;background:#c9b9e8;border:1.5px solid #6b56a0;color:#2a2140;font-weight:bold;cursor:pointer}',
        '.db-tbtn.on{background:#6b4fb0;color:#fff}',
        '.db-ghost{position:fixed;z-index:99999;pointer-events:none;opacity:.85}'
    ].join('\n');
    document.head.appendChild(s);
}
function panel(html, onClose) {
    css();
    const dim = document.createElement('div');
    dim.className = 'gb-dim';
    dim.innerHTML = '<div class="gb-pan">' + html + '</div>';
    document.body.appendChild(dim);
    const close = function () { dim.remove(); if (onClose) onClose(); };
    dim.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); if (ev.target === dim) close(); });
    dim._close = close;
    return dim;
}
function icon(sp, px) { return '<div class="ic" style="' + D().spriteCss(sp, px || 40, false, D().artOld()) + '"></div>'; }
// 배고픔 — 인형 돌보기와 같은 포만도(사흘 시계 · pet-data full). 0 이면 굶었다 · 7일 안 먹이면 달아난다 (fedLeft)
function fullOf(d) { try { return Math.max(0, Math.min(100, Number(window.PET.full(d.id)) || 0)); } catch (e) { return D().fullPct(d); } }
function hpBar(d) {
    const M = D(), mx = M.stats(d).max, h = M.hpOf(d), p = h / mx;
    return '<div class="gb-hp"><i style="width:' + Math.round(p * 100) + '%;background:' + (p > 0.5 ? '#4cd964' : (p > 0.2 ? '#ffcc00' : '#ff3b30')) + '"></i></div>';
}
function dollLine(d) {
    const M = D();
    const s = M.stats(d);
    return '<b>' + esc(M.nickOf(d)) + '</b>' + (d.fav ? ' <span style="color:#e6b400">★</span>' : '')
        + '<div>' + esc(M.spName(d.sp)) + ' · ' + s.g + ' · Lv.' + s.lv + ' · ' + (M.ATTR[s.att] || {}).e + ' · 체력 ' + Math.ceil(M.hpOf(d)) + '/' + s.max + ' · ♥' + M.bondOf(d) + ' · 포만도 ' + fullOf(d) + '</div>';
}

// ==========================================
// 이야기 — 수선소 · 교환소 (랜덤 대사 스물씩)
// ==========================================
const SEW_TALK = [
    ['……바느질은 좋아해.', '한 땀, 두 땀…… 이렇게 꿰매다 보면 마음이 편안해지거든.', '……가끔 내 소매까지 같이 꿰매버리긴 하지만.'],
    ['……메밀묵은 참 맛있어.', '말랑말랑하고…… 부드럽고…….', '……봉제인형이랑 조금 닮지 않았어?', '아, 물론 봉제인형을 먹어본 적은 없어…….'],
    ['……청주를 좋아하냐고?', '응…… 조금.', '바느질을 마치고 한 잔 마시면 참 좋거든…….', '……두 잔 마시면 바늘귀가 네 개로 보여서 곤란하지만.'],
    ['……봉제인형 속에는 솜이 들어 있어.', '그런데 가끔…… 솜 대신 이상한 걸 넣어달라는 손님도 있더라.', '……뭘 넣어달라고 했는지는 비밀이야.'],
    ['……내 탈이 신기해?', '응…… 오래전부터 쓰고 있었어.', '……벗으면 어떻게 생겼느냐고?', '글쎄…… 나도 잘 기억이 안 나네.'],
    ['……도망친 아이들 말이야.', '아마 바깥세상이 궁금했나 봐…….', '……돌아오면 혼내야 할까?', '그래도…… 먼저 어디 다친 데는 없는지 봐야겠지.'],
    ['……바느질을 잘하는 비결?', '서두르지 않는 거야…….', '실이 엉키면 풀면 되고, 잘못 꿰매면 다시 뜯으면 되니까.', '……사실 나는 매듭을 잘 못 묶어.'],
    ['……입구에 있는 도깨비 말이야.', '목소리가 참 크지……?', '……어제는 그 녀석이 떠드는 바람에 바늘을 떨어뜨렸어.', '아직도 못 찾았는데…… 어디 갔을까.'],
    ['……봉제인형도 꿈을 꿀까?', '가끔 수선대에 눕혀두면…… 자는 것처럼 조용해지거든.', '……무슨 꿈을 꾸는지 물어봤는데, 대답을 안 해주더라.'],
    ['……김서방은 참 신기해.', '다들 여기 오면 이것저것 구경하느라 바쁜데…….', '……이렇게 나랑 이야기도 해주고.', '……고마워.'],
    ['……저기 빨간 실타래 보이지?', '어제까지만 해도 파란색이었는데…….', '……누가 바꿔놓았을까.', '뭐…… 실은 잘 나오니까 괜찮아.'],
    ['……밤이 되면 공방이 아주 조용해져.', '그때 바느질하는 걸 좋아해…….', '……그런데 가끔 아무도 없는 데서 재봉틀 돌아가는 소리가 나.', '……누가 야근하고 있나 봐.'],
    ['……아주 오래전에 만든 인형이 하나 있었어.', '몇 번이고 찢어지고, 몇 번이고 다시 꿰맸지…….', '……마지막에는 원래 어떤 모습이었는지도 모르겠더라.', '그래도…… 그 아이는 참 좋아했어.'],
    ['……바늘은 조심해야 해.', '작고…… 뾰족하고…… 잘 없어지거든.', '……어제는 바늘을 찾느라 한참 헤맸는데.', '내 손에 들려 있더라…….'],
    ['……한번 고쳐준 인형은 기억하려고 해.', '다음에 또 오면…… 어디가 아팠는지 알아볼 수 있도록.', '……물론 가끔 헷갈리기도 하지만.', '다들 참 비슷하게 생겼거든…….'],
    ['……잡화점에 메밀묵이 들어왔대.', '……아, 알고 있었어?', '그렇구나…….', '……혹시 사러 가는 길이면, 내 것도 하나 부탁해.'],
    ['……인형도 외로움을 탈까?', '아무리 편안한 곳에 두어도…… 오래 찾아오지 않으면 떠나버리잖아.', '……가끔은 먹을 것보다 누군가 찾아와 주는 게 더 좋은가 봐.'],
    ['……다 고친 인형은 꼭 한번 안아줘.', '실밥이 제대로 붙었는지 확인하는 거야…….', '……응? 내가 하면 되지 않느냐고?', '……그건 김서방이 해주는 게 더 좋을 것 같아서.'],
    ['……도깨비는 다 손재주가 좋을 것 같아?', '그렇지는 않아…….', '우리 중에는 바늘에 실 하나 못 꿰는 녀석도 있거든.', '……대신 그 녀석은 메밀묵을 아주 잘 먹어.'],
    ['……오늘은 조금 쉬려고 했는데.', '인형이 또 다쳤네…….', '……괜찮아. 고치는 건 좋아하니까.', '……다만 청주 한 잔 생각이 나네.']
];
const TRADE_TALK = [
    ['김서방, 세상에 공짜가 어디 있겠소?', '인형 하나를 받으려면 인형 하나를 내놓아야지! 그게 우리 교환소의 규칙이오.', '……뭐, 가끔은 내놓은 쪽이 훨씬 아까운 것 같기도 하지만.', '그건 당사자들끼리 알아서 할 일이겠지!'],
    ['내가 여기서 일하는 이유가 뭔지 아시오?', '온갖 봉제인형을 구경할 수 있기 때문이오!', '똑같이 생긴 녀석들도 자세히 보면 다르거든. 성격도 다르고, 하는 짓도 다르고!', '……가끔은 주인보다 인형이 더 점잖더이다.'],
    ['교환이란 게 참 재미있지 않소?', '내게는 별것 아닌 물건이 남에게는 천하의 보물이 될 수도 있으니 말이오!', '그러니 남들이 뭐라 하든, 김서방 마음에 드는 인형을 고르시오.', '어차피 데리고 다닐 사람은 김서방 아니겠소?'],
    ['인형을 그냥 주면 안 되느냐고?', '안 되오! 안 돼! 여긴 교환소지, 나눔 장터가 아니란 말이오!', '인형이 없으면 나가서 한 마리 잡아오쇼.', '……아니, 그렇다고 아무 녀석이나 막 잡아오라는 뜻은 아니고!'],
    ['요즘 탐사자들 사이에서 어떤 인형이 인기인지 아시오?', '나도 모르오!', '인기라는 게 어찌나 빨리 바뀌는지, 어제는 다들 찾던 녀석을 오늘은 아무도 안 찾더이다.', '그러니 유행 따라다니느라 고생하지 마쇼!'],
    ['어제는 똑같이 생긴 인형 둘을 교환한 손님이 있었소.', '내가 보기엔 도무지 뭐가 달라졌는지 모르겠더군.', '그런데 둘 다 아주 만족스러운 얼굴로 돌아갔소!', '……참으로 알다가도 모를 일이오.'],
    ['가끔은 인형들도 서로 마음에 드는 상대가 있는 모양이오.', '어떤 녀석은 다른 인형을 보자마자 팔을 벌리고, 어떤 녀석은 뒤로 숨더이다.', '물론 교환할지 말지는 주인이 결정하는 거지만…….', '……그래도 싫다는 녀석을 억지로 붙여놓으면 좀 미안하지 않겠소?'],
    ['예전에 어떤 김서방이 인형을 바꾸러 왔었소.', '그런데 막상 교환하려니 아까워서 못 하겠다더군!', '한참을 고민하다 결국 자기 인형을 꼭 끌어안고 돌아갔지.', '허허! 그것도 나쁘지 않은 결말 아니겠소?'],
    ['저쪽 수선소 도깨비 말이오? 솜씨 하나는 기가 막히지!', '다만 손님이 찾아와도 말이 너무 없어서 탈이오.', '한번은 인형을 고쳐주고도 다 됐다는 말을 안 해서, 손님이 한참을 기다렸다지 뭡니까!', '……그래도 착한 녀석이오. 청주라도 한 병 가져다주쇼.'],
    ['세상에는 참 별난 수집가들이 많소.', '어떤 이는 귀한 인형만 찾고, 어떤 이는 똑같은 인형을 열 마리씩 모으더이다.', '그런데 가장 신기했던 손님은…….', '인형마다 이름을 전부 똑같이 지어놓은 사람이었소. 대체 어떻게 구분하는 게요?'],
    ['내가 보기엔 저 인형이 참 괜찮은데…….', '응? 어떤 인형이냐고?', '아, 그냥 하는 말이오!', '장사꾼이 손님 물건에 함부로 참견하면 안 되는 법이지. 암!'],
    ['인형 이름을 지을 땐 신중해야 하오.', '한번은 어떤 손님이 자기 인형 이름을 ‘교환 안 함’이라고 지어놨더이다.', '그런데 그 인형을 교환하러 왔지 뭡니까!', '……아직도 무슨 뜻이었는지 모르겠소.'],
    ['김서방, 인형 잡는 솜씨는 좀 느셨소?', '요 녀석들이 보기보다 잽싸서 말이지!', '그래도 잡을 때의 그 짜릿함이 있지 않소?', '……나는 허리가 아파서 직접 잡으러 다니지는 않지만.'],
    ['이 교환소에선 누구나 똑같이 인형 하나씩 내놓아야 하오.', '귀한 인형이든 흔한 인형이든, 그건 상관없소.', '서로 좋다고 하면 그만이지!', '……물론 나중에 후회한다고 찾아와도 물러주진 않소. 명심하쇼!'],
    ['인형이 도망갔다고 너무 상심하지 마쇼.', '그 녀석들도 나름대로 바깥세상이 궁금한 게지.', '다만 한번 야생으로 돌아가면 예전 모습은 온데간데없어진다니…….', '……쯧, 있을 때 잘해주라는 말이 괜히 있는 게 아니오.'],
    ['가끔 교환소에 인형이 잔뜩 모이면 아주 시끄럽소.', '이쪽에서 삑삑, 저쪽에서 바스락, 또 어디선가는 끼익끼익!', '아주 자기들끼리 무슨 회의라도 하는 것 같단 말이지.', '……혹시 내 흉을 보는 건 아니겠지?'],
    ['여기 매일같이 찾아오는 손님이 하나 있소.', '오늘은 토끼를 가져왔다가 곰을 데려가고, 내일은 곰을 가져왔다가 여우를 데려가지.', '그렇게 몇 번을 바꾸더니…….', '결국 처음에 데리고 있던 토끼를 다시 데려갔소! 허허허!'],
    ['좋은 인형을 고르는 비결이 뭐냐고?', '글쎄, 남들이 좋다는 녀석이 꼭 김서방에게도 좋으란 법은 없지 않소?', '모양도 보고, 성격도 보고, 마음이 가는 녀석을 골라보쇼.', '……아, 물론 교환할 인형도 준비해야겠지!'],
    ['나도 가끔은 인형을 한 마리 데리고 싶소.', '이렇게 하루 종일 남의 인형만 구경하자니 조금 부럽기도 하고…….', '……그런데 막상 데려오면 일할 때 자꾸 신경 쓰일 것 같단 말이지.', '허허, 역시 남의 인형 구경하는 게 제일 편하오!'],
    ['오늘도 참 별별 인형이 다녀갔소!', '울상이던 녀석도 있었고, 싱글벙글 웃는 녀석도 있었지.', '새 주인을 만나서 좋아하는 건지, 헤어지기 싫어서 우는 건지는 나도 모르겠지만…….', '뭐, 다들 좋은 곳으로 갔으면 좋겠구먼!']
];
const SHOP_TALK = [
    ['어서 오쇼, 김서방! 필요한 물건이라도 있으신가?'],
    ['우리 잡화점에 없는 물건은…… 뭐, 있긴 하지만! 그래도 웬만한 건 다 있지!'],
    ['자자, 천천히 둘러보쇼. 구경하는 데는 돈 안 받으니까!']
];

// ==========================================
// 🤖 도깨비 말 — Claude Sonnet 5.5 (api/dokkaebi.js) · 같은 말이 안 나오게 최근 말을 같이 보낸다
//   부르지 못하면(한도 · 오류 · 15초) 정해 둔 대사 가운데 하나로
// ==========================================
function recentOf(who) { try { return JSON.parse(localStorage.getItem('dkb-' + who) || '[]') || []; } catch (e) { return []; } }
function remember(who, lines) { try { localStorage.setItem('dkb-' + who, JSON.stringify(recentOf(who).concat(lines).slice(-16))); } catch (e) { } }
// 누른 탐사자의 상태 — 도깨비가 보고 말한다 (2026-11-07 사용자 「상태이상, 포만감, 봉제인형 상태 등등」)
function stateCtx() {
    const u = u_(), M = D();
    if (!u || !M) return {};
    const ds = M.dolls(u), all = Object.keys(ds), t = Date.now();
    const pct = function (d) { const s2 = M.stats(d); return Math.round(M.hpOf(d) / s2.max * 100); };
    const effs = (Array.isArray(u.timedEffects) ? u.timedEffects : []).filter(function (e) { return e && e.name && (!e.expireAt || e.expireAt > t); }).map(function (e) { return String(e.name); });
    let q = false;
    try { q = typeof isQuarantined === 'function' && !!isQuarantined(u); } catch (e) { }
    return {
        포만감: Math.round(Number(u.satiety) || 0), 오염도: Math.round(Number(u.pollution) || 0), 격리: q, 상태이상: effs,
        꿈결: dream(u), 포인트: Math.round(Number(u.points) || 0), 보관함: M.boxList(u).length,
        배고픈_인형: all.filter(function (k) { return M.fullPct(ds[k]) < 30; }).length,
        다친_인형: all.filter(function (k) { const p = pct(ds[k]); return p > 0 && p < 50; }).length,
        쓰러진_인형: all.filter(function (k) { return pct(ds[k]) <= 0; }).length,
        동행: M.withList(u).map(function (k) { const d = ds[k]; return d ? { 이름: M.nickOf(d), 종: M.spName(d.sp), 등급: M.stats(d).g, 체력: pct(d), 먹이: M.fullPct(d), 교감: M.bondOf(d) } : null; }).filter(Boolean),
        주머니: { 포옹리본: M.bagHas(M.ITEM.RIBBON, u), 간식: M.bagHas(M.ITEM.SNACK, u), 청주: M.bagHas(M.ITEM.WINE, u), 메밀묵: M.bagHas(M.ITEM.JELLY, u) }
    };
}
function askAi(who, mode, ms) {
    const u = u_();
    return new Promise(function (resolve) {
        let done = false;
        const fin = function (v) { if (!done) { done = true; resolve(v); } };
        setTimeout(function () { fin(null); }, ms || 15000);
        try {
            fetch('/api/dokkaebi', { method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ who: who, mode: mode, code: u && u.code, name: u && u.name, recent: recentOf(who), ctx: stateCtx() }) })
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (j) { const l = (j && Array.isArray(j.lines) && j.lines.length) ? j.lines.map(String) : null; if (l) remember(who, l); fin(l); })
                .catch(function () { fin(null); });
        } catch (e) { fin(null); }
    });
}
// 누를 때 — 걸어가는 동안 미리 부른다 (doll-scene.js 가 누른 순간 prefetch)
const PRE = {};
const WHO_OF = { sew: 'sew', shop: 'shop', trade: 'trade', mask: 'mask', nap: 'nap' };
function prefetch(act) { const w = WHO_OF[act]; if (!w || !tutDone()) return; PRE[w] = { at: Date.now(), p: askAi(w, 'greet', 9000) }; }
function greetLines(who, fallback) {
    const pre = PRE[who];
    delete PRE[who];
    const p = (pre && Date.now() - pre.at < 20000) ? pre.p : askAi(who, 'greet', 9000);
    return p.then(function (l) { return l || [pick(fallback)]; });
}
// 말 건네고 고르기 — 인사는 AI (마지막 마디를 물음으로), 두 번째부터는 짧게
async function greetAsk(S, who, name, fallback, again, opts, first) {
    if (!first) return S.ask(name, pick(again), opts);
    try { S.sys('(' + name + D().josa(name, '이') + ' 김서방을 살펴보는 중……)', 9000); } catch (e) { }
    const l = await greetLines(who, fallback);
    try { S.sys('', 10); } catch (e) { }
    if (l.length > 1) await S.talk(l.slice(0, -1), name);
    return S.ask(name, l[l.length - 1], opts);
}
async function aiTalk(S, who, name, fallback) {
    try { S.sys('(' + name + D().josa(name, '이') + ' 무슨 말을 할지 고르는 중……)', 15000); } catch (e) { }
    let lines = await askAi(who, 'chat', 15000);
    try { S.sys('', 10); } catch (e) { }
    if (!lines) lines = pick(fallback);
    await S.talk(lines, name);
}

function needTut(S) {
    if (tutDone()) return false;
    S.talk([{ sys: 1, t: '도깨비 공방 앞에서 튜토리얼을 먼저 마쳐 주세요.' }]);
    return true;
}

// ==========================================
// 수선소
// ==========================================
async function sew(S) {
    const WHO = '수선소 도깨비';
    if (needTut(S)) return;
    for (let n = 0; ; n++) {
        const i = await greetAsk(S, 'sew', WHO, ['……어서 와. 봉제인형을 고치러 왔어?', '실밥이 뜯어졌다고……? 어디 보자. 음, 이 정도면 금방 고칠 수 있겠네…….', '그런데…… 혹시 청주랑 메밀묵 좀 가져다줄 수 있을까……? 내가 그걸 참 좋아하거든…….'],
            ['……또 필요한 게 있어?', '……다른 건?'], ['봉제인형 수선하기', '그냥 대화하기', '돌아가기'], n === 0);
        if (i === 0) { const ok = await sewUi(); if (ok) await S.talk(['……다 됐어. 터진 실밥도 다시 꿰매고, 솜도 잘 정리해 뒀어.', '이제 괜찮을 거야…… 소중히 데리고 다녀 줘.'], WHO); return; }
        if (i === 1) { await aiTalk(S, 'sew', WHO, SEW_TALK); continue; }
        return;
    }
}
// PP — 끼운 기술(과 기록에 남은 기술)을 모두 가득 · 끝없는 것(발버둥)은 뺀다
function ppFull(d) {
    const SK = window.D2SK, pp = Object.assign({}, (d && d.pp) || {});
    if (!SK) return pp;
    const nos = SK.equipped(d).map(String);
    Object.keys(pp).forEach(function (k) { if (nos.indexOf(k) < 0) nos.push(k); });
    nos.forEach(function (k) { const s = SK.get(Number(k)); if (s && s.pp != null) pp[k] = SK.ppMax(Number(k)); });
    return pp;
}
function ppLow(d) {
    const SK = window.D2SK;
    if (!SK || !d) return false;
    return SK.equipped(d).some(function (no) { const s = SK.get(no); return s && s.pp != null && SK.ppOf(d, no) < SK.ppMax(no); });
}
function sewUi() {
    return new Promise(function (resolve) {
        const M = D(), u = u_();
        const ds = M.dolls(u), w = M.withList(u);
        const ids = w.concat(M.boxList(u)).filter(function (id) { return ds[id]; });
        const sel = {};
        // 고칠 데가 있나 — 체력이 닳았거나 · 상태이상이 걸렸거나 · PP 가 줄었거나
        const hurt = function (id) { const d = ds[id]; return M.hpOf(d) < M.stats(d).max || !!(d.st && d.st.k) || ppLow(d); };
        let dim = null, done = false;
        const paint = function () {
            const n = Object.keys(sel).filter(function (k) { return sel[k]; }).length;
            const allN = ids.filter(hurt).length;
            const have = { '🍶 청주': M.bagHas('🍶 청주', u), '🥣 메밀묵': M.bagHas('🥣 메밀묵', u) };
            const html = '<h3>✂ 봉제인형 수선</h3>'
                + '<div class="sub">인형 하나에 🍶 청주 ' + FIX['🍶 청주'] + ' · 🥣 메밀묵 ' + FIX['🥣 메밀묵'] + '. 체력 · PP 가 가득 차고 상태이상이 풀립니다 (외형 · 능력치 · 기록은 그대로).<br>가진 것 — 🍶 ' + have['🍶 청주'] + ' · 🥣 ' + have['🥣 메밀묵'] + '</div>'
                + (ids.length ? ids.map(function (id) {
                    const d = ds[id], h = hurt(id);
                    return '<label class="gb-row" style="' + (h ? '' : 'opacity:.45') + '"><input type="checkbox" data-id="' + id + '"' + (sel[id] ? ' checked' : '') + (h ? '' : ' disabled') + '>' + icon(d.sp, 36)
                        + '<div class="tx">' + dollLine(d) + hpBar(d) + '</div><span style="font-size:9px;color:#8f84b5">' + (w.indexOf(id) >= 0 ? '동행' : '보관') + '</span></label>';
                }).join('') : '<div class="sub">고칠 인형이 없습니다.</div>')
                + '<div class="sub" style="margin-top:8px">고른 것 ' + n + '마리 — 🍶 ' + n * FIX['🍶 청주'] + ' · 🥣 ' + n * FIX['🥣 메밀묵'] + ' 필요 · 고칠 인형 모두(' + allN + '마리)는 🍶 ' + allN + ' · 🥣 ' + allN + '</div>'
                + '<div class="gb-btns"><button class="gb-btn pri" data-k="one"' + (n ? '' : ' disabled') + '>수선하기</button><button class="gb-btn" data-k="all"' + (allN ? '' : ' disabled') + '>일괄 수선</button><button class="gb-btn" data-k="x">취소</button></div>';
            if (!dim) dim = panel(html, function () { if (!done) resolve(false); });
            else dim.firstChild.innerHTML = html;
            Array.prototype.forEach.call(dim.querySelectorAll('input[type=checkbox]'), function (c) { c.onchange = function () { sel[c.dataset.id] = c.checked; paint(); }; });
            Array.prototype.forEach.call(dim.querySelectorAll('.gb-btn'), function (b) { b.onclick = function () { go(b.dataset.k); }; });
        };
        const go = function (k) {
            if (k === 'x') { dim._close(); return; }
            const list = (k === 'all') ? ids.filter(hurt) : Object.keys(sel).filter(function (id) { return sel[id] && hurt(id); });
            if (!list.length) return;
            const nW = list.length * FIX['🍶 청주'], nJ = list.length * FIX['🥣 메밀묵'];
            const hW = M.bagHas('🍶 청주', u), hJ = M.bagHas('🥣 메밀묵', u);
            if (hW < nW || hJ < nJ) {
                alert_('재료가 모자랍니다.\n\n필요 — 🍶 청주 ' + nW + ' · 🥣 메밀묵 ' + nJ + '\n가진 것 — 🍶 ' + hW + ' · 🥣 ' + hJ + '\n\n잡화점에서 포인트로 살 수 있습니다.');
                return;
            }
            M.bagAdd('🍶 청주', -nW, u);
            M.bagAdd('🥣 메밀묵', -nJ, u);
            list.forEach(function (id) { M.patchDoll(id, { hp: M.stats(ds[id]).max, st: null, pp: ppFull(ds[id]) }, u); });
            M.log('[👺 수선소] 봉제인형 ' + list.length + '마리를 고쳤습니다 (🍶 -' + nW + ' · 🥣 -' + nJ + ').', u);
            M.saveHist();
            done = true;
            dim._close();
            resolve(true);
        };
        paint();
    });
}

// ==========================================
// 잡화점
// ==========================================
async function shop(S) {
    const WHO = '잡화점 도깨비';
    if (needTut(S)) return;
    for (let n = 0; ; n++) {
        const i = await greetAsk(S, 'shop', WHO, SHOP_TALK.map(function (x) { return x[0]; }), ['또 뭐 필요한 거 있으쇼?', '자자, 더 보시겠수?'], ['물건 구매하기', '그냥 대화하기', '돌아가기'], n === 0);
        if (i === 0) { const r = await shopUi(); if (r === 'ok') await S.talk([pick(['매번 고맙수다! 아주 좋은 물건을 고르셨구먼!', '잘 쓰고, 또 필요하면 들르쇼!'])], WHO); else if (r === 'poor') await S.talk([pick(['어이쿠, 김서방! 가진 돈이 좀 모자란 것 같은데?', '아쉽지만 외상은 안 되오. 우리도 먹고살아야 하지 않겠수!'])], WHO); return; }
        if (i === 1) { await aiTalk(S, 'shop', WHO, SHOP_TALK); continue; }
        return;
    }
}
// 망상 홈쇼핑 칸(#shop-dream)을 잡화점 판 안으로 옮겼다가(active 로 — 그 안의 칸들이 저마다 그린다) 닫으면 제자리로
const DS = { home: null, next: null, el: null };
function dreamPut(host) {
    const sd = DS.el || document.getElementById('shop-dream');
    if (!sd) return;
    if (host) {
        if (!DS.home) { DS.home = sd.parentNode; DS.next = sd.nextSibling; DS.el = sd; }
        host.appendChild(sd);
        sd.classList.add('active', 'in-gong');
        try { if (typeof window.renderDream === 'function') window.renderDream(); } catch (e) { }
    } else if (DS.home) {
        sd.classList.remove('active', 'in-gong');
        try { DS.home.insertBefore(sd, DS.next && DS.next.parentNode === DS.home ? DS.next : null); } catch (e) { DS.home.appendChild(sd); }
        DS.home = null; DS.next = null; DS.el = null;
    }
}
function shopUi() {
    return new Promise(function (resolve) {
        const M = D(), u = u_();
        const qty = {};
        Object.keys(PRICE).forEach(function (k) { qty[k] = 1; });
        let dim = null, out = null;
        const groups = [
            ['봉제인형 용품 — 💤 꿈결', ['🎀 포옹 리본', '🧶 솜뭉치 간식']],
            ['수선 재료 — 포인트', ['🍶 청주', '🥣 메밀묵']]
        ];
        // ★ 먹이 — 사택에서 팔던 다섯 가지를 여기로 (2026-11-08 사용자 「이름만 바꿔 잡화점으로 · 옛 펫 외형 쓰는 사람은 사택에 그대로」)
        //   포인트로 · 한 번에 하나 · pet-food.js 주머니(u.petFood)에 든다 — 인형 돌보기 · 일괄 먹이에서 쓴다
        const PF = window.PETFOOD;
        const foodRows = function () {
            if (!PF) return '';
            return '<div style="font-size:10.5px;color:#ffcf8f;margin:10px 0 2px">먹이 — 포인트 <span style="color:#8f84b5;font-weight:normal">(포만도를 채운다 · 사흘이 100)</span></div>' + PF.LIST.map(function (f) {
                const can = (Number(u.points) || 0) >= f.p;
                const eff = (f.fill == null || f.fill >= 1 ? '포만도 가득' : '포만도 +' + Math.round(f.fill * 100)) + (f.cut < 0 ? ' · 쉬는 시간 전부' : f.cut ? ' · 쉬는 시간 ' + Math.round(f.cut / 60000) + '분' : '') + (f.up ? ' · 다음 탐사 +' + Math.round(f.up * 100) + '%' : '') + (f.bond === false ? ' · 교감 없음' : ' · 교감');
                return '<div class="gb-row"><div class="tx"><b>' + esc(PF.name(f.n, u)) + '</b> <span style="font-size:10px;color:#8f84b5">· 가진 것 ' + PF.have(f.n, u) + '</span><div>' + esc(eff) + '</div><div>' + esc(PF.desc ? PF.desc(f.n, u) : '') + '</div><div>' + fmtN(f.p) + ' P</div></div>'
                    + '<button class="gb-btn pri" data-food="' + esc(f.n) + '">산다</button></div>';
            }).join('');
        };
        const paint = function () {
            const html = '<h3>🧺 잡화점</h3><div class="sub">가진 것 — 💤 꿈결 <b style="color:#c9a8ff">' + fmtN(dream(u)) + ' D</b> · 포인트 <b style="color:#ffcf8f">' + fmtN(u.points) + ' P</b><br>꿈결과 포인트는 서로 대신할 수 없습니다.</div>'
                + groups.map(function (g) {
                    return '<div style="font-size:10.5px;color:#ffcf8f;margin:10px 0 2px">' + esc(g[0]) + '</div>' + g[1].map(function (k) {
                        const pr = PRICE[k], tot = pr.p * qty[k];
                        const can = pr.c === 'D' ? dream(u) >= tot : (Number(u.points) || 0) >= tot;
                        return '<div class="gb-row"><div class="tx"><b>' + esc(k) + '</b> <span style="font-size:10px;color:#8f84b5">· 가진 것 ' + M.bagHas(k, u) + '</span><div>' + esc(M.ITEM_DESC[k] || '') + '</div><div>' + fmtN(pr.p) + ' ' + pr.c + ' · ' + qty[k] + '개 = <b style="color:' + (can ? '#9fe8a8' : '#ff8f8f') + '">' + fmtN(tot) + ' ' + pr.c + '</b></div></div>'
                            + '<div class="gb-q"><button data-q="' + esc(k) + '" data-d="-1">−</button><span>' + qty[k] + '</span><button data-q="' + esc(k) + '" data-d="1">+</button></div>'
                            + '<button class="gb-btn pri" data-buy="' + esc(k) + '">산다</button></div>';
                    }).join('');
                }).join('')
                + foodRows()
                // ★ 봉제인형 아이템 20종 — 꿈결 (인형 전투 2차 · d2-items.js · 6단계 2026-11-10 · 기획 「아이템」 10 「잡화점에 아이템 카테고리」)
                + '<div style="font-size:10.5px;color:#ffcf8f;margin:10px 0 2px">🧷 봉제인형 아이템 — 💤 꿈결</div>'
                + '<div class="gb-row"><div class="tx"><b>HP 회복 · PP 회복 · 상태 치료 · 기절 회복 · 도핑 · 훈련 보조 — 20종</b><div>20~100 꿈결 · 산 것은 소지품에 · 전투 중에도 쓴다 (한 턴)</div></div><button class="gb-btn pri" data-k="d2items">목록 보기</button></div>'
                // ★ 망상 홈쇼핑에 있던 것 전부 — 치료 · 환몽알 · 돌봄 · 속성 룬 · 방석 (#shop-dream 칸을 이 아래에 들인다 · 2026-11-07) · ✗ 장비는 뺐다 (2026-11-10)
                + '<div style="font-size:10.5px;color:#ffcf8f;margin:14px 0 4px">🩹 치료 · 🥚 환몽알 · 돌봄 · 💠 속성 룬 · 🏠 방석</div><div class="gb-host"></div>'
                + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
            if (!dim) dim = panel(html, function () { dreamPut(null); resolve(out); });
            else dim.firstChild.innerHTML = html;
            dreamPut(dim.querySelector('.gb-host'));
            Array.prototype.forEach.call(dim.querySelectorAll('[data-q]'), function (b) { b.onclick = function () { const k = b.dataset.q; qty[k] = Math.max(1, Math.min(99, qty[k] + Number(b.dataset.d))); paint(); }; });
            Array.prototype.forEach.call(dim.querySelectorAll('[data-buy]'), function (b) { b.onclick = function () { buy(b.dataset.buy); }; });
            Array.prototype.forEach.call(dim.querySelectorAll('[data-food]'), function (b) { b.onclick = function () { buyFood(b.dataset.food); }; });
            dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
            const d2b = dim.querySelector('[data-k=d2items]'); if (d2b) d2b.onclick = function () { if (window.D2IT) window.D2IT.shopOpen('shop', function () { out = out || 'ok'; paint(); }); };
        };
        // 먹이 — 포인트로 하나 (pet-food.js petFoodBuy 와 같은 셈 · 기록만 잡화점으로)
        const buyFood = function (k) {
            if (busy || !PF) return;
            const f = PF.BY[k]; if (!f) return;
            try { if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('격리 중에는 살 수 없습니다.'); return; } } catch (e) { }
            if ((Number(u.points) || 0) < f.p) { out = 'poor'; dim._close(); return; }
            u.points = (Number(u.points) || 0) - f.p;
            PF.add(f.n, 1);
            M.log('[👺 잡화점] ' + PF.name(f.n, u) + ' (-' + fmtN(f.p) + ' P)', u);
            try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            out = 'ok'; paint();
        };
        let busy = false;
        const buy = function (k) {
            if (busy) return;
            const pr = PRICE[k], n = qty[k], tot = pr.p * n;
            try { if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('격리 중에는 살 수 없습니다.'); return; } } catch (e) { }
            if (pr.c === 'P') {
                if ((Number(u.points) || 0) < tot) { out = 'poor'; dim._close(); return; }
                u.points = (Number(u.points) || 0) - tot;
                M.bagAdd(k, n, u);
                M.log('[👺 잡화점] ' + k + ' ×' + n + ' (-' + fmtN(tot) + ' P)', u);
                try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
                try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
                out = 'ok'; paint();
                return;
            }
            if (dream(u) < tot) { out = 'poor'; dim._close(); return; }
            const d = db_();
            if (!d) { u.kroom = u.kroom || {}; u.kroom.dream = dream(u) - tot; M.bagAdd(k, n, u); out = 'ok'; paint(); return; }
            busy = true;
            d.ref('users/' + u.code + '/kroom/dream').transaction(function (v) {
                const c = Math.max(0, Math.floor(Number(v) || 0));
                if (c < tot) return;
                return c - tot;
            }).then(function (r) {
                busy = false;
                if (!r || !r.committed) { out = 'poor'; dim._close(); return; }
                if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {};
                u.kroom.dream = Math.max(0, Math.floor(Number(r.snapshot.val()) || 0));
                M.bagAdd(k, n, u);
                M.log('[👺 잡화점] ' + k + ' ×' + n + ' (-' + fmtN(tot) + ' D 꿈결)', u);
                M.saveHist();
                try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
                out = 'ok'; paint();
            }).catch(function () { busy = false; alert_('사지 못했습니다. 다시 해 주세요.'); });
        };
        paint();
    });
}

// ==========================================
// 도감
// ==========================================
function dex(S) {
    const M = D(), u = u_();
    let tab = 0;
    let dim = null;
    const paint = function () {
        const dx = M.dex(u), dk = M.darkDex(u);
        let body = '';
        if (tab === 0) {
            const seen = Object.keys(dx).filter(function (k) { return dx[k] && dx[k].s; }).length;
            const got = Object.keys(dx).filter(function (k) { return dx[k] && dx[k].c; }).length;
            body = '<div class="sub">본 것 ' + seen + ' · 잡은 것 ' + got + ' / ' + window.PET.LIST.length + ' — 따라쟁이가 흉내 낸 모습이 적힙니다.</div><div class="gb-dex">'
                + window.PET.LIST.map(function (p) {
                    const e = dx[p.i] || {};
                    const s = !!e.s, c = !!e.c;
                    return '<div class="c"><div style="display:flex;justify-content:center;' + (s ? '' : 'filter:brightness(0) opacity(.5)') + '">' + '<div style="' + M.spriteCss(p.i, 44, false, M.artOld()) + '"></div></div>'
                        + '<div class="no">No.' + String(p.i).padStart(2, '0') + (c ? ' 🎀' : '') + '</div><div>' + (s ? esc(p.n) : '???') + '</div>'
                        + (c ? '<div class="no">' + (e.n || 1) + '마리</div>' : '') + '</div>';
                }).join('') + '</div>';
        } else {
            const seen = Object.keys(dk).length;
            body = '<div class="sub">만난 괴담 ' + seen + ' / ' + M.MON.length + ' — 잡을 수 없습니다. 펫 동행 어둠에서 마주치면 적힙니다.</div><div class="gb-dex" style="grid-template-columns:repeat(4,1fr)">'
                + M.MON.map(function (m) {
                    const s = !!dk[m.i];
                    return '<div class="c"><div style="display:flex;justify-content:center;' + (s ? '' : 'filter:brightness(0) opacity(.5)') + '"><div style="' + M.monCss(m.i, 56) + '"></div></div>'
                        + '<div>' + (s ? esc(m.n) : '???') + '</div><div class="no">' + (s ? esc(m.k) + ' ' + (M.ATTR[m.a] || {}).e : '') + '</div></div>';
                }).join('') + '</div>';
        }
        const html = '<h3>📖 도감</h3><div class="gb-tab"><button class="gb-btn' + (tab === 0 ? ' pri' : '') + '" data-t="0">봉제인형 도감</button><button class="gb-btn' + (tab === 1 ? ' pri' : '') + '" data-t="1">어둠 · 재난 도감</button></div>'
            + body + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
        if (!dim) dim = panel(html); else dim.firstChild.innerHTML = html;
        Array.prototype.forEach.call(dim.querySelectorAll('[data-t]'), function (b) { b.onclick = function () { tab = Number(b.dataset.t); paint(); }; });
        dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
    };
    paint();
}

// ==========================================
// 보관소 — 펫 박스
// ==========================================
const BX = { a: null, page: 0, multi: false, sel: {}, q: '', fav: false };
//   자리 (314 × 685 그림 기준) — 위 판 41~271 × 146~423 · 아래 판 42~272 × 459~564
const BL = {
    crop: [130, 580], cropT: [130, 432], cropB: [448, 580],      // 위 판(보관함) · 아래 판(동행)
    title: [76, 168, 238, 194], prev: [50, 166, 78, 197], next: [235, 166, 263, 197],
    grid: { x: 50, y: 202, cw: 54, ch: 54, gap: 0 },
    tb: [[50, 368, 116, 388], [124, 368, 190, 388], [198, 368, 264, 388]],
    search: [50, 395, 230, 415], star: [234, 395, 264, 415],
    withT: [42, 462, 272, 476], with: [[62, 480, 122, 552], [127, 480, 187, 552], [192, 480, 252, 552]]
};
function sortedBox() {
    const M = D(), u = u_(), ds = M.dolls(u);
    const mode = u.dollSort || 'cap';
    const ids = M.boxList(u);
    ids.sort(function (a, b) {
        const A = ds[a], B2 = ds[b];
        if (mode === 'dex') return (A.sp - B2.sp) || ((A.at || 0) - (B2.at || 0));
        if (mode === 'own') return ((A.ord != null ? A.ord : A.at) - (B2.ord != null ? B2.ord : B2.at));
        return (A.at || 0) - (B2.at || 0);
    });
    return ids;
}
function filtered(ids) {
    const M = D(), ds = M.dolls();
    const q = BX.q.trim();
    return ids.filter(function (id) {
        const d = ds[id];
        if (BX.fav && !d.fav) return false;
        if (!q) return true;
        return (M.nickOf(d) + ' ' + M.spName(d.sp)).indexOf(q) >= 0;
    });
}
function boxOpen() {
    css();
    if (BX.a) boxClose();
    const wrap = document.createElement('div');
    wrap.className = 'db-all';
    wrap.innerHTML = '<div class="db-wrap s"><div class="db-sw">' + (D().artSwitchHtml ? D().artSwitchHtml() : '') + '</div></div>'
        + '<div class="db-wrap t"><div class="db-box t"><img class="bg" src="doll/box.webp" alt=""></div></div>'
        + '<div class="db-wrap b"><div class="db-box b"><img class="bg" src="doll/box.webp" alt=""></div></div>';
    document.body.appendChild(wrap);
    BX.a = wrap; BX.multi = false; BX.sel = {};
    wrap.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
    try { if (D().artSwitchWire) D().artSwitchWire(wrap, function () { boxPaint(); }); } catch (e) { }
    boxPaint();
    // 바깥(위쪽 맵)을 누르면 닫는다
    const dim = document.createElement('div');
    dim.style.cssText = 'position:fixed;inset:0;z-index:99996;background:rgba(5,3,10,.35)';
    dim.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); boxClose(); });
    document.body.appendChild(dim);
    BX.dim = dim;
}
function boxClose() {
    if (BX.a) BX.a.remove();
    if (BX.dim) BX.dim.remove();
    BX.a = null; BX.dim = null;
    try { if (window.DOLLSCENE && DOLLSCENE.run()) DOLLSCENE.makeDoll(); } catch (e) { }
}
function boxScale() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const h0 = (BL.cropT[1] - BL.cropT[0]) + (BL.cropB[1] - BL.cropB[0]);
    return Math.min(Math.min(vw, 460) / 314, (vh * 0.68) / h0);
}
function cropOf(r) { return r[1] >= BL.cropB[0] ? BL.cropB : BL.cropT; }
function bx(r, s, extra) {
    return 'left:' + Math.round(r[0] * s) + 'px;top:' + Math.round((r[1] - cropOf(r)[0]) * s) + 'px;width:' + Math.round((r[2] - r[0]) * s) + 'px;height:' + Math.round((r[3] - r[1]) * s) + 'px;' + (extra || '');
}
function boxPaint() {
    if (!BX.a) return;
    const M = D(), u = u_(), ds = M.dolls(u);
    const s = boxScale();
    const box = BX.a;
    const swRow = BX.a.querySelector('.db-sw'); if (swRow) swRow.style.width = Math.round(314 * s) + 'px';
    [['t', BL.cropT], ['b', BL.cropB]].forEach(function (pc) {
        const el = BX.a.querySelector('.db-box.' + pc[0]), cr = pc[1];
        el.style.width = Math.round(314 * s) + 'px'; el.style.height = Math.round((cr[1] - cr[0]) * s) + 'px';
        el.style.overflow = 'hidden';
        const bg = el.querySelector('.bg');
        bg.style.width = Math.round(314 * s) + 'px'; bg.style.height = Math.round(685 * s) + 'px'; bg.style.top = Math.round(-cr[0] * s) + 'px';
    });
    Array.prototype.forEach.call(box.querySelectorAll('.a'), function (e) { e.remove(); });
    const add = function (r, cls, html, extra) {
        const e = document.createElement('div');
        e.className = 'a ' + (cls || '');
        e.style.cssText = bx(r, s, extra);
        if (html != null) e.innerHTML = html;
        BX.a.querySelector('.db-box.' + (cropOf(r) === BL.cropB ? 'b' : 't')).appendChild(e);
        return e;
    };
    const all = filtered(sortedBox());
    const pages = Math.max(1, Math.ceil(all.length / M.BOX_SIZE), M.BOX_N);
    BX.page = Math.max(0, Math.min(pages - 1, BX.page));
    const cnt = M.boxList(u).length;
    add(BL.title, '', '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-weight:bold;color:#3a2d5c;font-size:' + (11 * s) + 'px">보관함 ' + (BX.page + 1) + ' <span style="font-size:' + (7.5 * s) + 'px;color:#6d5aa0;margin-left:4px">(' + cnt + '/' + M.BOX_MAX + ')</span></div>');
    add(BL.prev, '', '', 'cursor:pointer').onclick = function () { BX.page = (BX.page - 1 + pages) % pages; boxPaint(); };
    add(BL.next, '', '', 'cursor:pointer').onclick = function () { BX.page = (BX.page + 1) % pages; boxPaint(); };
    // 칸
    const g = BL.grid;
    const slice = all.slice(BX.page * M.BOX_SIZE, BX.page * M.BOX_SIZE + M.BOX_SIZE);
    for (let i = 0; i < M.BOX_SIZE; i++) {
        const cx = g.x + (i % 4) * g.cw, cy = g.y + Math.floor(i / 4) * g.ch;
        const id = slice[i];
        const e = add([cx + 2, cy + 2, cx + g.cw - 2, cy + g.ch - 2], 'db-slot' + (id && BX.sel[id] ? ' sel' : ''));
        e.dataset.slot = 'box:' + (BX.page * M.BOX_SIZE + i);
        if (!id) continue;
        e.dataset.id = id;
        slotHtml(e, ds[id], s, 40);
    }
    // ① ② ③
    const mode = u.dollSort || 'cap';
    const modeN = { cap: '포획 순', dex: '도감 번호', own: '사용자 지정' }[mode];
    if (!BX.multi) {
        add(BL.tb[0], 'db-tbtn', '① 일괄 먹이', 'font-size:' + (8.5 * s) + 'px').onclick = feedAll;
        add(BL.tb[1], 'db-tbtn', '② 펫 선택', 'font-size:' + (8.5 * s) + 'px').onclick = function () { BX.multi = true; BX.sel = {}; boxPaint(); };
        add(BL.tb[2], 'db-tbtn', '③ ' + modeN, 'font-size:' + (8 * s) + 'px').onclick = function () {
            const nx = { cap: 'dex', dex: 'own', own: 'cap' }[mode];
            u.dollSort = nx; M.put({ dollSort: nx }, u); boxPaint();
        };
    } else {
        const n = Object.keys(BX.sel).filter(function (k) { return BX.sel[k]; }).length;
        add(BL.tb[0], 'db-tbtn', '놓아주기 ' + n, 'font-size:' + (8.5 * s) + 'px;background:#e8b9c9').onclick = multiRelease;
        add(BL.tb[1], 'db-tbtn', '옮기기', 'font-size:' + (8.5 * s) + 'px').onclick = multiMove;
        add(BL.tb[2], 'db-tbtn', '취소', 'font-size:' + (8.5 * s) + 'px').onclick = function () { BX.multi = false; BX.sel = {}; boxPaint(); };
    }
    const sr = add(BL.search, '', '<input placeholder="🔍 이름 · 종류 검색" value="' + esc(BX.q) + '" style="width:100%;height:100%;box-sizing:border-box;border-radius:7px;border:1.5px solid #6b56a0;background:#efe9fb;color:#2a2140;font-size:' + (8.5 * s) + 'px;padding:0 ' + (6 * s) + 'px">');
    const inp = sr.querySelector('input');
    inp.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
    inp.oninput = function () { BX.q = inp.value; clearTimeout(BX.qt); BX.qt = setTimeout(function () { const pos = inp.selectionStart; boxPaint(); const ni = BX.a && BX.a.querySelector('input'); if (ni) { ni.focus(); try { ni.setSelectionRange(pos, pos); } catch (e) { } } }, 350); };
    add(BL.star, 'db-tbtn' + (BX.fav ? ' on' : ''), '★', 'font-size:' + (10 * s) + 'px').onclick = function () { BX.fav = !BX.fav; boxPaint(); };
    // 동행
    add(BL.withT, '', '<div style="text-align:center;font-weight:bold;color:#3a2d5c;font-size:' + (9 * s) + 'px">동행 중인 인형 (' + M.withList(u).length + '/' + M.PARTY_MAX + ')</div>');
    const w = M.withList(u);
    BL.with.forEach(function (r, i) {
        const id = w[i];
        const e = add(r, 'db-slot' + (id && BX.sel[id] ? ' sel' : ''));
        e.dataset.slot = 'with:' + i;
        if (!id) { e.innerHTML = '<div style="margin:auto;color:#8f84b5;font-size:' + (8 * s) + 'px">빈 칸</div>'; return; }
        e.dataset.id = id;
        slotHtml(e, ds[id], s, 46);
    });
    bindDrag(box, s);
}
function slotHtml(e, d, s, px) {
    const M = D();
    const mx = M.stats(d).max, h = M.hpOf(d), p = h / mx, f = fullOf(d);
    e.innerHTML = '<div class="hb"><i style="width:' + Math.round(p * 100) + '%;background:' + (p > 0.5 ? '#4cd964' : (p > 0.2 ? '#ffcc00' : '#ff3b30')) + '"></i></div>'
        + '<div class="hb2"><i style="width:' + f + '%"></i></div>'
        + (d.fav ? '<div class="st">★</div>' : '')
        + '<div style="' + M.spriteCss(d.sp, Math.round(px * s * 0.95), false, M.artOld()) + 'pointer-events:none' + (h <= 0 ? ';filter:grayscale(1) opacity(.6)' : '') + '"></div>'
        + '<div class="nm" style="font-size:' + (6.5 * s) + 'px;' + (f < 30 ? 'color:#c0392b' : '') + '">' + esc(M.nickOf(d)) + '</div>';
}
// 누르기 · 길게 눌러 끌기
function bindDrag(box, s) {
    Array.prototype.forEach.call(box.querySelectorAll('.db-slot[data-id]'), function (e) {
        let t0 = 0, timer = null, drag = null, sx = 0, sy = 0, moved = false;
        e.onpointerdown = function (ev) {
            ev.stopPropagation();
            t0 = Date.now(); sx = ev.clientX; sy = ev.clientY; moved = false;
            try { e.setPointerCapture(ev.pointerId); } catch (x) { }
            if (BX.multi) return;
            timer = setTimeout(function () {
                drag = document.createElement('div');
                drag.className = 'db-ghost';
                drag.innerHTML = '<div style="' + D().spriteCss(D().dolls()[e.dataset.id].sp, Math.round(46 * s), false, D().artOld()) + '"></div>';
                document.body.appendChild(drag);
                place(ev.clientX, ev.clientY);
            }, 350);
        };
        const place = function (x, y) { if (drag) { drag.style.left = (x - 23 * s) + 'px'; drag.style.top = (y - 23 * s) + 'px'; } };
        e.onpointermove = function (ev) {
            if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 8) { moved = true; if (!drag) { clearTimeout(timer); } }
            if (!drag) return;
            place(ev.clientX, ev.clientY);
            Array.prototype.forEach.call(box.querySelectorAll('.db-slot.drop'), function (x) { x.classList.remove('drop'); });
            const tg = slotAt(ev.clientX, ev.clientY);
            if (tg && tg !== e) tg.classList.add('drop');
        };
        e.onpointerup = function (ev) {
            clearTimeout(timer);
            if (drag) {
                drag.remove(); drag = null;
                const tg = slotAt(ev.clientX, ev.clientY);
                if (tg && tg !== e) dropOn(e.dataset.id, e.dataset.slot, tg.dataset.slot, tg.dataset.id);
                else boxPaint();
                return;
            }
            if (moved) return;
            if (BX.multi) { BX.sel[e.dataset.id] = !BX.sel[e.dataset.id]; boxPaint(); return; }
            dollMenu(e.dataset.id);
        };
        e.onpointercancel = function () { clearTimeout(timer); if (drag) { drag.remove(); drag = null; } };
    });
    // 빈 칸도 놓을 자리
    Array.prototype.forEach.call(box.querySelectorAll('.db-slot:not([data-id])'), function (e) { e.onpointerdown = function (ev) { ev.stopPropagation(); }; });
}
function slotAt(x, y) {
    const els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
    for (let i = 0; i < els.length; i++) { const s = els[i] && els[i].closest && els[i].closest('.db-slot'); if (s) return s; }
    return null;
}
//   from 의 인형을 to 칸에 놓는다 — 동행 칸이면 넣거나 바꾸고, 보관함이면 순서를 바꾼다 (정렬은 「사용자 지정」으로)
function dropOn(id, fromSlot, toSlot, toId) {
    const M = D(), u = u_();
    const w = M.withList(u).slice();
    const fw = fromSlot.indexOf('with:') === 0, tw = toSlot.indexOf('with:') === 0;
    if (tw) {
        const ti = Number(toSlot.split(':')[1]);
        if (fw) {                                         // 동행끼리 자리 바꾸기
            const fi = w.indexOf(id);
            if (toId) { w[fi] = toId; w[ti] = id; } else { w.splice(fi, 1); w.push(id); }
        } else if (toId) {                                // 보관함 → 찬 동행 칸 : 서로 바꾼다
            w[w.indexOf(toId)] = id;
            const ds = M.dolls(u); ds[toId].ord = ds[id].ord != null ? ds[id].ord : ds[id].at;
            M.patchDoll(toId, { ord: ds[toId].ord }, u);
        } else {                                          // 빈 동행 칸
            if (w.length >= M.PARTY_MAX) { alert_('동행은 세 마리까지입니다.'); boxPaint(); return; }
            w.push(id);
        }
        M.setWith(w, u);
        boxPaint();
        return;
    }
    // 보관함 칸으로
    const ti = Number(toSlot.split(':')[1]);
    let list = sortedBox();
    if (fw) {
        if (toId && w.indexOf(toId) < 0) { w[w.indexOf(id)] = toId; }
        else w.splice(w.indexOf(id), 1);
        M.setWith(w, u);
        list = sortedBox();
    }
    const cur = list.indexOf(id);
    if (cur >= 0) list.splice(cur, 1);
    list.splice(Math.min(ti, list.length), 0, id);
    reorder(list);
}
function reorder(list) {
    const M = D(), u = u_(), ds = M.dolls(u);
    const p = {};
    list.forEach(function (id, i) { if (ds[id]) { ds[id].ord = i; p['pets/' + id + '/ord'] = i; } });
    u.dollSort = 'own';
    p.dollSort = 'own';
    M.put(p, u);
    boxPaint();
}
function feedAll() {
    // ★ 인형 돌보기의 먹이 주기와 같은 셈 (2026-11-08 사용자 「일괄 먹이 주기가 기존 먹이 주기와 기능이 같아야 — 지금은 따로 두 번 줘야」)
    //   먹이(사택 · 물 만 밥 … 특제 도시락)는 pet-food.js 의 feed 를 한 마리씩 · 🧶 솜뭉치 간식(잡화점)은 포만도 가득 + 교감.
    //   포만도(사흘 시계)가 가득한 인형은 건너뛰고, 배고픈 인형부터 가진 만큼 준다. 둘 다 같은 fedAt 을 미니 어디서 봐도 한 번이다.
    const M = D(), u = u_(), ds = M.dolls(u);
    const ids = Object.keys(ds);
    if (!ids.length) { alert_('먹일 인형이 없습니다.'); return; }
    const hungry = ids.filter(function (id) { return fullOf(ds[id]) < 100; })
        .sort(function (a, b) { return fullOf(ds[a]) - fullOf(ds[b]); });
    const PF = window.PETFOOD;      // pet-food.js — LIST · have · feed (창 없이 한 마리)
    const foods = (PF ? PF.LIST.map(function (f) { return { n: f.n, shown: PF.name ? PF.name(f.n, u) : f.n, fill: f.fill == null ? 1 : f.fill, bond: f.bond !== false, cut: f.cut, up: f.up, have: PF.have(f.n, u) }; }) : []).filter(function (f) { return f.have > 0; });
    const snack = M.bagHas(M.ITEM.SNACK, u);
    const row = function (k, n, have, eff) {
        return '<button class="gb-btn" data-f="' + esc(k) + '" style="display:flex;justify-content:space-between;align-items:center;width:100%;margin:0 0 5px;text-align:left"' + (hungry.length ? '' : ' disabled') + '>'
            + '<span>' + esc(n) + ' <span style="color:#a99ccc;font-size:10px">×' + have + '</span></span><span style="color:#9fd8ef;font-size:10px">' + esc(eff) + '</span></button>';
    };
    let list = foods.map(function (f) {
        const eff = (f.fill >= 1 ? '포만도 가득' : '포만도 +' + Math.round(f.fill * 100)) + (f.bond ? ' · 교감' : '') + (f.cut < 0 ? ' · 쉬는 시간 전부' : f.cut ? ' · 쉬는 시간 -' + Math.round(f.cut / 60000) + '분' : '') + (f.up ? ' · 다음 탐사 +' + Math.round(f.up * 100) + '%' : '');
        return row(f.n, f.shown, f.have, eff);
    }).join('');
    if (snack > 0) list += row(M.ITEM.SNACK, M.ITEM.SNACK, snack, '포만도 가득 · 교감');
    if (!list) list = '<div class="sub">가진 먹이가 없습니다 — ' + ((PF && PF.oldArt && PF.oldArt(u)) ? '먹이는 사택에서, 🧶 솜뭉치 간식은 잡화점에서' : '먹이도 🧶 솜뭉치 간식도 잡화점에서') + ' 삽니다.</div>';
    const html = '<h3>① 일괄 먹이 주기</h3>'
        + '<div class="sub">배고픈 인형 ' + hungry.length + '마리 <span style="color:#8f84b5">(포만도 100 미만 · 전체 ' + ids.length + '마리)</span><br>'
        + '고른 먹이를 배고픈 인형부터 한 마리에 하나씩, 가진 만큼 줍니다. 인형 돌보기에서 주는 것과 같습니다.</div>'
        + '<div style="margin:8px 0 4px">' + list + '</div>'
        + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
    const dim = panel(html);
    dim.style.zIndex = '99998';
    dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
    Array.prototype.forEach.call(dim.querySelectorAll('[data-f]'), function (b) {
        b.onclick = function () {
            const name = b.getAttribute('data-f');
            const have = (name === M.ITEM.SNACK) ? M.bagHas(M.ITEM.SNACK, u) : (PF ? PF.have(name, u) : 0);
            const n = Math.min(have, hungry.length);
            if (!n) return;
            if (!confirm(((name !== M.ITEM.SNACK && PF && PF.name) ? PF.name(name, u) : name) + ' ' + n + '개 — 배고픈 인형 ' + n + '마리에게 줄까요?' + (hungry.length > n ? '\n(' + (hungry.length - n) + '마리는 모자라 못 받습니다)' : ''))) return;
            let fed = [], miss = [];
            if (name === M.ITEM.SNACK) {
                const r = M.feed(hungry, u); fed = r.fed; if (r.short) miss.push(r.short + '마리는 간식이 모자라 못 받았습니다');
            } else {
                hungry.forEach(function (id) {
                    if (fed.length >= n) return;
                    const r = PF.feed(Number(id), name);
                    if (r && r.ok) fed.push(id); else if (r && r.why) miss.push(M.nickOf(ds[id]) + ' — ' + String(r.why).split('\n')[0]);
                });
                if (hungry.length > fed.length + miss.length) miss.push((hungry.length - fed.length - miss.length) + '마리는 먹이가 모자라 못 받았습니다');
            }
            dim._close();
            const shown = (name !== M.ITEM.SNACK && PF && PF.name) ? PF.name(name, u) : name;
            alert_(shown + ' — ' + fed.length + '마리에게 먹이를 주었습니다.' + (miss.length ? '\n' + miss.slice(0, 6).join('\n') : '') + '\n\n먹이를 받은 인형은 7일 동안 달아나지 않습니다.');
            M.log('[🧸 보관소] 일괄 먹이 — ' + shown + ' · ' + fed.length + '마리', u); M.saveHist();
            boxPaint();
        };
    });
}
function multiRelease() {
    const M = D(), u = u_(), ds = M.dolls(u);
    const ids = Object.keys(BX.sel).filter(function (k) { return BX.sel[k] && ds[k]; });
    const ok = ids.filter(function (id) { return !ds[id].fav; });
    if (!ids.length) return;
    if (!ok.length) { alert_('즐겨찾기(★)한 인형은 놓아줄 수 없습니다.'); return; }
    if (!confirm('고른 ' + ok.length + '마리를 놓아줄까요?' + (ok.length < ids.length ? '\n(★ ' + (ids.length - ok.length) + '마리는 빼고)' : '') + '\n\n놓아준 인형은 돌아오지 않습니다.')) return;
    ok.forEach(function (id) { M.removeDoll(id, u); });
    M.log('[🧸 보관소] 봉제인형 ' + ok.length + '마리를 놓아주었습니다.', u); M.saveHist();
    BX.sel = {}; BX.multi = false;
    boxPaint();
}
function multiMove() {
    const M = D(), u = u_(), ds = M.dolls(u);
    const ids = Object.keys(BX.sel).filter(function (k) { return BX.sel[k] && ds[k]; });
    if (!ids.length) return;
    const dest = prompt('옮길 곳 — 0 이면 동행 칸, 1~' + M.BOX_N + ' 이면 그 번호의 보관함 맨 앞', '0');
    if (dest == null) return;
    const n = Number(dest);
    const w = M.withList(u).filter(function (id) { return ids.indexOf(id) < 0; });
    if (n === 0) {
        const room = M.PARTY_MAX - w.length;
        const add = ids.filter(function (id) { return M.withList(u).indexOf(id) < 0; });
        if (add.length > room) { alert_('동행은 세 마리까지입니다. (빈 자리 ' + room + ')'); return; }
        M.setWith(M.withList(u).concat(add), u);
    } else if (n >= 1 && n <= M.BOX_N) {
        M.setWith(w, u);
        const list = sortedBox().filter(function (id) { return ids.indexOf(id) < 0; });
        const at = Math.min(list.length, (n - 1) * M.BOX_SIZE);
        Array.prototype.splice.apply(list, [at, 0].concat(ids));
        BX.sel = {}; BX.multi = false;
        reorder(list);
        return;
    } else return;
    BX.sel = {}; BX.multi = false;
    boxPaint();
}
// 인형 하나 — 상세 · 즐겨찾기 · 놓아주기 · 동행/보관
function dollMenu(id) {
    const M = D(), u = u_(), d = M.dolls(u)[id];
    if (!d) return;
    const s = M.stats(d), w = M.withList(u), inW = w.indexOf(id) >= 0;
    const at = new Date(d.at || 0);
    const days = Math.ceil(M.fedLeft(d) / 86400000);
    const html = '<div style="display:flex;gap:12px;align-items:center">' + icon(d.sp, 72) + '<div><h3>' + esc(M.nickOf(d)) + (d.fav ? ' <span style="color:#e6b400">★</span>' : '') + '</h3>'
        + '<div class="sub" style="margin:0">' + esc(M.spName(d.sp)) + ' · 도감 No.' + String(d.sp).padStart(2, '0') + ' · ' + (M.ATTR[s.att] || {}).e + ' ' + (M.ATTR[s.att] || {}).n + ' 속성<br>등급 ' + s.g + ' · Lv.' + s.lv + (M.xpNeed(s.lv) ? ' (경험치 ' + (d.xp || 0) + '/' + M.xpNeed(s.lv) + (s.lv >= M.lvMaxOf(d) && s.lv < 100 ? ' · 각성 돌파 필요' : ' · 상한 Lv ' + M.lvMaxOf(d)) + ')' : ' (최대)') + ' · 교감 ♥' + M.bondOf(d) + '/' + M.BOND_MAX + '</div></div></div>'
        // ★ 인형 전투 2차 수치 (6단계 · 2026-11-10) — HP · 공격력 · 매력 · 방어력 · 굳건함 · 속도 · 성격 · 특성 · 기술 5칸
        + '<div class="gb-row"><div class="tx"><div style="font-size:11px;color:#d8ceff;line-height:1.7">HP ' + Math.ceil(M.hpOf(d)) + ' / ' + s.max + ' · 공격력 ' + s.atk + ' · 매력 ' + s.chm + ' · 방어력 ' + s.def + ' · 굳건함 ' + s.sta + ' · 속도 ' + s.spd + '<br>'
        + (window.D2 ? '성격 ' + esc(window.D2.perOf(d).n) + ' (특기 ' + esc(window.D2.NAME[window.D2.perOf(d).a]) + ' · ' + esc(window.D2.NAME[window.D2.perOf(d).b]) + ')' : '') + (window.D2TR ? ' · 특성 ' + esc((window.D2TR.get(window.D2TR.trOf(d)) || { n: '없음' }).n) : '') + '<br>'
        + '포만도 ' + fullOf(d) + ' / 100 — ' + (days > 0 ? days + '일 안에 먹이를 주세요' : '곧 달아납니다!') + '<br>잡은 날 ' + at.getFullYear() + '.' + (at.getMonth() + 1) + '.' + at.getDate() + ' · ' + (inW ? '동행 중' : '보관함') + '</div>'
        + (window.D2SK ? '<div style="margin-top:6px">기술 — ' + (function () { const mv = window.D2SK.mvOf(d), nm = function (no) { return no ? esc(window.D2SK.get(no).n) + ' <span style="color:#8f84b5">' + window.D2SK.ppOf(d, no) + '/' + window.D2SK.get(no).pp + '</span>' : '<span style="color:#6a5f88">빈칸</span>'; }; return '공격기 ' + mv.a.map(nm).join(' · ') + '<br>유틸기 ' + mv.u.map(nm).join(' · '); })() + '</div>' : '') + '</div></div>'
        + '<div class="gb-row"><input id="gb-nick" maxlength="12" placeholder="별명 (비우면 종 이름)" value="' + esc(d.nick || '') + '" style="flex:1;padding:7px;border-radius:7px;border:1px solid #6d5aa0;background:#2b2140;color:#fff"><button class="gb-btn" data-k="nick">바꾼다</button></div>'
        + (function () {
            const nd = M.gradeNeed(id, u);
            if (!nd.rune) return '';
            return '<div class="gb-row"><div class="tx"><div style="font-size:10.5px;color:' + (nd.ok ? '#9fd8ef' : '#8f84b5') + '">💠 ' + esc(nd.rune) + ' ' + nd.have + '개 — ' + (nd.ok ? '각성 돌파할 수 있습니다 (레벨은 그대로 · 등급만 다음으로)' : esc(nd.why)) + '</div></div>'
                + (nd.ok ? '<button class="gb-btn pri" data-k="up">각성 돌파 (' + s.g + ' → ' + M.GRADES[M.gradeIdx(s.g) + 1] + ')</button>' : '') + '</div>';
        })()
        + '<div class="gb-btns"><button class="gb-btn pri" data-k="care">🧸 돌보기</button><button class="gb-btn" data-k="fav">' + (d.fav ? '☆ 즐겨찾기 해제' : '★ 즐겨찾기') + '</button><button class="gb-btn" data-k="mv">' + (inW ? '보관함으로' : '동행으로') + '</button></div>'
        + '<div class="gb-btns"><button class="gb-btn" data-k="rel"' + (d.fav ? ' disabled' : '') + ' style="color:#ffb3b3">놓아주기</button><button class="gb-btn" data-k="x">닫는다</button></div>';
    const dim = panel(html);
    dim.style.zIndex = '99998';
    dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
    // 🧸 돌보기 — 인형 돌보기에서 인형을 눌렀을 때의 창 그대로 (pet-list.js petOneOpen · 2026-11-08 사용자)
    dim.querySelector('[data-k=care]').onclick = function () {
        dim._close();
        if (typeof window.petOneOpen === 'function') window.petOneOpen(Number(id));
        else alert_('인형 돌보기 창을 열 수 없습니다.');
    };
    dim.querySelector('[data-k=nick]').onclick = function () {
        const v = String(dim.querySelector('#gb-nick').value || '').trim().slice(0, 12);
        M.patchDoll(id, { nick: v || null }, u); dim._close(); boxPaint();
    };
    const upB = dim.querySelector('[data-k=up]');
    if (upB) upB.onclick = function () {
        const r = M.gradeUp(id);
        if (!r.ok) { alert_(r.why); return; }
        alert_('💠 ' + M.nickOf(d) + ' — ' + r.from + ' 등급에서 ' + r.to + ' 등급으로 각성 돌파했습니다.\n\nLv ' + r.lv + ' 그대로 이어서 오릅니다.');
        dim._close(); boxPaint();
    };
    dim.querySelector('[data-k=fav]').onclick = function () { M.patchDoll(id, { fav: d.fav ? null : 1 }, u); dim._close(); boxPaint(); };
    dim.querySelector('[data-k=mv]').onclick = function () {
        if (inW) M.setWith(w.filter(function (x) { return x !== id; }), u);
        else { if (w.length >= M.PARTY_MAX) { alert_('동행은 세 마리까지입니다. 동행 칸의 인형을 먼저 보관함으로 옮겨 주세요.'); return; } M.setWith(w.concat([id]), u); }
        dim._close(); boxPaint();
    };
    dim.querySelector('[data-k=rel]').onclick = function () {
        if (d.fav) return;
        if (!confirm(M.nickOf(d) + M.josa(M.nickOf(d), '을') + ' 놓아줄까요?\n놓아준 인형은 돌아오지 않습니다.')) return;
        M.removeDoll(id, u);
        M.log('[🧸 보관소] ' + M.nickOf(d) + M.josa(M.nickOf(d), '을') + ' 놓아주었습니다.', u); M.saveHist();
        dim._close(); boxPaint();
    };
}
async function box(S) {
    if (needTut(S)) return;
    boxOpen();
}

// ==========================================
// 교환소 — 1 : 1
// ==========================================
const TR = { id: null, ref: null, v: null, dim: null, me: '', side: '', listen: null, code: '', askSeen: {}, queue: [], out: {} };
async function trade(S) {
    const WHO = '교환소 도깨비';
    if (needTut(S)) return;
    for (let n = 0; ; n++) {
        const i = await greetAsk(S, 'trade', WHO, ['어서 오쇼, 김서방! 인형을 바꾸러 오셨소?', '여기선 인형 하나에 인형 하나요. 하나를 받으려면 하나를 내놓아야지!', '그냥 주고 싶다고? 에이, 그러지 마쇼! 직접 잡는 재미도 있어야 하지 않겠소?'],
            ['또 무슨 볼일이 있소?', '다른 건 없소?'], ['교환 신청하기', '그냥 대화하기', '돌아가기', '보낸 신청 보기 (' + Object.keys(TR.out).length + ')'], n === 0);
        if (i === 0) { tradeAsk(); return; }
        if (i === 1) { await aiTalk(S, 'trade', WHO, TRADE_TALK); continue; }
        if (i === 3) { tradeMine(); return; }
        return;
    }
}
function tradeAsk() {
    const M = D(), me = u_();
    if (!Object.keys(M.dolls(me)).length) { alert_('교환할 봉제인형이 없습니다.\n하나를 받으려면 하나를 내놓아야 합니다 — 출몰지에서 잡아 오세요.'); return; }
    const list = Object.keys(users()).filter(function (c) { const x = users()[c]; return c !== me.code && x && x.name && !x.deleted; })
        .sort(function (a, b) { return String(users()[a].name).localeCompare(String(users()[b].name), 'ko'); });
    let dim = null, q = '';
    const paint = function () {
        const rows = list.filter(function (c) { return !q || String(users()[c].name).indexOf(q) >= 0; }).slice(0, 60);
        const html = '<h3>🔁 교환 신청</h3><div class="sub">교환할 동료를 고르세요 (여럿에게 보내도 됩니다). 상대가 받으면 교환 창이 열립니다.</div>'
            + '<input id="gb-tq" placeholder="이름 검색" value="' + esc(q) + '" style="width:100%;box-sizing:border-box;padding:7px;border-radius:7px;border:1px solid #6d5aa0;background:#2b2140;color:#fff;margin-bottom:6px">'
            + rows.map(function (c) { const x = users()[c]; return '<div class="gb-row"><div class="tx"><b>' + esc(x.name) + '</b><div>' + esc((x.affiliation || '') + ' · ' + (x.team || '')) + '</div></div><button class="gb-btn" data-c="' + esc(c) + '">신청</button></div>'; }).join('')
            + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
        if (!dim) dim = panel(html); else dim.firstChild.innerHTML = html;
        const inp = dim.querySelector('#gb-tq');
        inp.oninput = function () { q = inp.value; const p = inp.selectionStart; paint(); const n = dim.querySelector('#gb-tq'); n.focus(); try { n.setSelectionRange(p, p); } catch (e) { } };
        dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
        Array.prototype.forEach.call(dim.querySelectorAll('[data-c]'), function (b) { b.onclick = function () { dim._close(); tradeSend(b.dataset.c); }; });
    };
    paint();
}
function tradeSend(code) {
    const d = db_(), me = u_(), you = users()[code];
    if (!d || !me || !you) return;
    const ref = d.ref(TRADE).push();
    const v = { at: D().now(), ac: me.code, bc: code, state: 'ask', a: { code: me.code, name: me.name }, b: { code: code, name: you.name } };
    ref.set(v).then(function () {
        TR.out[ref.key] = v;
        alert_('🔁 ' + you.name + ' 사원에게 교환을 신청했습니다.\n상대가 받으면 교환 창이 열립니다.');
    });
}
// 보낸 신청 — 받기 전이면 거둘 수 있다
function tradeMine() {
    const keys = Object.keys(TR.out);
    const html = '<h3>🔁 보낸 신청</h3><div class="sub">상대가 아직 받지 않은 신청입니다.</div>'
        + (keys.length ? keys.map(function (k) { const o = TR.out[k]; return '<div class="gb-row"><div class="tx"><b>' + esc(o.b && o.b.name) + '</b><div>' + new Date(Number(o.at) || 0).toLocaleString('ko-KR') + '</div></div><button class="gb-btn" data-k="' + esc(k) + '">거두기</button></div>'; }).join('')
                     : '<div class="sub">기다리는 신청이 없습니다.</div>')
        + '<div class="gb-btns"><button class="gb-btn" data-x="1">닫는다</button></div>';
    const dim = panel(html);
    dim.querySelector('[data-x]').onclick = function () { dim._close(); };
    Array.prototype.forEach.call(dim.querySelectorAll('[data-k]'), function (b) {
        b.onclick = function () { db_().ref(TRADE + '/' + b.dataset.k).update({ state: 'cancel', why: '신청한 쪽이 거둠' }); delete TR.out[b.dataset.k]; dim._close(); tradeMine(); };
    });
}
// 교환 창이 비면 기다리던 것을 차례로
function tradeNext() {
    if (TR.id || !TR.queue.length) return;
    const k = TR.queue.shift();
    db_().ref(TRADE + '/' + k).once('value').then(function (s) {
        const v = s.val();
        if (!v) { tradeNext(); return; }
        if (v.state === 'ask' && v.bc === u_().code) askOne(k, v);
        else if (v.state === 'open' && (v.ac === u_().code || v.bc === u_().code)) tradeWatch(k, v.ac === u_().code ? 'a' : 'b');
        else tradeNext();
    });
}
function askOne(k, v) {
    const d = db_();
    const yes = confirm('🔁 ' + (v.a && v.a.name) + ' 사원이 봉제인형 교환을 신청했습니다.\n\n교환 창을 열까요? (서로 한 마리씩 올리고, 둘 다 승인해야 바뀝니다)');
    if (!yes) { d.ref(TRADE + '/' + k).update({ state: 'cancel', why: '거절' }); setTimeout(tradeNext, 200); return; }
    d.ref(TRADE + '/' + k).update({ state: 'open' }).then(function () { tradeWatch(k, 'b'); });
}
// 내게 온 신청 · 내가 연 교환을 지켜본다
function tradeBind() {
    const me = u_(), d = db_();
    if (!me || !me.code || !d || TR.code === me.code) return;
    TR.code = me.code;
    const onAsk = function (s) {
        const v = s.val();
        if (!v || v.state !== 'ask' || v.bc !== me.code || TR.askSeen[s.key]) return;
        TR.askSeen[s.key] = 1;
        if (TR.id) { if (TR.queue.indexOf(s.key) < 0) TR.queue.push(s.key); return; }     // 교환 중 — 끝나면 묻는다
        askOne(s.key, v);
    };
    d.ref(TRADE).orderByChild('bc').equalTo(me.code).on('child_added', onAsk);
    d.ref(TRADE).orderByChild('bc').equalTo(me.code).on('child_changed', onAsk);
    // 내가 보낸 것 — 상대가 받으면(open) 창을 연다 · 거절 · 취소는 알린다
    const onMine = function (s) {
        const v = s.val();
        if (!v || v.ac !== me.code) return;
        if (v.state === 'ask') { TR.out[s.key] = v; return; }
        const was = TR.out[s.key];
        delete TR.out[s.key];
        if (v.state === 'open' && TR.id !== s.key) {
            if (TR.id) { if (TR.queue.indexOf(s.key) < 0) TR.queue.push(s.key); }
            else tradeWatch(s.key, 'a');
        } else if (v.state === 'cancel' && was && TR.id !== s.key && v.why === '거절') {
            alert_('🔁 ' + (v.b && v.b.name) + ' 사원이 교환 신청을 거절했습니다.');
        }
    };
    d.ref(TRADE).orderByChild('ac').equalTo(me.code).on('child_added', onMine);
    d.ref(TRADE).orderByChild('ac').equalTo(me.code).on('child_changed', onMine);
}
setInterval(function () { try { tradeBind(); } catch (e) { } }, 2000);

function tradeWatch(id, side) {
    const d = db_();
    if (TR.ref) { try { TR.ref.off(); } catch (e) { } }
    TR.id = id; TR.side = side; TR.v = null;
    TR.ref = d.ref(TRADE + '/' + id);
    TR.ref.on('value', function (s) {
        const v = s.val();
        TR.v = v;
        if (!v) { tradeEnd(); return; }
        if (v.state === 'cancel') {
            tradeEnd();
            alert_('🔁 교환이 취소되었습니다.' + (v.why ? ' (' + v.why + ')' : '') + '\n\n교환소 도깨비: 「' + pick(['마음이 바뀌었소? 그럴 수도 있지!', '인형은 소중한 것이니, 신중하게 고르는 게 좋소.']) + '」');
            return;
        }
        if (v.state === 'done') {
            const mine = v[TR.side === 'a' ? 'b' : 'a'].doll;
            tradeEnd();
            try { if (mine) D().dexCaught(mine.sp); } catch (e) { }
            alert_('🔁 교환이 끝났습니다!\n\n' + (mine ? D().nickOf(mine) + D().josa(D().nickOf(mine), '이') + ' 새 식구가 되었습니다.' : '') + '\n\n교환소 도깨비: 「' + pick(['좋소, 좋아! 서로 마음에 드는 인형을 얻었구먼!', '새로 데려간 녀석도 잘 돌봐주쇼. 오래오래 함께해야지!']) + '」');
            return;
        }
        if (v.state === 'open') { tradePaint(); tradeTry(); }
    });
}
function tradeEnd() {
    if (TR.ref) { try { TR.ref.off(); } catch (e) { } }
    if (TR.dim) TR.dim._close();
    TR.id = null; TR.ref = null; TR.v = null; TR.dim = null;
    setTimeout(tradeNext, 400);
}
function tradeCard(o, mine) {
    const M = D();
    if (!o || !o.doll) return '<div class="sub" style="text-align:center;padding:14px 0">' + (mine ? '아직 올리지 않았습니다' : '상대가 고르는 중…') + '</div>';
    const d = o.doll, s = M.stats(d);
    return '<div style="display:flex;flex-direction:column;align-items:center">' + icon(d.sp, 64) + '<b style="color:#fff3d6">' + esc(M.nickOf(d)) + '</b>'
        + '<div style="font-size:10px;color:#a99ccc;text-align:center;line-height:1.5">' + esc(M.spName(d.sp)) + ' · No.' + String(d.sp).padStart(2, '0') + '<br>' + s.g + ' · Lv.' + s.lv + ' · ' + (M.ATTR[s.att] || {}).e + '<br>체력 ' + Math.ceil(M.hpOf(d)) + '/' + s.max + '</div></div>';
}
function tradePaint() {
    const v = TR.v;
    if (!v) return;
    const me = v[TR.side], you = v[TR.side === 'a' ? 'b' : 'a'];
    const both = !!(me.ready && you.ready);
    const html = '<h3>🔁 봉제인형 교환 — ' + esc(you.name) + ' 사원</h3><div class="sub">한 마리씩 올리고 둘 다 「준비 완료」를 누르면 최종 승인 단추가 나옵니다. 올린 인형을 바꾸면 준비가 풀립니다. 끝난 교환은 되돌릴 수 없습니다.</div>'
        + '<div style="display:flex;gap:8px"><div style="flex:1;border:1px solid #4a3a70;border-radius:10px;padding:8px"><div style="font-size:10px;color:#ffcf8f;margin-bottom:4px">내 인형 ' + (me.ready ? '✅' : '') + (me.ok ? ' 승인' : '') + '</div>' + tradeCard(me, true)
        + '<button class="gb-btn" data-k="pick" style="width:100%;margin-top:6px">' + (me.doll ? '바꾸기' : '고르기') + '</button></div>'
        + '<div style="flex:1;border:1px solid #4a3a70;border-radius:10px;padding:8px"><div style="font-size:10px;color:#ffcf8f;margin-bottom:4px">' + esc(you.name) + ' ' + (you.ready ? '✅' : '') + (you.ok ? ' 승인' : '') + '</div>' + tradeCard(you, false) + '</div></div>'
        + (both ? '<div class="sub" style="margin-top:10px;color:#ffe6b8">최종 확인 — ' + esc(D().nickOf(me.doll)) + ' ↔ ' + esc(D().nickOf(you.doll)) + '</div><div class="gb-btns"><button class="gb-btn pri" data-k="ok"' + (me.ok ? ' disabled' : '') + '>' + (me.ok ? '상대 승인 기다리는 중' : '교환한다 (최종 승인)') + '</button></div>'
                : '<div class="gb-btns"><button class="gb-btn pri" data-k="ready"' + ((me.doll && !me.ready) ? '' : ' disabled') + '>교환 준비 완료</button></div>')
        + '<div class="gb-btns"><button class="gb-btn" data-k="no">교환 취소</button></div>';
    if (!TR.dim || !TR.dim.parentNode) TR.dim = panel(html, function () { TR.dim = null; });
    else TR.dim.firstChild.innerHTML = html;
    const P2 = TR.dim;
    const ref = db_().ref(TRADE + '/' + TR.id);
    P2.querySelector('[data-k=no]').onclick = function () { ref.update({ state: 'cancel', why: u_().name + ' 사원이 취소' }); };
    const pk = P2.querySelector('[data-k=pick]'); if (pk) pk.onclick = tradePick;
    const rd = P2.querySelector('[data-k=ready]'); if (rd) rd.onclick = function () { const p = {}; p[TR.side + '/ready'] = true; ref.update(p); };
    const ok = P2.querySelector('[data-k=ok]'); if (ok) ok.onclick = function () { const p = {}; p[TR.side + '/ok'] = true; ref.update(p); };
}
function tradePick() {
    const M = D(), u = u_(), ds = M.dolls(u);
    const ids = M.withList(u).concat(M.boxList(u)).filter(function (id) { return ds[id]; });
    const html = '<h3>올릴 인형</h3><div class="sub">즐겨찾기(★)한 인형은 해제해야 올릴 수 있습니다.</div>'
        + ids.map(function (id) { const d = ds[id]; return '<div class="gb-row" style="' + (d.fav ? 'opacity:.45' : '') + '">' + icon(d.sp, 36) + '<div class="tx">' + dollLine(d) + '</div><button class="gb-btn" data-id="' + id + '"' + (d.fav ? ' disabled' : '') + '>올린다</button></div>'; }).join('')
        + '<div class="gb-btns"><button class="gb-btn" data-k="x">닫는다</button></div>';
    const dim = panel(html);
    dim.style.zIndex = '99998';
    dim.querySelector('[data-k=x]').onclick = function () { dim._close(); };
    Array.prototype.forEach.call(dim.querySelectorAll('[data-id]'), function (b) {
        b.onclick = function () {
            const d = ds[b.dataset.id];
            const st = M.stats(d);
            const snap = { id: d.id, sp: d.sp, g: st.g, lv: st.lv, xp: d.xp || 0, hp: M.hpOf(d), at: d.at || 0 };
            if (d.nick) snap.nick = d.nick;
            const p = {};
            p[TR.side + '/doll'] = snap; p['a/ready'] = false; p['b/ready'] = false; p['a/ok'] = false; p['b/ok'] = false;
            db_().ref(TRADE + '/' + TR.id).update(p);
            dim._close();
        };
    });
}
// 둘 다 승인했으면 — 먼저 잡은 쪽이 한 번에 옮긴다
function tradeTry() {
    const v = TR.v;
    if (!v || v.state !== 'open' || !v.a.ok || !v.b.ok || !v.a.doll || !v.b.doll || v.exec) return;
    const d = db_(), me = u_();
    d.ref(TRADE + '/' + TR.id + '/exec').transaction(function (c) { return c ? undefined : me.code; }).then(function (r) {
        if (!r || !r.committed) return;
        const A = v.a.code, Bc = v.b.code, xa = String(v.a.doll.id), xb = String(v.b.doll.id);
        return Promise.all([
            d.ref('users/' + A + '/pets').once('value'), d.ref('users/' + Bc + '/pets').once('value'),
            d.ref('users/' + A + '/petShow').once('value'), d.ref('users/' + Bc + '/petShow').once('value')
        ]).then(function (ss) {
            const M = D(), PT = window.PET;
            const pa = M.objOf(ss[0].val()), pb = M.objOf(ss[1].val());
            const da = pa[xa], db2 = pb[xb];
            if (!da || !db2) { d.ref(TRADE + '/' + TR.id).update({ state: 'cancel', why: '올린 인형이 이미 없습니다' }); return; }
            // 받는 쪽의 빈 열쇠 (같은 동물이 있으면 113 · 213 …)
            const free = function (ps, gone, sp) { for (let n = 0; n < 60; n++) { const k = String(sp + 100 * n); if (k === gone || !ps[k]) return k; } return String(sp + 6000); };
            const ka = free(pa, xa, PT.sp(xb)), kb = free(pb, xb, PT.sp(xa));
            const arr = function (x) { return Array.isArray(x) ? x : ((x && typeof x === 'object') ? Object.keys(x).sort().map(function (k) { return x[k]; }) : []); };
            const wa = arr(ss[2].val()).map(String).filter(function (x) { return x && x !== xa; });
            const wb = arr(ss[3].val()).map(String).filter(function (x) { return x && x !== xb; });
            const t = M.now();
            // 주인이 바뀐다 — 교감 · 즐겨찾기 · 나가 있던 일은 비우고, 등급 · Lv · 이름 · 장비 · 체력은 그대로
            const fresh = function (rec) {
                const o = Object.assign({}, rec, { ord: t, fedAt: t, at: t, bond: 0 });
                ['fav', 'bd', 'with', 'out', 'rest', 'jsleep', 'hurt', 'stv', 'doll', 'pet'].forEach(function (k) { delete o[k]; });
                return o;
            };
            const p = {};
            p['users/' + A + '/pets/' + xa] = null;
            p['users/' + Bc + '/pets/' + xb] = null;
            p['users/' + A + '/pets/' + ka] = fresh(db2);
            p['users/' + Bc + '/pets/' + kb] = fresh(da);
            p['users/' + A + '/petShow'] = wa.length ? wa.map(Number) : null;
            p['users/' + Bc + '/petShow'] = wb.length ? wb.map(Number) : null;
            p['users/' + A + '/petShowSet'] = 1;
            p['users/' + Bc + '/petShowSet'] = 1;
            p['petFed/' + A + '/' + xa] = null;
            p['petFed/' + Bc + '/' + xb] = null;
            p[TRADE + '/' + TR.id + '/state'] = 'done';
            p[TRADE + '/' + TR.id + '/doneAt'] = t;
            p[TRADE + '/' + TR.id + '/keys'] = { a: ka, b: kb };
            return d.ref().update(p).then(function () {
                try {
                    M.log('[🔁 교환소] ' + (da.nick || M.spName(PT.sp(xa))) + ' ↔ ' + (db2.nick || M.spName(PT.sp(xb))) + ' (' + (me.code === A ? v.b.name : v.a.name) + ' 사원과)', me);
                    M.saveHist();
                } catch (e) { }
            });
        });
    }).catch(function (e) { console.warn('[🔁] 교환 실패', e); });
}
window.dollTradeState = function () { console.log({ 교환: TR.id, 쪽: TR.side, 상태: TR.v && TR.v.state, 값: TR.v }); };

// ==========================================
// 나머지 도깨비
// ==========================================
// ==========================================
// 💠 각성 공방 — 탈 깎는 도깨비 (조각 셋 → 룬 · Lv 10 인형을 각성)
// ==========================================
const MASK_TALK = [['……탈은 얼굴을 숨기는 게 아니라, 다른 얼굴을 빌리는 거라네.'], ['따라쟁이들도 탈을 쓰는 거랑 비슷하지. 남의 얼굴을 빌려 쓰는 거야.'], ['조각 셋이면 룬 하나. 모자라면 어둠에 더 다녀오게.']];
async function mask(S) {
    const WHO = '탈 깎는 도깨비';
    if (needTut(S)) return;
    for (let n = 0; ; n++) {
        const i = await greetAsk(S, 'mask', WHO, ['……룬 조각을 가져왔나. 셋이면 하나로 깎아 주지.', '각성하려는 녀석이 있나? Lv 이 가득 차야 룬이 듣는다네.', '……어둠에서 주워 온 조각이로군. 이리 줘 보게.'],
            ['……또 볼일이 있나?', '다른 건 없고?'], ['각성의 룬 다루기', '그냥 대화하기', '돌아가기'], n === 0);
        if (i === 0) { runeUi(); return; }
        if (i === 1) { await aiTalk(S, 'mask', WHO, MASK_TALK); continue; }
        return;
    }
}
function runeUi() {
    const M = D(), A = window.AWK, u = u_();
    if (!A) { alert_('각성의 룬을 다룰 수 없습니다.'); return; }
    let dim = null;
    const paint = function () {
        const ds = M.dolls(u);
        const ready = Object.keys(ds).filter(function (id) { return M.gradeNeed(id, u).ok; });
        const lv10 = Object.keys(ds).filter(function (id) { const nd = M.gradeNeed(id, u); return !nd.ok && nd.rune && M.stats(ds[id]).lv >= M.lvMaxOf(ds[id]); });
        const html = '<h3>💠 각성 공방</h3><div class="sub">펫 동행 어둠(여정 · 아케이드존)에서 괴담을 쓰러뜨리면 각성의 룬 조각이 나옵니다 — 난이도가 높을수록 높은 등급 조각이 나오지만 드뭅니다.<br>조각 셋 → 룬 하나. 등급 상한 레벨(D 10 · C 20 · B 30 · A 40)에 닿은 인형에게 다음 등급의 룬을 쓰면 각성 돌파합니다 — 레벨은 그대로, 등급만 다음으로 (S 는 Lv 100 까지).</div>'
            + ['C', 'B', 'A', 'S'].map(function (g) {
                const sh = A.have(A.SHARD(g), u), rn = A.have(A.RUNE(g), u);
                return '<div class="gb-row"><div class="tx"><b>' + g + '급</b> <span style="font-size:10px;color:#8f84b5">· ' + ({ C: 'D → C', B: 'C → B', A: 'B → A', S: 'A → S' })[g] + '</span><div>조각 ' + sh + '개 · 룬 ' + rn + '개</div></div>'
                    + '<button class="gb-btn' + (sh >= 3 ? ' pri' : '') + '" data-c="' + g + '"' + (sh >= 3 ? '' : ' disabled') + '>합치기' + (sh >= 6 ? ' ×' + Math.floor(sh / 3) : '') + '</button></div>';
            }).join('')
            + '<div style="font-size:10.5px;color:#ffcf8f;margin:10px 0 2px">각성 돌파할 수 있는 인형</div>'
            + (ready.length ? ready.map(function (id) { const d = ds[id], s = M.stats(d), nd = M.gradeNeed(id, u); return '<div class="gb-row">' + icon(d.sp, 36) + '<div class="tx">' + dollLine(d) + '<div>💠 ' + esc(nd.rune) + '</div></div><button class="gb-btn pri" data-u="' + id + '">' + s.g + ' → ' + M.GRADES[M.gradeIdx(s.g) + 1] + '</button></div>'; }).join('')
                            : '<div class="sub">' + (lv10.length ? '상한 레벨에 닿은 인형 ' + lv10.length + '마리 — 다음 등급의 룬이 없습니다.' : '상한 레벨에 닿은 인형이 없습니다.') + '</div>')
            + '<div class="gb-btns"><button class="gb-btn" data-x="1">닫는다</button></div>';
        if (!dim) dim = panel(html); else dim.firstChild.innerHTML = html;
        dim.querySelector('[data-x]').onclick = function () { dim._close(); };
        Array.prototype.forEach.call(dim.querySelectorAll('[data-c]'), function (b) { b.onclick = function () { const n = A.combine(b.dataset.c, 99); if (n) alert_('💠 ' + A.RUNE(b.dataset.c) + ' ' + n + '개를 깎았습니다.'); paint(); }; });
        Array.prototype.forEach.call(dim.querySelectorAll('[data-u]'), function (b) {
            b.onclick = function () {
                const d = M.dolls(u)[b.dataset.u];
                const r = M.gradeUp(b.dataset.u);
                if (!r.ok) { alert_(r.why); return; }
                alert_('💠 ' + M.nickOf(d) + ' — ' + r.from + ' 등급에서 ' + r.to + ' 등급으로 각성 돌파했습니다.\n\nLv ' + r.lv + ' 그대로 이어서 오릅니다.');
                paint();
            };
        });
    };
    paint();
}
// ★ 6단계(2026-11-10) — 조는 도깨비: 기존 대화 + 「기술 관리 / 도깨비 상점 / 닫기」 (기획 「조는 도깨비」 01 · 03)
//   기술 관리 — d2-learn.js (동행 인형 선택 → 배우기 · 잊기 · 교환 · 자리 바꾸기) · 도깨비 상점 — 택 로고 각인기 100,000 꿈결 (d2-items.js shopOpen('gob'))
async function nap(S) {
    const WHO = '조는 도깨비';
    for (let n = 0; ; n++) {
        let i;
        if (n === 0) {
            try { S.sys('(쿨…… 쿨……)', 9000); } catch (e) { }
            const l = await greetLines('nap', ['……쿨…… 쿨……', '……으음…… 메밀묵은 내 거야……', '……김서방…… 리본…… 다섯 개……']);
            try { S.sys('', 10); } catch (e) { }
            if (l.length > 1) await S.talk(l.slice(0, -1), WHO);
            i = await S.ask(WHO, l[l.length - 1], ['기술 관리', '도깨비 상점', '닫기']);
        } else i = await S.ask(WHO, pick(['……으음…… 또 뭐……?', '……쿨…… 아, 아직 있었어……?']), ['기술 관리', '도깨비 상점', '닫기']);
        if (i === 0) {
            if (!window.D2LN) { await S.talk(['……기술은…… 아직…… 쿨……'], WHO); continue; }
            await new Promise(function (res) { window.D2LN.open(null, res); });
            continue;
        }
        if (i === 1) {
            if (!window.D2IT) { await S.talk(['……가게는…… 닫았어…… 쿨……'], WHO); continue; }
            await new Promise(function (res) { window.D2IT.shopOpen('gob', res); });
            continue;
        }
        return;
    }
}

window.DOLLGONG = {
    sew: sew, sewUi: sewUi, shop: shop, trade: trade, box: box, dex: dex, mask: mask, nap: nap,
    repaint: function () { try { if (BX.a) boxPaint(); } catch (e) { } try { if (TR.dim) tradePaint(); } catch (e) { } },
    boxOpen: boxOpen, boxClose: boxClose, shopUi: shopUi, panel: panel, icon: icon, dollLine: dollLine, css: css, prefetch: prefetch, stateCtx: stateCtx
};
window.dollBoxOpen = boxOpen;

console.log('[👺] 도깨비 공방 — dollTradeState()');
})();
