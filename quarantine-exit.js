// ==========================================
// ★ 정갈한 문패 · 오색 신발끈 — 나올 때 오염도까지
// index.html 에서 newitems2.js 다음, save-merge.js 앞에 불러온다
// ==========================================
//
// ■ 지금 어떤 상태인가
//
//   1. 오색 신발끈(n_lace)은 처리기가 통째로 사라졌다.
//      newitems2.js 에 아이템 설명(1394행)만 남고 SELF.n_lace 가 없다.
//      그래서 쓰면 「장착형」으로 흘러가 장비 칸에 꽂힌다.
//      선녀탕에서 나오지도 않고, 오염도도 그대로다.
//
//   2. 정갈한 문패(n_plate)는 같은 객체에 두 번 들어가 있다.
//      뒤엣것이 이기긴 하는데, 그 saveFields 목록에 badge 가 들어 있어서
//      badge 가 없는 계정이면 저장이 통째로 터진다.
//      화면에는 나온 것처럼 보이고 서버에는 안 써진다. 새로고침하면 100 으로 돌아온다.
//
//   3. 둘 다 원래 오염도를 안 내려놓는다.
//      정상 해제(index.html 4938행)는 이렇게 한다.
//          user.pollution = user.quarantineExitPollution || 0;
//          user.quarantineExitPollution = 0;
//          user.lastPollutionTime = now;
//      그런데 그 블록은 quarantineUntil 이 남아 있을 때만 돈다.
//      문패가 0 으로 만들어 버리면 그 뒤로 영영 안 돈다.
//
// ■ 어떻게 고치나
//
//   두 아이템을 여기서 통째로 맡는다. newitems2.js 는 건드리지 않는다.
//   (SELF 는 IIFE 안이라 밖에서 못 고친다. 그래서 앞에서 가로챈다.)
//   정상 해제와 똑같이 오염도를 내려놓고, 방도 닫고, 횟수도 깎는다.

(function quarantineExit() {

const MAX_USE = 5;   // 둘 다 다섯 번 쓰면 사라진다

// newitems2.js 의 totalSpend 와 같은 칸(useCnt)을 쓴다
function spend(name) {
    if (!currentUser.useCnt) currentUser.useCnt = {};
    const n = (currentUser.useCnt[name] || 0) + 1;
    currentUser.useCnt[name] = n;
    if (n >= MAX_USE) {
        // ★ 지우지 않고 0 으로 둔다 — 아래 「묵은 횟수」 참고
        currentUser.useCnt[name] = 0;
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, name, 1);
        // 장착 칸에 잘못 꽂혀 있었다면 같이 뺀다
        const eq = currentUser.equippedWeapons || [];
        const i = eq.findIndex(function (w) {
            return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
        });
        if (i >= 0) eq.splice(i, 1);
        return { gone: true, left: 0 };
    }
    return { gone: false, left: MAX_USE - n };
}

function shut(ids) {
    ids.forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.body.style.overflow = '';
}

// ★ 서버에 적는 일은 **다 바꾼 뒤에 한 번만** 한다.
//
//   ✗ 전에는 release() 가 제 끝에서 저장했다. 그런데 doExit 는
//     release() → spend() → 기록 차례로 돈다. 그래서 **쓴 횟수도,
//     닳아 없어진 것도, 기록도 서버에 안 갔다.** 화면에만 그렇게
//     보이고 서버에는 쓰기 전 모습이 그대로 남았다 (재 봄 — 다섯 번째에
//     화면은 「닳아 없어졌습니다」인데 서버에는 문패가 그대로 있고
//     useCnt 도 4 였다).
//
//     그 어긋남이 쌓이면 이런 일이 난다 — 서버가 다시 내려올 때 문패가
//     되살아나고, 늘어난 까닭(기록)은 없으니 dupe-watch 가 「까닭 없는
//     증가」로 보고 되돌려 버린다. 그러면 정말로 없어진다.
function saveNow() {
    // 값이 없는 칸은 빼고 저장한다 — 하나라도 섞이면 전부 안 써진다
    const f = {
        quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1,
        pollution: 1, quarantineExitPollution: 1, lastPollutionTime: 1,
        foxRoomAnswered: 1, useCnt: 1, inventory: 1, equippedWeapons: 1, history: 1
    };
    if (currentUser.badge !== undefined) f.badge = 1;
    Object.keys(f).forEach(function (k) { if (currentUser[k] === undefined) delete f[k]; });
    if (typeof saveFields === 'function') {
        try { saveFields(f); } catch (e) { console.error('[격리 해제] 저장 실패:', e); }
    }
}

// 정상 해제와 같은 일을 한다 (값만 바꾼다 — 저장은 saveNow 가 한다)
function release() {
    let out = currentUser.quarantineExitPollution || 0;
    if (out >= 100) out = 99;              // 100 이면 나오자마자 다시 들어간다

    currentUser.quarantineUntil = 0;
    currentUser.quarantineDest = null;
    currentUser.quarantineHospital = null;
    currentUser.pollution = out;
    currentUser.quarantineExitPollution = 0;
    currentUser.lastPollutionTime = Date.now();
    currentUser.foxRoomAnswered = false;

    // 다시 부르지 않도록 잠금도 푼다
    try { hasShownFoxAlert = false; } catch (e) { }

    // 탐사 사고 문구를 거둔다 (badge 가 있을 때만)
    if (currentUser.badge && typeof currentUser.badge.notes === 'string') {
        const arr = currentUser.badge.notes.split(' | ').filter(function (n) {
            return n.trim() !== ''
                && n.indexOf('의식 불명') < 0
                && n.indexOf('긴급 이송') < 0
                && n.indexOf('사직 반려') < 0;
        });
        currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }

    return out;
}

function doExit(nm, kind) {
    const inRoom = currentUser.quarantineUntil > Date.now();
    const bath = (currentUser.quarantineDest || 'fox') === 'bath';

    if (kind === 'plate') {
        if (!inRoom || bath) { showCustomAlert('상담실에 있지 않습니다.'); return; }
    } else {
        if (!inRoom || !bath) { showCustomAlert('선녀탕에 있지 않습니다.'); return; }
    }

    const out = release();
    const r = spend(nm);

    shut(['fox-modal', 'bath-modal', 'fox-room-overlay',
          'fox-nameplate-overlay', 'quarantine-pick-overlay', 'fox-loading-overlay']);

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(currentUser, '[' + nm + '] ' + (kind === 'plate' ? '상담실' : '선녀탕')
            + '에서 나왔습니다. (오염도 ' + out + '%' + (r.gone ? ' · 다 썼습니다' : ' · 남은 횟수 ' + r.left + '회') + ')');
    }
    saveNow();                       // ★ 다 바꾼 뒤에 한 번만
    if (typeof updateUI === 'function') updateUI();

    showCustomAlert(
        (kind === 'plate' ? '문패를 내렸습니다.\n\n상담실에서 나왔습니다.'
                          : '끈을 묶고 나왔습니다.\n\n선녀탕에서 나왔습니다.')
        + '\n오염도 ' + out + '%'
        + (r.gone ? '\n\n' + nm + '이(가) 닳아 없어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
}

// ==========================================
// 가로채기 — newitems2.js 보다 먼저 받는다
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._qexit) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            let e = cat && cat.effect;
            // ★ 복제품이면 원본의 갈래로 본다.
            //   복제품의 effect 는 copy_of 라 여기를 그냥 지나갔다. 그러면
            //   spaceitems.js 가 원본 이름으로 다시 부르는데, 그 사이 끼어 있는
            //   newitems2.js 의 「격리 중에는 쓸 수 없습니다」에 막혔다.
            //   어느 쪽이 바깥인지는 감싸는 차례에 따라 달라져서 될 때도 있고
            //   안 될 때도 있었다. 여기서 바로 알아보면 차례를 안 탄다.
            if (e === 'copy_of' && cat.copyOf) {
                const src = ITEM_CATALOG[cat.copyOf];
                e = src && src.effect;
            }
            if (e !== 'n_plate' && e !== 'n_lace') return _u.apply(this, arguments);

            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) === -1) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            doExit(itemName, e === 'n_plate' ? 'plate' : 'lace');
        };
        useInventoryItem._qexit = true;
        clearInterval(iv);
        console.log('[격리] 문패·신발끈 연결');
    }, 500);
})();

// ==========================================
// 묵은 횟수 — 한 번 쓰고도 사라지던 것 (2026-10-18)
// ==========================================
//
//   다섯 번째에 횟수 칸을 지웠다(delete). 그 칸이 useCnt 의 하나뿐인 칸이면
//   useCnt 가 {} 가 되고, 빈 객체는 저장에서 빠진다(empty-null.js). 그래서
//   서버에는 **4 가 그대로** 남았다. 다시 들어오면 그 4 를 읽어 오고, 새로
//   산 문패를 한 번 쓰면 5 가 되어 바로 닳아 없어졌다.
//   이제는 0 으로 둔다(위 spend · newitems2.js totalSpend). 이미 서버에 남은
//   묵은 값은 사원마다 한 번 바로잡는다 —
//     · 그 물건을 하나도 안 가지고 있으면 횟수는 뜻이 없다 → 0
//     · 「다 쓰기 한 번 전」 값(문패 4 · 포승줄 9 …)은 남는 자리가 바로 그 값이다 → 0
//       (정말로 네 번 쓴 사람도 0 이 되지만, 그쪽이 덜 억울하다)
(function repairUseCnt() {
    const MAX = { '정갈한 문패': 5, '오색 신발끈': 5, '포승줄': 10, '진실 마스크': 5,
                  '장기말': 3, '낚시 줄': 5 };
    const MARK = 'uc-1018';
    const BOOT = Date.now();
    function base(w) {
        return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
    }
    setInterval(function () {
        try {
            const u = (typeof currentUser !== 'undefined') ? currentUser : null;
            if (!u || !u.code || u.useCntFix === MARK) return;
            if (Date.now() - BOOT < 8000) return;           // 서버 모습이 다 내려온 뒤에
            const c = (u.useCnt && typeof u.useCnt === 'object') ? u.useCnt : {};
            const fixed = [];
            Object.keys(MAX).forEach(function (name) {
                const v = Number(c[name]) || 0;
                if (!v) return;
                const held = (u.inventory || []).filter(function (x) { return base(x) === name; }).length
                    + (u.equippedWeapons || []).filter(function (x) { return base(x) === name; }).length;
                if (!held || v >= MAX[name] - 1) { c[name] = 0; fixed.push(name + ' ' + v); }
            });
            u.useCntFix = MARK;
            const f = { useCntFix: 1 };
            if (fixed.length) { u.useCnt = c; f.useCnt = 1; console.log('[격리] 묵은 사용 횟수를 바로잡았습니다 — ' + fixed.join(' · ')); }
            if (typeof saveFields === 'function') saveFields(f);
        } catch (e) { }
    }, 2000);
})();

// ==========================================
// 이미 갇힌 사람 풀기 — 상담사용
// ==========================================
window.freeStuck = function () {
    if (!database) { console.warn('서버에 닿지 못했습니다.'); return; }
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            const inRoom = u.quarantineUntil && Date.now() < u.quarantineUntil;
            if (!inRoom && (u.pollution || 0) < 100) return;
            rows.push({
                사원: u.name || c, 사번: u.no || '-',
                오염도: u.pollution || 0,
                격리: inRoom ? new Date(u.quarantineUntil).toLocaleString() : '-',
                나올때오염도: u.quarantineExitPollution || 0,
                어디: (u.quarantineDest || 'fox') === 'bath' ? '선녀탕' : '상담실'
            });
        });
        console.log('%c===== 격리·오염 100 =====', 'color:#ff6b6b; font-size:13px');
        if (rows.length) console.table(rows); else console.log('  해당 사원이 없습니다.');
        console.log('  풀려면 freeStuckGo() 를 치세요. 전원 오염도 0 으로 내보냅니다.');
    });
};

window.freeStuckGo = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!database) return;
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {}, names = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            const inRoom = u.quarantineUntil && Date.now() < u.quarantineUntil;
            if (!inRoom && (u.pollution || 0) < 100) return;
            up['users/' + c + '/quarantineUntil'] = 0;
            up['users/' + c + '/quarantineHospital'] = null;
            up['users/' + c + '/quarantineExitPollution'] = 0;
            up['users/' + c + '/pollution'] = 0;
            up['users/' + c + '/lastPollutionTime'] = Date.now();
            up['users/' + c + '/foxRoomAnswered'] = false;
            names.push(u.name || c);
        });
        if (!names.length) { console.log('풀 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ ' + names.length + '명을 내보냈습니다: ' + names.join(', '), 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

console.log('[격리] freeStuck() · freeStuckGo()');

})();