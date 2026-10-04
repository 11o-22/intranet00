// ==========================================
// ★ 빨간 리본 — 겹쳐 걸면 하나밖에 못 떼는 것
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 일어나고 있나
//
//   같은 사람에게 리본을 셋 걸면 이름표가 **똑같아집니다.**
//   (index.html:7249~7250)
//
//       const targetLabel = `빨간 리본 (연결: ${currentUser.name} ${cPos})`;
//       const senderLabel = `빨간 리본 (연결: ${targetUser.name} ${tPos})`;
//
//   그래서 equippedWeapons 에는 똑같은 글자가 셋 들어갑니다.
//
//       ['빨간 리본 (연결: 갑 과장)', '빨간 리본 (연결: 갑 과장)', '빨간 리본 (연결: 갑 과장)']
//
//   그런데 「누가 채웠나」는 그 이름표를 열쇠로 쓰는 object 입니다.
//   (index.html:1558)
//
//       user.equipOwner['빨간 리본 (연결: 갑 과장)'] = '채운사람코드'
//
//   열쇠가 하나뿐이라 셋이 그 한 칸을 나눠 씁니다.
//   하나를 회수하면 그 칸이 지워지고(index.html:6426 → clearEquipOwner),
//   남은 둘은 「채운 사람이 없는 것」이 되어
//
//     · 회수 목록에 안 뜨고 (index.html:6389 가 owner 로 거릅니다)
//     · 억지로 불러도 "장착 권한자가 아닙니다" 로 막힙니다
//
//   그래서 셋을 걸면 하나밖에 못 뗍니다.
//
// ■ 어떻게 고치나
//
//   회수하는 자리가 넷인데(index.html:6379 · 6396 · 6426 · 6437)
//   **전부 배열에서 먼저 빼고 그 다음에** clearEquipOwner 를 부릅니다.
//   그러니 「같은 이름표가 아직 남아 있으면 열쇠를 지우지 않는다」로 두면
//   네 자리가 한꺼번에 고쳐집니다. 마지막 하나를 뗄 때만 지워집니다.
//
//   리본만의 일이 아닙니다. 똑같은 이름표가 둘 이상 생기는 장비는
//   모두 같은 함정에 걸립니다.
//
// ■ 지금 묶여 있는 것
//
//   이미 열쇠가 지워진 리본은 위 고침만으로는 안 돌아옵니다.
//   ribbonOff() 로 한 번에 떼시면 됩니다. 소지품으로 돌아갑니다.

(function ribbonFix() {

const RIBBON = '빨간 리본';

function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}

// ==========================================
// 하나 — 같은 이름표가 남았으면 열쇠를 지키자
// ==========================================
(function keepOwner() {
    const iv = setInterval(function () {
        if (typeof clearEquipOwner !== 'function') return;
        if (clearEquipOwner._keepDup) { clearInterval(iv); return; }

        const _c = clearEquipOwner;
        clearEquipOwner = function (user, fullName) {
            // 부르는 자리들은 전부 배열에서 뺀 뒤에 부른다.
            // 그래서 지금 배열에 같은 글자가 남아 있으면 아직 더 차고 있다는 뜻이다.
            if (user && Array.isArray(user.equippedWeapons)
                && user.equippedWeapons.indexOf(fullName) >= 0) {
                return;                       // 열쇠를 남겨 둔다
            }
            return _c.apply(this, arguments);
        };
        clearEquipOwner._keepDup = true;
        clearInterval(iv);
        console.log('[리본] 겹친 이름표의 장착자 기록 보호');
    }, 400);
})();

// ==========================================
// 둘 — 지금 묶여 있는 것을 떼어 낸다
// ==========================================
function strip(u, mateName) {
    // u 에게서 리본 이름표를 전부 뺀다. 뺀 개수를 돌려준다.
    const eq = u.equippedWeapons || [];
    let n = 0;
    for (let i = eq.length - 1; i >= 0; i--) {
        if (baseOf(eq[i]) !== RIBBON) continue;
        if (mateName && String(eq[i]).indexOf(mateName) < 0) continue;
        const full = eq[i];
        eq.splice(i, 1);
        if (u.equipOwner) delete u.equipOwner[full];
        n++;
    }
    if (u.badge && u.badge.notes) {
        const keep = String(u.badge.notes).split('|').map(function (x) { return x.trim(); })
            .filter(function (x) { return x && x.indexOf(RIBBON) < 0; });
        u.badge.notes = keep.length ? keep.join(' | ') : '특이사항 없음';
    }
    if (Array.isArray(u.ribbons)) u.ribbons = [];
    return n;
}

window.ribbonOff = function () {
    if (!currentUser) return;
    const n = strip(currentUser, null);
    if (!n) { console.log('차고 있는 ' + RIBBON + ' 이 없습니다.'); return; }

    if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
    for (let i = 0; i < n; i++) currentUser.inventory.push(RIBBON);
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(currentUser, '[' + RIBBON + '] ' + n + '개를 모두 떼어 소지품으로 돌렸습니다.');
    }
    if (typeof saveSelfFull === 'function') saveSelfFull();

    // 묶여 있던 상대 쪽도 같이 푼다
    const mine = currentUser.name;
    let other = 0;
    Object.keys(db.users || {}).forEach(function (c) {
        if (c === currentUser.code) return;
        const u = db.users[c];
        if (!u || !Array.isArray(u.equippedWeapons)) return;
        const k = strip(u, mine);
        if (!k) return;
        other += k;
        if (typeof updateUserFields === 'function') {
            updateUserFields(c, {
                equippedWeapons: u.equippedWeapons, equipOwner: u.equipOwner || {},
                badge: u.badge || {}, ribbons: []
            });
        }
    });

    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + RIBBON + ' ' + n + '개를 떼어 소지품으로 돌렸습니다.'
        + (other ? ' (상대 쪽 ' + other + '개도 풀었습니다)' : ''), 'color:#4CAF50');
};

// 상담사 — 남의 것도
window.ribbonOffFor = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = Object.keys(db.users || {}).map(function (c) { return db.users[c]; })
        .find(function (x) { return x && (x.no === who || x.code === who || x.name === who); });
    if (!u) { console.warn('사원을 못 찾았습니다: ' + who); return; }
    const n = strip(u, null);
    if (!n) { console.log(u.name + ' 사원은 ' + RIBBON + ' 을 차고 있지 않습니다.'); return; }
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < n; i++) u.inventory.push(RIBBON);
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, {
            equippedWeapons: u.equippedWeapons, equipOwner: u.equipOwner || {},
            inventory: u.inventory, badge: u.badge || {}, ribbons: []
        });
    }
    console.log('%c✓ ' + u.name + ' 사원의 ' + RIBBON + ' ' + n + '개를 떼었습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

// ==========================================
// 확인
// ==========================================
window.ribbonState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · ' + RIBBON + ' =====', 'color:#ff8fb1; font-size:13px');
    const eq = (u.equippedWeapons || []).filter(function (w) { return baseOf(w) === RIBBON; });
    if (!eq.length) { console.log('  차고 있지 않습니다.'); }
    else {
        console.table(eq.map(function (w, i) {
            const o = (u.equipOwner || {})[w];
            return {
                번호: i, 이름표: w,
                '채운 사람': !o ? '✗ 기록 없음 (못 뗍니다)'
                    : (o === u.code ? '본인' : ((db.users[o] || {}).name || o))
            };
        }));
        const dup = {}; let same = 0;
        eq.forEach(function (w) { if (dup[w]) same++; dup[w] = 1; });
        if (same) console.warn('  똑같은 이름표가 ' + (same + 1) + '개 겹쳐 있습니다 — 이것이 못 떼는 원인입니다.');
    }
    console.log('  보호 연결:', (typeof clearEquipOwner === 'function' && clearEquipOwner._keepDup) ? 'O' : '✗');
    console.log('  전부 떼려면 ribbonOff()');
};

console.log('[리본] ribbonState() · ribbonOff() · ribbonOffFor(사번)');

})();