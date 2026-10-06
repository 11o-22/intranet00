// ==========================================
// ★ 파티에서 자꾸 나가지는 것 · 접속한 사원이 초대에 안 뜨는 것
// bundles.json 마지막 그룹, talkshow.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 하나 — 파티에서 자꾸 나가진다
//
//   파티에 들어갈 때 이렇게 걸어 둔다.
//
//       index.html:2285 · 2308
//       database.ref('darkParties/'+pid+'/members/'+code).onDisconnect().remove();
//
//   연결이 끊기면 서버가 알아서 내 자리를 지운다. 그런데 **연결은 자주
//   끊긴다.** 손전화에서 화면을 덮거나, 다른 앱을 보거나, 신호가 잠깐
//   약해지면 끊어진다. 그때마다 파티에서 빠진다.
//
//   그리고 파티 목록이 올 때마다 myPartyId 를 다시 셈하므로(index.html:1899),
//   내 자리가 없어지면 그대로 「나간 것」이 된다.
//
//   그래서 「나는 이 파티에 있고 싶다」를 적어 두고, 자리가 사라졌는데 그
//   파티가 아직 모집 중이면 조용히 다시 앉힌다. 스스로 나가거나, 쫓겨나거나,
//   출발한 뒤에는 다시 앉히지 않는다.
//
// ■ 둘 — 접속한 사원이 초대 목록에 안 뜬다
//
//   목록을 online 이라는 자리만 보고 만든다(index.html:3132). 그 자리도
//   연결이 끊기면 지워지는데(index.html:10565), **다시 켤 때 한 번만 쓴다.**
//   그래서 한 번 끊긴 사람은 그 뒤로 영영 「접속 안 한 사람」이 된다.
//
//   두 가지를 한다.
//     · 내 자리를 20초마다 다시 적는다. 끊겼다 붙어도 금방 돌아온다.
//     · 목록에 **모든 사원**을 띄우고 접속 여부를 옆에 적는다. 안 보여서
//       못 부르는 일이 없게. (다른 파티에 있는 사람은 그대로 뺀다)
//
// ■ 확인
//
//   partyStay()     지금 상태 · 다시 앉힌 횟수

(function partyStay() {

const BEAT = 20000;          // 접속 표시를 다시 적는 간격
const WATCH = 2500;          // 파티 자리를 살피는 간격

let want = null;             // 내가 있고 싶은 파티
let backs = 0, left = 0;
let quitAt = 0;

function pOf(pid) {
    if (typeof darkParties === 'undefined' || !pid) return null;
    return darkParties[pid] || null;
}

// ==========================================
// 하나 — 자리가 사라지면 다시 앉는다
// ==========================================
function markWant(pid) { want = pid || null; quitAt = 0; }
function markQuit() { want = null; quitAt = Date.now(); }

(function hookJoin() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function' || typeof joinParty !== 'function') return;
        if (createParty._stay) { clearInterval(iv); return; }

        const _c = createParty;
        createParty = function () {
            const r = _c.apply(this, arguments);
            try { if (typeof myPartyId !== 'undefined' && myPartyId) markWant(myPartyId); } catch (e) { }
            return r;
        };
        createParty._stay = true;

        const _j = joinParty;
        joinParty = function (pid) {
            const r = _j.apply(this, arguments);
            try { if (typeof myPartyId !== 'undefined' && myPartyId) markWant(myPartyId); } catch (e) { }
            return r;
        };
        joinParty._stay = true;

        // 스스로 나가면 다시 앉히지 않는다
        if (typeof leaveParty === 'function' && !leaveParty._stay) {
            const _l = leaveParty;
            leaveParty = function () { markQuit(); return _l.apply(this, arguments); };
            leaveParty._stay = true;
        }
        // 출발했으면 더 볼 것 없다
        if (typeof launchPartyRun === 'function' && !launchPartyRun._stay) {
            const _r = launchPartyRun;
            launchPartyRun = function () { const r = _r.apply(this, arguments); markQuit(); return r; };
            launchPartyRun._stay = true;
        }
        clearInterval(iv);
        console.log('[파티] 자리 지키기 연결');
    }, 400);
})();

setInterval(function () {
    try {
        if (!currentUser || !want) return;
        if (typeof darkRun !== 'undefined' && darkRun) return;      // 탐사 중이면 볼 것 없다
        if (typeof database === 'undefined' || !database) return;

        const p = pOf(want);
        if (!p) { want = null; return; }                            // 파티가 사라졌다
        if (p.state !== 'RECRUIT') { want = null; return; }          // 이미 출발했다

        if ((p.members || {})[currentUser.code]) return;             // 자리가 있다 — 됐다

        // 쫓겨난 것일 수도 있다. 다만 쫓겨나면 보통 파티도 비니까,
        // 「파티는 그대로인데 내 자리만 없다」면 연결이 끊겼던 것으로 본다.
        const z = (typeof DARK_ZONES !== 'undefined') ? DARK_ZONES[p.zone] : null;
        const cnt = Object.keys(p.members || {}).length;
        if (z && cnt >= z.max) { want = null; return; }               // 자리가 찼다

        const me = {
            code: currentUser.code, name: currentUser.name,
            position: currentUser.position || '사원',
            ready: false, equips: [], items: [], joinedAt: Date.now()
        };
        database.ref('darkParties/' + want + '/members/' + currentUser.code).set(me);
        database.ref('darkParties/' + want + '/members/' + currentUser.code).onDisconnect().remove();
        if (!p.members) p.members = {};
        p.members[currentUser.code] = me;
        backs++;
        left++;
        console.log('[파티] 자리가 비어 있어 다시 앉았습니다. (' + backs + '번째)');
        if (typeof renderPartyPanel === 'function') { try { renderPartyPanel(); } catch (e) { } }
    } catch (e) { }
}, WATCH);

// ==========================================
// 둘 — 접속 표시를 계속 다시 적는다
// ==========================================
(function beat() {
    function tick() {
        try {
            if (!currentUser || typeof database === 'undefined' || !database) return;
            const r = database.ref('online/' + currentUser.code);
            r.set(true);
            r.onDisconnect().remove();
        } catch (e) { }
    }
    setInterval(tick, BEAT);
    setTimeout(tick, 3000);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { tick(); }
    });
    window.addEventListener('focus', tick);
})();

// ==========================================
// 둘 — 초대 목록에 모든 사원을 띄운다
// ==========================================
function onlineNow(code) {
    return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[code]);
}
function inAnyParty(code) {
    if (typeof darkParties === 'undefined') return false;
    for (const pid in darkParties) {
        const p = darkParties[pid];
        if (p && p.members && p.members[code]) return true;
    }
    return false;
}

(function hookList() {
    const iv = setInterval(function () {
        if (typeof openInviteSelect !== 'function') return;
        if (openInviteSelect._stay) { clearInterval(iv); return; }
        const _o = openInviteSelect;
        openInviteSelect = function () {
            const r = _o.apply(this, arguments);
            try {
                const sel = document.getElementById('dark-invite-target');
                if (!sel || typeof db === 'undefined' || !db.users) return r;
                const me = (currentUser || {}).code;
                const already = {};
                for (let i = 0; i < sel.options.length; i++) already[sel.options[i].value] = 1;

                // 원래 목록이 빠뜨린 사원을 채워 넣는다 (접속 표시가 지워진 사람들)
                const add = Object.keys(db.users).map(function (c) { return db.users[c]; })
                    .filter(function (u) {
                        if (!u || !u.name || !u.code) return false;
                        if (u.code === me) return false;
                        if (already[u.code]) return false;
                        if (u.code === 'kario0987' && me !== 'kario0987') return false;
                        return !inAnyParty(u.code);
                    })
                    .sort(function (a, b) { return String(a.no) < String(b.no) ? -1 : 1; });

                add.forEach(function (u) {
                    const o = document.createElement('option');
                    o.value = u.code;
                    o.text = u.name + ' (' + (u.position || '사원') + ' · 사번 ' + u.no + ')';
                    sel.appendChild(o);
                });

                // 접속 여부를 옆에 적는다
                for (let i = 0; i < sel.options.length; i++) {
                    const o = sel.options[i];
                    if (!o.value) continue;
                    const tag = onlineNow(o.value) ? '· 접속' : '· 부재';
                    if (o.text.indexOf('· 접속') < 0 && o.text.indexOf('· 부재') < 0) o.text += ' ' + tag;
                }

                // 「초대 가능한 사원이 없습니다」가 떠 있으면 치운다
                const body = document.getElementById('dark-party-body');
                if (body && sel.options.length) {
                    const txt = body.innerHTML;
                    if (txt.indexOf('초대 가능한 사원이 없습니다') >= 0) {
                        body.innerHTML = txt.replace(
                            /<div[^>]*>초대 가능한 사원이 없습니다\.<\/div>/, '');
                    }
                }
            } catch (e) { console.warn('[파티] 초대 목록 채우기 건너뜀:', e && e.message); }
            return r;
        };
        openInviteSelect._stay = true;
        clearInterval(iv);
        console.log('[파티] 초대 목록 — 접속이 끊겼던 사원도 띄웁니다');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.partyStay = function () {
    console.log('%c===== 파티 자리 지키기 =====', 'color:#d4af37; font-size:13px');
    console.log('  있고 싶은 파티:', want || '(없음)');
    const p = pOf(want);
    if (p) {
        console.log('  그 파티 상태:', p.state, '· 인원',
            Object.keys(p.members || {}).length + '명',
            '· 내 자리', (p.members || {})[(currentUser || {}).code] ? 'O' : '✗ (곧 다시 앉습니다)');
    }
    console.log('  다시 앉은 횟수:', backs + '번');
    console.log('  연결:',
        'createParty', (typeof createParty === 'function' && createParty._stay) ? 'O' : '✗',
        '· joinParty', (typeof joinParty === 'function' && joinParty._stay) ? 'O' : '✗',
        '· 초대목록', (typeof openInviteSelect === 'function' && openInviteSelect._stay) ? 'O' : '✗');
    const n = (typeof onlineUsersMap !== 'undefined' && onlineUsersMap)
        ? Object.keys(onlineUsersMap).length : 0;
    const all = (typeof db !== 'undefined' && db.users) ? Object.keys(db.users).length : 0;
    console.log('  접속 표시된 사원:', n + '명 / 전체 ' + all + '명',
        '(' + (BEAT / 1000) + '초마다 내 표시를 다시 적습니다)');
};

console.log('[파티] partyStay()');

})();
