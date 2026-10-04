// ==========================================
// ★ 특이사항 문구 — 한 줄만 지우기 · 사라진 것 되살리기
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 빨간 리본 셋을 걸고 하나만 회수했는데 셋 다 사라져 보이는 것
//
//   회수할 때 특이사항을 이렇게 걷어냅니다. (index.html:1551)
//
//       function stripNoteByItem(user, itemName) {
//           const arr = user.badge.notes.split(' | ')
//               .filter(n => n.trim() !== '' && !n.includes(itemName));
//           user.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
//       }
//
//   「이름이 든 줄」을 **전부** 버립니다. 리본이 셋이면 문구도 셋인데
//   하나를 회수하는 순간 셋이 한꺼번에 날아갑니다.
//   장착칸에는 둘이 그대로 남아 있으니, 없어진 게 아니라 안 보이는 것입니다.
//
//   부르는 자리가 여섯 군데입니다.
//     index.html:4888 · 6379 · 6396 · 6426 · 6437 · newitems.js:647
//   전부 「하나를 뗐다」는 자리라 한 줄만 지우는 게 맞습니다.
//
//   → 첫 줄 하나만 지우도록 바꿉니다.
//
// ■ 노예 계약이 걸려 있는데 특이사항에 안 보이는 것
//
//   쓰는 자리는 멀쩡합니다. (index.html:7349)
//
//       appendBadgeNoteToUser(targetUser, `[계약] ${currentUser.name} 사원과 노예 계약 (3일)`);
//
//   문제는 특이사항이 ' | ' 로 이어 붙인 글자 한 줄이고, 그 한 줄을
//   여러 군데가 제각기 자르고 붙인다는 데 있습니다.
//   위의 「전부 지우기」 말고도 index.html:4920 · 4934 · 4952,
//   cure-fix.js:57, sticker-fix.js:75 가 같은 줄을 건드립니다.
//   어느 하나가 지나가면서 같이 쓸어 가면 계약은 살아 있는데 문구만 없어집니다.
//
//   지우는 자리를 하나하나 쫓는 대신, 반대로 맞춥니다.
//   「있어야 할 문구가 없으면 다시 적는다」로 두면 어느 길로 사라졌든 돌아옵니다.
//
//     · slaveUntil 이 아직 안 지났는데 노예 계약 문구가 없으면 → 다시 적는다
//     · 차고 있는 빨간 리본 수보다 문구가 적으면 → 모자란 만큼 다시 적는다
//
//   이미 있는 문구는 건드리지 않습니다. 없을 때만 더합니다.

(function noteFix() {

const SEP = ' | ';
const NONE = '특이사항 없음';
const RIBBON = '빨간 리본';

function notesOf(u) {
    if (!u) return [];
    const s = (u.badge && u.badge.notes) || '';
    if (!s || s === NONE) return [];
    return s.split('|').map(function (x) { return x.trim(); }).filter(Boolean);
}
function setNotes(u, arr) {
    if (!u.badge) u.badge = { photo: '', nickname: u.name, notes: NONE };
    u.badge.notes = arr.length ? arr.join(SEP) : NONE;
}
function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}

// ==========================================
// 하나 — 한 줄만 지운다
// ==========================================
(function onlyOne() {
    const iv = setInterval(function () {
        if (typeof stripNoteByItem !== 'function') return;
        if (stripNoteByItem._oneOnly) { clearInterval(iv); return; }

        const fixed = function (user, itemName) {
            if (!user || !user.badge || !user.badge.notes) return;
            const arr = notesOf(user);
            const i = arr.findIndex(function (n) { return n.indexOf(itemName) >= 0; });
            if (i < 0) return;
            arr.splice(i, 1);                     // 첫 줄 하나만
            setNotes(user, arr);
        };
        fixed._oneOnly = true;
        stripNoteByItem = fixed;
        clearInterval(iv);
        console.log('[특이사항] 한 줄만 지우도록 바꿈');
    }, 400);
})();

// ==========================================
// 둘 — 있어야 할 문구를 되살린다
// ==========================================
function missing(u) {
    if (!u) return [];
    const arr = notesOf(u);
    const add = [];

    // 노예 계약 — 아직 기간이 남았는데 문구가 없다
    const live = (u.slaveUntil && Date.now() < u.slaveUntil) || u.slaveFixed;
    if (live && !arr.some(function (n) { return n.indexOf('노예 계약') >= 0; })) {
        const who = u.masterName || '누군가';
        add.push('[계약] ' + who + ' 사원과 노예 계약 (' + (u.slaveFixed ? '영구' : '3일') + ')');
    }

    // 빨간 리본 — 차고 있는 수보다 문구가 적다
    const worn = (u.equippedWeapons || []).filter(function (w) { return baseOf(w) === RIBBON; });
    const noted = arr.filter(function (n) { return n.indexOf(RIBBON) >= 0; }).length;
    for (let i = noted; i < worn.length; i++) add.push('[장착됨] ' + worn[i]);

    return add;
}

function reconcile(u, quiet) {
    const add = missing(u);
    if (!add.length) return 0;
    setNotes(u, notesOf(u).concat(add));
    if (!quiet) console.log('[특이사항] ' + (u.name || u.code) + ' — ' + add.length + '줄 되살림: ' + add.join(' / '));
    return add.length;
}

// 내 것은 가끔 저절로
(function self() {
    setInterval(function () {
        if (!currentUser) return;
        const n = reconcile(currentUser, true);
        if (!n) return;
        if (typeof saveFields === 'function') { try { saveFields({ badge: 1 }); } catch (e) { } }
        const el = document.getElementById('badge-notes-text');
        if (el && currentUser.badge) el.innerText = currentUser.badge.notes;
    }, 15000);
})();

// ==========================================
// 확인 · 손으로
// ==========================================
window.noteCheck = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const list = who
        ? all.filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
        : all;
    const rows = [];
    list.forEach(function (u) {
        if (!u || !u.name) return;
        const add = missing(u);
        if (!add.length) return;
        rows.push({ 사원: u.name, 사번: u.no || '-', 빠진줄: add.length, 내용: add.join(' / ') });
    });
    console.log('%c===== 특이사항에서 빠진 문구 =====', 'color:#ffd700; font-size:13px');
    if (rows.length) { console.table(rows); console.log('  되살리려면 noteFixAll()'); }
    else console.log('  빠진 것이 없습니다.');
};

window.noteFixAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    const up = {}, rows = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.name) return;
        const n = reconcile(u, true);
        if (!n) return;
        up['users/' + c + '/badge'] = u.badge;
        rows.push({ 사원: u.name, 되살린줄: n, 특이사항: u.badge.notes });
    });
    if (!rows.length) { console.log('되살릴 것이 없습니다.'); return; }
    database.ref('/').update(up).then(function () {
        console.table(rows);
        console.log('%c✓ ' + rows.length + '명을 되살렸습니다.', 'color:#4CAF50');
        if (typeof updateUI === 'function') updateUI();
    }).catch(function (e) { console.error(e); });
};

window.noteShow = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 특이사항 =====', 'color:#ffd700; font-size:13px');
    const arr = notesOf(u);
    if (arr.length) arr.forEach(function (n, i) { console.log('  ' + (i + 1) + '. ' + n); });
    else console.log('  (없음)');
    const worn = (u.equippedWeapons || []).filter(function (w) { return baseOf(w) === RIBBON; });
    console.log('  차고 있는 ' + RIBBON + ':', worn.length + '개', worn.length ? ('— ' + worn.join(' · ')) : '');
    console.log('  노예 계약:', (u.slaveUntil && Date.now() < u.slaveUntil)
        ? (new Date(u.slaveUntil).toLocaleString() + ' 까지 · 주인 ' + (u.masterName || '?'))
        : (u.slaveFixed ? '영구 · 주인 ' + (u.masterName || '?') : '없음'));
    const add = missing(u);
    if (add.length) console.warn('  빠진 문구:', add.join(' / '));
};

console.log('[특이사항] noteShow(사번) · noteCheck() · noteFixAll()');

})();