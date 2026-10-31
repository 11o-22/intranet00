// ==========================================
// ★ 「이상한 나라의 ■■■」 — 강시 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음, wonder-link-jiangshi.js 앞
// ==========================================
//
//   원고: 사용자 원고 01~10 (j_intro · j_hide · j_end) + 새 장면 11~16 (j_new, 「강시의 장 · 몽환 — 원고」 문서)
//   01 달빛이 머무는 마을(닫힌 문) → 02 → 03 → 숨바꼭질 네 번 → 09 → 10 → 11~15 → 16 부탁 → 마을 끝으로 → 검역 실패 연계판
//
//   숨바꼭질 (사용자 원고 「진행 구조 및 시스템 설명」 그대로)
//     · 주사위 판정 없음. 매 회차 다섯 은신처 가운데 하나, 술래는 서로 다른 두 곳을 무작위로 — 일행 모두에게 같다.
//     · 발각은 쌓인다. 두 번째 발각은 그 자리에서 죽음(「영원한 놀이 친구」). 남은 사람은 네 번째까지.
//     · 이벤트 샵: 「홍등 성냥」 — 숨기 전에 술래가 올 곳 하나를 미리 본다.
//                  「작은 방울」 — 발각 한 번을 없던 일로 한다(발각되는 순간 묻는다).
//   새 장면의 조건 줄: 11 「한 번 발각된 적이 있다면」 · 15 「14에서 화환을 받았다면」 · 16 미션 메모 — 여기서 고친다.
//   12의 「이번엔 내가 숨을게」 — 술래가 다섯 곳 가운데 하나에 숨고, 세 번 안에 찾는다 (판정 없음, 개인).

(function wonderJiangshi() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'jiangshi';
const PLACES = ['A. 홍등 찻집', 'B. 종이 인형 가게', 'C. 연꽃 연못', 'D. 달맞이 사당', 'E. 청죽 숲'];

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function jh() { const f = F(); f.jh = f.jh || { found: 0 }; return f.jh; }
// 조건 메모 문단 — show(메모) 가 참이면 메모만 지우고 남긴다
function cond(x, show) {
    return paras(x).filter(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>/);
        return !m || show(m[1]);
    }).map(function (p) { return p.replace(/^<i>\([^)]*\)<\/i>\s*/, ''); }).join('<br><br>');
}

// ==========================================
// 고친 장면
// ==========================================
X.FIX.j_found2 = function () {
    const s = clone('j_hide', 11);
    s.p[0].x = s.p[0].x.replace(/^\(여기서부터 이미 사망 판정\)\s*(<br><br>)?/, '');
    return s;
};
X.FIX.j_11 = function () {
    const s = clone('j_new', 3);
    s.p[0].x = cond(s.p[0].x, function (n) { return n.indexOf('한 번 발각된 적이 있다면') >= 0 && jh().found >= 1; });
    return s;
};
X.FIX.j_12 = function () {
    const s = clone('j_new', 4);
    s.p = [s.p[0]];
    return s;
};
X.FIX.j_15 = function () {
    const s = clone('j_new', 8);
    s.p[0].x = cond(s.p[0].x, function (n) { return n.indexOf('화환을 받았다면') >= 0 && !!F().jWreath; });
    return s;
};
X.FIX.j_16 = function () {
    const s = clone('j_new', 9);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.j_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('j_new', team ? 11 : 10);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
// 14 — 화환을 받았는지 기억한다 (15 · 연계판 진입 문단)
const _choose = X.CHOOSE.j_new;
X.CHOOSE.j_new = function (w, pg, i) {
    if (w.h === 7 && w.loc.length === 1 && w.loc[0] === 0 && F()) { F().jWreath = (i === 0); X.save(); }
    return _choose ? _choose.apply(this, arguments) : false;
};

// ==========================================
// 흐름
// ==========================================
X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.jh = { found: 0 };
        f.jWreath = false;
        f.jSeek = null;
        X.walk('j_intro', 1, 'jI2');
    },
    mission: function () {
        X.walk('j_new', 'mis', 'jExit', { fix: 'j_mis' });
    },
    link: function (api, mid) { if (X.L && X.L.run) X.L.run(CH, mid); }
};
X.THEN.jI2 = function () { X.walk('j_intro', 2, 'jI3'); };
X.THEN.jI3 = function () { X.walk('j_intro', 3, 'jH0'); };
X.THEN.jH0 = function () { X.go({ id: 'jHide', r: 0 }); };
X.THEN.jE9 = function () { X.walk('j_end', 1, 'jE10'); };
X.THEN.jE10 = function () { X.walk('j_end', 2, 'jN11'); };
X.THEN.jN11 = function () { X.walk('j_new', 'n11', 'jN12', { fix: 'j_11' }); };
X.THEN.jN12 = function () { X.walk('j_new', 'n12', 'jSeek', { fix: 'j_12' }); };
X.THEN.jSeek = function () { F().jSeek = { spot: Math.floor(Math.random() * 5), tries: 0, done: 0, last: null }; X.go({ id: 'jSeek' }); };
X.THEN.jN13 = function () { X.walk('j_new', 5, 'jN14'); };
X.THEN.jN14 = function () { X.walk('j_new', 7, 'jN15'); };
X.THEN.jN15 = function () { X.walk('j_new', 'n15', 'jN16', { fix: 'j_15' }); };
X.THEN.jN16 = function () { X.walk('j_new', 'n16', 'jMis', { fix: 'j_16' }); };
X.THEN.jMis = function () { X.toMission(); };
X.THEN.jExit = function () { X.walk('j_new', 12, 'jLink'); };
X.THEN.jLink = function () { X.go({ id: 'link' }); };

// ==========================================
// 숨바꼭질 네 번
// ==========================================
function visitsOf(r) { return ((S().jh || {})[rk()] || {})[r] || null; }
function hkey(r, k) { return ('jh_' + rk() + '_' + r + '_' + k).replace(/[.#$\[\]\/]/g, '_'); }
X.LIVE.jHide = 1;
X.VIEW.jHide = function (sc) {
    const f = F();
    const r = sc.r;
    const v = visitsOf(r);
    const head = '<div class="wd-sys">발각 ' + jh().found + ' / 2</div>';
    if (!v) {
        const a = Math.floor(Math.random() * 5);
        let b = Math.floor(Math.random() * 4); if (b >= a) b++;
        X.tx('jh/' + rk() + '/' + r, function (cur) { return cur || [a, b]; });
        X.draw('—', '', X.waitHtml('_none', '청동 종이 울리기를 기다립니다…'));
        return;
    }
    const start = X.scene('j_hide', 2 + r);
    if (sc.pick == null) {
        let x = X.clip(start.p[0].x) + head;
        if (sc.peek != null) x += '<div class="wd-sys">🔥 홍등 성냥 — 성냥불 그림자가 「' + PLACES[sc.peek] + '」 쪽으로 먼저 갑니다. 술래가 그곳에 옵니다.</div>';
        let b = (start.p[0].o || []).map(function (o, j) { return X.btn(X.clip(o.l), 'WONDER.jPick(' + j + ')'); }).join('');
        if (sc.peek == null && X.has && X.has('홍등 성냥')) b += X.btn('🔥 홍등 성냥을 긋는다. <span style="font-size:10px;color:#d4af37;">(술래가 올 곳 하나를 미리 본다)</span>', 'WONDER.jPeek()');
        X.draw(r === 0 ? '첫 번째 숨바꼭질' : '—', x, b);
        return;
    }
    const hideTx = X.clip(X.scene('j_hide', 6).p[sc.pick].x);
    const k1 = hkey(r, 'h');
    if (X.isTeam() && !X.gateDone(k1)) { X.draw('—', hideTx, X.waitHtml(k1, '다른 일행이 숨기를 기다립니다.')); return; }
    if (!sc.go) {
        X.draw('—', X.clip(X.scene('j_hide', 7).p[0].x), X.btn('숨을 죽인다.', 'WONDER.jGo()'));
        return;
    }
    const hit = v.indexOf(sc.pick) >= 0;
    if (hit && !sc.res && !sc.bellAsk && X.has && X.has('작은 방울')) {
        X.draw('—', '콩. 콩.<br><br>발소리가 당신이 숨은 곳 앞에서 멈춥니다.', X.btn('🔔 작은 방울을 울린다. <span style="font-size:10px;color:#d4af37;">(이번 발각을 없던 일로)</span>', 'WONDER.jBell(1)') + X.btn('숨을 참는다.', 'WONDER.jBell(0)'));
        return;
    }
    if (!sc.res) {
        let res = 'safe';
        if (hit && !sc.bell) { jh().found++; res = jh().found >= 2 ? 'dead' : 'found'; }
        sc.res = res;
        try { darkRun.log.push('[강시] 숨바꼭질 ' + (r + 1) + ' — ' + PLACES[sc.pick] + ' · ' + res); } catch (e) { }
        X.save();
        if (res === 'dead') {
            X.pub('pl/' + ME() + '/doom', true);
            return X.walk('j_hide', 'found2', null, { fix: 'j_found2', solo: true });
        }
    }
    const k2 = hkey(r, 'b');
    if (sc.back) {
        if (!X.isTeam() || X.gateDone(k2)) return nextRound(r);
        X.draw('—', '광장으로 돌아왔습니다.', X.waitHtml(k2, '모든 생존자가 광장으로 돌아오기를 기다립니다.'));
        return;
    }
    const pg = sc.res === 'found' ? X.scene('j_hide', 9).p[0] : X.scene('j_hide', 8).p[0];
    X.draw('—', (sc.bell ? '<div class="wd-sys">🔔 작은 방울이 먼저 울렸습니다 — 술래가 그쪽으로 돌아섭니다.</div>' : '') + X.clip(pg.x) + '<div class="wd-sys">발각 ' + jh().found + ' / 2</div>',
        X.btn('광장으로 돌아간다.', 'WONDER.jBack()'));
};
X.jPick = function (j) {
    const sc = F().sc;
    if (!sc || sc.id !== 'jHide' || sc.pick != null) return;
    sc.pick = j;
    if (X.isTeam()) X.gatePress(hkey(sc.r, 'h'));
    X.save(); X.view();
};
X.jPeek = function () {
    const sc = F().sc;
    const v = visitsOf(sc.r);
    if (!v || sc.peek != null || !X.spend('홍등 성냥')) return;
    sc.peek = v[Math.floor(Math.random() * 2)];
    X.save(); X.view();
};
X.jGo = function () { const sc = F().sc; sc.go = 1; X.save(); X.view(); };
X.jBell = function (k) {
    const sc = F().sc;
    if (sc.bellAsk) return;
    sc.bellAsk = 1;
    if (k && X.spend('작은 방울')) sc.bell = 1;
    X.save(); X.view();
};
X.jBack = function () {
    const sc = F().sc;
    sc.back = 1;
    if (X.isTeam()) X.gatePress(hkey(sc.r, 'b'));
    X.save(); X.view();
};
function nextRound(r) {
    if (r < 3) return X.go({ id: 'jHide', r: r + 1 });
    X.THEN.jE9();
}

// ==========================================
// 12 — 이번엔 내가 숨을게 (세 번 안에)
// ==========================================
X.VIEW.jSeek = function () {
    const f = F();
    const q = f.jSeek || (f.jSeek = { spot: Math.floor(Math.random() * 5), tries: 0, done: 0, last: null });
    const sc = X.scene('j_new', 4);
    const opts = sc.p[1].o || [];
    const ps = paras(sc.p[2].x);
    const iW = ps.findIndex(function (p) { return /^<b>틀린 곳<\/b>/.test(p); });
    const iF = ps.findIndex(function (p) { return /^<b>찾았다<\/b>/.test(p); });
    const wrong = ps.slice(iW + 1, iF).join('<br><br>');
    const found = ps.slice(iF + 1).join('<br><br>');
    if (q.done) {
        X.draw('—', (q.self ? '참다 못한 술래가 스스로 나옵니다.<br><br>' : '') + found, X.btn('계속 간다.', 'WONDER.jSeekEnd()'));
        return;
    }
    let x = X.clip(sc.p[1].x);
    if (q.last != null) x = wrong + '<div class="wd-sys">남은 기회 ' + (3 - q.tries) + ' / 3</div>';
    X.draw('—', x, opts.map(function (o, j) { return (q.tried || []).indexOf(j) >= 0 ? '' : X.btn(X.clip(o.l), 'WONDER.jSeekPick(' + j + ')'); }).join(''));
};
X.jSeekPick = function (j) {
    const q = F().jSeek;
    if (!q || q.done) return;
    q.tried = (q.tried || []).concat([j]);
    if (j === q.spot) { q.done = 1; }
    else { q.tries++; q.last = j; if (q.tries >= 3) { q.done = 1; q.self = 1; } }
    X.save(); X.view();
};
X.jSeekEnd = function () { X.THEN.jN13(); };

console.log('[이상한 나라] 강시 (몽환) 연결');
})();
