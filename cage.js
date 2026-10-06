// ==========================================
// ★ 감금실 — S등급 사택의 왼쪽 칸
// bundles.json 마지막 그룹, roommate.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   S등급 호실에만 왼쪽에 칸이 하나 더 있다. 룸메이트를 가둘 수 있고
//   갇힌 쪽은 그동안 아무것도 하지 못한다. 푸는 것은 가둔 쪽이다.
//
//   방 안에 기구를 세 가지 들일 수 있다. 산 사람만 쓸 수 있다.
//
//     퍼킹 머신 100,000 P   10시간 묶는다. 갇힌 쪽이 임신 중이면
//                            묶여 있던 시간만큼 출산이 앞당겨진다
//     족갑       50,000 P   최대 12시간. 세 시간마다 3~4만 P 가
//                            공용 통장에 들어간다
//     착유 머신 200,000 P   최대 5시간. 다섯 시간을 채우면
//                            공용 통장에 10만 P 가 들어간다
//
//   공용 통장은 은행 화면 아래에 따로 생긴다. 두 룸메이트가 같이 쓴다.
//
// ■ 저절로 풀리는 자리를 반드시 둔다
//
//   가둔 사람이 접속을 끊으면 갇힌 사람은 영영 못 나온다.
//   그래서 세 가지 빗장을 걸어 둔다.
//
//     1. 기구의 시간이 끝나면 풀린다
//     2. 기구가 없어도 MAX_MS(12시간)가 지나면 저절로 풀린다
//     3. 월요일 재배정 때 짝이 바뀌면 풀린다
//     4. 상담사가 cageFree(사번) 으로 푼다
//
//   이건 설정이 아니라 고장을 막는 장치다. 숫자를 바꾸시려면
//   아래 MAX_MS 를 고치시면 된다.
//
// ■ 공용 통장은 짝이 바뀌어도 안 지운다
//
//   돈을 말없이 없애면 다툼이 된다. 월요일에 짝이 바뀌면 지우지 않고
//   「비우라」고 알린다. 비우는 것은 사람이 한다.
//
// ■ 확인용
//
//   cageState(사번)   갇혔는지 · 기구가 돌고 있는지
//   cageFree(사번)    상담사가 푼다
//   coBank()          공용 통장 잔액과 기록

(function cage() {

const MIN_GRADE = 'S';
const MAX_MS = 12 * 3600 * 1000;      // 기구가 없어도 이만큼 지나면 풀린다
const HOUR = 3600 * 1000;

const GEAR = {
    fuck: { n: '퍼킹 머신', p: 100000, ms: 10 * HOUR,
            d: '룸메이트를 열 시간 묶어 둔다. 묶여 있는 동안 상대가 임신 중이면 묶인 시간만큼 출산이 앞당겨진다.' },
    cuff: { n: '족갑',      p: 50000,  ms: 12 * HOUR,
            d: '발목에 채운다. 최대 열두 시간. 세 시간마다 3~4만 P 가 공용 통장에 들어간다.' },
    milk: { n: '착유 머신', p: 200000, ms: 5 * HOUR,
            d: '묶고 젖을 짜낸다. 최대 다섯 시간. 다섯 시간을 채우면 공용 통장에 10만 P 가 들어간다.' }
};
const CUFF_BLOCK = 3 * HOUR;          // 족갑 — 셈하는 토막
const CUFF_MIN = 30000, CUFF_MAX = 40000;
const MILK_PAY = 100000;

function now() { return Date.now(); }
function hasS(u) {
    if (typeof houseGrade !== 'function') return false;
    try {
        const g = houseGrade(u);
        if (g === 'L') return true;                      // 관사는 S 위다
        if (typeof HOUSE_GRADES === 'undefined') return g === MIN_GRADE;
        // 「S등급 이상」 — 나중에 S 위에 등급이 생겨도 같이 열린다
        return HOUSE_GRADES.indexOf(g) >= HOUSE_GRADES.indexOf(MIN_GRADE);
    } catch (e) { return false; }
}
function mate(u) {
    if (typeof getRoomie === 'function') { try { return getRoomie(u); } catch (e) { } }
    const h = (u && u.house) || {};
    return h.roomie ? (db.users || {})[h.roomie] : null;
}
function bankRefCode(u) {
    if (typeof houseStorageRef === 'function') { try { return houseStorageRef(u); } catch (e) { } }
    const m = mate(u);
    return m ? [u.code, m.code].sort()[0] : u.code;
}

// ==========================================
// 갇혔는가
// ==========================================
function caged(u) {
    u = u || currentUser;
    if (!u || !u.cage || !u.cage.by) return null;
    // 어떤 까닭으로든 until 이 터무니없이 멀면 갇힌 사람이 영영 못 나온다.
    // 가둔 때(at)로부터 MAX_MS 를 넘는 것은 그만큼으로 본다.
    const at = u.cage.at || 0;
    if (!at) return null;                  // 가둔 때가 없는 기록은 고장이다 — 안 갇힌 것으로 본다
    let until = Math.min(u.cage.until || 0, at + MAX_MS);
    if (now() >= until) return null;
    return u.cage;
}
window.isCaged = function (u) { return !!caged(u); };

// ==========================================
// 갇힌 동안에는 아무것도 못 한다
// ==========================================
const BLOCK = ['useFacility', 'startDarkRun', 'launchPartyRun', 'buyRegularShopItem',
               'buyAlienItem', 'useInventoryItem', 'putToStorage', 'postMarket', 'playSlot'];
BLOCK.forEach(function (name) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        if (window[name]._cage) { clearInterval(iv); return; }
        const _o = window[name];
        window[name] = function () {
            const c = caged(currentUser);
            if (c) {
                const who = (db.users[c.by] || {}).name || '룸메이트';
                const left = Math.max(0, Math.round((c.until - now()) / 60000));
                showCustomAlert('감금실 안입니다.\n\n' + who + ' 사원이 열어 주어야 나갈 수 있습니다.\n'
                    + '(늦어도 ' + Math.ceil(left / 60) + '시간 뒤에는 저절로 열립니다)');
                return false;
            }
            return _o.apply(this, arguments);
        };
        window[name]._cage = true;
        clearInterval(iv);
    }, 500);
});

// ==========================================
// 공용 통장
// ==========================================
let coBal = 0, coLog = [], coWatch = '';
function coRef(u) {
    if (typeof database === 'undefined' || !database) return null;
    return database.ref('houseBank/' + bankRefCode(u || currentUser));
}
(function watchCo() {
    setInterval(function () {
        if (!currentUser || typeof database === 'undefined' || !database) return;
        const code = bankRefCode(currentUser);
        if (coWatch === code) return;

        // 통장 자리가 바뀌었다 = 짝이 바뀌었다.
        // 바꾸기 전에 지난 잔액을 손에 들고 있어야 한다 — 바꾼 뒤에는 0 으로 보인다.
        const oldKey = coWatch, oldBal = coBal;
        if (oldKey) { try { database.ref('houseBank/' + oldKey).off(); } catch (e) { } }
        coWatch = code; coBal = 0; coLog = [];
        database.ref('houseBank/' + code).on('value', function (s) {
            const v = s.val() || {};
            coBal = v.bal || 0;
            coLog = Array.isArray(v.log) ? v.log : [];
            paintBank();
        });
        if (oldKey) pairChanged(oldKey, oldBal);
    }, 1500);
})();

// 짝이 바뀌면 — 풀고, 통장은 비우라고 알린다 (돈은 말없이 안 지운다)
function pairChanged(oldKey, oldBal) {
    if (currentUser && currentUser.cage) freeUser(currentUser, '짝이 바뀌어 문이 열렸습니다.');
    // 상담사는 직원을 데려오고 내보내는 일이 잦다. 그때마다 통장 알림이 뜨면
    // 성가시다. 상담사에게는 띄우지 않는다.
    if (currentUser && currentUser.code === 'kario0987') return;
    if (oldBal > 0) {
        const msg = '동거인이 바뀌었습니다.\n\n지난 공용 통장(' + oldKey + ')에 '
            + oldBal.toLocaleString() + ' P 가 남아 있습니다.\n'
            + '비우지 않으면 그대로 남습니다.';
        if (typeof addHistoryLog === 'function' && currentUser) {
            addHistoryLog(currentUser, '[공용 통장] 동거인이 바뀌었습니다. 지난 통장에 '
                + oldBal.toLocaleString() + ' P 가 남아 있습니다. 비워 주십시오.');
            if (typeof saveFields === 'function') { try { saveFields({ history: 1 }); } catch (e) { } }
        }
        setTimeout(function () { showCustomAlert(msg); }, 1200);
    }
}

function coAdd(u, amt, why, done) {
    const r = coRef(u);
    if (!r || !amt) { if (done) done(false); return; }
    r.transaction(function (cur) {
        cur = cur || { bal: 0, log: [] };
        cur.bal = (cur.bal || 0) + amt;
        const log = Array.isArray(cur.log) ? cur.log : [];
        log.unshift({ t: now(), a: amt, w: why, by: (u || currentUser).name || '' });
        while (log.length > 30) log.pop();
        cur.log = log;
        return cur;
    }, function (err, ok) { if (done) done(!err && ok); }, false);
}

window.coBank = function () {
    console.log('%c===== 공용 통장 =====', 'color:#7fd4d4; font-size:13px');
    console.log('  잔액:', coBal.toLocaleString() + ' P', '· 통장 자리:', bankRefCode(currentUser));
    if (!coLog.length) { console.log('  기록이 없습니다.'); return; }
    console.table(coLog.slice(0, 20).map(function (x) {
        return { 때: new Date(x.t).toLocaleString(), 금액: (x.a > 0 ? '+' : '') + x.a.toLocaleString(),
                 까닭: x.w, 사람: x.by };
    }));
};

// --- 은행 화면에 칸 하나 ---
function paintBank() {
    const host = document.getElementById('bank-body');
    if (!host || !currentUser) return;
    const m = mate(currentUser);
    let el = document.getElementById('co-bank-box');
    if (!m) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'co-bank-box';
        el.style.cssText = 'background:linear-gradient(145deg,#0e1a1a,#081212); border:1px solid #2a6a6a;'
            + ' border-radius:8px; padding:14px; margin-top:14px;';
        host.parentNode.insertBefore(el, host.nextSibling);
    }
    const html = '<div style="font-size:10px; color:#7fd4d4; letter-spacing:1px; margin-bottom:6px;">[공용 통장]</div>'
        + '<div style="font-size:11px; color:#999; margin-bottom:8px;">'
        + m.name + ' 사원과 같이 씁니다. 둘 다 넣고 뺄 수 있습니다.</div>'
        + '<div style="font-size:20px; color:#fff; font-weight:bold; margin-bottom:10px;">'
        + coBal.toLocaleString() + ' P</div>'
        + '<input type="number" id="co-amt" min="1" placeholder="금액" style="width:100%;'
        + ' text-align:center; margin-bottom:8px; box-sizing:border-box;">'
        + '<div style="display:flex; gap:6px;">'
        + '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;" onclick="coPut()">넣기</button>'
        + '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;" onclick="coTake()">빼기</button>'
        + '</div>';
    if (el.innerHTML !== html) el.innerHTML = html;
}
(function hookBank() {
    const iv = setInterval(function () {
        if (typeof renderBank !== 'function') return;
        if (renderBank._co) { clearInterval(iv); return; }
        const _r = renderBank;
        renderBank = function () {
            const r = _r.apply(this, arguments);
            try { paintBank(); } catch (e) { }
            return r;
        };
        renderBank._co = true;
        clearInterval(iv);
        console.log('[감금실] 공용 통장 칸 연결');
    }, 500);
})();

window.coPut = function () {
    const f = document.getElementById('co-amt');
    const n = Math.floor(parseInt((f && f.value) || '0', 10));
    if (!n || n <= 0) { showCustomAlert('금액을 적어 주세요.'); return; }
    if ((currentUser.points || 0) < n) { showLuxuryAlert(); return; }
    // 통장에 들어간 것을 보고 나서 포인트를 뺀다 — 넣기가 실패하면 돈이 사라진다
    coAdd(currentUser, n, '넣음', function (ok) {
        if (!ok) { showCustomAlert('넣지 못했습니다.\n\n잠시 뒤에 다시 해 주세요.'); return; }
        if (typeof changePoints === 'function') changePoints(-n);
        else currentUser.points -= n;
        if (f) f.value = '';
        showCustomAlert(n.toLocaleString() + ' P 를 공용 통장에 넣었습니다.');
    });
};
window.coTake = function () {
    const f = document.getElementById('co-amt');
    const n = Math.floor(parseInt((f && f.value) || '0', 10));
    if (!n || n <= 0) { showCustomAlert('금액을 적어 주세요.'); return; }
    if (coBal < n) { showCustomAlert('공용 통장에 그만큼 없습니다.'); return; }
    const r = coRef(currentUser);
    if (!r) return;
    r.transaction(function (cur) {
        cur = cur || { bal: 0, log: [] };
        if ((cur.bal || 0) < n) return;                  // 그 사이 누가 뺐다
        cur.bal -= n;
        const log = Array.isArray(cur.log) ? cur.log : [];
        log.unshift({ t: now(), a: -n, w: '뺌', by: currentUser.name });
        while (log.length > 30) log.pop();
        cur.log = log;
        return cur;
    }, function (err, ok) {
        if (err || !ok) { showCustomAlert('빼지 못했습니다.\n\n잔액이 모자랍니다.'); return; }
        if (typeof changePoints === 'function') changePoints(n);
        else currentUser.points += n;
        if (f) f.value = '';
        showCustomAlert(n.toLocaleString() + ' P 를 뺐습니다.');
    }, false);
};

// ==========================================
// 감금실 칸 — 사택 화면 바깥에 한 번만 만든다
// ==========================================
function cageBox() {
    const host = document.getElementById('house-main');
    if (!host || !currentUser) return null;
    let el = document.getElementById('cage-box');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'cage-box';
    el.style.cssText = 'border:1px solid #6a2a2a; border-radius:8px; padding:13px; margin-top:13px;'
        + ' background:linear-gradient(145deg,#1a0e0e,#120a0a); font-size:11px; color:#ddd; line-height:1.7;'
        + ' display:none;';
    host.insertBefore(el, host.firstChild);      // 방 칸 왼쪽(위)에 둔다
    return el;
}

function paintCage() {
    const el = cageBox();
    if (!el) return;
    if (!hasS(currentUser)) { el.style.display = 'none'; return; }

    const me = currentUser;
    const m = mate(me);
    const myCage = caged(me);                       // 내가 갇혔나
    const gear = me.cageGear || {};
    let body;

    if (myCage) {
        const who = (db.users[myCage.by] || {}).name || '룸메이트';
        const left = Math.max(0, myCage.until - now());
        const use = me.cageUse && now() < (me.cageUse.until || 0) ? me.cageUse : null;
        body = '<div style="color:#ff8a8a; font-weight:bold;">문이 잠겨 있습니다.</div>'
            + '<div style="color:#aaa; margin-top:5px;">' + who + ' 사원이 열어 주어야 나갑니다.</div>'
            + (use ? '<div style="color:#ffb7cd; margin-top:5px;">'
                + (GEAR[use.k] ? GEAR[use.k].n : '') + ' 가 돌고 있습니다 · '
                + Math.ceil(Math.max(0, use.until - now()) / 60000) + '분 남음</div>' : '')
            + '<div style="color:#777; font-size:10px; margin-top:7px;">늦어도 '
            + Math.ceil(left / HOUR) + '시간 뒤에는 저절로 열립니다.</div>';
    } else if (!m) {
        body = '<div style="color:#888;">동거인이 없습니다.</div>';
    } else {
        const his = caged(m);
        const mine = his && his.by === me.code;
        const use = (m.cageUse && now() < (m.cageUse.until || 0)) ? m.cageUse : null;
        body = '<div style="color:#aaa;">동거인 <b style="color:#fff;">' + m.name + '</b></div>';
        if (his && !mine) {
            body += '<div style="color:#ff8a8a; margin-top:5px;">이미 다른 사람이 가둬 두었습니다.</div>';
        } else if (mine) {
            body += '<div style="color:#ffb7cd; margin-top:5px;">가둬 두었습니다 · '
                + Math.ceil(Math.max(0, his.until - now()) / 60000) + '분 남음</div>'
                + (use ? '<div style="color:#aaa; margin-top:3px;">'
                    + (GEAR[use.k] ? GEAR[use.k].n : '') + ' 가동 중 · '
                    + Math.ceil(Math.max(0, use.until - now()) / 60000) + '분</div>' : '')
                + '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:9px;">'
                + Object.keys(GEAR).map(function (k) {
                    if (!gear[k]) return '';
                    const on = use && use.k === k;
                    return '<button class="game-btn" style="flex:1 1 90px; margin:0; padding:8px; font-size:11px;'
                        + (on ? ' opacity:.45;' : '') + '" onclick="cageRun(\'' + k + '\')"'
                        + (on ? ' disabled' : '') + '>' + GEAR[k].n + '</button>';
                }).join('')
                + '<button class="game-btn" style="flex:1 1 90px; margin:0; padding:8px; font-size:11px;'
                + ' background:linear-gradient(145deg,#2a4a2a,#183018) !important; border-color:#4a8a4a !important;"'
                + ' onclick="cageOpen()">열어 준다</button></div>';
        } else {
            body += '<div style="display:flex; gap:6px; margin-top:9px;">'
                + '<button class="game-btn" style="flex:1; margin:0; padding:9px; font-size:11px;"'
                + ' onclick="cageShut()">가둔다</button></div>';
        }
        // 기구 사기
        const buy = Object.keys(GEAR).filter(function (k) { return !gear[k]; });
        if (buy.length) {
            body += '<div style="border-top:1px dashed #5a2a2a; margin-top:11px; padding-top:9px;">'
                + '<div style="font-size:10px; color:#888; margin-bottom:6px;">들여놓기 — 산 사람만 씁니다</div>'
                + buy.map(function (k) {
                    return '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">'
                        + '<div style="min-width:0;"><div style="font-size:11px; color:#ddd;">' + GEAR[k].n + '</div>'
                        + '<div style="font-size:9px; color:#777; line-height:1.5;">' + GEAR[k].d + '</div></div>'
                        + '<button class="game-btn" style="margin:0; padding:7px 11px; font-size:11px; flex-shrink:0;"'
                        + ' onclick="cageBuy(\'' + k + '\')">' + GEAR[k].p.toLocaleString() + ' P</button></div>';
                }).join('') + '</div>';
        }
    }

    const html = '<div style="font-size:11px; color:#ff8a8a; font-weight:bold; margin-bottom:7px;">🔒 감금실</div>' + body;
    if (el.innerHTML !== html) el.innerHTML = html;
    if (el.style.display !== 'block') el.style.display = 'block';
}
setInterval(function () { try { paintCage(); } catch (e) { } }, 2000);
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._cage) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            try { paintCage(); } catch (e) { }
            return r;
        };
        renderHouse._cage = true;
        clearInterval(iv);
        console.log('[감금실] 사택 칸 연결');
    }, 500);
})();

// ==========================================
// 가두기 · 열기 · 사기 · 돌리기
// ==========================================
window.cageShut = function () {
    const me = currentUser, m = mate(me);
    if (!hasS(me)) { showCustomAlert('S등급 호실에만 있습니다.'); return; }
    if (!m) { showCustomAlert('동거인이 없습니다.'); return; }
    if (caged(m)) { showCustomAlert('이미 갇혀 있습니다.'); return; }
    if (caged(me)) { showCustomAlert('본인이 갇혀 있습니다.'); return; }

    m.cage = { by: me.code, at: now(), until: now() + MAX_MS };
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(m, '[감금실] ' + me.name + ' 사원이 문을 잠갔습니다.');
        addHistoryLog(me, '[감금실] ' + m.name + ' 사원을 가뒀습니다.');
    }
    if (typeof updateUserFields === 'function') {
        updateUserFields(m.code, { cage: m.cage, history: m.history, _adminStamp: now() });
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    paintCage();
    showCustomAlert(m.name + ' 사원을 감금실에 넣었습니다.\n\n'
        + '열어 주지 않으면 ' + (MAX_MS / HOUR) + '시간 뒤에 저절로 열립니다.');
};

window.cageOpen = function () {
    const me = currentUser, m = mate(me);
    if (!m) return;
    const c = caged(m);
    if (!c) { showCustomAlert('갇혀 있지 않습니다.'); return; }
    if (c.by !== me.code) { showCustomAlert('가둔 사람만 열 수 있습니다.'); return; }
    freeUser(m, me.name + ' 사원이 문을 열었습니다.');
    showCustomAlert(m.name + ' 사원을 내보냈습니다.');
};

function freeUser(u, why) {
    if (!u) return;
    u.cage = null; u.cageUse = null;

    // ★ 특이사항에 붙은 「[감금실] 기구」 줄을 걷어 낸다.
    //   cageRun 이 붙이기만 하고 떼는 데가 없어서, 풀려난 뒤에도 그 줄이
    //   영영 남아 있었다. 「풀려나도 그대로」로 보이던 까닭이 이것이다.
    if (typeof removeBadgeLine === 'function') {
        try { removeBadgeLine(u, '[감금실]'); } catch (e) { }
    }

    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[감금실] ' + why);

    const mine = currentUser && u.code === currentUser.code;
    const fields = { cage: null, cageUse: null, badge: u.badge || {}, _adminStamp: now() };
    // 남의 기록은 통째로 쓰지 않는다. 내 화면 사본이 비어 있으면 그 사람의
    // 기록이 날아간다. 들고 있는 것이 있을 때만 쓴다.
    if (mine || (Array.isArray(u.history) && u.history.length > 1)) fields.history = u.history;
    if (typeof updateUserFields === 'function') updateUserFields(u.code, fields);

    if (typeof updateUI === 'function') updateUI();
    paintCage();
}

window.cageBuy = function (k) {
    const me = currentUser, g = GEAR[k];
    if (!g) return;
    if (!hasS(me)) { showCustomAlert('S등급 호실에만 있습니다.'); return; }
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    if (!me.cageGear) me.cageGear = {};
    if (me.cageGear[k]) { showCustomAlert('이미 들여놓았습니다.'); return; }
    if ((me.points || 0) < g.p) { showLuxuryAlert(); return; }

    if (typeof changePoints === 'function') changePoints(-g.p);
    else me.points -= g.p;
    me.cageGear[k] = true;
    if (typeof addHistoryLog === 'function') addHistoryLog(me, '[감금실] ' + g.n + ' 들여놓음 (-' + g.p.toLocaleString() + ' P)');
    if (typeof saveFields === 'function') { try { saveFields({ cageGear: 1, history: 1, points: 1 }); } catch (e) { } }
    paintCage();
    showCustomAlert(g.n + ' 을(를) 들여놓았습니다.\n\n' + g.d);
};

window.cageRun = function (k) {
    const me = currentUser, m = mate(me), g = GEAR[k];
    if (!g || !m) return;
    if (!(me.cageGear || {})[k]) { showCustomAlert('들여놓지 않았습니다.'); return; }
    const c = caged(m);
    if (!c || c.by !== me.code) { showCustomAlert('먼저 가둬야 합니다.'); return; }
    if (m.cageUse && now() < (m.cageUse.until || 0)) { showCustomAlert('이미 하나가 돌고 있습니다.'); return; }

    const until = now() + g.ms;
    m.cageUse = { k: k, at: now(), until: until, by: me.code, paid: 0, cut: 0, done: false };
    // 기구가 도는 동안은 문이 안 열린다 — 가둠도 같이 늘린다
    m.cage.until = Math.max(m.cage.until || 0, until);

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(m, '[감금실] ' + g.n + ' 가 돌기 시작했습니다.');
        addHistoryLog(me, '[감금실] ' + m.name + ' 사원에게 ' + g.n + ' 를 걸었습니다.');
    }
    if (typeof appendBadgeNoteToUser === 'function') {
        appendBadgeNoteToUser(m, '[감금실] ' + g.n);
    }
    if (typeof updateUserFields === 'function') {
        updateUserFields(m.code, { cage: m.cage, cageUse: m.cageUse, badge: m.badge,
                                   history: m.history, _adminStamp: now() });
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    paintCage();
    showCustomAlert(g.n + ' 가 돌기 시작했습니다.\n\n' + Math.round(g.ms / HOUR) + '시간');
};

// ==========================================
// 셈하기 — 가둔 쪽의 화면에서만 돈다
// ==========================================
//
// 두 쪽이 같이 세면 두 배로 들어간다. 그래서 가둔 사람만 센다.
// 이미 준 몫은 paid·cut·done 에 적어 두어 두 번 주지 않는다.
function tick() {
    const me = currentUser;
    if (!me) return;
    const m = mate(me);
    if (!m) return;
    const c = m.cage;
    if (!c || c.by !== me.code) return;

    // 셈하기를 먼저 한다. 문 여는 것을 먼저 하면 마지막 토막을 못 받는다
    const u = m.cageUse;
    let changed = false;

    if (u && GEAR[u.k]) {
        const end = Math.min(now(), u.until || 0);
        // 기구가 정해 둔 시간을 넘겨 세지 않는다 (시계가 어긋나도)
        const run = Math.min(GEAR[u.k].ms, Math.max(0, end - (u.at || 0)));

        if (u.k === 'cuff') {
            const blocks = Math.floor(run / CUFF_BLOCK);
            while ((u.paid || 0) < blocks) {
                const amt = CUFF_MIN + Math.floor(Math.random() * (CUFF_MAX - CUFF_MIN + 1));
                coAdd(me, amt, '족갑');
                u.paid = (u.paid || 0) + 1;
                changed = true;
            }
        } else if (u.k === 'milk') {
            if (!u.done && now() >= (u.until || 0)) {
                coAdd(me, MILK_PAY, '착유 머신');
                u.done = true;
                changed = true;
            }
        } else if (u.k === 'fuck') {
            // 묶여 있던 만큼 출산을 앞당긴다 — 이미 당긴 몫(cut)은 빼고 센다
            const add = run - (u.cut || 0);
            const preg = (typeof isPregnant === 'function') ? isPregnant(m)
                       : !!(m.preg && m.preg.sires && m.preg.sires.length);
            if (add > 60000) {
                if (preg && m.preg && m.preg.due) {
                    m.preg.due = Math.max(now(), m.preg.due - add);
                    if (typeof updateUserFields === 'function') {
                        updateUserFields(m.code, { preg: m.preg });
                    }
                }
                u.cut = run;                 // 임신이 아니면 그 시간은 흘러간 것으로 둔다
                changed = true;
            }
        }
    }

    if (changed && typeof updateUserFields === 'function') {
        updateUserFields(m.code, { cageUse: u });
    }

    // 시간이 다 됐으면 연다
    if (now() >= (c.until || 0)) { freeUser(m, '시간이 다 되어 문이 열렸습니다.'); return; }
}
window.cageTick = tick;        // 지금 바로 셈하게 한다 (살펴볼 때)
setTimeout(function () { setInterval(tick, 60000); }, 8000);

// 갇힌 쪽도 시간이 지나면 스스로 나온다 (가둔 쪽이 안 들어올 때)
setInterval(function () {
    const c = currentUser && currentUser.cage;
    if (!c || !c.by) return;

    // 가둔 사람이 더는 동거인이 아니면(짝이 바뀌었거나 퇴사) 열어 줄 사람이
    // 없다. 그대로 두면 영영 갇힌다.
    const keeper = (db.users || {})[c.by];
    const m = mate(currentUser);
    if (!keeper || !m || m.code !== c.by) {
        freeUser(currentUser, '가둔 사원이 없어 문이 열렸습니다.');
        return;
    }

    if (caged(currentUser)) return;        // 아직 시간이 남았다 (뚜껑까지 셈한다)
    freeUser(currentUser, '시간이 다 되어 문이 열렸습니다.');
}, 30000);

// ==========================================
// 확인 · 상담사
// ==========================================
function find(who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    return who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
}
window.cageState = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 감금실 =====', 'color:#ff8a8a; font-size:13px');
    console.log('  호실 등급:', (typeof houseGrade === 'function' ? houseGrade(u) : '?'),
        '· 감금실:', hasS(u) ? '있음' : '없음 (S등급만)');
    const c = caged(u);
    console.log('  갇혔나:', c ? ('O — ' + ((db.users[c.by] || {}).name || c.by) + ' · '
        + Math.ceil((c.until - now()) / 60000) + '분 남음') : '✗');
    const g = u.cageGear || {};
    console.log('  들여놓은 기구:', Object.keys(GEAR).filter(function (k) { return g[k]; })
        .map(function (k) { return GEAR[k].n; }).join(' · ') || '없음');
    const us = u.cageUse;
    if (us && now() < (us.until || 0)) {
        console.log('  돌고 있는 것:', (GEAR[us.k] || {}).n,
            '· 남은', Math.ceil((us.until - now()) / 60000) + '분',
            '· 준 몫', us.paid || 0, us.done ? '· 정산 끝' : '');
    } else console.log('  돌고 있는 것: 없음');
};

window.cageFree = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    freeUser(u, '당국이 문을 열었습니다.');
    // 사본을 거치지 않고 서버에도 바로 지운다 (화면이 어긋나 있어도 확실히)
    if (typeof database !== 'undefined' && database) {
        database.ref('users/' + u.code).update({ cage: null, cageUse: null, _adminStamp: Date.now() });
    }
    console.log('%c✓ ' + u.name + ' 사원을 내보냈습니다.', 'color:#4CAF50');
    console.log('  특이사항의 [감금실] 줄도 걷어 냈습니다.');
};

console.log('[감금실] cageState(사번) · cageFree(사번) · coBank()');

})();
