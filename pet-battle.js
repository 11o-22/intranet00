// ==========================================
// ★ 펫 배틀 — 결투 신청 · 판돈 · 룬 먹이기 · 턴제 공방 · 정산 · 가두리 (2026-10-27)
// bundles.json 마지막 묶음 — pet-rune.js · pet-adopt.js · gaduri.js 보다 뒤
// ==========================================
//
// ■ 흐름
//
//   ① 신청   사원 열람(사원 목록 → 사원 하나)에서 [⚔ 펫 결투 신청] → 「~ 사원의 펫에게 결투를 신청합니다.」
//            → 내 펫 하나 고르기 → 내가 걸 것 고르기 → 보낸다                       (stage ask)
//   ② 받기   상대에게 창이 뜬다 — 내 펫 · 내가 건 것이 보인다. 상대도 펫 하나와 걸 것을 고르고 받는다 (stage stake)
//            거절하면 끝.
//   ③ 확인   신청한 쪽이 상대 펫 · 상대가 건 것을 보고 「이대로 붙는다」                 (stage prep)
//            — 양쪽이 서로 원하는 것을 걸어야 붙는다. 종류가 달라도 된다 (먹이 ↔ 룬 같이).
//   ④ 준비   각자 제 펫에게 룬을 먹인다 (두 개까지 · pet-rune.js). 상대는 내가 무엇을 먹였는지 모른다.
//            「준비됐다」를 둘 다 누르면 시작.                                             (stage fight)
//   ⑤ 공방   한 판마다 **공격 하나 · 방어 하나**를 같이 고른다 (포켓몬처럼 턴제).
//              공격 — 먹인 룬 가운데 하나, 또는 그 동물의 스킬 (pet-trait.js)
//              방어 — 먹인 룬 가운데 하나, 또는 그냥 버틴다
//            둘 다 고르면 그 판이 풀린다. 먼저 치는 쪽은 판마다 번갈아 간다.
//              막히나 — 내 방어 룬이 상대 공격의 속성을 **이기면** 막는다 (애교 › 근력 › 경청 › 인내 › 눈치 › 애교).
//                       스킬에도 숨은 속성이 하나 있어 같은 식으로 막는다.
//              막아도 원래 피해의 1/3 은 받는다. 못 막으면 그대로. 「방어 실패」라고는 띄우지 않는다.
//              상대가 **무슨 속성으로 쳤는지는 안 보인다** — 피해만 보인다.
//            다치는 것은 펫이 아니라 **주인**이다. 주인 체력 100 이 먼저 닳는 쪽이 진다.
//   ⑥ 정산   이긴 쪽이 진 쪽이 건 것을 가져간다. 진 쪽은 **가두리에 한 시간** (gaduri.js · by 'petbt'). 펫은 멀쩡하다.
//            양쪽 펫에 먹였던 룬은 소모된다.
//
//   판에서 3분 넘게 고르지 않으면 상대가 「기권 처리」할 수 있다 — 자리를 비운 쪽이 진 것으로 친다.
//   신청 · 확인 · 준비 단계에서 10분이 지나면 저절로 없던 일이 된다.
//
// ■ 피해
//   룬 공격 18~26 · 스킬 26~34 · 막으면 올림(1/3)
//
// ■ 걸 수 있는 것 — 펫에 관한 것만
//   먹이(u.petFood) · 돌봄 물품(u.petBag) · 펫 장비(소지품의 집 지킴이 방석 · 🐾 펫 이름 개명권) · 룬(u.petRune)
//
// ■ 적히는 자리
//   petBattle/<열쇠> = { at, stage, a:{code,name,pet,stake:{k,n},ready,runes,hp}, b:{…},
//                        round, first, roundAt, pick:{a:{atk,def}, b:{…}}, log:[…], winner, why, endAt, settled:{사번:1} }
//       stage  ask 받기 기다림 · stake 신청한 쪽 확인 기다림 · prep 룬 먹이는 중 · fight 공방 · done 끝 · no 없던 일
//       a 는 신청한 쪽 · b 는 받은 쪽
//   gaduri/<방>/<사번> = { by:'petbt', until, … }   진 쪽 15분
//
// ■ 콘솔
//   petBattleState()   걸려 있는 배틀
//   petBattleClear()   상담사 — 묵은 글 치우기

(function petBattle() {

const NODE = 'petBattle';
const HP = 100;
const DMG = { rune: [18, 26], skill: [26, 34] };
const BLOCK_DIV = 3;
const PICK_WAIT = 3 * 60 * 1000;         // 이보다 오래 안 고르면 기권 처리할 수 있다
const STAGE_WAIT = 10 * 60 * 1000;       // 신청 · 확인 · 준비는 이만큼
const FIGHT_WAIT = 30 * 60 * 1000;       // 공방 중 둘 다 이만큼 안 고르면 없던 일
const CAGE_MS = 60 * 60 * 1000;          // ★ 한 시간 (2026-10-31 사용자 · 전에는 15분)
const LIVE = 48 * 3600 * 1000;           // 이보다 묵은 글은 치운다
const SETTLE_LIVE = 24 * 3600 * 1000;    // 늦게 들어와도 이 안이면 정산한다
const MOD = 'pet-battle-modal';
const TICKET = '🐾 펫 이름 개명권';
const ADMIN = 'kario0987';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function R() { return window.PETRUNE; }
function T() { return window.PETTRAIT; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function userOf(code) { return users()[code] || null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t); }
function log_(t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { } }
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }
function now() { try { return P().now(); } catch (e) { return Date.now(); } }
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function ready() { return !!(window.PET && window.PETRUNE && window.PETTRAIT); }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }
function nickOf(u, key) { try { return P().nick(key, u); } catch (e) { return (P().BY[key] || {}).n || '펫'; } }
function speciesOf(key) { return (P().BY[key] || {}).n || ''; }
function skillOf(key) { return T().skill(key) || { n: '몸통 박치기', t: '근력' }; }
function tagR(n) { return R().tag(n); }

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';
const RED = ' background:linear-gradient(145deg,#6a2a2a,#3a1818) !important; border-color:#a04a4a !important;';
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
// ★ 광장에 있을 때는 창을 **아래쪽에 낮게** 두고 뒤를 옅게 가린다 — 위쪽 광장에서 주인 옆의 펫이 치고 받는 것이 보이게 (pet-arena.js · 2026-10-28)
function inPlaza() { return !!document.getElementById('plaza-ov'); }
function box(html, noOut) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    const low = inPlaza();
    w.style.cssText = 'position:fixed; inset:0; z-index:999997; display:flex; align-items:' + (low ? 'flex-end' : 'center') + '; justify-content:center; background:rgba(0,0,0,' + (low ? '0.18' : '0.86') + '); padding:' + (low ? '0 8px calc(8px + env(safe-area-inset-bottom)) 8px' : '14px') + ';';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09); border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:' + (low ? '58dvh' : '88dvh') + '; overflow-y:auto; -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">' + html + '</div>';
    if (!noOut) w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">' + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#6f685e; margin-bottom:11px; line-height:1.6;">' + sub + '</div>' : '');
}
function petCard(u, key, label) {
    if (!key) return '<div style="flex:1; text-align:center; font-size:10px; color:#6f685e; padding:12px 0;">' + esc(label || '') + '<br>아직 고르지 않았다</div>';
    const sk = skillOf(key);
    return '<div style="flex:1; min-width:0; text-align:center;">'
        + '<div style="font-size:9.5px; color:#8d8578; margin-bottom:3px;">' + esc(label || '') + '</div>'
        + '<img src="' + P().icon(key) + '" alt="" style="width:46px; height:46px; object-fit:contain; image-rendering:pixelated;">'
        + '<div style="font-size:11px; color:#e8d7b4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(nickOf(u, key)) + '</div>'
        + '<div style="font-size:9px; color:#6f685e;">' + esc(speciesOf(key)) + ' · ' + esc(sk.n) + '</div>'
        + '</div>';
}
function stakeText(s) {
    if (!s || !s.n) return '<span style="color:#6f685e;">없음</span>';
    const kindName = { food: '먹이', care: '돌봄 물품', gear: '펫 장비', rune: '룬' }[s.k] || '';
    return esc(s.k === 'rune' ? tagR(s.n) + ' 룬' : s.n) + (kindName ? ' <span style="color:#6f685e;">(' + kindName + ')</span>' : '');
}
function hpBar(label, hp, mine) {
    const v = Math.max(0, Math.min(HP, Number(hp) || 0));
    return '<div style="margin-bottom:5px;"><div style="display:flex; justify-content:space-between; font-size:10px; color:' + (mine ? '#ffcf8f' : '#c9b8ff') + ';"><span>' + esc(label) + '</span><span>' + v + ' / ' + HP + '</span></div>'
        + '<div style="height:9px; background:#241f18; border:1px solid #3a3025; border-radius:5px; overflow:hidden;"><div style="height:100%; width:' + Math.round(v / HP * 100) + '%; background:' + (v > 40 ? 'linear-gradient(90deg,#4caf50,#9fe6b0)' : 'linear-gradient(90deg,#c62828,#ff8a80)') + '; transition:width .3s;"></div></div></div>';
}

// ==========================================
// 내 펫 · 걸 수 있는 것
// ==========================================
function myPets(u) {
    u = u || u_();
    if (!u) return [];
    const ps = P().pets(u);
    const t = now();
    return Object.keys(ps).filter(function (k) {
        const s = ps[k];
        if (!s || !P().BY[k]) return false;
        if (s.out && s.out.till && s.out.till > t) return false;      // 탐사 중
        if (s['with']) return false;                                   // 동행 중
        return true;
    }).sort(function (a, b) { return Number(a) - Number(b); });
}
function isGear(n) {
    if (n === TICKET) return true;
    try { return !!(typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[n] && ITEM_CATALOG[n].effect === 'pet_stay'); } catch (e) { return false; }
}
// [{ k, n, c }]
function myStakes(u) {
    u = u || u_();
    if (!u) return [];
    const out = [];
    try { const b = (window.PETFOOD && PETFOOD.bag(u)) || {}; Object.keys(b).forEach(function (n) { if (Number(b[n]) > 0) out.push({ k: 'food', n: n, c: Number(b[n]) }); }); } catch (e) { }
    try { const b = P().bag(u) || {}; Object.keys(b).forEach(function (n) { if (Number(b[n]) > 0) out.push({ k: 'care', n: n, c: Number(b[n]) }); }); } catch (e) { }
    try {
        const cnt = {};
        (u.inventory || []).forEach(function (n) { if (isGear(n)) cnt[n] = (cnt[n] || 0) + 1; });
        Object.keys(cnt).forEach(function (n) { out.push({ k: 'gear', n: n, c: cnt[n] }); });
    } catch (e) { }
    try { const b = R().bag(u) || {}; Object.keys(b).forEach(function (n) { if (Number(b[n]) > 0) out.push({ k: 'rune', n: n, c: Number(b[n]) }); }); } catch (e) { }
    return out;
}
function hasStake(u, s) {
    return myStakes(u).some(function (x) { return x.k === s.k && x.n === s.n && x.c > 0; });
}
// 내 기록에서 하나 뺀다 / 하나 더한다 — 내 것만 고친다
function takeStake(s) {
    const u = u_();
    if (!u || !s) return false;
    if (s.k === 'food') { try { PETFOOD.add(s.n, -1); return true; } catch (e) { return false; } }
    if (s.k === 'care') { try { P().bagAdd(s.n, -1); return true; } catch (e) { return false; } }
    if (s.k === 'rune') { try { R().add(s.n, -1); return true; } catch (e) { return false; } }
    if (s.k === 'gear') {
        const inv = u.inventory || (u.inventory = []);
        const i = inv.indexOf(s.n);
        if (i < 0) return false;
        inv.splice(i, 1);
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
        return true;
    }
    return false;
}
function giveStake(s) {
    const u = u_();
    if (!u || !s) return false;
    if (s.k === 'food') { try { PETFOOD.add(s.n, 1); return true; } catch (e) { return false; } }
    if (s.k === 'care') { try { P().bagAdd(s.n, 1); return true; } catch (e) { return false; } }
    if (s.k === 'rune') { try { R().add(s.n, 1); return true; } catch (e) { return false; } }
    if (s.k === 'gear') {
        (u.inventory || (u.inventory = [])).push(s.n);
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
        return true;
    }
    return false;
}

// ==========================================
// 걸려 있는 배틀
// ==========================================
const live = {};
let watching = false;
function ref() { return db_() ? db_().ref(NODE) : null; }
function sideOf(o, code) { return (o.a && o.a.code === code) ? 'a' : (o.b && o.b.code === code) ? 'b' : ''; }
function other(side) { return side === 'a' ? 'b' : 'a'; }
function alive(o) { return !!o && ['ask', 'stake', 'prep', 'fight'].indexOf(o.stage) >= 0; }
function logArr(o) {
    const l = o && o.log;
    if (Array.isArray(l)) return l.filter(Boolean);
    if (l && typeof l === 'object') return Object.keys(l).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return l[k]; }).filter(Boolean);
    return [];
}
function runesArr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object') ? Object.keys(v).map(function (k) { return v[k]; }) : []; }

function watch() {
    const r = ref();
    if (!r || watching) return;
    watching = true;
    r.on('value', function (s) {
        const v = s.val() || {};
        Object.keys(live).forEach(function (k) { delete live[k]; });
        Object.keys(v).forEach(function (k) { live[k] = v[k]; });
        try { tick(); } catch (e) { console.warn('[펫 배틀]', e); }
        hooks.forEach(function (fn) { try { fn(live); } catch (e) { console.warn('[펫 배틀] 듣는 쪽', e); } });   // pet-arena.js 가 듣는다
    });
}
const hooks = [];
// 내가 걸려 있는 살아 있는 배틀 — 가장 새것
function mineLive() {
    const me = u_();
    if (!me) return null;
    let best = null;
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!alive(o) || !sideOf(o, me.code)) return;
        if (!best || Number(o.at || 0) > Number(best.at || 0)) best = Object.assign({ _k: k }, o);
    });
    return best;
}
function save(key, patch) { const r = ref(); return r ? r.child(key).update(patch) : Promise.resolve(); }
function tx(key, fn) { const r = ref(); return r ? r.child(key).transaction(fn) : Promise.resolve(null); }

// ==========================================
// ① 신청 — 사원 열람에 단추
// ==========================================
(function hookEmp() {
    const iv = setInterval(function () {
        if (typeof openEmpDetailModal !== 'function') return;
        if (openEmpDetailModal._petbt) { clearInterval(iv); return; }
        const _o = openEmpDetailModal;
        const w = function (code) {
            const r = _o.apply(this, arguments);
            setTimeout(function () { try { empBtn(code); } catch (e) { console.warn('[펫 배틀]', e); } }, 140);
            return r;
        };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._petbt = true;
        openEmpDetailModal = w;
        try { window.openEmpDetailModal = w; } catch (e) { }
        clearInterval(iv);
        console.log('[펫 배틀] 사원 열람에 결투 단추 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function empBtn(code) {
    const me = u_();
    const o = userOf(code);
    const host = document.getElementById('emp-detail-card-container');
    if (!me || !o || !host || !ready()) return;
    const old = document.getElementById('petbt-emp-box');
    if (old) old.remove();
    if (code === me.code || code === ADMIN) return;
    const theirs = Object.keys(P().pets(o)).filter(function (k) { return P().BY[k]; }).length;
    if (!theirs) return;

    const d = document.createElement('div');
    d.id = 'petbt-emp-box';
    d.style.cssText = 'background:rgba(255,183,77,0.05); border:1px solid #4a3a26; border-radius:6px; padding:9px 11px; margin-top:10px;';
    d.innerHTML = '<div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">'
        + '<div style="min-width:0;"><div style="font-size:11px; color:#ffcf8f; font-weight:bold;">⚔ 펫 배틀</div>'
        + '<div style="font-size:9.5px; color:#6f685e;">펫 ' + theirs + '마리 · 펫에 관한 것을 서로 걸고 붙는다</div></div>'
        + '<button class="game-btn" id="petbt-ask" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">결투 신청</button></div>';
    const adopt = document.getElementById('adopt-emp-box');
    if (adopt && adopt.parentNode === host) adopt.insertAdjacentElement('afterend', d); else host.appendChild(d);
    d.querySelector('#petbt-ask').onclick = function () { askStart(code); };
}

function askStart(code) {
    const me = u_();
    const o = userOf(code);
    if (!me || !o) return;
    if (!db_()) { alert_('서버에 닿아야 할 수 있습니다.'); return; }
    if (inDark()) { alert_('어둠 탐사 중에는 할 수 없습니다.'); return; }
    if (mineLive()) { alert_('이미 걸려 있는 결투가 있습니다.'); return; }
    if (!myPets().length) { alert_('내보낼 펫이 없습니다.'); return; }
    if (!myStakes().length) { alert_('걸 것이 없습니다.\n\n먹이 · 돌봄 물품 · 펫 장비 · 룬 가운데 하나는 있어야 합니다.'); return; }
    const w = box(head('⚔ 펫 배틀', '<b style="color:#ffcf8f;">' + esc(o.name) + '</b> 사원의 펫에게 결투를 신청합니다.<br><br>'
        + '내 펫 하나를 내보내고, 펫에 관한 것 하나를 겁니다. 상대도 펫 하나와 걸 것을 정해 받으면 붙습니다.<br>'
        + '다치는 것은 펫이 아니라 <b>주인</b>입니다 — 지면 건 것을 잃고 가두리에 한 시간 갇힙니다.')
        + '<button id="bt-ok" class="game-btn" style="' + BTN + '">신청한다</button>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#bt-no').onclick = shut;
    w.querySelector('#bt-ok').onclick = function () { pickPet(function (pet) { pickStake(function (stake) { sendAsk(code, pet, stake); }, '내가 거는 것'); }, '내보낼 펫'); };
}

// 내 펫 고르기 → cb(번호)
function pickPet(cb, title) {
    const me = u_();
    const keys = myPets(me);
    if (!keys.length) { alert_('내보낼 펫이 없습니다. (탐사 중 · 동행 중인 펫은 못 나갑니다)'); return; }
    const w = box(head(title || '펫 고르기', '지금 집에 있는 펫만 나갈 수 있습니다. 펫은 다치지 않습니다.')
        + '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:9px;">'
        + keys.map(function (k) {
            const sk = skillOf(k), fed = R().fed(k, me);
            return '<button class="game-btn bt-pet" data-k="' + esc(k) + '" style="margin:0; padding:8px 4px; font-size:10px; display:flex; flex-direction:column; align-items:center; gap:3px;">'
                + '<img src="' + P().icon(k) + '" alt="" style="width:40px; height:40px; object-fit:contain; image-rendering:pixelated;">'
                + '<span style="max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(nickOf(me, k)) + '</span>'
                + '<span style="font-size:8.5px; color:#8d8578;">' + esc(sk.n) + (fed.length ? ' · 룬 ' + fed.length : '') + '</span></button>';
        }).join('') + '</div>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#bt-no').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.bt-pet'), function (b) { b.onclick = function () { cb(b.dataset.k); }; });
}
// 걸 것 고르기 → cb({k,n})
function pickStake(cb, title) {
    const me = u_();
    const list = myStakes(me);
    if (!list.length) { alert_('걸 것이 없습니다.'); return; }
    const kindName = { food: '먹이', care: '돌봄 물품', gear: '펫 장비', rune: '룬' };
    const w = box(head(title || '걸 것 고르기', '펫에 관한 것만 걸 수 있습니다 — 먹이 · 돌봄 물품 · 펫 장비 · 룬. 하나씩입니다.')
        + '<div style="max-height:46dvh; overflow-y:auto; margin-bottom:9px;">'
        + list.map(function (s, i) {
            return '<button class="game-btn bt-st" data-i="' + i + '" style="width:100%; margin:0 0 5px 0; padding:9px; font-size:11px; text-align:left; display:flex; justify-content:space-between; gap:8px;">'
                + '<span>' + esc(s.k === 'rune' ? tagR(s.n) + ' 룬' : s.n) + '</span><span style="font-size:9.5px; color:#8d8578;">' + kindName[s.k] + ' · ' + s.c + '개</span></button>';
        }).join('') + '</div>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#bt-no').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.bt-st'), function (b) { b.onclick = function () { const s = list[Number(b.dataset.i)]; cb({ k: s.k, n: s.n }); }; });
}

function sendAsk(code, pet, stake) {
    const me = u_(), o = userOf(code), r = ref();
    if (!me || !o || !r) return;
    if (mineLive()) { alert_('이미 걸려 있는 결투가 있습니다.'); return; }
    const k = 'b' + Date.now() + Math.floor(Math.random() * 1000);
    // ★ 창은 먼저 닫는다 — 서버에 적는 순간 듣는 귀(tick)가 「기다리는 중」 창을 띄우는데, 그 뒤에 닫으면 그 창이 닫힌다
    shut(); shownTag = '';
    r.child(k).set({
        at: Date.now(), stage: 'ask',
        a: { code: me.code, name: me.name, pet: String(pet), stake: stake },
        b: { code: o.code, name: o.name }
    });
    log_('[펫 배틀] ' + o.name + ' 사원의 펫에게 결투를 신청했습니다. (' + nickOf(me, pet) + ' · 건 것: ' + (stake.k === 'rune' ? tagR(stake.n) + ' 룬' : stake.n) + ')');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
}

// ==========================================
// 화면 — 단계마다
// ==========================================
let shownTag = '';
let lastKey = '';
function tick() {
    const me = u_();
    if (!me || !ready()) return;
    expireSweep();
    settleSweep();
    const o = mineLive();
    if (!o) {
        // 걸려 있던 것이 없던 일이 됐다 — 상대가 거절 · 거둠 · 시간이 지남. 내 창이 아직 떠 있으면 닫고 알린다
        if (lastKey) {
            const o2 = live[lastKey];
            if (o2 && o2.stage === 'no' && document.getElementById(MOD)) {
                shut();
                alert_('⚔ 펫 배틀\n\n' + (o2.why === 'refuse' ? '상대가 거절했습니다.' : o2.why === 'expire' ? '시간이 지나 없던 일이 됐습니다.' : '결투가 거둬졌습니다.'));
            }
        }
        lastKey = ''; shownTag = '';
        return;
    }
    lastKey = o._k;
    if (inDark()) return;
    const side = sideOf(o, me.code);
    const mp = (o.pick && o.pick[side]) ? 1 : 0, op = (o.pick && o.pick[other(side)]) ? 1 : 0;
    const tag = [o._k, o.stage, o.round || 0, mp, op, (o.a && o.a.ready) ? 1 : 0, (o.b && o.b.ready) ? 1 : 0,
                 (o.a && o.a.hp), (o.b && o.b.hp), logArr(o).length, side].join('|');
    // 다른 창(룬 먹이기 · 펫 고르기)이 떠 있으면 건드리지 않는다
    if (document.getElementById('pet-rune-modal')) return;
    if (tag === shownTag) return;                 // 닫아 둔 창은 바뀔 때까지 다시 띄우지 않는다
    // 둘 다 골랐다 — 그 판을 풀고 끝낸다. 풀린 모습이 다시 들어오면 그때 그린다 (지금 모습으로 그리면 묵은 판이 남는다)
    if (o.stage === 'fight' && o.pick && o.pick.a && o.pick.b) { fightResolve(o); return; }
    shownTag = tag;
    if (o.stage === 'ask') { if (side === 'b') askView(o); else waitView(o, '상대가 받기를 기다리는 중'); }
    else if (o.stage === 'stake') { if (side === 'a') stakeView(o); else waitView(o, '신청한 쪽이 확인하기를 기다리는 중'); }
    else if (o.stage === 'prep') prepView(o);
    else if (o.stage === 'fight') fightView(o);
}

function waitView(o, why) {
    const me = u_();
    const side = sideOf(o, me.code);
    const mine = o[side], theirs = o[other(side)];
    const w = box(head('⚔ 펫 배틀 — 기다리는 중', esc(why) + '…')
        + '<div style="display:flex; gap:8px; margin-bottom:9px;">' + petCard(me, mine.pet, '내 펫') + '<div style="align-self:center; color:#8d8578; font-size:12px;">vs</div>' + petCard(userOf(theirs.code) || {}, theirs.pet, theirs.name + ' 사원') + '</div>'
        + '<div style="font-size:10.5px; color:#b8ac97; margin-bottom:9px;">내가 건 것 — ' + stakeText(mine.stake) + '<br>상대가 건 것 — ' + stakeText(theirs.stake) + '</div>'
        + '<button id="bt-x" class="game-btn" style="' + BTN + GREY + '">창을 닫는다 (결투는 그대로)</button>'
        + '<button id="bt-cancel" class="game-btn" style="' + BTN + RED + '">결투를 거둔다</button>');
    w.querySelector('#bt-x').onclick = shut;
    w.querySelector('#bt-cancel').onclick = function () {
        save(o._k, { stage: 'no', why: 'cancel', endAt: Date.now() });
        shut();
        alert_('결투를 거뒀습니다.');
    };
}

// ② 받는 쪽
function askView(o) {
    const me = u_();
    const a = o.a, ou = userOf(a.code) || { name: a.name };
    const w = box(head('⚔ 결투 신청이 들어왔습니다',
        '<b style="color:#ffcf8f;">' + esc(a.name) + '</b> 사원이 당신의 펫에게 결투를 신청했습니다.<br>'
        + '다치는 것은 펫이 아니라 <b>주인</b>입니다. 지면 건 것을 잃고 가두리에 한 시간 갇힙니다. 펫은 멀쩡합니다.')
        + '<div style="display:flex; gap:8px; margin-bottom:9px;">' + petCard(ou, a.pet, a.name + ' 사원의 펫') + '</div>'
        + '<div style="font-size:10.5px; color:#b8ac97; margin-bottom:11px;">상대가 건 것 — ' + stakeText(a.stake) + '</div>'
        + '<button id="bt-ok" class="game-btn" style="' + BTN + '">받는다 — 내 펫과 걸 것을 고른다</button>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">거절한다</button>', true);
    w.querySelector('#bt-no').onclick = function () {
        save(o._k, { stage: 'no', why: 'refuse', endAt: Date.now() });
        shut();
        alert_('거절했습니다.');
    };
    w.querySelector('#bt-ok').onclick = function () {
        if (inDark()) { alert_('어둠 탐사 중에는 할 수 없습니다.'); return; }
        if (!myPets().length) { alert_('내보낼 펫이 없습니다.'); return; }
        if (!myStakes().length) { alert_('걸 것이 없습니다.\n\n먹이 · 돌봄 물품 · 펫 장비 · 룬 가운데 하나는 있어야 합니다.'); return; }
        pickPet(function (pet) {
            pickStake(function (stake) {
                shut(); shownTag = '';
                tx(o._k, function (cur) {
                    if (!cur || cur.stage !== 'ask') return;
                    cur.stage = 'stake';
                    cur.b = Object.assign({}, cur.b || {}, { pet: String(pet), stake: stake });
                    cur.stageAt = Date.now();
                    return cur;
                }).then(function (r) {
                    if (!r || !r.committed) { alert_('신청이 이미 거둬졌습니다.'); return; }
                });
            }, '내가 거는 것');
        }, '내보낼 펫');
    };
}

// ③ 신청한 쪽 — 상대 펫 · 상대가 건 것을 보고 확인
function stakeView(o) {
    const me = u_();
    const b = o.b, ou = userOf(b.code) || { name: b.name };
    const w = box(head('⚔ 상대가 받았습니다',
        '<b style="color:#ffcf8f;">' + esc(b.name) + '</b> 사원이 펫과 걸 것을 정했습니다. 이대로 붙겠습니까.')
        + '<div style="display:flex; gap:8px; margin-bottom:9px;">' + petCard(me, o.a.pet, '내 펫') + '<div style="align-self:center; color:#8d8578; font-size:12px;">vs</div>' + petCard(ou, b.pet, b.name + ' 사원의 펫') + '</div>'
        + '<div style="font-size:10.5px; color:#b8ac97; margin-bottom:11px;">내가 건 것 — ' + stakeText(o.a.stake) + '<br>상대가 건 것 — ' + stakeText(b.stake) + '</div>'
        + '<button id="bt-ok" class="game-btn" style="' + BTN + '">이대로 붙는다</button>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>', true);
    w.querySelector('#bt-no').onclick = function () {
        save(o._k, { stage: 'no', why: 'cancel', endAt: Date.now() });
        shut();
        alert_('결투를 거뒀습니다.');
    };
    w.querySelector('#bt-ok').onclick = function () {
        shut(); shownTag = '';
        tx(o._k, function (cur) {
            if (!cur || cur.stage !== 'stake') return;
            cur.stage = 'prep'; cur.stageAt = Date.now();
            return cur;
        });
    };
}

// ④ 준비 — 룬을 먹이고 준비됐다
function prepView(o) {
    const me = u_();
    const side = sideOf(o, me.code);
    const mine = o[side], theirs = o[other(side)];
    const fed = R().fed(mine.pet, me);
    const iAm = !!mine.ready, they = !!theirs.ready;
    const w = box(head('⚔ 준비 — 룬을 먹입니다',
        '내 펫에게 룬을 ' + R().FED_MAX + '개까지 먹일 수 있습니다. 상대는 내가 무엇을 먹였는지 모릅니다.<br>'
        + '공격은 먹인 룬이나 스킬로, 방어는 먹인 룬으로 합니다. 룬이 없으면 스킬로만 치고 그냥 버팁니다.')
        + '<div style="display:flex; gap:8px; margin-bottom:9px;">' + petCard(me, mine.pet, '내 펫') + '<div style="align-self:center; color:#8d8578; font-size:12px;">vs</div>' + petCard(userOf(theirs.code) || {}, theirs.pet, theirs.name + ' 사원') + '</div>'
        + '<div style="font-size:10.5px; color:#b8ac97; margin-bottom:6px;">내가 건 것 — ' + stakeText(mine.stake) + '<br>상대가 건 것 — ' + stakeText(theirs.stake) + '</div>'
        + '<div style="font-size:11px; color:#c9a227; margin-bottom:9px;">먹인 룬: ' + (fed.length ? fed.map(tagR).map(esc).join(' · ') : '<span style="color:#6f685e;">없음</span>') + ' <span style="color:#6f685e;">(' + fed.length + '/' + R().FED_MAX + ')</span>'
        + ' · 스킬: ' + esc(skillOf(mine.pet).n) + '</div>'
        + (iAm ? '<div style="font-size:11px; color:#9fd8ef; text-align:center; padding:8px 0 10px 0;">준비됐습니다. ' + (they ? '곧 시작합니다…' : '상대를 기다리는 중…') + '</div>'
               : '<button id="bt-feed" class="game-btn" style="' + BTN + '">룬 먹이기</button>'
               + '<button id="bt-ready" class="game-btn" style="' + BTN + '">준비됐다</button>')
        + '<div style="font-size:10px; color:#6f685e; text-align:center; margin-bottom:7px;">상대 — ' + (they ? '<span style="color:#9fd8ef;">준비됐음</span>' : '아직') + '</div>'
        + '<button id="bt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다 (없던 일로)</button>', true);
    w.querySelector('#bt-no').onclick = function () {
        save(o._k, { stage: 'no', why: 'cancel', endAt: Date.now() });
        shut();
        alert_('결투를 거뒀습니다. 먹인 룬은 펫에게 그대로 남아 있습니다.');
    };
    const fb = w.querySelector('#bt-feed');
    if (fb) fb.onclick = function () { shut(); window.petRuneFeedOpen(mine.pet, function () { shownTag = ''; tick(); }); };
    const rb = w.querySelector('#bt-ready');
    if (rb) rb.onclick = function () {
        if (!hasStake(me, mine.stake)) {
            save(o._k, { stage: 'no', why: 'cancel', endAt: Date.now() });
            shut();
            alert_('건 것(' + (mine.stake && mine.stake.n) + ')이 없어져 결투를 거둡니다.');
            return;
        }
        const runes = R().fed(mine.pet, me);
        tx(o._k, function (cur) {
            if (!cur || cur.stage !== 'prep') return;
            cur[side] = Object.assign({}, cur[side] || {}, { ready: 1, runes: runes, hp: HP });
            if (cur.a && cur.a.ready && cur.b && cur.b.ready) {
                cur.stage = 'fight'; cur.round = 1; cur.first = 'a'; cur.roundAt = Date.now(); cur.pick = null; cur.log = [];
                cur.a.hp = HP; cur.b.hp = HP;
            }
            return cur;
        });
    };
}

// ==========================================
// ⑤ 공방
// ==========================================
function atkOptions(o, side) {
    const me = u_();
    const mine = o[side];
    const runes = runesArr(mine.runes);
    const uniq = [];
    runes.forEach(function (r) { if (R().BY[r] && uniq.indexOf(r) < 0) uniq.push(r); });
    const sk = skillOf(mine.pet);
    return uniq.map(function (r) { return { id: r, n: tagR(r) }; }).concat([{ id: 'skill', n: '✦ ' + sk.n }]);
}
function defOptions(o, side) {
    const runes = runesArr(o[side].runes);
    const uniq = [];
    runes.forEach(function (r) { if (R().BY[r] && uniq.indexOf(r) < 0) uniq.push(r); });
    return uniq.map(function (r) { return { id: r, n: tagR(r) }; }).concat([{ id: '', n: '그냥 버틴다' }]);
}
function lineOf(o, l, side) {
    const me = u_();
    const myAtk = (l.who === side);
    const myPet = nickOf(me, o[side].pet);
    const opp = o[other(side)];
    const oppPet = nickOf(userOf(opp.code) || {}, opp.pet);
    if (myAtk) {
        const what = l.atk === 'skill' ? skillOf(o[side].pet).n : tagR(l.atk);
        return '<div style="color:#e8d7b4;">' + l.r + '판 · 내 ' + esc(myPet) + ' — ' + esc(what) + ' → 상대 체력 <b style="color:#ff8a80;">−' + l.dmg + '</b>' + (l.blocked ? ' <span style="color:#8d8578;">(상대가 막았다)</span>' : '') + '</div>';
    }
    return '<div style="color:#c9b8ff;">' + l.r + '판 · 상대 ' + esc(oppPet) + '의 공격 → 내 체력 <b style="color:#ff8a80;">−' + l.dmg + '</b>' + (l.blocked ? ' <span style="color:#9fe6b0;">— 막아냈다</span>' : '') + '</div>';
}
let sel = { atk: null, def: null, key: '', give: false };
function fightView(o) {
    const me = u_();
    const side = sideOf(o, me.code);
    const mine = o[side], theirs = o[other(side)];
    const picked = !!(o.pick && o.pick[side]);
    const oppPicked = !!(o.pick && o.pick[other(side)]);
    const roundKey = o._k + '|' + o.round;
    if (sel.key !== roundKey) sel = { atk: null, def: null, key: roundKey, give: false };
    const logs = logArr(o).slice(-8);
    const late = oppPicked === false && picked && (Date.now() - Number(o.roundAt || o.at || 0)) > PICK_WAIT;

    const w = box(head('⚔ 펫 배틀 — ' + (o.round || 1) + '판', esc(mine.name) + ' vs ' + esc(theirs.name) + ' · 먼저 치는 쪽: ' + (o.first === side ? '나' : '상대'))
        + '<div style="display:flex; gap:8px; margin-bottom:8px;">' + petCard(me, mine.pet, '내 펫') + '<div style="align-self:center; color:#8d8578; font-size:12px;">vs</div>' + petCard(userOf(theirs.code) || {}, theirs.pet, theirs.name + ' 사원') + '</div>'
        + hpBar('내 체력 (주인)', mine.hp, true) + hpBar(theirs.name + ' 사원 체력', theirs.hp, false)
        + '<div style="font-size:10.5px; line-height:1.7; background:rgba(0,0,0,0.35); border:1px solid #2a241c; border-radius:6px; padding:7px 9px; margin:8px 0; min-height:36px;">'
        + (logs.length ? logs.map(function (l) { return lineOf(o, l, side); }).join('') : '<span style="color:#6f685e;">공격과 방어를 하나씩 고르면 판이 풀립니다.</span>') + '</div>'
        + (picked
            ? '<div style="font-size:11px; color:#9fd8ef; text-align:center; padding:8px 0;">골랐습니다. 상대를 기다리는 중…</div>'
              + (late ? '<button id="bt-forfeit" class="game-btn" style="' + BTN + RED + '">상대가 3분 넘게 자리를 비웠다 — 기권 처리</button>' : '')
            : '<div style="font-size:10px; color:#8d8578; margin-bottom:4px;">공격</div>'
              + '<div id="bt-atk" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;">' + atkOptions(o, side).map(function (x) {
                    return '<button class="game-btn bt-o" data-t="atk" data-id="' + esc(x.id) + '" style="flex:1 1 30%; margin:0; padding:9px 6px; font-size:11px;' + (sel.atk === x.id ? ' border-color:#ffcf8f !important; background:linear-gradient(145deg,#6b4a1d,#38250e) !important; color:#ffe9bd !important;' : '') + '">' + esc(x.n) + '</button>';
                }).join('') + '</div>'
              + '<div style="font-size:10px; color:#8d8578; margin-bottom:4px;">방어 <span style="color:#6f685e;">— 상대 공격의 속성을 이기는 룬이면 막는다 (막아도 1/3 은 받는다)</span></div>'
              + '<div id="bt-def" style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:9px;">' + defOptions(o, side).map(function (x) {
                    return '<button class="game-btn bt-o" data-t="def" data-id="' + esc(x.id) + '" style="flex:1 1 30%; margin:0; padding:9px 6px; font-size:11px;' + (sel.def === x.id ? ' border-color:#9fd8ef !important; background:linear-gradient(145deg,#1d3a4a,#0e2030) !important; color:#dff4ff !important;' : '') + '">' + esc(x.n) + '</button>';
                }).join('') + '</div>'
              + '<button id="bt-go" class="game-btn" style="' + BTN + '">결정</button>')
        + (sel.give
            ? '<button id="bt-give2" class="game-btn" style="' + BTN + RED + '">정말 기권한다 — 건 것을 잃고 가두리 한 시간</button>'
              + '<button id="bt-give0" class="game-btn" style="' + BTN + GREY + '">아니, 계속한다</button>'
            : '<button id="bt-give" class="game-btn" style="' + BTN + GREY + '">기권한다 (진 것으로)</button>'), true);
    // 상대가 오래 안 고르면 「기권 처리」 단추가 나오게 — 그때 다시 그린다
    if (picked && !oppPicked && !late) {
        const wait = Math.max(500, PICK_WAIT - (Date.now() - Number(o.roundAt || o.at || 0)) + 500);
        setTimeout(function () { if (document.getElementById(MOD)) { shownTag = ''; tick(); } }, wait);
    }

    Array.prototype.forEach.call(w.querySelectorAll('.bt-o'), function (b) {
        b.onclick = function () {
            if (b.dataset.t === 'atk') sel.atk = b.dataset.id; else sel.def = b.dataset.id;
            shownTag = ''; fightView(o);
        };
    });
    const go = w.querySelector('#bt-go');
    if (go) go.onclick = function () {
        if (sel.atk === null) { alert_('공격을 고르십시오.'); return; }
        if (sel.def === null) { alert_('방어를 고르십시오. (그냥 버틸 수도 있습니다)'); return; }
        const pick = { atk: sel.atk, def: sel.def || '' };
        tx(o._k, function (cur) {
            if (!cur || cur.stage !== 'fight' || Number(cur.round) !== Number(o.round)) return;
            cur.pick = cur.pick || {};
            if (cur.pick[side]) return;
            cur.pick[side] = pick;
            return cur;
        });
    };
    const ff = w.querySelector('#bt-forfeit');
    if (ff) ff.onclick = function () {
        tx(o._k, function (cur) {
            if (!cur || cur.stage !== 'fight') return;
            if (cur.pick && cur.pick[other(side)]) return;                 // 그 사이 골랐다
            if (Date.now() - Number(cur.roundAt || cur.at || 0) < PICK_WAIT) return;
            cur.stage = 'done'; cur.winner = side; cur.why = 'away'; cur.endAt = Date.now();
            return cur;
        });
    };
    const g0 = w.querySelector('#bt-give');
    if (g0) g0.onclick = function () { sel.give = true; shownTag = ''; fightView(o); };
    const g1 = w.querySelector('#bt-give0');
    if (g1) g1.onclick = function () { sel.give = false; shownTag = ''; fightView(o); };
    const g2 = w.querySelector('#bt-give2');
    if (g2) g2.onclick = function () {
        tx(o._k, function (cur) {
            if (!cur || cur.stage !== 'fight') return;
            cur.stage = 'done'; cur.winner = other(side); cur.why = 'forfeit'; cur.endAt = Date.now();
            return cur;
        });
    };
}

// 둘 다 골랐으면 그 판을 푼다 — 어느 쪽 화면이든, 트랜잭션이라 한 번만 풀린다
function fightResolve(o) {
    if (!o.pick || !o.pick.a || !o.pick.b) return;
    const rolls = { a: { rune: rnd(DMG.rune[0], DMG.rune[1]), skill: rnd(DMG.skill[0], DMG.skill[1]) },
                    b: { rune: rnd(DMG.rune[0], DMG.rune[1]), skill: rnd(DMG.skill[0], DMG.skill[1]) } };
    tx(o._k, function (cur) {
        if (!cur || cur.stage !== 'fight') return;
        if (!cur.pick || !cur.pick.a || !cur.pick.b) return;
        const order = cur.first === 'b' ? ['b', 'a'] : ['a', 'b'];
        const log = logArr(cur);
        const round = Number(cur.round) || 1;
        for (let i = 0; i < order.length; i++) {
            const s = order[i], t = other(s);
            const pk = cur.pick[s], dk = cur.pick[t] || {};
            const type = pk.atk === 'skill' ? skillOf(cur[s].pet).t : pk.atk;
            const base = pk.atk === 'skill' ? rolls[s].skill : rolls[s].rune;
            const blocked = !!(dk.def && R().beats(dk.def, type));
            const dmg = blocked ? Math.ceil(base / BLOCK_DIV) : base;
            cur[t].hp = Math.max(0, (Number(cur[t].hp) || 0) - dmg);
            log.push({ r: round, who: s, atk: pk.atk, dmg: dmg, blocked: blocked });
            if (cur[t].hp <= 0) { cur.stage = 'done'; cur.winner = s; cur.why = 'hp'; cur.endAt = Date.now(); break; }
        }
        cur.log = log;
        cur.pick = null;
        if (cur.stage === 'fight') { cur.round = round + 1; cur.first = other(cur.first === 'b' ? 'b' : 'a'); cur.roundAt = Date.now(); }
        return cur;
    });
}

// ==========================================
// ⑥ 정산 — 내 쪽만 내가 한다 (끝난 것을 보면 그 자리에서 · 늦게 들어와도 하루 안이면)
// ==========================================
const settling = {};
function settleSweep() {
    const me = u_();
    if (!me) return;
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!o || o.stage !== 'done') return;
        const side = sideOf(o, me.code);
        if (!side) return;
        if (o.settled && o.settled[me.code]) return;
        if (Date.now() - Number(o.endAt || o.at || 0) > SETTLE_LIVE) return;
        if (settling[k]) return;
        settling[k] = 1;
        settle(Object.assign({ _k: k }, o), side);
    });
}
function settle(o, side) {
    const me = u_();
    const won = (o.winner === side);
    const mine = o[side], theirs = o[other(side)];
    const stakeMine = mine.stake, stakeTheirs = theirs.stake;
    const nm = nickOf(me, mine.pet);
    const sname = function (s) { return s ? (s.k === 'rune' ? tagR(s.n) + ' 룬' : s.n) : '없음'; };
    const why = o.why === 'forfeit' ? (won ? '상대가 기권했습니다.' : '기권했습니다.')
              : o.why === 'away' ? (won ? '상대가 자리를 비워 기권 처리됐습니다.' : '자리를 오래 비워 기권 처리됐습니다.')
              : (won ? '상대 주인의 체력이 먼저 다 닳았습니다.' : '내 체력이 먼저 다 닳았습니다.');
    // 먹였던 룬은 소모
    try { R().clear(mine.pet); } catch (e) { }
    if (won) {
        giveStake(stakeTheirs);
        log_('[펫 배틀] ' + theirs.name + ' 사원과의 결투에서 이겼습니다 — ' + nm + ' · 받은 것: ' + sname(stakeTheirs));
    } else {
        takeStake(stakeMine);
        log_('[펫 배틀] ' + theirs.name + ' 사원과의 결투에서 졌습니다 — ' + nm + ' · 잃은 것: ' + sname(stakeMine) + ' · 가두리 한 시간');
        cage(me);
    }
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    const patch = {}; patch['settled/' + me.code] = 1;
    save(o._k, patch).then(function () { delete settling[o._k]; }).catch(function () { delete settling[o._k]; });
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    shut(); shownTag = '';
    const w = box(head('⚔ 펫 배틀 — ' + (won ? '이겼습니다' : '졌습니다'), esc(why))
        + '<div style="display:flex; gap:8px; margin-bottom:9px;">' + petCard(me, mine.pet, '내 펫') + '<div style="align-self:center; color:#8d8578; font-size:12px;">vs</div>' + petCard(userOf(theirs.code) || {}, theirs.pet, theirs.name + ' 사원') + '</div>'
        + hpBar('내 체력 (주인)', mine.hp, true) + hpBar(theirs.name + ' 사원 체력', theirs.hp, false)
        + '<div style="font-size:11px; color:#e8d7b4; line-height:1.7; margin:9px 0;">'
        + (won ? '받은 것 — <b style="color:#ffcf8f;">' + esc(sname(stakeTheirs)) + '</b>'
               : '잃은 것 — <b style="color:#ff8a80;">' + esc(sname(stakeMine)) + '</b><br><span style="color:#ff8a80;">가두리에 한 시간 갇힙니다.</span>')
        + '<br><span style="color:#8d8578;">' + esc(nm) + josa(nm, '은') + ' 멀쩡합니다. 먹였던 룬은 소모됐습니다.</span></div>'
        + '<button id="bt-x" class="game-btn" style="' + BTN + GREY + '">닫는다</button>');
    w.querySelector('#bt-x').onclick = shut;
}
// 진 쪽 — 가두리 15분 (광장 → 백일몽 차례로 빈 자리 · 둘 다 찼으면 밖에 둔다)
function cage(me) {
    const d = db_();
    if (!d || !me || me.code === ADMIN) return;
    const until = Date.now() + CAGE_MS;
    const rooms = (typeof window.gaduriOrder === 'function') ? window.gaduriOrder() : ['plaza', 'dream', 'post'];   // 광장 → 백일몽 → 우체국 → … (꽉 차면 다음)
    const put = function (i) {
        if (i >= rooms.length) return;
        d.ref('gaduri/' + rooms[i]).transaction(function (box) {
            box = box || {};
            if (box[me.code]) { if (!box[me.code].until || box[me.code].until < until) { box[me.code].until = until; box[me.code].by = box[me.code].by || 'petbt'; } return box; }
            if (Object.keys(box).length >= 3) return;
            box[me.code] = { at: Date.now(), by: 'petbt', until: until, name: me.name || me.code };
            return box;
        }).then(function (res) { if (!res || !res.committed) put(i + 1); }).catch(function () { });
    };
    put(0);
}

// 묵은 글 — 신청 · 확인 · 준비 10분 · 끝난 글 이틀
function expireSweep() {
    const r = ref();
    if (!r) return;
    const t = Date.now();
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!o) return;
        if (alive(o) && o.stage !== 'fight' && t - Number(o.stageAt || o.at || 0) > STAGE_WAIT) {
            r.child(k).update({ stage: 'no', why: 'expire', endAt: t }).catch(function () { });
        } else if (o.stage === 'fight' && t - Number(o.roundAt || o.at || 0) > FIGHT_WAIT) {
            r.child(k).update({ stage: 'no', why: 'expire', endAt: t }).catch(function () { });   // 둘 다 자리를 비웠다 — 없던 일 (판돈도 가두리도 없다)
        } else if (!alive(o) && t - Number(o.endAt || o.at || 0) > LIVE) {
            r.child(k).remove().catch(function () { });
        }
    });
}

setInterval(function () { try { if (ready()) watch(); } catch (e) { } }, 1500);
setInterval(function () { try { if (ready() && watching) tick(); } catch (e) { } }, 5000);

// ==========================================
// 확인
// ==========================================
// 바깥(pet-arena.js — 광장 연출)에 내어 준다
window.PETBATTLE = {
    all: function () { return live; }, mine: mineLive, side: sideOf, other: other, logs: logArr,
    on: function (fn) { if (typeof fn === 'function' && hooks.indexOf(fn) < 0) hooks.push(fn); },
    HP: HP, MOD: MOD
};

window.petBattleState = function () {
    const me = u_();
    console.log('%c===== ⚔ 펫 배틀 =====', 'color:#ffb74d; font-size:13px');
    const rows = Object.keys(live).map(function (k) {
        const o = live[k];
        return { 열쇠: k, 단계: o.stage, 신청: o.a && o.a.name, 받음: o.b && o.b.name, 판: o.round || '-', 'a 체력': o.a && o.a.hp, 'b 체력': o.b && o.b.hp, 승자: o.winner ? (o[o.winner] || {}).name : '-', 때: new Date(Number(o.at) || 0).toLocaleTimeString() };
    });
    if (rows.length) console.table(rows); else console.log('  걸려 있는 배틀이 없습니다.');
    if (me) console.log('  내 펫:', myPets(me).join(', ') || '없음', '· 걸 수 있는 것:', myStakes(me).length + '가지');
};
window.petBattleClear = function () {
    const me = u_(), r = ref();
    if (!me || me.code !== ADMIN || !r) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    let n = 0;
    Object.keys(live).forEach(function (k) { if (!alive(live[k])) { r.child(k).remove(); n++; } });
    console.log('%c✓ 끝난 글 ' + n + '개를 치웠습니다.', 'color:#4CAF50');
};

console.log('[펫 배틀] petBattleState()');

})();
