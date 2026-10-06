// ==========================================
// ★ 남이 채운 것은 스스로 못 뺀다 — 주인 기록이 사라져도
// bundles.json 마지막 그룹, gear-move.js 뒤
// ==========================================
//
// ■ 왜 몇몇에게는 잠금이 안 걸려 있나
//
//   막는 자리는 원래 있다. (index.html:6368 unequipWeapon)
//
//       const ownerCode = getEquipOwner(currentUser, itemNameFull);
//       if (ownerCode && ownerCode !== currentUser.code) { … 막는다 }
//
//   equipOwner 에 「이 라벨은 누가 채웠다」가 적혀 있어야 막는다. 그런데
//   **equipOwner 는 어디서나 통째로 덮어써진다.** 병합 대상 네 가지
//   (points · inventory · timedEffects · itemBuffs) 에 들어 있지 않다.
//
//       가 가 나에게 채운다  → 나의 equippedWeapons(+물건) · equipOwner(+주인)
//       그 사이 나의 화면이 저장 → 제 기준의 equippedWeapons · equipOwner
//
//   나중에 닿는 쪽이 이긴다. 그래서 **물건은 남아 있는데 주인 기록만
//   사라지는** 어긋남이 생긴다. 그러면 위 조건의 ownerCode 가 null 이라
//   그냥 통과한다 — 본인이 뺄 수 있게 된다.
//
//   gear-move.js 의 빗장도 여기까지는 못 막았다. 그 빗장은 남의
//   equippedWeapons 가 줄어드는 것만 보고, equipOwner 는 그대로 통과시켰다.
//   (그 쪽도 같이 고쳐 두었다)
//
// ■ 어떻게 고치나
//
//   라벨에 채운 사람 이름이 이미 적혀 있다.
//
//       유리손포 (장착자: 가)
//       세뇌 만년필 (시술자: 가 과장)
//       클리 흡입기 (장착자: 가 과장)
//       사파이어 요도 플러그 (장착자: 가)
//
//   라벨은 equippedWeapons 안에 있고, 그쪽은 빗장이 지킨다. 그러니
//   **주인 기록이 아니라 라벨을 보고 막는다.** 기록이 사라져도 막힌다.
//
//   「연동:」·「연결:」 은 쓰지 않는다. 그 둘은 쌍으로 차는 것이어서
//   라벨에 적히는 이름이 **채운 사람이 아니라 짝인 상대**다.
//   (index.html:7258 빨간 리본 · 7501 감각 연동) 그것까지 막으면
//   제 것도 못 빼게 된다.
//
//   더불어 사라진 주인 기록을 라벨에서 되살린다. 거둬 가는 쪽
//   (retrieveEquipFromUser) 은 equipOwner 를 보기 때문이다.
//
// ■ 확인
//
//   gearOwnFix()    내 장착칸의 사라진 주인 기록을 되살린다
//   gearOwnScan()   사원 전체 — 라벨엔 장착자가 있는데 기록이 없는 것
//   gearOwnScan(true)  찾은 것을 되살린다 (상담사만)

(function gearOwn() {

// 라벨에 적힌 「채운 사람」 — 연동·연결은 뺀다 (짝의 이름이므로)
const PAT = /\((?:장착자|시술자)\s*:\s*([^)]+)\)/;
const POS = ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '대표', '사장', '상담사'];

function labelWho(w) {
    const m = PAT.exec(String(w || ''));
    return m ? m[1].trim() : null;
}

// 적힌 글에서 사원을 찾는다. 「이름」 또는 「이름 직급」.
function findBy(text) {
    if (typeof db === 'undefined' || !db.users) return [];
    const all = Object.keys(db.users).map(function (c) { return db.users[c]; }).filter(Boolean);
    const tries = [text];
    const parts = String(text).split(/\s+/);
    if (parts.length > 1 && POS.indexOf(parts[parts.length - 1]) >= 0) {
        tries.push(parts.slice(0, -1).join(' '));
    }
    if (parts.length > 1) tries.push(parts[0]);
    for (let i = 0; i < tries.length; i++) {
        const hit = all.filter(function (u) { return u.name === tries[i]; });
        if (hit.length) return hit;
    }
    return [];
}

// 이 라벨은 남이 채운 것인가 — 주인 기록이 없어도 라벨로 안다
function othersLabel(u, w) {
    const who = labelWho(w);
    if (!who) return null;
    const me = u && u.name;
    // 적힌 이름이 나와 같으면 내가 채운 것이다 (막지 않는다)
    const hit = findBy(who);
    if (hit.length === 1 && u && hit[0].code === u.code) return null;
    if (hit.length === 0 && me && who.indexOf(me) === 0) return null;
    return who;
}

// ==========================================
// 하나 — 라벨을 보고 막는다
// ==========================================
(function hookUnequip() {
    const iv = setInterval(function () {
        if (typeof unequipWeapon !== 'function') return;
        if (unequipWeapon._labelLock) { clearInterval(iv); return; }

        const _f = unequipWeapon;
        const wrapped = function (index) {
            if (!window.__equipForce && currentUser) {
                const w = (currentUser.equippedWeapons || [])[index];
                const who = w ? othersLabel(currentUser, w) : null;
                if (who) {
                    const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                    showCustomAlert(base + '\n\n' + who + ' 사원이 채운 것입니다.\n'
                        + '스스로는 뺄 수 없습니다.\n\n채운 사람이 거둬 가야 합니다.');
                    return;
                }
            }
            return _f.apply(this, arguments);
        };
        wrapped._labelLock = true;
        unequipWeapon = wrapped;
        clearInterval(iv);
        console.log('[장착잠금] 라벨에 적힌 장착자로 막습니다 — 주인 기록이 사라져도 걸립니다');
    }, 500);
})();

// ==========================================
// 둘 — 사라진 주인 기록을 라벨에서 되살린다
// ==========================================
function repair(u) {
    if (!u || !Array.isArray(u.equippedWeapons)) return { fixed: [], unsure: [] };
    if (!u.equipOwner) u.equipOwner = {};
    const fixed = [], unsure = [];
    u.equippedWeapons.forEach(function (w) {
        const who = labelWho(w);
        if (!who) return;
        if (u.equipOwner[w]) return;                 // 이미 있다
        const hit = findBy(who);
        if (hit.length === 1) {
            if (hit[0].code === u.code) return;      // 제가 채운 것이면 둘 것도 없다
            u.equipOwner[w] = hit[0].code;
            fixed.push({ 장비: w, 장착자: hit[0].name + '(' + (hit[0].no || hit[0].code) + ')' });
        } else {
            unsure.push({ 장비: w, 적힌이름: who,
                          까닭: hit.length ? ('같은 이름이 ' + hit.length + '명') : '그 이름을 못 찾음' });
        }
    });
    return { fixed: fixed, unsure: unsure };
}

window.gearOwnFix = function () {
    if (!currentUser) { console.warn('로그인이 필요합니다.'); return; }
    const r = repair(currentUser);
    console.log('%c===== 내 장착칸 주인 기록 =====', 'color:#ff8a65; font-size:13px');
    if (r.fixed.length) {
        console.table(r.fixed);
        if (typeof saveFields === 'function') saveFields({ equipOwner: 1 });
        console.log('%c  ' + r.fixed.length + '개를 되살렸습니다. 이제 스스로 뺄 수 없습니다.',
            'color:#4CAF50');
    } else {
        console.log('  되살릴 것이 없습니다.');
    }
    if (r.unsure.length) {
        console.log('%c  이름을 못 맞춘 것 — 라벨로는 그대로 막힙니다', 'color:#ffcf8f');
        console.table(r.unsure);
    }
};

window.gearOwnScan = function (doFix) {
    if (typeof db === 'undefined' || !db.users) { console.warn('사원 표가 아직 없습니다.'); return; }
    const rows = [];
    const todo = [];
    Object.keys(db.users).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.name || !Array.isArray(u.equippedWeapons)) return;
        const own = u.equipOwner || {};
        u.equippedWeapons.forEach(function (w) {
            const who = labelWho(w);
            if (!who || own[w]) return;
            const hit = findBy(who);
            rows.push({ 사원: u.name + '(' + (u.no || c) + ')', 장비: w, 라벨의장착자: who,
                        맞춤: hit.length === 1 ? (hit[0].name + '(' + (hit[0].no || hit[0].code) + ')')
                            : (hit.length ? '같은 이름 ' + hit.length + '명' : '못 찾음') });
            if (hit.length === 1 && hit[0].code !== c) todo.push({ code: c, u: u });
        });
    });

    console.log('%c===== 주인 기록이 빠진 장비 =====', 'color:#ff8a65; font-size:13px');
    if (!rows.length) { console.log('%c  없습니다.', 'color:#4CAF50'); return; }
    console.table(rows);
    console.log('  라벨로는 이미 막힙니다. 다만 채운 사람이 「거둬 가기」를 하려면 기록이 있어야 합니다.');

    if (!doFix) { console.log('  gearOwnScan(true) 로 되살립니다. (상담사만)'); return; }
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 되살릴 수 있습니다.'); return; }

    const seen = {};
    let n = 0;
    todo.forEach(function (t) {
        if (seen[t.code]) return;
        seen[t.code] = 1;
        const r = repair(t.u);
        if (!r.fixed.length) return;
        n += r.fixed.length;
        if (t.code === currentUser.code) {
            if (typeof saveFields === 'function') saveFields({ equipOwner: 1 });
        } else if (typeof updateUserFields === 'function') {
            updateUserFields(t.code, { equipOwner: t.u.equipOwner });
        }
    });
    console.log('%c  ' + n + '개를 되살렸습니다.', 'color:#4CAF50');
};

console.log('[장착잠금] gearOwnFix() · gearOwnScan()');

})();
