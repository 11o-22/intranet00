// ==========================================
// ★ 특수 제거약 — 우주 쇼핑몰 · 400,000 P (2026-11-02 사용자)
// bundles.json 마지막 묶음 끝 (cure-fix · sticker-fix · save-merge · admin-clear 보다 뒤)
// ==========================================
//
//   「물약 효과 및 자신과 타인에게 걸린 상태이상을 선택하여 지울 수 있다.」
//   소속 상관없이 누구에게나 우주 쇼핑몰 후보로 뜬다 (EQUIP_AFFIL · 진열 거름 목록에 안 넣는다).
//
//   제거약(4,000 P)은 물약 효과 · 노예 계약 가운데 하나를 무작위로 푼다 (cure-fix.js).
//   이것은 걸린 것을 다 늘어놓고 **골라서**(여럿도) 지운다. 고정된 것(투명 물약)도 풀린다.
//
//   고를 수 있는 것 — 지금 걸려 있는 것만 보인다
//     · 걸린 효과(timedEffects) 하나하나 — 물약 · 아이의 운 · 유리구슬 …
//     · 노예 계약 (영구 포함)            · 안대 · 해피 메이커 (오염도 미증가)
//     · 노스텔지어 끈 (지우면 그 자리에서 끝난 것으로 — 끈은 건 사람에게 돌아간다)
//     · 탈모약 · 포만감 고정 (최음제) · 오염 동결
//   안 넣은 것 — 격리(상담실 · 선녀탕) · 감금실 · 가두리는 「갇힌 자리」라 풀어 주는 규칙이 따로 있다.
//     은반지 · 버터칼은 장비 기한 · 달빛 · 은화 뱀 · 봉제 인형 같은 물건 버프는 상태이상이 아니라 뺐다.
//
//   쓰는 길 — 소지품의 「사용」(나) · 「타인에게 사용」(남) 둘 다 applyItemEffect 로 온다.
//   여기서 가로채 고르는 창을 띄우고 false 를 돌려준다 (그 자리에서는 안 쓴다).
//   고르고 「지운다」를 누르면 그때 지우고 약을 하나 쓴다 (투명 물약 sticker-fix.js 와 같은 길).
//
//   저장 — 걸린 효과는 save-merge 의 「통째로 비면 안 지운다」 그물에 걸리지 않게
//   users/<사번>/timedEffects 에 이름으로 골라 빼는 트랜잭션을 바로 건다. 다 비면 「일부러 비웠다」
//   도장(effClearAt)을 찍어 켜 둔 화면도 따라 비운다 (admin-clear.js 와 같은 까닭).
//
//   콘솔  scureState(사번)  — 지금 고를 수 있는 것

(function specialCure() {
'use strict';

const NAME = '특수 제거약';
const EFFECT = 'special_cure';
const PRICE = 400000;
const DESC = '물약 효과 및 자신과 타인에게 걸린 상태이상을 선택하여 지울 수 있다.';
const SEP = ' | ', NONE = '특이사항 없음';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { showCustomAlert(t); } catch (e) { alert(t); } }
function log_(u, t) { try { addHistoryLog(u, t); } catch (e) { } }

// ==========================================
// 물품 등록 — 우주 쇼핑몰 후보 (소속 무관)
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || typeof ALIEN_ITEMS_POOL === 'undefined') return;
        ITEM_CATALOG[NAME] = { price: PRICE, usable: true, targetable: true, effect: EFFECT, desc: DESC };
        if (ALIEN_ITEMS_POOL.indexOf(NAME) < 0) ALIEN_ITEMS_POOL.push(NAME);
        try { if (typeof EQUIP_AFFIL !== 'undefined') delete EQUIP_AFFIL[NAME]; } catch (e) { }
        clearInterval(iv);
        console.log('[특수 제거약] 우주 쇼핑몰 등록');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 걸린 것 늘어놓기
// ==========================================
function leftTxt(until) {
    if (!until || until >= Number.MAX_SAFE_INTEGER / 2) return '영구';
    const m = Math.round((until - Date.now()) / 60000);
    if (m <= 0) return '곧 끝남';
    if (m < 60) return m + '분 남음';
    return Math.floor(m / 60) + '시간 ' + (m % 60) + '분 남음';
}
const FIELD = [
    { k: 'blind',  f: 'blindfoldUntil',  n: '안대 · 해피 메이커', d: '오염도가 오르지 않는다' },
    { k: 'nostal', f: 'nostalgiaUntil',  n: '노스텔지어 끈',      d: '오염도가 서서히 줄어든다 — 지우면 끈은 건 사람에게 돌아간다' },
    { k: 'hair',   f: 'hairUntil',       n: '탈모약',             d: '', note: '[탈모약]' },
    { k: 'sat',    f: 'satHoldUntil',    n: '포만감 고정 (최음제)', d: '' },
    { k: 'freeze', f: 'pollFreezeUntil', n: '오염 동결',          d: '' }
];
function listOf(u) {
    const out = [], now = Date.now(), seen = {};
    if (!u) return out;
    (Array.isArray(u.timedEffects) ? u.timedEffects : []).forEach(function (e) {
        if (!e || !e.name) return;
        const n = String(e.name).trim();
        if (seen[n]) return;                       // 같은 이름은 한 줄 (지울 때 같은 이름은 다 지운다)
        if (!e.fixed && e.expireAt && e.expireAt <= now) return;
        seen[n] = 1;
        out.push({ key: 'e:' + n, n: n, d: e.desc || '', t: e.fixed ? '고정' : leftTxt(e.expireAt) });
    });
    if (u.slaveFixed || (Number(u.slaveUntil) || 0) > now) {
        let mn = '';
        try { mn = u.masterName || (u.slaveMaster && db.users[u.slaveMaster] && db.users[u.slaveMaster].name) || ''; } catch (e) { }
        out.push({ key: 'slave', n: '노예 계약', d: mn ? mn + ' 사원과' : '', t: u.slaveFixed ? '영구' : leftTxt(u.slaveUntil) });
    }
    FIELD.forEach(function (x) {
        const v = Number(u[x.f]) || 0;
        if (v > now) out.push({ key: x.k, n: x.n, d: x.d, t: leftTxt(v) });
    });
    return out;
}
window.scureList = listOf;

// ==========================================
// 지우기 — 사람 하나(u)의 사본을 고친다. 고친 칸을 돌려준다.
// ==========================================
function stripNotes(u, keys) {
    if (!u.badge || !u.badge.notes || !keys.length) return false;
    const arr = String(u.badge.notes).split(SEP).filter(function (n) {
        if (!n.trim() || n.trim() === NONE) return false;
        return !keys.some(function (k) { return n.indexOf(k) >= 0; });
    });
    const next = arr.length ? arr.join(SEP) : NONE;
    if (next === u.badge.notes) return false;
    u.badge.notes = next;
    return true;
}
function applyTo(u, keys) {
    const now = Date.now();
    // (아래에서 걸린 효과를 뺐으면 「푼 자국」을 남긴다 — pot-keep.js 가 되살리지 않게)
    const fields = {}, names = [], effNames = [], noteKeys = [];
    keys.forEach(function (key) {
        if (key.indexOf('e:') === 0) {
            const n = key.slice(2);
            effNames.push(n); names.push(n); noteKeys.push(n);
            return;
        }
        if (key === 'slave') {
            u.slaveUntil = 0; u.slaveFixed = false; u.masterName = null; u.slaveMaster = null;
            fields.slaveUntil = 0; fields.slaveFixed = false; fields.masterName = null; fields.slaveMaster = null;
            names.push('노예 계약'); noteKeys.push('노예 계약');
            return;
        }
        const x = FIELD.filter(function (f) { return f.k === key; })[0];
        if (!x) return;
        // 노스텔지어 끈은 「막 끝난 것」으로 둔다 — 원래 끝나는 길이 끈을 건 사람에게 돌려준다 (index.html checkPassivePollution)
        const v = (key === 'nostal') ? now - 1 : 0;
        u[x.f] = v; fields[x.f] = v;
        names.push(x.n);
        if (x.note) noteKeys.push(x.note);
    });
    if (effNames.length && Array.isArray(u.timedEffects)) {
        u.timedEffects = u.timedEffects.filter(function (e) { return !(e && effNames.indexOf(String(e.name || '').trim()) >= 0); });
    }
    if (stripNotes(u, noteKeys)) fields.badge = u.badge;
    if (effNames.length) {                                  // 푼 자국 — pot-keep.js 가 「까닭 없이 사라졌다」고 되살리지 않게
        u.effCure = { name: effNames[0], names: effNames.slice(), at: now };
        fields.effCure = u.effCure;
    }
    return { fields: fields, names: names, effNames: effNames };
}
// 걸린 효과 — 서버에서 이름으로 골라 뺀다 (다 비면 도장)
function effTx(code, effNames) {
    const d = db_();
    if (!d || !effNames.length) return Promise.resolve();
    return d.ref('users/' + code + '/timedEffects').transaction(function (cur) {
        if (!cur) return cur;
        const arr = Array.isArray(cur) ? cur : Object.keys(cur).map(function (k) { return cur[k]; });
        return arr.filter(function (e) { return !(e && effNames.indexOf(String(e.name || '').trim()) >= 0); });
    }).then(function (res) {
        const v = res && res.snapshot ? res.snapshot.val() : null;
        const left = Array.isArray(v) ? v.length : (v ? Object.keys(v).length : 0);
        if (!left) return d.ref('users/' + code + '/effClearAt').set(Date.now());
    }).catch(function (e) { console.warn('[특수 제거약] 효과 지우기 실패', e); });
}

// ==========================================
// 고르는 창
// ==========================================
function openPicker(target, isOthers) {
    const list = listOf(target);
    if (!list.length) {
        alert_(isOthers ? (target.name || '') + ' 사원에게 걸린 것이 없습니다.' : '걸린 것이 없습니다.');
        return;
    }
    const old = document.getElementById('scure-modal');
    if (old) old.remove();
    const w = document.createElement('div');
    w.id = 'scure-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:14px;';
    const rows = list.map(function (x, i) {
        return '<label style="display:flex; gap:9px; align-items:flex-start; padding:8px 4px; border-top:1px solid rgba(255,255,255,0.07); cursor:pointer;">'
            + '<input type="checkbox" data-i="' + i + '" style="margin-top:2px; width:16px; height:16px; flex:none;">'
            + '<div style="flex:1; min-width:0;"><div style="font-size:12px; color:#eef3ff;">' + esc(x.n)
            + ' <span style="font-size:10px; color:#8fb4d8;">· ' + esc(x.t) + '</span></div>'
            + (x.d ? '<div style="font-size:10.5px; color:#9aa6b8; margin-top:2px; word-break:keep-all;">' + esc(x.d) + '</div>' : '')
            + '</div></label>';
    }).join('');
    w.innerHTML = '<div style="width:100%; max-width:380px; max-height:86vh; overflow:auto; background:#141a24; border:1px solid #3a5878; border-radius:8px; padding:14px 14px 12px; box-shadow:0 8px 30px rgba(0,0,0,0.6);">'
        + '<div style="font-size:14px; font-weight:bold; color:#9fd8ff;">💊 ' + NAME + '</div>'
        + '<div style="font-size:11px; color:#b7c4d8; margin:4px 0 8px;">' + (isOthers ? esc(target.name || '') + ' 사원에게' : '나에게') + ' 걸린 것 — 지울 것을 고르세요.</div>'
        + '<label style="display:flex; gap:9px; align-items:center; padding:4px; font-size:11px; color:#cfd8e6; cursor:pointer;"><input type="checkbox" id="scure-all" style="width:15px; height:15px;"> 모두 고르기</label>'
        + rows
        + '<div style="display:flex; gap:8px; margin-top:12px;">'
        + '<button id="scure-go" class="game-btn" style="flex:1; padding:9px 0; background:#2a5a8a; color:#fff; border:none; border-radius:5px; font-size:12px;">지운다</button>'
        + '<button id="scure-no" class="game-btn" style="flex:1; padding:9px 0; background:#3a3f48; color:#ddd; border:none; border-radius:5px; font-size:12px;">그만둔다</button>'
        + '</div></div>';
    document.body.appendChild(w);
    const boxes = Array.prototype.slice.call(w.querySelectorAll('input[data-i]'));
    w.querySelector('#scure-all').onchange = function () { const on = this.checked; boxes.forEach(function (b) { b.checked = on; }); };
    w.querySelector('#scure-no').onclick = function () { w.remove(); };
    w.querySelector('#scure-go').onclick = function () {
        const keys = boxes.filter(function (b) { return b.checked; }).map(function (b) { return list[Number(b.getAttribute('data-i'))].key; });
        if (!keys.length) { alert_('지울 것을 하나 이상 고르세요.'); return; }
        this.disabled = true;
        w.remove();
        commit(target.code, keys, isOthers);
    };
}

// ==========================================
// 지우고 약을 쓴다
// ==========================================
let busy = false;
function commit(code, keys, isOthers) {
    const u0 = me();
    if (!u0 || busy) return;
    if ((u0.inventory || []).indexOf(NAME) < 0) { alert_('해당 물품이 없습니다.'); return; }
    busy = true;
    const done = function () { busy = false; };
    const self = !isOthers || code === u0.code;

    if (self) {
        const r = applyTo(u0, keys);
        try { removeItemFromInventory(u0, NAME, 1); } catch (e) { }
        log_(u0, '[' + NAME + '] ' + r.names.join(' · ') + ' — 씻겨 나갔습니다.');
        const save = { history: 1, inventory: 1 };
        Object.keys(r.fields).forEach(function (k) { save[k] = 1; });
        if (r.effNames.length) save.timedEffects = 1;
        effTx(u0.code, r.effNames).then(function () {
            try { if (typeof saveFields === 'function') saveFields(save); else saveSelfFull(); } catch (e) { }
            try { updateUI(); } catch (e) { }
            alert_('[' + NAME + ']\n\n' + r.names.join('\n') + '\n\n— 지워졌습니다.');
            done();
        });
        return;
    }

    // 남 — 서버에서 새로 읽어 그 위에 고친다
    const d = db_();
    const go = function (t) {
        if (!t) { alert_('대상 사원 정보를 불러오지 못했습니다.'); done(); return; }
        t.code = t.code || code;
        if (!Array.isArray(t.history)) t.history = t.history ? Object.keys(t.history).map(function (k) { return t.history[k]; }) : [];
        if (!Array.isArray(t.timedEffects)) t.timedEffects = t.timedEffects ? Object.keys(t.timedEffects).map(function (k) { return t.timedEffects[k]; }) : [];
        const have = listOf(t).map(function (x) { return x.key; });
        keys = keys.filter(function (k) { return have.indexOf(k) >= 0; });      // 그 사이 끝난 것은 뺀다
        if (!keys.length) { alert_('고른 것이 그 사이 이미 풀렸습니다.\n약은 쓰지 않았습니다.'); done(); return; }
        const r = applyTo(t, keys);
        log_(t, '[' + NAME + '] ' + (u0.name || '') + ' 사원이 ' + r.names.join(' · ') + ' — 씻어 냈습니다.');
        const f = Object.assign({}, r.fields, { history: t.history, hasItemUsedOnMe: true, _adminStamp: Date.now() });
        const jobs = [effTx(code, r.effNames)];
        if (d) jobs.push(d.ref('users/' + code).update(f));
        else { try { Object.assign(db.users[code], t); saveDB(); } catch (e) { } }
        Promise.all(jobs).then(function () {
            try { if (db.users[code]) Object.keys(r.fields).forEach(function (k) { db.users[code][k] = r.fields[k]; }); } catch (e) { }
            try { if (db.users[code] && r.effNames.length) db.users[code].timedEffects = t.timedEffects; } catch (e) { }
            try { removeItemFromInventory(u0, NAME, 1); } catch (e) { }
            log_(u0, '[아이템 사용] ' + (t.name || code) + ' 사원에게 \'' + NAME + '\' 사용 — ' + r.names.join(' · '));
            try { if (typeof saveFields === 'function') saveFields({ inventory: 1, history: 1 }); else saveSelfFull(); } catch (e) { }
            try { updateUI(); } catch (e) { }
            alert_((t.name || '') + ' 사원에게 \'' + NAME + '\'을(를) 사용했습니다.\n\n' + r.names.join('\n') + '\n\n— 지워졌습니다.');
            done();
        }).catch(function (e) { console.error('[특수 제거약]', e); alert_('저장하지 못했습니다. 약은 쓰지 않았습니다.'); done(); });
    };
    if (d) d.ref('users/' + code).once('value').then(function (s) { go(s.val()); }).catch(function () { go(null); });
    else go(db.users[code] ? JSON.parse(JSON.stringify(db.users[code])) : null);
}

// ==========================================
// 쓰는 길 — applyItemEffect 를 가로챈다
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (applyItemEffect._scure) { clearInterval(iv); return; }
        const _a = applyItemEffect;
        const w = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== EFFECT || !targetUser) return _a.apply(this, arguments);
            try { openPicker(targetUser, !!isOthers && !!me() && targetUser.code !== me().code); }
            catch (e) { console.error('[특수 제거약]', e); }
            return false;                                       // 그 자리에서는 안 쓴다 — 고른 뒤 commit 이 쓴다
        };
        Object.keys(_a).forEach(function (k) { try { w[k] = _a[k]; } catch (e) { } });
        w._scure = true;
        applyItemEffect = w;
        try { window.applyItemEffect = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();

window.scureState = function (code) {
    const u = code ? (db.users[code] || null) : me();
    console.log('%c===== ' + NAME + ' =====', 'color:#9fd8ff; font-size:13px');
    console.log('  등록:', !!(typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[NAME]), '· 우주 후보:', (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(NAME) >= 0), '· 연결:', !!(typeof applyItemEffect === 'function' && applyItemEffect._scure));
    if (u) console.table(listOf(u));
};

})();
