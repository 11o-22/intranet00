// ==========================================
// ★ 사내 은행
// ==========================================
const BANK_GRADES = [
    { g:1, min:850, cap:10000000, rate:0.006, loan:60000, fee:0.03, label:'1등급' },
    { g:2, min:700, cap:3000000,  rate:0.005, loan:20000, fee:0.05, label:'2등급' },
    { g:3, min:500, cap:500000,   rate:0.004, loan:5000,  fee:0.08, label:'3등급' },
    { g:4, min:300, cap:200000,   rate:0.003, loan:1000,  fee:0.12, label:'4등급' },
    { g:5, min:0,   cap:50000,    rate:0.002, loan:0,     fee:0,    label:'5등급' }
];
const BANK_VIP = { cap: 30000000, label: 'VIP' };
const BANK_LOAN_DAYS = 3;
const BANK_DAY = 24 * 60 * 60 * 1000;

// ★ 꼼수 방지
const BANK_MIN_HOLD      = 12 * 60 * 60 * 1000;  // 최소 보유 시간
const BANK_MIN_RATIO     = 0.3;                  // 한도 대비 최소 대출 비율
const BANK_GAIN_COOLDOWN = BANK_DAY;             // 신용 가산 간격
const BANK_BL_LOANS      = 3;                    // 이 횟수째 대출 시 블랙리스트
const BANK_BL_WINDOW     = BANK_DAY;             // 집계 기간

let bankState = null, bankRef = null, bankKey = null;

function bankPath(code) { return 'bank/' + code; }
function bankGrade(score) {
    return BANK_GRADES.find(x => (score || 0) >= x.min) || BANK_GRADES[BANK_GRADES.length - 1];
}
function bankCap(b) {
    const base = (b && b.vip && !b.blacklist) ? BANK_VIP.cap : bankGrade(b && b.score).cap;
    return base + ((b && b.capBonus) || 0);
}
function bankClamp(s) { return Math.max(0, Math.min(1000, s)); }
function bankOverdue(b) { return !!(b && b.loan && Date.now() > b.loan.dueAt); }
function bankBlack(b) { return !!(b && b.blacklist); }
function bankRecentLoans(b) {
    const now = Date.now();
    return (b && b.loanTimes ? b.loanTimes : []).filter(t => now - t < BANK_BL_WINDOW).length;
}

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

        // 이자 (블랙리스트는 없음)
        const gr = bankGrade(b.score);
        const cap = bankCap(b);
        const days = Math.floor((now - (b.lastInterest || now)) / BANK_DAY);
        if (days > 0) {
            if ((b.deposit || 0) > 0 && !b.blacklist) {
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

        if (b.blacklist) { b.score = 0; b.vip = null; b.vipRequest = null; }
        return b;
    }).then(res => {
        const b = res.snapshot && res.snapshot.val();
        if (!b) return;

        if (b.loan && b.loan.notice) {
            database.ref(bankPath(me.code) + '/loan/notice').set(false);
            applyPollutionToUser(currentUser, 10);
            addHistoryLog(currentUser, '[은행] 대출 상환 기한을 넘겼습니다. (오염도 +10%)');
            saveFields({ pollution: 1, history: 1 });
        }

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

// --- 신용 점수 가감 (블랙리스트는 오르지 않음) ---
function bankAddScore(delta, code) {
    if (!database) return;
    const c = code || (currentUser && currentUser.code);
    if (!c) return;
    database.ref(bankPath(c)).transaction(b => {
        if (!b) return;
        if (b.blacklist && delta > 0) return;
        b.score = bankClamp((b.score == null ? 500 : b.score) + delta);
        return b;
    });
}

// --- 예금 ---
function bankDeposit() {
    if (!buyGuard()) return;
    if (!bankState) { showCustomAlert('계좌 정보를 불러오는 중입니다.'); return; }
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태입니다.\n입금할 수 없습니다.'); return; }
    const amt = bankReadAmt('bank-dep-amt');
    if (!amt) return;
    if (amt > currentUser.points) { showLuxuryAlert(); return; }

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || b.blacklist) return;
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
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태입니다.\n대출할 수 없습니다.'); return; }
    const gr = bankGrade(bankState.score);
    if (gr.loan <= 0) { showCustomAlert('신용 4등급부터 대출할 수 있습니다.'); return; }
    if (bankState.loan) { showCustomAlert('이미 대출 중입니다. 먼저 상환해주세요.'); return; }
    const amt = bankReadAmt('bank-loan-amt');
    if (!amt) return;
    if (amt > gr.loan) { showCustomAlert(`대출 한도는 ${gr.loan.toLocaleString()} P입니다.`); return; }

    const now = Date.now();
    const owe = Math.ceil(amt * (1 + gr.fee));

    database.ref(bankPath(currentUser.code)).transaction(b => {
        if (!b || b.loan || b.blacklist) return;

        const recent = (b.loanTimes || []).filter(t => now - t < BANK_BL_WINDOW);
        recent.push(now);
        b.loanTimes = recent.slice(-10);

        // ★ 반복 대출 → 블랙리스트
        if (recent.length >= BANK_BL_LOANS) {
            b.blacklist = { at: now, reason: '24시간 안에 대출을 반복함', by: 'system' };
            b.score = 0;
            b.vip = null;           // ★ 추가
            b.vipRequest = null;
            b.lastOp = 'blacklisted';
            return b;
        }

        b.loan = {
            principal: amt, owe: owe, limitAt: gr.loan,
            takenAt: now, dueAt: now + BANK_LOAN_DAYS * BANK_DAY, penaltyDays: 0
        };
        b.lastOp = 'ok';
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('대출을 처리하지 못했습니다.'); return; }
        const v = res.snapshot.val();

        if (v.lastOp === 'blacklisted') {
            addHistoryLog(currentUser, '[은행] 대출 반복으로 거래가 정지되었습니다. (블랙리스트)');
            saveFields({ history: 1 });
            showCustomAlert('창구 직원이 서류를 넘기다 멈춥니다.\n\n24시간 안에 대출을 너무 여러 번 했습니다.\n거래가 정지되고 신용이 초기화되었습니다.');
            return;
        }

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
        b.lastGain = 0;
        b.lastWhy = '';

        if (b.loan.owe <= 0) {
            const onTime  = now <= b.loan.dueAt;
            const held    = now - (b.loan.takenAt || now);
            const limit   = b.loan.limitAt || bankGrade(b.score).loan || 1;
            const bigEnough = b.loan.principal >= Math.ceil(limit * BANK_MIN_RATIO);
            const cooled  = !b.lastGainAt || (now - b.lastGainAt) >= BANK_GAIN_COOLDOWN;

            let gain = 0, why = '';
            if (b.blacklist)            why = '거래 정지 상태라 신용에 반영되지 않았습니다.';
            else if (held < BANK_MIN_HOLD) why = '빌린 지 12시간이 지나지 않아 신용에 반영되지 않았습니다.';
            else if (!bigEnough)        why = '대출 금액이 한도의 30% 미만이라 신용에 반영되지 않았습니다.';
            else if (!cooled)           why = '신용 가산은 24시간에 한 번만 됩니다.';
            else gain = onTime ? 40 : 10;

            if (gain) {
                b.score = bankClamp((b.score || 0) + gain);
                b.lastGainAt = now;
            }
            b.lastGain = gain;
            b.lastWhy = why;
            b.lastCleared = true;
            b.loan = null;
        }
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('상환을 처리하지 못했습니다.'); return; }
        const v = res.snapshot.val();
        changePoints(-v.lastOp);
        addHistoryLog(currentUser, `[은행 상환] ${v.lastOp.toLocaleString()} P`);
        saveFields({ history: 1 });

        if (!v.lastCleared) { showCustomAlert(`${v.lastOp.toLocaleString()} P를 갚았습니다.`); return; }
        showCustomAlert(v.lastGain
            ? `전액 상환했습니다.\n신용 점수가 ${v.lastGain} 올랐습니다.`
            : `전액 상환했습니다.\n\n${v.lastWhy}`);
    });
}

// --- 아이템 연동 ---
function bankUseVipPass(itemName) {
    if (!database) return;
    if (bankBlack(bankState)) { showCustomAlert('거래 정지 상태에서는 제출할 수 없습니다.'); return; }
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

// --- 사원증 표시 ---
function checkVIPStatus() {
    attachBank();
    const el = document.getElementById('display-vip');
    if (!el) return;
    if (!bankState) { el.innerHTML = '-'; return; }
    if (bankBlack(bankState)) { el.innerHTML = '<span style="color:#f44336;">블랙리스트</span>'; return; }
    const late = bankOverdue(bankState) ? '<span style="color:#f44336;"> 연체</span>' : '';
    if (bankState.vip) { el.innerHTML = '<span style="color:#d4af37;">VIP</span>' + late; return; }
    el.innerHTML = bankGrade(bankState.score).label + late;
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
    const black = bankBlack(b);
    const vip = !!b.vip && !black;
    const score = b.score || 0;
    const gr = bankGrade(score);
    const cap = bankCap(b);
    const next = BANK_GRADES.filter(x => x.min > score).sort((x, y) => x.min - y.min)[0];
    const loan = b.loan;
    const overdue = bankOverdue(b);
    const recent = bankRecentLoans(b);
    const gradeColor = black ? '#f44336' : vip ? '#d4af37' : ({ 1:'#d4af37', 2:'#c9a8ff', 3:'#4fc3f7', 4:'#aaa', 5:'#777' }[gr.g]);
    const man = n => (n >= 10000 ? (n / 10000).toLocaleString() + '만' : n.toLocaleString());

    let html = `<div class="panel-title">[사내 은행]</div>`;

    if (black) {
        html += `
            <div style="background:rgba(127,0,0,0.2); border:1px solid #b71c1c; border-radius:6px; padding:13px; margin-bottom:14px; font-size:11px; color:#ff9baa; line-height:1.8;">
                <div style="font-size:13px; color:#f44336; font-weight:bold; margin-bottom:6px;">⛔ 거래 정지 (블랙리스트)</div>
                사유: ${b.blacklist.reason || '-'}<br>
                등록: ${new Date(b.blacklist.at).toLocaleString()}<br>
                <span style="color:#aaa;">입금·대출이 막히고 이자가 붙지 않습니다. 출금과 상환은 가능합니다.<br>해제는 상담사에게 문의하세요.</span>
            </div>`;
    }

    // 신용
    html += `
        <div style="background:rgba(0,0,0,0.35); border:1px solid ${vip ? '#d4af37' : 'var(--theme-border)'}; border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="font-size:11px; color:#888;">신용 등급</span>
                <span style="font-size:20px; font-weight:bold; color:${gradeColor};">${black ? '블랙리스트' : vip ? 'VIP' : gr.label}</span>
            </div>
            <div style="width:100%; height:7px; background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:4px; overflow:hidden; margin:9px 0 5px 0;">
                <div style="height:100%; width:${score / 10}%; background:${gradeColor};"></div>
            </div>
            <div style="font-size:10px; color:#888; display:flex; justify-content:space-between;">
                <span>${score} / 1000</span>
                <span>${black ? '점수 동결' : vip ? 'VIP 회원' : next ? `${next.label}까지 ${next.min - score}점` : 'VIP는 심사가 필요합니다'}</span>
            </div>
        </div>`;

    // VIP
    html += `<div style="background:rgba(212,175,55,0.06); border:1px solid #5a4a2a; border-radius:6px; padding:13px; margin-bottom:14px;">
        <div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:8px;">VIP</div>`;
    if (vip) {
        html += `<div style="font-size:11px; color:#ccc; line-height:1.8;">
                VIP 회원입니다. 예금 한도 <b style="color:#d4af37;">${man(BANK_VIP.cap)} P</b><br>
                <span style="font-size:10px; color:#888;">승인일 ${new Date(b.vip.at).toLocaleDateString()}</span>
            </div>`;
    } else if (b.vipRequest) {
        html += `<div style="font-size:11px; color:#ffb74d; line-height:1.8;">
                심사 대기 중입니다.<br>
                <span style="color:#aaa;">상담사에게 찾아가 심사를 받으세요.</span>
            </div>`;
    } else if (black) {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:6px 0;">거래 정지 상태에서는 신청할 수 없습니다.</div>`;
    } else if (score >= 850) {
        const cool = b.vipRejectedAt && (Date.now() - b.vipRejectedAt < BANK_DAY);
        html += `<div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:10px;">
                1등급 사원은 VIP 심사를 신청할 수 있습니다.<br>
                승인되면 예금 한도가 ${man(BANK_VIP.cap)} P가 됩니다.
                ${cool ? `<br><span style="color:#ff9800;">최근 반려되었습니다. ${bankFmtLeft(BANK_DAY - (Date.now() - b.vipRejectedAt))} 뒤 다시 신청할 수 있습니다.</span>` : ''}
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:10px;" onclick="bankApplyVip()" ${cool || overdue ? 'disabled' : ''}>VIP 심사 신청</button>`;
    } else {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:6px 0;">🔒 1등급 달성 후 심사를 신청할 수 있습니다.</div>`;
    }
    html += `</div>`;

    // 예금
    html += `
        <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:13px; margin-bottom:14px;">
            <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">예금</div>
            <div style="font-size:18px; font-weight:bold; color:#ffd700;">${(b.deposit || 0).toLocaleString()} P</div>
            <div style="font-size:10px; color:#888; margin:4px 0 11px 0; line-height:1.6;">
                한도 ${cap.toLocaleString()} P${b.capBonus ? ` <span style="color:#aaa;">(금고 +${b.capBonus.toLocaleString()})</span>` : ''} · 일 이자 ${black ? '없음' : (gr.rate * 100).toFixed(1) + '%'}<br>
                어둠에서 사망해도 잃지 않습니다.
            </div>
            <input type="number" id="bank-dep-amt" min="1" placeholder="금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankDeposit()" ${black ? 'disabled' : ''}>입금</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankWithdraw()" ${overdue ? 'disabled' : ''}>출금</button>
            </div>
            ${overdue ? `<div style="font-size:10px; color:#f44336; margin-top:7px; text-align:center;">연체 중에는 출금할 수 없습니다.</div>` : ''}
        </div>`;

    // 대출
    html += `<div style="background:rgba(0,0,0,0.3); border:1px solid ${overdue ? '#7f0000' : 'var(--theme-border)'}; border-radius:6px; padding:13px; margin-bottom:14px;">
        <div style="font-size:11px; color:var(--theme-focus); font-weight:bold; margin-bottom:8px;">대출</div>`;

    if (loan) {
        const left = loan.dueAt - Date.now();
        const held = Date.now() - (loan.takenAt || Date.now());
        html += `
            <div style="font-size:11px; color:#aaa; line-height:1.8;">
                빌린 금액 ${loan.principal.toLocaleString()} P<br>
                갚을 금액 <b style="color:${overdue ? '#f44336' : '#ffd700'}; font-size:15px;">${loan.owe.toLocaleString()} P</b><br>
                ${overdue
                    ? `<span style="color:#f44336;">연체 ${loan.penaltyDays || 1}일째 — 매일 5%씩 불어납니다.</span><br>
                       <span style="font-size:10px; color:#888;">3일째부터 예금에서, 5일째부터 보유 포인트에서 회수됩니다.</span>`
                    : `남은 기한 <b>${bankFmtLeft(left)}</b>`}
                ${(!overdue && held < BANK_MIN_HOLD)
                    ? `<br><span style="font-size:10px; color:#ff9800;">지금 갚으면 신용에 반영되지 않습니다. (신용 반영까지 ${bankFmtLeft(BANK_MIN_HOLD - held)})</span>`
                    : ''}
            </div>
            <input type="number" id="bank-repay-amt" min="1" placeholder="상환 금액" style="width:100%; text-align:center; margin:10px 0 8px 0; box-sizing:border-box;">
            <div style="display:flex; gap:6px;">
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(false)">일부 상환</button>
                <button class="game-btn" style="flex:1; margin:0; padding:10px;" onclick="bankRepay(true)">전액 상환</button>
            </div>`;
    } else if (black) {
        html += `<div style="font-size:11px; color:#f44336; text-align:center; padding:8px 0;">⛔ 거래 정지 상태입니다.</div>`;
    } else if (gr.loan <= 0) {
        html += `<div style="font-size:11px; color:#666; text-align:center; padding:8px 0;">🔒 신용 4등급부터 이용할 수 있습니다.</div>`;
    } else {
        html += `
            <div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:10px;">
                한도 <b style="color:#ddd;">${gr.loan.toLocaleString()} P</b> · 수수료 ${(gr.fee * 100).toFixed(0)}% · 기한 ${BANK_LOAN_DAYS}일<br>
                신용 +40 조건: 12시간 이상 보유 · 한도 30% 이상 · 기한 내 전액 상환 · 24시간에 1번<br>
                <span style="color:${recent >= BANK_BL_LOANS - 1 ? '#f44336' : '#ff9800'};">
                    최근 24시간 대출 ${recent}회 — ${BANK_BL_LOANS}번째 대출 시 거래 정지
                </span>
            </div>
            <input type="number" id="bank-loan-amt" min="1" max="${gr.loan}" placeholder="대출 금액" style="width:100%; text-align:center; margin-bottom:8px; box-sizing:border-box;">
            <button class="game-btn" style="width:100%; margin:0; padding:10px;" onclick="bankBorrow()">빌린다</button>`;
    }
    html += `</div>`;

    // 등급표
    html += `
        <details style="font-size:10px; color:#888;">
            <summary style="cursor:pointer; margin-bottom:8px;">등급별 혜택 보기</summary>
            <div style="display:flex; justify-content:space-between; padding:5px 3px; border-bottom:1px solid rgba(255,255,255,0.05); color:#d4af37; ${vip ? 'font-weight:bold;' : ''}">
                <span>VIP (심사)</span>
                <span>예금 ${man(BANK_VIP.cap)} · 1등급 혜택 동일</span>
            </div>
            ${BANK_GRADES.map(x => `
                <div style="display:flex; justify-content:space-between; padding:5px 3px; border-bottom:1px solid rgba(255,255,255,0.05); ${(!black && !vip && x.g === gr.g) ? 'color:var(--theme-focus); font-weight:bold;' : ''}">
                    <span>${x.label} (${x.min}+)</span>
                    <span>예금 ${man(x.cap)} · ${(x.rate * 100).toFixed(1)}% · 대출 ${x.loan ? man(x.loan) : '불가'}</span>
                </div>`).join('')}
        </details>`;

    box.innerHTML = html;
}
// --- 관리자: 신용 점수 조정 ---
function adminAdjustCredit() {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    openTextInput('신용 점수 조정',
        `더하거나 뺄 점수를 적어 주세요. (예: 100, -80)<br><span style="font-size:10px; color:#888;">0 ~ 1000 범위 · 블랙리스트는 올라가지 않습니다.</span>`,
        '100',
        v => {
            const d = parseInt(v, 10);
            if (isNaN(d)) { showCustomAlert('숫자를 입력해주세요.'); return; }
            targets.forEach(code => bankAddScore(d, code));
            showCustomAlert(`${targets.length}명의 신용 점수를 ${d >= 0 ? '+' : ''}${d} 조정했습니다.`);
        });
}

// --- 관리자: 블랙리스트 ---
function adminBankBlacklist(on) {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    if (!database) return;

    if (on) {
        openTextInput('블랙리스트 등록', '사유를 적어 주세요.', '예: 대출 반복 악용', reason => {
            targets.forEach(code => {
                database.ref(bankPath(code)).transaction(b => {
                    b = b || {};
                    b.blacklist = { at: Date.now(), reason: reason, by: 'admin' };
                    b.score = 0;
                    b.vip = null;           // ★ 추가
                    b.vipRequest = null;  
                    return b;
                });
            });
            showCustomAlert(`${targets.length}명을 블랙리스트에 올렸습니다.`);
        });
    } else {
        targets.forEach(code => {
            database.ref(bankPath(code)).transaction(b => {
                if (!b) return;
                b.blacklist = null;
                b.loanTimes = [];
                b.score = Math.max(b.score || 0, 300);
                return b;
            });
        });
        showCustomAlert(`${targets.length}명의 블랙리스트를 해제했습니다.\n신용 300점(4등급)부터 다시 시작합니다.`);
    }
}

// ==========================================
// ★ VIP 심사
// ==========================================
function bankApplyVip() {
    if (!buyGuard()) return;
    const b = bankState;
    if (!b || !database) return;
    if (b.vip) { showCustomAlert('이미 VIP 회원입니다.'); return; }
    if (bankBlack(b)) { showCustomAlert('거래 정지 상태에서는 신청할 수 없습니다.'); return; }
    if ((b.score || 0) < 850) { showCustomAlert('1등급만 신청할 수 있습니다.'); return; }
    if (b.vipRequest) { showCustomAlert('이미 심사 대기 중입니다.'); return; }
    if (bankOverdue(b)) { showCustomAlert('연체 중에는 신청할 수 없습니다.'); return; }
    if (b.vipRejectedAt && Date.now() - b.vipRejectedAt < BANK_DAY) { showCustomAlert('반려 후 24시간이 지나야 다시 신청할 수 있습니다.'); return; }

    database.ref(bankPath(currentUser.code) + '/vipRequest').set({
        at: Date.now(), score: b.score, name: currentUser.name, no: currentUser.no
    });
    addHistoryLog(currentUser, '[은행] VIP 심사를 신청했습니다.');
    saveFields({ history: 1 });
    showCustomAlert('VIP 심사를 신청했습니다.\n\n상담사에게 찾아가 심사를 받으세요.');
}

// --- 관리자 ---
function renderAdminVipList() {
    const box = document.getElementById('admin-vip-list');
    if (!box || !database) return;
    box.innerHTML = `<div style="font-size:10px; color:#888; padding:8px 0;">불러오는 중...</div>`;

    database.ref('bank').once('value').then(snap => {
        const all = snap.val() || {};
        const reqs = [], vips = [];
        Object.keys(all).forEach(code => {
            const b = all[code];
            if (b && b.vipRequest) reqs.push({ code, b });
            if (b && b.vip) vips.push({ code, b });
        });
        const nameOf = c => db.users[c] ? `${db.users[c].name} · ${db.users[c].no}` : c;

        let html = `<div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:6px;">심사 대기 (${reqs.length})</div>`;
        html += reqs.length ? reqs.map(({ code, b }) => `
            <div style="background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; border-radius:5px; padding:9px 10px; margin-bottom:6px;">
                <div style="font-size:12px; color:#fff; font-weight:bold;">${nameOf(code)}</div>
                <div style="font-size:10px; color:#888; margin:3px 0 8px 0;">
                    신용 ${b.score} · 예금 ${(b.deposit || 0).toLocaleString()} P · 신청 ${new Date(b.vipRequest.at).toLocaleString()}
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="adminVipDecide('${code}', true)">승인</button>
                    <button class="game-btn" style="flex:1; margin:0; padding:7px; font-size:11px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="adminVipDecide('${code}', false)">반려</button>
                </div>
            </div>`).join('')
            : `<div style="font-size:10px; color:#666; padding:4px 0 10px 0;">대기 중인 신청이 없습니다.</div>`;

        html += `<div style="font-size:10px; color:#d4af37; font-weight:bold; margin:10px 0 6px 0;">VIP 회원 (${vips.length})</div>`;
        html += vips.length ? vips.map(({ code, b }) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid #333; border-radius:5px; padding:7px 10px; margin-bottom:5px;">
                <span style="font-size:11px; color:#ddd;">${nameOf(code)}
                    <span style="font-size:9px; color:#888;"> · ${new Date(b.vip.at).toLocaleDateString()}</span>
                </span>
                <button class="game-btn" style="margin:0; padding:5px 10px; font-size:10px;" onclick="adminVipRevoke('${code}')">박탈</button>
            </div>`).join('')
            : `<div style="font-size:10px; color:#666; padding:4px 0;">VIP 회원이 없습니다.</div>`;

        box.innerHTML = html;
    });
}

function adminVipDecide(code, ok) {
    if (!database) return;
    database.ref(bankPath(code)).transaction(b => {
        if (!b || !b.vipRequest) return;
        if (ok) b.vip = { at: Date.now(), by: 'admin' };
        else b.vipRejectedAt = Date.now();
        b.vipRequest = null;
        return b;
    }).then(res => {
        if (!res.committed) { showCustomAlert('이미 처리된 신청입니다.'); renderAdminVipList(); return; }
        const u = db.users[code];
        if (u) {
            addHistoryLog(u, ok ? '[은행] VIP 심사를 통과했습니다.' : '[은행] VIP 심사에서 반려되었습니다.');
            updateUserFields(code, { history: u.history });
        }
        showCustomAlert(ok ? 'VIP로 승인했습니다.' : '반려했습니다.');
        renderAdminVipList();
    });
}

function adminVipRevoke(code) {
    if (!database) return;
    database.ref(bankPath(code)).transaction(b => {
        if (!b || !b.vip) return;
        b.vip = null;
        return b;
    }).then(res => {
        if (!res.committed) return;
        const u = db.users[code];
        if (u) {
            addHistoryLog(u, '[은행] VIP 자격이 박탈되었습니다.');
            updateUserFields(code, { history: u.history });
        }
        showCustomAlert('VIP 자격을 박탈했습니다.');
        renderAdminVipList();
    });
}