// ==========================================
// ★ 각성 돌파권 — 자리별로 따로 적용
// index.html 에서 reattr.js 다음에 불러온다
// ==========================================
//
// 본체 · 2번째 속성 · 3번째 속성에 각각 한 장씩 필요하다.

// --- 기존 값 옮기기 (true → 본체만 각성) ---
(function migrate() {
    if (!currentUser) return;
    if (currentUser.gearAwakened === true) currentUser.gearAwakened = { 0: true };
})();

function awakenBag() {
    if (!currentUser) return {};
    if (currentUser.gearAwakened === true) currentUser.gearAwakened = { 0: true };
    if (!currentUser.gearAwakened || typeof currentUser.gearAwakened !== 'object') currentUser.gearAwakened = {};
    return currentUser.gearAwakened;
}
function isAwakened(idx) {
    return !!awakenBag()[idx];
}
function slotGrade(idx) {
    const g = getGear(currentUser);
    if (!g) return null;
    if (idx === 0) return g.grade;
    const a = (g.attrs || [])[idx];
    return a ? gearAttrGrade(g, a) : null;
}
function slotName(idx) {
    const g = getGear(currentUser);
    if (!g) return '';
    if (idx === 0) return '본체';
    const a = (g.attrs || [])[idx];
    return a ? `${GEAR_ATTRS[a].icon} ${GEAR_ATTRS[a].name}` : `${idx + 1}번째 자리`;
}

// --- 돌파권 사용 ---
(function hookUse() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'awaken') return _use.apply(this, arguments);

        const g = getGear(currentUser);
        if (!g) { showCustomAlert('전용 장비가 없습니다.'); return; }

        const list = [];
        for (let i = 0; i < (g.slots || 1); i++) {
            const gr = slotGrade(i);
            if (!gr) continue;
            list.push({ idx: i, grade: gr, done: isAwakened(i) });
        }

        const usable = list.filter(x => x.grade === 'S' && !x.done);
        if (usable.length === 0) {
            const why = list.some(x => x.grade === 'S' && x.done)
                ? '이미 한계를 넘은 자리뿐입니다.'
                : 'S등급인 자리가 없습니다.';
            showCustomAlert(why + '\n\n각성 돌파권은 S등급 자리에만 쓸 수 있습니다.');
            return;
        }

        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                어느 자리의 한계를 풀지 고르세요.<br>
                <span style="color:#ff9800;">자리마다 따로 필요합니다.</span> 한 장은 한 자리에만 쓰입니다.
            </div>` +
            list.map(x => {
                const ok = x.grade === 'S' && !x.done;
                return `
                    <div style="border:1px solid ${ok ? '#4a3a6a' : '#333'}; border-radius:6px; padding:11px; margin-bottom:8px; ${ok ? '' : 'opacity:0.4;'}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:13px; color:#d4bbff; font-weight:bold;">${slotName(x.idx)}</span>
                            <span style="font-size:12px; color:#fff;">${x.grade}등급</span>
                        </div>
                        <div style="font-size:10px; color:#888; margin:5px 0 8px 0;">
                            ${x.done ? '이미 한계를 넘었습니다.' : x.grade === 'S' ? 'L등급 승급이 열립니다.' : 'S등급이어야 합니다.'}
                        </div>
                        <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;" onclick="doAwaken(${x.idx},'${itemName}')" ${ok ? '' : 'disabled'}>
                            ${x.done ? '각성 완료' : ok ? '이 자리를 푼다' : '조건 미달'}
                        </button>
                    </div>`;
            }).join('');

        openGearModal('각성 돌파권', html);
    };
})();

function doAwaken(idx, itemName) {
    const g = getGear(currentUser);
    if (!g) return;
    if (slotGrade(idx) !== 'S') { showCustomAlert('S등급 자리에만 쓸 수 있습니다.'); return; }
    if (isAwakened(idx)) { showCustomAlert('이미 한계를 넘은 자리입니다.'); return; }
    if (!(currentUser.inventory || []).includes(itemName)) { showCustomAlert('돌파권이 없습니다.'); return; }

    awakenBag()[idx] = true;
    removeItemFromInventory(currentUser, itemName, 1);
    addHistoryLog(currentUser, `[각성] '${g.name}'의 ${slotName(idx)} 한계가 풀렸습니다.`);
    saveSelfFull();
    closeGearModal();
    updateUI();
    showCustomAlert(`무언가가 풀리는 소리가 났습니다.\n\n${slotName(idx)} — 이제 L등급으로 올릴 수 있습니다.`);
}

// --- 승급 차단 ---
(function hookUpgrade() {
    if (typeof tryGearUpgrade !== 'function') return;
    const _try = tryGearUpgrade;
    tryGearUpgrade = function (idx) {
        if (slotGrade(idx) === 'S' && !isAwakened(idx)) {
            showCustomAlert(`${slotName(idx)}은(는) 아직 한계에 막혀 있습니다.\n\n각성 돌파권을 그 자리에 써야 합니다.`);
            return;
        }
        return _try.apply(this, arguments);
    };
})();

// --- 강화 화면에 표시 ---
(function hookPanel() {
    if (typeof openGearUpgrade !== 'function') return;
    const _open = openGearUpgrade;
    openGearUpgrade = function () {
        const r = _open.apply(this, arguments);
        try {
            const g = getGear(currentUser);
            if (!g) return r;
            const body = document.getElementById('gear-modal-body');
            if (!body) return r;
            const boxes = body.querySelectorAll('div[style*="border:1px solid #4a3a6a"]');
            boxes.forEach(function (box, i) {
                if (slotGrade(i) !== 'S') return;
                const tag = isAwakened(i)
                    ? `<div style="font-size:10px; color:#4CAF50; margin-top:6px;">◈ 한계 해제됨 — L등급 승급 가능</div>`
                    : `<div style="font-size:10px; color:#ff9800; margin-top:6px;">◈ 각성 돌파권이 필요합니다</div>`;
                box.insertAdjacentHTML('beforeend', tag);
                if (!isAwakened(i)) {
                    const btn = box.querySelector('button');
                    if (btn) { btn.disabled = true; btn.innerText = '한계에 막힘'; }
                }
            });
        } catch (e) {}
        return r;
    };
})();

console.log('[각성 돌파권] 자리별 적용');