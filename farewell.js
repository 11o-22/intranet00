// ==========================================
// ★ 🎞 인트라넷 1기 마무리 팝업 (2026-11-19 사용자)
// bundles.json 마지막 묶음 맨 끝 — playlist.js · snow.js 보다 뒤
// ==========================================
//
//   사용자가 준 글 여섯 장을 차례로 — [ > ] 로 넘기고, 마지막 장은 [ 닫기 ].
//     1 「지금까지 인트라넷 1기를 즐겨 주셔서 감사합니다. 여러분이 있어서 여기까지 운영할 수 있었습니다.」
//     2 「많은 추억이 있는 장소였고, 여러분 덕분에 울고 웃을 수 있었습니다.」
//     3 「지금까지 고생해 주신 여러분들 덕분에 쌓을 수 있는 추억이었습니다. 다시 한 번 감사합니다.」
//     4 「저희 내담자 여러분들. 상담실은 잠시 휴무 기간을 가지려고 합니다. 늦지 않은 시일 내에 다시 문패를 걸어 둘 예정이니 새로 탄생할 인트라넷을 기대해 주세요.」
//     5 「다시 한 번, 진심으로 즐겨 주셔서 감사합니다. 그리고, 사운드 팀, 디자인 팀 여러분들께도 노고에 진심으로 감사 인사를 올립니다.」
//     6 「p.s 근데 여러분은 2기에서도 굴러 주셔야 해요. ^^  - 상담사 올림 -」
//
// ■ 음악 (음소거와 상관없이 · 플레이리스트 재생기로 튼다 — playlist.js)
//   팝업이 뜨면 Endure 가 쭉 (끝나도 처음부터) → 5 장(「다시 한 번, 진심으로 …」)이 나오면 山君 (쭉) →
//   [ 닫기 ] 를 누르면 Legacy → Legacy 가 끝나면 플레이리스트 곡 전부를 해금 조건 없이 목록 차례대로 (다 돌면 처음부터).
//   기기가 「누르기 전에는 소리를 못 낸다」고 막으면 — 화면을 처음 누르는 순간(팝업 어디든 · [ > ]) 튼다.
//   음악은 위 오른쪽 작은 재생기(플리)로 멈추거나 끌 수 있다.
//
// ■ 누구에게 · 몇 번
//   들어와 있는 모든 사원에게 계정마다 한 번 — [ 닫기 ] 까지 누르면 farewell1/<사번> = 때 (다른 기기에서도 다시 안 뜬다).
//   닫기 전에 창을 닫았으면 다음에 들어올 때 다시 뜬다.
//
// ■ 콘솔
//   farewellShow()     다시 띄워 보기 (본 사람도)
//   farewellState()

(function farewell() {
'use strict';

const NODE = 'farewell1';
const Z = 99999980;                      // 내리는 눈(9999990)보다 위 · 알림창(99999999)보다 아래
const PAGES = [
    '지금까지 인트라넷 1기를 즐겨 주셔서 감사합니다.\n여러분이 있어서 여기까지 운영할 수 있었습니다.',
    '많은 추억이 있는 장소였고,\n여러분 덕분에 울고 웃을 수 있었습니다.',
    '지금까지 고생해 주신 여러분들 덕분에\n쌓을 수 있는 추억이었습니다.\n다시 한 번 감사합니다.',
    '저희 내담자 여러분들.\n상담실은 잠시 휴무 기간을 가지려고 합니다.\n늦지 않은 시일 내에 다시 문패를 걸어 둘 예정이니\n새로 탄생할 인트라넷을 기대해 주세요.',
    '다시 한 번, 진심으로 즐겨 주셔서 감사합니다.\n그리고, 사운드 팀, 디자인 팀 여러분들께도\n노고에 진심으로 감사 인사를 올립니다.',
    'p.s 근데 여러분은 2기에서도 굴러 주셔야 해요. ^^'
];
const SIGN = '- 상담사 올림 -';            // 마지막 장 아래 오른쪽
const SANGUN_AT = 4;                     // 5 장 — 山君
const MUSIC = { first: 'endure', mid: 'sangun' };

function u_() { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function lsKey(c) { return NODE + '_' + c; }
function seenLocal(c) { try { return !!localStorage.getItem(lsKey(c)); } catch (e) { return false; } }
function markSeen(c) {
    try { localStorage.setItem(lsKey(c), String(Date.now())); } catch (e) { }
    const d = db_();
    if (d && c) { try { d.ref(NODE + '/' + c).set(Date.now()); } catch (e) { } }
}

// ── 음악
let want = null;                         // 지금 나와야 할 곡 (팝업이 떠 있는 동안)
function playing() { try { return typeof window.playlistOn === 'function' && !!window.playlistOn(); } catch (e) { return false; } }
function music(k) {
    want = k;
    try { if (typeof window.playlistLoopOne === 'function') window.playlistLoopOne(k); } catch (e) { }
}
// 기기가 막았으면 — 누르는 순간 다시 (누름 안에서 틀어야 소리가 난다)
function nudge() { if (want && !playing()) music(want); }

// ── 창
let OV = null, page = 0;
function css() {
    if (document.getElementById('fw1-css')) return;
    const st = document.createElement('style');
    st.id = 'fw1-css';
    st.textContent = [
        '#fw1-ov{position:fixed;inset:0;z-index:' + Z + ';display:flex;align-items:center;justify-content:center;padding:18px;',
        '  background:radial-gradient(ellipse at 50% 30%, rgba(26,38,64,.88), rgba(4,6,12,.94));font-family:inherit;animation:fw1in .6s ease both;}',
        '@keyframes fw1in{from{opacity:0}to{opacity:1}}',
        '#fw1-card{position:relative;width:min(440px,100%);min-height:280px;box-sizing:border-box;padding:34px 26px 74px;border-radius:18px;',
        '  background:linear-gradient(170deg,#18233a 0%,#0e1526 60%,#0a0f1c 100%);border:1px solid rgba(190,212,240,.35);',
        '  box-shadow:0 18px 50px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.04);color:#eef3fb;overflow:hidden;}',
        '#fw1-card:before{content:"❄";position:absolute;right:18px;top:12px;font-size:16px;color:rgba(210,228,250,.55);}',
        '#fw1-tx{white-space:pre-line;font-size:15.5px;line-height:1.95;letter-spacing:.01em;word-break:keep-all;text-align:center;',
        '  transition:opacity .45s ease, transform .45s ease;}',
        '#fw1-tx.out{opacity:0;transform:translateY(6px);}',
        '#fw1-sign{display:block;text-align:right;margin-top:22px;font-size:14px;color:#c9d8ee;letter-spacing:.04em;}',
        '#fw1-dots{position:absolute;left:26px;bottom:30px;display:flex;gap:7px;}',
        '#fw1-dots i{width:7px;height:7px;border-radius:50%;background:rgba(200,218,242,.25);}',
        '#fw1-dots i.on{background:#e6f0ff;box-shadow:0 0 6px rgba(200,225,255,.8);}',
        '#fw1-next{position:absolute;right:20px;bottom:18px;min-width:46px;height:40px;padding:0 14px;border-radius:999px;cursor:pointer;',
        '  border:1px solid rgba(205,222,245,.6);background:rgba(220,234,252,.08);color:#f1f6ff;font-size:17px;font-weight:bold;font-family:inherit;}',
        '#fw1-next.close{font-size:14px;padding:0 18px;background:rgba(220,234,252,.16);}',
        '#fw1-next:active{transform:scale(.96);}'
    ].join('\n');
    document.head.appendChild(st);
}
function paint(anim) {
    if (!OV) return;
    const tx = OV.querySelector('#fw1-tx'), nx = OV.querySelector('#fw1-next'), dots = OV.querySelector('#fw1-dots');
    const last = page === PAGES.length - 1;
    const fill = function () {
        tx.innerHTML = esc(PAGES[page]) + (last ? '<span id="fw1-sign">' + esc(SIGN) + '</span>' : '');
        tx.classList.remove('out');
    };
    if (anim) { tx.classList.add('out'); setTimeout(fill, 260); } else fill();
    nx.textContent = last ? '닫기' : '>';
    nx.classList.toggle('close', last);
    nx.setAttribute('aria-label', last ? '닫기' : '다음');
    dots.innerHTML = PAGES.map(function (_, i) { return '<i class="' + (i === page ? 'on' : '') + '"></i>'; }).join('');
}
function show(force) {
    if (OV) return;
    css();
    page = 0;
    OV = document.createElement('div');
    OV.id = 'fw1-ov';
    OV.innerHTML = '<div id="fw1-card" role="dialog" aria-modal="true"><div id="fw1-tx"></div><div id="fw1-dots"></div><button id="fw1-next"></button></div>';
    document.body.appendChild(OV);
    // 뒤 화면으로 누름이 새지 않게 · 아무 데나 눌러도 막혔던 음악을 튼다
    ['pointerdown', 'touchstart', 'mousedown'].forEach(function (t) {
        OV.addEventListener(t, function (e) { e.stopPropagation(); nudge(); }, { passive: true });
    });
    OV.addEventListener('click', function (e) { e.stopPropagation(); });
    OV.querySelector('#fw1-next').addEventListener('click', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (page >= PAGES.length - 1) { close(); return; }
        page++;
        if (page === SANGUN_AT) music(MUSIC.mid);                 // 「다시 한 번, 진심으로 …」 — 山君
        else nudge();
        paint(true);
    });
    paint(false);
    music(MUSIC.first);                                          // 뜨는 순간부터 Endure
}
function close() {
    if (!OV) return;
    const u = u_();
    if (u && u.code) markSeen(u.code);
    want = null;
    const el = OV; OV = null;
    el.style.transition = 'opacity .4s ease'; el.style.opacity = '0';
    setTimeout(function () { el.remove(); }, 420);
    try { if (typeof window.playlistFarewell === 'function') window.playlistFarewell(); } catch (e) { }   // Legacy → 전체 곡 차례대로
}

// ── 들어온 사원에게 한 번
let checked = null, readyAt = 0;
setInterval(function () {
    const u = u_();
    if (!u || !u.code || OV || !document.body) { readyAt = 0; return; }
    if (checked === u.code) return;
    if (!readyAt) { readyAt = Date.now(); return; }
    if (Date.now() - readyAt < 1500) return;                     // 들어온 화면이 다 그려진 뒤
    checked = u.code;
    if (seenLocal(u.code)) return;
    const d = db_();
    if (!d) { show(false); return; }
    d.ref(NODE + '/' + u.code).once('value').then(function (s) {
        if (s && s.exists()) { try { localStorage.setItem(lsKey(u.code), String(s.val())); } catch (e) { } return; }
        const now = u_();
        if (now && now.code === u.code) show(false);
    }).catch(function () { show(false); });
}, 700);

window.farewellShow = function () { show(true); };
window.farewellState = function () {
    const u = u_();
    const o = { 떠있음: !!OV, 장: page + 1, 나와야할곡: want, 재생중: playing(), 이기기에서본것: u ? seenLocal(u.code) : null };
    console.log(o);
    return o;
};
console.log('[🎞 1기 마무리] farewellShow()');
})();
