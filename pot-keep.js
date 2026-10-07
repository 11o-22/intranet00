// ==========================================
// ★ 걸린 물약이 조용히 사라지는 것 — 붙잡아 되돌리고, 누가 지웠는지 적는다
// bundles.json 마지막 묶음, save-merge.js 보다 뒤 (맨 끝에 가깝게)
// ==========================================
//
// ■ 왜 이것이 필요한가
//
//   「물약을 마셨는데 사라진다」가 여러 번 올라왔다. 지금까지 찾은 까닭은
//   그때그때 고쳤다. (빈 배열과 없는 열쇠 · 기준이 묵은 것 · 읽은 모습을 얕게
//   베낀 것 · 도깨비 불이 제 물약까지 태우던 것) 그런데 아직도 난다.
//
//   사원 둘을 띄워 스물두 가지 물약을 전부 걸어 보고, 늦은 응답·연달아 쓰기·
//   접속 직후·같은 물약 거듭 쓰기까지 돌려 봤지만 여기서는 다시 안 난다.
//   보이지 않는 자리에서 누가 지우고 있다는 뜻이다.
//
//   그래서 길목을 하나 더 둔다. **방금 걸린 것이 까닭 없이 사라지면 되돌리고,
//   그때의 모습을 적어 둔다.** 다음에 또 나면 누가 범인인지 바로 나온다.
//
// ■ 규칙 — 함부로 되살리지 않는다
//
//   되돌리는 것은 아래를 **모두** 만족할 때만이다.
//
//       · 걸린 지 5분 안이다            (「마시자마자 사라진다」가 이 창이다)
//       · 한 바퀴(1초)를 기다려도 안 돌아온다
//       · 아직 끝날 시각이 안 됐다       (때가 되어 끝난 것은 그대로 둔다)
//       · 제거약·빈 약통으로 풀린 것이 아니다
//       · 같은 이름을 세 번 넘게 되돌린 적이 없다  (서로 밀어내는 것을 막는다)
//
//   5분이 지난 뒤에는 건드리지 않는다. 제거약도, 상담사의 손질도 그대로 든다.
//
// ■ 제거약을 가리는 법
//
//   남이 나에게 제거약을 쓰면 내 화면에서는 그냥 「사라진 것」으로 보인다.
//   그래서 푸는 쪽이 **푼 자국(effCure)** 을 상대 자리에 남기도록 했다.
//   자국이 있으면 되돌리지 않는다.
//
// ■ 콘솔
//   potKeep()      되돌린 기록 · 지금 지키고 있는 것
//   potKeepOff()   끄기 (살펴보실 때만)

(function potKeep() {

const WINDOW = 5 * 60 * 1000;      // 걸린 지 이 안에서만 지킨다
const MAX_BACK = 3;                // 같은 이름을 몇 번까지 되돌리나
const TICK = 1000;
const CURE_LIFE = 60000;           // 푼 자국을 믿는 시간

let ON = true;
let code = null;                   // 지금 지키는 사람
let seen = {};                     // 이름 → { desc, expireAt, at, back }
let last = null;                   // 지난번에 본 이름들
const log = [];                    // 되돌린 기록

function isPotion(n) { return /물약$/.test(String(n == null ? '' : n).trim()); }
function eff(u) { return (u && Array.isArray(u.timedEffects)) ? u.timedEffects.filter(Boolean) : []; }
function names(u) { return eff(u).map(function (e) { return e.name; }); }
function live(e) { return !!e && (!!e.fixed || !e.expireAt || e.expireAt > Date.now()); }

// ==========================================
// 1. 푼 자국 — 제거약·빈 약통으로 풀었으면 상대 자리에 적어 둔다
// ==========================================
function markCure(target, gone) {
    if (!target || !gone.length) return;
    const mark = { name: gone[0], at: Date.now() };
    target.effCure = mark;
    try {
        if (currentUser && target.code === currentUser.code) {
            if (typeof saveFields === 'function') saveFields({ effCure: 1 });
        } else if (typeof updateUserFields === 'function') {
            updateUserFields(target.code, { effCure: mark, _adminStamp: Date.now() });
        }
    } catch (e) { }
    // 내가 푼 것이라면 내 기록에서도 지운다 (되살리지 않도록)
    if (currentUser && target.code === currentUser.code) gone.forEach(function (n) { delete seen[n]; });
}

(function hookCure() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._potKeep) { clearInterval(iv); return; }
        const _a = applyItemEffect;
        const wrapped = function (targetUser, itemName, isOthers) {
            const cat = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[itemName]) || {};
            const watch = (cat.effect === 'cure_potion' || cat.effect === 'q_pill');
            const before = watch ? names(targetUser) : null;
            const r = _a.apply(this, arguments);
            if (watch && r !== false) {
                const after = names(targetUser);
                const gone = before.filter(function (n) {
                    const i = after.indexOf(n);
                    if (i < 0) return true;
                    return false;
                });
                markCure(targetUser, gone);
            }
            return r;
        };
        wrapped._potKeep = true;
        applyItemEffect = wrapped;
        clearInterval(iv);
    }, 300);
})();

// 빈 약통은 applyItemEffect 를 안 거친다 — 쓰는 길목에서 본다
(function hookPill() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._potKeep) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const wrapped = function (itemName) {
            const cat = (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[itemName]) || {};
            if (cat.effect !== 'q_pill' || !currentUser) return _u.apply(this, arguments);
            const before = names(currentUser);
            const r = _u.apply(this, arguments);
            const after = names(currentUser);
            markCure(currentUser, before.filter(function (n) { return after.indexOf(n) < 0; }));
            return r;
        };
        wrapped._potKeep = true;
        useInventoryItem = wrapped;
        clearInterval(iv);
    }, 300);
})();

// 방금 풀린 것인가 (내 자리에 남은 자국으로 본다)
function cured(name) {
    const c = currentUser && currentUser.effCure;
    if (!c || !c.at) return false;
    if (Date.now() - c.at > CURE_LIFE) return false;
    return c.name === name;
}

// ==========================================
// 2. 지켜보기 — 늘어난 것은 적고, 까닭 없이 빠진 것은 되돌린다
// ==========================================
function keep() {
    if (!ON || typeof currentUser === 'undefined' || !currentUser) { last = null; return; }
    if (code !== currentUser.code) {       // 계정이 바뀌었다 — 처음부터
        code = currentUser.code; seen = {}; last = null;
    }

    const now = Date.now();
    const list = eff(currentUser);
    const cur = {};
    list.forEach(function (e) { if (e && e.name) cur[e.name] = e; });

    // 늘어난 것 적어 두기 (내가 마신 것도, 남이 걸어 준 것도 여기로 온다)
    Object.keys(cur).forEach(function (n) {
        if (!isPotion(n)) return;
        const e = cur[n];
        const had = seen[n];
        if (!had) { seen[n] = { desc: e.desc, expireAt: e.expireAt, fixed: !!e.fixed, at: now, back: 0 }; return; }
        had.desc = e.desc;
        had.fixed = !!e.fixed;
        had.gone = 0;
        if ((e.expireAt || 0) > (had.expireAt || 0)) had.expireAt = e.expireAt;   // 시간이 늘었다
    });

    if (last === null) { last = Object.keys(cur); return; }   // 첫 바퀴는 보기만

    // 빠진 것 살피기
    const back = [];
    Object.keys(seen).forEach(function (n) {
        const s = seen[n];
        if (cur[n]) return;                                   // 그대로 있다
        if (now - s.at > WINDOW) { delete seen[n]; return; }  // 지킬 창이 지났다
        if (!s.fixed && s.expireAt && now >= s.expireAt) { delete seen[n]; return; }   // 때가 되어 끝났다
        if (cured(n)) { delete seen[n]; return; }             // 제거약·빈 약통으로 풀렸다
        // ★ 한 바퀴는 기다린다 — 남이 제거약으로 푼 자국이 한 호흡 늦게 오므로,
        //   바로 되돌리면 잠깐 되살아났다가 다시 빠지는 모습이 보인다.
        if (!s.gone) { s.gone = 1; return; }
        if (s.back >= MAX_BACK) {
            if (s.back === MAX_BACK) {
                s.back++;
                console.warn('%c[물약지킴] ' + n + ' — ' + MAX_BACK + '번 되돌렸는데 또 사라집니다. '
                    + '이 이름은 더 건드리지 않습니다. potKeep() 으로 기록을 봐 주세요.', 'color:#ff5252');
            }
            return;
        }
        s.back++;
        currentUser.timedEffects = eff(currentUser);
        const put = { name: n, desc: s.desc, expireAt: s.expireAt };
        if (s.fixed) { put.fixed = true; delete put.expireAt; }
        currentUser.timedEffects.push(put);
        back.push(n);
        log.push({ 때: new Date(now).toLocaleTimeString(), 물약: n,
                   걸린지: Math.round((now - s.at) / 1000) + '초',
                   되돌림: s.back + '번째',
                   그때있던것: last.join(', ') || '없음' });
        while (log.length > 60) log.shift();
    });

    last = Object.keys(cur);

    if (!back.length) return;
    console.warn('%c[물약지킴] 까닭 없이 사라진 물약을 되돌렸습니다: ' + back.join(', '), 'color:#ff8a65');
    try { if (typeof saveFields === 'function') saveFields({ timedEffects: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
}

setInterval(function () { try { keep(); } catch (e) { console.warn('[물약지킴]', e); } }, TICK);

// ==========================================
// 확인
// ==========================================
window.potKeep = function () {
    console.log('%c===== 물약 지킴 =====', 'color:#ff8a65; font-size:13px');
    console.log('  켜짐:', ON ? 'O' : '✗', '· 지키는 시간:', (WINDOW / 60000) + '분', '· 한 이름당', MAX_BACK + '번까지');
    if (!currentUser) { console.log('  로그인 후에 쓰세요.'); return; }
    const now = Date.now();
    const rows = Object.keys(seen).map(function (n) {
        const s = seen[n];
        return { 물약: n, 걸린지: Math.round((now - s.at) / 1000) + '초',
                 남은시간: s.fixed ? '고정' : (s.expireAt ? Math.round((s.expireAt - now) / 3600000) + '시간' : '-'),
                 지금있나: names(currentUser).indexOf(n) >= 0 ? 'O' : '✗',
                 되돌린횟수: s.back };
    });
    if (rows.length) console.table(rows); else console.log('  지키고 있는 물약이 없습니다.');
    if (!log.length) { console.log('  되돌린 적이 없습니다. (물약이 사라지지 않았다는 뜻입니다)'); return; }
    console.warn('  되돌린 기록 ' + log.length + '건:');
    console.table(log.slice(-25));
    console.log('  이 표를 그대로 알려 주시면 누가 지우는지 찾습니다.');
};

window.potKeepOff = function (v) {
    ON = (v === true);
    console.log('[물약지킴] ' + (ON ? '켰습니다' : '껐습니다'));
};

console.log('[물약지킴] 마시자마자 사라지는 물약을 되돌립니다 — potKeep()');

})();
