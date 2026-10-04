// ==========================================
// ★ 혈욕조 흔적 지우기 · 장착칸 접기
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 하나 — 혈욕조가 특이사항에 흔적을 남기는 것
//
//   시간이 다 되어 스스로 빠질 때 특이사항에 한 줄을 적습니다.
//   (index.html:5000)
//
//       appendSystemBadgeNote("혈욕조 하루 이용 시간(3시간) 초과로 장착이 해제되었습니다.");
//
//   벌을 받은 것도 아닌데 사원증에 남아 지워지지 않습니다.
//   여기서는 두 가지를 합니다.
//
//     1. 앞으로 그 줄이 안 적히게 막습니다 (기록(history)에는 그대로 남습니다)
//     2. 이미 적혀 있는 줄을 걷어냅니다 — 내 것은 들어올 때 저절로,
//        남의 것은 상담사가 bathWipeAll() 로
//
//   특이사항은 ' | ' 로 이어 붙인 한 줄입니다. (index.html:6207)
//   그래서 토막으로 갈라 혈욕조가 든 토막만 버리고 다시 잇습니다.
//
// ■ 둘 — 장착칸 접기
//
//   renderInventory 가 장착 중인 것을 칸마다 카드 하나로 그립니다.
//   (index.html:6228~6248) 12칸이 되면 소지품이 한참 아래로 밀립니다.
//
//   카드들을 접었다 펼 수 있는 자리로 옮기고, 접은 채로 둘지 기억합니다.
//   renderInventory 가 updateUI 마다 안쪽을 통째로 다시 쓰므로
//   (index.html:6343) 그릴 때마다 다시 옮기는데, 원본이 끝난 바로 뒤에
//   같은 호흡에서 옮기니 펼쳐진 모습이 스쳐 보이지 않습니다.
//
// ■ 셋 — 칸 수는 직접 바꾸셔야 합니다
//
//   한도가 `equippedWeapons.length >= 8` 이라는 글자 그대로 17군데에
//   박혀 있습니다. 밖에서 가로챌 수 있는 함수가 아니라 여기서는 못 고칩니다.
//
//       index.html     9곳
//       newitems2.js   3곳
//       newitems.js    2곳
//       sapphire.js    2곳
//       dna-gifts.js   1곳
//
//   다섯 파일에서 아래 글자를 전부 찾아 바꾸시면 됩니다. 17곳이 나와야 합니다.
//
//       찾기   equippedWeapons.length >= 8
//       바꾸기 equippedWeapons.length >= 12
//
//   아래 EQUIP_MAX 도 같은 숫자로 맞춰 주세요. 접는 칸 머리에 적히는 숫자입니다.

(function equipFold() {

const EQUIP_MAX = 12;          // ↑ 위 찾아 바꾸기와 같은 숫자로
const BATH = '혈욕조';
const KEY = 'eqFold';

// ==========================================
// 하나 — 혈욕조 흔적
// ==========================================
function stripBath(notes) {
    const s = String(notes || '');
    if (!s || s === '특이사항 없음') return null;
    const keep = s.split('|').map(function (x) { return x.trim(); })
        .filter(function (x) { return x && x.indexOf(BATH) < 0; });
    const out = keep.length ? keep.join(' | ') : '특이사항 없음';
    return (out === s) ? null : out;          // 안 바뀌었으면 null
}

// 앞으로 안 적히게
(function block() {
    const iv = setInterval(function () {
        if (typeof appendBadgeNoteToUser !== 'function') return;
        if (appendBadgeNoteToUser._noBath) { clearInterval(iv); return; }
        const _a = appendBadgeNoteToUser;
        appendBadgeNoteToUser = function (user, noteMsg) {
            if (String(noteMsg || '').indexOf(BATH) >= 0) return;   // 혈욕조 줄은 버린다
            return _a.apply(this, arguments);
        };
        appendBadgeNoteToUser._noBath = true;
        clearInterval(iv);
        console.log('[혈욕조] 특이사항 기록 차단');
    }, 400);
})();

// 내 것에 이미 적혀 있으면 들어올 때 한 번 걷어낸다
(function wipeMine() {
    let done = false;
    const iv = setInterval(function () {
        if (done || !currentUser || !currentUser.badge) return;
        const out = stripBath(currentUser.badge.notes);
        if (out === null) { done = true; clearInterval(iv); return; }
        currentUser.badge.notes = out;
        done = true;
        if (typeof saveFields === 'function') { try { saveFields({ badge: 1 }); } catch (e) { } }
        const el = document.getElementById('badge-notes-text');
        if (el) el.innerText = out;
        clearInterval(iv);
        console.log('%c[혈욕조] 내 특이사항에서 흔적을 지웠습니다.', 'color:#4CAF50');
    }, 1000);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 전 사원 — 상담사
window.bathWipeAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {}, up = {}, rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!u.badge) return;
            const out = stripBath(u.badge.notes);
            if (out === null) return;
            up['users/' + c + '/badge/notes'] = out;
            rows.push({ 사원: u.name || c, 전: u.badge.notes, 후: out });
            if (db.users[c] && db.users[c].badge) db.users[c].badge.notes = out;
        });
        if (!rows.length) { console.log('흔적이 남은 사원이 없습니다.'); return; }
        return database.ref('/').update(up).then(function () {
            console.table(rows);
            console.log('%c✓ ' + rows.length + '명의 특이사항에서 지웠습니다.', 'color:#4CAF50');
            if (typeof updateUI === 'function') updateUI();
        });
    }).catch(function (e) { console.error(e); });
};

window.bathCheck = function () {
    const rows = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.badge) return;
        if (String(u.badge.notes || '').indexOf(BATH) < 0) return;
        rows.push({ 사원: u.name || c, 사번: u.no || '-', 특이사항: u.badge.notes });
    });
    console.log('%c===== 혈욕조 흔적이 남은 사원 =====', 'color:#ff8a65; font-size:13px');
    if (rows.length) { console.table(rows); console.log('  지우려면 bathWipeAll()'); }
    else console.log('  없습니다.');
};

// ==========================================
// 둘 — 장착칸 접기
// ==========================================
function folded() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
}
function setFolded(v) {
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { }
}

function fold() {
    const box = document.getElementById('inventory-list-container');
    if (!box || document.getElementById('eq-fold-wrap')) return;

    // 「[장착 중 슬롯 n]」 가 든 카드를 모은다 — 전부 칸의 바로 아래 자식이다
    const cards = [];
    box.querySelectorAll('span').forEach(function (sp) {
        if (sp.textContent.indexOf('[장착 중 슬롯') !== 0) return;
        let el = sp;
        while (el.parentElement && el.parentElement !== box) el = el.parentElement;
        if (el.parentElement === box && cards.indexOf(el) < 0) cards.push(el);
    });
    if (cards.length < 2) return;            // 하나뿐이면 접을 것이 없다

    const open = !folded();
    const head = document.createElement('div');
    head.id = 'eq-fold-head';
    head.style.cssText = 'display:flex; justify-content:space-between; align-items:center;'
        + ' background:#241f14; border:1px solid #d4af37; border-radius:6px;'
        + ' padding:9px 12px; margin-bottom:' + (open ? '12px' : '14px') + '; cursor:pointer;'
        + ' user-select:none;';
    head.innerHTML = '<span style="font-size:11px; color:#d4af37; font-weight:bold;">'
        + '장착 중 ' + cards.length + ' / ' + EQUIP_MAX + '칸</span>'
        + '<span id="eq-fold-mark" style="font-size:11px; color:#aaa;">'
        + (open ? '접기 ▲' : '펼치기 ▼') + '</span>';

    const wrap = document.createElement('div');
    wrap.id = 'eq-fold-wrap';
    if (!open) wrap.style.display = 'none';

    cards[0].parentElement.insertBefore(head, cards[0]);
    head.parentElement.insertBefore(wrap, head.nextSibling);
    cards.forEach(function (c) { wrap.appendChild(c); });

    head.onclick = function () {
        const now = wrap.style.display === 'none';
        wrap.style.display = now ? '' : 'none';
        setFolded(!now);
        const m = document.getElementById('eq-fold-mark');
        if (m) m.textContent = now ? '접기 ▲' : '펼치기 ▼';
        head.style.marginBottom = now ? '12px' : '14px';
    };
}

(function hook() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._eqFold) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const r = _r.apply(this, arguments);
            try { fold(); } catch (e) { }     // 같은 호흡에 — 펼쳐진 모습이 안 스친다
            return r;
        };
        renderInventory._eqFold = true;
        clearInterval(iv);
        // 이미 그려져 있을 수 있다 — 붙자마자 한 번, 그리고 늦게 그려지는 것도 잡는다
        try { fold(); } catch (e) { }
        [300, 900, 2000].forEach(function (ms) {
            setTimeout(function () { try { fold(); } catch (e) { } }, ms);
        });
        console.log('[장착칸] 접기 연결 — 최대 ' + EQUIP_MAX + '칸');
    }, 400);
})();

console.log('[장착칸] bathCheck() · bathWipeAll()');

})();