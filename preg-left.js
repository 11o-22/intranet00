// ==========================================
// ★ 임신 — 남은 시간을 못 보던 자리
// bundles.json 마지막 묶음, preg-v2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 남은 시간은 세 군데에만 뜬다
//
//     ① 사원 정보 카드        pregnancy.js:156    「출산까지 N시간」
//     ② 사택 내 방            pregnancy2.js:472   「출산까지 N시간」
//     ③ 사택 명부             preg-roster.js:69   내가 임신시킨 사원만
//
// ■ 못 보던 까닭 넷
//
//   ㄱ. **자기 것은 ① 에서 안 뜬다.**
//
//         pregnancy.js:144
//         if (!box || !currentUser || code === currentUser.code) return;
//                                     ~~~~~~~~~~~~~~~~~~~~~~~~~
//
//       본인 카드를 열면 그 자리에서 물러난다. ③ 도 「내가 임신시킨 사원」만
//       세므로 자기는 안 나온다. 그래서 임신한 사원이 제 남은 시간을 볼 수
//       있는 곳은 ② 사택 한 군데뿐이었다.
//
//       그런데 **격리 중에는 사택 칸이 잠긴다.** (index.html:5748)
//
//         lockedTabs = ['tab-public','tab-vip','tab-shop','tab-darkness','tab-house']
//
//       상담실·선녀탕에 들어간 임신부는 볼 길이 아예 없었다.
//       격리 중에도 정보 열람은 열려 있으므로, ① 에서 자기 것도 보이게 한다.
//
//   ㄴ. 앞서 연 사원의 칸이 남아 있으면 **다음 사원 것을 안 그린다.**
//
//         pregnancy.js:145   if (document.getElementById('preg-btn-box')) return;
//
//       카드를 빨리 넘기면 (그리는 것이 60ms 뒤라) 앞 칸이 남아 있을 때가
//       있다. 그러면 그 다음 사원은 임신 칸이 통째로 안 뜬다.
//       그릴 때 앞 칸을 먼저 치운다.
//
//   ㄷ. 출산 시각(preg.due)이 비어 있으면 **「출산까지 NaN시간」**이 된다.
//       빈 칸을 아버지가 생긴 때 + 24시간으로 다시 적어 준다.
//
//   ㄹ. 시간이 다 찼으면 「출산까지 0시간」으로 떠서 고장처럼 보인다.
//       한 시간이 안 남았으면 분으로, 다 찼으면 「시간이 다 찼습니다」로 적는다.
//
// ■ 콘솔
//   pregLeft()        내 남은 시간
//   pregDueFix()      상담사 — 출산 시각이 빈 사원을 전부 고친다

(function pregLeft() {

const H = 24 * 3600000;           // 임신 기간 (preg-v2)

function pregOfSafe(u) {
    if (typeof pregOf === 'function') { try { return pregOf(u); } catch (e) { } }
    return (u && u.preg) || null;
}
function bearing(u) {
    const p = pregOfSafe(u);
    return !!(p && p.sires && p.sires.length);
}

// 출산 시각 — 비어 있으면 아버지가 생긴 때로 다시 센다
function dueOf(p) {
    const d = Number(p && p.due);
    if (isFinite(d) && d > 0) return d;
    const s = (p && p.sires && p.sires[0]) || null;
    const at = Number(s && s.at);
    return ((isFinite(at) && at > 0) ? at : Date.now()) + H;
}

function leftText(p) {
    const ms = dueOf(p) - Date.now();
    if (ms <= 0) return '시간이 다 찼습니다';
    if (ms < 3600000) return Math.max(1, Math.round(ms / 60000)) + '분 남음';
    return Math.ceil(ms / 3600000) + '시간 남음';
}
window.pregLeftText = leftText;

// ==========================================
// ㄷ. 빈 출산 시각을 다시 적는다
// ==========================================
function mend() {
    try {
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (!bearing(currentUser)) return;
        const p = currentUser.preg;
        const d = Number(p.due);
        if (isFinite(d) && d > 0) return;
        p.due = dueOf(p);
        if (typeof saveFields === 'function') saveFields({ preg: 1 });
        console.warn('[임신] 출산 시각이 비어 있어 다시 적었습니다 — '
            + new Date(p.due).toLocaleString());
    } catch (e) { console.warn('[임신] 출산 시각 손질 건너뜀:', e && e.message); }
}
setTimeout(mend, 5000);
setInterval(mend, 60000);

// ==========================================
// ㄹ. 적힌 글을 읽을 수 있게 고친다
// ==========================================
// 「출산까지 N시간」을 자료에서 다시 세어 적는다.
// NaN 도, 0 도, 20분 남았는데 1시간이라고 적히던 것도 여기서 바로잡힌다.
const DUE_TXT = /출산까지\s*(?:<b>)?\s*(?:NaN|-?\d+)\s*시간(?:\s*<\/b>)?/g;

function retime(el, u) {
    if (!el || !u || !bearing(u)) return;
    const was = el.innerHTML;
    const now = was.replace(DUE_TXT, '<b style="color:#ff8fb1;">' + leftText(u.preg) + '</b>');
    if (now !== was) el.innerHTML = now;
}

function paint() {
    try {
        const card = document.getElementById('preg-btn-box');
        if (card) {
            const c = card.dataset.forCode;
            const u = (c && typeof db !== 'undefined' && db.users) ? db.users[c] : null;
            retime(card, u);
        }
        retime(document.getElementById('my-preg-box'),
            (typeof currentUser !== 'undefined') ? currentUser : null);
    } catch (e) { console.warn('[임신] 남은 시간 고쳐 적기 건너뜀:', e && e.message); }
}

// ==========================================
// ㄱ·ㄴ. 사원 정보 카드
// ==========================================
function mineBox(code) {
    if (typeof currentUser === 'undefined' || !currentUser) return;
    if (code !== currentUser.code) return;
    if (document.getElementById('preg-btn-box')) return;
    if (!bearing(currentUser)) return;
    const box = document.getElementById('emp-detail-card-container');
    if (!box) return;

    const p = currentUser.preg;
    const names = (p.sires || []).map(function (s) { return s && s.name; }).filter(Boolean);
    box.insertAdjacentHTML('beforeend',
        '<div id="preg-btn-box">'
        + '<div style="background:rgba(255,105,180,0.08); border:1px solid #c2185b; border-radius:6px;'
        + ' padding:10px; margin-top:12px; font-size:11px; line-height:1.8;">'
        + '<b style="color:#ff8fb1;">임신 중</b> · 아버지 ' + (p.sires || []).length + '명 · '
        + leftText(p)
        + (names.length ? '<div style="font-size:10px; color:#999; margin-top:4px;">'
            + names.join(', ') + '</div>' : '')
        + '<div style="font-size:10px; color:#888; margin-top:4px;">'
        + '나오는 수는 아버지 수에 따라 정해집니다.</div>'
        + '</div></div>');
}

(function hookBtn() {
    const iv = setInterval(function () {
        if (typeof addPregBtn !== 'function') return;
        if (addPregBtn._left) { clearInterval(iv); return; }

        const _a = addPregBtn;
        addPregBtn = function (code) {
            // ㄴ. 앞 사원의 칸이 남아 있으면 치운다 — 남아 있으면 원본이 그냥 물러난다
            try {
                const old = document.getElementById('preg-btn-box');
                if (old && old.dataset.forCode !== String(code)) old.remove();
            } catch (e) { }

            const r = _a.apply(this, arguments);

            try {
                mineBox(code);                       // ㄱ. 자기 것도 보이게
                const box = document.getElementById('preg-btn-box');
                if (box) box.dataset.forCode = String(code);
                paint();                             // ㄹ. 자료에서 다시 세어 적는다
            } catch (e) { console.warn('[임신] 남은 시간 표시 건너뜀:', e && e.message); }
            return r;
        };
        addPregBtn._left = true;
        clearInterval(iv);
        console.log('[임신] 남은 시간 — 자기 것도 보이게 연결');
    }, 400);
})();

// 사택 쪽 글도 같이 고친다
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._left) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            setTimeout(function () { try { paint(); } catch (e) { } }, 120);
            return r;
        };
        renderHouse._left = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.pregLeft = function () {
    console.log('%c===== 임신 · 남은 시간 =====', 'color:#ff8fb1; font-size:13px');
    if (typeof currentUser === 'undefined' || !currentUser) { console.log('  로그인 후에 쓰세요.'); return; }
    if (!bearing(currentUser)) { console.log('  임신 중이 아닙니다.'); return; }
    const p = currentUser.preg;
    console.log('  아버지:', (p.sires || []).map(function (s) { return s && s.name; }).join(', '));
    console.log('  적힌 출산 시각:', isFinite(Number(p.due)) && p.due > 0
        ? new Date(p.due).toLocaleString() : '(비어 있음 — 아버지가 생긴 때로 셉니다)');
    console.log('  실제로 쓰는 시각:', new Date(dueOf(p)).toLocaleString());
    console.log('  남은 시간:', leftText(p));
};

window.pregDueFix = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof db === 'undefined' || !db.users) { console.warn('사원 목록을 못 읽었습니다.'); return; }
    const rows = [];
    Object.keys(db.users).forEach(function (c) {
        const u = db.users[c];
        if (!u || !bearing(u)) return;
        const d = Number(u.preg.due);
        if (isFinite(d) && d > 0) return;
        u.preg.due = dueOf(u.preg);
        rows.push({ 사원: u.name, 다시적은출산시각: new Date(u.preg.due).toLocaleString() });
        if (typeof updateUserFields === 'function') {
            try { updateUserFields(u.code, { preg: u.preg }); } catch (e) { }
        }
    });
    if (!rows.length) { console.log('출산 시각이 빈 사원이 없습니다.'); return; }
    console.log('%c✓ ' + rows.length + '명을 고쳤습니다.', 'color:#4CAF50');
    console.table(rows);
};

console.log('[임신] 남은 시간 — pregLeft() · pregDueFix()');

})();
