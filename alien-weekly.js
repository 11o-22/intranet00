// ==========================================
// ★ 🛸 주마다 두 명 — 🫙 소원권 · 🪄 도깨비 방망이가 우주 쇼핑몰에 꼭 뜬다 (2026-11-14)
// bundles.json 마지막 묶음 맨 끝 (calam-seal.js 뒤)
// ==========================================
//
// 2026-11-14 사용자
//   「소원권이랑 도깨비 방망이, 사원들 중에 주에 두 명 랜덤으로 꼭 우주 쇼핑몰에 뜨게 하고
//    조건은 내가 지금까지 넣은 커스텀 장비가 없는 사람들 우선으로, 그 다음이 커스텀 장비만 있는 사람들,
//    그 다음이 흔적이랑 이레귤러 같은 칭호와 커스텀 장비가 다 있는 사람들 순으로 뜨게 하자.
//    그 외의 사람들은 내가 넣은 확률대로 나오게 해줘.」
//   물어서 정한 것 — 두 명은 「소속 상관없이 2명」 (각자 제 소속에 맞는 물품이 뜬다 · 어둠 소속이면 둘 다)
//                    순서는 「한 번씩 돌아가며」 (한 번 뜬 사람은 다시 안 뽑는다 · 세 단계가 다 돌면 처음부터)
//
// ■ 누구를 뽑나
//
//   주(월요일 0시 · 한국 시각 · 서버 시계)가 바뀌면, 그 주에 처음 들어온 기기가 두 명을 뽑아 서버에 적는다 (트랜잭션 — 한 번만).
//
//   후보     상담사가 아니고 · 소속에 맞는 물품이 하나라도 있고(백일몽 → 🫙 · 재난관리국 → 🪄 · 어둠 → 둘 다)
//            · 최근 7일 안에 들어온 사원 (lastFacilityDate — 들어온 날마다 dailyRollover 가 적는다).
//            안 들어오는 사원을 뽑으면 그 주 몫이 그냥 사라지고, 커스텀 장비가 없는 쪽에 그런 사원이 몰려 있어 차례가 영영 안 넘어간다.
//   단계     1 커스텀 장비 없음 (칭호가 있어도)  →  2 커스텀 장비만  →  3 상담사 칭호(흔적 · 이레귤러 …) + 커스텀 장비
//            커스텀 장비 = 상담사가 지급한 장비 (CUSTOM — 소지품 · 장착칸 어디에 있든). 칭호 = titleAdmin 에 든 것.
//   차례     아직 안 뜬 사람 가운데 1단계에서 무작위 → 모자라면 2단계 → 3단계. 아무도 안 남으면 기록을 비우고 처음부터.
//            새로 들어온 1단계 사원은 그때그때 앞에 선다 (아직 안 뜬 1단계가 늘 먼저다).
//
// ■ 어떻게 뜨나
//
//   뽑힌 사원의 우주 쇼핑몰 맨 위에 그 주 내내 걸린다 — 하이로우를 이기지 않아도 보인다. 값 · 사는 길은 진열품과 같다 (buyAlienItem).
//   한 주에 물품마다 한 번 산다 (사면 그 주에는 다시 안 걸린다). 안 사고 주가 지나면 사라지고, 차례는 쓴 것으로 친다.
//   소속 규칙은 그대로다 — 걸리는 것은 제 소속에 맞는 물품뿐 (🫧 흔적 칭호로는 안 된다 · dokkaebi-bat.js).
//   뽑히지 않은 사원은 예전대로 진열 확률(rare-odds.js · 0.0000001%)을 따른다.
//
// ■ 서버
//
//   alienWeekly/weeks/<월요일 날짜>   { at, picks: { <열쇠>: { name, no, tier, items, got: { wish | bat: 산 때 } } } }   최근 12주만 둔다
//   alienWeekly/hist/<열쇠>           그 사원이 뜬 주 — 한 바퀴가 다 돌면 비운다
//
// ■ 콘솔
//
//   alienWeekState()     이번 주 내 차례 · (상담사) 뽑힌 사람 · 단계별 후보 수
//   alienWeekRedraw(true) (상담사) 이번 주를 다시 뽑는다 — 뽑혔던 사람의 차례 기록도 지운다

(function alienWeekly() {
'use strict';

const ADMIN = 'kario0987';
const ROOT = 'alienWeekly';
const PER_WEEK = 2;
const ACTIVE_DAYS = 7;
const KEEP_WEEKS = 12;
const DAY = 86400000;
const ITEMS = { wish: '🫙 소원권', bat: '🪄 도깨비 방망이' };
const AFFIL = { wish: '백일몽', bat: '재난관리' };          // EQUIP_AFFIL 에 적힌 것과 같다 (newitems.js · dokkaebi-bat.js)
const KEYS = ['wish', 'bat'];
// 커스텀 장비 — 상담사가 지급한 장비 (옛 이름도 같은 것으로 본다)
//   뿅망치는 세지 않는다 (2026-11-14 사용자 「뿅망치는 커스텀 장비 목록에서 빼」) — 뿅망치만 가진 사원은 1단계
const CUSTOM = [
    '🔎 감지하는 눈',
    '🌟 제 칠(七) 성군(星君)', '🐯 제 칠(七) 성군(星君)',
    '🦋 환영 나비',
    '🐾 아기 호랑이', '🐾 아기 여우',
    '🌙 달빛 문신',
    '📺 브라운의 심야 토크 쇼',
    '🩶 은심장', '은심장',
    '🎐 여우 신도 - 아홉여우병',
    '🐺 （구） 정예 B조 ■■',
    '🦊 호갑투 - 禁制',
    '📖 〈종말예언 : 어둠탐사기록〉', '🧧 지산의 복 : 대리자',
    '🐯 호가호위', '🦊 호가호위', '호가호위', '🦊 호사수구', '호사수구'
];
const TIER_N = { 1: '커스텀 장비 없음', 2: '커스텀 장비만', 3: '칭호 + 커스텀 장비' };

function u_() { try { return (typeof currentUser !== 'undefined') ? currentUser : null; } catch (e) { return null; } }
function db_() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }
function book() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function now() {
    try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { }
    return Date.now();
}
function clockOk() { try { return typeof window.clockReady !== 'function' || !!window.clockReady(); } catch (e) { return true; } }
function arr(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? String(getEquipBaseName(w) || '') : String(w || ''); } catch (e) { return String(w || ''); } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function p2(n) { return (n < 10 ? '0' : '') + n; }
// 한국 날짜 (YYYY-MM-DD)
function kday(ms) {
    const d = new Date((ms == null ? now() : ms) + 9 * 3600000);
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate());
}
// 그 주의 월요일 (한국 날짜)
function weekKey(ms) {
    const t = (ms == null ? now() : ms) + 9 * 3600000;
    const d = new Date(t);
    const back = (d.getUTCDay() + 6) % 7;                    // 월 0 … 일 6
    return kday(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - back * DAY - 9 * 3600000);
}

// ==========================================
// 1. 단계 · 후보
// ==========================================
function hasCustom(u) {
    if (!u) return false;
    return arr(u.inventory).concat(arr(u.equippedWeapons)).some(function (w) {
        const s = String(w || '');
        return CUSTOM.indexOf(s) >= 0 || CUSTOM.indexOf(baseOf(s)) >= 0;
    });
}
// 커스텀 장비를 가졌나 (뿅망치는 세지 않는다) — craft-pity.js 도 이것으로 본다 (조합 재료 10판 보장에서 빠진다)
window.hasCustomGear = function (u) { return hasCustom(u || u_()); };
function hasTitle(u) { return !!u && arr(u.titleAdmin).filter(function (x) { return !!x; }).length > 0; }
function tierOf(u) { return !hasCustom(u) ? 1 : (hasTitle(u) ? 3 : 2); }
// 이 사원의 소속으로 보이는 물품 — 어둠은 둘 다 (칭호로는 안 된다)
function itemsFor(u) {
    if (!u) return [];
    const where = String(u.affiliation || '') + ' ' + String(u.team || '');
    const dark = /어둠/.test(where);
    return KEYS.filter(function (k) {
        let need = AFFIL[k];
        try { if (typeof EQUIP_AFFIL !== 'undefined' && EQUIP_AFFIL && EQUIP_AFFIL[ITEMS[k]]) need = EQUIP_AFFIL[ITEMS[k]]; } catch (e) { }
        return dark || where.indexOf(need) >= 0;
    });
}
function isActive(u) {
    const me = u_();
    if (me && u && u.code === me.code) return true;
    const d = String((u && u.lastFacilityDate) || '');
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= kday(now() - ACTIVE_DAYS * DAY);
}
function candidates() {
    const b = book(), out = [], seen = {};
    Object.keys(b).forEach(function (k) {
        const u = b[k];
        if (!u || typeof u !== 'object') return;
        const code = String(u.code || k);
        if (!code || code === ADMIN || seen[code] || !u.name) return;
        const it = itemsFor(u);
        if (!it.length || !isActive(u)) return;
        seen[code] = 1;
        out.push({ code: code, name: String(u.name), no: String(u.no == null ? '' : u.no), tier: tierOf(u), items: it });
    });
    return out;
}
function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
}
// 차례 기록(hist)을 보고 이번 주 몫을 고른다 — { week, hist } · 후보가 없으면 null
function draw(hist) {
    const cands = candidates();
    if (!cands.length) return null;
    let h = Object.assign({}, hist || {});
    const picks = [], mine = {};
    const take = function () {
        for (let t = 1; t <= 3 && picks.length < PER_WEEK; t++) {
            const pool = shuffle(cands.filter(function (c) { return c.tier === t && !h[c.code] && !mine[c.code]; }));
            while (pool.length && picks.length < PER_WEEK) { const c = pool.shift(); picks.push(c); mine[c.code] = 1; }
        }
    };
    take();
    if (picks.length < PER_WEEK) { h = {}; take(); }        // 한 바퀴가 다 돌았다 — 기록을 비우고 처음부터
    if (!picks.length) return null;
    const wk = weekKey(), at = now(), out = {};
    picks.forEach(function (c) {
        out[c.code] = { name: c.name, no: c.no, tier: c.tier, items: c.items.join(',') };
        h[c.code] = wk;
    });
    return { week: { at: at, picks: out }, hist: h };
}

// ==========================================
// 2. 이번 주 — 듣기 · 뽑기
// ==========================================
let WEEK = { key: '', ref: null, fn: null, data: null, loaded: false };
function listen() {
    const d = db_();
    if (!d || !u_() || !clockOk()) return;
    const wk = weekKey();
    if (WEEK.key === wk && WEEK.ref) return;
    try { if (WEEK.ref && WEEK.fn) WEEK.ref.off('value', WEEK.fn); } catch (e) { }
    const w = { key: wk, ref: d.ref(ROOT + '/weeks/' + wk), fn: null, data: null, loaded: false };
    WEEK = w;
    w.fn = w.ref.on('value', function (s) {
        if (WEEK !== w) return;
        w.data = s.val(); w.loaded = true;
        try { sync(); } catch (e) { }
    });
}
// 사원 목록이 다 내려왔나 — 수가 5초 동안 그대로면 다 온 것으로 본다
let cntN = -1, cntAt = 0;
function usersReady() {
    const n = Object.keys(book()).length;
    if (n !== cntN) { cntN = n; cntAt = Date.now(); return false; }
    return n > 0 && Date.now() - cntAt >= 5000;
}
let busy = false, lastTry = 0;
function tryDraw() {
    const d = db_(), me = u_();
    if (!d || !me || busy || !clockOk()) return;
    const wk = weekKey();
    if (WEEK.key !== wk || !WEEK.loaded || WEEK.data) return;        // 이미 뽑혔다 · 아직 모른다
    if (!usersReady() || Date.now() - lastTry < 20000) return;
    lastTry = Date.now();
    busy = true;
    let made = false;
    d.ref(ROOT).transaction(function (cur) {
        cur = (cur && typeof cur === 'object') ? cur : {};
        const weeks = (cur.weeks && typeof cur.weeks === 'object') ? cur.weeks : {};
        if (weeks[wk]) return;                                       // 누가 먼저 뽑았다
        const r = draw(cur.hist);
        if (!r) return;                                              // 뽑을 사람이 없다 — 다음에 다시 본다
        weeks[wk] = r.week;
        Object.keys(weeks).sort().slice(0, -KEEP_WEEKS).forEach(function (k) { delete weeks[k]; });
        made = true;
        return { weeks: weeks, hist: r.hist };
    }).then(function (res) {
        busy = false;
        if (res && res.committed && made) console.log('[🛸 주마다 두 명] ' + wk + ' 주 — 뽑았습니다.');
    }).catch(function (e) { busy = false; console.warn('[🛸 주마다 두 명] 뽑기', e && e.message); });
}

// ==========================================
// 3. 우주 쇼핑몰 — 맨 위에 건다
// ==========================================
function myPick() {
    const me = u_();
    if (!me || me.code === ADMIN || !WEEK.data || !WEEK.data.picks || WEEK.key !== weekKey()) return null;
    return WEEK.data.picks[me.code] || null;
}
// 아직 걸려 있어야 할 물품 — 제 소속에 맞고 · 이번 주에 안 산 것
function left() {
    const p = myPick(), me = u_();
    if (!p || !me) return [];
    const got = p.got || {};
    return itemsFor(me).filter(function (k) {
        if (got[k]) return false;
        try { return typeof ITEM_CATALOG !== 'undefined' && !!ITEM_CATALOG[ITEMS[k]]; } catch (e) { return false; }
    });
}
function markGot(k) {
    const me = u_(), d = db_(), p = myPick();
    if (!me || !p) return;
    if (!p.got) p.got = {};
    if (p.got[k]) return;
    p.got[k] = now();
    try { if (d) d.ref(ROOT + '/weeks/' + WEEK.key + '/picks/' + me.code + '/got/' + k).set(p.got[k]); } catch (e) { }
}
function card(k) {
    const name = ITEMS[k], cat = ITEM_CATALOG[name];
    const e = document.createElement('div');
    e.className = 'shop-item aw-pin';
    e.dataset.aw = k;
    e.innerHTML =
        '<div><span style="font-weight:bold; font-size:13px; color:#00A2E8;">' + esc(name) + '</span><br>'
        + '<span style="font-size:10px; color:#aaa;">' + esc(cat.desc || '') + '</span></div>'
        + '<button>' + esc(cat.price) + ' P</button>';
    e.querySelector('button').onclick = function () {
        try { if (typeof buyAlienItem === 'function') buyAlienItem(name, String(cat.price)); } catch (er) { console.warn('[🛸 주마다 두 명] 사기', er); }
        setTimeout(function () { try { sync(); } catch (er) { } }, 60);
    };
    return e;
}
let syncing = false;
function sync() {
    if (syncing) return;
    const box = document.getElementById('alien-items-container');
    if (!box) return;
    syncing = true;
    try {
        const me = u_();
        let want = left();
        // 오늘 산 것 — 산 것으로 적고 내린다 (사는 길은 buyAlienItem 그대로라, 산 표시는 alienBoughtItems 로 안다)
        if (me && want.length) {
            const bought = arr(me.alienBoughtItems);
            want.forEach(function (k) { if (bought.indexOf(ITEMS[k]) >= 0) markGot(k); });
            want = left();
        }
        const pins = Array.prototype.slice.call(box.querySelectorAll('.aw-pin'));
        const have = pins.map(function (e) { return e.dataset.aw; }).join(',');
        const top = !want.length || (box.firstElementChild && box.firstElementChild.classList.contains('aw-pin'));
        if (have !== want.join(',') || !top) {
            pins.forEach(function (e) { e.remove(); });
            for (let i = want.length - 1; i >= 0; i--) box.insertBefore(card(want[i]), box.firstChild);
        }
        // 「접속된 우주 주파수가 없습니다」 — 걸린 것이 있으면 숨긴다
        Array.prototype.forEach.call(box.children, function (c) {
            if (c.classList.contains('shop-item')) return;
            if (!/접속된 우주 주파수가 없습니다/.test(c.textContent || '')) return;
            c.style.display = want.length ? 'none' : '';
        });
    } finally { syncing = false; }
}
// 진열을 다시 그리면 바로 다시 건다
let obsOn = null;
function watch() {
    const box = document.getElementById('alien-items-container');
    if (!box || obsOn === box || typeof MutationObserver === 'undefined') return;
    obsOn = box;
    try { new MutationObserver(function () { try { sync(); } catch (e) { } }).observe(box, { childList: true }); } catch (e) { }
}

setInterval(function () {
    try { listen(); tryDraw(); watch(); sync(); } catch (e) { }
}, 1500);

// ==========================================
// 콘솔
// ==========================================
window.alienWeekTier = function (u) { u = u || u_(); return u ? { tier: tierOf(u), name: TIER_N[tierOf(u)], items: itemsFor(u).map(function (k) { return ITEMS[k]; }), active: isActive(u) } : null; };
window.alienWeekState = function () {
    const me = u_(), wk = weekKey();
    console.log('%c===== 🛸 주마다 두 명 — 🫙 소원권 · 🪄 도깨비 방망이 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  이번 주', wk, '(월요일 0시 · 한국 시각에 바뀐다) · 뽑기', WEEK.loaded ? (WEEK.data ? '끝' : '아직') : '읽는 중');
    const p = myPick();
    console.log('  나 —', p ? ('이번 주 차례 · 걸린 것: ' + (left().map(function (k) { return ITEMS[k]; }).join(' · ') || '(다 샀거나 소속에 맞는 것이 없다)')) : '이번 주 차례가 아니다');
    if (!me || me.code !== ADMIN) return;
    const picks = (WEEK.data && WEEK.data.picks) || {};
    console.table(Object.keys(picks).map(function (c) {
        const x = picks[c] || {};
        return { 사원: x.name, 사번: x.no, 단계: x.tier + ' ' + (TIER_N[x.tier] || ''),
                 물품: String(x.items || '').split(',').map(function (k) { return ITEMS[k] || k; }).join(' · '),
                 '산 것': Object.keys(x.got || {}).map(function (k) { return ITEMS[k] || k; }).join(' · ') || '-' };
    }));
    const d = db_();
    if (!d) return;
    d.ref(ROOT + '/hist').once('value').then(function (s) {
        const h = s.val() || {}, cs = candidates(), n = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
        cs.forEach(function (c) { n[c.tier][0]++; if (!h[c.code]) n[c.tier][1]++; });
        console.log('  후보 (최근 ' + ACTIVE_DAYS + '일 안에 들어온 사원) ' + cs.length + '명 — 아직 안 뜬 사람 / 모두');
        [1, 2, 3].forEach(function (t) { console.log('    ' + t + ' ' + TIER_N[t] + ' : ' + n[t][1] + ' / ' + n[t][0]); });
    });
};
window.alienWeekRedraw = function (go) {
    const me = u_(), d = db_();
    if (!me || me.code !== ADMIN) { console.log('상담사만'); return; }
    if (!d) return;
    const wk = weekKey();
    if (go !== true) { console.log('이번 주(' + wk + ')를 다시 뽑으려면 alienWeekRedraw(true) — 뽑혔던 사람의 차례 기록도 지웁니다.'); return; }
    d.ref(ROOT).transaction(function (cur) {
        if (!cur || !cur.weeks || !cur.weeks[wk]) return cur;
        const picks = cur.weeks[wk].picks || {};
        if (cur.hist) Object.keys(picks).forEach(function (c) { if (cur.hist[c] === wk) delete cur.hist[c]; });
        delete cur.weeks[wk];
        return cur;
    }).then(function () { lastTry = 0; console.log('이번 주 기록을 지웠습니다 — 곧 다시 뽑습니다.'); });
};

console.log('[🛸 주마다 두 명] 🫙 소원권 · 🪄 도깨비 방망이 — 주마다 ' + PER_WEEK + '명에게 우주 쇼핑몰에 걸린다 · alienWeekState()');
})();
