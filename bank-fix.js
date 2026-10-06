// ==========================================
// ★ 은행 — 출금한 돈이 안 들어오는 것
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 어긋나 있었나
//
//   출금은 두 걸음이다. (bank.js:220)
//
//       1. bank/<사번>/deposit 에서 금액을 뺀다   ← 트랜잭션
//       2. changePoints(금액) 으로 포인트를 올린다 ← 따로
//
//   두 걸음이 따로라 **첫 걸음만 되고 둘째 걸음이 안 되면 돈이 사라진다.**
//   그리고 둘째 걸음은 조용히 실패할 수 있다.
//
//       changePoints → currentUser.points = Math.min(POINT_CAP, …)
//
//   포인트 상한(index.html)에 걸리면 **더해지지 않는데, 예금은 이미 줄었다.**
//   알림도 없다. 상한 가까이 모아 둔 사원은 출금할수록 돈이 녹았다.
//   (지연 60ms 로 돌려 본 결과 — 예금 50만 → 49만, 포인트는 상한에 멈춤)
//
//   또 changePoints 는 「내 화면 값 + 금액」을 밀어 넣는 쪽이라, 다른 기기나
//   관리자 화면이 같은 사번을 보고 있으면 어느 쪽이 이기는지가 때에 달렸다.
//
// ■ 어떻게 바꾸나
//
//   순서를 뒤집고, 안 들어간 몫은 되돌린다.
//
//       1. 상한에 얼마나 들어갈 수 있는지 **먼저** 서버에 물어본다
//       2. 예금에서 뺀다
//       3. 서버 포인트에 트랜잭션으로 더한다 — 실제로 더해진 몫을 받아 온다
//       4. 다 못 들어갔으면 그 몫을 **예금에 되돌린다**
//
//   포인트는 내 화면 값을 밀어 넣지 않고 서버 값에 더한다. 그래서 그 사이에
//   누가 돈을 넣어 주었든 둘 다 살아남는다. 내 화면은 save-merge.js 가
//   서버에서 받아 내려 준다.
//
//   입금도 같은 병이 있었다 — 포인트가 모자라면 0 으로 깎이는데 예금은 이미
//   늘어 있었다. 같은 방식으로 되돌린다.
//
// ■ 확인
//
//   bankLog()      최근 입·출금이 실제로 어떻게 움직였나
//   bankCheck()    연결 상태와 지금 내 상한 여유

(function bankFix() {

const LOG = [];
const KEEP = 30;

function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : Infinity; }
function path(c) { return 'bank/' + c; }
function note(row) { LOG.unshift(row); if (LOG.length > KEEP) LOG.pop(); }

// 예금을 움직인다. 되돌릴 때도 이것을 쓴다.
function moveDeposit(c, delta, needRoom) {
    return database.ref(path(c)).transaction(function (b) {
        if (!b) return;
        const dep = Number(b.deposit) || 0;
        if (delta < 0 && dep < -delta) return;                  // 잔액이 모자라다
        if (delta > 0 && needRoom) {
            const room = (typeof bankCap === 'function' ? bankCap(b) : Infinity) - dep;
            if (room <= 0) return;
            b.deposit = dep + Math.min(room, delta);
            b.lastOp = Math.min(room, delta);
            return b;
        }
        b.deposit = dep + delta;
        b.lastOp = Math.abs(delta);
        return b;
    }, null, false);
}

// 서버 포인트에 더한다(또는 뺀다). **실제로 움직인 몫**을 돌려준다.
function movePoints(c, delta) {
    let moved = 0;
    return database.ref('users/' + c + '/points').transaction(function (p) {
        const now = Number(p) || 0;
        const next = Math.max(0, Math.min(cap(), now + delta));
        moved = next - now;
        return next;
    }, null, false).then(function (res) {
        if (!res || !res.committed) return 0;
        return moved;
    }).catch(function (e) {
        console.error('[은행] 포인트 쓰기 실패:', e);
        return null;                                            // 아예 못 썼다
    });
}

function ui() {
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    try {
        const panel = document.getElementById('tab-vip');
        if (panel && panel.classList.contains('active') && typeof renderBank === 'function') renderBank();
    } catch (e) { }
}

// 서버에는 들어갔는데 화면 숫자가 늦게 따라오는 일이 있다. (save-merge.js 가
// users/<사번> 을 지켜보다 내려 준다) 몇 번 더 그려 준다. currentUser 를
// 직접 건드리지는 않는다 — 아직 안 날아간 내 변화를 지울 수 있으므로.
function nudge() { [600, 1600, 3000].forEach(function (ms) { setTimeout(ui, ms); }); }

// ==========================================
// 출금
// ==========================================
function withdraw() {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    if (typeof bankState === 'undefined' || !bankState) {
        showCustomAlert('계좌 정보를 불러오는 중입니다.'); return;
    }
    if (typeof bankOverdue === 'function' && bankOverdue(bankState)) {
        showCustomAlert('연체 중에는 출금할 수 없습니다.'); return;
    }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;

    const me = currentUser.code;
    const limit = cap();

    // 1. 상한 여유를 먼저 본다
    database.ref('users/' + me + '/points').once('value').then(function (s) {
        const have = Number(s.val()) || 0;
        const room = Math.max(0, limit - have);
        if (room <= 0) {
            showCustomAlert('보유 포인트가 상한(' + limit.toLocaleString() + ' P)에 닿아 있습니다.\n\n'
                + '먼저 포인트를 쓰신 뒤에 출금해 주세요.\n예금은 그대로 있습니다.');
            note({ 때: new Date().toLocaleTimeString(), 무엇: '출금 막음', 금액: amt,
                   사유: '포인트 상한', 포인트: have, 움직임: 0 });
            return;
        }
        const take = Math.min(amt, room);

        // 2. 예금에서 뺀다
        return moveDeposit(me, -take, false).then(function (res) {
            if (!res || !res.committed) {
                showCustomAlert('예금 잔액이 부족합니다.');
                note({ 때: new Date().toLocaleTimeString(), 무엇: '출금 막음', 금액: amt,
                       사유: '예금 부족', 포인트: have, 움직임: 0 });
                return;
            }

            // 3. 포인트에 더한다
            return movePoints(me, take).then(function (moved) {
                if (moved === null || moved < take) {
                    // 4. 안 들어간 몫을 예금에 되돌린다
                    const back = take - (moved || 0);
                    return moveDeposit(me, back, false).then(function () {
                        if (moved) {
                            if (typeof addHistoryLog === 'function')
                                addHistoryLog(currentUser, '[은행 출금] ' + moved.toLocaleString() + ' P');
                            if (typeof saveFields === 'function') saveFields({ history: 1 });
                        }
                        showCustomAlert(moved
                            ? (moved.toLocaleString() + ' P만 출금되었습니다.\n\n'
                               + '포인트 상한에 걸려 ' + back.toLocaleString() + ' P는 예금에 그대로 두었습니다.')
                            : '출금하지 못했습니다.\n\n예금은 그대로 돌려 두었습니다.\n잠시 뒤에 다시 시도해 주세요.');
                        note({ 때: new Date().toLocaleTimeString(), 무엇: '출금 일부', 금액: amt,
                               사유: moved === null ? '포인트 쓰기 실패' : '포인트 상한',
                               포인트: have, 움직임: moved || 0, 되돌림: back });
                        ui(); nudge();
                    });
                }

                if (typeof addHistoryLog === 'function')
                    addHistoryLog(currentUser, '[은행 출금] ' + take.toLocaleString() + ' P');
                if (typeof saveFields === 'function') saveFields({ history: 1 });
                if (typeof showPointGainEffect === 'function') showPointGainEffect(take);
                if (take < amt) {
                    showCustomAlert(take.toLocaleString() + ' P를 출금했습니다.\n\n'
                        + '포인트 상한까지 ' + take.toLocaleString() + ' P만 들어갈 수 있었습니다.');
                }
                note({ 때: new Date().toLocaleTimeString(), 무엇: '출금', 금액: amt,
                       사유: '', 포인트: have, 움직임: take, 되돌림: 0 });
                ui(); nudge();
            });
        });
    }).catch(function (e) {
        console.error('[은행] 출금:', e);
        showCustomAlert('출금 중에 문제가 있었습니다. 예금과 포인트를 확인해 주세요.');
    });
}

// ==========================================
// 입금
// ==========================================
function deposit() {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    if (typeof bankState === 'undefined' || !bankState) {
        showCustomAlert('계좌 정보를 불러오는 중입니다.'); return;
    }
    if (typeof bankBlack === 'function' && bankBlack(bankState)) {
        showCustomAlert('거래 정지 상태입니다.\n입금할 수 없습니다.'); return;
    }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;

    const me = currentUser.code;

    // 1. 예금 한도만큼 넣는다
    moveDeposit(me, amt, true).then(function (res) {
        if (!res || !res.committed) {
            showCustomAlert('예금 한도가 가득 찼습니다.');
            note({ 때: new Date().toLocaleTimeString(), 무엇: '입금 막음', 금액: amt,
                   사유: '예금 한도', 움직임: 0 });
            return;
        }
        const put = Number((res.snapshot.val() || {}).lastOp) || amt;

        // 2. 포인트에서 뺀다 — 모자라면 그만큼만
        return movePoints(me, -put).then(function (moved) {
            const took = (moved === null) ? 0 : -moved;             // 실제로 빠진 몫
            if (took < put) {
                const back = put - took;                            // 예금에 넣었는데 못 낸 몫
                return moveDeposit(me, -back, false).then(function () {
                    if (took) {
                        if (typeof addHistoryLog === 'function')
                            addHistoryLog(currentUser, '[은행 입금] ' + took.toLocaleString() + ' P');
                        if (typeof saveFields === 'function') saveFields({ history: 1 });
                    }
                    showCustomAlert(took
                        ? (took.toLocaleString() + ' P만 넣었습니다.\n\n보유 포인트가 모자라 '
                           + back.toLocaleString() + ' P는 넣지 못했습니다.')
                        : '보유 포인트가 모자랍니다.\n\n예금은 그대로 돌려 두었습니다.');
                    note({ 때: new Date().toLocaleTimeString(), 무엇: '입금 일부', 금액: amt,
                           사유: moved === null ? '포인트 쓰기 실패' : '포인트 부족',
                           움직임: took, 되돌림: back });
                    ui(); nudge();
                });
            }

            if (typeof addHistoryLog === 'function')
                addHistoryLog(currentUser, '[은행 입금] ' + put.toLocaleString() + ' P');
            if (typeof saveFields === 'function') saveFields({ history: 1 });
            showCustomAlert(put < amt
                ? (put.toLocaleString() + ' P를 넣었습니다.\n한도 때문에 '
                   + (amt - put).toLocaleString() + ' P는 넣지 못했습니다.')
                : (put.toLocaleString() + ' P를 넣었습니다.'));
            note({ 때: new Date().toLocaleTimeString(), 무엇: '입금', 금액: amt,
                   사유: '', 움직임: put, 되돌림: 0 });
            ui(); nudge();
        });
    }).catch(function (e) {
        console.error('[은행] 입금:', e);
        showCustomAlert('입금 중에 문제가 있었습니다. 예금과 포인트를 확인해 주세요.');
    });
}

// ==========================================
// 갈아끼우기
// ==========================================
const iv = setInterval(function () {
    if (typeof database === 'undefined' || !database) return;
    if (typeof bankWithdraw !== 'function' || typeof bankReadAmt !== 'function') return;
    if (bankWithdraw._fix) { clearInterval(iv); return; }

    withdraw._fix = true;
    deposit._fix = true;
    bankWithdraw = withdraw;
    bankDeposit = deposit;
    clearInterval(iv);
    console.log('[은행] 출금·입금을 되돌릴 수 있는 방식으로 바꿨습니다. bankLog()');
}, 400);

// ==========================================
// 확인
// ==========================================
window.bankLog = function () {
    console.log('%c===== 최근 입·출금 =====', 'color:#9fd0ff; font-size:13px');
    if (!LOG.length) { console.log('  (아직 없습니다)'); return; }
    console.table(LOG);
    console.log('  움직임 = 포인트가 실제로 움직인 몫 · 되돌림 = 예금에 되돌린 몫');
};

window.bankCheck = function () {
    console.log('%c===== 은행 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  연결:', (typeof bankWithdraw === 'function' && bankWithdraw._fix) ? 'O' : '✗',
        '· 입금', (typeof bankDeposit === 'function' && bankDeposit._fix) ? 'O' : '✗');
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) return;
    const have = Number(u.points) || 0;
    console.log('  내 포인트:', have.toLocaleString(), '/ 상한', cap().toLocaleString(),
        '→ 더 받을 수 있는 몫', Math.max(0, cap() - have).toLocaleString() + ' P');
    if (typeof bankState !== 'undefined' && bankState) {
        console.log('  예금:', (Number(bankState.deposit) || 0).toLocaleString(), 'P',
            '· 한도', (typeof bankCap === 'function' ? bankCap(bankState) : 0).toLocaleString() + ' P');
    } else console.log('  계좌를 아직 못 읽었습니다.');
    if (cap() - have <= 0) console.log('  ※ 상한에 닿아 있어 지금은 출금해도 들어갈 자리가 없습니다.');

    // 화면과 서버가 어긋나 있으면 그것이 「안 들어온 것처럼 보이는」 까닭이다
    if (typeof database !== 'undefined' && database) {
        database.ref('users/' + u.code + '/points').once('value').then(function (s) {
            const srv = Number(s.val()) || 0;
            if (srv === have) { console.log('  화면과 서버가 같습니다. (' + srv.toLocaleString() + ' P)'); return; }
            console.log('%c  화면 ' + have.toLocaleString() + ' P ≠ 서버 ' + srv.toLocaleString() + ' P'
                + ' — 어긋나 있습니다.', 'color:#ff8f6b');
            console.log('    pullServer() 를 치면 서버 값으로 맞춥니다.');
        }).catch(function () { });
    }
};

console.log('[은행] bankLog() · bankCheck()');

})();
