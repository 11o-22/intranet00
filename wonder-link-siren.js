// ==========================================
// ★ 「이상한 나라의 ■■■」 — 세이렌 연계판 「물고기가 인간이 되었다」 (몽환)
// bundles.json 마지막 묶음 — wonder-ch-siren.js 다음
// ==========================================
//
//   원고: 「세이렌의 장 · 몽환 — 원고」 문서의 연계판 공통 뼈대 · 진입 · 귀환 · S1~T8.
//   A-667 의 뼈대 가운데 이 판에 쓰는 것:
//     · 인간성 — 90에서 시작, 사람마다 따로. 0이면 기존 변이(「오래 걸리셨네요.」) = 죽음.
//       팀에서 한 사람이 0에 닿으면 그 사람은 죽고, 나머지는 실패 귀환.
//       원고 수치: 조금 5 · 줄어든다 10 · 크게 20, 수압은 수심 15 m마다 2, 「칸」은 20 m.
//     · 수심 50 m 아래 — 글자가 흔들린다(화면 효과).
//     · 인간성 50 아래 — 자기 확인 질문의 두 글자가 뒤바뀔 수 있다(누른 글자와 다른 대답이 나간다).
//     · 자기 확인 질문 — 맞히면 조금 되찾고, 틀리면 줄어든다.
//   제한 시간은 없다(원고에 없음). 이벤트 샵: 바닷물 사탕 +15 · 조개 거울(자기 확인 한 번 반드시 맞힘)
//   · 소라 귀마개(노래로 깎이는 인간성 한 번 막음) · 진주 단추(T1 증언 참/거짓) · 티타임 각설탕(T1 오답 한 번 무효).
//
//   공용 도구(wonder-link.js)를 고치지 않고, 이 파일 안에서 세이렌 판일 때만 감싼다:
//     L.draw   — 인간성 · 수심 줄과 흔들림
//     L.endings — 원고에 없는 결말 두 개(「일행을 잃다」 · 「시간」)를 덧붙인다

(function wonderLinkSiren() {
'use strict';
const X = window.WONDER;
if (!X || !X.L || !X.SIREN) return;
const L = X.L;
const SX = X.SIREN;
const A = X.A = X.A || {};
const SA = X.SA = {};
function F() { return X.F(); }
function ME() { return currentUser.code; }
function me() { return L.me(); }
function st() { return F().lk.s; }
function esc(s) { return L.esc(s); }
function josa(w, a, b) { return SX.josa(w, a, b); }
function paras(x) { return String(x || '').split('<br><br>'); }
function on() { const lk = me(); return !!(lk && lk.ch === 'siren'); }
function scn(name) { return L.sub('s_new', L.def().base, name); }
function p0(name) { const s = scn(name); return s ? s.p[0] : { x: '', o: [] }; }
function shuf(a, rnd) { return X.shuffle(a, rnd); }
function E(t, r, extra) { L.end(t, r, extra); }
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function n0() { const p = L.plan(); return p ? p.mem.length : X.actives().length; }

// 귀환(공통)의 마지막 메모 문단은 화면에 내지 않는다
(function () {
    const s = (window.WONDER_MD || {}).s_new;
    if (!s || !s[18]) return;
    s[18].p[0].x = paras(s[18].p[0].x).filter(function (q) { return !/^<i>부탁한 인어가/.test(q); }).join('<br><br>');
})();

// ==========================================
// 인간성 · 수심
// ==========================================
function H() { const lk = me(); if (lk.h == null) lk.h = 90; return lk.h; }
function D() { const lk = me(); return lk.d || 0; }
SA.H = H; SA.D = D;
// 노래로 깎이는 것은 소라 귀마개가 한 번 막는다
function hum(delta, o) {
    o = o || {};
    const lk = me();
    if (lk.dead) return 0;
    if (delta < 0 && o.song && X.has && X.has('소라 귀마개') && !lk.ear && X.spend('소라 귀마개')) {
        lk.ear = 1;
        lk.note = '◈ 소라 귀마개 — 이번 노래는 들리지 않았습니다.';
        X.save();
        return 0;
    }
    const before = H();
    lk.h = Math.max(0, Math.min(100, before + delta));
    X.pub('lk/' + L.rk() + '/x/h/' + ME(), lk.h);
    X.save();
    if (lk.h <= 0) zero();
    return lk.h - before;
}
SA.hum = hum;
function down(m, extra) {
    const lk = me();
    const prev = D();
    lk.d = Math.max(0, prev + m);
    const bands = Math.floor(lk.d / 15) - Math.floor(prev / 15);
    let loss = (extra || 0);
    if (bands > 0) loss += bands * 2;
    X.save();
    if (loss) hum(-loss);
}
SA.down = down;
// 0 — 기존 변이 · 죽음. 팀이면 나머지는 실패 귀환
function zero() {
    const lk = me();
    if (lk.dead) return;
    lk.dead = 1;
    X.save();
    const d = L.def() || {};
    const Es = L.endings();
    const z = Es[d.zeroEnd || '인간성 0'] || Es['인간성 0'];
    let txt = z && z.body.length ? z.body.join('<br><br>').replace(/기존 변이(\.|\s*—)\s*/g, '').replace(/\s*→\s*(그 사람은\s*)?죽음[^<]*/g, '').trim() : '';
    if (!/오래 걸리셨네요/.test(txt)) txt = (txt ? txt + '<br><br>' : '') + '다가오는 불빛 가운데 하나가 이쪽을 비춘다.<br><br>“오래 걸리셨네요.”';
    if (L.team()) L.end('일행을 잃다', 'f', { dead: ME() });
    setTimeout(function () { X.die(txt); }, 50);
}

// 화면 — 인간성 · 수심 줄, 50 m 아래 흔들림
(function () {
    const _d = L.draw;
    L.draw = function (title, text, extra) {
        if (!on()) return _d.apply(this, arguments);
        const lk = me();
        const h = H(), d = D();
        const col = h >= 50 ? '#7ec8e3' : h >= 25 ? '#ff9800' : '#f44336';
        let bar = '<div class="wd-bar" style="border-color:#1d3a4a;"><span>인간성 <b style="color:' + col + ';">' + h + '</b></span><span>수심 <b>' + d + ' m</b></span>'
            + (lk.comp ? '<span>동행 — ' + esc(lk.comp) + '</span>' : '') + '</div>';
        if (X.has && X.has('바닷물 사탕') && h < 100) bar += X.btn('🍬 바닷물 사탕을 문다. <span style="font-size:10px;color:#d4af37;">(인간성 +15)</span>', 'WONDER.SA.candy()');
        if (lk.note) { bar += '<div class="wd-sys">' + lk.note + '</div>'; lk.note = null; }
        let t = text || '';
        if (d >= 50) t = '<span style="display:inline-block; filter:blur(0.35px); letter-spacing:0.6px; transform:skewX(-3deg);">' + t + '</span>';
        return _d.call(this, title, bar + t, extra);
    };
})();
SA.candy = function () {
    if (!X.spend('바닷물 사탕')) return;
    hum(15);
    me().note = '◈ 바닷물 사탕 — 짠맛 끝에 단맛이 남습니다. 인간성 +15';
    X.save(); X.view();
};

// 원고에 없는 결말 — 일행을 잃다(팀에서 한 사람이 0) · 시간
(function () {
    const _e = L.endings;
    L.endings = function () {
        const o = _e.apply(this, arguments);
        if (!on()) return o;
        if (!o['일행을 잃다']) o['일행을 잃다'] = { ok: false, t: '일행을 잃다', body: ['일행 하나가 등불 든 것들 사이에 섞인다. 이름을 불러도 돌아보지 않는다. 노래가 멀어진다.'], ret: null };
        if (!o['시간']) o['시간'] = { ok: false, t: '시간', body: ['노래가 멀다. 등불 든 것들이 하나씩 아래로 돌아간다. 여기서 더 할 수 있는 일이 없다.'], ret: null };
        return o;
    };
})();

// ==========================================
// 지문 — (혼자) (둘) (혼자 · 둘) (셋 · 넷) 문단, 메모 지우기, 동행 인어 이름
// ==========================================
function cond(x) {
    const n = n0();
    const lk = me();
    const req = SX.REQ[lk.mid];
    return paras(x).filter(function (q) {
        const m = q.match(/^<i>\(([^)]*)\)<\/i>/);
        if (!m) return true;
        const t = m[1];
        if (t === '혼자') return n === 1;
        if (t === '둘') return n === 2;
        if (t === '혼자 · 둘') return n <= 2;
        if (t === '셋 · 넷' || t === '셋 이상') return n >= 3;
        return false;
    }).map(function (q) {
        const m = q.match(/^<i>\(([^)]*)\)<\/i>/);
        q = q.replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, '');
        if (m && lk.comp && req && req !== '세이렌' && req !== lk.comp) q = SX.rename(q, req, lk.comp);
        if (m && lk.comp && /동행 인어/.test(q)) q = q.replace(/동행 인어/g, lk.comp);
        return q;
    }).join('<br><br>');
}
SA.cond = cond;

// ==========================================
// 자기 확인 질문
// ==========================================
const Q = {
    finger: { q: '손가락이 몇 개입니까?', o: ['열 개', '열한 개', '아홉 개'] },
    name: { q: '당신의 이름을 적으십시오.', o: null },
    breath: { q: '숨을 쉬고 있습니까?', o: ['예', '아니요'] },
    water: { q: '물은 마시는 것입니까, 있는 것입니까?', o: ['마시는 것', '있는 것'] },
    what: { q: '당신은 무엇입니까?', o: ['사람', '물고기', '모르겠다'] }
};
SA.Q = Q;
function qOpts(k) {
    if (k !== 'name') return Q[k].o;
    const nm = currentUser.name || '나';
    return [nm, nm.charAt(0) + '■' + (nm.length > 2 ? nm.slice(2) : ''), '기억나지 않는다'];
}
// 자기 확인 화면 조각 — s.q 에 결과를 담는다. 끝나면 after() 로
function askHtml(s, k, tag) {
    const lk = me();
    if (s['q' + tag]) {
        const r = s['q' + tag];
        return '<div class="wd-note" style="border-color:#1d3a4a;">“' + Q[k].q + '” — ' + esc(r.said) + '<br>' + (r.ok ? '<span style="color:#7ec8e3;">맞습니다. 인간성 +5</span>' : '<span style="color:#f44336;">틀렸습니다. 인간성 −10</span>') + (r.swap ? '<br><span style="font-size:10px;color:#888;">(누른 글자와 다른 대답이 나갔습니다.)</span>' : '') + (r.mirror ? '<br><span style="font-size:10px;color:#d4af37;">◈ 조개 거울</span>' : '') + '</div>';
    }
    return '';
}
function askBtns(k, tag) {
    const o = qOpts(k);
    let b = o.map(function (x, j) { return X.btn('“' + esc(x) + '”', "WONDER.SA.ans('" + k + "','" + tag + "'," + j + ')'); }).join('');
    if (X.has && X.has('조개 거울')) b += X.btn('🐚 조개 거울을 들여다본다. <span style="font-size:10px;color:#d4af37;">(반드시 맞힘)</span>', "WONDER.SA.ans('" + k + "','" + tag + "',-1)");
    return b;
}
SA.ans = function (k, tag, j) {
    const s = st();
    if (s['q' + tag]) return;
    const o = qOpts(k);
    let mirror = false, swap = false, pick = j;
    if (j < 0) { if (!X.spend('조개 거울')) return; mirror = true; pick = 0; }
    else if (H() < 50 && Math.random() < 0.5) { pick = (j + 1) % o.length; swap = pick !== j; }
    const ok = pick === 0;
    s['q' + tag] = { ok: ok, said: o[pick], swap: swap, mirror: mirror };
    hum(ok ? 5 : -10);
    if (s.onAsk) { try { SA[s.onAsk](ok); } catch (e) { } }
    X.save(); X.view();
};
SA.askHtml = askHtml; SA.askBtns = askBtns;

// ==========================================
// 공용 걸음 — 진입 · 부름
// ==========================================
L.K.senter = function () {
    const lk = me();
    if (lk.h == null) { lk.h = 90; lk.d = 0; X.pub('lk/' + L.rk() + '/x/h/' + ME(), 90); }
    if (lk.comp === undefined) lk.comp = n0() <= 2 ? SX.companion(lk.mid) : null;
    X.save();
    const sc = X.scene('s_new', 17);
    L.draw('진입', cond(sc.p[0].x) + '<div class="wd-sys">인간성 90에서 시작합니다. 0이 되면 돌아올 수 없습니다.</div>', X.btn('내려간다.', 'WONDER.lkNext()'));
};
L.K.sreveal = function () {
    const sc = scn('부름');
    L.draw('부름', cond(sc.p[0].x), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
const COMMON = [{ k: 'senter' }, { k: 'sreveal' }, { k: 'rules' }];
function M(base, o) {
    const plan = o.plan;
    // A-214 의 자리(기록자 …)와 신도는 이 판에 없다
    o.plan = function (p, rnd) { p.role = { _: 0 }; p.cult = null; if (plan) plan(p, rnd); };
    return Object.assign({ key: 's_new', enterIdx: 17, returnIdx: 18, base: base, timer: false }, o);
}

// ==========================================
// S1 열두 번째 진주 — 다섯 칸, 진주를 든 것은 둘째~다섯째 칸 하나
// ==========================================
const S1Q = ['finger', 'finger', 'name', 'name', 'breath', 'water'];
L.K.sr_s1 = function () {
    const s = st(), lk = me();
    const p = L.plan();
    lk.cell = lk.cell || 1;
    const c = lk.cell;
    if (lk.met) {
        const pg = p0('진주를 든 것');
        L.draw('진주를 든 것', cond(pg.x), (pg.o || []).map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.SA.s1end(' + j + ')'); }).join(''));
        return;
    }
    if (D() < c * 20) down(c * 20 - D(), 0);
    let x = c === 1 ? p0('첫째 칸').x : c <= 3 ? p0('둘째 · 셋째 칸').x : '더 깊다. 불빛들이 같은 간격으로 아래를 비춘다. 간격이 틀렸던 자리 하나가 아직 비어 있다.';
    const q = S1Q[c];
    const asked = s['q' + c];
    x = paras(x).filter(function (pp) { return !/^“(손가락이|당신의 이름|숨을|물은)/.test(pp); }).join('<br><br>');
    x = L.cond(x, function (n) { return n === '성공 흔적' && asked && asked.ok; });
    let b = '';
    if (!asked) {
        L.draw(['첫째', '둘째', '셋째', '넷째', '다섯째'][c - 1] + ' 칸', x + '<br><br>“' + Q[q].q + '”<br><span style="font-size:11px;color:#888;">자기 확인이다.</span>', askBtns(q, c));
        return;
    }
    x += askHtml(s, q, c);
    if (s.look) x += '<br><br>' + (p.pc === c ? '' : '여기에는 없다. 진주를 든 것은 다른 칸에서 멈췄다.');
    if (!s.look) b += X.btn('여기를 더 본다. <span style="font-size:10px;color:#888;">(인간성 −5)</span>', 'WONDER.SA.s1look()');
    if (c < 5) b += X.btn('한 칸 내려간다.', 'WONDER.SA.s1move(1)');
    if (c > 1) b += X.btn('한 칸 올라간다.', 'WONDER.SA.s1move(-1)');
    L.draw(['첫째', '둘째', '셋째', '넷째', '다섯째'][c - 1] + ' 칸', x, b);
};
SA.s1look = function () {
    const s = st(), lk = me();
    s.look = 1;
    hum(-5);
    if (L.plan().pc === lk.cell) lk.met = 1;
    X.save(); X.view();
};
SA.s1move = function (dir) {
    const lk = me();
    lk.cell = Math.max(1, Math.min(5, (lk.cell || 1) + dir));
    F().lk.s = {};
    if (dir > 0) down(20, 5); else { lk.d = Math.max(0, D() - 20); hum(-5); }
    X.save(); X.view();
};
SA.s1end = function (j) { E(['열두 개', '열한 개', '달아나다'][j], ['w', 'd', 'f'][j]); };

// ==========================================
// S2 손가락 세기 — 다섯 번 세기
// ==========================================
const S2_KIND = ['his', 'yours', 'lamp', 'bubble', 'his'];
const S2_SHAKE = ['손가락 사이가 얇아진 것 같다.', '마디가 하나 더 있는 것 같다.', '손톱이 투명해 보인다.', '손등이 젖어 있다. 마르지 않는다.'];
function s2count(k) {
    const p = L.plan();
    return p.cnt[k];
}
L.K.sr_s2 = function (step) {
    const s = st(), lk = me();
    const k = step.n;
    const kind = S2_KIND[k];
    const N = s2count(k);
    if (!s.down) { s.down = 1; down(20, 0); }
    let x = kind === 'his' ? p0('그의 손').x : kind === 'yours' ? L.cond(p0('당신의 손').x, function () { return false; }) : paras(p0('등불과 거품').x)[kind === 'lamp' ? 0 : 1];
    let sym = '';
    if (kind === 'his') sym = new Array(N).fill('<span style="display:inline-block;width:5px;height:22px;background:#bba;margin:0 3px;border-radius:2px;"></span>').join('');
    else if (kind === 'yours') { const shown = H() < 70 ? 11 : 10; sym = new Array(shown).fill('<span style="display:inline-block;width:5px;height:20px;background:#d9c7b8;margin:0 3px;border-radius:2px;"></span>').join(''); }
    else if (kind === 'lamp') sym = new Array(N).fill('✦').join(' ');
    else sym = new Array(N).fill('○↑').join(' ') + ' <span style="color:#666;">○↓</span>';
    x += '<div style="text-align:center;font-size:18px;color:#d4af37;margin:12px 0;letter-spacing:2px;">' + sym + '</div>';
    if ((lk.s2w || 0) > 0) x += '<div class="wd-sys">당신의 손 — ' + S2_SHAKE.slice(0, lk.s2w).join(' ') + '</div>';
    if (!s.r) {
        const ans = kind === 'yours' ? 10 : N;
        const os = shuf([ans - 1, ans, ans + 1], Math.random);
        L.draw('세기 ' + (k + 1) + ' / 5', x + '<div class="wd-sys">몇 개입니까?</div>', os.map(function (v) { return X.btn(v + '개', 'WONDER.SA.s2pick(' + v + ',' + ans + ')'); }).join(''));
        return;
    }
    L.draw('세기 ' + (k + 1) + ' / 5', x + (s.r.ok ? '<div class="wd-sys" style="color:#7ec8e3;">맞습니다.' + (lk.comp === '소라' || lk.comp ? ' ' + esc(lk.comp || '') + josa(lk.comp || '소라', '이', '가') + ' 꼬리를 한 번 친다.' : '') + '</div>' : '<div class="wd-sys" style="color:#f44336;">틀렸습니다. 인간성 −10</div>'),
        X.btn('계속 간다.', 'WONDER.lkNext()'));
};
SA.s2pick = function (v, ans) {
    const s = st(), lk = me();
    if (s.r) return;
    const step = L.def().steps[F().lk.i];
    const ok = v === ans;
    s.r = { ok: ok };
    if (!ok) {
        lk.s2w = (lk.s2w || 0) + 1;
        lk.s2bad = 1;
        if (S2_KIND[step.n] === 'yours') { X.save(); return E('틀린 손', 'f'); }
        hum(-10);
    }
    X.save(); X.view();
};
L.K.sr_s2fin = function () {
    const s = st(), lk = me();
    const pg = p0('마지막 질문');
    let x = L.txt(pg.x);
    if (s.again) x = '그가 처음부터 다시 센다. 하나, 둘…… 손가락이 접혔다 펴진다.<br><br>' + x;
    L.draw('마지막 질문', x, X.btn('“열 개.”', 'WONDER.SA.s2end(0)') + X.btn('“열하나.”', 'WONDER.SA.s2end(1)'));
};
SA.s2end = function (j) {
    const s = st(), lk = me();
    if (j === 1) return E('열하나', 'd');
    if (!lk.s2bad) return E('열 개', 'w');
    s.again = (s.again || 0) + 1;
    hum(-10);
    X.save(); X.view();
};

// ==========================================
// S3 노래 한 소절 — 여덟 박자 받아 적기
// ==========================================
const BEAT = ['길게', '짧게', '쉬는 박'];
const S3_SC = ['두 박자 — 거품 기둥', '두 박자 — 건물', '두 박자 — 진흙 바닥', '두 박자 — 거품 기둥'];
L.K.sr_s3 = function (step) {
    const s = st(), lk = me();
    const p = L.plan();
    const k = step.n;
    const b0 = p.beats[k * 2], b1 = p.beats[k * 2 + 1];
    if (!s.down) { s.down = 1; down(20, 0); }
    let x = L.cond(p0(S3_SC[k]).x, function () { return false; });
    if (k === 3) x = '거품이 다시 박자에 맞춰 올라간다. 마지막 두 박자다. 입안이 아까보다 더 간지럽다.';
    let cue;
    if (k === 1) cue = '눈으로 세면 — ' + b0 + ' · ' + b1 + '<br>귀로 들으면 — ' + p.ear[0] + ' · ' + p.ear[1];
    else if (k === 2) cue = '발자국 — ' + b0 + ' · ' + b1;
    else if (k === 0) cue = '거품 — ' + b0 + ' · ' + b1;
    else cue = '거품 — ' + b0 + ' · ' + b1;
    x += '<div class="wd-note" style="border-color:#1d3a4a;">' + cue + '</div>';
    x += '<div class="wd-sys">받은 박자 ' + ((lk.s3got || 0)) + ' / 8 · 틀린 박자 ' + (lk.s3bad || 0) + ' / 3</div>';
    const j = s.j || 0;
    if (k === 2 && !s.asked && !s.skipAsk) {
        x = x.replace(/“물은 마시는 것입니까, 있는 것입니까\?”[^<]*/, '');
        L.draw('진흙 바닥', x + '<br><br>“물은 마시는 것입니까, 있는 것입니까?”',
            X.btn('대답한다. <span style="font-size:10px;color:#888;">(인간성 +5, 이 자리의 박자는 판정으로)</span>', 'WONDER.SA.s3ask(1)') + X.btn('입을 다물고 받아 적는다.', 'WONDER.SA.s3ask(0)'));
        return;
    }
    if (s.roll) {
        x += X.rollHtml(s.roll) + (s.roll.ok ? '발자국을 따라 박자가 저절로 손에 들어온다.' : '입을 여는 사이 박자 하나가 새어 나갔다.');
    }
    if (j >= 2 || s.roll) {
        L.draw(S3_SC[k].replace('두 박자 — ', ''), x + (s.res || ''), X.btn('계속 간다.', 'WONDER.lkNext()'));
        return;
    }
    L.draw(S3_SC[k].replace('두 박자 — ', ''), x + (s.res || '') + '<div class="wd-sys">' + (j + 1) + '번째 박자를 받아 적는다.</div>',
        BEAT.map(function (bt, q) { return X.btn((bt === '쉬는 박' ? '쉬는 박으로' : bt) + ' 적는다.', 'WONDER.SA.s3beat(' + q + ')'); }).join(''));
};
SA.s3ask = function (yes) {
    const s = st(), lk = me();
    const p = L.plan();
    if (!yes) { s.skipAsk = 1; X.save(); return X.view(); }
    s.asked = 1;
    hum(5);
    const r = X.roll(0);
    s.roll = r;
    if (r.ok) lk.s3got = (lk.s3got || 0) + 2;
    else { s3wrong(); lk.s3got = (lk.s3got || 0) + 2; }
    X.save(); X.view();
};
function s3wrong() {
    const lk = me();
    lk.s3bad = (lk.s3bad || 0) + 1;
    hum(-20, { song: true });
    down(20, 0);
    if (lk.s3bad >= 3) E('끝까지', 'f');
}
SA.s3beat = function (q) {
    const s = st(), lk = me();
    const p = L.plan();
    const step = L.def().steps[F().lk.i];
    const j = s.j || 0;
    const want = p.beats[step.n * 2 + j];
    if (BEAT[q] === want) {
        s.j = j + 1;
        lk.s3got = (lk.s3got || 0) + 1;
        hum(-5);
        s.res = '<div class="wd-sys" style="color:#7ec8e3;">' + want + ' — 조개에 적었다.</div>';
    } else {
        s.res = '<div class="wd-sys" style="color:#f44336;">입이 열렸다. 소리 내어 따라 불렀다. 인간성 −20, 한 칸 더 내려간다. 그 박자를 다시 받는다.</div>';
        s3wrong();
    }
    X.save(); X.view();
};
L.K.sr_s3fin = function () {
    const pg = p0('노래하는 이');
    L.draw('노래하는 이', cond(pg.x), (pg.o || []).map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.SA.s3end(' + j + ')'); }).join(''));
};
SA.s3end = function (j) { E(['이어진 노래', '빈 소절', '끝까지'][j], ['w', 'd', 'f'][j]); };

// ==========================================
// S4 빈 의자 — 둘에게 세 번 묻고 한 사람을 데려간다
// ==========================================
const S4_Q = [
    { k: 'finger', q: '손가락이 몇 개입니까?', fish: '바로 대답한다. “열 개요.”', man: '손을 내려다본다. 오래 본다. “……열 개요. 아까는 세었는데, 지금은 세기 싫어요.”' },
    { k: 'name', q: '당신의 이름을 적으십시오.', fish: '또박또박 쓴다. 획이 하나도 흔들리지 않는다.', man: '번진 글자를 쓴다. 첫 글자만 분명하다.' },
    { k: 'breath', q: '숨을 쉬고 있습니까?', fish: '“참고 있어요.” 물속에서는 숨을 참는 것이 사람이라고 배운 것 같다.', man: '“쉬고 있어요. 그게 문제예요.”' },
    { k: 'water', q: '물은 마시는 것입니까, 있는 것입니까?', fish: '웃는다. “마시는 거예요. 당연하죠.”', man: '대답하지 못한다. 입을 열다 닫는다.' },
    { k: 'what', q: '당신은 무엇입니까?', fish: '“사람이요.” 망설임이 없다.', man: '“사람이요.” 대답하고 나서 자기 손등을 본다.' }
];
const S4_WHO = ['사원증을 건 쪽', '옷이 깨끗한 쪽'];
L.K.sr_s4 = function (step) {
    const s = st(), lk = me();
    const p = L.plan();
    lk.s4 = lk.s4 || [];
    if (step.n === 0 && !s.intro) { s.intro = 1; down(60, 0); }
    if (s.r == null) {
        const left = S4_Q.map(function (q, i) { return i; }).filter(function (i) { return lk.s4.indexOf(i) < 0; });
        L.draw('질문 ' + (step.n + 1) + ' / 3', (step.n === 0 ? '두 사람이 위를 보고 서 있다. 등불 든 것이 옆에서 둘을 번갈아 비춘다.<br><br>' : '') + s4log() + '<div class="wd-sys">같은 질문을 둘에게 묻습니다. 물을 때마다 인간성 −5</div>',
            left.map(function (i) { return X.btn('“' + S4_Q[i].q + '”', 'WONDER.SA.s4ask(' + i + ')'); }).join(''));
        return;
    }
    L.draw('질문 ' + (step.n + 1) + ' / 3', s4log(), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
function s4log() {
    const lk = me();
    const p = L.plan();
    const low = H() < 50;
    return (lk.s4 || []).map(function (i, n) {
        const q = S4_Q[i];
        const swap = low && (lk.s4sw || [])[n];
        const a0 = p.fish === 0 ? q.fish : q.man, a1 = p.fish === 1 ? q.fish : q.man;
        const L0 = swap ? a1 : a0, L1 = swap ? a0 : a1;
        return '<div class="wd-note" style="border-color:#1d3a4a;"><b>“' + q.q + '”</b><br>' + S4_WHO[0] + ' — ' + L0 + '<br>' + S4_WHO[1] + ' — ' + L1 + '</div>';
    }).join('');
}
SA.s4ask = function (i) {
    const s = st(), lk = me();
    if (s.r != null) return;
    lk.s4 = (lk.s4 || []).concat([i]);
    lk.s4sw = (lk.s4sw || []).concat([Math.random() < 0.5]);
    s.r = i;
    hum(-5);
    X.save(); X.view();
};
L.K.sr_s4pick = function () {
    const pg = scn('작은 쪽');
    const x = L.cond(pg.p[0].x, function () { return false; });
    L.draw('작은 쪽', s4log() + x, (pg.p[0].o || []).map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.SA.s4end(' + j + ')'); }).join(''));
};
SA.s4end = function (j) {
    const p = L.plan();
    if (j === 0 || j === 1) return E(j === p.fish ? '물고기가 인간이 되었다' : '먼저 내려간 사람', j === p.fish ? 'd' : 'w');
    if (j === 3) return E('둘 다 놓침', 'f');
    // 둘 다 — 오르는 칸마다 크게
    const lk = me();
    for (let c = 0; c < 5 && !lk.dead; c++) hum(-20);
    if (!lk.dead) E('셋이서', 'f');
};

// ==========================================
// T1 진주는 어디에? — 심해의 범인 찾기
// ==========================================
const LAMP = ['분홍 불', '노란 불', '푸른 불', '보라 불'];
const PLACE = [
    { d: 20, t: '거품 기둥 옆. 불빛이 수다스럽게 흔들린다.', after: '증언을 끝내고 얼른 덧붙인다. “그런데 여기서는 세는 게 잘 안 돼요.”' },
    { d: 40, t: '건물 창문. 창틀에 등불을 올려둔다. 거울을 보는 자세다. 거울은 없다.', after: '' },
    { d: 60, t: '진흙 바닥.', after: '증언을 하다 멈추고 위를 본다. 수면은 안 보인다. 별도 없다. “어디까지 말했더라요?”' },
    { d: 85, t: '가장 깊은 곳. 두 손을 모으듯 등불을 든다. 차분하게 말한다.', after: '' }
];
function t1puz() { return SX.puz ? (window.WONDER_MD.s_puz || [])[L.plan().pz] : null; }
function t1mine() { const p = L.plan(); return (p.hear || {})[ME()] || []; }
L.K.sr_t1hear = function () {
    const s = st(), lk = me();
    const mine = t1mine();
    const i = s.i || 0;
    const P = t1puz();
    const head = '<div class="wd-sys">산호 → 분홍 불 · 소라 → 노란 불 · 윤슬 → 푸른 불 · 파랑 → 보라 불</div>';
    if (!mine.length) { L.draw('증언', head + '당신 앞으로 오는 불빛은 없다. 다른 사람들의 입만 보인다.' + (lk.comp ? '<br><br>' + esc(lk.comp) + josa(lk.comp, '은', '는') + ' 아무것도 듣지 못한다.' : ''), X.btn('모두가 들을 때까지 기다린다.', 'WONDER.lkNext()')); return; }
    if (i >= mine.length) { L.draw('증언', head + '들은 것을 일행에게 나눈다. (채팅)', X.btn('넷이 다시 모이는 곳으로 간다.', 'WONDER.lkNext()')); return; }
    const k = mine[i];
    const pl = PLACE[k];
    if (D() !== pl.d) { me().d = pl.d; X.save(); }
    const btn = (s.btn || {})[k];
    let x = (i === 0 ? paras(p0('증언 (네 곳)').x).slice(0, 2).join('<br><br>') + '<br><br>' : '') + '<b>' + LAMP[k] + '</b> — ' + pl.t + '<br><br><b>' + esc(P.s[SX.LET[k]]) + '</b>' + (pl.after ? '<br><br>' + pl.after : '');
    if (btn) x += '<div class="wd-sys">◈ 진주 단추가 ' + (btn === 't' ? '맑게 빛납니다 — 이 증언은 참입니다.' : '흐려집니다 — 이 증언은 거짓입니다.') + '</div>';
    let b = '';
    if (!btn && X.has && X.has('진주 단추')) b += X.btn('진주 단추를 대어 본다. <span style="font-size:10px;color:#d4af37;">(참 · 거짓)</span>', 'WONDER.SA.t1btn(' + k + ')');
    b += X.btn('고개를 끄덕인다.', 'WONDER.SA.t1next()');
    L.draw('증언', head + x, b);
};
SA.t1btn = function (k) {
    const s = st();
    if (!X.spend('진주 단추')) return;
    s.btn = s.btn || {};
    s.btn[k] = t1puz().l === SX.LET[k] ? 'f' : 't';
    X.save(); X.view();
};
SA.t1next = function () { const s = st(); s.i = (s.i || 0) + 1; X.save(); X.view(); };
function t1point(n) {
    return {
        k: 'team', id: 't1p' + n, title: '지목',
        skip: function () { return n > 0 && L.x().t1ok; },
        text: function () { return L.txt(paras(p0('지목').x).join('<br><br>')) + (n > 0 ? '<div class="wd-sys">넷이 다시 나란히 선다. 자리가 조금 바뀌어 있다. — 두 번째 지목</div>' : '') + '<div class="wd-sys">모두 같은 불을 가리켜야 합니다. 갈리면 ✖, 오답 두 번이면 ✖.</div>'; },
        opts: function () { return LAMP.map(function (l, k) { return { l: l + '을 가리킨다.', v: 'L' + k }; }); },
        mineTxt: function (v) { return LAMP[+val(v).slice(1)] + '을 가리켰습니다.'; },
        resolve: function (m) {
            const vs = Object.keys(m).map(function (c) { return val(m[c]); });
            if (vs.some(function (v) { return v !== vs[0]; })) return { end: ['지목이 갈림', 'f'] };
            const P = t1puz();
            const k = +vs[0].slice(1);
            if (SX.LET[k] === P.c) {
                L.tx('x/t1ok', function (c) { return c || 1; });
                return { html: L.txt(paras(scn('진주').p[0].x).join('<br><br>')) };
            }
            // 오답 — 각설탕이 있으면 한 번 없던 일로, 아니면 모두 크게
            const x = L.x();
            const key = 't1w' + n;
            if (x[key] == null) {
                let cube = null;
                if (X.has && X.has('티타임 각설탕') && !x.t1cube) { if (X.spend('티타임 각설탕')) cube = ME(); }
                L.tx('x/' + key, function (c) { return c == null ? (cube ? 'cube:' + cube : 'w') : c; });
                if (cube) L.tx('x/t1cube', function (c) { return c || cube; });
                return { wait: true };
            }
            const lk = me();
            const cube = String(x[key]).indexOf('cube') === 0;
            if (!cube && !(lk.t1hit || {})[n]) { lk.t1hit = lk.t1hit || {}; lk.t1hit[n] = 1; hum(-20); }
            const wrongs = [0, 1, 2].filter(function (j) { return x['t1w' + j] === 'w'; }).length;
            if (wrongs >= 2) return { end: ['오답 두 번', 'f'] };
            return { html: '가리킨 불이 한 번 꺼졌다 켜진다. “아직이시네요.”' + (cube ? '<div class="wd-sys">◈ 티타임 각설탕 — 방금 한 말이 녹아 사라집니다. 오답은 없던 일이 됩니다.</div>' : ' 물이 한꺼번에 무거워진다.<div class="wd-sys">모두 인간성 −20</div>') };
        }
    };
}
// 두 번째 지목에서 각설탕을 쓴 경우를 위한 세 번째
function t1point3() {
    const t = t1point(2);
    t.skip = function () { const x = L.x(); return !!x.t1ok || !(x.t1w0 === 'w' && String(x.t1w1 || '').indexOf('cube') === 0 || String(x.t1w0 || '').indexOf('cube') === 0 && x.t1w1 === 'w'); };
    return t;
}
const T1_PEARL = {
    k: 'team', id: 't1q', title: '진주',
    skip: function () { return !L.x().t1ok; },
    text: function () { return L.txt(paras(scn('진주').p[0].x).join('<br><br>')) + '<div class="wd-sys">같은 표면 받아 갑니다.</div>'; },
    opts: function () { return [{ l: '진주를 받아 간다.', v: 'take' }, { l: '진주를 그 아이에게 남긴다.', v: 'leave' }]; },
    resolve: function (m) {
        const t = L.tally(m);
        return t.win === 'leave' ? { end: ['올라간 아이', 'd'] } : { end: ['주인공의 진주', 'w'] };
    }
};

// ==========================================
// T2 줄 끝의 조개 — 위의 한 사람과 아래의 일행
// ==========================================
const SIG = ['더 풀어', '멈춰', '감아'];
const RESP = ['더 푼다', '멈춘다', '감는다'];
function t2holder() { const p = L.plan(); return p.holder; }
function t2down() { const p = L.plan(); return p.mem.filter(function (c) { return c !== p.holder && X.actives().indexOf(c) >= 0; }); }
function t2sig(n) {
    return {
        k: 'team', id: 't2s' + n, title: '줄을 따라',
        who: t2down,
        skip: function () { return !!L.st().end; },
        text: function () {
            const lk = me();
            if (t2down().indexOf(ME()) >= 0 && !(lk.t2d || {})[n]) { lk.t2d = lk.t2d || {}; lk.t2d[n] = 1; down(20, 0); }
            if (ME() === t2holder()) return L.txt(p0('위 (줄을 잡은 사람)').x).split('<br><br>').slice(0, 2).join('<br><br>') + '<br><br>아래에서 신호를 보낼 때까지 기다린다.';
            return (n === 0 ? cond(L.cond(p0('줄을 따라').x, function () { return false; })) + '<br><br>' : '눈금 하나를 더 내려왔다. ') + '<div class="wd-sys">' + (n + 1) + ' / 4 칸 · 줄 당김으로 신호를 보냅니다 — 한 번 = 더 풀어 · 두 번 = 멈춰 · 세 번 = 감아</div>';
        },
        opts: function () { return SIG.map(function (s2, k) { return { l: '줄을 ' + ['한', '두', '세'][k] + ' 번 당긴다. <span style="font-size:10px;color:#888;">(' + s2 + ')</span>', v: k }; }); },
        mineTxt: function (v) { return ['한', '두', '세'][val(v)] + ' 번 당겼습니다.'; },
        resolve: function (m) { const t = L.tally(m); return { html: '신호를 보냈다. 위에서 읽기를 기다린다.' }; }
    };
}
function t2win(n) { const t = L.tally(L.votes('t2s' + n)); return t.win != null ? +t.win : 0; }
function t2resp(n) {
    return {
        k: 'team', id: 't2r' + n, title: '위',
        who: function () { const h = t2holder(); return h === 'npc' ? [] : [h]; },
        skip: function () { return !!L.st().end; },
        text: function () {
            const p = L.plan();
            const w = t2win(n);
            const fake = p.fake[n];
            let pulls = [];
            for (let k = 0; k <= w; k++) pulls.push('한 번.');
            let t = '줄이 당겨진다. ' + pulls.join(' ');
            if (fake) t += ' ……오래 있다가 ' + ['', '한 번.', '한 번. ……또 한 번.'][fake];
            if (ME() === t2holder()) return t + '<div class="wd-sys">당긴 사이가 짧은 것이 일행, 길게 늘어진 것은 아래의 것입니다.</div>';
            return '위에서 신호를 읽는 중이다.' + (p.holder === 'npc' ? '' : '') ;
        },
        opts: function () {
            const lk = me();
            const os = RESP.map(function (r, k) { return { l: r + '.', v: k }; });
            if (!lk.t2let) os.push({ l: '줄을 놓는다. <span style="font-size:10px;color:#888;">(누군가 떠오르는 것을 본 것 같다)</span>', v: 'let' });
            return os;
        },
        mineTxt: function (v) { return v === 'let' ? '줄을 놓았습니다.' : RESP[val(v)] + '.'; },
        resolve: function (m) {
            const h = t2holder();
            const w = t2win(n);
            let v = h === 'npc' ? w : val(m[h]);
            if (v === 'let') return { end: ['놓친 줄', 'f'] };
            const x = L.x();
            const key = 't2x' + n;
            if (v === w) return { html: '줄이 신호대로 움직인다. ' + (w === 0 ? '조금 더 풀린다.' : w === 1 ? '줄이 멈춘다.' : '줄이 조금 감긴다.') };
            if (x[key] == null) { L.tx('x/' + key, function (c) { return c == null ? 1 : c; }); return { wait: true }; }
            const lk = me();
            if (t2down().indexOf(ME()) >= 0 && !(lk.t2hit || {})[n]) { lk.t2hit = lk.t2hit || {}; lk.t2hit[n] = 1; hum(-20); down(20, 0); }
            const bad = [0, 1, 2, 3].filter(function (k) { return x['t2x' + k]; }).length;
            if (bad >= 3) return { end: ['잘못 읽은 신호', 'f', { down: t2down() }] };
            return { html: '줄이 엉뚱하게 움직인다. 아래가 한 칸 더 내려간다.<div class="wd-sys">내려간 사람 인간성 −20 · 잘못 읽은 신호 ' + bad + ' / 3</div>' };
        }
    };
}
const T2_BOTTOM = {
    k: 'team', id: 't2b', title: '바닥',
    who: t2down,
    skip: function () { return !!L.st().end; },
    text: function () {
        if (ME() === t2holder()) return '줄 끝이 바닥에 닿은 것 같다. 아래의 결정을 기다린다.';
        return cond(L.txt(p0('바닥').x));
    },
    opts: function () { return (p0('바닥').o || []).map(function (o, j) { return { l: X.clip(o.l), v: j }; }); },
    resolve: function (m) {
        const t = L.tally(m);
        return +t.win === 1 ? { end: ['조개 대신', 'd'] } : { end: ['딱', 'w'] };
    }
};

// ==========================================
// T3 깨진 찻잔 — 일부러 내려가 비늘을 얻는다
// ==========================================
const T3_N = 6;
L.K.sr_t3 = function (step) {
    const s = st(), lk = me();
    const k = step.n;
    if (!s.down) { s.down = 1; down(20, 5); }
    let x = k === 0 ? cond(L.cond(p0('내려가는 길').x, function () { return false; })) : '한 칸 더 내려왔다. 몸이 가볍다. 가벼워지는 것이 좋다.';
    x += '<div class="wd-sys">' + (k + 1) + ' / ' + T3_N + ' 칸</div>';
    // 비늘
    if (H() < 50 && !lk.scale && !s.sc) {
        const sc = scn('비늘');
        const ps = paras(sc.p[0].x);
        L.draw('비늘', x + '<br><br>' + ps.join('<br><br>') + '<div class="wd-sys">인간성 50 아래 — 「뗀다」와 「둔다」의 글자가 뒤바뀔 수 있습니다.</div>', X.btn('비늘을 뗀다. <span style="font-size:10px;color:#888;">(인간성 +10)</span>', 'WONDER.SA.t3sc(1)') + X.btn('비늘을 둔다.', 'WONDER.SA.t3sc(0)'));
        return;
    }
    if (s.sc) {
        const ps = paras(scn('비늘').p[1] ? scn('비늘').p[1].x : '');
        const tag = s.sc === 'take' ? '(떼다)' : '(둔다)';
        const q = ps.filter(function (pp) { return pp.indexOf('<i>' + tag + '</i>') === 0; })[0] || '';
        x += '<br><br>' + q.replace(/^<i>\([^)]*\)<\/i>\s*/, '') + (s.swap ? '<div class="wd-sys">누른 글자와 다른 쪽이 되었습니다.</div>' : '');
    }
    // 서로 물어 주기 (두 번까지)
    let b = '';
    if (s['qx']) x += askHtml(s, 'finger', 'x');
    else if ((lk.t3q || 0) < 2) b += X.btn('일행이 물어 준다 — “손가락이 몇 개입니까?” <span style="font-size:10px;color:#888;">(' + (2 - (lk.t3q || 0)) + '번 남음, 맞히면 +10)</span>', 'WONDER.SA.t3ask()');
    if (s.asking) { L.draw('—', x + '<br><br>“손가락이 몇 개입니까?”', askBtns('finger', 'x')); return; }
    b += X.btn(k < T3_N - 1 ? '더 내려간다.' : '마지막 칸으로.', 'WONDER.lkNext()');
    L.draw('—', x, b);
};
SA.t3sc = function (take) {
    const s = st(), lk = me();
    if (s.sc) return;
    if (H() < 50 && Math.random() < 0.5) { take = take ? 0 : 1; s.swap = 1; }
    s.sc = take ? 'take' : 'keep';
    lk.scale = s.sc;
    X.pub('lk/' + L.rk() + '/x/sc/' + ME(), s.sc);
    if (take) hum(10);
    X.save(); X.view();
};
SA.t3ask = function () {
    const s = st(), lk = me();
    lk.t3q = (lk.t3q || 0) + 1;
    s.asking = 1;
    s.onAsk = 't3got';
    X.save(); X.view();
};
SA.t3got = function (ok) { const s = st(); s.asking = 0; if (ok) hum(5); };
const T3_LAST = {
    k: 'team', id: 't3f', title: '마지막 칸',
    text: function () { return cond(L.txt(p0('마지막 칸').x)); },
    opts: function () { return [{ l: '손등을 내민다.', v: 1 }]; },
    resolve: function () {
        const p = L.plan();
        const x = L.x();
        const who = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; });
        const hs = x.h || {}, sc = x.sc || {};
        if (who.some(function (c) { return (hs[c] == null ? 90 : hs[c]) <= 50; })) return { end: ['돌아오지 못한 사람', 'f'] };
        const took = who.filter(function (c) { return sc[c] === 'take'; }).length;
        if (took === who.length) return { end: ['붙인 찻잔', 'w'] };
        if (took === 0 && who.every(function (c) { return sc[c] === 'keep'; })) return { end: ['잘 어울리세요', 'd'] };
        return { end: ['모자란 비늘', 'f'] };
    }
};

// ==========================================
// T4 울지 않는 풍경 — 열두 개 중 아무도 듣지 못한 하나
// ==========================================
const T4_SND = ['웃다가 그친 소리. 웃음의 끝이 조금 더 들린다.', '계단을 세는 소리. 열일곱에서 멈춘다. 다시 하나부터.', '찻잔을 내려놓는 소리. 조심스럽다.', '누군가 “다녀왔습니다”라고 말하려다 숨을 삼키는 소리.', '사원증 목걸이 끈이 책상 모서리에 끌리는 소리.', '이름을 부르는 소리. 누구의 이름인지는 물이 삼켰다.', '손뼉 한 번. 그다음 손뼉은 오지 않는다.', '물을 마시는 소리. 오래 마신다. 끝나지 않는다.', '신발을 벗어 가지런히 놓는 소리.', '작게 하품하다 멈추는 소리.', '펜 뚜껑을 닫는 소리. 딱 한 번.'];
function t4arc(c) { const p = L.plan(); return (p.arc || {})[c] || []; }
L.K.sr_t4hear = function () {
    const s = st(), lk = me();
    const p = L.plan();
    const arc = t4arc(ME());
    if (!s.down) { s.down = 1; down(40, 0); }
    let x = '줄이 수십 가닥, 줄마다 조개 풍경이 달려 있다. 열두 개가 원을 이룬다. 1번(북쪽)부터 시계 방향으로 센다.<br><br>';
    if (!arc.length) x += '당신 자리에서는 아무 소리도 또렷하게 들리지 않는다.';
    else x += '<div class="wd-note" style="border-color:#1d3a4a;">' + arc.map(function (k) { return (k + 1) + '번 — ' + T4_SND[p.snd[k]]; }).join('<br>') + '</div><div class="wd-sys">목이 간지럽다. 따라 내고 싶다. — 들은 것을 채팅으로 말로만 설명하세요(소리 흉내 금지).</div>';
    L.draw('풍경 숲', x, (arc.length ? X.btn('한 번 더 듣는다. <span style="font-size:10px;color:#888;">(인간성 −5)</span>', 'WONDER.SA.t4again()') : '') + X.btn('자리를 정하러 간다.', 'WONDER.lkNext()'));
};
SA.t4again = function () { hum(-5, { song: true }); X.view(); };
function t4vote(n) {
    return {
        k: 'team', id: 't4v' + n, title: '조용한 풍경',
        skip: function () { return !!L.x().t4ok; },
        text: function () { return '조용한 풍경은 몇 번인가. 고른 자리 아래로 간다.' + (n ? '<div class="wd-sys">' + (n + 1) + '번째 시도</div>' : ''); },
        opts: function () { return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (k) { return { l: (k + 1) + '번 풍경 아래로 간다.', v: k }; }); },
        mineTxt: function (v) { return (val(v) + 1) + '번에 투표했습니다.'; },
        resolve: function (m) {
            const p = L.plan();
            const t = L.tally(m);
            if (t.win != null && +t.win === p.silent) { L.tx('x/t4ok', function (c) { return c || 1; }); return { html: '여기다. ' + L.txt(paras(p0('조용한 풍경').x).slice(1).join('<br><br>')) }; }
            const lk = me();
            if (!(lk.t4hit || {})[n]) { lk.t4hit = lk.t4hit || {}; lk.t4hit[n] = 1; hum(-10, { song: true }); }
            if (n >= 2) return { end: ['시간', 'f'] };
            return { html: (t.win != null ? (+t.win + 1) + '번 풍경이 가까이서 운다. ' + T4_SND[p.snd[+t.win]] : '표가 갈렸다. 풍경들이 한꺼번에 운다.') + '<div class="wd-sys">모두 인간성 −10</div>' };
        }
    };
}
const T4_FIN = {
    k: 'team', id: 't4f', title: '조용한 풍경',
    skip: function () { return !L.x().t4ok; },
    text: function () { return L.cond(paras(p0('조용한 풍경').x).slice(1).join('<br><br>'), function () { return false; }); },
    opts: function () { return [{ l: '조용한 풍경을 떼어 간다.', v: 'take' }, { l: '그에게 목소리를 빌려준다.', v: 'lend' }]; },
    resolve: function (m) { const t = L.tally(m); return t.win === 'lend' ? { end: ['감사합니다', 'd'] } : { end: ['빠짐없는 수집', 'w'] }; }
};

// ==========================================
// T5 그림의 빈자리 — 둘로 나뉘어 자리 · 손 · 팔
// ==========================================
const HANDS = ['왼손', '오른손'];
const ARMS = ['팔을 등 뒤로 숨겼다', '두 손으로 입을 가렸다', '팔을 내리고 가만히 있었다'];
function t5g(c) { const p = L.plan(); return p.groups[0].indexOf(c) >= 0 ? 0 : 1; }
L.K.sr_t5path = function () {
    const s = st(), lk = me();
    const p = L.plan();
    const g = t5g(ME());
    if (!s.down) { s.down = 1; down(40, 0); }
    if (g === 0) {
        let x = cond(p0('갈림길 — 인어 수 · 꽃잎').x);
        let row = '';
        for (let k = 0; k < p.seat; k++) row += '∿ ';
        row += '<span style="color:#888;">( 빈 윤곽 )</span> ∿ ∿';
        x += '<div class="wd-note" style="border-color:#1d3a4a;">벽에 배어 있는 그림 — ' + row + '<br>꽃잎은 빈 윤곽의 ' + (p.hand === 0 ? '왼쪽' : '오른쪽') + ' 손 자리에 떨어져 있다.</div>';
        if (lk.comp === '윤슬') x += '<div class="wd-sys">윤슬이 센 수 — ' + (p.seat + (p.yoon || 0)) + ' (당신이 직접 센 수가 맞습니다)</div>';
        L.draw('갈림길 — 인어 수 · 꽃잎', x, X.btn('합류하러 간다.', 'WONDER.lkNext()'));
        return;
    }
    let x = L.cond(p0('갈림길 — 손뼉').x, function () { return false; });
    const seen = !s.q2 || (s.q2 && s.q2.ok);
    if (!s.q2 && !s.skip) {
        L.draw('갈림길 — 손뼉', x + '<br><br>“당신은 무엇입니까?”', askBtns('what', '2') + X.btn('대답하지 않고 손뼉을 본다.', 'WONDER.SA.t5skip()'));
        return;
    }
    x += askHtml(s, 'what', '2');
    x += '<div class="wd-note" style="border-color:#1d3a4a;">비는 박자에 그들은 — <b>' + ARMS[p.arm] + '</b>' + (s.q2 && s.q2.ok ? '<br>(한 번 더 보여 준다 — 「' + ARMS[p.arm] + '」)' : '') + '</div>';
    L.draw('갈림길 — 손뼉', x, X.btn('합류하러 간다.', 'WONDER.lkNext()'));
};
SA.t5skip = function () { st().skip = 1; X.save(); X.view(); };
L.K.sr_t5split = function () {
    const p = L.plan();
    const g = t5g(ME());
    L.draw('갈림길', '길이 둘로 갈라진다.<div class="wd-sys">당신의 조 — ' + (g === 0 ? '인어 수 · 꽃잎' : '손뼉') + ' (' + p.groups[g].map(L.name).map(esc).join(', ') + ')<br>갈라진 동안의 이야기는 합류해서 맞춥니다.</div>', X.btn('간다.', 'WONDER.lkNext()'));
};
const T5_FRAME = {
    k: 'team', id: 't5a', title: '액자',
    text: function () {
        const pg = scn('액자');
        let x = L.cond(pg.p[0].x, function () { return false; });
        const p = L.plan();
        const hs = L.x().h || {};
        const low = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }).sort(function (a, b) { return (hs[a] || 90) - (hs[b] || 90); })[0];
        if (low === ME()) x += '<div class="wd-sys">일행 가운데 인간성이 가장 낮은 당신에게만 보이는 선택지가 있습니다.</div>';
        return x;
    },
    opts: function () {
        const p = L.plan();
        const hs = L.x().h || {};
        const low = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }).sort(function (a, b) { return (hs[a] || 90) - (hs[b] || 90); })[0];
        const os = [{ l: '그를 액자 안의 자리에 세운다. <span style="font-size:10px;color:#888;">(자리 · 손 · 팔)</span>', v: 'set' }, { l: '그를 데리고 수면으로 간다.', v: 'take' }];
        if (low === ME()) os.push({ l: '내가 그 자리에 선다.', v: 'me' });
        return os;
    },
    resolve: function (m) {
        if (Object.keys(m).some(function (c) { return val(m[c]) === 'me'; })) return { end: ['대신 선 사람', 'f'] };
        const t = L.tally(m);
        if (t.win === 'take') return { end: ['비어 있는 그림', 'd'] };
        if (t.win === 'set') return { html: '그를 액자 앞에 세운다. 자리와 손과 팔을 맞춘다.' };
        return { end: ['비어 있는 그림', 'd'] };
    }
};
function t5in(what) {
    return {
        k: 'team', id: 't5' + what, title: '액자',
        skip: function () { return L.tally(L.votes('t5a')).win !== 'set'; },
        text: function () { return { seat: '그는 그림 속 몇 번째 인어 옆에 서 있었나.', hand: '꽃잎을 든 손은 어느 쪽인가.', arm: '모두가 손뼉을 칠 때, 비는 박자에 그는 무엇을 하고 있었나.' }[what]; },
        opts: function () {
            if (what === 'seat') return [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return { l: k + '번째 인어 옆', v: k }; });
            if (what === 'hand') return HANDS.map(function (h, k) { return { l: h, v: k }; });
            return ARMS.map(function (a, k) { return { l: a, v: k }; });
        },
        resolve: function (m) {
            if (what !== 'arm') return { html: '정했다.' };
            const p = L.plan();
            const pick = function (id) { const t = L.tally(L.votes(id)); return t.win != null ? +t.win : -1; };
            const ok = pick('t5seat') === p.seat && pick('t5hand') === p.hand && pick('t5arm') === p.arm;
            return ok ? { end: ['제자리', 'w'] } : { end: ['틀린 자세', 'f'] };
        }
    };
}

// ==========================================
// T6 숨 참기 내기 — 턴마다 쉰다 / 참는다
// ==========================================
const T6_MAX = 10;
function t6pos(n) {
    const x = L.x();
    const p = L.plan();
    for (let k = n - 1; k >= 0; k--) if (x['t6p' + k]) return x['t6p' + k];
    const o = {};
    p.mem.forEach(function (c) { o[c] = 0; });
    return o;
}
function t6scene(c) {
    if (c <= 1) return '첫째 칸 — 거품 기둥';
    if (c <= 3) return '둘째 · 셋째 칸 — 건물 계단';
    return '넷째 칸 — 불빛들';
}
function t6turn(n) {
    return {
        k: 'team', id: 't6t' + n, title: '숨 참기 내기',
        skip: function () { const x = L.x(); return !!x.t6done || !!L.st().end; },
        text: function () {
            const pos = t6pos(n);
            const mine = pos[ME()] || 0;
            const p = L.plan();
            let x = L.cond(p0(t6scene(mine)).x, function () { return false; }).replace(/“숨을 쉬고 있습니까\?”[\s\S]*$/, '');
            x += '<div class="wd-note" style="border-color:#1d3a4a;">' + p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }).map(function (c) { return esc(L.name(c)) + ' — ' + (pos[c] || 0) + '칸'; }).join(' · ') + '<br>턴 ' + (n + 1) + ' · 모두 참은 턴 ' + (L.x().t6all || 0) + ' / 3</div>';
            return x;
        },
        opts: function () { return [{ l: '숨을 쉰다. <span style="font-size:10px;color:#888;">(인간성 −10, 한 칸 내려가며 같은 칸의 참는 사람 하나를 끌고 간다)</span>', v: 'b' }, { l: '참는다. <span style="font-size:10px;color:#888;">(인간성 +5, 끌어 주는 사람이 없으면 한 칸 떠오른다)</span>', v: 'h' }]; },
        mineTxt: function (v) { return val(v) === 'b' ? '「쉰다」' : '「참는다」'; },
        resolve: function (m) {
            const x = L.x();
            const key = 't6p' + n;
            const lk = me();
            if (!(lk.t6h || {})[n]) { lk.t6h = lk.t6h || {}; lk.t6h[n] = 1; hum(val(m[ME()]) === 'b' ? -10 : 5); lk.t6last = val(m[ME()]); X.save(); }
            if (!x[key]) {
                const prev = t6pos(n);
                const next = Object.assign({}, prev);
                const who = Object.keys(m).sort();
                const breathe = who.filter(function (c) { return val(m[c]) === 'b'; });
                const hold = who.filter(function (c) { return val(m[c]) === 'h'; });
                const dragged = {};
                breathe.forEach(function (c) {
                    next[c] = Math.min(5, (prev[c] || 0) + 1);
                    const h = hold.filter(function (q) { return !dragged[q] && (prev[q] || 0) === (prev[c] || 0); })[0];
                    if (h) { dragged[h] = 1; next[h] = Math.min(5, (prev[h] || 0) + 1); }
                });
                hold.forEach(function (c) { if (!dragged[c]) next[c] = Math.max(0, (prev[c] || 0) - 1); });
                const all = breathe.length === 0;
                L.tx('x/' + key, function (cur) { return cur || next; });
                if (all) L.tx('x/t6all', function (cur) { return (cur || 0) + 1; });
                return { wait: true };
            }
            const pos = x[key];
            const who = Object.keys(m);
            if (!(lk.t6d || {})[n]) {
                lk.t6d = lk.t6d || {}; lk.t6d[n] = 1;
                const want = (pos[ME()] || 0) * 20;
                if (want > D()) down(want - D(), 0); else { lk.d = want; X.save(); }
            }
            if ((x.t6all || 0) >= 3) return { end: ['아무도 움직이지 못함', 'f'] };
            if (who.every(function (c) { return pos[c] >= 5; })) { L.tx('x/t6done', function (c) { return c || 1; }); return { html: '바닥에 닿는다. 진흙이 숨을 쉰다. 그렇게 보인다.' }; }
            if (n >= T6_MAX - 1) return { end: ['아무도 움직이지 못함', 'f'] };
            return { html: who.map(function (c) { return esc(L.name(c)) + ' ' + (val(m[c]) === 'b' ? '쉰다' : '참는다') + ' → ' + pos[c] + '칸'; }).join('<br>') };
        }
    };
}
const T6_BOTTOM = {
    k: 'team', id: 't6b', title: '바닥',
    skip: function () { return !L.x().t6done; },
    text: function () { return cond(L.cond(p0('바닥').x, function () { return false; })); },
    opts: function () {
        const lk = me();
        const os = [];
        if (lk.t6last === 'h') os.push({ l: '참은 채로 손을 뻗어 바닥을 짚는다.', v: 'touch' });
        os.push({ l: '숨을 쉬고 그들 곁에 앉는다.', v: 'sit' });
        return os;
    },
    resolve: function (m) {
        if (Object.keys(m).some(function (c) { return val(m[c]) === 'sit'; })) return { end: ['곁에 남은 숨', 'd'] };
        return { end: ['내기에서 이김', 'w'] };
    }
};

// ==========================================
// T7 초대장 — 그림 맞춰 전하기, 마지막에 표
// ==========================================
const PICS = ['조개', '별', '찻잔', '의자', '진주', '풍경'];
const T7_SC = [{ n: '거품 기둥', d: 20 }, { n: '건물', d: 40 }, { n: '진흙 바닥', d: 60 }];
L.K.sr_t7 = function (step) {
    const s = st(), lk = me();
    const p = L.plan();
    const k = step.n;
    const P = T7_SC[k];
    if (D() < P.d) down(P.d - D(), 0);
    const seed = X.srand(L.rk() + ':t7:' + ME() + ':' + k);
    const card = Math.floor(seed() * PICS.length);
    const others = shuf(PICS.map(function (_, i) { return i; }).filter(function (i) { return i !== card; }), seed).slice(0, 2);
    const lamps = shuf([card].concat(others), seed);
    let x = L.cond(p0(P.n).x, function () { return false; });
    if (k === 2) x = paras(x).slice(0, 1).join('<br><br>') + '<br><br>마지막 초대장을 전한다.';
    if (k === 1 && !s.q) {
        L.draw(P.n, x.replace(/“당신의 이름을 적으십시오\.”[\s\S]*$/, '') + '<br><br>“당신의 이름을 적으십시오.”<br><span style="font-size:11px;color:#888;">주머니 속 표에 이미 적혀 있다.</span>', X.btn('표를 보고 쓴다.', 'WONDER.SA.t7name()'));
        return;
    }
    if (s.done) { L.draw(P.n, x + '<div class="wd-sys" style="color:#7ec8e3;">초대장을 전했다. 두 손으로 받는다.</div>', X.btn(k < 2 ? '다음 곳으로.' : '계속 간다.', 'WONDER.lkNext()')); return; }
    x += '<div class="wd-note" style="border-color:#1d3a4a;">당신이 든 초대장 — <b>' + PICS[card] + '</b> 그림' + (s.bad ? '<br><span style="color:#f44336;">“제 것이 아니에요.” 돌려받았다. 인간성 −10</span>' : '') + '</div>';
    L.draw(P.n, x, lamps.map(function (q) { return X.btn('등불에 ' + PICS[q] + ' 그림을 단 이에게 준다.', 'WONDER.SA.t7give(' + q + ',' + card + ')'); }).join('') + X.btn('돌아간다.', 'WONDER.SA.t7back()'));
};
SA.t7name = function () { const s = st(); s.q = 1; hum(5); X.save(); X.view(); };
SA.t7give = function (q, card) { const s = st(); if (q === card) s.done = 1; else { s.bad = 1; hum(-10); } X.save(); X.view(); };
SA.t7back = function () { E('전하지 못한 초대장', 'f'); };
const T7_FIN = {
    k: 'team', id: 't7f', title: '진흙 바닥',
    text: function () { return L.cond(scn('진흙 바닥').p[0].x, function () { return false; }).split('<br><br>').slice(1).join('<br><br>') + '<div class="wd-sys">표를 넘긴 사람은 올라가는 길에 인간성이 두 배로 줄어듭니다.</div>'; },
    opts: function () { return [{ l: '돌아간다. 표는 주머니에 둔다.', v: 'keep' }, { l: '내 표를 준다.', v: 'give' }]; },
    mineTxt: function (v) { return val(v) === 'give' ? '표를 주었습니다.' : '표를 주머니에 두었습니다.'; },
    resolve: function (m) {
        const givers = Object.keys(m).filter(function (c) { return val(m[c]) === 'give'; });
        if (!givers.length) return { end: ['제자리 하나', 'w'] };
        return { end: ['꼬리로 만든 의자', 'd', { givers: givers }] };
    }
};

// ==========================================
// T8 물고기가 인간이 되었다 — 조개를 연 채 · 닫고
// ==========================================
const T8_SC = ['거품 기둥', '건물', '진흙 바닥', null, null];
function t8holder(k) { const p = L.plan(); const a = p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }); return a[k % a.length]; }
function t8move(k) {
    return {
        k: 'team', id: 't8m' + k, title: '조개',
        who: function () { return [t8holder(k)]; },
        skip: function () { return !!L.st().end; },
        text: function () {
            const lk = me();
            if (!(lk.t8d || {})[k]) { lk.t8d = lk.t8d || {}; lk.t8d[k] = 1; down(20, 0); }
            const sc = T8_SC[k];
            let x = sc ? L.cond(p0(sc).x, function () { return false; }) : '더 깊다. 뒤의 것이 따라오는지 보려면 조개를 열어야 한다.';
            const h = t8holder(k);
            x += '<div class="wd-sys">' + (k + 1) + ' / 5 칸 · 조개를 든 사람 — ' + esc(L.name(h)) + ' · 연 채 옮긴 칸 ' + (L.x().t8open || 0) + ' (세 칸 이상이어야 아이가 마지막 방까지 옵니다)</div>';
            return x;
        },
        opts: function () { return [{ l: '연 채 옮긴다. <span style="font-size:10px;color:#888;">(모두 인간성 −10)</span>', v: 'open' }, { l: '닫고 옮긴다.', v: 'shut' }]; },
        resolve: function (m) {
            const h = t8holder(k);
            const v = val(m[h]);
            const x = L.x();
            const lk = me();
            if (v === 'open') {
                if (x['t8o' + k] == null) { L.tx('x/t8o' + k, function (c) { return c == null ? 1 : c; }); L.tx('x/t8open', function (c) { return (c || 0) + 1; }); return { wait: true }; }
                if (!(lk.t8h || {})[k]) { lk.t8h = lk.t8h || {}; lk.t8h[k] = 1; hum(-10, { song: true }); }
                return { html: '조개를 연다. 노래가 나온다. 뒤에서 작은 것이 따라온다.' };
            }
            return { html: '조개를 닫는다. 노래가 멈춘다. 뒤의 것도 멈춘다.' };
        }
    };
}
function t8fin(n) {
    return {
        k: 'team', id: 't8f' + n, title: '마지막 방',
        skip: function () { if (L.st().end) return true; if (n === 0) return false; const t = L.tally(L.votes('t8f0')); return t.win != null; },
        text: function () { return L.cond(p0('마지막 방').x, function () { return false; }) + (n ? '<div class="wd-sys">표가 갈렸다. 한 번 더.</div>' : ''); },
        opts: function () {
            const os = [];
            if ((L.x().t8open || 0) >= 3) os.push({ l: '끝까지 들려준다.', v: 'all' });
            os.push({ l: '닫는다.', v: 'shut' }, { l: '깨뜨린다.', v: 'break' });
            return os;
        },
        resolve: function (m) {
            const t = L.tally(m);
            let w = t.win;
            if (w == null && n === 0) return { html: '표가 갈렸다.' };
            if (w == null) w = 'shut';
            if (w === 'all') return { end: ['물고기가 인간이 되었다', 'w', { song: 1 }] };
            if (w === 'break') return { end: ['흩어진 노래', 'f', { song: 1 }] };
            return { end: ['바닥의 노래', 'd'] };
        }
    };
}

// ==========================================
// 사람마다 갈리는 결말 · 0
// ==========================================
function endMine(end, e) {
    const lk = me();
    if (end.dead && end.dead !== ME()) return null;
    if (end.t === '잘못 읽은 신호' && (end.down || []).indexOf(ME()) >= 0) {
        if (!e.z) { e.z = 1; lk.h = 0; X.save(); }
        return { die: '“오래 걸리셨네요.”' };
    }
    if (end.t === '꼬리로 만든 의자' && (end.givers || []).indexOf(ME()) >= 0) {
        if (!e.z) { e.z = 1; hum(-40); }
        if (lk.dead || H() <= 0) return { die: '다가오는 불빛 가운데 하나가 당신의 표를 들고 있다. “오래 걸리셨네요.”' };
        return { html: '<div class="wd-sys">표를 넘겼다 — 올라오는 길에 인간성 −40 (지금 ' + H() + ')</div>' };
    }
    if (end.song) {
        if (!e.z) { e.z = 1; hum(-20, { song: true }); }
        if (lk.dead || H() <= 0) return { die: '노래 가사가 하나로 들린다. “오래 걸리셨네요.”' };
        return { html: '<div class="wd-sys">모두 인간성 −20 (지금 ' + H() + ')</div>' };
    }
    return null;
}

// ==========================================
// 미션 표
// ==========================================
function memPlan(p, rnd) { }
L.M.siren = {
    S1: M(19, { plan: function (p, rnd) { p.pc = 2 + Math.floor(rnd() * 4); }, steps: COMMON.concat([{ k: 'sr_s1' }]) }),
    S2: M(26, {
        plan: function (p, rnd) { p.cnt = [9 + Math.floor(rnd() * 5), 10, 5 + Math.floor(rnd() * 5), 5 + Math.floor(rnd() * 5), 9 + Math.floor(rnd() * 5)]; },
        steps: COMMON.concat([{ k: 'sr_s2', n: 0 }, { k: 'sr_s2', n: 1 }, { k: 'sr_s2', n: 2 }, { k: 'sr_s2', n: 3 }, { k: 'sr_s2', n: 4 }, { k: 'sr_s2fin' }])
    }),
    S3: M(34, {
        plan: function (p, rnd) {
            p.beats = ['길게', '짧게'];
            for (let k = 2; k < 8; k++) p.beats.push(BEAT[Math.floor(rnd() * 3)]);
            p.ear = [BEAT[(BEAT.indexOf(p.beats[2]) + 1) % 3], BEAT[(BEAT.indexOf(p.beats[3]) + 2) % 3]];
        },
        steps: COMMON.concat([{ k: 'sr_s3', n: 0 }, { k: 'sr_s3', n: 1 }, { k: 'sr_s3', n: 2 }, { k: 'sr_s3', n: 3 }, { k: 'sr_s3fin' }])
    }),
    S4: M(42, { plan: function (p, rnd) { p.fish = rnd() < 0.5 ? 0 : 1; }, steps: COMMON.concat([{ k: 'sr_s4', n: 0 }, { k: 'sr_s4', n: 1 }, { k: 'sr_s4', n: 2 }, { k: 'sr_s4pick' }]) }),
    T1: M(48, {
        plan: function (p, rnd) {
            p.pz = Math.floor(rnd() * 12);
            const lets = shuf([0, 1, 2, 3], rnd);
            p.hear = {};
            const mem = p.mem.slice();
            mem.forEach(function (c) { p.hear[c] = []; });
            lets.forEach(function (k, i) { p.hear[mem[i % mem.length]].push(k); });
            if (mem.length > 4) mem.slice(4).forEach(function (c, i) { p.hear[c].push(lets[i % 4]); });
        },
        steps: COMMON.concat([{ k: 'sr_t1hear' }, t1point(0), t1point(1), t1point3(), T1_PEARL]),
        endMine: endMine
    }),
    T2: M(55, {
        plan: function (p, rnd) { p.holder = p.mem.length >= 3 ? p.mem[0] : 'npc'; p.fake = [0, 1, 2, 3].map(function () { return Math.floor(rnd() * 3); }); },
        steps: COMMON.concat([t2sig(0), t2resp(0), t2sig(1), t2resp(1), t2sig(2), t2resp(2), t2sig(3), t2resp(3), T2_BOTTOM]),
        endMine: endMine
    }),
    T3: M(62, { steps: COMMON.concat([{ k: 'sr_t3', n: 0 }, { k: 'sr_t3', n: 1 }, { k: 'sr_t3', n: 2 }, { k: 'sr_t3', n: 3 }, { k: 'sr_t3', n: 4 }, { k: 'sr_t3', n: 5 }, T3_LAST]), endMine: endMine }),
    T4: M(69, {
        plan: function (p, rnd) {
            p.silent = Math.floor(rnd() * 12);
            p.snd = shuf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rnd);
            p.snd.splice(p.silent, 0, -1);
            const n = Math.min(4, p.mem.length);
            const cuts = { 1: [[1, 11]], 2: [[1, 6], [6, 11]], 3: [[1, 4], [4, 8], [8, 11]], 4: [[1, 3], [3, 6], [6, 9], [9, 11]] }[n];
            p.arc = {};
            p.mem.forEach(function (c, i) {
                const ab = cuts[i % cuts.length];
                const out = [];
                for (let k = ab[0]; k <= ab[1]; k++) out.push((p.silent + k) % 12);
                p.arc[c] = out;
            });
        },
        steps: COMMON.concat([{ k: 'sr_t4hear' }, t4vote(0), t4vote(1), t4vote(2), T4_FIN]),
        endMine: endMine
    }),
    T5: M(75, {
        plan: function (p, rnd) {
            const s = shuf(p.mem, rnd);
            p.groups = [[], []];
            s.forEach(function (c, k) { p.groups[k % 2].push(c); });
            p.seat = 1 + Math.floor(rnd() * 8);
            p.hand = rnd() < 0.5 ? 0 : 1;
            p.arm = Math.floor(rnd() * 3);
            p.yoon = rnd() < 0.5 ? 0 : (rnd() < 0.5 ? -1 : 1);
        },
        steps: COMMON.concat([{ k: 'sr_t5split' }, { k: 'sr_t5path' }, T5_FRAME, t5in('seat'), t5in('hand'), t5in('arm')]),
        endMine: endMine
    }),
    T6: M(82, { steps: COMMON.concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(t6turn)).concat([T6_BOTTOM]), endMine: endMine }),
    T7: M(90, { steps: COMMON.concat([{ k: 'sr_t7', n: 0 }, { k: 'sr_t7', n: 1 }, { k: 'sr_t7', n: 2 }, T7_FIN]), endMine: endMine }),
    T8: M(97, { zeroEnd: '옮기다 0', steps: COMMON.concat([t8move(0), t8move(1), t8move(2), t8move(3), t8move(4), t8fin(0), t8fin(1)]), endMine: endMine })
};
['S1', 'S2', 'S3', 'S4'].forEach(function (k) { L.M.siren[k].endMine = endMine; });

X.chapters.siren.link = function (api, mid) { L.run('siren', mid); };

console.log('[이상한 나라] 물고기가 인간이 되었다 연계판 12종 연결');
})();
