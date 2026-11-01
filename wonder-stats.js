// ==========================================
// ★ 「이상한 나라의 ■■■」 — 사원별 기록 (2026-11-01 사용자)
// bundles.json — wonder-dice.js 다음
// ==========================================
//
// ■ 무엇을
//
//   「이번 이벤트 맵 챕터 미션 달성률 및 입장 횟수, 시간 등을 사원별로 볼 수 있게 콘솔에」
//   「미션 달성 외에도 끝까지 가고 깬 사람(미션 달성률에 상관없이)도 알 수 있게」
//
//   상담사 통제 콘솔에 「🎃 이벤트 어둠 기록」 칸 — 사원마다
//       입장 (전체 · 그중 연계 어둠) · 오늘 입장 · 머문 시간 · 미션 성공/실패 · 달성률 · 챕터별 성공
//       회차 완주 (여섯 챕터를 끝까지 — 미션 성공 여부와 상관없이) · 지금 회차 진행 · 사망 · 마지막 입장
//   브라우저 콘솔에서도 — wonderStatsTable()
//
// ■ 어디에 남기나 — wonderStats/<사번>
//     { name, enter, link, ms, dead, ok, fail, ch:{ 챕터:{ok, fail} }, rounds, roundAt:[…], seen:{ 회차_챕터:1 }, first, last }
//   wonder-core.js 가 부른다
//     statBegin(다시 붙음, 연계)   탐사가 이 어둠으로 시작될 때 — 새로 들어온 것만 입장으로 센다
//     statEnd(쓰러짐)             탐사가 닫힐 때 — 남은 시간을 붙이고 쓰러졌으면 사망 +1
//     statCh(챕터, 결과, 열쇠)     챕터가 끝날 때 (부탁 포기 포함) — 열쇠(회차_챕터 차례)로 한 번만
//     statRound(회차 수)           여섯 챕터를 다 마쳤을 때
//   머문 시간은 들어가 있는 동안 1분마다 서버에 더한다 (창을 그냥 닫아도 그때까지는 남는다).
//
// ■ 예전 것
//   이 기록은 2026-11-01 저녁부터 쌓인다. 그 전의 입장 · 시간 · 챕터별 결과는 어디에도 남아 있지 않다.
//   다만 · 회차 완주 수는 사원 기록(users/<사번>/wonder/rounds)에 이벤트 처음부터 남아 있어 그대로 보여 준다.
//         · 지금 돌고 있는 회차에서 이미 끝낸 챕터 결과(wonder.cur.res)는 칸을 열 때 한 번 옮겨 담는다 (열쇠로 두 번 안 센다).
//         · 오늘 입장 수는 wonderUse/<사번> (하루치) 에서.

(function wonderStats() {
'use strict';
const X = window.WONDER;
if (!X) return;
const W = 'Qtrew-W-001';
const ROOT = 'wonderStats';
const ADMIN = 'kario0987';
const BOX = 'admin-wonder-stats';
const FLUSH_MS = 60000;
const KEYS = ['angel', 'siren', 'vampire', 'succubus', 'jiangshi', 'wolf'];
const CHN = { angel: '천사', siren: '세이렌', vampire: '뱀파이어', succubus: '서큐버스', jiangshi: '강시', wolf: '늑대인간' };

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function now() { return Date.now(); }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function inW() { const r = run(); return !!(r && (r.zone === W || r.wonderLink)); }

function tx(fn) {
    const u = me(), d = db_();
    if (!u || !d) return;
    try {
        d.ref(ROOT + '/' + u.code).transaction(function (c) {
            c = c || {};
            c.name = u.name || c.name || '';
            fn(c);
            return c;
        });
    } catch (e) { }
}

// ==========================================
// 남기기 — wonder-core.js 가 부른다
// ==========================================
let flushAt = 0;
function flush() {
    if (!flushAt) return;
    const t = now();
    const add = Math.max(0, Math.min(t - flushAt, 10 * 60000));      // 한 번에 10분 넘게는 안 붙인다 (기기가 잠들었다 깬 것)
    flushAt = t;
    if (add < 1000) return;
    tx(function (c) { c.ms = (Number(c.ms) || 0) + add; });
}
X.statBegin = function (resume, link) {
    const r = run();
    if (!r) return;
    if (!r.wT0) {
        r.wT0 = now();
        if (!resume) {
            tx(function (c) {
                c.enter = (Number(c.enter) || 0) + 1;
                if (link) c.link = (Number(c.link) || 0) + 1;
                if (!c.first) c.first = now();
                c.last = now();
            });
        }
    }
    if (!flushAt) flushAt = now();
};
X.statEnd = function (dead) {
    flush();
    flushAt = 0;
    if (dead) tx(function (c) { c.dead = (Number(c.dead) || 0) + 1; });
};
function addRes(c, ch, res, key) {
    c.seen = c.seen || {};
    if (key && c.seen[key]) return;
    if (key) c.seen[key] = now();
    c.ch = c.ch || {};
    const x = c.ch[ch] = c.ch[ch] || { ok: 0, fail: 0 };
    if (res === 'w' || res === 'd') { c.ok = (Number(c.ok) || 0) + 1; x.ok = (Number(x.ok) || 0) + 1; }
    else { c.fail = (Number(c.fail) || 0) + 1; x.fail = (Number(x.fail) || 0) + 1; }
}
function trimSeen(c) {
    const ks = Object.keys(c.seen || {});
    if (ks.length > 80) ks.sort(function (a, b) { return c.seen[a] - c.seen[b]; }).slice(0, ks.length - 80).forEach(function (k) { delete c.seen[k]; });
}
// 지금 회차에서 이미 끝낸 챕터들 — 기록이 생기기 전에 끝낸 것도 같이 담는다 (열쇠 = 회차_챕터 차례 · 두 번 안 센다)
function curRes() {
    try {
        const cur = me() && me().wonder && me().wonder.cur;
        if (!cur || !cur.rid || !cur.res) return [];
        const order = Array.isArray(cur.order) ? cur.order : Object.keys(cur.order || {}).map(function (k) { return cur.order[k]; });
        return Object.keys(cur.res).filter(function (ch) { return order.indexOf(ch) >= 0; })
            .map(function (ch) { return { ch: ch, res: cur.res[ch], key: cur.rid + '_' + order.indexOf(ch) }; });
    } catch (e) { return []; }
}
X.statCh = function (ch, res, key) {
    const prev = curRes();
    tx(function (c) {
        prev.forEach(function (p) { if (p.key !== key) addRes(c, p.ch, p.res, p.key); });
        addRes(c, ch, res, key);
        trimSeen(c);
    });
};
X.statRound = function (n) {
    tx(function (c) {
        c.rounds = (Number(c.rounds) || 0) + 1;
        c.roundAt = (Array.isArray(c.roundAt) ? c.roundAt : []).concat([now()]).slice(-20);
    });
};
// 들어가 있는 동안 1분마다 시간을 더한다
setInterval(function () {
    try {
        if (flushAt && inW()) flush();
        else if (flushAt && !run()) flushAt = 0;
    } catch (e) { }
}, FLUSH_MS);

// ==========================================
// 보기 — 상담사 통제 콘솔
// ==========================================
let cache = null, useCache = {}, loading = false;
function today() { try { if (typeof getTodayStr === 'function') return getTodayStr(); } catch (e) { } return new Date().toISOString().slice(0, 10); }
function hm(ms) {
    const m = Math.round((Number(ms) || 0) / 60000);
    if (m < 60) return m + '분';
    return Math.floor(m / 60) + '시간 ' + (m % 60) + '분';
}
function when(t) {
    if (!t) return '-';
    const d = new Date(Number(t));
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '.' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}
function pct(ok, fail) { const n = (ok || 0) + (fail || 0); return n ? Math.round(ok / n * 100) + '%' : '-'; }

// 지금 돌고 있는 회차에서 이미 끝낸 챕터 — 기록이 생기기 전 것도 한 번 옮겨 담는다 (열쇠로 두 번 안 센다)
function backfill(code, st) {
    const d = db_();
    const u = users()[code];
    const cur = u && u.wonder && u.wonder.cur;
    if (!d || !cur || !cur.rid || !cur.res) return;
    const order = Array.isArray(cur.order) ? cur.order : Object.keys(cur.order || {}).map(function (k) { return cur.order[k]; });
    const todo = Object.keys(cur.res).filter(function (ch) {
        const key = cur.rid + '_' + order.indexOf(ch);
        return order.indexOf(ch) >= 0 && !((st && st.seen) || {})[key];
    });
    if (!todo.length) return;
    d.ref(ROOT + '/' + code).transaction(function (c) {
        c = c || {};
        c.name = c.name || u.name || '';
        c.seen = c.seen || {};
        c.ch = c.ch || {};
        todo.forEach(function (ch) {
            const key = cur.rid + '_' + order.indexOf(ch);
            if (c.seen[key]) return;
            c.seen[key] = now();
            const ok = cur.res[ch] === 'w' || cur.res[ch] === 'd';
            const x = c.ch[ch] = c.ch[ch] || { ok: 0, fail: 0 };
            if (ok) { c.ok = (Number(c.ok) || 0) + 1; x.ok = (Number(x.ok) || 0) + 1; }
            else { c.fail = (Number(c.fail) || 0) + 1; x.fail = (Number(x.fail) || 0) + 1; }
        });
        return c;
    });
}

function load(cb) {
    const d = db_();
    if (!d || loading) return;
    loading = true;
    Promise.all([d.ref(ROOT).once('value'), d.ref('wonderUse').once('value')]).then(function (v) {
        cache = v[0].val() || {};
        useCache = v[1].val() || {};
        loading = false;
        // 기록이 생기기 전 · 지금 회차 몫을 옮겨 담는다 (상담사만)
        const u = me();
        if (u && u.code === ADMIN) {
            Object.keys(users()).forEach(function (code) { try { backfill(code, cache[code]); } catch (e) { } });
        }
        if (cb) cb();
    }).catch(function () { loading = false; if (cb) cb(); });
}

function rows() {
    const U = users();
    const codes = {};
    Object.keys(cache || {}).forEach(function (c) { codes[c] = 1; });
    Object.keys(U).forEach(function (c) { const w = U[c] && U[c].wonder; if (w && ((w.rounds || 0) > 0 || w.cur)) codes[c] = 1; });
    Object.keys(useCache || {}).forEach(function (c) { codes[c] = 1; });
    const t = today();
    return Object.keys(codes).filter(function (c) { return c !== ADMIN; }).map(function (c) {
        const s = (cache || {})[c] || {};
        const u = U[c] || {};
        const w = u.wonder || {};
        const cur = w.cur || null;
        const order = cur ? (Array.isArray(cur.order) ? cur.order : Object.keys(cur.order || {}).map(function (k) { return cur.order[k]; })) : [];
        const resNow = cur && cur.res ? Object.keys(cur.res).map(function (k) { return cur.res[k]; }) : [];
        const use = (useCache || {})[c];
        return {
            code: c, name: u.name || s.name || c, no: u.no || '',
            enter: Number(s.enter) || 0, link: Number(s.link) || 0,
            todayN: (use && use.d === t) ? (Number(use.n) || 0) : 0,
            ms: Number(s.ms) || 0, dead: Number(s.dead) || 0,
            ok: Number(s.ok) || 0, fail: Number(s.fail) || 0, ch: s.ch || {},
            rounds: Number(w.rounds) || 0,                                           // 회차 완주 — 이벤트 처음부터
            curIdx: cur ? (Number(cur.idx) || 0) : -1, curOk: resNow.filter(function (r) { return r === 'w' || r === 'd'; }).length,
            curOrder: order, last: s.last || 0, roundAt: Array.isArray(s.roundAt) ? s.roundAt : []
        };
    }).sort(function (a, b) { return (b.rounds - a.rounds) || (b.enter - a.enter) || (b.ok - a.ok) || String(a.name).localeCompare(String(b.name)); });
}

function paint() {
    const box = document.getElementById(BOX);
    if (!box) return;
    const out = box.querySelector('#wstat-list');
    if (!out) return;
    if (!cache) { out.innerHTML = '<div style="font-size:10px; color:#888;">불러오는 중…</div>'; return; }
    const rs = rows();
    const tot = rs.reduce(function (a, r) { a.enter += r.enter; a.ms += r.ms; a.ok += r.ok; a.fail += r.fail; a.done += r.rounds > 0 ? 1 : 0; a.rounds += r.rounds; return a; }, { enter: 0, ms: 0, ok: 0, fail: 0, done: 0, rounds: 0 });
    let h = '<div style="font-size:11px; color:#e6d6ff; line-height:1.8; margin-bottom:8px; padding:7px 9px; border:1px solid #4a3a66; border-radius:6px; background:rgba(201,163,240,.06);">'
        + '사원 ' + rs.length + '명 · <b style="color:#ffd76a;">회차 완주 ' + tot.done + '명</b> (모두 ' + tot.rounds + '회차)<br>'
        + '입장 ' + tot.enter + '번 · 머문 시간 ' + hm(tot.ms) + ' · 미션 ' + tot.ok + '성공 / ' + tot.fail + '실패 (달성률 ' + pct(tot.ok, tot.fail) + ')</div>'
        + '<div style="font-size:9.5px; color:#888; line-height:1.6; margin-bottom:8px;">입장 · 시간 · 미션 결과는 2026-11-01 저녁부터 쌓입니다 (그 전 것은 남아 있지 않음 — 지금 돌고 있는 회차에서 끝낸 챕터만 옮겨 담음). '
        + '회차 완주는 이벤트 처음부터의 수입니다. 완주는 미션 성공과 상관없이 여섯 챕터를 다 마친 것.</div>';
    if (!rs.length) h += '<div style="font-size:10px; color:#666;">아직 아무도 들어오지 않았습니다.</div>';
    rs.forEach(function (r) {
        const chs = KEYS.filter(function (k) { return r.ch[k]; }).map(function (k) {
            const x = r.ch[k];
            return CHN[k] + ' ' + (x.ok || 0) + '/' + ((x.ok || 0) + (x.fail || 0));
        }).join(' · ');
        h += '<div style="padding:7px 9px; margin-bottom:5px; border:1px solid ' + (r.rounds > 0 ? '#8a6d2a' : '#3a3446') + '; border-radius:6px; background:' + (r.rounds > 0 ? 'rgba(255,215,106,.06)' : 'rgba(255,255,255,.03)') + ';">'
            + '<div style="display:flex; align-items:baseline; gap:6px; flex-wrap:wrap;">'
            + '<span style="font-size:12px; color:#fff; font-weight:bold;">' + esc(r.name) + '</span>'
            + '<span style="font-size:10px; color:#777;">' + esc(r.no) + '</span>'
            + (r.rounds > 0 ? '<span style="font-size:10px; color:#ffd76a; font-weight:bold;">🏁 회차 완주 ' + r.rounds + '</span>' : '')
            + '<span style="margin-left:auto; font-size:10px; color:#888;">마지막 ' + when(r.last) + '</span></div>'
            + '<div style="font-size:10.5px; color:#cfc6dd; line-height:1.7; margin-top:3px;">'
            + '입장 <b>' + r.enter + '</b>' + (r.link ? ' (연계 ' + r.link + ')' : '') + ' · 오늘 ' + r.todayN
            + ' · 머문 시간 <b>' + hm(r.ms) + '</b>'
            + ' · 미션 <b style="color:#7fe0a0;">' + r.ok + '</b>/<b style="color:#ff8a80;">' + r.fail + '</b> 달성률 <b>' + pct(r.ok, r.fail) + '</b>'
            + (r.dead ? ' · 사망 ' + r.dead : '')
            + '<br><span style="color:#a993c6;">지금 회차 ' + (r.curIdx >= 0 ? r.curIdx + '/6 챕터 (성공 ' + r.curOk + ')' : '없음') + '</span>'
            + (chs ? '<br><span style="color:#8a8a9a;">' + chs + '</span>' : '')
            + '</div></div>';
    });
    out.innerHTML = h;
}

function make() {
    const u = me();
    if (!u || u.code !== ADMIN) return;
    const scr = document.getElementById('admin-screen');
    if (!scr || document.getElementById(BOX)) return;
    const anchor = scr.querySelector('.action-buttons');
    const html = '<div class="admin-panel-box collapsed" id="' + BOX + '" style="border-color:#6a4a9a; background-color:#120c1a;">'
        + '<h4 style="color:#e6d6ff; cursor:pointer;" data-acc="1">🎃 이벤트 어둠 기록</h4>'
        + '<button class="game-btn" style="width:100%; margin:0 0 9px; padding:8px; font-size:11px;" onclick="wonderStatsLoad()">새로 불러오기</button>'
        + '<div id="wstat-list"></div></div>';
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
    else scr.insertAdjacentHTML('beforeend', html);
    const box = document.getElementById(BOX);
    const h = box && box.querySelector('h4');
    if (h) h.onclick = function () {
        box.classList.toggle('collapsed');
        if (!box.classList.contains('collapsed')) window.wonderStatsLoad();       // 펼칠 때마다 새로 읽는다
    };
}
window.wonderStatsLoad = function () { cache = cache || null; paint(); load(function () { paint(); setTimeout(function () { load(paint); }, 1500); }); };
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._wonderStats) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () {
            const r = _o.apply(this, arguments);
            setTimeout(make, 220);
            return r;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._wonderStats = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
})();

// 브라우저 콘솔 — 표로
window.wonderStatsTable = function () {
    load(function () {
        console.log('%c===== 🎃 이벤트 어둠 기록 =====', 'color:#c9a3f0; font-size:13px');
        console.table(rows().map(function (r) {
            return { 사원: r.name + (r.no ? ' (' + r.no + ')' : ''), 회차완주: r.rounds, 입장: r.enter, 연계: r.link, 오늘: r.todayN, 시간: hm(r.ms),
                     성공: r.ok, 실패: r.fail, 달성률: pct(r.ok, r.fail), 사망: r.dead, 지금회차: r.curIdx >= 0 ? r.curIdx + '/6' : '-', 마지막: when(r.last) };
        }));
    });
};

})();
