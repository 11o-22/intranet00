// ==========================================
// ★ 「이상한 나라의 ■■■」 — 천사와 악마 연계판 「빛을 찾아서」 (몽환)
// bundles.json 마지막 묶음 — wonder-link.js 다음
// ==========================================
//
//   원고: 「천사와 악마의 장 · 몽환 — 원고」 문서의 연계판 공통 뼈대 · 진입 · 귀환 · S1~T8.
//   지문은 원고 그대로 쓰고, 원고가 「기존 A-214」에 맡긴 방과 기믹은 wonder-link.js 의 복도 · 기믹으로 대신한다.
//   미션마다 걸음 목록(steps) · 판의 설정(plan) · 흔적(hints) · 결말 제목을 적는다.
//
//   결과: 'w' 이상한 나라 쪽 ✔ · 'd' 어둠 쪽 ✔ · 'f' ✖

(function wonderLinkAngel() {
'use strict';
const X = window.WONDER;
if (!X || !X.L) return;
const L = X.L;
const A = X.A = X.A || {};
function F() { return X.F(); }
function ME() { return currentUser.code; }
function me() { return L.me(); }
function esc(s) { return L.esc(s); }
function st() { return F().lk.s; }
function scn(name) { return L.sub('a_new', L.def().base, name); }
function p0(name) { const s = scn(name); return s ? s.p[0] : { x: '', o: [] }; }
function strip(h) { return String(h || '').replace(/<[^>]+>/g, ''); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
function shuf(a, rnd) { return X.shuffle(a, rnd); }
function roomsPlan(p, rnd) { p.rooms = shuf([0, 1, 2, 3, 4, 5], rnd); p.gims = shuf([0, 1, 2, 3], rnd); }
function M(base, o) { return Object.assign({ key: 'a_new', enterIdx: 16, returnIdx: 17, base: base, timeEnd: '시간' }, o); }
function E(t, r, extra) { L.end(t, r, extra); }
const COMMON = [{ k: 'enter' }, { k: 'reveal' }, { k: 'rules' }];

// ==========================================
// 함께 고르는 걸음 — 투표든 몰래 고르기든 같은 모양
// ==========================================
//   step: { k:'team', id, title, text(step), opts(step) → [{l, v, roll?}], who?(step), resolve(map, step) → { html, end:[t,r,extra] } }
L.K.team = function (step, i) {
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    const key = step.id;
    const m = L.votes(key);
    const who = step.who ? step.who(step) : L.who();
    const text = step.text ? step.text(step) : '';
    const title = step.title || '—';
    const iAmIn = who.indexOf(ME()) >= 0;
    if (iAmIn && m[ME()] == null) {
        const os = step.opts(step);
        L.draw(title, text, os.map(function (o, j) { return X.btn(o.l, 'WONDER.A.cast(' + i + ',' + j + ')'); }).join(''));
        return;
    }
    if (!who.every(function (c) { return m[c] != null; })) {
        const mine = m[ME()];
        L.draw(title, text + (mine != null && step.mineTxt ? '<div class="wd-sys">' + step.mineTxt(mine) + '</div>' : ''), L.waitList(m, who));
        return;
    }
    const r = step.resolve(m, step) || {};
    if (r.end) { E(r.end[0], r.end[1], r.end[2]); L.draw(title, text, X.waitHtml('_none', '…')); return; }
    if (r.wait) { L.draw(title, (r.html || text), X.waitHtml('_none', '…')); return; }
    L.draw(title, r.html || '', X.btn('계속 간다.', 'WONDER.lkNext()'));
};
A.cast = function (i, j) {
    const f = F();
    if (f.lk.i !== i) return;
    const step = L.def().steps[i];
    const o = step.opts(step)[j];
    if (!o || L.votes(step.id)[ME()] != null) return;
    let v = o.v;
    if (o.roll) { const r = X.roll(o.roll()); v = { v: o.v, ok: r.ok, n: r.total }; try { showDarkToast((r.ok ? '✔ ' : '✖ ') + r.total + ' / 16'); } catch (e) { } }
    L.vote(step.id, v);
};
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function memOpts(prefix, label, incNpc) {
    const p = L.plan();
    const list = p.mem.slice();
    if (incNpc && p.npc) list.push('npc');
    return list.map(function (c) { return { l: label(L.name(c), c), v: prefix + c }; });
}

// ==========================================
// S1 잃어버린 증거
// ==========================================
const S1_ROOM = { '창고': 1, '기도실': 1, '좁은 통로': 1 };
L.K.s1 = function (step, i) {
    const s = st(), lk = me();
    const p = L.plan();
    const here = p.fork === step.room;
    const pg = p0(step.room);
    if (s.ask) return s1ask(s);
    const found = !!(s.r && s.r.ok);
    let x = L.cond(pg.x, function (n) { return (n === '포크가 여기 있는 판' && here && found) || (n === '성공 흔적' && found); });
    let pre = '';
    if (s.r) pre = X.rollHtml(s.r);
    let b = '';
    if (!s.r) {
        b = X.btn('뒤진다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.A.s1search()') + X.btn('그냥 지나간다.', 'WONDER.A.s1leave()');
    } else if (!s.r.ok) {
        x += '<br><br>아무것도 찾지 못했다.' + (s.gt || '');
        b = X.btn('다시 뒤진다.', 'WONDER.A.s1search()') + X.btn('방을 나선다.', 'WONDER.A.s1leave()');
    } else if (here && !lk.have) {
        if (s.fr && !s.fr.ok) x += '<br><br>' + X.rollHtml(s.fr) + (step.room === '기도실' ? '포크가 자국 안쪽으로 더 들어간다. 이제는 무릎을 꿇지 않고는 닿지 않는다.' : '색종이가 손목을 덮는다. 은빛이 조금 더 깊어졌다.') + (s.gt2 || '');
        if (step.room === '기도실') {
            b = X.btn('무릎을 꿇고 줍는다. <span style="font-size:10px;color:#888;">(신도가 본다)</span>', 'WONDER.A.s1take(0)')
                + (s.deep ? '' : X.btn('발끝으로 끌어당긴다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.A.s1take(1)'));
        } else {
            b = X.btn('끝이 나올 때까지 손을 넣는다. <span style="font-size:10px;color:#888;">(시간 −1분 30초)</span>', 'WONDER.A.s1take(2)')
                + X.btn('한 번에 손을 넣는다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.A.s1take(3)');
        }
    } else {
        if (here && lk.have) x += '<br><br><b>은 포크를 손에 넣었다.</b>';
        else if (step.room !== '창고') x += '<br><br>여기에는 없다.';
        b = X.btn('방을 나선다.', 'WONDER.A.s1leave()');
    }
    L.draw(step.room, pre + x + (s.h ? '<div class="wd-sys">흔적 — ' + s.h + '</div>' : ''), b);
};
A.s1search = function () {
    const s = st();
    const r = L.roll('search');
    s.r = r; s.gt = '';
    if (!r.ok) s.gt = L.gimTime(false);
    else s.h = L.hint();
    X.save(); X.view();
};
A.s1take = function (k) {
    const s = st(), lk = me();
    if (k === 0) { lk.have = 1; lk.npcKnows = 1; }
    else if (k === 2) { lk.have = 1; L.addTime(-90000); }
    else {
        const r = L.roll();
        s.fr = r;
        if (r.ok) lk.have = 1;
        else { s.gt2 = L.gimTime(false); if (k === 1) s.deep = 1; }
    }
    X.save(); X.view();
};
A.s1leave = function () { st().ask = 1; X.save(); X.view(); };
function s1ask(s) {
    const lk = me();
    if (!s.ans) {
        L.draw('—', '방을 나서자 먼저 내려간 신도가 옆에 선다.<br><br>“찾으셨습니까.”',
            X.btn('“찾았다.”', "WONDER.A.s1ans('y')") + X.btn('“못 찾았다.”', "WONDER.A.s1ans('n')") + X.btn('대답하지 않는다.', "WONDER.A.s1ans('-')"));
        return;
    }
    let t = '';
    if (s.ans === '-') t = '신도는 대답을 기다리지 않는다. 고개를 한 번 끄덕이고 앞장선다.';
    else if (s.lie) t = !s.lr.ok ? '신도는 고개를 끄덕인다. 더 묻지 않는다.'
        : lk.have ? '신도가 당신의 주머니를 오래 본다. “그렇군요.” 그는 이제 안다.' : '신도가 당신의 빈손을 본다. “아직이시군요.”';
    else t = '신도는 고개를 끄덕인다. “그렇군요.”';
    L.draw('—', (s.lr ? X.rollHtml(s.lr) : '') + t, X.btn('계속 간다.', 'WONDER.lkNext()'));
}
A.s1ans = function (a) {
    const s = st(), lk = me();
    s.ans = a;
    s.lie = (a === 'n' && lk.have) || (a === 'y' && !lk.have);
    if (s.lie) { s.lr = X.roll(0); if (s.lr.ok && lk.have) lk.npcKnows = 1; }
    X.save(); X.view();
};
L.K.s1alt = function (step, i) {
    const s = st(), lk = me();
    const pg = p0('제단 문 앞');
    if (s.grab) {
        L.draw('제단 문 앞', '꼬리표를 꺼내는 순간 신도가 당신의 손목을 잡는다. 그는 알고 있다.<br><br>“여기입니다.”<br><br>' + X.rollHtml(s.grab), X.waitHtml('_none', '…'));
        return;
    }
    if (!lk.have) {
        L.draw('제단 문 앞', L.txt(pg.x) + '<br><br>당신의 손에는 아무것도 없다.',
            X.btn('돌아가서 다시 찾는다.', 'WONDER.A.s1back()') + X.btn('빈손으로 계단을 오른다.', 'WONDER.A.s1alt(9)'));
        return;
    }
    L.draw('제단 문 앞', L.txt(pg.x), (pg.o || []).map(function (o, j) { return X.btn(L.txt(o.l), 'WONDER.A.s1alt(' + j + ')'); }).join(''));
};
A.s1back = function () {
    const p = L.plan();
    const d = L.def();
    const i = d.steps.findIndex(function (s) { return s.k === 's1' && s.room === p.fork; });
    L.goStep(i < 0 ? 4 : i);
};
A.s1alt = function (j) {
    const s = st(), lk = me();
    if (j === 9) return E('시간', 'f');
    if (j === 0) {
        if (lk.npcKnows) {
            s.grab = X.roll(0);
            X.save(); X.view();
            return setTimeout(function () { E(s.grab.ok ? '증거가 되다' : '열쇠가 되다', s.grab.ok ? 'w' : 'd'); }, 1600);
        }
        return E('증거가 되다', 'w');
    }
    if (j === 1) return E('열쇠가 되다', 'd');
    return E('반씩', 'f');
};

// ==========================================
// S2 묵비권
// ==========================================
const S2_SENT = [
    ['저는', '위에서', '무죄를', '받고', '내려왔습니다'],
    ['아래층에는', '판결이', '너무', '잘', '들립니다'],
    ['제 이름은', '아직', '위에도', '적혀', '있습니다']
];
function s2state() { const lk = me(); lk.s2 = lk.s2 || { w: [], turn: 0, spoke: 0, light: 0 }; return lk.s2; }
function lightBar(n) { return '<span style="color:#d4af37;">' + '●'.repeat(n) + '</span>' + '○'.repeat(Math.max(0, 3 - n)); }
L.K.s2 = function (step) {
    const s = st(), q = s2state();
    const pg = scn('기도실');
    const head = '<div class="wd-sys">대화 ' + Math.min(q.turn + (s.res ? 0 : 1), 5) + ' / 5 · 다가온 빛 ' + lightBar(q.light) + '</div>';
    if (s.ask) {
        if (!s.ans) {
            L.draw('기도실', head + '동행 신도가 당신 곁에 무릎을 꿇는다. 촛불에서 눈을 떼지 않고 묻는다.<br><br>“그분이 말을 하셨습니까.”',
                X.btn('“예.”', "WONDER.A.s2ans('y')") + X.btn('“아니요.”', "WONDER.A.s2ans('n')"));
            return;
        }
        let t = s.ans === 'y' ? '“서원이 깨졌군요.” 신도가 무릎을 편다. 복도 끝의 빛이 한 칸 다가온다.'
            : (s.lr ? X.rollHtml(s.lr) + (s.lr.ok ? '신도가 피고인의 젖은 입술을 본다. 아무 말도 하지 않는다. 복도 끝의 빛이 한 칸 다가온다.' : '신도는 고개를 끄덕인다. 촛불이 조용하다.') : '신도는 고개를 끄덕인다. 촛불이 조용하다.');
        L.draw('기도실', head + t, X.btn('계속 간다.', 'WONDER.A.s2go()'));
        return;
    }
    if (!s.res) {
        let x = q.turn === 0 ? L.txt(pg.p[0].x) : '그는 여전히 눈을 들지 않는다. 촛불이 한 번 흔들린다.';
        const os = (pg.p[0].o || []).map(function (o, j) { return X.btn(L.txt(o.l), 'WONDER.A.s2ask(' + j + ')'); }).join('');
        L.draw('기도실', head + x + s2sheet(q), os);
        return;
    }
    let t = '';
    if (s.res.speak) {
        const ps = L.paras(pg.p[1].x).filter(function (q2) { return !/^<i>/.test(q2) && !/^<b>/.test(q2); });
        t = ps.join('<br><br>') + '<br><br>“' + esc(s.res.word) + '”';
    } else if (s.res.r.ok) t = X.rollHtml(s.res.r) + ['그가 고개를 한 번 끄덕인다.', '그가 손가락을 편다. 천천히.', '촛불이 한 번 꺼졌다가 다시 켜진다.'][s.res.how] + '<br><br>진술서의 빈칸 하나가 채워진다 — 「' + esc(s.res.word) + '」';
    else t = X.rollHtml(s.res.r) + '그는 대답하지 않는다. 촛불만 흔들린다.' + (s.gt || '');
    L.draw('기도실', head + t + s2sheet(q), X.btn('계속 간다.', 'WONDER.A.s2after()'));
};
function s2sheet(q) {
    const p = L.plan();
    const w = S2_SENT[p.sent || 0];
    return '<div class="wd-note" style="border-color:#3a3220;">진술서 — ' + w.map(function (x, k) { return q.w[k] ? '<b>' + esc(q.w[k]) + '</b>' : '＿＿'; }).join(' ') + '</div>';
}
A.s2ask = function (j) {
    const s = st(), q = s2state();
    if (s.res) return;
    const p = L.plan();
    const word = S2_SENT[p.sent || 0][q.w.length];
    if (j === 3) {
        q.spoke++; q.light++;
        q.w.push(word);
        s.res = { speak: 1, word: word };
    } else {
        const r = L.roll();
        s.res = { r: r, how: j, word: word };
        if (r.ok) q.w.push(word); else s.gt = L.gimTime(false);
    }
    q.turn++;
    X.save(); X.view();
};
A.s2after = function () {
    const s = st(), q = s2state();
    if (q.light >= 3) return E('서원이 깨지다', 'f');
    if (q.turn === 1 || q.turn === 3 || q.turn === 5) { s.ask = 1; X.save(); return X.view(); }
    A.s2go();
};
A.s2ans = function (a) {
    const s = st(), q = s2state();
    s.ans = a;
    if (a === 'y') q.light++;
    else if (q.spoke > 0) { s.lr = X.roll(0); if (s.lr.ok) q.light++; }
    X.save(); X.view();
};
A.s2go = function () {
    const q = s2state();
    if (q.light >= 3) return E('서원이 깨지다', 'f');
    if (q.turn >= 5) return L.next(true);
    const f = F();
    f.lk.s = {};
    X.save(); X.view();
};
L.K.s2fin = function () {
    const q = s2state();
    const p = L.plan();
    const all = q.w.length >= 5;
    let b = '';
    if (all) b += X.btn('진술서에 한 줄을 써서 보여 준다.', "WONDER.A.s2end('w')");
    if (q.spoke === 0) b += X.btn('촛농이 흐른 명패를 지워 준다.', "WONDER.A.s2end('d')");
    b += X.btn('진술서를 접고 일어선다.', "WONDER.A.s2end('f')");
    L.draw('기도실', '다섯 번의 대화가 끝났다. 촛불이 짧아져 있다.' + s2sheet(q) + (all ? '<div class="wd-sys">「' + S2_SENT[p.sent || 0].join(' ') + '」</div>' : ''), b);
};
A.s2end = function (k) {
    if (k === 'w') return E('서면 진술', 'w');
    if (k === 'd') return E('지워진 이름', 'd');
    E('시간', 'f');
};

// ==========================================
// S3 내일의 죄
// ==========================================
function s3scenes() {
    const pg = scn('거울 앞의 방석').p[1];
    const ps = L.paras(pg.x);
    const out = [];
    ps.forEach(function (q) {
        const m = q.match(/^([①②③])\s*(.*?)\s*→\s*<i>강제 선택지 「([^」]+)」<\/i>/);
        if (m) out.push({ x: m[2], act: m[3] });
    });
    const k = ps.findIndex(function (q) { return /세 번째로 앉았을 때/.test(q); });
    return { list: out, third: k >= 0 ? ps[k + 1] : '' };
}
function s3st() { const lk = me(); lk.s3 = lk.s3 || { sits: 0, seen: [], done: 0, refused: 0 }; return lk.s3; }
L.K.s3mirror = function () {
    const s = st(), q = s3st();
    const p = L.plan();
    const pg = scn('거울 앞의 방석').p[0];
    const SC = s3scenes();
    if (s.third) { L.draw('거울 앞의 방석', SC.third, X.waitHtml('_none', '…')); return; }
    let x = L.txt(pg.x);
    if (q.sits > 0 && s.show != null) x = '<b>내일의 나</b><br><br>' + SC.list[s.show].x + '<div class="wd-sys">이 일은 이번 판에서 다시 나옵니다 — 「' + esc(SC.list[s.show].act) + '」</div>';
    L.draw('거울 앞의 방석', x + '<div class="wd-sys">앉은 횟수 ' + q.sits + ' / 3</div>',
        X.btn(q.sits ? '다시 앉는다.' : '앉는다.', 'WONDER.A.s3sit()') + X.btn(q.sits ? '일어나 지나간다.' : '앉지 않고 지나간다.', 'WONDER.lkNext()'));
};
A.s3sit = function () {
    const s = st(), q = s3st();
    const p = L.plan();
    q.sits++;
    if (q.sits >= 3) { s.third = 1; X.save(); X.view(); return setTimeout(function () { E('자기 자리를 잃다', 'f'); }, 1500); }
    const k = p.order[q.sits - 1];
    q.seen.push(k);
    s.show = k;
    X.save(); X.view();
};
L.K.s3force = function (step) {
    const s = st(), q = s3st();
    const SC = s3scenes();
    if (q.seen.length <= step.n) { L.goStep(F().lk.i + 1); return; }
    const sc = SC.list[q.seen[step.n]];
    if (!s.ans) {
        L.draw('—', '거울에서 본 그 자리다. 몸이 먼저 기억한다.<br><br>먼저 내려간 신도가 묻는다.<br><br>“그건 내일 일입니까, 어제 일입니까.”',
            X.btn('“내일 일.”', "WONDER.A.s3ans('t')") + X.btn('“어제 일.”', "WONDER.A.s3ans('y')"));
        return;
    }
    if (s.ans === 'y' && !s.fin) { s.fin = 'did'; q.done = 1; X.save(); }
    if (!s.fin) {
        L.draw('—', '손이 저절로 움직이려 한다. 「' + esc(sc.act) + '」',
            X.btn('「' + esc(sc.act) + '」', 'WONDER.A.s3do(1)') + X.btn('손을 거둔다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.A.s3do(0)'));
        return;
    }
    const t = s.fin === 'did' ? (s.r ? X.rollHtml(s.r) : '') + '당신은 거울 속에서 본 그대로 한다. 「' + esc(sc.act) + '」. 어디선가 사진기 소리 없는 빛이 한 번 터진다.'
        : X.rollHtml(s.r) + '손을 거둔다. 거울 속의 당신은 했던 일을, 당신은 하지 않는다.';
    L.draw('—', t, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
A.s3ans = function (a) { st().ans = a; X.save(); X.view(); };
A.s3do = function (k) {
    const s = st(), q = s3st();
    if (s.fin) return;
    if (k) { s.fin = 'did'; q.done = 1; }
    else { s.r = L.roll(); if (s.r.ok) { s.fin = 'no'; q.refused++; } else { s.fin = 'did'; q.done = 1; } }
    X.save(); X.view();
};
L.K.s3photo = function () {
    L.draw('액자 앞', '복도의 액자 앞이다. 둘째 줄 오른쪽에 당신이 있다. 오늘 입은 옷이다.<br><br>먼저 내려간 신도가 액자 옆에 비켜선다.',
        X.btn('사진 속 자리에 선다.', "WONDER.A.s3end(0)") + X.btn('액자를 떼어 사진을 찢는다.', "WONDER.A.s3end(1)") + X.btn('그대로 계단으로 간다.', "WONDER.A.s3end(2)"));
};
A.s3end = function (k) {
    const q = s3st();
    if (k === 0) return E('이미 저지른 죄', 'd');
    if (k === 1) return E('찢어진 사진', 'f');
    if (q.seen.length && !q.done) return E('일어나지 않은 죄', 'w');
    E('시간', 'f');
};

// ==========================================
// S4 방청권
// ==========================================
const S4_P = [
    { n: '무릎에 굳은살이 박인 사람', has: '무릎 자국이 남아 있다', none: '무릎 자국은 어느 의자에서도 찾지 못했다' },
    { n: '손끝에 양초 똥이 마른 사람', has: '떨어진 양초 똥이 굳어 있다', none: '떨어진 양초 똥은 어느 의자에서도 찾지 못했다' },
    { n: '소매 실밥이 풀린 사람', has: '방석에 수놓인 글자가 있다', none: '수놓인 글자는 어느 방석에서도 찾지 못했다' }
];
function s4hints(p) {
    return S4_P.map(function (x, k) { return k === p.holder ? x.none + '.' : '의자 하나에 ' + x.has + '. ' + x.n + '이 오래 앉았던 자리다.'; });
}
L.K.s4 = function (step) {
    const s = st(), lk = me();
    let x = '';
    if (step.n === 0 && !s.r) x = L.cond(scn('의자의 주인들').p[0].x, function (n) { return n === '단서를 모을수록'; }) + '<br><br>';
    x += L.ROOMS[L.plan().rooms[step.n]];
    if (!s.r) { L.draw('—', x + L.hintBox(), X.btn('의자를 살핀다. <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.A.s4look()')); return; }
    x = X.rollHtml(s.r) + (s.r.ok ? '의자 사이를 천천히 지난다.' + (s.h ? '<div class="wd-sys">흔적 — ' + s.h + '</div>' : '<div class="wd-sys">더 찾을 것이 없다.</div>') : '자국은 전부 비슷해 보인다.' + (s.gt || ''));
    L.draw('—', x + L.hintBox(), s4offer() + X.btn(step.n < 2 ? '다음 방으로 간다.' : '제단 앞으로 간다.', 'WONDER.lkNext()'));
};
function s4offer() {
    return S4_P.map(function (q, k) { return X.btn('사탕을 내민다 — ' + q.n + '에게', 'WONDER.A.s4give(' + k + ')'); }).join('');
}
A.s4look = function () {
    const s = st();
    s.r = L.roll('search');
    if (s.r.ok) s.h = L.hint(); else s.gt = L.gimTime(false);
    X.save(); X.view();
};
A.s4give = function (k) {
    const p = L.plan();
    if (k !== p.holder) return E('엉뚱한 사람', 'f');
    L.goStep(L.def().steps.findIndex(function (s) { return s.k === 's4deal'; }));
};
L.K.s4fin = function () {
    L.draw('제단 앞', '제단 문 앞까지 왔다. 세 사람은 여전히 같은 방향을 보고 무릎을 꿇고 있다. 사탕은 아직 봉투 안에 있다.' + L.hintBox(),
        s4offer() + X.btn('빈손으로 계단을 오른다.', "WONDER.A.s4out()"));
};
A.s4out = function () { E('시간', 'f'); };
L.K.s4deal = function () {
    const s = st();
    const p = L.plan();
    if (!s.traded) {
        L.draw('—', S4_P[p.holder].n + josa(S4_P[p.holder].n, '이', '가') + ' 고개를 든다. 당신 손의 금빛 봉투를 본다. 품에서 작고 두꺼운 종이를 꺼낸다. 「방청석 — 오늘 밤」.',
            X.btn('표를 사탕과 바꾼다.', 'WONDER.A.s4trade()') + X.btn('표를 그대로 두고 그를 위로 보낸다.', "WONDER.A.s4end('d')"));
        return;
    }
    L.draw('—', '표가 당신 손에 있다. 계단 위에서 박수 소리가 내려온다.',
        X.btn('표를 작은 악마에게 가져간다.', "WONDER.A.s4end('w')") + X.btn('표를 들고 방청석에 앉는다.', "WONDER.A.s4end('f')"));
};
A.s4trade = function () { st().traded = 1; X.save(); X.view(); };
A.s4end = function (k) {
    if (k === 'w') return E('되찾은 표', 'w');
    if (k === 'd') return E('올라간 관객', 'd');
    E('내려오지 못한 관객', 'f');
};

// ==========================================
// T1 배심원
// ==========================================
function t1vote(n) {
    return {
        k: 'team', id: 't1v' + n, title: '둘러선다',
        text: function () {
            const p = L.plan();
            return L.cond(scn('둘러선다').p[0].x, function (note) { return note === '바깥에 선 사람의 화면' && p.outside === ME(); })
                + L.hintBox() + '<div class="wd-sys">남은 지목 ' + (3 - n) + ' / 3</div>';
        },
        opts: function () {
            return memOpts('p:', function (nm) { return '지목한다 — ' + esc(nm); }, true)
                .concat(memOpts('d:', function (nm) { return '끌어들인다 — ' + esc(nm) + ' <span style="font-size:10px;color:#888;">(판정)</span>'; }, true).map(function (o) { o.roll = function () { return 0; }; return o; }))
                .concat([{ l: '다음 방으로 간다. <span style="font-size:10px;color:#888;">(지목 한 번을 씁니다)</span>', v: 'n' }]);
        },
        mineTxt: function (v) { v = val(v); return v === 'n' ? '「다음 방으로」' : (v.charAt(0) === 'p' ? '지목 — ' : '끌어들인다 — ') + esc(L.name(v.slice(2))); },
        resolve: function (m) {
            const p = L.plan();
            const t = L.tally(m);
            const w = t.win || 'n';
            if (w === 'p:' + p.outside) return { end: ['배심원석', 'w'] };
            if (w === 'd:' + p.outside) {
                const who = Object.keys(m).filter(function (c) { return val(m[c]) === w; }).sort()[0];
                if (m[who].ok) return { end: ['닫힌 원', 'd'] };
                if (n >= 2) return { end: ['어긋난 지목', 'f'] };
                return { html: esc(L.name(who)) + josa(L.name(who), '이', '가') + ' 손을 뻗는다. 반 발자국이 생각보다 멀다. 닿지 않는다.' };
            }
            if (n >= 2) return { end: ['어긋난 지목', 'f'] };
            if (w === 'n') return { html: '아무도 지목하지 않았다. 원을 그대로 둔 채 다음 방으로 간다.' };
            return { html: '지목된 ' + esc(L.name(w.slice(2))) + josa(L.name(w.slice(2)), '이', '가') + ' 한 발 물러난다. 원이 줄어든다. 그래도 반 발자국은 그대로다.' };
        }
    };
}
function t1hints(p) {
    const list = p.mem.slice();
    if (p.npc) list.push('npc');
    return list.filter(function (c) { return c !== p.outside; }).map(function (c) { return L.name(c) + josa(L.name(c), '은', '는') + ' 원 안쪽에 서 있다.'; });
}

// ==========================================
// T2 판결의 망치
// ==========================================
const T2_PATH = ['깃털이 붙은 쪽', '긁힌 자국이 난 쪽'];
const T2_DEC = { angel: '천사에게 돌려준다', devil: '검사에게 갖다준다', altar: '제단에 건다', light: '망치로 빛을 두드린다' };
function t2group(c) { const p = L.plan(); return p.groups[0].indexOf(c) >= 0 ? 0 : 1; }
function t2dec() {
    const p = L.plan();
    const m = L.votes('t2h');
    const t = L.tally(m);
    return t.win || val(m[p.holder]) || 'angel';
}
L.K.t2split = function () {
    const p = L.plan();
    const g = t2group(ME());
    const mates = p.groups[g].map(L.name).join(', ');
    L.draw('갈림길', L.txt(p0('갈림길').x) + '<div class="wd-sys">당신의 조 — ' + T2_PATH[g] + ' 길 (' + esc(mates) + ')' + (p.npc ? '<br>먼저 내려간 신도는 갈림길에 남습니다.' : '') + '</div>',
        X.btn(T2_PATH[g] + ' 길로 간다.', 'WONDER.lkNext()'));
};
L.K.t2path = function (step, i) {
    const p = L.plan();
    const g = t2group(ME());
    if (g === p.hammerG) {
        const m = L.votes('t2h');
        const who = p.groups[g].filter(function (c) { return X.actives().indexOf(c) >= 0; });
        const pg = p0('망치가 있는 방');
        if (m[ME()] == null) {
            const os = Object.keys(T2_DEC).map(function (k) { return X.btn(T2_DEC[k] + '.', "WONDER.A.t2h('" + k + "')"); }).join('');
            L.draw('망치가 있는 방', L.txt(pg.x) + '<div class="wd-sys">조끼리 몰래 정합니다. 합류할 때까지 다른 조는 모릅니다.</div>', os);
            return;
        }
        if (!who.every(function (c) { return m[c] != null; })) { L.draw('망치가 있는 방', L.txt(pg.x), L.waitList(m, who)); return; }
        L.draw('망치가 있는 방', '정했다 — 「' + T2_DEC[t2dec()] + '」.<br><br>망치는 ' + esc(L.name(p.holder)) + josa(L.name(p.holder), '이', '가') + ' 품에 넣는다.', X.btn('합류하러 간다.', 'WONDER.lkNext()'));
        return;
    }
    L.K.room({ n: 0 }, i);
};
A.t2h = function (k) { L.vote('t2h', k); };
function t2hints(p) {
    return ['금빛 가루가 ' + T2_PATH[p.hammerG] + ' 길에서 떨어져 내려왔다.', '망치 자루에는 이빨 자국이 두 개. 든 사람은 그것을 품에 넣었을 것이다.'];
}
function t2vote(n) {
    return {
        k: 'team', id: 't2v' + n, title: '합류',
        skip: function () { return n > 0 && !!L.x().t2hit; },
        text: function () { return (n === 0 ? '두 길이 다시 만난다. 서로의 얼굴을 본다. 누가 망치를 들었는지는 아무도 말하지 않는다.<br><br>' : '') + L.hintBox() + '<div class="wd-sys">「망치를 든 사람은?」 — ' + (n + 1) + ' / 3</div>'; },
        opts: function () { return memOpts('', function (nm) { return esc(nm); }, false); },
        mineTxt: function (v) { return esc(L.name(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const p = L.plan();
            const t = L.tally(m);
            if (t.win === p.holder) {
                L.tx('x/t2hit', function (cur) { return cur || 1; });
                return { html: '맞혔다. ' + esc(L.name(p.holder)) + josa(L.name(p.holder), '이', '가') + ' 품에서 망치를 꺼낸다.<br><br>결정은 「' + T2_DEC[t2dec()] + '」.<br><br>일행이 따를지, 바꿀지 정한다.' };
            }
            if (n >= 2) return t2exec(t2dec());
            return { html: (t.win ? esc(L.name(t.win)) + '의 손은 비어 있다.' : '표가 갈렸다.') + ' 망치는 아직 누군가의 품에 있다.' };
        }
    };
}
function t2exec(k) {
    if (k === 'angel') return { end: ['돌아온 판결', 'w'] };
    if (k === 'devil') return { end: ['끝나지 않는 휴정', 'w'] };
    if (k === 'altar') return { end: ['울리는 종', 'd'] };
    return { end: ['판결 없는 망치', 'f'] };
}
const T2_FINAL = {
    k: 'team', id: 't2f', title: '망치',
    text: function () { return '망치를 가운데 두고 둘러선다. 모두 같은 쪽을 골라야 한다.<div class="wd-sys">처음 결정 — 「' + T2_DEC[t2dec()] + '」</div>'; },
    opts: function () { return ['angel', 'devil', 'altar'].map(function (k) { return { l: T2_DEC[k] + '.', v: k }; }); },
    mineTxt: function (v) { return '「' + T2_DEC[val(v)] + '」'; },
    resolve: function (m) {
        const vs = Object.keys(m).map(function (c) { return val(m[c]); });
        if (vs.every(function (v) { return v === vs[0]; })) return t2exec(vs[0]);
        return { end: ['두 동강', 'f'] };
    }
};
// ==========================================
// T3 케이크의 행방
// ==========================================
const T3_O = { eat: '먹는다', pocket: '주머니에 넣는다', plate: '접시에 돌려놓는다', give: '신도에게 접시째 건넨다' };
function t3ate(c) { return [0, 1, 2].some(function (k) { return val(L.votes('t3p' + k)[c]) === 'eat'; }); }
function t3pick(n) {
    return {
        k: 'team', id: 't3p' + n, title: ['창고', '기도실', '제단 문 앞'][n],
        text: function () {
            const p = L.plan();
            let x = n === 0 ? L.txt(p0('창고').x)
                : n === 1 ? '기도실의 촛불 앞에서도 케이크는 그대로다. 손에, 주머니에, 혹은 접시 위에.'
                : L.txt(p0('제단 문 앞 — 마지막 선택').x);
            const ex = L.x().t3ex && L.x().t3ex[n];
            if (ex) {
                const v = val(L.votes('t3p' + n)[ex]);
                x += '<div class="wd-sys">' + esc(L.name(ex)) + josa(L.name(ex), '은', '는') + ' 모두 앞에서 고릅니다' + (v ? ' — 「' + T3_O[v] + '」' : '') + '</div>';
            }
            if (p.role[ME()] === '기록자') {
                const ate = p.mem.filter(t3ate);
                x += '<div class="wd-note" style="border-color:#3a3220;">기록자 — 입가에 생크림이 남은 사람: ' + (ate.length ? ate.map(L.name).map(esc).join(', ') : '없음') + '</div>';
            }
            if (t3ate(ME()) && n > 0) x += '<div class="wd-sys">당신은 이미 먹었습니다.</div>';
            return x + '<div class="wd-sys">몰래 고릅니다 · 마지막 선택이 답입니다</div>';
        },
        opts: function () {
            if (t3ate(ME())) return [{ l: '(이미 먹었다.)', v: 'eat' }];
            const ks = ['eat', 'pocket', 'plate'].concat(n === 2 ? ['give'] : []);
            return ks.map(function (k) { return { l: T3_O[k] + '.', v: k }; });
        },
        mineTxt: function (v) { return '「' + T3_O[val(v)] + '」'; },
        resolve: function (m) {
            if (n < 2) {
                const mine = val(m[ME()]);
                return { html: '모두 골랐다. 손이 저마다 다른 곳에 있다.' + (mine === 'eat' ? '<div class="wd-sys">케이크는 달다. 신도들이 길을 비켜 준다 — 다음 기믹은 판정 없이 지나갑니다.</div>' : mine === 'pocket' ? '<div class="wd-sys">주머니가 무겁다 — 다음 판정 −2.</div>' : '') };
            }
            const p = L.plan();
            const who = Object.keys(m);
            if (who.some(function (c) { return val(m[c]) === 'give'; })) return { end: ['다 바친 케이크', 'f'] };
            const ate = who.filter(t3ate).length;
            if (ate === who.length) return { end: ['증거 없음', 'd'] };
            if (ate === 0) return { end: ['재심', 'w'] };
            return { end: ['반쯤 먹은 케이크', 'f'] };
        }
    };
}
function t3vote(n) {
    return {
        k: 'team', id: 't3v' + n, title: '누가 먹었나',
        text: function () { return '신도들이 창고 문 앞에 반원으로 서서 기다린다. 일행이 서로의 입가를 본다.<div class="wd-sys">「누가 먹었나」 — 지목된 사람은 다음 선택을 모두 앞에서 합니다.</div>'; },
        opts: function () { return memOpts('', function (nm) { return esc(nm); }, false); },
        mineTxt: function (v) { return esc(L.name(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const t = L.tally(m);
            if (!t.win) return { html: '표가 갈렸다. 아무도 지목되지 않았다.' };
            L.tx('x/t3ex/' + (n + 1), function (cur) { return cur || t.win; });
            return { html: esc(L.name(t.win)) + josa(L.name(t.win), '이', '가') + ' 지목되었다. 다음 선택은 모두 앞에서 한다.' };
        }
    };
}
function t3room(n) {
    return {
        k: 'room', n: n,
        auto: function () { return val(L.votes('t3p' + n)[ME()]) === 'eat'; },
        bonus: function () { return val(L.votes('t3p' + n)[ME()]) === 'pocket' ? -2 : 0; }
    };
}

// ==========================================
// T4 초대받지 않은 손님
// ==========================================
const T4_C = ['걸음이 일정한 신도', '소매에 수실이 풀린 신도', '무릎이 깨끗한 신도'];
function t4hints(p) { return T4_C.filter(function (x, k) { return k !== p.guide; }).map(function (x) { return '안내자는 「' + x + '」' + josa(x, '이', '가') + ' 아니다.'; }); }
function t4vote(n) {
    return {
        k: 'team', id: 't4v' + n, title: '안내자는 누구인가',
        text: function () { return '신도들 사이에 안내자가 섞여 있다. 발소리를 내던 사람.' + L.hintBox() + (L.x().t4known ? '<div class="wd-sys">안내자를 알아보았습니다 — 붙잡기 판정 +5</div>' : '') + '<div class="wd-sys">「안내자는 누구인가」 — ' + (n + 1) + ' / 3</div>'; },
        opts: function () { return T4_C.map(function (x, k) { return { l: x, v: 'c' + k }; }); },
        mineTxt: function (v) { return T4_C[+val(v).slice(1)] + '에게 투표했습니다.'; },
        resolve: function (m) {
            const p = L.plan();
            const t = L.tally(m);
            if (t.win === 'c' + p.guide) { L.tx('x/t4known', function (cur) { return cur || 1; }); return { html: '「' + T4_C[p.guide] + '」' + josa(T4_C[p.guide], '이', '가') + ' 고개를 든다. 들켰다는 얼굴이 아니다. 기쁜 얼굴이다.<div class="wd-sys">붙잡기 판정 +5</div>' }; }
            return { html: t.win ? '「' + T4_C[+t.win.slice(1)] + '」' + josa(T4_C[+t.win.slice(1)], '은', '는') + ' 무릎을 꿇은 채 움직이지 않는다. 아니다.' : '표가 갈렸다.' };
        }
    };
}
const T4_O = { stay: '그대로 있는다', hide: '숨는다', follow: '따라간다' };
function t4room(n) {
    return {
        k: 'team', id: 't4r' + n, title: '안내문의 복도',
        text: function () { return L.cond(p0('안내문의 복도').x, function () { return false; }) + '<div class="wd-sys">몰래 고릅니다</div>'; },
        opts: function () {
            return [{ l: T4_O.stay + '.', v: 'stay' }, { l: T4_O.hide + '. <span style="font-size:10px;color:#888;">(붙잡기 판정)</span>', v: 'hide', roll: function () { return L.x().t4known ? 5 : 0; } }, { l: T4_O.follow + '.', v: 'follow' }];
        },
        mineTxt: function (v) { return '「' + T4_O[val(v)] + '」' + (v && v.n ? ' · 판정 ' + v.n : ''); },
        resolve: function (m) {
            const who = Object.keys(m);
            const stay = who.filter(function (c) { return val(m[c]) === 'stay'; });
            const hide = who.filter(function (c) { return val(m[c]) === 'hide'; });
            if (stay.length === who.length) return { end: ['초대받은 손님', 'd'] };
            if (stay.length) {
                if (hide.some(function (c) { return m[c].ok; })) return { end: ['증인 출석', 'w'] };
                return { end: ['혼자 모셔진 사람', 'f'] };
            }
            if (n >= 2) return { end: ['멈추지 않은 일행', 'f'] };
            return { html: '아무도 멈추지 않았다. 발소리는 뒤따라오기만 한다.' };
        }
    };
}

// ==========================================
// T5 등불 내기
// ==========================================
const T5_O = { keep: '지킨다 — 기름을 붓는다', shade: '가린다 — 바람을 막는다', off: '끈다' };
function t5gauge() {
    const x = L.x();
    let g = 10;
    for (let k = 0; k < 4; k++) if (x['t5g' + k] != null) g = x['t5g' + k];
    return g;
}
function gaugeBar(g) { return '<div class="wd-sys">등불 <span style="color:#d4af37;">' + '■'.repeat(Math.max(0, g)) + '</span>' + '□'.repeat(Math.max(0, 10 - g)) + ' ' + g + ' / 10</div>'; }
function t5room(n) {
    return {
        k: 'team', id: 't5p' + n, title: '복도',
        text: function () {
            const ex = (L.x().t5ex || {})[n];
            let x = (n === 0 ? L.txt(p0('복도').x) : '방을 나서기 전, 일행이 등불을 둘러싼다.') + (L.x()['t5f' + n] ? '<div class="wd-sys">기믹 실패 — 이번 방은 눈금이 하나 더 깎입니다.</div>' : '') + gaugeBar(t5gauge());
            if (ex) { const v = val(L.votes('t5p' + n)[ex]); x += '<div class="wd-sys">' + esc(L.name(ex)) + josa(L.name(ex), '은', '는') + ' 모두 앞에서 고릅니다' + (v ? ' — 「' + T5_O[v] + '」' : '') + '</div>'; }
            return x + '<div class="wd-sys">몰래 고릅니다</div>';
        },
        opts: function () {
            const p = L.plan();
            return [{ l: T5_O.keep + '. <span style="font-size:10px;color:#888;">(판정 · 성공 시 +' + (p.role[ME()] === '등불지기' ? 2 : 1) + ')</span>', v: 'keep', roll: function () { return 0; } },
                { l: T5_O.shade + '. <span style="font-size:10px;color:#888;">(두 명 이상이면 이번 방은 줄지 않음)</span>', v: 'shade' },
                { l: T5_O.off + '. <span style="font-size:10px;color:#888;">(−3)</span>', v: 'off' }];
        },
        mineTxt: function (v) { return '「' + T5_O[val(v)] + '」' + (v && v.n ? ' · 판정 ' + v.n : ''); },
        resolve: function (m) {
            const p = L.plan();
            const key = 't5g' + n;
            const x = L.x();
            if (x[key] == null) {
                const prev = n === 0 ? 10 : (x['t5g' + (n - 1)] != null ? x['t5g' + (n - 1)] : 10);
                const who = Object.keys(m);
                let d = who.filter(function (c) { return val(m[c]) === 'shade'; }).length >= 2 ? 0 : -1;
                if (x['t5f' + n]) d -= 1;   // 기믹 실패 — 시간 대신 눈금
                who.forEach(function (c) {
                    const v = val(m[c]);
                    if (v === 'keep' && m[c].ok) d += (p.role[c] === '등불지기' ? 2 : 1);
                    if (v === 'off') d -= 3;
                });
                const g = Math.max(0, Math.min(10, prev + d));
                L.tx('x/' + key, function (cur) { return cur == null ? g : cur; });
                return { wait: true };
            }
            const g = x[key];
            if (g <= 0) return { end: ['바뀐 계시', 'f'] };
            return { html: '방을 지난다. 등불이 흔들린다.' + gaugeBar(g) };
        }
    };
}
function t5hints(p) {
    const out = [];
    p.mem.forEach(function (c) {
        const off = [0, 1, 2, 3].some(function (k) { return val(L.votes('t5p' + k)[c]) === 'off'; });
        out.push(L.name(c) + (off ? '의 손끝에 그을음이 묻어 있다.' : '의 손끝은 깨끗하다.'));
    });
    return out;
}
function t5vote(n) {
    return {
        k: 'team', id: 't5v' + n, title: '누가 껐나',
        text: function () { return '등불이 한 번 크게 흔들렸다. 누군가 숨을 불었다.' + gaugeBar(t5gauge()) + L.hintBox() + '<div class="wd-sys">「누가 껐나」 — 맞히면 그 사람은 다음 방에서 모두 앞에서 고릅니다.</div>'; },
        opts: function () { return memOpts('', function (nm) { return esc(nm); }, false); },
        mineTxt: function (v) { return esc(L.name(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const t = L.tally(m);
            if (!t.win) return { html: '표가 갈렸다.' };
            const off = [0, 1, 2, 3].some(function (k) { return val(L.votes('t5p' + k)[t.win]) === 'off'; });
            if (off) { L.tx('x/t5ex/' + (n + 1), function (cur) { return cur || t.win; }); return { html: '맞혔다. ' + esc(L.name(t.win)) + '의 손끝에 그을음이 있다. 다음 방에서는 모두 앞에서 고른다.' }; }
            return { html: esc(L.name(t.win)) + '의 손끝은 깨끗하다.' };
        }
    };
}
const T5_RITE = {
    k: 'team', id: 't5r', title: '의식',
    text: function () { return L.txt(p0('의식 (마지막 방)').x) + gaugeBar(t5gauge()); },
    opts: function () { return [{ l: '받아들인다.', v: 'yes' }, { l: '거절하고 들고 올라간다.', v: 'no' }]; },
    mineTxt: function (v) { return val(v) === 'yes' ? '「받아들인다」' : '「거절한다」'; },
    resolve: function (m) {
        const who = Object.keys(m);
        const yes = who.filter(function (c) { return val(m[c]) === 'yes'; }).length;
        if (yes === who.length) return { end: ['맡긴 불', 'd'] };
        if (yes * 2 > who.length) return { end: ['반쪽 불', 'f'] };
        return t5gauge() >= 3 ? { end: ['꺼지지 않은 불', 'w'] } : { end: ['반쪽 불', 'f'] };
    }
};

// ==========================================
// T6 박수 갈채 — 시계 없이 여섯 마디
// ==========================================
const T6_W = ['본 법정은,', '문장에 대답하는 자에게', '박수를', '내릴 것을', '선고합니다.', '다음 피고인, ■■■—'];
const T6_SEQ = ['h0', 'm0', 'm1', 'h1', 'm2', 'm3', 'h2', 'm4', 'm5'];
function t6holder(upTo) {
    const p = L.plan();
    let h = p.mem[0];
    ['h0', 'h1', 'h2'].forEach(function (k, j) {
        if (j > upTo) return;
        const m = L.votes('t6' + k);
        const t = L.tally(m);
        if (t.win && Object.keys(m).length) h = t.win;
    });
    return h;
}
L.K.t6 = function (step, i) {
    const lk = me();
    lk.t6 = lk.t6 || 0;
    const k = T6_SEQ[lk.t6];
    const who = L.who();
    if (!k) return t6end();
    const m = L.votes('t6' + k);
    const all = who.every(function (c) { return m[c] != null; });
    const hi = k.charAt(0) === 'h' ? +k.slice(1) : (+k.slice(1) < 2 ? 0 : +k.slice(1) < 4 ? 1 : 2);
    const holder = t6holder(k.charAt(0) === 'h' ? hi - 1 : hi);
    const pg = p0('집회');
    let x = (lk.t6 === 0 ? L.cond(pg.x, function () { return false; }) + '<br><br>' : '');
    if (k.charAt(0) === 'm') {
        const n = +k.slice(1);
        x += '<div style="text-align:center; font-size:15px; color:#d4af37; margin:10px 0;">' + T6_W.slice(0, n + 1).map(function (w, j) { return j === n ? '<b>' + w + '</b>' : '<span style="color:#666;">' + w + '</span>'; }).join(' ') + '</div>'
            + '<div class="wd-sys">' + (n + 1) + ' / 6 마디 · 나팔 — ' + esc(L.name(holder)) + '</div>';
        if (holder === ME()) x += L.cond(pg.x, function (nt) { return nt === '나팔을 든 사람의 화면'; }).split('<br><br>').slice(-1)[0] + '<div class="wd-sys">나팔을 든 사람은 따라 말하면 안 됩니다.</div>';
    } else {
        x += '<div class="wd-sys">나팔 건네기 — ' + (hi + 1) + ' / 3' + (hi ? ' · 지금 든 사람: ' + esc(L.name(holder)) : '') + '</div>';
    }
    if (all) {
        lk.t6++;
        X.save();
        return X.view();
    }
    if (m[ME()] == null) {
        const os = k.charAt(0) === 'h'
            ? memOpts('', function (nm) { return '나팔을 건넨다 — ' + esc(nm); }, false).map(function (o, j) { return X.btn(o.l, "WONDER.A.t6('" + k + "','" + o.v + "')"); }).join('')
            : X.btn('따라 말한다.', "WONDER.A.t6('" + k + "','say')") + X.btn('입을 다문다.', "WONDER.A.t6('" + k + "','mute')");
        L.draw('집회', x, os);
        return;
    }
    L.draw('집회', x, L.waitList(m, who));
};
A.t6 = function (k, v) { if (L.votes('t6' + k)[ME()] == null) L.vote('t6' + k, v); };
function t6end() {
    const p = L.plan();
    const who = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; });
    let div = 0, any = 0;
    let six = [];
    for (let n = 0; n < 6; n++) {
        const m = L.votes('t6m' + n);
        const holder = t6holder(n < 2 ? 0 : n < 4 ? 1 : 2);
        const non = who.filter(function (c) { return c !== holder; }).map(function (c) { return val(m[c]); });
        if (non.some(function (v) { return v !== non[0]; }) || val(m[holder]) === 'say') div++;
        if (who.some(function (c) { return val(m[c]) === 'say'; })) any = 1;
        if (n === 5) six = who.filter(function (c) { return val(m[c]) === 'say'; });
    }
    const passed = t6holder(1) !== t6holder(0) || t6holder(2) !== t6holder(1);
    let end;
    if (six.length === 1) end = ['혼자만의 대답', 'f'];
    else if (div >= 2) end = ['어긋난 박자', 'f'];
    else if (!any && passed) end = ['대답 없는 박수', 'd'];
    else if (div === 0 && !six.length && any) end = ['같은 박자', 'w'];
    else end = ['어긋난 박자', 'f'];
    E(end[0], end[1]);
    L.draw('집회', '여섯째 마디가 지나간다.', X.waitHtml('_none', '…'));
}

// ==========================================
// T7 빈 명패 여섯
// ==========================================
const T7_O = { own: '제 이름을 새긴다', peer: '동료의 이름을 새긴다', tale: '동화 속 인물의 이름을 새긴다', blank: '비워 둔다' };
function t7carvers(n) { const p = L.plan(); return (p.carvers[n] || []).filter(function (c) { return X.actives().indexOf(c) >= 0; }); }
function t7plaques() {
    const p = L.plan();
    const reset = L.x().t7reset || {};
    const out = [];
    for (let n = 0; n < 3; n++) {
        const m = L.votes('t7c' + n);
        (p.carvers[n] || []).forEach(function (c, j) {
            const id = n * 2 + j;
            let v = val(m[c]) || 'blank';
            if (reset[id]) v = 'blank';
            const named = v === 'own' ? c : v === 'peer' ? p.mem[(p.mem.indexOf(c) + 1) % p.mem.length] : null;
            out.push({ id: id, by: c, v: v, named: named });
        });
    }
    return out;
}
function t7carve(n) {
    return {
        k: 'team', id: 't7c' + n, title: '명패 앞',
        who: function () { return t7carvers(n); },
        text: function () {
            const cs = t7carvers(n);
            const mine = cs.indexOf(ME()) >= 0;
            return (mine ? L.txt(p0('명패 앞').x) + '<div class="wd-sys">명패 두 개가 열렸습니다. 당신이 하나를 새깁니다. 무엇을 새겼는지는 여섯 개가 다 차기 전까지 보이지 않습니다.</div>'
                    : '명패 두 개가 열렸다. ' + cs.map(L.name).map(esc).join(' · ') + josa(L.name(cs[cs.length - 1] || ''), '이', '가') + ' 끌을 든다. 끌 소리가 난다.');
        },
        opts: function () {
            const p = L.plan();
            const peer = p.mem[(p.mem.indexOf(ME()) + 1) % p.mem.length];
            return Object.keys(T7_O).map(function (k) { return { l: T7_O[k] + (k === 'peer' ? ' — ' + esc(L.name(peer)) : '') + '.', v: k }; });
        },
        mineTxt: function (v) { return '「' + T7_O[val(v)] + '」'; },
        resolve: function () { return { html: '명패 ' + ((n + 1) * 2) + ' / 6 이 찼다. 무엇이 새겨졌는지는 아직 보이지 않는다.' }; }
    };
}
function t7hints(p) {
    const out = [];
    for (let n = 0; n < 3; n++) {
        const m = L.votes('t7c' + n);
        (p.carvers[n] || []).forEach(function (c) {
            const v = val(m[c]);
            if (!v) return;
            out.push(L.name(c) + (v === 'blank' ? '의 끌은 깨끗하다.' : '의 끌에는 나무 부스러기가 묻어 있다.'));
        });
    }
    return out;
}
function t7vote(n) {
    return {
        k: 'team', id: 't7v' + n, title: '누가 무엇을 새겼나',
        text: function () { return '명패 아래에서 서로의 끌을 본다.' + L.hintBox() + '<div class="wd-sys">「누가 이름을 새겼나」 — 맞히면 그 명패 하나를 갈아 엎습니다 (빈칸으로).</div>'; },
        opts: function () { return memOpts('', function (nm) { return esc(nm); }, false); },
        mineTxt: function (v) { return esc(L.name(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const t = L.tally(m);
            if (!t.win) return { html: '표가 갈렸다.' };
            const hit = t7plaques().filter(function (q) { return q.by === t.win && (q.v === 'own' || q.v === 'peer'); })[0];
            if (hit) { L.tx('x/t7reset/' + hit.id, function (cur) { return cur || 1; }); return { html: '맞혔다. ' + esc(L.name(t.win)) + josa(L.name(t.win), '이', '가') + ' 새긴 명패 하나를 갈아 엎는다. 빈칸으로 돌아간다.' }; }
            return { html: esc(L.name(t.win)) + josa(L.name(t.win), '은', '는') + ' 이름을 새기지 않았다.' };
        }
    };
}
L.K.t7end = function () {
    const qs = t7plaques();
    const named = qs.filter(function (q) { return q.named; });
    let end;
    if (named.length) end = ['불린 이름', 'f', { named: named.map(function (q) { return q.named; }) }];
    else if (qs.every(function (q) { return q.v === 'tale'; })) end = ['엉뚱한 피고인들', 'w'];
    else if (qs.every(function (q) { return q.v === 'blank'; })) end = ['빈 명패 여섯', 'd'];
    else end = ['반쯤 찬 명패', 'f'];
    E(end[0], end[1], end[2]);
    L.draw('명패 앞', '여섯 번째 명패가 찬다.', X.waitHtml('_none', '…'));
};

// ==========================================
// T8 봉인이냐 파괴냐
// ==========================================
const T8_O = { seal: '봉인한다', break: '파괴한다', follow: '따라 올라간다' };
function t8vote(n) {
    return {
        k: 'team', id: 't8v' + n, title: '마지막 방',
        text: function () {
            const wins = t8wins(n);
            return (n === 0 ? L.txt(p0('마지막 방').x) + '<br><br>' : '') + '<div class="wd-sys">투표 ' + (n + 1) + ' / 3 — 두 번 모인 쪽이 실행됩니다' + (Object.keys(wins).length ? '<br>' + Object.keys(wins).map(function (k) { return T8_O[k] + ' ' + wins[k]; }).join(' · ') : '') + (L.x().t8miss ? '<br>봉인 재료가 하나 모자랍니다 — 봉인 판정 −3' : '') + '</div>';
        },
        opts: function () { return Object.keys(T8_O).map(function (k) { return { l: T8_O[k] + '.', v: k }; }); },
        mineTxt: function (v) { return '「' + T8_O[val(v)] + '」'; },
        resolve: function () {
            const wins = t8wins(n + 1);
            const top = Object.keys(wins).filter(function (k) { return wins[k] >= 2; })[0];
            if (top === 'break') return { end: ['무너진 빛', 'w'] };
            if (top === 'follow') return { end: ['구경꾼', 'd', { follow: 1 }] };
            if (top === 'seal') {
                const x = L.x();
                if (x.t8seal == null) { const r = X.roll(x.t8miss ? -3 : 0); L.tx('x/t8seal', function (cur) { return cur == null ? (r.ok ? 1 : 0) : cur; }); return { wait: true }; }
                return x.t8seal ? { end: ['닫힌 빛', 'w'] } : { end: ['갈린 투표', 'f'] };
            }
            if (n >= 2) return { end: ['갈린 투표', 'f'] };
            const t = L.tally(L.votes('t8v' + n));
            return { html: t.win ? '「' + T8_O[t.win] + '」 쪽에 표가 모였다.' : '표가 갈렸다. 위에서 두 목소리가 더 크게 다툰다.' };
        }
    };
}
function t8wins(upto) {
    const w = {};
    for (let k = 0; k < upto; k++) {
        const m = L.votes('t8v' + k);
        if (!Object.keys(m).length) continue;
        const t = L.tally(m);
        if (t.win) w[t.win] = (w[t.win] || 0) + 1;
    }
    return w;
}

// ==========================================
// 사람마다 갈리는 결말
// ==========================================
//   T5 바뀐 계시 — 마지막에 등불을 든 사람(파티장)만 판정, 실패 시 끌려감(죽음)
//   T7 불린 이름 — 이름이 불린 사람 판정, 실패 시 끌려감(죽음)
//   T8 구경꾼 — 각자 판정, 실패한 사람은 계단 아래에 남는다(실패 귀환, 죽지 않음)
function dragDie(e, why) {
    if (e.r == null) { const r = X.roll(0); e.r = { ok: r.ok, total: r.total, raw: r.raw, bonus: 0 }; }
    if (e.r.ok) return { html: X.rollHtml(e.r) + why + ' 발이 제단 문 앞에서 멈춘다. 당신은 계단으로 돌아선다.' };
    return { die: X.rollHtml(e.r) + why + ' 한 걸음. 또 한 걸음. 제단 문이 열린다.<br><br>(끌려감)' };
}

// ==========================================
// 미션 표
// ==========================================
L.M.angel = {
    S1: M(18, {
        plan: function (p, rnd) { p.fork = rnd() < 0.5 ? '기도실' : '좁은 통로'; roomsPlan(p, rnd); },
        hints: function (p) { return [p.fork === '기도실' ? '기도실 쪽에서 은빛이 한 번 반짝였다.' : '좁은 통로의 색종이 더미 한쪽만 흐트러져 있다.', '천장의 금은 포크 하나가 빠져나올 만한 크기다.']; },
        steps: COMMON.concat([{ k: 'room', n: 0 }, { k: 's1', room: '창고' }, { k: 's1', room: '기도실' }, { k: 's1', room: '좁은 통로' }, { k: 's1alt' }])
    }),
    S2: M(26, {
        plan: function (p, rnd) { p.sent = Math.floor(rnd() * S2_SENT.length); roomsPlan(p, rnd); },
        steps: COMMON.concat([{ k: 'room', n: 0 }, { k: 'room', n: 1 }, { k: 's2' }, { k: 's2fin' }])
    }),
    S3: M(31, {
        plan: function (p, rnd) { p.order = shuf([0, 1, 2], rnd); roomsPlan(p, rnd); },
        steps: COMMON.concat([{ k: 'room', n: 0 }, { k: 's3mirror' }, { k: 'room', n: 1 }, { k: 's3force', n: 0 }, { k: 'room', n: 2 }, { k: 's3force', n: 1 }, { k: 's3photo' }])
    }),
    S4: M(36, {
        plan: function (p, rnd) { p.holder = Math.floor(rnd() * 3); roomsPlan(p, rnd); },
        hints: s4hints,
        steps: COMMON.concat([{ k: 's4', n: 0 }, { k: 's4', n: 1 }, { k: 's4', n: 2 }, { k: 's4fin' }, { k: 's4deal' }])
    }),
    T1: M(41, {
        timeEnd: '닫히지 않은 원',
        plan: function (p, rnd) { const c = p.mem.concat(p.npc ? ['npc'] : []); p.outside = c[Math.floor(rnd() * c.length)]; roomsPlan(p, rnd); },
        hints: t1hints,
        steps: COMMON.concat([{ k: 'room', n: 0 }, t1vote(0), { k: 'room', n: 1 }, t1vote(1), { k: 'room', n: 2 }, t1vote(2)])
    }),
    T2: M(46, {
        plan: function (p, rnd) {
            const s = shuf(p.mem, rnd);
            p.groups = [[], []];
            s.forEach(function (c, k) { p.groups[k % 2].push(c); });
            p.groups.forEach(function (g) { g.sort(); });
            p.hammerG = rnd() < 0.5 ? 0 : 1;
            p.holder = p.groups[p.hammerG][0];
            roomsPlan(p, rnd);
        },
        hints: t2hints,
        steps: COMMON.concat([{ k: 't2split' }, { k: 't2path' }, t2vote(0), t2vote(1), t2vote(2), T2_FINAL])
    }),
    T3: M(52, {
        plan: roomsPlan,
        steps: COMMON.concat([t3pick(0), t3vote(0), t3room(0), t3pick(1), t3vote(1), t3room(1), t3pick(2)])
    }),
    T4: M(58, {
        timeEnd: '멈추지 않은 일행',
        plan: function (p, rnd) { p.guide = Math.floor(rnd() * 3); roomsPlan(p, rnd); },
        hints: t4hints,
        steps: COMMON.concat([{ k: 'room', n: 0 }, t4vote(0), t4room(0), { k: 'room', n: 1 }, t4vote(1), t4room(1), { k: 'room', n: 2 }, t4vote(2), t4room(2)])
    }),
    T5: M(63, {
        plan: roomsPlan,
        hints: t5hints,
        steps: COMMON.concat([
            { k: 'room', n: 0, timeless: true, onRoll: t5gimFail(0) }, t5room(0), t5vote(0),
            { k: 'room', n: 1, timeless: true, onRoll: t5gimFail(1) }, t5room(1), t5vote(1),
            { k: 'room', n: 2, timeless: true, onRoll: t5gimFail(2) }, t5room(2), t5vote(2),
            t5room(3), T5_RITE]),
        endMine: function (end, e) {
            if (end.t !== '바뀐 계시') return null;
            if (X.leader() !== ME()) return null;
            return dragDie(e, '등불을 든 손이 무겁다. 복도의 문장이 당신을 부른다.');
        }
    }),
    T6: M(69, { timer: false, plan: function () { }, steps: COMMON.concat([{ k: 't6' }]) }),
    T7: M(74, {
        plan: function (p, rnd) {
            p.carvers = [0, 1, 2].map(function () { return p.mem.length <= 2 ? p.mem.slice() : shuf(p.mem, rnd).slice(0, 2); });
            roomsPlan(p, rnd);
        },
        hints: t7hints,
        steps: COMMON.concat([{ k: 'room', n: 0 }, t7carve(0), t7vote(0), { k: 'room', n: 1 }, t7carve(1), t7vote(1), { k: 'room', n: 2 }, t7carve(2), t7vote(2), { k: 't7end' }]),
        endMine: function (end, e) {
            if (end.t !== '불린 이름' || (end.named || []).indexOf(ME()) < 0) return null;
            return dragDie(e, '복도가 당신의 이름을 부른다. 수십 명이 한목소리로.');
        }
    }),
    T8: M(79, {
        timeEnd: '갈린 투표',
        plan: roomsPlan,
        steps: COMMON.concat([
            { k: 'room', n: 0, pre: function () { return '<br><br>짐을 다시 센다. 흰 초, 마른 잎, 금속 못, 소금 주머니, 봉인 끌. 하나라도 떨어뜨리면 봉인이 모자란다.'; }, onRoll: function (s, r) { if (!r.ok) L.pub('x/t8miss', true); } },
            { k: 'room', n: 1 },
            t8vote(0), t8vote(1), t8vote(2)]),
        endMine: function (end, e) {
            if (end.t !== '구경꾼') return null;
            if (e.r == null) { const r = X.roll(0); e.r = { ok: r.ok, total: r.total, raw: r.raw, bonus: 0 }; }
            if (e.r.ok) return { r: 'd', html: '<br><br>' + X.rollHtml(e.r) };
            return { r: 'f', html: '<br><br>' + X.rollHtml(e.r) + '손이 빛에서 미끄러진다. 신도들이 먼저 올라가고, 당신은 계단 아래에 남는다.' };
        }
    })
};
function t5gimFail(n) { return function (s, r) { if (!r.ok) L.pub('x/t5f' + n, true); }; }

// 챕터에 건다
X.chapters.angel.link = function (api, mid) { L.run('angel', mid); };

console.log('[이상한 나라] 빛을 찾아서 연계판 12종 연결');
})();
