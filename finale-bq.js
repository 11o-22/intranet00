// ==========================================
// ★ 피날레 — 「끝나지 않는 연회」 · 엔딩 · 이름 없는 명찰
// bundles.json 마지막 묶음 — finale-be.js 다음
// ==========================================
//
//   연회 (2차 합류 뒤 · 살아 있는 사람 전원)
//     도입 01~03 — 도입 03 에서는 각자 둘러볼 수 있다. 「탐사를 시작한다」를 모두 누르면 장면 01
//     장면 01~05 — 투표로 행동을 정하고, 주사위는 파티장이 한 번만 굴린다 (파티장의 보정).
//                   결과는 모두에게 같이 들어간다. 대실패(1)면 각자 맨 주사위로 다시 굴려
//                   11 이상은 일반 실패, 10 이하는 대실패(즉사 — 막기는 듣는다).
//                   파티장이 60초 안에 안 굴리면 다른 사람이 파티장의 마지막 보정값으로 대신 굴린다.
//     장면 03    — 식탁보. 대실패만 빼고 모두 얻는다. 식탁보는 한 장 — 파티장이 챙긴다
//                   (대실패로 다시 굴린 판이면, 살아남은 사람 가운데 파티장부터 순서대로).
//                   감화도: 대성공 0 · 성공 +12 · 실패 +16
//     장면 06    — 로비. 모두 모이면 엔딩 분기점
//
//   엔딩 분기 — 명찰 사용 → 결과 반영 → 공동 엔딩 조건 → 공동 엔딩 투표
//     명찰: 가진 사람(다른 생존자가 있을 때)에게만 묻는다. 누가 가졌는지는 보이지 않는다.
//           모두 정하면 (또는 2분이 지나면) 잠근다 — 그 뒤로는 못 쓴다.
//     조건: 남은 사람 소지품에 향초와 식탁보가 다 있으면 굿 엔딩.
//           + 처음 들어온 사람 전원 생존 · 만난 NPC 전원 영입 · 영입한 NPC 전원 생존 · 희생 기록 없음 → 히든 엔딩
//           둘 다 열리면 투표 (동률은 무작위). 아무것도 없으면 출입문이 열리지 않는다 — 전원 「자발적 피날레」.
//
//   이름 없는 명찰 (언제든 📦 에서) — 대상 선택 → 확정. 확정 순서대로 하나씩 (pl 한 덩어리를 트랜잭션으로).
//     대상: 즉시 「자발적 피날레」 · 소지품 전부 소멸  /  쓴 사람: 「당신을 대신하여」로 탈출 · 소지품 전부 소멸

(function finaleBanquet() {
'use strict';
const X = window.FINX;
if (!X) return;
const SC = X.SC, LIVE = X.LIVE, AUTO = X.AUTO;
const sec = X.sec, opt = X.opt, x = X.x, esc = X.esc;
function F() { return X.F(); }
function S() { return X.S(); }
const TAG = '이름 없는 명찰', CANDLE = '꺼지지 않는 향초', CLOTH = '식탁보';
const ROLL_WAIT = 60;        // 파티장이 이만큼 안 굴리면 대신 굴린다
const TAG_WAIT = 120;        // 명찰 결정 — 이만큼 지나면 잠근다

function bq(n) { return sec('bq', n); }
function cnt(k) { return (F().inv || []).filter(function (y) { return y === k; }).length; }
function sayBox(ph) {
    return '<textarea id="fin-say" maxlength="200" rows="3" placeholder="' + esc(ph || '하고 싶은 말을 적습니다.') + '" '
        + 'style="width:100%; box-sizing:border-box; background:#0b0b0b; color:#eee; border:1px solid #5a4a2a; border-radius:5px; padding:9px; font-size:12px; margin:0 0 10px 0; resize:vertical;"></textarea>';
}
function sayVal() { const el = document.getElementById('fin-say'); return el ? String(el.value || '').trim().slice(0, 200) : ''; }

// ==========================================
// 입장
// ==========================================
SC.bqEnter = function () {
    const f = F();
    if (f.ph !== 'bq' && f.ph !== 'end') {
        f.ph = 'bq';
        X.pub('pl/' + X.me() + '/ph', 'bq');
        X.pub('pl/' + X.me() + '/where', null);
        darkRun.log.push('[연회] 입장');
    }
    X.go({ id: 'bqIn', n: 1, p: [] });
};

SC.bqIn = function (sc) {
    const ui = X.UI();
    if (sc.n < 3) {
        X.draw(ui, '끝나지 않는 연회 — 도입 0' + sc.n, x(bq('도입 0' + sc.n)),
            ui.b(sc.n === 1 ? '계속 간다.' : '확인한다.', function () { X.go({ id: 'bqIn', n: sc.n + 1, p: [] }); }));
        return;
    }
    // 도입 03 — 자유 조사 (각자). 「돌아간다」는 처음으로
    const root = bq('도입 03');
    let node = root;
    (sc.p || []).forEach(function (l) { node = opt(node, l); });
    const btns = (node.o || []).map(function (o) {
        return ui.b(o.l, function () {
            if (o.l.indexOf('돌아간다') === 0) { X.go({ id: 'bqIn', n: 3, p: [] }); return; }
            if (o.l.indexOf('계속 간다') === 0 && (sc.p || [])[0] === '탐사를 시작한다.') {
                X.gatePress('bqGo');
                X.go({ id: 'bqGate', g: 'bqGo', nx: { id: 'bqS', s: 1 }, t: '모두가 준비를 마치면 연회장 깊숙이 들어갑니다.' });
                return;
            }
            X.go({ id: 'bqIn', n: 3, p: (sc.p || []).concat([o.l]) });
        }, o.l.indexOf('탐사를 시작한다') === 0 ? { gold: true } : null);
    }).join('');
    X.draw(ui, '끝나지 않는 연회 — 도입 03', x(node), btns);
};

SC.bqGate = function (sc) {
    const ui = X.UI();
    X.draw(ui, '끝나지 않는 연회', sc.t || '다른 교우들을 기다립니다.', X.waitHtml(sc.g), { keep: true });
};
LIVE.bqGate = true;
AUTO.bqGate = function (sc) { if (X.gateDone(sc.g)) X.go(sc.nx); };

// ==========================================
// 장면 01~05 — 투표 · 파티장 한 번 굴림
// ==========================================
function sNode(s) { return bq('장면 0' + s); }
function vKey(s) { return 'bq' + s; }
function tKey(s) { return 'bqt' + s; }
function rollOf(s) { return ((S().bqr || {})[s]) || null; }
function opts(s) {
    const node = sNode(s);
    const out = [];
    (node.o || []).forEach(function (o, i) {
        if (o.l.indexOf('동행인을') === 0) { if (X.comps().length) out.push('s' + i); }
        else out.push('o' + i);
    });
    return out;
}
function oNode(s, id) { return sNode(s).o[+id.slice(1)]; }
function sTitle(s) { return '끝나지 않는 연회 — 장면 0' + s; }

SC.bqS = function (sc) {
    const f = F();
    const s = sc.s;
    const node = sNode(s);
    const ui = X.UI();
    const a = X.actives();
    const done = (f.bqa || {})[s];
    if (done) { bqResult(ui, s, done); return; }
    const key = vKey(s);
    const vo = X.voteOf(key);
    const ids = opts(s);
    const names = {};
    ids.forEach(function (id) { names[id] = oNode(s, id).l; });
    if (vo.res == null) {
        const mine = (vo.v || {})[X.me()];
        let ex = X.voteHtml(key, a, ids, names);
        if (mine == null) {
            ex += ids.map(function (id) {
                const sac = id.charAt(0) === 's';
                return ui.b(names[id], function () { X.voteCast(key, id); X.view({ keep: true }); },
                    { red: sac, sub: '투표 — ' + (sac ? '판정 없이 위기를 피합니다. 동행 NPC 한 명이 죽습니다.' : '파티장이 D20 을 한 번 굴립니다 (DC 15)') });
            }).join('');
        } else ex += '<div class="fin-wait">「' + esc(names[mine]) + '」에 투표했습니다. 다른 교우를 기다리는 중</div>';
        X.draw(ui, sTitle(s), x(node), ex, { keep: true });
        return;
    }
    const res = vo.res;
    let ex = '<div class="fin-list">투표 결과 — <b style="color:#d4af37;">' + esc(names[res] || oNode(s, res).l) + '</b>' + (vo.tie ? ' <span style="color:#888;">(동률 — 무작위)</span>' : '') + '</div>';
    // 희생
    if (res.charAt(0) === 's') {
        const C = X.comps();
        const tk = tKey(s);
        const tv = X.voteOf(tk);
        if (C.length > 1 && tv.res == null) {
            const nm = {};
            C.forEach(function (c) { nm[c] = X.NPC_NAME[c] || c; });
            ex += '<div style="font-size:11px; color:#ccc; margin:4px 0 8px 0;">누구를 남겨 둘지 정합니다.</div>' + X.voteHtml(tk, a, C, nm);
            if ((tv.v || {})[X.me()] == null) ex += C.map(function (c) { return ui.b(esc(nm[c]), function () { X.voteCast(tk, c); X.view({ keep: true }); }, { sub: '투표' }); }).join('');
            else ex += '<div class="fin-wait">다른 교우를 기다리는 중</div>';
            X.draw(ui, sTitle(s), x(node), ex, { keep: true });
            return;
        }
        const target = C.length > 1 ? tv.res : (C[0] || tv.res || null);
        ex += ui.b('계속 간다.', function () { sacrifice(s, res, target); });
        X.draw(ui, sTitle(s), x(node), ex, { keep: true });
        return;
    }
    // 굴림
    const r = rollOf(s);
    const ld = X.leader();
    if (!r) {
        const vo2 = X.voteOf(key);
        const waited = vo2.at ? Math.floor((Date.now() - vo2.at) / 1000) : 0;
        if (ld === X.me()) {
            ex += ui.b('주사위를 굴린다. (파티장)', function () { leaderRoll(s, false); }, { gold: true, sub: '내 보정이 모두에게 쓰입니다 · D20 · DC 15' });
        } else {
            ex += '<div class="fin-wait">파티장 <b style="color:#d4af37;">' + esc(X.nameOf(ld)) + '</b> 이(가) 주사위를 굴리기를 기다리는 중</div>';
            if (waited >= ROLL_WAIT) ex += ui.b('대신 굴린다.', function () { leaderRoll(s, true); }, { sub: '파티장의 마지막 보정값으로 굴립니다.' });
        }
        X.draw(ui, sTitle(s), x(node) + '<br><br>' + x(oNode(s, res).n), ex, { keep: true });
        return;
    }
    const o = oNode(s, res);
    const cap = '파티장 ' + esc(X.nameOf(r.ld)) + ' 의 보정' + (r.fb ? ' (대신 굴림 — ' + esc(X.nameOf(r.by)) + ')' : '');
    const rr = { raw: r.raw, bonus: r.bonus, total: r.total, dc: r.dc, out: r.out };
    if (r.out === 'c1') {
        ex += '<div class="fin-note" style="color:#ff8a80;">대실패 — 각자 맨 주사위를 다시 굴립니다. 11 이상이면 일반 실패, 10 이하면 대실패입니다.</div>'
            + ui.b('다시 굴린다.', function () { apply(s, true); }, { red: true, sub: '보정 없음' });
    } else {
        ex += ui.b('결과를 확인한다.', function () { apply(s, false); }, { gold: true });
    }
    X.draw(ui, sTitle(s), x(o.n) + X.rollHtml(rr, cap), ex, { keep: true });
};
LIVE.bqS = true;
AUTO.bqS = function (sc) {
    const f = F();
    const s = sc.s;
    if ((f.bqa || {})[s]) return;
    const a = X.actives();
    const key = vKey(s);
    const vo = X.voteOf(key);
    if (vo.res == null) { X.voteResolve(key, a, opts(s)); return; }
    if (vo.res.charAt(0) === 's') {
        const C = X.comps();
        if (C.length > 1) X.voteResolve(tKey(s), a, C);
    }
};

function leaderRoll(s, fallback) {
    if (rollOf(s)) return;
    const a = X.actives();
    const ld = X.leader();
    let r;
    if (!fallback) r = X.roll({ kind: 'break', dc: 15, body: true, n: a.length });
    else {
        const raw = 1 + Math.floor(Math.random() * 20);
        const bon = +(((S().pl || {})[ld] || {}).bon) || 0;
        const total = raw + bon;
        r = { raw: raw, bonus: bon, total: total, dc: 15, out: raw === 1 ? 'c1' : raw === 20 ? 'c20' : total >= 15 ? 'ok' : 'fail' };
        darkRun.log.push('[연회] 파티장 대신 굴림 — d20 ' + raw + ' (+' + bon + ') → ' + r.out);
    }
    const rec = { raw: r.raw, bonus: r.bonus, total: r.total, dc: 15, out: r.out, by: X.me(), ld: ld, fb: !!fallback,
        ord: [ld].concat(a.filter(function (c) { return c !== ld; })), at: Date.now() };
    X.tx('bqr/' + s, function (cur) { if (cur) return; return rec; }).then(function () { X.view({ keep: true }); });
}

// 결과를 내게 먹인다 — 한 번만
function apply(s, reroll) {
    const f = F();
    if (!f.bqa) f.bqa = {};
    if (f.bqa[s]) return;
    const r = rollOf(s);
    if (!r) return;
    const o = oNode(s, X.voteOf(vKey(s)).res);
    const k = { res: X.voteOf(vKey(s)).res, out: r.out };
    if (r.out === 'c1') {
        const raw = 1 + Math.floor(Math.random() * 20);
        k.rr = raw;
        if (raw <= 10) {
            k.out = 'c1';
            f.bqa[s] = k;
            X.countRoll(false);
            if (s === 3) X.pub('bq3/' + X.me(), 0);
            darkRun.log.push('[연회] 장면 0' + s + ' 대실패 — 다시 굴림 ' + raw + ' → 즉사');
            X.die(x(o.n) + '<div class="fin-roll" style="color:#f44336;">🎲 ' + raw + ' <small>(다시 굴림 · 보정 없음)</small></div>' + (o.n.d20 ? o.n.d20.c1 : ''), next(s, true));
            return;
        }
        k.out = 'fail';
        darkRun.log.push('[연회] 장면 0' + s + ' 대실패 — 다시 굴림 ' + raw + ' → 일반 실패');
    }
    const ok = k.out === 'ok' || k.out === 'c20';
    X.countRoll(ok);
    if (s === 3) {
        if (k.out === 'ok') k.d = X.gam(12, '식탁보 성공');
        else if (k.out === 'fail') k.d = X.gam(16, '식탁보 실패');
    } else {
        if (k.out === 'c20') k.d = X.gam(-10, '연회 대성공');
        else if (k.out === 'fail') k.d = X.gam(16, '연회 실패');
    }
    k.sk = X.streak(ok);
    f.bqa[s] = k;
    if (s === 3) X.pub('bq3/' + X.me(), 1);
    darkRun.log.push('[연회] 장면 0' + s + ' — ' + k.out);
    if (k.sk === 'dead' && f.st === 'in') {
        X.die(X.STREAK_DEATH, next(s, true));
        return;
    }
    X.save();
    X.view();
}
function sacrifice(s, res, target) {
    const f = F();
    if (!f.bqa) f.bqa = {};
    if (f.bqa[s]) return;
    f.bqa[s] = { res: res, sac: 1, t: target };
    if (target) {
        X.tx('npc/' + target, function (cur) { cur = cur || {}; if (cur.dead) return; cur.dead = 1; cur.by = X.me(); return cur; });
        X.pub('sac', 1);
        darkRun.log.push('[연회] 동행 NPC 희생 — ' + (X.NPC_NAME[target] || target));
    }
    if (s === 3) X.pub('bq3/' + X.me(), 1);
    X.save();
    X.view();
}
function next(s, saved) {
    const nx = s < 5 ? { id: 'bqS', s: s + 1 } : { id: 'bq6' };
    return saved ? { id: 'bqGo', nx: nx } : nx;
}
SC.bqGo = function (sc) {
    const ui = X.UI();
    X.draw(ui, '끝나지 않는 연회', '누군가 당신의 어깨를 붙잡아 일으킵니다. 돌아보았을 때는 아무도 없습니다.<br><br>연회는 계속되고 있습니다.',
        ui.b('계속 간다.', function () { X.go(sc.nx); }));
};

function bqResult(ui, s, k) {
    const res = k.res;
    const o = oNode(s, res);
    let t = x(o.n);
    const notes = [];
    if (k.sac) {
        notes.push(k.t ? '동행 NPC 「' + esc(X.NPC_NAME[k.t] || k.t) + '」이(가) 사망했습니다.' : null);
        notes.push('<span style="color:#ff8a80;">동행 NPC 를 희생했습니다.</span>');
    } else {
        const r = rollOf(s);
        if (r) {
            t += X.rollHtml({ raw: r.raw, bonus: r.bonus, total: r.total, dc: r.dc, out: r.out }, '파티장 ' + esc(X.nameOf(r.ld)) + ' 의 보정');
            if (k.rr) t += '<div class="fin-roll" style="color:#ff9800;">🎲 ' + k.rr + ' <small>(다시 굴림 — 일반 실패로 처리)</small></div>';
            if (o.n.d20) t += '<div style="margin-top:6px;">' + (o.n.d20[k.out] || '') + '</div>';
        }
        notes.push(X.gamNote(k.d), X.streakNote(k.sk));
    }
    if (s === 3) {
        const h = clothHolder();
        if (h === undefined) notes.push('<span style="color:#888;">식탁보를 누가 챙기는지 정하는 중…</span>');
        else if (h) notes.push('「식탁보」는 ' + (h === X.me() ? '<b style="color:#d4af37;">당신</b>' : '<b>' + esc(X.nameOf(h)) + '</b>') + '이(가) 챙겼습니다.' + (h === X.me() ? ' <span style="color:#888;">(📦)</span>' : ''));
    }
    X.draw(ui, sTitle(s), t, X.notes(notes) + ui.b('계속 간다.', function () { X.go(next(s, false)); }), { keep: true });
}

// 식탁보 — 순서대로 살아남은 첫 사람. 아직 모르면 undefined, 아무도 없으면 null
function clothHolder() {
    const r = rollOf(3);
    if (!r) return undefined;
    const ok = S().bq3 || {};
    const late = Date.now() - (r.at || 0) > 90 * 1000;
    const ord = r.ord || [];
    for (let i = 0; i < ord.length; i++) {
        const c = ord[i];
        if (ok[c] === 1) return c;
        if (ok[c] === 0) continue;
        if (!X.isIn(c)) continue;          // 죽거나 나간 사람은 건너뛴다
        if (late) continue;
        return undefined;
    }
    return null;
}
setInterval(function () {
    const f = F();
    if (!f || f.st !== 'in' || typeof darkRun === 'undefined' || !darkRun || darkRun.zone !== X.CODE) return;
    if (!f.bqa || f.bqa.cloth) return;
    if (clothHolder() !== X.me()) return;
    f.bqa.cloth = 1;
    X.invAdd(CLOTH);
    darkRun.log.push('[연회] 식탁보 획득');
    X.save();
    if (f.sc && LIVE[f.sc.id]) X.view({ keep: true });
}, 1500);

// ==========================================
// 장면 06 — 로비 · 엔딩 분기점
// ==========================================
SC.bq6 = function () {
    const ui = X.UI();
    X.draw(ui, '끝나지 않는 연회 — 장면 06', x(bq('장면 06')), ui.b('계속 간다.', function () {
        const f = F();
        f.ph = 'end';
        X.pub('pl/' + X.me() + '/ph', 'end');
        X.gatePress('bqEnd');
        X.go({ id: 'fin' });
    }));
};

function holdings() { return { c: cnt(CANDLE), t: cnt(CLOTH) }; }
function canTagNow() {
    const lock = (S().pl || {})._lock;
    return F().st === 'in' && X.invHas(TAG) && !lock && X.actives().filter(function (c) { return c !== X.me(); }).length > 0;
}

SC.fin = function () {
    const ui = X.UI();
    const a = X.actives();
    const s = S();
    const lock = (s.pl || {})._lock;
    const head = '로비 — 「완벽한 피날레 — 제2부」';
    if (!X.gateDone('bqEnd', a)) {
        X.draw(ui, head, '<div class="fin-sys">「00:06:59」</div>로비의 전광판이 붉게 빛납니다. 아직 돌아오지 않은 교우가 있습니다.',
            X.waitHtml('bqEnd', a, '로비에 모이기를 기다리는 중'), { keep: true });
        return;
    }
    if (!lock) {
        const td = s.tagd || {};
        if (!td[X.me()] && canTagNow()) {
            const node = sec('end', '이기적인 엔딩 01');
            X.draw(ui, head, x(node),
                ui.b('다른 사람의 이름을 적는다.', function () { X.go({ id: 'tagE', st: 1 }); }, { red: true })
                + ui.b('명찰을 사용하지 않는다.', function () {
                    X.pub('tagd/' + X.me(), Object.assign({ d: 'no', at: Date.now() }, holdings()));
                    X.go({ id: 'finNo' });
                }), { keep: true });
            return;
        }
        const done = a.filter(function (c) { return !!td[c]; }).length;
        X.draw(ui, head, '<div class="fin-sys">「00:06:08」</div>전광판의 숫자가 계속 줄어듭니다.<br><br>모두가 마음을 정하기를 기다립니다.',
            '<div class="fin-wait">' + done + ' / ' + a.length + '</div>', { keep: true });
        return;
    }
    const ec = s.endc;
    if (!ec) { X.draw(ui, head, '전광판의 숫자가 계속 줄어듭니다.', '<div class="fin-wait">…</div>', { keep: true }); return; }
    if (ec.hidden) {
        const vo = X.voteOf('bqend');
        const names = { hidden: '모두 함께 나간다. (히든)', good: '향초와 식탁보를 사용한다. (굿)' };
        let ex = '<div class="fin-list">향초 <b style="color:#4CAF50;">있음</b> · 식탁보 <b style="color:#4CAF50;">있음</b><br>전원 생존 · 만난 NPC 전원 영입 · 희생 없음 — <b style="color:#d4af37;">모든 조건을 갖췄습니다.</b></div>'
            + X.voteHtml('bqend', a, ['hidden', 'good'], names);
        if (vo.res == null && (vo.v || {})[X.me()] == null) {
            ex += ui.b(names.hidden, function () { X.voteCast('bqend', 'hidden'); X.view({ keep: true }); }, { gold: true, sub: '투표' })
                + ui.b(names.good, function () { X.voteCast('bqend', 'good'); X.view({ keep: true }); }, { sub: '투표' });
        } else if (vo.res == null) ex += '<div class="fin-wait">다른 교우를 기다리는 중</div>';
        X.draw(ui, head, '<div class="fin-sys">「00:06:59」</div>출입문은 굳게 닫혀 있습니다. 어떻게 나갈지 함께 정합니다.', ex, { keep: true });
        return;
    }
    X.draw(ui, head, '…', '', { keep: true });
};
LIVE.fin = true;
AUTO.fin = function () {
    const f = F();
    const s = S();
    const a = X.actives();
    if (!X.gateDone('bqEnd', a)) return;
    if (!s.endT) X.tx('endT', function (cur) { if (cur) return; return Date.now(); });
    const lock = (s.pl || {})._lock;
    if (!lock) {
        const td = s.tagd || {};
        if (!td[X.me()] && !canTagNow()) X.pub('tagd/' + X.me(), Object.assign({ d: 'none', at: Date.now() }, holdings()));
        const all = a.every(function (c) { return !!td[c]; });
        const late = s.endT && Date.now() - s.endT > TAG_WAIT * 1000;
        if (all || late) X.tx('pl/_lock', function (cur) { if (cur) return; return Date.now(); });
        return;
    }
    if (!s.endc) {
        const td = s.tagd || {};
        let c = 0, t = 0;
        a.forEach(function (k) { const h = td[k] || {}; c += (+h.c || 0); t += (+h.t || 0); });
        const good = c > 0 && t > 0;
        const P = s.pl || {};
        const codes = Object.keys(P).filter(function (k) { return k.charAt(0) !== '_'; });
        const allAlive = codes.length >= X.n0() && codes.every(function (k) { return P[k].st === 'in' && !P[k].gone; });
        const N = s.npc || {};
        const npcOk = Object.keys(N).every(function (k) { const r = N[k] || {}; return !r.enc || (r.rec && !r.dead); });
        const hidden = good && allAlive && npcOk && !s.sac;
        X.tx('endc', function (cur) { if (cur) return; return { good: good ? 1 : 0, hidden: hidden ? 1 : 0, none: good ? 0 : 1, c: c, t: t, alive: allAlive ? 1 : 0, npc: npcOk ? 1 : 0, at: Date.now() }; });
        return;
    }
    const ec = s.endc;
    if (ec.none) {
        if (f.st === 'in') {
            f.st = 'out'; f.outWhy = 'none';
            X.pub('pl/' + X.me() + '/st', 'out');
            darkRun.log.push('[엔딩] 탈출 실패 — 향초 ' + ec.c + ' · 식탁보 ' + ec.t);
            X.go({ id: 'bad', i: 0, bad: true });
        }
        return;
    }
    if (!ec.hidden) { X.go({ id: 'endG', n: 1 }); return; }
    const vo = X.voteOf('bqend');
    if (vo.res == null) { X.voteResolve('bqend', a, ['hidden', 'good']); return; }
    X.go(vo.res === 'hidden' ? { id: 'endH', n: 1 } : { id: 'endG', n: 1 });
};

SC.finNo = function () {
    const ui = X.UI();
    X.draw(ui, '로비', x(opt(sec('end', '이기적인 엔딩 01'), '명찰을 사용하지 않는다')), ui.b('계속 간다.', function () { X.go({ id: 'fin' }); }));
};

// ==========================================
// 굿 · 히든 엔딩
// ==========================================
SC.endG = function (sc) {
    const ui = X.UI();
    const n = sc.n;
    const node = sec('end', '굿 엔딩 0' + n);
    if (n === 1) {
        if (sc.p === 'door') {
            X.draw(ui, 'GOOD ENDING', x(opt(node, '출입문을 강제로 연다')), ui.b('향초와 식탁보를 사용한다.', function () { X.go({ id: 'endG', n: 1, p: 'use' }); }));
            return;
        }
        if (sc.p === 'use') {
            X.draw(ui, 'GOOD ENDING', x(opt(node, '향초와 식탁보를 사용한다')), ui.b('계속 간다.', function () { X.go({ id: 'endG', n: 2 }); }));
            return;
        }
        X.draw(ui, 'GOOD ENDING', x(node),
            ui.b('향초와 식탁보를 사용한다.', function () { X.go({ id: 'endG', n: 1, p: 'use' }); })
            + ui.b('출입문을 강제로 연다.', function () { X.go({ id: 'endG', n: 1, p: 'door' }); }));
        return;
    }
    if (n < 4) { X.draw(ui, 'GOOD ENDING', x(node), ui.b('계속 간다.', function () { X.go({ id: 'endG', n: n + 1 }); })); return; }
    X.draw(ui, 'GOOD ENDING', x(node), ui.b('공연장을 떠난다.', function () { X.settle('good'); }, { gold: true }));
};
SC.endH = function (sc) {
    const f = F();
    const ui = X.UI();
    const n = sc.n;
    const node = sec('end', '히든 엔딩 0' + n);
    if (n === 1 && !sc.p) {
        X.draw(ui, 'HIDDEN ENDING', x(node), ui.b('모두 함께 나간다.', function () { X.go({ id: 'endH', n: 1, p: 1 }); }, { gold: true }));
        return;
    }
    if (n === 1) { X.draw(ui, 'HIDDEN ENDING', x(opt(node, '모두 함께 나간다')), ui.b('계속 간다.', function () { X.go({ id: 'endH', n: 2 }); })); return; }
    if (n === 3 && !sc.p) {
        X.draw(ui, 'HIDDEN ENDING', x(node), sayBox('관객들에게 할 말을 적습니다.') + ui.b('관객들을 설득한다.', function () {
            f.bqa.say = sayVal();
            X.go({ id: 'endH', n: 3, p: 1 });
        }, { gold: true }));
        return;
    }
    if (n === 3) {
        X.draw(ui, 'HIDDEN ENDING', x(opt(node, '관객들을 설득한다')), ui.b('계속 간다.', function () { X.go({ id: 'endH', n: 4 }); }), { fill: { input: f.bqa.say || null } });
        return;
    }
    if (n < 6) { X.draw(ui, 'HIDDEN ENDING', x(node), ui.b('계속 간다.', function () { X.go({ id: 'endH', n: n + 1 }); })); return; }
    X.draw(ui, 'HIDDEN ENDING', x(node), ui.b('커튼콜.', function () { X.settle('hidden'); }, { gold: true }));
};

// ==========================================
// 배드 엔딩 — 자발적 피날레
// ==========================================
const NONE_IN = '<div class="fin-sys">「00:00:00」</div>전광판의 숫자가 멈춥니다.<br><br>「완벽한 피날레 — 제2부」<br>「지금부터 마지막 공연을 시작합니다.」<br><br>출입문은 끝내 열리지 않았습니다. 로비의 조명이 하나둘 꺼지고, 객석으로 이어지는 문만이 환하게 열립니다.<br><br>어디선가 박수 소리가 들려옵니다.';
SC.bad = function (sc) {
    const f = F();
    const ui = X.UI();
    if (!f.bqa) f.bqa = {};
    const i = sc.i || 0;
    if (i === 0) {
        let t;
        if (f.outWhy === 'tag') t = x(sec('end', '도입 02'));
        else if (f.outWhy === 'none') t = NONE_IN;
        else t = x(sec('end', '도입 01'));
        X.draw(ui, 'BAD ENDING — 「자발적 피날레」', t, ui.b('계속 간다.', function () { X.go({ id: 'bad', i: 1, bad: true }); }), { nobar: true });
        return;
    }
    const e1 = sec('end', '엔딩 01');
    if (i === 1) {
        X.draw(ui, 'BAD ENDING — 「자발적 피날레」', x(e1), sayBox('마지막으로 남길 말을 적습니다.')
            + ui.b('마지막 말을 남긴다.', function () { f.bqa.last = sayVal(); f.bqa.lastM = 'say'; X.go({ id: 'bad', i: 2, bad: true }); })
            + ui.b('아무 말 없이 미소 짓는다.', function () { f.bqa.lastM = 'smile'; X.go({ id: 'bad', i: 2, bad: true }); }), { nobar: true });
        return;
    }
    if (i === 2) {
        const t = f.bqa.lastM === 'smile' ? x(opt(e1, '아무 말 없이 미소 짓는다')) : x(opt(e1, '마지막 말을 남긴다'));
        X.draw(ui, 'BAD ENDING — 「자발적 피날레」', t, ui.b('계속 간다.', function () {
            if (f.bqa.last && !f.bqa.said) { f.bqa.said = 1; try { sendPartyChat('🎭 ' + f.name + ' — “' + f.bqa.last + '”', true); } catch (e) { } }
            darkRun.log.push('[엔딩] BAD — 자발적 피날레 (' + (f.outWhy || 'gam') + ')');
            X.save();
            X.eliminate(x(sec('end', '엔딩 02')));
        }), { nobar: true, fill: { input: f.bqa.last || null } });
    }
};

// ==========================================
// 이름 없는 명찰
// ==========================================
function others() { return X.actives().filter(function (c) { return c !== X.me(); }); }
const MID = 'SELFISH ENDING — 「당신을 대신하여」 (중도';
function midSec(h) { return sec('end', h, X.secIdx('end', MID)); }

// 확정 — pl 한 덩어리를 트랜잭션으로. 먼저 확정한 사람이 이긴다.
function commit(t, cb) {
    const me = X.me();
    let ok = false;
    X.tx('pl', function (cur) {
        ok = false;
        if (!cur) return;
        if (cur._lock) return;
        const m = cur[me], g = cur[t];
        if (!m || m.st !== 'in' || m.gone) return;
        if (!g || g.st !== 'in' || g.gone) return;
        g.st = 'tag'; g.by = me; g.tagAt = Date.now();
        m.st = 'esc'; m.end = 'selfish'; m.tagged = t;
        ok = true;
        return cur;
    }).then(function (r) {
        if (!(r && r.committed && ok)) { cb(false); return; }
        const f = F();
        f.st = 'esc';
        f.tgt = t;
        f.tgtName = X.nameOf(t);
        f.inv = [];                                   // 쓴 사람의 소지품도 전부 사라진다
        darkRun.log.push('[명찰] 대리 참석자 — ' + f.tgtName);
        X.pub('tagd/' + me, { d: 'used', at: Date.now(), c: 0, t: 0 });
        X.save();
        cb(true);
    }).catch(function () { cb(false); });
}

// 중도 사용 (📦 → 사용한다)
X.tagStart = function () {
    const f = F();
    if (!f || f.st !== 'in' || !X.invHas(TAG)) return;
    if (f.sc && f.sc.id !== 'tag') f.tagRet = f.sc;
    if (f.ph === 'end' && f.sc && f.sc.id === 'fin') { X.go({ id: 'tagE', st: 1 }); return; }
    X.go({ id: 'tag', st: 0 });
};
function back() {
    const f = F();
    const r = f.tagRet || { id: 'fin' };
    f.tagRet = null;
    X.go(r);
}
SC.tag = function (sc) {
    const f = F();
    const ui = X.UI();
    const H = 'SELFISH ENDING — 「당신을 대신하여」';
    if (sc.st === 0) {
        X.draw(ui, H, x(midSec('이기적인 엔딩 01')),
            ui.b('대리 참석자를 지정한다.', function () { X.go({ id: 'tag', st: 1 }); }, { red: true, dis: !canTagNow() })
            + ui.b('명찰을 사용하지 않는다.', function () { back(); }));
        return;
    }
    if (sc.st === 1 || sc.st === 2) { pickTarget(ui, sc, 'tag'); return; }
    if (sc.st === 3) {
        X.draw(ui, H, x(midSec('이기적인 엔딩 03')), ui.b('계속 간다.', function () { X.go({ id: 'tag', st: 4, esc: true }); }), { nobar: true });
        return;
    }
    X.draw(ui, H, x(midSec('이기적인 엔딩 04')), ui.b('공연장을 떠난다.', function () { X.settle('selfish'); }, { gold: true }), { nobar: true });
};
// 엔딩 분기점에서
SC.tagE = function (sc) {
    const ui = X.UI();
    const H = 'SELFISH ENDING — 「당신을 대신하여」';
    if (sc.st === 1 || sc.st === 2) { pickTarget(ui, sc, 'tagE'); return; }
    if (sc.st === 3) {
        const t = x(opt(sec('end', '이기적인 엔딩 01'), '다른 사람의 이름을 적는다')).replace(/^\(대상 선택\)(<br>)*/, '');
        X.draw(ui, H, t, ui.b('계속 간다.', function () { X.go({ id: 'tagE', st: 4, esc: true }); }), { nobar: true });
        return;
    }
    if (sc.st === 4) {
        X.draw(ui, H, x(sec('end', '이기적인 엔딩 02')), ui.b('문을 넘어선다.', function () { X.go({ id: 'tagE', st: 5, esc: true }); }), { nobar: true });
        return;
    }
    X.draw(ui, H, x(sec('end', '이기적인 엔딩 03')), ui.b('공연장을 떠난다.', function () { X.settle('selfish'); }, { gold: true }), { nobar: true });
};
function pickTarget(ui, sc, id) {
    const f = F();
    const H = 'SELFISH ENDING — 「당신을 대신하여」';
    const cancel = function () {
        if (id === 'tagE') X.go({ id: 'fin' });
        else { back(); setTimeout(function () { try { window.finBag(); } catch (e) { } }, 100); }
    };
    if (!canTagNow()) {
        X.draw(ui, H, '명찰의 글씨가 흐려집니다. 지금은 쓸 수 없습니다.', ui.b('돌아간다.', cancel));
        return;
    }
    if (sc.st === 1) {
        const O = others();
        X.draw(ui, H, '명찰에 떠오른 이름들 가운데 하나를 고릅니다.<br><span style="font-size:11px; color:#888;">대리 참석자의 동의는 필요하지 않습니다. 확정한 뒤에는 되돌릴 수 없습니다.</span>',
            O.map(function (c) { return ui.b(esc(X.nameOf(c)), function () { f.tgtName = X.nameOf(c); X.go({ id: id, st: 2, t: c }); }); }).join('')
            + ui.b('취소한다.', cancel));
        return;
    }
    f.tgtName = X.nameOf(sc.t);
    X.draw(ui, H, x(midSec('이기적인 엔딩 02')),
        ui.b('대리 참석자를 확정한다.', function () {
            commit(sc.t, function (ok) {
                if (!ok) {
                    try { showCustomAlert('명찰이 반응하지 않습니다.\n그 사람은 이미 자리에 없거나, 명찰을 쓸 수 없는 때입니다.'); } catch (e) { }
                    X.go({ id: id, st: 1 });
                    return;
                }
                X.go({ id: id, st: 3, esc: true });
            });
        }, { red: true })
        + ui.b('취소한다.', cancel), { fill: { target: X.nameOf(sc.t) } });
}

// 누가 내 이름을 적었다 — 지금 하던 것을 모두 멈추고 탈락
X.onTagged = function (p) {
    const f = F();
    if (!f || f.st !== 'in') return;
    f.st = 'out';
    f.outWhy = 'tag';
    f.inv = [];
    try { X.ovClose(); } catch (e) { }
    darkRun.log.push('[명찰] 대리 참석자로 지정됨');
    X.go({ id: 'bad', i: 0, bad: true });
};

console.log('[피날레] 연회 · 엔딩 · 명찰 연결');
})();
