// ==========================================
// ★ 사택 — 내가 임신시킨 사원 명단
// index.html 에서 preg-leave.js 다음에 불러온다
// ==========================================
//
// 한 명이 다섯 명까지 임신시킬 수 있다.
// 사택 돌봄 용품 밑에 명단을 세워 바로 돌볼 수 있게 한다.

function myPregList() {
    const out = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !isPregnant(u)) return;
        if (!isMySire(u)) return;
        out.push({ code: c, u: u, p: pregOf(u) });
    });
    // 출산이 가까운 순
    out.sort(function (a, b) { return (a.p.due || 0) - (b.p.due || 0); });
    return out;
}

function renderPregRoster() {
    const box = document.getElementById('house-main-body');
    if (!box || !currentUser) return;
    if (box.innerHTML.length < 50) return;

    const old = document.getElementById('preg-roster');
    const list = myPregList();

    // 아무도 없으면 칸을 만들지 않는다
    if (list.length === 0) { if (old) old.remove(); return; }

    const gap = (typeof CARE_GAP !== 'undefined') ? CARE_GAP : 3600000;
    const nh = (typeof NEGLECT_HOURS !== 'undefined') ? NEGLECT_HOURS : 8;

    const rows = list.map(function (x) {
        const p = x.p;
        const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
        const last = (p.careAt || {})[currentUser.code] || 0;
        const dayLeft = (typeof careLeftToday === 'function') ? careLeftToday(p) : 8;
        const ok = Date.now() - last >= gap && dayLeft > 0;
        const nx = Math.max(0, Math.ceil((last + gap - Date.now()) / 60000));

        // 방치까지 남은 시간 (밤 시간 제외)
        let warn = '';
        if (last && typeof awakeMs === 'function') {
            const used = awakeMs(last, Date.now()) / 3600000;
            const rest = nh - used;
            if (rest <= 0) warn = `<span style="color:#f44336; font-weight:bold;">방치 넘김</span>`;
            else if (rest <= 2) warn = `<span style="color:#ff9800; font-weight:bold;">방치까지 ${rest.toFixed(1)}시간</span>`;
        }

        const mine = (p.careCount || {})[currentUser.code] || 0;
        const total = Object.values(p.careCount || {}).reduce((a, b) => a + b, 0);
        const goal = (typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8) * 2;

        const label = ok
            ? `돌보기 <span style="font-size:9px; color:#ffd76a;">(오늘 ${dayLeft})</span>`
            : (dayLeft <= 0 ? '오늘 끝' : `${nx}분 뒤`);

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:9px;
                        background:rgba(0,0,0,0.25); border-radius:5px; padding:9px 11px; margin-bottom:6px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:12px; color:#fff; font-weight:bold;">
                        ${x.u.name} <span style="font-size:10px; color:#888; font-weight:normal;">사원</span>
                    </div>
                    <div style="font-size:9px; color:#999; margin-top:3px; line-height:1.6;">
                        출산까지 ${left}시간 · 아버지 ${(p.sires || []).length}명<br>
                        내 돌봄 ${mine}회 · 전체 ${total}/${goal}회
                        ${warn ? '<br>' + warn : ''}
                    </div>
                </div>
                <button class="game-btn" style="margin:0; padding:8px 12px; font-size:10px; flex-shrink:0; min-width:74px;
                        ${ok ? 'background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;' : 'opacity:0.45;'}"
                        onclick="openCarePanel('${x.code}')" ${ok ? '' : 'disabled'}>
                    ${label}
                </button>
            </div>`;
    }).join('');

    const html = `
        <div id="preg-roster" style="border:1px solid #c2185b; border-radius:6px; padding:12px; margin-top:13px; background:rgba(194,24,91,0.05);">
            <div style="font-size:11px; color:#ff8fb1; font-weight:bold; margin-bottom:8px;">
                🤱 내 아이를 가진 사원 <span style="color:#888; font-weight:normal;">(${list.length}명)</span>
            </div>
            <div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.6;">
                여기서 바로 돌볼 수 있습니다. 최소 ${gap / 3600000}시간 간격, 하루 ${typeof PREG_CARE_DAILY !== 'undefined' ? PREG_CARE_DAILY : 8}회까지입니다.
            </div>
            ${rows}
        </div>`;

    if (old) old.outerHTML = html;
    else {
        // 돌봄 용품 칸 바로 아래에 놓는다
        const store = document.getElementById('preg-store');
        if (store) store.insertAdjacentHTML('afterend', html);
        else box.insertAdjacentHTML('beforeend', html);
    }
}

// 사택 화면이 그려질 때마다
(function hookHouse() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._rosterHooked) { clearInterval(iv); return; }
        const _r = renderHouse;
        renderHouse = function () {
            const r = _r.apply(this, arguments);
            setTimeout(renderPregRoster, 140);
            return r;
        };
        renderHouse._rosterHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 돌본 뒤 바로 갱신
(function hookAfterCare() {
    const iv = setInterval(function () {
        if (typeof doCare !== 'function') return;
        if (doCare._rosterHooked) { clearInterval(iv); return; }
        const _d = doCare;
        doCare = function () {
            const r = _d.apply(this, arguments);
            setTimeout(renderPregRoster, 300);
            return r;
        };
        doCare._rosterHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 남은 시간 표시가 흐르도록
setInterval(function () {
    const panel = document.getElementById('house-main');
    if (!panel || !panel.classList.contains('active')) return;
    if (!document.getElementById('preg-roster')) return;
    renderPregRoster();
}, 30000);

setTimeout(renderPregRoster, 2000);

console.log('[사택] 돌봄 명단 적용');