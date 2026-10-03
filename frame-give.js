// ==========================================
// ★ 테두리 붙여 보기 — 콘솔용
// bundles.json 마지막 그룹, frames-video3.js 보다 뒤면 어디든 된다
// ==========================================
//
// 테두리는 user.frames 에 들어 있다. (frames.js:143)
//
//     user.frames = { owned: { v04:1, ... }, badge: '', list: '', hist: '' }
//
//   owned  가지고 있는 것
//   badge  사원증 사진 칸
//   list   사원 열람 — 사원 목록의 칸
//   hist   기록 줄
//
// 원래는 상자에서 뽑아야 owned 에 들어가고, 그다음 직접 골라 다는 구조다.
// 여기서는 그 두 단계를 한 번에 해 준다.
//
//     frameList()                  어떤 테두리가 있는지 본다
//     frameGive('3079', 'v04')     그 사번에게 성운을 주고 사원 열람에 단다
//     frameGive('또류', '성운')     이름과 테두리 이름으로도 된다
//     frameGive('v04')             사번을 빼면 나에게 단다
//     frameGive('3079', 'v04', 'badge')   사원증 칸에 단다
//     frameClear('3079')           떼고 돌려놓는다
//
// 남에게 거는 것은 상담사만 할 수 있다.

(function frameGive() {

const SLOTS = { list: '사원 열람', badge: '사원증', hist: '기록' };

function findFrame(key) {
    if (typeof FRAMES === 'undefined') return null;
    const k = String(key || '').trim();
    return FRAMES.find(function (f) { return f.id === k || f.n === k; }) || null;
}

function findUser(key) {
    if (typeof db === 'undefined' || !db.users) return null;
    const k = String(key || '').trim();
    if (db.users[k]) return db.users[k];
    const hit = Object.keys(db.users).filter(function (c) {
        const u = db.users[c];
        return u && (u.name === k || String(u.no) === k);
    });
    if (hit.length === 1) return db.users[hit[0]];
    if (hit.length > 1) {
        console.warn('같은 이름이 ' + hit.length + '명입니다. 사번으로 넣으세요: '
            + hit.map(function (c) { return db.users[c].name + '(' + c + ')'; }).join(', '));
    }
    return null;
}

function bagOf(u) {
    if (!u.frames) u.frames = { owned: {}, badge: '', list: '', hist: '' };
    if (!u.frames.owned) u.frames.owned = {};
    return u.frames;
}

function push(u) {
    if (currentUser && u.code === currentUser.code) {
        if (typeof saveFields === 'function') {
            try { saveFields({ frames: 1 }); } catch (e) { console.error(e); }
        }
    } else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { frames: u.frames });
    }
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderEmployeeCards === 'function') renderEmployeeCards();
    if (typeof frRefresh === 'function') setTimeout(frRefresh, 80);
}

// ==========================================
window.frameList = function () {
    if (typeof FRAMES === 'undefined') { console.warn('frames.js 가 아직 안 올라왔습니다.'); return; }
    const mine = (currentUser && currentUser.frames) || {};
    const own = mine.owned || {};
    console.log('%c===== 테두리 ' + FRAMES.length + '종 =====', 'color:#c9a8ff; font-size:13px');
    const vids = (window._fv3Frames || []).map(function (f) { return f.id; })
        .concat((window._fv2Frames || []).map(function (f) { return f.id; }))
        .concat(['v01']);
    console.table(FRAMES.map(function (f) {
        const where = [];
        Object.keys(SLOTS).forEach(function (s) { if (mine[s] === f.id) where.push(SLOTS[s]); });
        return {
            번호: f.id, 등급: f.g, 이름: f.n,
            종류: vids.indexOf(f.id) >= 0 ? '영상' : '그림',
            '내 보유': own[f.id] > 0 ? 'O' : '-',
            '내가 단 곳': where.join(' · ') || '-'
        };
    }));
    console.log("  걸기 — frameGive('사번', '번호 또는 이름')");
};

window.frameGive = function (who, what, slot) {
    // 사번을 빼고 테두리만 넣은 경우
    if (what === undefined) { what = who; who = currentUser && currentUser.code; }
    slot = slot || 'list';
    if (!SLOTS[slot]) { console.warn("칸은 list · badge · hist 중 하나입니다."); return; }

    const f = findFrame(what);
    if (!f) { console.warn('그런 테두리가 없습니다. frameList() 로 확인하세요.'); return; }

    const u = findUser(who);
    if (!u) { console.warn('그런 사원을 찾지 못했습니다.'); return; }

    const isMe = currentUser && u.code === currentUser.code;
    if (!isMe && (!currentUser || currentUser.code !== 'kario0987')) {
        console.warn('남에게 거는 것은 상담사만 할 수 있습니다.');
        return;
    }

    const bag = bagOf(u);
    bag.owned[f.id] = Math.max(1, bag.owned[f.id] || 0);   // 없으면 하나 준다
    bag[slot] = f.id;
    push(u);

    console.log('%c✓ ' + (u.name || u.code) + ' — [' + f.n + '] ' + f.g + '등급을 '
        + SLOTS[slot] + ' 칸에 걸었습니다.', 'color:#4CAF50');
    if (slot === 'list') console.log('  사원 목록을 열면 그 사원 칸에 둘러져 있습니다.');
};

window.frameClear = function (who, slot) {
    const u = findUser(who === undefined ? (currentUser && currentUser.code) : who);
    if (!u) { console.warn('그런 사원을 찾지 못했습니다.'); return; }
    const isMe = currentUser && u.code === currentUser.code;
    if (!isMe && (!currentUser || currentUser.code !== 'kario0987')) {
        console.warn('남에게 거는 것은 상담사만 할 수 있습니다.'); return;
    }
    const bag = bagOf(u);
    if (slot) { if (!SLOTS[slot]) { console.warn('칸은 list · badge · hist'); return; } bag[slot] = ''; }
    else { bag.list = ''; bag.badge = ''; bag.hist = ''; }
    push(u);
    console.log('%c✓ ' + (u.name || u.code) + ' — ' + (slot ? SLOTS[slot] : '전부') + ' 떼었습니다.',
        'color:#4CAF50');
};

console.log('[테두리] frameList() · frameGive(사번, 테두리) · frameClear(사번)');

})();