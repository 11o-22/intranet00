// ==========================================
// ★ 🧑 처음 들어온 사원 — 얼굴을 한 번 고른다
// bundles.json 마지막 묶음, shot.js 바로 뒤
// ==========================================
//
// ■ 왜 생겼나
//
//   가방에서는 머리를 못 고르게 했다 (옷만 고른다). 머리는 사택 옷장에서
//   고르는데, 새로 사번을 받은 사원은 사택에 들어가기 전부터 제 얼굴이
//   있어야 한다. 그래서 **맨 처음 들어온 그때 한 번만** 고르게 한다.
//
//   고르고 나면 dotPicked 가 적혀 다시는 안 뜬다. 건너뛸 수 없다 —
//   닫는 단추도 바깥 누르기도 없다. (한 번은 골라야 끝난다)
//
// ■ 언제 뜨나
//
//   로그인한 뒤 광장이 열리고, dotPicked 가 없을 때. 상담사는 안 뜬다.
//   이미 제 얼굴(h01 이 아닌 것)을 골라 둔 사원도 안 뜬다 — 그런 사원은
//   고른 것으로 치고 dotPicked 를 적어 둔다.
//
// ■ 콘솔
//       headPick()    다시 고른다 (상담사용 — 시험할 때)

(function firstHead() {

const KEY = 'dotPicked';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }

function heads() {
    try {
        return (typeof DOT_HEADS !== 'undefined' ? DOT_HEADS : []).filter(function (h) {
            // 한 벌이 통째로 그려진 특전(브라운 특전·토끼)은 여기서 안 고른다 —
            // 옷을 안 겹치는 것이라 처음 고르는 자리에 둘 것이 아니다.
            // 사택 옷장에서는 그대로 고를 수 있다.
            if (h.solo) return false;
            // ★ 옷장과 **같은 걸름망**을 쓴다 — 어둠 전용(브라운)·상담사 전용은
            //   여기에도 안 나온다.
            //   ✗ solo 만 보고 있었다. 브라운(h-brown)은 solo 가 아니라서
            //     어둠이 아닌 새 사원에게도 처음 창에 그대로 떴다.
            if (typeof window.dotHeadAllowed === 'function' && !window.dotHeadAllowed(h.i, me())) return false;
            return true;
        });
    } catch (e) { return []; }
}

function need() {
    const u = me();
    if (!u) return false;
    if (u.code === 'kario0987') return false;           // 상담사는 건드리지 않는다
    if (u[KEY]) return false;
    // 이미 제 얼굴이 있던 옛 사원이면 고른 것으로 치고 넘어간다
    const h = u.dot && u.dot.head;
    if (h && h !== 'h01') { mark(); return false; }
    return true;
}

// ✗ 「이력이 비어 있으면 새로 발급 받은 사원」으로 가리려 했는데 안 된다.
//   로그인하는 그 순간 정기 보급(상비약)이 이력에 세 줄 쌓인다. 광장이 열려
//   이쪽을 볼 때는 이미 이력이 있어, 새 사원에게도 창이 안 떴다.
//   그래서 가리는 것은 위의 두 가지뿐이다 —
//       · 골랐다고 적힌 적이 있나 (dotPicked)
//       · 기본 얼굴(h01)이 아닌 제 얼굴이 적혀 있나
//   아직 사택 옷장에 가 본 적 없는 옛 사원도 한 번은 뜬다. 그 사원들도
//   지금은 다 기본 얼굴이라, 한 번 고르게 하는 것이 낫다.

// quiet = 바로 뒤에 저장이 또 있을 때 (고른 그때 — dot 와 같이 적는다)
function mark(quiet) {
    const u = me(); if (!u) return;
    u[KEY] = Date.now();
    if (quiet) return;
    try { if (typeof saveFields === 'function') saveFields({ dotPicked: 1 }); } catch (e) { }
}

// ── 고르는 창
function open() {
    if (document.querySelector('#fh-ov')) return;
    const list = heads();
    if (!list.length) { mark(); return; }
    const u = me();
    const d = document.createElement('div');
    d.id = 'fh-ov';
    d.innerHTML = '<div class="fh-card">'
        + '<h4>어떤 얼굴로 일하시겠습니까</h4>'
        + '<p>한 번만 고릅니다. 나중에는 <b>사택 옷장</b>에서 바꾸실 수 있습니다.</p>'
        + '<div class="fh-stage"></div>'
        + '<div class="fh-pick"></div>'
        + '<button class="fh-go" id="fh-go">이 얼굴로 합니다</button>'
        + '</div>';
    document.body.appendChild(d);

    let cur = list[0].i;
    const stage = d.querySelector('.fh-stage');
    let box = null;
    const draw = function () {
        // ★ 옷은 지금 입은 것을 그대로 두고 머리만 갈아 끼운다.
        //   dot 를 통째로 넘기면 옷이 기본(잠옷)으로 되돌아가 버린다.
        const o = {};
        if (u.dot && typeof u.dot === 'object') {
            Object.keys(u.dot).forEach(function (k) { o[k] = u.dot[k]; });
        }
        o.head = cur;
        try { if (box && typeof window.dotStop === 'function') window.dotStop(box); } catch (e) { }
        stage.innerHTML = '';
        try {
            box = window.dotSprite(u, { pose: 'stand', scale: 0.5, dot: o });
            stage.appendChild(box);
        } catch (e) { }
    };
    d.querySelector('.fh-pick').innerHTML = list.map(function (h, i) {
        return '<button data-i="' + i + '"' + (h.i === cur ? ' class="on"' : '') + '>'
            + String(h.n || h.i).replace(/[&<>"]/g, '') + '</button>';
    }).join('');
    Array.prototype.forEach.call(d.querySelectorAll('.fh-pick button'), function (b) {
        b.onclick = function () {
            cur = list[Number(b.dataset.i)].i;
            Array.prototype.forEach.call(d.querySelectorAll('.fh-pick button'),
                function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            draw();
        };
    });
    d.querySelector('#fh-go').onclick = function () {
        if (!u.dot || typeof u.dot !== 'object') u.dot = {};
        u.dot.head = cur;
        mark(true);
        try { if (typeof saveFields === 'function') saveFields({ dot: 1, dotPicked: 1 }); } catch (e) { }
        // 광장에 선 내 모습도 그 자리에서 바로 갈아입힌다
        try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
        try { if (typeof window.dotStop === 'function' && box) window.dotStop(box); } catch (e) { }
        d.remove();
    };
    draw();
}

window.headPick = open;

// ── 모양새
(function css() {
    if (document.getElementById('fh-css')) return;
    const s = document.createElement('style');
    s.id = 'fh-css';
    s.textContent = [
        '#fh-ov{position:fixed;inset:0;z-index:999998;display:flex;align-items:center;',
        '  justify-content:center;background:rgba(4,4,8,.92);padding:18px;}',
        '.fh-card{width:min(92vw,400px);max-height:88dvh;overflow-y:auto;display:flex;',
        '  flex-direction:column;gap:10px;padding:16px 15px;border-radius:16px;',
        '  background:linear-gradient(180deg,#15151f,#0a0a10);border:1px solid #2b2b38;}',
        '.fh-card h4{margin:0;font-size:14px;color:#ffe9bd;}',
        '.fh-card p{margin:0;font-size:11.5px;color:#9a9284;line-height:1.7;}',
        '.fh-stage{display:flex;justify-content:center;padding:6px 0;overflow:hidden;',
        '  background:radial-gradient(ellipse at 50% 92%,rgba(217,160,90,.13),rgba(0,0,0,0) 62%);}',
        '.fh-stage .dot-box{margin-top:-32px;margin-bottom:-13px;}',
        '.fh-pick{display:flex;flex-wrap:wrap;gap:6px;max-height:34dvh;overflow-y:auto;}',
        // 손가락으로 누르는 자리라 높이를 44픽셀로 올렸다 (8px 일 때 33px 이었다)
        '.fh-pick button{padding:13px 13px;font-size:11px;border-radius:9px;cursor:pointer;',
        '  background:rgba(255,255,255,.04);border:1px solid #2b2b38;color:#b5ab9a;font-family:inherit;}',
        '.fh-pick button.on{background:rgba(217,160,90,.18);border-color:#8a6a2a;color:#ffe9bd;}',
        '.fh-go{padding:13px 0;border-radius:12px;font-size:12.5px;cursor:pointer;font-family:inherit;',
        '  background:linear-gradient(145deg,#4a3a1e,#2a2112);border:1px solid #8a6a2a;color:#ffe9bd;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ── 광장이 열리면 한 번 본다
(function hook() {
    const look = function () {
        if (!document.querySelector('#plaza-ov')) return;
        if (typeof window.dotSprite !== 'function') return;
        if (!need()) return;
        open();
    };
    const _open = window.plazaOpen;
    if (typeof _open === 'function') {
        window.plazaOpen = function () {
            const r = _open.apply(this, arguments);
            setTimeout(look, 700);
            return r;
        };
    }
})();

console.log('[첫 얼굴] 처음 들어온 사원만 한 번 — headPick()');

})();
