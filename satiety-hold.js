// ==========================================
// ★ 포만도 유지 — 최음제 · 빨간 리본 · 세뇌 만년필
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 포만도가 깎이는 자리는 셋입니다
//
//     index.html:4980   두 시간마다 5씩      (checkPassivePollution)
//     index.html:9223   공용시설 이용 -3     (useFacility)
//     dark.js:12466     어둠 탐사 -10~-28    (applyDarkSatiety, 등급별)
//
//   「유지된다」를 글자 그대로 읽어 셋 다 막습니다.
//   자연 감소만 막고 싶으시면 아래 HOLD_FACILITY · HOLD_DARK 를 false 로.
//
//   막는 방법은 셋 다 같습니다. 원래 함수를 그대로 돌리고, 돌기 전의
//   포만도를 되돌려 놓습니다. 다만 lastSatietyTime 은 되돌리지 않습니다.
//   그걸 되돌리면 유지가 끝나는 순간 밀린 시간이 한꺼번에 깎여
//   (최대 12단계 = 60) 오히려 더 크게 떨어집니다.
//
// ■ 세 가지가 같은 자리를 봅니다
//
//   satHeld(user) 하나가 참이면 포만도가 안 내려갑니다.
//
//     1. user.satHoldUntil 이 아직 안 지났다        — 최음제
//     2. user.ribbons 에 안 끝난 줄이 있다          — 빨간 리본
//     3. 세뇌 만년필을 차고 있고 오염도가 50 이상   — 세뇌 만년필
//
// ■ 빨간 리본
//
//   원래 양쪽에 이름표만 붙이고 끝이었습니다 (index.html:7235).
//   거기에 한 시간짜리 줄을 하나 답니다.
//
//     · 한 줄에 한 시간, 양쪽 다 유지
//     · 한 사람이 동시에 다섯 줄까지
//     · 한 시간이 지나면 이름표가 빠지고, 채운 사람 소지품으로 돌아갑니다
//
//   정리는 채운 사람 쪽에서 양쪽을 같이 합니다. 채운 사람이 접속해 있지
//   않으면 각자 자기 이름표만 먼저 걷고, 나중에 채운 사람이 들어올 때
//   나머지가 맞춰집니다. 어느 쪽이든 영영 남지는 않습니다.
//
// ■ 세뇌 만년필
//
//   오염도 50% 증가는 이미 들어가 있고(index.html:7290) 저장도 됩니다
//   (index.html:6125 가 대상의 pollution 을 같이 씁니다).
//   여기서는 「차고 있고 오염도가 50 이상인 동안」만 더합니다.
//   오염도를 50 밑으로 낮추면 유지가 풀립니다.

(function satietyHold() {

const HOLD_FACILITY = true;      // 공용시설 -3 도 막을까
const HOLD_DARK     = true;      // 어둠 탐사 감소도 막을까

const DRUG = '최음제';
const RIBBON = '빨간 리본';
const PEN = '세뇌 만년필';
const DRUG_MS = 2 * 3600 * 1000;
const RIBBON_MS = 1 * 3600 * 1000;
const RIBBON_MAX = 5;
const PERM_MARK = ' · 영구';     // 영구로 채운 리본의 이름표 끝에 붙는다
const PEN_POLL = 50;

function now() { return Date.now(); }
function base(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}
function wears(u, nm) {
    return (u && Array.isArray(u.equippedWeapons))
        && u.equippedWeapons.some(function (w) { return base(w) === nm; });
}
function ribbonsOf(u) {
    if (!u) return [];
    if (!Array.isArray(u.ribbons)) u.ribbons = [];
    return u.ribbons;
}
function liveRibbons(u) {
    const t = now();
    return ribbonsOf(u).filter(function (r) { return r && r.u > t; });
}

// 영구로 채운 리본 — 이름표 끝에 「· 영구」가 붙어 있다
// 포만도 유지도 없고 저절로 돌아오지도 않는다. 손으로 떼야 한다.
function permRibbons(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return [];
    return u.equippedWeapons.filter(function (w) {
        return base(w) === RIBBON && String(w).indexOf(PERM_MARK) >= 0;
    });
}

// ==========================================
// 유지 중인가 — 여기 하나만 보면 됩니다
// ==========================================
function satHeld(u) {
    if (!u) return false;
    if ((u.satHoldUntil || 0) > now()) return true;               // 최음제
    if (liveRibbons(u).length) return true;                       // 빨간 리본
    if (wears(u, PEN) && (u.pollution || 0) >= PEN_POLL) return true;  // 세뇌 만년필
    return false;
}
function heldWhy(u) {
    const out = [];
    if ((u.satHoldUntil || 0) > now()) {
        out.push(DRUG + ' ' + Math.ceil(((u.satHoldUntil - now()) / 60000)) + '분');
    }
    const lr = liveRibbons(u);
    if (lr.length) {
        const last = Math.max.apply(null, lr.map(function (r) { return r.u; }));
        out.push(RIBBON + ' ' + lr.length + '줄 · ' + Math.ceil((last - now()) / 60000) + '분');
    }
    if (wears(u, PEN) && (u.pollution || 0) >= PEN_POLL) out.push(PEN + ' (오염 ' + u.pollution + ')');
    return out;
}
window.satHeld = satHeld;

// ==========================================
// 깎이는 세 자리를 막는다
// ==========================================
function guard(name, on) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;          // 최상위 function 선언이라 window 로 잡힌다
        if (f._satHold) { clearInterval(iv); return; }

        const wrapped = function (a) {
            if (!on) return f.apply(this, arguments);
            // 첫 인자가 사원이면 그 사람, 아니면 나 (useFacility 는 금액, applyDarkSatiety 는 구역코드)
            const u = (a && typeof a === 'object' && a.code) ? a : currentUser;
            if (!u || !satHeld(u)) return f.apply(this, arguments);
            const keep = u.satiety;
            const r = f.apply(this, arguments);
            if (u.satiety != null && keep != null && u.satiety < keep) {
                u.satiety = keep;              // 깎인 만큼 되돌린다 (lastSatietyTime 은 그대로)
            }
            return r;
        };
        wrapped._satHold = true;
        window[name] = wrapped;
        clearInterval(iv);
        console.log('[포만] ' + name + ' 막음' + (on ? '' : ' (꺼짐)'));
    }, 400);
}
guard('checkPassivePollution', true);
guard('useFacility', HOLD_FACILITY);
guard('applyDarkSatiety', HOLD_DARK);

// ==========================================
// 최음제
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        ITEM_CATALOG[DRUG] = {
            price: 4000, usable: true, targetable: false, effect: 'sat_hold',
            desc: '마시면 두 시간 동안 포만감이 내려가지 않는다. 남은 시간에 이어 붙는다.'
        };
        if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(DRUG) < 0) {
            ALIEN_ITEMS_POOL.push(DRUG);
        }
        clearInterval(iv);
    }, 400);
})();

(function useDrug() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._satDrug) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'sat_hold') return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            const from = Math.max(now(), currentUser.satHoldUntil || 0);
            currentUser.satHoldUntil = from + DRUG_MS;
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
            if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[아이템 사용] ' + DRUG + ' — 포만감 유지');
            if (typeof saveFields === 'function') saveFields({ satHoldUntil: 1, inventory: 1, history: 1 });
            if (typeof updateUI === 'function') updateUI();
            showCustomAlert('속이 뜨거워집니다.\n\n' + Math.round((currentUser.satHoldUntil - now()) / 60000)
                + '분 동안 포만감이 내려가지 않습니다.');
        };
        useInventoryItem._satDrug = true;
        clearInterval(iv);
        console.log('[포만] ' + DRUG + ' 연결');
    }, 400);
})();

// ==========================================
// 빨간 리본 — 한 시간, 다섯 줄까지
// ==========================================
// ==========================================
// 빨간 리본 — 채울 때 두 가지 중에 고른다
// ==========================================
//
//   ① 영구          효과 없음. 저절로 안 돌아온다. 손으로 떼야 한다.
//   ② 한 시간 동결   두 사람의 포만도가 한 시간 유지된다. 끝나면 소지품으로.
//
// applyItemEffect 는 참·거짓을 바로 돌려줘야 하는데 고르는 창은 기다려야 한다.
// 그래서 처음 부름에는 창만 띄우고 거짓을 돌려준다. (부른 쪽은 아무것도 안 한다)
// 고르고 나면 고른 값을 들고 다시 부른다. 리본을 소지품에서 빼는 것도 그때 한다.
// sticker-fix.js 가 투명 물약에 쓰는 방식과 같다.

let picking = null;        // 고르는 중 — { target, item, isOthers }
let chosen = null;         // 고른 값 — 'perm' 또는 'hold'

function ribbonAsk(targetName, cb) {
    const old = document.getElementById('ribbon-pick');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'ribbon-pick';
    wrap.style.cssText = 'position:fixed; inset:0; z-index:100000; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.72); padding:20px;';
    wrap.innerHTML =
        '<div style="background:linear-gradient(145deg,#1d1016,#120a0e); border:1px solid #c2185b;'
        + ' border-radius:10px; padding:18px; max-width:340px; width:100%; box-shadow:0 6px 24px rgba(0,0,0,0.6);">'
        + '<div style="font-size:13px; color:#ff8fb1; font-weight:bold; margin-bottom:6px;">🎀 ' + RIBBON + '</div>'
        + '<div style="font-size:11px; color:#bbb; line-height:1.7; margin-bottom:14px;">'
        + targetName + ' 사원에게 어떻게 묶습니까.</div>'
        + '<button id="rb-perm" class="game-btn" style="width:100%; margin:0 0 8px 0; padding:11px; font-size:12px;'
        + ' background:linear-gradient(145deg,#4a2c3a,#2a161e) !important; border-color:#8a5a6a !important;">'
        + '영구로 묶는다'
        + '<div style="font-size:10px; color:#999; margin-top:4px; font-weight:normal;">'
        + '효과 없음 · 저절로 풀리지 않는다</div></button>'
        + '<button id="rb-hold" class="game-btn" style="width:100%; margin:0 0 10px 0; padding:11px; font-size:12px;'
        + ' background:linear-gradient(145deg,#6a2440,#3a1020) !important; border-color:#c2185b !important;">'
        + '한 시간 묶는다'
        + '<div style="font-size:10px; color:#ffb7cd; margin-top:4px; font-weight:normal;">'
        + '두 사람의 포만도가 한 시간 유지 · 끝나면 소지품으로</div></button>'
        + '<button id="rb-no" class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;'
        + ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">그만둔다</button>'
        + '</div>';
    document.body.appendChild(wrap);

    const close = function () { try { wrap.remove(); } catch (e) { } };
    wrap.querySelector('#rb-perm').onclick = function () { close(); cb('perm'); };
    wrap.querySelector('#rb-hold').onclick = function () { close(); cb('hold'); };
    wrap.querySelector('#rb-no').onclick = function () { close(); cb(null); };
}

(function ribbon() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._satRibbon) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'equip_red_ribbon') return _a.apply(this, arguments);
            if (!currentUser || !targetUser) return _a.apply(this, arguments);

            // --- 아직 안 골랐다 : 창만 띄우고 물러난다 ---
            if (!chosen) {
                if (picking) return false;                     // 이미 창이 떠 있다
                picking = { t: targetUser, n: itemName, o: isOthers };
                ribbonAsk(targetUser.name || '상대', function (mode) {
                    const q = picking; picking = null;
                    if (!mode || !q) return;
                    chosen = mode;
                    let ok = false;
                    try { ok = applyItemEffect(q.t, q.n, q.o); }
                    finally { chosen = null; }
                    if (ok === false) return;

                    // 부른 쪽이 거짓을 받고 지나갔으므로 여기서 치운다
                    if (typeof removeItemFromInventory === 'function') {
                        removeItemFromInventory(currentUser, q.n, 1);
                    }
                    if (typeof addHistoryLog === 'function') {
                        addHistoryLog(currentUser, '[아이템 사용] ' + (q.t.name || '') + " 사원에게 '" + q.n + "' 사용");
                    }
                    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
                    if (typeof updateUserFields === 'function' && q.t.code !== currentUser.code) {
                        try {
                            updateUserFields(q.t.code, {
                                equippedWeapons: q.t.equippedWeapons, equipOwner: q.t.equipOwner,
                                ribbons: q.t.ribbons, badge: q.t.badge, history: q.t.history
                            });
                        } catch (e) { }
                    }
                    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
                });
                return false;
            }

            // --- 골랐다 : 실제로 채운다 ---
            const mode = chosen;

            if (mode === 'hold') {
                if (liveRibbons(currentUser).length >= RIBBON_MAX) {
                    showCustomAlert(RIBBON + '은(는) 한 번에 ' + RIBBON_MAX + '줄까지입니다.'); return false;
                }
                if (liveRibbons(targetUser).length >= RIBBON_MAX) {
                    showCustomAlert('상대가 이미 ' + RIBBON_MAX + '줄을 묶고 있습니다.'); return false;
                }
            }

            const beforeMe = (currentUser.equippedWeapons || []).length;
            const beforeYou = (targetUser.equippedWeapons || []).length;
            const r = _a.apply(this, arguments);
            if (r === false) return r;

            if (mode === 'perm') {
                // 방금 붙은 이름표 끝에 「· 영구」를 적어 둔다
                const mark = function (u, from) {
                    const eq = u.equippedWeapons || [];
                    for (let i = eq.length - 1; i >= from; i--) {
                        if (base(eq[i]) !== RIBBON || String(eq[i]).indexOf(PERM_MARK) >= 0) continue;
                        const old = eq[i], now2 = old + PERM_MARK;
                        eq[i] = now2;
                        // 주인 기록과 특이사항도 새 이름으로 옮긴다
                        if (u.equipOwner && u.equipOwner[old] !== undefined) {
                            u.equipOwner[now2] = u.equipOwner[old];
                            delete u.equipOwner[old];
                        }
                        if (u.badge && typeof u.badge.notes === 'string') {
                            u.badge.notes = u.badge.notes.split(old).join(now2);
                        }
                        break;
                    }
                };
                mark(targetUser, beforeYou);
                mark(currentUser, beforeMe);
                setTimeout(function () {
                    showCustomAlert(targetUser.name + ' 사원과 영구로 묶였습니다.\n\n'
                        + '포만도 효과는 없습니다.\n저절로 풀리지 않으니 뗄 때는 손으로 떼야 합니다.');
                }, 60);
                return r;
            }

            // 한 시간 동결
            const until = now() + RIBBON_MS;
            ribbonsOf(currentUser).push({ p: targetUser.code, o: currentUser.code, u: until });
            ribbonsOf(targetUser).push({ p: currentUser.code, o: currentUser.code, u: until });
            if (typeof saveFields === 'function') { try { saveFields({ ribbons: 1 }); } catch (e) { } }
            if (typeof updateUserFields === 'function' && targetUser.code !== currentUser.code) {
                try { updateUserFields(targetUser.code, { ribbons: targetUser.ribbons }); } catch (e) { }
            }
            setTimeout(function () {
                showCustomAlert(targetUser.name + ' 사원과 묶였습니다.\n\n'
                    + '한 시간 동안 두 사람의 포만감이 내려가지 않습니다.\n'
                    + '시간이 지나면 리본은 소지품으로 돌아옵니다.');
            }, 60);
            return r;
        };
        applyItemEffect._satRibbon = true;
        clearInterval(iv);
        console.log('[포만] ' + RIBBON + ' — 채울 때 영구 / 한 시간 중에 고릅니다');
    }, 400);
})();

// 끝난 줄을 걷는다
//
// ★ 한 줄에 한 번만 돌려준다
//   ribbons 를 지우는 것만으로는 모자랍니다. 저장이 늦거나 서버의 묵은 값이
//   한 번 되돌아오면 끝난 줄이 되살아나고, 30초 뒤 또 돌려주게 됩니다.
//   그러면 리본이 30초마다 하나씩 불어납니다.
//   그래서 「이미 돌려준 줄」을 따로 적어 두고, 적힌 것은 두 번 돌려주지 않습니다.
function payKey(d) { return (d.o || '') + '|' + (d.p || '') + '|' + (d.u || 0); }
function paidList() {
    if (!Array.isArray(currentUser.ribbonPaid)) currentUser.ribbonPaid = [];
    return currentUser.ribbonPaid;
}
function alreadyPaid(d) { return paidList().indexOf(payKey(d)) >= 0; }
function markPaid(d) {
    const l = paidList();
    l.push(payKey(d));
    while (l.length > 40) l.shift();          // 오래된 것부터 버린다
}

function sweepRibbons() {
    if (!currentUser) return;
    const t = now();
    const all = ribbonsOf(currentUser);
    const live = all.filter(function (r) { return r && r.u > t; });
    const dead = all.filter(function (r) { return r && r.u <= t; });

    const eq = currentUser.equippedWeapons || (currentUser.equippedWeapons = []);
    // 영구로 묶은 것은 세지 않는다 — 저절로 풀리면 안 된다
    const wearing = eq.filter(function (w) {
        return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0;
    }).length;

    // ★ 떼어야 할 수를 「차고 있는 수 − 살아 있는 줄 수」로 센다
    //
    //   전에는 끝난 줄마다 하나씩 돌려줬다. 그래서 ribbons 나 ribbonPaid 저장이
    //   한 번 날아가면 같은 줄이 되살아나 30초마다 또 돌려주게 되고,
    //   리본이 끝없이 불어났다.
    //
    //   지금은 눈에 보이는 것(차고 있는 이름표)이 기준이다. 이름표가 이미
    //   빠져 있으면 이 값이 0 이 되어 두 번 돌려주지 않는다.
    //   저장이 날아가도 스스로 맞춰진다.
    const over = Math.max(0, wearing - live.length);

    if (!dead.length && !over) return;
    currentUser.ribbons = live;

    // 내가 채운 끝난 줄 — 아직 안 돌려준 것만
    const owed = dead.filter(function (d) { return d.o === currentUser.code && !alreadyPaid(d); });

    let off = 0, gave = 0;
    for (let k = 0; k < over; k++) {
        // 되도록 끝난 상대의 이름표를 뗀다
        let i = -1;
        for (let m = 0; m < dead.length && i < 0; m++) {
            const mate = (db.users[dead[m].p] || {}).name || '';
            if (!mate) continue;
            i = eq.findIndex(function (w) {
                return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0
                    && String(w).indexOf(mate) >= 0;
            });
        }
        if (i < 0) i = eq.findIndex(function (w) {
            return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0;
        });
        if (i < 0) break;
        const full = eq[i];
        eq.splice(i, 1);
        off++;
        if (typeof clearEquipOwner === 'function') { try { clearEquipOwner(currentUser, full); } catch (e) { } }

        // 내가 채운 줄의 몫만 소지품으로 돌려받는다
        if (gave < owed.length) {
            markPaid(owed[gave]);
            if (!Array.isArray(currentUser.inventory)) currentUser.inventory = [];
            currentUser.inventory.push(RIBBON);
            gave++;
        }
    }

    // 떼지 못했어도 끝난 줄은 적어 둔다 — 다음 번에 또 세지 않게
    dead.forEach(function (d) { if (d.o === currentUser.code) markPaid(d); });

    if (!off && !dead.length) return;
    if (typeof addHistoryLog === 'function' && gave) {
        addHistoryLog(currentUser, '[' + RIBBON + '] 묶임이 풀렸습니다. (' + gave + '개 돌려받음)');
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }

    // 내가 채운 쪽이면 상대도 같이 정리한다 — 상대 것도 같은 식으로 센다
    dead.forEach(function (d) {
        if (d.o !== currentUser.code) return;
        const u = db.users[d.p];
        if (!u || typeof updateUserFields !== 'function') return;
        const mine = (u.ribbons || []).filter(function (r) { return r && r.u > t; });
        const teq = (u.equippedWeapons || []).slice();
        const tw = teq.filter(function (w) {
            return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0;
        }).length;
        let cut = Math.max(0, tw - mine.length);
        const myName = currentUser.name || '';
        while (cut-- > 0) {
            let i = myName ? teq.findIndex(function (w) {
                return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0
                    && String(w).indexOf(myName) >= 0;
            }) : -1;
            if (i < 0) i = teq.findIndex(function (w) {
                return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0;
            });
            if (i < 0) break;
            teq.splice(i, 1);
        }
        u.ribbons = mine; u.equippedWeapons = teq;
        try { updateUserFields(d.p, { ribbons: mine, equippedWeapons: teq }); } catch (e) { }
    });

    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
    if (gave) console.log('[' + RIBBON + '] ' + gave + '개를 돌려받았습니다.');
}
setTimeout(sweepRibbons, 5000);
setInterval(sweepRibbons, 30000);

// 지금 어긋나 있는 것을 손으로 맞춘다 — 차고 있는 수와 줄 수를 같게
window.ribbonSync = function () {
    if (!currentUser) return;
    const t = now();
    const live = ribbonsOf(currentUser).filter(function (r) { return r && r.u > t; });
    const eq = currentUser.equippedWeapons || [];
    const wearing = eq.filter(function (w) {
        return base(w) === RIBBON && String(w).indexOf(PERM_MARK) < 0;
    }).length;
    const inv = (currentUser.inventory || []).filter(function (x) { return x === RIBBON; }).length;
    console.log('%c===== ' + RIBBON + ' =====', 'color:#ff8fb1; font-size:13px');
    console.log('  차고 있는 이름표:', wearing + '개 (한 시간짜리)');
    console.log('  영구로 묶은 것:', permRibbons(currentUser).length + '개');
    console.log('  살아 있는 줄:', live.length + '개');
    console.log('  소지품:', inv + '개');
    console.log('  적어 둔 정산:', (currentUser.ribbonPaid || []).length + '줄');
    if (wearing !== live.length) console.warn('  어긋나 있습니다 — 다음 정리(30초)에 맞춰집니다.');
    else console.log('  맞습니다.');
};

// ==========================================
// 포만감 칸에 「유지 중」 표시
// ==========================================
(function mark() {
    setInterval(function () {
        const el = document.getElementById('satiety-text');
        if (!el || !currentUser) return;
        let tag = document.getElementById('sat-hold-tag');
        if (!satHeld(currentUser)) { if (tag) tag.remove(); return; }
        if (!tag) {
            tag = document.createElement('span');
            tag.id = 'sat-hold-tag';
            tag.style.cssText = 'margin-left:6px; font-size:9px; color:#81c784;';
            el.parentElement.appendChild(tag);
        }
        const t = '유지 중';
        if (tag.textContent !== t) tag.textContent = t;
        tag.title = heldWhy(currentUser).join(' · ');
    }, 3000);
})();

// ==========================================
// 확인
// ==========================================
window.satState = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 포만감 =====', 'color:#8bc34a; font-size:13px');
    console.log('  포만감:', u.satiety != null ? u.satiety : 100, '/100 · 오염도:', u.pollution || 0);
    console.log('  유지 중:', satHeld(u) ? 'O — ' + heldWhy(u).join(' · ') : '아니오');
    console.log('  ' + DRUG + ':', (u.satHoldUntil || 0) > now()
        ? new Date(u.satHoldUntil).toLocaleString() + ' 까지' : '없음');
    console.log('  ' + PEN + ':', wears(u, PEN) ? ('착용 중 · 오염 ' + (u.pollution || 0)
        + ((u.pollution || 0) >= PEN_POLL ? ' → 유지됨' : ' → 50 미만이라 안 됨')) : '없음');
    const lr = liveRibbons(u);
    if (!lr.length) { console.log('  ' + RIBBON + ': 없음'); return; }
    console.table(lr.map(function (r) {
        return {
            상대: (db.users[r.p] || {}).name || r.p,
            채운사람: r.o === u.code ? '본인' : ((db.users[r.o] || {}).name || r.o),
            남은시간: Math.ceil((r.u - now()) / 60000) + '분'
        };
    }));
};

// 상담사 — 지금 당장 묶임을 푼다
window.ribbonClear = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const eq = (u.equippedWeapons || []).filter(function (w) { return base(w) !== RIBBON; });
    u.ribbons = []; u.equippedWeapons = eq;
    if (typeof updateUserFields === 'function') updateUserFields(u.code, { ribbons: [], equippedWeapons: eq });
    console.log('%c✓ ' + u.name + ' 사원의 ' + RIBBON + ' 을 전부 풀었습니다.', 'color:#4CAF50');
    if (typeof updateUI === 'function') updateUI();
};

console.log('[포만] satState(사번) · ribbonClear(사번) · satHeld(user)');

})();