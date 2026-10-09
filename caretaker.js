// ==========================================
// ★ 밀린 일 돌보기 — 아무 창에서나 돌되, 한 번만
// bundles.json 마지막 묶음, note-fix.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   이 게임의 뒷일은 거의 다 **그 사람 창에서만** 돈다. 특이사항 손질도,
//   기한 지난 효과·버프 떼어 내기도 자기 화면에서만 돈다.
//
//   그래서 며칠 안 들어온 사원은 **남들 눈에 틀린 채로 남는다.**
//       · 탈모약이 열 시간 전에 끝났는데 특이사항에 그대로
//       · 꼬리 금제가 어제 풀렸는데 아직 걸린 것처럼 보임
//       · 물약 효과가 끝났는데 사원 카드에는 「적용 중」
//
//   본인이 들어오면 제 화면이 치운다. 안 들어오면 영영 그대로다.
//
//   ※ 출산과 감금 정산도 같은 꼴이었는데 그 둘은 앞서 따로 고쳤다.
//     (birth-once.js · cage.js) 그쪽은 「늦어질 뿐」 잃지는 않는다.
//
// ■ 어떻게 하나
//
//   들어와 있는 아무 창이나 하나가 **모두의 밀린 일을 돌본다.**
//   누가 돌볼지는 서버에 적어 둔 **맡음표**로 정한다.
//
//       care/lease = { at: 맡은 때, by: 사번 }
//
//   맡음표가 비었거나 90초보다 묵었으면 가져올 수 있다. 가져오기는
//   트랜잭션이라 여럿이 동시에 눌러도 한 창만 이긴다. 그 창이 꺼지면
//   90초 뒤 다음 창이 이어받는다. 아무도 없으면 아무 일도 안 일어나고,
//   그건 지금과 똑같다 — 나빠지지 않는다.
//
//   고치는 일은 **치우는 것만** 한다. 주지도 빼앗지도 않는다.
//     1. 기한이 지난 특이사항 줄        (note-fix 의 손질을 그대로 쓴다)
//     2. 기한이 지난 itemBuffs
//     3. 기한이 지난 timedEffects       (고정은 건드리지 않는다)
//
//   쓰는 길은 updateUserFields 다. save-merge 가 그것을 「움직인 몫」으로
//   바꾸므로, 그 사람이 마침 들어와서 뭘 하고 있어도 부딪히지 않는다.
//
// ■ 콘솔
//   careState()     지금 누가 맡고 있나 · 무엇을 얼마나 치웠나
//   careNow()       손으로 한 바퀴 (맡음표를 가져와서)

(function caretaker() {

const LEASE = 'care/lease';
const LEASE_MS = 90000;        // 이보다 묵은 맡음표는 가져올 수 있다
const EVERY = 45000;           // 한 바퀴 사이
const SLOW = 8;                // 한 바퀴에 손볼 사람 수 (한꺼번에 다 치지 않는다)

let turn = false;              // 지금 내가 맡고 있나
let at = 0;                    // 언제 맡았나
let cursor = 0;                // 어디까지 봤나
const done = { notes: 0, buffs: 0, effects: 0, people: 0 };

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}

// 트랜잭션 — 거는 동안 그 자리를 지켜본다 (안 그러면 첫 굴림이 null 이다)
function tx(path, fn) {
    const d = db_();
    if (!d) return Promise.resolve({ committed: false });
    const ref = d.ref(path);
    let held = false, fired = false, go = null;
    const keep = function () { if (fired || !go) return; fired = true; go(); };
    const drop = function () { if (!held) return; held = false; try { ref.off('value', keep); } catch (e) { } };
    const run = function () {
        if (typeof txRetry === 'function') return txRetry(path, fn);
        return ref.transaction(fn, null, false);
    };
    return new Promise(function (res) {
        go = res;
        try { ref.on('value', keep, keep); held = true; } catch (e) { keep(); }
        setTimeout(keep, 4000);
    }).then(run).then(function (r) { drop(); return r; }, function (e) { drop(); throw e; });
}

// ==========================================
// 맡음표 가져오기 · 붙들기
// ==========================================
function grab() {
    const u = me();
    if (!u || !db_()) return Promise.resolve(false);
    return tx(LEASE, function (v) {
        const now = Date.now();
        if (v && v.by === u.code) return { at: now, by: u.code };        // 내 것 — 새로 적는다
        // 남의 것이고 아직 살아 있다 — 그만둔다
        if (v && v.at && Math.abs(now - v.at) < LEASE_MS) return;
        return { at: now, by: u.code };
    }).then(function (r) {
        const ok = !!(r && r.committed);
        turn = ok;
        if (ok) at = Date.now();
        return ok;
    }).catch(function () { turn = false; return false; });
}

// ==========================================
// 한 사람 돌보기 — 치우는 것만 한다
// ==========================================
function tend(u) {
    if (!u || !u.code || !u.name) return 0;
    const now = Date.now();
    const f = {};
    let n = 0;

    // 1. 기한이 지난 itemBuffs
    if (Array.isArray(u.itemBuffs) && u.itemBuffs.length) {
        const keep = u.itemBuffs.filter(function (b) {
            if (!b || typeof b !== 'object') return false;
            if (b.run) return true;                       // 다음 어둠 1회짜리 — 시간이 없다
            return !b.until || b.until > now;
        });
        if (keep.length !== u.itemBuffs.length) {
            done.buffs += u.itemBuffs.length - keep.length;
            u.itemBuffs = keep;
            f.itemBuffs = keep;
            n++;
        }
    }

    // 2. 기한이 지난 timedEffects (고정은 그대로)
    if (Array.isArray(u.timedEffects) && u.timedEffects.length) {
        const keep = u.timedEffects.filter(function (e) {
            if (!e || typeof e !== 'object') return false;
            if (e.fixed) return true;
            if (!e.expireAt || isNaN(e.expireAt)) return true;          // 못 재면 둔다
            return e.expireAt > now;
        });
        if (keep.length !== u.timedEffects.length) {
            done.effects += u.timedEffects.length - keep.length;
            u.timedEffects = keep;
            f.timedEffects = keep;
            n++;
        }
    }

    // 3. 기한이 지난 특이사항 줄 — note-fix 의 손질을 그대로 쓴다
    if (typeof window.noteReconcileOne === 'function') {
        const c = window.noteReconcileOne(u);
        if (c) { done.notes += c; f.badge = u.badge; n++; }
    }

    if (!n) return 0;
    done.people++;
    try {
        if (typeof updateUserFields === 'function') updateUserFields(u.code, f);
    } catch (e) { console.warn('[돌보기]', e); }
    return n;
}

// ==========================================
// 한 바퀴
// ==========================================
function round(force) {
    const u = me();
    if (!u || !db_()) return Promise.resolve(0);
    const users = (typeof db !== 'undefined' && db.users) || null;
    if (!users) return Promise.resolve(0);

    return grab().then(function (ok) {
        if (!ok && !force) return 0;
        const keys = Object.keys(users).filter(function (c) { return users[c] && users[c].name; });
        if (!keys.length) return 0;
        let n = 0;
        for (let i = 0; i < Math.min(SLOW, keys.length); i++) {
            const c = keys[(cursor + i) % keys.length];
            if (c === u.code) continue;                   // 내 것은 내 화면이 한다
            try { n += tend(users[c]); } catch (e) { }
        }
        cursor = (cursor + SLOW) % keys.length;
        if (n && typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
        return n;
    });
}

setTimeout(function () {
    round();
    setInterval(function () { try { round(); } catch (e) { } }, EVERY);
}, 12000);                                                 // 들어온 직후는 바쁘다 — 한 숨 뒤에

// ==========================================
// 확인 · 손으로
// ==========================================
window.careNow = function () {
    round(false).then(function (n) {
        if (!turn) { console.log('지금은 다른 창이 맡고 있습니다. (careState() 로 봅니다)'); return; }
        console.log(n ? ('✓ ' + n + '군데를 치웠습니다.') : '치울 것이 없었습니다.');
    });
};

window.careState = function () {
    console.log('%c===== 밀린 일 돌보기 =====', 'color:#8fc9ff; font-size:13px');
    console.log('  내가 맡고 있나:', turn ? ('O — ' + Math.round((Date.now() - at) / 1000) + '초째') : '✗');
    console.log('  치운 것 — 특이사항', done.notes + '줄 · 버프', done.buffs + '개 · 효과',
        done.effects + '개 · 사람', done.people + '명');
    const d = db_();
    if (!d) return;
    d.ref(LEASE).once('value').then(function (s) {
        const v = s.val();
        if (!v) { console.log('  맡은 창: 없음'); return; }
        const who = ((typeof db !== 'undefined' && db.users && db.users[v.by]) || {}).name || v.by;
        console.log('  맡은 창:', who, '·', Math.round((Date.now() - (v.at || 0)) / 1000) + '초 전',
            (Math.abs(Date.now() - (v.at || 0)) >= LEASE_MS ? '(묵었습니다 — 다음 바퀴에 넘어갑니다)' : ''));
    });
};

console.log('[돌보기] 밀린 일 — careState() · careNow()');

})();
