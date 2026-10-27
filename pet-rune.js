// ==========================================
// ★ 펫 — 속성 룬 (2026-10-27)
// bundles.json 마지막 묶음 — pet-trait.js 보다 뒤, pet-battle.js 보다 앞
// ==========================================
//
// ■ 룬 다섯 가지 — 애교 · 근력 · 경청 · 인내 · 눈치
//
//   상성은 한 바퀴 돈다 (왼쪽이 오른쪽을 이긴다).
//       애교 > 근력 > 경청 > 인내 > 눈치 > 애교
//
// ■ 어디서 사나
//   망상 홈쇼핑 안 「🐾 펫 숍」 칸. 개당 2,000 P · 종류마다 하루 두 개.
//   산 것은 소지품이 아니라 **룬 주머니**(u.petRune = { 이름: 수 }) 에 들어간다.
//   (먹이 · 돌봄 물품과 같다 — 어둠에 들고 가지지도 팔리지도 않는다. 펫 배틀의 판돈으로는 걸 수 있다)
//
// ■ 펫에게 먹이기
//   펫 하나에 **두 개까지** — 같은 종류 둘도 된다 (pets[번호].runes = ['애교', '근력']).
//   먹인 룬은 그 펫의 공격 · 방어 수단이 된다 (pet-battle.js). 배틀이 끝나면 먹인 룬은 소모된다.
//   펫 칸(🐶 펫 → 펫 하나)에서 「룬 먹이기」, 배틀 준비 화면에서도 먹일 수 있다.
//
// ■ 적히는 자리
//   u.petRune       { 이름: 수 }                룬 주머니
//   u.petRuneDay    { d: 날짜, n: { 이름: 오늘 산 수 } }
//   pets[번호].runes  [이름, 이름]               먹인 룬 (두 개까지)
//
// ■ 콘솔
//   petRuneState()           주머니 · 오늘 산 수 · 펫마다 먹인 룬
//   petRuneGive('애교', 3)   상담사 — 룬 지급 (petRuneGive('애교', 3, 사번) 남에게)

(function petRune() {

const LIST = [
    { n: '애교', e: '💗', d: '맞서는 쪽이 먼저 무너진다. 근력을 이긴다.' },
    { n: '근력', e: '💪', d: '듣고 있을 틈을 주지 않는다. 경청을 이긴다.' },
    { n: '경청', e: '👂', d: '참는 쪽의 숨을 먼저 듣는다. 인내를 이긴다.' },
    { n: '인내', e: '🪨', d: '눈치 보는 쪽이 먼저 지친다. 눈치를 이긴다.' },
    { n: '눈치', e: '👀', d: '애교가 어디로 올지 먼저 안다. 애교를 이긴다.' }
];
const BY = {};
LIST.forEach(function (r) { BY[r.n] = r; });
const BEATS = { '애교': '근력', '근력': '경청', '경청': '인내', '인내': '눈치', '눈치': '애교' };
const PRICE = 2000;
const DAY_MAX = 2;            // 종류마다 하루
const FED_MAX = 2;            // 펫 하나에

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t); }
function log_(t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { } }
function ui() { try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }
function today() { try { return P().today(); } catch (e) { return new Date().toDateString(); } }
function copyFlags(from, to) { Object.keys(from).forEach(function (k) { if (!(k in to)) { try { to[k] = from[k]; } catch (e) { } } }); }
function tag(n) { const r = BY[n]; return r ? r.e + ' ' + r.n : String(n || ''); }
// a 가 b 를 이기나
function beats(a, b) { return !!a && !!b && BEATS[a] === b; }

// ==========================================
// 룬 주머니
// ==========================================
function bag(u) {
    u = u || u_();
    if (!u) return {};
    const v = u.petRune;
    if (Array.isArray(v) || !v || typeof v !== 'object') u.petRune = {};
    return u.petRune;
}
function have(name, u) { return Number(bag(u)[name]) || 0; }
function total(u) { return LIST.reduce(function (a, r) { return a + have(r.n, u); }, 0); }
// 내 주머니 한 칸만 고쳐 쓴다
function add(name, n) {
    const u = u_();
    if (!u || !BY[name]) return 0;
    const b = bag(u);
    const v = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (v) b[name] = v; else delete b[name];
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/petRune/' + name).set(v || null)
                .catch(function (e) { console.warn('[룬] 주머니 저장 실패', e); });
            return v;
        }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ petRune: 1 }); } catch (e) { }
    return v;
}

// 오늘 산 수
function dayBox(u) {
    u = u || u_();
    if (!u) return { d: today(), n: {} };
    let v = u.petRuneDay;
    if (!v || typeof v !== 'object' || v.d !== today()) v = u.petRuneDay = { d: today(), n: {} };
    if (!v.n || typeof v.n !== 'object') v.n = {};
    return v;
}
function boughtToday(name, u) { return Number(dayBox(u).n[name]) || 0; }
function leftToday(name, u) { return Math.max(0, DAY_MAX - boughtToday(name, u)); }

// ==========================================
// 사기
// ==========================================
window.petRuneBuy = function (name) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const u = u_();
    if (!u || !BY[name]) return;
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('격리 중에는 살 수 없습니다.'); return; } } catch (e) { }
    if (leftToday(name, u) <= 0) { alert_(tag(name) + ' 룬은 하루에 ' + DAY_MAX + '개까지입니다.\n자정이 지나면 다시 살 수 있습니다.'); return; }
    if ((Number(u.points) || 0) < PRICE) { alert_('포인트가 모자랍니다.\n\n' + tag(name) + ' 룬 ' + PRICE.toLocaleString() + ' P'); return; }

    u.points = (Number(u.points) || 0) - PRICE;
    const d = dayBox(u);
    d.n[name] = boughtToday(name, u) + 1;
    add(name, 1);
    log_('[망상 홈쇼핑] ' + tag(name) + ' 룬 구입 (-' + PRICE.toLocaleString() + ' P)');
    let wrote = false;
    try {
        if (typeof database !== 'undefined' && database && u.code) { database.ref('users/' + u.code + '/petRuneDay').set(d).catch(function () { }); wrote = true; }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields(wrote ? { points: 1, history: 1 } : { points: 1, history: 1, petRuneDay: 1 }); } catch (e) { }
    ui();
    paint();
};

// ==========================================
// 펫에게 먹이기
// ==========================================
function fed(key, u) {
    const s = P().pets(u)[String(key)];
    const r = s && s.runes;
    if (Array.isArray(r)) return r.filter(function (x) { return BY[x]; }).slice(0, FED_MAX);
    if (r && typeof r === 'object') return Object.keys(r).map(function (k) { return r[k]; }).filter(function (x) { return BY[x]; }).slice(0, FED_MAX);
    return [];
}
// 돌려주는 값 — { ok } 또는 { ok:false, why }
function feed(key, name) {
    const u = u_();
    if (!u) return { ok: false, why: '로그인 전입니다.' };
    const s = P().pets(u)[String(key)];
    if (!s) return { ok: false, why: '아직 없는 펫입니다.' };
    if (!BY[name]) return { ok: false, why: '그런 룬이 없습니다.' };
    if (!have(name, u)) return { ok: false, why: tag(name) + ' 룬이 주머니에 없습니다.' };
    const cur = fed(key, u);
    if (cur.length >= FED_MAX) return { ok: false, why: '룬은 펫 하나에 ' + FED_MAX + '개까지입니다.' };
    add(name, -1);
    const next = cur.concat([name]);
    P().patch(String(key), { runes: next });
    log_('[펫] ' + P().nick(key, u) + '에게 ' + tag(name) + ' 룬을 먹였습니다. (' + next.map(tag).join(' · ') + ')');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    return { ok: true, runes: next };
}
// 먹인 룬을 비운다 (배틀이 끝나면) — 내 펫만
function clear(key) {
    const u = u_();
    if (!u || !P().pets(u)[String(key)]) return;
    P().patch(String(key), { runes: null });
}

// ==========================================
// 룬 먹이기 창
// ==========================================
const MOD = 'pet-rune-modal';
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999996; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09); border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%; max-width:420px; max-height:86dvh; overflow-y:auto; -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}

// 펫 하나에게 — 창을 띄운다. after(runes) 는 먹이고 나서 부른다 (배틀 준비 화면이 쓴다)
window.petRuneFeedOpen = function (key, after) {
    const u = u_();
    if (!u || !P().pets(u)[String(key)]) return;
    const nm = P().nick(key, u);
    const cur = fed(key, u);
    const rows = LIST.map(function (r) {
        const n = have(r.n, u);
        return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0;"><div style="font-size:11.5px; color:#e8d7b4;">' + r.e + ' ' + esc(r.n) + ' <span style="font-size:10px; color:#8d8578;">· 주머니 ' + n + '개</span></div>'
            + '<div style="font-size:9.5px; color:#6f685e; margin-top:2px;">' + esc(r.d) + '</div></div>'
            + '<button class="game-btn rn-feed" data-n="' + esc(r.n) + '"' + ((n > 0 && cur.length < FED_MAX) ? '' : ' disabled')
            + ' style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;' + ((n > 0 && cur.length < FED_MAX) ? '' : ' opacity:.4;') + '">먹인다</button></div>';
    }).join('');
    const w = box('<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">' + esc(nm) + ' — 룬 먹이기</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:9px; line-height:1.6;">펫 하나에 ' + FED_MAX + '개까지 (같은 종류 둘도 됩니다). 먹인 룬이 배틀의 공격 · 방어 수단이 되고, 배틀이 끝나면 소모됩니다.<br>'
        + '상성 — 애교 › 근력 › 경청 › 인내 › 눈치 › 애교</div>'
        + '<div style="font-size:11px; color:#c9a227; margin-bottom:6px;">먹인 룬: ' + (cur.length ? cur.map(tag).join(' · ') : '<span style="color:#6f685e;">없음</span>') + ' <span style="color:#6f685e;">(' + cur.length + '/' + FED_MAX + ')</span></div>'
        + rows
        + '<button id="rn-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">닫는다</button>');
    w.querySelector('#rn-x').onclick = function () { shut(); if (typeof after === 'function') after(fed(key, u)); };
    Array.prototype.forEach.call(w.querySelectorAll('.rn-feed'), function (b) {
        b.onclick = function () {
            const r = feed(key, b.dataset.n);
            if (!r.ok) { alert_(r.why); return; }
            window.petRuneFeedOpen(key, after);
        };
    });
};

// ==========================================
// 망상 홈쇼핑 — 🐾 펫 숍 칸 (집 지킴이 방석 칸 아래)
// ==========================================
function boxHtml() {
    const u = u_();
    return '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">🐾 펫 숍 — 속성 룬</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:8px; line-height:1.55;">펫 배틀에 쓰는 룬입니다. 개당 ' + PRICE.toLocaleString() + ' P · 종류마다 하루 ' + DAY_MAX + '개. 룬 주머니에 들어가고, 펫 칸에서 펫에게 먹입니다 (펫 하나에 ' + FED_MAX + '개까지).<br>'
        + '상성 — 애교 › 근력 › 경청 › 인내 › 눈치 › 애교</div>'
        + LIST.map(function (r) {
            const n = have(r.n, u), left = leftToday(r.n, u);
            return '<div style="display:flex; align-items:center; gap:6px; padding:5px 0; border-top:1px solid rgba(255,255,255,0.05);">'
                + '<div style="flex:1; min-width:0;"><div style="font-size:11px; color:#e8d7b4;">' + r.e + ' ' + esc(r.n) + ' 룬'
                + (n ? ' <span style="color:#9fd8ef;">·' + n + '개</span>' : '') + '</div>'
                + '<div style="font-size:9px; color:#6f685e; margin-top:1px;">' + esc(r.d) + ' · 오늘 ' + left + '개 더</div></div>'
                + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:6px 9px; font-size:10px;' + (left ? '' : ' opacity:.4;') + '"' + (left ? '' : ' disabled')
                + ' onclick="petRuneBuy(\'' + esc(r.n) + '\')">' + PRICE.toLocaleString() + ' P</button></div>';
        }).join('');
}
function paint() {
    const host = document.querySelector('#dream-body') || document.querySelector('#pet-shop-body');
    if (!host || !u_()) return;
    let el = document.getElementById('pet-rune-box');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pet-rune-box';
        el.style.cssText = 'margin-bottom:14px;';
    }
    const stay = document.getElementById('pet-stay-box');
    const med = document.getElementById('pet-med-box');
    const anchor = (stay && stay.parentNode === host) ? stay : ((med && med.parentNode === host) ? med : null);
    if (anchor) { if (anchor.nextSibling !== el) host.insertBefore(el, anchor.nextSibling); }
    else if (el.parentNode !== host || host.firstChild !== el) host.insertBefore(el, host.firstChild);
    const h = boxHtml();
    if (el.innerHTML !== h) el.innerHTML = h;
}
window.petRunePaint = paint;
(function hookShop() {
    const iv = setInterval(function () {
        if (typeof renderDream !== 'function') return;
        if (renderDream._petRune) { clearInterval(iv); return; }
        const _r = renderDream;
        const w = function () {
            const out = _r.apply(this, arguments);
            setTimeout(function () { try { paint(); } catch (e) { } }, 90);
            return out;
        };
        copyFlags(_r, w);
        w._petRune = true;
        renderDream = w; window.renderDream = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () {
    try {
        const panel = document.getElementById('shop-dream');
        if (!panel || !panel.classList.contains('active')) return;
        paint();
    } catch (e) { }
}, 1000);

// ==========================================
// 바깥에 내어 준다
// ==========================================
window.PETRUNE = {
    LIST: LIST, BY: BY, BEATS: BEATS, PRICE: PRICE, DAY_MAX: DAY_MAX, FED_MAX: FED_MAX,
    tag: tag, beats: beats, bag: bag, have: have, total: total, add: add,
    fed: fed, feed: feed, clear: clear, leftToday: leftToday
};

// ==========================================
// 상담사 · 확인
// ==========================================
window.petRuneGive = function (name, n, who) {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!BY[name]) { console.warn('룬은 ' + LIST.map(function (r) { return r.n; }).join(' · ') + ' 가운데 하나입니다.'); return; }
    n = Math.max(1, Number(n) || 1);
    if (!who || who === me.code) { const v = add(name, n); console.log('%c✓ ' + tag(name) + ' 룬 → ' + v + '개', 'color:#4CAF50'); paint(); return; }
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const t = all.filter(function (x) { return x.code === who || String(x.no) === String(who) || x.name === who; })[0];
    if (!t) { console.warn('사원을 못 찾았습니다 —', who); return; }
    try {
        database.ref('users/' + t.code + '/petRune/' + name).transaction(function (c) { return Math.max(0, (Number(c) || 0) + n); })
            .then(function (r) { console.log('%c✓ ' + t.name + ' 사원 ' + tag(name) + ' 룬 → ' + ((r && r.snapshot) ? r.snapshot.val() : '?') + '개', 'color:#4CAF50'); });
    } catch (e) { console.warn('[룬] 지급 실패', e); }
};

window.petRuneState = function () {
    const u = u_();
    console.log('%c===== 🐾 속성 룬 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    console.log('  주머니:', LIST.map(function (r) { return r.e + r.n + ' ' + have(r.n, u); }).join(' · '), '· 오늘 산 것', JSON.stringify(dayBox(u).n));
    const ps = P().pets(u);
    const rows = Object.keys(ps).filter(function (k) { return P().BY[k]; }).map(function (k) {
        return { 번호: k, 이름: P().nick(k, u), '먹인 룬': fed(k, u).map(tag).join(' · ') || '-' };
    });
    if (rows.length) console.table(rows);
};

console.log('[룬] petRuneState() · petRuneGive(이름, 수[, 사번])');

})();
