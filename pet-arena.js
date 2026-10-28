// ==========================================
// ★ 펫 배틀 — 광장 연출 · 스킬 팝업 (2026-10-28)
// bundles.json 마지막 묶음 — plaza.js · pet-battle.js 보다 뒤
// ==========================================
//
// ■ 광장에서
//   배틀에 내보낸 펫의 작은 그림(pet/s○○.webp)이 **주인 캐릭터 옆**에 선다 — 양쪽 다, 같은 방에 있는 모두에게 보인다.
//   (펫을 고른 때부터 · 끝나고 몇 초 뒤까지)
//   한 판이 풀려 공격이 들어가면 치는 쪽 펫이 **상대 주인에게 날아가 부딪히고** 돌아온다.
//   맞은 주인은 붉게 번쩍이며 흔들리고 머리 위로 피해 숫자가 뜬다 (막았으면 초록).
//   상대가 같은 방에 없으면 제자리에서 한 번 뛴다.
//
// ■ 스킬 팝업
//   룬 속성 공격이 아니라 **동물 스킬**로 쳤을 때 — 치는 쪽 · 맞는 쪽 둘 다에게 펫의 큰 그림(pet/p○○.webp)이 뜨고
//   「○○이(가) △△의 주인을 문다」 처럼 한 줄 (동사는 pet-trait.js SKILL[].v). 2초쯤 떠 있다 사라진다. 어느 화면에서든.
//
// ■ 어디서 듣나
//   pet-battle.js 가 petBattle 글을 받을 때마다 알려 준다 (PETBATTLE.on). 판이 풀려 기록(log)이 늘어난 만큼만 연출한다 —
//   들어왔을 때 이미 쌓여 있던 기록은 되풀이하지 않는다.
//
// ■ 콘솔
//   petArenaState()

(function petArena() {

const KEEP_AFTER = 4500;          // 끝난 뒤 이만큼 더 세워 둔다
const PET_FRAC = 0.42;            // 펫 키 — 주인 키의 몫
const FLY_MS = 380, BACK_MS = 380;
const POP_MS = 2300;

const pets = {};                  // 주인 사번 → { el, pet, wrap }
const seen = {};                  // 배틀 열쇠 → 본 기록 수
let queue = Promise.resolve();    // 연출은 차례로

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function T() { return window.PETTRAIT; }
function B() { return window.PETBATTLE; }
function userOf(code) { try { return (db && db.users && db.users[code]) || null; } catch (e) { return null; } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function nickOf(code, key) { try { return P().nick(key, userOf(code) || {}); } catch (e) { return (P().BY[key] || {}).n || '펫'; } }
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }
function oneOf(code) { try { return (typeof window.plazaOneOf === 'function') ? window.plazaOneOf(code) : null; } catch (e) { return null; } }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

// ==========================================
// 1. 주인 옆의 펫
// ==========================================
// 지금 세워 둘 펫 — 주인 사번 → 펫 번호
function wanted(live) {
    const out = {};
    const t = Date.now();
    Object.keys(live || {}).forEach(function (k) {
        const o = live[k];
        if (!o || !o.a || !o.b) return;
        const on = ['stake', 'prep', 'fight'].indexOf(o.stage) >= 0 || (o.stage === 'done' && t - Number(o.endAt || 0) < KEEP_AFTER);
        if (!on) return;
        if (o.a.pet) out[o.a.code] = String(o.a.pet);
        if (o.b.pet) out[o.b.code] = String(o.b.pet);
    });
    return out;
}
function place(code, pet) {
    const one = oneOf(code);
    if (!one) { drop(code); return; }
    let s = pets[code];
    if (s && (s.wrap !== one.wrap || s.pet !== pet)) { drop(code); s = null; }
    const hpx = Math.max(18, Math.min(48, Math.round(one.h * PET_FRAC)));
    if (!s) {
        const el = document.createElement('img');
        el.className = 'plaza-pet';
        el.src = P().icon(pet);
        el.alt = '';
        el.style.height = hpx + 'px';
        // 칸(288 도트)은 사람보다 훨씬 넓다 — 사람 몸은 가운데 1/3 쯤. 몸 왼쪽에 바짝 붙인다
        el.style.left = Math.round(one.w * 0.34 - hpx) + 'px';
        el.style.bottom = Math.round(one.foot || 0) + 'px';
        one.wrap.appendChild(el);
        s = pets[code] = { el: el, pet: pet, wrap: one.wrap };
    } else if (s.el.style.height !== hpx + 'px') {
        s.el.style.height = hpx + 'px';
        s.el.style.left = Math.round(one.w * 0.34 - hpx) + 'px';
    }
}
function drop(code) {
    const s = pets[code];
    if (!s) return;
    try { s.el.remove(); } catch (e) { }
    delete pets[code];
}
function refresh(live) {
    const w = wanted(live);
    Object.keys(pets).forEach(function (c) { if (!w[c]) drop(c); });
    Object.keys(w).forEach(function (c) { place(c, w[c]); });
}
let lastLive = {};
setInterval(function () { try { refresh(lastLive); } catch (e) { } }, 1500);   // 방을 옮기거나 사람이 다시 그려져도 따라붙는다

// ==========================================
// 2. 날아가 치기
// ==========================================
function fly(att, def, l) {
    const A = oneOf(att);
    const s = pets[att];
    if (!A || !s || !s.el.parentNode) return Promise.resolve();
    const D = oneOf(def);
    if (!D) {                                            // 상대가 이 방에 없다 — 제자리에서 한 번 뛴다
        s.el.classList.remove('bump'); void s.el.offsetWidth; s.el.classList.add('bump');
        return wait(500);
    }
    const r0 = s.el.getBoundingClientRect(), r1 = D.wrap.getBoundingClientRect();
    const f = document.createElement('img');
    f.className = 'plaza-fly'; f.src = s.el.src; f.alt = '';
    f.style.left = r0.left + 'px'; f.style.top = r0.top + 'px';
    f.style.width = r0.width + 'px'; f.style.height = r0.height + 'px';
    document.body.appendChild(f);
    s.el.style.visibility = 'hidden';
    const tx = r1.left + r1.width / 2 - r0.width / 2, ty = r1.top + r1.height * 0.45;
    requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.left = tx + 'px'; f.style.top = ty + 'px'; }); });
    return wait(FLY_MS).then(function () {
        hit(D.wrap, r1, l);
        f.style.left = r0.left + 'px'; f.style.top = r0.top + 'px';
        return wait(BACK_MS);
    }).then(function () {
        try { f.remove(); } catch (e) { }
        s.el.style.visibility = '';
    });
}
function hit(wrap, r, l) {
    try {
        wrap.classList.remove('hit'); void wrap.offsetWidth; wrap.classList.add('hit');
        setTimeout(function () { try { wrap.classList.remove('hit'); } catch (e) { } }, 520);
    } catch (e) { }
    const d = document.createElement('div');
    d.className = 'plaza-dmg' + (l.blocked ? ' block' : '');
    d.textContent = (l.blocked ? '막았다 ' : '') + '−' + (Number(l.dmg) || 0);
    d.style.left = (r.left + r.width / 2) + 'px';
    d.style.top = Math.max(8, r.top - 6) + 'px';
    document.body.appendChild(d);
    setTimeout(function () { try { d.remove(); } catch (e) { } }, 1200);
}

// ==========================================
// 3. 스킬 팝업 — 치는 쪽 · 맞는 쪽에게
// ==========================================
function popup(o, l) {
    const me = u_();
    if (!me) return Promise.resolve();
    const side = B().side(o, me.code);
    if (!side) return Promise.resolve();
    const att = o[l.who], def = o[B().other(l.who)];
    const sk = T().skill(att.pet) || { n: '몸통 박치기', v: '들이받는다' };
    const an = nickOf(att.code, att.pet), dn = nickOf(def.code, def.pet);
    const old = document.getElementById('plaza-skill-pop');
    if (old) old.remove();
    const w = document.createElement('div');
    w.id = 'plaza-skill-pop';
    w.className = 'plaza-skill';
    w.innerHTML = '<div class="sk"><img src="' + P().img(att.pet) + '" alt="">'
        + '<div class="n">✦ ' + esc(sk.n) + '</div>'
        + '<div class="t">' + esc(an) + josa(an, '이') + ' ' + esc(dn) + '의 주인을 ' + esc(sk.v || '들이받는다') + '</div></div>';
    document.body.appendChild(w);
    return wait(POP_MS).then(function () { try { w.remove(); } catch (e) { } });
}

// ==========================================
// 4. 듣기 — 기록이 늘어난 만큼 연출
// ==========================================
let primed = false;
function onLive(live) {
    lastLive = live || {};
    try { refresh(lastLive); } catch (e) { }
    const B_ = B();
    Object.keys(lastLive).forEach(function (k) {
        const o = lastLive[k];
        if (!o || !o.a || !o.b) return;
        const logs = B_.logs(o);
        if (!primed || seen[k] == null) { seen[k] = logs.length; return; }   // 들어왔을 때 이미 있던 것은 되풀이하지 않는다
        if (logs.length <= seen[k]) return;
        const fresh = logs.slice(seen[k]);
        seen[k] = logs.length;
        fresh.forEach(function (l) {
            queue = queue.then(function () {
                const att = o[l.who] || {}, def = o[B_.other(l.who)] || {};
                if (l.atk === 'skill') popup(o, l);                    // 팝업은 떠 있는 채로 다음 연출로 넘어간다
                return fly(att.code, def.code, l).then(function () { return wait(250); });
            }).catch(function (e) { console.warn('[펫 배틀 연출]', e); });
        });
    });
    // 끝난 글은 잊는다
    Object.keys(seen).forEach(function (k) { if (!lastLive[k]) delete seen[k]; });
    primed = true;
}
(function bind() {
    const iv = setInterval(function () {
        if (!window.PETBATTLE || !window.PET || !window.PETTRAIT) return;
        window.PETBATTLE.on(onLive);
        try { onLive(window.PETBATTLE.all()); } catch (e) { }
        clearInterval(iv);
    }, 800);
})();

window.petArenaState = function () {
    console.log('%c===== ⚔ 펫 배틀 — 광장 연출 =====', 'color:#ffb74d; font-size:13px');
    console.log('  세워 둔 펫:', Object.keys(pets).map(function (c) { return c + ' → ' + pets[c].pet; }).join(', ') || '없음');
    console.log('  본 기록:', JSON.stringify(seen));
};

})();
