// ==========================================
// ★ L 등급 사택 — 상담사 전용 · 직원 데려오기 · 유령 동거인 치우기
// bundles.json 마지막 그룹, roommate.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 세 가지를 한다
//
//   ① 없는 동거인이 뜨던 것을 고친다
//
//      roommate.js 의 재배정(doAssign)은 상담사를 아예 명단에서 뺀다.
//      그래서 상담사에게 짝을 붙이지는 않는데, **짝을 떼지도 않는다.**
//      예전에 한 번 붙었던 house.roomie 가 그대로 남아, 상대는 이미 다른
//      사람과 짝이 된 뒤에도 상담사 화면에는 그 사람이 계속 동거인으로 뜬다.
//
//      그래서 「서로를 가리키지 않는 짝」은 유령으로 보고 치운다.
//      상담사만이 아니라 모두에게 걸어 둔다. 한쪽만 남은 짝은 늘 고장이다.
//
//   ② 상담사가 원하는 직원을 데려올 수 있다
//
//      사택 화면에 상담사에게만 보이는 칸이 생긴다. 직원을 고르면 그 직원의
//      먼저 있던 짝을 떼고 상담사와 묶는다. 월요일 재배정 때도 풀리지 않게
//      roomAssign/adminGuest 에 적어 두고, roommate.js 가 그 사람을 명단에서
//      뺀다.
//
//   ③ L 등급
//
//      HOUSE_GRADES 에는 넣지 않는다. 넣으면 S 등급 사원의 「이사」 칸에
//      L 이 다음 등급으로 떠서, 돈만 있으면 올라갈 수 있게 된다.
//      대신 houseGrade() 가 상담사의 호실에만 'L' 을 돌려준다.
//      그러면 다른 사원에게는 S 가 끝으로 보인다 — 목록에도, 이사 칸에도
//      L 이라는 것이 아예 없다.
//
//      사택의 모든 혜택은 houseInfoOf(user) 한 곳을 거치므로(dark.js:7999),
//      HOUSE_INFO.L 을 넣고 등급만 바꿔 주면 회복·휴식·요리·보관함·금고가
//      한꺼번에 L 이 된다.
//
//              S등급        L등급        몇 배
//        회복   시간당 8%   시간당 24%    3배
//        휴식   하루 4회    하루 12회     3배
//        요리   하루 3회    하루 9회      3배
//        보관함 60칸        100칸         (말씀하신 값)
//        금고   50,000 P    500,000 P     (말씀하신 값)
//        그 밖  오락기 무료 · 포만감 +5 · 이상 현상 없음 — S 와 같다
//
//      같은 방을 쓰는 직원도 L 을 같이 받는다. 사택 등급은 원래 두 사람 중
//      높은 쪽을 따르게 되어 있다(dark.js:8035).
//
// ■ 확인
//
//   houseLState()      내 등급과 혜택
//   houseGuest(사번)   콘솔로 데려오기 (상담사만)
//   houseGuestOut()    내보내기
//   roomieCheck()      유령 동거인이 있나

(function houseL() {

const ADMIN = 'kario0987';
const GUEST_KEY = 'roomAssign/adminGuest';

function isAdmin(u) { return !!(u && u.code === ADMIN); }

// ==========================================
// ③ L 등급 — HOUSE_INFO 에만 넣는다 (HOUSE_GRADES 는 건드리지 않는다)
// ==========================================
(function addGrade() {
    const iv = setInterval(function () {
        if (typeof HOUSE_INFO === 'undefined' || !HOUSE_INFO || !HOUSE_INFO.S) return;
        if (HOUSE_INFO.L) { clearInterval(iv); return; }
        const S = HOUSE_INFO.S;
        HOUSE_INFO.L = {
            name: '관사',
            cost: 0,                       // 돈으로 갈 수 없다
            heal: S.heal * 3,              // 8 → 24
            label: '창이 없다. 그런데 밖이 보인다.',
            anomaly: 0,
            storage: 100,
            rest: S.rest * 3,              // 4 → 12
            cook: S.cook * 3,              // 3 → 9
            freeGame: true,
            vault: 500000,
            perk: '오락기 무료 · 포만감 +5 · 이상 현상 없음 · 회복·휴식·요리 3배 '
                + '· 보관함 100칸 · 포인트 보관 500,000 P'
        };
        clearInterval(iv);
        console.log('[사택] L 등급 등록 — 상담사 호실만');
    }, 400);
})();

// 이 호실이 L 인가 — 상담사 본인이거나, 상담사와 같은 방을 쓰는 사람,
// 그리고 「찢어진 메모지」를 쓴 사람 (secretbox.js 가 houseL 을 적는다)
function isL(user) {
    if (!user) return false;
    if (user.code === ADMIN) return true;
    if (user.houseL) return true;
    const h = user.house;
    return !!(h && h.roomie === ADMIN);
}

(function hookGrade() {
    const iv = setInterval(function () {
        if (typeof houseGrade !== 'function') return;
        if (houseGrade._L) { clearInterval(iv); return; }
        const _g = houseGrade;
        const wrapped = function (user) {
            if (isL(user) && typeof HOUSE_INFO !== 'undefined' && HOUSE_INFO && HOUSE_INFO.L) return 'L';
            return _g.apply(this, arguments);
        };
        wrapped._L = true;
        houseGrade = wrapped;
        clearInterval(iv);
        console.log('[사택] houseGrade 연결 — 상담사 호실은 L');
    }, 400);
})();

// 이사로는 L 에서 나가지도, L 로 들어오지도 못한다.
// HOUSE_GRADES 에 L 이 없으므로 indexOf('L') 이 -1 이고, 그대로 두면
// 다음 등급이 D 로 계산되어 공짜로 지하 1층으로 내려가 버린다.
(function hookMove() {
    const iv = setInterval(function () {
        if (typeof houseMove !== 'function') return;
        if (houseMove._L) { clearInterval(iv); return; }
        const _m = houseMove;
        const wrapped = function () {
            if (typeof houseGrade === 'function' && houseGrade(currentUser) === 'L') {
                showCustomAlert('관사입니다. 옮길 곳이 없습니다.');
                return;
            }
            return _m.apply(this, arguments);
        };
        wrapped._L = true;
        houseMove = wrapped;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// ① 유령 동거인 치우기
// ==========================================
//
// 짝은 서로를 가리켜야 한다. 한쪽만 남았으면 고장이다.
let wiped = 0;
function ghost(u) {
    if (!u || !u.house || !u.house.roomie) return false;
    const r = (db.users || {})[u.house.roomie];
    if (!r) return true;                       // 그런 사원이 없다
    const rh = r.house || {};
    return rh.roomie !== u.code;               // 상대는 나를 안 가리킨다
}
function wipeGhost() {
    if (!currentUser || !currentUser.house) return;
    if (!ghost(currentUser)) return;
    // 상담사가 일부러 데려온 사람이면 지우지 않는다
    if (isAdmin(currentUser) && currentUser.house.roomie === guestCode) return;

    const was = currentUser.house.roomie;
    currentUser.house.roomie = null;
    wiped++;
    console.log('[사택] 한쪽만 남은 동거인(' + was + ')을 치웠습니다.');
    if (typeof database !== 'undefined' && database) {
        database.ref('users/' + currentUser.code + '/house/roomie').set(null);
    }
    if (typeof renderHouse === 'function') { try { renderHouse(); } catch (e) { } }
}
setInterval(function () { try { wipeGhost(); } catch (e) { } }, 6000);

window.roomieCheck = function () {
    console.log('%c===== 동거인 =====', 'color:#d4af37; font-size:13px');
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const bad = all.filter(ghost);
    console.log('  사원 ' + all.length + '명 · 한쪽만 남은 짝 ' + bad.length + '건');
    if (bad.length) {
        console.table(bad.map(function (u) {
            const r = (db.users || {})[u.house.roomie];
            return { 사원: u.name, 가리키는쪽: u.house.roomie,
                     상대이름: r ? r.name : '(없는 사원)',
                     상대가가리키는쪽: r ? ((r.house || {}).roomie || '없음') : '-' };
        }));
    }
    console.log('  내 화면에서 치운 횟수:', wiped + '번');
    if (guestCode) console.log('  상담사가 데려온 직원:', guestCode,
        '(' + (((db.users || {})[guestCode] || {}).name || '?') + ')');
};

// ==========================================
// ② 상담사가 직원을 데려온다
// ==========================================
let guestCode = null;
(function watchGuest() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        database.ref(GUEST_KEY).on('value', function (s) {
            guestCode = s.val() || null;
            if (typeof renderHouse === 'function' && currentUser && isAdmin(currentUser)) {
                try { paintGuestBox(); } catch (e) { }
            }
        });
    }, 400);
})();

function bringIn(code) {
    if (!currentUser || !isAdmin(currentUser)) { showCustomAlert('상담사만 할 수 있습니다.'); return; }
    const g = (db.users || {})[code];
    if (!g) { showCustomAlert('사원을 찾지 못했습니다.'); return; }
    if (code === ADMIN) { showCustomAlert('본인은 고를 수 없습니다.'); return; }
    if (typeof database === 'undefined' || !database) { showCustomAlert('서버에 연결되어 있지 않습니다.'); return; }

    const up = {};
    // 먼저 있던 짝을 뗀다 — 양쪽 다
    const old = (g.house || {}).roomie;
    if (old && old !== ADMIN) up['users/' + old + '/house/roomie'] = null;
    const mine = (currentUser.house || {}).roomie;
    if (mine && mine !== code) up['users/' + mine + '/house/roomie'] = null;

    up['users/' + ADMIN + '/house/roomie'] = code;
    up['users/' + code + '/house/roomie'] = ADMIN;
    up[GUEST_KEY] = code;
    up['users/' + ADMIN + '/_adminStamp'] = Date.now();
    up['users/' + code + '/_adminStamp'] = Date.now();

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(g, '[사택] 관사로 옮겨졌습니다.');
        up['users/' + code + '/history'] = g.history;
        addHistoryLog(currentUser, '[사택] ' + g.name + ' 사원을 관사로 데려왔습니다.');
    }

    database.ref('/').update(up).then(function () {
        if (currentUser.house) currentUser.house.roomie = code;
        if (g.house) g.house.roomie = ADMIN; else g.house = { roomie: ADMIN };
        if (typeof renderHouse === 'function') renderHouse();
        if (typeof updateUI === 'function') updateUI();
        showCustomAlert(g.name + ' 사원을 관사로 데려왔습니다.\n\n'
            + '월요일 재배정에서도 풀리지 않습니다.');
    }).catch(function (e) {
        console.error('[사택] 데려오기 실패:', e);
        showCustomAlert('옮기지 못했습니다.');
    });
}

function sendOut() {
    if (!currentUser || !isAdmin(currentUser)) { showCustomAlert('상담사만 할 수 있습니다.'); return; }
    const code = (currentUser.house || {}).roomie || guestCode;
    if (!code) { showCustomAlert('데려온 직원이 없습니다.'); return; }
    const g = (db.users || {})[code];

    const up = {};
    up['users/' + ADMIN + '/house/roomie'] = null;
    up['users/' + code + '/house/roomie'] = null;
    up[GUEST_KEY] = null;
    up['users/' + ADMIN + '/_adminStamp'] = Date.now();
    up['users/' + code + '/_adminStamp'] = Date.now();
    if (g && typeof addHistoryLog === 'function') {
        addHistoryLog(g, '[사택] 관사에서 나왔습니다.');
        up['users/' + code + '/history'] = g.history;
    }

    database.ref('/').update(up).then(function () {
        if (currentUser.house) currentUser.house.roomie = null;
        if (g && g.house) g.house.roomie = null;
        if (typeof renderHouse === 'function') renderHouse();
        showCustomAlert((g ? g.name + ' 사원을' : '동거인을') + ' 내보냈습니다.');
    });
}

window.houseGuest = function (who) {
    if (!currentUser || !isAdmin(currentUser)) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0];
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    bringIn(u.code);
};
window.houseGuestOut = sendOut;
window.houseBringIn = bringIn;

// --- 사택 화면의 상담사 칸 ---
function paintGuestBox() {
    const host = document.getElementById('house-main-body');
    if (!host || !currentUser) return;
    let el = document.getElementById('house-guest-box');
    if (!isAdmin(currentUser)) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'house-guest-box';
        el.style.cssText = 'background:rgba(212,175,55,0.07); border:1px solid #5a4a2a;'
            + ' border-radius:6px; padding:12px; margin-bottom:14px;';
        const title = host.querySelector('.panel-title');
        if (title && title.nextSibling) host.insertBefore(el, title.nextSibling.nextSibling || title.nextSibling);
        else host.insertBefore(el, host.firstChild);
    }

    const now = (currentUser.house || {}).roomie;
    const g = now ? (db.users || {})[now] : null;
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code !== ADMIN; })
        .sort(function (a, b) { return String(a.no) < String(b.no) ? -1 : 1; });

    const html = '<div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:7px;">관사 — 직원 데려오기</div>'
        + (g ? '<div style="font-size:12px; color:#fff; margin-bottom:8px;">지금 함께 있는 직원 — <b>'
                + g.name + '</b> <span style="color:#888; font-size:10px;">사번 ' + g.no + '</span></div>'
             : '<div style="font-size:11px; color:#888; margin-bottom:8px;">지금은 혼자 씁니다.</div>')
        + '<select id="house-guest-pick" style="width:100%; margin-bottom:7px; box-sizing:border-box;">'
        + '<option value="">— 데려올 직원 —</option>'
        + all.map(function (u) {
            return '<option value="' + u.code + '"' + (u.code === now ? ' selected' : '') + '>'
                + u.name + ' (' + u.no + ')</option>';
        }).join('')
        + '</select>'
        + '<div style="display:flex; gap:6px;">'
        + '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;"'
        + ' onclick="houseBringIn((document.getElementById(\'house-guest-pick\')||{}).value)">데려온다</button>'
        + (g ? '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;"'
               + ' onclick="houseGuestOut()">내보낸다</button>' : '')
        + '</div>'
        + '<div style="font-size:9px; color:#777; margin-top:6px; line-height:1.6;">'
        + '동의를 묻지 않습니다. 월요일 재배정에서도 풀리지 않습니다.</div>';
    if (el.innerHTML !== html) el.innerHTML = html;
}

// ==========================================
// 사택 화면 — 이사 칸을 L 에 맞게 고치고, 상담사 칸을 붙인다
// ==========================================
function fixMoveBox() {
    if (!currentUser || typeof houseGrade !== 'function') return;
    if (houseGrade(currentUser) !== 'L') return;
    const host = document.getElementById('house-main-body');
    if (!host) return;
    // renderHouse 는 HOUSE_GRADES 에 L 이 없어서 다음 등급을 D 로 잡는다.
    // 그 칸을 「관사」 문구로 바꾼다.
    const boxes = host.querySelectorAll('div');
    for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        if (b.id) continue;
        const t = b.textContent || '';
        if (t.indexOf('이사') === 0 || (t.indexOf('이사') >= 0 && b.querySelector('button[onclick*="houseMove"]'))) {
            b.innerHTML = '<div style="text-align:center; font-size:11px; color:#d4af37;">'
                + '관사입니다. 더 올라갈 곳이 없습니다.</div>';
            b.style.cssText = 'background:rgba(212,175,55,0.07); border:1px solid #5a4a2a;'
                + ' border-radius:6px; padding:12px; margin-bottom:14px;';
            break;
        }
    }
}

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._L) { clearInterval(iv); return; }
        const _r = renderHouse;
        const wrapped = function () {
            const r = _r.apply(this, arguments);
            try { fixMoveBox(); paintGuestBox(); } catch (e) { }
            return r;
        };
        wrapped._L = true;
        renderHouse = wrapped;
        clearInterval(iv);
        console.log('[사택] 사택 화면 연결 — 이사 칸 · 상담사 칸');
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.houseLState = function () {
    if (!currentUser) { console.log('로그인 후에 쓰세요.'); return; }
    const g = (typeof houseGrade === 'function') ? houseGrade(currentUser) : '?';
    const info = (typeof HOUSE_INFO !== 'undefined' && HOUSE_INFO) ? HOUSE_INFO[g] : null;
    console.log('%c===== 사택 =====', 'color:#d4af37; font-size:13px');
    console.log('  내 등급:', g, info ? ('— ' + info.name) : '');
    if (info) {
        const S = HOUSE_INFO.S;
        console.table([
            { 항목: '회복(시간당)', 내것: info.heal + '%', S등급: S.heal + '%' },
            { 항목: '휴식(하루)',   내것: info.rest + '회', S등급: S.rest + '회' },
            { 항목: '요리(하루)',   내것: info.cook + '회', S등급: S.cook + '회' },
            { 항목: '보관함',       내것: info.storage + '칸', S등급: S.storage + '칸' },
            { 항목: '금고',         내것: info.vault.toLocaleString() + ' P', S등급: S.vault.toLocaleString() + ' P' }
        ]);
    }
    console.log('  L 등록:', (typeof HOUSE_INFO !== 'undefined' && HOUSE_INFO && HOUSE_INFO.L) ? 'O' : '✗',
        '· houseGrade 연결:', (typeof houseGrade === 'function' && houseGrade._L) ? 'O' : '✗');
    console.log('  (HOUSE_GRADES 에는 L 을 넣지 않았습니다 — 다른 사원에게는 S 가 끝입니다)');
};

console.log('[사택] houseLState() · houseGuest(사번) · houseGuestOut() · roomieCheck()');

})();
