// ==========================================
// ★ 소지품·상점이 몇 초마다 깜박이던 것
// bundles.json 마지막 묶음 — 되도록 맨 끝 (다른 묶음이 다 감싼 뒤에 감싼다)
// ==========================================
//
// ■ 왜 깜박이나
//
//   updateUI() 안에서 이것들이 전부 돈다. (index.html:5958)
//
//       checkVIPStatus(); renderInventory(); renderHistory(); renderLetters();
//       renderLetterTargetSelect(); renderRegularShop(); renderP2PSelectBoxes();
//       renderP2PLists(); renderAlienShop(); renderQShop(); renderPointRanking();
//
//   그리고 updateUI 는
//
//       · 내 자리가 서버에서 바뀔 때마다   (applyMine,   index.html:1374)
//       · 남이 바뀌면 3초에 한 번 몰아서    (touchOthers, index.html:1362)
//
//   돈다. 사람이 여럿 붙어 있는 시간에는 사실상 3초마다 한 번이다.
//   **남이 무엇을 하든 내 소지품 칸이 3초마다 통째로 다시 그려진다.**
//
//       container.innerHTML = html;        (index.html:6249~)
//
//   글자가 한 자도 안 바뀌었어도 줄이 전부 버려지고 새로 생긴다.
//   버려지면 거기 붙어 있던 테두리 영상(frames-video*)의 캔버스도 같이
//   사라지고, 다시 붙이는 시계는 1.2초에 한 번이다. 그 사이가 깜박임이다.
//   스크롤 자리도 튀고, 누르고 있던 모양도 풀린다.
//
//   기록 칸은 norepaint.js 가 이미 막아 두었다. 소지품과 상점이 남아 있었다.
//
// ■ 어떻게 고치나
//
//   ① updateUI 가 부른 것인지 아닌지를 가린다.
//
//      손으로 누른 것(물건 쓰기·분류 바꾸기·칸 열기)은 **언제나** 그린다.
//      시계가 부른 것만 따진다.
//
//   ② 시계가 불렀을 때는, 내 기록이 지난번과 한 글자도 다르지 않으면
//      **그리는 함수 자체를 부르지 않는다.**
//
//      innerHTML 한 줄만 막지 않고 통째로 건너뛰는 까닭이 있다.
//      소지품 칸은 열 군데 넘는 묶음이 「다 그려진 뒤에」 덧붙이는 식으로
//      꾸민다 (칭호·표식·접기·테두리·분류…). 속만 막고 바깥을 돌리면
//      그 덧붙이는 것들이 같은 자리에 두 번 붙는다. 통째로 건너뛰면
//      지난번에 꾸며 놓은 것이 그대로 남는다.
//
//   그래서 이 파일은 **맨 바깥**에서 감싼다. 다른 묶음이 나중에 또
//   감싸면 그 위를 다시 감싼다 (20초 동안 지켜본다).
//
// ■ 무엇을 「바뀌었다」로 보나
//
//   currentUser 전체 (기록 history 는 뺀다 — 그 칸은 norepaint.js 몫이고
//   양도 크다) + 오늘 날짜 + 판매소 주기 + 사원 수.
//   남의 이름 같은 먼 것은 안 본다 — 칸을 다시 열면 그 자리에서 그린다.
//
// ■ 콘솔
//   repaintState()   칸마다 몇 번 건너뛰고 몇 번 그렸나

(function noRepaint2() {

// 그릴 함수와 그 칸
//
//   밀실 거래(p2p)는 뺀다 — 남이 보낸 제안이 바로 떠야 한다.
//   순위표도 뺀다 — 남의 포인트로 바뀐다.
const TARGETS = [
    ['renderInventory',   'inventory-list-container'],      // 소지품
    ['renderRegularShop', 'regular-shop-items-container'],  // 유쾌 판매소
    ['renderAlienShop',   'alien-items-container'],         // 우주 쇼핑몰
    // ??? 는 「진열이 몇 시간 몇 분 뒤에 바뀝니다」를 적어 둔다 —
    // 분이 바뀌면 다시 그려야 하므로 지문에 분을 보탠다 (1분에 한 번)
    ['renderQShop',       'qshop-body',
        function () { return Math.floor(Date.now() / 60000); }],
    ['renderFood',        'food-body'],                     // 행복 식당
    ['renderLetters',     'received-letters-container']     // 익명 편지
];

const SKIP = { history: 1, _adminStamp: 1 };

let inUpdate = 0;
const marks = {};        // { 함수이름: { skip, paint } }

// ==========================================
// 내 기록의 지문
// ==========================================
let cached;              // updateUI 한 바퀴 동안은 한 번만 잰다

function sigOf() {
    if (inUpdate && cached !== undefined) return cached;
    const v = measure();
    if (inUpdate) cached = v;
    return v;
}
function measure() {
    const u = (typeof currentUser !== 'undefined') ? currentUser : null;
    if (!u) return null;
    try {
        const ks = Object.keys(u).sort();
        let s = '';
        for (let i = 0; i < ks.length; i++) {
            const k = ks[i];
            if (SKIP[k]) continue;
            const v = u[k];
            s += k + '\u0001'
               + ((v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v))
               + '\u0002';
        }
        if (typeof getTodayStr === 'function') s += '|' + getTodayStr();
        if (typeof get22HourCycleStr === 'function') s += '|' + get22HourCycleStr();
        if (typeof db !== 'undefined' && db && db.users) s += '|' + Object.keys(db.users).length;
        return s;
    } catch (e) { return null; }      // 잴 수 없으면 늘 그린다
}

// ==========================================
// updateUI 가 부른 것인지 표시해 둔다
// ==========================================
(function hookUpdate() {
    const iv = setInterval(function () {
        if (typeof updateUI !== 'function') return;
        if (updateUI._np2) { clearInterval(iv); return; }
        const _u = updateUI;
        const w = function () {
            if (inUpdate === 0) cached = undefined;      // 바퀴마다 새로 잰다
            inUpdate++;
            try { return _u.apply(this, arguments); }
            finally { inUpdate--; if (inUpdate === 0) cached = undefined; }
        };
        w._np2 = true;
        updateUI = w;
        window.updateUI = w;
        clearInterval(iv);
        console.log('[깜박임] updateUI 표시 연결');
    }, 200);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 그리는 함수를 맨 바깥에서 감싼다
// ==========================================
const mine = {};         // 내가 지난번에 끼운 겹 — 바깥이 새로 생기면 꺼 둔다

function hush(name, boxId, extra) {
    const _f = window[name];
    if (typeof _f !== 'function') return false;
    if (_f._np2) return true;

    // 다른 묶음이 내 위를 감쌌다면, 안쪽에 남은 내 겹은 그냥 통과시킨다
    if (mine[name]) mine[name]._off = true;

    const m = marks[name] || (marks[name] = { skip: 0, paint: 0, box: boxId });
    let sig = null;

    const w = function () {
        if (w._off) return _f.apply(this, arguments);    // 바깥에 새 겹이 생겼다
        if (inUpdate) {
            const box = document.getElementById(boxId);
            let now = sigOf();
            if (now !== null && extra) { try { now += '|' + extra(); } catch (e) { } }
            if (now !== null && sig !== null && now === sig && box && box.childNodes.length) {
                m.skip++;
                return;                     // 바뀐 것이 없다 — 손대지 않는다
            }
            const r = _f.apply(this, arguments);
            m.paint++;
            sig = now;
            return r;
        }
        // 손으로 부른 것 — 늘 그린다
        const r = _f.apply(this, arguments);
        m.paint++;
        sig = sigOf();
        if (sig !== null && extra) { try { sig += '|' + extra(); } catch (e2) { } }
        return r;
    };
    w._np2 = true;
    w._off = false;
    w._inner = _f;
    window[name] = w;
    mine[name] = w;
    return true;
}

// 다른 묶음이 나중에 또 감쌀 수 있다 — 그 위를 다시 감싼다
let tries = 0;
const iv = setInterval(function () {
    tries++;
    TARGETS.forEach(function (t) { hush(t[0], t[1], t[2]); });
    if (tries >= 40) {
        clearInterval(iv);
        console.log('[깜박임] ' + TARGETS.filter(function (t) {
            return typeof window[t[0]] === 'function' && window[t[0]]._np2;
        }).length + ' / ' + TARGETS.length + '곳 연결');
    }
}, 500);

// ==========================================
// 확인
// ==========================================
window.repaintState = function () {
    console.log('%c===== 다시 그리기 =====', 'color:#9fd0ff; font-size:13px');
    console.table(TARGETS.map(function (t) {
        const m = marks[t[0]];
        const f = window[t[0]];
        return { 함수: t[0], 칸: t[1],
                 감쌈: (typeof f === 'function' && f._np2) ? 'O' : '✗',
                 건너뜀: m ? m.skip : 0, 그림: m ? m.paint : 0 };
    }));
    const s = Object.keys(marks).reduce(function (a, k) { return a + marks[k].skip; }, 0);
    const p = Object.keys(marks).reduce(function (a, k) { return a + marks[k].paint; }, 0);
    console.log('  통틀어 ' + s + '번 건너뛰고 ' + p + '번 그렸습니다.');
    console.log('  지문 길이:', (sigOf() || '').length + '자');
};

console.log('[깜박임] repaintState()');

})();
