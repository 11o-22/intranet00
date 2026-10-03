// ==========================================
// ★ 은행 예금 압수 — 상담사용
// index.html 에서 bank.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// 금고 압수(adminSeizeSafe)는 users/{사번}/safeBoxes 를 비운다.
// 은행 예금은 거기가 아니라 bank/{사번}/deposit 에 따로 있어서
// 금고를 압수해도 그대로 남는다. 그쪽도 가져올 수 있게 한다.
//
// 금고 압수와 같은 줄에 버튼이 하나 더 생긴다.
// 대상은 똑같이 체크한 사원들, 또는 사번 칸에 적은 사람이다.

(function bankSeize() {

function fmt(n) { return (n || 0).toLocaleString(); }

// ==========================================
// 압수
// ==========================================
window.adminSeizeBank = function () {
    if (typeof getAdminTargets !== 'function') { showCustomAlert('관리 화면에서만 쓸 수 있습니다.'); return; }
    if (!database) { showCustomAlert('서버에 닿지 못했습니다.'); return; }

    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    // 먼저 얼마가 있는지 읽어서 보여 준다
    Promise.all(targets.map(function (code) {
        return database.ref('bank/' + code).once('value')
            .then(function (s) { return { code: code, b: s.val() }; })
            .catch(function () { return { code: code, b: null }; });
    })).then(function (rows) {

        const has = rows.filter(function (r) { return r.b && (r.b.deposit || 0) > 0; });
        const none = rows.filter(function (r) { return !r.b || (r.b.deposit || 0) <= 0; });

        if (has.length === 0) {
            showCustomAlert('예금이 있는 사원이 없습니다.\n\n'
                + none.map(function (r) {
                    const u = db.users[r.code];
                    return (u ? u.name : r.code) + ' — ' + (r.b ? '잔액 0' : '계좌 없음');
                }).join('\n'));
            return;
        }

        const total = has.reduce(function (a, r) { return a + (r.b.deposit || 0); }, 0);
        const lines = has.map(function (r) {
            const u = db.users[r.code];
            const loan = (r.b.loan && r.b.loan.amount) ? '  (대출 ' + fmt(r.b.loan.amount) + ' P 남음)' : '';
            return '  ' + (u ? u.name : r.code) + ' — ' + fmt(r.b.deposit) + ' P' + loan;
        });

        const ok = confirm('아래 사원들의 은행 예금을 압수합니다.\n\n'
            + lines.join('\n')
            + '\n\n합계 ' + fmt(total) + ' P\n\n되돌릴 수 없습니다. 진행할까요?');
        if (!ok) return;

        // 하나씩 비운다
        //
        // 트랜잭션은 첫 판을 「이 창이 들고 있는 값」으로 돌린다.
        // 남의 계좌는 리스너가 붙어 있지 않아 그 값이 null 이고,
        // null 에서 undefined 를 돌려주면 그 자리에서 포기해 버린다.
        // 그래서 도는 동안만 리스너를 붙여 서버 값을 쥐여 준다.
        Promise.all(has.map(function (r) {
            const ref = database.ref('bank/' + r.code);
            const hold = ref.on('value', function () { });      // 값을 붙잡아 둔다

            return ref.transaction(function (b) {
                if (b === null) return null;                     // 아직 못 읽었다 — 포기 말고 한 번 더
                if (!(b.deposit > 0)) return;                    // 그 사이 비었으면 건드리지 않는다
                b.seized = (b.seized || 0) + b.deposit;          // 얼마를 가져갔는지 남겨 둔다
                b.seizedAt = Date.now();
                b.deposit = 0;
                return b;
            }).then(function (res) {
                if (res.committed) {
                    const v = res.snapshot.val() || {};
                    return { code: r.code, took: (v.seized || 0) - (r.b.seized || 0), ok: true };
                }
                // 트랜잭션이 포기했으면 읽고 바로 쓴다
                return ref.once('value').then(function (s) {
                    const b = s.val();
                    if (!b || !(b.deposit > 0)) return { code: r.code, took: 0, ok: true, empty: true };
                    const amt = b.deposit;
                    return ref.update({
                        deposit: 0,
                        seized: (b.seized || 0) + amt,
                        seizedAt: Date.now()
                    }).then(function () {
                        return { code: r.code, took: amt, ok: true };
                    });
                });
            }).catch(function (e) {
                console.error('[은행 압수] ' + r.code, e);
                return { code: r.code, took: 0, ok: false, why: (e && e.message) || String(e) };
            }).then(function (x) {
                try { ref.off('value', hold); } catch (e) { }
                return x;
            });
        })).then(function (out) {

            const done = out.filter(function (x) { return x.ok && x.took > 0; });
            const fail = out.filter(function (x) { return !x.ok; });

            // 사원 기록에 남긴다
            done.forEach(function (x) {
                const u = db.users[x.code];
                if (!u) return;
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(u, '[당국 압수] 은행 예금 ' + fmt(x.took) + ' P가 압수되었습니다.');
                }
                u._adminStamp = Date.now();
                if (typeof updateUserFields === 'function') {
                    updateUserFields(x.code, { history: u.history });
                }
            });

            if (typeof updateUI === 'function') updateUI();
            if (typeof renderBank === 'function') { try { renderBank(); } catch (e) { } }

            const got = done.reduce(function (a, x) { return a + x.took; }, 0);
            showCustomAlert(
                (done.length
                    ? '은행 예금을 압수했습니다. (합계 ' + fmt(got) + ' P)\n'
                      + done.map(function (x) {
                            const u = db.users[x.code];
                            return (u ? u.name : x.code) + ' — ' + fmt(x.took) + ' P';
                        }).join('\n')
                    : '압수된 금액이 없습니다.')
                + (none.length ? '\n\n예금 없음: ' + none.map(function (r) {
                        const u = db.users[r.code]; return u ? u.name : r.code;
                    }).join(', ') : '')
                + (fail.length ? '\n\n실패: ' + fail.map(function (x) {
                        const u = db.users[x.code];
                        return (u ? u.name : x.code) + (x.why ? ' (' + x.why + ')' : '');
                    }).join('\n') + '\n\n자세한 내용은 F12 콘솔에 찍혀 있습니다.' : '')
            );
        });
    });
};

// ==========================================
// 버튼 — 금고 압수 옆에
// ==========================================
(function mount() {
    const iv = setInterval(function () {
        if (document.getElementById('adm-seize-bank')) { clearInterval(iv); return; }
        const safeBtn = document.querySelector('button[onclick="adminSeizeSafe()"]');
        if (!safeBtn) return;

        const btn = document.createElement('button');
        btn.id = 'adm-seize-bank';
        btn.className = 'game-btn';
        btn.style.cssText = 'flex:1; background:linear-gradient(145deg, #2a4a5a, #182f3a) !important;'
            + ' border-color:#3a6a7a !important; margin:0;';
        btn.innerText = '은행 압수';
        btn.setAttribute('onclick', 'adminSeizeBank()');
        safeBtn.parentNode.insertBefore(btn, safeBtn.nextSibling);

        clearInterval(iv);
        console.log('[은행] 예금 압수 버튼 연결');
    }, 700);
})();

// ==========================================
// 확인 — 누가 얼마나 넣어 뒀는지
// ==========================================
window.bankAll = function () {
    if (!database) { console.warn('서버에 닿지 못했습니다.'); return; }
    database.ref('bank').once('value').then(function (s) {
        const all = s.val() || {};
        const rows = Object.keys(all).map(function (c) {
            const b = all[c] || {};
            const u = db.users[c];
            return {
                사원: u ? u.name : c, 사번: u ? u.no : '-',
                예금: (b.deposit || 0).toLocaleString(),
                신용: b.score || 0,
                대출: b.loan && b.loan.amount ? b.loan.amount.toLocaleString() : '-',
                거래정지: b.blacklist ? '✗' : '-',
                압수누적: b.seized ? b.seized.toLocaleString() : '-'
            };
        }).sort(function (a, b) {
            return parseInt(b.예금.replace(/,/g, '')) - parseInt(a.예금.replace(/,/g, ''));
        });
        console.log('%c===== 은행 =====', 'color:#4fc3f7; font-size:13px');
        if (rows.length) console.table(rows); else console.log('  계좌가 없습니다.');
        const tot = Object.keys(all).reduce(function (a, c) { return a + ((all[c] || {}).deposit || 0); }, 0);
        console.log('  예금 합계:', tot.toLocaleString(), 'P');
    }).catch(function (e) { console.error(e); });
};

console.log('[은행] adminSeizeBank() · bankAll()');

})();