// ==========================================
// ★ 🩶 은심장 — 두 가지를 더 붙인다
// bundles.json 마지막 그룹, newitems2.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 하나 — 구출이 쌓이면 사람을 꺼내 올 수 있다
//
//       누적 200회   상담실·선녀탕에 있는 사원을 하루 두 번 꺼내 온다
//       누적 300회   하루 세 번
//       그 위        더 늘지 않는다
//
//   소지품 화면에 은심장 칸이 생기고, 지금 상담실·선녀탕에 있는 사원이
//   줄줄이 뜬다. 눌러서 꺼낸다. 정상 해제와 똑같이 처리한다 —
//   오염도를 나올 때 값으로 되돌리고, 이송 문구도 거둔다.
//   (quarantine-exit.js:65 의 release() 와 같은 일이다)
//
// ■ 둘 — 은심장을 지닌 사람이 죽으면 파티 전원에게 10,000 P
//
//   같은 어둠에 있는 파티원 모두가 받는다. 죽었든 살았든 상관없다.
//   은심장을 지닌 본인도 받는다.
//
//   한 번의 탐사에서 한 번만 준다. 토크쇼의 부활 같은 것과 겹치면
//   한 사람이 세 번 죽어 30,000 P 씩 나가게 되므로 거기서 끊는다.
//   그대로 두는 편이 좋으시면 ONCE_PER_RUN 을 false 로 하면 된다.
//
//   남의 포인트는 updateUserFields 로 넣는다 — save-merge 가 「움직인 몫」만
//   트랜잭션으로 보내므로, 받는 쪽이 그 사이에 벌거나 쓴 것이 지워지지 않는다.
//
// ■ 확인
//
//   heart2()           내 누적과 오늘 남은 꺼내오기
//   heartPull(사번)    콘솔로 꺼낸다

(function heart2() {

const HEART = '🩶 은심장';
const PAY = 10000;              // 사망 시 파티원 한 사람당
const ONCE_PER_RUN = true;      // 한 탐사에 한 번만
const TIERS = [                 // 누적 → 하루 몇 번
    { at: 300, n: 3 },
    { at: 200, n: 2 }
];

function today() {
    return (typeof getTodayStr === 'function') ? getTodayStr()
        : new Date().toISOString().slice(0, 10);
}
function hasHeart(u) {
    if (!u) return false;
    if (typeof hasSilverHeart === 'function') { try { return hasSilverHeart(u); } catch (e) { } }
    return (u.inventory || []).indexOf(HEART) >= 0
        || (u.equippedWeapons || []).indexOf(HEART) >= 0;
}
function saves(u) { return Number((u || {}).heartSaves) || 0; }

// 하루 몇 번 꺼낼 수 있나
function pullMax(u) {
    if (!hasHeart(u)) return 0;
    const n = saves(u);
    for (let i = 0; i < TIERS.length; i++) if (n >= TIERS[i].at) return TIERS[i].n;
    return 0;
}
function pullLeft(u) {
    u = u || currentUser;
    const max = pullMax(u);
    if (!max) return 0;
    if (u.heartPullDay !== today()) return max;
    return Math.max(0, max - (Number(u.heartPullCount) || 0));
}
window.heartPullLeft = pullLeft;

function quarantined(u) {
    if (typeof isQuarantined === 'function') { try { return isQuarantined(u); } catch (e) { } }
    return !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil);
}
function whereOf(u) {
    if (u && u.quarantineHospital) return '입원';
    return (u && (u.quarantineDest || 'fox') === 'bath') ? '선녀탕' : '상담실';
}

// ==========================================
// 꺼내 온다 — quarantine-exit.js 의 release() 와 같은 일
// ==========================================
window.heartPull = function (who) {
    const me = currentUser;
    if (!me) return;
    if (!hasHeart(me)) { showCustomAlert('은심장을 지녀야 합니다.'); return; }

    const max = pullMax(me);
    if (!max) {
        showCustomAlert('구출 ' + TIERS[TIERS.length - 1].at + '회를 넘겨야 쓸 수 있습니다.\n\n'
            + '지금까지 ' + saves(me) + '회 구했습니다.');
        return;
    }
    if (pullLeft(me) <= 0) {
        showCustomAlert('오늘 몫을 다 썼습니다. (하루 ' + max + '번)');
        return;
    }

    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const t = all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0];
    if (!t) { showCustomAlert('사원을 찾지 못했습니다.'); return; }
    if (t.code === me.code) { showCustomAlert('본인은 꺼낼 수 없습니다.'); return; }
    if (!quarantined(t)) { showCustomAlert(t.name + ' 사원은 지금 나와 있습니다.'); return; }

    // --- 정상 해제와 같게 ---
    let out = Number(t.quarantineExitPollution) || 0;
    if (out >= 100) out = 99;              // 100 이면 나오자마자 다시 들어간다

    t.quarantineUntil = 0;
    t.quarantineDest = null;
    t.quarantineHospital = null;
    t.pollution = out;
    t.quarantineExitPollution = 0;
    t.lastPollutionTime = Date.now();
    t.foxRoomAnswered = false;

    if (t.badge && typeof t.badge.notes === 'string') {
        const arr = t.badge.notes.split(' | ').filter(function (n) {
            return n.trim() !== ''
                && n.indexOf('의식 불명') < 0
                && n.indexOf('긴급 이송') < 0
                && n.indexOf('사직 반려') < 0;
        });
        t.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
    }

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(t, '[은심장] ' + me.name + ' 사원이 꺼내 주었습니다.');
    }

    const f = {
        quarantineUntil: 0, quarantineDest: null, quarantineHospital: null,
        pollution: out, quarantineExitPollution: 0, lastPollutionTime: t.lastPollutionTime,
        foxRoomAnswered: false, _adminStamp: Date.now()
    };
    if (t.badge !== undefined) f.badge = t.badge;
    if (Array.isArray(t.history) && t.history.length > 1) f.history = t.history;
    if (typeof updateUserFields === 'function') updateUserFields(t.code, f);

    // 오늘 몫을 적는다
    if (me.heartPullDay !== today()) { me.heartPullDay = today(); me.heartPullCount = 0; }
    me.heartPullCount = (Number(me.heartPullCount) || 0) + 1;
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(me, '[은심장] ' + t.name + ' 사원을 꺼내 왔습니다. (오늘 '
            + me.heartPullCount + '/' + max + ')');
    }
    if (typeof saveFields === 'function') saveFields({ heartPullDay: 1, heartPullCount: 1, history: 1 });

    if (typeof updateUI === 'function') updateUI();
    paintBox();
    showCustomAlert('🩶 ' + t.name + ' 사원을 꺼내 왔습니다.\n\n오늘 남은 횟수 ' + pullLeft(me) + '번');
};

// ==========================================
// 소지품 화면의 은심장 칸
// ==========================================
function paintBox() {
    const host = document.getElementById('inventory-list-container');
    if (!host || !currentUser) return;
    let el = document.getElementById('heart-pull-box');
    if (!pullMax(currentUser)) { if (el) el.remove(); return; }

    if (!el) {
        el = document.createElement('div');
        el.id = 'heart-pull-box';
        el.style.cssText = 'background:linear-gradient(145deg,#11161a,#0b0f12); border:1px solid #44525e;'
            + ' border-radius:8px; padding:13px; margin-bottom:12px;';
        host.insertBefore(el, host.firstChild);
    }

    const max = pullMax(currentUser), left = pullLeft(currentUser);
    const list = Object.keys(db.users || {}).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.name && u.code !== currentUser.code && quarantined(u); })
        .sort(function (a, b) { return String(a.no) < String(b.no) ? -1 : 1; });

    const html = '<div style="font-size:10px; color:#cfd8e3; letter-spacing:1px; margin-bottom:6px;">'
        + '🩶 은심장 — 꺼내 오기</div>'
        + '<div style="font-size:11px; color:#8b97a3; margin-bottom:9px; line-height:1.6;">'
        + '구출 ' + saves(currentUser).toLocaleString() + '회 · 하루 ' + max + '번 · '
        + '<b style="color:#cfd8e3;">오늘 ' + left + '번 남음</b></div>'
        + (list.length
            ? list.map(function (u) {
                return '<div style="display:flex; justify-content:space-between; align-items:center;'
                    + ' gap:8px; padding:7px 0; border-top:1px solid #27313a;">'
                    + '<div style="min-width:0;"><span style="font-size:12px; color:#ddd;">' + u.name + '</span>'
                    + '<span style="font-size:10px; color:#6c7a87; margin-left:6px;">사번 ' + u.no
                    + ' · ' + whereOf(u) + '</span></div>'
                    + '<button class="inv-btn inv-btn-use" style="flex-shrink:0; padding:6px 11px; font-size:11px;'
                    + (left <= 0 ? ' opacity:.4;' : '') + '" ' + (left <= 0 ? 'disabled' : '')
                    + ' onclick="heartPull(\'' + u.code + '\')">꺼낸다</button></div>';
            }).join('')
            : '<div style="font-size:11px; color:#5e6a75; padding:6px 0;">지금 들어가 있는 사원이 없습니다.</div>');

    if (el.innerHTML !== html) el.innerHTML = html;
}

(function hookInv() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._heart2) { clearInterval(iv); return; }
        const _r = renderInventory;
        const wrapped = function () {
            const r = _r.apply(this, arguments);
            try { paintBox(); } catch (e) { }
            return r;
        };
        wrapped._heart2 = true;
        renderInventory = wrapped;
        clearInterval(iv);
        console.log('[은심장] 꺼내 오기 칸 연결');
    }, 500);
})();
setInterval(function () { try { paintBox(); } catch (e) { } }, 3000);

// ==========================================
// 사망 시 — 같은 어둠의 파티원 모두에게 10,000 P
// ==========================================
function payParty() {
    if (typeof darkRun === 'undefined' || !darkRun || !darkRun.partyId) return;
    if (ONCE_PER_RUN && darkRun._heartPaid) return;
    if (typeof darkParties === 'undefined') return;
    const p = darkParties[darkRun.partyId];
    if (!p) return;

    const codes = Object.keys(p.members || {});
    if (!codes.length) return;
    darkRun._heartPaid = true;

    let n = 0;
    codes.forEach(function (c) {
        const u = (db.users || {})[c];
        if (!u) return;
        n++;
        if (currentUser && c === currentUser.code) {
            // 내 몫은 내 길로 — save-merge 가 「움직인 몫」으로 보낸다
            currentUser.points = (Number(currentUser.points) || 0) + PAY;
            if (typeof saveFields === 'function') saveFields({ points: 1 });
        } else if (typeof updateUserFields === 'function') {
            updateUserFields(c, { points: (Number(u.points) || 0) + PAY });
        }
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(u, '[은심장] ' + currentUser.name + ' 사원이 쓰러졌습니다. (+'
                + PAY.toLocaleString() + ' P)');
        }
    });

    if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
    setTimeout(function () {
        showCustomAlert('🩶 은심장이 식었습니다.\n\n같은 어둠에 있던 파티원 ' + n + '명에게 '
            + PAY.toLocaleString() + ' P 가 돌아갔습니다.');
    }, 700);
    console.log('[은심장] 파티원 ' + n + '명에게 ' + PAY + ' P');
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._heart2) { clearInterval(iv); return; }
        const _d = darkDeath;
        const wrapped = function () {
            // 진짜 죽는지 먼저 본다 — 부활로 살아나면 주지 않는다
            const before = (typeof darkRun !== 'undefined' && darkRun) ? !!darkRun._dead : null;
            const r = _d.apply(this, arguments);
            try {
                if (typeof darkRun === 'undefined' || !darkRun) return r;
                if (!darkRun._dead) return r;          // 살아났다
                if (before === true) return r;         // 이미 죽어 있었다 (겹쳐 부른 것)
                if (currentUser && hasHeart(currentUser)) payParty();
            } catch (e) { console.warn('[은심장] 파티 지급 건너뜀:', e && e.message); }
            return r;
        };
        wrapped._heart2 = true;
        darkDeath = wrapped;
        clearInterval(iv);
        console.log('[은심장] 사망 시 파티 지급 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.heart2 = function (who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }

    console.log('%c===== ' + u.name + ' · 🩶 은심장 (추가분) =====', 'color:#cfd8e3; font-size:13px');
    console.log('  지님:', hasHeart(u) ? 'O' : '✗', '· 구한 횟수:', saves(u).toLocaleString() + '회');
    console.table(TIERS.slice().reverse().map(function (t) {
        return { 누적: t.at + '회', 하루: t.n + '번', 닿았나: saves(u) >= t.at ? 'O' : '-' };
    }));
    const max = pullMax(u);
    console.log('  꺼내 오기:', max ? ('하루 ' + max + '번 · 오늘 ' + pullLeft(u) + '번 남음')
        : ('아직 못 씀 — ' + (TIERS[TIERS.length - 1].at - saves(u)) + '회 더 구해야 합니다'));
    console.log('  사망 시 파티원 지급:', PAY.toLocaleString() + ' P'
        + (ONCE_PER_RUN ? ' (한 탐사에 한 번)' : ' (죽을 때마다)'));
    const q = all.filter(function (x) { return quarantined(x); });
    console.log('  지금 들어가 있는 사원:', q.length
        ? q.map(function (x) { return x.name + '(' + whereOf(x) + ')'; }).join(' · ') : '없음');
    console.log('  연결:',
        'renderInventory', (typeof renderInventory === 'function' && renderInventory._heart2) ? 'O' : '✗',
        '· darkDeath', (typeof darkDeath === 'function' && darkDeath._heart2) ? 'O' : '✗');
};

console.log('[은심장] heart2() · heartPull(사번)');

})();
