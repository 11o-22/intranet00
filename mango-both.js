// ==========================================
// ★ 망고맛 물약을 마신 남성 — 시키는 것도, 받는 것도
// bundles.json 마지막 묶음, dna.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   역할은 이렇게 갈렸다. (dna.js:105·111)
//       canBear(남성)  = 우유 · 포도 · 망고 중 하나라도 있으면 받을 수 있다
//       canSire(사원)  = !canBear(사원)
//
//   받을 수 있게 되는 순간 시킬 수 없게 된다. 우유맛·포도맛은 몸이 바뀌는
//   물약이라 그게 맞다. 그런데 망고맛은 **아랫배에 자궁 문신이 새겨지는
//   것**뿐이다. 몸은 그대로다. 그런데도 시키는 쪽에서 빠져 버렸다.
//
// ■ 어떻게 바꾸나
//
//   망고맛만 마신 남성(우유·포도는 없는)은 둘 다 할 수 있다.
//
//       canSire      받을 수 있어도 시킬 수 있다
//       roleFlipped  몸이 바뀐 것은 아니므로 뒤집힌 것으로 세지 않는다
//                    → 시킬 때는 본래 남성 확률, 받을 때도 본래 확률
//
//   우유맛·포도맛을 같이 마시면 몸이 바뀐 것이므로 예전 규칙으로 돌아간다.
//   (받기만 된다)
//
// ■ 콘솔
//   mangoState(사번)   둘 다 되는 상태인지 · 확률

(function mangoBoth() {

const MANGO = '망고맛 물약';

function eff(u) { return (u && u.timedEffects) || []; }
function hasM(u) {
    if (typeof hasPotion === 'function') { try { return !!hasPotion(u, MANGO); } catch (e) { } }
    return eff(u).some(function (e) { return e && e.name === MANGO; });
}
function gen(u) { return (u && u.badge && u.badge.gender) || ''; }
function bodyFlipped(u) {
    if (typeof hasUnbearPotion === 'function') { try { return !!hasUnbearPotion(u); } catch (e) { } }
    return eff(u).some(function (e) {
        return e && (e.name === '우유맛 물약' || e.name === '포도맛 물약');
    });
}

// 망고만 마신 남성 — 문신만 있고 몸은 그대로다
function mangoMale(u) {
    if (!u) return false;
    if (gen(u) !== '남성') return false;
    if (!hasM(u)) return false;
    if (bodyFlipped(u)) return false;        // 우유·포도가 있으면 몸이 바뀐 것이다
    return true;
}
window.isMangoMale = mangoMale;

// ==========================================
// 1. canSire — 받을 수 있어도 시킬 수 있다
// ==========================================
(function hookSire() {
    const iv = setInterval(function () {
        if (typeof canSire !== 'function') return;
        if (canSire._mango) { clearInterval(iv); return; }
        const _s = canSire;
        canSire = function (user) {
            if (mangoMale(user)) return true;
            return _s.apply(this, arguments);
        };
        canSire._mango = true;
        clearInterval(iv);
        console.log('[망고] 망고맛을 마신 남성은 시키는 것도 됩니다');
    }, 400);
})();

// ==========================================
// 2. roleFlipped — 몸이 바뀐 것은 아니다
// ==========================================
(function hookFlip() {
    const iv = setInterval(function () {
        if (typeof roleFlipped !== 'function') return;
        if (roleFlipped._mango) { clearInterval(iv); return; }
        const _f = roleFlipped;
        roleFlipped = function (user) {
            if (mangoMale(user)) return false;      // 본래 확률로 센다
            return _f.apply(this, arguments);
        };
        roleFlipped._mango = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 3. 사원 상세에 한 줄 — 둘 다 된다고 알려 준다
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
                if (!t || !mangoMale(t)) return r;
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
    console.log('  성별:', gen(u) || '(미지정)', '· 망고맛:', hasM(u) ? 'O' : '✗',
        '· 우유/포도:', bodyFlipped(u) ? '있음 (몸이 바뀜)' : '없음');
    console.log('  둘 다 되는 상태:', mangoMale(u) ? 'O' : '✗');
    console.log('  시킬 수 있나:', (typeof canSire === 'function' && canSire(u)) ? 'O' : '✗',
        '· 받을 수 있나:', (typeof canBear === 'function' && canBear(u)) ? 'O' : '✗');
    if (typeof myRates === 'function') {
        const r = myRates(u);
        console.log('  확률 — 시키기:', r.sire === null ? '-' : r.sire + '%',
            '· 받기:', r.bear === null ? '-' : r.bear + '%');
    }
    console.log('  연결 — canSire:', (typeof canSire === 'function' && canSire._mango) ? 'O' : '✗',
        '· roleFlipped:', (typeof roleFlipped === 'function' && roleFlipped._mango) ? 'O' : '✗');
};

console.log('[망고] 망고맛 남성은 둘 다 — mangoState(사번)');

})();
