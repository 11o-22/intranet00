// ==========================================
// ★ 📺 브라운의 심야 토크 쇼 — 🎤 초대 · 화요 퀴즈쇼 (2026-11-13 사용자)
// bundles.json 마지막 묶음 — show-finale.js 바로 뒤 (plaza.js 보다 뒤)
// ==========================================
//
// ■ 무엇인가
//
//   「📺 브라운의 심야 토크 쇼」를 찬 사원의 장착칸에 [🎤 초대] 단추가 붙는다 ([🎬 피날레] 옆).
//   누르면 「화요 퀴즈쇼 / 심야 토크쇼」를 고르고(심야 토크쇼는 아직 준비 중 — 사용자 「일단 두자」),
//   사원을 1 ~ 6명 골라 초대장을 보낸다. 사회자는 바로 무대(광장의 방 「📺 화요 퀴즈쇼」)로 든다.
//
//   초대받은 사원 화면에는 초대장이 뜬다 (탐사 중에는 끝난 뒤에). **명패에 적을 닉네임**(6자까지)을 적고 [입장] 하면
//   단상의 비어 있는 명패 칸(앞에서부터)에 그 닉네임이 적히고, 그 단상 뒤에 선다 (걸어 다니지 않는다 — 붙박이).
//   4명 이상 초대하면 앞줄 단상(6인용 그림)이 하나 더 놓인다. 사회자는 오른쪽 단상.
//
//   문제는 사회자가 [✏️ 문제 내기] 에 적는다 — 무대 **가운데 화면**에 뜬다 (2026-11-13 사용자 「중앙 빈 화면에 장착자가 쓴 문제가 뜨게」 · 채팅에도 한 줄).
//   채점은 **사회자가 누른 사람**에게 들어간다 (2026-11-13 사용자 「정답은 장착자가 눌러서 누른 사람한테」) —
//       참가자(머리 · 명패)를 누르면 지목 (머리 위 ▼ · 아래에 채점 띠) → 띠의 [O] · [X] 를 누르거나,
//       「정답」 이 들어간 말 → O · 「오답」 · 「땡」 이 들어간 말 → X   (「정답입니다!」 · 「오답입니다」 — 그 말만 따로가 아니어도 된다)
//       ※ 「정답이 아닙니다」 는 X · 물음표가 붙은 「정답?」 은 채점이 아니다 · 「땡큐」 는 땡이 아니다. 지목 없이 한 말은 채점이 아니다.
//       한 번 채점하면 지목이 풀린다 (다음 문제는 다시 눌러서).
//   채점되면 그 사람 머리 위와 **가운데 화면**에 초록 O · 빨간 X 가 크게 뜨고, 소리가 난다 —
//       정답: 「띵 띠로링」 + 박수 · 오답: 「삐」 + 「우우」 (음원 없이 그 자리에서 만든다 · 광장 🔊 를 끄면 안 난다).
//   사회자는 [🚶 내려가기] 로 단상에서 내려와 무대 바닥을 걸어 다닐 수 있다 ([🎤 단상으로] 로 돌아간다). 손님은 단상에 붙박이.
//   한 사람에 세 문제. 다 채점되면 그 자리에서 셈한다. **온 사람이 모두 세 문제를 다 풀면** 쇼가 저절로 끝난다
//   (2026-11-13 사용자 「모든 사람들이 퀴즈를 다 맞추거나 틀렸을 때에 마무리」 · 거절한 사람은 빼고 · 아직 안 온 사람은 기다린다).
//   끝나면 **커튼이 닫히고** (열 때의 거꾸로) 광장으로 돌아간다. [쇼를 끝낸다] 로 먼저 끝내면 덜 푼 사람도 맞힌 수대로 받는다.
//       1개 10,000 P · 2개 10,000 P + 5,000 꿈결 · 3개 20,000 P + 10,000 꿈결
//   ※ 상은 한 사원에 하루 한 번 (자정 기준) — 사회자와 손님이 짜고 되풀이해 받는 길을 막는다. (사용자가 정한 값은 아니다 — 바꾸려면 settle 의 quizDay)
//   🔒 오답 하나에 가두리 10분 (2026-11-13 사용자 「오답 시 오답 횟수 당 가두리 10분」) — 셈할 때 정해지고, **무대에서 내려올 때** 갇힌다
//      (문제를 다 풀고도 쇼가 끝날 때까지는 단상에 서 있는다). 광장 → 백일몽 → … 빈 가두리 (gaduri.js by 'quiz' · 때가 되면 저절로 풀린다).
//      이미 갇혀 있으면 남은 때에 더한다. 갇혀 있는 동안은 새 초대장으로 무대에 못 선다. 하루 한 번 제한은 상에만 — 가두리는 틀릴 때마다.
//   명패 아래 동그라미 셋이 푼 문제다 (초록 · 빨강). 오른쪽 위 [📺 화요 퀴즈쇼] — 현황 · 더 초대 · 쇼를 끝낸다 · 나간다.
//   🚪 내보내기 (2026-11-13 사용자 「토크쇼 주인이 패널 내보내기도 가능하게 (게스트)」) — 사회자가 현황의 [내보내기] 로 손님을 무대에서 내린다.
//      앉아 있던 손님은 **지금까지 채점된 만큼** 셈한다 (쇼를 먼저 끝낼 때와 같다 — 맞힌 수대로 상 · 오답 가두리) → 명패가 비고, 그 사람 화면은 광장으로 돌아간다.
//      아직 초대장을 보는 손님이면 초대를 거둔다 (초대장이 닫힌다). 내보낸 사람은 그 쇼에 다시 못 들고, 남은 사람만 다 풀면 막이 내린다.
//      내보낸 만큼 [더 초대] 자리가 다시 난다 (다른 사원을 부를 수 있다 · 같은 사원은 다시 못 부른다).
//
//   들어갈 때 (쇼마다 처음 한 번 · 다시 들어갈 때는 커튼만) —
//   붉은 글씨 여섯 장이 빠르게 지나가고 (지지직거리며 서고 → 종이처럼 찢겨 나가면 그 아래 다음 글씨 · 2026-11-13 사용자 「흐려지는 게 아니라
//   사진처럼 찢어지거나 지지직 · 빨랐으면」) → 「나는」 이 선 화면을 찢고 나오고 → 브라운관이 꺼지듯
//   (화면 압축 → 수평선 → 빛의 점 → 암전) → 닫힌 커튼이 걷히며 무대가 열린다.
//   커튼은 주신 그림 여섯 장 (프레임 1 닫힘 → 2 → 3 → 4 → 5 → 종료) — 2026-11-13 사용자 「이걸로 하자 · 마지막 프레임을 유지」.
//   방 그림과 같은 자리 · 같은 크기라 방 안에 겹쳐 깔고 위에서부터 걷는다. 끝 프레임은 무대 양옆에 걷힌 커튼으로 늘 남는다.
//   (처음에는 그림 없이 붉은색으로 그린 커튼이었다 — 「걷히는 커튼은 같은 붉은색 코드로」 → 그림으로 바뀜)
//
//   🎺 커튼이 걷히는 순간 「Showtime!」 이 처음부터 크게 나고(빰), 두 마디 뒤부터는 잔잔하게 깔린다 (2026-11-13 사용자 · 아래 「쇼타임」).
//
// ■ 광장 쪽 (plaza.js)
//   R.quiz (그림 quiz-show3 · gate · fit · camX · padTop · full · pud · floor · x1) · goRoom 의 문지기 · plazaPin(p, 풀 때 설 자리) / plazaPinned · plazaOnPaint · plazaOnMySay
//
// ■ 적히는 자리
//   quizShow/<사회자 사번> = { id, host, name, at, inst, inv: { 사번: { at, st: p|y|n|x(내보냄), xat } }, seat: { s1..s6: { c, nick, at } },
//                              mark: { 사번: { q1..q3: 1(O) | 2(X) } }, last: { c, v, k, at }, paid: { 사번: { n, at, skip } }, q: { t, at } (화면의 문제), fin (모두 다 풂), end }
//   quizWin/<사번>/<열쇠>  = { pts, dream, n, wrong, by, name, at, claimed }   받을 상 · 오답 가두리 (그 사원 화면이 받고 지운다 — 나가 있었으면 들어올 때)
//   quizDay/<사번>         = 'YYYY-MM-DD'                      그날 상을 받았다
//
// ■ 콘솔
//   quizShowState() · quizShowIntro() (연출만 다시 보기 · quizShowIntro(false) 는 커튼만)

(function quizShow() {
'use strict';

const SHOW = '📺 브라운의 심야 토크 쇼';
const ROOM = 'quiz';
const START = 'plaza';
const PATH = 'quizShow', WIN = 'quizWin', DAY = 'quizDay';
const DIR = 'plaza/';
// 그림 — 2026-11-13 사용자 「배경 수정 3차」 묶음 「브라운의 심야 토크쇼 배경 이걸로 바꿔줘. 위치도 맞게 수정해 주고」 (배경은 plaza.js 의 R.quiz.img).
//   주신 그림(도트 한 칸 5픽셀)을 한 칸 한 점으로 줄여 둔 것. 커튼의 거의 불투명한 점(알파 245~254)은 불투명으로, 거의 투명한 점(1~8)은 투명으로 맞췄다.
const T1_IMG = 'quiz3-t1.webp', T2_IMG = 'quiz3-t2.webp';                 // 단상 (기본 · 인원 추가)
const CUR = ['quiz3-cur1.webp', 'quiz3-cur2.webp', 'quiz3-cur3.webp', 'quiz3-cur4.webp', 'quiz3-cur5.webp'];   // 커튼 프레임 1 (닫힘) ~ 5
const CUR_END = 'quiz3-cur6.webp';                                         // 커튼 프레임 종료(유지) — 다 열린 뒤에도 남는다
const ADMIN = 'kario0987';

const Q = {
    MAX: 6,                        // 한 쇼에 부를 수 있는 손님
    PER: 3,                        // 한 사람에 문제 셋
    PRIZE: { 1: { pts: 10000, dream: 0 }, 2: { pts: 10000, dream: 5000 }, 3: { pts: 20000, dream: 10000 } },
    FIN_MS: 6000,                  // 모두 다 풀면 이만큼 뒤에 막이 내린다 (마지막 O · X 를 볼 틈)
    Q_MAX: 80,                     // 화면에 띄우는 문제의 길이
    CAGE_MIN: 10,                  // 오답 하나에 가두리 10분 (2026-11-13 사용자 「오답 시 오답 횟수 당 가두리 10분」) — 무대에서 내려올 때 갇힌다
    LIFE_MS: 3 * 3600000,          // 안 끝내고 두어도 이만큼 지나면 끝난 쇼로 본다
    KEEP_MS: 10 * 60000,           // 끝난 쇼의 기록을 남겨 두는 동안
    NICK_MAX: 6,
    PLATE_MIN: 7.5,                // 명패 글씨가 화면에서 적어도 이만큼(px)은 되게
    POP_MS: 2600,                  // 머리 위 O · X 가 크게 떠 있는 동안
    POP: 112, HEAD: 246,           // O · X 의 크기 · 발끝에서 머리 위까지 (사람 1배일 때의 키 — 사람 칸 384 가운데 머리끝 ~ 발끝이 240 쯤)
    HAIR_BACK: 84, HAIR_FRONT: 56, // 사람 머리가 가리는 폭 — 뒤통수 쪽(긴 머리) · 얼굴 쪽. 앞줄 사람이 뒷줄 명패를 이만큼 가린다
    // 서는 자리 (방 그림 좌표 · 발끝) — f 는 보는 쪽 (1 왼쪽 · -1 오른쪽)
    //   ★ 2026-11-13 사용자 「배경 수정 3차」 — 새 그림에서 다시 쟀다 (단상 · 의자 · 명패가 120 쯤 내려왔고, 6인용 단상은 왼쪽으로 40 쯤 옮겨 왔다).
    //   뒷줄은 의자 앞 (의자 가운데 x — 298 · 500 · 709 · 사회자 1467). 앞줄(6인용 단상)은 뒷줄 사람 바로 앞 — 뒷줄 명패 사이의 틈에 서야 명패의 닉네임을 덜 가린다
    //   (단체 사진처럼 뒷줄은 머리가 위로 보인다). 앞줄 오른쪽 끝(s6)은 뒷줄 명패를 벗어나 있어 아무것도 안 가린다 — 그래서 앞줄은 오른쪽부터 채운다.
    //   발끝은 단상 윗면(뒷단상 1148 · 앞단상 1228 ~ 1248)보다 90 쯤 아래 — 사람(키 240 쯤)의 다리가 단상에 가려 **허리 위만** 보인다.
    HOST: { x: 1468, y: 1243, f: 1 },
    SEAT: {
        s1: { x: 300, y: 1243, f: -1 }, s2: { x: 500, y: 1243, f: -1 }, s3: { x: 708, y: 1243, f: -1 },
        s4: { x: 500, y: 1331, f: -1 }, s5: { x: 708, y: 1331, f: -1 }, s6: { x: 928, y: 1331, f: -1 }      // 앞단상 몸통(x 428 ~ 1128) 안쪽에 서야 다리가 상판 밑으로 안 삐져나온다
    },
    FILL3: ['s1', 's2', 's3'], FILL6: ['s1', 's2', 's3', 's6', 's5', 's4'],
    WALK: { x: 1390, y: 1500 },    // 사회자가 단상에서 내려설 자리 (무대 바닥 — 걸어 다니는 띠는 plaza.js 의 R.quiz.floor · x1)
    // 가운데 화면 (방 그림 좌표 — 그림에서 쟀다 · 금테 안쪽 갈색 판 516 ~ 1356 × 556 ~ 960 에서 모서리 장식만큼 들여서) : x · y · 폭 · 높이
    SCREEN: [562, 594, 756, 324],
    // 명패 (방 그림 좌표 — 그림에서 쟀다 · 테두리 안쪽 낯)
    PLATE: {
        s1: [356, 1128, 108, 34], s2: [530, 1128, 112, 32], s3: [718, 1128, 112, 32],
        s4: [568, 1220, 106, 32], s5: [742, 1220, 112, 30], s6: [930, 1220, 112, 30],
        host: [1334, 1126, 122, 32]
    },
    PLATE_BG: '#d0a07d', PLATE_EDGE: '#140a0c',     // 명패의 낯빛 · 테두리 (글자가 커서 명패를 늘려 그릴 때 같은 빛깔로)
    // 층 — 사람은 100 + 발끝 y. 걷힌 커튼(위쪽) < 뒷줄 사람(1343) < 뒷단상 < 앞줄 사람(1431) < 앞단상 < 무대 바닥을 걷는 사회자(1550 ~) < 걷힌 커튼(아래 자락) < O · X
    //   걷힌 커튼(끝 프레임)은 두 겹으로 깐다 — 위쪽은 사람 뒤(말풍선이 커튼에 안 가리게), CUR_SPLIT 아래 자락은 단상 앞(그림대로 단상 끝을 덮는다 · 단상 윗면 1148 바로 위에서 가른다).
    Z1: 1360, Z2: 1450, ZCUR_LOW: 60, ZCUR: 3000, CUR_SPLIT: 1120, ZTOP: 4200
};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function sys(t) { try { if (typeof window.__plazaSys === 'function') window.__plazaSys(t); } catch (e) { } }
function now() { return Date.now(); }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === SHOW; })); }
function nameOf(code) { const x = users()[code]; return (x && x.name) || code; }
function fmt(n) { return (Number(n) || 0).toLocaleString('ko-KR'); }
function roomNow() { try { return (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { return ''; } }

// ==========================================
// 쇼 — 듣기
// ==========================================
let SHOWS = {}, heard = false, onFor = '';
function live(s) { return !!(s && s.host && s.at && !s.end && now() - Number(s.at) < Q.LIFE_MS); }
function invOf(s) { return (s && s.inv && typeof s.inv === 'object') ? s.inv : {}; }
function seatsOf(s) { return (s && s.seat && typeof s.seat === 'object') ? s.seat : {}; }
function wide(s) { return Object.keys(invOf(s)).length > 3; }                       // 앞줄 단상까지 (6인용)
function seatKeys(s) { return wide(s) ? Q.FILL6 : Q.FILL3; }                        // 앉히는 차례 (앞에서부터 빈 명패)
function outOf(s, code) { const v = invOf(s)[code]; return !!(v && v.st === 'x'); }  // 사회자가 내보냈다 (🚪)
function activeN(s) { const inv = invOf(s); return Object.keys(inv).filter(function (c) { return !(inv[c] && inv[c].st === 'x'); }).length; }   // 초대 자리 — 내보낸 사람은 빼고 센다
function seatOf(s, code) {
    const st = seatsOf(s);
    for (const k in st) if (st[k] && st[k].c === code && Q.SEAT[k]) return k;
    return '';
}
function marksOf(s, code) { const m = s && s.mark && s.mark[code]; return (m && typeof m === 'object') ? m : {}; }
function markList(s, code) { const m = marksOf(s, code); const out = []; for (let i = 1; i <= Q.PER; i++) out.push(Number(m['q' + i]) || 0); return out; }
function rightN(s, code) { return markList(s, code).filter(function (v) { return v === 1; }).length; }
function wrongN(s, code) { return markList(s, code).filter(function (v) { return v === 2; }).length; }
function myHost() { const me = u_(); const s = me && SHOWS[me.code]; return live(s) ? s : null; }          // 내가 사회자인 쇼
function guestShows() {                                                                                    // 내가 초대받은 쇼들
    const me = u_(); if (!me) return [];
    return Object.keys(SHOWS).map(function (h) { return SHOWS[h]; }).filter(function (s) { return live(s) && s.host !== me.code && invOf(s)[me.code]; });
}
function seatedShow() { const me = u_(); return guestShows().filter(function (s) { return seatOf(s, me.code) && !outOf(s, me.code); })[0] || null; }
// 내가 지금 들어 있는(들어가려는) 쇼
let going = '';                              // 들어가려는 쇼의 사회자 사번
function curShow() {
    const me = u_(); if (!me) return null;
    if (going && live(SHOWS[going])) {
        const s = SHOWS[going];
        if (s.host === me.code || (seatOf(s, me.code) && !outOf(s, me.code))) return s;
    }
    return myHost() || seatedShow();
}
window.quizShowGate = function () { const s = curShow(); return s ? (Number(s.inst) || 1) : 0; };

(function listen() {
    setInterval(function () {
        const d = db_(), me = u_();
        if (!d || !me) return;
        if (onFor === me.code) return;
        onFor = me.code;
        try { d.ref(PATH).off(); } catch (e) { }
        d.ref(PATH).on('value', function (snap) {
            const was = SHOWS;
            SHOWS = snap.val() || {};
            heard = true;
            try { onShows(was); } catch (e) { console.warn('[퀴즈쇼]', e); }
        });
        watchWin(me.code);
    }, 1200);
})();

// ==========================================
// 등록 — 쇼 만들기 · 초대 · 끝내기 (사회자)
// ==========================================
function freeInst() {
    const used = {};
    Object.keys(SHOWS).forEach(function (h) { const s = SHOWS[h]; if (live(s)) used[Number(s.inst) || 1] = 1; });
    for (let i = 1; i < 200; i++) if (!used[i]) return i;
    return 1;
}
function createShow(codes) {
    const me = u_(), d = db_();
    if (!me || !d || !wears(me)) return false;
    codes = codes.filter(function (c, i) { return c && c !== me.code && codes.indexOf(c) === i; }).slice(0, Q.MAX);
    if (!codes.length) return false;
    const inv = {};
    codes.forEach(function (c) { inv[c] = { at: now(), st: 'p' }; });
    const s = { id: now(), host: me.code, name: me.name || me.code, at: now(), inst: freeInst(), inv: inv };
    SHOWS[me.code] = s;
    try { d.ref(PATH + '/' + me.code).set(s); } catch (e) { return false; }
    try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — 초대장 ' + codes.length + '장 (' + codes.map(nameOf).join(' · ') + ')'); saveFields({ history: 1 }); } catch (e) { }
    return true;
}
function inviteMore(codes) {
    const me = u_(), d = db_(), s = myHost();
    if (!me || !d || !s) return false;
    const inv = invOf(s);
    const room = Q.MAX - activeN(s);
    codes = codes.filter(function (c, i) { return c && c !== me.code && !inv[c] && codes.indexOf(c) === i; }).slice(0, Math.max(0, room));
    if (!codes.length) return false;
    const up = {};
    codes.forEach(function (c) { up[c] = { at: now(), st: 'p' }; });
    try { d.ref(PATH + '/' + me.code + '/inv').update(up); } catch (e) { return false; }
    return true;
}
// 상 — 맞힌 수대로. 한 사원에 하루 한 번.
function settle(s, code) {
    const d = db_(), me = u_();
    if (!d || !me || !s || s.host !== me.code) return Promise.resolve(false);
    const n = rightN(s, code), wrong = wrongN(s, code), cage = wrong * Q.CAGE_MIN;
    return d.ref(PATH + '/' + me.code + '/paid/' + code).transaction(function (v) {
        if (v) return;                                         // 이미 셈했다
        const o = { n: n, at: now() };
        if (cage) o.cage = cage;
        return o;
    }).then(function (r) {
        if (!r || !r.committed) return false;
        // 받을 것을 그 사원 앞으로 적는다 — 상(pz 가 있으면) · 가두리(오답이 있으면). 둘 다 없으면 안 적는다.
        const send = function (pz) {
            if (!pz && !wrong) return true;
            try { d.ref(WIN + '/' + code).push({ pts: pz ? pz.pts : 0, dream: pz ? pz.dream : 0, n: n, wrong: wrong, by: me.code, name: me.name || me.code, at: now() }); } catch (e) { }
            try {
                addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — ' + nameOf(code) + ' 사원 정답 ' + n + '개' + (pz ? ' (' + prizeText(pz) + ')' : '') + (wrong ? ' · 오답 ' + wrong + '개 (가두리 ' + cage + '분)' : ''));
                saveFields({ history: 1 });
            } catch (e) { }
            return true;
        };
        const pz = Q.PRIZE[n];
        if (!pz) return send(null);                            // 하나도 못 맞혔다 — 상은 없고 가두리만
        const day = today();
        return d.ref(DAY + '/' + code).transaction(function (v) {
            if (v === day) return;                             // 오늘 이미 받았다
            return day;
        }).then(function (r2) {
            if (!r2 || !r2.committed) {
                try { d.ref(PATH + '/' + me.code + '/paid/' + code + '/skip').set(1); } catch (e) { }
                return send(null);                             // 상은 하루 한 번 — 가두리는 그대로
            }
            return send(pz);
        });
    }).catch(function () { return false; });
}
function prizeText(pz) { return fmt(pz.pts) + ' P' + (pz.dream ? ' + ' + fmt(pz.dream) + ' 꿈결' : ''); }
// 🚪 내보내기 — 사회자가 손님(패널)을 무대에서 내린다 (머리말)
//   앉아 있었고 채점된 것이 있으면 먼저 셈한다 (상 · 오답 가두리 — 쇼를 먼저 끝낼 때와 같다). 그다음 명패를 비우고 inv/<사번>/st = 'x'.
function kick(code) {
    const s = myHost(), d = db_(), me = u_();
    if (!s || !d || !me || !code || !invOf(s)[code]) return Promise.resolve(false);
    const k = seatOf(s, code), nick = nickOf(s, code);
    if (outOf(s, code) && !k) return Promise.resolve(false);   // 이미 내보냈다 (명패가 남아 있으면 그것만 다시 비운다)
    const marked = markList(s, code).some(function (v) { return v; });
    const go = function () {
        const up = {};
        up['inv/' + code + '/st'] = 'x';
        up['inv/' + code + '/xat'] = now();
        if (k) up['seat/' + k] = null;
        // 내 화면에 먼저 (서버 값이 곧 온다)
        invOf(s)[code].st = 'x';
        if (k && s.seat) delete s.seat[k];
        if (sel === code) sel = '';
        return d.ref(PATH + '/' + me.code).update(up).then(function () {
            try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — ' + nameOf(code) + ' 사원을 ' + (k ? '무대에서 내보냈습니다.' : '초대에서 뺐습니다.')); saveFields({ history: 1 }); } catch (e) { }
            if (roomNow() === ROOM) { sys('🚪 ' + nick + ' — ' + (k ? '무대에서 내려갔습니다.' : '초대를 거뒀습니다.')); paintStage(); paintHost(); }
            return true;
        });
    };
    const first = (k && marked && !(s.paid && s.paid[code])) ? settle(s, code) : Promise.resolve(true);
    return first.then(go, go).catch(function () { return false; });
}
let ending = false;
function endShow() {
    const d = db_(), me = u_(), s = myHost();
    if (!d || !me || !s || ending) return;
    ending = true;
    const st = seatsOf(s);
    const codes = Object.keys(st).map(function (k) { return st[k] && st[k].c; }).filter(function (c) { return c && !(s.paid && s.paid[c]); });
    Promise.all(codes.map(function (c) { return settle(s, c); })).then(function () {
        try { d.ref(PATH + '/' + me.code + '/end').set(now()); } catch (e) { }
        try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — 막을 내렸습니다.'); saveFields({ history: 1 }); } catch (e) { }
    }).then(function () { ending = false; }, function () { ending = false; });
}
// 묵은 내 쇼 — 안 끝내고 둔 것은 셈하고 끝낸다 · 끝난 지 오래된 기록은 지운다
function sweepMine() {
    const d = db_(), me = u_();
    if (!d || !me || !heard) return;
    const s = SHOWS[me.code];
    if (!s) return;
    if (!s.end && now() - Number(s.at || 0) >= Q.LIFE_MS && !ending) {
        ending = true;
        const st = seatsOf(s);
        const codes = Object.keys(st).map(function (k) { return st[k] && st[k].c; }).filter(function (c) { return c && !(s.paid && s.paid[c]); });
        Promise.all(codes.map(function (c) { return settle(s, c); })).then(function () { try { d.ref(PATH + '/' + me.code + '/end').set(now()); } catch (e) { } })
            .then(function () { ending = false; }, function () { ending = false; });
    } else if (s.end && now() - Number(s.end) > Q.KEEP_MS) {
        try { d.ref(PATH + '/' + me.code).remove(); } catch (e) { }
    }
}
setInterval(function () { try { sweepMine(); } catch (e) { } }, 20000);

// ==========================================
// 채점 — 사회자가 참가자를 **누르고**(지목), 「정답」 · 「오답」 · 「땡」 이 든 말을 하면 그 사람에게 O · X
// ==========================================
//   (2026-11-13 사용자 「정답은 장착자가 눌러서 누른 사람한테」 · 「그 말만 해야 되는 게 아니라 그 말들이 들어가면 — 정답입니다 · 오답입니다」)
//   · 누르면 지목된다 (사회자 화면에만 ▼ 표 · 아래에 「🎯 닉네임 — ⭕ ❌」 띠). 띠의 ⭕ ❌ 를 눌러도 되고, 채팅으로 말해도 된다.
//   · 채점 한 번에 지목이 풀린다 — 단추를 누르고 말까지 해도 두 번 들어가지 않는다.
//   · 말 — 「오답」 · 「땡」 이 들면 X. 「정답」 이 들면 O — 다만 「정답이 아닙니다」 는 X, 물음표가 붙은 말(「정답은?」)은 채점이 아니다.
//   · 지목한 사람이 없으면 말만으로는 채점되지 않는다 (처음에는 「직전에 말한 참가자」 였다 — 누르는 것으로 바뀜).
let sel = '';                                // 지목한 참가자의 사번 (사회자 화면)
let hintAt = 0;
function verdictOf(t) {
    t = String(t || '');
    if (/오답|땡(?!큐)/.test(t)) return 2;
    if (/정답/.test(t)) {
        if (/정답\s*(이|은|은\s*커녕|이라고는)?\s*(아니|아닙|아냐|아님)/.test(t)) return 2;
        if (/[?？]/.test(t)) return 0;
        return 1;
    }
    return 0;
}
(function hooks() {
    const m0 = window.plazaOnMySay;
    window.plazaOnMySay = function (text) {
        try { if (typeof m0 === 'function') m0.apply(this, arguments); } catch (e) { }
        try {
            const s = myHost();
            if (!s || roomNow() !== ROOM) return;
            const v = verdictOf(text);
            if (!v) return;
            if (!sel || !seatOf(s, sel)) {
                if (now() - hintAt > 20000) { hintAt = now(); sys('📺 채점할 참가자를 먼저 눌러 주세요 — 누른 사람에게 ⭕ · ❌ 가 들어갑니다.'); }
                return;
            }
            judge(sel, v);
        } catch (e) { console.warn('[퀴즈쇼]', e); }
    };
})();
function pick(code) {                        // 지목 — 같은 사람을 다시 누르면 푼다
    const s = myHost();
    if (!s || !code || !seatOf(s, code)) { sel = ''; paintHost(); return; }
    if (doneAll(s, code)) { sys('📺 ' + nickOf(s, code) + ' — 이미 세 문제를 다 풀었습니다.'); sel = ''; paintHost(); return; }
    sel = (sel === code) ? '' : code;
    paintHost();
}
function doneAll(s, code) { return markList(s, code).every(function (v) { return v; }); }
function judge(code, v) {
    const s = myHost(), d = db_(), me = u_();
    if (!s || !d || !me || roomNow() !== ROOM || (v !== 1 && v !== 2) || !seatOf(s, code)) return false;
    const list = markList(s, code);
    let k = -1;
    for (let i = 0; i < Q.PER; i++) if (!list[i]) { k = i; break; }
    sel = '';                                                  // 채점 한 번에 지목이 풀린다
    if (k < 0) { sys('📺 ' + nickOf(s, code) + ' — 이미 세 문제를 다 풀었습니다.'); paintHost(); return false; }
    const key = 'q' + (k + 1);
    // 내 화면에 먼저 (서버 값이 돌아오면 같은 값이다)
    s.mark = s.mark || {}; s.mark[code] = s.mark[code] || {}; s.mark[code][key] = v;
    s.last = { c: code, v: v, k: key, at: now() };
    const up = {};
    up['mark/' + code + '/' + key] = v;
    up['last'] = s.last;
    try { d.ref(PATH + '/' + me.code).update(up); } catch (e) { }
    paintStage(); pop(s.last);
    sys('📺 ' + nickOf(s, code) + ' — ' + (v === 1 ? '⭕ 정답' : '❌ 오답') + ' (' + (k + 1) + '/' + Q.PER + ' · 맞힌 ' + rightN(s, code) + '개)');
    if (k + 1 >= Q.PER) settle(s, code);
    return true;
}
// 문제 — 사회자가 적은 글이 가운데 화면에 뜬다 (비우면 지운다)
function ask(text) {
    const s = myHost(), d = db_(), me = u_();
    if (!s || !d || !me) return false;
    const t = String(text || '').replace(/\s+/g, ' ').trim().slice(0, Q.Q_MAX);
    if (!t) { delete s.q; try { d.ref(PATH + '/' + me.code + '/q').remove(); } catch (e) { } paintStage(); return true; }
    s.q = { t: t, at: now() };
    try { d.ref(PATH + '/' + me.code + '/q').set(s.q); } catch (e) { }
    qSeen = qKey(s);
    sys('📺 문제 — ' + t);
    paintStage();
    return true;
}
// 모두 다 풀었나 — 거절하지 않은 초대 손님이 모두 앉아 세 문제씩 채점됐다
function allDone(s) {
    const inv = invOf(s);
    const need = Object.keys(inv).filter(function (c) { return inv[c] && inv[c].st !== 'n' && inv[c].st !== 'x'; });      // 거절 · 내보낸 사람은 뺀다
    if (!need.length) return false;
    return need.every(function (c) { return seatOf(s, c) && doneAll(s, c); });
}
// 다 풀렸으면 막을 내린다 (사회자 화면이 맡는다) — FIN_MS 뒤에. 그동안 화면에 「끝」 이 뜬다.
function finCheck() {
    const s = myHost(), d = db_(), me = u_();
    if (!s || !d || !me || ending || !allDone(s)) return;
    if (!s.fin) {
        s.fin = now(); finSaid[s.id] = 1;
        try { d.ref(PATH + '/' + me.code + '/fin').set(s.fin); } catch (e) { }
        sys('🎉 모든 참가자가 문제를 마쳤습니다 — 곧 막이 내립니다.');
        paintStage();
        return;
    }
    if (now() - Number(s.fin) >= Q.FIN_MS) endShow();
}
function nickOf(s, code) { const k = seatOf(s, code); const st = k && seatsOf(s)[k]; return (st && st.nick) || nameOf(code); }

// ==========================================
// 받기 — 내 앞으로 온 것 (quizWin/<나>) : 상 · 오답 가두리
// ==========================================
//   상은 받는 대로 넣는다 (claimed). 가두리는 **무대에서 내려온 뒤에** 건다 — 문제를 다 풀고도 쇼가 끝날 때까지는 단상에 서 있는다.
//   가두리까지 건 뒤에야 줄을 지운다 (그 전에 화면을 닫아도 다시 들어올 때 이어서 건다).
let winRef = null;
const cageWait = {};                         // { 줄 열쇠: { min, wrong, name } } — 무대에서 내려오기를 기다리는 가두리
let caging = false;
function watchWin(code) {
    const d = db_(); if (!d) return;
    if (winRef) { try { winRef.off(); } catch (e) { } }
    Object.keys(cageWait).forEach(function (k) { delete cageWait[k]; });
    winRef = d.ref(WIN + '/' + code);
    winRef.on('child_added', function (snap) {
        const id = snap.key, v = snap.val(), me = u_();
        if (!v || !me || me.code !== code) return;
        const wrong = Math.max(0, Math.floor(Number(v.wrong) || 0));
        const after = function () {                            // 상을 넣은 뒤 — 가두리가 있으면 기다리게 걸어 두고, 없으면 줄을 지운다
            if (wrong > 0) { cageWait[id] = { min: wrong * Q.CAGE_MIN, wrong: wrong, name: v.name || v.by || '' }; cageTry(); }
            else { try { d.ref(WIN + '/' + code + '/' + id).remove(); } catch (e) { } }
        };
        if (v.claimed) { after(); return; }                    // 상은 이미 받았다 (가두리를 걸기 전에 화면을 닫았었다)
        d.ref(WIN + '/' + code + '/' + id).transaction(function (x) {
            if (!x || x.claimed) return;
            x.claimed = true; return x;
        }).then(function (r) {
            if (!r || !r.committed) return;
            const pts = Math.max(0, Math.floor(Number(v.pts) || 0)), dream = Math.max(0, Math.floor(Number(v.dream) || 0));
            if (!pts && !dream) { after(); return; }
            try { if (pts && typeof changePoints === 'function') changePoints(pts); } catch (e) { }
            try { if (pts && typeof showPointGainEffect === 'function') showPointGainEffect(pts); } catch (e) { }
            const fin = function () {
                try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — 정답 ' + (v.n || 0) + '개 · +' + fmt(pts) + ' P' + (dream ? ' · +' + fmt(dream) + ' 꿈결' : '') + ' (' + (v.name || v.by || '') + ' 사회자)'); saveFields({ history: 1 }); } catch (e) { }
                try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
                const t = '📺 화요 퀴즈쇼 — 정답 ' + (v.n || 0) + '개! +' + fmt(pts) + ' P' + (dream ? ' · +' + fmt(dream) + ' 꿈결' : '');
                if (roomNow()) sys(t); else alert_(t);
                after();
            };
            if (!dream) { fin(); return; }
            d.ref('users/' + code + '/kroom/dream').transaction(function (x) { return Math.max(0, Math.floor(Number(x) || 0)) + dream; })
                .then(function (r2) {
                    if (r2 && r2.committed) { if (!me.kroom || typeof me.kroom !== 'object') me.kroom = {}; me.kroom.dream = Math.max(0, Math.floor(Number(r2.snapshot.val()) || 0)); }
                }).catch(function () { }).then(fin);
        });
    });
}
// 오답 가두리 — 무대(퀴즈쇼 방)에 서 있는 동안은 기다린다. 내려오면 건다.
function cageTry() {
    const me = u_(), d = db_();
    const ids = Object.keys(cageWait);
    if (!me || !d || !ids.length || caging) return;
    if (roomNow() === ROOM || document.getElementById('qz-intro')) return;
    caging = true;
    const id = ids[0], w = cageWait[id];
    cageMe(w.min).then(function (res) {
        delete cageWait[id];
        try { d.ref(WIN + '/' + me.code + '/' + id).remove(); } catch (e) { }
        const where = res && res.room ? ((window.GADURI_NAMES && window.GADURI_NAMES[res.room]) || res.room) + ' ' : '';
        const t = res && res.ok ? '📺 화요 퀴즈쇼 — 오답 ' + w.wrong + '개 · ' + where + '가두리 ' + w.min + '분'
            : (res && res.skip ? '' : '📺 화요 퀴즈쇼 — 오답 ' + w.wrong + '개. 가두리가 모두 차서 갇히지 않았습니다.');
        if (res && res.ok) { try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — 오답 ' + w.wrong + '개 · ' + where + '가두리 ' + w.min + '분 (' + w.name + ' 사회자)'); saveFields({ history: 1 }); } catch (e) { } }
        if (t) sys(t);
    }).catch(function () { }).then(function () { caging = false; if (Object.keys(cageWait).length) setTimeout(cageTry, 300); });
}
// 나를 가둔다 — 광장 → 백일몽 → … 빈 가두리 (gaduri.js · by 'quiz' · 때가 되면 저절로 풀린다). 이미 갇혀 있으면 그 가두리의 남은 때에 **더한다**.
function cageMe(min) {
    const d = db_(), me = u_();
    if (!d || !me || me.code === ADMIN) return Promise.resolve({ skip: 1 });      // 상담사는 가두지 않는다
    const ms = min * 60000;
    let cur = '';
    try { cur = (typeof window.gaduriOf === 'function') ? (window.gaduriOf(me.code) || '') : ''; } catch (e) { cur = ''; }
    if (cur) {
        return d.ref('gaduri/' + cur + '/' + me.code).transaction(function (v) {
            if (!v) return;                                    // 그 사이 풀렸다 — 아래에서 새로 건다
            if (v.auto || !Number(v.until)) return v;          // 격리에 딸린 것 · 상담사가 가둔 것(끝이 없다) — 그대로
            v.until = Math.max(now(), Number(v.until)) + ms;
            return v;
        }).then(function (r) {
            if (r && r.committed && r.snapshot.val()) return { ok: 1, room: cur };
            return cageNew(ms);
        });
    }
    return cageNew(ms);
}
function cageNew(ms) {
    const d = db_(), me = u_();
    const rooms = (typeof window.gaduriOrder === 'function') ? window.gaduriOrder() : ['plaza', 'dream', 'post'];
    return new Promise(function (res) {
        const put = function (i) {
            if (i >= rooms.length) { res({ ok: 0 }); return; }
            d.ref('gaduri/' + rooms[i]).transaction(function (box) {
                box = box || {};
                if (box[me.code]) return box;
                if (Object.keys(box).length >= 3) return;      // 찼다 — 다음 가두리
                box[me.code] = { at: now(), by: 'quiz', until: now() + ms, name: me.name || me.code };
                return box;
            }).then(function (r) { if (!r || !r.committed) put(i + 1); else res({ ok: 1, room: rooms[i] }); }).catch(function () { res({ ok: 0 }); });
        };
        put(0);
    });
}
function caged() { const me = u_(); try { return !!(me && typeof window.gaduriOf === 'function' && window.gaduriOf(me.code)); } catch (e) { return false; } }

// ==========================================
// 창 — 갈색 틀 (토크쇼와 같은 빛깔)
// ==========================================
const MOD = 'quiz-show-modal';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html, keep) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.86); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#2a1b0e,#0f0904); border:1px solid #c79a5b; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;">' + html + '</div>';
    if (!keep) w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
const BTN = 'margin:0; padding:11px; font-size:12px;';
const B_GOLD = BTN + ' background:linear-gradient(145deg,#c79a5b,#6a4a22) !important; border-color:#f3e6d2 !important; color:#1a1008 !important; font-weight:bold;';
const B_BROWN = BTN + ' background:linear-gradient(145deg,#6a4a22,#2a1b0e) !important; border-color:#c79a5b !important; color:#f3e6d2 !important;';
const B_GREY = BTN + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const B_RED = BTN + ' background:linear-gradient(145deg,#7a1414,#2a0808) !important; border-color:#c75b5b !important; color:#f3d2d2 !important;';

// ── [🎤 초대] — 고르기
window.quizShowMenu = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(SHOW + ' 를 차고 있어야 합니다.'); return; }
    if (myHost()) { manage(); return; }
    try { sweepMine(); } catch (e) { }                         // 안 끝내고 묵힌 쇼가 있으면 새로 열기 전에 셈해 둔다
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">🎤 초대 — ' + SHOW.replace('📺 ', '') + '</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:12px; line-height:1.6;">어느 무대로 부를지 고릅니다. 한 번에 1 ~ ' + Q.MAX + '명까지 초대할 수 있습니다.</div>'
        + '<button id="qz-pick-quiz" class="game-btn" style="width:100%; ' + B_GOLD + ' padding:14px; font-size:13px;">🎓 화요 퀴즈쇼</button>'
        + '<div style="font-size:10px; color:#a88d6a; margin:6px 2px 12px; line-height:1.6;">손님은 단상 뒤에 섭니다. 한 사람에 세 문제 — 문제는 가운데 화면에 띄우고, 참가자를 눌러 지목한 뒤 「정답」 · 「오답」 · 「땡」 이 든 말을 하면 채점됩니다. 모두 다 풀면 막이 내립니다.<br>맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + ' (한 사원에 하루 한 번)<br>틀리면 오답 하나에 🔒 가두리 ' + Q.CAGE_MIN + '분 — 무대에서 내려올 때 갇힙니다.</div>'
        + '<button class="game-btn" disabled style="width:100%; ' + B_GREY + ' padding:14px; font-size:13px; opacity:.55;">🛋 심야 토크쇼 — 준비 중</button>'
        + '<button id="qz-x" class="game-btn" style="width:100%; margin-top:12px !important; ' + B_GREY + '">닫는다</button>');
    w.querySelector('#qz-x').style.marginTop = '12px';
    w.querySelector('#qz-x').onclick = shut;
    w.querySelector('#qz-pick-quiz').onclick = function () { pickGuests(false); };
};
// ── 손님 고르기 (more — 이미 연 쇼에 더 부른다)
function pickGuests(more) {
    const me = u_(); if (!me) return;
    const s = more ? myHost() : null;
    const inv0 = invOf(s);
    const room = Q.MAX - (s ? activeN(s) : 0);
    if (more && room <= 0) { alert_('이미 ' + Q.MAX + '명을 초대했습니다.'); return; }
    const sel = {};
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">🎓 화요 퀴즈쇼 — ' + (more ? '더 초대' : '손님 고르기') + '</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:8px; line-height:1.6;">' + (more ? '앞으로 ' + room + '명 더 부를 수 있습니다.' : '1 ~ ' + Q.MAX + '명. 4명부터는 앞줄 단상이 하나 더 놓입니다.') + '</div>'
        + '<input id="qz-q" placeholder="이름 · 사번으로 찾기" autocomplete="off" style="width:100%; box-sizing:border-box; margin:0 0 8px; padding:9px 10px; border-radius:8px; border:1px solid #5a3f22; background:#0f0904; color:#f3e6d2; font-size:12px;">'
        + '<div id="qz-list" style="max-height:46dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; border-top:1px solid rgba(255,255,255,0.06);"></div>'
        + '<div style="display:flex; gap:8px; margin-top:12px;">'
        + '<button id="qz-no" class="game-btn" style="flex:1; ' + B_GREY + '">' + (more ? '닫는다' : '뒤로') + '</button>'
        + '<button id="qz-go" class="game-btn" style="flex:1.6; ' + B_GOLD + '">초대장 보내기 (0)</button></div>');
    const inp = w.querySelector('#qz-q'), list = w.querySelector('#qz-list'), go = w.querySelector('#qz-go');
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); });
    const paint = function () {
        const q = (inp.value || '').trim().toLowerCase();
        const book = users();
        let rows = Object.keys(book).map(function (c) { return book[c]; }).filter(function (x) { return x && x.code && x.code !== me.code && x.code !== ADMIN && !inv0[x.code]; });
        if (q) rows = rows.filter(function (x) { return String(x.name || '').toLowerCase().indexOf(q) >= 0 || String(x.code).toLowerCase().indexOf(q) >= 0 || String(x.no || '').indexOf(q) >= 0; });
        rows.sort(function (a, b) { return ((sel[b.code] ? 1 : 0) - (sel[a.code] ? 1 : 0)) || String(a.name || a.code).localeCompare(String(b.name || b.code), 'ko'); });
        const n = Object.keys(sel).length;
        list.innerHTML = rows.length ? rows.slice(0, 80).map(function (x) {
            const on = !!sel[x.code];
            return '<div class="qz-row" data-c="' + esc(x.code) + '" style="display:flex; align-items:center; gap:8px; padding:9px 2px; border-bottom:1px solid rgba(255,255,255,0.06); cursor:pointer;">'
                + '<div style="width:18px; height:18px; border-radius:4px; border:1px solid ' + (on ? '#f3e6d2' : '#5a3f22') + '; background:' + (on ? '#c79a5b' : 'transparent') + '; color:#1a1008; font-size:13px; line-height:18px; text-align:center; flex:0 0 auto;">' + (on ? '✓' : '') + '</div>'
                + '<div style="flex:1; min-width:0; font-size:12px; color:#f3e6d2;">' + esc(x.name || x.code) + '</div></div>';
        }).join('') + (rows.length > 80 ? '<div style="font-size:10px; color:#a88d6a; padding:8px 2px;">… 더 있습니다. 이름으로 찾아 주세요.</div>' : '')
            : '<div style="font-size:10.5px; color:#a88d6a; padding:10px 2px;">찾는 사원이 없습니다.</div>';
        go.textContent = '초대장 보내기 (' + n + ')';
        go.style.opacity = n ? '1' : '.5';
        Array.prototype.forEach.call(list.querySelectorAll('.qz-row'), function (r) {
            r.onclick = function () {
                const c = r.dataset.c;
                if (sel[c]) delete sel[c];
                else {
                    if (Object.keys(sel).length >= room) { alert_('한 번에 ' + Q.MAX + '명까지 초대할 수 있습니다.' + (more ? ' (앞으로 ' + room + '명)' : '')); return; }
                    sel[c] = 1;
                }
                const top = list.scrollTop; paint(); list.scrollTop = top;
            };
        });
    };
    inp.addEventListener('input', paint);
    paint();
    w.querySelector('#qz-no').onclick = function () { if (more) manage(); else window.quizShowMenu(); };
    go.onclick = function () {
        const codes = Object.keys(sel);
        if (!codes.length) { alert_('초대할 사원을 골라 주세요.'); return; }
        if (more) {
            if (inviteMore(codes)) { alert_('💌 초대장을 ' + codes.length + '장 더 보냈습니다.'); manage(); }
            return;
        }
        if (!createShow(codes)) { alert_('초대장을 보내지 못했습니다. 잠시 뒤에 다시 눌러 주세요.'); return; }
        shut();
        enter(u_().code);
    };
}
// ── 진행 (사회자) · 현황 (손님)
function statusRows(s) {
    const st = seatsOf(s), inv = invOf(s), me = u_();
    const canPick = !!(me && s.host === me.code && roomNow() === ROOM);      // 사회자 — 무대의 작은 사람을 누르기 어려울 때 여기서 지목한다
    const canKick = !!(me && s.host === me.code);                              // 사회자 — 🚪 내보내기 (무대 밖에서도)
    const kickBtn = function (c) { return canKick ? '<button class="game-btn qz-kick" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:6px 8px; font-size:10.5px; background:linear-gradient(145deg,#5a1a1a,#220a0a) !important; border-color:#a85a5a !important; color:#f3d2d2 !important;">내보내기</button>' : ''; };
    const seated = {};
    let h = '';
    seatKeys(s).forEach(function (k, i) {
        const v = st[k];
        if (!v || !v.c) return;
        seated[v.c] = 1;
        const ml = markList(s, v.c);
        const pd = s.paid && s.paid[v.c];
        h += '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:0 0 auto; width:20px; font-size:10px; color:#a88d6a;">' + (i + 1) + '</div>'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#f3e6d2;">' + esc(v.nick || nameOf(v.c)) + ' <span style="font-size:9.5px; color:#a88d6a;">· ' + esc(nameOf(v.c)) + '</span></div>'
            + '<div style="flex:0 0 auto; font-size:13px; letter-spacing:3px; font-weight:bold;">' + ml.map(function (m) { return m === 1 ? '<span style="color:#3ddc6a;">O</span>' : (m === 2 ? '<span style="color:#ff4a4a;">X</span>' : '<span style="color:#5a3f22;">·</span>'); }).join('') + '</div>'
            + ((canPick && !ml.every(function (m) { return m; })) ? '<button class="game-btn qz-pick" data-c="' + esc(v.c) + '" style="flex:0 0 auto; margin:0; padding:6px 9px; font-size:11px; background:linear-gradient(145deg,#6a4a22,#2a1b0e) !important; border-color:#c79a5b !important; color:#f3e6d2 !important;">🎯 지목</button>' : '')
            + (pd ? '<div style="flex:0 0 auto; font-size:9.5px; text-align:right; line-height:1.5; color:' + (pd.skip ? '#a88d6a' : '#c79a5b') + ';">' + (pd.skip ? '오늘은 이미 받음' : (Q.PRIZE[pd.n] ? prizeText(Q.PRIZE[pd.n]) : '상 없음'))
                + (pd.cage ? '<br><span style="color:#ff8a8a;">🔒 가두리 ' + pd.cage + '분</span>' : '') + '</div>' : '')
            + kickBtn(v.c)
            + '</div>';
    });
    Object.keys(inv).forEach(function (c) {
        if (seated[c]) return;
        const stt = inv[c] && inv[c].st;
        h += '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:0 0 auto; width:20px; font-size:10px; color:#a88d6a;">–</div>'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#a88d6a;">' + esc(nameOf(c)) + '</div>'
            + '<div style="flex:0 0 auto; font-size:10px; color:#a88d6a;">' + (stt === 'n' ? '거절' : stt === 'x' ? '내보냄' : '초대장을 보는 중') + '</div>'
            + ((stt !== 'n' && stt !== 'x') ? kickBtn(c) : '') + '</div>';
    });
    return h || '<div style="font-size:10.5px; color:#a88d6a; padding:6px 0;">아직 아무도 없습니다.</div>';
}
function manage() {
    const me = u_(), s = curShow();
    if (!me || !s) { shut(); return; }
    const host = s.host === me.code, inRoom = roomNow() === ROOM;
    const left = Q.MAX - activeN(s);
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">🎓 화요 퀴즈쇼' + (host ? ' — 진행' : '') + '</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:8px; line-height:1.6;">' + (host
            ? '참가자를 <b>눌러 지목</b>한 뒤 「정답」 · 「오답」 · 「땡」 이 든 말을 하면(또는 아래 띠의 ⭕ ❌) 그 사람에게 <b style="color:#3ddc6a;">O</b> · <b style="color:#ff4a4a;">X</b> 가 들어갑니다. 한 사람에 세 문제 — 다 채점되면 그 자리에서 상이 나가고, <b>모두 다 풀면 막이 내립니다.</b>'
            : esc(s.name || nameOf(s.host)) + ' 사회자의 무대 — 한 사람에 세 문제. 맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + ' (하루 한 번)') + '<br>오답 하나에 🔒 가두리 ' + Q.CAGE_MIN + '분 — 무대에서 내려올 때 갇힙니다.</div>'
        + '<div id="qz-status">' + statusRows(s) + '</div>'
        + '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">'
        + (!inRoom ? '<button id="qz-in" class="game-btn" style="flex:1 1 100%; ' + B_GOLD + '">무대로 들어간다</button>' : '')
        + (host && left > 0 ? '<button id="qz-more" class="game-btn" style="flex:1; ' + B_BROWN + '">더 초대 (' + left + ')</button>' : '')
        + (host ? '<button id="qz-end" class="game-btn" style="flex:1; ' + B_RED + '">지금 끝낸다</button>' : '')
        + (inRoom ? '<button id="qz-out" class="game-btn" style="flex:1; ' + B_BROWN + '">무대에서 나간다</button>' : '')
        + '<button id="qz-x" class="game-btn" style="flex:1; ' + B_GREY + '">닫는다</button></div>');
    const q = function (id) { return w.querySelector('#' + id); };
    q('qz-x').onclick = shut;
    w.addEventListener('click', function (e) {                 // 🎯 지목 (현황은 쇼가 바뀔 때마다 다시 그려지므로 창에서 받는다)
        const b = e.target && e.target.closest ? e.target.closest('.qz-pick') : null;
        if (!b) return;
        e.stopPropagation(); shut(); sel = ''; pick(b.dataset.c);
    });
    w.addEventListener('click', function (e) {                 // 🚪 내보내기 — 한 번 더 묻는다
        const b = e.target && e.target.closest ? e.target.closest('.qz-kick') : null;
        if (!b || !host) return;
        e.stopPropagation();
        const c = b.dataset.c, cur = myHost();
        if (!cur || !invOf(cur)[c] || (outOf(cur, c) && !seatOf(cur, c))) { manage(); return; }
        const on = !!seatOf(cur, c), nm = nickOf(cur, c);
        const w2 = box('<div style="text-align:center; padding:10px 4px 2px;"><div style="font-size:15px; color:#f3e6d2; letter-spacing:1px; margin-bottom:10px;">' + esc(nm) + ' — ' + (on ? '무대에서 내보냅니까?' : '초대를 거둡니까?') + '</div>'
            + '<div style="font-size:11px; color:#a88d6a; line-height:1.7;">' + (on ? '지금까지 채점된 만큼 셈하고(맞힌 수대로 상 · 오답 가두리) 명패를 비웁니다.<br>' : '') + '이 쇼에는 다시 들어오지 못합니다.</div></div>'
            + '<div style="display:flex; gap:8px; margin-top:16px;"><button id="qz-n" class="game-btn" style="flex:1; ' + B_GREY + '">아니다</button>'
            + '<button id="qz-y" class="game-btn" style="flex:1; ' + B_RED + '">' + (on ? '내보낸다' : '거둔다') + '</button></div>');
        w2.querySelector('#qz-n').onclick = manage;
        w2.querySelector('#qz-y').onclick = function () { const y = w2.querySelector('#qz-y'); y.disabled = true; kick(c).then(manage, manage); };
    });
    if (q('qz-in')) q('qz-in').onclick = function () { shut(); enter(s.host); };
    if (q('qz-more')) q('qz-more').onclick = function () { pickGuests(true); };
    if (q('qz-out')) q('qz-out').onclick = function () { shut(); leave(); };
    if (q('qz-end')) q('qz-end').onclick = function () {
        const w2 = box('<div style="text-align:center; padding:10px 4px 2px;"><div style="font-size:15px; color:#f3e6d2; letter-spacing:1px; margin-bottom:10px;">화요 퀴즈쇼의 막을 내립니까?</div>'
            + '<div style="font-size:11px; color:#a88d6a; line-height:1.7;">모두 다 풀면 저절로 막이 내립니다. 지금 내리면 덜 푼 사람도 지금까지 맞힌 수대로 상을 받고, 모두 광장으로 돌아갑니다.</div></div>'
            + '<div style="display:flex; gap:8px; margin-top:16px;"><button id="qz-n" class="game-btn" style="flex:1; ' + B_GREY + '">아직이다</button>'
            + '<button id="qz-y" class="game-btn" style="flex:1; ' + B_RED + '">막을 내린다</button></div>');
        w2.querySelector('#qz-n').onclick = manage;
        w2.querySelector('#qz-y').onclick = function () { shut(); endShow(); };
    };
}
window.quizShowManage = manage;

// ==========================================
// 초대장 — 손님 쪽
// ==========================================
const later = {};                            // { 쇼 id: 1 } — 「나중에」 로 접어 둔 초대장
function pendingShow() {
    const me = u_(); if (!me) return null;
    return guestShows().filter(function (s) { const v = invOf(s)[me.code]; return v && v.st !== 'n' && v.st !== 'x' && !seatOf(s, me.code); })[0] || null;
}
function inDark() {
    try { if (typeof darkRun !== 'undefined' && darkRun) return true; } catch (e) { }
    try { const o = document.getElementById('dark-run-overlay'); if (o && o.getClientRects().length) return true; } catch (e) { }
    return false;
}
function busy() {
    // 탐사 중 · 다른 창이 떠 있을 때는 초대장을 바로 들이밀지 않는다 (끝나면 뜬다)
    if (inDark()) return true;
    if (document.getElementById(MOD) || document.getElementById('qz-intro')) return true;
    try { const a = document.getElementById('custom-alert-overlay'); if (a && a.style.display !== 'none' && a.getClientRects().length) return true; } catch (e) { }
    return false;
}
function inviteCard(s) {
    const me = u_(); if (!me || !s) return;
    const w = box('<div style="text-align:center; padding:8px 4px 2px;">'
        + '<div style="font-size:28px; margin-bottom:8px; text-shadow:0 0 14px rgba(199,154,91,.8);">💌</div>'
        + '<div style="font-size:16px; letter-spacing:2px; color:#f3e6d2; font-family:\'Nanum Myeongjo\',\'Noto Serif KR\',serif; text-shadow:0 0 10px rgba(199,154,91,.6);">화요 퀴즈쇼 초대장</div>'
        + '<div style="font-size:11px; color:#a88d6a; margin-top:10px; line-height:1.7;">' + esc(s.name || nameOf(s.host)) + ' 사회자가 무대로 초대했습니다.<br>한 사람에 세 문제 — 맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + '<br>틀리면 오답 하나에 🔒 가두리 ' + Q.CAGE_MIN + '분</div>'
        + '<div style="font-size:11px; color:#f3e6d2; margin:14px 0 6px;">명패에 적을 닉네임</div>'
        + '<input id="qz-nick" maxlength="' + Q.NICK_MAX + '" autocomplete="off" style="width:100%; box-sizing:border-box; padding:11px 10px; border-radius:8px; border:1px solid #c79a5b; background:#f3e6d2; color:#1a1008; font-size:15px; font-weight:bold; text-align:center; letter-spacing:1px;">'
        + '<div style="font-size:9.5px; color:#a88d6a; margin-top:5px;">' + Q.NICK_MAX + '자까지 · 단상의 비어 있는 명패에 적힙니다</div>'
        + '</div>'
        + '<div style="display:flex; gap:8px; margin-top:14px;">'
        + '<button id="qz-no" class="game-btn" style="flex:1; ' + B_GREY + '">거절</button>'
        + '<button id="qz-later" class="game-btn" style="flex:1; ' + B_BROWN + '">나중에</button>'
        + '<button id="qz-yes" class="game-btn" style="flex:1.4; ' + B_GOLD + '">입장</button></div>', true);
    const inp = w.querySelector('#qz-nick');
    inp.value = String(me.name || '').slice(0, Q.NICK_MAX);
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); });
    w.querySelector('#qz-later').onclick = function () { later[s.id] = 1; shut(); chip(); };
    w.querySelector('#qz-no').onclick = function () {
        const d = db_();
        try { if (d) d.ref(PATH + '/' + s.host + '/inv/' + me.code + '/st').set('n'); } catch (e) { }
        if (invOf(s)[me.code]) invOf(s)[me.code].st = 'n';
        shut(); chip();
    };
    w.querySelector('#qz-yes').onclick = function () {
        bgmUnlock();                                           // 🎺 자리를 잡는 동안(서버를 다녀오는 동안) 손길이 끊기므로 여기서 미리 연다
        const nick = String(inp.value || '').replace(/\s+/g, ' ').trim().slice(0, Q.NICK_MAX);
        if (!nick) { alert_('명패에 적을 닉네임을 적어 주세요.'); return; }
        accept(s, nick);
    };
}
function accept(s, nick) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    if (!live(SHOWS[s.host])) { shut(); alert_('이미 끝난 쇼입니다.'); return; }
    if (!invOf(SHOWS[s.host])[me.code] || outOf(SHOWS[s.host], me.code)) { shut(); alert_('초대가 거둬졌습니다.'); return; }
    if (caged()) { alert_('🔒 가두리에 갇혀 있는 동안은 무대에 설 수 없습니다.\n풀려난 뒤에 [입장] 을 눌러 주세요.'); return; }
    const keys = seatKeys(SHOWS[s.host]);
    let got = '';
    d.ref(PATH + '/' + s.host + '/seat').transaction(function (v) {
        v = v || {};
        got = '';
        for (const k in v) if (v[k] && v[k].c === me.code) { got = k; v[k].nick = nick; return v; }   // 이미 앉았다 — 닉네임만 바꾼다
        for (let i = 0; i < keys.length; i++) if (!v[keys[i]] || !v[keys[i]].c) { got = keys[i]; v[got] = { c: me.code, nick: nick, at: now() }; return v; }
        return;                                                                                    // 자리가 없다
    }).then(function (r) {
        if (!r || !r.committed || !got) { alert_('단상에 빈자리가 없습니다.'); return; }
        if (outOf(SHOWS[s.host], me.code)) {                   // 앉는 사이에 사회자가 초대를 거뒀다 — 자리를 도로 비운다
            try { d.ref(PATH + '/' + s.host + '/seat/' + got).transaction(function (v) { return (v && v.c === me.code) ? null : undefined; }); } catch (e) { }
            shut(); alert_('초대가 거둬졌습니다.'); return;
        }
        try { d.ref(PATH + '/' + s.host + '/inv/' + me.code + '/st').transaction(function (v) { return v === 'x' ? undefined : 'y'; }); } catch (e) { }
        // 내 화면에 먼저 (서버 값이 곧 온다)
        const cur = SHOWS[s.host];
        if (cur) { cur.seat = r.snapshot.val() || cur.seat; }
        shut(); chip();
        enter(s.host);
    }).catch(function () { alert_('초대장을 처리하지 못했습니다. 잠시 뒤에 다시 눌러 주세요.'); });
}
// 화면 위 작은 단추 — 접어 둔 초대장 · 다시 들어가기
function chip() {
    const me = u_();
    let el = document.getElementById('qz-chip');
    let label = '', fn = null;
    const pend = pendingShow(), cur = curShow();
    if (roomNow() === ROOM && cur) { label = ''; }
    else if (pend && later[pend.id]) { label = '💌 화요 퀴즈쇼 초대장'; fn = function () { inviteCard(pend); }; }
    else if (cur && me && cur.host !== me.code && roomNow() !== ROOM) { label = '📺 화요 퀴즈쇼 — 무대로'; fn = function () { enter(cur.host); }; }
    else if (cur && me && cur.host === me.code && roomNow() !== ROOM) { label = '📺 화요 퀴즈쇼 — 진행 중'; fn = manage; }
    if (!label || document.getElementById('qz-intro') || inDark()) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('button');
        el.id = 'qz-chip';
        el.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); top:calc(env(safe-area-inset-top, 0px) + 58px); z-index:99990000; padding:8px 14px; border-radius:16px; border:1px solid #c79a5b; background:linear-gradient(145deg,#3a2612,#140c05); color:#f3e6d2; font-size:12px; font-weight:bold; box-shadow:0 3px 14px rgba(0,0,0,.6); white-space:nowrap;';
        el.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        document.body.appendChild(el);
    }
    if (el.textContent !== label) el.textContent = label;
    el.onclick = function (e) { e.stopPropagation(); if (fn) fn(); };
}

// ==========================================
// 🎺 쇼타임 — 들어갈 때 「빰」 하고 틀고, 그 뒤로는 잔잔하게 깐다 (2026-11-13 사용자)
// ==========================================
//   곡은 리듬 게임의 「Showtime!」 (snd/rhythm-showtime.mp3). 그 곡에 **세기를 미리 입혀 둔** 한 벌을 따로 쓴다 (snd/quiz-showtime.mp3):
//       처음 두 마디(4.9초까지)는 크게(0.85) → 셋째 마디(4.9 ~ 6.8초)에 걸쳐 줄어 → 넷째 마디부터 끝까지 잔잔하게(0.17).
//   ★ 화면에서 소리 크기를 줄이지 않는 까닭 — 아이폰은 audio.volume 을 못 바꾼다 (늘 1). 줄여서 틀면 아이폰에서만 끝까지 크게 난다.
//     크기를 파일에 입혀 두면 어느 기기에서든 같다.
//   끝까지 가면 잔잔한 데(LOOP_AT · 넷째 마디)로 돌아가 되풀이한다 — 「빰」 은 들어올 때 한 번만.
//   쉬는 때 — 광장 위 🔊 를 꺼 두었거나 · 플레이리스트 · 리듬 게임 · 광장 피아노가 소리를 내는 동안. 무대에서 내려오면 멈춘다.
const BGM = { SRC: 'snd/quiz-showtime.mp3', LOOP_AT: 6.757 };
let bgm = null, bgmWant = false;
function bgmEl() {
    if (bgm) return bgm;
    bgm = new Audio(BGM.SRC);
    bgm.preload = 'auto';
    bgm.addEventListener('ended', function () {
        if (!bgmWant) return;
        try { bgm.currentTime = BGM.LOOP_AT; const p = bgm.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { }
    });
    return bgm;
}
function bgmOk() {
    try { if (typeof window.eventBgmMuted === 'function' && window.eventBgmMuted()) return false; } catch (e) { }
    try { if (typeof window.playlistOn === 'function' && window.playlistOn()) return false; } catch (e) { }
    try { if (typeof window.lpPianoBusy === 'function' && window.lpPianoBusy()) return false; } catch (e) { }
    try { if (document.body.classList.contains('rg-on')) return false; } catch (e) { }
    return true;
}
// 누른 그 손길 안에서 소리 길을 열어 둔다 — 소리는 연출이 끝난 뒤(몇 초 뒤)에 나는데, 아이폰은 손길 없이 처음 트는 소리를 막는다
function bgmUnlock() {
    try { sfxCtx(true); } catch (e) { }                         // 🔔 정답 · 오답 소리 길도 같이 연다
    try {
        const a = bgmEl();
        if (a._open || !a.paused) return;
        a.muted = true;
        const done = function (ok) {
            if (ok) a._open = true;
            if (a.muted) { try { a.pause(); a.currentTime = 0; } catch (e) { } a.muted = false; }      // 그 사이 진짜로 틀기 시작했으면(muted 가 풀렸으면) 건드리지 않는다
        };
        const p = a.play();
        if (p && p.then) p.then(function () { done(true); }, function () { done(false); }); else done(true);
    } catch (e) { }
}
// bang — 처음부터 (빰). 아니면 잔잔한 데서부터 (광장을 닫았다 열어 무대로 돌아온 때 · 🔊 를 다시 켠 때)
function bgmStart(bang) {
    bgmWant = true;
    if (!bgmOk()) return;
    try {
        const a = bgmEl();
        a.muted = false;
        try { a.volume = 1; } catch (e) { }
        try { a.currentTime = bang ? 0 : BGM.LOOP_AT; } catch (e) { }
        const p = a.play();
        if (p && p.catch) p.catch(function () { /* 아직 막혀 있다 — 다음 누름 때 (아래) */ });
    } catch (e) { }
}
function bgmStop() {
    bgmWant = false;
    if (bgm && !bgm.paused) { try { bgm.pause(); } catch (e) { } }
}
// 무대에 있는 동안 — 쉬어야 하면 멈추고, 다시 틀어도 되면 잔잔한 데서 잇는다
function bgmTick(inRoom) {
    if (!inRoom) { if (bgmWant || (bgm && !bgm.paused && !bgm.muted)) bgmStop(); return; }
    if (document.getElementById('qz-intro')) return;             // 연출 중 — 커튼이 걷힐 때 튼다
    if (!bgmWant) { bgmStart(false); return; }                   // 연출 없이 무대에 서 있다 (광장을 닫았다 연 때)
    const a = bgmEl();
    if (!bgmOk()) { if (!a.paused) { try { a.pause(); } catch (e) { } } return; }
    if (a.paused) {
        try { if (a.currentTime < BGM.LOOP_AT) a.currentTime = BGM.LOOP_AT; const p = a.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { }
    }
}
['pointerdown', 'keydown', 'touchend'].forEach(function (t) {     // 브라우저가 막았다가 풀린 때 — 누를 때 한 번 더 청한다
    document.addEventListener(t, function () {
        if (!bgmWant || !bgm || !bgm.paused || roomNow() !== ROOM || !bgmOk()) return;
        try { if (bgm.currentTime < BGM.LOOP_AT) bgm.currentTime = BGM.LOOP_AT; const p = bgm.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { }
    }, true);
});

// ==========================================
// 들어가기 · 나가기
// ==========================================
function enter(host) {
    const me = u_();
    const s = SHOWS[host];
    if (!me || !live(s)) { alert_('이미 끝난 쇼입니다.'); return; }
    if (s.host !== me.code && outOf(s, me.code)) { alert_('사회자가 내보낸 쇼에는 다시 들어갈 수 없습니다.'); return; }
    if (s.host !== me.code && !seatOf(s, me.code)) { alert_('초대장으로 먼저 자리에 앉아야 합니다.'); return; }
    if (caged()) { alert_('🔒 가두리에 갇혀 있는 동안은 무대에 설 수 없습니다.'); return; }
    bgmUnlock();                                               // 🎺 누른 손길 안에서 소리 길을 열어 둔다
    going = host;
    try { if (typeof window.plazaPanelClose === 'function') window.plazaPanelClose(); } catch (e) { }
    if (!roomNow()) { try { if (typeof window.plazaOpen === 'function') window.plazaOpen(); } catch (e) { } }
    if (!roomNow()) { alert_('지금은 광장에 들어갈 수 없습니다.'); return; }
    const first = seenIntro() !== String(s.id);
    intro(first, function () {
        // 막 뒤에서 방을 옮긴다
        try { window.plazaGo(ROOM); } catch (e) { }
        if (roomNow() !== ROOM) { going = ''; alert_('지금은 무대에 들어갈 수 없습니다. (가두리 · 냄비에 갇혀 있으면 못 듭니다)'); return false; }
        seat(); paintStage();
        markIntro(s.id);
        return true;
    });
}
function leave() {
    going = '';
    hostDown = false; sel = ''; closeShow = null;
    bgmStop();
    try { if (typeof window.plazaPin === 'function') window.plazaPin(null); } catch (e) { }
    try { if (roomNow() === ROOM) window.plazaGo(START); } catch (e) { }
    clearStage();
    chip();
}
function seenIntro() { try { return sessionStorage.getItem('qzIntro') || ''; } catch (e) { return ''; } }
function markIntro(id) { try { sessionStorage.setItem('qzIntro', String(id)); } catch (e) { } }
let hostDown = false;                        // 사회자가 단상에서 내려와 있다 (걸어 다닌다 · 2026-11-13 사용자 「장착자는 단상에서 내려와서 움직일 수 있게」)
function mySpot(s) {
    const me = u_(); if (!me || !s) return null;
    if (s.host === me.code) return Q.HOST;
    const k = seatOf(s, me.code);
    return k ? Q.SEAT[k] : null;
}
function seat() {
    const s = curShow(), sp = mySpot(s), me = u_();
    if (!sp || roomNow() !== ROOM || typeof window.plazaPin !== 'function') return;
    let p = null;
    try { p = window.plazaPinned(); } catch (e) { }
    if (s.host === me.code && hostDown) {                      // 내려와 있다 — 붙박이를 풀고 무대 바닥에 세운다 (그 뒤로는 제 발로 걷는다)
        if (p) window.plazaPin(null, Q.WALK);
        return;
    }
    if (p && Math.abs(p.x - sp.x) < 1 && Math.abs(p.y - sp.y) < 1) return;
    window.plazaPin(sp);
}
function hostWalk(down) {
    const s = myHost();
    if (!s || roomNow() !== ROOM) return;
    hostDown = (down == null) ? !hostDown : !!down;
    seat(); paintHost();
    sys(hostDown ? '🚶 단상에서 내려왔습니다 — 무대 바닥을 걸어 다닐 수 있습니다.' : '🎤 단상으로 돌아왔습니다.');
}

// ==========================================
// 무대 — 단상 · 명패 · O X (방 그림 위에 얹는 층)
// ==========================================
(function css() {
    const st = document.createElement('style');
    st.textContent = [
        '.qz-layer{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;}',
        '.qz-plate{position:absolute;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;pointer-events:none;',
        '  transform-origin:0 0;color:#2a1420;font-weight:bold;letter-spacing:0;line-height:1;}',
        '.qz-pips{position:absolute;display:flex;gap:12%;justify-content:center;align-items:center;pointer-events:none;}',
        '.qz-pips i{display:block;flex:0 0 auto;border-radius:50%;box-sizing:border-box;border:1px solid rgba(243,230,210,.45);background:rgba(20,8,16,.75);position:relative;}',
        '.qz-pips i.o{background:#1fbf52;border-color:#b9ffd0;box-shadow:0 0 6px rgba(61,220,106,.9);}',
        '.qz-pips i.x{background:#e02626;border-color:#ffc4c4;box-shadow:0 0 6px rgba(255,74,74,.9);}',
        '.qz-pop{position:absolute;pointer-events:none;animation:qzPop 2.6s cubic-bezier(.2,1.4,.3,1) forwards;}',
        '.qz-pop.o i{position:absolute;inset:6%;border-radius:50%;border:solid #2fe06a;box-sizing:border-box;box-shadow:0 0 10px rgba(61,220,106,.95),inset 0 0 8px rgba(61,220,106,.7),0 0 0 2px #063d18,inset 0 0 0 2px #063d18;}',
        '.qz-pop.x i{position:absolute;left:50%;top:50%;width:112%;border-radius:999px;background:#ff3636;box-shadow:0 0 10px rgba(255,59,59,.95),0 0 0 2px #4a0606;}',
        '.qz-pop.x i:first-child{transform:translate(-50%,-50%) rotate(45deg);}',
        '.qz-pop.x i:last-child{transform:translate(-50%,-50%) rotate(-45deg);}',
        '@keyframes qzPop{0%{transform:scale(.2);opacity:0}12%{transform:scale(1.25);opacity:1}22%{transform:scale(1)}80%{transform:scale(1);opacity:1}100%{transform:scale(1.1) translateY(-18%);opacity:0}}',
        '#plaza-ov.qz-on #plaza-who{display:none !important;}',                    /* 「같이 있는 사람」 줄이 간판을 덮는다 — 이 방은 명패가 그 몫을 한다 */
        '#plaza-ov.qz-on .plaza-tag{display:none !important;}',                     /* 머리 위 이름표 — 앞줄 것이 뒷줄 얼굴을 덮는다. 누구인지는 명패(닉네임)와 📺 현황이 알려 준다 */
        '#qz-ctl{position:absolute;right:12px;top:62px;z-index:60;padding:8px 14px;border-radius:14px;border:1px solid #c79a5b;background:rgba(42,27,14,.9);color:#f3e6d2;font-size:12px;font-weight:bold;box-shadow:0 3px 12px rgba(0,0,0,.5);}',
        // 사회자 단추 (문제 내기 · 내려가기) — 📺 단추 아래로
        '.qz-hbtn{position:absolute;right:12px;z-index:60;padding:8px 14px;border-radius:14px;border:1px solid #c79a5b;background:rgba(42,27,14,.9);color:#f3e6d2;font-size:12px;font-weight:bold;box-shadow:0 3px 12px rgba(0,0,0,.5);}',
        '#qz-ask{top:102px;}', '#qz-walk{top:142px;}',
        // 가운데 화면의 문제
        '#qz-scr{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;pointer-events:none;transform-origin:0 0;box-sizing:border-box;padding:0 6px;',
        '  color:#fff1d8;font-weight:bold;line-height:1.28;word-break:keep-all;overflow-wrap:anywhere;text-shadow:0 0 10px rgba(255,186,110,.75),0 2px 0 #1e0c06;}',      /* 갈색 판에 맞춘 따뜻한 빛 (3차 그림) */
        '#qz-scr.fin{color:#ffe9a8;text-shadow:0 0 12px rgba(255,200,90,.9),0 2px 0 #3a2408;}',
        // 사회자가 누르는 자리 · 지목 표 · 채점 띠
        '.qz-hit{position:absolute;pointer-events:auto;cursor:pointer;background:transparent;-webkit-tap-highlight-color:transparent;}',
        '.qz-sel{position:absolute;pointer-events:none;color:#ffd76a;font-weight:900;line-height:1;text-align:center;text-shadow:0 0 6px rgba(255,200,60,.95),0 1px 0 #3a2408;animation:qzSel .6s ease-in-out infinite alternate;}',
        '@keyframes qzSel{from{transform:translateY(0)}to{transform:translateY(-24%)}}',
        '#qz-bar{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 84px);z-index:61;display:flex;align-items:center;gap:8px;padding:7px 9px 7px 14px;',
        '  border-radius:999px;border:1px solid #c79a5b;background:rgba(30,19,9,.95);color:#f3e6d2;font-size:13px;font-weight:bold;box-shadow:0 4px 16px rgba(0,0,0,.6);white-space:nowrap;max-width:94vw;}',
        '#qz-bar .nm{overflow:hidden;text-overflow:ellipsis;max-width:40vw;}',
        '#qz-bar button{flex:0 0 auto;width:44px;height:44px;border-radius:50%;border:2px solid;font-size:22px;font-weight:900;line-height:1;display:flex;align-items:center;justify-content:center;background:#150d06;padding:0;}',
        '#qz-bar .o{color:#3ddc6a;border-color:#3ddc6a;}', '#qz-bar .x{color:#ff4a4a;border-color:#ff4a4a;}',
        '#qz-bar .c{width:30px;height:30px;font-size:13px;color:#a88d6a;border:1px solid #5a3f22;}'
    ].join('\n');
    document.head.appendChild(st);
})();
let popKey = '';                             // 마지막으로 띄운 O · X (같은 것을 두 번 안 띄운다)
function lastKey(s) { const l = s && s.last; return l ? [s.id, l.c, l.k, l.v, l.at].join('|') : ''; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function clearStage() {
    Array.prototype.forEach.call(document.querySelectorAll('.qz-layer, .qz-plate, .qz-pips, .qz-pop, #qz-ctl, #qz-scr, .qz-hit, .qz-sel, #qz-bar, .qz-hbtn'), function (e) { e.remove(); });     // 커튼 층(#qz-curplay)도 .qz-layer 다
    const ov = document.getElementById('plaza-ov'); if (ov) ov.classList.remove('qz-on');
}
function px(v, z) { return Math.round(v * z) + 'px'; }
function paintStage() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) { if (document.querySelector('.qz-layer, #qz-ctl')) clearStage(); return; }
    const s = curShow() || (closing ? closeShow : null);
    const el = sg.el, z = sg.z;
    // ── 단상 · 커튼 그림
    const need = function (id, src, zi, on, clip) {
        let im = el.querySelector('#' + id);
        if (!on) { if (im) im.remove(); return; }
        if (!im) {
            im = document.createElement('img');
            im.id = id; im.className = 'qz-layer'; im.alt = ''; im.src = DIR + src;
            if (clip) im.style.clipPath = im.style.webkitClipPath = clip;
            el.appendChild(im);
        }
        im.style.zIndex = String(zi);
    };
    need('qz-t1', T1_IMG, Q.Z1, true);
    need('qz-t2', T2_IMG, Q.Z2, !!(s && wide(s)));
    // 걷힌 커튼 — 끝 프레임은 늘 남는다 (2026-11-13 사용자 「마지막 프레임을 유지」)
    need('qz-cur', CUR_END, Q.ZCUR_LOW, true);
    need('qz-cur-f', CUR_END, Q.ZCUR, true, 'inset(' + (Q.CUR_SPLIT / sg.h * 100).toFixed(3) + '% 0 0 0)');
    // ── 명패
    const st = seatsOf(s);
    // 앞줄에 선 사람 — 뒷줄 명패의 양 끝이 그 머리에 가린다 (앞단상은 뒷단상에 겹쳐 놓여 있다). 그 명패는 **보이는 틈**에만 적는다.
    const frontX = (s && wide(s)) ? ['s4', 's5', 's6'].filter(function (k) { return st[k] && st[k].c; }).map(function (k) { return Q.SEAT[k].x; }) : [];
    const plate = function (key, text, zi) {
        const id = 'qz-pl-' + key, r = Q.PLATE[key];
        let p = el.querySelector('#' + id);
        if (!text) { if (p) p.remove(); return; }
        if (!p) { p = document.createElement('div'); p.id = id; p.className = 'qz-plate'; el.appendChild(p); }
        const rear = (key === 's1' || key === 's2' || key === 's3');
        const sig = text + '|' + z + '|' + (rear ? frontX.join(',') : '');
        if (p._sig === sig) return;
        p._sig = sig;
        // ★ 방 그림 크기 그대로 적고 **통째로 줄인다** (transform) — 글자 크기로 줄이면 브라우저의 최소 글자 크기에 걸려 명패 밖으로 넘친다.
        const len = Math.max(2, Array.from(text).reduce(function (a, ch) { return a + (ch.charCodeAt(0) < 256 ? 0.6 : 1); }, 0));
        let lo = r[0] + 6, hi = r[0] + r[2] - 6, cut = false;
        if (rear) {
            const mid = r[0] + r[2] / 2;
            frontX.forEach(function (fx) {                     // 앞줄은 오른쪽을 본다 — 왼쪽이 뒤통수
                const a = fx - Q.HAIR_BACK, b = fx + Q.HAIR_FRONT;
                if (b <= lo || a >= hi) return;
                cut = true;
                if (fx < mid) lo = Math.max(lo, b); else hi = Math.min(hi, a);
            });
            if (hi - lo < 30) { lo = r[0] + 6; hi = r[0] + r[2] - 6; cut = false; }
        }
        let fs, W, left, grown = false;
        if (cut) {
            // 가린 명패 — 보이는 틈 안에 다 들게
            W = hi - lo; left = lo;
            fs = Math.max(9, Math.min(r[3] * 0.7, (W - 2) / len));
        } else {
            // 글자는 화면에서 적어도 PLATE_MIN px 로 읽히게 한다 (세로 손전화에서는 방이 넉 장에 한 장 꼴로 줄어든다).
            //   그러느라 명패 그림보다 길어지면 **명패를 그만큼 늘려 그린다** (같은 빛깔 바탕) — 옆 명패에 닿기 전까지만.
            const maxW = key === 'host' ? 300 : 174;
            fs = Math.min(r[3] * 0.7, Math.max((r[2] - 14) / len, Q.PLATE_MIN / z));
            fs = Math.max(9, Math.min(fs, (maxW - 14) / len));
            W = Math.max(r[2], Math.min(maxW, Math.ceil(len * fs + 14)));
            left = r[0] + r[2] / 2 - W / 2;
            grown = W > r[2] + 1;
        }
        p.style.left = px(left, z); p.style.top = px(r[1], z); p.style.width = W + 'px'; p.style.height = r[3] + 'px';
        p.style.transform = 'scale(' + z + ')';
        p.style.zIndex = String(zi);
        p.style.background = grown ? Q.PLATE_BG : 'transparent';
        p.style.boxShadow = grown ? '0 0 0 4px ' + Q.PLATE_EDGE : 'none';
        p.style.fontSize = fs.toFixed(1) + 'px';
        p.textContent = text;
    };
    ['s1', 's2', 's3', 's4', 's5', 's6'].forEach(function (k) {
        const on = s && seatKeys(s).indexOf(k) >= 0 && st[k] && st[k].c;
        plate(k, on ? String(st[k].nick || nameOf(st[k].c)) : '', (k > 's3' ? Q.Z2 : Q.Z1) + 1);
    });
    plate('host', s ? String(s.name || nameOf(s.host)) : '', Q.Z1 + 1);
    paintMarks();
    // ── 오른쪽 위 단추
    const ov = sg.ov;
    if (ov && !ov.classList.contains('qz-on')) ov.classList.add('qz-on');
    if (ov && !ov.querySelector('#qz-ctl')) {
        const b = document.createElement('button');
        b.id = 'qz-ctl';
        b.textContent = '📺 화요 퀴즈쇼';
        b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        b.onclick = function (e) { e.stopPropagation(); manage(); };
        ov.appendChild(b);
    }
    paintScreen(sg, s);
    paintHost();
}
// 가운데 화면 — 사회자가 낸 문제 (2026-11-13 사용자 「토크쇼 중앙 빈 화면에 장비 장착자가 쓴 문제가 뜨게」). 모두 다 풀면 「끝」.
function paintScreen(sg, s) {
    const el = sg.el, z = sg.z, R = Q.SCREEN;
    let p = el.querySelector('#qz-scr');
    const fin = !!(s && s.fin);
    const text = s ? (fin ? '🎉 모든 문제가 끝났습니다' : String((s.q && s.q.t) || '')) : '';
    if (!text) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement('div'); p.id = 'qz-scr'; el.appendChild(p); }
    const sig = text + '|' + z;
    if (p._sig === sig) return;
    p._sig = sig;
    // 방 그림 크기 그대로 적고 통째로 줄인다 (명패와 같은 길) — 글이 길면 글자를 줄여 화면 안에 다 들인다
    p.style.left = px(R[0], z); p.style.top = px(R[1], z); p.style.width = R[2] + 'px'; p.style.height = R[3] + 'px';
    p.style.transform = 'scale(' + z + ')';
    p.style.zIndex = '70';                                     // 걷힌 커튼(위쪽) 앞 · 사람 뒤
    p.classList.toggle('fin', fin);
    p.textContent = text;
    let fs = Math.max(26, Math.min(92, Math.sqrt(R[2] * R[3] / (Math.max(1, Array.from(text).length) * 1.25))));
    for (let i = 0; i < 16; i++) {
        p.style.fontSize = fs.toFixed(1) + 'px';
        if (p.scrollHeight <= R[3] + 1 && p.scrollWidth <= R[2] + 1) break;
        fs *= 0.92;
        if (fs < 18) break;
    }
}
// 사회자 화면에만 — 문제 내기 · 내려가기 단추 / 참가자를 누르는 자리 / 지목 표(▼) · 채점 띠
function paintHost() {
    const sg = stage(), me = u_(), s = curShow();
    const host = !!(sg && sg.room === ROOM && s && me && s.host === me.code);
    const ov = (sg && sg.ov) || document.getElementById('plaza-ov');
    const drop = function (q) { Array.prototype.forEach.call(document.querySelectorAll(q), function (e) { e.remove(); }); };
    if (!host) { drop('.qz-hit, .qz-sel, #qz-bar, .qz-hbtn'); return; }
    const el = sg.el, z = sg.z, kk = sg.k || z;
    // ── 단추 둘
    const hbtn = function (id, label, fn) {
        let b = ov.querySelector('#' + id);
        if (!b) {
            b = document.createElement('button'); b.id = id; b.className = 'qz-hbtn';
            b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
            b.onclick = function (e) { e.stopPropagation(); fn(); };
            ov.appendChild(b);
        }
        if (b.textContent !== label) b.textContent = label;
    };
    hbtn('qz-ask', '✏️ 문제 내기', askBox);
    hbtn('qz-walk', hostDown ? '🎤 단상으로' : '🚶 내려가기', function () { hostWalk(); });
    // ── 누르는 자리 — 머리(몸)와 명패. 앞줄 것이 뒷줄 것 위에 온다 (보이는 대로)
    const st = seatsOf(s), keep = {};
    ['s1', 's2', 's3', 's4', 's5', 's6'].forEach(function (k) {
        const v = st[k];
        if (!v || !v.c || seatKeys(s).indexOf(k) < 0) return;
        const sp = Q.SEAT[k], r = Q.PLATE[k], front = k > 's3';
        const rects = [
            ['h', sp.x * z - 64 * z, sp.y * z - (Q.HEAD + 12) * kk, 128 * z, 132 * kk],
            ['p', (r[0] - 8) * z, (r[1] - 4) * z, (r[2] + 16) * z, (r[3] + 44) * z]
        ];
        rects.forEach(function (q) {
            const id = 'qz-hit-' + k + '-' + q[0];
            keep[id] = 1;
            let h = el.querySelector('#' + id);
            if (!h) {
                h = document.createElement('div'); h.id = id; h.className = 'qz-hit';
                h.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
                h.addEventListener('click', function (e) { e.stopPropagation(); pick(h.dataset.c); });
                el.appendChild(h);
            }
            h.dataset.c = v.c;
            h.style.left = Math.round(q[1]) + 'px'; h.style.top = Math.round(q[2]) + 'px';
            h.style.width = Math.max(24, Math.round(q[3])) + 'px'; h.style.height = Math.max(24, Math.round(q[4])) + 'px';
            h.style.zIndex = String(Q.ZTOP + (front ? 6 : 5));
        });
    });
    Array.prototype.forEach.call(el.querySelectorAll('.qz-hit'), function (h) { if (!keep[h.id]) h.remove(); });
    // ── 지목 표 · 채점 띠
    if (sel && (!seatOf(s, sel) || doneAll(s, sel))) sel = '';
    let mk = el.querySelector('.qz-sel'), bar = ov.querySelector('#qz-bar');
    if (!sel) { if (mk) mk.remove(); if (bar) bar.remove(); return; }
    const sk = seatOf(s, sel), sp = Q.SEAT[sk];
    const fz = Math.max(16, Math.round(64 * z));
    if (!mk) { mk = document.createElement('div'); mk.className = 'qz-sel'; mk.textContent = '▼'; el.appendChild(mk); }
    mk.style.fontSize = fz + 'px'; mk.style.width = (fz * 2) + 'px';
    mk.style.left = Math.round(sp.x * z - fz) + 'px'; mk.style.top = Math.round(sp.y * z - Q.HEAD * kk - fz * 1.1) + 'px';
    mk.style.zIndex = String(Q.ZTOP + 2);
    const label = '🎯 ' + nickOf(s, sel) + ' (' + (markList(s, sel).filter(function (m) { return m; }).length + 1) + '/' + Q.PER + ')';
    if (!bar) {
        bar = document.createElement('div'); bar.id = 'qz-bar';
        bar.innerHTML = '<span class="nm"></span><button class="o" title="정답">O</button><button class="x" title="오답">X</button><button class="c" title="지목 풀기">✕</button>';
        bar.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        bar.querySelector('.o').onclick = function (e) { e.stopPropagation(); if (sel) judge(sel, 1); };
        bar.querySelector('.x').onclick = function (e) { e.stopPropagation(); if (sel) judge(sel, 2); };
        bar.querySelector('.c').onclick = function (e) { e.stopPropagation(); sel = ''; paintHost(); };
        ov.appendChild(bar);
    }
    const nm = bar.querySelector('.nm');
    if (nm.textContent !== label) nm.textContent = label;
}
// ✏️ 문제 내기 — 적은 글이 가운데 화면에 뜬다
function askBox() {
    const s = myHost(); if (!s) return;
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">✏️ 문제 내기</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:8px; line-height:1.6;">적은 글이 무대 가운데 화면에 뜹니다 (' + Q.Q_MAX + '자까지). 채팅에도 한 줄 남습니다.</div>'
        + '<textarea id="qz-qt" maxlength="' + Q.Q_MAX + '" rows="3" style="width:100%; box-sizing:border-box; padding:10px; border-radius:8px; border:1px solid #c79a5b; background:#f3e6d2; color:#1a1008; font-size:14px; font-weight:bold; line-height:1.5; resize:none;"></textarea>'
        + '<div style="display:flex; gap:8px; margin-top:12px;">'
        + '<button id="qz-qx" class="game-btn" style="flex:1; ' + B_GREY + '">닫는다</button>'
        + '<button id="qz-qc" class="game-btn" style="flex:1; ' + B_BROWN + '">화면을 비운다</button>'
        + '<button id="qz-qg" class="game-btn" style="flex:1.4; ' + B_GOLD + '">화면에 띄운다</button></div>');
    const ta = w.querySelector('#qz-qt');
    ta.value = (s.q && s.q.t) || '';
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); });
    setTimeout(function () { try { ta.focus(); } catch (e) { } }, 60);
    w.querySelector('#qz-qx').onclick = shut;
    w.querySelector('#qz-qc').onclick = function () { ask(''); shut(); };
    w.querySelector('#qz-qg').onclick = function () {
        if (!String(ta.value || '').trim()) { alert_('문제를 적어 주세요.'); return; }
        ask(ta.value); shut();
    };
}
let qSeen = '';                              // 마지막으로 알린 문제 (같은 문제를 채팅에 두 번 안 적는다)
function qKey(s) { return s ? (s.id + '|' + (s.q ? (s.q.at + '|' + s.q.t) : '')) : ''; }
const finSaid = {};
// 명패 아래 세 칸 — 푼 문제 (O 초록 · X 빨강)
function paintMarks() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) return;
    const s = curShow() || (closing ? closeShow : null), el = sg.el, z = sg.z, st = seatsOf(s);
    ['s1', 's2', 's3', 's4', 's5', 's6'].forEach(function (k) {
        const id = 'qz-pp-' + k, r = Q.PLATE[k];
        let p = el.querySelector('#' + id);
        const on = s && seatKeys(s).indexOf(k) >= 0 && st[k] && st[k].c;
        if (!on) { if (p) p.remove(); return; }
        const ml = markList(s, st[k].c);
        const sig = ml.join('') + '|' + z;
        if (!p) { p = document.createElement('div'); p.id = id; p.className = 'qz-pips'; el.appendChild(p); }
        if (p._sig === sig) return;
        p._sig = sig;
        const d = Math.max(4, Math.round(20 * z));
        p.style.left = px(r[0], z); p.style.top = px(r[1] + r[3] + 12, z); p.style.width = px(r[2], z); p.style.height = d + 'px';
        p.style.zIndex = String((k > 's3' ? Q.Z2 : Q.Z1) + 1);
        p.innerHTML = ml.map(function (m) { return '<i class="' + (m === 1 ? 'o' : (m === 2 ? 'x' : '')) + '" style="width:' + d + 'px;height:' + d + 'px"></i>'; }).join('');
    });
}
// ── 커튼 (들어갈 때) — 프레임 1 ~ 5 를 방 안에 겹쳐 깐다. 더 닫힌 장이 위 (1 이 맨 위).
//   위에서부터 한 장씩 흐려 없애면 그 아래 장이 드러난다 — 두 장에 다 있는 커튼 자리는 내내 불투명해서 겹쳐 넘기는 동안 무대가 비쳐 보이지 않는다.
//   다 걷히면 방의 층으로 깔려 있는 끝 프레임(qz-cur)만 남는다.
function curtainShut() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) return null;
    const old = sg.el.querySelector('#qz-curplay'); if (old) old.remove();
    const box = document.createElement('div');
    box.id = 'qz-curplay'; box.className = 'qz-layer';
    box.style.zIndex = String(Q.ZTOP - 10);
    CUR.forEach(function (f, i) {
        const im = document.createElement('img');
        im.className = 'qz-layer'; im.alt = ''; im.src = DIR + f;
        im.style.zIndex = String(CUR.length - i);
        box.appendChild(im);
    });
    sg.el.appendChild(box);
    return box;
}
function curtainReady(box) {
    if (!box) return Promise.resolve();
    return Promise.all(Array.prototype.map.call(box.querySelectorAll('img'), function (im) {
        if (im.complete && im.naturalWidth) return Promise.resolve();
        return new Promise(function (res) { im.onload = im.onerror = function () { res(); }; });
    }));
}
function curtainOpen(box) {
    if (!box || !box.isConnected) return Promise.resolve();
    const ims = Array.prototype.slice.call(box.querySelectorAll('img'));
    let p = Promise.resolve();
    ims.forEach(function (im, i) {
        p = p.then(function () {
            im.style.transition = 'opacity ' + IN.CURTAIN + 'ms ease-in-out';
            im.style.opacity = '0';
            return wait(i === ims.length - 1 ? IN.CURTAIN + 60 : Math.round(IN.CURTAIN * 0.7));
        });
    });
    return p.then(function () { box.remove(); });
}
// 커튼 닫기 (쇼가 끝났을 때 · 2026-11-13 사용자 「쇼가 끝나면(정산이 끝나면) 반대로 커튼이 닫히게」) — 열 때의 거꾸로.
//   프레임 5 → 4 → 3 → 2 → 1 차례로 **나타난다** (덜 닫힌 장부터 · 더 닫힌 장이 위). 다 닫히면 프레임 1 이 무대를 다 가린다.
function curtainClose() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) return Promise.resolve();
    const old = sg.el.querySelector('#qz-curplay'); if (old) old.remove();
    const box = document.createElement('div');
    box.id = 'qz-curplay'; box.className = 'qz-layer';
    box.style.zIndex = String(Q.ZTOP + 30);                    // 채점 표 · 누르는 자리까지 다 덮는다
    CUR.forEach(function (f, i) {
        const im = document.createElement('img');
        im.className = 'qz-layer'; im.alt = ''; im.src = DIR + f;
        im.style.zIndex = String(CUR.length - i);
        im.style.opacity = '0';
        box.appendChild(im);
    });
    sg.el.appendChild(box);
    return Promise.race([curtainReady(box), wait(3000)]).then(function () {
        const ims = Array.prototype.slice.call(box.querySelectorAll('img')).reverse();      // 5 → 1
        let p = wait(30);
        ims.forEach(function (im, i) {
            p = p.then(function () {
                if (!box.isConnected) return;
                im.style.transition = 'opacity ' + IN.CURTAIN + 'ms ease-in-out';
                im.style.opacity = '1';
                return wait(i === ims.length - 1 ? IN.CURTAIN + 60 : Math.round(IN.CURTAIN * 0.7));
            });
        });
        return p;
    });
}
// 쇼가 끝났다 — 무대에 서 있으면 커튼이 닫힌 뒤 광장으로 돌아간다
let closing = false, closeShow = null;
function endLeave(old) {
    if (closing) return;
    closing = true;
    closeShow = old || closeShow || null;                      // 닫히는 동안 무대(명패 · 단상)는 그대로 둔다
    shut();
    sel = ''; paintHost();
    sys(old && old.end ? '📺 화요 퀴즈쇼의 막이 내립니다.' : '📺 화요 퀴즈쇼가 끝나 막이 내립니다.');
    curtainClose().then(function () { return wait(IN.SHUT + 250); }).catch(function () { }).then(function () {
        closing = false; closeShow = null;
        if (roomNow() === ROOM && !curShow()) { sys('광장으로 돌아갑니다.'); leave(); }
        else { const b = document.getElementById('qz-curplay'); if (b) b.remove(); }      // 그 사이 새 쇼가 열렸다 (드문 일) — 막만 걷는다
    });
}
// 머리 위에 크게 — O (초록) · X (빨강)
function pop(last) {
    const sg = stage();
    if (!sg || sg.room !== ROOM || !last || !last.c) return;
    const s = curShow(); if (!s) return;
    const key = [s.id, last.c, last.k, last.v, last.at].join('|');
    if (key === popKey) return;
    popKey = key;
    const k = seatOf(s, last.c); if (!k) return;
    const sp = Q.SEAT[k], z = sg.z;
    const size = Math.max(22, Math.round(Q.POP * z)), th = Math.max(4, Math.round(size * 0.17));
    const e = document.createElement('div');
    e.className = 'qz-pop ' + (last.v === 1 ? 'o' : 'x');
    e.innerHTML = last.v === 1 ? '<i style="border-width:' + th + 'px"></i>' : '<i style="height:' + th + 'px"></i><i style="height:' + th + 'px"></i>';
    e.style.left = Math.round(sp.x * z - size / 2) + 'px'; e.style.top = Math.round(sp.y * z - Q.HEAD * (sg.k || z) - size) + 'px';   // 사람은 방과 다른 눈금(k)으로 줄어든다
    e.style.width = size + 'px'; e.style.height = size + 'px';
    e.style.zIndex = String(Q.ZTOP);
    sg.el.appendChild(e);
    // 가운데 화면에도 크게 (2026-11-13 사용자 「문제를 맞추거나 틀렸을 시에 중앙에 초록색 O나 빨간색 X」)
    const R = Q.SCREEN, big = Math.max(64, Math.round(250 * z)), th2 = Math.max(8, Math.round(big * 0.15));
    const c = document.createElement('div');
    c.className = 'qz-pop ' + (last.v === 1 ? 'o' : 'x');
    c.innerHTML = last.v === 1 ? '<i style="border-width:' + th2 + 'px"></i>' : '<i style="height:' + th2 + 'px"></i><i style="height:' + th2 + 'px"></i>';
    c.style.left = Math.round((R[0] + R[2] / 2) * z - big / 2) + 'px'; c.style.top = Math.round((R[1] + R[3] / 2) * z - big / 2) + 'px';
    c.style.width = big + 'px'; c.style.height = big + 'px';
    c.style.zIndex = String(Q.ZTOP);
    sg.el.appendChild(c);
    setTimeout(function () { e.remove(); c.remove(); }, Q.POP_MS + 100);
    sfxVerdict(last.v);                                        // 🔔 정답 — 띵 띠로링 + 박수 · 오답 — 삐 + 우우
}

// ==========================================
// 🔔 소리 — 정답: 「띵 띠로링」 + 박수 · 오답: 「삐」 + 「우우」 (2026-11-13 사용자) — 음원 없이 그 자리에서 만든다
// ==========================================
//   무대에 있는 모두에게 난다 (O · X 가 뜰 때). 광장 위 🔊 를 꺼 두었으면 안 난다.
//   손전화는 손길 없이 처음 내는 소리를 막는다 — 들어올 때 누른 손길에서 소리 길을 열어 둔다 (bgmUnlock).
let SFX = null;
function sfxCtx(make) {
    try {
        if (!SFX) {
            if (!make) return null;
            const C = window.AudioContext || window.webkitAudioContext;
            if (!C) return null;
            const ctx = new C(), out = ctx.createGain(), comp = ctx.createDynamicsCompressor();
            out.gain.value = 0.85;
            out.connect(comp); comp.connect(ctx.destination);
            SFX = { ctx: ctx, out: out, clap: null };
        }
        if (SFX.ctx.state !== 'running' && SFX.ctx.state !== 'closed') { const p = SFX.ctx.resume(); if (p && p.catch) p.catch(function () { }); }
        return SFX;
    } catch (e) { return null; }
}
['pointerdown', 'keydown', 'touchend'].forEach(function (t) {      // 막혀 있던 소리 길 — 누를 때 다시 연다
    document.addEventListener(t, function () { if (SFX && SFX.ctx.state === 'suspended') { try { SFX.ctx.resume(); } catch (e) { } } }, true);
});
// 종 한 번 — 맑은 소리 (바탕음에 배음 몇 개 · 금방 잦아든다)
function sfxBell(S, f, t, dur, vol) {
    const c = S.ctx;
    [[1, 1], [2, 0.32], [3.01, 0.12], [4.2, 0.05]].forEach(function (h) {
        const o = c.createOscillator(), g = c.createGain(), d = dur / (1 + (h[0] - 1) * 0.5);
        o.type = 'sine'; o.frequency.value = f * h[0];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * h[1]), t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(S.out);
        o.start(t); o.stop(t + d + 0.05);
    });
}
// 박수 — 짧은 손뼉 소리 수백 개를 흩어 놓은 한 벌 (처음에 몰리고 뒤로 잦아든다)
function clapBuf(S) {
    if (S.clap) return S.clap;
    const c = S.ctx, sr = c.sampleRate, dur = 2.8, n = Math.floor(sr * dur), b = c.createBuffer(1, n, sr), d = b.getChannelData(0);
    for (let i = 0; i < 420; i++) {
        const t0 = 0.02 + Math.pow(Math.random(), 1.5) * (dur - 0.25);
        const a = (0.25 + Math.random() * 0.75) * Math.min(1, t0 / 0.12) * Math.pow(1 - t0 / dur, 1.3);
        const len = Math.floor(sr * (0.006 + Math.random() * 0.012)), k0 = Math.floor(t0 * sr), tone = 0.25 + Math.random() * 0.5;
        let prev = 0, lp = 0;
        for (let j = 0; j < len && k0 + j < n; j++) {
            lp += ((Math.random() * 2 - 1) - lp) * tone;
            d[k0 + j] += (lp - prev) * a * Math.exp(-j / (len * 0.35));
            prev = lp;
        }
    }
    let mx = 0;
    for (let i = 0; i < n; i++) { const v = Math.abs(d[i]); if (v > mx) mx = v; }
    if (mx > 0) for (let i = 0; i < n; i++) d[i] = d[i] / mx * 0.9;
    S.clap = b;
    return b;
}
function sfxClap(S, t) {
    const c = S.ctx, src = c.createBufferSource(), g = c.createGain(), hp = c.createBiquadFilter(), lp = c.createBiquadFilter();
    src.buffer = clapBuf(S);
    hp.type = 'highpass'; hp.frequency.value = 700; lp.type = 'lowpass'; lp.frequency.value = 7000;
    g.gain.value = 0.5;
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(S.out);
    src.start(t);
}
// 우우 — 낮은 목소리 여럿이 「우」 모음으로 처지며 끈다
function sfxBoo(S, t, dur) {
    const c = S.ctx, bus = c.createGain(), f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(), g2 = c.createGain();
    bus.gain.setValueAtTime(0.0001, t);
    bus.gain.exponentialRampToValueAtTime(0.55, t + 0.25);
    bus.gain.setValueAtTime(0.55, t + dur - 0.55);
    bus.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f1.type = 'bandpass'; f1.frequency.value = 330; f1.Q.value = 3.5;
    f2.type = 'bandpass'; f2.frequency.value = 800; f2.Q.value = 5;
    g2.gain.value = 0.35;
    f1.connect(bus); f2.connect(g2); g2.connect(bus); bus.connect(S.out);
    for (let i = 0; i < 6; i++) {
        const o = c.createOscillator(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
        const f0 = 105 + Math.random() * 70, st = t + Math.random() * 0.18;
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f0 * 1.06, st);
        o.frequency.linearRampToValueAtTime(f0 * (0.8 + Math.random() * 0.08), t + dur);
        l.frequency.value = 4 + Math.random() * 3; lg.gain.value = f0 * 0.025;
        l.connect(lg); lg.connect(o.frequency);
        g.gain.value = 0.16 + Math.random() * 0.1;
        o.connect(g); g.connect(f1); g.connect(f2);
        o.start(st); o.stop(t + dur + 0.05); l.start(st); l.stop(t + dur + 0.05);
    }
}
function sfxVerdict(v) {
    try {
        if (typeof window.eventBgmMuted === 'function' && window.eventBgmMuted()) return;
        const S = sfxCtx(true);
        if (!S) return;
        const c = S.ctx, t = c.currentTime + 0.03;
        if (v === 1) {
            sfxBell(S, 1568, t, 0.55, 0.3);                                                                  // 띵
            [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) { sfxBell(S, f, t + 0.3 + i * 0.085, i === 3 ? 0.9 : 0.35, 0.24); });   // 띠로링
            sfxClap(S, t + 0.32);                                                                            // 박수
        } else {
            const g = c.createGain(), lp = c.createBiquadFilter();                                           // 삐 —
            lp.type = 'lowpass'; lp.frequency.value = 2600;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.2, t + 0.015);
            g.gain.setValueAtTime(0.2, t + 0.52);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
            [523.25, 554.37].forEach(function (f) { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + 0.66); });
            lp.connect(g); g.connect(S.out);
            sfxBoo(S, t + 0.4, 1.9);                                                                         // 우우
        }
        S.n = (S.n || 0) + 1; S.last = v;
    } catch (e) { }
}
window.plazaOnPaint = (function (prev) {
    return function (room) {
        try { if (typeof prev === 'function') prev.apply(this, arguments); } catch (e) { }
        try { if (room === ROOM) paintStage(); else clearStage(); } catch (e) { }     // 자리(seat)는 여기서 안 잡는다 — 이때는 아직 내 사람이 서기 전이다
    };
})(window.plazaOnPaint);

// ==========================================
// 쇼가 바뀌었다 — 초대장 · 명패 · O X · 끝
// ==========================================
function onShows(was) {
    const me = u_(); if (!me) return;
    // 새 채점 — 방 안이면 머리 위에 띄운다
    const s = curShow();
    if (s && roomNow() === ROOM) {
        // ★ 「방금 채점됐다」는 **앞서 본 것과 달라졌는지**로 안다 — 사회자 기기의 시계로 적힌 때를 내 시계와 견주면, 시계가 어긋난 기기에서는 O · X 가 안 뜬다.
        //   처음 받은 것(들어오자마자)은 지난 채점이라 띄우지 않는다.
        const prev = was && was[s.host];
        if (s.last && lastKey(s) !== popKey) {
            if (prev && prev.id === s.id && lastKey(prev) !== lastKey(s)) pop(s.last); else popKey = lastKey(s);
        }
        // 새 문제 — 채팅에도 한 줄 (작은 화면에서는 무대의 글씨가 작다). 들어오자마자 받은 것은 화면에만.
        if (qKey(s) !== qSeen) {
            if (prev && prev.id === s.id && s.q && s.q.t && qKey(prev) !== qKey(s)) sys('📺 문제 — ' + s.q.t);
            qSeen = qKey(s);
        }
        if (s.fin && !finSaid[s.id]) { finSaid[s.id] = 1; if (prev && prev.id === s.id) sys('🎉 모든 참가자가 문제를 마쳤습니다 — 곧 막이 내립니다.'); }
        paintStage(); seat();
    }
    // 🚪 사회자가 나를 내보냈다 (초대를 거뒀다) — 앞서 본 것에서는 아니었는데 이제 x
    Object.keys(SHOWS).forEach(function (h) {
        const s2 = SHOWS[h], p = was && was[h];
        if (h === me.code || !live(s2) || !outOf(s2, me.code)) return;
        if (!p || p.id !== s2.id || !invOf(p)[me.code] || outOf(p, me.code)) return;       // 들어오자마자 받은 것 · 이미 알린 것
        kickedOut(s2, !!seatOf(p, me.code));
    });
    // 남이 내려갔다 — 방 안이면 한 줄
    if (s && roomNow() === ROOM && s.host !== me.code) {
        const p = was && was[s.host];
        if (p && p.id === s.id) Object.keys(seatsOf(p)).forEach(function (k) {
            const c = seatsOf(p)[k] && seatsOf(p)[k].c;
            if (c && c !== me.code && !seatOf(s, c) && outOf(s, c)) sys('🚪 ' + (seatsOf(p)[k].nick || nameOf(c)) + ' — 무대에서 내려갔습니다.');
        });
    }
    // 내가 들어 있던 쇼가 끝났다 — 커튼이 닫힌 뒤 광장으로
    if (roomNow() === ROOM && !s) endLeave((going && (SHOWS[going] || (was && was[going]))) || null);
    if (document.getElementById('qz-status') && s) { try { document.getElementById('qz-status').innerHTML = statusRows(s); } catch (e) { } }
    chip();
}
// 🚪 내보내졌다 — 무대에 서 있었으면 막 없이 바로 광장으로 (쇼는 이어진다). 초대장만 보고 있었으면 초대장을 닫는다.
function kickedOut(s, wasSeated) {
    const me = u_(), d = db_();
    const onStage = roomNow() === ROOM && going === s.host;
    // 같은 순간에 앉았으면 명패가 남는다 — 내 손으로 비운다
    try { const k = me && seatOf(s, me.code); if (k && d) d.ref(PATH + '/' + s.host + '/seat/' + k).transaction(function (v) { return (v && v.c === me.code) ? null : undefined; }); } catch (e) { }
    if (document.getElementById('qz-nick') || onStage) shut();
    if (onStage) { sys('🚪 사회자가 무대에서 내보냈습니다 — 광장으로 돌아갑니다.'); leave(); }
    else if (going === s.host) going = '';
    if (wasSeated) alert_('📺 화요 퀴즈쇼 — 사회자가 무대에서 내보냈습니다.');
    chip();
}
setInterval(function () {
    try {
        const me = u_(); if (!me || !heard) return;
        const inRoom = roomNow() === ROOM;
        if (inRoom) {
            const s = curShow();
            // 🚪 내보내진 채로 무대에 남아 있다 (바뀐 것을 놓쳤다) — 막을 내리지 않고 나간다
            if (!s && going && live(SHOWS[going]) && SHOWS[going].host !== me.code && outOf(SHOWS[going], me.code)) { kickedOut(SHOWS[going], true); return; }
            if (!s) { endLeave((going && SHOWS[going]) || null); return; }
            paintStage(); seat();
        } else if (document.querySelector('.qz-layer, #qz-ctl')) clearStage();
        finCheck();                                             // 사회자 — 모두 다 풀었으면 막을 내린다
        bgmTick(roomNow() === ROOM && !!curShow());
        cageTry();                                              // 무대에서 내려왔으면 오답 가두리를 건다
        // 초대장 — 한가할 때 띄운다
        const pend = pendingShow();
        if (pend && !later[pend.id] && !busy()) inviteCard(pend);
        chip();
    } catch (e) { }
}, 700);

// ==========================================
// 장착칸의 [🎤 초대] 단추
// ==========================================
(function stickBtn() {
    const ID = 'quiz-show-btn';
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.getElementById(ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(SHOW) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div'); if (!row) return;
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0; background:linear-gradient(145deg,#6a4a22,#2a1b0e) !important; border-color:#c79a5b !important; color:#f3e6d2 !important;';
        b.textContent = '🎤 초대';
        b.onclick = window.quizShowMenu;
        row.appendChild(b);
    }
    (function wrap() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._quiz) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () { const r = _r.apply(this, arguments); try { stick(); } catch (e) { } return r; };
            Object.keys(_r).forEach(function (k) { if (k !== '_gearCap') { try { renderInventory[k] = _r[k]; } catch (e) { } } });
            renderInventory._quiz = true;
            clearInterval(iv);
        }, 400);
    })();
    (function watch() {
        const iv = setInterval(function () {
            const el = document.getElementById('inventory-list-container');
            if (!el) return;
            clearInterval(iv);
            try { new MutationObserver(function () { try { stick(); } catch (e) { } }).observe(el, { childList: true }); } catch (e) { }
            stick();
        }, 400);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 들어갈 때의 연출 — 붉은 글씨 → 화면을 찢고 → 브라운관 꺼짐 → 붉은 커튼
// ==========================================
//   글씨 여섯 장 · 찢고 나오는 여섯 장은 주신 그림(3배율)을 한 칸 한 점으로 줄여 둔 것 (한 칸 420 x 420 · 가로 셋 세로 둘).
//   글씨 사이의 찢김(뜯긴 금 · 흰 속살)과 지지직(잡음 · 긁힌 줄)은 그림 없이 그린다.
//   커튼은 주신 그림 여섯 장 (CUR · CUR_END) — 방 안에 깐다 (curtainShut · curtainOpen).
const IN = {
    CELL: 420,
    // 글씨 — 칸 · 다 드러난 뒤 머무는 때(ms). 앞 장이 찢기는 동안(TEAR) 이미 그 아래로 보이기 시작한다.
    //   (2026-11-13 사용자 「글씨 흐려지는 게 아니라 사진처럼 찢어지거나 지지직 거리는 효과랑 같이 · 지나가는 게 빨랐으면」 — 흐림을 없애고 빠르게)
    WORDS: [
        { c: 0, ms: 300 },                     // 보라!
        { c: 1, ms: 240 },                     // 내가 백만가면의 소유자요
        { c: 2, ms: 240 },                     // 혼돈의 군주요 광기의 정점이요
        { c: 3, ms: 240 },                     // 쾌락과 유희의 꿈이요
        { c: 4, ms: 330 },                     // 전쟁의 선동자요 과학의 어버이요 낯은 네발짐승이요
        { c: 5, ms: 520 }                      // 나는
    ],
    TEAR: 210,                                 // 한 장이 찢겨 나가는 때
    GL: 150,                                   // 글씨가 지지직거리며 서는 때
    BURST: [150, 150, 170, 190, 210, 620],     // 찢고 나오는 여섯 장 — 장마다 머무는 때
    CRT: 1050, DARK: 380,
    SHUT: 600,                                 // 닫힌 막을 보여 주는 때
    CURTAIN: 380                               // 커튼 한 장이 걷히는 때 (다섯 장이 조금씩 겹쳐 이어진다)
};
(function introCss() {
    const st = document.createElement('style');
    st.textContent = [
        '#qz-intro{position:fixed;inset:0;z-index:2147483000;background:#000;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;}',
        '#qz-intro .qi-film{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}',
        '#qz-intro .qi-cell{position:absolute;left:50%;top:50%;background-repeat:no-repeat;will-change:transform,opacity;}',
        '#qz-intro .qi-grain{position:absolute;inset:-20%;opacity:.07;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 3px);animation:qiGrain .18s steps(2) infinite;}',
        '@keyframes qiGrain{0%{transform:translateY(0)}100%{transform:translateY(3px)}}',
        // 글씨 — 흐림(blur) 없이. 지지직거리며 서고(띠가 좌우로 어긋난다), 종이처럼 찢겨 나간다.
        '#qz-intro .qi-page{position:absolute;inset:0;}',
        '@keyframes qiGl{0%{clip-path:inset(6% 0 64% 0);transform:translate(-50%,-50%) translateX(-7%)}16%{clip-path:inset(50% 0 16% 0);transform:translate(-50%,-50%) translateX(6%)}',
        '  32%{clip-path:inset(0 0 0 0);transform:translate(-50%,-50%) translateX(-3%) skewX(-10deg)}48%{clip-path:inset(28% 0 42% 0);transform:translate(-50%,-50%) translateX(8%)}',
        '  64%{clip-path:inset(0 0 0 0);transform:translate(-50%,-50%) translateX(2%) skewX(6deg)}80%{clip-path:inset(60% 0 4% 0);transform:translate(-50%,-50%) translateX(-5%)}',
        '  100%{clip-path:inset(0 0 0 0);transform:translate(-50%,-50%)}}',
        '@keyframes qiDrift{0%{transform:translate(-50%,-50%) scale(1)}100%{transform:translate(-50%,-50%) scale(1.08)}}',
        // 찢김 — 한 장을 위아래 두 쪽으로 가른다. 한쪽 끝을 축으로 벌어져(쐐기꼴 틈) 날아간다. 가장자리는 뜯긴 종이의 흰 속살.
        '#qz-intro .qi-half{position:absolute;inset:0;z-index:2;will-change:transform;}',
        '#qz-intro .qi-half .qi-pg{position:absolute;inset:0;background:#000;}',
        '#qz-intro .qi-half .qi-rip{position:absolute;inset:0;background:#f4f1ea;}',
        '@keyframes qiTopL{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-.5%) rotate(-1.5deg)}100%{transform:translateY(-60%) rotate(-9deg)}}',
        '@keyframes qiBotL{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(.5%) rotate(1.5deg)}100%{transform:translateY(60%) rotate(9deg)}}',
        '@keyframes qiTopR{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-.5%) rotate(1.5deg)}100%{transform:translateY(-60%) rotate(9deg)}}',
        '@keyframes qiBotR{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(.5%) rotate(-1.5deg)}100%{transform:translateY(60%) rotate(-9deg)}}',
        // 지지직 — 잡음 한 겹 · 가로로 긁힌 줄
        '#qz-intro .qi-static{position:absolute;inset:0;z-index:3;opacity:0;pointer-events:none;image-rendering:pixelated;background-size:192px 192px;}',
        '#qz-intro .qi-scr{position:absolute;left:0;right:0;height:2px;z-index:3;opacity:0;pointer-events:none;background:rgba(255,228,228,.92);box-shadow:0 0 6px rgba(255,70,70,.9);}',
        '@keyframes qiShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-9px,4px)}40%{transform:translate(8px,-5px)}60%{transform:translate(-6px,-3px)}80%{transform:translate(5px,3px)}}',
        '@keyframes qiFlash{0%{opacity:.85}100%{opacity:0}}',
        '#qz-intro .qi-flash{position:absolute;inset:0;background:#8a0000;opacity:0;pointer-events:none;z-index:2;}',
        // 브라운관 꺼짐 — 화면 압축 → 수평선 → 빛의 점 → 암전
        '#qz-intro .qi-crt{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100vw;height:100vh;z-index:5;',
        '  background:linear-gradient(180deg,#d9e6e6 0,#f4f8f8 22%,#f4f8f8 78%,#d9e6e6 100%);box-shadow:0 0 50px 12px rgba(210,228,228,.5);}',
        '@keyframes qiCrt{0%{width:100vw;height:100vh;border-radius:0;opacity:1}8%{width:100vw;height:100vh;border-radius:0}36%{width:96vw;height:22vh;border-radius:10px}',
        '  56%{width:88vw;height:5px;border-radius:5px;box-shadow:0 0 22px 5px rgba(210,228,228,.75)}76%{width:16px;height:6px;border-radius:50%;box-shadow:0 0 0 7px rgba(120,140,140,.6),0 0 26px 10px rgba(210,228,228,.6)}',
        '  90%{width:8px;height:5px;border-radius:50%;box-shadow:0 0 0 4px rgba(120,140,140,.5);opacity:1}100%{width:0;height:0;border-radius:50%;box-shadow:none;opacity:0}}',
        // 커튼 — 주신 그림 여섯 장을 방 안에 겹쳐 깔고 위에서부터 걷는다 (curtainShut · curtainOpen). 여기서는 화면을 덮은 검은 막만 걷는다.
        '#qz-intro .qi-none{display:none;}'
    ].join('\n');
    document.head.appendChild(st);
})();
// 글씨 그림 — 주신 글씨는 어두운 붉은색이라 검은 바탕에서 묻힌다. 밝기만 1.75배 올려 **그림에 구워 두었다** (-b).
//   전에는 화면에서 필터(brightness · blur)로 올렸는데, 손전화에서 그 필터가 움직이는 내내 글씨를 흐리게 만들었다 (2026-11-13 사용자 영상).
const WORDS_IMG = 'quiz-words-b.webp';
// 지지직 잡음 — 작은 그림 한 장을 만들어 두고 깔아 쓴다
let noiseUrl = '';
function noise() {
    if (noiseUrl) return noiseUrl;
    try {
        const c = document.createElement('canvas'); c.width = c.height = 96;
        const g = c.getContext('2d'), im = g.createImageData(96, 96), d = im.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = 150 + Math.random() * 105;
            d[i] = v; d[i + 1] = v * (0.72 + Math.random() * 0.28); d[i + 2] = v * (0.72 + Math.random() * 0.28);
            d[i + 3] = Math.random() < 0.42 ? 60 + Math.random() * 150 : 0;
        }
        g.putImageData(im, 0, 0);
        noiseUrl = c.toDataURL('image/png');
    } catch (e) { noiseUrl = ''; }
    return noiseUrl;
}
// 그림을 미리 받아 둔다 — 연출 도중에 빈 칸이 뜨지 않게
const pre = {};
function preload() {
    [WORDS_IMG, 'quiz-burst.webp', 'quiz-show3.webp', T1_IMG, T2_IMG, CUR_END].concat(CUR).forEach(function (f) {
        if (pre[f]) return;
        const im = new Image();
        pre[f] = new Promise(function (res) { im.onload = im.onerror = function () { res(); }; });
        im.src = DIR + f;
    });
    return Promise.all(Object.keys(pre).map(function (k) { return pre[k]; }));
}
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
// full — 처음 들어갈 때(글씨부터). 아니면 커튼만. behind() 는 막이 다 가려진 뒤에 한 번 불린다 (그동안 방을 옮긴다) — false 를 주면 그대로 걷는다.
let introOn = false;
function intro(full, behind) {
    if (introOn) return;
    introOn = true;
    const old = document.getElementById('qz-intro'); if (old) old.remove();
    const ov = document.createElement('div');
    ov.id = 'qz-intro';
    ov.innerHTML = '<div class="qi-film"></div><div class="qi-grain"></div><div class="qi-flash"></div><div class="qi-static"></div><div class="qi-scr"></div><div class="qi-scr"></div>';
    ['pointerdown', 'click', 'touchstart', 'wheel'].forEach(function (ev) { ov.addEventListener(ev, function (e) { e.stopPropagation(); e.preventDefault(); }, { passive: false }); });
    document.body.appendChild(ov);
    const film = ov.querySelector('.qi-film'), flash = ov.querySelector('.qi-flash');
    const fin = function () { introOn = false; try { ov.remove(); } catch (e) { } chip(); };
    const size = function () { return Math.min(window.innerWidth * 1.02, window.innerHeight * 0.92, 900); };
    const cellEl = function (sheet, c, px) {
        const e = document.createElement('div');
        e.className = 'qi-cell';
        const k = px / IN.CELL;
        e.style.width = px + 'px'; e.style.height = px + 'px';
        e.style.backgroundImage = 'url("' + DIR + sheet + '")';
        e.style.backgroundSize = (IN.CELL * 3 * k) + 'px ' + (IN.CELL * 2 * k) + 'px';
        e.style.backgroundPosition = (-(c % 3) * px) + 'px ' + (-Math.floor(c / 3) * px) + 'px';
        e.style.imageRendering = k >= 1.5 ? 'pixelated' : 'auto';       // 줄여 그릴 때 도트로 찍으면 획이 깨진다
        return e;
    };
    const doFlash = function (ms) { flash.style.animation = 'none'; void flash.offsetWidth; flash.style.animation = 'qiFlash ' + (ms || 260) + 'ms ease-out forwards'; };
    const shake = function (ms) { film.style.animation = 'none'; void film.offsetWidth; film.style.animation = 'qiShake ' + (ms || 260) + 'ms linear 1'; };

    // ── 지지직 — 잡음이 잠깐 덮이고 가로로 긁힌 줄이 튄다
    const stat = ov.querySelector('.qi-static'), scrs = ov.querySelectorAll('.qi-scr');
    const fizz = function (ms, k) {
        const url = noise();
        if (url && !stat.style.backgroundImage) stat.style.backgroundImage = 'url(' + url + ')';
        const t0 = performance.now();
        const step = function () {
            const on = performance.now() - t0 < ms && ov.isConnected;
            stat.style.opacity = on ? String((k || 0.5) * (0.6 + Math.random() * 0.4)) : '0';
            stat.style.backgroundPosition = Math.round(Math.random() * 192) + 'px ' + Math.round(Math.random() * 192) + 'px';
            Array.prototype.forEach.call(scrs, function (e) { e.style.opacity = on && Math.random() < 0.7 ? '1' : '0'; e.style.top = (4 + Math.random() * 92).toFixed(1) + '%'; e.style.height = (1 + Math.round(Math.random() * 2)) + 'px'; });
            if (on) setTimeout(step, 32);
        };
        step();
    };
    // 글씨 한 띠가 옆으로 어긋났다 돌아온다 (머무는 동안 한 번)
    const slip = function (pg) {
        const w = pg && pg.querySelector('.qi-cell'); if (!w || !pg.isConnected) return;
        const g = w.cloneNode(false);
        const a = 12 + Math.random() * 50, h = 10 + Math.random() * 16;
        g.style.animation = 'none';
        g.style.clipPath = g.style.webkitClipPath = 'inset(' + a.toFixed(1) + '% 0 ' + Math.max(0, 100 - a - h).toFixed(1) + '% 0)';
        g.style.transform = 'translate(-50%,-50%) translateX(' + ((Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 6)).toFixed(1) + '%)';
        pg.appendChild(g);
        setTimeout(function () { g.remove(); }, 60);
    };
    // ── 찢김 — 뜯긴 금 한 줄 (가로로 · 살짝 기울고 · 들쭉날쭉)
    const tearLine = function () {
        const n = 56, base = 43 + Math.random() * 14, slope = Math.random() * 12 - 6, pts = [];
        const f = 1 + Math.random() * 1.5, ph = Math.random() * 6.28, amp = 0.8 + Math.random() * 0.9;   // 느린 물결 — 종이는 곧게 안 찢긴다
        let j = 0;
        for (let i = 0; i <= n; i++) {
            const x = i / n * 100;
            j = j * 0.55 + (Math.random() - 0.5) * 2.2;                        // 잔 결
            if (Math.random() < 0.07) j += (Math.random() - 0.5) * 3.2;        // 가끔 크게 뜯긴 데
            pts.push([x, base + slope * (x - 50) / 100 + amp * Math.sin(x / 100 * 6.28 * f + ph) + j]);
        }
        return pts;
    };
    const poly = function (pts) { return 'polygon(' + pts.map(function (p) { return p[0].toFixed(2) + '% ' + p[1].toFixed(2) + '%'; }).join(',') + ')'; };
    // 앞 장(pg)을 찢어 낸다 — 위아래 두 쪽이 한쪽 끝을 축으로 벌어지며 날아간다. 그 틈으로 아래 장이 드러난다.
    const tear = function (pg, fromLeft) {
        const line = tearLine();
        const vh = Math.max(320, window.innerHeight);
        const band = function () { return (5 + Math.random() * 11) / vh * 100; };      // 흰 속살의 폭 (5 ~ 16px)
        const pivotY = fromLeft ? line[0][1] : line[line.length - 1][1];
        const frozen = pg.cloneNode(true);
        const fw = frozen.querySelector('.qi-cell');
        if (fw) { fw.style.animation = 'none'; fw.style.transform = 'translate(-50%,-50%) scale(1.04)'; fw.style.clipPath = fw.style.webkitClipPath = 'none'; }
        Array.prototype.forEach.call(frozen.querySelectorAll('.qi-cell'), function (c, i) { if (i) c.remove(); });
        const half = function (top) {
            const hw = document.createElement('div');
            hw.className = 'qi-half';
            hw.style.transformOrigin = (fromLeft ? '0%' : '100%') + ' ' + pivotY.toFixed(2) + '%';
            const c = frozen.cloneNode(true);
            c.className = 'qi-pg';
            const body = top ? [[0, 0], [100, 0]].concat(line.slice().reverse()) : [[0, 100], [100, 100]].concat(line.slice().reverse());
            c.style.clipPath = c.style.webkitClipPath = poly(body);
            // 뜯긴 가장자리 — 금에서 틈 쪽으로 들쭉날쭉 번진 흰 띠
            const out = line.map(function (p) { return [p[0], p[1] + (top ? 1 : -1) * band()]; });
            const rip = document.createElement('div');
            rip.className = 'qi-rip';
            rip.style.clipPath = rip.style.webkitClipPath = poly(line.concat(out.reverse()));
            hw.appendChild(c); hw.appendChild(rip);
            hw.style.animation = (top ? (fromLeft ? 'qiTopL' : 'qiTopR') : (fromLeft ? 'qiBotL' : 'qiBotR')) + ' ' + IN.TEAR + 'ms cubic-bezier(.55,0,.9,.5) forwards';
            return hw;
        };
        const t = half(true), b = half(false);
        film.appendChild(t); film.appendChild(b);
        pg.remove();
        shake(150); fizz(120, 0.45);
        return wait(IN.TEAR).then(function () { t.remove(); b.remove(); });
    };
    // 글씨 — 한 장씩. 지지직거리며 서고, 다음 장이 깔리면 앞 장이 찢겨 나간다. 마지막 「나는」 은 남는다 — 그 화면을 찢고 나온다.
    let holder = null;
    const words = function () {
        film.innerHTML = '';
        const px = Math.round(size());
        let cur = null, p = Promise.resolve();
        IN.WORDS.forEach(function (w, i) {
            const lastW = i === IN.WORDS.length - 1;
            p = p.then(function () {
                const pg = document.createElement('div');
                pg.className = 'qi-page';
                const e = cellEl(WORDS_IMG, w.c, px);
                const stay = IN.GL + w.ms + IN.TEAR + 400;
                e.style.animation = 'qiGl ' + IN.GL + 'ms steps(1,end) 1, qiDrift ' + stay + 'ms linear ' + IN.GL + 'ms forwards';
                pg.appendChild(e);
                if (lastW) { pg.style.transform = 'scale(1)'; holder = pg; }
                film.insertBefore(pg, film.firstChild);                   // 찢기는 앞 장 아래에 깔린다
                const was = cur; cur = pg;
                if (!was) { doFlash(220); shake(200); fizz(IN.GL, 0.6); return wait(IN.GL + w.ms); }
                if (lastW) setTimeout(function () { doFlash(220); }, IN.TEAR);
                setTimeout(function () { slip(pg); }, IN.TEAR + w.ms * 0.55);
                return tear(was, i % 2 === 1).then(function () { return wait(w.ms); });
            });
        });
        return p;
    };
    // 찢고 나온다 — 글씨가 선 화면(붉은 막)이 찢기고, 그 틈으로 손이 · 머리가 · 몸이 나온다. 보는 쪽으로 다가오며 커진다.
    const burst = function () {
        let p = Promise.resolve();
        const px = Math.round(size());
        if (!holder) { film.innerHTML = ''; holder = document.createElement('div'); holder.className = 'qi-page'; holder.style.transform = 'scale(1)'; film.appendChild(holder); }
        fizz(160, 0.5);
        film.style.background = 'radial-gradient(ellipse at 50% 50%,#5c0000 0,#2a0000 50%,#070000 100%)';
        holder.style.transition = 'transform 1.5s cubic-bezier(.5,0,.9,.4)';
        let cur = null;
        IN.BURST.forEach(function (ms, i) {
            p = p.then(function () {
                const e = cellEl('quiz-burst.webp', i, px);
                e.style.transform = 'translate(-50%,-50%)';
                holder.appendChild(e);
                if (cur) cur.remove();
                cur = e;
                if (i === 0) { void holder.offsetWidth; holder.style.transform = 'scale(1.9)'; shake(200); }
                if (i === 2 || i === 4) { shake(200); doFlash(160); }
                if (i === IN.BURST.length - 1) { shake(420); holder.style.transition = 'transform .6s cubic-bezier(.6,0,1,.5)'; holder.style.transform = 'scale(4.2) translate(6%,-4%)'; }
                return wait(ms);
            });
        });
        return p;
    };
    const crt = function () {
        film.innerHTML = ''; film.style.background = ''; holder = null;
        const c = document.createElement('div');
        c.className = 'qi-crt';
        c.style.animation = 'qiCrt ' + IN.CRT + 'ms cubic-bezier(.3,0,.2,1) forwards';
        ov.appendChild(c);
        return wait(IN.CRT).then(function () { c.remove(); return wait(IN.DARK); });
    };
    // 커튼 — 검은 막 뒤에서 방을 옮기고, 방 안에 닫힌 커튼(프레임 1)을 친 뒤 검은 막을 걷는다. 그다음 커튼이 한 장씩 걷힌다.
    //   커튼 그림은 방 그림과 같은 자리 · 같은 크기라 화면이 아니라 **방 안에** 깐다 (어느 화면에서든 무대와 딱 맞는다). 끝 프레임은 방의 층으로 남는다.
    const curtain = function () {
        film.innerHTML = ''; film.style.background = '';
        const gr = ov.querySelector('.qi-grain'); if (gr) gr.remove();
        let p = Promise.resolve();
        if (!full) {                                               // 커튼만 도는 때 — 먼저 화면을 까맣게 덮는다
            ov.style.opacity = '0'; void ov.offsetWidth;
            ov.style.transition = 'opacity .28s ease'; ov.style.opacity = '1';
            p = wait(300);
        }
        return p.then(function () {
            let ok = true;
            try { ok = behind() !== false; } catch (e) { ok = false; }
            if (!ok) { fin(); return; }
            const box = curtainShut();
            return Promise.race([curtainReady(box), wait(4000)]).then(function () { return wait(120); }).then(function () {
                ov.style.transition = 'opacity .45s ease'; ov.style.opacity = '0';       // 검은 막이 걷히면 — 닫힌 커튼
                return wait(450 + IN.SHUT);
            }).then(function () { bgmStart(true); return curtainOpen(box); }).then(fin);       // 🎺 커튼이 걷히는 순간 — 빰
        });
    };
    const safety = setTimeout(function () { if (introOn && ov.isConnected) { try { behind(); } catch (e) { } fin(); } }, 22000);
    Promise.race([preload(), wait(2500)])
        .then(function () { return full ? words().then(burst).then(function () { doFlash(200); return crt(); }) : null; })
        .then(curtain)
        .catch(function () { try { behind(); } catch (e) { } fin(); })
        .then(function () { clearTimeout(safety); });
}
window.quizShowIntro = function (full) { intro(full !== false, function () { return true; }); };

// ==========================================
// 콘솔
// ==========================================
window.quizShowState = function () {
    const me = u_();
    console.log('%c===== 🎓 화요 퀴즈쇼 — ' + SHOW + ' =====', 'color:#c79a5b; font-size:13px');
    console.log('  차고 있나: ' + (wears(me) ? '예' : '아니오') + ' · 지금 방: ' + (roomNow() || '-') + ' · 들어 있는 쇼: ' + ((curShow() || {}).host || '-'));
    Object.keys(SHOWS).forEach(function (h) {
        const s = SHOWS[h];
        console.log('  ' + (s.name || h) + ' — ' + (live(s) ? '진행 중' : '끝남') + ' · 방 ' + (s.inst || 1) + ' · 초대 ' + Object.keys(invOf(s)).length + '명');
        console.table(Object.keys(seatsOf(s)).map(function (k) { const v = seatsOf(s)[k]; return { 자리: k, 명패: v.nick, 사원: nameOf(v.c), 채점: markList(s, v.c).map(function (m) { return m === 1 ? 'O' : (m === 2 ? 'X' : '·'); }).join(''), 셈: (s.paid && s.paid[v.c]) ? '끝' : '-' }; }));
    });
};
window.quizShowDebug = { Q: Q, IN: IN, shows: function () { return SHOWS; }, cur: curShow, verdictOf: verdictOf, paint: paintStage, enter: enter, kick: function (c) { return kick(c); }, leave: leave, pending: pendingShow, sweep: sweepMine, cage: cageMe, cageWait: cageWait, judge: judge, pick: pick, sel: function () { return sel; }, ask: ask, walk: hostWalk, down: function () { return hostDown; }, fin: finCheck, sfx: function () { return SFX ? { state: SFX.ctx.state, n: SFX.n || 0, last: SFX.last || 0 } : null; }, sfxTest: sfxVerdict, BGM: BGM, el: function () { return bgm; }, bgm: function () { return bgm ? { paused: bgm.paused, t: bgm.currentTime, want: bgmWant, muted: bgm.muted, open: !!bgm._open, src: bgm.src } : { want: bgmWant }; } };

console.log('[토크쇼] 🎤 초대 — 화요 퀴즈쇼 (단상 · 명패 · 정답 O / 오답 X · 붉은 글씨 → 브라운관 꺼짐 → 커튼)');
})();
