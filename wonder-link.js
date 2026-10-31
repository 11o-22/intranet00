// ==========================================
// ★ 「이상한 나라의 ■■■」 — 연계판 도구 (모든 챕터 공용)
// bundles.json 마지막 묶음 — wonder-core.js 다음
// ==========================================
//
//   연계판은 미션마다 다시 쓴 「짧은 어둠」이다. 챕터 파일이 미션을 걸음 목록으로 적고,
//   여기서 걷고 · 기다리고 · 몰래 고르고 · 투표하고 · 시계를 재고 · 결말을 보여 준다.
//
//   함께 보는 곳   wonder/{방}/lk/{회차_챕터}/  { plan, t0, tb, c:{몰래 고른 것}, v:{투표}, x:{미션 상태}, end }
//   내 화면        F.lk = { rk, i(걸음), hints[], used{}, ... }
//
//   결말은 「결말」 장면에서 제목으로 찾아 보여 주고, 공통 「귀환」 장면을 이어 붙인 뒤
//   X.finish(결과) 로 챕터를 끝낸다.

(function wonderLink() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const L = X.L = {};
const TIME = 15 * 60 * 1000;
const T_OK = 25000, T_BAD = -30000;

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
L.esc = esc;
L.rk = function () { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); };
L.st = function () { return ((S().lk || {})[L.rk()]) || {}; };
L.plan = function () { return L.st().plan || null; };
L.x = function () { return L.st().x || {}; };
L.pub = function (path, v) { return X.pub('lk/' + L.rk() + '/' + path, v); };
L.tx = function (path, fn) { return X.tx('lk/' + L.rk() + '/' + path, fn); };
L.me = function () { const f = F(); return f && f.lk; };
L.team = function () { return X.isTeam(); };
L.name = function (c) { return c === 'npc' ? '먼저 내려간 신도' : X.nameOf(c); };

// 미션 등록 — L.M[챕터][미션] = { steps:[…], end: 결말 장면 찾기, timeEnd: 시간 초과 결말 제목, timer:true, plan(p, rnd) }
L.M = {};
// 걸음 종류 — L.K[종류](걸음, 걸음 번호)
L.K = {};

// ==========================================
// 시작
// ==========================================
L.run = function (ch, mid) {
    const f = F();
    if (!f.lk || f.lk.rk !== L.rk()) {
        f.lk = { rk: L.rk(), ch: ch, mid: mid, i: 0, hints: [], used: {} };
        X.save();
    }
    X.go({ id: 'lk' });
};
function def() { const f = F(); return f && f.lk && L.M[f.lk.ch] && L.M[f.lk.ch][f.lk.mid]; }
L.def = def;

function makePlan() {
    const d = def();
    const mem = X.actives().slice().sort();
    const rnd = X.srand(L.rk() + ':' + F().lk.mid + ':plan:' + Date.now());
    const p = { mem: mem, npc: mem.length <= 2, cult: null, role: {} };
    if (mem.length >= 3) p.cult = mem[Math.floor(rnd() * mem.length)];
    const roles = X.shuffle(['기록자', '등불지기', '감시자', '문지기'], rnd);
    let k = 0;
    mem.forEach(function (c) { if (c !== p.cult) p.role[c] = roles[(k++) % 4]; });
    if (d && d.plan) d.plan(p, rnd);
    return p;
}
X.VIEW.lk = function () {
    const f = F();
    const d = def();
    if (!d) { X.draw('—', '(연계판을 찾지 못했습니다)', X.btn('홀로 돌아간다.', "WONDER.finish('f')")); return; }
    const st = L.st();
    if (!st.plan) {
        if (X.leader() === ME() || !L.team()) {
            const p = makePlan();
            L.tx('plan', function (cur) { return cur || p; });
            L.tx('t0', function (cur) { return cur || Date.now(); });
        }
        X.draw('—', '', X.waitHtml('_none', '계단을 내려가는 중입니다…'));
        return;
    }
    if (!f.lk.init) {
        f.lk.init = 1;
        if (st.plan.role[ME()] === '기록자') L.hint();
        X.save();
    }
    if (st.end) return renderEnd(st.end);
    if (d.timer !== false && L.left() <= 0) { L.end(d.timeEnd || '시간', 'f'); return; }
    const step = d.steps[f.lk.i];
    if (!step) { X.draw('—', '', X.waitHtml('_none', '…')); return; }
    if (f.lk.wait) {
        if (X.gateDone(f.lk.wait)) { f.lk.wait = null; f.lk.i++; f.lk.s = {}; X.save(); return X.view(); }
        L.draw('—', f.lk.waitText || '', X.waitHtml(f.lk.wait));
        return;
    }
    f.lk.s = f.lk.s || {};
    L.K[step.k](step, f.lk.i);
};
X.LIVE.lk = 1;

// 다음 걸음 — 팀이면 모두 넘길 때까지 기다린다 (solo:true 면 혼자)
L.next = function (solo, waitText) {
    const f = F();
    if (!L.team() || solo) { f.lk.i++; f.lk.s = {}; X.save(); return X.view(); }
    const key = 'lk_' + L.rk() + '_' + f.lk.i;
    X.gatePress(key);
    f.lk.wait = key;
    f.lk.waitText = waitText || '';
    X.save(); X.view();
};
L.goStep = function (i) { const f = F(); f.lk.i = i; f.lk.s = {}; f.lk.wait = null; X.save(); X.view(); };
X.lkNext = function () { L.next(); };

// ==========================================
// 시계
// ==========================================
L.left = function () {
    const st = L.st();
    if (!st.t0) return TIME;
    return TIME + (st.tb || 0) - (Date.now() - st.t0);
};
L.addTime = function (ms) { L.tx('tb', function (cur) { return (cur || 0) + ms; }); };
function clockTxt() {
    const ms = Math.max(0, L.left());
    const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}
setInterval(function () {
    try {
        if (!X.on() || !F() || !F().sc || F().sc.id !== 'lk') return;
        const el = document.getElementById('wd-clock');
        if (el) el.textContent = clockTxt();
        const d = def();
        if (d && d.timer !== false && L.left() <= 0 && !L.st().end) X.view();
    } catch (e) { }
}, 1000);

// ==========================================
// 위쪽 띠 — 시계 · 자리 · 흔적 · 쓸 수 있는 물건
// ==========================================
L.bar = function () {
    const d = def() || {};
    const p = L.plan() || { role: {} };
    const me = L.me() || {};
    const role = p.cult === ME() ? '<b style="color:#ff6b6b;">신도</b>' : (p.role[ME()] ? esc(p.role[ME()]) : '');
    let h = '<div class="wd-bar" style="border-color:#3a3220;">'
        + (d.timer !== false ? '<span>⏳ <b id="wd-clock">' + clockTxt() + '</b></span>' : '')
        + (role ? '<span>' + role + '</span>' : '')
        + ((me.hints || []).length ? '<span>흔적 <b>' + me.hints.length + '</b></span>' : '')
        + '</div>';
    const items = [];
    if (d.timer !== false && X.has && X.has('휴정 종') && !(me.used || {})['휴정 종']) items.push(X.btn('🔔 휴정 종을 흔든다. <span style="font-size:10px;color:#d4af37;">(제한 시간 +2분)</span>', 'WONDER.L.bell()'));
    if (X.has && X.has('증인 명찰') && !(me.used || {})['증인 명찰'] && d.hints) items.push(X.btn('🏷 증인 명찰을 단다. <span style="font-size:10px;color:#d4af37;">(흔적 하나 더)</span>', 'WONDER.L.badge()'));
    return h + items.join('');
};
L.bell = function () {
    const me = L.me();
    if (me.used['휴정 종'] || !X.spend('휴정 종')) return;
    me.used['휴정 종'] = 1;
    L.addTime(120000);
    try { showDarkToast('🔔 휴정 — +2분'); } catch (e) { }
    X.save(); X.view();
};
L.badge = function () {
    const me = L.me();
    if (me.used['증인 명찰'] || !X.spend('증인 명찰')) return;
    me.used['증인 명찰'] = 1;
    L.hint();
    X.save(); X.view();
};
// 흔적 — 미션의 hints(p) 가 돌려준 목록에서 아직 못 본 것 하나
L.hint = function () {
    const d = def();
    const me = L.me();
    if (!d || !d.hints || !me) return null;
    const pool = d.hints(L.plan() || {}, ME()) || [];
    const left = pool.filter(function (h) { return me.hints.indexOf(h) < 0; });
    if (!left.length) return null;
    const h = left[Math.floor(Math.random() * left.length)];
    me.hints.push(h);
    X.save();
    return h;
};
L.hintBox = function () {
    const me = L.me() || {};
    if (!(me.hints || []).length) return '';
    return '<div class="wd-note" style="border-color:#3a3220;"><b style="color:#d4af37;">흔적</b><br>' + me.hints.map(function (h) { return '· ' + h; }).join('<br>') + '</div>';
};

L.draw = function (title, text, extra) { X.draw(title, L.bar() + (text || ''), extra || ''); };

// ==========================================
// 판정 — 장비 없이. kind: 'search'(살핀다 · 뒤진다 — 감시자 +2)
// ==========================================
L.roll = function (kind, extra) {
    let b = extra || 0;
    const p = L.plan() || { role: {} };
    if (kind === 'search' && p.role[ME()] === '감시자') b += 2;
    return X.roll(b);
};
// 기믹에서 시간 — 등불지기는 성공 시 두 배, 문지기는 첫 실패 무손실, 구름 방석은 실패 한 번 무손실
L.gimTime = function (ok) {
    const me = L.me();
    const p = L.plan() || { role: {} };
    if (ok) { L.addTime(p.role[ME()] === '등불지기' ? T_OK * 2 : T_OK); return ''; }
    if (p.role[ME()] === '문지기' && !me.used._gate) { me.used._gate = 1; X.save(); return '<div class="wd-sys">문지기 — 이번 실패는 시간이 깎이지 않습니다.</div>'; }
    if (X.has && X.has('구름 방석') && X.spend('구름 방석')) return '<div class="wd-sys">☁ 구름 방석 — 이번 실패는 시간이 깎이지 않습니다.</div>';
    L.addTime(T_BAD);
    return '<div class="wd-sys" style="color:#f44336;">시간 −30초</div>';
};

// ==========================================
// 몰래 고르기 · 투표
// ==========================================
L.pick = function (key, val) { return L.pub('c/' + key + '/' + ME(), val); };
L.picks = function (key) { return ((L.st().c || {})[key]) || {}; };
L.who = function () { return X.actives(); };
L.allPicked = function (key, who) {
    const m = L.picks(key);
    return (who || L.who()).every(function (c) { return m[c] != null; });
};
L.vote = function (key, val) { return L.pub('v/' + key + '/' + ME(), val); };
L.votes = function (key) { return ((L.st().v || {})[key]) || {}; };
// 가장 많이 받은 것 하나 (동률이면 null)
L.tally = function (m) {
    const t = {};
    Object.keys(m).forEach(function (c) { const v = (typeof m[c] === 'object' && m[c]) ? m[c].v : m[c]; t[v] = (t[v] || 0) + 1; });
    let best = null, n = 0, tie = false;
    Object.keys(t).forEach(function (k) { if (t[k] > n) { best = k; n = t[k]; tie = false; } else if (t[k] === n) tie = true; });
    return { win: tie ? null : best, t: t };
};
L.waitList = function (m, who) {
    return '<div class="wd-wait">' + (who || L.who()).map(function (c) { return (m[c] != null ? '✔ ' : '… ') + esc(L.name(c)); }).join(' · ') + '</div>';
};

// ==========================================
// 지문 — 원고 장면 찾기 · 문단 고르기
// ==========================================
//   base: 미션 머리 장면 번호 (「연계판 S1 — …」). 그 뒤에서 제목으로 찾는다.
L.sub = function (key, base, name) {
    const arr = (window.WONDER_MD || {})[key] || [];
    for (let i = base + 1; i < arr.length; i++) {
        if (/^연계판 /.test(arr[i].h)) break;
        if (arr[i].h.indexOf(name) === 0) return arr[i];
    }
    return null;
};
L.paras = function (x) { return String(x || '').split('<br><br>'); };
// 메모 괄호가 달린 문단은 show(메모) 가 참일 때만 — 메모는 지운다
L.cond = function (x, show) {
    return L.paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || (show && show(m[1]));
    }).map(function (p) {
        return p.replace(/<i>\([^)]*\)<\/i>\s*/g, '').replace(/\s*\(→[^)]*\)/g, '');
    }).join('<br><br>');
};
L.txt = function (x) { return X.clip(x); };

// ==========================================
// 공용 걸음
// ==========================================
//   enter  — 진입 (공통): 혼자 · 둘 / 셋 이상 문단, 신도에게는 계시 과업
//   reveal — 미션의 「계시」: 셋 이상 문단은 신도에게만 (과업 창으로)
//   rules  — 「이번 판 규칙」
//   room   — 복도의 방: 지문 하나 + 기믹 하나 (개인 판정)
L.K.enter = function (step) {
    const d = def();
    const p = L.plan();
    const sc = X.scene(d.key, d.enterIdx);
    const many = p.mem.length >= 3;
    let x = L.paras(sc.p[0].x).filter(function (q) {
        if (/^<i>\(혼자 · 둘\)/.test(q)) return !many;
        if (/^<i>\(셋 이상\)/.test(q)) return many;
        return true;
    }).map(function (q) { return q.replace(/<i>\([^)]*\)<\/i>\s*/g, ''); });
    // 혼자 · 둘 다음 문단(「저도 무죄였습니다」)은 혼자 · 둘일 때만 — 원고에서 바로 뒤에 붙어 있다
    if (many) x = x.filter(function (q) { return q.indexOf('저도 무죄였습니다') < 0; });
    if (many) x = x.map(function (q) { return q.replace(/그 사람에게만 뜨는 창 — 「[^」]*」\.?/, '').trim(); });
    let html = x.join('<br><br>');
    if (p.cult === ME()) html += L.cultCard();
    else if (!many) html += '<div class="wd-sys">먼저 내려간 신도가 동행합니다.</div>';
    const s = F().lk.s;
    if (s.done) { L.draw('진입', html, ''); return; }
    L.draw('진입', html + L.roleCard(), X.btn('복도로 들어선다.', 'WONDER.lkNext()'));
};
L.roleCard = function () {
    const p = L.plan();
    const r = p.role[ME()];
    if (!r) return '';
    const D = {
        '기록자': '흔적 하나를 들고 시작합니다. 남이 놓친 것을 적어 둡니다.',
        '등불지기': '기믹에 성공하면 시간이 두 배로 돌아옵니다.',
        '감시자': '살피고 뒤지는 판정에 +2.',
        '문지기': '첫 기믹 실패는 시간이 깎이지 않습니다.'
    };
    return '<div class="wd-note" style="border-color:#5a4a2a;"><b style="color:#d4af37;">◈ 당신의 자리 — ' + r + '</b><br>' + D[r] + '</div>';
};
L.cultCard = function () {
    const d = def();
    const rv = L.sub(d.key, d.base, '계시');
    let task = '';
    if (rv) {
        const m = rv.p[0].x.match(/계시 과업:\s*([^」]*)」/);
        if (m) task = m[1];
    }
    return '<div class="wd-note" style="background:rgba(127,0,0,0.15); border-color:#7f0000;"><b style="color:#ff6b6b;">◉ 당신은 내려오기 전부터 이곳의 사람입니다. 계시를 받았습니다.</b>'
        + (task ? '<br><span style="color:#d4af37;">계시 과업 — ' + esc(task) + '</span>' : '')
        + '<br><span style="font-size:10px;color:#888;">역제의를 따라도 성공할 수 있는 길이 있습니다.</span></div>';
};
L.K.reveal = function () {
    const d = def();
    const sc = L.sub(d.key, d.base, '계시');
    const x = L.paras(sc.p[0].x).filter(function (q) { return !/^<i>\(셋 이상\)/.test(q); }).map(function (q) { return q.replace(/\s*<i>\([^)]*\)<\/i>/g, ''); }).join('<br><br>');
    L.draw('계시', x + L.hintBox(), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
L.K.rules = function () {
    const d = def();
    const sc = L.sub(d.key, d.base, '이번 판 규칙');
    const o = (sc.p[0].o || []).map(function (q) { return '· ' + q.l; }).join('<br>');
    L.draw('이번 판 규칙', '<div class="wd-note" style="border-color:#3a3220; font-size:11px;">' + o + '</div>', X.btn('알겠다.', 'WONDER.lkNext()'));
};

// 복도의 방 — 새 지문 (원고 「연계판 — 복도 · 기믹 (공통)」)
const ROOMS = [
    '계단 아래 첫 방이다. 바닥에 무릎 자국이 줄지어 파여 있다. 자국마다 먼지가 없다.<br><br>벽에 문장이 적혀 있다. 같은 문장이 수백 번.<br><br><span style="color:#d4af37;">“판결을 들으셨습니까.”</span><br><br>읽는 것만으로 대답하고 싶어진다.',
    '복도가 꺾인다. 꺾인 자리에 의자가 하나 있다. 등받이가 위쪽을 보고 있다.<br><br>누가 앉았다 일어난 지 얼마 안 됐다. 방석이 아직 꺼져 있다.',
    '천장에서 무언가 떨어진다. 하얀 깃털이다. 바닥에 닿기 전에 한 번 멈췄다가 내려앉는다.<br><br>위에서는 지금도 무언가를 축하하고 있다.',
    '문틈마다 빛이 샌다. 전부 같은 색이다.<br><br>문 하나를 지날 때마다 안쪽에서 같은 소리가 난다. 땅. 망치 소리다. 위에서 한 번 두드릴 때마다 아래에서 한 번씩 따라 울린다.',
    '작은 방이다. 탁자 위에 찻잔이 놓여 있다. 차는 식었다. 설탕 단지에서 세 개가 비어 있다.<br><br>누군가 위로 올려 보낼 차를 끓이다 말았다.',
    '복도 끝에서 누가 걸어온다. 걸음이 일정하다. 가까이 오기 전에 옆문으로 사라진다.<br><br>지나간 자리에 실밥 한 가닥이 떨어져 있다.'
];
const GIMS = [
    { t: '줄 선 무릎', x: '복도 한가운데에 사람들이 무릎을 꿇고 줄지어 있다. 지나가려면 그 사이를 지나야 한다. 누구의 등도 건드리지 않고.',
      o: ['줄 사이로 몸을 옆으로 돌려 지나간다.', '벽에 등을 붙이고 게걸음으로 간다.', '그들처럼 무릎을 꿇고 기어간다.'],
      ok: '아무도 고개를 들지 않았다.', bad: '어깨가 누군가의 등에 닿는다. 그 사람이 고개를 든다. 웃는다. “판결을 들으셨습니까.” 대답할 때까지 비켜 주지 않는다.' },
    { t: '문장이 적힌 벽', x: '벽의 문장이 눈에 들어온다. 끝까지 읽으면 따라 말하게 된다. 그걸 안다.',
      o: ['눈을 감고 벽을 짚으며 지나간다.', '다른 글자를 센다.', '빠르게 지나간다.'],
      ok: '문장의 끝을 보지 않았다. 입술은 움직이지 않았다.', bad: '문장을 끝까지 읽어 버렸다. 입술이 움직인다. 정신을 차렸을 때는 한참 서 있었다.' },
    { t: '박자', x: '발소리가 박자에 맞춰져 있다. 복도의 모두가 같은 박자로 걷는다. 박자를 어기면 모두가 돌아본다.',
      o: ['박자에 맞춰 걷는다.', '박자와 박자 사이에 걷는다.', '멈췄다가 한꺼번에 지나간다.'],
      ok: '아무도 돌아보지 않았다. 박자 안에 섞였다.', bad: '박자가 어긋난다. 복도의 모두가 동시에 돌아본다. 다시 박자를 맞출 때까지 아무도 눈을 떼지 않는다.' },
    { t: '반만 열린 문', x: '문이 반만 열려 있다. 문틈이 빛으로 가득하다. 지나가려면 빛을 스쳐야 한다.',
      o: ['고개를 숙이고 지나간다.', '손으로 빛을 가리고 지나간다.', '문을 끝까지 연다.'],
      ok: '빛이 옷자락만 스치고 지나갔다.', bad: '빛이 뺨에 닿는다. 따뜻하다. 너무 따뜻해서 발이 멈춘다. 한참 뒤에야 다시 걷는다.' }
];
L.ROOMS = ROOMS; L.GIMS = GIMS;
function roomOf(i) {
    const p = L.plan();
    const ro = p.rooms || [0, 1, 2, 3, 4, 5];
    const gi = p.gims || [0, 1, 2, 3];
    return { r: ROOMS[ro[i % ro.length]], g: GIMS[gi[i % gi.length]] };
}
L.roomOf = roomOf;
// 기믹 화면 — after: 결과 뒤에 덧붙일 것(함수), onDone: 다 본 뒤 (없으면 L.next)
L.K.room = function (step, i) {
    const s = F().lk.s;
    const R = roomOf(step.n || 0);
    if (s.g == null) {
        const pre = step.pre ? step.pre(s) : '';
        L.draw('—', R.r + '<br><br><b>— ' + R.g.t + ' —</b><br><br>' + R.g.x + pre,
            R.g.o.map(function (o, j) { return X.btn(o, 'WONDER.L.gim(' + j + ')'); }).join(''));
        return;
    }
    const r = s.g;
    L.draw('—', X.rollHtml(r) + (r.ok ? R.g.ok : R.g.bad) + (s.gt || '') + (s.h ? '<div class="wd-sys">흔적 — ' + s.h + '</div>' : '') + (step.post ? step.post(s) : ''),
        step.after ? step.after(s) : X.btn('계속 간다.', 'WONDER.lkNext()'));
};
L.gim = function (j) {
    const f = F();
    const s = f.lk.s;
    if (s.g) return;
    const step = def().steps[f.lk.i];
    const extra = step.bonus ? step.bonus(s) : 0;
    const r = (step.auto && step.auto(s)) ? { raw: 30, bonus: 0, total: 30, ok: true, auto: 1 } : X.roll(extra);
    s.g = r;
    s.gj = j;
    s.gt = step.timeless ? '' : L.gimTime(r.ok);
    if (r.ok && def().hints) s.h = L.hint();
    if (step.onRoll) step.onRoll(s, r);
    X.save(); X.view();
};

// ==========================================
// 결말
// ==========================================
//   end = { t: 결말 제목, r: 'w'|'d'|'f', ... }  (먼저 적은 것이 이긴다)
L.end = function (t, r, extra) {
    const v = Object.assign({ t: t, r: r, at: Date.now() }, extra || {});
    L.tx('end', function (cur) { return cur || v; });
};
// 결말 장면을 제목별로 나눈다
L.endings = function () {
    const d = def();
    const sc = L.sub(d.key, d.base, '결말');
    const out = {};
    let cur = null;
    L.paras(sc.p[0].x).forEach(function (q) {
        const m = q.match(/^<b>([✔✖])\s*([^<]+)<\/b>\s*(.*)$/);
        if (m) {
            cur = { ok: m[1] === '✔', t: m[2].trim(), body: [], ret: null };
            out[cur.t] = cur;
            let rest = m[3].replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/^—\s*/, '');
            if (rest) cur.body.push(rest);
            return;
        }
        if (!cur) return;
        if (/^<i>\(귀환\)<\/i>/.test(q)) { cur.ret = q.replace(/^<i>\(귀환\)<\/i>\s*/, ''); return; }
        cur.body.push(q);
    });
    Object.keys(out).forEach(function (k) {
        out[k].body = out[k].body.map(cleanEnd).filter(Boolean);
        if (out[k].ret) out[k].ret = cleanEnd(out[k].ret);
    });
    return out;
};
function cleanEnd(q) {
    return String(q)
        .replace(/기존 [^.→]*?처리\.?/g, '')
        .replace(/\s*→\s*실패 귀환/g, '')
        .replace(/<i>\([^)]*\)<\/i>/g, '')
        .replace(/\s+$/, '').trim();
}
function retCommon(ok, line) {
    const d = def();
    const sc = X.scene(d.key, d.returnIdx);
    const ps = L.paras(sc.p[0].x);
    const iOk = ps.findIndex(function (q) { return /^<b>✔/.test(q); });
    const iBad = ps.findIndex(function (q) { return /^<b>✖/.test(q); });
    const seg = ok ? ps.slice(iOk + 1, iBad) : ps.slice(iBad + 1).filter(function (q) { return q.indexOf('어느 쪽이든') !== 0; });
    return seg.map(function (q) {
        q = q.replace(/\s*<i>\(보상은 나중에\)<\/i>/, '');
        if (q.indexOf('<i>(미션별 한두 줄)</i>') >= 0) q = q.replace(/\s*<i>\(미션별 한두 줄\)<\/i>\s*/, line ? ' ' + line + ' ' : ' ');
        return q;
    }).join('<br><br>');
}
function renderEnd(end) {
    const f = F();
    const d = def();
    const E = L.endings();
    const e = E[end.t] || { ok: end.r !== 'f', body: [], ret: null };
    if (!e.body.length) e.body = ['복도의 빛이 한꺼번에 밝아진다. 시간이 다 됐다.'];
    f.lk.e = f.lk.e || {};
    // 사람마다 갈리는 결말 (끌려감 판정 · 따라 올라가기)
    let mine = end.r;
    let extra = '';
    if (d.endMine) {
        const o = d.endMine(end, f.lk.e);
        if (o) { if (o.r) mine = o.r; if (o.html) extra = o.html; if (o.die) { X.save(); return X.die(e.body.join('<br><br>') + '<br><br>' + o.die); } }
        X.save();
    }
    const ok = mine === 'w' || mine === 'd';
    const page = f.lk.e.pg || 0;
    if (page === 0) {
        L.draw((e.ok ? '✔ ' : '✖ ') + esc(end.t), e.body.join('<br><br>') + extra, X.btn('계단을 오른다.', 'WONDER.L.endPage(1)'));
        return;
    }
    const line = ok ? (e.ret || '') : '';
    let html = '';
    if (!ok && e.ret) html = e.ret + '<br><br>';
    html += retCommon(ok, line);
    html += '<div class="wd-sys">' + (ok ? '미션 성공 — ' + (mine === 'w' ? '이상한 나라 쪽' : '어둠 쪽') + ' · 홀로 돌아가면 보상을 받습니다' : '미션 실패 — 잃는 것은 없습니다') + '</div>';
    X.draw(ok ? '✔' : '✖', html, X.btn('홀로 돌아간다.', "WONDER.L.done()"));
}
L.endPage = function (n) { const f = F(); f.lk.e = f.lk.e || {}; f.lk.e.pg = n; X.save(); X.view(); };
L.done = function () {
    const end = L.st().end;
    if (!end) return;
    const d = def();
    let mine = end.r, personal = false;
    if (d.endMine) { const o = d.endMine(end, F().lk.e || {}); if (o && o.r) { mine = o.r; personal = true; } }
    X.finish(mine, personal);
};

console.log('[이상한 나라] 연계판 도구 연결');
})();
