// ==========================================
// ★ 「이상한 나라의 ■■■」 — 서큐버스 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음 (wonder-text-succubus.js 뒤)
// ==========================================
//
//   원고: 사용자 원고 01~10 · 공통 배드엔딩 (c_intro · c_ball · c_meet · c_bad)
//         + 새 장면 11~16 (c_new, 「서큐버스의 장 · 몽환 — 원고」 문서)
//   01 달빛 아래의 초대 → 02 정원 → 03 가면(개인 판정) → 04 문 앞
//   → 사건 셋(춤 · 만찬 · 거울 — 개인 판정, 선택지마다 성공 범위가 다름) → 셋 다 실패면 「사랑받는다는 것」(죽음)
//   → 10 붉은 장막 → 11~15 → 16 부탁 → 작은 문 → K의 방 「던전의 손님」판 (wonder-link-succubus.js)
//
//   이벤트 샵: 빌린 가면(춤 · 만찬 · 거울 판정 +5, 한 번) · 무도회 구두끈(춤 실패 한 번을 없던 일로)
//             · 거울 닦개(「사랑받는다는 것」 한 번 막기). 장미 꽃잎 차 · 꿈결 사탕은 연계판에서.

(function wonderSuccubus() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'succubus';

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function paras(x) { return String(x || '').split('<br><br>'); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
// 원고에 남은 「선택 — X.」 머리 줄과 「성공」 · 「실패」 머리 줄은 화면에 내지 않는다
function noHead(x) {
    return paras(x).filter(function (p) {
        const t = p.replace(/<[^>]+>/g, '').trim();
        return !/^선택 — /.test(t) && t !== '성공' && t !== '실패';
    }).join('<br><br>');
}
function deep(seq, fn) { (seq || []).forEach(function (pg) { fn(pg); (pg.o || []).forEach(function (o) { if (o.b) deep(o.b, fn); }); }); }
// 조건 메모 문단 — show(메모) 가 참일 때만 남기고, 메모는 지운다
function cond(x, show) {
    return paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || show(m[1]);
    }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
}
function maskShow(n) {
    const f = F() || {};
    if (n === '가면을 쓴 탐사자') return f.cmask !== 'exempt';
    if (n === '가면 착용을 면제받은 탐사자') return f.cmask === 'exempt';
    if (n === '팀일 때') return X.isTeam();
    return false;
}
X.C = X.C || {};
X.C.cond = cond; X.C.noHead = noHead; X.C.maskShow = maskShow;

// ==========================================
// 고친 장면
// ==========================================
X.FIX.c_door = function () {
    const s = clone('c_intro', 1);
    deep(s.p, function (pg) { pg.x = noHead(pg.x); });
    const b = s.p[0].o[1].b;
    b[b.length - 1].x += '<br><br>(즉사)';
    return s;
};
X.FIX.c_07 = function () {
    const s = clone('c_ball', 3);
    return { h: '07. 자정의 초대', p: [s.p[7]] };
};
X.FIX.c_bad = function () {
    const s = clone('c_bad', 0);
    s.h = '「사랑받는다는 것」';
    s.p[s.p.length - 1].x += '<br><br>(사망)';
    return s;
};
function condFix(i) {
    return function () {
        const s = clone('c_new', i);
        s.p.forEach(function (pg) { pg.x = cond(pg.x, maskShow); });
        deep(s.p, function (pg) { pg.x = cond(pg.x, maskShow); });
        return s;
    };
}
X.FIX.c_11 = condFix(3);
X.FIX.c_13 = condFix(5);
X.FIX.c_15 = condFix(8);
X.FIX.c_16 = function () {
    const s = clone('c_new', 9);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.c_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('c_new', team ? 11 : 10);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(cond(pg.x, maskShow));
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
X.FIX.c_door2 = function () {
    const s = clone('c_new', 12);
    s.h = '작은 문';
    if (F() && F().mis === 'T7') s.p[0].x = s.p[0].x.replace('그녀는 유리병에 남아 있던 장미 꽃잎을 한 장 떼어', '그녀는 드레스 자락에서 꽃잎을 한 장 떼어');
    return s;
};

// ==========================================
// 흐름
// ==========================================
//   [ 'w', 키, 장면 ] 걷기 · [ 'f', 고친 장면 ] · [ 'v', 화면 ] 판정 화면
const SEQ = [
    ['f', 'c_door'], ['w', 'c_intro', 2], ['w', 'c_intro', 3, { only0: 1 }], ['v', 'cMask'], ['w', 'c_intro', 4],
    ['v', 'cEv', 'dance'], ['w', 'c_ball', 2], ['v', 'cEv', 'dinner'], ['f', 'c_07'], ['w', 'c_ball', 4], ['v', 'cEv', 'mirror'],
    ['v', 'cVerdict'], ['w', 'c_meet', 1], ['f', 'c_11'], ['w', 'c_new', 4], ['f', 'c_13'], ['w', 'c_new', 7], ['f', 'c_15'], ['f', 'c_16']
];
X.FIX.c_03a = function () { const s = clone('c_intro', 3); return { h: s.h, p: [s.p[0]] }; };
function seqGo(i) {
    const f = F();
    f.cseq = i;
    X.save();
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (st[0] === 'w' && st[3] && st[3].only0) return X.walk('c_intro', 'c03a', 'cSeq', { fix: 'c_03a' });
    if (st[0] === 'w') return X.walk(st[1], st[2], 'cSeq');
    if (st[0] === 'f') return X.walk('c_new', st[1], 'cSeq', { fix: st[1] });
    X.go({ id: st[1], e: st[2] || null });
}
X.THEN.cSeq = function () { seqGo((F().cseq || 0) + 1); };
X.cNext = function () { X.THEN.cSeq(); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.cmask = null; f.cev = {}; f.cfails = 0; f.cseq = 0; f.cused = {};
        seqGo(0);
    },
    mission: function () { X.walk('c_new', 'mis', 'cDoor', { fix: 'c_mis' }); }
};
X.THEN.cDoor = function () { X.walk('c_new', 'door2', 'cLink', { fix: 'c_door2' }); };
X.THEN.cLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 판정 화면 공통 — 기다림 · 아이템
// ==========================================
function gateKey(name) { return 'c_' + rk() + '_' + name; }
function waitOr(name, draw) {
    const f = F();
    const key = gateKey(name);
    if (f.wait && f.wait.key === key) {
        if (X.gateDone(key)) { f.wait = null; X.save(); return X.cNext(); }
        draw(X.waitHtml(key));
        return true;
    }
    return false;
}
X.cDone = function (name) {
    const f = F();
    if (!X.isTeam()) return X.cNext();
    const key = gateKey(name);
    X.gatePress(key);
    f.wait = { key: key };
    X.save(); X.view();
};
function rollDc(dc, bonus) {
    const raw = 1 + Math.floor(Math.random() * 30);
    const total = raw + (bonus || 0);
    const ok = total >= dc;
    try { darkRun.log.push('[판정] d30 ' + raw + (bonus ? '+' + bonus : '') + ' vs ' + dc + ' → ' + (ok ? '성공' : '실패')); } catch (e) { }
    return { raw: raw, bonus: bonus || 0, total: total, ok: ok, dc: dc };
}
function rHtml(r) {
    return '<div class="wd-roll" style="color:' + (r.ok ? '#4CAF50' : '#f44336') + ';">' + r.total
        + (r.bonus ? ' <small>(' + r.raw + (r.bonus > 0 ? ' + ' : ' − ') + Math.abs(r.bonus) + ')</small>' : '') + ' <small>/ ' + r.dc + '</small></div>';
}
X.C.rollDc = rollDc; X.C.rHtml = rHtml;
function dcOf(label) { const m = String(label || '').replace(/<[^>]+>/g, '').match(/^(\d+)~30/); return m ? +m[1] : 16; }

// ==========================================
// 03 가면 — 「가면을 고른다」 16+ · 「가면을 쓰지 않겠다고 한다」 26+
// ==========================================
X.LIVE.cMask = 1;
X.VIEW.cMask = function () {
    const f = F();
    const pg = X.scene('c_intro', 3).p[1];
    const s = f.cms = f.cms || {};
    if (waitOr('mask', function (w) { X.draw('—', s.r ? rHtml(s.r) : '', w); })) return;
    if (s.j == null) {
        X.draw('가면 없는 손님', X.clip(pg.x), pg.o.map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.cMask(' + j + ')'); }).join(''));
        return;
    }
    const br = pg.o[s.j].b[0];
    if (!s.r) {
        X.draw('—', noHead(X.clip(br.x)) + '<div class="wd-sys">[개인 판정 — 1~30 · ' + dcOf(br.o[0].l) + ' 이상 성공]</div>', X.btn('판정한다.', 'WONDER.cMaskRoll()'));
        return;
    }
    const res = br.o[s.r.ok ? 2 : 3].b[0];
    X.draw('—', rHtml(s.r) + noHead(X.clip(res.x)), X.btn(X.clip((res.o && res.o[0] && res.o[0].l) || '무도회장으로 향한다.'), "WONDER.cDone('mask')"));
};
X.cMask = function (j) { const s = F().cms; if (s.j != null) return; s.j = j; X.save(); X.view(); };
X.cMaskRoll = function () {
    const f = F(), s = f.cms;
    if (s.r || s.j == null) return;
    const br = X.scene('c_intro', 3).p[1].o[s.j].b[0];
    s.r = rollDc(dcOf(br.o[0].l), 0);
    f.cmask = (s.j === 1 && s.r.ok) ? 'exempt' : 'worn';
    X.save(); X.view();
};

// ==========================================
// 사건 셋 — 춤(c_ball 1) · 만찬(c_ball 3) · 거울(c_ball 5)
// ==========================================
//   쪽 [0] 도입 + 두 선택 · [1..3] 첫째 선택(판정 · 성공 · 실패) · [4..6] 둘째 선택
const EV = { dance: 1, dinner: 3, mirror: 5 };
const EVN = { dance: '끝나지 않는 춤', dinner: '달콤한 만찬', mirror: '사랑의 회랑' };
X.LIVE.cEv = 1;
X.VIEW.cEv = function (sc) {
    const f = F();
    const e = sc.e;
    const pgs = X.scene('c_ball', EV[e]).p;
    const s = f.cev[e] = f.cev[e] || {};
    if (waitOr('ev_' + e, function (w) { X.draw('—', s.r ? rHtml(s.r) : '', w); })) return;
    if (s.j == null) {
        X.draw(EVN[e], X.clip(pgs[0].x), pgs[0].o.map(function (o, j) { return X.btn(X.clip(o.l), "WONDER.cEvPick('" + e + "'," + j + ')'); }).join(''));
        return;
    }
    const b = 1 + s.j * 3;
    const dc = dcOf(pgs[b].o[0].l);
    if (!s.r) {
        let btns = X.btn('판정한다.', "WONDER.cEvRoll('" + e + "',0)");
        if (X.has && X.has('빌린 가면') && !f.cused['빌린 가면']) btns += X.btn('빌린 가면을 고쳐 쓰고 판정한다. <span style="font-size:10px;color:#d4af37;">(빌린 가면 · +5)</span>', "WONDER.cEvRoll('" + e + "',1)");
        X.draw('—', noHead(X.clip(pgs[b].x)) + '<div class="wd-sys">[개인 판정 — 1~30 · ' + dc + ' 이상 성공]</div>', btns);
        return;
    }
    const res = pgs[s.r.ok ? b + 1 : b + 2];
    let extra = '';
    if (s.cancel) extra = '<div class="wd-sys">무도회 구두끈 — 이번 실패는 없던 일이 됩니다.</div>';
    let btns = '';
    if (!s.r.ok && !s.cancel && e === 'dance' && X.has && X.has('무도회 구두끈') && !f.cused['무도회 구두끈']) btns += X.btn('구두끈을 단단히 묶는다. <span style="font-size:10px;color:#d4af37;">(무도회 구두끈 · 이번 실패를 없던 일로)</span>', 'WONDER.cLace()');
    btns += X.btn(X.clip((res.o && res.o[0] && res.o[0].l) || '계속 간다.'), "WONDER.cDone('ev_" + e + "')");
    X.draw('—', rHtml(s.r) + noHead(X.clip(res.x)) + extra + failBar(), btns);
};
function failBar() {
    const f = F();
    return '<div class="wd-sys">실패 ' + (f.cfails || 0) + ' / 3</div>';
}
X.cEvPick = function (e, j) { const s = F().cev[e]; if (s.j != null) return; s.j = j; X.save(); X.view(); };
X.cEvRoll = function (e, mask) {
    const f = F(), s = f.cev[e];
    if (s.r || s.j == null) return;
    let bonus = 0;
    if (mask && !f.cused['빌린 가면'] && X.spend('빌린 가면')) { bonus = 5; f.cused['빌린 가면'] = 1; }
    const pgs = X.scene('c_ball', EV[e]).p;
    s.r = rollDc(dcOf(pgs[1 + s.j * 3].o[0].l), bonus);
    if (!s.r.ok) f.cfails = (f.cfails || 0) + 1;
    X.pub('cEv/' + rk() + '/' + ME() + '/' + e, s.r.ok ? 1 : 0);
    X.save(); X.view();
};
X.cLace = function () {
    const f = F(), s = f.cev.dance;
    if (!s || !s.r || s.r.ok || s.cancel) return;
    if (!X.spend('무도회 구두끈')) return;
    f.cused['무도회 구두끈'] = 1;
    s.cancel = 1;
    f.cfails = Math.max(0, (f.cfails || 0) - 1);
    X.save(); X.view();
};

// ==========================================
// 최종 판정 — 셋 다 실패면 「사랑받는다는 것」
// ==========================================
X.VIEW.cVerdict = function () {
    const f = F();
    const fails = f.cfails || 0;
    if (fails < 3) return X.cNext();
    if (!f.cmirrorAsk && X.has && X.has('거울 닦개') && !f.cused['거울 닦개']) {
        X.draw('—', '어쩐지 몸이 무겁습니다. 손님들이 하나둘 다가옵니다.<div class="wd-sys">세 번의 판정에 모두 실패했습니다.</div>',
            X.btn('거울 닦개로 회랑의 거울을 닦는다. <span style="font-size:10px;color:#d4af37;">(거울 닦개 · 「사랑받는다는 것」 한 번 막기)</span>', 'WONDER.cWipe()') + X.btn('그대로 둔다.', 'WONDER.cBad()'));
        return;
    }
    if (f.cwiped) {
        X.draw('—', '닦아 낸 거울 속에서 당신의 얼굴이 당신의 얼굴로 돌아옵니다. 다가오던 손님들이 걸음을 멈추고, 아쉬운 듯 길을 비켜 줍니다.', X.btn('남자를 따라간다.', 'WONDER.cNext()'));
        return;
    }
    X.cBad();
};
X.cWipe = function () {
    const f = F();
    if (!X.spend('거울 닦개')) return;
    f.cused['거울 닦개'] = 1; f.cwiped = 1; f.cmirrorAsk = 1;
    X.save(); X.view();
};
X.cBad = function () {
    const f = F();
    f.cmirrorAsk = 1;
    X.pub('pl/' + ME() + '/doom', true);
    try { darkRun.log.push('[서큐버스] 세 판정 모두 실패 — 사랑받는다는 것'); } catch (e) { }
    X.walk('c_bad', 'bad', null, { fix: 'c_bad', solo: true });
};

console.log('[이상한 나라] 서큐버스 (몽환) 연결');
})();
