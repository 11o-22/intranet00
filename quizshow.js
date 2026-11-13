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
//   퀴즈는 사회자가 말로 낸다. 쇼가 도는 동안 사회자가
//       「정답.」           → **직전에 말한 참가자** 머리 위에 초록 O
//       「땡」 · 「오답.」   → 직전에 말한 참가자 머리 위에 빨간 X
//   (그 말만 따로 — 「정답은 3번」 처럼 다른 말이 붙으면 채점이 아니다. 한 번 말한 답에는 한 번만 채점한다.)
//   한 사람에 세 문제. 다 채점되면 그 자리에서, 쇼를 끝내면 덜 푼 사람도 맞힌 수대로 받는다.
//       1개 10,000 P · 2개 10,000 P + 5,000 꿈결 · 3개 20,000 P + 10,000 꿈결
//   ※ 상은 한 사원에 하루 한 번 (자정 기준) — 사회자와 손님이 짜고 되풀이해 받는 길을 막는다. (사용자가 정한 값은 아니다 — 바꾸려면 settle 의 quizDay)
//   명패 아래 동그라미 셋이 푼 문제다 (초록 · 빨강). 오른쪽 위 [📺 화요 퀴즈쇼] — 현황 · 더 초대 · 쇼를 끝낸다 · 나간다.
//
//   들어갈 때 (쇼마다 처음 한 번 · 다시 들어갈 때는 커튼만) —
//   붉은 글씨 여섯 장이 영화처럼 지나가고 → 「나는」 이 선 화면을 찢고 나오고 → 브라운관이 꺼지듯
//   (화면 압축 → 수평선 → 빛의 점 → 암전) → 같은 붉은색의 커튼이 걷히며 무대가 열린다.
//
// ■ 광장 쪽 (plaza.js)
//   R.quiz (gate · fit · camX · padTop · full · pud) · goRoom 의 문지기 · plazaPin / plazaPinned · plazaOnPaint · plazaOnMySay · plazaOnPeerSay
//
// ■ 적히는 자리
//   quizShow/<사회자 사번> = { id, host, name, at, inst, inv: { 사번: { at, st: p|y|n } }, seat: { s1..s6: { c, nick, at } },
//                              mark: { 사번: { q1..q3: 1(O) | 2(X) } }, last: { c, v, k, at }, paid: { 사번: { n, at, skip } }, end }
//   quizWin/<사번>/<열쇠>  = { pts, dream, n, by, name, at }   받을 상 (그 사원 화면이 받고 지운다 — 나가 있었으면 들어올 때)
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
const ADMIN = 'kario0987';

const Q = {
    MAX: 6,                        // 한 쇼에 부를 수 있는 손님
    PER: 3,                        // 한 사람에 문제 셋
    PRIZE: { 1: { pts: 10000, dream: 0 }, 2: { pts: 10000, dream: 5000 }, 3: { pts: 20000, dream: 10000 } },
    LIFE_MS: 3 * 3600000,          // 안 끝내고 두어도 이만큼 지나면 끝난 쇼로 본다
    KEEP_MS: 10 * 60000,           // 끝난 쇼의 기록을 남겨 두는 동안
    NICK_MAX: 6,
    PLATE_MIN: 7.5,                // 명패 글씨가 화면에서 적어도 이만큼(px)은 되게
    POP_MS: 2600,                  // 머리 위 O · X 가 크게 떠 있는 동안
    POP: 112, HEAD: 196,           // O · X 의 크기 · 발끝에서 머리 위까지 (방 그림 좌표 · 사람 1배일 때)
    HAIR_BACK: 84, HAIR_FRONT: 56, // 사람 머리가 가리는 폭 — 뒤통수 쪽(긴 머리) · 얼굴 쪽. 앞줄 사람이 뒷줄 명패를 이만큼 가린다
    // 서는 자리 (방 그림 좌표 · 발끝) — f 는 보는 쪽 (1 왼쪽 · -1 오른쪽)
    //   뒷줄은 의자 앞(마이크 왼쪽). 앞줄은 뒷줄 사람 바로 앞 — 뒷줄 명패 사이의 틈에 서야 명패의 닉네임을 안 가린다 (단체 사진처럼 뒷줄은 머리가 위로 보인다)
    HOST: { x: 1470, y: 1204, f: 1 },
    SEAT: {
        s1: { x: 292, y: 1200, f: -1 }, s2: { x: 492, y: 1200, f: -1 }, s3: { x: 706, y: 1200, f: -1 },
        s4: { x: 296, y: 1300, f: -1 }, s5: { x: 505, y: 1300, f: -1 }, s6: { x: 700, y: 1300, f: -1 }
    },
    // 명패 (방 그림 좌표 — 그림에서 쟀다)
    PLATE: {
        s1: [348, 1122, 120, 40], s2: [528, 1122, 120, 40], s3: [714, 1122, 120, 40],
        s4: [202, 1202, 116, 40], s5: [376, 1202, 120, 40], s6: [564, 1202, 116, 40],
        host: [1328, 1118, 136, 40]
    },
    // 층 — 사람은 100 + 발끝 y. 뒷줄 사람 < 뒷단상 < 앞줄 사람 < 앞단상
    Z1: 1312, Z2: 1412, ZTOP: 4200
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
function seatKeys(s) { return wide(s) ? ['s1', 's2', 's3', 's4', 's5', 's6'] : ['s1', 's2', 's3']; }
function seatOf(s, code) {
    const st = seatsOf(s);
    for (const k in st) if (st[k] && st[k].c === code && Q.SEAT[k]) return k;
    return '';
}
function marksOf(s, code) { const m = s && s.mark && s.mark[code]; return (m && typeof m === 'object') ? m : {}; }
function markList(s, code) { const m = marksOf(s, code); const out = []; for (let i = 1; i <= Q.PER; i++) out.push(Number(m['q' + i]) || 0); return out; }
function rightN(s, code) { return markList(s, code).filter(function (v) { return v === 1; }).length; }
function myHost() { const me = u_(); const s = me && SHOWS[me.code]; return live(s) ? s : null; }          // 내가 사회자인 쇼
function guestShows() {                                                                                    // 내가 초대받은 쇼들
    const me = u_(); if (!me) return [];
    return Object.keys(SHOWS).map(function (h) { return SHOWS[h]; }).filter(function (s) { return live(s) && s.host !== me.code && invOf(s)[me.code]; });
}
function seatedShow() { const me = u_(); return guestShows().filter(function (s) { return seatOf(s, me.code); })[0] || null; }
// 내가 지금 들어 있는(들어가려는) 쇼
let going = '';                              // 들어가려는 쇼의 사회자 사번
function curShow() {
    const me = u_(); if (!me) return null;
    if (going && live(SHOWS[going])) {
        const s = SHOWS[going];
        if (s.host === me.code || seatOf(s, me.code)) return s;
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
    const room = Q.MAX - Object.keys(inv).length;
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
    const n = rightN(s, code);
    return d.ref(PATH + '/' + me.code + '/paid/' + code).transaction(function (v) {
        if (v) return;                                         // 이미 셈했다
        return { n: n, at: now() };
    }).then(function (r) {
        if (!r || !r.committed) return false;
        const pz = Q.PRIZE[n];
        if (!pz) return true;                                  // 하나도 못 맞혔다
        const day = today();
        return d.ref(DAY + '/' + code).transaction(function (v) {
            if (v === day) return;                             // 오늘 이미 받았다
            return day;
        }).then(function (r2) {
            if (!r2 || !r2.committed) {
                try { d.ref(PATH + '/' + me.code + '/paid/' + code + '/skip').set(1); } catch (e) { }
                return true;
            }
            try { d.ref(WIN + '/' + code).push({ pts: pz.pts, dream: pz.dream, n: n, by: me.code, name: me.name || me.code, at: now() }); } catch (e) { }
            try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — ' + nameOf(code) + ' 사원 정답 ' + n + '개 (' + prizeText(pz) + ')'); saveFields({ history: 1 }); } catch (e) { }
            return true;
        });
    }).catch(function () { return false; });
}
function prizeText(pz) { return fmt(pz.pts) + ' P' + (pz.dream ? ' + ' + fmt(pz.dream) + ' 꿈결' : ''); }
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
// 채점 — 사회자의 「정답.」 · 「땡」 · 「오답.」 → 직전에 말한 참가자
// ==========================================
let lastSay = null;                          // { c, at } — 사회자 화면에서 본, 마지막으로 말한 참가자
function verdictOf(t) {
    t = String(t || '').trim();
    if (/^정답[\s.!~…]*$/.test(t)) return 1;
    if (/^(땡+|오답)[\s.!~…]*$/.test(t)) return 2;
    return 0;
}
(function hooks() {
    const p0 = window.plazaOnPeerSay, m0 = window.plazaOnMySay;
    window.plazaOnPeerSay = function (code, text, st) {
        try { if (typeof p0 === 'function') p0.apply(this, arguments); } catch (e) { }
        try {
            const s = myHost();
            if (!s || roomNow() !== ROOM) return;
            if (seatOf(s, code)) lastSay = { c: code, at: now() };
        } catch (e) { }
    };
    window.plazaOnMySay = function (text) {
        try { if (typeof m0 === 'function') m0.apply(this, arguments); } catch (e) { }
        try { judge(text); } catch (e) { console.warn('[퀴즈쇼]', e); }
    };
})();
function judge(text) {
    const s = myHost(), d = db_(), me = u_();
    if (!s || !d || !me || roomNow() !== ROOM) return;
    const v = verdictOf(text);
    if (!v) return;
    if (!lastSay || !seatOf(s, lastSay.c)) { sys('📺 직전에 말한 참가자가 없습니다 — 참가자가 답을 말한 뒤에 채점됩니다.'); return; }
    const code = lastSay.c;
    const list = markList(s, code);
    let k = -1;
    for (let i = 0; i < Q.PER; i++) if (!list[i]) { k = i; break; }
    if (k < 0) { sys('📺 ' + nickOf(s, code) + ' — 이미 세 문제를 다 풀었습니다.'); lastSay = null; return; }
    lastSay = null;                                            // 한 번 말한 답에 한 번만 채점한다
    const key = 'q' + (k + 1);
    // 내 화면에 먼저 (서버 값이 돌아오면 같은 값이다)
    s.mark = s.mark || {}; s.mark[code] = s.mark[code] || {}; s.mark[code][key] = v;
    s.last = { c: code, v: v, k: key, at: now() };
    const up = {};
    up['mark/' + code + '/' + key] = v;
    up['last'] = s.last;
    try { d.ref(PATH + '/' + me.code).update(up); } catch (e) { }
    paintMarks(); pop(s.last);
    sys('📺 ' + nickOf(s, code) + ' — ' + (v === 1 ? '⭕ 정답' : '❌ 오답') + ' (' + (k + 1) + '/' + Q.PER + ' · 맞힌 ' + rightN(s, code) + '개)');
    if (k + 1 >= Q.PER) settle(s, code);
}
function nickOf(s, code) { const k = seatOf(s, code); const st = k && seatsOf(s)[k]; return (st && st.nick) || nameOf(code); }

// ==========================================
// 상 받기 — 내 앞으로 온 것 (quizWin/<나>)
// ==========================================
let winRef = null;
function watchWin(code) {
    const d = db_(); if (!d) return;
    if (winRef) { try { winRef.off(); } catch (e) { } }
    winRef = d.ref(WIN + '/' + code);
    winRef.on('child_added', function (snap) {
        const id = snap.key, v = snap.val(), me = u_();
        if (!v || v.claimed || !me || me.code !== code) return;
        d.ref(WIN + '/' + code + '/' + id).transaction(function (x) {
            if (!x || x.claimed) return;
            x.claimed = true; return x;
        }).then(function (r) {
            if (!r || !r.committed) return;
            const pts = Math.max(0, Math.floor(Number(v.pts) || 0)), dream = Math.max(0, Math.floor(Number(v.dream) || 0));
            try { if (pts && typeof changePoints === 'function') changePoints(pts); } catch (e) { }
            try { if (pts && typeof showPointGainEffect === 'function') showPointGainEffect(pts); } catch (e) { }
            const fin = function () {
                try { addHistoryLog(me, '[토크쇼] 🎤 화요 퀴즈쇼 — 정답 ' + (v.n || 0) + '개 · +' + fmt(pts) + ' P' + (dream ? ' · +' + fmt(dream) + ' 꿈결' : '') + ' (' + (v.name || v.by || '') + ' 사회자)'); saveFields({ history: 1 }); } catch (e) { }
                try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
                const t = '📺 화요 퀴즈쇼 — 정답 ' + (v.n || 0) + '개! +' + fmt(pts) + ' P' + (dream ? ' · +' + fmt(dream) + ' 꿈결' : '');
                if (roomNow()) sys(t); else alert_(t);
                try { d.ref(WIN + '/' + code + '/' + id).remove(); } catch (e) { }
            };
            if (!dream) { fin(); return; }
            d.ref('users/' + code + '/kroom/dream').transaction(function (x) { return Math.max(0, Math.floor(Number(x) || 0)) + dream; })
                .then(function (r2) {
                    if (r2 && r2.committed) { if (!me.kroom || typeof me.kroom !== 'object') me.kroom = {}; me.kroom.dream = Math.max(0, Math.floor(Number(r2.snapshot.val()) || 0)); }
                }).catch(function () { }).then(fin);
        });
    });
}

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
        + '<div style="font-size:10px; color:#a88d6a; margin:6px 2px 12px; line-height:1.6;">손님은 단상 뒤에 섭니다. 한 사람에 세 문제 — 사회자가 「정답.」 · 「땡」 · 「오답.」 이라고 말하면 직전에 말한 참가자가 채점됩니다.<br>맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + ' (한 사원에 하루 한 번)</div>'
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
    const room = Q.MAX - Object.keys(inv0).length;
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
    const st = seatsOf(s), inv = invOf(s);
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
            + (pd ? '<div style="flex:0 0 auto; font-size:9.5px; color:' + (pd.skip ? '#a88d6a' : '#c79a5b') + ';">' + (pd.skip ? '오늘은 이미 받음' : (Q.PRIZE[pd.n] ? prizeText(Q.PRIZE[pd.n]) : '상 없음')) + '</div>' : '')
            + '</div>';
    });
    Object.keys(inv).forEach(function (c) {
        if (seated[c]) return;
        const stt = inv[c] && inv[c].st;
        h += '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:0 0 auto; width:20px; font-size:10px; color:#a88d6a;">–</div>'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#a88d6a;">' + esc(nameOf(c)) + '</div>'
            + '<div style="flex:0 0 auto; font-size:10px; color:#a88d6a;">' + (stt === 'n' ? '거절' : '초대장을 보는 중') + '</div></div>';
    });
    return h || '<div style="font-size:10.5px; color:#a88d6a; padding:6px 0;">아직 아무도 없습니다.</div>';
}
function manage() {
    const me = u_(), s = curShow();
    if (!me || !s) { shut(); return; }
    const host = s.host === me.code, inRoom = roomNow() === ROOM;
    const left = Q.MAX - Object.keys(invOf(s)).length;
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">🎓 화요 퀴즈쇼' + (host ? ' — 진행' : '') + '</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:8px; line-height:1.6;">' + (host
            ? '「정답.」 → 직전에 말한 참가자에게 <b style="color:#3ddc6a;">O</b> · 「땡」 · 「오답.」 → <b style="color:#ff4a4a;">X</b>. 한 사람에 세 문제이고, 다 채점되면 그 자리에서 상이 나갑니다. 쇼를 끝내면 덜 푼 사람도 맞힌 수대로 받습니다.'
            : esc(s.name || nameOf(s.host)) + ' 사회자의 무대 — 한 사람에 세 문제. 맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + ' (하루 한 번)') + '</div>'
        + '<div id="qz-status">' + statusRows(s) + '</div>'
        + '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">'
        + (!inRoom ? '<button id="qz-in" class="game-btn" style="flex:1 1 100%; ' + B_GOLD + '">무대로 들어간다</button>' : '')
        + (host && left > 0 ? '<button id="qz-more" class="game-btn" style="flex:1; ' + B_BROWN + '">더 초대 (' + left + ')</button>' : '')
        + (host ? '<button id="qz-end" class="game-btn" style="flex:1; ' + B_RED + '">쇼를 끝낸다</button>' : '')
        + (inRoom ? '<button id="qz-out" class="game-btn" style="flex:1; ' + B_BROWN + '">무대에서 나간다</button>' : '')
        + '<button id="qz-x" class="game-btn" style="flex:1; ' + B_GREY + '">닫는다</button></div>');
    const q = function (id) { return w.querySelector('#' + id); };
    q('qz-x').onclick = shut;
    if (q('qz-in')) q('qz-in').onclick = function () { shut(); enter(s.host); };
    if (q('qz-more')) q('qz-more').onclick = function () { pickGuests(true); };
    if (q('qz-out')) q('qz-out').onclick = function () { shut(); leave(); };
    if (q('qz-end')) q('qz-end').onclick = function () {
        const w2 = box('<div style="text-align:center; padding:10px 4px 2px;"><div style="font-size:15px; color:#f3e6d2; letter-spacing:1px; margin-bottom:10px;">화요 퀴즈쇼의 막을 내립니까?</div>'
            + '<div style="font-size:11px; color:#a88d6a; line-height:1.7;">덜 푼 사람도 지금까지 맞힌 수대로 상을 받고, 모두 광장으로 돌아갑니다.</div></div>'
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
    return guestShows().filter(function (s) { const v = invOf(s)[me.code]; return v && v.st !== 'n' && !seatOf(s, me.code); })[0] || null;
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
        + '<div style="font-size:11px; color:#a88d6a; margin-top:10px; line-height:1.7;">' + esc(s.name || nameOf(s.host)) + ' 사회자가 무대로 초대했습니다.<br>한 사람에 세 문제 — 맞힌 수대로 1개 ' + prizeText(Q.PRIZE[1]) + ' · 2개 ' + prizeText(Q.PRIZE[2]) + ' · 3개 ' + prizeText(Q.PRIZE[3]) + '</div>'
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
        const nick = String(inp.value || '').replace(/\s+/g, ' ').trim().slice(0, Q.NICK_MAX);
        if (!nick) { alert_('명패에 적을 닉네임을 적어 주세요.'); return; }
        accept(s, nick);
    };
}
function accept(s, nick) {
    const me = u_(), d = db_();
    if (!me || !d) return;
    if (!live(SHOWS[s.host])) { shut(); alert_('이미 끝난 쇼입니다.'); return; }
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
        try { d.ref(PATH + '/' + s.host + '/inv/' + me.code + '/st').set('y'); } catch (e) { }
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
// 들어가기 · 나가기
// ==========================================
function enter(host) {
    const me = u_();
    const s = SHOWS[host];
    if (!me || !live(s)) { alert_('이미 끝난 쇼입니다.'); return; }
    if (s.host !== me.code && !seatOf(s, me.code)) { alert_('초대장으로 먼저 자리에 앉아야 합니다.'); return; }
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
    try { if (typeof window.plazaPin === 'function') window.plazaPin(null); } catch (e) { }
    try { if (roomNow() === ROOM) window.plazaGo(START); } catch (e) { }
    clearStage();
    chip();
}
function seenIntro() { try { return sessionStorage.getItem('qzIntro') || ''; } catch (e) { return ''; } }
function markIntro(id) { try { sessionStorage.setItem('qzIntro', String(id)); } catch (e) { } }
function mySpot(s) {
    const me = u_(); if (!me || !s) return null;
    if (s.host === me.code) return Q.HOST;
    const k = seatOf(s, me.code);
    return k ? Q.SEAT[k] : null;
}
function seat() {
    const s = curShow(), sp = mySpot(s);
    if (!sp || roomNow() !== ROOM || typeof window.plazaPin !== 'function') return;
    let p = null;
    try { p = window.plazaPinned(); } catch (e) { }
    if (p && Math.abs(p.x - sp.x) < 1 && Math.abs(p.y - sp.y) < 1) return;
    window.plazaPin(sp);
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
        '#qz-ctl{position:absolute;right:12px;top:62px;z-index:60;padding:8px 14px;border-radius:14px;border:1px solid #c79a5b;background:rgba(42,27,14,.9);color:#f3e6d2;font-size:12px;font-weight:bold;box-shadow:0 3px 12px rgba(0,0,0,.5);}'
    ].join('\n');
    document.head.appendChild(st);
})();
let popKey = '';                             // 마지막으로 띄운 O · X (같은 것을 두 번 안 띄운다)
function lastKey(s) { const l = s && s.last; return l ? [s.id, l.c, l.k, l.v, l.at].join('|') : ''; }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function clearStage() {
    Array.prototype.forEach.call(document.querySelectorAll('.qz-layer, .qz-plate, .qz-pips, .qz-pop, #qz-ctl'), function (e) { e.remove(); });
    const ov = document.getElementById('plaza-ov'); if (ov) ov.classList.remove('qz-on');
}
function px(v, z) { return Math.round(v * z) + 'px'; }
function paintStage() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) { if (document.querySelector('.qz-layer, #qz-ctl')) clearStage(); return; }
    const s = curShow();
    const el = sg.el, z = sg.z;
    // ── 단상 그림
    const need = function (id, src, zi, on) {
        let im = el.querySelector('#' + id);
        if (!on) { if (im) im.remove(); return; }
        if (!im) {
            im = document.createElement('img');
            im.id = id; im.className = 'qz-layer'; im.alt = ''; im.src = DIR + src;
            el.appendChild(im);
        }
        im.style.zIndex = String(zi);
    };
    need('qz-t1', 'quiz-t1.webp', Q.Z1, true);
    need('qz-t2', 'quiz-t2.webp', Q.Z2, !!(s && wide(s)));
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
        p.style.background = grown ? '#e0b9a1' : 'transparent';
        p.style.boxShadow = grown ? '0 0 0 4px #2a1a22' : 'none';
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
}
// 명패 아래 세 칸 — 푼 문제 (O 초록 · X 빨강)
function paintMarks() {
    const sg = stage();
    if (!sg || sg.room !== ROOM) return;
    const s = curShow(), el = sg.el, z = sg.z, st = seatsOf(s);
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
    setTimeout(function () { e.remove(); }, Q.POP_MS + 100);
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
        paintStage(); seat();
    }
    // 내가 들어 있던 쇼가 끝났다
    if (roomNow() === ROOM && !s) {
        const old = going && SHOWS[going];
        sys(old && old.end ? '📺 화요 퀴즈쇼의 막이 내렸습니다 — 광장으로 돌아갑니다.' : '📺 화요 퀴즈쇼가 끝나 광장으로 돌아갑니다.');
        shut();
        leave();
    }
    if (document.getElementById('qz-status') && s) { try { document.getElementById('qz-status').innerHTML = statusRows(s); } catch (e) { } }
    chip();
}
setInterval(function () {
    try {
        const me = u_(); if (!me || !heard) return;
        const inRoom = roomNow() === ROOM;
        if (inRoom) {
            const s = curShow();
            if (!s) { sys('📺 화요 퀴즈쇼가 끝나 광장으로 돌아갑니다.'); shut(); leave(); return; }
            paintStage(); seat();
        } else if (document.querySelector('.qz-layer, #qz-ctl')) clearStage();
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
//   커튼은 그림 없이 글씨와 같은 붉은색으로 그린다 (사용자 「걷히는 커튼은 같은 붉은색 코드로」).
const IN = {
    CELL: 420,
    WORDS: [                                   // 칸 · 머무는 때(ms) · 들어오는 꼴
        { c: 0, ms: 720, fx: 'slam' },         // 보라!
        { c: 1, ms: 820, fx: 'left' },         // 내가 백만가면의 소유자요
        { c: 2, ms: 820, fx: 'right' },        // 혼돈의 군주요 광기의 정점이요
        { c: 3, ms: 820, fx: 'left' },         // 쾌락과 유희의 꿈이요
        { c: 4, ms: 980, fx: 'right' },        // 전쟁의 선동자요 과학의 어버이요 낯은 네발짐승이요
        { c: 5, ms: 1050, fx: 'slam' }         // 나는
    ],
    BURST: [150, 150, 170, 190, 210, 620],     // 찢고 나오는 여섯 장 — 장마다 머무는 때
    CRT: 1050, DARK: 380, CURTAIN: 1900
};
(function introCss() {
    const st = document.createElement('style');
    st.textContent = [
        '#qz-intro{position:fixed;inset:0;z-index:2147483000;background:#000;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;}',
        '#qz-intro .qi-film{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}',
        '#qz-intro .qi-cell{position:absolute;left:50%;top:50%;background-repeat:no-repeat;will-change:transform,opacity;}',
        '#qz-intro .qi-grain{position:absolute;inset:-20%;opacity:.07;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0 1px,transparent 1px 3px);animation:qiGrain .18s steps(2) infinite;}',
        '@keyframes qiGrain{0%{transform:translateY(0)}100%{transform:translateY(3px)}}',
        // 글씨 — 쾅 박히기 · 옆에서 스치기
        '@keyframes qiSlam{0%{transform:translate(-50%,-50%) scale(2.6);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(6px)}14%{transform:translate(-50%,-50%) scale(.96);opacity:1;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(0px)}22%{transform:translate(-50%,-50%) scale(1.03)}82%{transform:translate(-50%,-50%) scale(1.08);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(3px)}}',
        '@keyframes qiHold{0%{transform:translate(-50%,-50%) scale(2.6);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(6px)}14%{transform:translate(-50%,-50%) scale(.96);opacity:1;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(0px)}22%{transform:translate(-50%,-50%) scale(1.03)}100%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}',
        '@keyframes qiLeft{0%{transform:translate(-125%,-50%) scale(1.15) skewX(-14deg);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(5px)}16%{transform:translate(-53%,-50%) scale(1) skewX(0);opacity:1;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(0px)}80%{transform:translate(-47%,-50%) scale(1.04);opacity:1}100%{transform:translate(30%,-50%) scale(1.1) skewX(14deg);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(5px)}}',
        '@keyframes qiRight{0%{transform:translate(25%,-50%) scale(1.15) skewX(14deg);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(5px)}16%{transform:translate(-47%,-50%) scale(1) skewX(0);opacity:1;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(0px)}80%{transform:translate(-53%,-50%) scale(1.04);opacity:1}100%{transform:translate(-130%,-50%) scale(1.1) skewX(-14deg);opacity:0;filter:brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(5px)}}',
        '@keyframes qiShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-7px,4px)}40%{transform:translate(6px,-5px)}60%{transform:translate(-4px,-3px)}80%{transform:translate(4px,3px)}}',
        '@keyframes qiFlash{0%{opacity:.85}100%{opacity:0}}',
        '#qz-intro .qi-flash{position:absolute;inset:0;background:#8a0000;opacity:0;pointer-events:none;z-index:2;}',
        // 브라운관 꺼짐 — 화면 압축 → 수평선 → 빛의 점 → 암전
        '#qz-intro .qi-crt{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100vw;height:100vh;z-index:5;',
        '  background:linear-gradient(180deg,#d9e6e6 0,#f4f8f8 22%,#f4f8f8 78%,#d9e6e6 100%);box-shadow:0 0 50px 12px rgba(210,228,228,.5);}',
        '@keyframes qiCrt{0%{width:100vw;height:100vh;border-radius:0;opacity:1}8%{width:100vw;height:100vh;border-radius:0}36%{width:96vw;height:22vh;border-radius:10px}',
        '  56%{width:88vw;height:5px;border-radius:5px;box-shadow:0 0 22px 5px rgba(210,228,228,.75)}76%{width:16px;height:6px;border-radius:50%;box-shadow:0 0 0 7px rgba(120,140,140,.6),0 0 26px 10px rgba(210,228,228,.6)}',
        '  90%{width:8px;height:5px;border-radius:50%;box-shadow:0 0 0 4px rgba(120,140,140,.5);opacity:1}100%{width:0;height:0;border-radius:50%;box-shadow:none;opacity:0}}',
        // 커튼 — 글씨와 같은 붉은색. 주름은 세로 줄무늬로.
        '#qz-intro .qi-cur{position:absolute;top:-2%;bottom:-2%;width:52%;z-index:6;will-change:transform;',
        '  background:repeating-linear-gradient(90deg,#3a0000 0,#800000 5%,#a30d0d 8%,#800000 11%,#4a0000 16%,#2c0000 18%);box-shadow:0 0 40px rgba(0,0,0,.8);}',
        '#qz-intro .qi-cur.l{left:0;transform-origin:0 0;}',
        '#qz-intro .qi-cur.r{right:0;transform-origin:100% 0;}',
        '#qz-intro .qi-cur:after{content:"";position:absolute;left:0;right:0;bottom:0;height:3.2%;background:repeating-linear-gradient(90deg,#c79a5b 0 6px,#6a4a22 6px 12px);box-shadow:0 -2px 0 #2a1b0e;}',
        '#qz-intro .qi-cur:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 70%,rgba(0,0,0,.45) 100%);}',
        '@keyframes qiCurL{0%{transform:translateX(0) scaleX(1)}100%{transform:translateX(-4%) scaleX(.02)}}',
        '@keyframes qiCurR{0%{transform:translateX(0) scaleX(1)}100%{transform:translateX(4%) scaleX(.02)}}',
        '#qz-intro .qi-val{position:absolute;left:-2%;right:-2%;top:0;height:11%;z-index:7;background:repeating-linear-gradient(90deg,#2c0000 0,#6a0000 4%,#8f0a0a 6%,#6a0000 8%,#2c0000 12%);',
        '  border-bottom:4px solid #c79a5b;box-shadow:0 6px 18px rgba(0,0,0,.7);border-radius:0 0 50% 50%/0 0 30% 30%;}',
        '@keyframes qiValUp{0%{transform:translateY(0)}100%{transform:translateY(-115%)}}'
    ].join('\n');
    document.head.appendChild(st);
})();
// 그림을 미리 받아 둔다 — 연출 도중에 빈 칸이 뜨지 않게
const pre = {};
function preload() {
    ['quiz-words.webp', 'quiz-burst.webp', 'quiz-show.webp', 'quiz-t1.webp', 'quiz-t2.webp'].forEach(function (f) {
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
    ov.innerHTML = '<div class="qi-film"></div><div class="qi-grain"></div><div class="qi-flash"></div>';
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

    // 글씨 — 마지막 「나는」 은 사라지지 않고 남는다. 그 화면을 찢고 나온다.
    let holder = null;
    const words = function () {
        let p = Promise.resolve();
        IN.WORDS.forEach(function (w, i) {
            const lastW = i === IN.WORDS.length - 1;
            p = p.then(function () {
                film.innerHTML = '';
                const e = cellEl('quiz-words.webp', w.c, Math.round(size()));
                e.style.filter = 'brightness(1.75) drop-shadow(0 0 10px rgba(190,0,0,.8)) blur(0px)';   // 주신 글씨는 어두운 붉은색이라 검은 바탕에서 묻힌다 — 빛만 올린다 (움직이는 동안의 값은 @keyframes 에 같은 꼴로 있다)
                e.style.animation = (lastW ? 'qiHold' : (w.fx === 'slam' ? 'qiSlam' : (w.fx === 'left' ? 'qiLeft' : 'qiRight'))) + ' ' + w.ms + 'ms cubic-bezier(.2,.8,.2,1) forwards';
                if (lastW) {
                    holder = document.createElement('div');
                    holder.style.cssText = 'position:absolute;inset:0;transform:scale(1);';
                    holder.appendChild(e);
                    film.appendChild(holder);
                } else film.appendChild(e);
                if (w.fx === 'slam') { doFlash(240); shake(240); }
                return wait(w.ms);
            });
        });
        return p;
    };
    // 찢고 나온다 — 글씨가 선 화면(붉은 막)이 찢기고, 그 틈으로 손이 · 머리가 · 몸이 나온다. 보는 쪽으로 다가오며 커진다.
    const burst = function () {
        let p = Promise.resolve();
        const px = Math.round(size());
        if (!holder) { film.innerHTML = ''; holder = document.createElement('div'); holder.style.cssText = 'position:absolute;inset:0;transform:scale(1);'; film.appendChild(holder); }
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
    const curtain = function () {
        film.innerHTML = '';
        const gr = ov.querySelector('.qi-grain'); if (gr) gr.remove();
        const l = document.createElement('div'), r = document.createElement('div'), v = document.createElement('div');
        l.className = 'qi-cur l'; r.className = 'qi-cur r'; v.className = 'qi-val';
        l.style.opacity = r.style.opacity = v.style.opacity = '0';
        l.style.transition = r.style.transition = v.style.transition = 'opacity .45s ease';
        ov.appendChild(l); ov.appendChild(r); ov.appendChild(v);
        void l.offsetWidth;
        l.style.opacity = r.style.opacity = v.style.opacity = '1';
        return wait(520).then(function () {
            // 막이 다 가렸다 — 그 뒤에서 방을 옮긴다
            let ok = true;
            try { ok = behind() !== false; } catch (e) { ok = false; }
            if (!ok) { fin(); return; }
            return wait(480).then(function () {
                ov.style.background = 'transparent';
                l.style.animation = 'qiCurL ' + IN.CURTAIN + 'ms cubic-bezier(.6,0,.3,1) forwards';
                r.style.animation = 'qiCurR ' + IN.CURTAIN + 'ms cubic-bezier(.6,0,.3,1) forwards';
                v.style.animation = 'qiValUp ' + Math.round(IN.CURTAIN * 0.8) + 'ms cubic-bezier(.6,0,.3,1) ' + Math.round(IN.CURTAIN * 0.35) + 'ms forwards';
                return wait(IN.CURTAIN + 120).then(fin);
            });
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
window.quizShowDebug = { Q: Q, IN: IN, shows: function () { return SHOWS; }, cur: curShow, verdictOf: verdictOf, paint: paintStage, enter: enter, leave: leave, pending: pendingShow, sweep: sweepMine };

console.log('[토크쇼] 🎤 초대 — 화요 퀴즈쇼 (단상 · 명패 · 정답 O / 오답 X · 붉은 글씨 → 브라운관 꺼짐 → 커튼)');
})();
