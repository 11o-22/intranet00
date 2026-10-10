// ==========================================
// ★ 📱 K.LEE — 상담사 지급 전용
// bundles.json 마지막 묶음, newitems2.js · foxtail.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   인트라넷에서 들어본 적 없는 대리의 문자가 온다. 이름, 몇 조, 성과
//   등등 알고 있는 것들이 많은……. 이 사람은 누구지?
//
//   장착품이다. 차고 있으면 장착칸의 「해제」 옆에 [📲 목록] 이 붙고,
//   거기서 다섯 가지 문자 중 하나를 골라 보낸다.
//
//     ① 이름 많이 들었어요.          사원 셋을 골라 그들의 버프를 두 배로
//     ② 아차차, 내가 말이 많았네.    어둠에서 파티 전원에게 신호
//     ③ 식사는?                      격리된 사원의 시간을 줄인다
//     ④ 수고해요 후배님 ㅋㅋ         예약 전송 — 내가 죽으면 둘이 받는다
//     ⑤ 혹시 뭐 살 거 있으신가?      공용시설·랜덤박스 행운
//
// ■ 어디에도 안 깔린다
//
//   은심장·호사수구와 같다. 상점·우주 쇼핑몰·장터 어디에도 안 뜨고
//   팔 수도 없다. 주는 법은 kleeGive(사번) 또는 당국 화면의
//   「물품 강제 꽂기」뿐이다.
//
// ■ 방장이 차고 있으면 화면이 바뀐다
//
//   그 파티에 든 모든 사람의 어둠 탐사 화면이 **그 사람의 전화기 안**
//   으로 들어간다. 테두리·다이나믹 아일랜드·옆 단추까지 그려진다.
//   방장이 누구인지는 방(darkParties)에서 읽으므로 따로 적지 않는다.
//
// ■ 특이사항에 적힌다 — 📲
//
//   24시간 가는 버프만 적는다. ①(두 배) · ④(예약 문자) · ⑤(구매 행운)
//   세 가지다. ②(신호)는 그 탐사 한 번이고 ③(식사는?)은 그 자리에서
//   끝나므로 적을 것이 없다. 24시간이 지나면 note-fix.js 가 걷어낸다.
//
// ■ EPIC 에서도 듣는다
//
//   EPIC 은 끝나는 길이 따로다 (epicDeath · epicSettle). 아래쪽
//   「EPIC」 칸에서 그 두 자리에 ②·④ 를 붙였다.
//
// ■ 콘솔
//   kleeGive(사번)     상담사가 하나 준다
//   kleeState(사번)    오늘 남은 횟수 · 걸린 것
//   kleePhone(1/0)     전화기 테두리를 손으로 켜 보기 (확인용)

// ■ 이름에 마침표를 못 넣는다
//
//   파이어베이스의 열쇠에는 . # $ [ ] / 를 쓸 수 없다. 그런데 물품 이름은
//   여기저기서 **열쇠로** 쓰인다 —
//
//       user.equipOwner['📱 K.LEE'] = 사번        장착할 때
//       선물함의 items = { '📱 K.LEE': 1 }         물품 강제 꽂기
//       copyExpire · qshopRecord · dayUse …
//
//   그래서 「📱 K.LEE」 로 두면 장착도 꽂기도 **쓰는 쪽에서 통째로 거절**
//   당한다. 알림은 떴는데 아무것도 안 들어오던 까닭이다.
//   (카탈로그 465종 가운데 마침표가 든 이름은 이것 하나뿐이었다)
//
//   그래서 물품 이름만 가운뎃점(·)으로 둔다. 문자를 보내는 사람 이름은
//   글자로만 쓰이므로 K.LEE 그대로다.
const KLEE = {
    NAME: '📱 K·LEE',
    WHO:  'K.LEE',
    DAY:  { m3: 3, m4: 3, m5: 2 },           // 하루 쓸 수 있는 횟수 (① ② 는 제한 없음)
    PICK: 3,                                 // ① 고르는 사원 수
    BOOK: 2,                                 // ④ 한 번에 예약하는 사람 수
    BUFF_MS: 24 * 3600 * 1000,
    CUT_MS: 3600 * 1000,                     // ③ 한 번에 줄이는 격리 시간
    SIGN: { host: { pt: 2.0, loot: 2.5 }, mate: { pt: 1.5, loot: 2.0 } },
    SHOP: { fac: 3.0, box: 2.5 },            // ⑤ 공용시설 ×3(200%↑) · 랜덤박스 ×2.5(150%↑)
    DEAD_PT: 0.4                             // ④ 사망 탈출 때 받는 포인트 몫
};

(function kleePhone() {

const NAME = KLEE.NAME;
const ADMIN = 'kario0987';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function today() {
    try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); }
}
function baseOf(w) {
    return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || '');
}
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
window.kleeWears = wears;

function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code !== ADMIN; });
}
function find(who) {
    if (!who) return me();
    return users().filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}

// ==========================================
// 하루 횟수
// ==========================================
function uses(u) {
    u = u || me();
    if (!u) return {};
    if (u.kleeDay !== today()) { u.kleeDay = today(); u.kleeUse = {}; }
    if (!u.kleeUse) u.kleeUse = {};
    return u.kleeUse;
}
function left(u, k) {
    const max = KLEE.DAY[k];
    if (max == null) return 99;
    return Math.max(0, max - (uses(u)[k] || 0));
}
function spend(u, k) {
    const m = uses(u);
    m[k] = (m[k] || 0) + 1;
    try { if (typeof saveFields === 'function') saveFields({ kleeDay: 1, kleeUse: 1 }); } catch (e) { }
}

// ==========================================
// 문자 벨소리 — 코드로 만든다
// ==========================================
//
//   띠링 두 번(E6 → B6) 뒤에 아주 짧은 진동음 하나. 휴대폰이 울릴 때
//   나는 소리를 소리굽쇠 두 개로 흉내 낸 것이다. 음을 파일로 들고 있지
//   않으므로 받는 쪽이 따로 내려받을 것이 없다.
let AC = null;
function ctx() {
    try {
        if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
        if (AC.state === 'suspended') AC.resume();
        return AC;
    } catch (e) { return null; }
}
function ding(c, when, freq, len, gainMax) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, when);
    // 종소리처럼 — 때리고 바로 잦아든다
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gainMax, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    o.connect(g); g.connect(c.destination);
    o.start(when); o.stop(when + len + 0.05);

    // 배음 하나 — 이것이 있어야 「전자음」이 아니라 「벨」로 들린다
    const o2 = c.createOscillator(), g2 = c.createGain();
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(freq * 2.01, when);
    g2.gain.setValueAtTime(0.0001, when);
    g2.gain.exponentialRampToValueAtTime(gainMax * 0.32, when + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, when + len * 0.65);
    o2.connect(g2); g2.connect(c.destination);
    o2.start(when); o2.stop(when + len + 0.05);
}
function buzz(c, when, len) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(58, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(0.05, when + 0.02);
    g.gain.setValueAtTime(0.05, when + len - 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 170;
    o.connect(lp); lp.connect(g); g.connect(c.destination);
    o.start(when); o.stop(when + len + 0.05);
}
function ring() {
    // 음소거를 눌러 둔 사람에게는 울리지 않는다
    try { if (typeof darkAudio === 'object' && darkAudio && darkAudio.muted) return; } catch (e) { }
    const c = ctx();
    if (!c) return;
    const t = c.currentTime + 0.02;
    ding(c, t,        1318.5, 0.34, 0.16);   // E6
    ding(c, t + 0.17, 1975.5, 0.46, 0.13);   // B6
    buzz(c, t + 0.02, 0.26);
    try { if (navigator.vibrate) navigator.vibrate([22, 70, 22]); } catch (e) { }
}
window.kleeRing = ring;

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[NAME] = {
            price: 0, usable: true, targetable: false, effect: 'klee_equip', noSell: true,
            equipKind: 'klee',
            desc: '안녕~ 나 C 조의 이강헌 대리예요. — 인트라넷에서 들어본 적 없는 대리의 문자가 온다. '
                + '이름, 몇 조, 성과 등등 알고 있는 것들이 많은……. 이 사람은 누구지? '
                + '장착하면 장착칸의 [📲 목록] 에서 다섯 가지 문자를 골라 보낼 수 있다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        // 이름을 고칠 일이 있을 때를 위한 그물 — 열쇠로 못 쓰는 글자가 들면 알린다
        if (/[.#$\[\]\/]/.test(NAME)) {
            console.error('[K.LEE] 물품 이름에 파이어베이스 열쇠로 못 쓰는 글자가 있습니다: ' + NAME
                + '  (. # $ [ ] / 는 장착·선물함에서 거절당합니다)');
        }
        console.log('[K.LEE] ' + NAME + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 다른 파일이 상점 후보에 밀어 넣어도 계속 뺀다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !ALIEN_ITEMS_POOL) return;
    let i;
    while ((i = ALIEN_ITEMS_POOL.indexOf(NAME)) > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    if (window.RARE_ALIEN_RATE) delete window.RARE_ALIEN_RATE[NAME];
}, 5000);

// 장터에서 가린다
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._klee) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(NAME); } catch (e) { }
            return pool;
        };
        marketSellable._klee = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 장착
// ==========================================
(function equip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._klee) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'klee_equip') return _u.apply(this, arguments);
            const u = me();
            if (!u) return;
            if ((u.inventory || []).indexOf(itemName) < 0) { alert_('가지고 있지 않습니다.'); return; }
            if (!Array.isArray(u.equippedWeapons)) u.equippedWeapons = [];
            if (wears(u)) { alert_('이미 차고 있습니다.'); return; }
            if (u.equippedWeapons.length >= 12) { alert_('장착 슬롯이 가득 찼습니다.'); return; }

            u.equippedWeapons.push(NAME);
            if (typeof setEquipOwner === 'function') setEquipOwner(u, NAME, u.code);
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, itemName, 1);
            if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, '[장착됨] ' + NAME);
            log_(u, '[장착] ' + NAME);
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            ring();
            alert_('[' + KLEE.WHO + ' : 안녕~ 나 C 조의 이강헌 대리예요.]\n\n'
                + '장착칸의 [📲 목록] 을 누르면 보낼 문자를 고를 수 있습니다.');
        };
        useInventoryItem._klee = true;
        clearInterval(iv);
        console.log('[K.LEE] 장착 연결');
    }, 400);
})();

// ==========================================
// 창
// ==========================================
function box(html, z) {
    const w = document.createElement('div');
    w.className = 'klee-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:' + (z || 100001) + '; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.78); padding:18px;';
    w.innerHTML = '<div style="background:linear-gradient(160deg,#101418,#070a0d); border:1px solid #2f6f9f;'
        + ' border-radius:14px; padding:15px; max-width:390px; width:100%; max-height:84vh;'
        + ' display:flex; flex-direction:column; box-shadow:0 10px 36px rgba(0,0,0,0.6);">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.klee-modal'), function (x) { x.remove(); });
}
const BTN = 'width:100%; margin:0 0 8px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#232323 !important; border-color:#3c3c3c !important; color:#9a9a9a !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1; min-height:0; margin-bottom:9px;';

// 말풍선 — 받은 문자처럼
function bubble(text, who) {
    return '<div style="display:flex; gap:8px; align-items:flex-end; margin-bottom:11px;">'
        + '<div style="width:30px; height:30px; border-radius:50%; flex-shrink:0;'
        + ' background:linear-gradient(145deg,#2f6f9f,#143449); display:flex; align-items:center;'
        + ' justify-content:center; font-size:14px;">📱</div>'
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:9px; color:#7fb6dd; margin-bottom:3px;">' + esc(who || KLEE.WHO) + '</div>'
        + '<div style="background:#18222b; border:1px solid #2f4b5f; border-radius:3px 13px 13px 13px;'
        + ' padding:10px 12px; font-size:12px; color:#e6eef4; line-height:1.75; word-break:keep-all;">'
        + text + '</div></div></div>';
}

// ==========================================
// 목록 — 다섯 가지 문자
// ==========================================
const MSG = [
    { id: 'm1', t: '① 이름 많이 들었어요.',
      s: '사원 셋을 골라 그들의 버프 일부를 두 배로 가져온다. 상대에게도 그대로 남고, 그 셋에게도 두 배로 걸린다.' },
    { id: 'm2', t: '② 아차차, 내가 말이 많았네.',
      s: '어둠에서 파티 전원에게 신호를 남긴다. 받은 사람 포인트 1.5배·회수품 2배, 보낸 사람 2배·2.5배.' },
    { id: 'm3', t: '③ 식사는?',
      s: '상담실·선녀탕에 있는 사원의 격리를 1시간 줄인다. 내가 격리 중이면 단체 문자가 나간다.' },
    { id: 'm4', t: '④ 수고해요 후배님 ㅋㅋ',
      s: '어둠에서 파티원 둘에게 예약 전송. 내가 죽으면 그 둘이 문자와 버프를 받고, 나는 오염 50%로 빠져나온다.' },
    { id: 'm5', t: '⑤ 혹시 뭐 살 거 있으신가?',
      s: '받은 사원과 나 모두 24시간 동안 공용시설 행운 200%·랜덤박스 행운 150% 상승.' }
];

function menu() {
    const u = me();
    if (!u) return;
    if (!wears(u)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    shut();
    const rows = MSG.map(function (m) {
        const n = KLEE.DAY[m.id];
        const l = n == null ? null : left(u, m.id);
        const off = (l != null && l <= 0);
        return '<button class="klee-pick game-btn" data-id="' + m.id + '"' + (off ? ' disabled' : '')
            + ' style="' + BTN + (off ? GREY : '') + '">'
            + '<div style="font-size:12px; font-weight:bold; color:' + (off ? '#777' : '#cfe6f6') + ';">' + m.t + '</div>'
            + '<div style="font-size:10px; color:#8a8a8a; margin-top:4px; line-height:1.6; white-space:normal;">' + m.s + '</div>'
            + (n == null ? ''
                : '<div style="font-size:9px; color:' + (off ? '#a05050' : '#6fa8cf') + '; margin-top:4px;">오늘 '
                  + l + ' / ' + n + '회</div>')
            + '</button>';
    }).join('');

    const w = box('<div style="font-size:13px; color:#cfe6f6; font-weight:bold;">' + NAME + '</div>'
        + '<div style="font-size:10px; color:#7a7a7a; margin:4px 0 12px 0;">보낼 문자를 고르십시오.</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#klee-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.klee-pick'), function (b) {
        b.onclick = function () { open_(b.dataset.id); };
    });
}
window.kleeMenu = menu;

function open_(id) {
    if (id === 'm1') return m1Pick();
    if (id === 'm2') return m2Send();
    if (id === 'm3') return m3Open();
    if (id === 'm4') return m4Send();
    if (id === 'm5') return m5Pick();
}

// ==========================================
// 특이사항에 적는다 — 📲
// ==========================================
//
//   24시간짜리 버프만 적는다. ② 신호(한 탐사)와 ③ 식사는?(그 자리에서
//   끝나는 것)은 적지 않는다. 적을 것이 없기 때문이다.
//
//   지우는 쪽은 note-fix.js 가 맡는다. 거기 EXPIRY 표에
//       { mark: '[📲]', live: window.kleeNoteLive }
//   를 한 줄 넣어 두었다. 15초마다 돌면서 버프가 끝난 줄을 걷어낸다.
//   그래서 여기서는 적기만 하고, 24시간 뒤를 따로 재지 않는다.
const NOTE = '[📲]';
const KEY_OF = {
    '행운': 'luck', '판정': 'bon', '회피': 'eva', '기믹 파훼': 'gim',
    '공용시설 횟수': 'fac', '어둠 탐사 횟수': 'dark',
    '공용시설 행운': 'pct', '회수품 확률': 'kleeLoot'
};

function noteAdd(u, text) {
    try {
        if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, NOTE + ' ' + text);
    } catch (e) { }
}

// 그 줄이 아직 살아 있나 — note-fix.js 가 물어본다
window.kleeNoteLive = function (u, note) {
    try {
        if (!u) return false;
        const t = String(note || '');
        if (/구매 행운/.test(t)) return (u.kleeShop || 0) > Date.now();
        const nm = Object.keys(KEY_OF).filter(function (n) { return t.indexOf(n) >= 0; })
            .sort(function (a, b) { return b.length - a.length; })[0];   // 「공용시설 행운」이 「행운」보다 먼저
        if (!nm) return (liveBuffs(u).some(function (b) { return b.src === KLEE.WHO; }));
        const k = KEY_OF[nm];
        return liveBuffs(u).some(function (b) { return b.src === KLEE.WHO && b.k === k; });
    } catch (e) { return true; }      // 못 재면 남겨 둔다
};

// ==========================================
// ① 이름 많이 들었어요 — 사원 셋의 버프를 두 배로
// ==========================================
const BK = {
    luck: '행운', bon: '판정', eva: '회피', gim: '기믹 파훼',
    fac: '공용시설 횟수', dark: '어둠 탐사 횟수', pct: '공용시설 행운', kleeLoot: '회수품 확률'
};
function bname(k) { return BK[k] || k; }
function bunit(k) { return (k === 'pct' || k === 'kleeLoot') ? '%' : ''; }

function liveBuffs(u) {
    const t = Date.now();
    return (Array.isArray(u.itemBuffs) ? u.itemBuffs : []).filter(function (b) {
        return b && b.k && (b.run || (b.until || 0) > t);
    });
}

function m1Pick() {
    const u = me();
    shut();
    // 버프를 들고 있는 사원만 보여 준다 — 없는 사람을 고르면 가져올 것이 없다
    const list = users().filter(function (x) { return x.code !== u.code; })
        .map(function (x) { return { u: x, b: liveBuffs(x) }; })
        .sort(function (a, b) { return b.b.length - a.b.length; });

    const rows = list.map(function (r) {
        const off = r.b.length === 0;
        return '<label class="klee-row" style="display:flex; gap:9px; align-items:center; padding:9px 10px;'
            + ' border:1px solid #2a3b47; border-radius:7px; margin-bottom:6px;'
            + ' background:rgba(20,34,44,0.55);' + (off ? ' opacity:0.42;' : '') + '">'
            + '<input type="checkbox" class="klee-cb" value="' + esc(r.u.code) + '"' + (off ? ' disabled' : '')
            + ' style="width:17px; height:17px; flex-shrink:0;">'
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:12px; color:#e6eef4;">' + esc(r.u.name)
            + ' <span style="font-size:9px; color:#777;">사번 ' + esc(r.u.no || '-') + '</span></div>'
            + '<div style="font-size:10px; color:#6fa8cf; margin-top:2px;">'
            + (off ? '걸린 버프 없음'
                   : r.b.map(function (b) { return bname(b.k) + ' +' + b.v + bunit(b.k); }).join(' · '))
            + '</div></div></label>';
    }).join('');

    const w = box(bubble('안녕~ 나 C 조의 이강헌 대리예요.<br>이름 많이 들었어요.')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:8px;">문자를 보낼 사원 '
        + KLEE.PICK + '명을 고르십시오.</div>'
        + '<div style="' + SCROLL + '">' + (rows || '<div style="font-size:11px; color:#777;">사원이 없습니다.</div>') + '</div>'
        + '<button id="klee-go" class="game-btn" style="' + BTN + ' text-align:center;">다음</button>'
        + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#klee-x').onclick = shut;
    w.querySelector('#klee-go').onclick = function () {
        const picked = Array.prototype.slice.call(w.querySelectorAll('.klee-cb:checked')).map(function (x) { return x.value; });
        if (picked.length !== KLEE.PICK) { alert_('정확히 ' + KLEE.PICK + '명을 고르십시오.'); return; }
        m1Buffs(picked);
    };
}

function m1Buffs(codes) {
    shut();
    const pool = [];
    codes.forEach(function (c) {
        const t = db.users[c];
        if (!t) return;
        liveBuffs(t).forEach(function (b, i) {
            pool.push({ code: c, name: t.name, k: b.k, v: b.v, i: i });
        });
    });
    if (!pool.length) { alert_('고른 사원들에게 가져올 버프가 없습니다.'); return; }

    const rows = pool.map(function (p, idx) {
        return '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px;'
            + ' border:1px solid #2a3b47; border-radius:7px; margin-bottom:6px; background:rgba(20,34,44,0.55);">'
            + '<input type="checkbox" class="klee-bb" value="' + idx + '" style="width:17px; height:17px; flex-shrink:0;">'
            + '<div style="flex:1; min-width:0; font-size:12px; color:#e6eef4;">'
            + esc(p.name) + ' <span style="color:#6fa8cf;">' + bname(p.k) + ' +' + p.v + bunit(p.k) + '</span>'
            + '<div style="font-size:10px; color:#8a8a8a; margin-top:2px;">나 +' + (p.v * 2) + bunit(p.k)
            + ' · ' + esc(p.name) + ' +' + (p.v * 2) + bunit(p.k) + ' (원래 것은 그대로)</div>'
            + '</div></label>';
    }).join('');

    const w = box(bubble('이름 많이 들었어요.<br>어떤 건지 좀 보여 줄래요?')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:8px;">가져올 버프를 고르십시오. (여럿 가능)</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="klee-go" class="game-btn" style="' + BTN + ' text-align:center;">보낸다</button>'
        + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#klee-x').onclick = shut;
    w.querySelector('#klee-go').onclick = function () {
        const sel = Array.prototype.slice.call(w.querySelectorAll('.klee-bb:checked'))
            .map(function (x) { return pool[Number(x.value)]; }).filter(Boolean);
        if (!sel.length) { alert_('하나 이상 고르십시오.'); return; }
        m1Do(codes, sel);
    };
}

function m1Do(codes, sel) {
    const u = me();
    shut();
    const mine = [], theirs = {};

    sel.forEach(function (p) {
        // 나 — 두 배로 가져온다
        try { window.ibAdd(u, p.k, p.v * 2, KLEE.BUFF_MS, KLEE.WHO); } catch (e) { }
        noteAdd(u, bname(p.k) + ' +' + (p.v * 2) + bunit(p.k) + ' (24시간)');
        mine.push(bname(p.k) + ' +' + (p.v * 2) + bunit(p.k));
        // 상대 — 원래 것은 그대로 두고 같은 몫을 한 번 더 얹어 두 배로
        const t = db.users[p.code];
        if (t) {
            try { window.ibAdd(t, p.k, p.v, KLEE.BUFF_MS, KLEE.WHO); } catch (e) { }
            noteAdd(t, bname(p.k) + ' +' + (p.v * 2) + bunit(p.k) + ' (24시간)');
            (theirs[t.name] = theirs[t.name] || []).push(bname(p.k) + ' ×2');
        }
    });

    codes.forEach(function (c) {
        const t = db.users[c];
        if (!t) return;
        log_(t, '[' + KLEE.WHO + '] ' + u.name + ' 사원의 문자 — 걸려 있던 버프가 두 배가 되었습니다.');
        try {
            if (c !== u.code && typeof updateUserFields === 'function') {
                updateUserFields(c, { itemBuffs: t.itemBuffs, badge: t.badge, history: t.history, hasItemUsedOnMe: true });
            }
        } catch (e) { }
    });

    log_(u, '[' + KLEE.WHO + '] 이름 많이 들었어요 — ' + mine.join(', '));
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 이름 많이 들었어요.]\n\n'
        + '가져온 것 — ' + mine.join(' · ') + '\n\n'
        + Object.keys(theirs).map(function (n) { return n + ' : ' + theirs[n].join(' · '); }).join('\n'));
}

// ==========================================
// ② 아차차, 내가 말이 많았네 — 어둠에서 신호
// ==========================================
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function party() {
    const r = run();
    if (!r || !r.partyId || typeof darkParties === 'undefined') return null;
    return darkParties[r.partyId] || null;
}
function signPath() {
    const r = run();
    return r && r.partyId ? 'darkParties/' + r.partyId + '/klee/sign' : null;
}

function m2Send() {
    const u = me(), r = run();
    shut();
    if (!r || !r.isParty || !r.partyId) { alert_('어둠 탐사 중에, 파티로 들어갔을 때만 보낼 수 있습니다.'); return; }
    const p = party();
    const n = p && p.members ? Object.keys(p.members).length : (r.memberCount || 1);

    const pay = { by: u.code, name: u.name, at: Date.now() };
    const path = signPath();
    if (db_() && path) db_().ref(path).set(pay).catch(function () { });
    try { if (typeof sendPartyChat === 'function') sendPartyChat(u.name + ' 사원의 전화기가 한 번 울렸습니다.', true); } catch (e) { }
    log_(u, '[' + KLEE.WHO + '] 아차차, 내가 말이 많았네 — 파티 ' + n + '명에게 신호');
    try { if (typeof saveDarkRunState === 'function') saveDarkRunState(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 아차차, 내가 말이 많았네.]\n\n'
        + '파티 ' + n + '명에게 신호를 남겼습니다.\n\n'
        + '· 받은 사원  포인트 1.5배 · 회수품 2배\n'
        + '· 보낸 사원  포인트 2배 · 회수품 2.5배');
}

// 내 몫 — 신호가 남아 있나
function signMult() {
    const r = run(), p = party();
    const s = (p && p.klee && p.klee.sign) || null;
    if (!r || !s) return null;
    const u = me();
    return (u && s.by === u.code) ? KLEE.SIGN.host : KLEE.SIGN.mate;
}

// 회수품 — emLootMult 를 거쳐 들어간다 (eye.js · talkshow.js 와 같은 자리)
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function') return;
        if (emLootMult._klee) { clearInterval(iv); return; }
        const _e = emLootMult;
        const wrapped = function (user) {
            let m = _e.apply(this, arguments);
            try {
                const s = signMult();
                if (s) m *= s.loot;
                // ④ 로 받은 「회수품 확률 +n%」
                const pct = (window.ibSum ? (window.ibSum(user || me()).kleeLoot || 0) : 0);
                if (pct > 0) m *= (1 + pct / 100);
            } catch (e) { }
            return m;
        };
        wrapped._klee = true;
        emLootMult = wrapped;
        window.emLootMult = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] 회수품 배율 연결');
    }, 500);
})();

// 포인트 — 정산이 적어 넣은 몫을 재서 그만큼 더 얹는다
(function hookPoint() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._klee) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const wrapped = function () {
            let s = null, before = 0;
            try { s = signMult(); before = (me() || {}).points || 0; } catch (e) { }
            const out = _r.apply(this, arguments);
            try {
                if (!s) return out;
                const u = me();
                const got = (u.points || 0) - before;
                if (got <= 0) return out;
                const add = Math.round(got * (s.pt - 1));
                if (add <= 0) return out;
                u.points += add;
                log_(u, '[' + KLEE.WHO + '] 신호 — 포인트 ' + s.pt + '배 (+' + add + ' P)');
                try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
                // 정산서에 한 줄 보탠다
                const b = document.getElementById('dro-body') || document.getElementById('darkness-body');
                if (b) {
                    const d = document.createElement('div');
                    d.style.cssText = 'margin:0 0 12px 0; padding:9px 11px; border-radius:6px; font-size:11px;'
                        + ' background:rgba(47,111,159,0.14); border:1px solid #2f6f9f; color:#bcdcf2;';
                    d.innerHTML = '📱 <b>' + esc(KLEE.WHO) + '</b> 의 신호 — 포인트 <b>' + s.pt
                        + '배</b> (+' + add + ' P) · 회수품 확률 <b>' + s.loot + '배</b>';
                    b.insertBefore(d, b.firstChild);
                }
            } catch (e) { }
            return out;
        };
        wrapped._klee = true;
        renderDarkResult = wrapped;
        window.renderDarkResult = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] 포인트 배율 연결');
    }, 500);
})();

// ==========================================
// ③ 식사는? — 격리 시간을 줄인다
// ==========================================
function inRoom(u) { return !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil); }

function m3Open() {
    const u = me();
    shut();
    if (left(u, 'm3') <= 0) { alert_('오늘은 더 보낼 수 없습니다.'); return; }
    if (inRoom(u)) return m3Sos();

    const list = users().filter(function (x) { return x.code !== u.code && inRoom(x); });
    if (!list.length) { alert_('상담실·선녀탕에 있는 사원이 없습니다.'); return; }

    const rows = list.map(function (t) {
        const h = Math.max(0, (t.quarantineUntil - Date.now()) / 3600000);
        return '<button class="klee-one game-btn" data-c="' + esc(t.code) + '" style="' + BTN + '">'
            + '<div style="font-size:12px; color:#e6eef4;">' + esc(t.name)
            + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span></div>'
            + '<div style="font-size:10px; color:#6fa8cf; margin-top:3px;">남은 격리 ' + h.toFixed(1) + '시간 → '
            + Math.max(0, h - 1).toFixed(1) + '시간</div></button>';
    }).join('');

    const w = box(bubble('식사는?<br>안 거르고 잘 챙겨 먹어요.')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:8px;">문자를 보낼 사원을 고르십시오. '
        + '격리가 1시간 줄어듭니다.</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#klee-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.klee-one'), function (b) {
        b.onclick = function () { m3Cut(b.dataset.c); };
    });
}

function m3Cut(code) {
    const u = me(), t = db.users[code];
    shut();
    if (!t || !inRoom(t)) { alert_('그 사원은 이미 나왔습니다.'); return; }
    if (left(u, 'm3') <= 0) { alert_('오늘은 더 보낼 수 없습니다.'); return; }

    const nu = (t.quarantineUntil || 0) - KLEE.CUT_MS;
    const out = nu <= Date.now();
    const f = {};
    if (out) {
        t.quarantineUntil = 0;
        t.quarantineExitPollution = 0;
        t.quarantineHospital = false;
        t.pollution = t.quarantineExitPollution || 0;
        t.lastPollutionTime = Date.now();
        t.foxRoomAnswered = false;
        Object.assign(f, {
            quarantineUntil: 0, quarantineExitPollution: 0, quarantineHospital: false,
            pollution: t.pollution, lastPollutionTime: t.lastPollutionTime, foxRoomAnswered: false
        });
    } else {
        t.quarantineUntil = nu;
        f.quarantineUntil = nu;
    }
    log_(t, '[' + KLEE.WHO + '] 식사는? — 격리가 ' + (out ? '풀렸습니다.' : '1시간 줄었습니다.'));
    f.history = t.history;
    f.hasItemUsedOnMe = true;
    try { if (typeof updateUserFields === 'function') updateUserFields(code, f); } catch (e) { }

    spend(u, 'm3');
    log_(u, '[' + KLEE.WHO + '] 식사는? → ' + t.name);
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 식사는?]\n\n' + t.name + ' 사원의 격리가 '
        + (out ? '풀렸습니다.' : '1시간 줄었습니다.')
        + '\n\n오늘 남은 횟수 ' + left(u, 'm3') + ' / ' + KLEE.DAY.m3);
}

// 내가 격리 중일 때 — 단체 문자. 읽고 확인을 누른 수만큼 줄어든다
function m3Sos() {
    const u = me();
    shut();
    if (db_()) {
        db_().ref('kleeSOS/' + u.code).set({
            code: u.code, name: u.name, no: u.no || '', at: Date.now(), ok: {}
        }).catch(function () { });
    }
    spend(u, 'm3');
    log_(u, '[' + KLEE.WHO + '] 식사는? — 단체 문자 발신');
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 식사는?]\n\n'
        + '사내 전원에게 단체 문자를 보냈습니다.\n'
        + '읽고 확인을 누른 사람 수만큼 격리가 1시간씩 줄어듭니다.\n\n'
        + '오늘 남은 횟수 ' + left(u, 'm3') + ' / ' + KLEE.DAY.m3);
}

// 단체 문자를 받는 쪽
(function sosWatch() {
    const seen = {};
    let on = false;
    setInterval(function () {
        if (on || !db_() || !me()) return;
        on = true;
        db_().ref('kleeSOS').on('value', function (s) {
            const all = s.val() || {};
            const u = me();
            if (!u) return;
            Object.keys(all).forEach(function (c) {
                const v = all[c];
                if (!v || c === u.code) return;
                if (Date.now() - (v.at || 0) > 12 * 3600 * 1000) return;   // 묵은 것은 안 띄운다
                if ((v.ok || {})[u.code]) return;
                if (seen[c] === v.at) return;
                seen[c] = v.at;
                sosPop(v);
            });
        });
    }, 1500);

    function sosPop(v) {
        shut();
        ring();
        const w = box(bubble('식사는?<br>' + esc(v.name) + ' 사원이 아직 안에 있어요.<br>'
            + '확인만 눌러 줘도 한 시간 빨리 나와요.', KLEE.WHO)
            + '<button id="klee-ok" class="game-btn" style="' + BTN + ' text-align:center;">확인 — 1시간 줄여 준다</button>'
            + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">나중에</button>', 100002);
        w.querySelector('#klee-x').onclick = shut;
        w.querySelector('#klee-ok').onclick = function () {
            shut();
            const u = me();
            if (!u || !db_()) return;
            db_().ref('kleeSOS/' + v.code + '/ok/' + u.code).set(Date.now()).catch(function () { });
            const t = db.users[v.code];
            if (t && inRoom(t)) {
                const nu = Math.max(0, (t.quarantineUntil || 0) - KLEE.CUT_MS);
                const f = (nu <= Date.now())
                    ? { quarantineUntil: 0, quarantineExitPollution: 0, quarantineHospital: false,
                        pollution: t.quarantineExitPollution || 0, lastPollutionTime: Date.now(), foxRoomAnswered: false }
                    : { quarantineUntil: nu };
                Object.assign(t, f);
                log_(t, '[' + KLEE.WHO + '] ' + u.name + ' 사원이 확인 — 격리 1시간 단축');
                f.history = t.history;
                try { if (typeof updateUserFields === 'function') updateUserFields(v.code, f); } catch (e) { }
            }
            alert_(esc(v.name) + ' 사원의 격리를 1시간 줄였습니다.');
        };
    }
})();

// ==========================================
// ④ 수고해요 후배님 ㅋㅋ — 예약 전송
// ==========================================
const GIFTS = [
    { k: 'luck',     n: '행운',        lo: 1,  hi: 3,   unit: '' },
    { k: 'bon',      n: '판정',        lo: 1,  hi: 3,   unit: '' },
    { k: 'eva',      n: '회피',        lo: 1,  hi: 3,   unit: '' },
    { k: 'kleeLoot', n: '회수품 확률', lo: 50, hi: 150, unit: '%' },
    { k: 'gim',      n: '기믹 파훼',   lo: 1,  hi: 2,   unit: '회' }
];
function rollGift() {
    const g = GIFTS[Math.floor(Math.random() * GIFTS.length)];
    const step = (g.k === 'kleeLoot') ? 50 : 1;
    const n = Math.floor(Math.random() * ((g.hi - g.lo) / step + 1)) * step + g.lo;
    return { k: g.k, n: g.n, v: n, unit: g.unit };
}
function kleePath(sub) {
    const r = run();
    return r && r.partyId ? 'darkParties/' + r.partyId + '/klee/' + sub : null;
}

function m4Send() {
    const u = me(), r = run();
    shut();
    if (left(u, 'm4') <= 0) { alert_('오늘은 더 보낼 수 없습니다.'); return; }
    if (!r || !r.isParty || !r.partyId) { alert_('파티로 어둠에 들어갔을 때만 보낼 수 있습니다.'); return; }
    const p = party();
    const pool = Object.keys((p && (p.alive || p.members)) || {})
        .filter(function (c) { return c !== u.code; });
    if (pool.length < 1) { alert_('보낼 파티원이 없습니다.'); return; }

    // 무작위 둘 — 하나뿐이면 하나만
    const shuf = pool.slice().sort(function () { return Math.random() - 0.5; });
    const picked = shuf.slice(0, Math.min(KLEE.BOOK, shuf.length));
    const names = picked.map(function (c) {
        return (p.members && p.members[c] && p.members[c].name) || (db.users[c] || {}).name || c;
    });

    if (db_()) {
        const up = {};
        picked.forEach(function (c) {
            up[kleePath('book') + '/' + c] = { by: u.code, name: u.name, at: Date.now() };
        });
        db_().ref('/').update(up).catch(function () { });
    }
    r.kleeBooked = (r.kleeBooked || []).concat(picked);
    spend(u, 'm4');
    log_(u, '[' + KLEE.WHO + '] 예약 전송 → ' + names.join(', '));
    try { if (typeof saveDarkRunState === 'function') saveDarkRunState(); } catch (e) { }
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 수고해요 후배님 ㅋㅋ]\n\n'
        + '예약 전송 — ' + names.join(', ') + '\n\n'
        + '내가 쓰러지면 그 둘에게 문자와 버프가 갑니다.\n'
        + '나는 오염 50%만 남긴 채 바로 빠져나옵니다.\n\n'
        + '오늘 남은 횟수 ' + left(u, 'm4') + ' / ' + KLEE.DAY.m4);
}

// 죽음 — 예약을 보내 두었으면 끌려가지 않는다
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._klee) { clearInterval(iv); return; }
        const _d = darkDeath;
        const wrapped = function (text) {
            const r = run(), u = me();
            let booked = [];
            try { booked = (r && Array.isArray(r.kleeBooked)) ? r.kleeBooked : []; } catch (e) { }
            if (!r || r._dead || !u || !booked.length) return _d.apply(this, arguments);
            try { kleeEscape(text, booked); } catch (e) { console.warn('[K.LEE]', e); return _d.apply(this, arguments); }
        };
        wrapped._klee = true;
        darkDeath = wrapped;
        window.darkDeath = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] 예약 전송 · 탈출 연결');
    }, 500);
})();

function kleeEscape(text, booked) {
    const u = me(), r = run();
    r._dead = true;
    r.kleeOut = true;

    // 받을 두 사람에게 문자와 버프를 적어 둔다 — 각자 제 화면에서 제 몸에 건다
    if (db_()) {
        const up = {};
        booked.forEach(function (c) {
            const g = rollGift();
            up[kleePath('mail') + '/' + c] = {
                by: u.code, name: u.name, k: g.k, n: g.n, v: g.v, unit: g.unit, at: Date.now()
            };
        });
        db_().ref('/').update(up).catch(function () { });
    }

    // 나 — 오염 50%만 남기고 바로 나온다 (동결을 타지 않는다)
    const was = Number(u.pollution) || 0;
    u.pollution = 50;
    u.lastPollutionTime = Date.now();

    // 포인트 일부
    let got = 0;
    try {
        const z = DARK_ZONES[r.zone];
        const mid = z && z.reward ? Math.floor((z.reward[0] + z.reward[1]) / 2) : 0;
        got = Math.max(10, Math.round(mid * KLEE.DEAD_PT));
        u.points = (u.points || 0) + got;
    } catch (e) { }

    r.fail += 1;
    r.failedRun = true;
    log_(u, '[' + KLEE.WHO + '] 예약 문자 — 쓰러진 자리에서 빠져나왔습니다. (오염 50% · +' + got + ' P)');

    try {
        if (db_() && r.partyId) {
            db_().ref('darkParties/' + r.partyId + '/alive/' + u.code).remove();
            if (typeof sendPartyChat === 'function') sendPartyChat(u.name + ' 사원의 전화기가 꺼졌습니다.', true);
        }
    } catch (e) { }

    ring();
    try {
        darkBodyEl().innerHTML = darkBox('끊김', text || '여기까지였다.',
            '<div style="background:rgba(47,111,159,0.12); border:1px solid #2f6f9f; border-radius:8px;'
            + ' padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">'
            + '<div style="font-weight:bold; color:#7fb6dd; margin-bottom:8px; border-bottom:1px dashed #2f6f9f;'
            + ' padding-bottom:6px;">[예약 전송 완료]</div>'
            + '화면이 꺼지기 직전에 예약해 둔 문자가 나갔다.<br>'
            + '<span style="color:#aaa; font-size:10px;">받는 사람 ' + booked.length + '명 — 누가 받았는지는 적혀 있지 않다.</span><br><br>'
            + '오염도 <b style="color:#ff9800;">' + was + '% → 50%</b> '
            + '<span style="font-size:10px; color:#888;">(동결 무시)</span><br>'
            + '포인트 <b style="color:#ffd700;">+' + got + ' P</b> '
            + '<span style="font-size:10px; color:#888;">(걸어간 몫)</span><br>'
            + '<span style="color:#aaa;">상담실로 끌려가지 않습니다.</span>'
            + '</div>'
            + darkChoiceBtn('전화를 끊는다.', 'finishDarkDeath()'));
    } catch (e) { }
    try { if (typeof darkAmbienceStop === 'function') darkAmbienceStop(); } catch (e) { }
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
}

// 받는 쪽 — 문자와 버프
(function mailWatch() {
    const got = {};
    setInterval(function () {
        const u = me(), p = party();
        if (!u || !p) return;
        const m = (p.klee && p.klee.mail && p.klee.mail[u.code]) || null;
        if (!m || !m.k) return;
        const key = m.by + '|' + m.at;
        if (got[key]) return;
        got[key] = 1;
        try { window.ibAdd(u, m.k, m.v, KLEE.BUFF_MS, KLEE.WHO); } catch (e) { }
        noteAdd(u, m.n + ' +' + m.v + (m.unit || '') + ' (24시간)');
        log_(u, '[' + KLEE.WHO + '] 수고해요 후배님 ㅋㅋ — ' + m.n + ' +' + m.v + (m.unit || ''));
        try { if (typeof saveFields === 'function') saveFields({ itemBuffs: 1, badge: 1, history: 1 }); } catch (e) { }
        mailPop(m);
    }, 1200);

    function mailPop(m) {
        ring();
        const w = box(bubble('수고해요 후배님 ㅋㅋ', KLEE.WHO)
            + '<div style="margin:2px 0 12px 0; padding:11px 12px; border-radius:8px;'
            + ' background:rgba(47,111,159,0.14); border:1px solid #2f6f9f; text-align:center;">'
            + '<div style="font-size:10px; color:#7fb6dd;">예약된 문자가 도착했습니다</div>'
            + '<div style="font-size:16px; color:#ffd700; font-weight:bold; margin-top:6px;">'
            + esc(m.n) + ' +' + esc(m.v) + esc(m.unit || '') + '</div>'
            + '<div style="font-size:10px; color:#8a8a8a; margin-top:5px;">24시간</div></div>'
            + '<button id="klee-x" class="game-btn" style="' + BTN + ' text-align:center;">답장하지 않는다</button>',
            100003);
        w.querySelector('#klee-x').onclick = shut;
    }
})();

// ==========================================
// ⑤ 혹시 뭐 살 거 있으신가? — 공용시설·랜덤박스 행운
// ==========================================
function shopOn(u) { return !!(u && (u.kleeShop || 0) > Date.now()); }

function m5Pick() {
    const u = me();
    shut();
    if (left(u, 'm5') <= 0) { alert_('오늘은 더 보낼 수 없습니다.'); return; }
    const list = users().filter(function (x) { return x.code !== u.code; });
    if (!list.length) { alert_('보낼 사원이 없습니다.'); return; }

    const rows = list.map(function (t) {
        return '<button class="klee-one game-btn" data-c="' + esc(t.code) + '" style="' + BTN + '">'
            + '<div style="font-size:12px; color:#e6eef4;">' + esc(t.name)
            + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (shopOn(t) ? ' <span style="font-size:9px; color:#6fa8cf;">· 이미 걸려 있음</span>' : '')
            + '</div></button>';
    }).join('');

    const w = box(bubble('혹시 뭐 살 거 있으신가?<br>내가 아는 데가 좀 있어요.')
        + '<div style="font-size:11px; color:#9fb8c8; margin-bottom:8px;">문자를 보낼 사원을 고르십시오. '
        + '보내면 나도 같은 효과를 받습니다. (24시간)</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="klee-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#klee-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.klee-one'), function (b) {
        b.onclick = function () { m5Do(b.dataset.c); };
    });
}

function m5Do(code) {
    const u = me(), t = db.users[code];
    shut();
    if (!t) { alert_('사원을 찾지 못했습니다.'); return; }
    if (left(u, 'm5') <= 0) { alert_('오늘은 더 보낼 수 없습니다.'); return; }
    const until = Date.now() + KLEE.BUFF_MS;

    const SHOP_LINE = '구매 행운 — 공용시설 200%↑ · 랜덤박스 150%↑ (24시간)';
    t.kleeShop = until;
    noteAdd(t, SHOP_LINE);
    log_(t, '[' + KLEE.WHO + '] 혹시 뭐 살 거 있으신가? — 공용시설 행운 200%↑ · 랜덤박스 행운 150%↑ (24시간)');
    try {
        if (typeof updateUserFields === 'function') {
            updateUserFields(code, { kleeShop: until, badge: t.badge, history: t.history, hasItemUsedOnMe: true });
        }
    } catch (e) { }

    u.kleeShop = until;
    noteAdd(u, SHOP_LINE);
    spend(u, 'm5');
    log_(u, '[' + KLEE.WHO + '] 혹시 뭐 살 거 있으신가? → ' + t.name);
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    ring();
    alert_('[' + KLEE.WHO + ' : 혹시 뭐 살 거 있으신가?]\n\n'
        + t.name + ' 사원과 나 모두 24시간 동안\n'
        + '· 공용시설 행운 200% 상승\n· 랜덤박스 행운 150% 상승\n\n'
        + '오늘 남은 횟수 ' + left(u, 'm5') + ' / ' + KLEE.DAY.m5);
}

// 공용시설 행운
(function hookFac() {
    const iv = setInterval(function () {
        if (typeof facilityLuckMult !== 'function') return;
        if (facilityLuckMult._klee) { clearInterval(iv); return; }
        const _f = facilityLuckMult;
        const wrapped = function (user) {
            let m = _f.apply(this, arguments);
            try { if (shopOn(user || me())) m *= KLEE.SHOP.fac; } catch (e) { }
            return m;
        };
        wrapped._klee = true;
        facilityLuckMult = wrapped;
        window.facilityLuckMult = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] 공용시설 행운 연결');
    }, 500);
})();

// 랜덤박스 — 비싼(좋은) 것이 잘 나오도록 기울기를 눕힌다
(function hookBox() {
    const iv = setInterval(function () {
        if (typeof emBoxLuck !== 'function') return;
        if (emBoxLuck._klee) { clearInterval(iv); return; }
        const _b = emBoxLuck;
        const wrapped = function (user) {
            let m = _b.apply(this, arguments);
            try { if (shopOn(user || me())) m *= KLEE.SHOP.box; } catch (e) { }
            return m;
        };
        wrapped._klee = true;
        emBoxLuck = wrapped;
        window.emBoxLuck = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] 랜덤박스 행운 연결');
    }, 500);
})();

// ==========================================
// 장착칸의 [📲 목록] 단추
// ==========================================
(function badge() {
    const ID = 'klee-list-btn';
    function stick() {
        const box2 = document.getElementById('inventory-list-container');
        if (!box2) return;
        const old = document.getElementById(ID);
        if (!wears(me())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;

        let card = null;
        for (let i = 0; i < box2.children.length; i++) {
            const t = box2.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(NAME) >= 0) { card = box2.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;'
            + ' background:linear-gradient(145deg,#2f6f9f,#143449) !important; border-color:#5ea6d6 !important;';
        b.textContent = '📲 목록';
        b.onclick = menu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._kleeBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._kleeBtn = true;
            clearInterval(iv);
        }, 400);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 방장이 차고 있으면 — 모두의 화면이 전화기 안으로
// ==========================================
//
//   방장이 누구인지는 방에서 읽는다. 그 사람이 K.LEE 를 차고 있으면
//   같은 방의 **모든** 화면에 테두리가 붙는다. 따로 적어 두지 않으므로
//   방장이 바뀌면 그 자리에서 따라 바뀐다.
const PHONE_CSS = `
#dark-run-overlay.klee-ph {
    background: radial-gradient(120% 90% at 50% 0%, #26282c 0%, #0b0c0e 70%) !important;
    align-items: center !important;
    padding: 13px 12px !important;
    box-sizing: border-box;
}
#dark-run-overlay.klee-ph > div {
    max-width: 412px !important;
    height: calc(100dvh - 26px) !important;
    max-height: calc(100dvh - 26px) !important;
    border-radius: 44px !important;
    border: 10px solid #0a0a0c !important;
    background: #050505 !important;
    overflow: hidden !important;
    position: relative;
    box-sizing: border-box;
    box-shadow:
        0 0 0 2px #7c7d82,
        0 0 0 4px #cfd1d6,
        0 0 0 6px #5f6066,
        0 0 0 7px #2b2c30,
        0 16px 46px rgba(0,0,0,0.75);
}
/* 다이나믹 아일랜드 */
#klee-island {
    position: absolute; top: 9px; left: 50%; transform: translateX(-50%);
    width: 118px; height: 31px; border-radius: 16px; background: #000;
    z-index: 40; pointer-events: none;
    display: flex; align-items: center; justify-content: flex-end;
    box-shadow: inset 0 0 0 1px #141416;
}
#klee-island::after {
    content: ''; width: 9px; height: 9px; border-radius: 50%; margin-right: 11px;
    background: radial-gradient(circle at 35% 35%, #2b4a8a 0%, #101a33 70%);
    box-shadow: inset 0 0 2px #000;
}
/* 아일랜드에 가리지 않게 머리를 내린다 */
#dark-run-overlay.klee-ph > div > div:first-child { padding-top: 46px !important; }
/* 아래 손잡이 선 */
#klee-bar {
    position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%);
    width: 124px; height: 4px; border-radius: 3px; background: rgba(255,255,255,0.33);
    z-index: 40; pointer-events: none;
}
#dark-run-overlay.klee-ph #dro-chat { padding-bottom: 14px; }
/* 옆 단추 — 테두리 바깥에 붙는다 */
.klee-key {
    position: fixed; z-index: 9999999; pointer-events: none; border-radius: 3px;
    background: linear-gradient(90deg,#6f7075,#b9bbc0 45%,#6f7075);
    box-shadow: 0 1px 2px rgba(0,0,0,0.6);
}
@media (max-width: 430px) {
    #dark-run-overlay.klee-ph { padding: 8px 7px !important; }
    #dark-run-overlay.klee-ph > div {
        height: calc(100dvh - 16px) !important; max-height: calc(100dvh - 16px) !important;
        border-radius: 38px !important; border-width: 8px !important;
    }
}
@media (prefers-reduced-motion: reduce) { .klee-key { transition: none; } }
`;

let ST = null, FORCE = null;
function css() {
    if (!ST || !ST.isConnected) {
        ST = document.createElement('style');
        ST.id = 'klee-phone-css';
        ST.textContent = PHONE_CSS;
        (document.head || document.documentElement).appendChild(ST);
    }
}

// 방이 한 호흡 비는 일이 있다 (서버 동기화 사이). 그때마다 테두리가
// 깜빡이지 않도록 마지막으로 본 방장을 들고 있는다.
const LEAD = {};
function leaderWears() {
    if (FORCE != null) return FORCE;
    const r = run();
    if (!r || !r.partyId) return false;
    const u = me();
    if (!u) return false;
    if (r.isLeader && wears(u)) return true;          // 내가 방장이고 내가 차고 있다

    const p = party();
    let lead = p && p.leader;
    if (lead) LEAD[r.partyId] = lead; else lead = LEAD[r.partyId];
    if (!lead) return false;
    if (typeof db === 'undefined' || !db.users) return false;
    return wears(lead === u.code ? u : db.users[lead]);
}

function keyEl(id) {
    let e = document.getElementById(id);
    if (!e) {
        e = document.createElement('div');
        e.id = id;
        e.className = 'klee-key';
        document.body.appendChild(e);
    }
    return e;
}
function dropKeys() {
    ['klee-k1', 'klee-k2', 'klee-k3', 'klee-k4'].forEach(function (id) {
        const e = document.getElementById(id);
        if (e) e.remove();
    });
}

function paint() {
    const ov = document.getElementById('dark-run-overlay');
    if (!ov) return;
    const on = leaderWears() && ov.style.display !== 'none';
    if (!on) {
        if (ov.classList.contains('klee-ph')) {
            ov.classList.remove('klee-ph');
            const i = document.getElementById('klee-island'); if (i) i.remove();
            const b = document.getElementById('klee-bar'); if (b) b.remove();
        }
        dropKeys();
        return;
    }
    css();
    ov.classList.add('klee-ph');

    const panel = ov.firstElementChild;
    if (!panel) return;
    if (!document.getElementById('klee-island')) {
        const d = document.createElement('div'); d.id = 'klee-island'; panel.appendChild(d);
    }
    if (!document.getElementById('klee-bar')) {
        const d = document.createElement('div'); d.id = 'klee-bar'; panel.appendChild(d);
    }

    // 옆 단추 — 테두리 자리를 재서 바깥에 붙인다
    const r = panel.getBoundingClientRect();
    const put = function (id, side, top, h) {
        const e = keyEl(id);
        e.style.width = '3px';
        e.style.height = h + 'px';
        e.style.top = (r.top + top) + 'px';
        if (side === 'l') { e.style.left = (r.left - 3) + 'px'; e.style.right = 'auto'; }
        else { e.style.left = (r.right) + 'px'; e.style.right = 'auto'; }
    };
    const H = r.height;
    put('klee-k1', 'l', Math.round(H * 0.155), 26);   // 무음
    put('klee-k2', 'l', Math.round(H * 0.225), 46);   // 음량 +
    put('klee-k3', 'l', Math.round(H * 0.300), 46);   // 음량 −
    put('klee-k4', 'r', Math.round(H * 0.250), 72);   // 전원
}
setInterval(function () { try { paint(); } catch (e) { } }, 700);
window.addEventListener('resize', function () { try { paint(); } catch (e) { } });

window.kleePhone = function (on) {
    FORCE = (on === undefined || on === null) ? null : !!on;
    paint();
    console.log('[K.LEE] 전화기 테두리 ' + (FORCE === null ? '자동' : (FORCE ? '켬' : '끔')));
};

// ==========================================
// EPIC — Qtrew-???-■■■ 에서도 듣게 한다
// ==========================================
//
// ■ 왜 따로 붙여야 했나
//
//   EPIC 은 보통 어둠과 **다른 길**로 끝난다. epic.js 가 제 것을 쓴다.
//
//       보통 어둠          EPIC
//       ─────────────      ─────────────
//       darkDeath          epicDeath          ← ④ 예약 탈출이 안 걸렸다
//       renderDarkResult   epicSettle         ← ② 포인트 배율이 안 걸렸다
//
//   그래서 EPIC 에 들어가면 ② 와 ④ 가 **아무 일도 하지 않았다.**
//   ①·③·⑤ 는 탐사와 무관하므로 전부터 잘 들었고, 방장 전화기 테두리도
//   방(darkParties)에서 방장을 읽으니 EPIC 파티에서 그대로 나온다.
//
// ■ 붙인 것
//
//   1. epicSettle — 지급한 몫을 재서 ② 신호 배율만큼 더 얹는다.
//      (epic-show.js 의 무대 열기와 같은 자리·같은 방식. 둘 다 걸리면
//       차례로 곱해진다.)
//   2. epicDeath — ④ 예약을 보내 두었으면 끌려가지 않는다.
//      · 오염 50% · 격리 없음 · 포인트와 반입품을 **그대로 들고 나온다**
//        (원래 EPIC 사망은 전액 소실 + 4시간 입원이다)
//      · 예약한 둘에게 문자와 버프가 나간다
//      · 정산은 EPIC 제 것(epicSettle)을 그대로 쓴다 — 0.35배 몫과
//        「단말로 복귀한다」 단추까지. 정산서의 「🦊 상담실로 긴급 이송」
//        칸만 K.LEE 칸으로 갈아 끼운다.
//
// ■ 못 하는 것 — ② 와 ④ 의 회수품 배율
//
//   EPIC 의 회수품은 er.found 에 장면이 직접 밀어 넣는다. emLootMult 를
//   거치지 않는다. 배율을 걸 자리가 **없다.** (epic-show.js 도 같은 것을
//   적어 두었다) 그래서 EPIC 에서는 포인트 배율만 걸린다.
const EC = (typeof EPIC_CODE !== 'undefined') ? EPIC_CODE : 'Qtrew-???-■■■';
function inEpic() {
    const r = run();
    return !!(r && (r.epic || r.zone === EC));
}

// 1. 지급에 ② 신호 배율
(function hookEpicSettle() {
    const iv = setInterval(function () {
        if (typeof epicSettle !== 'function') return;
        if (epicSettle._klee) { clearInterval(iv); return; }
        const _s = epicSettle;
        const wrapped = function () {
            let s = null, before = 0;
            try { s = signMult(); before = (me() || {}).points || 0; } catch (e) { }
            const out = _s.apply(this, arguments);
            try {
                if (!s) return out;
                const u = me();
                const got = (u.points || 0) - before;
                if (got <= 0) return out;
                const add = Math.round(got * (s.pt - 1));
                if (add <= 0) return out;
                u.points += add;
                log_(u, '[' + KLEE.WHO + '] 신호 — 포인트 ' + s.pt + '배 (+' + add + ' P)');
                try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
                const b = document.getElementById('dro-body') || document.getElementById('darkness-body');
                if (b) {
                    const d = document.createElement('div');
                    d.style.cssText = 'margin:0 0 12px 0; padding:9px 11px; border-radius:6px; font-size:11px;'
                        + ' background:rgba(47,111,159,0.14); border:1px solid #2f6f9f; color:#bcdcf2;';
                    d.innerHTML = '📱 <b>' + esc(KLEE.WHO) + '</b> 의 신호 — 포인트 <b>' + s.pt
                        + '배</b> (+' + add + ' P)'
                        + '<br><span style="font-size:10px; color:#8ab4cf;">'
                        + '회수품 배율은 ' + esc(EC) + ' 에서 걸 자리가 없습니다.</span>';
                    b.insertBefore(d, b.firstChild);
                }
            } catch (e) { }
            return out;
        };
        wrapped._klee = true;
        epicSettle = wrapped;
        window.epicSettle = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] EPIC 포인트 배율 연결');
    }, 500);
})();

// 2. ④ 예약을 보내 두었으면 끌려가지 않는다
(function hookEpicDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._klee) { clearInterval(iv); return; }
        const _d = epicDeath;
        const wrapped = function (txt) {
            const r = run(), u = me();
            let booked = [];
            try { booked = (r && Array.isArray(r.kleeBooked)) ? r.kleeBooked : []; } catch (e) { }
            if (!r || !u || !booked.length || !inEpic()) return _d.apply(this, arguments);
            if (typeof er === 'undefined' || !er || er.dead || r._dead) return _d.apply(this, arguments);
            try { epicEscape(txt, booked); }
            catch (e) { console.warn('[K.LEE]', e); return _d.apply(this, arguments); }
        };
        wrapped._klee = true;
        epicDeath = wrapped;
        window.epicDeath = wrapped;
        clearInterval(iv);
        console.log('[K.LEE] EPIC 예약 탈출 연결');
    }, 500);
})();

function epicEscape(txt, booked) {
    const u = me(), r = run();
    er.dead = true;             // 두 번 쓰러지지 않게
    er._calledHelp = false;
    er.danger = null;
    r._dead = true;
    r.kleeOut = true;
    r.fail = (r.fail || 0) + 2;

    // 받을 두 사람에게 문자와 버프를 적어 둔다 — 각자 제 화면에서 제 몸에 건다
    if (db_()) {
        const up = {};
        booked.forEach(function (c) {
            const g = rollGift();
            up[kleePath('mail') + '/' + c] = {
                by: u.code, name: u.name, k: g.k, n: g.n, v: g.v, unit: g.unit, at: Date.now()
            };
        });
        db_().ref('/').update(up).catch(function () { });
    }

    // 나 — 오염 50%만. 포인트도 반입품도 그대로 둔다
    const was = Number(u.pollution) || 0;
    u.pollution = 50;
    u.lastPollutionTime = Date.now();
    er.lostPoints = 0;
    er.lostItems = [];
    er.kleeOut = true;

    log_(u, '[' + KLEE.WHO + '] 예약 문자 — ' + EC
        + ' 에서 빠져나왔습니다. (오염 50% · 포인트·반입품 보존)');

    try {
        if (db_() && r.partyId) {
            db_().ref('darkParties/' + r.partyId + '/epicHelp/' + u.code).remove();
            db_().ref('darkParties/' + r.partyId + '/alive/' + u.code).remove();
            if (typeof sendPartyChat === 'function') sendPartyChat(u.name + ' 사원의 전화기가 꺼졌습니다.', true);
        }
    } catch (e) { }

    ring();
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }

    // 정산은 EPIC 제 것을 그대로 쓴다 (0.35배 · 「단말로 복귀한다」 단추)
    epicSettle('dead', txt);
    try { swapDeadBox(was, booked.length); } catch (e) { }
}

// 정산서의 「전액 소실 · 🦊 상담실로 긴급 이송」 칸을 갈아 끼운다
function swapDeadBox(was, n) {
    const b = document.getElementById('dro-body') || document.getElementById('darkness-body');
    if (!b) return false;
    // 사망 칸만 테두리에 #7f0000 을 쓴다 — 그것으로 집는다
    let hit = b.querySelector('div[style*="7f0000"]');
    if (!hit) {
        const list = Array.prototype.filter.call(b.querySelectorAll('div'), function (d) {
            return /전액 소실|긴급 이송/.test(d.innerText || '');
        });
        hit = list.length ? list[list.length - 1] : null;
    }
    if (!hit) return false;
    hit.setAttribute('style', 'margin-top:6px; padding-top:6px;'
        + ' border-top:1px dashed #2f6f9f; color:#bcdcf2;');
    hit.innerHTML = '<div style="font-weight:bold; color:#7fb6dd;">[예약 전송 완료]</div>'
        + '화면이 꺼지기 직전에 예약해 둔 문자가 나갔다.<br>'
        + '<span style="color:#aaa; font-size:10px;">받는 사람 ' + (n || 0)
        + '명 — 누가 받았는지는 적혀 있지 않다.</span><br>'
        + '보유 포인트 <b style="color:#4CAF50;">그대로</b> · '
        + '반입품 <b style="color:#4CAF50;">그대로</b><br>'
        + '오염도 <b style="color:#ff9800;">' + was + '% → 50%</b> '
        + '<span style="font-size:10px; color:#888;">(동결 무시)</span><br>'
        + '<span style="color:#aaa;">상담실로 끌려가지 않습니다.</span>';
    return true;
}

// ==========================================
// 상담사 · 확인
// ==========================================
window.kleeGive = function (who, n) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, n || 1));
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

window.kleeState = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · ' + NAME + ' =====', 'color:#7fb6dd; font-size:13px');
    console.log('  장착        :', wears(u) ? 'O' : '✗');
    console.log('  오늘 남은 몫:',
        MSG.filter(function (m) { return KLEE.DAY[m.id] != null; })
           .map(function (m) { return m.t.slice(0, 2) + ' ' + left(u, m.id) + '/' + KLEE.DAY[m.id]; }).join(' · '));
    console.log('  ⑤ 구매 행운:', shopOn(u)
        ? Math.round((u.kleeShop - Date.now()) / 60000) + '분 남음' : '없음');
    const b = liveBuffs(u).filter(function (x) { return x.src === KLEE.WHO; });
    console.log('  K.LEE 버프  :', b.length
        ? b.map(function (x) { return bname(x.k) + ' +' + x.v + bunit(x.k); }).join(' · ') : '없음');
    const r = run();
    if (r && r.zone) {
        console.log('  이번 탐사   :', r.zone, '· 신호', signMult() ? '있음' : '없음',
            '· 예약', (r.kleeBooked || []).length + '명',
            inEpic() ? '(EPIC — 회수품 배율은 걸 자리가 없습니다)' : '');
    }
    // 적힌 📲 줄
    const notes = ((u.badge && u.badge.notes) || '').split('|')
        .map(function (x) { return x.trim(); })
        .filter(function (x) { return x.indexOf(NOTE) >= 0; });
    console.log('  특이사항 📲 :', notes.length ? notes.join(' / ') : '없음');
    notes.forEach(function (n) {
        console.log('     ' + n + ' →', window.kleeNoteLive(u, n)
            ? '살아 있음' : '✗ 끝남 — 다음 정리에 지워집니다');
    });
    console.log('  연결        :',
        '보통 죽음', (typeof darkDeath === 'function' && darkDeath._klee) ? 'O' : '✗',
        '· 보통 정산', (typeof renderDarkResult === 'function' && renderDarkResult._klee) ? 'O' : '✗',
        '· EPIC 죽음', (typeof epicDeath === 'function' && epicDeath._klee) ? 'O' : '✗',
        '· EPIC 정산', (typeof epicSettle === 'function' && epicSettle._klee) ? 'O' : '✗');
};

console.log('[K.LEE] kleeGive(사번) · kleeState(사번) · kleePhone(1/0)');

})();
