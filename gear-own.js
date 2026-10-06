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
//   더불어 사라진 주인 기록을 라벨에서 되살린다. **거둬 가는 쪽도 막혀 있었다.**
//   회수 목록(index.html:6264)과 권한 검사(6425)가 둘 다 equipOwner 만 보기
//   때문에, 기록이 사라지면 채운 사람에게는 목록에 뜨지도 않았다. 차고 있는
//   쪽은 라벨로 막히고 채운 쪽은 거둬 갈 수 없으니 아무도 못 뺐다.
//
// ■ 확인
//
//   들어올 때 한 번, 아래 둘을 조용히 되살린다. 손으로도 부를 수 있다.
//
//   gearOwnFix()      내가 차고 있는 것의 사라진 주인 기록
//   gearOwnClaim()    내가 남에게 채운 것의 사라진 주인 기록 (회수 목록에 뜨게)
//   gearOwnScan()     사원 전체 — 라벨엔 장착자가 있는데 기록이 없는 것
//   gearOwnScan(true) 찾은 것을 전부 되살린다 (상담사만)

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
                    // 라벨에는 「이름 직급」이 적혀 있다. 사원을 찾으면 이름만 쓴다.
                    const hit = findBy(who);
                    const nm = (hit.length === 1) ? hit[0].name : who;
                    showCustomAlert(base + '\n\n' + nm + ' 사원이 채운 것입니다.\n'
                        + '스스로는 뺄 수 없습니다.\n\n채운 사람이 거둬 가야 합니다.');
                    return;
                }
            }
            // 연동·연결 장비는 짝의 장착칸도 줄어든다. 그 쓰기 역시 빗장이
            // 버리므로, 뺀 라벨만 집어 서버에서도 뺀다. (index.html:6405)
            const before = snapOthers();
            const r = _f.apply(this, arguments);
            try { pullShrinks(before); }
            catch (e) { console.warn('[장착잠금] 짝 해제 마무리 건너뜀:', e && e.message); }
            return r;
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

// ==========================================
// 셋 — 거둬 가는 쪽도 라벨로 되찾는다
// ==========================================
//
// 거둬 가기는 두 자리 모두 equipOwner 만 본다.
//
//     index.html:6264  회수 목록   getEquipOwner(u, w) === currentUser.code
//     index.html:6425  권한 검사   getEquipOwner(t, full) !== currentUser.code
//
// 그래서 기록이 사라지면 **채운 사람에게는 목록에 뜨지도 않는다.** 차고 있는
// 쪽은 라벨로 막히고, 채운 쪽은 거둬 갈 수가 없으니 아무도 못 뺀다.
// 그것이 「장착시킨 사람도 제거가 안 된다」는 것이다.
//
// 그래서 들어올 때 한 번, 라벨이 나를 가리키는데 기록이 없는 것을 되찾는다.
// 라벨에 내 이름이 적혀 있으니 임자는 나다. 더하기만 하고 지우지 않는다.
// ==========================================
// 남의 장착칸에서 **뜻한 것만** 서버에서도 뺀다
// ==========================================
//
//   index.html 의 두 자리는 줄어든 배열을 통째로 보낸다.
//       6405  내가 벗을 때 짝(연동·연결)의 것도 뺀다
//       6453  내가 채운 것을 거둬 간다
//   그런데 gear-move.js 의 빗장이 「남의 장착칸이 줄어드는 통째 쓰기」를
//   막는다. 묵은 배열이 남의 장비를 통째로 지우는 사고를 막는 자리다.
//
//   그래서 그 쓰기는 버려지고, 상대에게는 장비가 그대로 남은 채 내 소지품에만
//   물건이 들어온다 — **하나가 둘이 된다.**
//
//   빗장은 그대로 둔다. 대신 부르기 전후의 **내 화면 값을 견주어**, 그 코드가
//   빼려던 라벨만 집어 gearPull 로 하나씩 뺀다. 묵은 배열과 달리 이것은 뜻이
//   분명한 제거다.
function snapOthers() {
    const m = {};
    if (typeof db === 'undefined' || !db.users || !currentUser) return m;
    Object.keys(db.users).forEach(function (c) {
        if (c === currentUser.code) return;
        const u = db.users[c];
        if (u && Array.isArray(u.equippedWeapons)) m[c] = u.equippedWeapons.slice();
    });
    return m;
}
function pullShrinks(before) {
    if (typeof gearPull !== 'function' || typeof db === 'undefined' || !db.users) return 0;
    let n = 0;
    Object.keys(before).forEach(function (c) {
        const u = db.users[c];
        if (!u || !Array.isArray(u.equippedWeapons)) return;
        const now = u.equippedWeapons.slice();
        const gone = [];
        before[c].forEach(function (w) {
            const i = now.indexOf(w);
            if (i >= 0) now.splice(i, 1); else gone.push(w);
        });
        if (gone.length) { gearPull(c, gone); n += gone.length; }
    });
    return n;
}

function ownTxn(code, label) {
    if (typeof database === 'undefined' || !database) return Promise.resolve(false);
    return database.ref('users/' + code + '/equipOwner').transaction(function (srv) {
        const o = (srv && typeof srv === 'object') ? srv : {};
        if (o[label]) return;                       // 이미 있다 — 건드리지 않는다
        o[label] = currentUser.code;
        return o;
    }, null, false).then(function (r) {
        const ok = !!(r && r.committed);
        // 화면 쪽도 바로 맞춘다. 회수 목록(index.html:6264)은 db.users 를 읽으므로
        // 서버 메아리를 기다리면 눌러도 한동안 안 뜬다.
        if (ok) {
            try {
                const u = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
                if (u) { if (!u.equipOwner) u.equipOwner = {}; u.equipOwner[label] = currentUser.code; }
            } catch (e) { }
        }
        return ok;
    }).catch(function (e) { console.warn('[장착잠금] 되찾기 실패:', e && e.message); return false; });
}

// 라벨이 나를 가리키는 남의 장비를 찾는다
function minesOut() {
    const out = [];
    if (typeof db === 'undefined' || !db.users || !currentUser) return out;
    Object.keys(db.users).forEach(function (c) {
        if (c === currentUser.code) return;
        const u = db.users[c];
        if (!u || !Array.isArray(u.equippedWeapons)) return;
        const own = u.equipOwner || {};
        u.equippedWeapons.forEach(function (w) {
            const who = labelWho(w);
            if (!who || own[w]) return;
            const hit = findBy(who);
            if (hit.length === 1 && hit[0].code === currentUser.code) {
                out.push({ code: c, name: u.name, label: w });
            }
        });
    });
    return out;
}

window.gearOwnClaim = function (quiet) {
    const rows = minesOut();
    if (!rows.length) {
        if (!quiet) console.log('[장착잠금] 되찾을 것이 없습니다.');
        return Promise.resolve(0);
    }
    return Promise.all(rows.map(function (r) { return ownTxn(r.code, r.label); }))
        .then(function (res) {
            const n = res.filter(Boolean).length;
            if (n) {
                console.log('%c[장착잠금] 내가 채운 장비 ' + n + '개의 주인 기록을 되찾았습니다. '
                    + '이제 회수 목록에 뜹니다.', 'color:#4CAF50');
                if (!quiet) console.table(rows.map(function (r) {
                    return { 사원: r.name + '(' + r.code + ')', 장비: r.label };
                }));
                if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }
            }
            return n;
        });
};

// 거둬 갈 때도 라벨을 본다 — 기록이 없으면 그 자리에서 되찾고 넘긴다
(function hookRetrieve() {
    const iv = setInterval(function () {
        if (typeof retrieveEquipFromUser !== 'function') return;
        if (retrieveEquipFromUser._label) { clearInterval(iv); return; }

        const _r = retrieveEquipFromUser;
        const wrapped = function (targetCode, idx) {
            let t = null, w = null;
            try {
                t = (typeof db !== 'undefined' && db.users) ? db.users[targetCode] : null;
                w = t && (t.equippedWeapons || [])[idx];
                if (w && currentUser) {
                    const have = (typeof getEquipOwner === 'function') ? getEquipOwner(t, w) : null;
                    if (!have) {
                        const who = labelWho(w);
                        const hit = who ? findBy(who) : [];
                        if (hit.length === 1 && hit[0].code === currentUser.code) {
                            if (!t.equipOwner) t.equipOwner = {};
                            t.equipOwner[w] = currentUser.code;      // 화면 쪽을 먼저 맞춘다
                            ownTxn(targetCode, w);                    // 서버에도 적어 둔다
                        }
                    }
                }
            } catch (e) { }

            const before = snapOthers();
            const r = _r.apply(this, arguments);
            // 서버에서도 정말 빼낸다 (빗장이 통째 쓰기를 버리므로)
            try { pullShrinks(before); }
            catch (e) { console.warn('[장착잠금] 회수 마무리 건너뜀:', e && e.message); }
            return r;
        };
        wrapped._label = true;
        retrieveEquipFromUser = wrapped;
        clearInterval(iv);
        console.log('[장착잠금] 거둬 가기도 라벨을 봅니다');
    }, 500);
})();

// 들어올 때 한 번 — 내 것과 내가 채운 것을 조용히 되찾는다
(function autoFix() {
    let done = false;
    const iv = setInterval(function () {
        if (done) { clearInterval(iv); return; }
        if (!currentUser || typeof db === 'undefined' || !db.users) return;
        if (Object.keys(db.users).length < 2) return;      // 사원 표가 아직 덜 왔다
        done = true;
        clearInterval(iv);
        try {
            const r = repair(currentUser);                  // 내가 차고 있는 것
            if (r.fixed.length) {
                if (typeof saveFields === 'function') saveFields({ equipOwner: 1 });
                console.log('[장착잠금] 내 장착칸의 주인 기록 ' + r.fixed.length + '개를 되살렸습니다.');
            }
        } catch (e) { }
        try { window.gearOwnClaim(true); } catch (e) { }    // 내가 채운 것
    }, 1500);
})();

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
