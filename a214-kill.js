// ==========================================
// ★ A-214 「빛을 찾아서」 — 신도가 사람을 죽일 수 있게
// bundles.json 마지막 묶음, dark.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 달라지나
//
//   미션과 길(루트)은 그대로다. 신도에게 **칼** 하나를 쥐여 준다.
//
//   1. 갈림길에서 혼자 떨어진 사원
//        신도 화면에만 「따라간다」가 뜬다. 누르면 **반드시 죽는다.**
//        혼자 간 쪽에는 아무도 없으니 막을 사람이 없다.
//
//   2. 신도와 사원이 단둘이 남았을 때
//        신도 화면에 「덮친다」가 뜬다. 누르면 사원 화면에 알림이 뜨고,
//        사원은 스무 면 주사위로 **반격**할 수 있다.
//
//          신도   d20 + 판정 보정 + 2 (기습)
//          사원   d20 + 판정 보정
//
//        사원이 더 높으면 사원이 산다 — 그리고 신도가 죽는다.
//        같거나 낮으면 사원이 죽는다. 가만히 있으면 그냥 죽는다.
//        (대략 열에 넷쯤 사원이 이긴다)
//
//   3. 살아서 나온 사원
//        포인트를 더 받는다. 신도가 몇을 죽였느냐에 따라 **최대 5,000 P.**
//            아무도 안 죽음 2,000 · 하나 3,500 · 둘 이상 5,000
//
//   4. 전부 죽인 신도
//        회수품 확률이 **200% 오른다** (세 배).
//
// ■ 어떻게 전하나
//
//   죽이는 쪽이 남의 화면을 직접 건드릴 수는 없다. 그래서 판에 적는다.
//
//       darkParties/<방>/a214/kills/<사번> = { by, name, how, at }
//       darkParties/<방>/a214/duel        = { by, target, atk, state … }
//
//   각자 제 화면에서 그것을 보고 제 몫을 한다. 죽는 것도 제 화면에서
//   darkDeath 를 부른다. 그래야 사직서·보안팀 의상 같은 살아남기
//   장치가 그대로 걸린다.
//
// ■ 기다리는 시간은 내 시계로만 센다
//   남의 시계로 적힌 때로 재면, 기기 시계가 몇 초만 달라도 창이
//   열리자마자 닫힌다. (마작에서 같은 자리를 이미 겪었다)
//
// ■ 콘솔
//   a214KillState()   지금 누가 살아 있고 누가 죽었나

(function a214Kill() {

const ZONE = 'Qtrew-A-214';
const DUEL_SEC = 20;          // 사원이 반격을 고를 수 있는 시간
const AMBUSH = 2;             // 신도의 기습 보정
const BOX = 'a214-kill-box';

function db_() { return (typeof database !== 'undefined') ? database : null; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function on() {
    const r = run();
    return !!(db_() && r && r.zone === ZONE && r.partyId && !r._dead && !r._settled);
}
function path() { return 'darkParties/' + run().partyId + '/a214'; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function nameOf(c) {
    try { if (typeof safeName === 'function') return safeName(c); } catch (e) { }
    const u = (typeof db !== 'undefined' && db.users && db.users[c]) || null;
    return (u && u.name) || c;
}
function d20() {
    const r = Math.floor(Math.random() * 20) + 1;
    try { if (typeof luckReroll === 'function') return luckReroll(r); } catch (e) { }
    return r;
}
function bonus() {
    try { if (typeof rollDarkBonus === 'function') return rollDarkBonus() || 0; } catch (e) { }
    return 0;
}

// ==========================================
// 방을 지켜본다
// ==========================================
let ref = null, key = '', room = null;

function watch() {
    if (!on()) {
        if (ref) { try { ref.off(); } catch (e) { } ref = null; key = ''; room = null; }
        return;
    }
    if (key === run().partyId) return;
    if (ref) { try { ref.off(); } catch (e) { } }
    key = run().partyId;
    diedFor = ''; duelShown = ''; seen.key = ''; huntList = [];    // 판이 바뀌면 처음부터
    ref = db_().ref('darkParties/' + key);
    ref.on('value', function (s) { room = s.val() || null; try { paint(); } catch (e) { } });
}

function a214() { return (room && room.a214) || null; }
function amCult() { const s = a214(); return !!(s && s.traitor === currentUser.code); }
function cultCode() { const s = a214(); return s ? s.traitor : null; }

// 처음 들어온 사람 목록 — 중간에 빠져도 줄지 않게 한 번 적어 둔다
function roster() {
    const s = a214() || {};
    let list = s.roster;
    if (list && !Array.isArray(list)) list = Object.keys(list).map(function (k) { return list[k]; });
    if (!Array.isArray(list) || !list.length) {
        list = Object.keys((room && room.members) || (room && room.alive) || {});
    }
    return list;
}
function killed() { return Object.keys(((a214() || {}).kills) || {}); }
function standing() {
    const k = killed();
    return roster().filter(function (c) { return k.indexOf(c) < 0; });
}

// 방장이 한 번만 적는다
function keepRoster() {
    const r = run();
    if (!r || !r.isLeader || !a214() || (a214().roster || []).length) return;
    const codes = Object.keys((room && room.members) || (room && room.alive) || {});
    if (codes.length) db_().ref(path() + '/roster').set(codes);
}

// ==========================================
// 화면에 끼워 넣는다
// ==========================================
function slot() {
    const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
    if (!body) return null;
    return body;
}
function put(html) {
    const body = slot();
    if (!body) return;
    const old = document.getElementById(BOX);
    if (old) {
        if (old.getAttribute('data-h') === html) return;
        old.outerHTML = html;
    } else {
        const bar = document.getElementById('a214-bar');
        if (bar) bar.insertAdjacentHTML('afterend', html);
        else body.insertAdjacentHTML('beforeend', html);
    }
}
function clear() {
    const old = document.getElementById(BOX);
    if (old) old.remove();
}
function wrap(inner, hue) {
    const h = '<div id="' + BOX + '" style="margin:10px 0; padding:11px 12px; border-radius:6px;'
        + ' background:rgba(127,0,0,0.14); border:1px solid ' + (hue || '#7f0000') + ';">' + inner + '</div>';
    return h;
}

// ==========================================
// 1. 갈림길 — 혼자 떨어진 사람을 따라간다
// ==========================================
let huntFor = 0;            // 몇 번째 갈림의 사냥을 보여 주고 있나
let huntList = [];

function loadHunt(n, tries) {
    tries = tries || 0;
    if (!on()) return;
    if (!a214()) {                                  // 방이 아직 안 왔다
        if (tries < 12) setTimeout(function () { loadHunt(n, tries + 1); }, 500);
        return;
    }
    if (!amCult()) return;
    db_().ref(path() + '/split' + n).once('value').then(function (s) {
        const picks = s.val() || {};
        const cnt = {};
        Object.keys(picks).forEach(function (c) {
            const p = picks[c] && picks[c].pick;
            if (p) cnt[p] = (cnt[p] || 0) + 1;
        });
        const k = killed();
        huntFor = n;
        huntList = Object.keys(picks).filter(function (c) {
            return c !== currentUser.code && k.indexOf(c) < 0
                && cnt[(picks[c] || {}).pick] === 1;
        }).map(function (c) { return { code: c, name: (picks[c] || {}).name || nameOf(c) }; });
        try { paint(); } catch (e) { }
    }).catch(function () { });
}

window.a214Hunt = function (code) {
    if (!on() || !amCult()) return;
    const nm = nameOf(code);
    if (killed().indexOf(code) >= 0) { showCustomAlert('이미 끝난 일입니다.'); return; }
    huntList = [];
    clear();
    db_().ref(path() + '/kills/' + code).set({
        by: currentUser.code, byName: currentUser.name, name: nm, how: 'hunt', at: Date.now()
    });
    const r = run();
    r.success++;
    r.log.push('[신도] ' + nm + ' 처리 (갈림길)');
    try { if (typeof a214Progress === 'function') a214Progress('m01', 1); } catch (e) { }

    if (typeof darkBodyEl === 'function' && typeof darkBox === 'function') {
        darkBodyEl().innerHTML = darkBox('따라간다',
            `발소리를 죽이고 따라간다.<br><br>
             복도가 좁아지는 자리에서 ${esc(nm)} 사원이 멈춘다.<br>
             뒤를 돌아보려다 만다. 아는 발소리라고 생각했을 것이다.<br><br>
             맞다. 아는 발소리다.<br><br>
             <span style="color:#ff6b6b;">소리는 길지 않았다.</span><br>
             흰 천을 덮어 두고 왔다. 여기서는 그게 예의다.`,
            (typeof a214BarHtml === 'function' ? a214BarHtml() : '')
            + darkChoiceBtn('돌아간다.', 'partyAdvance(' + (r.step + 1) + ')'));
        try { renderA214Bar(); } catch (e) { }
        try { mountDarkChat('normal'); } catch (e) { }
    }
};

// ==========================================
// 2. 단둘이 남았을 때 — 덮친다 / 반격한다
// ==========================================
window.a214Pounce = function () {
    if (!on() || !amCult()) return;
    const left = standing().filter(function (c) { return c !== currentUser.code; });
    if (left.length !== 1) { showCustomAlert('아직 단둘이 아닙니다.'); return; }
    const target = left[0];
    const atk = d20() + bonus() + AMBUSH;
    clear();
    db_().ref(path() + '/duel').set({
        by: currentUser.code, byName: currentUser.name,
        target: target, targetName: nameOf(target),
        atk: atk, state: 'open', at: Date.now()
    });
    showDarkToast('덮쳤습니다 — ' + atk);
};

window.a214Fight = function () {
    const s = a214(), d = s && s.duel;
    if (!on() || !d || d.state !== 'open' || d.target !== currentUser.code) return;
    const def = d20() + bonus();
    finishDuel(def, true);
};

// 이기고 지는 것과 **죽음까지 한 번에** 적는다.
// 나눠 적으면, 적을 차례인 쪽 화면이 꺼져 있을 때 아무도 안 죽는다.
function finishDuel(def, fought) {
    const id = run().partyId;
    db_().ref('darkParties/' + id + '/a214').transaction(function (a) {
        if (!a || !a.duel || a.duel.state !== 'open') return;
        const d = a.duel;
        const now = Date.now();
        d.def = def || 0;
        d.fought = !!fought;
        d.winner = (d.def > (d.atk || 0)) ? d.target : d.by;   // 같으면 기습한 쪽
        d.state = 'done';
        d.doneAt = now;
        a.kills = a.kills || {};
        if (d.winner === d.by) {
            a.kills[d.target] = { by: d.by, byName: d.byName || '', name: d.targetName || '',
                                  how: 'duel', at: now };
        } else {
            a.kills[d.by] = { by: d.target, byName: d.targetName || '', name: d.byName || '',
                              how: 'fight', at: now };
            a.exposed = (a.exposed || 0) + 1;
        }
        return a;
    }).catch(function () { });
}

// ==========================================
// 3. 죽음 · 결과를 제 화면에서 받는다
// ==========================================
let diedFor = '';
let duelShown = '';
const seen = { key: '', at: 0 };      // 반격 시간은 내 시계로만 센다

function die(why, text) {
    const r = run();
    if (!r || r._dead || diedFor === why) return;
    diedFor = why;
    r.fail += 2;
    r.failedRun = true;
    try { if (typeof darkDeath === 'function') darkDeath(text); } catch (e) { }
}

function paint() {
    if (!on()) return;
    keepRoster();
    const s = a214();
    if (!s) return;
    const r = run();

    // --- 내가 죽었나 ---
    const mine = (s.kills || {})[currentUser.code];
    if (mine) {
        clear();
        die('kill|' + (mine.at || 0),
            mine.how === 'fight'
                ? `밀렸다.<br><br>
                   손목이 꺾이는 감각. 그리고 바닥.<br>
                   올려다본 얼굴에 표정이 없다. 아까까지 같이 걷던 얼굴인데.<br><br>
                   <span style="color:#ff6b6b;">"빛은 혼자 찾으세요."</span><br><br>
                   그 말이 맞는 것 같아서 반박하지 못했다.`
                : mine.how === 'duel'
                ? `숨이 걸린다.<br><br>
                   반격했지만 모자랐다. 아니, 처음부터 모자랐는지도 모른다.<br>
                   ${esc(mine.byName || '누군가')}가 몸을 일으킨다. 숨도 안 찼다.<br><br>
                   <span style="color:#d4af37;">"빛을 찾으셨습니까."</span><br><br>
                   찾았다고 대답하고 싶었는데 소리가 안 나왔다.`
                : `뒤에서 발소리가 났다.<br><br>
                   아는 발소리라고 생각했다. 그래서 돌아보지 않았다.<br>
                   그게 마지막 판단이었다.<br><br>
                   <span style="color:#ff6b6b;">혼자 간 쪽에는 아무도 없다.</span><br>
                   그게 이 구역의 규칙이었다는 걸 이제 안다.`);
        return;
    }

    // --- 결투 ---
    const d = s.duel;
    if (d && d.state === 'open') {
        if (d.target === currentUser.code) {
            const key = d.by + '|' + (d.at || 0);
            if (seen.key !== key) { seen.key = key; seen.at = Date.now(); }
            const left = Math.max(0, Math.ceil((DUEL_SEC * 1000 - (Date.now() - seen.at)) / 1000));
            put(wrap(
                '<div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:6px;">'
                + '◉ ' + esc(d.byName || '누군가') + ' 사원이 덮쳐 왔습니다</div>'
                + '<div style="font-size:10px; color:#ccc; line-height:1.8; margin-bottom:9px;">'
                + '흰 옷자락이 먼저 보였다. 손에 든 것은 안 보인다.<br>'
                + '밀어낼 수 있다. 한 번뿐이다.<br>'
                + '<span style="color:#888;">주사위를 굴려 상대보다 높으면 삽니다. '
                + '가만히 있으면 그대로 끝납니다.</span></div>'
                + '<button class="game-btn" style="width:100%; margin:0; padding:11px; font-size:12px;'
                + ' border-color:#ff8a65 !important; color:#ff8a65 !important;" onclick="a214Fight()">'
                + '반격한다 <span style="font-size:10px; color:#aaa;">(' + left + '초)</span></button>'));
            if (left <= 0) finishDuel(0, false);          // 가만히 있었다
            return;
        }
        if (d.by === currentUser.code) {
            put(wrap('<div style="font-size:11px; color:#ff6b6b;">덮쳤습니다 — '
                + esc(d.targetName || '') + ' 사원의 반응을 기다립니다…</div>'));
            // 상대 화면이 꺼져 있어도 끝나야 한다
            const key = d.target + '|' + (d.at || 0);
            if (seen.key !== key) { seen.key = key; seen.at = Date.now(); }
            if (Date.now() - seen.at > (DUEL_SEC + 4) * 1000) finishDuel(0, false);
            return;
        }
        return;
    }

    if (d && d.state === 'done' && duelShown !== String(d.doneAt || d.at)) {
        duelShown = String(d.doneAt || d.at);
        clear();
        const iWon = d.winner === currentUser.code;
        if (d.winner === d.target) {
            // 사원이 이겼다 — 죽음은 트랜잭션이 이미 적어 두었다
            if (iWon && typeof darkBodyEl === 'function') {
                const r2 = run();
                r2.success += 2;
                r2.log.push('[반격] 신도를 제압 (' + d.def + ' vs ' + d.atk + ')');
                try { if (typeof sendPartyChat === 'function')
                    sendPartyChat(currentUser.name + ' 사원이 신도를 제압했습니다.', true); } catch (e) { }
                darkBodyEl().innerHTML = darkBox('반격',
                    `먼저 움직였다.<br><br>
                     주사위 <b style="color:#4CAF50;">${d.def}</b> 대 <b style="color:#ff6b6b;">${d.atk}</b>.<br>
                     반 발자국 차이였다. 그 반 발자국이 전부였다.<br><br>
                     흰 옷이 바닥에 깔린다. 아래에서 노랫소리가 한 번 끊겼다가 다시 이어진다.<br>
                     하나가 빠진 소리다.<br><br>
                     <span style="color:#d4af37;">아직 계단이 남았다.</span>`,
                    (typeof a214BarHtml === 'function' ? a214BarHtml() : '')
                    + darkChoiceBtn('올라간다.', 'partyAdvance(' + (r2.step + 1) + ')'));
                try { renderA214Bar(); } catch (e) { }
                try { mountDarkChat('normal'); } catch (e) { }
            }
            return;
        }
        // 신도가 이겼다 — 상대는 kills 를 보고 제 화면에서 죽는다
        if (d.by === currentUser.code) {
            const r3 = run();
            r3.success++;
            r3.log.push('[신도] ' + (d.targetName || '') + ' 처리 (' + d.atk + ' vs ' + (d.def || 0) + ')');
            showDarkToast('끝났습니다 — ' + d.atk + ' 대 ' + (d.def || 0));
        }
        return;
    }

    // --- 평소: 사냥감 · 덮치기 단추 ---
    if (!amCult()) { clear(); return; }

    const left = standing().filter(function (c) { return c !== currentUser.code; });
    if (left.length === 1 && !(s.kills || {})[left[0]]) {
        put(wrap(
            '<div style="font-size:11px; color:#ff6b6b; font-weight:bold; margin-bottom:5px;">◉ 단둘이 남았습니다</div>'
            + '<div style="font-size:10px; color:#aaa; line-height:1.7; margin-bottom:8px;">'
            + esc(nameOf(left[0])) + ' 사원 하나뿐입니다. 저쪽도 그걸 압니다.<br>'
            + '<span style="color:#888;">덮치면 상대가 주사위로 반격할 수 있습니다. 기습 보정 +'
            + AMBUSH + '.</span></div>'
            + '<button class="game-btn" style="width:100%; margin:0; padding:11px; font-size:12px;'
            + ' border-color:#ff6b6b !important; color:#ff6b6b !important;" onclick="a214Pounce()">'
            + '덮친다</button>'));
        return;
    }

    if (huntList.length) {
        put(wrap(
            '<div style="font-size:11px; color:#ff6b6b; font-weight:bold; margin-bottom:5px;">◉ 혼자 갔습니다</div>'
            + '<div style="font-size:10px; color:#aaa; line-height:1.7; margin-bottom:8px;">'
            + '막을 사람이 없는 쪽입니다. 따라가면 되돌아오지 못합니다.</div>'
            + huntList.map(function (x) {
                return '<button class="game-btn" style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px;'
                    + ' border-color:#ff6b6b !important; color:#ff6b6b !important;"'
                    + ' onclick="a214Hunt(\'' + x.code + '\')">' + esc(x.name) + ' 사원을 따라간다</button>';
            }).join('')));
        return;
    }
    clear();
}

setInterval(function () { try { watch(); paint(); } catch (e) { } }, 1200);

// ==========================================
// 4. 갈림길이 끝나면 사냥감을 찾는다
// ==========================================
(function hookSplit() {
    const iv = setInterval(function () {
        if (typeof a214AfterSplit !== 'function') return;
        if (a214AfterSplit._kill) { clearInterval(iv); return; }
        const _f = a214AfterSplit;
        a214AfterSplit = function (n, v) {
            const r = _f.apply(this, arguments);
            setTimeout(function () { try { loadHunt(n); } catch (e) { } }, 900);
            return r;
        };
        a214AfterSplit._kill = true;
        clearInterval(iv);
        console.log('[A-214] 갈림길 사냥 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 5. 정산 — 살아 나온 사원 · 전부 죽인 신도
// ==========================================
(function hookResult() {
    const iv = setInterval(function () {
        if (typeof renderDarkResult !== 'function') return;
        if (renderDarkResult._a214kill) { clearInterval(iv); return; }
        const _r = renderDarkResult;
        renderDarkResult = function () {
            try { mark(); } catch (e) { console.warn('[A-214]', e); }
            return _r.apply(this, arguments);
        };
        renderDarkResult._a214kill = true;
        clearInterval(iv);
        console.log('[A-214] 정산 연결');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

function mark() {
    const r = run();
    if (!r || r.zone !== ZONE) return;
    const s = a214() || (typeof a214State !== 'undefined' ? a214State : null) || {};
    const kills = Object.keys(s.kills || {});
    const byCult = kills.filter(function (c) {
        const k = (s.kills || {})[c];
        return k && k.by === (s.traitor || cultCode());
    });

    if (s.traitor === currentUser.code) {
        const others = Math.max(0, roster().length - 1);
        // 나 말고 전부 — 회수품 확률 세 배 (200% 상승)
        if (others > 0 && byCult.length >= others) {
            r.a214Purge = true;
            r.log.push('[신도] 전원 처리');
        }
        return;
    }
    // 살아서 나온 사원
    r.a214Survived = true;
    r.a214SurviveBonus = Math.min(5000, 2000 + 1500 * byCult.length);
}

// ==========================================
// 확인
// ==========================================
window.a214KillState = function () {
    console.log('%c===== A-214 =====', 'color:#ff6b6b; font-size:13px');
    if (!on()) { console.log('  지금 A-214 에 있지 않습니다.'); return; }
    const s = a214() || {};
    console.log('  신도:', s.traitorName || nameOf(s.traitor), '· 나는', amCult() ? '신도' : '사원');
    console.log('  들어온 사람:', roster().map(nameOf).join(', '));
    console.log('  죽은 사람:', killed().map(function (c) {
        const k = s.kills[c]; return nameOf(c) + '(' + (k.how || '?') + ')';
    }).join(', ') || '없음');
    console.log('  남은 사람:', standing().map(nameOf).join(', '));
    console.log('  결투:', s.duel ? JSON.stringify(s.duel) : '없음');
};

console.log('[A-214] 신도의 칼 — a214KillState()');

})();
