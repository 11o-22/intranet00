// ==========================================
// ★ 밀실 거래 — 조건부 교환에서 돈이 사라지는 것
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 일어나고 있었나
//
//   조건부 교환을 하면 돈은 빠져나가는데 상대에게 들어가지 않고,
//   물건만 넘어왔습니다. 까닭이 둘이었습니다.
//
//   ① 받은 쪽 화면이 제 돈을 스스로 지웠습니다 (save-merge.js 에서 고쳤습니다)
//
//      소지품은 「늘어난 것·줄어든 것」만 보내므로 남이 준 것이 살아남았지만,
//      돈은 「지금 내 화면의 값」을 통째로 덮어쓰고 있었습니다. 그래서 받은
//      쪽이 그 뒤에 아무거나 한 번 저장하면 들어온 돈이 지워졌습니다.
//      물건은 남고 돈만 사라진 까닭이 이것입니다.
//
//   ② 거래 자체가 「읽어서 → 계산해서 → 덮어쓰기」였습니다 (이 파일에서 고칩니다)
//
//      index.html:8826  양쪽을 once 로 읽고
//      index.html:8917  users/…/points 를 통째로 덮어씁니다
//
//      읽고 쓰는 사이(밀리초가 아니라 왕복 두 번입니다)에 어느 쪽이든
//      돈이 움직이면 그만큼이 지워집니다. 거래 상대가 그 틈에 공용시설을
//      한 번 쓰기만 해도 됩니다.
//
// ■ 어떻게 고치나
//
//   주고받는 네 걸음을 모두 트랜잭션으로 바꿉니다. 값을 덮어쓰지 않고
//   「서버에 있는 값에서 얼마를 빼고 얼마를 더한다」고만 말합니다.
//
//       1. 거래를 잠근다 (트랜잭션 — 두 번 눌러도 한 번만 성사)
//       2. 보낸 쪽에서 제물을 뺀다        ← 모자라면 그만둔다
//       3. 받는 쪽에서 대가를 뺀다        ← 모자라면 2번을 돌려놓고 그만둔다
//       4. 받는 쪽에 제물을 넣는다
//       5. 보낸 쪽에 대가를 넣는다
//
//   빼는 걸음만 실패할 수 있고, 그때는 아직 아무것도 주지 않았으므로
//   돌려놓기가 간단합니다. 넣는 걸음은 실패하지 않습니다.
//
//   그리고 currentUser.points / currentUser.inventory 를 손으로 갈아끼우지
//   않습니다. 원래 코드는 inventory 를 「다른 배열로 바꿔」 끼웠는데,
//   그러면 병합이 들고 있던 기준과 어긋나 물건이 두 개로 불어납니다.
//   서버에 쓰고, 들어오는 것을 그냥 받습니다.
//
// ■ 하나 더 — 제안서에 NaN 이 들어가던 자리
//
//   index.html:8688  요구 포인트를 잘못 적으면 알림만 띄우고 그대로
//   진행했습니다 (return 이 빠져 있습니다). demandValue 가 NaN 이 되어
//   제안서 전송이 통째로 실패합니다. 여기서 막습니다.
//
// ■ 확인
//
//   p2pCheck()   연결됐는지
//   p2pLog()     거래가 걸음마다 어떻게 됐는지

(function p2pFix() {

const INV = 'inventory', PTS = 'points';
const log = [];

function asArr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function note(step, ok, extra) {
    log.push({ 때: new Date().toLocaleTimeString(), 걸음: step, 됐나: ok ? 'O' : '✗', 메모: extra || '' });
    while (log.length > 80) log.shift();
}

// ==========================================
// 걸음 — 모두 트랜잭션. 값을 덮어쓰지 않는다
// ==========================================
function txn(path, fn) {
    return database.ref(path).transaction(fn, null, false)
        .then(function (res) { return !!(res && res.committed); })
        .catch(function (e) { console.error('[밀실] ' + path, e); return false; });
}

function takePts(c, amt) {
    amt = Math.max(0, Math.round(Number(amt) || 0));
    if (!amt) return Promise.resolve(true);
    return txn('users/' + c + '/' + PTS, function (srv) {
        const v = Math.round(Number(srv) || 0);
        if (v < amt) return;                      // 모자라다 — 그만둔다
        return v - amt;
    });
}
function givePts(c, amt) {
    amt = Math.max(0, Math.round(Number(amt) || 0));
    if (!amt) return Promise.resolve(true);
    return txn('users/' + c + '/' + PTS, function (srv) {
        return Math.max(0, Math.round(Number(srv) || 0) + amt);
    });
}
function takeItems(c, name, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    return txn('users/' + c + '/' + INV, function (srv) {
        const cur = asArr(srv);
        let have = 0;
        cur.forEach(function (x) { if (x === name) have++; });
        if (have < qty) return;                   // 모자라다 — 그만둔다
        for (let i = 0; i < qty; i++) {
            const j = cur.indexOf(name);
            if (j >= 0) cur.splice(j, 1);
        }
        return cur;
    });
}
function giveItems(c, name, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    return txn('users/' + c + '/' + INV, function (srv) {
        const cur = asArr(srv);
        for (let i = 0; i < qty; i++) cur.push(name);
        return cur;
    });
}

// 제물·대가를 한 덩어리로 다룬다
function take(side, kind, value, qty) {
    return (kind === 'point') ? takePts(side, value) : takeItems(side, value, qty);
}
function give(side, kind, value, qty) {
    return (kind === 'point') ? givePts(side, value) : giveItems(side, value, qty);
}
function desc(kind, value, qty) {
    return (kind === 'point')
        ? ((Number(value) || 0).toLocaleString() + ' P')
        : (value + ' ' + (qty || 1) + '개');
}

// ==========================================
// 여러 개를 한 번에 — 제물·대가를 묶음으로 다룬다
// ==========================================
//
//   예전 제안서는 한 가지만 담았다 (offerType·offerValue·offerQty).
//   이제 offerList / demandList 에 [{k,v,q}, …] 로 여러 개를 담는다.
//   옛 제안서와 옛 화면이 섞여 있어도 되도록, 목록이 없으면 예전
//   세 칸을 읽어 한 칸짜리 묶음으로 만든다.
function bundle(deal, side) {
    const out = [];
    const list = asArr(deal[side + 'List']);
    if (list.length) {
        list.forEach(function (x) {
            if (!x) return;
            if (x.k === 'point') { if (Number(x.v) > 0) out.push({ k: 'point', v: Number(x.v), q: 1 }); }
            else if (x.v) out.push({ k: 'item', v: String(x.v), q: Math.max(1, parseInt(x.q, 10) || 1) });
        });
        return out;
    }
    const t = deal[side + 'Type'], v = deal[side + 'Value'], q = deal[side + 'Qty'];
    if (t == null || v == null) return out;
    if (t === 'point') { if (Number(v) > 0) out.push({ k: 'point', v: Number(v), q: 1 }); }
    else out.push({ k: 'item', v: String(v), q: Math.max(1, parseInt(q, 10) || 1) });
    return out;
}

// 하나라도 못 빼면 이미 뺀 것을 전부 도로 넣고 그만둔다.
// 빼기만 실패할 수 있고, 그때는 아직 아무것도 건네지 않았다.
async function takeAll(side, bu) {
    const done = [];
    for (let i = 0; i < bu.length; i++) {
        const ok = await take(side, bu[i].k, bu[i].v, bu[i].q);
        note('빼기', ok, side + ' ← ' + desc(bu[i].k, bu[i].v, bu[i].q));
        if (!ok) {
            for (let j = done.length - 1; j >= 0; j--) {
                await give(side, done[j].k, done[j].v, done[j].q);
                note('되돌림', true, side + ' → ' + desc(done[j].k, done[j].v, done[j].q));
            }
            return { ok: false, at: bu[i] };
        }
        done.push(bu[i]);
    }
    return { ok: true };
}
async function giveAll(side, bu) {
    for (let i = 0; i < bu.length; i++) {
        await give(side, bu[i].k, bu[i].v, bu[i].q);
        note('넣기', true, side + ' → ' + desc(bu[i].k, bu[i].v, bu[i].q));
    }
}
function descAll(bu) {
    if (!bu || !bu.length) return '(없음)';
    return bu.map(function (x) { return desc(x.k, x.v, x.q); }).join(' · ');
}
window.p2pBundle = bundle;
window.p2pDescAll = descAll;

// ==========================================
// 수락 — 통째로 다시 쓴다
// ==========================================
function install() {
    if (typeof acceptP2PDeal !== 'function') return false;
    if (acceptP2PDeal._txn) return true;

    acceptP2PDeal = async function (dealId) {
        let settled = false;       // 주고받기가 끝났나 (끝난 뒤에는 되돌리지 않는다)
        if (typeof buyGuard === 'function' && !buyGuard()) return;
        if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
            showCustomAlert('여우 상담실 격리 중에는 거래를 수락할 수 없습니다.'); return;
        }
        if (typeof database === 'undefined' || !database) {
            showCustomAlert('서버에 연결되어 있지 않습니다.'); return;
        }

        let idx = -1, deal = null;
        try {
            // --- 1) 거래를 찾아 잠근다 ---
            const snap = await database.ref('p2pDeals').once('value');
            const raw = snap.val() || [];
            const arr = Array.isArray(raw) ? raw : Object.keys(raw).map(function (k) { return raw[k]; });
            const keys = Array.isArray(raw) ? null : Object.keys(raw);
            const at = arr.findIndex(function (d) { return d && d.id === dealId; });
            if (at < 0) { showCustomAlert('거래를 찾을 수 없습니다.'); return; }
            idx = keys ? keys[at] : at;
            deal = arr[at];

            if (deal.toCode !== currentUser.code) { showCustomAlert('본인 앞으로 온 제안이 아닙니다.'); return; }
            if (deal.status !== 'PENDING') {
                showCustomAlert('이미 처리된 거래입니다.');
                if (typeof renderP2PLists === 'function') renderP2PLists();
                return;
            }

            // 두 번 눌러도 한 번만 — 잠그기도 트랜잭션으로
            const locked = await txn('p2pDeals/' + idx + '/status', function (s) {
                if (s !== 'PENDING') return;             // 남이 먼저 집었다
                return 'PROCESSING';
            });
            note('잠금', locked, '거래 ' + dealId);
            if (!locked) {
                showCustomAlert('이미 처리 중인 거래입니다.');
                if (typeof renderP2PLists === 'function') renderP2PLists();
                return;
            }

            const me = currentUser.code, him = deal.fromCode;
            const trade = (deal.mode === 'trade');
            const oBu = bundle(deal, 'offer');
            const dBu = trade ? bundle(deal, 'demand') : [];

            if (!oBu.length || (trade && !dBu.length)) {
                await database.ref('p2pDeals/' + idx + '/status').set('EXPIRED');
                showCustomAlert('제안서의 내용이 잘못되어 있습니다.\n\n거래를 파기했습니다.');
                if (typeof renderP2PLists === 'function') renderP2PLists();
                return;
            }

            // --- 2) 보낸 쪽에서 제물을 뺀다 (여러 개면 하나라도 모자랄 때 전부 되돌린다) ---
            const got = await takeAll(him, oBu);
            if (!got.ok) {
                await database.ref('p2pDeals/' + idx + '/status').set('EXPIRED');
                showCustomAlert(got.at.k === 'point'
                    ? (deal.fromName + ' 사원의 포인트가 부족하여 거래가 무산되었습니다.')
                    : (deal.fromName + " 사원이 '" + got.at.v + "' 을(를) 더 이상 "
                       + got.at.q + '개 가지고 있지 않습니다.'));
                if (typeof renderP2PLists === 'function') renderP2PLists();
                return;
            }

            // --- 3) 받는 쪽에서 대가를 뺀다 ---
            if (trade) {
                const paid = await takeAll(me, dBu);
                if (!paid.ok) {
                    // 아직 아무것도 주지 않았다 — 2번을 그대로 돌려놓는다
                    await giveAll(him, oBu);
                    await database.ref('p2pDeals/' + idx + '/status').set('PENDING');
                    if (paid.at.k === 'point') {
                        if (typeof showLuxuryAlert === 'function') showLuxuryAlert();
                        else showCustomAlert('포인트가 부족합니다.');
                    } else {
                        showCustomAlert("요구하신 물품 '" + paid.at.v + "' " + paid.at.q + '개가 부족합니다.');
                    }
                    if (typeof renderP2PLists === 'function') renderP2PLists();
                    return;
                }
            }

            // --- 4·5) 넣는다. 여기부터는 실패하지 않는다 ---
            await giveAll(me, oBu);
            if (trade) await giveAll(him, dBu);

            await database.ref('p2pDeals/' + idx + '/status').set('COMPLETED');
            settled = true;        // 여기부터는 무슨 일이 나도 되돌리면 안 된다

            // --- 기록 ---
            // 기록과 화면은 거래와 별개다. 여기서 터져도 물건은 이미 옮겨졌으므로
            // 바깥 catch 로 떨어뜨리지 않는다. (떨어뜨리면 status 가 PENDING 으로
            // 돌아가 같은 제안서를 또 수락할 수 있게 된다 — 두 번 옮겨진다)
            try {
            // currentUser 를 손으로 갈아끼우지 않는다 — 병합이 서버에서 받아 온다
            const line = trade
                ? ('[밀실 성사] ' + deal.fromName + ' 사원과 교환 — 받음 ' + descAll(oBu)
                   + ' · 건넴 ' + descAll(dBu))
                : ('[밀실 성사] ' + deal.fromName + ' 사원에게서 ' + descAll(oBu) + ' 받음');
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(currentUser, line);
                await database.ref('users/' + me + '/history').set(currentUser.history);
                const sender = (db.users || {})[him];
                if (sender) {
                    addHistoryLog(sender, trade
                        ? ('[밀실 성사] ' + currentUser.name + ' 사원과 교환 — 건넴 '
                           + descAll(oBu) + ' · 받음 ' + descAll(dBu))
                        : ('[밀실 성사] ' + currentUser.name + ' 사원에게 ' + descAll(oBu) + ' 건넴'));
                    await database.ref('users/' + him + '/history').set(sender.history);
                }
            }
            await database.ref('users/' + me + '/_adminStamp').set(Date.now());
            await database.ref('users/' + him + '/_adminStamp').set(Date.now());

            if (typeof updateUI === 'function') updateUI();
            if (typeof renderP2PLists === 'function') renderP2PLists();
            showCustomAlert('거래가 성공적으로 체결되었습니다.\n\n' + line.replace('[밀실 성사] ', ''));
            setTimeout(function () { if (typeof updateUI === 'function') updateUI(); }, 1200);
            } catch (e2) {
                console.warn('[밀실] 거래는 끝났고 기록·화면만 실패했습니다:', e2 && e2.message);
                note('기록', false, e2 && e2.message);
                try { showCustomAlert('거래가 체결되었습니다.'); } catch (x) { }
                try { if (typeof renderP2PLists === 'function') renderP2PLists(); } catch (x) { }
            }

        } catch (e) {
            console.error('[밀실] 거래 실패:', e);
            note('오류', false, e && e.message);
            if (idx >= 0 && !settled) {
                try { await database.ref('p2pDeals/' + idx + '/status').set('PENDING'); } catch (x) { }
            }
            showCustomAlert(settled
                ? '거래는 체결되었으나 뒷정리 중 오류가 났습니다.\n\n물품은 이미 옮겨졌습니다.'
                : '거래 처리 중 오류가 발생했습니다.\n\n거래는 되돌렸습니다.');
            if (typeof renderP2PLists === 'function') renderP2PLists();
        }
    };
    acceptP2PDeal._txn = true;
    console.log('[밀실] 수락을 트랜잭션으로 바꿨습니다 — 돈을 덮어쓰지 않습니다');
    return true;
}

// ==========================================
// 제안서 — 요구 포인트가 잘못되면 보내지 않는다
// ==========================================
function guardSend() {
    if (typeof sendP2PDeal !== 'function') return false;
    if (sendP2PDeal._txn) return true;
    const _s = sendP2PDeal;
    sendP2PDeal = function () {
        try {
            const mode = (document.getElementById('p2p-deal-mode') || {}).value;
            const dt = (document.getElementById('p2p-demand-type') || {}).value;
            if (mode === 'trade' && dt === 'point') {
                const el = document.getElementById('p2p-demand-points');
                const n = parseInt((el && el.value) || '', 10);
                if (isNaN(n) || n <= 0) {
                    showCustomAlert('요구할 포인트를 올바르게 입력해주세요.');
                    return;                     // 원래 코드에 빠져 있던 자리
                }
            }
            if (mode === 'trade' && dt !== 'point') {
                const el = document.getElementById('p2p-demand-item');
                if (!el || !el.value) { showCustomAlert('요구할 물품을 선택해주세요.'); return; }
            }
        } catch (e) { }
        return _s.apply(this, arguments);
    };
    sendP2PDeal._txn = true;
    console.log('[밀실] 제안서 입력 막음 연결');
    return true;
}

const iv = setInterval(function () {
    const a = install(), b = guardSend();
    if (a && b) clearInterval(iv);
}, 500);

// ==========================================
// 확인
// ==========================================
window.p2pCheck = function () {
    console.log('%c===== 밀실 거래 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  수락 교체:', (typeof acceptP2PDeal === 'function' && acceptP2PDeal._txn) ? 'O' : '✗');
    console.log('  제안 막음:', (typeof sendP2PDeal === 'function' && sendP2PDeal._txn) ? 'O' : '✗');
    console.log('  포인트 병합:', (typeof window.ptsState === 'function') ? 'O (ptsState() 로 봅니다)' : '✗');
    console.log('  주고받기를 모두 트랜잭션으로 합니다. 값을 덮어쓰지 않습니다.');
};
window.p2pLog = function () {
    if (!log.length) { console.log('[밀실] 아직 거래 기록이 없습니다.'); return; }
    console.table(log.slice(-30));
};

console.log('[밀실] p2pCheck() · p2pLog()');

})();
