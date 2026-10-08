// ==========================================
// ★ 📺 브라운의 심야 토크 쇼 — 상담사 지급 전용
// bundles.json 마지막 그룹, spaceitems.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   이 장비를 찬 사람이 파티를 모집하면 그 파티가 「브라운의 심야 토크 쇼」가
//   된다. 파티에 든 모든 사원의 화면이 갈색 민무늬로 바뀌고, 아래에서
//   😊 와 📺 가 비눗방울처럼 천천히 올라온다.
//
//   사는 곳이 없다. 상담사가 「물품 강제 꽂기」로만 준다. 장터·경매장·
//   구합니다 어디에도 뜨지 않고 팔 수도 없다. 은심장·호사수구와 같다.
//
// ■ 여덟 가지
//
//   1  초대장을 받은 사람만 들어온다. 초대장은 갈색 팝업으로 뜬다.
//      한 번 부른 사람은 파티를 나갔다 다시 와도, 그 사회자의 다음 파티에도
//      그대로 들어올 수 있다 — 초대장의 기운이 남는다.
//   2  사회자는 상담실·선녀탕에 매이지 않는다. 입원·온천욕·상담 중인
//      사원도 사원당 하루 한 번 불러올 수 있다. 불려 나온 사원은 거기서
//      꺼내지고 오염도가 50 으로 맞춰진다 (그대로 두면 바로 다시 들어간다).
//   3  초대받은 사람은 탐사 횟수를 쓰지 않는다. 초대장을 받은 사람만.
//   4  들어온 모두가 부활 2회 · 모든 판정 +1. 초대와 상관없다.
//      다만 이 장비를 찬 사람이 파티의 주인일 때만.
//   5  파티원이 죽을 때마다 「무대 열기」가 쌓여 보너스가 오른다.
//      1명 1.2배 · 2명 1.4배 … 사회자가 죽으면 3배. 전체 최대 4배.
//   6  사회자와 함께 끝까지 살아남으면 회수품 확률이 2배.
//   7  부활할 때 「쇼는 아직 끝나지 않았습니다!」와 손가락 튕기는 소리.
//   8  초대를 누르면 초대장과 러브레터 중에 고른다. 러브레터는 💕 와 함께
//      직접 적어 보내고, 팝업이 흰색과 연분홍이 섞인 색으로 뜬다.
//
// ■ 어디에 적히나
//
//   darkParties/{파티}/talkShow        { by, name }      이 파티가 토크쇼다
//   darkParties/{파티}/invited/{사번}  { kind, at }      초대장을 받았다
//   darkParties/{파티}/heat            숫자              쌓인 무대 열기
//   darkParties/{파티}/hostDead        true              사회자가 죽었다
//   darkInvites/{초대}/kind            'invite'|'love'   초대장 모양
//   darkInvites/{초대}/msg             글                 러브레터 내용
//   사용자/talkInvDay/{사번}           'YYYY-MM-DD'      격리 초대 하루 한 번
//
// ■ 확인
//
//   showState()        지금 상태 · 연결
//   showGive(사번)     상담사가 지급 (콘솔)
//   showTheme(true)    갈색 화면을 눌러 본다

(function talkShow() {

const SHOW = '📺 브라운의 심야 토크 쇼';
const REVIVES = 2;              // 들어온 사람마다 받는 부활 횟수
const HEAT_STEP = 0.2;          // 사망 1명마다
const HOST_MULT = 3;            // 사회자가 죽으면
const MAX_MULT = 4;             // 전체 뚜껑
const ADMIN = 'kario0987';
const GUEST_ROOT = 'talkShowGuest';     // 사회자별로 남는 초대장의 기운
const OUT_POLL = 50;                   // 꺼내 온 사람의 오염도
const ZONE_TITLE = '브라운의 심야 토크 쇼';   // 그 방의 어둠 이름

// 고급진 갈색 — 민무늬
const BROWN = {
    base:   '#1a1008',
    panel:  '#2a1b0e',
    accent: '#c79a5b',
    text:   '#f3e6d2',
    deep:   '#0f0904',
    line:   '#5a3f22'
};

function today() {
    return (typeof getTodayStr === 'function') ? getTodayStr()
        : new Date().toISOString().slice(0, 10);
}
function has(u, n) {
    if (typeof hasEquip === 'function') { try { return hasEquip(u, n); } catch (e) { } }
    return (u && Array.isArray(u.equippedWeapons))
        ? u.equippedWeapons.some(function (w) {
            return String(w) === n || String(w).indexOf(n) >= 0;
        }) : false;
}
function party(pid) {
    if (typeof darkParties === 'undefined') return null;
    return darkParties[pid] || null;
}
function myParty() {
    if (typeof getMyParty === 'function') { try { return getMyParty(); } catch (e) { } }
    return null;
}
// 지금 내가 토크쇼에 있나 (대기실이든 탐사 중이든)
function showOf() {
    const inRun = (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId)
        ? party(darkRun.partyId) : null;
    const p = inRun || myParty();
    if (p && p.talkShow && p.talkShow.by) return p;
    return null;
}
function isHost(p, code) {
    return !!(p && p.talkShow && p.talkShow.by === (code || (currentUser || {}).code));
}

// ★ 초대장의 기운 — 한 번 부른 사람은 파티를 나갔다 다시 와도 그대로다.
//   파티 노드의 invited 는 그 파티에서만 쓰이고, 파티가 지워지면 같이 사라진다.
//   그래서 사회자별로 따로 적어 두고 둘 중 하나라도 있으면 초대받은 것으로 본다.
const guestOf = {};                      // { 사회자코드: { 손님코드: 때 } }
(function watchGuests() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        database.ref(GUEST_ROOT).on('value', function (s) {
            const v = s.val() || {};
            Object.keys(guestOf).forEach(function (k) { delete guestOf[k]; });
            Object.keys(v).forEach(function (h) { guestOf[h] = v[h] || {}; });
        });
    }, 400);
})();

// 이 파티에 들어올 수 있나 — 이번 초대장이든, 전에 받은 기운이든
function invitedTo(p, code) {
    if (!p || !p.talkShow) return false;
    code = code || (currentUser || {}).code;
    if (!code) return false;
    if ((p.invited || {})[code]) return true;
    const g = guestOf[p.talkShow.by];
    return !!(g && g[code]);
}
window.showInvited = invitedTo;

// ==========================================
// 등록 — 상담사만 줄 수 있고, 어디에도 안 뜬다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[SHOW] = {
            price: 0, usable: true, targetable: false, effect: 'talkshow_equip', noSell: true,
            desc: '낡은 갈색 세트와 식지 않는 조명. 이것을 차고 파티를 모집하면 '
                + '그 파티는 심야 토크 쇼가 된다. 초대장을 받은 사원만 들어올 수 있고, '
                + '들어온 모두가 부활 2회와 모든 판정 +1을 받는다. '
                + '파티원이 죽을수록 무대가 달아오른다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(SHOW) < 0) {
            NO_SELL_ITEMS.push(SHOW);
        }
        console.log('[토크쇼] ' + SHOW + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 상점 후보에서 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    const i = ALIEN_ITEMS_POOL.indexOf(SHOW);
    if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
}, 5000);

// 장터 팝니다·구합니다 목록에서 지운다 (호사수구와 같은 길)
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._showHide) { clearInterval(iv); return; }
        const _m = marketSellable;
        const wrapped = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(SHOW); } catch (e) { }
            return pool;
        };
        wrapped._showHide = true;
        marketSellable = wrapped;
        clearInterval(iv);
        console.log('[토크쇼] 장터에서 숨김');
    }, 500);
})();

// 장착 — 본인만 찬다
(function equip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._show) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (name) {
            const cat = ITEM_CATALOG[name];
            if (!cat || cat.effect !== 'talkshow_equip') return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(name) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            if (!Array.isArray(currentUser.equippedWeapons)) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.indexOf(SHOW) >= 0) {
                showCustomAlert('이미 차고 있습니다.'); return;
            }
            if (currentUser.equippedWeapons.length >= 12) {
                showCustomAlert('장착 슬롯이 가득 찼습니다.'); return;
            }
            currentUser.equippedWeapons.push(SHOW);
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, name, 1);
            if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[토크쇼] 세트에 불이 들어왔습니다.');
            if (typeof saveSelfFull === 'function') saveSelfFull();
            if (typeof updateUI === 'function') updateUI();
            showCustomAlert('📺 조명이 켜졌습니다.\n\n파티를 모집하면 심야 토크 쇼가 열립니다.');
        };
        useInventoryItem._show = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 파티를 모집하면 토크쇼가 된다
// ==========================================
//
// 사회자는 상담실·선녀탕에 매이지 않으므로, 모집할 때만 격리 검사를 눕힌다.
function withoutQuarantine(fn) {
    if (typeof isQuarantined !== 'function') return fn();
    const _q = isQuarantined;
    isQuarantined = function () { return false; };
    try { return fn(); } finally { isQuarantined = _q; }
}

(function hookCreate() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function') return;
        if (createParty._show) { clearInterval(iv); return; }
        const _c = createParty;
        createParty = function () {
            const self = this, args = arguments;
            const wear = currentUser && has(currentUser, SHOW);
            const before = (typeof myPartyId !== 'undefined') ? myPartyId : null;
            const r = wear ? withoutQuarantine(function () { return _c.apply(self, args); })
                           : _c.apply(self, args);
            try {
                if (!wear) return r;
                const pid = (typeof myPartyId !== 'undefined') ? myPartyId : null;
                if (!pid || pid === before) return r;
                const mark = { by: currentUser.code, name: currentUser.name };
                const p = party(pid);
                if (p) p.talkShow = mark;
                if (typeof database !== 'undefined' && database) {
                    database.ref('darkParties/' + pid + '/talkShow').set(mark);
                }
                paintTheme();
                showCustomAlert('📺 브라운의 심야 토크 쇼가 열렸습니다.\n\n'
                    + '초대장을 받은 사원만 들어올 수 있습니다.');
            } catch (e) { console.warn('[토크쇼] 개설 표시 건너뜀:', e && e.message); }
            return r;
        };
        createParty._show = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 기능 1·2·3 — 초대장을 받은 사람만, 횟수 없이, 격리 중에도
// ==========================================
(function hookJoin() {
    const iv = setInterval(function () {
        if (typeof joinParty !== 'function') return;
        if (joinParty._show) { clearInterval(iv); return; }
        const _j = joinParty;
        joinParty = function (pid) {
            const p = party(pid);
            if (!p || !p.talkShow || !currentUser) return _j.apply(this, arguments);

            const inv = invitedTo(p);
            if (!inv && !isHost(p)) {
                showCustomAlert('📺 심야 토크 쇼입니다.\n\n초대장을 받은 사원만 들어올 수 있습니다.');
                return;
            }

            // 초대받은 사람은 탐사 횟수를 쓰지 않고, 격리 중에도 들어온다
            const wasLocked = (typeof isQuarantined === 'function') && isQuarantined(currentUser);
            const _q = (typeof isQuarantined === 'function') ? isQuarantined : null;
            const _t = (typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft : null;
            if (_q) isQuarantined = function () { return false; };
            if (_t) getDarkTriesLeft = function () { return 99; };
            let out;
            try { out = _j.apply(this, arguments); }
            finally {
                if (_q) isQuarantined = _q;
                if (_t) getDarkTriesLeft = _t;
            }
            // 상담실·선녀탕에 있던 사람은 쇼에 들어오면서 꺼내진다.
            // 나올 때 값(보통 100 가까이)을 그대로 두면 나오자마자 다시 들어간다.
            if (wasLocked) pullOut();
            return out;
        };
        joinParty._show = true;
        clearInterval(iv);
    }, 400);
})();

// 상담실·선녀탕에서 꺼낸다 — 오염도는 50 으로 둔다
function pullOut() {
    const u = currentUser;
    if (!u) return;
    u.quarantineUntil = 0;
    u.quarantineDest = null;
    u.quarantineHospital = null;
    u.quarantineExitPollution = 0;
    u.pollution = OUT_POLL;
    u.lastPollutionTime = Date.now();
    u.foxRoomAnswered = false;
    if (u.badge && typeof u.badge.notes === 'string') {
        const arr = u.badge.notes.split(' | ').filter(function (n) {
            return n.trim() !== '' && n.indexOf('의식 불명') < 0
                && n.indexOf('긴급 이송') < 0 && n.indexOf('사직 반려') < 0;
        });
        u.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[토크쇼] 무대로 불려 나왔습니다. (오염도 ' + OUT_POLL + '%)');
    }
    const f = { quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1,
                quarantineExitPollution: 1, pollution: 1, lastPollutionTime: 1,
                foxRoomAnswered: 1, history: 1 };
    if (u.badge !== undefined) f.badge = 1;
    if (typeof saveFields === 'function') { try { saveFields(f); } catch (e) { } }
    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
    setTimeout(function () {
        showCustomAlert('📺 무대로 불려 나왔습니다.\n\n오염도 ' + OUT_POLL + '% 로 맞춰졌습니다.');
    }, 600);
}

// 출발할 때 — 초대받은 사람의 탐사 횟수를 돌려준다
(function hookLaunch() {
    const iv = setInterval(function () {
        if (typeof launchPartyRun !== 'function') return;
        if (launchPartyRun._show) { clearInterval(iv); return; }
        const _l = launchPartyRun;
        launchPartyRun = function (p) {
            const show = !!(p && p.talkShow && p.talkShow.by);
            const invited = show && currentUser && invitedTo(p);
            const triesWas = currentUser ? (currentUser.darkTries || 0) : 0;
            const dateWas = currentUser ? currentUser.darkDate : null;

            // 사택 감금실에 갇혀 있어도 초대받았으면 나올 수 있다.
            // cage.js 가 launchPartyRun 을 막으므로(cage.js:94) 그동안만 비켜 둔다.
            const cageWas = (invited && currentUser) ? currentUser.cage : undefined;
            if (cageWas) currentUser.cage = null;
            let r;
            try { r = _l.apply(this, arguments); }
            finally { if (cageWas) currentUser.cage = cageWas; }

            try {
                if (!show) return r;
                if (typeof darkRun !== 'undefined' && darkRun) {
                    darkRun._showRevives = REVIVES;      // 기능 4 — 부활 2회
                    darkRun._show = true;
                    keepRevives();                       // 이어하기에서도 남게 적어 둔다
                }
                if (invited && currentUser) {            // 기능 3 — 횟수를 쓰지 않는다
                    currentUser.darkTries = triesWas;
                    if (dateWas != null) currentUser.darkDate = dateWas;
                    if (typeof saveFields === 'function') saveFields({ darkTries: 1, darkDate: 1 });
                }
                paintTheme();
            } catch (e) { console.warn('[토크쇼] 출발 처리 건너뜀:', e && e.message); }
            return r;
        };
        launchPartyRun._show = true;
        clearInterval(iv);
        console.log('[토크쇼] 출발 연결 — 부활 ' + REVIVES + '회 · 초대받은 사람은 횟수 없음');
    }, 400);
})();

// ==========================================
// 기능 8 — 초대장 / 러브레터
// ==========================================
// 고른 사원을 손에 쥐고 있는다. 아래 화면이 고르기 칸을 덮어 쓰므로,
// 보낼 때 다시 읽으려 하면 이미 없다.
let pickTarget = null;

window.showInvitePick = function () {
    const p = myParty();
    if (!p) return;
    const sel = document.getElementById('dark-invite-target');
    const target = sel ? sel.value : pickTarget;
    if (!target) { showCustomAlert('사원을 골라 주세요.'); return; }
    const u = (db.users || {})[target];
    if (!u) return;
    pickTarget = target;

    const body = document.getElementById('dark-party-body');
    if (!body) return;
    body.innerHTML =
        '<div style="font-size:13px; font-weight:bold; margin-bottom:10px; color:' + BROWN.accent + ';">'
        + '📺 ' + u.name + ' 사원 (사번 ' + u.no + ') 에게</div>'
        + '<div style="font-size:11px; color:#999; margin-bottom:14px; line-height:1.7;">'
        + '초대장은 정해진 문구가 그대로 갑니다.<br>러브레터는 직접 적어 보냅니다.</div>'
        + '<div style="display:flex; gap:8px; margin-bottom:10px;">'
        + '<button class="game-btn" style="flex:1; margin:0; padding:13px; background:linear-gradient(145deg,'
        + BROWN.panel + ',' + BROWN.deep + ') !important; border-color:' + BROWN.line + ' !important; color:'
        + BROWN.accent + ' !important;" onclick="showSendInvite(\'invite\')">📺 초대장</button>'
        + '<button class="game-btn" style="flex:1; margin:0; padding:13px; background:linear-gradient(145deg,#fff0f5,#ffdde8) !important;'
        + ' border-color:#e8a0bb !important; color:#8a3a55 !important;" onclick="showLoveForm()">💕 러브레터</button>'
        + '</div>'
        + '<div id="show-love-form"></div>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:11px; font-size:11px;" onclick="renderPartyPanel()">돌아가기</button>';
};

window.showLoveForm = function () {
    const box = document.getElementById('show-love-form');
    if (!box) return;
    box.innerHTML =
        '<div style="background:linear-gradient(145deg,#fff6fa,#ffe6ef); border:1px solid #e8a0bb;'
        + ' border-radius:8px; padding:12px; margin-bottom:10px;">'
        + '<div style="font-size:11px; color:#8a3a55; margin-bottom:7px;">💕 보낼 말을 적어 주세요</div>'
        + '<textarea id="show-love-msg" rows="3" maxlength="120" placeholder="오늘 밤, 당신을 기다립니다."'
        + ' style="width:100%; box-sizing:border-box; background:#fffafc; color:#5a2338;'
        + ' border:1px solid #e8a0bb; border-radius:6px; padding:8px; font-size:12px; resize:none;"></textarea>'
        + '<button class="game-btn" style="width:100%; margin-top:8px; padding:11px;'
        + ' background:linear-gradient(145deg,#ffd9e6,#ffc2d6) !important; border-color:#e8a0bb !important;'
        + ' color:#8a3a55 !important;" onclick="showSendInvite(\'love\')">보낸다</button>'
        + '</div>';
};

window.showSendInvite = function (kind) {
    const p = myParty();
    if (!p) return;
    const sel = document.getElementById('dark-invite-target');
    const target = (sel && sel.value) ? sel.value : pickTarget;
    const u = (db.users || {})[target];
    if (!u) { showCustomAlert('사원을 골라 주세요.'); return; }

    let msg = '';
    if (kind === 'love') {
        const el = document.getElementById('show-love-msg');
        msg = String((el && el.value) || '').trim().slice(0, 120);
        if (!msg) { showCustomAlert('보낼 말을 적어 주세요.'); return; }
    }

    // 기능 2 — 격리 중인 사원은 하루 한 번만 부를 수 있다
    const locked = (typeof isQuarantined === 'function') && isQuarantined(u);
    if (locked) {
        if (!currentUser.talkInvDay) currentUser.talkInvDay = {};
        if (currentUser.talkInvDay[target] === today()) {
            showCustomAlert(u.name + ' 사원은 오늘 이미 불렀습니다.\n\n'
                + '상담실·선녀탕에 있는 사원은 하루 한 번만 부를 수 있습니다.');
            return;
        }
        currentUser.talkInvDay[target] = today();
        if (typeof saveFields === 'function') saveFields({ talkInvDay: 1 });
    }

    const iid = 'di_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    if (typeof database !== 'undefined' && database) {
        database.ref('darkInvites/' + iid).set({
            id: iid, partyId: p.id, zone: p.zone,
            from: currentUser.code, fromName: currentUser.name,
            to: target, at: Date.now(),
            kind: (kind === 'love') ? 'love' : 'invite', msg: msg
        });
        // 초대장을 받은 사람만 들어올 수 있으므로 파티에도 적어 둔다
        database.ref('darkParties/' + p.id + '/invited/' + target)
            .set({ kind: (kind === 'love') ? 'love' : 'invite', at: Date.now() });
        // ★ 기운은 사회자 쪽에 남는다 — 파티를 나갔다 다시 와도, 다음 파티에도 그대로
        database.ref(GUEST_ROOT + '/' + currentUser.code + '/' + target).set(Date.now());
    }
    if (!p.invited) p.invited = {};
    p.invited[target] = { kind: kind, at: Date.now() };
    if (!guestOf[currentUser.code]) guestOf[currentUser.code] = {};
    guestOf[currentUser.code][target] = Date.now();

    pickTarget = null;
    showCustomAlert(u.name + ' 사원에게 ' + (kind === 'love' ? '💕 러브레터를' : '📺 초대장을') + ' 보냈습니다.'
        + (locked ? '\n\n(상담실·선녀탕에 있는 사원 — 오늘 몫을 썼습니다)' : ''));
    if (typeof renderPartyPanel === 'function') renderPartyPanel();
};

// 토크쇼 주인에게는 초대 화면에 고르기를 붙인다
(function hookInviteUI() {
    const iv = setInterval(function () {
        if (typeof openInviteSelect !== 'function') return;
        if (openInviteSelect._show) { clearInterval(iv); return; }
        const _o = openInviteSelect;
        openInviteSelect = function () {
            const r = _o.apply(this, arguments);
            try {
                const p = myParty();
                if (!p || !p.talkShow || !isHost(p)) return r;
                const body = document.getElementById('dark-party-body');
                if (!body) return r;
                // 어디에 있는지 적어 준다 — 상담실·선녀탕·감금실에 있어도 부를 수 있다
                const sel = body.querySelector('#dark-invite-target');
                if (sel) {
                    for (let i = 0; i < sel.options.length; i++) {
                        const o = sel.options[i];
                        const u = (db.users || {})[o.value];
                        if (!u) continue;
                        let tag = whereTag(u);
                        if (invitedTo(p, o.value)) tag = (tag ? tag + ' ' : '') + '· 초대됨';
                        if (tag && o.text.indexOf(tag) < 0) o.text = o.text + ' ' + tag;
                    }
                }
                const btns = body.querySelectorAll('button');
                for (let i = 0; i < btns.length; i++) {
                    const on = btns[i].getAttribute('onclick') || '';
                    if (on.indexOf('sendDarkInvite') >= 0) {
                        btns[i].setAttribute('onclick', 'showInvitePick()');
                        btns[i].innerText = '📺 초대장 · 💕 러브레터';
                        btns[i].style.background = 'linear-gradient(145deg,' + BROWN.panel + ',' + BROWN.deep + ')';
                        btns[i].style.borderColor = BROWN.line;
                        btns[i].style.color = BROWN.accent;
                    }
                }
            } catch (e) { }
            return r;
        };
        openInviteSelect._show = true;
        clearInterval(iv);
    }, 400);
})();

// 받는 쪽 팝업 — 갈색 / 연분홍
(function hookInviteModal() {
    const iv = setInterval(function () {
        if (typeof showDarkInviteModal !== 'function') return;
        if (showDarkInviteModal._show) { clearInterval(iv); return; }
        const _s = showDarkInviteModal;
        showDarkInviteModal = function (inv) {
            const p = inv ? party(inv.partyId) : null;
            if (!p || !p.talkShow) { restoreModal(); return _s.apply(this, arguments); }

            const love = (inv.kind === 'love');
            const ov = document.getElementById('dark-invite-overlay');
            if (!ov) return _s.apply(this, arguments);
            const box = ov.querySelector('.luxury-alert-box');
            const h3 = box ? box.querySelector('h3') : null;
            const txt = document.getElementById('dark-invite-text');
            const btns = box ? box.querySelectorAll('button') : [];

            if (box) {
                box.style.borderColor = love ? '#e8a0bb' : BROWN.line;
                box.style.background = love
                    ? 'linear-gradient(160deg,#fffafc,#ffe6ef)'
                    : 'linear-gradient(160deg,' + BROWN.panel + ',' + BROWN.deep + ')';
                box.style.boxShadow = love
                    ? '0 15px 40px rgba(232,160,187,0.35)'
                    : '0 15px 40px rgba(0,0,0,0.6), inset 0 0 24px rgba(0,0,0,0.5)';
            }
            if (h3) {
                h3.style.color = love ? '#c2557a' : BROWN.accent;
                h3.innerText = love ? '💕 러브레터' : '📺 브라운의 심야 토크 쇼';
            }
            if (txt) {
                txt.style.color = love ? '#5a2338' : BROWN.text;
                txt.innerHTML = love
                    ? ('<div style="font-size:15px; font-weight:bold; margin-bottom:10px;">💕</div>'
                       + '<div style="font-size:13px; line-height:1.9;">' + esc(inv.msg || '') + '</div>'
                       + '<div style="font-size:11px; color:#a8738a; margin-top:14px;">'
                       + esc(inv.fromName) + ' 사원이 보냈습니다.</div>')
                    : ('<div style="font-size:14px; font-weight:bold; line-height:1.9;">'
                       + '📺 심야 토크쇼로 당신을 초대합니다.</div>'
                       + '<div style="font-size:11px; color:#a08a68; margin-top:14px;">'
                       + esc(inv.fromName) + ' 사원이 보냈습니다.</div>');
            }
            for (let i = 0; i < btns.length; i++) {
                const on = btns[i].getAttribute('onclick') || '';
                if (on.indexOf('accept') >= 0) {
                    btns[i].innerText = '수락';
                    btns[i].style.background = love ? '#f2b8cd' : BROWN.accent;
                    btns[i].style.borderColor = love ? '#e8a0bb' : BROWN.line;
                    btns[i].style.color = love ? '#5a2338' : BROWN.deep;
                } else if (on.indexOf('reject') >= 0) {
                    btns[i].innerText = '거절';
                    btns[i].style.background = 'transparent';
                    btns[i].style.borderColor = love ? '#d9a6b8' : '#6a5436';
                    btns[i].style.color = love ? '#a8738a' : '#a08a68';
                }
            }
            ov.style.display = 'flex';
        };
        showDarkInviteModal._show = true;
        clearInterval(iv);
    }, 400);
})();

// 지금 어디에 있나 — 상담실·선녀탕·감금실에 있어도 초대할 수 있다
function whereTag(u) {
    if (!u) return '';
    if (typeof isQuarantined === 'function' && isQuarantined(u)) {
        if (u.quarantineHospital) return '· 입원 중';
        return ((u.quarantineDest || 'fox') === 'bath') ? '· 선녀탕' : '· 상담실';
    }
    const c = u.cage;
    if (c && c.by && c.at) {
        const cap = 12 * 3600 * 1000;
        const until = Math.min(c.until || 0, c.at + cap);
        if (Date.now() < until) return '· 감금실';
    }
    return '';
}

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// 다음 평범한 초대장이 갈색으로 남지 않게 되돌린다
function restoreModal() {
    const ov = document.getElementById('dark-invite-overlay');
    if (!ov) return;
    const box = ov.querySelector('.luxury-alert-box');
    if (box) {
        box.style.borderColor = '#7f0000';
        box.style.background = '';
        box.style.boxShadow = '0 15px 40px rgba(180,0,0,0.25), inset 0 0 20px rgba(0,0,0,0.8)';
    }
    const h3 = box ? box.querySelector('h3') : null;
    if (h3) { h3.style.color = '#ff6b6b'; h3.innerText = '🕯 어둠 탐사 동행 요청'; }
    const txt = document.getElementById('dark-invite-text');
    if (txt) txt.style.color = '#eee';
    const btns = box ? box.querySelectorAll('button') : [];
    for (let i = 0; i < btns.length; i++) {
        const on = btns[i].getAttribute('onclick') || '';
        if (on.indexOf('accept') >= 0) {
            btns[i].innerText = '동행';
            btns[i].style.background = '#7f0000';
            btns[i].style.borderColor = '#b71c1c';
            btns[i].style.color = '#fff';
        } else if (on.indexOf('reject') >= 0) {
            btns[i].innerText = '거절';
            btns[i].style.borderColor = '#888';
            btns[i].style.color = '#aaa';
        }
    }
}

// ==========================================
// 부활 횟수를 이어하기 너머로 들고 간다
// ==========================================
//
// ■ 무엇이 어긋나 있었나
//
//   부활 횟수는 darkRun._showRevives 에만 들어 있다. 그런데 이 값은
//   **화면 안에만 있는 것**이라, 탐사 기록을 저장하는 자리(index.html:1905)
//   에는 빠져 있다.
//
//   그래서 새로고침하거나 연결이 끊겼다가 「이어하기」로 돌아오면
//   darkRun 이 저장된 칸만으로 다시 지어지고 — **부활 두 번이 사라진다.**
//   돌아온 뒤 처음 죽는 자리에서 그대로 끝났다. 「부활이 안 된다」가 이것이다.
//
//   (재현: 출발 직후 2회 → 새로고침 → 이어하기 → 표 없음 → 첫 죽음에 사망)
//
// ■ 어떻게 고치나
//
//   남은 횟수를 탐사 기록 옆에 같이 적어 두고, 이어하기 때 도로 얹는다.
//   원래 저장 자리를 건드리지 않고 같은 칸에 두 글자만 더 적는다.
//
//   혹시 그마저도 비어 있으면 죽는 자리에서 다시 채운다 (위 darkDeath).
//   받을 몫을 못 받는 것보다는 낫다고 보았다.
let lastKept = null;

function runPath() {
    if (typeof database === 'undefined' || !database) return null;
    if (typeof currentUser === 'undefined' || !currentUser || !currentUser.code) return null;
    return 'darkRuns/' + currentUser.code;
}

function keepRevives() {
    try {
        if (typeof darkRun === 'undefined' || !darkRun || !darkRun._show) return;
        const path = runPath();
        if (!path) return;
        const n = Number(darkRun._showRevives || 0);
        if (lastKept === n) return;             // 바뀐 것이 없으면 쓰지 않는다
        lastKept = n;
        database.ref(path).update({ showRevives: n, show: true });
    } catch (e) { console.warn('[토크쇼] 부활 횟수 적기 건너뜀:', e && e.message); }
}

// 저장할 때마다 같이 적는다 (원래 저장이 통째 set 이라 뒤에 덧붙인다)
(function hookSave() {
    const iv = setInterval(function () {
        if (typeof saveDarkRunState !== 'function') return;
        if (saveDarkRunState._show) { clearInterval(iv); return; }
        const _s = saveDarkRunState;
        saveDarkRunState = function () {
            const r = _s.apply(this, arguments);
            lastKept = null;                    // 통째로 덮였으니 다시 적는다
            keepRevives();
            return r;
        };
        saveDarkRunState._show = true;
        clearInterval(iv);
    }, 500);
})();

// 이어하기 — 원본이 _pendingResume 을 비우기 전에 챙겨 둔다
(function hookResume() {
    const iv = setInterval(function () {
        if (typeof acceptDarkResume !== 'function') return;
        if (acceptDarkResume._show) { clearInterval(iv); return; }
        const _a = acceptDarkResume;
        acceptDarkResume = function () {
            const s = window._pendingResume;
            const r = _a.apply(this, arguments);
            try {
                if (!s || typeof darkRun === 'undefined' || !darkRun) return r;
                if (!s.show && !showOf()) return r;          // 토크쇼가 아니었다
                darkRun._show = true;
                darkRun._showRevives = (s.showRevives == null) ? REVIVES : Number(s.showRevives);
                lastKept = null;
                console.log('[토크쇼] 이어하기 — 남은 부활 ' + darkRun._showRevives + '회를 되살렸습니다.');
            } catch (e) { console.warn('[토크쇼] 이어하기 건너뜀:', e && e.message); }
            return r;
        };
        acceptDarkResume._show = true;
        clearInterval(iv);
        console.log('[토크쇼] 이어하기 연결 — 부활 횟수를 들고 간다');
    }, 500);
})();

// ==========================================
// 기능 4 — 판정 +1
// ==========================================
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._show) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        rollDarkBonus = function () {
            let b = _r.apply(this, arguments);
            try { if (showOf()) b += 1; } catch (e) { }
            return b;
        };
        rollDarkBonus._show = true;
        clearInterval(iv);
        console.log('[토크쇼] 판정 +1 연결');
    }, 400);
})();

// ==========================================
// 기능 4·5·7 — 부활 · 무대 열기 · 손가락 튕기기
// ==========================================
function snap() {
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ac = new AC();
        const n = ac.sampleRate * 0.09;
        const buf = ac.createBuffer(1, n, ac.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) {
            const t = i / n;
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 9);   // 짧고 탁한 소리
        }
        const src = ac.createBufferSource(); src.buffer = buf;
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = 2300; bp.Q.value = 1.1;
        const g = ac.createGain(); g.gain.value = 0.3;
        src.connect(bp); bp.connect(g); g.connect(ac.destination);
        src.start();
        setTimeout(function () { try { ac.close(); } catch (e) { } }, 500);
    } catch (e) { }
}

function bumpHeat(p, iAmHost) {
    if (typeof database === 'undefined' || !database || !p) return;
    database.ref('darkParties/' + p.id + '/heat')
        .transaction(function (v) { return (Number(v) || 0) + 1; }, null, false);
    if (iAmHost) database.ref('darkParties/' + p.id + '/hostDead').set(true);
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._show) { clearInterval(iv); return; }
        const _d = darkDeath;
        darkDeath = function (reasonText) {
            let p = null;
            try { p = showOf(); } catch (e) { }
            if (!p || typeof darkRun === 'undefined' || !darkRun) return _d.apply(this, arguments);

            // 기능 5 — 무대 열기는 죽을 때마다 쌓인다 (부활해도 쌓인다)
            try { bumpHeat(p, isHost(p)); } catch (e) { }

            // ★ 표가 아예 없으면 그 자리에서 채운다.
            //   darkRun 을 새로 짓는 길이 여럿이라(이어하기·epic·합류) 출발 때
            //   얹어 둔 표가 없어진 채로 여기 닿는 일이 있었다. 토크쇼 파티에
            //   있는 것이 분명하면 받을 몫은 받아야 한다.
            if (darkRun._showRevives == null) {
                darkRun._show = true;
                darkRun._showRevives = REVIVES;
                console.warn('[토크쇼] 부활 표가 없어 다시 채웠습니다 — ' + REVIVES + '회');
            }

            const left = Number(darkRun._showRevives || 0);
            if (left <= 0) return _d.apply(this, arguments);
            darkRun._showRevives = left - 1;
            keepRevives();                      // 남은 횟수를 적어 둔다

            // 기능 4·7 — 일어선다
            darkRun._dead = false;
            darkRun.fail = Math.max(0, (darkRun.fail || 0) - 1);
            snap();
            try {
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                    body.innerHTML = darkBox('📺',
                        reasonText + '<br><br>'
                        + '<span style="color:' + BROWN.accent + '; font-size:15px; font-weight:bold;">'
                        + '— 쇼는 아직 끝나지 않았습니다!</span><br>'
                        + '<span style="color:#a08a68;">손가락 튕기는 소리가 어딘가에서 들린다.<br>'
                        + '조명이 다시 들어온다. 남은 부활 ' + (left - 1) + '회.</span>',
                        darkChoiceBtn('일어선다.', 'renderDarkStep();'));
                    if (typeof mountDarkChat === 'function') mountDarkChat('normal');
                }
            } catch (e) { console.warn('[토크쇼] 부활 화면 건너뜀:', e && e.message); }
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(currentUser, '[토크쇼] 쇼는 아직 끝나지 않았습니다. (남은 부활 ' + (left - 1) + '회)');
            }
            return;
        };
        darkDeath._show = true;
        clearInterval(iv);
        console.log('[토크쇼] 부활 연결');
    }, 400);
})();

// ==========================================
// 기능 5·6 — 보너스 포인트 · 회수품 2배
// ==========================================
function multOf(p) {
    if (!p) return 1;
    const heat = Number(p.heat || 0);
    let m = 1 + HEAT_STEP * heat;
    if (p.hostDead) m *= HOST_MULT;
    return Math.min(MAX_MULT, m);
}

let lootBoost = false;          // renderDarkResult 가 도는 동안만 켠다
let lootBoostWas = false;       // 알림에 적으려고 남겨 둔다
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function') return;
        if (emLootMult._show) { clearInterval(iv); return; }
        const _e = emLootMult;
        const wrapped = function (u) {
            let v = _e.apply(this, arguments) || 1;
            if (lootBoost) v *= 2;                  // 기능 6
            return v;
        };
        wrapped._show = true;
        window.emLootMult = wrapped;
        clearInterval(iv);
    }, 400);
})();

(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._show) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        renderDarkResult = function () {
            let p = null, hostAlive = false, mine = false;
            try {
                p = showOf();
                if (p) {
                    const alive = p.alive || {};
                    hostAlive = !!alive[p.talkShow.by];
                    mine = !(darkRun && darkRun._dead);
                }
            } catch (e) { }

            // 기능 6 — 사회자와 함께 끝까지 살아남았을 때만
            lootBoost = !!(p && hostAlive && mine);
            const before = currentUser ? (currentUser.points || 0) : 0;
            lootBoostWas = lootBoost;
            let r;
            try { r = _r.apply(this, arguments); }
            finally { lootBoost = false; }

            try {
                if (!p || !currentUser) return r;
                const m = multOf(p);
                const got = (currentUser.points || 0) - before;
                if (m > 1 && got > 0) {
                    const extra = Math.round(got * (m - 1));
                    currentUser.points += extra;
                    if (typeof addHistoryLog === 'function') {
                        addHistoryLog(currentUser, '[토크쇼] 무대 열기 ' + Number(p.heat || 0) + '단'
                            + (p.hostDead ? ' · 사회자 피날레' : '')
                            + ' — 보너스 ×' + m.toFixed(1) + ' (+' + extra.toLocaleString() + ' P)');
                    }
                    if (typeof saveSelfFull === 'function') saveSelfFull();
                    setTimeout(function () {
                        showCustomAlert('📺 무대 열기 ' + Number(p.heat || 0) + '단'
                            + (p.hostDead ? '\n사회자가 피날레를 장식했습니다.' : '')
                            + '\n\n보너스 ×' + m.toFixed(1) + '\n+' + extra.toLocaleString() + ' P'
                            + (lootBoostWas ? '\n\n회수품 확률 2배가 걸렸습니다.' : ''));
                    }, 900);
                }
            } catch (e) { console.warn('[토크쇼] 보너스 건너뜀:', e && e.message); }
            return r;
        };
        renderDarkResult._show = true;
        clearInterval(iv);
        console.log('[토크쇼] 보너스·회수품 연결');
    }, 400);
})();

// ==========================================
// 갈색 민무늬 화면 + 올라오는 😊 📺
// ==========================================
const CSS_ID = 'talkshow-style';
let themeOn = false, bubbleTimer = null;

// ★ 색은 inline 으로 얹지 않고 **스타일 규칙**으로 건다.
//
//   처음에는 body.style.setProperty 로 얹고, 지워지면 타이머로 다시 얹었다.
//   그런데 skin.js 의 applyUiSkin 은 updateUI 마다 돌고, 벽지가 없으면
//   clearUiSkin 이 body 의 inline 속성을 통째로 걷어 낸다(skin.js:441).
//   그래서 「걷히고 → 다시 얹히고」가 되풀이되며 화면이 깜박였다.
//   글자와 버튼 색이 변수에서 오므로, 변수가 없는 동안 글씨가 사라진 것처럼
//   보였다.
//
//   규칙으로 걸면 걷어 갈 inline 속성이 없다. 다시 얹을 일도 없으니
//   깜박이지 않는다. skin.js 가 쇼가 도는 동안 손대지 않도록 눕혀 두기도 한다.
// ★ 갈색 화면은 **벽지(skin.js)의 기계를 그대로 빌려 쓴다.**
//
//   처음에는 여기서 --sk-* · --theme-* 변수만 바꾸는 규칙을 넣었다. 그런데
//   그 변수들을 읽는 자리가 없었다.
//       index.html 에서 var(--sk-*)    0 번
//       index.html 에서 var(--theme-*) 45 번이지만 어디에도 정의되어 있지 않다
//   실제로 화면을 칠하는 것은 skin.js 의 injectSkinStyle() 이 넣는 규칙이고,
//   그 규칙은 body[data-ui-skin] 안에서만 산다. 그래서 변수만 바꾸면
//   아무 일도 일어나지 않았다 — 구역 이름만 바뀌고 색은 그대로였다.
//
//   그러니 벽지 한 벌을 만들어 applyUiSkin 에 그대로 넘긴다. 그러면 사원이
//   벽지를 썼을 때와 똑같은 범위가 칠해진다.
const BROWN_SKIN = {
    palette: '브라운의 심야',
    light: false,
    base:   BROWN.base,
    panel:  BROWN.panel,
    accent: BROWN.accent,
    text:   BROWN.text,
    pattern: 2,                 // 아르데코 — 무대 조명처럼 퍼진다
    font: 'Gowun Batang',
    name: '브라운의 심야 토크 쇼',
    since: 0
};

function injectCss() {
    let st = document.getElementById(CSS_ID);
    if (st) return;
    st = document.createElement('style');
    st.id = CSS_ID;
    const v = {
        '--theme-focus': BROWN.accent, '--theme-accent': BROWN.accent,
        '--theme-border': BROWN.line, '--theme-text': BROWN.text,
        '--theme-sub': BROWN.accent + 'aa',
        '--theme-bg-grad': 'linear-gradient(160deg,' + BROWN.base + ',' + BROWN.deep + ')',
        '--sk-accent': BROWN.accent, '--sk-base': BROWN.base, '--sk-panel': BROWN.panel,
        '--sk-text': BROWN.text, '--sk-text-dim': BROWN.accent + 'cc',
        '--sk-card': BROWN.panel, '--sk-well': BROWN.deep, '--sk-tab': BROWN.panel,
        '--sk-edge': BROWN.line, '--sk-edge-soft': BROWN.line + '88', '--sk-line': BROWN.line + '66',
        '--sk-accent-text': BROWN.deep, '--sk-accent-on-base': BROWN.accent,
        '--sk-accent-deep': '#8a6b3a', '--sk-btn-top': BROWN.panel, '--sk-press-top': BROWN.deep,
        '--sk-press-bot': BROWN.base, '--sk-glint': BROWN.accent + '33',
        '--sk-halo': BROWN.accent + '22', '--sk-shadow': 'rgba(0,0,0,.6)'
    };
    const vars = Object.keys(v).map(function (k) { return k + ':' + v[k] + ' !important;'; }).join('');
    st.textContent =
        'body.talkshow-on{' + vars
      + 'background-color:' + BROWN.base + ' !important;background-image:none !important;}'
      + 'body.talkshow-on .container{background-color:' + BROWN.base
      + ' !important;background-image:none !important;}'
      + '#talkshow-bubbles{position:fixed;left:0;right:0;bottom:0;top:0;pointer-events:none;z-index:9998;overflow:hidden}'
      + '#talkshow-bubbles span{position:absolute;bottom:-40px;font-size:20px;opacity:0;'
      + 'animation:tsRise 9s linear forwards;will-change:transform,opacity}'
      + '@keyframes tsRise{0%{opacity:0;transform:translateY(0) translateX(0)}'
      + '12%{opacity:.5}70%{opacity:.35}100%{opacity:0;transform:translateY(-104vh) translateX(var(--tsx,0px))}}';
    document.head.appendChild(st);
}

// 쇼가 도는 동안에는 skin.js 가 body 를 건드리지 않게 눕힌다.
// 눕히지 않으면 벽지를 쓰는 사원은 inline !important 가 규칙을 이겨 버린다.
let skinHeld = null;
function holdSkin(on) {
    if (on) {
        if (skinHeld) return;
        skinHeld = {
            apply: (typeof applyUiSkin === 'function') ? applyUiSkin : null,
            clear: (typeof clearUiSkin === 'function') ? clearUiSkin : null
        };
        // 쓰던 벽지의 inline 속성을 한 번 걷어 낸다 — 그래야 규칙이 보인다
        try { if (skinHeld.clear) skinHeld.clear(currentUser); } catch (e) { }
        if (skinHeld.apply) applyUiSkin = function () { };
        if (skinHeld.clear) clearUiSkin = function () { };
    } else {
        if (!skinHeld) return;
        if (skinHeld.apply) applyUiSkin = skinHeld.apply;
        if (skinHeld.clear) clearUiSkin = skinHeld.clear;
        const h = skinHeld; skinHeld = null;
        try { if (h.apply) h.apply(currentUser); else if (h.clear) h.clear(currentUser); } catch (e) { }
    }
}

// 갈색 벽지를 입힌다 — skin.js 의 applyUiSkin 에 가짜 사원을 하나 넘긴다.
// holdSkin(true) 가 전역 applyUiSkin 을 눕혀 두었으므로 넣어 둔 원본을 쓴다.
function wearBrown() {
    const real = (skinHeld && skinHeld.apply) ? skinHeld.apply
               : ((typeof applyUiSkin === 'function') ? applyUiSkin : null);
    if (!real) { console.warn('[토크쇼] skin.js 가 없어 갈색 화면을 못 입혔습니다.'); return; }
    try { real({ uiSkin: BROWN_SKIN }); }
    catch (e) { console.warn('[토크쇼] 갈색 화면 입히기 건너뜀:', e && e.message); }
}

function bubbles(on) {
    let box = document.getElementById('talkshow-bubbles');
    if (!on) {
        if (bubbleTimer) { clearInterval(bubbleTimer); bubbleTimer = null; }
        if (box) box.remove();
        return;
    }
    if (!box) {
        box = document.createElement('div');
        box.id = 'talkshow-bubbles';
        document.body.appendChild(box);
    }
    if (bubbleTimer) return;
    bubbleTimer = setInterval(function () {
        const b = document.getElementById('talkshow-bubbles');
        if (!b) return;
        if (b.childElementCount > 7) return;             // 너무 많이는 아니고
        const s = document.createElement('span');
        s.textContent = (Math.random() < 0.5) ? '😊' : '📺';
        s.style.left = (6 + Math.random() * 88) + 'vw';
        s.style.fontSize = (15 + Math.random() * 10) + 'px';
        s.style.setProperty('--tsx', (Math.random() * 40 - 20) + 'px');
        s.style.animationDuration = (8 + Math.random() * 4) + 's';
        b.appendChild(s);
        setTimeout(function () { try { s.remove(); } catch (e) { } }, 13000);
    }, 1900);
}

// 바뀔 때만 손댄다. 돌고 있는 동안에는 아무것도 다시 얹지 않는다 — 그게 깜박임이었다.
function paintTheme() {
    const on = !!showOf();
    if (on === themeOn) return;
    themeOn = on;
    if (on) {
        injectCss();
        holdSkin(true);                     // 원래 applyUiSkin 을 skinHeld 에 넣어 둔다
        document.body.classList.add('talkshow-on');
        wearBrown();                        // 벽지 기계로 실제 색을 칠한다
        bubbles(true);
        console.log('[토크쇼] 갈색 화면을 켰습니다');
    } else {
        bubbles(false);
        document.body.classList.remove('talkshow-on');
        holdSkin(false);                    // 쓰던 벽지(또는 민낯)로 돌려놓는다
        console.log('[토크쇼] 갈색 화면을 껐습니다');
    }
}
// ==========================================
// 그 방의 어둠 이름을 바꾼다
// ==========================================
//
// 어둠 이름은 어디서나 DARK_ZONES[구역].name 을 읽어 쓴다 (목록·대기실·
// 초대장·탐사 화면·기록까지 열 군데가 넘는다). 그 자리를 하나하나 고치는
// 대신 이름 한 칸만 바꾼다. 한 구역에는 파티가 하나뿐이라(isZoneTaken)
// 남의 방 이름이 같이 바뀔 일이 없다.
//
// 내용은 건드리지 않는다 — 들머리 글도, 사건도, 등급도 그대로다.
// 착용자가 리더가 아니게 되면 이름도 돌려놓는다.
let zoneNamed = null;                 // { code, was }
function paintZoneName() {
    let want = null;
    try {
        const p = showOf();
        // 「착용자가 리더인 방」일 때만
        if (p && p.talkShow && p.talkShow.by && p.leader === p.talkShow.by) want = p.zone;
    } catch (e) { }

    if (zoneNamed && zoneNamed.code !== want) {
        if (typeof DARK_ZONES !== 'undefined' && DARK_ZONES[zoneNamed.code]) {
            DARK_ZONES[zoneNamed.code].name = zoneNamed.was;     // 돌려놓는다
        }
        zoneNamed = null;
        nudge();
    }
    if (!want || zoneNamed) return;
    if (typeof DARK_ZONES === 'undefined' || !DARK_ZONES[want]) return;
    if (DARK_ZONES[want].name === ZONE_TITLE) return;
    zoneNamed = { code: want, was: DARK_ZONES[want].name };
    DARK_ZONES[want].name = ZONE_TITLE;
    nudge();
    console.log('[토크쇼] ' + want + ' 의 어둠 이름을 「' + ZONE_TITLE + '」로 바꿨습니다');
}
function nudge() {
    try {
        const el = document.getElementById('dark-party');
        if (el && el.classList.contains('active') && typeof renderPartyPanel === 'function') renderPartyPanel();
        else if (typeof renderDarkZones === 'function') renderDarkZones();
    } catch (e) { }
}
window.showZoneName = function () {
    console.log('[토크쇼] 이름 바꾼 구역:', zoneNamed ? (zoneNamed.code + ' (원래 ' + zoneNamed.was + ')') : '없음');
};

setInterval(function () {
    try { paintTheme(); } catch (e) { }
    try { paintZoneName(); } catch (e) { }
}, 1500);

window.showTheme = function (on) {
    if (on === false) {
        bubbles(false);
        document.body.classList.remove('talkshow-on');
        holdSkin(false);
        themeOn = false;
        console.log('[토크쇼] 되돌렸습니다.');
        return;
    }
    injectCss(); holdSkin(true);
    document.body.classList.add('talkshow-on');
    wearBrown();
    bubbles(true); themeOn = true;
    console.log('[토크쇼] 눌러 봤습니다. showTheme(false) 로 되돌립니다.');
};

// ==========================================
// epic 쪽에서도 쓸 수 있게 창구를 연다 (epic-show.js)
// ==========================================
//
// epic 어둠은 제 darkRun 을 따로 짓고 제 사망·정산을 쓴다. 그래서 여기서
// 해 둔 것들이 그쪽에는 닿지 않는다. 같은 셈을 두 번 적지 않도록
// 쓰던 것을 그대로 내어 준다.
window.talkShowOf = showOf;
window.talkShowMult = multOf;
window.talkShowIsHost = isHost;
window.talkShowBumpHeat = bumpHeat;
window.talkShowSnap = snap;
window.TALK_SHOW_REVIVES = REVIVES;

// ==========================================
// 확인 · 지급
// ==========================================
window.showState = function () {
    console.log('%c===== 📺 브라운의 심야 토크 쇼 =====', 'color:#c79a5b; font-size:13px');
    const p = showOf();
    console.log('  차고 있나:', (currentUser && has(currentUser, SHOW)) ? 'O' : '✗');
    console.log('  지금 토크쇼에 있나:', p ? ('O — 사회자 ' + p.talkShow.name) : '✗');
    if (p) {
        console.log('  내가 사회자인가:', isHost(p) ? 'O' : '✗');
        const g = guestOf[p.talkShow.by] || {};
        console.log('  이 파티의 초대장:', Object.keys(p.invited || {}).length + '명');
        console.log('  사회자에게 남은 기운:', Object.keys(g).length + '명 (파티를 나가도 남는다)');
        console.log('  무대 열기:', Number(p.heat || 0) + '단',
            p.hostDead ? '· 사회자 피날레' : '', '→ 보너스 ×' + multOf(p).toFixed(1));
        if (typeof darkRun !== 'undefined' && darkRun) {
            console.log('  남은 부활:', (darkRun._showRevives == null ? '-' : darkRun._showRevives) + '회');
        }
    }
    const hooks = {
        createParty: typeof createParty === 'function' && !!createParty._show,
        joinParty: typeof joinParty === 'function' && !!joinParty._show,
        launchPartyRun: typeof launchPartyRun === 'function' && !!launchPartyRun._show,
        darkDeath: typeof darkDeath === 'function' && !!darkDeath._show,
        rollDarkBonus: typeof rollDarkBonus === 'function' && !!rollDarkBonus._show,
        renderDarkResult: typeof renderDarkResult === 'function' && !!renderDarkResult._show,
        marketSellable: typeof marketSellable === 'function' && !!marketSellable._showHide,
        초대화면: typeof openInviteSelect === 'function' && !!openInviteSelect._show,
        초대팝업: typeof showDarkInviteModal === 'function' && !!showDarkInviteModal._show
    };
    console.log('  연결 안 된 것:',
        Object.keys(hooks).filter(function (k) { return !hooks[k]; }).join(', ') || '없음 (전부 연결)');
    console.log('  부활', REVIVES + '회 · 판정 +1 · 열기 1단마다 +'
        + (HEAT_STEP * 100) + '% · 사회자 사망 ×' + HOST_MULT + ' · 뚜껑 ×' + MAX_MULT);
};

window.showGive = function (who, n) {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, n || 1));
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < q; i++) u.inventory.push(SHOW);
    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[당국 개입] ' + SHOW + ' 지급');
    if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    }
    console.log('%c✓ ' + u.name + ' 사원에게 ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

console.log('[토크쇼] showState() · showGive(사번) · showTheme()');

})();
