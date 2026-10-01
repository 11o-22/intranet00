// ==========================================
// ★ 출산이 안 되고 멈추는 것 · 방치 표시가 안 사라지는 것
// index.html 에서 preg-roster.js 다음에 불러온다 (맨 뒤여도 된다)
// ==========================================
//
// 무슨 일이 있었나
//   checkPregBirth() 는 두 번 돌지 않도록 currentUser._birthing 에 잠금을 건다.
//   그런데 이 값이 서버에 같이 저장되고, 푸는 자리가 「끝까지 무사히 간 경우」
//   하나뿐이다. 중간에 한 번이라도 끊기면 (새로고침·통신 끊김·아이템 지급 실패)
//   잠금이 true 인 채로 굳어 버린다.
//   그 뒤로는 시간이 다 차도 영원히 출산이 안 되고,
//   임신 상태가 안 끝나니 「방치까지 N시간」도 계속 뜬다.
//
// 어떻게 고치나
//   잠금에 시각을 같이 적어 두고, 2분이 지나면 저절로 풀리게 한다.
//   풀리면 다음 1분 주기에 출산이 다시 시도된다.

(function pregFix3() {

const LOCK_MS = 2 * 60 * 1000;     // 이보다 오래 걸려 있으면 끊긴 것으로 본다

function clearLock(u) {
    if (!u) return;
    u._birthing = false;
    if ('_birthAt' in u) delete u._birthAt;
}

// ==========================================
// 1. 굳은 잠금을 푼다
// ==========================================
(function hookBirth() {
    const iv = setInterval(function () {
        if (typeof checkPregBirth !== 'function') return;
        if (checkPregBirth._unstick) { clearInterval(iv); return; }

        const _c = checkPregBirth;
        checkPregBirth = function () {
            if (!currentUser) return _c.apply(this, arguments);

            if (currentUser._birthing) {
                const at = currentUser._birthAt || 0;
                if (!at || Date.now() - at > LOCK_MS) {
                    console.warn('[임신] 멈춰 있던 출산 잠금을 풉니다. 다시 시도합니다.');
                    clearLock(currentUser);
                } else {
                    return;                      // 아직 진행 중이다
                }
            }

            const r = _c.apply(this, arguments);
            // 안쪽이 잠갔으면 시각을 같이 적어 둔다
            if (currentUser && currentUser._birthing) currentUser._birthAt = Date.now();
            return r;
        };
        checkPregBirth._unstick = true;
        clearInterval(iv);
        console.log('[임신] 출산 잠금 자동 해제 연결');
    }, 500);
})();

// 들어오자마자 한 번 — 예전에 굳은 채로 저장된 것을 치운다
(function clearOnLogin() {
    let seen = null;
    setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser) { seen = null; return; }
        if (seen === currentUser.code) return;
        seen = currentUser.code;
        if (currentUser._birthing) {
            console.warn('[임신] 저장돼 있던 출산 잠금을 풉니다.');
            clearLock(currentUser);
            if (typeof saveFields === 'function') {
                try { saveFields({ _birthing: 1 }); } catch (e) { }
            }
        }
    }, 1000);
})();

// ==========================================
// 2. 출산 시각이 지났으면 방치 표시를 접는다
// ==========================================
//
// 시간이 다 찼는데 아직 안 나온 상태에서 「방치까지 N시간」이 뜨면
// 돌봐야 하는 줄 알게 된다. 그때는 돌봄이 아니라 출산을 기다리는 중이다.
(function hookRoster() {
    const iv = setInterval(function () {
        if (typeof renderPregRoster !== 'function') return;
        if (renderPregRoster._dueFix) { clearInterval(iv); return; }

        const _r = renderPregRoster;
        renderPregRoster = function () {
            const out = _r.apply(this, arguments);
            try { markDue(); } catch (e) { console.warn('[임신] 표시 보정 건너뜀:', e && e.message); }
            return out;
        };
        renderPregRoster._dueFix = true;
        clearInterval(iv);
        console.log('[임신] 출산 대기 표시 연결');
    }, 500);
})();

function markDue() {
    if (typeof myPregList !== 'function') return;
    const list = myPregList() || [];
    if (!list.length) return;

    const overdue = list.filter(function (x) { return x.p && x.p.due && Date.now() >= x.p.due; });
    if (!overdue.length) return;

    const names = overdue.map(function (x) { return x.u.name; });

    // 그려진 줄 가운데 해당 사원 칸을 찾아 손본다
    document.querySelectorAll('div').forEach(function (el) {
        if (el.children.length === 0) return;
        const nameEl = el.querySelector('div[style*="font-weight:bold"]');
        if (!nameEl) return;
        const nm = nameEl.innerText.replace('사원', '').trim();
        if (names.indexOf(nm) < 0) return;
        if (el.dataset.dueMarked) return;

        // 방치 경고를 지우고 출산 대기로 바꾼다
        el.querySelectorAll('span').forEach(function (s) {
            const t = s.innerText || '';
            if (t.indexOf('방치') >= 0) {
                s.innerHTML = '<span style="color:#ff8fb1; font-weight:bold;">출산 대기 중</span>';
            }
        });
        el.innerHTML = el.innerHTML.replace(/출산까지\s*0시간/g,
            '<span style="color:#ff8fb1;">시간이 다 찼습니다</span>');
        el.dataset.dueMarked = '1';
    });
}

// ==========================================
// 3. 상담사용 — 멈춘 사람 찾아 풀기
// ==========================================
window.pregStuck = function () {
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const rows = [];
    all.forEach(function (u) {
        const p = (typeof pregOf === 'function') ? pregOf(u) : (u.preg || null);
        if (!p || !p.due) return;
        const over = Date.now() >= p.due;
        rows.push({
            사원: u.name, 사번: u.no,
            '출산 예정': new Date(p.due).toLocaleString(),
            '시간 지남': over ? '예 (' + Math.floor((Date.now() - p.due) / 3600000) + '시간)' : '-',
            '출산 잠금': u._birthing ? '✗ 걸려 있음' : '-',
            아버지: (p.sires || []).length,
            상태: (over && u._birthing) ? '⚠ 멈춤' : (over ? '곧 나옴' : '진행 중')
        });
    });
    console.log('%c===== 임신 =====', 'color:#ff8fb1; font-size:13px');
    if (rows.length) console.table(rows); else console.log('  임신한 사원이 없습니다.');
    const stuck = rows.filter(function (r) { return r.상태 === '⚠ 멈춤'; });
    if (stuck.length) console.log('  멈춘 사원 ' + stuck.length + '명 — pregUnstickAll() 로 풉니다.');
};

window.pregUnstickAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!database) { console.warn('서버에 닿지 못했습니다.'); return; }

    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {};
        const names = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!u._birthing) return;
            up['users/' + c + '/_birthing'] = null;
            up['users/' + c + '/_birthAt'] = null;
            names.push(u.name || c);
            if (db.users[c]) clearLock(db.users[c]);
        });
        if (!names.length) { console.log('멈춰 있는 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ ' + names.length + '명의 출산 잠금을 풀었습니다: ' + names.join(', '), 'color:#4CAF50');
            console.log('  각자 창에서 1분 안에 출산이 다시 시도됩니다.');
        });
    }).catch(function (e) { console.error('실패:', e); });
};

// 내 것만 당장 풀고 바로 시도
window.pregBirthNow = function () {
    if (!currentUser) return;
    clearLock(currentUser);
    if (typeof saveFields === 'function') { try { saveFields({ _birthing: 1 }); } catch (e) { } }
    if (typeof checkPregBirth === 'function') checkPregBirth();
    console.log('잠금을 풀고 출산을 시도했습니다.');
};

console.log('[임신] pregStuck() · pregUnstickAll() · pregBirthNow()');

})();