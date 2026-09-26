// ==========================================
// ★ 육아휴직 — 아홉 회분 물건은 허가를 받아야 쓴다
// index.html 에서 preg-guard.js 다음에 불러온다
// ==========================================
//
// '밤새 켜 둔 등'(9회분)은 한 번에 하루치를 다 써 버린다.
// 상담사에게 육아휴직을 신청해 허가를 받아야 쓸 수 있게 한다.

// 허가가 필요한 물건 — 6회분 이상
const LEAVE_MIN_CARE = 2;

function needsLeave(itemName) {
    const it = (typeof PREG_ITEMS !== 'undefined') ? PREG_ITEMS[itemName] : null;
    return !!(it && it.care >= LEAVE_MIN_CARE);
}

function leaveRef(code) {
    return database.ref('pregLeave/' + (code || currentUser.code));
}

// 내 허가 상태 (메모리 사본)
let myLeave = null;

(function watchLeave() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        leaveRef(currentUser.code).on('value', function (s) {
            const prev = myLeave && myLeave.state;
            myLeave = s.val();
            if (!myLeave) return;
            if (prev === 'PENDING' && myLeave.state === 'APPROVED') {
                showCustomAlert('육아휴직이 승인되었습니다.\n\n아홉 회분 물건을 ' + (myLeave.uses || 1) + '번 쓸 수 있습니다.');
            }
            if (prev === 'PENDING' && myLeave.state === 'REJECTED') {
                showCustomAlert('육아휴직이 반려되었습니다.'
                    + (myLeave.memo ? '\n\n' + myLeave.memo : ''));
            }
        });
    }, 1500);
})();

function leaveUsesLeft() {
    if (!myLeave || myLeave.state !== 'APPROVED') return 0;
    return Math.max(0, myLeave.uses || 0);
}

// ==========================================
// 신청
// ==========================================
function requestPregLeave(targetCode) {
    if (!database || !currentUser) return;
    const t = db.users[targetCode];
    if (!t) { showCustomAlert('대상을 찾을 수 없습니다.'); return; }
    if (!isMySire(t)) { showCustomAlert('당신의 아이가 아닙니다.'); return; }

    if (myLeave && myLeave.state === 'PENDING') {
        showCustomAlert('이미 낸 신청서가 처리되지 않았습니다.');
        return;
    }
    if (leaveUsesLeft() > 0) {
        showCustomAlert(`아직 쓸 수 있는 허가가 ${leaveUsesLeft()}번 남아 있습니다.`);
        return;
    }

    openTextInput('육아휴직 신청',
        `<b style="color:#ff8fb1;">${t.name}</b> 사원을 돌보기 위한 신청서입니다.<br>
         <span style="color:#888; font-size:10px;">사유를 적으면 상담사가 보고 판단합니다.</span>`,
        '예: 밤에 자리를 비울 수 없습니다',
        function (reason) {
            leaveRef(currentUser.code).set({
                code: currentUser.code,
                name: currentUser.name,
                no: currentUser.no,
                target: targetCode,
                targetName: t.name,
                reason: reason,
                state: 'PENDING',
                at: Date.now(),
                uses: 0
            }).then(function () {
                addHistoryLog(currentUser, `[육아휴직] ${t.name} 사원을 위한 신청서를 냈습니다.`);
                saveFields({ history: 1 });
                showCustomAlert('신청서를 냈습니다.\n\n상담사의 허가를 기다려 주세요.');
                closeGearModal();
            }).catch(function (e) {
                console.error('신청 실패:', e);
                showCustomAlert('신청 중 오류가 발생했습니다.');
            });
        });
}

// ==========================================
// 돌봄 패널에 신청 칸을 붙인다
// ==========================================
(function hookCarePanel() {
    if (typeof openCarePanel !== 'function') return;
    const _o = openCarePanel;
    openCarePanel = function (code) {
        const r = _o.apply(this, arguments);
        setTimeout(function () { addLeaveBox(code); }, 80);
        return r;
    };
})();

function addLeaveBox(code) {
    const body = document.getElementById('gear-modal-body');
    if (!body || document.getElementById('preg-leave-box')) return;

    const inv = currentUser.inventory || [];
    const big = Object.keys(PREG_ITEMS).filter(n => needsLeave(n) && inv.includes(n));
    const left = leaveUsesLeft();
    const pending = myLeave && myLeave.state === 'PENDING';

    let html = '';
    if (left > 0) {
        html = `
            <div style="font-size:12px; color:#81c784; font-weight:bold; margin-bottom:7px;">육아휴직 승인됨</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px; line-height:1.7;">
                남은 사용 <b style="color:#4CAF50;">${left}회</b><br>
                ${big.length ? '아래 물건을 쓸 수 있습니다.' : '여러 회분 물건이 없습니다.'}
            </div>
            ${big.map(n => `
                <button class="game-btn" style="width:100%; margin:0 0 5px 0; padding:9px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="doCare('${code}', 0, '${n}')">
                    ${n} 쓴다 <span style="font-size:9px; color:#c8e6c9;">(${PREG_ITEMS[n].care}회분)</span>
                </button>`).join('')}`;
    } else if (pending) {
        html = `
            <div style="font-size:12px; color:#ffb74d; font-weight:bold; margin-bottom:7px;">육아휴직 심사 중</div>
            <div style="font-size:10px; color:#888; line-height:1.7;">
                ${myLeave.targetName} 사원 건으로 신청서를 냈습니다.<br>
                상담사가 보고 있습니다.
            </div>`;
    } else if (big.length) {
        html = `
            <div style="font-size:12px; color:#ff8fb1; font-weight:bold; margin-bottom:7px;">육아휴직 신청</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px; line-height:1.7;">
                <b style="color:#ddd;">${big.join(', ')}</b> 은(는) 하루치를 한 번에 씁니다.<br>
                상담사의 허가를 받아야 쓸 수 있습니다.
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;" onclick="requestPregLeave('${code}')">
                신청서를 낸다
            </button>`;
    } else {
        return;   // 해당 물건이 없으면 칸 자체를 안 만든다
    }

    body.insertAdjacentHTML('beforeend',
        `<div id="preg-leave-box" style="border:1px solid #5a4a2a; border-radius:6px; padding:11px; margin-top:9px; background:rgba(212,175,55,0.04);">${html}</div>`);
}

// ==========================================
// 목록에서는 큰 물건을 뺀다
// ==========================================
(function hideBigInList() {
    const iv = setInterval(function () {
        const body = document.getElementById('gear-modal-body');
        if (!body) return;
        body.querySelectorAll('button').forEach(function (b) {
            const oc = b.getAttribute('onclick') || '';
            const m = oc.match(/doCare\('[^']*',\s*0,\s*'([^']+)'\)/);
            if (!m) return;
            if (!needsLeave(m[1])) return;
            if (b.closest('#preg-leave-box')) return;   // 허가 칸 안의 버튼은 그대로
            const row = b.parentElement;
            if (row) row.style.display = 'none';
        });
    }, 600);
    window._leaveHideTimer = iv;
})();

// ==========================================
// 실제 사용 시 검사
// ==========================================
(function guardDoCare() {
    if (typeof doCare !== 'function') return;
    const _d = doCare;
    doCare = function (code, cost, item) {
        if (item && needsLeave(item)) {
            if (leaveUsesLeft() <= 0) {
                showCustomAlert(`'${item}'은(는) 육아휴직 허가를 받아야 쓸 수 있습니다.\n\n돌봄 창에서 신청서를 내 주세요.`);
                return;
            }
            // 허가 한 번 소모
            const rest = leaveUsesLeft() - 1;
            leaveRef(currentUser.code).update({
                uses: rest,
                state: rest > 0 ? 'APPROVED' : 'USED',
                usedAt: Date.now()
            });
        }
        return _d.apply(this, arguments);
    };
})();

// ==========================================
// 상담사 화면
// ==========================================
function renderPregLeaveList() {
    const box = document.getElementById('admin-leave-list');
    if (!box || !database) return;

    database.ref('pregLeave').once('value').then(function (snap) {
        const all = snap.val() || {};
        const rows = Object.keys(all).map(c => all[c]).filter(v => v && v.state === 'PENDING');

        if (rows.length === 0) {
            box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:16px 0;">처리할 신청서가 없습니다.</div>`;
            return;
        }

        box.innerHTML = rows.map(function (v) {
            const ago = Math.floor((Date.now() - (v.at || 0)) / 60000);
            return `
                <div style="background:rgba(0,0,0,0.35); border:1px solid #5a4a2a; border-radius:6px; padding:11px; margin-bottom:9px;">
                    <div style="font-size:12px; color:#fff; font-weight:bold;">
                        ${v.name} <span style="font-size:10px; color:#888; font-weight:normal;">사번 ${v.no}</span>
                    </div>
                    <div style="font-size:10px; color:#ff8fb1; margin-top:3px;">
                        대상 · ${v.targetName}
                    </div>
                    <div style="font-size:11px; color:#ddd; margin-top:7px; padding:8px 10px; background:rgba(0,0,0,0.3); border-radius:4px; line-height:1.6;">
                        ${v.reason || '(사유 없음)'}
                    </div>
                    <div style="font-size:9px; color:#666; margin-top:5px;">${ago}분 전</div>
                    <div style="display:flex; gap:5px; margin-top:9px;">
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 1)">승인 (1회)</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#0288d1,#01579b) !important; border-color:#01579b !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 3)">승인 (3회)</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="pregLeaveDecide('${v.code}', 0)">반려</button>
                    </div>
                </div>`;
        }).join('');
    });
}

function pregLeaveDecide(code, uses) {
    if (!database) return;
    const u = db.users[code];

    if (uses > 0) {
        leaveRef(code).update({
            state: 'APPROVED', uses: uses, by: currentUser.name, decidedAt: Date.now()
        }).then(function () {
            if (u) {
                addHistoryLog(u, `[육아휴직] 신청이 승인되었습니다. (${uses}회)`);
                updateUserFields(code, { history: u.history });
            }
            showCustomAlert(`${u ? u.name : code} 사원의 육아휴직을 승인했습니다. (${uses}회)`);
            renderPregLeaveList();
        });
        return;
    }

    openTextInput('반려 사유',
        `적지 않아도 됩니다.`,
        '예: 인력이 모자랍니다',
        function (memo) {
            leaveRef(code).update({
                state: 'REJECTED', uses: 0, memo: memo, by: currentUser.name, decidedAt: Date.now()
            }).then(function () {
                if (u) {
                    addHistoryLog(u, `[육아휴직] 신청이 반려되었습니다.`);
                    updateUserFields(code, { history: u.history });
                }
                showCustomAlert('반려했습니다.');
                renderPregLeaveList();
            });
        });
}

// 통제 콘솔에 칸을 끼워 넣는다
(function injectAdminPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-leave-box')) return true;

        const anchor = scr.querySelector('.action-buttons');
        const html = `
            <div class="admin-panel-box" id="admin-leave-box" style="border-color:#c2185b; background-color:#1f1015;">
                <h4 style="color:#ff8fb1;">🍼 육아휴직 심사</h4>
                <div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.5;">
                    여러 회분 물건('밤새 켜 둔 등')을 쓰려면 허가가 필요합니다.<br>
                    승인 횟수만큼 쓸 수 있고, 다 쓰면 다시 신청해야 합니다.
                </div>
                <button class="game-btn" style="width:100%; margin:0 0 9px 0; padding:9px;" onclick="renderPregLeaveList()">새로고침</button>
                <div id="admin-leave-list"></div>
            </div>`;

        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
        return true;
    }

    if (typeof openAdminScreen === 'function') {
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); renderPregLeaveList(); }, 120);
            return r;
        };
    }

    // 신청이 들어오면 콘솔 버튼에 점을 찍는다
    if (database) {
        const iv = setInterval(function () {
            if (!currentUser) return;
            if (currentUser.code !== 'kario0987') { clearInterval(iv); return; }
            clearInterval(iv);
            database.ref('pregLeave').on('value', function (s) {
                const all = s.val() || {};
                const n = Object.keys(all).filter(c => all[c] && all[c].state === 'PENDING').length;
                const btn = document.getElementById('btn-admin-console');
                if (!btn) return;
                if (n > 0) btn.classList.add('notify-dot');
                const box = document.getElementById('admin-leave-list');
                if (box) renderPregLeaveList();
            });
        }, 1500);
    }
})();

// 확인용
function leaveState() {
    console.log('내 허가:', myLeave ? myLeave.state : '없음',
                '/ 남은 사용:', leaveUsesLeft());
    console.log('허가 필요 물건:',
        Object.keys(PREG_ITEMS || {}).filter(needsLeave).join(', ') || '없음');
}

console.log('[임신] 육아휴직 제도 적용 — leaveState() 로 확인');