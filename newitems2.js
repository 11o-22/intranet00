// ==========================================
// ★ 신규 아이템 26종
//   백일몽 15 · 재난관리국 10 · 뱃지 1
// index.html 에서 맨 뒤(equip-fix.js 다음)에 불러온다
// ==========================================
//
// 행운·판정·회피·공용시설·어둠 횟수·기믹 파훼는
// 기존 DNA 효과 배선(dnaGiftOf)에 임시 버프로 얹는다.
// 오염 동결은 addPollution 을, 정산 보너스는 renderDarkResult 를,
// 확정 구출은 attemptRescue 를 잡아서 처리한다.

(function () {

// ==========================================
// 0. 공용 도구
// ==========================================
const HOUR = 3600 * 1000;

function today() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return h;
}

// 하루 동안 고정되는 굴림 — 다시 그려도 결과가 안 바뀐다
function dayRoll(name, pct) {
    const c = (currentUser && currentUser.code) || '?';
    return (hash(c + '|' + name + '|' + today()) % 100) < pct;
}

function affilText(u) {
    return ((u && u.affiliation) || '') + ' ' + ((u && u.team) || '');
}

function isCounsel(u) { return u && u.code === 'kario0987'; }

// 오늘 자정까지 남은 시간
function msToMidnight() {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return Math.max(60000, d.getTime() - Date.now());
}

// 이 파일이 맡는 효과인지 — n_… 과 equip_n_… 둘 다
function isNewEff(e) {
    e = String(e || '');
    return e.indexOf('n_') === 0 || e.indexOf('equip_n_') === 0;
}

// ==========================================
// 1. 임시 버프 — dnaGiftOf 에 얹는다
// ==========================================
function ibList(u) {
    u = u || currentUser;
    if (!u.itemBuffs) u.itemBuffs = [];
    return u.itemBuffs;
}

function ibClean(u) {
    const now = Date.now();
    const keep = ibList(u).filter(function (b) {
        if (b.run) return true;                 // 다음 어둠 1회짜리
        return !b.until || b.until > now;
    });
    u.itemBuffs = keep;
    return keep;
}

function ibAdd(u, k, v, ms, src, opt) {
    u = u || currentUser;
    const b = { k: k, v: v, src: src || '' };
    if (opt && opt.run) b.run = 1; else b.until = Date.now() + (ms || 24 * HOUR);
    ibList(u).push(b);
    if (u.code === currentUser.code) saveFields({ itemBuffs: 1 });
    else if (typeof updateUserFields === 'function') updateUserFields(u.code, { itemBuffs: u.itemBuffs });
    return b;
}

function ibSum(u) {
    const out = {};
    ibClean(u).forEach(function (b) { out[b.k] = (out[b.k] || 0) + b.v; });
    return out;
}

// 은심장 누적 보정
function heartBonus(u) {
    if (!hasSilverHeart(u)) return {};
    const n = u.heartSaves || 0;
    const step = Math.min(5, Math.floor(n / 2));
    const out = {};
    if (step) { out.luck = step; out.eva = step; out.bon = step; }
    if (n >= 50) out.gim = (out.gim || 0) + 1;
    return out;
}

// 장착 중인 신규 장비의 상시 효과
const PASSIVE = {
    '꿈결 수집기': { pct: 100, fac: 1 },
    '포승줄':      { bon: 5 },
    '공기 누름돌': { luck: 2 },
    '은색 저울':   {}
};

function passiveSum(u) {
    const out = {};
    (u.equippedWeapons || []).forEach(function (w) {
        const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
        const p = PASSIVE[base];
        if (!p) return;
        Object.keys(p).forEach(function (k) { out[k] = (out[k] || 0) + p[k]; });
    });
    return out;
}

(function hookGift() {
    const iv = setInterval(function () {
        if (typeof dnaGiftOf !== 'function') return;
        if (dnaGiftOf._newItems) { clearInterval(iv); return; }
        const _d = dnaGiftOf;
        dnaGiftOf = function (user) {
            const base = _d.apply(this, arguments) || {};
            const u = user || currentUser;
            if (!u) return base;
            // 효과는 바깥이 아니라 e 안에 들어간다
            const out = Object.assign({}, base);
            out.e = Object.assign({}, base.e || {});
            [ibSum(u), passiveSum(u), heartBonus(u)].forEach(function (m) {
                Object.keys(m).forEach(function (k) { out.e[k] = (out.e[k] || 0) + m[k]; });
            });
            return out;
        };
        dnaGiftOf._newItems = true;
        clearInterval(iv);
        console.log('[신규] 임시 버프 배선 연결');
    }, 500);
})();

// ==========================================
// ★ 바깥에서도 쓸 수 있게 내어 둔다
// ==========================================
//
// 이 파일은 통째로 하나의 (function(){ … })() 안에 들어 있다.
// 그래서 여기서 만든 것은 **다른 파일에서 안 보인다.**
// 그런데 바깥에서 이렇게 부르고 있었다.
//
//     if (typeof ibAdd === 'function') ibAdd(...)      ← restaurant.js
//     try { if (ibSum(u).noPoll) … } catch (e) { }     ← poll-freeze.js
//
// typeof 가 늘 'undefined' 라 **말없이 건너뛰었고**, try/catch 쪽은
// 던져진 것을 삼켰다. 식당 S등급의 「공용시설 +n회 · 어둠 탐사 +n회」는
// 알림에는 뜨는데 실제로는 아무것도 안 붙던 까닭이 이것이다.
//
// 함수 선언은 이 울타리 맨 위로 끌어올려지므로, 아래에 적힌 것이라도
// 여기서 내어 둘 수 있다.
window.ibAdd = ibAdd;                      // 임시 버프 붙이기 (식당 ★ 등)
window.ibSum = ibSum;                      // 붙어 있는 임시 버프 합
window.ibList = ibList;
window.ibClean = ibClean;
window.hasSilverHeart = hasSilverHeart;    // heart2.js
window.removeBadgeLine = removeBadgeLine;  // cage.js

// ==========================================
// 2. 사용 횟수 — 하루 제한 · 총 횟수
// ==========================================
function dayLeft(u, name, max) {
    u = u || currentUser;
    if (!u.dayUse) u.dayUse = {};
    const r = u.dayUse[name];
    if (!r || r.d !== today()) { u.dayUse[name] = { d: today(), n: 0 }; }
    return max - u.dayUse[name].n;
}

function daySpend(u, name) {
    u = u || currentUser;
    u.dayUse[name].n++;
    saveFields({ dayUse: 1 });
}

// 총 N회 쓰면 사라지는 물건
function totalSpend(name, max) {
    if (!currentUser.useCnt) currentUser.useCnt = {};
    const n = (currentUser.useCnt[name] || 0) + 1;
    currentUser.useCnt[name] = n;
    if (n >= max) {
        delete currentUser.useCnt[name];
        removeItemFromInventory(currentUser, name, 1);
        unequipByName(name);
        saveFields({ useCnt: 1 });
        return { gone: true, left: 0 };
    }
    saveFields({ useCnt: 1 });
    return { gone: false, left: max - n };
}

function unequipByName(name) {
    const eq = currentUser.equippedWeapons || [];
    const i = eq.findIndex(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
    if (i < 0) return false;
    const full = eq[i];
    eq.splice(i, 1);
    if (currentUser.equipOwner) delete currentUser.equipOwner[full];
    saveSelfFull();
    return true;
}

function hasEquipped(u, name) {
    if (!u) return false;
    return (u.equippedWeapons || []).some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}

function hasAny(u, name) {
    if (!u) return false;
    return hasEquipped(u, name) || (u.inventory || []).indexOf(name) >= 0;
}

// 소지품에 둔 채로 몸에 걸치는 것들 — 표적 버튼을 같이 남기기 위해
function wornOn(u, name) {
    if (!u) return false;
    if (u.wornItems && u.wornItems[name]) return true;
    return hasEquipped(u, name);
}

// 특이사항 글이 담긴 칸을 찾는다.
// badge 는 { nickname, gender, posTag, ... } 객체다. 통째로 덮으면 안 된다.
function badgeNoteKey(u) {
    const b = u && u.badge;
    if (!b || typeof b !== 'object') return null;
    const want = ['note', 'notes', 'memo', 'special', 'etc', 'desc', 'text'];
    for (let i = 0; i < want.length; i++) {
        if (typeof b[want[i]] === 'string') return want[i];
    }
    // 못 찾으면 가장 긴 글 칸
    let best = null, len = -1;
    Object.keys(b).forEach(function (k) {
        if (typeof b[k] === 'string' && b[k].length > len) { best = k; len = b[k].length; }
    });
    return best;
}

// 특이사항에서 한 줄을 지운다
function removeBadgeLine(u, needle) {
    if (!u || !u.badge) return;

    if (typeof u.badge === 'object') {
        const key = badgeNoteKey(u);
        if (!key) return;
        const raw = String(u.badge[key] || '');
        const br = /<br\s*\/?>/i.test(raw);
        const parts = raw.split(/<br\s*\/?>|\n/);
        const keep = parts.filter(function (x) { return x.indexOf(needle) < 0; });
        if (keep.length === parts.length) return;
        u.badge[key] = keep.join(br ? '<br>' : '\n');
    } else {
        const raw = String(u.badge);
        const br = /<br\s*\/?>/i.test(raw);
        const parts = raw.split(/<br\s*\/?>|\n/);
        const keep = parts.filter(function (x) { return x.indexOf(needle) < 0; });
        if (keep.length === parts.length) return;
        u.badge = keep.join(br ? '<br>' : '\n');
    }

    if (u.code === currentUser.code) saveFields({ badge: 1 });
    else if (typeof updateUserFields === 'function') updateUserFields(u.code, { badge: u.badge });
}

function toggleWorn(name) {
    const u = currentUser;
    const on = !hasEquipped(u, name);

    if (on) {
        if (!u.equippedWeapons) u.equippedWeapons = [];
        if (visibleSlots(u) >= 8) { showCustomAlert('장착칸이 가득 찼습니다.'); return; }
        if ((u.inventory || []).indexOf(name) === -1) { showCustomAlert('소지품에 없습니다.'); return; }
        u.equippedWeapons.push(name);
        if (typeof setEquipOwner === 'function') setEquipOwner(u, name, u.code);
        removeItemFromInventory(u, name, 1);
        appendBadgeNoteToUser(u, '[장착됨] ' + name);
        addHistoryLog(u, '[장착] ' + name);
        saveSelfFull();
        updateUI();
        showCustomAlert(name + '을(를) 몸에 걸었습니다.\n\n장착칸의 「표적」을 눌러 사원을 고르세요.');
        return;
    }

    // 내려놓기 — 빼앗은 것을 전부 돌려주고 소지품으로
    const backCnt = returnBySource(name);
    const eq = u.equippedWeapons || [];
    const at = eq.indexOf(name);
    if (at >= 0) eq.splice(at, 1);
    if (u.equipOwner) delete u.equipOwner[name];
    u.inventory = u.inventory || [];
    u.inventory.push(name);
    removeBadgeLine(u, '[장착됨] ' + name);
    addHistoryLog(u, '[해제] ' + name);
    saveSelfFull();
    updateUI();
    showCustomAlert(name + '을(를) 내려놓았습니다.'
        + (backCnt ? '\n\n빼앗았던 ' + backCnt + '건이 제자리로 돌아갔습니다.' : ''));
}

// 보이는 칸 수 — 빼앗아 온 것은 세지 않는다
function visibleSlots(u) {
    return (u.equippedWeapons || []).filter(function (w) {
        return !((u.stolenGear || {})[w]);
    }).length;
}

// 그 물건으로 빼앗은 것을 전부 돌려준다
function returnBySource(srcName) {
    const bag = stolenBag(currentUser);
    let n = 0;
    Object.keys(bag).forEach(function (k) {
        if (bag[k] && bag[k].src !== srcName) return;
        if (returnStolen(k, true)) n++;
    });
    return n;
}

// ==========================================
// 3. 정산 보너스 — 어둠이 끝날 때 받는다
// ==========================================
function addDarkPt(u, v, why) {
    u = u || currentUser;
    u.darkPtPend = (u.darkPtPend || 0) + v;
    if (why) {
        if (!u.darkPtWhy) u.darkPtWhy = [];
        u.darkPtWhy.push(why + ' +' + v.toLocaleString() + 'P');
    }
    if (u.code === currentUser.code) saveFields({ darkPtPend: 1, darkPtWhy: 1 });
    else if (typeof updateUserFields === 'function') {
        updateUserFields(u.code, { darkPtPend: u.darkPtPend, darkPtWhy: u.darkPtWhy || [] });
    }
}

function payDarkPt() {
    const u = currentUser;
    let v = u.darkPtPend || 0;

    // 보유만으로 붙는 것들
    if (hasEquipped(u, '꿈결 수집기')) { v += 5000; (u.darkPtWhy = u.darkPtWhy || []).push('꿈결 수집기 +5,000P'); }
    if (hasSilverHeart(u) && (u.heartSaves || 0) >= 30) {
        v += 5000; (u.darkPtWhy = u.darkPtWhy || []).push('은심장 +5,000P');
    }
    const cage = u.cageSaved || 0;
    if (hasEquipped(u, '％＄＠＆ 이동장') && cage > 0) {
        const got = Math.min(9000, cage * 1500);
        v += got; (u.darkPtWhy = u.darkPtWhy || []).push('％＄＠＆ 이동장 +' + got.toLocaleString() + 'P');
        u.cageSaved = 0;
    }

    const why = (u.darkPtWhy || []).slice();
    u.darkPtPend = 0; u.darkPtWhy = [];

    // 1회짜리 버프를 걷는다
    u.itemBuffs = ibList(u).filter(function (b) { return !b.run; });

    if (v > 0) {
        u.points = (u.points || 0) + v;
        addHistoryLog(u, '[추가 정산] +' + v.toLocaleString() + 'P — ' + why.join(' · '));
        saveFields({ points: 1, darkPtPend: 1, darkPtWhy: 1, itemBuffs: 1, cageSaved: 1 });
        setTimeout(function () {
            showCustomAlert('추가 정산\n\n' + why.join('\n') + '\n\n합계 +' + v.toLocaleString() + 'P');
        }, 900);
    } else {
        saveFields({ itemBuffs: 1 });
    }
}

(function hookSettle() {
    const iv = setInterval(function () {
        let hit = 0;
        ['renderDarkResult', 'epicSettle'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newPay) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                try { payDarkPt(); } catch (e) { console.warn('[신규] 정산 보너스', e); }
                return r;
            };
            window[n]._newPay = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] 정산 보너스 연결'); }
    }, 500);
})();

// ==========================================
// 4. 오염 동결
// ==========================================
function freezePoll(h, src) {
    const till = Date.now() + h * HOUR;
    if ((currentUser.pollFreezeUntil || 0) < till) currentUser.pollFreezeUntil = till;
    saveFields({ pollFreezeUntil: 1 });
    addHistoryLog(currentUser, '[' + src + '] 오염 ' + h + '시간 동결');
}

(function hookPoll() {
    const iv = setInterval(function () {
        if (typeof addPollution !== 'function') return;
        if (addPollution._newFreeze) { clearInterval(iv); return; }
        const _a = addPollution;
        addPollution = function (amt) {
            const u = currentUser;
            if (u && (u.pollFreezeUntil || 0) > Date.now() && (amt || 0) > 0) return;
            if (u && ibSum(u).noPoll && (amt || 0) > 0) return;      // 부적이 깃든 등 — 오염 동결
            return _a.apply(this, arguments);
        };
        addPollution._newFreeze = true;
        clearInterval(iv);
        console.log('[신규] 오염 동결 연결');
    }, 500);
})();

// ==========================================
// 5. 확정 구출
// ==========================================
// 남을 살릴 때 쓰는 확정권이 남아 있는지
function rescueGuarantee() {
    const u = currentUser;
    if (hasSilverHeart(u) && (u.heartSaves || 0) >= 10) return '은심장';
    if (hasEquipped(u, '％＄＠＆ 이동장')) {
        if (!u.cageRun || u.cageRun !== (darkRun && darkRun.zone) + '|' + today()) return '％＄＠＆ 이동장';
    }
    if ((u.paperBoat | 0) > 0) return '종이배';
    if (hasAny(u, '전용 자전거') && dayLeft(u, '전용 자전거', 2) > 0) return '전용 자전거';
    if (hasEquipped(u, '포승줄')) return '포승줄';
    if (hasEquipped(u, '통신 단추') && (u.buttonUses | 0) > 0) return '통신 단추';
    return null;
}

// epic 쪽에서도 「확정권이 있나」를 물어본다 (epic-grim.js)
window.rescueGuarantee = rescueGuarantee;

function spendGuarantee(src) {
    const u = currentUser;

    if (src === '％＄＠＆ 이동장') {
        u.cageRun = (darkRun && darkRun.zone) + '|' + today();

    } else if (src === '전용 자전거') {
        daySpend(u, src);

    } else if (src === '종이배') {
        u.paperBoat = Math.max(0, (u.paperBoat | 0) - 1);
        if (u.paperBoat === 0) {
            removeBadgeLine(u, '🛶 종이배');
            setTimeout(function () { showCustomAlert('종이배가 물에 풀렸습니다.'); }, 900);
        }
        saveFields({ paperBoat: 1 });

    } else if (src === '포승줄') {
        // 열 번 쓰면 끊어진다 — totalSpend 가 물품칸·장착칸까지 비워 준다
        const r = totalSpend('포승줄', 10);
        if (r.gone) {
            if (typeof stripNoteByItem === 'function') stripNoteByItem(u, '포승줄');
            removeBadgeLine(u, '포승줄');
            setTimeout(function () { showCustomAlert('포승줄이 끊어졌습니다.'); }, 900);
        } else {
            setTimeout(function () { showCustomAlert('포승줄이 한 가닥 풀렸습니다.\n\n남은 횟수 ' + r.left + '회'); }, 900);
        }

    } else if (src === '통신 단추') {
        u.buttonUses = Math.max(0, (u.buttonUses | 0) - 1);
        if (u.buttonUses === 0) {
            const eq = u.equippedWeapons || [];
            const at = eq.findIndex(function (w) {
                return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === '통신 단추';
            });
            if (at >= 0) {
                const full = eq[at];
                eq.splice(at, 1);
                if (u.equipOwner) delete u.equipOwner[full];
            }
            removeBadgeLine(u, '[장착됨] 통신 단추');
            setTimeout(function () { showCustomAlert('단추가 부서졌습니다.'); }, 900);
        }
        saveFields({ buttonUses: 1 });
    }

    u.cageSaved = (u.cageSaved || 0) + 1;
    u.heartSaves = (u.heartSaves || 0) + 1;
    saveFields({ cageRun: 1, cageSaved: 1, heartSaves: 1 });
    saveSelfFull();
}

// 진실 마스크 — 쓰고 있는 사람이 스스로를 구하면 양쪽에 5,000P.
// 다섯 번이면 부서진다. (적힌 대로 닳는 셈이 아예 없어서 영영 안 부서졌다)
const MASK = '진실 마스크';
const MASK_USES = 5;

function maskPay(u) {
    if (!u) return;
    const worn = (u.equippedWeapons || []).filter(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === MASK;
    });
    if (!worn.length) return;

    worn.forEach(function (w) {
        const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
        addDarkPt(u, 5000, MASK);
        if (o && o !== u.code && db.users[o]) addDarkPt(db.users[o], 5000, MASK);
    });

    if (!currentUser || u.code !== currentUser.code) return;   // 세는 칸은 내 것뿐이다
    const r = totalSpend(MASK, MASK_USES);                     // 물품칸·장착칸까지 비워 준다
    if (r.gone) {
        if (typeof stripNoteByItem === 'function') stripNoteByItem(u, MASK);
        if (typeof removeBadgeLine === 'function') removeBadgeLine(u, MASK);
        addHistoryLog(u, '[' + MASK + '] 다섯 번을 채우고 부서졌습니다.');
        setTimeout(function () { showCustomAlert(MASK + '가 부서졌습니다.'); }, 1200);
    } else {
        addHistoryLog(u, '[' + MASK + '] 남은 횟수 ' + r.left + '회');
    }
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
}

// 굴림을 한 번 확정으로 만든다
function withLucky(fn, ctx, args) {
    const _r = Math.random;
    Math.random = function () { return 0.0001; };
    try { return fn.apply(ctx, args); }
    finally { Math.random = _r; }
}

(function hookRescue() {
    const iv = setInterval(function () {
        if (typeof attemptRescue !== 'function') return;
        if (attemptRescue._newSure) { clearInterval(iv); return; }
        const _a = attemptRescue;
        attemptRescue = function () {
            const src = rescueGuarantee();
            const u = currentUser;

            maskPay(u);                       // 진실 마스크 — 양쪽 정산 · 다섯 번이면 부서진다

            if (!src) {
                u.heartSaves = (u.heartSaves || 0) + 1;
                saveFields({ heartSaves: 1 });
                return _a.apply(this, arguments);
            }

            const r = withLucky(_a, this, arguments);
            spendGuarantee(src);
            addHistoryLog(u, '[확정 구출] ' + src);
            setTimeout(function () {
                showCustomAlert(src + '이(가) 손을 대신 뻗었습니다.\n\n구출이 확정되었습니다.');
            }, 700);
            return r;
        };
        attemptRescue._newSure = true;
        clearInterval(iv);
        console.log('[신규] 확정 구출 연결');
    }, 500);
})();

// epic 쪽 구출 — epicDoomRescue 는 luckReroll 로 한 번 굴린다
(function hookEpicRescue() {
    const iv = setInterval(function () {
        if (typeof epicDoomRescue !== 'function' || typeof luckReroll !== 'function') return;
        if (epicDoomRescue._newSure) { clearInterval(iv); return; }

        // 깃발이 서 있을 때 딱 한 번만 20
        const _l = luckReroll;
        luckReroll = function () {
            if (window.__epicSureRoll) { window.__epicSureRoll = false; return 20; }
            return _l.apply(this, arguments);
        };

        const _e = epicDoomRescue;
        epicDoomRescue = function () {
            const u = currentUser;
            const src = rescueGuarantee();

            maskPay(u);                       // 진실 마스크 — 양쪽 정산 · 다섯 번이면 부서진다

            if (!src) {
                u.heartSaves = (u.heartSaves || 0) + 1;
                saveFields({ heartSaves: 1 });
                return _e.apply(this, arguments);
            }

            window.__epicSureRoll = true;
            setTimeout(function () { window.__epicSureRoll = false; }, 8000);   // 안전장치
            spendGuarantee(src);
            addHistoryLog(u, '[확정 구출] ' + src);
            setTimeout(function () {
                showCustomAlert(src + '이(가) 손을 대신 뻗었습니다.\n\n구출이 확정되었습니다.');
            }, 1400);
            return _e.apply(this, arguments);
        };
        epicDoomRescue._newSure = true;
        clearInterval(iv);
        console.log('[신규] epic 확정 구출 연결');
    }, 500);
})();

// 끌려감 방어 — epic 쪽 저항도 같이
(function hookMoreResist() {
    const NAMES = ['b508Resist', 'a667Grab', 'dark087Roll'];
    const iv = setInterval(function () {
        let hit = 0;
        NAMES.forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newLine) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const u = currentUser;
                if (!u.lineGuard || u.lineGuard <= 0) return _f.apply(this, arguments);
                u.lineGuard--;
                saveFields({ lineGuard: 1 });
                window.__epicSureRoll = true;
                setTimeout(function () { window.__epicSureRoll = false; }, 8000);
                const out = withLucky(_f, this, arguments);
                setTimeout(function () {
                    showCustomAlert('낚시 줄이 손목을 붙들었습니다.\n\n남은 방어 ' + u.lineGuard + '회');
                }, 700);
                return out;
            };
            window[n]._newLine = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] epic 끌려감 방어 연결'); }
    }, 500);
})();

// 은색 저울 — 같이 가라앉을 확률을 늘 보여 준다
function scaleRisk(u) {
    u = u || currentUser;
    if (!u) return 0;
    const poll = u.pollution || 0;
    const g = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(u) || {}) : {};
    const e = g.e || {};
    const bon = (e.bon || 0) + (e.luck || 0) / 2;
    return Math.round(Math.max(5, Math.min(92, 34 + poll * 0.45 - bon * 4)));
}

(function scaleBoard() {
    const ID = 'silver-scale-box';

    function draw() {
        if (typeof currentUser === 'undefined' || !currentUser) {
            const b0 = document.getElementById(ID);
            if (b0) b0.remove();
            return;
        }
        const on = hasEquipped(currentUser, '은색 저울')
                || (currentUser.borrowedGear || []).some(function (w) {
                       return String(w).indexOf('은색 저울') === 0;
                   });
        const inRun = (typeof darkRun !== 'undefined') && darkRun;
        let box = document.getElementById(ID);

        if (!on || !inRun) { if (box) box.remove(); return; }

        const risk = scaleRisk(currentUser);
        currentUser._scaleRisk = risk;

        if (!box) {
            box = document.createElement('div');
            box.id = ID;
            box.style.cssText = 'position:fixed;right:10px;bottom:84px;z-index:9998;'
                + 'padding:8px 12px;border:1px solid #6b7a8f;border-radius:4px;'
                + 'background:rgba(12,16,22,0.92);color:#cfd8e3;font-size:12px;'
                + 'letter-spacing:0.3px;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,0.5)';
            document.body.appendChild(box);
        }
        box.innerHTML = '은색 저울<br><b style="color:'
            + (risk > 50 ? '#ff8f8f' : '#9fe0a6') + ';font-size:15px">'
            + risk + '%</b> <span style="color:#8a8f98">함께 가라앉을 확률</span>';
    }

    setInterval(draw, 1200);
    setTimeout(draw, 1500);
    window.scaleBoardNow = draw;
})();

// 저울이 나쁘다고 했는데도 살렸다면 — 조용히 얹는다
(function hookScalePay() {
    const iv = setInterval(function () {
        if (typeof attemptRescue !== 'function' || !attemptRescue._newSure) return;
        if (attemptRescue._newScalePay) { clearInterval(iv); return; }
        const _a = attemptRescue;
        attemptRescue = function () {
            const risk = currentUser._scaleRisk || 0;
            if (hasEquipped(currentUser, '은색 저울') && risk > 50) {
                addDarkPt(currentUser, 5000, '저울');
            }
            currentUser._scaleRisk = 0;
            return _a.apply(this, arguments);
        };
        attemptRescue._newScalePay = true;
        clearInterval(iv);
    }, 700);
})();

// ==========================================
// 6. 끌려감 방어 — 낚시 줄
// ==========================================
(function hookAbduct() {
    const iv = setInterval(function () {
        if (typeof resistAbduction !== 'function') return;
        if (resistAbduction._newLine) { clearInterval(iv); return; }
        const _r = resistAbduction;
        resistAbduction = function () {
            const u = currentUser;
            if (!u.lineGuard || u.lineGuard <= 0) return _r.apply(this, arguments);
            u.lineGuard--;
            saveFields({ lineGuard: 1 });
            const out = withLucky(_r, this, arguments);
            setTimeout(function () {
                showCustomAlert('낚시 줄이 손목을 붙들었습니다.\n\n남은 방어 ' + u.lineGuard + '회');
            }, 600);
            return out;
        };
        resistAbduction._newLine = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 7. 은심장
// ==========================================
const HEART = '🩶 은심장';

function hasSilverHeart(u) {
    if (!u) return false;
    return (u.inventory || []).indexOf(HEART) >= 0 || hasEquipped(u, HEART);
}

// 잃어버리지 않는다 — 소지품에서 빠지지 않게 막는다
(function hookHeartKeep() {
    const iv = setInterval(function () {
        if (typeof removeItemFromInventory !== 'function') return;
        if (removeItemFromInventory._heartLock) { clearInterval(iv); return; }
        const _r = removeItemFromInventory;
        removeItemFromInventory = function (user, name) {
            if (name === HEART && !window.__heartUnlock) {
                console.warn('[은심장] 사라지지 않습니다.');
                return false;
            }
            return _r.apply(this, arguments);
        };
        removeItemFromInventory._heartLock = true;
        clearInterval(iv);
    }, 500);
})();

// 상담사만 줄 수 있다
window.giveSilverHeart = function (no) {
    if (!isCounsel(currentUser)) { console.warn('상담사만 줄 수 있습니다.'); return; }
    const t = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .find(function (u) { return u && (u.no === no || u.code === no || u.name === no); });
    if (!t) { console.warn('사원을 못 찾았습니다: ' + no); return; }
    if (hasSilverHeart(t)) { console.log(t.name + ' 사원은 이미 지니고 있습니다.'); return; }
    t.inventory = t.inventory || [];
    t.inventory.push(HEART);
    if (t.heartSaves == null) t.heartSaves = 0;
    updateUserFields(t.code, { inventory: t.inventory, heartSaves: t.heartSaves });
    appendBadgeNoteToUser(t, '[뱃지] ' + HEART);
    addHistoryLog(t, '[수여] ' + HEART);
    console.log('%c✓ ' + t.name + ' 사원에게 ' + HEART + ' 을 주었습니다.', 'color:#4CAF50');
};

window.heartState = function (no) {
    const u = no
        ? Object.keys(db.users).map(function (c) { return db.users[c]; })
            .find(function (x) { return x && (x.no === no || x.code === no || x.name === no); })
        : currentUser;
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    const n = u.heartSaves || 0;
    console.log('%c===== ' + u.name + ' · ' + HEART + ' =====', 'color:#cfd8e3; font-size:13px');
    console.log('  지님:', hasSilverHeart(u) ? '예' : '아니오');
    console.log('  구한 횟수:', n);
    console.log('  행운·회피·판정:', '+' + Math.min(5, Math.floor(n / 2)));
    console.log('  확정 구출(10회):', n >= 10 ? 'O' : '-');
    console.log('  고정 5,000P(30회):', n >= 30 ? 'O' : '-');
    console.log('  기믹 파훼(50회):', n >= 50 ? 'O' : '-');
};

// ==========================================
// 8. 어둠 진입 — 파티 배포분
// ==========================================
const LAMP_BUFF = [
    { k: 'bon', v: 2, t: '판정 +2' },
    { k: 'noPoll', v: 1, t: '오염 동결' },
    { k: 'gim', v: 1, t: '기믹 파훼 1회' },
    { k: 'luck', v: 2, t: '행운 +2' },
    { k: 'resc', v: 3, t: '구출 확률 +3' }
];

function onDarkEnter() {
    const u = currentUser;
    const pid = darkRun && darkRun.partyId;

    // 부적이 깃든 등 — 팀원에게 무작위 버프
    if (hasEquipped(u, '부적이 깃든 등') && pid) {
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            const alive = Object.keys(s.val() || {});
            const lines = [];
            alive.forEach(function (c) {
                const t = db.users[c]; if (!t) return;
                const b = LAMP_BUFF[Math.floor(Math.random() * LAMP_BUFF.length)];
                ibAdd(t, b.k, b.v, 6 * HOUR, '부적이 깃든 등', { run: true });
                lines.push((t.name || c) + ' — ' + b.t);
            });
            if (lines.length) {
                showCustomAlert('등이 한 번 흔들렸습니다.\n\n' + lines.join('\n'));
                // 같은 글을 파티원 각자에게도 띄운다
                database.ref('darkParties/' + pid + '/lampNotice').set({
                    at: Date.now(), by: currentUser.name, lines: lines
                });
            }
        });
    }

    // 공기 누름돌 — 파티 전체 보호막
    if (hasEquipped(u, '공기 누름돌') && dayLeft(u, '공기 누름돌', 5) > 0 && pid) {
        daySpend(u, '공기 누름돌');
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            Object.keys(s.val() || {}).forEach(function (c) {
                const t = db.users[c]; if (!t) return;
                ibAdd(t, 'luck', 2, 6 * HOUR, '공기 누름돌', { run: true });
                ibAdd(t, 'resist', 3, 6 * HOUR, '공기 누름돌', { run: true });
            });
        });
    }

    // 은심장 — 같이 든 사람에게 행운 +1
    if (hasSilverHeart(u) && pid) {
        database.ref('darkParties/' + pid + '/alive').once('value').then(function (s) {
            Object.keys(s.val() || {}).forEach(function (c) {
                if (c === u.code) return;
                const t = db.users[c]; if (!t) return;
                ibAdd(t, 'luck', 1, 6 * HOUR, '은심장', { run: true });
            });
        });
    }

    // 장기말 — 선택지에 난이도를 덧붙인다
    if (u.pieceHint) {
        u.pieceHint = 0;
        saveFields({ pieceHint: 1 });
        showPieceHint();
    }
}

// epic 에 들어가도 저울을 띄운다
(function scaleOnEpic() {
    const iv = setInterval(function () {
        if (typeof epicStart !== 'function') return;
        if (epicStart._scaleShow) { clearInterval(iv); return; }
        const _e = epicStart;
        epicStart = function () {
            const r = _e.apply(this, arguments);
            setTimeout(function () { if (window.scaleBoardNow) window.scaleBoardNow(); }, 1500);
            return r;
        };
        epicStart._scaleShow = true;
        clearInterval(iv);
    }, 500);
})();

(function hookEnter() {
    const iv = setInterval(function () {
        let hit = 0;
        ['launchPartyRun', 'openDarkBriefing', 'epicStart'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newEnter) { hit++; return; }
            const _f = window[n];
            window[n] = function () {
                const r = _f.apply(this, arguments);
                setTimeout(function () { try { onDarkEnter(); } catch (e) { } }, 1200);
                return r;
            };
            window[n]._newEnter = true;
            hit++;
        });
        if (hit >= 2) { clearInterval(iv); console.log('[신규] 어둠 진입 연결'); }
    }, 500);
})();

// 선택지에 난이도를 붙인다 — 한 판 동안만
function showPieceHint() {
    let stop = false;
    const ob = new MutationObserver(function () {
        if (stop) return;
        document.querySelectorAll('[data-dc]').forEach(function (b) {
            if (b.dataset.pieceDone) return;
            b.dataset.pieceDone = '1';
            const dc = parseInt(b.dataset.dc, 10);
            if (!isNaN(dc)) b.insertAdjacentHTML('beforeend',
                '<span style="margin-left:6px;color:#9ec7ff;font-size:11px">(' + dc + ')</span>');
        });
    });
    ob.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { stop = true; ob.disconnect(); }, 30 * 60 * 1000);
    showCustomAlert('장기말이 굴렀습니다.\n\n이번 탐사에서는 선택지의 무게가 보입니다.');
}

// 등불 알림을 각자 받아 띄운다
(function lampNotice() {
    let seen = 0;
    setInterval(function () {
        if (typeof darkRun === 'undefined' || !darkRun || !darkRun.partyId) return;
        if (!database) return;
        database.ref('darkParties/' + darkRun.partyId + '/lampNotice').once('value').then(function (s) {
            const v = s.val();
            if (!v || !v.at || v.at === seen) return;
            if (Date.now() - v.at > 5 * 60 * 1000) return;      // 오래된 것은 넘긴다
            seen = v.at;
            const mine = (v.lines || []).filter(function (x) {
                return String(x).indexOf(currentUser.name) === 0;
            });
            showCustomAlert('부적이 깃든 등\n\n' + (v.by || '') + ' 사원의 등이 흔들렸습니다.\n\n'
                + (v.lines || []).join('\n')
                + (mine.length ? '\n\n— 내게 걸린 것: ' + mine[0].split('—').pop().trim() : ''));
        });
    }, 2500);
})();

// ==========================================
// 9. 버프 강탈 — 황룡의 눈 · 산군의 도움
// ==========================================
// ==========================================
// 빼앗기 — 열람 → 가져온다 / 닫기
// ==========================================
const SEAL = '✗ ';          // 봉인 표시 — 이름이 바뀌므로 그 장비의 효과가 끊긴다

function stolenBag(u) {
    u = u || currentUser;
    if (!u.stolenGear) u.stolenGear = {};
    return u.stolenGear;
}

// Firebase 는 undefined 를 거부한다 — 저장 직전에 걷어 낸다
function noUndef(o) {
    Object.keys(o || {}).forEach(function (k) {
        if (o[k] === undefined) delete o[k];
        else if (o[k] && typeof o[k] === 'object') noUndef(o[k]);
    });
    return o;
}

// 물약·소모품처럼 몸에 남아 있는 것들 — 이것도 가져올 수 있다
// kind: 'time' 남은 시각 · 'num' 횟수 · 'bool' 있고 없고
const TIMED = [
    ['blindfoldUntil',        '눈가리개',      'time'],
    ['butterKnifeExpireTime', '버터 나이프',   'time'],
    ['noteGlowUntil',         '빛나는 쪽지',   'time'],
    ['pollFreezeUntil',       '오염 동결',     'time'],
    ['hairUntil',             '탈모약',        'time'],
    ['dollPt',                '봉제 인형',     'time'],
    ['buttonUses',            '통신 단추',     'num'],
    ['lineGuard',             '낚시 줄 방어',  'num'],
    ['gearProtect',           '등급 보호',     'bool'],
    ['paperBoat',             '종이배',        'num'],
    ['hasVIP',                'VIP',           'bool']
];
// 상담실(quarantineUntil)은 벌이라 목록에서 뺀다

function timedOf(u) {
    const now = Date.now(), out = [];
    TIMED.forEach(function (x) {
        const f = x[0], nm = x[1], kind = x[2];
        const v = u[f];
        if (kind === 'time') {
            if (!v || v <= now) return;
            out.push({ f: f, kind: kind, t: nm, sub: Math.round((v - now) / 60000) + '분 남음' });
        } else if (kind === 'num') {
            if (!v || v <= 0) return;
            out.push({ f: f, kind: kind, t: nm, sub: v + '회' });
        } else {
            if (!v) return;
            out.push({ f: f, kind: kind, t: nm, sub: '' });
        }
    });
    return out;
}

// 표적 — 사원을 고른다
function pickTargetFor(srcName) {
    if (!hasEquipped(currentUser, srcName)) {
        showCustomAlert(srcName + '을(를) 먼저 몸에 걸어야 합니다.'); return;
    }
    const left = dayLeft(currentUser, srcName, 2);
    if (left <= 0) { showCustomAlert('오늘은 더 쓸 수 없습니다.\n\n자정이 지나면 다시 열립니다.'); return; }

    const list = Object.keys(db.users).map(function (c) { return db.users[c]; })
        .filter(function (u) { return u && u.code && u.name && u.code !== currentUser.code && !isCounsel(u); })
        .sort(function (a, b) { return String(a.no || '').localeCompare(String(b.no || '')); });

    const back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);'
        + 'display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:400px;width:100%;max-height:78vh;overflow:auto;padding:18px;'
        + 'background:#14161c;border:1px solid #d4af37;color:#e8e4da;font-size:13px;line-height:1.7';
    box.innerHTML = '<div style="font-size:15px;color:#d4af37;margin-bottom:4px">' + srcName + '</div>'
        + '<div style="margin-bottom:12px;color:#a9a49a">표적을 고르세요. '
        + '<span style="font-size:11px;color:#7d7870">오늘 남은 횟수 ' + left + '회</span></div>'
        + list.map(function (u) {
            return '<div data-c="' + u.code + '" style="padding:8px 10px;margin-bottom:5px;border:1px solid #33363f;'
                + 'cursor:pointer">' + (u.no ? u.no + ' · ' : '') + u.name + '</div>';
        }).join('')
        + '<div style="margin-top:14px;text-align:right">'
        + '<button data-no="1" style="padding:7px 14px;background:#2a2d36;border:0;color:#a9a49a;cursor:pointer">닫기</button></div>';
    back.appendChild(box);
    document.body.appendChild(back);

    box.querySelector('[data-no]').onclick = function () { back.remove(); };
    box.querySelectorAll('[data-c]').forEach(function (el) {
        el.onclick = function () {
            const t = db.users[el.getAttribute('data-c')];
            back.remove();
            if (t) stealPanel(t, srcName, 2);
        };
    });
}

function stealPanel(target, srcName, maxPick, dayCap) {
    // ★ 상담사는 표적이 되지 않는다 — 들여다보는 것도, 가져가는 것도 안 된다.
    //   목록에서 빼 두었지만(pickTargetFor), 대상 지정 창 같은 다른 길로도 들어오므로
    //   창을 여는 자리에서 한 번 더 막는다.
    if (isCounsel(target)) {
        showCustomAlert(srcName + '\n\n'
            + (target.name || '상담사') + ' 사원에게는 통하지 않습니다.\n'
            + '지닌 것을 들여다볼 수도, 가져올 수도 없습니다.');
        return;
    }
    const back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);'
        + 'display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:430px;width:100%;max-height:80vh;overflow:auto;padding:18px;'
        + 'background:#14161c;border:1px solid #d4af37;color:#e8e4da;font-size:13px;line-height:1.7';
    back.appendChild(box);
    document.body.appendChild(back);

    const btn = function (t, key, main) {
        return '<button data-' + key + '="1" style="padding:7px 14px;border:0;cursor:pointer;'
            + (main ? 'background:#d4af37;color:#14161c' : 'background:#2a2d36;color:#a9a49a') + '">' + t + '</button>';
    };

    // ---------- 1단계 : 열람할지 묻는다 ----------
    function askLook() {
        box.innerHTML =
            '<div style="font-size:15px;color:#d4af37;margin-bottom:10px">' + srcName + '</div>'
            + '<div style="margin-bottom:16px;color:#a9a49a">표적 — <b style="color:#e8e4da">'
            + target.name + '</b> 사원<br>'
            + '<span style="font-size:11px;color:#7d7870">지닌 것을 들여다봅니다. 보는 것만으로는 아무 일도 일어나지 않습니다.'
            + (dayCap ? '<br>오늘 남은 횟수 ' + dayLeft(currentUser, srcName, dayCap) + '회' : '')
            + '</span></div>'
            + '<div style="text-align:right">' + btn('열람', 'look', true) + ' ' + btn('닫기', 'no') + '</div>';
        box.querySelector('[data-no]').onclick = function () { back.remove(); };
        box.querySelector('[data-look]').onclick = showList;
    }

    // ---------- 2단계 : 지닌 것을 펼친다 ----------
    let ownList = [];

    function showList() {
        // 이미 빼앗겨 상쇄 중인 것은 가져올 대상이 아니다
        const bag = ibClean(target).filter(function (b) {
            return !/빼앗김/.test(String(b.src || '')) && b.v > 0;
        });
        const gear = (target.equippedWeapons || []).slice();
        const g0 = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(target) || {}) : {};
        const e = g0.e || {};
        const tmp = ibSum(target);                 // 임시로 얹힌 몫 (음수 상쇄 포함)
        const own = [];
        ['luck', 'pct', 'eva', 'bon', 'fac', 'dark', 'gim'].forEach(function (k) {
            const base = (e[k] || 0) - (tmp[k] || 0);   // 순수한 제 몫
            if (base > 0) own.push({ k: k, v: base });
        });
        ownList = own;
        const timed = timedOf(target);

        let html = '<div style="font-size:15px;color:#d4af37;margin-bottom:4px">' + srcName + '</div>'
            + '<div style="margin-bottom:12px;color:#a9a49a">' + target.name
            + ' 사원이 지닌 것 <span style="font-size:11px;color:#7d7870">— 전부 가져옵니다</span></div>';

        const head = function (t) {
            return '<div style="font-size:11px;color:#d4af37;margin:12px 0 5px 0;'
                + 'border-bottom:1px solid #333;padding-bottom:3px">' + t + '</div>';
        };
        const row = function (attrs, label, sub) {
            return '<div style="margin:5px 0;padding-left:2px">· ' + label
                + (sub ? '<br><span style="font-size:11px;color:#7d7870">&nbsp;&nbsp;' + sub + '</span>' : '')
                + '</div>';
        };

        if (gear.length) {
            html += head('장착 중인 것 — 물건은 그대로 두고 능력만 가져옵니다');
            gear.forEach(function (w, i) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                const c = ITEM_CATALOG[base];
                html += row('data-t="gear" data-i="' + i + '"', base,
                    (c && c.desc ? c.desc.slice(0, 60) : ''));
            });
        }
        if (bag.length) {
            html += head('걸려 있는 효과');
            bag.forEach(function (b, i) {
                html += row('data-t="ib" data-i="' + i + '"',
                    buffName(b.k) + ' +' + b.v, b.src || '');
            });
        }
        if (own.length) {
            html += head('본래 능력치');
            own.forEach(function (x) {
                html += row('data-t="own" data-k="' + x.k + '" data-v="' + x.v + '"',
                    buffName(x.k) + ' +' + x.v, '자정까지 빼앗습니다');
            });
        }
        if (timed.length) {
            html += head('몸에 남아 있는 것');
            timed.forEach(function (x, i) {
                html += row('data-t="state" data-i="' + i + '"', x.t, x.sub);
            });
        }
        if (!gear.length && !bag.length && !own.length && !timed.length) {
            html += '<div style="color:#7d7870;padding:18px 0;text-align:center">가져올 것이 없습니다.</div>';
        }

        html += '<div style="margin-top:16px;text-align:right">'
             + btn('확정', 'go', true) + ' ' + btn('닫기', 'no') + '</div>';
        box.innerHTML = html;

        box.querySelector('[data-no]').onclick = function () { back.remove(); };
        box.querySelector('[data-go]').onclick = function () { doTake(gear, bag, timed); };
    }

    // ---------- 가져온다 ----------
    function doTake(gear, bag, timed) {
        const life = msToMidnight();
        const took = [];
        let movedGear = false;
        const pulledLabels = [];       // 상대에게서 실제로 뺀 라벨

        // 고른 것이 아니라 지닌 것을 전부 가져온다
        const on = [];
        gear.forEach(function (_, i) { on.push({ dataset: { t: 'gear', i: String(i) } }); });
        bag.forEach(function (_, i) { on.push({ dataset: { t: 'ib', i: String(i) } }); });
        timed.forEach(function (_, i) { on.push({ dataset: { t: 'state', i: String(i) } }); });
        ownList.forEach(function (x) {
            on.push({ dataset: { t: 'own', k: x.k, v: String(x.v) } });
        });
        if (!on.length) { back.remove(); return; }

        on.forEach(function (inp) {
            const t = inp.dataset.t;

            if (t === 'gear') {
                const w = gear[parseInt(inp.dataset.i, 10)];
                if (!w) return;
                const eq = target.equippedWeapons || [];
                const at = eq.indexOf(w);
                if (at < 0) return;
                // 빼앗은 것은 장착칸에 보이지 않으므로 칸 수를 세지 않는다
                // 이름을 바꾸면 카탈로그에 없는 이름이 되어 목록을 그리다 터진다.
                // 그래서 상대 칸에서는 잠시 빼 두고, 돌려줄 때 그대로 되돌린다.
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                eq.splice(at, 1);
                pulledLabels.push(w);                       // 서버에는 이것만 뺀다고 알린다
                const ownerWas = (target.equipOwner && target.equipOwner[w] != null)
                    ? target.equipOwner[w] : null;
                if (target.equipOwner) delete target.equipOwner[w];

                // 빼앗긴 동안에는 다시 차지 못하게 잠근다
                if (!target.gearLock) target.gearLock = {};
                target.gearLock[base] = { by: currentUser.code, src: srcName, day: today() };

                // 특이사항에 무엇을 빼앗겼는지 남기지 않는다
                removeBadgeLine(target, '[장착됨] ' + base);

                const label = base + ' (' + srcName + ')';
                // 장착칸에는 넣지 않는다. 능력을 읽는 함수들만 따로 본다.
                if (!Array.isArray(currentUser.borrowedGear)) currentUser.borrowedGear = [];
                if (currentUser.borrowedGear.indexOf(label) < 0) currentUser.borrowedGear.push(label);
                stolenBag(currentUser)[label] = { kind: 'gear', from: target.code, orig: w,
                    owner: ownerWas, day: today(), src: srcName };
                took.push(base + ' 의 능력');
                movedGear = true;

            } else if (t === 'state') {
                const x = timed[parseInt(inp.dataset.i, 10)];
                if (!x) return;
                // Firebase 는 undefined 를 받지 않는다 — 기본값으로 눌러 둔다
                const zero = (x.kind === 'bool') ? false : 0;
                const mine = (currentUser[x.f] == null) ? zero : currentUser[x.f];
                const theirs = (target[x.f] == null) ? zero : target[x.f];
                if (x.kind === 'time') {
                    currentUser[x.f] = Math.max(mine || 0, theirs || 0);
                    target[x.f] = 0;
                } else if (x.kind === 'num') {
                    currentUser[x.f] = (mine || 0) + (theirs || 0);
                    target[x.f] = 0;
                } else {
                    currentUser[x.f] = true;
                    target[x.f] = false;
                }
                stolenBag(currentUser)['상태:' + x.f] = {
                    kind: 'state', field: x.f, from: target.code, src: srcName,
                    theirs: theirs, mine: mine, day: today(), t: x.t || x.f
                };
                const f = {}; f[x.f] = target[x.f];
                updateUserFields(target.code, f);
                const g = {}; g[x.f] = 1;
                saveFields(g);
                took.push(x.t);
                movedGear = true;

            } else if (t === 'ib') {
                const b = bag[parseInt(inp.dataset.i, 10)];
                if (!b) return;
                ibAdd(currentUser, b.k, b.v, life, srcName);
                ibAdd(target, b.k, -b.v, life, srcName + '에 빼앗김');
                took.push(buffName(b.k) + ' +' + b.v);

            } else {
                const k = inp.dataset.k, v = parseInt(inp.dataset.v, 10);
                ibAdd(currentUser, k, v, life, srcName);
                ibAdd(target, k, -v, life, srcName + '에 빼앗김');
                took.push(buffName(k) + ' +' + v);
            }
        });

        if (!took.length) { back.remove(); return; }
        if (dayCap) daySpend(currentUser, srcName);
        try { putSeal(target, srcName); } catch (e) { }

        if (movedGear) {
            noUndef(currentUser.stolenGear);
            saveFields({ borrowedGear: 1 });
            // 배열을 통째로 보내면 안 된다. target 은 내 화면이 들고 있는 남의
            // 사본이라, equippedWeapons 가 비어 있으면 상대 장착칸이 통째로
            // 날아간다. 뺀 라벨만 보낸다. (gear-move.js)
            if (typeof gearPull === 'function') {
                gearPull(target.code, pulledLabels, target.gearLock || {});
            } else {
                updateUserFields(target.code, {
                    equippedWeapons: target.equippedWeapons || [],
                    equipOwner: target.equipOwner || {},
                    gearLock: target.gearLock || {}
                });
            }
            saveFields({ stolenGear: 1 });
        }

        const word = (srcName === '황룡의 눈')
            ? '황룡의 눈길을 받았습니다. 가지고 있는 버프가 일시적으로 사라집니다.'
            : '산군의 숨결이 닿았습니다. 가지고 있는 버프가 일시적으로 사라집니다.';

        addHistoryLog(currentUser, '[' + srcName + '] ' + target.name + ' 사원에게서 ' + took.join(', '));
        addHistoryLog(target, '[' + srcName + '] ' + word);
        appendBadgeNoteToUser(target, word);

        // 가져온 쪽에는 무엇을 가져왔는지 적지 않는다. 썼다는 것만 한 줄.
        removeBadgeLine(currentUser, srcName + '을(를) 썼습니다');
        appendBadgeNoteToUser(currentUser, srcName + '을(를) 썼습니다.');
        saveSelfFull();
        updateUI();
        back.remove();
        showCustomAlert('가져왔습니다.\n\n' + took.join('\n')
            + '\n\n해제하거나 자정이 지나면 ' + target.name + ' 사원에게 돌아갑니다.');
    }

    askLook();
}

// ==========================================
// 빼앗은 장비를 돌려준다 — 해제할 때 · 자정에
// ==========================================
function returnStolen(label, quiet) {
    const rec = stolenBag(currentUser)[label];
    if (!rec) return false;
    const t = db.users[rec.from];
    let what = label;

    if (rec.kind === 'state') {
        what = rec.t || rec.field;
        currentUser[rec.field] = (rec.mine == null) ? 0 : rec.mine;
        const g = {}; g[rec.field] = 1;
        saveFields(g);
        if (t) {
            const back = (rec.theirs == null) ? 0 : rec.theirs;
            t[rec.field] = back;
            const f = {}; f[rec.field] = back;
            updateUserFields(t.code, f);
        }
    } else {
        what = rec.orig;
        if (Array.isArray(currentUser.borrowedGear)) {
            const bi = currentUser.borrowedGear.indexOf(label);
            if (bi >= 0) currentUser.borrowedGear.splice(bi, 1);
            saveFields({ borrowedGear: 1 });
        }
        const eq = currentUser.equippedWeapons || [];
        const at = eq.indexOf(label);
        if (at >= 0) eq.splice(at, 1);                     // 예전 판본 정리
        if (currentUser.equipOwner) delete currentUser.equipOwner[label];

        if (t) {
            const baseBack = (typeof getEquipBaseName === 'function') ? getEquipBaseName(rec.orig) : rec.orig;

            // 내 화면 사본도 맞춰 둔다 (보이는 것만 — 서버는 아래에서 따로)
            const te = t.equippedWeapons || [];
            const si = te.indexOf(SEAL + rec.orig);
            if (si >= 0) {
                te[si] = rec.orig;
                if (t.equipOwner && t.equipOwner[SEAL + rec.orig] != null) {
                    t.equipOwner[rec.orig] = t.equipOwner[SEAL + rec.orig];
                    delete t.equipOwner[SEAL + rec.orig];
                }
            } else if (te.indexOf(rec.orig) < 0) {
                te.push(rec.orig);
                if (rec.owner != null) {
                    if (!t.equipOwner) t.equipOwner = {};
                    t.equipOwner[rec.orig] = rec.owner;
                }
            }
            t.equippedWeapons = te;
            if (t.gearLock) delete t.gearLock[baseBack];
            if (typeof appendBadgeNoteToUser === 'function') {
                appendBadgeNoteToUser(t, '[장착됨] ' + baseBack);
            }

            // ★ 서버에는 배열을 통째로 보내지 않는다. 사본이 비어 있으면
            //   상대 장착칸이 텅 빈다. 돌려줄 하나만 보낸다. (gear-move.js)
            if (typeof gearPush === 'function') {
                gearPush(t.code, rec.orig, rec.owner, SEAL + rec.orig, baseBack);
            } else {
                updateUserFields(t.code, {
                    equippedWeapons: t.equippedWeapons,
                    equipOwner: t.equipOwner || {},
                    gearLock: t.gearLock || {}
                });
            }
        }
    }

    delete currentUser.stolenGear[label];
    noUndef(currentUser.stolenGear);
    saveFields({ stolenGear: 1 });

    // 남은 것이 없으면 특이사항의 눈길·숨결 문구도 걷는다
    if (t) {
        const still = Object.keys(currentUser.stolenGear || {}).some(function (k) {
            return currentUser.stolenGear[k] && currentUser.stolenGear[k].from === t.code;
        });
        if (!still) {
            removeBadgeLine(t, '황룡의 눈길을 받았습니다');
            removeBadgeLine(t, '산군의 숨결이 닿았습니다');
            liftSeal(t);
        }
        if (rec.src && !Object.keys(currentUser.stolenGear || {}).some(function (k) {
                return currentUser.stolenGear[k] && currentUser.stolenGear[k].src === rec.src;
            })) {
            removeBadgeLine(currentUser, rec.src + '을(를) 썼습니다');
        }
        addHistoryLog(t, '[반환] ' + what + ' 이(가) 돌아왔습니다.');
    }
    saveSelfFull();
    updateUI();
    if (!quiet) showCustomAlert((t ? t.name + ' 사원에게 ' : '') + what + ' 을(를) 돌려주었습니다.');
    return true;
}

// 빼앗은 상태를 한꺼번에 돌려준다 — 장착칸에 없는 것(상태분)까지
window.returnAllStolen = function () {
    const bag = stolenBag(currentUser);
    const keys = Object.keys(bag);
    if (!keys.length) { console.log('빼앗아 둔 것이 없습니다.'); return; }
    keys.forEach(function (k) { returnStolen(k, true); });
    console.log('%c✓ ' + keys.length + '건을 돌려주었습니다.', 'color:#4CAF50');
};

(function hookUnequipReturn() {
    const iv = setInterval(function () {
        if (typeof unequipWeapon !== 'function') return;
        if (unequipWeapon._stolenBack) { clearInterval(iv); return; }
        const _f = unequipWeapon;
        unequipWeapon = function (index) {
            const w = (currentUser.equippedWeapons || [])[index];
            if (w && stolenBag(currentUser)[w]) { returnStolen(w); return; }
            // 황룡의 눈·산군의 도움을 내려놓으면 빼앗은 것을 전부 돌려준다
            const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w || '') : w;
            if (base === '황룡의 눈' || base === '산군의 도움') {
                const n = returnBySource(base);
                const r = _f.apply(this, arguments);
                if (n) setTimeout(function () {
                    showCustomAlert('빼앗았던 ' + n + '건이 제자리로 돌아갔습니다.');
                }, 400);
                return r;
            }
            return _f.apply(this, arguments);
        };
        unequipWeapon._stolenBack = true;
        window.__stolenBackOn = true;
        clearInterval(iv);
        console.log('[신규] 빼앗은 장비 반환 연결');
    }, 500);
})();

// 자정이 지나면 알아서 돌아간다
(function watchStolen() {
    setInterval(function () {
        if (!currentUser || !currentUser.stolenGear) return;
        const now = today();
        Object.keys(currentUser.stolenGear).forEach(function (label) {
            const rec = currentUser.stolenGear[label];
            if (rec && rec.day !== now) returnStolen(label, true);
        });
    }, 60000);
})();

function buffName(k) {
    return ({ luck: '행운', pct: '행운%', eva: '회피', bon: '판정', fac: '공용시설',
              dark: '어둠 탐사', gim: '기믹 파훼', resc: '구출 확률', resist: '저항',
              noPoll: '오염 동결' })[k] || k;
}

// ==========================================
// 10. 아이템 등록
// ==========================================
const DREAM = '백일몽';      // 백일몽 주식회사
const DISAS = '재난관리';    // 재난관리국

const NEW = [
    // ---------- 백일몽 주식회사 ----------
    ['꿈결 수집기', 10000, DREAM, 'n_dream', false,
     '행운 100%, 공용시설 이용 +1. 어둠 탐사마다 추가 정산 +5,000P. (장착)', 3],
    ['종이배', 3000, DREAM, 'n_boat', true,
     '타인에게 접어 주면, 그 사람은 어둠에서 하루 네 번까지 확정으로 남을 구할 수 있다.'],
    ['통신 단추', 5000, DREAM, 'equip_n_button', false,
     '누군가의 단추. 몸에 걸어 두면 위급할 때 세 번까지 저절로 눌린다. 세 번을 쓰면 부서진다. (장착)'],
    ['연구 보고서', 700, DREAM, 'n_report', false,
     '어둠 내역이 적힌 보고서. 세 시간 동안 행운 300%. (1회용)'],
    ['일기장', 9000, DREAM, 'n_diary', false,
     '퇴사한 사원의 일기장. 오염도가 세 시간 멈추고, 다음 어둠에 +2,000P. (1회용)'],
    ['달빛 타투 스티커', 1004, DREAM, 'n_tattoo', false,
     '붙이면 세 가지 중 하나가 무작위로 남는다. 효과가 나오면 자국이 사라진다. (1회용)'],
    ['정갈한 문패', 7000, DREAM, 'n_plate', false,
     '상담실에서 곧바로 나올 수 있다. 다섯 번 쓰면 사라진다.'],
    ['은화 뱀', 15555, DREAM, 'n_snake', false,
     '하루 세 번 튕길 수 있다. 절반은 꽝, 절반은 행운·판정·공용시설 중 하나가 +3.'],
    ['％＄＠＆ 이동장', 444444, DREAM, 'equip_n_cage', true,
     '어떤 것을 담기 위해 만들어졌다. 어둠마다 한 번 확정으로 남을 살리고, 살린 만큼 최대 9,000P. '
     + '남에게 채울 수도 있으며, 채운 사람만 뺄 수 있다. (장착)', 3],
    ['엽서', 500, DREAM, 'n_card', false,
     '한 번 찢으면 네 가지 중 하나가 무작위로 나온다. (1회용)'],
    ['장기말', 5000, DREAM, 'n_piece', false,
     '어느 연구소의 부속품. 던지면 다음 탐사에서 선택지의 무게가 보인다. 세 번 던지면 사라진다.'],
    ['황룡의 눈', 10000000, DREAM, 'equip_n_dragon', true,
     '몸에 걸고 표적을 고른다. 그 사원이 지닌 것을 보고, 원하는 것을 가져온다. '
     + '하루 두 번. 가져간 것도 빼앗긴 것도 자정이 지나면 제자리로 돌아간다. '
     + '본인만 걸 수 있고, 걸어도 닳지 않는다.', 3],
    ['다 헐은 공략집', 500, DREAM, 'n_guide', false,
     '오염도가 두 시간 진행되지 않는다. (1회용)'],
    ['봉제 인형 키트', 140000, DREAM, 'n_doll', false,
     '사용자의 DNA를 읽어 사흘짜리 인형을 짓는다. 기능은 두 가지가 붙는다.'],
    ['탈모약', 3000, DREAM, 'n_hair', false,
     '효과가 죽여준다. 열 시간 동안 머리카락이 풍성해진다.'],

    // ---------- 재난관리국 ----------
    ['오색 신발끈', 7000, DISAS, 'n_lace', false,
     '선녀탕에 들어갔을 때 곧바로 나올 수 있다. 다섯 번 쓰면 사라진다.'],
    ['은색 저울', 90000, DISAS, 'n_scale', false,
     '어둠에서 남을 살릴 때, 자신이 함께 가라앉을 확률이 보인다. (장착)'],
    ['부적이 깃든 등', 10000, DISAS, 'n_lamp', false,
     '장착하고 어둠에 들면 같은 팀에게 무작위 효과가 하나씩 걸린다. (장착)'],
    ['전용 자전거', 15000, DISAS, 'n_bike', false,
     '죽을 위기의 동료를 확정으로 두 번 구한다. 하루 두 번.'],
    ['산군의 도움', 10000000, DISAS, 'equip_n_tiger', true,
     '몸에 걸고 표적을 고른다. 그 사원이 지닌 것 하나를 가져온다. '
     + '하루 두 번. 가져간 것도 빼앗긴 것도 자정이 지나면 제자리로 돌아간다. '
     + '본인만 걸 수 있고, 걸어도 닳지 않는다.', 3],
    ['주의 설명서', 500, DISAS, 'n_manual', false,
     '오염도가 두 시간 진행되지 않는다. (1회용)'],
    ['낚시 줄', 3000, DISAS, 'n_line', false,
     '기믹의 눈을 한 번 끈다. 끌려갈 때 한 번 막아 준다. 다섯 번 쓰면 사라진다.'],
    ['진실 마스크', 9000, DISAS, 'n_mask', true,
     '타인에게만 채울 수 있다. 채운 사람이 어둠에서 자신을 구하면 양쪽에 5,000P. 다섯 번이면 부서진다.'],
    ['포승줄', 12000, DISAS, 'n_rope', false,
     '남을 구할 확률이 크게 늘고 판정 +5. 열 번 쓰면 끊어진다. (장착)'],
    ['공기 누름돌', 5000, DISAS, 'n_stone', false,
     '어둠에 들면 파티 전체에 보호막이 돈다. 저항이 오르고 행운 +2. 하루 다섯 번. (장착)']
];

// 품목별 노출 확률 — 적지 않으면 3%
const RARE_RATE = {
    '황룡의 눈':      0.001,
    '산군의 도움':    0.001,
    '％＄＠＆ 이동장': 0.001,
    '꿈결 수집기':    0.03
};

const RARE3 = [];
if (!window.RARE_ALIEN_RATE) window.RARE_ALIEN_RATE = {};
NEW.forEach(function (row) {
    const nm = row[0], price = row[1], affil = row[2], eff = row[3], tgt = row[4], desc = row[5], rare = row[6];
    ITEM_CATALOG[nm] = { price: price, usable: true, targetable: !!tgt, effect: eff, desc: desc };
    if (typeof EQUIP_AFFIL !== 'undefined') EQUIP_AFFIL[nm] = affil;
    if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(nm) < 0) ALIEN_ITEMS_POOL.push(nm);
    if (rare) { RARE3.push(nm); window.RARE_ALIEN_RATE[nm] = RARE_RATE[nm] || 0.03; }
});

// 은심장 — 쇼핑몰에 올리지 않는다
ITEM_CATALOG[HEART] = {
    price: 0, usable: true, targetable: false, effect: 'n_heart',
    desc: '많은 사람을 구한 이의 심장을 본떠 만든 뱃지. 부서지지 않고 잃어버리지 않는다. '
        + '남을 구한 만큼 행운·회피·판정이 오르고(최대 5), 열 번을 넘기면 구출이 확정된다. '
        + '서른 번을 넘기면 어둠마다 5,000P, 쉰 번을 넘기면 기믹을 한 번 깬다. '
        + '함께 든 파티에게 행운 +1.'
};
// 은심장은 소속을 묻지 않는다 — 상담사가 준 사람만 지닌다

const SHOP_AFFIL = {};
NEW.forEach(function (row) { SHOP_AFFIL[row[0]] = row[2]; });

// ==========================================
// 어둠 소속은 어느 소속 물건이든 찬다
// ==========================================
function isDark(u) {
    return /어둠/.test(((u && u.affiliation) || '') + ' ' + ((u && u.team) || ''));
}

(function hookWear() {
    const iv = setInterval(function () {
        if (typeof canWearItem !== 'function') return;
        if (canWearItem._darkFree) { clearInterval(iv); return; }
        const _c = canWearItem;
        canWearItem = function (user, itemName) {
            if (isDark(user)) return true;
            return _c.apply(this, arguments);
        };
        canWearItem._darkFree = true;
        clearInterval(iv);
        console.log('[신규] 어둠 소속 착용 제한 해제');
    }, 500);
})();

// ==========================================
// 11. 쇼핑몰 노출 — 소속과 확률
// ==========================================
function shopAllowed(nm) {
    // SHOP_AFFIL 은 newitems2 의 NEW 표에서만 만들어진다. 그래서
    // newitems.js 와 index.html 이 EQUIP_AFFIL 에 적어 둔 소속 제한
    // (사인참사검·유리구슬·도깨비 불·사원증 뱃지·■■ 씨앗·소원권·
    //  작두·유리손포·착한 친구·보안팀 의상 세트·버터 나이프·사자탈 ...)
    // 은 여기에 없어서 반대 소속에게도 전부 보였다. 그쪽도 같이 본다.
    const need = SHOP_AFFIL[nm]
        || ((typeof EQUIP_AFFIL !== 'undefined' && EQUIP_AFFIL) ? EQUIP_AFFIL[nm] : null);
    if (!need) return true;
    if (isCounsel(currentUser)) return true;
    if (isDark(currentUser)) return true;          // 어둠 소속은 전부 본다
    return affilText(currentUser).includes(need);
}

function withPool(fn, ctx, args) {
    if (typeof ALIEN_ITEMS_POOL === 'undefined') return fn.apply(ctx, args);
    const keep = ALIEN_ITEMS_POOL.slice();
    const use = keep.filter(shopAllowed);
    ALIEN_ITEMS_POOL.length = 0;
    use.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); });
    try { return fn.apply(ctx, args); }
    finally { ALIEN_ITEMS_POOL.length = 0; keep.forEach(function (x) { ALIEN_ITEMS_POOL.push(x); }); }
}

(function hookShop() {
    const iv = setInterval(function () {
        let hit = 0;
        ['renderAlienShop', 'buyAlienItem'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newAffil) { hit++; return; }
            const _f = window[n];
            window[n] = function () { return withPool(_f, this, arguments); };
            window[n]._newAffil = true;
            hit++;
        });
        if (hit < 2) return;
        clearInterval(iv);
        console.log('[신규] 우주 쇼핑몰 소속 제한 연결');
    }, 500);
})();

// ==========================================
// 딴 품목이 소속에 안 맞으면 — 지우지 않고 바꿔 준다
// (진열은 alienUnlockedItems 에 하루치로 쌓인다.
//  지우면 칸이 비어 1~2개만 보이게 되므로, 같은 수를 유지한다.)
// ==========================================
function fixUnlocked() {
    const u = currentUser;
    if (!u || !Array.isArray(u.alienUnlockedItems)) return;
    if (isCounsel(u)) return;

    const bad = u.alienUnlockedItems.filter(function (nm) { return !shopAllowed(nm); });
    if (!bad.length) return;

    const pool = (typeof ALIEN_ITEMS_POOL !== 'undefined' ? ALIEN_ITEMS_POOL : [])
        .filter(function (nm) {
            if (!shopAllowed(nm)) return false;
            if (u.alienUnlockedItems.indexOf(nm) >= 0) return false;
            if (RARE3.indexOf(nm) >= 0) return false;         // 희귀는 대체품으로 주지 않는다
            return true;
        });

    let swapped = 0;
    u.alienUnlockedItems = u.alienUnlockedItems.map(function (nm) {
        if (shopAllowed(nm)) return nm;
        if (!pool.length) return nm;                           // 바꿀 게 없으면 그냥 둔다
        const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        swapped++;
        return pick;
    });

    if (swapped) {
        saveFields({ alienUnlockedItems: 1 });
        console.log('[신규] 소속이 맞지 않던 진열 ' + swapped + '개를 바꿨습니다.');
        if (typeof renderAlienShop === 'function') renderAlienShop();
    }
}

(function watchUnlocked() {
    let last = '';
    setInterval(function () {
        if (!currentUser || !Array.isArray(currentUser.alienUnlockedItems)) return;
        const now = currentUser.alienUnlockedItems.join('|');
        if (now === last) return;
        last = now;
        try { fixUnlocked(); } catch (e) { }
    }, 1200);
})();

// ==========================================
// 12. 효과 — 본인 사용
// ==========================================
const TATTOO = [
    { t: '다음 탐사 +10,000P', run: function () { addDarkPt(currentUser, 10000, '달빛'); } },
    { t: '행운 +300',          run: function () { ibAdd(currentUser, 'luck', 300, 12 * HOUR, '달빛'); } },
    { t: '기믹 파훼 1회',      run: function () { ibAdd(currentUser, 'gim', 1, 24 * HOUR, '달빛'); } }
];

const POSTCARD = [
    { t: '행운 +100',          run: function () { ibAdd(currentUser, 'luck', 100, 12 * HOUR, '엽서'); } },
    { t: '어둠 탐사 +1',       run: function () {
        currentUser.darkTries = Math.max(0, (currentUser.darkTries || 0) - 1);
        saveFields({ darkTries: 1 });
    } },
    { t: '전용 무기 등급 보호', run: function () {
        currentUser.gearProtect = true; saveFields({ gearProtect: 1 });
    } },
    { t: '판정 +1',            run: function () { ibAdd(currentUser, 'bon', 1, 12 * HOUR, '엽서'); } }
];

const DOLL = [
    { k: 'pt',   v: 3000, t: '어둠 추가 정산 +3,000P' },
    { k: 'eva',  v: 2,    t: '회피 +2' },
    { k: 'luck', v: 2,    t: '행운 +2' },
    { k: 'bon',  v: 2,    t: '판정 +2' },
    { k: 'pct',  v: 150,  t: '행운 +150%' }
];

const SNAKE = [
    { k: 'luck', v: 3, t: '행운 +3' },
    { k: 'bon',  v: 3, t: '판정 +3' },
    { k: 'fac',  v: 3, t: '공용시설 이용 +3' }
];

function gone(nm) {
    removeItemFromInventory(currentUser, nm, 1);
    saveSelfFull(); updateUI();
}

const SELF = {

    n_dream: null, n_scale: null, n_lamp: null, n_rope: null, n_stone: null,
    equip_n_cage: null, equip_n_button: null,                           // 장착형

    equip_n_dragon: function (nm) { toggleWorn(nm); },
    equip_n_tiger:  function (nm) { toggleWorn(nm); },

    n_report: function (nm) {
        ibAdd(currentUser, 'pct', 300, 3 * HOUR, '연구 보고서');
        addHistoryLog(currentUser, '[연구 보고서] 행운 300% (3시간)');
        gone(nm);
        showCustomAlert('보고서를 펼쳤습니다.\n\n세 시간 동안 행운 300%.');
    },

    n_diary: function (nm) {
        freezePoll(3, '일기장');
        addDarkPt(currentUser, 2000, '일기장');
        gone(nm);
        showCustomAlert('남의 사흘을 읽었습니다.\n\n오염도 3시간 정지 · 다음 어둠 +2,000P');
    },

    n_tattoo: function (nm) {
        const p = TATTOO[Math.floor(Math.random() * TATTOO.length)];
        p.run();
        appendBadgeNoteToUser(currentUser, '[달빛] ' + p.t);
        addHistoryLog(currentUser, '[달빛 타투] ' + p.t);
        gone(nm);
        showCustomAlert('달빛이 살에 붙었습니다.\n\n' + p.t);
    },

    n_plate: function (nm) {
        if (!(currentUser.quarantineUntil > Date.now())) {
            showCustomAlert('상담실에 있지 않습니다.'); return;
        }
        currentUser.pollution = currentUser.quarantineExitPollution || 0;
        currentUser.quarantineExitPollution = 0;
        currentUser.quarantineUntil = 0;
        currentUser.quarantineDest = null;
        currentUser.quarantineHospital = null;
        saveFields({ pollution: 1, quarantineExitPollution: 1, quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1 });
        const r = totalSpend(nm, 5);
        updateUI();
        showCustomAlert('문패를 내렸습니다.\n\n상담실에서 나왔습니다.'
            + (r.gone ? '\n\n문패가 닳아 없어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_snake: function (nm) {
        if (dayLeft(currentUser, nm, 3) <= 0) { showCustomAlert('오늘은 더 튕길 수 없습니다.'); return; }
        daySpend(currentUser, nm);
        if (Math.random() < 0.5) {
            addHistoryLog(currentUser, '[은화 뱀] 꽝');
            showCustomAlert('뱀이 몸을 뒤집었습니다.\n\n아무 일도 없었습니다.\n\n남은 횟수 '
                + dayLeft(currentUser, nm, 3) + '회');
            return;
        }
        const p = SNAKE[Math.floor(Math.random() * SNAKE.length)];
        ibAdd(currentUser, p.k, p.v, 24 * HOUR, '은화 뱀');
        // 같은 효과는 한 줄만 — 특이사항은 ' | ' 로 잇는다 (removeBadgeLine 은 <br>·줄바꿈용)
        if (typeof stripNoteByItem === 'function') stripNoteByItem(currentUser, '[은화 뱀] ' + p.t);
        appendBadgeNoteToUser(currentUser, '[은화 뱀] ' + p.t);
        saveSelfFull();
        addHistoryLog(currentUser, '[은화 뱀] ' + p.t);
        showCustomAlert('비늘이 한 번 울었습니다.\n\n' + p.t + '\n\n남은 횟수 '
            + dayLeft(currentUser, nm, 3) + '회');
    },

    n_card: function (nm) {
        const p = POSTCARD[Math.floor(Math.random() * POSTCARD.length)];
        p.run();
        addHistoryLog(currentUser, '[엽서] ' + p.t);
        gone(nm);
        showCustomAlert('엽서를 찢었습니다.\n\n' + p.t);
    },

    n_piece: function (nm) {
        currentUser.pieceHint = 1;
        saveFields({ pieceHint: 1 });
        const r = totalSpend(nm, 3);
        showCustomAlert('장기말을 던졌습니다.\n\n다음 탐사에서 선택지의 무게가 보입니다.'
            + (r.gone ? '\n\n장기말이 닳아 사라졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_guide:  function (nm) { freezePoll(2, '공략집'); gone(nm); showCustomAlert('접힌 자리를 따라 읽었습니다.\n\n오염도 2시간 정지.'); },
    n_manual: function (nm) { freezePoll(2, '주의 설명서'); gone(nm); showCustomAlert('주의 사항을 끝까지 읽었습니다.\n\n오염도 2시간 정지.'); },

    n_doll: function (nm) {
        const pool = DOLL.slice();
        const pick = [];
        for (let i = 0; i < 2; i++) pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        pick.forEach(function (p) {
            if (p.k === 'pt') {
                currentUser.dollPt = Date.now() + 3 * 24 * HOUR;
                saveFields({ dollPt: 1 });
            } else ibAdd(currentUser, p.k, p.v, 3 * 24 * HOUR, '봉제 인형');
        });
        appendBadgeNoteToUser(currentUser, '[인형] ' + pick.map(function (p) { return p.t; }).join(' · '));
        addHistoryLog(currentUser, '[봉제 인형] ' + pick.map(function (p) { return p.t; }).join(' · '));
        gone(nm);
        showCustomAlert('자신을 닮은 것이 하나 지어졌습니다. (사흘)\n\n'
            + pick.map(function (p) { return p.t; }).join('\n'));
    },

    n_hair: function (nm) {
        currentUser.hairUntil = Date.now() + 10 * HOUR;
        saveFields({ hairUntil: 1 });
        appendBadgeNoteToUser(currentUser, '[탈모약] 머리카락이 풍성하다');
        addHistoryLog(currentUser, '[탈모약] 열 시간');
        gone(nm);
        showCustomAlert('효과가 죽여줍니다.\n\n열 시간 동안 머리카락이 풍성해집니다.');
    },

        n_plate: function (nm) {
        if (!(currentUser.quarantineUntil > Date.now())) {
            showCustomAlert('상담실에 있지 않습니다.'); return;
        }
        currentUser.quarantineUntil = 0;
        currentUser.quarantineDest = null;
        currentUser.quarantineHospital = null;

        // ★ 정상 해제와 같게 — 오염도를 내려놓고 나온다
        let out = currentUser.quarantineExitPollution || 0;
        if (out >= 100) out = 99;                      // 100으로 나오면 바로 다시 들어간다
        currentUser.pollution = out;
        currentUser.quarantineExitPollution = 0;
        currentUser.lastPollutionTime = Date.now();    // 오염 시계도 다시 맞춘다

        // 탐사 사고 문구도 같이 거둔다
        if (currentUser.badge && currentUser.badge.notes) {
            const arr = currentUser.badge.notes.split(' | ').filter(function (n) {
                return n.trim() !== ''
                    && n.indexOf('의식 불명') < 0
                    && n.indexOf('긴급 이송') < 0
                    && n.indexOf('사직 반려') < 0;
            });
            currentUser.badge.notes = arr.length ? arr.join(' | ') : '특이사항 없음';
        }

        saveFields({
            quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1,
            pollution: 1, quarantineExitPollution: 1, lastPollutionTime: 1, badge: 1
        });
        const r = totalSpend(nm, 5);
        updateUI();
        showCustomAlert('문패를 내렸습니다.\n\n상담실에서 나왔습니다. (오염도 ' + out + '%)'
            + (r.gone ? '\n\n문패가 닳아 없어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_bike: function (nm) {
        const left = dayLeft(currentUser, nm, 2);
        showCustomAlert(left > 0
            ? '자전거는 어둠에서 저절로 굴러갑니다.\n\n오늘 남은 확정 구출 ' + left + '회'
            : '오늘은 더 굴러가지 않습니다.');
    },

    n_line: function (nm) {
        currentUser.lineGuard = (currentUser.lineGuard || 0) + 1;
        saveFields({ lineGuard: 1 });
        const r = totalSpend(nm, 5);
        showCustomAlert('줄을 감았습니다.\n\n끌려갈 때 한 번 막습니다.'
            + (r.gone ? '\n\n줄이 다 풀렸습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    }
};

// ★ 소지품 쓰는 길에서 이 파일의 손이 빠졌을 때, index.html 의
//   applyItemEffect 가 여기로 되돌아와 제자리 처리기를 부른다.
//   (그 길은 열 겹 넘게 감싸여 있어 한 겹만 어긋나도 그냥 지나친다)
window.__newItemSelf = SELF;

(function hookSelf() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._newItems2) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || !isNewEff(cat.effect)) return _u.apply(this, arguments);

            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)
                && itemName !== '정갈한 문패') {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
                showCustomAlert('소속이 맞지 않습니다.'); return;
            }
            if ((currentUser.inventory || []).indexOf(itemName) === -1) return;

            const fn = SELF[cat.effect];
            if (fn) { fn(itemName); return; }

            // 장착형
            if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
            if (currentUser.equippedWeapons.length >= 12) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
            currentUser.equippedWeapons.push(itemName);
            setEquipOwner(currentUser, itemName, currentUser.code);
            if (itemName === '통신 단추' && !(currentUser.buttonUses | 0)) {
                currentUser.buttonUses = 3;
                saveFields({ buttonUses: 1 });
            }
            // 은심장은 잃어버리지 않게 막아 두었으니, 옮길 때만 잠금을 푼다
            window.__heartUnlock = true;
            removeItemFromInventory(currentUser, itemName, 1);
            window.__heartUnlock = false;
            appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName);
            addHistoryLog(currentUser, '[장비 장착] ' + itemName);
            saveSelfFull(); updateUI();
            showCustomAlert(itemName + '을(를) 몸에 걸었습니다.');
        };
        useInventoryItem._newItems2 = true;
        clearInterval(iv);
        console.log('[신규] 사용 처리 연결');
    }, 500);
})();

// ==========================================
// 13. 효과 — 타인에게
// ==========================================
(function hookOther() {
    const iv = setInterval(function () {
        if (typeof applyItemEffect !== 'function') return;
        if (applyItemEffect._newItems2) { clearInterval(iv); return; }
        const _a = applyItemEffect;
        applyItemEffect = function (targetUser, itemName, isOthers) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || !isNewEff(cat.effect)) return _a.apply(this, arguments);
            if (!targetUser) return false;
            if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
                showCustomAlert('소속이 맞지 않습니다.'); return false;
            }

            if (cat.effect === 'n_boat') {
                targetUser.paperBoat = 4;
                updateUserFields(targetUser.code, { paperBoat: 4 });
                removeBadgeLine(targetUser, '🛶 종이배');
                appendBadgeNoteToUser(targetUser, '🛶 종이배 — 확정 구출 4회 남음');
                addHistoryLog(targetUser, '[종이배] ' + currentUser.name + ' 사원이 접어 주었습니다.');
                addHistoryLog(currentUser, '[종이배] ' + targetUser.name + ' 사원에게');
                showCustomAlert(targetUser.name + ' 사원의 손에 배를 띄웠습니다.\n\n확정 구출 네 번.');
                return true;
            }

            if (cat.effect === 'equip_n_dragon' || cat.effect === 'equip_n_tiger') {
                const isDragon = (cat.effect === 'equip_n_dragon');
                const nm2 = isDragon ? '황룡의 눈' : '산군의 도움';
                const cap = 2;

                if (!hasEquipped(currentUser, nm2)) {
                    showCustomAlert(nm2 + '을(를) 먼저 몸에 걸어야 합니다.\n\n'
                        + '소지품에서 「장착」을 누르세요.'); return false;
                }
                if (targetUser.code === currentUser.code) {
                    showCustomAlert('자기 자신은 고를 수 없습니다.'); return false;
                }
                const left = dayLeft(currentUser, nm2, cap);
                if (left <= 0) {
                    showCustomAlert('오늘은 더 쓸 수 없습니다.\n\n자정이 지나면 다시 열립니다.');
                    return false;
                }
                // 바깥(index.html)에서 소지품을 한 개 빼가므로 도로 채워 넣는다
                const had = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                setTimeout(function () {
                    const now = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                    if (now < had) {
                        currentUser.inventory.push(itemName);
                        saveFields({ inventory: 1 });
                        updateUI();
                    }
                }, 350);

                stealPanel(targetUser, nm2, 2, cap);
                return true;     // 아이템은 사라지지 않는다
            }

            if (cat.effect === 'equip_n_cage') {
                if (!isOthers || targetUser.code === currentUser.code) {
                    return _a.apply(this, arguments);           // 본인 장착은 기본 경로로
                }
                if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
                if (targetUser.equippedWeapons.length >= 12) {
                    showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false;
                }
                const lab = itemName + ' (장착자: ' + currentUser.name + ')';
                targetUser.equippedWeapons.push(lab);
                setEquipOwner(targetUser, lab, currentUser.code);
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + lab);
                addHistoryLog(targetUser, '[이동장] ' + currentUser.name + ' 사원이 채웠습니다.');
                addHistoryLog(currentUser, '[이동장] ' + targetUser.name + ' 사원에게 채웠습니다.');

                // 대상 쪽을 서버에 적는다. 실패하면 물건을 되돌린다.
                const had = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                const undo = function () {
                    const at = targetUser.equippedWeapons.indexOf(lab);
                    if (at >= 0) targetUser.equippedWeapons.splice(at, 1);
                    if (targetUser.equipOwner) delete targetUser.equipOwner[lab];
                    const now = (currentUser.inventory || []).filter(function (x) { return x === itemName; }).length;
                    if (now < had) {
                        currentUser.inventory = currentUser.inventory || [];
                        currentUser.inventory.push(itemName);
                    }
                    saveFields({ inventory: 1 });
                    updateUI();
                    showCustomAlert('서버에 적지 못했습니다.\n\n' + itemName + '을(를) 되돌렸습니다.');
                };

                // 값이 있는 것만 담는다 — undefined 가 하나라도 있으면 Firebase 가 통째로 거부한다
                const payload = {
                    equippedWeapons: targetUser.equippedWeapons || [],
                    equipOwner: targetUser.equipOwner || {}
                };
                if (targetUser.badge !== undefined) payload.badge = targetUser.badge;
                if (Array.isArray(targetUser.history)) payload.history = targetUser.history;

                let p;
                try {
                    p = updateUserFields(targetUser.code, payload);
                } catch (e) { console.warn('[이동장] 쓰기 실패:', e); undo(); return false; }

                if (p && typeof p.then === 'function') {
                    p.then(function () {
                        showCustomAlert(targetUser.name + ' 사원에게 채웠습니다.\n\n'
                            + '뺄 수 있는 사람은 채운 쪽뿐입니다.');
                    }).catch(function (e) {
                        console.warn('[이동장] 쓰기 거부:', e && e.message ? e.message : e);
                        undo();
                    });
                } else {
                    showCustomAlert(targetUser.name + ' 사원에게 채웠습니다.\n\n'
                        + '뺄 수 있는 사람은 채운 쪽뿐입니다.');
                }
                return true;
            }

            if (cat.effect === 'n_mask') {
                if (!isOthers || targetUser.code === currentUser.code) {
                    showCustomAlert('타인에게만 채울 수 있습니다.'); return false;
                }
                if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
                if (targetUser.equippedWeapons.length >= 12) {
                    showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false;
                }
                const label = itemName + ' (장착자: ' + currentUser.name + ')';
                targetUser.equippedWeapons.push(label);
                setEquipOwner(targetUser, label, currentUser.code);
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
                addHistoryLog(targetUser, '[진실 마스크] ' + currentUser.name + ' 사원이 채웠습니다.');
                try {
                    const pl = {
                        equippedWeapons: targetUser.equippedWeapons || [],
                        equipOwner: targetUser.equipOwner || {}
                    };
                    if (targetUser.badge !== undefined) pl.badge = targetUser.badge;
                    if (Array.isArray(targetUser.history)) pl.history = targetUser.history;
                    updateUserFields(targetUser.code, pl);
                } catch (e) { console.warn('[진실 마스크]', e); }
                showCustomAlert(targetUser.name + ' 사원의 얼굴에 씌웠습니다.\n\n'
                    + '이제 그 사원의 안쪽이 보입니다.');
                return true;
            }

            return _a.apply(this, arguments);
        };
        applyItemEffect._newItems2 = true;
        clearInterval(iv);
        console.log('[신규] 타인 사용 처리 연결');
    }, 500);
})();

// 봉제 인형 사흘 정산분
(function hookDollPt() {
    const _p = payDarkPt;
    payDarkPt = function () {
        if ((currentUser.dollPt || 0) > Date.now()) addDarkPt(currentUser, 3000, '봉제 인형');
        return _p.apply(this, arguments);
    };
})();

// ==========================================
// 빼앗은 장비는 장착칸에 보이지 않게 — 능력만 돈다
// ==========================================
(function stolenOutOfSight() {
    const EYES = ['황룡의 눈', '산군의 도움'];

    // 줄 하나로 볼 수 있는 크기인지 — 큰 상자는 건드리지 않는다
    function looksLikeRow(el) {
        if (!el) return false;
        if (el === document.body || el === document.documentElement) return false;
        const id = el.id || '';
        if (/app-container|main-screen|login-screen|tab|modal-content|modal-overlay/.test(id)) return false;
        const cls = (el.className || '').toString();
        if (/\bcontainer\b|\btab\b|modal-content|modal-overlay|sub-panel/.test(cls)) return false;
        const t = el.textContent || '';
        if (t.length > 260) return false;
        if (el.querySelectorAll('button').length > 3) return false;
        return true;
    }

    // 줄을 찾는다 — 너무 크지만 않으면 받아 준다
    function findRow(b) {
        let row = b.parentElement, hops = 0;
        while (row && hops < 5) {
            const t = row.textContent || '';
            if (t.length < 700 && row.querySelectorAll('button').length <= 4) {
                for (let j = 0; j < EYES.length; j++) {
                    if (t.indexOf(EYES[j]) >= 0) return { row: row, nm: EYES[j] };
                }
            }
            const id = row.id || '';
            const cls = (row.className || '').toString();
            if (/app-container|main-screen|login-screen/.test(id)
                || /\bcontainer\b|modal-content|modal-overlay/.test(cls)) break;
            row = row.parentElement; hops++;
        }
        return null;
    }

    // 장착칸 줄에 숫자를 덧붙인다 — 은심장 구출 횟수 · 단추 남은 횟수 · 종이배
    const COUNT_OF = {
        '🩶 은심장': function (u) { return '구출 ' + (u.heartSaves || 0) + '회'; },
        '통신 단추': function (u) { return '남은 ' + (u.buttonUses | 0) + '회'; }
    };

    function addCount() {
        if (typeof currentUser === 'undefined' || !currentUser) return;
        const btns = document.querySelectorAll('button');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if ((b.textContent || '').trim() !== '해제') continue;
            let row = b.parentElement, hops = 0, nm = null;
            while (row && hops < 5) {
                const t = row.textContent || '';
                if (t.length < 700) {
                    const keys = Object.keys(COUNT_OF);
                    for (let j = 0; j < keys.length; j++) {
                        if (t.indexOf(keys[j]) >= 0) { nm = keys[j]; break; }
                    }
                }
                if (nm) break;
                const id = row.id || '', cls = (row.className || '').toString();
                if (/app-container|main-screen/.test(id) || /container|modal-content/.test(cls)) break;
                row = row.parentElement; hops++;
            }
            if (!nm || !row) continue;

            const txt = COUNT_OF[nm](currentUser);
            let tag = row.querySelector('.cnt-tag');
            if (!tag) {
                tag = document.createElement('span');
                tag.className = 'cnt-tag';
                tag.style.cssText = 'margin-right:6px;padding:3px 8px;border-radius:3px;'
                    + 'background:rgba(212,175,55,0.18);color:#e8c87a;font-size:11px;white-space:nowrap';
                b.parentElement.insertBefore(tag, b);
            }
            if (tag.textContent !== txt) tag.textContent = txt;
        }
    }

    // 장착칸의 그 줄에 「표적」 버튼을 붙인다
    function addAim() {
        const btns = document.querySelectorAll('button');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            if ((b.textContent || '').trim() !== '해제') continue;
            if (b.parentElement && b.parentElement.querySelector('.aim-btn')) continue;
            const found = findRow(b);
            if (!found) continue;
            const a = document.createElement('button');
            a.className = 'aim-btn';
            a.textContent = '표적';
            a.style.cssText = 'margin-right:5px;padding:5px 11px;border:0;cursor:pointer;'
                + 'background:#d4af37;color:#14161c;font-size:11px';
            a.onclick = function (ev) { ev.stopPropagation(); pickTargetFor(found.nm); };
            b.parentElement.insertBefore(a, b);
        }
    }

    // 왜 안 붙는지 보고 싶을 때
    window.aimDebug = function () {
        const btns = Array.from(document.querySelectorAll('button'))
            .filter(function (b) { return (b.textContent || '').trim() === '해제'; });
        console.log('해제 버튼 ' + btns.length + '개');
        btns.forEach(function (b, i) {
            const f = findRow(b);
            const p = b.parentElement;
            console.log((i + 1) + '. 찾음:', f ? f.nm : '✗',
                '| 부모 글자수', (p ? (p.textContent || '').length : 0),
                '| 부모 버튼수', p ? p.querySelectorAll('button').length : 0,
                '| 글:', (p ? (p.textContent || '').trim().slice(0, 40) : ''));
        });
        console.log('붙은 표적 버튼:', document.querySelectorAll('.aim-btn').length + '개');
    };

    let busy = false;
    const run = function () {
        if (busy) return;
        busy = true;
        try { addAim(); addCount(); } catch (e) { }
        busy = false;
    };
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    setTimeout(run, 900);
})();

// ==========================================
// 빼앗긴 장비는 다시 차지 못한다
// ==========================================
function gearLockedOn(u, name) {
    if (!u || !u.gearLock) return null;
    const rec = u.gearLock[name];
    if (!rec) return null;
    if (rec.day && rec.day !== today()) { delete u.gearLock[name]; return null; }   // 자정이 지나면 풀린다
    return rec;
}

(function hookEquipLock() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._gearLock) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const rec = gearLockedOn(currentUser, itemName);
            if (rec) {
                const who = (db.users[rec.by] || {}).name || rec.by;
                showCustomAlert(itemName + '\n\n지금은 손에 잡히지 않습니다.\n'
                    + (rec.src || '') + ' — ' + who + ' 사원이 가져갔습니다.');
                return;
            }
            return _u.apply(this, arguments);
        };
        useInventoryItem._gearLock = true;
        window.__gearLockOn = true;
        clearInterval(iv);
        console.log('[신규] 빼앗긴 장비 잠금 연결');
    }, 500);
})();

// ==========================================
// 빼앗은 것은 장착칸에 넣지 않는다
// 능력을 읽는 함수만 잠깐 같이 보게 한다
// ==========================================
let borrowDepth = 0;
function withBorrowed(fn, ctx, args) {
    const u = currentUser;
    const bor = (u && Array.isArray(u.borrowedGear)) ? u.borrowedGear : [];
    if (!bor.length) return fn.apply(ctx, args);
    if (borrowDepth > 0) return fn.apply(ctx, args);     // 이미 얹은 채로 들어왔으면 그대로
    const keep = (u.equippedWeapons || []).slice();
    u.equippedWeapons = keep.concat(bor);
    borrowDepth++;
    try {
        return fn.apply(ctx, args);
    } finally {
        borrowDepth--;
        u.equippedWeapons = keep;                        // 반드시 되돌린다
    }
}

// 능력을 읽는 함수만 골라 감싼다 — 넓게 쓸면 편집·저장까지 건드린다
// 화면을 건드리는 함수는 넣지 않는다.
// 그 안에서 다시 그리기가 돌면, 잠깐 얹어 둔 목록이 장착칸에 그대로 보인다.
const READERS = [
    'hasEquip', 'plugActive', 'rubyActive', 'hasVaginaPlug', 'myDnaEquip',
    'sapActive', 'isBlindfolded', 'getPollutionMultiplier',
    'facilityLuckMult', 'gearValue', 'dnaGiftOf', 'hasSureBear', 'roleFlipped'
];

(function hookReaders() {
    let tries = 0;
    const iv = setInterval(function () {
        let n = 0, left = 0;
        READERS.forEach(function (k) {
            const f = window[k];
            if (typeof f !== 'function') { left++; return; }
            if (f._seeBorrowed) { n++; return; }
            const _f = f;
            window[k] = function () { return withBorrowed(_f, this, arguments); };
            window[k]._seeBorrowed = true;
            n++;
        });
        if (!left || ++tries > 30) {
            clearInterval(iv);
            console.log('[신규] 빌려 온 능력을 읽는 함수 ' + n + '개 연결');
        }
    }, 600);
})();

// ==========================================
// 표적이 된 사람의 장착칸을 봉인한다
// ==========================================
const SEAL_WORD = {
    '황룡의 눈': '황룡의 시선을 받았습니다.',
    '산군의 도움': '산군의 기운에 억눌립니다.'
};

function sealOn(u) {
    if (!u || !u.gearSeal) return null;
    const r = u.gearSeal;
    if (r.day && r.day !== today()) { delete u.gearSeal; return null; }
    return r;
}

function putSeal(target, srcName) {
    target.gearSeal = { by: currentUser.code, src: srcName, day: today() };
    updateUserFields(target.code, { gearSeal: target.gearSeal });
    removeBadgeLine(target, '황룡의 시선을 받았습니다');
    removeBadgeLine(target, '산군의 기운에 억눌립니다');
    appendBadgeNoteToUser(target, SEAL_WORD[srcName] || '봉인되었습니다.');
}

function liftSeal(t) {
    if (!t || !t.gearSeal) return;
    delete t.gearSeal;
    updateUserFields(t.code, { gearSeal: null });
    removeBadgeLine(t, '황룡의 시선을 받았습니다');
    removeBadgeLine(t, '산군의 기운에 억눌립니다');
}

// 봉인 중에는 아무것도 차지 못한다
(function hookSealEquip() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._gearSeal) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const r = sealOn(currentUser);
            const cat = ITEM_CATALOG[itemName] || {};
            const eff = String(cat.effect || '');
            const isEquip = eff.indexOf('equip_') === 0;
            // 힘을 얹는 물건은 전부 막는다 — 물약·부적·쪽지까지
            const isBuff = /luck|pct|eva|bon|gim|fac|dark|guard|protect|reroll|bonus|b_/.test(eff)
                || /행운|판정|회피|기믹|공용시설|어둠 탐사|보호/.test(String(cat.desc || ''));
            if (r && (isEquip || isBuff)) {
                const who = (db.users[r.by] || {}).name || r.by;
                showCustomAlert((SEAL_WORD[r.src] || '봉인되었습니다.')
                    + '\n\n몸이 묶여 있습니다.\n' + who + ' 사원이 풀 때까지 장착도 힘을 얹는 물건도 쓸 수 없습니다.');
                return;
            }
            return _u.apply(this, arguments);
        };
        useInventoryItem._gearSeal = true;
        window.__gearSealOn = true;
        clearInterval(iv);
        console.log('[신규] 장착칸 봉인 연결');
    }, 500);
})();

// 봉인 문구를 장착칸 위에 올린다
(function showSealBanner() {
    function draw() {
        const r = sealOn(currentUser);
        const old = document.getElementById('gear-seal-line');
        if (!r) { if (old) old.remove(); return; }
        if (old) return;

        // 「장착 중 슬롯 1」 줄을 찾아 그 앞에 끼운다
        const all = document.querySelectorAll('div');
        for (let i = 0; i < all.length; i++) {
            const el = all[i];
            const t = (el.textContent || '');
            if (t.indexOf('[장착 중 슬롯 1]') < 0) continue;
            if (t.length > 400) continue;                   // 큰 상자는 건너뛴다
            const box = document.createElement('div');
            box.id = 'gear-seal-line';
            box.style.cssText = 'margin:8px 0;padding:9px 11px;border:1px solid #8a6b2f;'
                + 'background:rgba(40,28,8,0.85);color:#e8c87a;font-size:12px;letter-spacing:0.3px';
            box.textContent = (SEAL_WORD[r.src] || '봉인되었습니다.') + ' 장착칸이 묶여 있습니다.';
            el.parentElement.insertBefore(box, el);
            return;
        }
    }
    let busy = false;
    const run = function () { if (busy) return; busy = true; try { draw(); } catch (e) { } busy = false; };
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    setInterval(run, 1500);
})();

// ==========================================
// 소지품 버튼 글자 — 「타인」을 「표적」으로
// ==========================================
(function renameTargetBtn() {
    const NAMES = ['황룡의 눈', '산군의 도움'];
    function fix() {
        const btns = document.querySelectorAll('button[onclick]');
        for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const oc = b.getAttribute('onclick') || '';
            let hit = false;
            for (let j = 0; j < NAMES.length; j++) {
                if (oc.indexOf(NAMES[j]) >= 0) { hit = true; break; }
            }
            if (!hit) continue;
            const t = (b.textContent || '').trim();
            if (t === '표적') continue;
            if (/타인|대상|에게|사용/.test(t)) b.textContent = '표적';
        }
    }
    // 그린 직후에 바로 바꾼다 — 주기로 돌리면 다시 그릴 때마다 글자가 왔다 갔다 한다
    let busy = false;
    const run = function () {
        if (busy) return;
        busy = true;
        try { fix(); } catch (e) { }
        busy = false;
    };

    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });

    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._targetLabel) { clearInterval(iv); return; }
        const _r = renderInventory;
        renderInventory = function () {
            const out = _r.apply(this, arguments);
            run();
            return out;
        };
        renderInventory._targetLabel = true;
        clearInterval(iv);
    }, 500);

    setTimeout(run, 900);
})();

// ==========================================
// 14. 확인
// ==========================================
window.newItemState = function () {
    const u = currentUser;
    console.log('%c===== 신규 아이템 =====', 'color:#d4af37; font-size:13px');
    console.log('  소속:', affilText(u).trim(), isCounsel(u) ? '(상담사 — 전부 보임)' : '');
    console.log('  등록:', NEW.length + 1 + '종 (뱃지 포함)');

    console.log('%c--- 지금 쇼핑몰에 보이는 신규분 ---', 'color:#4fc3f7');
    const allNames = Object.keys(SHOP_AFFIL)
        .concat((typeof EQUIP_AFFIL !== 'undefined' && EQUIP_AFFIL) ? Object.keys(EQUIP_AFFIL) : [])
        .filter(function (n, i, a) { return a.indexOf(n) === i; });
    const show = allNames.filter(shopAllowed);
    console.log('  ' + (show.join(' · ') || '(없음)'));
    console.log('  3% 희귀분:', RARE3.map(function (n) {
        return n + ' (' + ((window.RARE_ALIEN_RATE || {})[n] * 100 || 0) + '%)';
    }).join(' · '));
    console.log('  내 진열:', (u.alienUnlockedItems || []).join(' · ') || '(없음)');

    console.log('%c--- 걸려 있는 버프 ---', 'color:#4fc3f7');
    const b = ibClean(u);
    if (b.length) console.table(b.map(function (x) {
        return { 항목: buffName(x.k), 값: x.v, 출처: x.src,
                 남은: x.run ? '다음 탐사 1회' : Math.round((x.until - Date.now()) / 60000) + '분' };
    })); else console.log('  (없음)');

    console.log('%c--- 그밖 ---', 'color:#4fc3f7');
    console.log('  오염 동결:', (u.pollFreezeUntil || 0) > Date.now()
        ? Math.round((u.pollFreezeUntil - Date.now()) / 60000) + '분 남음' : '없음');
    console.log('  대기 정산:', (u.darkPtPend || 0).toLocaleString() + 'P', (u.darkPtWhy || []).join(' · '));
    console.log('  확정 구출권:', rescueGuarantee() || '없음');
    console.log('  낚시 줄 방어:', u.lineGuard || 0);
    console.log('  종이배:', (u.paperBoat | 0) + '회 남음');
    console.log('  통신 단추:', hasEquipped(u, '통신 단추') ? (u.buttonUses | 0) + '회 남음' : '장착 안 함');
    console.log('  은색 저울 확률:', hasEquipped(u, '은색 저울') ? scaleRisk(u) + '%' : '없음');
    console.log('  은심장:', hasSilverHeart(u) ? (u.heartSaves || 0) + '회' : '없음');
    console.log('  빼앗아 둔 것:', Object.keys(u.stolenGear || {}).join(' · ') || '(없음)');
    console.log('  내가 잠긴 장비:', Object.keys(u.gearLock || {}).join(' · ') || '(없음)');
    console.log('  빌려 온 능력:', (u.borrowedGear || []).join(' · ') || '(없음)');
    console.log('  내 장착칸 봉인:', sealOn(u) ? (SEAL_WORD[sealOn(u).src] || '봉인') : '없음');
    ['황룡의 눈', '산군의 도움'].forEach(function (n) {
        if (!hasAny(u, n)) return;
        console.log('  ' + n + ' — 장착', hasEquipped(u, n) ? 'O' : '-',
                    '· 오늘 남은 횟수', dayLeft(u, n, 2));
    });
};

console.log('[신규] 26종 등록 — newItemState() · heartState() · giveSilverHeart(사번)');

})();