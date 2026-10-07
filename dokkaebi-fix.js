// ==========================================
// ★ 도깨비 불을 차면 물약이 아예 안 들던 것
// bundles.json 마지막 묶음, newitems.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   도깨비 불의 설명은 「상태이상 면역」이다. 그런데 막는 자리가 이렇게
//   생겨 있었다. (newitems.js:619)
//
//       addTimedEffect = function (user, name, desc, hours) {
//           if (hasEquip(user, '도깨비 불') && name !== '유리구슬') {
//               showCustomAlert('도깨비 불이 달라붙는 것을 태워 버렸습니다.');
//               return;                        ← 유리구슬 말고는 전부 막는다
//           }
//           ...
//
//   이름표가 붙는 모든 것을 막는다. **내가 스스로 마신 물약까지** 막는다.
//   그래서 도깨비 불을 찬 사원은 리치맛·망고맛·딸기맛·감자맛·먹물맛을
//   마셔도 아무 일이 안 일어났다. 「물약을 써도 안 먹힌다」가 이것이다.
//
//   게다가 남이 걸어 줄 때도 막기만 하고 참을 돌려주므로, 쓴 쪽은 물건이
//   그냥 사라졌다. 왜 안 됐는지도 알 수 없었다.
//
// ■ 어떻게 가르나
//
//   면역은 「남이 걸어 오는 것」에만 쓴다.
//
//       내가 내 몸에 거는 것      그대로 든다 (일부러 마신 것이다)
//       남이 나에게 걸어 오는 것   태운다 (면역)
//       유리구슬                 어느 쪽이든 든다 (예전부터 예외)
//
//   태웠을 때는 **쓴 쪽에게 알리고 물건을 돌려준다.** applyItemEffect 가
//   거짓을 돌려주면 소지품에서 빠지지 않는다. (index.html:6113)
//
//   가리는 방법 — 안쪽(newitems.js) 막이는 hasEquip 을 보고 판단하므로,
//   통과시킬 동안만 「도깨비 불을 안 찬 것」으로 보이게 한다.
//   (epic-hard.js 가 gearValue 를 눌러 두는 것과 같은 방식)
//
// ■ 콘솔
//   dokState(사번)   차고 있나 · 연결됐나
//   dokTest()        내가 마신 것은 들고 남이 건 것은 타는지 바로 확인

(function dokkaebiFix() {

const DOK = '도깨비 불';
const FREE = { '유리구슬': 1 };          // 예전부터 면역에서 빼 둔 것

let pass = false;                        // 통과시키는 동안
let burned = null;                       // 방금 태운 것
let count = 0;                           // 태운 횟수 (확인용)

function wears(u) {
    if (!u || typeof hasEquip !== 'function') return false;
    try { return !!hasEquip(u, DOK); } catch (e) { return false; }
}

// ==========================================
// 1. hasEquip 가리기 — 통과시킬 동안만 안 찬 것으로 본다
// ==========================================
(function hookHas() {
    const iv = setInterval(function () {
        if (typeof hasEquip !== 'function') return;
        if (hasEquip._dok) { clearInterval(iv); return; }
        const _h = hasEquip;
        hasEquip = function (u, n) {
            if (pass && n === DOK) return false;
            return _h.apply(this, arguments);
        };
        hasEquip._dok = true;
        hasEquip._raw = _h;
        clearInterval(iv);
    }, 300);
})();

function rawWears(u) {
    const raw = (typeof hasEquip === 'function' && hasEquip._raw) ? hasEquip._raw : hasEquip;
    if (!u || typeof raw !== 'function') return false;
    try { return !!raw(u, DOK); } catch (e) { return false; }
}

// ==========================================
// 2. addTimedEffect — 누가 누구에게 거는지로 가른다
// ==========================================
(function hookAdd() {
    const iv = setInterval(function () {
        if (typeof addTimedEffect !== 'function') return;
        if (addTimedEffect._dok) { clearInterval(iv); return; }

        const _add = addTimedEffect;
        const wrapped = function (user, name, desc, hours) {
            const mine = !!(currentUser && user && user.code === currentUser.code);
            const blocked = rawWears(user) && !FREE[name] && !mine;

            if (!blocked) {
                // 안쪽 막이가 또 막지 않도록 그 동안만 가린다
                pass = true;
                try { return _add.apply(this, arguments); }
                finally { pass = false; }
            }

            burned = { name: name, who: (user && user.name) || '상대' };
            count++;
            return;
        };
        wrapped._dok = true;
        addTimedEffect = wrapped;
        clearInterval(iv);
        console.log('[도깨비 불] 면역은 남이 걸어 오는 것에만 — 내가 마신 것은 듭니다');
    }, 300);
})();

// ==========================================
// 3. applyItemEffect — 태웠으면 물건을 돌려준다
// ==========================================
(function hookApply() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._dok) { clearInterval(iv); return; }

        const _a = applyItemEffect;
        const wrapped = function (targetUser, itemName, isOthers) {
            burned = null;
            const r = _a.apply(this, arguments);
            if (!burned) return r;

            const b = burned; burned = null;
            if (typeof showCustomAlert === 'function') {
                showCustomAlert(b.who + ' 사원은 ' + DOK + '을 차고 있습니다.\n\n'
                    + b.name + '이(가) 달라붙지 못하고 타 버렸습니다.\n'
                    + '물건은 그대로 있습니다. 빼게 한 뒤에 다시 쓰세요.');
            }
            if (typeof addHistoryLog === 'function' && currentUser) {
                try { addHistoryLog(currentUser, '[도깨비 불] ' + b.who + ' 사원에게 ' + b.name
                    + '이(가) 통하지 않았습니다.'); } catch (e) { }
            }
            return false;                     // 소지품에서 빠지지 않는다
        };
        wrapped._dok = true;
        applyItemEffect = wrapped;
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 확인
// ==========================================
window.dokState = function (who) {
    const all = Object.keys((typeof db !== 'undefined' && db.users) || {})
        .map(function (c) { return db.users[c]; }).filter(Boolean);
    const u = who ? all.find(function (x) { return x && (x.no === who || x.code === who || x.name === who); })
                  : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    console.log('%c===== ' + u.name + ' · ' + DOK + ' =====', 'color:#80deea; font-size:13px');
    console.log('  차고 있나:', rawWears(u) ? 'O' : '✗');
    console.log('  장착한 것:', (u.equippedWeapons || []).join(' · ') || '없음');
    console.log('  규칙 — 내가 마신 것: 든다 · 남이 걸어 오는 것: 탄다 · 유리구슬: 든다');
    console.log('  태운 횟수(이 화면에서):', count);
    console.log('  연결 — addTimedEffect:', (typeof addTimedEffect === 'function' && addTimedEffect._dok) ? 'O' : '✗',
        '· applyItemEffect:', (typeof applyItemEffect === 'function' && applyItemEffect._dok) ? 'O' : '✗',
        '· hasEquip:', (typeof hasEquip === 'function' && hasEquip._dok) ? 'O' : '✗');
};

window.dokTest = function () {
    if (!currentUser) { console.log('로그인 후에 쓰세요.'); return; }
    const keep = (currentUser.timedEffects || []).slice();
    const before = keep.length;
    addTimedEffect(currentUser, '시험용 물약', '시험', 1);
    const mineOk = (currentUser.timedEffects || []).length > before;
    currentUser.timedEffects = keep.slice();

    const fake = { code: 'zz_test', name: '시험상대', timedEffects: [],
                   equippedWeapons: [DOK], affiliation: '재난관리국', team: '재난관리' };
    addTimedEffect(fake, '시험용 물약', '시험', 1);
    const otherBlocked = (fake.timedEffects || []).length === 0;
    burned = null;

    console.log('%c===== ' + DOK + ' 시험 =====', 'color:#80deea; font-size:13px');
    console.log('  내가 마신 것:', mineOk ? '든다 O' : '안 든다 ✗',
        rawWears(currentUser) ? '(도깨비 불 차고 있음)' : '(안 차고 있음 — 참고)');
    console.log('  남에게 건 것:', otherBlocked ? '탄다 O' : '통한다 ✗');
    console.log('  걸린 것은 원래대로 돌려놓았습니다.');
};

console.log('[도깨비 불] 면역을 남이 걸어 오는 것에만 — dokState(사번) · dokTest()');

})();
