// ==========================================
// ★ js 파일 묶기
// ==========================================
//
// 왜 하는가
//   사원 한 명이 페이지를 한 번 열 때마다 js 파일 수만큼 요청이 나간다.
//   172개면 172번이다. Vercel 무료 한도(월 100만 요청)가 그래서 찼다.
//   순서 그대로 몇 덩어리로 이어 붙이면 요청이 8번으로 줄어든다.
//
// 어떻게 쓰는가
//   파일을 고친 뒤 이것 한 줄만 돌리면 된다.
//
//       node build.mjs
//
//   그러면 b/ 아래 묶음이 다시 만들어진다. 그걸 같이 커밋하면 끝.
//   Vercel 설정의 Build Command 에 node build.mjs 를 넣어 두면
//   커밋할 때마다 저절로 돌아서, 직접 돌릴 일도 없다.
//
// 무엇을 건드리지 않는가
//   원본 js 파일들은 그대로 둔다. 고치는 건 늘 원본 쪽이다.
//   index.html 도 건드리지 않는다. 이미 b/ 를 보도록 바꿔 두었다.
//   파일을 새로 넣거나 뺄 때만 아래 ORDER 를 손보면 된다.
//
// ★ 데이터를 덜 먹게 (2026-11-16 사용자 「데이터를 너무 많이 먹어서 덜 먹게 최적화좀 하자. 전체적으로.」)
//   ■ 전에는 — 묶음 하나(08.js)가 11 MB(압축 3 MB)였고, 올릴 때마다 안의 파일 하나만 바뀌어도 통째로 다시 받았다.
//     01.js 에는 올린 번호(__BUILD)가 박혀 있어 이것도 올릴 때마다 다시 받았다.
//   ■ 이제는 —
//     1. 묶음마다 원본을 몇 덩어리(b/c/NN-지문.js)로 나눈다. 이름에 내용의 지문이 들어가므로 안 바뀐 덩어리는 이름도 그대로이고,
//        vercel.json 이 b/c/ 를 「다시 묻지 않고 1년 동안 쓴다(immutable)」로 내보낸다 → 안 바뀐 덩어리는 다시 받지 않고 요청도 안 나간다.
//        나누는 자리는 파일 이름의 지문으로 정한다(파일을 더 넣어도 그 덩어리만 바뀐다) · 큰 파일(256 KB 넘는 것)은 혼자 한 덩어리.
//     2. b/01.js ~ b/08.js 는 작은 「불러오기」 파일이 된다 — 제 덩어리들을 순서대로 document.write 로 붙인다
//        (스크립트를 파서 자리에 그대로 끼우므로 실행 차례 · 한 화면 전역 이름이 전과 같다).
//        올린 번호(__BUILD)와 옷장 그림 목록(DOT2)도 이 작은 파일에 둔다.
//     3. 덩어리에서는 주석을 걷는다 (tools/acorn.mjs 로 읽어 주석 자리만 지운다 · 못 읽는 파일은 그대로) — 원본은 그대로다.
//   ■ 나눠도 되는가 — 한 묶음 안에서 앞 파일이 뒤 파일의 함수 선언을 끌어다 쓰는(호이스팅) 곳이 없는 것을 확인했다
//     (2026-11-16 · acorn 으로 전부 훑음 · window.이름 으로 쓰는 곳 포함 0 건). 새 파일도 늘 setInterval 로 기다리는 꼴을 지킨다.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

const CFG = JSON.parse(readFileSync('bundles.json', 'utf8'));
const OUT = CFG.out || 'b';
const CH = OUT + '/c';                     // 덩어리 — 이름에 내용 지문 · 오래 두고 쓴다 (vercel.json)
const BIG = 256 * 1024;                    // 이보다 큰 파일은 혼자 한 덩어리
const CUT = 10;                            // 파일 이름 지문 % CUT === 0 이면 그 앞에서 자른다 (덩어리마다 평균 열 개쯤)
const MAXC = 900 * 1024;                   // 덩어리가 이보다 커지면 자른다

mkdirSync(OUT, { recursive: true });
mkdirSync(CH, { recursive: true });

// 지난번 묶음을 치운다 — 묶음 수가 줄었을 때 옛것이 남지 않도록
if (existsSync(OUT)) {
    for (const f of readdirSync(OUT)) {
        if (/^\d+\.js$/.test(f)) unlinkSync(join(OUT, f));
    }
}
if (existsSync(CH)) {
    for (const f of readdirSync(CH)) {
        if (/\.js$/.test(f)) unlinkSync(join(CH, f));
    }
}

// 주석 걷기 — acorn 으로 읽어 주석 자리만 지운다 (줄바꿈은 남긴다 — 세미콜론 없는 줄이 붙지 않게). 못 읽으면 그대로.
let acorn = null;
try { acorn = await import('./tools/acorn.mjs'); } catch (e) { console.warn('  acorn 을 못 불러 주석을 그대로 둡니다:', e.message); }
let stripFail = 0, stripSaved = 0;
function strip(src, name) {
    if (!acorn) return src;
    const cm = [];
    try {
        acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true,
            onComment: function (block, text, s, e) { cm.push([s, e, block]); } });
    } catch (e) { stripFail++; console.warn('  주석을 못 걷음 (그대로):', name, e.message); return src; }
    let o = '', p = 0;
    for (const [s, e, b] of cm) {
        o += src.slice(p, s);
        const seg = src.slice(s, e);
        o += b ? (seg.indexOf('\n') >= 0 ? '\n' : ' ') : '';
        p = e;
    }
    o += src.slice(p);
    o = o.replace(/[ \t]+$/gm, '').replace(/\n{2,}/g, '\n');
    stripSaved += Buffer.byteLength(src) - Buffer.byteLength(o);
    return o;
}
function hashOf(s) { return createHash('sha1').update(s).digest('hex'); }

let files = 0, bytes = 0;
const lines = [];

// ★ 올린 번호 (2026-10-26) — 묶음 · sw.js · b/build.json 이 같은 번호를 쓴다.
//   켜 둔 화면이 묵은 묶음을 계속 돌리지 않게, update-check.js 가 b/build.json 을 보고 새로 연다.
const STAMP = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);

// ★ 옷장 그림 절반 크기(dot2/) — 원본과 지문이 맞는 것만 싣는다 (tools/dot2.py · 2026-10-24)
//   원본을 고치고 tools/dot2.py 를 안 돌렸으면 그 장은 빠지고, 화면은 원본(dot/)을 쓴다.
let dot2Line = 'window.DOT2 = {};\n';
try {
    const man = JSON.parse(readFileSync('dot2/manifest.json', 'utf8'));
    const ok = {};
    Object.keys(man).forEach((n) => {
        try {
            const h = createHash('sha1').update(readFileSync('dot/' + n + '.png')).digest('hex');
            if (h === man[n] && existsSync('dot2/' + n + '.png')) ok[n] = 1;
        } catch (e) { }
    });
    dot2Line = 'window.DOT2 = ' + JSON.stringify(ok) + ';\n';
    console.log('  dot2 — 절반 크기 ' + Object.keys(ok).length + '장 / 목록 ' + Object.keys(man).length + '장');
} catch (e) { console.warn('dot2 목록 없음 — 옷장 그림은 원본을 씁니다'); }

const CHUNKS = [];                         // 이번에 만든 덩어리 (sw.js 가 묵은 것을 지울 때 본다)
CFG.groups.forEach((group, i) => {
    const nn = String(i + 1).padStart(2, '0');
    const name = nn + '.js';

    // 원본을 읽어 덩어리로 나눈다
    const chunks = [];
    let cur = null;
    for (const src of group) {
        let txt;
        try { txt = readFileSync(src, 'utf8'); }
        catch (e) { throw new Error('없는 파일: ' + src); }

        txt = txt.replace(/^﻿/, '');          // BOM 제거 — 중간에 끼면 깨진다
        txt = strip(txt, src);
        if (!txt.endsWith('\n')) txt += '\n';      // 줄 끝 주석이 다음 파일을 먹지 않게
        const piece = '\n// ---------- ' + src + ' ----------\n' + txt + ';\n';   // 세미콜론 없이 끝난 파일 대비
        const size = Buffer.byteLength(piece);
        const big = size > BIG;
        const cutHere = parseInt(hashOf(src).slice(0, 8), 16) % CUT === 0;
        if (!cur || big || cur.big || cutHere || cur.size + size > MAXC) {
            cur = { parts: [], size: 0, big: big, files: [] };
            chunks.push(cur);
        }
        cur.parts.push(piece); cur.size += size; cur.files.push(src);
        files++;
    }

    const urls = [];
    chunks.forEach((c) => {
        const body = '// 묶음 ' + name + ' 의 덩어리 — build.mjs 가 만든 것입니다. 원본 파일을 고치세요.\n' + c.parts.join('');
        const fn = nn + '-' + hashOf(body).slice(0, 12) + '.js';
        writeFileSync(join(CH, fn), body);
        urls.push(CH + '/' + fn);
        CHUNKS.push(CH + '/' + fn);
        bytes += Buffer.byteLength(body);
    });

    // 불러오기 — 제 덩어리들을 이 자리에 순서대로 끼운다
    //   덩어리를 못 받으면(새로 올리는 그 몇 초 사이 옛 화면이 옛 덩어리를 찾는 경우) 한 번만 새로 연다
    const loader = '// ==========================================\n'
        + '// 묶음 ' + name + ' — ' + group.length + '개 · 덩어리 ' + urls.length + '개\n'
        + '// build.mjs 가 만든 것입니다. 여기를 고치지 말고 원본 파일을 고치세요.\n'
        + '// ==========================================\n'
        + (i === 0 ? dot2Line + "window.__BUILD = '" + STAMP + "';\n"
            + 'window.__bErr = function () { try { var k = "bErrAt", t = +sessionStorage.getItem(k) || 0; if (Date.now() - t > 60000) { sessionStorage.setItem(k, String(Date.now())); location.reload(); } } catch (e) { } };\n' : '')
        + 'document.write(' + JSON.stringify(urls.map((u) => '<script src="' + u + '" onerror="window.__bErr&&__bErr()"></scr' + 'ipt>').join('')) + ');\n';
    writeFileSync(join(OUT, name), loader);
    lines.push('  ' + OUT + '/' + name + '  ' + String(group.length).padStart(3) + '개  덩어리 ' + String(urls.length).padStart(2) + '개  '
        + (chunks.reduce((a, c) => a + c.size, 0) / 1024).toFixed(1) + ' KB');
});

// ==========================================
// 서비스 워커에 새 번호를 찍는다
// ==========================================
//
// 묶음이 바뀌었는데 휴대폰이 묵은 것을 들고 있으면, 파일 여덟 개가
// 서로 안 맞아 「조용히 안 되는」 고장이 난다. 올릴 때마다 번호를
// 바꿔 두면 서비스 워커가 들고 있던 것을 통째로 버린다.
try {
    const swPath = 'sw.js';
    let sw = readFileSync(swPath, 'utf8');
    const stamp = STAMP;
    let next = sw.replace(/const BUILD = '[^']*';/, "const BUILD = '" + stamp + "';");
    // 이번 덩어리 목록 — 서비스 워커가 목록에 없는 묵은 덩어리를 들고 있지 않게
    next = next.replace(/const CHUNKS = \[[^\]]*\];/, 'const CHUNKS = ' + JSON.stringify(CHUNKS.map((u) => './' + u)) + ';');
    if (next !== sw) { writeFileSync(swPath, next); console.log('  sw.js 번호: ' + stamp); }
} catch (e) { console.warn('sw.js 번호를 못 찍었습니다:', e.message); }
try { writeFileSync(join(OUT, 'build.json'), JSON.stringify({ b: STAMP }) + '\n'); } catch (e) { console.warn('build.json 을 못 적었습니다:', e.message); }

console.log('묶음 ' + CFG.groups.length + '개 · 원본 ' + files + '개 · '
    + (bytes / 1048576).toFixed(2) + ' MB');
lines.forEach(l => console.log(l));
console.log('덩어리 ' + CHUNKS.length + '개 (안 바뀐 것은 다시 받지 않는다) · 주석 걷음 ' + (stripSaved / 1048576).toFixed(2) + ' MB' + (stripFail ? ' · 못 읽은 파일 ' + stripFail : ''));
