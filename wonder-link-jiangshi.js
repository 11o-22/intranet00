// ==========================================
// ★ 「이상한 나라의 ■■■」 — 강시 연계판 「검역 실패」 (몽환)
// bundles.json 마지막 묶음 — wonder-ch-jiangshi.js 다음
// ==========================================
//
//   원고: 「강시의 장 · 몽환 — 원고」 문서의 연계판 공통 뼈대 · 진입 · 귀환 · S1~T8.
//   원고가 「기존 S-010」에 맡긴 구간 · 기믹은 아래 복도 · 기믹(새로 씀)으로 대신하고, 감염도는 이 연계판 안에서만 센다.
//
//   감염도   0에서 시작(숨긴 감염자는 40). 기믹 · 감염 판정에 실패하면 오른다.
//            30 이상(증상) — 모든 판정 −2.  60(전향) — 그 사람의 미션은 ✖.
//            전향 뒤 처리(원고: 「12분 안에 못 하면 굶어 죽음, 해내면 실패 귀환」)는 판정 한 번으로 줄였다 —
//            실패하면 죽음(X.die → 상담실 · 선녀탕, 회차는 처음부터), 성공하면 실패 귀환.
//            팀에서는 결말에 「감염」이 따로 적힌 미션(T1 · T2 · T5 · T7 · T8)만 판 전체가 끝나고,
//            나머지는 그 사람만 ✖ (감염도 50으로 버티며 끝까지 함께 간다).
//   이벤트 샵 「종이 부적 한 장」 감염 판정 실패 한 번을 막는다(자동) · 「연꽃 소독수」 감염도 −20(위쪽 띠 단추)
//            「대나무 피리」 방어전 한 라운드를 판정 없이 · 「작은 방울」 · 「홍등 성냥」은 숨바꼭질(S3 · T1 · T6)에서.
//   시계     기존 S-010 그대로 40분 (T8은 1구간 뒤 20분으로 줄어든다).
//   인원     둘~넷이면 생존자 NPC가 다섯을 채우고, 숨긴 감염자는 NPC 가운데. 다섯 이상이면 일행 가운데 하나.
//
//   공용 도구(wonder-link.js)에 대한 덮어쓰기 — 모두 강시 연계판일 때만 작동한다:
//     L.left(시계 40분) · L.bar(감염도 · 소독수) · L.endings(조건 메모가 달린 결말) · L.name(NPC 이름)

(function wonderLinkJiangshi() {
'use strict';
const X = window.WONDER;
if (!X || !X.L || !X.L.K) return;
const L = X.L;
const CH = 'jiangshi';
const J = X.JS = X.JS || {};
function F() { return X.F(); }
function ME() { return currentUser.code; }
function lk() { return L.me(); }
function st() { return F().lk.s; }
function esc(s) { return L.esc(s); }
function mine() { const f = F(); return !!(f && f.lk && f.lk.ch === CH); }
function md() { return (window.WONDER_MD || {}).j_new || []; }
function scn(name) { return L.sub('j_new', L.def().base, name); }
function p0(name) { const s = scn(name); return s ? s.p[0] : { x: '', o: [] }; }
function paras(x) { return String(x || '').split('<br><br>'); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function E(t, r, extra) { L.end(t, r, extra); }
function team() { return L.team(); }
// Firebase 가 배열을 객체로 돌려줄 때가 있다 — 읽을 때 배열로 맞춘다
function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; }) : []); }
function plan() {
    const p = L.plan() || { mem: [] };
    ['mem', 'vis', 't1v', 'out', 'fig', 't6n', 'groups', 'npcs', 'rooms', 'gims'].forEach(function (k) {
        if (p[k] != null && !Array.isArray(p[k])) p[k] = arr(p[k]);
        if (Array.isArray(p[k]) && /^(vis|t1v|t6n|groups)$/.test(k)) p[k] = p[k].map(function (e) { return Array.isArray(e) ? e : arr(e); });
    });
    return p;
}
const PLACES = ['붉은 비상등 탕비실', '비닐 덮인 창고', '소독 수조', '기도실', '비닐 커튼 복도'];
const NPC_N = ['소매를 내린 생존자', '안경 쓴 생존자', '장갑 낀 생존자', '명찰이 빈 생존자'];

// ==========================================
// 공용 도구 덮어쓰기 (강시 연계판일 때만)
// ==========================================
(function overrides() {
    const _left = L.left;
    L.left = function () {
        const d = mine() && L.def();
        if (d && d.time) {
            const s = L.st();
            if (!s.t0) return d.time;
            let left = d.time + (s.tb || 0) - (Date.now() - s.t0);
            // T8 — 1구간 뒤 무전: 그때부터 20분 (그 뒤의 시간 변화는 그대로 따른다)
            const c = (s.x || {}).t8cut;
            if (c && c.at) left = Math.min(left, 20 * 60000 + ((s.tb || 0) - (c.tb || 0)) - (Date.now() - c.at));
            return left;
        }
        return _left.apply(this, arguments);
    };
    const _name = L.name;
    L.name = function (c) {
        if (c === 'suit') return '표찰 없는 방호복';
        if (/^n\d$/.test(c)) return NPC_N[+c.slice(1)] || '생존자';
        return _name.apply(this, arguments);
    };
    const _bar = L.bar;
    L.bar = function () {
        const h = _bar.apply(this, arguments);
        if (!mine()) return h;
        const n = J.inf();
        let x = '<div class="wd-bar" style="border-color:#3a2a2a;"><span>감염도 <b style="color:' + (n >= 60 ? '#f44336' : n >= 30 ? '#ff9800' : '#9a8') + ';">' + n + '</b> / 60</span>'
            + (n >= 30 && n < 60 ? '<span style="color:#ff9800;">증상 — 판정 −2</span>' : '') + (lk() && lk().lost ? '<span style="color:#f44336;">전향을 버티는 중 — 이번 미션은 ✖</span>' : '') + '</div>';
        if (n > 0 && !L.st().end && !(lk() && lk().turned) && X.has && X.has('연꽃 소독수')) x += X.btn('🪷 연꽃 소독수를 바른다. <span style="font-size:10px;color:#d4af37;">(감염도 −20)</span>', 'WONDER.JS.cure()');
        return h + x;
    };
    const _end = L.endings;
    L.endings = function () {
        if (!mine()) return _end.apply(this, arguments);
        return J.endings();
    };
})();

// ==========================================
// 감염도
// ==========================================
J.inf = function () { const l = lk(); return (l && l.inf) || 0; };
J.infOf = function (c) { return c === ME() ? J.inf() : (((L.x().inf) || {})[c] || 0); };
J.addInf = function (n, why) {
    const l = lk();
    if (!l || n === 0) return '';
    if (n > 0 && X.has && X.has('종이 부적 한 장') && X.spend('종이 부적 한 장')) {
        return '<div class="wd-sys">📜 종이 부적 한 장 — 이번 감염은 막았습니다.</div>';
    }
    l.inf = Math.max(0, Math.min(100, (l.inf || 0) + n));
    L.pub('x/inf/' + ME(), l.inf);
    try { darkRun.log.push('[감염도] ' + (n > 0 ? '+' : '') + n + ' → ' + l.inf + (why ? ' (' + why + ')' : '')); } catch (e) { }
    X.save();
    let h = '<div class="wd-sys" style="color:' + (n > 0 ? '#f44336' : '#4CAF50') + ';">감염도 ' + (n > 0 ? '+' : '') + n + ' → ' + l.inf + '</div>';
    if (l.inf >= 60 && !l.turned) { l.turned = 1; X.save(); h += J.turn(); }
    return h;
};
J.setInf = function (v) { const l = lk(); l.inf = v; L.pub('x/inf/' + ME(), v); X.save(); };
J.cure = function () {
    if (!X.spend('연꽃 소독수')) return;
    J.addInf(-20, '연꽃 소독수');
    X.view();
};
// 전향 — 솔로는 미션의 감염 결말로 (판정은 결말에서), 팀은 그 자리에서 버티기 판정
J.turn = function () {
    const d = L.def();
    const l = lk();
    if (!team()) { setTimeout(function () { E(d.infEnd || '감염', 'f', { turn: 1 }); }, 50); return ''; }
    if (d.teamInf) { setTimeout(function () { d.teamInf(); }, 50); }
    const r = X.roll(0);
    if (!r.ok) {
        setTimeout(function () { X.die(X.rollHtml(r) + '팔 안쪽이 가렵다. 이제 긁어도 아무 느낌이 없다. 배가 고프다. 아주 오래.<br><br>(전향)'); }, 900);
        return X.rollHtml(r) + '<div class="wd-sys" style="color:#f44336;">전향 — 버티지 못했습니다.</div>';
    }
    l.lost = 1;
    l.inf = 50;
    L.pub('x/inf/' + ME(), 60);
    X.save();
    return X.rollHtml(r) + '<div class="wd-sys" style="color:#ff9800;">전향 — 이를 악물고 버팁니다. 이번 미션은 ✖, 끝까지 함께 갑니다.</div>';
};
// 판정 — 장비 없이. 증상 −2, 끄는 중(T8) −3, 등을 든 사람(T5)의 은신 · 회피 −3
J.roll = function (extra, kind) {
    let b = extra || 0;
    if (J.inf() >= 30) b -= 2;
    const l = lk();
    if (l && l.drag) b -= 3;
    if (kind === 'evade' && J.bearer && J.bearer() === ME() && L.x().t5ember) b -= 3;
    return X.roll(b);
};

// ==========================================
// 결말 — 조건 메모가 달린 문단까지 (d.endCond(메모) 가 참이면 남긴다)
// ==========================================
function cleanEnd(q) {
    return String(q)
        .replace(/기존 [^.→]*?처리\.?/g, '')
        .replace(/\s*→\s*(감염\s*→\s*)?실패 귀환/g, '')
        .replace(/\s+$/, '').trim();
}
function condPara(q, ok) {
    // 「(조건 — 내용)」 은 조건이 맞을 때 내용만, 「(조건) 뒤 문장」 은 조건이 맞을 때만 뒤 문장을 남긴다
    q = q.replace(/<i>\(([^)—]*?)\s*—\s*([^)]*)\)<\/i>/g, function (all, c, body) { return ok(c.trim()) ? body : ''; });
    const m = q.match(/^(.*?)<i>\(([^)]*)\)<\/i>(.*)$/);
    if (!m) return q;
    const keep = ok(m[2].trim());
    const rest = keep ? condPara(m[3], ok) : '';
    return (m[1] + (keep ? ' ' + rest : '')).replace(/\s+/g, ' ').trim();
}
J.endings = function () {
    const d = L.def();
    const sc = L.sub('j_new', d.base, '결말');
    const ok = function (c) { return !!(d.endCond && d.endCond(c)); };
    const out = {};
    let cur = null;
    paras(sc.p[0].x).forEach(function (q) {
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
        out[k].body = out[k].body.map(function (q) { return cleanEnd(condPara(q, ok)); }).filter(Boolean);
        if (out[k].ret) out[k].ret = cleanEnd(condPara(out[k].ret, ok));
        if (!out[k].body.length && /감염/.test(k)) out[k].body = ['팔 안쪽이 가렵다. 이제 긁어도 아무 느낌이 없다. 배가 고프다.'];
    });
    if (d.endFix) d.endFix(out);
    return out;
};
// 사람마다 — 솔로 전향은 판정(실패하면 죽음), 팀에서 전향을 버틴 사람은 ✖, T8 셔터
function endMineBase(extra) {
    return function (end, e) {
        if (end.turn && !team()) {
            if (e.r == null) { const r = X.roll(0); e.r = { ok: r.ok, total: r.total, raw: r.raw, bonus: 0 }; }
            if (e.r.ok) return { r: 'f', html: '<br><br>' + X.rollHtml(e.r) + '배가 고프다. 그래도 비닐을 젖힌다. 한 겹, 또 한 겹. 대나무 소리가 들린다.' };
            return { die: X.rollHtml(e.r) + '비닐 너머가 하얗다. 대나무 소리는 끝내 들리지 않는다.<br><br>(굶주림)' };
        }
        if (extra) { const o = extra(end, e); if (o) return o; }
        if (lk() && lk().lost && end.r !== 'f') return { r: 'f', html: '<div class="wd-sys">당신은 전향을 버티느라 미션을 이루지 못했습니다.</div>' };
        return null;
    };
}

// ==========================================
// 걸음 — 진입 · 지침
// ==========================================
L.K.jenter = function () {
    const d = L.def();
    const p = plan();
    const n = p.mem.length;
    const l = lk();
    if (!l.jinit) {
        l.jinit = 1;
        l.inf = 0;
        if (p.cult === ME()) l.inf = 40;
        L.pub('x/inf/' + ME(), l.inf);
        X.save();
    }
    const sc = X.scene('j_new', d.enterIdx);
    const show = function (c) {
        if (c.indexOf('화환을 받은 사람') >= 0) return !!F().jWreath;
        if (c === '혼자') return n === 1;
        if (c === '둘~넷') return n >= 2 && n <= 4;
        if (c === '다섯 이상') return n >= 5;
        return false;
    };
    let x = paras(sc.p[0].x).filter(function (q) { const m = q.match(/^<i>\(([^)]*)\)<\/i>/); return !m || show(m[1]); })
        .map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
    if (p.cult === ME()) x += '<div class="wd-note" style="background:rgba(127,0,0,0.15); border-color:#7f0000;"><b style="color:#ff6b6b;">◉ 당신은 이미 물렸습니다. 숨기고 있습니다.</b><br>감염도 40에서 시작합니다. 아무도 모릅니다.</div>';
    if (n >= 2 && n <= 4) x += '<div class="wd-sys">생존자 ' + (5 - n) + '명이 함께합니다. 그 가운데 하나는 물린 채 숨기고 있습니다.</div>';
    L.draw('진입', x, X.btn('노란 선 안쪽으로 걷는다.', 'WONDER.lkNext()'));
};
L.K.jreveal = function () {
    const d = L.def();
    const p = plan();
    const n = p.mem.length;
    const sc = scn('지침');
    const show = function (c) {
        if (c === '비밀 술래의 화면') return p.seek === ME();
        if (c === '둘~넷') return n >= 2 && n <= 4;
        if (c === '다섯 이상') return n >= 5;
        return false;
    };
    const x = paras(sc.p[0].x).filter(function (q) { const m = q.match(/^<i>\(([^)]*)\)<\/i>/); return !m || show(m[1]); })
        .map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
    L.draw('지침', x, X.btn('계속 간다.', 'WONDER.lkNext()'));
};

// ==========================================
// 복도 · 기믹 (새 지문 — 원고 「연계판 — 구간 · 기믹 (공통)」 부록)
// ==========================================
const ROOMS = [
    '복도가 길다. 형광등이 하나 걸러 하나 켜져 있다. 노란 테이프 선이 바닥을 따라간다.<br><br>벽의 안내문. 「손을 씻으십시오. 물린 인원은 즉시 신고하십시오.」 손 씻는 그림 아래에 누가 손톱으로 긁어 놓았다. 「두 번」.',
    '보급소다. 선반이 반쯤 비었다. 붕대 상자, 마스크 상자. 전부 뜯겨 있다.<br><br>바닥에 흰 가루가 흩어져 있다. 소독약이다. 그 위에 발자국. 두 발이 가지런히 모인 자국이 일정한 간격으로 찍혀 있다. 콩, 콩.',
    '의무실 문이 반쯤 열려 있다. 침대 시트가 전부 하얗다. 베개 하나에만 노란 종이가 붙어 있다.<br><br>체온계가 바닥에 떨어져 있다. 눈금이 바닥까지 내려가 있다.',
    '비닐 커튼이 겹겹이다. 젖히면 또 있다. 커튼끼리 스치며 소리를 낸다. 쉿. 쉿, 쉿.<br><br>커튼 너머로 그림자가 하나 선다. 두 팔이 앞으로 뻗어 있다. 움직이지 않는다.',
    '탕비실이다. 붉은 비상등이 깜빡인다. 켜질 때마다 냉장고 문에 비친 얼굴이 하나씩 많다.<br><br>전기 주전자에 물이 반쯤 남아 있다. 아직 미지근하다.',
    '스피커가 지직거린다. “물린 인원은 즉시 신고하십시오. 숨기면 전원이 위험합니다.” 녹음이다.<br><br>복도 저쪽 끝에서 방울 같은 소리가 한 번 난다. 딸랑. 사이렌이 짧게 울다 끊긴다.'
];
const GIMS = [
    { t: '뻗은 팔', k: 'evade', x: '복도 한가운데에 그것이 서 있다. 두 팔을 앞으로 뻗었다. 이쪽을 보지 않는다. 아직은. 지나가려면 그 팔 아래를 지나야 한다.',
      o: ['몸을 낮추고 팔 아래로 지나간다.', '벽에 붙어 천천히 돌아간다.', '숨을 참고 단숨에 뛴다.'],
      ok: '팔 끝이 머리카락을 스친다. 그것은 돌아보지 않았다.', bad: '팔이 내려온다. 손목을 붙잡힌다. 차갑다. 뿌리치고 나왔을 때는 소매가 찢어져 있다.' },
    { t: '열쇠 소리', k: 'evade', x: '복도 저쪽에서 열쇠 꾸러미 소리가 난다. 찰랑, 찰랑. 가까워진다. 숨을 곳이 필요하다.',
      o: ['비닐 덮인 선반 아래로 들어간다.', '문 뒤에 붙어 선다.', '비닐 커튼 사이에 선다. 두 팔을 앞으로.'],
      ok: '열쇠 소리가 앞을 지나간다. 멈추지 않는다.', bad: '열쇠 소리가 앞에서 멈춘다. 장갑 낀 손이 비닐을 젖힌다. 겨우 빠져나왔지만, 무언가 팔을 스쳤다.' },
    { t: '쓰러진 근무자', k: 'subdue', x: '근무자 하나가 쓰러져 있다. 마스크. 가슴의 명찰은 사진 칸이 비어 있다. 지나가려는데 손가락이 움직인다.',
      o: ['소화기를 들고 지나간다.', '발목을 묶어 두고 지나간다.', '멀찍이 돌아간다.'],
      ok: '손가락은 다시 움직이지 않았다.', bad: '그것이 일어난다. 무릎을 굽히지 않고, 통째로. 밀쳐 내는 사이 손등에 이가 스친다.' },
    { t: '소독 게이트', k: 'evade', x: '소독 게이트다. 분무기가 고장 나서 한꺼번에 쏟아진다. 눈이 따갑다. 반대편에서 무언가 다가온다.',
      o: ['눈을 감고 그대로 건너간다.', '젖은 소매로 입을 막고 지나간다.', '게이트 옆 틈으로 비켜 간다.'],
      ok: '반대편에 닿았다. 다가오던 것은 소독약 냄새에 물러섰다.', bad: '눈을 떴을 때 그것이 바로 앞에 있었다. 얼굴이 하얗다. 입술만 짙다.' }
];
J.ROOMS = ROOMS; J.GIMS = GIMS;
function roomOf(n) {
    const p = plan();
    const ro = p.rooms || [0, 1, 2, 3, 4, 5];
    const gi = p.gims || [0, 1, 2, 3];
    return { r: ROOMS[ro[n % ro.length]], g: GIMS[gi[n % gi.length]] };
}
// step: { k:'jroom', n, pre(s), auto(s), bonus(s), after(s, r) → html, skip() }
L.K.jroom = function (step, i) {
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    const s = st();
    const R = roomOf(step.n || 0);
    if (s.g == null) {
        L.draw('—', R.r + '<br><br><b>— ' + R.g.t + ' —</b><br><br>' + R.g.x + (step.pre ? step.pre(s) : ''),
            R.g.o.map(function (o, j) { return X.btn(o, 'WONDER.JS.gim(' + j + ')'); }).join(''));
        return;
    }
    L.draw('—', (s.g.auto ? '' : X.rollHtml(s.g)) + (s.g.ok ? R.g.ok : R.g.bad) + (s.gt || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.gim = function (j) {
    const f = F();
    const s = f.lk.s;
    if (s.g) return;
    const step = L.def().steps[f.lk.i];
    const R = roomOf(step.n || 0);
    const auto = step.auto && step.auto(s);
    const r = auto ? { raw: 30, bonus: 0, total: 30, ok: true, auto: 1 } : J.roll(step.bonus ? step.bonus(s) : 0, R.g.k);
    s.g = r;
    s.gt = '';
    if (auto) s.gt = '<div class="wd-sys">' + (step.autoTxt || '판정 없이 지나갑니다.') + '</div>';
    if (!r.ok) s.gt += J.addInf(10, R.g.t);
    if (step.after) s.gt += step.after(s, r) || '';
    X.save(); X.view();
};

// ==========================================
// 함께 고르는 걸음 — 강시판 (판정은 J.roll, 사람마다 한 번 붙는 일은 once)
// ==========================================
//   step: { k:'jteam', id(), title, text(), opts() → [{l, v, roll?:bonus fn}], who()?, skip()?,
//           mineTxt(v), resolve(m) → { html, end:[t,r,extra], wait }, once(m) → html (사람마다 한 번) }
L.K.jteam = function (step, i) {
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    const key = typeof step.id === 'function' ? step.id() : step.id;
    const m = L.votes(key);
    const who = step.who ? step.who() : L.who();
    const text = step.text ? step.text() : '';
    const title = step.title || '—';
    const s = st();
    if (who.indexOf(ME()) >= 0 && m[ME()] == null) {
        const os = step.opts();
        L.draw(title, text, os.map(function (o, j) { return o.off ? '' : X.btn(o.l, 'WONDER.JS.cast(' + i + ',' + j + ')'); }).join(''));
        return;
    }
    if (!who.every(function (c) { return m[c] != null; })) {
        const my = m[ME()];
        L.draw(title, text + (my != null && step.mineTxt ? '<div class="wd-sys">' + step.mineTxt(my) + '</div>' : ''), L.waitList(m, who));
        return;
    }
    if (step.once && !s.once) { s.once = 1; s.oh = step.once(m) || ''; X.save(); }
    const r = step.resolve(m) || {};
    if (r.end) { E(r.end[0], r.end[1], r.end[2]); L.draw(title, (s.oh || '') + (r.html || text), X.waitHtml('_none', '…')); return; }
    if (r.wait) { L.draw(title, (s.oh || '') + (r.html || text), X.waitHtml('_none', '…')); return; }
    L.draw(title, (s.oh || '') + (r.html || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.cast = function (i, j) {
    const f = F();
    if (f.lk.i !== i) return;
    const step = L.def().steps[i];
    const key = typeof step.id === 'function' ? step.id() : step.id;
    const o = step.opts()[j];
    if (!o || L.votes(key)[ME()] != null) return;
    let v = o.v;
    if (o.auto) v = { v: o.v, ok: true, n: 30, auto: 1 };
    else if (o.roll) {
        const r = J.roll(o.roll(), o.kind);
        v = { v: o.v, ok: r.ok, n: r.total };
        try { showDarkToast((r.ok ? '✔ ' : '✖ ') + r.total + ' / 16'); } catch (e) { }
    }
    if (o.spend && !X.spend(o.spend)) return;
    L.vote(key, v);
};
function memOpts(prefix, label, extra) {
    const p = plan();
    const list = p.mem.slice().concat(extra || []);
    return list.map(function (c) { return { l: label(L.name(c), c), v: prefix + c }; });
}
function npcs() { const p = plan(); return (p.npcs || []).slice(); }
function alive() { return L.who(); }
function half(list) { const p = plan(); const all = p.mem.filter(function (c) { return true; }); return list.length * 2 >= all.length && list.length > 0; }
function infected() { const p = plan(); return p.mem.filter(function (c) { return J.infOf(c) >= 60; }); }

// ==========================================
// 숨바꼭질 (S3 · T1 · T6 공용) — 홍등 성냥 · 작은 방울
// ==========================================
function placeBtns(fn, mark) {
    return PLACES.map(function (n, k) { return X.btn(n + (mark && mark[k] ? ' <span style="color:#f44336;">✕</span>' : ''), fn + '(' + k + ')'); }).join('');
}

// ==========================================
// S1 잃어버린 방울
// ==========================================
L.K.s1mach = function () {
    const pg = p0('기계실');
    L.draw('기계실', L.txt(pg.x), X.btn('방울을 빼서 고리에 건다.', "WONDER.JS.s1('out')") + X.btn('방울을 둔 채 스위치를 올린다.', "WONDER.JS.s1('in')"));
};
J.s1 = function (k) {
    const l = lk();
    if (l.bell) return;
    l.bell = k;
    X.save();
    if (k === 'in') return L.goStep(L.def().steps.findIndex(function (s) { return s.k === 's1fin'; }));
    L.next(true);
};
L.K.s1way = function (step, i) {
    const l = lk();
    const s = st();
    if (l.bell !== 'out') { L.goStep(i + 1); return; }
    const pos = l.pos || 0;
    const head = '<div class="wd-sys">드러난 위치 ' + pos + ' / 3</div>';
    if (!s.r) {
        const x = step.n === 0 ? L.txt(p0('돌아가는 길').x) : ROOMS[(plan().rooms || [0, 1, 2, 3, 4, 5])[3 + step.n]] + '<br><br>고리 끝에서 방울이 흔들린다. 손바닥이 젖는다.';
        L.draw('돌아가는 길', x + head, X.btn('방울을 흔든다. <span style="font-size:10px;color:#888;">(판정 없이 지나간다 · 위치 +1)</span>', 'WONDER.JS.s1w(1)') + X.btn('감싼 채 지나간다. <span style="font-size:10px;color:#888;">(회피 판정)</span>', 'WONDER.JS.s1w(0)'));
        return;
    }
    L.draw('돌아가는 길', (s.r.auto ? '딸랑. 복도의 것들이 한 장면 동안 멈춘다. 그 사이를 지나간다. 어딘가에서 고개 하나가 이쪽으로 돌아간다.' : X.rollHtml(s.r) + (s.r.ok ? '방울은 손 안에서 조용하다. 아무도 돌아보지 않았다.' : '손이 미끄러진다. 고리 끝에서 방울이 운다. 딸랑.')) + (s.gt || '') + '<div class="wd-sys">드러난 위치 ' + (l.pos || 0) + ' / 3</div>', X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.s1w = function (k) {
    const l = lk(), s = st();
    if (s.r) return;
    if (k) { s.r = { auto: 1, ok: true }; l.pos = (l.pos || 0) + 1; }
    else { s.r = J.roll(0, 'evade'); if (!s.r.ok) { l.pos = (l.pos || 0) + 1; s.gt = J.addInf(10, '회피 실패'); } }
    X.save();
    if ((l.pos || 0) >= 3) return E('몰려온 것들', 'f');
    X.view();
};
L.K.s1fin = function () {
    const l = lk(), s = st();
    if (l.bell === 'out') { E('돌아온 방울', 'w'); L.draw('—', '', X.waitHtml('_none', '…')); return; }
    let x = '스위치를 올린다. 사이렌이 울린다. 이번에는 끊기지 않는다.<br><br>복도마다 셔터가 내려온다. 차례대로. 등 뒤에서부터.';
    if (s.r && !s.r.ok) x = X.rollHtml(s.r) + '셔터 모서리가 어깨를 긁는다. 뒤에서 무언가 발목을 잡았다 놓는다.' + (s.gt || '');
    L.draw('셔터', x, X.btn('마지막 셔터 아래로 뛴다. <span style="font-size:10px;color:#888;">(셔터 조작 · 최후 판정)</span>', 'WONDER.JS.s1run()'));
};
J.s1run = function () {
    const s = st();
    const r = J.roll(0, 'evade');
    s.r = r;
    if (r.ok) return E('닫힌 문', 'd');
    s.gt = J.addInf(20, '셔터');
    X.save(); X.view();
};

// ==========================================
// S2 술래의 선물
// ==========================================
L.K.s2room = function (step) {
    const s = st();
    const ps = paras(p0('다섯 방').x);
    const x = ps[step.n];
    if (!s.r) {
        L.draw(PLACES[step.n], x + '<div class="wd-sys">화환을 걸고 있는 동안 감염자는 당신을 모른 척합니다 — 회피 · 은신은 판정 없이.</div>', X.btn('문을 연다. <span style="font-size:10px;color:#888;">(감염 판정)</span>', 'WONDER.JS.s2open()'));
        return;
    }
    L.draw(PLACES[step.n], x + '<br><br>' + X.rollHtml(s.r) + (s.r.ok ? '문 너머의 것이 화환 쪽으로 고개를 기울인다. 그리고 지나간다.' : '문틈으로 차가운 손이 먼저 나온다. 손등을 스친다.') + (s.gt || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.s2open = function () {
    const s = st();
    if (s.r) return;
    s.r = J.roll(0);
    s.gt = s.r.ok ? '' : J.addInf(10, '감염 판정');
    X.save(); X.view();
};
L.K.j_s2door = function () {
    const pg = p0('격리실 앞');
    L.draw('격리실 앞', L.txt(pg.x), (pg.o || []).map(function (o, j) { return X.btn(L.txt(o.l), 'WONDER.JS.s2end(' + j + ')'); }).join(''));
};
J.s2end = function (j) {
    if (j === 0) return E('전해진 선물', 'w');
    if (j === 1) return E('열린 문', 'd');
    E('마음에 든 손님', 'f');
};

// ==========================================
// S3 안전한 은신처
// ==========================================
function s3map() { const l = lk(); return l.s3map || (l.s3map = {}); }
L.K.s3hide = function (step) {
    const s = st(), l = lk();
    const p = plan();
    const r = step.r;
    const v = p.vis[r];
    const pg = scn('다섯 곳');
    const found = l.found || 0;
    const head = '<div class="wd-sys">숨바꼭질 ' + (r + 1) + ' / 4 · 발각 ' + found + ' / 2</div>';
    if (s.pick == null) {
        let x = (r === 0 ? '방호복이 벽에 이마를 댄다.<br><br>' : '') + '“하나…… 둘……”' + head;
        if (s.peek != null) x += '<div class="wd-sys">🔥 홍등 성냥 — 그림자가 「' + PLACES[s.peek] + '」 쪽으로 먼저 갑니다.</div>';
        x += '<div class="wd-note" style="border-color:#3a2a2a; font-size:11px;">' + (pg.p[0].o || []).map(function (o) { return '· ' + o.l; }).join('<br>') + '</div>';
        let b = placeBtns('WONDER.JS.s3pick', s3map());
        if (s.peek == null && X.has && X.has('홍등 성냥')) b += X.btn('🔥 홍등 성냥을 긋는다. <span style="font-size:10px;color:#d4af37;">(술래가 열 곳 하나를 미리 본다)</span>', 'WONDER.JS.s3peek()');
        L.draw('숨바꼭질', x, b);
        return;
    }
    const hit = v.indexOf(s.pick) >= 0;
    if (hit && !s.res && !s.bellAsk && X.has && X.has('작은 방울')) {
        L.draw('숨바꼭질', '“……열.”<br><br>열쇠 소리가 다가온다. 당신이 숨은 문 앞에서 멈춘다.', X.btn('🔔 작은 방울을 울린다. <span style="font-size:10px;color:#d4af37;">(이번 발각을 없던 일로)</span>', 'WONDER.JS.s3bell(1)') + X.btn('숨을 참는다.', 'WONDER.JS.s3bell(0)'));
        return;
    }
    if (!s.res) {
        v.forEach(function (k) { s3map()[k] = 1; });
        s.res = (hit && !s.bell) ? 'found' : 'safe';
        if (s.res === 'found') {
            l.found = (l.found || 0) + 1;
            if (l.found >= 2) { J.setInf(60); l.turned = 1; X.save(); E('두 번', 'f', { turn: 1 }); return; }
            s.gt = J.addInf(20, '발각');
        }
        X.save();
    }
    const ps = paras(pg.p[1].x);
    let x = ps.filter(function (q) { return !/^<i>\(발각\)/.test(q); }).join('<br><br>');
    if (s.res === 'found') x += '<br><br>' + ps.filter(function (q) { return /^<i>\(발각\)/.test(q); }).map(function (q) { return q.replace(/^<i>\(발각\)<\/i>\s*/, ''); }).join('');
    else x += '<br><br>' + (s.bell ? '<div class="wd-sys">🔔 작은 방울이 먼저 울렸습니다 — 열쇠 소리가 그쪽으로 돌아섭니다.</div>' : '') + '열쇠 소리가 멀어진다. 당신이 숨은 문은 열리지 않았다.';
    x += '<div class="wd-sys">이번에 열린 곳 — ' + v.map(function (k) { return PLACES[k]; }).join(' · ') + '</div>';
    L.draw('숨바꼭질', x + (s.gt || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.s3pick = function (k) { const s = st(); if (s.pick != null) return; s.pick = k; X.save(); X.view(); };
J.s3peek = function () {
    const s = st();
    const v = plan().vis[L.def().steps[F().lk.i].r];
    if (s.peek != null || !X.spend('홍등 성냥')) return;
    s.peek = v[Math.floor(Math.random() * v.length)];
    X.save(); X.view();
};
J.s3bell = function (k) { const s = st(); if (s.bellAsk) return; s.bellAsk = 1; if (k && X.spend('작은 방울')) s.bell = 1; X.save(); X.view(); };
L.K.s3choose = function () {
    const l = lk(), s = st();
    if (s.evac) {
        L.draw('대피', '일곱 명을 어느 방으로 옮길지 정한다. 종이 뒷면의 지도를 본다.', placeBtns('WONDER.JS.s3evac', s3map()));
        return;
    }
    let b = '';
    if (!(l.found || 0)) b += X.btn('지도를 들고 나간다.', 'WONDER.JS.s3c(0)');
    b += X.btn('생존자들을 옮긴다.', 'WONDER.JS.s3c(1)');
    L.draw('네 번이 끝났다', '네 번째 숫자가 끝난다. 열쇠 소리가 멀어진다.<br><br>종이 뒷면에 다섯 칸을 그렸다. 열린 곳마다 가위표.' + '<div class="wd-sys">' + PLACES.map(function (n, k) { return (s3map()[k] ? '✕ ' : '○ ') + n; }).join('<br>') + '</div>', b);
};
J.s3c = function (k) {
    if (k === 0) return E('은신처 지도', 'w');
    st().evac = 1; X.save(); X.view();
};
J.s3evac = function (k) {
    const v = plan().vis[4];
    lk().evac = k; X.save();
    if (v.indexOf(k) >= 0) return E('열린 대피처', 'f');
    E('대피', 'd');
};

// ==========================================
// S4 새 놀이 친구
// ==========================================
function s4obs(k) {
    const ps = paras(p0('관찰').x);
    const heads = ['첫 번째', '두 번째', '세 번째'];
    const i = ps.findIndex(function (q) { return q.indexOf('<b>' + heads[k] + '</b>') === 0; });
    const q = ps[i];
    const a = ps[i + 1] || '';
    const bit = !!plan().bit;
    const m = a.match(/^(.*?)<i>\(물린 판\)<\/i>(.*?)<i>\(안 물린 판\)<\/i>(.*)$/);
    const ans = m ? (m[1] + (bit ? m[2] : m[3])).replace(/\s+/g, ' ').trim() : a;
    return q + '<br><br>' + ans;
}
L.K.s4obs = function (step) {
    L.draw('관찰', s4obs(step.n) + '<div class="wd-sys">관찰 ' + (step.n + 1) + ' / 3</div>', X.btn('계속 간다.', 'WONDER.lkNext()'));
};
// 구역마다 — 곁에 있는 대가(감염 판정) + 회피 기믹. 회피 두 번 실패하면 손을 놓친다
function s4room(n) {
    return {
        k: 'jroom', n: n,
        skip: function () { return n === 2 && !lk().take; },
        pre: function () { return '<br><br><span style="font-size:11px;color:#888;">함께 가는 사람이 당신 소매 끝을 잡고 있다.</span>'; },
        after: function (s, r) {
            const l = lk();
            let h = '';
            if (!r.ok) { l.miss = (l.miss || 0) + 1; h += '<div class="wd-sys">회피 실패 ' + l.miss + ' / 2 — 두 번이면 손을 놓칩니다.</div>'; }
            const z = J.roll(0);
            h += '<div class="wd-sys">곁에 있는 대가 — 감염 판정 ' + z.total + ' / 16</div>' + (z.ok ? '' : J.addInf(10, '동행'));
            if (n === 2 && plan().bit && l.take) { const z2 = J.roll(0); h += '<div class="wd-sys">마지막 구간 — 감염 판정 ' + z2.total + ' / 16</div>' + (z2.ok ? '' : J.addInf(10, '물린 동행')); }
            X.save();
            if ((l.miss || 0) >= 2) setTimeout(function () { E('놓친 손', 'f'); }, 50);
            return h;
        }
    };
}
L.K.s4iso = function () {
    const pg = p0('빈 격리실');
    L.draw('빈 격리실', L.txt(pg.x), X.btn('넣고 문을 잠근다.', 'WONDER.JS.s4(0)') + X.btn('손을 잡고 지나간다.', 'WONDER.JS.s4(1)'));
};
J.s4 = function (k) {
    if (k === 0) return E('잠긴 문', 'd');
    lk().take = 1; X.save(); L.next(true);
};
L.K.j_s4end = function () { E('오래오래', 'w'); L.draw('—', '', X.waitHtml('_none', '…')); };

// ==========================================
// T1 숨은 술래
// ==========================================
function t1visits(r) {
    const p = plan();
    if (p.mem.indexOf(p.seek) < 0) return p.t1v[r];
    const v = val(L.votes('t1s' + r)[p.seek]);
    return v ? String(v).split(',').map(Number) : p.t1v[r];
}
function t1ex(r) { return ((L.x().t1ex) || {})[r] || null; }
function t1hiders(r) { const p = plan(); return alive().filter(function (c) { return c !== p.seek && c !== t1ex(r); }); }
function t1done() { return !!L.x().t1caught; }
L.K.t1hide = function (step, i) {
    if (t1done()) { L.goStep(i + 1); return; }
    const r = step.r;
    const p = plan();
    const s = st(), l = lk();
    const key = 't1h' + r;
    const m = L.votes(key);
    const seekIsMe = p.seek === ME();
    const hiders = t1hiders(r);
    const who = hiders.concat(p.mem.indexOf(p.seek) >= 0 && alive().indexOf(p.seek) >= 0 ? [p.seek] : []);
    const pg = scn('숨는다');
    const show = function (c) { return c === '술래의 화면' && seekIsMe; };
    const x = paras(pg.p[0].x).filter(function (q) { const mm = q.match(/^<i>\(([^)]*)\)<\/i>/); return !mm || show(mm[1]); }).map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>')
        + '<div class="wd-sys">숨바꼭질 ' + (r + 1) + ' / 4 · 발각 ' + (l.found || 0) + ' / 2</div>';
    if (t1ex(r) === ME()) { L.draw('격리실', '당신은 격리실 안에 있다. 이번 숨바꼭질은 문 너머로 듣기만 한다.', X.btn('계속 간다.', 'WONDER.lkNext()')); return; }
    if (seekIsMe) {
        const v = L.votes('t1s' + r)[ME()];
        if (v == null) {
            s.sp = s.sp || [];
            L.draw('술래', x + '<div class="wd-sys">두 곳을 고릅니다 (' + s.sp.length + ' / 2)</div>', PLACES.map(function (n, k) { return s.sp.indexOf(k) >= 0 ? '' : X.btn(n, 'WONDER.JS.t1s(' + k + ')'); }).join(''));
            return;
        }
    } else if (m[ME()] == null) {
        let b = placeBtns('WONDER.JS.t1h');
        if (s.peek == null && p.mem.indexOf(p.seek) < 0 && X.has && X.has('홍등 성냥')) b += X.btn('🔥 홍등 성냥을 긋는다. <span style="font-size:10px;color:#d4af37;">(술래가 열 곳 하나를 미리 본다)</span>', 'WONDER.JS.t1peek(' + r + ')');
        L.draw('숨는다', x + (s.peek != null ? '<div class="wd-sys">🔥 그림자가 「' + PLACES[s.peek] + '」 쪽으로 먼저 갑니다.</div>' : ''), b);
        return;
    }
    const sm = L.votes('t1s' + r);
    const ready = hiders.every(function (c) { return m[c] != null; }) && (p.mem.indexOf(p.seek) < 0 || alive().indexOf(p.seek) < 0 || sm[p.seek] != null);
    if (!ready) { L.draw('숨는다', x, L.waitList(Object.assign({}, m, sm), who)); return; }
    const v = t1visits(r);
    if (!seekIsMe && !s.res) {
        const mine = val(m[ME()]);
        const hit = v.indexOf(mine) >= 0;
        if (hit && !s.bellAsk && X.has && X.has('작은 방울')) {
            L.draw('숨는다', '“……열.”<br><br>문이 열리려 한다. 당신이 숨은 곳이다.', X.btn('🔔 작은 방울을 울린다. <span style="font-size:10px;color:#d4af37;">(이번 발각을 없던 일로)</span>', 'WONDER.JS.t1bell(1)') + X.btn('숨을 참는다.', 'WONDER.JS.t1bell(0)'));
            return;
        }
        s.res = (hit && !s.bell) ? 'found' : 'safe';
        s.gt = '';
        if (s.res === 'found') {
            l.found = (l.found || 0) + 1;
            L.pub('x/t1f/' + ME(), l.found);
            if (l.found >= 2) { s.gt = J.addInf(60 - J.inf(), '두 번 발각'); }
            else s.gt = J.addInf(20, '발각');
        }
        X.save();
    }
    let out = '이번에 열린 곳 — ' + v.map(function (k) { return PLACES[k]; }).join(' · ');
    if (!seekIsMe) out = (s.res === 'found' ? '문이 열린다. 누군가 내려다본다. 입 모양만 움직인다. “한 번.”' : (s.bell ? '🔔 작은 방울이 먼저 울렸다. 문 앞의 발소리가 그쪽으로 돌아선다.<br><br>' : '') + '당신이 숨은 곳은 열리지 않았다.') + '<div class="wd-sys">' + out + '</div>' + (s.gt || '');
    else {
        const caught = hiders.filter(function (c) { return v.indexOf(val(m[c])) >= 0; });
        out = '문을 연다. ' + (caught.length ? caught.map(L.name).map(esc).join(', ') + josa(L.name(caught[caught.length - 1]), '이', '가') + ' 거기 있다.' : '아무도 없다.') + '<div class="wd-sys">' + out + '</div>';
    }
    L.draw('숨는다', out, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.t1h = function (k) { const r = L.def().steps[F().lk.i].r; if (L.votes('t1h' + r)[ME()] == null) L.vote('t1h' + r, k); };
J.t1s = function (k) {
    const r = L.def().steps[F().lk.i].r;
    const s = st();
    s.sp = (s.sp || []).concat([k]);
    if (s.sp.length >= 2) L.vote('t1s' + r, s.sp.join(','));
    X.save(); X.view();
};
J.t1peek = function (r) {
    const s = st();
    if (s.peek != null || !X.spend('홍등 성냥')) return;
    const v = plan().t1v[r];
    s.peek = v[Math.floor(Math.random() * 2)];
    X.save(); X.view();
};
J.t1bell = function (k) { const s = st(); if (s.bellAsk) return; s.bellAsk = 1; if (k && X.spend('작은 방울')) s.bell = 1; X.save(); X.view(); };
function t1vote(r) {
    return {
        k: 'jteam', id: 't1v' + r, title: '둘러선다',
        skip: function () { return t1done(); },
        text: function () {
            const pg = scn('둘러선다');
            return L.txt(pg.p[0].x) + '<div class="wd-sys">격리 투표 ' + (r + 1) + ' / 3 · 엉뚱한 격리 ' + t1wrong() + ' / 2</div>';
        },
        opts: function () {
            return memOpts('', function (nm) { return '격리한다 — ' + esc(nm); }, npcs()).concat([{ l: '아무도 남기지 않는다.', v: 'none' }]);
        },
        mineTxt: function (v) { v = val(v); return v === 'none' ? '「아무도 남기지 않는다」' : esc(L.name(v)) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const p = plan();
            const t = L.tally(m);
            const w = t.win || 'none';
            if (w === p.seek) { L.tx('x/t1caught', function (c) { return c || 1; }); return { end: ['격리', 'd'] }; }
            if (w !== 'none') {
                L.tx('x/t1w/' + r, function (c) { return c || w; });
                if (p.mem.indexOf(w) >= 0) L.tx('x/t1ex/' + (r + 1), function (c) { return c || w; });
                if (t1wrong() + (((L.x().t1w) || {})[r] ? 0 : 1) >= 2) return { end: ['엉뚱한 격리', 'f'] };
                return { html: esc(L.name(w)) + josa(L.name(w), '이', '가') + ' 격리실로 들어간다. 문이 닫힌다. 두드리는 소리가 따라온다. 숫자 세는 소리는 그치지 않는다.' };
            }
            return { html: '아무도 남기지 않는다. 다들 서로의 소매를 본다.' };
        }
    };
}
function t1wrong() { const w = L.x().t1w || {}; return Object.keys(w).filter(function (k) { return w[k]; }).length; }
L.K.t1end = function () {
    const p = plan();
    const twice = p.mem.filter(function (c) { return (((L.x().t1f) || {})[c] || 0) >= 2 || J.infOf(c) >= 60; });
    if (twice.length) E('술래의 친구들', 'f');
    else E('진 술래', 'w');
    L.draw('—', '네 번째 숫자가 끝난다.', X.waitHtml('_none', '…'));
};

// ==========================================
// T2 새 부적
// ==========================================
function t2done() { return !!L.x().t2end; }
function t2tgt(r) { return ((L.x().t2t) || {})[r]; }
function t2suspect(c) {
    const p = plan();
    if (c === 'suit') return false;
    if (/^n\d$/.test(c)) return c === p.hid;
    return J.infOf(c) >= 30;
}
function t2vote(r) {
    return {
        k: 'jteam', id: 't2v' + r, title: '누구에게 붙이나',
        skip: function () { return t2done() || (r > 0 && t2tgt(r - 1) && t2tgt(r - 1) !== 'later' && !((L.x().t2miss || {})[r - 1])); },
        text: function () {
            const p = plan();
            return (r === 0 ? '방호복이 일행을 따라온다. 열쇠가 찰랑 운다.<br><br>' : '') + '노란 종이는 ' + esc(L.name(p.holder)) + josa(L.name(p.holder), '이', '가') + ' 들고 있다. 한 장뿐이다.'
                + '<div class="wd-sys">붙이기 투표 ' + (r + 1) + ' / 3' + (r === 2 ? ' — 이번에는 반드시 정합니다' : '') + '<br>「감염 의심자」는 감염도 30 이상인 사람입니다.</div>';
        },
        opts: function () {
            return [{ l: '표찰 없는 방호복에게', v: 'suit' }].concat(memOpts('', function (nm) { return esc(nm) + '에게'; }, npcs()))
                .concat(r < 2 ? [{ l: '아직.', v: 'later' }] : []);
        },
        mineTxt: function (v) { v = val(v); return v === 'later' ? '「아직」' : esc(L.name(v)) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const p = plan();
            const t = L.tally(m);
            let w = t.win || (r < 2 ? 'later' : val(m[p.holder]) || 'suit');
            if (w === 'later' && r === 2) w = 'suit';
            L.tx('x/t2t/' + r, function (c) { return c || w; });
            return { html: w === 'later' ? '아직 정하지 않는다. 종이가 품 안에서 따뜻하다.' : '정했다 — ' + esc(L.name(w)) + '.' };
        }
    };
}
function t2stick(r) {
    return {
        k: 't2stick', r: r
    };
}
L.K.t2stick = function (step, i) {
    const r = step.r;
    const p = plan();
    const tg = t2tgt(r);
    if (t2done() || !tg || tg === 'later') { L.goStep(i + 1); return; }
    if (((L.x().t2miss) || {})[r] && r < 2) { L.goStep(i + 1); return; }
    const s = st();
    const pg = p0('붙이러 간다');
    const show = function (c) { return (c === '방호복에게' && tg === 'suit') || (c === '사람에게' && tg !== 'suit'); };
    const x = paras(pg.x).filter(function (q) { const mm = q.match(/^<i>\(([^)]*)\)<\/i>/); return !mm || show(mm[1]); }).map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
    if (p.holder !== ME()) {
        L.draw('붙이러 간다', esc(L.name(p.holder)) + josa(L.name(p.holder), '이', '가') + ' 종이를 들고 ' + esc(L.name(tg)) + '에게 다가간다.', X.waitHtml('_none', '숨을 죽이고 지켜봅니다…'));
        return;
    }
    if (s.r && !s.r.ok) {
        L.draw('붙이러 간다', X.rollHtml(s.r) + '손이 미끄러진다. 종이가 이마에 닿지 않았다.' + (s.gt || ''),
            r < 2 ? X.btn('물러선다. 다음에 다시 정한다.', 'WONDER.JS.t2miss(' + r + ')') : X.btn('다시 붙인다. <span style="font-size:10px;color:#888;">(근접 판정)</span>', 'WONDER.JS.t2go(' + r + ')'));
        return;
    }
    L.draw('붙이러 간다', x, X.btn('붙인다. <span style="font-size:10px;color:#888;">(근접 판정)</span>', 'WONDER.JS.t2go(' + r + ')'));
};
J.t2go = function (r) {
    const s = st();
    const tg = t2tgt(r);
    const res = J.roll(0, 'subdue');
    s.r = res;
    if (res.ok) {
        L.tx('x/t2end', function (c) { return c || 1; });
        if (tg === 'suit') return E('멈춘 술래', 'w');
        if (t2suspect(tg)) return E('격리 성공', 'd');
        return E('엉뚱한 표찰', 'f');
    }
    s.gt = J.addInf(30, '붙이러 가다');
    X.save(); X.view();
};
J.t2miss = function (r) { L.tx('x/t2miss/' + r, function (c) { return c || 1; }); L.next(true); };

// ==========================================
// T3 방울이 울리는 집
// ==========================================
const T3_INF = ['문틈 아래로 그림자가 보인다. 발이 둘. 가지런히 모여 있다.', '두드리는 박자가 정확하다. 똑똑. 똑똑. 너무 정확하다.', '“저 근무자예요. 명찰 보여 드릴까요?” 문틈으로 명찰이 밀려 들어온다. 사진 칸이 비어 있다.', '숨소리가 들리지 않는다. 문에 귀를 대도.'];
const T3_HUM = ['문틈 아래로 그림자가 보인다. 발이 하나씩 번갈아 움직인다. 제자리걸음이다.', '두드리는 박자가 엉망이다. 똑, 똑똑. 똑.', '“저 근무자예요.” 명찰이 밀려 들어온다. 사진 속 얼굴이 땀에 젖어 있다. 지금 문밖의 목소리와 같은 얼굴이다.', '숨소리가 들린다. 거칠다. 사람의 숨이다.'];
function t3keeper(r) { const a = alive(); const p = plan(); const list = p.mem.filter(function (c) { return a.indexOf(c) >= 0; }); return list[r % Math.max(1, list.length)]; }
function t3rang() { const x = L.x(); return Object.keys(x.t3rang || {}).filter(function (k) { return (x.t3rang || {})[k]; }).length; }
function t3def(r) {
    return {
        k: 'jteam', id: 't3d' + r, title: '탕비실 — ' + (r + 1) + ' / 4',
        text: function () {
            const keeper = t3keeper(r);
            return (r === 0 ? L.txt(p0('지침').x).split('<br><br>').slice(0, 1).join('') + '<br><br>' : '') + '사이렌이 울린다. 우우우—<br><br>문 위의 방울이 따라 떤다.'
                + '<div class="wd-sys">방울지기 — ' + esc(L.name(keeper)) + (keeper === ME() ? ' (당신)' : '') + ' · 나머지는 바리케이드<br>방울이 울린 횟수 ' + t3rang() + (t3rang() ? ' — 이번 라운드 바리케이드 판정 −2' : '') + ' · 뚫린 라운드 ' + t3breach() + ' / 2</div>';
        },
        opts: function () {
            const keeper = t3keeper(r) === ME();
            const o = [{ l: keeper ? '방울을 움켜쥐고 버틴다. <span style="font-size:10px;color:#888;">(판정)</span>' : '바리케이드를 민다. <span style="font-size:10px;color:#888;">(판정)</span>', v: keeper ? 'keep' : 'bar', roll: function () { return keeper ? 0 : (t3rang() ? -2 : 0) + 3; } }];
            if (X.has && X.has('대나무 피리')) o.push({ l: '🎋 대나무 피리를 분다. <span style="font-size:10px;color:#d4af37;">(이번 라운드 판정 없이)</span>', v: keeper ? 'keep' : 'bar', auto: 1, spend: '대나무 피리' });
            return o;
        },
        mineTxt: function (v) { return (v && v.ok ? '버텼습니다' : '밀렸습니다') + (v && v.auto ? ' (대나무 피리)' : ''); },
        once: function (m) { const v = m[ME()]; return (v && !v.ok) ? J.addInf(10, '방어전') : ''; },
        resolve: function (m) {
            const keeper = t3keeper(r);
            const kv = m[keeper];
            if (kv && !kv.ok) L.tx('x/t3rang/d' + r, function (c) { return c || 1; });
            const bars = Object.keys(m).filter(function (c) { return c !== keeper; });
            const breached = bars.length && bars.every(function (c) { return !m[c].ok; });
            if (breached) L.tx('x/t3br/' + r, function (c) { return c || 1; });
            const nb = t3breach() + (breached && !((L.x().t3br || {})[r]) ? 1 : 0);
            if (nb >= 2) return { end: ['뚫린 문', 'f'] };
            return { html: (kv && !kv.ok ? '방울지기의 손이 미끄러진다. 딸랑.' : '방울은 손바닥 안에서 조용하다.') + '<br><br>' + (breached ? '바리케이드가 한 뼘 밀린다. 문틈으로 손가락들이 들어온다.' : '바리케이드가 버틴다.') };
        }
    };
}
function t3breach() { const b = L.x().t3br || {}; return Object.keys(b).filter(function (k) { return b[k]; }).length; }
function t3door(r) {
    return {
        k: 'jteam', id: 't3o' + r, title: '문밖',
        text: function () {
            const p = plan();
            const idx = (p.mem.indexOf(ME()) + r) % 4;
            const clue = p.out[r] ? T3_INF[idx] : T3_HUM[idx];
            return '똑똑.<br><br>“문 좀 열어 주세요. 저 감염 안 됐어요.”<br><br>' + clue + '<br><br>방울을 쥔 손이 저린다.<div class="wd-sys">사람마다 보이는 단서가 다릅니다. 채팅으로 나누세요.</div>';
        },
        opts: function () { return [{ l: '연다.', v: 'open' }, { l: '열지 않는다.', v: 'shut' }]; },
        mineTxt: function (v) { return val(v) === 'open' ? '「연다」' : '「열지 않는다」'; },
        resolve: function (m) {
            const p = plan();
            const t = L.tally(m);
            if (t.win !== 'open') return { html: '문을 열지 않는다. 두드리는 소리가 한참 이어지다 멎는다.' };
            L.tx('x/t3rang/o' + r, function (c) { return c || 1; });
            L.tx('x/t3in/' + r, function (c) { return c || 1; });
            if (p.out[r]) return { end: ['들인 손님', 'f'] };
            return { html: '문을 연다. 방울이 한 번 운다. 딸랑. 그 사람이 들어와 벽에 등을 대고 앉는다. 숨이 거칠다. 사람의 숨이다.' };
        }
    };
}
L.K.t3end = function () {
    const p = plan();
    const inn = L.x().t3in || {};
    const allIn = p.out.every(function (inf, r) { return inf || inn[r]; }) && p.out.some(function (inf) { return !inf; });
    E(allIn ? '열린 문' : '쉬는 날', allIn ? 'd' : 'w');
    L.draw('—', '네 번째 사이렌이 끝난다.', X.waitHtml('_none', '…'));
};

// ==========================================
// T4 걸어간 종이 인형
// ==========================================
function t4mine() {
    const p = plan();
    const g = p.groups[0].indexOf(ME()) >= 0 ? 0 : 1;
    const grp = p.groups[g];
    const k = grp.indexOf(ME());
    const ids = [];
    for (let j = 0; j < 6; j++) if (j % grp.length === k) ids.push(g * 6 + j);
    return { g: g, ids: ids };
}
L.K.t4split = function () {
    const p = plan();
    const me = t4mine();
    L.draw('창고', L.txt(p0('지침').x).split('<br><br>').slice(-1)[0] + '<div class="wd-sys">당신의 조 — 창고 ' + (me.g ? '서쪽' : '동쪽') + ' (' + p.groups[me.g].map(L.name).map(esc).join(', ') + ') · 맡은 형체 ' + me.ids.length + '개<br>두드릴 때마다 남은 시간 −1분. 감염자의 비닐을 걷으면 끝납니다.</div>',
        X.btn('창고 ' + (me.g ? '서쪽' : '동쪽') + '으로 간다.', 'WONDER.lkNext()'));
};
const T4_T = { doll: '인형', surv: '생존자', inf: '감염자' };
L.K.t4fig = function (step, i) {
    const p = plan();
    const me = t4mine();
    const s = st();
    s.k = s.k || 0;
    if (s.k >= me.ids.length) { L.draw('창고', '맡은 형체를 다 지났다. 합류할 자리로 간다.' + t4known(), X.btn('합류하러 간다.', 'WONDER.lkNext()')); return; }
    const id = me.ids[s.k];
    const pg = p0('창고');
    const ps = paras(pg.x);
    let x = '<div class="wd-sys">형체 ' + (s.k + 1) + ' / ' + me.ids.length + '</div>' + ps.filter(function (q) { return !/^<i>\(/.test(q); }).join('<br><br>');
    if (s.tap === id) {
        const type = p.fig[id];
        const lab = { doll: '인형', surv: '생존자', inf: '감염자' }[type];
        const q = ps.find(function (q2) { return q2.indexOf('<i>(' + lab + ')</i>') === 0; }) || '';
        x = '<div class="wd-sys">형체 ' + (s.k + 1) + ' / ' + me.ids.length + '</div>두드린다.<br><br>' + q.replace(/^<i>\([^)]*\)<\/i>\s*/, '');
        L.draw('창고', x, X.btn('걷는다.', 'WONDER.JS.t4(0)') + X.btn('지나간다.', 'WONDER.JS.t4(2)'));
        return;
    }
    L.draw('창고', x, X.btn('걷는다.', 'WONDER.JS.t4(0)') + X.btn('두드린다. <span style="font-size:10px;color:#888;">(남은 시간 −1분)</span>', 'WONDER.JS.t4(1)') + X.btn('지나간다.', 'WONDER.JS.t4(2)'));
};
J.t4 = function (k) {
    const p = plan();
    const me = t4mine();
    const s = st();
    const id = me.ids[s.k];
    if (k === 1) {
        s.tap = id;
        L.addTime(-60000);
        L.tx('x/t4k/' + id, function (c) { return c || 'tap'; });
        X.save(); return X.view();
    }
    if (k === 0) {
        if (p.fig[id] === 'inf') return E('걷힌 비닐', 'f');
        L.tx('x/t4k/' + id, function () { return 'open'; });
    }
    s.k++; s.tap = null;
    X.save(); X.view();
};
function t4known() {
    const p = plan();
    const k = L.x().t4k || {};
    const dolls = Object.keys(k).filter(function (id) { return p.fig[id] === 'doll'; }).length;
    const survAll = p.fig.filter(function (t) { return t === 'surv'; }).length;
    const survOpen = Object.keys(k).filter(function (id) { return p.fig[id] === 'surv' && k[id] === 'open'; }).length;
    return '<div class="wd-note" style="border-color:#3a2a2a;">알아낸 인형 ' + dolls + ' / 3 · 비닐을 걷어 찾아낸 생존자 ' + survOpen + ' / ' + survAll + '</div>';
}
const T4_FINAL = {
    k: 'jteam', id: 't4f', title: '합류',
    text: function () { return '두 조가 창고 가운데에서 다시 만난다. 서로 두드려 들은 소리를 맞춰 본다.' + t4known(); },
    opts: function () {
        const p = plan();
        const k = L.x().t4k || {};
        const dolls = Object.keys(k).filter(function (id) { return p.fig[id] === 'doll'; }).length;
        const survAll = p.fig.filter(function (t) { return t === 'surv'; }).length;
        const survOpen = Object.keys(k).filter(function (id) { return p.fig[id] === 'surv' && k[id] === 'open'; }).length;
        return [{ l: '인형 셋만 데려간다.', v: 'doll', off: dolls < 3 }, { l: '찾아낸 사람들을 데려간다.', v: 'surv', off: survOpen < survAll }, { l: '아무것도 데려가지 않고 나간다.', v: 'none' }];
    },
    mineTxt: function (v) { return { doll: '「인형 셋」', surv: '「찾아낸 사람들」', none: '「빈손」' }[val(v)]; },
    resolve: function (m) {
        const t = L.tally(m);
        if (t.win === 'doll') return { end: ['돌아온 인형', 'w'] };
        if (t.win === 'surv') return { end: ['찾아낸 사람들', 'd'] };
        return { end: ['시간 초과', 'f'] };
    }
};

// ==========================================
// T5 연꽃 등불
// ==========================================
J.bearer = function () {
    const x = L.x();
    let b = null;
    [0, 1, 2].forEach(function (k) { if ((x.t5b || {})[k]) b = x.t5b[k]; });
    return b;
};
function fireBar() {
    const x = L.x();
    const f = x.t5fire == null ? 10 : x.t5fire;
    return '<div class="wd-sys">소각로 불 세기 <span style="color:#ff9800;">' + '■'.repeat(Math.max(0, f)) + '</span>' + '□'.repeat(Math.max(0, 10 - f)) + ' ' + f + ' / 10'
        + (x.t5out ? ' — 꺼짐' : '') + ' · 등 안의 불씨 ' + (x.t5ember ? '🔥' : '없음') + (J.bearer() ? ' · 등을 든 사람 ' + esc(L.name(J.bearer())) : '') + '</div>';
}
function t5vote(r) {
    return {
        k: 'jteam', id: 't5v' + r, title: '누가 등을 드나',
        text: function () { return (r === 0 ? L.txt(p0('지침').x).split('<br><br>').slice(-1)[0] + '<br><br>' : '') + '빈 연꽃 등을 누가 들지 정한다. 등을 든 사람은 빛이 나서 눈에 띈다 — 은신 · 회피 −3.' + fireBar(); },
        opts: function () { return memOpts('', function (nm) { return esc(nm); }); },
        mineTxt: function (v) { return esc(L.name(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const t = L.tally(m);
            const w = t.win || J.bearer() || plan().mem[0];
            L.tx('x/t5b/' + r, function (c) { return c || w; });
            return { html: esc(L.name(w)) + josa(L.name(w), '이', '가') + ' 등을 든다.' + (L.x().t5ember ? '<br><br>' + L.txt(p0('등을 든 사람').x) : '') };
        }
    };
}
function t5take(r) {
    return {
        k: 'jteam', id: 't5k' + r, title: '소각로',
        skip: function () { const x = L.x(); return !!x.t5out || !!x.t5ember || (x.t5fire == null ? 10 : x.t5fire) < 3; },
        text: function () { return L.txt(p0('소각로').x) + fireBar(); },
        opts: function () { return [{ l: '불씨를 던다. <span style="font-size:10px;color:#888;">(불 세기 −3)</span>', v: 'take' }, { l: '문을 닫아 둔다.', v: 'keep' }]; },
        mineTxt: function (v) { return val(v) === 'take' ? '「던다」' : '「닫아 둔다」'; },
        resolve: function (m) {
            const t = L.tally(m);
            if (t.win !== 'take') return { html: '문을 닫아 둔다. 원 안쪽이 따뜻하다.' + fireBar() };
            if (!((L.x().t5tk || {})[r])) {
                L.tx('x/t5tk/' + r, function (c) { return c || 1; });
                L.tx('x/t5fire', function (c) { return (c == null ? 10 : c) - 3; });
                L.tx('x/t5ember', function () { return true; });
                L.tx('x/t5took', function () { return true; });
                return { wait: true };
            }
            return { html: '문을 연다. 열기가 얼굴을 친다. 불씨 하나를 덜어 등에 담는다.' + fireBar() };
        }
    };
}
function t5def(r) {
    return {
        k: 'jteam', id: 't5d' + r, title: '방어전 — 소각로 앞 ' + (r + 1) + ' / 2',
        skip: function () { return !!L.x().t5out; },
        text: function () { return '원 바깥에 발자국이 늘어난다. 저것들이 분필 선 앞에서 머뭇거린다. 불 세기가 낮을수록 선이 흐려진다.' + fireBar(); },
        opts: function () {
            const x = L.x();
            const f = x.t5fire == null ? 10 : x.t5fire;
            const pen = f >= 7 ? 0 : f >= 4 ? -2 : -4;
            const o = [{ l: '선을 지킨다. <span style="font-size:10px;color:#888;">(판정' + (pen ? ' ' + pen : '') + ')</span>', v: 'hold', roll: function () { return pen; } }];
            if (X.has && X.has('대나무 피리')) o.push({ l: '🎋 대나무 피리를 분다. <span style="font-size:10px;color:#d4af37;">(이번 라운드 판정 없이)</span>', v: 'hold', auto: 1, spend: '대나무 피리' });
            return o;
        },
        mineTxt: function (v) { return v && v.ok ? '버텼습니다' : '밀렸습니다'; },
        once: function (m) { const v = m[ME()]; return (v && !v.ok) ? J.addInf(10, '방어전') : ''; },
        resolve: function (m) {
            const who = Object.keys(m);
            const fail = who.filter(function (c) { return !m[c].ok; }).length;
            if (fail * 2 > who.length) {
                L.tx('x/t5out', function () { return true; });
                return { html: '선이 무너진다. 발자국들이 원 안으로 들어와 소각로 문을 두드린다. 창의 불빛이 꺼진다.' };
            }
            return { html: '원 바깥의 것들이 물러난다.' + fireBar() };
        }
    };
}
function t5room(n) {
    return {
        k: 'jroom', n: n,
        after: function (s, r) {
            if (J.bearer() !== ME() || !L.x().t5ember || r.ok) return '';
            const lr = X.roll(0);
            if (lr.ok) return '<div class="wd-sys">행운 판정 ' + lr.total + ' / 16 — 등 안의 불씨가 버텼습니다.</div>';
            L.tx('x/t5ember', function () { return false; });
            return '<div class="wd-sys" style="color:#f44336;">행운 판정 ' + lr.total + ' / 16 — 불씨가 꺼졌습니다.</div>';
        }
    };
}
L.K.j_t5end = function () {
    const x = L.x();
    const b = J.bearer();
    if (b && J.infOf(b) >= 60) E('빛나는 눈', 'f');
    else if (x.t5ember) E('다시 켜진 연못', 'w');
    else if (!x.t5out) E('지켜진 불', 'd');
    else E('꺼진 불', 'f');
    L.draw('—', '', X.waitHtml('_none', '…'));
};

// ==========================================
// T6 새 술래 뽑기
// ==========================================
function t6seek() { return L.x().t6seek || null; }
L.K.t6pick = function (step, i) {
    const x = L.x();
    if (x.t6seek) { L.goStep(i + 1); return; }
    const a = x.t6a || 0;
    const key = 't6p' + a;
    const m = L.votes(key);
    const who = alive();
    const text = L.txt(p0('지침').x) + '<div class="wd-sys">새 술래 뽑기 · 격리 대상 선정' + (a ? ' — 동률, 다시 (' + (a + 1) + ' / 3)' : '') + '</div>';
    if (m[ME()] == null) { L.draw('투표', text, memOpts('', function (nm) { return esc(nm); }).map(function (o) { return X.btn(o.l, "WONDER.JS.t6v('" + key + "','" + o.v + "')"); }).join('')); return; }
    if (!who.every(function (c) { return m[c] != null; })) { L.draw('투표', text, L.waitList(m, who)); return; }
    const t = L.tally(m);
    if (t.win) { L.tx('x/t6seek', function (c) { return c || t.win; }); L.draw('투표', text, X.waitHtml('_none', '…')); return; }
    if (a + 1 >= 3) { E('세 번의 동률', 'f'); L.draw('투표', text, X.waitHtml('_none', '…')); return; }
    L.tx('x/t6a', function (c) { return (c || 0) === a ? a + 1 : c; });
    L.draw('투표', text, X.waitHtml('_none', '다시 투표합니다…'));
};
J.t6v = function (key, v) { if (L.votes(key)[ME()] == null) L.vote(key, v); };
function t6found() { return L.x().t6f || {}; }
function t6hiders() { const sk = t6seek(); const f = t6found(); return alive().filter(function (c) { return c !== sk && !f[c]; }).concat(npcs().filter(function (c) { return !f[c]; })); }
L.K.t6turn = function (step, i) {
    const r = step.r;
    const sk = t6seek();
    const x = L.x();
    if (x.t6over) { L.goStep(i + 1); return; }
    const key = 't6t' + r;
    const m = L.votes(key);
    const f = t6found();
    const pg = p0('뽑힌 사람');
    const s = st();
    const helpers = alive().filter(function (c) { return f[c]; });
    const head = '<div class="wd-sys">턴 ' + (r + 1) + ' / 4 · 술래 ' + esc(L.name(sk)) + (helpers.length ? ' · 함께 찾는 사람 ' + helpers.map(L.name).map(esc).join(', ') : '') + ' · 남은 숨은 사람 ' + t6hiders().length + '</div>';
    const show = function (c) { return (c === '술래의 화면' && sk === ME()) || (c === '숨은 사람의 화면' && sk !== ME() && !f[ME()]); };
    const txt = paras(pg.x).filter(function (q) { const mm = q.match(/^<i>\(([^)]*)\)<\/i>/); return !mm || show(mm[1]); }).map(function (q) { return q.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>') + head;
    if (m[ME()] == null) {
        let b;
        if (sk === ME()) {
            s.sp = s.sp || [];
            if (s.search) b = PLACES.map(function (n, k) { return s.sp.indexOf(k) >= 0 ? '' : X.btn(n + '을(를) 연다.', 'WONDER.JS.t6s(' + k + ')'); }).join('') + '<div class="wd-sys">두 곳을 고릅니다 (' + s.sp.length + ' / 2)</div>';
            else b = X.btn('벽에 이마를 대고 센다. <span style="font-size:10px;color:#888;">(찾는다)</span>', 'WONDER.JS.t6search()') + X.btn('침대에 앉는다. <span style="font-size:10px;color:#888;">(남는다)</span>', "WONDER.JS.t6x('stay')");
        } else if (f[ME()]) b = PLACES.map(function (n, k) { return X.btn('함께 찾는다 — ' + n, "WONDER.JS.t6x('p:" + k + "')"); }).join('');
        else b = PLACES.map(function (n, k) { return X.btn(n + '에 숨는다.', "WONDER.JS.t6x('h:" + k + "')"); }).join('');
        L.draw('숨바꼭질', txt, b);
        return;
    }
    const who = alive();
    if (!who.every(function (c) { return m[c] != null; })) { L.draw('숨바꼭질', txt, L.waitList(m, who)); return; }
    // 정리 — 같은 값을 누구나 같은 방식으로 센다
    const p = plan();
    const sv = String(val(m[sk]) || 'stay');
    let opened = [];
    let stayed = sv === 'stay';
    if (!stayed) {
        opened = sv.slice(2).split(',').map(Number);
        helpers.forEach(function (c) { const v = String(val(m[c]) || ''); if (/^p:/.test(v)) opened.push(+v.slice(2)); });
    }
    const caught = [];
    if (!stayed) {
        alive().forEach(function (c) { if (c === sk || f[c]) return; const v = String(val(m[c]) || ''); if (/^h:/.test(v) && opened.indexOf(+v.slice(2)) >= 0) caught.push(c); });
        npcs().forEach(function (c) { if (!f[c] && opened.indexOf(p.t6n[r][+c.slice(1)]) >= 0) caught.push(c); });
    }
    if (!s.done) {
        s.done = 1;
        if (stayed) L.tx('x/t6stay/' + r, function (c) { return c || 1; });
        caught.forEach(function (c) { L.tx('x/t6f/' + c, function (v) { return v || (r + 1); }); });
        if (caught.indexOf(ME()) >= 0) { const z = J.roll(0); s.gt = '<div class="wd-sys">감염 판정 ' + z.total + ' / 16</div>' + (z.ok ? '' : J.addInf(10, '들킴')); }
        X.save();
    }
    const left = t6hiders().filter(function (c) { return caught.indexOf(c) < 0; });
    if (!stayed && !left.length) { L.tx('x/t6over', function (c) { return c || 1; }); E('다음엔 우리가', 'w'); }
    const res = stayed ? '숫자 세는 소리가 들리지 않는다. 이번 턴은 아무도 찾으러 오지 않는다.'
        : '숫자 세는 소리. “……열.”<br><br>열린 곳 — ' + opened.map(function (k) { return PLACES[k]; }).join(' · ') + '<br><br>' + (caught.length ? caught.map(L.name).map(esc).join(', ') + josa(L.name(caught[caught.length - 1]), '이', '가') + ' 들켰다.' : '아무도 없다.');
    L.draw('숨바꼭질', res + (s.gt || '') + head, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.t6search = function () { st().search = 1; X.save(); X.view(); };
J.t6s = function (k) { const s = st(); s.sp = (s.sp || []).concat([k]); if (s.sp.length >= 2) J.t6x('s:' + s.sp.join(',')); X.save(); X.view(); };
J.t6x = function (v) { const r = L.def().steps[F().lk.i].r; if (L.votes('t6t' + r)[ME()] == null) L.vote('t6t' + r, v); };
L.K.t6end = function () {
    const x = L.x();
    if (x.t6over) { L.draw('—', '', X.waitHtml('_none', '…')); return; }
    const stays = Object.keys(x.t6stay || {}).length;
    if (stays >= 4) E('격리 성공', 'd');
    else E('반만 찾음', 'f');
    L.draw('—', '', X.waitHtml('_none', '…'));
};

// ==========================================
// T7 별당의 저녁
// ==========================================
const T7_REC = ['근무 인원표', '검사 기록지', '마지막 무전 기록', '격리 지시서', '폐기 명단'];
const T7_Q = [
    { q: '“이름이 뭡니까.”', at: 0 }, { q: '“언제부터 여기 있었습니까.”', at: 2 }, { q: '“배가 고픕니까.”', at: 1 }, { q: '“밖에 누가 기다립니까.”', at: 3 }
];
function t7answers() {
    const ps = (scn('문틈 대화').p[0].o || []).map(function (o) { return o.l; });
    return ps.map(function (l) { return l.replace(/\s*<i>\(→[^)]*\)<\/i>/, '').replace(/^“[^”]*”\s*—\s*/, ''); });
}
function t7used(n) { const u = []; for (let k = 0; k < n; k++) { const t = L.tally(L.votes('t7q' + k)); if (t.win != null) u.push(+t.win); } return u; }
function t7talk(n) {
    return {
        k: 'jteam', id: 't7q' + n, title: '문틈 대화 ' + (n + 1) + ' / 3',
        text: function () { return (n === 0 ? L.txt(p0('0번의 방').x) + '<br><br>' : '') + '<div class="wd-sys">질문 하나를 투표로 고릅니다. 대화마다 문 앞에 선 사람 전원이 감염 판정을 칩니다.<br>0번 기록 — ' + T7_REC[L.x().t7loc == null ? plan().t7loc : L.x().t7loc] + ' 자리</div>'; },
        opts: function () { const used = t7used(n); return T7_Q.map(function (q, k) { return { l: q.q, v: String(k), off: used.indexOf(k) >= 0 }; }); },
        mineTxt: function (v) { return T7_Q[+val(v)].q; },
        once: function () { const z = J.roll(0); return '<div class="wd-sys">감염 판정 ' + z.total + ' / 16</div>' + (z.ok ? '' : J.addInf(10, '문틈')); },
        resolve: function (m) {
            const t = L.tally(m);
            const used = t7used(n);
            let k = t.win != null ? +t.win : [0, 1, 2, 3].filter(function (q) { return used.indexOf(q) < 0; })[0];
            L.tx('x/t7loc', function () { return T7_Q[k].at; });
            if (infected().length) return { end: ['감염', 'f'] };
            return { html: T7_Q[k].q + '<br><br>' + t7answers()[k] + (n === 2 ? '<br><br>배식구 너머가 조용해진다. 기다리는 조용함이다.' : '') + '<div class="wd-sys">0번 기록이 「' + T7_REC[T7_Q[k].at] + '」 자리로 옮겨 갔습니다.</div>' };
        }
    };
}
const T7_FINAL = {
    k: 'jteam', id: 't7f', title: '0번의 방',
    text: function () { return '배식구 너머가 조용하다.<div class="wd-sys">합은 아직 따뜻합니다.</div>'; },
    opts: function () { return [{ l: '배식구로 합을 넣는다.', v: 'feed' }, { l: '기록을 회수한다.', v: 'rec' }, { l: '문을 연다.', v: 'open' }]; },
    mineTxt: function (v) { return { feed: '「합을 넣는다」', rec: '「기록을 회수한다」', open: '「문을 연다」' }[val(v)]; },
    resolve: function (m) {
        const t = L.tally(m);
        const w = t.win || 'feed';
        if (w === 'feed') return { end: ['들여보낸 저녁', 'w'] };
        if (w === 'open') return { end: ['열린 문', 'f'] };
        L.tx('x/t7rec', function (c) { return c || 1; });
        return { html: '기록을 회수하기로 한다. 문 안에서 묻는다. “……밥은요?”' };
    }
};
L.K.t7get = function (step, i) {
    const x = L.x();
    if (!x.t7rec) { L.goStep(i + 1); return; }
    const s = st();
    const p = plan();
    const who = X.leader();
    const loc = T7_REC[x.t7loc == null ? p.t7loc : x.t7loc];
    if (who !== ME()) { L.draw('검역소', esc(L.name(who)) + josa(L.name(who), '이', '가') + ' 「' + loc + '」 자리에서 0번 기록을 찾는다.', X.waitHtml('_none', '…')); return; }
    L.draw('검역소', (s.r ? X.rollHtml(s.r) + (s.r.ok ? '' : '종이가 손끝에서 미끄러진다. 배식구 너머에서 숨소리가 가까워진다.' + (s.gt || '')) : '「' + loc + '」 자리. 종이 사이에 0번 기록이 끼어 있다. 배식구에서 눈을 떼지 않아야 한다.'),
        X.btn('기록을 꺼낸다. <span style="font-size:10px;color:#888;">(응시 판정)</span>', 'WONDER.JS.t7r()'));
};
J.t7r = function () {
    const s = st();
    s.r = J.roll(0);
    if (s.r.ok) return E('회수한 기록', 'd');
    s.gt = J.addInf(10, '응시 실패');
    X.save();
    if (J.inf() >= 60) return E('감염', 'f');
    X.view();
};
L.K.j_t7end = function () { L.draw('—', '', X.waitHtml('_none', '…')); };

// ==========================================
// T8 영원한 놀이 친구
// ==========================================
L.K.t8cut = function () {
    if (!L.x().t8cut) { const tb = L.st().tb || 0; L.tx('x/t8cut', function (c) { return c || { at: Date.now(), tb: tb }; }); }
    L.draw('무전', '무전기가 다시 지직거린다.<br><br>“검역선이 무너졌습니다. 탈출하십시오.”<br><br>남은 시간이 빠르게 줄어든다.<div class="wd-sys">남은 시간 20분 — 탈출로뿐입니다. 탈출로에 선 감염자 ' + (plan().mem.length + 2) + '명.</div>', X.btn('탈출로로 간다.', 'WONDER.lkNext()'));
};
function t8id(seg) { const p = plan(); return seg * p.mem.length + p.mem.indexOf(ME()); }
function t8total() { return plan().mem.length + 2; }
function t8state() { return L.x().t8 || {}; }
L.K.t8seg = function (step, i) {
    const seg = step.n;
    const l = lk();
    const s = st();
    l.tal = l.tal == null ? 2 : l.tal;
    const id = t8id(seg);
    const head = '<div class="wd-sys">탈출로 ' + (seg + 1) + ' / 3 · 남은 부적 ' + l.tal + ' · 끌고 가는 것 ' + (l.drag ? '하나' : '없음') + ' · 마을로 보낸 것 ' + Object.keys(t8state()).filter(function (k) { return t8state()[k] === 'deliv'; }).length + ' / ' + t8total() + '</div>';
    if (!s.go && l.drag) {
        // 구간이 바뀌면 끌던 것을 비닐 너머 마을 쪽으로 넘긴다
        L.tx('x/t8/' + l.drag, function () { return 'deliv'; });
        L.addTime(-120000);
        l.drag = null; s.go = 1; X.save();
        s.note = '<div class="wd-sys">끌고 온 것을 비닐 너머로 넘겼다. 콩, 콩. 마을 쪽으로 간다. (남은 시간 −2분)</div>';
    }
    s.go = 1;
    if (id >= t8total()) {
        L.draw('탈출로', (s.note || '') + '복도에 서 있는 것들이 출구 쪽을 본다. 당신 앞은 비어 있다.' + head, X.btn('계속 간다.', 'WONDER.lkNext()'));
        return;
    }
    const pg = p0('탈출로');
    if (!s.r) {
        let b = '';
        if (l.tal > 0) b += X.btn('부적을 붙인다. <span style="font-size:10px;color:#888;">(근접 판정)</span>', 'WONDER.JS.t8(0)');
        b += X.btn('지나간다. <span style="font-size:10px;color:#888;">(회피 판정)</span>', 'WONDER.JS.t8(1)');
        L.draw('탈출로', (s.note || '') + L.txt(pg.x) + head, b);
        return;
    }
    if (s.r.stuck && !s.dec) {
        L.draw('탈출로', X.rollHtml(s.r) + L.txt(p0('멈춘 것').x) + head, (l.drag ? '' : X.btn('손목을 잡고 끌고 간다. <span style="font-size:10px;color:#888;">(모든 판정 −3 · 구간마다 −2분)</span>', 'WONDER.JS.t8d(1)')) + X.btn('두고 간다.', 'WONDER.JS.t8d(0)'));
        return;
    }
    L.draw('탈출로', (s.r.stuck ? '' : X.rollHtml(s.r)) + (s.txt || '') + (s.gt || '') + head, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
J.t8 = function (k) {
    const l = lk(), s = st();
    if (s.r) return;
    const id = t8id(L.def().steps[F().lk.i].n);
    if (k === 0) {
        l.tal--;
        const r = J.roll(0, 'subdue');
        s.r = r;
        if (r.ok) { r.stuck = 1; L.tx('x/t8/' + id, function (c) { return c || 'stop'; }); }
        else { s.txt = '손이 빗나간다. 그것이 고개를 돌린다. 이마가 비어 있다.'; s.gt = J.addInf(20, '부적 실패'); }
    } else {
        const r = J.roll(0, 'evade');
        s.r = r;
        s.txt = r.ok ? '뻗은 팔 아래를 지나간다. 그것은 출구 쪽만 본다.' : '팔이 어깨를 스친다. 차갑다.';
        if (!r.ok) s.gt = J.addInf(10, '회피 실패');
    }
    X.save(); X.view();
};
J.t8d = function (k) {
    const l = lk(), s = st();
    s.dec = 1;
    const id = t8id(L.def().steps[F().lk.i].n);
    if (k) { l.drag = id; L.tx('x/t8/' + id, function () { return 'drag'; }); s.txt = '손목을 잡아끈다. 따라온다. 한 걸음씩. 콩, 콩.'; }
    else s.txt = '멈춘 것을 그 자리에 둔다. 뻗은 팔이 그대로 굳어 있다.';
    X.save(); X.view();
};
const T8_SHUT = {
    k: 'jteam', id: 't8s', title: '셔터',
    text: function () { return '마지막 셔터가 내려오기 시작한다. 셔터 조작대 앞.' + (lk().drag ? '<div class="wd-sys">끌고 가는 것이 있습니다 — 판정 −3</div>' : ''); },
    opts: function () { return [{ l: '셔터 아래로 미끄러진다. <span style="font-size:10px;color:#888;">(최후 판정)</span>', v: 'go', roll: function () { return 0; }, kind: 'evade' }]; },
    mineTxt: function (v) { return v && v.ok ? '빠져나왔습니다' : '셔터에 걸렸습니다'; },
    once: function (m) {
        const l = lk();
        const v = m[ME()];
        if (v && v.ok && l.drag) { L.tx('x/t8/' + l.drag, function () { return 'deliv'; }); l.drag = null; X.save(); }
        if (v && !v.ok) { l.shut = 1; X.save(); }
        return '';
    },
    resolve: function (m) {
        const p = plan();
        if (half(infected())) return { end: ['새 놀이 친구들', 'f'] };
        const all = Object.keys(t8state()).filter(function (k) { return t8state()[k] === 'deliv'; }).length >= t8total();
        if (all) return { end: ['텅 빈 검역 구역', 'w'] };
        return { end: ['전원 탈출', 'd'] };
    }
};

// ==========================================
// 미션 표
// ==========================================
function baseOf(id) {
    const arr = md();
    for (let i = 0; i < arr.length; i++) if (arr[i].h.indexOf('연계판 ' + id + ' ') === 0) return i;
    return -1;
}
function pick2(rnd, from) { const a = X.shuffle(from, rnd); return [a[0], a[1]]; }
function basePlan(p, rnd) {
    p.role = { _: '' };          // 자리(기록자 등)는 A-214 것 — 이 연계판에는 없다. 빈 객체는 Firebase 가 지우므로 자리표만 남긴다
    if (p.mem.length < 5) p.cult = null;
    p.npcs = p.mem.length >= 2 && p.mem.length <= 4 ? ['n0', 'n1', 'n2', 'n3'].slice(0, 5 - p.mem.length) : [];
    p.hid = p.npcs.length ? p.npcs[Math.floor(rnd() * p.npcs.length)] : null;
    p.rooms = X.shuffle([0, 1, 2, 3, 4, 5], rnd);
    p.gims = X.shuffle([0, 1, 2, 3], rnd);
}
function M(id, o) {
    const d = Object.assign({ key: 'j_new', enterIdx: 14, returnIdx: 15, timeEnd: '시간', time: 40 * 60000 }, o);
    Object.defineProperty(d, 'base', { get: function () { return baseOf(id); }, enumerable: true });
    const _plan = o.plan;
    d.plan = function (p, rnd) { basePlan(p, rnd); if (_plan) _plan(p, rnd); };
    d.endMine = endMineBase(o.endMine);
    return d;
}
const HEAD = [{ k: 'jenter' }, { k: 'jreveal' }, { k: 'rules' }];
L.M[CH] = {
    S1: M('S1', {
        timeEnd: '감염', infEnd: '감염',
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 'jroom', n: 1 }, { k: 's1mach' }, { k: 's1way', n: 0 }, { k: 's1way', n: 1 }, { k: 's1fin' }])
    }),
    S2: M('S2', {
        timeEnd: '감염', infEnd: '감염',
        endCond: function (c) { return c === '실패 귀환 장면에 한 줄'; },
        steps: HEAD.concat([0, 1, 2, 3, 4].map(function (n) { return { k: 's2room', n: n }; })).concat([{ k: 'j_s2door' }])
    }),
    S3: M('S3', {
        timeEnd: '두 번', infEnd: '두 번',
        plan: function (p, rnd) {
            p.safe = Math.floor(rnd() * 5);
            const rest = [0, 1, 2, 3, 4].filter(function (k) { return k !== p.safe; });
            p.vis = [0, 1, 2, 3].map(function () { return pick2(rnd, rest); });
            p.vis.push(X.shuffle(rest, rnd).slice(0, 3));
        },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 's3hide', r: 0 }, { k: 's3hide', r: 1 }, { k: 'jroom', n: 1 }, { k: 's3hide', r: 2 }, { k: 's3hide', r: 3 }, { k: 's3choose' }])
    }),
    S4: M('S4', {
        timeEnd: '놓친 손', infEnd: '옮은 손',
        plan: function (p, rnd) { p.bit = rnd() < 0.5; },
        endCond: function (c) { return c === '물린 판이었다면' && !!plan().bit; },
        steps: HEAD.concat([{ k: 's4obs', n: 0 }, s4room(0), { k: 's4obs', n: 1 }, s4room(1), { k: 's4obs', n: 2 }, { k: 's4iso' }, s4room(2), { k: 'j_s4end' }])
    }),
    T1: M('T1', {
        timeEnd: '술래의 친구들',
        plan: function (p, rnd) {
            p.seek = p.mem.length >= 5 ? p.cult : (p.hid || 'n0');
            p.t1v = [0, 1, 2, 3].map(function () { return pick2(rnd, [0, 1, 2, 3, 4]); });
        },
        endCond: function (c) { return c === '술래가 일행이었다면' && plan().mem.indexOf(plan().seek) >= 0; },
        teamInf: function () { if (half(infected())) E('술래의 친구들', 'f'); },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 't1hide', r: 0 }, t1vote(0), { k: 'jroom', n: 1, skip: t1done }, { k: 't1hide', r: 1 }, t1vote(1), { k: 't1hide', r: 2 }, t1vote(2), { k: 't1hide', r: 3 }, { k: 't1end' }])
    }),
    T2: M('T2', {
        timeEnd: '감염',
        plan: function (p) { p.holder = p.mem[0]; },
        teamInf: function () { if (plan().holder === ME()) E('감염', 'f'); },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, t2vote(0), t2stick(0), { k: 'jroom', n: 1, skip: t2done }, t2vote(1), t2stick(1), { k: 'jroom', n: 2, skip: t2done }, t2vote(2), t2stick(2)])
    }),
    T3: M('T3', {
        timeEnd: '뚫린 문',
        plan: function (p, rnd) { p.out = [false, false, false, false]; if (rnd() < 0.5) p.out[Math.floor(rnd() * 4)] = true; },
        endCond: function (c) { return c === '방울이 울린 적이 있다면' && t3rang() > 0; },
        steps: HEAD.concat([0, 1, 2, 3].reduce(function (a, r) { return a.concat([t3def(r), t3door(r)]); }, [])).concat([{ k: 't3end' }])
    }),
    T4: M('T4', {
        timeEnd: '시간 초과',
        plan: function (p, rnd) {
            const s = X.shuffle(p.mem, rnd);
            p.groups = [[], []];
            s.forEach(function (c, k) { p.groups[k % 2].push(c); });
            if (!p.groups[1].length) p.groups[1] = p.groups[0].slice();
            p.groups.forEach(function (g) { g.sort(); });
            p.fig = X.shuffle(['doll', 'doll', 'doll', 'inf', 'inf', 'inf', 'surv', 'surv', 'surv', 'surv', 'surv', 'surv'], rnd);
        },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 't4split' }, { k: 't4fig' }, T4_FINAL])
    }),
    T5: M('T5', {
        timeEnd: '꺼진 불',
        endCond: function (c) { return c === '덜었다면' && !!L.x().t5took; },
        endFix: function (out) {
            const e = out['지켜진 불'];
            if (e && L.x().t5took) e.body = e.body.map(function (q) { return q.replace('처음과 같은 세기다. 조금 약하다.', '조금 약하다.'); });
        },
        teamInf: function () { if (J.bearer() === ME()) E('빛나는 눈', 'f'); },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, t5vote(0), t5take(0), t5def(0), t5def(1), t5room(1), t5vote(1), t5take(1), t5room(2), t5vote(2), { k: 'j_t5end' }])
    }),
    T6: M('T6', {
        timeEnd: '반만 찾음',
        plan: function (p, rnd) { p.t6n = [0, 1, 2, 3].map(function () { return [0, 1, 2, 3].map(function () { return Math.floor(rnd() * 5); }); }); },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 't6pick' }, { k: 't6turn', r: 0 }, { k: 't6turn', r: 1 }, { k: 't6turn', r: 2 }, { k: 't6turn', r: 3 }, { k: 't6end' }])
    }),
    T7: M('T7', {
        timeEnd: '감염',
        plan: function (p, rnd) { p.t7loc = Math.floor(rnd() * 5); },
        teamInf: function () { E('감염', 'f'); },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 'jroom', n: 1 }, t7talk(0), t7talk(1), t7talk(2), T7_FINAL, { k: 't7get' }, { k: 'j_t7end' }])
    }),
    T8: M('T8', {
        timeEnd: '닫힌 셔터',
        teamInf: function () { if (half(infected())) E('새 놀이 친구들', 'f'); },
        endMine: function (end) {
            if (lk() && lk().shut && end.r !== 'f') return { r: 'f', html: '<div class="wd-sys">셔터가 앞에서 내려왔다. 당신은 셔터 안쪽에 남았다.</div>' };
            return null;
        },
        steps: HEAD.concat([{ k: 'jroom', n: 0 }, { k: 't8cut' }, { k: 't8seg', n: 0 }, { k: 't8seg', n: 1 }, { k: 't8seg', n: 2 }, T8_SHUT])
    })
};

console.log('[이상한 나라] 검역 실패 연계판 12종 연결');
})();
