// ==========================================
// ★ 사내 은행
// ==========================================
const BANK_GRADES = [
    { g:1, min:850, cap:500000, rate:0.006, loan:60000, fee:0.03, label:'1등급' },
    { g:2, min:700, cap:150000, rate:0.005, loan:20000, fee:0.05, label:'2등급' },
    { g:3, min:500, cap:50000,  rate:0.004, loan:5000,  fee:0.08, label:'3등급' },
    { g:4, min:300, cap:20000,  rate:0.003, loan:1000,  fee:0.12, label:'4등급' },
    { g:5, min:0,   cap:5000,   rate:0.002, loan:0,     fee:0,    label:'5등급' }
];
const BANK_LOAN_DAYS = 3;
const BANK_DAY = 24 * 60 * 60 * 1000;

let bankState = null, bankRef = null, bankKey = null;

function bankPath(code) { return 'bank/' + code; }
function bankGrade(score) {
    return BANK_GRADES.find(x => (score || 0) >= x.min) || BANK_GRADES[BANK_GRADES.length - 1];
}
function bankCap(b) { return bankGrade(b && b.score).cap + ((b && b.capBonus) || 0); }
function bankClamp(s) { return Math.max(0, Math.min(1000, s)); }
function bankOverdue(b) { return !!(b && b.loan && Date.now() > b.loan.dueAt); }

function bankFmtLeft(ms) {
    if (ms <= 0) return '기한 지남';
    const d = Math.floor(ms / BANK_DAY);
    const h = Math.floor((ms % BANK_DAY) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return d > 0 ? `${d}일 ${h}시간` : `${h}시간 ${m}분`;
}

function bankReadAmt(id) {
    const el = document.getElementById(id);
    const v = parseInt(el && el.value, 10);
    if (isNaN(v) || v <= 0) { showCustomAlert('올바른 금액을 입력해주세요.'); return 0; }
    return v;
}

// --- 내 계좌 실시간 연결 ---
function attachBank() {
    if (!database || !currentUser) return;
    if (bankKey === currentUser.code) return;
    if (bankRef) { try { bankRef.off(); } catch (e) {} }
    bankKey = currentUser.code;
    bankState = null;
    bankRef = database.ref(bankPath(currentUser.code));
    bankRef.on('value', s => {
        bankState = s.val();
        checkVIPStatus();
        const panel = document.getElementById('tab-vip');
        if (panel && panel.classList.contains('active')) renderBank();
    });
    bankSettle();
}

// --- 개설 · 이자 · 연체 정산 ---
function bankSettle() {
    if (!database || !currentUser) return;
    const me = currentUser;
    const now = Date.now();
    const initScore = me.code === 'kario0987' ? 1000 : (me.hasVIP ? 700 : 500);

    database.ref(bankPath(me.code)).transaction(b => {
        if (!b) b = {};
        if (b.createdAt == null) {
            b.deposit = b.deposit || 0;
            b.lastInterest = now;
            b.score = (b.score != null) ? b.score : initScore;
            b.capBonus = b.capBonus || 0;
            b.createdAt = now;
        }

        // 이자
        const gr = bankGrade(b.score);
        const cap = gr.cap + (b.capBonus || 0);
        const days = Math.floor((now - (b.lastInterest || now)) / BANK_DAY);
        if (days > 0) {
            if ((b.deposit || 0) > 0) {
                let d = b.deposit;
                for (let i = 0; i < Math.min(days, 30); i++) d *= (1 + gr.rate);
                b.deposit = Math.min(cap, Math.max(b.deposit, Math.floor(d)));
            }
            b.lastInterest = (b.lastInterest || now) + days * BANK_DAY;
        }

        // 연체
        if (b.loan && now > b.loan.dueAt) {
            const overDays = Math.floor((now - b.loan.dueAt) / BANK_DAY) + 1;
            const applied = b.loan.penaltyDays || 0;
            if (overDays > applied) {
                const add = overDays - applied;
                b.loan.owe = Math.ceil(b.loan.owe * Math.pow(1.05, add));
                b.score = bankClamp((b.score || 0) - (applied === 0 ? 80 : 0) - 20 * add);
                if (applied === 0) b.loan.notice = true;
                b.loan.penaltyDays = overDays;
            }
            if (overDays >= 3 && (b.deposit || 0) > 0) {
                const take = Math.min(b.deposit, b.loan.owe);
                b.deposit -= take;
                b.loan.owe -= take;
            }
            if (b.loan.owe <= 0) b.loan = null;
            else if (overDays >= 5) b.loan.seize = true;
        }
        return b;
    }).then(res => {
        const b = res.snapshot && res.snapshot.val();
        if (!b) return;

        // 첫 연체 알림
        if (b.loan && b.loan.notice) {
            database.ref(bankPath(me.code) + '/loan/notice').set(false);
            applyPollutionToUser(currentUser, 10);
            addHistoryLog(currentUser, '[은행] 대출 상환 기한을 넘겼습니다. (오염도 +10%)');
            saveFields({ pollution: 1, history: 1 });
        }

        // 5일 이상 연체 — 포인트 압류
        if (b.loan && b.loan.seize && currentUser.points > 0) {
            const take = Math.min(currentUser.points, b.loan.owe);
            database.ref(bankPath(me.code)).transaction(x => {
                if (!x || !x.loan) return;
                x.loan.owe -= take;
                x.loan.seize = false;
                if (x.loan.owe <= 0) x.loan = null;
                return x;
            }).then(r => {
                if (!r.committed) return;
                changePoints(-take);
                addHistoryLog(currentUser, `[은행 압류] 연체 대출금 ${take.toLocaleString()} P가 회수되었습니다.`);
                saveFields({ history: 1 });
            });
        }

        // 기존 금고 이전 (한 번만)
        const safes = currentUser.safeBoxes || [];
        if (safes.length > 0 && !currentUser.safeMigrated) {
            const total = safes.reduce((a, s) => a + (s.amount || 0), 0);
            const bonus = safes.length * 50000;
            database.ref(bankPath(me.code)).transaction(x => {
                if (!x) return;
                x.deposit = (x.deposit || 0) + total;
                x.capBonus = (x.capBonus || 0) + bonus;
                return x;
            }).then(r => {
                if (!r.committed) return;
                currentUser.safeBoxes = [];
                currentUser.safeMigrated = true;
                addHistoryLog(currentUser, `[은행] 금고 ${safes.length}개의 ${total.toLocaleString()} P가 예금으로 이전되었습니다.`);
                saveSelfFull();
            });
        }
    });
}

// --- 신용 점수 가감 (외부에서 호출용) ---
function bankAddScore(delta, code) {
    if (!database) return;
    const c = code || (currentUser && currentUser.code);
    if (!c) return;
    database.ref(bankPath(c) + '/score').transaction(s => bankClamp((s == null ? 500 : s) + delta));
}

// --- 예금 ---
function bankDeposit() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;
    if (amt > currentUser.points) { showLuxuryAlert(); return; }

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b) return;
        const room = bankCap(b) - (b.deposit || 0);
        if (room <= 0) return;
        const put = Math.min(room, amt);
        b.deposit = (b.deposit || 0) + put;
        b.lastOp = put;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('예금 한도가 가득 찼습니다.'); return; }
        const put = res.snapshot.val().lastOp;
        changePoints(-put);
        addHistoryLog(currentUser, `[은행 입금] ${put.toLocaleString()} P`);
        saveFields({ history: 1 });
        showCustomAlert(put < amt
            ? `${put.toLocaleString()} P를 넣었습니다.\n한도 때문에 ${(amt - put).toLocaleString()} P는 넣지 못했습니다.`
            : `${put.toLocaleString()} P를 넣었습니다.`);
    });
}

function bankWithdraw() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    if (bankOverdue(bankState)) { showCustomAlert('연체 중에는 출금할 수 없습니다.'); return; }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || (b.deposit || 0) < amt) return;
        b.deposit -= amt;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('예금 잔액이 부족합니다.'); return; }
        changePoints(amt);
        addHistoryLog(currentUser, `[은행 출금] ${amt.toLocaleString()} P`);
        saveFields({ history: 1 });
        showPointGainEffect(amt);
    });
}

// --- 대출 ---
function bankBorrow() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    const gr = bankGrade(bankState.score);
    if (gr.loan <= 0) { showCustomAlert('신용 4등급부터 대출할 수 있습니다.'); return; }
    if (bankState.loan) { showCustomAlert('이미 대출 중입니다. 먼저 상환해주세요.'); return; }
    const amt = bankReadAmt('bank-loan-amt');
    if (!amt) return;
    if (amt > gr.loan) { showCustomAlert(`대출 한도는 ${gr.loan.toLocaleString()} P입니다.`); return; }

    const now = Date.now();
    const owe = Math.ceil(amt * (1 + gr.fee));
    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || b.loan) return;
        b.loan = { principal: amt, owe: owe, takenAt: now, dueAt: now + BANK_LOAN_DAYS * BANK_DAY, penaltyDays: 0 };
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('대출을 처리하지 못했습니다.'); return; }
        changePoints(amt);
        addHistoryLog(currentUser, `[은행 대출] ${amt.toLocaleString()} P (상환액 ${owe.toLocaleString()} P, ${BANK_LOAN_DAYS}일)`);
        saveFields({ history: 1 });
        showPointGainEffect(amt);
        showCustomAlert(`${amt.toLocaleString()} P를 빌렸습니다.\n\n${BANK_LOAN_DAYS}일 안에 ${owe.toLocaleString()} P를 갚아야 합니다.`);
    });
}

function bankRepay(all) {
    if (!buyGuard()) return;
    if (!bankState || !bankState.loan) { showCustomAlert('갚을 대출이 없습니다.'); return; }
    let amt = all ? bankState.loan.owe : bankReadAmt('bank-repay-amt');
    if (!amt) return;
    amt = Math.min(amt, bankState.loan.owe);
    if (amt > currentUser.points) { showLuxuryAlert(); return; }

    const now = Date.now();
    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || !b.loan) return;
        const pay = Math.min(amt, b.loan.owe);
        b.loan.owe -= pay;
        b.lastOp = pay;
        b.lastCleared = false;
        if (b.loan.owe <= 0) {
            const onTime = now <= b.loan.dueAt;
            b.score = bankClamp((b.score || 0) + (onTime ? 40 : 10));
            b.lastCleared = onTime ? 'ontime' : 'late';
            b.loan = null;
        }
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('상환을 처리하지 못했습니다.'); return; }
        const v = res.snapshot.val();
        changePoints(-v.lastOp);
        addHistoryLog(currentUser, `[은행 상환] ${v.lastOp.toLocaleString()} P`);
        saveFields({ history: 1 });
        showCustomAlert(
            v.lastCleared === 'ontime' ? `전액 상환했습니다.\n기한을 지켜 신용 점수가 40 올랐습니다.`
          : v.lastCleared === 'late'   ? `전액 상환했습니다.\n신용 점수가 10 올랐습니다.`
          : `${v.lastOp.toLocaleString()} P를 갚았습니다.`);
    });
}

// --- 아이템 연동 ---
function bankUseVipPass(itemName) {
    if (!database) return;
    removeItemFromInventory(currentUser, itemName, 1);
    bankAddScore(150);
    addHistoryLog(currentUser, `[은행] ${itemName}을(를) 제출했습니다. (신용 점수 +150)`);
    saveFields({ inventory: 1, history: 1 });
    updateUI();
    showCustomAlert('출입증을 제출했습니다.\n신용 점수가 150 올랐습니다.');
}

function bankAddSafeCap(itemName) {
    if (!database) return;
    removeItemFromInventory(currentUser, itemName, 1);
    database.ref(bankPath(currentUser.code) + '/capBonus').transaction(c => (c || 0) + 50000);
    addHistoryLog(currentUser, `[은행] 금고를 설치했습니다. (예금 한도 +50,000 P)`);
    saveFields({ inventory: 1, history: 1 });
    updateUI();
    showCustomAlert('금고를 설치했습니다.\n예금 한도가 50,000 P 늘었습니다.');
}

// --- 사원증 표시 (기존 VIP 표시 대체) ---
function checkVIPStatus() {
    attachBank();
    const el = document.getElementById('display-vip');
    if (!el) return;
    if (!bankState) { el.innerHTML = '-'; return; }
    const gr = bankGrade(bankState.score);
    el.innerHTML = gr.label + (bankOverdue(bankState) ? '<span style="color:#f44336;"> 연체</span>' : '');
}

// --- 화면 ---
function renderBank() {
    const box = document.getElementById('bank-body');
    if (!box || !currentUser) return;
    attachBank();

    if (!bankState) {
        box.innerHTML = `<div class="panel-title">[사내 은행]</div>
            <div style="text-align:center; color:#888; font-size:12px; padding:30px 0;">계좌를 여는 중...</div>`;
        return;
    }

    const b = bankState;
    const score = b.score || 0;
    const gr = bankGrade(score);
    const cap = bankCap(b);
    const next = BANK_GRADES.filter(x => x.min > score).sort((x, y) => x.min - y.min)[0];
    const loan = b.loan;
    const overdue = bankOverdue(b);
    const gradeColor = { 1:'#d4af37', 2:'#c9a8ff', 3:'#4fc3f7', 4:'#aaa', 5:'#777' }[gr.g];

    // 신용
    let html = `
        <div class="panel-title">[사내 은행]</div>
        <div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="font-size:11px; color:#888;">신용 등급</span>
                <span style="font-size:20px; font-weight:bold; color:${gradeColor};">${gr.label}</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden; margin:9px 0 5px 0;">
                <div style="height:100%; width:${score / 10}%; background:${gradeColor};"></div>
            </div>
            <div style="font-size:10px; color:#888; display:flex; justify-content:space-between;">
                <span>${score} / 1000</span>
                <span>${next ? `${next.label}까지 ${next.min - score}점` : '최고 등급'}</span>
            </div>
        </div>`;

    // 예금
    html += `
        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:13px; margin-bottom:14px;">
            <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">예금</div>
            <div style="font-size:18px; font-weight:bold; color:#ffd700;">${(b.deposit || 0).toLocaleString()} P</div>
            <div style="font-size:10px; color:#888; margin:4px 0 11px 0; line-height:1.6;">
                한도 ${cap.toLocaleString()} P${b.capBonus ? ` <span style="color:#aaa;">(금고 +${b.capBonus.toLocaleString()})</span>` : ''} · 일 이자 ${(gr.rate * 100).toFixed(1)}%<br>
                어둠에서 사망해도 잃지 않습니다.
            </div>
            <input type="number" id="bank-dep-amt" min="1" placeholder="금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankDeposit()">입금</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankWithdraw()" ${overdue ? 'disabled' : ''}>출금</button>
            </div>
            ${overdue ? `<div style="font-size:10px; color:#f44336; margin-top:7px; text-align:center;">연체 중에는 출금할 수 없습니다.</div>` : ''}
        </div>`;

    // 대출
    html += `<div style="background:rgba(0,0,0,0.3); border:1px solid ${overdue ? '#7f0000' : 'var(--theme-border)'}; border-radius:6px; padding:13px; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">대출</div>`;

    if (loan) {
        const left = loan.dueAt - Date.now();
        html += `
            <div style="font-size:11px; color:#aaa; line-height:1.8;">
                빌린 금액 ${loan.principal.toLocaleString()} P<br>
                갚을 금액 <b style="color:${overdue ? '#f44336' : '#ffd700'}; font-size:15px;">${loan.owe.toLocaleString()} P</b><br>
                ${overdue
                    ? `<span style="color:#f44336;">연체 ${loan.penaltyDays || 1}일째 — 매일 5%씩 불어납니다.</span><br>
                       <span style="font-size:10px; color:#888;">3일째부터 예금에서, 5일째부터 보유 포인트에서 회수됩니다.</span>`
                    : `남은 기한 <b>${bankFmtLeft(left)}</b>`}
            </div>
            <input type="number" id="bank-repay-amt" min="1" placeholder="상환 금액" style="width:100%; text-align:center; margin:10px 0 8px 0; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(false)">일부 상환</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(true)">전액 상환</button>
            </div>`;
    } else if (gr.loan <= 0) {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:8px 0;">🔒 신용 4등급부터 이용할 수 있습니다.</div>`;
    } else {
        html += `
            <div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:10px;">
                한도 <b style="color:#ddd;">${gr.loan.toLocaleString()} P</b> · 수수료 ${(gr.fee * 100).toFixed(0)}% · 기한 ${BANK_LOAN_DAYS}일<br>
                기한 내 전액 상환 시 신용 +40
            </div>
            <input type="number" id="bank-loan-amt" min="1" max="${gr.loan}" placeholder="대출 금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <button class="game-btn" style="width:100%; margin:0; padding:10px;" onclick="bankBorrow()">빌린다</button>`;
    }
    html += `</div>`;

    // 등급표
    html += `
        <details style="font-size:10px; color:#888;">
            <summary style="cursor:pointer; margin-bottom:8px;">등급별 혜택 보기</summary>
            ${BANK_GRADES.map(x => `
                <div style="display:flex; justify-content:space-between; padding:5px 3px; border-bottom:1px solid rgba(255,255,255,0.05); ${x.g === gr.g ? 'color:var(--theme-focus); font-weight:bold;' : ''}">
                    <span>${x.label} (${x.min}+)</span>
                    <span>예금 ${(x.cap / 1000)}K · ${(x.rate * 100).toFixed(1)}% · 대출 ${x.loan ? (x.loan / 1000) + 'K' : '불가'}</span>
                </div>`).join('')}
        </details>`;

    box.innerHTML = html;
}

// --- 관리자: 신용 점수 조정 ---
function adminAdjustCredit() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    openTextInput('신용 점수 조정',
        `더하거나 뺄 점수를 적어 주세요. (예: 100, -80)<br><span style="font-size:10px; color:#888;">0 ~ 1000 범위로 맞춰집니다.</span>`,
        '100',
        v => {
            const d = parseInt(v, 10);
            if (isNaN(d)) { showCustomAlert('숫자를 입력해주세요.'); return; }
            targets.forEach(code => bankAddScore(d, code));
            showCustomAlert(`${targets.length}명의 신용 점수를 ${d >= 0 ? '+' : ''}${d} 조정했습니다.`);
        });
}