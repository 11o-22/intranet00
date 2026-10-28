// ==========================================
// ★ 펫 — 반려동물용 장비 · 레벨 · 등급업 (2026-10-28)
// bundles.json 마지막 묶음 — pet-rune.js 보다 뒤, journey.js 보다 앞
// ==========================================
//
// ■ 반려동물용 장비
//   망상 홈쇼핑 🐾 펫 숍(룬 아래)에서 **기본급 다섯 가지** — 펫 속성(행운 · 판정 · 회피 · 기믹 파훼 · 저항)마다 +2.
//   개당 5,000 P. 장비 주머니(u.petGear = { 이름: 수 })에 들어가고, 펫 하나에 **하나만** 낀다 (pets[번호].gear).
//   🐶 펫 → 펫 하나 → 「장비」 에서 끼우고 뺀다. 뺀 것은 주머니로 돌아온다.
//   여정(journey.js)에서는 조금 더 좋은 장비가 떨어진다 (DROP) — 두 속성이 붙어 있다. 같은 자리에 낀다.
//   장비마다 **장비 스킬** 하나 — 여정 전투에서 한 싸움에 한 번 (journey.js 가 쓴다).
//
// ■ 레벨 · 등급
//   여정에서 경험치(xp)를 얻어 Lv 이 오른다 (pets[번호].lv · xp · Lv 10 까지).
//   등급업은 **등급업 조각**을 모아야 한다 (2026-10-28 저녁) — D → C 는 『 첫번째 여정 』 의 조각 세 가지 (SHARDS.D).
//   조각은 사원의 조각 주머니(u.petShard = { 이름: 수 })에 쌓이고, Lv 10 인 펫에게 세 가지를 다 넣으면 등급이 오른다
//   (조각 하나씩 소모 · Lv 1 · xp 0 부터). 다음 등급(C → B …)의 조각은 그 등급 여정이 생기면 넣는다.
//
// ■ 여정 전투에 쓰는 수치 (PETGEAR.stats)
//   종 능력치(pet-data st · B 등급부터) + 장비 몫을 합쳐 — 행운 luck · 판정 bon · 회피 eva · 기믹 파훼 gim · 저항 resist
//     체력  60 + Lv·6 + 등급·20 + 저항·4        공격  8 + Lv·1.5 + 등급·4 + 판정·2
//     방어  2 + Lv·0.5 + 등급·2 + 저항·1.5      회피% 5 + 회피·3        치명% 5 + 행운/8        보스 추가 피해 기믹·4
//
// ■ 콘솔
//   petGearState()           주머니 · 펫마다 낀 것 · Lv
//   petGearGive('🍀 네잎 목걸이', 1[, 사번])   상담사
//   petXpGive(번호, n)       상담사 — 내 펫에 경험치

(function petGear() {

const PRICE = 5000;
const LV_MAX = 10;
// k 속성 · v 몫 · sk 장비 스킬 { n, t(종류), d }
//   스킬 종류 — crit 이번 턴 치명 확정 · heavy 강타(180% · 확정 명중) · dodge 이번 턴 회피 확정 · pierce 방어 무시 150% · guard 피해 30% 로 + 15% 회복
const BASIC = [
    { n: '🍀 네잎 목걸이',     add: { luck: 2 },   sk: { n: '행운의 잎',  t: 'crit',   d: '이번 공격은 반드시 급소에 닿는다.' },   d: '행운 +2. 목에 걸면 잎이 하나 더 돋는다.' },
    { n: '🦷 송곳니 목줄',     add: { bon: 2 },    sk: { n: '물어뜯기',   t: 'heavy',  d: '빗나가지 않는 강한 한 입.' },           d: '판정 +2. 누구 것인지 모를 이빨이 달려 있다.' },
    { n: '🪶 깃털 발찌',       add: { eva: 2 },    sk: { n: '깃털 걸음',  t: 'dodge',  d: '이번 턴은 아무것도 닿지 않는다.' },     d: '회피 +2. 발이 바닥에서 한 치 뜬다.' },
    { n: '🔨 작은 망치 펜던트', add: { gim: 2 },    sk: { n: '두드리기',   t: 'pierce', d: '막고 있는 것째로 두드린다.' },          d: '기믹 파훼 +2. 작지만 무겁다.' },
    { n: '🛡 가죽 조끼',       add: { resist: 2 }, sk: { n: '웅크리기',   t: 'guard',  d: '몸을 말고 버틴다. 숨이 돌아온다.' },     d: '저항 +2. 주인의 낡은 재킷으로 만든 것 같다.' }
];
// 여정에서 떨어지는 것 — 조금 더 좋다 (두 속성)
const DROP = [
    { n: '🌙 달빛 목걸이',       add: { luck: 3, bon: 1 },    sk: { n: '행운의 잎', t: 'crit',   d: '이번 공격은 반드시 급소에 닿는다.' }, d: '행운 +3 · 판정 +1. 밤길에서 주웠다. 주인의 손목에 있던 것과 닮았다.', from: 'j1' },
    { n: '🦴 묵은 뼈 목줄',      add: { bon: 3, resist: 1 }, sk: { n: '물어뜯기',  t: 'heavy',  d: '빗나가지 않는 강한 한 입.' },         d: '판정 +3 · 저항 +1. 누가 끝까지 물고 있던 것이다.', from: 'j1' },
    { n: '🧣 주인의 목도리 조각', add: { resist: 3, eva: 1 }, sk: { n: '웅크리기',  t: 'guard',  d: '몸을 말고 버틴다. 숨이 돌아온다.' },   d: '저항 +3 · 회피 +1. 냄새가 남아 있다. 그 냄새를 따라 돌아왔다.', from: 'j1' }
];
// 등급업 조각 — 등급마다 세 가지. 여정의 어느 싸움을 이기고 나면 (enc · 0부터) 1/odds 로 하나 떨어진다 (journey.js settle)
const SHARDS = {
    D: [ { n: '🧩 문틈에 낀 조각',     enc: 1, odds: 30, d: '젖은 신발 괴물을 지나온 자리에 떨어져 있었다. 문틈 요괴가 물고 있던 것이다.' },
         { n: '🧩 가로등 아래의 조각', enc: 3, odds: 30, d: '가로등 마물이 떨어뜨린 빛 속에 있었다. 만지면 아직 따뜻하다.' },
         { n: '🧩 냄새가 밴 조각',     enc: 4, odds: 30, d: '그것이 벗어 던진 냄새 안에서 나왔다. 주인의 냄새가 난다.' } ]
};
const ALL = BASIC.concat(DROP);
const BY = {};
ALL.forEach(function (g) { BY[g.n] = g; });
const STAT_NAME = { luck: '행운', bon: '판정', eva: '회피', gim: '기믹 파훼', resist: '저항' };

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t); }
function log_(t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { } }
function ui() { try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }
function copyFlags(from, to) { Object.keys(from).forEach(function (k) { if (!(k in to)) { try { to[k] = from[k]; } catch (e) { } } }); }
function addText(add) { return Object.keys(add || {}).map(function (k) { return STAT_NAME[k] + ' +' + add[k]; }).join(' · '); }

// ==========================================
// 장비 주머니
// ==========================================
function bag(u) {
    u = u || u_();
    if (!u) return {};
    const v = u.petGear;
    if (Array.isArray(v) || !v || typeof v !== 'object') u.petGear = {};
    return u.petGear;
}
function have(name, u) { return Number(bag(u)[name]) || 0; }
function add(name, n) {
    const u = u_();
    if (!u || !BY[name]) return 0;
    const b = bag(u);
    const v = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (v) b[name] = v; else delete b[name];
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/petGear/' + name).set(v || null).catch(function (e) { console.warn('[펫 장비] 저장 실패', e); });
            return v;
        }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ petGear: 1 }); } catch (e) { }
    return v;
}

// 조각 주머니
function shardBag(u) {
    u = u || u_();
    if (!u) return {};
    const v = u.petShard;
    if (Array.isArray(v) || !v || typeof v !== 'object') u.petShard = {};
    return u.petShard;
}
function shardHave(name, u) { return Number(shardBag(u)[name]) || 0; }
function shardAdd(name, n) {
    const u = u_();
    if (!u) return 0;
    const b = shardBag(u);
    const v = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (v) b[name] = v; else delete b[name];
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/petShard/' + name).set(v || null).catch(function (e) { console.warn('[펫 조각] 저장 실패', e); });
            return v;
        }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ petShard: 1 }); } catch (e) { }
    return v;
}
// 이 등급에서 다음 등급으로 — 조각 셋 가운데 몇 가지를 가졌나
function shardSet(grade) { return SHARDS[grade] || null; }
function shardCount(grade, u) { const set = shardSet(grade); if (!set) return 0; return set.filter(function (x) { return shardHave(x.n, u) > 0; }).length; }

// ==========================================
// 사기 · 끼우기 · 빼기
// ==========================================
window.petGearBuy = function (name) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const u = u_(), g = BY[name];
    if (!u || !g || g.from) return;
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('격리 중에는 살 수 없습니다.'); return; } } catch (e) { }
    if ((Number(u.points) || 0) < PRICE) { alert_('포인트가 모자랍니다.\n\n' + name + ' ' + PRICE.toLocaleString() + ' P'); return; }
    u.points = (Number(u.points) || 0) - PRICE;
    add(name, 1);
    log_('[망상 홈쇼핑] ' + name + ' 구입 (-' + PRICE.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    ui(); paint();
};
function worn(key, u) { const s = P().pets(u)[String(key)]; const g = s && s.gear; return (g && BY[g]) ? g : ''; }
function equip(key, name) {
    const u = u_();
    if (!u) return { ok: false, why: '로그인 전입니다.' };
    const s = P().pets(u)[String(key)];
    if (!s) return { ok: false, why: '아직 없는 펫입니다.' };
    if (!BY[name]) return { ok: false, why: '그런 장비가 없습니다.' };
    if (!have(name, u)) return { ok: false, why: name + '이(가) 주머니에 없습니다.' };
    const old = worn(key, u);
    if (old) add(old, 1);
    add(name, -1);
    P().patch(String(key), { gear: name });
    log_('[펫] ' + P().nick(key, u) + '에게 ' + name + ' 장착' + (old ? ' (' + old + ' 은 주머니로)' : ''));
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    return { ok: true };
}
function unequip(key) {
    const u = u_();
    const old = worn(key, u);
    if (!old) return { ok: false, why: '낀 장비가 없습니다.' };
    add(old, 1);
    P().patch(String(key), { gear: null });
    return { ok: true, name: old };
}

// ==========================================
// 레벨 · 경험치 · 등급업
// ==========================================
function lvOf(key, u) { const s = P().pets(u)[String(key)]; return Math.max(1, Math.min(LV_MAX, Number(s && s.lv) || 1)); }
function xpOf(key, u) { const s = P().pets(u)[String(key)]; return Math.max(0, Number(s && s.xp) || 0); }
function gradeIdx(key, u) { const s = P().pets(u)[String(key)]; const i = P().GRADES.indexOf((s && s.g) || 'D'); return i < 0 ? 0 : i; }
function needXp(lv) { return 20 + lv * 10; }
// 경험치를 더한다 — 돌려주는 값 { lv0, lv, full } (full: Lv 10 꽉 참)
function addXp(key, n) {
    const u = u_();
    const s = P().pets(u)[String(key)];
    if (!s) return null;
    let lv = lvOf(key, u), xp = xpOf(key, u) + Math.max(0, Math.round(Number(n) || 0));
    const lv0 = lv;
    while (lv < LV_MAX && xp >= needXp(lv)) { xp -= needXp(lv); lv++; }
    if (lv >= LV_MAX) xp = 0;
    P().patch(String(key), { lv: lv, xp: xp });
    return { lv0: lv0, lv: lv, full: lv >= LV_MAX };
}
// 등급업 — Lv 10 이고, 그 등급의 조각 세 가지를 다 가졌을 때
function gradeNeed(key, u) {
    const gi = gradeIdx(key, u);
    if (gi >= P().GRADES.length - 1) return { ok: false, why: '이미 가장 높은 등급입니다.' };
    const g0 = P().GRADES[gi];
    const set = shardSet(g0);
    if (!set) return { ok: false, why: g0 + ' 등급에서 오르는 조각은 아직 없습니다 — 다음 여정이 생기면 떨어집니다.', set: null, have: 0 };
    const have = shardCount(g0, u);
    if (lvOf(key, u) < LV_MAX) return { ok: false, why: 'Lv ' + LV_MAX + ' 이 되어야 합니다.', set: set, have: have };
    if (have < set.length) return { ok: false, why: '등급업 조각이 모자랍니다 (' + have + ' / ' + set.length + ').', set: set, have: have };
    return { ok: true, set: set, have: have };
}
function canGradeUp(key, u) { return !!gradeNeed(key, u).ok; }
function gradeUp(key) {
    const u = u_();
    const need = gradeNeed(key, u);
    if (!need.ok) return { ok: false, why: need.why };
    const g0 = P().GRADES[gradeIdx(key, u)], g1 = P().GRADES[gradeIdx(key, u) + 1];
    need.set.forEach(function (x) { shardAdd(x.n, -1); });
    P().patch(String(key), { g: g1, lv: 1, xp: 0 });
    log_('[펫] ' + P().nick(key, u) + ' — ' + g0 + ' → ' + g1 + ' 등급 (여정 Lv ' + LV_MAX + ' · 조각 ' + need.set.map(function (x) { return x.n; }).join(' · ') + ')');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    return { ok: true, from: g0, to: g1 };
}

// ==========================================
// 여정 전투 수치
// ==========================================
function attrs(key, u) {
    const sp = P().BY[key] || {};
    const out = { luck: 0, bon: 0, eva: 0, gim: 0, resist: 0 };
    if (gradeIdx(key, u) >= 2) Object.keys(sp.st || {}).forEach(function (k) { if (k in out) out[k] += Number(sp.st[k]) || 0; });
    const g = BY[worn(key, u)];
    if (g) Object.keys(g.add).forEach(function (k) { if (k in out) out[k] += g.add[k]; });
    return out;
}
function stats(key, u) {
    const a = attrs(key, u), lv = lvOf(key, u), gi = gradeIdx(key, u);
    const luckN = a.luck >= 10 ? a.luck / 20 : a.luck;         // 종 행운은 % 단위(40~90) — 20 으로 나눠 다른 속성과 결을 맞춘다
    return {
        max: Math.round(60 + lv * 6 + gi * 20 + a.resist * 4),
        atk: Math.round((8 + lv * 1.5 + gi * 4 + a.bon * 2) * 10) / 10,
        def: Math.round((2 + lv * 0.5 + gi * 2 + a.resist * 1.5) * 10) / 10,
        eva: Math.min(60, 5 + a.eva * 3),
        crit: Math.min(60, Math.round(5 + luckN * 8)),
        gim: a.gim,
        lv: lv, gi: gi, gear: worn(key, u)
    };
}

// ==========================================
// 🐾 펫 숍 — 룬 칸 아래
// ==========================================
function boxHtml() {
    const u = u_();
    return '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">🐾 펫 숍 — 반려동물용 장비</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:8px; line-height:1.55;">🐾 여정에 데려갈 펫에게 끼웁니다. 속성마다 +2 · 개당 ' + PRICE.toLocaleString() + ' P. 장비 주머니에 들어가고, 펫 칸에서 펫 하나에 하나씩 낍니다. 여정에서는 더 좋은 것이 떨어집니다.</div>'
        + BASIC.map(function (g) {
            const n = have(g.n, u);
            return '<div style="display:flex; align-items:center; gap:6px; padding:5px 0; border-top:1px solid rgba(255,255,255,0.05);">'
                + '<div style="flex:1; min-width:0;"><div style="font-size:11px; color:#e8d7b4;">' + esc(g.n) + (n ? ' <span style="color:#9fd8ef;">·' + n + '개</span>' : '') + '</div>'
                + '<div style="font-size:9px; color:#6f685e; margin-top:1px;">' + esc(addText(g.add)) + ' · 스킬 「' + esc(g.sk.n) + '」 — ' + esc(g.sk.d) + '</div></div>'
                + '<button class="game-btn" style="flex:0 0 auto; margin:0; padding:6px 9px; font-size:10px;" onclick="petGearBuy(\'' + esc(g.n) + '\')">' + PRICE.toLocaleString() + ' P</button></div>';
        }).join('');
}
function paint() {
    const host = document.querySelector('#dream-body') || document.querySelector('#pet-shop-body');
    if (!host || !u_()) return;
    let el = document.getElementById('pet-gear-box');
    if (!el) { el = document.createElement('div'); el.id = 'pet-gear-box'; el.style.cssText = 'margin-bottom:14px;'; }
    const rune = document.getElementById('pet-rune-box');
    const stay = document.getElementById('pet-stay-box');
    const anchor = (rune && rune.parentNode === host) ? rune : ((stay && stay.parentNode === host) ? stay : null);
    if (anchor) { if (anchor.nextSibling !== el) host.insertBefore(el, anchor.nextSibling); }
    else if (el.parentNode !== host || host.firstChild !== el) host.insertBefore(el, host.firstChild);
    const h = boxHtml();
    if (el.innerHTML !== h) el.innerHTML = h;
}
window.petGearPaint = paint;
(function hookShop() {
    const iv = setInterval(function () {
        if (typeof renderDream !== 'function') return;
        if (renderDream._petGear) { clearInterval(iv); return; }
        const _r = renderDream;
        const w = function () { const out = _r.apply(this, arguments); setTimeout(function () { try { paint(); } catch (e) { } }, 110); return out; };
        copyFlags(_r, w); w._petGear = true;
        renderDream = w; window.renderDream = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () { try { const panel = document.getElementById('shop-dream'); if (panel && panel.classList.contains('active')) paint(); } catch (e) { } }, 1000);

// ==========================================
// 장비 창 — 펫 하나에서
// ==========================================
const MOD = 'pet-gear-modal';
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
window.petGearOpen = function (key, after) {
    const u = u_();
    if (!u || !P().pets(u)[String(key)]) return;
    const nm = P().nick(key, u), cur = worn(key, u);
    const st = stats(key, u);
    const list = ALL.filter(function (g) { return have(g.n, u) > 0; });
    const w = box('<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">' + esc(nm) + ' — 장비</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:9px; line-height:1.6;">펫 하나에 하나만 낍니다. 뺀 것은 주머니로 돌아옵니다.<br>여정 수치 — 체력 ' + st.max + ' · 공격 ' + st.atk + ' · 방어 ' + st.def + ' · 회피 ' + st.eva + '% · 치명 ' + st.crit + '%</div>'
        + '<div style="font-size:11px; color:#c9a227; margin-bottom:8px;">낀 것: ' + (cur ? esc(cur) + ' <span style="color:#6f685e;">(' + esc(addText(BY[cur].add)) + ' · 「' + esc(BY[cur].sk.n) + '」)</span>' : '<span style="color:#6f685e;">없음</span>') + '</div>'
        + (cur ? '<button id="pg-off" class="game-btn" style="' + BTN + GREY + '">뺀다 — 주머니로</button>' : '')
        + (list.length ? list.map(function (g) {
            return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0; border-top:1px solid rgba(255,255,255,0.06);">'
                + '<div style="flex:1; min-width:0;"><div style="font-size:11.5px; color:#e8d7b4;">' + esc(g.n) + ' <span style="font-size:10px; color:#8d8578;">· ' + have(g.n, u) + '개</span></div>'
                + '<div style="font-size:9.5px; color:#6f685e; margin-top:2px;">' + esc(addText(g.add)) + ' · 「' + esc(g.sk.n) + '」 ' + esc(g.sk.d) + '</div></div>'
                + '<button class="game-btn pg-on" data-n="' + esc(g.n) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">낀다</button></div>';
        }).join('') : '<div style="font-size:10.5px; color:#6f685e; padding:6px 0;">주머니에 장비가 없습니다. 망상 홈쇼핑 🐾 펫 숍에서 삽니다.</div>')
        + '<button id="pg-x" class="game-btn" style="' + BTN + GREY + ' margin-top:10px;">닫는다</button>');
    w.querySelector('#pg-x').onclick = function () { shut(); if (typeof after === 'function') after(); };
    const off = w.querySelector('#pg-off');
    if (off) off.onclick = function () { const r = unequip(key); if (!r.ok) { alert_(r.why); return; } window.petGearOpen(key, after); };
    Array.prototype.forEach.call(w.querySelectorAll('.pg-on'), function (b) {
        b.onclick = function () { const r = equip(key, b.dataset.n); if (!r.ok) { alert_(r.why); return; } window.petGearOpen(key, after); };
    });
};

window.PETGEAR = {
    BASIC: BASIC, DROP: DROP, ALL: ALL, BY: BY, PRICE: PRICE, LV_MAX: LV_MAX, STAT_NAME: STAT_NAME,
    bag: bag, have: have, add: add, worn: worn, equip: equip, unequip: unequip, addText: addText,
    lv: lvOf, xp: xpOf, needXp: needXp, addXp: addXp, gradeIdx: gradeIdx, canGradeUp: canGradeUp, gradeUp: gradeUp, gradeNeed: gradeNeed,
    SHARDS: SHARDS, shardBag: shardBag, shardHave: shardHave, shardAdd: shardAdd, shardSet: shardSet, shardCount: shardCount,
    attrs: attrs, stats: stats
};

// ==========================================
// 상담사 · 확인
// ==========================================
window.petGearGive = function (name, n, who) {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!BY[name]) { console.warn('장비는 ' + ALL.map(function (g) { return g.n; }).join(' · ') + ' 가운데 하나입니다.'); return; }
    n = Math.max(1, Number(n) || 1);
    if (!who || who === me.code) { const v = add(name, n); console.log('%c✓ ' + name + ' → ' + v + '개', 'color:#4CAF50'); paint(); return; }
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const t = all.filter(function (x) { return x.code === who || String(x.no) === String(who) || x.name === who; })[0];
    if (!t) { console.warn('사원을 못 찾았습니다 —', who); return; }
    try { database.ref('users/' + t.code + '/petGear/' + name).transaction(function (c) { return Math.max(0, (Number(c) || 0) + n); }).then(function () { console.log('%c✓ ' + t.name + ' 사원 ' + name + ' +' + n, 'color:#4CAF50'); }); } catch (e) { }
};
window.petShardGive = function (name, n, who) {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(SHARDS).reduce(function (a, g) { return a.concat(SHARDS[g].map(function (x) { return x.n; })); }, []);
    if (all.indexOf(name) < 0) { console.warn('조각은 ' + all.join(' · ') + ' 가운데 하나입니다.'); return; }
    n = Math.max(1, Number(n) || 1);
    if (!who || who === me.code) { console.log('%c✓ ' + name + ' → ' + shardAdd(name, n) + '개', 'color:#4CAF50'); return; }
    const us = Object.keys((typeof db !== 'undefined' && db.users) || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const t = us.filter(function (x) { return x.code === who || String(x.no) === String(who) || x.name === who; })[0];
    if (!t) { console.warn('사원을 못 찾았습니다 —', who); return; }
    try { database.ref('users/' + t.code + '/petShard/' + name).transaction(function (c) { return Math.max(0, (Number(c) || 0) + n); }).then(function () { console.log('%c✓ ' + t.name + ' 사원 ' + name + ' +' + n, 'color:#4CAF50'); }); } catch (e) { }
};
window.petXpGive = function (key, n) {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const r = addXp(key, n);
    console.log(r ? ('%c✓ ' + P().nick(key, me) + ' Lv ' + r.lv0 + ' → ' + r.lv) : '없는 펫', 'color:#4CAF50');
};
window.petGearState = function () {
    const u = u_();
    console.log('%c===== 🐾 반려동물용 장비 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const b = bag(u), sb = shardBag(u);
    console.log('  주머니:', Object.keys(b).filter(function (k) { return b[k] > 0; }).map(function (k) { return k + '×' + b[k]; }).join(', ') || '비었음');
    console.log('  등급업 조각:', Object.keys(sb).filter(function (k) { return sb[k] > 0; }).map(function (k) { return k + '×' + sb[k]; }).join(', ') || '없음', '· D→C 는', shardCount('D', u) + ' / 3');
    const ps = P().pets(u);
    console.table(Object.keys(ps).filter(function (k) { return P().BY[k]; }).map(function (k) {
        const st = stats(k, u);
        return { 번호: k, 이름: P().nick(k, u), 등급: (ps[k].g || 'D'), Lv: lvOf(k, u) + ' (' + xpOf(k, u) + '/' + needXp(lvOf(k, u)) + ')', 장비: worn(k, u) || '-', 체력: st.max, 공격: st.atk, 방어: st.def, '회피%': st.eva, '치명%': st.crit };
    }));
};

console.log('[펫 장비] petGearState() · petGearGive(이름, 수[, 사번]) · petShardGive(이름, 수[, 사번]) · petXpGive(번호, n)');

})();
