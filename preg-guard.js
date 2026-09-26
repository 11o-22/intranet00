// ==========================================
// ★ 임신 중 보호 — 남이 쓰는 물약을 막는다
// index.html 에서 preg-dark-fix.js 다음에 불러온다
// ==========================================
//
// 임신한 사원에게 남이 제거약 · 우유맛 · 포도맛을 쓰면
// 몸이 바뀌어 아이가 사라진다. 본인이 쓰는 것은 막지 않는다.

const PREG_GUARD_ITEMS = ['제거약', '우유맛 물약', '포도맛 물약'];

function pregGuarded(user, itemName) {
    if (!user || !itemName) return false;
    if (PREG_GUARD_ITEMS.indexOf(itemName) === -1) return false;
    if (typeof isPregnant !== 'function') return false;
    return isPregnant(user);
}

// --- 1. 대상을 지정해 쓰는 경우 ---
(function guardTargeted() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (isOthers && pregGuarded(targetUser, itemName)) {
            showCustomAlert(`${targetUser.name} 사원은 지금 받을 수 없습니다.\n\n임신 중인 사원에게는 '${itemName}'을(를) 쓸 수 없습니다.`);
            return false;
        }
        return _f.apply(this, arguments);
    };
})();

// --- 2. 대상 목록에서 아예 빼 둔다 ---
(function guardTargetList() {
    if (typeof openItemTargetModal !== 'function') return;
    const _o = openItemTargetModal;

    openItemTargetModal = function (itemName, isPotion) {
        const r = _o.apply(this, arguments);
        if (PREG_GUARD_ITEMS.indexOf(itemName) === -1) return r;

        setTimeout(function () {
            const sel = document.getElementById('item-target-select');
            if (!sel) return;
            let removed = 0;
            Array.from(sel.options).forEach(function (op) {
                if (!op.value) return;
                const u = db.users[op.value];
                if (!u || !isPregnant(u)) return;
                op.remove();
                removed++;
            });
            if (!removed) return;

            const title = document.getElementById('target-modal-title');
            if (title && !document.getElementById('preg-guard-note')) {
                title.insertAdjacentHTML('afterend',
                    `<div id="preg-guard-note" style="font-size:10px; color:#ff8fb1; margin:-6px 0 10px 0; line-height:1.6;">
                        임신 중인 사원 ${removed}명은 목록에서 빠졌습니다.
                     </div>`);
            }
        }, 60);
        return r;
    };
})();

// --- 3. 석류맛 물약 — 무작위 대상에서 임신한 사원을 뺀다 ---
(function guardPomegranate() {
    if (typeof applyItemEffect !== 'function') return;
    const _f = applyItemEffect;

    applyItemEffect = function (targetUser, itemName, isOthers) {
        if (itemName !== '석류맛 물약') return _f.apply(this, arguments);

        const pool = ['grape_potion', 'milk_potion', 'apple_potion', 'orange_potion',
                      'peach_potion', 'cherry_potion', 'pineapple_potion', 'plum_potion', 'persimmon_potion'];
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const risky = (picked === 'grape_potion' || picked === 'milk_potion');

        let cands = Object.keys(db.users).filter(c => c !== 'kario0987');
        if (risky) cands = cands.filter(c => !isPregnant(db.users[c]));   // 임신한 사원은 뺀다
        if (cands.length === 0) { showCustomAlert('적용할 사원이 없습니다.'); return false; }

        const victim = db.users[cands[Math.floor(Math.random() * cands.length)]];
        if (!victim) return false;
        if (!victim.timedEffects) victim.timedEffects = [];

        const finish = function (name, desc) {
            const hrs = (name === '오렌지맛 물약' || name === '바나나맛 물약') ? 3 : 24;
            victim.timedEffects.push({ name: name, desc: desc, expireAt: Date.now() + hrs * 3600000 });
            victim.hasItemUsedOnMe = true;
            addHistoryLog(victim, `[석류맛 물약] 누군가 던진 물약이 당신에게 닿았습니다. (${name})`);
            if (victim.code === currentUser.code) saveSelfFull();
            else updateUserFields(victim.code, {
                timedEffects: victim.timedEffects, history: victim.history, hasItemUsedOnMe: true
            });
            updateUI();
            showCustomAlert(`${victim.name} 님에게 적용되었습니다.\n\n${name}\n${desc}`);
        };

        if (picked === 'cherry_potion') {
            openTextInput('석류맛 물약',
                `개발될 부위를 적어 주세요.<br><span style="color:#888; font-size:10px;">누구에게 갈지는 알 수 없습니다.</span>`,
                '예: 목덜미',
                part => finish('체리맛 물약', `${part} 부위가 예민하게 개발됨`));
            return true;
        }
        if (picked === 'persimmon_potion') {
            openTextInput('석류맛 물약',
                `입힐 코스튬을 적어 주세요.<br><span style="color:#888; font-size:10px;">누구에게 갈지는 알 수 없습니다.</span>`,
                '예: 토끼 옷',
                cos => finish('곶감맛 물약', `${cos} 착용 상태`));
            return true;
        }

        const NAMES = {
            grape_potion:     ['포도맛 물약', '신체 파동 변조 (성별 반전 상태)'],
            milk_potion:      ['우유맛 물약', '신체 변이 (컨트/딕걸)'],
            apple_potion:     ['사과맛 물약', `${ANIMAL_LIST[Math.floor(Math.random() * ANIMAL_LIST.length)]}의 귀와 꼬리 발현 및 습성 발현`],
            orange_potion:    ['오렌지맛 물약', '신체 퇴행 (어린아이 상태)'],
            peach_potion:     ['복숭아맛 물약', '신체 감각 과민 (예민한 몸 상태)'],
            pineapple_potion: ['파인애플맛 물약', '신체 축소 (손바닥 크기)'],
            plum_potion:      ['자두맛 물약', `신체에서 ${CAKE_LIST[Math.floor(Math.random() * CAKE_LIST.length)]} 케이크 맛이 남`]
        };
        const pair = NAMES[picked];
        if (!pair) return false;
        finish(pair[0], pair[1]);
        return true;
    };
})();

// --- 4. 상담사 강제 지급도 막는다 ---
(function guardAdmin() {
    if (typeof adminGiveItem !== 'function') return;
    const _f = adminGiveItem;
    adminGiveItem = function () {
        const items = Array.from(document.querySelectorAll('.adm-item-cb:checked')).map(c => c.value);
        const risky = items.filter(n => PREG_GUARD_ITEMS.indexOf(n) !== -1);
        if (risky.length === 0) return _f.apply(this, arguments);

        // 지급 자체는 막지 않는다. 쓰는 쪽에서 걸린다는 것만 알린다.
        console.log('[임신 보호] 지급 물품 중 보호 대상:', risky.join(', '));
        return _f.apply(this, arguments);
    };
})();

// --- 확인용 ---
function pregGuardState() {
    const pregs = Object.keys(db.users || {}).filter(c => isPregnant(db.users[c]));
    console.log('%c===== 임신 중 보호 =====', 'color:#ff8fb1; font-size:13px');
    console.log('보호 물품:', PREG_GUARD_ITEMS.join(', '));
    if (!pregs.length) { console.log('지금 임신 중인 사원이 없습니다.'); return; }
    console.table(pregs.map(function (c) {
        const u = db.users[c];
        return {
            사번: c, 이름: u.name,
            아버지: (pregOf(u).sires || []).length,
            보호됨: PREG_GUARD_ITEMS.every(n => pregGuarded(u, n)) ? 'O' : 'X'
        };
    }));
}

console.log('[임신] 보호 조치 적용 — pregGuardState() 로 확인');