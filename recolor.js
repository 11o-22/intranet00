// ==========================================
// 🎨 옷·악세 색 갈아 끼우기
// bundles.json 에서 closet.js **앞**에 불러온다
// ==========================================
//
// ■ 어떻게 바꾸나
//
//   **그늘은 그대로 두고 색만** 갈아 끼운다. 그늘과 테두리가 살아 있어야
//   도트가 안 뭉갠다. 흰 옷·검은 옷처럼 색이 없는 그림도 물들어야 하므로,
//   색끼가 없는 칸에는 적당한 채도(SAT)를 넣어 준다.
//
//   ✗ CSS 의 hue-rotate 로는 안 된다. 그것은 **이미 든 색을 돌리는** 것이라
//     채도가 0이면 돌릴 것이 없다. 드레스(16색 전부 회색) · 하얀 망토 ·
//     잠옷처럼 흑백으로 그려진 옷에는 아무 일도 안 일어난다.
//
// ■ 밝기 자리 옮기기 — 흰 옷도 물들게
//
//   ✗ 밝기를 글자 그대로 두면 **하얀 옷은 안 물든다**. 망토는 밝기가
//     0.83~0.93 뿐이라, 보라를 넣어도 허옇다. 아주 어두운 옷(몽상 정장
//     0.04~0.17)도 무슨 색이든 까맣게만 보인다.
//
//   그래서 물들일 칸들의 밝기 폭을 재서, 색이 보이는 자리로 통째로
//   옮긴다. 폭(그늘 차이)은 그대로 들고 간다.
//
//       위는 HI_CAP 보다 밝지 않게, HI_MIN 보다 어둡지 않게
//       폭이 MIN_SPAN 보다 좁으면 그만큼 벌린다 (망토처럼 밋밋한 것)
//
//   이미 알맞은 자리에 있는 옷(드레스 0.14~0.40 · 브라운 0.14~0.41)은
//   건드리지 않는다 — 셈이 그대로 제자리를 내놓는다.
//
// ■ 안 바꾸는 자리 — 「겉에만」
//
//   정장 안에 받쳐 입은 **하얀 셔츠**까지 물들면 안 된다. 장마다 무엇을
//   남길지 KEEP 에 적어 둔다. 실제로 색을 세어 보고 갈랐다.
//
//       'light'  밝은 칸은 그대로 — 턱시도(겉 0.11~0.28 · 셔츠 0.83/0.93)
//       'grey'   색끼 없는 칸은 그대로 — 브라운 정장(겉 색끼 0.11~0.23 ·
//                셔츠 0.00) · 노란 정장(겉 0.10~0.11 · 셔츠 0.03~0.04)
//       (없음)   통째로 물든다 — 드레스 · 하얀 망토 · 악세
//
//   ★ 한 가지 잣대로는 안 된다. 턱시도는 겉도 셔츠도 **둘 다 색끼 0** 이라
//     색끼로는 못 가르고(밝기로 가른다), 브라운 정장은 셔츠 그늘이
//     밝기 0.33 까지 내려가 밝기로는 못 가른다(색끼로 가른다).
//
//   ★ 「채도」가 아니라 **색끼(max-min)** 로 잰다. HLS 채도는 밝으면
//     부풀어서, 거의 흰 망토 칸(244,236,230)이 채도 0.39 로 나온다.
//     색끼로 재면 0.055 — 제대로 「색 없음」이다.
//
// ■ 값
//
//       dotTint(장이름, 색)        쟁여 둔 그림 주소. 아직 없으면 null 을
//                                  주고 뒤에서 만든다 (다 되면 알려 준다)
//       dotTintOn(알림)            한 장 다 될 때마다 부른다
//       u.dot.col = { dress: 210 } 장 이름마다 색(0~359). 광장이 dot 을
//                                  통째로 주고받으므로 남의 화면에도 간다
//
//   한 장 칠하는 데 70ms 쯤 걸린다(2112x768 · 재 봄). 한 번 만들어 쟁여 두고,
//   LRU 로 MAX 장까지만 들고 있는다.
//
// ■ 콘솔
//       dotTintState()   쟁여 둔 것 · 몇 번 썼나

(function recolor() {

const DIR = 'dot/';
const MAX = 28;              // 쟁여 둘 장 수
const SAT = 0.45;            // 색끼 없던 칸에 넣어 줄 채도
const LIGHT = 0.70;          // 'light' — 이보다 밝으면 그대로 둔다
const FLAT = 0.06;           // 색끼(max-min) 가 이 밑이면 「색 없음」

const HI_CAP = 0.74;         // 물든 칸 중 가장 밝은 것을 여기까지 내린다
const HI_MIN = 0.34;         // 너무 캄캄하면 여기까지 올린다
const MIN_SPAN = 0.26;       // 그늘 차이가 이보다 좁으면 벌린다
const LO_CAP = 0.06;         // 가장 어두운 칸은 여기보다 안 내린다

// 장마다 안 바꿀 자리 (위 머리말 참고)
const KEEP = {
    'tuxedo': 'light',       // 안에 받쳐 입은 하얀 셔츠
    'dream-suit': 'light',
    'robe': 'light',         // 검은 장포 — 안감이 희다
    'han-inner': 'light',
    'brown-suit': 'grey',    // 셔츠와 그 그늘이 색끼가 없다
    'agent1': 'grey',
    'agent2': 'grey',
    'suit': 'grey'           // 노란 정장 — 색끼 없는 자리만 남긴다
};

const cache = new Map();     // '장@색' → 그림 주소
const busy = {};             // 만드는 중
const hands = [];            // 다 됐을 때 알릴 곳
let made = 0, hit = 0, miss = 0;

function key(sheet, hue) { return sheet + '@' + hue; }

function rgb2hls(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    if (mx === mn) return [0, l, 0];
    const d = mx - mn;
    const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h;
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h, l, s];
}
function hls2rgb(h, l, s) {
    if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = function (t) {
        t = (t + 1) % 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}

function paint(img, sheet, hue) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    let d;
    // 같은 자리에서 받은 그림이라 막힐 일이 없지만, 막히면 원래 것을 쓴다
    try { d = x.getImageData(0, 0, c.width, c.height); }
    catch (e) { console.warn('[색] 캔버스가 막혔습니다 —', sheet, e && e.message); return null; }

    const keep = KEEP[sheet] || '';
    const H = ((Number(hue) % 360) + 360) % 360 / 360;
    const a = d.data;

    // ① 먼저 「물들 칸」만 골라 밝기를 세어 둔다.
    //    여기서는 HLS 를 다 돌리지 않는다 — max·min 만으로 충분하고 훨씬 싸다.
    const BINS = 101;
    const tally = new Int32Array(BINS);
    let n = 0;
    for (let i = 0; i < a.length; i += 4) {
        if (!a[i + 3]) continue;
        const r = a[i], g = a[i + 1], b = a[i + 2];
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        const l = (mx + mn) / 510;
        if (keep === 'light' && l >= LIGHT) continue;
        if (keep === 'grey' && (mx - mn) / 255 <= FLAT) continue;
        tally[Math.round(l * 100)]++; n++;
    }
    if (!n) return c.toDataURL('image/png');     // 남길 것뿐이면 그대로

    // ② 2% ~ 98% 자리를 폭으로 삼는다 (한두 칸 튀는 것에 안 끌려가게)
    let lo = 0, hi = 1, run = 0;
    const want = n * 0.02;
    for (let i = 0; i < BINS; i++) { run += tally[i]; if (run >= want) { lo = i / 100; break; } }
    run = 0;
    for (let i = BINS - 1; i >= 0; i--) { run += tally[i]; if (run >= want) { hi = i / 100; break; } }
    if (hi < lo) hi = lo;

    // ③ 색이 보이는 자리로 옮긴다
    const hi2 = Math.min(HI_CAP, Math.max(HI_MIN, hi));
    const lo2 = Math.max(LO_CAP, hi2 - Math.max(hi - lo, MIN_SPAN));
    const span = hi - lo;
    const k = span > 0.001 ? (hi2 - lo2) / span : 0;
    const mid = (lo2 + hi2) / 2;

    // ④ 칠한다
    for (let i = 0; i < a.length; i += 4) {
        if (!a[i + 3]) continue;
        const hls = rgb2hls(a[i], a[i + 1], a[i + 2]);
        const r = a[i], g = a[i + 1], b = a[i + 2];
        const mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        const mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        const ch = (mx - mn) / 255;
        if (keep === 'light' && hls[1] >= LIGHT) continue;
        if (keep === 'grey' && ch <= FLAT) continue;
        let L = k ? lo2 + (hls[1] - lo) * k : mid;
        if (L < 0) L = 0; else if (L > 1) L = 1;
        const out = hls2rgb(H, L, ch > FLAT ? hls[2] : SAT);
        a[i] = out[0]; a[i + 1] = out[1]; a[i + 2] = out[2];
    }
    x.putImageData(d, 0, 0);
    return c.toDataURL('image/png');
}

function put(k, url) {
    cache.set(k, url);
    while (cache.size > MAX) cache.delete(cache.keys().next().value);   // 가장 오래된 것부터
}

function make(sheet, hue) {
    const k = key(sheet, hue);
    if (busy[k]) return;
    busy[k] = 1;
    const img = new Image();
    img.onload = function () {
        let url = null;
        try { url = paint(img, sheet, hue); } catch (e) { console.warn('[색]', sheet, e); }
        delete busy[k];
        if (!url) return;
        put(k, url); made++;
        hands.slice().forEach(function (f) { try { f(sheet, hue, url); } catch (e) { } });
    };
    img.onerror = function () { delete busy[k]; console.warn('[색] 그림을 못 받았습니다 — ' + sheet); };
    img.src = DIR + sheet + '.png';
}

// ★ 쟁여 둔 것이 있으면 바로 주고, 없으면 null 을 주고 뒤에서 만든다.
//   그리는 쪽은 null 이면 원래 그림을 깔아 두었다가, 알림이 오면 갈아 끼운다.
window.dotTint = function (sheet, hue) {
    if (!sheet || hue == null || hue === '') return null;
    const h = ((Math.round(Number(hue)) % 360) + 360) % 360;
    if (!isFinite(h)) return null;
    const k = key(sheet, h);
    if (cache.has(k)) { hit++; return cache.get(k); }
    miss++; make(sheet, h);
    return null;
};
window.dotTintOn = function (fn) { if (typeof fn === 'function') hands.push(fn); };
window.dotTintKeep = function (sheet) { return KEEP[sheet] || ''; };

window.dotTintState = function () {
    console.log('%c===== 색 갈아 끼우기 =====', 'color:#d9a05a; font-size:13px');
    console.log('  쟁여 둔 장 :', cache.size + ' / ' + MAX, '· 만든 수', made,
        '· 바로 쓴 수', hit, '· 새로 만든 수', miss);
    console.log('  안 바꾸는 자리:', Object.keys(KEEP).map(function (k) {
        return k + '(' + KEEP[k] + ')';
    }).join(' · '));
    console.log('  지금 내 색 :', JSON.stringify(((typeof currentUser !== 'undefined'
        && currentUser && currentUser.dot) || {}).col || {}));
};

console.log('[색] 옷·악세 색 갈아 끼우기 — dotTintState()');

})();
