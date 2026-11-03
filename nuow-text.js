// ==========================================
// ★ 🐰 Null Owner 착한 친구 — 말풍선 글씨를 내가 고른다 (2026-11-03 사용자)
// bundles.json — closet.js · recolor.js · plaza.js 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//   토끼 인형이 서서 말풍선에 글씨를 써 내려가는 효과 — 그 글씨를 **두 글자까지** 내가 바꾼다.
//   **토끼를 누르면** 글씨와 글씨 색을 고르는 창이 뜬다.
//
// ■ 어떻게 그리나
//   · 말풍선 글씨를 지운 장(dot/nuow-friend-nt.png · 분홍 글씨 점만 흰색으로)을 바탕으로,
//     글씨가 써지는 여섯 칸(서기 셋째 줄 · 장의 여섯째 줄)에 고른 글씨를 왼쪽부터 조금씩 드러내며 그려 넣는다.
//     → 한 사람의 글씨 · 색마다 장을 한 번 만들어 쟁여 둔다 (canvas → blob 주소).
//   · 글씨는 그림 점(원본 4px · 절반 크기 장 2px) 크기로 깎아 그려 도트 그림처럼 보이게 한다.
//   · 오른쪽을 볼 때 쓰는 짝(nuow-friend-r)은 몸과 함께 통째로 뒤집히므로 글씨를 미리 뒤집어 그린다
//     (원본도 그렇게 되어 있다 — 글씨만 뒤집은 짝).
//   · 고른 글씨는 dot.nw = { t, c } 로 적는다. 광장은 dot 을 통째로 주고받으므로 남의 화면에서도 같은 글씨다.
//   · 고른 것이 없으면 그려 둔 그대로(원래 글씨)다.
//   · 물들이기(recolor.js)를 했으면 물든 바탕 위에 글씨를 쓴다 (글씨 색은 고른 색 그대로).
//
// ■ 콘솔
//   nuowTextOpen()     글씨 고르는 창
//   nuowTextState()

(function nuowText() {
'use strict';

const BASE = 'nuow-friend-nt';
const SW = 2880, CW = 480, CH = 576;      // 원본 장 폭 · 큰 칸 한 칸
const ROW = 5;                           // 글씨가 써지는 줄
const CX = 140, CY = 352;                // 글씨 가운데 (칸 좌표 · 원본 크기) — 그려 둔 글씨 자리
const AXIS = 278;                        // 짝(-r) — 글씨만 뒤집은 자리: x' = AXIS - x (원본에서 재었다)
const ART = 4;                           // 그림 점 하나 = 원본 4px
const MAXW = 41;                         // 글씨 폭 (그림 점) — 말풍선 안쪽에 들게
// 여섯 칸 — 글자마다 위에서 아래로 써 내려간 만큼 [몇째 글자, 그 글자를 위에서부터 얼마나]
//   (가로로 잘라 드러내면 「안」이 반쯤 「인」처럼 읽혔다 — 한글은 첫소리부터 받침까지 위에서 아래로 쓰므로)
const REVEAL2 = [[0, 0.45], [0, 1], [1, 0.4], [1, 0.75], [1, 1], [2, 0]];
const REVEAL1 = [[0, 0.3], [0, 0.5], [0, 0.7], [0, 0.85], [0, 1], [1, 0]];
const DEF_C = '#ff95f3';                 // 그려 둔 글씨 색 (분홍)
const COLORS = ['#ff95f3', '#ff4d6d', '#ff9f1c', '#ffd60a', '#52b788', '#4cc9f0', '#4361ee', '#9d4edd', '#ffffff', '#111111'];

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function chars(t) { return Array.from(String(t || '').replace(/\s+/g, ' ').trim()); }
function cleanT(t) { return chars(t).slice(0, 2).join(''); }
function cleanC(c) { c = String(c || '').trim(); return /^#[0-9a-fA-F]{6}$/.test(c) ? c.toLowerCase() : DEF_C; }
function rgb(c) { c = cleanC(c); return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function baseUrl() { return ((window.DOT2 && window.DOT2[BASE]) ? 'dot2/' : 'dot/') + BASE + '.png'; }

// ==========================================
// 글씨 한 벌 — 그림 점 크기로 깎은 글씨 (투명 바탕 · 고른 색)
// ==========================================
function bitmap(t, color) {
    const w = 64, h = 40;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const n = chars(t).length;
    let fs = n <= 1 ? 26 : 20;
    const FONT = function (px) { return '900 ' + px + 'px "Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic","Nanum Gothic","Noto Sans CJK KR",sans-serif'; };
    g.font = FONT(fs);
    const mw = g.measureText(t).width;
    if (mw > MAXW) { fs = Math.max(10, Math.floor(fs * MAXW / mw)); g.font = FONT(fs); }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#000';
    g.fillText(t, w / 2, h / 2 + 1);
    const id = g.getImageData(0, 0, w, h), a = id.data, col = rgb(color);
    let x0 = w, x1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (a[i + 3] >= 110) { a[i] = col[0]; a[i + 1] = col[1]; a[i + 2] = col[2]; a[i + 3] = 255; if (x < x0) x0 = x; if (x > x1) x1 = x; }
        else a[i + 3] = 0;
    }
    g.putImageData(id, 0, 0);
    // 글자마다 자리 — 둘째 글자가 시작하는 곳(split)과 글자마다 위아래 끝
    const cs = chars(t);
    let split = w;
    if (cs.length > 1) {
        const wa = g.measureText(t).width, w1 = g.measureText(cs[0]).width;
        split = Math.round(w / 2 - wa / 2 + w1);
    }
    const ys = [[h, -1], [h, -1]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!a[(y * w + x) * 4 + 3]) continue;
        const k = x < split ? 0 : 1;
        if (y < ys[k][0]) ys[k][0] = y;
        if (y > ys[k][1]) ys[k][1] = y;
    }
    return { c: c, w: w, h: h, x0: x0, x1: x1, n: cs.length, split: split, ys: ys };
}
// 써 내려간 만큼만 남긴 글씨 — 앞 글자들은 다, idx 째 글자는 위에서부터 frac 만큼
function partOf(bm, step) {
    const idx = step[0], frac = step[1];
    if (idx >= bm.n || bm.x1 < bm.x0) return bm.c;
    const c = document.createElement('canvas');
    c.width = bm.w; c.height = bm.h;
    const g = c.getContext('2d');
    const L = idx === 0 ? 0 : bm.split, R = idx === 0 ? Math.min(bm.split, bm.w) : bm.w;
    if (L > 0) g.drawImage(bm.c, 0, 0, L, bm.h, 0, 0, L, bm.h);              // 앞 글자
    const yr = bm.ys[idx] || [0, bm.h - 1];
    const cut = yr[1] < yr[0] ? 0 : Math.ceil(yr[0] + (yr[1] - yr[0] + 1) * frac);
    if (cut > 0 && R > L) g.drawImage(bm.c, L, 0, R - L, cut, L, 0, R - L, cut);
    return c;
}
function steps(bm) { return bm.n > 1 ? REVEAL2 : REVEAL1; }
// 한 칸에 글씨를 그린다 — g: 장 캔버스, s: 장 배율(원본 1 · 절반 0.5), f: 칸 번호, flip: 짝(-r)
function drawCell(g, s, f, part, bm, flip) {
    const ox = f * CW * s, oy = ROW * CH * s;
    const left = Math.round((CX - bm.w / 2 * ART) / ART) * ART;
    const top = Math.round((CY - bm.h / 2 * ART) / ART) * ART;
    g.save();
    g.imageSmoothingEnabled = false;
    if (flip) {
        g.translate(ox + AXIS * s, oy);
        g.scale(-1, 1);
        g.drawImage(part, left * s, top * s, bm.w * ART * s, bm.h * ART * s);
    } else {
        g.drawImage(part, ox + left * s, oy + top * s, bm.w * ART * s, bm.h * ART * s);
    }
    g.restore();
}

// ==========================================
// 장 만들기 · 쟁여 두기
// ==========================================
const cache = {};          // key → 주소
const busy = {};           // key → [기다리는 함수]
const imgs = {};           // 바탕 주소 → Image
let made = 0;
function keyOf(sheet, nw, hue) { return sheet + '|' + cleanT(nw.t) + '|' + cleanC(nw.c) + '|' + (hue == null ? '' : hue); }
function loadImg(url) {
    if (imgs[url]) return imgs[url];
    imgs[url] = new Promise(function (res, rej) {
        const im = new Image();
        im.onload = function () { res(im); };
        im.onerror = function () { delete imgs[url]; rej(new Error('바탕 그림을 못 받았습니다 — ' + url)); };
        im.src = url;
    });
    return imgs[url];
}
// 바탕 — 물들였으면 물든 바탕 (다 될 때까지 기다린다 · 10초 넘으면 안 물든 바탕)
function baseFor(hue) {
    if (hue == null || hue === '' || typeof window.dotTint !== 'function') return Promise.resolve(baseUrl());
    return new Promise(function (res) {
        const t0 = Date.now();
        const look = function () {
            let u = null;
            try { u = window.dotTint(BASE, hue); } catch (e) { }
            if (u) return res(u);
            if (Date.now() - t0 > 10000) return res(baseUrl());
            setTimeout(look, 150);
        };
        look();
    });
}
function make(sheet, nw, hue) {
    const k = keyOf(sheet, nw, hue);
    if (cache[k]) return Promise.resolve(cache[k]);
    if (busy[k]) return new Promise(function (res) { busy[k].push(res); });
    busy[k] = [];
    const t = cleanT(nw.t), c = cleanC(nw.c), flip = /-r$/.test(sheet);
    return baseFor(hue).then(loadImg).then(function (im) {
        const s = im.naturalWidth / SW;
        const cv = document.createElement('canvas');
        cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        const g = cv.getContext('2d');
        g.drawImage(im, 0, 0);
        const bm = bitmap(t, c);
        steps(bm).forEach(function (st, f) { drawCell(g, s, f, partOf(bm, st), bm, flip); });
        return new Promise(function (res) {
            const done = function (url) { cache[k] = url; made++; res(url); };
            try {
                cv.toBlob(function (b) { done(b ? URL.createObjectURL(b) : cv.toDataURL('image/png')); }, 'image/png');
            } catch (e) { done(cv.toDataURL('image/png')); }
        });
    }).then(function (url) {
        const w = busy[k] || []; delete busy[k];
        w.forEach(function (f) { f(url); });
        return url;
    }).catch(function (e) {
        console.warn('[착한 친구 글씨]', e);
        const w = busy[k] || []; delete busy[k];
        w.forEach(function (f) { f(null); });
        return null;
    });
}

// closet.js 가 층을 깔 때 부른다 — 쟁여 둔 것이 있으면 바로, 없으면 글씨 없는 바탕을 깔아 두었다가 갈아 낀다
window.nuowTextPut = function (el, sheet, nw) {
    if (!el || !nw || !cleanT(nw.t)) return;
    const hue = (el.dataset.hue != null && el.dataset.hue !== '') ? el.dataset.hue : null;
    const k = keyOf(sheet, nw, hue);
    el.dataset.nwk = k;
    if (cache[k]) { el.style.backgroundImage = 'url("' + cache[k] + '")'; return; }
    el.style.backgroundImage = 'url("' + baseUrl() + '")';
    make(sheet, nw, hue).then(function (url) {
        if (!url) return;
        Array.prototype.forEach.call(document.querySelectorAll('.dot-layer[data-nwk]'), function (e) {
            if (e.dataset.nwk === k) e.style.backgroundImage = 'url("' + url + '")';
        });
    });
};
// 물든 장이 늦게 다 되면 closet.js 가 원래 장(그려 둔 글씨)으로 갈아 끼운다 — 그 뒤에 다시 내 글씨로
if (typeof window.dotTintOn === 'function') {
    window.dotTintOn(function (sheet) {
        if (sheet !== 'nuow-friend' && sheet !== 'nuow-friend-r') return;
        Array.prototype.forEach.call(document.querySelectorAll('.dot-layer[data-nwk]'), function (e) {
            const url = cache[e.dataset.nwk];
            if (url) e.style.backgroundImage = 'url("' + url + '")';
        });
    });
}

// ==========================================
// 토끼를 누르면 — 광장의 내 사람 (plaza.js 가 톡 친 자리를 묻는다)
// ==========================================
//   토끼는 큰 칸(480×576)의 왼쪽 아래 — 서 있을 때 앉아 쓰는 자리. 걸을 때도 대개 그 둘레다.
const HIT = { x0: 196, x1: 314, y0: 430, y1: 576 };
function myFriendLayer() {
    const u = u_();
    if (!u || typeof window.plazaOneOf !== 'function') return null;
    const o = window.plazaOneOf(u.code);
    if (!o || !o.wrap) return null;
    const els = o.wrap.querySelectorAll('.dot-layer[data-sheet="nuow-friend"]');
    for (let i = 0; i < els.length; i++) if (els[i].style.display !== 'none') return els[i];
    return null;
}
window.nuowTap = function (cx, cy) {
    const el = myFriendLayer();
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const box = el.closest('.dot-box');
    const flip = !!(box && /scaleX\(-1\)/.test(box.style.transform || ''));
    const x = (flip ? (r.right - cx) : (cx - r.left)) / r.width * CW;
    const y = (cy - r.top) / r.height * CH;
    if (x < HIT.x0 || x > HIT.x1 || y < HIT.y0 || y > HIT.y1) return false;
    window.nuowTextOpen();
    return true;
};

// ==========================================
// 고르는 창
// ==========================================
(function css() {
    if (document.getElementById('nw-css')) return;
    const s = document.createElement('style');
    s.id = 'nw-css';
    s.textContent = [
        '#nw-ov{position:fixed;inset:0;z-index:9999992;display:flex;align-items:center;justify-content:center;background:rgba(4,4,8,.72);padding:12px;}',
        '#nw-ov .nw-card{width:min(92vw,340px);background:linear-gradient(180deg,#1d1a26,#0f0d14);border:1px solid #4a3f5a;border-radius:16px;padding:14px;color:#e8e0d0;font-size:12.5px;display:flex;flex-direction:column;gap:11px;}',
        '#nw-ov h3{margin:0;font-size:15px;color:#ffe3f8;display:flex;align-items:center;gap:8px;}',
        '#nw-ov h3 button{margin-left:auto;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid #4a3f5a;color:#ddd;cursor:pointer;}',
        '#nw-ov canvas{display:block;margin:0 auto;background:#3a3550;border-radius:12px;image-rendering:pixelated;width:210px;height:180px;}',
        '#nw-ov .nw-row{display:flex;align-items:center;gap:8px;}',
        '#nw-ov .nw-row label{width:34px;font-size:11.5px;color:#b9b0a0;flex:none;}',
        '#nw-ov input[type=text]{flex:1;min-width:0;padding:9px 10px;border-radius:10px;border:1px solid #4a3f5a;background:#100e15;color:#fff;font-size:16px;text-align:center;letter-spacing:4px;}',
        '#nw-ov .nw-sw{display:flex;flex-wrap:wrap;gap:6px;flex:1;}',
        '#nw-ov .nw-sw button{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;}',
        '#nw-ov .nw-sw button.on{border-color:#fff;box-shadow:0 0 0 2px #d9a94a;}',
        '#nw-ov .nw-sw input[type=color]{width:30px;height:28px;border:none;background:none;padding:0;cursor:pointer;}',
        '#nw-ov .nw-sub{font-size:10.5px;color:#8f8778;text-align:center;}',
        '#nw-ov .nw-btns{display:flex;gap:8px;justify-content:center;}',
        '#nw-ov .nw-btns button{padding:9px 14px;border-radius:10px;border:1px solid #4a3f5a;background:#262030;color:#e8e0d0;font-weight:bold;cursor:pointer;}',
        '#nw-ov .nw-btns button.go{background:linear-gradient(145deg,#ff9fe9,#c85fb5);color:#2a0a24;border-color:#ffc6f2;}'
    ].join('\n');
    document.head.appendChild(s);
})();
function wearing() {
    const u = u_();
    if (!u || !u.dot) return false;
    try { const L = window.dotLook(u); return (L.tops || []).indexOf('nuow-friend') >= 0; } catch (e) { return false; }
}
let pv = { t: '', c: DEF_C };
window.nuowTextOpen = function () {
    const u = u_(); if (!u) return;
    if (!wearing()) { try { showCustomAlert('Null Owner 악세를 하고 있을 때만 고를 수 있습니다.'); } catch (e) { } return; }
    const nw = (u.dot && u.dot.nw) || null;
    pv = { t: nw ? cleanT(nw.t) : '', c: nw ? cleanC(nw.c) : DEF_C };
    let ov = document.getElementById('nw-ov');
    if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'nw-ov';
    ov.innerHTML = '<div class="nw-card"><h3>🐰 말풍선 글씨<button id="nw-x">✕</button></h3>'
        + '<canvas id="nw-pv" width="105" height="90"></canvas>'
        + '<div class="nw-row"><label>글씨</label><input type="text" id="nw-t" maxlength="2" placeholder="두 글자" value="' + esc(pv.t) + '" autocomplete="off"></div>'
        + '<div class="nw-row"><label>색</label><div class="nw-sw">' + COLORS.map(function (c) { return '<button data-c="' + c + '" style="background:' + c + ';"></button>'; }).join('')
        + '<input type="color" id="nw-c" value="' + esc(pv.c) + '"></div></div>'
        + '<div class="nw-sub">두 글자까지 · 비우고 저장하면 원래 글씨로 돌아갑니다</div>'
        + '<div class="nw-btns"><button id="nw-def">원래대로</button><button class="go" id="nw-ok">저장</button></div></div>';
    document.body.appendChild(ov);
    ['pointerdown', 'keydown', 'keyup'].forEach(function (ev) { ov.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    const inp = ov.querySelector('#nw-t');
    let comp = false;
    inp.addEventListener('compositionstart', function () { comp = true; });
    inp.addEventListener('compositionend', function () { comp = false; fix(); });
    inp.addEventListener('input', function () { if (!comp) fix(); else { pv.t = cleanT(inp.value); paintPv(); } });
    function fix() { const v = cleanT(inp.value); if (inp.value !== v) inp.value = v; pv.t = v; paintPv(); }
    Array.prototype.forEach.call(ov.querySelectorAll('.nw-sw button'), function (b) {
        b.onclick = function () { pv.c = b.getAttribute('data-c'); ov.querySelector('#nw-c').value = pv.c; markSw(); paintPv(); };
    });
    ov.querySelector('#nw-c').addEventListener('input', function () { pv.c = cleanC(this.value); markSw(); paintPv(); });
    ov.querySelector('#nw-x').onclick = close;
    ov.querySelector('#nw-def').onclick = function () { save(null); };
    ov.querySelector('#nw-ok').onclick = function () { pv.t = cleanT(inp.value); save(pv.t ? { t: pv.t, c: pv.c } : null); };
    markSw();
    paintPv();
};
function close() { const ov = document.getElementById('nw-ov'); if (ov) ov.remove(); }
function markSw() {
    Array.prototype.forEach.call(document.querySelectorAll('#nw-ov .nw-sw button'), function (b) { b.classList.toggle('on', b.getAttribute('data-c') === pv.c); });
}
// 미리 보기 — 다 써진 칸(여섯째)을 말풍선 둘레만 잘라 그린다
function paintPv() {
    const cv = document.getElementById('nw-pv'); if (!cv) return;
    const want = pv.t + '|' + pv.c;
    cv._want = want;
    const src = pv.t ? baseUrl() : (((window.DOT2 && window.DOT2['nuow-friend']) ? 'dot2/' : 'dot/') + 'nuow-friend.png');   // 비었으면 원래 글씨
    loadImg(src).then(function (im) {
        if (cv._want !== want) return;
        const s = im.naturalWidth / SW;
        const g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, cv.width, cv.height);
        // 칸 (여섯째 줄 · 여섯째 칸) 가운데 말풍선 · 토끼 자리 — 칸 좌표 (20, 216) ~ (440, 576) 를 (105, 90) 에 (점 하나 = 원본 4px)
        const sx = 5 * CW + 20, sy = ROW * CH + 216;
        const tmp = document.createElement('canvas');
        tmp.width = Math.round(420 * s); tmp.height = Math.round(360 * s);
        const tg = tmp.getContext('2d');
        tg.imageSmoothingEnabled = false;
        tg.drawImage(im, sx * s, sy * s, 420 * s, 360 * s, 0, 0, 420 * s, 360 * s);
        if (pv.t) {
            const bm = bitmap(pv.t, pv.c);
            // drawCell 과 같은 자리 — 첫 칸(f 0)으로 그리되, 잘라 낸 자리만큼 옮긴다
            tg.save();
            tg.translate(-20 * s, -(216 + ROW * CH) * s);
            drawCell(tg, s, 0, bm.c, bm, false);
            tg.restore();
        }
        g.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, cv.width, cv.height);
    }).catch(function () { });
}
function save(nw) {
    const u = u_(); if (!u) return;
    if (!u.dot || typeof u.dot !== 'object') { close(); return; }
    if (nw) u.dot.nw = { t: cleanT(nw.t), c: cleanC(nw.c) };
    else delete u.dot.nw;
    try { if (typeof saveFields === 'function') saveFields({ dot: 1 }); } catch (e) { }
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    close();
    try { if (typeof showCustomAlert === 'function') showCustomAlert(nw ? '🐰 말풍선 글씨를 「' + u.dot.nw.t + '」(으)로 바꿨습니다.' : '🐰 말풍선 글씨를 원래대로 돌렸습니다.'); } catch (e) { }
}

window.nuowTextState = function () {
    const u = u_();
    console.log('[착한 친구 글씨] 지금', JSON.stringify((u && u.dot && u.dot.nw) || null), '· 하고 있음', wearing(), '· 만든 장', made, '· 쟁여 둔 것', Object.keys(cache));
};
})();
