// ==========================================
// ★ 「이상한 나라의 ■■■」 — 뼈대 (2026-10-31)
// bundles.json 마지막 묶음 맨 끝 — wonder-text.js 다음, wonder-shop.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   사용자가 노션에 쓰는 이벤트 어둠. 공통 도입부 + 여섯 챕터. 챕터마다 기믹을 겪고
//   미션을 받은 뒤, 그 챕터와 이어지는 기존 어둠(연계판)에 들어가 결말을 본다.
//   지문은 wonder-text.js (원고에서 뽑은 장면 나무 — 손대지 말 것).
//
// ■ 사용자가 정한 규칙 (메모리 /areas/wonderland-dark.md)
//
//   · 단계 몽환(1~2회차) → 어색(3~4) → 피폐(5~6) → 기괴(7~8). 끝까지 마친 회차만 센다.
//   · 회차 = 여섯 챕터 · 여섯 미션. 회차마다 챕터 순서는 무작위(720가지 전부). 사탕 열쇠는 다음 문만 연다.
//   · 미션은 솔로 4 · 팀 8 가운데 무작위, 같은 회차 안에서는 겹치지 않는다(처음부터 다시 해도).
//   · 성공 = 이상한 나라 쪽 ✔ 또는 어둠 쪽 ✔ → 황금빛 열쇠 사탕 + 보상(wonder-reward.js). 실패 = 잃는 것 없이 다음 챕터.
//   · 죽으면 기존처럼 상담실 · 선녀탕. 그 회차는 처음부터.
//   · 챕터를 끝낼 때마다 멈추기 / 잇기 — 팀은 투표. 동률이면 각자 d30(16+) — 실패한 사람은 나오고
//     (다음엔 처음부터) 성공한 사람은 진행. 짝수 인원이 반반으로 갈리면 다시 굴려 반드시 과반.
//   · 멈추면 회차는 그 자리에 남는다 — 다음에 들어오면 남은 챕터부터.
//   · 이 어둠(연계판 포함)에서는 어떤 장비도 통하지 않는다 — 판정 보정 · 즉사 막기 · 행운 · 맹약 전부.
//     도움은 이벤트 샵(wonder-shop.js) 물건뿐.
//   · 팀은 파티장의 회차를 따른다 — 들어온 사람의 회차 기록은 파티의 것으로 맞춘다.
//
// ■ 상태
//   내 기록   users/{사번}/wonder        { rounds, cur:{ rid, order[6], idx, used{ch:[id]}, res{ch} } }
//   내 화면   wonderMe/{방}/{사번}        { sc, st, name, … }
//   함께      wonder/{방}                 { meta, pl, gate, vote, dice, mis, res }
//   방 = 파티 번호, 혼자면 'solo_' + 사번.
//
// ■ 콘솔
//   wonderState()           내 회차 · 화면 · 함께 보는 것
//   wonderReset()           내 회차 기록 지우기 (관리자 · 시험용)
//   wonderEvent(true|false) 이벤트 샵 열기 / 닫기 (관리자)

(function wonderCore() {
'use strict';

const W = 'Qtrew-W-001';
const ADMIN = 'kario0987';
const X = window.WONDER = window.WONDER || {};
X.CODE = W;

// ==========================================
// 챕터 · 미션 (설계표 그대로)
// ==========================================
const CH = {
    angel:    { name: '천사와 악마', door: '흰 깃털과 검은 뿔이 새겨진 문', grade: 'A', link: 'Qtrew-A-214', linkName: '빛을 찾아서' },
    siren:    { name: '세이렌',     door: '진주와 조개껍데기가 달린 문',   grade: 'A', link: 'Qtrew-A-667', linkName: '물고기가 인간이 되었다' },
    vampire:  { name: '뱀파이어',   door: '거울처럼 매끄러운 문',          grade: 'S', link: 'Qtrew-S-018', linkName: '제■■■회 완벽한 피날레' },
    succubus: { name: '서큐버스',   door: '붉은 장미가 얽힌 문',           grade: 'A', link: 'kroom',       linkName: 'K의 방 — 던전의 손님' },
    jiangshi: { name: '강시',       door: '오래된 종이 부적이 붙은 문',    grade: 'S', link: 'Qtrew-S-010', linkName: '검역 실패' },
    wolf:     { name: '늑대인간',   door: '은빛 보름달이 떠오른 문',       grade: 'S', link: 'Qtrew-S-003', linkName: '동화의 뒷면' }
};
const KEYS = ['angel', 'siren', 'vampire', 'succubus', 'jiangshi', 'wolf'];
const MIS = {
    angel: {
        S: ['잃어버린 증거', '묵비권', '내일의 죄', '방청권'],
        T: ['배심원', '판결의 망치', '케이크의 행방', '초대받지 않은 손님', '등불 내기', '박수 갈채', '빈 명패 여섯', '봉인이냐 파괴냐']
    },
    siren: {
        S: ['열두 번째 진주', '손가락 세기', '노래 한 소절', '빈 의자'],
        T: ['진주는 어디에?', '줄 끝의 조개', '깨진 찻잔', '울지 않는 풍경', '그림의 빈자리', '숨 참기 내기', '초대장', '물고기가 인간이 되었다']
    },
    vampire: {
        S: ['주인님의 꽃', '빈 액자', '첫 번째 선물', '기다리는 시간'],
        T: ['세 번의 투표', '오늘 밤의 디저트', '식탁보', '단체 초상화', '명찰 바꿔 달기', '마지막 곡', '아침 해', '가장 귀한 손님']
    },
    succubus: {
        S: ['두고 간 구두', '이름 없는 손님', '얼굴 고르기', '달콤한 도시락'],
        T: ['가면 교환', '빈자리 만찬', '사랑의 회랑', '붉은 장막 너머', '사랑받는다는 것', '끝나지 않는 춤', '시드는 장미', '각성의 밤']
    },
    jiangshi: {
        S: ['잃어버린 방울', '술래의 선물', '안전한 은신처', '새 놀이 친구'],
        T: ['숨은 술래', '새 부적', '방울이 울리는 집', '걸어간 종이 인형', '연꽃 등불', '새 술래 뽑기', '별당의 저녁', '영원한 놀이 친구']
    },
    wolf: {
        S: ['빨간 모자의 마지막 장', '양치기 소년', '셋째 돼지의 벽돌', '찢겨진 늑대의 장'],
        T: ['달님을 깨우지 마세요', '문 열어라', '다시 엮는 책', '양 백 마리', '유리 구두의 주인', '한 입 사과', '세 번째 소원', '잠들지 않는 밤']
    }
};
const STAGES = ['몽환', '어색', '피폐', '기괴'];
function stageOf(rounds) { return Math.min(3, Math.floor((rounds || 0) / 2)); }
function misId(kind, i) { return kind + (i + 1); }            // S1 … T8
function misName(ch, id) {
    const k = id.charAt(0), i = parseInt(id.slice(1), 10) - 1;
    return (MIS[ch] && MIS[ch][k] && MIS[ch][k][i]) || id;
}
X.CH = CH; X.KEYS = KEYS; X.MIS = MIS; X.STAGES = STAGES;
X.misName = misName;

// 챕터 진행을 맡은 파일이 여기에 자기를 건다 — X.chapters[ch] = { run(api) }
X.chapters = X.chapters || {};

// ==========================================
// 구역 등록 — 다 만들어지기 전까지는 관리자만
// ==========================================
if (typeof DARK_ZONES !== 'undefined') {
    DARK_ZONES[W] = {
        code: W, grade: 'A', name: '이상한 나라의 ■■■',
        brief: '(Eat me.)',
        warn: '이벤트 어둠 — 이곳에서는 어떤 장비도 통하지 않습니다.',
        danger: '최상', survival: '?', min: 1, max: 6, reward: [0, 0], ready: false,
        wonder: true,
        intro: '당신은 눈을 뜹니다.',
        outro: '이야기는 계속됩니다.',
        images: {}
    };
}
function isAdmin() { return typeof currentUser !== 'undefined' && currentUser && currentUser.code === ADMIN; }
(function gate() {
    const iv = setInterval(function () {
        if (typeof isZoneOpen !== 'function') return;
        clearInterval(iv);
        const _o = isZoneOpen;
        isZoneOpen = function (code) {
            if (code === W) {
                try { if (darkZoneOverride[W] === true) return true; } catch (e) { }
                return isAdmin();
            }
            return _o.apply(this, arguments);
        };
        try { window.isZoneOpen = isZoneOpen; } catch (e) { }
    }, 50);
})();

// ==========================================
// 모양
// ==========================================
(function css() {
    if (document.getElementById('wd-css')) return;
    const st = document.createElement('style');
    st.id = 'wd-css';
    st.textContent = [
        '.wd-txt{line-height:1.95;}',
        '.wd-sys{color:#d4af37;font-weight:bold;text-align:center;margin:10px 0;font-size:11px;line-height:1.7;}',
        '.wd-note{background:rgba(0,0,0,0.35);border:1px solid #333;border-radius:6px;padding:9px 11px;margin:0 0 12px 0;font-size:11px;line-height:1.8;color:#ccc;}',
        '.wd-bar{display:flex;align-items:center;gap:8px;font-size:10px;color:#9a8;margin:0 0 12px 0;padding:7px 9px;background:rgba(0,0,0,0.3);border:1px solid #2a2a2a;border-radius:5px;}',
        '.wd-bar b{color:#e8d9a8;}',
        '.wd-wait{text-align:center;font-size:11px;color:#888;padding:12px;border:1px dashed #333;border-radius:6px;margin-bottom:10px;line-height:1.8;}',
        '.wd-roll{text-align:center;font-size:26px;font-weight:bold;margin-bottom:12px;}',
        '.wd-roll small{font-size:12px;color:#888;font-weight:normal;}',
        '.wd-adm{border:1px dashed #5a4a2a;border-radius:6px;padding:9px;margin:10px 0;font-size:10px;color:#a98;}'
    ].join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 바탕
// ==========================================
let F = null;          // 내 화면
let S = {};            // 함께 보는 것
let PID = null, ME = null;
let sharedRef = null;
X.F = function () { return F; };
X.S = function () { return S; };

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function now() { return Date.now(); }
function clean(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return null; } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function on() { return !!(F && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W && !darkRun._dead); }
X.on = on;
// 이 어둠 안인가 — 연계판에 들어가 있어도 참
function inW() { return typeof darkRun !== 'undefined' && !!darkRun && (darkRun.zone === W || !!darkRun.wonderLink); }
X.inW = inW;

function hash(s) {
    let h = 2166136261 >>> 0;
    s = String(s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
}
function srand(seed) {
    let a = hash(seed) || 1;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function shuffle(arr, rnd) {
    const a = arr.slice();
    rnd = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
}
X.srand = srand; X.shuffle = shuffle;

function save() {
    if (!F || !PID || !ME) return;
    F.at = now();
    const d = db_();
    if (d) { try { d.ref('wonderMe/' + PID + '/' + ME).set(clean(F)); } catch (e) { } }
    snapRun();
}
X.save = save;
let snapAt = 0;
function snapRun() {
    const d = db_();
    if (!d || !F || F.st !== 'in' || typeof darkRun === 'undefined' || !darkRun || now() - snapAt < 4000) return;
    snapAt = now();
    try {
        d.ref('darkRuns/' + ME).set({
            zone: W, step: 0, savedAt: now(), success: 0, fail: 0, modifier: 0,
            carryEquips: darkRun.carryEquips || [], carryItems: darkRun.carryItems || [],
            log: (darkRun.log || []).slice(-20), lostItems: [],
            isParty: !!darkRun.isParty, isLeader: !!darkRun.isLeader, partyId: darkRun.partyId || null,
            memberCount: darkRun.memberCount || 1, counted: true, wonder: true
        });
    } catch (e) { }
}
function pub(path, v) {
    const d = db_();
    if (!d || !PID) return Promise.resolve();
    try { return d.ref('wonder/' + PID + '/' + path).set(v === undefined ? null : clean(v)); }
    catch (e) { return Promise.resolve(); }
}
function tx(path, fn) {
    const d = db_();
    if (!d || !PID) return Promise.resolve({ committed: false });
    try { return d.ref('wonder/' + PID + '/' + path).transaction(fn); }
    catch (e) { return Promise.resolve({ committed: false }); }
}
X.pub = pub; X.tx = tx;

// Firebase 가 배열을 객체로 돌려줄 때가 있다
function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; }) : []); }
function normRec() {
    const r = rec();
    if (r.cur) {
        r.cur.order = arr(r.cur.order);
        r.cur.used = r.cur.used || {};
        Object.keys(r.cur.used).forEach(function (k) { r.cur.used[k] = arr(r.cur.used[k]); });
        r.cur.res = r.cur.res || {};
        if (r.cur.order.length !== 6) r.cur = null;
    }
}
function normMeta() {
    const m = S.meta;
    if (!m) return;
    m.order = arr(m.order);
    m.used = m.used || {};
    Object.keys(m.used).forEach(function (k) { m.used[k] = arr(m.used[k]); });
}
// 내 회차 기록
function rec() {
    if (!currentUser.wonder) currentUser.wonder = { rounds: 0, cur: null };
    return currentUser.wonder;
}
// 회차를 처음부터 — 같은 회차이므로 이미 받은 미션은 그대로 남긴다 (설계: 처음부터 다시 해도 겹치지 않게)
function restartRound() {
    const r = rec();
    if (!r.cur) return;
    // 열쇠(rid)는 새로 — 함께 보는 곳에 남은 지난 기록과 섞이지 않게. 받은 미션(used)만 이어 간다.
    r.cur = { rid: newRound().rid, order: shuffle(KEYS), idx: 0, used: r.cur.used || {}, res: {}, again: (r.cur.again || 0) + 1 };
}
X.restartRound = restartRound;
function saveRec() {
    const d = db_();
    try { if (d) d.ref('users/' + currentUser.code + '/wonder').set(clean(rec())); } catch (e) { }
}
X.rec = rec;

// ==========================================
// 사람
// ==========================================
function pl() { return S.pl || {}; }
function nameOf(c) {
    const p = pl()[c];
    if (p && p.name) return p.name;
    try { if (db.users && db.users[c]) return db.users[c].name || c; } catch (e) { }
    return c;
}
function isIn(c) { const p = pl()[c]; return !!(p && p.st === 'in' && !p.gone && !p.doom); }
function actives() { return Object.keys(pl()).filter(function (c) { return isIn(c); }).sort(); }
function n0() { return (S.meta && S.meta.n0) || 1; }
function isTeam() { return n0() > 1; }
function leader() {
    let l = null;
    try { const p = darkParties[darkRun.partyId]; l = p && p.leader; } catch (e) { }
    const a = actives();
    if (l && a.indexOf(l) >= 0) return l;
    return a[0] || ME;
}
X.actives = actives; X.leader = leader; X.nameOf = nameOf; X.isTeam = isTeam;

// ==========================================
// 기다림 · 투표 · 주사위
// ==========================================
function gatePress(key) { return pub('gate/' + key + '/' + ME, now()); }
function gateOf(key) { return (S.gate || {})[key] || {}; }
function gateDone(key) {
    const g = gateOf(key);
    return actives().every(function (c) { return !!g[c]; });
}
function waitHtml(key, label) {
    const g = gateOf(key);
    const a = actives();
    const done = a.filter(function (c) { return !!g[c]; });
    return '<div class="wd-wait">' + (label || '다른 일행을 기다립니다.') + '<br>'
        + a.map(function (c) { return (g[c] ? '✔ ' : '… ') + esc(nameOf(c)); }).join(' · ')
        + ' (' + done.length + '/' + a.length + ')</div>';
}
X.gatePress = gatePress; X.gateDone = gateDone; X.waitHtml = waitHtml;

// 맨 주사위 — 이 어둠에는 장비 보정이 없다. extra 는 이벤트 샵 물건 몫.
function roll(extra) {
    const raw = 1 + Math.floor(Math.random() * 30);
    const bonus = extra || 0;
    const total = raw + bonus;
    const ok = total >= 16;
    try { if (darkRun && darkRun.log) darkRun.log.push('[판정] d30 ' + raw + (bonus ? '+' + bonus : '') + ' vs 16 → ' + (ok ? '성공' : '실패')); } catch (e) { }
    return { raw: raw, bonus: bonus, total: total, ok: ok };
}
X.roll = roll;
function rollHtml(r) {
    return '<div class="wd-roll" style="color:' + (r.ok ? '#4CAF50' : '#f44336') + ';">' + r.total
        + (r.bonus ? ' <small>(' + r.raw + ' + ' + r.bonus + ')</small>' : '') + ' <small>/ 16</small></div>';
}
X.rollHtml = rollHtml;

// ==========================================
// 이벤트 샵 물건 — wonder-shop.js 의 X.has / X.spend (반입했거나 🎒 로 꺼내 둔 것)
// ==========================================
function has(name) { return !!(X.has && X.has(name)); }
function spend(name) {
    const ok = !!(X.spend && X.spend(name));
    if (ok) { try { showDarkToast('◈ ' + name); } catch (e) { } }
    return ok;
}

// ==========================================
// 지문 — WONDER_MD
// ==========================================
function MD() { return window.WONDER_MD || {}; }
function scene(key, h) {
    const arr = MD()[key] || [];
    if (typeof h === 'number') return arr[h] || null;
    for (let i = 0; i < arr.length; i++) if (arr[i].h === h || arr[i].h.indexOf(h) === 0) return arr[i];
    return null;
}
X.scene = scene;
// 메모 괄호(*(…)*)는 화면에 내지 않는다 — 조건 줄은 챕터 파일이 먼저 고친다
function clip(html) {
    return String(html || '')
        .replace(/<i>\([^<]*?\)<\/i>\s*/g, '')
        .replace(/\s*\((개인 판정|모든 인원이 준비되면 넘어가기)\)/g, '')
        .replace(/\s*\((→|소지품:)[^)]*\)/g, '');
}
X.clip = clip;
// 원고 속 메모 쪽 (「*어느 쪽을 선택해도 …」 · 「[최종 판정 — …]」) — 건너뛴다
function isMemo(p) {
    if (!p || (p.o && p.o.length)) return false;
    const t = String(p.x || '').replace(/<[^>]+>/g, '').trim();
    return !t || /^\*/.test(t) || /^\[[^\]]*\]$/.test(t);
}
X.isMemo = isMemo;
function isDeathPage(p) { return !!(p && /\((즉사|사망)\)/.test(p.x || '')); }

// ==========================================
// 그리기
// ==========================================
function body() { try { return darkBodyEl(); } catch (e) { return null; } }
function bar() {
    const r = rec();
    const st = STAGES[stageOf(S.meta ? S.meta.rounds : r.rounds)];
    const m = S.meta || {};
    const idx = m.idx || 0;
    const ch = m.order ? m.order[idx] : null;
    return '<div class="wd-bar"><span>🍬 <b>' + st + '</b></span>'
        + '<span>' + (m.order ? (Math.min(idx + 1, 6) + ' / 6 챕터') : '') + '</span>'
        + (ch && F && F.sc && F.sc.id !== 'intro' && F.sc.id !== 'hall' ? '<span>' + CH[ch].name + '</span>' : '')
        + (isTeam() ? '<span style="margin-left:auto;">' + actives().length + '인</span>' : '')
        + '</div>';
}
// ==========================================
// 단계 지문 — 어색 · 피폐 · 기괴
// ==========================================
//   window.WONDER_STAGE[챕터|'common'][단계 1~3][평문 키] = 그 단계의 문단 html  (wonder-stage.js, 단계 지문 문서에서 생성)
//   화면에 그릴 때 문단(<br><br>)마다 평문 키로 찾아 갈아 끼운다. 없으면 몽환 원문 그대로.
//   사건 · 대사 · 선택지 · 판정은 단계마다 같다 (사용자 원칙) — 선택지 글은 바꾸지 않는다.
function plainKey(h) {
    return String(h).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ').trim();
}
function stageNow() { return stageOf((S.meta || {}).rounds); }
// 단계 지문은 크다(수 MB) — 어색 이상 회차에 들어올 때만 따로 불러온다
const STAGE_V = '20261031b';
let stageLoading = false;
function ensureStage() {
    if (window.WONDER_STAGE || stageLoading || !S.meta || !stageNow()) return;
    stageLoading = true;
    const sc = document.createElement('script');
    sc.src = 'wonder-stage.js?v=' + STAGE_V;
    sc.onload = function () { try { if (F && F.st === 'in') view(); } catch (e) { } };
    sc.onerror = function () { stageLoading = false; console.warn('[이상한 나라] 단계 지문을 불러오지 못했습니다'); };
    document.head.appendChild(sc);
}
X.ensureStage = ensureStage;
X.stageNow = stageNow;
function stageText(html) {
    const st = stageNow();
    const W = window.WONDER_STAGE;
    if (!st || !W || !html) return html;
    const ch = F && F.ch;
    const A = (ch && W[ch] && W[ch][st]) || null;
    const C = (W.common && W.common[st]) || null;
    if (!A && !C) return html;
    return String(html).split('<br><br>').map(function (p) {
        const m = p.match(/^((?:\s*<(?:div|button)[^>]*>[\s\S]*?<\/(?:div|button)>)*)([\s\S]*?)((?:<div[^>]*>[\s\S]*?<\/div>\s*)*)$/);
        if (!m) return p;
        const k = plainKey(m[2]);
        if (!k) return p;
        const v = (A && A[k]) || (C && C[k]);
        return v ? m[1] + v + m[3] : p;
    }).join('<br><br>');
}
X.stageText = stageText;
function draw(title, text, extra, o) {
    const b = body();
    if (!b) return;
    o = o || {};
    text = stageText(text);
    b.innerHTML = darkBox(title || '—', (o.nobar ? '' : bar()) + '<div class="wd-txt">' + (text || '') + '</div>', extra || '');
    try { mountDarkChat('normal'); } catch (e) { }
}
X.draw = draw;
function btn(label, fn) { return darkChoiceBtn(label, fn); }
X.btn = btn;

// ==========================================
// 화면 나무 걷기
// ==========================================
//   F.sc = { id:'walk', k: 키, h: 장면, loc:[쪽, 선택, 쪽, …], gk: 기다림 열쇠, then: 다음 화면, solo: 혼자 걷기 }
//   쪽 위치는 [쪽 번호, 고른 선택 번호, 갈래 안 쪽 번호, …]. 꼭대기 쪽을 넘길 때만 일행을 기다린다.
function seqAt(sc, loc) {
    let seq = sc.p;
    for (let i = 1; i < loc.length; i += 2) {
        const pg = seq[loc[i - 1]];
        const op = pg && pg.o && pg.o[loc[i]];
        if (!op || !op.b) return null;
        seq = op.b;
    }
    return seq;
}
function pageAt(sc, loc) {
    const seq = seqAt(sc, loc);
    return seq ? seq[loc[loc.length - 1]] : null;
}
function walkScene() {
    const w = F.sc;
    const s = (typeof w.k === 'string') ? scene(w.k, w.h) : null;
    return w.fix ? (FIX[w.fix] && FIX[w.fix]()) : s;
}
// 고친 장면 — 챕터 파일이 조건 줄을 바꾼 장면을 여기에 건다
const FIX = {};
X.FIX = FIX;

function walk(k, h, then, o) {
    o = o || {};
    const m = S.meta || {};
    F.sc = { id: 'walk', k: k, h: h, loc: [o.at || 0], gk: (o.gk || ((m.rid || '') + '_' + (m.idx || 0) + ':' + (o.fix || k) + ':' + h)), then: then || null, solo: !!o.solo, fix: o.fix || null };
    F.wait = null;
    save();
    view();
}
X.walk = walk;

function renderWalk() {
    const w = F.sc;
    const sc = walkScene();
    if (!sc) { draw('—', '<span style="color:#888;">(지문을 찾지 못했습니다: ' + esc(w.k) + ' / ' + esc(w.h) + ')</span>', btn('넘어간다.', 'WONDER.next()')); return; }
    // 꼭대기 쪽을 넘기려고 기다리는 중
    if (F.wait) {
        if (gateDone(F.wait.key)) { const nx = F.wait.next; F.wait = null; w.loc = [nx]; save(); return view(); }
        draw(sc.h, '', waitHtml(F.wait.key));
        return;
    }
    const pg = pageAt(sc, w.loc);
    if (!pg) { return advance(); }
    if (isMemo(pg)) { return advance(); }
    if (isDeathPage(pg)) {
        const html = clip(pg.x).replace(/\((즉사|사망)\)/g, '');
        return die(html);
    }
    const opts = (pg.o || []);
    let extra = '';
    if (!opts.length) extra = btn('계속 간다.', 'WONDER.pick(-1)');
    else extra = opts.map(function (op, i) { return btn(clip(op.l), 'WONDER.pick(' + i + ')'); }).join('');
    draw(w.loc.length === 1 && w.loc[0] === 0 ? sc.h.replace(/^\d+\.\s*/, '') : '—', clip(pg.x), extra);
}

// 갈래 안의 선택지가 위쪽 선택지와 같은 글이면, 위쪽 것을 고른 것으로 친다 (닫힌 문 → 「문을 넘는다」)
function norm(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s*\([^)]*\)\s*$/, '').trim(); }
X.pick = function (i) {
    if (!on() || !F.sc || F.sc.id !== 'walk') return;
    const w = F.sc;
    const sc = walkScene();
    const pg = pageAt(sc, w.loc);
    if (i < 0 || !pg || !pg.o || !pg.o[i]) return advance();
    const op = pg.o[i];
    if (CHOOSE[w.k] && CHOOSE[w.k](w, pg, i, op) === true) return;   // 챕터 파일이 가로챔
    if (op.b && op.b.length) { w.loc = w.loc.concat([i, 0]); save(); return view(); }
    if (w.loc.length > 1) {
        const lab = norm(op.l);
        for (let d = w.loc.length - 3; d >= 0; d -= 2) {
            const up = pageAt(sc, w.loc.slice(0, d + 1));
            const j = up && up.o ? up.o.findIndex(function (u) { return norm(u.l) === lab; }) : -1;
            if (j >= 0 && up.o[j] !== op) {
                w.loc = w.loc.slice(0, d + 1);
                save();
                return X.pick(j);
            }
        }
    }
    advance();
};
const CHOOSE = {};
X.CHOOSE = CHOOSE;

function advance() {
    const w = F.sc;
    const sc = walkScene();
    let loc = w.loc.slice();
    while (true) {
        const seq = seqAt(sc, loc);
        const last = loc.length - 1;
        if (seq && loc[last] + 1 < seq.length) { loc[last]++; break; }
        if (loc.length === 1) { loc = null; break; }
        loc = loc.slice(0, loc.length - 2);       // 갈래가 끝났다 — 위 쪽의 다음으로
    }
    if (loc && loc.length > 1) { w.loc = loc; save(); return view(); }
    // 꼭대기 쪽을 넘긴다 — 일행을 기다린다
    const next = loc ? loc[0] : -1;
    const key = (w.gk + ':' + w.loc[0]).replace(/[.#$\[\]\/]/g, '_');
    if (!w.solo && isTeam()) {
        gatePress(key);
        F.wait = { key: key, next: next };
        save();
        if (next < 0) { F.wait.end = true; }
        return view();
    }
    if (next < 0) return endWalk();
    w.loc = [next]; save(); view();
}
function endWalk() {
    const t = F.sc && F.sc.then;
    F.wait = null;
    if (typeof t === 'function') return t();
    if (t && THEN[t]) return THEN[t]();
    go({ id: 'hall' });
}
const THEN = {};
X.THEN = THEN;
X.next = advance;

// 기다림이 끝난 뒤 장면 끝으로 — renderWalk 의 wait 처리에서 next < 0
(function patchWaitEnd() {
    const _rw = renderWalk;
    renderWalk = function () {
        if (F && F.wait && F.wait.end && gateDone(F.wait.key)) { F.wait = null; save(); return endWalk(); }
        return _rw();
    };
})();

// ==========================================
// 화면 전환
// ==========================================
function go(sc) { F.sc = sc; F.wait = null; save(); view(); }
X.go = go;
const VIEW = {};
X.VIEW = VIEW;
function view() {
    if (!F) return;
    ensureStage();
    if (F.st !== 'in') return;
    const sc = F.sc || { id: 'intro' };
    try {
        if (sc.id === 'walk') return renderWalk();
        if (VIEW[sc.id]) return VIEW[sc.id](sc);
    } catch (e) { console.error('[이상한 나라] view', e); }
    draw('—', '<span style="color:#888;">(알 수 없는 화면: ' + esc(sc.id) + ')</span>', btn('홀로 돌아간다.', "WONDER.go({id:'hall'})"));
}
X.view = view;

// ==========================================
// 공통 도입 · 홀
// ==========================================
VIEW.intro = function () {
    walk('intro', 1, 'toDoor');
};
const HALL_BACK = [
    '당신은 다시 둥근 홀에 서 있습니다.',
    '분수의 물방울은 여전히 허공을 천천히 떠다니고, 도자기 새들은 똑같은 노래를 부릅니다. 여섯 개의 문 가운데 몇은 이미 닫혀 있습니다. 닫힌 문 너머는 조용합니다.',
    '분수 앞 유리 탁자 위에, 황금빛 열쇠가 다시 놓여 있습니다. 하늘색 리본 끝의 쪽지도 그대로입니다.',
    '<b><i>Eat me.</i></b>'
].join('<br><br>');
VIEW.hall = function () {
    const m = S.meta || {};
    if (!m.order) { draw('—', '…', waitHtml('_none', '이야기를 준비하는 중입니다.')); return; }
    if ((m.idx || 0) === 0 && !F.introDone) return VIEW.intro();
    if (F.need && (m.idx || 0) < F.need) { draw('—', HALL_BACK, waitHtml('_none', '문이 닫히는 중입니다…')); return; }
    const key = 'hall_' + (m.rid || '') + '_' + (m.idx || 0);
    if (F.wait && F.wait.key === key) {
        if (gateDone(key)) { F.wait = null; return THEN.toDoor(); }
        draw('—', HALL_BACK, waitHtml(key));
        return;
    }
    draw('—', HALL_BACK, btn('사탕을 입에 넣는다.', 'WONDER.hallEat()'));
};
X.hallEat = function () {
    const m = S.meta || {};
    const key = 'hall_' + (m.rid || '') + '_' + (m.idx || 0);
    if (!isTeam()) return THEN.toDoor();
    gatePress(key);
    F.wait = { key: key };
    save(); view();
};
THEN.toDoor = function () {
    F.introDone = true;
    const m = S.meta || {};
    const ch = m.order[m.idx || 0];
    F.ch = ch;
    F.chRes = null;
    save();
    const st = stageOf(m.rounds);
    const c = X.chapters[ch];
    // 단계마다 사건 · 선택 · 판정은 같고 보이는 묘사만 바뀐다 — 묘사는 stageText 가 덧씌운다
    if (c && c.run) {
        try { darkRun.log.push('[이상한 나라] ' + CH[ch].name + ' — ' + STAGES[st]); } catch (e) { }
        // 챕터 등급 — 사망 규정이 이 등급을 따른다
        try { DARK_ZONES[W].grade = chGrade(ch); } catch (e) { }
        return c.run(api());
    }
    go({ id: 'nochap', ch: ch });
};
function chGrade(ch) {
    if (ch === 'succubus') {
        const st = stageOf((S.meta || {}).rounds);
        if (st <= 1) return 'A';
        const m = S.meta || {};
        return (srand((m.rid || '') + ':kgrade:' + (m.idx || 0))() < 0.5) ? 'A' : 'S';
    }
    return CH[ch].grade;
}
X.chGrade = chGrade;

// 원고가 아직 없는 챕터 — 관리자 시험용으로만 지나간다
VIEW.nochap = function (sc) {
    const c = CH[sc.ch];
    draw(c.name, c.door + '이 열립니다.<br><br><span style="color:#888;">(이 챕터의 ' + STAGES[stageOf((S.meta || {}).rounds)] + ' 원고는 아직 넣는 중입니다.)</span>',
        (leader() === ME || !isTeam()) ? btn('미션 받기로 넘어간다. (시험)', "WONDER.toMission()") : waitHtml('_none', '파티장을 기다립니다.'));
};

// ==========================================
// 미션 — 회차 안에서 겹치지 않게
// ==========================================
function api() {
    return {
        X: X, F: function () { return F; }, S: function () { return S; }, ME: ME,
        walk: walk, go: go, draw: draw, btn: btn, view: view, save: save, pub: pub, tx: tx,
        roll: roll, rollHtml: rollHtml, die: die, isTeam: isTeam, actives: actives, leader: leader,
        gatePress: gatePress, gateDone: gateDone, waitHtml: waitHtml, clip: clip, scene: scene,
        has: has, spend: spend, toMission: X.toMission, stage: stageOf((S.meta || {}).rounds)
    };
}
X.api = api;

function usedOf(ch) {
    const m = S.meta || {};
    return ((m.used || {})[ch] || []).slice();
}
// 받은 미션은 그 자리에서 내 회차 기록에 적는다 — 연계판에서 죽어 처음부터 다시 해도 같은 회차에 다시 나오지 않게
function markUsed(ch, id) {
    const me = rec();
    if (!me.cur) return;
    me.cur.used = me.cur.used || {};
    const u = arr(me.cur.used[ch]);
    if (u.indexOf(id) < 0) u.push(id);
    me.cur.used[ch] = u;
    saveRec();
}
X.toMission = function () {
    const m = S.meta || {};
    const ch = m.order[m.idx || 0];
    const key = 'mis_' + m.rid + '_' + (m.idx || 0);
    // 파티장(혼자면 나)이 뽑는다
    if (leader() === ME) {
        tx('mis/' + key, function (cur) {
            if (cur) return;
            const kind = isTeam() ? 'T' : 'S';
            const pool = MIS[ch][kind].map(function (_, i) { return misId(kind, i); });
            const used = usedOf(ch);
            let left = pool.filter(function (id) { return used.indexOf(id) < 0; });
            if (!left.length) left = pool;
            return left[Math.floor(Math.random() * left.length)];
        });
    }
    go({ id: 'mission', ch: ch, key: key });
};
VIEW.mission = function (sc) {
    const id = (S.mis || {})[sc.key];
    if (!id) { draw('—', '', waitHtml('_none', '부탁을 고르는 중입니다…')); return; }
    if (F.mis !== id) markUsed(sc.ch, id);
    F.mis = id;
    const c = X.chapters[sc.ch];
    if (c && c.mission) return c.mission(api(), id);
    draw('부탁', '「' + esc(misName(sc.ch, id)) + '」', btn('부탁을 받는다.', "WONDER.go({id:'link'})"));
};

// ==========================================
// 연계판 — 아직 없는 곳은 시험용 결말 단추
// ==========================================
VIEW.link = function () {
    const m = S.meta || {};
    const ch = m.order[m.idx || 0];
    const c = X.chapters[ch];
    if (c && c.link) return c.link(api(), F.mis);
    const r = (S.res || {})['r_' + m.rid + '_' + (m.idx || 0)];
    if (r) return go({ id: 'result', r: r });
    const canSet = leader() === ME || !isTeam();
    draw('연계판', '【' + esc(CH[ch].linkName) + '】 — 「' + esc(misName(ch, F.mis)) + '」<br><br><span style="color:#888;">(이 연계판은 아직 넣는 중입니다.)</span>',
        canSet && isAdmin()
            ? '<div class="wd-adm">관리자 시험 — 결말을 고릅니다.</div>' + btn('✔ 이상한 나라 쪽 성공', "WONDER.setRes('w')") + btn('✔ 어둠 쪽 성공', "WONDER.setRes('d')") + btn('✖ 실패', "WONDER.setRes('f')")
            : canSet ? btn('돌아간다.', "WONDER.setRes('f')") : waitHtml('_none', '파티장을 기다립니다.'));
};
X.setRes = function (r) {
    const m = S.meta || {};
    tx('res/r_' + m.rid + '_' + (m.idx || 0), function (cur) { return cur || r; });
};
X.linkEnd = function (r) { X.setRes(r); };
// 연계판이 결말을 다 보여 준 뒤 부른다 — personal 이면 나만의 결과 (T8 「따라 올라간다」처럼 사람마다 갈리는 결말)
X.finish = function (r, personal) {
    const m = S.meta || {};
    const key = 'r_' + m.rid + '_' + (m.idx || 0) + (personal ? '_' + ME : '');
    tx('res/' + key, function (cur) { return cur || r; });
    X.chapterDone(r);
};

VIEW.result = function (sc) {
    const m = S.meta || {};
    const ch = m.order[m.idx || 0];
    const ok = sc.r === 'w' || sc.r === 'd';
    const txt = ok
        ? '계단을 오르면 다시 ' + esc(CH[ch].name) + '의 자리입니다. 누군가 당신의 손바닥 위에 황금빛 열쇠 사탕 하나를 올려놓습니다.<br><span style="font-size:11px; color:#888;">(미션 성공 — ' + (sc.r === 'w' ? '이상한 나라 쪽' : '어둠 쪽') + ' · 홀로 돌아가면 보상을 받습니다)</span>'
        : '계단을 오릅니다. 문은 닫혀 있고, 아무도 당신을 부르지 않습니다. 당신은 아무것도 받지 못했습니다.<br><span style="font-size:11px; color:#888;">(미션 실패 — 잃는 것은 없습니다)</span>';
    draw(ok ? '✔' : '✖', txt, btn('홀로 돌아간다.', 'WONDER.chapterDone()'));
};

// 챕터 끝 — 내 회차 기록에 적고, 멈출지 이을지
X.chapterDone = function (given) {
    const m = S.meta || {};
    const ch = m.order[m.idx || 0];
    const rkey = 'r_' + m.rid + '_' + (m.idx || 0);
    const r = given || (S.res || {})[rkey + '_' + ME] || (S.res || {})[rkey] || 'f';
    const mid = (S.mis || {})['mis_' + m.rid + '_' + (m.idx || 0)];
    const me = rec();
    if (!me.cur || me.cur.rid !== m.rid) me.cur = { rid: m.rid, order: m.order, idx: m.idx || 0, used: m.used || {}, res: {} };
    const mu = clean(m.used || {}) || {};
    Object.keys(me.cur.used || {}).forEach(function (k) { mu[k] = arr(mu[k]).concat(arr(me.cur.used[k]).filter(function (x) { return arr(mu[k]).indexOf(x) < 0; })); });
    me.cur.used = mu;
    if (!me.cur.used[ch]) me.cur.used[ch] = [];
    if (mid && me.cur.used[ch].indexOf(mid) < 0) me.cur.used[ch].push(mid);
    if (mid && leader() === ME) tx('meta/used/' + ch, function (cur) { cur = arr(cur); if (cur.indexOf(mid) < 0) cur.push(mid); return cur; });
    me.cur.res = me.cur.res || {};
    me.cur.res[ch] = r;
    me.cur.idx = (m.idx || 0) + 1;
    try { darkRun.log.push('[이상한 나라] ' + CH[ch].name + ' 「' + misName(ch, mid) + '」 ' + (r === 'f' ? '실패' : '성공')); } catch (e) { }
    // 미션 성공 보상 (wonder-reward.js) — 사람마다 한 번. 실패는 아무것도 없이 다음 챕터.
    const rwKey = 'rw_' + m.rid + '_' + (m.idx || 0);
    if ((r === 'w' || r === 'd') && X.reward) { try { X.reward(rwKey, CH[ch].name, misName(ch, mid)); } catch (e) { console.error(e); } }
    if (me.cur.idx >= 6) {
        me.rounds = (me.rounds || 0) + 1;
        me.cur = null;
        saveRec();
        return go({ id: 'roundEnd', rounds: me.rounds, rw: rwKey });
    }
    saveRec();
    go({ id: 'cont', idx: m.idx || 0, rw: rwKey });
};

// ==========================================
// 멈추기 / 잇기
// ==========================================
function vkey() { const m = S.meta || {}; return 'cont_' + m.rid + '_' + (m.idx || 0); }
function rewardBox(sc) {
    const g = sc && sc.rw && F.rewarded && F.rewarded[sc.rw];
    return g && X.rewardHtml ? X.rewardHtml(g) : '';
}
VIEW.cont = function (sc) {
    const rb = rewardBox(sc);
    const key = vkey();
    const v = (S.vote || {})[key] || {};
    const a = actives();
    const mine = v[ME];
    if (!isTeam()) {
        draw('—', rb + '여섯 문 가운데 하나가 닫힙니다. 탐사를 이어 가시겠습니까?<br><span style="font-size:11px; color:#888;">(멈추면 이번 회차는 그 자리에 남고, 다음에 들어오면 남은 챕터부터 이어집니다.)</span>',
            btn('이어서 간다.', "WONDER.contGo('go')") + btn('여기서 멈춘다.', "WONDER.contGo('stop')"));
        return;
    }
    const done = a.filter(function (c) { return !!v[c]; });
    if (done.length < a.length) {
        draw('투표', rb + '여섯 문 가운데 하나가 닫힙니다. 탐사를 이어 갈지 정합니다.<br><span style="font-size:11px; color:#888;">(동률이면 각자 주사위를 굴립니다. 실패한 사람은 나가고, 다음에 들어오면 처음부터 다시 합니다.)</span>',
            mine ? '<div class="wd-wait">' + (mine === 'go' ? '「이어서 간다」' : '「멈춘다」') + '에 투표했습니다.<br>' + a.map(function (c) { return (v[c] ? '✔ ' : '… ') + esc(nameOf(c)); }).join(' · ') + '</div>'
                 : btn('이어서 간다.', "WONDER.vote('go')") + btn('여기서 멈춘다.', "WONDER.vote('stop')"));
        return;
    }
    const go_ = done.filter(function (c) { return v[c] === 'go'; }).length;
    const stop = done.length - go_;
    if (go_ > stop) return X.contGo('go');
    if (stop > go_) return X.contGo('stop');
    go({ id: 'tie', key: key });
};
X.vote = function (choice) { pub('vote/' + vkey() + '/' + ME, choice); };
X.contGo = function (c) {
    if (c === 'stop') return go({ id: 'stopped' });
    const m = S.meta || {};
    const nx = (m.idx || 0) + 1;
    // 누가 먼저 넘기든 한 칸만 — 파티장이 동률 주사위로 나가도 남은 사람이 넘긴다
    tx('meta/idx', function (cur) { return (cur || 0) < nx ? nx : cur; });
    F.introDone = true;
    F.need = nx;
    go({ id: 'hall' });
};

// 동률 — 각자 d30. 짝수 인원이 반반으로 갈리면 모두 다시 굴린다.
VIEW.tie = function (sc) {
    const a = actives();
    const D = (S.dice || {})[sc.key] || {};
    const round = D._n || 0;
    const mineR = (D[round] || {})[ME];
    const got = a.filter(function (c) { return (D[round] || {})[c]; });
    if (!mineR) {
        draw('동률', '표가 반으로 갈렸습니다. 멈추지 않고 각자 주사위를 굴립니다.<br>성공하면 이어서 가고, 실패하면 이 회차에서 나갑니다.' + (round ? '<br><span style="color:#d4af37;">(반반으로 갈려 다시 굴립니다.)</span>' : ''),
            btn('주사위를 굴린다.', 'WONDER.tieRoll()'));
        return;
    }
    if (got.length < a.length) {
        draw('동률', rollHtml(mineR), '<div class="wd-wait">' + a.map(function (c) { const r = (D[round] || {})[c]; return (r ? (r.ok ? '✔ ' : '✖ ') : '… ') + esc(nameOf(c)); }).join(' · ') + '</div>');
        return;
    }
    const okN = got.filter(function (c) { return D[round][c].ok; }).length;
    if (a.length % 2 === 0 && okN * 2 === a.length) {
        if (leader() === ME) tx('dice/' + sc.key + '/_n', function (cur) { return (cur || 0) === round ? round + 1 : cur; });
        draw('동률', rollHtml(mineR), '<div class="wd-wait">성공과 실패가 반반입니다. 다시 굴립니다…</div>');
        return;
    }
    if (mineR.ok) return X.contGo('go');
    go({ id: 'tieOut' });
};
X.tieRoll = function () {
    const sc = F.sc;
    const D = (S.dice || {})[sc.key] || {};
    const round = D._n || 0;
    const r = roll(0);
    pub('dice/' + sc.key + '/' + round + '/' + ME, { ok: r.ok, raw: r.raw, total: r.total, bonus: 0 });
};

// 나가는 화면들
VIEW.stopped = function () {
    draw('—', '당신은 홀에 남습니다. 열리지 않은 문들이 조용히 당신을 기다립니다.<br><span style="font-size:11px; color:#888;">(이번 회차는 여기서 멈춥니다. 다음에 들어오면 남은 챕터부터 이어집니다.)</span>',
        btn('단말로 복귀한다.', 'WONDER.leave()'));
};
VIEW.tieOut = function () {
    if (!F.tieOutDone) { F.tieOutDone = 1; restartRound(); saveRec(); save(); }
    draw('—', '주사위가 당신을 홀 밖으로 밀어냅니다. 문이 하나씩 멀어지고, 분수 소리가 작아집니다.<br><span style="font-size:11px; color:#888;">(이번 회차에서 나갑니다. 다음에 들어오면 처음부터 다시 합니다.)</span>',
        btn('단말로 복귀한다.', 'WONDER.leave()'));
};
VIEW.roundEnd = function (sc) {
    const st = stageOf(sc.rounds);
    draw('회차 종료', rewardBox(sc) + '여섯 개의 문이 모두 닫힙니다. 분수의 물방울이 처음으로 바닥에 떨어집니다.<br><br><span style="font-size:11px; color:#888;">(' + sc.rounds + '회차를 마쳤습니다. 다음 회차는 「' + STAGES[st] + '」입니다.)</span>',
        btn('단말로 복귀한다.', 'WONDER.leave()'));
};
X.leave = function () {
    if (F) { F.st = 'out'; pub('pl/' + ME + '/st', 'out'); save(); }
    try { darkRun.success = 0; darkRun.fail = 0; } catch (e) { }
    try { finishDarkRun(); } catch (e) { console.error(e); }
};

// ==========================================
// 죽음 — 막기 없이 (이 어둠에서는 장비가 통하지 않는다)
// ==========================================
function die(reasonHtml) {
    reasonHtml = stageText(reasonHtml);
    if (typeof darkRun === 'undefined' || !darkRun || darkRun._dead) return;
    darkRun._dead = true;
    if (F) { F.st = 'dead'; pub('pl/' + ME + '/st', 'dead'); save(); }
    // 회차는 처음부터
    restartRound();
    saveRec();
    const grade = (DARK_ZONES[W] && DARK_ZONES[W].grade) || 'A';
    let lostPoints = 0;
    const lostItems = [];
    if (['S', 'A', 'B'].indexOf(grade) >= 0) {
        lostPoints = Number(currentUser.points) || 0;
        currentUser.points = 0;
        [].concat(darkRun.carryEquips || [], darkRun.carryItems || []).forEach(function (it) {
            try { removeItemFromInventory(currentUser, it, 1); } catch (e) { }
            lostItems.push(it);
        });
    }
    try { addHistoryLog(currentUser, '[어둠 사망] ' + W + ' 이상한 나라의 ■■■ — 포인트 ' + lostPoints + ' P' + (lostItems.length ? '와 반입품' : '') + ' 소실.'); } catch (e) { }
    currentUser.pollution = 100;
    currentUser.quarantineUntil = Date.now() + 4 * 60 * 60 * 1000;
    currentUser.quarantineExitPollution = 40;
    currentUser.foxRoomAnswered = true;
    currentUser.quarantineHospital = true;
    let dest = 'fox';
    try { dest = isDisasterAgent(currentUser) ? 'bath' : 'fox'; } catch (e) { }
    currentUser.quarantineDest = dest;
    const d = db_();
    if (d && darkRun.isParty && darkRun.partyId) {
        try {
            const p = darkParties[darkRun.partyId];
            if (p && p.leader === ME) {
                const nx = actives().filter(function (c) { return c !== ME; })[0];
                if (nx) d.ref('darkParties/' + darkRun.partyId).update({ leader: nx, leaderName: nameOf(nx) });
            }
        } catch (e) { }
        try { d.ref('darkParties/' + darkRun.partyId + '/alive/' + ME).remove(); } catch (e) { }
        try { sendPartyChat(currentUser.name + ' 사원의 신호가 끊겼습니다.', true); } catch (e) { }
    }
    if (!currentUser.darkLogs) currentUser.darkLogs = [];
    currentUser.darkLogs.unshift({
        date: new Date().toLocaleString(), zone: W, zoneName: '이상한 나라의 ■■■',
        reward: 0, success: 0, fail: 0, loot: [], lost: lostItems, detail: darkRun.log || [], died: true, party: !!darkRun.isParty
    });
    if (currentUser.darkLogs.length > 15) currentUser.darkLogs.pop();
    const b = body();
    if (b) {
        b.innerHTML = darkBox('종료', reasonHtml || '이야기가 끝났습니다.',
            '<div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:6px; padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">'
            + '<div style="font-weight:bold; color:#ff6b6b; margin-bottom:8px; border-bottom:1px dashed #7f0000; padding-bottom:6px;">[사망 보고서]</div>'
            + (lostPoints || lostItems.length
                ? '보유 포인트 <b style="color:#f44336;">-' + lostPoints + ' P</b><br>' + (lostItems.length ? '반입품 <b style="color:#f44336;">' + esc(lostItems.join(', ')) + '</b> 소실<br>' : '')
                : '<span style="color:#aaa;">잃은 것이 없습니다.</span><br>')
            + '<span style="color:#aaa;">이 어둠에서는 어떤 장비도 통하지 않았습니다.</span><br>'
            + '이번 회차는 처음부터 다시 합니다.<br>'
            + '오염도 <b style="color:#ff9800;">100%</b>'
            + '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #7f0000; color:#d4af37;">' + (dest === 'bath' ? '🛁 선녀탕' : '🦊 여우 상담실') + '으로 긴급 이송됩니다.</div>'
            + '</div>' + darkChoiceBtn('눈을 감는다.', 'finishDarkDeath()'));
    }
    try { darkAmbienceStop(); } catch (e) { }
    try { saveDB(); } catch (e) { }
}
X.die = die;

// ==========================================
// 시작 · 이어 듣기
// ==========================================
function fresh() {
    return { v: 1, pid: PID, name: currentUser.name, st: 'in', sc: { id: 'hall' }, at: now(), usedIt: [] };
}
function newRound() {
    const rid = 'r' + now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    return { rid: rid, order: shuffle(KEYS), idx: 0, used: {}, res: {} };
}
function begin(isResume) {
    ME = currentUser.code;
    PID = (darkRun.partyId) ? darkRun.partyId : ('solo_' + ME);
    const d = db_();
    if (!d) { draw('—', '연결이 없습니다.', btn('단말로 복귀한다.', 'finishDarkRun()'), { nobar: true }); return; }
    S = {};
    attach();
    const loadRec = d.ref('users/' + ME + '/wonder').once('value').then(function (s) {
        const v = s.val();
        if (v) currentUser.wonder = v;
        normRec();
    }).catch(function () { });
    loadRec.then(function () { return d.ref('wonderMe/' + PID + '/' + ME).once('value'); }).then(function (s) {
        const v = s && s.val();
        if (v && v.v && v.pid === PID && v.st === 'in') {
            F = v;
            if (!F.usedIt) F.usedIt = [];
            pub('pl/' + ME + '/gone', null);
            view();
            return;
        }
        F = fresh();
        let party = null;
        try { party = darkParties[darkRun.partyId]; } catch (e) { }
        const cnt = Math.max(1, (party && party.members) ? Object.keys(party.members).length : (darkRun.memberCount || 1));
        pub('pl/' + ME, { name: F.name, st: 'in', at: now() });
        // 회차 — 파티장(혼자면 나)의 것을 쓴다
        const lead = (party && party.leader) ? party.leader : ME;
        if (lead === ME) {
            const me = rec();
            if (!me.cur) me.cur = newRound();
            saveRec();
            tx('meta', function (cur) {
                if (cur && cur.rid) return;
                return { n0: cnt, rid: me.cur.rid, order: me.cur.order, idx: me.cur.idx || 0, used: me.cur.used || {}, rounds: me.rounds || 0, leader: ME, at: now() };
            });
        }
        try { darkRun.log.push('[이상한 나라] 입장 (' + cnt + '인)'); } catch (e) { }
        save();
        view();
    });
}
X.begin = begin;

function attach() {
    const d = db_();
    if (!d) return;
    if (sharedRef) { try { sharedRef.off(); } catch (e) { } }
    sharedRef = d.ref('wonder/' + PID);
    sharedRef.on('value', function (s) {
        S = s.val() || {};
        normMeta();
        // 회차를 파티 것으로 맞춘다 (팀원)
        if (F && F.st === 'in' && S.meta && S.meta.rid) {
            const me = rec();
            if (!me.cur || me.cur.rid !== S.meta.rid) {
                me.cur = { rid: S.meta.rid, order: S.meta.order, idx: S.meta.idx || 0, used: S.meta.used || {}, res: {} };
                saveRec();
            }
        }
        onShared();
    });
}
const LIVE = { hall: 1, mission: 1, link: 1, cont: 1, tie: 1, nochap: 1 };
X.LIVE = LIVE;
function onShared() {
    if (!F || !on()) return;
    const sc = F.sc || {};
    // 다른 사람의 결정으로 화면이 바뀌는 곳
    if (sc.id === 'link') {
        const m = S.meta || {};
        const c = X.chapters[(m.order || [])[m.idx || 0]];
        const r = (S.res || {})['r_' + m.rid + '_' + (m.idx || 0)];
        if (r && !(c && c.link)) return go({ id: 'result', r: r });
    }
    if (sc.id === 'walk' && F.wait) return view();
    if (LIVE[sc.id]) return view();
    if (X.onShared) { try { X.onShared(sc); } catch (e) { } }
}

function cleanup() {
    if (sharedRef) { try { sharedRef.off(); } catch (e) { } }
    sharedRef = null;
    F = null; S = {}; PID = null;
}

// ==========================================
// 이어 붙이기
// ==========================================
(function hooks() {
    const iv = setInterval(function () {
        if (typeof renderDarkStep !== 'function') return;
        clearInterval(iv);
        const _r = renderDarkStep;
        renderDarkStep = function () {
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W && !darkRun.wonderLink) {
                if (darkRun._dead) return;
                if (!F || F.pid !== ((darkRun.partyId) ? darkRun.partyId : ('solo_' + currentUser.code))) { begin(!!darkRun.rejoined); return; }
                view();
                return;
            }
            return _r.apply(this, arguments);
        };
        try { window.renderDarkStep = renderDarkStep; } catch (e) { }
    }, 50);

    const iv2 = setInterval(function () {
        if (typeof renderRejoinScene !== 'function') return;
        clearInterval(iv2);
        const _j = renderRejoinScene;
        renderRejoinScene = function () {
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W) {
                darkRun.rejoined = false;
                F = null;
                begin(true);
                return;
            }
            return _j.apply(this, arguments);
        };
    }, 50);

    ['finishDarkRun', 'finishDarkDeath'].forEach(function (nm) {
        const iv3 = setInterval(function () {
            if (typeof window[nm] !== 'function') return;
            clearInterval(iv3);
            const _f = window[nm];
            const w = function () {
                const mine = typeof darkRun !== 'undefined' && darkRun && darkRun.zone === W;
                if (mine && F && F.st === 'in') { F.st = 'out'; pub('pl/' + ME + '/st', 'out'); save(); }
                const pid = mine ? PID : null;
                const r = _f.apply(this, arguments);
                if (mine || F) cleanup();
                if (pid && pid.indexOf('solo_') === 0) {
                    const d = db_();
                    if (d) { try { d.ref('wonder/' + pid).remove(); d.ref('wonderMe/' + pid).remove(); } catch (e) { } }
                }
                return r;
            };
            window[nm] = w;
            try { if (nm === 'finishDarkRun') finishDarkRun = w; else finishDarkDeath = w; } catch (e) { }
        }, 60);
    });
})();

// ==========================================
// 장비 끄기 — 이 어둠(연계판 포함)에서는 어떤 장비도 통하지 않는다
// ==========================================
//   판정 보정(rollDarkBonus · gearCapBonus) · 행운 다시 굴리기(luckReroll) · 즉사 막기(darkDeath 의 막기들)
//   darkDeath 는 맨 바깥에 감아야 다른 막기들을 건너뛴다 — 다른 파일이 나중에 감으면 다시 감는다.
(function noGear() {
    function wrapOnce(name, make) {
        const iv = setInterval(function () {
            if (typeof window[name] !== 'function') return;
            clearInterval(iv);
            const w = make(window[name]);
            w._wonder = true;
            window[name] = w;
        }, 80);
    }
    wrapOnce('rollDarkBonus', function (_f) { return function () { if (inW()) return 0; return _f.apply(this, arguments); }; });
    wrapOnce('luckReroll', function (_f) { return function (r) { if (inW()) return r; return _f.apply(this, arguments); }; });
    wrapOnce('gearCapBonus', function (_f) { return function (b) { if (inW()) return 0; return _f.apply(this, arguments); }; });
    function wrapDeath() {
        if (typeof window.darkDeath !== 'function' || window.darkDeath._wonder) return;
        const _f = window.darkDeath;
        const w = function (reason) {
            if (inW()) return die(reason);
            return _f.apply(this, arguments);
        };
        w._wonder = true;
        window.darkDeath = w;
        try { darkDeath = w; } catch (e) { }
    }
    setInterval(wrapDeath, 1500);
    setTimeout(wrapDeath, 100);
})();

// ==========================================
// 콘솔
// ==========================================
window.wonderState = function () {
    console.log('%c===== 이상한 나라 =====', 'color:#d4af37');
    console.log('내 기록', clean(currentUser && currentUser.wonder));
    console.log('화면', clean(F));
    console.log('함께', clean(S));
};
window.wonderReset = function () {
    if (!isAdmin()) { console.log('관리자만'); return; }
    currentUser.wonder = { rounds: 0, cur: null };
    saveRec();
    console.log('내 회차 기록을 지웠습니다.');
};

console.log('[이상한 나라] 뼈대 연결 — ' + W);
})();
