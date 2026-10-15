// ==========================================
// ★ 펫 입양 — 보내기 · 신청 · 어필 · 이름 붙일 권리
// bundles.json 마지막 묶음, pet-talk.js 보다 뒤
// ==========================================
//
// ■ 두 갈래
//
//   보내기   주인이 펫 칸에서 제 펫을 누르고 「입양 보내기」 → 받을 사원을 고른다.
//            받는 사원에게 창이 뜨고, 그 사람이 **펫에게 어필**한다.
//   신청     사원 열람 맨 밑에 그 사원이 사택 방에 내놓은 펫 두 마리가 뜬다.
//            「입양 신청」을 누르면 주인에게 승낙/거절이 뜨고, 승낙하면
//            신청한 사람이 **펫에게 어필**한다.
//
//   어느 쪽이든 **펫이 마음을 줘야** 간다. 사람끼리 합의해도 펫이 싫으면 안 간다.
//
// ■ 어필
//
//   밥주기 · 놀기 · 씻기기 를 한 번씩, 그리고 말은 다섯 번까지 걸 수 있다.
//   말은 pet-talk 가 알아듣는 것이면 크게, 아니면 조금 오른다.
//
//       필요한 마음 = 100 + 지금 주인과의 교감도
//
//   교감이 깊은 펫일수록 떼어 놓기 어렵다. 교감 100 이면 200 을 채워야 한다.
//   손이 다 떨어졌는데 모자라면 그 자리에서 끝난다 (그 펫에게는 하루 뒤 다시).
//
// ■ 삼 일에 한 번
//
//   보내는 쪽은 사흘에 한 번만 보낼 수 있다 (u.petGaveAt). 신청을 승낙하는
//   것도 보내는 것이므로 같이 센다. 받는 쪽에는 제한이 없다.
//
//   ★ 상담사는 날짜 제한이 없다 (noGap). 입양을 굴리는 쪽이라 줄곧 보내고
//     받아야 하는데, 사흘에 묶이면 사원 쪽 입양이 상담사를 기다리느라 멈춘다.
//
// ■ 이름
//
//   이름은 **한 번만** 붙인다.
//     · 깨어났을 때 한 번
//     · 입양으로 받았을 때 한 번 (받은 사람이 새로 붙인다)
//   그 뒤에 바꾸려면 상담사가 주는 「🐾 펫 이름 개명권」이 있어야 한다.
//   개명권은 **소지품 물품**이다 (📝 사원명 변경권과 같은 꼴 — rename.js).
//   소지품에서 쓰면 펫을 고르는 창이 뜨고, 쓰면 한 장 사라진다.
//
//       petRenameGive('2542')      상담사 — 개명권 한 장
//       petRenameGive('2542', 3)   세 장
//
//   펫 한 마리의 상태는 pets[번호].nameOk 로 적는다 (1 이면 붙일 수 있다).
//   예전부터 있던 펫은 이름이 없으면 한 번 붙일 수 있는 것으로 본다.
//
// ■ 적히는 자리
//
//   petAdopt/<열쇠>  { k, owner, ownerName, other, otherName, pet, at,
//                      stage, score, used:{food,play,wash}, says, last }
//       k      give  주인이 보낸다 (어필은 받는 쪽이)
//              ask   남이 신청한다 (승낙 뒤 어필은 신청한 쪽이)
//       stage  wait 승낙 기다림 · appeal 어필 중 · done 됨 · no 틀어짐
//
//   u.petGaveAt        마지막으로 보낸 때
//   u.inventory        개명권은 여기에 「🐾 펫 이름 개명권」으로 들어 있다
//   u.petAdoptCool     { 펫열쇠: 다시 해 볼 수 있는 때 } ← 쓰지 않는다 (아래 참고)
//
//   ★ 열쇠에 펫 번호만 쓴다. 이름을 열쇠로 쓰면 파이어베이스가 꾸러미째
//     거절한다 (spaceitems.js:29 과 같은 함정).
//
// ■ 콘솔
//   petAdoptState()          지금 걸려 있는 입양
//   petRenameGive(사번, 수)   상담사 — 개명권 주기
//   petTicketUse()           소지품에서 개명권을 쓸 때 뜨는 창
//   petAdoptClear()          상담사 — 묵은 입양 글 치우기

(function petAdopt() {

const GAP = 3 * 24 * 3600 * 1000;      // 보내는 쪽 사흘
const NEED_BASE = 100;                 // 기본으로 채워야 하는 마음
const SAY_MAX = 5;                     // 말은 다섯 번까지
const RETRY = 24 * 3600 * 1000;        // 틀어진 뒤 그 펫에게 다시 해 볼 때까지
const LIVE = 6 * 3600 * 1000;          // 이보다 묵은 글은 치운다
const MOD = 'pet-adopt-modal';

const TICKET = '🐾 펫 이름 개명권';
const ADMIN = 'kario0987';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function users() { return (typeof db !== 'undefined' && db.users) ? db.users : {}; }
function userOf(code) { return users()[code] || null; }
function nameOf(code) { const u = userOf(code); return (u && u.name) || code; }
function josa(w, k) { try { return P().josa(w, k); } catch (e) { return k; } }

// ==========================================
// 창
// ==========================================
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

function shut() { const m = document.querySelector('#' + MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999995; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function head(t, sub) {
    return '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">'
        + esc(t) + '</div>'
        + (sub ? '<div style="font-size:9.5px; color:#6f685e; margin-bottom:11px; line-height:1.6;">'
            + sub + '</div>' : '');
}

// ==========================================
// 펫 한 마리를 집는다
// ==========================================
function petOf(u, key) {
    try { return P().pets(u)[String(key)] || null; } catch (e) { return null; }
}
function nickOf(u, key) {
    try { return P().nick(key, u); } catch (e) { return (P().BY[key] || {}).n || '펫'; }
}
function bondOf(u, key) {
    try { return P().bond(key, u); } catch (e) { return 0; }
}

// ==========================================
// 사흘에 한 번
// ==========================================
// ★ 상담사는 날짜 제한이 없다.
//   입양을 굴리는 쪽이라 줄곧 보내고 받아야 하는데, 사흘에 한 번에 묶이면
//   사원 쪽 입양이 상담사를 기다리느라 멈춘다. 받는 쪽은 본래 제한이 없다.
function noGap(u) { return !!(u && u.code === ADMIN); }
function giveLeft(u) {
    if (noGap(u)) return 0;
    const t = Number(u && u.petGaveAt) || 0;
    return Math.max(0, t + GAP - Date.now());
}
// 안내 글 — 상담사에게는 사흘 이야기를 안 한다
function gapLine(u, tail) {
    return noGap(u) ? '상담사는 <b>날짜 제한 없이</b> 보낼 수 있습니다.'
        : ('보내기는 <b>사흘에 한 번</b>입니다' + (tail || '') + '.');
}
function leftText(ms) {
    const h = Math.ceil(ms / 3600000);
    if (h >= 24) return Math.floor(h / 24) + '일 ' + (h % 24) + '시간';
    return h + '시간';
}

// ==========================================
// 이름을 붙일 수 있나
// ==========================================
//
//   nameOk 가 1 이면 붙일 수 있다. 예전부터 있던 펫은 그 칸이 없으므로,
//   이름이 아직 없으면 한 번 붙일 수 있는 것으로 본다.
function canName(u, key) {
    const s = petOf(u, key);
    if (!s) return false;
    if (Number(s.nameOk) === 1) return true;
    if (s.nameOk === undefined && !(typeof s.nick === 'string' && s.nick.trim())) return true;
    return ticketCount(u) > 0;
}
function ticketCount(u) {
    return ((u && u.inventory) || []).filter(function (x) { return x === TICKET; }).length;
}
function useName(u, key) {
    const s = petOf(u, key);
    if (!s) return;
    if (Number(s.nameOk) === 1 || s.nameOk === undefined) {
        try { P().patch(String(key), { nameOk: 0 }); } catch (e) { s.nameOk = 0; }
        return;
    }
    // 소지품에서 개명권 한 장을 뗀다
    const inv = u.inventory || (u.inventory = []);
    const i = inv.indexOf(TICKET);
    if (i >= 0) inv.splice(i, 1);
    try { if (typeof saveFields === 'function') saveFields({ inventory: 1 }); } catch (e) { }
}

// 이름 붙이기를 한 번으로 묶는다 — pet-list 의 「이름 붙이기」도 이 길을 지난다
(function hookRename() {
    const iv = setInterval(function () {
        if (!window.PET || typeof P().rename !== 'function') return;
        if (P().rename._adopt) { clearInterval(iv); return; }
        const _r = P().rename;
        const w = function (id, name) {
            const me = u_();
            if (!me) return _r.apply(this, arguments);
            if (!canName(me, id)) {
                return { ok: false, why: '이름은 한 번만 붙일 수 있습니다.\n\n'
                    + '깨어났을 때 한 번, 입양으로 받았을 때 한 번입니다.\n'
                    + '바꾸려면 상담사에게 ' + TICKET + '을 받아야 합니다.' };
            }
            const out = _r.apply(this, arguments);
            if (out && out.ok) useName(me, id);
            return out;
        };
        w._adopt = true;
        P().rename = w;
        clearInterval(iv);
        console.log('[입양] 이름은 한 번만 — 개명권으로 다시');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 걸려 있는 입양 글
// ==========================================
const live = {};                 // 열쇠 → 글
let watching = false;

function mine(o) {
    const me = u_();
    if (!me || !o) return false;
    return o.owner === me.code || o.other === me.code;
}
function ref() { return db_() ? db_().ref('petAdopt') : null; }

function watch() {
    const r = ref();
    if (!r || watching) return;
    watching = true;
    r.on('value', function (s) {
        const v = s.val() || {};
        Object.keys(live).forEach(function (k) { delete live[k]; });
        Object.keys(v).forEach(function (k) { live[k] = v[k]; });
        try { paintAsk(); } catch (e) { }
    });
}

// 내게 와 있는 것 가운데 가장 새것
function pending() {
    const me = u_();
    if (!me) return null;
    const t = Date.now();
    let best = null;
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!o || !mine(o)) return;
        if (o.stage !== 'wait' && o.stage !== 'appeal') return;
        if (t - Number(o.at || 0) > LIVE) return;
        if (!best || Number(o.at || 0) > Number(best.at || 0)) best = Object.assign({ _k: k }, o);
    });
    return best;
}

function save(key, patch) {
    const r = ref();
    if (!r) return Promise.resolve();
    return r.child(key).update(patch);
}

// ==========================================
// ① 보내기 — 주인이 고른다
// ==========================================
window.petAdoptSend = function (id) {
    const me = u_();
    if (!me) return;
    const key = String(id);
    if (!petOf(me, key)) { alert_('아직 없는 펫입니다.'); return; }
    if (!db_()) { alert_('서버에 닿아야 할 수 있습니다.'); return; }

    const left = giveLeft(me);
    if (left > 0) {
        alert_('입양은 사흘에 한 번 보낼 수 있습니다.\n\n' + leftText(left) + ' 뒤에 다시 됩니다.');
        return;
    }
    const nm = nickOf(me, key);
    const list = Object.keys(users()).map(function (c) { return users()[c]; })
        .filter(function (x) { return x && x.code && x.name && x.code !== me.code; })
        .sort(function (a, b) { return String(a.no || '').localeCompare(String(b.no || '')); });

    const w = box(head(nm + josa(nm, '을') + ' 입양 보냅니다',
        '받을 사원을 고르십시오. 그 사원이 ' + esc(nm) + '의 마음을 얻으면 갑니다.<br>'
        + '지금 교감 <b style="color:#ffcf8f;">' + bondOf(me, key) + '</b> — 깊을수록 떼기 어렵습니다.')
        + '<input id="adp-find" type="text" placeholder="이름이나 사번으로 찾기" maxlength="16"'
        + ' style="width:100%; padding:9px; font-size:12px; margin-bottom:8px; box-sizing:border-box;">'
        + '<div id="adp-list" style="max-height:38dvh; overflow-y:auto; margin-bottom:9px;"></div>'
        + '<button id="adp-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');

    const draw = function (q) {
        const v = String(q || '').trim().toLowerCase();
        const hit = list.filter(function (x) {
            if (!v) return true;
            return String(x.name).toLowerCase().indexOf(v) >= 0
                || String(x.no || '').indexOf(v) >= 0;
        }).slice(0, 60);
        w.querySelector('#adp-list').innerHTML = hit.length
            ? hit.map(function (x) {
                return '<button class="game-btn adp-one" data-c="' + esc(x.code) + '"'
                    + ' style="width:100%; margin:0 0 5px 0; padding:9px; font-size:11px;'
                    + ' text-align:left;">' + esc(x.no || '----') + ' · ' + esc(x.name) + '</button>';
            }).join('')
            : '<div style="font-size:10.5px; color:#6f685e; padding:8px 0;">찾는 사원이 없습니다.</div>';
        Array.prototype.forEach.call(w.querySelectorAll('.adp-one'), function (b) {
            b.onclick = function () { confirmSend(key, b.dataset.c); };
        });
    };
    draw('');
    w.querySelector('#adp-find').oninput = function () { draw(this.value); };
    w.querySelector('#adp-no').onclick = shut;
};

function confirmSend(key, to) {
    const me = u_();
    const t = userOf(to);
    if (!me || !t) return;
    const nm = nickOf(me, key);
    const w = box(head('이대로 보냅니까',
        '<b style="color:#ffcf8f;">' + esc(t.name) + '</b> 사원에게 <b style="color:#ffcf8f;">'
        + esc(nm) + '</b>' + josa(nm, '을') + ' 보냅니다.<br>'
        + '그 사원이 ' + esc(nm) + '의 마음을 얻어야 갑니다. 얻지 못하면 그대로 남습니다.<br><br>'
        + gapLine(me))
        + '<button id="adp-ok" class="game-btn" style="' + BTN + '">보낸다</button>'
        + '<button id="adp-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#adp-no').onclick = shut;
    w.querySelector('#adp-ok').onclick = function () {
        const r = ref();
        if (!r) return;
        const k = 'a' + Date.now() + Math.floor(Math.random() * 1000);
        r.child(k).set({
            k: 'give', owner: me.code, ownerName: me.name, other: to, otherName: t.name,
            pet: String(key), at: Date.now(), stage: 'appeal',
            score: 0, used: {}, says: 0, need: NEED_BASE + bondOf(me, key)
        });
        shut();
        alert_(t.name + ' 사원에게 ' + nm + josa(nm, '을') + ' 보냈습니다.\n\n'
            + '그 사원이 ' + nm + '의 마음을 얻으면 갑니다.');
    };
}

// ==========================================
// ② 신청 — 사원 열람 맨 밑
// ==========================================
window.petAdoptAsk = function (ownerCode, petKey) {
    const me = u_();
    const o = userOf(ownerCode);
    if (!me || !o) return;
    if (!db_()) { alert_('서버에 닿아야 할 수 있습니다.'); return; }
    if (ownerCode === me.code) { alert_('제 펫입니다.'); return; }
    const nm = nickOf(o, petKey);

    const w = box(head(nm + josa(nm, '을') + ' 입양 신청합니다',
        '<b style="color:#ffcf8f;">' + esc(o.name) + '</b> 사원에게 뜻을 전합니다.<br>'
        + '승낙하면 그때 <b>' + esc(nm) + '에게 어필</b>하게 됩니다. 마음을 얻어야 옵니다.')
        + '<button id="adp-ok" class="game-btn" style="' + BTN + '">신청한다</button>'
        + '<button id="adp-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#adp-no').onclick = shut;
    w.querySelector('#adp-ok').onclick = function () {
        const r = ref();
        if (!r) return;
        const k = 'a' + Date.now() + Math.floor(Math.random() * 1000);
        r.child(k).set({
            k: 'ask', owner: ownerCode, ownerName: o.name, other: me.code, otherName: me.name,
            pet: String(petKey), at: Date.now(), stage: 'wait',
            score: 0, used: {}, says: 0, need: NEED_BASE + bondOf(o, petKey)
        });
        shut();
        alert_(o.name + ' 사원에게 신청했습니다.\n\n승낙하면 ' + nm + '에게 어필할 수 있습니다.');
    };
};

// 사원 열람 맨 밑 — 그 사원이 방에 내놓은 펫 두 마리
function empPets(code) {
    const o = userOf(code);
    if (!o) return [];
    let ids = [];
    try { ids = P().show(o) || []; } catch (e) { ids = []; }
    return ids.filter(function (k) { return petOf(o, k); });
}

(function hookEmp() {
    const iv = setInterval(function () {
        if (typeof openEmpDetailModal !== 'function') return;
        if (openEmpDetailModal._adopt) { clearInterval(iv); return; }
        const _o = openEmpDetailModal;
        openEmpDetailModal = function (code) {
            const r = _o.apply(this, arguments);
            setTimeout(function () { try { empRow(code); } catch (e) { console.warn('[입양]', e); } }, 70);
            return r;
        };
        openEmpDetailModal._adopt = true;
        clearInterval(iv);
        console.log('[입양] 사원 열람에 펫 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

function empRow(code) {
    const me = u_();
    const o = userOf(code);
    const host = document.getElementById('emp-detail-card-container');
    if (!me || !o || !host) return;
    const old = document.getElementById('adopt-emp-box');
    if (old) old.remove();
    const ids = empPets(code);
    if (!ids.length) return;

    const own = (code === me.code);
    const html = ids.map(function (k) {
        const nm = nickOf(o, k);
        const sp = (P().BY[k] || {}).n || '';
        return '<div style="display:flex; align-items:center; gap:8px; padding:7px 0;'
            + ' border-top:1px solid rgba(255,255,255,0.06);">'
            + '<img src="' + P().icon(k) + '" alt="" style="width:34px; height:34px;'
            + ' object-fit:contain; image-rendering:pixelated; flex:0 0 auto;">'
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:11px; color:#e8d7b4;">' + esc(nm) + '</div>'
            + '<div style="font-size:9.5px; color:#6f685e;">' + esc(sp) + '</div></div>'
            + (own ? '' : '<button class="game-btn adopt-ask" data-k="' + esc(k) + '"'
                + ' style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px;">입양 신청</button>')
            + '</div>';
    }).join('');

    const d = document.createElement('div');
    d.id = 'adopt-emp-box';
    d.style.cssText = 'background:rgba(255,207,143,0.05); border:1px solid #4a3a26;'
        + ' border-radius:6px; padding:9px 11px; margin-top:12px;';
    d.innerHTML = '<div style="font-size:11px; color:#ffcf8f; font-weight:bold;">🐾 사택 방의 펫</div>'
        + html;
    host.appendChild(d);
    Array.prototype.forEach.call(d.querySelectorAll('.adopt-ask'), function (b) {
        b.onclick = function () { window.petAdoptAsk(code, b.dataset.k); };
    });
}

// ==========================================
// ③ 주인에게 뜨는 승낙 / 거절
// ==========================================
let shown = '';

function paintAsk() {
    const me = u_();
    if (!me) return;
    const o = pending();
    if (!o) return;
    if (document.querySelector('#' + MOD)) return;   // 이미 뭔가 떠 있다
    const tag = o._k + '|' + o.stage;
    if (shown === tag) return;

    // 승낙을 기다리는 신청 — 주인에게
    if (o.stage === 'wait' && o.owner === me.code) { shown = tag; askView(o); return; }
    // 어필할 차례 — 받는 쪽(give) 또는 신청한 쪽(ask)
    if (o.stage === 'appeal' && o.other === me.code) { shown = tag; appealView(o); return; }
}

function askView(o) {
    const me = u_();
    const nm = nickOf(me, o.pet);
    const w = box(head('입양 신청이 들어왔습니다',
        '<b style="color:#ffcf8f;">' + esc(o.otherName) + '</b> 사원 님이 당신의 <b style="color:#ffcf8f;">'
        + esc(nm) + '</b>' + josa(nm, '을') + ' 입양하려고 합니다.<br><br>'
        + '승낙하면 그 사원이 ' + esc(nm) + '에게 어필합니다. ' + esc(nm)
        + josa(nm, '이') + ' 마음을 주어야 갑니다.<br>'
        + gapLine(me, '이며, 승낙도 보내는 것으로 셉니다'))
        + '<button id="adp-ok" class="game-btn" style="' + BTN + '">승낙한다</button>'
        + '<button id="adp-no" class="game-btn" style="' + BTN + GREY + '">거절한다</button>');

    w.querySelector('#adp-ok').onclick = function () {
        const left = giveLeft(me);
        if (left > 0) {
            alert_('입양은 사흘에 한 번입니다.\n\n' + leftText(left) + ' 뒤에 다시 됩니다.');
            return;
        }
        save(o._k, { stage: 'appeal', need: NEED_BASE + bondOf(me, o.pet) });
        shut();
        alert_('승낙했습니다.\n\n' + o.otherName + ' 사원이 ' + nm + '에게 어필합니다.');
    };
    w.querySelector('#adp-no').onclick = function () {
        save(o._k, { stage: 'no', why: 'refuse' });
        shut();
        alert_('거절했습니다.');
    };
}

// ==========================================
// ④ 어필
// ==========================================
const ACTS = [
    { id: 'food', n: '밥 주기',  lo: 20, hi: 40 },
    { id: 'play', n: '놀아 주기', lo: 20, hi: 40 },
    { id: 'wash', n: '씻기기',   lo: 20, hi: 40 }
];
// 갈래마다 다른 한 줄 — pet-talk 의 갈래를 그대로 쓴다
const RE = {
    food: { dog:'그릇이 비기 전에 다 먹는다. 당신 손을 핥는다.',
            cat:'한참 보다가 먹는다. 먹고 나서도 보던 자리를 본다.',
            bird:'부리로 톡톡 쪼아 먹는다. 반쯤 흘린다.',
            water:'앞발로 받아 쥐고 먹는다. 아주 야무지다.',
            rept:'천천히 삼킨다. 삼키는 동안 눈을 감는다.',
            small:'볼이 두 배가 된다. 아직 더 들어간다.',
            bear:'그릇째 안고 먹는다. 그릇이 안 보인다.',
            hoof:'손바닥째 먹으려 든다. 혀가 거칠다.',
            bug:'단물에 한참 앉아 있는다. 날개가 천천히 움직인다.' },
    play: { dog:'공을 던지자마자 사라졌다 돌아온다. 숨이 가쁘다.',
            cat:'끈을 쫓다 말고 당신 손을 잡는다. 발톱은 넣었다.',
            bird:'어깨와 손을 오가며 난다. 머리카락을 하나 물고 간다.',
            water:'배를 보이고 구르며 논다. 멈추지 않는다.',
            rept:'느리게 따라온다. 그래도 끝까지 따라온다.',
            small:'손가락 사이를 몇 번이나 빠져나간다.',
            bear:'앞발로 민다. 당신이 밀린다. 즐거운 모양이다.',
            hoof:'머리로 들이받는 시늉을 한다. 장난이다. 아프다.',
            bug:'손끝을 맴돌다 다시 앉는다. 그것이 노는 것이다.' },
    wash: { dog:'물을 보자마자 도망간다. 잡히고 나서는 가만히 있는다.',
            cat:'젖은 수건까지는 봐준다. 그 이상은 안 된다.',
            bird:'물을 끼얹자 온몸을 털어 당신까지 젖는다.',
            water:'제일 좋아한다. 안 나오려 한다.',
            rept:'미지근한 물에 몸을 담그고 눈을 감는다.',
            small:'모래를 끼얹어 주자 데굴데굴 구른다.',
            bear:'물소리가 크다. 바닥이 다 젖는다.',
            hoof:'발굽을 하나씩 닦아 준다. 얌전히 내어 준다.',
            bug:'물방울 하나로 끝난다. 날개가 다시 환해진다.' }
};
function kindOf(key) {
    try { return (window.PETTALK && window.PETTALK.KIND[key]) || 'small'; } catch (e) { return 'small'; }
}
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

function appealView(o) {
    const me = u_();
    const owner = userOf(o.owner);
    if (!me) return;
    const nm = (owner ? nickOf(owner, o.pet) : (P().BY[o.pet] || {}).n) || '펫';
    const need = Number(o.need) || NEED_BASE;
    const kind = kindOf(o.pet);
    const st = { score: Number(o.score) || 0, used: Object.assign({}, o.used || {}),
                 says: Number(o.says) || 0, over: false };

    const w = box(head(nm + '에게 어필합니다',
        (o.k === 'give'
            ? ('<b style="color:#ffcf8f;">' + esc(o.ownerName) + '</b> 사원이 ' + esc(nm)
               + josa(nm, '을') + ' 보내려 합니다.')
            : ('<b style="color:#ffcf8f;">' + esc(o.ownerName) + '</b> 사원이 승낙했습니다.'))
        + '<br>' + esc(nm) + '의 마음을 <b>' + need + '</b>만큼 얻어야 옵니다.<br>'
        + '밥·놀기·씻기기는 한 번씩, 말은 ' + SAY_MAX + '번까지입니다.')
        + '<div style="text-align:center; margin-bottom:9px;">'
        + '<img src="' + P().img(o.pet) + '" alt="" style="max-width:100%; max-height:150px;"></div>'
        + '<div style="height:9px; background:#241f18; border:1px solid #3a3025; border-radius:5px;'
        + ' overflow:hidden; margin-bottom:5px;">'
        + '<div id="adp-bar" style="height:100%; width:0%;'
        + ' background:linear-gradient(90deg,#c08a3e,#ffcf8f); transition:width .3s;"></div></div>'
        + '<div id="adp-num" style="font-size:10px; color:#8d8578; text-align:right; margin-bottom:9px;">'
        + '0 / ' + need + '</div>'
        + '<div id="adp-out" style="font-size:11px; color:#ddd; line-height:1.7; min-height:40px;'
        + ' margin-bottom:9px;"></div>'
        + '<div style="display:flex; gap:5px; margin-bottom:7px;">'
        + ACTS.map(function (a) {
            return '<button class="game-btn adp-act" data-a="' + a.id + '"'
                + ' style="flex:1; margin:0; padding:9px 0; font-size:11px;">' + a.n + '</button>';
        }).join('')
        + '</div>'
        + '<div style="display:flex; gap:6px; margin-bottom:9px;">'
        + '<input id="adp-say" type="text" maxlength="20" placeholder="앉아 · 손 · 안녕 …"'
        + ' style="flex:1; min-width:0; padding:9px; font-size:12px; box-sizing:border-box;">'
        + '<button id="adp-send" class="game-btn" style="flex:0 0 auto; margin:0; padding:9px 12px;'
        + ' font-size:11px;">말한다</button></div>'
        + '<button id="adp-give" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');

    const out = w.querySelector('#adp-out');
    const bar = w.querySelector('#adp-bar');
    const num = w.querySelector('#adp-num');

    const paint = function (line) {
        bar.style.width = Math.min(100, Math.round(st.score / need * 100)) + '%';
        num.innerText = st.score + ' / ' + need;
        if (line) out.innerHTML = line;
    };
    const left = function () {
        return ACTS.filter(function (a) { return !st.used[a.id]; }).length + (SAY_MAX - st.says);
    };
    const step = function (gain, line) {
        if (st.over) return;
        st.score += gain;
        paint(line + ' <span style="color:#c08a3e;">(+' + gain + ')</span>');
        save(o._k, { score: st.score, used: st.used, says: st.says });
        if (st.score >= need) { st.over = true; setTimeout(function () { win(o, nm); }, 700); return; }
        if (left() <= 0) { st.over = true; setTimeout(function () { lose(o, nm); }, 700); }
    };

    Array.prototype.forEach.call(w.querySelectorAll('.adp-act'), function (b) {
        b.onclick = function () {
            const a = ACTS.filter(function (x) { return x.id === b.dataset.a; })[0];
            if (!a || st.used[a.id] || st.over) return;
            st.used[a.id] = 1;
            b.style.cssText += GREY;
            step(rnd(a.lo, a.hi), esc((RE[a.id] || {})[kind] || '가만히 받아 준다.'));
        };
        if (st.used[b.dataset.a]) b.style.cssText += GREY;
    });

    const say = function () {
        const el = w.querySelector('#adp-say');
        const t = String(el.value || '').trim();
        if (!t || st.over) return;
        if (st.says >= SAY_MAX) { paint('<span style="color:#8d8578;">더는 말이 통하지 않습니다.</span>'); return; }
        st.says++;
        el.value = '';
        let got = null;
        try { got = window.PETTALK ? window.PETTALK.find(t) : null; } catch (e) { got = null; }
        if (got) {
            const line = (got.r && got.r[kind]) || '가만히 본다.';
            step(rnd(12, 24), '「' + esc(t) + '」 — ' + esc(line));
        } else {
            step(rnd(2, 8), '「' + esc(t) + '」 — <span style="color:#8d8578;">'
                + esc(nm) + josa(nm, '이') + ' 고개를 갸웃합니다.</span>');
        }
    };
    w.querySelector('#adp-send').onclick = say;
    w.querySelector('#adp-say').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') say();
    });
    w.querySelector('#adp-give').onclick = function () {
        save(o._k, { stage: 'no', why: 'quit' });
        shut();
    };
    paint('');
}

// ==========================================
// ⑤ 끝 — 펫을 옮긴다
// ==========================================
function win(o, nm) {
    const me = u_();
    const owner = userOf(o.owner);
    if (!me) return;
    const key = String(o.pet);
    const src = owner ? petOf(owner, key) : null;
    const pet = Object.assign({}, src || { g: 'D' }, {
        at: Date.now(), fedAt: Date.now(), bond: 0, bd: null,
        pat: 0, play: 0, with: 0, out: 0, rest: 0,
        nameOk: 1                                   // 받은 사람이 새로 이름을 붙인다
    });

    // 주인 쪽에서 떼고 내 쪽에 붙인다 — 칸 하나씩만 건드린다
    const show = (owner && Array.isArray(owner.petShow))
        ? owner.petShow.filter(function (x) { return String(x) !== key; }) : null;
    const up = {};
    up['users/' + o.owner + '/pets/' + key] = null;
    up['users/' + o.owner + '/petGaveAt'] = Date.now();
    if (show) up['users/' + o.owner + '/petShow'] = show;
    up['users/' + me.code + '/pets/' + key] = pet;
    if (db_()) { try { db_().ref('/').update(up); } catch (e) { console.warn('[입양]', e); } }

    // 내 화면도 바로 맞춘다
    try { P().pets(me)[key] = pet; } catch (e) { }
    if (owner) { try { delete P().pets(owner)[key]; } catch (e) { } }
    try { if (typeof addHistoryLog === 'function') {
        addHistoryLog(me, '[입양] ' + o.ownerName + ' 사원에게서 ' + nm + josa(nm, '을') + ' 데려왔습니다.');
    } } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

    save(o._k, { stage: 'done', score: Number(o.need) || NEED_BASE });

    const w = box(head(nm + josa(nm, '이') + ' 따라왔습니다',
        '마음을 얻었습니다. 이제 ' + esc(nm) + josa(nm, '은') + ' 당신의 펫입니다.<br>'
        + '<b>이름을 한 번 새로 붙일 수 있습니다.</b> 그 뒤로는 상담사의 개명권이 있어야 합니다.')
        + '<div style="text-align:center; margin-bottom:10px;">'
        + '<img src="' + P().img(key) + '" alt="" style="max-width:100%; max-height:170px;"></div>'
        + '<input id="adp-nick" type="text" maxlength="' + P().NICK_MAX + '"'
        + ' placeholder="' + esc((P().BY[key] || {}).n || '') + '" value="' + esc(nm) + '"'
        + ' style="width:100%; padding:10px; font-size:13px; margin-bottom:9px; box-sizing:border-box;">'
        + '<button id="adp-ok" class="game-btn" style="' + BTN + '">이 이름으로 한다</button>'
        + '<button id="adp-skip" class="game-btn" style="' + BTN + GREY + '">나중에 붙인다</button>');

    w.querySelector('#adp-ok').onclick = function () {
        const v = w.querySelector('#adp-nick').value;
        const r = P().rename(key, v);
        if (!r || !r.ok) { alert_((r && r.why) || '붙이지 못했습니다.'); return; }
        shut();
        alert_('이제 ' + r.name + '입니다.');
    };
    w.querySelector('#adp-skip').onclick = shut;
}

function lose(o, nm) {
    save(o._k, { stage: 'no', why: 'fail' });
    box(head(nm + josa(nm, '은') + ' 가지 않았습니다',
        '손이 다 떨어졌는데 마음이 모자랐습니다.<br>'
        + esc(nm) + josa(nm, '은') + ' 원래 자리에 그대로 있습니다.')
        + '<button id="adp-no" class="game-btn" style="' + BTN + GREY + '">닫는다</button>')
        .querySelector('#adp-no').onclick = shut;
}

// ==========================================
// 지켜보기 · 치우기
// ==========================================
setInterval(function () {
    if (!u_() || !db_()) return;
    watch();
    try { paintAsk(); } catch (e) { }
}, 3000);

// 묵은 글은 상담사가 들어와 있을 때 치운다
setInterval(function () {
    const me = u_();
    if (!me || me.code !== 'kario0987' || !db_()) return;
    const t = Date.now();
    const del = {};
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!o) return;
        if (o.stage === 'done' || o.stage === 'no' || t - Number(o.at || 0) > LIVE) del[k] = null;
    });
    if (Object.keys(del).length) ref().update(del);
}, 300000);

// ==========================================
// 콘솔
// ==========================================
window.petAdoptState = function () {
    const me = u_();
    console.log('%c===== 펫 입양 =====', 'color:#ffcf8f; font-size:13px');
    if (!me) { console.log('  로그인 후에 쓰세요.'); return; }
    const l = giveLeft(me);
    console.log('  보내기 : ' + (l > 0 ? (leftText(l) + ' 뒤에 됩니다') : '지금 됩니다')
        + (noGap(me) ? ' (상담사 — 날짜 제한 없음)' : ' (사흘에 한 번)'));
    console.log('  ' + TICKET + ' : ' + ticketCount(me) + '장'
        + ' (물품 등록 ' + ((typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[TICKET]) ? 'O' : '✗')
        + ' · 쓰기 연결 '
        + ((typeof useInventoryItem === 'function' && useInventoryItem._petTicket) ? 'O' : '✗') + ')');
    const rows = [];
    Object.keys(live).forEach(function (k) {
        const o = live[k];
        if (!o) return;
        rows.push({ 갈래: o.k === 'give' ? '보내기' : '신청', 주인: o.ownerName, 상대: o.otherName,
                    펫: o.pet, 단계: o.stage, 마음: (o.score || 0) + ' / ' + (o.need || '?'),
                    때: new Date(Number(o.at) || 0).toLocaleTimeString() });
    });
    if (rows.length) console.table(rows); else console.log('  걸려 있는 입양이 없습니다.');
    const ps = (function () { try { return P().pets(me); } catch (e) { return {}; } })();
    const mine2 = Object.keys(ps).map(function (k) {
        return { 펫: nickOf(me, k), 교감: bondOf(me, k),
                 '이름 붙일 수 있나': canName(me, k) ? 'O' : '✗' };
    });
    if (mine2.length) console.table(mine2);
};

// ==========================================
// 🐾 펫 이름 개명권 — 사원명 변경권과 같은 꼴
// ==========================================
(function regTicket() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[TICKET] = {
            price: 0, usable: true, targetable: false, effect: 'pet_rename_ticket', noSell: true,
            desc: '펫 이름을 한 번 다시 붙인다. 쓰면 펫을 고르는 창이 뜬다. 쓰면 사라진다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(TICKET) < 0) {
            NO_SELL_ITEMS.push(TICKET);
        }
        console.log('[입양] ' + TICKET + ' 등록 — 상담사 지급 전용');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 소지품에서 쓰면 — 펫을 고르고 이름을 다시 붙인다
window.petTicketUse = function () {
    const me = u_();
    if (!me) return;
    if (ticketCount(me) <= 0) { alert_('해당 물품이 없습니다.'); return; }
    const ps = (function () { try { return P().pets(me) || {}; } catch (e) { return {}; } })();
    const keys = Object.keys(ps).filter(function (k) { return P().BY[k]; });
    if (!keys.length) { alert_('이름을 붙일 펫이 없습니다.'); return; }

    const w = box(head('펫 이름 개명권',
        '이름을 다시 붙일 펫을 고르십시오. 쓰면 개명권 한 장이 사라집니다.<br>'
        + '가진 개명권 <b style="color:#ffcf8f;">' + ticketCount(me) + '장</b>')
        + '<div style="max-height:40dvh; overflow-y:auto; margin-bottom:9px;">'
        + keys.map(function (k) {
            return '<button class="game-btn pt-one" data-k="' + esc(k) + '"'
                + ' style="width:100%; margin:0 0 5px 0; padding:9px; font-size:11px;'
                + ' text-align:left; display:flex; align-items:center; gap:8px;">'
                + '<img src="' + P().icon(k) + '" alt="" style="width:26px; height:26px;'
                + ' object-fit:contain; image-rendering:pixelated;">'
                + esc(nickOf(me, k)) + '</button>';
        }).join('')
        + '</div>'
        + '<button id="pt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    w.querySelector('#pt-no').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.pt-one'), function (btn) {
        btn.onclick = function () { ticketName(btn.dataset.k); };
    });
};

function ticketName(key) {
    const me = u_();
    if (!me) return;
    const now = nickOf(me, key);
    const w = box(head('이름을 다시 붙입니다',
        esc((P().BY[key] || {}).n || '') + ' · ' + P().NICK_MAX + '자까지.<br>'
        + '비워 두면 종 이름으로 돌아갑니다.')
        + '<input id="pt-in" type="text" maxlength="' + P().NICK_MAX + '"'
        + ' value="' + esc(now) + '" placeholder="' + esc((P().BY[key] || {}).n || '') + '"'
        + ' style="width:100%; padding:10px; font-size:13px; margin-bottom:9px; box-sizing:border-box;">'
        + '<button id="pt-ok" class="game-btn" style="' + BTN + '">붙인다</button>'
        + '<button id="pt-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    const f = w.querySelector('#pt-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 90);
    const go = function () {
        const r = P().rename(key, f.value);        // 여기서 개명권이 한 장 빠진다
        if (!r || !r.ok) { alert_((r && r.why) || '붙이지 못했습니다.'); return; }
        shut();
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        alert_('이제 ' + r.name + '입니다.');
    };
    w.querySelector('#pt-ok').onclick = go;
    w.querySelector('#pt-no').onclick = shut;
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._petTicket) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== TICKET) return _u.apply(this, arguments);
            // 확인 창을 먼저 거친다 (사원명 변경권과 같은 길)
            if (window._invOk !== TICKET) return _u.apply(this, arguments);
            window._invOk = null;
            const me = u_();
            if (!me) return;
            if (typeof isQuarantined === 'function' && isQuarantined(me)) {
                alert_('여우 상담실 격리 중에는 소지품을 사용할 수 없습니다.'); return;
            }
            window.petTicketUse();
        };
        useInventoryItem._petTicket = true;
        clearInterval(iv);
        console.log('[입양] ' + TICKET + ' 쓰기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 상담사 — 꽂아 준다 (renameGive 와 같은 꼴)
window.petRenameGive = function (who, n) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = users();
    const t = who ? Object.keys(all).map(function (c) { return all[c]; })
        .filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0]
        : me;
    if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(5, Number(n) || 1));
    if (!Array.isArray(t.inventory)) t.inventory = [];
    for (let i = 0; i < q; i++) t.inventory.push(TICKET);
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(t, '[당국 개입] ' + TICKET + ' ' + q + '장 지급');
    }
    if (typeof updateUserFields === 'function') {
        updateUserFields(t.code, { inventory: t.inventory, history: t.history });
    }
    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + t.name + ' 사원에게 ' + TICKET + ' ' + q + '장을 줬습니다.',
        'color:#4CAF50');
};
// 예전 이름 — 쓰던 사람이 있을 수 있어 남겨 둔다
window.petNameTicket = function (who, n) { return window.petRenameGive(who, n); };

window.petAdoptClear = function () {
    const me = u_();
    if (!me || me.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!db_()) return;
    ref().set(null);
    console.log('입양 글을 전부 치웠습니다.');
};

console.log('[입양] petAdoptState() · petRenameGive(사번, 장수) · petAdoptClear()');

})();
