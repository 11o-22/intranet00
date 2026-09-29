// ==========================================
// ★ 아이템 손보기 — 저울 · 연마 · S-003 전용품
// index.html 에서 s003.js · awaken.js · epic-fill.js 보다 뒤에 불러온다
// (맨 뒤, save-merge.js 앞이면 된다)
// ==========================================
//
// 1. 은색 저울을 찬 사람에게만, 위험에 빠진 동료 칸에
//    「달려간다 / 끌어낸다」가 성공할 확률을 적어 준다.
//
// 2. ■■ 씨앗과 각인 연마제의 강화 확률 보정을
//    S → L 승급에는 넣지 않는다. 보정은 쓰이지 않고 그대로 남는다.
//
// 3. S-003 전용품 여섯 가지를 실제 판정 자리에 연결한다.
//    뜯어낸 목차 · 남의 배역표 · 물린 손수건 · 빈 삽화 · 연필 끝 · 마지막 줄의 여백

(function itemFix() {

// ==========================================
// 공통 — 은색 저울을 차고 있는가
// ==========================================
function wearsScale() {
    if (typeof currentUser === 'undefined' || !currentUser) return false;
    const base = function (w) {
        return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : w;
    };
    if ((currentUser.equippedWeapons || []).some(function (w) { return base(w) === '은색 저울'; })) return true;
    return (currentUser.borrowedGear || []).some(function (w) {
        return String(w).indexOf('은색 저울') === 0;
    });
}

// ==========================================
// 보정값 미리보기 — 소모품을 태우지 않는다
// ==========================================
//
// rollDarkBonus 는 안에서 consumeQFlag('next_plus') 와
// consumeQFlag('rejoin_boost') 를 부른다. 그대로 부르면
// 화면을 그릴 때마다 사원이 산 소모품이 사라진다.
// 그래서 부르는 동안만 consumeQFlag 를 「보기만 하는 것」으로 바꿔 둔다.
// 바꿔치기가 안 되는 환경이면 확률을 적지 않는다 (태우느니 안 적는다).
function peekBonus(kind) {
    if (typeof rollDarkBonus !== 'function') return null;

    const orig = window.consumeQFlag;
    if (typeof orig !== 'function') return null;

    window.consumeQFlag = function (f) {
        return (typeof qFlag === 'function') ? !!qFlag(f) : false;
    };
    if (window.consumeQFlag === orig) return null;      // 못 바꿨다 — 포기

    try { return rollDarkBonus(kind); }
    catch (e) { return null; }
    finally { window.consumeQFlag = orig; }
}

// d20 · 1 은 무조건 실패 · (굴림 + 보정) >= DC 이면 성공
function odds(bonus, dc) {
    const need = dc - bonus;
    const lo = Math.max(2, need);
    let n = 21 - lo;
    if (n > 19) n = 19;
    if (n < 0) n = 0;
    return Math.round(n / 20 * 100);
}

function gv(kind) {
    return (typeof gearValue === 'function') ? (gearValue(currentUser, kind) || 0) : 0;
}

// ==========================================
// 1-가. 달려간다 (epicRescue) 확률
// ==========================================
function chanceHelp(code) {
    if (typeof er === 'undefined' || !er) return null;
    const h = (er.help || {})[code];
    if (!h) return null;

    const b = peekBonus('rejoin');
    if (b === null) return null;

    const j = (typeof EPIC_JOBS !== 'undefined') ? EPIC_JOBS[er.job] : null;
    const far = h.place !== er.place;
    const bonus = b + ((j && j.attr === 'bond') ? 3 : 0) + Math.round(gv('heal') * 8);
    const dc = (far ? 14 : 10)
             + ((typeof EPIC_PLACES !== 'undefined' && EPIC_PLACES[h.place]) ? EPIC_PLACES[h.place].risk : 0);

    return { p: odds(bonus, dc), bonus: bonus, dc: dc, far: far };
}

// ==========================================
// 1-나. 끌어낸다 (epicDoomRescue) 확률
// ==========================================
function chanceDoom(code) {
    if (typeof er === 'undefined' || !er) return null;
    const d = (er.doom || {})[code];
    if (!d) return null;

    const b = peekBonus(d.need || 'bond');
    if (b === null) return null;

    const far = d.place !== er.place;
    const bonus = b
                + ((typeof epicAttr === 'function' && epicAttr() === 'bond') ? 3 : 0)
                + Math.round(gv('heal') * 10);
    const dc = (d.dc || 13) + (far ? 2 : 0);

    return { p: odds(bonus, dc), bonus: bonus, dc: dc, far: far };
}

// ==========================================
// 확률 줄
// ==========================================
function line(c, warn) {
    if (!c) return '';
    const col = c.p >= 65 ? '#9fe0a6' : (c.p >= 35 ? '#e0d29f' : '#ff8f8f');
    return '<div style="border:1px solid #6b7a8f; border-radius:4px; padding:6px 9px;'
        + ' margin-bottom:7px; background:rgba(12,16,22,0.55); font-size:10px; color:#aab4c0;">'
        + '⚖ 은색 저울 — 성공 확률 '
        + '<b style="color:' + col + '; font-size:14px;">' + c.p + '%</b>'
        + ' <span style="color:#7d848d;">(보정 ' + (c.bonus >= 0 ? '+' : '') + c.bonus
        + ' / DC ' + c.dc + (c.far ? ' · 멀다' : '') + ')</span>'
        + (warn && c.p < 35
            ? '<br><span style="color:#ff8f8f;">손을 놓지 못하면 같이 끌려갑니다.</span>'
            : '')
        + '</div>';
}

// ==========================================
// 위험 칸에 확률을 끼워 넣는다
// ==========================================
(function hookBanner() {
    const iv = setInterval(function () {
        if (typeof epicHelpBanner !== 'function') return;
        if (epicHelpBanner._scaleOdds) { clearInterval(iv); return; }

        const _b = epicHelpBanner;
        epicHelpBanner = function () {
            let html = _b.apply(this, arguments);
            if (!wearsScale()) return html;

            try {
                html = html.replace(
                    /<button([^>]*?)onclick="epicRescue\('([^']+)'\)"([^>]*?)>/g,
                    function (m, a, code, b2) {
                        return line(chanceHelp(code), false)
                            + '<button' + a + 'onclick="epicRescue(\'' + code + '\')"' + b2 + '>';
                    });
                html = html.replace(
                    /<button([^>]*?)onclick="epicDoomRescue\('([^']+)'\)"([^>]*?)>/g,
                    function (m, a, code, b2) {
                        return line(chanceDoom(code), true)
                            + '<button' + a + 'onclick="epicDoomRescue(\'' + code + '\')"' + b2 + '>';
                    });
            } catch (e) {
                console.warn('[저울] 확률 표시 건너뜀:', e && e.message);
            }
            return html;
        };
        epicHelpBanner._scaleOdds = true;
        clearInterval(iv);
        console.log('[저울] 구출 확률 표시 연결');
    }, 500);
})();

// 위험 칸은 남은 시간이 흐르므로 주기적으로 다시 그린다
setInterval(function () {
    if (!wearsScale()) return;
    if (typeof er === 'undefined' || !er) return;
    const box = document.getElementById('epic-help-box');
    if (!box) return;
    if (typeof epicHelpBanner !== 'function') return;
    try { box.outerHTML = epicHelpBanner(); } catch (e) { }
}, 2000);

// ==========================================
// 2. 씨앗 · 연마제는 L 승급에 안 먹힌다
// ==========================================
//
// 보정을 0 으로 만들어 두고 승급을 부른다.
// 끝나면 되돌리므로, L 에 도전해도 보정은 사라지지 않고 남는다.
(function hookUpgrade() {
    const iv = setInterval(function () {
        if (typeof tryGearUpgrade !== 'function') return;
        if (typeof slotGrade !== 'function') return;
        if (tryGearUpgrade._noPolishL) { clearInterval(iv); return; }

        const _try = tryGearUpgrade;
        tryGearUpgrade = function (idx) {
            let toL = false;
            try { toL = (slotGrade(idx) === 'S'); } catch (e) { toL = false; }

            if (!toL) return _try.apply(this, arguments);

            const keep = currentUser.gearPolish || 0;
            if (keep > 0) {
                showCustomAlert('L등급 앞에서는 갈아 둔 날이 듣지 않습니다.\n\n'
                    + '연마 보정 ' + Math.round(keep * 100) + '%는 쓰이지 않고 그대로 남습니다.');
            }
            currentUser.gearPolish = 0;
            try { return _try.apply(this, arguments); }
            finally { currentUser.gearPolish = keep; }
        };
        tryGearUpgrade._noPolishL = true;
        clearInterval(iv);
        console.log('[강화] L등급 승급에 연마 보정 차단');
    }, 500);
})();

// ==========================================
// 3. S-003 전용품
// ==========================================
//
// 여섯 가지가 깃발만 세우고 아무도 읽지 않던 상태였다.
// 각각 실제 판정이 일어나는 자리에 붙인다.

function inTale() {
    return (typeof darkRun !== 'undefined') && darkRun && darkRun.zone === 'Qtrew-S-003';
}
function toast(msg) {
    if (typeof showDarkToast === 'function') showDarkToast(msg);
    else console.log('[S-003] ' + msg);
}
// nFlags 쪽 (뜯어낸 목차 · 남의 배역표 · 물린 손수건 · 마지막 줄의 여백)
function nOn(k) { return (typeof nHas === 'function') && nHas(k); }
function nTake(k) { return (typeof nUse === 'function') && nUse(k); }
// ??? 깃발 쪽 (빈 삽화 · 연필 끝)
function qOn(k) { return (typeof qFlag === 'function') && !!qFlag(k); }
function qTake(k) { return (typeof consumeQFlag === 'function') && !!consumeQFlag(k); }

// ------------------------------------------
// 3-가. 뜯어낸 목차 — 찢어진 장 탐색 1회를 확정시킨다
// ------------------------------------------
(function hookPage() {
    const iv = setInterval(function () {
        if (typeof pickPageSpot !== 'function') return;
        if (pickPageSpot._s3find) { clearInterval(iv); return; }

        const _p = pickPageSpot;
        pickPageSpot = function (n, idx) {
            const already = ((darkRun && darkRun.talePages) || []).indexOf(n) >= 0;
            if (!inTale() || already || !nOn('s3_find')) return _p.apply(this, arguments);

            nTake('s3_find');
            const _rand = Math.random;
            Math.random = function () { return 0.9999; };      // d20 → 20
            try { return _p.apply(this, arguments); }
            finally {
                Math.random = _rand;
                setTimeout(function () { toast('목차가 자리를 짚어 주었다.'); }, 200);
            }
        };
        pickPageSpot._s3find = true;
        clearInterval(iv);
        console.log('[S-003] 뜯어낸 목차 연결');
    }, 500);
})();

// ------------------------------------------
// 3-나. 남의 배역표 — 맡을 자리를 고른다
// ------------------------------------------
//
// 배역은 굴림이 아니라 무작위 배정이라 「+6」을 얹을 자리가 없다.
// 설명의 「맡고 싶은 자리가 있다면」에 맞춰, 남은 배역 중에서 고르게 한다.
function s003FreeRoles() {
    if (typeof TALE_KEYS === 'undefined') return [];
    let cast = (darkRun && darkRun.taleCast) || {};
    if (darkRun && darkRun.isParty && typeof darkParties !== 'undefined') {
        const p = darkParties[darkRun.partyId] || {};
        if (p.taleCast) cast = p.taleCast;
    }
    const used = {};
    Object.keys(cast).forEach(function (c) { used[cast[c]] = true; });
    return TALE_KEYS.filter(function (k) { return !used[k]; });
}

window.s003CastPick = function (key) {
    if (!darkRun || darkRun.taleRole) return;
    if (typeof TALE_ROLES === 'undefined' || !TALE_ROLES[key]) return;

    const done = function () {
        darkRun.taleRole = key;
        darkRun.taleCast = Object.assign({}, darkRun.taleCast || {});
        darkRun.taleCast[currentUser.code] = key;
        if (typeof saveDarkRunState === 'function') { try { saveDarkRunState(); } catch (e) { } }
        toast('배역표대로 불렸다.');
        if (typeof renderTaleCast === 'function') renderTaleCast();
    };

    if (darkRun.isParty && typeof database !== 'undefined' && database) {
        database.ref('darkParties/' + darkRun.partyId + '/taleCast').transaction(function (cur) {
            const cast = cur || {};
            if (cast[currentUser.code]) return;                       // 이미 받았다
            const taken = Object.keys(cast).some(function (c) { return cast[c] === key; });
            if (taken) return;                                        // 남이 먼저 가져갔다
            cast[currentUser.code] = key;
            return cast;
        }).then(function (res) {
            const cast = (res && res.snapshot) ? (res.snapshot.val() || {}) : {};
            if (cast[currentUser.code] !== key) {
                showCustomAlert('그 자리는 이미 불렸습니다.\n다른 자리를 고르세요.');
                darkRun._castPick = false;
                if (typeof renderTaleCast === 'function') renderTaleCast();
                return;
            }
            nTake('s3_cast');
            done();
        }).catch(function () {
            nTake('s3_cast');
            done();
        });
        return;
    }

    nTake('s3_cast');
    done();
};

window.s003CastSkip = function () {
    if (!darkRun) return;
    darkRun._castPick = 'done';
    if (typeof renderTaleCast === 'function') renderTaleCast();
};

(function hookCast() {
    const iv = setInterval(function () {
        if (typeof renderTaleCast !== 'function') return;
        if (renderTaleCast._s3cast) { clearInterval(iv); return; }

        const _r = renderTaleCast;
        renderTaleCast = function () {
            if (!darkRun || darkRun.taleRole || darkRun._castPick === 'done' || !nOn('s3_cast')) {
                return _r.apply(this, arguments);
            }
            const free = s003FreeRoles();
            if (!free.length) return _r.apply(this, arguments);
            darkRun._castPick = true;

            const rows = free.map(function (k) {
                const r = TALE_ROLES[k];
                return '<div style="border:1px solid #5a4a2a; border-radius:6px; padding:10px 12px; margin-bottom:7px;">'
                    + '<div style="display:flex; align-items:center; gap:10px;">'
                    + '<div style="font-size:24px;">' + r.icon + '</div>'
                    + '<div style="flex:1; min-width:0;">'
                    + '<div style="font-size:13px; color:#d4af37; font-weight:bold;">' + r.name + '</div>'
                    + '<div style="font-size:10px; color:#888;">' + r.tale + '</div>'
                    + '<div style="font-size:10px; color:#ff6b6b; margin-top:3px;">금기 — ' + r.taboo + '</div>'
                    + '</div>'
                    + '<button class="game-btn" style="margin:0; padding:8px 14px; font-size:11px;"'
                    + ' onclick="s003CastPick(\'' + k + '\')">맡는다</button>'
                    + '</div></div>';
            }).join('');

            darkBodyEl().innerHTML = darkBox('배역',
                '이름이 불리기 전이다.<br><br>'
                + '주머니에 남의 배역표가 있다. 아직 아무도 읽지 않은 장이다.<br>'
                + '먼저 적어 넣으면, 책은 그렇게 부른다.<br><br>'
                + '<span style="font-size:11px; color:#888;">남은 자리 ' + free.length + '개. 하나만 고를 수 있습니다.</span>',
                (typeof loreBarHtml === 'function' ? loreBarHtml() : '')
                + '<div style="max-height:46vh; overflow-y:auto; padding-right:3px;">' + rows + '</div>'
                + '<button class="game-btn" style="width:100%; margin:9px 0 0 0; padding:11px; font-size:11px;'
                + ' background:linear-gradient(145deg,#333,#1a1a1a) !important;"'
                + ' onclick="s003CastSkip()">배역표를 덮는다 (그냥 불린다)</button>');
            if (typeof renderLoreBar === 'function') renderLoreBar();
            if (typeof mountDarkChat === 'function') mountDarkChat('normal');
        };
        renderTaleCast._s3cast = true;
        clearInterval(iv);
        console.log('[S-003] 남의 배역표 연결');
    }, 500);
})();

// ------------------------------------------
// 3-다. 물린 손수건 — 금기 1회를 없던 일로
// ------------------------------------------
(function hookTaboo() {
    const iv = setInterval(function () {
        if (typeof breakTaboo !== 'function') return;
        if (breakTaboo._s3taboo) { clearInterval(iv); return; }

        const _b = breakTaboo;
        breakTaboo = function (reason) {
            if (darkRun && darkRun.taleRole && nOn('s3_taboo')) {
                nTake('s3_taboo');
                if (darkRun.log) darkRun.log.push('[금기] 손수건으로 무효 — ' + reason);
                toast('손수건이 소리를 먹었다.');
                return;
            }
            return _b.apply(this, arguments);
        };
        breakTaboo._s3taboo = true;
        clearInterval(iv);
        console.log('[S-003] 물린 손수건 연결');
    }, 500);
})();

// ------------------------------------------
// 3-라. 빈 삽화 — 정말로 안전한 쪽을 표시한다
// ------------------------------------------
//
// 원래는 무조건 ①번에 표시를 붙이고 있었다 (index.html renderChoiceStep).
// 실제 판정표를 읽어 가장 안전한 쪽을 찾아 그쪽에 붙인다.
function tableByName(name) {
    if (!/^S003_G\d+$/.test(name)) return null;
    try {
        return new Function('return typeof ' + name + ' !== "undefined" ? ' + name + ' : null')();
    } catch (e) { return null; }
}

function safestIndex(options) {
    if (!options || !options.length) return -1;
    let tbl = null;
    for (let i = 0; i < options.length; i++) {
        const fn = options[i] && options[i].fn;
        const m = /^s003G(\d+)R$/.exec(String(fn || ''));
        if (m) { tbl = tableByName('S003_G' + m[1]); break; }
    }
    if (!tbl) return -1;

    const role = darkRun && darkRun.taleRole;
    let best = -1, bestRisk = Infinity;

    options.forEach(function (o, i) {
        const def = tbl[o.arg];
        if (!def) return;
        let risk = (def.dc || 10);
        try { if (typeof def.extra === 'function') risk -= (def.extra() || 0); } catch (e) { }
        if (def.taboo && role && def.taboo.indexOf(role) >= 0) risk += 100;
        risk += (def.failLore || 6) * 0.1;
        risk += (def.failPoll || 6) * 0.05;
        if (risk < bestRisk) { bestRisk = risk; best = i; }
    });
    return best;
}

(function hookHint() {
    const iv = setInterval(function () {
        if (typeof renderChoiceStep !== 'function') return;
        if (renderChoiceStep._s3hint) { clearInterval(iv); return; }

        const _c = renderChoiceStep;
        renderChoiceStep = function (title, text, options, imgKey) {
            try {
                if (inTale() && qOn('safe_hint') && options && options.length) {
                    const i = safestIndex(options);
                    if (i >= 0 && qTake('safe_hint')) {          // 먼저 써 버려 ①번 표시를 막는다
                        options[i].label = '◈ ' + options[i].label;
                        toast('삽화가 한쪽만 비워 두었다.');
                    }
                }
            } catch (e) {
                console.warn('[S-003] 빈 삽화 건너뜀:', e && e.message);
            }
            return _c.apply(this, arguments);
        };
        renderChoiceStep._s3hint = true;
        clearInterval(iv);
        console.log('[S-003] 빈 삽화 연결');
    }, 500);
})();

// ------------------------------------------
// 3-마. 연필 끝 — 「질문」 단계의 답을 고쳐 적는다
// ------------------------------------------
//
// S-003 에서 적는 단계는 renderLoreCheck / submitLoreCheck 다.
// 위험한 답을 적었을 때, 안전한 답으로 바꿔 적은 것으로 한다.
(function hookLore() {
    const iv = setInterval(function () {
        if (typeof submitLoreCheck !== 'function') return;
        if (submitLoreCheck._s3pencil) { clearInterval(iv); return; }

        const _s = submitLoreCheck;
        submitLoreCheck = function () {
            const el = document.getElementById('s003-lore-input');
            const c = darkRun && darkRun._loreQ;
            if (!el || !c || !el.value.trim() || !qOn('quiz_undo')) return _s.apply(this, arguments);

            let safe = false;
            try { safe = c.good ? checkQuizAnswer(el.value.trim(), c.good) : false; } catch (e) { safe = false; }
            if (safe) return _s.apply(this, arguments);           // 이미 안전하다 — 아끼자

            // 안전한 답이 있는 질문이면, 그 답으로 고쳐 적는다
            if (c.good && c.good.length) {
                qTake('quiz_undo');
                el.value = c.good[0];
                toast('연필 끝으로 고쳐 적었다.');
                return _s.apply(this, arguments);
            }

            // 안전한 답이 없는 질문 — 알아버린 몫만 덜어 낸다
            qTake('quiz_undo');
            const _add = window.addLore;
            let done = false;
            window.addLore = function (amount, reason) {
                if (!done && amount >= 10) { done = true; return _add.call(this, 3, reason); }
                return _add.apply(this, arguments);
            };
            try { return _s.apply(this, arguments); }
            finally {
                window.addLore = _add;
                setTimeout(function () { toast('연필 끝이 한 줄을 지웠다.'); }, 200);
            }
        };
        submitLoreCheck._s3pencil = true;
        clearInterval(iv);
        console.log('[S-003] 연필 끝 연결');
    }, 500);
})();

// ------------------------------------------
// 3-바. 마지막 줄의 여백 — 마지막 판정에 +5
// ------------------------------------------
(function hookEnd() {
    const iv = setInterval(function () {
        if (typeof s003EndPick !== 'function') return;
        if (s003EndPick._s3margin) { clearInterval(iv); return; }

        const _e = s003EndPick;
        s003EndPick = function (pick) {
            if (!nOn('s3_margin') || typeof rollDarkBonus !== 'function') {
                return _e.apply(this, arguments);
            }
            nTake('s3_margin');

            const _roll = window.rollDarkBonus;
            let used = false;
            window.rollDarkBonus = function () {
                const v = _roll.apply(this, arguments);
                if (used) return v;
                used = true;
                return v + 5;
            };
            try { return _e.apply(this, arguments); }
            finally {
                window.rollDarkBonus = _roll;
                setTimeout(function () { toast('여백에 한 줄이 더 들어갔다.'); }, 200);
            }
        };
        s003EndPick._s3margin = true;
        clearInterval(iv);
        console.log('[S-003] 마지막 줄의 여백 연결');
    }, 500);
})();

// ==========================================
// 4. 「공용시설 +n」 · 「어둠 탐사 +n」 은 상한과 무관하게 붙는다
// ==========================================
//
// 고유 아이템(DNA) · 은화 뱀 · 꿈결 수집기처럼 숫자가 적혀 있는 것들은
// 적힌 만큼 그대로 늘어야 한다. 티켓의 하루 +5 상한과는 별개다.
//
// 고유 아이템은 「차고 있는 동안만」 이므로 myDnaEquip() 으로 가른다.
// 나머지(임시 버프·상시 장비)는 dnaGiftOf 가 합쳐 주므로, 고유 몫을 빼서 얻는다.
window.facDarkBonus = function (u) {
    u = u || (typeof currentUser !== 'undefined' ? currentUser : null);
    if (!u) return { fac: 0, dark: 0 };

    // 찬 고유 아이템의 몫 (안 찼으면 0)
    let worn = {};
    try {
        if (typeof myDnaEquip === 'function' && u === currentUser) worn = myDnaEquip() || {};
    } catch (e) { }

    // 그 사원에게 배정된 고유 아이템이 원래 가진 몫 — 아래에서 빼낸다
    let own = {};
    try {
        if (typeof dnaGiftIndex === 'function' && typeof DNA_GIFTS !== 'undefined') {
            own = (DNA_GIFTS[dnaGiftIndex(u)] || {}).e || {};
        }
    } catch (e) { }

    // 고유 + 임시 버프 + 상시 장비가 다 합쳐진 값
    let all = {};
    try {
        if (typeof dnaGiftOf === 'function') all = (dnaGiftOf(u) || {}).e || {};
    } catch (e) { }

    return {
        fac:  (worn.fac  || 0) + Math.max(0, (all.fac  || 0) - (own.fac  || 0)),
        dark: (worn.dark || 0) + Math.max(0, (all.dark || 0) - (own.dark || 0))
    };
};

// 어둠 탐사 남은 횟수에 얹는다
(function hookDarkTries() {
    const iv = setInterval(function () {
        if (typeof getDarkTriesLeft !== 'function') return;
        if (getDarkTriesLeft._facDark) { clearInterval(iv); return; }

        const _g = getDarkTriesLeft;
        getDarkTriesLeft = function () {
            const base = _g.apply(this, arguments);
            let add = 0;
            try { add = window.facDarkBonus().dark || 0; } catch (e) { }
            return base + add;
        };
        getDarkTriesLeft._facDark = true;
        clearInterval(iv);
        console.log('[보정] 어둠 탐사 +n 연결');
    }, 500);
})();

// ==========================================
// 확인
// ==========================================
window.facDarkState = function () {
    const b = window.facDarkBonus();
    console.log('%c===== 공용시설 · 어둠 탐사 보정 =====', 'color:#d4af37; font-size:13px');
    console.log('  공용시설 +', b.fac, '· 어둠 탐사 +', b.dark);
    console.log('  고유 아이템 착용:', (typeof myDnaEquip === 'function' && myDnaEquip()) ? 'O' : '-');
    console.log('  임시 버프:', ((currentUser && currentUser.itemBuffs) || [])
        .filter(function (x) { return x.k === 'fac' || x.k === 'dark'; })
        .map(function (x) { return x.k + '+' + x.v + '(' + (x.src || '') + ')'; }).join(', ') || '(없음)');
    console.log('  지금 한도:', currentUser && currentUser.facilityMax,
                '· 쓴 횟수:', currentUser && currentUser.facilityCount);
    console.log('  어둠 남은 횟수:', (typeof getDarkTriesLeft === 'function') ? getDarkTriesLeft() : '-');
    console.log('  어둠 연결:', (typeof getDarkTriesLeft === 'function' && getDarkTriesLeft._facDark) ? 'O' : '-');
};

window.scaleOdds = function () {
    console.log('%c===== 은색 저울 =====', 'color:#d4af37; font-size:13px');
    console.log('  착용:', wearsScale() ? 'O' : '-');
    if (typeof er === 'undefined' || !er) { console.log('  (탐사 중이 아닙니다)'); return; }
    const H = Object.keys(er.help || {}).filter(function (c) { return c !== currentUser.code; });
    const D = Object.keys(er.doom || {}).filter(function (c) { return c !== currentUser.code; });
    if (!H.length && !D.length) { console.log('  위험에 빠진 동료가 없습니다.'); return; }
    H.forEach(function (c) {
        const x = chanceHelp(c);
        console.log('  달려간다 ·', (er.help[c] || {}).name || c, '→', x ? (x.p + '% (보정 ' + x.bonus + ' / DC ' + x.dc + ')') : '계산 불가');
    });
    D.forEach(function (c) {
        const x = chanceDoom(c);
        console.log('  끌어낸다 ·', (er.doom[c] || {}).name || c, '→', x ? (x.p + '% (보정 ' + x.bonus + ' / DC ' + x.dc + ')') : '계산 불가');
    });
};

window.polishState = function () {
    console.log('%c===== 연마 보정 =====', 'color:#d4af37; font-size:13px');
    const g = (typeof getGear === 'function') ? getGear(currentUser) : null;
    console.log('  가진 보정:', Math.round((currentUser.gearPolish || 0) * 100) + '%');
    console.log('  본체 등급:', g ? g.grade : '(장비 없음)');
    if (g) console.log('  다음이 L인가:', g.grade === 'S' ? 'O — 보정이 안 들어갑니다' : '-');
    console.log('  승급 차단 연결:', (typeof tryGearUpgrade === 'function' && tryGearUpgrade._noPolishL) ? 'O' : '-');
};

window.s003State = function () {
    console.log('%c===== S-003 전용품 =====', 'color:#d4af37; font-size:13px');
    console.log('  지금 구역:', (typeof darkRun !== 'undefined' && darkRun) ? darkRun.zone : '(탐사 중 아님)');
    console.log('  내 배역:', (typeof darkRun !== 'undefined' && darkRun && darkRun.taleRole) || '-');
    console.table([
        { 아이템: '뜯어낸 목차',      깃발: 's3_find',   가짐: nOn('s3_find') ? 'O' : '-', 연결: (typeof pickPageSpot === 'function' && pickPageSpot._s3find) ? 'O' : '✗' },
        { 아이템: '남의 배역표',      깃발: 's3_cast',   가짐: nOn('s3_cast') ? 'O' : '-', 연결: (typeof renderTaleCast === 'function' && renderTaleCast._s3cast) ? 'O' : '✗' },
        { 아이템: '물린 손수건',      깃발: 's3_taboo',  가짐: nOn('s3_taboo') ? 'O' : '-', 연결: (typeof breakTaboo === 'function' && breakTaboo._s3taboo) ? 'O' : '✗' },
        { 아이템: '빈 삽화',          깃발: 'safe_hint', 가짐: qOn('safe_hint') ? 'O' : '-', 연결: (typeof renderChoiceStep === 'function' && renderChoiceStep._s3hint) ? 'O' : '✗' },
        { 아이템: '연필 끝',          깃발: 'quiz_undo', 가짐: qOn('quiz_undo') ? 'O' : '-', 연결: (typeof submitLoreCheck === 'function' && submitLoreCheck._s3pencil) ? 'O' : '✗' },
        { 아이템: '마지막 줄의 여백', 깃발: 's3_margin', 가짐: nOn('s3_margin') ? 'O' : '-', 연결: (typeof s003EndPick === 'function' && s003EndPick._s3margin) ? 'O' : '✗' }
    ]);
    console.log('  (원래 돌던 것 — 접힌 귀퉁이 · 삼킨 마침표 · 덧쓴 이름 · 읽어 준 목소리)');
};

console.log('[아이템] scaleOdds() · polishState() · s003State() · facDarkState()');

})();