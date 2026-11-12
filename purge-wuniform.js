// ==========================================
// ★ 여성 교복 거두기 (2026-11-12 사용자 「기존에 사원들한테 줬던 여자 교복을 다 없애줘」)
// bundles.json 마지막 묶음 맨 끝
// ==========================================
//
// ■ 무엇을
//   선물함으로 받은 「여성 교복」(옷장 열쇠 w-uniform · 겉옷 칸 wuniform) 을 사원들에게서 걷는다.
//     옷장(wardrobe) · 입고 있던 것(dot · 색 col · 불투명도 op) · 코디 다섯 칸(dotSets) · 소지품 · 아직 안 받은 선물함.
//   돌려주는 돈은 없다 (상담사가 거저 준 옷이다).
//   옷 자체(closet.js · wear-gift.js 목록)는 그대로 둔다 — 상담사 옷장에는 늘 보이고, 이 정리 뒤에 다시 주면 그건 걷지 않는다.
//   ★ 같은 날 교복을 새 그림(분홍 셔츠 · 하늘색 치마)으로 바꿨다 — 새 교복은 열쇠 w-uniform2 · i wuniform2 라 여기서 걷지 않는다.
//
// ■ 누가 하나 — 한 사람에 딱 한 번 (purgeWuni/<사번> 를 트랜잭션으로 먼저 잡은 쪽 · purge1026.js 와 같은 길)
//   · 사원 본인 화면 — 들어와서 자료가 다 내려온 뒤 (어둠 · K 의 방 안에서는 기다린다)
//   · 상담사 화면   — 접속해 있지 않은 사원을 서버 기록으로 걷는다 · 선물함은 상담사 화면이 한 번 (purgeWuni/_global)
//   상담사 본인은 건너뛴다 (받은 사람이 아니다 · 상담사 옷장에는 늘 있다)
//
// ■ 콘솔
//   purgeWuniRun()   상담사 — 남은 사원을 지금 바로 걷는다

(function purgeWuni() {

const NODE = 'purgeWuni';
const ADMIN = 'kario0987';
const KEY = 'w-uniform';            // 옷장 열쇠 (wear-gift.js k · closet.js own)
const ID = 'wuniform';              // 겉옷 칸의 i (closet.js DOT_SLOTS)
const NAME = '여성 교복';           // 물품 이름 (선물함 · 소지품)

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function obj(v) { return (v && typeof v === 'object' && !Array.isArray(v)) ? v : null; }
function busy() {
    try { if (typeof darkRun !== 'undefined' && darkRun) return true; } catch (e) { }
    try { if (typeof window.kroomOn === 'function' && window.kroomOn()) return true; } catch (e) { }
    return false;
}
function stamp() {
    const n = new Date();
    return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0');
}

function cleanUser(u) {
    const set = {}, nul = [];
    let hit = false;
    const w = obj(u.wardrobe);
    if (w && w[KEY]) { delete w[KEY]; nul.push('wardrobe/' + KEY); hit = true; }
    const fixDot = function (d) {
        if (!obj(d)) return false;
        let ch = false;
        if (d.outer === ID) { delete d.outer; ch = true; }
        ['col', 'op'].forEach(function (f) {
            if (!obj(d[f])) return;
            [ID, KEY].forEach(function (k) { if (Object.prototype.hasOwnProperty.call(d[f], k)) { delete d[f][k]; ch = true; } });
        });
        return ch;
    };
    if (fixDot(u.dot)) { set.dot = 1; hit = true; }
    if (obj(u.dotSets)) Object.keys(u.dotSets).forEach(function (k) {
        const e = u.dotSets[k];
        if (!e || !fixDot(e.d)) return;
        if (!obj(e.d) || !Object.keys(e.d).length) delete u.dotSets[k];   // 이 옷만 담겨 있던 코디 — 칸째 비운다
        set.dotSets = 1; hit = true;
    });
    if (Array.isArray(u.inventory)) {
        const inv = u.inventory.filter(function (n) { return n !== NAME; });
        if (inv.length !== u.inventory.length) { u.inventory = inv; set.inventory = 1; hit = true; }
    }
    if (hit) {
        if (!Array.isArray(u.history)) u.history = [];
        u.history.unshift({ time: stamp(), text: '[옷장] 여성 교복이 거두어졌습니다.' });
        if (u.history.length > 10) u.history.length = 10;
        set.history = 1;
    }
    return { set: set, nul: nul, hit: hit };
}

function claim(code, by) {
    const d = db_();
    if (!d || !code) return Promise.resolve(false);
    return d.ref(NODE + '/' + code).transaction(function (cur) {
        if (cur) return;                                   // 이미 누가 했다
        return { at: Date.now(), by: by };
    }).then(function (r) { return !!(r && r.committed); }).catch(function () { return false; });
}
function note(code, r) {
    const d = db_();
    if (d && r.hit) d.ref(NODE + '/' + code).update({ took: 1 }).catch(function () { });
}

// ==========================================
// 내 것 — 내 화면이 한다
// ==========================================
let selfDone = false, selfBusy = false, selfAt = 0;
function selfRun() {
    const u = me(), d = db_();
    if (selfDone || selfBusy || !u || !u.code || !d) return;
    if (u.code === ADMIN) { selfDone = true; return; }
    if (!selfAt) { selfAt = Date.now(); return; }
    if (Date.now() - selfAt < 8000) return;                // 자료가 다 내려올 때까지
    if (busy()) return;
    selfBusy = true;
    const code = u.code;
    claim(code, 'self').then(function (ok) {
        selfBusy = false;
        selfDone = true;
        if (!ok || !me() || me().code !== code) return;
        const m = me();
        const r = cleanUser(m);
        if (!r.hit) return;
        const up = {};
        r.nul.forEach(function (p) { up[p] = null; });
        const f = {};
        Object.keys(r.set).forEach(function (k) {
            const v = m[k];
            if ((Array.isArray(v) && !v.length) || (obj(v) && !Object.keys(v).length)) { up[k] = null; return; }
            f[k] = 1;
        });
        if (Object.keys(up).length) d.ref('users/' + code).update(up).catch(function (e) { console.warn('[교복 거두기] 지우기', e); });
        try { if (Object.keys(f).length && typeof saveFields === 'function') saveFields(f); } catch (e) { console.warn('[교복 거두기] 저장', e); }
        note(code, r);
        try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
        try { if (typeof window.closetReset === 'function') window.closetReset(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        console.log('[교복 거두기] 내 기록 — 칸: ' + Object.keys(r.set).join(', ') + ' · 지움: ' + r.nul.join(', '));
    });
}
setInterval(function () { try { selfRun(); } catch (e) { selfBusy = false; } }, 2000);

// ==========================================
// 상담사 — 접속해 있지 않은 사원 · 선물함
// ==========================================
function online(code) {
    try { return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[code]); } catch (e) { return false; }
}
let doneSet = null;
function listenDone() {
    const d = db_();
    if (!d || doneSet) return;
    doneSet = {};
    d.ref(NODE).on('value', function (s) { doneSet = s.val() || {}; });
}
function cleanOther(code) {
    const d = db_();
    return claim(code, 'admin').then(function (ok) {
        if (!ok) return null;
        return d.ref('users/' + code).once('value').then(function (s) {
            const v = s.val();
            if (!v) return null;
            const r = cleanUser(v);
            if (!r.hit) return r;
            const up = {};
            r.nul.forEach(function (p) { up[p] = null; });
            Object.keys(r.set).forEach(function (k) {
                const x = v[k];
                const empty = x == null || (Array.isArray(x) && !x.length) || (obj(x) && !Object.keys(x).length);
                up[k] = empty ? null : x;
            });
            up._adminStamp = Date.now();
            return d.ref('users/' + code).update(up).then(function () {
                note(code, r);
                try {   // 내 화면의 그 사람 기록도 맞춘다
                    const loc = users()[code];
                    if (loc) {
                        if (obj(loc.wardrobe)) delete loc.wardrobe[KEY];
                        Object.keys(r.set).forEach(function (k) { loc[k] = v[k]; });
                    }
                } catch (e) { }
                return r;
            });
        });
    }).catch(function (e) { console.warn('[교복 거두기] ' + code, e); return null; });
}
function cleanGifts() {
    const d = db_();
    return claim('_global', 'admin').then(function (ok) {
        if (!ok) return false;
        return d.ref('gifts').once('value').then(function (s) {
            const all = s.val() || {}, up = {};
            Object.keys(all).forEach(function (c) {
                const box = all[c] || {};
                Object.keys(box).forEach(function (id) {
                    const g = box[id];
                    if (!g || !obj(g.items) || !Object.prototype.hasOwnProperty.call(g.items, NAME)) return;
                    const items = Object.assign({}, g.items);
                    delete items[NAME];
                    const left = Object.keys(items).length;
                    if (!left && !g.title && !g.text && !(Number(g.pts) > 0)) up[c + '/' + id] = null;
                    else up[c + '/' + id + '/items'] = left ? items : null;
                });
            });
            if (Object.keys(up).length) { console.log('[교복 거두기] 선물함 ' + Object.keys(up).length + '자리 고침'); return d.ref('gifts').update(up); }
        }).then(function () { return true; });
    }).catch(function (e) { console.warn('[교복 거두기] 선물함', e); return false; });
}
let adminBusy = false, adminAt = 0;
function adminRun(force) {
    const u = me(), d = db_();
    if (!u || u.code !== ADMIN || !d || adminBusy) return Promise.resolve(0);
    listenDone();
    if (!force && Date.now() - adminAt < 120000) return Promise.resolve(0);
    const book = users();
    if (Object.keys(book).length < 2 || !doneSet) return Promise.resolve(0);
    adminBusy = true; adminAt = Date.now();
    const todo = Object.keys(book).filter(function (c) { return c && c !== ADMIN && !doneSet[c] && !online(c); });
    let n = 0;
    const step = function (i) {
        if (i >= todo.length) return Promise.resolve();
        return cleanOther(todo[i]).then(function (r) { if (r && r.hit) n++; return step(i + 1); });
    };
    return cleanGifts().then(function () { return step(0); }).then(function () {
        adminBusy = false;
        if (n) console.log('[교복 거두기] 상담사 화면 — 접속하지 않은 사원 ' + n + '명에게서 걷었습니다.');
        return n;
    }).catch(function (e) { adminBusy = false; console.warn('[교복 거두기]', e); return n; });
}
setInterval(function () { try { adminRun(false); } catch (e) { adminBusy = false; } }, 15000);
window.purgeWuniRun = function () { return adminRun(true); };

})();
