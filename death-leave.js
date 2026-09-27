// ==========================================
// ★ 어둠 사망 — 파티에서 빠지게
// index.html 에서 맨 뒤에 불러온다
// ==========================================
//
// 죽은 사람이 생존 명단에 남아 있으면
// 남은 사람들이 그 사람의 준비를 영영 기다린다.
// 죽는 즉시 명단에서 빼고, 방장이었으면 다음 사람에게 넘긴다.

(function hookDeathLeave() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._partyLeave) { clearInterval(iv); return; }

        const _d = darkDeath;
        darkDeath = function () {
            // 죽기 전에 기억해 둔다 — darkDeath 가 darkRun 을 지울 수 있다
            const pid = darkRun ? darkRun.partyId : null;
            const wasDead = darkRun ? !!darkRun._dead : false;

            const r = _d.apply(this, arguments);

            // 살아남았으면(보호 아이템 등) 그냥 둔다
            setTimeout(function () {
                const stillIn = darkRun && !darkRun._dead;
                if (stillIn && !wasDead) return;
                leaveParty(pid);
            }, 300);

            return r;
        };
        darkDeath._partyLeave = true;
        clearInterval(iv);
        console.log('[사망] 파티 이탈 처리 연결');
    }, 500);
})();

// 파티에서 뺀다
function leaveParty(pid) {
    if (!database || !currentUser) return;
    const me = currentUser.code;

    function doLeave(id) {
        return database.ref('darkParties/' + id).once('value').then(function (s) {
            const p = s.val();
            if (!p || !p.alive || !p.alive[me]) return false;

            const up = {};
            up['darkParties/' + id + '/alive/' + me] = null;
            up['darkParties/' + id + '/dead/' + me] = Date.now();
            up['darkParties/' + id + '/solo/' + me] = null;

            // 방장이었으면 남은 사람에게 넘긴다
            if (p.leader === me) {
                const rest = Object.keys(p.alive).filter(function (c) { return c !== me; });
                if (rest.length) up['darkParties/' + id + '/leader'] = rest[0];
            }

            return database.ref('/').update(up).then(function () {
                const nm = (p.members && p.members[me] && p.members[me].name) || currentUser.name;
                if (typeof sendPartyChat === 'function') {
                    try { sendPartyChat(nm + ' 사원이 더 이상 함께하지 않습니다.', true); } catch (e) { }
                }
                console.log('[사망] 파티에서 빠졌습니다. (' + id + ')');
                return true;
            });
        });
    }

    if (pid) { doLeave(pid); return; }

    // 파티 번호를 모르면 훑는다
    database.ref('darkParties').once('value').then(function (s) {
        const all = s.val() || {};
        Object.keys(all).forEach(function (id) {
            if (all[id] && all[id].alive && all[id].alive[me]) doLeave(id);
        });
    });
}

// ==========================================
// 수동 — 이미 막혀 있을 때
// ==========================================

// 내가 죽었는데 명단에 남아 있으면 스스로 뺀다
function leaveDeadParty() {
    leaveParty(null);
}

// 죽은 사람이 명단에 남아 막고 있으면 치운다 (방장·상담사용)
function clearDeadFromParty() {
    if (!darkRun || !darkRun.partyId) { console.log('파티 탐사 중이 아닙니다.'); return; }
    const pid = darkRun.partyId;
    database.ref('darkParties/' + pid).once('value').then(function (s) {
        const p = s.val() || {};
        const dead = Object.keys(p.dead || {});
        const up = {};
        dead.forEach(function (c) {
            if ((p.alive || {})[c]) up['darkParties/' + pid + '/alive/' + c] = null;
        });
        if (!Object.keys(up).length) { console.log('생존 명단에 죽은 사람이 없습니다.'); return; }
        database.ref('/').update(up).then(function () {
            console.log('%c✓ ' + Object.keys(up).length + '명을 명단에서 뺐습니다.', 'color:#4CAF50');
        });
    });
}

// 지금 누가 막고 있는지
function whoIsBlocking() {
    if (!darkRun || !darkRun.partyId) { console.log('파티 탐사 중이 아닙니다.'); return; }
    const pid = darkRun.partyId;
    database.ref('darkParties/' + pid).once('value').then(function (s) {
        const p = s.val() || {};
        const nm = function (c) { return (p.members && p.members[c] ? p.members[c].name : c); };
        const alive = Object.keys(p.alive || {});
        const solo = Object.keys(p.solo || {});
        const dead = Object.keys(p.dead || {});
        const k = 'ready' + darkRun.step;
        const got = Object.keys(p[k] || {});
        const need = alive.filter(function (c) { return solo.indexOf(c) < 0; });

        console.log('%c===== 파티 =====', 'color:#c9a8ff; font-size:13px');
        console.log('  방장:', nm(p.leader));
        console.log('  생존:', alive.map(nm).join(', ') || '(없음)');
        console.log('  죽음:', dead.map(nm).join(', ') || '(없음)');
        console.log('  혼자:', solo.map(nm).join(', ') || '(없음)');
        console.log('  ' + k + ': ' + got.length + ' / ' + need.length);
        const late = need.filter(function (c) { return got.indexOf(c) < 0; });
        console.log('  기다리는 중:', late.map(nm).join(', ') || '없음');
        const ghost = late.filter(function (c) { return dead.indexOf(c) >= 0; });
        if (ghost.length) console.warn('  ← 죽은 사람이 막고 있습니다: ' + ghost.map(nm).join(', ') + ' · clearDeadFromParty()');
    });
}

console.log('[사망] leaveDeadParty() · clearDeadFromParty() · whoIsBlocking()');