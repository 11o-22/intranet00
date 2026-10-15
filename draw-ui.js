// ==========================================
// ★ 🎨 그림 전화 — 화면과 그림판 (규칙은 draw-core.js)
// bundles.json 마지막 묶음, draw-core.js 바로 뒤
// ==========================================
//
// ■ 어디에 붙나
//
//   공용시설(카지노 거리 🎲) 에 「그림 전화」 칸을 하나 더 붙인다.
//   슬롯·룰렛·섯다·블랙잭과 같은 줄이다.
//
// ■ 그림판
//
//   256x256 짜리 한 칸이다. 손가락으로 그으면 선이 쌓이고, 낼 때
//   **글자 한 줄로 접어서** 보낸다.
//
//       색.굵기:x,y,x,y,… ;  색.굵기:…
//
//   ★ 점을 다 적지 않는다. 4칸(STEP) 넘게 움직였을 때만 한 점을 찍고,
//     한 차례에 MAXP 점까지만 받는다. 안 그러면 한 장이 수십 킬로가
//     되어 방 자료가 무거워진다 (스물다섯 장이 한 판에 쌓인다).
//
//   ★ setPointerCapture 는 쓰지 않는다 — 조이스틱에서 lostpointercapture 가
//     거품처럼 올라와 떼어진 것으로 읽혔던 적이 있다 (plaza.js 참고).
//
// ■ 콘솔
//       dgUI()   지금 화면 상태

(function drawUI() {

const PAL = ['#1b1b1f', '#e34b4b', '#e8923b', '#e8d44b', '#5bc46a', '#4bb7e8',
    '#5566dd', '#a259d9', '#d95f9e', '#8a5a3b', '#9aa0a8', '#ffffff'];
const WID = [3, 7, 14];
const SIZE = 256;            // 그림판 한 변 (논리 크기)
const STEP = 4;              // 이만큼 움직여야 한 점을 찍는다
const MAXP = 1400;           // 한 차례에 받는 점 수

function D() { return window.DG; }
function me_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

// ==========================================
// 선 접기 · 펴기
// ==========================================
function pack(strokes) {
    return strokes.map(function (s) {
        return s.c + '.' + s.w + ':' + s.p.join(',');
    }).join(';');
}
function unpack(txt) {
    if (!txt) return [];
    return String(txt).split(';').map(function (one) {
        const at = one.indexOf(':');
        if (at < 0) return null;
        const head = one.slice(0, at).split('.');
        const pts = one.slice(at + 1).split(',').map(Number);
        if (pts.length < 2) return null;
        return { c: Number(head[0]) || 0, w: Number(head[1]) || 0, p: pts };
    }).filter(Boolean);
}

function paintTo(cv, strokes, box) {
    const k = (box || cv.width) / SIZE;
    const x = cv.getContext('2d');
    x.save();
    x.fillStyle = '#fbf8f2';
    x.fillRect(0, 0, cv.width, cv.height);
    x.lineCap = 'round'; x.lineJoin = 'round';
    strokes.forEach(function (s) {
        x.strokeStyle = PAL[s.c] || PAL[0];
        x.lineWidth = (WID[s.w] || WID[0]) * k;
        x.beginPath();
        for (let i = 0; i + 1 < s.p.length; i += 2) {
            const px = s.p[i] * k, py = s.p[i + 1] * k;
            if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
        }
        if (s.p.length === 2) x.lineTo(s.p[0] * k + 0.1, s.p[1] * k + 0.1);
        x.stroke();
    });
    x.restore();
}

// ==========================================
// 모양새
// ==========================================
(function css() {
    if (document.getElementById('dg-css')) return;
    const s = document.createElement('style');
    s.id = 'dg-css';
    s.textContent = [
        '#dg-wrap{padding:4px 2px;}',
        '#dg-wrap .dg-h{font-size:12px;color:#9fd4ff;margin:10px 0 6px 0;}',
        '#dg-wrap .dg-s{font-size:11px;color:#9a948a;line-height:1.7;}',
        '#dg-wrap .dg-seat{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;}',
        '#dg-wrap .dg-seat span{font-size:11px;padding:5px 9px;border-radius:7px;',
        '  background:rgba(255,255,255,.05);border:1px solid #3c4452;color:#ded5c4;}',
        '#dg-wrap .dg-seat span.me{border-color:#8a6a2a;background:rgba(217,160,90,.22);font-weight:bold;}',
        '#dg-wrap .dg-seat span.ok{border-color:#4e8a5a;}',
        '#dg-pad{display:block;margin:0 auto;border-radius:10px;background:#fbf8f2;',
        '  touch-action:none;cursor:crosshair;max-width:100%;border:1px solid #4a5160;}',
        '#dg-tools{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin:8px 0 4px 0;}',
        '#dg-tools i{width:24px;height:24px;border-radius:50%;cursor:pointer;display:block;',
        '  border:2px solid rgba(255,255,255,.22);}',
        '#dg-tools i.on{border-color:#ffd98a;transform:scale(1.14);}',
        '#dg-wid{display:flex;gap:6px;justify-content:center;align-items:center;margin-bottom:6px;}',
        '#dg-wid button,#dg-act button{padding:8px 12px;font-size:11px;border-radius:8px;cursor:pointer;',
        '  background:rgba(255,255,255,.05);border:1px solid #4a5160;color:#ded5c4;font-family:inherit;}',
        '#dg-wid button.on{background:rgba(217,160,90,.28);border-color:#8a6a2a;font-weight:bold;}',
        '#dg-act{display:flex;gap:6px;margin-top:8px;}',
        '#dg-act button{flex:1;padding:12px 4px;}',
        '#dg-act button.go{background:rgba(159,212,255,.22);border-color:#4a7fa5;font-weight:bold;}',
        '#dg-act button:disabled{opacity:.45;cursor:default;}',
        '#dg-time{text-align:center;font-size:12px;color:#ffcf8f;margin:6px 0;font-weight:bold;}',
        '#dg-word{text-align:center;font-size:15px;color:#ffe9bd;margin:8px 0;font-weight:bold;',
        '  letter-spacing:.04em;}',
        '#dg-wrap input[type=text]{width:100%;box-sizing:border-box;padding:11px;font-size:13px;',
        '  text-align:center;}',
        '#dg-book{margin-top:10px;}',
        '#dg-book .bk{border:1px solid #3c4452;border-radius:9px;padding:9px;margin-bottom:10px;',
        '  background:rgba(0,0,0,.22);}',
        '#dg-book .bk b{font-size:11px;color:#9fd4ff;}',
        '#dg-book .st{display:flex;gap:8px;align-items:center;margin-top:7px;font-size:11px;color:#ded5c4;}',
        '#dg-book .st canvas{flex:0 0 auto;border-radius:6px;background:#fbf8f2;border:1px solid #4a5160;}',
        '#dg-book .hit{color:#7fe08a;font-weight:bold;}',
        '#dg-book .miss{color:#b9b2a6;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 그림판
// ==========================================
let pad = null;        // { cv, strokes, cur, col, wid, off }

function padMake(cv, base) {
    const st = { cv: cv, strokes: [], col: 0, wid: 1, pts: 0, base: base || [] };
    let on = null;
    // ★ 칸이 안 보이는 참에 그으면 폭이 0 이라 0*256/0 = NaN 이 나온다.
    //   NaN 이 한 점이라도 섞이면 그 그림은 통째로 못 쓴다 — 막아 둔다.
    const at = function (e) {
        const r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return [0, 0];
        const cl = function (v) { v = Math.round(v); return v < 0 ? 0 : (v > SIZE ? SIZE : (v || 0)); };
        return [cl((e.clientX - r.left) * SIZE / r.width),
                cl((e.clientY - r.top) * SIZE / r.height)];
    };
    const down = function (e) {
        if (st.pts >= MAXP) return;
        const p = at(e);
        on = { c: st.col, w: st.wid, p: [p[0], p[1]] };
        st.strokes.push(on); st.pts++;
        redraw(); e.preventDefault();
    };
    const move = function (e) {
        if (!on || st.pts >= MAXP) return;
        const p = at(e);
        const lx = on.p[on.p.length - 2], ly = on.p[on.p.length - 1];
        if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < STEP) return;
        on.p.push(p[0], p[1]); st.pts++;
        redraw(); e.preventDefault();
    };
    const up = function () { on = null; };
    cv.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    st.off = function () {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
    };
    function redraw() { paintTo(cv, st.base.concat(st.strokes), cv.width); }
    st.redraw = redraw;
    redraw();
    return st;
}
function padKill() { if (pad && pad.off) pad.off(); pad = null; }

// ==========================================
// 화면
// ==========================================
let host = null, timer = null, shown = '';

function box() { return document.getElementById('dg-wrap'); }

function clock(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return s + '초';
}

function paint() {
    const el = box(); if (!el) return;
    const G = D(); if (!G) { el.innerHTML = '<div class="dg-s">준비 중입니다.</div>'; return; }
    const rm = G.room();
    const u = me_();
    const key = rm ? (rm.state + '|' + (rm.round || 0) + '|' + Object.keys(rm.players || {}).length
        + '|' + (G.myJob() ? G.myJob().kind : '-') + '|' + ((rm.relay || {}).turn || 0)) : 'none';
    if (key !== shown) { shown = key; padKill(); el.innerHTML = ''; build(el, rm, u, G); }
    face(rm, G);
}

function build(el, rm, u, G) {
    if (!rm || !rm.state) return viewNone(el, G);
    if (!G.amIn(rm)) return viewWatch(el, rm, G);
    if (rm.state === 'wait') return viewWait(el, rm, u, G);
    if (rm.state === 'word') return viewWord(el, rm, G);
    if (rm.state === 'play') return viewPlay(el, rm, G);
    if (rm.state === 'show') return viewShow(el, rm, G);
}

// 시간·사람 같은 잔 것만 갈아 끼운다 (다시 그리면 그리던 선이 날아간다)
function face(rm, G) {
    const t = document.getElementById('dg-time');
    if (t && rm && rm.deadline) t.innerText = '남은 시간 ' + clock(rm.deadline - Date.now());
    const seat = document.getElementById('dg-seats');
    if (seat && rm) seat.innerHTML = seatHTML(rm, G);
}

function seatHTML(rm, G) {
    const u = me_();
    const ps = G.players(rm);
    return ps.map(function (c) {
        const p = rm.players[c] || {};
        let cls = (u && c === u.code) ? 'me' : '';
        if (rm.state === 'word' && (rm.words || {})[c]) cls += ' ok';
        if (rm.state === 'play' && rm.mode !== 'relay') {
            const r = Number(rm.round) || 0;
            const k = ps.indexOf(c), n = ps.length;
            const bi = ((k - r) % n + n * n) % n;
            if (((rm.books || {})[bi] || {}).steps && rm.books[bi].steps[r]) cls += ' ok';
        }
        return '<span class="' + cls + '">' + esc(p.n || c)
            + (rm.host === c ? ' 👑' : '') + '</span>';
    }).join('');
}

function viewNone(el, G) {
    el.innerHTML =
        '<div class="panel-title">[그림 전화]</div>'
        + '<div class="dg-s">' + G.MIN + '명부터 ' + G.MAX + '명까지 함께 합니다. '
        + '참가비 <b style="color:#ffcf8f;">' + G.FEE + ' P</b> 를 모아 맞힌 사람이 나눠 갖습니다.</div>'
        + '<div class="dg-h">① 이어 말하기</div>'
        + '<div class="dg-s">모두가 제시어를 하나씩 냅니다. 묶음이 옆으로 돌면서 '
        + '그리고 · 맞히고를 되풀이합니다. 끝나면 처음 말이 어떻게 망가졌는지 쭉 보입니다.</div>'
        + '<div class="dg-h">② 한 장 이어 그리기</div>'
        + '<div class="dg-s">제시어 하나를 두고 같은 그림판이 돌아갑니다. '
        + '맞힐 사람 하나만 그 말을 모릅니다.</div>'
        + '<div id="dg-act">'
        + '<button class="go" id="dg-mk1">① 판 만들기</button>'
        + '<button class="go" id="dg-mk2">② 판 만들기</button>'
        + '</div>';
    el.querySelector('#dg-mk1').onclick = function () { go(G.make('chain')); };
    el.querySelector('#dg-mk2').onclick = function () { go(G.make('relay')); };
}

function viewWatch(el, rm, G) {
    const n = G.players(rm).length;
    const full = n >= G.MAX;
    el.innerHTML =
        '<div class="panel-title">[그림 전화]</div>'
        + '<div class="dg-s">' + (rm.mode === 'relay' ? '한 장 이어 그리기' : '이어 말하기')
        + ' · ' + (rm.state === 'wait' ? '사람을 모으고 있습니다' : '이미 하고 있습니다') + '</div>'
        + '<div class="dg-seat" id="dg-seats"></div>'
        + '<div class="dg-s">참가비 ' + (rm.fee || G.FEE) + ' P</div>'
        + '<div id="dg-act"><button class="go" id="dg-join"'
        + ((rm.state !== 'wait' || full) ? ' disabled' : '') + '>'
        + (full ? '자리가 찼습니다' : rm.state !== 'wait' ? '다음 판을 기다려 주세요' : '들어가기') + '</button></div>';
    const b = el.querySelector('#dg-join');
    if (b) b.onclick = function () { go(G.join()); };
}

function viewWait(el, rm, u, G) {
    const n = G.players(rm).length;
    const amHost = rm.host === u.code;
    el.innerHTML =
        '<div class="panel-title">[그림 전화 — 모이는 중]</div>'
        + '<div class="dg-s">' + (rm.mode === 'relay' ? '한 장 이어 그리기' : '이어 말하기')
        + ' · ' + n + ' / ' + G.MAX + '명 · 판돈 ' + ((rm.fee || G.FEE) * n) + ' P</div>'
        + '<div class="dg-seat" id="dg-seats"></div>'
        + '<div class="dg-s">' + (n < G.MIN
            ? (G.MIN - n) + '명 더 모이면 시작할 수 있습니다.'
            : (amHost ? '이제 시작할 수 있습니다.' : '방장이 시작하기를 기다립니다.')) + '</div>'
        + '<div id="dg-act">'
        + '<button id="dg-out">나가기</button>'
        + (amHost ? '<button class="go" id="dg-go"' + (n < G.MIN ? ' disabled' : '') + '>시작한다</button>' : '')
        + '</div>';
    el.querySelector('#dg-out').onclick = function () { go(G.leave()); };
    const g = el.querySelector('#dg-go');
    if (g) g.onclick = function () { go(G.start()); };
}

function viewWord(el, rm, G) {
    const u = me_();
    const mine = (rm.words || {})[u.code];
    el.innerHTML =
        '<div class="panel-title">[제시어를 하나씩]</div>'
        + '<div id="dg-time"></div>'
        + '<div class="dg-s">남이 그리게 될 말입니다. 너무 어려우면 아무도 못 맞힙니다.</div>'
        + '<div class="dg-seat" id="dg-seats"></div>'
        + (mine
            ? '<div id="dg-word">냈습니다 — ' + esc(mine) + '</div>'
              + '<div class="dg-s">다른 분들을 기다립니다.</div>'
            : '<input type="text" id="dg-w" maxlength="20" placeholder="제시어 (스무 자까지)">'
              + '<div id="dg-act"><button class="go" id="dg-ws">낸다</button></div>');
    const b = el.querySelector('#dg-ws');
    if (b) b.onclick = function () { go(G.word(el.querySelector('#dg-w').value)); };
}

function viewPlay(el, rm, G) {
    const job = G.myJob();
    if (!job) return viewWatch(el, rm, G);

    if (job.kind === 'wait' || job.kind === 'done') {
        el.innerHTML =
            '<div class="panel-title">[기다리는 중]</div>'
            + '<div id="dg-time"></div>'
            + '<div class="dg-s">' + (job.kind === 'done' ? '냈습니다. 다른 분들을 기다립니다.'
                : esc(job.who || '') + ' 사원이 그리고 있습니다.') + '</div>'
            + '<div class="dg-seat" id="dg-seats"></div>';
        return;
    }

    if (job.kind === 'draw') {
        el.innerHTML =
            '<div class="panel-title">[그릴 차례]</div>'
            + '<div id="dg-time"></div>'
            + '<div id="dg-word">' + esc(job.word || '(앞사람의 말이 없습니다)') + '</div>'
            + '<canvas id="dg-pad" width="320" height="320"></canvas>'
            + '<div id="dg-tools"></div><div id="dg-wid"></div>'
            + '<div id="dg-act">'
            + '<button id="dg-undo">되돌리기</button>'
            + '<button id="dg-clr">지우기</button>'
            + '<button class="go" id="dg-send">낸다</button>'
            + '</div>';
        tools(el);
        const cv = el.querySelector('#dg-pad');
        const begin = function (base) {
            pad = padMake(cv, base);
            tools(el);                       // 고른 색 표시를 맞춘다
        };
        if (rm.mode === 'relay' && job.prev) G.art(job.prev).then(function (t) { begin(unpack(t)); });
        else begin([]);
        el.querySelector('#dg-undo').onclick = function () {
            if (!pad || !pad.strokes.length) return;
            const s = pad.strokes.pop();
            pad.pts -= Math.floor(s.p.length / 2);
            pad.redraw();
        };
        el.querySelector('#dg-clr').onclick = function () {
            if (!pad) return; pad.strokes = []; pad.pts = 0; pad.redraw();
        };
        el.querySelector('#dg-send').onclick = function () {
            if (!pad) return;
            const all = (rm.mode === 'relay') ? pad.base.concat(pad.strokes) : pad.strokes;
            go(G.submitArt(pack(all)));
        };
        return;
    }

    // 맞히기
    el.innerHTML =
        '<div class="panel-title">[맞힐 차례]</div>'
        + '<div id="dg-time"></div>'
        + '<canvas id="dg-see" width="320" height="320" style="display:block;margin:0 auto;'
        + 'border-radius:10px;background:#fbf8f2;border:1px solid #4a5160;max-width:100%;"></canvas>'
        + '<div class="dg-s" style="text-align:center;margin-top:8px;">이 그림은 무엇일까요?</div>'
        + '<input type="text" id="dg-g" maxlength="20" placeholder="답">'
        + '<div id="dg-act"><button class="go" id="dg-gs">낸다</button></div>';
    const cv = el.querySelector('#dg-see');
    paintTo(cv, [], cv.width);
    G.art(job.prev).then(function (t) { paintTo(cv, unpack(t), cv.width); });
    el.querySelector('#dg-gs').onclick = function () {
        go(G.submitGuess(el.querySelector('#dg-g').value));
    };
}

function tools(el) {
    const t = el.querySelector('#dg-tools'); if (!t) return;
    t.innerHTML = PAL.map(function (c, i) {
        return '<i data-c="' + i + '" class="' + ((pad && pad.col === i) ? 'on' : '')
            + '" style="background:' + c + '"></i>';
    }).join('');
    Array.prototype.forEach.call(t.querySelectorAll('i'), function (b) {
        b.onclick = function () { if (pad) { pad.col = Number(b.dataset.c); tools(el); } };
    });
    const w = el.querySelector('#dg-wid'); if (!w) return;
    w.innerHTML = ['가는 선', '보통', '굵은 선'].map(function (n, i) {
        return '<button data-w="' + i + '" class="' + ((pad && pad.wid === i) ? 'on' : '') + '">' + n + '</button>';
    }).join('');
    Array.prototype.forEach.call(w.querySelectorAll('button'), function (b) {
        b.onclick = function () { if (pad) { pad.wid = Number(b.dataset.w); tools(el); } };
    });
}

function viewShow(el, rm, G) {
    const res = G.result(rm) || { share: {}, pot: 0 };
    const u = me_();
    const mine = Number(res.share[u.code]) || 0;
    el.innerHTML =
        '<div class="panel-title">[결과]</div>'
        + '<div class="dg-s">판돈 ' + res.pot + ' P · 내 몫 <b style="color:#ffcf8f;">' + mine + ' P</b>'
        + (res.hit ? '' : ' (아무도 못 맞혀 참가비를 돌려 드렸습니다)') + '</div>'
        + '<div id="dg-book"></div>'
        + '<div id="dg-act"><button class="go" id="dg-done">나가기</button></div>';
    el.querySelector('#dg-done').onclick = function () { go(G.leave()); };
    try { G.collect(); } catch (e) { }

    const bk = el.querySelector('#dg-book');
    if (rm.mode === 'relay') {
        const R = rm.relay || {};
        const d = document.createElement('div');
        d.className = 'bk';
        d.innerHTML = '<b>제시어 — ' + esc(R.word || '') + '</b>'
            + '<div class="st"><canvas width="150" height="150"></canvas>'
            + '<span>' + esc((rm.players[R.seer] || {}).n || '') + ' 사원의 답<br>'
            + '<b class="' + (G.same(R.guess, R.word) ? 'hit' : 'miss') + '">'
            + esc(R.guess || '(없음)') + '</b></span></div>';
        bk.appendChild(d);
        const cv = d.querySelector('canvas');
        paintTo(cv, [], cv.width);
        G.art(R.art).then(function (t) { paintTo(cv, unpack(t), cv.width); });
        return;
    }

    Object.keys(rm.books || {}).sort(function (a, b) { return a - b; }).forEach(function (bi) {
        const b = rm.books[bi] || {};
        const d = document.createElement('div');
        d.className = 'bk';
        let h = '<b>' + esc((rm.players[b.own] || {}).n || '') + ' 사원의 말 — ' + esc(b.word || '') + '</b>';
        const steps = b.steps || {};
        Object.keys(steps).sort(function (x, y) { return x - y; }).forEach(function (si) {
            const st = steps[si];
            const who = esc((rm.players[st.by] || {}).n || st.by);
            if (st.kind === 'draw') {
                h += '<div class="st"><canvas width="110" height="110" data-art="' + esc(st.art) + '"></canvas>'
                    + '<span>' + who + ' 사원이 그렸습니다</span></div>';
            } else {
                h += '<div class="st"><span>' + who + ' 사원 — <b class="'
                    + (G.same(st.text, b.word) ? 'hit' : 'miss') + '">'
                    + esc(st.text || '(없음)') + '</b></span></div>';
            }
        });
        d.innerHTML = h;
        bk.appendChild(d);
        Array.prototype.forEach.call(d.querySelectorAll('canvas[data-art]'), function (cv) {
            paintTo(cv, [], cv.width);
            G.art(cv.dataset.art).then(function (t) { paintTo(cv, unpack(t), cv.width); });
        });
    });
}

function go(pr) {
    if (!pr || !pr.then) return;
    pr.catch(function (e) {
        const t = (typeof e === 'string') ? e : (e && e.message) || '안 되었습니다.';
        if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.warn(t);
    });
}

// ==========================================
// 공용시설에 칸을 붙인다
// ==========================================
(function mountTab() {
    const iv = setInterval(function () {
        if (document.getElementById('panel-draw')) { clearInterval(iv); return; }
        const h = document.getElementById('tab-public');
        const grid = h && h.querySelector('.sub-tabs-grid');
        const bodyHost = h && h.querySelector('#public-content-box');
        if (!grid || !bodyHost) return;

        const btn = document.createElement('button');
        btn.className = 'sub-tab';
        btn.innerText = '그림 전화';
        btn.setAttribute('onclick', "switchGamePanel('panel-draw', this); dgPaint();");
        grid.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'panel-draw';
        panel.className = 'sub-panel';
        panel.innerHTML = '<div id="dg-wrap"></div>';
        bodyHost.appendChild(panel);
        host = panel;

        if (window.DG) { window.DG.watch(); window.DG.on(function () { try { paint(); } catch (e) { } }); }
        clearInterval(iv);
        console.log('[그림] 공용시설에 「그림 전화」 칸 연결');
    }, 700);
})();

window.dgPaint = function () { try { paint(); } catch (e) { console.warn('[그림]', e); } };

// 열려 있는 동안에만 시계를 돌린다
setInterval(function () {
    const p = document.getElementById('panel-draw');
    if (!p || !p.classList.contains('active')) return;
    try { paint(); } catch (e) { }
}, 1000);

window.dgUI = function () {
    console.log('%c===== 🎨 그림 전화 화면 =====', 'color:#9fd4ff; font-size:13px');
    console.log('  칸 붙음 :', !!document.getElementById('panel-draw'));
    console.log('  그림판  :', pad ? (pad.strokes.length + '선 · ' + pad.pts + '점 / ' + MAXP) : '없음');
    console.log('  지금 모습:', shown);
};

})();
