// ==========================================
// ★ 🧧 지산의 복 : 대리자 — 상담사 지급 전용
// bundles.json 마지막 묶음, babyfox.js 보다 뒤 (맨 끝)
// ==========================================
//
//   충청남도 아산시 ■■리 지산 마을 출신의 사원이 들고 다니는 둥그런 뽑기
//   통. 그 안에 뭐가 들어 있을지는 모른다.
//
//   은심장 · 호사수구 · K.LEE · 아기 여우와 같은 결이다. 어느 상점에도
//   안 깔리고 팔 수도 없다. 주는 법은 jisanGive(사번) 과 당국 화면의
//   「물품 강제 꽂기」뿐이다.
//
// ■ 다섯 가지
//
//   ① 지산의 복 받으세요!
//      장착자가 어둠에서 죽을 때(오염도로 죽는 것 포함) **파티원 하나가
//      대신 죽는다.** 장착자는 그대로 어둠에서 나오고, 그 구역 몫의
//      1.5 ~ 2.5 배를 받는다. 대신 죽은 사람은 그 구역 회수품을 **전부**
//      받는다 (빛 부속성으로 적어 둔 것은 뺀다).
//      혼자 들어갔으면 대신 죽을 사람이 없다 — 그때는 장착자가 회수품만
//      전부 받고 죽음은 그대로 간다.
//      걸린 사람에게는 [ 오셨구나, 지산의 복! ] 이 뜨고, 30초 동안
//      화면 위아래로 띠 문구가 흐른다.
//
//      ★ 누가 대신 갈지는 **죽는 그 자리에서 고른다.** 죽음이 닿는 순간
//        장착자 화면에만 창이 뜨고, 그 방에 살아 있는 사람이 줄지어
//        나온다. 하나를 누르면 그 사람이 간다. 고르기 전에는 아무것도
//        일어나지 않으므로 창에는 닫는 단추가 없다.
//        고른 사람 쪽에는 **늘 하던 [ 오셨구나, 지산의 복! ] 만** 뜬다 —
//        제가 지목된 줄은 모르고, 그쪽 기록에도 지목은 한 글자도 안 적는다.
//        (예전에는 ③ 의 황금 막대를 건넨 사람이 대리자였다. 막대는 이제
//        공용시설 행운 쪽 일만 한다.)
//
//   ② 세상 진리로부터 해방되게 하소서
//      탐사 선택지에서 **죽을 길이 보인다** (☠ 가 붙는다). 그 길을 잡고도
//      살아 돌아오면 그 탐사의 포인트를 세 배로 받는다.
//
//   ③ 황금빛 수탉
//      장착자는 황금 막대를 가진다. 하루 두 번 남에게(또는 제게) 줄 수
//      있다. 막대를 받은 사람은 공용시설 행운이 크게 오르고, 대신
//      **공용시설을 한 번 쓸 때마다 오염도가 15 씩 오른다 — 동결과
//      무관하게.** 슬롯에서 연달아 세 번 꽝이 나면 그 뒤 열 판은 꽝이
//      나오지 않는다. 자정이 지나면 막대는 사라진다.
//
//   ④ 잊은 자야 사라져라
//      장착칸의 [제물] 에서 하루 세 사람까지 미리 찍어 둔다. 찍힌 사람이
//      상담실에 들어가 있는 동안, 그 시간만큼 장착자에게 포인트가 들어온다
//      — **한 사람에 시간당 20,000 P** (3분마다 1,000 P 씩 · 다 합쳐 5만까지).
//      (2026-10-18 · 전에는 10분마다 600 P — 시간당 3,600 P 였다)
//
//   ⑤ 지산의 복이시여 대리자여
//      ■■의 ■■■ 탐사에는 한 번에 25,000 P 라는 천장이 있다 (epic.js).
//      장착자에게는 그 천장이 없다 — 쌓은 그대로 들고 나온다.
//
// ■ 빛 부속성 회수품
//
//   회수품 자료에는 이름과 확률뿐이고 (dark.js DARK_LOOT_BY_ZONE) 속성을
//   적는 칸이 없다. 그래서 ① 에서 뺄 것을 아래 LIGHT 에 이름으로 적어
//   둔다. 빛 부속성이 자료에 생기면 그때 이 목록 대신 그 칸을 보면 된다.
//
// ■ 적히는 자리
//
//   u.jisanDay      하루가 바뀌었나
//   u.jisanRod      { by, byName, at, miss, safe }   받은 황금 막대
//   u.jisanRodGave  오늘 막대를 몇 번 주었나
//                   ★ ① 에서 대신 갈 사람은 어디에도 안 적는다 — 죽는 그
//                     자리에서 고르고, 고른 결과는 방 쪽(darkParties)에만
//                     남는다. (예전의 u.jisanMark 는 더 쓰지 않는다.)
//   u.jisanSac      { 사번: { at, paid } }           찍어 둔 제물과 받은 몫
//   u.jisanTruth    이번 탐사에서 죽을 길을 잡았나
//   darkParties/<방>/jisan/<사번> = { by, byName, at, zone }
//
//   ★ 남의 글은 통째로 덮지 않는다. 자식 길로만 쓴다.
//
// ■ 콘솔
//   jisanGive(사번)   상담사가 하나 준다
//   jisanState(사번)  지금 무엇이 걸려 있나
//   jisanRod(사번)    황금 막대를 준다 (장착자)
//   jisanSacList()    찍어 둔 제물
//   jisanBand()       띠 문구를 한 번 띄워 본다 (확인용)

const JISAN = {
    NAME:       '🧧 지산의 복 : 대리자',
    ROD_NOTE:   '[🏷 지산의 복 오셨다!]',
    POLL_NOTE:  '[성내고 욕하는 것은 부정 탄다]',
    BAND:       '산산백지산복주시옵게대리자야',
    BAND_MS:    30000,          // ① 띠 문구가 흐르는 시간
    PAY_LO:     1.5,            // ① 대신 죽었을 때 받는 몫 (구역 몫의 배수)
    PAY_HI:     2.5,
    TRUTH_MULT: 3,             // ② 죽을 길을 잡고 살아 돌아왔을 때
    ROD_DAY:    2,             // ③ 막대를 하루에 몇 번 주나
    ROD_LUCK:   6,             // ③ 막대를 쥔 사람의 공용시설 행운 배수
    ROD_POLL:   15,            // ③ 공용시설 한 번에 오르는 오염도 (동결 무관)
    ROD_MISS:   3,             // ③ 연달아 몇 번 꽝이면
    ROD_SAFE:   10,            // ③ 그 뒤 몇 판을 꽝 없이 가나
    SAC_DAY:    3,             // ④ 하루에 찍을 제물 수
    SAC_CAP:    50000,         // ④ 제물에게서 받을 수 있는 몫의 천장
    SAC_HOUR:   20000,         // ④ 제물 한 사람이 상담실에 있는 한 시간마다
    SAC_STEP:   3,             // ④ 몇 분마다 한 번 주나 (20,000 ÷ 60 × 3 = 1,000 P)
    EPIC_CAP:   25000,         // ⑤ epic.js:655 의 천장
    // ① 에서 뺄 회수품 — 빛 부속성으로 치는 것들. 자료에 속성 칸이
    //    생기기 전까지는 여기에 이름으로 적어 둔다.
    LIGHT: ['각성 돌파권']
};

(function jisanLuck() {

const NAME = JISAN.NAME;
const ADMIN = 'kario0987';
const MOD = 'jisan-modal';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code !== ADMIN; });
}
function userOf(code) {
    if (typeof db === 'undefined' || !db.users) return null;
    return db.users[code] || null;
}
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function find(who) {
    if (!who) return u_();
    return users().filter(function (x) {
        return x.code === who || x.no === who || x.name === who;
    })[0] || null;
}
function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
window.jisanWears = wears;

function save(fields) {
    try { if (typeof saveFields === 'function') saveFields(fields); } catch (e) { }
}
function patch(code, path, val) {
    const d = db_();
    if (!d || !code) return;
    try {
        if (val === null) d.ref('users/' + code + '/' + path).remove().catch(function () { });
        else d.ref('users/' + code + '/' + path).set(val).catch(function () { });
    } catch (e) { }
}

// 하루가 바뀌면 — 막대도 제물도 비운다
function dayRoll(u) {
    if (!u || u.jisanDay === today()) return false;
    u.jisanDay = today();
    u.jisanRodGave = 0;
    u.jisanSac = {};
    if (u.jisanRod) {
        cutNote(u, JISAN.ROD_NOTE);
        cutNote(u, JISAN.POLL_NOTE);
        u.jisanRod = null;
    }
    save({ jisanDay: 1, jisanRodGave: 1, jisanSac: 1, jisanRod: 1, badge: 1 });
    return true;
}

// ==========================================
// 특이사항 — ' | ' 까지 끊는다 (호사수구·아기 여우와 같은 사정)
// ==========================================
function badgeKey(u) {
    if (!u || !u.badge || typeof u.badge !== 'object') return 'notes';
    if (typeof u.badge.notes === 'string') return 'notes';
    if (typeof u.badge.note === 'string') return 'note';
    return 'notes';
}
function cutNote(u, line) {
    if (!u || !u.badge || !line) return false;
    const obj = (typeof u.badge === 'object');
    const key = obj ? badgeKey(u) : null;
    const raw = String(obj ? (u.badge[key] || '') : u.badge);
    if (raw.indexOf(line) < 0) return false;
    const bar = raw.indexOf('|') >= 0;
    const br = /<br\s*\/?>/i.test(raw);
    const keep = raw.split(/\s*\|\s*|<br\s*\/?>|\n/)
        .filter(function (x) { return x && x.indexOf(line) < 0; });
    const out = keep.join(bar ? ' | ' : (br ? '<br>' : '\n')) || '특이사항 없음';
    if (obj) u.badge[key] = out; else u.badge = out;
    return true;
}
function addNote(u, line) {
    try {
        if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, line);
    } catch (e) { }
}
// note-fix.js 가 묵은 줄을 가릴 때 쓴다
window.jisanNoteLive = function (u, note) {
    try {
        const t = String(note || '');
        if (t.indexOf(JISAN.ROD_NOTE) < 0 && t.indexOf(JISAN.POLL_NOTE) < 0) return true;
        return !!(u && u.jisanRod && u.jisanRod.at);
    } catch (e) { return true; }
};

// ==========================================
// 물품 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (ITEM_CATALOG[NAME]) { clearInterval(iv); return; }
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false,
            effect: 'equip_jisan', noSell: true,
            desc: '[장착] 충청남도 아산시 ■■리 지산 마을 출신의 사원이 들고 다니는 둥그런 뽑기 통. '
                + '그 안에 뭐가 들어 있을지는 모른다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) {
            NO_SELL_ITEMS.push(NAME);
        }
        clearInterval(iv);
        console.log('[지산] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._jisan) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () {
            const pool = _m.apply(this, arguments);
            if (!Array.isArray(pool)) return pool;
            return pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; });
        };
        w._jisan = true;
        marketSellable = w; window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._jisan) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) {
                alert_('격리 중에는 장착할 수 없습니다.'); return;
            }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
            if (me.equippedWeapons.length >= 12) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
            dayRoll(me);
            addNote(me, '[장착됨] ' + NAME);
            log_(me, '[' + NAME + '] 장착했습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(NAME + '\n\n통을 흔들면 안에서 무언가가 굴러다닙니다.\n'
                + '장착칸의 [제물] 로 엽니다.');
        };
        useInventoryItem._jisan = true;
        clearInterval(iv);
        console.log('[지산] 장착 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 띠 문구 — 30초 동안 위아래로 흐른다
// ==========================================
(function bandCss() {
    const iv = setInterval(function () {
        if (!document.head) return;
        if (document.getElementById('jisan-band-css')) { clearInterval(iv); return; }
        const s = document.createElement('style');
        s.id = 'jisan-band-css';
        s.textContent =
            '.jisan-band{position:fixed;left:0;right:0;z-index:999998;overflow:hidden;'
            + 'background:linear-gradient(90deg,#4a0d0d,#8a1414,#4a0d0d);'
            + 'border-top:1px solid #d9a05a;border-bottom:1px solid #d9a05a;'
            + 'height:30px;display:flex;align-items:center;pointer-events:none;}'
            + '.jisan-band.top{top:0;}.jisan-band.bot{bottom:0;}'
            + '.jisan-band span{display:inline-block;white-space:nowrap;'
            + 'font-size:13px;font-weight:bold;color:#ffe6a8;letter-spacing:2px;'
            + 'text-shadow:0 0 6px rgba(255,180,80,0.7);'
            + 'animation:jisanRun 9s linear infinite;}'
            + '.jisan-band.bot span{animation-direction:reverse;}'
            + '@keyframes jisanRun{from{transform:translateX(0);}to{transform:translateX(-50%);}}';
        document.head.appendChild(s);
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 20000);
})();

window.jisanBand = function (ms) {
    const txt = (JISAN.BAND + ' ').repeat(24);
    ['top', 'bot'].forEach(function (k) {
        const old = document.querySelector('.jisan-band.' + k);
        if (old) old.remove();
        const d = document.createElement('div');
        d.className = 'jisan-band ' + k;
        d.innerHTML = '<span>' + esc(txt) + '</span>';
        document.body.appendChild(d);
    });
    setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll('.jisan-band'),
            function (x) { x.remove(); });
    }, ms || JISAN.BAND_MS);
    try { if (typeof pushNotice === 'function') pushNotice('🧧 ' + JISAN.BAND); } catch (e) { }
};

// ==========================================
// ① 지산의 복 받으세요! — 대신 죽는다
// ==========================================
function zonePay(zone) {
    let lo = 300, hi = 3000;
    try {
        const z = (typeof DARK_ZONES !== 'undefined') ? DARK_ZONES[zone] : null;
        if (z && Array.isArray(z.reward)) { lo = z.reward[0]; hi = z.reward[1]; }
    } catch (e) { }
    const base = (lo + hi) / 2;
    const k = JISAN.PAY_LO + Math.random() * (JISAN.PAY_HI - JISAN.PAY_LO);
    return { pay: Math.max(100, Math.round(base * k)), k: k };
}

// 그 구역 회수품을 전부 — 빛 부속성으로 적어 둔 것은 뺀다
function allLoot(zone) {
    let list = [];
    try {
        if (typeof DARK_LOOT_BY_ZONE !== 'undefined') list = DARK_LOOT_BY_ZONE[zone] || [];
    } catch (e) { }
    return list.map(function (l) { return l && l.name; })
        .filter(function (n) { return n && JISAN.LIGHT.indexOf(n) < 0; });
}
function giveLoot(u, zone) {
    const got = allLoot(zone);
    if (!got.length) return [];
    if (!Array.isArray(u.inventory)) u.inventory = [];
    got.forEach(function (n) { u.inventory.push(n); });
    return got;
}

// 파티에서 나 말고 살아 있는 사람
function aliveMates() {
    const r = run();
    const me = u_();
    if (!r || !r.isParty || !r.partyId || !me) return [];
    let p = null;
    try { p = (typeof darkParties !== 'undefined') ? darkParties[r.partyId] : null; } catch (e) { }
    if (!p) return [];
    const alive = p.alive || {};
    const gone = (p.jisan || {});
    return Object.keys(p.members || {}).filter(function (c) {
        if (c === me.code) return false;
        if (gone[c]) return false;                 // 이미 대신 죽은 사람
        return alive[c] !== undefined ? !!alive[c] : true;
    });
}

// 대신 갈 사람을 고른다 — 죽음이 닿은 그 자리에서
//
//   ★ 닫는 단추를 두지 않는다. 이 창이 뜬 때는 죽음을 이미 멈춰 세운
//     뒤라서(r._dead = false · 원본 darkDeath 를 안 부른다), 고르지 않고
//     빠져나가면 아무도 안 가고 장착자도 안 죽는 어정쩡한 자리가 된다.
function askWho(mates, zone, r, me) {
    const rows = mates.map(function (c) {
        return '<button class="game-btn js-pick" data-c="' + esc(c) + '" style="' + BTN + '">'
            + '<div style="font-size:12px; color:#e6ddd0;">' + esc(nameOf(c)) + ' 사원</div>'
            + '<div style="font-size:9px; color:#6b6257; margin-top:2px;">'
            + '통이 이 사람 쪽으로 돌아앉습니다.</div></button>';
    }).join('');
    const w = box(head('[ 오셨구나, 지산의 복! ]',
        '통이 흔들립니다. 당신이 갈 자리입니다.<br>'
        + '<b style="color:#ffcf8f;">대신 갈 사람을 고르십시오.</b><br>'
        + '고른 사람은 제가 지목된 줄 모릅니다.')
        + '<div style="' + SCROLL + '">' + rows + '</div>');
    Array.prototype.forEach.call(w.querySelectorAll('.js-pick'), function (b) {
        b.onclick = function () {
            shut();
            try { goSub(b.dataset.c, zone, r, me); }
            catch (e) { console.warn('[지산] 대신 보내기:', e && e.message); }
        };
    });
}

// 고른 사람을 보낸다 — 방에 적고, 장착자는 몫을 받고 걸어 나온다
function goSub(pick, zone, r, me) {
    const d = db_();
    try {
        if (d && r && r.partyId) d.ref('darkParties/' + r.partyId + '/jisan/' + pick).set({
            by: me.code, byName: me.name, at: Date.now(), zone: zone
        });
    } catch (e) { }
    const g = zonePay(zone);
    try { if (typeof changePoints === 'function') changePoints(g.pay); }
    catch (e) { me.points = (me.points || 0) + g.pay; }
    log_(me, '[' + NAME + '] ' + nameOf(pick) + ' 사원이 대신 갔습니다 (+'
        + g.pay.toLocaleString() + ' P)');
    try {
        if (r.isParty && typeof sendPartyChat === 'function') {
            sendPartyChat('통이 흔들렸습니다. 무언가가 굴러 나왔습니다.', true);
        }
    } catch (e) { }
    r._dead = false;
    alert_('[ 오셨구나, 지산의 복! ]\n\n'
        + nameOf(pick) + ' 사원이 대신 갔습니다.\n'
        + '당신은 그대로 걸어 나옵니다.\n\n'
        + '+' + g.pay.toLocaleString() + ' P ('
        + g.k.toFixed(2) + '배)');
    window.jisanBand();
    try { if (typeof finishDarkRun === 'function') finishDarkRun(); } catch (e) { }
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._jisan) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            try {
                const me = u_();
                const r = run();
                if (me && r && wears(me) && !r._jisanUsed) {
                    const zone = r.zone;
                    const mates = aliveMates();
                    if (mates.length) {
                        // 죽음은 여기서 멈추고, 대신 갈 사람은 지금 고른다
                        r._jisanUsed = true;
                        r._dead = false;
                        askWho(mates, zone, r, me);
                        return;
                    }
                    // 혼자 들어왔다 — 회수품만 전부 받고 죽음은 그대로
                    r._jisanUsed = true;
                    const got = giveLoot(me, zone);
                    if (got.length) {
                        log_(me, '[' + NAME + '] 혼자였습니다 — 회수품 ' + got.length + '종');
                        save({ inventory: 1, history: 1 });
                        alert_('[ 오셨구나, 지산의 복! ]\n\n'
                            + '대신 갈 사람이 없었습니다.\n'
                            + '통이 열리고 ' + got.length + '종이 쏟아졌습니다.\n\n'
                            + got.join(' · '));
                    }
                }
            } catch (e) { console.warn('[지산] 죽음 건너뜀:', e && e.message); }
            return _d.apply(this, arguments);
        };
        w._jisan = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
        console.log('[지산] 대신 죽기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 내가 걸렸나 — 방을 듣는다
let watchId = '', watchRef = null, tookIt = {};
function watchParty() {
    const r = run();
    const d = db_();
    const me = u_();
    if (!d || !me) return;
    const pid = (r && r.isParty && r.partyId) ? r.partyId : '';
    if (pid === watchId) return;
    if (watchRef) { try { watchRef.off(); } catch (e) { } watchRef = null; }
    watchId = pid;
    if (!pid) return;
    watchRef = d.ref('darkParties/' + pid + '/jisan');
    watchRef.on('value', function (s) {
        try {
            const all = s.val() || {};
            const mine = all[me.code];
            if (!mine || !mine.by) return;
            const key = pid + '|' + mine.at;
            if (tookIt[key]) return;
            tookIt[key] = 1;
            fallen(mine);
        } catch (e) { }
    });
}
setInterval(function () { try { watchParty(); } catch (e) { } }, 1500);

function fallen(m) {
    const me = u_();
    const r = run();
    if (!me) return;
    const got = giveLoot(me, m.zone || (r && r.zone));
    save({ inventory: 1 });
    log_(me, '[' + NAME + '] ' + (m.byName || nameOf(m.by)) + ' 사원 대신 갔습니다 — 회수품 '
        + got.length + '종');
    window.jisanBand();
    alert_('[ 오셨구나, 지산의 복! ]\n\n'
        + (m.byName || nameOf(m.by)) + ' 사원의 통이 흔들렸습니다.\n'
        + '당신이 나왔습니다.\n\n'
        + (got.length ? ('회수품 ' + got.length + '종 — ' + got.join(' · ')) : ''));
    try {
        // ★ 대신 죽는 사람이 저도 이 물건을 차고 있으면 또 남을 끌어들인다.
        //   한 번 걸린 사람에게서는 ① 이 돌지 않게 막아 둔다.
        if (r) { r._jisanFell = true; r._jisanUsed = true; }
        if (typeof darkDeath === 'function') {
            darkDeath('통 속에서 당신의 이름이 나왔습니다.<br><br>'
                + '<span style="color:#ffd9a0;">산산백지산복주시옵게대리자야</span>');
        }
    } catch (e) { }
}

// ==========================================
// ② 세상 진리로부터 해방되게 하소서 — 죽을 길이 보인다
// ==========================================
//
//   선택지 자료에는 「죽는 쪽」 표시가 없다. 다만 이 게임에는 관례가
//   하나 있다 — safe_hint 가 options[0] 에 ◈ 를 붙인다
//   (index.html:2748). 글쓴이 약속으로 **0번이 가장 안전한 쪽**이다.
//   그러므로 나머지가 죽을 길이다. 그쪽에 ☠ 를 붙여 보여 준다.
//
// ■ 투표판에서는 선택지에 **손대지 않는다** (중복 투표로 보이던 것)
//
//   파티로 함께 가는 자리에서는 선택지가 내 화면에만 있는 게 아니다.
//   먼저 도착한 사람의 선택지가 **투표판에 통째로 올라가** 모두의 화면이
//   그것을 쓴다 (index.html:2494 openVote · 2679 renderVoteState).
//
//   예전에는 여기서 선택지를 통째로 갈아 끼웠다.
//
//       { label:'☠ …', fn:'jisanGo', arg:'1' }      ← id 가 빠졌다
//
//   id 가 빠지면 투표판이 이렇게 된다.
//
//       · 표를 세는 칸이 tally[o.id] 인데 셋 다 tally[undefined] 가 되어
//         **한 바구니를 같이 쓴다.** 그래서 세 사람이 각각 다른 쪽에 넣어도
//         선택지마다 ●●● 3 이 찍힌다 — 중복 투표로 보이던 것이 이것이다.
//       · 단추도 castVote('undefined') 라 어느 쪽을 눌러도 같은 표가 된다.
//       · 마감 뒤 runVotedAction 이 모두의 화면에서 window[fn](arg) 를 부르는데,
//         jisanGo 가 보는 _jisanOpt 는 **내 화면에만** 있다. 남의 화면은
//         그 자리에 멎고, 내 쪽만 다음 칸으로 가서 투표가 또 열렸다.
//
//   그래서 투표판에 올라가는 선택지는 **원래 것을 그대로** 둔다. ☠ 는 내
//   화면의 단추에만 덧붙이고 (hookVoteView), 죽을 길을 잡았는지는 마감된
//   투표에서 센다 (hookVoted). 혼자 가는 자리는 선택지가 밖으로 안 나가므로
//   전처럼 jisanGo 로 받는다.
window._jisanOpt = [];
window.jisanGo = function (i) {
    const o = window._jisanOpt[Number(i)];
    if (!o) return;
    if (o.bad) {
        const r = run();
        if (r) r._jisanTruth = true;
        toast('☠ 그 길로 간다');
    }
    try {
        const fn = window[o.fn];
        if (typeof fn === 'function') return fn(o.arg);
    } catch (e) { console.warn('[지산] 선택지:', e && e.message); }
};

(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._jisan) { clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            try {
                const me = u_();
                if (me && wears(me) && Array.isArray(options) && options.length > 1) {
                    window._jisanOpt = [];
                    options = options.map(function (o, i) {
                        const bad = (i > 0);
                        window._jisanOpt.push({ fn: o.fn, arg: o.arg, bad: bad });
                        // ★ 함께 투표하는 자리면 **원래 선택지 그대로** 올린다
                        //   (id 를 잃으면 표가 한 바구니로 몰린다)
                        if (shared()) return o;
                        return { id: o.id, label: (bad ? '☠ ' : '') + o.label,
                                 fn: 'jisanGo', arg: String(i) };
                    });
                    text = String(text || '')
                        + '<br><br><span style="color:#d9a05a;">— 통 속에서 소리가 난다.'
                        + ' ☠ 가 붙은 쪽은 죽는 길이다.</span>';
                }
            } catch (e) { }
            return _c.call(this, title, text, options, imgKey);
        };
        w._jisan = true;
        renderChoiceStep = w; window.renderChoiceStep = w;
        clearInterval(iv);
        console.log('[지산] 죽을 길 보이기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 함께 투표하는 자리인가 — index.html:2759 의 together 와 같은 셈
function shared() {
    const r = run();
    return !!(r && r.isParty && !r.solo && !r.taken && !r._a214Scattered);
}

// 투표판 — ☠ 는 **내 화면의 단추에만** 덧붙인다 (투표판 글은 안 건드린다)
(function hookVoteView() {
    const iv = setInterval(function () {
        if (typeof renderVoteState !== 'function') return;
        if (renderVoteState._jisan) { clearInterval(iv); return; }
        const _v = renderVoteState;
        const w = function () {
            const out = _v.apply(this, arguments);
            try {
                const me = u_();
                if (!me || !wears(me)) return out;
                const area = document.getElementById('vote-area');
                if (!area) return out;
                const bs = area.querySelectorAll('button[onclick^="castVote"]');
                for (let i = 1; i < bs.length; i++) {             // 0번은 안전한 쪽
                    if (bs[i].innerHTML.indexOf('☠') >= 0) continue;
                    bs[i].insertAdjacentHTML('afterbegin', '☠ ');
                }
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        renderVoteState = w; window.renderVoteState = w;
        clearInterval(iv);
        console.log('[지산] 투표판 죽을 길 표시 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 투표가 끝났다 — 일행이 고른 쪽이 죽을 길이었나 (내 화면에서만 센다)
(function hookVoted() {
    const iv = setInterval(function () {
        if (typeof runVotedAction !== 'function') return;
        if (runVotedAction._jisan) { clearInterval(iv); return; }
        const _r = runVotedAction;
        const w = function (opt, vote) {
            try {
                const me = u_(), r = run();
                if (me && r && wears(me) && opt && vote && Array.isArray(vote.options)) {
                    const i = vote.options.findIndex(function (o) { return o && o.id === opt.id; });
                    if (i > 0) { r._jisanTruth = true; toast('☠ 그 길로 간다'); }
                }
            } catch (e) { }
            return _r.apply(this, arguments);
        };
        w._jisan = true;
        runVotedAction = w; window.runVotedAction = w;
        clearInterval(iv);
        console.log('[지산] 투표 결과 — 죽을 길 셈 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ② 정산 — 죽을 길을 잡고 살아 돌아왔으면 세 배
// ==========================================
//
//   ★ 정산은 끝에서 darkRun 을 비운다 (index.html:4576). 그러니 배수는
//     **원본을 부르기 전에** 베껴 둬야 한다 (talkshow.js 가 적어 둔 함정).
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (window._jisanResult) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const me = u_();
            const r = run();
            const truth = !!(me && wears(me) && r && r._jisanTruth);
            const before = (me && Number(me.points)) || 0;
            const out = _r.apply(this, arguments);
            try {
                if (truth) {
                    const got = ((u_() && Number(u_().points)) || 0) - before;
                    if (got > 0) {
                        const add = Math.round(got * (JISAN.TRUTH_MULT - 1));
                        try { if (typeof changePoints === 'function') changePoints(add); }
                        catch (e) { u_().points = (u_().points || 0) + add; }
                        log_(u_(), '[' + NAME + '] 죽을 길을 밟고 살아 돌아왔습니다 — 포인트 '
                            + JISAN.TRUTH_MULT + '배 (+' + add.toLocaleString() + ' P)');
                        setTimeout(function () {
                            alert_('[ 세상 진리로부터 해방되게 하소서 ]\n\n'
                                + '죽는 길을 밟고도 걸어 나왔습니다.\n\n'
                                + '포인트 ' + JISAN.TRUTH_MULT + '배 — 모두 '
                                + (got + add).toLocaleString() + ' P');
                        }, 700);
                    }
                }
            } catch (e) { console.warn('[지산] 정산 건너뜀:', e && e.message); }
            return out;
        };
        w._jisan = true;
        window._jisanResult = true;        // 뒤에 감싸는 쪽이 표식을 지운다
        renderDarkResult = w; window.renderDarkResult = w;
        clearInterval(iv);
        console.log('[지산] 세 배 정산 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ③ 황금빛 수탉 — 황금 막대
// ==========================================
function hasRod(u) {
    if (!u) return false;
    dayRoll(u);
    return !!(u.jisanRod && u.jisanRod.at);
}
window.jisanHasRod = hasRod;

window.jisanRod = function (who) {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    dayRoll(me);
    const left = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    if (left <= 0) { alert_('오늘 황금 막대는 다 나갔습니다.'); return; }
    const t = who ? find(who) : me;
    if (!t) { alert_('사원을 못 찾았습니다.'); return; }
    if (hasRod(t)) { alert_(t.name + ' 사원은 이미 막대를 쥐고 있습니다.'); return; }

    const rod = { by: me.code, byName: me.name, at: Date.now(), miss: 0, safe: 0 };
    if (t.code === me.code) {
        me.jisanRod = rod;
        addNote(me, JISAN.ROD_NOTE);
        addNote(me, JISAN.POLL_NOTE);
    } else {
        t.jisanRod = rod;
        patch(t.code, 'jisanRod', rod);
        addNote(t, JISAN.ROD_NOTE);
        addNote(t, JISAN.POLL_NOTE);
        log_(t, '[' + NAME + '] ' + me.name + ' 사원이 황금 막대를 쥐여 주었습니다.');
        t.hasItemUsedOnMe = true;
        try {
            if (typeof updateUserFields === 'function') {
                // ★ jisanDay 도 같이 보낸다.
                //   dayRoll 은 「오늘 치를 아직 안 돌렸다」 싶으면 막대를 거둔다.
                //   그 도장은 여태 **준 사람 화면에만** 찍혀서, 받은 쪽 기록이
                //   서버에서 내려올 때마다 도장이 없어 다시 거둬졌다 —
                //   「받자마자 막대가 사라진다」가 이것이다.
                updateUserFields(t.code, { badge: t.badge, history: t.history,
                                           jisanDay: t.jisanDay || today(), hasItemUsedOnMe: true });
            }
        } catch (e) { }
    }
    // ★ 막대는 공용시설 행운 쪽 일만 한다. ① 에서 대신 갈 사람은 죽는 그
    //   자리에서 고르므로, 여기에는 아무것도 적지 않는다.
    me.jisanRodGave = (Number(me.jisanRodGave) || 0) + 1;
    log_(me, '[' + NAME + '] 황금 막대 → ' + t.name + ' 사원');
    save({ jisanRodGave: 1, jisanRod: 1, badge: 1, history: 1 });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('🏷 황금 막대가 ' + t.name + ' 사원에게 갔습니다.\n\n'
        + '공용시설 행운이 크게 오릅니다.\n'
        + '대신 한 판마다 오염도가 ' + JISAN.ROD_POLL + ' 오릅니다 — 동결과 무관하게.\n\n'
        + '오늘 남은 막대 ' + (JISAN.ROD_DAY - me.jisanRodGave) + '개');
};

// 공용시설 행운 — 막대를 쥔 사람
(function hookFacLuck() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._jisan) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        const w = function (user) {
            let m = _f.apply(this, arguments);
            try { if (hasRod(user || u_())) m *= JISAN.ROD_LUCK; } catch (e) { }
            return m;
        };
        w._jisan = true;
        facilityLuckMult = w; window.facilityLuckMult = w;
        clearInterval(iv);
        console.log('[지산] 황금 막대 — 공용시설 행운 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 한 판마다 오염도 +15 — 동결과 무관하게 (그래서 applyPollutionToUser 를 안 쓴다)
function pollRaw(u, n) {
    if (!u) return 0;
    const was = Number(u.pollution) || 0;
    u.pollution = Math.max(0, Math.min(100, was + n));
    save({ pollution: 1 });
    return u.pollution - was;
}
(function hookFacUse() {
    const iv = setInterval(function () {
        if (typeof useFacility !== 'function') return;
        if (useFacility._jisan) { clearInterval(iv); return; }
        const _u = useFacility;
        const w = function () {
            const me = u_();
            const on = hasRod(me);
            const r = _u.apply(this, arguments);
            try {
                if (on && r !== false) {
                    const up = pollRaw(me, JISAN.ROD_POLL);
                    if (up > 0) toast('🏷 ' + JISAN.POLL_NOTE + ' (오염도 +' + up + ')');
                }
            } catch (e) { }
            return r;
        };
        w._jisan = true;
        useFacility = w; window.useFacility = w;
        clearInterval(iv);
        console.log('[지산] 황금 막대 — 오염도 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 슬롯 — 연달아 세 번 꽝이면 그 뒤 열 판은 꽝이 없다
(function hookSlot() {
    const iv = setInterval(function () {
        if (typeof playSlot !== 'function') return;
        if (playSlot._jisan) { clearInterval(iv); return; }
        const _p = playSlot;
        const w = function () {
            const me = u_();
            if (!hasRod(me)) return _p.apply(this, arguments);
            const rod = me.jisanRod;
            const before = Number(me.points) || 0;
            let fix = null;
            // 열 판 동안은 꽝이 없다 — 첫 난수를 꽝 띠 밖으로 민다
            if ((Number(rod.safe) || 0) > 0) {
                let fail = 0;
                try {
                    const am = (me.equippedWeapons || []).some(function (x) {
                        const b = baseOf(x);
                        return b === '누군가가 쓴 부적' || b === '사원증 뱃지';
                    });
                    const B = window._slotBands
                        ? window._slotBands(facilityLuckMult(me), am) : null;
                    fail = B ? B.fail : 0;
                } catch (e) { fail = 0; }
                if (fail > 0 && fail < 1) {
                    const _r = Math.random;
                    let first = true;
                    Math.random = function () {
                        if (first) { first = false; return fail + (1 - fail) * _r() * 0.999; }
                        return _r();
                    };
                    fix = _r;
                }
            }
            let out;
            try { out = _p.apply(this, arguments); }
            finally { if (fix) Math.random = fix; }
            try {
                const won = ((Number(u_().points) || 0) - before) > 0;
                const s = Number(rod.safe) || 0;
                if (s > 0) {
                    rod.safe = s - 1;
                    rod.miss = 0;
                } else if (won) {
                    rod.miss = 0;
                } else {
                    rod.miss = (Number(rod.miss) || 0) + 1;
                    if (rod.miss >= JISAN.ROD_MISS) {
                        rod.safe = JISAN.ROD_SAFE;
                        rod.miss = 0;
                        toast('🏷 통이 열렸다 — 다음 ' + JISAN.ROD_SAFE + '판은 꽝이 없다');
                    }
                }
                save({ jisanRod: 1 });
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        playSlot = w; window.playSlot = w;
        clearInterval(iv);
        console.log('[지산] 황금 막대 — 슬롯 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ④ 잊은 자야 사라져라 — 제물
// ==========================================
function sacOf(u) {
    if (!u) return {};
    dayRoll(u);
    if (!u.jisanSac || typeof u.jisanSac !== 'object') u.jisanSac = {};
    return u.jisanSac;
}
function sacPaid(u) {
    const s = sacOf(u);
    return Object.keys(s).reduce(function (a, c) { return a + (Number(s[c].paid) || 0); }, 0);
}
window.jisanSacList = function () {
    const me = u_();
    if (!me) return;
    const s = sacOf(me);
    console.log('%c===== 🧧 제물 =====', 'color:#d9a05a; font-size:13px');
    const ks = Object.keys(s);
    if (!ks.length) { console.log('  찍어 둔 사람이 없습니다.'); return; }
    console.table(ks.map(function (c) {
        const t = userOf(c);
        return { 사원: nameOf(c),
                 갇혔나: (t && typeof isQuarantined === 'function' && isQuarantined(t)) ? 'O' : '-',
                 받은몫: (Number(s[c].paid) || 0).toLocaleString() + ' P' };
    }));
    console.log('  다 합쳐 ' + sacPaid(me).toLocaleString() + ' / '
        + JISAN.SAC_CAP.toLocaleString() + ' P');
};

// 찍어 둔 사람이 갇혀 있는 동안 — 그 시간만큼 들어온다
setInterval(function () {
    try {
        const me = u_();
        if (!me || !wears(me)) return;
        const s = sacOf(me);
        const codes = Object.keys(s);
        if (!codes.length) return;
        let left = JISAN.SAC_CAP - sacPaid(me);
        if (left <= 0) return;
        let got = 0;
        const now = Date.now();
        codes.forEach(function (c) {
            if (left <= 0) return;
            const t = userOf(c);
            if (!t) return;
            const inRoom = !!(t.quarantineUntil && now < t.quarantineUntil);
            const rec = s[c];
            if (!inRoom) { rec.at = 0; return; }
            if (!rec.at) { rec.at = now; return; }
            const mins = (now - rec.at) / 60000;
            if (mins < JISAN.SAC_STEP) return;
            const step = Math.floor(mins / JISAN.SAC_STEP);
            let pay = Math.min(left, Math.round(step * JISAN.SAC_HOUR * JISAN.SAC_STEP / 60));
            if (pay <= 0) return;
            rec.at = rec.at + step * JISAN.SAC_STEP * 60000;
            rec.paid = (Number(rec.paid) || 0) + pay;
            left -= pay; got += pay;
        });
        if (got > 0) {
            try { if (typeof changePoints === 'function') changePoints(got); }
            catch (e) { me.points = (me.points || 0) + got; }
            log_(me, '[' + NAME + '] 제물이 갇혀 있는 동안 +' + got.toLocaleString() + ' P');
            toast('🧧 제물에게서 ' + got.toLocaleString() + ' P');
            save({ jisanSac: 1, history: 1 });
        } else {
            save({ jisanSac: 1 });
        }
    } catch (e) { }
}, 60000);

// ==========================================
// [제물] 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:48dvh; margin-bottom:9px;';

function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); });
}
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999992; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:16px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#1d1210,#0b0807);'
        + ' border:1px solid #b03030; border-radius:12px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; display:flex; flex-direction:column;'
        + ' box-shadow:0 8px 30px rgba(0,0,0,0.75);">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#7d7468; margin:4px 0 11px 0; line-height:1.7;">'
            + sub + '</div>' : '<div style="height:9px;"></div>');
}

window.jisanMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    dayRoll(me);
    const rodLeft = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    const s = sacOf(me);
    const w = box(head('🧧 지산의 복 : 대리자',
        '통을 흔들면 안에서 무언가가 굴러다닙니다.<br>'
        + '오늘 황금 막대 <b style="color:#ffcf8f;">' + rodLeft + '</b>개 · '
        + '제물 <b style="color:#ffcf8f;">' + Object.keys(s).length + ' / '
        + JISAN.SAC_DAY + '</b>명 · 받은 몫 '
        + sacPaid(me).toLocaleString() + ' / ' + JISAN.SAC_CAP.toLocaleString() + ' P<br>'
        // ① 에서 대신 갈 사람 — 죽는 그 자리에서 고른다
        + '대신 갈 사람은 <b style="color:#ffcf8f;">죽는 그 자리에서</b> 고릅니다.')
        + '<button id="js-sac" class="game-btn" style="' + BTN + ' text-align:center;">제물을 찍는다</button>'
        + '<button id="js-rod" class="game-btn" style="' + BTN + ' text-align:center;">황금 막대를 쥐여 준다</button>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#js-x').onclick = shut;
    w.querySelector('#js-sac').onclick = pickSac;
    w.querySelector('#js-rod').onclick = pickRod;
};

function pickSac() {
    const me = u_();
    const s = sacOf(me);
    const list = users().filter(function (x) { return x.code !== me.code; });
    if (!list.length) { alert_('찍을 사원이 없습니다.'); return; }
    const rows = list.map(function (t) {
        const on = !!s[t.code];
        return '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px;'
            + ' border:1px solid #3a2a27; border-radius:7px; margin-bottom:6px;'
            + ' background:rgba(40,24,22,0.5);">'
            + '<input type="checkbox" class="js-sc" value="' + esc(t.code) + '"' + (on ? ' checked' : '')
            + ' style="width:17px; height:17px; flex-shrink:0;">'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#e6ddd0;">'
            + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (on ? '<div style="font-size:9px; color:#d9a05a; margin-top:2px;">받은 몫 '
                    + (Number(s[t.code].paid) || 0).toLocaleString() + ' P</div>' : '')
            + '</div></label>';
    }).join('');
    const w = box(head('제물을 찍습니다',
        '하루 ' + JISAN.SAC_DAY + '사람까지입니다. 찍힌 사원이 상담실에 '
        + '들어가 있는 동안 한 사람에 시간당 ' + JISAN.SAC_HOUR.toLocaleString() + ' P 가 들어옵니다 (다 합쳐 '
        + JISAN.SAC_CAP.toLocaleString() + ' P 까지).')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="js-ok" class="game-btn" style="' + BTN + ' text-align:center;">찍는다</button>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#js-x').onclick = window.jisanMenu;
    w.querySelector('#js-ok').onclick = function () {
        const got = Array.prototype.slice.call(w.querySelectorAll('.js-sc:checked'))
            .map(function (x) { return x.value; });
        if (got.length > JISAN.SAC_DAY) {
            alert_('하루 ' + JISAN.SAC_DAY + '사람까지입니다.'); return;
        }
        const next = {};
        got.forEach(function (c) { next[c] = s[c] || { at: 0, paid: 0 }; });
        me.jisanSac = next;
        save({ jisanSac: 1 });
        shut();
        alert_('제물 ' + got.length + '사람을 찍었습니다.\n\n'
            + got.map(nameOf).join(' · '));
    };
}

function pickRod() {
    const me = u_();
    const left = JISAN.ROD_DAY - (Number(me.jisanRodGave) || 0);
    if (left <= 0) { alert_('오늘 황금 막대는 다 나갔습니다.'); return; }
    const list = [me].concat(users().filter(function (x) { return x.code !== me.code; }));
    const rows = list.map(function (t) {
        const on = hasRod(t);
        return '<button class="game-btn js-rd" data-c="' + esc(t.code) + '"' + (on ? ' disabled' : '')
            + ' style="' + BTN + (on ? GREY : '') + '">'
            + (t.code === me.code ? '나 — ' : '') + esc(t.name)
            + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (on ? '<div style="font-size:9px; color:#a07070; margin-top:2px;">이미 쥐고 있습니다</div>' : '')
            + '</button>';
    }).join('');
    const w = box(head('황금 막대 — 오늘 ' + left + '개',
        '공용시설 행운이 크게 오릅니다. 대신 한 판마다 오염도가 '
        + JISAN.ROD_POLL + ' 오릅니다 — 동결과 무관하게.<br>'
        + '슬롯에서 연달아 ' + JISAN.ROD_MISS + '번 꽝이면 그 뒤 '
        + JISAN.ROD_SAFE + '판은 꽝이 없습니다. 자정에 사라집니다.<br>'
        + '<span style="color:#d9a05a;">막대를 건넨 사람이 어둠에서 당신 대신 갑니다. '
        + '그쪽 화면에는 막대 이야기만 뜹니다.</span>')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="js-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#js-x').onclick = window.jisanMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.js-rd'), function (b) {
        b.onclick = function () { shut(); window.jisanRod(b.dataset.c); };
    });
}

// 장착칸의 [제물] 단추
(function badgeBtn() {
    const ID = 'jisan-btn';
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.querySelector('#' + ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;'
            + ' background:linear-gradient(145deg,#8a1414,#3d0a0a) !important;'
            + ' border-color:#e07070 !important;';
        b.textContent = '제물';
        b.onclick = window.jisanMenu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._jisanBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._jisanBtn = true;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// ⑤ ■■의 ■■■ — 천장이 없다
// ==========================================
//
//   epic.js:655 가 Math.min(25000, …) 으로 자른다. 그 안을 고칠 수는
//   없으니, **잘리기 전의 값을 여기서 다시 셈해** 넘친 만큼을 뒤에 얹는다.
//   셈은 epic.js:641-655 와 같은 식이다 — 거기가 바뀌면 여기도 고쳐야 한다.
function epicRaw(how) {
    try {
        if (typeof er === 'undefined' || !er) return 0;
        let t = 300 + (Number(er.score) || 0);
        t += (Number(er.moved) || 0) * 60;
        t += (Number(er.helped) || 0) * 900;
        t += ((er.found || []).length) * 400;
        if (er.goalDone) t += 2000;
        if (er.flags && er.flags.deepFound) t += 3000;
        const mins = Math.floor((Date.now() - er.started) / 60000);
        t += Math.min(3000, mins * 50);
        if (how === 'dead') t = Math.floor(t * 0.35);
        return Math.max(300, Math.round(t));
    } catch (e) { return 0; }
}
(function hookEpic() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._jisan) { clearInterval(iv); return; }
        const _e = epicSettle;
        const w = function (how, txt) {
            const me = u_();
            let over = 0;
            try {
                if (me && wears(me)) {
                    const raw = epicRaw(how);
                    over = Math.max(0, raw - JISAN.EPIC_CAP);
                }
            } catch (e) { }
            const out = _e.apply(this, arguments);
            try {
                if (over > 0) {
                    try { if (typeof changePoints === 'function') changePoints(over); }
                    catch (e) { me.points = (me.points || 0) + over; }
                    log_(me, '[' + NAME + '] 천장을 넘긴 몫 +' + over.toLocaleString() + ' P');
                    setTimeout(function () {
                        alert_('[ 지산의 복이시여 대리자여 ]\n\n'
                            + '지산의 복에게 한도가 있으면 안 됩니다.\n\n'
                            + '천장 ' + JISAN.EPIC_CAP.toLocaleString() + ' P 를 넘긴 '
                            + over.toLocaleString() + ' P 를 그대로 들고 나왔습니다.');
                    }, 800);
                }
            } catch (e) { }
            return out;
        };
        w._jisan = true;
        epicSettle = w; window.epicSettle = w;
        clearInterval(iv);
        console.log('[지산] ■■의 ■■■ 천장 풀기 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 상담사 · 확인
// ==========================================
window.jisanGive = function (who, n) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(3, Number(n) || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' ' + q + '개 지급');
    try {
        if (typeof updateUserFields === 'function') {
            updateUserFields(t.code, { inventory: t.inventory, history: t.history });
        }
    } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.jisanState = function (who) {
    const t = find(who) || u_();
    if (!t) { console.log('로그인 전입니다.'); return; }
    dayRoll(t);
    console.log('%c===== 🧧 지산의 복 · ' + t.name + ' =====', 'color:#d9a05a; font-size:13px');
    console.log('  차고 있나   :', wears(t) ? 'O' : '✗');
    console.log('  황금 막대   :', hasRod(t)
        ? ('쥐고 있음 (' + (t.jisanRod.byName || t.jisanRod.by) + ' · 연속 꽝 '
           + (Number(t.jisanRod.miss) || 0) + ' · 꽝 없는 판 ' + (Number(t.jisanRod.safe) || 0) + ')')
        : '없음');
    console.log('  오늘 준 막대:', (Number(t.jisanRodGave) || 0) + ' / ' + JISAN.ROD_DAY);
    console.log('  대신 갈 사람:', '죽는 그 자리에서 고른다');
    const s = t.jisanSac || {};
    console.log('  제물        :', Object.keys(s).map(nameOf).join(' · ') || '없음',
        '· 받은 몫 ' + sacPaid(t).toLocaleString() + ' / ' + JISAN.SAC_CAP.toLocaleString() + ' P');
    const r = run();
    console.log('  이번 탐사   :', r ? (r.zone + (r._jisanTruth ? ' · 죽을 길을 밟음' : '')) : '밖');
    console.log('  빛 부속성 제외 :', JISAN.LIGHT.join(' · ') || '(없음)');
};

window.JISANFOX = { JISAN: JISAN, wears: wears, hasRod: hasRod, dayRoll: dayRoll,
                    zonePay: zonePay, allLoot: allLoot, sacPaid: sacPaid,
                    fallen: fallen, mates: aliveMates, epicRaw: epicRaw,
                    pollRaw: pollRaw, noteLine: JISAN.ROD_NOTE };

console.log('[지산] jisanGive(사번) · jisanState(사번) · jisanRod(사번) · jisanBand()');

})();
