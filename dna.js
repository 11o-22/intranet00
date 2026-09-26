// ==========================================
// ★ 유전자 고유 아이템 — 60종 (이름·성능 전부 다름)
// index.html 에서 dna.js 다음에 불러온다
// ==========================================
//
// 사원마다 하나씩, 이름도 성능도 겹치지 않는다.
// 장착형이다. 차고 있는 동안만 힘이 돈다.
//
//   gim   기믹 파훼 (탐사당 N회)
//   eva   판정 회피 (탐사당 N회)
//   luck  행운 (탐사당 N회 — 나쁜 결과를 한 번 뒤집는다)
//   death 즉사 회피 (탐사당 1회)
//   pct   공용시설 행운 배율 (착용 중 영구)
//   dark  어둠 탐사 횟수 (착용 중 영구)
//   fac   공용시설 이용 횟수 (착용 중 영구)

const DNA_GIFTS = [
    { n:'별빛을 담은 구슬', e:{ death:1 }, d:'즉사 회피 1회' },
    { n:'하늘색 조각 퍼즐', e:{ pct:500 }, d:'공용시설 행운 500%' },
    { n:'반쯤 녹은 서리 꽃', e:{ fac:7, pct:300 }, d:'공용시설 행운 300% · 공용시설 +7회' },
    { n:'잠들지 않는 등불', e:{ fac:8, pct:300 }, d:'공용시설 행운 300% · 공용시설 +8회' },
    { n:'물결이 멈춘 유리병', e:{ dark:2, pct:300 }, d:'공용시설 행운 300% · 어둠 탐사 +2회' },
    { n:'달을 삼킨 조개', e:{ luck:3, pct:300 }, d:'행운 3회 · 공용시설 행운 300%' },
    { n:'첫눈이 남긴 실', e:{ luck:4, pct:300 }, d:'행운 4회 · 공용시설 행운 300%' },
    { n:'빛이 고인 깃털', e:{ eva:3, pct:300 }, d:'회피 3회 · 공용시설 행운 300%' },
    { n:'숨을 쉬는 모래시계', e:{ eva:4, pct:300 }, d:'회피 4회 · 공용시설 행운 300%' },
    { n:'안개로 짠 손수건', e:{ gim:1, pct:300 }, d:'기믹 파훼 1회 · 공용시설 행운 300%' },
    { n:'여덟 번 접힌 종이학', e:{ fac:6, pct:400 }, d:'공용시설 행운 400% · 공용시설 +6회' },
    { n:'녹지 않는 얼음 열쇠', e:{ fac:7, pct:400 }, d:'공용시설 행운 400% · 공용시설 +7회' },
    { n:'소리가 나지 않는 방울', e:{ dark:1, pct:400 }, d:'공용시설 행운 400% · 어둠 탐사 +1회' },
    { n:'노을을 가둔 호박', e:{ luck:2, pct:400 }, d:'행운 2회 · 공용시설 행운 400%' },
    { n:'뿌리 없는 유리 꽃', e:{ luck:3, pct:400 }, d:'행운 3회 · 공용시설 행운 400%' },
    { n:'밤을 적신 리본', e:{ eva:2, pct:400 }, d:'회피 2회 · 공용시설 행운 400%' },
    { n:'그림자가 없는 촛대', e:{ eva:3, pct:400 }, d:'회피 3회 · 공용시설 행운 400%' },
    { n:'바람이 새긴 문양', e:{ gim:1, pct:400 }, d:'기믹 파훼 1회 · 공용시설 행운 400%' },
    { n:'이슬이 굳은 목걸이', e:{ dark:3, gim:1 }, d:'기믹 파훼 1회 · 어둠 탐사 +3회' },
    { n:'금이 가지 않는 거울 조각', e:{ gim:2, luck:2 }, d:'기믹 파훼 2회 · 행운 2회' },
    { n:'별자리를 옮긴 지도', e:{ gim:2, luck:3 }, d:'기믹 파훼 2회 · 행운 3회' },
    { n:'심장을 닮은 씨앗', e:{ gim:2, luck:4 }, d:'기믹 파훼 2회 · 행운 4회' },
    { n:'잠긴 물의 반지', e:{ eva:2, gim:2 }, d:'기믹 파훼 2회 · 회피 2회' },
    { n:'구름을 뜬 국자', e:{ eva:3, gim:2 }, d:'기믹 파훼 2회 · 회피 3회' },
    { n:'불이 붙지 않는 성냥', e:{ eva:4, gim:2 }, d:'기믹 파훼 2회 · 회피 4회' },
    { n:'눈을 감은 나침반', e:{ dark:1, gim:2 }, d:'기믹 파훼 2회 · 어둠 탐사 +1회' },
    { n:'빗물로 만든 방울', e:{ dark:2, gim:2 }, d:'기믹 파훼 2회 · 어둠 탐사 +2회' },
    { n:'시들지 않는 마른 잎', e:{ fac:6, gim:2 }, d:'기믹 파훼 2회 · 공용시설 +6회' },
    { n:'온기가 남은 재', e:{ fac:7, gim:2 }, d:'기믹 파훼 2회 · 공용시설 +7회' },
    { n:'파도가 놓고 간 열쇠', e:{ fac:8, gim:2 }, d:'기믹 파훼 2회 · 공용시설 +8회' },
    { n:'천천히 도는 팽이', e:{ dark:2, eva:4 }, d:'회피 4회 · 어둠 탐사 +2회' },
    { n:'깃털보다 가벼운 돌', e:{ dark:2, luck:4 }, d:'행운 4회 · 어둠 탐사 +2회' },
    { n:'두 번 피는 꽃봉오리', e:{ dark:2, fac:8 }, d:'어둠 탐사 +2회 · 공용시설 +8회' },
    { n:'이름이 지워진 부적', e:{ dark:3, eva:2 }, d:'회피 2회 · 어둠 탐사 +3회' },
    { n:'빛을 먹는 수정', e:{ dark:3, eva:3 }, d:'회피 3회 · 어둠 탐사 +3회' },
    { n:'흐르지 않는 모래', e:{ dark:3, eva:4 }, d:'회피 4회 · 어둠 탐사 +3회' },
    { n:'메아리를 담은 잔', e:{ dark:3, luck:2 }, d:'행운 2회 · 어둠 탐사 +3회' },
    { n:'서리로 쓴 편지', e:{ dark:3, luck:3 }, d:'행운 3회 · 어둠 탐사 +3회' },
    { n:'꺼지지 않는 반딧불', e:{ dark:3, luck:4 }, d:'행운 4회 · 어둠 탐사 +3회' },
    { n:'바늘 없는 나침반', e:{ dark:3, fac:6 }, d:'어둠 탐사 +3회 · 공용시설 +6회' },
    { n:'무게가 없는 열매', e:{ dark:3, fac:7 }, d:'어둠 탐사 +3회 · 공용시설 +7회' },
    { n:'은빛으로 굳은 물방울', e:{ dark:3, fac:8 }, d:'어둠 탐사 +3회 · 공용시설 +8회' },
    { n:'하늘을 비춘 손거울', e:{ eva:3, fac:7, luck:2 }, d:'회피 3회 · 행운 2회 · 공용시설 +7회' },
    { n:'뒤집히지 않는 모래시계', e:{ eva:4, fac:7, luck:2 }, d:'회피 4회 · 행운 2회 · 공용시설 +7회' },
    { n:'달빛으로 뜬 실타래', e:{ eva:2, fac:7, luck:3 }, d:'회피 2회 · 행운 3회 · 공용시설 +7회' },
    { n:'소리를 삼킨 종', e:{ eva:3, fac:7, luck:3 }, d:'회피 3회 · 행운 3회 · 공용시설 +7회' },
    { n:'계절을 건너뛴 봉오리', e:{ eva:4, fac:7, luck:3 }, d:'회피 4회 · 행운 3회 · 공용시설 +7회' },
    { n:'젖지 않는 종이배', e:{ eva:2, fac:7, luck:4 }, d:'회피 2회 · 행운 4회 · 공용시설 +7회' },
    { n:'빛이 새는 조약돌', e:{ eva:3, fac:7, luck:4 }, d:'회피 3회 · 행운 4회 · 공용시설 +7회' },
    { n:'닫히지 않는 작은 문', e:{ dark:2, gim:1, luck:2 }, d:'기믹 파훼 1회 · 행운 2회 · 어둠 탐사 +2회' },
    { n:'별을 세던 주판', e:{ fac:7, gim:1, luck:2 }, d:'기믹 파훼 1회 · 행운 2회 · 공용시설 +7회' },
    { n:'녹슬지 않는 나사', e:{ fac:8, gim:1, luck:2 }, d:'기믹 파훼 1회 · 행운 2회 · 공용시설 +8회' },
    { n:'숨을 참은 풍선', e:{ eva:3, gim:1, luck:2 }, d:'기믹 파훼 1회 · 회피 3회 · 행운 2회' },
    { n:'안개가 고인 병뚜껑', e:{ eva:4, gim:1, luck:2 }, d:'기믹 파훼 1회 · 회피 4회 · 행운 2회' },
    { n:'빛으로 엮은 매듭', e:{ dark:1, gim:1, luck:3 }, d:'기믹 파훼 1회 · 행운 3회 · 어둠 탐사 +1회' },
    { n:'돌아오지 않는 부메랑', e:{ dark:2, gim:1, luck:3 }, d:'기믹 파훼 1회 · 행운 3회 · 어둠 탐사 +2회' },
    { n:'얼지 않는 샘물 한 방울', e:{ fac:6, gim:1, luck:3 }, d:'기믹 파훼 1회 · 행운 3회 · 공용시설 +6회' },
    { n:'떨어지지 않는 낙엽', e:{ fac:7, gim:1, luck:3 }, d:'기믹 파훼 1회 · 행운 3회 · 공용시설 +7회' },
    { n:'시간이 비껴간 태엽', e:{ fac:8, gim:1, luck:3 }, d:'기믹 파훼 1회 · 행운 3회 · 공용시설 +8회' },
    { n:'처음을 기억하는 단추', e:{ eva:2, gim:1, luck:3 }, d:'기믹 파훼 1회 · 회피 2회 · 행운 3회' }
];


// ==========================================
// 번호 배정 — 한 번 받으면 바뀌지 않는다
// ==========================================
// 제대로 된 사원인가 — 유령에게는 번호를 주지 않는다
function isRealUser(u) {
    return !!(u && typeof u === 'object'
        && u.code && typeof u.code === 'string'
        && u.name && typeof u.name === 'string'
        && u.code !== 'kario0987');
}

function dnaGiftIndex(user) {
    if (!isRealUser(user)) return -1;
    if (user.dnaGift !== undefined && user.dnaGift !== null) return user.dnaGift;

    // 이미 쓰인 번호를 피해 가장 작은 빈 번호를 준다
    // 유령이 잡고 있는 번호는 빈 것으로 친다
    const used = new Set();
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!isRealUser(u)) return;
        if (u.dnaGift !== undefined && u.dnaGift !== null) used.add(u.dnaGift);
    });

    let idx = 0;
    while (used.has(idx) && idx < DNA_GIFTS.length) idx++;
    if (idx >= DNA_GIFTS.length) {
        // 60명을 넘으면 사번 기반으로 돌려쓴다
        idx = seedOf('gift|' + user.code) % DNA_GIFTS.length;
    }

    user.dnaGift = idx;
    if (currentUser && user.code === currentUser.code) saveFields({ dnaGift: 1 });
    else updateUserFields(user.code, { dnaGift: idx });
    return idx;
}

function dnaGiftOf(user) {
    const i = dnaGiftIndex(user);
    return (i >= 0 && DNA_GIFTS[i]) ? DNA_GIFTS[i] : null;
}

// 이름 — 뒤에 DNA 를 붙여 한 번 더 갈라 둔다
function dnaItemName(user) {
    const g = dnaGiftOf(user);
    if (!g) return '';
    return g.n + ' · ' + dnaOf(user);
}

function ensureDnaItem(user) {
    if (!isRealUser(user)) return null;
    const g = dnaGiftOf(user);
    if (!g) return null;
    const nm = dnaItemName(user);
    if (!nm) return null;
    if (ITEM_CATALOG[nm]) return nm;

    ITEM_CATALOG[nm] = {
        price: 30000, usable: true, targetable: false,
        effect: 'equip_dna', dnaOwner: user.code, dnaEff: g.e,
        desc: '[고유] ' + user.name + ' 사원의 것. 장착하면 ' + g.d + '.'
    };
    if (typeof NO_SELL_ITEMS !== 'undefined' && !NO_SELL_ITEMS.includes(nm)) NO_SELL_ITEMS.push(nm);
    return nm;
}

function buildAllDnaItems() {
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (isRealUser(u)) ensureDnaItem(u);
    });
}

// ==========================================
// 장착
// ==========================================
function myDnaEquip() {
    if (!currentUser || !currentUser.equippedWeapons) return null;
    for (let i = 0; i < currentUser.equippedWeapons.length; i++) {
        const w = currentUser.equippedWeapons[i];
        const cat = ITEM_CATALOG[getEquipBaseName(w)] || ITEM_CATALOG[w];
        if (cat && cat.effect === 'equip_dna') return cat.dnaEff || null;
    }
    return null;
}

(function hookEquip() {
    if (typeof useInventoryItem !== 'function') return;
    const _u = useInventoryItem;
    useInventoryItem = function (itemName) {
        const cat = ITEM_CATALOG[itemName];
        if (!cat || cat.effect !== 'equip_dna') return _u.apply(this, arguments);
        if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 장착할 수 없습니다.'); return; }

        if (!currentUser.equippedWeapons) currentUser.equippedWeapons = [];
        if (myDnaEquip()) { showCustomAlert('고유 아이템은 하나만 찰 수 있습니다.'); return; }
        if (currentUser.equippedWeapons.length >= 5) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }

        currentUser.equippedWeapons.push(itemName);
        setEquipOwner(currentUser, itemName, currentUser.code);
        removeItemFromInventory(currentUser, itemName, 1);

        const e = cat.dnaEff || {};
        if (e.fac) {
            currentUser.dnaFacBonus = e.fac;
            currentUser.facilityMax = (currentUser.facilityMax || 20) + e.fac;
        }
        appendBadgeNoteToUser(currentUser, '[장착됨] ' + itemName.split(' · ')[0]);
        addHistoryLog(currentUser, '[고유 장비] ' + itemName.split(' · ')[0] + ' 장착');
        saveSelfFull();
        updateUI();
        showCustomAlert(itemName.split(' · ')[0] + '\n\n' + (cat.desc.split('장착하면 ')[1] || ''));
    };
})();

(function hookUnequip() {
    if (typeof unequipWeapon !== 'function') return;
    const _f = unequipWeapon;
    unequipWeapon = function (index) {
        const w = currentUser.equippedWeapons && currentUser.equippedWeapons[index];
        const cat = w ? (ITEM_CATALOG[getEquipBaseName(w)] || ITEM_CATALOG[w]) : null;
        const isDna = cat && cat.effect === 'equip_dna';
        const r = _f.apply(this, arguments);
        if (isDna && currentUser.dnaFacBonus) {
            currentUser.facilityMax = Math.max(20, (currentUser.facilityMax || 20) - currentUser.dnaFacBonus);
            currentUser.dnaFacBonus = 0;
            saveFields({ facilityMax: 1, dnaFacBonus: 1 });
            updateUI();
        }
        return r;
    };
})();

// ==========================================
// 효과 연결
// ==========================================

// 공용시설 행운
(function hookLuckPct() {
    if (typeof facilityLuckMult !== 'function') return;
    const _f = facilityLuckMult;
    facilityLuckMult = function (user) {
        let m = _f.apply(this, arguments);
        const u = user || currentUser;
        if (u && currentUser && u.code === currentUser.code) {
            const e = myDnaEquip();
            if (e && e.pct) m *= (e.pct / 100);
        }
        return m;
    };
})();

// 어둠 탐사 횟수
(function hookDarkTries() {
    if (typeof getDarkTriesLeft !== 'function') return;
    const _f = getDarkTriesLeft;
    getDarkTriesLeft = function () {
        let n = _f.apply(this, arguments);
        const e = myDnaEquip();
        if (e && e.dark) n += e.dark;
        return n;
    };
})();

// 탐사에 들어갈 때 회수를 채운다
let dnaCharge = { gim: 0, eva: 0, luck: 0, death: 0 };

function resetDnaCharge() {
    const e = myDnaEquip() || {};
    dnaCharge = {
        gim: e.gim || 0, eva: e.eva || 0,
        luck: e.luck || 0, death: e.death || 0
    };
}

(function hookRunStart() {
    ['startDarkRun', 'launchPartyRun'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(resetDnaCharge, 200);
            return r;
        };
    });
})();

function dnaUse(key) {
    if (!dnaCharge[key] || dnaCharge[key] <= 0) return false;
    dnaCharge[key]--;
    return true;
}

// 즉사 · 회피
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._dnaHooked) { clearInterval(iv); return; }
        const _d = darkDeath;
        darkDeath = function (reason) {
            if (darkRun && !darkRun._dead) {
                if (dnaUse('death') || dnaUse('eva')) {
                    darkRun.fail = Math.max(0, darkRun.fail - 1);
                    applyPollutionToUser(currentUser, 4);
                    const g = myDnaEquip();
                    darkBodyEl().innerHTML = darkBox('—',
                        reason + '<br><br><span style="color:#8fd4ff;">— 품 안의 것이 먼저 반응했다.<br>' +
                        '빛이 한 번 일렁이고, 그것으로 끝이었다.</span>',
                        darkChoiceBtn('숨을 고른다.', 'renderDarkStep();'));
                    mountDarkChat('normal');
                    saveDB();
                    return;
                }
            }
            return _d.apply(this, arguments);
        };
        darkDeath._dnaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 행운 — 낮은 눈을 한 번 되돌린다
(function hookLuckRoll() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._dnaHooked) { clearInterval(iv); return; }
        const _l = luckReroll;
        luckReroll = function (roll) {
            roll = _l.apply(this, arguments);
            if (darkRun && roll <= 6 && dnaUse('luck')) {
                const nr = Math.floor(Math.random() * 20) + 1;
                if (typeof showDarkToast === 'function') showDarkToast('✦ 고유의 운 (' + roll + ' → ' + nr + ')');
                return nr;
            }
            return roll;
        };
        luckReroll._dnaHooked = true;
        clearInterval(iv);
    }, 500);
})();

// 기믹 파훼 — 작두와 같은 자리에 버튼이 선다
(function hookSmash() {
    const iv = setInterval(function () {
        if (typeof jakduAvailable !== 'function') return;
        if (jakduAvailable._dnaHooked) { clearInterval(iv); return; }
        const _j = jakduAvailable;
        jakduAvailable = function () {
            if (_j.apply(this, arguments)) return true;
            return dnaCharge.gim > 0;
        };
        jakduAvailable._dnaHooked = true;

        if (typeof smashWeapon === 'function') {
            const _s = smashWeapon;
            smashWeapon = function () {
                const w = _s.apply(this, arguments);
                if (w) return w;
                const e = myDnaEquip();
                if (e && dnaCharge.gim > 0) {
                    const nm = (currentUser.equippedWeapons || [])
                        .find(x => { const c = ITEM_CATALOG[getEquipBaseName(x)] || ITEM_CATALOG[x]; return c && c.effect === 'equip_dna'; });
                    return nm ? nm.split(' · ')[0] : '고유의 것';
                }
                return w;
            };
        }
        if (typeof useJakdu === 'function') {
            const _u = useJakdu;
            useJakdu = function () {
                if (_u.apply(this, arguments)) return true;
                return dnaUse('gim');
            };
        }
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 목록
// ==========================================
function listDnaItems() {
    const rows = Object.keys(db.users || {}).map(function (c) {
        const u = db.users[c];
        if (!isRealUser(u)) return null;
        ensureDnaItem(u);
        const g = dnaGiftOf(u);
        if (!g) return null;
        return {
            번호: dnaGiftIndex(u), 사원: u.name, 사번: u.no,
            DNA: dnaOf(u), 아이템: g.n, 성능: g.d
        };
    }).filter(Boolean).sort((a, b) => a.번호 - b.번호);

    console.log('%c===== 유전자 고유 아이템 (' + rows.length + '명) =====', 'color:#c9a8ff; font-size:13px');
    console.table(rows);
    console.log('전체 ' + DNA_GIFTS.length + '종 · 이름과 성능이 서로 겹치지 않습니다.');
    console.log('출현 확률: 기본 0.01% · 돌봄 16회를 다 채우면 0.04%');
    return rows;
}

// 아직 안 쓰인 것까지 전부
function listAllDnaGifts() {
    const taken = {};
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (isRealUser(u) && u.dnaGift !== undefined && u.dnaGift !== null) taken[u.dnaGift] = u.name;
    });
    console.log('%c===== 고유 아이템 전체 ' + DNA_GIFTS.length + '종 =====', 'color:#c9a8ff; font-size:13px');
    console.table(DNA_GIFTS.map(function (g, i) {
        return { 번호: i, 아이템: g.n, 성능: g.d, 주인: taken[i] || '-' };
    }));
}

setTimeout(buildAllDnaItems, 2500);
console.log('[DNA] 고유 아이템 ' + DNA_GIFTS.length + '종 — listAllDnaGifts() 로 전체 보기');

// ==========================================
// 번호 재배정 — 유령이 물고 있던 것을 되찾는다
// ==========================================
// resetDnaGifts()       훑기만
// resetDnaGifts(true)   실제로 다시 짬
function resetDnaGifts(doIt) {
    if (!currentUser || currentUser.code !== 'kario0987') {
        console.error('상담사 계정에서만 쓸 수 있습니다.');
        return;
    }

    const ghosts = [], real = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (c === 'kario0987') return;
        if (isRealUser(u)) real.push({ code: c, u: u });
        else ghosts.push({ code: c, u: u || {} });
    });

    // 사번 순으로 줄 세운다 — 배정이 흔들리지 않게
    real.sort(function (a, b) {
        const na = String(a.u.no || '9999'), nb = String(b.u.no || '9999');
        if (na !== nb) return na < nb ? -1 : 1;
        return a.code < b.code ? -1 : 1;
    });

    console.log('%c===== 고유 아이템 번호 재배정 =====', 'color:#c9a8ff; font-size:13px');

    if (ghosts.length) {
        console.warn('사원이 아닌 항목 ' + ghosts.length + '건');
        console.table(ghosts.map(function (x) {
            return {
                키: x.code,
                이름: x.u.name === undefined ? '(없음)' : x.u.name,
                사번: x.u.no === undefined ? '(없음)' : x.u.no,
                물고있던번호: x.u.dnaGift === undefined ? '-' : x.u.dnaGift,
                아이템: (x.u.dnaGift != null && DNA_GIFTS[x.u.dnaGift]) ? DNA_GIFTS[x.u.dnaGift].n : '-'
            };
        }));
    } else console.log('사원이 아닌 항목은 없습니다.');

    const plan = real.map(function (x, i) {
        return {
            사원: x.u.name, 사번: x.u.no,
            이전: x.u.dnaGift === undefined ? '-' : x.u.dnaGift,
            새번호: i,
            아이템: DNA_GIFTS[i] ? DNA_GIFTS[i].n : '?',
            성능: DNA_GIFTS[i] ? DNA_GIFTS[i].d : '?'
        };
    });
    console.log('사원 ' + real.length + '명');
    console.table(plan);

    if (doIt !== true) {
        console.log('%c훑기만 했습니다. 다시 짜려면 resetDnaGifts(true)', 'color:#ffd700');
        return;
    }

    // 옛 이름으로 만들어 둔 목록 항목을 지운다
    Object.keys(ITEM_CATALOG).forEach(function (k) {
        if (ITEM_CATALOG[k] && ITEM_CATALOG[k].dnaOwner) delete ITEM_CATALOG[k];
    });

    const updates = {};
    ghosts.forEach(function (x) { updates['users/' + x.code + '/dnaGift'] = null; });
    real.forEach(function (x, i) {
        x.u.dnaGift = i;
        updates['users/' + x.code + '/dnaGift'] = i;
    });

    database.ref('/').update(updates).then(function () {
        buildAllDnaItems();
        console.log('%c✓ ' + real.length + '명에게 다시 배정했습니다.', 'color:#4CAF50; font-size:13px');
        if (ghosts.length) console.log('  유령 ' + ghosts.length + '건의 번호를 회수했습니다.');
        console.log('  새로고침하면 반영됩니다.');
        if (typeof updateUI === 'function') updateUI();
    }).catch(function (e) {
        console.error('재배정 실패:', e);
    });
}