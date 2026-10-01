// ==========================================
// ★ 파티 나가기 고치기 · 헬퍼 참가
// index.html 에서 맨 뒤쪽 — save-merge.js 앞에 불러온다
// ==========================================
//
// 1. 「파티 나가기」가 눌러도 아무 일이 없던 것
//    원인 두 가지였다.
//      ㄱ. 첫 줄이 getMyParty() 였다. 이건 darkParties[myPartyId] 를 그대로
//          돌려주는데, 목록이 아직 안 내려왔거나 방이 지워진 참이면 null 이
//          되고, 바로 return 한다. 소속은 남아 있는데 아무 말 없이 끝난다.
//      ㄴ. 서버 쓰기에 .catch 가 하나도 없었다. 쓰기가 막히면 화면만
//          비워지고, 다음 순간 darkParties 리스너가 명단을 다시 읽어
//          소속을 되돌려 놓는다. 누른 적도 없는 것처럼 보인다.
//    이제 myPartyId 만으로 움직이고, 지워졌는지 확인한 뒤에야 끝낸다.
//    못 지웠으면 이유를 말해 준다.
//
// 2. 헬퍼 — 새로 온 사원을 도우러 들어가는 자리
//    탐사 횟수를 쓰지 않는다. 횟수가 0이어도 들어갈 수 있다.
//    포인트 · 은행 점수 · 회수품을 받지 않는다. 대신 소지품도 잃지 않는다.
//    (오염도와 포만감은 그대로 — 몸으로 치르는 값은 남겨 두었다)

(function partyHelper() {

const KEY = 'darkHelperMode';      // 이 창의 헬퍼 참가 여부

function helperOn() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return !!window._helperMode; }
}
function setHelper(v) {
    window._helperMode = !!v;
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { }
}

function myPid() {
    if (typeof myPartyId !== 'undefined' && myPartyId) return myPartyId;
    if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId) return darkRun.partyId;
    return null;
}

// 내가 이번 탐사에 헬퍼로 들어가 있는가
function iAmHelper() {
    if (!currentUser) return false;
    if (typeof darkRun !== 'undefined' && darkRun && darkRun.helper) return true;
    const pid = myPid();
    if (!pid || typeof darkParties === 'undefined' || !darkParties[pid]) return false;
    const m = (darkParties[pid].members || {})[currentUser.code];
    return !!(m && m.helper);
}
window.iAmHelper = iAmHelper;

// 파티 명단에 헬퍼 표시를 남긴다
function markHelper(pid) {
    if (!database || !pid || !currentUser) return;
    database.ref('darkParties/' + pid + '/members/' + currentUser.code + '/helper')
        .set(true).catch(function (e) { console.warn('[파티] 헬퍼 표시 실패:', e && e.message); });
    setTimeout(function () {
        if (typeof sendPartyChat === 'function') {
            try { sendPartyChat(currentUser.name + ' 사원이 헬퍼로 들어왔습니다. (보상 없음 · 횟수 차감 없음)', true); } catch (e) { }
        }
    }, 700);
}

// 횟수 검사를 잠깐 통과시킨다 — 헬퍼는 횟수를 쓰지 않으니까
function withTriesOpen(fn) {
    if (typeof getDarkTriesLeft !== 'function') return fn();
    const _g = getDarkTriesLeft;
    getDarkTriesLeft = function () { return Math.max(1, _g.apply(this, arguments)); };
    try { return fn(); }
    finally { getDarkTriesLeft = _g; }
}

// ==========================================
// 1. 파티 나가기
// ==========================================
(function hookLeave() {
    const iv = setInterval(function () {
        if (typeof leaveParty !== 'function') return;
        if (leaveParty._fixed) { clearInterval(iv); return; }

        leaveParty = function () {
            if (!currentUser) return;
            const pid = myPid();
            if (!pid) { showCustomAlert('속한 파티가 없습니다.'); return; }

            const p = (typeof darkParties !== 'undefined' && darkParties[pid]) || null;

            // 이미 출발한 탐사 중이면 나갈 자리가 아니다.
            // 단, 끝난 뒤 남아 있는 darkRun 때문에 갇히지 않도록 같은 파티일 때만 막는다.
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId === pid
                && p && p.state === 'RUNNING') {
                showCustomAlert('탐사가 진행 중입니다. 지금은 파티에서 나갈 수 없습니다.');
                return;
            }
            if (!database) { showCustomAlert('서버에 닿지 못했습니다. 잠시 뒤 다시 눌러 주세요.'); return; }

            const members = (p && p.members) || {};
            const others = Object.keys(members).filter(function (c) { return c !== currentUser.code; });
            const mine = 'darkParties/' + pid + '/members/' + currentUser.code;
            const iAmLeader = !!(p && p.leader === currentUser.code);

            if (others.length > 0 && typeof sendPartyChat === 'function') {
                try { sendPartyChat(currentUser.name + ' 사원이 파티를 떠났습니다.', true); } catch (e) { }
            }

            // 끊김 예약 해제 — 실패해도 다음은 그대로 간다
            try { database.ref(mine).onDisconnect().cancel(); } catch (e) { }

            const jobs = [];
            if (p && others.length === 0) {
                // 나 혼자였다 — 방을 접는다
                jobs.push(database.ref('darkParties/' + pid).remove());
                jobs.push(database.ref('darkChats/' + pid).remove());
                if (p.zone) jobs.push(database.ref('darkOccupancy/' + p.zone).remove());
            } else {
                if (iAmLeader && others.length > 0) {
                    const next = members[others[0]];
                    if (next) {
                        jobs.push(database.ref('darkParties/' + pid)
                            .update({ leader: next.code, leaderName: next.name }));
                    }
                }
                // 명단이 안 내려온 경우까지 포함해, 내 자리만은 반드시 지운다
                jobs.push(database.ref(mine).remove());
            }

            Promise.all(jobs.map(function (j) {
                return j.then(function () { return null; }, function (e) { return e || new Error('실패'); });
            })).then(function (errs) {
                const bad = errs.filter(Boolean);
                if (bad.length) {
                    console.error('[파티] 나가기 쓰기 실패:', bad);
                    showCustomAlert('파티에서 나가지 못했습니다.\n\n' + (bad[0].message || bad[0]));
                    return;
                }
                // 정말 지워졌는지 확인하고서야 끝낸다
                return database.ref(mine).once('value').then(function (s) {
                    if (s.exists()) {
                        console.error('[파티] 명단에 아직 남아 있습니다:', mine);
                        showCustomAlert('파티에서 나가지 못했습니다.\n명단에 아직 남아 있습니다. 다시 눌러 주세요.');
                        return;
                    }
                    finish(pid);
                });
            }).catch(function (e) {
                console.error('[파티] 나가기 실패:', e);
                showCustomAlert('파티에서 나가지 못했습니다.\n\n' + (e && e.message ? e.message : e));
            });
        };

        function finish(pid) {
            if (typeof darkParties !== 'undefined' && darkParties[pid]) delete darkParties[pid];
            myPartyId = null;
            if (typeof detachChatListener === 'function') { try { detachChatListener(); } catch (e) { } }
            if (typeof partyChatOpen !== 'undefined') partyChatOpen = false;
            if (typeof renderPartyPanel === 'function') { try { renderPartyPanel(); } catch (e) { } }
            if (typeof updatePartyTabDot === 'function') { try { updatePartyTabDot(); } catch (e) { } }
            paint();
            console.log('[파티] 나왔습니다.');
        }

        leaveParty._fixed = true;
        clearInterval(iv);
        console.log('[파티] 나가기 고침');
    }, 500);
})();

// ==========================================
// 2. 헬퍼로 들어가기
// ==========================================
(function hookJoin() {
    const iv = setInterval(function () {
        if (typeof joinParty !== 'function') return;
        if (joinParty._helper) { clearInterval(iv); return; }

        const _j = joinParty;
        joinParty = function (pid) {
            if (!helperOn()) return _j.apply(this, arguments);
            const self = this, args = arguments;
            const r = withTriesOpen(function () { return _j.apply(self, args); });
            if (typeof myPartyId !== 'undefined' && myPartyId === pid) markHelper(pid);
            return r;
        };
        joinParty._helper = true;
        clearInterval(iv);
        console.log('[파티] 헬퍼 참가 연결');
    }, 500);
})();

// 헬퍼가 직접 파티를 열 때도 같게 둔다
(function hookCreate() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function') return;
        if (createParty._helper) { clearInterval(iv); return; }

        const _c = createParty;
        createParty = function (zone) {
            if (!helperOn()) return _c.apply(this, arguments);
            const self = this, args = arguments;
            const before = (typeof myPartyId !== 'undefined') ? myPartyId : null;
            const r = withTriesOpen(function () { return _c.apply(self, args); });
            if (typeof myPartyId !== 'undefined' && myPartyId && myPartyId !== before) markHelper(myPartyId);
            return r;
        };
        createParty._helper = true;
        clearInterval(iv);
        console.log('[파티] 헬퍼 편성 연결');
    }, 500);
})();

// ==========================================
// 3. 출발 — 헬퍼는 횟수를 쓰지 않는다
// ==========================================
(function hookLaunch() {
    const iv = setInterval(function () {
        if (typeof launchPartyRun !== 'function') return;
        if (launchPartyRun._helper) { clearInterval(iv); return; }

        const _l = launchPartyRun;
        launchPartyRun = function (party) {
            const me = (party && party.members) ? party.members[currentUser.code] : null;
            const helper = !!(me && me.helper);
            const keep = currentUser ? currentUser.darkTries : null;

            const r = _l.apply(this, arguments);
            if (!helper || !currentUser) return r;

            currentUser.darkTries = keep;                      // 쓴 것으로 치지 않는다
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId === party.id) {
                darkRun.helper = true;
                // 새로고침해도 헬퍼였다는 것이 남도록 다시 적어 둔다
                if (typeof saveDarkRunState === 'function') { try { saveDarkRunState(); } catch (e) { } }
            }
            if (typeof saveFields === 'function') { try { saveFields({ darkTries: 1 }); } catch (e) { } }

            setTimeout(function () {
                if (typeof showDarkToast === 'function') showDarkToast('헬퍼로 들어왔습니다. 횟수는 줄지 않습니다.');
            }, 1200);
            return r;
        };
        launchPartyRun._helper = true;
        clearInterval(iv);
        console.log('[파티] 헬퍼 횟수 면제 연결');
    }, 500);
})();

// ==========================================
// 4. 정산 — 헬퍼는 받지도, 잃지도 않는다
// ==========================================
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._helper) { clearInterval(iv); return; }

        // 은행 점수를 적는 자리를 잠깐 막는다.
        // bank.js 가 window 에 얹어 둔 경우가 보통이고,
        // 그렇지 않은 경우를 위해 bank 가 든 칸을 따로 적어 두었다가 되돌린다.
        function bankKeys(u) {
            const out = {};
            Object.keys(u).forEach(function (k) {
                if (/bank/i.test(k)) out[k] = u[k];
            });
            return out;
        }

        const _r = renderDarkResult;
        renderDarkResult = function () {
            if (!iAmHelper() || !currentUser) return _r.apply(this, arguments);

            const pts = currentUser.points;
            const inv = (currentUser.inventory || []).slice();
            const bk = bankKeys(currentUser);
            const _bank = window.bankAddScore;
            const stubbed = (typeof _bank === 'function');
            if (stubbed) window.bankAddScore = function () { };

            let out;
            try { out = _r.apply(this, arguments); }
            finally {
                if (stubbed) window.bankAddScore = _bank;
                currentUser.points = pts;                      // 포인트 되돌리기
                if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
                currentUser.inventory.length = 0;              // 회수품·소실 되돌리기
                inv.forEach(function (x) { currentUser.inventory.push(x); });
                Object.keys(bk).forEach(function (k) { currentUser[k] = bk[k]; });
                const f = { points: 1, inventory: 1 };
                Object.keys(bk).forEach(function (k) { f[k] = 1; });
                if (typeof saveFields === 'function') { try { saveFields(f); } catch (e) { } }
            }

            setTimeout(function () {
                showCustomAlert('헬퍼로 들어온 탐사입니다.\n\n'
                    + '포인트 · 은행 점수 · 회수품을 받지 않습니다.\n'
                    + '대신 소지품도 잃지 않았고, 탐사 횟수도 줄지 않았습니다.');
            }, 900);
            return out;
        };
        renderDarkResult._helper = true;
        clearInterval(iv);
        console.log('[파티] 헬퍼 보상 면제 연결');
    }, 500);
})();

// ==========================================
// 5. 켜고 끄는 자리 — [파티 편성] 맨 위
// ==========================================
window.toggleHelperMode = function () {
    setHelper(!helperOn());
    paint();
    showCustomAlert(helperOn()
        ? '헬퍼로 참가합니다.\n\n탐사 횟수를 쓰지 않고, 보상도 받지 않습니다.\n이대로 파티에 들어가시면 됩니다.'
        : '보통 참가로 돌아왔습니다.');
};

function paint() {
    const box = document.getElementById('helper-switch');
    if (!box) return;
    const on = helperOn();
    const now = iAmHelper();

    // 이번 파티의 헬퍼 명단
    let tag = '';
    const pid = myPid();
    if (pid && typeof darkParties !== 'undefined' && darkParties[pid]) {
        const m = darkParties[pid].members || {};
        const hs = Object.keys(m).filter(function (c) { return m[c].helper; })
            .map(function (c) { return m[c].name; });
        if (hs.length) {
            tag = '<div style="font-size:10px; color:#81c784; margin-top:7px; padding-top:7px;'
                + ' border-top:1px dashed #2e7d32;">이번 파티의 헬퍼 — ' + hs.join(', ') + '</div>';
        }
    }

    box.style.borderColor = (on || now) ? '#2e7d32' : '#3a3a3a';
    box.style.background = (on || now) ? 'rgba(76,175,80,0.09)' : 'rgba(0,0,0,0.22)';
    box.innerHTML =
        '<div style="display:flex; align-items:center; gap:9px;">'
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:12px; font-weight:bold; color:' + (on ? '#81c784' : '#aaa') + ';">'
        + '헬퍼로 참가' + (on ? ' — 켜짐' : '') + '</div>'
        + '<div style="font-size:10px; color:#888; margin-top:3px; line-height:1.6;">'
        + '탐사 횟수를 쓰지 않고, 보상도 받지 않습니다. 새로 온 사원을 도울 때 쓰세요.</div>'
        + '</div>'
        + '<button class="game-btn" style="margin:0; padding:8px 14px; font-size:11px; flex-shrink:0;'
        + (on ? ' background:linear-gradient(145deg,#388e3c,#2e7d32) !important; border-color:#4CAF50 !important; color:#fff !important;' : '')
        + '" onclick="toggleHelperMode()">' + (on ? '끄기' : '켜기') + '</button>'
        + '</div>' + tag;
}

(function mount() {
    setInterval(function () {
        if (!currentUser) return;
        const panel = document.getElementById('dark-party');
        if (!panel) return;
        if (!document.getElementById('helper-switch')) {
            const el = document.createElement('div');
            el.id = 'helper-switch';
            el.style.cssText = 'border:1px solid #3a3a3a; border-radius:6px; padding:10px 12px; margin-bottom:10px;';
            // 본문(#dark-party-body)은 다시 그려지므로, 그 앞에 둔다
            const body = document.getElementById('dark-party-body');
            if (body) panel.insertBefore(el, body); else panel.appendChild(el);
        }
        paint();
    }, 1500);
})();

// ==========================================
// 확인
// ==========================================
window.helperState = function () {
    console.log('%c===== 헬퍼 =====', 'color:#81c784; font-size:13px');
    console.log('  이 창 설정:', helperOn() ? '켜짐 (다음 참가부터 헬퍼)' : '꺼짐');
    console.log('  지금 헬퍼로 들어가 있나:', iAmHelper() ? 'O' : '-');
    console.log('  오늘 남은 탐사 횟수:', (typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft() : '-');
    const pid = myPid();
    if (pid && typeof darkParties !== 'undefined' && darkParties[pid]) {
        const m = darkParties[pid].members || {};
        console.log('  파티:', pid, '· 상태:', darkParties[pid].state);
        console.log('  파티원:', Object.keys(m).map(function (c) {
            return m[c].name + (m[c].helper ? '(헬퍼)' : '');
        }).join(', '));
    } else if (pid) {
        console.log('  소속은 ' + pid + ' 인데 명단이 안 내려와 있습니다. 나가기는 됩니다.');
    } else console.log('  속한 파티: 없음');
    console.log('  은행 함수:', (typeof window.bankAddScore === 'function') ? 'window 에 있음 (막을 수 있음)' : '✗ window 에 없음 (bank 칸으로 되돌림)');
    console.log('  연결 — 나가기:', (typeof leaveParty === 'function' && leaveParty._fixed) ? 'O' : '✗',
        '· 참가:', (typeof joinParty === 'function' && joinParty._helper) ? 'O' : '✗',
        '· 편성:', (typeof createParty === 'function' && createParty._helper) ? 'O' : '✗',
        '· 출발:', (typeof launchPartyRun === 'function' && launchPartyRun._helper) ? 'O' : '✗',
        '· 정산:', (typeof renderDarkResult === 'function' && renderDarkResult._helper) ? 'O' : '✗');
};

console.log('[파티] helperState() · toggleHelperMode()');

})();