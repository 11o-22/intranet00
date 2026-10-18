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
//
// ■ 헬퍼인데 포인트가 들어오던 것 (2026-10-18)
//
//   막는 자리가 어둠의 정산(renderDarkResult) 하나뿐이었다.
//     · K 의 방(settle) · ■■의 ■■■(epicSettle) 은 정산을 따로 해서 그대로 받았다.
//     · 탐사 도중에 들어온 포인트 · 물건도 그대로 남았다.
//     · 정산을 바깥에서 감싼 것들(지산의 복 · 토크 쇼 · 달빛 문신 …)은
//       되돌린 **뒤에** 또 얹었다.
//     · 되돌리는 방법도 「화면의 값을 그때 값으로 덮기」였다. 포인트는
//       서버에 더하고 빼기로 가는데(save-merge), 화면 값만 덮으면 메아리가
//       돌아오며 되살아나는 때가 있었다.
//   그래서 아래 6 에서 **탐사 하나를 통째로** 본다. 헬퍼로 출발하는 순간의
//   포인트 · 소지품을 적어 두고, 탐사가 끝나 정산이 다 지나간 뒤 그때 모습으로
//   되돌린다 — 포인트는 changePoints 로 차이만큼, 소지품은 늘어난 것을 빼고
//   잃은 것을 돌려 준다. 갈래(어둠 · K 의 방 · ■■의 ■■■)를 가리지 않는다.
//   은행 점수는 헬퍼 탐사 동안 bankAddScore 를 통째로 막는다.

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

            // 알림은 아래 6 이 탐사가 다 끝난 뒤 한 번만 띄운다
            return out;
        };
        renderDarkResult._helper = true;
        clearInterval(iv);
        console.log('[파티] 헬퍼 보상 면제 연결');
    }, 500);
})();

// ==========================================
// 6. 헬퍼 탐사 하나를 통째로 — 끝나면 들어갈 때 모습으로
// ==========================================
const HK = 'helperRun_';
let H = null;                  // { k, code, pts, inv, at }
let hEnd = 0;                  // 끝난 뒤 정산이 다 지나갈 때까지 은행 점수를 막는다
const H_SETTLE_MS = 2500;      // 탐사가 끝난 뒤 이만큼 기다렸다가 맞춘다
const H_BOOT = Date.now();

function hKey(r) { return String(r.zone || '') + '|' + String(r.partyId || ''); }
function hSave() {
    try {
        if (!currentUser) return;
        if (H) localStorage.setItem(HK + currentUser.code, JSON.stringify(H));
        else localStorage.removeItem(HK + currentUser.code);
    } catch (e) { }
}
function hLoad(code) { try { return JSON.parse(localStorage.getItem(HK + code) || 'null'); } catch (e) { return null; } }
function helperGuard() { return !!H || Date.now() < hEnd; }
window.helperGuardOn = helperGuard;

function countOf(list) {
    const m = {};
    (Array.isArray(list) ? list : []).forEach(function (x) { if (x != null) m[x] = (m[x] || 0) + 1; });
    return m;
}

// 들어갈 때 모습으로 되돌린다
function hSettle(h) {
    const u = currentUser;
    if (!u || u.code !== h.code) return;
    const dp = (Number(h.pts) || 0) - (Number(u.points) || 0);
    if (dp) { try { changePoints(dp); } catch (e) { u.points = Number(h.pts) || 0; } }

    if (!Array.isArray(u.inventory)) u.inventory = [];
    const now = countOf(u.inventory), was = countOf(h.inv);
    const took = [], back = [];
    Object.keys(now).forEach(function (n) {
        const extra = now[n] - (was[n] || 0);
        if (extra > 0) {
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, n, extra);
            for (let i = 0; i < extra; i++) took.push(n);
        }
    });
    Object.keys(was).forEach(function (n) {
        const miss = was[n] - (now[n] || 0);
        for (let i = 0; i < miss; i++) { u.inventory.push(n); back.push(n); }
    });
    const lines = [];
    if (dp < 0) lines.push('포인트 ' + (-dp).toLocaleString() + ' P 를 되돌렸습니다.');
    if (dp > 0) lines.push('잃은 포인트 ' + dp.toLocaleString() + ' P 를 돌려받았습니다.');
    if (took.length) lines.push('회수품 ' + took.length + '개를 되돌렸습니다. (' + took.slice(0, 6).join(', ') + (took.length > 6 ? ' …' : '') + ')');
    if (back.length) lines.push('잃은 소지품 ' + back.length + '개를 돌려받았습니다.');
    if (took.length || back.length || dp) {
        try { addHistoryLog(u, '[헬퍼] 탐사에서 받은 것 · 잃은 것을 되돌렸습니다.'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    }
    console.log('[파티] 헬퍼 탐사 끝 — 포인트 ' + (dp || 0) + ' · 되돌린 물건 ' + took.length + ' · 돌려준 물건 ' + back.length);
    showCustomAlert('헬퍼로 들어온 탐사입니다.\n\n'
        + '포인트 · 은행 점수 · 회수품을 받지 않습니다.\n'
        + '대신 소지품도 잃지 않았고, 탐사 횟수도 줄지 않았습니다.'
        + (lines.length ? '\n\n' + lines.join('\n') : ''));
}

setInterval(function () {
    try {
        if (!currentUser) return;
        const r = (typeof darkRun !== 'undefined') ? darkRun : null;
        if (r && r.zone) {
            const k = hKey(r);
            if (H && H.k !== k) { H = null; hSave(); }
            if (!H) {
                // 새로고침 뒤 — 같은 탐사면 적어 둔 것을 이어 쓴다
                const old = hLoad(currentUser.code);
                if (old && old.k === k && old.code === currentUser.code && Date.now() - (old.at || 0) < 6 * 3600000) {
                    H = old;
                } else if (iAmHelper()) {
                    H = { k: k, code: currentUser.code, pts: Number(currentUser.points) || 0,
                          inv: (currentUser.inventory || []).slice(), at: Date.now(),
                          poll: Math.min(99, Number(currentUser.pollution) || 0) };
                    hSave();
                }
            }
            return;
        }
        if (H) {
            const h = H;
            H = null; hSave();
            hEnd = Date.now() + H_SETTLE_MS + 1500;
            hQuar = { code: h.code, poll: h.poll, until: Date.now() + H_QUAR_MS };
            setTimeout(function () { try { hSettle(h); } catch (e) { console.warn('[파티] 헬퍼 되돌리기:', e); } }, H_SETTLE_MS);
            return;
        }
        // 새로고침했는데 탐사가 이미 끝나 있다 — 적어 둔 것이 있으면 맞춘다
        if (Date.now() - H_BOOT > 12000) {
            const old = hLoad(currentUser.code);
            if (old && old.code === currentUser.code) {
                try { localStorage.removeItem(HK + currentUser.code); } catch (e) { }
                if (Date.now() - (old.at || 0) < 6 * 3600000) hSettle(old);
            }
        }
    } catch (e) { }
}, 300);

// 상담실 · 선녀탕 — 헬퍼는 가지 않는다 (2026-10-18)
//
//   헬퍼 탐사 중에(그리고 끝난 뒤 잠깐) 상담실 · 선녀탕에 들어가게 되면 그 자리에서
//   꺼낸다 — 어둠 사망 · K 의 방 쓰러짐 · ■■의 ■■■ 쓰러짐 모두 같은 칸
//   (quarantineUntil)에 적히므로 그것만 본다. 오염도는 출발할 때 값으로 돌린다
//   (100 으로 두면 나오자마자 다시 들어간다). 잃은 포인트 · 반입품은 위 hSettle 이
//   탐사가 끝난 뒤 돌려준다.
const H_QUAR_MS = 60000;       // 끝난 뒤 이만큼은 더 지킨다 (죽은 뒤 이송 화면이 늦게 뜰 수 있다)
let hQuar = null;              // { code, poll, until }
function hInQ(u) {
    try { if (typeof isQuarantined === 'function') return !!isQuarantined(u); } catch (e) { }
    return !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil);
}
setInterval(function () {
    try {
        const u = currentUser;
        if (!u) return;
        let poll = null;
        if (H && H.code === u.code) poll = H.poll;
        else if (hQuar && hQuar.code === u.code && Date.now() < hQuar.until) poll = hQuar.poll;
        if (poll == null || !hInQ(u)) return;
        u.quarantineUntil = 0;
        u.quarantineDest = null;
        u.quarantineHospital = false;
        u.quarantineExitPollution = 0;
        u.pollution = Math.min(99, Number(poll) || 0);
        u.lastPollutionTime = Date.now();
        u.foxRoomAnswered = false;
        const f = { quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1, quarantineExitPollution: 1,
                    pollution: 1, lastPollutionTime: 1, foxRoomAnswered: 1, history: 1 };
        if (u.badge && typeof u.badge.notes === 'string') {
            const arr = u.badge.notes.split(' | ').filter(function (n) {
                return n.trim() !== '' && n.indexOf('의식 불명') < 0 && n.indexOf('긴급 이송') < 0 && n.indexOf('사직 반려') < 0;
            });
            u.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
            f.badge = 1;
        }
        try { addHistoryLog(u, '[헬퍼] 상담실 · 선녀탕에 가지 않습니다.'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { }
        ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay',
         'quarantine-pick-overlay', 'fox-loading-overlay'].forEach(function (id) {
            const el = document.getElementById(id); if (el) el.style.display = 'none';
        });
        try { hasShownFoxAlert = false; } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        try { if (typeof showDarkToast === 'function') showDarkToast('헬퍼는 상담실 · 선녀탕에 가지 않습니다.'); } catch (e) { }
        console.log('[파티] 헬퍼 — 상담실 · 선녀탕에서 꺼냈습니다 (오염도 ' + u.pollution + ')');
    } catch (e) { }
}, 300);

// 은행 점수 — 헬퍼 탐사 동안은 통째로 막는다 (어둠 · K 의 방 · ■■의 ■■■ 모두)
(function hookBank() {
    setInterval(function () {
        const f = window.bankAddScore;
        if (typeof f !== 'function' || f._helperGuard) return;
        const w = function (delta, code) {
            try {
                const mine = !code || (currentUser && code === currentUser.code);
                if (mine && helperGuard()) return;
            } catch (e) { }
            return f.apply(this, arguments);
        };
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w._helperGuard = true;
        window.bankAddScore = w;
    }, 1500);
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