// ==========================================
// ★ ⏱ 접속 시간 — 사원마다 얼마나 들어와 있었나 (2026-10-19 부터 적는다)
// bundles.json 마지막 묶음, dream-bank.js 뒤
// ==========================================
//
// ■ 무엇을 세나
//
//   로그인해 있고 **화면이 켜져 있는 동안** 1분마다 1분씩 더한다.
//   창을 내려 두거나 다른 탭을 보고 있는 동안은 세지 않는다.
//   (그 동안도 「접속 중」으로는 떠 있지만, 켜 두고 자리를 비운 시간까지
//    들어가면 숫자가 부풀기 때문이다)
//
//   같은 사번을 창 둘에서 켜 두어도 1분에 1분만 센다 —
//   마지막으로 센 때(at)가 50초 안이면 다른 창이 이미 센 것으로 보고 건너뛴다.
//
//   그 전의 시간은 어디에도 적혀 있지 않았으므로 되살릴 수 없다.
//   그래서 숫자는 이 파일이 올라간 날부터 쌓인다 (사원마다 since 에 적힌다).
//
// ■ 어디에 적나
//
//       playTime/<사번> = {
//           total,                  누적 (분)
//           days: { 'YYYY-MM-DD': 분 },
//           at,                     마지막으로 센 때
//           since                   처음 센 때
//       }
//
//   users/<사번> 밖에 따로 둔다. 사원 기록은 저장 길이 여럿이라
//   (바뀐 것만 쓰기 · 병합) 거기 두면 서로 덮을 수 있다.
//   여기는 이 파일 하나만 트랜잭션으로 더한다.
//
// ■ 보는 곳
//
//   상담사 콘솔 — 「⏱ 접속 시간」 칸. 누적이 많은 차례로
//   오늘 · 최근 7일 · 누적 · 마지막 접속이 뜬다.
//
// ■ 콘솔
//   playTimeState()        나
//   playTimeState(사번)    상담사 — 남의 것

(function playTime() {

const ROOT = 'playTime';
const TICK = 60000;
const SAME = 50000;          // 이 안에 센 기록이 있으면 다른 창이 센 것
const ADMIN = 'kario0987';
const BOX = 'admin-playtime-box';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function pad(n) { return String(n).padStart(2, '0'); }
function dayKey(t) {
    const d = new Date(t);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function shown() {
    try { return document.visibilityState !== 'hidden'; } catch (e) { return true; }
}

// ==========================================
// 1. 센다
// ==========================================
let held = null, heldCode = '';          // 내 자리를 지켜본다 (트랜잭션 첫 굴림부터 진짜 값을 보게)
function hold(code) {
    const d = db_();
    if (!d || heldCode === code) return;
    if (held) { try { held.off(); } catch (e) { } }
    held = null; heldCode = code;
    if (!code) return;
    held = d.ref(ROOT + '/' + code);
    held.on('value', function () { }, function () { });
}

function tick() {
    const u = me(), d = db_();
    if (!u || !u.code || !d) { hold(''); return; }
    hold(u.code);
    if (!shown()) return;
    const now = Date.now(), day = dayKey(now);
    try {
        d.ref(ROOT + '/' + u.code).transaction(function (v) {
            v = (v && typeof v === 'object') ? v : {};
            if (v.at && Math.abs(now - Number(v.at)) < SAME) return;      // 다른 창이 이미 셌다
            v.total = (Number(v.total) || 0) + 1;
            if (!v.days || typeof v.days !== 'object') v.days = {};
            v.days[day] = (Number(v.days[day]) || 0) + 1;
            v.at = now;
            if (!v.since) v.since = now;
            return v;
        }).catch(function () { });
    } catch (e) { }
}
setInterval(tick, TICK);

// ==========================================
// 2. 보여 준다 — 상담사 콘솔
// ==========================================
function hm(min) {
    min = Math.max(0, Math.round(Number(min) || 0));
    const h = Math.floor(min / 60), m = min % 60;
    if (!h) return m + '분';
    return h + '시간' + (m ? ' ' + m + '분' : '');
}
function when(t) {
    if (!t) return '—';
    const d = new Date(Number(t));
    const today = dayKey(Date.now()) === dayKey(d.getTime());
    return (today ? '오늘 ' : (d.getMonth() + 1) + '/' + d.getDate() + ' ')
        + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function lastDays(v, n) {
    const days = (v && v.days) || {};
    let sum = 0;
    for (let i = 0; i < n; i++) sum += Number(days[dayKey(Date.now() - i * 86400000)]) || 0;
    return sum;
}

function rows(all) {
    const book = users();
    const codes = {};
    Object.keys(book).forEach(function (c) { const x = book[c]; if (x && x.name) codes[c] = 1; });
    Object.keys(all || {}).forEach(function (c) { codes[c] = 1; });
    return Object.keys(codes).map(function (c) {
        const x = book[c] || {}, v = (all || {})[c] || {};
        return { c: c, name: x.name || c, no: x.no || '', total: Number(v.total) || 0,
                 today: lastDays(v, 1), week: lastDays(v, 7), at: v.at || 0, since: v.since || 0 };
    }).sort(function (a, b) {
        return (b.total - a.total) || String(a.name).localeCompare(String(b.name), 'ko');
    });
}

function table(list) {
    const th = 'padding:6px 4px; font-size:10px; color:#8fb8c8; font-weight:normal; text-align:right; white-space:nowrap;';
    const td = 'padding:6px 4px; font-size:11px; color:#ddd; text-align:right; white-space:nowrap; border-top:1px solid rgba(255,255,255,.06);';
    const since = list.reduce(function (m, r) { return r.since && (!m || r.since < m) ? r.since : m; }, 0);
    return '<div style="font-size:10px; color:#888; margin-bottom:8px; line-height:1.6;">'
        + (since ? '기록 시작 ' + dayKey(since) + ' · ' : '')
        + '화면이 켜져 있는 동안만 셉니다. ' + list.filter(function (r) { return r.total; }).length + '명 기록됨.</div>'
        + '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse;">'
        + '<tr><th style="' + th + ' text-align:left;">사원</th><th style="' + th + '">오늘</th>'
        + '<th style="' + th + '">7일</th><th style="' + th + '">누적</th><th style="' + th + '">마지막</th></tr>'
        + list.map(function (r) {
            const dim = r.total ? '' : ' color:#666;';
            return '<tr><td style="' + td + ' text-align:left;' + dim + '">' + esc(r.name)
                + (r.no ? ' <span style="font-size:9px; color:#777;">' + esc(r.no) + '</span>' : '') + '</td>'
                + '<td style="' + td + dim + '">' + (r.today ? hm(r.today) : '—') + '</td>'
                + '<td style="' + td + dim + '">' + (r.week ? hm(r.week) : '—') + '</td>'
                + '<td style="' + td + dim + ' color:' + (r.total ? '#ffd479' : '#666') + ';">' + (r.total ? hm(r.total) : '—') + '</td>'
                + '<td style="' + td + dim + ' font-size:10px; color:#999;">' + when(r.at) + '</td></tr>';
        }).join('') + '</table></div>';
}

function load() {
    const box = document.getElementById(BOX), d = db_();
    if (!box || !d) return;
    const out = box.querySelector('#playtime-list');
    if (out) out.innerHTML = '<div style="font-size:10px; color:#888;">불러오는 중…</div>';
    d.ref(ROOT).once('value').then(function (s) {
        const o = box.querySelector('#playtime-list');
        if (o) o.innerHTML = table(rows(s.val() || {}));
    }).catch(function () {
        const o = box.querySelector('#playtime-list');
        if (o) o.innerHTML = '<div style="font-size:10px; color:#e57373;">불러오지 못했습니다.</div>';
    });
}
window.playTimeLoad = load;

function make() {
    const u = me();
    if (!u || u.code !== ADMIN) return;
    const scr = document.getElementById('admin-screen');
    if (!scr || document.getElementById(BOX)) return;
    const anchor = scr.querySelector('.action-buttons');
    const html = '<div class="admin-panel-box collapsed" id="' + BOX + '" style="border-color:#3f6f80; background-color:#0d171a;">'
        + '<h4 style="color:#bfe3ee; cursor:pointer;" data-acc="1">⏱ 접속 시간</h4>'
        + '<button class="game-btn" style="width:100%; margin:0 0 9px; padding:8px; font-size:11px;" onclick="playTimeLoad()">새로 불러오기</button>'
        + '<div id="playtime-list"></div></div>';
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
    else scr.insertAdjacentHTML('beforeend', html);
    const box = document.getElementById(BOX);
    const h = box && box.querySelector('h4');
    if (h) h.onclick = function () {
        box.classList.toggle('collapsed');
        if (!box.classList.contains('collapsed')) load();       // 펼칠 때마다 새로 읽는다
    };
}
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._playTime) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () {
            const r = _o.apply(this, arguments);
            setTimeout(make, 200);
            return r;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._playTime = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 콘솔
// ==========================================
window.playTimeState = function (who) {
    const u = me(), d = db_();
    if (!u || !d) return;
    let c = u.code;
    if (who) {
        if (u.code !== ADMIN) { console.warn('남의 것은 상담사만 볼 수 있습니다.'); return; }
        const book = users();
        c = book[who] ? who : (Object.keys(book).filter(function (k) {
            const x = book[k]; return x && (x.no === who || x.name === who);
        })[0] || '');
        if (!c) { console.warn('사원을 못 찾았습니다.'); return; }
    }
    d.ref(ROOT + '/' + c).once('value').then(function (s) {
        const v = s.val() || {};
        console.log('%c===== ⏱ ' + ((users()[c] || {}).name || c) + ' 접속 시간 =====', 'color:#8fd3e8; font-size:13px');
        console.log('  누적   :', hm(v.total), '· 오늘', hm(lastDays(v, 1)), '· 최근 7일', hm(lastDays(v, 7)));
        console.log('  마지막 :', when(v.at), '· 기록 시작', v.since ? dayKey(v.since) : '—');
    });
};

console.log('[접속 시간] 화면이 켜져 있는 동안 1분씩 적습니다 — playTimeState()');

})();
