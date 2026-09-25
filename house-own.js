// ==========================================
// ★ 사택 — 소유 등급과 이용 등급 분리
// index.html 에서 frames.js 다음에 불러온다
// ==========================================
//
// 소유 등급 : house.grade  (내 돈으로 올린 것. 룸메가 바뀌어도 안 변한다)
// 이용 등급 : houseGrade() (둘 중 높은 쪽. 같이 사는 동안만)

// --- 소유 등급 ---
function ownGrade(user) {
    const h = getHouse(user);
    return h.grade || 'D';
}

// --- 승급 시 소유 등급만 올린다 ---
(function fixUpgrade() {
    ['houseUpgrade', 'doHouseUpgrade', 'upgradeHouse'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const before = ownGrade(currentUser);
            const r = _f.apply(this, arguments);
            setTimeout(function () {
                const h = getHouse(currentUser);
                const cur = HOUSE_GRADES.indexOf(h.grade);
                const b = HOUSE_GRADES.indexOf(before);
                // 룸메 등급을 따라 뛰어오른 경우 되돌린다
                if (cur > b + 1) {
                    h.grade = HOUSE_GRADES[b + 1];
                    saveSelfFull();
                    updateUI();
                }
            }, 120);
            return r;
        };
    });
})();

// --- 화면에 소유·이용을 함께 표시 ---
(function showBoth() {
    if (typeof renderHouse !== 'function') return;
    const _r = renderHouse;
    renderHouse = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('house-main-body');
            if (!box || !currentUser || document.getElementById('house-owninfo')) return;
            const own = ownGrade(currentUser);
            const use = houseGrade(currentUser);
            const mate = getRoomie(currentUser);
            if (own === use && !mate) return;

            box.insertAdjacentHTML('afterbegin', `
                <div id="house-owninfo" style="background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:10px 12px; margin-bottom:11px; font-size:11px; line-height:1.8;">
                    내 명의 <b style="color:#c9a8ff;">${own}급</b> · ${HOUSE_INFO[own].name}
                    ${own !== use ? `<br>지금 쓰는 곳 <b style="color:#ffd700;">${use}급</b> · ${HOUSE_INFO[use].name}
                    <div style="font-size:10px; color:#888; margin-top:4px;">${mate ? mate.name + ' 사원의 집에 얹혀 있습니다. 나가면 ' + own + '급으로 돌아갑니다.' : ''}</div>` : ''}
                </div>`);
        }, 80);
        return r;
    };
})();

// ==========================================
// 상담사 콘솔 — 등급 조절
// ==========================================
function adminSetHouseGrade(g) {
    const targets = getAdminTargets();
    if (targets.length === 0) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
    if (HOUSE_GRADES.indexOf(g) < 0) return;

    const done = [];
    const jobs = targets.map(function (code) {
        const u = db.users[code];
        if (!u) return null;
        if (!u.house) u.house = {};
        u.house.grade = g;
        const tmp = { history: (u.history || []).slice() };
        addHistoryLog(tmp, `[당국 개입] 사택 등급이 ${g}급(${HOUSE_INFO[g].name})으로 조정되었습니다.`);
        u.history = tmp.history;
        done.push(u.name);
        if (code === currentUser.code) {
            currentUser.house.grade = g;
            currentUser.history = tmp.history;
        }
        return updateUserFields(code, { house: u.house, history: tmp.history });
    }).filter(Boolean);

    Promise.all(jobs).then(function () {
        updateUI();
        renderAdminRoomList();
        showCustomAlert(`${done.length}명의 사택을 ${g}급으로 조정했습니다.\n(${done.join(', ')})`);
    });
}

(function addAdminPanel() {
    function put() {
        const list = document.getElementById('admin-room-list');
        if (!list || document.getElementById('admin-house-grade')) return;
        list.insertAdjacentHTML('beforebegin', `
            <div id="admin-house-grade" style="border-top:1px dashed #00838f; margin-top:11px; padding-top:11px;">
                <div style="font-size:10px; color:#4dd0e1; font-weight:bold; margin-bottom:6px;">사택 등급 조정</div>
                <div style="font-size:10px; color:#aaa; margin-bottom:8px; line-height:1.5;">
                    위 대상 목록에서 선택한 뒤 누르세요. 명의 등급이 바뀝니다.
                </div>
                <div style="display:flex; gap:4px;">
                    ${HOUSE_GRADES.map(g => `<button class="game-btn" style="flex:1; margin:0; padding:8px 4px; font-size:11px;" onclick="adminSetHouseGrade('${g}')">${g}급</button>`).join('')}
                </div>
            </div>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
    if (typeof openAdminScreen === 'function') {
        const _o = openAdminScreen;
        openAdminScreen = function () {
            const r = _o.apply(this, arguments);
            setTimeout(put, 120);
            return r;
        };
    }
})();

// ==========================================
// 배정 목록에 명의 표시
// ==========================================
(function hookRoomList() {
    if (typeof renderAdminRoomList !== 'function') return;
    const _r = renderAdminRoomList;
    renderAdminRoomList = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('admin-room-list');
            if (!box) return;
            box.querySelectorAll('[data-code]').forEach(function (el) {
                const u = db.users[el.getAttribute('data-code')];
                if (!u) return;
                el.insertAdjacentHTML('beforeend',
                    `<div style="font-size:9px; color:#888;">명의 ${ownGrade(u)}급</div>`);
            });
        }, 60);
        return r;
    };
})();

console.log('[사택] 소유 등급 분리 적용');