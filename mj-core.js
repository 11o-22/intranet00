// ==========================================
// ★ 🀄 리치 마작 — 채점기 (순수 계산만)
// bundles.json 마지막 묶음, save-merge.js 앞
// ==========================================
//
// 이 파일에는 화면도 서버도 없다. 패를 넣으면 역·부·점수를 돌려주는 셈만 있다.
// 그래야 수만 판을 돌려 맞는지 볼 수 있다. 진행과 화면은 다른 파일이다.
//
// ■ 패 번호 (0~33)
//     0~8    만수 1m~9m
//     9~17   통수 1p~9p
//     18~26  삭수 1s~9s
//     27~30  동 남 서 북
//     31~33  백 발 중
//
// ■ 쓰는 법
//
//     mjScore({
//         hand:  [패…],              // 손패 (화료패 뺀 것)
//         melds: [{ type:'chi'|'pon'|'minkan'|'ankan', tiles:[…] }],
//         win:   패,                 // 화료패
//         tsumo: true/false,
//         seat:  27,                 // 자풍 (동남서북)
//         round: 27,                 // 장풍
//         riichi:…, ippatsu:…, doubleRiichi:…, chankan:…, rinshan:…,
//         haitei:…, houtei:…, tenhou:…, chiihou:…,
//         doraInd: [표시패…], uraInd: [표시패…], aka: 적도라 장수,
//         players: 2|3|4
//     })
//
//   돌아오는 것
//     { ok, yaku:[{n,han}], han, fu, points, name, pay:{…}, yakuman }
//
// ■ 어느 규칙을 따르나 (MJ_RULE 에서 바꾼다)
//     연풍패 작두          2부   (천봉식. 4부 쓰는 자리도 있다)
//     절상만관             안 씀
//     더블 역만            안 씀 — 다른 역만끼리는 합산한다
//     3인 마작             북패와 만수 2~8 을 뺀다
//
// ■ 콘솔
//     mjTest()        손으로 확인한 패 표를 돌린다
//     mjFuzz(5000)    무작위 화료형을 돌려 터지는지 본다

window.MJ_RULE = {
    doubleWindPairFu: 2,      // 연풍패 작두 부 (2 또는 4)
    roundUpMangan: false,     // 절상만관 (4판30부·3판60부를 만관으로)
    doubleYakuman: false,     // 국사13면·순정구련·사암각단기를 2배로
    kuitanAri: true           // 먹탕 인정
};

(function mjCore() {

const R = window.MJ_RULE;

// ==========================================
// 패 다루기
// ==========================================
const MAN = 0, PIN = 9, SOU = 18, HONOR = 27;
const EAST = 27, SOUTH = 28, WEST = 29, NORTH = 30;
const HAKU = 31, HATSU = 32, CHUN = 33;

function isHonor(t) { return t >= HONOR; }
function isWind(t) { return t >= EAST && t <= NORTH; }
function isDragon(t) { return t >= HAKU && t <= CHUN; }
function suitOf(t) { return isHonor(t) ? 3 : Math.floor(t / 9); }      // 0만 1통 2삭 3자
function rankOf(t) { return isHonor(t) ? 0 : (t % 9) + 1; }            // 1~9, 자패는 0
// 요구패 — 1·9 와 자패
function isTerminal(t) { return !isHonor(t) && (rankOf(t) === 1 || rankOf(t) === 9); }
function isYaochu(t) { return isHonor(t) || isTerminal(t); }
// 녹일색에 쓰이는 패 — 삭수 2·3·4·6·8 과 발
function isGreen(t) { return [SOU + 1, SOU + 2, SOU + 3, SOU + 5, SOU + 7, HATSU].indexOf(t) >= 0; }

const NAMES = (function () {
    const out = [];
    ['m', 'p', 's'].forEach(function (s, i) {
        for (let n = 1; n <= 9; n++) out[i * 9 + n - 1] = n + s;
    });
    ['동', '남', '서', '북', '백', '발', '중'].forEach(function (n, i) { out[HONOR + i] = n; });
    return out;
})();
function tileName(t) { return NAMES[t] || ('?' + t); }
window.mjTileName = tileName;

// 유니코드 마작 글자
const GLYPH = (function () {
    const out = [];
    for (let n = 0; n < 9; n++) out[MAN + n] = String.fromCodePoint(0x1F007 + n);   // 🀇~🀏
    for (let n = 0; n < 9; n++) out[PIN + n] = String.fromCodePoint(0x1F019 + n);   // 🀙~🀡
    for (let n = 0; n < 9; n++) out[SOU + n] = String.fromCodePoint(0x1F010 + n);   // 🀐~🀘
    [0x1F000, 0x1F001, 0x1F002, 0x1F003].forEach(function (c, i) { out[EAST + i] = String.fromCodePoint(c); });
    out[HAKU] = String.fromCodePoint(0x1F006);
    out[HATSU] = String.fromCodePoint(0x1F005);
    out[CHUN] = String.fromCodePoint(0x1F004);
    return out;
})();
function tileGlyph(t) { return GLYPH[t] || '?'; }
window.mjTileGlyph = tileGlyph;

// 패 세기
function toCounts(list) {
    const c = new Array(34).fill(0);
    (list || []).forEach(function (t) { if (t >= 0 && t < 34) c[t]++; });
    return c;
}
function fromCounts(c) {
    const out = [];
    for (let t = 0; t < 34; t++) for (let i = 0; i < c[t]; i++) out.push(t);
    return out;
}

// 도라 표시패 → 도라
function doraOf(ind) {
    if (isHonor(ind)) {
        if (isWind(ind)) return EAST + ((ind - EAST + 1) % 4);
        return HAKU + ((ind - HAKU + 1) % 3);
    }
    const s = suitOf(ind), r = rankOf(ind);
    return s * 9 + (r % 9);          // 9 다음은 1
}
window.mjDoraOf = doraOf;

// 3인 마작에서 쓰는 패 (북과 만수 2~8 을 뺀다)
function tileSet(players) {
    const out = [];
    for (let t = 0; t < 34; t++) {
        if (players === 3) {
            if (t === NORTH) continue;
            if (t > MAN && t < MAN + 8) continue;      // 2m~8m
        }
        out.push(t);
    }
    return out;
}
window.mjTileSet = tileSet;

// 산 — 같은 패 4장씩
function buildWall(players) {
    const out = [];
    tileSet(players).forEach(function (t) { for (let i = 0; i < 4; i++) out.push(t); });
    return out;
}
window.mjBuildWall = buildWall;

// ==========================================
// 화료형 가르기
// ==========================================
//
// 네 면자와 작두 하나로 가르는 모든 방법을 다 찾는다. 같은 패라도 가르는 법이
// 여럿이면 (일배구냐 삼색이냐) 점수가 달라지므로, 나중에 제일 높은 것을 고른다.
//
// set = { k:'run'|'tri', t:머리패, open:드러났나, kan:깡인가 }
function decompose(counts) {
    const out = [];
    for (let p = 0; p < 34; p++) {
        if (counts[p] < 2) continue;
        counts[p] -= 2;
        const sets = [];
        if (walk(counts, 0, sets)) { /* walk 가 out 에 담는다 */ }
        collect(counts, 0, [], out, p);
        counts[p] += 2;
    }
    return out;
}
function walk() { return false; }      // (아래 collect 로 대신한다)

function collect(c, from, sets, out, pair) {
    let i = from;
    while (i < 34 && c[i] === 0) i++;
    if (i === 34) { out.push({ pair: pair, sets: sets.slice() }); return; }

    // 각자
    if (c[i] >= 3) {
        c[i] -= 3;
        sets.push({ k: 'tri', t: i, open: false, kan: false });
        collect(c, i, sets, out, pair);
        sets.pop();
        c[i] += 3;
    }
    // 순자
    if (!isHonor(i) && rankOf(i) <= 7 && c[i + 1] > 0 && c[i + 2] > 0) {
        c[i]--; c[i + 1]--; c[i + 2]--;
        sets.push({ k: 'run', t: i, open: false, kan: false });
        collect(c, i, sets, out, pair);
        sets.pop();
        c[i]++; c[i + 1]++; c[i + 2]++;
    }
}

// 치토이츠 — 서로 다른 일곱 쌍
function isChiitoi(counts) {
    let pairs = 0;
    for (let t = 0; t < 34; t++) {
        if (counts[t] === 0) continue;
        if (counts[t] !== 2) return false;
        pairs++;
    }
    return pairs === 7;
}
// 국사무쌍
const KOKUSHI = [MAN, MAN + 8, PIN, PIN + 8, SOU, SOU + 8, EAST, SOUTH, WEST, NORTH, HAKU, HATSU, CHUN];
function isKokushi(counts) {
    let pair = -1;
    for (let t = 0; t < 34; t++) {
        if (counts[t] === 0) continue;
        if (KOKUSHI.indexOf(t) < 0) return false;
        if (counts[t] === 2) { if (pair >= 0) return false; pair = t; }
        else if (counts[t] !== 1) return false;
    }
    return pair >= 0 && KOKUSHI.every(function (t) { return counts[t] >= 1; });
}
function kokushi13(counts) {
    // 열세 장이 전부 하나씩이면 13면 대기였다
    return KOKUSHI.every(function (t) { return counts[t] >= 1; });
}

// 화료형인가 (면자 수가 모자라도 됨 — 깡이 있으면 손패가 줄어든다)
function winnable(counts, needSets) {
    const all = decompose(counts.slice());
    return all.filter(function (d) { return d.sets.length === needSets; });
}
window.mjDecompose = function (list, needSets) {
    return winnable(toCounts(list), needSets == null ? 4 : needSets);
};

// ==========================================
// 샨텐 — 화료까지 몇 걸음인가 (울음 판정·AI 에 쓴다)
// ==========================================
function shantenStd(c, melds) {
    let best = 8;
    const need = 4 - melds;
    function go(i, sets, parts, pair) {
        if (i >= 34) {
            const s = sets + melds;
            const p = Math.min(parts, 4 - s);
            best = Math.min(best, 8 - 2 * s - p - (pair ? 1 : 0));
            return;
        }
        if (c[i] === 0) { go(i + 1, sets, parts, pair); return; }
        // 각자
        if (c[i] >= 3) { c[i] -= 3; go(i, sets + 1, parts, pair); c[i] += 3; }
        // 순자
        if (!isHonor(i) && rankOf(i) <= 7 && c[i + 1] && c[i + 2]) {
            c[i]--; c[i + 1]--; c[i + 2]--; go(i, sets + 1, parts, pair); c[i]++; c[i + 1]++; c[i + 2]++;
        }
        // 작두
        if (!pair && c[i] >= 2) { c[i] -= 2; go(i, sets, parts, true); c[i] += 2; }
        // 대기 조각
        if (c[i] >= 2) { c[i] -= 2; go(i, sets, parts + 1, pair); c[i] += 2; }
        if (!isHonor(i) && rankOf(i) <= 8 && c[i + 1]) { c[i]--; c[i + 1]--; go(i, sets, parts + 1, pair); c[i]++; c[i + 1]++; }
        if (!isHonor(i) && rankOf(i) <= 7 && c[i + 2]) { c[i]--; c[i + 2]--; go(i, sets, parts + 1, pair); c[i]++; c[i + 2]++; }
        c[i]--; go(i, sets, parts, pair); c[i]++;      // 그냥 버린다
    }
    go(0, 0, 0, false);
    return best;
}
function shanten(list, melds) {
    const c = toCounts(list);
    const m = melds || 0;
    let best = shantenStd(c.slice(), m);
    if (m === 0) {
        // 치토이츠
        let pairs = 0, kinds = 0;
        for (let t = 0; t < 34; t++) { if (c[t] >= 2) pairs++; if (c[t] >= 1) kinds++; }
        best = Math.min(best, 6 - pairs + Math.max(0, 7 - kinds));
        // 국사
        let have = 0, hasPair = false;
        KOKUSHI.forEach(function (t) { if (c[t] >= 1) have++; if (c[t] >= 2) hasPair = true; });
        best = Math.min(best, 13 - have - (hasPair ? 1 : 0));
    }
    return best;
}
window.mjShanten = shanten;

// 기다리는 패 — 한 장 보태면 화료가 되는 패들
function waits(list, melds) {
    const out = [];
    for (let t = 0; t < 34; t++) {
        const c = toCounts(list);
        if (c[t] >= 4) continue;
        if (shanten(list.concat([t]), melds || 0) === -1) out.push(t);
    }
    return out;
}
window.mjWaits = waits;

// ==========================================
// 역
// ==========================================
function sameRun(a, b) { return a.k === 'run' && b.k === 'run' && a.t === b.t; }

function yakuOf(ctx, dec) {
    const Y = [];
    const add = function (n, han) { Y.push({ n: n, han: han }); };

    const closed = ctx.closed;                 // 문전인가
    const sets = dec.sets;                     // 면자 다섯 (작두 제외)
    const pair = dec.pair;
    const allTiles = ctx.allTiles;             // 깡 포함 전체 패
    const runs = sets.filter(function (s) { return s.k === 'run'; });
    const tris = sets.filter(function (s) { return s.k === 'tri'; });

    // --- 상황역 ---
    if (ctx.riichi && !ctx.doubleRiichi) add('리치', 1);
    if (ctx.doubleRiichi) add('더블 리치', 2);
    if (ctx.ippatsu) add('일발', 1);
    if (ctx.tsumo && closed) add('멘젠 쯔모', 1);
    if (ctx.chankan) add('창깡', 1);
    if (ctx.rinshan) add('영상개화', 1);
    if (ctx.haitei) add('해저로월', 1);
    if (ctx.houtei) add('하저로어', 1);

    // --- 핑후 ---
    if (closed && runs.length === 4 && !isDragon(pair) && pair !== ctx.seat && pair !== ctx.round) {
        // 양면 대기여야 한다
        const w = ctx.win;
        const ok = runs.some(function (s) {
            if (s.t === w && rankOf(w) !== 7) return true;              // 아래쪽 양면
            if (s.t + 2 === w && rankOf(s.t) !== 1) return true;        // 위쪽 양면
            return false;
        });
        if (ok) add('핑후', 1);
    }

    // --- 탕야오 ---
    if (allTiles.every(function (t) { return !isYaochu(t); })) {
        if (closed || R.kuitanAri) add('탕야오', 1);
    }

    // --- 역패 ---
    tris.forEach(function (s) {
        if (isDragon(s.t)) add('역패 ' + tileName(s.t), 1);
        else if (s.t === ctx.round) add('장풍 ' + tileName(s.t), 1);
        if (s.t === ctx.seat && isWind(s.t)) add('자풍 ' + tileName(s.t), 1);
    });

    // --- 일배구 · 량페코 ---
    if (closed) {
        let pairsOfRuns = 0;
        const used = [];
        for (let i = 0; i < runs.length; i++) {
            if (used[i]) continue;
            for (let j = i + 1; j < runs.length; j++) {
                if (used[j]) continue;
                if (sameRun(runs[i], runs[j])) { used[i] = used[j] = true; pairsOfRuns++; break; }
            }
        }
        if (pairsOfRuns === 2) add('량페코', 3);
        else if (pairsOfRuns === 1) add('일배구', 1);
    }

    // --- 삼색동순 ---
    (function () {
        for (let r = 0; r <= 6; r++) {
            const need = [MAN + r, PIN + r, SOU + r];
            if (need.every(function (t) { return runs.some(function (s) { return s.t === t; }); })) {
                add('삼색동순', closed ? 2 : 1); return;
            }
        }
    })();

    // --- 일기통관 ---
    (function () {
        for (let s = 0; s < 3; s++) {
            const need = [s * 9, s * 9 + 3, s * 9 + 6];
            if (need.every(function (t) { return runs.some(function (x) { return x.t === t; }); })) {
                add('일기통관', closed ? 2 : 1); return;
            }
        }
    })();

    // --- 삼색동각 ---
    (function () {
        for (let r = 0; r < 9; r++) {
            const need = [MAN + r, PIN + r, SOU + r];
            if (need.every(function (t) { return tris.some(function (s) { return s.t === t; }); })) {
                add('삼색동각', 2); return;
            }
        }
    })();

    // --- 대기 · 찬타 묶음 ---
    const blocks = sets.concat([{ k: 'tri', t: pair }]);
    const allYaochuBlock = blocks.every(function (s) {
        if (s.k === 'run') return isTerminal(s.t) || isTerminal(s.t + 2);
        return isYaochu(s.t);
    });
    const hasHonorBlock = blocks.some(function (s) { return s.k === 'tri' && isHonor(s.t); });
    const allTerminalOnly = blocks.every(function (s) { return s.k === 'tri' && isTerminal(s.t); });

    if (runs.length > 0 && allYaochuBlock) {
        if (hasHonorBlock) add('찬타', closed ? 2 : 1);
        else add('준찬타', closed ? 3 : 2);
    }

    // --- 토이토이 · 혼노두 ---
    //   각자만으로 이루어지면 토이토이. 거기에 전부 요구패면 혼노두가 겹친다.
    //   (혼노두는 토이토이와 함께 센다 — 청노두는 역만이라 아래에서 따로 본다)
    if (runs.length === 0 && !allTerminalOnly) {
        add('토이토이', 2);
        if (allYaochuBlock) add('혼노두', 2);
    }

    // --- 산안커 ---
    (function () {
        let n = 0;
        sets.forEach(function (s) {
            if (s.k !== 'tri') return;
            if (s.open) return;
            // 론으로 완성된 각자는 명각으로 본다
            if (!ctx.tsumo && s.t === ctx.win && !s.kan && s._winHere) return;
            n++;
        });
        if (n === 4) add('사암각', 13);
        else if (n === 3) add('산안커', 2);
    })();

    // --- 깡 ---
    (function () {
        const kans = ctx.melds.filter(function (m) { return m.type === 'ankan' || m.type === 'minkan'; }).length;
        if (kans === 4) add('사깡자', 13);
        else if (kans === 3) add('삼깡자', 2);
    })();

    // --- 삼원패 ---
    (function () {
        let n = 0, pairIsDragon = isDragon(pair);
        [HAKU, HATSU, CHUN].forEach(function (d) {
            if (sets.some(function (s) { return s.k === 'tri' && s.t === d; })) n++;
        });
        if (n === 3) add('대삼원', 13);
        else if (n === 2 && pairIsDragon) add('소삼원', 2);
    })();

    // --- 사희 ---
    (function () {
        let n = 0;
        [EAST, SOUTH, WEST, NORTH].forEach(function (w) {
            if (sets.some(function (s) { return s.k === 'tri' && s.t === w; })) n++;
        });
        if (n === 4) add('대사희', 13);
        else if (n === 3 && isWind(pair)) add('소사희', 13);
    })();

    // --- 색 ---
    (function () {
        const suits = {};
        let honor = false;
        allTiles.forEach(function (t) { if (isHonor(t)) honor = true; else suits[suitOf(t)] = true; });
        const kinds = Object.keys(suits).length;
        if (kinds === 1 && !honor) add('청일색', closed ? 6 : 5);
        else if (kinds === 1 && honor) add('혼일색', closed ? 3 : 2);
        else if (kinds === 0 && honor) add('자일색', 13);
    })();

    // --- 청노두 ---
    if (allTiles.every(function (t) { return isTerminal(t); })) add('청노두', 13);
    // --- 녹일색 ---
    if (allTiles.every(function (t) { return isGreen(t); })) add('녹일색', 13);

    // --- 구련보등 ---
    if (closed && (function () {
        const c = toCounts(allTiles);
        let s = -1, honor = false;
        allTiles.forEach(function (t) { if (isHonor(t)) honor = true; else if (s < 0) s = suitOf(t); else if (suitOf(t) !== s) s = -2; });
        if (honor || s < 0) return false;
        const base = s * 9;
        for (let r = 0; r < 9; r++) {
            const need = (r === 0 || r === 8) ? 3 : 1;
            if (c[base + r] < need) return false;
        }
        let total = 0;
        for (let r = 0; r < 9; r++) total += c[base + r];
        return total === 14;
    })()) add('구련보등', 13);

    // --- 천화 · 지화 ---
    if (ctx.tenhou) add('천화', 13);
    if (ctx.chiihou) add('지화', 13);

    return Y;
}

// ==========================================
// 부
// ==========================================
function fuOf(ctx, dec) {
    if (ctx.chiitoi) return 25;

    let fu = 20;
    if (ctx.closed && !ctx.tsumo) fu += 10;          // 멘젠 론

    const pair = dec.pair;
    if (isDragon(pair)) fu += 2;
    if (pair === ctx.round) fu += R.doubleWindPairFu === 4 && pair === ctx.seat ? 4 : 2;
    else if (pair === ctx.seat && isWind(pair)) fu += 2;
    if (R.doubleWindPairFu === 2 && pair === ctx.round && pair === ctx.seat) fu += 0;  // 이미 2부

    dec.sets.forEach(function (s) {
        if (s.k === 'run') return;
        const y = isYaochu(s.t) ? 2 : 1;
        let base;
        if (s.kan) base = s.open ? 8 : 16;
        else base = s.open ? 2 : 4;
        // 론으로 완성된 각자는 명각으로 본다
        if (!s.kan && !s.open && !ctx.tsumo && s._winHere) base = 2;
        fu += base * y;
    });

    // 대기
    const w = ctx.win;
    let waitFu = 0;
    if (pair === w && dec._pairWait) waitFu = 2;                      // 단기
    dec.sets.forEach(function (s) {
        if (!s._winHere) return;
        if (s.k === 'tri') return;
        if (s.t + 1 === w) waitFu = 2;                                // 칸찬
        else if ((s.t === w && rankOf(w) === 7) || (s.t + 2 === w && rankOf(s.t) === 1)) waitFu = 2;  // 펜찬
    });
    fu += waitFu;

    if (ctx.tsumo) fu += 2;

    // 핑후는 고정
    if (ctx.pinfu) return ctx.tsumo ? 20 : 30;
    // 멘젠이 아니고 20부면 꼬박 30부 (쿠이핑후)
    if (!ctx.closed && fu === 20) fu = 30;

    return Math.ceil(fu / 10) * 10;
}

// ==========================================
// 점수표
// ==========================================
function limitName(han, base) {
    if (han >= 13) return { n: '역만', base: 8000 };
    if (han >= 11) return { n: '삼배만', base: 6000 };
    if (han >= 8) return { n: '배만', base: 4000 };
    if (han >= 6) return { n: '하네만', base: 3000 };
    if (han === 5) return { n: '만관', base: 2000 };
    if (base > 2000) return { n: '만관', base: 2000 };
    if (R.roundUpMangan && ((han === 4 && base === 1920) || (han === 3 && base === 1920))) {
        return { n: '만관', base: 2000 };
    }
    return { n: '', base: base };
}
function up100(n) { return Math.ceil(n / 100) * 100; }

function payOf(han, fu, dealer, tsumo, yakuman) {
    let base;
    if (yakuman > 0) base = 8000 * yakuman;
    else base = Math.min(fu * Math.pow(2, 2 + han), 1e9);
    const lim = yakuman > 0 ? { n: yakuman > 1 ? (yakuman + '배 역만') : '역만', base: base } : limitName(han, base);
    base = lim.base;

    if (tsumo) {
        if (dealer) {
            const each = up100(base * 2);
            return { name: lim.n, total: each * 3, each: each, from: null, label: each + ' 올' };
        }
        const ko = up100(base), oya = up100(base * 2);
        return { name: lim.n, total: ko * 2 + oya, ko: ko, oya: oya, label: ko + '/' + oya };
    }
    const t = up100(base * (dealer ? 6 : 4));
    return { name: lim.n, total: t, ron: t, label: '' + t };
}
// 점수표 — 화면과 검사에서 같이 쓴다
window.mjPay = function (han, fu, dealer, tsumo, yakuman) {
    return payOf(han, fu, !!dealer, !!tsumo, yakuman || 0);
};

// ==========================================
// 채점 — 이 파일의 얼굴
// ==========================================
function score(o) {
    const melds = o.melds || [];
    const hand = (o.hand || []).slice();
    const win = o.win;
    const tsumo = !!o.tsumo;
    const seat = o.seat == null ? EAST : o.seat;
    const round = o.round == null ? EAST : o.round;
    const dealer = (seat === EAST);
    const closed = melds.every(function (m) { return m.type === 'ankan'; });

    const all = hand.concat([win]);
    const meldTiles = [];
    melds.forEach(function (m) { (m.tiles || []).forEach(function (t) { meldTiles.push(t); }); });
    const allTiles = all.concat(meldTiles);

    const counts = toCounts(all);
    const needSets = 4 - melds.length;

    const ctx = {
        closed: closed, tsumo: tsumo, win: win, seat: seat, round: round,
        riichi: !!o.riichi, ippatsu: !!o.ippatsu, doubleRiichi: !!o.doubleRiichi,
        chankan: !!o.chankan, rinshan: !!o.rinshan, haitei: !!o.haitei, houtei: !!o.houtei,
        tenhou: !!o.tenhou, chiihou: !!o.chiihou,
        melds: melds, allTiles: allTiles, chiitoi: false, pinfu: false
    };

    const tries = [];

    // 국사무쌍
    if (melds.length === 0 && isKokushi(counts)) {
        const before = toCounts(hand);
        const thirteen = kokushi13(before) && KOKUSHI.every(function (t) { return before[t] === 1; });
        tries.push({ kind: 'kokushi', yaku: [{ n: thirteen ? '국사무쌍 13면' : '국사무쌍', han: 13 }],
                     fu: 25, yakuman: (thirteen && R.doubleYakuman) ? 2 : 1 });
    }
    // 치토이츠
    if (melds.length === 0 && isChiitoi(counts)) {
        const c2 = { closed: true };
        const y = yakuOf(Object.assign({}, ctx, { chiitoi: true }), { pair: -1, sets: [] })
            .filter(function (x) { return ['핑후', '일배구', '량페코', '삼색동순', '일기통관', '삼색동각',
                                           '토이토이', '산안커', '찬타', '준찬타', '혼노두'].indexOf(x.n) < 0; });
        y.push({ n: '치토이츠', han: 2 });
        tries.push({ kind: 'chiitoi', yaku: y, fu: 25, yakuman: 0 });
    }

    // 보통 형
    const decs = winnable(counts, needSets);
    decs.forEach(function (d) {
        // 드러난 면자를 합친다
        const sets = d.sets.map(function (s) { return { k: s.k, t: s.t, open: false, kan: false }; });
        melds.forEach(function (m) {
            if (m.type === 'chi') sets.push({ k: 'run', t: Math.min.apply(null, m.tiles), open: true, kan: false });
            else if (m.type === 'pon') sets.push({ k: 'tri', t: m.tiles[0], open: true, kan: false });
            else if (m.type === 'minkan') sets.push({ k: 'tri', t: m.tiles[0], open: true, kan: true });
            else if (m.type === 'ankan') sets.push({ k: 'tri', t: m.tiles[0], open: false, kan: true });
        });

        // 화료패가 어느 면자에 들어갔는지 — 부와 산안커에 쓴다
        const marks = [];
        d.sets.forEach(function (s, i) {
            if (s.k === 'tri' && s.t === win) marks.push(i);
            else if (s.k === 'run' && (s.t === win || s.t + 1 === win || s.t + 2 === win)) marks.push(i);
        });
        const pairWait = (d.pair === win);
        const spots = marks.length ? marks : (pairWait ? [-1] : []);

        spots.forEach(function (mi) {
            const copy = sets.map(function (s, i) {
                return { k: s.k, t: s.t, open: s.open, kan: s.kan, _winHere: (i === mi) };
            });
            const dd = { pair: d.pair, sets: copy, _pairWait: (mi === -1) };
            const c3 = Object.assign({}, ctx);
            // 핑후 여부를 먼저 재서 부에 넘긴다
            const yy = yakuOf(c3, dd);
            c3.pinfu = yy.some(function (x) { return x.n === '핑후'; });
            const fu = fuOf(c3, dd);
            tries.push({ kind: 'std', yaku: yy, fu: fu, yakuman: 0 });
        });
    });

    if (!tries.length) return { ok: false, why: '화료형이 아닙니다.' };

    // 도라 — 역이 하나라도 있어야 센다
    const doraList = (o.doraInd || []).map(doraOf);
    const uraList = (o.riichi ? (o.uraInd || []) : []).map(doraOf);
    let doraN = 0;
    allTiles.forEach(function (t) {
        doraList.forEach(function (d) { if (d === t) doraN++; });
        uraList.forEach(function (d) { if (d === t) doraN++; });
    });
    doraN += (o.aka || 0);

    // 제일 높은 것을 고른다
    let best = null;
    tries.forEach(function (t) {
        const ym = t.yaku.filter(function (x) { return x.han >= 13; });
        const yakuman = t.yakuman || (ym.length ? ym.length : 0);
        let yaku, han;
        if (yakuman > 0) {
            yaku = ym.length ? ym : t.yaku;
            han = 13 * yakuman;
        } else {
            yaku = t.yaku.slice();
            han = yaku.reduce(function (a, x) { return a + x.han; }, 0);
            if (han === 0) return;                       // 역 없음 — 화료 불가
            if (doraN) { yaku = yaku.concat([{ n: '도라 ' + doraN, han: doraN }]); han += doraN; }
        }
        const pay = payOf(han, t.fu, dealer, tsumo, yakuman);
        const cand = { ok: true, kind: t.kind, yaku: yaku, han: han, fu: t.fu,
                       yakuman: yakuman, points: pay.total, pay: pay, name: pay.name };
        if (!best || cand.points > best.points
            || (cand.points === best.points && cand.han > best.han)
            || (cand.points === best.points && cand.han === best.han && cand.fu > best.fu)) best = cand;
    });

    if (!best) return { ok: false, why: '역이 없습니다.' };
    return best;
}
window.mjScore = score;

// 역이 하나라도 서는지 (울고 나서 화료할 수 있는지 볼 때)
window.mjHasYaku = function (o) {
    const r = score(Object.assign({}, o, { doraInd: [], uraInd: [], aka: 0 }));
    return !!(r && r.ok);
};

// ==========================================
// 확인 — 콘솔에서 바로 돌려 본다
// ==========================================
//
// 「점수가 틀리지 않는다」가 이 파일의 전부다. 그래서 검사를 같이 싣는다.
//   mjTest()      손으로 확인한 패와 점수표 전체를 맞춰 본다
//   mjFuzz(5000)  무작위 화료형을 돌려 터지는지·값이 규칙 안에 드는지 본다
function T(s) {
    const out = [], re = /(\d+)([mps])|([ESWNhgc])/g;
    let m;
    while ((m = re.exec(s))) {
        if (m[3]) { out.push({ E: 27, S: 28, W: 29, N: 30, h: 31, g: 32, c: 33 }[m[3]]); continue; }
        const base = { m: 0, p: 9, s: 18 }[m[2]];
        for (const ch of m[1]) out.push(base + (Number(ch) - 1));
    }
    return out;
}
window.mjParse = T;

window.mjTest = function () {
    let bad = 0, n = 0;
    const say = function (name, got, want) {
        n++;
        if (JSON.stringify(got) === JSON.stringify(want)) return;
        bad++;
        console.warn('  ✗ ' + name, '받음', got, '기대', want);
    };
    const r = function (hs, ws, o) {
        const x = score(Object.assign({ hand: T(hs), win: T(ws)[0], seat: 28, round: 27 }, o || {}));
        return x.ok ? { han: x.han, fu: x.fu, pt: x.points } : { no: x.why };
    };

    // 손으로 확인한 패
    say('핑후·탕야오·일배구', r('23m234m567p678s22s', '4m'), { han: 3, fu: 30, pt: 3900 });
    say('리치 쯔모 핑후 탕야오', r('23m567m567p678s22s', '4m', { tsumo: true, riichi: true }), { han: 4, fu: 20, pt: 5200 });
    say('치토이츠 리치', r('1133m5577p9922s1p', '1p', { riichi: true }), { han: 3, fu: 25, pt: 3200 });
    say('국사무쌍', r('19m19p19sESWNhgc', '1m'), { han: 13, fu: 25, pt: 32000 });
    say('리치만 1판40부', r('111m234p567p67s55s', '8s', { riichi: true }), { han: 1, fu: 40, pt: 1300 });
    say('대삼원', r('hhhgggccc234p5s', '5s'), { han: 13, fu: 60, pt: 32000 });
    say('구련보등(친)', r('1112345678999m', '5m', { seat: 27 }), { han: 13, fu: 50, pt: 48000 });
    say('사암각 단기', r('222m444p666s888s3p', '3p'), { han: 13, fu: 50, pt: 32000 });
    say('연풍 동(친)', r('EEE234p567p678s5s', '5s', { seat: 27, round: 27 }), { han: 2, fu: 40, pt: 3900 });
    say('삼색동순', r('123m123p123s456m9s', '9s'), { han: 2, fu: 40, pt: 2600 });
    say('삼색동순 쿠이사가리', r('123m123s456m9s', '9s', { melds: [{ type: 'chi', tiles: T('123p') }] }),
        { han: 1, fu: 30, pt: 1000 });
    say('일기통관', r('123m456m789m234p5s', '5s'), { han: 2, fu: 40, pt: 2600 });
    say('준찬타', r('123m789m123p789s9p', '9p'), { han: 3, fu: 40, pt: 5200 });
    say('량페코', r('112233m112233p5s', '5s'), { han: 3, fu: 40, pt: 5200 });
    say('청노두+사암각', r('111m999m111p999p9s', '9s'), { han: 26, fu: 70, pt: 64000 });

    // 점수표 — 널리 쓰이는 칸을 그대로 맞춰 본다
    const ko = { '1|30': 1000, '1|40': 1300, '1|60': 2000, '1|110': 3600,
                 '2|25': 1600, '2|30': 2000, '2|40': 2600, '2|60': 3900, '2|110': 7100,
                 '3|20': 2600, '3|30': 3900, '3|40': 5200, '3|60': 7700, '3|70': 8000,
                 '4|20': 5200, '4|30': 7700, '4|40': 8000 };
    const oya = { '1|30': 1500, '1|40': 2000, '1|60': 2900, '2|30': 2900, '2|40': 3900,
                  '3|30': 5800, '3|40': 7700, '3|60': 11600, '4|30': 11600, '4|40': 12000 };
    Object.keys(ko).forEach(function (k) {
        const a = k.split('|');
        say('자 론 ' + k, payOf(+a[0], +a[1], false, false, 0).total, ko[k]);
    });
    Object.keys(oya).forEach(function (k) {
        const a = k.split('|');
        say('친 론 ' + k, payOf(+a[0], +a[1], true, false, 0).total, oya[k]);
    });
    say('자 쯔모 4판20부', payOf(4, 20, false, true, 0).label, '1300/2600');
    say('친 쯔모 3판30부', payOf(3, 30, true, true, 0).each, 2000);
    say('자 역만 론', payOf(13, 30, false, false, 1).total, 32000);
    say('친 역만 론', payOf(13, 30, true, false, 1).total, 48000);
    say('자 2배역만 론', payOf(26, 30, false, false, 2).total, 64000);

    if (bad) console.warn('%c마작 채점 ' + (n - bad) + '/' + n + ' — ' + bad + '칸 틀립니다', 'color:#f44336; font-size:13px');
    else console.log('%c✓ 마작 채점 ' + n + '/' + n + ' 전부 맞습니다', 'color:#4CAF50; font-size:13px');
    return { 맞음: n - bad, 틀림: bad };
};

window.mjFuzz = function (times) {
    const N = times || 5000;
    const rnd = function (n) { return Math.floor(Math.random() * n); };
    let crash = 0, ok = 0, none = 0, badFu = 0, badPt = 0, top = 0;
    for (let i = 0; i < N; i++) {
        const c = new Array(34).fill(0);
        let good = true;
        for (let s = 0; s < 4 && good; s++) {
            let put = false;
            for (let a = 0; a < 40 && !put; a++) {
                if (Math.random() < 0.5) { const t = rnd(34); if (c[t] + 3 <= 4) { c[t] += 3; put = true; } }
                else {
                    const t = rnd(3) * 9 + rnd(7);
                    if (c[t] < 4 && c[t + 1] < 4 && c[t + 2] < 4) { c[t]++; c[t + 1]++; c[t + 2]++; put = true; }
                }
            }
            if (!put) good = false;
        }
        if (!good) continue;
        let paired = false;
        for (let a = 0; a < 60 && !paired; a++) { const t = rnd(34); if (c[t] + 2 <= 4) { c[t] += 2; paired = true; } }
        if (!paired) continue;
        const all = fromCounts(c);
        if (all.length !== 14) continue;
        const wi = rnd(14), win = all[wi], hand = all.slice();
        hand.splice(wi, 1);
        let x;
        try {
            x = score({ hand: hand, win: win, tsumo: Math.random() < 0.5,
                        seat: Math.random() < 0.25 ? 27 : 28, round: 27,
                        riichi: Math.random() < 0.3, doraInd: [rnd(34)] });
        } catch (e) { crash++; if (crash < 3) console.error('  터짐:', e, all); continue; }
        if (!x.ok) { none++; continue; }
        ok++;
        top = Math.max(top, x.han);
        if (x.fu % 5 !== 0 || x.fu < 20 || x.fu > 140) badFu++;
        if (!(x.points > 0) || x.points % 100 !== 0) badPt++;
    }
    const line = '돌린 판 ' + N + ' · 화료 ' + ok + ' · 역 없음 ' + none
        + ' · 터짐 ' + crash + ' · 이상한 부 ' + badFu + ' · 이상한 점수 ' + badPt + ' · 최고 ' + top + '판';
    if (crash + badFu + badPt) console.warn('%c' + line, 'color:#f44336');
    else console.log('%c✓ ' + line, 'color:#4CAF50');
    return { 터짐: crash, 이상한부: badFu, 이상한점수: badPt };
};

console.log('[마작] 채점기 — mjScore() · mjTest() · mjFuzz()');

})();
