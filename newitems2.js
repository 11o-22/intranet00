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
            const out = Object.assign({}, base);
            const u = user || currentUser;
            if (!u) return out;
            [ibSum(u), passiveSum(u), heartBonus(u)].forEach(function (m) {
                Object.keys(m).forEach(function (k) { out[k] = (out[k] || 0) + m[k]; });
            });
            return out;
        };
        dnaGiftOf._newItems = true;
        clearInterval(iv);
        console.log('[신규] 임시 버프 배선 연결');
    }, 500);
})();

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
    return (u.equippedWeapons || []).some(function (w) {
        return ((typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w) === name;
    });
}

function hasAny(u, name) {
    return hasEquipped(u, name) || (u.inventory || []).indexOf(name) >= 0;
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
    if (hasEquipped(u, '%$@& 이동장') && cage > 0) {
        const got = Math.min(9000, cage * 1500);
        v += got; (u.darkPtWhy = u.darkPtWhy || []).push('%$@& 이동장 +' + got.toLocaleString() + 'P');
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
    if (hasEquipped(u, '%$@& 이동장')) {
        if (!u.cageRun || u.cageRun !== (darkRun && darkRun.zone) + '|' + today()) return '%$@& 이동장';
    }
    if (u.paperBoat && dayLeft(u, '종이배', 4) > 0) return '종이배';
    if (hasAny(u, '전용 자전거') && dayLeft(u, '전용 자전거', 2) > 0) return '전용 자전거';
    if (hasEquipped(u, '포승줄')) return '포승줄';
    if ((u.buttonCall || 0) > Date.now()) return '통신 단추';
    return null;
}

function spendGuarantee(src) {
    const u = currentUser;
    if (src === '%$@& 이동장') u.cageRun = (darkRun && darkRun.zone) + '|' + today();
    else if (src === '종이배' || src === '전용 자전거') daySpend(u, src);
    else if (src === '통신 단추') u.buttonCall = 0;
    u.cageSaved = (u.cageSaved || 0) + 1;
    u.heartSaves = (u.heartSaves || 0) + 1;
    saveFields({ cageRun: 1, cageSaved: 1, heartSaves: 1, buttonCall: 1 });
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

            // 진실 마스크 — 채워 준 쪽과 채운 쪽 모두 정산
            (u.equippedWeapons || []).forEach(function (w) {
                const base = (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
                if (base !== '진실 마스크') return;
                const o = (typeof getEquipOwner === 'function') ? getEquipOwner(u, w) : null;
                addDarkPt(u, 5000, '진실 마스크');
                if (o && o !== u.code && db.users[o]) addDarkPt(db.users[o], 5000, '진실 마스크');
            });

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

// 은색 저울 — 같이 죽을 확률을 보여 준다
(function hookScale() {
    const iv = setInterval(function () {
        if (typeof renderRescuePrompt !== 'function') return;
        if (renderRescuePrompt._newScale) { clearInterval(iv); return; }
        const _f = renderRescuePrompt;
        renderRescuePrompt = function () {
            const r = _f.apply(this, arguments);
            if (!hasEquipped(currentUser, '은색 저울')) return r;

            // 오염도와 판정으로 어림한다
            const poll = currentUser.pollution || 0;
            const e = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(currentUser) || {}) : {};
            const bon = (e.bon || 0) + (e.luck || 0) / 2;
            let risk = Math.round(Math.max(5, Math.min(92, 34 + poll * 0.45 - bon * 4)));
            currentUser._scaleRisk = risk;

            setTimeout(function () {
                const box = document.querySelector('#darkness-content, #dark-step, #darkness-log-container');
                if (!box || box.querySelector('.scale-risk')) return;
                const p = document.createElement('div');
                p.className = 'scale-risk';
                p.style.cssText = 'margin:10px 0;padding:9px 11px;border:1px solid #6b7a8f;'
                    + 'background:rgba(18,22,30,0.85);color:#cfd8e3;font-size:12px;letter-spacing:0.3px';
                p.textContent = '은색 저울 — 함께 가라앉을 확률 ' + risk + '%';
                box.insertBefore(p, box.firstChild);
            }, 120);
            return r;
        };
        renderRescuePrompt._newScale = true;
        clearInterval(iv);
    }, 500);
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
            if (lines.length) showCustomAlert('등이 한 번 흔들렸습니다.\n\n' + lines.join('\n'));
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

// ==========================================
// 9. 버프 강탈 — 황룡의 눈 · 산군의 도움
// ==========================================
function stealPanel(target, srcName, maxPick) {
    const list = ibClean(target).map(function (b, i) {
        return { i: i, t: buffName(b.k) + ' +' + b.v + (b.src ? ' · ' + b.src : '') };
    });
    const e = (typeof dnaGiftOf === 'function') ? (dnaGiftOf(target) || {}) : {};
    const own = [];
    ['luck', 'pct', 'eva', 'bon', 'fac', 'dark', 'gim'].forEach(function (k) {
        if (e[k]) own.push({ k: k, v: e[k], t: buffName(k) + ' +' + e[k] + ' · 본래' });
    });

    if (!list.length && !own.length) { showCustomAlert(target.name + ' 사원에게서 가져올 것이 없습니다.'); return; }

    const back = document.createElement('div');
    back.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.78);'
        + 'display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'max-width:420px;width:100%;max-height:78vh;overflow:auto;padding:18px;'
        + 'background:#14161c;border:1px solid #d4af37;color:#e8e4da;font-size:13px;line-height:1.7';
    let html = '<div style="font-size:15px;color:#d4af37;margin-bottom:10px">' + srcName + '</div>'
        + '<div style="margin-bottom:12px;color:#a9a49a">' + target.name
        + ' 사원에게서 가져올 것을 고르세요. (최대 ' + maxPick + '개)</div>';
    list.forEach(function (x) {
        html += '<label style="display:block;margin:5px 0"><input type="checkbox" data-t="ib" data-i="'
            + x.i + '"> ' + x.t + '</label>';
    });
    own.forEach(function (x) {
        html += '<label style="display:block;margin:5px 0"><input type="checkbox" data-t="own" data-k="'
            + x.k + '" data-v="' + x.v + '"> ' + x.t + '</label>';
    });
    html += '<div style="margin-top:14px;text-align:right">'
        + '<button data-go="1" style="padding:7px 14px;background:#d4af37;border:0;color:#14161c;cursor:pointer">가져온다</button>'
        + ' <button data-no="1" style="padding:7px 14px;background:#2a2d36;border:0;color:#a9a49a;cursor:pointer">그만</button></div>';
    box.innerHTML = html;
    back.appendChild(box);
    document.body.appendChild(back);

    box.querySelector('[data-no]').onclick = function () { back.remove(); };
    box.querySelector('[data-go]').onclick = function () {
        const on = Array.from(box.querySelectorAll('input:checked')).slice(0, maxPick);
        if (!on.length) { back.remove(); return; }
        const took = [];
        const drop = [];
        on.forEach(function (inp) {
            if (inp.dataset.t === 'ib') {
                const b = ibList(target)[parseInt(inp.dataset.i, 10)];
                if (!b) return;
                drop.push(b);
                ibAdd(currentUser, b.k, b.v, 12 * HOUR, srcName);
                took.push(buffName(b.k) + ' +' + b.v);
            } else {
                const k = inp.dataset.k, v = parseInt(inp.dataset.v, 10);
                ibAdd(currentUser, k, v, 12 * HOUR, srcName);
                ibAdd(target, k, -v, 12 * HOUR, srcName + '에 빼앗김');
                took.push(buffName(k) + ' +' + v);
            }
        });
        if (drop.length) {
            target.itemBuffs = ibList(target).filter(function (b) { return drop.indexOf(b) < 0; });
            updateUserFields(target.code, { itemBuffs: target.itemBuffs });
        }
        addHistoryLog(currentUser, '[' + srcName + '] ' + target.name + ' 사원에게서 ' + took.join(', '));
        addHistoryLog(target, '[' + srcName + '] ' + currentUser.name + ' 사원이 ' + took.join(', ') + ' 을(를) 가져갔습니다.');
        appendBadgeNoteToUser(target, '[빼앗김] ' + took.join(', '));
        saveSelfFull();
        updateUI();
        back.remove();
        showCustomAlert('가져왔습니다.\n\n' + took.join('\n'));
    };
}

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
    ['통신 단추', 5000, DREAM, 'n_button', false,
     '누군가의 단추. 어둠에서 위급할 때 세 번까지 확정 구출을 요청할 수 있다.'],
    ['연구 보고서', 700, DREAM, 'n_report', false,
     '어둠 내역이 적힌 보고서. 다음 탐사 한 번 동안 행운 300%. (1회용)'],
    ['일기장', 9000, DREAM, 'n_diary', false,
     '퇴사한 사원의 일기장. 오염도가 세 시간 멈추고, 다음 어둠에 +2,000P. (1회용)'],
    ['달빛 타투 스티커', 1004, DREAM, 'n_tattoo', false,
     '붙이면 세 가지 중 하나가 무작위로 남는다. 효과가 나오면 자국이 사라진다. (1회용)'],
    ['정갈한 문패', 7000, DREAM, 'n_plate', false,
     '상담실에서 곧바로 나올 수 있다. 다섯 번 쓰면 사라진다.'],
    ['은화 뱀', 15555, DREAM, 'n_snake', false,
     '하루 세 번 튕길 수 있다. 절반은 꽝, 절반은 행운·판정·공용시설 중 하나가 +3.'],
    ['%$@& 이동장', 444444, DREAM, 'n_cage', false,
     '어떤 것을 담기 위해 만들어졌다. 어둠마다 한 번 확정으로 남을 살리고, 살린 만큼 최대 9,000P. (장착)', 3],
    ['엽서', 500, DREAM, 'n_card', false,
     '한 번 찢으면 네 가지 중 하나가 무작위로 나온다. (1회용)'],
    ['장기말', 5000, DREAM, 'n_piece', false,
     '어느 연구소의 부속품. 던지면 다음 탐사에서 선택지의 무게가 보인다. 세 번 던지면 사라진다.'],
    ['황룡의 눈', 1000000, DREAM, 'n_dragon', true,
     '한 사람을 골라 그가 지닌 것 일부를 가져온다. 하루 두 번. 당한 쪽은 잃는다.', 3],
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
    ['산군의 도움', 1000000, DISAS, 'n_tiger', true,
     '타인에게 쓰면 그가 지닌 것을 가져올 수 있다.', 3],
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

const RARE3 = [];
NEW.forEach(function (row) {
    const nm = row[0], price = row[1], affil = row[2], eff = row[3], tgt = row[4], desc = row[5], rare = row[6];
    ITEM_CATALOG[nm] = { price: price, usable: true, targetable: !!tgt, effect: eff, desc: desc };
    if (typeof EQUIP_AFFIL !== 'undefined') EQUIP_AFFIL[nm] = affil;
    if (typeof ALIEN_ITEMS_POOL !== 'undefined' && ALIEN_ITEMS_POOL.indexOf(nm) < 0) ALIEN_ITEMS_POOL.push(nm);
    if (rare) RARE3.push(nm);
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
// 11. 쇼핑몰 노출 — 소속과 확률
// ==========================================
function shopAllowed(nm) {
    const need = SHOP_AFFIL[nm];
    if (!need) return true;
    if (isCounsel(currentUser)) return true;
    if (!affilText(currentUser).includes(need)) return false;
    if (RARE3.indexOf(nm) >= 0) return dayRoll(nm, 3);
    return true;
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

// 이미 굴려 둔 진열분도 가린다 — 그린 직후에만 한 번
function sweepShop() {
    const box = document.querySelector('#alien-items-container');
    if (!box) return;
    const kids = Array.from(box.children);
    Object.keys(SHOP_AFFIL).forEach(function (nm) {
        if (shopAllowed(nm)) return;
        kids.forEach(function (el) {
            if (el.textContent && el.textContent.indexOf(nm) >= 0) el.style.display = 'none';
        });
    });
}

(function hookShop() {
    const iv = setInterval(function () {
        let hit = 0;
        ['renderAlienShop', 'buyAlienItem'].forEach(function (n) {
            if (typeof window[n] !== 'function') return;
            if (window[n]._newAffil) { hit++; return; }
            const _f = window[n];
            const isShop = (n === 'renderAlienShop');
            window[n] = function () {
                const r = withPool(_f, this, arguments);
                // 그린 바로 뒤에 한 번만 가린다. 주기 실행은 하지 않는다 —
                // 주기로 돌리면 렌더와 서로 밀고 당기며 목록 높이가 출렁인다.
                if (isShop) { try { sweepShop(); } catch (e) { } }
                return r;
            };
            window[n]._newAffil = true;
            hit++;
        });
        if (hit < 2) return;
        clearInterval(iv);
        console.log('[신규] 우주 쇼핑몰 소속 제한 연결');
    }, 500);
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

    n_dream: null, n_scale: null, n_lamp: null, n_rope: null, n_stone: null, n_cage: null,  // 장착형

    n_button: function (nm) {
        const left = 3 - ((currentUser.useCnt && currentUser.useCnt[nm]) || 0);
        if (!darkRun) { showCustomAlert('어둠 안에서만 누를 수 있습니다.'); return; }
        currentUser.buttonCall = Date.now() + 10 * 60 * 1000;
        saveFields({ buttonCall: 1 });
        if (darkRun.partyId && typeof sendPartyChat === 'function') {
            try { sendPartyChat(currentUser.name + ' 사원이 단추를 눌렀습니다.', true); } catch (e) { }
        }
        const r = totalSpend(nm, 3);
        showCustomAlert('단추를 눌렀습니다.\n\n십 분 안의 구출이 확정됩니다.'
            + (r.gone ? '\n\n단추가 다 떨어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
    },

    n_report: function (nm) {
        ibAdd(currentUser, 'pct', 300, 0, '연구 보고서', { run: true });
        addHistoryLog(currentUser, '[연구 보고서] 행운 300%');
        gone(nm);
        showCustomAlert('보고서를 펼쳤습니다.\n\n다음 탐사 한 번 동안 행운 300%.');
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
        currentUser.quarantineUntil = 0;
        currentUser.quarantineDest = null;
        currentUser.quarantineHospital = null;
        saveFields({ quarantineUntil: 1, quarantineDest: 1, quarantineHospital: 1 });
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

    n_lace: function (nm) {
        if (typeof isBathUser === 'function' && !isBathUser(currentUser)) {
            showCustomAlert('선녀탕에 있지 않습니다.'); return;
        }
        if (typeof closeBathRoom === 'function') closeBathRoom();
        const r = totalSpend(nm, 5);
        updateUI();
        showCustomAlert('끈을 묶고 나왔습니다.'
            + (r.gone ? '\n\n신발끈이 닳아 끊어졌습니다.' : '\n\n남은 횟수 ' + r.left + '회'));
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

(function hookSelf() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._newItems2) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || String(cat.effect || '').indexOf('n_') !== 0) return _u.apply(this, arguments);

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
            if (currentUser.equippedWeapons.length >= 8) { showCustomAlert('장착 슬롯이 가득 찼습니다.'); return; }
            currentUser.equippedWeapons.push(itemName);
            setEquipOwner(currentUser, itemName, currentUser.code);
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
            if (!cat || String(cat.effect || '').indexOf('n_') !== 0) return _a.apply(this, arguments);
            if (!targetUser) return false;
            if (typeof canWearItem === 'function' && !canWearItem(currentUser, itemName)) {
                showCustomAlert('소속이 맞지 않습니다.'); return false;
            }

            if (cat.effect === 'n_boat') {
                targetUser.paperBoat = true;
                updateUserFields(targetUser.code, { paperBoat: true });
                appendBadgeNoteToUser(targetUser, '[종이배] 하루 네 번 확정 구출');
                addHistoryLog(targetUser, '[종이배] ' + currentUser.name + ' 사원이 접어 주었습니다.');
                addHistoryLog(currentUser, '[종이배] ' + targetUser.name + ' 사원에게');
                showCustomAlert(targetUser.name + ' 사원의 손에 배를 띄웠습니다.\n\n하루 네 번 확정 구출.');
                return true;
            }

            if (cat.effect === 'n_dragon' || cat.effect === 'n_tiger') {
                const nm2 = cat.effect === 'n_dragon' ? '황룡의 눈' : '산군의 도움';
                if (cat.effect === 'n_dragon') {
                    if (dayLeft(currentUser, nm2, 2) <= 0) { showCustomAlert('오늘은 더 볼 수 없습니다.'); return false; }
                    daySpend(currentUser, nm2);
                }
                stealPanel(targetUser, nm2, cat.effect === 'n_dragon' ? 2 : 1);
                return true;
            }

            if (cat.effect === 'n_mask') {
                if (!isOthers || targetUser.code === currentUser.code) {
                    showCustomAlert('타인에게만 채울 수 있습니다.'); return false;
                }
                if (!targetUser.equippedWeapons) targetUser.equippedWeapons = [];
                if (targetUser.equippedWeapons.length >= 8) {
                    showCustomAlert('대상의 장착 슬롯이 가득 찼습니다.'); return false;
                }
                const label = itemName + ' (장착자: ' + currentUser.name + ')';
                targetUser.equippedWeapons.push(label);
                setEquipOwner(targetUser, label, currentUser.code);
                appendBadgeNoteToUser(targetUser, '[장착됨] ' + label);
                addHistoryLog(targetUser, '[진실 마스크] ' + currentUser.name + ' 사원이 채웠습니다.');
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
// 14. 확인
// ==========================================
window.newItemState = function () {
    const u = currentUser;
    console.log('%c===== 신규 아이템 =====', 'color:#d4af37; font-size:13px');
    console.log('  소속:', affilText(u).trim(), isCounsel(u) ? '(상담사 — 전부 보임)' : '');
    console.log('  등록:', NEW.length + 1 + '종 (뱃지 포함)');

    console.log('%c--- 지금 쇼핑몰에 보이는 신규분 ---', 'color:#4fc3f7');
    const show = Object.keys(SHOP_AFFIL).filter(shopAllowed);
    console.log('  ' + (show.join(' · ') || '(없음)'));
    console.log('  3% 고정분:', RARE3.map(function (n) {
        return n + (dayRoll(n, 3) ? ' ✓오늘' : ' ✗');
    }).join(' · '));

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
    console.log('  은심장:', hasSilverHeart(u) ? (u.heartSaves || 0) + '회' : '없음');
};

console.log('[신규] 26종 등록 — newItemState() · heartState() · giveSilverHeart(사번)');

})();