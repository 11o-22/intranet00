// ==========================================
// ★ 「이상한 나라의 ■■■」 — 늑대인간 (몽환) + 자장가 놀이 엔진
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음, wonder-link-wolf.js 앞
// ==========================================
//
//   원고: 사용자 원고 01~04 (w_intro · w_play · w_end) + 새 장면 05~16 (w_new, 「늑대인간의 장 · 몽환 — 원고」 문서)
//   01 달님이 잠든 숲 → 02 요정들 · 규칙 → 03 자장가 놀이(15칸 · 발각 세 번째 = 「잠들지 않는 늑대」, 죽음)
//   → 04 숲 너머의 작은 오두막(먼저 닿은 사람은 공터에서 기다림) → 05~15 → 16 부탁(미션) → 책 속으로 → 동화의 뒷면 연계판
//   ★ 2026-10-31 줄이기(사용자 — 챕터마다 절반쯤): 05 · 09 · 11 · 12 · 15 만 남기고 문단도 덜어 냈다 (아래 「줄이기」 묶음)
//
//   자장가 놀이 (구현 설명 그대로)
//     「잘 자요 나쁜 늑대인간 님」 — 곡마다 6 · 5 · 4 · 3박자 가운데 무작위(2026-10-31 — 전에는 6 → 5 → 4 → 3 차례). 박자마다 원고의 분할 열 가지 가운데 하나(곡마다 무작위).
//     박자마다 모두 「전진 / 정지」를 고른 뒤 다음 구절을 공개한다. 전진 직후 공개된 구절에 「님」이 있으면 발각.
//     정지 두 번 연속 뒤에는 반드시 전진. 연속 정지는 전진하거나 노래 한 곡이 끝나면 처음부터.
//     전진 거리 · 발각은 사람마다. 15번째 전진과 세 번째 발각이 겹치면 죽음이 먼저.
//
//   엔진(X.WOLF)은 연계판(wonder-link-wolf.js)도 함께 쓴다 — 박자별 선택은 함께 보는 곳 lk/{회차}/v/{키}{박자} 에 적고,
//   모두가 같은 기록을 처음부터 다시 셈해서 같은 결과를 얻는다.
//
//   이벤트 샵: 자장가 악보(이번 노래의 마지막 음절이 몇 박 뒤인지 한 번) · 수면 모자 실밥(발각 하나 되돌림) — 놀이에서도 쓴다.

(function wonderWolf() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW || !X.L) return;
const L = X.L;
const CH = 'wolf';
const W = X.WOLF = X.WOLF || {};
function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function esc(s) { return L.esc(s); }
function rk() { return L.rk(); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function val(x) { return (x && typeof x === 'object') ? x.v : x; }

// ==========================================
// 자장가 — 원고의 분할표
// ==========================================
let PATS = null;
W.pats = function (n) {
    if (!PATS) {
        PATS = {};
        const sc = X.scene('w_play', 5);
        ((sc && sc.p[0] && sc.p[0].o) || []).forEach(function (o) {
            const k = parseInt(o.l, 10);
            const x = (o.b && o.b[0] && o.b[0].x) || '';
            PATS[k] = paras(x).map(function (q) { return q.replace(/<[^>]+>/g, '').replace(/^\s*\d+\.\s*/, '').split('/').map(function (w) { return w.trim(); }).filter(Boolean); }).filter(function (a) { return a.length; });
        });
    }
    return PATS[n] || [];
};
const CYCLE = [6, 5, 4, 3];
// ★ 2026-10-31 사용자 — 6 → 5 → 4 → 3 차례가 아니라 곡마다 **완전 무작위** (넷 가운데 하나).
//   씨앗(seed)과 곡 번호로 정하므로 함께 하는 사람 모두가 같은 노래를 듣는다.
W.song = function (seed, j) {
    const n = CYCLE[Math.floor(X.srand(seed + ':n' + j)() * CYCLE.length)];
    const ps = W.pats(n);
    const r = X.srand(seed + ':s' + j)();
    return { n: n, ph: ps.length ? ps[Math.floor(r * ps.length)] : ['잘', '자요', '나쁜', '늑대', '인간', '님'].slice(0, n) };
};
// 박자 t 의 자리 — breath(j) 가 참이면 노래 j 뒤에 입김 박자 하나가 끼어든다 (S3)
W.beat = function (cfg, t) {
    let j = 0;
    while (j < 500) {
        const s = W.song(cfg.seed, j);
        const extra = cfg.breath && cfg.breath(j) ? 1 : 0;
        if (t < s.n + extra) {
            if (t >= s.n) return { t: 0, j: j, k: s.n, n: s.n, ph: '후우—', breath: true, last: true, song: s };
            return { j: j, k: t, n: s.n, ph: s.ph[t], last: t === s.n - 1, song: s };
        }
        t -= s.n + extra;
        j++;
    }
    return null;
};
function beatAbs(cfg, t) { const b = W.beat(cfg, t); if (b) b.t = t; return b; }

// ==========================================
// 처음부터 다시 세기
// ==========================================
//   cfg = { key, seed, goal, mem, breath?, danger?(b, c, st), isGo?(v), onBeat?(b, picks, st, req), active?(c, st), init?() }
//   돌려주는 것 st = { t: 지금 박자, per: {사번: {pos, cat, stops, done, out, u}}, x: 미션 상태, last: 마지막으로 공개된 박자 }
W.state = function (cfg) {
    const per = {};
    const mem = cfg.mem.slice();
    mem.forEach(function (c) { per[c] = { pos: (cfg.start && cfg.start[c]) || 0, cat: 0, stops: 0, done: false, out: false, u: 0, res: [] }; });
    const lx = L.x();
    const ev = lx.ev || {};
    // 사건(발각 · 이해도 · 끌려감 · 칸) — 일어난 박자(t)에 맞춰 더한다. 박자가 없으면 처음부터.
    const evs = [];
    Object.keys(ev).forEach(function (c) {
        if (!per[c]) return;
        Object.keys(ev[c] || {}).forEach(function (id) { const e = ev[c][id] || {}; evs.push({ c: c, e: e, t: e.t || 0 }); });
    });
    evs.sort(function (a, b) { return a.t - b.t; });
    let ei = 0;
    function applyEv(upto) {
        while (ei < evs.length && evs[ei].t <= upto) {
            const x = evs[ei++], p = per[x.c], e = x.e;
            p.cat += e.c || 0; p.u += e.u || 0; if (e.out) p.out = true; if (e.pos) p.pos += e.pos;
            if (p.pos >= (cfg.goal || 15)) p.done = true;
        }
    }
    const st = { per: per, x: cfg.init ? cfg.init() : {}, t: 0, last: null };
    const alive = X.actives();
    const isGo = cfg.isGo || function (v) { return v === 'go'; };
    let t = 0;
    for (; t < 600; t++) {
        applyEv(t);
        const b = beatAbs(cfg, t);
        const picks = L.votes(cfg.key + t);
        const req = mem.filter(function (c) {
            const p = per[c];
            if (p.done || p.out || (p.cat >= 3 && !cfg.noOut)) return false;
            if (alive.indexOf(c) < 0) return false;
            return cfg.active ? cfg.active(c, st, t) : true;
        });
        if (!req.length) break;
        if (!req.every(function (c) { return picks[c] != null; })) break;
        req.forEach(function (c) {
            const p = per[c];
            const v = val(picks[c]);
            const go = isGo(v, c, st);
            const danger = cfg.danger ? cfg.danger(b, c, st, v) : (b.breath || String(b.ph).indexOf('님') >= 0);
            let caught = false;
            if (go) { p.pos++; p.stops = 0; if (danger) { p.cat++; caught = true; } }
            else p.stops++;
            if (picks[c] && typeof picks[c] === 'object' && picks[c].c) { p.cat += picks[c].c; caught = caught || picks[c].c > 0; }
            if (b.last && !b.breath) p.stops = 0;
            p.res[t] = { go: go, caught: caught };
            if (p.pos >= (cfg.goal || 15)) p.done = true;
        });
        if (cfg.onBeat) cfg.onBeat(b, picks, st, req);
        st.last = b;
        if (st.stop) { t++; break; }
    }
    applyEv(1e9);
    st.t = t;
    st.cur = beatAbs(cfg, t);
    return st;
};
// 지금 노래에서 이미 공개된 구절들
W.sung = function (cfg, st) {
    const cur = st.cur;
    if (!cur) return [];
    const out = [];
    for (let t = st.t - cur.k; t < st.t; t++) { const b = beatAbs(cfg, t); if (b && b.j === cur.j) out.push(b.ph); }
    return out;
};
W.event = function (id, e) { e = Object.assign({ t: W._st ? W._st.t : 0 }, e); return L.pub('x/ev/' + ME() + '/' + id, e); };

// 한 박자 화면 — 공개된 구절 · 내 결과 · 남은 걸음 · 발각 · 단추
W.statusHtml = function (p, goal, extra) {
    return '<div class="wd-note" style="border-color:#3a3220; font-size:12px; line-height:1.9;">'
        + ((goal || 15) < 999 ? '<b>🐾 남은 걸음: ' + Math.max(0, (goal || 15) - p.pos) + '👣</b><br>' : '') + '<b>🌙 발각 횟수: ' + Math.max(0, p.cat) + ' / 3</b>' + (extra || '') + '</div>';
};
W.lastHtml = function (cfg, st) {
    const b = st.last;
    if (!b) return '';
    const me = st.per[ME()];
    const r = me && me.res[b.t];
    let h = '<div style="text-align:center; font-size:22px; color:#d4af37; font-weight:bold; margin:6px 0 4px 0; letter-spacing:2px;">' + esc(b.ph) + '</div>';
    if (b.breath) h += '<div class="wd-sys">입김 박자</div>';
    if (r) h += '<div class="wd-sys" style="color:' + (r.caught ? '#f44336' : '#9a8') + ';">' + (r.go ? '전진 — 1칸' : '정지') + (r.caught ? ' · ⚠️ 발각' : '') + '</div>';
    return h;
};
W.sungHtml = function (cfg, st) {
    const s = W.sung(cfg, st);
    const cur = st.cur;
    // ★ 몇 박자 노래인지는 보이지 않는다 (2026-10-31 사용자 — 보이면 마지막 박자에만 멈추면 된다).
    //   노래는 그대로 바뀐다: 곡마다 박 수(6 · 5 · 4 · 3)와 분할을 무작위로 고른다. 박 수는 🎼 자장가 악보로만 안다.
    return '<div style="text-align:center; font-size:12px; color:#888; margin-bottom:8px;">♪ ' + (s.length ? s.map(esc).join(' / ') + ' / …' : '…') + '</div>';
};
// 수면 모자 실밥 · 자장가 악보
W.itemBtns = function (st) {
    let b = '';
    const me = st.per[ME()];
    if (me && me.cat > 0 && X.has && X.has('수면 모자 실밥')) b += X.btn('🧶 수면 모자 실밥을 쥔다. <span style="font-size:10px;color:#d4af37;">(발각 하나 되돌림)</span>', 'WONDER.WOLF.thread()');
    if (X.has && X.has('자장가 악보') && !(F().wlScore === rk() + ':' + (st.cur ? st.cur.j : -1))) b += X.btn('🎼 자장가 악보를 편다. <span style="font-size:10px;color:#d4af37;">(마지막 음절이 언제 올지)</span>', 'WONDER.WOLF.score()');
    return b;
};
W.thread = function () {
    if (!X.spend('수면 모자 실밥')) return;
    W.event('thread' + Date.now(), { c: -1 });
    try { showDarkToast('🧶 발각 하나를 되돌렸습니다'); } catch (e) { }
};
W.score = function () {
    const st = W._st;
    if (!st || !st.cur || !X.spend('자장가 악보')) return;
    F().wlScore = rk() + ':' + st.cur.j;
    F().wlScoreTxt = '이 노래는 ' + st.cur.n + '박자. 마지막 음절은 ' + (st.cur.n - st.cur.k) + '번째 박자 뒤에 옵니다.';
    X.save(); X.view();
};
W.scoreHtml = function (st) {
    const f = F();
    if (f.wlScore && st.cur && f.wlScore === rk() + ':' + st.cur.j && f.wlScoreTxt) return '<div class="wd-sys">🎼 ' + esc(f.wlScoreTxt) + '</div>';
    return '';
};
// 고르기 단추 — 정지 두 번 뒤에는 전진만
W.pickBtns = function (cfg, st, extra) {
    const me = st.per[ME()];
    let b = X.btn('전진한다.', "WONDER.WOLF.pick('" + cfg.key + "'," + st.t + ",'go')");
    if (me.stops < 2) b += X.btn('정지한다.', "WONDER.WOLF.pick('" + cfg.key + "'," + st.t + ",'stop')");
    else b += '<div class="wd-sys">두 번 연속 멈췄습니다. 이번에는 반드시 전진해야 합니다.</div>';
    return b + (extra || '');
};
W.pick = function (key, t, v, more) {
    const m = L.votes(key + t);
    if (m[ME()] != null) return;
    L.vote(key + t, more ? Object.assign({ v: v }, more) : v);
};
W.who = function (cfg, st) {
    return cfg.mem.filter(function (c) { const p = st.per[c]; return !p.done && !p.out && (p.cat < 3 || cfg.noOut) && X.actives().indexOf(c) >= 0 && (cfg.active ? cfg.active(c, st, st.t) : true); });
};

// ==========================================
// 고친 장면 — 원고의 진행 메모를 선택지에서 지운다
// ==========================================
function cleanLabels(seq) {
    (seq || []).forEach(function (p) {
        (p.o || []).forEach(function (o) {
            o.l = String(o.l).replace(/\s*\([^)]*\)\s*$/, '').replace(/\s*<i>\([^)]*\)<\/i>\s*$/, '');
            cleanLabels(o.b);
        });
    });
}
function fixed(key, i, fn) {
    const s = clone(key, i);
    if (!s) return null;
    cleanLabels(s.p);
    if (fn) fn(s);
    return s;
}
X.FIX.wf01 = function () { return fixed('w_intro', 1); };
X.FIX.wf04 = function () { return fixed('w_end', 1); };
X.FIX.wf04a = function () { return fixed('w_end', 1, function (s) { s.p = [s.p[0]]; }); };
X.FIX.wfBad = function () { return fixed('w_play', 4, function (s) { s.h = '—'; }); };
X.FIX.wf10 = function () {
    return fixed('w_new', 8, function (s) {
        const br = s.p[0].o[0].b[0];
        br.x = paras(br.x).filter(function (q) { return !/^<i>\(들켰을 때\)<\/i>/.test(q) || F().wfPrac; })
            .map(function (q) { return q.replace(/\s*<i>\(전진 \/ 정지[^)]*\)<\/i>/, '').replace(/^<i>\(들켰을 때\)<\/i>\s*/, ''); }).join('<br><br>');
    });
};
X.FIX.wf16 = function () {
    return fixed('w_new', 15, function (s) { s.p[0].x = paras(s.p[0].x).filter(function (q) { return !/^<i>미션은/.test(q); }).join('<br><br>'); });
};
X.FIX.wfMis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('w_new', team ? 17 : 16);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    cleanLabels([pg]);
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
X.FIX.wfBook = function () {
    return fixed('w_new', 18, function (s) {
        const mis = F() && F().mis;
        s.p[0].x = s.p[0].x.replace(/\s*<i>\(S4 · T3일 때는 착한 늑대님이 직접 넘깁니다\.\)<\/i>/, '');
        if (mis === 'S4' || mis === 'T3') s.p[0].x = s.p[0].x.replace('탁자 위의 책이 혼자서 한 장을 넘깁니다.', '착한 늑대님이 탁자 위의 책을 직접 한 장 넘깁니다.');
    });
};

// 10. 창밖의 모자 — 「주워 온다」는 세 걸음 연습 놀이 (벌칙 없음, 03의 발각에 더해지지 않음)
X.CHOOSE.w_new = function (w, pg, i) {
    if (w.fix === 'wf10' && w.loc.length === 1 && w.loc[0] === 0 && i === 0 && F()) {
        F().wfPracBack = JSON.parse(JSON.stringify(w));
        F().wfPrac = 0;
        X.go({ id: 'wprac', n: 0 });
        return true;
    }
    return false;
};
X.VIEW.wprac = function (sc) {
    const f = F();
    const s = W.song(rk() + ':prac', 1);
    if (sc.n >= 3) {
        const back = f.wfPracBack;
        back.loc = [0, 0, 0];
        f.sc = back;
        X.save();
        return X.view();
    }
    const done = (sc.r || []).map(function (r, k) { return esc(s.ph[k]) + (r ? (r.go ? ' (전진' + (r.c ? ' · 들킴' : '') + ')' : ' (정지)') : ''); });
    X.draw('창밖의 모자', '“그럼 연습이에요! 세 걸음만!”<br><br>도토리 모자 요정이 지휘봉을 들자 요정들이 다시 자장가를 시작합니다.'
        + '<div style="text-align:center; font-size:15px; color:#d4af37; margin:12px 0;">♪ ' + (done.length ? done.join(' / ') + ' / …' : '…') + '</div>'
        + '<div class="wd-sys">연습 놀이 — 세 박자 · 벌칙 없음</div>',
        X.btn('전진한다.', "WONDER.WOLF.prac('go')") + X.btn('정지한다.', "WONDER.WOLF.prac('stop')"));
};
W.prac = function (v) {
    const f = F();
    const sc = f.sc;
    if (!sc || sc.id !== 'wprac') return;
    const s = W.song(rk() + ':prac', 1);
    const k = sc.n;
    const c = v === 'go' && String(s.ph[k] || '').indexOf('님') >= 0;
    if (c) f.wfPrac = 1;
    sc.r = (sc.r || []).concat([{ go: v === 'go', c: c }]);
    sc.n = k + 1;
    X.save(); X.view();
};

// ★ 줄이기 (2026-10-31 사용자 — 챕터마다 절반쯤 · 연계판은 그대로) — 문단을 통째로 뺀다 (wonder-core.js X.cut)
//   흐름에서 뺀 새 장면: 06 따뜻한 우유 · 07 뜨개질 · 08 양은 출입 금지 · 10 창밖의 모자(연습 놀이) · 13 달님의 뒤척임 · 14 도토리와 찻숟가락
//   (위의 wf10 · CHOOSE.w_new · wprac 은 흐름에서 빠져 쓰이지 않는다 — 되돌릴 때 SEQ 에 'wf10' 만 다시 넣으면 된다)
//   남긴 것: 자장가 규칙(02 요정들의 말 · 놀이 안내 · 03 「마지막 음절」) · 닫힌 문 갈래가 다시 가리키는 문 · 리본 · 은방울 · 팻말 · 착한 늑대님 첫 조우(05) ·
//   「자장가는 여섯 박자와 세 박자에서 놀아요」(09) · 『빨간 모자』 · 찢긴 장(11) · 반납함 · 카드(12) · 펼쳐진 책(15) · 부탁(16) · 미션 · 책 속으로
//   공터 기다림 화면(wclear)은 04 둘째 쪽의 앞 두 문단을 쓰므로 그 둘은 남긴다.
X.cut('w_intro', '01. 달님이 잠든 숲', [
    '혀끝에 닿은 사탕에서는', '하늘에는 커다랗고 둥근 보름달이', '숲 한가운데에는 구불구불한 오솔길이', '쉿, 조용히.', '누군가 그렇게 속삭이는 것 같습니다',
    '마침 숲에서 불어온 바람이', '은방울이 다시 한번 딸랑',
    '발밑에서 낙엽이 바스러집니다', '대신 길 양옆으로 키 큰 나무들이',
    '순식간에 주변의 꽃잎과 나뭇잎 사이에서', '“정말 손님이야!”', '“어쩌지? 지금은 늑대님이', '“그러니까 조용히 오시라고', '“하지만 길을 건너가셔야', '요정들이 작은 손바닥을 마주칩니다',
    '“아주아주 큰일!”', '“정말 무시무시한 일이야!”', '요정들이 고개를 끄덕입니다. 그러더니',
    '“사람을 잡아먹어!”', '“양도 잡아먹고!”', '“가끔은 우리도 잡아먹으려고', '“난 안 잡아먹혔어!”', '“그야 네가 도망쳤으니까!”', '요정들은 잠시 자기들끼리 다투다가',
    '나무들 사이로 작은 오두막의 지붕이', '그 소리에 나뭇가지에 앉아 있던 새',
    '“숨도 쉬어야 하고!”', '“가끔은 재채기도 나고!”', '“난 노래하다가 딸꾹질한', '“그건 네가 너무 많이 먹어서', '도토리 모자 요정은 못 말리겠다는 듯', '요정이 입을 꾹 다뭅니다',
    '“그래도 너무 걱정하지 마세요!', '“맞아, 맞아! 달빛이 그림자를', '하나, 둘, 셋', '요정은 나뭇가지를 내려놓고',
    '“과자도 주셔!”', '“따뜻한 우유도!”', '“가끔은 머리도 쓰다듬어', '요정들이 저마다 한마디씩', '그러다 문득, 나무 아래에서 커다란 코 고는', '드르러렁', '요정들이 일제히 입을 다뭅니다', '도토리 모자 요정은 조심스럽게 늑대인간을',
    '요정들이 하나둘 오솔길 양옆에', '나쁜 늑대님은 여전히 잠들어', '달님은 하늘에서 둥글게 웃고'
]);
X.cut('w_play', '03. 달님을 깨우지 마세요!', [
    '그러자 숲 곳곳에 흩어져 있던', '저 멀리, 착한 늑대인간의 오두막에서는', '하지만 길 한가운데에는 나쁜 늑대인간이', '드르렁……', '늑대인간의 뾰족한 귀가 한 번', '요정은 당신을 향해 눈을 찡긋'
]);
X.cut('w_end', '04. 숲 너머의 작은 오두막', [
    '나뭇가지 위에서 요정 하나가 환호성을',
    '요정 하나가 당신에게 의자를 권합니다', '공터에서는 조금 전 지나온 오솔길이', '“잘 자요…… 나쁜 늑대인간 님', '노랫소리가 멎을 때마다 공터의', '한 사람, 또 한 사람.', '숲을 무사히 빠져나온 이들이', '도토리 모자 요정이 공터 한가운데로', '그러자 공터 너머로 이어지는',
    '숲은 어느새 한결 밝아져', '오두막은 꼭 그림책에서 오려 낸', '“착한 늑대님은 양을 별로', '도토리 모자 요정이 설명합니다', '“왜요?”', '다른 요정이 묻자, 도토리 모자', '“글쎄요. 너무 복슬복슬해서', '“늑대님도 복슬복슬한데!', '“그러니까 질투가 나는 거지', '마당에는 잘 손질된 꽃밭이'
]);
X.cut('w_new', '05. 문이 열린다', ['낮고 둥글둥글한 목소리입니다', '황동 손잡이가 천천히 돌아갑니다', '요정들이 당신보다 먼저 문틈으로']);
X.cut('w_new', '11. 늑대의 책장', ['당신은 책등의 제목을 하나씩', '“무서운 장은 뜯어 두었어요', '“저희 안 무서워요!”', '“지난번에 울었잖아.”', '“그건 눈에 먼지가 들어간']);
// 16 첫 문단은 뺀 14(도토리 던지기)의 도토리를 가리킨다
X.cut('w_new', '16. 부탁', ['요정들이 탁자 가장자리에 나란히']);

// ==========================================
// 흐름
// ==========================================
// ★ 2026-10-31 줄이기 — 전: [3, 4, 5, 6, 7, 'wf10', 10, 11, 12, 13, 14, 'wf16']
const SEQ = [3, 7, 10, 11, 14, 'wf16'];
function seqGo(i) {
    const f = F();
    f.wseq = i;
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (typeof st === 'number') X.walk('w_new', st, 'wfSeq');
    else X.walk('w_new', st, 'wfSeq', { fix: st });
}
X.THEN.wfSeq = function () { seqGo((F().wseq || 0) + 1); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.wseq = 0;
        f.wfPrac = 0;
        X.walk('w_intro', 'wf01', 'wfRules', { fix: 'wf01' });
    },
    mission: function () { X.walk('w_new', 'mis', 'wfBook', { fix: 'wfMis' }); }
};
X.THEN.wfRules = function () { X.go({ id: 'wplay' }); };
X.THEN.wfBook = function () { X.walk('w_new', 'book', 'wfLink', { fix: 'wfBook' }); };
X.THEN.wfLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 03. 달님을 깨우지 마세요! — 놀이
// ==========================================
function gameCfg() {
    const st0 = (L.st().v) || {};
    const set = {};
    X.actives().forEach(function (c) { set[c] = 1; });
    Object.keys(st0).forEach(function (k) { if (/^wg\d+$/.test(k)) Object.keys(st0[k] || {}).forEach(function (c) { set[c] = 1; }); });
    const g = (L.x().wgDead) || {};
    Object.keys(g).forEach(function (c) { set[c] = 1; });
    return { key: 'wg', seed: rk() + ':wg', goal: 15, mem: Object.keys(set).sort() };
}
X.LIVE.wplay = 1;
X.VIEW.wplay = function () {
    const f = F();
    const cfg = gameCfg();
    const st = W.state(cfg);
    W._st = st;
    const me = st.per[ME()];
    if (!me) { X.draw('—', '', X.waitHtml('_none', '…')); return; }
    // 세 번째 발각 — 죽음이 먼저
    if (me.cat >= 3) {
        X.pub('pl/' + ME() + '/doom', true);
        L.pub('x/wgDead/' + ME(), 1);
        try { darkRun.log.push('[늑대인간] 세 번째 발각'); } catch (e) { }
        return X.walk('w_play', 'bad', null, { fix: 'wfBad', solo: true });
    }
    if (me.done) {
        try { darkRun.log.push('[늑대인간] 15칸 — 공터 도착'); } catch (e) { }
        f.wfArrived = 1;
        return X.walk('w_end', 'end0', 'wfClearing', { fix: 'wf04a', solo: true });
    }
    const intro = st.t === 0 ? paras(X.clip(X.scene('w_play', 1).p[0].x)).filter(function (q) { return !/🐾|🌙/.test(q); }).join('<br><br>') + '<br><br>' : '';
    let notice = '';
    const lb = st.last;
    if (lb && me.res[lb.t] && me.res[lb.t].caught && me.cat < 3) notice = X.clip(X.scene('w_play', 3).p[0].x).replace(/🌙 발각 횟수: n \/ \(3-n\)/, '🌙 발각 횟수: ' + me.cat + ' / 3');
    const m = L.votes(cfg.key + st.t);
    let b;
    if (m[ME()] != null) b = L.waitList(m, W.who(cfg, st));
    else b = W.pickBtns(cfg, st, W.itemBtns(st));
    X.draw('달님을 깨우지 마세요!', intro + W.lastHtml(cfg, st) + (notice ? '<div class="wd-note" style="border-color:#7f0000;">' + notice + '</div>' : '') + W.sungHtml(cfg, st) + W.scoreHtml(st) + W.statusHtml(me, 15), b);
};
// 04 첫 쪽(혼자) → 공터에서 모두를 기다린다 → 04 나머지(함께)
X.THEN.wfClearing = function () { X.go({ id: 'wclear' }); };
X.LIVE.wclear = 1;
X.VIEW.wclear = function () {
    const cfg = gameCfg();
    const st = W.state(cfg);
    const left = W.who(cfg, st);
    if (left.length) {
        X.draw('공터', paras(X.clip(X.scene('w_end', 1).p[1].x)).slice(0, 2).join('<br><br>'),
            '<div class="wd-wait">아직 숲을 건너는 일행을 기다립니다.<br>' + left.map(function (c) { return '… ' + esc(X.nameOf(c)) + ' (' + st.per[c].pos + ' / 15)'; }).join(' · ') + '</div>');
        return;
    }
    X.walk('w_end', 'end1', 'wfSeq0', { fix: 'wf04', at: 1 });
};
X.THEN.wfSeq0 = function () { seqGo(0); };

console.log('[이상한 나라] 늑대인간 (몽환) · 자장가 엔진 연결');
})();
