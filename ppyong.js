// ==========================================
// ★ 뿅망치 — 맞은 사람이 대신 상담실·선녀탕에 들어간다
// bundles.json 마지막 묶음, dokkaebi-fix.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 물건
//   이름     뿅망치 (상담사가 지급해야만 생긴다 — 상점·우주 쇼핑몰에는 없다)
//   설명     탄원이 서린 망치. Mu만 사용이 가능하다.
//   장착     Mu 만 장착할 수 있다. 장착하면 장착 중 슬롯의 [해제] 옆에 [목표] 버튼이 생긴다.
//
// ■ 때리기
//   · [목표] → 사원을 한 명 고른다 → 그 사람이 「맞은 사람」 줄에 선다.
//   · 한 번에 한 명만. 하루(날짜 기준) 최대 5명.
//   · 이미 그날 대신 들어간 사람은 그 당일에는 다시 때릴 수 없다.
//   · 줄에 서 있는 사람, 지금 상담실·선녀탕에 있는 사람, 상담사는 고를 수 없다.
//
// ■ 대신 들어가기
//   장착자가 상담실·선녀탕에 가게 되는 순간(오염도 100 · 어둠 사망 · 에픽 사망 ·
//   돌봄 방치) 줄 맨 앞의 사람이 대신 들어간다. 장착자는 가지 않는다.
//   (장착자의 오염도는 0 이 된다)
//
//       오염도 100 으로 가게 될 때   24시간 (질문 절차 없이)
//       어둠·에픽 사망              4시간 (긴급 이송)
//       돌봄 방치                   3시간
//
//   대신 들어간 사람에게는 그날 ppyongTookDay 가 적혀, 그 당일에는 다시 맞지 않는다.
//
// ■ 콘솔
//   ppyongState()   장착 · 오늘 때린 수 · 줄 · 맞은 사람 상태
//   ppyongTest()    규칙 판정 시험 (서버에 쓰지 않음)

(function ppyong() {

const NAME = '뿅망치';
const DAILY = 5;
const SPARE_POLL = 0;                  // 대신 들어가게 되면 장착자의 오염도는 0 으로 둔다
const OWNER_NAME = 'Mu';               // 쓸 수 있는 사람 (이름·별명·사번 어느 쪽이든, 대소문자 무시)

// ------------------------------------------
// 물건 등록
// ------------------------------------------
ITEM_CATALOG[NAME] = {
    price: '???', usable: true, targetable: false, effect: 'equip_ppyong', adminOnly: true,
    desc: '탄원이 서린 망치. Mu만 사용이 가능하다.'
};
try { if (Array.isArray(NO_SELL_ITEMS) && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME); } catch (e) { }

// ------------------------------------------
// 공통
// ------------------------------------------
function today() { return getTodayStr(); }

function isOwner(u) {
    if (!u) return false;
    const want = OWNER_NAME.toLowerCase();
    return [u.name, u.badge && u.badge.nickname, u.code].some(function (x) {
        return String(x == null ? '' : x).trim().toLowerCase() === want;
    });
}
function wearing(u) {
    return !!u && (u.equippedWeapons || []).some(function (w) { return getEquipBaseName(w) === NAME; });
}
function usedToday(u) { return (u && u.ppyongDay === today()) ? (Number(u.ppyongN) || 0) : 0; }
function queue(u) { return Array.isArray(u && u.ppyongQueue) ? u.ppyongQueue.filter(Boolean) : []; }
function inRoom(u) { return !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil); }
function allUsers() {
    return Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
}
function isBathKind(u) {
    return /재난관리/.test(((u && u.affiliation) || '') + ' ' + ((u && u.team) || ''));
}
function save(keys) {
    const f = {};
    keys.forEach(function (k) { f[k] = 1; });
    try { saveFields(f); } catch (e) { try { saveSelfFull(); } catch (x) { } }
}

// 맞을 수 있는 사람인가 → 아니면 까닭을 돌려준다
function whyNot(me, t) {
    if (!t) return '사원을 찾지 못했습니다.';
    if (t.code === me.code) return '본인은 때릴 수 없습니다.';
    if (t.code === 'kario0987') return '상담사는 때릴 수 없습니다.';
    if (queue(me).indexOf(t.code) >= 0) return t.name + ' 사원은 이미 맞아서 줄에 서 있습니다.';
    if (t.ppyongTookDay === today()) return t.name + ' 사원은 오늘 이미 한 번 대신 들어갔습니다.';
    if (inRoom(t)) return t.name + ' 사원은 지금 상담실·선녀탕에 있습니다.';
    return '';
}

// ==========================================
// 1. 착용 조건 — Mu 만
// ==========================================
(function hookWear() {
    const iv = setInterval(function () {
        if (typeof canWearItem !== 'function') return;
        if (canWearItem._ppyong) { clearInterval(iv); return; }
        const _c = canWearItem;
        canWearItem = function (user, itemName) {
            if (itemName === NAME) return isOwner(user);
            return _c.apply(this, arguments);
        };
        canWearItem._ppyong = true;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 2. 장착 — 확인 창을 거친 뒤에 직접 처리한다
// ==========================================
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._ppyong) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);

            // 확인 창을 먼저 거친다 (확인을 누르면 _invOk 를 달고 다시 이 길로 온다)
            if (window._invOk !== NAME) return _u.apply(this, arguments);
            window._invOk = null;

            if (isQuarantined(currentUser)) { showCustomAlert('여우 상담실 격리 중에는 소지품을 사용할 수 없습니다.'); return; }
            if (!canWearItem(currentUser, NAME)) { showCustomAlert('착용 조건이 맞지 않습니다.'); return; }
            if (!(currentUser.inventory || []).includes(NAME)) { showCustomAlert('해당 물품이 없습니다.'); return; }
            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (wearing(currentUser)) { showCustomAlert('이미 뿅망치를 장착하고 있습니다.'); return; }
            if (currentUser.equippedWeapons.length >= 12) { showCustomAlert('장비는 최대 5개까지만 장착할 수 있습니다.'); return; }

            currentUser.equippedWeapons.push(NAME);
            setEquipOwner(currentUser, NAME, currentUser.code);
            removeItemFromInventory(currentUser, NAME, 1);
            addHistoryLog(currentUser, '[장비 장착] ' + NAME + ' 장착 완료');
            saveSelfFull(); updateUI();
        };
        useInventoryItem._ppyong = true;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 3. 화면 — 소지품의 [장착] 글자 · 장착 슬롯의 [목표] 버튼
// ==========================================
function decorate() {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;

    // 소지품 카드의 버튼 이름
    box.querySelectorAll('.inv-card').forEach(function (card) {
        const nm = card.querySelector('.inv-card-name');
        if (!nm || nm.textContent.trim() !== NAME) return;
        card.querySelectorAll('button.inv-btn-use').forEach(function (b) {
            if (/사용/.test(b.textContent)) b.textContent = '장착';
        });
    });

    // 장착 슬롯
    Array.from(box.querySelectorAll('div')).forEach(function (d) {
        const t = d.textContent || '';
        if (t.indexOf('[장착 중 슬롯') < 0 || t.indexOf(NAME) < 0) return;
        if (d.children.length > 3 && d.querySelectorAll('div').length > 6) return;      // 바깥 덩어리는 건너뛴다
        const un = d.querySelector('button[onclick^="unequipWeapon"]');
        if (!un || d.querySelector('.ppyong-aim')) return;

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; gap:6px; flex-shrink:0; align-items:flex-start;';
        const aim = document.createElement('button');
        aim.className = 'game-btn ppyong-aim';
        aim.textContent = '목표';
        aim.style.cssText = 'margin:0; padding:6px 12px; background:linear-gradient(145deg,#8a5a1a,#5a3a0a); flex-shrink:0;';
        aim.onclick = function () { window.ppyongAim(); };
        un.parentNode.insertBefore(wrap, un);
        wrap.appendChild(aim);
        wrap.appendChild(un);

        const info = document.createElement('div');
        info.style.cssText = 'font-size:10px; color:#e8c27a; margin-top:6px;';
        info.textContent = '오늘 ' + usedToday(currentUser) + ' / ' + DAILY + '명 · 줄 선 사람 ' + queue(currentUser).length + '명';
        const desc = wrap.parentNode.querySelector('div[style*="flex:1"]');
        if (desc) desc.appendChild(info);
    });
}
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._ppyong) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const r = _r.apply(this, arguments);
            try { decorate(); } catch (e) { console.warn('[뿅망치] 화면:', e); }
            return r;
        };
        renderInventory._ppyong = true;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 4. [목표] — 한 번에 한 명
// ==========================================
function closeAim() {
    const m = document.getElementById('ppyong-modal');
    if (m) m.remove();
}

window.ppyongAim = function () {
    if (!currentUser) return;
    if (!wearing(currentUser) || !isOwner(currentUser)) { showCustomAlert('뿅망치를 장착해야 쓸 수 있습니다.'); return; }
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 쓸 수 없습니다.'); return; }
    if (usedToday(currentUser) >= DAILY) { showCustomAlert('오늘은 이미 ' + DAILY + '명을 때렸습니다.'); return; }

    const cand = allUsers().filter(function (u) { return !whyNot(currentUser, u); });
    if (!cand.length) { showCustomAlert('지금 때릴 수 있는 사원이 없습니다.'); return; }

    closeAim();
    const opts = cand.map(function (u) {
        return '<option value="' + u.code + '">' + u.name + ' (사번: ' + u.no + ')</option>';
    }).join('');
    document.body.insertAdjacentHTML('beforeend',
        '<div id="ppyong-modal" class="modal-overlay" style="display:flex; z-index:10010;">'
        + '<div class="modal-content" style="max-width:340px;">'
        + '<h3>뿅망치 — 목표</h3>'
        + '<div style="font-size:11px; color:#aaa; line-height:1.6; margin-bottom:10px;">한 번에 한 명만 때릴 수 있습니다. (오늘 '
        + usedToday(currentUser) + ' / ' + DAILY + '명)<br>맞은 사람은 내가 상담실·선녀탕에 갈 때 대신 들어갑니다.</div>'
        + '<select id="ppyong-select" style="width:100%; margin-bottom:15px;"><option value="">-- 때릴 사원 선택 --</option>' + opts + '</select>'
        + '<div class="modal-btn-group">'
        + '<button class="btn-submit" onclick="ppyongHit()">때린다</button>'
        + '<button class="btn-cancel" onclick="ppyongClose()">취소</button>'
        + '</div></div></div>');
};
window.ppyongClose = closeAim;

window.ppyongHit = function () {
    const sel = document.getElementById('ppyong-select');
    const c = sel ? sel.value : '';
    if (!c) { showCustomAlert('때릴 사원을 선택해 주세요.'); return; }
    closeAim();

    const me = currentUser;
    if (!me || !wearing(me)) return;
    if (usedToday(me) >= DAILY) { showCustomAlert('오늘은 이미 ' + DAILY + '명을 때렸습니다.'); return; }
    const t = db.users[c];
    const why = whyNot(me, t);
    if (why) { showCustomAlert(why); return; }

    me.ppyongDay = today();
    me.ppyongN = usedToday(me) + 1;
    me.ppyongQueue = queue(me).concat([t.code]);
    addHistoryLog(me, '[뿅망치] ' + t.name + ' 사원을 때렸습니다. (오늘 ' + me.ppyongN + '/' + DAILY + ')');
    save(['ppyongDay', 'ppyongN', 'ppyongQueue', 'history']);
    updateUI();

    // 맞은 사람에게도 남긴다
    try {
        addHistoryLog(t, '[뿅망치] ' + (me.badge && me.badge.nickname ? me.badge.nickname : me.name) + ' 사원의 뿅망치에 맞았습니다.');
        if (typeof updateUserFields === 'function') {
            updateUserFields(t.code, { history: t.history, _adminStamp: Date.now() });
        }
    } catch (e) { }

    showCustomAlert('뿅!\n\n' + t.name + ' 사원을 때렸습니다. (오늘 ' + me.ppyongN + ' / ' + DAILY + '명)');
};

// ==========================================
// 5. 대신 들어가기
// ==========================================
// 줄에서 맨 앞의 들어갈 수 있는 사람
function pickProxy(me) {
    const q = queue(me);
    for (let i = 0; i < q.length; i++) {
        const t = db.users[q[i]];
        if (!t) continue;
        if (inRoom(t)) continue;
        if (t.ppyongTookDay === today()) continue;
        return t;
    }
    return null;
}

function sendProxy(me, t, mode) {
    const hours = mode === 'hospital' ? 4 : (mode === 'neglect' ? 3 : 24);
    const dest = isBathKind(t) ? 'bath' : 'fox';
    const f = {
        quarantineUntil: Date.now() + hours * 3600000,
        quarantineExitPollution: mode === 'hospital' ? 40 : (mode === 'neglect' ? 30 : 0),
        quarantineHospital: mode === 'hospital',
        quarantineDest: dest,
        foxRoomAnswered: true,
        lastPollutionTime: Date.now(),
        ppyongTookDay: today(),
        _adminStamp: Date.now()
    };
    if (mode !== 'neglect') f.pollution = 100;

    const mine = (me.badge && me.badge.nickname) ? me.badge.nickname : me.name;
    addHistoryLog(t, '[뿅망치] ' + mine + ' 사원 대신 ' + (dest === 'bath' ? '선녀탕' : '여우 상담실') + '에 들어갔습니다. (' + hours + '시간)');
    f.history = t.history;
    Object.keys(f).forEach(function (k) { t[k] = f[k]; });
    if (typeof updateUserFields === 'function') updateUserFields(t.code, f);
    return dest;
}

// 장착자는 가지 않는다 — 줄에서 빼고 오염도를 남긴다
function spare(me, t, snap, dest) {
    me.ppyongQueue = queue(me).filter(function (c) { return c !== t.code; });
    me.pollution = SPARE_POLL;
    if (snap) {
        me.quarantineUntil = snap.quarantineUntil || 0;
        me.quarantineExitPollution = snap.quarantineExitPollution || 0;
        me.quarantineHospital = snap.quarantineHospital || false;
        me.quarantineDest = snap.quarantineDest || null;
        me.foxRoomAnswered = !!snap.foxRoomAnswered;
    } else {
        me.quarantineUntil = 0;
    }
    me.lastPollutionTime = Date.now();
    addHistoryLog(me, '[뿅망치] ' + t.name + ' 사원이 대신 ' + (dest === 'bath' ? '선녀탕' : '여우 상담실') + '에 들어갔습니다.');
    save(['ppyongQueue', 'pollution', 'quarantineUntil', 'quarantineExitPollution', 'quarantineHospital',
          'quarantineDest', 'foxRoomAnswered', 'lastPollutionTime', 'history']);
    updateUI();
    showCustomAlert('뿅망치가 대신 맞아 주었습니다.\n\n' + t.name + ' 사원이 대신 '
        + (dest === 'bath' ? '선녀탕' : '여우 상담실') + '에 들어갔습니다.');
}

// 5-1. 오염도 100 — 질문 절차가 시작되기 전에 막는다
(function hookFox() {
    const iv = setInterval(function () {
        if (typeof startFoxRoomSequence !== 'function') return;
        if (startFoxRoomSequence._ppyong) { clearInterval(iv); return; }
        const _s = startFoxRoomSequence;
        startFoxRoomSequence = function () {
            try {
                if (currentUser && wearing(currentUser) && isOwner(currentUser) && !darkRun) {
                    const t = pickProxy(currentUser);
                    if (t) {
                        const dest = sendProxy(currentUser, t, 'pollution');
                        spare(currentUser, t, null, dest);
                        return;
                    }
                }
            } catch (e) { console.warn('[뿅망치]', e); }
            return _s.apply(this, arguments);
        };
        startFoxRoomSequence._ppyong = true;
        clearInterval(iv);
    }, 400);
})();

// 5-2. 그 밖의 길 (어둠 사망 · 에픽 사망 · 돌봄 방치) — 들어간 순간을 알아챈다
let snap = null, wasIn = null;
function take() {
    return {
        quarantineUntil: currentUser.quarantineUntil || 0,
        quarantineExitPollution: currentUser.quarantineExitPollution || 0,
        quarantineHospital: currentUser.quarantineHospital || false,
        quarantineDest: currentUser.quarantineDest || null,
        foxRoomAnswered: !!currentUser.foxRoomAnswered
    };
}
setInterval(function () {
    try {
        if (!currentUser) { snap = null; wasIn = null; return; }
        const inNow = inRoom(currentUser);
        if (wasIn === null) { wasIn = inNow; if (!inNow) snap = take(); return; }   // 처음 본 모습은 기준만 잡는다
        if (!inNow) { wasIn = false; snap = take(); return; }
        if (wasIn) return;                                                          // 이미 들어가 있던 것
        wasIn = true;                                                               // 방금 들어갔다

        if (!wearing(currentUser) || !isOwner(currentUser)) return;
        const t = pickProxy(currentUser);
        if (!t) return;

        const mode = currentUser.quarantineHospital ? 'hospital'
            : (currentUser.quarantineExitPollution === 30 ? 'neglect' : 'pollution');
        const dest = sendProxy(currentUser, t, mode);
        spare(currentUser, t, snap, dest);
        wasIn = false; snap = take();
    } catch (e) { console.warn('[뿅망치] 감시:', e); }
}, 400);

// ==========================================
// 확인
// ==========================================
window.ppyongState = function () {
    console.log('%c===== 뿅망치 =====', 'color:#e8c27a; font-size:13px');
    if (!currentUser) { console.log('로그인 후에 쓰세요.'); return; }
    console.log('  쓸 수 있는 사람(' + OWNER_NAME + ') :', isOwner(currentUser) ? 'O' : '✗');
    console.log('  장착 :', wearing(currentUser) ? 'O' : '✗', '· 소지 :', (currentUser.inventory || []).filter(function (x) { return x === NAME; }).length + '개');
    console.log('  오늘 때린 수 :', usedToday(currentUser) + ' / ' + DAILY);
    const q = queue(currentUser);
    console.log('  줄 선 사람 :', q.length ? q.map(function (c) { const u = db.users[c]; return (u ? u.name : c) + (u && u.ppyongTookDay === today() ? '(오늘 이미 들어감)' : ''); }).join(' → ') : '없음');
    console.log('  대신 들어갈 사람 :', (pickProxy(currentUser) || { name: '없음' }).name);
    console.log('  연결 — canWearItem:', canWearItem._ppyong ? 'O' : '✗',
        '· useInventoryItem:', useInventoryItem._ppyong ? 'O' : '✗',
        '· startFoxRoomSequence:', startFoxRoomSequence._ppyong ? 'O' : '✗');
};

window.ppyongTest = function () {
    const mu = { code: 'zz1', name: 'Mu', badge: {}, equippedWeapons: [NAME], ppyongQueue: [] };
    const other = { code: 'zz2', name: '다른사원', badge: {}, equippedWeapons: [] };
    const a = { code: 'zz3', name: '맞을사원', badge: {}, ppyongTookDay: today() };
    const b = { code: 'zz4', name: '새사원', badge: {} };
    const rows = [
        ['Mu 만 착용', isOwner(mu) && !isOwner(other)],
        ['canWearItem — Mu', canWearItem(mu, NAME) === true],
        ['canWearItem — 다른 사원', canWearItem(other, NAME) === false],
        ['오늘 대신 들어간 사람은 못 때림', !!whyNot(mu, a)],
        ['새 사람은 때릴 수 있음', !whyNot(mu, b)],
        ['본인은 못 때림', !!whyNot(mu, mu)],
        ['상담사는 못 때림', !!whyNot(mu, { code: 'kario0987', name: '상담사' })],
        ['하루 5명', usedToday({ ppyongDay: today(), ppyongN: 5 }) >= DAILY && usedToday({ ppyongDay: '1999-01-01', ppyongN: 5 }) === 0]
    ];
    rows.forEach(function (r) { console.log('  ' + (r[1] ? 'O ' : '✗ ') + r[0]); });
};

console.log('[뿅망치] 상담사 지급 · Mu 전용 — ppyongState() · ppyongTest()');

})();
