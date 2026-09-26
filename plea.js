// ==========================================
// ★ 탄원서 — 격리 중인 사원이 상담사에게 보낸다
// index.html 에서 preg-roster.js 다음에 불러온다
// ==========================================
//
// 여우 상담실 · 선녀탕에 들어간 사원이 탄원서를 쓰면
// 상담사가 보고 시간을 줄여 주거나 내보낼 수 있다.

const PLEA_MAX = 300;        // 글자 수
const PLEA_COOL = 30 * 60000; // 같은 사람이 다시 낼 때까지

function pleaRef(code) {
    return database.ref('pleas/' + (code || currentUser.code));
}

let myPlea = null;

(function watchPlea() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        pleaRef(currentUser.code).on('value', function (s) {
            const prev = myPlea && myPlea.state;
            myPlea = s.val();
            if (!myPlea || prev !== 'PENDING') { paintPleaBox(); return; }

            if (myPlea.state === 'CUT') {
                showCustomAlert(`탄원이 받아들여졌습니다.\n\n격리가 ${myPlea.cut}시간 줄었습니다.`
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            } else if (myPlea.state === 'OUT') {
                showCustomAlert('탄원이 받아들여졌습니다.\n\n나가셔도 좋습니다.'
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            } else if (myPlea.state === 'NO') {
                showCustomAlert('탄원이 반려되었습니다.'
                    + (myPlea.memo ? `\n\n"${myPlea.memo}"` : ''));
            }
            paintPleaBox();
        });
    }, 1500);
})();

// ==========================================
// 사원 쪽 — 격리 안내 칸에 붙인다
// ==========================================
function paintPleaBox() {
    const lock = document.getElementById('quarantine-lock-box');
    if (!lock) return;

    const inside = typeof isQuarantined === 'function' && isQuarantined(currentUser);
    const old = document.getElementById('plea-box');
    if (!inside) { if (old) old.remove(); return; }

    const agent = typeof isBathUser === 'function' && isBathUser(currentUser);
    const color = agent ? '#7fd4d4' : '#d4af37';
    const where = agent ? '초개 요원' : '상담사';

    const st = myPlea && myPlea.state;
    const fresh = myPlea && (Date.now() - (myPlea.at || 0) < 24 * 3600000);

    let inner;
    if (st === 'PENDING' && fresh) {
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">탄원서 접수됨</div>
            <div style="font-size:10px; color:#888; line-height:1.7;">
                ${where}가 읽고 있습니다.<br>
                답이 오면 알려 드리겠습니다.
            </div>`;
    } else if ((st === 'NO' || st === 'CUT' || st === 'OUT') && fresh
               && Date.now() - (myPlea.decidedAt || 0) < PLEA_COOL) {
        const label = st === 'NO' ? '반려되었습니다' : st === 'CUT' ? `${myPlea.cut}시간 줄었습니다` : '풀려났습니다';
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">${label}</div>
            ${myPlea.memo ? `<div style="font-size:11px; color:#ddd; line-height:1.7; padding:8px 10px; background:rgba(0,0,0,0.3); border-radius:4px;">"${myPlea.memo}"</div>` : ''}
            <div style="font-size:10px; color:#666; margin-top:7px;">30분 뒤에 다시 낼 수 있습니다.</div>`;
    } else {
        inner = `
            <div style="font-size:12px; color:${color}; font-weight:bold; margin-bottom:6px;">탄원서</div>
            <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.7;">
                ${where}에게 사정을 적어 보낼 수 있습니다.<br>
                읽고 시간을 줄여 주거나 내보내 줄 수 있습니다.
            </div>
            <button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;
                    background:linear-gradient(145deg,${agent ? '#2a4a5a,#152830' : '#5a4a2a,#3a2f18'}) !important;
                    border-color:${color} !important; color:${color} !important;"
                    onclick="writePlea()">탄원서를 쓴다</button>`;
    }

    const html = `<div id="plea-box" style="border-top:1px dashed ${color}55; margin-top:16px; padding-top:14px; text-align:left;">${inner}</div>`;

    if (old) old.outerHTML = html;
    else lock.insertAdjacentHTML('beforeend', html);
}

function writePlea() {
    if (!database || !currentUser) return;
    if (!isQuarantined(currentUser)) { showCustomAlert('지금은 낼 수 없습니다.'); return; }

    if (myPlea && myPlea.state === 'PENDING' && Date.now() - (myPlea.at || 0) < 24 * 3600000) {
        showCustomAlert('이미 낸 탄원서가 처리되지 않았습니다.');
        return;
    }
    if (myPlea && myPlea.decidedAt && Date.now() - myPlea.decidedAt < PLEA_COOL) {
        const m = Math.ceil((PLEA_COOL - (Date.now() - myPlea.decidedAt)) / 60000);
        showCustomAlert(`아직 ${m}분 남았습니다.`);
        return;
    }

    const agent = isBathUser(currentUser);
    openTextInput('탄원서',
        `${agent ? '초개 요원' : '상담사'}에게 보낼 글입니다.<br>
         <span style="color:#888; font-size:10px;">사정을 적으면 읽고 판단합니다. (최대 ${PLEA_MAX}자)</span>`,
        '예: 맡은 일이 남아 있습니다',
        function (text) {
            const remain = Math.max(0, currentUser.quarantineUntil - Date.now());
            pleaRef(currentUser.code).set({
                code: currentUser.code,
                name: currentUser.name,
                no: currentUser.no,
                text: String(text).slice(0, PLEA_MAX),
                where: agent ? 'bath' : 'fox',
                pollution: currentUser.pollution || 0,
                remainH: Math.round(remain / 3600000 * 10) / 10,
                state: 'PENDING',
                at: Date.now()
            }).then(function () {
                addHistoryLog(currentUser, `[탄원서] ${agent ? '선녀탕' : '여우 상담실'}에서 탄원서를 냈습니다.`);
                saveFields({ history: 1 });
                showCustomAlert('탄원서를 냈습니다.\n\n답을 기다려 주세요.');
                paintPleaBox();
            }).catch(function (e) {
                console.error('탄원 실패:', e);
                showCustomAlert('접수 중 오류가 발생했습니다.');
            });
        });
}

// 격리 안내가 다시 그려질 때마다
(function hookUI() {
    const iv = setInterval(function () {
        if (typeof updateUI !== 'function') return;
        if (updateUI._pleaHooked) { clearInterval(iv); return; }
        const _u = updateUI;
        updateUI = function () {
            const r = _u.apply(this, arguments);
            paintPleaBox();
            return r;
        };
        updateUI._pleaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 상담사 쪽
// ==========================================
function renderPleaList() {
    const box = document.getElementById('admin-plea-list');
    if (!box || !database) return;

    database.ref('pleas').once('value').then(function (snap) {
        const all = snap.val() || {};
        const rows = Object.keys(all).map(c => all[c])
            .filter(v => v && v.state === 'PENDING')
            .sort((a, b) => (a.at || 0) - (b.at || 0));

        if (rows.length === 0) {
            box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:16px 0;">접수된 탄원서가 없습니다.</div>`;
            return;
        }

        box.innerHTML = rows.map(function (v) {
            const u = db.users[v.code];
            const now = u && u.quarantineUntil ? Math.max(0, (u.quarantineUntil - Date.now()) / 3600000) : 0;
            const ago = Math.floor((Date.now() - (v.at || 0)) / 60000);
            const agent = v.where === 'bath';

            return `
                <div style="background:rgba(0,0,0,0.35); border:1px solid ${agent ? '#2a4a5a' : '#5a4a2a'}; border-radius:6px; padding:11px; margin-bottom:9px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; color:#fff; font-weight:bold;">
                                ${v.name} <span style="font-size:10px; color:#888; font-weight:normal;">사번 ${v.no}</span>
                            </div>
                            <div style="font-size:10px; color:${agent ? '#7fd4d4' : '#d4af37'}; margin-top:3px;">
                                ${agent ? '♨ 선녀탕' : '🦊 여우 상담실'} · 오염도 ${v.pollution}% · 남은 격리 ${now.toFixed(1)}시간
                            </div>
                        </div>
                        <div style="font-size:9px; color:#666; flex-shrink:0;">${ago}분 전</div>
                    </div>
                    <div style="font-size:11px; color:#ddd; margin-top:8px; padding:9px 11px; background:rgba(0,0,0,0.35); border-radius:4px; line-height:1.7; word-break:break-all;">
                        ${v.text || '(내용 없음)'}
                    </div>
                    <div style="display:flex; gap:4px; margin-top:9px; flex-wrap:wrap;">
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',1)">-1시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',3)">-3시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px;" onclick="pleaDecide('${v.code}','CUT',6)">-6시간</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px; background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="pleaDecide('${v.code}','OUT',0)">내보냄</button>
                        <button class="game-btn" style="flex:1; min-width:56px; margin:0; padding:7px 3px; font-size:10px; background:linear-gradient(145deg,#c62828,#8e0000) !important; border-color:#7f0000 !important; color:#fff !important;" onclick="pleaDecide('${v.code}','NO',0)">반려</button>
                    </div>
                </div>`;
        }).join('');
    });
}

function pleaDecide(code, kind, hours) {
    if (!database) return;
    const u = db.users[code];
    if (!u) { showCustomAlert('사원을 찾을 수 없습니다.'); return; }

    const finish = function (memo) {
        const patch = {
            state: kind, cut: hours || 0, memo: memo || '',
            by: currentUser.name, decidedAt: Date.now()
        };

        if (kind === 'CUT') {
            const nu = (u.quarantineUntil || 0) - hours * 3600000;
            if (nu <= Date.now()) { kind = 'OUT'; patch.state = 'OUT'; }
            else {
                const tmp = { history: (u.history || []).slice() };
                addHistoryLog(tmp, `[탄원] 받아들여져 격리가 ${hours}시간 줄었습니다.`);
                const f = { quarantineUntil: nu, history: tmp.history };
                if (code === currentUser.code) Object.assign(currentUser, f);
                updateUserFields(code, f);
            }
        }

        if (patch.state === 'OUT') {
            const notes = ((u.badge && u.badge.notes) || '').split(' | ')
                .filter(n => n.trim() && !/의식 불명|긴급 이송|사직 반려/.test(n));
            const badge = Object.assign({}, u.badge || {},
                { notes: notes.length ? notes.join(' | ') : '특이사항 없음' });
            const tmp = { history: (u.history || []).slice() };
            addHistoryLog(tmp, `[탄원] 받아들여져 격리가 풀렸습니다.`);
            const f = {
                quarantineUntil: 0,
                quarantineExitPollution: 0,
                quarantineHospital: false,
                pollution: u.quarantineExitPollution || 0,
                lastPollutionTime: Date.now(),
                foxRoomAnswered: false,
                badge: badge,
                history: tmp.history
            };
            if (code === currentUser.code) Object.assign(currentUser, f);
            updateUserFields(code, f);
        }

        if (kind === 'NO') {
            const tmp = { history: (u.history || []).slice() };
            addHistoryLog(tmp, `[탄원] 반려되었습니다.`);
            updateUserFields(code, { history: tmp.history });
        }

        pleaRef(code).update(patch).then(function () {
            const msg = patch.state === 'OUT' ? '내보냈습니다.'
                      : patch.state === 'CUT' ? `${hours}시간 줄였습니다.`
                      : '반려했습니다.';
            showCustomAlert(`${u.name} 사원 — ${msg}`);
            renderPleaList();
            updateUI();
        });
    };

    openTextInput('한마디',
        `사원에게 함께 전할 말입니다.<br><span style="color:#888; font-size:10px;">비워도 됩니다.</span>`,
        kind === 'NO' ? '예: 조금 더 쉬셔야 합니다' : '예: 다음부터는 조심하세요',
        finish);
}

// 통제 콘솔에 칸을 끼워 넣는다
(function injectPleaPanel() {
    function make() {
        const scr = document.getElementById('admin-screen');
        if (!scr || document.getElementById('admin-plea-box')) return;
        const anchor = scr.querySelector('.action-buttons');
        const html = `
            <div class="admin-panel-box" id="admin-plea-box" style="border-color:#8a6cb3; background-color:#17121f;">
                <h4 style="color:#c9a8ff;">📜 탄원서 심사</h4>
                <div style="font-size:10px; color:#aaa; margin-bottom:10px; line-height:1.5;">
                    상담실·선녀탕에 있는 사원이 보낸 글입니다.<br>
                    시간을 줄여 주거나 바로 내보낼 수 있습니다.
                </div>
                <button class="game-btn" style="width:100%; margin:0 0 9px 0; padding:9px;" onclick="renderPleaList()">새로고침</button>
                <div id="admin-plea-list"></div>
            </div>`;
        if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
        else scr.insertAdjacentHTML('beforeend', html);
    }

    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._pleaHooked) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () { make(); renderPleaList(); }, 140);
            return r;
        };
        openAdminScreen._pleaHooked = true;
        clearInterval(iv);
    }, 500);

    // 탄원이 들어오면 콘솔 버튼에 점
    if (database) {
        const iv2 = setInterval(function () {
            if (!currentUser) return;
            if (currentUser.code !== 'kario0987') { clearInterval(iv2); return; }
            clearInterval(iv2);
            database.ref('pleas').on('value', function (s) {
                const all = s.val() || {};
                const n = Object.keys(all).filter(c => all[c] && all[c].state === 'PENDING').length;
                const btn = document.getElementById('btn-admin-console');
                if (btn && n > 0) btn.classList.add('notify-dot');
                if (document.getElementById('admin-plea-list')) renderPleaList();
            });
        }, 1500);
    }
})();

function pleaState() {
    console.log('내 탄원:', myPlea ? myPlea.state : '없음');
    if (myPlea) console.log(JSON.stringify(myPlea, null, 1));
}

console.log('[탄원서] 적용 — pleaState() 로 확인');