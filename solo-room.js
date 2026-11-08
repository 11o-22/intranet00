// ==========================================
// ★ 솔플 — 따로 두는 방 (2026-11-08 사용자)
// bundles.json 마지막 묶음 맨 끝 — chilseong.js · eliteb.js · trace.js · butterfly.js · babyfox.js 보다 뒤
// ==========================================
//
//   「제 칠 성군이나 (구) 정예 B조 둘 다 솔플 (칠성군은 염정성군과 · B조 조장은 늑대 셋과) 을 가능하게 하되
//    방을 따로 개별적으로 만들어서 카운트되지 않도록 하자. 흔적 칭호도 솔플 시 방 따로.」
//
// ■ 누가
//   🌟 칠성군  차고 있고 염정성군의 속성을 하나라도 받아 둔 사람 (u.chil.yeom) — 염정성군이 함께 간다
//   🐺 B조     차고 있고 데려갈 늑대를 셋으로 둔 사람 (u.ebWolves = 3) — 늑대 셋과 간다
//   🦋 환영 나비 차고 있고 제 나비가 하나라도 살아 있는 사람 (BFLY.ownFlies) — 나비들과 함께 간다
//              (2026-11-09 사용자 「환영 나비, 나비 포함해서 솔플이 안 된대서」 — butterfly.js 는 방만 만들어 주고 최소 인원은 못 낮췄다)
//   🫧 흔적    칭호를 달고 있는 사람 (trace.js _trace)
//
// ■ 무엇이
//   ① 이 사람이 만든 방은 「따로 두는 방」이다 — darkParties/<방>/soloRoom = { by, kind }.
//      구역이 찼는지 셀 때(isZoneTaken) 이 방은 빼고 센다 · 점유 기록(getZoneOccupant)도 이 방 것이면 없는 것으로 본다.
//      그래서 다른 팀은 이 방과 상관없이 그 구역에 방을 만들고 들어간다.
//   ② 이 사람은 구역이 차 있어도 방을 만들고 출발한다 (환영 나비 · 아기 호랑이와 같은 결 — 목록의 ⛔ 자리에 모집 단추).
//   ③ 방에 이 사람 혼자면 최소 인원이 1 — 혼자 출발한다 (어둠 안은 흔적 솔플과 같다 · 인원 1로 돈다).
//
// ■ 콘솔
//   soloRoomState()

(function soloRoom() {
'use strict';

const KINDS = {
    chil:  { ic: '🌟', n: '칠성군',  with: '염정성군과 함께' },
    eb:    { ic: '🐺', n: '정예 B조', with: '늑대 셋과 함께' },
    bfly:  { ic: '🦋', n: '환영 나비', with: '나비들과 함께' },
    trace: { ic: '🫧', n: '흔적',    with: '흔적을 달고' }
};

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function userOf(c) {
    const me = u_();
    if (me && me.code === c) return me;
    try { return (typeof db !== 'undefined' && db.users) ? db.users[c] : null; } catch (e) { return null; }
}
function parties() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

// 이 사람은 어떤 솔플인가 — 없으면 null
function soloKind(u) {
    if (!u) return null;
    try { if (typeof window.chilWears === 'function' && window.chilWears(u) && u.chil && Array.isArray(u.chil.yeom) && u.chil.yeom.length) return 'chil'; } catch (e) { }
    try { if (typeof window.ebWears === 'function' && window.ebWears(u) && Number(u.ebWolves) >= (window.EB && window.EB.WOLF_MAX || 3)) return 'eb'; } catch (e) { }
    try { if (window.BFLY && typeof window.BFLY.ownFlies === 'function' && window.BFLY.ownFlies(u) > 0) return 'bfly'; } catch (e) { }
    try { if (typeof window._trace === 'function' && window._trace(u)) return 'trace'; } catch (e) { }
    return null;
}
window.soloRoomKind = soloKind;
// 이 방이 따로 두는 방인가
function isSoloRoom(p) { return !!(p && p.soloRoom && p.soloRoom.by); }
function members(p) { return Object.keys((p && p.members) || {}); }
// 방장이 혼자이고 솔플 자격이 있다 — 최소 인원 1
function aloneLeader(p) {
    if (!p || !p.leader) return null;
    if (members(p).length !== 1) return null;
    return soloKind(userOf(p.leader));
}

// ==========================================
// ① 구역 셈에서 뺀다
// ==========================================
let bypass = false;
let hidden = {};             // isZoneTaken 이 도는 동안 잠깐 치워 둔 따로 두는 방 — getZoneOccupant 가 점유 기록을 볼 때 여기서도 찾는다
function hideSolo(fn) {
    const all = parties(), hid = {};
    Object.keys(all).forEach(function (pid) { if (isSoloRoom(all[pid])) { hid[pid] = all[pid]; delete all[pid]; } });
    const prev = hidden; hidden = hid;
    try { return fn(); }
    finally { hidden = prev; Object.keys(hid).forEach(function (pid) { if (!all[pid]) all[pid] = hid[pid]; }); }
}
function soloPid(pid) { return !!(pid && (isSoloRoom(parties()[pid]) || isSoloRoom(hidden[pid]))); }
(function hookTaken() {
    const iv = setInterval(function () {
        if (typeof isZoneTaken !== 'function') return;
        if (isZoneTaken._solo) { clearInterval(iv); return; }
        const _z = isZoneTaken;
        const w = function () {
            if (bypass) return false;
            const args = arguments, self = this;
            return hideSolo(function () { return _z.apply(self, args); });
        };
        Object.keys(_z).forEach(function (k) { try { w[k] = _z[k]; } catch (e) { } });
        w._solo = true;
        isZoneTaken = w; window.isZoneTaken = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookOccupant() {
    const iv = setInterval(function () {
        if (typeof getZoneOccupant !== 'function') return;
        if (getZoneOccupant._solo) { clearInterval(iv); return; }
        const _g = getZoneOccupant;
        const w = function () {
            const oc = _g.apply(this, arguments);
            try { if (oc && oc.partyId && soloPid(oc.partyId)) return null; } catch (e) { }
            return oc;
        };
        Object.keys(_g).forEach(function (k) { try { w[k] = _g[k]; } catch (e) { } });
        w._solo = true;
        getZoneOccupant = w; window.getZoneOccupant = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ② 구역이 차 있어도 만들고 · 출발한다 — 만든 방에 표를 단다
// ==========================================
(function hookCreate() {
    const iv = setInterval(function () {
        if (typeof createParty !== 'function') return;
        if (createParty._solo) { clearInterval(iv); return; }
        const _c = createParty;
        const w = function (zoneCode) {
            const me = u_(), kind = soloKind(me);
            const before = (typeof myPartyId !== 'undefined') ? myPartyId : null;
            if (kind) bypass = true;
            try { return _c.apply(this, arguments); }
            finally {
                bypass = false;
                try {
                    const pid = (typeof myPartyId !== 'undefined') ? myPartyId : null;
                    if (kind && pid && pid !== before) {
                        const tag = { by: me.code, kind: kind, at: Date.now() };
                        const all = parties(); if (all[pid]) all[pid].soloRoom = tag;
                        const d = db_(); if (d) d.ref('darkParties/' + pid + '/soloRoom').set(tag).catch(function () { });
                        console.log('[솔플] 따로 두는 방 — ' + KINDS[kind].ic + ' ' + KINDS[kind].n + ' · ' + pid);
                    }
                } catch (e) { }
            }
        };
        Object.keys(_c).forEach(function (k) { try { w[k] = _c[k]; } catch (e) { } });
        w._solo = true;
        createParty = w; window.createParty = w;
        clearInterval(iv);
        console.log('[솔플] 따로 두는 방 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookLaunch() {
    const iv = setInterval(function () {
        if (typeof launchParty !== 'function' || typeof DARK_ZONES === 'undefined') return;
        if (launchParty._solo) { clearInterval(iv); return; }
        const _l = launchParty;
        const w = function () {
            const me = u_();
            let z = null, min0 = null;
            try {
                const p = (typeof getMyParty === 'function') ? getMyParty() : null;
                if (me && p && p.leader === me.code && DARK_ZONES[p.zone]) {
                    if (isSoloRoom(p) || soloKind(me)) bypass = true;               // 「방금 다른 팀이 진입했습니다」 를 건너뛴다
                    if (aloneLeader(p) && DARK_ZONES[p.zone].min > 1) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; }
                }
            } catch (e) { }
            try { return _l.apply(this, arguments); }
            finally { bypass = false; if (z && min0 != null) z.min = min0; }
        };
        Object.keys(_l).forEach(function (k) { try { w[k] = _l[k]; } catch (e) { } });
        w._solo = true;
        launchParty = w; window.launchParty = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// ③ 방 화면 — 혼자면 최소 인원 1 · 한 줄 알림
// ==========================================
(function hookRoom() {
    const iv = setInterval(function () {
        if (typeof renderPartyRoom !== 'function' || typeof DARK_ZONES === 'undefined') return;
        if (renderPartyRoom._solo) { clearInterval(iv); return; }
        const _r = renderPartyRoom;
        const w = function (p, body) {
            let z = null, min0 = null, kind = null;
            try {
                kind = aloneLeader(p);
                if (kind && DARK_ZONES[p.zone] && DARK_ZONES[p.zone].min > 1) { z = DARK_ZONES[p.zone]; min0 = z.min; z.min = 1; }
            } catch (e) { }
            let out;
            try { out = _r.apply(this, arguments); } finally { if (z && min0 != null) z.min = min0; }
            try {
                const host = body || document.getElementById('dark-party-body');
                const k = kind || ((isSoloRoom(p)) ? p.soloRoom.kind : null);
                if (host && k && KINDS[k] && !host.querySelector('.solo-room-note')) {
                    const note = '<div class="solo-room-note" style="margin:0 0 10px; padding:8px 10px; border:1px dashed #6b5a2e; border-radius:6px; font-size:10.5px; line-height:1.7; color:#d8cba8; background:rgba(0,0,0,0.25);">'
                        + KINDS[k].ic + ' <b>' + esc(KINDS[k].with) + '</b>' + (kind ? ' — 혼자서도 출발할 수 있습니다 (최소 인원 ' + (min0 || 1) + ' → 1).' : '')
                        + '<br><span style="color:#9a8a6a;">이 방은 따로 두는 방입니다 — 구역을 차지한 것으로 세지 않아 다른 팀도 같은 구역에 들어갈 수 있습니다.</span></div>';
                    const btn = Array.prototype.filter.call(host.querySelectorAll('button'), function (b) { return /어둠으로 진입|대기 중/.test(b.textContent || ''); })[0];
                    if (btn) btn.insertAdjacentHTML('beforebegin', note);
                    else host.insertAdjacentHTML('beforeend', note);
                }
            } catch (e) { }
            return out;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._solo = true;
        renderPartyRoom = w; window.renderPartyRoom = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 구역 목록 — ⛔ 자리에 모집 단추 (환영 나비 · 아기 호랑이가 이미 끼웠으면 그대로)
// ==========================================
function openZoneList(body) {
    const me = u_(), kind = soloKind(me);
    if (!body || !kind) return 0;
    let n = 0;
    Array.prototype.forEach.call(body.querySelectorAll('div'), function (d) {
        const f = (d.style && d.style.fontFamily) || '';
        if (f.indexOf('monospace') < 0) return;
        const code = String(d.textContent || '').trim();
        if (typeof DARK_ZONES === 'undefined' || !DARK_ZONES[code]) return;
        const z = DARK_ZONES[code];
        if (!z || !(z.max > 1)) return;
        const left = d.parentElement, row = left && left.parentElement, right = row && row.lastElementChild;
        if (!right || right === left) return;
        if (String(right.textContent || '').indexOf('⛔') < 0) return;
        try { if (typeof isZoneOpen === 'function' && !isZoneOpen(code)) return; } catch (e) { }
        right.innerHTML = '<button class="game-btn" style="margin:0; padding:8px 12px; font-size:11px;'
            + ' background:linear-gradient(145deg,#5a4a1e,#2a2210) !important; border-color:#d4af37 !important;"'
            + ' onclick="createParty(\'' + esc(code) + '\')">' + KINDS[kind].ic + ' 파티<br>모집</button>';
        n++;
    });
    return n;
}
(function hookZoneList() {
    const iv = setInterval(function () {
        if (typeof renderDarkness !== 'function') return;
        if (renderDarkness._solo) { clearInterval(iv); return; }
        const _d = renderDarkness;
        const w = function () {
            const out = _d.apply(this, arguments);
            try { openZoneList(document.getElementById('darkness-body')); } catch (e) { }
            return out;
        };
        Object.keys(_d).forEach(function (k) { try { w[k] = _d[k]; } catch (e) { } });
        w._solo = true;
        renderDarkness = w; window.renderDarkness = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

window.soloRoomState = function () {
    const me = u_(), k = soloKind(me);
    console.log('[솔플] 나 —', k ? KINDS[k].ic + ' ' + KINDS[k].n + ' (' + KINDS[k].with + ')' : '자격 없음');
    const all = parties();
    Object.keys(all).forEach(function (pid) { const p = all[pid]; if (isSoloRoom(p)) console.log('  따로 두는 방', pid, p.zone, p.state, '방장', p.leaderName, '·', (KINDS[p.soloRoom.kind] || {}).n, '· 인원', members(p).length); });
};
console.log('[솔플] 따로 두는 방 — 🌟 칠성군(염정) · 🐺 B조(늑대 셋) · 🦋 환영 나비(나비들) · 🫧 흔적');
})();
