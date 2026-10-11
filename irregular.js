// ==========================================
// ★ ⛓️‍💥 이레귤러 — 능력 네 가지
// bundles.json 마지막 묶음, titles.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// titles.js 의 이레귤러는 「전용 장비」 쪽만 건드렸다 (등급 L · 네 번째 자리 ·
// 변경권 없이 속성 교체). 여기에 탐사 쪽 능력 네 가지를 더한다.
//
//   ① 주사위   한 탐사에서 **처음 두 번은 확정으로 높게** 나온다.
//              그 다음(세 번째) 굴림이 10 이상이면 **부활 한 번**을 얻는다.
//   ② 사망     죽을 때 주사위를 한 번 굴려 12 이상이면 상담실·선녀탕으로
//              끌려가지 않고 **오염도 30%** 로 나온다. 포인트는 **두 배**.
//   ③ 연속 실패 주사위가 **연속 두 번 낮게**(9 이하) 나오면, 다음 기믹을
//              **파티 전체로** 파훼할 수 있는 단추가 생긴다.
//   ④ 카피     남의 버프 하나를 복사해 온다. 하루 두 번 · 최대 두 사람.
//
// ■ 어디에 끼어드나
//
//   dark.js 의 주사위 스무 군데가 전부 luckReroll(…) 을 지난다. 그 한 곳만
//   감싸면 모든 주사위를 본다. 사망은 darkDeath 를 감싼다. 둘 다 전역이라
//   잡힌다.
//
//   ③ 의 파티 파훼는 방 노드(darkParties/<방>/irrSmash/<걸음>)에 한 줄
//   적고, 파티원 각자가 그것을 보고 같은 화면으로 넘어간다. 누가 먼저
//   눌러도 한 번만 먹히게 걸음마다 자리를 하나만 둔다.
//
// ■ 콘솔
//   irrState()    지금 어떤 것이 켜져 있나
//   irrReset()    상담사 — 오늘 쓴 카피 횟수를 되돌린다

(function irregularPlus() {

const MARK = '⛓️‍💥';
const NAME = '이레귤러';

// ① 주사위
const FREE_ROLLS = 2;        // 확정으로 높게 나오는 횟수 (한 탐사)
const HIGH_LO = 17, HIGH_HI = 20;
const REVIVE_AT = 10;        // 그 다음 굴림이 이 이상이면 부활 한 번

// ② 사망
const DEATH_AT = 12;         // 이 이상이면 끌려가지 않는다
const OUT_POLL = 30;         // 나올 때 오염도
const OUT_MULT = 2;          // 포인트 배수

// ③ 연속 실패
const FAIL_AT = 9;           // 이 이하를 실패로 본다
const FAIL_RUN = 2;          // 연속 이만큼이면 파티 파훼

// ④ 카피
const COPY_DAY = 2;          // 하루 횟수
const COPY_WHO = 2;          // 최대 사람 수
const COPY_MS = 24 * 3600 * 1000;
const COPY_SRC = MARK + ' 이레귤러';

function me()   { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function run()  { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function db_()  { return (typeof database !== 'undefined') ? database : null; }
function users() {
    return Object.keys((typeof db !== 'undefined' && db.users) ? db.users : {})
        .map(function (c) { return db.users[c]; })
        .filter(function (x) { return x && x.name; });
}
function irr(u) {
    try { return !!(typeof window._irregular === 'function' && window._irregular(u || me())); }
    catch (e) { return false; }
}
function on() { return !!(run() && irr()); }
function d20() { return Math.floor(Math.random() * 20) + 1; }
function toast(t) { try { if (typeof showDarkToast === 'function') showDarkToast(t); } catch (e) { } }
function alert_(t) { if (typeof showCustomAlert === 'function') showCustomAlert(t); else console.log(t); }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : Infinity; }

// ==========================================
// ① · ③ — 주사위
// ==========================================
//
//   dark.js 의 주사위는 전부 luckReroll 을 지난다. 그 자리에서 값을 바꾼다.
//   확정으로 높게 바꿀 때도 원래 눈을 기록에 남긴다 — 나중에 왜 그렇게
//   됐는지 볼 수 있어야 한다.
(function hookDice() {
    const iv = setInterval(function () {
        if (typeof luckReroll !== 'function') return;
        if (luckReroll._irr) { clearInterval(iv); return; }
        const _l = luckReroll;
        const w = function (roll) {
            let r = _l.apply(this, arguments);
            try { r = steer(r); } catch (e) { console.warn('[이레귤러]', e); }
            return r;
        };
        w._irr = true;
        luckReroll = w;
        window.luckReroll = w;
        clearInterval(iv);
        console.log('[이레귤러] 주사위 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

function steer(roll) {
    if (!on()) return roll;
    const d = run();
    d._irrRolls = (d._irrRolls || 0) + 1;
    const n = d._irrRolls;
    let r = roll;

    // ① 처음 두 번은 확정으로 높게
    if (n <= FREE_ROLLS) {
        const forced = HIGH_LO + Math.floor(Math.random() * (HIGH_HI - HIGH_LO + 1));
        if (forced > r) {
            d.log.push('[' + MARK + '] 확정 — ' + r + ' → ' + forced + ' (' + n + '/' + FREE_ROLLS + ')');
            toast(MARK + ' 손이 알아서 움직인다 — ' + r + ' → ' + forced);
            r = forced;
        }
    // ① 그 다음 한 번 — 10 이상이면 부활
    } else if (n === FREE_ROLLS + 1 && !d._irrReviveSeen) {
        d._irrReviveSeen = 1;
        if (r >= REVIVE_AT) {
            d._irrRevive = 1;
            d.log.push('[' + MARK + '] 부활 하나를 얻었습니다 (' + r + ')');
            toast(MARK + ' 한 번은 더 일어설 수 있다 (' + r + ')');
            note(MARK + ' 부활 하나 (이번 탐사)');
        }
    }

    // ③ 연속으로 낮게 나오면 다음 기믹을 파티 전체로
    if (r <= FAIL_AT) {
        d._irrMiss = (d._irrMiss || 0) + 1;
        if (d._irrMiss >= FAIL_RUN && !d._irrSmash) {
            d._irrSmash = 1;
            d._irrMiss = 0;
            d.log.push('[' + MARK + '] 다음 기믹을 파티 전체로 파훼할 수 있습니다');
            toast(MARK + ' 사슬이 끊어졌다 — 다음 기믹은 함께 부순다');
        }
    } else {
        d._irrMiss = 0;
    }
    return r;
}

// 특이사항 한 줄 (탐사가 끝나면 note-fix 가 걷어 간다)
function note(text) {
    const u = me();
    if (!u) return;
    const t = (u.badge && u.badge.notes) || '';
    if (t.indexOf(text) >= 0) return;
    try { if (typeof appendBadgeNoteToUser === 'function') appendBadgeNoteToUser(u, text); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ badge: 1 }); } catch (e) { }
}

// ==========================================
// ② — 사망
// ==========================================
(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._irr) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            try {
                if (saved(reasonText, _d)) return;        // 내가 처리했다
            } catch (e) { console.warn('[이레귤러]', e); }
            return _d.apply(this, arguments);
        };
        w._irr = true;
        darkDeath = w;
        window.darkDeath = w;
        clearInterval(iv);
        console.log('[이레귤러] 사망 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// 참을 돌려주면 「죽지 않았다」는 뜻이다.
function saved(reasonText, _orig) {
    const d = run(), u = me();
    if (!d || !u || d._dead || !irr()) return false;

    // ㉮ ① 에서 얻어 둔 부활이 남아 있으면 그것부터 쓴다
    if (d._irrRevive) {
        d._irrRevive = 0;
        d.fail = Math.max(0, (d.fail || 0) - 1);
        try { if (typeof applyPollutionToUser === 'function') applyPollutionToUser(u, 6); } catch (e) { }
        log_(u, '[' + MARK + '] 부활 — 한 번 더 일어섰습니다.');
        try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
        try { if (typeof stripNoteByItem === 'function') stripNoteByItem(u, MARK + ' 부활 하나 (이번 탐사)'); } catch (e) { }
        show('—', reasonText + '<br><br>'
            + '<span style="color:#c9a8ff;">— 끊어진 자리가 다시 이어진다.<br>'
            + '원래 이렇게 되는 것이 아니라는 걸 안다. 알면서도 일어선다.<br><br>'
            + '숨이 돌아온다. 한 번뿐이다.</span>',
            '자세를 낮춘다.', 'renderDarkStep();');
        return true;
    }

    // ㉯ 사망 주사위 — 한 탐사에 한 번만 굴린다
    if (d._irrDeathRolled) return false;
    d._irrDeathRolled = 1;
    const r = d20();
    d.log.push('[' + MARK + '] 사망 판정 ' + r + ' / ' + DEATH_AT);
    if (r < DEATH_AT) {
        toast(MARK + ' 사망 판정 ' + r + ' — 모자랐다');
        return false;                                     // 원래대로 죽는다
    }

    // 성공 — 끌려가지 않는다
    d._dead = true;
    const was = Number(u.points) || 0;
    const got = Math.max(0, Math.min(cap(), was * OUT_MULT));
    u.points = got;
    u.pollution = OUT_POLL;
    u.quarantineUntil = 0;
    u.quarantineExitPollution = 0;
    u.quarantineHospital = false;
    u.quarantineDest = null;
    u.foxRoomAnswered = true;
    log_(u, '[' + MARK + '] 사망 판정 ' + r + ' — 끌려가지 않았습니다. (오염도 '
        + OUT_POLL + '% · 포인트 ' + was.toLocaleString() + ' → ' + got.toLocaleString() + ' P)');
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof darkAmbienceStop === 'function') darkAmbienceStop(); } catch (e) { }

    show('—', reasonText + '<br><br>'
        + '<span style="color:#c9a8ff;">— 여기서 끝나는 것이 규칙인데, 규칙 쪽이 먼저 접힌다.<br>'
        + '문이 열리는 소리도 없이 밖이다. 아무도 데리러 오지 않았다.<br><br>'
        + '주머니가 무겁다. 들어갈 때보다 두 배로.</span>'
        + '<div style="margin-top:12px; padding:10px; border-radius:6px; background:rgba(0,0,0,0.3);'
        + ' border:1px solid #6a4c93; font-size:11px; color:#c9a8ff; text-align:center; line-height:1.8;">'
        + '사망 판정 ' + r + ' / ' + DEATH_AT + '<br>'
        + '오염도 ' + OUT_POLL + '% · 포인트 ' + was.toLocaleString() + ' → ' + got.toLocaleString() + ' P</div>',
        '걸어 나간다.', 'finishDarkDeath()');
    return true;
}

function show(title, text, label, fn) {
    try {
        if (typeof darkBodyEl !== 'function' || typeof darkBox !== 'function') return;
        darkBodyEl().innerHTML = darkBox(title, text, darkChoiceBtn(label, fn));
        if (typeof mountDarkChat === 'function') mountDarkChat('normal');
    } catch (e) { console.warn('[이레귤러]', e); }
}

// ==========================================
// ③ — 파티 전체로 기믹 파훼
// ==========================================
const SMASH_TXT = '사슬이 끊어지는 소리가 앞에서 났다.<br><br>'
    + '막고 있던 것이 통째로 접힌다. 부순 것이 아니라 **접힌** 쪽에 가깝다.<br>'
    + '일행도 같은 것을 봤다. 아무도 묻지 않는다.<br><br>'
    + '<span style="color:#c9a8ff;">여기서는 원래 이렇게 안 된다.</span>';

function smashPath(step) {
    const d = run();
    return (d && d.partyId) ? 'darkParties/' + d.partyId + '/irrSmash/s' + step : null;
}

window.irrSmash = function () {
    const d = run();
    if (!d || !d._irrSmash || !irr()) return;
    d._irrSmash = 0;
    const p = smashPath(d.step);
    if (d.isParty && db_() && p) {
        db_().ref(p).set({ by: me().code, name: me().name, at: Date.now() }).catch(function () { });
        try { if (typeof sendPartyChat === 'function')
            sendPartyChat(me().name + ' 사원이 사슬을 끊었습니다.', true); } catch (e) { }
    }
    applySmash(d.step, me().name);
};

function applySmash(step, who) {
    const d = run();
    if (!d || d._irrSmashedAt === step) return;
    d._irrSmashedAt = step;
    d.success = (d.success || 0) + 2;
    d.modifier = (d.modifier || 0) + 1;
    d.log.push('[' + MARK + '] 기믹 파훼 (파티 전체)');
    show(MARK + ' 이레귤러',
        (who ? esc(who) + ' 사원이 앞으로 나선다.<br><br>' : '') + SMASH_TXT,
        '지나간다.', 'partyAdvance(' + (d.step + 1) + ')');
}

// 남이 끊었을 때도 같이 넘어간다
(function smashWatch() {
    const seen = {};
    setInterval(function () {
        const d = run();
        if (!d || !d.isParty || !d.partyId) return;
        if (typeof darkParties === 'undefined') return;
        const room = darkParties[d.partyId];
        const m = room && room.irrSmash && room.irrSmash['s' + d.step];
        if (!m || !m.at) return;
        const key = d.partyId + '|' + d.step + '|' + m.at;
        if (seen[key]) return;
        seen[key] = 1;
        if (Date.now() - m.at > 5 * 60000) return;         // 묵은 것은 흘려 보낸다
        if (m.by === (me() || {}).code) return;            // 내가 끊은 것은 이미 그렸다
        try { applySmash(d.step, m.name); } catch (e) { }
    }, 1000);
})();

// 선택 화면에 단추를 붙인다 (작두 단추 아래)
(function smashBtn() {
    const ID = 'irr-smash-btn';
    function stick() {
        const d = run();
        const old = document.getElementById(ID);
        if (!d || !d._irrSmash || !irr()) { if (old) old.remove(); return; }
        if (old) return;
        const body = (typeof darkBodyEl === 'function') ? darkBodyEl() : null;
        if (!body) return;
        const area = document.getElementById('vote-area') || body;
        const html = '<button id="' + ID + '" class="game-btn"'
            + ' style="width:100%; margin:8px 0 0 0; padding:12px; font-size:12px;'
            + ' background:linear-gradient(145deg,#4a2c73,#2a0c43) !important;'
            + ' border-color:#c9a8ff !important; color:#fff !important;"'
            + ' onclick="irrSmash()">' + MARK + ' 사슬을 끊는다 — 파티 전체로 파훼 (1회)</button>';
        if (area === body) area.insertAdjacentHTML('beforeend', html);
        else area.insertAdjacentHTML('afterend', html);
    }
    setInterval(function () { try { stick(); } catch (e) { } }, 900);
})();

// ==========================================
// ④ — 카피
// ==========================================
function today() {
    try { return getTodayStr(); } catch (e) { return ''; }
}
function cBox(u) {
    u = u || me();
    if (!u) return { n: 0, who: [] };
    if (u.irrCopyDate !== today()) { u.irrCopyDate = today(); u.irrCopyUsed = 0; u.irrCopyWho = []; }
    if (!Array.isArray(u.irrCopyWho)) u.irrCopyWho = [];
    return { n: u.irrCopyUsed || 0, who: u.irrCopyWho };
}
function copyLeft(u) { return Math.max(0, COPY_DAY - cBox(u).n); }

const BK = {
    luck: '행운', bon: '판정', eva: '회피', gim: '기믹 파훼',
    fac: '공용시설 횟수', dark: '어둠 탐사 횟수', pct: '행운 배수',
    death: '사망 회피', resist: '저항', noPoll: '오염 동결', kleeLoot: '회수품 확률'
};
function bname(k) { return BK[k] || k; }
function bunit(k) { return (k === 'pct' || k === 'kleeLoot') ? '%' : ''; }
function live(u) {
    const t = Date.now();
    return (Array.isArray(u.itemBuffs) ? u.itemBuffs : []).filter(function (b) {
        return b && b.k && (b.run || (b.until || 0) > t);
    });
}

// 창 — titles.js 와 같은 모양으로 직접 만든다 (칭호 쪽에는 창 틀이 없다)
let shell = null;
function shut() { if (shell) { try { shell.remove(); } catch (e) { } shell = null; } }
function panel(html) {
    shut();
    const w = document.createElement('div');
    w.className = 'modal-overlay';
    w.style.cssText = 'display:flex; z-index:100004; align-items:center; justify-content:center;';
    w.innerHTML = '<div style="width:min(92vw,420px); max-height:82vh; display:flex; flex-direction:column;'
        + ' background:#14121a; border:1px solid #6a4c93; border-radius:12px; padding:16px;">' + html + '</div>';
    document.body.appendChild(w);
    shell = w;
    return w;
}
const BTN = 'width:100%; margin:0 0 8px 0; padding:11px; font-size:12px; text-align:left;';
const GREY = ' background:#232323 !important; border-color:#3c3c3c !important; color:#9a9a9a !important;';
const SCROLL = 'overflow-y:auto; -webkit-overflow-scrolling:touch; flex:1; min-height:0; margin-bottom:9px;';

window.irrCopy = function () {
    const u = me();
    if (!u) return;
    if (!irr()) { alert_(MARK + ' ' + NAME + ' 을 달고 있어야 합니다.'); return; }
    const box = cBox(u);
    if (copyLeft(u) <= 0) { alert_('오늘은 더 베낄 수 없습니다.\n\n하루 ' + COPY_DAY + '번까지입니다.'); return; }

    const list = users().filter(function (x) { return x.code !== u.code && live(x).length; });
    if (!list.length) { alert_('베낄 버프를 가진 사원이 없습니다.'); return; }

    const rows = list.map(function (x) {
        const already = box.who.indexOf(x.code) >= 0;
        const full = !already && box.who.length >= COPY_WHO;
        const off = full;
        return '<button class="irr-who game-btn" data-c="' + x.code + '"' + (off ? ' disabled' : '')
            + ' style="' + BTN + (off ? GREY : '') + '">'
            + '<div style="font-size:12px; color:' + (off ? '#777' : '#cfe6f6') + ';">'
            + esc(x.name) + ' <span style="color:#8a8a8a;">NO.' + esc(x.no || '') + '</span></div>'
            + '<div style="font-size:10px; color:#8a8a8a; margin-top:3px;">'
            + (full ? '오늘은 다른 사람을 더 고를 수 없습니다'
                    : live(x).length + '가지' + (already ? ' · 오늘 이미 베낀 사원' : ''))
            + '</div></button>';
    }).join('');

    const w = panel('<div style="font-size:13px; color:#c9a8ff; font-weight:bold;">' + MARK + ' 카피</div>'
        + '<div style="font-size:10px; color:#8a8a8a; margin:4px 0 10px 0;">'
        + '남의 버프 하나를 그대로 베껴 온다. 상대 것은 줄지 않는다.<br>'
        + '오늘 ' + copyLeft(u) + ' / ' + COPY_DAY + '번 · 사람 '
        + box.who.length + ' / ' + COPY_WHO + '명</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="irr-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#irr-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.irr-who'), function (b) {
        b.onclick = function () { pickBuff(b.dataset.c); };
    });
};

function pickBuff(code) {
    const u = me(), t = (typeof db !== 'undefined' && db.users) ? db.users[code] : null;
    shut();
    if (!t) { alert_('사원을 찾지 못했습니다.'); return; }
    const bs = live(t);
    if (!bs.length) { alert_('베낄 버프가 없습니다.'); return; }

    const rows = bs.map(function (b, i) {
        return '<button class="irr-b game-btn" data-i="' + i + '" style="' + BTN + '">'
            + '<div style="font-size:12px; color:#cfe6f6;">' + esc(bname(b.k))
            + ' <span style="color:#c9a8ff;">+' + esc(b.v) + esc(bunit(b.k)) + '</span></div>'
            + '<div style="font-size:10px; color:#8a8a8a; margin-top:3px;">'
            + esc(b.src || '출처 없음') + '</div></button>';
    }).join('');

    const w = panel('<div style="font-size:13px; color:#c9a8ff; font-weight:bold;">'
        + MARK + ' 카피 — ' + esc(t.name) + '</div>'
        + '<div style="font-size:10px; color:#8a8a8a; margin:4px 0 10px 0;">하나만 고를 수 있습니다. (24시간)</div>'
        + '<div style="' + SCROLL + '">' + rows + '</div>'
        + '<button id="irr-x" class="game-btn" style="' + BTN + GREY + ' text-align:center;">그만둔다</button>');
    w.querySelector('#irr-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.irr-b'), function (btn) {
        btn.onclick = function () { doCopy(code, bs[Number(btn.dataset.i)]); };
    });
}

function doCopy(code, b) {
    const u = me(), t = db.users[code];
    shut();
    if (!u || !t || !b) return;
    const box = cBox(u);
    if (copyLeft(u) <= 0) { alert_('오늘은 더 베낄 수 없습니다.'); return; }
    if (box.who.indexOf(code) < 0 && box.who.length >= COPY_WHO) {
        alert_('오늘은 다른 사람을 더 고를 수 없습니다.'); return;
    }

    try { window.ibAdd(u, b.k, b.v, COPY_MS, COPY_SRC); } catch (e) { }
    u.irrCopyUsed = (u.irrCopyUsed || 0) + 1;
    if (box.who.indexOf(code) < 0) u.irrCopyWho = box.who.concat([code]);

    const say = bname(b.k) + ' +' + b.v + bunit(b.k);
    note(MARK + ' 카피 — ' + say + ' (24시간)');
    log_(u, '[' + MARK + '] 카피 — ' + t.name + ' 사원의 ' + say);
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    alert_('[' + MARK + ' 카피]\n\n' + t.name + ' 사원의 ' + say + ' 를 그대로 베껴 왔습니다. (24시간)\n'
        + '상대 것은 줄지 않았습니다.\n\n'
        + '오늘 남은 횟수 ' + copyLeft(u) + ' / ' + COPY_DAY
        + ' · 사람 ' + (u.irrCopyWho || []).length + ' / ' + COPY_WHO + '명');
}

// 카피는 24시간짜리라 특이사항에 남긴다. 끝나면 note-fix 가 걷어 간다.
window.irrNoteLive = function (u, note_) {
    try {
        const t = String(note_ || '');
        if (t.indexOf('부활 하나') >= 0) {
            return !!(typeof darkRun !== 'undefined' && darkRun && darkRun._irrRevive);
        }
        if (t.indexOf('카피') >= 0) {
            return live(u || me() || {}).some(function (b) { return b.src === COPY_SRC; });
        }
        return true;
    } catch (e) { return true; }
};

// ==========================================
// 단추 — 전용 장비 칸의 「속성 바꾸기」 옆
// ==========================================
(function copyBtn() {
    const ID = 'irr-copy-btn';
    function stick() {
        if (!irr()) {
            const old = document.getElementById(ID);
            if (old) old.remove();
            return;
        }
        if (document.getElementById(ID)) return;
        const sib = document.getElementById('irr-reattr-btn') || document.getElementById('irr-btn');
        const row = sib ? sib.parentNode : null;
        if (!row) return;
        const b = document.createElement('button');
        b.id = ID;
        b.className = 'inv-btn';
        b.style.cssText = 'flex:1; min-width:78px; background:linear-gradient(145deg,#2c4a73,#0c2a43);'
            + ' color:#fff; border-color:#6c8cb3;';
        b.textContent = MARK + ' 카피';
        b.onclick = function () { window.irrCopy(); };
        row.appendChild(b);
    }
    setInterval(function () { try { stick(); } catch (e) { } }, 1000);
})();

// ==========================================
// 확인
// ==========================================
window.irrState = function () {
    const u = me(), d = run();
    console.log('%c===== ' + MARK + ' 이레귤러 =====', 'color:#c9a8ff; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    console.log('  달고 있나:', irr() ? 'O' : '✗ (titleOn 이 이레귤러여야 합니다)');
    console.log('  ④ 카피   :', '오늘 ' + copyLeft(u) + ' / ' + COPY_DAY + '번 · 사람 '
        + (cBox(u).who.length) + ' / ' + COPY_WHO + '명');
    if (!d) { console.log('  (탐사 중이 아닙니다)'); return; }
    console.log('  ① 주사위 :', (d._irrRolls || 0) + '번 굴림 · 확정 ' + FREE_ROLLS + '번까지');
    console.log('  ① 부활   :', d._irrRevive ? '남아 있음' : (d._irrReviveSeen ? '못 얻음' : '아직'));
    console.log('  ② 사망판정:', d._irrDeathRolled ? '이미 굴렸음' : '아직 (' + DEATH_AT + ' 이상이면 삼)');
    console.log('  ③ 연속실패:', (d._irrMiss || 0) + ' / ' + FAIL_RUN
        + (d._irrSmash ? ' · 파티 파훼 쓸 수 있음' : ''));
};

window.irrReset = function (who) {
    if (!me() || me().code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const all = users();
    const u = who ? all.filter(function (x) {
        return x.no === who || x.code === who || x.name === who;
    })[0] : me();
    if (!u) { console.warn('사원을 못 찾았습니다.'); return; }
    u.irrCopyDate = ''; u.irrCopyUsed = 0; u.irrCopyWho = [];
    try {
        if (u.code === me().code) { if (typeof saveSelfFull === 'function') saveSelfFull(); }
        else if (typeof updateUserFields === 'function') {
            updateUserFields(u.code, { irrCopyDate: '', irrCopyUsed: 0, irrCopyWho: [] });
        }
    } catch (e) { }
    console.log('%c✓ ' + u.name + ' 사원의 카피 횟수를 되돌렸습니다.', 'color:#4CAF50');
};

console.log('[이레귤러] irrState() · irrReset(사번)');

})();
