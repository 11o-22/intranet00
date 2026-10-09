// ==========================================
// ★ 출산이 안 끝나는 것 · 낳았다는 알림이 계속 뜨는 것
// bundles.json 마지막 묶음, preg-fix3.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 두 가지가 한 뿌리다
//
//   출산은 낳는 사람의 창에서 1분마다 혼자 돈다. (pregnancy2.js:394)
//
//       setInterval(function () { checkPregBirth(); ... }, 60000);
//
//   checkPregBirth 는 이런 차례다.
//
//       ① _birthing 에 잠금을 건다
//       ② 아이템을 뽑는다            rollBirthItem · ensureDnaItem
//       ③ 내 소지품에 넣는다          currentUser.inventory.push(...)
//       ④ 특이사항을 지운다
//       ⑤ currentUser.preg = null
//       ⑥ saveSelfFull()
//       ⑦ 아버지들에게 나눠 준다
//       ⑧ 「…낳았습니다」를 전사에 알린다
//
//   ②~④ 어디서든 터지면 ⑤ 에 못 닿는다. 임신은 그대로고, 2분 뒤
//   preg-fix3 가 굳은 잠금을 풀어 **다시 시도**한다. 또 터진다.
//   → 「시간이 다 찼는데 출산이 안 된다」
//
//   거꾸로 ⑧ 까지 갔는데 ⑤ 가 서버에 안 박히면, 다음 1분에 또 낳고
//   또 알린다. 알림 띠는 18초 뒤에 접히지만 1분마다 새 줄이 올라온다.
//   → 「누가 낳았다는 글이 계속 떠 있다」
//
//   ③ 이 터지는 까닭 하나는 이미 알고 있다. 파이어베이스는 **빈 배열을
//   지운다.** 소지품이 하나도 없는 사원은 inventory 가 아예 없는 채로
//   돌아온다. 아버지 쪽은 `if (!f.inventory) f.inventory = [];` 로
//   막아 두었는데, 정작 낳는 쪽에는 그 줄이 없다.
//
// ■ 어떻게 고치나
//
//   1. 들어가기 전에 소지품 칸을 세워 둔다.
//   2. 터지면 삼키지 않는다 — 잠금을 바로 풀고, 까닭을 적어 둔다.
//      (안 풀면 2분을 기다려야 한다)
//   3. 끝난 뒤 **서버에 임신이 정말 지워졌는지 본다.** 안 지워졌으면
//      users/<사번>/preg 를 바로 지운다. 바뀐 것만 골라 보내는
//      길(save-merge)을 타지 않으므로 빠지지 않는다.
//   4. 같은 알림은 90초 안에 두 번 올리지 않는다.
//
// ■ 콘솔
//   pregWhy()        지금 왜 출산이 안 되는지 짚는다
//   pregWhy(사번)    상담사 — 남의 것도 본다

(function birthOnce() {

const SAY_GAP = 90000;          // 같은 알림을 다시 올리기까지

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function pregOfSafe(u) {
    if (typeof pregOf === 'function') { try { return pregOf(u); } catch (e) { } }
    return (u && u.preg) || null;
}
function bearing(u) {
    const p = pregOfSafe(u);
    return !!(p && p.sires && p.sires.length);
}
function dueOf(p) {
    const d = Number(p && p.due);
    if (isFinite(d) && d > 0) return d;
    const s = (p && p.sires && p.sires[0]) || null;
    const at = Number(s && s.at);
    return (isFinite(at) && at > 0) ? at + 24 * 3600000 : 0;
}

// ==========================================
// 1·2·3. 출산을 감싼다
// ==========================================
(function hook() {
    const iv = setInterval(function () {
        if (typeof checkPregBirth !== 'function') return;
        if (checkPregBirth._once) { clearInterval(iv); return; }

        const _c = checkPregBirth;
        checkPregBirth = function () {
            const me = u_();
            if (!me) return _c.apply(this, arguments);

            // 1. 소지품 칸이 없으면 세워 둔다 (빈 배열은 서버가 지운다)
            if (!Array.isArray(me.inventory)) me.inventory = [];

            const had = bearing(me);
            let r;
            try {
                r = _c.apply(this, arguments);
            } catch (e) {
                // 2. 터지면 잠금을 바로 풀어 다음 1분에 다시 해 본다
                window._pregLastError = String((e && e.message) || e);
                console.error('[출산] 도중에 터졌습니다 — ' + window._pregLastError, e);
                me._birthing = false;
                if ('_birthAt' in me) delete me._birthAt;
                try { if (typeof saveFields === 'function') saveFields({ _birthing: 1 }); } catch (x) { }
                return;
            }

            // 3. 낳았으면 서버에 임신이 정말 지워졌는지 확인한다
            if (had && !bearing(me)) sweepServer(me);
            return r;
        };
        checkPregBirth._once = true;
        clearInterval(iv);
        console.log('[출산] 한 번만 돌게 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 서버 쪽 preg 가 남아 있으면 바로 지운다.
// saveSelfFull 은 「바뀐 것만」 보내므로 어긋나면 빠질 수 있다. 여기서 못 박는다.
function sweepServer(me) {
    if (typeof database === 'undefined' || !database || !me || !me.code) return;
    const ref = database.ref('users/' + me.code + '/preg');
    setTimeout(function () {
        ref.once('value').then(function (s) {
            const v = s.val();
            if (!v || !v.sires || !v.sires.length) return;        // 잘 지워졌다
            console.warn('[출산] 서버에 임신이 남아 있어 바로 지웁니다.');
            return ref.set(null).then(function () {
                if (u_()) u_().preg = null;
                if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
            });
        }).catch(function (e) { console.warn('[출산] 서버 확인 실패', e); });
    }, 1500);
}
window.pregSweepServer = function () { sweepServer(u_()); };

// ==========================================
// 4. 같은 알림을 거푸 올리지 않는다
// ==========================================
(function once() {
    const iv = setInterval(function () {
        if (typeof pregBroadcast !== 'function') return;
        if (pregBroadcast._once) { clearInterval(iv); return; }
        const _b = pregBroadcast;
        const said = {};
        pregBroadcast = function (text) {
            // 숫자는 빼고 견준다 — 「3개」와 「2개」는 같은 소식으로 본다
            const k = String(text || '').replace(/<[^>]*>/g, '').replace(/[0-9０-９,]+/g, '#').trim();
            const t = Date.now();
            if (said[k] && t - said[k] < SAY_GAP) {
                console.warn('[출산] 방금 올린 알림이라 넘깁니다 — ' + k.replace(/<[^>]*>/g, ''));
                return;
            }
            said[k] = t;
            Object.keys(said).forEach(function (x) { if (t - said[x] > 10 * SAY_GAP) delete said[x]; });
            return _b.apply(this, arguments);
        };
        pregBroadcast._once = true;
        clearInterval(iv);
        console.log('[출산] 거푸 올리는 알림 막기 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 확인 — 왜 출산이 안 되나
// ==========================================
window.pregWhy = function (who) {
    let t = u_();
    if (who) {
        if (!t || t.code !== 'kario0987') { console.warn('남의 것은 상담사만 볼 수 있습니다.'); return; }
        const all = Object.keys((typeof db !== 'undefined' && db.users) || {})
            .map(function (c) { return db.users[c]; }).filter(Boolean);
        t = all.filter(function (x) { return x && (x.no === who || x.code === who || x.name === who); })[0];
        if (!t) { console.warn('사원을 못 찾았습니다.'); return; }
    }
    if (!t) return;
    console.log('%c===== ' + t.name + ' · 출산이 되는지 =====', 'color:#ff8fb1; font-size:13px');
    const p = pregOfSafe(t);
    if (!p) { console.log('  임신 상태가 아닙니다.'); return; }
    const n = (p.sires || []).length;
    const due = dueOf(p);
    console.log('  아버지:', n + '명', (p.sires || []).map(function (s) { return s.name; }).join(', '));
    console.log('  출산 시각:', due ? new Date(due).toLocaleString() : '✗ 비어 있음 (preg.due 없음)',
        due ? (Date.now() >= due ? '· 다 찼습니다' : '· ' + Math.ceil((due - Date.now()) / 60000) + '분 남음') : '');
    console.log('  적힌 preg.due:', p.due === undefined ? '(없음)' : p.due);
    console.log('  잠금(_birthing):', t._birthing ? ('O — ' + (t._birthAt ? Math.round((Date.now() - t._birthAt) / 1000) + '초째' : '시각 없음')) : '✗');
    console.log('  소지품 칸:', Array.isArray(t.inventory) ? (t.inventory.length + '개') : '✗ 없음 (여기서 터집니다)');
    if (window._pregLastError) console.log('%c  지난 오류: ' + window._pregLastError, 'color:#f44336');
    if (t !== u_()) { console.log('  ※ 출산은 그 사원의 창에서 돕니다. 본인이 들어와 있어야 합니다.'); return; }
    if (!due || Date.now() < due) { console.log('  → 아직 시간이 안 됐습니다.'); return; }
    console.log('  → 지금 한 번 해 봅니다…');
    t._birthing = false;
    if ('_birthAt' in t) delete t._birthAt;
    try { checkPregBirth(); } catch (e) { console.error('  ✗ 터졌습니다 —', e); return; }
    setTimeout(function () {
        console.log(bearing(u_()) ? '%c  ✗ 아직 임신인 채입니다. 위의 오류를 보십시오.'
            : '%c  ✓ 나왔습니다.', bearing(u_()) ? 'color:#f44336' : 'color:#4CAF50');
    }, 800);
};

console.log('[출산] 한 번만 · 알림 거푸 막기 — pregWhy(사번)');

})();
