// ==========================================
// ★ 🀄 마작 패 그림 — 글자 대신 그린 패
// bundles.json 마지막 묶음, mj-ui.js 보다 **앞**
// ==========================================
//
// ■ 왜 만들었나
//
//   여태 패를 유니코드 글자(🀇🀙🀐…)로 찍었다. 글꼴에 따라
//   네모로 나오거나, 크기가 들쭉날쭉하거나, 통수와 삭수가
//   구별되지 않았다. 손안의 기기에서는 더 심했다.
//
//   그래서 서른넉 장을 **그림으로 그려** 둔다. 글꼴을 타지 않고,
//   아무리 키워도 뭉개지지 않고, 색이 그대로 나온다.
//
// ■ 어떻게 쓰나
//
//       mjTileSheet();          그림 묶음을 한 번 깔아 둔다 (저절로 깔린다)
//       mjTileHTML(패, '크기')  패 한 장의 html
//       mjBackHTML('크기')      엎어 놓은 패
//
//   크기는 s(버린 패) · m(후로) · l(내 손패) 셋이다.
//   그림은 <symbol> 로 한 번만 깔고 <use> 로 불러 쓰므로,
//   예순 장이 깔려도 html 은 몇 글자씩밖에 안 된다.
//
// ■ 패 번호 (mj-core.js 와 같다)
//     0~8 만수 · 9~17 통수 · 18~26 삭수 · 27~30 동남서북 · 31~33 백발중

(function mjTiles() {

const NS = 'http://www.w3.org/2000/svg';
const VB = '0 0 36 48';

// --- 색 ---
const INK = '#23201a';          // 만수 숫자
const RED = '#b3261e';          // 萬 · 중 · 붉은 점
const BLUE = '#1d4f9f';         // 통수 · 백
const DARK = '#15306a';         // 동남서북
const GREEN = '#17703a';        // 삭수 · 발

// ==========================================
// 통수 — 동그라미
// ==========================================
const DOT_POS = {
    1: [[18, 24]],
    2: [[18, 13], [18, 35]],
    3: [[10, 12], [18, 24], [26, 36]],
    4: [[11, 13], [25, 13], [11, 35], [25, 35]],
    5: [[11, 12], [25, 12], [18, 24], [11, 36], [25, 36]],
    6: [[11, 10], [25, 10], [11, 24], [25, 24], [11, 38], [25, 38]],
    7: [[9, 9], [17, 13], [25, 17], [11, 31], [25, 31], [11, 41], [25, 41]],
    8: [[11, 9], [25, 9], [11, 19], [25, 19], [11, 29], [25, 29], [11, 39], [25, 39]],
    9: [[9, 10], [18, 10], [27, 10], [9, 24], [18, 24], [27, 24], [9, 38], [18, 38], [27, 38]]
};
const DOT_R = { 1: 10, 2: 6.2, 3: 5.6, 4: 6, 5: 5.4, 6: 5.4, 7: 4.4, 8: 4.4, 9: 4.6 };

function dot(x, y, r, out) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (out || BLUE) + '"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.56).toFixed(2) + '" fill="#f7f4e9"/>'
        + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.24).toFixed(2) + '" fill="' + RED + '"/>';
}
function pinFace(n) {
    const pos = DOT_POS[n], r = DOT_R[n];
    if (n === 1) {
        // 한 알짜리는 크게, 테를 하나 더 둘러 준다
        return '<circle cx="18" cy="24" r="11" fill="' + BLUE + '"/>'
            + '<circle cx="18" cy="24" r="8.4" fill="#f7f4e9"/>'
            + '<circle cx="18" cy="24" r="6" fill="' + RED + '"/>'
            + '<circle cx="18" cy="24" r="3.1" fill="#f7f4e9"/>'
            + '<circle cx="18" cy="24" r="1.5" fill="' + BLUE + '"/>';
    }
    // 가운데 알만 붉게 (5통)
    return pos.map(function (p, i) {
        return dot(p[0], p[1], r, (n === 5 && i === 2) ? RED : BLUE);
    }).join('');
}

// ==========================================
// 삭수 — 대나무
// ==========================================
const SOU_POS = {
    2: [[18, 14], [18, 34]],
    3: [[18, 11], [11, 33], [25, 33]],
    4: [[11, 14], [25, 14], [11, 34], [25, 34]],
    5: [[11, 12], [25, 12], [18, 24], [11, 36], [25, 36]],
    6: [[11, 10], [25, 10], [11, 24], [25, 24], [11, 38], [25, 38]],
    7: [[18, 8], [11, 22], [25, 22], [11, 31], [25, 31], [11, 40], [25, 40]],
    8: [[11, 9], [25, 9], [11, 19], [25, 19], [11, 29], [25, 29], [11, 39], [25, 39]],
    9: [[9, 10], [18, 10], [27, 10], [9, 24], [18, 24], [27, 24], [9, 38], [18, 38], [27, 38]]
};
const SOU_H = { 2: 15, 3: 13, 4: 14, 5: 11, 6: 11, 7: 8.5, 8: 8.5, 9: 11 };

function stick(x, y, h, col) {
    const w = 5.4, half = h / 2;
    return '<rect x="' + (x - w / 2) + '" y="' + (y - half) + '" width="' + w + '" height="' + h
        + '" rx="' + (w / 2) + '" fill="' + col + '"/>'
        // 마디
        + '<rect x="' + (x - w / 2 - 1.1) + '" y="' + (y - 1.2) + '" width="' + (w + 2.2)
        + '" height="2.4" rx="1.2" fill="' + col + '"/>'
        + '<rect x="' + (x - 1) + '" y="' + (y - half + 1.6) + '" width="2" height="'
        + (h - 3.2) + '" rx="1" fill="rgba(255,255,255,0.33)"/>';
}
function souFace(n) {
    if (n === 1) {
        // 한 삭은 새다 — 간단히 그린다
        return '<ellipse cx="18" cy="29" rx="8.5" ry="10" fill="' + GREEN + '"/>'
            + '<circle cx="18" cy="15" r="5.4" fill="' + GREEN + '"/>'
            + '<circle cx="19.8" cy="14" r="1.5" fill="#f7f4e9"/>'
            + '<path d="M22.6 16.4 L29 18.4 L22.4 20.2 Z" fill="' + RED + '"/>'
            + '<path d="M13 34 Q9 41 12.5 43 L16 38 Z" fill="' + RED + '"/>'
            + '<path d="M23 34 Q27 41 23.5 43 L20 38 Z" fill="' + RED + '"/>'
            + '<path d="M11.5 25 Q18 29 24.5 25" stroke="#f7f4e9" stroke-width="1.4" fill="none"/>';
    }
    const pos = SOU_POS[n], h = SOU_H[n];
    return pos.map(function (p, i) {
        let red = false;
        if (n === 5 && i === 2) red = true;                     // 가운데
        if (n === 7 && i === 0) red = true;                     // 맨 위
        if (n === 9 && (i === 1 || i === 4 || i === 7)) red = true;   // 가운뎃줄
        return stick(p[0], p[1], h, red ? RED : GREEN);
    }).join('');
}

// ==========================================
// 만수 · 자패 — 글자
// ==========================================
const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const FONT = "'Noto Serif KR','Nanum Myeongjo','Apple SD Gothic Neo','Malgun Gothic',serif";

function glyph(ch, y, size, col) {
    return '<text x="18" y="' + y + '" text-anchor="middle" font-size="' + size
        + '" font-weight="700" font-family="' + FONT + '" fill="' + col + '">' + ch + '</text>';
}
function manFace(n) {
    return glyph(CN[n - 1], 21, 19, INK) + glyph('萬', 43, 18, RED);
}
function honorFace(i) {
    if (i === 4) {                                  // 백 — 빈 테두리
        return '<rect x="5" y="9" width="26" height="30" rx="2.5" fill="none" stroke="' + BLUE + '" stroke-width="2.6"/>'
            + '<rect x="8.6" y="12.6" width="18.8" height="22.8" rx="1.5" fill="none" stroke="' + BLUE + '" stroke-width="1"/>';
    }
    const CH = ['東', '南', '西', '北', '', '發', '中'];
    const COL = [DARK, DARK, DARK, DARK, BLUE, GREEN, RED];
    return glyph(CH[i], 34, 26, COL[i]);
}

// ==========================================
// 그림 묶음 깔기
// ==========================================
let laid = false;
function sheet() {
    if (laid && document.getElementById('mj-tile-defs')) return;
    laid = true;

    let s = '<svg id="mj-tile-defs" xmlns="' + NS + '" style="position:absolute; width:0; height:0;'
        + ' overflow:hidden; pointer-events:none;" aria-hidden="true"><defs>';
    for (let t = 0; t < 34; t++) {
        let face;
        if (t < 9) face = manFace(t + 1);
        else if (t < 18) face = pinFace(t - 8);
        else if (t < 27) face = souFace(t - 17);
        else face = honorFace(t - 27);
        s += '<symbol id="mjt' + t + '" viewBox="' + VB + '">' + face + '</symbol>';
    }
    s += '</defs></svg>';

    const old = document.getElementById('mj-tile-defs');
    if (old) old.remove();
    document.body.insertAdjacentHTML('afterbegin', s);
    css();
}

function css() {
    if (document.getElementById('mj-tile-css')) return;
    const st = document.createElement('style');
    st.id = 'mj-tile-css';
    st.textContent = `
.mjt {
    display:inline-block; position:relative; box-sizing:border-box;
    border-radius:3px; vertical-align:top; flex:none;
    background:linear-gradient(176deg,#fffdf4 0%,#f6f1e0 58%,#e4ddc6 100%);
    box-shadow:0 1px 0 #cdc5ad, 0 2px 0 #b2a98f, 0 3px 4px rgba(0,0,0,0.45);
    overflow:hidden;
}
.mjt > svg { display:block; width:100%; height:100%; }
.mjt.mjt-s { width:17px; height:23px; border-radius:2px; box-shadow:0 1px 0 #b2a98f, 0 2px 3px rgba(0,0,0,0.4); }
.mjt.mjt-m { width:22px; height:29px; }
.mjt.mjt-l { width:32px; height:43px; border-radius:4px; }
.mjt.mjt-x { width:26px; height:35px; }

/* 엎은 패 */
.mjt.mjt-back {
    background:linear-gradient(176deg,#2f8a62 0%,#1f6448 60%,#154833 100%);
    box-shadow:0 1px 0 #10402e, 0 2px 0 #0c3122, 0 3px 4px rgba(0,0,0,0.45);
}
.mjt.mjt-back::after {
    content:''; position:absolute; inset:3px; border-radius:2px;
    border:1px solid rgba(255,255,255,0.16);
    background:radial-gradient(circle at 50% 42%, rgba(255,255,255,0.14), transparent 62%);
}
.mjt.mjt-s.mjt-back::after { inset:2px; }

/* 가져온 패 · 마지막으로 버린 패 */
.mjt.mjt-new { box-shadow:0 0 0 2px #ffd76a, 0 2px 0 #b2a98f, 0 3px 6px rgba(0,0,0,0.5); }
.mjt.mjt-hot { box-shadow:0 0 0 2px #ff8a65, 0 1px 0 #b2a98f, 0 2px 5px rgba(0,0,0,0.5); }
.mjt.mjt-dim { filter:brightness(0.72) saturate(0.8); }

/* 후로에서 가로로 눕힌 패 */
.mjt.mjt-lay { transform:rotate(90deg); }
`;
    document.head.appendChild(st);
}

// ==========================================
// 한 장
// ==========================================
function tileHTML(t, size, extra) {
    sheet();
    const n = Number(t);
    const cls = 'mjt mjt-' + (size || 'm') + (extra ? ' ' + extra : '');
    if (!(n >= 0 && n < 34)) return '<span class="' + cls + ' mjt-back"></span>';
    return '<span class="' + cls + '"><svg viewBox="' + VB + '"><use href="#mjt' + n
        + '" xlink:href="#mjt' + n + '"/></svg></span>';
}
function backHTML(size, extra) {
    sheet();
    return '<span class="mjt mjt-' + (size || 'm') + ' mjt-back' + (extra ? ' ' + extra : '') + '"></span>';
}

window.mjTileSheet = sheet;
window.mjTileHTML = tileHTML;
window.mjBackHTML = backHTML;

// 창이 뜨기 전에 미리 깔아 둔다 — 처음 열 때 깜빡이지 않게
if (document.body) sheet();
else document.addEventListener('DOMContentLoaded', sheet);

// 패 한 벌을 늘어놓아 눈으로 본다
window.mjTileShow = function () {
    sheet();
    const id = 'mj-tile-show';
    const old = document.getElementById(id);
    if (old) { old.remove(); return; }
    let h = '<div id="' + id + '" style="position:fixed; inset:0; z-index:9999999;'
        + ' background:#143024; padding:18px 12px; overflow:auto;" onclick="this.remove()">'
        + '<div style="color:#d4af37; font-size:13px; margin-bottom:10px;">패 서른넉 장 — 아무 데나 누르면 닫힙니다</div>';
    [[0, 9, '만수'], [9, 18, '통수'], [18, 27, '삭수'], [27, 34, '자패']].forEach(function (g) {
        h += '<div style="color:#9fd0ff; font-size:11px; margin:12px 0 5px;">' + g[2] + '</div>'
            + '<div style="display:flex; flex-wrap:wrap; gap:5px;">';
        for (let t = g[0]; t < g[1]; t++) h += tileHTML(t, 'l');
        h += '</div>';
    });
    h += '</div>';
    document.body.insertAdjacentHTML('beforeend', h);
};

console.log('[마작] 패 그림 — mjTileShow() 로 봅니다');

})();
