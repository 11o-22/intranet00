// ==========================================
// ★ 🏠 사택 공동명의 — 소유주가 정한다 (2026-10-23)
// bundles.json 마지막 묶음 맨 뒤 (house-L.js · house-save.js · roommate.js 보다 뒤)
// ==========================================
//
// ■ 무엇인가
//
//   소유주가 사원 한 명을 공동명의자로 둔다. 사번을 적어 요청하면 상대가 받아야 성립한다.
//
//     등급 공유     공동명의자는 소유주 집의 등급을 같이 쓴다 (houseGrade — 제 집 · 룸메 집 · 공동명의 집 가운데 높은 쪽).
//                   소유주가 집을 올리면 공동명의자도 같이 오른다. 소유주는 공동명의자의 등급을 받지 않는다 — 소유주의 집이다.
//     승급 적립금   둘 다 그 집의 승급 적립금에 포인트를 넣을 수 있다. 소유주가 이사(승급)할 때 적립금부터 쓴다.
//                   넣은 포인트는 돌려받지 못한다 — 집(소유주)의 것이다. 공동명의가 끝나도 적립금은 집에 남는다.
//     등록비        요청할 때 소유주가 낸다 (그 집 등급 이사비의 10% · 적어도 10,000 P).
//                   상대가 거절하거나 소유주가 요청을 거두면 돌려받는다. 받아들이면 쓰인다.
//     끝내기        소유주는 언제든 해제한다. 공동명의자도 스스로 빠질 수 있다. 등록비는 돌려주지 않는다.
//
//   ★ 공동명의는 한 사람에 하나다 — 내 집에 한 명을 두거나, 남의 집 한 곳에 들어가거나 (요청 중인 것도 하나로 센다).
//   ★ 룸메이트(주간 재배정)와는 따로다 — 공동명의자라고 같이 살게 되지는 않는다.
//   ★ 상담사는 빠진다 (관사 L 등급).
//
// ■ 어디에 적나 — 남의 사원 기록을 건드리지 않는다
//
//     houseCo/<소유주>    { to: 공동명의자, at, fee, st: 'ask' | 'yes' | 'no', since }
//     houseFund/<소유주>  승급 적립금 (포인트 숫자)
//
//   등록비를 내고 돌려받는 것은 늘 **소유주 제 화면**이 한다 (거절은 st 'no' 로 남기고, 소유주 화면이 보고 돌려받은 뒤 지운다).
//   소유주가 꺼져 있었으면 다음에 들어올 때 돌려받는다.
//
// ■ 콘솔
//   houseCoState()

(function houseCo() {

const ADMIN = 'kario0987';
const FEE_RATE = 0.10, FEE_MIN = 10000;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function dbOK() { return typeof database !== 'undefined' && !!database; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function nameOf(c) { const u = users()[c]; return (u && u.name) || c; }
function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function alert_(m) { try { showCustomAlert(m); } catch (e) { } }
function log_(t) { try { const u = me(); if (u) { addHistoryLog(u, t); saveFields({ history: 1 }); } } catch (e) { } }
function grades() { return (typeof HOUSE_GRADES !== 'undefined') ? HOUSE_GRADES : ['D', 'C', 'B', 'A', 'S']; }
function info(g) { return (typeof HOUSE_INFO !== 'undefined' && HOUSE_INFO[g]) || null; }
function ownG(u) { return (u && u.house && u.house.grade) || 'D'; }
function feeOf(g) { const i = info(g); return Math.max(FEE_MIN, Math.round(((i && i.cost) || 0) * FEE_RATE)); }

// ==========================================
// 들고 있는 것 — 둘 다 작은 자리라 통째로 듣는다
// ==========================================
let CO = {}, FUND = {};
(function listen() {
    const iv = setInterval(function () {
        if (!dbOK()) return;
        clearInterval(iv);
        database.ref('houseCo').on('value', function (s) { CO = s.val() || {}; tick(); });
        database.ref('houseFund').on('value', function (s) { FUND = s.val() || {}; paint(); });
    }, 500);
})();

// c 가 공동명의자로 들어가 있는 집의 소유주 (없으면 null)
function ownerOf(c) {
    const k = Object.keys(CO).filter(function (o) { return CO[o] && CO[o].to === c && CO[o].st === 'yes'; })[0];
    return k || null;
}
// c 의 공동명의 묶임 — 내 집에 둔 것(요청 중 포함) · 남의 집에 들어간 것
function linkOf(c) {
    const mine = CO[c];
    if (mine && (mine.st === 'ask' || mine.st === 'yes')) return { role: 'owner', o: c, x: mine };
    const o = ownerOf(c);
    if (o) return { role: 'co', o: o, x: CO[o] };
    return null;
}
function fundOf(o) { return Math.max(0, Math.floor(Number(FUND[o]) || 0)); }

// ==========================================
// 등급 공유 — houseGrade 를 감싼다 (L 같은 특별 등급은 그대로 둔다)
// ==========================================
(function hookGrade() {
    const iv = setInterval(function () {
        if (typeof houseGrade !== 'function') return;
        if (houseGrade._co) return;
        // house-L.js 가 먼저 싸고 난 뒤에 싼다 (그쪽이 안쪽이 되어 L 을 그대로 돌려준다)
        if (!houseGrade._L && Date.now() - T0 < 8000) return;
        const _g = houseGrade;
        const w = function (user) {
            const g = _g.apply(this, arguments);
            try {
                const G = grades();
                if (!user || !user.code || G.indexOf(g) < 0) return g;
                const o = ownerOf(user.code);
                if (!o || !users()[o]) return g;
                const og = ownG(users()[o]);
                return G.indexOf(og) > G.indexOf(g) ? og : g;
            } catch (e) { return g; }
        };
        Object.keys(_g).forEach(function (k) { try { w[k] = _g[k]; } catch (e) { } });
        w._co = true;
        houseGrade = w; window.houseGrade = w;
        clearInterval(iv);
        console.log('[공동명의] 등급 공유 연결');
    }, 400);
    const T0 = Date.now();
})();

// ==========================================
// 이사(승급) — 소유주는 적립금부터 쓴다 · 공동명의자는 그 집을 올리지 않는다
// ==========================================
(function hookMove() {
    const iv = setInterval(function () {
        if (typeof houseMove !== 'function') return;
        if (houseMove._co) return;
        if (!houseMove._L && Date.now() - T0 < 8000) return;
        const _m = houseMove;
        const w = function () {
            const u = me();
            if (!u) return _m.apply(this, arguments);
            const L = linkOf(u.code);
            // 공동명의자 — 소유주 집 등급을 쓰고 있으면 그 집은 소유주가 올린다
            if (L && L.role === 'co') {
                const G = grades(), og = ownG(users()[L.o]);
                if (G.indexOf(og) > G.indexOf(ownG(u))) {
                    alert_('공동명의 중입니다.\n\n' + nameOf(L.o) + ' 사원의 집(' + og + '급)을 같이 쓰고 있습니다.\n'
                        + '승급은 소유주가 하고, 승급 적립금에 포인트를 보탤 수 있습니다.');
                    return;
                }
                return _m.apply(this, arguments);
            }
            const fund = fundOf(u.code);
            if (!fund) return _m.apply(this, arguments);
            // 소유주 — 적립금만큼 잠깐 얹어 두고 이사한다. 이사가 됐으면 적립금에서 뺀다.
            const G = grades();
            const cur = (typeof houseGrade === 'function') ? houseGrade(u) : ownG(u);
            const nextG = G[G.indexOf(cur) + 1];
            const next = nextG ? info(nextG) : null;
            if (!next) return _m.apply(this, arguments);
            const used = Math.min(fund, next.cost);
            const before = ownG(u);
            u.points = (Number(u.points) || 0) + used;
            let r;
            try { r = _m.apply(this, arguments); }
            finally {
                if (ownG(u) === before) {                       // 이사가 안 됐다 — 얹은 것을 되돌린다
                    u.points = (Number(u.points) || 0) - used;
                } else {
                    database.ref('houseFund/' + u.code).transaction(function (v) {
                        return Math.max(0, (Number(v) || 0) - used);
                    });
                    log_('[사택] 승급 적립금 ' + used.toLocaleString() + ' P 를 이사에 썼습니다. (내 돈 '
                        + Math.max(0, next.cost - used).toLocaleString() + ' P)');
                    try { saveFields({ points: 1 }); } catch (e) { }
                }
            }
            return r;
        };
        Object.keys(_m).forEach(function (k) { try { w[k] = _m[k]; } catch (e) { } });
        w._co = true;
        houseMove = w; window.houseMove = w;
        clearInterval(iv);
        console.log('[공동명의] 이사 · 적립금 연결');
    }, 400);
    const T0 = Date.now();
})();

// ==========================================
// 요청 · 받기 · 거절 · 거두기 · 해제 · 빠지기
// ==========================================
window.houseCoAsk = function () {
    const u = me(); if (!u || !dbOK()) return;
    if (u.code === ADMIN) { alert_('관사는 공동명의를 둘 수 없습니다.'); return; }
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    if (linkOf(u.code)) { alert_('공동명의는 한 사람에 하나입니다.'); return; }
    const el = document.getElementById('house-co-no');
    const no = String((el && el.value) || '').trim();
    if (!no) { alert_('사번을 적어 주십시오.'); return; }
    const t = Object.keys(users()).map(function (c) { return users()[c]; })
        .filter(function (x) { return x && (String(x.no) === no || x.code === no); })[0];
    if (!t) { alert_('그 사번을 찾지 못했습니다.'); return; }
    if (t.code === u.code) { alert_('자기 사번은 적을 수 없습니다.'); return; }
    if (t.code === ADMIN) { alert_('상담사는 공동명의로 둘 수 없습니다.'); return; }
    if (linkOf(t.code)) { alert_(t.name + ' 사원은 이미 다른 공동명의가 있습니다.'); return; }
    const fee = feeOf(ownG(u));
    if ((Number(u.points) || 0) < fee) { try { showLuxuryAlert(); } catch (e) { alert_('포인트가 부족합니다.'); } return; }
    const ref = database.ref('houseCo/' + u.code);
    let made = false, wait = false;
    ref.transaction(function (cur) {
        made = false; wait = false;
        if (cur && cur.st === 'no') { wait = true; return; }              // 거절된 앞 요청 — 등록비를 먼저 돌려받는다 (tick)
        if (cur && (cur.st === 'ask' || cur.st === 'yes')) return;      // 그 사이에 걸렸다
        made = true;
        return { to: t.code, at: Date.now(), fee: fee, st: 'ask' };
    }).then(function (res) {
        if (wait) { tick(); alert_('앞선 요청이 거절되어 등록비를 돌려받는 중입니다.\n잠시 뒤 다시 요청해 주십시오.'); return; }
        if (!res || !res.committed || !made) { alert_('이미 공동명의 요청이 있습니다.'); return; }
        u.points = (Number(u.points) || 0) - fee;
        try { saveFields({ points: 1 }); } catch (e) { }
        log_('[사택] ' + t.name + ' 사원에게 공동명의를 요청했습니다. (등록비 -' + fee.toLocaleString() + ' P · 거절하면 돌려받음)');
        try { updateUI(); } catch (e) { }
        alert_(t.name + ' 사원에게 공동명의를 요청했습니다.\n\n등록비 ' + fee.toLocaleString() + ' P\n상대가 받으면 성립하고, 거절하면 돌려받습니다.');
        paint();
    }).catch(function () { alert_('적지 못했습니다. 다시 시도해 주세요.'); });
};

// 받는다 · 거절한다 — 받는 쪽 화면
window.houseCoAnswer = function (owner, yes) {
    const u = me(); if (!u || !dbOK()) return;
    if (yes && linkOf(u.code)) { alert_('공동명의는 한 사람에 하나입니다.\n\n지금 걸린 것(요청 중 포함)을 먼저 정리해 주십시오.'); return; }
    let ok = false;
    database.ref('houseCo/' + owner).transaction(function (cur) {
        if (!cur || cur.to !== u.code || cur.st !== 'ask') return;
        ok = true;
        const n = Object.assign({}, cur);
        n.st = yes ? 'yes' : 'no';
        if (yes) n.since = Date.now();
        return n;
    }).then(function (res) {
        if (!res || !res.committed || !ok) { alert_('이미 끝난 요청입니다.'); return; }
        if (yes) {
            const og = ownG(users()[owner]);
            log_('[사택] ' + nameOf(owner) + ' 사원 집의 공동명의자가 되었습니다. (' + og + '급을 같이 씁니다)');
            alert_(nameOf(owner) + ' 사원 집의 공동명의자가 되었습니다.\n\n그 집 등급(' + og + '급)을 같이 씁니다.\n승급 적립금에 포인트를 보탤 수 있습니다.');
        } else {
            log_('[사택] ' + nameOf(owner) + ' 사원의 공동명의 요청을 거절했습니다.');
        }
        try { if (typeof renderHouse === 'function') renderHouse(); } catch (e) { }
    });
};

// 소유주 — 요청 거두기(등록비 돌려받음) · 해제(돌려받지 않음)
window.houseCoCancel = function () {
    const u = me(); if (!u || !dbOK()) return;
    const ref = database.ref('houseCo/' + u.code);
    let was = null;
    ref.transaction(function (cur) {
        if (!cur) return;
        was = cur;
        return null;
    }).then(function (res) {
        if (!res || !res.committed || !was) return;
        if (was.st === 'ask' || was.st === 'no') {
            refund(was, '요청을 거두었습니다');
        } else if (was.st === 'yes') {
            log_('[사택] ' + nameOf(was.to) + ' 사원과의 공동명의를 해제했습니다.');
            alert_(nameOf(was.to) + ' 사원과의 공동명의를 해제했습니다.');
        }
        try { if (typeof renderHouse === 'function') renderHouse(); } catch (e) { }
    });
};
// 공동명의자 — 스스로 빠진다
window.houseCoLeave = function () {
    const u = me(); if (!u || !dbOK()) return;
    const o = ownerOf(u.code); if (!o) return;
    if (!askTwice('leave')) { paint(); return; }
    let ok = false;
    database.ref('houseCo/' + o).transaction(function (cur) {
        if (!cur || cur.to !== u.code || cur.st !== 'yes') return;
        ok = true;
        return null;
    }).then(function (res) {
        if (!res || !res.committed || !ok) return;
        log_('[사택] ' + nameOf(o) + ' 사원 집의 공동명의에서 빠졌습니다.');
        alert_(nameOf(o) + ' 사원 집의 공동명의에서 빠졌습니다.');
        try { if (typeof renderHouse === 'function') renderHouse(); } catch (e) { }
    });
};

function refund(x, why) {
    const u = me(); if (!u) return;
    const fee = Math.max(0, Number(x.fee) || 0);
    if (fee) { u.points = (Number(u.points) || 0) + fee; try { saveFields({ points: 1 }); } catch (e) { } }
    log_('[사택] ' + nameOf(x.to) + ' 사원 공동명의 — ' + why + '. (등록비 +' + fee.toLocaleString() + ' P 돌려받음)');
    try { updateUI(); } catch (e) { }
}

// 거절된 요청 — 소유주 화면이 보고 등록비를 돌려받은 뒤 지운다 (한 번만)
let busy = false;
function tick() {
    paint();
    const u = me(); if (!u || !dbOK() || busy) return;
    const x = CO[u.code];
    if (!x || x.st !== 'no') return;
    busy = true;
    let got = null;
    database.ref('houseCo/' + u.code).transaction(function (cur) {
        if (!cur || cur.st !== 'no') return;
        got = cur;
        return null;
    }).then(function (res) {
        busy = false;
        if (!res || !res.committed || !got) return;
        refund(got, '상대가 거절했습니다');
        alert_(nameOf(got.to) + ' 사원이 공동명의를 거절했습니다.\n\n등록비 ' + (Number(got.fee) || 0).toLocaleString() + ' P 를 돌려받았습니다.');
    }).catch(function () { busy = false; });
}

// ==========================================
// 승급 적립금에 넣는다 — 소유주 · 공동명의자 둘 다
// ==========================================
window.houseCoFund = function () {
    const u = me(); if (!u || !dbOK()) return;
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const L = linkOf(u.code);
    if (!L || L.x.st !== 'yes') { alert_('공동명의가 성립한 집에만 넣을 수 있습니다.'); return; }
    const el = document.getElementById('house-co-amt');
    const amt = Math.floor(Number(el && el.value) || 0);
    if (!(amt > 0)) { alert_('올바른 금액을 적어 주십시오.'); return; }
    if ((Number(u.points) || 0) < amt) { try { showLuxuryAlert(); } catch (e) { alert_('포인트가 부족합니다.'); } return; }
    // 먼저 깎고 적립금에 더한다 — 적립금 쓰기가 실패하면 되돌린다
    u.points = (Number(u.points) || 0) - amt;
    try { saveFields({ points: 1 }); } catch (e) { }
    database.ref('houseFund/' + L.o).transaction(function (v) { return (Number(v) || 0) + amt; })
        .then(function (res) {
            if (!res || !res.committed) throw new Error('not committed');
            log_('[사택] ' + (L.role === 'owner' ? '내 집' : nameOf(L.o) + ' 사원 집') + ' 승급 적립금에 '
                + amt.toLocaleString() + ' P 를 넣었습니다. (돌려받지 못함)');
            try { updateUI(); } catch (e) { }
            if (el) el.value = '';
            paint();
        })
        .catch(function () {
            u.points = (Number(u.points) || 0) + amt;
            try { saveFields({ points: 1 }); } catch (e) { }
            alert_('넣지 못했습니다. 다시 시도해 주십시오.');
        });
};

// ==========================================
// 사택 화면 — 공동명의 칸
// ==========================================
let ask2 = null;                       // 한 번 더 눌러야 되는 것 ('leave' | 'cut')
function askTwice(k) { if (ask2 === k) { ask2 = null; return true; } ask2 = k; setTimeout(function () { if (ask2 === k) { ask2 = null; paint(); } }, 4000); return false; }
window.houseCoCut = function () {
    if (!askTwice('cut')) { paint(); return; }
    window.houseCoCancel();
};

const BOX = 'background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:12px; margin-bottom:14px; font-size:11px; color:#ccc; line-height:1.75;';
const HEAD = 'font-size:10px; color:#c9a8ff; font-weight:bold; margin-bottom:7px;';
const SUB = 'font-size:10px; color:#888;';
const BTN = 'margin:0; padding:9px 10px; font-size:11px;';
const INP = 'flex:1; min-width:0; text-align:center;';

function boxHtml() {
    const u = me(); if (!u) return '';
    if (u.code === ADMIN) return '';
    const L = linkOf(u.code);
    const G = grades();
    let h = '<div style="' + HEAD + '">🏠 공동명의</div>';
    // 나에게 온 요청
    const asks = Object.keys(CO).filter(function (o) { return CO[o] && CO[o].to === u.code && CO[o].st === 'ask'; });
    asks.forEach(function (o) {
        const og = ownG(users()[o]);
        h += '<div style="border:1px dashed #6a5a8a; border-radius:5px; padding:9px; margin-bottom:9px;">'
            + '<b style="color:#fff;">' + esc(nameOf(o)) + '</b> 사원이 공동명의를 요청했습니다.<br>'
            + '<span style="' + SUB + '">받으면 그 집 등급(<b style="color:#ffd700;">' + og + '급</b> · ' + esc((info(og) || {}).name || '') + ')을 같이 씁니다. 그 집이 오르면 같이 오릅니다.</span>'
            + '<div style="display:flex; gap:6px; margin-top:8px;">'
            + '<button class="game-btn" style="flex:1;' + BTN + '" onclick="houseCoAnswer(\'' + esc(o) + '\', true)"' + (L ? ' disabled' : '') + '>받는다</button>'
            + '<button class="game-btn" style="flex:1;' + BTN + '" onclick="houseCoAnswer(\'' + esc(o) + '\', false)">거절한다</button></div>'
            + (L ? '<div style="' + SUB + ' margin-top:5px;">공동명의는 한 사람에 하나입니다 — 지금 걸린 것을 먼저 정리해야 받을 수 있습니다.</div>' : '')
            + '</div>';
    });
    if (!L) {
        const fee = feeOf(ownG(u));
        h += '<div>내 집(' + ownG(u) + '급)에 공동명의자 한 명을 둘 수 있습니다.<br>'
            + '<span style="' + SUB + '">공동명의자는 이 집 등급을 같이 쓰고, 승급 적립금에 포인트를 보탤 수 있습니다. 룸메이트와는 따로입니다.</span></div>'
            + '<div style="display:flex; gap:6px; margin-top:8px;">'
            + '<input id="house-co-no" class="bet-input" style="' + INP + '" placeholder="사번" autocomplete="off">'
            + '<button class="game-btn" style="' + BTN + '" onclick="houseCoAsk()">요청 · ' + fee.toLocaleString() + ' P</button></div>'
            + '<div style="' + SUB + ' margin-top:5px;">등록비는 상대가 거절하거나 요청을 거두면 돌려받습니다.</div>';
    } else if (L.role === 'owner' && L.x.st === 'ask') {
        h += '<div><b style="color:#fff;">' + esc(nameOf(L.x.to)) + '</b> 사원에게 요청 중입니다. (등록비 ' + (Number(L.x.fee) || 0).toLocaleString() + ' P)</div>'
            + '<button class="game-btn" style="width:100%; margin-top:8px; padding:9px; font-size:11px;" onclick="houseCoCancel()">요청을 거둔다 (등록비 돌려받음)</button>';
    } else {
        const o = L.o, og = ownG(users()[o]);
        const fund = fundOf(o);
        const nextG = G[G.indexOf(og) + 1], next = nextG ? info(nextG) : null;
        if (L.role === 'owner') {
            h += '<div>공동명의자 <b style="color:#fff;">' + esc(nameOf(L.x.to)) + '</b> 사원 — 이 집(' + og + '급)을 같이 씁니다.</div>';
        } else {
            h += '<div><b style="color:#fff;">' + esc(nameOf(o)) + '</b> 사원 집의 공동명의자입니다 — <b style="color:#ffd700;">' + og + '급</b>(' + esc((info(og) || {}).name || '') + ')을 같이 씁니다.</div>'
                + (G.indexOf(ownG(u)) >= G.indexOf(og) ? '<div style="' + SUB + '">내 명의(' + ownG(u) + '급)가 더 높거나 같아 지금은 내 등급을 씁니다.</div>' : '');
        }
        h += '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #3a3050;">승급 적립금 <b style="color:#ffd700;">' + fund.toLocaleString() + ' P</b>'
            + (next ? ' <span style="' + SUB + '">· 다음 ' + nextG + '급 ' + next.cost.toLocaleString() + ' P</span>' : ' <span style="' + SUB + '">· 최상층</span>') + '</div>'
            + '<div style="' + SUB + '">소유주가 이사(승급)할 때 적립금부터 씁니다. 넣은 포인트는 돌려받지 못합니다.</div>'
            + (next ? '<div style="display:flex; gap:6px; margin-top:7px;">'
                + '<input type="number" id="house-co-amt" class="bet-input" style="' + INP + '" placeholder="금액" min="1">'
                + '<button class="game-btn" style="' + BTN + '" onclick="houseCoFund()">적립금에 넣기</button></div>' : '')
            + (L.role === 'owner'
                ? '<button class="game-btn" style="width:100%; margin-top:9px; padding:9px; font-size:11px;" onclick="houseCoCut()">'
                    + (ask2 === 'cut' ? '한 번 더 누르면 해제합니다' : '공동명의 해제') + '</button>'
                : '<button class="game-btn" style="width:100%; margin-top:9px; padding:9px; font-size:11px;" onclick="houseCoLeave()">'
                    + (ask2 === 'leave' ? '한 번 더 누르면 빠집니다' : '공동명의에서 빠지기') + '</button>');
    }
    return h;
}

// 이사 단추 — 적립금을 더해 살 수 있으면 켠다 (소유주)
function fixMoveBtn() {
    const u = me(); if (!u) return;
    const b = document.querySelector('#house-main-body button[onclick*="houseMove"]');
    if (!b) return;
    const L = linkOf(u.code);
    const fund = fundOf(u.code);
    const G = grades();
    const cur = (typeof houseGrade === 'function') ? houseGrade(u) : ownG(u);
    const nextG = G[G.indexOf(cur) + 1], next = nextG ? info(nextG) : null;
    let note = document.getElementById('house-co-movenote');
    if (L && L.role === 'co' && G.indexOf(ownG(users()[L.o])) > G.indexOf(ownG(u))) {
        b.disabled = true; b.style.opacity = '0.4';
        b.textContent = '승급은 소유주가 합니다';
        if (!note) { b.insertAdjacentHTML('beforebegin', '<div id="house-co-movenote" style="' + SUB + ' margin-top:6px;"></div>'); note = document.getElementById('house-co-movenote'); }
        note.textContent = '공동명의 중 — ' + nameOf(L.o) + ' 사원의 집을 같이 씁니다. 적립금에 보탤 수 있습니다.';
        return;
    }
    if (!fund || !next) { if (note) note.remove(); return; }
    const pay = Math.max(0, next.cost - Math.min(fund, next.cost));
    const can = (Number(u.points) || 0) >= pay;
    b.disabled = !can; b.style.opacity = can ? '' : '0.4';
    b.textContent = can ? '이사한다' : '포인트가 부족합니다';
    if (!note) { b.insertAdjacentHTML('beforebegin', '<div id="house-co-movenote" style="font-size:10px; color:#c9a8ff; margin-top:6px;"></div>'); note = document.getElementById('house-co-movenote'); }
    note.textContent = '승급 적립금 ' + Math.min(fund, next.cost).toLocaleString() + ' P 를 먼저 씁니다 — 내 돈 ' + pay.toLocaleString() + ' P';
}

function paint() {
    const host = document.getElementById('house-main-body');
    if (!host || !me()) return;
    let el = document.getElementById('house-co-box');
    const html = boxHtml();
    if (!html) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = 'house-co-box';
        el.style.cssText = BOX;
        const before = document.getElementById('house-note-box');
        if (before && before.parentNode === host) host.insertBefore(el, before); else host.appendChild(el);
    }
    // 적는 중인 칸은 지키고 다시 그린다
    const keep = {};
    ['house-co-no', 'house-co-amt'].forEach(function (id) { const x = document.getElementById(id); if (x) keep[id] = x.value; });
    const focus = document.activeElement && document.activeElement.id;
    if (el.innerHTML !== html) {
        el.innerHTML = html;
        Object.keys(keep).forEach(function (id) { const x = document.getElementById(id); if (x) x.value = keep[id]; });
        if (focus) { const f = document.getElementById(focus); if (f) try { f.focus(); } catch (e) { } }
    }
    try { fixMoveBtn(); } catch (e) { }
}

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._co) return;
        const _r = renderHouse;
        const w = function () {
            const r = _r.apply(this, arguments);
            setTimeout(function () { try { paint(); } catch (e) { } }, 120);
            return r;
        };
        Object.keys(_r).forEach(function (k) { try { w[k] = _r[k]; } catch (e) { } });
        w._co = true;
        renderHouse = w; window.renderHouse = w;
    }, 600);
})();

// ==========================================
// 콘솔
// ==========================================
window.houseCoState = function () {
    console.log('%c===== 🏠 사택 공동명의 =====', 'color:#c9a8ff; font-size:13px');
    const rows = Object.keys(CO).map(function (o) {
        const x = CO[o] || {};
        return { 소유주: nameOf(o), 공동명의자: nameOf(x.to), 상태: { ask: '요청 중', yes: '성립', no: '거절(돌려받기 전)' }[x.st] || x.st,
                 소유주등급: ownG(users()[o]), 등록비: x.fee || 0, 적립금: fundOf(o) };
    });
    if (rows.length) console.table(rows); else console.log('  없습니다.');
    const u = me();
    if (u) console.log('  나:', JSON.stringify(linkOf(u.code)), '· 쓰는 등급', (typeof houseGrade === 'function') ? houseGrade(u) : '-');
};

console.log('[공동명의] 사택 공동명의 — houseCoState()');

})();
