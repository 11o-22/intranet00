// ==========================================
// ★ A-667 「물고기가 인간이 되었다」 — 단계 점검용 콘솔
// bundles.json 에 넣지 않는다. 사원 화면에 단계 건너뛰기를 쥐여 줄 수는 없다.
// 쓸 때는 이 파일을 열어 전체 복사해서 브라우저 콘솔에 붙여 넣는다.
// ==========================================
//
//   a667()         지금 몇 단계인가 · 종류 · 인간성 · 깊이
//   a667.next()    다음 단계로
//   a667.prev()    앞 단계로
//   a667.go(n)     n 단계로
//   a667.end()     결산(99 단계)으로 한 번에 — 파티원도 같이 나간다
//                  (부르면 탐사가 끝난다)
//   a667.list()    단계 표 전체 (0~32 · 99)
//   a667.hold()    인간성·깊이를 묶고 붙잡힘·표류를 끈다 (점검 중 안 죽게)
//   a667.free()    묶은 것을 푼다
//   a667.scan()    모든 단계를 한 번씩 그려 보고 터지거나 빈 곳을 찾는다
//
//   점검이 끝나면 a667.free() 로 되돌린다. 새로 고치면 그냥 사라진다.

(function () {

function steps() {
    try { return (typeof A667_STEPS !== 'undefined') ? A667_STEPS : null; } catch (e) { return null; }
}
function keys() {
    const S = steps();
    return S ? Object.keys(S).map(Number).sort(function (a, b) { return a - b; }) : [];
}
function label(n) {
    const S = steps(); const d = S && S[n];
    if (!d) return '(없는 단계)';
    return d.type + (d.n != null ? ' ' + d.n : '');
}
function body() {
    try { return (typeof darkBodyEl === 'function') ? darkBodyEl() : null; } catch (e) { return null; }
}
function ready() {
    if (typeof darkRun === 'undefined' || !darkRun) { console.warn('탐사 중이 아닙니다.'); return false; }
    if (darkRun.zone !== 'Qtrew-A-667') { console.warn('지금 구역은 ' + darkRun.zone + ' 입니다. A-667 에서 쓰십시오.'); return false; }
    if (!steps()) { console.warn('A667_STEPS 를 찾지 못했습니다. (묶음이 안 올라왔습니다)'); return false; }
    return true;
}

// ── 묶기 / 풀기 ───────────────────────────────
let kept = null;

function hold() {
    if (kept) { console.log('이미 묶여 있습니다.'); return; }
    kept = {
        hum: (typeof addHumanity === 'function') ? addHumanity : null,
        dep: (typeof addDepth === 'function') ? addDepth : null,
        grab: (typeof maybeGrab === 'function') ? maybeGrab : null,
        drift: (typeof maybeDrift === 'function') ? maybeDrift : null
    };
    if (kept.hum)   addHumanity = function () { return; };
    if (kept.dep)   addDepth    = function () { return; };
    if (kept.grab)  maybeGrab   = function () { return false; };
    if (kept.drift) maybeDrift  = function () { return false; };
    console.log('%c묶었습니다 — 인간성·깊이 그대로, 붙잡힘·표류 끔', 'color:#4fc3f7');
}

function free() {
    if (!kept) { console.log('묶인 것이 없습니다.'); return; }
    if (kept.hum)   addHumanity = kept.hum;
    if (kept.dep)   addDepth    = kept.dep;
    if (kept.grab)  maybeGrab   = kept.grab;
    if (kept.drift) maybeDrift  = kept.drift;
    kept = null;
    console.log('%c풀었습니다 — 원래대로 돌아갑니다', 'color:#4fc3f7');
}

// ── 걸어 보기 ─────────────────────────────────
function go(n) {
    if (!ready()) return;
    const S = steps();
    if (!S[n]) { console.warn(n + ' 단계는 표에 없습니다. a667.list() 로 확인하십시오.'); return; }
    if (darkRun.isParty) console.warn('파티 탐사입니다. 나만 건너뛰면 동료와 걸음이 어긋납니다.');

    darkRun.step = n;
    darkRun._advTo = null;
    darkRun.driftIdx = null;        // 표류 중이면 빠져나온다
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
        'color:#4fc3f7; font-size:13px; font-weight:bold');
    console.log('  인간성 ' + (darkRun.humanity != null ? darkRun.humanity : '-')
        + ' · 깊이 ' + (darkRun.depth || 0)
        + ' · 성공 ' + (darkRun.success || 0) + ' / 실패 ' + (darkRun.fail || 0)
        + ' · 보정 ' + (darkRun.modifier || 0)
        + (darkRun.solo ? ' · 혼자' : '')
        + (kept ? ' · 묶음 중' : ''));
    if (b) console.log('  버튼 ' + b.querySelectorAll('button').length
        + '개 · 글자 ' + b.innerText.replace(/\s+/g, ' ').trim().length + '자');
}

// ── 결산으로 한 번에 ──────────────────────────
//
// 99 단계(result)로 바로 간다. 중간 단계를 밟지 않으므로 성공·실패·인간성은
// 지금 값 그대로 들어간다. 점수를 보고 싶으면 부르기 전에 손으로 올린다.
//     darkRun.success = 12; darkRun.fail = 1; darkRun.humanity = 55; a667.end()
//     darkRun.hiddenRoute = 'rescue';   // truth · rescue · coexist
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

    darkRun.driftIdx = null;        // 표류 중이면 빠져나온다
    darkRun.rejoined = false;       // 복귀 화면이 먼저 가로채지 않게
    darkRun.step = 99;
    darkRun._advTo = null;
    window._rdsLock = false;

    // 파티면 방에도 적는다 — 동료 화면도 watchPartyStep 을 타고 결산으로 간다.
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

    console.log('%c결산으로', 'color:#4fc3f7; font-size:13px; font-weight:bold');
    console.log('  성공 ' + (darkRun.success || 0) + ' / 실패 ' + (darkRun.fail || 0)
        + ' · 인간성 ' + (darkRun.humanity != null ? darkRun.humanity : '-')
        + ' · 깊이 ' + (darkRun.depth || 0)
        + ' · 보정 ' + (darkRun.modifier || 0)
        + (darkRun.hiddenRoute ? ' · 숨은 길 ' + darkRun.hiddenRoute : ''));

    try { renderDarkStep(); } catch (e) { console.error('결산에서 터졌습니다:', e); return; }

    const b = body();
    if (b) console.log('  버튼 ' + b.querySelectorAll('button').length
        + '개 · 글자 ' + b.innerText.replace(/\s+/g, ' ').trim().length + '자');
    if (kept) console.log('  ※ 아직 묶여 있습니다. a667.free() 로 푸십시오.');
}

// ── 전부 한 번씩 그려 보기 ────────────────────
function scan() {
    if (!ready()) return;
    const S = steps(), b = body();
    if (!b) { console.warn('탐사 화면이 열려 있지 않습니다.'); return; }

    const back = darkRun.step;
    const wasHeld = !!kept;
    if (!wasHeld) hold();

    const rows = [];
    keys().forEach(function (n) {
        if (n === 99) return;                     // 결과 화면은 탐사를 끝낸다
        darkRun.step = n;
        darkRun._advTo = null;
        darkRun.driftIdx = null;
        b.innerHTML = '';
        let err = '';
        // renderDarkStep 은 120ms 동안 다시 그리지 않는다. 한 바퀴를 한 번에
        // 돌려면 그 자물쇠를 매번 비켜 줘야 한다. 안 비키면 전부 「안 그려짐」이 된다.
        window._rdsLock = false;
        try { renderDarkStep(); } catch (e) { err = (e && e.message) || String(e); }
        const txt = b.innerText.replace(/\s+/g, ' ').trim();
        const btn = b.querySelectorAll('button').length;
        rows.push({
            단계: n, 종류: label(n),
            글자: txt.length, 버튼: btn,
            결과: err ? '✗ ' + err : (!txt ? '✗ 아무것도 안 그려짐' : (btn ? '○' : '△ 넘어갈 버튼 없음'))
        });
    });

    darkRun.step = back;
    darkRun._advTo = null;
    window._rdsLock = false;
    try { renderDarkStep(); } catch (e) { }
    if (!wasHeld) free();

    console.log('%c===== A-667 단계 점검 =====', 'color:#4fc3f7; font-size:13px');
    console.table(rows);
    const bad = rows.filter(function (r) { return r.결과.charAt(0) !== '○'; });
    if (!bad.length) console.log('%c전부 그려집니다.', 'color:#4CAF50');
    else {
        console.log('%c' + bad.length + '곳이 걸립니다 — ' + bad.map(function (r) { return r.단계; }).join(', '),
            'color:#ff6b6b; font-weight:bold');
        bad.forEach(function (r) { console.log('  ' + r.단계 + ' (' + r.종류 + ') — ' + r.결과); });
    }
    console.log('  ※ 합류·갈림은 혼자 돌리면 상대 선택이 없어 다르게 보일 수 있습니다.');
}

// ── 내보내기 ──────────────────────────────────
window.a667 = function () { show(); };
window.a667.go    = go;
window.a667.next  = next;
window.a667.prev  = prev;
window.a667.end   = end;
window.a667.hold  = hold;
window.a667.free  = free;
window.a667.scan  = scan;
window.a667.list  = function () {
    const S = steps();
    if (!S) { console.warn('A667_STEPS 를 찾지 못했습니다.'); return; }
    console.table(keys().map(function (n) {
        return { 단계: n, 종류: label(n), 지금: (typeof darkRun !== 'undefined' && darkRun && darkRun.step === n) ? '◀' : '' };
    }));
};

console.log('%cA-667 점검 콘솔 준비됨', 'color:#4fc3f7; font-size:13px; font-weight:bold');
console.log('  a667()  a667.next()  a667.prev()  a667.go(n)  a667.list()');
console.log('  a667.end()  — 결산으로 한 번에 (파티원도 같이)');
console.log('  a667.hold()  a667.free()  a667.scan()');

})();
