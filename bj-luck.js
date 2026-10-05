// ==========================================
// ★ 블랙잭 — 행운이 높으면 내 패가 잘 나온다
// bundles.json 마지막 그룹, slot-curve.js 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 지금까지는 어땠나
//
//   행운은 카드에 아무 영향이 없었습니다. 마지막에 결과만 뒤집었습니다.
//
//       index.html:8172
//       const luckM = facilityLuckMult(currentUser);
//       if (result === 'lose' && luckM > 1 && p <= 21
//           && Math.random() < Math.min(0.25, 0.04 * (luckM - 1))) {
//           result = 'win';          ← 진 판을 이긴 판으로 바꿔 버린다
//       }
//
//   그래서 17 대 20 으로 분명히 졌는데 「승리」가 떴습니다. 행운이 아무리
//   높아도 0.25 에서 멈추고, 그 위로는 올려도 달라지는 것이 없었습니다.
//
// ■ 어떻게 바꾸나
//
//   카드를 뽑을 때 좋은 패가 나오도록 합니다. 결과는 건드리지 않습니다.
//
//   내 카드를 뽑을 때 한 장이 아니라 여러 장을 집어 보고, 내 패에 가장
//   좋은 것만 남기고 나머지는 덱에 돌려놓고 섞습니다. 카드가 사라지거나
//   늘어나지 않습니다. 덱은 그대로 52장입니다.
//
//       집어 보는 장수 = 1 + 4 × (m / (m + K))        K = 40
//
//       행운      100%   200%   400%   1000%   10000%   그 위
//       m            1      2      4      10      100   더 커짐
//       집어 봄      1      1      2       2        4      5
//
//   m 이 1 이면 한 장만 집으므로 예전과 똑같습니다. 행운이 없는 사원에게는
//   아무 변화가 없습니다. 상한을 두지 않고 천천히 5장에 가까워집니다.
//
//   딜러 카드는 그냥 뽑습니다. 「내 패가 잘 나온다」이지 딜러를 망치는
//   것이 아닙니다.
//
//   한 장 더 받을 때(힛)도 같습니다. 21을 넘기지 않는 쪽을 고릅니다.
//   넘길 수밖에 없으면 가장 작은 것을 집습니다.
//
//   결과 뒤집기는 없앱니다. 진 판은 진 판입니다.
//
// ■ 얼마나 세지나 (10만 판씩 돌려 본 값 — bjLuckTest() 로 다시 볼 수 있습니다)
//
//   아래 표는 「멈추기(스탠드)만 하는」 가장 단순한 사원 기준입니다.
//   교환 3회와 힛을 쓰면 더 올라갑니다.
//
// ■ 확인
//
//   bjLuckNow()     지금 내 행운으로 몇 장을 집어 보는지
//   bjLuckTest(n)   행운별 승률을 직접 돌려 본다

(function bjLuck() {

const K = 12;          // 완만하게 올라가는 기울기 — 작을수록 빨리 센다
const DEAL_MAX = 4;    // 처음 두 장에 더해지는 최대 후보 수 (1 + 4 = 5장까지)
const HIT_MAX = 3;     // 한 장 더 받을 때 (1 + 3 = 4장까지)

function luckOf(u) {
    if (typeof facilityLuckMult !== 'function') return 1;
    try { return Math.max(1, facilityLuckMult(u || currentUser) || 1); } catch (e) { return 1; }
}
// 집어 볼 장수. 행운이 100%(m=1)면 정확히 1장이라, 행운이 없는 사원은
// 예전과 똑같다. 소수점은 확률로 쓴다 — 1.31장이면 31% 확률로 두 장이다.
// 반올림으로 하면 200%~400% 구간이 통째로 1장에 눌려 아무 효과가 없었다.
function lookX(m, max) {
    const d = Math.max(0, m - 1);
    return 1 + max * (d / (d + K));
}
function look(m, max) {
    const x = lookX(m, max);
    const f = Math.floor(x);
    return f + ((Math.random() < (x - f)) ? 1 : 0);
}
window.bjLook = function (m, which) {
    return lookX(Math.max(1, m || 1), which === 'hit' ? HIT_MAX : DEAL_MAX);
};

// ==========================================
// 점수 — index.html 의 bjScore 와 같은 규칙
// ==========================================
function score(hand) {
    if (typeof bjScore === 'function') { try { return bjScore(hand); } catch (e) { } }
    let total = 0, aces = 0;
    hand.forEach(function (v) {
        if (v === 1) { total += 11; aces++; }
        else total += Math.min(10, v);
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
}

// 내 패에 얼마나 좋은가 — 터지면 가장 나쁘고, 21에 가까울수록 좋다
function worth(hand, v) {
    const s = score(hand.concat([v]));
    if (s > 21) return -100 - s;        // 터진다. 그 중에서도 덜 터지는 쪽
    return s;
}

// ==========================================
// 뽑기 — 여러 장 집어 보고 가장 좋은 것만 남긴다
// ==========================================
function shuffle(d) {
    for (let i = d.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = d[i]; d[i] = d[j]; d[j] = t;
    }
}

// deck 에서 hand 에 가장 좋은 한 장을 뽑아 준다. 나머지는 돌려놓고 섞는다.
function best(deck, hand, k) {
    if (!deck.length) return undefined;
    k = Math.max(1, Math.min(k, deck.length));
    if (k === 1) return deck.pop();

    const cand = [];
    for (let i = 0; i < k; i++) cand.push(deck.pop());

    let at = 0, top = -Infinity;
    for (let i = 0; i < cand.length; i++) {
        const w = worth(hand, cand[i]);
        if (w > top) { top = w; at = i; }
    }
    const out = cand.splice(at, 1)[0];
    for (let i = 0; i < cand.length; i++) deck.push(cand[i]);   // 돌려놓는다
    shuffle(deck);                                              // 다시 섞는다
    return out;
}
window.bjBest = best;      // 시험에서 쓴다

// ==========================================
// 갈아끼우기
// ==========================================
function install() {
    if (typeof startBlackjack !== 'function' || typeof bjHit !== 'function') return false;
    if (startBlackjack._luck) return true;
    if (typeof bjDeck === 'undefined') return false;

    // --- 처음 두 장 ---
    const _start = startBlackjack;
    startBlackjack = function () {
        const r = _start.apply(this, arguments);
        // 원래 함수가 이미 두 장씩 나눠 놓았다. 행운이 있으면 내 두 장만
        // 다시 뽑는다 — 먼저 받은 두 장을 덱에 돌려놓고 섞은 뒤에 고른다.
        try {
            if (!bjPlayer || bjPlayer.length !== 2) return r;
            const m = luckOf(currentUser);
            if (lookX(m, DEAL_MAX) <= 1.0001) return r;        // 행운이 없다 — 그대로

            bjDeck.push(bjPlayer[0], bjPlayer[1]);
            shuffle(bjDeck);
            const hand = [];
            hand.push(best(bjDeck, hand, look(m, DEAL_MAX)));
            hand.push(best(bjDeck, hand, look(m, DEAL_MAX)));
            bjPlayer = hand;

            if (typeof bjRender === 'function') bjRender(true);
            // 21 이 되었으면 원래 흐름대로 바로 멈춘다
            if (score(bjPlayer) === 21 && typeof bjStand === 'function') bjStand();
        } catch (e) { console.warn('[블랙잭] 행운 적용 건너뜀:', e && e.message); }
        return r;
    };
    startBlackjack._luck = true;

    // --- 한 장 더 ---
    const _hit = bjHit;
    bjHit = function () {
        const m = luckOf(currentUser);
        if (lookX(m, HIT_MAX) <= 1.0001) return _hit.apply(this, arguments);
        try {
            bjSwapPhase = false;
            const v = best(bjDeck, bjPlayer, look(m, HIT_MAX));
            if (v === undefined) return _hit.apply(this, arguments);
            bjPlayer.push(v);
            if (typeof bjRender === 'function') bjRender(true);
            if (score(bjPlayer) > 21 && typeof bjFinish === 'function') bjFinish('bust');
            return;
        } catch (e) {
            console.warn('[블랙잭] 행운 적용 건너뜀:', e && e.message);
            return _hit.apply(this, arguments);
        }
    };
    bjHit._luck = true;

    console.log('[블랙잭] 행운이 카드에 들어갑니다 — 결과 뒤집기는 없앴습니다');
    return true;
}

// ==========================================
// 결과 뒤집기를 없앤다
// ==========================================
//
// index.html:8172 의 뒤집기는 bjFinish 안에 있어서 바깥에서 막을 수가 없다.
// 그래서 bjFinish 가 쓰는 facilityLuckMult 만 1 로 보이게 한다. 뒤집기 조건이
// luckM > 1 이므로 그대로 꺼진다. 카드 쪽은 우리가 따로 읽으니 영향이 없다.
function killFlip() {
    if (typeof bjFinish !== 'function' || typeof facilityLuckMult !== 'function') return false;
    if (bjFinish._noFlip) return true;
    const _fin = bjFinish;
    const wrapped = function () {
        const _luck = facilityLuckMult;
        facilityLuckMult = function () { return 1; };     // 뒤집기만 끈다
        try { return _fin.apply(this, arguments); }
        finally { facilityLuckMult = _luck; }
    };
    wrapped._noFlip = true;
    bjFinish = wrapped;
    console.log('[블랙잭] 「진 판을 이긴 판으로」 바꾸던 자리를 껐습니다');
    return true;
}

let n = 0;
const iv = setInterval(function () {
    const a = install(), b = killFlip();
    if ((a && b) || ++n > 60) clearInterval(iv);
}, 500);

// ==========================================
// 확인
// ==========================================
window.bjLuckNow = function () {
    const m = luckOf(currentUser);
    console.log('%c===== 블랙잭 행운 =====', 'color:#4CAF50; font-size:13px');
    console.log('  내 공용시설 행운:', Math.round(m * 100) + '%', '(배수 ' + m.toFixed(2) + ')');
    const xd = lookX(m, DEAL_MAX), xh = lookX(m, HIT_MAX);
    const say = function (x) {
        const f = Math.floor(x), p = Math.round((x - f) * 100);
        return p ? (f + '~' + (f + 1) + '장 (' + p + '% 확률로 ' + (f + 1) + '장)') : (f + '장');
    };
    console.log('  처음 두 장 — 집어 보는 장수:', say(xd), '· 평균', xd.toFixed(2) + '장');
    console.log('  한 장 더 받을 때:', say(xh), '· 평균', xh.toFixed(2) + '장');
    console.log('  연결:', (typeof startBlackjack === 'function' && startBlackjack._luck) ? 'O' : '✗',
        '· 뒤집기 끔:', (typeof bjFinish === 'function' && bjFinish._noFlip) ? 'O' : '✗');
    if (xd <= 1.0001) console.log('  (행운이 없어 예전과 똑같이 한 장씩 뽑습니다)');
};

// 행운별 승률을 직접 돌려 본다 — 「멈추기만 하는」 사원 기준
window.bjLuckTest = function (times) {
    const n = times || 20000;
    const rows = [];
    [1, 1.5, 2, 3, 4, 7, 10, 40, 100, 1000].forEach(function (m) {
        let win = 0, lose = 0, draw = 0, bust = 0;
        for (let i = 0; i < n; i++) {
            const deck = [];
            for (let s = 0; s < 4; s++) for (let v = 1; v <= 13; v++) deck.push(v);
            shuffle(deck);
            const me = [];
            me.push(best(deck, me, look(m, DEAL_MAX)));
            me.push(best(deck, me, look(m, DEAL_MAX)));
            const dl = [deck.pop(), deck.pop()];
            while (score(dl) < 17) dl.push(deck.pop());
            const p = score(me), d = score(dl);
            if (p > 21) { bust++; lose++; }
            else if (d > 21 || p > d) win++;
            else if (p < d) lose++;
            else draw++;
        }
        rows.push({ 행운: Math.round(m * 100) + '%', 집어봄: lookX(m, DEAL_MAX).toFixed(2) + '장',
                    승: (win / n * 100).toFixed(1) + '%', 패: (lose / n * 100).toFixed(1) + '%',
                    무: (draw / n * 100).toFixed(1) + '%' });
    });
    console.log('%c===== 행운별 승률 (' + n.toLocaleString() + '판 · 멈추기만) =====',
        'color:#4CAF50; font-size:13px');
    console.table(rows);
    console.log('  교환 3회와 한 장 더 받기를 쓰면 이보다 올라갑니다.');
};

console.log('[블랙잭] bjLuckNow() · bjLuckTest()');

})();
