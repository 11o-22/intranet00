// ==========================================
// ★ 어둠 탐사 — 선택지를 눌러도 안 넘어가던 것 (둘째 겹)
// bundles.json 마지막 묶음, dark-tap.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 먼저 고친 것 — dark-tap.js
//
//   renderDarkStep 앞의 120ms 자물쇠가 못 그린 한 번을 **버리던** 것.
//   버리지 않고 미뤄 두도록 고쳤다. 그런데도 그대로라고 하신다.
//   같은 증상에 겹이 하나 더 있었다.
//
// ■ 남아 있던 겹 — 눌러 놓은 「준비 중」이 지워진다
//
//   파티에서 선택지를 누르면 곧바로 넘어가지 않는다. partyAdvance 는
//   이렇게 한다. (index.html:2807)
//
//       if (darkRun._advTo === nextStep) return;      ← 같은 곳으로 또 누르면 그냥 돌아선다
//       darkRun._advTo = nextStep;
//       ready{N}/{내 사번} 에 적는다
//       renderAdvanceWait(nextStep)                   ← 단추를 잠그고 「준비 중...」
//
//   renderAdvanceWait 는 **지금 그려져 있는 단추를 손봐서** 잠근다.
//   새로 그리는 것이 아니다. 그래서 그 사이에 renderDarkStep 이 한 번만
//   돌아도 본문이 통째로 다시 그려지고 —
//
//       · 잠가 둔 단추가 도로 눌리게 되고
//       · 「준비 중 2/4」 와 기다리는 사람 이름이 사라지고
//       · 그 칸(#adv-wait)이 없어져 셈하는 쪽이 적을 데를 잃는다
//
//   화면은 **누르기 전과 똑같아진다.** 그래서 또 누른다. 그런데 이번엔
//       if (darkRun._advTo === nextStep) return;
//   에 걸려 **아무 일도 일어나지 않는다.** 세 번, 네 번을 눌러도 같다.
//   결국 남들이 다 준비해서 저절로 넘어갈 때까지 헛손질을 한다.
//
//   renderDarkStep 을 부르는 자리는 일흔두 군데다. 파티원이 하나씩
//   준비를 적을 때마다, 물건을 쓸 때마다, 투표가 열릴 때마다 돈다.
//   사람이 많을수록 잦다 — 「파티에서 더 심하다」가 이것이다.
//
// ■ 무엇을 했나
//
//   1. 다시 그린 **뒤에 「준비 중」을 되살린다.** 몇 명이 준비했는지,
//      누구를 기다리는지까지 그대로 올린다 (index.html 의 check() 가
//      window._advWait 에 적어 둔다).
//   2. 같은 곳으로 또 눌러도 그냥 돌아서지 않는다. 표시를 다시 올려
//      **누른 것이 먹었다는 것을 보여 준다.**
//   3. 셈하는 쪽이 멎었으면(10초 넘게 안 적힘) 단추를 도로 풀어 준다.
//      잠긴 채 굳는 일이 없게.
//
// ■ 콘솔
//   darkWaitState()   지금 무엇을 기다리는지 · 되살린 횟수

(function darkWait() {

const FRESH = 10000;        // 셈이 이보다 묵었으면 기다리기가 멎은 것으로 본다
let restored = 0;

function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function body() {
    try { return (typeof darkBodyEl === 'function') ? darkBodyEl() : null; } catch (e) { return null; }
}

// ★ 끝난 화면에는 손대지 않는다
//
//   되살리기는 **지금 그려져 있는 단추를 손봐서** 한다. 그런데 쓰러짐·
//   정산 화면에도 단추가 하나 서 있다 (「숨을 고른다」 · 「퇴근한다」 ·
//   「단말로 복귀한다」). 끝난 뒤에도 되살리기가 돌면 그 단추의 글씨가
//   「3 / 3명 준비」로 바뀌고 잠긴다. **나갈 수가 없어진다.**
//
//   내가 죽어도 남은 사람들은 계속 준비를 적는다. 그래서 셈이 묵지 않고
//   계속 새것이라, 「멎었으면 풀어 준다」는 지켜보기에도 안 걸린다.
//   그대로 굳는다. (A-214 에서 쓰러진 뒤 멈추던 것이 이것이다)
//
//   그래서 끝났는지를 두 겹으로 본다 —
//     · darkRun 의 표 (_dead · _settled · kleeOut · step 99) 와 epic 의 er
//     · 화면에 「나가는 단추」가 서 있는지 (어느 파일이 그렸든 걸린다)
const EXIT_SEL = 'button[onclick*="finishDarkDeath"],button[onclick*="epicFinish"],'
    + 'button[onclick*="closeDarkOverlay"],button[onclick*="renderDarkness"]';
function over() {
    const r = run();
    if (!r) return true;
    if (r._dead || r._settled || r.kleeOut || (r.step || 0) >= 99) return true;
    try { if (typeof er !== 'undefined' && er && (er.dead || er._settled)) return true; } catch (e) { }
    try {
        const b = body();
        if (b && b.querySelector(EXIT_SEL)) return true;
    } catch (e) { }
    return false;
}

// 기다리는 중인가 — 셈이 살아 있을 때만 그렇다고 본다
function waiting() {
    const r = run();
    if (!r || !r.isParty) return null;
    if (over()) return null;
    if (r._advTo == null) return null;
    if (r.step >= r._advTo) return null;
    const w = window._advWait;
    if (!w || w.step !== r._advTo) {
        // 막 눌렀을 때는 아직 셈이 없다 — 그래도 기다리는 중이다
        return { step: r._advTo, cnt: null, need: null, names: [] };
    }
    if (Date.now() - (w.at || 0) > FRESH) return null;      // 멎었다 — 단추를 풀어 준다
    return w;
}

// 「준비 중」을 다시 올린다
function paint() {
    if (over()) return;             // 쓰러짐·정산 화면에는 절대 손대지 않는다
    const w = waiting();
    const b = body();
    if (!b) return;
    if (!w) return;

    const btns = b.querySelectorAll('.game-btn');
    if (!btns.length) return;

    let touched = false;
    for (let i = 0; i < btns.length; i++) {
        if (!btns[i].disabled) { btns[i].disabled = true; touched = true; }
    }

    const last = btns[btns.length - 1];
    let el = document.getElementById('adv-wait');
    if (!el) {
        last.innerHTML = '<span id="adv-wait">준비 중...</span>';
        el = document.getElementById('adv-wait');
        touched = true;
    }
    // 셈이 아직 안 왔으면 적혀 있던 숫자를 그대로 둔다 —
    // 「2 / 4명 준비」를 「준비 중...」으로 되돌리면 뒷걸음질로 보인다
    if (el && w.cnt != null) {
        const text = w.cnt + ' / ' + w.need + '명 준비';
        if (el.innerText !== text) el.innerText = text;
    }

    let wl = document.getElementById('adv-wait-list');
    if (!wl) {
        b.insertAdjacentHTML('beforeend',
            '<div id="adv-wait-list" style="font-size:10px; color:#888; text-align:center;'
            + ' margin-top:6px; line-height:1.6;"></div>');
        wl = document.getElementById('adv-wait-list');
        touched = true;
    }
    const names = (w.names && w.names.length) ? ('기다리는 중 — ' + w.names.join(', ')) : '';
    if (wl && wl.innerText !== names) wl.innerText = names;

    if (touched) restored++;
}

// ==========================================
// 1. 다시 그린 뒤에 되살린다
// ==========================================
(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderDarkStep !== 'function') return;
        if (renderDarkStep._wait) { clearInterval(iv); return; }
        const _r = renderDarkStep;
        const w = function () {
            const out = _r.apply(this, arguments);
            // 그린 직후에 한 번, 늦게 끼어드는 그림을 위해 한 번 더
            try { paint(); } catch (e) { }
            setTimeout(function () { try { paint(); } catch (e) { } }, 60);
            return out;
        };
        w._wait = true;
        // 앞서 감싼 이들의 표를 그대로 들고 간다 — 안 그러면 같은 자리를
        // 또 감싸려 드는 파일이 생기고, 확인 함수도 「안 붙었다」고 적는다
        ['_tap', '_rds', '_epic'].forEach(function (k) { if (_r[k]) w[k] = _r[k]; });
        renderDarkStep = w;
        window.renderDarkStep = w;
        clearInterval(iv);
        console.log('[어둠] 「준비 중」 되살리기 연결');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 2. 같은 곳으로 또 눌러도 그냥 돌아서지 않는다
// ==========================================
(function hookAdvance() {
    const iv = setInterval(function () {
        if (typeof partyAdvance !== 'function') return;
        if (partyAdvance._wait) { clearInterval(iv); return; }
        const _p = partyAdvance;
        const w = function (nextStep) {
            const r = run();
            // 이미 그 곳으로 눌러 둔 상태 — 원래는 말없이 돌아섰다.
            // 표시를 다시 올려 「눌린 것이 맞다」를 보여 준다.
            if (r && r.isParty && r._advTo === nextStep && r.step < nextStep) {
                try { paint(); } catch (e) { }
                return;
            }
            const out = _p.apply(this, arguments);
            try { paint(); } catch (e) { }
            return out;
        };
        w._wait = true;
        Object.keys(_p).forEach(function (k) { if (!(k in w)) { try { w[k] = _p[k]; } catch (e) { } } });
        partyAdvance = w;
        window.partyAdvance = w;
        clearInterval(iv);
        console.log('[어둠] 두 번째 누름에도 표시를 올립니다');
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 3. 지켜보기 — 잠긴 채 굳지 않게
// ==========================================
//
//   셈이 멎었는데 단추만 잠겨 있으면 아무것도 못 한다. 그럴 때는
//   _advTo 를 놓아 주고 단추를 푼다. (제 시계로만 센다)
setInterval(function () {
    const r = run();
    if (!r) return;
    try {
        // 끝났으면 적어 둔 것만 거둔다 — 화면은 손대지 않는다.
        // (여기서 renderDarkStep 을 부르면 쓰러짐 화면이 통째로 날아간다)
        if (over()) {
            if (r._advTo != null) r._advTo = null;
            if (window._advWait) window._advWait = null;
            const w0 = document.getElementById('adv-wait-list');
            if (w0) w0.remove();
            return;
        }
        if (waiting()) { paint(); return; }
        if (r._advTo == null) return;
        const w = window._advWait;
        const dead = (r.step >= r._advTo) || !w || w.step !== r._advTo
            || (Date.now() - (w.at || 0) > FRESH);
        if (!dead) return;
        r._advTo = null;
        window._advWait = null;
        const b = body();
        if (!b) return;
        // 멎은 표시를 치우고 단추를 푼다 — 잠긴 채 굳는 일이 없게
        const wl = document.getElementById('adv-wait-list');
        if (wl) wl.remove();
        let freed = 0;
        b.querySelectorAll('.game-btn').forEach(function (x) { if (x.disabled) { x.disabled = false; freed++; } });
        if (freed || document.getElementById('adv-wait')) {
            if (typeof renderDarkStep === 'function') renderDarkStep();
        }
    } catch (e) { }
}, 1200);

window.darkWaitState = function () {
    const r = run();
    console.log('%c===== 어둠 — 넘어가기 =====', 'color:#9fd8ef; font-size:13px');
    if (!r) { console.log('  탐사 중이 아닙니다.'); return; }
    console.log('  지금 걸음    :', r.step, '· 누른 곳:', r._advTo == null ? '없음' : r._advTo);
    const w = window._advWait;
    console.log('  셈           :', w ? (w.cnt + '/' + w.need + '명 · ' + Math.round((Date.now() - w.at) / 1000) + '초 전')
        : '없음');
    console.log('  기다리는 사람:', (w && w.names && w.names.length) ? w.names.join(', ') : '없음');
    console.log('  되살린 횟수  :', restored + '번 (다시 그려져 지워졌던 표시)');
    console.log('  끝난 화면인가:', over() ? 'O — 손대지 않습니다' : '아니오');
    console.log('  연결         :',
        (typeof renderDarkStep === 'function' && renderDarkStep._wait ? '그리기 O' : '그리기 ✗'),
        (typeof partyAdvance === 'function' && partyAdvance._wait ? '· 누름 O' : '· 누름 ✗'));
};

console.log('[어둠] darkWaitState()');

})();
