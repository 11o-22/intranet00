// ==========================================
// ★ 아이템이 저절로 불어나는 것 — 잡아내고 막는다
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 왜 바로 「중복 제거」를 안 하나
//
//   같은 물건을 여러 개 가지는 것은 정상입니다. 하급 물약 열 개도 정상입니다.
//   그래서 겹친 것을 지우는 식으로 막으면 멀쩡한 물건까지 날립니다.
//
//   대신 「늘어난 까닭이 있는가」를 봅니다.
//   이 게임은 물건이 생길 때 거의 반드시 활동 기록(history)에 한 줄을 남깁니다.
//   상점 구매 · 어둠 보상 · 제작 · 남이 준 것 · 출산품 전부 그렇습니다.
//
//     소지품이 늘었는데 기록이 한 줄도 안 늘었다  →  수상하다
//     그것이 짧은 사이에 되풀이된다               →  거의 틀림없이 되풀이 버그
//
//   그 두 가지가 겹칠 때만 되돌립니다. 한 번뿐인 것은 적어만 두고 둡니다.
//
// ■ 쓰는 법
//
//   dupeLog()    언제 무엇이 몇 개 늘었는지 · 기록이 같이 늘었는지
//   dupeGuard(true/false)  되돌리기를 켜고 끈다 (처음엔 켜져 있습니다)
//   dupeWipe()   적어 둔 것을 지운다
//
//   dupeLog() 를 주시면 어느 자리가 범인인지 짚어 드릴 수 있습니다.

(function dupeWatch() {

const TICK = 400;          // 얼마나 자주 보나
const WINDOW = 60000;      // 「짧은 사이」의 길이
const REPEAT = 2;          // 같은 품목이 이만큼 되풀이되면 되돌린다
const KEEP = 200;          // 적어 둘 줄 수

let ON = true;             // 되돌리기
let last = null;           // 지난번 소지품 세어 본 것
let lastHist = 0;          // 지난번 기록 줄 수
const log = [];            // 적어 둔 것

function counts(arr) {
    const c = {};
    (arr || []).forEach(function (x) { c[x] = (c[x] || 0) + 1; });
    return c;
}
function histLen(u) {
    return (u && Array.isArray(u.history)) ? u.history.length : 0;
}
function note(row) {
    log.push(row);
    while (log.length > KEEP) log.shift();
}

// 같은 품목이 최근에 몇 번이나 「까닭 없이」 늘었나
function recentBlind(name, at) {
    return log.filter(function (r) {
        return r.품목 === name && !r.기록 && (at - r._t) <= WINDOW;
    }).length;
}

function tick() {
    if (!currentUser || !Array.isArray(currentUser.inventory)) return;
    const now = Date.now();
    const cur = counts(currentUser.inventory);
    const hl = histLen(currentUser);

    if (last === null) { last = cur; lastHist = hl; return; }

    const grew = [];
    Object.keys(cur).forEach(function (n) {
        const d = cur[n] - (last[n] || 0);
        if (d > 0) grew.push({ n: n, d: d });
    });

    if (grew.length) {
        const hasReason = hl > lastHist;          // 기록이 같이 늘었나
        grew.forEach(function (g) {
            const before = recentBlind(g.n, now);
            note({
                _t: now,
                때: new Date(now).toLocaleTimeString(),
                품목: g.n,
                늘어남: '+' + g.d,
                지금: cur[g.n],
                기록: hasReason,
                되돌림: false
            });

            if (!hasReason) {
                console.warn('[복사?] ' + g.n + ' +' + g.d + ' — 활동 기록이 늘지 않았습니다. (지금 ' + cur[g.n] + '개)');
            }

            // 까닭 없이 되풀이되면 되돌린다
            if (ON && !hasReason && before >= REPEAT) {
                let back = 0;
                for (let i = 0; i < g.d; i++) {
                    const at = currentUser.inventory.lastIndexOf(g.n);
                    if (at < 0) break;
                    currentUser.inventory.splice(at, 1);
                    back++;
                }
                if (back) {
                    log[log.length - 1].되돌림 = true;
                    if (typeof saveFields === 'function') { try { saveFields({ inventory: 1 }); } catch (e) { } }
                    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
                    console.warn('%c[복사 차단] ' + g.n + ' ' + back + '개를 되돌렸습니다. '
                        + '(최근 ' + (before + 1) + '번째 · 까닭 없는 증가)', 'color:#ff8a65');
                }
            }
        });
    }

    last = counts(currentUser.inventory);
    lastHist = hl;
}

setTimeout(function () { setInterval(tick, TICK); }, 4000);

// ==========================================
// 확인
// ==========================================
window.dupeLog = function (only) {
    const rows = only ? log.filter(function (r) { return !r.기록; }) : log;
    console.log('%c===== 소지품이 늘어난 기록 =====', 'color:#ff8a65; font-size:13px');
    console.log('  되돌리기:', ON ? '켜짐' : '꺼짐',
        '· 적어 둔 줄:', log.length, '· 까닭 없는 것:', log.filter(function (r) { return !r.기록; }).length);
    if (!rows.length) { console.log('  아직 없습니다. (' + Math.round(TICK) + 'ms 마다 봅니다)'); return; }
    console.table(rows.slice(-40).map(function (r) {
        return { 때: r.때, 품목: r.품목, 늘어남: r.늘어남, 지금: r.지금,
                 '활동 기록': r.기록 ? 'O' : '✗ 없음', 되돌림: r.되돌림 ? 'O' : '' };
    }));
    console.log('  「활동 기록 ✗ 없음」이 되풀이되는 품목이 범인입니다.');
    console.log('  dupeLog(true) 로 수상한 것만 봅니다.');
};

window.dupeGuard = function (v) {
    ON = (v !== false);
    console.log('[복사] 되돌리기 ' + (ON ? '켰습니다' : '껐습니다'));
};

window.dupeWipe = function () { log.length = 0; last = null; console.log('[복사] 적어 둔 것을 지웠습니다.'); };

// 지금 소지품을 품목별로 세어 본다
window.invCount = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const c = counts(u.inventory);
    const rows = Object.keys(c).map(function (n) { return { 품목: n, 개수: c[n] }; })
        .sort(function (a, b) { return b.개수 - a.개수; });
    console.log('%c===== ' + u.name + ' · 소지품 ' + (u.inventory || []).length + '칸 =====', 'color:#4fc3f7; font-size:13px');
    console.table(rows.slice(0, 40));
    const many = rows.filter(function (r) { return r.개수 >= 10; });
    if (many.length) console.warn('  10개가 넘는 품목:', many.map(function (r) { return r.품목 + ' ' + r.개수; }).join(' · '));
};

console.log('[복사] dupeLog() · dupeLog(true) · dupeGuard(false) · invCount(사번)');

})();