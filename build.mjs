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

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const CFG = JSON.parse(readFileSync('bundles.json', 'utf8'));
const OUT = CFG.out || 'b';

mkdirSync(OUT, { recursive: true });

// 지난번 묶음을 치운다 — 묶음 수가 줄었을 때 옛것이 남지 않도록
if (existsSync(OUT)) {
    for (const f of readdirSync(OUT)) {
        if (/^\d+\.js$/.test(f)) unlinkSync(join(OUT, f));
    }
}

let files = 0, bytes = 0;
const lines = [];

CFG.groups.forEach((group, i) => {
    const name = String(i + 1).padStart(2, '0') + '.js';
    const parts = [];

    parts.push('// ==========================================\n'
        + '// 묶음 ' + name + ' — ' + group.length + '개\n'
        + '// build.mjs 가 만든 것입니다. 여기를 고치지 말고 원본 파일을 고치세요.\n'
        + '// ==========================================\n');

    for (const src of group) {
        let txt;
        try { txt = readFileSync(src, 'utf8'); }
        catch (e) { throw new Error('없는 파일: ' + src); }

        txt = txt.replace(/^﻿/, '');          // BOM 제거 — 중간에 끼면 깨진다
        if (!txt.endsWith('\n')) txt += '\n';      // 줄 끝 주석이 다음 파일을 먹지 않게

        parts.push('\n// ---------- ' + src + ' ----------\n');
        parts.push(txt);
        parts.push(';\n');                          // 세미콜론 없이 끝난 파일 대비

        files++;
    }

    const body = parts.join('');
    writeFileSync(join(OUT, name), body);
    bytes += Buffer.byteLength(body);
    lines.push('  ' + OUT + '/' + name + '  ' + String(group.length).padStart(3) + '개  '
        + (Buffer.byteLength(body) / 1024).toFixed(1) + ' KB');
});

console.log('묶음 ' + CFG.groups.length + '개 · 원본 ' + files + '개 · '
    + (bytes / 1048576).toFixed(2) + ' MB');
lines.forEach(l => console.log(l));
console.log('요청 수: ' + (files + 1) + '번 → ' + (CFG.groups.length + 1) + '번');
