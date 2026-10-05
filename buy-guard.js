// ==========================================
// ★ 구매가 말없이 삼켜지는 것 — buyGuard 의 0.7초
// bundles.json 마지막 그룹, save-merge.js 앞
// ==========================================
//
// ■ 무엇이 일어나고 있었나
//
//   유쾌 판매소에서 세 번 눌렀는데 두 개만 들어옵니다.
//
//   까닭은 소지품도 저장도 아니고, 누름을 막는 자물쇠였습니다.
//
//       index.html:7679
//       let _buyLock = false;
//       function buyGuard() {
//           if (_buyLock) return false;          ← 아무 말도 하지 않는다
//           _buyLock = true;
//           setTimeout(() => { _buyLock = false; }, 700);
//           return true;
//       }
//
//   0.7초 안에 두 번째로 누르면 그 누름은 **아무 일도 없이 사라집니다.**
//   알림도, 기록도, 소리도 없습니다. 그래서 「샀는데 안 들어왔다」로 보입니다.
//
//   재 보았습니다. 세 번 누를 때 들어오는 개수입니다.
//
//       누름 간격   100ms   300ms   500ms   700ms   900ms
//       들어온 것     1개     1개     2개     3개     3개
//       알림          없음    없음    없음      —       —
//
//   0.5초 간격으로 누르면 딱 두 개입니다. 사람이 연달아 살 때의 속도입니다.
//   (포인트는 빠지지 않았으니 돈을 잃지는 않았습니다. 다만 말이 없었습니다.)
//
// ■ 어떻게 고치나
//
//   자물쇠는 둡니다. 한 번 누른 것이 두 번 처리되는 것은 막아야 합니다.
//   다만 두 가지를 고칩니다.
//
//   ① 사고로 두 번 눌린 것과, 또 사려고 누른 것을 가른다
//
//        0.3초 안        — 손이 떨렸거나 두 번 눌렸다고 보고 막는다
//        0.3초 ~ 0.7초   — 또 사려고 누른 것이다. 통과시킨다
//
//      사는 자리에만 짧은 창을 씁니다. 나머지(어둠 진입·은행 같은 것)는
//      0.7초를 그대로 둡니다.
//
//   ② 막혔으면 말을 한다
//
//      어디서 막혔든 화면 위에 짧게 띄웁니다. 말없이 사라지는 일이 없습니다.
//
// ■ 확인
//
//   guardState()   창 길이와 막힌 횟수
//   guardLog()     무엇이 언제 막혔는지

(function buyGuardFix() {

const LONG = 700;      // 원래 창 — 사는 자리가 아닌 곳
const SHOP = 300;      // 사는 자리 — 두 번 눌림만 막는다
const TOAST = 1600;    // 알림이 머무는 시간

let lastAt = 0;
let nextWin = null;        // 이번 한 번만 쓸 창
let blocks = 0;
const log = [];

// 짧은 창을 쓰는 자리 — 사람이 연달아 누르는 것이 당연한 곳
const SHORT_WIN = [
    'buyRegularShopItem',   // 유쾌 판매소
    'buyAlienItem',         // 우주 쇼핑몰
    'buyFrameBook',         // 테두리 견본첩
    'useInventoryItem',     // 소지품 쓰기 (견본첩 개봉도 이 길이다)
    'confirmItemTarget',    // 남에게 물건 쓰기
    'cageBuy',              // 감금실 기구
    'buyPregItem',          // 사택 돌봄 물품
    'buyRoomTicket'         // 주말 자물쇠·찌름권
];

// ==========================================
// 화면 위 알림 — 창을 띄우지 않고 짧게 스친다
// ==========================================
function toast(msg) {
    let el = document.getElementById('buy-guard-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'buy-guard-toast';
        el.style.cssText = 'position:fixed; left:50%; bottom:86px; transform:translateX(-50%);'
            + ' background:rgba(20,16,14,0.96); border:1px solid #7a5200; color:#ffd08a;'
            + ' padding:11px 16px; border-radius:8px; font-size:12px; line-height:1.6;'
            + ' z-index:99999; max-width:84vw; text-align:center; pointer-events:none;'
            + ' box-shadow:0 6px 20px rgba(0,0,0,.5); opacity:0; transition:opacity .18s;';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.style.opacity = '0'; }, TOAST);
}

// ==========================================
// buyGuard 를 갈아끼운다
// ==========================================
function install() {
    if (typeof buyGuard !== 'function') return false;
    if (buyGuard._fix) return true;

    const wrapped = function () {
        const win = (nextWin == null) ? LONG : nextWin;
        const label = nextWin == null ? '' : (nextWin === SHOP ? '구매' : '');
        nextWin = null;

        const t = Date.now();
        const gap = t - lastAt;
        if (lastAt && gap < win) {
            blocks++;
            log.push({ 때: new Date(t).toLocaleTimeString(), 간격: gap + 'ms',
                       창: win + 'ms', 자리: label || '기타' });
            while (log.length > 60) log.shift();
            toast(win === SHOP
                ? '너무 빨리 눌렀습니다. 잠깐 뒤에 다시 눌러 주세요.'
                : '조금 전에 눌렀습니다. 잠깐 뒤에 다시 눌러 주세요.');
            return false;
        }
        lastAt = t;
        return true;
    };
    wrapped._fix = true;
    buyGuard = wrapped;
    console.log('[구매자물쇠] buyGuard 갈아끼움 — 사는 자리 ' + SHOP + 'ms · 나머지 ' + LONG + 'ms');
    return true;
}

// ==========================================
// 사는 자리에 짧은 창을 달아 준다
// ==========================================
const hooked = {};
function markShort(name) {
    if (hooked[name]) return true;
    const f = window[name];
    if (typeof f !== 'function') return false;
    if (f._shortWin) { hooked[name] = true; return true; }

    const wrapped = function () {
        nextWin = SHOP;
        try {
            return f.apply(this, arguments);
        } finally {
            nextWin = null;        // buyGuard 를 안 부르는 길로 샜을 때 새지 않게
        }
    };
    wrapped._shortWin = true;
    window[name] = wrapped;
    hooked[name] = true;
    return true;
}

// 다른 파일들이 나중에 또 감싸므로, 한참 동안 계속 바깥쪽을 잡는다
let tries = 0;
const iv = setInterval(function () {
    install();
    SHORT_WIN.forEach(function (n) {
        // 남이 다시 감쌌으면 그 바깥을 또 잡는다
        const f = window[n];
        if (typeof f === 'function' && !f._shortWin) { hooked[n] = false; markShort(n); }
    });
    if (++tries > 60) {           // 30초
        clearInterval(iv);
        const on = SHORT_WIN.filter(function (n) {
            return typeof window[n] === 'function' && window[n]._shortWin;
        });
        console.log('[구매자물쇠] 짧은 창 연결 ' + on.length + '곳: ' + on.join(', '));
    }
}, 500);

// ==========================================
// 확인
// ==========================================
window.guardState = function () {
    console.log('%c===== 구매 자물쇠 =====', 'color:#ffd08a; font-size:13px');
    console.log('  갈아끼움:', (typeof buyGuard === 'function' && buyGuard._fix) ? 'O' : '✗');
    console.log('  사는 자리 창:', SHOP + 'ms', '· 나머지:', LONG + 'ms', '(원래는 모두 700ms, 말없이 막았습니다)');
    const on = SHORT_WIN.filter(function (n) {
        return typeof window[n] === 'function' && window[n]._shortWin;
    });
    console.log('  짧은 창이 달린 곳:', on.join(', ') || '없음');
    const off = SHORT_WIN.filter(function (n) { return on.indexOf(n) < 0; });
    if (off.length) console.log('  아직 없는 것(그 기능이 없는 화면일 수 있습니다):', off.join(', '));
    console.log('  막은 횟수:', blocks + '번 — 이제는 막을 때마다 화면에 알립니다');
};
window.guardLog = function () {
    if (!log.length) { console.log('[구매자물쇠] 막은 것이 없습니다.'); return; }
    console.table(log.slice(-30));
};

console.log('[구매자물쇠] guardState() · guardLog()');

})();
