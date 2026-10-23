// ==========================================
// ★ 백일몽 주식회사 전용 — 노스텔지어 끈 개편 · 늑대 가면 · 유치원 지침서 (2026-10-23)
// bundles.json 마지막 그룹 맨 끝 (newitems2.js · chilseong.js · slot-curve.js 보다 뒤)
// ==========================================
//
//   재난관리국 전용 물품과 차이가 많이 나서 백일몽 쪽을 올린다. 셋 다 백일몽만 쓴다
//   (EQUIP_AFFIL '백일몽' — 어둠 소속 · 상담사는 전처럼 예외).
//
// ■ 노스텔지어 끈 (장착 · 소모형)
//     판정 +10 · 남을 구할 때 구출 확정 — 다섯 번 구출하거나, 찬 채로 어둠에 다섯 번 들어가면 닳아 사라진다.
//     · 판정 +10      newitems2.js PASSIVE
//     · 구출 확정      newitems2.js rescueGuarantee / spendGuarantee → ndSpendSave()
//     · 어둠 다섯 번   여기서 탐사가 새로 서는 것을 보고 센다. 다섯 번째 탐사는 끝까지 쓰고 끝나면 사라진다.
//     세는 칸 u.ndCnt = { s: 구출, d: 어둠 } — 찬 끈 하나 몫이다 (사라지면 0 으로).
//     예전 끈(5시간 · 오염도 감소 · 남에게 채움)은 쓰지 않는다. 그때 걸어 둔 것은 index.html 이 전처럼 거둔다.
//
// ■ 늑대 가면 (장착 · 10,000P · 우주 쇼핑몰 — 경비팀 · 보안팀에게만 진열)
//     즉사를 하루 두 번 속여 살아남는다. 어둠(darkDeath) · EPIC(epicDeath) · K의 방(kroomDie) 모두.
//     칠성(거문성군)과 같은 자리에서 막는다. 세는 칸 u.wolfDay = { d: 날짜, n: 쓴 수 }.
//
// ■ 유치원 지침서 (소모품 · 8,000P · 우주 쇼핑몰 — 경비팀 · 보안팀에게만 진열)
//     하루 다섯 번까지 읽는다. 읽을 때마다 오염도 +10%.
//       두 번째   행운 +100% (24시간)                       itemBuffs pct
//       네 번째   판정 +5 — 다음 탐사 두 번                  u.kgBon (탐사가 서면 그 탐사 몫 버프로 건다)
//       다섯 번째 오늘 슬롯 한 판이 잭팟 (무늬는 무작위)      u.kgJack = 날짜 → slot-curve.js 가 꺼내 쓴다
//                 그리고 책이 사라진다.
//     몇 번째인지는 책 한 권 몫으로 센다 (u.kgProg) — 날을 넘겨 이어 읽어도 된다. 하루 다섯 번은 u.kgDay.
//
// ■ 콘솔
//   ddState()   세 물건의 지금 상태

(function daydreamItems() {

const ROPE = '노스텔지어 끈';
const WOLF = '늑대 가면';
const BOOK = '유치원 지침서';
const AFFIL = '백일몽';
const HOUR = 3600 * 1000;

const ND = { SAVE: 5, DARK: 5 };
const WOLF_DAY = 2;
const KG = { DAY: 5, POLL: 10, LUCK: 100, BON: 5, BON_RUNS: 2 };

// 경비팀 · 보안팀에게만 우주 쇼핑몰에 진열한다 (index.html playHighLow · newitems2 shopAllowed · rare-odds · secretbox 가 본다)
window.ALIEN_SEC_ONLY = [WOLF, BOOK];

function me() { try { return currentUser || null; } catch (e) { return null; } }
function today() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function baseOf(w) { try { return getEquipBaseName(w); } catch (e) { return String(w || ''); } }
function worn(u, nm) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === nm; })); }
function can(u, nm) { try { return typeof canWearItem !== 'function' || canWearItem(u, nm); } catch (e) { return true; } }
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }
function log(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function say(t) { try { showCustomAlert(t); } catch (e) { } }
function run() { try { return (typeof darkRun !== 'undefined') ? darkRun : null; } catch (e) { return null; } }

// ==========================================
// 물품 등록
// ==========================================
(function register() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined' || typeof EQUIP_AFFIL === 'undefined') return;
        ITEM_CATALOG[ROPE] = Object.assign({}, ITEM_CATALOG[ROPE] || {}, {
            price: (ITEM_CATALOG[ROPE] && ITEM_CATALOG[ROPE].price) || 3319,
            usable: true, targetable: false, effect: 'n_nostal', equipKind: true,
            desc: '백일몽 주식회사 전용. 장착하면 어둠 탐사 판정 +10, 남을 구할 때 구출이 확정된다 (5회). '
                + '다섯 번 구출하거나 장착한 채 어둠에 다섯 번 들어가면 닳아 사라진다. (장착)'
        });
        delete ITEM_CATALOG[ROPE].restrictDept;
        ITEM_CATALOG[WOLF] = {
            price: 10000, usable: true, targetable: false, effect: 'n_wolfmask', equipKind: true,
            desc: '누군가가 썼던 가면이다. 즉사 기믹을 2회 속여 살아남게 해준다. (하루 2회 한정.) 백일몽 주식회사 전용. (장착)'
        };
        ITEM_CATALOG[BOOK] = {
            price: 8000, usable: true, targetable: false, effect: 'kg_book',
            desc: '좋은 선생님이 되기 위한 교본. 하루 다섯 번까지 읽을 수 있으며 읽으면 오염도가 10%씩 늘어난다. '
                + '대신 두 번 읽을 시 행운이 100% 늘어나고 네 번 읽을 시 판정이 +5가 되며 5번 전부 완독 시에 '
                + '하루 슬롯 딱 한 번 랜덤 잭팟이 터진다. (행운은 24시간 유지, 판정은 탐사 2회 한정.) '
                + '다 읽으면 사라진다. 백일몽 주식회사 전용.'
        };
        [ROPE, WOLF, BOOK].forEach(function (nm) { EQUIP_AFFIL[nm] = AFFIL; });
        if (typeof ALIEN_ITEMS_POOL !== 'undefined') {
            [WOLF, BOOK].forEach(function (nm) { if (ALIEN_ITEMS_POOL.indexOf(nm) < 0) ALIEN_ITEMS_POOL.push(nm); });
        }
        clearInterval(iv);
        console.log('[백일몽] 노스텔지어 끈 · 늑대 가면 · 유치원 지침서 등록');
    }, 300);
})();

// ==========================================
// 노스텔지어 끈 — 구출 · 어둠 세기
// ==========================================
function ndCnt(u) {
    const c = (u && u.ndCnt && typeof u.ndCnt === 'object') ? u.ndCnt : {};
    return { s: Number(c.s) || 0, d: Number(c.d) || 0, v: c.v ? 1 : 0 };
}
function ndLeft(u) {
    const c = ndCnt(u);
    return { save: Math.max(0, ND.SAVE - c.s), dark: Math.max(0, ND.DARK - c.d) };
}
window.ndLeftText = function (u) {
    const l = ndLeft(u || me());
    return '구출 ' + l.save + ' · 어둠 ' + l.dark + '회 남음';
};
// 찬 끈 하나를 거둔다 — 장착칸에서만 (소지품의 다른 끈은 그대로)
function ndBreak(u, why) {
    const eq = u.equippedWeapons || [];
    const i = eq.findIndex(function (w) { return baseOf(w) === ROPE; });
    if (i >= 0) {
        const full = eq[i];
        eq.splice(i, 1);
        try { if (typeof clearEquipOwner === 'function') clearEquipOwner(u, full); else if (u.equipOwner) delete u.equipOwner[full]; } catch (e) { }
    }
    try { if (typeof stripNoteByItem === 'function') stripNoteByItem(u, ROPE); } catch (e) { }
    u.ndCnt = { s: 0, d: 0, v: 0 };
    log(u, '[' + ROPE + '] ' + why + ' 닳아 사라졌습니다.');
    save({ ndCnt: 1, equippedWeapons: 1, equipOwner: 1, badge: 1 });
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    setTimeout(function () { say(ROPE + '이(가) 닳아 사라졌습니다.\n\n(' + why + ')'); }, 900);
}
// newitems2.js spendGuarantee 가 부른다 — 확정 구출 한 번
window.ndSpendSave = function () {
    const u = me();
    if (!u) return;
    const c = ndCnt(u);
    c.s++;
    u.ndCnt = c;
    save({ ndCnt: 1 });
    if (c.s >= ND.SAVE) { ndBreak(u, '다섯 번 구출해'); return; }
    setTimeout(function () { say(ROPE + ' — 남은 확정 구출 ' + (ND.SAVE - c.s) + '회'); }, 900);
};

// ==========================================
// 탐사가 새로 서는 것을 본다 — 끈 · 지침서 판정
// ==========================================
let lastRun = null, lastPid = null;
function onRunStart(r) {
    const u = me();
    if (!u) return;
    // 노스텔지어 끈 — 찬 채로 들어간 번 수
    if (worn(u, ROPE) && can(u, ROPE)) {
        const c = ndCnt(u);
        c.d++;
        if (c.d >= ND.DARK) c.v = 1;                  // 이번 탐사는 끝까지 쓰고, 끝나면 사라진다
        u.ndCnt = c;
        save({ ndCnt: 1 });
        log(u, '[' + ROPE + '] 어둠 ' + c.d + '번째 (남은 ' + Math.max(0, ND.DARK - c.d) + '번)');
    }
    // 유치원 지침서 — 판정 +5 (이번 탐사 몫)
    if ((Number(u.kgBon) || 0) > 0 && typeof window.ibAdd === 'function') {
        try { window.ibAdd(u, 'bon', KG.BON, 6 * HOUR, BOOK, { run: true }); } catch (e) { }
        u.kgBon = Math.max(0, (Number(u.kgBon) || 0) - 1);
        save({ kgBon: 1, itemBuffs: 1 });
        log(u, '[' + BOOK + '] 이번 탐사 판정 +' + KG.BON + ' (남은 ' + u.kgBon + '번)');
        kgNotes(u);
    }
}
function onRunEnd() {
    const u = me();
    if (!u) return;
    if (ndCnt(u).v && worn(u, ROPE)) ndBreak(u, '어둠에 다섯 번 들어가');
    else if (ndCnt(u).v) { u.ndCnt = { s: 0, d: 0, v: 0 }; save({ ndCnt: 1 }); }
}
setInterval(function () {
    const r = run();
    if (r) {
        const pid = r.partyId || null;
        const same = (r === lastRun) || (pid && pid === lastPid);
        lastRun = r;
        if (!same) { lastPid = pid; try { onRunStart(r); } catch (e) { console.warn('[백일몽] 탐사 시작', e); } }
    } else if (lastRun) {
        lastRun = null; lastPid = null;
        try { onRunEnd(); } catch (e) { console.warn('[백일몽] 탐사 끝', e); }
    }
}, 500);

// ==========================================
// 늑대 가면 — 즉사를 하루 두 번 속인다
// ==========================================
function wolfUsed(u) {
    const w = (u && u.wolfDay) || {};
    return (w.d === today()) ? (Number(w.n) || 0) : 0;
}
window.wolfLeftText = function (u) {
    return '오늘 ' + Math.max(0, WOLF_DAY - wolfUsed(u || me())) + '회 남음';
};
function wolfGuard(reasonText, nextFn, r) {
    const u = me();
    if (!u || !worn(u, WOLF) || !can(u, WOLF)) return false;
    const n = wolfUsed(u);
    if (n >= WOLF_DAY) return false;
    u.wolfDay = { d: today(), n: n + 1 };
    if (r) { r.fail = Math.max(0, (r.fail || 0) - 1); try { r.log.push('[🐺 ' + WOLF + '] 즉사를 속임'); } catch (e) { } }
    try { if (typeof applyPollutionToUser === 'function') applyPollutionToUser(u, 5); } catch (e) { }
    log(u, '[' + WOLF + '] 즉사를 속여 살아남았습니다. (오늘 ' + (n + 1) + ' / ' + WOLF_DAY + ')');
    save({ wolfDay: 1, history: 1, pollution: 1 });
    try {
        darkBodyEl().innerHTML = darkBox('—', String(reasonText || '') + '<br><br><span style="color:#c9b8a0;">— 가면 아래의 얼굴을, 그것은 알아보지 못했다.<br>'
            + '냄새를 맡고, 고개를 갸웃하고, 지나쳐 간다. 한 번 속였다.'
            + '<br><span style="font-size:11px; color:#8d8578;">🐺 ' + WOLF + ' — 오늘 남은 ' + (WOLF_DAY - n - 1) + '회</span></span>',
            darkChoiceBtn('숨을 죽인다.', nextFn));
        if (r && r.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { }
    try { if (typeof saveDB === 'function') saveDB(); } catch (e) { }
    return true;
}
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._wolf) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            const r = run();
            if (r && !r._dead && !r.epic && !r.kroom && wolfGuard(reasonText, 'renderDarkStep();', r)) return;
            return _d.apply(this, arguments);
        };
        Object.keys(_d).forEach(function (k) { if (!(k in w)) w[k] = _d[k]; });
        w._wolf = true;
        darkDeath = w; window.darkDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookEpicDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._wolf) { clearInterval(iv); return; }
        const _d = epicDeath;
        const w = function (txt) {
            let E = null; try { E = er; } catch (e) { }
            if (E && !E.dead && wolfGuard(txt, 'epicMap()', run())) return;
            return _d.apply(this, arguments);
        };
        Object.keys(_d).forEach(function (k) { if (!(k in w)) w[k] = _d[k]; });
        w._wolf = true;
        epicDeath = w; window.epicDeath = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
(function hookKDie() {
    const iv = setInterval(function () {
        if (typeof window.kroomDie !== 'function' || !window.KROOM) return;
        if (window.kroomDie._wolf) { clearInterval(iv); return; }
        const _d = window.kroomDie;
        const w = function (text) {
            const kr = window.KROOM.state();
            if (kr && !kr.dead && !kr._settled) {
                const why = (typeof text === 'string' && text) || (kr._doomCfg && kr._doomCfg.dieText) || '거기서 끝났다.';
                if (wolfGuard(why, 'kroomNext()', run())) {
                    try { if (kr._doomT) { clearInterval(kr._doomT); kr._doomT = 0; } } catch (e) { }
                    if (kr.down) { kr.down = false; if (kr.stats && kr.stats.hp <= 0) kr.stats.hp = 20; }
                    return;
                }
            }
            return _d.apply(this, arguments);
        };
        Object.keys(_d).forEach(function (k) { if (!(k in w)) w[k] = _d[k]; });
        w._wolf = true;
        window.kroomDie = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 유치원 지침서 — 읽기
// ==========================================
const KG_BON_LINE = '📒 ' + BOOK + ' — 다음 탐사 판정 +' + KG.BON;
const KG_JACK_LINE = '📒 ' + BOOK + ' — 오늘 슬롯 잭팟 한 번';
function kgDayUsed(u) {
    const d = (u && u.kgDay) || {};
    return (d.d === today()) ? (Number(d.n) || 0) : 0;
}
function jackLive(u) { return !!(u && u.kgJack && u.kgJack === today()); }
// 특이사항 줄 — 판정 남은 탐사 · 오늘 잭팟
function kgNotes(u) {
    if (!u || !u.badge) return;
    const raw = String(u.badge.notes || '');
    const arr = (raw && raw !== '특이사항 없음') ? raw.split('|').map(function (x) { return x.trim(); }).filter(Boolean) : [];
    const keep = arr.filter(function (x) { return x.indexOf('📒 ' + BOOK) !== 0; });
    if ((Number(u.kgBon) || 0) > 0) keep.push(KG_BON_LINE + ' (' + u.kgBon + '회 남음)');
    if (jackLive(u)) keep.push(KG_JACK_LINE);
    const next = keep.length ? keep.join(' | ') : '특이사항 없음';
    if (next === (raw || '특이사항 없음')) return;
    u.badge.notes = next;
    save({ badge: 1 });
    try { if (typeof window.noteLivePaint === 'function') window.noteLivePaint(); } catch (e) { }
}
function readBook(itemName) {
    const u = me();
    if (!u) return;
    if ((u.inventory || []).indexOf(itemName) < 0) return;
    if (!can(u, BOOK)) { say('소속이 맞지 않습니다.'); return; }
    try { if (typeof isQuarantined === 'function' && isQuarantined(u)) { say('격리 중에는 쓸 수 없습니다.'); return; } } catch (e) { }
    const used = kgDayUsed(u);
    if (used >= KG.DAY) { say('오늘은 더 읽을 수 없습니다.\n\n(하루 ' + KG.DAY + '번까지)'); return; }

    u.kgDay = { d: today(), n: used + 1 };
    const prog = (Number(u.kgProg) || 0) + 1;
    const pollWas = Number(u.pollution) || 0;
    try { if (typeof applyPollutionToUser === 'function') applyPollutionToUser(u, KG.POLL); } catch (e) { }
    const pollUp = (Number(u.pollution) || 0) - pollWas;

    const lines = [];
    if (prog === 2) {
        try { if (typeof window.ibAdd === 'function') window.ibAdd(u, 'pct', KG.LUCK, 24 * HOUR, BOOK); } catch (e) { }
        lines.push('행운 +' + KG.LUCK + '% (24시간)');
    }
    if (prog === 4) {
        u.kgBon = KG.BON_RUNS;
        lines.push('판정 +' + KG.BON + ' — 다음 탐사 ' + KG.BON_RUNS + '번');
    }
    let done = false;
    if (prog >= 5) {
        done = true;
        u.kgJack = today();
        u.kgProg = 0;
        try { removeItemFromInventory(u, itemName, 1); } catch (e) { }
        lines.push('오늘 슬롯 한 판이 잭팟으로 터진다');
    } else {
        u.kgProg = prog;
    }
    log(u, '[' + BOOK + '] ' + prog + '번째 읽음 (오염도 +' + pollUp + '%)' + (lines.length ? ' · ' + lines.join(' · ') : '') + (done ? ' · 다 읽어 사라짐' : ''));
    kgNotes(u);
    save({ kgDay: 1, kgProg: 1, kgBon: 1, kgJack: 1, pollution: 1, itemBuffs: 1, inventory: 1, history: 1 });
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    say('📒 ' + BOOK + ' — ' + prog + '번째로 읽었습니다.\n\n오염도 +' + pollUp + '%'
        + (lines.length ? '\n\n' + lines.join('\n') : '')
        + (done ? '\n\n책을 다 읽었습니다. 책은 사라졌습니다.'
                : '\n\n이 책 남은 읽기 ' + (5 - prog) + '번 · 오늘 남은 읽기 ' + (KG.DAY - used - 1) + '번'));
}
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._kgBook) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (String(itemName || '').replace(/^\[복제품\] /, '') === BOOK) { readBook(itemName); return; }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { if (!(k in w)) w[k] = _u[k]; });
        w._kgBook = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();
// slot-curve.js 가 한 판 돌리기 전에 묻는다 — 참이면 그 판은 잭팟
window.kgJackTake = function () {
    const u = me();
    if (!jackLive(u)) return false;
    u.kgJack = '';
    save({ kgJack: 1 });
    log(u, '[' + BOOK + '] 오늘의 잭팟');
    kgNotes(u);
    return true;
};
// 날이 바뀌면 잭팟 줄을 걷는다
setInterval(function () {
    const u = me();
    if (!u) return;
    if (u.kgJack && u.kgJack !== today()) { u.kgJack = ''; save({ kgJack: 1 }); }
    try { kgNotes(u); } catch (e) { }
}, 30000);

// ==========================================
// 확인
// ==========================================
window.ddState = function () {
    const u = me();
    if (!u) { console.log('로그인 후에 쓰세요.'); return; }
    const c = ndCnt(u);
    console.log('%c===== 백일몽 전용 =====', 'color:#d4af37; font-size:13px');
    console.log('  ' + ROPE + ':', worn(u, ROPE) ? '장착' : '안 참', '· 구출 ' + c.s + '/' + ND.SAVE + ' · 어둠 ' + c.d + '/' + ND.DARK + (c.v ? ' · 이번 탐사 끝나면 사라짐' : ''));
    console.log('  ' + WOLF + ':', worn(u, WOLF) ? '장착' : '안 참', '· 오늘 ' + wolfUsed(u) + '/' + WOLF_DAY);
    console.log('  ' + BOOK + ': 이 책 ' + (Number(u.kgProg) || 0) + '/5 · 오늘 ' + kgDayUsed(u) + '/' + KG.DAY
        + ' · 판정 남은 탐사 ' + (Number(u.kgBon) || 0) + ' · 오늘 잭팟 ' + (jackLive(u) ? '있음' : '없음'));
    console.log('  쓸 수 있나 (소속):', can(u, ROPE) ? 'O' : '✗');
};

console.log('[백일몽] 노스텔지어 끈 · 늑대 가면 · 유치원 지침서 — ddState()');

})();
