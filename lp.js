// ==========================================
// ★ 💿 LP 판 — 광장에서 피아노 · 디스코 (2026-10-23)
// bundles.json 마지막 묶음 (closet.js · plaza.js · pen.js 뒤)
// ==========================================
//
// ■ 무엇인가
//
//   옷장 악세 「LP 판」(사운드 세트 — 상담사가 선물함으로 보내 준 사람만 · wear-gift.js)을 달고
//   광장에 서면 오른쪽 아래(유리 펜 단추 자리 · 펜도 달았으면 그 위)에 **LP 단추**가 뜬다.
//   단추 그림은 받은 LP 그림의 1번 칸(바닥에 놓인 판)이다.
//   누르면 두 단추가 나온다.
//
//     🎹 피아노   높은음자리표(가온 다 C4 ~ C5)를 기본으로 한 옥타브 건반. 위 · 아래로 한 옥타브씩 옮긴다
//                 (C3 ~ C6). 누른 음은 같은 방 사람들에게도 들린다 (plazaNote/<방> · 3초 뒤 지운다).
//     🪩 디스코   스무 가지 색 가운데 넷까지 골라 켜면 방 화면이 클럽 조명으로 바뀐다 (같은 방 사람들 화면도).
//                 끌 때까지 켜져 있다 · LP 판을 빼거나 광장을 닫으면 꺼진다.
//
//   ★ 높은음자리표 · 음표 효과(sound-lp-fx)는 **LP 단추를 누른 동안만** 둘레에 뜬다 —
//     단추 칸 · 피아노 · 디스코 창이 열려 있거나 디스코가 켜져 있을 때. 다 닫으면 걷힌다.
//     효과와 조명은 광장 자리 기록(fx · ds)에 실려 같은 방 사람들 화면에도 뜬다 (plaza.js).
//
// ■ 콘솔
//   lpState()
(function lpBoard() {
'use strict';

const LP = {
    ID: 'sound-lp',
    FX: 'sound-lp-fx',
    ICON: 'dot/sound-lp-icon.png',
    NOTE: 'plazaNote',
    NOTE_LIFE: 3000,
    POLL: 400,
    BASE: 60                  // 가온 다 (C4) — 높은음자리표의 아래 덧줄
};
// 디스코 색 스무 가지
const COLORS = [
    ['빨강', '#ff2d55'], ['주황', '#ff7a00'], ['노랑', '#ffd400'], ['연두', '#9dff00'], ['초록', '#00e676'],
    ['민트', '#00ffc8'], ['하늘', '#00c8ff'], ['파랑', '#2979ff'], ['남색', '#3d3dff'], ['보라', '#9b30ff'],
    ['자홍', '#ff00d4'], ['분홍', '#ff6eb4'], ['핫핑크', '#ff1493'], ['라벤더', '#c39bff'], ['금색', '#ffc94d'],
    ['은색', '#dfe6ee'], ['흰색', '#ffffff'], ['청록', '#00b3a4'], ['산호', '#ff6f61'], ['네온', '#39ff14']
];
const MAX_COL = 4;
const NAMES = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시'];
const OCT_NAME = { '-1': '낮은 옥타브 (C3)', '0': '높은음자리표 (C4)', '1': '높은 옥타브 (C5)' };

const S = { btn: null, menu: null, piano: null, disco: null, oct: 0, pick: [], on: false,
            seat: null, ref: null, onAdd: null, mine: {}, ctx: null };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database && database.ref) ? database : null; }
function now() { return (typeof window.serverNow === 'function') ? window.serverNow() : Date.now(); }
function stage() { try { return (typeof window.plazaStage === 'function') ? window.plazaStage() : null; } catch (e) { return null; } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function toast(t) {
    let el = document.getElementById('lp-toast');
    const ov = document.getElementById('plaza-ov');
    if (!ov) return;
    if (!el) { el = document.createElement('div'); el.id = 'lp-toast'; ov.appendChild(el); }
    el.textContent = t; el.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('on'); }, 1600);
}

// LP 판을 달았나 — 옷장이 거른 뒤의 것으로 본다 (못 가진 것은 빠진다)
function worn() {
    const u = u_();
    if (!u || typeof window.dotLook !== 'function') return false;
    try {
        const L = window.dotLook(u);
        return !!(L && ((L.layers || []).indexOf(LP.ID) >= 0 || (L.tops || []).indexOf(LP.ID) >= 0));
    } catch (e) { return false; }
}

// ==========================================
// 소리 — 피아노 비슷한 소리를 직접 만든다
// ==========================================
function ac() {
    if (S.ctx) { if (S.ctx.state === 'suspended') { try { S.ctx.resume(); } catch (e) { } } return S.ctx; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { S.ctx = new C(); } catch (e) { return null; }
    return S.ctx;
}
['pointerdown', 'touchend', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (S.ctx && S.ctx.state === 'suspended') { try { S.ctx.resume(); } catch (e) { } } }, { passive: true });
});
function play(midi, vol) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const v = (vol == null ? 0.32 : vol);
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(v, t + 0.008);
    out.gain.exponentialRampToValueAtTime(v * 0.32, t + 0.28);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = Math.min(9000, f * 9); lp.Q.value = 0.4;
    lp.connect(out); out.connect(c.destination);
    [[1, 'triangle', 1], [2, 'sine', 0.35], [3, 'sine', 0.12], [0.5, 'sine', 0.08]].forEach(function (h) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = h[1]; o.frequency.value = f * h[0];
        g.gain.value = h[2];
        o.connect(g); g.connect(lp);
        o.start(t); o.stop(t + 1.9);
    });
}

// ==========================================
// 같은 방에 들려주기 — plazaNote/<방>/<열쇠> = { by, m, at }
// ==========================================
function listen(seat) {
    unlisten();
    const d = db_();
    if (!d || !seat) return;
    S.seat = seat;
    S.ref = d.ref(LP.NOTE + '/' + seat);
    S.onAdd = function (snap) {
        const v = snap.val();
        const u = u_();
        if (!v || !u || v.by === u.code) return;
        if (now() - (Number(v.at) || 0) > LP.NOTE_LIFE) return;              // 묵은 음은 안 낸다
        const m = Number(v.m);
        if (!(m >= 36 && m <= 96)) return;
        play(m, 0.2);
    };
    S.ref.on('child_added', S.onAdd);
}
function unlisten() {
    if (S.ref && S.onAdd) { try { S.ref.off('child_added', S.onAdd); } catch (e) { } }
    S.ref = null; S.onAdd = null; S.seat = null;
}
function send(midi) {
    const d = db_(), u = u_(), st = stage();
    if (!d || !u || !st || !st.seat) return;
    try {
        const r = d.ref(LP.NOTE + '/' + st.seat).push({ by: u.code, m: midi, at: now() });
        setTimeout(function () { try { r.remove(); } catch (e) { } }, LP.NOTE_LIFE);
    } catch (e) { }
}

// ==========================================
// 모양
// ==========================================
(function css() {
    if (document.getElementById('lp-css')) return;
    const st = document.createElement('style');
    st.id = 'lp-css';
    st.textContent = [
        '#lp-btn{position:absolute;right:12px;z-index:51;width:66px;height:44px;padding:0;display:none;',
        '  align-items:center;justify-content:center;border-radius:22px;cursor:pointer;',
        '  background:rgba(12,10,24,.7);border:1px solid rgba(170,160,255,.45);box-shadow:0 2px 10px rgba(0,0,0,.35);',
        '  touch-action:none;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
        '#lp-btn.show{display:flex;}',
        '#lp-btn img{width:52px;image-rendering:pixelated;pointer-events:none;filter:drop-shadow(0 0 3px rgba(170,160,255,.6));}',
        '#lp-btn:active{transform:scale(.94);}',
        '#lp-btn.on{background:rgba(48,36,96,.85);border-color:#c3b8ff;box-shadow:0 0 14px rgba(170,150,255,.7);}',
        '#lp-menu{position:absolute;right:86px;z-index:52;display:flex;gap:8px;}',
        '#lp-menu button{font:inherit;font-size:12px;padding:9px 13px;border-radius:999px;cursor:pointer;color:#efeaff;',
        '  background:rgba(22,16,44,.92);border:1px solid rgba(170,160,255,.5);box-shadow:0 2px 10px rgba(0,0,0,.4);white-space:nowrap;}',
        '#lp-menu button.on{background:rgba(70,52,140,.95);border-color:#d6ceff;}',
        // 아래에서 올라오는 판 — 피아노 · 디스코
        '.lp-sheet{position:absolute;left:0;right:0;bottom:0;z-index:53;padding:10px 10px calc(env(safe-area-inset-bottom,0px) + 12px);',
        '  background:rgba(14,11,28,.96);border-top:1px solid rgba(170,160,255,.4);box-shadow:0 -6px 22px rgba(0,0,0,.5);',
        '  color:#efeaff;user-select:none;-webkit-user-select:none;touch-action:none;}',
        '.lp-sheet .lp-h{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;white-space:nowrap;}',
        '.lp-sheet .lp-h > *{flex:0 0 auto;}',
        '.lp-sheet .lp-oct{min-width:118px;text-align:center;color:#c3b8ff;font-size:11.5px;}',
        '.lp-sheet .lp-h b{font-size:13px;color:#d6ceff;}',
        '.lp-sheet .lp-h .sp{flex:1 1 auto;}',
        '.lp-sheet .lp-h button{font:inherit;font-size:12px;padding:6px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;',
        '  color:#efeaff;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);}',
        '.lp-sheet .lp-h button:disabled{opacity:.35;cursor:default;}',
        '.lp-sheet .lp-clef{font-size:22px;line-height:1;color:#c3b8ff;}',
        // 건반
        '.lp-keys{position:relative;height:150px;display:flex;}',
        '.lp-keys .w{flex:1;position:relative;margin:0 1px;border-radius:0 0 7px 7px;background:linear-gradient(#fbfaff,#e4e0f2);',
        '  border:1px solid #888;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px;',
        '  font-size:10px;color:#6a6488;box-sizing:border-box;}',
        '.lp-keys .w.dn{background:linear-gradient(#d9d2ff,#b6a9f5);}',
        '.lp-keys .w.c0{color:#4b3fa0;font-weight:bold;}',
        '.lp-keys .b{position:absolute;top:0;height:92px;z-index:2;border-radius:0 0 5px 5px;',
        '  background:linear-gradient(#2c2840,#0d0b16);border:1px solid #000;box-sizing:border-box;}',
        '.lp-keys .b.dn{background:linear-gradient(#5a4aa8,#2d2260);}',
        // 디스코
        '.lp-cols{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;}',
        '.lp-cols button{position:relative;aspect-ratio:1;border-radius:50%;cursor:pointer;padding:0;',
        '  border:2px solid rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);}',
        '.lp-cols button.on{border-color:#fff;box-shadow:0 0 10px currentColor;}',
        '.lp-cols button i{position:absolute;right:-4px;top:-4px;min-width:15px;height:15px;border-radius:8px;background:#fff;',
        '  color:#1a1430;font-size:9px;font-style:normal;font-weight:bold;line-height:15px;text-align:center;}',
        '.lp-mix{margin-top:10px;height:18px;border-radius:9px;border:1px solid rgba(255,255,255,.15);}',
        '.lp-tip{margin-top:8px;font-size:10.5px;color:#a69ec6;text-align:center;}',
        '#lp-toast{position:absolute;left:50%;bottom:210px;transform:translateX(-50%);z-index:56;padding:8px 14px;border-radius:999px;',
        '  background:rgba(14,11,28,.92);border:1px solid rgba(170,160,255,.4);color:#efeaff;font-size:12px;opacity:0;',
        '  transition:opacity .2s;pointer-events:none;white-space:nowrap;}',
        '#lp-toast.on{opacity:1;}'
    ].join('\n');
    document.head.appendChild(st);
})();

function keep(el) {
    ['pointerdown', 'pointerup', 'click', 'touchstart'].forEach(function (ev) {
        el.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: ev !== 'click' });
    });
}

// ==========================================
// 단추 · 고르는 칸
// ==========================================
function ensureBtn(ov) {
    if (S.btn && S.btn.isConnected && S.btn.parentNode === ov) return S.btn;
    const b = document.createElement('button');
    b.id = 'lp-btn';
    b.className = 'plaza-keep';
    b.title = 'LP 판';
    b.innerHTML = '<img src="' + LP.ICON + '" alt="LP 판">';
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    b.addEventListener('click', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (S.menu) closeMenu(); else openMenu();
    });
    ov.appendChild(b);
    S.btn = b;
    return b;
}
function placeBtn(ov, b) {
    const ob = ov.getBoundingClientRect();
    const map = document.getElementById('plaza-map');
    let bottom = 86;
    if (map && !map.classList.contains('off') && map.offsetParent !== null) bottom = ob.bottom - map.getBoundingClientRect().top + 8;
    else {
        const bar = document.getElementById('plaza-bar');
        if (bar && bar.offsetParent !== null) bottom = ob.bottom - bar.getBoundingClientRect().top + 12;
    }
    // 유리 펜 단추가 떠 있으면 그 위로
    const pen = document.getElementById('pen-btn');
    if (pen && pen.classList.contains('show') && pen.parentNode === ov) bottom += 56;
    // 피아노 · 디스코 판이 열려 있으면 그 위로
    const sh = S.piano || S.disco;
    if (sh && sh.isConnected) bottom = Math.max(bottom, sh.offsetHeight + 10);
    const v = Math.round(bottom) + 'px';
    if (b.style.bottom !== v) b.style.bottom = v;
    if (S.menu) {
        const mv = Math.round(bottom + 4) + 'px';
        if (S.menu.style.bottom !== mv) S.menu.style.bottom = mv;
    }
}
function openMenu() {
    const st = stage();
    if (!st || !st.ov) return;
    closeMenu();
    const m = document.createElement('div');
    m.id = 'lp-menu';
    m.className = 'plaza-keep';
    m.innerHTML = '<button class="plaza-keep" data-k="piano">🎹 피아노</button><button class="plaza-keep" data-k="disco">🪩 디스코</button>';
    keep(m);
    m.addEventListener('click', function (e) {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.k === 'piano') { if (S.piano) closePiano(); else openPiano(); }
        else { if (S.disco) closeDisco(); else openDisco(); }
        paintMenu();
    });
    st.ov.appendChild(m);
    S.menu = m;
    paintMenu();
    fxSync();
    if (S.btn) placeBtn(st.ov, S.btn);
}
function paintMenu() {
    if (!S.menu) return;
    const p = S.menu.querySelector('[data-k="piano"]'), d = S.menu.querySelector('[data-k="disco"]');
    if (p) p.classList.toggle('on', !!S.piano);
    if (d) { d.classList.toggle('on', !!S.disco || S.on); d.textContent = '🪩 디스코' + (S.on ? ' · 켜짐' : ''); }
}
function closeMenu() {
    if (S.menu) S.menu.remove();
    S.menu = null;
    closePiano(true); closeDisco(true);
    fxSync();
}

// ==========================================
// 🎹 피아노
// ==========================================
function openPiano() {
    const st = stage();
    if (!st || !st.ov) return;
    closeDisco(true);
    ac();
    const p = document.createElement('div');
    p.id = 'lp-piano';
    p.className = 'lp-sheet plaza-keep';
    p.innerHTML = '<div class="lp-h"><span class="lp-clef">𝄞</span><b>피아노</b><span class="sp"></span>'
        + '<button class="plaza-keep" data-o="-1" title="한 옥타브 아래">▼</button><span class="lp-oct"></span>'
        + '<button class="plaza-keep" data-o="1" title="한 옥타브 위">▲</button><span class="sp"></span>'
        + '<button class="plaza-keep" data-x="1">닫기</button></div><div class="lp-keys"></div>';
    keep(p);
    st.ov.appendChild(p);
    S.piano = p;
    p.querySelector('.lp-h').addEventListener('click', function (e) {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.x) { closePiano(); paintMenu(); return; }
        S.oct = Math.max(-1, Math.min(1, S.oct + Number(b.dataset.o)));
        paintKeys();
    });
    paintKeys();
    fxSync();
}
function paintKeys() {
    const p = S.piano; if (!p) return;
    const base = LP.BASE + S.oct * 12;
    p.querySelector('.lp-oct').textContent = OCT_NAME[String(S.oct)];
    p.querySelector('[data-o="-1"]').disabled = S.oct <= -1;
    p.querySelector('[data-o="1"]').disabled = S.oct >= 1;
    const box = p.querySelector('.lp-keys');
    const W = [0, 2, 4, 5, 7, 9, 11, 12];                       // 도 레 미 파 솔 라 시 도
    const B = [[1, 0], [3, 1], [6, 3], [8, 4], [10, 5]];       // 검은 건반 — 몇 번째 흰 건반 오른쪽에
    let h = '';
    W.forEach(function (n, i) {
        h += '<div class="w' + (i === 0 ? ' c0' : '') + '" data-m="' + (base + n) + '">' + NAMES[n % 12] + (n === 0 ? (4 + S.oct) : (n === 12 ? (5 + S.oct) : '')) + '</div>';
    });
    B.forEach(function (x) {
        const left = ((x[1] + 1) / W.length) * 100;
        h += '<div class="b" data-m="' + (base + x[0]) + '" style="left:calc(' + left + '% - ' + (100 / W.length * 0.32) + '%);width:' + (100 / W.length * 0.64) + '%;"></div>';
    });
    box.innerHTML = h;
    if (box._wired) return;
    box._wired = true;
    const down = {};
    const hit = function (e) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        return el && el.closest ? el.closest('.lp-keys [data-m]') : null;
    };
    const press = function (k, id) {
        if (!k) return;
        if (down[id] === k) return;
        if (down[id]) down[id].classList.remove('dn');
        down[id] = k;
        k.classList.add('dn');
        const m = Number(k.dataset.m);
        play(m);
        send(m);
    };
    const lift = function (id) { if (down[id]) { down[id].classList.remove('dn'); delete down[id]; } };
    box.addEventListener('pointerdown', function (e) { e.preventDefault(); try { box.setPointerCapture(e.pointerId); } catch (x) { } press(hit(e), e.pointerId); });
    box.addEventListener('pointermove', function (e) { if (down[e.pointerId]) press(hit(e), e.pointerId); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { box.addEventListener(ev, function (e) { lift(e.pointerId); }); });
}
function closePiano(quiet) {
    if (S.piano) S.piano.remove();
    S.piano = null;
    if (!quiet) fxSync();
}

// ==========================================
// 🪩 디스코
// ==========================================
function openDisco() {
    const st = stage();
    if (!st || !st.ov) return;
    closePiano(true);
    const d = document.createElement('div');
    d.id = 'lp-disco';
    d.className = 'lp-sheet plaza-keep';
    d.innerHTML = '<div class="lp-h"><b>🪩 디스코</b><span class="lp-n" style="overflow:hidden;text-overflow:ellipsis;flex:0 1 auto;min-width:0;color:#c3b8ff;font-size:11px;"></span><span class="sp"></span>'
        + '<button class="plaza-keep lp-go">켜기</button><button class="plaza-keep" data-x="1">닫기</button></div>'
        + '<div class="lp-cols">' + COLORS.map(function (c, i) {
            return '<button class="plaza-keep" data-i="' + i + '" title="' + esc(c[0]) + '" style="background:' + c[1] + ';color:' + c[1] + ';"></button>';
        }).join('') + '</div><div class="lp-mix"></div>'
        + '<div class="lp-tip">스무 가지 색 가운데 ' + MAX_COL + '가지까지 고릅니다. 켜면 같은 방 화면이 다 클럽 조명으로 바뀝니다.</div>';
    keep(d);
    st.ov.appendChild(d);
    S.disco = d;
    d.addEventListener('click', function (e) {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.x) { closeDisco(); paintMenu(); return; }
        if (b.classList.contains('lp-go')) { discoOn(!S.on); return; }
        const i = Number(b.dataset.i);
        const at = S.pick.indexOf(i);
        if (at >= 0) S.pick.splice(at, 1);
        else if (S.pick.length >= MAX_COL) { toast('색은 ' + MAX_COL + '가지까지 고를 수 있습니다'); return; }
        else S.pick.push(i);
        paintDisco();
        if (S.on) { if (S.pick.length) pushDisco(); else discoOn(false); }
    });
    paintDisco();
    fxSync();
}
function cols() { return S.pick.map(function (i) { return COLORS[i][1]; }); }
function paintDisco() {
    const d = S.disco; if (!d) return;
    Array.prototype.forEach.call(d.querySelectorAll('.lp-cols button'), function (b) {
        const at = S.pick.indexOf(Number(b.dataset.i));
        b.classList.toggle('on', at >= 0);
        b.innerHTML = at >= 0 ? '<i>' + (at + 1) + '</i>' : '';
    });
    const c = cols();
    d.querySelector('.lp-n').textContent = c.length ? S.pick.map(function (i) { return COLORS[i][0]; }).join(' · ') : '색을 고르세요';
    d.querySelector('.lp-mix').style.background = c.length ? (c.length === 1 ? c[0] : 'linear-gradient(90deg,' + c.join(',') + ')') : 'transparent';
    const go = d.querySelector('.lp-go');
    go.textContent = S.on ? '끄기' : '켜기';
}
function pushDisco() { if (typeof window.plazaDisco === 'function') window.plazaDisco(S.on ? cols() : null); }
function discoOn(on) {
    if (on && !cols().length) { toast('색을 하나 이상 골라 주세요'); return; }
    S.on = !!on;
    pushDisco();
    paintDisco(); paintMenu();
    fxSync();
    toast(S.on ? '🪩 디스코 조명을 켰습니다' : '디스코 조명을 껐습니다');
}
function closeDisco(quiet) {
    if (S.disco) S.disco.remove();
    S.disco = null;
    if (!quiet) fxSync();
}

// 높은음자리표 · 음표 — LP 단추를 누른 동안만 (칸 · 피아노 · 디스코 창이 열려 있거나 디스코가 켜져 있을 때)
function fxSync() {
    const want = !!(S.menu || S.piano || S.disco || S.on) && worn();
    if (typeof window.plazaFx === 'function') window.plazaFx(want ? LP.FX : null);
    if (S.btn) S.btn.classList.toggle('on', want);
}

// ==========================================
// 돌기
// ==========================================
function tick() {
    const st = stage();
    if (!st || !st.ov) {
        if (S.ref) unlisten();
        S.menu = S.piano = S.disco = null; S.btn = null; S.on = false;
        return;
    }
    if (st.seat !== S.seat) listen(st.seat);               // 남이 친 음은 LP 판이 없어도 듣는다
    const on = worn();
    const b = ensureBtn(st.ov);
    const map = document.getElementById('plaza-map');
    const chatOpen = !!(map && map.classList.contains('off'));
    const show = on && (S.menu || S.piano || S.disco || !chatOpen);
    b.classList.toggle('show', !!show);
    if (show) placeBtn(st.ov, b);
    if (!on && (S.menu || S.piano || S.disco || S.on)) {       // 판을 뺐다 — 다 걷는다
        S.on = false; pushDisco(); closeMenu();
    }
}
setInterval(function () { try { tick(); } catch (e) { } }, LP.POLL);

window.lpState = function () {
    const o = { 달았나: worn(), 단추: !!(S.btn && S.btn.classList.contains('show')), 칸: !!S.menu, 피아노: !!S.piano,
                디스코창: !!S.disco, 디스코: S.on, 색: cols(), 옥타브: S.oct, 방: S.seat };
    console.log('%c===== 💿 LP 판 =====', 'color:#c3b8ff; font-size:13px');
    console.log(o);
    return o;
};
window.lpPlay = function (m) { play(Number(m) || 60); };

})();
