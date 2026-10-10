// ==========================================
// ★ 임신 — 판정 · 동의 · 티커
// index.html 에서 dna.js 다음에 불러온다
// ==========================================

const PREG_HOURS = 48;            // 이틀 뒤 출산
const PREG_CARE_DAILY = 5;        // 하루 돌봄 횟수
const PREG_MAX_SIRES = 5;         // 한 명이 받을 수 있는 최대 인원
const PREG_MAX_LYCHEE = 10;       // 리치맛 물약을 마신 사람은 열 명까지

// 리치맛 물약 — **받는 쪽**에만 걸린다. 임신시키는 쪽은 아무 상관이 없다.
function hasLychee(u) {
    if (!u) return false;
    const now = Date.now();
    return (u.timedEffects || []).some(function (e) {
        if (!e || e.name !== '리치맛 물약') return false;
        return !!e.fixed || !e.expireAt || e.expireAt > now;
    });
}
function maxSires(u) {
    return hasLychee(u) ? PREG_MAX_LYCHEE : PREG_MAX_SIRES;
}
const PREG_COST_MAX = 3000;       // 포인트로 낼 때 상한

// 사택 비치 전용 아이템 5종
const PREG_ITEMS = {
    '미지근한 물수건': { price: 400,  care: 1, d:'임신한 사원을 한 번 돌볼 수 있다.' },
    '흔들의자':       { price: 900,  care: 2, d:'임신한 사원을 두 번 돌볼 수 있다.' },
    '식지 않는 죽':   { price: 1500, care: 3, d:'임신한 사원을 세 번 돌볼 수 있다.' },
    '두꺼운 담요':    { price: 2600, care: 5, d:'임신한 사원을 다섯 번 돌볼 수 있다.' },
    '밤새 켜 둔 등':  { price: 5000, care: 9, d:'임신한 사원을 아홉 번 돌볼 수 있다.' }
};
Object.keys(PREG_ITEMS).forEach(function (n) {
    const it = PREG_ITEMS[n];
    ITEM_CATALOG[n] = { price: it.price, usable: false, care: it.care, pregItem: true,
        desc: '[돌봄] ' + it.d };
});

// ==========================================
// 상태 읽기
// ==========================================
function pregOf(user) {
    if (!user) return null;
    if (!user.preg) return null;
    return user.preg;    // { sires:[{code,name,at}], due, careAt:{code:time} }
}
function isPregnant(user) {
    const p = pregOf(user);
    return !!(p && p.sires && p.sires.length > 0);
}
function sireCount(user) {
    const p = pregOf(user);
    return p && p.sires ? p.sires.length : 0;
}
function isMySire(user) {
    const p = pregOf(user);
    if (!p || !p.sires) return false;
    return p.sires.some(s => s.code === currentUser.code);
}

// 내가 그 사람에게 몇 번 해 두었나 · 몇 번까지 할 수 있나
//   리치맛 물약을 마신 쪽은 같은 사람이 두 번까지 할 수 있다.
const PREG_MINE_MAX = 1;
const PREG_MINE_LYCHEE = 2;
function mySireCount(user) {
    const p = pregOf(user);
    if (!p || !p.sires || !currentUser) return 0;
    return p.sires.filter(s => s && s.code === currentUser.code).length;
}
function mySireMax(user) {
    return hasLychee(user) ? PREG_MINE_LYCHEE : PREG_MINE_MAX;
}
function mySireFull(user) {
    return mySireCount(user) >= mySireMax(user);
}
function isPartner(a, b) {
    if (!a || !b) return false;
    if (a.couple && a.couple.partner === b.code) return true;
    const h = getHouse(a);
    return h && h.roomie === b.code;
}

// ==========================================
// 티커
// ==========================================
function pregBroadcast(text) {
    if (!database) return;
    database.ref('notices').push({ text: text, at: Date.now(), kind: 'preg' });
}

// ★ 「들어갈 때마다 낳았습니다 띠가 또 뜬다」
//
//   limitToLast(1).on('child_added') 는 **붙는 순간 이미 있던 맨 끝 줄을
//   한 번 틀어 준다.** 그래서 들어갈 때마다 서버에 남아 있는 마지막 소식이
//   다시 흐른다. 늘 같은 사원의 것만 뜨는 까닭이 이것이다 — 그 줄이 맨
//   끝에 눌러앉아 있기 때문이다.
//
//   막아 두기는 했었다.
//
//       if (!v || Date.now() - v.at > 20000) return;
//
//   그런데 이 셈은 두 가지에 무너진다.
//
//       at 이 없다        Date.now() - undefined = NaN → NaN > 20000 은 거짓
//                         → 그냥 통과한다
//       at 이 앞날이다    올린 사람 시계가 앞서면 빼기가 **음수**가 된다
//                         → 역시 통과한다. 영영 묵지 않는다.
//
//   시계를 믿지 않는 쪽으로 바꾼다. **붙자마자 들어온 줄은 이미 있던 줄**
//   이다 (확성기 inv-shout.js 가 쓰는 것과 같은 수). 들어온 때로 가르므로
//   남의 시계가 어떻든 상관없다. 열쇠로 한 번 더 걸러, 끊겼다 이어져도
//   같은 줄을 두 번 틀지 않는다.
(function watchNotice() {
    if (!database) return;

    let ready = false;                       // 붙는 순간 쏟아지는 묵은 줄을 건너뛴다
    setTimeout(function () { ready = true; }, 1500);
    const bornAt = Date.now();
    const seen = {};

    database.ref('notices').limitToLast(1).on('child_added', function (snap) {
        const v = snap.val();
        if (!v || !v.text) return;
        if (seen[snap.key]) return;
        seen[snap.key] = true;
        if (!ready) return;                  // 들어오기 전에 적혀 있던 줄
        const at = Number(v.at);
        if (isFinite(at) && at > 0 && at < bornAt - 60000) return;   // 확실히 묵은 줄
        if (typeof pushNotice === 'function') { pushNotice(v.text); return; }
        showPregTicker(v.text);
    });

    // 치우기 — 2분 지난 줄은 지운다.
    //   들어오자마자 한 번 쓸고, 그 뒤로 2분마다 쓴다. 예전에는 첫 2분을
    //   기다리기만 해서, 잠깐 들렀다 나가면 묵은 줄이 그대로 남았다.
    function sweep() {
        if (!database || !currentUser || currentUser.code !== 'kario0987') return;
        database.ref('notices').once('value').then(function (s) {
            const v = s.val() || {};
            const del = {};
            Object.keys(v).forEach(function (k) {
                const at = Number(v[k] && v[k].at);
                // 때를 모르는 줄과 앞날로 적힌 줄도 같이 치운다 — 안 그러면 영영 남는다
                if (!isFinite(at) || at <= 0 || Math.abs(Date.now() - at) > 120000) del[k] = null;
            });
            if (Object.keys(del).length) {
                database.ref('notices').update(del);
                console.log('[알림띠] 묵은 소식 ' + Object.keys(del).length + '줄을 치웠습니다.');
            }
        });
    }
    setTimeout(sweep, 6000);
    setInterval(sweep, 120000);
    window.noticeSweep = sweep;
})();

function showPregTicker(text) {
    const bar = document.getElementById('notice-ticker');
    const el = document.getElementById('notice-ticker-text');
    if (!bar || !el) return;
    bar.style.display = 'block';
    el.innerHTML = text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'pregSlide 13s linear 1';
    clearTimeout(window._pregTick);
    window._pregTick = setTimeout(function () { bar.style.display = 'none'; }, 13000);
}

(function tickerCSS() {
    const st = document.createElement('style');
    st.textContent = `@keyframes pregSlide { 0%{transform:translateX(100%);} 100%{transform:translateX(-140%);} }`;
    document.head.appendChild(st);
})();

// ==========================================
// 정보 열람에 버튼
// ==========================================
(function hookDetail() {
    if (typeof openEmpDetailModal !== 'function') return;
    const _o = openEmpDetailModal;
    openEmpDetailModal = function (code) {
        const r = _o.apply(this, arguments);
        setTimeout(function () { addPregBtn(code); }, 60);
        return r;
    };
})();

function addPregBtn(code) {
    const box = document.getElementById('emp-detail-card-container');
    if (!box || !currentUser || code === currentUser.code) return;
    if (document.getElementById('preg-btn-box')) return;
    const t = db.users[code];
    if (!t) return;

    let html = '';

    // 상대 임신 상태
    if (isPregnant(t)) {
        const p = pregOf(t);
        const left = Math.max(0, Math.ceil((p.due - Date.now()) / 3600000));
        html += `<div style="background:rgba(255,105,180,0.08); border:1px solid #c2185b; border-radius:6px; padding:10px; margin-top:12px; font-size:11px; line-height:1.8;">
            <b style="color:#ff8fb1;">임신 중</b> · 아버지 ${p.sires.length}명 · 출산까지 ${left}시간
            ${isMySire(t) ? `<div style="font-size:10px; color:#ffd700; margin-top:4px;">당신이 아버지 중 한 명입니다.</div>` : ''}
        </div>`;
        if (isMySire(t)) {
            const last = (p.careAt || {})[currentUser.code] || 0;
            const gap = (typeof CARE_GAP !== 'undefined') ? CARE_GAP : 3600000;
            const dayLeft = (typeof careLeftToday === 'function') ? careLeftToday(p) : 8;
            const ok = Date.now() - last >= gap && dayLeft > 0;
            const nx = Math.max(0, Math.ceil((last + gap - Date.now()) / 60000));
            html += `<button class="game-btn" style="width:100%; margin-top:8px; padding:11px; ${ok ? 'background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;' : 'opacity:0.4;'}" onclick="openCarePanel('${code}')" ${ok ? '' : 'disabled'}>
                ${ok ? `🤍 돌본다 <span style="font-size:10px; color:#ffd76a;">(오늘 ${dayLeft}회 남음)</span>` : (dayLeft <= 0 ? '오늘은 다 돌봤습니다' : `다음 돌봄까지 ${nx}분`)}
            </button>`;
        }
    }

    // 임신시키기
    const meSire = canSire(currentUser);
    const tBear = (typeof canBearNow === 'function') ? canBearNow(t) : canBear(t);

    // 플러그 때문에 막힌 경우는 이유를 알려 준다
    if (meSire && canBear(t) && !tBear && !isPregnant(t)) {
        html += `<div style="background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:6px; padding:9px 11px; margin-top:10px; font-size:11px; color:#aaa; line-height:1.7;">
            상대가 <b style="color:#c9a8ff;">다이아 보지 플러그</b>를 차고 있습니다.<br>
            <span style="font-size:10px; color:#888;">빼면 할 수 있습니다.</span>
        </div>`;
    }

    if (hasLychee(t)) {
        html += `<div style="font-size:10px; color:#c9a8ff; margin-top:8px; line-height:1.6;">
            리치맛 물약 — 한 번에 <b>${PREG_MAX_LYCHEE}명</b>까지 받을 수 있습니다.
            <span style="color:#888;">(지금 ${sireCount(t)}명)</span><br>
            한 사람이 <b>${PREG_MINE_LYCHEE}번</b>까지 할 수 있습니다.
            <span style="color:#888;">(당신 ${mySireCount(t)}번)</span>
        </div>`;
    }

    if (meSire && tBear && sireCount(t) < maxSires(t) && !mySireFull(t)) {
        const near = isPartner(currentUser, t);
        html += `<button id="preg-do-btn" class="game-btn" style="width:100%; margin-top:8px; padding:11px; background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;" onclick="tryPregnancy('${code}')">
            임신시키기 ${near ? '' : '<span style="font-size:10px; color:#ffd76a;">(동의 필요)</span>'}
        </button>`;
    }

    if (!html) return;
    box.insertAdjacentHTML('beforeend', `<div id="preg-btn-box">${html}</div>`);
}

// ==========================================
// 임신 시도
// ==========================================
function tryPregnancy(code) {
    if (!buyGuard()) return;
    const t = db.users[code];
    if (!t) return;
    if (!canSire(currentUser)) { showCustomAlert('지금은 할 수 없는 상태입니다.'); return; }
    if (!canBear(t)) { showCustomAlert('상대가 받을 수 있는 상태가 아닙니다.'); return; }
    if (typeof hasVaginaPlug === 'function' && hasVaginaPlug(t)) {
        showCustomAlert('상대가 다이아 보지 플러그를 차고 있습니다.\n\n빼야 할 수 있습니다.');
        return;
    }
    if (sireCount(t) >= maxSires(t)) { showCustomAlert(`이미 ${maxSires(t)}명이 있습니다.`); return; }
    if (mySireFull(t)) {
        showCustomAlert(mySireMax(t) > 1
            ? `이미 당신의 아이를 ${mySireMax(t)}번 가지고 있습니다.`
            : '이미 당신의 아이를 가지고 있습니다.');
        return;
    }

    if (isPartner(currentUser, t)) { doPregnancy(code); return; }

    if (!database) { showCustomAlert('서버 연결이 필요합니다.'); return; }
    const id = 'pg_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    database.ref('pregAsk/' + id).set({
        id: id, from: currentUser.code, fromName: currentUser.name,
        to: code, at: Date.now()
    });
    showCustomAlert(`${t.name} 사원에게 동의를 요청했습니다.\n수락하면 진행됩니다.`);
}

function doPregnancy(code) {
    const t = db.users[code];
    if (!t) return;
    // 수락 직전에 플러그를 채운 경우를 막는다
    if (typeof hasVaginaPlug === 'function' && hasVaginaPlug(t)) {
        showCustomAlert(`${t.name} 사원이 다이아 보지 플러그를 차고 있습니다.\n\n진행되지 않았습니다.`);
        return;
    }
    if (!canBear(t)) { showCustomAlert('상대가 받을 수 있는 상태가 아닙니다.'); return; }
    if (sireCount(t) >= maxSires(t)) { showCustomAlert(`이미 ${maxSires(t)}명이 있습니다.`); return; }
    if (mySireFull(t)) {
        showCustomAlert(mySireMax(t) > 1
            ? `이미 당신의 아이를 ${mySireMax(t)}번 가지고 있습니다.`
            : '이미 당신의 아이를 가지고 있습니다.');
        return;
    }

    const sure = hasSureBear(t);                   // 딸기맛 물약 — 한 번에 된다
    const myR = roleFlipped(currentUser) ? sireRateAlt(currentUser) : sireRate(currentUser);
    const tR = roleFlipped(t) ? bearRateAlt(t) : bearRate(t);
    const chance = (myR / 100) * (tR / 100) * 6;   // 합산 보정

    const ok = sure || Math.random() < chance;

    if (!ok) {
        addHistoryLog(currentUser, `[시도] ${t.name} 사원 — 이번에는 되지 않았습니다.`);
        saveFields({ history: 1 });
        showCustomAlert('이번에는 되지 않았습니다.');
        return;
    }

    const p = pregOf(t) || { sires: [], due: Date.now() + PREG_HOURS * 3600000, careAt: {} };
    if (!p.sires) p.sires = [];
    p.sires.push({ code: currentUser.code, name: currentUser.name, at: Date.now() });
    if (!p.due) p.due = Date.now() + PREG_HOURS * 3600000;
    if (!p.careAt) p.careAt = {};
    p.careAt[currentUser.code] = Date.now();

    t.preg = p;
    appendBadgeNoteToUser(t, `[${currentUser.name} 사원의 아이를 임신했습니다]`);
    addHistoryLog(t, `[임신] ${currentUser.name} 사원의 아이를 가졌습니다.`);
    addHistoryLog(currentUser, `[임신] ${t.name} 사원을 임신시켰습니다.`);

    updateUserFields(code, { preg: p, badge: t.badge, history: t.history });
    saveFields({ history: 1 });
    updateUI();

    pregBroadcast(`축! <b style="color:#ff8fb1;">${currentUser.name}</b> 사원이 <b style="color:#ff8fb1;">${t.name}</b> 사원을 임신시켰습니다! 하!`);
    showCustomAlert(`성공했습니다.${sure ? '\n(딸기맛 물약)' : ''}\n\n${t.name} 사원이 당신의 아이를 가졌습니다.\n${PREG_HOURS}시간 뒤에 나옵니다.\n\n하루 ${PREG_CARE_DAILY}번까지 돌볼 수 있습니다. (최소 1시간 간격)\n8시간 넘게 방치하면 상담실로 이송됩니다.\n(자정부터 오전 10시까지는 세지 않습니다.)`);
    closeEmpDetailModal();
}

// ==========================================
// 동의 요청 수신
// ==========================================
(function watchAsk() {
    if (!database) return;
    database.ref('pregAsk').on('value', function (snap) {
        if (!currentUser) return;
        const v = snap.val() || {};
        const mine = Object.values(v).find(x => x && x.to === currentUser.code && Date.now() - x.at < 120000);
        if (!mine) { closePregAsk(); return; }
        if (window._pregAskId === mine.id) return;
        window._pregAskId = mine.id;
        openPregAsk(mine);
    });
})();

function openPregAsk(ask) {
    if (!document.getElementById('preg-ask-overlay')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="preg-ask-overlay" class="modal-overlay" style="display:none; z-index:10007;">
                <div class="modal-content" style="max-width:360px; text-align:center; border-color:#c2185b;">
                    <div style="font-size:28px; margin-bottom:10px;">🤍</div>
                    <div id="preg-ask-text" style="font-size:13px; color:#eee; line-height:1.9; margin-bottom:18px;"></div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-cancel" style="flex:1; background:#444; border-color:#555 !important;" onclick="rejectPregAsk()">거절</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:12px; background:linear-gradient(145deg,#c2185b,#880e4f) !important; border-color:#e91e63 !important; color:#fff !important;" onclick="acceptPregAsk()">수락</button>
                    </div>
                </div>
            </div>`);
    }
    const r = myRates(currentUser);
    document.getElementById('preg-ask-text').innerHTML =
        `<b style="color:#ff8fb1;">${ask.fromName}</b> 사원이<br>당신에게 동의를 구하고 있습니다.<br><br>
         <span style="font-size:11px; color:#888;">당신이 받을 확률 <b style="color:#ffd700;">${r.bear !== null ? r.bear + '%' : '-'}</b></span>`;
    document.getElementById('preg-ask-overlay').style.display = 'flex';
}
function closePregAsk() {
    const el = document.getElementById('preg-ask-overlay');
    if (el) el.style.display = 'none';
    window._pregAskId = null;
}
function acceptPregAsk() {
    const id = window._pregAskId;
    closePregAsk();
    if (!id || !database) return;
    database.ref('pregAsk/' + id).once('value').then(function (s) {
        const a = s.val();
        database.ref('pregAsk/' + id).remove();
        if (!a) return;
        database.ref('pregGo/' + a.from).set({ to: currentUser.code, at: Date.now() });
    });
}
function rejectPregAsk() {
    const id = window._pregAskId;
    closePregAsk();
    if (id && database) database.ref('pregAsk/' + id).remove();
}

// 수락 신호를 받으면 신청자 쪽에서 판정
(function watchGo() {
    if (!database) return;
    const iv = setInterval(function () {
        if (!currentUser) return;
        clearInterval(iv);
        database.ref('pregGo/' + currentUser.code).on('value', function (s) {
            const v = s.val();
            if (!v || Date.now() - v.at > 60000) return;
            database.ref('pregGo/' + currentUser.code).remove();
            doPregnancy(v.to);
        });
    }, 1500);
})();

// ==========================================
// 확률 표시 — 사원증 탭
// ==========================================
(function showMyRate() {
    function rateHTML() {
        const r = myRates(currentUser);
        return `
            <div style="font-size:10px; color:#c9a8ff; letter-spacing:1px; margin-bottom:4px;">[생체 기록]</div>
            DNA <b style="font-family:monospace; color:#4fc3f7;">${dnaOf(currentUser)}</b><br>
            ${r.sire !== null ? `임신시킬 확률 <b style="color:#ffd700;">${r.sire}%</b><br>` : ''}
            ${r.bear !== null ? `임신될 확률 <b style="color:#ff8fb1;">${r.bear}%</b>` : ''}
            ${r.sire === null && r.bear === null ? '<span style="color:#888;">해당 없음</span>' : ''}
            <div style="font-size:9px; color:#666; margin-top:5px;">본인에게만 보입니다.</div>`;
    }
    function put() {
        const panel = document.getElementById('rec-badge');
        if (!panel || !currentUser) return;

        const old = document.getElementById('preg-rate-box');
        if (old) {
            // 이미 있으면 내용만 바꾼다. 지웠다 붙이면 높이가 출렁여 깜빡인다.
            const next = rateHTML();
            if (old.innerHTML !== next) old.innerHTML = next;
            return;
        }

        const btn = panel.querySelector('button[onclick*="saveBadgeInfo"]');
        if (!btn) return;
        btn.insertAdjacentHTML('beforebegin',
            `<div id="preg-rate-box" style="background:rgba(0,0,0,0.28); border:1px solid #4a3a6a; border-radius:6px; padding:10px 12px; margin:11px 0; font-size:11px; line-height:1.9;">${rateHTML()}</div>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
    if (typeof updateUI === 'function') {
        const _u = updateUI;
        let tick = null;
        updateUI = function () {
            const r = _u.apply(this, arguments);
            clearTimeout(tick);
            tick = setTimeout(put, 40);
            return r;
        };
    }
})();

console.log('[임신] 판정 · 동의 · 티커 적용');