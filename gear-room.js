// ==========================================
// ★ 커스텀 장비로 만든 방 — 회수품 ×0.1 · 솔로는 바이올린 0% (2026-11-10 사용자)
// bundles.json 마지막 묶음 맨 끝 — solo-room.js 뒤
// ==========================================
//
//   「커스텀 장비로 솔로로 돌 때에는 빛을 찾아서에서 바이올린 나올 확률 0%로 해줘.
//    일반적으로 단체로 들어갈 때만 기존에 설정해 둔 확률로 하고.
//    그 외에도 커스텀 장비로 방을 만들어서 돌 때에는 회수품이 나올 확률을 10 배 더 낮춰줘. 기본적으로.」
//
// ■ 커스텀 장비로 만든 방 — 아래 가운데 하나라도
//   ① 따로 두는 방      solo-room.js 가 표를 단 방 (🌟 칠성군 · 🐺 B조 · 🦋 환영 나비 · 🫧 흔적) — 사람 수와 상관없이
//   ② 최소 인원 밑으로   구역 최소 인원보다 적은 사람으로 출발했다 — 장비가 최소 인원을 낮춰 준 것
//                       (솔로 · 🎐 여우 신도 · 🐺 B조 조장 둘 · 🦋 나비 자리 …)
//   ③ 찬 구역을 건너뜀   다른 팀이 차지한 구역에 방을 만들었거나 출발했다 — 장비로 건너뛴 것 (🐾 아기 호랑이 · 🎐 여우 신도 …)
//                       → 방장이 만들 때 · 출발 단추를 누를 때 darkParties/<방>/gearRoom = { by, why, at } 를 단다
//
//   판이 열릴 때(launchPartyRun) 각자 darkRun.gearRoom 에 적어 두고 진행 기록(darkRuns/<사번>)에도 같이 둔다 — 새로고침해도 남는다.
//
// ■ 무엇이 바뀌나
//   구역 회수품표의 확률 ×0.1 — 정산(index.html renderDarkResult) · 신도에게 쓰러질 때(a214-kill.js)
//   🎻 바이올린(violin.js) — 사람 하나로 든 탐사는 굴리지 않는다 · 커스텀 장비로 만든 방에 여럿이면 ×0.1 · 그 밖의 단체는 그대로
//
// ■ 콘솔
//   gearRoomOf()   지금 탐사 — { room, solo, n, mult, why }

(function gearRoom() {
'use strict';

const MULT = 0.1;
const OCCUPY_MS = 3 * 60 * 60 * 1000;     // dark.js DARK_OCCUPY_TIMEOUT
const RECRUIT_MS = 30 * 60 * 1000;        // index.html PARTY_TIMEOUT

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function parties() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
function myParty() { try { return (typeof getMyParty === 'function') ? getMyParty() : null; } catch (e) { return null; } }
function isSoloRoom(p) { return !!(p && p.soloRoom && p.soloRoom.by); }
function tagged(p) { return !!(p && p.gearRoom && p.gearRoom.by); }

// 구역 본래 최소 인원 — 방 화면 · 출발 때 잠깐 낮춰 두는 것(solo-room · foxcult · butterfly · eliteb)에 안 휘둘리게 읽어 둔다
const BASE = {};
function snapMins() {
    try { Object.keys(DARK_ZONES).forEach(function (z) { if (BASE[z] == null && DARK_ZONES[z]) BASE[z] = Number(DARK_ZONES[z].min) || 1; }); } catch (e) { }
}
function baseMin(zone) {
    if (BASE[zone] != null) return BASE[zone];
    try { const z = DARK_ZONES[zone]; return z ? (Number(z.min) || 1) : 1; } catch (e) { return 1; }
}
(function snap() {
    const iv = setInterval(function () { if (typeof DARK_ZONES === 'undefined') return; clearInterval(iv); snapMins(); }, 300);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 다른 팀이 이 구역을 차지하고 있나 — index.html isZoneTaken 과 같은 셈 (장비가 거는 건너뛰기 없이 · 따로 두는 방은 빼고)
function takenRaw(zone, myPid) {
    const me = u_();
    if (!me) return false;
    try {
        if (typeof getZoneOccupant === 'function') {
            const oc = getZoneOccupant(zone);
            if (oc && !(myPid && oc.partyId === myPid)) {
                const iAmIn = oc.leaderCode === me.code || (Array.isArray(oc.members) && oc.members.indexOf(me.code) >= 0);
                if (!iAmIn) return true;
            }
        }
    } catch (e) { }
    const all = parties(), now = Date.now();
    for (const pid in all) {
        const p = all[pid];
        if (!p || p.zone !== zone || pid === myPid) continue;
        if (p.members && p.members[me.code]) continue;
        if (isSoloRoom(p)) continue;
        if (p.state === 'RUNNING') {
            const alive = p.alive ? Object.keys(p.alive).length : 0;
            if (alive === 0) {
                try { if (typeof window.darkRoomOnline === 'function' && window.darkRoomOnline(p)) return true; } catch (e) { }
                continue;
            }
            if (now - (p.startedAt || p.createdAt || 0) < OCCUPY_MS) return true;
            continue;
        }
        if (p.state === 'RECRUIT' && now - (p.createdAt || 0) < RECRUIT_MS) return true;
    }
    return false;
}

function tag(pid, why) {
    const me = u_();
    if (!me || !pid) return;
    const t = { by: me.code, why: why, at: Date.now() };
    const all = parties(); if (all[pid]) all[pid].gearRoom = t;
    const d = db_(); if (d) d.ref('darkParties/' + pid + '/gearRoom').set(t).catch(function () { });
    console.log('[장비 방] ' + pid + ' — ' + why);
}
function untag(pid) {
    const all = parties(); if (all[pid]) delete all[pid].gearRoom;
    const d = db_(); if (d) d.ref('darkParties/' + pid + '/gearRoom').remove().catch(function () { });
}

// 이 방이 커스텀 장비로 만든 방인가 — 까닭 목록 (없으면 [])
function judge(p, n) {
    const why = [];
    if (!p) return why;
    if (isSoloRoom(p)) why.push('따로 두는 방' + (p.soloRoom.kind ? '(' + p.soloRoom.kind + ')' : ''));
    if (n > 0 && n < baseMin(p.zone)) why.push('최소 인원 밑 ' + n + '/' + baseMin(p.zone));
    if (tagged(p)) why.push('찬 구역 건너뜀');
    return why;
}

// index.html 의 전역 함수들 — 이름으로 읽고 바꾼다
const G = {
    createParty:       [function () { return typeof createParty === 'function' ? createParty : null; },             function (w) { createParty = w; }],
    launchParty:       [function () { return typeof launchParty === 'function' ? launchParty : null; },             function (w) { launchParty = w; }],
    launchPartyRun:    [function () { return typeof launchPartyRun === 'function' ? launchPartyRun : null; },       function (w) { launchPartyRun = w; }],
    saveDarkRunState:  [function () { return typeof saveDarkRunState === 'function' ? saveDarkRunState : null; },   function (w) { saveDarkRunState = w; }],
    acceptDarkResume:  [function () { return typeof acceptDarkResume === 'function' ? acceptDarkResume : null; },   function (w) { acceptDarkResume = w; }]
};
function hook(name, flag, make) {
    const iv = setInterval(function () {
        const f = G[name][0]();
        if (!f) return;
        if (f[flag]) { clearInterval(iv); return; }
        const w = make(f);
        Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
        w[flag] = true;
        try { G[name][1](w); } catch (e) { }
        try { window[name] = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
}

// ③ 방을 만들 때 — 구역이 차 있었는데 만들어졌다 = 장비로 건너뛰었다
hook('createParty', '_gearRoom', function (_c) {
    return function (zoneCode) {
        const before = (typeof myPartyId !== 'undefined') ? myPartyId : null;
        let taken = false;
        try { taken = !!(u_() && !myParty() && takenRaw(zoneCode, null)); } catch (e) { }
        const out = _c.apply(this, arguments);
        try {
            const pid = (typeof myPartyId !== 'undefined') ? myPartyId : null;
            if (taken && pid && pid !== before) tag(pid, 'create');
        } catch (e) { }
        return out;
    };
});
// ③ 출발할 때 — 구역이 차 있는데 출발한다 (출발 전에 달아 둔다 · 같이 가는 사람이 판을 열 때 보이게)
hook('launchParty', '_gearRoom', function (_l) {
    return function () {
        try {
            const me = u_(), p = myParty();
            if (me && p && p.leader === me.code && p.state !== 'RUNNING') {
                const t = takenRaw(p.zone, p.id);
                if (t && !tagged(p)) tag(p.id, 'launch');
                else if (!t && tagged(p) && p.gearRoom.why === 'launch') untag(p.id);     // 지난번 출발 못 한 채 남은 표
            }
        } catch (e) { }
        return _l.apply(this, arguments);
    };
});

// 판이 열릴 때 — 이 탐사에 적어 둔다
function mark(party) {
    const r = run();
    if (!r || !party || !r.isParty || r.partyId !== party.id || r.gearRoomSet) return;
    const n = Number(r.memberCount) || Object.keys(party.members || {}).length || 1;
    const why = judge(party, n);
    r.gearRoom = why.join(' · ');
    r.gearRoomSet = 1;
    if (why.length) console.log('[장비 방] 이번 탐사 — 회수품 ×' + MULT + ' (' + r.gearRoom + ')');
    try { if (typeof saveDarkRunState === 'function') saveDarkRunState(); } catch (e) { }
}
hook('launchPartyRun', '_gearRoom', function (_f) {
    return function (party) {
        const out = _f.apply(this, arguments);
        try { mark(party); } catch (e) { }
        return out;
    };
});

// 진행 기록에 같이 둔다 · 복귀 때 되찾는다
hook('saveDarkRunState', '_gearRoom', function (_s) {
    return function () {
        const out = _s.apply(this, arguments);
        try {
            const r = run(), me = u_(), d = db_();
            if (r && me && d && r.gearRoomSet) d.ref('darkRuns/' + me.code).update({ gearRoom: r.gearRoom || '', gearRoomSet: 1 }).catch(function () { });
        } catch (e) { }
        return out;
    };
});
hook('acceptDarkResume', '_gearRoom', function (_a) {
    return function () {
        let s = null;
        try { s = window._pendingResume || null; } catch (e) { }
        const out = _a.apply(this, arguments);
        try {
            const r = run();
            if (r && s && s.gearRoomSet && !r.gearRoomSet) { r.gearRoom = s.gearRoom || ''; r.gearRoomSet = 1; }
        } catch (e) { }
        return out;
    };
});

// 지금 탐사 — 정산 · 쓰러짐 · 바이올린이 본다
function info() {
    const r = run();
    if (!r) return { room: false, solo: false, n: 0, mult: 1, why: '' };
    const n = Number(r.memberCount) || 1;
    let why = '';
    if (r.isParty) {
        if (r.gearRoomSet) why = r.gearRoom || '';
        else {
            // 이 판이 깔리기 전에 열린 탐사 — 방이 남아 있으면 방으로, 없으면 사람 수로 잰다
            const p = r.partyId ? parties()[r.partyId] : null;
            why = p ? judge(p, n).join(' · ') : (n < baseMin(r.zone) ? '최소 인원 밑 ' + n + '/' + baseMin(r.zone) : '');
        }
    }
    const room = !!why;
    return { room: room, solo: n <= 1, n: n, mult: room ? MULT : 1, why: why };
}
window.gearRoomOf = info;
window.gearRoomMult = function () { try { return info().mult; } catch (e) { return 1; } };

console.log('[장비 방] 커스텀 장비로 만든 방 — 회수품 ×' + MULT + ' · 솔로는 바이올린 0%');
})();
