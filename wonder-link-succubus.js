// ==========================================
// ★ 「이상한 나라의 ■■■」 — 서큐버스 연계판 K의 방 「던전의 손님」판 『잠든 저택』 (몽환)
// bundles.json 마지막 묶음 — wonder-ch-succubus.js 다음
// ==========================================
//
//   원고: 「서큐버스의 장 · 몽환 — 원고」의 공통 뼈대 · 진입 · 귀환 · S1~T8.
//   wonder-link.js 의 걸음 · 기다림 · 투표 · 결말을 쓰고, 이 판만의 것을 여기서 더한다.
//
//   ■ 손님 — 모두 체력 · 심력 · 정신력 100 의 「던전의 손님」. Lv · 직업 · 각성 · 속성 · 장비 없음. d30 에 더하는 것 없음.
//     (S3 · T1 · T8 의 「빌린 직업 가면」만 그 판 안에서 ◇ 선택지와 판정 +2)
//   ■ 장미 꿈결 — 판 안에서만. 판이 끝나면 사라진다.
//   ■ 새벽 종 — 자정에서 시작, 장면 하나에 15분(한 칸). 열여섯 칸(새벽 네 시)이면 그 판은 실패.
//   ■ 쓰러짐 — 체력 0. 일행이 있으면 동료의 돌봄(DC 10) 한 번, 실패하거나 혼자면 X.die (상담실 · 선녀탕, 회차는 처음부터).
//     즉사 기믹(DC 17) — 일행이 있으면 동료가, 혼자면 스스로 굴린다. 실패하면 쓰러짐.
//     정신력 0 — S2 · T8 은 판이 끝남(✖), 그 밖에는 폭주(체력 −20, 정신력 20 으로). 심력 0 — 체력 −20, 심력 20 으로.
//   ■ 다른 팀 — 이 구현에는 같은 판의 다른 파티가 없으므로 언제나 NPC 손님이 그 자리를 채운다.
//   ■ 결과 — 'w' 이상한 나라 쪽(부탁대로) · 'd' 어둠 쪽(던전의 목소리를 따른 ✔) · 'f'

(function wonderLinkSuccubus() {
'use strict';
const X = window.WONDER;
if (!X || !X.L || !X.C) return;
const L = X.L;
const C = X.C;
const A = X.A = X.A || {};
const NUM = { '①': 0, '②': 1, '③': 2, '④': 3 };
const BELL = 16;
function F() { return X.F(); }
function ME() { return currentUser.code; }
function lk() { return L.me(); }
function st() { return F().lk.s; }
function esc(s) { return L.esc(s); }
function paras(x) { return String(x || '').split('<br><br>'); }
function team() { return X.isTeam(); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function act() { return X.actives(); }
function sum(o) { return Object.keys(o || {}).reduce(function (a, k) { return a + (+o[k] || 0); }, 0); }

// ==========================================
// 손님 수치
// ==========================================
function cs() {
    const m = lk();
    if (!m.cs) m.cs = { hp: 100, ht: 100, mn: 100, dr: 0, ck: 0, tk: {}, ap: {} };
    return m.cs;
}
function pubStat() { const c = cs(); L.pub('x/st/' + ME(), { hp: c.hp, ht: c.ht, mn: c.mn }); }
function clock() { if (!team()) return cs().ck; return sum(L.x().ck); }
function tick(key, n) {
    if (!n) return;
    key = String(key).replace(/[.#$\[\]\/]/g, '_');
    if (!team()) { const c = cs(); if (c.tk[key]) return; c.tk[key] = 1; c.ck += n; X.save(); return; }
    L.tx('x/ck/' + key, function (cur) { return cur == null ? n : cur; });
}
function clockTxt() {
    const m = clock() * 15;
    const h = Math.floor(m / 60), mm = m % 60;
    return (h === 0 ? '12' : h) + ':' + (mm < 10 ? '0' : '') + mm;
}
const KN = { '한': 1, '두': 2, '세': 3, '네': 4 };
function fx(str) {
    const o = {};
    const s = String(str || '').replace(/<[^>]+>/g, '');
    const re = /(체력|심력|정신력|장미 꿈결)\s*([+−-])\s*(\d+)/g;
    let m;
    while ((m = re.exec(s))) {
        const k = { '체력': 'hp', '심력': 'ht', '정신력': 'mn', '장미 꿈결': 'dr' }[m[1]];
        o[k] = (o[k] || 0) + (m[2] === '+' ? 1 : -1) * (+m[3]);
    }
    const c = s.match(/시계\s*(한|두|세|네|\d+)\s*칸(\s*덜)?/);
    if (c) o.ck = (KN[c[1]] || +c[1]) * (c[2] ? -1 : 1);
    return o;
}
function fxTxt(o) {
    const N = { hp: '체력', ht: '심력', mn: '정신력', dr: '장미 꿈결' };
    const out = [];
    ['hp', 'ht', 'mn', 'dr'].forEach(function (k) { if (o[k]) out.push(N[k] + ' ' + (o[k] > 0 ? '+' : '−') + Math.abs(o[k])); });
    if (o.ck) out.push('시계 ' + (o.ck > 0 ? '+' + o.ck + '칸' : o.ck + '칸'));
    return out.join(' · ');
}
// 한 번만 — key 로 막는다. 돌려주는 것: 화면에 붙일 알림 html
function apply(o, key) {
    const c = cs();
    if (key) { if (c.ap[key]) return c.ap[key].t || ''; }
    c.hp = Math.min(100, c.hp + (o.hp || 0));
    c.ht = Math.min(100, c.ht + (o.ht || 0));
    c.mn = Math.min(100, c.mn + (o.mn || 0));
    c.dr = Math.max(0, c.dr + (o.dr || 0));
    if (o.ck) tick((key || 'fx' + Date.now()) + '_' + ME(), o.ck);
    let t = fxTxt(o) ? '<div class="wd-sys">' + fxTxt(o) + '</div>' : '';
    t += check();
    if (key) c.ap[key] = { t: t };
    pubStat();
    X.save();
    return t;
}
// 바닥난 값 — 심력 · 정신력은 체력으로 넘기고, 체력 0 은 쓰러짐(다음 그리기에서)
function check() {
    const c = cs();
    const d = L.def();
    let t = '';
    if (c.ht <= 0) { c.ht = 20; c.hp -= 20; t += '<div class="wd-sys" style="color:#f44336;">심력이 바닥났다 — 체력 −20</div>'; }
    if (c.mn <= 0) {
        if (d && d.mnEnd) { c.mnOut = 1; t += '<div class="wd-sys" style="color:#f44336;">정신력 0</div>'; }
        else { c.mn = 20; c.hp -= 20; t += '<div class="wd-sys" style="color:#f44336;">정신력이 바닥나 폭주했다 — 체력 −20</div>'; }
    }
    if (c.hp <= 0) { c.hp = 0; c.downNow = 1; }
    return t;
}
// 그리기 전에 — 결말 · 쓰러짐 · 새벽 종
function guard() {
    const c = cs();
    const d = L.def();
    if (L.st().end) return true;
    if (c.mnOut && d.mnEnd) { L.end(d.mnEnd, 'f'); return true; }
    if (c.downNow) { down('쓰러짐'); return true; }
    if (d.bell !== false && clock() >= BELL) { L.end(d.bellEnd || '새벽 종', 'f'); return true; }
    return false;
}
C.guard = guard;

// 쓰러짐 — 일행이 있으면 동료의 돌봄 한 번
function down(why) {
    const c = cs();
    const d = L.def();
    c.downNow = 0;
    L.tx('x/dn/' + ME(), function (cur) { return (cur || 0) + 1; });
    const mates = act().filter(function (x) { return x !== ME(); });
    if (mates.length && !c.noRescue) {
        const r = C.rollDc(10, 0);
        if (r.ok) {
            c.hp = 25;
            if (d.onCare) d.onCare(ME());
            pubStat();
            X.save();
            L.draw('쓰러짐', '눈앞이 하얘진다. 바닥이 미지근하다.<br><br>누군가 어깨를 붙잡아 일으킨다. 동료다.' + C.rHtml(r) + '<div class="wd-sys">돌봄 — 체력 25 로 일어났습니다.</div>', X.btn('다시 일어선다.', 'WONDER.view()'));
            return;
        }
        return killMe(why, r);
    }
    return killMe(why, null);
}
function downText() {
    const d = L.def();
    const E = L.endings();
    const e = E[d.downEnd || '쓰러짐'];
    if (!e) return '눈앞이 하얘진다. 왈츠가 멀어진다.';
    return e.body.map(function (p) { return p.replace(/\s*→\s*쓰러짐 처리\([^)]*\)/g, ''); }).join('<br><br>');
}
function killMe(why, r) {
    try { darkRun.log.push('[서큐버스 연계판] 쓰러짐 — ' + why); } catch (e) { }
    X.die(downText() + (r ? C.rHtml(r) + '동료의 손이 닿지 않았다.' : '') + '<br><br>(쓰러짐)');
}
// 즉사 기믹 — DC 17. 일행이 있으면 동료가 끌어내고, 혼자면 스스로
function instant(title, s) {
    const mates = act().filter(function (x) { return x !== ME(); });
    const r = C.rollDc(17, 0);
    s.inst = { t: title, r: r, mate: !!mates.length };
    if (r.ok) { const d = L.def(); if (mates.length && d.onCare) d.onCare(ME()); return; }
    cs().downNow = 1;
    cs().noRescue = 1;   // 즉사 기믹을 못 벗어나면 그대로 쓰러짐 처리
    X.save();
}
function instHtml(s) {
    if (!s.inst) return '';
    const i = s.inst;
    return '<div class="wd-note" style="border-color:#7f0000;"><b style="color:#ff6b6b;">즉사 기믹 — ' + esc(i.t) + '</b> (DC 17)' + C.rHtml(i.r)
        + (i.r.ok ? (i.mate ? '동료가 끌어냈다.' : '가까스로 빠져나왔다.') : (i.mate ? '동료의 손이 미끄러진다.' : '끌어내 줄 사람이 없다.')) + '</div>';
}
C.instant = instant; C.instHtml = instHtml;

// ==========================================
// 위쪽 띠
// ==========================================
function sbar() {
    const c = cs();
    const d = L.def() || {};
    const used = lk().used || {};
    let h = '<div class="wd-bar" style="border-color:#4a2030; flex-wrap:wrap;">'
        + (d.bell !== false ? '<span>🕛 <b>' + clockTxt() + '</b></span>' : '')
        + '<span>체력 <b>' + c.hp + '</b></span><span>심력 <b>' + c.ht + '</b></span><span>정신력 <b>' + c.mn + '</b></span>'
        + (d.noDream ? '' : '<span>장미 꿈결 <b>' + c.dr + '</b></span>')
        + (d.extra ? d.extra() : '')
        + '</div>';
    if (X.has && X.has('장미 꽃잎 차') && !used['장미 꽃잎 차'] && c.mn < 100) h += X.btn('🌹 장미 꽃잎 차를 마신다. <span style="font-size:10px;color:#d4af37;">(정신력 +40)</span>', "WONDER.A.cItem('tea')");
    if (X.has && X.has('꿈결 사탕') && !used['꿈결 사탕'] && !d.noDream) h += X.btn('🍬 꿈결 사탕을 녹인다. <span style="font-size:10px;color:#d4af37;">(장미 꿈결 +5)</span>', "WONDER.A.cItem('candy')");
    return h;
}
A.cItem = function (k) {
    const used = lk().used;
    const name = k === 'tea' ? '장미 꽃잎 차' : '꿈결 사탕';
    if (used[name] || !X.spend(name)) return;
    used[name] = 1;
    apply(k === 'tea' ? { mn: 40 } : { dr: 5 }, 'item_' + k);
    try { showDarkToast('◈ ' + name); } catch (e) { }
    X.view();
};
function draw(title, text, extra) { L.draw(title, sbar() + (text || ''), extra || ''); }
C.draw = draw;

// ==========================================
// 원고 읽기 — 층 장면
// ==========================================
function sub(name) { return L.sub('c_new', L.def().base, name); }
function parseOpt(o, j) {
    const raw = o.l;
    const notes = [];
    raw.replace(/<i>\(([^)]*)\)<\/i>/g, function (_, n) { notes.push(n); return ''; });
    let text = raw.replace(/<i>\([^)]*\)<\/i>/g, '').trim();
    const nm = text.match(/^([①②③④])\s*/);
    const num = nm ? NUM[nm[1]] : j;
    text = text.replace(/^[①②③④]\s*/, '');
    const dia = /^◇/.test(text);
    text = text.replace(/^◇\s*/, '');
    const note = notes.join(' · ');
    const dcm = note.match(/DC\s*(\d+)/);
    let okS = '', badS = '';
    note.split(/\s*\/\s*/).forEach(function (pt) {
        const a = pt.indexOf('성공:'), b = pt.indexOf('실패:');
        if (a >= 0) okS = pt.slice(a + 3).trim();
        if (b >= 0) badS = pt.slice(b + 3).trim();
    });
    return { j: j, num: num, text: text, dia: dia, note: note, dc: dcm ? +dcm[1] : 0, party: /파티 판정/.test(note), care: /돌봄 판정/.test(note), okS: okS, badS: badS, label: raw };
}
function fparse(name) {
    const sc = sub(name);
    if (!sc) return null;
    const pages = sc.p;
    const k = pages.findIndex(function (p) { return p.o && p.o.length; });
    const intro = (k < 0 ? pages : pages.slice(0, k + 1)).map(function (p) { return p.x; }).filter(Boolean).join('<br><br>');
    const opts = k < 0 ? [] : pages[k].o.map(parseOpt);
    const rest = k < 0 ? '' : pages.slice(k + 1).map(function (p) { return p.x; }).filter(Boolean).join('<br><br>');
    const res = {};
    paras(rest).forEach(function (p) {
        const m = p.match(/^<b>([①②③④])\s*(성공|실패)?<\/b>\s*—\s*([\s\S]*)$/);
        if (m) res[NUM[m[1]] + (m[2] === '성공' ? 'ok' : m[2] === '실패' ? 'bad' : '')] = m[3];
    });
    return { sc: sc, pages: pages, k: k, intro: intro, opts: opts, rest: rest, res: res };
}
C.fparse = fparse; C.fx = fx; C.apply = apply; C.tick = tick; C.cs = cs; C.clock = clock;
// 조건 메모 문단 — show(메모) 가 참인 것만
function cond(x, show) {
    return paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || (show && show(m[1]));
    }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, ''); }).join('<br><br>');
}
function plain(x) { return cond(x, function () { return false; }); }
// 효과만 지운 설명 (「성공: 탑이 무너짐 · 잔은 건짐 · 체력 −15」 → 「탑이 무너짐. 잔은 건짐.」)
function descOf(s) {
    return String(s || '').split('·').map(function (t) { return t.trim(); })
        .filter(function (t) { return t && !/(체력|심력|정신력|장미 꿈결)\s*[+−-]|시계|^\+|DC|판정|돌봄 1회|나눔/.test(t); })
        .map(function (t) { return t.replace(/^「|」$/g, ''); }).join('. ') + (s ? '.' : '');
}
function optHtml(o) {
    return esc(o.text) + (o.note ? ' <span style="font-size:10px;color:#888;">(' + esc(o.note) + ')</span>' : '');
}
C.cond = cond; C.plain = plain;

// ==========================================
// 층 걸음 — 고르고(혼자면 바로 · 팀이면 투표, personal 이면 각자) · 굴리고 · 적용하고
// ==========================================
//   step: { k:'fl', f:'1층', n:1..4, personal?, show(note)?, filter(o)?, bonus(o,s)?, dcAdd(o)?, after(o, ok, s)→{html?, end?}, pre(s)→html, rest? }
const T_FLOOR = 2;   // 층 하나 — 장면 + 층계 (두 칸)
function restFx() {
    if (team()) return { hp: 25, ht: 15, mn: 10 };
    return { ht: -5, mn: -10 };
}
function floorPre(step, i, s) {
    if (s.pre) return s.preTxt || '';
    s.pre = 1;
    let t = '';
    if (step.rest) t += '<div class="wd-note" style="border-color:#4a2030;">쉼터 — ' + (team() ? '번갈아 망을 보며 눈을 붙였다.' : '혼자라 눈을 붙이지 못했다.') + apply(restFx(), 'rest' + i) + '</div>';
    tick('st' + i, step.tick == null ? T_FLOOR : step.tick);
    s.preTxt = t;
    X.save();
    return t;
}
function pickKey(i) { return 'fl' + i; }
L.K.fl = function (step, i) {
    if (guard()) return;
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    const s = st();
    const P = fparse(step.f);
    const pre = floorPre(step, i, s);
    const intro = cond(P.intro, step.show || null) + (step.pre ? step.pre(s) : '');
    const opts = P.opts.filter(function (o) { return !step.filter || step.filter(o); });
    const title = step.f;
    // 고르기
    let w = null;
    if (team() && !step.personal) {
        const m = L.votes(pickKey(i));
        if (m[ME()] == null) { draw(title, pre + intro, opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.flPick(' + i + ',' + o.j + ')'); }).join('')); return; }
        if (!act().every(function (c) { return m[c] != null; })) { draw(title, pre + intro + '<div class="wd-sys">「' + esc(P.opts[val(m[ME()])].text) + '」에 투표했습니다.</div>', L.waitList(m)); return; }
        const t = L.tally(m);
        w = t.win != null ? +t.win : +val(m[X.leader()] != null ? m[X.leader()] : m[ME()]);
    } else {
        if (s.w == null) { draw(title, pre + intro, opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.flPick(' + i + ',' + o.j + ')'); }).join('')); return; }
        w = s.w;
    }
    const o = P.opts[w];
    // 굴리기
    let r = null;
    if (o.dc) {
        if (o.party && team() && !step.personal) {
            const x = L.x();
            const pr = (x.pr || {})[i];
            if (!pr) {
                const bonus = step.bonus ? step.bonus(o, s, true) : 0;
                const rr = C.rollDc(o.dc + (step.dcAdd ? step.dcAdd(o, s, true) : 0), bonus);
                L.tx('x/pr/' + i, function (cur) { return cur || rr; });
                draw(title, pre + intro, X.waitHtml('_none', '일행이 함께 판정합니다…'));
                return;
            }
            r = pr;
        } else {
            if (!s.r) {
                let b = X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + (o.dc + (step.dcAdd ? step.dcAdd(o, s) : 0)) + ')</span>', 'WONDER.A.flRoll(' + i + ',0)');
                if (step.mask !== false && X.has && X.has('빌린 가면') && !lk().used['빌린 가면'] && step.n >= 1 && step.n <= 3) b += X.btn('빌린 가면을 고쳐 쓰고 판정한다. <span style="font-size:10px;color:#d4af37;">(빌린 가면 · +5)</span>', 'WONDER.A.flRoll(' + i + ',1)');
                draw(title, pre + intro + '<div class="wd-sys">「' + esc(o.text) + '」</div>', b);
                return;
            }
            r = s.r;
        }
    }
    const ok = r ? r.ok : null;
    // 적용 — 한 번
    let out = '';
    if (!s.done) {
        s.done = 1;
        let e = {};
        if (r == null) e = fx(o.note);
        else {
            e = fx(ok ? o.okS : o.badS);
            const rp = P.res[o.num + (ok ? 'ok' : 'bad')];
            if (rp) { const ee = fx((rp.match(/<i>\(([^)]*)\)<\/i>/g) || []).join(' ')); Object.keys(ee).forEach(function (k) { e[k] = (e[k] || 0) + ee[k]; }); }
        }
        if (r == null) { const rp = P.res[o.num]; if (rp) { const ee = fx((rp.match(/<i>\(([^)]*)\)<\/i>/g) || []).join(' ')); Object.keys(ee).forEach(function (k) { e[k] = (e[k] || 0) + ee[k]; }); } }
        if (step.fxMod) e = step.fxMod(o, ok, e, s) || e;
        s.fxT = apply(e, 'f' + i);
        if (ok === false && /즉사 기믹/.test(o.badS) && !(step.noInst && step.noInst(o, s))) instant(step.instName || '거울', s);
        if (step.after) { const a = step.after(o, ok, s) || {}; s.aft = a.html || ''; if (a.end) { s.endq = a.end; } }
        X.save();
    }
    if (s.endq && !L.st().end) { L.end(s.endq[0], s.endq[1], s.endq[2]); }
    const rp = r == null ? P.res[o.num] : P.res[o.num + (ok ? 'ok' : 'bad')];
    out = (r ? C.rHtml(r) : '') + (rp ? plain(rp) : (r == null ? '' : descOf(ok ? o.okS : o.badS) || (ok ? '해냈다.' : '잘 되지 않았다.')));
    if (step.tail) out += '<br><br>' + paras(P.rest).filter(function (p) { return !/^<b>[①②③④]/.test(p) && !/^<i>\(/.test(p); }).join('<br><br>');
    if (step.post) out += step.post(o, ok, s);
    out += (s.fxT || '') + (s.aft || '') + instHtml(s);
    if (s.endq) { draw(title, out, X.waitHtml('_none', '…')); return; }
    if (cs().downNow || cs().mnOut) { draw(title, out, X.btn('…', 'WONDER.view()')); return; }
    draw(title, '<div class="wd-sys">「' + esc(o.text) + '」</div>' + out, step.next ? step.next(o, ok, s) : X.btn('계속 간다.', 'WONDER.lkNext()'));
};
A.flPick = function (i, j) {
    const f = F();
    if (f.lk.i !== i) return;
    const st0 = L.def().steps[i];
    const step = st0.base || st0;   // t4fl 처럼 감싼 걸음이면 안쪽 걸음
    if (team() && !step.personal) { if (L.votes(pickKey(i))[ME()] == null) L.vote(pickKey(i), j); return; }
    const s = st();
    if (s.w != null) return;
    s.w = j;
    X.save(); X.view();
};
A.flRoll = function (i, mask) {
    const f = F();
    if (f.lk.i !== i) return;
    const s = st();
    if (s.r) return;
    const st0 = L.def().steps[i];
    const step = st0.base || st0;
    const P = fparse(step.f);
    const w = (team() && !step.personal) ? (function () { const m = L.votes(pickKey(i)); const t = L.tally(m); return t.win != null ? +t.win : +val(m[X.leader()] != null ? m[X.leader()] : m[ME()]); })() : s.w;
    const o = P.opts[w];
    let bonus = step.bonus ? step.bonus(o, s) : 0;
    if (mask && !lk().used['빌린 가면'] && X.spend('빌린 가면')) { lk().used['빌린 가면'] = 1; bonus += 5; }
    s.r = C.rollDc(o.dc + (step.dcAdd ? step.dcAdd(o, s) : 0), bonus);
    X.save(); X.view();
};

// ==========================================
// 공용 걸음 — 진입 · 입장
// ==========================================
L.K.cEnter = function (step, i) {
    const s = st();
    if (!s.t) { cs(); tick('st' + i, 1); s.t = 1; pubStat(); X.save(); }
    const sc = X.scene('c_new', 14);
    const x = cond(sc.p[0].x, function (n) { return n === '다른 팀이 없으면'; });
    draw('진입', x + '<div class="wd-note" style="border-color:#4a2030;"><b style="color:#e8a0b8;">◈ 던전의 손님</b><br>Lv · 직업 · 각성 · 속성을 쓰지 않습니다. 모두 체력 · 심력 · 정신력 100. 경험치 · 각성 점수는 쌓이지 않고, 어떤 장비도 통하지 않습니다.<br>새벽 네 시에 종이 울리면 그 판은 실패입니다.</div>',
        X.btn('계단을 내려간다.', 'WONDER.lkNext()'));
};
L.K.cIn = function (step, i) {
    if (guard()) return;
    const s = st();
    if (!s.t) { tick('st' + i, 1); s.t = 1; X.save(); }
    const sc = sub('입장');
    const d = L.def();
    let x = plain(sc.p.map(function (p) { return p.x; }).join('<br><br>'));
    if (d.inExtra) x += d.inExtra();
    draw('입장', x, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
// 결말 장면에서 그대로 끝내기 — 마지막 층 지문을 보여 주고 결말로
function endStep(name, decide) {
    return {
        k: 'cEndS', f: name, decide: decide
    };
}
L.K.cEndS = function (step, i) {
    if (guard()) return;
    const s = st();
    if (!s.t) { tick('st' + i, step.tick == null ? 1 : step.tick); s.t = 1; X.save(); if (guard()) return; }
    const sc = sub(step.f);
    const x = sc ? plain(sc.p.map(function (p) { return p.x; }).join('<br><br>')) : '';
    const r = step.decide(s);
    if (r && r.wait) { draw(step.f, x, X.waitHtml('_none', r.wait)); return; }
    if (r && r.btns) { draw(step.f, x + (r.html || ''), r.btns); return; }
    if (r && r.end) { L.end(r.end[0], r.end[1], r.end[2]); }
    draw(step.f, x, X.waitHtml('_none', '…'));
};
C.endStep = endStep; C.draw = draw; C.sub = sub; C.optHtml = optHtml;

// 함께 고르기 (투표 · 몰래 고르기) — 서큐버스 판 모양
//   step: { k:'cTeam', id, title, text(), opts()→[{l,v,roll?(dc)}], who?(), resolve(m)→{html,end,wait} }
L.K.cTeam = function (step, i) {
    if (guard()) return;
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    if (step.tick && !st().tk) { st().tk = 1; tick('st' + i, step.tick); X.save(); if (guard()) return; }
    const key = step.id;
    const m = L.votes(key);
    const who = step.who ? step.who() : act();
    const text = step.text ? step.text() : '';
    if (who.indexOf(ME()) >= 0 && m[ME()] == null) {
        draw(step.title || '—', text, step.opts().map(function (o, j) { return X.btn(o.l, 'WONDER.A.cCast(' + i + ',' + j + ')'); }).join(''));
        return;
    }
    if (!who.every(function (c) { return m[c] != null; })) {
        draw(step.title || '—', text + (m[ME()] != null && step.mineTxt ? '<div class="wd-sys">' + step.mineTxt(m[ME()]) + '</div>' : ''), L.waitList(m, who));
        return;
    }
    const r = step.resolve(m) || {};
    if (r.end) { L.end(r.end[0], r.end[1], r.end[2]); draw(step.title || '—', text, X.waitHtml('_none', '…')); return; }
    if (r.wait) { draw(step.title || '—', r.html || text, X.waitHtml('_none', '…')); return; }
    draw(step.title || '—', r.html || '', r.btns || X.btn('계속 간다.', 'WONDER.lkNext()'));
};
A.cCast = function (i, j) {
    const f = F();
    if (f.lk.i !== i) return;
    const step = L.def().steps[i];
    if (L.votes(step.id)[ME()] != null) return;
    const o = step.opts()[j];
    if (!o) return;
    let v = o.v;
    if (o.roll) { const r = C.rollDc(o.roll.dc, o.roll.bonus || 0); v = { v: o.v, ok: r.ok, n: r.total, raw: r.raw, dc: r.dc, b: r.bonus }; }
    L.vote(step.id, v);
};
function teamOrSolo(step) { return step; }
C.teamOrSolo = teamOrSolo;

// ==========================================
// 결말 — 원고에 없는 제목은 여기서 채운다 (새벽 종 · 사람마다 다른 결말)
// ==========================================
(function hookEndings() {
    if (L._cEnd) return;
    L._cEnd = 1;
    const _e = L.endings;
    L.endings = function () {
        const o = _e.apply(this, arguments);
        const d = L.def();
        if (d && d.cMore) {
            const more = d.cMore();
            Object.keys(more).forEach(function (k) { if (!o[k]) o[k] = more[k]; });
        }
        if (d && d.cMore && !o['새벽 종']) o['새벽 종'] = { ok: false, t: '새벽 종', body: ['저택 시계가 네 시를 친다. 새벽 종이다. 촛불 모양만 있던 샹들리에가 하나씩 지워진다. 왈츠가 멈춘다. 잠이 깬다.'], ret: null };
        return o;
    };
})();


// ==========================================
// 미션 공통
// ==========================================
function M(base, o) {
    return Object.assign({
        key: 'c_new', enterIdx: 14, returnIdx: 15, base: base, timer: false, bellEnd: '새벽 종',
        cMore: function () { return {}; },
        plan: function (p, rnd) { p.cult = null; p.role = { _: 0 }; if (o.plan2) o.plan2(p, rnd); }   // 빈 객체는 Firebase 에서 사라져 L.bar 가 넘어진다
    }, o);
}
const COMMON = [{ k: 'cEnter' }, { k: 'cIn' }, { k: 'rules' }];
function E(t, r, extra) { L.end(t, r, extra); }
function next(solo) { return X.btn('계속 간다.', solo ? 'WONDER.A.cSolo()' : 'WONDER.lkNext()'); }
A.cSolo = function () { L.next(true); };
function lowest(list) { return list.slice().sort()[0]; }
function x() { return L.x(); }
// 함께 굴리는 판정 — 먼저 굴린 사람의 값이 모두의 값
function partyRoll(key, dc, bonus) {
    const v = (x().pr2 || {})[key];
    if (v) return v;
    const r = C.rollDc(dc, bonus || 0);
    L.tx('x/pr2/' + key, function (cur) { return cur || r; });
    return null;
}

// ==========================================
// S1 두고 간 구두
// ==========================================
function s1() { const m = lk(); m.s1 = m.s1 || { wear: null }; return m.s1; }
L.K.s1wear = function (step, i) {
    if (guard()) return;
    const s = st(), q = s1();
    const P = fparse(step.f);
    if (s.ch == null) {
        draw(step.f, '외짝 발자국이 이 층으로 이어진다. 손에는 빨간 에나멜 구두가 있다.<div class="wd-sys">신는다 — 판정 없이 지나가고 시계 한 칸 · 장미 꿈결 −2<br>든다 — 이 층의 판정을 치르고 체력 −10 · 시계 세 칸 · 성공하면 장미 꿈결 +2, 실패하면 시계 한 칸 더</div>',
            X.btn('신는다.', 'WONDER.A.s1w(1)') + X.btn('든다.', 'WONDER.A.s1w(0)'));
        return;
    }
    if (s.ch === 1) {
        const t = cond(P.intro, function (n) { return n === '신는다'; });
        const only = paras(t)[0];
        draw(step.f, only + (s.fxT || ''), cs().dr <= 0 ? X.waitHtml('_none', '…') : X.btn('계단을 내려간다.', 'WONDER.A.cSolo()'));
        if (cs().dr <= 0) E('꿈결이 다하다', 'f');
        return;
    }
    L.goStep(i + 1);
};
A.s1w = function (k) {
    const s = st(), q = s1();
    if (s.ch != null) return;
    s.ch = k; q.wear = !!k;
    const i = F().lk.i;
    if (k) { s.fxT = apply({ dr: -2 }, 's1w' + i); tick('s1w' + i, 1); }
    else { s.fxT = apply({ hp: -10 }, 's1w' + i); tick('s1w' + i, 3); }
    X.save();
    if (!k) { s.held = 1; L.goStep(i + 1); return; }
    X.view();
};
function s1floor(f, n) {
    return {
        k: 'fl', f: f, n: n, tick: 0,
        skip: function () { return s1().wear; },
        show: function (nt) { return nt === '든다'; },
        fxMod: function (o, ok, e) { if (ok) e.dr = (e.dr || 0) + 2; else e.ck = (e.ck || 0) + 1; return e; },
        next: function () { return X.btn('계속 간다.', 'WONDER.A.cSolo()'); }
    };
}
L.K.s1end = function (step, i) {
    const s = st();
    if (s.ch == null) {
        if (guard()) return;
        draw('4층', '발자국이 끝 방 앞까지 이어진다. 마지막 계단이다.', X.btn('구두를 신고 들어선다.', 'WONDER.A.s1e(1)') + X.btn('구두를 들고 들어선다.', 'WONDER.A.s1e(0)'));
        return;
    }
    if (guard()) return;
    const sc = sub('4층');
    draw('4층 — 끝 방', plain(sc.p[0].x), X.btn('…', 'WONDER.A.s1fin()'));
};
A.s1e = function (k) {
    const s = st();
    if (s.ch != null) return;
    s.ch = k;
    const i = F().lk.i;
    if (k) { apply({ dr: -2 }, 's1e'); tick('s1e' + i, 1); if (cs().dr <= 0) { X.save(); return E('꿈결이 다하다', 'f'); } }
    else { apply({ hp: -10 }, 's1e'); tick('s1e' + i, 3); }
    X.save(); X.view();
};
A.s1fin = function () { const s = st(); E(s.ch ? '끝까지 춤추다' : '돌려드리다', s.ch ? 'd' : 'w'); };

// ==========================================
// S2 이름 없는 손님
// ==========================================
const S2_NAMES = ['달빛노래', '장미아씨', '새벽편지', '분홍리본', '은하수별', '초록구두', '봄날왈츠'];
function s2() { const m = lk(); m.s2 = m.s2 || { got: [] }; return m.s2; }
function s2name() { return S2_NAMES[L.plan().nm || 0]; }
function s2sheet() {
    const nm = s2name(), q = s2();
    return '<div class="wd-note" style="border-color:#5a4a2a;">금빛 이름표 — ' + nm.split('').map(function (ch, k) { return q.got.indexOf(k) >= 0 ? '<b>' + ch + '</b>' : '□'; }).join(' ') + '</div>';
}
L.K.s2f = function (step, i) {
    if (guard()) return;
    const s = st(), q = s2();
    const P = fparse('갈림길');
    const sc = sub(step.f);
    const body = sc.p.map(function (p) { return p.x; }).join('<br><br>');
    floorPre(step, i, s);
    if (s.w == null) {
        draw(step.f, (s.preTxt || '') + plain(body) + s2sheet(), P.opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.s2p(' + o.j + ')'); }).join(''));
        return;
    }
    const o = P.opts[s.w];
    if (!s.r) { draw(step.f, plain(body) + '<div class="wd-sys">「' + esc(o.text) + '」</div>', X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o.dc + ')</span>', 'WONDER.A.s2r()')); return; }
    if (!s.done) {
        s.done = 1;
        s.fxT = apply(fx(s.r.ok ? o.okS : o.badS), 's2f' + i);
        if (s.r.ok && s.w < 2) q.got.push(step.n - 1);
        X.save();
    }
    if (guard()) return;
    let t = C.rHtml(s.r) + (s.w < 2 ? (s.r.ok ? cond(body, function (n) { return n === '글자를 주우면'; }).split('<br><br>').filter(function (p, k, a) { return paras(plain(body)).indexOf(p) < 0; }).join('<br><br>') + '<div class="wd-sys">글자 「' + s2name()[step.n - 1] + '」</div>' : descOf(o.badS))
        : cond(body, function (n) { return /^③/.test(n); }).split('<br><br>').filter(function (p) { return paras(plain(body)).indexOf(p) < 0; }).join('<br><br>') + (s.r.ok ? '' : '<br><br>' + descOf(o.badS)));
    draw(step.f, t + (s.fxT || '') + s2sheet(), X.btn('다음 층으로 간다.', 'WONDER.A.cSolo()'));
};
A.s2p = function (j) { const s = st(); if (s.w != null) return; s.w = j; X.save(); X.view(); };
A.s2r = function () {
    const s = st();
    if (s.r || s.w == null) return;
    const o = fparse('갈림길').opts[s.w];
    s.r = C.rollDc(o.dc || 19, 0);
    X.save(); X.view();
};
L.K.c_s2door = function (step, i) {
    if (guard()) return;
    const s = st(), q = s2();
    const sc = sub('4층');
    floorPre(step, i, s);
    const o0 = parseOpt(sc.p[0].o[0], 0);
    if (s.w == null) {
        draw('4층 — 끝 방', (s.preTxt || '') + plain(sc.p[0].x) + s2sheet(), X.btn(optHtml(o0), 'WONDER.A.s2d(0)') + X.btn(esc(parseOpt(sc.p[0].o[1], 1).text), 'WONDER.A.s2d(1)'));
        return;
    }
    if (s.w === 0 && !s.r) { draw('4층 — 끝 방', plain(sc.p[0].x), X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o0.dc + ')</span>', 'WONDER.A.s2dr()')); return; }
    if (s.w === 0 && !s.done) { s.done = 1; s.fxT = apply(fx(s.r.ok ? o0.okS : o0.badS), 's2d'); if (s.r.ok) q.got.push(3); X.save(); }
    if (guard()) return;
    const pre = s.r ? C.rHtml(s.r) + (s.r.ok ? '<div class="wd-sys">글자 「' + s2name()[3] + '」</div>' : descOf(o0.badS)) + (s.fxT || '') + '<br><br>' : '';
    draw('4층 — 끝 방', pre + plain(sc.p[1].x) + s2sheet(), (sc.p[1].o || []).map(function (o, j) { return X.btn(L.txt(o.l), 'WONDER.A.s2fin(' + j + ')'); }).join(''));
};
A.s2d = function (j) { const s = st(); if (s.w != null) return; s.w = j; X.save(); X.view(); };
A.s2dr = function () { const s = st(); if (s.r) return; s.r = C.rollDc(20, 0); X.save(); X.view(); };
A.s2fin = function (j) {
    const q = s2();
    if (j === 1) return E('이름 없는 손님', 'd');
    if (q.got.length >= 4) return E('돌려드린 이름', 'w');
    E('빌려준 한 글자', 'f');
};

// ==========================================
// S3 얼굴 고르기
// ==========================================
const JOBS = ['곡예사', '전사', '요리사', '치유사', '음유시인', '점술가', '정원사', '재봉사'];
function s3() { const m = lk(); m.s3 = m.s3 || { job: null, masked: false, reworn: false, off: false }; return m.s3; }
function maskedShow(n) { const q = s3(); return (n === '가면을 쓴 채로' && q.masked) || (n === '맨얼굴이면' && !q.masked); }
L.K.s3f1 = function (step, i) {
    if (guard()) return;
    const s = st(), q = s3();
    const P = fparse('1층');
    const jobs = L.plan().jobs;
    if (s.w == null) { draw('1층 — 뒤집힌 가면 다섯', '무도회장 문 앞 바닥에 가면 다섯 개가 엎어져 있다. 뒷면은 K의 방 직업 카드 무늬다.', P.opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.s3p(' + o.j + ')'); }).join('')); return; }
    const o = P.opts[s.w];
    if (o.dc && !s.r) { draw('1층 — 뒤집힌 가면 다섯', '<div class="wd-sys">「' + esc(o.text) + '」</div>', X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o.dc + ')</span>', 'WONDER.A.s3r()')); return; }
    if (!s.done) {
        s.done = 1;
        if (s.r) s.fxT = apply(fx(s.r.ok ? o.okS : o.badS), 's3f1');
        X.save();
    }
    // 고르기 — ① 성공이면 둘 중 하나, 아니면 무작위
    if (!q.job) {
        if (s.w === 0 && s.r && s.r.ok) {
            draw('1층 — 뒤집힌 가면 다섯', C.rHtml(s.r) + '두 장의 안쪽을 엿보았다.' + (s.fxT || ''), [0, 1].map(function (k) { return X.btn('「' + jobs[k] + '」 가면을 쓴다.', 'WONDER.A.s3j(' + k + ')'); }).join(''));
            return;
        }
        q.job = jobs[(s.w === 1 ? 2 : s.w === 2 ? 3 : 4) % jobs.length];
        q.masked = true;
        X.save();
    }
    if (guard()) return;
    const after = paras(P.rest).filter(function (p) { return !/^<i>\(벗는다/.test(p); }).map(function (p) { return p.replace(/<i>\(「하룻밤 빌린 얼굴 — ○○」\)<\/i>/, '<div class="wd-sys">「하룻밤 빌린 얼굴 — ' + esc(q.job) + '」</div>'); }).join('<br><br>');
    draw('1층 — 뒤집힌 가면 다섯', (s.r ? C.rHtml(s.r) + (s.r.ok ? '' : descOf(o.badS) + '<br><br>') : '') + after + (s.fxT || ''), X.btn('계속 간다.', 'WONDER.A.cSolo()'));
};
A.s3p = function (j) { const s = st(); if (s.w != null) return; s.w = j; X.save(); X.view(); };
A.s3r = function () { const s = st(); if (s.r) return; const o = fparse('1층').opts[s.w]; s.r = C.rollDc(o.dc, 0); X.save(); X.view(); };
A.s3j = function (k) { const q = s3(); if (q.job) return; q.job = L.plan().jobs[k]; q.masked = true; X.save(); X.view(); };
// 벗는다 — 1층 판정 없음 · 2층 DC 19 · 3층 DC 21 (실패: 정신력 −15)
L.K.s3off = function (step, i) {
    if (guard()) return;
    const s = st(), q = s3();
    if (!q.masked) { L.goStep(i + 1); return; }
    const dc = [0, 0, 19, 21][step.n];
    if (s.k == null) {
        draw('—', '가면이 얼굴에 따뜻하게 붙어 있다. 「하룻밤 빌린 얼굴 — ' + esc(q.job) + '」', X.btn('가면을 벗는다.' + (dc ? ' <span style="font-size:10px;color:#888;">(DC ' + dc + ')</span>' : ''), 'WONDER.A.s3o(1)') + X.btn('그대로 쓴다.', 'WONDER.A.s3o(0)'));
        return;
    }
    if (s.k === 0) { L.next(true); return; }
    if (dc && !s.r.ok) { draw('—', C.rHtml(s.r) + '가면 가장자리가 손끝에서 미끄러진다. 얼굴에 조금 더 붙었다.' + (s.fxT || ''), next(1)); return; }
    const ps = paras(fparse('1층').rest).filter(function (p) { return /^<i>\(벗는다/.test(p); }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); });
    draw('—', (s.r ? C.rHtml(s.r) : '') + (step.n === 1 && ps[0] ? ps[0] : '가면이 떨어진다. 손에 든다. 맨얼굴이 조금 춥다.'), next(1));
};
A.s3o = function (k) {
    const s = st(), q = s3();
    if (s.k != null) return;
    s.k = k;
    const step = L.def().steps[F().lk.i];
    const dc = [0, 0, 19, 21][step.n];
    if (k) {
        if (dc) { s.r = C.rollDc(dc, 0); if (!s.r.ok) s.fxT = apply({ mn: -15 }, 's3o' + step.n); }
        if (!dc || s.r.ok) { q.masked = false; q.off = true; }
    }
    X.save(); X.view();
};
function s3bonus() { return s3().masked ? 2 : 0; }
L.K.s3f3 = function (step, i) {
    if (guard()) return;
    const s = st(), q = s3();
    const P = fparse('3층');
    floorPre(step, i, s);
    const intro = cond(P.intro, maskedShow);
    const opts = P.opts.filter(function (o) { return o.num === 0 ? q.masked : o.num === 2 ? !q.masked : true; });
    if (s.w == null) { draw('3층 — 거울 앞', (s.preTxt || '') + intro, opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.s3p(' + o.j + ')'); }).join('')); return; }
    const o = P.opts[s.w];
    if (o.dc && !s.r) { draw('3층 — 거울 앞', intro + '<div class="wd-sys">「' + esc(o.text) + '」</div>', X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o.dc + ')</span>', 'WONDER.A.s3r3()')); return; }
    if (!s.done) {
        s.done = 1;
        s.fxT = apply(o.dc ? fx(s.r.ok ? o.okS : o.badS) : fx(o.note), 's3f3');
        if (o.dc && !s.r.ok && !q.masked) s.gim = 1;
        X.save();
    }
    if (s.gim && !s.gimDone) {
        const g = paras(P.rest).filter(function (p) { return /즉사 기믹/.test(p); })[0] || '';
        draw('즉사 기믹', C.rHtml(s.r) + plain(g.replace(/ — 「다시 쓴다」[\s\S]*$/, '')),
            X.btn('가면을 다시 쓴다. <span style="font-size:10px;color:#888;">(손이 놓아 준다 — 살아남지만 이 판은 ✖)</span>', 'WONDER.A.s3g(1)') + X.btn('버틴다. <span style="font-size:10px;color:#888;">(DC 17)</span>', 'WONDER.A.s3g(0)'));
        return;
    }
    if (guard()) return;
    let t = (s.r ? C.rHtml(s.r) + (s.r.ok ? descOf(o.okS) || '거울에서 멀어졌다.' : descOf(o.badS)) : '거울 속 얼굴이 고개를 끄덕인다.') + (s.fxT || '');
    if (s.gimR) t += '<div class="wd-note" style="border-color:#7f0000;">' + C.rHtml(s.gimR) + (s.gimR.ok ? '턱을 잡은 손을 떼어 냈다.' : '') + '</div>';
    if (s.gimMask) t += '<div class="wd-sys">가면을 다시 썼다. 손이 가면을 알아보고 놓아 준다.</div>';
    draw('3층 — 거울 앞', t, next(1));
};
A.s3r3 = function () { const s = st(); if (s.r) return; const o = fparse('3층').opts[s.w]; s.r = C.rollDc(o.dc, s3bonus()); X.save(); X.view(); };
A.s3g = function (k) {
    const s = st(), q = s3();
    if (s.gimDone) return;
    s.gimDone = 1;
    if (k) { q.masked = true; q.reworn = true; s.gimMask = 1; }
    else { s.gimR = C.rollDc(17, 0); if (!s.gimR.ok) { cs().downNow = 1; cs().noRescue = 1; } }
    X.save(); X.view();
};
L.K.s3end = function (step, i) {
    if (guard()) return;
    const q = s3();
    const sc = sub('4층');
    const r = q.reworn ? ['모른 척하는 가면', 'f'] : q.masked ? ['맞춰진 얼굴', 'd'] : ['고른 얼굴', 'w'];
    floorPre(step, i, st());
    draw('4층 — 가면 진열실', plain(sc.p[0].x), X.btn('…', "WONDER.A.cEndNow('" + r[0] + "','" + r[1] + "')"));
};
A.cEndNow = function (t, r) { E(t, r); };

// ==========================================
// S4 달콤한 도시락
// ==========================================
function s4() { const m = lk(); m.s4 = m.s4 || {}; return m.s4; }
L.K.s4f = function (step, i) {
    if (guard()) return;
    const s = st(), q = s4();
    const P = fparse(step.f);
    floorPre(step, i, s);
    const intro = plain(P.intro);
    const eatP = paras(P.rest).filter(function (p) { return /^<i>\(먹는다\)/.test(p); })[0] || '';
    const keepP = paras(P.rest).filter(function (p) { return /^<i>\(담는다\)/.test(p); })[0] || '';
    if (q[step.n]) {
        const ch = q[step.n];
        draw(step.f, (s.got || '') + plain(ch === 'eat' ? eatP : keepP) + (s.fxE || ''), next(1));
        return;
    }
    if (step.n === 2) {
        // 수프 — 먼저 먹을지 담을지. 담으려 하면 요리사를 설득해야 한다
        if (s.w2 == null) {
            const ip = paras(P.intro);
            const ai = ip.findIndex(function (p) { return /^<i>\(담으려 하면\)/.test(p); });
            const first = ip.filter(function (p, k) { return ai < 0 || (k !== ai && k !== ai + 1); }).join('<br><br>');
            draw(step.f, (s.preTxt || '') + plain(first), X.btn('먹는다.', 'WONDER.A.s4e(1)') + X.btn('담는다.', 'WONDER.A.s4w2()'));
            return;
        }
        if (s.w == null) {
            const ask = paras(P.intro).filter(function (p) { return /^<i>\(담으려 하면\)/.test(p); }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
            const nx = paras(P.intro)[paras(P.intro).findIndex(function (p) { return /^<i>\(담으려 하면\)/.test(p); }) + 1] || '';
            draw(step.f, ask + '<br><br>' + nx, P.opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.s4p(' + o.j + ')'); }).join(''));
            return;
        }
        const o = P.opts[s.w];
        if (!o.dc) { return A.s4e(1); }
        if (!s.r) { draw(step.f, '<div class="wd-sys">「' + esc(o.text) + '」</div>', X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o.dc + ')</span>', 'WONDER.A.s4r()')); return; }
        if (!s.done) { s.done = 1; s.got = C.rHtml(s.r) + (s.r.ok ? descOf(o.okS) : descOf(o.badS)) + apply(fx(s.r.ok ? o.okS : o.badS), 's4o' + i) + '<br><br>'; X.save(); }
        if (guard()) return;
        q[step.n] = 'keep'; X.save(); X.view();
        return;
    }
    if (s.w == null) { draw(step.f, (s.preTxt || '') + intro, P.opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.s4p(' + o.j + ')'); }).join('')); return; }
    const o = P.opts[s.w];
    if (!s.r) { draw(step.f, intro + '<div class="wd-sys">「' + esc(o.text) + '」</div>', X.btn('판정한다. <span style="font-size:10px;color:#888;">(DC ' + o.dc + ')</span>', 'WONDER.A.s4r()')); return; }
    if (!s.done) { s.done = 1; s.got = C.rHtml(s.r) + (s.r.ok ? '손에 넣었다.' : descOf(o.badS)) + apply(fx(s.r.ok ? o.okS : o.badS), 's4o' + i) + '<br><br>'; X.save(); }
    if (guard()) return;
    draw(step.f, s.got, X.btn('먹는다.', 'WONDER.A.s4e(1)') + X.btn('담는다.', 'WONDER.A.s4e(0)'));
};
A.s4w2 = function () { const s = st(); if (s.w2 != null) return; s.w2 = 1; X.save(); X.view(); };
A.s4p = function (j) { const s = st(); if (s.w != null) return; s.w = j; X.save(); X.view(); };
A.s4r = function () { const s = st(); if (s.r) return; const step = L.def().steps[F().lk.i]; const o = fparse(step.f).opts[s.w]; s.r = C.rollDc(o.dc, 0); X.save(); X.view(); };
A.s4e = function (eat) {
    const s = st(), q = s4();
    const step = L.def().steps[F().lk.i];
    if (q[step.n]) return;
    q[step.n] = eat ? 'eat' : 'keep';
    if (eat) {
        const P = fparse(step.f);
        const eatP = paras(P.rest).filter(function (p) { return /^<i>\(먹는다\)/.test(p); })[0] || '';
        s.fxE = apply(fx((eatP.match(/<i>\(([^)]*)\)<\/i>/g) || []).slice(1).join(' ')), 's4e' + step.n);
    }
    X.save(); X.view();
};
L.K.c_s4end = function (step, i) {
    if (guard()) return;
    const q = s4();
    floorPre(step, i, st());
    const v = [q[1], q[2], q[3]];
    const r = v.every(function (k) { return k === 'keep'; }) ? ['세 접시의 도시락', 'w'] : v.every(function (k) { return k === 'eat'; }) ? ['잘 먹었습니다', 'd'] : ['식어 버린 저녁', 'f'];
    draw('4층 — 아래층 주방', plain(sub('4층').p[0].x), X.btn('…', "WONDER.A.cEndNow('" + r[0] + "','" + r[1] + "')"));
};

// ==========================================
// T1 가면 교환
// ==========================================
function t1ret(n) {
    return {
        k: 'cTeam', id: 't1v' + n, title: '돌려받을까',
        skip: function () { return !!x().t1go; },
        text: function () { return n + '층이 끝났다. 바뀐 가면이 얼굴에 익숙해지기 시작한다.<div class="wd-sys">「돌려받는다」로 모이면 모두 제 가면을 알아보는 판정(DC 20)을 치릅니다. 한 사람이라도 실패하면 이 판은 ✖입니다. 한 번 돌려받으면 다시 묻지 않습니다.</div>'; },
        opts: function () { return [{ l: '돌려받는다.', v: 'back' }, { l: '그대로 간다.', v: 'keep' }]; },
        mineTxt: function (v) { return val(v) === 'back' ? '「돌려받는다」' : '「그대로」'; },
        resolve: function (m) {
            const t = L.tally(m);
            if (t.win === 'back') { L.tx('x/t1go', function (cur) { return cur || n; }); return { html: '가면들이 바닥에 내려앉는다. 모두 하얗게 변한다. 이제 제 것을 알아봐야 한다.' }; }
            return { html: '바꾼 채로 간다. 목소리만 그대로다.' };
        }
    };
}
function t1roll(n) {
    return {
        k: 'cTeam', id: 't1r', title: '제 가면',
        skip: function () { return x().t1go !== n; },
        text: function () { return '하얗게 변한 가면들이 바닥에 놓여 있다. 어느 것이 제 것인지 알아봐야 한다.'; },
        opts: function () { return [{ l: '제 가면을 집는다. <span style="font-size:10px;color:#888;">(DC 20)</span>', v: 'r', roll: { dc: 20, bonus: (x().t1b3 ? 3 : 0) + (lk().t1b || 0) } }]; },
        mineTxt: function (v) { return (v && v.ok ? '✔ ' : '✖ ') + (v && v.n) + ' / 20'; },
        resolve: function (m) {
            if (Object.keys(m).some(function (c) { return !m[c].ok; })) return { end: ['남의 얼굴', 'f'] };
            L.tx('x/t1ret', function (cur) { return cur || 1; });
            return { html: '모두 제 가면을 찾았다. 쓰는 순간 알았다. 이건 내 얼굴이다.' };
        }
    };
}
function maskBonus(o) { return o.dia ? 2 : 0; }

// ==========================================
// T2 빈자리 만찬
// ==========================================
const T2_SEAT = {
    k: 'cTeam', id: 't2s', title: '2층 — 만찬 층',
    text: function () { const P = fparse('2층'); return plain(P.intro).replace('<br><br>(다른 팀 / NPC 손님)', ''); },
    opts: function () { return fparse('2층').opts.map(function (o) { return { l: optHtml(o), v: o.j }; }); },
    mineTxt: function (v) { return '「' + esc(fparse('2층').opts[val(v)].text) + '」'; },
    resolve: function (m) {
        const t = L.tally(m);
        const w = t.win != null ? +t.win : +val(m[X.leader()]);
        if (w === 2) return { end: ['떠난 자리', 'f'] };
        if (w === 1) {
            const r = partyRoll('t2s', 22, x().t2b || 0);
            if (!r) return { wait: true };
            if (r.ok) { L.tx('x/t2res', function (cur) { return cur || 'inv'; }); return { html: C.rHtml(r) + '맞은편의 손님이 봉투를 받아 든다. 받는 사람 칸에 글씨가 떠오른다.' }; }
            return { html: C.rHtml(r) + '맞은편 자리가 하나씩 비어 간다. 다시 앉으려면 마음을 단단히 먹어야 한다.' + apply({ ht: -15 }, 't2s') };
        }
        return { html: '맞은편에 앉는다. 케이크가 가운데에 있다.' };
    }
};
L.K.t2din = function (step, i) {
    if (guard()) return;
    if (x().t2res) { L.goStep(i + 1); return; }
    const s = st();
    const P = fparse('2층');
    const din = paras(P.rest);
    const k0 = din.findIndex(function (p) { return /달콤한 만찬/.test(p); });
    let us = (x().pr2 || {}).t2u, them = (x().pr2 || {}).t2t;
    if (!us) us = partyRoll('t2u', 20, 0);
    if (!them) them = partyRoll('t2t', 20, 0);
    if (!us || !them) { draw('달콤한 만찬', '', X.waitHtml('_none', '케이크에 칼이 들어간다…')); return; }
    const head = plain(din[k0 + 1] || '');
    const res = '<div class="wd-sys">일행 대표</div>' + C.rHtml(us) + '<div class="wd-sys">맞은편 손님 대표</div>' + C.rHtml(them);
    if (!us.ok && !them.ok) { E('쓴 만찬', 'f'); draw('달콤한 만찬', head + res, X.waitHtml('_none', '…')); return; }
    if (!s.done) { s.done = 1; s.fxT = apply({ hp: 25, ht: 15, mn: 10, dr: 2 }, 't2din'); X.save(); }
    const okP = din.filter(function (p) { return /^<i>\(한 팀이라도 성공\)/.test(p); }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); })[0] || '';
    draw('달콤한 만찬', head + res + okP + (s.fxT || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
const T2_LAST = {
    k: 'cTeam', id: 't2l', title: '마지막 선택',
    skip: function () { return !!x().t2res; },
    text: function () { return '만찬이 달콤해졌다. 마지막 선택.'; },
    opts: function () { return [{ l: '초대장을 식탁 너머로 내민다. <span style="font-size:10px;color:#888;">(설득 DC 20)</span>', v: 'inv' }, { l: '초대장은 넣어 두고, 마지막 한 조각까지 함께 먹는다.', v: 'meal' }]; },
    mineTxt: function (v) { return val(v) === 'inv' ? '「초대장을 내민다」' : '「함께 먹는다」'; },
    resolve: function (m) {
        const t = L.tally(m);
        const w = t.win || val(m[X.leader()]);
        if (w === 'inv') {
            const r = partyRoll('t2l', 20, x().t2b || 0);
            if (!r) return { wait: true };
            L.tx('x/t2res', function (cur) { return cur || (r.ok ? 'inv' : 'meal'); });
            return { html: C.rHtml(r) + (r.ok ? '식탁 너머에서 손이 나와 봉투를 받는다.' : '손님이 고개를 젓는다. 초대장은 넣어 두고, 마지막 한 조각까지 함께 먹는다.') };
        }
        L.tx('x/t2res', function (cur) { return cur || 'meal'; });
        return { html: '초대장은 품에 넣는다. 포크를 하나씩 든다.' };
    }
};

// ==========================================
// T3 사랑의 회랑 — 거울 층의 굽이들
// ==========================================
const SIDE = ['왼쪽', '가운데', '오른쪽'];
L.K.t3m = function (step, i) {
    if (guard()) return;
    const m0 = lk();
    m0.t3 = m0.t3 || { r: 0 };
    const q = m0.t3;
    const r = q.r;
    const p = L.plan();
    const X3 = x().t3 || {};
    if (r >= 8) { E('엇갈린 걸음', 'f'); return; }
    // ① 거울 판정 (파티 DC 20)
    const c = partyRoll('t3c' + r, 20, r === 0 ? (x().t3b || 0) : 0);
    if (!c) { draw('3층 — 거울 층', '', X.waitHtml('_none', '거울을 들여다본다…')); return; }
    const intro = r === 0 ? plain(fparse('3층').pages[0].x) + '<br><br>' : '';
    let t = intro + '<div class="wd-sys">굽이 ' + (r + 1) + ' · 마주침 ' + (X3.meet || 0) + ' · 연속 지나침 ' + (X3.streak || 0) + '</div><b>거울 판정</b>' + C.rHtml(c);
    if (!c.ok) t += apply({ mn: -10 }, 't3c' + r);
    // 거울 판정 두 번 연속 실패 — 한 사람에게 즉사 기믹
    const prev = (x().pr2 || {})['t3c' + (r - 1)];
    if (!c.ok && prev && !prev.ok && lowest(act()) === ME()) {
        const s = st();
        s.g = s.g || {};
        if (!s.g[r]) { s.g[r] = 1; instant('거꾸로 당기는 손', s); X.save(); }
        t += instHtml(st());
    }
    if (cs().downNow) { draw('3층 — 거울 층', t, X.btn('…', 'WONDER.view()')); return; }
    const npc = p.npc[r % p.npc.length];
    t += c.ok ? '거울이 맑다. 거울 너머의 손님들이 「' + SIDE[2 - npc] + '」 회랑으로 들어서는 것이 비친다. 거울 속에서는 좌우가 뒤집혀 있다.' : '거울이 흐리다. 저쪽이 어디로 가는지 보이지 않는다. 짐작으로 고른다.';
    // ② 고르기
    const key = 't3v' + r;
    const mv = L.votes(key);
    if (mv[ME()] == null) { draw('3층 — 거울 층', t, SIDE.map(function (sd, k) { return X.btn(sd + ' 회랑', "WONDER.A.t3v(" + r + ',' + k + ')'); }).join('')); return; }
    if (!act().every(function (cc) { return mv[cc] != null; })) { draw('3층 — 거울 층', t, L.waitList(mv)); return; }
    const tl = L.tally(mv);
    const ours = tl.win != null ? +tl.win : +val(mv[X.leader()] != null ? mv[X.leader()] : mv[ME()]);
    const meet = ours !== npc;
    // 결과 적용 — 한 번
    const res = (X3.res || {})[r];
    if (!res) {
        L.tx('x/t3', function (cur) {
            cur = cur || {};
            cur.res = cur.res || {};
            if (cur.res[r]) return cur;
            cur.res[r] = meet ? 'meet' : 'pass';
            if (meet) { cur.meet = (cur.meet || 0) + 1; cur.streak = 0; } else cur.streak = (cur.streak || 0) + 1;
            return cur;
        });
        draw('3층 — 거울 층', t, X.waitHtml('_none', '…'));
        return;
    }
    const pg = fparse('3층');
    const rp = paras(pg.pages.slice(1).map(function (pp) { return pp.x; }).join('<br><br>'));
    const find = function (lab) { return (rp.filter(function (pp) { return pp.indexOf('<i>(' + lab + ')</i>') === 0; })[0] || '').replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, ''); };
    t = '<div class="wd-sys">우리 「' + SIDE[ours] + '」 · 거울 너머 「' + SIDE[npc] + '」</div>';
    if (res === 'pass') { t += find('지나침') + apply({ ht: -10 }, 't3p' + r); if ((X3.streak || 0) >= 3) { E('엇갈린 걸음', 'f'); draw('3층 — 거울 층', t, X.waitHtml('_none', '…')); return; } draw('3층 — 거울 층', t, X.btn('다음 굽이로 간다.', 'WONDER.A.t3n()')); return; }
    if ((X3.meet || 0) <= 1) { t += find('첫 마주침') + apply({ dr: 2 }, 't3m1'); draw('3층 — 거울 층', t, X.btn('다음 굽이로 간다.', 'WONDER.A.t3n()')); return; }
    // 두 번째 마주침부터 — 선물 / 당기기
    t += find('두 번째 마주침');
    const gk = 't3g' + r;
    const gv = L.votes(gk);
    if (gv[ME()] == null) { draw('3층 — 거울 층', t, X.btn('선물을 주고받는다.', "WONDER.A.t3g(" + r + ",'gift')") + X.btn('내민 손을 잡고 이쪽으로 당긴다. <span style="font-size:10px;color:#888;">(설득 DC 21)</span>', "WONDER.A.t3g(" + r + ",'pull')")); return; }
    if (!act().every(function (cc) { return gv[cc] != null; })) { draw('3층 — 거울 층', t, L.waitList(gv)); return; }
    const gt = L.tally(gv);
    const gw = gt.win || val(gv[X.leader()]);
    if (gw === 'gift') { E('각자의 방', 'd'); draw('3층 — 거울 층', t, X.waitHtml('_none', '…')); return; }
    const pr = partyRoll('t3pull' + r, 21, 0);
    if (!pr) { draw('3층 — 거울 층', t, X.waitHtml('_none', '…')); return; }
    if (pr.ok) { E('데려온 손님들', 'w'); draw('3층 — 거울 층', t + C.rHtml(pr), X.waitHtml('_none', '…')); return; }
    draw('3층 — 거울 층', t + C.rHtml(pr) + '거울이 다시 닫힌다. 한 굽이 더.', X.btn('다음 굽이로 간다.', 'WONDER.A.t3n()'));
};
A.t3v = function (r, k) { if (L.votes('t3v' + r)[ME()] == null) L.vote('t3v' + r, k); };
A.t3g = function (r, k) { if (L.votes('t3g' + r)[ME()] == null) L.vote('t3g' + r, k); };
A.t3n = function () { const q = lk().t3; q.r++; F().lk.s = {}; X.save(); X.view(); };

// ==========================================
// T4 붉은 장막 너머 — 각자 길을 고른다
// ==========================================
function t4path(c) { return ((x().t4p || {})[c || ME()]) || null; }
function t4list() {
    const P = x().t4p || {};
    const cur = act().filter(function (c) { return P[c] === 'curtain'; }).map(L.name);
    const door = act().filter(function (c) { return P[c] === 'door'; }).map(L.name);
    return '<div class="wd-sys">장막 길 — ' + (cur.length ? cur.map(esc).join(', ') : '없음') + '<br>문 길 — ' + (door.length ? door.map(esc).join(', ') : '없음') + '</div>';
}
L.K.t4p1 = function (step, i) {
    if (guard()) return;
    const s = st();
    const P = fparse('1층');
    if (!s.tk) { s.tk = 1; tick('st' + i, 2); X.save(); }
    if (t4path()) {
        const cur = t4path() === 'curtain';
        const para = paras(P.rest).filter(function (p) { return p.indexOf(cur ? '<i>(장막 길)</i>' : '<i>(문 길)</i>') === 0; }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); })[0] || '';
        draw('1층 — 장막과 문', (s.pk ? C.rHtml(s.pk) + (s.pk.ok ? '장막 틈으로 안쪽이 보인다. 따뜻하고 좁다.' : descOf(P.opts[2].badS)) + (s.pkT || '') + '<br><br>' : '') + para + (s.fxT || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
        return;
    }
    const opts = P.opts.filter(function (o) { return !(s.pk && o.num === 2); });
    draw('1층 — 장막과 문', plain(P.intro) + (s.pk ? C.rHtml(s.pk) + (s.pk.ok ? '장막 틈으로 안쪽이 보인다. 따뜻하고 좁다.' : descOf(P.opts[2].badS)) + (s.pkT || '') : ''), opts.map(function (o) { return X.btn(optHtml(o), 'WONDER.A.t4p(' + o.num + ')'); }).join(''));
};
A.t4p = function (k) {
    const s = st();
    if (t4path()) return;
    if (k === 2) { if (s.pk) return; s.pk = C.rollDc(20, 0); if (s.pk.ok) lk().t4peek = 1; else s.pkT = apply({ ht: -15 }, 't4pk'); X.save(); X.view(); return; }
    const path = k === 0 ? 'curtain' : 'door';
    if (path === 'curtain') s.fxT = apply({ mn: lk().t4peek ? -5 : -15 }, 't4c1');
    L.pub('x/t4p/' + ME(), path);
    X.save();
};
function t4land(n) {
    return {
        k: 'cTeam', id: 't4l' + n, title: '층계참',
        text: function () { return plain(sub('층계참').p[0].x) + t4list(); },
        opts: function () { return [{ l: '길을 바꾼다.', v: 'swap' }, { l: '돌봄을 건넨다. <span style="font-size:10px;color:#888;">(돌봄 DC 10)</span>', v: 'care', roll: { dc: 10 } }, { l: '손만 한 번 잡고 각자 간다.', v: 'hand' }]; },
        mineTxt: function (v) { return { swap: '「길을 바꾼다」', care: '「돌봄」', hand: '「손만 잡는다」' }[val(v)]; },
        resolve: function (m) {
            const s = st();
            let t = '';
            if (!s.applied) {
                s.applied = 1;
                const mine = m[ME()];
                if (val(mine) === 'swap') L.pub('x/t4p/' + ME(), t4path() === 'curtain' ? 'door' : 'curtain');
                if (Object.keys(m).some(function (c) { return val(m[c]) === 'care' && m[c].ok && c !== ME(); })) s.careT = apply({ hp: 10, mn: 10 }, 't4care' + n);
                X.save();
            }
            const care = Object.keys(m).filter(function (c) { return val(m[c]) === 'care'; });
            t = '난간 너머로 손이 오간다.' + (care.length ? '<div class="wd-sys">돌봄 — ' + care.map(function (c) { return esc(L.name(c)) + (m[c].ok ? ' ✔' : ' ✖'); }).join(', ') + '</div>' : '') + (s.careT || '');
            return { html: t + t4list() };
        }
    };
}
function t4fl(f, n) {
    const base = { k: 'fl', f: f, n: n, personal: true, show: function (nt) { return nt === '문 길'; } };
    return { k: 't4fl', f: f, n: n, base: base };
}
L.K.t4fl = function (step, i) {
    if (guard()) return;
    if (t4path() === 'curtain') {
        const s = st();
        floorPre({ tick: 2 }, i, s);
        const P = fparse(step.f);
        const para = paras(P.intro).filter(function (p) { return p.indexOf('<i>(장막 길)</i>') === 0; }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, ''); })[0] || '';
        const t = apply({ mn: -15 }, 't4c' + step.n);
        if (guard()) return;
        draw(step.f, para + t, X.btn('계속 간다.', 'WONDER.lkNext()'));
        return;
    }
    L.K.fl(step.base, i);
};
L.K.t4end = function (step, i) {
    if (guard()) return;
    const s = st();
    if (!s.tk) { s.tk = 1; tick('st' + i, 1); X.save(); }
    const sc = sub('4층');
    const t0 = plain(sc.p[0].x);
    const D = x().t4d || {};
    if (!D[ME()]) {
        if (t4path() === 'curtain') { L.pub('x/t4d/' + ME(), 1); draw('4층 — 끝 방 앞', t0, X.waitHtml('_none', '…')); return; }
        draw('4층 — 끝 방 앞', t0 + (s.push || '') + '<div class="wd-sys">문은 무겁다. 다들 같이 밀어야 한다. (DC 21 · 실패하면 체력 −20, 다시)</div>', X.btn('문을 민다.', 'WONDER.A.t4push()'));
        return;
    }
    if (!act().every(function (c) { return D[c]; })) { draw('4층 — 끝 방 앞', t0 + (s.push || ''), L.waitList(D)); return; }
    const P = x().t4p || {};
    const paths = act().map(function (c) { return P[c]; });
    if (paths.every(function (p) { return p === 'curtain'; })) E('장막 너머로', 'w');
    else if (paths.every(function (p) { return p === 'door'; })) E('문으로', 'd');
    else E('장막과 문 사이', 'f');
    draw('4층 — 끝 방 앞', t0, X.waitHtml('_none', '…'));
};
A.t4push = function () {
    const s = st();
    const r = C.rollDc(21, 0);
    s.push = (s.push || '') + C.rHtml(r);
    if (r.ok) { L.pub('x/t4d/' + ME(), 1); s.push += '문이 열린다.'; }
    else s.push += apply({ hp: -20 }, 't4push' + Date.now());
    X.save(); X.view();
};

// ==========================================
// T5 사랑받는다는 것 — 돌봄을 센다
// ==========================================
function care(c) { const g = x().cg || {}; return Object.keys(g).filter(function (k) { return g[k] === c; }).length; }
function giveCare(key, to) { L.tx('x/cg/' + key, function (cur) { return cur || to; }); }
function careBar() {
    const p = L.plan();
    return '<span>꽃잎 ' + p.mem.filter(function (c) { return act().indexOf(c) >= 0; }).map(function (c) { return esc(L.name(c)) + ' ' + care(c); }).join(' · ') + '</span>';
}
function stats(c) { return (x().st || {})[c] || { hp: 100, ht: 100, mn: 100 }; }
function t5vote(n, title, textFn, resolveFn) {
    return {
        k: 'cTeam', id: 't5v' + n, title: title, tick: 2,
        text: textFn,
        opts: function () { return fparse(title.split(' — ')[0]).opts.map(function (o) { return { l: optHtml(o), v: o.num }; }); },
        mineTxt: function (v) { return '「' + esc(fparse(title.split(' — ')[0]).opts[val(v)].text) + '」에 투표했습니다.'; },
        resolve: function (m) { const t = L.tally(m); const w = t.win != null ? +t.win : +val(m[X.leader()]); return resolveFn(w); }
    };
}
function wallOf() { return L.plan().wall; }
const T5_1 = t5vote(1, '1층 — 벽의 꽃', function () {
    const w = wallOf();
    const P = fparse('1층');
    let t = plain(P.intro.replace('<i>(무작위 한 사람)</i>', '— ' + esc(L.name(w)) + ' —'));
    if (w === ME()) t += apply({ mn: -20 }, 't5wall');
    return t;
}, function (w) {
    const wall = wallOf();
    const s = st();
    if (w === 2) { if (wall === ME()) s.f = apply({ mn: -10 }, 't5w3'); return { html: '곡이 끝날 때까지 기다렸다가 찾아간다. 벽에 기댄 손이 차갑다.' + (s.f || '') }; }
    const r = partyRoll('t5a' + w, w === 0 ? 20 : 21, 0);
    if (!r) return { wait: true };
    let t = C.rHtml(r);
    if (w === 0) {
        if (r.ok) { giveCare('t5a', wall); if (wall === ME()) s.f = apply({ mn: 15 }, 't5a'); t += '둘이 춤춘다. 벽의 꽃이 원 안으로 들어온다.'; }
        else { if (wall !== ME()) s.f = apply({ ht: -15 }, 't5a'); t += '하얀 가면이 손을 놓아주지 않는다.'; }
    } else {
        if (r.ok) { act().forEach(function (c) { giveCare('t5b_' + c, c); }); s.f = apply({ dr: 3 }, 't5b'); t += '모두 손을 놓고 둥글게 선다. 원을 그리며 춘다.'; }
        else { s.f = apply({ mn: -10 }, 't5b'); t += '하얀 가면들이 따라와 다시 나눈다.'; }
    }
    return { html: t + (s.f || '') };
});
const T5_2 = t5vote(2, '2층 — 한 사람 몫', function () { return plain(fparse('2층').intro); }, function (w) {
    const s = st();
    const p = L.plan();
    const alive = act();
    let eater = null, t = '';
    if (w === 0) eater = alive.slice().sort(function (a, b) { const A1 = stats(a), B1 = stats(b); return (A1.hp + A1.ht + A1.mn) - (B1.hp + B1.ht + B1.mn) || (a < b ? -1 : 1); })[0];
    else if (w === 1) eater = alive.slice().sort(function (a, b) { return care(a) - care(b) || (a < b ? -1 : 1); })[0];
    else {
        const r = partyRoll('t5c', 20, 0);
        if (!r) return { wait: true };
        t += C.rHtml(r) + (r.ok ? '조금씩 나눠 먹는다.' + apply({ hp: 10 }, 't5c') : '접시가 식어 버렸다.');
    }
    if (eater) {
        giveCare('t5eat', eater);
        if (eater === ME()) t += apply({ hp: 30, ht: 15 }, 't5eat');
        t = esc(L.name(eater)) + josa(L.name(eater), '이', '가') + ' 먹는다. 따뜻하다.' + t;
    }
    const drift = p.mem.filter(function (c) { return c !== eater && alive.indexOf(c) >= 0; })[0];
    if (drift) { t += '<br><br>' + esc(L.name(drift)) + '의 의자가 저절로 식탁에서 멀어진다. 조금씩.'; if (drift === ME()) t += apply({ ht: -20 }, 't5drift'); }
    return { html: t };
});
function mirrorOf() {
    return act().slice().sort(function (a, b) { return care(b) - care(a) || (a < b ? -1 : 1); })[0];
}
const T5_3 = t5vote(3, '3층 — 한 사람만 비추는 거울', function () {
    const P = fparse('3층');
    return plain(P.intro).replace('<br><br>(지금까지 돌봄을 가장 많이 받은 사람)', '') + '<div class="wd-sys">거울에 비친 사람 — ' + esc(L.name(mirrorOf())) + '</div>';
}, function (w) {
    const s = st();
    const who = mirrorOf();
    const r = partyRoll('t5m' + w, [20, 21, 19][w], 0);
    if (!r) return { wait: true };
    let t = C.rHtml(r);
    if (w === 0) {
        if (r.ok) { act().forEach(function (c) { if (c !== who) giveCare('t5m_' + c, c); }); t += '비친 사람이 손을 잡는다. 거울에 함께 비친다.'; }
        else { t += '거울 속의 그가 손을 놓아주지 않는다.'; if (who === ME()) { s.g = s.g || 0; if (!s.g) { s.g = 1; instant('거울 속의 사랑받는 손님', s); X.save(); } t += instHtml(s); } }
    } else if (w === 1) {
        t += r.ok ? '비친 사람을 거울에서 떼어 놓았다.' : '떼어 내는 동안 비친 사람이 거울 속 얼굴을 오래 보았다.';
        if (!r.ok && who === ME()) t += apply({ mn: -20 }, 't5m2');
    } else {
        t += r.ok ? '거울을 등지고 서로를 본다. 거울이 모두를 비춘다.' + apply({ dr: 3 }, 't5m3') : '서로를 보는데 눈이 자꾸 거울로 간다.' + apply({ ht: -10 }, 't5m3');
    }
    return { html: t };
});
L.K.c_t5end = function (step, i) {
    if (guard()) return;
    const s = st();
    if (!s.tk) { s.tk = 1; tick('st' + i, 1); X.save(); }
    const sc = sub('4층');
    const t0 = plain(sc.p.map(function (p) { return p.x; }).join('<br><br>'));
    const alive = act();
    const dn = x().dn || {};
    const pm = L.plan().mem;
    if (pm.some(function (c) { return care(c) === 0 && dn[c]; })) { E('혼자 남은 손님', 'f'); draw('4층 — 가장 사랑받는 자리', t0, X.waitHtml('_none', '…')); return; }
    const cs2 = alive.map(function (c) { return { c: c, n: care(c) }; }).sort(function (a, b) { return b.n - a.n || (a.c < b.c ? -1 : 1); });
    const top = cs2[0];
    const rest = cs2.slice(1).reduce(function (a, b) { return a + b.n; }, 0);
    let mirror = null;
    if (top.n > rest) mirror = top.c;
    else if (cs2.every(function (o) { return o.n >= 1; })) { E('고르게', 'd'); draw('4층 — 가장 사랑받는 자리', t0, X.waitHtml('_none', '…')); return; }
    else mirror = top.c;
    const r = partyRoll('t5end', 20, 0);
    if (!r) { draw('4층 — 가장 사랑받는 자리', t0, X.waitHtml('_none', esc(L.name(mirror)) + josa(L.name(mirror), '이', '가') + ' 의자에 앉는다…')); return; }
    E(r.ok ? '가장 사랑받는 손님' : '거울이 고른 얼굴', r.ok ? 'w' : 'f');
    draw('4층 — 가장 사랑받는 자리', t0 + '<div class="wd-sys">거울 판정 — ' + esc(L.name(mirror)) + '</div>' + C.rHtml(r), X.waitHtml('_none', '…'));
};

// ==========================================
// T6 끝나지 않는 춤
// ==========================================
const T6_DC = [14, 16, 18, 20];
function stopped(c) { return !!((x().stop || {})[c || ME()]); }
function anyDancing() { return act().some(function (c) { return !stopped(c); }); }
L.K.t6d = function (step, i) {
    if (guard()) return;
    const s = st();
    const n = step.n;
    const dc = T6_DC[n - 1];
    if (!s.tk) { s.tk = 1; tick('t6d' + n, anyDancing() ? 2 : 6); X.save(); if (guard()) return; }
    const key = 't6d' + n;
    const m = L.votes(key);
    const head = '<div class="wd-sys">' + n + '층 — 「끝나지 않는 춤」 판정 DC ' + dc + '</div>';
    if (m[ME()] == null) {
        if (stopped()) { L.vote(key, { v: 'stop' }); draw('끝나지 않는 춤', head + '당신은 멈춰 있다. 춤추는 일행을 본다.', X.waitHtml('_none', '…')); return; }
        if (!s.r) {
            let b = X.btn('박자를 탄다. <span style="font-size:10px;color:#888;">(DC ' + dc + ')</span>', 'WONDER.A.t6r(' + n + ',0)');
            if (X.has && X.has('빌린 가면') && !lk().used['빌린 가면']) b += X.btn('빌린 가면을 고쳐 쓰고 춘다. <span style="font-size:10px;color:#d4af37;">(빌린 가면 · +5)</span>', 'WONDER.A.t6r(' + n + ',1)');
            draw('끝나지 않는 춤', head + '하나, 둘, 셋. 발이 먼저 박자를 탄다.', b);
            return;
        }
        if (!s.r.ok && !s.lace && X.has && X.has('무도회 구두끈') && !lk().used['무도회 구두끈']) {
            draw('끝나지 않는 춤', head + C.rHtml(s.r) + '박자가 하나 어긋난다.', X.btn('구두끈을 단단히 묶는다. <span style="font-size:10px;color:#d4af37;">(무도회 구두끈 · 이번 실패를 없던 일로)</span>', 'WONDER.A.t6lace(' + n + ')') + X.btn('그대로 둔다.', 'WONDER.A.t6pub(' + n + ')'));
            return;
        }
        A.t6pub(n);
        return;
    }
    if (!act().every(function (c) { return m[c] != null; })) { draw('끝나지 않는 춤', head + (s.r ? C.rHtml(s.r) : ''), L.waitList(m)); return; }
    const caught = act().filter(function (c) { return m[c] && m[c].v === 'd' && !m[c].ok; });
    if (!caught.length) { draw('끝나지 않는 춤', head + (s.r ? C.rHtml(s.r) : '') + '모두 박자를 지켰다.', X.btn('계속 간다.', 'WONDER.lkNext()')); return; }
    // 붙잡힌 사람 — 멈춘 동료가 구해야 한다
    const gim = paras(sub('이번 판 규칙').p.map(function (p) { return p.x; }).join('<br><br>')).filter(function (p) { return /즉사 기믹/.test(p); })[0] || '';
    const sk = 't6s' + n;
    const sv = L.votes(sk);
    const rescuers = act().filter(function (c) { return caught.indexOf(c) < 0; });
    const t = head + '<div class="wd-sys">붙잡힌 사람 — ' + caught.map(L.name).map(esc).join(', ') + '</div>' + plain(gim);
    if (rescuers.indexOf(ME()) >= 0 && sv[ME()] == null) {
        draw('춤에 붙잡힘', t, X.btn('춤을 멈추고 원 안으로 손을 넣는다. <span style="font-size:10px;color:#888;">(DC 17 · 이후 멈춘 사람)</span>', 'WONDER.A.t6s(' + n + ',1)') + (stopped() ? '' : X.btn('계속 춘다.', 'WONDER.A.t6s(' + n + ',0)')));
        return;
    }
    if (!rescuers.every(function (c) { return sv[c] != null; })) { draw('춤에 붙잡힘', t, L.waitList(sv, rescuers)); return; }
    const saved = rescuers.some(function (c) { return sv[c] && sv[c].v === 'save' && sv[c].ok; });
    const list = rescuers.filter(function (c) { return sv[c] && sv[c].v === 'save'; }).map(function (c) { return esc(L.name(c)) + ' ' + sv[c].n + ' / 17 ' + (sv[c].ok ? '✔' : '✖'); }).join(' · ');
    if (!saved) { E('원 안에 남은 사람', 'f', { lost: caught }); draw('춤에 붙잡힘', t + (list ? '<div class="wd-sys">' + list + '</div>' : ''), X.waitHtml('_none', '…')); return; }
    draw('춤에 붙잡힘', t + '<div class="wd-sys">' + list + '</div>멈춘 손이 원 안으로 들어가 붙잡힌 사람을 끌어낸다.', X.btn('계속 간다.', 'WONDER.lkNext()'));
};
A.t6r = function (n, mask) {
    const s = st();
    if (s.r) return;
    let b = (lk().t6b || 0) + (x().t6b3 && (x().t6b3 === n) ? 3 : 0);
    if (mask && !lk().used['빌린 가면'] && X.spend('빌린 가면')) { lk().used['빌린 가면'] = 1; b += 5; }
    lk().t6b = 0;
    s.r = C.rollDc(T6_DC[n - 1], b);
    X.save(); X.view();
};
A.t6lace = function (n) {
    const s = st();
    if (!X.spend('무도회 구두끈')) return;
    lk().used['무도회 구두끈'] = 1;
    s.lace = 1;
    s.r = Object.assign({}, s.r, { ok: true, laced: 1 });
    X.save();
    A.t6pub(n);
};
A.t6pub = function (n) {
    const s = st();
    if (L.votes('t6d' + n)[ME()] != null) return;
    s.lace = s.lace || 1;
    L.vote('t6d' + n, { v: 'd', ok: s.r.ok, n: s.r.total });
    X.save();
};
A.t6s = function (n, k) {
    if (L.votes('t6s' + n)[ME()] != null) return;
    if (k) {
        const r = C.rollDc(17, 0);
        L.pub('x/stop/' + ME(), 1);
        L.vote('t6s' + n, { v: 'save', ok: r.ok, n: r.total });
    } else L.vote('t6s' + n, { v: 'dance' });
};
function t6fl(f, n) {
    return {
        k: 'fl', f: f, n: n, personal: true, tick: 0, mask: false,
        filter: function (o) {
            if (n === 2 && o.num === 1) return stopped();
            if (n === 3 && o.num === 2) return stopped();
            if (n === 1 && o.num === 2) return !stopped();
            return true;
        },
        after: function (o, ok) {
            if (n === 1 && o.num === 2) { L.pub('x/stop/' + ME(), 1); return { html: '<div class="wd-sys">당신은 이제 멈춘 사람입니다.</div>' }; }
            if (n === 1 && o.num === 1 && ok === false) lk().t6b = -2;
            if (n === 3 && o.num === 2 && ok) L.tx('x/t6b3', function () { return 4; });
            return null;
        }
    };
}
function t6endDecide() {
    if (Object.keys(x().stop || {}).length) return { end: ['멈추고, 구하고', 'd'] };
    return { end: ['끝까지 추다', 'w'] };
}

// ==========================================
// T7 시드는 장미 — 병에 모은다
// ==========================================
function bottle() { return sum(x().t7); }
function shares() { return sum(x().t7s); }
function target() { return L.plan().mem.length * 4; }
function t7bar() { return '<span>유리병 <b>' + bottle() + ' / ' + target() + '</b></span><span>나눔 ' + shares() + '</span>'; }
function t7add(key, n) { L.tx('x/t7/' + key, function (cur) { return cur == null ? n : cur; }); }
function t7share(key) { L.tx('x/t7s/' + key, function (cur) { return cur == null ? 1 : cur; }); }
function t7f(n, f) {
    return {
        k: 'cTeam', id: 't7v' + n, title: f, tick: 2,
        text: function () { const P = fparse(f.split(' — ')[0]); return plain(P.intro); },
        opts: function () { return fparse(f.split(' — ')[0]).opts.map(function (o) { return { l: optHtml(o), v: o.num }; }); },
        mineTxt: function (v) { return '「' + esc(fparse(f.split(' — ')[0]).opts[val(v)].text) + '」에 투표했습니다.'; },
        resolve: function (m) {
            const t0 = L.tally(m);
            const w = t0.win != null ? +t0.win : +val(m[X.leader()]);
            const P = fparse(f.split(' — ')[0]);
            const o = P.opts[w];
            const N = L.plan().mem.length;
            const s = st();
            const k = 'f' + n;
            if (!o.dc) {
                // 밀실 거래 — 가진 것에서 일행 수만큼 덜어 준다
                const give = Math.min(bottle() + ((x().t7 || {})[k] || 0) * -1, N);
                if ((x().t7 || {})[k] == null) { t7add(k, -Math.max(0, Math.min(bottle(), N))); t7share(k); return { wait: true }; }
                return { html: '손님의 손바닥에 꿈결을 덜어 준다. 받은 쪽의 가면이 또렷해진다.<div class="wd-sys">유리병 −' + Math.abs((x().t7 || {})[k]) + ' · 나눔 +1</div>' };
            }
            const r = partyRoll('t7' + n, o.dc, 0);
            if (!r) return { wait: true };
            let t = C.rHtml(r) + (r.ok ? descOf(o.okS) || '해냈다.' : descOf(o.badS) || '잘 되지 않았다.');
            const str = r.ok ? o.okS : o.badS;
            const mul = str.match(/\+일행 수(?:\s*×\s*(\d+))?/);
            if (mul && (x().t7 || {})[k] == null) { t7add(k, N * (+mul[1] || 1)); return { wait: true }; }
            if (/나눔/.test(str) && (x().t7s || {})[k] == null) { t7share(k); return { wait: true }; }
            if (mul) t += '<div class="wd-sys">유리병 +' + (x().t7 || {})[k] + '</div>';
            t += apply(fx(str.replace(/\+일행 수[^·]*/, '')), 't7f' + n);
            if (!r.ok && /즉사 기믹/.test(o.badS) && lowest(act()) === ME()) { if (!s.g) { s.g = 1; instant('장미 가시', s); X.save(); } t += instHtml(s); }
            return { html: t };
        }
    };
}
const T7_END = {
    k: 'cTeam', id: 't7e', title: '4층 — 뿌리의 방',
    text: function () { return plain(fparse('4층').intro); },
    opts: function () { return fparse('4층').opts.map(function (o) { return { l: optHtml(o), v: o.num }; }); },
    mineTxt: function (v) { return '「' + esc(fparse('4층').opts[val(v)].text) + '」'; },
    resolve: function (m) {
        const t0 = L.tally(m);
        const w = t0.win != null ? +t0.win : +val(m[X.leader()]);
        if (w === 1) return { end: ['나눈 꿈결', 'd'] };
        if (bottle() >= target()) return { end: ['한 줌', 'w'] };
        return { end: ['반씩', 'f'] };
    }
};

// ==========================================
// T8 각성의 밤 — 가면 쪽 / 얼굴 쪽
// ==========================================
function t8() { const m = lk(); m.t8 = m.t8 || { b: 0, picks: [] }; return m.t8; }
function t8k(n) {
    return {
        k: 'cTeam', id: 't8k' + n, title: '갈림길 — ' + n + '층',
        text: function () { const sc = sub('갈림길'); return plain(sc.p[0].x) + '<div class="wd-sys">가면 쪽 — 판정 +2(쌓임) · 정신력 −15 / 얼굴 쪽 — 이 층 판정 DC +2</div>'; },
        opts: function () { return [{ l: '가면 쪽으로 간다.', v: 'mask' }, { l: '얼굴 쪽으로 간다.', v: 'face' }]; },
        mineTxt: function (v) { return val(v) === 'mask' ? '「가면 쪽」' : '「얼굴 쪽」'; },
        resolve: function (m) {
            const q = t8();
            const mine = val(m[ME()]);
            const s = st();
            if (!s.ap) {
                s.ap = 1;
                q.picks[n - 1] = mine;
                if (mine === 'mask') { q.b += 2; s.fxT = apply({ mn: q.m5 ? -5 : -15 }, 't8k' + n); q.m5 = 0; }
                else q.face = n;
                X.save();
            }
            const sc = sub('갈림길');
            const para = paras(sc.p[1] ? sc.p[1].x : '').filter(function (p) { return p.indexOf(mine === 'mask' ? '<i>(가면 쪽)</i>' : '<i>(얼굴 쪽)</i>') === 0; }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); })[0] || '';
            return { html: para + (s.fxT || '') };
        }
    };
}
function t8fl(f, n) {
    return {
        k: 'fl', f: f, n: n,
        bonus: function (o, s, party) { return party ? 0 : t8().b + (o.dia ? 2 : 0); },
        dcAdd: function (o, s, party) { return party ? 0 : (t8().face === n ? 2 : 0); },
        fxMod: function (o, ok, e) {
            if (n === 2 && o.num === 0 && ok == null) { const stg = 1 + t8().picks.filter(function (p) { return p === 'mask'; }).length; e.hp = 10 + 5 * (stg - 1); }
            return e;
        },
        after: function (o, ok) { if (n === 3 && o.num === 0 && ok) t8().m5 = 1; return null; }
    };
}
function t8mine() {
    const q = t8();
    const ps = q.picks;
    if (ps.length === 4 && ps.every(function (p) { return p === 'mask'; })) return { t: '이름 있는 손님', r: 'w' };
    if (ps.length === 4 && ps.every(function (p) { return p === 'face'; })) return { t: '던전의 손님', r: 'd' };
    return null;
}
function t8decide() {
    const all = act();
    const v = [1, 2, 3, 4].map(function (n) { return L.votes('t8k' + n); });
    const mixed = all.some(function (c) { const ps = v.map(function (m) { return val(m[c]); }); return !(ps.every(function (p) { return p === 'mask'; }) || ps.every(function (p) { return p === 'face'; })); });
    if (mixed) return { end: ['두 얼굴', 'f'] };
    return { end: ['각성의 밤', 'w'] };
}

// ==========================================
// 미션 표
// ==========================================
L.M.succubus = {
    S1: M(16, {
        steps: COMMON.concat([
            { k: 'fl', f: '1층', n: 1, tick: 1, tail: true, next: function () { return next(1); } },
            { k: 's1wear', f: '2층', n: 2 }, s1floor('2층', 2),
            { k: 's1wear', f: '3층', n: 3 }, s1floor('3층', 3),
            { k: 's1end' }
        ])
    }),
    S2: M(24, {
        mnEnd: '너무 많은 날들',
        plan2: function (p, rnd) { p.nm = Math.floor(rnd() * S2_NAMES.length); },
        steps: COMMON.concat([{ k: 's2f', f: '1층', n: 1 }, { k: 's2f', f: '2층', n: 2, rest: 1 }, { k: 's2f', f: '3층', n: 3, rest: 1 }, { k: 'c_s2door', rest: 1 }])
    }),
    S3: M(33, {
        plan2: function (p, rnd) { p.jobs = X.shuffle(JOBS, rnd).slice(0, 5); },
        steps: COMMON.concat([
            { k: 's3f1' }, { k: 's3off', n: 1 },
            { k: 'fl', f: '2층', n: 2, rest: 1, show: maskedShow, filter: function (o) { return !o.dia || s3().masked; }, bonus: s3bonus, next: function () { return next(1); } },
            { k: 's3off', n: 2 },
            { k: 's3f3', rest: 1 }, { k: 's3off', n: 3 },
            { k: 's3end', rest: 1 }
        ])
    }),
    S4: M(41, {
        downEnd: '담다가 쓰러짐',
        steps: COMMON.concat([{ k: 's4f', f: '1층', n: 1 }, { k: 's4f', f: '2층', n: 2, rest: 1 }, { k: 's4f', f: '3층', n: 3, rest: 1 }, { k: 'c_s4end', rest: 1 }])
    }),
    T1: M(49, {
        downEnd: '둘 이상 쓰러짐',
        steps: COMMON.concat([
            { k: 'fl', f: '1층', n: 1, bonus: maskBonus, tail: true }, t1ret(1), t1roll(1),
            { k: 'fl', f: '2층', n: 2, rest: 1, bonus: maskBonus }, t1ret(2), t1roll(2),
            { k: 'fl', f: '3층', n: 3, rest: 1, instName: '제 얼굴로', after: function (o, ok) { if (o.num === 0 && ok) L.tx('x/t1b3', function () { return 1; }); if (o.num === 2 && ok) lk().t1b = 5; return null; } }, t1ret(3), t1roll(3),
            endStep('4층', function () {
                if (sum(x().dn) >= 2) return { end: ['둘 이상 쓰러짐', 'f'] };
                return x().t1ret ? { end: ['돌려받은 얼굴', 'd'] } : { end: ['바꾼 채로', 'w'] };
            })
        ])
    }),
    T2: M(57, {
        steps: COMMON.concat([
            { k: 'fl', f: '1층', n: 1, after: function (o, ok) { if (o.num === 1 && ok) L.tx('x/t2b', function () { return 3; }); return null; } },
            T2_SEAT, { k: 't2din' }, T2_LAST,
            { k: 'fl', f: '3층', n: 3, rest: 1, instName: '거울 속 손님' },
            endStep('4층', function () { const r = x().t2res; return r === 'inv' ? { end: ['받은 초대장', 'w'] } : { end: ['함께 끝낸 만찬', 'd'] }; })
        ])
    }),
    T3: M(65, {
        plan2: function (p, rnd) { p.npc = [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return Math.floor(rnd() * 3); }); },
        steps: COMMON.concat([
            { k: 'fl', f: '1~2층', n: 1, tick: 3, tail: true, after: function (o, ok) { if (o.num === 0 && ok) L.tx('x/t3b', function () { return 3; }); return null; } },
            { k: 't3m' }
        ])
    }),
    T4: M(72, {
        steps: COMMON.concat([{ k: 't4p1' }, t4land(1), t4fl('2층', 2), t4land(2), t4fl('3층', 3), t4land(3), { k: 't4end' }])
    }),
    T5: M(81, {
        plan2: function (p, rnd) { p.wall = p.mem[Math.floor(rnd() * p.mem.length)]; p.mem = X.shuffle(p.mem, rnd).sort(); },
        onCare: function (c) { giveCare('rescue' + Date.now(), c); },
        extra: careBar,
        steps: COMMON.concat([T5_1, T5_2, T5_3, { k: 'c_t5end' }])
    }),
    T6: M(89, {
        downEnd: '원 안에 남은 사람',
        extra: function () { return '<span>' + (stopped() ? '멈춤' : '춤추는 중') + '</span>'; },
        steps: COMMON.concat([
            { k: 't6d', n: 1 }, t6fl('1층', 1), { k: 't6d', n: 2 }, t6fl('2층', 2), { k: 't6d', n: 3 }, t6fl('3층', 3), { k: 't6d', n: 4 },
            endStep('4층', t6endDecide)
        ]),
        endMine: function (end, e) {
            if (end.t !== '원 안에 남은 사람' || (end.lost || []).indexOf(ME()) < 0) return null;
            return { die: '하얀 가면들의 원 한가운데로. 웃고 있다. 웃고 있는 것 같다.<br><br>(쓰러짐)' };
        }
    }),
    T7: M(97, {
        noDream: true,
        extra: t7bar,
        steps: COMMON.concat([t7f(1, '1층 — 내리는 가루'), t7f(2, '2층 — 나누는 식탁'), t7f(3, '3층 — 마른 거울'), T7_END])
    }),
    T8: M(105, {
        mnEnd: '가면이 남긴 것',
        extra: function () { return '<span>가면 단계 <b>' + (1 + t8().picks.filter(function (p) { return p === 'mask'; }).length) + '</b></span>'; },
        steps: COMMON.concat([t8k(1), t8fl('1층', 1), t8k(2), t8fl('2층', 2), t8k(3), t8fl('3층', 3), t8k(4), endStep('4층', function () {
            const v = L.votes('t8k4');
            if (!act().every(function (c) { return v[c] != null; })) return { wait: '…' };
            return t8decide();
        })]),
        cMore: function () {
            const mine = t8mine();
            if (!mine) return {};
            const sc = L.sub('c_new', 105, '결말');
            const out = {};
            let cur = null, got = null;
            paras(sc.p[0].x).forEach(function (q) {
                const m = q.match(/^<b>([✔✖])\s*([^<]+)<\/b>/);
                if (m) { cur = m[2].trim() === mine.t ? ['<b>✔ ' + mine.t + '</b>'] : null; if (cur) got = cur; return; }
                if (cur) cur.push(q);
            });
            const body = [], ret = [];
            (got || []).forEach(function (q) { if (/^<i>\(귀환\)<\/i>/.test(q)) ret.push(q.replace(/^<i>\(귀환\)<\/i>\s*/, '')); else body.push(q.replace(/<i>\([^)]*\)<\/i>/g, '').trim()); });
            out['각성의 밤'] = { ok: true, t: '각성의 밤', body: body, ret: ret.join(' ') || null };
            return out;
        },
        endMine: function (end) {
            if (end.t !== '각성의 밤') return null;
            const mine = t8mine();
            return mine ? { r: mine.r } : { r: 'f' };
        }
    })
};
// T6 — 4층에 닿는 걸음도 춤 박자를 탄다
L.M.succubus.T6.steps.forEach(function (s) { if (s.k === 'cEndS') s.tick = 0; });

// 챕터에 건다
X.chapters.succubus.link = function (api, mid) { L.run('succubus', mid); };

console.log('[이상한 나라] 잠든 저택 — 던전의 손님판 12종 연결');
})();
