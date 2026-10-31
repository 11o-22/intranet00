// ==========================================
// ★ 「이상한 나라의 ■■■」 — 천사와 악마 (몽환)
// bundles.json 마지막 묶음 — wonder-shop.js 다음
// ==========================================
//
//   원고: 사용자 원고 01~08 (a_intro · a_q · a_end) + 새 장면 09~16 (a_new, 「천사와 악마의 장 · 몽환 — 원고」 문서)
//   01 구름 위의 법정 → 심문 세 번(04~06, 개인 판정 d30 16+, 장비 없음 — 변호인의 깃펜 +5 · 방청석 과자 다시 굴리기)
//   → 07 최종 판결(셋 중 둘) → 08 무죄 / 유죄(「공정한 재판」, 죽음) → 09~15 → 16 부탁(미션) → 계단 → 빛을 찾아서 연계판
//
//   지문의 조건 줄(원고의 *(…)* 메모)은 여기서 고친다:
//     11  「일행 가운데 유죄를 받은 사람이 있었다면」 — 그런 사람이 있을 때만
//     15  「10에서 고른 시계에 따라 한 줄」 — 내가 고른 시계 한 줄만
//     16  미션 안내 메모 — 지운다
//     계단 「T2일 때는 손바닥을 마주칩니다」

(function wonderAngel() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'angel';

function F() { return X.F(); }
function S() { return X.S(); }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function me() { return currentUser.code; }

// ==========================================
// 고친 장면
// ==========================================
X.FIX.a_verdict = function () {
    const s = clone('a_end', 0);
    s.p = [s.p[0]];
    return s;
};
X.FIX.a_guilty = function () {
    const s = clone('a_end', 2);
    const last = s.p[s.p.length - 1];
    last.x += '<br><br>(즉사)';
    return s;
};
X.FIX.a_bet = function () {
    const s = clone('a_new', 5);
    const g = guiltyAny();
    s.p[0].x = paras(s.p[0].x).filter(function (p) {
        return g || p.indexOf('유죄를 받은 사람이 있었다면') < 0;
    }).join('<br><br>');
    return s;
};
const CLOCK = [
    '거꾸로 도는 시계가 열두 시를 거꾸로 지나칩니다.',
    '열두 시만 가리키는 시계는 여전히 열두 시를 가리킵니다.',
    '바늘 없는 시계에는 어느새 새가 돌아와 있습니다.'
];
X.FIX.a_15 = function () {
    const s = clone('a_new', 10);
    const c = (F() && typeof F().clock === 'number') ? F().clock : 1;
    s.p[1].x = paras(s.p[1].x).map(function (p) {
        return p.indexOf('10에서 고른 시계에 따라') >= 0 ? CLOCK[c] || CLOCK[1] : p;
    }).join('<br><br>');
    return s;
};
X.FIX.a_16 = function () {
    const s = clone('a_new', 11);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
// 미션 쪽 하나 — 제목 줄은 화면 제목으로, 소지품은 알림 줄로
X.FIX.a_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('a_new', team ? 13 : 12);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
X.FIX.a_stairs = function () {
    const s = clone('a_new', 14);
    if (F() && F().mis === 'T2') s.p[0].x = s.p[0].x.replace('천사가 망치를 가볍게 두드립니다.', '천사가 손바닥을 마주칩니다.');
    return s;
};

// 10. 거꾸로 도는 시계 — 고른 시계를 기억한다
X.CHOOSE.a_new = function (w, pg, i) {
    if (w.h === 4 && w.loc.length === 1 && w.loc[0] === 0 && F()) F().clock = i;
    return false;
};

// ==========================================
// 유죄 · 무죄 — 함께 보는 곳에 적어 둔다
// ==========================================
function verdicts() { return ((S().ang || {})[rk()] || {}); }
function guiltyAny() {
    const v = verdicts();
    return Object.keys(v).some(function (c) { return v[c] === 'g'; });
}

// ==========================================
// 흐름
// ==========================================
const SEQ = [
    ['a_new', 3], ['a_new', 4], ['a_bet'], ['a_new', 6], ['a_new', 8], ['a_new', 9], ['a_15'], ['a_16']
];
function seqGo(i) {
    const f = F();
    f.aseq = i;
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (st.length === 2) X.walk(st[0], st[1], 'angSeq');
    else X.walk('a_new', st[0], 'angSeq', { fix: st[0] });
}
X.THEN.angSeq = function () { seqGo((F().aseq || 0) + 1); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.aq = [];
        f.clock = null;
        f.aseq = 0;
        X.walk('a_intro', 1, 'angQ0');
    },
    mission: function (api, id) {
        X.walk('a_new', 'mis', 'angStairs', { fix: 'a_mis' });
    }
};
X.THEN.angQ0 = function () { X.go({ id: 'angQ', i: 0 }); };
X.THEN.angStairs = function () { X.walk('a_new', 'stairs', 'angLink', { fix: 'a_stairs' }); };
X.THEN.angLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 심문 세 번 — 개인 판정
// ==========================================
function qPage(i) { const s = X.scene('a_q', 0); return s && s.p[i]; }
function qBranch(i, ok) {
    try { return qPage(i).o[0].b[0].o[ok ? 2 : 3].b[0].x; } catch (e) { return ''; }
}
X.LIVE.angQ = 1;
X.VIEW.angQ = function (sc) {
    const f = F();
    const i = sc.i;
    const pg = qPage(i);
    const r = (f.aq || [])[i];
    const key = 'aq_' + rk() + '_' + i;
    if (f.wait && f.wait.key === key) {
        if (X.gateDone(key)) { f.wait = null; return nextQ(i); }
        X.draw('심문', X.rollHtml(r), X.waitHtml(key));
        return;
    }
    if (!r) {
        let b = X.btn('해명한다.', 'WONDER.angRoll(0)');
        if (X.has && X.has('변호인의 깃펜')) b += X.btn('깃펜을 쥐고 해명한다. <span style="font-size:10px;color:#d4af37;">(변호인의 깃펜 · +5)</span>', 'WONDER.angRoll(1)');
        X.draw(i === 0 ? '심문' : '—', X.clip(pg.x) + '<div class="wd-sys">[개인 판정 — 1~30 · 16 이상 성공]</div>', b);
        return;
    }
    let b = '';
    if (!r.ok && !f.aqRe && X.has && X.has('방청석 과자')) b += X.btn('방청석 과자를 한 입 먹고 다시 해명한다. <span style="font-size:10px;color:#d4af37;">(한 번)</span>', 'WONDER.angReroll()');
    b += X.btn('계속 간다.', 'WONDER.angNext()');
    X.draw('—', X.rollHtml(r) + X.clip(qBranch(i, r.ok)), b);
};
X.angRoll = function (pen) {
    const f = F();
    const sc = f.sc;
    if (!sc || sc.id !== 'angQ' || (f.aq || [])[sc.i]) return;
    let bonus = 0;
    if (pen && X.spend('변호인의 깃펜')) bonus = 5;
    const r = X.roll(bonus);
    f.aq = f.aq || [];
    f.aq[sc.i] = { raw: r.raw, bonus: r.bonus, total: r.total, ok: r.ok };
    X.pub('angQ/' + rk() + '/' + me() + '/' + sc.i, r.ok ? 1 : 0);
    X.save(); X.view();
};
X.angReroll = function () {
    const f = F();
    const sc = f.sc;
    if (!sc || sc.id !== 'angQ' || f.aqRe) return;
    const old = (f.aq || [])[sc.i];
    if (!old || old.ok) return;
    if (!X.spend('방청석 과자')) return;
    f.aqRe = 1;
    const r = X.roll(0);
    f.aq[sc.i] = { raw: r.raw, bonus: 0, total: r.total, ok: r.ok, re: 1 };
    X.pub('angQ/' + rk() + '/' + me() + '/' + sc.i, r.ok ? 1 : 0);
    X.save(); X.view();
};
X.angNext = function () {
    const f = F();
    const sc = f.sc;
    if (!sc || sc.id !== 'angQ') return;
    const key = 'aq_' + rk() + '_' + sc.i;
    if (!X.isTeam()) return nextQ(sc.i);
    X.gatePress(key);
    f.wait = { key: key };
    X.save(); X.view();
};
function nextQ(i) {
    const f = F();
    f.wait = null;
    if (i < 2) return X.go({ id: 'angQ', i: i + 1 });
    X.walk('a_end', 'verdict', 'angVerdict', { fix: 'a_verdict' });
}

// 07 → 08 — 셋 중 둘
X.THEN.angVerdict = function () {
    const f = F();
    const ok = (f.aq || []).filter(function (r) { return r && r.ok; }).length;
    const g = ok < 2;
    X.pub('ang/' + rk() + '/' + me(), g ? 'g' : 'n');
    try { darkRun.log.push('[천사와 악마] 심문 ' + ok + '/3 — ' + (g ? '유죄' : '무죄')); } catch (e) { }
    if (g) {
        // 함께 기다리는 줄에서 빠진다 — 일행은 이 사람을 기다리지 않는다
        X.pub('pl/' + me() + '/doom', true);
        return X.walk('a_end', 'guilty', null, { fix: 'a_guilty', solo: true });
    }
    X.walk('a_end', 1, 'angSeq0');
};
X.THEN.angSeq0 = function () { seqGo(0); };

console.log('[이상한 나라] 천사와 악마 (몽환) 연결');
})();
