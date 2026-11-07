// ==========================================
// ★ 상담사 — 착용 장비를 하나씩 골라 빼기
// bundles.json — dokkaebi-bat.js 다음 · 단추는 index.html 「장비 강제 회수」 줄 아래
// ==========================================
//
// 2026-11-06 사용자 「그리고 착용하고 있는 장비도 상담사 권한으로 골라서 제거가 가능하게 해줘. 개별로.」
//
//   [장비 조회]  고른 사원(들)이 차고 있는 장비를 줄마다 불러온다
//   [해제]      그 하나만 뺀다 — 물건은 채워 준 사람에게 돌려준다 (없으면 본인 소지품)
//               「장비 강제 회수」(index.html adminForceUnequip) 가 전부를 돌려주는 것과 같은 길을 하나에만
//   [삭제]      그 하나만 뺀다 — 물건은 없앤다 (「물품 제거」처럼)
//
//   여럿을 골랐으면 그 장비를 찬 사람마다 **하나씩** 뺀다.
//   같은 장비를 둘 이상 찼으면 하나만 뺀다 (예: 빨간 리본 둘 중 하나).
//   특이사항의 「[장착됨] …」 줄도 하나 걷는다.

(function adminEquip() {
'use strict';

function alert_(m) { try { showCustomAlert(m); } catch (e) { console.log(m); } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function eqOf(u) { return Array.isArray(u && u.equippedWeapons) ? u.equippedWeapons : []; }
function nameOf(code) { const u = db.users[code]; return u ? (u.name || code) : code; }

window.adminLoadEquips = function (quiet) {
    const targets = getAdminTargets();
    const sel = document.getElementById('adm-equip-item');
    if (!sel) return;
    if (!targets.length) { if (!quiet) alert_('대상을 선택하거나 사번을 입력해주세요.'); return; }
    const rows = {};                 // 장비 줄 → { n: 찬 사람 수, by: 채워 준 사람 }
    targets.forEach(function (code) {
        const u = db.users[code];
        if (!u) return;
        const seen = {};
        eqOf(u).forEach(function (w) {
            if (!w) return;
            const r = rows[w] || (rows[w] = { n: 0, by: {} });
            if (!seen[w]) { r.n++; seen[w] = 1; }
            const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
            if (o && o !== code) r.by[o] = 1;
        });
    });
    const keys = Object.keys(rows);
    if (!keys.length) {
        sel.innerHTML = '<option value="">(장착 없음)</option>';
        if (!quiet) alert_('선택한 사원들이 차고 있는 장비가 없습니다.');
        return;
    }
    sel.innerHTML = keys.map(function (k) {
        const r = rows[k];
        const by = Object.keys(r.by).map(nameOf);
        return '<option value="' + esc(k) + '">' + esc(k)
            + (by.length ? ' ← ' + esc(by.join(', ')) : '')
            + (targets.length > 1 ? ' (' + r.n + '명)' : '') + '</option>';
    }).join('');
    if (!quiet) alert_(targets.length + '명의 장착 장비 ' + keys.length + '종을 불러왔습니다.');
};

//   del — 참이면 없앤다 · 거짓이면 채워 준 사람(없으면 본인)에게 돌려준다
window.adminUnequipOne = function (del) {
    const targets = getAdminTargets();
    if (!targets.length) { alert_('대상을 선택하거나 사번을 입력해주세요.'); return; }
    const sel = document.getElementById('adm-equip-item');
    const label = sel ? sel.value : '';
    if (!label) { alert_('먼저 [장비 조회]로 목록을 불러온 뒤 장비를 골라 주세요.'); return; }
    const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(label) : label;

    const done = [], skipped = [], back = [];
    targets.forEach(function (code) {
        const u = db.users[code];
        if (!u) return;
        const eq = eqOf(u);
        const i = eq.indexOf(label);
        if (i < 0) { skipped.push(u.name); return; }
        const owner = (typeof getEquipOwner === 'function') ? getEquipOwner(u, label) : null;
        eq.splice(i, 1);
        u.equippedWeapons = eq;
        // 같은 줄이 더 없으면 채워 준 사람 기록도 지운다
        if (eq.indexOf(label) < 0) { try { clearEquipOwner(u, label); } catch (e) { } }
        try { if (typeof stripNoteByItem === 'function') stripNoteByItem(u, base); } catch (e) { }
        if (!Array.isArray(u.inventory)) u.inventory = [];
        const up = { equippedWeapons: u.equippedWeapons, equipOwner: u.equipOwner || {}, badge: u.badge || null };

        if (del) {
            addHistoryLog(u, '[당국 압수] 장착하고 있던 ' + base + '이(가) 회수되어 사라졌습니다.');
        } else if (owner && owner !== code && db.users[owner]) {
            const o = db.users[owner];
            if (!Array.isArray(o.inventory)) o.inventory = [];
            o.inventory.push(base);
            addHistoryLog(o, '[당국 개입] ' + u.name + ' 사원에게 장착했던 ' + base + '이(가) 반환되었습니다.');
            o._adminStamp = Date.now();
            if (database) updateUserFields(owner, { inventory: o.inventory, history: o.history });
            addHistoryLog(u, '[당국 개입] 장착하고 있던 ' + base + '이(가) 해제되어 ' + o.name + ' 사원에게 돌아갔습니다.');
            back.push(u.name + ' → ' + o.name);
        } else {
            u.inventory.push(base);
            up.inventory = u.inventory;
            addHistoryLog(u, '[당국 개입] 장착하고 있던 ' + base + '이(가) 해제되어 소지품으로 돌아왔습니다.');
        }
        up.history = u.history;
        u._adminStamp = Date.now();
        // 장착칸이 줄어드는 쓰기는 gear-move.js 빗장이 막는다 — 일부러 빼는 것이라 한 번 열어 둔다
        try { if (typeof window.gearShrinkOk === 'function') window.gearShrinkOk(code, 8000); } catch (e) { }
        if (database) updateUserFields(code, up);
        done.push(u.name);
    });

    if (!database) saveDB();
    try { updateUI(); } catch (e) { }
    try { renderAdminTargetList(); } catch (e) { }
    window.adminLoadEquips(true);
    alert_((del ? '삭제' : '해제') + ' — ' + label + '\n\n'
        + (done.length ? done.length + '명 (' + done.join(', ') + ')' : '뺀 사람 없음')
        + (back.length ? '\n돌려줌: ' + back.join(', ') : '')
        + (skipped.length ? '\n\n안 차고 있음: ' + skipped.join(', ') : ''));
};

})();
