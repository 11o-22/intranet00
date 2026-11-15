// ==========================================
// ★ 파티 — 구역이 안 적힌 뼈대 방에 남은 내 자리를 걷는다 (2026-11-15)
// bundles.json 마지막 묶음 맨 끝 (craft-pity.js 뒤)
// ==========================================
//
// 2026-11-15 사용자 (영상 — 파티 칸에 「사라진 구역입니다.」 만 뜬다)
//   「제이 사원 거인데 아예 파티가 안 만들어져서 확인해 줘.」
//
// ■ 무엇이 일어났나
//   파티 감시기(index.html — darkParties 듣기)는 「명단(members)에 내 사번이 있는 첫 방」 을 내 방으로 잡는다.
//   그런데 **이미 지워진 방**에 늦게 닿은 쓰기가 방 번호 밑에 조각만 다시 만들어 둔다.
//       · 준비 단추            members/<나>/ready
//       · 반입품 확정           members/<나> { equips, items }
//       · 헬퍼 표시            members/<나>/helper
//       · 자리 다시 앉기        members/<나>            (방장이 방을 접는 순간과 겹칠 때)
//   그러면 구역(zone) · 방장 · 상태가 없는 **뼈대**에 내 자리만 남는다. 이 자리는 끊겨도 안 지워진다.
//   방 번호는 만든 시각 순이라 옛 뼈대가 늘 앞에 온다 → 새로 만든 방 대신 뼈대가 내 방으로 잡힌다
//   → 구역이 없으니 「사라진 구역입니다.」 만 뜨고 나가기 단추도 없다. 새로 열 때마다 만든 방만 빈 채로 쌓인다.
//
// ■ 어떻게
//   ① 감시기가 구역 없는 뼈대는 건너뛴다 (index.html) — 바로 제 방이 잡힌다.
//   ② 여기서 뼈대에 남은 **내 자리만** 걷는다 (members · alive · roster · helpers 의 <나>).
//      걷고 나서 명단 · 생존 표가 다 비면 뼈대째 치운다 (아무도 없는 조각이다).
//      서버에서 「구역이 없다」 를 다시 확인하고서만 쓴다 (transaction) — 멀쩡한 방은 건드리지 않는다.
//      남의 자리는 손대지 않는다 — 그 사람 화면이 걷는다.
//   ③ 구역은 적혀 있는데 이 화면이 모르는 구역이면 「사라진 구역입니다.」 밑에 [파티 나가기] (index.html).
//
// ■ 콘솔
//   partyGhostState()   뼈대 방 · 걷은 횟수

(function partyGhost() {
'use strict';

const EVERY = 4000;
const SLOTS = ['members', 'alive', 'roster', 'helpers'];
const stat = { swept: 0, gone: 0, fail: 0, last: '' };
const busy = {};

function d_() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }
function me_() { try { return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null; } catch (e) { return null; } }
function rooms() { try { return (typeof darkParties !== 'undefined' && darkParties) ? darkParties : {}; } catch (e) { return {}; } }
function has(o, k) { return !!(o && typeof o === 'object' && o[k]); }

// 구역이 안 적힌 방 가운데 내 자리가 남은 것
function mine() {
    const u = me_(), all = rooms(), out = [];
    if (!u || !u.code) return out;
    Object.keys(all).forEach(function (pid) {
        const p = all[pid];
        if (!p || typeof p !== 'object' || p.zone) return;
        if (SLOTS.some(function (k) { return has(p[k], u.code); })) out.push(pid);
    });
    return out;
}

function sweep(pid) {
    const d = d_(), u = me_();
    if (!d || !u || !u.code || !pid || busy[pid]) return Promise.resolve(false);
    const code = u.code;
    busy[pid] = 1;
    let emptied = false;
    return d.ref('darkParties/' + pid).transaction(function (cur) {
        emptied = false;
        if (!cur || typeof cur !== 'object') return;          // 이미 없다
        if (cur.zone) return;                                 // 구역이 적혀 있다 — 방이다. 손대지 않는다
        let hit = false;
        SLOTS.forEach(function (k) {
            if (!has(cur[k], code)) return;
            delete cur[k][code];
            hit = true;
            if (!Object.keys(cur[k]).length) delete cur[k];
        });
        if (!hit) return;
        if (!cur.members && !cur.alive) { emptied = true; return null; }   // 아무도 없는 조각 — 뼈대째 치운다
        return cur;
    }, null, false).then(function (r) {
        delete busy[pid];
        if (!r || !r.committed) return false;
        stat.swept++;
        if (emptied) stat.gone++;
        stat.last = new Date().toLocaleTimeString() + ' ' + pid + (emptied ? ' (뼈대째)' : '');
        console.log('[파티] 구역이 없는 뼈대 방에 남은 내 자리를 걷었습니다 — ' + pid + (emptied ? ' · 뼈대도 치움' : ''));
        return true;
    }).catch(function (e) {
        delete busy[pid];
        stat.fail++;
        console.warn('[파티] 뼈대 방 걷기 실패:', e && e.message);
        return false;
    });
}
window.partyGhostSweep = function (pid) { return pid ? sweep(pid) : Promise.all(mine().map(sweep)); };

setInterval(function () {
    try {
        if (!me_() || !d_()) return;
        mine().forEach(function (pid) { sweep(pid); });
    } catch (e) { }
}, EVERY);

window.partyGhostState = function () {
    const all = rooms(), u = me_();
    console.log('%c===== 👻 파티 — 구역 없는 뼈대 방 =====', 'color:#b39ddb; font-size:13px');
    const rows = Object.keys(all).filter(function (pid) { return all[pid] && typeof all[pid] === 'object' && !all[pid].zone; }).map(function (pid) {
        const p = all[pid];
        return { 방: pid, 칸: Object.keys(p).join(' · '), 명단: Object.keys(p.members || {}).length + '명',
                 '내 자리': (u && SLOTS.some(function (k) { return has(p[k], u.code); })) ? '남음 (곧 걷는다)' : '-' };
    });
    if (rows.length) console.table(rows); else console.log('  뼈대 방이 없다');
    console.log('  걷은 내 자리 ' + stat.swept + '번 · 뼈대째 치운 것 ' + stat.gone + '번 · 실패 ' + stat.fail + '번' + (stat.last ? ' · 마지막 ' + stat.last : ''));
};

console.log('[파티] 구역 없는 뼈대 방에 남은 내 자리를 걷는다 — partyGhostState()');
})();
