// ==========================================
// ★ 「이상한 나라의 ■■■」 — 뱀파이어 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음 (wonder-text-vampire.js 뒤)
// ==========================================
//
//   원고: 사용자 원고 01~11 (v_intro · v_vote · v_end) + 새 장면 12~19 (v_new, 「뱀파이어의 장 · 몽환 — 원고」 문서)
//   01 문 너머의 저택 → 03 달빛 아래의 초대 → 04 가장 공평한 환대
//   → 희생 투표 세 번 (05 · 06 · 07 — 익명, 자기 자신도 가능, 동률은 무작위, 혼자면 자동 선정)
//      선정자만 「피를 바치는 의식」 d30 16+ (장비 없음 — 장미 반창고 +5) — 15 이하 「지나친 성의」(죽음)
//   → 11 가장 귀한 손님 → 12~18 → 19 부탁(미션) → 커튼 너머의 문 → 피날레 연계판 (wonder-link-vampire.js)
//
//   조건 문단(원고의 *(…)* 메모)은 여기서 고친다:
//     12  「선정되어 살아남은 탐사자가 있을 때」 · 「「지나친 성의」로 죽은 탐사자가 있을 때」 — 메모부터 다음 메모까지가 한 덩어리
//     17  앙코르는 세 번까지 — 세 번째에 집사가 피아노 뚜껑에 손을 얹는다
//     19  미션 안내 메모 — 지운다

(function wonderVampire() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'vampire';

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
const V = X.VAMP = X.VAMP || {};

// 메모 덩어리 — *(조건)* 문단부터 다음 *(조건)* 문단 앞까지가 한 덩어리. 메모 없는 앞부분은 늘 보인다.
function blocks(x, show) {
    let on = true;
    const out = [];
    paras(x).forEach(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>\s*/);
        if (m) { on = !!show(m[1]); p = p.slice(m[0].length); }
        if (on && p) out.push(p);
    });
    return out.join('<br><br>');
}
V.blocks = blocks;

// ==========================================
// 고친 장면
// ==========================================
X.FIX.v01 = function () {
    const s = clone('v_intro', 1);
    try {
        const b = s.p[0].o[1].b;
        b[1].x = paras(b[1].x).filter(function (p) { return p.indexOf('(여기서부터 사망 판정)') < 0; }).join('<br><br>');
    } catch (e) { }
    return s;
};
// 01 — 「역시 문을 넘는다」는 위쪽 「문을 넘는다」
X.CHOOSE.v_intro = function (w, pg, i, op) {
    if (/역시 문을 넘는다/.test(op.l)) { w.loc = [0]; X.save(); X.pick(0); return true; }
    return false;
};
function vs() { return ((S().vs || {})[rk()]) || {}; }
X.FIX.v12 = function () {
    const s = clone('v_new', 3);
    const st = vs();
    const live = Object.keys(st).some(function (c) { return st[c] === 'live'; });
    const dead = Object.keys(st).some(function (c) { return st[c] === 'dead'; });
    const x = blocks(s.p[1].x, function (n) { return (/살아남은/.test(n) && live) || (/지나친 성의/.test(n) && dead); });
    if (x) s.p[1].x = x; else s.p = [s.p[0]];
    return s;
};
X.FIX.v17 = function () {
    const s = clone('v_new', 9);
    const n = (F() && F().enc) || 0;
    if (n > 0) {
        s.p[0].x = '주인님의 얼굴이 환하게 밝아집니다. 대답도 하지 않고 처음부터 다시 치기 시작합니다. 같은 곡입니다. 끝나자 또 당신을 돌아봅니다.'
            + '<div class="wd-sys">앙코르 ' + n + ' / 3</div>';
    }
    return s;
};
X.CHOOSE.v_new = function (w, pg, i, op) {
    if (w.fix === 'v17' && /앙코르/.test(op.l) && ((F().enc || 0) < 2)) { F().enc = (F().enc || 0) + 1; X.save(); X.view(); return true; }
    return false;
};
X.FIX.v19 = function () {
    const s = clone('v_new', 11);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.v_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('v_new', team ? 13 : 12);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};

// ==========================================
// 흐름
// ==========================================
const SEQ = [['v_new', 3, 'v12'], ['v_new', 4], ['v_new', 5], ['v_new', 6], ['v_new', 8], ['v_new', 9, 'v17'], ['v_new', 10], ['v_new', 11, 'v19']];
function seqGo(i) {
    const f = F();
    f.vseq = i;
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (st[2]) X.walk(st[0], st[1], 'vSeq', { fix: st[2] });
    else X.walk(st[0], st[1], 'vSeq');
}
X.THEN.vSeq = function () { seqGo((F().vseq || 0) + 1); };
X.THEN.v03 = function () { X.walk('v_intro', 2, 'v04'); };
X.THEN.v04 = function () { X.walk('v_intro', 3, 'vVote0'); };
X.THEN.vVote0 = function () { X.go({ id: 'vvote', n: 0 }); };
X.THEN.v11 = function () { X.walk('v_end', 1, 'vSeq0'); };
X.THEN.vSeq0 = function () { seqGo(0); };
X.FIX.v14 = function () { const s = clone('v_new', 14); s.h = '커튼 너머의 문'; return s; };
X.THEN.vStairs = function () { X.walk('v_new', 14, 'vLink', { fix: 'v14' }); };
X.THEN.vLink = function () { X.go({ id: 'link' }); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.enc = 0; f.vseq = 0;
        X.walk('v_intro', 1, 'v03', { fix: 'v01' });
    },
    mission: function () { X.walk('v_new', 'mis', 'vStairs', { fix: 'v_mis' }); },
    link: function (api, mid) { X.L.run(CH, mid); }
};

// ==========================================
// 희생 투표 세 번
// ==========================================
//   함께 보는 곳  vv/{회차_챕터}/{n}/ { v:{사번:대상}, b:{사번:백지}, r:{c, ok, total} }
//                 vs/{회차_챕터}/{사번} = 'live' | 'dead'  (12의 조건 문단)
function vv(n) { return (((S().vv || {})[rk()]) || {})[n] || {}; }
function vpath(n) { return 'vv/' + rk() + '/' + n; }
function voters() { return X.actives(); }
function chosenOf(n) {
    const a = voters();
    const d = vv(n);
    if (d.r && d.r.c) return { c: d.r.c, kind: d.r.kind };
    if (a.length === 1) return { c: a[0], kind: 2 };
    const v = d.v || {};
    if (!a.every(function (c) { return v[c] != null; })) return null;
    const t = {};
    a.forEach(function (c) { t[v[c]] = (t[v[c]] || 0) + 1; });
    Object.keys(d.b || {}).forEach(function (c) { if (t[c] > 0) t[c]--; });     // 백지 투표용지 — 나에게 온 표 하나 무효
    let best = -1, top = [];
    Object.keys(t).forEach(function (c) { if (t[c] > best) { best = t[c]; top = [c]; } else if (t[c] === best) top.push(c); });
    top.sort();
    if (top.length === 1) return { c: top[0], kind: 0 };
    const r = X.srand(rk() + ':vote:' + n)();
    return { c: top[Math.floor(r * top.length)], kind: 1 };
}
function sceneText(n) {
    const s = X.scene('v_vote', 1 + n);
    return X.clip(s.p[0].x);
}
X.LIVE.vvote = 1;
X.VIEW.vvote = function (sc) {
    const f = F();
    const n = sc.n;
    const d = vv(n);
    const a = voters();
    const title = ['붉은 응접실', '초상화 복도', '마지막 초대'][n];
    const gk = 'vv_' + rk() + '_' + n;
    // 다음 문으로 — 모두 모이면
    if (f.wait && f.wait.key === gk) {
        if (X.gateDone(gk)) { f.wait = null; X.save(); return nextVote(n); }
        X.draw(title, (f.vline || ''), X.waitHtml(gk, '다음 문으로 갈 일행을 기다립니다.'));
        return;
    }
    const ch = chosenOf(n);
    // 1. 투표
    if (!ch) {
        const mine = (d.v || {})[ME()];
        if (mine == null) {
            let b = a.map(function (c) { return X.btn(esc(X.nameOf(c)) + (c === ME() ? ' <span style="font-size:10px;color:#888;">(나)</span>' : ''), "WONDER.VAMP.vote(" + n + ",'" + c + "')"); }).join('');
            if (X.has && X.has('백지 투표용지') && !(d.b || {})[ME()]) b += X.btn('📄 백지 투표용지를 함께 넣는다. <span style="font-size:10px;color:#d4af37;">(나에게 온 표 하나 무효)</span>', 'WONDER.VAMP.blank(' + n + ')');
            X.draw(title, sceneText(n) + ((d.b || {})[ME()] ? '<div class="wd-sys">백지 투표용지를 함께 넣었습니다.</div>' : '') + '<div class="wd-sys">익명 투표 · 자기 자신에게도 투표할 수 있습니다</div>', b);
            return;
        }
        X.draw(title, sceneText(n), '<div class="wd-wait">투표했습니다.<br>' + a.map(function (c) { return ((d.v || {})[c] != null ? '✔ ' : '… ') + esc(X.nameOf(c)); }).join(' · ') + '</div>');
        return;
    }
    // 2. 결과
    if (!f.vseen || f.vseen[n] !== 1) {
        const end = X.scene('v_vote', 4);
        const res = X.scene('v_vote', 5).p[ch.kind];
        const nm = '<b>' + esc(X.nameOf(ch.c)) + '</b>';
        const rt = paras(res.x).slice(1).join('<br><br>').replace(/<b>\((최다 득표자|선정된 탐사자) 닉네임\)<\/b>/g, nm);
        X.draw('결과', (a.length > 1 ? X.clip(end.p[0].x) + '<br><br>' : '') + rt, X.btn(ch.c === ME() ? '문 앞으로 나간다.' : '계속 간다.', 'WONDER.VAMP.seen(' + n + ')'));
        return;
    }
    // 3. 선정자 — 피를 바치는 의식
    if (ch.c === ME()) {
        const rite = X.scene('v_vote', 6);
        if (!d.r || d.r.c !== ME() || d.r.ok == null) {
            const x = paras(rite.p[0].x).slice(1).filter(function (p) { return !/주사위 판정/.test(p); }).join('<br><br>');
            let b = X.btn('손을 내민다.', 'WONDER.VAMP.rite(' + n + ',0)');
            if (X.has && X.has('장미 반창고')) b += X.btn('🌹 장미 반창고를 붙이고 손을 내민다. <span style="font-size:10px;color:#d4af37;">(+5)</span>', 'WONDER.VAMP.rite(' + n + ',1)');
            X.draw('피를 바치는 의식', X.clip(x) + '<div class="wd-sys">[주사위 판정 — 1~30 · 16 이상 생존] 장비 보정 없음</div>', b);
            return;
        }
        const ps = paras(rite.p[1].x);
        const k = ps.findIndex(function (p) { return /11-B/.test(p); });
        const okText = ps.slice(1, k).join('<br><br>');
        X.draw('충분한 성의', X.rollHtml(d.r) + okText, X.btn('문을 지난다.', 'WONDER.VAMP.go(' + n + ')'));
        return;
    }
    // 4. 나머지
    const rest = X.scene('v_vote', 7).p[0];
    const x = paras(rest.x).slice(1).join('<br><br>');
    if (!d.r || d.r.ok == null) {
        X.draw('—', X.clip(x), X.waitHtml('_none', esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '이', '가') + ' 문 앞에 서 있습니다…'));
        return;
    }
    const line = d.r.ok
        ? '딸깍. 문이 열립니다. ' + esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '이', '가') + ' 하얀 손수건으로 손목을 감싼 채 돌아옵니다.'
        : '철컥. 문이 열립니다. ' + esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '은', '는') + ' 돌아오지 않습니다. 집사가 그 자리에 대고 정중하게 허리를 숙입니다.';
    f.vline = line;
    X.draw('—', X.clip(x) + '<br><br>' + line, X.btn('계속 간다.', 'WONDER.VAMP.go(' + n + ')'));
};
V.vote = function (n, c) { if ((vv(n).v || {})[ME()] == null) X.pub(vpath(n) + '/v/' + ME(), c); };
V.blank = function (n) {
    if ((vv(n).b || {})[ME()] || !X.spend('백지 투표용지')) return;
    X.pub(vpath(n) + '/b/' + ME(), true);
};
V.seen = function (n) { const f = F(); f.vseen = f.vseen || {}; f.vseen[n] = 1; X.save(); X.view(); };
V.rite = function (n, band) {
    const d = vv(n);
    if (d.r && d.r.ok != null) return;
    const ch = chosenOf(n);
    if (!ch || ch.c !== ME()) return;
    let bonus = 0;
    if (band && X.spend('장미 반창고')) bonus = 5;
    const r = X.roll(bonus);
    try { darkRun.log.push('[뱀파이어] 피를 바치는 의식 ' + (n + 1) + ' — ' + r.total + (r.ok ? ' 충분한 성의' : ' 지나친 성의')); } catch (e) { }
    X.pub(vpath(n) + '/r', { c: ME(), kind: ch.kind, ok: r.ok, raw: r.raw, bonus: r.bonus, total: r.total });
    X.pub('vs/' + rk() + '/' + ME(), r.ok ? 'live' : 'dead');
    if (!r.ok) {
        const ps = paras(X.scene('v_vote', 6).p[1].x);
        const k = ps.findIndex(function (p) { return /11-B/.test(p); });
        const bad = ps.slice(k + 1).join('<br><br>');
        setTimeout(function () { X.die(X.rollHtml(r) + bad); }, 300);
        return;
    }
};
V.go = function (n) {
    const f = F();
    const gk = 'vv_' + rk() + '_' + n;
    if (!X.isTeam()) return nextVote(n);
    X.gatePress(gk);
    f.wait = { key: gk };
    X.save(); X.view();
};
function nextVote(n) {
    const f = F();
    f.wait = null; f.vline = '';
    if (n < 2) return X.go({ id: 'vvote', n: n + 1 });
    X.walk('v_end', 1, 'vSeq0');
}

console.log('[이상한 나라] 뱀파이어 (몽환) 연결');
})();
