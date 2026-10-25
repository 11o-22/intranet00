// ==========================================
// ★ 피날레 — 「아름다움과 추악함」 (단체 탐사)
// bundles.json 마지막 묶음 — finale-sw.js 다음
// ==========================================
//
//   도입 01~05 → 고정 장면(무대 준비 안내서 · 설명서 두 권) → 모두 모이면 카테고리 공개
//   → 아이템 획득 3 (각자 고르고 각자 굴림 · 11 이상) → 모두 모이면
//   → NPC 조우 3 (제출할 사람은 따로 굴리고, 나머지는 설득/지나친다 투표 → 설득이면 투표한 사람 전원 굴림
//                 · 성공 인원 합이 탐사팀의 2/3 (올림) 이상이면 영입) → 모두 모이면
//   → 위기 3 (투표로 행동을 정하고 각자 굴림 · 「동행인을 민다」는 동행 NPC 가 이쪽에 있을 때만)
//   → 마무리 01~04 → 로비
//
//   카테고리 — 분장 · 소품 · 리허설 가운데 무작위 (씨앗 난수라 같은 부스 사람은 같은 답). 2차는 1차와 다른 것.
//   사건 순서 — 단계 안에서만 섞는다 (역시 씨앗).
//
//   판정  아이템 획득 D20 11 이상 (1 · 20 은 그냥 실패 · 성공, 연속 실패에는 센다)
//         NPC  맨 주사위 — 설득 19 이상 · 제출 11 이상 · 20 대성공(−20) · 1 대실패(+20)
//         위기 D20 DC 15 — 대실패 즉사 · 실패 +16 · 성공 0 (「성공 … 감화도 상승」은 +10) · 대성공 −10
//         판정 없는 선택 — 감화도 +16

(function finaleBeauty() {
'use strict';
const X = window.FINX;
if (!X) return;
const SC = X.SC, LIVE = X.LIVE, AUTO = X.AUTO;
const sec = X.sec, opt = X.opt, x = X.x, esc = X.esc;
function F() { return X.F(); }
function S() { return X.S(); }

const CAT = { bm: '분장', bp: '소품', br: '리허설' };
const CATS = ['bm', 'bp', 'br'];

// 아이템을 주는 선택지 (아래 장면 번호 → 선택지 글 앞부분 → 아이템)
const GIVE = {
    bm: { 1: ['붉은색을 추천한다', '마지막 립스틱'], 2: ['장치를 사용하지 말라고 한다', '미소 고정 장치'], 3: ['분장 도구를 살펴본다', '피날레 전용 클렌징 오일'] },
    bp: { 1: ['「나는 행복했습니다.」', '마지막 대사 수첩'], 2: ['조명을 계속 바라본다', '휴대용 무대 조명'], 3: ['아직 무대에 오르지 않은 사람에게', '무대 위의 흰 장미'] },
    br: { 1: ['고개를 깊이 숙이라고 한다', '막간의 종'], 2: ['두 사람의 차이점을 찾아본다', '배우 식별 끈'], 3: ['박수를 치지 않는다', '관객 평가 카드'] }
};
// NPC 가 원하는 아이템 (장면 4 · 5 · 6)
const WANT = {
    bm: { 4: '마지막 립스틱', 5: '피날레 전용 클렌징 오일', 6: '미소 고정 장치' },
    bp: { 4: '마지막 대사 수첩', 5: '휴대용 무대 조명', 6: '무대 위의 흰 장미' },
    br: { 4: '막간의 종', 5: '배우 식별 끈', 6: '관객 평가 카드' }
};
// 판정 없이 감화도 +16
const G16 = ['장치를 사용하도록 권한다', '세면대의 물을 사용해 본다', '함께 박수를 친다',
    '수정 절차를 받아들인다', '거울 속 여자의 화장을 고쳐 준다', '지정된 위치에서 기다린다'];
// 성공해도 감화도 +10
const RAISE = ['분장을 받는다', '상자 안에 눕는다', '피해자 역할을 맡겠다고 한다', '침대에 눕는다', '마지막 장면을 연기한다', '똑같이 연기한다'];
function hasLab(arr, l) { return arr.some(function (a) { return l.indexOf(a) === 0; }); }

function evNode(cat, n) { return sec(cat, CAT[cat] + ' 0' + n); }
function npcKey(cat, n) { return cat + n; }
// 이름 — 장면 제목에서 (예: 「분장 04 — 지워진 이름 (NPC 조우)」)
(function names() {
    const M = window.FIN_MD || {};
    CATS.forEach(function (c) {
        (M[c] || []).forEach(function (s) {
            const m = s.h.match(/^\S+ 0([4-6]) — (.+?)\s*\(NPC 조우\)/);
            if (m) X.NPC_NAME[npcKey(c, +m[1])] = m[2].trim();
        });
    });
})();

function V() { const b = F().be; return b ? b.v : 1; }
function catOf(v) {
    const c1 = X.pick(CATS, X.srand(X.pid() + '|becat|1'));
    if (v === 1) return c1;
    return X.pick(CATS.filter(function (c) { return c !== c1; }), X.srand(X.pid() + '|becat|2'));
}
function order(v, st) { return X.shuffle([1, 2, 3], X.srand(X.pid() + '|beord|' + v + '|' + st)); }
// 이 부스에 함께 들어온 사람 (살아서 탐사 중인)
function mem(v) {
    const pk = (S().pick || {})[v - 1] || {};
    return X.actives().filter(function (c) { return pk[c] === 'be'; });
}
X.beMem = mem;
function title(nm) { return '아름다움과 추악함 · ' + nm; }

// ==========================================
// 시작
// ==========================================
X.beStart = function (v) {
    const f = F();
    f.be = { v: v, cat: catOf(v), oi: order(v, 'i'), on: order(v, 'n'), ok: order(v, 'k'), ir: {}, kd: {}, nd: {} };
    darkRun.log.push('[아름다움] ' + v + '차 — ' + CAT[f.be.cat]);
    X.go({ id: 'beIn', n: 1 });
};

const IN_LAB = { 1: '계속 간다.', 2: '계속 간다.', 3: '확인한다.', 4: '계속 간다.', 5: '계속 간다.' };
SC.beIn = function (sc) {
    const ui = X.UI();
    X.draw(ui, title('도입 0' + sc.n), x(sec('be', '도입 0' + sc.n)),
        ui.b(IN_LAB[sc.n], function () { X.go(sc.n < 5 ? { id: 'beIn', n: sc.n + 1 } : { id: 'beFix' }); }));
};
const MAN = ['꺼지지 않는 향초 사용 설명서', '식탁보 사용 설명서'];
SC.beFix = function (sc) {
    const node = sec('be', '고정 장면');
    const ui = X.UI();
    if (sc.got) {
        X.draw(ui, title('무대 준비 안내서'), x(opt(node, '설명서를 챙긴다')),
            X.notes(['「' + MAN[0] + '」 · 「' + MAN[1] + '」을 획득했습니다. <span style="color:#888;">(📦 에서 열람)</span>'])
            + ui.b('계속 간다.', function () { gate('in', { id: 'beCat' }); }));
        return;
    }
    X.draw(ui, title('무대 준비 안내서'), x(node), ui.b('설명서를 챙긴다.', function () {
        const f = F();
        if (!f.be.man) { f.be.man = 1; MAN.forEach(function (k) { X.invAdd(k); }); }
        X.go({ id: 'beFix', got: 1 });
    }));
};

// 모두 모일 때까지
function gate(g, nx) {
    const name = 'be' + V() + g;
    X.gatePress(name);
    X.go({ id: 'beGate', g: name, nx: nx });
}
SC.beGate = function (sc) {
    const ui = X.UI();
    X.draw(ui, title('대기'), '함께 들어온 교우들을 기다립니다.', X.waitHtml(sc.g, mem(V())), { keep: true });
};
LIVE.beGate = true;
AUTO.beGate = function (sc) { if (X.gateDone(sc.g, mem(V()))) X.go(sc.nx); };

SC.beCat = function () {
    const f = F();
    const ui = X.UI();
    X.draw(ui, title(CAT[f.be.cat]),
        '<div class="fin-sys">이번 준비 과정 — 「' + CAT[f.be.cat] + '」</div>'
        + '아이템 획득 셋 · NPC 조우 셋 · 위기 셋을 차례로 지납니다.<br><span style="font-size:11px; color:#888;">아이템은 각자 얻고, NPC 와 위기는 함께 투표로 정합니다.</span>',
        ui.b('계속 간다.', function () { X.go({ id: 'beI', j: 0, p: [] }); }));
};

// ==========================================
// 아이템 획득 — 각자
// ==========================================
function nodeAt(root, path) {
    let n = root;
    (path || []).forEach(function (l) { n = opt(n, l); });
    return n;
}
// 아래에 「계속 간다」 말고 다른 선택지가 있으면 한 단계 더 들어간다
function deeper(n) { return !!(n && n.o && n.o.some(function (o) { return o.l.indexOf('계속 간다') !== 0; })); }

SC.beI = function (sc) {
    const f = F();
    const n = f.be.oi[sc.j];
    const root = evNode(f.be.cat, n);
    const node = nodeAt(root, sc.p);
    const ui = X.UI();
    const btns = (node.o || []).map(function (o) {
        return ui.b(o.l, function () {
            if (deeper(o.n)) X.go({ id: 'beI', j: sc.j, p: sc.p.concat([o.l]) });
            else itemAct(sc.j, o.l, o.n);
        });
    }).join('');
    X.draw(ui, title(CAT[f.be.cat] + ' — 아이템 획득 ' + (sc.j + 1) + '/3'), x(node), btns);
};
function itemAct(j, lab, node) {
    const f = F();
    if (f.be.ir[j]) return;
    const cat = f.be.cat;
    const n = f.be.oi[j];
    const g = GIVE[cat][n];
    const res = { lab: lab };
    const nm = mem(V()).length;
    if (node && node.d20) {
        const r = X.roll({ kind: 'break', dc: 15, body: true, n: nm });
        const ok = r.out === 'ok' || r.out === 'c20';
        X.countRoll(ok);
        res.r = r;
        if (r.out === 'c20') res.d = X.gam(-10, '대성공');
        if (r.out === 'fail') res.d = X.gam(16, '실패');
        if (r.out !== 'c1') res.sk = X.streak(ok);
        f.be.ir[j] = res;
        if (r.out === 'c1') { X.die(x(node) + X.rollHtml(r) + esc0(node.d20.c1), { id: 'beGo', nx: itemNext(j) }); return; }
        if (res.sk === 'dead' && f.st === 'in') { X.die(X.rollHtml(r) + esc0(node.d20[r.out]) + '<br><br>' + X.STREAK_DEATH, { id: 'beGo', nx: itemNext(j) }); return; }
    } else if (g && lab.indexOf(g[0]) === 0) {
        const r = X.roll({ kind: 'sense', dc: 11, item: true, n: nm });
        const ok = r.out === 'ok';
        X.countRoll(ok);
        res.r = r; res.item = g[1]; res.got = ok;
        if (ok) X.invAdd(g[1]);
        res.sk = X.streak(ok);
        darkRun.log.push('[아름다움] ' + g[1] + ' — ' + (ok ? '획득' : '실패'));
        f.be.ir[j] = res;
        if (res.sk === 'dead' && f.st === 'in') { X.die(X.rollHtml(r, '아이템 획득 — 11 이상') + '<br>' + X.STREAK_DEATH, { id: 'beGo', nx: itemNext(j) }); return; }
    } else if (hasLab(G16, lab)) {
        res.d = X.gam(16, '선택');
        f.be.ir[j] = res;
    } else {
        f.be.ir[j] = res;
    }
    X.go({ id: 'beIr', j: j });
}
function esc0(s) { return s ? '<div style="margin-top:6px;">' + s + '</div>' : ''; }
function itemNext(j) { return j < 2 ? { id: 'beI', j: j + 1, p: [] } : { id: '_gate', g: 's1', nx: { id: 'beN', j: 0 } }; }
SC.beIr = function (sc) {
    const f = F();
    const res = f.be.ir[sc.j] || {};
    const root = evNode(f.be.cat, f.be.oi[sc.j]);
    // 선택지 노드를 다시 찾는다 (한 단계 아래일 수도 있다)
    let node = opt(root, res.lab);
    if (!node) (root.o || []).some(function (o) { const k = opt(o.n, res.lab); if (k) { node = k; return true; } return false; });
    let t = x(node);
    if (res.r && node && node.d20) t += X.rollHtml(res.r) + esc0(node.d20[res.r.out]);
    else if (res.r) {
        t += '<br><br>' + X.rollHtml(res.r, '아이템 획득 — 11 이상');
        if (!res.got) t += x(sec('be', '아이템 획득 실패 공통 지문'));
    }
    const ui = X.UI();
    X.draw(ui, title(CAT[f.be.cat] + ' — 아이템 획득 ' + (sc.j + 1) + '/3'), t,
        X.notes([res.got ? '「' + esc(res.item) + '」을(를) 획득했습니다.' : null, X.gamNote(res.d), X.streakNote(res.sk)])
        + ui.b('계속 간다.', function () { goNx(itemNext(sc.j)); }));
};
function goNx(nx) {
    if (nx.id === '_gate') gate(nx.g, nx.nx);
    else X.go(nx);
}
// 즉사를 막아 살아남은 뒤
SC.beGo = function (sc) {
    const ui = X.UI();
    X.draw(ui, title('—'), '숨을 들이켜자 분장실의 향수 냄새가 다시 코끝에 닿습니다.<br><br>아직 막이 내리지 않았습니다.',
        ui.b('계속 간다.', function () { goNx(sc.nx); }));
};

// ==========================================
// NPC 조우 — 제출은 각자, 설득은 투표
// ==========================================
//   finale/{파티}/bn/{v}/{j}/{사번} = { h: 'item'|'talk'|'pass'|'none', ok, out }
//   finale/{파티}/bnf/{v}/{j}        = { ok, s, need, tot }   (최종 — 한 번만 적힌다)
const NPC_WAIT = 90;          // 투표가 끝난 뒤 이만큼 지나도 안 굴린 사람은 실패로 친다
function bnOf(v, j) { return (((S().bn || {})[v] || {})[j]) || {}; }
function bnfOf(v, j) { return (((S().bnf || {})[v] || {})[j]) || null; }
function nKey(v, j) { return 'bn' + v + '_' + j; }
function voters(v, j) {
    const b = bnOf(v, j);
    return mem(v).filter(function (c) { return !(b[c] && b[c].h === 'item'); });
}
function canSubmit(v, j) {
    const f = F();
    const n = f.be.on[j] + 3;
    const want = WANT[f.be.cat][n];
    if (!(X.invHas(want) || X.storeHas(want))) return null;
    if (X.srand(X.pid() + '|' + X.me() + '|besub|' + v + '|' + j)() >= 0.5) return null;
    return want;
}
SC.beN = function (sc) {
    const f = F();
    const v = V(), j = sc.j;
    const n = f.be.on[j] + 3;
    const node = evNode(f.be.cat, n);
    const key = nKey(v, j);
    const vo = X.voteOf(key);
    const mine = bnOf(v, j)[X.me()];
    const fin = bnfOf(v, j);
    const ui = X.UI();
    const head = title(CAT[f.be.cat] + ' — NPC 조우 ' + (j + 1) + '/3');
    const vs = voters(v, j);
    const names = { talk: '설득한다', pass: '지나친다' };

    // 내 결과가 있다 — 결과와 팀 결과
    if (mine || fin) {
        let t = '';
        const d = f.be.nd[j];
        if (mine && mine.h !== 'none') {
            if (d && d.r) t += X.rollHtml(d.r, mine.h === 'item' ? '제출 — 11 이상' : '설득 — 19 이상');
            t += npcText(mine.h === 'pass' ? 'pass' : mine.out);
        } else t += '당신은 한 걸음 물러서서 지켜봅니다.';
        let ex = X.notes([
            d && d.item ? '「' + esc(d.item) + '」을(를) 건넸습니다.' : null,
            d ? X.gamNote(d.d) : null
        ]);
        if (fin) {
            ex += '<div class="fin-list">성공 <b style="color:#d4af37;">' + fin.s + '</b> / 필요 ' + fin.need + ' (탐사팀 ' + fin.tot + '명)<br>'
                + (fin.ok ? '<span style="color:#4CAF50;">「' + esc(X.NPC_NAME[npcKey(f.be.cat, n)]) + '」이(가) 동행에 동의했습니다.</span> 탐사가 끝나면 로비에서 합류합니다.'
                    : '<span style="color:#888;">「' + esc(X.NPC_NAME[npcKey(f.be.cat, n)]) + '」은(는) 따라오지 않습니다.</span>') + '</div>';
            ex += ui.b('계속 간다.', function () {
                goNx(j < 2 ? { id: 'beN', j: j + 1 } : { id: '_gate', g: 's2', nx: { id: 'beK', j: 0 } });
            });
        } else {
            const b = bnOf(v, j);
            const done = mem(v).filter(function (c) { return !!b[c]; }).length;
            ex += '<div class="fin-wait">다른 교우들의 결과를 기다리는 중 — <b style="color:#d4af37;">' + done + ' / ' + mem(v).length + '</b></div>';
        }
        X.draw(ui, head, t, ex, { keep: true });
        return;
    }
    const want = canSubmit(v, j);
    const sub = want ? ui.b('「' + esc(want) + '」을(를) 제출한다.', function () { npcSubmit(j, want); },
        { sub: '투표에서 빠져 혼자 굴립니다 — 맨 주사위 11 이상 · 아이템은 결과와 관계없이 소모' + (X.invHas(want) ? '' : ' (공용 보관함에서 제출)') + (f.npcPlus ? ' · 동행 신청서 +1' : '') }) : '';
    // 투표 전
    if (vo.res == null) {
        const voted = (vo.v || {})[X.me()];
        let ex = X.voteHtml(key, vs, ['talk', 'pass'], names);
        if (voted == null) {
            ex += sub + ui.b('설득한다.', function () { X.voteCast(key, 'talk'); X.view({ keep: true }); }, { sub: '투표 — 설득으로 정해지면 투표한 사람 모두가 맨 주사위를 굴립니다 (19 이상)' + (f.npcPlus ? ' · 동행 신청서 +1' : '') })
                + ui.b('지나친다.', function () { X.voteCast(key, 'pass'); X.view({ keep: true }); }, { sub: '투표' });
        } else ex += '<div class="fin-wait">「' + names[voted] + '」에 투표했습니다. 다른 교우를 기다리는 중</div>';
        X.draw(ui, head, x(node), ex, { keep: true });
        return;
    }
    // 투표가 끝났다
    const iVoted = (vo.v || {})[X.me()] != null;
    let ex = '<div class="fin-list">투표 결과 — <b style="color:#d4af37;">' + names[vo.res] + '</b>' + (vo.tie ? ' <span style="color:#888;">(동률 — 무작위)</span>' : '') + '</div>';
    if (iVoted && vo.res === 'talk') {
        ex += ui.b('설득한다. — 주사위를 굴린다.', function () { npcTalk(j); }, { gold: true, sub: '맨 주사위 19 이상' + (f.npcPlus ? ' · 동행 신청서 +1' : '') });
    } else if (iVoted) {
        ex += '<div class="fin-wait">정리하는 중…</div>';
    } else {
        ex += sub + ui.b('지켜본다.', function () { X.pub('bn/' + v + '/' + j + '/' + X.me(), { h: 'none', ok: 0 }); X.view({ keep: true }); },
            { sub: '투표에 참여하지 않았습니다 — 판정 없이 지켜봅니다.' });
    }
    X.draw(ui, head, x(node), ex, { keep: true });
};
LIVE.beN = true;
AUTO.beN = function (sc) {
    const f = F();
    const v = V(), j = sc.j;
    const key = nKey(v, j);
    const vs = voters(v, j);
    const vo = X.voteOf(key);
    const b = bnOf(v, j);
    if (vo.res == null && vs.length) X.voteResolve(key, vs, ['talk', 'pass']);
    // 지나친다로 정해졌으면 투표한 나는 판정 없이 끝
    if (vo.res === 'pass' && (vo.v || {})[X.me()] != null && !b[X.me()]) X.pub('bn/' + v + '/' + j + '/' + X.me(), { h: 'pass', ok: 0 });
    // 최종
    if (bnfOf(v, j)) return;
    const M = mem(v);
    if (!M.length) return;
    const allIn = M.every(function (c) { return !!b[c]; });
    const noVoters = !vs.length && M.every(function (c) { return b[c] && b[c].h === 'item'; });
    const late = vo.at && Date.now() - vo.at > NPC_WAIT * 1000;
    if (!(allIn || noVoters || late)) return;
    const s = M.filter(function (c) { return b[c] && b[c].ok; }).length;
    const need = Math.ceil(M.length * 2 / 3);
    const ok = s >= need;
    const n = f.be.on[j] + 3;
    X.tx('bnf/' + v + '/' + j, function (cur) {
        if (cur) return;
        return { ok: ok ? 1 : 0, s: s, need: need, tot: M.length, at: Date.now() };
    }).then(function (r) {
        if (r && r.committed) X.pub('bres/' + v + '/' + npcKey(f.be.cat, n), ok ? 1 : 0);
    });
};
function npcText(out) {
    const node = sec('be', 'NPC 판정 공통 지문');
    if (out === 'pass') return x(opt(node, '지나친다'));
    const lab = out === 'c1' ? '대실패' : out === 'c20' ? '대성공' : out === 'ok' ? '성공' : '실패';
    return x(opt(node, lab));
}
function npcRoll(how) {
    const f = F();
    const plus = f.npcPlus ? 1 : 0;
    if (plus) f.npcPlus = 0;
    const r = X.roll({ npc: true, plus: plus });
    const need = how === 'item' ? 11 : 19;
    const out = r.raw === 20 ? 'c20' : r.raw === 1 ? 'c1' : r.total >= need ? 'ok' : 'fail';
    r.out = out;
    let d = 0;
    if (out === 'c20') d = X.gam(-20, 'NPC 대성공');
    if (out === 'c1') d = X.gam(20, 'NPC 대실패');
    return { r: r, out: out, ok: out === 'ok' || out === 'c20', d: d };
}
function npcSubmit(j, want) {
    const f = F();
    const v = V();
    if (f.be.nd[j]) return;
    const run = function () {
        const k = npcRoll('item');
        f.be.nd[j] = { r: k.r, d: k.d, item: want };
        darkRun.log.push('[아름다움] NPC 제출 ' + want + ' — ' + k.out);
        X.pub('bn/' + v + '/' + j + '/' + X.me(), { h: 'item', ok: k.ok ? 1 : 0, out: k.out });
        X.save();
        X.view({ keep: true });
    };
    if (X.invDel(want)) { run(); return; }
    X.storeTake(want).then(function (got) { if (got) run(); else X.view(); });
}
function npcTalk(j) {
    const f = F();
    const v = V();
    if (f.be.nd[j]) return;
    const k = npcRoll('talk');
    f.be.nd[j] = { r: k.r, d: k.d };
    darkRun.log.push('[아름다움] NPC 설득 — ' + k.out);
    X.pub('bn/' + v + '/' + j + '/' + X.me(), { h: 'talk', ok: k.ok ? 1 : 0, out: k.out });
    X.save();
    X.view({ keep: true });
}

// ==========================================
// 위기 — 투표로 행동, 각자 굴림
// ==========================================
function kKey(v, j) { return 'bk' + v + '_' + j; }
function tKey(v, j) { return 'bt' + v + '_' + j; }
// 이 부스를 따라온 동행 NPC
function myComps() { return X.comps('be'); }
function kOpts(node) {
    const out = [];
    (node.o || []).forEach(function (o, i) {
        if (o.l.indexOf('동행인을 민다') === 0) { if (myComps().length) out.push('s'); }
        else out.push('o' + i);
    });
    return out;
}
function kName(node, id) {
    if (id === 's') return '동행인을 민다.';
    return node.o[+id.slice(1)].l;
}
SC.beK = function (sc) {
    const f = F();
    const v = V(), j = sc.j;
    const n = f.be.ok[j] + 6;
    const node = evNode(f.be.cat, n);
    const key = kKey(v, j);
    const vo = X.voteOf(key);
    const head = title(CAT[f.be.cat] + ' — 위기 ' + (j + 1) + '/3');
    const ui = X.UI();
    const M = mem(v);
    const ops = kOpts(node);
    const names = {};
    ops.forEach(function (id) { names[id] = kName(node, id); });
    const done = f.be.kd[j];
    if (done) { kResult(ui, head, node, j, done); return; }
    if (vo.res == null) {
        const voted = (vo.v || {})[X.me()];
        let ex = X.voteHtml(key, M, ops, names);
        if (voted == null) {
            ex += ops.map(function (id) {
                const o = id === 's' ? null : node.o[+id.slice(1)];
                const tag = id === 's' ? '판정 없이 위기를 피합니다 — 동행 NPC 한 명이 죽습니다.' : (o.n && o.n.d20 ? '각자 D20 판정 (DC 15)' : '판정 없음');
                return ui.b(names[id], function () { X.voteCast(key, id); X.view({ keep: true }); }, { sub: '투표 — ' + tag, red: id === 's' });
            }).join('');
        } else ex += '<div class="fin-wait">「' + esc(names[voted]) + '」에 투표했습니다. 다른 교우를 기다리는 중</div>';
        X.draw(ui, head, x(node), ex, { keep: true });
        return;
    }
    const res = vo.res;
    let ex = '<div class="fin-list">투표 결과 — <b style="color:#d4af37;">' + esc(names[res] || kName(node, res)) + '</b>' + (vo.tie ? ' <span style="color:#888;">(동률 — 무작위)</span>' : '') + '</div>';
    if (res === 's') {
        const C = myComps();
        const tk = tKey(v, j);
        const tv = X.voteOf(tk);
        if (C.length > 1 && tv.res == null) {
            const nm = {};
            C.forEach(function (c) { nm[c] = X.NPC_NAME[c] || c; });
            const tvoted = (tv.v || {})[X.me()];
            ex += '<div style="font-size:11px; color:#ccc; margin:4px 0 8px 0;">누구를 밀어낼지 정합니다.</div>' + X.voteHtml(tk, M, C, nm);
            if (tvoted == null) ex += C.map(function (c) { return ui.b(esc(nm[c]), function () { X.voteCast(tk, c); X.view({ keep: true }); }, { sub: '투표' }); }).join('');
            else ex += '<div class="fin-wait">다른 교우를 기다리는 중</div>';
            X.draw(ui, head, x(node), ex, { keep: true });
            return;
        }
        const target = C.length > 1 ? tv.res : (C[0] || (tv.res || null));
        ex += ui.b('계속 간다.', function () { kSacrifice(j, target); });
        X.draw(ui, head, x(node), ex, { keep: true });
        return;
    }
    const o = node.o[+res.slice(1)];
    if (o.n && o.n.d20) {
        ex += ui.b('주사위를 굴린다.', function () { kRoll(j, res); }, { gold: true, sub: 'D20 · DC 15' });
    } else {
        ex += ui.b('계속 간다.', function () { kPlain(j, res); });
    }
    X.draw(ui, head, x(node), ex, { keep: true });
};
LIVE.beK = true;
AUTO.beK = function (sc) {
    const f = F();
    if (f.be.kd[sc.j]) return;
    const v = V(), j = sc.j;
    const node = evNode(f.be.cat, f.be.ok[j] + 6);
    const key = kKey(v, j);
    const vo = X.voteOf(key);
    const M = mem(v);
    if (vo.res == null) { X.voteResolve(key, M, kOpts(node)); return; }
    if (vo.res === 's') {
        const C = myComps();
        if (C.length > 1) X.voteResolve(tKey(v, j), M, C);
    }
};
function kOptNode(j, res) {
    const f = F();
    const node = evNode(f.be.cat, f.be.ok[j] + 6);
    return node.o[+res.slice(1)];
}
function kNext(j) { return j < 2 ? { id: 'beK', j: j + 1 } : { id: 'beOut', n: 1 }; }
function kRoll(j, res) {
    const f = F();
    if (f.be.kd[j]) return;
    const o = kOptNode(j, res);
    const r = X.roll({ kind: 'break', dc: 15, body: true, n: mem(V()).length });
    const ok = r.out === 'ok' || r.out === 'c20';
    X.countRoll(ok);
    const k = { res: res, r: r };
    if (r.out === 'c20') k.d = X.gam(-10, '위기 대성공');
    else if (r.out === 'fail') k.d = X.gam(16, '위기 실패');
    else if (r.out === 'ok' && hasLab(RAISE, o.l)) k.d = X.gam(10, '위기 성공');
    if (r.out !== 'c1') k.sk = X.streak(ok);
    f.be.kd[j] = k;
    darkRun.log.push('[아름다움] 위기 — ' + o.l + ' ' + r.out);
    if (r.out === 'c1') { X.die(x(o.n) + X.rollHtml(r) + esc0(o.n.d20.c1), { id: 'beGo', nx: kNext(j) }); return; }
    if (k.sk === 'dead' && f.st === 'in') { X.die(X.rollHtml(r) + esc0(o.n.d20[r.out]) + '<br><br>' + X.STREAK_DEATH, { id: 'beGo', nx: kNext(j) }); return; }
    X.save();
    X.view();
}
function kPlain(j, res) {
    const f = F();
    if (f.be.kd[j]) return;
    const o = kOptNode(j, res);
    const k = { res: res };
    if (hasLab(G16, o.l)) k.d = X.gam(16, '위기 선택');
    f.be.kd[j] = k;
    darkRun.log.push('[아름다움] 위기 — ' + o.l);
    X.save();
    X.view();
}
function kSacrifice(j, target) {
    const f = F();
    if (f.be.kd[j]) return;
    f.be.kd[j] = { res: 's', t: target };
    if (target) {
        X.tx('npc/' + target, function (cur) { cur = cur || {}; if (cur.dead) return; cur.dead = 1; cur.by = X.me(); return cur; });
        X.pub('sac', 1);
        darkRun.log.push('[아름다움] 동행인을 민다 — ' + (X.NPC_NAME[target] || target));
    }
    X.save();
    X.view();
}
function kResult(ui, head, node, j, k) {
    let t, ex = '';
    if (k.res === 's') {
        t = x(sec('be', '동행인을 민다'));
        ex = X.notes([k.t ? '동행 NPC 「' + esc(X.NPC_NAME[k.t] || k.t) + '」이(가) 사망했습니다.' : null,
            '<span style="color:#ff8a80;">동행 NPC 를 희생했습니다.</span>']);
    } else {
        const o = node.o[+k.res.slice(1)];
        t = x(o.n);
        if (k.r) t += X.rollHtml(k.r) + esc0(o.n.d20[k.r.out]);
        ex = X.notes([X.gamNote(k.d), X.streakNote(k.sk)]);
    }
    X.draw(ui, head, t, ex + ui.b('계속 간다.', function () { X.go(kNext(j)); }));
}

// ==========================================
// 마무리 01~04 → 로비
// ==========================================
const OUT_LAB = { 1: '출입구로 향한다.', 2: '확인한다.', 3: '이곳을 벗어난다.', 4: '로비로 돌아간다.' };
SC.beOut = function (sc) {
    const ui = X.UI();
    X.draw(ui, title('마무리 0' + sc.n), x(sec('be', '마무리 0' + sc.n)), ui.b(OUT_LAB[sc.n], function () {
        if (sc.n < 4) X.go({ id: 'beOut', n: sc.n + 1 });
        else { darkRun.log.push('[아름다움] 탐사 완료'); X.toLobby(V()); }
    }));
};

console.log('[피날레] 아름다움과 추악함 연결');
})();
