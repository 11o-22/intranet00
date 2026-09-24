// ==========================================
// ★ 속성 변경권 — 자리와 등급 보존
// index.html 에서 newitems.js 다음에 불러온다
// ==========================================
//
// 지운 자리의 번호와 등급을 기억해 두었다가,
// 새로 고른 속성이 그 자리에 같은 등급으로 들어간다.

// --- 지울 때 ---
(function hookReattr() {
    if (typeof doGearReattr !== 'function') return;
    const _do = doGearReattr;

    doGearReattr = function (attr, itemName) {
        const g = getGear(currentUser);
        if (!g || !g.attrs) return _do.apply(this, arguments);

        const idx = g.attrs.indexOf(attr);
        if (idx < 0) return _do.apply(this, arguments);

        // 뒤 칸들의 등급을 먼저 못박아 둔다 (밀려도 안 내려가게)
        if (!g.attrGrades) g.attrGrades = {};
        g.attrs.forEach(function (a, i) {
            if (i > 0 && !g.attrGrades[a]) g.attrGrades[a] = gearAttrGrade(g, a);
        });

        currentUser.gearReattrIdx = idx;
        currentUser.gearReattrGrade = gearAttrGrade(g, attr);

        return _do.apply(this, arguments);
    };
})();

// --- 새로 새길 때 ---
(function hookPick() {
    if (typeof pickGearAttr !== 'function') return;
    const _pick = pickGearAttr;

    pickGearAttr = function (attr) {
        const g = getGear(currentUser);
        const idx = currentUser ? currentUser.gearReattrIdx : undefined;
        const keep = currentUser ? currentUser.gearReattrGrade : undefined;
        const usedBlank = !!(currentUser && currentUser.gearBlank);
        const waiting = (idx !== undefined && idx !== null && keep);

        const r = _pick.apply(this, arguments);

        if (!waiting || !g || !g.attrs || !g.attrs.includes(attr)) return r;

        // 맨 뒤에 붙은 것을 원래 자리로 되돌린다
        g.attrs = g.attrs.filter(a => a !== attr);
        g.attrs.splice(idx, 0, attr);

        if (!g.attrGrades) g.attrGrades = {};

                if (idx === 0) {
            // 첫 칸은 메인 — 본체 등급을 그대로 따른다
            delete g.attrGrades[attr];
        } else {
            // 두세 번째 칸은 언제나 D부터. 빈 각인지를 썼을 때만 C.
            g.attrGrades[attr] = usedBlank ? 'C' : 'D';
        }

        const grade = (idx === 0) ? g.grade : g.attrGrades[attr];

        delete currentUser.gearReattrIdx;
        delete currentUser.gearReattrGrade;

        addHistoryLog(currentUser, `[속성 변경] ${GEAR_ATTRS[attr].name}이(가) ${idx + 1}번째 자리에 ${grade}등급으로 새겨졌습니다.`);
        saveSelfFull();
        updateUI();
        return r;
    };
})();

// --- 지우는 화면에 자리와 등급 표시 ---
(function hookModal() {
    if (typeof openGearReattr !== 'function') return;
    const _open = openGearReattr;

    openGearReattr = function (itemName) {
        const g = getGear(currentUser);
        if (!g || !g.attrs || g.attrs.length === 0) return _open.apply(this, arguments);

        const html = `
            <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:13px;">
                지울 속성을 고르세요.<br>
                <span style="color:#4CAF50;">자리는 그대로 남습니다.</span> 첫 번째 자리는 본체 등급을 따르고, 두세 번째 자리는 D등급부터 다시 시작합니다.<br>
                <span style="color:#ff9800;">변경권은 즉시 소모됩니다.</span>
            </div>` +
            g.attrs.map(function (a, i) {
                const gr = gearAttrGrade(g, a);
                return `
                    <div style="border:1px solid #4a3a6a; border-radius:6px; padding:11px; margin-bottom:8px;">
                        <div style="font-size:10px; color:#888; margin-bottom:4px;">${i + 1}번째 자리</div>
                        <div style="font-size:13px; color:#d4bbff; font-weight:bold;">
                            ${GEAR_ATTRS[a].icon} ${GEAR_ATTRS[a].name}
                            <span style="color:#fff; font-size:11px; margin-left:5px;">${gr}등급</span>
                        </div>
                        <div style="font-size:10px; color:#999; margin:5px 0 8px 0;">${GEAR_ATTRS[a].desc}</div>
                        <button class="game-btn" style="width:100%; margin:0; padding:8px; font-size:11px;" onclick="doGearReattr('${a}','${itemName}')">이 자리를 비운다${i === 0 ? '' : ' (D등급부터 다시)'}</button>
                    </div>`;
            }).join('');

        openGearModal('속성 변경', html);
    };
})();

// --- 비워 둔 자리 안내 ---
(function hookPickModal() {
    if (typeof openGearAttrPick !== 'function') return;
    const _open = openGearAttrPick;

    openGearAttrPick = function () {
        const r = _open.apply(this, arguments);
        const idx = currentUser ? currentUser.gearReattrIdx : undefined;
        const keep = currentUser ? currentUser.gearReattrGrade : undefined;
        if (idx === undefined || idx === null || !keep) return r;

        const body = document.getElementById('gear-modal-body');
        if (!body) return r;
        body.insertAdjacentHTML('afterbegin',
            `<div style="background:rgba(76,175,80,0.08); border:1px solid #2e7d32; border-radius:6px; padding:10px; margin-bottom:11px; font-size:11px; color:#a5d6a7; line-height:1.7;">
                <b>${idx + 1}번째 자리</b>가 비어 있습니다.<br>
             고른 속성이 그 자리에 <b>${idx === 0 ? '본체 등급' : (currentUser.gearBlank ? 'C등급' : 'D등급')}</b>으로 들어갑니다.
             </div>`);
        return r;
    };
})();

console.log('[속성 변경] 자리·등급 보존 적용');