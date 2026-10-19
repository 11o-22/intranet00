// ==========================================
// 💤 꿈결 — 상담사 지급 · 은행 보관 (2026-10-19)
// bundles.json 마지막 묶음, gaduri.js 뒤
// ==========================================
//
// ■ 상담사 지급
//   통제 콘솔 「신용 점수 조정」 아래 [💤 꿈결 지급] — 고른 사원(체크 · 사번)에게 원하는 만큼.
//   빼는 수(-500)도 된다 (0 아래로는 안 내려간다).
//   users/<사번>/kroom/dream 에 트랜잭션으로 더한다 (덮어쓰지 않는다).
//
// ■ 은행 보관
//   사내 은행 「예금」 아래 「꿈결 보관」. 맡기기 · 찾기. 한 사람에 500,000 D 까지.
//   맡긴 꿈결은 K 의 방에서 쓰러져도 잃지 않는다 (쓰러짐은 손에 든 꿈결만 걷는다).
//   거래 정지(블랙리스트) 중에는 맡길 수 없다 — 찾기는 된다 (예금과 같다).
//     bank/<사번>/dream = 맡긴 꿈결
//   옮기는 길 — 빼는 쪽을 먼저(모자라면 그만둔다), 넣는 쪽은 뒤에. 넣다가 남으면 도로 돌려준다.
//
// ■ 콘솔
//   dreamBankState()

(function dreamBank() {

const ADMIN = 'kario0987';
const CAP = 500000;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function fmt(n) { return (Number(n) || 0).toLocaleString('ko-KR'); }
function num(v) { v = Math.floor(Number(v)); return isFinite(v) ? v : 0; }
function myDream() { const u = u_(); return Math.max(0, num(u && u.kroom && u.kroom.dream)); }
function banked() { try { return Math.max(0, num(bankState && bankState.dream)); } catch (e) { return 0; } }

// 손에 든 꿈결을 서버에서 빼고 더한다 — 모자라면 그만둔다 (committed=false)
function dreamTx(code, delta, floor0) {
    return db_().ref('users/' + code + '/kroom/dream').transaction(function (v) {
        const cur = Math.max(0, num(v));
        const nx = cur + delta;
        if (nx < 0) { if (floor0) return 0; return; }
        return nx;
    });
}
// 내 화면에도 바로 맞춘다 (서버 값 그대로 — 병합이 「내가 쓴 글이 돌아왔다」로 본다)
function mirror(res) {
    const u = u_();
    try {
        if (u && res && res.snapshot) {
            if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {};
            u.kroom.dream = Math.max(0, num(res.snapshot.val()));
        }
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
}
let busy = false;
function lock() { if (busy) return false; busy = true; setTimeout(function () { busy = false; }, 900); return true; }

// ==========================================
// 1. 은행 — 맡기기 · 찾기
// ==========================================
window.dreamDeposit = function () {
    const me = u_(), d = db_();
    if (!me || !d || !lock()) return;
    if (typeof bankState === 'undefined' || !bankState) { alert_('계좌 정보를 불러오는 중입니다.'); return; }
    if (typeof bankBlack === 'function' && bankBlack(bankState)) { alert_('거래 정지 상태입니다.\n꿈결을 맡길 수 없습니다.'); return; }
    const amt = (typeof bankReadAmt === 'function') ? bankReadAmt('bank-dream-amt') : num((document.getElementById('bank-dream-amt') || {}).value);
    if (!amt || amt <= 0) return;
    const room = CAP - banked();
    if (room <= 0) { alert_('꿈결 보관이 가득 찼습니다. (' + fmt(CAP) + ' D 까지)'); return; }
    const want = Math.min(room, amt);
    if (want > myDream()) { alert_('꿈결이 모자랍니다. (가진 것 ' + fmt(myDream()) + ' D)'); return; }
    // ① 손에서 뺀다
    dreamTx(me.code, -want).then(function (r1) {
        if (!r1 || !r1.committed) { alert_('꿈결이 모자랍니다.'); return; }
        mirror(r1);
        // ② 은행에 넣는다 — 그 사이 다른 창이 채웠으면 남는 것은 돌려준다
        return bankTx(bankPath(me.code), function (b) {
            b = b || {};
            const cur = Math.max(0, num(b.dream));
            const put = Math.max(0, Math.min(CAP - cur, want));
            b.dream = cur + put;
            b.lastDream = put;
            return b;
        }).then(function (r2) {
            const put = (r2 && r2.committed && r2.snapshot.val()) ? num(r2.snapshot.val().lastDream) : 0;
            const back = want - put;
            const fin = function () {
                try { addHistoryLog(me, '[은행 꿈결 보관] ' + fmt(put) + ' D'); saveFields({ history: 1 }); } catch (e) { }
                try { if (typeof renderBank === 'function') renderBank(); } catch (e) { }
                alert_(put ? (fmt(put) + ' D 를 맡겼습니다.' + (put < amt ? '\n한도 때문에 ' + fmt(amt - put) + ' D 는 맡기지 못했습니다.' : ''))
                           : '꿈결 보관이 가득 찼습니다.');
            };
            if (back > 0) return dreamTx(me.code, back).then(function (r3) { mirror(r3); fin(); });
            fin();
        });
    }).catch(function (e) { alert_('처리하지 못했습니다.\n\n' + (e && e.message)); });
};
window.dreamWithdraw = function () {
    const me = u_(), d = db_();
    if (!me || !d || !lock()) return;
    if (typeof bankState === 'undefined' || !bankState) { alert_('계좌 정보를 불러오는 중입니다.'); return; }
    const amt = (typeof bankReadAmt === 'function') ? bankReadAmt('bank-dream-amt') : num((document.getElementById('bank-dream-amt') || {}).value);
    if (!amt || amt <= 0) return;
    if (amt > banked()) { alert_('맡긴 꿈결이 모자랍니다. (맡긴 것 ' + fmt(banked()) + ' D)'); return; }
    // ① 은행에서 뺀다
    bankTx(bankPath(me.code), function (b) {
        if (!b || num(b.dream) < amt) return;
        b.dream = num(b.dream) - amt;
        return b;
    }).then(function (r1) {
        if (!r1 || !r1.committed) { alert_('맡긴 꿈결이 모자랍니다.'); return; }
        // ② 손에 넣는다
        return dreamTx(me.code, amt).then(function (r2) {
            mirror(r2);
            try { addHistoryLog(me, '[은행 꿈결 찾기] ' + fmt(amt) + ' D'); saveFields({ history: 1 }); } catch (e) { }
            try { if (typeof renderBank === 'function') renderBank(); } catch (e) { }
            alert_(fmt(amt) + ' D 를 찾았습니다.');
        });
    }).catch(function (e) { alert_('처리하지 못했습니다.\n\n' + (e && e.message)); });
};

// 은행 화면 — 「예금」 칸 바로 아래에 끼운다
function section() {
    const box = document.getElementById('bank-body');
    if (!box || !u_() || box.querySelector('#bank-dream-box')) return;
    if (typeof bankState === 'undefined' || !bankState) return;
    const dep = box.querySelector('#bank-dep-amt');
    const card = dep && dep.parentNode;
    if (!card) return;
    const black = (typeof bankBlack === 'function') && bankBlack(bankState);
    const div = document.createElement('div');
    div.id = 'bank-dream-box';
    div.style.cssText = 'background:rgba(201,168,255,0.05); border:1px solid #4a3a6a; border-radius:6px; padding:13px; margin-bottom:14px;';
    div.innerHTML = '<div style="font-size:11px; color:#c9a8ff; font-weight:bold; margin-bottom:8px;">💤 꿈결 보관</div>'
        + '<div style="font-size:18px; font-weight:bold; color:#d9c4ff;">' + fmt(banked()) + ' D</div>'
        + '<div style="font-size:10px; color:#888; margin:4px 0 11px 0; line-height:1.6;">한도 ' + fmt(CAP) + ' D · 이자 없음 · 가진 꿈결 ' + fmt(myDream()) + ' D<br>K 의 방에서 쓰러져도 잃지 않습니다.</div>'
        + '<input type="number" id="bank-dream-amt" min="1" placeholder="꿈결 (D)" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">'
        + '<div style="display:flex; gap:6px;">'
        + '<button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="dreamDeposit()"' + (black ? ' disabled' : '') + '>맡긴다</button>'
        + '<button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="dreamWithdraw()">찾는다</button></div>';
    card.parentNode.insertBefore(div, card.nextSibling);
}
(function hookBank() {
    const iv = setInterval(function () {
        if (typeof renderBank !== 'function') return;
        if (renderBank._dream) { clearInterval(iv); return; }
        const _r = renderBank;
        const w = function () {
            const r = _r.apply(this, arguments);
            try { section(); } catch (e) { console.warn('[꿈결 보관]', e); }
            return r;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._dream = true;
        renderBank = w; window.renderBank = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
setInterval(function () { try { section(); } catch (e) { } }, 1500);

// ==========================================
// 2. 상담사 — 꿈결 지급
// ==========================================
window.adminGiveDream = function () {
    const me = u_(), d = db_();
    if (!me || me.code !== ADMIN || !d) return;
    const targets = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
    if (!targets.length) { alert_('대상을 선택하거나 사번을 입력해주세요.'); return; }
    const go = function (v) {
        const n = num(String(v).replace(/[,\s]/g, ''));
        if (!n) { alert_('숫자를 입력해주세요.'); return; }
        const book = (typeof db !== 'undefined' && db.users) || {};
        let left = targets.length;
        const done = [];
        targets.forEach(function (code) {
            dreamTx(code, n, true).then(function (res) {
                const now = res && res.snapshot ? num(res.snapshot.val()) : 0;
                const t = book[code];
                done.push(((t && t.name) || code) + ' → ' + fmt(now) + ' D');
                try {
                    if (t && typeof addHistoryLog === 'function' && typeof updateUserFields === 'function') {
                        addHistoryLog(t, '[상담사] 꿈결 ' + (n > 0 ? '+' : '') + fmt(n) + ' D');
                        updateUserFields(code, { history: t.history });
                    }
                } catch (e) { }
            }).catch(function () { done.push(code + ' — 실패'); }).then(function () {
                if (--left === 0) alert_('💤 꿈결 ' + (n > 0 ? '+' : '') + fmt(n) + ' D\n\n' + done.join('\n'));
            });
        });
    };
    if (typeof openTextInput === 'function') {
        openTextInput('💤 꿈결 지급', targets.length + '명에게 줄 꿈결을 적어 주세요. (예: 5000, 빼려면 -500)<br><span style="font-size:10px; color:#888;">0 아래로는 내려가지 않습니다.</span>', '5000', go);
    } else {
        const v = window.prompt('꿈결 (D)', '5000');
        if (v) go(v);
    }
};
// 통제 콘솔 — 「신용 점수 조정」 줄 아래에 단추 줄을 하나 붙인다
setInterval(function () {
    try {
        const me = u_();
        if (!me || me.code !== ADMIN || document.getElementById('adm-dream-btn')) return;
        const credit = document.querySelector('#admin-screen button[onclick="adminAdjustCredit()"]');
        const row = credit && credit.parentNode;
        if (!row) return;
        const r = document.createElement('div');
        r.style.cssText = 'display:flex; gap:8px; margin-top:8px;';
        r.innerHTML = '<button id="adm-dream-btn" class="game-btn" style="flex:1; margin:0; padding:10px; background:linear-gradient(145deg,#7a5ab0,#4a3478) !important; border-color:#b59cf0 !important; color:#fff !important;" onclick="adminGiveDream()">💤 꿈결 지급</button>';
        row.parentNode.insertBefore(r, row.nextSibling);
    } catch (e) { }
}, 1500);

window.dreamBankState = function () {
    console.log('%c===== 💤 꿈결 — 지급 · 보관 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  가진 꿈결 :', fmt(myDream()) + ' D');
    console.log('  맡긴 꿈결 :', fmt(banked()) + ' D / ' + fmt(CAP) + ' D');
};

})();
