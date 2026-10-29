// ==========================================
// ★ 이름이 바뀐 물품 — 서버의 묵은 자리까지 따라 바꾼다 (2026-10-29)
//     🦊 호사수구 · 🦊 호가호위  →  🐯 호가호위     (foxtail.js · 꼬리 → 🪷 연등)
//     🐾 아기 여우              →  🐾 아기 호랑이   (babyfox.js · 묘사도 호랑이로)
// bundles.json 마지막 묶음 맨 끝 — foxtail.js · babyfox.js · save-merge.js 보다 뒤
// ==========================================
//
// ■ 왜
//
//   물품은 이름 글자 그대로 소지품 · 장착칸 · 장착 주인 · 보관함 · 선물함 · 장터 글에 적혀 있으므로,
//   옛 글자가 남아 있으면 다른 물건처럼 보인다 (foxtail.js · babyfox.js 가 옛 이름도 같은 것으로 받아 주지만, 표시는 옛 이름이다).
//
// ■ 어디를 바꾸나
//
//   users/<사번>/inventory[*] · equippedWeapons[*](앞머리가 옛 이름이면) · equipOwner(열쇠) · house/storage[*].name ·
//   invMark/{fav,lock}(열쇠 · invmark.js invKey 로 적힌 것) · gifts/<사번>/*/items(열쇠) · market/*(item)
//
//   ① 사원 쪽 — 들어올 때와 2분마다 제 것. 화면의 값을 바꾸고 saveFields 로 올린다 (소지품은 병합이 빼고 더하기로 보낸다).
//   ② 상담사 쪽 — 들어오면 한 번 전 사원 · 선물함 · 장터를 트랜잭션으로 바꾼다.
//
// ■ 콘솔 (상담사)
//   foxRenameCheck()   아직 옛 이름이 남은 자리
//   foxRenameAll()     지금 전부 바꾼다

(function foxRename() {
'use strict';

// 옛 이름 → 새 이름
const MAP = {
    '🦊 호사수구': '🐯 호가호위',
    '🦊 호가호위': '🐯 호가호위',          // 2026-10-29 한때 쓴 이름
    '🐾 아기 여우': '🐾 아기 호랑이'
};
const OLDS = Object.keys(MAP);
const NEWS = OLDS.map(function (o) { return MAP[o]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
const ADMIN = 'kario0987';
const TAG = '[이름 바꿈]';

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function asList(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).sort(function (a, b) { return Number(a) - Number(b); }).map(function (k) { return v[k]; });
    return [];
}
function base(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function isOld(w) { return typeof w === 'string' && MAP[w] != null; }
function newOf(w) { return MAP[w]; }
function fixName(w) {
    if (typeof w !== 'string') return w;
    if (isOld(w)) return newOf(w);
    const b = base(w);
    if (isOld(b) && w.indexOf(b) === 0) return newOf(b) + w.slice(b.length);
    return w;
}
function key_(n) { try { return (typeof invKey === 'function') ? invKey(n) : n; } catch (e) { return n; } }
function fixMark(m) {                     // invMark {fav,lock} — 바꾼 게 있으면 새 것을, 없으면 null
    if (!m || typeof m !== 'object') return null;
    const out = JSON.parse(JSON.stringify(m)); let hit = false;
    ['fav', 'lock'].forEach(function (g) {
        if (!out[g] || typeof out[g] !== 'object') return;
        OLDS.forEach(function (o) { [o, key_(o)].forEach(function (ok) { if (out[g][ok]) { delete out[g][ok]; out[g][key_(newOf(o))] = true; hit = true; } }); });
    });
    return hit ? out : null;
}
function fixStorage(l) { return l.map(function (v) { return (v && typeof v === 'object' && isOld(v.name)) ? Object.assign({}, v, { name: newOf(v.name) }) : v; }); }
function pairText(olds) {                 // 기록 줄 — 실제로 바꾼 짝만
    const seen = {};
    return olds.filter(function (o) { if (seen[o]) return false; seen[o] = 1; return true; })
        .map(function (o) { return '「' + o + '」 → 「' + newOf(o) + '」'; }).join(' · ');
}

// 한 사람 몫 — 바꿀 것이 있으면 { 칸: 새 값, _olds: [옛 이름…] } 을 돌려준다 (없으면 null)
function planFor(u) {
    if (!u) return null;
    const up = {};
    const olds = [];
    let n = 0;
    const inv = asList(u.inventory);
    if (inv.some(isOld)) { up.inventory = inv.map(fixName); inv.filter(isOld).forEach(function (o) { olds.push(o); }); n++; }
    const eq = asList(u.equippedWeapons);
    if (eq.some(function (x) { return fixName(x) !== x; })) { up.equippedWeapons = eq.map(fixName); eq.forEach(function (x) { const b = base(x); if (isOld(b)) olds.push(b); }); n++; }
    if (u.equipOwner && typeof u.equipOwner === 'object') {
        const eo = {}; let hit = false;
        Object.keys(u.equipOwner).forEach(function (k) { const k2 = fixName(k); if (k2 !== k) { hit = true; olds.push(base(k)); } eo[k2] = u.equipOwner[k]; });
        if (hit) { up.equipOwner = eo; n++; }
    }
    const st = (u.house && u.house.storage) ? asList(u.house.storage) : [];
    if (st.some(function (x) { return x && typeof x === 'object' && isOld(x.name); })) {
        up['house/storage'] = fixStorage(st); st.forEach(function (x) { if (x && isOld(x.name)) olds.push(x.name); }); n++;
    }
    const m = (u.invMark && typeof u.invMark === 'object') ? fixMark(u.invMark) : null;
    if (m) { up.invMark = m; OLDS.forEach(function (o) { ['fav', 'lock'].forEach(function (g) { const x = u.invMark[g]; if (x && (x[o] || x[key_(o)])) olds.push(o); }); }); n++; }
    if (!n) return null;
    up._olds = olds.filter(isOld);
    return up;
}
function histText(olds) { return TAG + ' ' + (pairText(olds) || pairText(OLDS)) + ' 로 이름이 바뀌었습니다.'; }

// ==========================================
// ① 사원 쪽
// ==========================================
function mine() {
    const u = me();
    const up = planFor(u);
    if (!u || !up) return false;
    if (up.inventory) u.inventory = up.inventory;
    if (up.equippedWeapons) u.equippedWeapons = up.equippedWeapons;
    if (up.equipOwner) u.equipOwner = up.equipOwner;
    if (up.invMark) u.invMark = up.invMark;
    const f = {};
    if (up.inventory) f.inventory = 1;
    if (up.equippedWeapons) f.equippedWeapons = 1;
    if (up.equipOwner) f.equipOwner = 1;
    if (up.invMark) f.invMark = 1;
    if (Object.keys(f).length) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
    // 보관함은 house 통째가 아니라 그 칸에 트랜잭션으로 (storage-dup.js 와 같은 길 · 주인은 houseStorageRef)
    if (up['house/storage']) {
        try {
            const d = db_();
            let own = u.code; try { if (typeof houseStorageRef === 'function') own = houseStorageRef(u) || u.code; } catch (e) { }
            if (d) d.ref('users/' + own + '/house/storage').transaction(function (arr) {
                const l = asList(arr);
                if (!l.some(function (v) { return v && isOld(v.name); })) return;
                return fixStorage(l);
            }).then(function (r) {
                try { const o = (own === u.code) ? u : ((typeof db !== 'undefined' && db.users) ? db.users[own] : null); if (o && r && r.snapshot && o.house) o.house.storage = r.snapshot.val() || []; } catch (e) { }
                try { if (typeof renderHouseStorage === 'function') renderHouseStorage(); } catch (e) { }
            }).catch(function () { });
        } catch (e) { }
    }
    try { if (typeof addHistoryLog === 'function') { addHistoryLog(u, histText(up._olds)); saveFields({ history: 1 }); } } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    console.log('%c' + TAG + ' 내 것을 새 이름으로 바꿨습니다 — ' + Object.keys(f).join(' · ') + (up['house/storage'] ? ' · house/storage' : ''), 'color:#4CAF50');
    return true;
}
window.foxRenameMe = mine;
(function watch() {
    let tries = 0;
    const iv = setInterval(function () {
        const u = me();
        if (u && Array.isArray(u.inventory)) { clearInterval(iv); setTimeout(function () { try { mine(); } catch (e) { } }, 5000); return; }
        if (++tries > 120) clearInterval(iv);
    }, 1000);
    setInterval(function () { try { mine(); } catch (e) { } }, 120000);
})();

// ==========================================
// ② 상담사 쪽 — 전 사원 · 선물함 · 장터
// ==========================================
function txPath(path, fn) {
    const d = db_();
    if (!d) return Promise.resolve(false);
    return d.ref(path).transaction(function (cur) {
        if (cur === null || cur === undefined) return cur === null ? null : undefined;
        const out = fn(cur);
        return out === undefined ? undefined : out;
    }).then(function (r) { return !!(r && r.committed); }).catch(function (e) { console.warn(TAG + ' ' + path, e && e.message); return false; });
}
function sweepUser(code, x) {
    const up = planFor(x);
    if (!up) return Promise.resolve([]);
    const jobs = [];
    if (up.inventory) jobs.push(txPath('users/' + code + '/inventory', function (cur) { const l = asList(cur); return l.some(isOld) ? l.map(fixName) : undefined; }).then(function (ok) { return ok ? 'inventory' : null; }));
    if (up.equippedWeapons) jobs.push(txPath('users/' + code + '/equippedWeapons', function (cur) { const l = asList(cur); return l.some(function (v) { return fixName(v) !== v; }) ? l.map(fixName) : undefined; }).then(function (ok) { return ok ? 'equippedWeapons' : null; }));
    if (up.equipOwner) jobs.push(txPath('users/' + code + '/equipOwner', function (cur) { if (!cur || typeof cur !== 'object') return; const eo = {}; let hit = false; Object.keys(cur).forEach(function (k) { const k2 = fixName(k); if (k2 !== k) hit = true; eo[k2] = cur[k]; }); return hit ? eo : undefined; }).then(function (ok) { return ok ? 'equipOwner' : null; }));
    if (up['house/storage']) jobs.push(txPath('users/' + code + '/house/storage', function (cur) { const l = asList(cur); return l.some(function (v) { return v && isOld(v.name); }) ? fixStorage(l) : undefined; }).then(function (ok) { return ok ? 'house/storage' : null; }));
    if (up.invMark) jobs.push(txPath('users/' + code + '/invMark', function (cur) { const m = fixMark(cur); return m || undefined; }).then(function (ok) { return ok ? 'invMark' : null; }));
    return Promise.all(jobs).then(function (done) {
        const got = done.filter(Boolean);
        if (got.length) {
            const d = db_();
            try { d.ref('users/' + code + '/history').transaction(function (h) { const l = asList(h); l.unshift({ time: new Date().toTimeString().slice(0, 8), text: histText(up._olds) }); while (l.length > 10) l.pop(); return l; }).catch(function () { }); } catch (e) { }
        }
        return got.length ? [{ code: code, what: got }] : [];
    });
}
function sweepGiftsMarket() {
    const d = db_();
    if (!d) return Promise.resolve([]);
    const out = [];
    return d.ref('gifts').once('value').then(function (s) {
        const all = s.val() || {};
        const jobs = [];
        Object.keys(all).forEach(function (code) {
            const box = all[code] || {};
            Object.keys(box).forEach(function (gid) {
                const g = box[gid];
                if (g && g.items && typeof g.items === 'object' && OLDS.some(function (o) { return g.items[o] != null; })) {
                    jobs.push(txPath('gifts/' + code + '/' + gid + '/items', function (cur) { if (!cur) return; let hit = false; const c = Object.assign({}, cur); OLDS.forEach(function (o) { if (c[o] != null) { const nw = newOf(o); c[nw] = (Number(c[nw]) || 0) + (Number(c[o]) || 0); delete c[o]; hit = true; } }); return hit ? c : undefined; }).then(function (ok) { if (ok) out.push({ code: code, what: ['선물함 ' + gid] }); }));
                }
            });
        });
        return Promise.all(jobs);
    }).then(function () { return d.ref('market').once('value'); }).then(function (s) {
        const all = s.val() || {};
        const jobs = [];
        Object.keys(all).forEach(function (id) {
            const p = all[id];
            if (p && isOld(p.item)) jobs.push(txPath('market/' + id + '/item', function (cur) { return isOld(cur) ? newOf(cur) : undefined; }).then(function (ok) { if (ok) out.push({ code: p.seller || p.buyer || '-', what: ['장터 글 ' + id] }); }));
        });
        return Promise.all(jobs);
    }).then(function () { return out; }).catch(function (e) { console.warn(TAG + ' 선물함 · 장터', e && e.message); return out; });
}
let allBusy = false;
window.foxRenameAll = function (quiet) {
    const u = me();
    if (!u || u.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return Promise.resolve([]); }
    const d = db_();
    if (!d || allBusy) return Promise.resolve([]);
    allBusy = true;
    return d.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        let chain = Promise.resolve([]);
        Object.keys(all).forEach(function (c) {
            if (!planFor(all[c])) return;
            chain = chain.then(function (acc) { return (c === u.code ? Promise.resolve(mine() ? [{ code: c, what: ['내 것'] }] : []) : sweepUser(c, all[c])).then(function (r) { return acc.concat(r); }); });
        });
        return chain;
    }).then(function (rows) { return sweepGiftsMarket().then(function (m) { return rows.concat(m); }); }).then(function (rows) {
        allBusy = false;
        if (!rows.length) { if (quiet !== true) console.log(TAG + ' 바꿀 것이 없습니다.'); return rows; }
        console.log('%c===== ' + NEWS.join(' · ') + ' — 이름 바꾸기 =====', 'color:#4CAF50; font-size:13px');
        console.table(rows.map(function (r) { const x = (typeof db !== 'undefined' && db.users && db.users[r.code]) || {}; return { 사원: x.name || r.code, 바꾼곳: r.what.join(' · ') }; }));
        return rows;
    }).catch(function (e) { allBusy = false; console.error(TAG + ' 전체 바꾸기 실패:', e); return []; });
};
window.foxRenameCheck = function () {
    const d = db_();
    if (!d) { console.warn('서버에 닿지 못했습니다.'); return; }
    d.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const rows = [];
        Object.keys(all).forEach(function (c) { const up = planFor(all[c]); if (up) rows.push({ 사원: (all[c] || {}).name || c, 옛이름: pairText(up._olds), 남은곳: Object.keys(up).filter(function (k) { return k !== '_olds'; }).join(' · ') }); });
        console.log('%c===== 아직 옛 이름(' + OLDS.join(' · ') + ')이 남은 자리 =====', 'color:#ffd700; font-size:13px');
        if (rows.length) { console.table(rows); console.log('  바꾸려면 foxRenameAll()'); } else console.log('  사원 자리에는 없습니다. (선물함 · 장터는 foxRenameAll() 이 같이 봅니다)');
    });
};
(function adminOnce() {
    let tries = 0;
    const iv = setInterval(function () {
        const u = me();
        if (u && u.code === ADMIN && db_()) { clearInterval(iv); setTimeout(function () { window.foxRenameAll(true); }, 12000); return; }
        if (++tries > 180) clearInterval(iv);
    }, 1000);
})();

console.log(TAG + ' ' + OLDS.map(function (o) { return o + ' → ' + newOf(o); }).join(' · ') + ' — foxRenameCheck() · foxRenameAll()');
})();
