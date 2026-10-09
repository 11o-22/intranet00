// ==========================================
// ★ S-010 「검역 실패」 — 단계 점검용 콘솔
// bundles.json 에 넣지 않는다. 사원 화면에 단계 건너뛰기를 쥐여 줄 수는 없다.
// 쓸 때는 이 파일을 열어 전체 복사해서 브라우저 콘솔에 붙여 넣는다.
// ==========================================
//
//   s010()         지금 몇 단계인가 · 종류 · 감염도 · 성공/실패
//   s010.next()    다음 단계로
//   s010.prev()    앞 단계로
//   s010.go(n)     n 단계로
//   s010.end()     결산(99 단계)으로 한 번에 — 파티원도 같이 나간다
//                  (부르면 탐사가 끝난다)
//   s010.list()    단계 표 전체 (0~89 · 99)
//   s010.hold()    감염 진행·전향·즉사를 끈다 (점검 중 안 죽게)
//   s010.free()    묶은 것을 푼다
//   s010.scan()    0~89 를 한 번씩 그려 보고 터지거나 빈 곳을 찾는다
//
//   점검이 끝나면 s010.free() 로 되돌린다. 새로 고치면 그냥 사라진다.
//
// ■ 전향자 흐름은 따로다
//   감염도 60 을 넘기면 renderTurnedStep 이 화면을 전부 가져간다. 단계 표와
//   상관없이 돌아가므로 scan() 은 그쪽을 보지 않는다. 그쪽을 보려면
//       darkRun.turned = true; darkRun.turnDone = 0; darkRun.turnGoal = 3;
//       renderDarkStep();
//   로 들어간다. 되돌릴 때는 darkRun.turned = false.

(function () {

const ZONE = 'Qtrew-S-010';

function steps() {
    try { return (typeof S010_STEPS !== 'undefined') ? S010_STEPS : null; } catch (e) { return null; }
}
function keys() {
    const S = steps();
    return S ? Object.keys(S).map(Number).sort(function (a, b) { return a - b; }) : [];
}
function label(n) {
    const S = steps(); const d = S && S[n];
    if (!d) return '(없는 단계)';
    return d.type + (d.n != null ? ' ' + d.n : '') + (d.area ? ' ' + d.area : '');
}
function body() {
    try { return (typeof darkBodyEl === 'function') ? darkBodyEl() : null; } catch (e) { return null; }
}
function infect() {
    try { if (typeof getInfect === 'function') return getInfect(); } catch (e) { }
    return (typeof darkRun !== 'undefined' && darkRun) ? (darkRun.infect || 0) : 0;
}
function ready() {
    if (typeof darkRun === 'undefined' || !darkRun) { console.warn('탐사 중이 아닙니다.'); return false; }
    if (darkRun.zone !== ZONE) { console.warn('지금 구역은 ' + darkRun.zone + ' 입니다. S-010 에서 쓰십시오.'); return false; }
    if (!steps()) { console.warn('S010_STEPS 를 찾지 못했습니다. (묶음이 안 올라왔습니다)'); return false; }
    return true;
}

// ── 묶기 / 풀기 ───────────────────────────────
let kept = null;

function hold() {
    if (kept) { console.log('이미 묶여 있습니다.'); return; }
    kept = {
        inf:  (typeof addInfect === 'function')     ? addInfect     : null,
        turn: (typeof triggerTurn === 'function')   ? triggerTurn   : null,
        wipe: (typeof s010CheckWipe === 'function') ? s010CheckWipe : null
    };
    if (kept.inf)  addInfect     = function () { return; };
    if (kept.turn) triggerTurn   = function () { return; };
    if (kept.wipe) s010CheckWipe = function () { return false; };
    console.log('%c묶었습니다 — 감염도 그대로, 전향·즉사 끔', 'color:#8bc34a');
}

function free() {
    if (!kept) { console.log('묶인 것이 없습니다.'); return; }
    if (kept.inf)  addInfect     = kept.inf;
    if (kept.turn) triggerTurn   = kept.turn;
    if (kept.wipe) s010CheckWipe = kept.wipe;
    kept = null;
    console.log('%c풀었습니다 — 원래대로 돌아갑니다', 'color:#8bc34a');
}

// 방어전이 남겨 둔 시계를 끈다. 그냥 두면 점검이 끝난 뒤에 혼자 울려
// s010DefResult(false) 를 불러 실패를 적는다.
function stopDef() {
    if (typeof darkRun === 'undefined' || !darkRun) return;
    try { clearInterval(darkRun._defTimer); } catch (e) { }
    darkRun._defTimer = null;
    darkRun._defActive = false;
}

// ── 걸어 보기 ─────────────────────────────────
function go(n) {
    if (!ready()) return;
    const S = steps();
    if (!S[n]) { console.warn(n + ' 단계는 표에 없습니다. s010.list() 로 확인하십시오.'); return; }
    if (darkRun.isParty) console.warn('파티 탐사입니다. 나만 건너뛰면 동료와 걸음이 어긋납니다.');
    if (darkRun.turned) console.warn('전향한 상태입니다. 단계 표가 아니라 전향자 화면이 뜹니다.');

    stopDef();
    darkRun.step = n;
    darkRun._advTo = null;
    darkRun._purgeShown = true;     // 동료 전향 알림이 가로채지 않게
    window._rdsLock = false;        // renderDarkStep 의 120ms 자물쇠를 비킨다
    try { renderDarkStep(); } catch (e) { console.error(n + ' 단계에서 터졌습니다:', e); return; }
    show();
}

function next() {
    if (!ready()) return;
    const k = keys(), i = k.indexOf(darkRun.step);
    if (i < 0) { console.warn('지금 단계(' + darkRun.step + ')가 표에 없습니다.'); return; }
    if (i + 1 >= k.length) { console.log('마지막입니다.'); return; }
    go(k[i + 1]);
}

function prev() {
    if (!ready()) return;
    const k = keys(), i = k.indexOf(darkRun.step);
    if (i <= 0) { console.log('처음입니다.'); return; }
    go(k[i - 1]);
}

function show() {
    if (typeof darkRun === 'undefined' || !darkRun) { console.warn('탐사 중이 아닙니다.'); return; }
    const b = body();
    console.log('%c' + darkRun.step + ' 단계 — ' + label(darkRun.step),
        'color:#8bc34a; font-size:13px; font-weight:bold');
    console.log('  감염도 ' + infect() + '/100 (60 에서 전향)'
        + ' · 성공 ' + (darkRun.success || 0) + ' / 실패 ' + (darkRun.fail || 0)
        + ' · 보정 ' + (darkRun.modifier || 0)
        + (darkRun.turned ? ' · 전향' : '')
        + (darkRun.solo ? ' · 혼자' : '')
        + (kept ? ' · 묶음 중' : ''));
    if (b) console.log('  버튼 ' + b.querySelectorAll('button').length
        + '개 · 글자 ' + b.innerText.replace(/\s+/g, ' ').trim().length + '자');
}

// ── 결산으로 한 번에 ──────────────────────────
//
// 99 단계(result)로 바로 간다. 중간 단계를 밟지 않으므로 성공·실패·감염도는
// 지금 값 그대로 들어간다. 점수를 보고 싶으면 부르기 전에 손으로 올린다.
//     darkRun.success = 30; darkRun.fail = 4; darkRun.infect = 20; s010.end()
//
// 파티면 darkParties/<방>/curStep 에 99 를 적는다. 동료 화면은 watchPartyStep
// 이 그것을 보고 같이 결산으로 넘어간다. 각자 제 화면에서 정산하므로
// 포인트·회수품은 각자 제 몫으로 들어간다.
//
// 결산이 돌면 탐사가 끝난다 (darkRun 이 비워진다). 한 판에 한 번뿐이고,
// 다시 보려면 구역에 새로 들어가야 한다. 포인트와 회수품은 그대로 들어간다.
function end() {
    if (!ready()) return;
    if (darkRun._dead) { console.warn('이미 쓰러졌습니다. 결산이 열리지 않습니다.'); return; }
    if (darkRun._settled) { console.warn('이미 결산했습니다. 다시 보려면 새로 들어가야 합니다.'); return; }

    stopDef();
    darkRun.step = 99;
    darkRun._advTo = null;
    darkRun.rejoined = false;       // 복귀 화면이 먼저 가로채지 않게
    darkRun._purgeShown = true;
    window._rdsLock = false;

    // renderDarkResult 가 돌면 darkRun 이 비워지므로, 그리기 전에 적어야 한다.
    const pid = darkRun.isParty ? darkRun.partyId : null;
    if (pid && typeof database !== 'undefined' && database) {
        try {
            database.ref('darkParties/' + pid + '/curStep').set(99);
            console.log('  방에 99 를 적었습니다 — 동료들도 같이 나갑니다.');
        } catch (e) {
            console.warn('  방에 적지 못했습니다:', (e && e.message) || e);
        }
    } else if (darkRun.isParty) {
        console.warn('  방 번호나 서버가 없어 나만 나갑니다.');
    }

    console.log('%c결산으로', 'color:#8bc34a; font-size:13px; font-weight:bold');
    console.log('  성공 ' + (darkRun.success || 0) + ' / 실패 ' + (darkRun.fail || 0)
        + ' · 감염도 ' + infect()
        + ' · 보정 ' + (darkRun.modifier || 0)
        + (darkRun.turned ? ' · 전향' : ''));

    try { renderDarkStep(); } catch (e) { console.error('결산에서 터졌습니다:', e); return; }

    const b = body();
    if (b) console.log('  버튼 ' + b.querySelectorAll('button').length
        + '개 · 글자 ' + b.innerText.replace(/\s+/g, ' ').trim().length + '자');
    if (kept) console.log('  ※ 아직 묶여 있습니다. s010.free() 로 푸십시오.');
}

// ── 전부 한 번씩 그려 보기 ────────────────────
function scan() {
    if (!ready()) return;
    const b = body();
    if (!b) { console.warn('탐사 화면이 열려 있지 않습니다.'); return; }

    const back = darkRun.step;
    const wasTurned = !!darkRun.turned;
    const wasPurge = darkRun._purgeShown;
    const wasHeld = !!kept;
    if (!wasHeld) hold();
    darkRun.turned = false;         // 전향자 흐름은 단계 표와 별개다
    darkRun._purgeShown = true;     // 동료 전향 알림이 가로채지 않게

    // 그리다가 스스로 partyAdvance 를 부르는 단계가 있다 (표에 글이 없거나
    // 인원이 모자랄 때). 그대로 두면 방에 ready 를 적고 다음 단계를 그려
    // 표가 한 칸씩 어긋난다. 가로채서 「스스로 건너뜀」으로 적는다.
    const _pa = (typeof partyAdvance === 'function') ? partyAdvance : null;
    let jumped = null;
    if (_pa) partyAdvance = function (to) { jumped = to; };

    const rows = [];
    try {
        keys().forEach(function (n) {
            if (n === 99) return;                 // 결과 화면은 탐사를 끝낸다
            stopDef();
            darkRun.step = n;
            darkRun._advTo = null;
            jumped = null;
            b.innerHTML = '';
            let err = '';
            window._rdsLock = false;
            try { renderDarkStep(); } catch (e) { err = (e && e.message) || String(e); }
            const txt = b.innerText.replace(/\s+/g, ' ').trim();
            const btn = b.querySelectorAll('button').length;
            rows.push({
                단계: n, 종류: label(n),
                글자: txt.length, 버튼: btn,
                결과: err ? '✗ ' + err
                    : (jumped != null ? '△ 스스로 ' + jumped + ' 로 건너뜀'
                    : (!txt ? '✗ 아무것도 안 그려짐'
                    : (btn ? '○' : '△ 넘어갈 버튼 없음')))
            });
        });
    } finally {
        if (_pa) partyAdvance = _pa;
        stopDef();
        darkRun.turned = wasTurned;
        darkRun._purgeShown = wasPurge;
        darkRun.step = back;
        darkRun._advTo = null;
        window._rdsLock = false;
        try { renderDarkStep(); } catch (e) { }
        if (!wasHeld) free();
    }

    console.log('%c===== S-010 단계 점검 =====', 'color:#8bc34a; font-size:13px');
    console.table(rows);
    const bad = rows.filter(function (r) { return r.결과.charAt(0) !== '○'; });
    if (!bad.length) console.log('%c전부 그려집니다.', 'color:#4CAF50');
    else {
        console.log('%c' + bad.length + '곳이 걸립니다 — ' + bad.map(function (r) { return r.단계; }).join(', '),
            'color:#ff6b6b; font-weight:bold');
        bad.forEach(function (r) { console.log('  ' + r.단계 + ' (' + r.종류 + ') — ' + r.결과); });
    }
    console.log('  ※ 혼자 돌리면 투표·합류는 인원이 모자라 스스로 건너뜁니다. 그건 정상입니다.');
    console.log('  ※ 전향자 흐름은 따로입니다. 머리말 설명을 보십시오.');
}

// ── 내보내기 ──────────────────────────────────
window.s010 = function () { show(); };
window.s010.go    = go;
window.s010.next  = next;
window.s010.prev  = prev;
window.s010.end   = end;
window.s010.hold  = hold;
window.s010.free  = free;
window.s010.scan  = scan;
window.s010.list  = function () {
    const S = steps();
    if (!S) { console.warn('S010_STEPS 를 찾지 못했습니다.'); return; }
    console.table(keys().map(function (n) {
        return { 단계: n, 종류: label(n), 지금: (typeof darkRun !== 'undefined' && darkRun && darkRun.step === n) ? '◀' : '' };
    }));
};

console.log('%cS-010 점검 콘솔 준비됨', 'color:#8bc34a; font-size:13px; font-weight:bold');
console.log('  s010()  s010.next()  s010.prev()  s010.go(n)  s010.list()');
console.log('  s010.end()  — 결산으로 한 번에 (파티원도 같이)');
console.log('  s010.hold()  s010.free()  s010.scan()');

})();
