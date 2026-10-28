// ==========================================
// ★ 소지품 · 장착이 줄어들 때마다 「어디서 · 왜」를 적어 둔다 — 사라진 물건을 쫓는 자리
// bundles.json 마지막 묶음 맨 끝 (use-once.js · save-merge.js 뒤)
// ==========================================
//
//   「사원증 뱃지 · 버터 나이프 · 보안팀 의상 세트가 사라진다」 — 운영 자료를 못 보니
//   사라지는 순간을 그 화면이 스스로 적게 한다.
//
//   ① removeItemFromInventory 를 감싸 부른 자리(함수 이름 몇 단)와 그때 상황(어둠 · K 의 방 · 화면)을 적는다
//   ② 0.5초마다 내 소지품 · 장착을 세어, ①을 거치지 않고 줄어든 것(통째 덮어쓰기 · 서버에서 내려온 값)도 적는다
//   ③ 서버의 내 소지품이 내 화면보다 적게 바뀐 것(남의 화면 · 상담사 화면이 쓴 것)도 적는다
//
//   users/<사번>/invLog 에 마지막 40줄 — { at, what: [이름], n, how, where, run, by }
//     how   'remove'(①) · 'shrink'(②) · 'server'(③)
//     where 부른 자리 (①) — 함수 이름 몇 단
//     run   그때 탐사 (구역 · K의 방 · EPIC) 또는 ''
//
//   invWhy(사번·이름·사원번호?, 물건 이름?)   그 줄들을 읽기 좋게 — 상담사는 남의 것도 · 물건 이름을 주면 그 줄만
//   줄마다 dev (이 브라우저의 짧은 표 · 폰/PC) 가 붙는다 — 두 기기를 번갈아 쓰는 사원의 줄을 가른다

(function invWhy() {
'use strict';

const KEEP = 40;
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function count(arr) { const c = {}; (Array.isArray(arr) ? arr : []).forEach(function (x) { c[x] = (c[x] || 0) + 1; }); return c; }
function diffLost(before, after) {
    const a = count(before), b = count(after), out = [];
    Object.keys(a).forEach(function (k) { const d = a[k] - (b[k] || 0); for (let i = 0; i < d; i++) out.push(k); });
    return out;
}
function runTag() {
    try {
        if (typeof darkRun !== 'undefined' && darkRun) return darkRun.kroom ? 'K의 방' : darkRun.epic ? 'EPIC' : String(darkRun.zone || '어둠') + (darkRun._dead ? ' · 죽음' : '');
    } catch (e) { }
    try { if (typeof window.kroomOn === 'function' && window.kroomOn()) return 'K의 방'; } catch (e) { }
    return '';
}
function screenTag() {
    try {
        const t = document.querySelector('.tab-content.active'); const s = document.querySelector('#tab-record .sub-panel.active');
        return (document.getElementById('plaza-ov') ? '광장' : (t ? t.id : '')) + (s ? '/' + s.id : '');
    } catch (e) { return ''; }
}
function where() {
    try {
        const st = String(new Error().stack || '').split('\n').slice(2, 16)
            .map(function (l) { const m = l.match(/at (?:window\.)?([A-Za-z0-9_$.<>]+)/); return m ? m[1] : ''; })
            .filter(function (x, i, a) { return x && a.indexOf(x) === i && !/^(Object|Array|Function|Promise|HTMLElement|HTMLButtonElement|invWhy|rmHook|<anonymous>)/.test(x); });
        return st.slice(0, 6).join(' < ');
    } catch (e) { return ''; }
}
// 이 브라우저의 짧은 표 — 두 기기에서 번갈아 쓰는 사원의 줄을 가른다 (2026-10-29)
let DEV = '';
try { DEV = localStorage.getItem('invDev') || ''; if (!DEV) { DEV = Math.random().toString(36).slice(2, 6); localStorage.setItem('invDev', DEV); } } catch (e) { DEV = 'x'; }
DEV += /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '') ? '·폰' : '·PC';
let busy = false;
function put(line) {
    const u = u_(); if (!u) return;
    if (!Array.isArray(u.invLog)) u.invLog = [];
    line.dev = DEV;
    u.invLog.push(line);
    while (u.invLog.length > KEEP) u.invLog.shift();
    try { if (typeof saveFields === 'function' && !busy) { busy = true; setTimeout(function () { busy = false; try { saveFields({ invLog: 1 }); } catch (e) { } }, 800); } } catch (e) { }
    console.log('[소지품 추적] ' + line.how + ' — ' + line.what.join(', ') + (line.where ? ' @ ' + line.where : '') + (line.run ? ' (' + line.run + ')' : ''));
}

// ① 빼는 함수를 감싼다 — 내 것만
let lastInv = null, lastEq = null, lastOwn = null;
function snap() { const u = u_(); if (!u) return; lastInv = (u.inventory || []).slice(); lastEq = (u.equippedWeapons || []).slice(); }
(function hookRemove() {
    const iv = setInterval(function () {
        if (typeof removeItemFromInventory !== 'function' || removeItemFromInventory._invWhy) return;
        const _r = removeItemFromInventory;
        const w = function rmHook(user, itemName, qty) {
            const u = u_();
            const mine = !!(u && user && user.code === u.code);
            const before = mine ? (user.inventory || []).slice() : null;
            const out = _r.apply(this, arguments);
            try {
                if (mine) {
                    const lost = diffLost(before, user.inventory || []);
                    if (lost.length) put({ at: Date.now(), what: lost, n: lost.length, how: 'remove', where: where(), run: runTag(), scr: screenTag() });
                    snap();
                }
            } catch (e) { }
            return out;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._invWhy = true;
        removeItemFromInventory = w; try { window.removeItemFromInventory = w; } catch (e) { }
        clearInterval(iv);
    }, 500);
})();

// ② 감싼 함수를 안 거치고 줄어든 것
setInterval(function () {
    try {
        const u = u_(); if (!u) return;
        if (!lastInv) { snap(); return; }
        if (lastOwn !== u.code) { lastOwn = u.code; snap(); return; }
        const inv = u.inventory || [], eq = u.equippedWeapons || [];
        const li = diffLost(lastInv, inv), le = diffLost(lastEq, eq);
        // 장착했다가 소지품으로 · 소지품에서 장착으로 간 것은 사라진 것이 아니다
        const gotInv = diffLost(inv, lastInv), gotEq = diffLost(eq, lastEq);
        const lostInv = li.filter(function (x) { const i = gotEq.indexOf(x); if (i >= 0) { gotEq.splice(i, 1); return false; } return true; });
        const lostEq = le.filter(function (x) { const i = gotInv.indexOf(x); if (i >= 0) { gotInv.splice(i, 1); return false; } return true; });
        if (lostInv.length) put({ at: Date.now(), what: lostInv, n: lostInv.length, how: 'shrink', where: '', run: runTag(), scr: screenTag() });
        if (lostEq.length) put({ at: Date.now(), what: lostEq, n: lostEq.length, how: 'unequip', where: '', run: runTag(), scr: screenTag() });
        snap();
    } catch (e) { }
}, 500);

// ③ 서버의 내 소지품이 줄었다 — 남의 화면(상담사 · 남이 쓴 물건)이 쓴 것
(function watchServer() {
    let code = '', ref = null, cb = null, prev = null;
    setInterval(function () {
        const u = u_(), d = db_();
        if (!u || !u.code || !d || code === u.code) return;
        try { if (ref && cb) ref.off('value', cb); } catch (e) { }
        code = u.code; prev = null;
        ref = d.ref('users/' + code + '/inventory');
        cb = function (s) {
            const v = s.val(); const arr = Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []);
            if (prev) {
                const lost = diffLost(prev, arr);
                const mine = u_() ? (u_().inventory || []) : [];
                // 내 화면에는 아직 있는데 서버에서만 빠졌다 — 남이 썼거나 통째 덮어쓰기
                const odd = lost.filter(function (x) { return count(mine)[x] > (count(arr)[x] || 0); });
                if (odd.length) put({ at: Date.now(), what: odd, n: odd.length, how: 'server', where: '', run: runTag(), scr: screenTag(), by: '서버에서 내려옴 (내 화면보다 적다)' });
            }
            prev = arr.slice();
        };
        ref.on('value', cb);
    }, 1500);
})();

// invWhy('사번' | '이름' | 사원번호 [, '물건 이름'])  — 물건 이름을 주면 그 물건이 든 줄만
window.invWhy = function (who, item) {
    const u = u_(); if (!u) return;
    let t = u;
    if (who && who !== u.code) {
        try {
            const book = (typeof db !== 'undefined' && db && db.users) ? db.users : {};
            const c = Object.keys(book).filter(function (k) { const x = book[k] || {}; return k === who || String(x.no) === String(who) || x.name === who; })[0];
            t = c ? book[c] : null;
        } catch (e) { t = null; }
    }
    if (!t) { console.log('그 사원을 찾지 못했습니다.'); return; }
    let L = Array.isArray(t.invLog) ? t.invLog : [];
    if (item) L = L.filter(function (l) { return (l.what || []).some(function (w) { return String(w).replace(/\s+/g, '').indexOf(String(item).replace(/\s+/g, '')) >= 0; }); });
    console.log('%c===== 소지품 추적 — ' + (t.name || t.code) + ' (' + L.length + '줄' + (item ? ' · ' + item : '') + ') =====', 'color:#ffcc80; font-size:13px');
    console.log('  어떻게: remove = 빼는 함수가 뺐다(어디서 = 부른 자리) · shrink = 빼는 함수를 안 거치고 줄었다(통째 덮어쓰기 · 다른 기기나 남의 화면이 서버에서 뺀 것이 내려옴) · server = 서버에서만 줄었다(내 화면에는 아직 있었다) · unequip = 장착에서 빠짐');
    if (!L.length) { console.log('  적힌 것이 없습니다.'); return; }
    console.table(L.slice().reverse().map(function (l) {
        return { 때: new Date(l.at).toLocaleString(), 어떻게: l.how, 무엇: (l.what || []).join(', '), 어디서: l.where || l.by || '', 기기: l.dev || '', 탐사: l.run || '', 화면: l.scr || '' };
    }));
};

})();
