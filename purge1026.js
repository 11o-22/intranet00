// ==========================================
// ★ 2026-10-26 판 정리 — 지운 것들의 기록까지 걷는다
// bundles.json 마지막 묶음 맨 끝 (foxcult.js 뒤)
// ==========================================
//
// ■ 무엇을
//
//   ① 👗 의상 열 벌을 판에서 뺐다 — 가진 사람에게 한 벌에 30,000 P 를 돌려준다
//        퐁실 의상 · 퐁실 신발 · 메이드복 · 롱 메이드복 · 골든 리조트 · 레드 버니 · 용용이 의상
//        룩키마트 앞치마 · 룩키마트 의상 · 유치원 앞치마
//        옷장(wardrobe) · 입고 있던 것(dot) · 코디 다섯 칸(dotSets) · 물들인 색(col) 에서 다 걷는다.
//   ② 📱 K·LEE 를 판에서 뺐다 (klee.js 를 묶음에서 뺐다)
//        소지품 · 장착칸 · 주인 기록 · kleeUse · kleeDay · kleeShop · K.LEE 버프(itemBuffs) ·
//        특이사항의 📲 줄 · 기록(history)의 K.LEE 줄 · kleeSOS · 선물함에 든 것.
//        임신을 절반으로 접어 둔 것(preg.kleeHalf)은 같은 시간을 preg.cageCut 으로 옮겨 적는다 (출산 시각은 그대로).
//   ③ 💬 말풍선 꾸밈을 판에서 뺐다 (bubbles.js 를 묶음에서 뺐다) — sbub · sbubOwn · [ 💭 말풍선 선택권 ] (소지품 · 선물함)
//   ④ 🌑 히든 직업 네크로맨서 — 다시 정할 수 있게
//        네크로맨서를 지닌 사원(지금 속성이든 접어 둔 속성이든)은 K 의 방 기록을 처음부터 (꿈결 · 들어간 수 · 오늘 횟수는 그대로).
//        kroomHidden 에서 네크로맨서 자리는 상태와 상관없이 다 지운다 — 조건을 채우면 다시 「조건 달성」으로 올라온다.
//
// ■ 누가 하나 — 한 사람에 딱 한 번 (purge1026/<사번> 를 트랜잭션으로 먼저 잡은 쪽)
//
//   · 사원 본인 화면 — 들어와서 자료가 다 내려온 뒤 (어둠 · K 의 방 안에서는 기다린다)
//   · 상담사 화면   — 접속해 있지 않은 사원을 서버 기록으로 걷는다 (접속해 있는 사원은 제 화면이 한다)
//   전체 칸(kleeSOS · kroomHidden · 선물함)은 상담사 화면이 한 번 (purge1026/_global).
//
// ■ 콘솔
//   purgeState()          내 것 · 전체 몇 명 끝났나
//   purgeRunAll()         상담사 — 남은 사원을 지금 바로 걷는다

(function purge1026() {

const NODE = 'purge1026';
const ADMIN = 'kario0987';
const REFUND = 30000;
const WEAR = {
    'pongsil': '퐁실 의상', 'pongsil-shoes': '퐁실 신발', 'maid': '메이드복', 'maid-long': '롱 메이드복',
    'golden-resort': '골든 리조트 의상', 'red-bunny': '레드 버니 의상', 'yongyong': '용용이 의상',
    'dress-green': '룩키마트 앞치마', 'band-outfit': '룩키마트 의상', 'dress-yellow': '유치원 앞치마'
};
// 옷장 칸마다 지운 줄의 i (closet.js DOT_SLOTS) — 입고 있던 것을 걷는다 (걷으면 그 칸의 기본으로 돌아간다)
const DOT_IDS = { top: ['band'], outer: ['band', 'ydress', 'gdress', 'maid', 'maidl', 'golden', 'rbunny', 'yongyong', 'pongsil'], shoes: ['pongsil'] };
const KLEE = ['📱 K·LEE', '📱 K.LEE'];
const KLEE_SRC = 'K.LEE';
const KLEE_FIELDS = ['kleeUse', 'kleeDay', 'kleeShop'];
const BUB_TICKET = '[ 💭 말풍선 선택권 ]';
const BUB_FIELDS = ['sbub', 'sbubOwn'];
const NECRO = 'L_necro';
// 이 정리를 올린 때 — 이 뒤에 네크로맨서로 전직한 사람은 「새로 받은 사람」이다 (거두지 않는다 · 2026-10-27)
const PURGE_AT = Date.parse('2026-10-26T19:24:59+09:00');
const PREG_HALF_MS = 24 * 1800000;               // preg-v2.js — PREG_H(24) × 30분 = 절반

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function obj(v) { return (v && typeof v === 'object' && !Array.isArray(v)) ? v : null; }
function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).map(function (k) { return v[k]; }) : []); }
function base(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function isKlee(n) { const b = base(n); return KLEE.indexOf(b) >= 0 || KLEE.indexOf(n) >= 0; }
function kleeText(t) { return /K[.·]LEE|\[📲\]/.test(String(t || '')); }
function busy() {
    try { if (typeof darkRun !== 'undefined' && darkRun) return true; } catch (e) { }
    try { if (typeof window.kroomOn === 'function' && window.kroomOn()) return true; } catch (e) { }
    return false;
}
function stamp() {
    const n = new Date();
    return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0') + ':' + String(n.getSeconds()).padStart(2, '0');
}

// 정리 앞에 받은 네크로맨서를 지녔나 — 지금 속성이든 접어 둔 속성이든
//   ✗ 전에는 네크로맨서면 언제 받았든 거뒀다. 옛 화면을 켜 둔 채 정리 뒤에 새로 전직한 사람이
//     새로 열 때(또는 들어오자마자 K 의 방에 들어가 정리가 뒤로 밀린 사람이) 거둬져
//     「지정돼 있는데 직업을 처음부터 골라야」 했다.
//   → 전직한 때(hidden.at)가 정리를 올린 뒤면 새로 받은 것이다.
function necroOld(k) {
    if (!k || typeof k !== 'object') return false;
    const alt = obj(k.alt) || {};
    const ps = [k].concat(Object.keys(alt).map(function (a) { return alt[a]; }));
    return ps.some(function (p) {
        if (!p || p.job !== NECRO) return false;
        const at = p.hidden ? Number(p.hidden.at) || 0 : 0;
        return at < PURGE_AT;
    });
}

// ==========================================
// 한 사람 걷기 — 받은 기록(u)을 그 자리에서 고친다
//   돌려주는 것 — set: 고친 칸 이름 · nul: 지울 길(사원 기록 안 · 'wardrobe/maid' 처럼) · refund · lost(이름) · necro
// ==========================================
function cleanUser(u) {
    const set = {}, nul = [], at = {};                     // at — 사원 기록 안의 길에 값을 바로 적는다 ('preg/cageCut' 처럼)
    let refund = 0;
    const lost = [];
    let necro = false;

    // ① 의상
    const w = obj(u.wardrobe);
    if (w) Object.keys(WEAR).forEach(function (k) {
        if (!w[k]) return;
        delete w[k];
        nul.push('wardrobe/' + k);
        refund += REFUND; lost.push(WEAR[k]);
    });
    const fixDot = function (d) {
        if (!obj(d)) return false;
        let ch = false;
        Object.keys(DOT_IDS).forEach(function (slot) {
            if (DOT_IDS[slot].indexOf(d[slot]) >= 0) { delete d[slot]; ch = true; }
        });
        if (obj(d.col)) Object.keys(WEAR).forEach(function (k) { if (Object.prototype.hasOwnProperty.call(d.col, k)) { delete d.col[k]; ch = true; } });
        return ch;
    };
    if (fixDot(u.dot)) set.dot = 1;
    if (obj(u.dotSets)) Object.keys(u.dotSets).forEach(function (k) {
        const e = u.dotSets[k];
        if (!e || !fixDot(e.d)) return;
        if (!obj(e.d) || !Object.keys(e.d).length) delete u.dotSets[k];   // 지운 옷만 담겨 있던 코디 — 칸째 비운다
        set.dotSets = 1;
    });

    // ② K·LEE · ③ 말풍선 선택권 — 소지품
    if (Array.isArray(u.inventory)) {
        const inv = u.inventory.filter(function (n) { return !isKlee(n) && n !== BUB_TICKET; });
        if (inv.length !== u.inventory.length) { u.inventory = inv; set.inventory = 1; }
    }
    if (Array.isArray(u.equippedWeapons)) {
        const eq = u.equippedWeapons.filter(function (n) { return !isKlee(n); });
        if (eq.length !== u.equippedWeapons.length) { u.equippedWeapons = eq; set.equippedWeapons = 1; }
    }
    if (obj(u.equipOwner)) Object.keys(u.equipOwner).forEach(function (k) {
        if (!isKlee(k)) return;
        delete u.equipOwner[k];
        if (!/[.#$\[\]\/]/.test(k)) nul.push('equipOwner/' + k);        // 열쇠로 못 쓰는 글자가 든 것은 서버에 있을 수 없다
    });
    KLEE_FIELDS.concat(BUB_FIELDS).forEach(function (k) {
        if (u[k] === undefined || u[k] === null) return;
        delete u[k];
        nul.push(k);
    });
    if (Array.isArray(u.itemBuffs)) {
        const ib = u.itemBuffs.filter(function (b) { return !(b && b.src === KLEE_SRC); });
        if (ib.length !== u.itemBuffs.length) { u.itemBuffs = ib; set.itemBuffs = 1; }
    }
    if (u.badge && typeof u.badge === 'object') {
        ['notes', 'note'].forEach(function (key) {
            if (typeof u.badge[key] !== 'string' || !kleeText(u.badge[key])) return;
            const keep = u.badge[key].split(' | ').filter(function (n) { return n.trim() !== '' && !kleeText(n); });
            u.badge[key] = keep.length ? keep.join(' | ') : '특이사항 없음';
            set.badge = 1;
        });
    }
    if (Array.isArray(u.history)) {
        const h = u.history.filter(function (x) { return !kleeText(typeof x === 'string' ? x : (x && x.text)); });
        if (h.length !== u.history.length) { u.history = h; set.history = 1; }
    }
    if (obj(u.preg) && u.preg.kleeHalf) {
        // 접어 둔 시간은 그대로 (출산 시각이 안 바뀐다) — 임신 칸은 note-merge 가 칸마다 합치므로 길로 바로 적는다
        u.preg.cageCut = (Number(u.preg.cageCut) || 0) + PREG_HALF_MS;
        delete u.preg.kleeHalf;
        at['preg/cageCut'] = u.preg.cageCut;
        nul.push('preg/kleeHalf');
    }

    // ④ 네크로맨서 — 정리 앞에 받은 것만 (정리 뒤에 새로 전직한 사람은 그대로 둔다)
    try {
        if (typeof window.kroomWipe === 'function' && necroOld(u.kroom)) {
            window.kroomWipe(u.kroom);
            set.kroom = 1; necro = true;
        }
    } catch (e) { console.warn('[정리] 네크로맨서', e); }

    // 기록 한 줄
    const log = function (t) { if (!Array.isArray(u.history)) u.history = []; u.history.unshift({ time: stamp(), text: t }); if (u.history.length > 10) u.history.length = 10; set.history = 1; };
    if (refund) log('[옷장] 판에서 빠진 옷 — ' + lost.join(' · ') + ' — 한 벌에 ' + REFUND.toLocaleString() + ' P 씩 돌려받았습니다. (+' + refund.toLocaleString() + ' P)');
    if (necro) log('[K 의 방] 네크로맨서가 거두어졌습니다. K 의 방 기록이 처음부터 다시 시작됩니다.');
    return { set: set, nul: nul, at: at, refund: refund, lost: lost, necro: necro };
}

// 한 사람에 한 번 — 먼저 잡은 쪽이 한다
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
    if (!d) return;
    const x = {};
    if (r.refund) x.refund = r.refund;
    if (r.lost.length) x.lost = r.lost.join(', ');
    if (r.necro) x.necro = 1;
    if (Object.keys(x).length) d.ref(NODE + '/' + code).update(x).catch(function () { });
}

// ==========================================
// 내 것 — 내 화면이 한다
// ==========================================
let selfDone = false, selfBusy = false, selfAt = 0;
function selfRun() {
    const u = me(), d = db_();
    if (selfDone || selfBusy || !u || !u.code || !d) return;
    if (!selfAt) { selfAt = Date.now(); return; }
    if (Date.now() - selfAt < 8000) return;                // 자료가 다 내려올 때까지
    if (busy()) return;                                    // 어둠 · K 의 방 안에서는 기다린다
    selfBusy = true;
    const code = u.code;
    claim(code, 'self').then(function (ok) {
        selfBusy = false;
        selfDone = true;
        if (!ok || !me() || me().code !== code) return;
        const m = me();
        const r = cleanUser(m);
        if (r.refund) { m.points = (Number(m.points) || 0) + r.refund; r.set.points = 1; }
        // 지운 칸은 길로 지운다 (빈 객체 · 빈 배열은 저장 길목에서 빠져 서버에 안 닿는다)
        const up = {};
        r.nul.forEach(function (p) { up[p] = null; });
        Object.keys(r.at).forEach(function (p) { up[p] = r.at[p]; });
        const f = {};
        Object.keys(r.set).forEach(function (k) {
            const v = m[k];
            if ((Array.isArray(v) && !v.length) || (obj(v) && !Object.keys(v).length)) { up[k] = null; return; }
            f[k] = 1;
        });
        if (Object.keys(up).length) d.ref('users/' + code).update(up).catch(function (e) { console.warn('[정리] 지우기', e); });
        try { if (Object.keys(f).length && typeof saveFields === 'function') saveFields(f); } catch (e) { console.warn('[정리] 저장', e); }
        note(code, r);
        try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
        try { if (typeof window.closetReset === 'function') window.closetReset(); } catch (e) { }
        try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
        if (r.refund || r.necro) {
            const msg = [];
            if (r.refund) msg.push('👗 판에서 빠진 옷\n' + r.lost.join(' · ') + '\n\n한 벌에 ' + REFUND.toLocaleString() + ' P 씩 돌려드렸습니다. (+' + r.refund.toLocaleString() + ' P)');
            if (r.necro) msg.push('🌑 네크로맨서가 거두어졌습니다.\nK 의 방 기록이 처음부터 다시 시작됩니다.');
            setTimeout(function () { try { showCustomAlert(msg.join('\n\n')); } catch (e) { } }, 1200);
        }
        console.log('[정리] 내 기록 — ' + JSON.stringify({ 옷: r.lost, 돌려받음: r.refund, 칸: Object.keys(r.set), 지움: r.nul, 네크로맨서: r.necro }));
    });
}
setInterval(function () { try { selfRun(); } catch (e) { selfBusy = false; } }, 2000);

// ==========================================
// 상담사 — 접속해 있지 않은 사원 · 전체 칸
// ==========================================
function online(code) {
    try { return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[code]); } catch (e) { return false; }
}
let doneSet = null;                                        // purge1026 에 적힌 사번들
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
            const up = {};
            r.nul.forEach(function (p) { up[p] = null; });
            Object.keys(r.at).forEach(function (p) { up[p] = r.at[p]; });
            Object.keys(r.set).forEach(function (k) {
                const x = v[k];
                const empty = x == null || (Array.isArray(x) && !x.length) || (obj(x) && !Object.keys(x).length);
                up[k] = empty ? null : x;
            });
            up._adminStamp = Date.now();
            const jobs = [];
            if (Object.keys(up).length > 1) jobs.push(d.ref('users/' + code).update(up));
            if (r.refund) jobs.push(d.ref('users/' + code + '/points').transaction(function (p) { return (Number(p) || 0) + r.refund; }));
            return Promise.all(jobs).then(function () {
                note(code, r);
                // 내 화면의 그 사람 기록도 맞춘다
                try { const loc = users()[code]; if (loc) { r.nul.forEach(function (p) { const a = p.split('/'); if (a.length === 1) delete loc[a[0]]; else if (obj(loc[a[0]])) delete loc[a[0]][a[1]]; }); Object.keys(r.set).forEach(function (k) { loc[k] = v[k]; }); if (r.refund) loc.points = (Number(loc.points) || 0) + r.refund; } } catch (e) { }
                return r;
            });
        });
    }).catch(function (e) { console.warn('[정리] ' + code, e); return null; });
}
function cleanGlobal() {
    const d = db_();
    return claim('_global', 'admin').then(function (ok) {
        if (!ok) return false;
        const jobs = [];
        jobs.push(d.ref('kleeSOS').remove());
        jobs.push(d.ref('kroomHidden').once('value').then(function (s) {
            const all = s.val() || {}, up = {};
            Object.keys(all).forEach(function (c) { if (all[c] && all[c].key === NECRO) up[c] = null; });
            if (Object.keys(up).length) { console.log('[정리] 히든 직업 네크로맨서 자리 ' + Object.keys(up).length + '개 지움'); return d.ref('kroomHidden').update(up); }
        }));
        jobs.push(d.ref('gifts').once('value').then(function (s) {
            const all = s.val() || {}, up = {};
            Object.keys(all).forEach(function (c) {
                const box = all[c] || {};
                Object.keys(box).forEach(function (id) {
                    const g = box[id];
                    if (!g || !obj(g.items)) return;
                    const items = Object.assign({}, g.items);
                    let hit = false;
                    Object.keys(items).forEach(function (n) { if (isKlee(n) || n === BUB_TICKET) { delete items[n]; hit = true; } });
                    if (!hit) return;
                    const left = Object.keys(items).length;
                    if (!left && !g.title && !g.text && !(Number(g.pts) > 0)) up[c + '/' + id] = null;
                    else up[c + '/' + id + '/items'] = left ? items : null;
                });
            });
            if (Object.keys(up).length) { console.log('[정리] 선물함 ' + Object.keys(up).length + '자리 고침'); return d.ref('gifts').update(up); }
        }));
        return Promise.all(jobs).then(function () { return true; });
    }).catch(function (e) { console.warn('[정리] 전체', e); return false; });
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
    const todo = Object.keys(book).filter(function (c) { return c && !doneSet[c] && !online(c); });
    let n = 0;
    const step = function (i) {
        if (i >= todo.length) return Promise.resolve();
        return cleanOther(todo[i]).then(function (r) { if (r) n++; return step(i + 1); });
    };
    return cleanGlobal().then(function () { return step(0); }).then(function () {
        adminBusy = false;
        if (n) console.log('[정리] 상담사 화면 — 접속하지 않은 사원 ' + n + '명을 걷었습니다.');
        return n;
    }).catch(function (e) { adminBusy = false; console.warn('[정리]', e); return n; });
}
setInterval(function () { try { adminRun(false); } catch (e) { adminBusy = false; } }, 15000);

// ==========================================
// ⑤ 정리 뒤에 새로 받은 네크로맨서를 거둬 간 사람 — 되돌린다 (2026-10-27)
// ==========================================
//   누구 — kroomHidden/<사번> 이 네크로맨서 전직(accepted · L)이고 그 때가 정리를 올린 뒤인데,
//          이 정리(purge1026/<사번>)가 그보다 뒤에 네크로맨서를 거둬 간 사람.
//   어떻게 — 전직한 그 자리처럼 네크로맨서 D · Lv 1 (갈림길 · 임무 수는 큰 쪽).
//            purge1026/<사번>/back 을 트랜잭션으로 먼저 잡은 쪽이 한 번만 한다.
//   누가 — 본인 화면(들어와서 · 어둠 · K 의 방 밖에서) · 상담사 화면(접속하지 않은 사람)
function hurt(p, h) {
    if (!p || !p.necro || p.back || !h) return false;
    if (h.key !== NECRO || !(h.state === 'accepted' || h.state === 'L')) return false;
    const ans = Number(h.answeredAt) || 0;
    return ans >= PURGE_AT && (Number(p.at) || 0) >= ans;
}
function claimBack(code, by) {
    const d = db_();
    if (!d) return Promise.resolve(false);
    return d.ref(NODE + '/' + code + '/back').transaction(function (cur) {
        if (cur) return;
        return { at: Date.now(), by: by };
    }).then(function (r) { return !!(r && r.committed); }).catch(function () { return false; });
}
function readPair(code) {
    const d = db_();
    return Promise.all([d.ref(NODE + '/' + code).once('value'), d.ref('kroomHidden/' + code).once('value')])
        .then(function (a) { return { p: a[0].val(), h: a[1].val() }; });
}
let backDone = false, backBusy = false;
function selfBack() {
    const u = me(), d = db_();
    if (backDone || backBusy || !selfDone || !u || !u.code || !d || busy()) return;
    if (typeof window.kroomPutHidden !== 'function') return;
    backBusy = true;
    const code = u.code;
    readPair(code).then(function (x) {
        if (!hurt(x.p, x.h)) { backDone = true; return; }
        if (typeof window.kroomHasJob === 'function' && window.kroomHasJob(u.kroom, NECRO)) { backDone = true; return; }
        // 먼저 사본에 해 본다 — 안 되면 표시를 잡지 않는다 (다음에 다시)
        const k2 = JSON.parse(JSON.stringify(obj(u.kroom) || {}));
        const line = window.kroomPutHidden(k2, x.h);
        if (!line) { backDone = true; return; }
        return claimBack(code, 'self').then(function (ok) {
            backDone = true;
            if (!ok || !me() || me().code !== code) return;
            const m = me();
            m.kroom = k2;
            if (!Array.isArray(m.history)) m.history = [];
            m.history.unshift({ time: stamp(), text: '[K 의 방] ✦ 네크로맨서를 되돌렸습니다 — ' + line + ' (정리가 잘못 거둬 간 것)' });
            if (m.history.length > 10) m.history.length = 10;
            try { if (typeof saveFields === 'function') saveFields({ kroom: 1, history: 1 }); } catch (e) { }
            d.ref(NODE + '/' + code + '/back').update({ line: line }).catch(function () { });
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            setTimeout(function () { try { showCustomAlert('🌑 네크로맨서를 되돌렸습니다.\n\n' + line + '\n\n정리가 잘못 거둬 갔던 것입니다.'); } catch (e) { } }, 1500);
            console.log('[정리] 네크로맨서 되돌림 — ' + line);
        });
    }).catch(function (e) { console.warn('[정리] 네크로맨서 되돌리기', e); })
      .then(function () { backBusy = false; });
}
setInterval(function () { try { selfBack(); } catch (e) { backBusy = false; } }, 3000);

// 상담사 — 접속하지 않은 사람은 서버 기록으로 (접속해 있으면 제 화면이 한다)
function backOther(code, force) {
    const d = db_();
    if (!force && online(code)) return Promise.resolve(null);
    return readPair(code).then(function (x) {
        if (!hurt(x.p, x.h)) return null;
        return d.ref('users/' + code).once('value').then(function (s) {
            const v = s.val();
            if (!v) return null;
            const k = obj(v.kroom) ? v.kroom : {};
            const line = window.kroomPutHidden(k, x.h);          // 먼저 해 보고, 되면 표시를 잡는다
            if (!line) return null;
            return claimBack(code, 'admin').then(function (ok) {
                if (!ok) return null;
                const hist = Array.isArray(v.history) ? v.history.slice() : arr(v.history);
                hist.unshift({ time: stamp(), text: '[K 의 방] ✦ 네크로맨서를 되돌렸습니다 — ' + line + ' (정리가 잘못 거둬 간 것)' });
                if (hist.length > 10) hist.length = 10;
                return d.ref('users/' + code).update({ kroom: k, history: hist, _adminStamp: Date.now() }).then(function () {
                    d.ref(NODE + '/' + code + '/back').update({ line: line }).catch(function () { });
                    try { const loc = users()[code]; if (loc) { loc.kroom = k; loc.history = hist; } } catch (e) { }
                    console.log('[정리] ' + (v.name || code) + ' — 네크로맨서 되돌림: ' + line);
                    return { code: code, name: v.name || code, line: line };
                });
            });
        });
    }).catch(function (e) { console.warn('[정리] 네크로맨서 되돌리기 ' + code, e); return null; });
}
let backAdminAt = 0;
function adminBack(now_, withOnline) {
    const u = me();
    if (!u || u.code !== ADMIN || typeof window.kroomPutHidden !== 'function') return Promise.resolve([]);
    listenDone();
    if (!doneSet) return Promise.resolve([]);
    if (!now_ && Date.now() - backAdminAt < 120000) return Promise.resolve([]);
    backAdminAt = Date.now();
    const list = Object.keys(doneSet).filter(function (c) { const p = doneSet[c]; return p && p.necro && !p.back; });
    const out = [];
    const step = function (i) {
        if (i >= list.length) return Promise.resolve(out);
        return backOther(list[i], !!withOnline).then(function (r) { if (r) out.push(r); return step(i + 1); });
    };
    return step(0);
}
setInterval(function () { try { adminBack(false, false); } catch (e) { } }, 20000);
// 상담사 콘솔 — 지금 바로 · necroBack(true) 는 접속해 있는 사람도 서버 기록으로
//   (그 사람 화면이 옛 기록을 다시 적을 수 있으니 되도록 제 화면에 맡긴다 — 들어와 있으면 3초 안에 스스로 한다)
window.necroBack = function (withOnline) {
    return adminBack(true, !!withOnline).then(function (r) {
        console.log('%c🌑 네크로맨서 되돌림 — ' + r.length + '명', 'color:#c9a8ff');
        if (r.length) console.table(r.map(function (x) { return { 사원: x.name, 되돌림: x.line }; }));
        const wait = Object.keys(doneSet || {}).filter(function (c) { const p = doneSet[c]; return p && p.necro && !p.back && online(c); });
        if (wait.length && !withOnline) console.log('  접속 중인 ' + wait.length + '명은 제 화면이 합니다 — 기다리지 않으려면 necroBack(true)');
        return r;
    });
};

window.purgeRunAll = function () { return adminRun(true); };
window.purgeState = function () {
    const u = me();
    console.log('%c===== 🧹 2026-10-26 정리 =====', 'color:#ffcc80; font-size:13px');
    if (u) console.log('  내 것 :', doneSet && doneSet[u.code] ? JSON.stringify(doneSet[u.code]) : (selfDone ? '끝남' : '아직'));
    if (doneSet) {
        const book = users();
        const left = Object.keys(book).filter(function (c) { return !doneSet[c]; });
        console.log('  끝난 사원 ' + Object.keys(doneSet).filter(function (c) { return c !== '_global'; }).length + '명 · 남은 사원 ' + left.length + '명 (접속 중 ' + left.filter(online).length + '명은 제 화면이 한다)');
        const refunds = Object.keys(doneSet).filter(function (c) { return doneSet[c] && doneSet[c].refund; });
        if (refunds.length) console.table(refunds.map(function (c) { return { 사원: (book[c] && book[c].name) || c, 돌려줌: doneSet[c].refund, 옷: doneSet[c].lost || '' }; }));
    }
};
window.__purgeClean = cleanUser;                           // 시험용

})();
