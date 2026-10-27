// ==========================================
// ★ 🦋 환영 나비 — 상담사 지급 전용
// bundles.json 마지막 묶음 — 맨 끝 (babyfox.js · talkshow.js 보다 뒤)
// ==========================================
//
// ■ 무엇인가
//
//   장착품이다. 은심장 · 호사수구 · 아기 여우와 같은 결 — 상점 · 우주 쇼핑몰 · 장터 어디에도
//   안 깔리고 팔 수 없다. 주는 법은 bflyGive(사번) 과 당국 화면의 「물품 강제 꽂기」뿐.
//
// ■ 여섯 가지 (숫자는 아래 C)
//
//   ① 영혼의 맹약   방의 파티원 셋까지. 맹약 대상 굴림 +2 · 장착자 굴림 +1 × 맹약 수(최대 +3).
//                    맹약 대상의 눈이 9 이하면 실이 당겨 +6 (탐사당 다섯 번) — 대신 장착자의 다음 굴림 −2.
//   ② 레테의 수의   장착자 본인의 눈이 9 이하면 다시 굴린다 (새 눈 +2, 무조건 적용). 탐사당 세 번.
//                    ★ 2026-10-25 — 장착자 본인에게만. (전에는 같은 방 파티원의 9 이하도 이 세 번에서
//                      덮어 주어, 파티원이 먼저 굴리면 장착자 몫이 남지 않았다)
//   ③ 프시케의 유리 늘 굴림 +1 · 선택지 화면에 유리한 쪽이 보인다 · 숫자 셋 중 하나를 맞히면
//                    다음 굴림 +4 (장착자와 맹약 대상 모두). K의 방은 즉사 기믹(🈲)과 유리한 쪽(◈)을 보이고,
//                    유리한 쪽을 골라 숫자를 맞히면 다음 기믹 DC −3.
//   ④ 모이라이의 실타래  하루 세 번 죽음을 유예한다 (그 자리에서 일어선다). 같은 방 파티원이 죽을 때도
//                    대신 쓴다 (같은 세 번). 유예한 만큼 그 판 굴림 +1 (최대 +3).
//   ⑤ 나비의 장례식 다섯 마리 — 판정 · 치유 · 회피 · 파훼 · 무효. Lv 1~10 (처음 불러낼 때 1~3).
//                    판정  굴림 +Lv
//                    치유  탐사를 마치면 오염도 −Lv×2% · K의 방 쉼터마다 체력 +Lv×10 · 심력 +Lv×3
//                    회피  즉사를 피한다 (탐사당 Lv 번)
//                    파훼  기믹을 부순다 (탐사당 Lv 번) · K의 방은 즉사 기믹을 부순다
//                    무효  눈이 5 이하면 없던 일로 하고 11~20 에서 다시 정한다 (탐사당 Lv 번) ·
//                          K의 방은 실패해서 잃는 스탯을 없앤다
//                    붙은 사람이 죽을 자리에서 나비 하나가 대신 소멸한다 (약한 것부터 · 판정은 마지막).
//                    소멸한 나비는 자정에 돌아오고, 레벨은 남는다.
//                    경험 — 살아 나온 탐사마다 +1 · 능력을 쓸 때마다 +1 · 다음 레벨까지 Lv×5.
//                    K의 방 혼자 — 나비가 하나라도 남아 있으면 혼자가 아니다 (혼자 S · A 규칙이 풀린다).
//   ⑥ 에로스의 마지막 숨결  하루 두 번, 본인이나 사원에게. 맞은 날 하루 — 굴림 +2 · 회수품 ×2.5 ·
//                    성공 정산 ×1.5 · 즉사 한 번 회피(맞은 수만큼). 두 번 다 맞으면 포만감·오염도 5시간 동결,
//                    어둠 탐사 · K의 방 횟수가 다시 찬다 (맞는 사람마다 하루 한 번 · bflyBreath.charged).
//                    ✗ 2026-10-26 까지는 펫이 5시간 잠들었다 (따라오지 않음) — 사용자가 뺐다.
//
//   ⑦ 나비의 귀환    장착자가 쓰러져(어둠 · EPIC · K의 방 · 피날레) 상담실 · 선녀탕으로 가게 되면 그 자리에서 꺼내 온다.
//                    하루 세 번. 나올 때 오염도는 퇴원 값(쓰러짐 40). 제 二 신도(여우 신도)가 먼저 꺼냈으면 횟수를 쓰지 않는다.
//                    u.bflyOut = { day, n }   오늘 쓴 귀환
//
//   포인트 — 맹약(×1.5~2) · 모이라이(유예 1번 ×1.33 · 2번 ×1.67 · 3번 ×2) · 숨결(×1.5) 를 다 곱해도 ×2 까지.
//            꿈결(K의 방)은 불리지 않는다.
//
// ■ 적히는 자리
//
//   u.bfly      = { judge:{ lv, xp, gone, nick, to, toName }, … }   내 다섯 마리
//   u.bflyOn    = { judge:{ by, byName, nick, lv }, … }            내게 붙은 나비
//   u.bflyDay   = 'YYYY-MM-DD'                                     자정 되살림 기준
//   u.bflyMoira = { day, n }   오늘 쓴 유예          u.bflyEros = { day, n }   오늘 쓴 숨결
//   u.bflyBreath= { day, n, by, byName, dodged, charged }   오늘 맞은 숨결 (charged — 오늘 탐사 횟수를 채웠다)
//   darkParties/<방>/bfly/<장착자> = { pact:{ 사번:1 }, lethe, abs, debt }
//   darkParties/<방>/bflyPsy/<사번> = n               맞힌 숫자 — 다음 굴림 +n
//
//   ★ 남의 글은 자식 길로만 쓴다 (users/<사번>/bfly/<나비> · bflyOn/<나비>).
//
// ■ 콘솔
//   bflyGive(사번)          상담사가 하나 준다
//   bflyState(사번)         다섯 마리 · 남은 횟수
//   bflyRevive(사번)        상담사 — 소멸한 나비를 지금 되살린다
//   bflyLevel(사번, 나비, Lv) 상담사 — 레벨 손보기
//   bflyHelp()

const BFLY_CFG = {
    NAME: '🦋 환영 나비',
    LV_MAX: 10, START: [1, 3], XP_PER: 5, NICK_MAX: 8,
    LETHE: 3, LETHE_AT: 9, LETHE_ADD: 2,
    PACT_MAX: 3, PACT_ABS: 5, PACT_LIFT: 6, PACT_DEBT: 2, PACT_ME: 1, PACT_THEM: 2, PACT_PTS: [1.5, 2],
    PSY_ROLL: 1, PSY_GUESS: 4, PSY_DC: 3,
    MOIRA: 3, MOIRA_ROLL: 1,
    OUT: 3,                // 쓰러져 상담실 · 선녀탕으로 가게 되면 바로 꺼낸다 — 하루 세 번 (2026-10-26)
    EROS: 2, EROS_ROLL: 2, EROS_LOOT: 2.5, EROS_PTS: 1.5, EROS_HOURS: 5,
    NULL_AT: 5, HEAL_POLL: 2, HEAL_HP: 10, HEAL_MIND: 3,
    PTS_CAP: 1.5                     // ★ 포인트 배수는 1.5 까지 (2026-10-27 · 대신 보정 · 판정은 상한에 안 걸린다 — gear-cap.js)
};

(function butterfly() {
'use strict';
const C = BFLY_CFG;
const NAME = C.NAME;
const ADMIN = 'kario0987';
const MOD = 'bfly-modal';

const KINDS = [
    { k: 'judge', n: '판정', icon: '◇', d: lv => '붙은 사람의 굴림 +' + lv },
    { k: 'heal',  n: '치유', icon: '❋', d: lv => '탐사를 마치면 오염도 −' + (lv * C.HEAL_POLL) + '% · K의 방 쉼터마다 체력 +' + (lv * C.HEAL_HP) },
    { k: 'evade', n: '회피', icon: '✦', d: lv => '즉사를 피한다 — 탐사당 ' + lv + '번' },
    { k: 'smash', n: '파훼', icon: '✧', d: lv => '기믹을 부순다 — 탐사당 ' + lv + '번' },
    { k: 'nul',   n: '무효', icon: '◌', d: lv => '망친 눈(5 이하)을 없던 일로 — 탐사당 ' + lv + '번' }
];
const BY_K = {}; KINDS.forEach(function (x) { BY_K[x.k] = x; });
const KEYS = KINDS.map(function (x) { return x.k; });
// 대신 소멸하는 차례 — 약한 것부터, 판정은 마지막
const SAC_ORDER = ['heal', 'nul', 'smash', 'evade', 'judge'];

// ==========================================
// 손에 잡히는 것들
// ==========================================
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function users() {
    if (typeof db === 'undefined' || !db.users) return [];
    return Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(function (u) { return u && u.name && u.code !== ADMIN; });
}
function userOf(code) {
    const me = u_();
    if (me && code === me.code) return me;
    return (typeof db !== 'undefined' && db.users) ? (db.users[code] || null) : null;
}
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function find(who) {
    if (!who) return u_();
    return users().filter(function (x) { return x.code === who || x.no === who || x.name === who; })[0] || null;
}
function baseOf(w) { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
function wears(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) { return baseOf(w) === NAME; });
}
function kOn() { try { return typeof window.kroomOn === 'function' && window.kroomOn(); } catch (e) { return false; } }
function josa(w, a, b) {
    const s = String(w || ''); const c = s.charCodeAt(s.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return a;
    return ((c - 0xAC00) % 28) ? a : b;
}

// ==========================================
// 다섯 마리
// ==========================================
function flies(u) {
    if (!u) return {};
    if (!u.bfly || typeof u.bfly !== 'object' || Array.isArray(u.bfly)) u.bfly = {};
    return u.bfly;
}
function st(u, k) {
    const all = flies(u);
    if (!all[k] || typeof all[k] !== 'object') all[k] = {};
    return all[k];
}
// 처음 불러낼 때 Lv 1~3
function wake(u) {
    let changed = false;
    KEYS.forEach(function (k) {
        const s = st(u, k);
        if (!s.lv) { s.lv = rnd(C.START[0], C.START[1]); s.xp = 0; changed = true; }
    });
    return changed;
}
// 자정이 지나면 소멸한 나비가 돌아온다 (레벨은 그대로)
function dayRoll(u) {
    if (!u || u.bflyDay === today()) return false;
    u.bflyDay = today();
    KEYS.forEach(function (k) { st(u, k).gone = 0; });
    try { if (u === u_()) { save({ bfly: 1, bflyDay: 1 }); selfNote(u); } } catch (e) { }
    return true;
}
function lvOf(u, k) { return Math.max(1, Math.min(C.LV_MAX, Number(st(u, k).lv) || 1)); }
function alive(u, k) { if (!u) return false; dayRoll(u); return !st(u, k).gone; }

function patch(code, k, p) {
    const u = userOf(code);
    if (u) { const s = st(u, k); Object.keys(p).forEach(function (x) { if (p[x] === null) delete s[x]; else s[x] = p[x]; }); }
    const d = db_();
    if (d && code) { try { d.ref('users/' + code + '/bfly/' + k).update(p).catch(function () { }); } catch (e) { } }
}
function onPatch(code, k, val) {
    const u = userOf(code);
    if (u) { if (!u.bflyOn || typeof u.bflyOn !== 'object') u.bflyOn = {}; if (val === null) delete u.bflyOn[k]; else u.bflyOn[k] = val; }
    const d = db_();
    if (!d || !code) return;
    try { if (val === null) d.ref('users/' + code + '/bflyOn/' + k).remove().catch(function () { }); else d.ref('users/' + code + '/bflyOn/' + k).set(val).catch(function () { }); } catch (e) { }
}

// 지금 이 화면에서 쓸 수 있는 나비 — 내게 붙어 있는 남의 것, 또는 남에게 안 붙인 내 것
function usable(k) {
    const me = u_();
    if (!me) return null;
    const on = me.bflyOn && me.bflyOn[k];
    if (on && on.by && on.by !== me.code) {
        const o = userOf(on.by);
        if (o && wears(o) && alive(o, k) && st(o, k).to === me.code) {
            return { k: k, lv: lvOf(o, k), owner: o, ownerCode: on.by, nick: st(o, k).nick || on.nick || '', mine: false };
        }
    }
    if (wears(me) && alive(me, k) && !st(me, k).to) {
        return { k: k, lv: lvOf(me, k), owner: me, ownerCode: me.code, nick: st(me, k).nick || '', mine: true };
    }
    return null;
}
function nickOf(x) { return x ? (x.nick || (BY_K[x.k].n + ' 나비')) : ''; }
function flyCount() { return KEYS.filter(function (k) { return !!usable(k); }).length; }

// 이번 탐사에서 쓴 횟수 (회피 · 파훼 · 무효)
function used(k) { const r = run(); return (r && r._bfUse && r._bfUse[k]) || 0; }
function canUse(k) { const x = usable(k); return (x && used(k) < x.lv) ? x : null; }
function spend(k) {
    const r = run(); if (!r) return;
    r._bfUse = r._bfUse || {};
    r._bfUse[k] = (r._bfUse[k] || 0) + 1;
    xpAdd(k, 1);
}

// 경험 — 나비 주인의 기록에 적는다 (붙은 사람이 써도 주인 몫)
function xpAdd(k, n) {
    const x = usable(k);
    if (!x) return;
    const code = x.ownerCode;
    const apply = function (s) {
        s = s || {};
        let lv = Math.max(1, Number(s.lv) || 1), xp = (Number(s.xp) || 0) + n;
        while (lv < C.LV_MAX && xp >= lv * C.XP_PER) { xp -= lv * C.XP_PER; lv++; }
        if (lv >= C.LV_MAX) xp = Math.min(xp, C.LV_MAX * C.XP_PER);
        s.lv = lv; s.xp = xp;
        return s;
    };
    const o = userOf(code);
    const before = o ? lvOf(o, k) : 0;
    if (o) apply(st(o, k));
    const d = db_();
    if (d) {
        try { d.ref('users/' + code + '/bfly/' + k).transaction(function (cur) { if (!cur) return; return apply(cur); }).catch(function () { }); } catch (e) { }
    }
    if (o && lvOf(o, k) > before) {
        log_(o, '[' + NAME + '] ' + nickOf(x) + ' Lv.' + lvOf(o, k));
        if (x.mine) toast('🦋 ' + nickOf(x) + ' — Lv.' + lvOf(o, k));
    }
}

// 소멸 — 그날은 다시 못 부른다 (레벨은 남는다)
function noteLine(k) { return '[🦋 ' + BY_K[k].n + ' 나비가 당신 곁을 맴돕니다.]'; }
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
    const bar = raw.indexOf('|') >= 0, br = /<br\s*\/?>/i.test(raw);
    const keep = raw.split(/\s*\|\s*|<br\s*\/?>|\n/).filter(function (x) { return x && x.indexOf(line) < 0; });
    const out = keep.join(bar ? ' | ' : (br ? '<br>' : '\n')) || '특이사항 없음';
    if (obj) u.badge[key] = out; else u.badge = out;
    return true;
}
// 내 곁의 나비 — 장착자 본인에게도 뱃지 한 줄 (남에게 둔 나비처럼 눈에 보이게)
//   「[🦋 내 곁의 나비 — 판정 · 치유 · 회피 · 파훼 · 무효 나비가 당신 곁을 맴돕니다.]」
//   보내거나 · 거둬 오거나 · 소멸하거나 · 자정에 돌아오면 다시 적는다.
const SELF_MARK = '[🦋 내 곁의 나비';
function selfList(u) {
    if (!u || !wears(u)) return [];
    const f = (u.bfly && typeof u.bfly === 'object') ? u.bfly : {};
    return KEYS.filter(function (k) { const s = f[k] || {}; return s.lv && !s.gone && !s.to; });
}
function selfLine(u) {
    const l = selfList(u);
    return l.length ? SELF_MARK + ' — ' + l.map(function (k) { return BY_K[k].n; }).join(' · ') + ' 나비가 당신 곁을 맴돕니다.]' : '';
}
function notesOf(u) {
    if (!u || !u.badge) return '';
    return String(typeof u.badge === 'object' ? (u.badge[badgeKey(u)] || '') : u.badge);
}
function selfNote(u) {
    u = u || u_();
    if (!u || u !== u_()) return;
    const want = selfLine(u), raw = notesOf(u);
    const n = raw.split(SELF_MARK).length - 1;
    if (want ? (n === 1 && raw.indexOf(want) >= 0) : n === 0) return;
    cutNote(u, SELF_MARK);
    if (want) { try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, want); } catch (e) { } }
    save({ badge: 1 });
}
window.bflyNoteLive = function (u, note) {
    try {
        const t = String(note || '');
        if (t.indexOf(SELF_MARK) >= 0) return selfList(u).length > 0;
        const hit = KINDS.filter(function (x) { return t.indexOf(noteLine(x.k)) >= 0; })[0];
        if (!hit) return true;
        const on = u && u.bflyOn && u.bflyOn[hit.k];
        if (!on) return false;
        const o = userOf(on.by);
        return !!(o && st(o, hit.k).to === u.code && !st(o, hit.k).gone);
    } catch (e) { return true; }
};
function detach(ownerCode, k, quiet) {
    const o = userOf(ownerCode);
    const s = o ? st(o, k) : {};
    if (!s.to) return;
    const t = userOf(s.to);
    if (t) {
        cutNote(t, noteLine(k));
        try { if (typeof updateUserFields === 'function') updateUserFields(s.to, { badge: t.badge }); } catch (e) { }
    }
    onPatch(s.to, k, null);
    patch(ownerCode, k, { to: null, toName: null });
    const me = u_();
    if (!quiet && me && ownerCode === me.code && !st(me, k).gone) selfNote(me);   // 내 곁으로 돌아왔다
}
function kill(k, why) {
    const x = usable(k);
    if (!x) return false;
    patch(x.ownerCode, k, { gone: 1 });
    detach(x.ownerCode, k);
    const me = u_();
    if (me && me.bflyOn && me.bflyOn[k] && !x.mine) delete me.bflyOn[k];
    if (x.mine) selfNote(me);
    log_(x.owner, '[' + NAME + '] ' + nickOf(x) + ' — ' + (why || '소멸했습니다.'));
    toast('🦋 ' + nickOf(x) + (why ? ' — ' + why : ' 소멸'));
    return true;
}

// ==========================================
// 방 — 맹약 · 레테 · 대신 받은 몫
// ==========================================
function pid() { const r = run(); return (r && r.partyId) || (typeof myPartyId !== 'undefined' ? myPartyId : null); }
function party() { try { const p = pid(); return (p && typeof darkParties !== 'undefined') ? (darkParties[p] || null) : null; } catch (e) { return null; } }
function pnode(w) { const p = party(); return (p && p.bfly && p.bfly[w]) || {}; }
function pref(path) { const d = db_(), p = pid(); return (d && p) ? d.ref('darkParties/' + p + '/' + path) : null; }
function members() { const p = party(); return (p && p.members) ? Object.keys(p.members) : []; }
function wearersHere() {
    const me = u_();
    return members().filter(function (c) { return c !== (me && me.code) && wears(userOf(c)); });
}
function pactList(w) { return Object.keys(pnode(w).pact || {}).filter(function (c) { return members().indexOf(c) >= 0; }); }
function myPact() { const me = u_(); return (me && wears(me)) ? pactList(me.code) : []; }
function pactBy() {                    // 나를 맹약 대상으로 둔 장착자
    const me = u_(); if (!me) return [];
    return wearersHere().filter(function (w) { return pactList(w).indexOf(me.code) >= 0; });
}
function bump(w, field, dv, max) {     // 방 자리의 수를 하나 올린다 (트랜잭션)
    const p = party();
    if (p) { p.bfly = p.bfly || {}; p.bfly[w] = p.bfly[w] || {}; p.bfly[w][field] = Math.max(0, (Number(p.bfly[w][field]) || 0) + dv); }
    const ref = pref('bfly/' + w + '/' + field);
    if (ref) { try { ref.transaction(function (cur) { const n = Math.max(0, (Number(cur) || 0) + dv); return (max != null && n > max) ? undefined : n; }).catch(function () { }); } catch (e) { } }
}

// 레테 — 장착자 본인의 눈에만. 탐사 안에서 센다 (파티원 몫으로 나가지 않는다)
function letheLeft() {
    const r = run();
    return Math.max(0, C.LETHE - ((r && r._bfLethe) || 0));
}
function letheTake() {
    const me = u_(), r = run();
    if (!me || !r || !wears(me) || letheLeft() <= 0) return null;
    r._bfLethe = (r._bfLethe || 0) + 1;
    return me.code;
}

// ==========================================
// 모이라이 — 하루 세 번 (모든 어둠 합산)
// ==========================================
function moiraUsed(u) { return (u && u.bflyMoira && u.bflyMoira.day === today()) ? (Number(u.bflyMoira.n) || 0) : 0; }
function moiraLeft(u) { return wears(u) ? Math.max(0, C.MOIRA - moiraUsed(u)) : 0; }
function moiraTake() {
    const me = u_();
    if (!me) return null;
    if (moiraLeft(me) > 0) {
        me.bflyMoira = { day: today(), n: moiraUsed(me) + 1 };
        save({ bflyMoira: 1 });
        const r = run(); if (r) r._bfMoira = (r._bfMoira || 0) + 1;
        return { self: true, by: me.code };
    }
    const w = wearersHere().filter(function (c) { return moiraLeft(userOf(c)) > 0; })[0];
    if (!w) return null;
    const o = userOf(w);
    o.bflyMoira = { day: today(), n: moiraUsed(o) + 1 };
    const d = db_();
    if (d) { try { d.ref('users/' + w + '/bflyMoira').transaction(function (cur) { const n = (cur && cur.day === today()) ? (Number(cur.n) || 0) : 0; if (n >= C.MOIRA) return; return { day: today(), n: n + 1 }; }).catch(function () { }); } catch (e) { } }
    return { self: false, by: w };
}

// ==========================================
// 에로스 — 하루 두 번
// ==========================================
function erosUsed(u) { return (u && u.bflyEros && u.bflyEros.day === today()) ? (Number(u.bflyEros.n) || 0) : 0; }
function breathOf(u) { return (u && u.bflyBreath && u.bflyBreath.day === today()) ? u.bflyBreath : null; }
function breathN(u) { const b = breathOf(u); return b ? (Number(b.n) || 0) : 0; }
function breathDodgeLeft(u) { const b = breathOf(u); return b ? Math.max(0, (Number(b.n) || 0) - (Number(b.dodged) || 0)) : 0; }

window.bflyBreathe = function (code) {
    const me = u_();
    if (!me || !wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    if (erosUsed(me) >= C.EROS) { alert_('오늘의 숨결은 다 썼습니다. (하루 ' + C.EROS + '번)'); return; }
    const t = userOf(code || me.code);
    if (!t) return;
    const b = breathOf(t) || { day: today(), n: 0, dodged: 0 };
    b.n = (Number(b.n) || 0) + 1; b.by = me.code; b.byName = me.name; b.day = today();
    t.bflyBreath = b;
    const f = { bflyBreath: b };
    const twice = b.n >= 2;
    if (twice) {
        const till = Date.now() + C.EROS_HOURS * 3600 * 1000;
        t.pollFreezeUntil = Math.max(Number(t.pollFreezeUntil) || 0, till);
        t.satHoldUntil = Math.max(Number(t.satHoldUntil) || 0, till);
        f.pollFreezeUntil = t.pollFreezeUntil; f.satHoldUntil = t.satHoldUntil;
    }
    // 두 번 맞으면 어둠 탐사 횟수를 다시 채운다 — 맞는 사람마다 하루 한 번 (2026-10-26)
    const charge = twice && !b.charged;
    if (charge) {
        b.charged = 1;
        t.darkDate = today(); t.darkTries = 0;          // 내 것이면 dark-count.js 가 차이를 서버(darkUse)로 보낸다
        if (t !== me) { f.darkDate = t.darkDate; f.darkTries = 0; }   // 남의 것 — updateUserFields 가 darkUse 에도 적는다
        // K 의 방 횟수(kroomUse)도 같이 0 으로
        try {
            if (typeof window.kroomTriesReset === 'function') window.kroomTriesReset(t.code);
            else if (typeof database !== 'undefined' && database) database.ref('kroomUse/' + t.code).set({ d: today(), n: 0 }).catch(function () { });
        } catch (e) { }
    }
    me.bflyEros = { day: today(), n: erosUsed(me) + 1 };
    log_(t, '[' + NAME + '] ' + (t === me ? '스스로' : me.name + ' 사원이') + ' 에로스의 마지막 숨결을 불어 넣었습니다.' + (twice ? ' (두 번 — 포만감·오염도 ' + C.EROS_HOURS + '시간 동결' + (charge ? ', 어둠 탐사 · K의 방 횟수 충전' : '') + ')' : ''));
    if (t !== me) { log_(me, '[' + NAME + '] ' + t.name + ' 사원에게 숨결'); f.history = t.history; f.hasItemUsedOnMe = true; }
    try {
        if (t === me) save(Object.assign({ bflyEros: 1, history: 1 }, Object.keys(f).reduce(function (a, k) { a[k] = 1; return a; }, {})));
        if (charge && t === me) { try { if (typeof renderDarkness === 'function') renderDarkness(); } catch (e2) { } }
        else {
            updateUserFields(t.code, f); save({ bflyEros: 1, history: 1 });
            // 방금 한 번 쓴 사람이면 save-merge 가 0 을 「안 바뀐 빈 칸」으로 보고 뺀다 — 사원 기록 칸에도 바로 적는다 (진짜 값 darkUse 는 위에서 적힌다)
            if (charge && typeof database !== 'undefined' && database) database.ref('users/' + t.code + '/darkTries').set(0).catch(function () { });
        }
    } catch (e) { }
    shut();
    alert_('🦋 에로스의 마지막 숨결 — ' + (t === me ? '당신' : t.name + ' 사원') + '\n\n오늘 하루 굴림 +' + C.EROS_ROLL + ' · 회수품 ×' + C.EROS_LOOT + ' · 성공 정산 ×' + C.EROS_PTS + ' · 즉사 한 번 회피'
        + (twice ? '\n\n두 번째 숨결 — 포만감·오염도가 ' + C.EROS_HOURS + '시간 멈춥니다.'
            + (charge ? '\n어둠 탐사 · K의 방 횟수가 다시 찼습니다.' : '\n(횟수 충전은 오늘 이미 받았습니다)') : '')
        + '\n\n(오늘 남은 숨결 ' + (C.EROS - erosUsed(me)) + '번)');
};
// 숨결이 펫을 재우던 것은 뺐다 (2026-10-26) — 그 전에 맞아 남아 있는 잠을 깨운다 (petSleepUntil 을 적는 곳은 숨결뿐이었다)
setInterval(function () {
    try {
        const me = u_();
        if (!me || !((Number(me.petSleepUntil) || 0) > Date.now())) return;
        me.petSleepUntil = 0;
        save({ petSleepUntil: 1 });
    } catch (e) { }
}, 5000);

// ==========================================
// 굴림 보정 — 판정 나비 · 프시케 · 맹약 · 모이라이 · 숨결
// ==========================================
function bonusNow() {
    const me = u_(), r = run();
    if (!me || !r) return 0;
    let b = 0;
    const j = usable('judge');
    if (j) b += j.lv;
    if (wears(me)) b += C.PSY_ROLL + Math.min(C.PACT_MAX, myPact().length) * C.PACT_ME;
    if (pactBy().length) b += C.PACT_THEM;
    if (r._bfMoira) b += Math.min(C.MOIRA, r._bfMoira) * C.MOIRA_ROLL;
    if (breathN(me) > 0) b += C.EROS_ROLL;
    return b;
}
(function hookBonus() {
    const iv = setInterval(function () {
        if (typeof rollDarkBonus !== 'function') return;
        if (rollDarkBonus._bfly) { clearInterval(iv); return; }
        const _r = rollDarkBonus;
        const w = function () {
            let b = _r.apply(this, arguments);
            try { b += bonusNow(); } catch (e) { }
            return b;
        };
        w._bfly = true;
        rollDarkBonus = w; window.rollDarkBonus = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 눈 — 무효 · 레테 · 맹약의 실 · 프시케 · 대신 받은 몫  (K의 방은 kroom-core.js 가 따로 부른다)
// ==========================================
function pendingPsy() {
    const me = u_(), p = party();
    let n = 0;
    const r = run();
    if (r && r._bfPsyNext) { n += r._bfPsyNext; r._bfPsyNext = 0; }
    if (p && p.bflyPsy && me && p.bflyPsy[me.code]) {
        n += Number(p.bflyPsy[me.code]) || 0;
        delete p.bflyPsy[me.code];
        const ref = pref('bflyPsy/' + me.code); if (ref) { try { ref.remove(); } catch (e) { } }
    }
    return n;
}
function eyes(roll) {
    const me = u_(), r = run();
    if (!me || !r || kOn()) return roll;
    try { finPhase(); } catch (e) { }
    // 무효 — 5 이하면 없던 일로
    if (roll <= C.NULL_AT) {
        const nx = canUse('nul');
        if (nx) {
            spend('nul');
            const nr = rnd(11, 20);
            r.log && r.log.push('[🦋 무효] ' + roll + ' → ' + nr);
            toast('🦋 ' + nickOf(nx) + ' — 그 눈은 없던 일이 되었다 (' + roll + ' → ' + nr + ')');
            roll = nr;
        }
    }
    // 레테 — 9 이하면 다시 굴린다 (새 눈 +2 · 무조건 적용)
    if (roll <= C.LETHE_AT) {
        const w = letheTake();
        if (w) {
            const mx = (typeof window.diceMax === 'function') ? window.diceMax() : 20; const nr = Math.min(mx, rnd(1, mx) + C.LETHE_ADD);
            r.log && r.log.push('[🦋 레테의 수의] ' + roll + ' → ' + nr + ' (남은 ' + letheLeft() + ')');
            toast('🦋 레테의 수의 — 방금 것을 덮었다 (' + roll + ' → ' + nr + ' · 남은 ' + letheLeft() + ')');
            roll = nr;
        }
    }
    // 맹약의 실 — 내가 맹약 대상이면 실이 당겨 준다 (그 장착자의 탐사당 다섯 번)
    if (roll <= C.LETHE_AT) {
        const w = pactBy().filter(function (c) { return (Number(pnode(c).abs) || 0) < C.PACT_ABS; })[0];
        if (w) {
            bump(w, 'abs', 1, C.PACT_ABS);
            bump(w, 'debt', 1);
            const nr = Math.min(20, roll + C.PACT_LIFT);
            r.log && r.log.push('[🦋 영혼의 맹약] ' + roll + ' → ' + nr + ' (' + nameOf(w) + ' 사원이 대신 받음)');
            toast('🦋 영혼의 맹약 — ' + nameOf(w) + ' 사원 쪽으로 실이 당겨졌다 (' + roll + ' → ' + nr + ')');
            roll = nr;
        }
    }
    // 프시케 — 맞힌 숫자
    const ps = pendingPsy();
    if (ps) { roll = Math.min(20, roll + ps); toast('🦋 프시케의 유리 — 다음 한 번 +' + ps); }
    // 대신 받은 몫 — 내가 장착자면 다음 굴림 −2 씩
    if (wears(me)) {
        const debt = Number(pnode(me.code).debt) || 0;
        if (debt > 0) {
            bump(me.code, 'debt', -1);
            roll = Math.max(1, roll - C.PACT_DEBT);
            r.log && r.log.push('[🦋 영혼의 맹약] 대신 받은 몫 −' + C.PACT_DEBT);
        }
    }
    return roll;
}
(function hookRoll() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._bfly) { clearInterval(iv); return; }
        const _l = luckReroll;
        const w = function (roll) {
            let out = _l.apply(this, arguments);
            try { out = eyes(out); } catch (e) { console.warn('[환영 나비] 눈', e); }
            return out;
        };
        w._bfly = true;
        luckReroll = w; window.luckReroll = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 죽음 — 회피 나비 · 숨결 · 모이라이 · 대신 소멸
// ==========================================
//   돌려주는 것 — 살렸으면 그 자리에 쓸 글줄, 못 살렸으면 null
//   차례 — 회피 나비 → 숨결 → 나비 하나가 대신 소멸(Lv 낮은 것부터 · 판정은 마지막) → 모이라이 유예
//   K의 방은 회피 · 숨결을 장면에서 먼저 쓰므로(kroomPick) 여기서는 소멸 · 유예만 본다.
function saveFromDeath(where) {
    const me = u_();
    if (!me) return null;
    if (where !== 'kroom') {
        const ev = canUse('evade');
        if (ev) {
            spend('evade');
            return '<span style="color:#c9b8ff;">— 날개가 시야를 가렸다. ' + esc(nickOf(ev)) + josa(nickOf(ev), '이', '가') + ' 그 자리를 비켜 세웠다.<br>당신은 반 걸음 옆에 서 있다. (회피 ' + used('evade') + ' / ' + ev.lv + ')</span>';
        }
        if (breathDodgeLeft(me) > 0) {
            const b = breathOf(me);
            b.dodged = (Number(b.dodged) || 0) + 1;
            me.bflyBreath = b; save({ bflyBreath: 1 });
            return '<span style="color:#ffb3c7;">— 입술에 남아 있던 숨이 한 번 더 뛰었다.<br>에로스의 마지막 숨결이 그 죽음을 비껴갔다.</span>';
        }
    }
    const left = KEYS.map(usable).filter(Boolean).sort(function (a, b) {
        if ((a.k === 'judge') !== (b.k === 'judge')) return a.k === 'judge' ? 1 : -1;
        return (a.lv - b.lv) || (SAC_ORDER.indexOf(a.k) - SAC_ORDER.indexOf(b.k));
    });
    if (left.length) {
        const x = left[0], nm = nickOf(x);
        kill(x.k, '대신 소멸했습니다.');
        return '<span style="color:#b8d8ff;">— 나비 한 마리가 당신 앞으로 내려앉았다.<br>' + esc(nm) + josa(nm, '이', '가') + ' 당신 대신 그것을 받았다. 날개 가루가 흩어지고, 곧 아무것도 남지 않는다.'
            + (x.mine ? '' : '<br>(' + esc(x.owner.name) + ' 사원의 나비)') + '</span>';
    }
    const m = moiraTake();
    if (m) {
        const n = m.self ? moiraLeft(me) : moiraLeft(userOf(m.by));
        return '<span style="color:#d9c27a;">— 실이 팽팽하게 당겨졌다. 끊어져야 할 자리에서 끊어지지 않는다.<br>'
            + (m.self ? '모이라이의 실타래가 그 끝을 뒤로 미뤘다.' : esc(nameOf(m.by)) + ' 사원의 실타래가 당신의 끝까지 이어졌다.')
            + ' (오늘 남은 유예 ' + n + ')</span>';
    }
    return null;
}
// ==========================================
// ⑦ 나비의 귀환 — 쓰러져 상담실 · 선녀탕으로 가게 되면 바로 꺼낸다 (하루 세 번 · 장착자 본인)
// ==========================================
function outUsed(u) { return (u && u.bflyOut && u.bflyOut.day === today()) ? (Number(u.bflyOut.n) || 0) : 0; }
function outLeft(u) { return wears(u) ? Math.max(0, C.OUT - outUsed(u)) : 0; }
function heldNow(u) { return !!(u && ((Number(u.quarantineUntil) || 0) > Date.now() || u.quarantineHospital)); }
const OUT_SHUT = ['fox-modal', 'bath-modal', 'fox-room-overlay', 'fox-nameplate-overlay', 'quarantine-pick-overlay', 'fox-loading-overlay'];
function outNow() {
    const me = u_();
    if (!me || outLeft(me) <= 0 || !heldNow(me)) return false;     // 제 二 신도가 먼저 꺼냈으면 그대로
    const bath = (me.quarantineDest || '') === 'bath';
    let out = Number(me.quarantineExitPollution) || 0;
    if (out >= 100) out = 99;
    me.quarantineUntil = 0; me.quarantineHospital = false; me.quarantineDest = null; me.quarantineExitPollution = 0;
    me.pollution = out; me.lastPollutionTime = Date.now(); me.foxRoomAnswered = false;
    try { hasShownFoxAlert = false; } catch (e) { }
    if (me.badge && typeof me.badge === 'object') {
        const key = badgeKey(me);
        if (typeof me.badge[key] === 'string') {
            const arr = me.badge[key].split(' | ').filter(function (n) { return n.trim() !== '' && n.indexOf('의식 불명') < 0 && n.indexOf('긴급 이송') < 0; });
            me.badge[key] = arr.length ? arr.join(' | ') : '특이사항 없음';
        }
    }
    me.bflyOut = { day: today(), n: outUsed(me) + 1 };
    const left = outLeft(me);
    log_(me, '[' + NAME + '] 나비의 귀환 — 나비 떼가 ' + (bath ? '선녀탕' : '상담실') + '에서 당신을 데리고 나왔습니다. (오늘 남은 ' + left + ')');
    const f = { quarantineUntil: 1, quarantineHospital: 1, quarantineDest: 1, quarantineExitPollution: 1, pollution: 1,
                lastPollutionTime: 1, foxRoomAnswered: 1, bflyOut: 1, history: 1 };
    if (me.badge !== undefined) f.badge = 1;
    save(f);
    OUT_SHUT.forEach(function (id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('🦋 나비의 귀환\n\n쓰러진 자리에서 나비 떼가 일어났습니다.\n' + (bath ? '선녀탕으로' : '상담실로') + ' 가지 않습니다. (오염도 ' + out + '%)\n\n오늘 남은 귀환 ' + left + ' / ' + C.OUT);
    return true;
}
// 쓰러진 뒤 — 제 二 신도가 먼저 꺼낼 틈을 두고 본다
function outSoon() {
    const me = u_();
    if (!me || outLeft(me) <= 0) return;
    setTimeout(function () { try { outNow(); } catch (e) { console.warn('[환영 나비] 귀환', e); } }, 3000);
}
window.bflyOutLeft = function () { return outLeft(u_()); };
// EPIC
(function hookEpicOut() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._bflyOut) { clearInterval(iv); return; }
        const _e = epicDeath;
        const w = function () {
            const out = _e.apply(this, arguments);
            try { if (typeof er !== 'undefined' && er && er.dead) outSoon(); } catch (e) { }
            return out;
        };
        Object.keys(_e).forEach(function (k) { if (!(k in w)) { try { w[k] = _e[k]; } catch (e) { } } });
        w._bflyOut = true;
        epicDeath = w; window.epicDeath = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// 피날레 탈락
(function hookFinOut() {
    const iv = setInterval(function () {
        const X = window.FINX;
        if (!X || typeof X.eliminate !== 'function') return;
        if (X.eliminate._bflyOut) { clearInterval(iv); return; }
        const _el = X.eliminate;
        const w = function () {
            const out = _el.apply(this, arguments);
            try { const r = run(); if (r && r._dead) outSoon(); } catch (e) { }
            return out;
        };
        Object.keys(_el).forEach(function (k) { if (!(k in w)) { try { w[k] = _el[k]; } catch (e) { } } });
        w._bflyOut = true;
        X.eliminate = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._bfly) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            try {
                const r = run();
                if (r && !kOn() && !r._dead) {
                    const line = saveFromDeath('dark');
                    if (line) {
                        r._dead = false;
                        const box = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
                        if (box && typeof darkBox === 'function' && typeof darkChoiceBtn === 'function') {
                            box.innerHTML = darkBox('—', String(reasonText || '') + '<br><br>' + line, darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                            try { if (typeof mountDarkChat === 'function') mountDarkChat('normal'); } catch (e) { }
                        }
                        try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
                        return;
                    }
                }
            } catch (e) { console.warn('[환영 나비] 죽음 건너뜀:', e && e.message); }
            const out = _d.apply(this, arguments);
            try { const r2 = run(); if (r2 && r2._dead && !kOn()) outSoon(); } catch (e) { }   // ⑦ 나비의 귀환
            return out;
        };
        w._bfly = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 선택지 화면 — 프시케의 유리 · 파훼 나비
// ==========================================
window.bflyPsyGuess = function (i) {
    const r = run(), me = u_();
    if (!r || !me || !wears(me)) return;
    if (r._bfPsyDone === r.step) return;
    r._bfPsyDone = r.step;
    const ok = Number(i) === Number(r._bfPsyAns);
    const el = document.getElementById('bfly-psy');
    if (ok) {
        r._bfPsyNext = (r._bfPsyNext || 0) + C.PSY_GUESS;
        myPact().forEach(function (c) {
            const ref = pref('bflyPsy/' + c); if (ref) { try { ref.set(C.PSY_GUESS); } catch (e) { } }
        });
        if (el) el.innerHTML = '<span style="color:#9fe6b0;">유리가 맑게 울린다 — 다음 굴림 +' + C.PSY_GUESS + (myPact().length ? ' (맹약 대상도)' : '') + '</span>';
    } else if (el) el.innerHTML = '<span style="color:#888;">유리에 금이 간다. 숫자는 ' + r._bfPsyAns + '이었다.</span>';
};
window.bflySmash = function () {
    const r = run();
    const x = canUse('smash');
    if (!r || !x) return;
    spend('smash');
    // ★ 피날레 — 장면이 F.sc 로 돌아 partyAdvance 로 넘기면 같은 선택지로 되돌아온다 (2026-10-25)
    //   거기서는 「다음에 실패할 판정을 한 번 넘기는 몫」으로 건다 (finale-core.js X.smash)
    if (finOn()) {
        try { if (r.isParty) sendPartyChat((u_() || {}).name + ' 사원의 나비가 기믹을 부쉈습니다.', true); } catch (e) { }
        window.FINX.smash('🦋 ' + nickOf(x) + ' (파훼 ' + used('smash') + '/' + x.lv + ')');
        return;
    }
    r.success = (r.success || 0) + 2;
    try { if (r.isParty) sendPartyChat((u_() || {}).name + ' 사원의 나비가 기믹을 부쉈습니다.', true); } catch (e) { }
    const box = darkBodyEl();
    box.innerHTML = darkBox(NAME, '날개 끝이 그것에 닿았다.<br><br>닿은 자리부터 가루가 되어 무너진다. 무너진 것은 소리를 내지 않는다.<br><br>'
        + '<span style="color:#b8d8ff;">' + esc(nickOf(x)) + ' — 파훼 ' + used('smash') + ' / ' + x.lv + '</span>',
        darkChoiceBtn('지나간다.', 'partyAdvance(' + (r.step + 1) + ')'));
    try { mountDarkChat('normal'); } catch (e) { }
};
function psyBlock(options) {
    const me = u_(), r = run();
    if (!me || !r || !wears(me) || !Array.isArray(options) || !options.length) return '';
    const fav = String((options[0] && options[0].label) || '').replace(/<[^>]+>/g, '');
    if (r._bfPsyAt !== r.step) { r._bfPsyAt = r.step; r._bfPsyAns = rnd(1, 3); }
    const done = r._bfPsyDone === r.step;
    const btn = function (i) {
        return '<button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:12px;" onclick="bflyPsyGuess(' + i + ')">' + i + '</button>';
    };
    return '<div style="margin-top:12px; padding:9px 10px; border:1px solid #5b4a7a; border-radius:6px; background:rgba(90,70,130,.12); font-size:11px; color:#d8c8ff; line-height:1.7;">'
        + '🦋 프시케의 유리 — 유리한 쪽: <b>' + esc(fav) + '</b>'
        + '<div id="bfly-psy" style="margin-top:6px;">' + (done ? '<span style="color:#888;">이번 장면은 이미 짚었다.</span>'
            : '숫자 하나를 짚는다 — 맞히면 다음 굴림 +' + C.PSY_GUESS + '<div style="display:flex; gap:6px; margin-top:5px;">' + btn(1) + btn(2) + btn(3) + '</div>') + '</div></div>';
}
function smashBtn() {
    const x = canUse('smash');
    if (!x) return '';
    return '<button class="game-btn" style="width:100%; margin:8px 0 0 0; padding:12px; font-size:12px; background:linear-gradient(145deg,#3a3a6a,#1c1c3a) !important; border-color:#9fb4ff !important; color:#fff !important;" onclick="bflySmash()">🦋 '
        + esc(nickOf(x)) + ' — 기믹을 부순다 (남은 ' + (x.lv - used('smash')) + ')</button>';
}
(function hookChoice() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._bfly) { clearInterval(iv); return; }
        const _c = renderChoiceStep;
        const w = function (title, text, options, imgKey) {
            let add = '';
            try { add = psyBlock(options); } catch (e) { }
            const r = _c.call(this, title, String(text || '') + add, options, imgKey);
            try {
                const sb = smashBtn();
                if (sb) {
                    const body = darkBodyEl();
                    const area = document.getElementById('vote-area');
                    if (area) area.insertAdjacentHTML('afterend', sb);
                    else if (body) {
                        const bs = Array.prototype.filter.call(body.querySelectorAll('button.game-btn'), function (b) { return !b.closest('#bfly-psy') && b.hasAttribute('onclick') && !/chat/i.test(b.getAttribute('onclick')); });
                        if (bs.length) bs[bs.length - 1].insertAdjacentHTML('afterend', sb);
                    }
                }
            } catch (e) { }
            return r;
        };
        w._bfly = true;
        renderChoiceStep = w; window.renderChoiceStep = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 정산 — 포인트 ×2 까지 · 치유 나비 · 경험
// ==========================================
function multNow() {
    const me = u_(), r = run();
    if (!me || !r) return { m: 1, why: [] };
    let m = 1; const why = [];
    if (wears(me) && myPact().length) {
        if (!r._bfPactMult) r._bfPactMult = C.PACT_PTS[0] + Math.random() * (C.PACT_PTS[1] - C.PACT_PTS[0]);
        m *= r._bfPactMult; why.push('맹약 ×' + r._bfPactMult.toFixed(2));
    }
    if (r._bfMoira) { const mm = 1 + Math.min(C.MOIRA, r._bfMoira) / C.MOIRA * (C.PTS_CAP - 1); m *= mm; why.push('모이라이 ×' + mm.toFixed(2)); }
    if (breathN(me) > 0) { m *= C.EROS_PTS; why.push('숨결 ×' + C.EROS_PTS); }
    return { m: Math.min(C.PTS_CAP, m), why: why };
}
function runXp() { KEYS.forEach(function (k) { if (usable(k)) xpAdd(k, 1); }); }
window.bflyRunXp = runXp;
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._bfly) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        const w = function () {
            const me = u_(), r = run();
            if (!me || !r || r._dead || r._settled) return _r.apply(this, arguments);
            let M = { m: 1, why: [] }, healLv = 0;
            try { M = multNow(); const h = usable('heal'); healLv = h ? h.lv : 0; runXp(); } catch (e) { }
            const before = Number(me.points) || 0;
            const out = _r.apply(this, arguments);
            try {
                const got = (Number(me.points) || 0) - before;
                const lines = [];
                if (M.m > 1 && got > 0) {
                    const extra = Math.round(got * (M.m - 1));
                    me.points += extra;
                    lines.push('포인트 ×' + M.m.toFixed(2) + ' (+' + extra.toLocaleString() + ' P)' + (M.why.length ? ' — ' + M.why.join(' · ') : ''));
                    log_(me, '[' + NAME + '] 정산 ×' + M.m.toFixed(2) + ' (+' + extra.toLocaleString() + ' P)');
                }
                if (healLv) {
                    const was = Number(me.pollution) || 0;
                    me.pollution = Math.max(0, was - healLv * C.HEAL_POLL);
                    if (me.pollution !== was) lines.push('치유 나비 — 오염도 ' + was + '% → ' + me.pollution + '%');
                }
                if (lines.length) {
                    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
                    setTimeout(function () { alert_('🦋 ' + NAME + '\n\n' + lines.join('\n')); }, 1200);
                }
            } catch (e) { console.warn('[환영 나비] 정산', e); }
            return out;
        };
        w._bfly = true;
        renderDarkResult = w; window.renderDarkResult = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookLoot() {
    const iv = setInterval(function () {
        if (typeof emLootMult !== 'function') return;
        if (emLootMult._bfly) { clearInterval(iv); return; }
        const _e = emLootMult;
        const w = function () {
            let m = _e.apply(this, arguments);
            try { if (breathN(u_()) > 0) m *= C.EROS_LOOT; } catch (e) { }
            return m;
        };
        w._bfly = true;
        emLootMult = w; window.emLootMult = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ★ 피날레 — 판 하나가 길다 (2026-10-25)
// ==========================================
//   피날레(Qtrew-S-018)는 오프닝 · 로비 셋 · 탐사 둘 · 연회로 판정이 서른 번 가까이 된다.
//   「탐사당」 몫(레테 셋 · 무효 · 회피 · 파훼 · 맹약의 실)이 앞의 몇 판정에서 다 떨어져, 뒤로는 맨 주사위만 남았다
//   (시험: 30번 중 일곱 번째 판정 뒤로 나비가 한 번도 안 움직임). 여기서는 **마당(F.ph)이 바뀔 때마다** 그 몫을 새로 채운다.
//   파훼 나비는 선택지 화면 대신 피날레 화면 아래 단추로 — 누르면 다음에 실패할 판정을 한 번 넘긴다.
function finOn() { try { return !!(window.FINX && typeof window.FINX.on === 'function' && window.FINX.on()); } catch (e) { return false; } }
function finPhase() {
    const r = run();
    if (!r || !finOn()) return;
    const F = window.FINX.F && window.FINX.F();
    const ph = F && F.ph;
    if (!ph || r._bfPh === ph) return;
    const first = !r._bfPh;
    r._bfPh = ph;
    if (first) return;                                   // 들어올 때는 이미 새것
    r._bfUse = {}; r._bfLethe = 0;
    const me = u_();
    if (me && wears(me)) { try { const ref = pref('bfly/' + me.code + '/abs'); if (ref) ref.set(0); } catch (e) { } const p = party(); if (p && p.bfly && p.bfly[me.code]) p.bfly[me.code].abs = 0; }
    toast('🦋 나비들이 숨을 고른다 — 레테 · 무효 · 회피 · 파훼가 다시 차올랐다');
}
setInterval(function () { try { finPhase(); } catch (e) { } }, 1000);
(function finSmashBtn() {
    const ID = 'bfly-fin-smash';
    setInterval(function () {
        try {
            const old = document.getElementById(ID);
            const x = finOn() ? canUse('smash') : null;
            if (!x) { if (old) old.remove(); return; }
            const label = '🦋 ' + nickOf(x) + ' — 기믹을 부순다 (남은 ' + (x.lv - used('smash')) + ' · 다음 실패를 넘긴다)';
            if (old && old.isConnected) { if (old.textContent !== label) old.textContent = label; return; }
            const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
            if (!body || !body.querySelector('button')) return;
            const b = document.createElement('button');
            b.id = ID; b.className = 'game-btn';
            b.style.cssText = 'width:100%; margin:8px 0 0 0; padding:12px; font-size:12px; background:linear-gradient(145deg,#3a3a6a,#1c1c3a) !important; border-color:#9fb4ff !important; color:#fff !important;';
            b.textContent = label;
            b.onclick = window.bflySmash;
            body.appendChild(b);
        } catch (e) { }
    }, 1000);
})();

// ==========================================
// 『 K 의 방 』 — kroom-core.js 가 부른다
// ==========================================
window.BFLY = {
    wears: function () { return wears(u_()); },
    flyCount: flyCount,
    // 유리한 쪽 — 즉사 기믹이 아닌 것 가운데 DC 가 가장 낮은 것 (제 속성이면 3 낮게 본다)
    fav: function (vis, attr) {
        if (!wears(u_()) || !vis || !vis.length) return -1;
        let best = -1, bv = 1e9;
        vis.forEach(function (v) {
            if (v.o.doom) return;
            const d = (v.o.dc || 13) - (v.o.k === attr ? 3 : 0);
            if (d < bv) { bv = d; best = v.i; }
        });
        return best;
    },
    guessHtml: function () {
        const r = run(); if (!r) return '';
        r._bfKAns = rnd(1, 3); r._bfKOpen = true;
        const btn = function (i) { return '<button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:12px;" onclick="bflyKGuess(' + i + ')">' + i + '</button>'; };
        return '<div id="bfly-kpsy" style="margin:0 0 10px 0; padding:9px 10px; border:1px solid #5b4a7a; border-radius:6px; background:rgba(90,70,130,.12); font-size:11px; color:#d8c8ff;">'
            + '🦋 프시케의 유리 — 유리한 쪽을 골랐다. 숫자 하나를 짚는다 (맞히면 다음 기믹 DC −' + C.PSY_DC + ')'
            + '<div style="display:flex; gap:6px; margin-top:6px;">' + btn(1) + btn(2) + btn(3) + '</div></div>';
    },
    takePsy: function () { const r = run(); const n = (r && r._bfKDown) || 0; if (r) { r._bfKDown = 0; r._bfKOpen = false; } return n; },
    lethe: function () { return !!letheTake(); },
    smash: function () { if (!canUse('smash')) return null; const x = canUse('smash'); spend('smash'); return nickOf(x) + ' (' + used('smash') + '/' + x.lv + ')'; },
    evade: function () { if (!canUse('evade')) return null; const x = canUse('evade'); spend('evade'); return nickOf(x) + ' (' + used('evade') + '/' + x.lv + ')'; },
    dodge: function () { const me = u_(); if (breathDodgeLeft(me) <= 0) return null; const b = breathOf(me); b.dodged = (Number(b.dodged) || 0) + 1; me.bflyBreath = b; save({ bflyBreath: 1 }); return '에로스의 마지막 숨결'; },
    nul: function () { if (!canUse('nul')) return null; const x = canUse('nul'); spend('nul'); return nickOf(x) + ' (' + used('nul') + '/' + x.lv + ')'; },
    save: function () { return saveFromDeath('kroom'); },
    died: function () { outSoon(); },          // ⑦ 나비의 귀환 — K의 방이 쓰러짐 뒤에 부른다
    restHeal: function () { const h = usable('heal'); if (!h) return null; xpAdd('heal', 1); return { hp: h.lv * C.HEAL_HP, mind: h.lv * C.HEAL_MIND, nick: nickOf(h) }; },
    runXp: runXp,
    mult: function () { return multNow(); },
    // 🔗 영혼의 맹약을 맺은 장착자 — 쓰러져도 포인트는 잃지 않는다 (2026-10-27 · 죽음 자체는 그대로)
    pactKeep: function () { try { const me = u_(); return !!(me && wears(me) && myPact().length); } catch (e) { return false; } },
    bonus: function () { try { return bonusNow(); } catch (e) { return 0; } },   // gear-cap.js — 보정 상한에서 뺀다
    C: C
};
window.bflyKGuess = function (i) {
    const r = run(); if (!r || !r._bfKOpen) return;
    r._bfKOpen = false;
    const el = document.getElementById('bfly-kpsy');
    if (Number(i) === Number(r._bfKAns)) {
        r._bfKDown = C.PSY_DC;
        if (el) el.innerHTML = '<span style="color:#9fe6b0;">🦋 유리가 맑게 울린다 — 다음 기믹 DC −' + C.PSY_DC + '</span>';
    } else if (el) el.innerHTML = '<span style="color:#888;">🦋 유리에 금이 간다. 숫자는 ' + r._bfKAns + '이었다.</span>';
};

// ==========================================
// 물품 등록 · 장착 · 장터에서 빼기
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[NAME]) {
            ITEM_CATALOG[NAME] = {
                price: 0, usable: true, targetable: false, effect: 'equip_bfly', noSell: true,
                desc: '[장착] 영혼의 맹약 · 레테의 수의 · 프시케의 유리 · 모이라이의 실타래 · 나비의 장례식(다섯 마리 Lv 1~10) · 에로스의 마지막 숨결 · 나비의 귀환. '
                    + '장착칸의 [🦋 환영 나비] 로 부른다. 상담사 지급 전용.'
            };
        }
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(NAME) < 0) NO_SELL_ITEMS.push(NAME);
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._bfly) { clearInterval(iv); return; }
        const _m = marketSellable;
        const w = function () {
            const pool = _m.apply(this, arguments);
            if (pool && typeof pool.delete === 'function') { pool.delete(NAME); return pool; }
            return Array.isArray(pool) ? pool.filter(function (x) { return baseOf(x) !== NAME && x !== NAME; }) : pool;
        };
        w._bfly = true;
        marketSellable = w; window.marketSellable = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hookEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._bfly) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName !== NAME) return _u.apply(this, arguments);
            const me = u_();
            if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) { alert_('격리 중에는 장착할 수 없습니다.'); return; }
            if (!Array.isArray(me.equippedWeapons)) me.equippedWeapons = [];
            if (wears(me)) { alert_('이미 차고 있습니다.'); return; }
            if (typeof equipFull === 'function' && equipFull(me)) { alert_('장착 슬롯이 가득 찼습니다.'); return; }
            me.equippedWeapons.push(NAME);
            try { if (typeof setEquipOwner === 'function') setEquipOwner(me, NAME, me.code); } catch (e) { }
            try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(me, NAME, 1); } catch (e) { }
            wake(me); dayRoll(me);
            try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(me, '[장착됨] ' + NAME); } catch (e) { }
            selfNote(me);
            log_(me, '[' + NAME + '] 장착했습니다.');
            try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_(NAME + '\n\n육체에서 떨어져 나온 것들이 날개를 폅니다.\n'
                + KEYS.map(function (k) { return BY_K[k].icon + ' ' + BY_K[k].n + ' 나비 Lv.' + lvOf(me, k) + (st(me, k).gone ? ' (소멸 — 자정에 돌아온다)' : st(me, k).to ? ' (' + nameOf(st(me, k).to) + ' 사원 곁)' : ' — 내 곁 · 적용 중'); }).join('\n')
                + '\n\n사원증 특이사항에 「🦋 내 곁의 나비」 줄로 보입니다.\n장착칸의 [🦋 환영 나비] 로 부릅니다.');
        };
        w._bfly = true;
        useInventoryItem = w; try { window.useInventoryItem = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; max-height:50dvh; margin-bottom:9px;';
function shut() { Array.prototype.forEach.call(document.querySelectorAll('.' + MOD), function (x) { x.remove(); }); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.className = MOD;
    // ★ 탐사 화면(9999998) 위 · 알림창(99999999) 아래 — 창을 띄운 채 알림이 떠도 가려지지 않게
    w.style.cssText = 'position:fixed; inset:0; z-index:99999990; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:16px; box-sizing:border-box;';
    // 창 전체가 한 번에 내려간다 — 안쪽 칸만 50% 높이로 잘라 두면 작은 화면에서 아래 나비(무효)가 안 보였다
    w.innerHTML = '<div style="background:linear-gradient(160deg,#16131f,#0a0910); border:1px solid #8f7ccf; border-radius:12px; padding:14px; width:100%; max-width:420px; max-height:calc(100dvh - 32px); overflow-y:auto; -webkit-overflow-scrolling:touch; box-sizing:border-box; box-shadow:0 8px 30px rgba(0,0,0,0.7);">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:13px; color:#d8c8ff; font-weight:bold;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#857c9a; margin:4px 0 11px 0; line-height:1.7;">' + sub + '</div>' : '<div style="height:9px;"></div>');
}
function bar(u, k) {
    const s = st(u, k), lv = lvOf(u, k);
    const need = lv * C.XP_PER, xp = Number(s.xp) || 0;
    const pct = lv >= C.LV_MAX ? 100 : Math.round(xp / need * 100);
    return '<div style="height:3px; background:#2a2638; border-radius:2px; margin-top:4px; overflow:hidden;"><div style="height:100%; width:' + pct + '%; background:#a58cff;"></div></div>';
}

window.bflyMenu = function () {
    const me = u_();
    if (!me) return;
    if (!wears(me)) { alert_(NAME + ' 를 차고 있어야 합니다.'); return; }
    if (wake(me)) save({ bfly: 1 });
    dayRoll(me);
    selfNote(me);
    const rows = KINDS.map(function (x) {
        const s = st(me, x.k), lv = lvOf(me, x.k);
        const state = s.gone ? '<span style="color:#8a6a7a;">소멸 — 자정에 돌아온다</span>'
            : s.to ? '<span style="color:#8fd18f;">' + esc(nameOf(s.to)) + ' 사원 곁 · 적용 중</span>'
            : '<span style="color:#9fe6b0;">『 내 곁 』 적용 중</span>';
        return '<button class="game-btn bf-one" data-k="' + x.k + '" style="' + BTN + ' padding:9px 11px; margin-bottom:6px;' + (s.gone ? GREY : '') + '">'
            + '<div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px;">'
            + '<span><span style="color:#d8c8ff;">' + x.icon + '</span> ' + esc(s.nick || x.n + ' 나비') + ' <span style="font-size:10px; color:#a58cff;">Lv.' + lv + '</span>'
            + (lv < C.LV_MAX ? ' <span style="font-size:9px; color:#666;">' + (Number(s.xp) || 0) + '/' + (lv * C.XP_PER) + '</span>' : ' <span style="font-size:9px; color:#d4af37;">MAX</span>') + '</span>'
            + '<span style="font-size:9.5px; flex-shrink:0;">' + state + '</span></div>'
            + '<div style="font-size:9px; color:#6b6480; margin-top:3px; white-space:normal;">' + esc(x.d(lv)) + '</div>' + bar(me, x.k) + '</button>';
    }).join('');
    const p = (typeof getMyParty === 'function') ? getMyParty() : null;
    const r = run();
    const info = '<div style="font-size:10.5px; color:#bbb; line-height:1.8; padding:8px 10px; border:1px solid #2e2840; border-radius:6px; margin-bottom:9px;">'
        + '⏳ 모이라이의 실타래 — 오늘 남은 유예 <b style="color:#d9c27a;">' + moiraLeft(me) + ' / ' + C.MOIRA + '</b><br>'
        + '🕊 나비의 귀환 — 쓰러져 상담실 · 선녀탕으로 가면 바로 꺼낸다 · 오늘 남은 <b style="color:#c9b8ff;">' + outLeft(me) + ' / ' + C.OUT + '</b><br>'
        + '🌫 레테의 수의 — 탐사당 ' + C.LETHE + '번' + ' · 장착자 본인만' + (r ? ' (이번 탐사 남은 ' + letheLeft() + ')' : '') + '<br>'
        + '💋 에로스의 마지막 숨결 — 오늘 남은 <b style="color:#ffb3c7;">' + (C.EROS - erosUsed(me)) + ' / ' + C.EROS + '</b>'
        + (breathN(me) ? '<br><span style="color:#ffb3c7;">　└ 오늘 내게 걸린 숨결 ' + breathN(me) + '번 — 굴림 +' + C.EROS_ROLL + ' · 회수품 ×' + C.EROS_LOOT + ' · 성공 정산 ×' + C.EROS_PTS + ' · 즉사 회피 남은 ' + breathDodgeLeft(me) + '</span>' : '') + '<br>'
        + '🔗 영혼의 맹약 — ' + (p ? (myPact().length ? myPact().map(nameOf).map(esc).join(', ') : '아직 없음') : '방에 있을 때 맺는다') + '</div>';
    const w = box(head('🦋 환영 나비', '육체와 영혼을 가른 것들. 나비를 눌러 내 곁이나 사원 곁에 두고, 이름을 짓습니다.')
        + rows + info
        + '<button id="bf-pact" class="game-btn" style="' + BTN + ' text-align:center;"' + (p ? '' : ' disabled') + '>🔗 영혼의 맹약' + (p ? '' : ' — 방에 들어가 있어야 합니다') + '</button>'
        + '<button id="bf-eros" class="game-btn" style="' + BTN + ' text-align:center;">💋 에로스의 마지막 숨결</button>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">닫는다</button>');
    w.querySelector('#bf-x').onclick = shut;
    w.querySelector('#bf-pact').onclick = window.bflyPactPick;
    w.querySelector('#bf-eros').onclick = window.bflyErosPick;
    Array.prototype.forEach.call(w.querySelectorAll('.bf-one'), function (b) { b.onclick = function () { one(b.dataset.k); }; });
};

function one(k) {
    const me = u_();
    const s = st(me, k), x = BY_K[k];
    if (s.gone) { alert_(x.n + ' 나비는 소멸했습니다.\n\n자정이 지나면 돌아옵니다. 레벨은 그대로입니다.'); return; }
    const where = s.to ? '지금 <b style="color:#8fd18f;">' + esc(nameOf(s.to)) + ' 사원 곁</b>에서 적용 중입니다.' : '지금 <b style="color:#9fe6b0;">당신 곁</b>에서 적용 중입니다.';
    const w = box(head(x.icon + ' ' + (s.nick || x.n + ' 나비') + ' · Lv.' + lvOf(me, k), esc(x.d(lvOf(me, k))) + '<br>' + where)
        + '<button id="bf-self" class="game-btn" style="' + BTN + ' text-align:center;' + (s.to ? '' : ' border-color:#5fae7a !important;') + '">🦋 내 곁에 둔다' + (s.to ? ' — 거둬 온다' : '') + '</button>'
        + '<button id="bf-send" class="game-btn" style="' + BTN + ' text-align:center;">사원 곁에 둔다' + (s.to ? ' — 다른 사원으로' : '') + '</button>'
        + '<button id="bf-nick" class="game-btn" style="' + BTN + ' text-align:center;">이름을 짓는다</button>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#bf-x').onclick = window.bflyMenu;
    w.querySelector('#bf-nick').onclick = function () { nickAsk(k); };
    w.querySelector('#bf-send').onclick = function () { pickWho(k); };
    w.querySelector('#bf-self').onclick = function () { keepSelf(k); };
}
// 장착자 본인에게 — 눌러서 내 곁에 앉히고, 앉았다는 것을 알림 · 뱃지 줄로 보인다
function keepSelf(k) {
    const me = u_(), s = st(me, k), x = BY_K[k];
    if (!me || !wears(me)) return;
    if (s.gone) { alert_(x.n + ' 나비는 소멸했습니다.\n\n자정이 지나면 돌아옵니다.'); return; }
    const nick = s.nick || x.n + ' 나비';
    const was = s.to ? nameOf(s.to) : null;
    if (s.to) detach(me.code, k);
    selfNote(me);
    if (was) log_(me, '[' + NAME + '] ' + nick + josa(nick, '이', '가') + ' ' + was + ' 사원 곁에서 돌아왔습니다.');
    save({ bfly: 1, history: 1 });
    shut();
    toast('🦋 ' + nick + ' — 내 곁 · 적용 중');
    alert_('🦋 ' + nick + josa(nick, '이', '가') + (was ? ' ' + was + ' 사원 곁에서 돌아와' : '') + ' 당신 곁에 내려앉았습니다.\n\n'
        + '지금 적용 중 — ' + x.d(lvOf(me, k)) + '\n\n'
        + '사원증 특이사항: ' + selfLine(me));
}
function nickAsk(k) {
    const me = u_(), s = st(me, k), x = BY_K[k];
    const w = box(head(x.n + ' 나비의 이름', C.NICK_MAX + '자까지. 비우면 이름을 지웁니다.')
        + '<input id="bf-in" type="text" maxlength="' + C.NICK_MAX + '" value="' + esc(s.nick || '') + '" placeholder="' + esc(x.n) + ' 나비" style="width:100%; padding:10px; font-size:13px; margin-bottom:9px; box-sizing:border-box;">'
        + '<button id="bf-ok" class="game-btn" style="' + BTN + ' text-align:center;">짓는다</button>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    const f = w.querySelector('#bf-in');
    const go = function () {
        const v = String(f.value || '').trim().slice(0, C.NICK_MAX);
        patch(me.code, k, { nick: v || null });
        if (s.to) onPatch(s.to, k, { by: me.code, byName: me.name, nick: v || '', lv: lvOf(me, k) });
        save({ bfly: 1 });
        one(k);
    };
    w.querySelector('#bf-ok').onclick = go;
    w.querySelector('#bf-x').onclick = function () { one(k); };
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}
function pickWho(k) {
    const me = u_();
    const cur = st(me, k).to || null;
    const list = users().filter(function (x) { return x.code !== me.code; });
    const rows = list.map(function (t) {
        const here = (t.code === cur);
        const on = !here && t.bflyOn && t.bflyOn[k];
        return '<button class="game-btn bf-who" data-c="' + esc(t.code) + '"' + (on || here ? ' disabled' : '') + ' style="' + BTN + (on || here ? GREY : '') + '">'
            + esc(t.name) + ' <span style="font-size:9px; color:#777;">사번 ' + esc(t.no || '-') + '</span>'
            + (here ? '<div style="font-size:9px; color:#8fd18f; margin-top:2px;">지금 이 사원 곁에 있습니다</div>'
               : on ? '<div style="font-size:9px; color:#a07070; margin-top:2px;">이미 같은 나비가 곁에 있습니다</div>' : '') + '</button>';
    }).join('');
    const selfRow = '<button class="game-btn" id="bf-me" style="' + BTN + ' border-color:#5fae7a !important;">🦋 본인 — 내 곁에 둔다'
        + (cur ? '' : '<div style="font-size:9px; color:#9fe6b0; margin-top:2px;">지금 당신 곁에서 적용 중입니다</div>') + '</button>';
    const w = box(head(BY_K[k].n + ' 나비를 둘 사람', '그 사람이 죽을 자리에서 이 나비가 대신 소멸할 수 있습니다.')
        + selfRow + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#bf-x').onclick = function () { one(k); };
    Array.prototype.forEach.call(w.querySelectorAll('.bf-who'), function (b) { b.onclick = function () { sendTo(k, b.dataset.c); }; });
    w.querySelector('#bf-me').onclick = function () { keepSelf(k); };
}
function sendTo(k, code) {
    const me = u_(), t = userOf(code);
    if (!me || !t) return;
    const s = st(me, k);
    if (s.gone) { alert_('소멸한 나비는 보낼 수 없습니다.'); return; }
    const nick = s.nick || BY_K[k].n + ' 나비';
    if (code === me.code) { keepSelf(k); return; }
    if (s.to === code) { alert_(nick + josa(nick, '은', '는') + ' 이미 ' + t.name + ' 사원 곁에 있습니다.'); return; }
    if (s.to) detach(me.code, k, true);                 // 다른 사원 곁에 있던 것 — 그 사원 뱃지 줄을 걷고 옮긴다
    patch(me.code, k, { to: code, toName: t.name });
    onPatch(code, k, { by: me.code, byName: me.name, nick: nick, lv: lvOf(me, k) });
    try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(t, noteLine(k)); } catch (e) { }
    log_(t, '[' + NAME + '] ' + me.name + ' 사원의 ' + nick + josa(nick, '이', '가') + ' 곁을 맴돕니다.');
    log_(me, '[' + NAME + '] ' + nick + ' → ' + t.name + ' 사원');
    t.hasItemUsedOnMe = true;
    try { updateUserFields(code, { badge: t.badge, history: t.history, hasItemUsedOnMe: true }); } catch (e) { }
    save({ bfly: 1, history: 1 });
    selfNote(me);
    shut();
    alert_(nick + josa(nick, '이', '가') + ' ' + t.name + ' 사원 곁으로 날아갔습니다.\n\n그 사원에게 적용 중 — ' + BY_K[k].d(lvOf(me, k)));
}

window.bflyPactPick = function () {
    const me = u_();
    const p = (typeof getMyParty === 'function') ? getMyParty() : party();
    if (!me || !p) { alert_('방에 들어가 있어야 맹약을 맺을 수 있습니다.'); return; }
    const mates = Object.keys(p.members || {}).filter(function (c) { return c !== me.code; });
    if (!mates.length) { alert_('같은 방에 맹약을 맺을 사원이 없습니다.'); return; }
    const cur = (p.bfly && p.bfly[me.code] && p.bfly[me.code].pact) || {};
    const rows = mates.map(function (c) {
        return '<label style="display:flex; gap:9px; align-items:center; padding:9px 10px; border:1px solid #2e2840; border-radius:7px; margin-bottom:6px; background:rgba(40,34,58,0.5);">'
            + '<input type="checkbox" class="bf-pc" value="' + esc(c) + '"' + (cur[c] ? ' checked' : '') + ' style="width:17px; height:17px;">'
            + '<div style="font-size:12px; color:#e6ddf0;">' + esc(nameOf(c)) + '</div></label>';
    }).join('');
    const w = box(head('🔗 영혼의 맹약', '셋까지. 맹약 대상 굴림 +' + C.PACT_THEM + ' · 당신 굴림 +' + C.PACT_ME + ' × 맹약 수.<br>맹약 대상의 눈이 9 이하면 실이 당겨 +' + C.PACT_LIFT + ' (탐사당 ' + C.PACT_ABS + '번) — 그만큼 당신의 다음 굴림 −' + C.PACT_DEBT + '.<br>맹약을 맺고 살아 나오면 정산 ×1.5~2.')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="bf-ok" class="game-btn" style="' + BTN + ' text-align:center;">맺는다</button>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#bf-x').onclick = window.bflyMenu;
    w.querySelector('#bf-ok').onclick = function () {
        const picked = {};
        const boxes = w.querySelectorAll('.bf-pc:checked');
        if (boxes.length > C.PACT_MAX) { alert_('맹약은 ' + C.PACT_MAX + '명까지입니다.'); return; }
        Array.prototype.forEach.call(boxes, function (b) { picked[b.value] = 1; });
        const d = db_();
        p.bfly = p.bfly || {}; p.bfly[me.code] = p.bfly[me.code] || {};
        p.bfly[me.code].pact = picked;
        if (d) { try { d.ref('darkParties/' + p.id + '/bfly/' + me.code + '/pact').set(Object.keys(picked).length ? picked : null); } catch (e) { } }
        Object.keys(picked).forEach(function (c) { const t = userOf(c); if (t) log_(t, '[' + NAME + '] ' + me.name + ' 사원과 영혼의 맹약을 맺었습니다.'); });
        try { if (typeof sendPartyChat === 'function' && Object.keys(picked).length) sendPartyChat('🔗 ' + me.name + ' 사원이 ' + Object.keys(picked).map(nameOf).join(', ') + ' 사원과 영혼의 맹약을 맺었습니다.', true); } catch (e) { }
        shut();
        alert_(Object.keys(picked).length ? '영혼의 맹약을 맺었습니다.\n\n' + Object.keys(picked).map(nameOf).join(', ') : '맹약을 풀었습니다.');
    };
};

window.bflyErosPick = function () {
    const me = u_();
    if (!me) return;
    const left = C.EROS - erosUsed(me);
    if (left <= 0) { alert_('오늘의 숨결은 다 썼습니다. (하루 ' + C.EROS + '번)'); return; }
    const list = [me].concat(users().filter(function (x) { return x.code !== me.code; }));
    const rows = list.map(function (t) {
        const n = breathN(t);
        return '<button class="game-btn bf-er" data-c="' + esc(t.code) + '" style="' + BTN + '">' + (t === me ? '본인' : esc(t.name))
            + (n ? ' <span style="font-size:9px; color:#ffb3c7;">오늘 숨결 ' + n + '번' + (n === 1 ? ' — 한 번 더면 5시간 동결 · 어둠 · K의 방 횟수 충전' : '') + '</span>' : '') + '</button>';
    }).join('');
    const w = box(head('💋 에로스의 마지막 숨결', '오늘 남은 숨결 ' + left + '번. 맞은 날 하루 — 굴림 +' + C.EROS_ROLL + ' · 회수품 ×' + C.EROS_LOOT + ' · 성공 정산 ×' + C.EROS_PTS + ' · 즉사 한 번 회피.<br>한 사람이 두 번 다 맞으면 포만감·오염도 ' + C.EROS_HOURS + '시간 동결, 어둠 탐사 · K의 방 횟수가 다시 찹니다 (한 사람에 하루 한 번).')
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="bf-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">돌아간다</button>');
    w.querySelector('#bf-x').onclick = window.bflyMenu;
    Array.prototype.forEach.call(w.querySelectorAll('.bf-er'), function (b) { b.onclick = function () { window.bflyBreathe(b.dataset.c); }; });
};

// ==========================================
// ★ 방 — 나비가 빈자리를 채운다 (2026-10-25 · 🐾 아기 여우 분신과 같은 길)
// ==========================================
//   최소 인원이 둘 이상인 구역에 혼자(또는 모자라게) 방을 잡아도, 방 사람들 곁의 나비 수만큼
//   최소 인원을 낮춰 출발할 수 있다 (1인까지).
//     · 센다 — 방 사람이 차고 있는 나비(소멸 안 한 것) 가운데 그 사람 곁이나 다른 방 사람 곁에 있는 것,
//              그리고 방 밖의 장착자가 방 사람 곁에 둔 나비. 한 마리는 한 번만 센다.
//     · 가짜 사원을 방에 넣지 않는다 — 방 화면을 그리는 동안과 출발 단추를 누른 순간에만
//       z.min 을 낮췄다가 바로 되돌린다 (babyfox.js 와 같은 방식 · 둘이 겹치면 둘 다 뺀다).
//     · 나비는 사람 수에 안 들어간다 — 보상 · 난이도는 그대로 사람 수로 센다.
function goneOf(u, k) {
    const s = (u && u.bfly && u.bfly[k]) || {};
    return (u && u.bflyDay === today()) ? !!s.gone : false;       // 날이 바뀌었으면 자정에 돌아온 것
}
function seatFlies(p) {
    const out = [], seen = {};
    if (!p || !p.members) return out;
    const mem = Object.keys(p.members);
    const add = function (owner, k, at) {
        const id = owner + ':' + k;
        if (seen[id]) return;
        seen[id] = 1;
        out.push({ owner: owner, k: k, at: at });
    };
    mem.forEach(function (c) {
        const u = userOf(c);
        if (!u) return;
        if (wears(u)) {
            const f = (u.bfly && typeof u.bfly === 'object') ? u.bfly : {};
            KEYS.forEach(function (k) {
                const s = f[k] || {};
                if (!s.lv || goneOf(u, k)) return;
                if (!s.to || mem.indexOf(s.to) >= 0) add(c, k, s.to || c);
            });
        }
        const on = (u.bflyOn && typeof u.bflyOn === 'object') ? u.bflyOn : {};
        Object.keys(on).forEach(function (k) {
            const by = on[k] && on[k].by;
            if (!by || !BY_K[k] || mem.indexOf(by) >= 0) return;            // 방 사람 것은 위에서 셌다
            const o = userOf(by);
            if (!o || !wears(o)) return;
            const s = (o.bfly && o.bfly[k]) || {};
            if (s.to === c && s.lv && !goneOf(o, k)) add(by, k, c);
        });
    });
    return out;
}
function seatBox(min0, low, list) {
    const rows = list.map(function (x) {
        const o = userOf(x.owner), s = (o && o.bfly && o.bfly[x.k]) || {};
        return '<div style="font-size:11px; color:#e6ddf0; padding:3px 0;"><span style="color:#d8c8ff;">' + BY_K[x.k].icon + '</span> '
            + esc(s.nick || BY_K[x.k].n + ' 나비') + ' <span style="font-size:9.5px; color:#a58cff;">Lv.' + (Number(s.lv) || 1) + '</span>'
            + ' <span style="font-size:9px; color:#857c9a;">— ' + esc(nameOf(x.at)) + ' 곁' + (x.owner !== x.at ? ' (' + esc(nameOf(x.owner)) + ' 사원의 나비)' : '') + '</span></div>';
    }).join('');
    return '<div id="bfly-room-box" style="background:rgba(90,70,130,0.10); border:1px solid #5b4a7a; border-radius:6px; padding:11px; margin:12px 0;">'
        + '<div style="font-size:11px; color:#c9b8ff; font-weight:bold; margin-bottom:5px;">🦋 빈자리를 채우는 나비 ' + list.length + '마리</div>'
        + rows
        + '<div style="font-size:9.5px; color:#857c9a; margin-top:6px; border-top:1px solid #2e2840; padding-top:6px; line-height:1.6;">'
        + (min0 > low ? '최소 인원 <b style="color:#c9b8ff;">' + min0 + '인 → ' + low + '인</b> — 나비가 빈자리를 채웁니다.'
                      : '최소 인원이 이미 ' + min0 + '인이라 더 낮출 것이 없습니다.')
        + '<br>나비는 사람 수에는 안 들어갑니다 (보상 · 난이도는 사람 수로 셉니다).</div></div>';
}
let seatDraw = null;           // 방 화면을 그리는 동안 { min0, low, list }
(function hookSeatChat() {
    const iv = setInterval(function () {
        if (typeof buildChatHtml !== 'function') return;
        if (buildChatHtml._bfly) { clearInterval(iv); return; }
        const _b = buildChatHtml;
        const w = function () {
            const out = _b.apply(this, arguments);
            if (!seatDraw) return out;
            try { return seatBox(seatDraw.min0, seatDraw.low, seatDraw.list) + out; } catch (e) { return out; }
        };
        w._bfly = true;
        buildChatHtml = w; window.buildChatHtml = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookSeatRoom() {
    const iv = setInterval(function () {
        if (typeof renderPartyRoom !== 'function') return;
        if (renderPartyRoom._bfly) { clearInterval(iv); return; }
        const _r = renderPartyRoom;
        const w = function (p, body) {
            let z = null, min0 = null, list = [];
            try {
                if (p && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                    z = DARK_ZONES[p.zone];
                    list = seatFlies(p);
                    min0 = z.min;
                    if (list.length) z.min = Math.max(1, min0 - list.length);   // ★ canStart 가 이 값을 본다 → 진입 단추가 열린다
                }
            } catch (e) { }
            const prev = seatDraw;
            if (list.length) seatDraw = { min0: min0, low: z.min, list: list };
            try { return _r.apply(this, arguments); }
            finally {
                seatDraw = prev;
                if (z && min0 != null) z.min = min0;
            }
        };
        w._bfly = true;
        renderPartyRoom = w; window.renderPartyRoom = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookSeatLaunch() {
    const iv = setInterval(function () {
        if (typeof launchParty !== 'function') return;
        if (launchParty._bfly) { clearInterval(iv); return; }
        const _l = launchParty;
        const w = function () {
            let z = null, min0 = null;
            try {
                const me = u_(), p = (typeof getMyParty === 'function') ? getMyParty() : null;
                if (me && p && p.leader === me.code && typeof DARK_ZONES !== 'undefined' && DARK_ZONES[p.zone]) {
                    const n = seatFlies(p).length;                       // 방 화면이 보여 준 것과 같은 수
                    if (n > 0) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = Math.max(1, min0 - n); }
                }
            } catch (e) { }
            try { return _l.apply(this, arguments); }
            finally { if (z && min0 != null) z.min = min0; }
        };
        w._bfly = true;
        launchParty = w; window.launchParty = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
window.bflySeats = function () { const p = (typeof getMyParty === 'function') ? getMyParty() : null; return seatFlies(p).map(function (x) { return BY_K[x.k].n + '(' + nameOf(x.owner) + ' → ' + nameOf(x.at) + ')'; }); };

// 장착칸의 [🦋 환영 나비] 단추 · 탐사 화면 위 🦋
(function badgeBtn() {
    const ID = 'bfly-list-btn';
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
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0; background:linear-gradient(145deg,#5a4a8a,#2a2244) !important; border-color:#a58cff !important;';
        b.textContent = '🦋 환영 나비';
        b.onclick = window.bflyMenu;
        row.appendChild(b);
    }
    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._bflyBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () { const r = _r.apply(this, arguments); try { stick(); } catch (e) { } return r; };
            renderInventory._bflyBtn = true;
            clearInterval(iv);
        }, 400);
        setTimeout(function () { clearInterval(iv); }, 40000);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
    // 탐사 화면 위쪽 — 🦋 (맹약 · 숨결 · 남은 횟수)
    setInterval(function () {
        try {
            const ov = document.getElementById('dark-run-overlay');
            const old = document.getElementById('bfly-run-btn');
            if (!ov || ov.style.display === 'none' || !wears(u_())) { if (old) old.remove(); return; }
            if (old) return;
            const mute = document.getElementById('dark-mute-btn');
            if (!mute) return;
            const b = document.createElement('button');
            b.id = 'bfly-run-btn';
            b.style.cssText = 'background:none; border:1px solid #4a3f6a; color:#c9b8ff; font-size:12px; padding:4px 8px; border-radius:4px; cursor:pointer;';
            b.innerText = '🦋';
            b.onclick = window.bflyMenu;
            mute.parentNode.insertBefore(b, mute);
        } catch (e) { }
    }, 1300);
})();

// ==========================================
// 콘솔
// ==========================================
window.bflyGive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who);
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    if (!Array.isArray(t.inventory)) t.inventory = [];
    t.inventory.push(NAME);
    log_(t, '[당국 개입] ' + NAME + ' 지급');
    try { updateUserFields(t.code, { inventory: t.inventory, history: t.history }); } catch (e) { }
    console.log('%c✓ ' + t.name + ' 사원에게 ' + NAME + ' 를 줬습니다.', 'color:#a58cff');
};
window.bflyRevive = function (who) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who); if (!t) return;
    KEYS.forEach(function (k) { patch(t.code, k, { gone: 0 }); });
    console.log('✓ ' + t.name + ' — 다섯 마리를 되살렸습니다.');
};
window.bflyLevel = function (who, k, lv) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const t = find(who); if (!t || !BY_K[k]) { console.warn('사원이나 나비 이름(judge·heal·evade·smash·nul)을 확인하세요.'); return; }
    patch(t.code, k, { lv: Math.max(1, Math.min(C.LV_MAX, Number(lv) || 1)), xp: 0 });
    console.log('✓ ' + t.name + ' — ' + BY_K[k].n + ' 나비 Lv.' + lvOf(t, k));
};
window.bflyState = function (who) {
    const t = find(who) || u_();
    if (!t) return;
    console.log('%c===== 🦋 환영 나비 — ' + t.name + ' =====', 'color:#a58cff');
    console.log('  차고 있음:', wears(t) ? 'O' : '✗', '· 오늘 유예', moiraUsed(t) + '/' + C.MOIRA, '· 오늘 숨결', erosUsed(t) + '/' + C.EROS, '· 맞은 숨결', breathN(t));
    console.table(KEYS.map(function (k) { const s = st(t, k); return { 나비: BY_K[k].n, Lv: lvOf(t, k), 경험: (Number(s.xp) || 0) + '/' + (lvOf(t, k) * C.XP_PER), 소멸: s.gone ? 'O' : '', 곁: s.to ? nameOf(s.to) : '', 이름: s.nick || '' }; }));
    const r = run();
    if (r) console.log('  이번 탐사 — 회피', used('evade'), '· 파훼', used('smash'), '· 무효', used('nul'), '· 유예', r._bfMoira || 0, '· 맹약', myPact().map(nameOf).join(','), '· 굴림 보정 +' + bonusNow());
};
window.bflyHelp = function () {
    console.log('%c🦋 환영 나비', 'color:#a58cff; font-size:13px');
    KINDS.forEach(function (x) { console.log('  ' + x.icon + ' ' + x.n + ' — ' + x.d('Lv')); });
    console.log('  bflyGive(사번) · bflyState(사번) · bflyRevive(사번) · bflyLevel(사번, 나비, Lv)');
};

console.log('[환영 나비] ' + NAME + ' 연결 — 상담사 지급 전용');
})();
