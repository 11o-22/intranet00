// ==========================================
// ★ Qtrew-???-■■■ — 1차 뼈대
// index.html 에서 solo-s003.js 다음에 불러온다
// ==========================================
//
// 직업 24종 · 속성 8종 × 3 · 지도 이동 · 개인 목표 · 동료 구조
// 정해진 결말 없음. 목표를 이루면 그 자리에서 정산하고 빠져나온다.
// 장소별 본편은 2차 파일에서 채운다.

const EPIC_CODE = 'Qtrew-???-■■■';

// ==========================================
// 구역 등록
// ==========================================
DARK_ZONES[EPIC_CODE] = {
    code: EPIC_CODE, grade: '?', name: '■■의 ■■■',
    brief: '(기록이 오래되어 대부분 읽히지 않습니다.)',
    warn: '장시간 탐사 — 중도 이탈 가능',
    danger: '가늠 불가', survival: '??%', min: 1, max: 24,
    reward: [300, 25000], ready: false, epic: true,
    intro: `문이 아니다. 문이 있던 자리다.<br><br>
        돌이 무너져 아치만 남았고, 그 너머가 밝다.<br>
        밝은데 해는 없다.<br><br>
        발을 들이자 등 뒤에서 소리가 난다.<br>
        돌이 제자리로 돌아가는 소리다. 천천히, 빠짐없이.<br><br>
        벽에 글자가 새겨져 있다. 대부분 깎여 나갔다.<br>
        <span style="color:#d4af37;">"■■이 ■■를 ■■하던 시절의 ■■■"</span><br><br>
        읽을 수 있는 글자는 둘뿐이다.<br>
        <span style="color:#d4af37;">"영웅"</span>`,
    outro: `돌아 나온다.<br><br>
        아치가 다시 무너져 있다. 들어갈 때와 같은 모양으로.<br>
        손에 쥔 것이 있다. 여기 것이 아닌데 여기 것 같다.<br><br>
        눈을 뜨니 복도다.<br>
        한동안 오래된 이야기를 들으면 목이 말랐다.`,
    images: { intro:'epic_1.jpg', step1:'epic_2.jpg', step2:'epic_3.jpg', step3:'epic_4.jpg', step4:'epic_5.jpg' }
};

// ==========================================
// 직업 24종
// ==========================================
const EPIC_JOBS = {
    // ✦ 회피
    thief:    { name:'도적',     icon:'🗝', attr:'evade', desc:'잠긴 것을 열고, 열린 것은 그냥 지나친다.',
                start:'market', goal:{ id:'g_thief',  text:'성의 금고에서 이름이 적힌 열쇠를 꺼낸다.', grade:2 } },
    jester:   { name:'광대',     icon:'🃏', attr:'evade', desc:'웃기면 살고, 웃기면 죽는다.',
                start:'castle', goal:{ id:'g_jester', text:'왕의 앞에서 한 번 웃게 만든다.', grade:2 } },
    spy:      { name:'밀정',     icon:'🕵', attr:'evade', desc:'양쪽에 이름이 있고, 어느 쪽도 본명이 아니다.',
                start:'castle', goal:{ id:'g_spy',    text:'두 진영의 전언을 모두 전달한다.', grade:3 } },

    // ✧ 파괴
    swordsman:{ name:'검사',     icon:'⚔', attr:'break', desc:'베는 법만 배웠고, 그것으로 충분했다.',
                start:'ruin',   goal:{ id:'g_sword',  text:'봉인된 문을 베어 연다.', grade:2 } },
    smith:    { name:'대장장이', icon:'🔨', attr:'break', desc:'만드는 손이 부수는 법도 안다.',
                start:'market', goal:{ id:'g_smith',  text:'부러진 명검을 다시 잇는다.', grade:3 } },
    warden:   { name:'파수꾼',   icon:'🛡', attr:'break', desc:'막는 것이 본분이고, 막다 죽는 것도 본분이다.',
                start:'gate',   goal:{ id:'g_warden', text:'성문을 한 번 지켜 낸다.', grade:3 } },

    // ❋ 치유
    priest:   { name:'사제',     icon:'✝', attr:'heal',  desc:'기도가 듣는지는 모르지만 계속한다.',
                start:'temple', goal:{ id:'g_priest', text:'말라붙은 성수를 다시 흐르게 한다.', grade:3 } },
    herbal:   { name:'약초꾼',   icon:'🌿', attr:'heal',  desc:'숲에서 자란 것은 숲에서 쓴다.',
                start:'forest', goal:{ id:'g_herbal', text:'전설의 약초를 찾아 달인다.', grade:2 } },
    midwife:  { name:'산파',     icon:'🕯', attr:'heal',  desc:'처음 우는 소리를 가장 많이 들은 사람.',
                start:'village',goal:{ id:'g_midwife',text:'마을에서 아이 하나를 받아 낸다.', grade:2 } },

    // ✺ 행운
    fisher:   { name:'낚시꾼',   icon:'🎣', attr:'luck',  desc:'기다리는 데는 이골이 났다.',
                start:'lake',   goal:{ id:'g_fisher', text:'말하는 물고기를 낚는다.', grade:2 } },
    gambler:  { name:'도박사',   icon:'🎲', attr:'luck',  desc:'잃은 것을 세지 않는 편이 오래 산다.',
                start:'market', goal:{ id:'g_gambler',text:'판에서 한 번 전부 딴다.', grade:2 } },
    bard:     { name:'음유시인', icon:'🎻', attr:'luck',  desc:'노래로 남지 않으면 없었던 일이 된다.',
                start:'village',goal:{ id:'g_bard',   text:'아무도 모르는 노래를 한 곡 완성한다.', grade:3 } },

    // ◈ 감각
    archer:   { name:'궁수',     icon:'🏹', attr:'sense', desc:'멀리 보는 눈이 먼저고 손은 나중이다.',
                start:'gate',   goal:{ id:'g_archer', text:'보이지 않는 것을 맞힌다.', grade:3 } },
    hunter:   { name:'사냥꾼',   icon:'🐗', attr:'sense', desc:'발자국만 보고도 며칠 전인지 안다.',
                start:'forest', goal:{ id:'g_hunter', text:'숲의 주인을 추적해 마주한다.', grade:3 } },
    seer:     { name:'점성술사', icon:'🔮', attr:'sense', desc:'하늘을 읽지만 하늘은 읽어 주지 않는다.',
                start:'tower',  goal:{ id:'g_seer',   text:'사라진 별자리 하나를 다시 그린다.', grade:3 } },

    // ◐ 은신
    assassin: { name:'암살자',   icon:'🗡', attr:'hide',  desc:'이름을 남기지 않는 것이 실력이다.',
                start:'castle', goal:{ id:'g_assassin',text:'아무에게도 들키지 않고 성을 관통한다.', grade:3 } },
    poacher:  { name:'밀렵꾼',   icon:'🪤', attr:'hide',  desc:'금지된 곳에만 좋은 것이 있다.',
                start:'forest', goal:{ id:'g_poacher',text:'금렵구에서 산 채로 하나 얻어 나온다.', grade:2 } },
    digger:   { name:'도굴꾼',   icon:'⛏', attr:'hide',  desc:'죽은 자는 항의하지 않는다. 대개는.',
                start:'grave',  goal:{ id:'g_digger', text:'왕의 부장품을 하나 꺼낸다.', grade:3 } },

    // ⊙ 연결
    merchant: { name:'상인',     icon:'⚖', attr:'bond',  desc:'값이 붙지 않는 것은 없다고 믿는다.',
                start:'market', goal:{ id:'g_merch',  text:'값이 없는 것에 값을 매겨 판다.', grade:2 } },
    courier:  { name:'전령',     icon:'📜', attr:'bond',  desc:'내용을 읽지 않는 것이 규칙이다.',
                start:'road',   goal:{ id:'g_courier',text:'끊긴 길 너머로 편지를 전한다.', grade:2 } },
    driver:   { name:'마부',     icon:'🐎', attr:'bond',  desc:'말이 먼저 알고 사람이 나중에 안다.',
                start:'road',   goal:{ id:'g_driver', text:'누구도 지나지 못한 다리를 건넌다.', grade:3 } },

    // ❂ 응시
    mage:     { name:'마법사',   icon:'✨', attr:'gaze',  desc:'읽은 것이 많아 잊는 법을 잊었다.',
                start:'tower',  goal:{ id:'g_mage',   text:'탑 꼭대기의 문장을 끝까지 읽는다.', grade:3 } },
    scribe:   { name:'서기',     icon:'🖋', attr:'gaze',  desc:'적히지 않은 일은 일어나지 않은 일이다.',
                start:'temple', goal:{ id:'g_scribe', text:'지워진 연대기 한 줄을 복원한다.', grade:3 } },
    keeper:   { name:'묘지기',   icon:'⚰', attr:'gaze',  desc:'이름을 세는 것이 일이다.',
                start:'grave',  goal:{ id:'g_keeper', text:'이름 없는 무덤에 이름을 준다.', grade:2 } }
};

const EPIC_ATTR_NAME = { evade:'회피', break:'파괴', heal:'치유', luck:'행운',
                         sense:'감각', hide:'은신', bond:'연결', gaze:'응시' };
const EPIC_ATTR_ICON = { evade:'✦', break:'✧', heal:'❋', luck:'✺',
                         sense:'◈', hide:'◐', bond:'⊙', gaze:'❂' };

// ==========================================
// 지도
// ==========================================
// open: 이 장소에 들어갈 수 있는 속성 (없으면 전원)
const EPIC_PLACES = {
    gate:    { name:'무너진 성문', icon:'🏛', risk:1, open:null,
               desc:'아치만 남았다. 들어온 자리이자 나가는 자리다.' },
    road:    { name:'끊긴 길',     icon:'🛤', risk:1, open:['bond','luck'],
               desc:'중간이 사라졌다. 사라진 자리에 안개가 고여 있다.' },
    village: { name:'빈 마을',     icon:'🏚', risk:2, open:null,
               desc:'사람이 없는데 굴뚝에서 연기가 난다.' },
    market:  { name:'열린 장터',   icon:'⚖', risk:2, open:['bond','luck','evade'],
               desc:'파는 사람은 있는데 사는 사람이 없다.' },
    forest:  { name:'검은 숲',     icon:'🌲', risk:3, open:['sense','hide','heal'],
               desc:'나무가 전부 같은 방향으로 기울어 있다.' },
    lake:    { name:'거울 호수',   icon:'🌊', risk:3, open:['luck','heal','gaze'],
               desc:'비친 하늘이 실제 하늘과 다르다.' },
    temple:  { name:'무너진 신전', icon:'⛪', risk:3, open:['heal','gaze'],
               desc:'제단은 깨졌는데 촛불은 켜져 있다.' },
    grave:   { name:'이름 없는 묘', icon:'⚰', risk:4, open:['hide','gaze'],
               desc:'비석이 전부 백지다. 깎인 게 아니라 원래 그랬다.' },
    ruin:    { name:'폐허 회랑',   icon:'🏚', risk:4, open:['break','evade','sense'],
               desc:'기둥이 서 있는데 지붕이 없다. 지붕이 있던 적도 없어 보인다.' },
    tower:   { name:'기울어진 탑', icon:'🗼', risk:5, open:['gaze','sense'],
               desc:'계단이 안쪽이 아니라 바깥으로 돈다.' },
    castle:  { name:'잠긴 성',     icon:'🏰', risk:5, open:['evade','hide','bond'],
               desc:'문이 안에서 잠겼다. 안에 아무도 없는데.' },
    deep:    { name:'■■■',        icon:'❓', risk:6, open:null, hidden:true,
               desc:'여기부터는 지도에 없다.' }
};

// 장소별 장면은 2차 파일에서 채운다
const EPIC_SCENES = {};

// ==========================================
// 진행 상태
// ==========================================
let er = null;

function epicIsHere() {
    return darkRun && darkRun.zone === EPIC_CODE;
}

function epicAttr() {
    return er && EPIC_JOBS[er.job] ? EPIC_JOBS[er.job].attr : null;
}

function epicCanEnter(key) {
    const p = EPIC_PLACES[key];
    if (!p) return false;
    if (p.hidden && !(er.flags && er.flags.deepFound)) return false;
    if (!p.open) return true;
    return p.open.includes(epicAttr());
}

// ==========================================
// 입장 — 직업 선택
// ==========================================
function epicStart(isParty, pid) {
    darkRun = {
        zone: EPIC_CODE, step: 0, modifier: 0, success: 0, fail: 0,
        carryEquips: [], carryItems: [], lostItems: [], log: [],
        isParty: !!isParty, partyId: pid || null,
        isLeader: false, counted: true, epic: true
    };
    er = {
        job: null, place: 'gate', idx: 0, moved: 0,
        score: 0, found: [], flags: {}, goalDone: false,
        helped: 0, danger: null, started: Date.now()
    };

    currentUser.darkDate = getTodayStr();
    currentUser.darkTries = (currentUser.darkTries || 0) + 1;
    applyDarkSatiety(EPIC_CODE);
    saveFields({ darkDate:1, darkTries:1, satiety:1 });

    if (typeof clearDarkRunState === 'function') clearDarkRunState();
   
    darkAmbienceStart(EPIC_CODE);
    openDarkOverlay();
    const el = document.getElementById('dro-code');
    if (el) el.innerText = EPIC_CODE;

    epicJobPick();
}

function epicJobPick() {
    const taken = epicTakenJobs();
    const byAttr = {};
    Object.keys(EPIC_JOBS).forEach(k => {
        const j = EPIC_JOBS[k];
        (byAttr[j.attr] = byAttr[j.attr] || []).push(k);
    });

    const html = Object.keys(byAttr).map(a => `
        <div style="margin-bottom:11px;">
            <div style="font-size:10px; color:#d4af37; font-weight:bold; margin-bottom:5px;">
                ${EPIC_ATTR_ICON[a]} ${EPIC_ATTR_NAME[a]}
                ${gearValue(currentUser, a) > 0 ? `<span style="color:#4CAF50; font-size:9px; margin-left:5px;">장비 보정 있음</span>` : ''}
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
        </div>`).join('');

    darkBodyEl().innerHTML = darkBox('배역', DARK_ZONES[EPIC_CODE].intro +
        `<br><br><div style="border-top:1px dashed #333; padding-top:12px;">
            맡을 자리를 고른다.<br>
            <span style="font-size:11px; color:#888;">같은 자리는 둘이 맡을 수 없다. 자리마다 갈 수 있는 곳이 다르다.</span>
         </div>`,
        html, 'intro');
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicTakenJobs() {
    const out = {};
    if (!darkRun.isParty) return out;
    const p = darkParties[darkRun.partyId];
    const jobs = (p && p.epicJobs) || {};
    Object.keys(jobs).forEach(c => {
        if (c === currentUser.code) return;
        const nm = (p.members && p.members[c]) ? p.members[c].name : safeName(c);
        out[jobs[c]] = nm;
    });
    return out;
}

function epicPickJob(k) {
    if (!er || er.job) return;
    const j = EPIC_JOBS[k];
    if (!j) return;

    if (darkRun.isParty && database) {
        database.ref(`darkParties/${darkRun.partyId}/epicJobs`).transaction(cur => {
            cur = cur || {};
            if (Object.values(cur).includes(k) && cur[currentUser.code] !== k) return;
            cur[currentUser.code] = k;
            return cur;
        }).then(res => {
            if (!res.committed) { showCustomAlert('방금 다른 사원이 맡았습니다.'); epicJobPick(); return; }
            epicAfterJob(k);
        });
    } else {
        epicAfterJob(k);
    }
}

function epicAfterJob(k) {
    er.job = k;
    er.place = EPIC_JOBS[k].start;
    const j = EPIC_JOBS[k];
    darkRun.log.push(`[배역] ${j.name}`);
    if (darkRun.isParty) sendPartyChat(`${currentUser.name} 사원이 ${j.name}의 자리를 맡았습니다.`, true);

    darkBodyEl().innerHTML = darkBox('배역',
        `자리가 정해진다.<br><br>
         옷이 바뀐 것은 아니다. 다만 손이 무언가를 쥐던 모양으로 굳는다.<br><br>
         <div style="background:rgba(212,175,55,0.1); border:1px solid #5a4a2a; border-radius:6px; padding:14px; text-align:center;">
            <div style="font-size:30px; margin-bottom:8px;">${j.icon}</div>
            <div style="font-size:16px; color:#d4af37; font-weight:bold;">${j.name}</div>
            <div style="font-size:11px; color:#888; margin-top:4px;">${j.desc}</div>
            <div style="margin-top:12px; padding-top:10px; border-top:1px dashed #5a4a2a; font-size:11px; color:#ccc;">
                ${EPIC_ATTR_ICON[j.attr]} <b>${EPIC_ATTR_NAME[j.attr]}</b> 쪽 일에 손이 익다.<br>
                <span style="font-size:10px; color:#888;">그 속성의 전용 장비가 있으면 유리하다.</span>
            </div>
         </div>
         <div style="background:rgba(0,0,0,0.3); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-top:10px;">
            <div style="font-size:10px; color:var(--theme-focus); font-weight:bold; margin-bottom:5px;">◇ 하려던 일</div>
            <div style="font-size:12px; color:#ddd; line-height:1.7;">${j.goal.text}</div>
            <div style="font-size:10px; color:#888; margin-top:6px;">이루면 그 자리에서 빠져나올 수 있다. 더 머물러도 된다.</div>
         </div>`,
        epicBar() + darkChoiceBtn('걸음을 옮긴다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// ==========================================
// 상태 표시
// ==========================================
function epicBar() {
    if (!er) return '';
    const j = EPIC_JOBS[er.job];
    const p = EPIC_PLACES[er.place];
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#888; margin-bottom:10px; padding:7px 10px; background:rgba(0,0,0,0.3); border-radius:5px;">
            <span>${j ? j.icon + ' ' + j.name : ''} <span style="color:#555;">·</span> ${p ? p.icon + ' ' + p.name : ''}</span>
            <span style="color:var(--theme-focus); font-weight:bold;">${er.score.toLocaleString()} P</span>
        </div>
        ${er.goalDone ? `<div style="font-size:10px; color:#4CAF50; margin:-4px 0 10px 0;">◇ 하려던 일을 이뤘다. 언제든 나갈 수 있다.</div>` : ''}`;
}

// ==========================================
// 지도 — 갈림길
// ==========================================
function epicMap() {
    if (!er) return;
    epicWatchHelp();

        if (database) {
        database.ref('darkRuns/' + currentUser.code).set({
            zone: EPIC_CODE, step: 0, savedAt: Date.now(),
            success: darkRun.success, fail: darkRun.fail,
            log: darkRun.log.slice(-20), lostItems: [],
            isParty: !!darkRun.isParty, partyId: darkRun.partyId || null,
            epic: true
        });
    }

    const cur = EPIC_PLACES[er.place];
    const list = Object.keys(EPIC_PLACES).filter(k => k !== er.place && epicCanEnter(k));

    const help = epicHelpBanner();

    darkBodyEl().innerHTML = darkBox(cur.icon + ' ' + cur.name,
        `${cur.desc}<br><br>
         길이 여럿이다. 갈 수 있는 곳만 보인다.<br>
         <span style="font-size:11px; color:#888;">맡은 자리에 따라 열리는 길이 다르다.</span>`,
        epicBar() + help +
        `<button class="game-btn" style="width:100%; margin:0 0 10px 0; padding:12px; background:linear-gradient(145deg,#3a2f18,#1c1608) !important; border-color:#5a4a2a !important; color:#d4af37 !important;" onclick="epicEnter()">${cur.icon} 이곳을 더 살핀다</button>
         <div style="font-size:10px; color:#666; margin-bottom:6px;">— 다른 곳으로 —</div>` +
        list.map(k => {
            const p = EPIC_PLACES[k];
            return `<button class="game-btn" style="width:100%; margin:0 0 6px 0; padding:10px; text-align:left; font-size:12px; font-weight:normal;" onclick="epicMove('${k}')">
                ${p.icon} ${p.name}
                <span style="font-size:10px; color:#888; margin-left:5px;">위험 ${'●'.repeat(p.risk)}</span>
            </button>`;
        }).join('') +
        (er.goalDone
            ? `<button class="game-btn" style="width:100%; margin:10px 0 0 0; padding:12px; background:linear-gradient(145deg,#2e7d32,#1b5e20) !important; border-color:#1b5e20 !important; color:#fff !important;" onclick="epicSettle('goal')">◇ 여기서 빠져나간다</button>`
            : ''),
        cur.img || null);
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicMove(k) {
    if (!er) return;
    er.place = k;
    er.moved++;
    er.idx = 0;
    darkRun.log.push(`[이동] ${EPIC_PLACES[k].name}`);
    epicMap();
}

// ==========================================
// 장소 진입 — 2차 파일이 채울 자리
// ==========================================
function epicEnter() {
    if (!er) return;
    const key = er.place;
    const set = EPIC_SCENES[key];

    if (!set || set.length === 0) { epicStub(); return; }

    const sc = set[er.idx % set.length];
    if (typeof sc === 'function') { sc(); return; }
    epicScene(sc);
}

// 아직 채우지 않은 장소 (임시 진행)
function epicStub() {
    const p = EPIC_PLACES[er.place];
    const j = EPIC_JOBS[er.job];
    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus(j.attr);
    const dc = 8 + p.risk * 2;
    const ok = roll !== 1 && (roll + bonus) >= dc;

    if (ok) { er.score += 120 * p.risk; darkRun.success++; }
    else { darkRun.fail++; applyPollutionToUser(currentUser, p.risk); }

    // 목표 진척
    if (!er.goalDone && ok && j.goal && er.place === j.start && Math.random() < 0.35) {
        er.goalDone = true;
        er.score += j.goal.grade * 1500;
    }

    darkBodyEl().innerHTML = darkBox(p.icon + ' ' + p.name,
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>` +
        (ok
            ? `${j.name}의 눈으로 본다.<br><br>남들이 못 보는 게 보인다.<br>여기서 쓸 만한 것을 하나 챙겼다.`
            : `헛걸음이다.<br><br>여기는 ${j.name}의 자리가 아니다.<br>그걸 확인하는 데도 대가가 든다.`) +
        (er.goalDone ? `<br><br><span style="color:#4CAF50; font-weight:bold;">◇ 하려던 일을 이뤘다.</span>` : ''),
        epicBar() + darkChoiceBtn('물러난다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// 2차 파일이 쓰는 공용 장면 렌더
function epicScene(sc) {
    const p = EPIC_PLACES[er.place];
    darkBodyEl().innerHTML = darkBox(sc.title || (p.icon + ' ' + p.name), sc.text,
        epicBar() + (sc.opts || []).map((o, i) =>
            darkChoiceBtn(o.l, `epicPick(${i})`)).join(''),
        sc.img || null);
    er._sc = sc;
    if (darkRun.isParty) mountDarkChat('normal');
}

function epicPick(i) {
    const sc = er._sc;
    if (!sc) return;
    const o = sc.opts[i];
    const j = EPIC_JOBS[er.job];

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus(o.kind || j.attr);
    const ok = roll !== 1 && (roll + bonus) >= (o.dc || 11);

    if (ok) { darkRun.success++; er.score += o.p || 150; }
    else { darkRun.fail++; if (o.poll) applyPollutionToUser(currentUser, o.poll); }

    if (o.flag) er.flags[o.flag] = true;
    if (o.goal && ok) { er.goalDone = true; er.score += j.goal.grade * 1500; }
    if (o.die && !ok) { epicDeath(o.dieTxt || '거기서 끝났다.'); return; }

    er.idx++;
    darkBodyEl().innerHTML = darkBox((sc.title || '') + ' — 결과',
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${o.dc || 11})</span></div>` +
        (ok ? o.good : o.bad) +
        (o.goal && ok ? `<br><br><span style="color:#4CAF50; font-weight:bold;">◇ 하려던 일을 이뤘다.</span>` : ''),
        epicBar() + darkChoiceBtn('계속한다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// ==========================================
// 동료 구조
// ==========================================
function epicCallHelp(reason) {
    if (!darkRun.isParty || !database) return false;
    const p = darkParties[darkRun.partyId];
    const others = p && p.alive ? Object.keys(p.alive).filter(c => c !== currentUser.code) : [];
    if (others.length === 0) return false;

    er.danger = { reason: reason, at: Date.now() };
    database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).set({
        name: currentUser.name,
        job: EPIC_JOBS[er.job].name,
        place: er.place,
        placeName: EPIC_PLACES[er.place].name,
        reason: reason,
        at: Date.now()
    });
    sendPartyChat(`⚠ ${currentUser.name} 사원이 ${EPIC_PLACES[er.place].name}에서 위험합니다.`, true);
    return true;
}

function epicWatchHelp() {
    if (!darkRun || !darkRun.isParty || !database) return;
    if (er._helpWatch) return;
    er._helpWatch = true;
    database.ref(`darkParties/${darkRun.partyId}/epicHelp`).on('value', snap => {
        er.help = snap.val() || {};
        const map = document.getElementById('epic-help-box');
        if (map) map.outerHTML = epicHelpBanner();
    });
}

function epicHelpBanner() {
    const list = Object.keys(er.help || {}).filter(c => c !== currentUser.code);
    if (list.length === 0) return `<div id="epic-help-box"></div>`;

    return `<div id="epic-help-box">` + list.map(c => {
        const h = er.help[c];
        const near = h.place === er.place;
        return `
            <div style="background:rgba(127,0,0,0.18); border:1px solid #b71c1c; border-radius:6px; padding:11px; margin-bottom:9px;">
                <div style="font-size:11px; color:#ff6b6b; font-weight:bold;">⚠ ${h.name} · ${h.job}</div>
                <div style="font-size:10px; color:#ccc; margin:4px 0 7px 0; line-height:1.6;">
                    ${h.placeName}에서 ${h.reason}<br>
                    ${near ? '<span style="color:#4CAF50;">같은 곳에 있다. 바로 갈 수 있다.</span>' : '<span style="color:#888;">달려가려면 한 번 움직여야 한다.</span>'}
                </div>
                <button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px; background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important;" onclick="epicRescue('${c}')">달려간다</button>
            </div>`;
    }).join('') + `</div>`;
}

function epicRescue(code) {
    const h = (er.help || {})[code];
    if (!h) { epicMap(); return; }
    const j = EPIC_JOBS[er.job];
    const far = h.place !== er.place;

    const roll = luckReroll(Math.floor(Math.random() * 20) + 1);
    const bonus = rollDarkBonus('rejoin') + (j.attr === 'bond' ? 3 : 0) + Math.round(gearValue(currentUser, 'heal') * 8);
    const dc = (far ? 14 : 10) + (EPIC_PLACES[h.place] ? EPIC_PLACES[h.place].risk : 0);
    const ok = roll !== 1 && (roll + bonus) >= dc;

    if (far) { er.place = h.place; er.moved++; }

    if (ok) {
        er.helped++;
        er.score += 900;
        darkRun.success++;
        if (database) database.ref(`darkParties/${darkRun.partyId}/epicHelp/${code}`).remove();
        sendPartyChat(`${currentUser.name} 사원이 ${h.name} 사원을 붙잡았습니다.`, true);
    } else {
        darkRun.fail++;
        applyPollutionToUser(currentUser, 6);
    }

    darkBodyEl().innerHTML = darkBox('구조',
        `<div style="text-align:center; font-size:26px; font-weight:bold; color:${ok ? '#4CAF50' : '#f44336'}; margin-bottom:12px;">🎲 ${roll} <span style="font-size:13px; color:#888;">(보정 ${bonus >= 0 ? '+' : ''}${bonus} / DC ${dc})</span></div>` +
        (ok
            ? `${far ? '달린다. 가는 동안 길이 몇 번 바뀌었다.<br><br>' : ''}도착했다.<br><br>
               ${h.name} 사원이 벽을 짚고 서 있다. 손톱이 몇 개 벗겨져 있다.<br>
               아무도 묻지 않았다.`
            : `${far ? '달린다. 길이 늘어난다.<br><br>' : ''}늦었다.<br><br>
               도착했을 때 그 자리에 아무도 없다.<br>
               자국은 있다. 자국만 있다.`),
        epicBar() + darkChoiceBtn('돌아선다.', 'epicMap()'));
    if (darkRun.isParty) mountDarkChat('normal');
}

// 구조받은 쪽
function epicSaved() {
    if (!er) return;
    er.danger = null;
    if (database) database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).remove();
    darkBodyEl().innerHTML = darkBox('—',
        `누가 왔다.<br><br>
         이름을 부르지 않았다. 부를 힘이 없었을 것이다.<br>
         그냥 팔을 잡아 끌어냈다.<br><br>
         고맙다는 말은 나중에 하기로 한다. 나중이 있다면.`,
        epicBar() + darkChoiceBtn('일어선다.', 'epicMap()'));
}

// ==========================================
// 사망
// ==========================================
function epicDeath(txt) {
    if (!er || er.dead) return;

    // 동료가 있으면 한 번은 구조를 기다린다
    if (!er._calledHelp && epicCallHelp('쓰러졌습니다')) {
        er._calledHelp = true;
        darkBodyEl().innerHTML = darkBox('위험', txt +
            `<br><br><span style="color:#ff6b6b;">— 아직 끝나지 않았다.</span>`,
            epicBar() +
            `<div style="text-align:center; font-size:11px; color:#ff6b6b; padding:14px; background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:5px;">
                동료가 오기를 기다리는 중...<br>
                <span style="font-size:10px; color:#888;">아무도 오지 않으면 여기서 끝납니다.</span>
             </div>
             <button class="game-btn" style="width:100%; margin:12px 0 0 0; padding:11px; font-size:11px;" onclick="epicGiveUp()">기다리지 않는다.</button>`);

        // 구조 수신 감시
        if (database) {
            database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).on('value', s => {
                if (!er || er.dead) return;
                if (!s.val() && er._calledHelp) {
                    database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).off();
                    epicSaved();
                }
            });
        }
        setTimeout(() => { if (er && er._calledHelp && !er.dead) epicGiveUp(); }, 90000);
        return;
    }

    er.dead = true;
    darkRun.fail += 2;

    // ★ 행운 — 일부 보존
    const luckRate = gearValue(currentUser, 'luck');
    const saved = luckRate > 0 && Math.random() < luckRate;
    let lostPoints = 0;

    if (saved) {
        const keepRatio = 0.30 + Math.random() * 0.15;
        const kept = Math.floor(currentUser.points * keepRatio);
        lostPoints = currentUser.points - kept;
        currentUser.points = kept;
        er.luckSaved = true;
    } else {
        lostPoints = currentUser.points;
        currentUser.points = 0;
    }

    const lostItems = [];
    [].concat(darkRun.carryEquips || [], darkRun.carryItems || []).forEach(it => {
        removeItemFromInventory(currentUser, it, 1);
        lostItems.push(it);
    });

    er.lostPoints = lostPoints;
    er.lostItems = lostItems;

    // 상담실 · 선녀탕 이송
    currentUser.pollution = 100;
    currentUser.quarantineUntil = Date.now() + (2 * 60 * 60 * 1000);
    currentUser.quarantineExitPollution = 40;
    currentUser.foxRoomAnswered = true;
    appendBadgeNoteToUser(currentUser, `[${EPIC_CODE}] 탐사 중 의식 불명 — 긴급 이송됨`);

    addHistoryLog(currentUser, `[${EPIC_CODE}] 쓰러짐. 포인트 ${lostPoints.toLocaleString()} P 소실${lostItems.length ? ' · 반입품 ' + lostItems.join(', ') + ' 소실' : ''}`);
    saveSelfFull();

    if (database && darkRun.isParty) {
        database.ref(`darkParties/${darkRun.partyId}/epicHelp/${currentUser.code}`).remove();
        database.ref(`darkParties/${darkRun.partyId}/alive/${currentUser.code}`).remove();
        sendPartyChat(`${currentUser.name} 사원의 소식이 끊겼습니다.`, true);
    }

    epicSettle('dead', txt);
}

function epicGiveUp() {
    if (!er) return;
    er._calledHelp = false;
    er.dead = false;
    epicDeath('더 버티지 못했다.');
}

// ==========================================
// 정산
// ==========================================
function epicSettle(how, txt) {
    if (!er || er._settled) return;
    er._settled = true;

    const j = EPIC_JOBS[er.job];
    let total = 300 + er.score;

    // 가산
    total += er.moved * 60;
    total += er.helped * 900;
    total += (er.found || []).length * 400;
    if (er.goalDone) total += 2000;
    if (er.flags && er.flags.deepFound) total += 3000;

    // 오래 남을수록
    const mins = Math.floor((Date.now() - er.started) / 60000);
    total += Math.min(3000, mins * 50);

    if (how === 'dead') total = Math.floor(total * 0.35);
    total = Math.max(300, Math.min(25000, Math.round(total)));

    changePoints(total);
    addHistoryLog(currentUser, `[${EPIC_CODE}] ${j.name}으로 ${how === 'dead' ? '쓰러짐' : '귀환'} (+${total.toLocaleString()} P)`);
    bankAddScore(how === 'dead' ? -5 : 12);

    if (!currentUser.darkLogs) currentUser.darkLogs = [];
    currentUser.darkLogs.unshift({
        date: new Date().toLocaleString(), zone: EPIC_CODE, zoneName: DARK_ZONES[EPIC_CODE].name,
        reward: total, success: darkRun.success, fail: darkRun.fail,
        loot: er.found || [], lost: [], detail: darkRun.log,
        died: how === 'dead', party: !!darkRun.isParty
    });
    if (currentUser.darkLogs.length > 15) currentUser.darkLogs.pop();
    saveFields({ history:1, darkLogs:1 });

    darkBodyEl().innerHTML = darkBox(how === 'dead' ? '종료' : '귀환',
        (txt ? txt + '<br><br>' : '') +
        (how === 'dead' ? '' : DARK_ZONES[EPIC_CODE].outro),
        `<div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:6px; padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">
            <div style="font-weight:bold; color:var(--theme-focus); margin-bottom:8px; border-bottom:1px dashed #444; padding-bottom:6px;">[정산]</div>
            맡은 자리 <b>${j.icon} ${j.name}</b><br>
            하려던 일 <b style="color:${er.goalDone ? '#4CAF50' : '#888'};">${er.goalDone ? '이룸' : '이루지 못함'}</b><br>
            지나온 곳 <b>${er.moved}</b>곳 · 머문 시간 <b>${mins}</b>분<br>
            ${er.helped ? `붙잡은 동료 <b style="color:#4CAF50;">${er.helped}</b>명<br>` : ''}
                       ${how === 'dead' ? `
                <div style="margin-top:6px; padding-top:6px; border-top:1px dashed #7f0000; color:#f44336;">
                    보유 포인트 <b>-${(er.lostPoints || 0).toLocaleString()} P</b> (전액 소실)<br>
                    ${(er.lostItems || []).length ? `반입품 <b>${er.lostItems.join(', ')}</b> 소실<br>` : `<span style="color:#aaa;">반입한 물품이 없어 소실 없음</span><br>`}
                    ${er.luckSaved ? `<span style="color:#4CAF50;">✺ 행운 — 일부를 지켜냈습니다.</span><br>` : ''}
                    오염도 <span style="color:#ff9800;">100%</span>
                    <div style="margin-top:6px; color:#d4af37;">
                        🦊 상담실로 긴급 이송됩니다.<br>
                        <span style="font-size:10px; color:#aaa;">회복 예상 시간 2시간 (퇴원 시 오염도 40%)</span>
                    </div>
                </div>` : ''}
            <div style="margin-top:8px; padding-top:8px; border-top:1px dashed #444;">
                지급 <b style="color:#ffd700; font-size:14px;">+${total.toLocaleString()} P</b>
            </div>
         </div>` +
        darkChoiceBtn('단말로 복귀한다.', 'epicFinish()'));
    showPointGainEffect(total);
}

function epicFinish() {
    const pid = darkRun ? darkRun.partyId : null;
    closeDarkOverlay();
    darkAmbienceStop();
    detachChatListener();
    if (pid && database) {
        try { database.ref(`darkParties/${pid}/epicHelp`).off(); } catch (e) {}
        partyRunCleanup(pid, EPIC_CODE);
    }

        if (typeof clearDarkRunState === 'function') clearDarkRunState();
    else if (database) database.ref('darkRuns/' + currentUser.code).remove();

    
    er = null;
    darkRun = null;
    updateUI();
    renderDarkness();
        hasShownFoxAlert = false;
    currentUser.foxRoomAnswered = false;
    currentUser.quarantineUntil = currentUser.quarantineUntil || 0;
    setTimeout(() => { if (currentUser.pollution >= 100) startFoxRoomSequence(); }, 600);
}

// ==========================================
// 연결
// ==========================================
(function hookEpic() {
    // 진행 분기
    const _renderDarkStep = renderDarkStep;
    renderDarkStep = function () {
        if (darkRun && darkRun.zone === EPIC_CODE) {
            if (!er) { epicStart(darkRun.isParty, darkRun.partyId); return; }
            if (!er.job) { epicJobPick(); return; }
            epicMap();
            return;
        }
        return _renderDarkStep.apply(this, arguments);
    };

    // 입구
    const _renderDarkness = renderDarkness;
    renderDarkness = function () {
        const r = _renderDarkness.apply(this, arguments);
        const body = document.getElementById('darkness-body');
        if (!body || darkRun) return r;
        if (document.getElementById('epic-entry')) return r;
        if (!isZoneOpen(EPIC_CODE)) return r;

        body.insertAdjacentHTML('afterbegin', `
            <div id="epic-entry" style="background:linear-gradient(145deg,#1e1a14,#141110); border:1px solid #5a4a2a; border-radius:8px; padding:14px; margin-bottom:14px; text-align:left;">
                <div style="font-family:monospace; font-size:11px; color:#d4af37; font-weight:bold;">${EPIC_CODE}</div>
                <div style="font-size:15px; color:#fff; font-weight:bold; margin:4px 0;">${DARK_ZONES[EPIC_CODE].name}</div>
                <div style="font-size:10px; color:#999; line-height:1.6;">${DARK_ZONES[EPIC_CODE].brief}</div>
                <div style="font-size:10px; color:#777; margin-top:6px;">1~24인 · 자리 24종 · 보상 300~25,000 P</div>
                <div style="font-size:10px; color:#ff6b6b; margin-top:4px;">※ 쓰러지면 보유 포인트 전액과 반입품이 소멸하고 상담실로 이송됩니다.</div>
                <div style="display:flex; gap:6px; margin-top:11px;">
                    <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="epicSoloEnter()">혼자 들어간다</button>
                    <button class="game-btn" style="flex:1; margin:0; padding:11px; font-size:11px;" onclick="createParty('${EPIC_CODE}')">일행을 모은다</button>
                </div>
            </div>`);
        return r;
    };
})();

function epicSoloEnter() {
    if (darkRun) return;
    if (getDarkTriesLeft() <= 0) { showCustomAlert('금일 탐사 횟수를 모두 소진했습니다.'); return; }
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 들어갈 수 없습니다.'); return; }
    if (currentUser.pollution >= 100) { showCustomAlert('오염도가 한계치라 들어갈 수 없습니다.'); return; }
    epicStart(false, null);
}