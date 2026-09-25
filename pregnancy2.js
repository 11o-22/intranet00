// ==========================================
// ★ 임신 — 돌봄 · 출산 · 이송
// index.html 에서 pregnancy.js 다음에 불러온다
// ==========================================

const CARE_GAP = 6 * 3600000;      // 6시간
const CARE_GRACE = 30 * 60000;     // 30분 유예

// ==========================================
// 돌봄 화면
// ==========================================
function openCarePanel(code) {
    const t = db.users[code];
    if (!t || !isPregnant(t)) return;
    const p = pregOf(t);
    const last = (p.careAt || {})[currentUser.code] || 0;
    if (Date.now() - last < CARE_GAP) {
        const m = Math.ceil((last + CARE_GAP - Date.now()) / 60000);
        showCustomAlert(`아직 이릅니다.\n${m}분 뒤에 다시 오세요.`);
        return;
    }

    const inv = currentUser.inventory || [];
    const owned = Object.keys(PREG_ITEMS).filter(n => inv.includes(n));

    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.8; margin-bottom:13px;">
            <b style="color:#ff8fb1;">${t.name}</b> 사원을 돌봅니다.<br>
            포인트를 쓰거나, 사택에서 산 물건을 쓸 수 있습니다.<br>
            <span style="color:#ff9800;">6시간 안에 돌보지 않으면 당신이 상담실로 갑니다.</span>
        </div>

        <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px; margin-bottom:9px;">
            <div style="font-size:12px; color:#c9a8ff; font-weight:bold; margin-bottom:7px;">포인트로</div>
            <div style="font-size:10px; color:#888; margin-bottom:8px;">보유 ${currentUser.points.toLocaleString()} P</div>
            <div style="display:flex; gap:5px;">
                ${[500, 1200, 3000].map(v => `
                    <button class="game-btn" style="flex:1; margin:0; padding:9px 4px; font-size:11px;" onclick="doCare('${code}', ${v}, '')" ${currentUser.points >= v ? '' : 'disabled'}>
                        ${v.toLocaleString()} P
                    </button>`).join('')}
            </div>
        </div>

        <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px;">
            <div style="font-size:12px; color:#c9a8ff; font-weight:bold; margin-bottom:7px;">물건으로</div>
            ${owned.length ? owned.map(n => {
                const cnt = inv.filter(x => x === n).length;
                return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:5px; padding:8px 10px; margin-bottom:5px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:11px; color:#fff;">${n} <span style="color:#888;">x${cnt}</span></div>
                        <div style="font-size:9px; color:#888;">${PREG_ITEMS[n].care}회분</div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px;" onclick="doCare('${code}', 0, '${n}')">쓴다</button>
                </div>`;
            }).join('') : '<div style="font-size:10px; color:#666;">가진 물건이 없습니다. 사택 매점에서 살 수 있습니다.</div>'}
        </div>`;

    openGearModal('돌봄', html);
}

function doCare(code, cost, item) {
    if (!buyGuard()) return;
    const t = db.users[code];
    if (!t || !isPregnant(t)) return;
    const p = pregOf(t);

    let uses = 1;
    if (item) {
        if (!(currentUser.inventory || []).includes(item)) { showCustomAlert('그 물건이 없습니다.'); return; }
        uses = PREG_ITEMS[item] ? PREG_ITEMS[item].care : 1;
        removeItemFromInventory(currentUser, item, 1);
    } else {
        if (currentUser.points < cost) { showLuxuryAlert(); return; }
        currentUser.points -= cost;
        uses = cost >= 3000 ? 3 : cost >= 1200 ? 2 : 1;
    }

    if (!p.careAt) p.careAt = {};
    p.careAt[currentUser.code] = Date.now() + (uses - 1) * CARE_GAP;
    if (!p.careCount) p.careCount = {};
    p.careCount[currentUser.code] = (p.careCount[currentUser.code] || 0) + uses;

    t.preg = p;
    addHistoryLog(currentUser, `[돌봄] ${t.name} 사원을 돌봤습니다. (${uses}회분)`);
    addHistoryLog(t, `[돌봄] ${currentUser.name} 사원이 들렀습니다.`);
    t.satiety = Math.min(100, (t.satiety || 100) + 5);
    t.pollution = Math.max(0, (t.pollution || 0) - 3);

    updateUserFields(code, { preg: p, history: t.history, satiety: t.satiety, pollution: t.pollution });
    saveFields({ points: 1, inventory: 1, history: 1 });
    closeGearModal();
    updateUI();
    showCustomAlert(`${t.name} 사원을 돌봤습니다.\n\n다음 돌봄까지 ${uses * 6}시간입니다.`);
}

// ==========================================
// 방치 감시 — 아버지가 상담실로
// ==========================================
function checkPregNeglect() {
    if (!currentUser || !database) return;
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !isPregnant(u)) return;
        const p = pregOf(u);
        (p.sires || []).forEach(function (s) {
            if (s.code !== currentUser.code) return;
            const last = (p.careAt || {})[currentUser.code] || s.at || 0;
            if (Date.now() - last < CARE_GAP + CARE_GRACE) return;
            if (currentUser.quarantineUntil && Date.now() < currentUser.quarantineUntil) return;

            currentUser.quarantineUntil = Date.now() + 3 * 3600000;
            currentUser.quarantineExitPollution = 30;
            currentUser.quarantineHospital = false;
            currentUser.foxRoomAnswered = true;
            if (!p.careAt) p.careAt = {};
            p.careAt[currentUser.code] = Date.now();
            u.preg = p;

            addHistoryLog(currentUser, `[방치] ${u.name} 사원을 돌보지 않아 상담실로 이송되었습니다.`);
            updateUserFields(c, { preg: p });
            saveFields({ quarantineUntil: 1, quarantineExitPollution: 1, foxRoomAnswered: 1, history: 1 });
            updateUI();
            showCustomAlert(`${u.name} 사원을 오래 돌보지 않았습니다.\n\n상담실로 이송됩니다. (3시간)`);
        });
    });
}

// ==========================================
// 출산
// ==========================================
function checkPregBirth() {
    if (!currentUser || !database) return;
    if (!isPregnant(currentUser)) return;
    const p = pregOf(currentUser);
    if (Date.now() < p.due) return;
    if (currentUser._birthing) return;
    currentUser._birthing = true;

    const sires = p.sires || [];
    const n = sires.length;
    const count = n >= 5 ? 5 : n >= 2 ? Math.min(n, 4) : (1 + Math.floor(Math.random() * 3));

    const got = [];
    for (let i = 0; i < count; i++) {
        const other = sires[i % n];
        const oUser = other ? db.users[other.code] : null;
        got.push(rollBirthItem(currentUser, oUser));
    }

    got.forEach(x => currentUser.inventory.push(x));

    // 특이사항 정리
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ').filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    currentUser.preg = null;

    addHistoryLog(currentUser, `[출산] ${count}개가 나왔습니다. (${got.join(', ')})`);
    saveSelfFull();
    updateUI();

    // 아버지들에게도
    sires.forEach(function (s, i) {
        const f = db.users[s.code];
        if (!f) return;
        const item = got[i % got.length];
        if (!f.inventory) f.inventory = [];
        f.inventory.push(item);
        addHistoryLog(f, `[출산] ${currentUser.name} 사원에게서 '${item}'이(가) 나왔습니다.`);
        updateUserFields(s.code, { inventory: f.inventory, history: f.history });
    });

    pregBroadcast(`<b style="color:#ff8fb1;">${currentUser.name}</b> 사원이 ${count}개를 낳았습니다.`);
    showCustomAlert(`나왔습니다.\n\n${got.join('\n')}\n\n아버지들에게도 하나씩 갔습니다.`);
    setTimeout(function () { if (currentUser) currentUser._birthing = false; }, 5000);
}

// ==========================================
// 물약 만료 시 임신 해제
// ==========================================
function checkPregPotion() {
    if (!currentUser || !isPregnant(currentUser)) return;
    if (genderOf(currentUser) === '여성') return;
    if (canBear(currentUser)) return;

    const p = pregOf(currentUser);
    (p.sires || []).forEach(function (s) {
        const f = db.users[s.code];
        if (!f) return;
        addHistoryLog(f, `[임신 해제] ${currentUser.name} 사원의 몸이 조건을 잃었습니다.`);
        updateUserFields(s.code, { history: f.history });
    });

    currentUser.preg = null;
    if (currentUser.badge && currentUser.badge.notes) {
        const arr = currentUser.badge.notes.split(' | ').filter(x => x.trim() && !/아이를 임신했습니다/.test(x));
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    addHistoryLog(currentUser, `[임신 해제] 물약의 효과가 끝나 임신 상태가 사라졌습니다.`);
    saveSelfFull();
    updateUI();
    showCustomAlert('몸이 돌아왔습니다.\n임신 상태가 사라졌습니다.');
}

setInterval(function () {
    if (!currentUser) return;
    checkPregBirth();
    checkPregPotion();
    checkPregNeglect();
}, 60000);
setTimeout(function () {
    if (!currentUser) return;
    checkPregBirth();
    checkPregPotion();
}, 4000);

// ==========================================
// 사택 매점 비치
// ==========================================
(function hookStore() {
    function put() {
        const box = document.getElementById('house-main-body');
        if (!box || !currentUser || document.getElementById('preg-store')) return;
        if (box.innerHTML.length < 50) return;

        const rows = Object.keys(PREG_ITEMS).map(function (n) {
            const it = PREG_ITEMS[n];
            return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border-radius:5px; padding:8px 10px; margin-bottom:5px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:#fff;">${n}</div>
                    <div style="font-size:9px; color:#888;">${it.d}</div>
                </div>
                <button class="game-btn" style="margin:0; padding:6px 11px; font-size:10px; flex-shrink:0;" onclick="buyPregItem('${n}')">${it.price.toLocaleString()} P</button>
            </div>`;
        }).join('');

        box.insertAdjacentHTML('beforeend', `
            <div id="preg-store" style="border:1px solid #c2185b; border-radius:6px; padding:12px; margin-top:13px; background:rgba(194,24,91,0.05);">
                <div style="font-size:11px; color:#ff8fb1; font-weight:bold; margin-bottom:8px;">🤍 돌봄 용품</div>
                <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.6;">
                    임신한 사원을 돌볼 때 씁니다. 여러 번치를 한 번에 채울 수 있습니다.
                </div>
                ${rows}
            </div>`);
    }
    if (typeof renderHouse === 'function') {
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            setTimeout(put, 90);
            return r;
        };
    }
    setTimeout(put, 1500);
})();

function buyPregItem(n) {
    if (!buyGuard()) return;
    const it = PREG_ITEMS[n];
    if (!it) return;
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 살 수 없습니다.'); return; }
    if (currentUser.points < it.price) { showLuxuryAlert(); return; }
    currentUser.points -= it.price;
    currentUser.inventory.push(n);
    addHistoryLog(currentUser, `[사택 매점] ${n} 구입 (-${it.price} P)`);
    saveFields({ points: 1, inventory: 1, history: 1 });
    updateUI();
    showCustomAlert(`${n}을(를) 샀습니다.`);
}

// ==========================================
// 내 방에 임신 상태 표시
// ==========================================
(function showMyPreg() {
    if (typeof renderHouse !== 'function') return;
    const _r = renderHouse;
    renderHouse = function () {
        const r = _r.apply(this, arguments);
        setTimeout(function () {
            const box = document.getElementById('house-main-body');
            if (!box || !currentUser || document.getElementById('my-preg-box')) return;
            if (!isPregnant(currentUser)) return;
            const p = pregOf(currentUser);
            const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
            box.insertAdjacentHTML('afterbegin', `
                <div id="my-preg-box" style="background:rgba(194,24,91,0.08); border:1px solid #c2185b; border-radius:6px; padding:11px; margin-bottom:11px; font-size:11px; line-height:1.9;">
                    <b style="color:#ff8fb1;">임신 중</b> · 출산까지 <b>${left}시간</b><br>
                    아버지 ${p.sires.map(s => s.name).join(', ')}<br>
                    <span style="font-size:10px; color:#888;">나오는 수는 아버지 수에 따라 정해집니다.</span>
                </div>`);
        }, 70);
        return r;
    };
})();

console.log('[임신] 돌봄 · 출산 · 이송 적용');