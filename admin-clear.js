// ==========================================
// ★ 당국 개입 — 「특이사항 초기화」와 「상태이상 소거」가 안 먹히던 것
// bundles.json 마지막 묶음, save-merge.js · note-fix.js 보다 뒤
// ==========================================
//
// ■ 1. 상태이상 소거를 눌러도 걸린 것이 그대로 남았다
//
//   adminClearStatus 는 timedEffects 를 빈 목록으로 두고 updateUserFields
//   로 보낸다. 그 길목에 save-merge.js 가 서 있고, 거기 이런 줄이 있다.
//
//       const wipe = Object.keys(want).length === 0 && Object.keys(had).length > 1;
//       const gone = wipe ? [] : Object.keys(had).filter(n => !(n in want));
//
//   「보내는 쪽이 통째로 비어 있고 서버에 둘 이상 걸려 있으면 아무것도
//   지우지 않는다」는 뜻이다. 잠깐 비어 있는 목록이 올라와 걸린 물약이
//   한꺼번에 날아가는 것을 막으려고 둔 그물이다. 그것 자체는 맞다.
//
//   그런데 당국이 **일부러** 누른 것도 같은 그물에 걸린다. 그래서
//   걸린 것이 하나면 지워지고, 둘 이상이면 하나도 안 지워졌다.
//   「눌러도 안 먹힌다」가 이것이다.
//
//   여기서는 updateUserFields 를 거치지 않고 users/{사번} 에 바로 쓴다.
//   (그 길은 감싸여 있지 않다 — 감싼 것은 루트 통째 쓰기와 updateUserFields 뿐)
//   그리고 「일부러 비웠다」는 도장(effClearAt)을 같이 찍는다. 받는 쪽이
//   그 도장을 보고 제 화면의 목록도 따라 비운다.
//
// ■ 2. 지우는 칸이 모자랐다
//
//   예전 목록에는 격리·안대·노예·노스텔지어까지만 있었다. 그 뒤에 들어온
//   것들이 빠져 있어서, 소거해도 몸에 남는 것이 있었다.
//
//       itemBuffs      달빛 타투 · 은화 뱀 버프
//       cage · cageUse 감금실
//       slaveFixed     영구 노예 계약 (slaveUntil 만 지워도 안 풀린다)
//       hairUntil      탈모약
//       dollPt         인형
//       satHoldUntil   포만감 고정
//       pollFreezeUntil · securityPurgeUntil   오염 관련 걸림
//
// ■ 3. 특이사항 초기화를 눌러도 글이 돌아왔다
//
//   note-fix.js 가 「있어야 할 문구가 없으면 다시 적는다」로 서 있다.
//   15초마다 돌면서 아직 몸에 붙어 있는 것을 다시 적는다. 되살리는 것은
//   셋뿐이다 — 차고 있는 빨간 리본 · 살아 있는 달빛·은화 뱀 버프 ·
//   기간이 남은 노예 계약.
//
//   그래서 글만 지우면 곧 돌아온다. 당연한 동작이고, 없애면 안 된다
//   (차고 있는 장비를 특이사항에서 숨길 수 있게 되기 때문이다).
//
//   대신 눌렀을 때 **무엇이 왜 돌아오는지 그 자리에서 알려 준다.**
//   버프와 노예 계약은 상태이상 소거가, 빨간 리본은 장비 강제 회수가
//   걷어 낸다. 둘을 누르고 나면 특이사항이 깨끗이 빈다.

(function adminClear() {

const NONE = '특이사항 없음';

function db_() { return (typeof database !== 'undefined') ? database : null; }
function isAdmin() {
    return !!(typeof currentUser !== 'undefined' && currentUser && currentUser.code === 'kario0987');
}

// ==========================================
// 지울 칸 — 0 으로 둘 것과 아예 없앨 것
// ==========================================
//
//   0 으로 두는 것은 「때가 지났다」로 읽히는 칸이고,
//   없애는 것은 목록·꾸러미라서 빈 것을 두면 파이어베이스가 열쇠째
//   지워 버리는 칸이다. 뜻이 같으므로 처음부터 null 로 보낸다.
const ZERO = [
    'quarantineUntil',        // 격리
    'quarantineExitPollution',
    'blindfoldUntil',         // 안대
    'slaveUntil',             // 노예 계약
    'nostalgiaUntil',         // 노스텔지어
    'silverRingExpireTime',   // 은반지
    'butterKnifeExpireTime',  // 버터칼
    'hairUntil',              // 탈모약
    'dollPt',                 // 인형
    'satHoldUntil',           // 포만감 고정
    'pollFreezeUntil',        // 오염 동결
    'securityPurgeUntil'      // 오염 한계 정리
];
const WIPE = [
    'timedEffects',           // 걸린 효과 (물약 등)
    'itemBuffs',              // 물건이 얹어 준 버프 (달빛 · 은화 뱀)
    'cage',                   // 감금실
    'cageUse',
    'masterName',             // 노예 계약 주인
    'nostalgiaSender'
];
const FALSE = ['foxRoomAnswered', 'slaveFixed'];

// 사람이 읽을 이름 — 무엇이 지워졌는지 알려 주기 위한 것
const LABEL = {
    quarantineUntil: '격리', blindfoldUntil: '안대', slaveUntil: '노예 계약',
    slaveFixed: '영구 노예 계약', nostalgiaUntil: '노스텔지어',
    silverRingExpireTime: '은반지', butterKnifeExpireTime: '버터칼',
    hairUntil: '탈모약', dollPt: '인형', satHoldUntil: '포만감 고정',
    pollFreezeUntil: '오염 동결', securityPurgeUntil: '오염 한계 정리',
    timedEffects: '걸린 효과', itemBuffs: '물건 버프', cage: '감금실'
};

function live(u, k) {
    const v = u[k];
    if (k === 'cage') return !!(v && v.by);
    if (Array.isArray(v)) return v.length > 0;
    if (k === 'slaveFixed' || k === 'foxRoomAnswered') return !!v;
    return (Number(v) || 0) > 0;
}

// ==========================================
// 상태이상 소거
// ==========================================
function clearStatus() {
    const targets = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
    if (!targets.length) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    const names = [], hitSet = {};
    const jobs = [];
    const now = Date.now();

    targets.forEach(function (code) {
        const u = db.users[code];
        if (!u) return;

        // 무엇이 걸려 있었나 (알려 주기 위해)
        ZERO.concat(WIPE, FALSE).forEach(function (k) {
            if (LABEL[k] && live(u, k)) hitSet[LABEL[k]] = true;
        });

        const fields = {};
        ZERO.forEach(function (k) { u[k] = 0; fields[k] = 0; });
        WIPE.forEach(function (k) {
            if (k === 'timedEffects' || k === 'itemBuffs') u[k] = [];
            else u[k] = null;
            fields[k] = null;                      // 열쇠째 없앤다
        });
        FALSE.forEach(function (k) { u[k] = false; fields[k] = false; });

        u.lastPollutionTime = now;
        fields.lastPollutionTime = now;
        // ★ 「일부러 비웠다」는 도장 — 받는 쪽이 제 목록도 따라 비운다
        u.effClearAt = now;
        fields.effClearAt = now;
        u._adminStamp = now;
        fields._adminStamp = now;

        try { addHistoryLog(u, '[당국 개입] 모든 상태이상이 소거되었습니다.'); } catch (e) { }
        fields.history = u.history || [];

        // ★ updateUserFields 를 거치지 않는다 (위 1번의 까닭)
        if (db_()) jobs.push(db_().ref('users/' + code).update(fields).catch(function (e) {
            console.error('[당국] 소거 저장 실패 ' + code, e);
        }));
        names.push(u.name);
    });

    if (!db_()) { try { saveDB(); } catch (e) { } }
    try { updateUI(); } catch (e) { }

    const hits = Object.keys(hitSet);
    const say = function () {
        showCustomAlert(names.length + '명의 상태이상을 소거했습니다.\n(' + names.join(', ') + ')'
            + (hits.length ? '\n\n걷어낸 것: ' + hits.join(' · ') : '\n\n걸려 있던 것이 없었습니다.'));
    };
    if (jobs.length) Promise.all(jobs).then(say).catch(say);
    else say();
}

// ==========================================
// 특이사항 초기화
// ==========================================
//
//   글을 지운 뒤, note-fix.js 가 되살릴 줄이 있는지 **미리 재 본다.**
//   되살리는 조건은 셋뿐이라 여기서 그대로 센다 (note-fix 를 건드리지 않는다).
function willRevive(u) {
    const back = [];
    try {
        const t = Date.now();
        // 차고 있는 빨간 리본
        const baseOf = (typeof getEquipBaseName === 'function')
            ? getEquipBaseName : function (w) { return String(w || ''); };
        const ribbon = (u.equippedWeapons || []).filter(function (w) { return baseOf(w) === '빨간 리본'; });
        if (ribbon.length) back.push('빨간 리본 ' + ribbon.length + '개 (장착 중 — 장비 강제 회수)');
        // 살아 있는 달빛 · 은화 뱀 버프
        ['달빛', '은화 뱀'].forEach(function (src) {
            const on = (Array.isArray(u.itemBuffs) ? u.itemBuffs : []).some(function (b) {
                return b && b.src === src && (b.run || (b.until || 0) > t);
            });
            if (on) back.push(src + ' (버프 남음 — 상태이상 소거)');
        });
        // 기간이 남은 노예 계약
        if ((u.slaveUntil && t < u.slaveUntil) || u.slaveFixed) back.push('노예 계약 (상태이상 소거)');
    } catch (e) { }
    return back;
}

function clearNotes() {
    const targets = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
    if (!targets.length) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }

    const names = [], backSet = {};
    const jobs = [];
    const now = Date.now();

    targets.forEach(function (code) {
        const u = db.users[code];
        if (!u) return;
        if (!u.badge) u.badge = { photo: '', nickname: u.name, notes: NONE };
        u.badge.notes = NONE;
        u.noteGlowUntil = 0;
        u.hasItemUsedOnMe = false;
        u._adminStamp = now;

        willRevive(u).forEach(function (x) { backSet[x] = true; });

        try { addHistoryLog(u, '[당국 개입] 특이사항이 초기화되었습니다.'); } catch (e) { }

        const fields = {
            badge: u.badge, noteGlowUntil: 0, hasItemUsedOnMe: false,
            history: u.history || [], _adminStamp: now
        };
        if (db_()) jobs.push(db_().ref('users/' + code).update(fields).catch(function (e) {
            console.error('[당국] 특이사항 저장 실패 ' + code, e);
        }));
        names.push(u.name);
    });

    if (!db_()) { try { saveDB(); } catch (e) { } }
    try { updateUI(); } catch (e) { }
    try {
        const el = document.getElementById('badge-notes-text');
        if (el && currentUser && targets.indexOf(currentUser.code) >= 0) el.innerText = NONE;
    } catch (e) { }

    const back = Object.keys(backSet);
    const say = function () {
        showCustomAlert(names.length + '명의 특이사항을 초기화했습니다.\n(' + names.join(', ') + ')'
            + (back.length
                ? '\n\n다만 아직 몸에 남아 있어 곧 다시 적히는 줄이 있습니다.\n· ' + back.join('\n· ')
                  + '\n\n괄호 안의 단추를 함께 누르시면 깨끗이 비워집니다.'
                : ''));
    };
    if (jobs.length) Promise.all(jobs).then(say).catch(say);
    else say();
}

// ==========================================
// 갈아끼운다 — index.html 것보다 나중에 선다
// ==========================================
(function swap() {
    const iv = setInterval(function () {
        if (typeof adminClearStatus !== 'function' || typeof adminClearNotes !== 'function') return;
        if (adminClearStatus._fixed) { clearInterval(iv); return; }
        clearStatus._fixed = true;
        clearNotes._fixed = true;
        adminClearStatus = clearStatus;
        adminClearNotes = clearNotes;
        window.adminClearStatus = clearStatus;
        window.adminClearNotes = clearNotes;
        clearInterval(iv);
        console.log('[당국] 특이사항 초기화 · 상태이상 소거 다시 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 확인
//   adminClearCheck('사번')   그 사원에게 무엇이 걸려 있나
// ==========================================
window.adminClearCheck = function (who) {
    if (!isAdmin()) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const on = ZERO.concat(WIPE, FALSE).filter(function (k) { return LABEL[k] && live(u, k); })
        .map(function (k) { return LABEL[k]; });
    console.log('%c===== ' + u.name + ' 사원 =====', 'color:#ba68c8; font-size:13px');
    console.log('  걸린 것     :', on.length ? on.join(' · ') : '없음');
    console.log('  특이사항    :', (u.badge && u.badge.notes) || NONE);
    const back = willRevive(u);
    console.log('  되살아날 줄 :', back.length ? '\n    · ' + back.join('\n    · ') : '없음');
};

console.log('[당국] 소거·초기화 — adminClearCheck(사번)');

})();
