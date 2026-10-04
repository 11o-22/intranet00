// ==========================================
// ★ 버터 나이프가 사라지는 것
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// 사라질 수 있는 길이 네 군데 있었습니다. 셋은 여기서 막고,
// 하나는 save-merge.js 를 한 줄 고쳐야 합니다(아래 ■ 넷째).
//
// ■ 첫째 — 장터에 올린 글이 72시간 뒤에 통째로 없어진다  ← 가장 의심스럽습니다
//
//   판매 글을 올리면 그 즉시 소지품에서 빠집니다. (dark.js:13448)
//
//       for (let i = 0; i < qty; i++) removeItemFromInventory(currentUser, item, 1);
//       updates[`users/${currentUser.code}/inventory`] = currentUser.inventory;
//
//   물건은 이제 market/<글번호> 안에만 있습니다. 되돌릴 길은 「내린다」뿐인데,
//   목록을 거를 때 72시간을 먼저 자릅니다. (dark.js:13367)
//
//       let list = ...filter(p => p.state === 'OPEN' && now - p.at < MARKET_TTL);
//       if (marketTab === 'mine') list = list.filter(p => p.seller === currentUser.code);
//
//   「내 글」 칸에서도 안 보이게 됩니다. 72시간이 지나면 내릴 수가 없습니다.
//   그리고 묵은 글을 치워 주는 자리가 어디에도 없습니다.
//   MARKET_TTL 은 거르는 세 군데(13367 · 13382 · 13440)에만 쓰입니다.
//
//   버터 나이프가 딱 걸립니다. 9999 P 라 쉽게 안 팔리고, 4시간 뒤에는
//   스스로 소지품으로 돌아오니 늘 올릴 수 있는 상태입니다.
//
//   → 내 묵은 판매 글은 소지품으로 되돌리고 글을 닫습니다.
//     사는 글은 포인트를 미리 빼지 않으니(dark.js:13450) 되돌릴 것이 없습니다.
//
// ■ 둘째 — 만료 처리를 해 놓고 저장을 안 한다
//
//   getPollutionMultiplier 는 이름은 「가져오기」인데 실제로는 고칩니다.
//   (index.html:4777~4783)
//
//       user.equippedWeapons.splice(idx, 1);
//       user.inventory.push("버터 나이프");
//       user.butterKnifeExpireTime = 0;
//
//   그런데 부르는 쪽이 저장을 다 안 합니다.
//
//       checkPassivePollution  saveSelfFull()      → 괜찮습니다
//       addPollution           saveFields({pollution:1})  ← 소지품·장착을 안 씁니다
//       applyPollutionToUser   아무것도 안 씁니다          ← 남의 것까지 고칩니다
//
//   addPollution 으로 만료되면, 서버에는 「장착한 채 기한이 지난」 상태가 남고
//   내 화면에만 소지품으로 와 있습니다. 그 틈에 장착만 쓰는 코드가 돌면
//   (equip-lock.js:80 · newitems2.js:1262 · index.html:6121) 양쪽에서 없어집니다.
//
//   applyPollutionToUser 는 더 나쁩니다. 남의 객체를 내 화면에서 고쳐 놓는데,
//   그 뒤 그 사원의 장착을 내 화면 값으로 써 버리는 코드가 있습니다.
//
//   → 내 것이면 바뀐 즉시 제대로 저장합니다.
//     남의 것이면 아예 손대지 않게 되돌립니다. 그 사원이 접속하면 본인 화면에서 합니다.
//
// ■ 셋째 — 봉인 표시가 붙은 옛 자료
//
//   newitems2.js:882 의 SEAL = '✗ ' 이 이름 앞에 붙던 때가 있었습니다.
//   getEquipBaseName(index.html:1560)은 '🔮 ' 와 ' (' 만 떼고 '✗ ' 는 못 뗍니다.
//   그래서 '✗ 버터 나이프' 는 영영 만료되지 않고, 휘두를 수도 없고,
//   빼면 그 이름 그대로 소지품에 들어가 쓸 수 없는 것이 됩니다.
//
//   → knifeTrace() 로 찾고, knifeUnseal() 로 이름을 되돌립니다.
//
// ■ 넷째 — save-merge.js 가 기준을 잘못 갈아 끼운다  ※ 직접 고쳐 주세요
//
//   save-merge.js:175 는 「내가 손댄 항목은 서버 값을 받지 않는다」고 비켜섭니다.
//   그런데 190 번 줄이 조건 없이 기준을 서버 값으로 바꿔 버립니다.
//
//       if (mineTouched) return;          // 175 — 서버의 K 를 안 받는다
//       ...
//       base = clone(srv) || {};          // 190 — 그런데 기준은 K 가 들어간 것으로
//
//   그 다음 소지품 병합(mergeInv:71~72)이 기준과 내 것을 견주면
//
//       del = msDiff(기준, 내것) = [K]    → K 를 서버에서 지웁니다
//
//   즉 내가 아직 안 올린 소지품 변화를 들고 있는 동안 남이 내 소지품에
//   무언가를 넣으면, 그것이 다음 저장에서 지워집니다.
//   장터 체결(dark.js:13581) · 상담사 지급(index.html:10246) ·
//   타인 아이템 사용(index.html:6123) 이 모두 소지품을 통째로 씁니다.
//
//   버터 나이프만의 일이 아니라 아무 물건이나 먹습니다.
//   closure 안의 base 는 밖에서 손댈 수 없어 여기서는 못 막습니다.
//
//   ── save-merge.js 170 번 줄 ──
//       let took = 0;
//   ↓ 이렇게 한 줄 더합니다
//       let took = 0;
//       const kept = {};                                  // 내가 손댄 항목의 기준을 지킨다
//
//   ── save-merge.js 175 번 줄 ──
//           if (mineTouched) return;                        // 내가 바꾼 것은 내가 쓴다
//   ↓
//           if (mineTouched) { kept[k] = clone(base[k]); return; }   // 기준도 지킨다
//
//   ── save-merge.js 190 번 줄 ──
//       base = clone(srv) || {};
//   ↓
//       base = clone(srv) || {};
//       Object.keys(kept).forEach(function (k) { base[k] = kept[k]; });
//
// ■ 다섯째 — 이건 오류가 아닐 수 있습니다
//
//   C등급 구역에서 탈출에 실패하면 소지품 하나가 무작위로 없어집니다.
//   (index.html:4458~4468)
//
//       const pool = (currentUser.inventory || []).filter(it => {
//           const c = ITEM_CATALOG[it];
//           return c && !NO_SELL_ITEMS.includes(it);
//       });
//
//   NO_SELL_ITEMS 는 여우구슬 · 사직서 · 두 번째 자리 · 금고 · 💍 커플링 뿐이라
//   버터 나이프도 뽑힙니다. 「장착품 제외」라고 적혀 있지만, 나이프는 4시간 뒤
//   소지품으로 돌아오니 하루의 대부분을 뽑힐 수 있는 자리에 있습니다.
//
//   C등급은 C-119 와 C-176 입니다. 설계한 벌칙이라 손대지 않았습니다.
//   빼고 싶으시면 index.html:1822 의 NO_SELL_ITEMS 에 이름을 넣으시면 됩니다.

(function knifeLost() {

const KNIFE = '버터 나이프';
const SEAL = '✗ ';
const TTL = 3 * 24 * 60 * 60 * 1000;          // dark.js:13310 과 같은 값
const EXPIRE_KEYS = ['butterKnifeExpireTime', 'jakduExpireTime', 'silverRingExpireTime'];

function baseOf(w) {
    let s = String(w || '');
    if (s.indexOf(SEAL) === 0) s = s.slice(SEAL.length);
    if (s.indexOf('🔮 ') === 0) s = s.slice(2);
    if (s.indexOf(' (') > 0) s = s.split(' (')[0];
    return s.trim();
}

// ==========================================
// 첫째 — 내 묵은 판매 글을 소지품으로 되돌린다
// ==========================================
//
// 남의 글은 건드리지 않습니다. 각자 자기 글만 거둬 가므로
// 권한도 필요 없고 두 사람이 같은 글을 되돌릴 일도 없습니다.
let sweeping = false;

function sweepMarket(loud) {
    if (sweeping || !currentUser) return Promise.resolve(0);
    if (typeof database === 'undefined' || !database) return Promise.resolve(0);
    sweeping = true;

    return database.ref('market').once('value').then(function (s) {
        const all = s.val() || {}, now = Date.now(), mine = [];
        Object.keys(all).forEach(function (id) {
            const p = all[id];
            if (!p || p.state !== 'OPEN' || p.type !== 'sell') return;
            if (p.seller !== currentUser.code) return;
            if (now - (p.at || 0) < TTL) return;
            mine.push({ id: id, item: p.item, qty: Math.max(1, p.qty || 1), at: p.at });
        });
        if (!mine.length) {
            sweeping = false;
            if (loud) console.log('  되돌릴 묵은 판매 글이 없습니다.');
            return 0;
        }

        if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
        const up = {}, said = [];
        mine.forEach(function (m) {
            for (let i = 0; i < m.qty; i++) currentUser.inventory.push(m.item);
            up['market/' + m.id + '/state'] = 'EXPIRED';
            up['market/' + m.id + '/expiredAt'] = now;
            said.push(m.item + (m.qty > 1 ? ' ×' + m.qty : ''));
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(currentUser, '[장터] 기한이 지난 판매 글을 내려 ' + m.item
                    + (m.qty > 1 ? ' ' + m.qty + '개' : '') + '을(를) 돌려받았습니다.');
            }
        });

        return database.ref('/').update(up).then(function () {
            if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 });
            if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
            console.log('%c[장터] 기한이 지난 판매 글 ' + mine.length + '건을 되돌렸습니다 — '
                + said.join(', '), 'color:#4CAF50');
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('장터에 올린 글의 기한이 지나 물품이 돌아왔습니다.\n\n' + said.join('\n'));
            }
            sweeping = false;
            return mine.length;
        });
    }).catch(function (e) {
        sweeping = false;
        console.error('[장터] 되돌리기 실패:', e);
        return 0;
    });
}

setTimeout(function () { sweepMarket(false); }, 6000);
setInterval(function () { sweepMarket(false); }, 30 * 60 * 1000);

// ==========================================
// 둘째 — 만료 처리를 제대로 저장한다 / 남의 것은 손대지 않는다
// ==========================================
function stateOf(u) {
    try {
        return JSON.stringify([
            u.equippedWeapons || [],
            u.inventory || [],
            EXPIRE_KEYS.map(function (k) { return u[k] || 0; })
        ]);
    } catch (e) { return ''; }
}
function restore(u, snap) {
    try {
        const v = JSON.parse(snap);
        if (Array.isArray(u.equippedWeapons)) { u.equippedWeapons.length = 0; v[0].forEach(function (x) { u.equippedWeapons.push(x); }); }
        else u.equippedWeapons = v[0];
        if (Array.isArray(u.inventory)) { u.inventory.length = 0; v[1].forEach(function (x) { u.inventory.push(x); }); }
        else u.inventory = v[1];
        EXPIRE_KEYS.forEach(function (k, i) { u[k] = v[2][i]; });
    } catch (e) { }
}

let saveSoon = null;
function laterSave() {
    if (saveSoon) return;
    saveSoon = setTimeout(function () {
        saveSoon = null;
        if (typeof saveSelfFull === 'function') {
            try { saveSelfFull(); } catch (e) { console.error('[회수] 저장 실패:', e); }
        }
        if (typeof updateUI === 'function') try { updateUI(); } catch (e) { }
    }, 0);
}

(function guard() {
    let inside = false;
    const iv = setInterval(function () {
        if (typeof getPollutionMultiplier !== 'function') return;
        if (getPollutionMultiplier._keepGear) { clearInterval(iv); return; }

        const _g = getPollutionMultiplier;
        getPollutionMultiplier = function (user) {
            if (inside || !user) return _g.apply(this, arguments);
            inside = true;
            const before = stateOf(user);
            let r;
            try { r = _g.apply(this, arguments); }
            finally { inside = false; }

            if (before && stateOf(user) !== before) {
                if (currentUser && user.code === currentUser.code) {
                    laterSave();                         // 내 것 — 장착·소지품·기한을 한꺼번에 쓴다
                } else {
                    restore(user, before);               // 남의 것 — 없던 일로 한다
                }
            }
            return r;
        };
        getPollutionMultiplier._keepGear = true;
        clearInterval(iv);
        console.log('[회수] 만료 처리 저장 연결');
    }, 400);
})();

// ==========================================
// 확인 — 어느 길로 사라졌는지 가린다
// ==========================================
//
// knifeTrace()         나
// knifeTrace('4892')   그 사원 (사번 · 이름 · 코드 아무거나)
window.knifeTrace = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다: ' + who); return; }

    console.log('%c===== ' + u.name + ' · ' + KNIFE + ' =====', 'color:#4fc3f7; font-size:13px');

    const eq = u.equippedWeapons || [], inv = u.inventory || [];
    const eqHit = eq.filter(function (w) { return baseOf(w) === KNIFE; });
    const invHit = inv.filter(function (x) { return baseOf(x) === KNIFE; });
    console.log('  장착:', eqHit.length ? eqHit.join(' · ') : '없음');
    console.log('  소지품:', invHit.length ? invHit.join(' · ') + ' (' + invHit.length + '개)' : '없음');
    console.log('  butterKnifeExpireTime:', u.butterKnifeExpireTime
        ? new Date(u.butterKnifeExpireTime).toLocaleString()
            + (Date.now() >= u.butterKnifeExpireTime ? '  ← 기한이 지났습니다' : '')
        : (u.butterKnifeExpireTime === 0 ? '0' : '없음'));

    // 셋째 — 봉인 표시
    const sealed = eq.filter(function (w) { return String(w).indexOf(SEAL) === 0; })
        .concat(inv.filter(function (x) { return String(x).indexOf(SEAL) === 0; }));
    if (sealed.length) {
        console.warn('  ✗ 봉인 표시가 붙은 것: ' + sealed.join(' · ')
            + '  → knifeUnseal(\'' + (u.no || u.code) + '\')');
    }

    // 둘째 — 장착한 채 기한이 0 으로 멈춘 상태
    if (eqHit.length && !u.butterKnifeExpireTime) {
        console.warn('  ✗ 장착한 채 기한이 0 입니다. 영영 안 돌아옵니다.');
        console.warn('    (빼앗기로 기한만 가져간 경우거나, 상담사 상태 초기화 index.html:10390)');
        console.warn('    → knifeKick(\'' + (u.no || u.code) + '\') 로 소지품으로 돌립니다.');
    }

    // 다섯째 — C등급 벌칙에 뽑힐 수 있는가
    if (invHit.length && typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(KNIFE) < 0) {
        console.log('  · C등급(C-119 · C-176) 탈출 실패 때 뽑힐 수 있는 상태입니다.');
    }

    // 기록에서 사라진 흔적을 찾는다
    const log = (u.history || []).filter(function (h) {
        const t = typeof h === 'string' ? h : (h && (h.text || h.msg || JSON.stringify(h)));
        return t && t.indexOf(KNIFE) >= 0;
    });
    console.log('  — 기록에 남은 ' + KNIFE + ' 줄 ' + log.length + '개 —');
    log.slice(-12).forEach(function (h) {
        console.log('   ', typeof h === 'string' ? h : (h.text || h.msg || h));
    });

    // 첫째 — 장터에 묶여 있는가
    if (typeof database === 'undefined' || !database) return;
    database.ref('market').once('value').then(function (s) {
        const posts = s.val() || {}, now = Date.now(), rows = [];
        Object.keys(posts).forEach(function (id) {
            const p = posts[id];
            if (!p || p.seller !== u.code) return;
            rows.push({
                물품: p.item, 수량: p.qty || 1, 값: p.price,
                낸때: new Date(p.at).toLocaleString(),
                상태: p.state,
                묶임: (p.state === 'OPEN' && p.type === 'sell' && now - p.at >= TTL) ? '✗ 기한 지남' : ''
            });
        });
        console.log('  — 장터에 낸 글 —');
        if (rows.length) console.table(rows); else console.log('    없음');
        const stuck = rows.filter(function (r) { return r.묶임; }).length;
        if (stuck) {
            console.warn('  ✗ 기한이 지나 묶인 판매 글 ' + stuck + '건이 있습니다.');
            console.log('    본인 화면에서 접속하면 저절로 돌아옵니다. 지금 당장이면 marketSweep()');
        }
    });
};

// 지금 당장 내 묵은 글을 되돌린다
window.marketSweep = function () {
    console.log('[장터] 묵은 판매 글을 찾습니다…');
    sweepMarket(true);
};

// 전 사원의 묵은 판매 글을 본다 — 상담사용
window.marketStuck = function () {
    if (typeof database === 'undefined' || !database) return;
    database.ref('market').once('value').then(function (s) {
        const posts = s.val() || {}, now = Date.now(), rows = [];
        Object.keys(posts).forEach(function (id) {
            const p = posts[id];
            if (!p || p.state !== 'OPEN' || p.type !== 'sell') return;
            if (now - (p.at || 0) < TTL) return;
            rows.push({
                사원: p.sellerName || p.seller, 물품: p.item, 수량: p.qty || 1,
                낸때: new Date(p.at).toLocaleString(),
                묵은일: Math.floor((now - p.at) / 86400000) + '일'
            });
        });
        console.log('%c===== 기한이 지나 묶인 판매 글 =====', 'color:#ff8a65; font-size:13px');
        if (rows.length) {
            console.table(rows);
            console.log('  각 사원이 접속하면 저절로 돌아옵니다.');
            console.log('  지금 돌려주려면 marketReturnAll() (상담사)');
        } else console.log('  없습니다.');
    });
};

// 전 사원에게 지금 돌려준다 — 상담사용
window.marketReturnAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) return;
    Promise.all([database.ref('market').once('value'), database.ref('users').once('value')])
    .then(function (r) {
        const posts = r[0].val() || {}, users = r[1].val() || {}, now = Date.now();
        const add = {}, up = {}, rows = [];
        Object.keys(posts).forEach(function (id) {
            const p = posts[id];
            if (!p || p.state !== 'OPEN' || p.type !== 'sell') return;
            if (now - (p.at || 0) < TTL) return;
            if (!users[p.seller]) return;
            if (!add[p.seller]) add[p.seller] = [];
            for (let i = 0; i < Math.max(1, p.qty || 1); i++) add[p.seller].push(p.item);
            up['market/' + id + '/state'] = 'EXPIRED';
            up['market/' + id + '/expiredAt'] = now;
            rows.push({ 사원: p.sellerName || p.seller, 물품: p.item, 수량: p.qty || 1 });
        });
        if (!rows.length) { console.log('돌려줄 글이 없습니다.'); return; }
        Object.keys(add).forEach(function (c) {
            const inv = Array.isArray(users[c].inventory) ? users[c].inventory.slice()
                      : (users[c].inventory ? Object.values(users[c].inventory) : []);
            up['users/' + c + '/inventory'] = inv.concat(add[c]);
            up['users/' + c + '/_adminStamp'] = now;
        });
        return database.ref('/').update(up).then(function () {
            console.table(rows);
            console.log('%c✓ ' + rows.length + '건을 ' + Object.keys(add).length + '명에게 돌려줬습니다.', 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

// 봉인 표시를 떼어 낸다
window.knifeUnseal = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    const eq = (u.equippedWeapons || []).map(function (w) {
        return String(w).indexOf(SEAL) === 0 ? String(w).slice(SEAL.length) : w;
    });
    const inv = (u.inventory || []).map(function (x) {
        return String(x).indexOf(SEAL) === 0 ? String(x).slice(SEAL.length) : x;
    });
    const n = eq.filter(function (w, i) { return w !== (u.equippedWeapons || [])[i]; }).length
            + inv.filter(function (x, i) { return x !== (u.inventory || [])[i]; }).length;
    if (!n) { console.log(u.name + ' 사원에게 봉인 표시가 없습니다.'); return; }

    u.equippedWeapons = eq; u.inventory = inv;
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { equippedWeapons: eq, inventory: inv });
    }
    console.log('%c✓ ' + u.name + ' 사원의 봉인 표시 ' + n + '개를 뗐습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

// 장착한 채 기한이 멈춘 것을 소지품으로 돌린다
window.knifeKick = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    const eq = (u.equippedWeapons || []).slice();
    const i = eq.findIndex(function (w) { return baseOf(w) === KNIFE; });
    if (i < 0) { console.log(u.name + ' 사원은 ' + KNIFE + ' 를 차고 있지 않습니다.'); return; }
    eq.splice(i, 1);
    const inv = (u.inventory || []).slice();
    inv.push(KNIFE);

    u.equippedWeapons = eq; u.inventory = inv; u.butterKnifeExpireTime = 0;
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { equippedWeapons: eq, inventory: inv, butterKnifeExpireTime: 0 });
    }
    console.log('%c✓ ' + u.name + ' 사원의 ' + KNIFE + ' 를 소지품으로 돌렸습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

console.log('[나이프] knifeTrace(사번) · marketSweep() · marketStuck() · marketReturnAll() · knifeUnseal() · knifeKick()');

})();