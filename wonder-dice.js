// ==========================================
// ★ 「이상한 나라의 ■■■」 — 주사위 기믹 더하기 (2026-10-31 사용자 「주사위 굴리는 기믹을 3배 더」)
// bundles.json 마지막 묶음 — 챕터 · 연계판 파일들 다음 (wonder-dice-text.js 바로 뒤)
// ==========================================
//
//   사용자가 정한 것
//     · 이상한 나라 쪽(챕터)과 연계판 둘 다. 세이렌 · 늑대인간은 더 많이.
//     · 새 장면을 쓰지 않고 **기존 장면에 판정을 붙인다** — 고른 행동 바로 뒤에 d30(16 이상 성공) 한 번,
//       성공 · 실패 문장만 짧게 새로 쓰고, 그 뒤 이야기는 고른 그대로 이어진다.
//     · 실패하면 즉사도 섞는다 — 판정마다 lv(이 단계부터 즉사: 0 몽환 · 1 어색 · 2 피폐 · 3 기괴 · 9 즉사 없음).
//       단계가 깊을수록 즉사하는 판정이 많아진다. 살아남은 실패는 다음 판정 −2 (연계판에서 시계가 도는 판은 시간 −30초).
//
//   지문 — wonder-dice-text.js (window.WONDER_DICE = { 챕터: { pick:[…], link:[…] } })
//     pick — 원고 장면의 선택지에 붙는다: { h: 장면 제목, l: 선택지 글, what, lv, ok, bad, die }
//     link — 연계판 걸음 사이에 끼운다:   { set, act, what, lv, ok, bad, die }
//   연계판은 미션마다 PER_MIS 개를 걸음 사이에 고르게 끼운다 (걸음 번호는 그대로 — 끼운 판정은 그 걸음 앞에서 먼저 뜬다).
//   주사위는 사람마다 따로 굴린다. 같은 자리 판정은 한 번만 (내 화면 F.dz · F.lk.dz 에 적는다).
//
// ■ 콘솔
//   wonderDiceState()   챕터마다 붙은 판정 수

(function wonderDice() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW || !X.L) return;
const L = X.L;
const PER_MIS = { angel: 3, vampire: 3, succubus: 3, jiangshi: 3, siren: 4, wolf: 4 };
const MAL = 2;
const T_BAD = -30000;
const PRE = { a_: 'angel', s_: 'siren', v_: 'vampire', c_: 'succubus', j_: 'jiangshi', w_: 'wolf' };

function D() { return window.WONDER_DICE || {}; }
function F() { return X.F(); }
function S() { return X.S(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function norm(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function stage() { try { return X.stageNow ? X.stageNow() : 0; } catch (e) { return 0; } }
function lethal(rule) { const lv = (rule && rule.lv != null) ? Number(rule.lv) : 9; return lv < 9 && stage() >= lv; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function sys(t) { return '<div class="wd-sys">' + t + '</div>'; }
function malNote() { const m = Number((F() || {}).dMal) || 0; return m ? ' <span style="color:#ff9800;">(지난 실패로 −' + m + ')</span>' : ''; }
function rollNow() {
    const f = F();
    const m = Number(f.dMal) || 0;
    f.dMal = 0;
    return X.roll(-m);
}
function headLine(rule, die) {
    return sys('🎲 ' + esc(rule.what || '판정') + ' — d30 · 16 이상 성공' + malNote() + (die ? '<br><span style="color:#ff6b6b;">실패하면 무사하지 못할 수 있습니다.</span>' : ''));
}

// ==========================================
// 1) 이상한 나라 쪽 — 원고 선택지에 붙는 판정
// ==========================================
function chOfKey(k) { const p = String(k || '').slice(0, 2); return PRE[p] || null; }
function seqAt(sc, loc) {
    let seq = sc.p;
    for (let i = 1; i < loc.length; i += 2) {
        const pg = seq && seq[loc[i - 1]];
        const op = pg && pg.o && pg.o[loc[i]];
        if (!op || !op.b) return null;
        seq = op.b;
    }
    return seq;
}
function pageAt(sc, loc) { const s = seqAt(sc, loc); return s ? s[loc[loc.length - 1]] : null; }
function sceneOf(w) {
    try { if (w.fix) return X.FIX[w.fix] && X.FIX[w.fix](); } catch (e) { }
    return X.scene(w.k, w.h);
}
function ruleFor(ch, h, label) {
    const list = (D()[ch] || {}).pick || [];
    const hh = norm(h), ll = norm(label);
    for (let i = 0; i < list.length; i++) if (norm(list[i].h) === hh && norm(list[i].l) === ll) return i;
    return -1;
}
const _pick = X.pick;
X.pick = function (i) {
    try {
        const f = F();
        if (f && f.sc && f.sc.id === 'walk' && X.on() && i >= 0) {
            const w = f.sc;
            const ch = chOfKey(w.k);
            const sc = ch ? sceneOf(w) : null;
            const pg = sc ? pageAt(sc, w.loc) : null;
            const op = pg && pg.o && pg.o[i];
            const ri = op ? ruleFor(ch, sc.h, op.l) : -1;
            if (ri >= 0) {
                const key = rk() + ':' + w.k + ':' + norm(sc.h) + ':' + w.loc.join('.') + ':' + i;
                f.dz = f.dz || {};
                if (!f.dz[key]) {
                    f.dPend = { key: key, ch: ch, ri: ri, i: i, lbl: norm(op.l), walk: JSON.parse(JSON.stringify(w)) };
                    f.sc = { id: 'wdice' };
                    f.wait = null;
                    X.save(); X.view();
                    return;
                }
            }
        }
    } catch (e) { console.error('[이상한 나라] 판정 붙이기', e); }
    return _pick.apply(this, arguments);
};
X.VIEW.wdice = function () {
    const f = F(), p = f.dPend;
    if (!p) { return X.go({ id: 'hall' }); }
    const rule = ((D()[p.ch] || {}).pick || [])[p.ri];
    if (!rule) { f.sc = p.walk; f.dPend = null; X.save(); return _pick(p.i); }
    if (!p.r) {
        X.draw('—', '「' + esc(p.lbl) + '」' + headLine(rule, lethal(rule)), X.btn('주사위를 굴린다.', 'WONDER.dRoll()'));
        return;
    }
    const r = p.r;
    if (r.ok) { X.draw('—', X.rollHtml(r) + esc(rule.ok), X.btn('계속한다.', 'WONDER.dGo()')); return; }
    if (p.dead) { X.draw('—', X.rollHtml(r) + esc(rule.die || rule.bad), X.btn('……', 'WONDER.dDie()')); return; }
    X.draw('—', X.rollHtml(r) + esc(rule.bad) + sys('<span style="color:#ff9800;">다음 판정 −' + MAL + '</span>'), X.btn('계속한다.', 'WONDER.dGo()'));
};
X.dRoll = function () {
    const f = F(), p = f && f.dPend;
    if (!p || p.r) return;
    const rule = ((D()[p.ch] || {}).pick || [])[p.ri] || {};
    const die = lethal(rule);
    const r = rollNow();
    p.r = r;
    p.dead = !r.ok && die;
    if (!r.ok && !die) f.dMal = MAL;
    f.dz = f.dz || {}; f.dz[p.key] = r.ok ? 'o' : 'x';
    try { darkRun.log.push('[판정] ' + (rule.what || '') + ' — 「' + p.lbl + '」 ' + (r.ok ? '성공' : p.dead ? '실패 · 죽음' : '실패')); } catch (e) { }
    X.save(); X.view();
};
X.dGo = function () {
    const f = F(), p = f && f.dPend;
    if (!p) return;
    f.dPend = null;
    f.sc = p.walk;
    X.save();
    _pick(p.i);
};
X.dDie = function () {
    const f = F(), p = f && f.dPend;
    if (!p) return;
    const rule = ((D()[p.ch] || {}).pick || [])[p.ri] || {};
    X.die(X.rollHtml(p.r) + esc(rule.die || rule.bad || ''));
};

// ==========================================
// 2) 연계판 — 걸음 사이에 끼우는 판정
// ==========================================
//   미션의 걸음 목록에서 첫 걸음 · 마지막 걸음 · 건너뛰는 걸음 · 결말 걸음을 빼고 고르게 PER_MIS 자리를 고른다.
//   지문은 그 챕터 link 묶음에서 회차 · 미션으로 정해 겹치지 않게 고른다 (모두가 같은 자리 · 같은 지문).
const INTRO_K = /enter|reveal|vann|cIn|rules|first/i;
const END_K = /end|fin|deal|result|done/i;
function gates(ch, mid, def) {
    const pool = (D()[ch] || {}).link || [];
    const steps = (def && def.steps) || [];
    const want = PER_MIS[ch] || 0;
    if (!pool.length || !steps.length || !want || ch === 'wolf') return [];     // 늑대인간은 걸음 안(칸)에서 — 아래 wwalk
    // 들머리 · 규칙 걸음 다음부터 (규칙을 보기 전에 판정이 뜨지 않게)
    let start = 1;
    for (let i = 0; i < steps.length; i++) if (INTRO_K.test(String((steps[i] || {}).k || ''))) start = i + 1;
    const cand = [];
    for (let i = start; i < steps.length; i++) {
        if (END_K.test(String((steps[i] || {}).k || ''))) continue;
        cand.push(i);
    }
    if (!cand.length) cand.push(Math.min(steps.length - 1, start));
    const rnd = X.srand(rk() + ':' + ch + ':' + mid + ':dice');
    const order = X.shuffle(pool.map(function (_, j) { return j; }), rnd);
    const out = [];
    for (let j = 0; j < want; j++) {
        // 걸음이 모자라면 같은 걸음 앞에 차례로 (주사위가 이어서 뜬다)
        const at = cand[Math.min(cand.length - 1, Math.floor(j * cand.length / want))];
        out.push({ id: 'g' + j, i: at, j: order[j % order.length] });
    }
    return out;
}
function gateById(f, d, id) {
    if (String(id).charAt(0) === 'w') { try { const cfg = X.WOLF.cfgOf(d); return wolfGates(cfg.goal || 15).filter(function (x) { return x.id === id; })[0] || null; } catch (e) { return null; } }
    return gates(f.lk.ch, f.lk.mid, d).filter(function (x) { return x.id === id; })[0] || null;
}
function gateHere(f, d) {
    const lk = f.lk;
    const gs = gates(lk.ch, lk.mid, d);
    lk.dz = lk.dz || {};
    for (let k = 0; k < gs.length; k++) if (gs[k].i === lk.i && !lk.dz[gs[k].id]) return gs[k];
    return null;
}
const _lk = X.VIEW.lk;
X.VIEW.lk = function () {
    try {
        const f = F(), d = L.def();
        const st = L.st();
        if (f && f.lk && d && d.steps && st.plan && f.lk.init && !f.lk.wait && !st.end && !(d.timer !== false && L.left() <= 0)) {
            const g = gateHere(f, d);
            if (g) return linkDice(f, d, g);
        }
    } catch (e) { console.error('[이상한 나라] 연계판 판정', e); }
    return _lk.apply(this, arguments);
};
function linkDice(f, d, g) {
    const rule = ((D()[f.lk.ch] || {}).link || [])[g.j];
    if (!rule) { f.lk.dz[g.id] = 's'; X.save(); return X.view(); }
    const p = f.lk.dp && f.lk.dp.id === g.id ? f.lk.dp : null;
    if (!p || !p.r) {
        L.draw('—', esc(rule.set) + headLine(rule, lethal(rule)), X.btn(esc(rule.act || '해 본다.'), "WONDER.dLink('" + g.id + "')"));
        return;
    }
    const r = p.r;
    if (r.ok) { L.draw('—', X.rollHtml(r) + esc(rule.ok), X.btn('계속한다.', "WONDER.dLinkGo('" + g.id + "')")); return; }
    if (p.dead) { L.draw('—', X.rollHtml(r) + esc(rule.die || rule.bad), X.btn('……', "WONDER.dLinkDie('" + g.id + "')")); return; }
    L.draw('—', X.rollHtml(r) + esc(rule.bad) + sys('<span style="color:#ff9800;">' + (p.t ? '시간 −30초' : '다음 판정 −' + MAL) + '</span>'), X.btn('계속한다.', "WONDER.dLinkGo('" + g.id + "')"));
}
X.dLink = function (id) {
    const f = F(), d = L.def();
    if (!f || !f.lk || !d) return;
    const g = gateById(f, d, id);
    if (!g || (f.lk.dp && f.lk.dp.id === id && f.lk.dp.r)) return;
    const rule = ((D()[f.lk.ch] || {}).link || [])[g.j] || {};
    const die = lethal(rule);
    const r = rollNow();
    const p = { id: id, r: r, dead: !r.ok && die, t: false };
    if (!r.ok && !die) {
        if (d.timer !== false) { p.t = true; L.addTime(T_BAD); }
        else f.dMal = MAL;
    }
    f.lk.dp = p;
    try { darkRun.log.push('[판정] ' + (rule.what || '') + ' — ' + (r.ok ? '성공' : p.dead ? '실패 · 죽음' : '실패')); } catch (e) { }
    X.save(); X.view();
};
X.dLinkGo = function (id) {
    const f = F();
    if (!f || !f.lk) return;
    f.lk.dz = f.lk.dz || {};
    f.lk.dz[id] = (f.lk.dp && f.lk.dp.r && f.lk.dp.r.ok) ? 'o' : 'x';
    f.lk.dp = null;
    X.save(); X.view();
};
X.dLinkDie = function (id) {
    const f = F(), d = L.def();
    if (!f || !f.lk || !f.lk.dp) return;
    const g = gateById(f, d, id);
    const rule = (g && ((D()[f.lk.ch] || {}).link || [])[g.j]) || {};
    X.die(X.rollHtml(f.lk.dp.r) + esc(rule.die || rule.bad || ''));
};

// ── 늑대인간 연계판 — 자장가 걸음이 한 걸음 안에서 다 돈다. 내 칸이 고르게 나눈 자리에 닿으면 그 박자를 고르기 전에 판정.
function wolfGates(goal) {
    const want = PER_MIS.wolf, pool = (D().wolf || {}).link || [];
    if (!pool.length) return [];
    const rnd = X.srand(rk() + ':wolf:' + ((F().lk || {}).mid || '') + ':dice');
    const order = X.shuffle(pool.map(function (_, j) { return j; }), rnd);
    const out = [];
    for (let j = 0; j < want; j++) out.push({ id: 'w' + j, pos: Math.max(1, Math.round((j + 1) * goal / (want + 1))), j: order[j % order.length] });
    return out;
}
(function hookWolf() {
    const iv = setInterval(function () {
        if (!L.K.wwalk || !X.WOLF || !X.WOLF.cfgOf || L.K.wwalk._dice) return;
        clearInterval(iv);
        const _w = L.K.wwalk;
        const w = function (step, i) {
            try {
                const f = F(), d = L.def();
                const cfg = X.WOLF.cfgOf(d);
                const st = X.WOLF.state(cfg);
                const me = st && st.per && st.per[currentUser.code];
                const voted = L.votes(cfg.key + st.t)[currentUser.code] != null;
                if (me && !me.done && !me.out && !voted && !L.st().end) {
                    f.lk.dz = f.lk.dz || {};
                    const g = wolfGates(cfg.goal || 15).filter(function (x) { return me.pos >= x.pos && !f.lk.dz[x.id]; })[0];
                    if (g) return linkDice(f, d, { id: g.id, i: i, j: g.j, wolf: 1 });
                }
            } catch (e) { console.error('[이상한 나라] 늑대인간 판정', e); }
            return _w.apply(this, arguments);
        };
        w._dice = true;
        L.K.wwalk = w;
    }, 300);
})();

window.wonderDiceState = function () {
    const rows = Object.keys(D()).map(function (ch) {
        const v = D()[ch] || {};
        return { 챕터: ch, 선택지판정: (v.pick || []).length, 연계판지문: (v.link || []).length, 미션마다: PER_MIS[ch] || 0 };
    });
    console.table(rows);
    console.log('지금 단계', stage(), '· 다음 판정 감점', (F() || {}).dMal || 0);
};

console.log('[이상한 나라] 주사위 기믹 — 선택지 판정 · 연계판 판정 연결');
})();
