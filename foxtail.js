// ==========================================
// ★ 🦊 호사수구 — 구미호의 아홉 꼬리
// bundles.json 마지막 그룹, newitems2.js·spaceitems.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   상담사가 손으로만 줄 수 있는 장착품이다. 어느 상점에도 안 깔리고
//   장터(팝니다·구합니다)에도 안 뜬다. 은심장도 같이 가려 둔다.
//
//   꼬리가 아홉이고 꼬리마다 다른 힘이 있다. 하루에 아홉 개를 쓰고,
//   자정이 지나면 다시 아홉 개가 된다.
//
//       1 회피            2 기믹 파훼      3 행운
//       4 판정            5 동결           6 어둠 탐사 횟수
//       7 공용시설 횟수   8 공용시설 행운  9 상담실·선녀탕 즉시 탈출
//
//   꼬리 하나가 +1 (또는 +50% · 한 시간 · 한 번) 이고,
//   주(主)로 쓸 꼬리에 다른 꼬리를 더하면 그만큼 세진다.
//   더해진 꼬리는 제 힘을 잃고 주 꼬리의 몫으로만 들어간다.
//
//       회피 · 행운 · 판정      최대 +5   (꼬리 5개)
//       기믹 파훼               최대 +3   (꼬리 3개)
//       어둠 탐사 횟수          최대 +3   (꼬리 3개)
//       공용시설 횟수           최대 +6   (꼬리 6개)
//       공용시설 행운           최대 450% (꼬리 9개)
//       동결                    최대 9시간 (꼬리 9개)
//       즉시 탈출               최대 6회  (꼬리 6개)
//
//   시간으로 도는 힘은 전부 24시간이다.
//
// ■ 쓰는 차례
//
//   장착한다 → 소지품의 장착칸에 「🦊 남은 꼬리 N」 단추가 붙는다
//   → 누른다 → 본인 / 타인 (타인이면 사번)
//   → 꼬리 아홉을 늘어놓는다 → 주 꼬리를 고른다
//   → 「다른 꼬리와 합치겠습니까」 → 더할 개수를 고른다 → 사용
//
//   남에게 걸면 그 사람 특이사항에
//       여우의 금제가 걸렸습니다 (기능)
//   이 적힌다.
//
// ■ 횟수로 주는 것은 그 자리에서 준다
//
//   어둠 탐사 횟수와 공용시설 횟수는 24시간짜리 보정으로 얹지 않고
//   그 자리에서 쓴 횟수를 깎아 준다.
//
//   전에 어둠 탐사 충전이 「clamp 된 값 위에 보너스를 더하는」 식이라
//   아무리 써도 안 줄어드는 일이 있었다. 같은 실수를 하지 않으려고
//   이쪽은 darkTries·facilityCount 를 직접 되돌리는 쪽으로 만들었다.
//
// ■ 장착은 저절로 안 풀린다
//
//   힘의 시간이 다해도 호사수구 자체는 장착칸에 그대로 있는다.
//   해제를 눌러야 소지품으로 돌아간다.
//
// ■ 확인용
//
//   foxState(사번)   남은 꼬리 · 걸려 있는 힘
//   foxGive(사번)    상담사가 손으로 하나 준다
//   foxReset(사번)   오늘 쓴 꼬리를 되돌린다 (상담사)

(function foxTail() {

const FOX = '🦊 호사수구';
const HEART = '은심장';
const DAY_TAILS = 9;
const BUFF_MS = 24 * 3600 * 1000;
const HOUR = 3600 * 1000;

// 꼬리 — i 번호 · k 열쇠 · max 합칠 수 있는 꼬리 수
const TAILS = [
    { i: 1, k: 'evade', n: '회피',           max: 5, step: 1,  unit: '',    say: '어둠 회피 판정' },
    { i: 2, k: 'gim',   n: '기믹 파훼',      max: 3, step: 1,  unit: '회',  say: '기믹 파훼 횟수' },
    { i: 3, k: 'luck',  n: '행운',           max: 5, step: 1,  unit: '',    say: '회수품·재굴림 행운' },
    { i: 4, k: 'roll',  n: '판정',           max: 5, step: 1,  unit: '',    say: '어둠 판정 전부' },
    { i: 5, k: 'freeze',n: '동결',           max: 9, step: 1,  unit: '시간',say: '오염도·포만도 동시 동결' },
    { i: 6, k: 'dark',  n: '어둠 탐사 횟수', max: 3, step: 1,  unit: '회',  say: '어둠 탐사 횟수' },
    { i: 7, k: 'fcnt',  n: '공용시설 횟수',  max: 6, step: 1,  unit: '회',  say: '공용시설 이용 횟수' },
    { i: 8, k: 'fluck', n: '공용시설 행운',  max: 9, step: 50, unit: '%',   say: '공용시설 행운' },
    { i: 9, k: 'out',   n: '즉시 탈출',      max: 6, step: 1,  unit: '회',  say: '상담실·선녀탕에서 바로 나온다' }
];
function tailOf(k) { return TAILS.filter(function (t) { return t.k === k; })[0]; }

function today() {
    const d = new Date();
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function tailsLeft(u) {
    u = u || currentUser;
    if (!u) return 0;
    if (u.foxDay !== today()) return DAY_TAILS;
    return Math.max(0, DAY_TAILS - (u.foxUsed || 0));
}
function spendTails(u, n) {
    if (u.foxDay !== today()) { u.foxDay = today(); u.foxUsed = 0; }
    u.foxUsed = (u.foxUsed || 0) + n;
}
function wearsFox(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return false;
    return u.equippedWeapons.some(function (w) {
        const b = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        return b === FOX;
    });
}

// ==========================================
// 걸려 있는 힘
// ==========================================
function buffs(u) {
    u = u || currentUser;
    if (!u) return [];
    if (!Array.isArray(u.foxBuffs)) u.foxBuffs = [];
    const t = Date.now();
    u.foxBuffs = u.foxBuffs.filter(function (b) { return b && b.until > t; });
    return u.foxBuffs;
}
function sum(u, k) {
    return buffs(u).reduce(function (a, b) { return a + (b.k === k ? (b.v || 0) : 0); }, 0);
}
window._foxSum = sum;

// ==========================================
// 등록 — 어디에도 안 깔린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        clearInterval(iv);
        ITEM_CATALOG[FOX] = {
            price: 0, usable: true, targetable: false, effect: 'fox_equip', noSell: true,
            desc: '구미호의 꼬리를 본떠 만든 것. 꼬리가 아홉이고 꼬리마다 다른 힘이 깃든다. '
                + '하루에 아홉 개를 쓸 수 있고 자정이 지나면 다시 아홉이 된다. '
                + '주로 쓸 꼬리에 다른 꼬리를 더하면 그만큼 세진다.'
        };
        if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(FOX) < 0) NO_SELL_ITEMS.push(FOX);
        // 어느 상점 후보에도 들어가지 않게
        [FOX].forEach(function (n) {
            if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
                const i = ALIEN_ITEMS_POOL.indexOf(n);
                if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
            }
        });
        console.log('[여우] ' + FOX + ' 등록 — 상담사 지급 전용');
    }, 400);
})();

// 혹시 다른 파일이 상점 후보에 넣어도 계속 빼 둔다
setInterval(function () {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return;
    [FOX].forEach(function (n) {
        const i = ALIEN_ITEMS_POOL.indexOf(n);
        if (i > -1) ALIEN_ITEMS_POOL.splice(i, 1);
    });
}, 5000);

// --- 장터(팝니다·구합니다)에서 가린다 ---
(function hideMarket() {
    const iv = setInterval(function () {
        if (typeof marketSellable !== 'function') return;
        if (marketSellable._foxHide) { clearInterval(iv); return; }
        const _m = marketSellable;
        marketSellable = function () {
            const pool = _m.apply(this, arguments);
            try { pool.delete(FOX); pool.delete(HEART); } catch (e) { }
            return pool;
        };
        marketSellable._foxHide = true;
        clearInterval(iv);
        console.log('[여우] 장터에서 ' + FOX + ' · ' + HEART + ' 를 가림');
    }, 400);
})();

// ==========================================
// 힘을 건다
// ==========================================
function apply(target, k, count) {
    const T = tailOf(k);
    if (!T || !target) return '';
    const v = T.step * count;
    const until = Date.now() + BUFF_MS;
    let say = '';

    if (k === 'freeze') {
        const add = count * HOUR;
        target.pollFreezeUntil = Math.max(Date.now(), target.pollFreezeUntil || 0) + add;
        target.satHoldUntil = Math.max(Date.now(), target.satHoldUntil || 0) + add;
        say = '오염도·포만도 동결 ' + count + '시간';

    } else if (k === 'dark') {
        target.darkTries = Math.max(0, (target.darkTries || 0) - count);
        say = '어둠 탐사 ' + count + '회';

    } else if (k === 'fcnt') {
        target.facilityCount = Math.max(0, (target.facilityCount || 0) - count);
        say = '공용시설 ' + count + '회';

    } else if (k === 'out') {
        target.foxEscape = (target.foxEscape || 0) + count;
        say = '즉시 탈출 ' + count + '회';

    } else {
        if (!Array.isArray(target.foxBuffs)) target.foxBuffs = [];
        target.foxBuffs.push({ k: k, v: v, until: until });
        say = T.n + ' +' + v + T.unit + ' (24시간)';
    }
    return say;
}

// ==========================================
// 본인에게 걸었을 때 — 특이사항에 남긴다
// ==========================================
//
// 타인에게 걸면 appendBadgeNoteToUser 로 상대 특이사항에 적히는데, 본인에게
// 걸면 아무 데도 안 적혔다. 그래서 무엇이 얼마나 걸렸는지 알 수가 없었다.
//
// 「꼬리 n개 사용 - (버프)」 로 적는다. 같은 꼬리를 다시 쓰면 앞 줄을 지우고
// 새로 적고, 24시간이 지난 줄은 저절로 치운다. 줄이 쌓이지 않게.
//
// 주의 — newitems2.js:226 의 removeBadgeLine 은 <br> 과 개행만 끊는다.
// appendBadgeNoteToUser(index.html:5169)는 ' | ' 로 잇는다. 그래서 그것으로는
// 지워지지 않는다. 여기서는 ' | ' 까지 끊는 것을 따로 쓴다.
function badgeKey(u) {
    if (!u || !u.badge || typeof u.badge !== 'object') return null;
    if (typeof u.badge.notes === 'string') return 'notes';
    if (typeof u.badge.note === 'string') return 'note';
    return 'notes';
}
function cutLine(u, line) {
    if (!u || !u.badge || !line) return false;
    const obj = (typeof u.badge === 'object');
    const key = obj ? badgeKey(u) : null;
    const raw = String(obj ? (u.badge[key] || '') : u.badge);
    if (raw.indexOf(line) < 0) return false;

    const bar = raw.indexOf('|') >= 0;
    const br = /<br\s*\/?>/i.test(raw);
    const parts = raw.split(/\s*\|\s*|<br\s*\/?>|\n/);
    const keep = parts.filter(function (x) { return x && x.indexOf(line) < 0; });
    const joined = keep.join(bar ? ' | ' : (br ? '<br>' : '\n'));
    const out = joined || '특이사항 없음';
    if (obj) u.badge[key] = out; else u.badge = out;
    return true;
}

function noteSelf(u, T, count, say) {
    if (!u || typeof appendBadgeNoteToUser !== 'function') return;
    if (!Array.isArray(u.foxNotes)) u.foxNotes = [];
    const now = Date.now();

    // 같은 꼬리의 지난 줄 · 기한이 지난 줄을 치운다
    u.foxNotes = u.foxNotes.filter(function (n) {
        if (!n || !n.line) return false;
        if (n.k === T.k || (n.until || 0) <= now) { cutLine(u, n.line); return false; }
        return true;
    });

    const line = '꼬리 ' + count + '개 사용 - ' + say;
    appendBadgeNoteToUser(u, line);
    u.foxNotes.push({ k: T.k, line: line, until: now + BUFF_MS });
}

// ==========================================
// 특이사항에서 치우기 — 24시간이 지나면 지운다
// ==========================================
//
// ■ 무엇이 안 지워졌나
//
//   남에게 걸면 상대 특이사항에 한 줄이 적힌다.
//
//       여우의 금제가 걸렸습니다 (행운 +3 (24시간))
//
//   그런데 **적기만 하고 지우는 자리가 없었다.** 기한을 적어 두는 자리
//   (foxNotes)도 본인에게 걸 때만 쌓았다. 그래서 힘은 24시간 뒤에 끝나는데
//   줄은 영영 남았다.
//
//   본인 쪽 줄도, 이 기록이 생기기 전에 적힌 것은 기한이 없어 안 치워졌다.
//
// ■ 어떻게 고치나
//
//   1. 남에게 걸 때도 상대 자리에 기한을 같이 적는다 (아래 useTails)
//   2. 기한이 지난 줄을 치운다 (예전과 같다)
//   3. **기한이 안 적힌 묵은 줄**은, 걸려 있던 힘이 다 끝났으면 치운다
//
//   3번은 전에 적힌 줄을 위한 것이다. 새로 적는 줄은 전부 기한이 붙으므로
//   여기 걸리지 않는다.
//
//   치우는 것은 제 자리뿐이다 — 각자 접속하면 1분 안에 치워진다.
//   한꺼번에 치우려면 상담사가 foxNoteClean() 을 쓴다.
const FOX_LINE = /^\s*(꼬리 \d+개 사용 -|여우의 금제가 걸렸습니다)/;

// 아직 걸려 있는 힘이 있나 (시간으로 도는 것만 본다)
function foxLive(u) {
    if (!u) return false;
    const now = Date.now();
    if (Array.isArray(u.foxBuffs) && u.foxBuffs.some(function (b) { return b && (b.until || 0) > now; })) return true;
    if ((u.pollFreezeUntil || 0) > now) return true;
    if ((u.satHoldUntil || 0) > now) return true;
    return false;
}

function badgeLines(u) {
    const obj = (u && u.badge && typeof u.badge === 'object');
    const key = obj ? badgeKey(u) : null;
    const raw = String(obj ? (u.badge[key] || '') : ((u && u.badge) || ''));
    return raw.split(/\s*\|\s*|<br\s*\/?>|\n/).filter(function (x) { return x && x.trim(); });
}

// 한 사람의 묵은 줄을 치운다 — 치운 줄 수를 돌려준다
function sweepNotes(u) {
    if (!u) return 0;
    const now = Date.now();
    const notes = Array.isArray(u.foxNotes) ? u.foxNotes : [];
    const keep = [];
    let cut = 0;

    // ① 기한이 적힌 줄 — 때가 지났으면 치운다
    notes.forEach(function (n) {
        if (!n || !n.line) return;
        if ((n.until || 0) > now) { keep.push(n); return; }
        if (cutLine(u, n.line)) cut++;
    });

    // ② 기한이 안 적힌 묵은 줄 — 걸린 힘이 다 끝났으면 치운다
    if (!foxLive(u)) {
        badgeLines(u).forEach(function (line) {
            if (!FOX_LINE.test(line)) return;
            if (keep.some(function (n) { return n.line === line; })) return;
            if (cutLine(u, line)) cut++;
        });
    }

    if (keep.length !== notes.length) u.foxNotes = keep;
    return cut;
}

function sweepMine() {
    try {
        const u = (typeof currentUser !== 'undefined') ? currentUser : null;
        if (!u) return;
        const before = Array.isArray(u.foxNotes) ? u.foxNotes.length : 0;
        const cut = sweepNotes(u);
        const after = Array.isArray(u.foxNotes) ? u.foxNotes.length : 0;
        if (!cut && before === after) return;
        if (typeof saveFields === 'function') saveFields({ badge: 1, foxNotes: 1 });
        if (cut && typeof updateUI === 'function') updateUI();
        if (cut) console.log('[여우] 기한이 지난 특이사항 ' + cut + '줄을 치웠습니다.');
    } catch (e) { console.warn('[여우] 특이사항 치우기 건너뜀:', e && e.message); }
}

setInterval(sweepMine, 60000);
setTimeout(sweepMine, 6000);          // 들어오자마자 한 번

// 상담사 — 전원 것을 한 번에 치운다 (예전에 쌓인 줄 정리용)
window.foxNoteClean = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof db === 'undefined' || !db.users) { console.warn('사원 목록을 못 읽었습니다.'); return; }
    const rows = [];
    Object.keys(db.users).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.code) return;
        const cut = sweepNotes(u);
        if (!cut) return;
        rows.push({ 사원: u.name, 치운줄: cut });
        if (typeof updateUserFields === 'function') {
            try { updateUserFields(u.code, { badge: u.badge, foxNotes: u.foxNotes || [] }); } catch (e) { }
        }
    });
    if (!rows.length) { console.log('치울 줄이 없습니다.'); return; }
    console.log('%c✓ ' + rows.length + '명의 특이사항을 치웠습니다.', 'color:#4CAF50');
    console.table(rows);
};

function useTails(target, k, count, isSelf) {
    const me = currentUser;
    if (!me || !target) return;
    const T = tailOf(k);
    if (!T) return;
    if (count < 1 || count > T.max) { showCustomAlert('꼬리 수가 맞지 않습니다.'); return; }
    if (tailsLeft(me) < count) { showCustomAlert('남은 꼬리가 모자랍니다.'); return; }

    const say = apply(target, k, count);
    spendTails(me, count);

    if (typeof addHistoryLog === 'function') {
        addHistoryLog(me, '[' + FOX + '] 꼬리 ' + count + '개 — ' + (isSelf ? '본인' : target.name) + ' · ' + say);
    }

    if (isSelf) {
        // 본인에게 걸면 아무 데도 안 남아 무엇이 얼마나 걸렸는지 알 수가 없었다.
        // 특이사항에 「꼬리 n개 사용 - (버프)」 로 적어 둔다. 같은 꼬리를 다시
        // 쓰면 앞 줄을 지우고 새로 적는다. 줄이 쌓이지 않게.
        noteSelf(me, T, count, say);
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    } else {
        // 상대 자리에도 **기한을 같이 적는다.** 이것이 없어서 24시간이 지나도
        // 특이사항에서 안 지워졌다. (위 sweepNotes 참고)
        if (typeof appendBadgeNoteToUser === 'function') {
            const line = '여우의 금제가 걸렸습니다 (' + say + ')';
            if (!Array.isArray(target.foxNotes)) target.foxNotes = [];
            // 같은 꼬리로 다시 걸면 앞 줄은 지우고 새로 적는다
            target.foxNotes = target.foxNotes.filter(function (n) {
                if (!n || !n.line) return false;
                if (n.k === T.k || (n.until || 0) <= Date.now()) { cutLine(target, n.line); return false; }
                return true;
            });
            appendBadgeNoteToUser(target, line);
            target.foxNotes.push({ k: T.k, line: line, until: Date.now() + BUFF_MS });
        }
        if (typeof addHistoryLog === 'function') {
            addHistoryLog(target, '[' + FOX + '] ' + me.name + ' 사원이 여우의 금제를 걸었습니다 — ' + say);
        }
        target.hasItemUsedOnMe = true;
        if (typeof updateUserFields === 'function') {
            try {
                updateUserFields(target.code, {
                    foxBuffs: target.foxBuffs || [], foxEscape: target.foxEscape || 0,
                    pollFreezeUntil: target.pollFreezeUntil || 0, satHoldUntil: target.satHoldUntil || 0,
                    darkTries: target.darkTries || 0, facilityCount: target.facilityCount || 0,
                    badge: target.badge, foxNotes: target.foxNotes || [],
                    history: target.history, hasItemUsedOnMe: true
                });
            } catch (e) { }
        }
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    }
    if (typeof updateUI === 'function') updateUI();
    showCustomAlert('꼬리 ' + count + '개를 풀었습니다.\n\n'
        + (isSelf ? '' : target.name + ' 사원 — ') + say
        + '\n\n오늘 남은 꼬리 ' + tailsLeft(me) + ' / ' + DAY_TAILS);
}

// ==========================================
// 창
// ==========================================
function box(html, z) {
    const w = document.createElement('div');
    w.className = 'fox-modal';
    w.style.cssText = 'position:fixed; inset:0; z-index:' + (z || 100000) + '; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.76); padding:18px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#1a1410,#0e0b08); border:1px solid #c08a3e;'
        + ' border-radius:10px; padding:16px; max-width:380px; width:100%; max-height:82vh;'
        + ' display:flex; flex-direction:column;">' + html + '</div>';
    document.body.appendChild(w);
    return w;
}
function shut() {
    Array.prototype.forEach.call(document.querySelectorAll('.fox-modal'), function (x) { x.remove(); });
}
const BTN = 'width:100%; margin:0 0 8px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// 1단계 — 누구에게
function step1() {
    if (!currentUser) return;
    const left = tailsLeft(currentUser);
    if (left <= 0) { showCustomAlert('오늘 쓸 꼬리가 없습니다.\n\n자정이 지나면 아홉 개가 됩니다.'); return; }
    shut();
    const w = box('<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">' + FOX + '</div>'
        + '<div style="font-size:10px; color:#888; margin:5px 0 13px 0;">오늘 남은 꼬리 '
        + left + ' / ' + DAY_TAILS + '</div>'
        + '<button id="fx-me" class="game-btn" style="' + BTN + '">본인에게</button>'
        + '<button id="fx-you" class="game-btn" style="' + BTN + '">타인에게</button>'
        + '<button id="fx-no" class="game-btn" style="' + BTN + GREY + '">닫는다</button>');
    w.querySelector('#fx-no').onclick = shut;
    w.querySelector('#fx-me').onclick = function () { step2(currentUser, true); };
    w.querySelector('#fx-you').onclick = function () { askWho(); };
}

// 사번 묻기
function askWho() {
    shut();
    const w = box('<div style="font-size:13px; color:#ffcf8f; font-weight:bold; margin-bottom:9px;">누구에게</div>'
        + '<input id="fx-no-in" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false"'
        + ' placeholder="사번 또는 이름" style="width:100%; padding:10px; font-size:13px; margin-bottom:10px;">'
        + '<button id="fx-go" class="game-btn" style="' + BTN + '">다음</button>'
        + '<button id="fx-no2" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');
    const f = w.querySelector('#fx-no-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 80);
    w.querySelector('#fx-no2').onclick = shut;
    w.querySelector('#fx-go').onclick = function () {
        const v = (f.value || '').trim();
        if (!v) { showCustomAlert('사번을 적어 주세요.'); return; }
        const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
        const t = all.filter(function (x) { return x && (x.no === v || x.code === v || x.name === v); })[0];
        if (!t) { showCustomAlert('그 사번을 찾지 못했습니다.'); return; }
        if (t.code === currentUser.code) { showCustomAlert('본인은 「본인에게」로 거십시오.'); return; }
        step2(t, false);
    };
}

// 2단계 — 꼬리 아홉
function step2(target, isSelf) {
    shut();
    const left = tailsLeft(currentUser);
    const rows = TAILS.map(function (T) {
        const can = left >= 1;
        return '<button class="fox-pick game-btn" data-k="' + T.k + '"' + (can ? '' : ' disabled')
            + ' style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px; text-align:left;'
            + (can ? '' : ' opacity:.4;') + '">'
            + '<span style="color:#ffcf8f; font-weight:bold;">' + T.i + '. ' + T.n + '</span>'
            + '<div style="font-size:10px; color:#aaa; margin-top:3px; font-weight:normal;">'
            + T.say + ' · 꼬리 하나당 +' + T.step + T.unit + ' · 최대 꼬리 ' + T.max + '개</div></button>';
    }).join('');

    const w = box('<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">주로 쓸 꼬리</div>'
        + '<div style="font-size:10px; color:#888; margin:5px 0 11px 0;">'
        + (isSelf ? '본인' : target.name + ' 사원') + ' · 남은 꼬리 ' + left + '</div>'
        + '<div style="overflow-y:auto; flex:1;">' + rows + '</div>'
        + '<button id="fx-back" class="game-btn" style="' + BTN + GREY + ' margin-top:9px;">그만둔다</button>');
    w.querySelector('#fx-back').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.fox-pick'), function (b) {
        b.onclick = function () { step3(target, isSelf, b.getAttribute('data-k')); };
    });
}

// 3단계 — 합칠까
function step3(target, isSelf, k) {
    shut();
    const T = tailOf(k);
    const left = tailsLeft(currentUser);
    const most = Math.min(T.max, left);
    const opts = [];
    for (let n = 1; n <= most; n++) {
        opts.push('<button class="fox-cnt game-btn" data-n="' + n + '"'
            + ' style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px; text-align:left;">'
            + '<span style="color:#ffcf8f; font-weight:bold;">꼬리 ' + n + '개</span>'
            + '<span style="color:#fff; margin-left:8px;">'
            + (k === 'freeze' ? (n + '시간')
               : (k === 'fluck' ? ('+' + (n * 50) + '%') : ('+' + n + T.unit)))
            + '</span>'
            + (n === 1 ? '' : '<div style="font-size:10px; color:#888; margin-top:3px; font-weight:normal;">'
               + '주 꼬리 1 + 더하는 꼬리 ' + (n - 1) + '</div>')
            + '</button>');
    }
    const w = box('<div style="font-size:13px; color:#ffcf8f; font-weight:bold;">다른 꼬리와 합치겠습니까</div>'
        + '<div style="font-size:11px; color:#ddd; margin:6px 0 3px 0;">' + T.i + '. ' + T.n + '</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:11px;">'
        + '더해진 꼬리는 제 힘을 잃고 이 꼬리의 몫이 됩니다. · 남은 꼬리 ' + left + '</div>'
        + '<div style="overflow-y:auto; flex:1;">' + opts.join('') + '</div>'
        + '<button id="fx-b2" class="game-btn" style="' + BTN + GREY + ' margin-top:9px;">뒤로</button>');
    w.querySelector('#fx-b2').onclick = function () { step2(target, isSelf); };
    Array.prototype.forEach.call(w.querySelectorAll('.fox-cnt'), function (b) {
        b.onclick = function () {
            shut();
            useTails(target, k, parseInt(b.getAttribute('data-n'), 10), isSelf);
        };
    });
}
window.foxOpen = step1;

// ==========================================
// 장착 — 쓰면 장착칸에 꽂힌다. 저절로 안 풀린다
// ==========================================
(function equip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function' || typeof ITEM_CATALOG === 'undefined') return;
        if (useInventoryItem._fox) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'fox_equip') return _u.apply(this, arguments);
            if (!currentUser) return;
            if ((currentUser.inventory || []).indexOf(itemName) < 0) {
                showCustomAlert('가지고 있지 않습니다.'); return;
            }
            if (!Array.isArray(currentUser.equippedWeapons)) currentUser.equippedWeapons = [];
            if (wearsFox(currentUser)) { showCustomAlert('이미 차고 있습니다.'); return; }
            if (currentUser.equippedWeapons.length >= 12) {
                showCustomAlert('장착 슬롯이 가득 찼습니다.'); return;
            }
            currentUser.equippedWeapons.push(FOX);
            if (typeof setEquipOwner === 'function') setEquipOwner(currentUser, FOX, currentUser.code);
            if (typeof removeItemFromInventory === 'function') removeItemFromInventory(currentUser, itemName, 1);
            if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(currentUser, '[장착됨] ' + FOX);
            if (typeof addHistoryLog === 'function') addHistoryLog(currentUser, '[장착] ' + FOX);
            if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
            if (typeof updateUI === 'function') updateUI();
            showCustomAlert('꼬리가 아홉입니다.\n\n장착칸의 「🦊 남은 꼬리」를 눌러 씁니다.\n'
                + '힘의 시간이 다해도 이것 자체는 풀리지 않습니다.');
        };
        useInventoryItem._fox = true;
        clearInterval(iv);
        console.log('[여우] 장착 연결');
    }, 400);
})();

// ==========================================
// 장착칸에 「남은 꼬리」 단추
// ==========================================
(function badge() {
    const ID = 'fox-tail-btn';
    function stick() {
        const box2 = document.getElementById('inventory-list-container');
        if (!box2) return;
        const has = wearsFox(currentUser);
        const old = document.getElementById(ID);
        if (!has) { if (old) old.remove(); return; }
        if (old) { old.textContent = '🦊 남은 꼬리 ' + tailsLeft(currentUser); return; }

        let card = null;
        for (let i = 0; i < box2.children.length; i++) {
            const t = box2.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(FOX) >= 0) { card = box2.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div');
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0;'
            + ' background:linear-gradient(145deg,#8a5a1e,#4a2f0c) !important; border-color:#c08a3e !important;';
        b.textContent = '🦊 남은 꼬리 ' + tailsLeft(currentUser);
        b.onclick = step1;
        row.appendChild(b);
    }

    (function wrapRender() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._foxBtn) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () {
                const r = _r.apply(this, arguments);
                try { stick(); } catch (e) { }
                return r;
            };
            renderInventory._foxBtn = true;
            clearInterval(iv);
        }, 400);
    })();
    (function watch() {
        const iv = setInterval(function () {
            const el = document.getElementById('inventory-list-container');
            if (!el) return;
            clearInterval(iv);
            try { new MutationObserver(function () { try { stick(); } catch (e) { } })
                .observe(el, { childList: true }); } catch (e) { }
            stick();
        }, 400);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 3000);
})();

// ==========================================
// 즉시 탈출 — 격리 중이면 단추가 뜬다
// ==========================================
(function escape() {
    const ID = 'fox-escape-btn';
    setInterval(function () {
        const u = currentUser;
        const old = document.getElementById(ID);
        const inRoom = !!(u && u.quarantineUntil && Date.now() < u.quarantineUntil);
        const n = (u && u.foxEscape) || 0;
        if (!inRoom || n <= 0) { if (old) old.remove(); return; }
        if (old) { old.textContent = '🦊 금제를 푼다 (' + n + ')'; return; }

        const b = document.createElement('button');
        b.id = ID;
        b.className = 'game-btn';
        b.style.cssText = 'position:fixed; left:50%; transform:translateX(-50%); bottom:84px;'
            + ' z-index:99998; padding:11px 18px; font-size:12px; border-radius:22px;'
            + ' background:linear-gradient(145deg,#8a5a1e,#4a2f0c) !important; border-color:#c08a3e !important;'
            + ' box-shadow:0 4px 14px rgba(0,0,0,0.5);';
        b.textContent = '🦊 금제를 푼다 (' + n + ')';
        b.onclick = function () {
            if (!currentUser || (currentUser.foxEscape || 0) <= 0) return;
            currentUser.foxEscape -= 1;
            // 나올 때의 값(보통 100 가까이)을 그대로 두면 나오자마자 다시 들어간다.
            // 꺼내 온 사람은 오염도 50 으로 둔다.
            currentUser.quarantineUntil = 0;
            currentUser.quarantineDest = null;
            currentUser.quarantineHospital = null;
            currentUser.quarantineExitPollution = 0;
            currentUser.pollution = 50;
            currentUser.lastPollutionTime = Date.now();
            currentUser.foxRoomAnswered = false;
            if (typeof addHistoryLog === 'function') {
                addHistoryLog(currentUser, '[' + FOX + '] 꼬리로 금제를 풀고 나왔습니다. (오염도 50%)');
            }
            if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
            if (typeof updateUI === 'function') updateUI();
            b.remove();
            showCustomAlert('꼬리가 하나 풀렸습니다.\n\n나왔습니다. (오염도 50%)\n남은 탈출 '
                + (currentUser.foxEscape || 0) + '회');
        };
        document.body.appendChild(b);
    }, 2000);
})();

// ==========================================
// 힘을 실제로 먹인다
// ==========================================
function hook(name, fn) {
    const iv = setInterval(function () {
        if (typeof window[name] !== 'function') return;
        if (window[name]._fox) { clearInterval(iv); return; }
        const _o = window[name];
        window[name] = function () { return fn(_o, this, arguments); };
        window[name]._fox = true;
        clearInterval(iv);
    }, 400);
}

// 회피 · 판정
hook('rollDarkBonus', function (_o, self, a) {
    let b = _o.apply(self, a);
    if (!currentUser) return b;
    b += sum(currentUser, 'roll');
    const kind = a[0];
    if (kind === 'evade' || kind === 'hide') b += sum(currentUser, 'evade');
    return b;
});

// 행운 — 회수품 확률과 재굴림
hook('gearValue', function (_o, self, a) {
    let v = _o.apply(self, a);
    if (!currentUser) return v;
    const u = a[0], attr = a[1];
    if (attr !== 'luck' || !u || u.code !== currentUser.code) return v;
    const n = sum(currentUser, 'luck');
    if (n > 0) v = Math.min(1, (v || 0) + 0.2 * n);
    return v;
});

// 기믹 파훼
hook('smashCharges', function (_o, self, a) {
    let n = _o.apply(self, a);
    if (currentUser) n += sum(currentUser, 'gim');
    return n;
});

// 공용시설 행운
hook('facilityLuckMult', function (_o, self, a) {
    let m = _o.apply(self, a);
    const u = a[0] || currentUser;
    if (!u) return m;
    const pct = sum(u, 'fluck');
    if (pct > 0) m *= (1 + pct / 100);
    return m;
});

// ==========================================
// 확인 · 상담사
// ==========================================
function find(who) {
    const all = Object.keys(db.users || {}).map(function (c) { return db.users[c]; }).filter(Boolean);
    return who ? all.filter(function (x) {
        return x && (x.no === who || x.code === who || x.name === who);
    })[0] : currentUser;
}

window.foxState = function (who) {
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · ' + FOX + ' =====', 'color:#ffcf8f; font-size:13px');
    console.log('  장착:', wearsFox(u) ? 'O' : '✗',
        '· 오늘 남은 꼬리:', tailsLeft(u) + ' / ' + DAY_TAILS,
        '(' + (u.foxDay || '아직 안 씀') + ')');
    const b = buffs(u);
    if (b.length) {
        console.table(b.map(function (x) {
            const T = tailOf(x.k) || {};
            return { 꼬리: T.n || x.k, 몫: '+' + x.v + (T.unit || ''),
                     남은시간: Math.max(0, Math.round((x.until - Date.now()) / 60000)) + '분' };
        }));
    } else console.log('  걸려 있는 힘: 없음');
    const fr = Math.max(0, Math.max(u.pollFreezeUntil || 0, u.satHoldUntil || 0) - Date.now());
    console.log('  동결:', fr ? Math.round(fr / 60000) + '분 남음' : '없음');
    console.log('  즉시 탈출:', (u.foxEscape || 0) + '회');
};

window.foxGive = function (who, n) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const q = Math.max(1, Math.min(10, n || 1));
    if (!Array.isArray(u.inventory)) u.inventory = [];
    for (let i = 0; i < q; i++) u.inventory.push(FOX);
    if (typeof addHistoryLog === 'function') addHistoryLog(u, '[당국 개입] ' + FOX + ' ' + q + '개 지급');
    if (typeof updateUserFields === 'function') updateUserFields(u.code, { inventory: u.inventory, history: u.history });
    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + u.name + ' 사원에게 ' + FOX + ' ' + q + '개를 줬습니다.', 'color:#4CAF50');
};

window.foxReset = function (who) {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const u = find(who);
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    u.foxDay = today(); u.foxUsed = 0;
    if (typeof updateUserFields === 'function') updateUserFields(u.code, { foxDay: u.foxDay, foxUsed: 0 });
    if (typeof updateUI === 'function') updateUI();
    console.log('%c✓ ' + u.name + ' 사원의 꼬리를 아홉으로 되돌렸습니다.', 'color:#4CAF50');
};

console.log('[여우] foxState(사번) · foxGive(사번, 개수) · foxReset(사번) · foxOpen()');

})();
