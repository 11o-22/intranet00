// ==========================================
// ★ 말을 바꾸는 물약 — 🍋 레몬맛 · 🫐 블루베리맛 · 🍊 자몽맛 (2026-11-16 사용자)
// bundles.json — newitems.js · allchat.js · plaza.js 뒤
// ==========================================
//
// ■ 사용자가 준 말 (그대로)
//   「자몽맛 물약 4000p - 마신 사람은 24 시간동안 졸음 상태가 되며 3시간에 한 번씩 잠꼬대를 한다.
//    (자동으로 말풍선이 뜨게 하기. > 음냐음냐, 커억, 드르렁. 中 1) ,
//    레몬맛 물약 4000p - 마신 사람은 3 시간동안 모든 말의 받침에 ㅇ 이 들어간다. (타자 칠 때는 그대로 보이나 전송하자마자 ㅇ이 들어가게.)
//    그리고 블루베리맛 물약을 마신 사람들은 대답할 때 네. 만 가능하게 하고 기준은 이전 채팅에 ? 이 들어간 말이 있을 때에.
//    (최근 채팅 20 개 중 하나라도 ? 이 들어갈 경우.)」
//
// ■ 이렇게 했다
//   · 자몽맛 · 레몬맛 — 4,000 P · 다른 맛 물약(newitems.js)처럼 남에게도 쓰고 · 우주 쇼핑몰 진열 후보에 오른다.
//   · 🍋 레몬맛 (3 시간) — 보내는 순간 한글 글자마다 받침을 ㅇ 으로 (없으면 넣고 · 있으면 바꾼다). 「안녕하세요」 → 「앙녕항생용」
//     칠 때는 그대로 보이고 전송하자마자 바뀐다. (「반가워요」 → 「방강웡용」)
//   · 🫐 블루베리맛 (3 시간 · 원래 있던 물약) — 그 채팅의 최근 20 줄 가운데 **남이 한 말**에 「?」가 하나라도 있으면
//     무엇을 쳐도 「네.」로 나간다. 물음이 없으면 하고 싶은 말을 그대로 한다. (내가 한 물음은 세지 않는다 — 내 말에 「네.」로 답하게 되지 않게)
//     둘 다 마셨으면 「네.」에 레몬이 붙어 「넹.」
//   · 🍊 자몽맛 (24 시간) — 졸음 상태: 광장에서 머리 위에 💤 가 뜬다 (남에게도).
//     ★ 2026-11-16 사용자 「자몽 물약은 24시간 내내 졸음 상태로 하고, 눈 감고 있게 해줘. 말풍선은 30분에 한 번씩 나오게 하고.」
//       → 24 시간 내내 💤 · 광장 캐릭터가 눈을 감고 있다 (서 있을 때도 걸을 때도 — closet.js sleep) · 잠꼬대는 30 분에 한 번 (처음엔 3 시간)
//     30 분에 한 번 「음냐음냐」 · 「커억」 · 「드르렁」 가운데 하나를 저절로 말한다 (광장 말풍선 · 지금 채팅 칸).
//     그때 광장에 없으면 다음에 광장에 들어왔을 때 한 번 한다 (밀린 만큼 몰아서 하지는 않는다).
//   · 바뀌는 채팅 — 광장(서버 · 맵 · 귓속말) · 사내 채팅 · 어둠 파티 채팅 · 사택 채팅 · 관전 채팅. 시스템이 보내는 알림 줄은 안 바뀐다.
//
// ■ 콘솔
//   potionChatState()        지금 걸린 것 · 다음 잠꼬대
//   potionChatTest('말')     지금 상태로 바꾸면 어떻게 나가는지

(function potionChat() {
'use strict';

const LEMON = '레몬맛 물약', BLUE = '블루베리맛 물약', GRAPE = '자몽맛 물약';
const SLEEP_TALK = ['음냐음냐', '커억', '드르렁', '쿨쿨'];          // 쿨쿨 — 2026-11-16 사용자 「잠꼬대 쿨쿨도 넣어줘」
const TALK_EVERY = 30 * 60 * 1000;     // ★ 2026-11-16 사용자 「말풍선은 30분에 한 번씩」 (처음엔 3 시간)
const RECENT = 20;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function effOn(u, name) {
    const t = Date.now();
    return !!(u && Array.isArray(u.timedEffects) && u.timedEffects.some(function (e) { return e && e.name === name && (!e.expireAt || e.expireAt > t); }));
}
function effOf(u, name) {
    const t = Date.now();
    return (u && Array.isArray(u.timedEffects)) ? u.timedEffects.filter(function (e) { return e && e.name === name && (!e.expireAt || e.expireAt > t); })[0] || null : null;
}
window.potionLemon = function (u) { return effOn(u || u_(), LEMON); };
window.potionBlue = function (u) { return effOn(u || u_(), BLUE); };
window.potionDrowsy = function (u) { return effOn(u || u_(), GRAPE); };

// ==========================================
// 물품 — 자몽맛 · 레몬맛 (4,000 P · 남에게도)
// ==========================================
(function reg() {
    function put() {
        if (typeof ITEM_CATALOG === 'undefined') return false;
        if (!ITEM_CATALOG[GRAPE]) ITEM_CATALOG[GRAPE] = { price: 4000, usable: true, targetable: true, effect: 'p_grape',
            desc: '마신 사람은 24 시간 내내 졸음 상태가 되어 눈을 감고 있고, 30 분에 한 번씩 잠꼬대를 한다 (음냐음냐 · 커억 · 드르렁 · 쿨쿨).' };
        if (!ITEM_CATALOG[LEMON]) ITEM_CATALOG[LEMON] = { price: 4000, usable: true, targetable: true, effect: 'p_lemon',
            desc: '마신 사람은 3 시간 동안 하는 말마다 받침에 ㅇ 이 들어간다 (보내는 순간).' };
        // 블루베리맛 — 설명을 실제 규칙에 맞춘다
        if (ITEM_CATALOG[BLUE]) ITEM_CATALOG[BLUE].desc = "세 시간 동안, 최근 채팅 20 줄 가운데 물음(?)이 있으면 무엇을 말해도 '네.'라고만 나간다.";
        try {
            if (typeof ALIEN_ITEMS_POOL !== 'undefined') [GRAPE, LEMON].forEach(function (n) { if (ALIEN_ITEMS_POOL.indexOf(n) < 0) ALIEN_ITEMS_POOL.push(n); });
        } catch (e) { }
        return true;
    }
    if (put()) return;
    const iv = setInterval(function () { if (put()) clearInterval(iv); }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
// 쓰기 — 다른 맛 물약과 같은 길 (newitems.js applyItemEffect)
(function hookApply() {
    const iv = setInterval(function () {
        const f = window.applyItemEffect;
        if (typeof f !== 'function') return;
        if (f._potionChat) { clearInterval(iv); return; }
        const w = function (targetUser, itemName, isOthers) {
            const cat = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[itemName] : null;
            const eff = cat && cat.effect;
            if (eff !== 'p_grape' && eff !== 'p_lemon') return f.apply(this, arguments);
            const a = eff === 'p_grape' ? [GRAPE, '졸음 — 눈을 감고 30 분에 한 번씩 잠꼬대 (음냐음냐 · 커억 · 드르렁 · 쿨쿨)', 24]
                                        : [LEMON, '하는 말마다 받침에 ㅇ 이 들어감', 3];
            addTimedEffect(targetUser, a[0], a[1], a[2]);
            if (eff === 'p_grape' && targetUser) targetUser.zzLast = Date.now();      // 잠꼬대는 마신 때부터 30 분마다
            showCustomAlert(isOthers ? targetUser.name + ' 사원에게 ' + a[0] + '을 사용했습니다.' : a[0] + '\n\n' + a[1]);
            return true;
        };
        w._potionChat = true;
        window.applyItemEffect = w;
        try { applyItemEffect = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 말 바꾸기
// ==========================================
// 🍋 한글 글자마다 받침을 ㅇ 으로 (ㅇ = 종성 21)
function lemon(s) {
    return String(s).replace(/[가-힣]/g, function (ch) {
        const c = ch.charCodeAt(0) - 0xAC00;
        return String.fromCharCode(0xAC00 + c - (c % 28) + 21);
    });
}
// 🫐 최근 줄 가운데 남이 한 물음
function asked(recent) {
    const me = u_(), mc = me && me.code;
    return (recent || []).slice(-RECENT).some(function (m) {
        if (!m) return false;
        const t = typeof m === 'string' ? m : m.t;
        if (typeof m === 'object' && (m.sys || (mc && m.c === mc))) return false;
        return /[?？]/.test(String(t || ''));
    });
}
// recent — [{ t: 말, c: 사원번호, sys }] (그 채팅의 지난 줄)
function xform(text, recent) {
    const u = u_();
    let t = String(text == null ? '' : text);
    if (!u || !t.trim()) return t;
    if (effOn(u, BLUE) && asked(recent)) t = '네.';
    if (effOn(u, LEMON)) t = lemon(t);
    return t;
}
window.potionChatXform = xform;
window.potionLemonText = lemon;

// 채팅마다 지난 줄
function partyRecent() {
    try { return (typeof partyChatLog !== 'undefined' && partyChatLog ? partyChatLog : []).map(function (m) { return { t: m.text, c: m.code, sys: m.code === 'SYSTEM' }; }); } catch (e) { return []; }
}
function houseRecent() {
    try { return (typeof houseChatLog !== 'undefined' && houseChatLog ? houseChatLog : []).map(function (m) { return { t: m.text, c: m.code }; }); } catch (e) { return []; }
}
function specRecent() {
    try { return (typeof spectateChat !== 'undefined' && spectateChat ? spectateChat : []).map(function (m) { return { t: m.text, c: m.code, sys: m.code === 'SYSTEM' }; }); } catch (e) { return []; }
}
function allRecent() {
    try { return (typeof window.allChatRecent === 'function' ? window.allChatRecent() : []).map(function (m) { return { t: m.text, c: m.code }; }); } catch (e) { return []; }
}
// 입력칸을 읽어 보내는 함수 앞에서 칸의 글을 바꿔 둔다 — 칠 때는 그대로 · 보내는 순간 바뀐다
const SENDS = [
    ['submitPartyChat', 'pchat-input', partyRecent],
    ['sendHouseChat', 'hchat-input', houseRecent],
    ['sendSpectateChat', 'spec-chat-input', specRecent],
    ['sendAllChat', 'allchat-input', allRecent]
];
function hookSends() {
    SENDS.forEach(function (s) {
        const f = window[s[0]];
        if (typeof f !== 'function' || f._potionChat) return;
        const w = function () {
            try {
                const inp = document.getElementById(s[1]);
                if (inp && String(inp.value || '').trim()) {
                    const v = xform(inp.value, s[2]());
                    if (v !== inp.value) inp.value = v;
                }
            } catch (e) { }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { if (!(k in w)) { try { w[k] = f[k]; } catch (e) { } } });
        w._potionChat = true;
        window[s[0]] = w;
    });
}
hookSends();
setInterval(hookSends, 2000);                       // 다른 파일이 뒤에 다시 감싸도 맨 바깥에 선다

// ==========================================
// 🍊 잠꼬대 — 30 분에 한 번 (광장에 있을 때 · 2026-11-16 처음 3 시간에서 바꿈)
// ==========================================
function talkTick(force) {
    const u = u_();
    if (!u) return;
    const e = effOf(u, GRAPE);
    if (!e) return;
    const start = (e.expireAt || Date.now()) - 24 * 3600 * 1000;
    if (!u.zzLast || u.zzLast < start - 60000) u.zzLast = start;          // 지난번 물약의 기록이면 이번 것의 시작으로
    if (!force && Date.now() - u.zzLast < TALK_EVERY) return;
    if (typeof window.plazaSay !== 'function' || typeof window.plazaWhere !== 'function') return;
    let inPlaza = false;
    try { inPlaza = !!window.plazaWhere(); } catch (e2) { }
    if (!inPlaza) return;                                                   // 광장에 들어오면 그때 한다
    const line = SLEEP_TALK[Math.floor(Math.random() * SLEEP_TALK.length)];
    u.zzLast = Date.now();
    try { if (typeof saveFields === 'function') saveFields({ zzLast: 1 }); } catch (e3) { }
    try { window.plazaSay(line); } catch (e4) { }
}
setInterval(function () { try { talkTick(); } catch (e) { } }, 20000);
window.potionTalkNow = function () { talkTick(true); };   // 점검용 — 졸음이면 지금 한 번

// ==========================================
// 콘솔
// ==========================================
window.potionChatState = function () {
    const u = u_(); if (!u) return;
    const g = effOf(u, GRAPE);
    console.log('%c===== 말을 바꾸는 물약 =====', 'color:#ffd27a; font-size:13px');
    console.log('  🍋 레몬', effOn(u, LEMON), '· 🫐 블루베리', effOn(u, BLUE), '· 🍊 자몽', !!g);
    if (g) console.log('  다음 잠꼬대', new Date((u.zzLast || 0) + TALK_EVERY).toLocaleString('ko-KR'));
};
window.potionChatTest = function (t, q) { return xform(t, q ? [{ t: '뭐 해?', c: '__' }] : []); };
})();
