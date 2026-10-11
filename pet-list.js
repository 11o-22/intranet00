// ==========================================
// ★ 펫 — [🐶 펫] 단추와 목록 칸
// bundles.json 마지막 묶음, pet-data.js 보다 뒤
// ==========================================
//
// ■ 무엇을 하나
//
//   오른쪽 아래에 [🐶 펫] 단추를 띄운다. 누르면 펫 20종이 다섯 칸씩 넉 줄로
//   깔린다. 가진 것은 작은 데포르메 그림, 없는 것은 어둡게 깔고 「입양 전」.
//
//   가진 펫을 누르면 본 그림과 함께 등급·능력치·설명이 열리고, 거기서
//   **이름을 따로 붙여 줄 수 있다**. 안 붙이면 종 이름으로 부른다.
//
//   능력치는 B 등급부터 생긴다. 전부 D 로 깨어나므로 당장은 다들
//   「능력치는 B 등급부터」로 뜬다 (등급을 올리는 길은 아직 안 넣었다).
//
// ■ 단추를 숨기는 때
//   로그인 전 · 어둠 탐사 중 · 창이 열려 있을 때
//
// ■ 콘솔
//   petOpen()   목록을 연다

(function petListUI() {

const FAB = 'pet-fab';
const MOD = 'pet-modal';
const COLS = 5;                 // 사용자가 적어 준 차례대로 다섯 칸씩

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function P() { return window.PET; }

// ==========================================
// 창
// ==========================================
function shut() {
    const m = document.getElementById(MOD);
    if (m) m.remove();
}
function box(html) {
    shut();
    const f = document.getElementById(FAB);        // 창을 열면 단추는 치운다
    if (f) f.remove();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999990; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}

const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// ==========================================
// 목록
// ==========================================
function statusOf(s) {
    const now = P().now();
    if (s && s.out && s.out.till)
        return (s.out.till > now)
            ? { t: '탐사 중', c: '#9fd8ef' }
            : { t: '돌아옴', c: '#6f8f5e' };      // 어둠 칸에서 데려오면 된다
    if (s && (s.rest || 0) > now)
        return { t: '쉬는 중', c: '#c9a227' };
    return null;
}

function cell(p) {
    const me = u_();
    const ps = P().pets(me);
    const s = ps[String(p.i)];
    const img = P().icon(p.i);

    if (!s) {
        // 입양 전 — 어둡게
        return '<div style="text-align:center; padding:4px 2px; opacity:0.85;">'
            + '<div style="width:100%; aspect-ratio:1/1; display:flex; align-items:center;'
            + ' justify-content:center; border:1px solid #2a2622; border-radius:7px;'
            + ' background:rgba(0,0,0,0.5);">'
            + '<img src="' + img + '" alt="" style="max-width:88%; max-height:88%;'
            + ' image-rendering:pixelated; filter:brightness(0.14) grayscale(1);">'
            + '</div>'
            + '<div style="font-size:8.5px; color:#5a544c; margin-top:3px; line-height:1.2;">입양 전</div>'
            + '</div>';
    }

    const st = statusOf(s);
    const nick = P().nick(p.i, me);
    return '<div class="pet-cell" data-i="' + p.i + '" style="text-align:center; padding:4px 2px;'
        + ' cursor:pointer;">'
        + '<div style="position:relative; width:100%; aspect-ratio:1/1; display:flex;'
        + ' align-items:center; justify-content:center; border:1px solid #4a3a26;'
        + ' border-radius:7px; background:rgba(60,44,22,0.22);">'
        + '<img src="' + img + '" alt="" style="max-width:88%; max-height:88%;'
        + ' image-rendering:pixelated;">'
        + '<span style="position:absolute; top:-3px; right:-3px; font-size:8px; font-weight:bold;'
        + ' color:#1a1208; background:#c9a227; border-radius:3px; padding:0 3px;">'
        + esc(s.g || 'D') + '</span>'
        + (st ? '<span style="position:absolute; bottom:1px; left:1px; right:1px; font-size:7.5px;'
            + ' color:' + st.c + '; background:rgba(0,0,0,0.72);">' + st.t + '</span>' : '')
        + '</div>'
        + '<div style="font-size:8.5px; color:#e8d7b4; margin-top:3px; line-height:1.2;'
        + ' overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(nick) + '</div>'
        + '</div>';
}

function listView() {
    const me = u_();
    if (!me) { alert_('로그인 뒤에 쓸 수 있습니다.'); return; }
    const L = P().LIST;
    const have = Object.keys(P().pets(me)).filter(function (k) { return P().BY[k]; }).length;

    const grid = '<div style="display:grid; grid-template-columns:repeat(' + COLS + ',1fr);'
        + ' gap:5px;">' + L.map(cell).join('') + '</div>';

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">'
        + '<span style="font-size:13px; color:#ffcf8f; font-weight:bold;">🐶 펫</span>'
        + '<span style="font-size:10px; color:#8d8578;">' + have + ' / ' + L.length + '마리</span>'
        + '</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:10px;">'
        + '가진 펫을 누르면 이름을 붙일 수 있습니다.</div>'
        + grid
        + '<button id="pet-x" class="game-btn" style="' + BTN + GREY + ' margin-top:11px;">닫는다</button>');

    w.querySelector('#pet-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.pet-cell'), function (el) {
        el.onclick = function () { oneView(Number(el.getAttribute('data-i'))); };
    });
}

// ==========================================
// 펫 하나
// ==========================================
function oneView(id) {
    const me = u_();
    const p = P().BY[id];
    if (!me || !p) return;
    const s = P().pets(me)[String(id)];
    if (!s) { listView(); return; }

    const g = s.g || 'D';
    const gi = P().GRADES.indexOf(g);
    const named = P().named(id, me);
    const nick = P().nick(id, me);
    const st = statusOf(s);

    const line = function (k, v) {
        return '<div style="display:flex; justify-content:space-between; gap:10px;'
            + ' font-size:11px; padding:5px 0; border-bottom:1px solid #241f19;">'
            + '<span style="color:#8d8578;">' + k + '</span>'
            + '<span style="color:#e8d7b4; text-align:right;">' + v + '</span></div>';
    };

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">'
        + '<span style="font-size:12px; color:#ffcf8f; font-weight:bold;">' + esc(nick) + '</span>'
        + '<span style="font-size:10px; color:#8d8578;">'
        + (named ? esc(p.n) + ' · ' : '') + g + ' 등급</span></div>'

        + '<div style="text-align:center; background:rgba(0,0,0,0.42); border:1px solid #3a3025;'
        + ' border-radius:8px; padding:10px; margin-bottom:11px;">'
        + '<img src="' + P().img(id) + '" alt="" style="max-width:100%; max-height:190px;">'
        + '</div>'

        + '<div style="font-size:11px; color:#b8ac97; line-height:1.55; margin-bottom:10px;">'
        + esc(p.d) + '</div>'

        + line('등급', g + ' <span style="color:#6f685e;">(최고 S)</span>')
        + line('능력치', gi >= 2
            ? esc(P().statText(p.st))
            : '<span style="color:#8d8578;">— B 등급부터 생깁니다</span>')
        + line('주의 문구', esc(P().WARN[p.w].n))
        + (st ? line('지금', '<span style="color:' + st.c + ';">' + st.t + '</span>') : '')

        + '<button id="pet-nick" class="game-btn" style="' + BTN + ' margin-top:12px;">이름 붙이기</button>'
        + '<button id="pet-back" class="game-btn" style="' + BTN + GREY + '">목록으로</button>');

    w.querySelector('#pet-back').onclick = listView;
    w.querySelector('#pet-nick').onclick = function () { nickView(id); };
}

// ==========================================
// 이름 붙이기
// ==========================================
function nickView(id) {
    const me = u_();
    const p = P().BY[id];
    if (!me || !p) return;
    const now = P().named(id, me) ? P().nick(id, me) : '';
    const max = P().NICK_MAX;

    const w = box(
        '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">이름 붙이기</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:11px;">'
        + esc(p.n) + ' · ' + max + '자까지. 비워 두면 종 이름으로 돌아갑니다.</div>'
        + '<input id="pet-in" type="text" maxlength="' + max + '" inputmode="text"'
        + ' autocapitalize="off" autocorrect="off" spellcheck="false"'
        + ' placeholder="' + esc(p.n) + '" value="' + esc(now) + '"'
        + ' style="width:100%; padding:10px; font-size:13px; margin-bottom:11px;">'
        + '<button id="pet-ok" class="game-btn" style="' + BTN + '">붙인다</button>'
        + '<button id="pet-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');

    const f = w.querySelector('#pet-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 90);

    const go = function () {
        const r = P().rename(id, f.value);
        if (!r.ok) { alert_(r.why); return; }
        oneView(id);
    };
    w.querySelector('#pet-ok').onclick = go;
    w.querySelector('#pet-no').onclick = function () { oneView(id); };
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}

// ==========================================
// 떠 있는 단추
// ==========================================
function want() {
    const me = u_();
    if (!me) return false;
    const main = document.getElementById('main-screen');
    if (!main || main.style.display === 'none') return false;
    if (typeof darkRun !== 'undefined' && darkRun) return false;
    if (document.getElementById(MOD)) return false;
    return true;
}

setInterval(function () {
    try {
        let b = document.getElementById(FAB);
        if (!want()) { if (b) b.remove(); return; }
        if (b) return;
        b = document.createElement('button');
        b.id = FAB;
        b.type = 'button';
        b.textContent = '🐶 펫';
        b.style.cssText = 'position:fixed; right:12px; z-index:9997;'
            + ' bottom:calc(16px + env(safe-area-inset-bottom)); padding:9px 13px;'
            + ' border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;'
            + ' background:linear-gradient(145deg,#6b4a1d,#38250e); border:1px solid #c9a227;'
            + ' color:#ffe9bd; box-shadow:0 3px 10px rgba(0,0,0,0.6);';
        b.onclick = listView;
        document.body.appendChild(b);
    } catch (e) { }
}, 1200);

window.petOpen = listView;
window.petShut = shut;

console.log('[펫] petOpen()');

})();
