// ==========================================
// ★ 피날레 — 「달콤한 밤, 영원한 꿈」 (개인 탐사)
// bundles.json 마지막 묶음 — finale-op.js 다음
// ==========================================
//
//   도입 → 고정 장면 1 → 고정 장면 2 (꺼지지 않는 향초 · 3장) → 무작위 사건 → 로비
//     1회차(1차 탐사)  상품 5 · 전투 3 · 위기 1 을 뽑아 섞는다
//     2회차(2차 탐사)  상품 2 를 먼저, 그 뒤 NPC 3 · 전투 3 · 위기 1 을 섞는다
//   장면 풀 32개 (상품 8 · NPC 8 · 전투 10 · 위기 6) — 한 사람에게 같은 사건은 두 번 나오지 않는다.
//
//   상품: 구매 1장(향초 3장) 감화도 +12 / 「계속 간다」 20% 강매 — 감화도 +20 (상품권이 있으면 1장 가져간다)
//         살펴보기 중 「감화도 상승」이 적힌 것 +16 / 드림모지 체험 · 독사과 절도 — 사망 70% · 무료 획득 30%
//   전투: D20 · DC 15 — 실패 +16 (도주형은 소지품 1개 분실, 없으면 상품권 1장) · 대성공 −10 · 대실패 즉사
//         「가진 것을 던진다」 — 향초 · 식탁보 말고 무작위 하나를 잃고 +2
//   NPC : 맨 주사위 — 설득은 20(대성공)만, 아이템은 11 이상. 대성공 −20 · 대실패 +20. 결과는 로비에서 합친다.
//   위기: 주사위 없이 고른 대로 — 「감화도 +」 +16 · 즉사는 즉사 (막기는 듣는다). NPC 희생 없음.

(function finaleSweet() {
'use strict';
const X = window.FINX;
if (!X) return;
const SC = X.SC;
const sec = X.sec, opt = X.opt, x = X.x, esc = X.esc;
function F() { return X.F(); }

// ==========================================
// 표
// ==========================================
const PROD = {
    1: { it: '드림모지', look: '이미 글씨가 적힌 드림모지를 확인한다', lookGam: 16, risky: '드림모지를 체험한다', riskySub: '눈을 뜬다' },
    2: { it: '마녀의 독사과', look: '잠든 사람을 깨워본다', lookGam: 0, lookOnlyGo: true, risky: '사과를 몰래 훔친다', riskySub: '사과를 품에 숨긴다' },
    3: { it: '아침 해', look: '안내문의 마지막 문구에 관해 묻는다', lookGam: 0 },
    4: { it: '비밀을 지켜 주는 베개', look: '베개에 귀를 대 본다', lookGam: 16 },
    5: { it: '엄마의 품', look: '이불 안쪽을 살펴본다', lookGam: 0 },
    6: { it: '마지막 자장가', look: '오르골에 귀를 기울인다', lookGam: 0 },
    7: { it: '악몽 수거함', look: '사용된 유리병을 살펴본다', lookGam: 16 },
    8: { it: '주머니 속 별빛', look: '별을 자세히 살펴본다', lookGam: 16 }
};
// 강매 — 상품권이 모자랄 때 1~3 은 그냥 쥐여 주고, 4~8 · 향초는 도로 가져간다 (장면 지문대로)
function freeKeep(n) { return n <= 3; }
const PAID_FALLBACK = '직원은 대답을 기다리지 않고 상품권을 받아 갑니다.<br><br>“감사합니다, 고객님! 편안한 밤 보내세요!”';
const NPC = {
    1: { n: '잠들지 못하는 여자', a: '아침 해', b: '마녀의 독사과' },
    2: { n: '꿈을 기록하는 소년', a: '드림모지', b: '마지막 자장가' },
    3: { n: '잠자는 숲속의 공주', a: '마녀의 독사과', b: '드림모지' },
    4: { n: '잠든 딸을 기다리는 아버지', a: '마지막 자장가', b: '엄마의 품' },
    5: { n: '밤을 무서워하는 아이', a: '주머니 속 별빛', b: '악몽 수거함' },
    6: { n: '꿈을 잃어버린 노인', a: '엄마의 품', b: '비밀을 지켜 주는 베개' },
    7: { n: '마지막 꿈을 기다리는 사람', a: '악몽 수거함', b: '아침 해' },
    8: { n: '비밀을 삼킨 아이', a: '비밀을 지켜 주는 베개', b: '주머니 속 별빛' }
};
Object.keys(NPC).forEach(function (k) { X.NPC_NAME['sw' + k] = NPC[k].n; });

// 전투 — 유형 · 번호
const COMBAT = [];
[['res', 4], ['run', 4], ['tem', 2]].forEach(function (p) { for (let i = 1; i <= p[1]; i++) COMBAT.push({ t: p[0], n: i }); });
const CT = { res: '저항형', run: '도주형', tem: '유혹형' };
const CKIND = { res: 'break', run: 'hide', tem: 'sense' };

// 위기 — 선택지마다 결과 (g: 감화도 +16 · d: 즉사)
const CRISIS = {
    1: ['g', '', ''],
    2: ['g', 'g', ''],
    3: ['g', 'g', ''],
    4: ['d', 'g', ''],
    5: ['d', 'g', ''],
    6: ['d', 'g', '']
};

function combatNode(t, n) { return sec('swb', '전투 ' + n, X.secIdx('swb', CT[t] + ' 전투')); }
function combatRes(t, out) {
    const node = sec('swb', CT[t] + ' 전투 판정 결과');
    const lab = out === 'c1' ? '대실패' : out === 'fail' ? '실패' : out === 'ok' ? '성공' : '대성공';
    return x(opt(node, lab));
}

// ==========================================
// 시작
// ==========================================
function build(round) {
    const P = X.shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
    const C = X.shuffle(COMBAT.slice());
    const K = X.shuffle([1, 2, 3, 4, 5, 6]);
    const N = X.shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
    let q;
    if (round === 1) {
        q = X.shuffle([].concat(
            P.slice(0, 5).map(function (n) { return { t: 'p', n: n }; }),
            C.slice(0, 3).map(function (c) { return { t: 'c', ct: c.t, n: c.n }; }),
            K.slice(0, 1).map(function (n) { return { t: 'k', n: n }; })));
    } else {
        const rest = X.shuffle([].concat(
            N.slice(0, 3).map(function (n) { return { t: 'n', n: n, want: npcWant(n) }; }),
            C.slice(0, 3).map(function (c) { return { t: 'c', ct: c.t, n: c.n }; }),
            K.slice(0, 1).map(function (n) { return { t: 'k', n: n }; })));
        q = P.slice(0, 2).map(function (n) { return { t: 'p', n: n }; }).concat(rest);
    }
    return { round: round, q: q, i: -1 };
}
// NPC 요구 아이템 — 지정 50% · 차선 30% · 달콤 무작위 20%
function npcWant(n) {
    const r = Math.random();
    if (r < 0.5) return NPC[n].a;
    if (r < 0.8) return NPC[n].b;
    return X.pick(X.SWEET);
}

X.swStart = function (round) {
    const f = F();
    f.sw = build(round);
    darkRun.log.push('[달콤] ' + round + '회차 — ' + f.sw.q.map(function (e) { return e.t + e.n; }).join(' '));
    X.go({ id: 'swIntro' });
};

SC.swIntro = function () {
    const ui = X.UI();
    X.draw(ui, '달콤한 밤, 영원한 꿈 — 도입', x(sec('sw', '도입')), ui.b('확인한다.', function () { X.go({ id: 'swFix1' }); }));
};
SC.swFix1 = function () {
    const ui = X.UI();
    X.draw(ui, '달콤한 밤, 영원한 꿈 — 고정 장면 1', x(sec('sw', '고정 장면 1')), ui.b('계속 간다.', function () { X.go({ id: 'swFix2', st: 'main' }); }));
};

// ==========================================
// 고정 장면 2 — 꺼지지 않는 향초 (3장)
// ==========================================
const CANDLE = '꺼지지 않는 향초';
SC.swFix2 = function (sc) {
    const f = F();
    const node = sec('sw', '고정 장면 2');
    const ui = X.UI();
    const buyBtn = function () {
        return ui.b('꺼지지 않는 향초를 구매한다.', function () { buyCandle(); },
            { dis: (f.tix || 0) < 3, sub: (f.tix || 0) < 3 ? '상품권이 부족합니다. (3장)' : '상품권 3장' });
    };
    if (sc.st === 'ask') {
        X.draw(ui, '고정 장면 2 — 꺼지지 않는 향초', x(opt(node, '향초에 대해 묻는다')),
            buyBtn() + ui.b('계속 간다.', function () { leaveCandle(); }));
        return;
    }
    X.draw(ui, '고정 장면 2 — 꺼지지 않는 향초', x(node),
        buyBtn() + ui.b('향초에 대해 묻는다.', function () { X.go({ id: 'swFix2', st: 'ask' }); })
        + ui.b('계속 간다.', function () { leaveCandle(); }));
};
function buyCandle() {
    const f = F();
    if ((f.tix || 0) < 3 || (f.sw && f.sw.fx)) return;
    if (f.sw) f.sw.fx = 1;
    f.tix -= 3;
    X.invAdd(CANDLE);
    const d = X.gam(12, '향초 구매');
    darkRun.log.push('[달콤] 향초 구매');
    X.go({ id: 'swFix2r', a: 'buy', d: d });
}
function leaveCandle() {
    const f = F();
    if (f.sw && f.sw.fx) { next(); return; }
    if (f.sw) f.sw.fx = 1;
    if (Math.random() < 0.2) X.go({ id: 'swFix2f' });
    else X.go({ id: 'swSkip', next: 'ev' });
}
SC.swFix2f = function () {
    const node = opt(sec('sw', '고정 장면 2'), '계속 간다');
    const fail = (node && node.pt && node.pt.fail) || node;
    const ui = X.UI();
    X.draw(ui, '고정 장면 2 — 꺼지지 않는 향초', x(fail), ui.b('계산한다.', function () {
        const f = F();
        if (f.sw && f.sw.fz) return;
        if (f.sw) f.sw.fz = 1;
        const paid = (f.tix || 0) >= 3;
        if (paid) { f.tix -= 3; X.invAdd(CANDLE); }
        const d = X.gam(20, '강매');
        darkRun.log.push('[달콤] 향초 강매' + (paid ? ' (3장)' : ' (상품권 부족 — 도로 가져감)'));
        X.go({ id: 'swFix2r', a: 'forced', paid: paid, d: d });
    }));
};
SC.swFix2r = function (sc) {
    const node = sec('sw', '고정 장면 2');
    let t;
    if (sc.a === 'buy') t = x(opt(node, '꺼지지 않는 향초를 구매한다'));
    else {
        const fail = (opt(node, '계속 간다').pt || {}).fail;
        const pay = opt(fail, '계산한다');
        t = x(opt(pay, sc.paid ? '있음' : '없음'));
    }
    const ui = X.UI();
    X.draw(ui, '고정 장면 2 — 꺼지지 않는 향초', t,
        X.notes([(sc.a === 'buy' || sc.paid) ? '「꺼지지 않는 향초」를 구매했습니다. (상품권 −3)' : '향초는 진열대로 돌아갔습니다.', X.gamNote(sc.d)])
        + ui.b('계속 간다.', function () { next(); }));
};

// 「계속 간다」 80% — 공통 지문
SC.swSkip = function () {
    const ui = X.UI();
    X.draw(ui, '달콤한 밤, 영원한 꿈', x(sec('swp', '스킵 성공 공통 지문')), ui.b('계속 간다.', function () { next(); }));
};

// ==========================================
// 사건 넘기기
// ==========================================
function next() {
    const f = F();
    const s = f.sw;
    if (!s) { X.toLobby(1); return; }
    s.i++;
    if (s.i >= s.q.length) {
        darkRun.log.push('[달콤] 탐사 완료');
        X.toLobby(s.round);
        return;
    }
    const e = s.q[s.i];
    if (e.t === 'n') X.pub('sres/' + X.me() + '/sw' + e.n, (((X.S().sres || {})[X.me()] || {})['sw' + e.n]) ? 1 : 0);
    if (e.t === 'p') X.go({ id: 'swP', e: s.i, st: 'main' });
    else if (e.t === 'c') X.go({ id: 'swC', e: s.i });
    else if (e.t === 'n') X.go({ id: 'swN', e: s.i });
    else X.go({ id: 'swK', e: s.i });
}
X.swNext = next;
function ev(i) { const s = F().sw; return s ? s.q[i] : null; }
function title(i, nm) { const s = F().sw; return '달콤 ' + (s ? s.round : 1) + '회차 · ' + (i + 1) + '/' + (s ? s.q.length : 9) + ' — ' + nm; }

// ==========================================
// 상품
// ==========================================
function prodNode(n) { return sec('swp', '장면 ' + n + '—'); }
SC.swP = function (sc) {
    const f = F();
    const e = ev(sc.e);
    const P = PROD[e.n];
    const node = prodNode(e.n);
    const ui = X.UI();
    const buy = function () {
        return ui.b(node.o[0].l, function () { buyProd(sc.e); },
            { dis: (f.tix || 0) < 1, sub: (f.tix || 0) < 1 ? '상품권이 부족합니다. (1장)' : '상품권 1장' });
    };
    const go = function () { return ui.b('계속 간다.', function () { leaveProd(sc.e); }); };
    if (sc.st === 'look') {
        const ln = opt(node, P.look);
        let ex = X.notes([X.gamNote(sc.d)]);
        if (!P.lookOnlyGo) {
            ex += buy();
            if (P.risky) ex += ui.b(P.risky + '.', function () { X.go({ id: 'swP', e: sc.e, st: 'risky' }); });
        }
        X.draw(ui, title(sc.e, P.it), x(ln), ex + go());
        return;
    }
    if (sc.st === 'risky') {
        const rn = opt(node, P.risky);
        X.draw(ui, title(sc.e, P.it), x(rn), ui.b(P.riskySub + '.', function () { risky(sc.e); }));
        return;
    }
    let extra = buy();
    extra += ui.b(P.look + '.', function () { look(sc.e); });
    if (P.risky) extra += ui.b(P.risky + '.', function () { X.go({ id: 'swP', e: sc.e, st: 'risky' }); });
    extra += go();
    X.draw(ui, title(sc.e, P.it), x(node), extra);
};
function look(i) {
    const f = F();
    const e = ev(i);
    const P = PROD[e.n];
    let d = 0;
    if (P.lookGam && !e.looked) d = X.gam(P.lookGam, P.it + ' 살펴봄');
    e.looked = 1;
    X.go({ id: 'swP', e: i, st: 'look', d: d });
}
function buyProd(i) {
    const f = F();
    const e = ev(i);
    if ((f.tix || 0) < 1 || e.done) return;
    f.tix -= 1;
    e.done = 1;
    X.invAdd(PROD[e.n].it);
    const d = X.gam(12, PROD[e.n].it + ' 구매');
    darkRun.log.push('[달콤] 구매 — ' + PROD[e.n].it);
    X.go({ id: 'swPr', e: i, a: 'buy', d: d });
}
function leaveProd(i) {
    const e = ev(i);
    if (e.done) { next(); return; }
    e.done = 1;
    if (Math.random() < 0.2) X.go({ id: 'swPf', e: i });
    else X.go({ id: 'swSkip' });
}
function forcedParts(n) {
    const node = opt(prodNode(n), '계속 간다');
    const fail = (node && node.pt && node.pt.fail) || node;
    const pay = opt(fail, '계산한다') || fail;
    return { fail: fail, paid: opt(pay, '있음') || opt(pay, '충분'), unpaid: opt(pay, '없음') || opt(pay, '부족') };
}
SC.swPf = function (sc) {
    const e = ev(sc.e);
    const fp = forcedParts(e.n);
    const ui = X.UI();
    X.draw(ui, title(sc.e, PROD[e.n].it), x(fp.fail), ui.b('계산한다.', function () {
        const f = F();
        if (e.fz) return;
        e.fz = 1;
        const paid = (f.tix || 0) >= 1;
        if (paid) f.tix -= 1;
        const got = paid || freeKeep(e.n);
        if (got) X.invAdd(PROD[e.n].it);
        const d = X.gam(20, '강매');
        darkRun.log.push('[달콤] 강매 — ' + PROD[e.n].it + (paid ? ' (1장)' : got ? ' (무상)' : ' (상품권 부족 — 도로 가져감)'));
        X.go({ id: 'swPr', e: sc.e, a: 'forced', paid: paid, got: got, d: d });
    }));
};
SC.swPr = function (sc) {
    const e = ev(sc.e);
    const P = PROD[e.n];
    let t;
    if (sc.a === 'buy') t = x(X.optAt(prodNode(e.n), 0));
    else {
        const fp = forcedParts(e.n);
        t = x(sc.paid ? fp.paid : fp.unpaid) || (sc.paid ? PAID_FALLBACK : '');
    }
    const paid = sc.a === 'buy' || sc.paid;
    const ui = X.UI();
    X.draw(ui, title(sc.e, P.it), t,
        X.notes([paid ? '「' + P.it + '」을(를) 구매했습니다. (상품권 −1)' : sc.got ? '「' + P.it + '」을(를) 받았습니다.' : '「' + P.it + '」은(는) 진열대로 돌아갔습니다.', X.gamNote(sc.d)])
        + ui.b('계속 간다.', function () { next(); }));
};
// 드림모지 체험 · 독사과 절도 — 사망 70% · 무료 획득 30%
function risky(i) {
    const f = F();
    const e = ev(i);
    if (e.done) return;
    e.done = 1;
    const P = PROD[e.n];
    const rn = opt(opt(prodNode(e.n), P.risky), P.riskySub);
    if (Math.random() < 0.7) {
        darkRun.log.push('[달콤] ' + P.risky + ' — 사망 판정');
        X.save();
        X.die(x(rn.pt && rn.pt.die), { id: 'swGo' });
        return;
    }
    X.invAdd(P.it);
    darkRun.log.push('[달콤] ' + P.risky + ' — 무료 획득');
    X.go({ id: 'swPk', e: i });
}
SC.swPk = function (sc) {
    const e = ev(sc.e);
    const P = PROD[e.n];
    const rn = opt(opt(prodNode(e.n), P.risky), P.riskySub);
    const ui = X.UI();
    X.draw(ui, title(sc.e, P.it), x(rn.pt && rn.pt.live),
        X.notes(['「' + P.it + '」 1개를 획득했습니다.']) + ui.b('계속 간다.', function () { next(); }));
};
// 즉사를 막아 살아남은 뒤 — 다음 사건으로
SC.swGo = function () {
    const ui = X.UI();
    X.draw(ui, '달콤한 밤, 영원한 꿈', '정신을 차려 보니 침대 사이의 통로입니다.<br><br>아직 끝나지 않았습니다.',
        ui.b('계속 간다.', function () { next(); }));
};

// ==========================================
// 전투
// ==========================================
SC.swC = function (sc) {
    const e = ev(sc.e);
    const node = combatNode(e.ct, e.n);
    const ui = X.UI();
    const can = X.losable().length > 0;
    X.draw(ui, title(sc.e, CT[e.ct] + ' 전투'), x(node),
        ui.b(node.o[0].l, function () { fight(sc.e, false); })
        + ui.b(node.o[1].l, function () { fight(sc.e, false); })
        + ui.b('가진 것을 던진다.', function () { fight(sc.e, true); },
            { dis: !can, sub: can ? '소지품 하나를 무작위로 던진다 — 판정 +2 (향초 · 식탁보 제외)' : '던질 소지품이 없습니다.' }));
};
function fight(i, toss) {
    const f = F();
    const e = ev(i);
    if (e.done) return;
    e.done = 1;
    let thrown = null;
    if (toss) {
        const L = X.losable();
        if (L.length) { thrown = X.pick(L); X.invDel(thrown); }
    }
    const r = X.roll({ kind: CKIND[e.ct], dc: 15, body: true, n: 1, extra: thrown ? 2 : 0 });
    const ok = r.out === 'ok' || r.out === 'c20';
    X.countRoll(ok);
    let d = 0, lost = null, lostTix = false;
    if (r.out === 'c20') d = X.gam(-10, '전투 대성공');
    if (r.out === 'fail') {
        if (e.ct === 'run') {
            const L = X.losable();
            if (L.length) { lost = X.pick(L); X.invDel(lost); }
            else if ((f.tix || 0) > 0) { f.tix -= 1; lostTix = true; }
        } else d = X.gam(16, '전투 실패');
    }
    const sk = r.out === 'c1' ? null : X.streak(ok);
    const res = { r: r, d: d, lost: lost, lostTix: lostTix, thrown: thrown, sk: sk };
    darkRun.log.push('[달콤] ' + CT[e.ct] + ' 전투 — ' + r.out);
    if (r.out === 'c1') {
        X.die(X.rollHtml(r) + combatRes(e.ct, 'c1'), { id: 'swGo' });
        return;
    }
    if (sk === 'dead' && f.st === 'in') {
        X.die(X.rollHtml(r) + combatRes(e.ct, r.out) + '<br><br>' + X.STREAK_DEATH, { id: 'swGo' });
        return;
    }
    X.go({ id: 'swCr', e: i, res: res });
}
SC.swCr = function (sc) {
    const e = ev(sc.e);
    const s = sc.res;
    const ui = X.UI();
    X.draw(ui, title(sc.e, CT[e.ct] + ' 전투 — 결과'), X.rollHtml(s.r) + combatRes(e.ct, s.r.out),
        X.notes([
            s.thrown ? '「' + esc(s.thrown) + '」을(를) 던졌습니다. (판정 +2)' : null,
            s.lost ? '소지품 「' + esc(s.lost) + '」을(를) 잃었습니다.' : null,
            s.lostTix ? '잃을 소지품이 없어 상품권 1장을 잃었습니다.' : null,
            X.gamNote(s.d), X.streakNote(s.sk)
        ]) + ui.b('계속 간다.', function () { next(); }));
};

// ==========================================
// NPC (2회차)
// ==========================================
function npcCommon(out, persuade) {
    const node = sec('swn', 'NPC 판정 공통 지문');
    if (out === 'pass') return x(opt(node, '지나친다'));
    const lab = out === 'c1' ? '대실패' : out === 'c20' ? '대성공' : out === 'ok' ? '성공' : '실패';
    return x(opt(node, lab));
}
X.npcCommon = npcCommon;
SC.swN = function (sc) {
    const f = F();
    const e = ev(sc.e);
    const node = sec('swn', 'NPC 조우 장면 ' + e.n + ' ');
    const have = X.invHas(e.want) || X.storeHas(e.want);
    const ui = X.UI();
    const plus = f.npcPlus ? ' · 동행 신청서 +1' : '';
    X.draw(ui, title(sc.e, NPC[e.n].n), x(node),
        ui.b('설득한다.', function () { npcTry(sc.e, 'talk'); }, { sub: '맨 주사위 — 20(대성공)이어야 동행합니다.' + plus })
        + ui.b('요구하는 아이템으로 회유한다. — 「' + esc(e.want) + '」', function () { npcTry(sc.e, 'item'); },
            { dis: !have, sub: have ? ('맨 주사위 11 이상 · 아이템은 결과와 관계없이 소모' + (X.invHas(e.want) ? '' : ' (공용 보관함에서 제출)') + plus) : '요구 아이템이 없습니다.' })
        + ui.b('지나친다.', function () { npcTry(sc.e, 'pass'); }));
};
function npcTry(i, how) {
    const f = F();
    const e = ev(i);
    if (e.done) return;
    if (how === 'pass') {
        e.done = 1;
        darkRun.log.push('[달콤] ' + NPC[e.n].n + ' — 지나침');
        X.go({ id: 'swNr', e: i, out: 'pass' });
        return;
    }
    const run = function () {
        e.done = 1;
        const plus = f.npcPlus ? 1 : 0;
        if (plus) f.npcPlus = 0;
        const r = X.roll({ npc: true, plus: plus });
        let ok;
        if (r.raw === 20) ok = true;
        else if (r.raw === 1) ok = false;
        else ok = how === 'talk' ? r.total >= 20 : r.total >= 11;
        const out = r.raw === 20 ? 'c20' : r.raw === 1 ? 'c1' : ok ? 'ok' : 'fail';
        r.out = out;
        let d = 0;
        if (out === 'c20') d = X.gam(-20, 'NPC 대성공');
        if (out === 'c1') d = X.gam(20, 'NPC 대실패');
        if (ok) X.pub('sres/' + X.me() + '/sw' + e.n, 1);
        darkRun.log.push('[달콤] ' + NPC[e.n].n + ' — ' + (how === 'talk' ? '설득' : '회유') + ' ' + out);
        X.go({ id: 'swNr', e: i, out: out, r: r, d: d, how: how, ok: ok });
    };
    if (how === 'item') {
        if (X.invDel(e.want)) { run(); return; }
        X.storeTake(e.want).then(function (got) { if (got) run(); else X.view(); });
        return;
    }
    run();
}
SC.swNr = function (sc) {
    const e = ev(sc.e);
    const ui = X.UI();
    const head = sc.r ? X.rollHtml(sc.r, sc.how === 'talk' ? '설득 — 20 이상' : '아이템 — 11 이상') : '';
    X.draw(ui, title(sc.e, NPC[e.n].n), head + npcCommon(sc.out),
        X.notes([
            sc.how === 'item' ? '「' + esc(e.want) + '」을(를) 건넸습니다.' : null,
            sc.out === 'pass' ? null : (sc.ok ? '<span style="color:#4CAF50;">동행에 동의했습니다.</span> 탐사가 끝나면 로비에서 합류합니다.' : '동행하지 않습니다.'),
            X.gamNote(sc.d)
        ]) + ui.b('계속 간다.', function () { next(); }));
};

// ==========================================
// 위기 — 주사위 없이 고른 대로
// ==========================================
SC.swK = function (sc) {
    const e = ev(sc.e);
    const node = sec('swc', '위기 장면 ' + e.n + ' ');
    const ui = X.UI();
    X.draw(ui, title(sc.e, '위기'), x(node), node.o.map(function (o, j) {
        return ui.b(o.l, function () { crisis(sc.e, j); });
    }).join(''));
};
function crisis(i, j) {
    const e = ev(i);
    if (e.done) return;
    e.done = 1;
    const kind = CRISIS[e.n][j];
    const node = sec('swc', '위기 장면 ' + e.n + ' ');
    darkRun.log.push('[달콤] 위기 ' + e.n + ' — ' + node.o[j].l);
    if (kind === 'd') {
        X.die(x(node.o[j].n), { id: 'swGo' });
        return;
    }
    let d = 0;
    if (kind === 'g') d = X.gam(16, '위기 선택');
    X.go({ id: 'swKr', e: i, j: j, d: d });
}
SC.swKr = function (sc) {
    const e = ev(sc.e);
    const node = sec('swc', '위기 장면 ' + e.n + ' ');
    const ui = X.UI();
    X.draw(ui, title(sc.e, '위기'), x(node.o[sc.j].n), X.notes([X.gamNote(sc.d)]) + ui.b('계속 간다.', function () { next(); }));
};

console.log('[피날레] 달콤한 밤, 영원한 꿈 연결');
})();
