// ==========================================
// ★ 섯다 — 딜러를 세게, 행운은 패에
// bundles.json 마지막 그룹, bj-luck.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 지금까지는 어땠나
//
//   블랙잭과 같았다. 행운이 패에는 아무 영향이 없고, 마지막에 결과만
//   바꿔치기했다.
//
//       index.html:8024
//       if (luckM > 1 && pRes.score <= dRes.score
//           && Math.random() < Math.min(0.30, 0.05 * (luckM - 1))) {
//           let picked = pickHandByCondition(r => r.score > dRes.score);
//           if (picked) { playerHand = picked.hand; pRes = picked.res; }
//       }
//
//   졌는데 패가 통째로 바뀌어 이기는 것이 되었다. 행운이 6배를 넘으면
//   0.30 에서 멈춰 그 위로는 올려도 달라지는 것이 없었다.
//
// ■ 어떻게 바꾸나
//
//   딜러를 세게 만든다. 그리고 행운이 그 세기를 깎는다.
//
//   양쪽 다 「여러 쌍을 집어 보고 가장 좋은 쌍만 남긴다」. 나머지는 덱에
//   돌려놓고 섞으므로 패가 사라지거나 늘지 않는다. 덱은 늘 스무 장이다.
//
//       딜러가 집어 보는 쌍 = 1 + 7 × 9/(9 + d)      d = 행운배수 − 1
//       내가  집어 보는 쌍 = 1 + 8 × d/(d + 30)
//
//   행운이 없으면 딜러는 여덟 쌍을 보고 고르고 나는 한 쌍만 받는다.
//   행운이 오를수록 딜러가 보는 쌍이 줄고 내가 보는 쌍이 는다.
//
//   20만 판씩 돌려 본 값이다. (교환 1회는 안 쓴 기준 — 쓰면 더 오른다)
//
//       행운      100%   200%   500%   1000%   1500%   3000%   10000%
//       딜러      8.00   7.30   5.85    4.50    3.74    2.66     1.58
//       나        1.00   1.26   1.94    2.85    3.55    4.93     7.14
//       승률     10.4%  13.7%  23.5%   37.3%   47.2%   64.7%    82.7%
//       환수율   22.0%  28.7%  48.0%   74.7%   93.5%  127.2%   165.6%
//
//   행운을 안 달면 딜러를 거의 못 이긴다. 1000% 를 달면 비로소 해 볼 만하고,
//   1500% 쯤에서 본전이 된다. 그 위로는 상한 없이 계속 오른다.
//
//   결과 바꿔치기는 없앤다. 진 패는 진 패다.
//
// ■ 확인
//
//   sdLuckNow()      지금 내 행운으로 양쪽이 몇 쌍을 보나
//   sdLuckTest(n)    행운별 승률·환수율을 직접 돌려 본다

(function seotdaLuck() {

const D_MAX = 7,  D_C = 9;      // 딜러 — 행운이 없을수록 많이 본다
const P_MAX = 8,  P_K = 30;     // 나   — 행운이 오를수록 많이 본다

function luckOf(u) {
    if (typeof facilityLuckMult !== 'function') return 1;
    try { return Math.max(1, facilityLuckMult(u || currentUser) || 1); } catch (e) { return 1; }
}
function dealerX(m) { const d = Math.max(0, m - 1); return 1 + D_MAX * (D_C / (D_C + d)); }
function mineX(m)   { const d = Math.max(0, m - 1); return 1 + P_MAX * (d / (d + P_K)); }
function pick(x) { const f = Math.floor(x); return f + ((Math.random() < (x - f)) ? 1 : 0); }
window.sdLook = function (m, who) {
    m = Math.max(1, m || 1);
    return (who === 'dealer') ? dealerX(m) : mineX(m);
};

function score(a, b) {
    if (typeof calculateJokbo !== 'function') return 0;
    try { return calculateJokbo(a, b).score; } catch (e) { return 0; }
}
function shuffle(d) {
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = d[i]; d[i] = d[j]; d[j] = t;
    }
}

// 덱에서 쌍을 k 번 집어 보고 가장 좋은 쌍만 남긴다. 나머지는 돌려놓고 섞는다.
function bestPair(deck, k) {
    if (!deck || deck.length < 2) return null;
    k = Math.max(1, Math.min(k, Math.floor(deck.length / 2)));
    if (k === 1) return [deck.pop(), deck.pop()];

    let best = null, top = -Infinity;
    const rest = [];
    for (let i = 0; i < k; i++) {
        if (deck.length < 2) break;
        const pair = [deck.pop(), deck.pop()];
        const s = score(pair[0], pair[1]);
        if (s > top) {
            if (best) rest.push(best[0], best[1]);
            top = s; best = pair;
        } else rest.push(pair[0], pair[1]);
    }
    for (let i = 0; i < rest.length; i++) deck.push(rest[i]);
    shuffle(deck);
    return best;
}
window.sdBestPair = bestPair;

// ==========================================
// 패를 나누는 자리를 갈아끼운다
// ==========================================
function install() {
    if (typeof startSeotda !== 'function') return false;
    if (startSeotda._luck) return true;
    if (typeof seotdaDeck === 'undefined') return false;

    const _s = startSeotda;
    startSeotda = function () {
        const r = _s.apply(this, arguments);
        try {
            // 원래 함수가 이미 두 장씩 나눠 놓았다. 판이 섰을 때만 다시 나눈다.
            const on = document.getElementById('seotda-controls-play');
            if (!on || on.style.display === 'none') return r;
            if (!playerHand || playerHand.length !== 2 || !dealerHand || dealerHand.length !== 2) return r;

            const m = luckOf(currentUser);
            // 먼저 받은 네 장을 덱에 돌려놓고 섞은 뒤에 고른다
            seotdaDeck.push(playerHand[0], playerHand[1], dealerHand[0], dealerHand[1]);
            shuffle(seotdaDeck);

            const d = bestPair(seotdaDeck, pick(dealerX(m)));
            const p = bestPair(seotdaDeck, pick(mineX(m)));
            if (!d || !p) return r;
            dealerHand = d; playerHand = p;

            if (typeof renderCard === 'function') {
                renderCard('seotda-card-1', playerHand[0]);
                renderCard('seotda-card-2', playerHand[1]);
                renderCard('dealer-card-1', null, true);
                renderCard('dealer-card-2', null, true);
            }
            const lab = document.getElementById('player-result-label');
            if (lab && typeof calculateJokbo === 'function') {
                lab.innerText = calculateJokbo(playerHand[0], playerHand[1]).name;
            }
        } catch (e) { console.warn('[섯다] 행운 적용 건너뜀:', e && e.message); }
        return r;
    };
    startSeotda._luck = true;
    console.log('[섯다] 딜러를 세게 — 행운이 그 세기를 깎습니다');
    return true;
}

// ==========================================
// 결과 바꿔치기를 끈다
// ==========================================
//
// index.html:8024 의 바꿔치기는 finishSeotda 안에 있어 바깥에서 막을 수 없다.
// 그래서 finishSeotda 가 보는 facilityLuckMult 만 1 로 보이게 한다.
// 조건이 luckM > 1 이므로 그대로 꺼진다. 패는 우리가 따로 읽으니 상관없다.
function killSwap() {
    if (typeof finishSeotda !== 'function' || typeof facilityLuckMult !== 'function') return false;
    if (finishSeotda._noSwap) return true;
    const _f = finishSeotda;
    const wrapped = function () {
        const _luck = facilityLuckMult;
        facilityLuckMult = function () { return 1; };
        try { return _f.apply(this, arguments); }
        finally { facilityLuckMult = _luck; }
    };
    wrapped._noSwap = true;
    finishSeotda = wrapped;
    console.log('[섯다] 「진 패를 이긴 패로」 바꾸던 자리를 껐습니다');
    return true;
}

let n = 0;
const iv = setInterval(function () {
    const a = install(), b = killSwap();
    if ((a && b) || ++n > 60) clearInterval(iv);
}, 500);

// ==========================================
// 확인
// ==========================================
window.sdLuckNow = function () {
    const m = luckOf(currentUser);
    console.log('%c===== 섯다 행운 =====', 'color:#d4af37; font-size:13px');
    console.log('  내 공용시설 행운:', Math.round(m * 100) + '%', '(배수 ' + m.toFixed(2) + ')');
    console.log('  딜러가 집어 보는 쌍:', dealerX(m).toFixed(2));
    console.log('  내가   집어 보는 쌍:', mineX(m).toFixed(2));
    console.log('  연결:', (typeof startSeotda === 'function' && startSeotda._luck) ? 'O' : '✗',
        '· 바꿔치기 끔:', (typeof finishSeotda === 'function' && finishSeotda._noSwap) ? 'O' : '✗');
    const cap = (typeof BET_CAPS !== 'undefined' && BET_CAPS) ? BET_CAPS['seotda-bet'] : null;
    if (cap) console.log('  베팅 한도:', cap.toLocaleString() + ' P');
    if (m <= 1.0001) console.log('  (행운이 없으면 딜러가 여덟 쌍을 보고 고릅니다 — 거의 못 이깁니다)');
};

window.sdLuckTest = function (times) {
    if (typeof calculateJokbo !== 'function') { console.warn('섯다가 아직 안 올라왔습니다.'); return; }
    const n = times || 20000;
    const rows = [];
    [1, 2, 5, 10, 15, 30, 100, 1000].forEach(function (m) {
        let win = 0, draw = 0, out = 0;
        const BET = 100;
        for (let i = 0; i < n; i++) {
            const deck = [];
            for (let j = 1; j <= 10; j++) {
                deck.push({ month: j, isKwang: (j === 1 || j === 3 || j === 8) });
                deck.push({ month: j, isKwang: false });
            }
            shuffle(deck);
            const me = bestPair(deck, pick(mineX(m)));
            const dl = bestPair(deck, pick(dealerX(m)));
            const p = calculateJokbo(me[0], me[1]), q = calculateJokbo(dl[0], dl[1]);
            if (p.score > q.score) { win++; out += Math.floor(BET * p.mult); }
            else if (p.score === q.score) { draw++; out += Math.floor(BET / 2); }
        }
        rows.push({ 행운: Math.round(m * 100) + '%',
                    딜러: dealerX(m).toFixed(2) + '쌍', 나: mineX(m).toFixed(2) + '쌍',
                    승: (win / n * 100).toFixed(1) + '%', 무: (draw / n * 100).toFixed(1) + '%',
                    환수율: (out / (n * BET) * 100).toFixed(1) + '%' });
    });
    console.log('%c===== 행운별 승률 (' + n.toLocaleString() + '판 · 교환 안 씀) =====',
        'color:#d4af37; font-size:13px');
    console.table(rows);
    console.log('  교환 1회를 쓰면 이보다 올라갑니다.');
};

console.log('[섯다] sdLuckNow() · sdLuckTest()');

})();
