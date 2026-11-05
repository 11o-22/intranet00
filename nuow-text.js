// ==========================================
// ★ 말풍선 글씨를 내가 고른다 — Null Owner 착한 친구(토끼) · Null Owner 2 호유원 인형 (2026-11-03 사용자)
// bundles.json — closet.js · recolor.js · plaza.js 뒤
// ==========================================
//
// ■ 사용자가 정한 것
//   · 착한 친구(토끼 인형) — 토끼를 누르면 말풍선 글씨 **두 글자**와 글씨 색을 고른다.
//   · 호유원 인형 — 인형을 누르면 말풍선 글씨 **세 글자**를 **글자마다 다른 색**으로 고른다.
//   · 두 악세 다 글씨체는 **그림에 적혀 있던 글씨체대로** (같은 날 덧붙임).
//
// ■ 글씨체 — 그려 둔 손글씨처럼
//   그려 둔 글씨(「섹스」 · 「브라운」)는 굵기 2점짜리 곧은 획을 손으로 그어 쓴 것이다. 글꼴을 깔면 그 맛이 안 난다.
//   그래서 한글을 **자모로 풀어 획(선)으로 직접 긋는다** — 자모마다 획을 적어 두고(아래 CONS · VV · VH),
//   받침 · 모음 꼴에 따라 칸을 나눠 앉힌 뒤, 2x2 붓으로 그림 점 위에 긋는다. 글씨 전체를 그려 둔 만큼 기울인다.
//   써 내려가는 여섯 칸도 그려 둔 것처럼 **획 하나씩** 늘어난다 (첫 칸은 첫 획 하나).
//   한글이 아닌 글자(영문 · 숫자 · 기호)는 글꼴로 찍어 같은 굵기로 다듬는다 — 한 획으로 친다.
//
// ■ 장 만들기
//   · 글씨만 지운 장(nuow-friend-nt · nuow2-doll-nt — 그려 둔 글씨 색 점만 흰색으로)을 바탕으로,
//     글씨가 써지는 여섯 칸(장의 여섯째 줄)에 고른 글씨를 그려 넣어 한 벌(canvas → blob 주소)을 만들어 쟁여 둔다.
//   · 오른쪽을 볼 때 쓰는 짝(-r)은 몸과 함께 통째로 뒤집히므로 글씨만 미리 뒤집어 그린다 (그려 둔 짝도 그렇다).
//   · 고른 것은 dot.nw (착한 친구 { t, c }) · dot.nw2 (호유원 인형 { t, c: [글자마다] }) 에 적는다.
//     광장은 dot 을 통째로 주고받으므로 남의 화면에서도 같은 글씨다. 고른 것이 없으면 그려 둔 그대로다.
//   · 물들이기(recolor.js)를 했으면 물든 바탕 위에 쓴다 (글씨 색은 고른 색 그대로).
//
// ■ 말풍선 켜고 끄기 (2026-11-05 사용자 「Null Owner 악세 두 개 다 말풍선 on off」)
//   · 고르는 창 맨 위 「말풍선 켜기 · 끄기」 — 누르는 즉시 저장한다. dot.nwOff · dot.nw2Off 가 1 이면 끈 것.
//   · 끄면 말풍선(과 그 안 글씨)만 지운 장(nuow-friend-nb · nuow2-doll-nb — 말풍선이 나오는 일곱 칸에서 말풍선 덩어리만 걷음)을 깐다.
//     토끼 · 인형 · 종이는 그대로 움직인다. 글씨가 없으니 짝(-r)도 같은 장을 쓴다 (몸과 함께 뒤집힌다).
//   · 끈 동안에도 고른 글씨는 그대로 남아 있어, 다시 켜면 그 글씨로 나온다.
//
// ■ 콘솔
//   nuowTextOpen('nuow-friend' | 'nuow2-doll')     고르는 창
//   nuowTextState()

(function nuowText() {
'use strict';

const ART = 4;                                  // 그림 점 하나 = 원본 4px
const AW = 96, AH = 72;                         // 글씨를 긋는 판 (그림 점) — 가운데 (48, 36)
const STEP = [0.12, 0.3, 0.5, 0.68, 0.86, 1];  // 여섯 칸 — 전체 획 가운데 그어진 만큼
const COLORS = ['#ff95f3', '#e7b775', '#ff4d6d', '#ff9f1c', '#ffd60a', '#52b788', '#4cc9f0', '#4361ee', '#9d4edd', '#8d6e63', '#ffffff', '#111111'];

// 말풍선 하나마다 — 칸 크기 · 글씨 자리(원본 좌표) · 짝을 뒤집는 축 · 글자 칸 · 기울기 · 누르는 자리
//   CX, CY — 글씨 가운데 = 말풍선 몸통 가운데 (꼬리 뺀 말풍선에서 재었다). 판 왼쪽 위(CX-192, CY-144)가
//            그려 둔 글씨의 점 줄(4로 나눈 나머지)에 맞게 골랐다.
//   AXIS   — 짝(-r)에 뒤집어 그릴 축 = 2 × CX (글씨가 제자리에서 뒤집힌다)
//   rot    — 글씨 기울기 = **말풍선 기울기** (2026-11-03 사용자 「글씨가 말풍선 기울기대로」).
//            꼬리를 뺀 말풍선 테두리에 타원을 맞춰 긴 축의 기울기를 재었다 — 착한 친구 -14° · 호유원 인형 -43°(-42 로).
//            (그려 둔 글씨는 -9° · -22° 였다)
//            ★ 오른쪽을 볼 때는 몸과 함께 말풍선도 뒤집혀 반대로 기운다 — 짝(-r)에는 반대 기울기로 써서 뒤집어 넣는다.
const CFG = {
    'nuow-friend': {
        key: 'nw', offKey: 'nwOff', nb: 'nuow-friend-nb', base: 'nuow-friend-nt', SW: 2880, CW: 480, CH: 576, ROW: 5,
        CX: 142, CY: 358, AXIS: 284, max: 2, per: false, defC: '#ff95f3',
        bw: 15, bh: 20, gap: 3, rot: -14, jit: 0.5,
        hit: { x0: 196, x1: 314, y0: 430, y1: 576 },                 // 토끼
        pv: { x: 20, y: 216, w: 420, h: 360 },
        title: '🐰 착한 친구 말풍선', item: 'Null Owner'
    },
    'nuow2-doll': {
        key: 'nw2', offKey: 'nw2Off', nb: 'nuow2-doll-nb', base: 'nuow2-doll-nt', SW: 4032, CW: 672, CH: 576, ROW: 5,
        CX: 208, CY: 396, AXIS: 416, max: 3, per: true, defC: '#e7b775',
        bw: 13, bh: 15, gap: 1, rot: -42, jit: 0,
        hit: { x0: 288, x1: 392, y0: 440, y1: 576 },                 // 인형
        pv: { x: 60, y: 240, w: 420, h: 336 },
        title: '🧸 호유원 인형 말풍선', item: 'Null Owner 2'
    }
};
const FAMS = Object.keys(CFG);

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function chars(t) { return Array.from(String(t || '').replace(/\s+/g, '')); }
function cleanT(t, max) { return chars(t).slice(0, max).join(''); }
function cleanC(c, def) { c = String(c || '').trim(); return /^#[0-9a-fA-F]{6}$/.test(c) ? c.toLowerCase() : def; }
function famOf(sheet) { return String(sheet || '').replace(/-r$/, ''); }
function baseUrl(cf) { return ((window.DOT2 && window.DOT2[cf.base]) ? 'dot2/' : 'dot/') + cf.base + '.png'; }
function nbUrl(cf) { return ((window.DOT2 && window.DOT2[cf.nb]) ? 'dot2/' : 'dot/') + cf.nb + '.png'; }
function origUrl(fam) { return ((window.DOT2 && window.DOT2[fam]) ? 'dot2/' : 'dot/') + fam + '.png'; }
// 고른 것 → { t, cs: [글자마다 색] }
function specOf(cf, nw) {
    if (!nw || typeof nw !== 'object') return null;
    const t = cleanT(nw.t, cf.max); if (!t) return null;
    // 글자마다 색 — 배열 (서버를 거치면 { 0: …, 1: … } 꼴로 올 수도 있다)
    let arr = Array.isArray(nw.c) ? nw.c : null;
    if (!arr && nw.c && typeof nw.c === 'object') arr = Object.keys(nw.c).sort(function (a, b) { return a - b; }).map(function (k) { return nw.c[k]; });
    const n = chars(t).length;
    const cs = [];
    for (let i = 0; i < n; i++) {
        const c = arr ? (arr[i] != null ? arr[i] : arr[arr.length - 1]) : nw.c;
        cs.push(cleanC(c, cf.defC));
    }
    return { t: t, cs: cs };
}

// ==========================================
// 손글씨 — 자모를 획으로
// ==========================================
//   획 = 점들을 잇는 꺾은선. 좌표는 그 자모가 앉는 칸 안의 0~1.
function ring(cx, cy, rx, ry) {
    const p = [];
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return [p];
}
const CONS = {
    'ㄱ': [[[0.05, 0.08], [0.92, 0.08], [0.78, 1]]],
    'ㄴ': [[[0.1, 0], [0.1, 0.92], [1, 0.92]]],
    'ㄷ': [[[0.05, 0.08], [0.95, 0.08]], [[0.1, 0.08], [0.1, 0.92], [1, 0.92]]],
    'ㄹ': [[[0.05, 0.05], [0.92, 0.05], [0.92, 0.48], [0.1, 0.48], [0.1, 0.95], [1, 0.95]]],
    'ㅁ': [[[0.08, 0.05], [0.08, 0.95]], [[0.08, 0.05], [0.92, 0.05], [0.92, 0.95]], [[0.08, 0.95], [0.92, 0.95]]],
    'ㅂ': [[[0.08, 0], [0.08, 0.95]], [[0.92, 0], [0.92, 0.95]], [[0.08, 0.48], [0.92, 0.48]], [[0.08, 0.95], [0.92, 0.95]]],
    'ㅅ': [[[0.55, 0], [0.02, 1]], [[0.42, 0.42], [1, 1]]],
    'ㅇ': ring(0.5, 0.5, 0.48, 0.48),
    'ㅈ': [[[0.05, 0.06], [0.95, 0.06]], [[0.55, 0.06], [0.02, 1]], [[0.45, 0.48], [1, 1]]],
    'ㅊ': [[[0.38, 0], [0.62, 0.08]], [[0.05, 0.26], [0.95, 0.26]], [[0.55, 0.26], [0.02, 1]], [[0.45, 0.6], [1, 1]]],
    'ㅋ': [[[0.05, 0.08], [0.92, 0.08], [0.78, 1]], [[0.08, 0.52], [0.85, 0.52]]],
    'ㅌ': [[[0.95, 0.05], [0.1, 0.05], [0.1, 0.95], [1, 0.95]], [[0.1, 0.5], [0.9, 0.5]]],
    'ㅍ': [[[0.05, 0.06], [0.95, 0.06]], [[0.32, 0.06], [0.28, 0.94]], [[0.68, 0.06], [0.72, 0.94]], [[0, 0.94], [1, 0.94]]],
    'ㅎ': [[[0.32, 0], [0.68, 0]], [[0.05, 0.24], [0.95, 0.24]]].concat(ring(0.5, 0.68, 0.34, 0.3))
};
// 쌍자음 · 겹받침 — 두 자모를 반씩
const PAIR = { 'ㄲ': 'ㄱㄱ', 'ㄸ': 'ㄷㄷ', 'ㅃ': 'ㅂㅂ', 'ㅆ': 'ㅅㅅ', 'ㅉ': 'ㅈㅈ', 'ㄳ': 'ㄱㅅ', 'ㄵ': 'ㄴㅈ', 'ㄶ': 'ㄴㅎ', 'ㄺ': 'ㄹㄱ', 'ㄻ': 'ㄹㅁ', 'ㄼ': 'ㄹㅂ', 'ㄽ': 'ㄹㅅ', 'ㄾ': 'ㄹㅌ', 'ㄿ': 'ㄹㅍ', 'ㅀ': 'ㄹㅎ', 'ㅄ': 'ㅂㅅ' };
function consOf(j) {
    if (CONS[j]) return CONS[j];
    const p = PAIR[j]; if (!p) return null;
    const a = CONS[p[0]], b = CONS[p[1]];
    const sq = function (st, x0, w) { return st.map(function (s) { return s.map(function (q) { return [x0 + q[0] * w, q[1]]; }); }); };
    return sq(a, 0, 0.46).concat(sq(b, 0.54, 0.46));
}
// 모음 — 세로(오른쪽에 서는 것) · 가로(아래에 눕는 것)
const VV = {
    'ㅏ': [[[0.35, 0], [0.35, 1]], [[0.35, 0.5], [1, 0.5]]],
    'ㅐ': [[[0.15, 0], [0.15, 1]], [[0.15, 0.5], [0.6, 0.5]], [[0.85, 0], [0.85, 1]]],
    'ㅑ': [[[0.35, 0], [0.35, 1]], [[0.35, 0.33], [1, 0.33]], [[0.35, 0.66], [1, 0.66]]],
    'ㅒ': [[[0.15, 0], [0.15, 1]], [[0.15, 0.33], [0.6, 0.33]], [[0.15, 0.66], [0.6, 0.66]], [[0.85, 0], [0.85, 1]]],
    'ㅓ': [[[0, 0.5], [0.65, 0.5]], [[0.65, 0], [0.65, 1]]],
    'ㅔ': [[[0, 0.5], [0.4, 0.5]], [[0.4, 0], [0.4, 1]], [[0.88, 0], [0.88, 1]]],
    'ㅕ': [[[0, 0.33], [0.65, 0.33]], [[0, 0.66], [0.65, 0.66]], [[0.65, 0], [0.65, 1]]],
    'ㅖ': [[[0, 0.33], [0.4, 0.33]], [[0, 0.66], [0.4, 0.66]], [[0.4, 0], [0.4, 1]], [[0.88, 0], [0.88, 1]]],
    'ㅣ': [[[0.5, 0], [0.5, 1]]]
};
const VH = {
    'ㅗ': [[[0.5, 0], [0.5, 0.6]], [[0, 0.78], [1, 0.78]]],
    'ㅛ': [[[0.33, 0], [0.33, 0.6]], [[0.67, 0], [0.67, 0.6]], [[0, 0.78], [1, 0.78]]],
    'ㅜ': [[[0, 0.22], [1, 0.22]], [[0.5, 0.22], [0.5, 1]]],
    'ㅠ': [[[0, 0.22], [1, 0.22]], [[0.33, 0.22], [0.33, 1]], [[0.67, 0.22], [0.67, 1]]],
    'ㅡ': [[[0, 0.5], [1, 0.5]]]
};
const VM = { 'ㅘ': 'ㅗㅏ', 'ㅙ': 'ㅗㅐ', 'ㅚ': 'ㅗㅣ', 'ㅝ': 'ㅜㅓ', 'ㅞ': 'ㅜㅔ', 'ㅟ': 'ㅜㅣ', 'ㅢ': 'ㅡㅣ' };
const LJ = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const VJ = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const TJ = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const WIDE = { 'ㅐ': 1, 'ㅒ': 1, 'ㅔ': 1, 'ㅖ': 1 };
// 칸에 앉힌다 — [x, y, w, h] (글자 칸 안의 0~1)
function put(strokes, b) { return strokes.map(function (s) { return s.map(function (q) { return [b[0] + q[0] * b[2], b[1] + q[1] * b[3]]; }); }); }
// 글자 하나 → 획들 (글자 칸 안의 0~1) · 한글이 아니면 null
function syllable(ch) {
    const code = ch.charCodeAt(0);
    // 낱자 (ㄱ ~ ㅣ)
    if (code >= 0x3131 && code <= 0x3163) {
        if (consOf(ch)) return put(consOf(ch), [0.1, 0.05, 0.8, 0.9]);
        if (VV[ch]) return put(VV[ch], [0.28, 0, 0.44, 1]);
        if (VH[ch]) return put(VH[ch], [0, 0.2, 1, 0.6]);
        if (VM[ch]) return put(VH[VM[ch][0]], [0, 0.45, 0.72, 0.4]).concat(put(VV[VM[ch][1]], [0.72, 0, 0.28, 1]));
        return null;
    }
    if (code < 0xAC00 || code > 0xD7A3) return null;
    const s = code - 0xAC00;
    const L = LJ[Math.floor(s / 588)], V = VJ[Math.floor((s % 588) / 28)], T = TJ[s % 28];
    let out = [];
    if (VV[V]) {                                        // 세로 모음 — 첫소리 왼쪽 · 모음 오른쪽
        const wd = WIDE[V];
        // ★ 붓이 2점이라 칸끼리 붙으면 뭉친다 — 첫소리와 모음 사이를 넉넉히 띄운다
        if (!T) {
            out = out.concat(put(consOf(L), wd ? [0, 0.06, 0.42, 0.88] : [0, 0.06, 0.5, 0.88]));
            out = out.concat(put(VV[V], wd ? [0.5, 0, 0.5, 1] : [0.64, 0, 0.36, 1]));
        } else {
            out = out.concat(put(consOf(L), wd ? [0, 0, 0.42, 0.5] : [0, 0, 0.5, 0.5]));
            out = out.concat(put(VV[V], wd ? [0.5, 0, 0.5, 0.6] : [0.64, 0, 0.36, 0.6]));
            out = out.concat(put(consOf(T), [0.08, 0.66, 0.84, 0.34]));
        }
    } else if (VH[V]) {                                 // 가로 모음 — 첫소리 위 · 모음 아래
        if (!T) {
            out = out.concat(put(consOf(L), [0.1, 0, 0.8, 0.58]));
            out = out.concat(put(VH[V], V === 'ㅡ' ? [0, 0.74, 1, 0.2] : [0, 0.6, 1, 0.4]));
        } else {
            out = out.concat(put(consOf(L), [0.15, 0, 0.7, 0.38]));
            out = out.concat(put(VH[V], V === 'ㅡ' ? [0, 0.44, 1, 0.14] : [0, 0.38, 1, 0.27]));
            out = out.concat(put(consOf(T), [0.12, 0.68, 0.76, 0.32]));
        }
    } else {                                            // 섞인 모음 (ㅘ ㅝ ㅢ …)
        const vm = VM[V], wd = WIDE[vm[1]];
        const vx = wd ? 0.62 : 0.72;
        if (!T) {
            out = out.concat(put(consOf(L), [0, 0, vx - 0.12, 0.45]));
            out = out.concat(put(VH[vm[0]], [0, 0.46, vx, 0.4]));
            out = out.concat(put(VV[vm[1]], [vx, 0, 1 - vx, 1]));
        } else {
            out = out.concat(put(consOf(L), [0, 0, vx - 0.12, 0.32]));
            out = out.concat(put(VH[vm[0]], [0, 0.33, vx, 0.3]));
            out = out.concat(put(VV[vm[1]], [vx, 0, 1 - vx, 0.64]));
            out = out.concat(put(consOf(T), [0.08, 0.68, 0.84, 0.32]));
        }
    }
    return out;
}

// ==========================================
// 긋기 — 그림 점 판 위에 2x2 붓으로
// ==========================================
function jit(seed) { const x = Math.sin(seed * 12.9898) * 43758.5453; return (x - Math.floor(x)) - 0.5; }
// 글씨 → 획 목록 [{ px: [[x, y], …] (그림 점), ci: 몇째 글자 }] (쓰는 차례)
function strokesOf(cf, t, rotDeg) {
    const cs = chars(t), n = cs.length;
    const tw = n * cf.bw + (n - 1) * cf.gap;
    const ox0 = AW / 2 - tw / 2, oy = AH / 2 - cf.bh / 2;
    const rd = (rotDeg == null) ? cf.rot : rotDeg;
    const th = rd * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
    const rot = function (x, y) { const dx = x - AW / 2, dy = y - AH / 2; return [AW / 2 + dx * co - dy * si, AH / 2 + dx * si + dy * co]; };
    const out = [];
    cs.forEach(function (ch, ci) {
        const ox = ox0 + ci * (cf.bw + cf.gap);
        const sy = syllable(ch);
        if (sy) {
            sy.forEach(function (st, k) {
                const pts = st.map(function (q, m) {
                    const sd = ch.charCodeAt(0) * 7 + k * 13 + m * 31;
                    const x = ox + q[0] * (cf.bw - 2) + jit(sd) * cf.jit, y = oy + q[1] * (cf.bh - 2) + jit(sd + 5) * cf.jit;
                    return rot(x, y);
                });
                const px = {};
                for (let m = 1; m < pts.length; m++) line(px, pts[m - 1], pts[m]);
                if (pts.length === 1) dot(px, Math.round(pts[0][0]), Math.round(pts[0][1]));
                out.push({ px: Object.keys(px).map(function (k) { const a = k.split(','); return [+a[0], +a[1]]; }), ci: ci });
            });
        } else {
            out.push({ px: glyphPx(ch, ox, oy, cf, rot, rd), ci: ci });       // 한글이 아닌 글자 — 한 획으로
        }
    });
    return out;
}
function dot(px, x, y) { px[x + ',' + y] = 1; px[(x + 1) + ',' + y] = 1; px[x + ',' + (y + 1)] = 1; px[(x + 1) + ',' + (y + 1)] = 1; }
function line(px, a, b) {
    let x0 = Math.round(a[0]), y0 = Math.round(a[1]);
    const x1 = Math.round(b[0]), y1 = Math.round(b[1]);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let guard = 0; guard < 400; guard++) {
        dot(px, x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
    }
}
// 한글이 아닌 글자 — 글꼴로 찍고 같은 굵기(2점)로 다듬는다
function glyphPx(ch, ox, oy, cf, rot, rd) {
    const c = document.createElement('canvas');
    c.width = AW; c.height = AH;
    const g = c.getContext('2d');
    const ctr = rot(ox + cf.bw / 2, oy + cf.bh / 2);
    g.translate(ctr[0], ctr[1]);
    g.rotate(rd * Math.PI / 180);
    g.font = '500 ' + Math.round(cf.bh * 0.95) + 'px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#000';
    g.fillText(ch, 0, 1);
    const a = g.getImageData(0, 0, AW, AH).data;
    const px = {};
    for (let y = 0; y < AH; y++) for (let x = 0; x < AW; x++) if (a[(y * AW + x) * 4 + 3] >= 128) dot(px, x, y);
    return Object.keys(px).map(function (k) { const v = k.split(','); return [+v[0], +v[1]]; });
}
function rgb(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
// 앞에서부터 k 획을 그은 판
function boardOf(strokes, cs, k) {
    const c = document.createElement('canvas');
    c.width = AW; c.height = AH;
    const g = c.getContext('2d');
    const id = g.createImageData(AW, AH), a = id.data;
    for (let i = 0; i < Math.min(k, strokes.length); i++) {
        const st = strokes[i], col = rgb(cs[st.ci] || cs[0]);
        st.px.forEach(function (p) {
            if (p[0] < 0 || p[1] < 0 || p[0] >= AW || p[1] >= AH) return;
            const j = (p[1] * AW + p[0]) * 4;
            a[j] = col[0]; a[j + 1] = col[1]; a[j + 2] = col[2]; a[j + 3] = 255;
        });
    }
    g.putImageData(id, 0, 0);
    return c;
}
// 한 칸에 판을 얹는다 — g: 장 캔버스, s: 장 배율(원본 1 · 절반 0.5), f: 칸, flip: 짝(-r)
function drawCell(g, cf, s, f, board, flip) {
    const ox = f * cf.CW * s, oy = cf.ROW * cf.CH * s;
    const left = cf.CX - AW / 2 * ART, top = cf.CY - AH / 2 * ART;
    g.save();
    g.imageSmoothingEnabled = false;
    if (flip) { g.translate(ox + cf.AXIS * s, oy); g.scale(-1, 1); g.drawImage(board, left * s, top * s, AW * ART * s, AH * ART * s); }
    else g.drawImage(board, ox + left * s, oy + top * s, AW * ART * s, AH * ART * s);
    g.restore();
}

// ==========================================
// 장 만들기 · 쟁여 두기
// ==========================================
const cache = {}, busy = {}, imgs = {};
let made = 0;
function keyOf(sheet, sp, hue) { return sheet + '|' + sp.t + '|' + sp.cs.join(',') + '|' + (hue == null ? '' : hue); }
function loadImg(url) {
    if (imgs[url]) return imgs[url];
    imgs[url] = new Promise(function (res, rej) {
        const im = new Image();
        im.onload = function () { res(im); };
        im.onerror = function () { delete imgs[url]; rej(new Error('바탕 그림을 못 받았습니다 — ' + url)); };
        im.src = url;
    });
    return imgs[url];
}
// 바탕 — 물들였으면 물든 바탕 (다 될 때까지 기다린다 · 10초 넘으면 안 물든 바탕)
function baseFor(cf, hue, nb) {
    const sh = nb ? cf.nb : cf.base, plain = nb ? nbUrl(cf) : baseUrl(cf);
    if (hue == null || hue === '' || typeof window.dotTint !== 'function') return Promise.resolve(plain);
    return new Promise(function (res) {
        const t0 = Date.now();
        const look = function () {
            let u = null;
            try { u = window.dotTint(sh, hue); } catch (e) { }
            if (u) return res(u);
            if (Date.now() - t0 > 10000) return res(plain);
            setTimeout(look, 150);
        };
        look();
    });
}
function make(sheet, sp, hue) {
    const cf = CFG[famOf(sheet)];
    const k = keyOf(sheet, sp, hue);
    if (cache[k]) return Promise.resolve(cache[k]);
    if (busy[k]) return new Promise(function (res) { busy[k].push(res); });
    busy[k] = [];
    const flip = /-r$/.test(sheet);
    return baseFor(cf, hue).then(loadImg).then(function (im) {
        const s = im.naturalWidth / cf.SW;
        const cv = document.createElement('canvas');
        cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        const g = cv.getContext('2d');
        g.drawImage(im, 0, 0);
        const st = strokesOf(cf, sp.t, flip ? -cf.rot : cf.rot);      // 짝은 반대로 기울여 쓴 뒤 뒤집는다
        STEP.forEach(function (fr, f) { drawCell(g, cf, s, f, boardOf(st, sp.cs, Math.max(1, Math.round(st.length * fr))), flip); });
        return new Promise(function (res) {
            const done = function (url) { cache[k] = url; made++; res(url); };
            try { cv.toBlob(function (b) { done(b ? URL.createObjectURL(b) : cv.toDataURL('image/png')); }, 'image/png'); }
            catch (e) { done(cv.toDataURL('image/png')); }
        });
    }).then(function (url) {
        const w = busy[k] || []; delete busy[k];
        w.forEach(function (f) { f(url); });
        return url;
    }).catch(function (e) {
        console.warn('[말풍선 글씨]', e);
        const w = busy[k] || []; delete busy[k];
        w.forEach(function (f) { f(null); });
        return null;
    });
}

// closet.js 가 층을 깔 때 부른다 — 쟁여 둔 것이 있으면 바로, 없으면 글씨 없는 바탕을 깔아 두었다가 갈아 낀다
window.nuowTextPut = function (el, sheet, nw) {
    const cf = CFG[famOf(sheet)];
    if (!el || !cf) return;
    const hue = (el.dataset.hue != null && el.dataset.hue !== '') ? el.dataset.hue : null;
    // 말풍선을 껐다 — 말풍선만 걷은 장 (물들였으면 물든 것). 짝(-r)도 같은 장
    if (nw && nw.off) {
        const ko = famOf(sheet) + '|off|' + (hue == null ? '' : hue);
        el.dataset.nwk = ko;
        if (cache[ko]) { el.style.backgroundImage = 'url("' + cache[ko] + '")'; return; }
        el.style.backgroundImage = 'url("' + nbUrl(cf) + '")';
        baseFor(cf, hue, true).then(function (url) {
            cache[ko] = url;
            Array.prototype.forEach.call(document.querySelectorAll('.dot-layer[data-nwk]'), function (e) {
                if (e.dataset.nwk === ko) e.style.backgroundImage = 'url("' + url + '")';
            });
        });
        return;
    }
    const sp = specOf(cf, nw);
    if (!sp) return;
    const k = keyOf(sheet, sp, hue);
    el.dataset.nwk = k;
    if (cache[k]) { el.style.backgroundImage = 'url("' + cache[k] + '")'; return; }
    el.style.backgroundImage = 'url("' + baseUrl(cf) + '")';
    make(sheet, sp, hue).then(function (url) {
        if (!url) return;
        Array.prototype.forEach.call(document.querySelectorAll('.dot-layer[data-nwk]'), function (e) {
            if (e.dataset.nwk === k) e.style.backgroundImage = 'url("' + url + '")';
        });
    });
};
// 물든 장이 늦게 다 되면 closet.js 가 원래 장(그려 둔 글씨)으로 갈아 끼운다 — 그 뒤에 다시 내 글씨로
if (typeof window.dotTintOn === 'function') {
    window.dotTintOn(function (sheet) {
        if (!CFG[famOf(sheet)]) return;
        Array.prototype.forEach.call(document.querySelectorAll('.dot-layer[data-nwk]'), function (e) {
            const url = cache[e.dataset.nwk];
            if (url) e.style.backgroundImage = 'url("' + url + '")';
        });
    });
}

// ==========================================
// 누르면 — 광장의 내 사람 (plaza.js 가 톡 친 자리를 묻는다)
// ==========================================
function myLayer(fam) {
    const u = u_();
    if (!u || typeof window.plazaOneOf !== 'function') return null;
    const o = window.plazaOneOf(u.code);
    if (!o || !o.wrap) return null;
    const els = o.wrap.querySelectorAll('.dot-layer[data-sheet="' + fam + '"]');
    for (let i = 0; i < els.length; i++) if (els[i].style.display !== 'none') return els[i];
    return null;
}
window.nuowTap = function (cx, cy) {
    for (let i = 0; i < FAMS.length; i++) {
        const fam = FAMS[i], cf = CFG[fam], el = myLayer(fam);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const box = el.closest('.dot-box');
        const flip = !!(box && /scaleX\(-1\)/.test(box.style.transform || ''));
        const x = (flip ? (r.right - cx) : (cx - r.left)) / r.width * cf.CW;
        const y = (cy - r.top) / r.height * cf.CH;
        if (x < cf.hit.x0 || x > cf.hit.x1 || y < cf.hit.y0 || y > cf.hit.y1) continue;
        window.nuowTextOpen(fam);
        return true;
    }
    return false;
};

// ==========================================
// 고르는 창
// ==========================================
(function css() {
    if (document.getElementById('nw-css')) return;
    const s = document.createElement('style');
    s.id = 'nw-css';
    s.textContent = [
        '#nw-ov{position:fixed;inset:0;z-index:9999992;display:flex;align-items:center;justify-content:center;background:rgba(4,4,8,.72);padding:12px;}',
        '#nw-ov .nw-card{width:min(92vw,350px);background:linear-gradient(180deg,#1d1a26,#0f0d14);border:1px solid #4a3f5a;border-radius:16px;padding:14px;color:#e8e0d0;font-size:12.5px;display:flex;flex-direction:column;gap:11px;}',
        '#nw-ov h3{margin:0;font-size:15px;color:#ffe3f8;display:flex;align-items:center;gap:8px;}',
        '#nw-ov h3 button{margin-left:auto;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid #4a3f5a;color:#ddd;cursor:pointer;}',
        '#nw-ov canvas{display:block;margin:0 auto;background:#3a3550;border-radius:12px;image-rendering:pixelated;width:210px;}',
        '#nw-ov .nw-row{display:flex;align-items:center;gap:8px;}',
        '#nw-ov .nw-row label{width:34px;font-size:11.5px;color:#b9b0a0;flex:none;}',
        '#nw-ov input[type=text]{flex:1;min-width:0;padding:9px 10px;border-radius:10px;border:1px solid #4a3f5a;background:#100e15;color:#fff;font-size:16px;text-align:center;letter-spacing:4px;}',
        '#nw-ov .nw-chips{display:flex;gap:6px;flex:1;}',
        '#nw-ov .nw-chip{flex:1;height:38px;border-radius:10px;border:2px solid #4a3f5a;background:#f6f2ea;font-size:18px;font-weight:bold;cursor:pointer;}',
        '#nw-ov .nw-chip.on{border-color:#ffd479;box-shadow:0 0 0 2px #ffd479;}',
        '#nw-ov .nw-sw{display:flex;flex-wrap:wrap;gap:6px;flex:1;}',
        '#nw-ov .nw-sw button{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;}',
        '#nw-ov .nw-sw button.on{border-color:#fff;box-shadow:0 0 0 2px #d9a94a;}',
        '#nw-ov .nw-sw input[type=color]{width:30px;height:28px;border:none;background:none;padding:0;cursor:pointer;}',
        '#nw-ov .nw-all{align-self:flex-end;padding:5px 9px;border-radius:8px;border:1px solid #4a3f5a;background:#262030;color:#d8cfbf;font-size:11px;cursor:pointer;}',
        '#nw-ov .nw-sub{font-size:10.5px;color:#8f8778;text-align:center;}',
        '#nw-ov .nw-btns{display:flex;gap:8px;justify-content:center;}',
        '#nw-ov .nw-btns button{padding:9px 14px;border-radius:10px;border:1px solid #4a3f5a;background:#262030;color:#e8e0d0;font-weight:bold;cursor:pointer;}',
        '#nw-ov .nw-btns button.go{background:linear-gradient(145deg,#ff9fe9,#c85fb5);color:#2a0a24;border-color:#ffc6f2;}',
        // 말풍선 켜기 · 끄기
        '#nw-ov .nw-tg{display:flex;flex:1;border:1px solid #4a3f5a;border-radius:10px;overflow:hidden;}',
        '#nw-ov .nw-tg button{flex:1;padding:8px 0;border:none;background:#1a1622;color:#9a9182;font-weight:bold;font-size:12.5px;cursor:pointer;}',
        '#nw-ov .nw-tg button.on{background:linear-gradient(145deg,#ff9fe9,#c85fb5);color:#2a0a24;}',
        '#nw-ov .nw-card.off #nw-pv{opacity:.35;}'
    ].join('\n');
    document.head.appendChild(s);
})();
function wearing(fam) {
    const u = u_();
    if (!u || !u.dot) return false;
    try { const L = window.dotLook(u); return (L.tops || []).indexOf(fam) >= 0; } catch (e) { return false; }
}
let pv = null;            // { fam, t, cs: [글자마다], sel }
window.nuowTextOpen = function (fam) {
    const u = u_(); if (!u) return;
    if (!fam || !CFG[fam]) fam = FAMS.filter(wearing)[0] || 'nuow-friend';
    const cf = CFG[fam];
    if (!wearing(fam)) { try { showCustomAlert(cf.item + ' 악세를 하고 있을 때만 고를 수 있습니다.'); } catch (e) { } return; }
    const sp = specOf(cf, u.dot && u.dot[cf.key]);
    pv = { fam: fam, t: sp ? sp.t : '', cs: [], sel: 0 };
    for (let i = 0; i < cf.max; i++) pv.cs.push(sp ? (sp.cs[i] || sp.cs[sp.cs.length - 1]) : cf.defC);
    let ov = document.getElementById('nw-ov');
    if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'nw-ov';
    const isOff = !!(u.dot && u.dot[cf.offKey]);
    ov.innerHTML = '<div class="nw-card' + (isOff ? ' off' : '') + '"><h3>' + cf.title + '<button id="nw-x">✕</button></h3>'
        + '<div class="nw-row"><label>말풍선</label><div class="nw-tg" id="nw-tg"><button data-v="on"' + (isOff ? '' : ' class="on"') + '>켜기</button><button data-v="off"' + (isOff ? ' class="on"' : '') + '>끄기</button></div></div>'
        + '<canvas id="nw-pv" width="' + (cf.pv.w / 4) + '" height="' + (cf.pv.h / 4) + '"></canvas>'
        + '<div class="nw-row"><label>글씨</label><input type="text" id="nw-t" maxlength="' + cf.max + '" placeholder="' + (cf.max === 3 ? '세' : '두') + ' 글자" value="' + esc(pv.t) + '" autocomplete="off"></div>'
        + (cf.per ? '<div class="nw-row"><label>글자</label><div class="nw-chips" id="nw-chips"></div></div>' : '')
        + '<div class="nw-row"><label>색</label><div class="nw-sw">' + COLORS.map(function (c) { return '<button data-c="' + c + '" style="background:' + c + ';"></button>'; }).join('')
        + '<input type="color" id="nw-c" value="' + esc(pv.cs[0]) + '"></div></div>'
        + (cf.per ? '<button class="nw-all" id="nw-all">이 색으로 모두</button>' : '')
        + '<div class="nw-sub">' + cf.max + ' 글자까지' + (cf.per ? ' · 글자를 골라 색을 칠합니다' : '') + ' · 비우고 저장하면 원래 글씨로 돌아갑니다</div>'
        + '<div class="nw-btns"><button id="nw-def">원래대로</button><button class="go" id="nw-ok">저장</button></div></div>';
    document.body.appendChild(ov);
    ['pointerdown', 'keydown', 'keyup'].forEach(function (ev) { ov.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    const inp = ov.querySelector('#nw-t');
    let comp = false;
    inp.addEventListener('compositionstart', function () { comp = true; });
    inp.addEventListener('compositionend', function () { comp = false; fix(); });
    inp.addEventListener('input', function () { if (!comp) fix(); else { pv.t = cleanT(inp.value, cf.max); paintChips(); paintPv(); } });
    function fix() { const v = cleanT(inp.value, cf.max); if (inp.value !== v) inp.value = v; pv.t = v; paintChips(); paintPv(); }
    const setC = function (c) {
        if (cf.per) pv.cs[pv.sel] = c; else pv.cs = pv.cs.map(function () { return c; });
        ov.querySelector('#nw-c').value = c;
        markSw(); paintChips(); paintPv();
    };
    Array.prototype.forEach.call(ov.querySelectorAll('.nw-sw button'), function (b) { b.onclick = function () { setC(b.getAttribute('data-c')); }; });
    ov.querySelector('#nw-c').addEventListener('input', function () { setC(cleanC(this.value, cf.defC)); });
    if (cf.per) ov.querySelector('#nw-all').onclick = function () { const c = pv.cs[pv.sel]; pv.cs = pv.cs.map(function () { return c; }); paintChips(); paintPv(); };
    ov.querySelector('#nw-x').onclick = close;
    Array.prototype.forEach.call(ov.querySelectorAll('#nw-tg button'), function (b) { b.onclick = function () { setOff(b.getAttribute('data-v') === 'off'); }; });
    ov.querySelector('#nw-def').onclick = function () { save(null); };
    ov.querySelector('#nw-ok').onclick = function () {
        pv.t = cleanT(inp.value, cf.max);
        if (!pv.t) { save(null); return; }
        const n = chars(pv.t).length;
        save({ t: pv.t, c: cf.per ? pv.cs.slice(0, n) : pv.cs[0] });
    };
    paintChips(); markSw(); paintPv();
};
function close() { const ov = document.getElementById('nw-ov'); if (ov) ov.remove(); }
// 말풍선 켜기 · 끄기 — 누르는 즉시 저장 (창은 그대로)
function setOff(off) {
    const u = u_(); if (!u || !pv || !u.dot || typeof u.dot !== 'object') return;
    const cf = CFG[pv.fam];
    if (!!u.dot[cf.offKey] === !!off) return;
    if (off) u.dot[cf.offKey] = 1;
    else delete u.dot[cf.offKey];
    try { if (typeof saveFields === 'function') saveFields({ dot: 1 }); } catch (e) { }
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    const card = document.querySelector('#nw-ov .nw-card');
    if (card) card.classList.toggle('off', !!off);
    Array.prototype.forEach.call(document.querySelectorAll('#nw-tg button'), function (b) { b.classList.toggle('on', (b.getAttribute('data-v') === 'off') === !!off); });
}
function paintChips() {
    const box = document.getElementById('nw-chips'); if (!box || !pv) return;
    const cf = CFG[pv.fam], cs = chars(pv.t);
    let h = '';
    for (let i = 0; i < cf.max; i++) {
        const ch = cs[i] || '·';
        h += '<button class="nw-chip' + (i === pv.sel ? ' on' : '') + '" data-i="' + i + '" style="color:' + pv.cs[i] + ';">' + esc(ch) + '</button>';
    }
    box.innerHTML = h;
    Array.prototype.forEach.call(box.querySelectorAll('.nw-chip'), function (b) {
        b.onclick = function () { pv.sel = Number(b.getAttribute('data-i')); const c = document.getElementById('nw-c'); if (c) c.value = pv.cs[pv.sel]; paintChips(); markSw(); };
    });
}
function markSw() {
    if (!pv) return;
    const c = pv.cs[pv.sel] || pv.cs[0];
    Array.prototype.forEach.call(document.querySelectorAll('#nw-ov .nw-sw button'), function (b) { b.classList.toggle('on', b.getAttribute('data-c') === c); });
}
// 미리 보기 — 다 써진 칸(여섯째)의 말풍선 둘레
function paintPv() {
    const cv = document.getElementById('nw-pv'); if (!cv || !pv) return;
    const cf = CFG[pv.fam];
    const t = pv.t, n = chars(t).length;
    const cs = (cf.per ? pv.cs : pv.cs.map(function () { return pv.cs[0]; })).slice(0, Math.max(1, n));
    const want = pv.fam + '|' + t + '|' + cs.join(',');
    cv._want = want;
    loadImg(t ? baseUrl(cf) : origUrl(pv.fam)).then(function (im) {
        if (cv._want !== want) return;
        const s = im.naturalWidth / cf.SW;
        const tmp = document.createElement('canvas');
        tmp.width = Math.round(cf.pv.w * s); tmp.height = Math.round(cf.pv.h * s);
        const tg = tmp.getContext('2d');
        tg.imageSmoothingEnabled = false;
        tg.drawImage(im, (5 * cf.CW + cf.pv.x) * s, (cf.ROW * cf.CH + cf.pv.y) * s, cf.pv.w * s, cf.pv.h * s, 0, 0, cf.pv.w * s, cf.pv.h * s);
        if (t) {
            tg.save();
            tg.translate(-cf.pv.x * s, -(cf.pv.y + cf.ROW * cf.CH) * s);
            const st = strokesOf(cf, t);
            drawCell(tg, cf, s, 0, boardOf(st, cs, st.length), false);
            tg.restore();
        }
        const g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, cv.width, cv.height);
        g.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, cv.width, cv.height);
    }).catch(function () { });
}
function save(nw) {
    const u = u_(); if (!u || !pv) return;
    const cf = CFG[pv.fam];
    if (!u.dot || typeof u.dot !== 'object') { close(); return; }
    if (nw) u.dot[cf.key] = nw;
    else delete u.dot[cf.key];
    try { if (typeof saveFields === 'function') saveFields({ dot: 1 }); } catch (e) { }
    try { if (typeof window.plazaRedress === 'function') window.plazaRedress(); } catch (e) { }
    close();
    const ic = cf.title.split(' ')[0];
    try { if (typeof showCustomAlert === 'function') showCustomAlert(nw ? ic + ' 말풍선 글씨를 「' + nw.t + '」(으)로 바꿨습니다.' : ic + ' 말풍선 글씨를 원래대로 돌렸습니다.'); } catch (e) { }
}

// 시험 · 콘솔 — 다 써진 칸(여섯째) 하나를 그려 data 주소로 (바탕 그림 위에)
window.nuowTextCell = function (fam, t, cs, flip) {
    const cf = CFG[fam];
    return loadImg(baseUrl(cf)).then(function (im) {
        const s = im.naturalWidth / cf.SW;
        const cv = document.createElement('canvas');
        cv.width = Math.round(cf.CW * s); cv.height = Math.round(cf.CH * s);
        const g = cv.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.drawImage(im, 5 * cf.CW * s, cf.ROW * cf.CH * s, cf.CW * s, cf.CH * s, 0, 0, cf.CW * s, cf.CH * s);
        g.translate(-5 * cf.CW * s, -cf.ROW * cf.CH * s);
        const st = strokesOf(cf, t, flip ? -cf.rot : cf.rot);
        drawCell(g, cf, s, 5, boardOf(st, cs || [cf.defC, cf.defC, cf.defC], st.length), !!flip);
        return cv.toDataURL();
    });
};
window.nuowTextState = function () {
    const u = u_(), d = (u && u.dot) || {};
    FAMS.forEach(function (f) { console.log('[말풍선 글씨]', f, '· 하고 있음', wearing(f), '· 고른 것', JSON.stringify(d[CFG[f].key] || null), '· 말풍선', d[CFG[f].offKey] ? '끔' : '켬'); });
    console.log('  만든 장', made, '· 쟁여 둔 것', Object.keys(cache));
};
// 시험 · 콘솔 — 글씨를 판(그림 점)으로만 그려 본다
window.nuowTextCfg = CFG;          // 시험 · 콘솔 — 자리 · 기울기를 들여다본다
window.nuowTextBoard = function (fam, t, cs) { const cf = CFG[fam]; const st = strokesOf(cf, t); return boardOf(st, cs || [cf.defC, cf.defC, cf.defC], st.length); };
})();
