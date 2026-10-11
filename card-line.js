// ==========================================
// ★ 사원증 한 줄 — 사원증 칸 맨 밑에 적고, 사원 열람 맨 밑에 보인다
// bundles.json 마지막 묶음, norepaint2.js 보다 뒤
// ==========================================
//
// ■ 무엇을 하나
//
//   사원증 칸(정보 열람 → 사원증) 표 맨 밑에 적는 칸이 하나 생긴다.
//   거기 적은 한 줄이 남이 내 기록 카드를 열었을 때 맨 밑에 보인다.
//
//       [오늘 날이 좋다.]
//
//   마흔 자까지. 비워 두면 아무것도 안 보인다.
//
// ■ 저장을 badge 통째로 하지 않는 까닭
//
//   닉네임·성별·포지션은 saveFields({ badge: 1 }) 로 저장된다. 그런데
//   그 길은 users/<사번>/badge 를 **객체째로** 덮는다. (index.html:9559)
//
//       updates[`users/${code}/badge`] = currentUser.badge;
//
//   특이사항(badge.notes)은 상담사가 쓰는 칸이다. 내가 한 줄을 고쳐
//   저장하는 순간 내 손에 들려 있던 **옛 notes** 가 같이 올라가서,
//   상담사가 방금 적은 것을 지울 수 있다.
//
//   그래서 한 줄은 users/<사번>/badge/line 그 칸만 따로 한 번 더 쓴다.
//   원래 저장이 badge 를 덮어도 이 쓰기가 뒤에 와서 한 줄은 남는다.
//   (펫 먹이가 users/<사번>/petFood/<이름> 를 쓰는 방식과 같다)
//
// ■ 이스케이프
//
//   열람 창은 ${notes} · ${u.badge.nickname} 을 날것으로 innerHTML 에
//   붙인다. 특이사항은 상담사만 쓰니 그동안 문제가 없었지만, 한 줄은
//   누구나 쓴다. 그래서 여기서는 esc() 를 거쳐 넣는다.
//
// ■ 콘솔
//   cardLineState()        내 한 줄과 감쌈 상태
//   cardLineSet('글')      콘솔로 적기

(function cardLine() {

const MAX = 40;
const KEY = 'line';                  // u.badge.line
const IN = 'badge-line-input';
const ROW = 'badge-line-row';        // 적는 칸
const SEE = 'badge-line-seen';       // 열람 칸 (class)

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function trim(s) {
    return String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ')
        .trim().slice(0, MAX);
}
function lineOf(u) {
    const b = (u && u.badge) || {};
    return (typeof b[KEY] === 'string') ? b[KEY] : '';
}
function bodyOf(tb) { return (tb.tBodies && tb.tBodies[0]) || tb; }

// ==========================================
// 적는 칸 — 사원증 표 맨 밑
// ==========================================
function mount() {
    const panel = document.getElementById('rec-badge');
    if (!panel || document.getElementById(ROW)) return;
    const tb = panel.querySelector('table.badge-table');
    if (!tb) return;

    const tr = document.createElement('tr');
    tr.id = ROW;
    tr.innerHTML = '<th>한 줄</th><td>'
        + '<input type="text" id="' + IN + '" class="badge-input" maxlength="' + MAX + '"'
        + ' placeholder="예: 오늘 날이 좋다.">'
        + '<div style="font-size:9px; color:#666; margin-top:4px; line-height:1.5;">'
        + '남이 내 기록 카드를 열면 맨 밑에 보입니다. ' + MAX + '자까지.</div>'
        + '</td>';
    bodyOf(tb).appendChild(tr);
    fill();
    console.log('[사원증] 한 줄 칸을 붙였습니다');
}

// 서버 값을 칸에 넣는다 — 적는 중에는 건드리지 않는다
function fill() {
    const el = document.getElementById(IN);
    const u = u_();
    if (!el || !u) return;
    if (document.activeElement === el) return;
    const v = lineOf(u);
    if (el.value !== v) el.value = v;
}

// 칸에 적힌 것을 currentUser 에 넣고, 넣은 값을 돌려준다
function pick() {
    const el = document.getElementById(IN);
    const u = u_();
    if (!el || !u) return null;
    if (!u.badge) u.badge = {};
    const v = trim(el.value);
    if (v) u.badge[KEY] = v; else delete u.badge[KEY];
    return v;
}

// 그 칸만 따로 쓴다 (위 「저장을 badge 통째로 하지 않는 까닭」)
function push(v) {
    const u = u_();
    if (!u || !u.code) return;
    if (typeof database === 'undefined' || !database) return;
    database.ref('users/' + u.code + '/badge/' + KEY).set(v || null)
        .catch(function (e) { console.warn('[사원증] 한 줄 저장 실패', e); });
}

// ==========================================
// 열람 칸 — 기록 카드 맨 밑
// ==========================================
function seen(code) {
    const u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
    const v = lineOf(u);
    if (!v) return;
    const box = document.getElementById('emp-detail-card-container');
    if (!box) return;
    const tb = box.querySelector('table.badge-table');
    if (!tb || tb.querySelector('.' + SEE)) return;

    const tr = document.createElement('tr');
    tr.className = SEE;
    tr.innerHTML = '<th>한 줄</th>'
        + '<td style="font-size:11px; word-break:break-all; line-height:1.5; color:#cfd8dc;">'
        + esc(v) + '</td>';
    bodyOf(tb).appendChild(tr);
}

// ==========================================
// 감싸기
// ==========================================
function after(name, fn, flag) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        if (window[name][flag]) { clearInterval(iv); return; }
        const _f = window[name];
        const w = function () {
            const r = _f.apply(this, arguments);
            try { fn.apply(null, arguments); } catch (e) { console.warn('[사원증]', e); }
            return r;
        };
        w[flag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
}

// 사원증 칸을 열 때마다 서버 값으로 되맞춘다
after('loadBadgeInfo', function () { mount(); fill(); }, '_line');

// 남의 기록 카드를 열었을 때
after('openEmpDetailModal', function (code) { seen(code); }, '_line');

// 「사원 정보 저장」 — 원래 저장이 badge 를 통째로 쓰므로 먼저 넣어 두고,
// 그 뒤에 그 칸만 한 번 더 쓴다
(function hookSave() {
    const iv = setInterval(function () {
        if (typeof saveBadgeInfo !== 'function') return;
        if (saveBadgeInfo._line) { clearInterval(iv); return; }
        const _s = saveBadgeInfo;
        const w = function () {
            let v = null;
            try { v = pick(); } catch (e) { }
            const out = _s.apply(this, arguments);
            try { if (v !== null) push(v); } catch (e) { }
            return out;
        };
        w._line = true;
        saveBadgeInfo = w;
        window.saveBadgeInfo = w;
        clearInterval(iv);
        console.log('[사원증] 한 줄 저장 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 칸이 없으면 붙인다 (로그인 뒤에 화면이 생기므로)
setInterval(function () { try { if (u_()) mount(); } catch (e) { } }, 1500);

// ==========================================
// 콘솔
// ==========================================
window.cardLineSet = function (s) {
    const u = u_();
    if (!u) { console.log('  로그인 전입니다.'); return; }
    if (!u.badge) u.badge = {};
    const v = trim(s);
    if (v) u.badge[KEY] = v; else delete u.badge[KEY];
    push(v);
    fill();
    console.log('  한 줄 : ' + (v || '(비움)'));
};

window.cardLineState = function () {
    const u = u_();
    console.log('%c===== 사원증 한 줄 =====', 'color:#9fd0ff; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    console.log('  내 한 줄 :', lineOf(u) || '(없음)');
    console.log('  적는 칸 :', document.getElementById(ROW) ? '있음' : '없음');
    console.log('  감쌈 :',
        (typeof saveBadgeInfo === 'function' && saveBadgeInfo._line) ? '저장 O' : '저장 ✗',
        (typeof loadBadgeInfo === 'function' && loadBadgeInfo._line) ? '· 불러오기 O' : '· 불러오기 ✗',
        (typeof openEmpDetailModal === 'function' && openEmpDetailModal._line) ? '· 열람 O' : '· 열람 ✗');
};

console.log('[사원증] cardLineState() · cardLineSet(\'글\')');

})();
