// ==========================================
// ★ 「이상한 나라의 ■■■」 — 늑대인간 연계판 「동화의 뒷면」 (몽환)
// bundles.json 마지막 묶음 — wonder-ch-wolf.js 다음
// ==========================================
//
//   원고: 「늑대인간의 장 · 몽환 — 원고」 문서의 연계판 공통 뼈대 · 진입 · 귀환 · S1~T8.
//   걸음은 전부 자장가 박자(X.WOLF 엔진, 전진 / 정지 · 「님」 · 정지 두 번 뒤 전진). 발각은 책 안에서 0부터.
//   원고가 「기존 S-003」에 맡긴 것은 이렇게 줄였다:
//     · 끌려감 — 할머니 집 침대 위에서 빠져나오기 판정 하나(16 이상, 양털 베개 +5, 일행이 남아 있으면 수색 +5).
//       실패하면 죽음(아무도 찾지 못한 끌려감 대실패). 팀 미션에서 혼자 세 번째 발각이면 그 사람만 끌려가고 미션은 이어진다.
//     · 이해도 — 금기 접촉마다 +12, 80이면 죽음(이 판들에서는 닿기 어렵다). 요정 가루가 금기 한 번을 없던 일로 한다.
//     · 「살핀다 · 뒤진다 · 손재주 · 듣는다 · 연주」 — 모두 맨 주사위 1~30, 16 이상(장비 없음).
//     · 기존 장면 나무의 장 · 기믹 · 찢어진 장 줍기 — 이 판들에서는 미션 장면만 쓴다.
//   제한 시간 45분(원고) — wonder-link.js 의 15분 시계를 이 미션들에서만 45분으로 감는다.
//
//   이벤트 샵: 자장가 악보 · 수면 모자 실밥(엔진) · 책갈피(찢긴 장 찾기 한 번 성공) · 요정 가루(금기 한 번 무효) · 양털 베개(끌려감 +5)

(function wonderLinkWolf() {
'use strict';
const X = window.WONDER;
if (!X || !X.L || !X.WOLF) return;
const L = X.L;
const W = X.WOLF;
const A = X.WA = X.WA || {};   // 천사(X.A)와 이름이 겹치지 않게
const CH = 'wolf';
const TIME45 = 45 * 60 * 1000;
function F() { return X.F(); }
function ME() { return currentUser.code; }
function lk() { return F().lk; }
function esc(s) { return L.esc(s); }
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function paras(x) { return String(x || '').split('<br><br>'); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
function scn(name) { return L.sub('w_new', L.def().base, name); }
function pg(name, i) { const s = scn(name); return s ? (s.p[i || 0] || { x: '', o: [] }) : { x: '', o: [] }; }
function E(t, r, extra) { L.end(t, r, extra); }
function isWolf() { const d = L.def(); return !!(d && d.wolf); }
function nm(c) { return L.name(c); }
function plan() { return L.plan() || { mem: [] }; }
function sys(t, c) { return '<div class="wd-sys"' + (c ? ' style="color:' + c + ';"' : '') + '>' + t + '</div>'; }

// ==========================================
// 공용 손질 — 이 미션들에서만
// ==========================================
(function overrides() {
    const _left = L.left;
    L.left = function () {
        if (!isWolf()) return _left.apply(this, arguments);
        const st = L.st();
        if (!st.t0) return TIME45;
        return TIME45 + (st.tb || 0) - (Date.now() - st.t0);
    };
    const _end = L.endings;
    L.endings = function () {
        const out = _end.apply(this, arguments);
        if (!isWolf()) return out;
        const role = myRole();
        Object.keys(out).forEach(function (k) {
            const e = out[k];
            const fix = function (q) {
                return String(q).replace(/\s*기존 끌려감\([^)]*\)\.?/g, '').replace(/\s*→\s*빠져나[^.]*?실패 귀환/g, '').replace(/\s*기존 S-003 시간 초과 처리/g, '').replace(/\s*금기 접촉\(이해도 \+12\)/g, '').trim();
            };
            e.body = e.body.map(fix).filter(Boolean);
            if (e.ret) e.ret = fix(e.ret);
        });
        // 「○○에게만」 문단은 그 배역에게만 — 원고에서 (오누이에게만) 같은 메모로 남아 있다
        const raw = L.sub('w_new', L.def().base, '결말');
        if (raw) {
            let cur = null;
            paras(raw.p[0].x).forEach(function (q) {
                const m = q.match(/^<b>[✔✖]\s*([^<]+)<\/b>/);
                if (m) { cur = out[m[1].trim()]; return; }
                const o = q.match(/^<i>\(([^)]*)에게만\)<\/i>\s*(.*)$/);
                if (o && cur && o[1] !== role) {
                    const t = o[2].trim();
                    cur.body = cur.body.filter(function (b) { return b.indexOf(t.slice(0, 20)) < 0; });
                }
            });
        }
        return out;
    };
})();

// ==========================================
// 배역
// ==========================================
const MROLE = {
    hood: { n: '빨간 모자', t: '길에서 벗어나지 마십시오' },
    pig: { n: '아기 돼지', t: '문을 열지 마십시오' },
    goat: { n: '아기 염소', t: '목소리만 듣고 문을 열지 마십시오' },
    sib: { n: '오누이', t: '문을 열어 주지 마십시오' },
    cin: { n: '신데렐라', t: '열두 번째 종이 울리기 전에 돌아가십시오' },
    snow: { n: '백설공주', t: '사과를 받지 마십시오' },
    ala: { n: '알라딘', t: '소원을 입 밖에 내지 마십시오' }
};
function baseRoles() {
    const out = [];
    try {
        if (typeof TALE_ROLES !== 'undefined') Object.keys(TALE_ROLES).forEach(function (k) { const r = TALE_ROLES[k]; if (r && r.name && r.taboo && k !== 'wolf') out.push({ n: r.name, t: r.taboo + '은(는) 금기입니다' }); });
    } catch (e) { }
    if (!out.length) out.push({ n: '도로시', t: '구두를 벗는 것은 금기입니다' }, { n: '잭', t: '아래를 내려다보는 것은 금기입니다' }, { n: '피노키오', t: '거짓을 말하는 것은 금기입니다' });
    return out;
}
function rolePlan(p, rnd, mkey) {
    const base = X.shuffle(baseRoles(), rnd);
    p.trole = {};
    p.role = {};
    p.cult = null;
    let who = null;
    if (mkey) { who = p.mem[Math.floor(rnd() * p.mem.length)]; p.mrole = who; p.mkey = mkey; }
    let k = 0;
    p.mem.forEach(function (c) {
        const r = (c === who) ? MROLE[mkey] : base[(k++) % base.length];
        p.trole[c] = { n: r.n, t: r.t };
        p.role[c] = (mkey === 'cin') ? '' : r.n;
    });
    p.rooms = X.shuffle([0, 1, 2, 3, 4, 5], rnd);
}
function myRole() { const p = plan(); const r = (p.trole || {})[ME()]; return r ? r.n : ''; }
function isRole(key) { const p = plan(); return p.mkey === key && p.mrole === ME(); }

// ==========================================
// 이해도 · 금기
// ==========================================
function tabooTouch(id) {
    if (X.has && X.has('요정 가루') && X.spend('요정 가루')) { try { showDarkToast('✨ 요정 가루 — 못 본 척'); } catch (e) { } return false; }
    W.event('u' + id, { u: 12 });
    return true;
}
function understanding(st) { const me = st.per[ME()]; return me ? me.u : 0; }

// ==========================================
// 끌려감 — 할머니 집 침대 위
// ==========================================
const DRAG_TXT = '할머니 집 침대 위다. 이불이 무겁다. 털 많은 팔이 허리를 감고 있다. 코 고는 소리가 귓가에서 난다.';
function dragRoll(e) {
    if (e.dr == null) {
        let b = 0;
        if (X.has && X.has('양털 베개') && X.spend('양털 베개')) b += 5;
        if (L.team() && X.actives().filter(function (c) { return c !== ME(); }).length) b += 5;
        const r = X.roll(b);
        e.dr = { ok: r.ok, total: r.total, raw: r.raw, bonus: r.bonus };
        X.save();
    }
    return e.dr;
}
function dragEnd(e) {
    const r = dragRoll(e);
    if (r.ok) return { html: '<br><br>' + DRAG_TXT + '<br><br>' + X.rollHtml(r) + '팔이 잠결에 풀린다. 침대에서 굴러 내려온다. 문이 열려 있다.' };
    return { die: DRAG_TXT + '<br><br>' + X.rollHtml(r) + '팔이 풀리지 않는다. 이불이 머리 위까지 올라온다.<br><br>(끌려감)' };
}
// 팀 미션에서 혼자 세 번째 발각 — 그 사람만 끌려간다
function dragScreen() {
    lk().dragE = lk().dragE || {};
    const r = dragRoll(lk().dragE);
    if (!r.ok) { X.save(); return X.die('⚠️ 세 번째 발각.<br><br>' + DRAG_TXT + '<br><br>' + X.rollHtml(r) + '팔이 풀리지 않는다. 이불이 머리 위까지 올라온다.<br><br>(끌려감)'); }
    if (!lk().outPub) { lk().outPub = 1; W.event('drag', { out: 1 }); X.save(); }
    L.draw('끌려감', '⚠️ 세 번째 발각.<br><br>' + DRAG_TXT + '<br><br>' + X.rollHtml(r) + '팔이 잠결에 풀린다. 침대에서 굴러 내려온다. 오솔길로는 돌아가지 못한다. 책의 가장자리에 앉아 일행을 기다린다.', X.waitHtml('_none', '일행을 기다립니다.'));
}

// ==========================================
// 공용 걸음 — 진입 · 첫 장
// ==========================================
L.K.wenter = function () {
    const p = plan();
    const d = L.def();
    const sc = X.scene('w_new', d.enterIdx);
    const one = p.mem.length <= 1;
    const r = p.trole[ME()] || { n: '', t: '' };
    const win = d.hideRole ? '「열두 번째 종이 울리기 전에 돌아가십시오.」' : '「당신은 이 이야기의 ' + esc(r.n) + '입니다. ' + esc(r.t) + '.」';
    const x = paras(sc.p[0].x).filter(function (q) {
        if (/^<i>\(혼자\)/.test(q)) return one;
        if (/^<i>\(둘 이상\)/.test(q)) return !one;
        return true;
    }).map(function (q) {
        return q.replace(/「당신은 이 이야기의 ○○입니다\. ○○○○\.」/, win).replace(/\s*<i>\([^)]*\)<\/i>/g, '').replace(/^<i>\([^)]*\)<\/i>\s*/, '');
    }).join('<br><br>');
    L.draw('진입', x + (d.firstNote ? d.firstNote() : ''), X.btn('오솔길로 들어선다.', 'WONDER.lkNext()'));
};
L.K.wfirst = function () {
    const p = plan();
    const role = myRole();
    const x = paras(pg('첫 장').x).filter(function (q) {
        const m = q.match(/^<i>\(([^)]*)에게만\)<\/i>/);
        return !m || m[1] === role;
    }).map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
    L.draw('첫 장', x, X.btn('계속 간다.', 'WONDER.lkNext()'));
};

// ==========================================
// 걸음 — 자장가 놀이 + 칸마다 장소
// ==========================================
//   미션 정의(d.walk):
//     cfg(p) → 엔진 설정에 덧붙일 것 (danger · breath · onBeat · active · init · noOut · isGo · goal)
//     at: { 칸: function(st, me) } — 내 걸음이 그 칸에 닿으면 한 번 그리는 장소 화면 (A.wvis(칸) 으로 닫는다)
//     extra(st, me) → 고르기 단추에 덧붙일 것
//     check(st) → [결말, 결과, 덧붙일 것] — 모두가 같은 기록으로 같은 결말을 본다
//     overlay(st) → true 면 그 화면을 그렸음 (동아줄 · 소원 · 방석 같은 함께 고르기)
//     doneView(st, me) — 다 걸은 뒤
function cfgOf(d) {
    const p = plan();
    const base = { key: 'b', seed: L.rk() + ':' + lk().mid + ':walk', goal: 15, mem: p.mem.slice() };
    return Object.assign(base, d.walk.cfg ? d.walk.cfg(p) : {});
}
W.cfgOf = cfgOf;
L.K.wwalk = function (step, i) {
    const d = L.def();
    const f = F();
    const cfg = cfgOf(d);
    const st = W.state(cfg);
    W._st = st;
    const me = st.per[ME()];
    const wk = d.walk;
    lk().vis = lk().vis || {};
    if (understanding(st) >= 80) return X.die('이해도가 80에 닿았다. 이야기가 당신을 다 이해했다. 당신은 이제 이 책의 한 장이다.');
    const ec = wk.check ? wk.check(st, cfg) : null;
    if (ec) { E(ec[0], ec[1], ec[2]); L.draw('—', '', X.waitHtml('_none', '…')); return; }
    if (!me) { L.draw('—', '', X.waitHtml('_none', '…')); return; }
    if (!cfg.noOut && me.cat >= 3 && !me.out) {
        if (!L.team()) { E(wk.catchEnd || '발각 세 번', 'f'); L.draw('—', '', X.waitHtml('_none', '…')); return; }
        return dragScreen();
    }
    if (wk.overlay && wk.overlay(st, cfg, me)) return;
    if (!me.out) {
        const cells = Object.keys(wk.at || {}).map(Number).sort(function (a, b) { return a - b; });
        for (let k = 0; k < cells.length; k++) {
            const c = cells[k];
            const reach = wk.reach ? wk.reach(c, st, me) : c;
            if (me.pos >= reach && !lk().vis[c]) return wk.at[c](st, me, c);
        }
    }
    if (me.done || me.out) {
        if (wk.doneView) return wk.doneView(st, me);
        const left = W.who(cfg, st);
        L.draw('—', (me.out ? '책의 가장자리에 앉아 일행을 기다린다.' : '길 끝에 닿았다. 일행을 기다린다.') + W.statusHtml(me, cfg.goal, wk.status ? wk.status(st, me) : ''),
            '<div class="wd-wait">' + (left.length ? left.map(function (c) { return '… ' + esc(nm(c)) + ' (' + st.per[c].pos + ' / ' + cfg.goal + ')'; }).join(' · ') : '…') + '</div>');
        return;
    }
    const m = L.votes(cfg.key + st.t);
    let b;
    if (m[ME()] != null) b = L.waitList(m, W.who(cfg, st));
    else {
        const ex = wk.extra ? wk.extra(st, me, cfg) : '';
        b = wk.pick ? wk.pick(st, me, cfg) : wpickBtns(st, me, ex + W.itemBtns(st));
    }
    let lastNote = '';
    const lb = st.last;
    if (lb && me.res[lb.t] && me.res[lb.t].caught) lastNote = '<div class="wd-note" style="border-color:#7f0000;"><b>⚠️ 늑대인간에게 발각되었습니다!</b>' + (wk.caughtTxt ? '<br>' + wk.caughtTxt : '') + '</div>';
    L.draw(wk.title || '—', (wk.head ? wk.head(st, me) : '') + W.lastHtml(cfg, st) + lastNote + W.sungHtml(cfg, st) + W.scoreHtml(st)
        + W.statusHtml(me, cfg.goal, (wk.status ? wk.status(st, me) : '') + (me.u ? '<br>이해도 ' + me.u : '')), b);
};
function wpickBtns(st, me, extra) {
    let b = X.btn('전진한다.', "WONDER.WA.wpick('go')");
    if (me.stops < 2) b += X.btn('정지한다.', "WONDER.WA.wpick('stop')");
    else b += sys('두 번 연속 멈췄습니다. 이번에는 반드시 전진해야 합니다.');
    return b + (extra || '');
}
A.wvis = function (c) { lk().vis = lk().vis || {}; lk().vis[c] = 1; lk().s = {}; X.save(); X.view(); };
A.wpick = function (v, more) {
    const st = W._st;
    if (!st) return;
    const d = L.def();
    let extra = more || null;
    // 길 밖에서 멈추려면 「듣는다」 (S1)
    if (v !== 'go' && lk().off1) {
        const r = X.roll(0);
        lk().off1 = 0;
        X.save();
        try { showDarkToast('듣는다 ' + (r.ok ? '✔ ' : '✖ ') + r.total); } catch (e) { }
        if (!r.ok) extra = Object.assign({}, extra || {}, { c: 1 });
    }
    W.pick(cfgOf(d).key, st.t, v, extra);
};
// 장소 화면 공용 — 원고 장면 + 살핀다(한 번) + 단추
function locDraw(title, text, btns, look) {
    const s = lk().s;
    let h = text;
    if (look && !s.look) btns = X.btn('살핀다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.WA.wlook()') + btns;
    if (s.look) h = X.rollHtml(s.look) + h;
    L.draw(title, h, btns);
}
A.wlook = function () { const s = lk().s; if (s.look) return; s.look = X.roll(0); X.save(); X.view(); };
function lookOk() { const s = lk().s; return !!(s.look && s.look.ok); }
function condTxt(x, fn) {
    return paras(x).filter(function (q) {
        const m = q.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || fn(m[1]);
    }).map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, ''); }).join('<br><br>');
}
function contBtn(c) { return X.btn('계속 간다.', 'WONDER.WA.wvis(' + c + ')'); }
function roleOnly(n) { return /에게만$/.test(n) ? n.replace(/에게만$/, '') === myRole() : null; }

// ==========================================
// S1 빨간 모자의 마지막 장
// ==========================================
const S1 = {
    cfg: function () {
        const b = L.x().s1bread;
        return {
            init: function () { return { bread: b, used: false }; },
            danger: function (bt, c, st) {
                const d = bt.breath || String(bt.ph).indexOf('님') >= 0;
                if (d && st.x.bread != null && bt.t > st.x.bread && !st.x.used) { st.x.used = true; return false; }
                return d;
            }
        };
    },
    at: {
        5: function (st, me) {
            const p = plan(); const s = lk().s;
            const here = p.page === '꽃밭';
            const x = condTxt(pg('꽃밭').x, function (n) { return n === '성공 흔적' ? lookOk() : n === '마지막 장이 여기 있는 판' ? (here && s.took) : true; });
            if (s.took) return L.draw('꽃밭', x + sys(here ? '마지막 장을 얻었습니다.' : '종이 귀퉁이만 얻었습니다.'), contBtn(5));
            locDraw('꽃밭', x, X.btn('길을 벗어나 꽃을 꺾는다.', 'WONDER.WA.s1off(5)') + X.btn('길 위에서 바라만 본다.', 'WONDER.WA.wvis(5)'), true);
        },
        10: function (st, me) {
            const p = plan(); const s = lk().s;
            const here = p.page === '큰 나무';
            const x = condTxt(pg('큰 나무 아래').x, function (n) { return n === '마지막 장이 여기 있는 판' ? (here && s.took) : true; });
            if (s.took) return L.draw('큰 나무 아래', (s.r ? X.rollHtml(s.r) : '') + x + sys(s.r && !s.r.ok ? '꼬리가 움찔한다 — 발각' : (here ? '마지막 장을 얻었습니다.' : '귀퉁이뿐이다.'), s.r && !s.r.ok ? '#f44336' : ''), contBtn(10));
            if (s.bread) return L.draw('큰 나무 아래', x + '<br><br>바구니의 빵을 내려놓는다. 코 고는 소리가 길어진다.' + sys('다음 「님」 박자 한 번은 늦게 옵니다.'), contBtn(10));
            locDraw('큰 나무 아래', x, X.btn('길을 벗어나 꼬리를 든다. <span style="font-size:10px;color:#888;">(손재주)</span>', 'WONDER.WA.s1off(10)') + X.btn('바구니의 빵을 내려놓고 지나간다.', 'WONDER.WA.s1bread()') + X.btn('그냥 지나간다.', 'WONDER.WA.wvis(10)'), true);
        },
        15: function (st, me) {
            const s = lk().s;
            const p0 = pg('할머니 집', 0), p1 = pg('할머니 집', 1);
            if (s.ask) {
                const q = paras(p1.x).filter(function (z) { return /^(귀|눈|입) —/.test(z); });
                const shown = q.slice(0, s.ask).join('<br><br>');
                if (s.ask >= 3) { setTimeout(function () { E('끝까지 물었다', 'd'); }, 50); return L.draw('할머니 집', shown, X.waitHtml('_none', '…')); }
                const nextQ = ['', '“할머니, 눈은 왜 그렇게 커요?”', '“할머니, 입은 왜 그렇게 커요?”'][s.ask];
                return L.draw('할머니 집', shown + sys('묻기 ' + s.ask + ' / 3'), X.btn('묻는다. ' + nextQ, 'WONDER.WA.s1ask()') + X.btn('그만두고 나온다.', "WONDER.WA.s1quit()"));
            }
            const os = [];
            if (lk().page) os.push(X.btn('찢긴 자리에 마지막 장을 댄다.', "WONDER.WA.s1end('page')"));
            os.push(X.btn('묻는다. “할머니, 귀는 왜 그렇게 커요?”', 'WONDER.WA.s1ask()'));
            os.push(X.btn('바구니만 두고 나온다.', 'WONDER.WA.s1quit()'));
            L.draw('할머니 집', L.txt(p0.x), os.join(''));
        }
    },
    status: function () { return lk().page ? '<br>📜 마지막 장' : ''; }
};
A.s1off = function (c) {
    const p = plan(); const s = lk().s;
    lk().off = (lk().off || 0) + 1;
    if (lk().off >= 2) {
        if (X.has && X.has('요정 가루') && X.spend('요정 가루')) { lk().off = 1; try { showDarkToast('✨ 요정 가루 — 못 본 척'); } catch (e) { } }
        else { W.event('u_off', { u: 12 }); X.save(); return E('길을 잃다', 'f'); }
    }
    lk().off1 = 1;
    if (c === 10) {
        s.r = X.roll(0);
        if (!s.r.ok) W.event('tail', { c: 1 });
        else if (p.page === '큰 나무') lk().page = 1;
    } else if (p.page === '꽃밭') lk().page = 1;
    s.took = 1;
    X.save(); X.view();
};
A.s1bread = function () { const st = W._st; L.pub('x/s1bread', st ? st.t - 1 : 0); lk().s.bread = 1; X.save(); X.view(); };
A.s1ask = function () { const s = lk().s; s.ask = (s.ask || 0) + 1; X.save(); X.view(); };
A.s1quit = function () { E('시간', 'f'); };
A.s1end = function () { E('마지막 장', 'w'); };

// ==========================================
// S2 양치기 소년
// ==========================================
const S2 = {
    at: {
        5: function () { locDraw('우물가', condTxt(pg('우물가').x, function (n) { return n === '성공 흔적' ? lookOk() : true; }), contBtn(5), true); },
        10: function () {
            const s = lk().s;
            const x = condTxt(pg('양 우리').x, function (n) { return n === '성공 흔적' ? lookOk() : true; });
            if (s.cond) return L.draw('양 우리', X.rollHtml(s.cond) + (s.cond.ok ? '' : '소년의 입이 외침 모양으로 다시 열린다.' + sys('다음 외침이 한 칸 앞당겨집니다.')), s.cond.ok ? X.waitHtml('_none', '…') : contBtn(10));
            locDraw('양 우리', x, X.btn('지휘봉을 든다. <span style="font-size:10px;color:#888;">(연주 · 지휘봉 +3)</span>', 'WONDER.WA.s2cond()') + contBtn(10), true);
        },
        15: function () {
            const s = lk().s;
            const x = condTxt(pg('언덕').x, function (n) { return n === '성공 흔적' ? lookOk() : true; });
            if (s.cond && !s.cond.ok) return locDraw('언덕', X.rollHtml(s.cond) + x, X.btn('믿는다.', "WONDER.WA.s2end('d')") + X.btn('믿지 않는다.', "WONDER.WA.s2end('f')"), true);
            locDraw('언덕', x, X.btn('믿는다.', "WONDER.WA.s2end('d')") + X.btn('믿지 않는다.', "WONDER.WA.s2end('f')") + (s.cond ? '' : X.btn('지휘봉을 든다. <span style="font-size:10px;color:#888;">(연주 · 지휘봉 +3)</span>', 'WONDER.WA.s2cond()')), true);
        }
    },
    reach: function (c) { return (c === 15 && lk().early) ? 14 : c; }
};
A.s2cond = function () {
    const s = lk().s;
    if (s.cond) return;
    s.cond = X.roll(3);
    if (s.cond.ok) { X.save(); return setTimeout(function () { E('잠든 소년', 'w'); }, 900); }
    lk().early = 1;
    X.save(); X.view();
};
A.s2end = function (k) { E(k === 'd' ? '믿어 준 세 번째' : '믿지 않은 진짜', k === 'd' ? 'd' : 'f'); };

// ==========================================
// S3 셋째 돼지의 벽돌 — 노래 사이사이 입김 박자
// ==========================================
const S3 = {
    cfg: function () { const seed = L.rk() + ':s3br'; return { breath: function (j) { return X.srand(seed + j)() < 0.5; } }; },
    at: {
        5: function () { locDraw('짚 집', condTxt(pg('짚 집').x, function (n) { return n === '성공 흔적' ? lookOk() : true; }), contBtn(5), true); },
        10: function () {
            const s = lk().s;
            const x = condTxt(pg('나무 집').x, function (n) { return n === '문을 열었을 때' ? !!s.door : true; });
            if (s.r) return L.draw('나무 집', X.rollHtml(s.r) + (s.r.ok ? '나무판 사이를 밟지 않고 돌아간다.' : '나무판이 삐걱인다.' + sys('발각', '#f44336')), contBtn(10));
            if (s.door) return L.draw('나무 집', x + sys(s.tab ? '금기 접촉 — 이해도 +12 · 두 칸 앞으로' : '요정 가루 — 못 본 척 · 두 칸 앞으로'), contBtn(10));
            L.draw('나무 집', x, X.btn('돌아서 간다. <span style="font-size:10px;color:#888;">(조용히)</span>', 'WONDER.WA.s3round()') + X.btn('문을 열고 지나간다. <span style="font-size:10px;color:#888;">(금기 접촉 · 두 칸 앞으로)</span>', 'WONDER.WA.s3door()'));
        },
        15: function () {
            const s = lk().s;
            const knocks = paras(pg('벽돌 집', 1).x).filter(function (q) { return /^(첫|두|세) 번째 —/.test(q); });
            const k = s.k || 0;
            if (k >= 3) { setTimeout(function () { E('원래대로', 'd'); }, 50); return L.draw('벽돌 집', knocks.join('<br><br>'), X.waitHtml('_none', '…')); }
            let x = (k === 0 ? L.txt(pg('벽돌 집').x) + '<br><br>' : '') + knocks[k];
            if (s.br) x = X.rollHtml(s.br) + (s.br.ok ? '벽돌이 반쯤 빠진다.' : '손이 문고리에 스친다.' + sys(s.tab ? '금기 접촉 — 이해도 +12' : '요정 가루 — 못 본 척', '#f44336')) + '<br><br>' + x;
            if (s.ans) x += '<br><br>“안 돼요, 안 돼요. 내 턱수염을 걸고 안 돼요.”';
            L.draw('벽돌 집', x + sys('두드림 ' + (k + 1) + ' / 3' + (lk().brick ? ' · 벽돌 ' + lk().brick + ' / 2 박자' : '')),
                X.btn((lk().brick ? '벽돌을 마저 뺀다.' : '벽돌을 빼기 시작한다.') + ' <span style="font-size:10px;color:#888;">(손재주)</span>', 'WONDER.WA.s3brick()')
                + X.btn('대답한다. “안 돼요, 안 돼요. 내 턱수염을 걸고 안 돼요.”', 'WONDER.WA.s3ans()') + X.btn('문을 연다.', 'WONDER.WA.s3open()'));
        }
    }
};
A.s3round = function () { const s = lk().s; s.r = X.roll(0); if (!s.r.ok) W.event('wood', { c: 1 }); X.save(); X.view(); };
A.s3door = function () { const s = lk().s; s.door = 1; s.tab = tabooTouch('door10'); W.event('door10p', { pos: 2 }); X.save(); X.view(); };
A.s3brick = function () {
    const s = lk().s;
    const r = X.roll(0);
    s.br = r; s.ans = 0;
    if (r.ok) { lk().brick = (lk().brick || 0) + 1; if (lk().brick >= 2) { X.save(); return E('벽돌 한 장', 'w'); } }
    else s.tab = tabooTouch('knob' + (s.k || 0));
    s.k = (s.k || 0) + 1;
    X.save(); X.view();
};
A.s3ans = function () { const s = lk().s; s.ans = 1; s.br = null; s.k = (s.k || 0) + 1; X.save(); X.view(); };
A.s3open = function () { tabooTouch('open'); E('문을 열었다', 'f'); };

// ==========================================
// S4 찢겨진 늑대의 장 — 뒤따라오는 잠든 늑대
// ==========================================
function s4dist() { return 4 - (lk().pages || 0) - (lk().extra || 0); }
const S4 = {
    status: function () { return '<br>📜 찢긴 장 ' + (lk().pages || 0) + ' / 3 · 🐺 뒤의 늑대 ' + Math.max(0, s4dist()) + '칸'; },
    check: function () { return (lk().pages != null && s4dist() <= 0) ? ['끌려감', 'f'] : null; },
    at: {
        5: function () {
            const s = lk().s;
            const x = condTxt(pg('서가').x, function (n) { return n === '성공 흔적' ? !!(s.r && s.r.ok) : true; });
            if (s.r) return L.draw('서가', X.rollHtml(s.r) + x + sys(s.r.ok ? '찢긴 장을 주웠습니다 · 늑대 한 칸' : '손이 미끄러진다. 장이 책장 뒤로 넘어간다.'), contBtn(5));
            L.draw('서가', x, X.btn('줍는다. <span style="font-size:10px;color:#888;">(뒤진다 · 늑대 한 칸)</span>', 'WONDER.WA.s4take(5)') + X.btn('두고 간다.', 'WONDER.WA.wvis(5)'));
        },
        10: function () {
            const s = lk().s;
            const x = condTxt(pg('열람실').x, function (n) { return n === '성공 흔적' ? !!s.took : true; });
            if (s.took) return L.draw('열람실', (s.r ? X.rollHtml(s.r) : '') + x + sys(s.took === 2 ? '모자째 들었습니다 · 뒤의 늑대가 눈을 반쯤 뜬다 · 늑대 두 칸' : s.r && !s.r.ok ? '방울이 울린다 — 발각' : '찢긴 장을 꺼냈습니다 · 늑대 한 칸', s.r && !s.r.ok ? '#f44336' : ''), contBtn(10));
            L.draw('열람실', x, X.btn('장만 조심히 꺼낸다. <span style="font-size:10px;color:#888;">(손재주)</span>', 'WONDER.WA.s4hat(1)') + X.btn('모자째 든다.', 'WONDER.WA.s4hat(2)') + X.btn('두고 간다.', 'WONDER.WA.wvis(10)'));
        },
        15: function () {
            const s = lk().s;
            const n = lk().pages || 0;
            const x = condTxt(pg('반납대').x, function (t) { return t === '찢긴 장을 하나도 줍지 않았을 때' ? n === 0 : true; });
            const os = [];
            if (!s.knee) os.push(X.btn('무릎을 꿇고 꺼낸다. <span style="font-size:10px;color:#888;">(찢긴 장 · 늑대 한 칸)</span>', 'WONDER.WA.s4knee()'));
            os.push(X.btn('반납 카드에 이름을 적는다.', "WONDER.WA.s4end('d')"));
            if (n >= 3) os.push(X.btn('장을 들고 책을 덮는다.', "WONDER.WA.s4end('w')"));
            L.draw('반납대', x + (s.knee ? sys('찢긴 장을 꺼냈습니다. 뒤의 숨소리가 정수리에 닿는다.') : ''), os.join(''));
        }
    }
};
A.s4take = function (c) {
    const s = lk().s;
    lk().pages = lk().pages || 0;
    if (X.has && X.has('책갈피') && X.spend('책갈피')) s.r = { raw: 30, bonus: 0, total: 30, ok: true };
    else s.r = L.roll('search');
    if (s.r.ok) lk().pages++;
    X.save(); X.view();
};
A.s4hat = function (k) {
    const s = lk().s;
    lk().pages = (lk().pages || 0);
    if (k === 2) { lk().pages++; lk().extra = (lk().extra || 0) + 1; s.took = 2; }
    else { s.r = X.roll(0); if (s.r.ok) lk().pages++; else W.event('bell', { c: 1 }); s.took = 1; }
    X.save(); X.view();
};
A.s4knee = function () { const s = lk().s; lk().pages = (lk().pages || 0) + 1; s.knee = 1; X.save(); X.view(); };
A.s4end = function (k) { E(k === 'w' ? '세 장' : '반납 기록', k); };

// ==========================================
// 팀 공용 — 과반 세 번째 발각 · 모두 도착
// ==========================================
function majority(st) {
    const mem = plan().mem;
    const n = mem.filter(function (c) { return st.per[c] && st.per[c].cat >= 3; }).length;
    return n * 2 > mem.length;
}
function allIn(st) {
    return plan().mem.every(function (c) { const p = st.per[c]; return !p || p.done || p.out || X.actives().indexOf(c) < 0; })
        && plan().mem.some(function (c) { return st.per[c] && st.per[c].done; });
}
// 함께 고르기 화면 (투표) — 모두 고르면 resolve(map) 를 부른다
function tvote(id, title, text, opts, resolve, who) {
    const m = L.votes(id);
    who = who || X.actives().filter(function (c) { return plan().mem.indexOf(c) >= 0; });
    if (m[ME()] == null && who.indexOf(ME()) >= 0) {
        L.draw(title, text, opts.map(function (o) { return X.btn(o.l, "WONDER.WA.wv('" + id + "','" + o.v + "'" + (o.roll != null ? ',' + o.roll : '') + ')'); }).join(''));
        return true;
    }
    if (!who.every(function (c) { return m[c] != null; })) { L.draw(title, text, L.waitList(m, who)); return true; }
    return resolve(m) !== false;
}
A.wv = function (id, v, roll) {
    if (L.votes(id)[ME()] != null) return;
    if (roll != null) { const r = X.roll(roll); L.vote(id, { v: v, ok: r.ok, n: r.total }); try { showDarkToast((r.ok ? '✔ ' : '✖ ') + r.total); } catch (e) { } return; }
    L.vote(id, v);
};
function teamCheck(extra) {
    return function (st, cfg) {
        if (majority(st)) return [L.endings()['과반 발각'] ? '과반 발각' : '발각', 'f', { drag: 1 }];
        return extra ? extra(st, cfg) : null;
    };
}
function dragMine(end, e) {
    if (!end.drag) return null;
    const st = W._st;
    const me = st && st.per[ME()];
    if (end.drag === 1 && !(me && me.cat >= 3 && !me.out)) return null;
    if (Array.isArray(end.drag) && end.drag.indexOf(ME()) < 0) return null;
    return dragEnd(e);
}

// ==========================================
// T1 달님을 깨우지 마세요
// ==========================================
const T1 = {
    cfg: function () {
        return {
            onBeat: function (b, picks, st, req) {
                if (req.some(function (c) { return val(picks[c]) === 'call'; })) {
                    req.forEach(function (c) { if (!st.per[c].done) st.per[c].cat++; });
                    st.x.called = b.t;
                    st.x.ever = 1;
                    const rv = L.votes('rope' + b.t);
                    const all = X.actives().filter(function (c) { return plan().mem.indexOf(c) >= 0; }).every(function (c) { return rv[c] != null; });
                    if (!all) st.stop = 1;
                }
            }
        };
    },
    extra: function (st, me) { return me.stops < 2 ? X.btn('「부른다」 — 달님을 깨운다. <span style="font-size:10px;color:#888;">(정지 · 길 위의 모두 발각 1)</span>', "WONDER.WA.wpick('call')") : ''; },
    overlay: function (st) {
        const t = st.x.called;
        if (t == null) return false;
        const rv = L.votes('rope' + t);
        const who = X.actives().filter(function (c) { return plan().mem.indexOf(c) >= 0; });
        if (who.every(function (c) { return rv[c] != null; })) {
            const vs = who.map(function (c) { return rv[c]; });
            if (vs.indexOf('fast') >= 0) { E('썩은 동아줄', 'f'); return false; }
            const sib = plan().mrole;
            if (rv[sib] === 'slow') { E('하늘로', 'd'); return false; }
            return false;
        }
        const x = condTxt(pg('동아줄').x, function (n) { const r = roleOnly(n); return r === null ? true : r; });
        return tvote('rope' + t, '동아줄', x, [{ l: '천천히 내려온 줄을 잡는다.', v: 'slow' }, { l: '빠르게 내려온 줄을 잡는다.', v: 'fast' }, { l: '잡지 않는다.', v: 'none' }], function () { return false; }, who);
    },
    check: teamCheck(function (st) {
        if (allIn(st)) return st.x.ever ? ['시간', 'f'] : ['아무도 깨우지 않았다', 'w'];
        return null;
    }),
    at: {
        5: function () { locDraw('오솔길', condTxt(pg('오솔길').x, function (n) { const r = roleOnly(n); return r !== null ? r : (n === '성공 흔적' ? lookOk() : true); }), contBtn(5), true); },
        10: function () { locDraw('수수밭', condTxt(pg('수수밭').x, function (n) { return n === '성공 흔적' ? lookOk() : true; }), contBtn(10), true); },
        15: function () { L.draw('오두막', L.txt(pg('오두막').x), contBtn(15)); }
    }
};

// ==========================================
// T2 문 열어라 — 두드림 다섯 번, 사이마다 세 박자
// ==========================================
const T2_CLUE = {
    voice: { n: '목소리', wolf: ['거칠다.', '곱다. 끝이 조금 길다.', '곱다. 끝이 조금 길다.', '곱다. 끝이 길다.', '곱다. 끝이 아주 조금 길다.'], mom: '곱다. 끝이 짧다.' },
    feet: { n: '문틈의 발', wolf: ['검다.', '검다.', '하얗다. 문턱에 하얀 가루가 떨어져 있다.', '하얗다. 하얀 가루가 떨어져 있다.', '하얗다. 가루가 조금 떨어져 있다.'], mom: '하얗다. 가루는 없다.' },
    step: { n: '발소리', wolf: ['무겁다.', '조심스럽다. 마지막 한 걸음이 무겁다.', '가볍다. 마지막 한 걸음이 무겁다.', '가볍다. 마지막 한 걸음이 무겁다.', '가볍다. 마지막 한 걸음이 조금 무겁다.'], mom: '똑똑하고 가볍다. 마지막 걸음도 가볍다.' }
};
function t2knocks() { const x = L.x(); let n = 0; for (let i = 0; i < 5; i++) if (x['t2k' + i] != null) n++; return n; }
const T2 = {
    cfg: function () {
        return {
            goal: 999,
            active: function (c, st, t) { return t < 3 * (t2knocks() + 1) && t2knocks() < 5; }
        };
    },
    title: '집 안',
    head: function () { return '<div class="wd-sys">두드림 ' + Math.min(5, t2knocks() + 1) + ' / 5 사이 — 전진하면 집 안을 뒤지고, 정지하면 숨습니다.</div>'; },
    status: function () { return L.x().t2mom ? '<br>엄마에게 문을 열었다 — 막내를 찾아야 한다' : ''; },
    overlay: function (st) {
        const k = t2knocks();
        if (st.t < 3 * (k + 1) || k >= 5) return false;
        const p = plan();
        const x = L.x();
        const isMom = p.mom === k;
        const clue = p.clue[ME()];
        const C = T2_CLUE[clue];
        let text = '똑, 똑, 똑.<br><br>“얘들아, 문 열어라. 엄마 왔다.”<br><br>' + (C ? '<b>' + C.n + '</b> — ' + (isMom ? C.mom : C.wolf[k]) + '<br><br>' : '') + '시계 안의 목소리가 따라 말한다. “문 열어 줘. 엄마 맞아.”' + sys('두드림 ' + (k + 1) + ' / 5 · 단서는 채팅으로만 나눌 수 있습니다');
        if (x.t2mom) {
            text = '두드림이 이어진다. 엄마 염소가 문 앞에서 기다린다. “막내는?”<br><br>' + L.txt(pg('괘종시계').x) + sys('두드림 ' + (k + 1) + ' / 5');
            return tvote('t2c' + k, '괘종시계', text, [{ l: '진자가 멈춘 시계를 연다.', v: 'stop' }, { l: '왼쪽 시계를 연다.', v: 'l' }, { l: '오른쪽 시계를 연다.', v: 'r' }], function (m) {
                const t = L.tally(m);
                if (t.win === 'stop') { E('엄마에게만', 'd'); return false; }
                if (k >= 4) { E('막내를 못 찾았다', 'f'); return false; }
                L.tx('x/t2k' + k, function (c) { return c == null ? 'c' : c; });
                return false;
            });
        }
        return tvote('t2k' + k, '두드림', text, [{ l: '문을 연다.', v: 'open' }, { l: '열지 않는다.', v: 'no' }], function (m) {
            const t = L.tally(m);
            const open = t.win === 'open';
            if (open && isMom) { L.tx('x/t2mom', function (c) { return c || 1; }); L.tx('x/t2k' + k, function (c) { return c == null ? 'o' : c; }); return false; }
            if (open) {
                const who = Object.keys(m).filter(function (c) { return m[c] === 'open'; });
                if (who.indexOf(ME()) >= 0 && isRole('goat')) tabooTouch('goat' + k);
                E('늑대에게 열었다', 'f', { drag: who });
                return false;
            }
            if (k >= 4) { E('끝까지', 'w'); return false; }
            L.tx('x/t2k' + k, function (c) { return c == null ? 'n' : c; });
            return false;
        });
    },
    caughtTxt: '뒤지던 손이 멈춘다. 문 너머가 조용해진다.',
    pick: function (st, me, cfg) {
        let b = X.btn('집 안을 뒤진다. <span style="font-size:10px;color:#888;">(전진)</span>', "WONDER.WA.wpick('go')");
        if (me.stops < 2) b += X.btn('숨는다. <span style="font-size:10px;color:#888;">(정지)</span>', "WONDER.WA.wpick('stop')");
        else b += sys('두 번 연속 숨었습니다. 이번에는 움직여야 합니다.');
        return b + W.itemBtns(st);
    },
    doneView: function () { L.draw('—', '', X.waitHtml('_none', '…')); }
};

// ==========================================
// T3 다시 엮는 책 — 숲 조와 책 조
// ==========================================
function t3g(c) { const p = plan(); return p.groups[0].indexOf(c) >= 0 ? 0 : 1; }
function t3pages(st) { let n = 0; plan().groups[1].forEach(function (c) { n += (st.per[c] ? st.per[c].pos : 0); }); return Math.min(10, n); }
function t3forestDone(st) { return plan().groups[0].every(function (c) { const p = st.per[c]; return !p || p.done || p.out || p.cat >= 3 || X.actives().indexOf(c) < 0; }); }
const T3 = {
    cfg: function (p) {
        const goal = 15;
        return {
            goal: 999,
            active: function (c, st) { return !t3forestDone(st) && !(t3g(c) === 0 && st.per[c].pos >= goal); },
            onBeat: function (b, picks, st, req) {
                const f = req.filter(function (c) { return t3g(c) === 0 && val(picks[c]) === 'go'; });
                const k = req.filter(function (c) { return t3g(c) === 1 && val(picks[c]) === 'go'; });
                if (f.length && k.length) f.concat(k).forEach(function (c) { st.per[c].cat++; st.per[c].res[b.t].caught = true; });
                p.groups[0].forEach(function (c) { if (st.per[c] && st.per[c].pos >= goal) st.per[c].done = true; });
            }
        };
    },
    title: '두 갈래',
    head: function (st, me) {
        const g = t3g(ME());
        return (st.t === 0 ? L.txt(pg(g === 0 ? '숲 길' : '책장 사이').x).split('<br><br>').slice(0, 2).join('<br><br>') + '<br><br>' : '')
            + sys('당신은 ' + (g === 0 ? '숲 조 — 오두막까지 15칸' : '책 조 — 찢어진 장 열 장') + ' · 모은 장 ' + t3pages(st) + ' / 10 · 두 조가 같은 박자에 움직이면 모두 발각');
    },
    pick: function (st, me, cfg) {
        const g = t3g(ME());
        let b = X.btn(g === 0 ? '전진한다.' : '장을 넘겨 줍는다. <span style="font-size:10px;color:#888;">(움직임)</span>', "WONDER.WA.wpick('go')");
        if (me.stops < 2) b += X.btn('정지한다.', "WONDER.WA.wpick('stop')");
        else b += sys('두 번 연속 멈췄습니다. 이번에는 움직여야 합니다.');
        return b + W.itemBtns(st);
    },
    status: function (st, me) { return t3g(ME()) === 1 ? '<br>(책 조: 남은 걸음 대신 주운 장)' : ''; },
    check: function (st) {
        const p = plan();
        for (let g = 0; g < 2; g++) if (p.groups[g].length && p.groups[g].every(function (c) { return st.per[c] && st.per[c].cat >= 3; })) return ['발각', 'f', { drag: p.groups[g] }];
        return null;
    },
    overlay: function (st) {
        if (!t3forestDone(st)) return false;
        const n = t3pages(st);
        const x = L.txt(pg('오두막').x) + sys('모은 장 ' + n + ' / 10');
        return tvote('t3cab', '오두막', x, [{ l: '털실과 바늘로 찢긴 장을 엮는다.', v: 'weave' }, { l: '모은 장을 전부 반납함에 넣는다.', v: 'ret' }], function (m) {
            const t = L.tally(m);
            if (t.win === 'weave') E(n >= 10 ? '다시 엮은 책' : '한 장 모자람', n >= 10 ? 'w' : 'f');
            else E('전부 반납', 'd');
            return false;
        });
    }
};

// ==========================================
// T4 양 백 마리
// ==========================================
const T4 = {
    cfg: function () {
        return {
            init: function () { return { counted: 0, lost: 0, ever: 0 }; },
            onBeat: function (b, picks, st, req) {
                const cs = req.filter(function (c) { return val(picks[c]) === 'count'; });
                if (cs.length >= 2) { st.x.lost += st.x.counted; st.x.counted = 0; st.x.tangle = b.t; }
                else if (cs.length === 1) { st.x.counted += 10; st.x.ever = 1; }
            }
        };
    },
    head: function (st) { return sys('센 양 ' + st.x.counted + ' / 100 · 돌아오지 않은 양 ' + st.x.lost + (st.x.tangle === st.t - 1 ? ' · 숫자가 엉켰다 — 처음부터' : '')); },
    extra: function (st, me) { return (me.pos >= 10 && me.stops < 2) ? X.btn('「센다」 — 열 마리. <span style="font-size:10px;color:#888;">(정지 · 같은 박자에 둘이 세면 처음부터)</span>', "WONDER.WA.wpick('count')") : ''; },
    check: teamCheck(function (st) {
        if (st.x.counted >= 100) return ['백 마리', 'w'];
        if (st.x.lost > 50) return ['반을 넘었다', 'f'];
        if (allIn(st)) return st.x.ever ? ['시간', 'f'] : ['자장가만으로', 'd'];
        return null;
    }),
    at: {
        10: function () { locDraw('낮은 문', condTxt(pg('낮은 문').x, function (n) { return n === '성공 흔적' ? lookOk() : true; }) + '<br><br>' + L.txt(pg('큰 나무 아래').x), contBtn(10), true); },
        15: function () { L.draw('오두막', L.txt(pg('오두막').x), contBtn(15)); }
    }
};

// ==========================================
// T5 유리 구두의 주인 — 「님」 대신 자정의 종
// ==========================================
const T5_FOOT = {
    size: ['발이 구두에 꼭 맞을 것 같다.', '발이 구두보다 조금 크다.'],
    ash: ['발등에 재가 묻어 있다. 털어도 남는다.', '발등이 깨끗하다.'],
    scar: ['발뒤꿈치에 긁힌 상처가 있다. 오래 뛴 발이다.', '발뒤꿈치가 매끈하다.']
};
function t5bells(st) { let n = 0; for (let t = 0; t < st.t; t++) { const b = W.beat(cfgOf(L.def()), t); if (b && b.last) n++; } return n; }
const T5 = {
    hideRole: true,
    firstNote: function () {
        const p = plan();
        const k = p.foot[ME()];
        return '<div class="wd-note" style="border-color:#3a3220;">당신의 발 — ' + T5_FOOT[k][p.mrole === ME() ? 0 : 1] + '<br><span style="font-size:10px;color:#888;">자기 발은 자기만 봅니다. 본 것은 채팅으로만 나눌 수 있습니다.</span></div>';
    },
    head: function (st) { return sys('자정의 종 ' + t5bells(st) + ' / 12 — 「님」 대신 종이 울리는 박자에 움직이면 발각'); },
    caughtTxt: '종이 울리는 박자였다.',
    extra: function (st, me) { return (!L.x().t5done && me.stops < 2) ? X.btn('방석 앞에 선다. <span style="font-size:10px;color:#888;">(정지 · 신기거나 돌려준다)</span>', "WONDER.WA.wpick('cush')") : ''; },
    cfg: function () {
        return {
            onBeat: function (b, picks, st, req) {
                if (req.some(function (c) { return val(picks[c]) === 'cush'; }) && L.x()['t5c' + b.t] == null && !L.x().t5done) { st.x.cush = b.t; st.stop = 1; }
            }
        };
    },
    overlay: function (st) {
        const x = L.x();
        const p = plan();
        const need = (st.x.cush != null && x['t5c' + st.x.cush] == null && !x.t5done) ? st.x.cush : (allIn(st) && !x.t5done ? 'end' : null);
        if (need == null) return false;
        const id = 't5v' + need;
        const pgx = L.txt(pg('방석').x);
        const opts = [];
        p.mem.forEach(function (c) { opts.push({ l: '신긴다 — ' + esc(nm(c)), v: 's:' + c }); });
        p.mem.forEach(function (c) { opts.push({ l: '구두를 돌려준다 — ' + esc(nm(c)), v: 'r:' + c }); });
        if (need !== 'end') opts.push({ l: '아직 고르지 않는다.', v: 'no' });
        return tvote(id, '방석', pgx, opts, function (m) {
            const t = L.tally(m);
            const w = t.win || 'no';
            if (w === 'no') { if (need === 'end') E('엉뚱한 발', 'f'); else L.tx('x/t5c' + need, function (c) { return c == null ? 'no' : c; }); return false; }
            const who = w.slice(2);
            if (who !== p.mrole) { E('엉뚱한 발', 'f'); return false; }
            if (w.charAt(0) === 'r') { E('주인을 맞혔다', 'w'); return false; }
            L.tx('x/t5done', function (c) { return c || 's'; });
            L.tx('x/t5c' + need, function (c) { return c == null ? 's' : c; });
            if (need === 'end') E(st.per[p.mrole] && st.per[p.mrole].done ? '자정 전에' : '자정을 넘겼다', st.per[p.mrole] && st.per[p.mrole].done ? 'd' : 'f');
            return false;
        });
    },
    check: function (st) {
        const p = plan();
        const cin = st.per[p.mrole];
        if (t5bells(st) >= 12 && cin && !cin.done) return ['자정을 넘겼다', 'f'];
        if (L.x().t5done && cin && cin.done && allIn(st)) return ['자정 전에', 'd'];
        if (majority(st)) return ['시간', 'f', { drag: 1 }];
        return null;
    },
    at: {
        10: function () { locDraw('시계탑 아래', condTxt(pg('시계탑 아래').x, function (n) { return n === '성공 흔적' ? lookOk() : true; }), contBtn(10), true); }
    }
};

// ==========================================
// T6 한 입 사과
// ==========================================
function t6holder() {
    const p = plan();
    const x = L.x();
    let h = p.apple;
    const hs = x.t6h || {};
    Object.keys(hs).map(Number).sort(function (a, b) { return a - b; }).forEach(function (k) { h = hs[k]; });
    if (X.actives().indexOf(h) < 0) { const alive = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0 && c !== p.mrole; }); if (alive.length) h = alive[0]; }
    return h;
}
const T6 = {
    head: function () { const h = t6holder(); return sys('🍎 사과 — ' + esc(nm(h)) + (h === ME() ? ' (당신)' : '')); },
    pick: function (st, me, cfg) {
        const h = t6holder();
        const x = L.x();
        const off = x.t6off;
        if (off && off.to === ME() && x['t6a' + off.id] == null) {
            return X.btn('사과를 받는다.', "WONDER.WA.t6acc('" + off.id + "',1)") + X.btn('거절한다.', "WONDER.WA.t6acc('" + off.id + "',0)");
        }
        let b = X.btn('전진한다.', "WONDER.WA.wpick('go')");
        if (me.stops < 2) {
            if (h === ME()) {
                b += X.btn('정지한다. <span style="font-size:10px;color:#888;">(버틴다 · 불리)</span>', 'WONDER.WA.t6hold()');
                const nx = t6next();
                if (nx && !(off && x['t6a' + off.id] == null)) b += X.btn('정지하고 사과를 넘긴다 — ' + esc(nm(nx)), 'WONDER.WA.t6pass()');
            } else b += X.btn('정지한다.', "WONDER.WA.wpick('stop')");
        } else b += sys('두 번 연속 멈췄습니다. 이번에는 반드시 전진해야 합니다.');
        return b + W.itemBtns(st);
    },
    check: teamCheck(),
    at: {
        5: function () {
            const h = t6holder();
            const x = condTxt(pg('난쟁이의 줄').x, function (n) { return n === '성공 흔적' ? lookOk() : true; });
            locDraw('난쟁이의 줄', x, (h === ME() ? X.btn('바구니에 사과를 돌려놓는다.', "WONDER.WA.t6end('w')") : '') + X.btn('지나간다.', 'WONDER.WA.wvis(5)'), true);
        },
        10: function () { L.draw('유리관', condTxt(pg('유리관').x, function (n) { const r = roleOnly(n); return r === null ? true : r; }), contBtn(10)); },
        15: function () {
            const h = t6holder();
            const x = L.txt(pg('큰 나무 아래').x);
            if (h !== ME()) return L.draw('큰 나무 아래', x + sys('사과는 ' + esc(nm(h)) + '에게 있습니다.'), contBtn(15));
            L.draw('큰 나무 아래', x, X.btn('머리맡에 사과를 놓는다.', "WONDER.WA.t6end('d')") + X.btn('사과를 들고 돌아서서 난쟁이들에게 간다.', "WONDER.WA.t6end('w')"));
        }
    },
    doneView: function (st, me) {
        const h = t6holder();
        const left = W.who(cfgOf(L.def()), st);
        if (allIn(st)) return L.draw('큰 나무 아래', '모두 큰 나무 아래에 닿았다. 사과는 ' + esc(nm(h)) + '의 손에 있다.', h === ME() ? X.btn('머리맡에 사과를 놓는다.', "WONDER.WA.t6end('d')") + X.btn('난쟁이들에게 돌려준다.', "WONDER.WA.t6end('w')") : X.waitHtml('_none', esc(nm(h)) + '이(가) 고르는 중입니다.'));
        L.draw('—', '큰 나무 아래에 닿았다. 일행을 기다린다.', '<div class="wd-wait">' + left.map(function (c) { return '… ' + esc(nm(c)); }).join(' · ') + '</div>');
    }
};
function t6next() { const p = plan(); const al = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }); const i = al.indexOf(ME()); return al.length > 1 ? al[(i + 1) % al.length] : null; }
A.t6hold = function () {
    const r1 = X.roll(0), r2 = X.roll(0);
    const lo = r1.total < r2.total ? r1 : r2;
    try { showDarkToast('버틴다 ' + r1.total + ' · ' + r2.total + ' → ' + lo.total); } catch (e) { }
    A.wpick('stop', lo.ok ? null : { c: 1 });
};
A.t6pass = function () {
    const nx = t6next();
    if (!nx) return;
    const id = 'o' + Date.now().toString(36);
    L.pub('x/t6off', { id: id, to: nx, from: ME(), t: W._st.t });
    A.wpick('stop');
};
A.t6acc = function (id, yes) {
    const x = L.x();
    const off = x.t6off;
    if (!off || off.id !== id) return;
    L.pub('x/t6a' + id, yes ? 1 : 0);
    if (yes) {
        if (plan().mrole === ME()) { E('백설공주가 받았다', 'f', { drag: [ME()] }); return; }
        L.pub('x/t6h/' + Date.now(), ME());
    }
};
A.t6end = function (k) { E(k === 'd' ? '머리맡에' : '난쟁이에게', k); };

// ==========================================
// T7 세 번째 소원
// ==========================================
const T7_WISH = { ever: '나쁜 늑대님이 영원히 주무시게', free: '램프의 자유', other: '오두막 난로가 꺼지지 않게' };
function t7wishes() { const x = L.x(); return Object.keys(x.t7w || {}).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return x.t7w[k]; }); }
const T7 = {
    cfg: function () {
        return {
            danger: function (b, c, st) {
                const ws = L.x().t7w || {};
                const n = Object.keys(ws).filter(function (k) { return +k < b.t; }).length;
                const base = b.breath || String(b.ph).indexOf('님') >= 0;
                return base || (n >= 1 && b.k >= b.n - 1 - n);
            },
            onBeat: function (b, picks, st, req) {
                if (req.some(function (c) { return val(picks[c]) === 'rub'; }) && L.x()['t7d' + b.t] == null) { st.x.rub = b.t; st.stop = 1; }
            }
        };
    },
    head: function () { return sys('소원 ' + t7wishes().length + ' / 3' + (L.x().t7lamp ? ' · 🪔 램프' : '')); },
    extra: function (st, me) { return (isRole('ala') && L.x().t7lamp && me.stops < 2) ? X.btn('램프를 문지른다. <span style="font-size:10px;color:#888;">(정지 · 소원)</span>', "WONDER.WA.wpick('rub')") : ''; },
    overlay: function (st) {
        const t = st.x.rub;
        const x = L.x();
        if (t == null || x['t7d' + t] != null) return false;
        const n = t7wishes().length;
        const sc = pg('소원');
        const txt = paras(sc.x).slice(0, 2).join('<br><br>') + '<br><br>' + (paras(sc.x).filter(function (q) { return q.indexOf('“' + ['하나', '둘', '셋'][n] + '.') === 0; })[0] || '') + sys('소원 ' + (n + 1) + ' / 3 · 쪽지에 적어 투표합니다 (동점이면 알라딘)');
        const opts = Object.keys(T7_WISH).map(function (k) { return { l: '「' + T7_WISH[k] + '」', v: k }; });
        if (isRole('ala') && L.votes('t7v' + t)[ME()] == null) {
            const extra = Object.keys(T7_WISH).map(function (k) { return X.btn('소리 내어 빈다 — 「' + T7_WISH[k] + '」 <span style="font-size:10px;color:#888;">(금기 접촉)</span>', "WONDER.WA.t7shout(" + t + ",'" + k + "')"); }).join('');
            L.draw('소원', txt, opts.map(function (o) { return X.btn(o.l, "WONDER.WA.wv('t7v" + t + "','" + o.v + "')"); }).join('') + extra);
            return true;
        }
        return tvote('t7v' + t, '소원', txt, opts, function (m) {
            const tl = L.tally(m);
            const w = tl.win || m[plan().mrole] || 'other';
            t7apply(t, val(w));
            return false;
        });
    },
    check: teamCheck(function (st) {
        const ws = t7wishes();
        if (ws.indexOf('ever') >= 0) return ['영원히', 'w'];
        if (ws.length >= 3 && ws[2] === 'free') return ['세 번째 소원', 'd'];
        if (ws.length >= 3) return ['엉뚱한 소원 셋', 'f'];
        if (allIn(st)) return ['시간', 'f'];
        return null;
    }),
    at: {
        5: function () {
            const x = condTxt(pg('굴').x, function (n) { const r = roleOnly(n); return r !== null ? r : (n === '성공 흔적' ? lookOk() : true); });
            if (isRole('ala') && !L.x().t7lamp) return locDraw('굴', x, X.btn('램프를 꺼낸다.', 'WONDER.WA.t7lamp()') + X.btn('두고 나간다.', 'WONDER.WA.wvis(5)'), true);
            locDraw('굴', x + (L.x().t7lamp ? sys('램프는 알라딘의 손에 있습니다.') : ''), contBtn(5), true);
        }
    }
};
function t7apply(t, w) {
    L.tx('x/t7d' + t, function (c) {
        if (c != null) return;
        return w;
    }).then(function (r) {
        if (r && r.committed) L.pub('x/t7w/' + t, w);
    });
}
A.t7lamp = function () { L.pub('x/t7lamp', 1); A.wvis(5); };
A.t7shout = function (t, k) { tabooTouch('shout' + t); L.vote('t7v' + t, k); t7apply(t, k); };

// ==========================================
// T8 잠들지 않는 밤 — 발각은 일행이 함께
// ==========================================
function t8team(st) { let n = 0; plan().mem.forEach(function (c) { if (st.per[c]) n += st.per[c].cat; }); return Math.max(0, n); }
const T8 = {
    cfg: function () {
        return {
            noOut: true,
            onBeat: function (b, picks, st, req) {
                const pl = req.filter(function (c) { return val(picks[c]) === 'play'; }).sort();
                if (pl.length && st.x.play == null) { st.x.play = pl[0]; st.x.playN = picks[pl[0]].n; st.x.playOk = picks[pl[0]].ok; st.stop = 1; }
                // 네 번째 발각부터 오두막 문이 잠긴다 — 그 뒤로는 도착해도 들어가지 못한다
                const n = t8team(st);
                if (n >= 4) plan().mem.forEach(function (c) { const p = st.per[c]; if (p && p.done && !p.inside) p.done = false; });
                plan().mem.forEach(function (c) { const p = st.per[c]; if (p && p.done) p.inside = true; });
            },
            active: function (c, st) { return true; }
        };
    },
    head: function (st) { const n = t8team(st); return sys('함께 쓴 발각 ' + n + ' / 3' + (n >= 4 ? ' — 오두막 문이 잠겼다' : '')); },
    extra: function (st, me) {
        if (me.stops >= 2) return '';
        const bonus = Math.max(0, 3 - t8team(st)) * 3;
        return X.btn('「놀아 준다」 — 혼자 남는다. <span style="font-size:10px;color:#888;">(판정 +' + bonus + ' · 나머지는 책 밖으로)</span>', "WONDER.WA.t8play(" + bonus + ")");
    },
    check: function (st) {
        const n = t8team(st);
        if (st.x.play) return st.x.playOk ? ['술래잡기', 'd', { volunteer: st.x.play }] : ['잡혔다', 'f', { drag: [st.x.play] }];
        if (n >= 5) return ['다섯 번째', 'f', { drag: plan().mem.slice() }];
        if (n <= 3 && plan().mem.every(function (c) { const p = st.per[c]; return !p || p.done || X.actives().indexOf(c) < 0; })) return ['다 같이', 'w'];
        return null;
    },
    status: function () { return ''; },
    at: {
        7: function () {
            const s = lk().s;
            const x = condTxt(pg('큰 나무 앞').x, function (n) { return n === '성공 흔적' ? (lookOk() || !!s.r) : true; });
            if (s.r) return L.draw('큰 나무 앞', X.rollHtml(s.r) + x + sys(s.r.ok ? '모자가 제자리에 앉는다 — 함께 쓴 발각 하나를 돌려받았습니다' : '손이 귀에 스친다 — 발각', s.r.ok ? '' : '#f44336'), contBtn(7));
            locDraw('큰 나무 앞', x, X.btn('모자를 머리 위로 올려 준다. <span style="font-size:10px;color:#888;">(손재주)</span>', 'WONDER.WA.t8hat()') + X.btn('그냥 지나간다.', 'WONDER.WA.wvis(7)'), true);
        },
        15: function (st) { L.draw('오두막 문', condTxt(pg('오두막 문').x, function (n) { return n === '네 번째 발각 뒤' ? t8team(st) >= 4 : true; }), contBtn(15)); }
    }
};
A.t8play = function (bonus) { const r = X.roll(bonus); try { showDarkToast((r.ok ? '✔ ' : '✖ ') + r.total); } catch (e) { } A.wpick('play', { ok: r.ok, n: r.total }); };
A.t8hat = function () { const s = lk().s; s.r = X.roll(0); if (!s.r.ok) W.event('hat', { c: 1 }); else if (W._st && t8team(W._st) > 0) W.event('hat', { c: -1 }); X.save(); X.view(); };

// ==========================================
// 미션 표
// ==========================================
function M(base, o) {
    return Object.assign({ key: 'w_new', enterIdx: 20, returnIdx: 21, base: base, timeEnd: '시간', wolf: true, steps: [{ k: 'wenter' }, { k: 'wfirst' }, { k: 'rules' }, { k: 'wwalk' }] }, o);
}
function soloEnd(end, e) {
    if (['발각 세 번', '문을 열었다', '끌려감'].indexOf(end.t) >= 0) return dragEnd(e);
    return null;
}
L.M.wolf = {
    S1: M(22, { plan: function (p, rnd) { rolePlan(p, rnd, null); p.trole[p.mem[0]] = MROLE.hood; p.role[p.mem[0]] = MROLE.hood.n; p.page = rnd() < 0.5 ? '꽃밭' : '큰 나무'; }, walk: S1, endMine: soloEnd }),
    S2: M(29, { plan: function (p, rnd) { rolePlan(p, rnd, null); }, walk: S2, endMine: soloEnd }),
    S3: M(36, { plan: function (p, rnd) { rolePlan(p, rnd, null); p.trole[p.mem[0]] = MROLE.pig; p.role[p.mem[0]] = MROLE.pig.n; }, walk: S3, endMine: soloEnd }),
    S4: M(43, { plan: function (p, rnd) { rolePlan(p, rnd, null); }, walk: S4, endMine: soloEnd }),
    T1: M(50, { plan: function (p, rnd) { rolePlan(p, rnd, 'sib'); }, walk: T1, endMine: dragMine }),
    T2: M(58, {
        plan: function (p, rnd) {
            rolePlan(p, rnd, 'goat');
            p.mom = Math.floor(rnd() * 5);
            const types = p.mem.length === 2 ? ['voice', 'step'] : X.shuffle(['voice', 'feet', 'step'], rnd);
            p.clue = {};
            p.mem.forEach(function (c, i) { p.clue[c] = types[i % types.length]; });
        },
        walk: T2, endMine: dragMine
    }),
    T3: M(64, {
        plan: function (p, rnd) {
            rolePlan(p, rnd, null);
            const s = X.shuffle(p.mem, rnd);
            p.groups = [[], []];
            s.forEach(function (c, k) { p.groups[k % 2].push(c); });
        },
        walk: T3, endMine: dragMine
    }),
    T4: M(71, { plan: function (p, rnd) { rolePlan(p, rnd, null); }, walk: T4, endMine: dragMine }),
    T5: M(78, {
        hideRole: true,
        plan: function (p, rnd) {
            rolePlan(p, rnd, 'cin');
            p.foot = {};
            p.mem.forEach(function (c) { p.foot[c] = ['size', 'ash', 'scar'][Math.floor(rnd() * 3)]; });
        },
        firstNote: T5.firstNote, walk: T5, endMine: dragMine
    }),
    T6: M(84, {
        plan: function (p, rnd) {
            rolePlan(p, rnd, 'snow');
            const others = p.mem.filter(function (c) { return c !== p.mrole; });
            p.apple = others.length ? others[Math.floor(rnd() * others.length)] : p.mem[0];
        },
        walk: T6, endMine: dragMine
    }),
    T7: M(91, { plan: function (p, rnd) { rolePlan(p, rnd, 'ala'); }, walk: T7, endMine: dragMine }),
    T8: M(97, {
        plan: function (p, rnd) { rolePlan(p, rnd, null); },
        walk: T8,
        endMine: function (end, e) {
            if (end.t === '술래잡기' && end.volunteer === ME()) return { html: '' };
            return dragMine(end, e);
        }
    })
};
Object.keys(L.M.wolf).forEach(function (k) { const m = L.M.wolf[k]; m.firstNote = m.firstNote || null; });

// 챕터에 건다
if (X.chapters[CH]) X.chapters[CH].link = function (api, mid) { L.run(CH, mid); };
else {
    const iv = setInterval(function () { if (X.chapters[CH]) { clearInterval(iv); X.chapters[CH].link = function (api, mid) { L.run(CH, mid); }; } }, 100);
}

console.log('[이상한 나라] 동화의 뒷면 연계판 12종 연결');
})();
