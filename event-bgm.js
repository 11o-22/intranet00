// ==========================================
// ★ 🎃 이벤트 배경 음악 (2026-10-31 사용자)
// bundles.json 마지막 묶음 맨 끝 — plaza.js · wonder-*.js 보다 뒤
// ==========================================
//
//   주신 음원을 이름에 맞는 자리에 둔다 (snd/).
//
//     wonder-intro.mp3     공통 도입부 — 「이상한 나라의 ■■■」 를 혼자 들어가려고 반입 화면을 열거나 파티를 편성하면
//                          (방을 만든 순간부터) 틀고, 탐사 안에서도 공통 도입 · 둥근 홀 · 멈추기/잇기 동안 이어 튼다.
//                          제 음원이 없는 챕터(천사 · 서큐버스 · 늑대인간)도 이 곡을 그대로 이어 튼다.
//     wonder-jiangshi.mp3  강시 챕터 (연계판까지)
//     wonder-vampire.mp3   뱀파이어 챕터 (연계판까지)
//     wonder-siren.mp3     세이렌 챕터 (연계판까지)
//     halloween-plaza.mp3  할로윈 광장 — 광장 길 · 건물 안 여덟 방 전체
//     halloween.mp3        그냥 할로윈 — 포토존 「핼러윈」
//
//   이상한 나라가 광장보다 앞선다 (광장 위에 띄운 어둠 창에서 방을 만들어도 이상한 나라 곡).
//   끄고 켜기: 광장 위 띠의 🔊 (이 브라우저에 기억) · 어둠 탐사 화면의 🔇 도 이상한 나라 곡을 끈다.
//   곡이 바뀔 때는 짧게 줄였다 키운다. 브라우저가 아직 소리를 막고 있으면 다음 누름 때 튼다.
//
// ■ 콘솔
//   eventBgmState()

(function eventBgm() {
'use strict';

const T = {
    intro:    'snd/wonder-intro.mp3',
    jiangshi: 'snd/wonder-jiangshi.mp3',
    vampire:  'snd/wonder-vampire.mp3',
    siren:    'snd/wonder-siren.mp3',
    plaza:    'snd/halloween-plaza.mp3',
    pzh:      'snd/halloween.mp3'
};
const VOL = 0.42;
const FADE_MS = 700;
const KEY_OFF = 'evBgmOff';
const W = 'Qtrew-W-001';
// 광장에서 곡을 트는 방 — 포토존은 「핼러윈」 만
const PLAZA_ROOMS = { plaza: 1, dream: 1, casino: 1, post: 1, gate: 1, bureau: 1, dfront: 1, dshop: 1 };
// 이상한 나라에서 공통 곡을 트는 화면
const COMMON = { hall: 1, cont: 1, tie: 1, tieOut: 1, roundEnd: 1, stopped: 1 };

let off = false;
try { off = localStorage.getItem(KEY_OFF) === '1'; } catch (e) { }

let cur = null, el = null, fadeIv = null;
let briefW = false;

function W_() { return window.WONDER || null; }
function inRunW() { try { const X = W_(); return !!(X && X.inW && X.inW()); } catch (e) { return false; } }
function partyW() { try { const p = (typeof getMyParty === 'function') ? getMyParty() : null; return !!(p && p.zone === W); } catch (e) { return false; } }
function briefOpenW() { try { return briefW && typeof darkBriefingOpen !== 'undefined' && !!darkBriefingOpen; } catch (e) { return false; } }
function darkMuted() { try { return typeof darkAudio !== 'undefined' && darkAudio && !!darkAudio.muted; } catch (e) { return false; } }

// 이상한 나라 안에서 — 지금 무슨 곡인가
function wonderTrack() {
    const X = W_();
    let F = null;
    try { F = X && X.F ? X.F() : null; } catch (e) { }
    if (!inRunW() || !F) return 'intro';                 // 반입 화면 · 파티 대기실 · 처음 이야기를 받는 중
    if (!F.introDone) return 'intro';                    // 공통 도입
    const sc = F.sc || {};
    if (COMMON[sc.id]) return 'intro';                   // 둥근 홀 · 멈추기/잇기
    const ch = F.ch;
    return (ch && T[ch]) ? ch : 'intro';
}
function pick() {
    if (off) return null;
    if (inRunW() || partyW() || briefOpenW()) return darkMuted() ? null : wonderTrack();
    let room = '';
    try { room = (typeof window.plazaRoomNow === 'function') ? window.plazaRoomNow() : ''; } catch (e) { }
    if (!room) return null;
    if (room === 'pz_halloween') return 'pzh';
    if (PLAZA_ROOMS[room]) {
        try { if (typeof PLAZA !== 'undefined' && PLAZA.HALLOWEEN === false) return null; } catch (e) { }
        return 'plaza';
    }
    return null;
}

function fade(a, to, ms, done) {
    if (!a) { if (done) done(); return; }
    const from = a.volume, t0 = Date.now();
    const iv = setInterval(function () {
        const k = Math.min(1, (Date.now() - t0) / ms);
        try { a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); } catch (e) { }
        if (k >= 1) { clearInterval(iv); if (done) done(); }
    }, 40);
    return iv;
}
function stopNow(a) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) { } }
function play(key) {
    if (key === cur) {
        if (el && el.paused && key) { try { const p = el.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }
        return;
    }
    const old = el;
    cur = key; el = null;
    if (fadeIv) { clearInterval(fadeIv); fadeIv = null; }
    if (old) fade(old, 0, FADE_MS, function () { stopNow(old); });
    if (!key) return;
    const a = new Audio(T[key]);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    el = a;
    try { const p = a.play(); if (p && p.catch) p.catch(function () { /* 아직 막혀 있다 — 다음 누름 때 */ }); } catch (e) { }
    fadeIv = fade(a, VOL, FADE_MS);
}
function tick() { try { play(pick()); } catch (e) { } }
setInterval(tick, 800);

// 브라우저가 막았다가 풀린 때 — 누를 때마다 한 번 더 청한다
['pointerdown', 'keydown', 'touchend'].forEach(function (t) {
    document.addEventListener(t, function () {
        if (el && cur && el.paused) { try { const p = el.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }
    }, true);
});

// 반입 화면이 이상한 나라 것인가 — openDarkBriefing 을 감싸 구역을 적어 둔다
(function hookBrief() {
    const iv = setInterval(function () {
        if (typeof window.openDarkBriefing !== 'function') return;
        clearInterval(iv);
        const _o = window.openDarkBriefing;
        const w = function (zone) { briefW = (zone === W); return _o.apply(this, arguments); };
        w._evBgm = true;
        window.openDarkBriefing = w;
    }, 120);
})();

window.eventBgmMuted = function () { return off; };
window.eventBgmToggle = function () {
    off = !off;
    try { localStorage.setItem(KEY_OFF, off ? '1' : '0'); } catch (e) { }
    tick();
    return off;
};
window.eventBgmState = function () {
    console.log('[배경 음악] 지금', cur || '없음', '· 꺼 둠', off, '· 이상한 나라', inRunW() || partyW() || briefOpenW(), '· 광장 방', (window.plazaRoomNow && window.plazaRoomNow()) || '-');
    return cur;
};

console.log('[배경 음악] 🎃 이상한 나라 · 할로윈 광장 · 핼러윈 포토존');
})();
