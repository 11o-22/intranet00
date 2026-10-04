// ==========================================
// ★ 사택 룸메이트 — 주간 재배정 · 찌름권 · 확정권
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 언제 바뀌나
//
//   일요일에서 월요일로 넘어가는 00:00 에 전원 다시 짝지어진다.
//   서버에 정해진 시각에 도는 것이 없으므로, 월요일이 된 뒤 처음 들어온
//   사람의 화면에서 한 번만 돈다. roomAssign/week 에 거래(transaction)를
//   걸어 두어 여럿이 동시에 들어와도 한 번만 돌아간다.
//
// ■ 찌름권 · 확정권
//
//   유쾌 판매소에 토요일과 일요일에만 선다. 각 2,000 P, 하루 한 장씩.
//   안 쓴 것은 소지품에 남아 다음 주에도 쓸 수 있다.
//
//   찌름권  원하는 사원의 사번을 적는다. 그 주의 찌름으로 기록된다.
//   확정권  찌름이 성공한 뒤 같은 사번을 한 번 더 적으면 배정에 반영된다.
//
// ■ 짝이 정해지는 차례
//
//   1. 서로 찌른 쌍      — 확정권 없이 바로 확정. 먼저 찌른 쌍부터.
//   2. 한쪽만 찌른 경우  — 확정권까지 쓴 사람만. 먼저 찌른 사람이 가져간다.
//   3. 나머지            — 무작위
//   인원이 홀수면 한 명은 단독 호실이 된다.
//
//   「찌름 성공」은 이렇다.
//     · 상대도 나를 찔렀다                        → 성공
//     · 그 사람을 찌른 사람들 중 내가 가장 빠르다  → 성공
//     · 다만 그 사람이 다른 사람과 서로 찔렀다면   → 실패
//
// ■ 등급은 건드리지 않는다 · 보관함은 따라온다
//
//   등급
//     houseGrade() 가 둘 중 높은 쪽을 그때그때 고른다. (dark.js:8043)
//     그래서 옮겨 적지 않는다. house-own.js 가 지키려는 「명의 등급」도
//     그대로 남는다. adminAssignRoom 은 hb.grade = ha.grade 로 베껴
//     쓰는데(dark.js:8273) 그건 하지 않는다.
//
//   보관함
//     공용 보관함 주인은 두 사번 중 앞서는 쪽이다. (dark.js:8346)
//     짝만 바꾸고 짐을 그냥 두면, 새 짝의 사번이 내 앞이 되는 순간
//     내 짐이 들어 있는 상자가 안 보이게 된다. 그래서 짝이 정해질 때
//     두 사람의 짐을 새 주인 쪽으로 모아 둔다. 둘 다 꺼낼 수 있다.
//
//     다만 지난주에 내가 공용함 주인이 아니었다면 내 짐은 이미 옛 짝의
//     상자에 섞여 있다. 누가 넣은 것인지 적어 두는 자리가 없어서
//     가려낼 수 없다. 그 짐은 옛 짝을 따라간다.
//     → 주말 사택 화면에 「월요일 전에 공용함을 비우세요」를 띄워 둔다.

(function roommate() {

const RM_POKE = '룸메 찌름권';
const RM_LOCK = '룸메 확정권';
const RM_PRICE = 2000;
const ADMIN = 'kario0987';

// ==========================================
// 주 번호 — 월요일 00:00 이 경계
// ==========================================
function weekKey(d) {
    const t = d ? new Date(d) : new Date();
    const day = (t.getDay() + 6) % 7;            // 월요일 = 0
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - day);                // 그 주 월요일로
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate());
}
function isWeekend() {
    const d = new Date().getDay();
    return d === 0 || d === 6;                   // 일 · 토
}
function daysLeft() {
    return 7 - ((new Date().getDay() + 6) % 7);  // 월 7 … 토 2 · 일 1
}

// ==========================================
// 짝 정하기 — 여기만 보면 규칙이 다 보인다
// ==========================================
function pokeOK(me, pokes) {
    const p = pokes[me];
    if (!p || !p.to || p.to === me) return false;
    const b = p.to;
    const pb = pokes[b];

    if (pb && pb.to === me) return true;                     // 서로 찔렀다

    if (pb && pb.to && pb.to !== me) {                       // 상대가 딴 데를 찔렀는데
        const pc = pokes[pb.to];
        if (pc && pc.to === b) return false;                 // 그쪽과 서로 찔렀다면 가망 없다
    }
    // 그 사람을 찌른 사람들 중 내가 가장 빠른가
    const rivals = Object.keys(pokes).filter(function (x) { return pokes[x] && pokes[x].to === b; });
    rivals.sort(function (x, y) { return (pokes[x].at || 0) - (pokes[y].at || 0); });
    return rivals[0] === me;
}

function resolvePairs(codes, pokes, confirms, shuffleFn) {
    pokes = pokes || {}; confirms = confirms || {};
    const live = {};
    codes.forEach(function (c) { live[c] = 1; });

    const taken = {}, pairs = [];
    function put(a, b) { taken[a] = 1; taken[b] = 1; pairs.push([a, b]); }

    // 1. 서로 찌른 쌍 — 확정권이 없어도 확정
    const mut = [];
    codes.forEach(function (a) {
        const pa = pokes[a];
        if (!pa || !pa.to || pa.to === a || !live[pa.to]) return;
        const b = pa.to, pb = pokes[b];
        if (pb && pb.to === a && a < b) {                    // a < b 로 한 번만 담는다
            mut.push({ a: a, b: b, at: Math.min(pa.at || 0, pb.at || 0) });
        }
    });
    mut.sort(function (x, y) { return x.at - y.at; });
    mut.forEach(function (m) { if (!taken[m.a] && !taken[m.b]) put(m.a, m.b); });

    // 2. 한쪽만 찌르고 확정권까지 쓴 사람 — 먼저 찌른 순
    const one = [];
    codes.forEach(function (a) {
        if (taken[a]) return;
        const c = confirms[a], p = pokes[a];
        if (!c || !p || !c.to || c.to !== p.to) return;       // 찌른 상대와 확정한 상대가 같아야 한다
        if (!live[c.to] || c.to === a) return;
        one.push({ a: a, b: c.to, at: p.at || 0 });
    });
    one.sort(function (x, y) { return x.at - y.at; });
    one.forEach(function (o) { if (!taken[o.a] && !taken[o.b]) put(o.a, o.b); });

    // 3. 나머지는 무작위
    const rest = codes.filter(function (c) { return !taken[c]; });
    (shuffleFn || function (arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    })(rest);
    for (let i = 0; i + 1 < rest.length; i += 2) put(rest[i], rest[i + 1]);

    return { pairs: pairs, alone: (rest.length % 2) ? rest[rest.length - 1] : null };
}

window._roomRules = { weekKey: weekKey, pokeOK: pokeOK, resolvePairs: resolvePairs };

// ==========================================
// 사번 적는 칸 — 모바일에서 prompt() 가 막히는 곳이 있어 직접 만든다
// ==========================================
function roomAsk(title, hint, cb) {
    const old = document.getElementById('room-ask-overlay');
    if (old) old.remove();

    const ov = document.createElement('div');
    ov.id = 'room-ask-overlay';
    ov.style.cssText = 'position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.78);'
        + ' display:flex; align-items:center; justify-content:center; padding:22px;';
    ov.innerHTML = '<div style="background:#16121c; border:1px solid #c2185b; border-radius:9px;'
        + ' padding:19px 17px; width:100%; max-width:310px; box-shadow:0 7px 28px rgba(0,0,0,0.6);">'
        + '<div style="font-size:12px; color:#ff8fb1; font-weight:bold; margin-bottom:9px;">' + title + '</div>'
        + '<div style="font-size:10px; color:#999; line-height:1.7; margin-bottom:12px;">' + hint + '</div>'
        + '<input id="room-ask-input" type="text" inputmode="latin" autocomplete="off" placeholder="사번"'
        + ' style="width:100%; box-sizing:border-box; background:#0c0a10; border:1px solid #4a3a55;'
        + ' border-radius:5px; padding:11px 10px; color:#fff; font-size:13px; letter-spacing:1px;'
        + ' text-align:center; outline:none;">'
        + '<div style="display:flex; gap:7px; margin-top:13px;">'
        + '<button class="game-btn" id="room-ask-no" style="flex:1; margin:0; padding:10px 0; font-size:11px;">취소</button>'
        + '<button class="game-btn" id="room-ask-ok" style="flex:1; margin:0; padding:10px 0; font-size:11px;">적는다</button>'
        + '</div></div>';
    document.body.appendChild(ov);

    const inp = ov.querySelector('#room-ask-input');
    let answered = false;
    function done(v) {
        if (answered) return;
        answered = true;
        ov.remove();
        cb(v);
    }
    ov.querySelector('#room-ask-no').onclick = function () { done(null); };
    ov.querySelector('#room-ask-ok').onclick = function () { done(inp.value); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); done(inp.value); } };
    ov.onclick = function (e) { if (e.target === ov) done(null); };
    setTimeout(function () { try { inp.focus(); } catch (e) { } }, 60);
}

// ==========================================
// 아이템 등록
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        ITEM_CATALOG[RM_POKE] = {
            price: RM_PRICE, usable: true, targetable: false, effect: 'rm_poke',
            desc: '같이 살고 싶은 사원의 사번을 적는다. 이번 주 찌름으로 남는다. 주말에만 판다.'
        };
        ITEM_CATALOG[RM_LOCK] = {
            price: RM_PRICE, usable: true, targetable: false, effect: 'rm_lock',
            desc: '찌름이 성공했을 때 같은 사번을 한 번 더 적는다. 월요일 배정에 반영된다. 주말에만 판다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined') {
            if (NO_SELL_ITEMS.indexOf(RM_POKE) < 0) NO_SELL_ITEMS.push(RM_POKE);
            if (NO_SELL_ITEMS.indexOf(RM_LOCK) < 0) NO_SELL_ITEMS.push(RM_LOCK);
        }
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 상점 — 토 · 일에만, 하루 한 장씩
// ==========================================
function boughtToday(id) {
    if (!currentUser) return 0;
    const k = (typeof getShopCycleKey === 'function') ? getShopCycleKey() : '';
    const r = (currentUser.purchaseRecord || {})[k] || {};
    return r[id] || 0;
}

window.buyRoomTicket = function (which) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    if (!currentUser) return;
    if (!isWeekend()) { showCustomAlert('토요일과 일요일에만 팝니다.'); return; }
    if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
        showCustomAlert('격리 중에는 상점을 이용할 수 없습니다.'); return;
    }
    const nm = (which === 'lock') ? RM_LOCK : RM_POKE;
    const id = (which === 'lock') ? 'rm_lock' : 'rm_poke';
    if (boughtToday(id) >= 1) { showCustomAlert(nm + '은(는) 하루 한 장까지 살 수 있습니다.'); return; }
    if (currentUser.points < RM_PRICE) { showLuxuryAlert(); return; }

    const k = getShopCycleKey();
    if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
    if (!currentUser.purchaseRecord[k]) currentUser.purchaseRecord[k] = {};
    currentUser.purchaseRecord[k][id] = 1;
    currentUser.points -= RM_PRICE;
    if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
    currentUser.inventory.push(nm);
    if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[상점 구매] ' + nm + ' (-' + RM_PRICE + ' P)');
    if (typeof saveFields === 'function') saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderRegularShop === 'function') renderRegularShop();
};

(function pinShop() {
    const iv = setInterval(function () {
        if (typeof renderRegularShop !== 'function') return;
        if (renderRegularShop._roomPin) { clearInterval(iv); return; }
        const _r = renderRegularShop;
        renderRegularShop = function () {
            const r = _r.apply(this, arguments);
            try {
                const box = document.getElementById('regular-shop-items-container');
                if (!box || !currentUser || !isWeekend()) return r;
                if (document.getElementById('room-ticket-row')) return r;
                const p = boughtToday('rm_poke') ? 0 : 1;
                const l = boughtToday('rm_lock') ? 0 : 1;
                const btn = function (which, nm, left) {
                    return '<div style="display:flex; justify-content:space-between; align-items:center; gap:9px;'
                        + ' background:rgba(0,0,0,0.25); border-radius:5px; padding:8px 10px; margin-top:6px;">'
                        + '<div style="flex:1; min-width:0;"><div style="font-size:11px; color:#fff;">' + nm + '</div>'
                        + '<div style="font-size:9px; color:#888;">금일 잔여 ' + left + ' / 1장</div></div>'
                        + '<button class="game-btn" style="margin:0; padding:7px 12px; font-size:11px; flex-shrink:0;"'
                        + ' onclick="buyRoomTicket(\'' + which + '\')"' + (left ? '' : ' disabled') + '>'
                        + (left ? RM_PRICE.toLocaleString() + ' P' : '품절') + '</button></div>';
                };
                box.insertAdjacentHTML('afterbegin',
                    '<div id="room-ticket-row" style="border:1px solid #c2185b; border-radius:7px; padding:12px;'
                    + ' margin-bottom:12px; background:rgba(194,24,91,0.05);">'
                    + '<div style="font-size:10px; color:#ff8fb1; letter-spacing:1px; margin-bottom:5px;">[주말 한정]</div>'
                    + '<div style="font-size:10px; color:#888; line-height:1.6;">'
                    + '월요일 0시에 호실이 다시 배정됩니다. 같이 살고 싶은 사원이 있으면 찌르세요.</div>'
                    + btn('poke', RM_POKE, p) + btn('lock', RM_LOCK, l) + '</div>');
            } catch (e) { }
            return r;
        };
        renderRegularShop._roomPin = true;
        clearInterval(iv);
        console.log('[룸메] 주말 상점 연결');
    }, 400);
})();

// ==========================================
// 티켓 쓰기
// ==========================================
function findByNo(no) {
    const k = String(no || '').trim();
    if (!k || typeof db === 'undefined' || !db.users) return null;
    const c = Object.keys(db.users).find(function (x) {
        const u = db.users[x];
        return u && (String(u.no) === k || x === k);
    });
    return c ? db.users[c] : null;
}
function nameOf(c) {
    const u = (typeof db !== 'undefined' && db.users) ? db.users[c] : null;
    return (u && u.name) || c;
}

function pokeRef() { return database.ref('roomPoke/' + weekKey()); }
function lockRef() { return database.ref('roomConfirm/' + weekKey()); }

// cb(true) 면 티켓을 쓴다
function usePoke(cb) {
    if (typeof database === 'undefined' || !database) { showCustomAlert('서버에 닿지 못했습니다.'); cb(false); return; }
    roomAsk('룸메 찌름권', '같이 살고 싶은 사원의 사번을 적으세요.<br>'
        + '상대도 당신을 찌르면 그대로 확정됩니다.<br>'
        + '한쪽만 찌른 경우에는 확정권을 한 장 더 써야 합니다.', function (no) {
        if (no === null) { cb(false); return; }
        const t = findByNo(no);
        if (!t) { showCustomAlert('그 사번을 찾지 못했습니다.'); cb(false); return; }
        if (t.code === currentUser.code) { showCustomAlert('자기 사번은 적을 수 없습니다.'); cb(false); return; }

        pokeRef().child(currentUser.code).set({ to: t.code, at: Date.now() })
            .then(function () {
                if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[사택] ' + t.name + ' 사원을 찔렀습니다.');
                if (typeof saveFields === 'function') saveFields({ history: 1 });
                showCustomAlert(t.name + ' 사원을 찔렀습니다.\n\n결과는 사택 화면에서 볼 수 있습니다.');
                setTimeout(function () { if (typeof renderHouse === 'function') renderHouse(); }, 300);
                cb(true);
            })
            .catch(function () { showCustomAlert('적지 못했습니다. 다시 시도해 주세요.'); cb(false); });
    });
}

function useLock(cb) {
    if (typeof database === 'undefined' || !database) { showCustomAlert('서버에 닿지 못했습니다.'); cb(false); return; }
    pokeRef().once('value').then(function (s) {
        const pokes = s.val() || {};
        const mine = pokes[currentUser.code];
        if (!mine) { showCustomAlert('먼저 찌름권으로 사번을 적어야 합니다.'); cb(false); return; }
        if (!pokeOK(currentUser.code, pokes)) {
            showCustomAlert('찌름이 아직 성공하지 않았습니다.\n\n'
                + nameOf(mine.to) + ' 사원은 다른 사원이 먼저 찔렀거나,\n'
                + '이미 다른 사원과 서로 찌른 상태입니다.\n\n'
                + '확정권은 그대로 남습니다.');
            cb(false); return;
        }
        roomAsk('룸메 확정권', '찌른 사원의 사번을 한 번 더 적으세요.<br>'
            + '월요일 0시 배정에 그대로 반영됩니다.', function (no) {
            if (no === null) { cb(false); return; }
            const t = findByNo(no);
            if (!t || t.code !== mine.to) {
                showCustomAlert('찌른 상대와 다릅니다.\n\n찌른 상대는 ' + nameOf(mine.to) + ' 사원입니다.');
                cb(false); return;
            }
            lockRef().child(currentUser.code).set({ to: t.code, at: Date.now() })
                .then(function () {
                    if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[사택] ' + t.name + ' 사원과 같이 살기로 확정했습니다.');
                    if (typeof saveFields === 'function') saveFields({ history: 1 });
                    showCustomAlert(t.name + ' 사원과 같이 살기로 확정했습니다.\n\n월요일 0시 배정에 반영됩니다.');
                    setTimeout(function () { if (typeof renderHouse === 'function') renderHouse(); }, 300);
                    cb(true);
                })
                .catch(function () { showCustomAlert('적지 못했습니다. 다시 시도해 주세요.'); cb(false); });
        });
    }).catch(function () { showCustomAlert('확인하지 못했습니다.'); cb(false); });
}

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._room) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const e = (ITEM_CATALOG[itemName] || {}).effect;
            if (e !== 'rm_poke' && e !== 'rm_lock') return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            const done = function (ok) {
                if (!ok) return;                     // 실패하면 티켓은 남는다
                if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
                if (typeof saveFields === 'function') saveFields({ inventory: 1 });
                if (typeof updateUI === 'function') updateUI();
            };
            if (e === 'rm_poke') usePoke(done);
            else useLock(done);
        };
        useInventoryItem._room = true;
        clearInterval(iv);
        console.log('[룸메] 찌름권·확정권 연결');
    }, 400);
})();

// ==========================================
// 월요일 0시 — 다시 배정
// ==========================================
function doAssign(wk) {
    return database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const codes = Object.keys(all).filter(function (c) {
            const u = all[c];
            return u && u.name && c !== ADMIN;
        });
        if (codes.length < 2) { console.log('[룸메] 사원이 둘 미만이라 건너뜁니다.'); return; }
        const inPool = {};
        codes.forEach(function (c) { inPool[c] = 1; });

        return Promise.all([
            database.ref('roomPoke/' + wk).once('value'),
            database.ref('roomConfirm/' + wk).once('value')
        ]).then(function (r) {
            const pokes = r[0].val() || {}, confirms = r[1].val() || {};
            const out = resolvePairs(codes, pokes, confirms);

            const up = {};
            codes.forEach(function (c) { up['users/' + c + '/house/roomie'] = null; });

            out.pairs.forEach(function (p) {
                const a = p[0], b = p[1];
                up['users/' + a + '/house/roomie'] = b;
                up['users/' + b + '/house/roomie'] = a;

                // 공용 보관함은 사번이 앞서는 쪽이 주인이다 — 둘의 짐을 거기로 모은다
                const o = ([a, b].sort())[0], n = (o === a) ? b : a;
                const so = ((all[o] || {}).house || {}).storage || [];
                const sn = ((all[n] || {}).house || {}).storage || [];
                if (sn.length) {
                    up['users/' + o + '/house/storage'] = so.concat(sn);
                    up['users/' + n + '/house/storage'] = [];
                }
            });

            // 배정에서 빠진 사람(상담사 등)이 안쪽을 가리키고 있으면 끊는다
            Object.keys(all).forEach(function (c) {
                if (inPool[c]) return;
                const rm = ((all[c] || {}).house || {}).roomie;
                if (rm && inPool[rm]) up['users/' + c + '/house/roomie'] = null;
            });

            up['roomAssign/at'] = Date.now();
            up['roomAssign/by'] = currentUser ? currentUser.code : '?';
            up['roomAssign/pairs'] = out.pairs.map(function (p) { return p.join('_'); });
            up['roomAssign/alone'] = out.alone || null;

            return database.ref('/').update(up).then(function () {
                console.log('%c[룸메] ' + wk + ' 배정 완료 — ' + out.pairs.length + '쌍'
                    + (out.alone ? ' · 단독 1명' : ''), 'color:#4CAF50');
                if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
            }).catch(function (e) {
                console.error('[룸메] 배정을 쓰지 못했습니다:', e);
                // 다른 사람(또는 상담사)이 다시 시도할 수 있게 표시를 되돌린다
                database.ref('roomAssign/week').remove().catch(function () { });
            });
        });
    }).catch(function (e) { console.error('[룸메] 배정 실패:', e); });
}

(function weekly() {
    let tried = '';
    function tick() {
        if (typeof database === 'undefined' || !database || !currentUser) return;
        const wk = weekKey();
        if (tried === wk) return;

        const ref = database.ref('roomAssign/week');
        ref.once('value').then(function (s) {
            if (s.val() === wk) { tried = wk; return; }      // 이미 누가 돌렸다
            ref.transaction(function (cur) {
                if (cur === wk) return;                       // 동시에 들어왔다 — 양보
                return wk;
            }, function (err, committed) {
                tried = wk;
                if (err || !committed) return;
                doAssign(wk);
            });
        }).catch(function () { });
    }
    setTimeout(tick, 4000);
    setInterval(tick, 5 * 60 * 1000);                        // 자정을 넘겨도 잡는다
})();

// ==========================================
// 내 자리는 따로 받아 온다
//   applyServerMe 는 _adminStamp 가 바뀔 때만 돌고, save-merge.js 가
//   깔려 있으면 아예 안 돈다. (index.html:1374)
//   그래서 내 house 는 이 두 줄로 직접 맞춘다.
// ==========================================
(function watchMine() {
    let bound = '';
    function paint() {
        if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
        if (typeof renderHouse === 'function' && document.getElementById('house-main-body')) {
            try { renderHouse(); } catch (e) { }
        }
    }
    setInterval(function () {
        if (!currentUser || typeof database === 'undefined' || !database) return;
        if (bound === currentUser.code) return;
        bound = currentUser.code;
        const base = 'users/' + currentUser.code + '/house/';

        database.ref(base + 'roomie').on('value', function (s) {
            if (!currentUser) return;
            const v = s.val() || null;
            const h = (typeof getHouse === 'function') ? getHouse(currentUser)
                : (currentUser.house = currentUser.house || {});
            if (h.roomie === v) return;
            h.roomie = v;
            console.log('[룸메] 호실이 바뀌었습니다 —', v ? nameOf(v) + ' 사원' : '단독');
            paint();
        });

        database.ref(base + 'storage').on('value', function (s) {
            if (!currentUser) return;
            const v = s.val() || [];
            const h = (typeof getHouse === 'function') ? getHouse(currentUser)
                : (currentUser.house = currentUser.house || {});
            const before = JSON.stringify(h.storage || []);
            if (before === JSON.stringify(v)) return;
            h.storage = Array.isArray(v) ? v : [];
            if (typeof renderHouseStorage === 'function'
                && document.getElementById('house-storage-body')) {
                try { renderHouseStorage(); } catch (e) { }
            }
        });
    }, 1000);
})();

// ==========================================
// 사택 화면에 지금 상태를 한 칸
// ==========================================
(function panel() {
    function put() {
        const box = document.getElementById('house-main-body');
        if (!box || !currentUser || typeof database === 'undefined' || !database) return;
        if (box.innerHTML.length < 50) return;
        if (document.getElementById('room-poke-box')) return;

        const head = '<div style="font-size:11px; color:#ff8fb1; font-weight:bold; margin-bottom:7px;">🛏 다음 호실</div>';
        const el = document.createElement('div');
        el.id = 'room-poke-box';
        el.style.cssText = 'border:1px solid #c2185b; border-radius:6px; padding:12px; margin-top:13px;'
            + ' background:rgba(194,24,91,0.05); font-size:11px; color:#ddd; line-height:1.7;';
        el.innerHTML = head + '<div style="color:#888;">불러오는 중…</div>';
        box.appendChild(el);

        Promise.all([pokeRef().once('value'), lockRef().once('value')]).then(function (r) {
            const pokes = r[0].val() || {}, locks = r[1].val() || {};
            const me = currentUser.code, mine = pokes[me], lock = locks[me];

            let body;
            if (!mine) {
                body = '<div style="color:#888;">아직 아무도 찌르지 않았습니다.<br>'
                     + '주말에 유쾌 판매소에서 찌름권을 살 수 있습니다.</div>';
            } else {
                const mutual = pokes[mine.to] && pokes[mine.to].to === me;
                body = '<div>찌른 상대 <b style="color:#fff;">' + nameOf(mine.to) + '</b></div>';
                if (mutual) {
                    body += '<div style="color:#81c784; margin-top:4px;">서로 찔렀습니다. 확정권 없이 확정됩니다.</div>';
                } else if (lock && lock.to === mine.to) {
                    body += '<div style="color:#81c784; margin-top:4px;">확정권을 썼습니다. 월요일 배정에 반영됩니다.</div>';
                } else if (pokeOK(me, pokes)) {
                    body += '<div style="color:#ffd700; margin-top:4px;">찌름 성공. 확정권을 쓰면 확정됩니다.</div>';
                } else {
                    body += '<div style="color:#ff8a65; margin-top:4px;">다른 사원이 먼저 찔렀거나, 상대가 다른 사원과 서로 찔렀습니다.</div>';
                }
            }

            const d = daysLeft();
            body += '<div style="color:#777; font-size:10px; margin-top:7px;">다음 배정까지 '
                 + (d === 1 ? '오늘 자정' : d + '일') + ' · 이번 주 찌른 사원 '
                 + Object.keys(pokes).length + '명</div>';

            if (isWeekend() && (typeof getRoomie === 'function') && getRoomie(currentUser)) {
                body += '<div style="color:#ffb74d; font-size:10px; margin-top:8px; border-top:1px dashed #5a3a4a; padding-top:7px;">'
                     + '월요일 전에 공용 보관함을 비워 두세요. 짝이 바뀌면 보관함은 지금 들고 있는 쪽을 따라갑니다.</div>';
            }
            el.innerHTML = head + body;
        }).catch(function () { el.remove(); });
    }
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._roomBox) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () { const r = _r.apply(this, arguments); setTimeout(put, 160); return r; };
        renderHouse._roomBox = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인 · 손으로 돌리기
// ==========================================
window.roomState = function () {
    if (typeof database === 'undefined' || !database) return;
    const wk = weekKey();
    console.log('%c===== 룸메 ' + wk + ' 주 =====', 'color:#ff8fb1; font-size:13px');
    Promise.all([
        database.ref('roomPoke/' + wk).once('value'),
        database.ref('roomConfirm/' + wk).once('value'),
        database.ref('roomAssign').once('value')
    ]).then(function (r) {
        const pokes = r[0].val() || {}, locks = r[1].val() || {}, asg = r[2].val() || {};
        const rows = Object.keys(pokes).map(function (c) {
            const mutual = pokes[pokes[c].to] && pokes[pokes[c].to].to === c;
            return {
                찌른사원: nameOf(c), 상대: nameOf(pokes[c].to),
                때: new Date(pokes[c].at).toLocaleString(),
                서로: mutual ? 'O' : '-',
                성공: pokeOK(c, pokes) ? 'O' : '✗',
                확정권: (locks[c] && locks[c].to === pokes[c].to) ? 'O' : '-'
            };
        });
        if (rows.length) console.table(rows); else console.log('  찌른 사원이 없습니다.');
        console.log('  마지막 배정:', asg.week || '없음',
            asg.at ? '(' + new Date(asg.at).toLocaleString() + ')' : '');
        const d = daysLeft();
        console.log('  다음 배정까지:', d === 1 ? '오늘 자정' : d + '일');
        console.log('  지금 이대로 배정하면 — roomPreview()');
    });
};

window.roomPreview = function () {
    if (typeof database === 'undefined' || !database) return;
    const wk = weekKey();
    Promise.all([
        database.ref('roomPoke/' + wk).once('value'),
        database.ref('roomConfirm/' + wk).once('value')
    ]).then(function (r) {
        const codes = Object.keys(db.users || {}).filter(function (c) {
            return db.users[c] && db.users[c].name && c !== ADMIN;
        });
        const out = resolvePairs(codes, r[0].val() || {}, r[1].val() || {});
        console.log('%c===== 이대로 배정하면 =====', 'color:#ff8fb1; font-size:13px');
        console.table(out.pairs.map(function (p, i) {
            return { 호실: i + 1, 가: nameOf(p[0]), 나: nameOf(p[1]) };
        }));
        if (out.alone) console.log('  단독 호실:', nameOf(out.alone));
        console.log('  ※ 무작위 부분은 실제로 돌릴 때 달라집니다.');
    });
};

// 상담사가 손으로 돌린다
window.roomForce = function () {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    const wk = weekKey();
    if (!confirm(wk + ' 주 배정을 지금 돌립니까?\n전원 호실이 다시 정해집니다.')) return;
    database.ref('roomAssign/week').set(wk).then(function () { return doAssign(wk); });
};

// 공용 보관함을 손으로 옮긴다 — 짐이 엉켰을 때
window.roomStorageMove = function (fromNo, toNo) {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const a = findByNo(fromNo), b = findByNo(toNo);
    if (!a || !b) { console.warn('사번을 찾지 못했습니다.'); return; }
    const sa = ((a.house || {}).storage) || [], sb = ((b.house || {}).storage) || [];
    if (!sa.length) { console.log(a.name + ' 사원의 보관함이 비어 있습니다.'); return; }
    const up = {};
    up['users/' + b.code + '/house/storage'] = sb.concat(sa);
    up['users/' + a.code + '/house/storage'] = [];
    database.ref('/').update(up).then(function () {
        console.log('%c✓ ' + a.name + ' → ' + b.name + ' · ' + sa.length + '개 옮겼습니다.', 'color:#4CAF50');
    }).catch(function (e) { console.error(e); });
};

console.log('[룸메] roomState() · roomPreview() · roomForce() · roomStorageMove(from, to)');

})();