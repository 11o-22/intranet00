// ==========================================
// ★ 망고맛 물약 — 자궁 문신은 몸을 바꾸지 않는다
// bundles.json 마지막 묶음, dna.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   역할이 이렇게 갈려 있었다. (dna.js:105·111)
//       canBear(남성) = 우유 · 포도 · 망고 중 하나라도 있으면 받을 수 있다
//       canSire(사원) = !canBear(사원)
//
//   받을 수 있게 되는 순간 시킬 수 없게 된다. 우유맛·포도맛은 몸이 바뀌는
//   물약이라 그게 맞다. 그런데 망고맛은 **아랫배에 자궁 문신이 새겨지는
//   것**뿐이다. 몸은 그대로다. 그런데도 시키는 쪽에서 빠져 버렸다.
//
// ■ 어떻게 가르나
//
//   둘을 따로 센다.
//
//       받을 수 있나   본래 몸이 받을 수 있거나 · 망고맛 문신이 있으면
//       시킬 수 있나   본래 몸이 시킬 수 있으면 (망고맛은 안 본다)
//
//   「본래 몸」은 우유맛·포도맛만 본다. 그 둘이 성별을 뒤집는 물약이다.
//       남성 + 우유/포도  → 몸이 바뀌었다 (받는 쪽)
//       여성 + 우유/포도  → 몸이 바뀌었다 (시키는 쪽)
//
//   그래서 이렇게 된다.
//
//       맨몸 남성             시키기만
//       남성 + 망고           둘 다          ← 문신만 생겼다
//       남성 + 우유 + 망고     받기만         ← 몸이 바뀌었다
//       맨몸 여성             받기만
//       여성 + 망고           받기만
//       여성 + 포도           시키기만
//       여성 + 포도 + 망고     둘 다          ← 몸은 남자가 됐고 문신도 있다
//       성별 미지정           둘 다 안 됨
//
//   확률도 「몸」으로 센다. 망고맛만으로는 뒤집힌 것으로 세지 않으므로
//   본래 확률이 쓰인다.
//
// ■ 콘솔
//   mangoState(사번)   둘 다 되는 상태인지 · 확률
//   mangoTable()       위 표가 지금 코드에서 그대로 나오는지

(function mangoBoth() {

const MANGO = '망고맛 물약';
const FLIP = ['우유맛 물약', '포도맛 물약'];     // 성별을 뒤집는 물약

function eff(u) { return (u && u.timedEffects) || []; }
function live(u, name) {
    if (typeof hasPotion === 'function') { try { return !!hasPotion(u, name); } catch (e) { } }
    const now = Date.now();
    return eff(u).some(function (e) {
        if (!e || e.name !== name) return false;
        return !!e.fixed || !e.expireAt || e.expireAt > now;
    });
}
function gen(u) { return (u && u.badge && u.badge.gender) || ''; }
function hasMango(u) { return live(u, MANGO); }
function hasFlip(u) { return FLIP.some(function (n) { return live(u, n); }); }

// 망고맛을 뺀 「본래 몸」이 받는 쪽인가
function bodyBears(u) {
    const g = gen(u);
    if (g === '남성') return hasFlip(u);          // 우유·포도를 마셨으면 받는 몸
    if (g === '여성') return !hasFlip(u);         // 안 마셨으면 받는 몸
    return false;
}

// 망고맛 때문에 둘 다 되는 상태인가 (알림 문구에 쓴다)
function mangoBothWay(u) {
    if (!u || !gen(u)) return false;
    return hasMango(u) && !bodyBears(u);
}
window.isMangoBoth = mangoBothWay;
window.isMangoMale = mangoBothWay;               // 예전 이름 호환

// ==========================================
// 1. 받을 수 있나 — 본래 몸이 받거나, 문신이 있으면
// ==========================================
(function hookBear() {
    const iv = setInterval(function () {
        if (typeof canBear !== 'function') return;
        if (canBear._mango) { clearInterval(iv); return; }
        const _b = canBear;
        canBear = function (user) {
            if (user && gen(user) && hasMango(user)) return true;
            return _b.apply(this, arguments);
        };
        canBear._mango = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 2. 시킬 수 있나 — 본래 몸으로만 센다 (망고맛은 안 본다)
// ==========================================
(function hookSire() {
    const iv = setInterval(function () {
        if (typeof canSire !== 'function') return;
        if (canSire._mango) { clearInterval(iv); return; }
        const _s = canSire;
        canSire = function (user) {
            if (!user || !gen(user)) return false;
            if (hasMango(user)) return !bodyBears(user);      // 문신은 시키는 데 상관없다
            return _s.apply(this, arguments);
        };
        canSire._mango = true;
        clearInterval(iv);
        console.log('[망고] 자궁 문신은 몸을 바꾸지 않습니다 — 둘 다 되는 자리를 열었습니다');
    }, 400);
})();

// ==========================================
// 3. 확률 — 뒤집힌 것은 「몸」이 바뀐 경우뿐
// ==========================================
(function hookFlip() {
    const iv = setInterval(function () {
        if (typeof roleFlipped !== 'function') return;
        if (roleFlipped._mango) { clearInterval(iv); return; }
        const _f = roleFlipped;
        roleFlipped = function (user) {
            if (!user || !gen(user)) return false;
            return hasFlip(user);                 // 우유·포도만 몸을 뒤집는다
        };
        roleFlipped._mango = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 4. 사원 상세에 한 줄
// ==========================================
(function hookBtn() {
    const iv = setInterval(function () {
        if (typeof addPregBtn !== 'function') return;
        if (addPregBtn._mango) { clearInterval(iv); return; }
        const _a = addPregBtn;
        addPregBtn = function (code) {
            const r = _a.apply(this, arguments);
            try {
                const t = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
                if (!t || !mangoBothWay(t)) return r;
                const box = document.getElementById('preg-btn-box');
                if (!box || document.getElementById('mango-note')) return r;
                box.insertAdjacentHTML('afterbegin',
                    '<div id="mango-note" style="font-size:10px; color:#ffd76a; margin:0 0 8px 0; line-height:1.6;">'
                    + '망고맛 물약 — 자궁 문신이 있습니다. 시키는 것도, 받는 것도 됩니다.</div>');
            } catch (e) { }
            return r;
        };
        addPregBtn._mango = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 확인
// ==========================================
window.mangoState = function (who) {
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · 망고맛 =====', 'color:#ffd76a; font-size:13px');
    console.log('  성별:', gen(u) || '(미지정)', '· 망고맛:', hasMango(u) ? 'O' : '✗',
        '· 우유/포도:', hasFlip(u) ? '있음 (몸이 바뀜)' : '없음');
    console.log('  본래 몸:', bodyBears(u) ? '받는 쪽' : '시키는 쪽');
    console.log('  시킬 수 있나:', (typeof canSire === 'function' && canSire(u)) ? 'O' : '✗',
        '· 받을 수 있나:', (typeof canBear === 'function' && canBear(u)) ? 'O' : '✗');
    if (typeof myRates === 'function') {
        const r = myRates(u);
        console.log('  확률 — 시키기:', r.sire === null ? '-' : r.sire + '%',
            '· 받기:', r.bear === null ? '-' : r.bear + '%');
    }
    console.log('  연결 — canBear:', (typeof canBear === 'function' && canBear._mango) ? 'O' : '✗',
        '· canSire:', (typeof canSire === 'function' && canSire._mango) ? 'O' : '✗',
        '· roleFlipped:', (typeof roleFlipped === 'function' && roleFlipped._mango) ? 'O' : '✗');
};

window.mangoTable = function () {
    const H = 3600000;
    const mk = function (g, pots) {
        return { code: 'zz', no: '0', name: 'x', badge: { gender: g }, equippedWeapons: [],
            timedEffects: pots.map(function (n) {
                return { name: n, desc: 'x', expireAt: Date.now() + 24 * H };
            }) };
    };
    const rows = [
        ['맨몸 남성', '남성', []],
        ['남성 + 망고', '남성', [MANGO]],
        ['남성 + 우유 + 망고', '남성', ['우유맛 물약', MANGO]],
        ['남성 + 우유', '남성', ['우유맛 물약']],
        ['맨몸 여성', '여성', []],
        ['여성 + 망고', '여성', [MANGO]],
        ['여성 + 포도', '여성', ['포도맛 물약']],
        ['여성 + 포도 + 망고', '여성', ['포도맛 물약', MANGO]],
        ['성별 미지정', '', [MANGO]]
    ];
    console.log('%c===== 망고맛 — 누가 무엇을 할 수 있나 =====', 'color:#ffd76a; font-size:13px');
    console.table(rows.map(function (x) {
        const u = mk(x[1], x[2]);
        const s = canSire(u), b = canBear(u);
        return { 상태: x[0], 시키기: s ? 'O' : '-', 받기: b ? 'O' : '-',
                 '한 줄': (s && b) ? '둘 다' : (s ? '시키기만' : (b ? '받기만' : '둘 다 안 됨')),
                 '확률 뒤집힘': roleFlipped(u) ? 'O' : '-' };
    }));
};

console.log('[망고] 자궁 문신은 몸을 바꾸지 않습니다 — mangoState(사번) · mangoTable()');

})();
