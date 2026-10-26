// ==========================================
// ★ 파티 탐사 — 내 자리 지키기 · 방을 지우기 전에 한 번 더 보기
// bundles.json 맨 끝 (chat-fix.js · party-helper.js · chilseong.js 뒤)
// ==========================================
//
// ■ 무엇이 일어났나 — S-003 「동화의 뒷면」
//
//   · 대화가 통째로 날아간다
//   · 「0 / 0명 준비」 가 몇 걸음씩 뜬다
//   · 무곡 치성(×7)이 「(전원 생환)」 으로 떨어진다
//
//   alive/<나> 는 끊기면 서버가 지운다 (onDisconnect · index.html launchPartyRun).
//   다시 붙으면 .info/connected 에서 한 번 다시 적는다. 그런데
//
//     ㄱ. 손전화가 덮였다 열리면 새 연결로 먼저 붙고, 서버는 옛 연결이 끊긴 것을
//         한참 뒤에 알아챈다. 그때 옛 연결의 「지워라」 가 돈다 — 방금 다시 적은
//         alive/<나> 가 지워지고, 그 뒤로는 다시 적을 일이 없다.
//     ㄴ. 복귀 창으로 돌아온 사람(acceptDarkResume)은 다시 적는 귀가 아예 없다.
//     ㄷ. 구조 화면에서 쓰러진 뒤(confirmDeath) 보호로 살아나면 alive 는 지워진 채다.
//
//   그렇게 alive 가 하나둘 비면
//     · 준비 칸이 alive 만 세므로 「0 / 0명 준비」 — 걸음마다 시간 다 채우고 넘어간다
//     · 방장 화면이 3 분 뒤 alive 에 없는 사람을 명단(members)에서 뺀다
//     · 어둠 지도를 연 다른 사원 화면이 「alive 가 빈 RUNNING 방」 을 바로 지운다 (isZoneTaken)
//     · 5 분 넘게 비어 보이면 다른 사원 화면이 방 · 대화를 통째로 지운다 (chat-fix ㅁ)
//     · 먼저 나온 사람이 「alive · 명단 다 비었다」 고 보고 방 · 대화를 지운다 (partyRunCleanup)
//   → 대화가 날아가고, 방에 적힌 chilMug 도 같이 날아간다.
//
// ■ 어떻게 하나
//
//   ① 탐사 중인 동안 내 자리를 계속 지킨다 (8 초마다 · 다시 붙을 때 · 쪽이 다시 보일 때 · 지워지는 순간)
//        alive/<나> · members/<나> · roster/<나>
//        방 뼈대(id · zone · state · leader · startedAt …)가 통째로 사라졌으면 들고 있던 것으로 되돌린다
//        chilMug · taleCast 도 사라졌으면 되돌린다
//      죽음 · 귀환 · 퇴근 · 정산 화면(step 99)에서는 손대지 않는다.
//   ② 30 초마다 내 진행 기록(darkRuns/<나>)의 시각을 새로 적는다.
//      (복귀 창의 「5 분 넘게 떠나 있었다」 도 이 시각으로 센다 — 출발 때 한 번만 적혀
//       방금까지 있던 사람이 새로 열면 실패 처리되던 것도 같이 멎는다)
//   ③ 방을 지우는 자리는 전부 먼저 darkStillIn() 으로 묻는다.
//        이 방을 아직 걷고 있는 사람 — darkRuns/<사번>.partyId 가 이 방이고
//        10 분 안에 기록이 새로 적혔거나, 접속해 있고 30 분 안에 적힌 사람 — 이 하나라도 있으면 지우지 않는다.
//
// ■ 확인
//
//   partyKeep()      지금 지키는 방 · 되돌린 횟수
//
// 2026-10-27

(function partyKeep() {
'use strict';

const TICK = 8000;                      // 자리를 살피는 간격
const STAMP = 30000;                    // 진행 기록 시각을 새로 적는 간격
const GRACE = 10 * 60 * 1000;           // 기록이 이만큼 안에 적혔으면 아직 걷는 사람 (덮어 둔 손전화도)
const GRACE_ON = 30 * 60 * 1000;        // 접속해 있으면 이만큼까지
const BASE = ['id', 'zone', 'state', 'leader', 'leaderName', 'createdAt', 'startedAt'];
const EXTRA = ['chilMug', 'taleCast'];

function db() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }
function me() { try { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; } catch (e) { return null; } }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function rooms() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
function online(code) {
    try { return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[code]); } catch (e) { return false; }
}
function keys(o) { return (o && typeof o === 'object') ? Object.keys(o) : []; }

// 지금 이 방을 걷고 있나 — 죽음 · 정산 · 퇴근 뒤에는 손대지 않는다
function active() {
    const r = run(), u = me();
    if (!r || !u || !r.isParty || !r.partyId) return null;
    if (r.epic || r.kroom || r.finale) return null;           // EPIC · K의 방 · 피날레는 제 길로 센다
    if (r._dead || r.dying || r.failedRun || r._resigned || r._settled) return null;
    if ((Number(r.step) || 0) >= 99) return null;
    if (window._darkDone === r.partyId) return null;
    if (Array.isArray(u.dkDone) && u.dkDone.indexOf(r.partyId) >= 0) return null;
    return r;
}

// ==========================================
// ③ 이 방을 아직 걷는 사람이 있나 — 지우는 자리마다 먼저 묻는다
// ==========================================
//   codes  — 살펴볼 사번들 (비면 방에 적힌 사람 전부)
//   except — 빼고 볼 사번 (보통 나)
//   → 걷고 있는 사람의 사번 하나, 없으면 null
function codesOf(p) {
    const s = {};
    if (!p) return [];
    ['members', 'alive', 'roster', 'solo', 'taleCast'].forEach(function (k) { keys(p[k]).forEach(function (c) { s[c] = 1; }); });
    return Object.keys(s);
}
function stillIn(pid, p, except) {
    const d = db();
    if (!d || !pid) return Promise.resolve(null);
    // 내 화면에서 이 방을 걷고 있으면 그것으로 끝이다
    const r = active(), u = me();
    if (r && u && r.partyId === pid && u.code !== except) return Promise.resolve(u.code);
    const list = codesOf(p).filter(function (c) { return c && c !== except; });
    if (!list.length) return Promise.resolve(null);
    const now = Date.now();
    return Promise.all(list.map(function (c) {
        return d.ref('darkRuns/' + c).once('value').then(function (s) {
            const v = s.val();
            if (!v || v.partyId !== pid) return null;
            const age = now - (Number(v.savedAt) || 0);
            if (age < GRACE || (online(c) && age < GRACE_ON)) return c;
            return null;
        }).catch(function () { return null; });
    })).then(function (hits) {
        for (let i = 0; i < hits.length; i++) if (hits[i]) return hits[i];
        return null;
    });
}
window.darkStillIn = function (pid, p, except) {
    if (p === undefined) p = rooms()[pid] || null;
    return stillIn(pid, p, except);
};
// 바로 답해야 하는 자리(isZoneTaken)용 — 방에 적힌 사람 가운데 접속해 있는 사람이 있나
//   (다 나온 사람은 나올 때 members · alive · roster 에서 빠진다 — 그 셋만 본다)
window.darkRoomOnline = function (p) {
    if (!p) return false;
    const s = {};
    ['members', 'alive', 'roster'].forEach(function (k) { keys(p[k]).forEach(function (c) { s[c] = 1; }); });
    return Object.keys(s).some(function (c) { return online(c); });
};

// ==========================================
// ① 내 자리 지키기
// ==========================================
let hold = { pid: null, base: null, mine: null, extra: {} };
let ear = null, earPid = null, earCb = null;   // alive/<나> 가 지워지는 순간을 듣는 귀
let lastStamp = 0;
const fixed = { alive: 0, members: 0, roster: 0, base: 0, chilMug: 0, taleCast: 0, stamp: 0 };
let lastFix = '';

function remember(pid, p, u) {
    if (hold.pid !== pid) hold = { pid: pid, base: null, mine: null, extra: {} };
    if (!p) return;
    if (p.state === 'RUNNING' && p.zone) {
        const b = {};
        BASE.forEach(function (k) { if (p[k] != null) b[k] = p[k]; });
        hold.base = b;
    }
    if (p.members && p.members[u.code]) hold.mine = p.members[u.code];
    EXTRA.forEach(function (k) { if (p[k]) hold.extra[k] = p[k]; });
}

function mineOf(r, u) {
    if (hold.mine) return hold.mine;
    return {
        code: u.code, name: u.name || '', position: u.position || '사원', ready: true,
        equips: (r.carryEquips || []).slice(), items: (r.carryItems || []).slice(), joinedAt: Date.now()
    };
}

function listen(pid, code) {
    const d = db();
    if (!d) return;
    if (earPid === pid && ear) return;
    unlisten();
    earPid = pid;
    ear = d.ref('darkParties/' + pid + '/alive/' + code);
    earCb = function (s) {
        if (s.val()) return;
        // 지워졌다 — 아직 걷고 있으면 곧바로 다시 앉는다 (죽음 · 귀환이면 active 가 막는다)
        setTimeout(function () { try { tick('지워짐'); } catch (e) { } }, 600);
    };
    ear.on('value', earCb);
}
function unlisten() {
    if (ear && earCb) { try { ear.off('value', earCb); } catch (e) { } }
    ear = null; earPid = null; earCb = null;
}

function tick(why) {
    const r = active(), u = me(), d = db();
    if (!r || !u || !d) {
        if (!r) { unlisten(); hold = { pid: null, base: null, mine: null, extra: {} }; }
        return;
    }
    const pid = r.partyId, code = u.code;
    const p = rooms()[pid] || null;
    remember(pid, p, u);
    listen(pid, code);

    const root = 'darkParties/' + pid + '/';
    const up = {};
    const did = [];

    // 방이 통째로 지워졌다 — 들고 있던 뼈대로 되돌린다
    if (!p || !p.state) {
        const b = hold.base || { id: pid, zone: r.zone, state: 'RUNNING', startedAt: Date.now(), createdAt: Date.now() };
        BASE.forEach(function (k) { if (b[k] != null && (!p || p[k] == null)) up[root + k] = b[k]; });
        if (!b.state) up[root + 'state'] = 'RUNNING';
        did.push('base');
    }
    EXTRA.forEach(function (k) {
        if (hold.extra[k] && (!p || !p[k])) { up[root + k] = hold.extra[k]; did.push(k); }
    });
    if (!p || !p.alive || !p.alive[code]) { up[root + 'alive/' + code] = true; did.push('alive'); }
    if (!p || !p.members || !p.members[code]) { up[root + 'members/' + code] = mineOf(r, u); did.push('members'); }
    if (!p || !p.roster || !p.roster[code]) { up[root + 'roster/' + code] = true; did.push('roster'); }

    if (did.length) {
        d.ref('/').update(up).then(function () {
            did.forEach(function (k) { fixed[k] = (fixed[k] || 0) + 1; });
            const shown = did.filter(function (k) { return k !== 'roster'; });
            if (shown.length) {
                lastFix = new Date().toLocaleTimeString() + ' ' + shown.join(' · ') + (why ? ' (' + why + ')' : '');
                console.log('[파티] 내 자리를 다시 적었습니다 — ' + shown.join(' · ') + ' · ' + pid + (why ? ' (' + why + ')' : ''));
            }
        }).catch(function (e) { console.warn('[파티] 자리 다시 적기 실패:', e && e.message); });
        if (did.indexOf('alive') >= 0) {
            try { d.ref(root + 'alive/' + code).onDisconnect().remove(); } catch (e) { }
        }
    }

    // ② 진행 기록 시각
    if (Date.now() - lastStamp >= STAMP && typeof saveDarkRunState === 'function') {
        lastStamp = Date.now();
        try { saveDarkRunState(); fixed.stamp++; } catch (e) { }
    }
}

setInterval(function () { try { tick(''); } catch (e) { } }, TICK);

// 다시 붙을 때 · 쪽이 다시 보일 때 — 기다리지 않고 바로 본다
(function hookConnected() {
    const iv = setInterval(function () {
        const d = db();
        if (!d) return;
        clearInterval(iv);
        d.ref('.info/connected').on('value', function (s) {
            if (s.val() === true) setTimeout(function () { try { tick('다시 붙음'); } catch (e) { } }, 1500);
        });
    }, 500);
})();
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') setTimeout(function () { try { tick('다시 보임'); } catch (e) { } }, 800);
});

// ==========================================
// ③ 방을 지우는 자리 — 파티 나가기(party-helper)
// ==========================================
//   혼자 남은 줄 알고 방 · 대화를 지우던 자리. 이미 출발한(RUNNING) 방이면 내 자리만 뺀다.
//   (출발한 방은 partyRunCleanup · 빈 방 치우기가 확인하고 치운다)
(function hookLeave() {
    // 다른 파일들(party-helper · party-stay · dark-relaunch)이 다 감싼 뒤에 맨 바깥에 얹는다
    let n = 0;
    const iv = setInterval(function () {
        if (typeof leaveParty !== 'function') return;
        if (leaveParty._keep) { clearInterval(iv); return; }
        if (++n < 8) return;
        const _l = leaveParty;
        const w = function () {
            const u = me(), d = db();
            try {
                const pid = (typeof myPartyId !== 'undefined' && myPartyId) || (run() && run().partyId) || null;
                const p = pid ? rooms()[pid] : null;
                if (u && d && p && p.state === 'RUNNING' && !(run() && run().partyId === pid)) {
                    const others = keys(p.members).filter(function (c) { return c !== u.code; });
                    if (!others.length) {
                        const mine = 'darkParties/' + pid + '/members/' + u.code;
                        try { d.ref(mine).onDisconnect().cancel(); } catch (e) { }
                        d.ref('/').update((function () {
                            const o = {};
                            o[mine] = null;
                            o['darkParties/' + pid + '/alive/' + u.code] = null;
                            o['darkParties/' + pid + '/roster/' + u.code] = null;
                            return o;
                        })()).catch(function () { });
                        try { myPartyId = null; } catch (e) { }
                        try { if (typeof detachChatListener === 'function') detachChatListener(); } catch (e) { }
                        try { if (typeof renderPartyPanel === 'function') renderPartyPanel(); } catch (e) { }
                        console.log('[파티] 출발한 방이라 내 자리만 빼고 나왔습니다 (방 · 대화는 남김) — ' + pid);
                        return;
                    }
                }
            } catch (e) { }
            return _l.apply(this, arguments);
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._keep = true;
        leaveParty = w; window.leaveParty = w;
        clearInterval(iv);
    }, 600);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ↻ (darkResync) — 방이 지워진 채로 누르면 「탐사 기록이 사라졌습니다」 로 쫓겨났다.
//   누르면 먼저 내 자리 · 방 뼈대를 다시 적고, 그 다음에 원래대로 맞춘다.
(function hookResync() {
    const iv = setInterval(function () {
        if (typeof darkResync !== 'function') return;
        if (darkResync._keep) { clearInterval(iv); return; }
        const _r = darkResync;
        const w = function () {
            const self = this, args = arguments;
            if (!active()) return _r.apply(self, args);
            try { tick('↻'); } catch (e) { }
            setTimeout(function () { _r.apply(self, args); }, 700);
        };
        w._keep = true;
        darkResync = w; window.darkResync = w;
        clearInterval(iv);
    }, 600);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 확인
// ==========================================
window.partyKeep = function () {
    const r = run(), a = active();
    console.log('%c===== 파티 자리 지키기 =====', 'color:#7fd4d4; font-size:13px');
    console.log('  탐사 중:', r ? (r.zone + (r.isParty ? ' · 방 ' + r.partyId : ' · 혼자')) : '아니오',
        '· 지키는 중:', a ? 'O' : '✗');
    if (r && r.isParty) {
        const p = rooms()[r.partyId] || null;
        const u = me();
        console.log('  방:', p ? ('있음 · state ' + (p.state || '없음')) : '없음');
        if (p) {
            console.log('  alive:', keys(p.alive).join(', ') || '(비었음)', '· 나:', (p.alive && u && p.alive[u.code]) ? 'O' : '✗');
            console.log('  members:', keys(p.members).length + '명 · roster:', keys(p.roster).length + '명');
            console.log('  chilMug:', p.chilMug ? (p.chilMug.n || p.chilMug.by) : '-', '· taleCast:', p.taleCast ? keys(p.taleCast).length + '명' : '-');
        }
        console.log('  들고 있는 뼈대:', hold.base ? 'O' : '✗');
    }
    console.log('  다시 적은 횟수:', JSON.stringify(fixed));
    console.log('  마지막:', lastFix || '-');
};

console.log('[파티] 자리 지키기 — partyKeep()');

})();
