// ==========================================
// ★ 10/02 수정 모음 — 저장 · S-010 · S-003
// index.html 에서 맨 뒤(save-merge.js 앞)에 불러온다
// ==========================================
//
// 여기 담긴 것
//   1. 저장이 통째로 터지던 것 (saveFields · saveSelfFull)
//   2. 사망 화면이 기믹 결과 화면에 덮여 정산이 막히던 것
//   3. 맨손 제압 실패가 무한 루프가 되던 것
//   4. 합류 실패 시 혼자 떨어진 채로 끝까지 가던 것
//   5. S-010 리스너 세 개가 안 떨어져 옛 기록이 다시 쏟아지던 것
//   6. 전원 전향해도 전멸 처리가 안 되던 것
//   7. 새로고침하면 S-010 · S-003 상태가 날아가던 것
//   8. S-003 회수품 네 종이 아무 동작도 안 하던 것

(function fix1002() {

// ==========================================
// 1. 저장 — undefined 하나에 전부가 날아가던 것
// ==========================================
//
// saveFields 는 요청받은 칸을 그대로 Firebase 에 넘긴다.
// 그중 하나라도 undefined 면 update 가 동기적으로 throw 하고,
// .catch 는 Promise 에 붙어 있어서 잡지도 못한다.
// 화면에는 다 된 것처럼 보이는데 서버에는 아무것도 안 써진다.
//
// 더 나쁜 건 그 윗줄 pendingSaves++ 다. throw 가 나면 onSaveDone 이
// 영영 안 불려 pendingSaves 가 굳고, 그러면 서버에서 내려온 변경이
// 그 세션 내내 내 화면에 반영되지 않는다.
(function fixSave() {
    const iv = setInterval(function () {
        if (typeof saveFields !== 'function') return;
        if (saveFields._nodef) { clearInterval(iv); return; }

        const _sf = saveFields;
        saveFields = function (fields) {
            if (!fields || !currentUser) return _sf.apply(this, arguments);
            const clean = {};
            const dropped = [];
            Object.keys(fields).forEach(function (k) {
                if (currentUser[k] === undefined) { dropped.push(k); return; }
                clean[k] = fields[k];
            });
            if (dropped.length) {
                console.warn('[저장] 값이 없는 칸은 빼고 보냅니다:', dropped.join(', '));
            }
            if (!Object.keys(clean).length) return;
            try { return _sf.call(this, clean); }
            catch (e) { console.error('[저장] 실패:', e && e.message); }
        };
        saveFields._nodef = true;
        clearInterval(iv);
        console.log('[저장] 빈 칸 거르기 연결');
    }, 500);
})();

// pendingSaves 가 굳어 버린 경우를 풀어 준다
(function unstickSaves() {
    let last = -1, since = 0;
    setInterval(function () {
        let n;
        try { n = pendingSaves; } catch (e) { return; }   // 못 읽으면 건너뛴다
        if (typeof n !== 'number') return;
        if (n !== last) { last = n; since = Date.now(); return; }
        if (n <= 0) return;
        if (Date.now() - since < 60000) return;            // 1분 넘게 그대로면 굳은 것
        console.warn('[저장] 대기 수가 ' + n + ' 에서 멈춰 있습니다. 풀어 둡니다.');
        try { pendingSaves = 0; } catch (e) { }
        since = Date.now();
    }, 10000);
})();

// ==========================================
// 2. 사망 화면이 덮이던 것
// ==========================================
//
// 기믹 처리들이 addInfect / breakTaboo 로 사람을 죽인 뒤,
// _dead 를 확인하지 않고 결과 화면을 그대로 덮어쓴다.
// 사고 보고서와 「단말로 복귀한다」 버튼이 사라져서
// 플레이어는 정산을 못 하고 화면에 갇힌다.
//
// 죽을 때 그 화면을 적어 두었다가, 덮이면 되돌린다.
let deathHtml = null;

(function keepDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function' || typeof darkBodyEl !== 'function') return;
        if (darkDeath._keep) { clearInterval(iv); return; }

        const _d = darkDeath;
        darkDeath = function () {
            const r = _d.apply(this, arguments);
            try {
                if (darkRun && darkRun._dead) {
                    const b = darkBodyEl();
                    deathHtml = b ? b.innerHTML : null;
                } else {
                    deathHtml = null;        // 아이템으로 살아난 경우
                }
            } catch (e) { }
            return r;
        };
        darkDeath._keep = true;
        clearInterval(iv);
        console.log('[어둠] 사망 화면 보존 연결');
    }, 500);
})();

function restoreDeath(who) {
    if (!darkRun || !darkRun._dead || !deathHtml) return false;
    try {
        const b = darkBodyEl();
        if (!b) return false;
        if (b.innerHTML === deathHtml) return false;      // 안 덮였다
        b.innerHTML = deathHtml;
        if (typeof mountDarkChat === 'function') mountDarkChat('normal');
        console.warn('[어둠] 사망 화면이 덮여서 되돌렸습니다. (' + who + ')');
        return true;
    } catch (e) { return false; }
}

// 덮어쓰는 쪽들을 막는다
(function guardOverwrite() {
    const TARGETS = ['s010Result', 'submitLoreCheck', 's003Resolve', 's010DefResult'];
    const iv = setInterval(function () {
        let left = 0;
        TARGETS.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._deadGuard) return;
            const _o = f;
            window[n] = function () {
                if (darkRun && darkRun._dead) {           // 이미 죽었으면 아예 안 그린다
                    restoreDeath(n);
                    return;
                }
                const r = _o.apply(this, arguments);
                restoreDeath(n);                          // 안쪽에서 죽었으면 되돌린다
                return r;
            };
            window[n]._deadGuard = true;
        });
        if (!left) { clearInterval(iv); console.log('[어둠] 사망 화면 보호 연결'); }
    }, 500);
})();

// ==========================================
// 3. 맨손 제압 실패 — 같은 사람이 계속 다시 뜨던 것
// ==========================================
//
// 성공·볼트·회피 분기는 _purged[code] 를 세우는데 맨손 실패만 안 세운다.
// _purgeShown 은 이미 풀려 있어서 같은 사람이 또 뜨고,
// 매번 감염도 +32 · 오염도 +12 라 확정 사망까지 돈다.
(function fixPurge() {
    const iv = setInterval(function () {
        if (typeof doPurge !== 'function') return;
        if (doPurge._once) { clearInterval(iv); return; }

        const _p = doPurge;
        doPurge = function (code, nm, how) {
            const r = _p.apply(this, arguments);
            try {
                if (darkRun && code) {
                    if (!darkRun._purged) darkRun._purged = {};
                    darkRun._purged[code] = true;         // 되든 안 되든 한 번이면 끝
                }
            } catch (e) { }
            return r;
        };
        doPurge._once = true;
        clearInterval(iv);
        console.log('[S-010] 제압 중복 차단 연결');
    }, 500);
})();

// ==========================================
// 4. 합류 실패 — 혼자 떨어진 채로 끝까지 가던 것
// ==========================================
//
// solo 해제가 성공 분기에만 있다. 실패하면 감염도 +8 과 판정 -1 을
// 맞고도 플래그가 남아, 이후 모든 단계에서 본대와 따로 진행한다.
// 다시 합류할 방법이 없다. 실패는 손해를 주는 것이지 분리가 아니다.
(function fixRejoin() {
    const iv = setInterval(function () {
        if (typeof s010RejoinPick !== 'function') return;
        if (s010RejoinPick._solofix) { clearInterval(iv); return; }

        const _r = s010RejoinPick;
        s010RejoinPick = function (n, v) {
            const r = _r.apply(this, arguments);
            const pid = darkRun && darkRun.partyId;
            setTimeout(function () {
                if (!darkRun || !darkRun.isParty || !darkRun.solo) return;
                if (darkRun.partyId !== pid) return;
                darkRun.solo = false;
                if (database && pid) {
                    database.ref('darkParties/' + pid + '/solo/' + currentUser.code)
                        .remove().catch(function () { });
                }
                console.log('[S-010] 합류 판정이 끝나 혼자 표시를 풀었습니다.');
            }, 2800);
            return r;
        };
        s010RejoinPick._solofix = true;
        clearInterval(iv);
        console.log('[S-010] 합류 실패 복귀 연결');
    }, 500);
})();

// ==========================================
// 5. 리스너가 안 떨어지던 것
// ==========================================
//
// watchBites · watchPurge · watchWipe 는 .off() 를 부르는 곳이 없다.
// child_added 는 붙는 순간 기존 자식을 전부 재생하므로,
// 같은 파티로 다시 들어가면 과거 물림 기록이 쏟아져 들어온다.
const watched = [];

(function trackWatch() {
    const NAMES = ['watchBites', 'watchPurge', 'watchWipe'];
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        let left = 0;
        NAMES.forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._tracked) return;
            const _o = f;
            window[n] = function () {
                const before = database.ref;
                // 이번 호출이 어떤 경로를 보는지 가로채 적어 둔다
                database.ref = function (p) {
                    const ref = before.apply(this, arguments);
                    if (typeof p === 'string' && /darkParties\/.+\/(bites|purge|infect)$/.test(p)) {
                        if (watched.indexOf(p) < 0) watched.push(p);
                    }
                    return ref;
                };
                try { return _o.apply(this, arguments); }
                finally { database.ref = before; }
            };
            window[n]._tracked = true;
        });
        if (!left) { clearInterval(iv); console.log('[S-010] 리스너 추적 연결'); }
    }, 500);
})();

(function fixDetach() {
    const iv = setInterval(function () {
        if (typeof detachS010Listener !== 'function') return;
        if (detachS010Listener._all) { clearInterval(iv); return; }

        const _d = detachS010Listener;
        detachS010Listener = function () {
            const r = _d.apply(this, arguments);
            if (database) {
                watched.forEach(function (p) {
                    try { database.ref(p).off(); } catch (e) { }
                });
            }
            if (watched.length) console.log('[S-010] 리스너 ' + watched.length + '개를 뗐습니다.');
            watched.length = 0;
            return r;
        };
        detachS010Listener._all = true;
        clearInterval(iv);
        console.log('[S-010] 리스너 해제 연결');
    }, 500);
})();

// 탐사가 끝나는 모든 길목에서 떼어 준다 (원래는 두 곳에서만 불린다)
(function detachEverywhere() {
    ['renderDarkResult', 'finishDarkRun', 'finishDarkDeath', 'logout'].forEach(function (n) {
        const iv = setInterval(function () {
            const f = window[n];
            if (typeof f !== 'function') return;
            if (f._detach010) { clearInterval(iv); return; }
            const _o = f;
            window[n] = function () {
                const r = _o.apply(this, arguments);
                try { if (typeof detachS010Listener === 'function') detachS010Listener(); } catch (e) { }
                return r;
            };
            window[n]._detach010 = true;
            clearInterval(iv);
        }, 500);
    });
})();

// ==========================================
// 6. 전원 전향해도 전멸 처리가 안 되던 것
// ==========================================
//
// watchWipe() 가 S-010 이 아니라 B-508 쪽에 붙어 있다.
// 그래서 S-010 에서는 혼자 남아도 끝나지 않는다.
(function addWipe() {
    const iv = setInterval(function () {
        if (typeof renderStepS010 !== 'function' || typeof watchWipe !== 'function') return;
        if (renderStepS010._wipe) { clearInterval(iv); return; }

        const _r = renderStepS010;
        renderStepS010 = function () {
            const r = _r.apply(this, arguments);
            try {
                if (darkRun && darkRun.isParty && !darkRun._wipeOn) {
                    darkRun._wipeOn = true;
                    watchWipe();
                }
            } catch (e) { }
            return r;
        };
        renderStepS010._wipe = true;
        clearInterval(iv);
        console.log('[S-010] 전멸 감시 연결');
    }, 500);
})();

// ==========================================
// 7. 새로고침하면 상태가 날아가던 것
// ==========================================
//
// 저장되는 건 taleRole · lore · talePages · tabooCount 뿐이다.
// 감염도 · 전향 · 탐색 기록 · 굴 · qFlags 가 전부 빠져 있어서,
// 복귀하면 감염도 0, 인간으로 복귀, 탐색 제한 리셋(아이템 무한 수급),
// 정산에서 감염 0 으로 보고 +3000 까지 붙는다.
const EXTRA = [
    // S-010
    'infect', 'turned', 'turnGoal', 'turnDone', 'turnDeadline',
    's010Barricade', 's010Ending', 's010Searched', '_purged',
    // S-003
    'qFlags', 's003Lair', 's003Group', 'solo', 's003Stayed',
    's003Ending', 's003Route', '_s003Streak',
    // 공통
    'helper', 'critical', 'hiddenRoute'
];

(function fixSnapshot() {
    const iv = setInterval(function () {
        if (typeof saveDarkRunState !== 'function') return;
        if (saveDarkRunState._extra) { clearInterval(iv); return; }

        const _s = saveDarkRunState;
        saveDarkRunState = function () {
            const r = _s.apply(this, arguments);
            try {
                if (!darkRun || !database || !currentUser) return r;
                const add = {};
                EXTRA.forEach(function (k) {
                    const v = darkRun[k];
                    if (v === undefined) return;
                    add[k] = v;
                });
                if (Object.keys(add).length) {
                    database.ref('darkRuns/' + currentUser.code).update(add).catch(function () { });
                }
            } catch (e) { }
            return r;
        };
        saveDarkRunState._extra = true;
        clearInterval(iv);
        console.log('[어둠] 저장 항목 보강 연결');
    }, 500);
})();

(function fixResume() {
    const iv = setInterval(function () {
        if (typeof acceptDarkResume !== 'function') return;
        if (acceptDarkResume._extra) { clearInterval(iv); return; }

        const _a = acceptDarkResume;
        acceptDarkResume = function () {
            const s = window._pendingResume;                 // 원본이 비우기 전에 챙긴다
            const r = _a.apply(this, arguments);
            try {
                if (s && darkRun) {
                    EXTRA.forEach(function (k) {
                        if (s[k] !== undefined) darkRun[k] = s[k];
                    });
                    console.log('[어둠] 복귀 — 감염도·전향·탐색 기록을 되살렸습니다.');
                }
            } catch (e) { }
            return r;
        };
        acceptDarkResume._extra = true;
        clearInterval(iv);
        console.log('[어둠] 복귀 보강 연결');
    }, 500);
})();

// ==========================================
// 8. S-003 회수품 네 종이 죽어 있던 것
// ==========================================
//
// 읽는 쪽은 dark.js 에 전부 있는데 세우는 쪽이 어디에도 없다.
//   마른 빵부스러기 주머니 → s003_crumb    (dark.js:14477 찢어진 장 탐색 +3)
//   한쪽만 남은 유리 구두   → s003_shoe     (dark.js:14253 배역 판정 +6)
//   말을 삼킨 조개         → s003_shell    (dark.js:13830 금기 1회 무효)
//   찢어지지 않는 마지막 장 → s003_lastpage (dark.js:13712 이해도 한계 1회 버팀)
//
// usable:true 라 눌리기는 하는데 분기가 없어 아무 일도 없고 소모도 안 됐다.
const S003_DROP = {
    s003_crumb:    '길을 잃지 않습니다. 찢어진 장을 찾는 눈이 밝아집니다.',
    s003_shoe:     '발이 맞는 쪽으로 걷습니다. 배역 판정이 유리해집니다.',
    s003_shell:    '말을 삼켰습니다. 금기를 한 번 어겨도 넘어갑니다.',
    s003_lastpage: '찢어지지 않는 장을 쥐었습니다. 한 번은 버팁니다.'
};

(function fixDrops() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._s003drop) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || !S003_DROP[cat.effect]) return _u.apply(this, arguments);

            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            if ((currentUser.inventory || []).indexOf(itemName) === -1) return;

            // 탐사 중이면 지금 런에, 아니면 다음 런으로 넘긴다
            if (darkRun && typeof setQFlag === 'function') setQFlag(cat.effect, true);
            else if (typeof addPendingFlag === 'function') addPendingFlag(cat.effect, true);
            else { showCustomAlert('지금은 쓸 수 없습니다.'); return; }

            removeItemFromInventory(currentUser, itemName, 1);
            addHistoryLog(currentUser, '[어둠 회수품] ' + itemName);
            if (typeof saveSelfFull === 'function') saveSelfFull();
            if (typeof updateUI === 'function') updateUI();
            if (darkRun && typeof showDarkToast === 'function') showDarkToast('◈ ' + itemName);
            showCustomAlert(S003_DROP[cat.effect]);
        };
        useInventoryItem._s003drop = true;
        clearInterval(iv);
        console.log('[S-003] 회수품 4종 연결');
    }, 500);
})();

// ==========================================
// 9. 끝낼 때 흐르는 타이머를 먼저 멈춘다
// ==========================================
//
// finishDarkRun 이 darkRun = null 을 한 뒤에 stopAbsenceTimer() 를 부른다.
// 그 함수는 첫 줄이 if (!darkRun) return; 이라 아무것도 못 지운다.
(function fixAbsence() {
    const iv = setInterval(function () {
        if (typeof finishDarkRun !== 'function') return;
        if (finishDarkRun._pre) { clearInterval(iv); return; }

        const _f = finishDarkRun;
        finishDarkRun = function () {
            try { if (typeof stopAbsenceTimer === 'function') stopAbsenceTimer(); } catch (e) { }
            try {
                if (darkRun) {
                    clearInterval(darkRun._s010Timer);
                    clearInterval(darkRun._defTimer);
                }
            } catch (e) { }
            return _f.apply(this, arguments);
        };
        finishDarkRun._pre = true;
        clearInterval(iv);
        console.log('[어둠] 종료 전 타이머 정리 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.fixState = function () {
    const rows = [
        ['저장 빈 칸 거르기', typeof saveFields === 'function' && saveFields._nodef],
        ['사망 화면 보존', typeof darkDeath === 'function' && darkDeath._keep],
        ['사망 화면 보호 · 정산', typeof s010Result === 'function' && s010Result._deadGuard],
        ['사망 화면 보호 · S-003', typeof submitLoreCheck === 'function' && submitLoreCheck._deadGuard],
        ['제압 중복 차단', typeof doPurge === 'function' && doPurge._once],
        ['합류 실패 복귀', typeof s010RejoinPick === 'function' && s010RejoinPick._solofix],
        ['리스너 해제', typeof detachS010Listener === 'function' && detachS010Listener._all],
        ['전멸 감시', typeof renderStepS010 === 'function' && renderStepS010._wipe],
        ['저장 항목 보강', typeof saveDarkRunState === 'function' && saveDarkRunState._extra],
        ['복귀 보강', typeof acceptDarkResume === 'function' && acceptDarkResume._extra],
        ['S-003 회수품', typeof useInventoryItem === 'function' && useInventoryItem._s003drop],
        ['종료 전 정리', typeof finishDarkRun === 'function' && finishDarkRun._pre]
    ];
    console.log('%c===== 10/02 수정 =====', 'color:#4fc3f7; font-size:13px');
    console.table(rows.map(function (r) { return { 항목: r[0], 연결: r[1] ? 'O' : '✗' }; }));
    const bad = rows.filter(function (r) { return !r[1]; });
    if (bad.length) console.warn('  연결 안 된 것: ' + bad.map(function (r) { return r[0]; }).join(', '));
    else console.log('%c  전부 연결됐습니다.', 'color:#4CAF50');
    if (watched.length) console.log('  보고 있는 S-010 경로:', watched.join(', '));
};

console.log('[10/02] 수정 모음 — fixState()');

})();
