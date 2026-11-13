// ==========================================
// ★ 속성 변경권 — 자리와 등급 보존
// index.html 에서 newitems.js 다음에 불러온다
// ==========================================
//
// 지운 자리의 번호와 등급을 기억해 두었다가,
// 새로 고른 속성이 그 자리에 같은 등급으로 들어간다.

// ★ 비운 자리의 기억 (2026-11-13 고침 — 「세번째 자리로 속성 추가하면 1 속성이 2 속성으로 밀리는 오류」)
//
//   ✗ 전에는 currentUser.gearReattrIdx · gearReattrGrade 두 칸에 적고, 새로 새긴 뒤 delete 로 지웠다.
//     그런데 저장은 「지금 있는 칸」만 서버에 보낸다 (index.html saveSelfFull · save-merge.js diffPayload).
//     지운 칸은 보내지지 않아 **서버에는 기억이 그대로 남았고**, 다시 들어오면 되살아났다.
//     그래서 속성을 한 번이라도 바꿔 본 사원이 나중에 새 자리(세 번째 자리 …)를 열어 속성을 새기면,
//     새 속성이 「예전에 비웠던 자리」로 끼어들었다 — 첫 자리였으면 새 속성이 메인(본체 등급)이 되고
//     원래 첫 속성은 둘째로 밀려 D 로 보였다.
//     거꾸로 첫 자리(0번)를 비운 기억은 서버에 안 적혔다 (save-merge 는 0 을 「없는 칸」과 같게 본다).
//     비운 채로 다시 들어오면 자리를 잊어, 새 속성이 맨 뒤에 붙었다.
//
//   이제는 한 칸에 적는다 — currentUser.gearReattr = { i: 비운 자리, g: 그 자리의 등급, n: 비운 직후 속성 수, at }
//     · 새길 때 「지금 속성 수 = n」 일 때만 그 자리로 되돌린다. 그 사이 다 채웠거나 달라졌으면 묵은 기억이다 → 버린다.
//     · 지울 때는 null 을 적고 서버 칸도 바로 지운다.
//     · 예전 두 칸은 보이는 대로 지운다 (비운 것인지 묵은 것인지 가를 길이 없다 → 묵은 것으로 본다).
function reattrMem(g) {
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    const m = u && u.gearReattr;
    if (!m || typeof m !== 'object' || !g) return null;
    const i = Number(m.i), n = Number(m.n), len = (g.attrs || []).length;
    if (!(i >= 0) || !(n >= 0) || i > n || n !== len) return null;
    return { i: i, g: m.g || 'D', n: n };
}
function reattrForget() {
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) return false;
    const had = (u.gearReattr !== undefined && u.gearReattr !== null);
    const old = (u.gearReattrIdx !== undefined && u.gearReattrIdx !== null) || !!u.gearReattrGrade;
    if (had) u.gearReattr = null;
    delete u.gearReattrIdx;
    delete u.gearReattrGrade;
    if (had || old) {
        try {
            if (typeof database !== 'undefined' && database) {
                const ref = database.ref('users/' + u.code);
                if (had) ref.child('gearReattr').remove();
                ref.child('gearReattrIdx').remove();
                ref.child('gearReattrGrade').remove();
            }
        } catch (e) { }
    }
    return had || old;
}
// 예전 두 칸 — 들어온 뒤 보이면 지운다
setInterval(function () {
    try {
        const u = (typeof currentUser !== 'undefined') ? currentUser : null;
        if (!u) return;
        if ((u.gearReattrIdx !== undefined && u.gearReattrIdx !== null) || u.gearReattrGrade) {
            const keep = u.gearReattr;
            reattrForget();
            if (keep) u.gearReattr = keep;                    // 새 기억은 그대로 둔다
            console.log('[속성 변경] 묵은 자리 기억을 지웠습니다.');
        }
    } catch (e) { }
}, 3000);
window.reattrMemState = function () {
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) { console.log('로그인 후에 쓰세요.'); return; }
    const g = (typeof getGear === 'function') ? getGear(u) : null;
    console.log('  비운 자리 기억:', JSON.stringify(u.gearReattr || null), '· 지금 쓰이나:', reattrMem(g) ? 'O' : '✗',
        '· 예전 칸:', JSON.stringify({ idx: u.gearReattrIdx, grade: u.gearReattrGrade }));
};

// 상담사 — 위 오류로 이미 밀린 장비를 되돌린다 (콘솔 · 이름이나 사번)
//   첫 자리에 끼어든 속성을 맨 뒤로 보내 D 로 두고, 둘째로 밀렸던 속성을 다시 첫 자리(본체 등급)로 올린다.
//   gearMainBack('사원')          무엇이 어떻게 바뀔지 보기만 한다
//   gearMainBack('사원', true)    실제로 바꾼다
window.gearMainBack = function (who, go) {
    const me = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) || {};
    const code = Object.keys(book).filter(function (c) { const x = book[c] || {}; return x.name === who || String(x.no) === String(who); })[0];
    if (!code) { console.warn('사원을 못 찾았습니다 (이름 · 사번).'); return; }
    const t = book[code], g = (typeof getGear === 'function') ? getGear(t) : null;
    if (!g || !Array.isArray(g.attrs) || g.attrs.length < 2) { console.warn('속성이 둘 이상인 전용 장비가 아닙니다.'); return; }
    const nm = function (a) { return (typeof GEAR_ATTRS !== 'undefined' && GEAR_ATTRS[a]) ? GEAR_ATTRS[a].name : a; };
    const show = function (x) { return x.attrs.map(function (a) { return nm(a) + ' ' + gearAttrGrade(x, a); }).join(' · '); };
    const was = show(g);
    const head = g.attrs[0];
    const next = { attrs: g.attrs.slice(1).concat([head]), grade: g.grade, attrGrades: Object.assign({}, g.attrGrades || {}), giftSlots: g.giftSlots, slots: g.slots, slotsReal: g.slotsReal };
    next.attrGrades[head] = 'D';
    delete next.attrGrades[next.attrs[0]];
    console.log((t.name || '') + ' — ' + was + '  →  ' + show(next) + (go ? '' : '   (보기만 했습니다 — 바꾸려면 두 번째 값에 true)'));
    if (!go) return;
    g.attrs = next.attrs;
    g.attrGrades = next.attrGrades;
    try {
        if (typeof updateUserFields === 'function') updateUserFields(code, { soulGear: JSON.parse(JSON.stringify(g)) });
        console.log('%c✓ 바꿨습니다.', 'color:#4CAF50');
    } catch (e) { console.warn('적지 못했습니다.', e); }
};

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

        const before = g.attrs.length;
        const was = currentUser.gearReattr;
        delete currentUser.gearReattrIdx;
        delete currentUser.gearReattrGrade;
        currentUser.gearReattr = { i: idx, g: gearAttrGrade(g, attr), n: before - 1, at: Date.now() };

        const r = _do.apply(this, arguments);

        // 지워지지 않았으면 (안쪽에서 막혔다) 기억도 되돌린다
        const g2 = getGear(currentUser);
        if (!g2 || (g2.attrs || []).length !== before - 1) currentUser.gearReattr = (was === undefined ? null : was);
        return r;
    };
})();

// --- 새로 새길 때 ---
(function hookPick() {
    if (typeof pickGearAttr !== 'function') return;
    const _pick = pickGearAttr;

    pickGearAttr = function (attr) {
        const g = getGear(currentUser);
        const mem = reattrMem(g);                              // 새기기 전의 장비에 맞는 기억만
        const usedBlank = !!(currentUser && currentUser.gearBlank);
        const n0 = (g && g.attrs) ? g.attrs.length : 0;

        const r = _pick.apply(this, arguments);

        // 정말 새겨졌을 때만 (맨 뒤에 하나 붙었다)
        if (!g || !g.attrs || g.attrs.length !== n0 + 1 || g.attrs[n0] !== attr) return r;

        const stale = reattrForget();                          // 쓴 기억이든 묵은 기억이든 여기서 끝낸다
        if (!mem) { if (stale) { try { saveSelfFull(); } catch (e) { } } return r; }
        const idx = mem.i;

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
        const mem = reattrMem(getGear(currentUser));
        if (!mem) return r;
        const idx = mem.i;

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