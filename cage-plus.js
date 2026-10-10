// ==========================================
// ★ 감금실 — 역전 주사위 · 🔩 쇠지렛대
// bundles.json 마지막 묶음, cage.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 전에는 이랬다
//
//   갇히면 할 수 있는 것이 **하나도 없었다.** 감금실 칸에 단추가 하나도
//   안 그려지고 (cage.js:330-340), 시설·탐사·상점·소지품이 전부 막힌 채
//   가둔 사람이 열어 주거나 열두 시간이 지나기를 기다려야 했다.
//
// ■ 이제 두 가지 길이 있다
//
//   ① 주사위 — 가둔 사람이 **같이 접속해 있을 때** 한 번 걸 수 있다.
//      스무 면이 아니라 여섯 면, **3판 2승**이다. 비기면 그 판은 다시
//      굴린다. 이기면 문이 열리고 **가둔 사람이 대신 들어간다.**
//      지면 그걸로 끝이다 — 한 번 갇히는 동안 한 번뿐이다.
//
//   ② 🔩 쇠지렛대 — 사택 테트리스에서 스무 줄 넘게 지우면 하루에 하나
//      받는다. 이미 하나 가지고 있으면 더 주지 않는다. 그것으로 문을
//      부수고 나올 수 있고, **부서진 감금실은 두 시간 동안 못 쓴다.**
//      그 두 시간은 가둔 쪽에게도 똑같이 걸린다.
//
// ■ 어디에 적히나
//
//   두 사람이 같은 곳을 봐야 하므로 공용 자리를 하나 쓴다. 열쇠는
//   보관함과 같은 것(두 사람 사번 중 앞선 쪽)이다.
//
//       cageRoom/<열쇠>/broke        부서진 문이 고쳐지는 때
//       cageRoom/<열쇠>/duel         지금 굴리고 있는 주사위
//
//   주사위 한 판은 이렇게 생겼다.
//
//       { a, aName, b, bName, cageAt, state, r, win:{a,b}, roll:{1:{a,b}…},
//         winner, applied, at }
//
//     a = 갇힌 사람(거는 쪽) · b = 가둔 사람.
//     cageAt 은 **그때 갇힌 시각**이다. 이것으로 「한 번 갇히는 동안
//     한 번」을 가른다 — 풀려났다 다시 갇히면 또 걸 수 있다.
//
// ■ 누가 셈하나
//
//   따로 심판을 두지 않는다. 두 쪽 다 제 주사위만 적고, 둘이 다 차면
//   **먼저 본 쪽이 트랜잭션 한 번으로** 그 판을 닫는다. 결과를 적용하는
//   것(문 열기·역으로 가두기)도 applied 자리를 먼저 집은 쪽이 맡는다.
//   그래서 한쪽 화면이 꺼져도 두 번 적용되지 않는다.
//
// ■ 콘솔
//   cagePlusState()   지금 상태 · 쇠지렛대 · 부서짐
//   crowGive(사번)    상담사 — 쇠지렛대 하나

(function cagePlus() {

const CROW = '🔩 쇠지렛대';
const BROKE_MS = 2 * 3600 * 1000;      // 부서진 문이 고쳐지기까지
const LINES = 20;                      // 테트리스 몇 줄부터 받나
const NEED = 2;                        // 3판 2승
const ROUNDS = 3;
const AUTO_MS = 25000;                 // 이만큼 안 굴리면 대신 굴려 준다
const ADMIN = 'kario0987';
const BOX = 'cage-plus-box';

function db_() { return (typeof database !== 'undefined') ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function now() { return Date.now(); }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function users() { return (typeof db !== 'undefined' && db.users) ? db.users : {}; }
function nameOf(c) { return ((users()[c] || {}).name) || '사원'; }
function d6() { return Math.floor(Math.random() * 6) + 1; }

// 갇혔나 — cage.js 의 셈을 그대로 쓴다 (12시간 뚜껑이 두 군데 있으면 어긋난다)
function caged(u) {
    try { return (typeof window.isCaged === 'function') ? (window.isCaged(u) ? (u || me()).cage : null) : null; }
    catch (e) { return null; }
}
function mate(u) {
    try { if (typeof window.cageMateOf === 'function') return window.cageMateOf(u || me()); } catch (e) { }
    try { if (typeof getRoomie === 'function') return getRoomie(u || me()); } catch (e) { }
    return null;
}
function key() {
    try { if (typeof window.cageKeyOf === 'function') return window.cageKeyOf(me()); } catch (e) { }
    try { if (typeof houseStorageRef === 'function') return houseStorageRef(me()); } catch (e) { }
    return null;
}
function roomPath() { const k = key(); return k ? 'cageRoom/' + k : null; }
function online(c) {
    try { return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[c]); }
    catch (e) { return false; }
}

// ==========================================
// 공용 자리를 지켜본다
// ==========================================
let ref = null, watching = '', room = null;

function watch() {
    const p = roomPath();
    if (!p || !db_()) {
        if (ref) { try { ref.off(); } catch (e) { } ref = null; watching = ''; room = null; }
        return;
    }
    if (watching === p) return;
    if (ref) { try { ref.off(); } catch (e) { } }
    watching = p;
    ref = db_().ref(p);
    ref.on('value', function (s) { room = s.val() || null; try { paint(); } catch (e) { } });
}

function broke() {
    const v = (room && room.broke) || 0;
    return now() < v ? v : 0;
}
function duel() {
    const d = (room && room.duel) || null;
    if (!d || !d.a || !d.b) return null;
    return d;
}

// ==========================================
// 🔩 쇠지렛대
// ==========================================
function crowCount(u) {
    u = u || me();
    if (!u || !Array.isArray(u.inventory)) return 0;
    return u.inventory.filter(function (x) { return x === CROW; }).length;
}
function hasCrow(u) { return crowCount(u) > 0; }

(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[CROW] = {
            price: 0, usable: false, targetable: false, noSell: true,
            desc: '사택 창고 구석에 있던 쇠지렛대. 끝이 닳아 반들거린다. '
                + '감금실 문틈에 걸고 체중을 실으면 걸쇠가 먼저 진다. '
                + '감금실 칸에서 쓴다 — 쓰고 나면 그 감금실은 두 시간 동안 못 쓴다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(CROW) < 0) {
            NO_SELL_ITEMS.push(CROW);
        }
        console.log('[감금실] ' + CROW + ' 등록');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 테트리스가 끝날 때 — 스무 줄 넘으면 하루 하나
(function hookTet() {
    const iv = setInterval(function () {
        if (typeof tetGameOver !== 'function') return;
        if (tetGameOver._crow) { clearInterval(iv); return; }
        const _t = tetGameOver;
        const w = function () {
            let lines = 0;
            try { lines = (typeof tet !== 'undefined' && tet) ? (tet.lines || 0) : 0; } catch (e) { }
            try { return _t.apply(this, arguments); }
            finally { try { giveCrow(lines); } catch (e) { console.warn('[감금실]', e); } }
        };
        w._crow = true;
        tetGameOver = w;
        window.tetGameOver = w;
        clearInterval(iv);
        console.log('[감금실] 테트리스 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function giveCrow(lines) {
    const u = me();
    if (!u || lines < LINES) return;
    const today = (typeof getTodayStr === 'function') ? getTodayStr() : '';
    const msg = document.getElementById('tetris-msg');
    const tail = function (html) {
        if (msg) msg.insertAdjacentHTML('beforeend', '<br>' + html);
    };

    // 이미 하나 가지고 있으면 더 주지 않는다 (오늘 몫은 쓰지 않는다)
    if (hasCrow(u)) {
        tail('<span style="font-size:11px; color:#8a7a4a;">🔩 쇠지렛대는 이미 가지고 있습니다.</span>');
        return;
    }
    if (u.crowDate === today) {
        tail('<span style="font-size:11px; color:#8a7a4a;">🔩 오늘 몫은 이미 받았습니다.</span>');
        return;
    }
    u.crowDate = today;
    if (!Array.isArray(u.inventory)) u.inventory = [];
    u.inventory.push(CROW);
    try { if (typeof addHistoryLog === 'function')
        addHistoryLog(u, '[사택] 테트리스 ' + lines + '줄 — ' + CROW + ' 를 챙겼습니다.'); } catch (e) { }
    try { if (typeof saveFields === 'function')
        saveFields({ inventory: 1, crowDate: 1, history: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    tail('<span style="font-size:11px; color:#d4af37; font-weight:bold;">🔩 쇠지렛대를 하나 챙겼습니다.</span>'
       + '<br><span style="font-size:10px; color:#888;">감금실 칸에서 쓸 수 있습니다. (하루 하나)</span>');
    paint();
}

// ==========================================
// 문 부수기
// ==========================================
window.cageCrowBreak = function () {
    const u = me();
    const c = caged(u);
    if (!c) { showCustomAlert('갇혀 있지 않습니다.'); return; }
    if (!hasCrow(u)) { showCustomAlert(CROW + ' 가 없습니다.'); return; }
    const p = roomPath();
    if (!p || !db_()) { showCustomAlert('사택 기록을 읽지 못했습니다.'); return; }

    const until = now() + BROKE_MS;
    const keeper = users()[c.by] || null;

    // 쇠지렛대를 먼저 쓴다
    try {
        if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, CROW, 1);
        else { const i = u.inventory.indexOf(CROW); if (i >= 0) u.inventory.splice(i, 1); }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }

    db_().ref(p + '/broke').set(until).catch(function () { });
    db_().ref(p + '/duel').remove().catch(function () { });      // 굴리던 것이 있으면 거둔다

    if (keeper) {
        try { if (typeof addHistoryLog === 'function')
            addHistoryLog(keeper, '[감금실] ' + u.name + ' 사원이 문을 부수고 나갔습니다. (2시간 못 씀)'); } catch (e) { }
        try { if (typeof updateUserFields === 'function')
            updateUserFields(keeper.code, { history: keeper.history, _adminStamp: now() }); } catch (e) { }
    }

    free(u, '쇠지렛대로 문을 부수고 나왔습니다.');
    showCustomAlert('🔩 문을 부수고 나왔습니다.\n\n'
        + '걸쇠가 먼저 졌습니다. 쇠지렛대는 휘어서 버렸습니다.\n\n'
        + '이 감금실은 두 시간 동안 쓸 수 없습니다.');
    paint();
};

function free(u, why, then) {
    try {
        if (typeof window.cageFreeUser === 'function') { window.cageFreeUser(u, why, then); return; }
    } catch (e) { }
    // cage.js 가 내어 주지 않는 판이면 최소한만 한다
    u.cage = null; u.cageUse = null;
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[감금실] ' + why); } catch (e) { }
    try { if (typeof updateUserFields === 'function')
        updateUserFields(u.code, { cage: null, cageUse: null, history: u.history, _adminStamp: now() }); } catch (e) { }
    if (typeof then === 'function') { try { then(); } catch (e) { } }
}

// 부서진 동안은 못 가둔다
(function hookShut() {
    const iv = setInterval(function () {
        if (typeof cageShut !== 'function') return;
        if (cageShut._crow) { clearInterval(iv); return; }
        const _s = cageShut;
        const w = function () {
            const b = broke();
            if (b) {
                const left = Math.ceil((b - now()) / 60000);
                showCustomAlert('감금실 문이 부서져 있습니다.\n\n'
                    + '걸쇠가 뜯겨 잠기지 않습니다.\n약 ' + left + '분 뒤에 고쳐집니다.');
                return false;
            }
            return _s.apply(this, arguments);
        };
        w._crow = true;
        cageShut = w;
        window.cageShut = w;
        clearInterval(iv);
        console.log('[감금실] 부서진 문 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 주사위 — 3판 2승
// ==========================================
function mySide(d) {
    const u = me();
    if (!u || !d) return null;
    if (d.a === u.code) return 'a';
    if (d.b === u.code) return 'b';
    return null;
}

window.cageDiceAsk = function () {
    const u = me();
    const c = caged(u);
    if (!c) { showCustomAlert('갇혀 있지 않습니다.'); return; }
    const keeper = users()[c.by];
    if (!keeper) { showCustomAlert('가둔 사원을 찾지 못했습니다.'); return; }
    if (!online(c.by)) {
        showCustomAlert(keeper.name + ' 사원이 접속해 있지 않습니다.\n\n'
            + '문 너머에 사람이 있어야 걸 수 있습니다.');
        return;
    }
    if (broke()) { showCustomAlert('문이 부서져 있습니다.'); return; }
    const p = roomPath();
    if (!p || !db_()) return;

    const seed = {
        a: u.code, aName: u.name, b: keeper.code, bName: keeper.name,
        cageAt: c.at || 0, state: 'PLAY', r: 1,
        win: { a: 0, b: 0 }, roll: {}, at: now()
    };
    db_().ref(p + '/duel').transaction(function (cur) {
        // 한 번 갇히는 동안 한 번뿐 — 같은 cageAt 으로 이미 굴렸으면 그만둔다
        if (cur && cur.cageAt === seed.cageAt) return;
        return seed;
    }, null, false).then(function (res) {
        if (!(res && res.committed)) {
            showCustomAlert('이번 감금에서는 이미 한 번 걸었습니다.');
            return;
        }
        try { if (typeof addHistoryLog === 'function')
            addHistoryLog(u, '[감금실] ' + keeper.name + ' 사원에게 주사위를 걸었습니다. (3판 2승)'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
        showCustomAlert('🎲 문을 두드렸습니다.\n\n'
            + keeper.name + ' 사원과 3판 2승.\n'
            + '이기면 문이 열리고, 저쪽이 대신 들어갑니다.');
    }).catch(function () { });
};

window.cageDiceRoll = function () {
    const d = duel();
    if (!d || d.state !== 'PLAY') return;
    const s = mySide(d);
    if (!s) return;
    const r = String(d.r || 1);
    if (((d.roll || {})[r] || {})[s] != null) return;      // 이미 굴렸다
    const p = roomPath();
    if (!p || !db_()) return;
    db_().ref(p + '/duel/roll/' + r + '/' + s).transaction(function (cur) {
        return (cur != null) ? undefined : d6();
    }, null, false).then(function () { setTimeout(close_, 120); }).catch(function () { });
};

// 두 쪽이 다 굴렸으면 그 판을 닫는다 — 먼저 본 쪽이 트랜잭션 한 번으로
function close_() {
    const d = duel();
    if (!d || d.state !== 'PLAY') return;
    const r = String(d.r || 1);
    const cur = (d.roll || {})[r] || {};
    if (cur.a == null || cur.b == null) return;
    const p = roomPath();
    if (!p || !db_()) return;

    db_().ref(p + '/duel').transaction(function (x) {
        if (!x || x.state !== 'PLAY') return x || null;
        const k = String(x.r || 1);
        const v = (x.roll || {})[k] || {};
        if (v.a == null || v.b == null) return x;
        x.win = x.win || { a: 0, b: 0 };
        if (v.a === v.b) {
            // 비겼다 — 그 판은 없던 것으로 하고 다시 굴린다
            x.roll[k] = null;
            x.ties = (x.ties || 0) + 1;
            return x;
        }
        const w = (v.a > v.b) ? 'a' : 'b';
        x.win[w] = (x.win[w] || 0) + 1;
        if (x.win[w] >= NEED || (x.r || 1) >= ROUNDS) {
            x.state = 'DONE';
            x.winner = (x.win.a > x.win.b) ? x.a : x.b;
            x.doneAt = now();
        } else {
            x.r = (x.r || 1) + 1;
        }
        return x;
    }, null, false).catch(function () { });
}

// 안 굴리고 버티면 대신 굴려 준다 (내 시계로만 센다)
const waitSeen = { k: '', at: 0 };
function autoRoll() {
    const d = duel();
    if (!d || d.state !== 'PLAY') { waitSeen.k = ''; return; }
    const r = String(d.r || 1);
    const cur = (d.roll || {})[r] || {};
    const k = (d.cageAt || 0) + '|' + r;
    if (waitSeen.k !== k) { waitSeen.k = k; waitSeen.at = now(); return; }
    if (now() - waitSeen.at < AUTO_MS) return;
    const p = roomPath();
    if (!p || !db_()) return;
    ['a', 'b'].forEach(function (s) {
        if (cur[s] != null) return;
        db_().ref(p + '/duel/roll/' + r + '/' + s).transaction(function (c) {
            return (c != null) ? undefined : d6();
        }, null, false).catch(function () { });
    });
    setTimeout(close_, 300);
}

// 끝났으면 한 사람이 맡아 적용한다
function applyOutcome() {
    const d = duel();
    if (!d || d.state !== 'DONE' || d.applied) return;
    if (!mySide(d)) return;
    const p = roomPath();
    if (!p || !db_()) return;
    db_().ref(p + '/duel/applied').transaction(function (c) {
        return c ? undefined : me().code;
    }, null, false).then(function (res) {
        if (!(res && res.committed)) return;
        // ★ 사원 기록은 서버에서 계속 다시 내려온다. 트랜잭션을 기다리는
        //   사이에 db.users 의 사원이 **새 덩어리로 갈려 있을 수 있다.**
        //   미리 집어 둔 것에 적으면 그 글이 통째로 사라진다. 여기서 다시 집는다.
        const A = users()[d.a], B = users()[d.b];
        if (!A || !B) return;
        if (d.winner === d.a) {
            // 갇혀 있던 쪽이 이겼다 — 문이 열리고 가둔 쪽이 대신 들어간다
            const nb = { by: d.a, at: now(), until: now() + maxMs() };
            free(A, d.bName + ' 사원과의 주사위에서 이겨 문이 열렸습니다.', function () {
                const b2 = users()[d.b] || B;
                b2.cage = nb;
                try { if (typeof addHistoryLog === 'function') {
                    addHistoryLog(b2, '[감금실] ' + d.aName + ' 사원에게 주사위로 지고 갇혔습니다.');
                } } catch (e) { }
                try { if (typeof updateUserFields === 'function') {
                    updateUserFields(d.b, { cage: nb, history: b2.history, _adminStamp: now() });
                } } catch (e) { }
                try { if (typeof window.cagePaint === 'function') window.cagePaint(); } catch (e) { }
                try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            });
        } else {
            const a2 = users()[d.a] || A;
            try { if (typeof addHistoryLog === 'function') {
                addHistoryLog(a2, '[감금실] 주사위에서 졌습니다. 문은 그대로입니다.');
            } } catch (e) { }
            try { if (typeof updateUserFields === 'function') {
                updateUserFields(d.a, { history: a2.history, _adminStamp: now() });
            } } catch (e) { }
        }
    }).catch(function () { });
}
function maxMs() {
    try { if (typeof window.cageMaxMs === 'number') return window.cageMaxMs; } catch (e) { }
    return 12 * 3600 * 1000;
}

// ==========================================
// 화면 — cage.js 의 칸 바로 아래에 따로 둔다
// ==========================================
//
//   cage.js 의 paintCage 는 2초마다 #cage-box 안을 통째로 다시 쓴다.
//   그 안에 끼워 넣으면 2초마다 지워진다. 그래서 형제로 둔다.
function box() {
    const host = document.getElementById('house-main');
    if (!host) return null;
    let el = document.getElementById(BOX);
    if (el) return el;
    el = document.createElement('div');
    el.id = BOX;
    el.style.cssText = 'border:1px solid #4a3a2a; border-radius:8px; padding:12px; margin-top:10px;'
        + ' background:linear-gradient(145deg,#15110c,#0e0b08); font-size:11px; color:#ddd;'
        + ' line-height:1.7; display:none;';
    const anchor = document.getElementById('cage-box');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor.nextSibling);
    else host.insertBefore(el, host.firstChild);
    return el;
}

function btn(id, label, color) {
    return '<button class="game-btn" id="' + id + '" style="width:100%; margin:6px 0 0 0;'
        + ' padding:10px; font-size:11px; border-color:' + color + ' !important;'
        + ' color:' + color + ' !important;">' + label + '</button>';
}

function diceFace(n) {
    return n == null ? '—' : ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][n] + ' ' + n;
}

function duelHtml(d) {
    const s = mySide(d);
    const r = String(d.r || 1);
    const cur = (d.roll || {})[r] || {};
    const mine = cur[s], his = cur[s === 'a' ? 'b' : 'a'];
    const w = d.win || { a: 0, b: 0 };
    const meWin = s === 'a' ? (w.a || 0) : (w.b || 0);
    const heWin = s === 'a' ? (w.b || 0) : (w.a || 0);
    const foe = s === 'a' ? d.bName : d.aName;

    let h = '<div style="color:#d4af37; font-weight:bold;">🎲 주사위 — 3판 2승</div>'
        + '<div style="color:#aaa; margin-top:4px;">' + esc(foe) + ' 사원과 '
        + '<b style="color:#fff;">' + meWin + '</b> 대 <b style="color:#fff;">' + heWin + '</b>'
        + ' <span style="color:#777;">· ' + r + '번째 판</span>'
        + ((d.ties || 0) ? ' <span style="color:#777;">· 비김 ' + d.ties + '번</span>' : '')
        + '</div>';

    if (d.state === 'DONE') {
        const iWon = d.winner === me().code;
        h += '<div style="margin-top:8px; padding:9px 10px; border-radius:5px;'
            + ' background:' + (iWon ? 'rgba(76,175,80,0.10)' : 'rgba(127,0,0,0.12)')
            + '; border:1px solid ' + (iWon ? '#2e7d32' : '#7f0000') + ';">'
            + (iWon
                ? (s === 'a'
                    ? '<b style="color:#8bc34a;">이겼습니다.</b><br>'
                      + '<span style="color:#aaa;">걸쇠가 안쪽에서 열린다. 자리를 바꿔 준다.</span>'
                    : '<b style="color:#8bc34a;">막았습니다.</b><br>'
                      + '<span style="color:#aaa;">문은 그대로다. 안에서 아무 소리도 안 난다.</span>')
                : (s === 'a'
                    ? '<b style="color:#ff8a8a;">졌습니다.</b><br>'
                      + '<span style="color:#aaa;">주사위를 문틈으로 도로 밀어 넣는 소리가 났다.</span>'
                    : '<b style="color:#ff8a8a;">졌습니다.</b><br>'
                      + '<span style="color:#aaa;">문이 열린다. 들어갈 차례다.</span>'))
            + '</div>';
        return h;
    }

    h += '<div style="display:flex; gap:8px; margin-top:8px; text-align:center;">'
       + '<div style="flex:1; padding:8px; border-radius:5px; background:rgba(255,255,255,0.04);">'
       + '<div style="font-size:9px; color:#888;">나</div>'
       + '<div style="font-size:15px; color:#ffd700; font-weight:bold;">' + diceFace(mine) + '</div></div>'
       + '<div style="flex:1; padding:8px; border-radius:5px; background:rgba(255,255,255,0.04);">'
       + '<div style="font-size:9px; color:#888;">' + esc(foe) + '</div>'
       + '<div style="font-size:15px; color:#9fd8ef; font-weight:bold;">'
       + (his == null ? '<span style="color:#666;">…</span>' : diceFace(his)) + '</div></div></div>';

    if (mine == null) h += btn('cage-dice-roll', '굴린다', '#d4af37');
    else h += '<div style="text-align:center; color:#777; font-size:10px; margin-top:7px;">'
            + (his == null ? '저쪽을 기다리는 중…' : '셈하는 중…') + '</div>';
    return h;
}

function paint() {
    const el = box();
    if (!el) return;
    const u = me();
    if (!u) { el.style.display = 'none'; return; }
    try {
        if (typeof window.cageHasS === 'function' && !window.cageHasS(u)) {
            el.style.display = 'none'; return;
        }
    } catch (e) { }
    if (!mate(u)) { el.style.display = 'none'; return; }

    const c = caged(u);
    const m = mate(u);
    const his = m ? caged(m) : null;
    const iKeep = his && his.by === u.code;
    const d = duel();
    const inDuel = d && mySide(d) && (d.state === 'PLAY'
        || (d.state === 'DONE' && now() - (d.doneAt || d.at || 0) < 90000));
    const b = broke();

    let h = '';

    if (inDuel) h += duelHtml(d);

    if (c) {
        // 갇힌 쪽
        if (!inDuel) {
            const keeper = users()[c.by] || {};
            const used = d && d.cageAt === (c.at || 0);
            h += '<div style="color:#d4af37; font-weight:bold;">나갈 길</div>';
            if (hasCrow(u) && !b) {
                h += '<div style="color:#aaa; margin-top:4px;">'
                   + '🔩 쇠지렛대가 있습니다. 걸쇠를 비틀면 열립니다.</div>'
                   + btn('cage-crow', '🔩 문을 부순다', '#d4af37');
            } else if (!hasCrow(u)) {
                h += '<div style="color:#777; margin-top:4px; font-size:10px;">'
                   + '🔩 쇠지렛대가 없습니다. <span style="color:#8a7a4a;">사택 테트리스에서 '
                   + LINES + '줄 넘게 지우면 하루에 하나 받습니다.</span></div>';
            }
            if (used) {
                h += '<div style="color:#777; margin-top:6px; font-size:10px;">'
                   + '🎲 이번 감금에서는 이미 한 번 걸었습니다.</div>';
            } else if (online(c.by)) {
                h += '<div style="color:#aaa; margin-top:6px;">'
                   + esc(keeper.name || '가둔 사원') + ' 사원이 문 너머에 있습니다.</div>'
                   + btn('cage-dice', '🎲 주사위를 건다 — 3판 2승', '#9fd8ef');
            } else {
                h += '<div style="color:#777; margin-top:6px; font-size:10px;">'
                   + '🎲 ' + esc(keeper.name || '가둔 사원') + ' 사원이 접속해 있지 않습니다. '
                   + '문 너머에 사람이 있어야 걸 수 있습니다.</div>';
            }
        }
    } else {
        // 안 갇힌 쪽
        if (!inDuel) {
            h += '<div style="color:#8a7a4a; font-size:10px;">🔩 쇠지렛대 '
               + (hasCrow(u) ? '<b style="color:#d4af37;">' + crowCount(u) + '개</b>'
                             : '<span style="color:#666;">없음</span>')
               + (u.crowDate === ((typeof getTodayStr === 'function') ? getTodayStr() : '')
                   ? ' <span style="color:#666;">· 오늘 몫은 받았습니다</span>'
                   : ' <span style="color:#666;">· 테트리스 ' + LINES + '줄이면 하나</span>')
               + '</div>';
            if (iKeep) {
                h += '<div style="color:#777; font-size:10px; margin-top:5px;">'
                   + '안쪽에서 문을 두드리면 여기에 뜹니다.</div>';
            }
        }
    }

    if (b) {
        h += '<div style="margin-top:8px; padding:8px 10px; border-radius:5px;'
           + ' background:rgba(127,0,0,0.12); border:1px solid #7f0000; color:#ff9a9a;">'
           + '문이 부서져 있습니다 — 약 ' + Math.ceil((b - now()) / 60000) + '분 뒤에 고쳐집니다.</div>';
    }

    if (!h) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    if (el.getAttribute('data-h') !== h) {
        el.innerHTML = h;
        el.setAttribute('data-h', h);
        const a = document.getElementById('cage-crow');
        if (a) a.onclick = function () { window.cageCrowBreak(); };
        const bb = document.getElementById('cage-dice');
        if (bb) bb.onclick = function () { window.cageDiceAsk(); };
        const cc = document.getElementById('cage-dice-roll');
        if (cc) cc.onclick = function () { window.cageDiceRoll(); };
    }
}

// ==========================================
// 돌리기
// ==========================================
setInterval(function () {
    try { watch(); } catch (e) { }
    try { paint(); } catch (e) { }
    // 굴린 직후에도 한 번 부르지만, 그때 한 번 놓치면 그 판이 멎는다.
    // (내 글이 먼저 닿고 상대 글이 늦게 닿는 때) 여기서도 본다.
    try { close_(); } catch (e) { }
    try { autoRoll(); } catch (e) { }
    try { applyOutcome(); } catch (e) { }
}, 1500);

// 사택 화면을 다시 그릴 때마다 칸을 되살린다
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._crow) { clearInterval(iv); return; }
        const _r = renderHouse;
        const w = function () {
            try { return _r.apply(this, arguments); }
            finally { setTimeout(function () { try { paint(); } catch (e) { } }, 60); }
        };
        w._crow = true;
        renderHouse = w;
        window.renderHouse = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 확인
// ==========================================
window.cagePlusState = function () {
    const u = me();
    console.log('%c===== 감금실 — 역전 =====', 'color:#d4af37; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const c = caged(u), m = mate(u);
    console.log('  동거인    :', m ? m.name : '없음', '· 공용 자리', key() || '없음');
    console.log('  나        :', c ? ('갇힘 — ' + nameOf(c.by) + ' 사원이 가둠') : '안 갇힘');
    if (m) {
        const h = caged(m);
        console.log('  동거인    :', h ? ('갇힘 — ' + nameOf(h.by) + ' 사원이 가둠') : '안 갇힘',
            '· 접속', online(m.code) ? 'O' : '✗');
    }
    console.log('  🔩 쇠지렛대:', crowCount(u) + '개 · 오늘 받음',
        u.crowDate === ((typeof getTodayStr === 'function') ? getTodayStr() : '') ? 'O' : '✗');
    const b = broke();
    console.log('  문        :', b ? ('부서짐 — ' + Math.ceil((b - now()) / 60000) + '분 남음') : '멀쩡함');
    const d = duel();
    console.log('  주사위    :', d ? JSON.stringify({
        a: d.aName, b: d.bName, state: d.state, r: d.r, win: d.win, winner: d.winner
    }) : '없음');
};

window.crowGive = function (who) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = Object.keys(users()).map(function (c) { return users()[c]; })
        .filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0];
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(CROW);
    try { if (typeof addHistoryLog === 'function') addHistoryLog(t, '[당국 개입] ' + CROW + ' 지급'); } catch (e) { }
    try { if (typeof updateUserFields === 'function')
        updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + CROW + ' 를 줬습니다.', 'color:#4CAF50');
};

console.log('[감금실] cagePlusState() · crowGive(사번)');

})();
