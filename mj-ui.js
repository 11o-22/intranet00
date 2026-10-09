// ==========================================
// ★ 🀄 마작 — 마작판 화면 · 상담실/선녀탕 붙이기 · 정산
// bundles.json 마지막 묶음, mj-tiles.js · mj-play.js · plea.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 어디에 뜨나
//
//   여우 상담실·선녀탕에 들어가면 안내 칸(#quarantine-lock-box)에
//   탄원서가 붙는다. 그 **바로 밑**에 마작 단추를 붙인다.
//   들어가자마자 끌려가는 것이 아니라, 누르면 그때 자리를 고른다.
//
// ■ 화면
//
//   예전에는 글자 목록이었다. 「내 패: 🀇🀈🀉…」 하는 식이라
//   누구 차례인지, 누가 무얼 버렸는지 한눈에 안 들어왔다.
//   이제 **마작판**으로 그린다.
//
//       ┌───────────────────────────┐
//       │        건너편 — 엎은 패      │
//       │        이름 25000 南        │
//       │          버린 패             │
//       │ ┌──┐   ╔═══════╗   ┌──┐ │
//       │ │왼│   ║ 동1국  ║   │오│ │
//       │ │쪽│   ║ 42장   ║   │른│ │
//       │ │  │   ║ 도라 🀙 ║   │쪽│ │
//       │ └──┘   ╚═══════╝   └──┘ │
//       │          내가 버린 패        │
//       ├───────────────────────────┤
//       │ 후로        내 손패      가져온 │
//       │        [쯔모] [리치]          │
//       └───────────────────────────┘
//
//   · 자리는 **내 자리를 늘 아래**에 두고 돌린다.
//     두 사람이면 건너편 하나, 세 사람이면 왼쪽·오른쪽,
//     네 사람이면 오른쪽·건너편·왼쪽이다. (차례는 오른쪽으로 돈다)
//   · 옆자리의 버린 패는 **눕혀서** 가운데를 보게 둔다.
//   · 패는 글자가 아니라 그림이다. (mj-tiles.js)
//   · 내 손패는 **정렬해서** 보여 주고, 방금 가져온 패만 따로 떼어 둔다.
//
//   창은 꽉 찬 화면으로 띄우고, 벽지(skin.js)가 손대지 않도록
//   .modal-overlay 를 쓰지 않는다. 마작판은 늘 같은 초록이다.
//
// ■ 끝나면
//
//   동풍전이 끝나면 1위의 격리가 풀린다. (탄원이 받아들여졌을 때와 같은 손질 —
//   plea.js:242 과 맞춰 두었다)
//   그리고 각자 **최종 점수 − 시작 점수**만큼 포인트를 주고받는다.
//   이긴 만큼 받고 진 만큼 깎인다. 0 밑으로는 안 내려간다.
//   (MJ_PLAY.payout 을 'none' 으로 두면 포인트는 안 움직인다)
//
//   정산은 **각자 제 자리에만** 쓴다. 한 사람이 남의 포인트를 건드리지 않는다.
//   이미 받았는지는 판에 적어 두고 본다 (paid).
//
// ■ 콘솔
//   mjOpen()        자리 고르는 창을 연다
//   mjClose()       닫는다
//   mjTileShow()    패 그림을 늘어놓고 본다

(function mjUI() {

const BTN = 'mj-enter-btn';
const OV = 'mj-overlay';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
// 파이어베이스가 지운 빈 칸 — 없어도 그냥 빈 것으로 본다
function bag(o, k) { return (o && typeof o === 'object' && o[k]) ? o[k] : null; }
function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function inside() {
    return typeof isQuarantined === 'function' && me() && isQuarantined(me());
}
function bath() { return typeof isBathUser === 'function' && isBathUser(me()); }
function hue() { return bath() ? '#7fd4d4' : '#d4af37'; }

// 패 그림 — mj-tiles.js 가 없으면 글자로 떨어진다
function T(t, size, extra) {
    if (typeof window.mjTileHTML === 'function') return window.mjTileHTML(t, size, extra);
    return '<span style="font-size:20px;">' + (window.mjTileGlyph ? window.mjTileGlyph(t) : '🀫') + '</span>';
}
function B(size, extra) {
    if (typeof window.mjBackHTML === 'function') return window.mjBackHTML(size, extra);
    return '<span style="font-size:20px;">🀫</span>';
}
const WINDS = ['東', '南', '西', '北'];
function windOf(seat, kyoku, n) {
    return WINDS[((seat - (kyoku - 1)) % n + n) % n];
}

// ==========================================
// 탄원서 밑의 단추
// ==========================================
let openCount = 0;
let lastBtn = '';
function paintBtn() {
    const lock = document.getElementById('quarantine-lock-box');
    const old = document.getElementById(BTN);
    if (!lock || !inside()) { if (old) old.remove(); lastBtn = ''; return; }

    const c = hue();
    const seated = window.mjCur && window.mjCur();
    const label = seated ? '🀄 마작 — 판으로 돌아가기'
        : ('🀄 마작' + (openCount ? ' <span style="font-size:10px; color:#ffd76a;">(열린 자리 ' + openCount + ')</span>' : ''));

    const html = '<div id="' + BTN + '" style="border-top:1px dashed ' + c + '55; margin-top:14px; padding-top:13px; text-align:left;">'
        + '<div style="font-size:12px; color:' + c + '; font-weight:bold; margin-bottom:6px;">마작</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.7;">'
        + '갇힌 사람끼리 한 판 둡니다. 동풍전이 끝나면 <b style="color:' + c + ';">1위는 바로 나갑니다.</b><br>'
        + '점수만큼 포인트를 주고받습니다.'
        + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;'
        + ' background:linear-gradient(145deg,' + (bath() ? '#2a4a5a,#152830' : '#5a4a2a,#3a2f18') + ') !important;'
        + ' border-color:' + c + ' !important; color:' + c + ' !important;" onclick="mjOpen()">' + label + '</button>'
        + '</div>';

    const plea = document.getElementById('plea-box');
    // 탄원서가 다시 그려지면 우리 칸이 위로 올라가 있을 수 있다 — 그때는 다시 붙인다
    const misplaced = old && plea && plea.nextElementSibling !== old;
    if (old && !misplaced) {
        if (lastBtn === html) return;                 // 안 바뀌었으면 손대지 않는다
        old.outerHTML = html;
    } else {
        if (old) old.remove();
        if (plea) plea.insertAdjacentHTML('afterend', html);     // 탄원서 바로 밑
        else lock.insertAdjacentHTML('beforeend', html);
    }
    lastBtn = html;
}

// 격리 칸은 updateUI 가 다시 그린다 — 그때마다 도로 붙인다
setInterval(function () { try { paintBtn(); } catch (e) { } }, 900);
setInterval(function () {
    if (!inside() || !window.mjListTables) return;
    window.mjListTables().then(function (l) {
        const n = l.filter(function (t) { return t.state === 'WAIT'; }).length;
        if (n !== openCount) { openCount = n; paintBtn(); }
    }).catch(function () { });
}, 6000);

// ==========================================
// 판 차림새
// ==========================================
function ui() {
    if (document.getElementById('mj-ui-css')) return;
    const st = document.createElement('style');
    st.id = 'mj-ui-css';
    st.textContent = `
#mj-overlay {
    position:fixed; inset:0; z-index:9999998; display:none; flex-direction:column;
    font-family:system-ui,-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;
    color:#e9e4d8; -webkit-tap-highlight-color:transparent; overscroll-behavior:contain;
    padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom);
}
#mj-overlay.mj-is-table {
    background:radial-gradient(ellipse 130% 85% at 50% 40%, #1e6447 0%, #114029 55%, #072014 100%);
}
#mj-overlay.mj-is-card {
    background:rgba(5,18,12,0.93); align-items:center; justify-content:center; padding:16px;
}
#mj-overlay.mj-is-table > #mj-root { flex:1; display:flex; flex-direction:column; min-height:0; }
#mj-overlay.mj-is-card > #mj-root {
    width:100%; max-width:420px; max-height:86vh; overflow:auto; text-align:left;
    background:linear-gradient(180deg,#17251e,#101a15); border:1px solid #2f6b4e;
    border-radius:11px; padding:17px; box-shadow:0 10px 40px rgba(0,0,0,0.6);
}

/* --- 머리띠 --- */
#mj-bar {
    flex:none; height:36px; display:flex; align-items:center; gap:9px; padding:0 10px;
    background:rgba(0,0,0,0.34); border-bottom:1px solid rgba(255,255,255,0.08);
    font-size:11px; color:#cfc9b8;
}
#mj-bar .mj-kyoku { color:#ffd76a; font-weight:700; font-size:12px; }
#mj-bar .mj-x {
    margin-left:auto; background:none; border:1px solid rgba(255,255,255,0.22); color:#cfc9b8;
    width:26px; height:24px; border-radius:5px; font-size:13px; line-height:1; cursor:pointer; padding:0;
}

/* --- 판 --- */
#mj-felt { flex:1; position:relative; min-height:0; overflow:hidden; }

.mj-blk { position:absolute; display:flex; flex-direction:column; align-items:center; gap:3px; }
/* 키 큰 화면에서 위아래가 멀어지지 않게 가운데 쪽으로 당긴다.
   좁은 화면에서는 max() 가 가장자리로 되돌려 준다. */
.mj-blk-top { top:max(4px, calc(50% - 212px)); left:50%; transform:translateX(-50%); }
.mj-blk-me  { bottom:max(30px, calc(50% - 150px)); left:50%; transform:translateX(-50%); }

/* 옆자리 — 눕혀서 가운데를 보게 한다.
   바깥은 자리만 잡고(너비 0), 안쪽을 돌린다. 그래야 돌린 뒤의 크기를
   셈하지 않아도 된다. transform-origin 을 모서리에 두고 가운데로 당긴다. */
.mj-side { position:absolute; top:50%; width:0; height:0; }
.mj-side-left  { left:72px; }
.mj-side-right { right:72px; }
.mj-rot { position:absolute; left:0; top:0; width:max-content; transform-origin:0 0; }
.mj-side-left  .mj-rot { transform:rotate(-90deg) translate(-50%,-50%); }
.mj-side-right .mj-rot { transform:rotate(90deg) translate(-50%,-50%); }
.mj-side .mj-blk { position:static; transform:none; }

/* --- 이름표 --- */
.mj-plate {
    display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:11px;
    background:rgba(0,0,0,0.42); border:1px solid rgba(255,255,255,0.12);
    font-size:10px; white-space:nowrap; max-width:170px;
}
.mj-plate.mj-turn { background:rgba(255,215,106,0.17); border-color:#ffd76a; box-shadow:0 0 10px rgba(255,215,106,0.3); }
.mj-plate .mj-nm { color:#eee; font-weight:700; overflow:hidden; text-overflow:ellipsis; max-width:70px; }
.mj-plate .mj-sc { color:#fff; font-variant-numeric:tabular-nums; }
.mj-plate .mj-wd {
    width:15px; height:15px; border-radius:50%; display:inline-flex; align-items:center;
    justify-content:center; font-size:9px; font-weight:700; background:#0d3324; color:#8fe0b4;
    border:1px solid #2f7d5c; flex:none;
}
.mj-plate.mj-turn .mj-wd { background:#5a4512; color:#ffd76a; border-color:#ffd76a; }
.mj-plate .mj-ri { color:#ff8a65; font-weight:700; }

/* 이름표는 눕히지 않는다 — 아래에 한 줄로 세워 둔다 (왼쪽 · 나 · 오른쪽) */
.mj-plates {
    position:absolute; left:4px; right:4px; bottom:4px; z-index:3;
    display:flex; align-items:center; justify-content:space-between; gap:5px;
}
.mj-plates.mj-one { justify-content:center; }
.mj-plates .mj-plate { flex:0 1 auto; min-width:0; }
.mj-plates .mj-plate-side { font-size:9px; padding:3px 6px; }
.mj-plates .mj-plate-side .mj-nm { max-width:40px; }
.mj-plate .mj-cnt { color:#8aa89a; }

/* --- 엎은 패 줄 --- */
.mj-backs { display:flex; }
.mj-backs .mjt { margin-right:-5px; }
.mj-backs .mjt:last-child { margin-right:0; }

/* --- 버린 패 --- */
.mj-pond { display:grid; grid-template-columns:repeat(6, auto); gap:2px; justify-content:center; }
.mj-pond-me { grid-template-columns:repeat(8, auto); }
.mj-melds { display:flex; gap:7px; flex-wrap:wrap; justify-content:center; }
.mj-meld { display:flex; gap:1px; }

/* --- 가운데 --- */
#mj-mid {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    background:rgba(0,0,0,0.46); border:1px solid rgba(255,255,255,0.14); border-radius:9px;
    padding:7px 9px; text-align:center; min-width:104px; max-width:160px;
    box-shadow:inset 0 0 22px rgba(0,0,0,0.5);
}
#mj-mid .mj-r1 { font-size:13px; font-weight:700; color:#ffd76a; letter-spacing:0.02em; }
#mj-mid .mj-r2 { font-size:10px; color:#9fbfae; margin-top:2px; }
#mj-mid .mj-dora { display:flex; gap:2px; justify-content:center; margin-top:5px; }
#mj-mid .mj-r3 { font-size:9px; color:#8aa89a; margin-top:4px; line-height:1.5; }

/* --- 내 자리 --- */
#mj-mine {
    flex:none; background:rgba(0,0,0,0.33); border-top:1px solid rgba(255,255,255,0.09);
    padding:7px 7px 9px;
}
#mj-hand { display:flex; justify-content:center; align-items:flex-end; gap:2px; flex-wrap:nowrap; }
/* 손패는 열넉 장이 한 줄에 들어가야 한다 — 화면 너비에 맞춰 줄인다 */
#mj-hand .mjt { width:clamp(19px, calc((100vw - 34px) / 14.7), 34px); height:auto; aspect-ratio:36/48; }
#mj-hand .mj-h {
    background:none; border:0; padding:0; margin:0; cursor:pointer; line-height:0;
    transition:transform 0.08s;
}
#mj-hand .mj-h:disabled { cursor:default; opacity:0.62; }
#mj-hand .mj-h:not(:disabled):active { transform:translateY(-6px); }
#mj-hand .mj-gap { width:11px; flex:none; }
#mj-hint { text-align:center; font-size:10px; color:#8aa89a; margin-top:5px; min-height:12px; }
#mj-acts { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-top:7px; }
#mj-acts button {
    margin:0; padding:9px 13px; font-size:12px; font-weight:700; border-radius:7px; cursor:pointer;
    background:linear-gradient(180deg,#2b3a32,#16221c); border:1px solid #4a5a50; color:#dfe8e2;
    font-family:inherit;
}
#mj-acts button.mj-go { background:linear-gradient(180deg,#2e7d4f,#17502f); border-color:#5fd49a; color:#eafff3; }
#mj-acts button.mj-cl { background:linear-gradient(180deg,#2a4a6a,#15283c); border-color:#7fb6e8; color:#e4f1ff; }
#mj-acts button.mj-ri { background:linear-gradient(180deg,#7a3a1e,#43200e); border-color:#ff8a65; color:#ffe6dc; }
#mj-acts button.mj-no { background:linear-gradient(180deg,#2a2a2a,#171717); border-color:#555; color:#bbb; }
#mj-acts button .mj-sub { display:block; font-size:9px; font-weight:400; opacity:0.85; margin-top:1px; }

/* --- 글 칸 --- */
.mj-h2 { font-size:15px; font-weight:700; margin-bottom:5px; }
.mj-note { font-size:10px; color:#8aa89a; line-height:1.75; }
.mj-row {
    display:flex; justify-content:space-between; align-items:center; gap:8px;
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    border-radius:6px; padding:9px 11px; margin-bottom:6px;
}
.mj-btn {
    margin:0; padding:9px 13px; font-size:11px; font-weight:700; border-radius:6px; cursor:pointer;
    background:linear-gradient(180deg,#2b3a32,#16221c); border:1px solid #4a5a50; color:#dfe8e2;
    font-family:inherit;
}
`;
    document.head.appendChild(st);
}

function shell(inner, tableMode) {
    ui();
    if (typeof window.mjTileSheet === 'function') window.mjTileSheet();
    let el = document.getElementById(OV);
    if (!el) {
        document.body.insertAdjacentHTML('beforeend', '<div id="' + OV + '"><div id="mj-root"></div></div>');
        el = document.getElementById(OV);
    }
    el.className = tableMode ? 'mj-is-table' : 'mj-is-card';
    document.getElementById('mj-root').innerHTML = inner;
    el.style.display = 'flex';
}
window.mjClose = function () {
    const el = document.getElementById(OV);
    if (el) el.style.display = 'none';
};
window.mjOpen = function () {
    // 앉아 있던 판은 격리가 풀린 뒤에도 연다 — 1위는 끝나자마자 풀리기 때문이다
    const seated = window.mjCur && window.mjCur();
    if (seated && seated.t) { safePaint(seated.t); return; }
    if (!inside()) { showCustomAlert('상담실·선녀탕 안에서만 둘 수 있습니다.'); return; }
    lobby();
};

// 로비가 떠 있는 동안 5초마다 목록을 새로 받는다.
// 안 그러면 남이 치운 자리를 그대로 들고 있다가 「그 자리가 없어졌습니다」가 뜬다.
let atLobby = false;
setInterval(function () {
    try {
        if (!atLobby) return;
        const el = document.getElementById(OV);
        if (!el || el.style.display === 'none') { atLobby = false; return; }
        const s = window.mjCur && window.mjCur();
        if (s && s.t) { atLobby = false; return; }
        lobby(true);
    } catch (e) { }
}, 5000);

function lobby(quiet) {
    atLobby = true;
    if (!quiet) shell('<div style="text-align:center; padding:20px; color:#8aa89a; font-size:12px;">자리를 찾는 중…</div>');
    window.mjListTables().then(function (list) {
        if (!atLobby) return;
        const c = hue();
        const open = list.filter(function (t) { return t.state === 'WAIT'; });
        let h = '<div class="mj-h2" style="color:' + c + ';">🀄 마작</div>'
            + '<div class="mj-note" style="margin-bottom:14px;">'
            + '동풍전 — 사람 수만큼 국을 돕니다. 끝나면 1위가 나갑니다.<br>'
            + '2·3인은 북과 만수 2~8 을 빼고 치(吃)가 없습니다.</div>';

        h += '<div style="font-size:11px; color:#9fbfae; margin-bottom:6px;">열린 자리</div>';
        if (!open.length) h += '<div style="font-size:11px; color:#6a8275; padding:10px 0;">아직 없습니다. 아래에서 만드세요.</div>';
        open.forEach(function (t) {
            const n = arr(t.seats).length;
            h += '<div class="mj-row"><div style="flex:1; min-width:0;">'
                + '<div style="font-size:12px; color:#fff; font-weight:bold;">' + t.players + '인 · ' + n + '/' + t.players + '</div>'
                + '<div style="font-size:9px; color:#8aa89a; margin-top:3px;">'
                + arr(t.seats).map(function (s) { return esc(s.name); }).join(', ') + '</div></div>'
                + '<button class="mj-btn" onclick="mjJoinUI(\'' + t.id + '\')">앉는다</button></div>';
        });

        h += '<div style="font-size:11px; color:#9fbfae; margin:14px 0 6px 0;">새 자리</div>'
            + '<div style="display:flex; gap:6px;">'
            + [2, 3, 4].map(function (n) {
                return '<button class="mj-btn" style="flex:1; padding:11px;" onclick="mjMakeUI('
                    + n + ')">' + n + '인</button>';
            }).join('')
            + '</div>'
            + '<button class="mj-btn" style="width:100%; margin-top:14px;" onclick="mjClose()">닫는다</button>';
        shell(h);
    });
}

// 왜 안 되는지 말해 준다 — 말없이 떨어지면 「눌러도 아무 일이 없다」로 보인다
function whine(e, what) {
    const msg = (e && (e.message || e.code)) ? String(e.message || e.code) : '알 수 없는 까닭';
    console.error('[마작] ' + what, e);
    window._mjLastError = msg;
    const perm = /permission|denied/i.test(msg);
    showCustomAlert(what + '\n\n' + msg
        + (perm ? '\n\n데이터베이스 규칙이 mjTables 쓰기를 막고 있습니다.\n상담사에게 알려 주세요.' : ''));
}

// 앉은 판이 손에 들어올 때까지 기다렸다가 그린다.
// mjOnChange 하나만 믿지 않는다 — 그 길이 막히면 화면이 로비인 채로 남는다.
// 그리다 터져도 빈 화면으로 두지 않는다 — 까닭을 창에 적는다
function safePaint(t) {
    atLobby = false;
    try { paint(t); return true; }
    catch (e) {
        window._mjLastError = String((e && e.message) || e);
        console.error('[마작] 판을 그리다 터졌습니다', e);
        shell('<div class="mj-h2" style="color:#ff8a80;">🀄 판을 그리지 못했습니다</div>'
            + '<div class="mj-note" style="margin-bottom:12px;">' + esc(window._mjLastError) + '</div>'
            + '<div style="display:flex; gap:6px;">'
            + '<button class="mj-btn" style="flex:1;" onclick="mjLeaveUI()">자리를 뜬다</button>'
            + '<button class="mj-btn" style="flex:1;" onclick="mjClose()">닫는다</button></div>');
        return false;
    }
}

function waitAndPaint(what, tries) {
    tries = tries || 0;
    const s = window.mjCur && window.mjCur();
    if (s && s.t) { safePaint(s.t); return; }
    if (tries >= 30) {                                   // 3초
        showCustomAlert(what + '\n\n판을 불러오지 못했습니다. 다시 한 번 눌러 주세요.'
            + (window._mjLastError ? '\n\n(' + window._mjLastError + ')' : ''));
        lobby(); return;
    }
    setTimeout(function () { waitAndPaint(what, tries + 1); }, 100);
}

function busy(msg) {
    atLobby = false;
    shell('<div style="text-align:center; padding:26px 10px; color:#9fbfae; font-size:12px;">' + esc(msg) + '…</div>');
}

window.mjMakeUI = function (n) {
    busy('자리를 만드는 중');
    try {
        const p = window.mjMake(n);
        if (!p || typeof p.then !== 'function') { waitAndPaint('자리를 만들었습니다.'); return; }
        p.then(function (id) {
            if (!id) { showCustomAlert('자리를 만들지 못했습니다.\n\n잠시 뒤에 다시 해 주세요.'); lobby(); return; }
            waitAndPaint('자리를 만들었습니다.');
        }).catch(function (e) { whine(e, '자리를 만들지 못했습니다.'); lobby(); });
    } catch (e) { whine(e, '자리를 만들지 못했습니다.'); lobby(); }
};
window.mjJoinUI = function (id) {
    busy('앉는 중');
    try {
        window.mjJoin(id).then(function (ok) {
            if (!ok) {
                showCustomAlert(window._mjJoinWhy || '그 자리에는 앉을 수 없습니다.\n\n잠시 뒤에 다시 해 주세요.');
                lobby(); return;
            }
            waitAndPaint('앉았습니다.');
        }).catch(function (e) { whine(e, '자리에 앉지 못했습니다.'); lobby(); });
    } catch (e) { whine(e, '자리에 앉지 못했습니다.'); lobby(); }
};

// ==========================================
// 마작판
// ==========================================
// 내 자리를 늘 아래에 두고 돌린다. 차례는 오른쪽으로 돈다.
const SPOTS = {
    2: { 1: 'top' },
    3: { 1: 'right', 2: 'left' },
    4: { 1: 'right', 2: 'top', 3: 'left' }
};

function plate(x, score, wind, turn, riichi, where, cnt) {
    const cls = where === 'me' ? ' mj-plate-mine' : where ? ' mj-plate-side mj-' + where : '';
    return '<div class="mj-plate' + (turn ? ' mj-turn' : '') + cls + '">'
        + '<span class="mj-wd">' + wind + '</span>'
        + '<span class="mj-nm">' + esc(x.name) + '</span>'
        + '<span class="mj-sc">' + (Number(score) || 0).toLocaleString() + '</span>'
        + (cnt ? '<span class="mj-cnt">🀫' + cnt + '</span>' : '')
        + (riichi ? '<span class="mj-ri">리치</span>' : '')
        + '</div>';
}

function pondHTML(list, hotIdx, mine) {
    if (!list.length) return '';
    return '<div class="mj-pond' + (mine ? ' mj-pond-me' : '') + '">'
        + list.map(function (t, i) { return T(t, 's', i === hotIdx ? 'mjt-hot' : ''); }).join('')
        + '</div>';
}
function meldsHTML(melds, size) {
    if (!melds.length) return '';
    return '<div class="mj-melds">' + melds.map(function (m) {
        const tiles = arr(m.tiles);
        const hidden = (m.type === 'ankan');
        return '<div class="mj-meld">' + tiles.map(function (t, i) {
            if (hidden && (i === 0 || i === 3)) return B(size);
            return T(t, size);
        }).join('') + '</div>';
    }).join('') + '</div>';
}

function midHTML(t, h, mySeat, n) {
    const di = arr(h.doraInd);
    const left = arr(h.wall).length;
    return '<div id="mj-mid">'
        + '<div class="mj-r1">동 ' + t.kyoku + '국</div>'
        + '<div class="mj-r2">' + ((t.honba || 0) ? t.honba + '본장 · ' : '') + left + '장 남음</div>'
        + (di.length ? '<div class="mj-dora">' + di.map(function (x) {
            return T(window.mjDoraOf(x), 's');
        }).join('') + '</div>' : '')
        + '<div class="mj-r3">내 자풍 <b style="color:#ffd76a;">'
        + windOf(mySeat, t.kyoku, n) + '</b>'
        + ((t.sticks || 0) ? ' · 리치봉 ' + t.sticks : '') + '</div>'
        + '</div>';
}

function otherHTML(t, h, x, i, spot, n) {
    const turn = (h.turn === i);
    const ri = !!(h.riichi && h.riichi[x.code]);
    const score = (t.scores || {})[x.code] || 0;
    const wind = windOf(i, t.kyoku, n);
    const cnt = arr(bag(h.hands, x.code)).length;
    const melds = arr(bag(h.melds, x.code));
    const pond = arr(bag(h.pond, x.code));
    const hot = (h.last && h.last.by === i) ? pond.length - 1 : -1;

    let backs = '';
    for (let k = 0; k < cnt; k++) backs += B('s');

    if (spot === 'top') {
        return {
            felt: '<div class="mj-blk mj-blk-top">'
                + '<div class="mj-backs">' + backs + '</div>'
                + plate(x, score, wind, turn, ri, '', cnt)
                + meldsHTML(melds, 's')
                + pondHTML(pond, hot)
                + '</div>',
            plate: ''
        };
    }
    // 옆자리 — 패는 눕히고, 이름표는 아래 줄에 바로 세워 따로 돌려준다
    return {
        felt: '<div class="mj-side mj-side-' + spot + '"><div class="mj-rot"><div class="mj-blk">'
            + meldsHTML(melds, 's')
            + pondHTML(pond, hot)
            + '</div></div></div>',
        plate: plate(x, score, wind, turn, ri, (spot === 'left') ? 'l' : 'r')
    };
}

function paintWait(t) {
    const c = hue();
    const seats = arr(t.seats);
    let o = '<div class="mj-h2" style="color:' + c + ';">🀄 자리를 맞추는 중</div>'
        + '<div class="mj-note" style="margin-bottom:12px;">'
        + seats.length + ' / ' + t.players + ' — 사람을 기다립니다.</div>';
    seats.forEach(function (x) {
        o += '<div class="mj-row"><span style="font-size:12px; color:#fff;">' + esc(x.name) + '</span>'
            + '<span style="font-size:10px; color:#8aa89a;">앉음</span></div>';
    });
    for (let k = seats.length; k < t.players; k++) {
        o += '<div class="mj-row" style="opacity:0.45;"><span style="font-size:12px;">빈 자리</span>'
            + '<span style="font-size:10px; color:#8aa89a;">기다리는 중</span></div>';
    }
    o += '<div style="display:flex; gap:6px; margin-top:12px;">'
        + '<button class="mj-btn" style="flex:1;" onclick="mjLeaveUI()">나간다</button>'
        + '<button class="mj-btn" style="flex:1;" onclick="mjClose()">닫는다</button></div>';
    shell(o);
}

function paint(t) {
    if (!t) { lobby(); return; }
    const u = me(); if (!u) return;
    if (t.state === 'DONE') { paintEnd(t); return; }

    const s = window.mjMy();
    if (!s) return;
    const h = s.h;
    if (t.state === 'WAIT' || !h) { paintWait(t); return; }

    const seats = arr(t.seats);
    const n = t.players;
    const mySeat = s.seat;
    const spot = SPOTS[n] || SPOTS[4];

    // --- 판 위 ---
    let felt = midHTML(t, h, mySeat, n);
    let lp = '', rp = '';
    seats.forEach(function (x, i) {
        if (i === mySeat) return;
        const rel = ((i - mySeat) % n + n) % n;
        if (!spot[rel]) return;
        const got = otherHTML(t, h, x, i, spot[rel], n);
        felt += got.felt;
        if (spot[rel] === 'left') lp = got.plate;
        if (spot[rel] === 'right') rp = got.plate;
    });

    // --- 내 버린 패 ---
    const myPond = arr(bag(h.pond, u.code));
    const myHot = (h.last && h.last.by === mySeat) ? myPond.length - 1 : -1;
    felt += '<div class="mj-blk mj-blk-me">' + pondHTML(myPond, myHot, true) + '</div>';

    // --- 아래 이름표 줄 (왼쪽 · 나 · 오른쪽) ---
    const myPlate = plate({ name: u.name }, (t.scores || {})[u.code] || 0,
        windOf(mySeat, t.kyoku, n), h.turn === mySeat, s.riichi);
    felt += '<div class="mj-plates' + ((lp || rp) ? '' : ' mj-one') + '">'
        + lp + myPlate + rp + '</div>';

    // --- 머리띠 ---
    const bar = '<div id="mj-bar">'
        + '<span class="mj-kyoku">동 ' + t.kyoku + '국</span>'
        + '<span>' + n + '인</span>'
        + '<span>남은 ' + arr(h.wall).length + '장</span>'
        + (window._mjRiichiArm ? '<span style="color:#ff8a65;">리치 — 버릴 패를 누르세요</span>' : '')
        + '<button class="mj-x" onclick="mjClose()">✕</button></div>';

    shell(bar + '<div id="mj-felt">' + felt + '</div>' + mineHTML(t, h, s, u), true);
}

// ==========================================
// 내 손패와 단추
// ==========================================
function mineHTML(t, h, s, u) {
    const canDiscard = s.mine && s.phase === 'DISCARD';

    // 방금 가져온 패는 따로 떼어 두고, 나머지는 정렬해서 본다
    let hand = s.hand.slice();
    let drawn = null;
    if (h.drawn != null && hand.length && hand[hand.length - 1] === h.drawn
        && s.mine && s.phase === 'DISCARD') {
        drawn = hand.pop();
    }
    hand.sort(function (a, b) { return a - b; });

    let o = '<div id="mj-mine">';
    const melds = meldsHTML(s.melds, 'm');
    if (melds) o += '<div style="margin-bottom:6px;">' + melds + '</div>';

    o += '<div id="mj-hand">';
    hand.forEach(function (tile) {
        o += '<button class="mj-h"' + (canDiscard ? '' : ' disabled')
            + (canDiscard ? ' onclick="mjDiscardUI(' + tile + ')"' : '')
            + '>' + T(tile, 'l') + '</button>';
    });
    if (drawn != null) {
        o += '<span class="mj-gap"></span>'
            + '<button class="mj-h"' + (canDiscard ? '' : ' disabled')
            + (canDiscard ? ' onclick="mjDiscardUI(' + drawn + ')"' : '')
            + '>' + T(drawn, 'l', 'mjt-new') + '</button>';
    }
    o += '</div>';

    // 샨텐
    const all = drawn != null ? hand.concat([drawn]) : hand;
    const sh = window.mjShanten(all, s.melds.length);
    const w = window.mjWaits(all, s.melds.length);
    o += '<div id="mj-hint">'
        + (sh < 0 ? '<span style="color:#7fe0a0; font-weight:700;">화료</span>'
            : sh === 0 ? ('<span style="color:#ffd76a; font-weight:700;">텐파이</span> '
                + '<span style="display:inline-flex; gap:2px; vertical-align:middle; margin-left:3px;">'
                + w.map(function (x) { return T(x, 's'); }).join('') + '</span>')
            : (sh + '샨텐'))
        + '</div>';

    // 단추
    const acts = [];
    if (s.mine && s.phase === 'DRAW') acts.push(['패를 가져온다', 'mjDraw()', 'mj-go', '']);
    if (s.mine && s.phase === 'DISCARD') {
        const r = window.mjScore(window.mjWinArgs(t, h, u.code, h.drawn, true));
        if (h.drawn != null && r && r.ok) {
            acts.push(['쯔모', 'mjTsumoUI()', 'mj-go', r.han + '판 ' + (r.name || r.points)]);
        }
        if (!s.riichi && !s.melds.length) {
            const can = s.hand.some(function (x) {
                const a = s.hand.slice(); a.splice(a.indexOf(x), 1);
                return window.mjShanten(a, 0) === 0;
            });
            if (can && ((t.scores || {})[u.code] || 0) >= 1000) {
                acts.push([window._mjRiichiArm ? '리치 취소' : '리치',
                    window._mjRiichiArm ? 'mjRiichiArm(0)' : 'mjRiichiArm()', 'mj-ri',
                    window._mjRiichiArm ? '' : '버릴 패를 고릅니다']);
            }
        }
    }
    const cl = window.mjCanClaim();
    if (cl) {
        if (cl.ron) acts.push(['론', 'mjRonUI()', 'mj-go', cl.ron.han + '판 ' + (cl.ron.name || cl.ron.points)]);
        if (cl.kan) acts.push(['깡', "mjClaim('kan')", 'mj-cl', '']);
        if (cl.pon) acts.push(['폰', "mjClaim('pon')", 'mj-cl', '']);
        if (cl.chi) cl.chi.forEach(function (p, i) {
            acts.push(['치', 'mjChiUI(' + i + ')', 'mj-cl',
                window.mjTileName(p[0]) + ' ' + window.mjTileName(p[1])]);
        });
        acts.push(['넘긴다', 'mjPass()', 'mj-no', '']);
    }
    if (t.last) acts.push(['지난 국', 'mjLastUI()', 'mj-no', '']);
    acts.push(['자리를 뜬다', 'mjLeaveUI()', 'mj-no', '']);

    o += '<div id="mj-acts">' + acts.map(function (a) {
        return '<button class="' + a[2] + '" onclick="' + a[1] + '">' + a[0]
            + (a[3] ? '<span class="mj-sub">' + esc(a[3]) + '</span>' : '') + '</button>';
    }).join('') + '</div>';

    o += '</div>';
    return o;
}

// 지난 국 — 자리를 많이 먹으므로 눌러서 본다
window.mjLastUI = function () {
    const s = window.mjCur && window.mjCur();
    const t = s && s.t;
    const L = t && t.last;
    if (!L) { showCustomAlert('지난 국이 없습니다.'); return; }
    if (L.kind === 'draw') {
        showCustomAlert('지난 국 — 유국.\n\n텐파이 ' + ((L.ten || []).length) + '명');
        return;
    }
    const name = (arr(t.seats).filter(function (x) { return x.code === L.winner; })[0] || {}).name || '?';
    showCustomAlert('지난 국 — ' + name + ' ' + (L.loser ? '론' : '쯔모') + '\n\n'
        + L.han + '판 ' + L.fu + '부 ' + (L.name ? L.name + ' ' : '') + L.points.toLocaleString() + '점\n'
        + (L.yaku || []).map(function (y) { return y.n; }).join(' · '));
};

// ==========================================
// 끝 — 1위가 나간다
// ==========================================
function paintEnd(t) {
    const u = me(); const c = hue();
    const rank = arr(t.result && t.result.rank);
    const first = rank[0];
    const iWon = first && first.code === u.code;

    let o = '<div class="mj-h2" style="color:' + c + ';">🀄 끝났습니다</div>';
    rank.forEach(function (x, i) {
        const diff = x.score - (t.result.start || 25000);
        o += '<div class="mj-row" style="' + (i === 0 ? 'background:rgba(255,215,106,0.14); border-color:#ffd76a;' : '') + '">'
            + '<div style="font-size:12px; color:' + (i === 0 ? '#ffd76a' : '#ddd') + '; font-weight:bold;">'
            + (i + 1) + '위 ' + esc(x.name) + (i === 0 ? ' 🚪' : '') + '</div>'
            + '<div style="font-size:12px; color:#fff;">' + x.score.toLocaleString()
            + ' <span style="font-size:10px; color:' + (diff >= 0 ? '#7fe0a0' : '#ff8a80') + ';">'
            + (diff >= 0 ? '+' : '') + diff.toLocaleString() + '</span></div></div>';
    });
    o += '<div style="font-size:11px; color:' + (iWon ? '#7fe0a0' : '#8aa89a') + '; margin:12px 0; line-height:1.8;">'
        + (iWon ? '1위입니다. 격리가 풀렸습니다. 나가셔도 좋습니다.' : '1위가 나갔습니다. 다음 판을 기다리거나 새로 여세요.')
        + '</div>'
        + '<div style="display:flex; gap:6px;">'
        + '<button class="mj-btn" style="flex:1;" onclick="mjLeaveUI()">자리를 뜬다</button>'
        + '<button class="mj-btn" style="flex:1;" onclick="mjClose()">닫는다</button></div>';
    shell(o);
}

window.mjLeaveUI = function () { window.mjLeave().then(function () { window.mjClose(); }); };
window.mjDiscardUI = function (tile) {
    if (window._mjRiichiArm) { window._mjRiichiArm = false; window.mjRiichi(tile); return; }
    window.mjDiscard(tile);
};
window.mjRiichiArm = function (v) { window._mjRiichiArm = (v === 0) ? false : true; repaint(); };
window.mjTsumoUI = function () { window.mjTsumo(); };
window.mjRonUI = function () { window.mjClaim('ron'); };
window.mjChiUI = function (i) {
    const c = window.mjCanClaim();
    if (c && c.chi && c.chi[i]) window.mjClaim('chi', c.chi[i]);
};

function repaint() {
    const s = window.mjCur && window.mjCur();
    const el = document.getElementById(OV);
    if (el && el.style.display !== 'none') safePaint(s && s.t);
}
let shownEnd = '';
window.mjOnChange = function (t) {
    try {
        paintBtn();
        const el = document.getElementById(OV);
        if (el && el.style.display !== 'none') safePaint(t);
        if (!t || t.state !== 'DONE') { shownEnd = ''; return; }
        // 끝난 판은 창이 닫혀 있어도 한 번 띄운다 (정산보다 먼저 — 1위는 곧 격리가 풀린다)
        if (shownEnd !== t.id && arr(t.result && t.result.rank).length) { shownEnd = t.id; paintEnd(t); }
        settle(t);
    } catch (e) { console.warn('[마작] 화면', e); }
};

// ==========================================
// 정산 — 각자 제 자리에만 쓴다
// ==========================================
let settling = false;
function settle(t) {
    const u = me();
    if (!u || settling) return;
    if (!t.result || !arr(t.result.rank).length) return;
    if (t.paid && t.paid[u.code]) return;
    const rank = arr(t.result.rank);
    const mine = rank.filter(function (x) { return x.code === u.code; })[0];
    if (!mine) return;
    settling = true;

    const start = t.result.start || 25000;
    const diff = mine.score - start;
    const first = (rank[0] && rank[0].code === u.code);
    const f = {};

    if (window.MJ_PLAY.payout === 'diff' && diff !== 0) {
        const before = Number(u.points) || 0;
        u.points = Math.max(0, before + diff);
        f.points = 1;
    }
    if (first && typeof isQuarantined === 'function' && isQuarantined(u)) {
        const exitPoll = Number(u.quarantineExitPollution) || 0;    // 지우기 전에 먼저 챙긴다
        u.quarantineUntil = 0;
        u.quarantineExitPollution = 0;
        u.quarantineHospital = false;
        u.pollution = exitPoll;
        u.lastPollutionTime = Date.now();
        u.foxRoomAnswered = false;
        if (u.badge && u.badge.notes) {
            const keep = String(u.badge.notes).split(' | ')
                .filter(function (n) { return n.trim() && !/의식 불명|긴급 이송|사직 반려/.test(n); });
            u.badge.notes = keep.length ? keep.join(' | ') : '특이사항 없음';
            f.badge = 1;
        }
        f.quarantineUntil = 1; f.quarantineExitPollution = 1; f.quarantineHospital = 1;
        f.pollution = 1; f.lastPollutionTime = 1; f.foxRoomAnswered = 1;
    }
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[마작] 동풍전 ' + (rank.indexOf(mine) + 1) + '위 · '
            + mine.score.toLocaleString() + '점 (' + (diff >= 0 ? '+' : '') + diff.toLocaleString() + ')'
            + (first ? ' — 1위로 격리 해제' : ''));
        f.history = 1;
    }
    try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

    // 받았다고 적어 둔다
    try {
        if (typeof database !== 'undefined' && database) {
            database.ref('mjTables/' + t.id + '/paid/' + u.code).set(true);
        }
    } catch (e) { }

    setTimeout(function () {
        showCustomAlert('🀄 동풍전이 끝났습니다.\n\n'
            + (rank.indexOf(mine) + 1) + '위 · ' + mine.score.toLocaleString() + '점\n'
            + (window.MJ_PLAY.payout === 'diff'
                ? ((diff >= 0 ? '+' : '') + diff.toLocaleString() + ' P\n') : '')
            + (first ? '\n1위입니다. 격리가 풀렸습니다.' : ''));
        settling = false;
    }, 500);
}

console.log('[마작] 마작판 화면 — mjOpen()');

})();
