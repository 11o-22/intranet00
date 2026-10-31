// ==========================================
// ★ 「이상한 나라의 ■■■」 — 미션 성공 보상 (2026-10-31)
// bundles.json 마지막 묶음 — wonder-core.js 다음
// ==========================================
//
//   챕터마다 미션을 성공하면(이상한 나라 쪽이든 어둠 쪽이든) 한 번 굴린다. 실패는 아무것도 없이 다음 챕터.
//     · 한정 교환권 여섯 가지 — 각각 0.1%
//         한정 의상 교환권 · 한정 악세서리 교환권 · 한정 장비 교환권
//         한정 펫 의상 교환권 · 한정 펫 악세서리 교환권 · 한정 칭호 교환권
//     · 나머지(99.4%) — 5,000 ~ 10,000 P
//   교환권은 「교환을 위한 준비중」. 사용 단추는 꺼 두고, 판매도 막는다(잘못 팔아 버리지 않게).
//   팀이면 사람마다 따로 굴린다. 같은 챕터 보상은 한 번만.
//
// ■ 콘솔 (관리자)
//   wonderRewardTest(n)  n번 굴려 나온 것 세기 (지급 없음)

(function wonderReward() {
'use strict';
const X = window.WONDER;
if (!X || typeof ITEM_CATALOG === 'undefined') return;

const TICKETS = ['한정 의상 교환권', '한정 악세서리 교환권', '한정 장비 교환권', '한정 펫 의상 교환권', '한정 펫 악세서리 교환권', '한정 칭호 교환권'];
const P_TICKET = 0.001;
const PTS = [5000, 10000];
X.TICKETS = TICKETS;

TICKETS.forEach(function (n) {
    ITEM_CATALOG[n] = { price: '???', usable: false, targetable: false, wonderTicket: true, desc: '[이상한 나라] 교환을 위한 준비중' };
});
try { TICKETS.forEach(function (n) { if (NO_SELL_ITEMS.indexOf(n) < 0) NO_SELL_ITEMS.push(n); }); } catch (e) { }

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

// 한 번 굴린다 — { kind:'ticket', name } | { kind:'points', n }
function draw(rnd) {
    rnd = rnd || Math.random;
    const r = rnd();
    const i = Math.floor(r / P_TICKET);
    if (i < TICKETS.length) return { kind: 'ticket', name: TICKETS[i] };
    return { kind: 'points', n: PTS[0] + Math.floor(rnd() * (PTS[1] - PTS[0] + 1)) };
}
X.rewardDraw = draw;

// 지급 — key 는 회차·챕터 열쇠 (같은 챕터 두 번 받지 않게)
X.reward = function (key, chName, misName) {
    const F = X.F();
    if (!F) return null;
    F.rewarded = F.rewarded || {};
    if (F.rewarded[key]) return F.rewarded[key];
    const u = currentUser;
    const got = draw();
    if (got.kind === 'ticket') {
        if (!u.inventory) u.inventory = [];
        u.inventory.push(got.name);
        try { if (typeof darkRun !== 'undefined' && darkRun) darkRun.wGainItems = (Array.isArray(darkRun.wGainItems) ? darkRun.wGainItems : []).concat([got.name]); } catch (e) { }   // 쓰러져도 남는다 (wonder-core.js die)
        try { addHistoryLog(u, '[이상한 나라] ' + chName + ' 「' + misName + '」 성공 — ' + got.name + ' 획득'); } catch (e) { }
    } else {
        u.points = (Number(u.points) || 0) + got.n;
        try { if (typeof darkRun !== 'undefined' && darkRun) darkRun.wGain = (Number(darkRun.wGain) || 0) + got.n; } catch (e) { }       // 쓰러져도 남는다 (wonder-core.js die)
        try { addHistoryLog(u, '[이상한 나라] ' + chName + ' 「' + misName + '」 성공 — +' + got.n.toLocaleString() + ' P'); } catch (e) { }
        try { showPointGainEffect(got.n); } catch (e) { }
    }
    try { darkRun.log.push('[보상] ' + (got.kind === 'ticket' ? got.name : got.n + ' P')); } catch (e) { }
    got.key = key; got.at = Date.now();
    F.rewarded[key] = got;
    F.lastReward = got;
    try { saveSelfFull(); } catch (e) { }
    try { updateUI(); } catch (e) { }
    X.save();
    return got;
};
X.rewardHtml = function (got) {
    if (!got) return '';
    const t = got.kind === 'ticket'
        ? '<b style="color:#ffd76a;">✦ ' + esc(got.name) + '</b><br><span style="font-size:10px;color:#aaa;">한정 교환권 — 교환을 위한 준비중</span>'
        : '<b style="color:#d4af37;">+' + got.n.toLocaleString() + ' P</b>';
    return '<div class="wd-note" style="border-color:#5a4a2a; text-align:center;">🍬 미션 성공 보상<br>' + t + '</div>';
};

// 소지품 — 교환권 줄에 꺼진 「사용」 단추
(function hookInv() {
    const iv = setInterval(function () {
        if (typeof window.renderInventory !== 'function') return;
        clearInterval(iv);
        const _r = window.renderInventory;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { decorate(); } catch (e) { }
            return out;
        };
        w._wonderTicket = true;
        window.renderInventory = w;
    }, 200);
    function decorate() {
        document.querySelectorAll('.inv-card').forEach(function (card) {
            const nm = card.querySelector('.inv-card-name');
            if (!nm || TICKETS.indexOf(nm.textContent.trim()) < 0) return;
            const g = card.querySelector('.inv-btn-group');
            if (!g || g.querySelector('.wd-ticket-off')) return;
            g.insertAdjacentHTML('afterbegin', '<button class="inv-btn wd-ticket-off" disabled style="background:#2a2a2a; color:#666; cursor:not-allowed;" title="교환을 위한 준비중">사용</button>');
        });
    }
    // 다른 파일이 그리기를 건너뛰어도 붙도록 가끔 확인
    setInterval(function () { try { decorate(); } catch (e) { } }, 2000);
})();

window.wonderRewardTest = function (n) {
    n = n || 100000;
    const c = {};
    let sum = 0, pts = 0;
    for (let i = 0; i < n; i++) {
        const g = draw();
        const k = g.kind === 'ticket' ? g.name : 'points';
        c[k] = (c[k] || 0) + 1;
        if (g.kind === 'points') { sum += g.n; pts++; }
    }
    console.log(c, '평균 포인트', Math.round(sum / Math.max(1, pts)));
    return c;
};

console.log('[이상한 나라] 미션 보상 연결');
})();
