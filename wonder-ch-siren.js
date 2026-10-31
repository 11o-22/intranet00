// ==========================================
// ★ 「이상한 나라의 ■■■」 — 세이렌 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음 (wonder-text-siren.js 뒤)
// ==========================================
//
//   원고: 사용자 원고 01~07 (s_intro · s_isle · s_who · s_pal, 「거짓말쟁이 문제」 12종 = s_puz)
//         + 새 장면 08~16 (s_new, 「세이렌의 장 · 몽환 — 원고」 문서)
//
//   01 바다가 노래하는 곳 → 02 엉망진창 티타임(물어보는 자리) → 03 사라진 진주(물어보는 자리)
//   → 산호섬 넷(티타임 섬을 가운데 두고 자유롭게 오감, 판마다 문제 12종 중 하나, 증언은 그 문제의 것)
//   → 네 섬을 일행 전체로 한 번씩 들으면 「(특수) 범인을 찾는다」, 모두 골라야 넘어감
//   → 05 다시 열린 티타임: 지목은 사람마다 — 틀리면 BAD ENDING 「진주는 어디에?」(죽음)
//      (티타임 각설탕이 있으면 한 번 없던 일로) / 맞히면 정답 「오늘의 주인공」
//   → 06 · 07 → 08~15 → 16 부탁 → 바닥이 없는 방으로 → 물고기가 인간이 되었다 연계판
//
//   「오늘의 주인공」 = 그 판 문제의 범인. 08 이후 그 인어의 대사는 닫힌 조개 안에서 들린다
//   (원고 구성 · 08 머리말 규칙). 원고가 따로 적은 (주인공이 ○○일 때) 문단은 그 경우에만 바꿔 넣는다.
//
//   「첫 탐사일 경우 … 모두 확인한 이후 활성 / 2회차는 즉시 활성」 — 05에 처음 닿은 뒤로는 즉시 활성.

(function wonderSiren() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'siren';
const NAMES = ['산호', '소라', '윤슬', '파랑'];
const LET = ['A', 'B', 'C', 'D'];

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function norm(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s*\([^)]*\)\s*$/, '').trim(); }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function sx() { return ((S().sx || {})[rk()]) || {}; }

// ==========================================
// 이 판의 문제 · 주인공
// ==========================================
function puzzles() { return (window.WONDER_MD || {}).s_puz || []; }
function puz() { const k = sx().puz; return (k == null) ? null : puzzles()[k]; }
function protIdx() { const p = puz(); return p ? LET.indexOf(p.c) : -1; }
function prot() { const i = protIdx(); return i >= 0 ? NAMES[i] : null; }
const SX = X.SIREN = X.SIREN || {};
SX.prot = prot; SX.puz = puz; SX.NAMES = NAMES; SX.LET = LET;

// 받침에 맞춘 조사
function bat(w) { const c = String(w).charCodeAt(String(w).length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; }
function josa(w, a, b) { return bat(w) ? a : b; }
SX.josa = josa;
// 이름 바꾸기 — 「윤슬이가」 같은 부르는 말까지
function rename(t, from, to) {
    return String(t).replace(new RegExp(from + '(이)?(가|는|를|와|에게|한테|의|도|만|은|을|과|이)?(?![가-힣])', 'g'), function (all, i, p) {
        if (!p && !i) return to;
        const P = p || (i ? '' : '');
        const map = { '가': ['이', '가'], '이': ['이', '가'], '는': ['은', '는'], '은': ['은', '는'], '를': ['을', '를'], '을': ['을', '를'], '와': ['과', '와'], '과': ['과', '와'] };
        if (map[P]) return to + (bat(to) ? map[P][0] : map[P][1]);
        return to + P;
    });
}
SX.rename = rename;

// 주인공의 대사는 닫힌 조개 안에서 — 그 인어로 시작하는 지문 문단을 바꾼다
function clamRule(x) {
    const p = prot();
    if (!p) return x;
    const re = new RegExp('^' + p + '(이|가|은|는)\\s');
    return paras(x).map(function (q) {
        if (re.test(q) && !/^“/.test(q)) return '조개껍데기 안에서 ' + p + '의 목소리가 들립니다.';
        return q;
    }).join('<br><br>');
}
SX.clamRule = clamRule;
// (주인공이 ○○일 때) 문단 — 해당할 때 메모를 지우고 남기고, 아니면 지운다
function variant(x, who) {
    return paras(x).filter(function (q) {
        const m = q.match(/^<i>\(주인공이 (\S+)일 때\)<\/i>/);
        return !m || who === m[1];
    }).map(function (q) { return q.replace(/^<i>\(주인공이 \S+일 때\)<\/i>\s*/, ''); }).join('<br><br>');
}

// 처음인가 — 05에 한 번 닿으면 다음부터는 물어보는 자리가 바로 열린다
function first() { const r = X.rec(); return !(r && r.sirenSeen); }
function markSeen() {
    const r = X.rec();
    if (r.sirenSeen) return;
    r.sirenSeen = 1;
    const d = db_();
    try { if (d) d.ref('users/' + ME() + '/wonder/sirenSeen').set(1); } catch (e) { }
}

// ==========================================
// 물어보는 자리 (02 · 03) — 「이전 선택지로」로 돌아오고, 「계속 간다」는 다 들어 본 뒤에
// ==========================================
function hubKey(h, opt) { return 'h' + h + ':' + norm(opt); }
function seen(h, opt) { return !!((F().s || {}).seen || {})[hubKey(h, opt)]; }
function hubFix(i, gateLabel) {
    const s = clone('s_intro', i);
    const pg = s.p[0];
    pg.o = pg.o || [];
    // 갈래 끝에 돌아오는 선택지를 붙인다
    pg.o.forEach(function (o) {
        if (!o.b || !o.b.length) return;
        const last = o.b[o.b.length - 1];
        if (!last.o || !last.o.length) last.o = [{ l: '이전 선택지로' }];
    });
    // 「계속 간다」 · 「진주를 찾아주겠다고 한다」 — 다른 선택지를 다 들은 뒤에 (처음일 때)
    const others = pg.o.filter(function (o) { return o.b && o.b.length; });
    const done = others.every(function (o) { return seen(i, o.l); });
    pg.o = pg.o.filter(function (o) {
        const gated = /첫 탐사일 경우/.test(o.l);
        return !gated || !first() || done;
    }).map(function (o) { return { l: o.l.replace(/\s*\(첫 탐사일 경우[^)]*\)/, ''), b: o.b }; });
    if (first() && !done) pg.x += '<div class="wd-sys">다른 이야기를 모두 들어 보면 다음으로 넘어갈 수 있습니다.</div>';
    return s;
}
X.FIX.s02 = function () { return hubFix(2); };
X.FIX.s03 = function () {
    const s = hubFix(3);
    s.p = [s.p[0]];
    return s;
};
X.CHOOSE.s_intro = function (w, pg, i, op) {
    const f = F();
    const lab = norm(op.l);
    if (lab === '이전 선택지로') {
        f.s = f.s || {}; f.s.seen = f.s.seen || {};
        const sc = X.FIX[w.fix] ? X.FIX[w.fix]() : null;
        const hub = sc ? sc.p[w.loc[0]] : null;
        const o = hub && hub.o ? hub.o[w.loc[1]] : null;
        if (o) f.s.seen[hubKey(w.h, o.l)] = 1;
        w.loc = [w.loc[0]];
        X.save(); X.view();
        return true;
    }
    if (lab === '가까이 다가간다.' || lab === '가까이 다가간다') {
        // 「(다음 장면으로)」 — 이 장면의 마지막 쪽에서 넘긴 것으로
        const sc = X.scene('s_intro', w.h);
        w.loc = [sc.p.length - 1];
        X.save();
        X.next();
        return true;
    }
    return false;
};
// ==========================================
// 산호섬 넷
// ==========================================
function visited() { return sx().v || {}; }
function allVisited() { const v = visited(); return [0, 1, 2, 3].every(function (k) { return v[k] && Object.keys(v[k]).length; }); }
const ISLE = ['분홍 산호섬', '노란 산호섬', '푸른 산호섬', '보라색 산호섬'];
[0, 1, 2, 3].forEach(function (k) {
    X.FIX['sIsle' + k] = function () {
        const s = clone('s_isle', k + 1);
        const P = puz();
        const btn = ((F().s || {}).btn || {})[k];
        s.p.forEach(function (pg) {
            pg.x = paras(pg.x).map(function (q) {
                if (/선정된 퍼즐의 . 증언 삽입/.test(q)) {
                    const t = P ? P.s[LET[k]] : '';
                    let out = '<b>' + esc(t) + '</b>';
                    if (btn) out += '<div class="wd-sys">◈ 진주 단추가 ' + (btn === 't' ? '맑게 빛납니다 — 이 증언은 참입니다.' : '흐려집니다 — 이 증언은 거짓입니다.') + '</div>';
                    return out;
                }
                if (/^<i>채팅을 통해/.test(q)) return '<div class="wd-sys">' + q.replace(/<\/?i>/g, '') + '</div>';
                return q;
            }).join('<br><br>');
            if (/진주 단추/.test(pg.x) || !/<b>“/.test(pg.x)) return;
            if (!btn && X.has && X.has('진주 단추')) pg.o = [{ l: '진주 단추를 증언에 대어 본다. <span style="font-size:10px;color:#d4af37;">(진주 단추 — 참 · 거짓)</span>' }].concat(pg.o || []);
        });
        return s;
    };
    X.THEN['sirIsle' + k] = function () {
        X.pub('sx/' + rk() + '/v/' + k + '/' + ME(), 1);
        X.go({ id: 'sHub' });
    };
});
X.CHOOSE.s_isle = function (w, pg, i, op) {
    if (!/진주 단추를 증언에/.test(op.l)) return false;
    const k = w.h - 1;
    if (!X.spend('진주 단추')) return true;
    const f = F();
    f.s = f.s || {}; f.s.btn = f.s.btn || {};
    const P = puz();
    f.s.btn[k] = (P && P.l === LET[k]) ? 'f' : 't';
    X.save(); X.view();
    return true;
};

X.LIVE.sHub = 1;
X.VIEW.sHub = function () {
    const f = F();
    if (!puz()) { X.draw('—', '', X.waitHtml('_none', '인어들이 이야기를 고르는 중입니다…')); return; }
    const key = 'shunt_' + rk();
    if (f.wait && f.wait.key === key) {
        if (X.gateDone(key)) { f.wait = null; X.save(); return toWho(); }
        X.draw('—', '당신은 티타임이 열렸던 섬에서 일행을 기다립니다.', X.waitHtml(key));
        return;
    }
    const v = visited();
    let x;
    if (!f.s.hubSeen) {
        const pg = X.scene('s_intro', 3).p[1];
        x = X.clip(pg.x);
    } else x = '당신은 티타임이 열렸던 섬에 서 있습니다. 조개 탁자 위의 찻잔들은 여전히 반쯤 차 있고, 네 산호섬이 멀리서 저마다의 빛으로 반짝입니다.';
    const mine = ((f.s || {}).heard || {});
    x += '<div class="wd-note" style="border-color:#2a3a4a;">' + ISLE.map(function (n, k) {
        const who = Object.keys(v[k] || {});
        return (who.length ? '✔ ' : '· ') + n + ' — ' + NAMES[k] + '(' + LET[k] + ')' + (who.length && X.isTeam() ? ' <span style="color:#888;">(' + who.map(X.nameOf).map(esc).join(', ') + ')</span>' : '');
    }).join('<br>') + '</div>';
    const pg = X.scene('s_intro', 3).p[1];
    let b = (pg.o || []).slice(0, 4).map(function (o, k) { return X.btn(X.clip(o.l).replace(/\s*\([A-D]\)$/, '') + ' (' + LET[k] + ')', 'WONDER.SIREN.isle(' + k + ')'); }).join('');
    if (allVisited()) b += X.btn('<b>(특수) 범인을 찾는다.</b>', 'WONDER.SIREN.hunt()');
    else b += '<div class="wd-sys">네 산호섬에서 모두 한 번 이상 증언을 들어야 「범인을 찾는다」가 열립니다' + (X.isTeam() ? ' (일행 전체 기준)' : '') + '.</div>';
    X.draw(f.s.hubSeen ? '티타임 섬' : '—', x, b);
};
SX.isle = function (k) {
    const f = F();
    f.s.hubSeen = 1;
    X.walk('s_isle', k + 1, 'sirIsle' + k, { solo: true, fix: 'sIsle' + k, gk: 'isle_' + rk() + '_' + k + '_' + Date.now() });
};
SX.hunt = function () {
    if (!allVisited()) return;
    const f = F();
    const key = 'shunt_' + rk();
    if (!X.isTeam()) return toWho();
    X.gatePress(key);
    f.wait = { key: key };
    X.save(); X.view();
};
function toWho() {
    markSeen();
    X.walk('s_who', 'who', 'sirWho', { fix: 's05' });
}

// ==========================================
// 05 다시 열린 티타임 — 지목은 사람마다
// ==========================================
X.FIX.s05 = function () {
    const s = clone('s_who', 0);
    s.h = '다시 열린 티타임';
    s.p = s.p.slice(1);
    const f = F();
    const last = s.p[s.p.length - 1];
    if (f.s && f.s.cube) {
        last.x += '<div class="wd-sys">◈ 찻잔에 각설탕을 떨어뜨리자, 방금 한 말이 녹아 사라집니다. 다시 고를 수 있습니다.</div>';
        last.o = (last.o || []).filter(function (o, k) { return k !== f.s.cube - 1; });
    }
    return s;
};
X.CHOOSE.s_who = function (w, pg, i, op) {
    if (w.fix !== 's05') return false;
    const m = norm(op.l).match(/\(([A-D])\)/);
    if (!m) return false;
    const f = F();
    const P = puz();
    const k = LET.indexOf(m[1]);
    try { darkRun.log.push('[세이렌] 문제 ' + (P && P.no) + ' 지목 ' + NAMES[k] + ' — ' + (P && P.c === m[1] ? '정답' : '오답')); } catch (e) { }
    if (P && P.c === m[1]) {
        X.walk('s_who', 'ok', 'sirPal1', { fix: 's05ok' });
        return true;
    }
    if (!f.s.cube && X.has && X.has('티타임 각설탕') && X.spend('티타임 각설탕')) {
        f.s.cube = k + 1;
        X.save(); X.view();
        return true;
    }
    X.pub('pl/' + ME() + '/doom', true);
    X.walk('s_who', 'bad', null, { fix: 's05bad', solo: true });
    return true;
};
X.FIX.s05ok = function () { const s = clone('s_who', 2); s.h = '오늘의 주인공'; return s; };
X.FIX.s05bad = function () {
    const s = clone('s_who', 1);
    s.h = '진주는 어디에?';
    s.p[s.p.length - 1].x += '<br><br>(즉사)';
    return s;
};
X.THEN.sirPal1 = function () { X.walk('s_pal', 1, 'sirPal2'); };
X.FIX.sPal2 = function () {
    const s = clone('s_pal', 2);
    s.p.forEach(function (pg) { (pg.o || []).forEach(function (o) { o.l = o.l.replace(/\s*\([^)]*이어짐\)/, ''); }); });
    return s;
};
X.THEN.sirPal2 = function () { X.walk('s_pal', 2, 'sirNew', { fix: 'sPal2' }); };
X.THEN.sirNew = function () { seqGo(0); };

// ==========================================
// 08~16 — 주인공 문단 바꾸기
// ==========================================
function fixNew(i) {
    const s = clone('s_new', i);
    const p = prot();
    s.p.forEach(function (pg) {
        pg.x = clamRule(variantFix(i, pg.x, p));
        (pg.o || []).forEach(function (o) { (o.b || []).forEach(function (b) { b.x = clamRule(variantFix(i, b.x, p)); }); });
    });
    return s;
}
function variantFix(i, x, p) {
    if (!/주인공이 \S+일 때/.test(x)) return x;
    let ps = paras(x);
    if (i === 6 && p === '산호') {
        // 11 — 세는 것은 윤슬, 조개 안에서 산호가 「……열둘.」
        const k = ps.findIndex(function (q) { return q.indexOf('산호가 손가락을 접으며 셉니다') >= 0; });
        if (k >= 0) {
            ps[k] = ps[k].replace(/\s*산호가 손가락을 접으며 셉니다\./, '');
            ps.splice(k + 1, 3);
        }
    }
    if (i === 8 && p === '산호') {
        // 12 「센다」 — 같이 세는 것은 소라
        ps = ps.filter(function (q) { return !/^“어\? 백 셋은/.test(q) && !/^다시 세어도 백 둘/.test(q); })
            .map(function (q) { return q.replace(/^산호가 당신 옆에/, '소라가 당신 옆에').replace(/같이 세는 것은 소라입니다\.\s*/, ''); });
    }
    if (i === 10) {
        if (p === '산호') ps = ps.map(function (q) {
            return q.replace('산호가 당신의 손을 붙잡습니다', '윤슬이 당신의 손을 붙잡습니다').replace('산호는 대답을 기다리지 않고', '윤슬은 대답을 기다리지 않고').replace('산호는 늘 하나를 두 번 세요', '윤슬은 늘 하나를 두 번 세요');
        });
        if (p === '파랑') ps = ps.map(function (q) {
            return /^“열 개예요\.” 파랑이/.test(q) ? '“열 개야. 두 번 세지 마.” 소라가 당신의 손가락을 다시 천천히 세어 줍니다.' : q;
        });
        ps = ps.filter(function (q) { return !/^<i>\(주인공이/.test(q); });
        return ps.join('<br><br>');
    }
    return variant(ps.join('<br><br>'), p);
}
[3, 4, 5, 6, 8, 9, 10, 11].forEach(function (i) { X.FIX['sn' + i] = function () { return fixNew(i); }; });
X.FIX.sn12 = function () {
    const s = fixNew(12);
    s.p[0].x = paras(s.p[0].x).filter(function (q) { return !/^<i>미션은/.test(q); }).join('<br><br>');
    return s;
};
const SEQ = [3, 4, 5, 6, 8, 9, 10, 11, 12];
function seqGo(i) {
    const f = F();
    f.sseq = i;
    if (i >= SEQ.length) return X.toMission();
    X.walk('s_new', SEQ[i], 'sirSeq', { fix: 'sn' + SEQ[i] });
}
X.THEN.sirSeq = function () { seqGo((F().sseq || 0) + 1); };

// ==========================================
// 부탁 · 동행 인어
// ==========================================
const REQ = { S1: '산호', S2: '소라', S3: '윤슬', S4: '파랑', T1: '세이렌', T2: '소라', T3: '세이렌', T4: '세이렌', T5: '윤슬', T6: '소라', T7: '세이렌', T8: '세이렌' };
function companion(mid) {
    const r = REQ[mid] || '세이렌';
    const p = prot();
    if (r === '세이렌' || r === p) return p === '파랑' ? '윤슬' : '파랑';
    return r;
}
SX.REQ = REQ; SX.companion = companion;
X.FIX.sMis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('s_new', team ? 14 : 13);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    let ps = paras(pg.x);
    ps.shift();
    const req = REQ[id];
    const p = prot();
    if (req === p) {
        // 부탁하는 인어가 주인공 — 닫힌 조개 안에서, 다른 인어가 그대로 전한다
        const re = new RegExp('^' + p + '(이|가|은|는)\\s');
        let done = false;
        ps = ps.map(function (q) {
            if (!done && re.test(q)) { done = true; return '조개껍데기 안에서 ' + p + '의 목소리가 들립니다. ' + companion(id) + josa(companion(id), '이', '가') + ' 그 말을 그대로 전합니다.'; }
            return q;
        });
    }
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};
X.FIX.sDown = function () {
    const s = clone('s_new', 15);
    s.h = '바닥이 없는 방으로';
    const id = (F() && F().mis) || 'S1';
    const n = X.actives().length;
    const comp = companion(id);
    s.p[0].x = paras(s.p[0].x).filter(function (q) {
        if (/^<i>\(혼자 · 둘\)/.test(q)) return n <= 2;
        if (/^<i>\(셋 · 넷\)/.test(q)) return n >= 3;
        return true;
    }).map(function (q) {
        q = q.replace(/^<i>\([^)]*\)<\/i>\s*/, '').replace(/\s*<i>\([^)]*\)<\/i>/g, '');
        return q.replace('부탁한 인어가 첨벙', comp + josa(comp, '이', '가') + ' 첨벙');
    }).join('<br><br>');
    return s;
};

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.s = { seen: {}, heard: {} };
        f.sseq = 0;
        // 이 판의 문제 — 파티장(혼자면 나)이 고른다
        if (X.leader() === ME() || !X.isTeam()) {
            const k = Math.floor(Math.random() * Math.max(1, puzzles().length));
            X.tx('sx/' + rk() + '/puz', function (cur) { return cur == null ? k : cur; });
        }
        X.save();
        X.walk('s_intro', 1, 'sir02');
    },
    mission: function () { X.walk('s_new', 'mis', 'sirDown', { fix: 'sMis' }); }
};
X.THEN.sir02 = function () { X.walk('s_intro', 2, 'sir03', { fix: 's02' }); };
X.THEN.sir03 = function () { X.walk('s_intro', 3, 'sirHub', { fix: 's03' }); };
X.THEN.sirHub = function () { X.go({ id: 'sHub' }); };
X.THEN.sirDown = function () { X.walk('s_new', 'down', 'sirLink', { fix: 'sDown' }); };
X.THEN.sirLink = function () { X.go({ id: 'link' }); };

console.log('[이상한 나라] 세이렌 (몽환) 연결');
})();
