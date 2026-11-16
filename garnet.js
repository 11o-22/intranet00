// ==========================================
// ★ 💍 가넷 반지 · 💅 가넷 네일 — 우주 쇼핑몰 (지금은 상담사에게만 보인다) (2026-11-16 사용자)
// bundles.json 마지막 묶음 — dj.js · eye.js 뒤
// ==========================================
//
// ■ 사용자
//   「가넷 반지 50000 p - 착용 시 구출 확정 3 회, 즉사 무효 1 회 (하루에)
//    가넷 네일 50000 p - 착용 시 우주 쇼핑몰을 하루 2 회 확정적으로 볼 수 있다. 보기 전 랜덤으로 원하는 물품 지목 시 나올 확률이 올라간다.
//    이 두 개 넣어 주고 상담사만 볼 수 있게 해줘.」
//
// ■ 어디에
//   우주 쇼핑몰 진열대 — 상담사 화면에만 두 줄을 덧붙인다 (renderAlienShop 뒤). 사는 길은 buyAlienItem 그대로.
//   ALIEN_ITEMS_POOL 에는 **넣지 않는다** — 넣으면 복사기 · 랜덤 상자 · 그립톡 「모든 상점」 같은 곳으로 사원에게 새어 나간다.
//   사원에게 풀 때는 POOL 에 넣고 아래 ADMIN_ONLY 를 false 로.
//
// ■ 💍 가넷 반지 — 장착 시 · 하루에 (날짜가 바뀌면 다시)
//   ① 구출 확정 3 회 — 어둠 탐사의 구조 화면에 칸이 붙는다 (🎧 블렌딩과 같은 길 · 판정 없이 끌어낸다)
//   ② 즉사 무효 1 회 — 어둠 탐사에서 쓰러지는 순간(darkDeath) 한 번 넘긴다 (🎧 에코 아웃과 같은 길)
//   EPIC · K 의 방 · 이벤트 어둠(장비가 꺼지는 곳)은 아니다.
//   u.garnetDay · u.garnetResc(오늘 쓴 확정 구출) · u.garnetSave(오늘 쓴 즉사 무효)
//
// ■ 💅 가넷 네일 — 장착 시 · 하루(우주 쇼핑몰 하루 — 밤 10 시에 바뀐다) 2 회
//   「확정으로 본다」 — 업다운 대결 없이 진열에 세 종이 들어온다 (하루 대결 횟수 · 두 시간 시계는 쓰지 않는다).
//     진열을 고르는 것은 대결에서 이겼을 때와 똑같은 코드(playHighLow)를 쓴다 — 소속 · 직급 · 희귀 확률이 그대로 적용된다.
//   「원하는 물품 지목」 — 보기 전에 하나를 골라 두면, 그 물품이 세 종 안에 들 확률이 **50%** 로 오른다
//     (그 사원이 받을 수 있는 물품일 때 · 이미 진열에 있으면 그대로). 희귀품(진열 확률이 따로 적힌 것)은 지목할 수 없다.
//   ★ 같은 날 사용자 「가넷 네일에서 선택 가능한 물품 중 도깨비 방망이, 소원권, 금고는 빼주고
//     여우구슬은 나오되 나올 확률이 올라도 0.01~0.5 사이로 해줘.」
//     → 🪄 도깨비 방망이 · 🫙 소원권 · 금고는 지목 목록에 없다.
//       🔮 여우구슬은 지목할 수 있다 — 지목하고 볼 때마다 0.01% ~ 0.5% 사이에서 확률을 하나 뽑아 굴린다 (FOX_P).
//       여우구슬은 원래 사원 진열대에 오르지 않으므로(renderAlienShop 이 숨긴다) 나오면 그날 진열대 맨 위에 따로 한 줄 (u.garnetFox = 쇼핑몰 하루).
//   u.garnetNail = { c: 쇼핑몰 하루, n: 쓴 수 } · u.garnetPick = 지목한 물품 · u.garnetFox = 여우구슬이 나온 쇼핑몰 하루
//
// ■ 세트 — 💍 반지 + 💅 네일을 둘 다 차고 있으면 (2026-11-16 사용자 「둘 세트 효과로, 우주 쇼핑몰 시간을 한 시간 줄여주자.」)
//   우주 쇼핑몰 다음 연결까지의 시간(index.html ALIEN_COOL_MS 두 시간)이 **한 시간 짧다** (두 시간 → 한 시간).
//   대결을 시작한 때(lastAlienPlayTime)를 한 시간 앞으로 당겨 적는다 — 대결 판 · 남은 시간 표시 · 단추 잠금이 모두 그 값으로 센다.
//   대결을 시작할 때마다 한 번씩 (세트를 나중에 찼으면 찬 때에 한 번). 당겨 적은 값은 u.garnetSetAt 에 남겨 두 번 당기지 않는다.
//
// ■ 콘솔
//   garnetState()

(function garnet() {
'use strict';

const RING = '가넷 반지', NAIL = '가넷 네일';
const PRICE = 50000;
const ADMIN = 'kario0987';
const ADMIN_ONLY = true;              // ★ 지금은 상담사에게만 보인다
const RING_RESC = 3, RING_SAVE = 1, NAIL_N = 2;
const PICK_P = 0.5;                   // 지목한 물품이 세 종 안에 들 확률
const FOX = '여우구슬';
const FOX_P = [0.0001, 0.005];        // 여우구슬을 지목했을 때 — 0.01% ~ 0.5% 사이 (볼 때마다 이 사이에서 하나)
const GAR = '#c2185b', GAR2 = '#ff8fb1';
const HIDE = ['금고', '소원권', '🫙 소원권', '🪄 도깨비 방망이', '도깨비 방망이', RING, NAIL];   // 지목 목록에서 뺀다 (2026-11-16 사용자)

let rnd = function () { return Math.random(); };   // 지목 · 여우구슬 굴림 (시험에서 바꿔 끼운다 — garnetDebug.setRnd)
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }
function isAdmin(u) { return !!(u && u.code === ADMIN); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') showCustomAlert(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function chat(t) { try { const r = run(); if (r && r.isParty && typeof sendPartyChat === 'function') sendPartyChat(t, true); } catch (e) { } }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function cycle() { try { return get22HourCycleStr(); } catch (e) { return today(); } }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u, n) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === n; })); }
function wOff(z) { try { return !!(window.WONDER_GEAR_OFF && window.WONDER_GEAR_OFF(z)); } catch (e) { return false; } }
function epicOn() { try { return typeof er !== 'undefined' && !!er; } catch (e) { return false; } }
function kOn() { try { return typeof window.kroomOn === 'function' && !!window.kroomOn(); } catch (e) { return false; } }
function plain(r) { return !!(r && !r.epic && !r.kroom && !epicOn() && !kOn() && !wOff(r.zone)); }
function wrap(name, make, tag) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f[tag]) { clearInterval(iv); return; }
        const w = make(f);
        Object.keys(f).forEach(function (k) { if (!(k in w) && k !== '_gearCap') { try { w[k] = f[k]; } catch (e) { } } });
        w[tag] = true;
        window[name] = w;
        clearInterval(iv);
    }, 450);
    setTimeout(function () { clearInterval(iv); }, 60000);
}

// ==========================================
// 1. 물품
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[RING] = { price: PRICE, usable: true, targetable: false, effect: 'equip', garnet: true,
            desc: '[우주 쇼핑몰] 붉은 알이 박힌 반지. 장착 시 하루에 구출 확정 ' + RING_RESC + '회 · 즉사 무효 ' + RING_SAVE + '회. (어둠 탐사 — 구조 화면에 칸이 붙는다) 가넷 네일과 세트로 차면 우주 쇼핑몰 다음 연결까지 한 시간 짧아진다.' };
        ITEM_CATALOG[NAIL] = { price: PRICE, usable: true, targetable: false, effect: 'equip', garnet: true,
            desc: '[우주 쇼핑몰] 석류빛 손톱. 장착 시 우주 쇼핑몰을 하루 ' + NAIL_N + '회 확정으로 볼 수 있다 (대결 없이 입고). 보기 전에 원하는 물품을 지목하면 그 물품이 나올 확률이 올라간다. 가넷 반지와 세트로 차면 우주 쇼핑몰 다음 연결까지 한 시간 짧아진다.' };
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 우주 쇼핑몰 진열대 — 상담사 화면에만 두 줄
wrap('renderAlienShop', function (f) {
    return function () {
        const out = f.apply(this, arguments);
        try { shelf(); } catch (e) { }
        try { nailBox(); } catch (e) { }
        return out;
    };
}, '_garnet');
function shelf() {
    const u = u_();
    const box = document.getElementById('alien-items-container');
    if (!box || !u) return;
    foxRow(u, box);
    if (ADMIN_ONLY && !isAdmin(u)) return;
    if (box.querySelector('[data-garnet]')) return;
    const em = box.querySelector('div[style*="padding:15px 0"]');               // 「접속된 우주 주파수가 없습니다」
    if (em && !isAdmin(u)) return;
    const rows = [RING, NAIL].map(function (n) {
        const c = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[n]) || { desc: '', price: PRICE };
        return '<div class="shop-item" data-garnet="1">'
            + '<div><span style="font-weight:bold; font-size:13px; color:' + GAR2 + ';">' + esc(n) + '</span>'
            + (ADMIN_ONLY ? ' <span style="font-size:9px; color:#d4af37; border:1px solid #6a5a2a; border-radius:4px; padding:0 4px;">상담사만 보임</span>' : '') + '<br>'
            + '<span style="font-size:10px; color:#aaa;">' + esc(c.desc) + '</span></div>'
            + '<button onclick="buyAlienItem(\'' + n + '\', \'' + c.price + '\')">' + c.price + ' P</button></div>';
    }).join('');
    box.insertAdjacentHTML('afterbegin', rows);
}

// 💅 가넷 네일로 나온 여우구슬 — 사원 진열대는 여우구슬을 숨기므로 그날 맨 위에 따로 한 줄 (상담사는 원래 다 보인다)
function foxRow(u, box) {
    const old = box.querySelector('[data-garnet-fox]');
    if (isAdmin(u) || u.garnetFox !== cycle()) { if (old) old.remove(); return; }
    const sold = (u.alienBoughtItems || []).indexOf(FOX) >= 0;
    const c = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[FOX]) || { desc: '', price: '???' };
    const sig = sold ? 's' : 'o';
    if (old && old.dataset.garnetFox === sig) return;
    if (old) old.remove();
    const em = box.querySelector('div[style*="padding:15px 0"]'); if (em) em.remove();      // 「접속된 우주 주파수가 없습니다」
    box.insertAdjacentHTML('afterbegin', '<div class="shop-item' + (sold ? ' sold-out' : '') + '" data-garnet-fox="' + sig + '">'
        + '<div><span style="font-weight:bold; font-size:13px; color:#00A2E8;">' + esc(FOX) + '</span> <span style="font-size:9px; color:' + GAR2 + ';">💅 가넷 네일</span><br>'
        + '<span style="font-size:10px; color:#aaa;">' + esc(c.desc) + '</span></div>'
        + '<button onclick="buyAlienItem(\'' + FOX + '\', \'' + c.price + '\')"' + (sold ? ' disabled' : '') + '>' + (sold ? '품절' : c.price + ' P') + '</button></div>');
}

// ==========================================
// 세트 — 우주 쇼핑몰 다음 연결까지 한 시간 짧게
// ==========================================
const SET_CUT = 60 * 60 * 1000;
function setOn(u) { return wears(u, RING) && wears(u, NAIL); }
function setTick() {
    const u = u_();
    if (!u || !setOn(u) || isAdmin(u)) return;
    const t = Number(u.lastAlienPlayTime) || 0;
    if (!t || u.alienDate !== cycle()) return;
    const done = Array.isArray(u.garnetSetAt) ? u.garnetSetAt : [];
    if (done.indexOf(t) >= 0) return;                          // 이미 당긴 값
    const nt = t - SET_CUT;
    u.lastAlienPlayTime = nt;
    u.garnetSetAt = done.concat([nt]).slice(-6);
    save({ lastAlienPlayTime: 1, garnetSetAt: 1 });
    try { if (typeof renderAlienTimer === 'function') renderAlienTimer(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
}
// 대결을 시작한 바로 그때 당긴다 (playHighLow 뒤) · 그 밖에는 1 초마다 살핀다 (세트를 나중에 찬 때)
wrap('playHighLow', function (f) {
    return function () {
        const out = f.apply(this, arguments);
        try { if (!window._alienForced) setTick(); } catch (e) { }
        return out;
    };
}, '_garnetSet');
setInterval(function () { try { setTick(); } catch (e) { } }, 1000);

// ==========================================
// 2. 💍 가넷 반지 — 하루 몫
// ==========================================
function ringDay(u) {
    if (!u) return;
    if (u.garnetDay !== today()) { u.garnetDay = today(); u.garnetResc = 0; u.garnetSave = 0; }
}
function rescLeft(u) { if (!u || !wears(u, RING)) return 0; ringDay(u); return Math.max(0, RING_RESC - (Number(u.garnetResc) || 0)); }
function saveLeft(u) { if (!u || !wears(u, RING)) return 0; ringDay(u); return Math.max(0, RING_SAVE - (Number(u.garnetSave) || 0)); }

// ① 구출 확정 — 구조 화면에 칸
let rescArgs = null;
wrap('renderRescuePrompt', function (f) {
    return function (info, code) {
        const out = f.apply(this, arguments);
        try {
            const u = u_(), r = run();
            if (u && r && plain(r) && code && wears(u, RING)) {
                rescArgs = { info: info, code: code };
                const left = rescLeft(u);
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body && !body.querySelector('#garnet-resc') && left > 0) {
                    const html = '<div id="garnet-resc" style="border:1px solid ' + GAR + '; border-radius:6px; padding:11px; margin-bottom:9px; background:rgba(194,24,91,0.08);">'
                        + '<div style="font-size:12px; color:' + GAR2 + '; font-weight:bold;">💍 가넷 반지</div>'
                        + '<div style="font-size:10px; color:#d9a3b5; margin:4px 0 8px 0;">반지의 붉은 알이 흐려지는 쪽을 비춘다 — 확정 구출 · 오늘 남은 ' + left + ' / ' + RING_RESC + '</div>'
                        + '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#7a1440,#3a0a20) !important; border-color:' + GAR2 + ' !important; color:#ffe3ec !important;" onclick="garnetRescue(\'' + esc(code) + '\')">붙잡는다</button></div>';
                    const b = Array.prototype.filter.call(body.querySelectorAll('button'), function (x) { return /보고만 있는다/.test(x.textContent || ''); })[0];
                    if (b) b.insertAdjacentHTML('beforebegin', html); else body.insertAdjacentHTML('beforeend', html);
                }
            }
        } catch (e) { }
        return out;
    };
}, '_garnet');
window.garnetRescue = function (code) {
    const u = u_(), r = run();
    if (!u || !r || !code || !plain(r) || rescLeft(u) <= 0) return;
    u.garnetResc = (Number(u.garnetResc) || 0) + 1;
    save({ garnetDay: 1, garnetResc: 1 });
    const who = (rescArgs && rescArgs.code === code && rescArgs.info && rescArgs.info.name) || (((typeof db !== 'undefined' && db.users && db.users[code]) || {}).name) || '동료';
    r.success = (r.success || 0) + 1;
    try { if (db_() && r.partyId) db_().ref('darkParties/' + r.partyId + '/dying/' + code).remove(); } catch (e) { }
    try { if (typeof window.dokRescued === 'function') window.dokRescued('dark'); } catch (e) { }
    chat((u.name || '') + ' 사원이 가넷 반지로 ' + who + ' 사원을 붙잡았습니다.');
    const left = rescLeft(u);
    log_(u, '[' + RING + '] ' + who + ' 사원 확정 구출 (오늘 남은 ' + left + '회)');
    try { if (r.log) r.log.push('[💍 가넷 반지] ' + who + ' — 확정 구출'); } catch (e) { }
    save({ history: 1 });
    r._rescueShown = false;
    const next = r.isLeader ? darkChoiceBtn('계속 간다.', 'partyAdvance(' + (r.step + 1) + ')')
        : '<div style="text-align:center; font-size:11px; color:#888; padding:12px;">선임의 신호를 기다리는 중...<br>'
          + '<button class="game-btn" style="margin-top:9px; padding:7px 13px; font-size:10px;" onclick="partyAdvance(' + (r.step + 1) + ')">먼저 간다</button></div>';
    try {
        darkBodyEl().innerHTML = darkBox('구조 — 가넷 반지',
            '손을 뻗자 반지의 붉은 알이 먼저 닿는다. 흐려지던 윤곽이 그 빛에 붙들려 멈춘다.<br><br>'
            + '<b style="color:' + GAR2 + ';">' + esc(who) + '</b> 사원을 끌어냈다.<br>'
            + '<span style="font-size:11px; color:#d9a3b5;">오늘의 확정 구출 남은 ' + left + ' / ' + RING_RESC + '</span>', next);
        if (typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
};

// ② 즉사 무효 — 쓰러지는 순간 한 번
wrap('darkDeath', function (f) {
    return function (reasonText) {
        const r0 = run(), u = u_();
        try {
            if (r0 && !r0._dead && u && plain(r0) && saveLeft(u) > 0) {
                u.garnetSave = (Number(u.garnetSave) || 0) + 1;
                save({ garnetDay: 1, garnetSave: 1 });
                r0.fail = Math.max(0, (Number(r0.fail) || 0) - 1);
                try { if (r0.isParty && r0.partyId && db_()) db_().ref('darkParties/' + r0.partyId + '/alive/' + u.code).set(true); } catch (e) { }
                log_(u, '[' + RING + '] 즉사를 한 번 넘겼습니다. (오늘 남은 ' + saveLeft(u) + '회)');
                save({ history: 1 });
                chat('💍 ' + (u.name || '') + ' 사원의 가넷 반지가 깨지듯 빛나 죽음을 한 번 넘겼습니다.');
                try { if (r0.log) r0.log.push('[💍 가넷 반지] 즉사 무효'); } catch (e) { }
                const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                if (body && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                    body.innerHTML = darkBox('—', String(reasonText || '') + '<br><br><span style="color:' + GAR2 + ';">「 끝나려던 순간, 손가락의 붉은 알이 뜨겁게 달아오른다. 빛이 한 번 터지고, 당신은 아직 서 있다.<br>가넷 반지 — 즉사 무효 (오늘 남은 ' + saveLeft(u) + '회) 」</span>', darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                    try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                }
                try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                return;
            }
        } catch (e) { console.warn('[💍 가넷] 죽음 건너뜀:', e && e.message); }
        return f.apply(this, arguments);
    };
}, '_garnet');

// ==========================================
// 3. 💅 가넷 네일 — 우주 쇼핑몰 확정 입고 · 지목
// ==========================================
function nailRec(u) {
    if (!u) return { c: '', n: 0 };
    const c = cycle();
    if (!u.garnetNail || u.garnetNail.c !== c) u.garnetNail = { c: c, n: 0 };
    return u.garnetNail;
}
function nailLeft(u) { if (!u || !wears(u, NAIL)) return 0; return Math.max(0, NAIL_N - (Number(nailRec(u).n) || 0)); }
function affText(u) { return ((u && u.affiliation) || '') + ' ' + ((u && u.team) || ''); }
// 지목할 수 있는 물품 — 우주 쇼핑몰 후보 가운데 그 사원이 받을 수 있는 것 (희귀품 · 숨긴 것은 뺀다)
function pickList(u) {
    if (typeof ALIEN_ITEMS_POOL === 'undefined' || !u) return [];
    const R = window.RARE_ALIEN_RATE || {};
    const adm = isAdmin(u);
    const dark = /어둠/.test(affText(u)) || (typeof window._traceHas === 'function' && window._traceHas(u));
    const disaster = adm || dark || /재난관리/.test(affText(u));
    const daydream = adm || dark || /백일몽 주식회사/.test(affText(u));
    const high = adm || ['과장', '차장', '부장', '이사', '대표', '사장'].indexOf(u.position) >= 0;
    const sec = adm || /보안팀|경비팀/.test(u.team || '');
    return ALIEN_ITEMS_POOL.filter(function (n, i, a) {
        if (a.indexOf(n) !== i) return false;
        if (HIDE.indexOf(n) >= 0) return false;
        if (typeof ITEM_CATALOG === 'undefined' || !ITEM_CATALOG[n]) return false;
        if (n === FOX) return true;                                                  // 🔮 여우구슬 — 지목할 수 있다 (0.01% ~ 0.5%)
        if (R[n] !== undefined && Number(R[n]) < 1) return false;                   // 희귀품
        if (['작두', '유리손포', '누군가가 쓴 부적', '사자탈'].indexOf(n) >= 0 && !disaster) return false;
        if (['착한 친구', '보안팀 의상 세트', '버터 나이프', '노스텔지어 끈'].indexOf(n) >= 0 && !daydream) return false;
        if (['은반지', '빨간 리본', '고급진 술'].indexOf(n) >= 0 && !high) return false;
        if ((window.ALIEN_SEC_ONLY || []).indexOf(n) >= 0 && !sec) return false;
        try {
            const need = (typeof EQUIP_AFFIL !== 'undefined' && EQUIP_AFFIL) ? EQUIP_AFFIL[n] : null;
            if (need && !adm && !dark && affText(u).indexOf(need) < 0) return false;
        } catch (e) { }
        return true;
    }).sort();
}
// 대결에서 이긴 것과 똑같이 진열에 넣는다 — playHighLow 를 「두 판째 이긴 판」으로 한 번 부른다 (횟수 · 시계는 쓰지 않는다)
function forceWin(pool) {
    const u = u_();
    if (!u || typeof playHighLow !== 'function') return [];
    const before = (u.alienUnlockedItems || []).slice();
    let saved = null;
    if (pool && typeof ALIEN_ITEMS_POOL !== 'undefined') {
        saved = ALIEN_ITEMS_POOL.slice();
        ALIEN_ITEMS_POOL.length = 0;
        pool.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); });
    }
    window._alienForced = true;
    try {
        if (u.alienDate !== cycle()) {                // 쇼핑몰 하루가 바뀌었으면 playHighLow 가 진열을 비운다 — 그 뒤에 이긴 판으로
            u.alienDate = cycle(); u.alienBoughtItems = []; u.alienUnlockedItems = []; u.alienTries = 0; u.alienDailyUsed = 0; u.lastAlienPlayTime = 0; u.alienBout = null;
            before.length = 0;
        }
        const W = (typeof ALIEN_BOUT_WIN !== 'undefined') ? ALIEN_BOUT_WIN : 2;
        u.alienBout = { w: W - 1, l: 0 };
        try { dealerCardValue = 1; } catch (e) { }
        playHighLow('HIGH');
    } finally {
        window._alienForced = false;
        if (saved) { ALIEN_ITEMS_POOL.length = 0; saved.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); }); }
        if (u.alienBout) u.alienBout = null;
    }
    return (u.alienUnlockedItems || []).filter(function (x) { return before.indexOf(x) < 0; });
}
let nailBusy = false;
window.garnetNailGo = function () {
    const u = u_();
    if (!u || nailBusy) return;
    if (nailLeft(u) <= 0) { alert_('💅 가넷 네일 — 오늘 확정으로 볼 몫을 다 썼습니다.\n(밤 10시에 초기화됩니다)'); return; }
    if (typeof isQuarantined === 'function' && isQuarantined(u)) { alert_('여우 상담실 격리 중에는 우주 주파수에 접속할 수 없습니다.'); return; }
    if (u.alienBout && u.alienDate === cycle()) { alert_('진행 중인 대결을 먼저 끝내 주세요.'); return; }
    nailBusy = true;
    setTimeout(function () { nailBusy = false; }, 1800);
    const sel = document.getElementById('garnet-pick');
    const pick = sel ? sel.value : (u.garnetPick || '');
    if (sel) { u.garnetPick = pick || null; }
    let got = forceWin(null);
    if (!got.length) { alert_('💅 진열에 들어온 것이 없습니다. 잠시 뒤에 다시 해 주세요.'); save({ garnetPick: 1 }); return; }
    // 지목 — 세 종에 없으면 PICK_P 로 그 물품을 넣고, 새로 들어온 것 하나를 뺀다
    let hit = false;
    if (pick === FOX) {
        // 🔮 여우구슬 — 0.01% ~ 0.5% 사이에서 이번 확률을 뽑아 굴린다 · 나오면 세 종 가운데 하나와 바꾼다 (진열대에는 따로 한 줄)
        const p = FOX_P[0] + rnd() * (FOX_P[1] - FOX_P[0]);
        if (isAdmin(u) || u.garnetFox === cycle()) hit = u.garnetFox === cycle();
        else if (rnd() < p) {
            hit = true;
            u.garnetFox = cycle();
            const out = got[Math.floor(rnd() * got.length)];
            u.alienUnlockedItems = (u.alienUnlockedItems || []).filter(function (x) { return x !== out; });
            got = got.filter(function (x) { return x !== out; }).concat([FOX]);
        }
    } else if (pick && got.indexOf(pick) < 0 && (u.alienUnlockedItems || []).indexOf(pick) < 0 && rnd() < PICK_P) {
        const g2 = forceWin([pick]);
        if (g2.indexOf(pick) >= 0) {
            hit = true;
            const out = got[Math.floor(rnd() * got.length)];
            u.alienUnlockedItems = (u.alienUnlockedItems || []).filter(function (x) { return x !== out; });
            got = got.filter(function (x) { return x !== out; }).concat([pick]);
        }
    } else if (pick && got.indexOf(pick) >= 0) hit = true;
    const rec = nailRec(u);
    rec.n = (Number(rec.n) || 0) + 1;
    log_(u, '[' + NAIL + '] 우주 쇼핑몰 확정 입고 — ' + got.join(', ') + (pick ? ' (지목: ' + pick + (hit ? ' — 들어옴' : '') + ')' : '') + ' · 오늘 남은 ' + nailLeft(u) + '회');
    save({ garnetNail: 1, garnetPick: 1, garnetFox: 1, alienUnlockedItems: 1, alienDate: 1, alienBout: 1, history: 1 });
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
    try { const m = document.getElementById('hl-msg'); if (m) m.innerHTML = '<span style="color:' + GAR2 + '; font-weight:bold;">[💅 가넷 네일] 확정 입고 — ' + got.length + '종</span>' + (pick ? '<br><span style="font-size:11px; color:' + (hit ? '#4CAF50' : '#aaa') + ';">지목한 「' + esc(pick) + '」 ' + (hit ? '이(가) 들어왔습니다' : '은(는) 이번에 들어오지 않았습니다') + '</span>' : ''); } catch (e) { }
    try { if (typeof renderAlienShop === 'function') renderAlienShop(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    nailBox(true);
};
// 우주 쇼핑몰 화면 — 대결 칸 아래에 네일 칸
function nailBox(force) {
    const u = u_();
    const sec = document.getElementById('alien-game-section');
    const old = document.getElementById('garnet-nail-box');
    if (!sec || !u || !wears(u, NAIL)) { if (old) old.remove(); return; }
    const left = nailLeft(u);
    const list = pickList(u);
    const cur = u.garnetPick && list.indexOf(u.garnetPick) >= 0 ? u.garnetPick : '';
    const sig = left + '|' + cur + '|' + list.length;
    if (old && old._sig === sig && !force) return;
    if (old && document.activeElement && document.activeElement.id === 'garnet-pick' && !force) return;   // 고르는 중에는 다시 그리지 않는다
    const html = '<div style="font-size:12px; color:' + GAR2 + '; font-weight:bold; margin-bottom:4px;">💅 가넷 네일 — 확정 입고 (오늘 남은 ' + left + ' / ' + NAIL_N + '회)</div>'
        + '<div style="font-size:10px; color:#aaa; margin-bottom:8px; line-height:1.6;">대결 없이 진열에 세 종이 들어옵니다. 보기 전에 원하는 물품을 지목하면 그 물품이 들어올 확률이 ' + Math.round(PICK_P * 100) + '% 로 오릅니다.<br><span style="color:#888;">🔮 여우구슬은 지목해도 ' + (FOX_P[0] * 100) + '% ~ ' + (FOX_P[1] * 100) + '% 사이입니다.</span></div>'
        + '<select id="garnet-pick" style="width:100%; font-size:12px; margin-bottom:8px;"><option value="">원하는 물품 지목 (안 해도 됩니다)</option>'
        + list.map(function (n) { return '<option value="' + esc(n) + '"' + (n === cur ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; background:linear-gradient(145deg,#7a1440,#3a0a20) !important; border-color:' + GAR2 + ' !important; color:#ffe3ec !important;" onclick="garnetNailGo()"' + (left > 0 ? '' : ' disabled') + '>' + (left > 0 ? '확정으로 본다' : '오늘 몫을 다 썼습니다') + '</button>';
    let b = old;
    if (!b) {
        b = document.createElement('div');
        b.id = 'garnet-nail-box';
        b.style.cssText = 'background:rgba(194,24,91,0.07); padding:13px; border:1px solid ' + GAR + '; margin-bottom:15px; border-radius:6px;';
        sec.parentNode.insertBefore(b, sec.nextSibling);
        b.addEventListener('change', function (e) { if (e.target && e.target.id === 'garnet-pick') { const me = u_(); if (me) { me.garnetPick = e.target.value || null; save({ garnetPick: 1 }); } } });
    }
    b._sig = sig;
    b.innerHTML = html;
}
setInterval(function () {
    try { const p = document.getElementById('shop-alien'); if (p && p.offsetParent !== null) { nailBox(); shelf(); } } catch (e) { }
}, 1000);

window.garnetState = function () {
    const u = u_();
    if (!u) return null;
    const o = { ring: wears(u, RING), rescLeft: rescLeft(u), saveLeft: saveLeft(u), nail: wears(u, NAIL), nailLeft: nailLeft(u), pick: u.garnetPick || null, picks: pickList(u).length, set: setOn(u) };
    console.log('%c===== 💍 가넷 =====', 'color:' + GAR2 + '; font-size:13px');
    console.log(o);
    return o;
};
window.garnetDebug = { forceWin: forceWin, pickList: pickList, setRnd: function (f) { rnd = (typeof f === 'function') ? f : function () { return Math.random(); }; }, setTick: setTick };
})();
