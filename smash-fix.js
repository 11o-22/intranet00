// ==========================================
// ★ 기믹 파훼 — null 을 휘두르며 전부 깨는 것
// bundles.json 마지막 그룹, dna-gifts.js 보다 뒤 (맨 뒤면 된다)
// ==========================================
//
// ■ 무엇이 일어나고 있나
//
//   dark.js 원본은 이렇게 생겼다. (dark.js:4542~4557)
//
//       function smashWeapon() {
//           if (hasEquip(currentUser, '작두')) return '작두';
//           if (hasEquip(currentUser, '버터 나이프')) return '버터 나이프';
//           return null;
//       }
//       function jakduAvailable() {
//           return darkRun && !darkRun._jakduUsed && !!smashWeapon();
//       }
//       function useJakdu() {
//           if (!jakduAvailable()) return false;      ← 전역 이름으로 부른다
//           darkRun._jakduUsed = true;
//           return true;
//       }
//
//   dna-gifts.js 가 고유 아이템으로도 깰 수 있게 셋을 감쌌다. (dna-gifts.js:339~371)
//
//       jakduAvailable = () => _j() || dnaCharge.gim > 0;
//       useJakdu       = () => _u() || dnaUse('gim');
//
//   여기서 어긋난다. _u 는 원본 useJakdu 이고, 그 안에서 부르는 jakduAvailable 은
//   이름으로 찾으므로 「이미 감싸진 것」이 잡힌다.
//   그래서 작두가 없어도 고유 충전만 있으면 _u 가 참을 돌려주고,
//   뒤의 dnaUse('gim') 은 영영 불리지 않는다.
//
//   결과
//     · dnaCharge.gim 이 줄지 않는다 → 버튼이 꺼지지 않는다 → 기믹을 전부 깬다
//     · darkRun._jakduUsed 만 true 가 되는데, jakduAvailable 이
//       dnaCharge.gim > 0 로 또 참이 되어 소용이 없다
//
//   그리고 이름이 null 로 찍히는 까닭
//
//       jakduAvailable · useJakdu 는 dnaCharge.gim 만 보는데
//       smashWeapon 은 myDnaEquip() 까지 본다.
//       고유 아이템을 탐사 도중에 빼거나, 상담사가 giveDnaExtra 로 아이템을 다시 만들어
//       장착 칸의 이름과 ITEM_CATALOG 가 어긋나면 myDnaEquip() 이 null 이 된다.
//       그때 버튼은 뜨고 이름만 null 이 된다. 「null 을 휘둘렀습니다」가 그것이다.
//
// ■ 어떻게 고치나
//
//   셋을 같은 조건으로 다시 세운다. 서로를 이름으로 부르지 않고 각자 판단한다.
//
//     작두·버터 나이프  — 탐사당 1회  (원래대로)
//     고유 아이템       — 충전이 있는 동안, 쓸 때마다 하나씩 줄어든다
//
//   이름이 없으면 버튼 자체가 뜨지 않는다.

(function smashFix() {

function eq(name) {
    if (!currentUser || !Array.isArray(currentUser.equippedWeapons)) return false;
    if (typeof canWearItem === 'function' && !canWearItem(currentUser, name)) return false;
    return currentUser.equippedWeapons.some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}

// 진짜 돌파 무기 — 원본과 같은 판정
function realWeapon() {
    if (eq('작두')) return '작두';
    if (eq('버터 나이프')) return '버터 나이프';
    return null;
}

// 고유 아이템으로 깰 수 있는가 — 장착되어 있고 충전이 남아 있을 때만
function dnaReady() {
    try {
        if (typeof myDnaEquip !== 'function' || !myDnaEquip()) return false;
        if (typeof dnaCharge === 'undefined' || !dnaCharge) return false;
        return (dnaCharge.gim || 0) > 0;
    } catch (e) { return false; }
}

// 고유 아이템의 이름
function dnaName() {
    try {
        const nm = (currentUser.equippedWeapons || []).find(function (x) {
            const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(x) : x;
            const c = ITEM_CATALOG[base] || ITEM_CATALOG[x];
            return c && c.effect === 'equip_dna';
        });
        return nm ? String(nm).split(' · ')[0] : '고유의 것';
    } catch (e) { return '고유의 것'; }
}

function jakduLeft() {
    return !!(typeof darkRun !== 'undefined' && darkRun && !darkRun._jakduUsed && realWeapon());
}

(function swap() {
    const iv = setInterval(function () {
        if (typeof jakduAvailable !== 'function' || typeof useJakdu !== 'function'
            || typeof smashWeapon !== 'function') return;
        if (window._smashFixed) { clearInterval(iv); return; }
        window._smashFixed = true;

        smashWeapon = function () {
            const w = realWeapon();
            if (w) return w;
            return dnaReady() ? dnaName() : null;
        };

        jakduAvailable = function () {
            if (typeof darkRun === 'undefined' || !darkRun) return false;
            return jakduLeft() || dnaReady();
        };

        useJakdu = function () {
            if (typeof darkRun === 'undefined' || !darkRun) return false;

            // 작두·버터 나이프 — 탐사당 한 번
            if (jakduLeft()) {
                darkRun._jakduUsed = true;
                if (Array.isArray(darkRun.log)) darkRun.log.push('[작두] 기믹 강제 돌파');
                return true;
            }
            // 고유 아이템 — 충전 하나를 쓴다
            if (dnaReady()) {
                dnaCharge.gim = (dnaCharge.gim || 0) - 1;
                if (Array.isArray(darkRun.log)) darkRun.log.push('[고유] 기믹 강제 돌파');
                return true;
            }
            return false;
        };

        clearInterval(iv);
        console.log('[기믹] 파훼 판정 다시 세움 — 작두 1회 · 고유 충전만큼');
    }, 400);
})();

// 이름이 없으면 아예 휘두르지 않는다 — 「null 을 휘둘렀습니다」 막이
(function guardSmash() {
    const iv = setInterval(function () {
        if (typeof jakduSmash !== 'function') return;
        if (jakduSmash._nullGuard) { clearInterval(iv); return; }
        const _s = jakduSmash;
        jakduSmash = function () {
            const w = (typeof smashWeapon === 'function') ? smashWeapon() : null;
            if (!w) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('지금은 부술 수 있는 것이 없습니다.');
                }
                console.warn('[기믹] 무기 이름이 없어 멈췄습니다.');
                return;
            }
            return _s.apply(this, arguments);
        };
        jakduSmash._nullGuard = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 두 판정이 어긋나면 다시 세운다
// ==========================================
//
//   「단추는 서는데 이름이 없다」가 곧 두 판정이 어긋났다는 뜻이다.
//   dna-gifts.js 가 400ms 와 500ms 사이 어느 틈에 이 파일 위를 다시
//   감싸면 그 꼴이 된다. 틈을 막는 대신, 어긋난 것이 보이면 바로
//   우리 둘을 다시 얹는다. 누가 언제 감싸든 「null 로 박살낸다」는 안 뜬다.
(function keep() {
    setInterval(function () {
        try {
            if (typeof jakduAvailable !== 'function' || typeof smashWeapon !== 'function') return;
            if (typeof darkRun === 'undefined' || !darkRun) return;
            if (!jakduAvailable()) return;
            if (smashWeapon()) return;                 // 둘이 맞다
            smashWeapon = function () {
                const w = realWeapon();
                if (w) return w;
                return dnaReady() ? dnaName() : null;
            };
            jakduAvailable = function () {
                if (typeof darkRun === 'undefined' || !darkRun) return false;
                return jakduLeft() || dnaReady();
            };
            console.warn('[기믹] 단추는 서는데 이름이 없었습니다 — 판정을 다시 세웠습니다');
        } catch (e) { }
    }, 1500);
})();

// ==========================================
// 확인
// ==========================================
window.smashState = function () {
    console.log('%c===== 기믹 파훼 =====', 'color:#ff6b6b; font-size:13px');
    console.log('  고쳐짐:', window._smashFixed ? 'O' : '✗');
    const inRun = (typeof darkRun !== 'undefined' && darkRun);
    console.table([{
        '탐사 중': inRun ? darkRun.zone : '아니오',
        '작두/나이프': realWeapon() || '없음',
        '작두 남음': inRun ? (jakduLeft() ? 'O' : '씀') : '-',
        '고유 장착': (typeof myDnaEquip === 'function' && myDnaEquip()) ? 'O' : '없음',
        '고유 충전': (typeof dnaCharge !== 'undefined' && dnaCharge) ? (dnaCharge.gim || 0) : '-',
        '버튼': (typeof jakduAvailable === 'function' && jakduAvailable()) ? '보임' : '-',
        '이름': String((typeof smashWeapon === 'function') ? smashWeapon() : null)
    }]);
};

console.log('[기믹] smashState()');

})();