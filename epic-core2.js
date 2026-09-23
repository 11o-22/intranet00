// ==========================================
// ★ Qtrew-???-■■■ — 6차 · 시스템
// index.html 에서 epic-bond-gaze.js 다음에 불러온다
// ==========================================
//
// 1. 전용 장비 속성에 해당하는 직업만 선택 가능 (장비 없으면 입장 불가)
// 2. 미니게임 5종
// 3. 동료 기믹 공용 틀 5종
// 4. 즉사 기믹과 구제 — 못 구하면 구하러 간 쪽도 함께 끌려간다

// ==========================================
// 1. 직업 제한
// ==========================================
function epicOwnedAttrs() {
    const g = currentUser && currentUser.soulGear;
    if (!g || !g.attrs || g.attrs.length === 0) return [];
    return g.attrs.slice();
}

function epicHasGear() {
    return epicOwnedAttrs().length > 0;
}

// 입장 차단
epicSoloEnter = function () {
    if (darkRun) return;
    if (!epicHasGear()) { epicNoGearAlert(); return; }
    if (getDarkTriesLeft() <= 0) { showCustomAlert('금일 탐사 횟수를 모두 소진했습니다.'); return; }
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 들어갈 수 없습니다.'); return; }
    if (currentUser.pollution >= 100) { showCustomAlert('오염도가 한계치라 들어갈 수 없습니다.'); return; }
    epicStart(false, null);
};

function epicNoGearAlert() {
    showCustomAlert(
        '전용 장비가 없어 들어갈 수 없습니다.\n\n' +
        '이곳은 맡을 자리가 정해져야 들어갈 수 있습니다.\n' +
        '장비에 새겨진 속성이 곧 자리입니다.'
    );
}

(function guardParty() {
    const _createParty = createParty;
    createParty = function (zone) {
        if (zone === EPIC_CODE && !epicHasGear()) { epicNoGearAlert(); return; }
        return _createParty.apply(this, arguments);
    };
    const _joinParty = joinParty;
    joinParty = function (pid) {
        const p = darkParties[pid];
        if (p && p.zone === EPIC_CODE && !epicHasGear()) { epicNoGearAlert(); return; }
        return _joinParty.apply(this, arguments);
    };
})();

// 선택 화면 — 가진 속성만
epicJobPick = function () {
    const owned = epicOwnedAttrs();
    if (owned.length === 0) {
        darkBodyEl().innerHTML = darkBox('—',
            `맡을 자리가 없다.<br><br>
             새겨진 것이 없는 자에게는 역할이 주어지지 않는다.`,
            darkChoiceBtn('돌아간다.', 'epicFinish()'));
        return;
    }

    const taken = epicTakenJobs();
    const byAttr = {};
    Object.keys(EPIC_JOBS).forEach(k => {
        const j = EPIC_JOBS[k];
        if (!owned.includes(j.attr)) return;
        (byAttr[j.attr] = byAttr[j.attr] || []).push(k);
    });

    const html = owned.filter(a => byAttr[a]).map(a => {
        const gv = gearValue(currentUser, a);
        return `
        <div style="margin-bottom:12px;">
            <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:5px;">
                ${EPIC_ATTR_ICON[a]} ${EPIC_ATTR_NAME[a]}
                <span style="color:#4CAF50; font-size:9px; margin-left:5px;">${gearAttrGrade(currentUser.soulGear, a)} 등급</span>
            </div>
            ${byAttr[a].map(k => {
                const j = EPIC_JOBS[k];
                const dup = taken[k];
                return `
                    <button class="game-btn" style="width:100%; margin:0 0 6px 0; padding:10px; text-align:left; font-size:12px; font-weight:normal; ${dup ? 'opacity:0.35;' : ''}"
                        onclick="epicPickJob('${k}')" ${dup ? 'disabled' : ''}>
                        ${j.icon} <b>${j.name}</b>
                        <span style="font-size:10px; color:#888; margin-left:5px;">${dup ? '— ' + dup + ' 사원이 맡음' : j.desc}</span>
                    </button>`;
            }).join('')}
        </div>`;
    }).join('');

    darkBodyEl().innerHTML = darkBox('배역', DARK_ZONES[EPIC_CODE].intro +
        `<br><br><div style="border-top:1px dashed #333; padding-top:12px;">
            새겨진 것이 자리를 정한다.<br>
            <span style="font-size:11px; color:#888;">장비에 새겨진 속성의 자리만 맡을 수 있다. 같은 자리는 둘이 맡을 수 없다.</span>
         </div>`,
        html, 'intro');
    if (darkRun.isParty) mountDarkChat('normal');
};

// ==========================================
// 2. 미니게임
// ==========================================
let epicMiniDone = null;

function epicMini(kind, opt) {
    opt = opt || {};
    epicMiniDone = ok => {
        epicMiniDone = null;
        if (ok) { er.score += opt.p || 500; darkRun.success++; }
        else { darkRun.fail++; if (opt.poll) applyPollutionToUser(currentUser, opt.poll); }
        if (typeof opt.done === 'function') opt.done(ok);
    };
    const f = { lock: epicMiniLock, aim: epicMiniAim, star: epicMiniStar,
                beat: epicMiniBeat, scale: epicMiniScale }[kind];
    if (!f) { epicMiniDone(true); return; }
    f(opt);
}

function epicMiniWrap(title, text, inner) {
    darkBodyEl().innerHTML = darkBox(title, text, epicBar() + inner);
    if (darkRun.isParty) mountDarkChat('normal');
}

// ① 자물쇠 따기
function epicMiniLock(opt) {
    const rounds = opt.rounds || 3;
    const bonus = Math.round(gearValue(currentUser, 'evade') * 14);
    const w = Math.max(9, 16 + bonus - (opt.hard || 0) * 3);
    let r = 0, pos = 0, dir = 1, timer = null, zone = 0;

    epicMiniWrap('자물쇠',
        opt.text || `핀이 세 개다.<br><br>손끝으로 위치를 찾아야 한다. 눈으로는 안 보인다.<br>걸리는 자리에서 멈추면 된다.`,
        `<div style="margin-bottom:10px; font-size:10px; color:#888; text-align:center;" id="mg-info">핀 1 / ${rounds}</div>
         <div id="mg-bar" style="position:relative; width:100%; height:34px; background:rgba(0,0,0,0.5); border:1px solid #444; border-radius:5px; overflow:hidden; margin-bottom:12px;">
            <div id="mg-zone" style="position:absolute; top:0; height:100%; background:rgba(76,175,80,0.25); border-left:1px solid #4CAF50; border-right:1px solid #4CAF50;"></div>
            <div id="mg-pin" style="position:absolute; top:0; width:3px; height:100%; background:#d4af37;"></div>
         </div>
         <button class="game-btn" style="width:100%; margin:0; padding:14px;" onclick="epicLockStop()">멈춘다</button>`);

    const draw = () => {
        const bar = document.getElementById('mg-bar');
        const pin = document.getElementById('mg-pin');
        const zn = document.getElementById('mg-zone');
        if (!bar || !pin) { clearInterval(timer); return; }
        pin.style.left = pos + '%';
        zn.style.left = zone + '%';
        zn.style.width = w + '%';
    };

    const next = () => {
        zone = 8 + Math.random() * (84 - w);
        pos = 0; dir = 1;
        const sp = 1.6 + r * 0.5 + (opt.hard || 0) * 0.3;
        clearInterval(timer);
        timer = setInterval(() => {
            pos += dir * sp;
            if (pos >= 97) { pos = 97; dir = -1; }
            if (pos <= 0) { pos = 0; dir = 1; }
            draw();
        }, 16);
        const info = document.getElementById('mg-info');
        if (info) info.innerText = `핀 ${r + 1} / ${rounds}`;
    };

    window.epicLockStop = () => {
        clearInterval(timer);
        const hit = pos >= zone && pos <= zone + w;
        if (!hit) {
            darkBodyEl().innerHTML = darkBox('자물쇠',
                `핀이 어긋난다.<br><br>안에서 딱, 하고 되돌아가는 소리가 났다.<br>처음부터 다시 해야 한다. 다시 할 시간이 없다.`,
                epicBar() + darkChoiceBtn('물러난다.', 'epicMiniEnd(false)'));
            return;
        }
        r++;
        if (r >= rounds) {
            darkBodyEl().innerHTML = darkBox('자물쇠',
                `마지막 핀이 걸린다.<br><br>손목을 돌리자 통째로 돌아간다.<br>열렸다.`,
                epicBar() + darkChoiceBtn('연다.', 'epicMiniEnd(true)'));
            return;
        }
        next();
    };
    next();
}

// ② 활 겨누기
function epicMiniAim(opt) {
    const bonus = gearValue(currentUser, 'sense');
    const size = Math.max(14, 22 + Math.round(bonus * 16) - (opt.hard || 0) * 4);
    let t = 0, timer = null, shots = opt.shots || 2, hit = 0;

    epicMiniWrap('겨눈다',
        opt.text || `숨을 멈춘다.<br><br>조준선이 흔들린다. 바람이 아니라 맥박 때문이다.<br>멎는 순간이 있다. 아주 짧다.`,
        `<div style="margin-bottom:10px; font-size:10px; color:#888; text-align:center;" id="mg-info">${shots}발 남음</div>
         <div id="mg-field" style="position:relative; width:100%; height:170px; background:radial-gradient(circle,#1a1a1a,#0a0a0a); border:1px solid #444; border-radius:6px; overflow:hidden; margin-bottom:12px;">
            <div id="mg-target" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:${size}%; padding-bottom:${size}%; border:2px solid #4CAF50; border-radius:50%;"></div>
            <div id="mg-cross" style="position:absolute; width:16px; height:16px; margin:-8px 0 0 -8px; border:2px solid #d4af37; border-radius:50%;"></div>
         </div>
         <button class="game-btn" style="width:100%; margin:0; padding:14px;" onclick="epicAimShoot()">쏜다</button>`);

    const draw = () => {
        const c = document.getElementById('mg-cross');
        if (!c) { clearInterval(timer); return; }
        t += 0.045 + (opt.hard || 0) * 0.008;
        const x = 50 + Math.sin(t * 1.7) * 32 + Math.sin(t * 4.1) * 7;
        const y = 50 + Math.cos(t * 1.1) * 28 + Math.cos(t * 3.3) * 6;
        c.style.left = x + '%';
        c.style.top = y + '%';
        c._x = x; c._y = y;
    };
    timer = setInterval(draw, 16);

    window.epicAimShoot = () => {
        const c = document.getElementById('mg-cross');
        if (!c) return;
        const d = Math.sqrt(Math.pow(c._x - 50, 2) + Math.pow(c._y - 50, 2));
        if (d <= size / 2) hit++;
        shots--;
        const info = document.getElementById('mg-info');
        if (info) info.innerText = `${shots}발 남음 · 명중 ${hit}`;
        if (shots <= 0) {
            clearInterval(timer);
            const ok = hit >= (opt.need || 1);
            darkBodyEl().innerHTML = darkBox('겨눈다',
                ok ? `맞는 소리가 났다.<br><br>소리가 오기까지 몇 박자 걸렸다.<br>그만큼 멀었다는 뜻이다.`
                   : `빗나갔다.<br><br>화살이 어디에 떨어졌는지도 모르겠다.<br>주우러 갈 수는 없다.`,
                epicBar() + darkChoiceBtn('활을 내린다.', `epicMiniEnd(${ok})`));
        }
    };
}

// ③ 별자리 잇기
function epicMiniStar(opt) {
    const n = opt.n || 6;
    const sec = Math.round((opt.sec || 14) + gearValue(currentUser, 'gaze') * 10);
    let need = 1, left = sec, timer = null;

    const pts = [];
    for (let i = 0; i < n; i++) {
        pts.push({ x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, i: i + 1 });
    }

    epicMiniWrap('별자리',
        opt.text || `별이 흩어져 있다.<br><br>순서가 있다. 밝기 순이다.<br>이어야 자리가 된다.`,
        `<div style="margin-bottom:10px; font-size:10px; color:#888; text-align:center;" id="mg-info">남은 시간 ${left}초 · 다음 1</div>
         <div id="mg-sky" style="position:relative; width:100%; height:210px; background:radial-gradient(circle,#0d1020,#050508); border:1px solid #333; border-radius:6px; margin-bottom:12px;">
            ${pts.map(p => `<button onclick="epicStarTap(${p.i})" id="star-${p.i}"
                style="position:absolute; left:${p.x}%; top:${p.y}%; transform:translate(-50%,-50%);
                width:26px; height:26px; border-radius:50%; border:1px solid #556; background:rgba(255,255,255,0.12);
                color:#ccd; font-size:10px; cursor:pointer;">${p.i}</button>`).join('')}
         </div>`);

    timer = setInterval(() => {
        left--;
        const info = document.getElementById('mg-info');
        if (info) info.innerText = `남은 시간 ${left}초 · 다음 ${need}`;
        if (left <= 0) {
            clearInterval(timer);
            darkBodyEl().innerHTML = darkBox('별자리',
                `시간이 지났다.<br><br>하늘이 한 번 돌았다. 별의 자리가 전부 바뀌었다.<br>처음부터 다시 볼 수는 없다.`,
                epicBar() + darkChoiceBtn('고개를 내린다.', 'epicMiniEnd(false)'));
        }
    }, 1000);

    window.epicStarTap = i => {
        if (i !== need) {
            clearInterval(timer);
            darkBodyEl().innerHTML = darkBox('별자리',
                `순서가 틀렸다.<br><br>이은 선이 엉킨다. 엉킨 모양이 무언가를 닮았다.<br>닮은 것을 알아보기 전에 눈을 돌렸다.`,
                epicBar() + darkChoiceBtn('고개를 내린다.', 'epicMiniEnd(false)'));
            return;
        }
        const el = document.getElementById('star-' + i);
        if (el) { el.style.background = 'rgba(212,175,55,0.5)'; el.style.borderColor = '#d4af37'; }
        need++;
        if (need > n) {
            clearInterval(timer);
            darkBodyEl().innerHTML = darkBox('별자리',
                `마지막 별에 닿았다.<br><br>선이 이어지며 형태가 된다.<br>본 적 있는 모양이다. 어디서였는지는 모르겠다.`,
                epicBar() + darkChoiceBtn('기록한다.', 'epicMiniEnd(true)'));
        }
    };
}

// ④ 박자 맞추기
function epicMiniBeat(opt) {
    const total = opt.total || 8;
    const gap = Math.max(520, (opt.gap || 800) - (opt.hard || 0) * 60);
    const win = Math.round(150 + gearValue(currentUser, 'hide') * 120);
    let i = 0, hit = 0, nextAt = 0, timer = null, tick = null;

    epicMiniWrap('박자',
        opt.text || `소리가 규칙적이다.<br><br>맞춰 움직이면 묻힌다.<br>어긋나면 이쪽 소리만 남는다.`,
        `<div style="margin-bottom:10px; font-size:10px; color:#888; text-align:center;" id="mg-info">0 / ${total}</div>
         <div id="mg-pulse" style="width:100%; height:120px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); border:1px solid #444; border-radius:6px; margin-bottom:12px;">
            <div id="mg-dot" style="width:40px; height:40px; border-radius:50%; background:#333; transition:all 0.1s;"></div>
         </div>
         <button class="game-btn" style="width:100%; margin:0; padding:16px; font-size:14px;" onclick="epicBeatTap()">맞춘다</button>`);

    const beat = () => {
        nextAt = Date.now();
        const d = document.getElementById('mg-dot');
        if (d) { d.style.background = '#d4af37'; d.style.transform = 'scale(1.25)'; }
        setTimeout(() => {
            const dd = document.getElementById('mg-dot');
            if (dd) { dd.style.background = '#333'; dd.style.transform = 'scale(1)'; }
        }, 140);
        i++;
        if (i > total) {
            clearInterval(timer);
            const ok = hit >= (opt.need || Math.ceil(total * 0.6));
            darkBodyEl().innerHTML = darkBox('박자',
                ok ? `끝까지 묻혔다.<br><br>소리가 하나로 들렸을 것이다.<br>둘인 줄 몰랐을 것이다.`
                   : `어긋났다.<br><br>이쪽 소리만 남는다. 짧게, 그러나 분명하게.<br>무언가 그걸 들었다.`,
                epicBar() + darkChoiceBtn('숨을 고른다.', `epicMiniEnd(${ok})`));
        }
    };
    timer = setInterval(beat, gap);
    beat();

    window.epicBeatTap = () => {
        const d = Math.abs(Date.now() - nextAt);
        if (d <= win) hit++;
        const info = document.getElementById('mg-info');
        if (info) info.innerText = `${hit} / ${total}`;
    };
}

// ⑤ 저울 맞추기
function epicMiniScale(opt) {
    const pool = opt.pool || [3, 5, 7, 8, 11, 13];
    const target = opt.target || 19;
    let picked = [];

    const draw = () => {
        const sum = picked.reduce((a, b) => a + b, 0);
        const tilt = Math.max(-14, Math.min(14, (sum - target) * 1.6));
        epicMiniWrap('저울',
            opt.text || `저울이 기울어 있다.<br><br>맞추면 열린다고 한다.<br>정확히 맞아야 한다. 가까운 것은 소용없다.`,
            `<div style="text-align:center; margin-bottom:10px;">
                <div style="display:inline-block; width:150px; height:4px; background:#d4af37; transform:rotate(${tilt}deg); transition:transform 0.3s;"></div>
             </div>
             <div style="text-align:center; font-size:12px; color:#ccc; margin-bottom:12px;">
                올린 무게 <b style="color:${sum === target ? '#4CAF50' : '#d4af37'};">${sum}</b> / 맞춰야 할 무게 <b>${target}</b>
             </div>
             <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
                ${pool.map((v, i) => `<button class="game-btn" style="flex:1; min-width:60px; margin:0; padding:11px; font-size:12px; ${picked.includes(i) ? 'background:linear-gradient(145deg,#3a2f18,#1c1608) !important; border-color:#d4af37 !important;' : ''}"
                    onclick="epicScaleTap(${i})">${v}</button>`).join('')}
             </div>
             <button class="game-btn" style="width:100%; margin:0; padding:13px;" onclick="epicScaleDone()">올려놓는다</button>`);
    };

    window.epicScaleTap = i => {
        const p = picked.indexOf(i);
        if (p >= 0) picked.splice(p, 1); else picked.push(i);
        picked = picked.map(x => x);
        draw();
    };
    window.epicScaleDone = () => {
        const sum = picked.reduce((a, b) => a + pool[b] * 0 + b * 0, 0);
        const real = picked.reduce((a, i) => a + pool[i], 0);
        const ok = real === target;
        darkBodyEl().innerHTML = darkBox('저울',
            ok ? `저울이 수평이 된다.<br><br>멈춘 채로 움직이지 않는다.<br>맞춘 것이다.`
               : `기운 채로 멎는다.<br><br>${real > target ? '무겁다.' : '가볍다.'} 다시 올릴 기회는 없다.`,
            epicBar() + darkChoiceBtn('손을 뗀다.', `epicMiniEnd(${ok})`));
    };

    // picked는 인덱스 배열로 다룬다
    picked = [];
    draw();
}

function epicMiniEnd(ok) {
    if (epicMiniDone) epicMiniDone(ok);
    else epicMap();
}

// ==========================================
// 3. 동료 기믹 — 공용 틀 5종
// ==========================================
// call     : 위험한 곳에 동료를 부른다
// handoff  : 물건이나 정보를 넘긴다
// sync     : 둘이 같은 순간에 해야 한다
// standin  : 다른 자리의 일을 대신한다
// witness  : 다른 사원의 일을 증인으로 확인한다

function epicCoOpen(kind, cfg) {
    if (!darkRun.isParty || !database) {
        darkBodyEl().innerHTML = darkBox(cfg.title || '—',
            (cfg.soloText || `혼자서는 할 수 없는 일이다.<br><br>불러낼 사람이 없다.`),
            epicBar() + darkChoiceBtn('돌아선다.', 'epicMap()'));
        return;
    }
    const id = `${currentUser.code}_${Date.now().toString(36)}`;
    er._co = id;
    database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}`).set({
        kind: kind,
        by: currentUser.code,
        name: currentUser.name,
        job: EPIC_JOBS[er.job].name,
        place: er.place,
        placeName: EPIC_PLACES[er.place].name,
        ask: cfg.ask || '',
        need: cfg.need || null,
        state: 'OPEN',
        at: Date.now()
    });
    sendPartyChat(`${currentUser.name} 사원이 ${EPIC_PLACES[er.place].name}에서 손을 청합니다. — ${cfg.ask}`, true);

    let left = cfg.sec || 60;
    const tick = setInterval(() => {
        left--;
        const el = document.getElementById('co-left');
        if (el) el.innerText = left + '초';
        if (left <= 0) {
            clearInterval(tick);
            database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}`).remove();
            if (cfg.onFail) cfg.onFail();
            else {
                darkBodyEl().innerHTML = darkBox(cfg.title || '—',
                    cfg.failText || `아무도 오지 않았다.<br><br>기다린 만큼 늦어졌다.`,
                    epicBar() + darkChoiceBtn('혼자 한다.', 'epicMap()'));
            }
        }
    }, 1000);

    database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}/state`).on('value', s => {
        if (s.val() !== 'DONE') return;
        database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}/state`).off();
        clearInterval(tick);
        database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}`).remove();
        er.score += cfg.p || 700;
        darkRun.success++;
        if (cfg.onDone) cfg.onDone();
        else {
            darkBodyEl().innerHTML = darkBox(cfg.title || '—',
                cfg.doneText || `손이 왔다.<br><br>둘이 하니 금방이다.`,
                epicBar() + darkChoiceBtn('계속한다.', 'epicMap()'));
        }
    });

    darkBodyEl().innerHTML = darkBox(cfg.title || '—', cfg.text || '',
        epicBar() +
        `<div style="text-align:center; font-size:11px; color:#d4af37; padding:14px; background:rgba(212,175,55,0.08); border:1px solid #5a4a2a; border-radius:5px;">
            손을 청했습니다.<br>
            <span style="font-size:10px; color:#888;">남은 시간 <b id="co-left">${left}초</b></span>
         </div>
         <button class="game-btn" style="width:100%; margin:12px 0 0 0; padding:11px; font-size:11px;" onclick="epicCoCancel()">그만둔다</button>`);
    mountDarkChat('normal');
}

function epicCoCancel() {
    if (er && er._co && database) {
        database.ref(`darkParties/${darkRun.partyId}/epicCo/${er._co}`).remove();
        er._co = null;
    }
    epicMap();
}

// 응하는 쪽
function epicCoAnswer(id) {
    if (!er || !database) return;
    const ref = database.ref(`darkParties/${darkRun.partyId}/epicCo/${id}`);
    ref.once('value').then(s => {
        const c = s.val();
        if (!c || c.state !== 'OPEN') { showCustomAlert('이미 끝난 일입니다.'); epicMap(); return; }

        const far = c.place !== er.place;
        if (far) { er.place = c.place; er.moved++; }

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus(c.need || 'bond') + (epicAttr() === 'bond' ? 3 : 0);
        const dc = far ? 13 : 10;
        const ok = roll !== 1 && (roll + bonus) >= dc;

        if (ok) {
            ref.child('state').set('DONE');
            er.score += 600;
            er.helped++;
            darkRun.success++;
        } else {
            darkRun.fail++;
            applyPollutionToUser(currentUser, 5);
        }

        darkBodyEl().innerHTML = darkBox('거드는 일',
            `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>` +
            (ok ? `${far ? '달려갔다.<br><br>' : ''}${c.name} 사원이 기다리고 있었다.<br><br>
                   무슨 일인지 묻지 않았다. 손만 보태고 돌아섰다.<br>
                   여기서는 그게 예의다.`
                : `${far ? '달려갔다.<br><br>' : ''}늦었거나, 모자랐다.<br><br>
                   ${c.name} 사원이 혼자 하고 있다.<br>거들려다 오히려 방해가 됐다.`),
            epicBar() + darkChoiceBtn('물러선다.', 'epicMap()'));
    });
}

// ==========================================
// 4. 즉사 기믹과 구제
// ==========================================
function epicDoom(cfg) {
    if (!er || er.dead) return;
    cfg = cfg || {};
    er._doomCfg = cfg;

    // 혼자면 구제 없음
    if (!darkRun.isParty || !database) {
        darkBodyEl().innerHTML = darkBox(cfg.title || '—',
            (cfg.text || '') + `<br><br><span style="color:#ff6b6b;">부를 사람이 없다.</span>`,
            epicBar() + darkChoiceBtn('—', `epicDoomFail()`));
        return;
    }

    const id = currentUser.code;
    const sec = cfg.sec || 70;
    database.ref(`darkParties/${darkRun.partyId}/epicDoom/${id}`).set({
        name: currentUser.name,
        job: EPIC_JOBS[er.job].name,
        place: er.place,
        placeName: EPIC_PLACES[er.place].name,
        what: cfg.what || '위험합니다',
        need: cfg.need || 'bond',
        dc: cfg.dc || 13,
        until: Date.now() + sec * 1000,
        at: Date.now()
    });
    sendPartyChat(`⚠⚠ ${currentUser.name} 사원 — ${EPIC_PLACES[er.place].name}. ${cfg.what || '위험합니다'}`, true);

    let left = sec;
    er._doomTick = setInterval(() => {
        left--;
        const el = document.getElementById('doom-left');
        if (el) el.innerText = left;
        if (left <= 0) { clearInterval(er._doomTick); epicDoomFail(); }
    }, 1000);

    database.ref(`darkParties/${darkRun.partyId}/epicDoom/${id}`).on('value', s => {
        if (s.val()) return;
        database.ref(`darkParties/${darkRun.partyId}/epicDoom/${id}`).off();
        clearInterval(er._doomTick);
        if (er && !er.dead) epicDoomSaved();
    });

    darkBodyEl().innerHTML = darkBox(cfg.title || '—', cfg.text || '',
        epicBar() +
        `<div style="text-align:center; padding:16px; background:rgba(127,0,0,0.2); border:1px solid #b71c1c; border-radius:6px;">
            <div style="font-size:12px; color:#ff6b6b; font-weight:bold; margin-bottom:6px;">손을 뻗을 수 있는 시간</div>
            <div style="font-size:30px; font-weight:bold; color:#fff;"><span id="doom-left">${left}</span><span style="font-size:14px; color:#888;">초</span></div>
            <div style="font-size:10px; color:#aaa; margin-top:8px; line-height:1.6;">
                동료가 오면 살아납니다.<br>아무도 못 오면 여기서 끝납니다.
            </div>
         </div>`);
    mountDarkChat('normal');
}

function epicDoomSaved() {
    if (!er) return;
    er.score += 500;
    darkBodyEl().innerHTML = darkBox('—',
        (er._doomCfg && er._doomCfg.savedText) ||
        `팔이 잡힌다.<br><br>
         끌어내는 힘이 세다. 어깨가 빠질 것 같았다.<br>
         빠지는 편이 나았다.<br><br>
         바닥에 끌려 나와 한참 누워 있었다.<br>
         고맙다는 말은 나중에 하기로 한다.`,
        epicBar() + darkChoiceBtn('일어선다.', 'epicMap()'));
}

function epicDoomFail() {
    if (!er || er.dead) return;
    if (er._doomTick) clearInterval(er._doomTick);
    if (database && darkRun.isParty) {
        database.ref(`darkParties/${darkRun.partyId}/epicDoom/${currentUser.code}`).off();
        database.ref(`darkParties/${darkRun.partyId}/epicDoom/${currentUser.code}`).remove();
    }
    const cfg = er._doomCfg || {};
    er._calledHelp = true;   // 구제 절차를 이미 거쳤으므로 바로 끝낸다
    epicDeath(cfg.dieText || `거기서 끝났다.`);
}

// 구하러 가는 쪽
function epicDoomRescue(code) {
    if (!er || !database) return;
    const ref = database.ref(`darkParties/${darkRun.partyId}/epicDoom/${code}`);
    ref.once('value').then(s => {
        const d = s.val();
        if (!d) { showCustomAlert('이미 끝났습니다.'); epicMap(); return; }
        if (Date.now() > d.until) { showCustomAlert('늦었습니다.'); epicMap(); return; }

        const far = d.place !== er.place;
        if (far) { er.place = d.place; er.moved++; }

        const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
        const bonus = rollDarkBonus(d.need || 'bond')
                    + (epicAttr() === 'bond' ? 3 : 0)
                    + Math.round(gearValue(currentUser, 'heal') * 10);
        const dc = (d.dc || 13) + (far ? 2 : 0);
        const ok = roll !== 1 && (roll + bonus) >= dc;

        if (ok) {
            ref.remove();
            er.score += 1500;
            er.helped++;
            darkRun.success++;
            sendPartyChat(`${currentUser.name} 사원이 ${d.name} 사원을 끌어냈습니다.`, true);

            darkBodyEl().innerHTML = darkBox('구제',
                `<div style="text-align:center; font-size:26px; font-weight:bold; color:#4CAF50; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 +${bonus} / DC ${dc})</span></div>
                 ${far ? '달렸다. 가는 동안 길이 두 번 바뀌었다.<br><br>' : ''}
                 팔을 잡았다. 잡히는 게 팔이 맞는지 확인할 겨를이 없었다.<br><br>
                 끌어냈다. 둘 다 바닥에 넘어졌다.<br>
                 일어서기 전에 서로 한 번 봤다. 그걸로 충분했다.`,
                epicBar() + darkChoiceBtn('일으켜 세운다.', 'epicMap()'));
        } else {
            darkRun.fail++;
            sendPartyChat(`${currentUser.name} 사원이 ${d.name} 사원에게 닿지 못했습니다.`, true);
            ref.remove();

            darkBodyEl().innerHTML = darkBox('구제',
                `<div style="text-align:center; font-size:26px; font-weight:bold; color:#f44336; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 +${bonus} / DC ${dc})</span></div>
                 ${far ? '달렸다. 늦었다.<br><br>' : ''}
                 손이 닿았다. 닿았는데 놓지 않는다.<br><br>
                 끌어내려는 쪽과 끌려 들어가는 쪽의 힘이 비슷하면,<br>
                 둘 다 안쪽으로 간다.<br><br>
                 <span style="color:#ff6b6b;">발이 미끄러진다.</span>`,
                epicBar() + darkChoiceBtn('—', `epicDoomChain('${d.name}')`));
        }
    });
}

function epicDoomChain(name) {
    if (!er || er.dead) return;
    er._calledHelp = true;
    epicDeath(`${name} 사원을 잡은 손을 끝내 놓지 못했다.<br><br>
        같이 끌려 들어갔다.<br>
        마지막에 누가 누구를 잡고 있었는지는 모르겠다.`);
}

// ==========================================
// 배너 — 구제 요청과 손 청함
// ==========================================
(function hookBanners() {
    const _epicWatchHelp = epicWatchHelp;
    epicWatchHelp = function () {
        _epicWatchHelp.apply(this, arguments);
        if (!darkRun || !darkRun.isParty || !database || !er || er._coWatch) return;
        er._coWatch = true;
        database.ref(`darkParties/${darkRun.partyId}/epicDoom`).on('value', s => {
            er.doom = s.val() || {};
            const b = document.getElementById('epic-help-box');
            if (b) b.outerHTML = epicHelpBanner();
        });
        database.ref(`darkParties/${darkRun.partyId}/epicCo`).on('value', s => {
            er.co = s.val() || {};
            const b = document.getElementById('epic-help-box');
            if (b) b.outerHTML = epicHelpBanner();
        });
    };

    const _epicHelpBanner = epicHelpBanner;
    epicHelpBanner = function () {
        const base = _epicHelpBanner.apply(this, arguments).replace('<div id="epic-help-box">', '').replace(/<\/div>$/, '');

        const doom = Object.keys(er.doom || {}).filter(c => c !== currentUser.code)
            .filter(c => er.doom[c] && Date.now() < er.doom[c].until);
        const co = Object.keys(er.co || {}).filter(id => er.co[id] && er.co[id].by !== currentUser.code && er.co[id].state === 'OPEN');

        let html = `<div id="epic-help-box">` + base;

        doom.forEach(c => {
            const d = er.doom[c];
            const left = Math.max(0, Math.round((d.until - Date.now()) / 1000));
            html += `
                <div style="background:rgba(127,0,0,0.3); border:2px solid #ff1744; border-radius:6px; padding:12px; margin-bottom:9px;">
                    <div style="font-size:12px; color:#ff1744; font-weight:bold;">⚠⚠ ${d.name} · ${d.job}</div>
                    <div style="font-size:10px; color:#ddd; margin:5px 0 8px 0; line-height:1.6;">
                        ${d.placeName} — ${d.what}<br>
                        <span style="color:#ff6b6b; font-weight:bold;">남은 시간 ${left}초</span>
                        ${d.place === er.place ? ' <span style="color:#4CAF50;">· 같은 곳</span>' : ' <span style="color:#888;">· 달려가야 한다</span>'}
                    </div>
                    <div style="font-size:9px; color:#aaa; margin-bottom:7px;">실패하면 이쪽도 함께 끌려갑니다.</div>
                    <button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:11px; background:linear-gradient(145deg,#b71c1c,#7f0000) !important; border-color:#ff1744 !important; color:#fff !important;" onclick="epicDoomRescue('${c}')">끌어낸다</button>
                </div>`;
        });

        co.forEach(id => {
            const c = er.co[id];
            html += `
                <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:6px; padding:11px; margin-bottom:9px;">
                    <div style="font-size:11px; color:#d4af37; font-weight:bold;">✋ ${c.name} · ${c.job}</div>
                    <div style="font-size:10px; color:#ccc; margin:4px 0 7px 0; line-height:1.6;">
                        ${c.placeName} — ${c.ask}
                    </div>
                    <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;" onclick="epicCoAnswer('${id}')">손을 보탠다</button>
                </div>`;
        });

        return html + `</div>`;
    };
})();

// 정리
(function hookFinish() {
    const _epicFinish = epicFinish;
    epicFinish = function () {
        if (er && er._doomTick) clearInterval(er._doomTick);

        if (typeof clearDarkRunState === 'function') clearDarkRunState();
        else if (database && currentUser) database.ref('darkRuns/' + currentUser.code).remove();


        const pid = darkRun ? darkRun.partyId : null;
        if (pid && database) {
            try {
                database.ref(`darkParties/${pid}/epicDoom`).off();
                database.ref(`darkParties/${pid}/epicCo`).off();
                database.ref(`darkParties/${pid}/epicDoom/${currentUser.code}`).remove();
            } catch (e) {}
        }
        return _epicFinish.apply(this, arguments);
    };
})();