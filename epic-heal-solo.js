// ==========================================
// ★ epic — 토크쇼 즉사는 기다리지 않고, 치유쪽은 스스로 일어선다
// bundles.json 마지막 묶음, epic-hard.js · epic-open.js 보다 뒤 · epic-show.js 앞
// ==========================================
//
// ■ 두 가지를 바꾼다
//
//   ① 📺 토크쇼 중의 즉사 — 구출을 기다리지 않는다
//
//     epic 에서 즉사 기믹(o.die)에 걸리면 epicDeath 로 간다. 그 첫 줄이
//     이렇다.
//
//         epic.js:552   if (!er._calledHelp && epicCallHelp('쓰러졌습니다'))
//                       → 「동료가 오기를 기다리는 중…」 90초
//
//     토크쇼에 든 사람은 부활 2회를 들고 있으므로 이 기다림이 필요 없다.
//     epic-show.js 가 epicDeath 를 가로채 그 자리에서 일으켜 세운다 —
//     기다림 화면도, 동료에게 뜨는 「달려간다」 단추도 아예 나오지 않는다.
//     (남은 부활이 떨어지면 그때부터는 예전처럼 구출을 기다린다)
//
//     이 파일은 그 순서를 **보장**한다. 아래 ② 가 epicDeath 를 한 번 더
//     감싸는데, 감싸는 차례는 어느 쪽이 먼저 걸리느냐에 따라 뒤집힐 수
//     있다. 그래서 남은 토크쇼 부활이 있으면 무조건 안쪽으로 넘긴다.
//     공짜로 받은 부활을 두고 주사위를 굴리는 일은 없게 한다.
//
//   ② 치유쪽 직업 — 남이 못 구한다. 대신 스스로 두 번.
//
//     치유쪽은 사제 · 약초꾼 · 산파 셋이다. (EPIC_JOBS 의 attr === 'heal')
//
//       · 쓰러져도 동료를 부르지 않는다 (epicCallHelp 가 false 를 준다)
//         → 다른 사람 화면에 「달려간다」·「끌어낸다」가 뜨지 않는다
//       · 손을 뻗을 시간을 재는 기믹(epicDoom)도 치유쪽에게는
//         기다림 없이 바로 제 차례가 온다
//       · 대신 **스스로 두 번** 일어설 수 있다. 굴려서 넘으면 선다.
//
//           첫 번째  DC 12      두 번째  DC 14
//           보정     rollDarkBonus('heal') — 치유 장비가 그대로 든다
//           1 이 나오면 무조건 못 선다 (epic 의 다른 판정과 같다)
//
//         성패와 상관없이 한 번 굴리면 한 번이 닳는다. 못 서면 거기서
//         끝난다. 「두 번 살아난다」가 아니라 「두 번 굴린다」에 가깝다.
//
//     토크쇼에 든 치유쪽은 토크쇼 부활 2회를 먼저 쓰고, 그것이 다 떨어진
//     뒤에 제 주사위 두 번을 굴린다.
//
// ■ 숫자는 아래 EPIC_HEAL_SELF 에서 바꾼다. 콘솔에서 바로 고쳐도 된다.
//       EPIC_HEAL_SELF.dc = 10
//   epicHealState() 로 지금 설정과 남은 횟수를 본다.

window.EPIC_HEAL_SELF = {
    tries:  2,    // 스스로 굴릴 수 있는 횟수
    dc:     12,   // 첫 번째 난도
    dcStep: 2     // 두 번째부터 올라가는 몫
};

(function epicHealSolo() {

const H = window.EPIC_HEAL_SELF;

// ==========================================
// 치유쪽인가
// ==========================================
function jobAttr(key) {
    try {
        if (typeof EPIC_JOBS === 'undefined') return null;
        const j = EPIC_JOBS[key];
        return j ? j.attr : null;
    } catch (e) { return null; }
}
// 내가 치유쪽인가
function iAmHeal() {
    try {
        if (typeof er === 'undefined' || !er || !er.job) return false;
        return jobAttr(er.job) === 'heal';
    } catch (e) { return false; }
}
// 치유쪽 직업의 이름들 — 구조 요청 칸에는 직업 이름만 적혀 온다
function healNames() {
    const out = [];
    try {
        if (typeof EPIC_JOBS === 'undefined') return out;
        Object.keys(EPIC_JOBS).forEach(function (k) {
            if (EPIC_JOBS[k] && EPIC_JOBS[k].attr === 'heal') out.push(EPIC_JOBS[k].name);
        });
    } catch (e) { }
    return out;
}
function isHealEntry(v) {
    return !!(v && v.job && healNames().indexOf(v.job) >= 0);
}

// ==========================================
// 남은 횟수 — darkRun 에 두고, 이어하기에도 적어 둔다
// ==========================================
function usedNow() {
    try {
        if (typeof darkRun === 'undefined' || !darkRun) return 0;
        return Number(darkRun._healBack || 0);
    } catch (e) { return 0; }
}
function leftNow() {
    return Math.max(0, Number(H.tries || 0) - usedNow());
}

let lastKept = null;
function keep() {
    try {
        if (typeof database === 'undefined' || !database) return;
        if (typeof currentUser === 'undefined' || !currentUser || !currentUser.code) return;
        const n = usedNow();
        if (lastKept === n) return;
        lastKept = n;
        database.ref('darkRuns/' + currentUser.code).update({ healBack: n });
    } catch (e) { console.warn('[치유·자력] 남은 횟수 적기 건너뜀:', e && e.message); }
}

// epicMap 은 움직일 때마다 darkRuns 를 통째로 덮어쓴다 — 그 뒤에 다시 적는다
(function hookMap() {
    const iv = setInterval(function () {
        if (typeof epicMap !== 'function') return;
        if (epicMap._healSolo) { clearInterval(iv); return; }
        const _m = epicMap;
        epicMap = function () {
            const r = _m.apply(this, arguments);
            lastKept = null;
            try { keep(); } catch (e) { }
            return r;
        };
        epicMap._healSolo = true;
        clearInterval(iv);
    }, 500);
})();

// 이어하기 — 원본이 _pendingResume 을 비우기 전에 챙긴다 (talkshow.js 와 같은 수)
(function hookResume() {
    const iv = setInterval(function () {
        if (typeof acceptDarkResume !== 'function') return;
        if (acceptDarkResume._healSolo) { clearInterval(iv); return; }
        const _a = acceptDarkResume;
        acceptDarkResume = function () {
            const s = window._pendingResume;
            const r = _a.apply(this, arguments);
            try {
                if (s && s.healBack != null && typeof darkRun !== 'undefined' && darkRun) {
                    darkRun._healBack = Number(s.healBack) || 0;
                    lastKept = null;
                    console.log('[치유·자력] 이어하기 — 남은 ' + leftNow() + '번');
                }
            } catch (e) { }
            return r;
        };
        acceptDarkResume._healSolo = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// ①-보장 + ② 스스로 일어서기 — epicDeath
// ==========================================
//
// 남은 토크쇼 부활이 있으면 **무조건 안쪽으로 넘긴다.** epic-show.js 가
// 바깥에 있든 안쪽에 있든 공짜 부활이 먼저 쓰이도록 하는 장치다.
//   · 이 파일이 바깥이면  → 안쪽(epic-show)이 받아 일으켜 세운다
//   · 이 파일이 안쪽이면  → epic-show 가 이미 지나갔다는 뜻이고,
//                           그랬다면 남은 부활은 0 이라 여기 걸리지 않는다
function showLeft() {
    try {
        if (typeof darkRun === 'undefined' || !darkRun || !darkRun._show) return 0;
        return Number(darkRun._showRevives || 0);
    } catch (e) { return 0; }
}

function roll20() {
    const r = Math.floor(Math.random() * 20) + 1;
    return (typeof luckReroll === 'function') ? luckReroll(r) : r;
}
function healBonus() {
    try { return (typeof rollDarkBonus === 'function') ? rollDarkBonus('heal') : 0; }
    catch (e) { return 0; }
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof epicDeath !== 'function') return;
        if (epicDeath._healSolo) { clearInterval(iv); return; }

        const _d = epicDeath;
        epicDeath = function (txt) {
            // 공짜 부활이 남아 있으면 그쪽이 먼저다
            if (showLeft() > 0) return _d.apply(this, arguments);

            if (!iAmHeal()) return _d.apply(this, arguments);
            if (typeof er === 'undefined' || !er || er.dead) return _d.apply(this, arguments);
            if (leftNow() <= 0) return _d.apply(this, arguments);

            const used = usedNow();
            const dc = Number(H.dc || 12) + Number(H.dcStep || 0) * used;
            const roll = roll20();
            const bonus = healBonus();
            const ok = roll !== 1 && (roll + bonus) >= dc;

            darkRun._healBack = used + 1;
            lastKept = null;
            try { keep(); } catch (e) { }

            const dice = '<div style="text-align:center; font-size:26px; font-weight:bold; color:'
                + (ok ? '#4CAF50' : '#f44336') + '; margin-bottom:12px;">🎲 ' + roll
                + ' <span style="font-size:13px; color:#888;">(보정 ' + (bonus >= 0 ? '+' : '') + bonus
                + ' / DC ' + dc + ')</span></div>';

            if (!ok) {
                // 못 섰다 — 그대로 끝난다. 굴린 눈은 보여 주고 넘긴다.
                try {
                    if (typeof addHistoryLog === 'function') {
                        addHistoryLog(currentUser, '[치유] 스스로 일어서지 못했습니다. (🎲 '
                            + roll + ' + ' + bonus + ' / DC ' + dc + ' · 남은 ' + leftNow() + '번)');
                    }
                } catch (e) { }
                return _d.call(this, (txt || '')
                    + '<br><br>' + dice
                    + '<span style="color:#a08a68;">제 손으로 짚어 보려 했다.<br>'
                    + '짚을 것이 없었다.</span>');
            }

            // 섰다
            er._calledHelp = false;
            er.danger = null;
            er.dead = false;
            try { darkRun.fail = Math.max(0, (darkRun.fail || 0) - 1); } catch (e) { }
            try {
                if (typeof database !== 'undefined' && database && darkRun.partyId && currentUser) {
                    database.ref('darkParties/' + darkRun.partyId + '/epicHelp/' + currentUser.code).remove();
                    database.ref('darkParties/' + darkRun.partyId + '/epicDoom/' + currentUser.code).remove();
                }
            } catch (e) { }

            try {
                darkBodyEl().innerHTML = darkBox('✝',
                    (txt || '') + '<br><br>' + dice
                    + '<span style="color:#c7b89a; font-size:14px; font-weight:bold;">'
                    + '— 제 손으로 짚고 일어선다.</span><br>'
                    + '<span style="color:#a08a68;">고치는 법을 배운 사람은 제 몸도 고친다.<br>'
                    + '남은 ' + leftNow() + '번.</span>',
                    (typeof epicBar === 'function' ? epicBar() : '')
                    + darkChoiceBtn('일어선다.', 'epicMap()'));
                if (darkRun.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
            } catch (e) { console.warn('[치유·자력] 화면 건너뜀:', e && e.message); }

            try {
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(currentUser, '[치유] 스스로 일어섰습니다. (🎲 '
                        + roll + ' + ' + bonus + ' / DC ' + dc + ' · 남은 ' + leftNow() + '번)');
                }
            } catch (e) { }
            return;
        };
        epicDeath._healSolo = true;
        clearInterval(iv);
        console.log('[치유·자력] 스스로 일어서기 ' + H.tries + '번 연결');
    }, 400);
})();

// ==========================================
// 치유쪽은 동료를 부르지 않는다
// ==========================================
(function hookCall() {
    const iv = setInterval(function () {
        if (typeof epicCallHelp !== 'function') return;
        if (epicCallHelp._healSolo) { clearInterval(iv); return; }
        const _c = epicCallHelp;
        epicCallHelp = function () {
            if (iAmHeal()) return false;         // 부를 사람이 없다 → 바로 제 차례
            return _c.apply(this, arguments);
        };
        epicCallHelp._healSolo = true;
        clearInterval(iv);
    }, 400);
})();

// 손을 뻗을 시간을 재는 기믹 — 치유쪽에게는 기다림이 없다
(function hookDoom() {
    const iv = setInterval(function () {
        if (typeof epicDoom !== 'function') return;
        if (epicDoom._healSolo) { clearInterval(iv); return; }
        const _o = epicDoom;
        epicDoom = function (cfg) {
            if (!iAmHeal()) return _o.apply(this, arguments);
            if (typeof er === 'undefined' || !er || er.dead) return _o.apply(this, arguments);

            cfg = cfg || {};
            er._doomCfg = cfg;
            try {
                darkBodyEl().innerHTML = darkBox(cfg.title || '—',
                    (cfg.text || '')
                    + '<br><br><span style="color:#ff6b6b;">부를 수 없다.</span><br>'
                    + '<span style="color:#a08a68;">치유를 맡은 사람에게는 아무도 손을 뻗지 못한다.<br>'
                    + '제 손으로 짚어야 한다.</span>',
                    (typeof epicBar === 'function' ? epicBar() : '')
                    + darkChoiceBtn('스스로 버틴다.', 'epicDoomFail()'));
                if (darkRun && darkRun.isParty && typeof mountDarkChat === 'function') mountDarkChat('normal');
            } catch (e) {
                console.warn('[치유·자력] 기믹 화면 건너뜀:', e && e.message);
                if (typeof epicDoomFail === 'function') epicDoomFail();
            }
        };
        epicDoom._healSolo = true;
        clearInterval(iv);
    }, 400);
})();

// ==========================================
// 남의 화면에서도 치유쪽은 안 보이고, 눌러도 안 간다
// ==========================================
//
// 부르지 않으니 칸이 생길 일도 없지만, 전에 남은 칸이나 옛 화면이 있을 수
// 있다. 그리는 자리와 누르는 자리 둘 다 막아 둔다.
function dropHeal(map) {
    const out = {};
    Object.keys(map || {}).forEach(function (k) {
        if (!isHealEntry(map[k])) out[k] = map[k];
    });
    return out;
}

(function hookBanner() {
    const iv = setInterval(function () {
        if (typeof epicHelpBanner !== 'function') return;
        if (epicHelpBanner._healSolo) { clearInterval(iv); return; }
        const _b = epicHelpBanner;
        epicHelpBanner = function () {
            if (typeof er === 'undefined' || !er) return _b.apply(this, arguments);
            const h = er.help, d = er.doom;
            try {
                if (h) er.help = dropHeal(h);
                if (d) er.doom = dropHeal(d);
                return _b.apply(this, arguments);
            } finally {
                if (h) er.help = h;
                if (d) er.doom = d;
            }
        };
        epicHelpBanner._healSolo = true;
        clearInterval(iv);
    }, 400);
})();

(function hookRescue() {
    const WHERE = { epicRescue: 'help', epicDoomRescue: 'doom' };
    const iv = setInterval(function () {
        let left = 0;
        Object.keys(WHERE).forEach(function (n) {
            const f = window[n];
            if (typeof f !== 'function') { left++; return; }
            if (f._healSolo) return;
            const _o = f, box = WHERE[n];
            window[n] = function (code) {
                try {
                    const v = (typeof er !== 'undefined' && er) ? ((er[box] || {})[code]) : null;
                    if (isHealEntry(v)) {
                        if (typeof showCustomAlert === 'function') {
                            showCustomAlert('치유를 맡은 사원은 남이 끌어낼 수 없습니다.\n\n'
                                + '그쪽은 제 손으로 일어섭니다.');
                        }
                        if (typeof epicMap === 'function') epicMap();
                        return;
                    }
                } catch (e) { }
                return _o.apply(this, arguments);
            };
            window[n]._healSolo = true;
        });
        if (!left) clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 확인
// ==========================================
window.epicHealState = function () {
    console.log('%c===== epic · 치유쪽 자력 =====', 'color:#8bc34a; font-size:13px');
    console.log('  설정:', JSON.stringify(H));
    console.log('  치유 직업:', healNames().join(' · ') || '(목록 없음)');

    if (typeof er === 'undefined' || !er) { console.log('  지금 탐사 중이 아닙니다.'); }
    else {
        const j = (typeof EPIC_JOBS !== 'undefined') ? EPIC_JOBS[er.job] : null;
        console.log('  내 직업:', j ? (j.name + ' (' + j.attr + ')') : '(아직 안 고름)',
            '· 치유쪽인가:', iAmHeal() ? 'O' : '✗');
        console.log('  스스로 일어서기 — 쓴 횟수', usedNow(), '· 남은', leftNow() + '번');
        if (iAmHeal() && leftNow() > 0) {
            const dc = Number(H.dc || 12) + Number(H.dcStep || 0) * usedNow();
            const b = healBonus();
            const n = Math.max(0, Math.min(19, 21 - (dc - b)));
            console.log('  다음 판정 — DC', dc, '· 보정', (b >= 0 ? '+' : '') + b,
                '→ 약', Math.round(n / 20 * 100) + '%');
        }
    }
    console.log('  토크쇼 남은 부활:', showLeft() + '회', showLeft() > 0 ? '(이쪽이 먼저 쓰입니다)' : '');
    console.log('  연결 — epicDeath:', (typeof epicDeath === 'function' && epicDeath._healSolo) ? 'O' : '✗',
        '· epicCallHelp:', (typeof epicCallHelp === 'function' && epicCallHelp._healSolo) ? 'O' : '✗',
        '· epicDoom:', (typeof epicDoom === 'function' && epicDoom._healSolo) ? 'O' : '✗',
        '· 배너:', (typeof epicHelpBanner === 'function' && epicHelpBanner._healSolo) ? 'O' : '✗',
        '· 구출 두 자리:', (typeof epicRescue === 'function' && epicRescue._healSolo) ? 'O' : '✗');
};

console.log('[치유·자력] 남이 못 구한다 · 스스로 두 번 — epicHealState()');

})();
