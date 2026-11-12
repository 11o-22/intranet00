// ==========================================
// ★ 🎵 리듬 게임 — 전 사원 (2026-11-10 상담사만 → 11-11 테스터도 → 11-11 전 사원)
// bundles.json 마지막 묶음 · 광장 ☰ 「생활」 → 「리듬 게임」
// ==========================================
//
//   「직접 작곡한 두 곡 — 마스터링해서 리듬게임으로 쓰자. 모바일 기준 가로로 눕혀서 6칸 정도,
//     이지 · 노말 · 하드, 터치 · 길게 누르기 · 슬라이드까지. 일단은 상담사만. 메뉴칸에 놔줘.」
//
//   곡    snd/rhythm-<열쇠>.mp3  (마스터링 — -14 LUFS · 최고 -1 dBTP) · 일곱 곡 (2026-11-11 다섯 곡 더 · 곡 목록은 끌어서 내린다)
//   채보  rhythm/<열쇠>.json      (tools/rhythm-chart.py 가 곡을 듣고 만든 것 — 16분 격자 · 템포가 바뀌어도 따라간다)
//   표지는 쓰지 않는다 — 까만 칸 (2026-11-10 사용자)
//
//   ■ 화면 — 가로. 휴대폰을 세워 두면 화면을 돌려 그린다 (손가락 자리도 같이 돌린다).
//            들어갈 때 전체 화면 · 가로 고정을 해 본다 (되는 기기만).
//   ★ 2026-11-10 사용자 「터치감이 안 좋아 — Deemo 같은 형식으로」
//     · 칸이 없다 — 노트가 멀리(위 가운데)에서 원근으로 내려와 판정선에 닿는다. 노트마다 가로 자리가 있다.
//     · 화면 어디를 눌러도 된다 — **가로 자리만** 본다 (노트 폭 + 여유). 빈 곳을 눌러도 벌이 없다.
//     · 판정 CHARMING ±55 ms · NORMAL ±140 · 그 뒤 MISS (슬라이드는 ±120 안에 손가락이 지나가면 CHARMING)
//     · 점수는 정확도(%) — CHARMING 100% · NORMAL 60% · 길게 누르기는 머리 · 꼬리 둘로 센다
//     · 결과에 평균 타이밍(빠르게 / 늦게) — 「싱크에 반영」으로 바로 맞춘다
//   ■ 노트
//     · 터치         흰 건반 — 판정선에 닿을 때 그 자리를 누른다
//     · 길게 누르기   흰 건반 + 띠 — 누른 채 끝까지 (손가락이 옆으로 조금 흘러도 된다) · 일찍 떼면 꼬리는 MISS
//     · 슬라이드     노란 건반 — 손가락이 그 자리에 닿아 있거나 지나가면 된다 (누르지 않고 쓸어도 된다)
//     · 지그재그     초록 건반 — 슬라이드와 같다 · 왼 · 오른 칸을 번갈아 (채보 종류 3 · 2026-11-11 사용자 「초록색 · 양손 지그재그도」)
//                    양손 — 왼손 0 ↔ 2 칸 · 오른손 5 ↔ 3 칸을 거울처럼
//   ■ 설정   속도 · 싱크 · 타격음 — 이 기기에 적어 둔다
//   ★ 2026-11-11 사용자 「싱크가 아직도 좀 안 맞아」
//     · 싱크를 둘로 나눴다 — **판정 싱크**(누른 때를 얼마나 당겨 보나) · **화면 싱크**(노트를 얼마나 일찍 그리나)
//       전에는 하나가 둘을 같이 밀어서, 「싱크에 반영」을 누를수록 노트가 소리보다 점점 늦게 닿았다.
//     · 누른 때는 손가락이 닿은 그 순간(이벤트 시각)으로 잰다 — 화면을 그리느라 늦게 받은 만큼 늦게 판정하지 않게
//     · 화면은 한 프레임 앞을 그린다 (그린 그림은 다음 프레임에 보인다)
//     · 「싱크 맞추기」 — 딸깍 소리에 맞춰 누르면 판정 싱크가 저절로 · 노트가 선에 닿는 때를 보고 화면 싱크를 ±
//   ★ 2026-11-11 사용자 「제대로 성공한 판정에 따라 랭크 · 리듬게임 랭킹」
//     · 랭크 — 정확도(CHARMING 100% · NORMAL 60% · MISS 0)로 L(ALL CHARMING · 2026-11-11 사용자) · SS 98 · S 95 · A 90 · B 80 · C 70 · D 60 · E 40 · F (2026-11-11 사용자)
//     · 랭킹 — 곡 · 난이도마다 사람별 최고 기록 (rhythmRank/<곡>/<난이도>/<사번>) · 곡 고르기의 「🏆 랭킹」 · 결과에 순위
//   ■ 기록   곡 · 난이도마다 최고 정확도 — 이 기기에 (rgBest) · 랭킹은 서버에
//   ■ 키보드 S D F J K L · 스페이스 = 멈춤 — PC(마우스가 있는 기기)에서는 판정선 밑에 키를 보여 준다 (2026-11-11)
//     여섯 줄 키는 ⚙ 설정의 「키 배치」에서 줄마다 바꾼다 (같은 키를 고르면 두 줄이 서로 바뀐다 · 기본값으로 되돌리기)
//
//   콘솔   rhythmOpen()

(function rhythm() {
'use strict';

const ADMIN = 'kario0987';
const SONGS = [
    { key: 'airplane', title: 'In the Airplane', artist: 'Benz', audio: 'snd/rhythm-airplane.mp3', chart: 'rhythm/airplane.json', color: '#7ec8ff', cover: 'rhythm/airplane-cover2.jpg' },   // 표지 바꿈 (2026-11-11 사용자 · 픽셀 비행기)
    { key: 'client', title: '내담자 여러분께', artist: 'Benz', audio: 'snd/rhythm-client.mp3', chart: 'rhythm/client.json', color: '#ffb3d1', cover: 'rhythm/client-cover.jpg' },     // 표지 (2026-11-11 사용자) — 없는 곡은 까만 칸
    // ★ 2026-11-11 사용자 「이것들도 전부 리듬게임에 · 아티스트는 전부 Benz · 음질 개선하고 마스터링해서 꼭」
    //   곡마다 EQ 를 고쳐(먹먹한 낮은 가운데 덜기 · 어두운 위쪽 살리기 · 좁은 스테레오 조금 넓히기) · 가벼운 압축 · 리미터 · -14 LUFS
    { key: 'devotion', title: 'Devotion', artist: 'Benz', audio: 'snd/rhythm-devotion.mp3', chart: 'rhythm/devotion.json', color: '#ff9fb2', cover: 'rhythm/devotion-cover.jpg' },
    { key: 'evilhigh', title: 'Evil High', artist: 'Benz', audio: 'snd/rhythm-evilhigh.mp3', chart: 'rhythm/evilhigh.json', color: '#b48cff', cover: 'rhythm/evilhigh-cover.jpg' },
    { key: 'returnhome', title: 'Return Home', artist: 'Benz', audio: 'snd/rhythm-returnhome.mp3', chart: 'rhythm/returnhome.json', color: '#ffcf8a', cover: 'rhythm/returnhome-cover2.jpg' },     // 표지 바꿈 (2026-11-11 사용자)
    { key: 'winterfloat', title: 'Winter Float', artist: 'Benz', audio: 'snd/rhythm-winterfloat.mp3', chart: 'rhythm/winterfloat.json', color: '#9fe3ff', cover: 'rhythm/winterfloat-cover.jpg' },
    { key: 'whitexmas', title: 'White Christmas Day', artist: 'Benz', audio: 'snd/rhythm-whitexmas.mp3', chart: 'rhythm/whitexmas.json', color: '#e6f0ff', cover: 'rhythm/whitexmas-cover.jpg' },
    // ★ 2026-11-11 사용자 「Showtime! (처음엔 Show time! → 붙여서) · 표지는 투명 배경 그대로 · 음질 상향과 마스터링 꼭」 — 위가 12~15 dB 어둡고 낮은 가운데가 두꺼워 그쪽을 고쳤다 · -14 LUFS
    //   표지는 투명 배경 그대로 (정사각에 가운데로 · 안 자르게) — 칸 · 판 바탕의 까만색이 비쳐 보인다
    { key: 'showtime', title: 'Showtime!', artist: 'Benz', audio: 'snd/rhythm-showtime.mp3', chart: 'rhythm/showtime.json', color: '#f2c45a', cover: 'rhythm/showtime-cover.png' },
    // ★ 2026-11-11 사용자 「이거 리듬게임에 넣어 주고 아티스트 이름을 Optimal 로 · 해금 조건을 걸자. 10000p 로」 · 제목 「천지인」
    //   음원은 40~80 Hz 가 두껍고 2 kHz 위가 어두웠다 — 웅웅임 걷고 · 가장 낮은 저음 조금 · 존재감 · 위 공기를 고쳐 -14 LUFS
    //   표지 — 주신 그림(1536x1024 · 보랏빛 달 · 두루미)을 정사각으로 (가로 300 ~ 1324 · 달과 두루미 셋이 다 들게) · 720
    //   price — 그 값을 한 번 내야 치고 · 플레이리스트에서도 듣는다 (owned 참고)
    { key: 'cheonjiin', title: '천지인', artist: 'Optimal', audio: 'snd/rhythm-cheonjiin.mp3', chart: 'rhythm/cheonjiin.json', color: '#c9a8ff', cover: 'rhythm/cheonjiin-cover.jpg', price: 10000 },
    // ★ 2026-11-11 사용자 「Handicap — 리듬게임에 넣어 주고 · 이미지는 준 걸로 · 어렵게 · 엔딩 페이드아웃 · 음질 상향 · 잡음 없애고 마스터링 · Benz 거야
    //   · 내담자 여러분께 하드 모드 B 이상 받아야 열리는 거로」
    //   음원 — 클릭 걷기 · 옅은 잡음 걷기 · 40~160 Hz 덜고 가운데 위 · 존재감 · 위 공기 · 좌우 조금 넓게 · 끝 네 마디 페이드아웃 · -14 LUFS
    //   채보 — 8분이 2:1 로 출렁이는(셔플) 곡이라 격자를 출렁이는 자리에 맞췄다 · 노말 · 하드 모두 「어렵게」 (tools/rhythm-chart.py SWING · HARDER)
    // ★ 2026-11-12 사용자 「핸디캡 이걸로 바꾸자. 제목은 그대로 하고 끝부분만 좀 다르거든. 채보 추가 · 마스터링 · 지저분한 음 다듬기 · 음질 상향」
    //   새 판 — 템포가 조금 빠르고(125 BPM) 끝이 길다 (132 초부터 드럼이 빠지고 142.1 초에 한 번 크게 친 뒤 화음이 남는다)
    //   음원 — 같은 다듬기 · 마스터링 · 긴 페이드아웃은 없이 새 끝 그대로
    // ★ 2026-11-12 사용자 「내가 준 음원에서 맨 뒷 부분이 그냥 음악이 뚝 끊겨. 그 부분 다시 살려줘」 · 하드 레벨 17 → 15
    //   받은 음원은 142.6 초에 남은 화음이 뚝 끊긴다 — 끊기기 전 화음을 부분음으로 재서 위상까지 맞춰 이어 붙이고 5 초 동안 잦아들게 했다 (147.6 초)
    //   앞 몸통은 지난번 마스터와 한 샘플도 다르지 않다 (같은 올림) · 채보는 그대로 (곡 길이만 늘고 하드 레벨 15)
    //   채보 — 다시 뽑음 · 몸통 촘촘함 그대로 · 끝 마당은 새로 울린 소리 위에 두고 마지막 한 방에 양손 동시로 맺는다 (tools/rhythm-chart.py OUTRO)
    //   need — 그 곡 · 그 난이도에서 그 랭크 이상을 받으면 열린다 (needMet · checkNeeds)
    { key: 'handicap', title: 'Handicap', artist: 'Benz', audio: 'snd/rhythm-handicap.mp3', chart: 'rhythm/handicap.json', color: '#6fd3a0', cover: 'rhythm/handicap-cover.jpg?v=2', need: { song: 'client', diff: 'hard', rank: 'B' } }
];
const DIFFS = [['easy', 'EASY', '이지', '#5fd18a'], ['normal', 'NORMAL', '노말', '#ffc94a'], ['hard', 'HARD', '하드', '#ff5f73']];
const LANES = 6;                      // 채보의 칸 수 — 화면에서는 가로 자리로 바꾼다 (xOfLane)
// ★ 2026-11-11 사용자 「타일 터치 판정 조금 더 완화 · 터치가 잘 먹게」 — 55/140/120 → 65/165/150 · 바깥으로 넓힘
const W_CHARM = 65, W_NORMAL = 165, W_SLIDE = 150;
const HIT_PAD = 0.085;                // 노트 폭 바깥으로 이만큼(판정선 폭의 몫)까지 맞은 것으로
const NOTE_W = [0.15, 0.15, 0.12];    // 터치 · 길게 누르기 · 슬라이드 — 판정선 폭의 몫
function xOfLane(l) { return 0.08 + l * (0.84 / (LANES - 1)); }
const LEAD = 2.2;                     // 곡 앞에 비우는 초
const HOLD_EARLY_OK = 180;            // 꼬리 — 끝나기 이만큼 전에 떼도 성공
const KEYS_DEF = ['s', 'd', 'f', 'j', 'k', 'l'];
// ★ 여섯 줄 키는 설정에서 하나씩 바꾼다 (2026-11-11 사용자 「설정에서 6 줄 키 개별 배치」) — SET.keys · 이 기기에 적어 둔다
const KEY_BAN = [' ', 'escape', 'tab', 'enter', 'shift', 'control', 'alt', 'meta', 'capslock', 'contextmenu', 'dead', 'process', 'unidentified'];
function keys() {
    const k = SET && SET.keys;
    if (Array.isArray(k) && k.length === 6 && k.every(function (x) { return typeof x === 'string' && x && KEY_BAN.indexOf(x) < 0; })
        && new Set(k).size === 6) return k;
    return KEYS_DEF;
}
const KEY_SYM = { arrowleft: '←', arrowright: '→', arrowup: '↑', arrowdown: '↓', backspace: '⌫', delete: 'Del', insert: 'Ins', home: 'Home', end: 'End', pageup: 'PgUp', pagedown: 'PgDn' };
function keyLabel(k) { return KEY_SYM[k] || (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1, 4)); }
let bindLane = null;               // 설정 창에서 바꾸려고 고른 줄 — 다음 키가 그 줄로
// ★ PC 는 판정선 밑에 키 표시 (2026-11-11 사용자 「PC 리듬게임은 밑에 키 표시를 두자」) — 마우스가 있는 기기 · 또는 키보드로 한 번이라도 쳤으면
const PC_KEYS = (function () { try { return window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { return false; } })();
let kbUsed = false;
function showKeys() { return PC_KEYS || kbUsed; }
const SET_KEY = 'rgSet', BEST_KEY = 'rgBest';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdmin() { const u = u_(); return !!(u && u.code === ADMIN); }
// 🔒 해금 — 값(price)이 붙은 곡은 그 값을 한 번 내야 친다 (플레이리스트에서 듣는 것도) · 상담사는 늘 열림 (2026-11-11 사용자 「천지인 — 해금 조건 10000p」)
//   users/<사번>/rhythmOwn = { 곡: 해금한 시각 }
function owned(s) {
    if (!s || (!s.price && !s.need)) return true;
    if (isAdmin()) return true;
    const u = u_();
    return !!(u && u.rhythmOwn && typeof u.rhythmOwn === 'object' && u.rhythmOwn[s.key]);
}
// 🔓 조건 해금 — 「내담자 여러분께」 HARD B 이상 같은 것 (2026-11-11 사용자 「Handicap 은 내담자 여러분께 하드 모드 B 이상 받아야 열리게」)
//   랭킹 기록(rhythmRank/<곡>/<난이도>/<사번>)의 최고 랭크로 본다 — 예전에 받아 둔 것도 친다. 되면 rhythmOwn 에 적는다.
function rankIdx(r) { for (let i = 0; i < RANKS.length; i++) if (RANKS[i][0] === r) return i; return RANKS.length; }
function needText(s) {
    const n = s && s.need; if (!n) return '';
    const t = SONGS.find(function (x) { return x.key === n.song; });
    const d = DIFFS.find(function (x) { return x[0] === n.diff; });
    return '「' + (t ? t.title : n.song) + '」 ' + (d ? d[1] : n.diff) + ' ' + n.rank + ' 이상';
}
function grantNeed(s) {
    const u = u_();
    if (!u || owned(s)) return false;
    if (!u.rhythmOwn || typeof u.rhythmOwn !== 'object') u.rhythmOwn = {};
    u.rhythmOwn[s.key] = Date.now();
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[🎵 리듬 게임] 「' + s.title + '」 열림 — ' + needText(s)); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ rhythmOwn: 1, history: 1 }); } catch (e) { }
    return true;
}
function checkNeeds() {
    const db = db_(), u = u_();
    if (!db || !u || !u.code) return Promise.resolve(false);
    const todo = SONGS.filter(function (s) { return s.need && !owned(s); });
    if (!todo.length) return Promise.resolve(false);
    return Promise.all(todo.map(function (s) {
        return db.ref(RANK_PATH + '/' + s.need.song + '/' + s.need.diff + '/' + u.code).once('value').then(function (snap) {
            const v = snap && snap.val();
            if (!v || !(Number(v.s) > 0)) return false;
            const r = v.r || rankOf(Number(v.s), !!v.ac)[0];
            return rankIdx(r) <= rankIdx(s.need.rank) ? grantNeed(s) : false;
        }).catch(function () { return false; });
    })).then(function (rs) { return rs.some(Boolean); });
}
function needModal(s) {
    const old = UI.querySelector('.rg-buymodal'); if (old) old.remove();
    const b = bestOf(s.need.song, s.need.diff);
    const m = document.createElement('div'); m.className = 'rg-modal rg-buymodal';
    m.innerHTML = '<div class="rg-box" style="gap:10px;align-items:center;text-align:center;min-width:260px;">'
        + '<b style="font-size:16px;">🔒 「' + esc(s.title) + '」</b>'
        + '<div style="font-size:13px;color:#ccd;line-height:1.7;">' + esc(needText(s)) + ' 을 받으면 열립니다'
        + (b ? '<br><small style="color:#99a;">이 기기 최고 ' + rankOf(b.score, b.ap)[0] + ' · ' + (b.score / 10000).toFixed(2) + '%</small>' : '') + '</div>'
        + '<div style="display:flex;gap:10px;"><button class="rg-btn rg-go" data-k="go">그 곡으로</button><button class="rg-btn" data-k="no">닫기</button></div></div>';
    UI.appendChild(m);
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector('[data-k="no"]').onclick = function () { m.remove(); };
    m.querySelector('[data-k="go"]').onclick = function () { m.remove(); SET.song = s.need.song; SET.diff = s.need.diff; saveSet(); songTop = null; menu(); };
}
function buySong(s) {
    const u = u_();
    if (!s || !u) return { ok: false, why: '로그인이 필요합니다' };
    if (owned(s)) return { ok: true };
    if (!s.price) return { ok: false, why: needText(s) + ' 을 받으면 열립니다' };
    const pts = Math.floor(Number(u.points) || 0);
    if (pts < s.price) return { ok: false, why: '포인트가 모자랍니다 (보유 ' + pts.toLocaleString() + ' P)' };
    u.points = pts - s.price;
    if (!u.rhythmOwn || typeof u.rhythmOwn !== 'object') u.rhythmOwn = {};
    u.rhythmOwn[s.key] = Date.now();
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[🎵 리듬 게임] 「' + s.title + '」 해금 (-' + s.price.toLocaleString() + ' P)'); } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ points: 1, rhythmOwn: 1, history: 1 }); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
    return { ok: true };
}
// ★ 2026-11-11 사용자 「상담사가 테스터로 정한 사람들은 리듬게임이 보이게」 — 관리 화면의 테스터 지정(testers/<사번> · index.html testerList)
function isTester() { try { const u = u_(); return !!(u && typeof testerList !== 'undefined' && testerList && testerList[u.code]); } catch (e) { return false; } }
// ★ 2026-11-11 사용자 「리듬게임 이제 전 사원이 다 할 수 있게」 — 들어와 있는 사원이면 누구나
function canPlay() { return !!u_(); }
window.rhythmCan = canPlay;
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function loadJ(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function saveJ(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function say(m) { try { showCustomAlert(m); } catch (e) { alert(m); } }

const SET = Object.assign({ speed: 5, offset: 0, vis: 0, hit: true, song: 'airplane', diff: 'normal' }, loadJ(SET_KEY, {}));
// 싱크가 둘로 나뉘면서 뜻이 바뀌었다 — 전 값은 버리고 0 에서 (2026-11-11)
if (SET.sv !== 2) { SET.offset = 0; SET.vis = 0; SET.sv = 2; saveJ(SET_KEY, SET); }
function saveSet() { saveJ(SET_KEY, SET); }
function sgn(v) { return (v > 0 ? '+' : '') + v; }

// 랭크 — 정확도로 (ALL CHARMING 은 L)
const RANKS = [['L', 100, '#ffc1e3'], ['SS', 98, '#ffe066'], ['S', 95, '#ffd34d'], ['A', 90, '#7ec8ff'], ['B', 80, '#8fe3a8'], ['C', 70, '#c9c9d6'], ['D', 60, '#a3a3b3'], ['E', 40, '#87879a'], ['F', 0, '#d07070']];
function rankOf(score, ac) {
    if (ac) return RANKS[0];
    const pct = (Number(score) || 0) / 10000;
    for (let i = 1; i < RANKS.length; i++) if (pct >= RANKS[i][1]) return RANKS[i];
    return RANKS[RANKS.length - 1];
}
// ★ 꿈결 — 하드 한정 · 랭크별 (2026-11-11 사용자)
//   D 100 · C 150 · B 200 · A 250 · S 300 · SS 350 · L 400 (E · F 는 없음) · 하드 레벨 15 이상 곡은 +50
//   착용한 커스텀 장비 · 다른 아이템 영향 없이 고정 — 꿈결 계산(kroom)을 거치지 않고 서버 값에 그대로 더한다
//   하루에 딱 20 번까지 (2026-11-11 사용자) — rhythmDream/<사번> = { d: 날짜, n: 받은 번 } · 트랜잭션으로 한 칸씩 잡는다
const DREAM_PAY = { L: 400, SS: 350, S: 300, A: 250, B: 200, C: 150, D: 100 };
const DREAM_DAY = 20, DREAM_PATH = 'rhythmDream';
function dayStr() { try { if (typeof getTodayStr === 'function') return getTodayStr(); } catch (e) { } const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
// 오늘 몫 한 칸을 잡는다 — 잡으면 { ok, n }, 다 찼으면 { ok: false, full: true }
function dreamSlot(code, delta) {
    const db = db_(), d = dayStr();
    return db.ref(DREAM_PATH + '/' + code).transaction(function (cur) {
        const n = (cur && cur.d === d) ? (Number(cur.n) || 0) : 0;
        if (delta > 0 && n >= DREAM_DAY) return;
        return { d: d, n: Math.max(0, n + delta) };
    }).then(function (r) { return r && r.committed ? { ok: true, n: Number(r.snapshot.val().n) || 0 } : { ok: false, full: true }; })
      .catch(function () { return { ok: false }; });
}
function dreamPay(d, rk, lv) {
    if (d !== 'hard') return 0;
    const n = DREAM_PAY[rk] || 0;
    return n ? n + ((Number(lv) || 0) >= 15 ? 50 : 0) : 0;
}
// 받으면 { ok: true, n: 오늘 받은 번 } · 오늘 몫이 다 찼으면 { full: true }
function dreamGive(n, why) {
    const db = db_(), u = u_();
    if (!db || !u || !u.code || !(n > 0)) return Promise.resolve({ ok: false });
    return dreamSlot(u.code, 1).then(function (sl) {
        if (!sl.ok) return sl;
        return db.ref('users/' + u.code + '/kroom/dream').transaction(function (x) { return Math.max(0, Math.floor(Number(x) || 0)) + n; })
            .then(function (r) {
                if (!r || !r.committed) throw new Error('no commit');
                if (!u.kroom || typeof u.kroom !== 'object') u.kroom = {};
                u.kroom.dream = Math.max(0, Math.floor(Number(r.snapshot.val()) || 0));
                try { if (typeof addHistoryLog === 'function') { addHistoryLog(u, why + ' (오늘 ' + sl.n + '/' + DREAM_DAY + ')'); if (typeof saveFields === 'function') saveFields({ history: 1 }); } } catch (e) { }
                return { ok: true, n: sl.n };
            }).catch(function () { dreamSlot(u.code, -1); return { ok: false }; });   // 못 받았으면 잡은 칸을 돌려준다
    });
}
// 랭킹 — 서버
const RANK_PATH = 'rhythmRank';
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function srv() { try { if (typeof window.serverNow === 'function') { const t = Number(window.serverNow()); if (t > 1.5e12) return t; } } catch (e) { } return Date.now(); }
function myName() { const u = u_(); return (u && ((u.badge && u.badge.nickname) || u.name)) || (u && u.code) || ''; }
function rankList(sk, d) {
    const db = db_(); if (!db) return Promise.resolve([]);
    return db.ref(RANK_PATH + '/' + sk + '/' + d).once('value').then(function (snap) {
        const v = (snap && snap.val()) || {};
        return Object.keys(v).map(function (c) { const r = v[c] || {}; return { code: c, s: Number(r.s) || 0, fc: !!r.fc, ac: !!r.ac, n: r.n || c, at: Number(r.at) || 0 }; })
            .filter(function (r) { return r.s > 0; })
            .sort(function (a, b) { return b.s - a.s || a.at - b.at; });
    }).catch(function () { return []; });
}
// 끝까지 친 판 — 내 최고면 올린다 (아니어도 FC · AC 는 남긴다)
function rankSave(sk, d, run) {
    const db = db_(), u = u_(); if (!db || !u || !u.code) return Promise.resolve(false);
    return new Promise(function (res) {
        db.ref(RANK_PATH + '/' + sk + '/' + d + '/' + u.code).transaction(function (cur) {
            if (cur && Number(cur.s) >= run.s) {
                if ((run.fc && !cur.fc) || (run.ac && !cur.ac)) return Object.assign({}, cur, { fc: !!(cur.fc || run.fc), ac: !!(cur.ac || run.ac) });
                return;
            }
            return { s: run.s, r: rankOf(run.s, run.ac)[0], fc: !!(run.fc || (cur && cur.fc)), ac: !!(run.ac || (cur && cur.ac)), n: myName(), at: srv(),
                     c: run.c, nn: run.n, m: run.m, mc: run.mc };
        }, function (err, ok) { res(!err && !!ok); });
    });
}

// ==========================================
// 소리
// ==========================================
const AU = { ctx: null, bufs: {}, src: null, gain: null, startAt: 0, click: null, sess: null, lag: {}, lagNow: 0 };
function ctx() {
    if (!AU.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        AU.ctx = new C({ latencyHint: 'interactive' });
        AU.gain = AU.ctx.createGain(); AU.gain.gain.value = 1; AU.gain.connect(AU.ctx.destination);
        // 타격음 — 부드러운 건반 소리 (사인 두 겹이 빨리 사그라든다 + 아주 짧은 닿는 소리)
        const sr = AU.ctx.sampleRate, n = Math.floor(sr * 0.14), b = AU.ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) {
            const t = i / sr;
            d[i] = (Math.sin(2 * Math.PI * 1046.5 * t) * 0.55 + Math.sin(2 * Math.PI * 2093 * t) * 0.18) * Math.exp(-t * 38) * Math.min(1, t * 900)
                 + (Math.random() * 2 - 1) * 0.12 * Math.exp(-t * 700);
        }
        AU.click = b;
    }
    if (AU.ctx.state !== 'running') { try { AU.ctx.resume(); } catch (e) { } }
    return AU.ctx;
}
// ★ 이미 'playback' 이면 다시 쓰지 않는다 — 소리 장치가 도는 중에 소리 종류를 바꾸면 아이폰이 소리 장치를 끊어 버린다 (2026-11-11)
//   되돌릴 값은 처음 한 번만 적는다 (두 번째 곡에서 'playback' 을 원래 값으로 적어 두던 것)
function sessionOn() {
    try {
        if (!(navigator.audioSession && 'type' in navigator.audioSession)) return;
        if (AU.sess == null) AU.sess = navigator.audioSession.type;
        if (navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback';
    } catch (e) { }
}
function sessionOff() {
    try { if (navigator.audioSession && AU.sess != null) navigator.audioSession.type = AU.sess; } catch (e) { }
    AU.sess = null;
}
function decode(ab) {
    const c = ctx();
    return new Promise(function (res, rej) {
        try { const p = c.decodeAudioData(ab, res, rej); if (p && p.then) p.then(res, rej); } catch (e) { rej(e); }
    });
}
function loadSong(s) {
    if (AU.bufs[s.key]) return Promise.resolve(AU.bufs[s.key]);
    // ★ 앞 곡을 쥔 채 다음 곡을 풀면 잠깐 두 곡 몫(100 MB 넘게)을 쥔다 — 휴대폰에서 풀기가 막히지 않게 먼저 놓는다 (2026-11-11)
    Object.keys(AU.bufs).forEach(function (k) { delete AU.bufs[k]; });
    return fetch(s.audio).then(function (r) { if (!r.ok) throw new Error('곡을 받지 못했습니다 (' + r.status + ')'); return r.arrayBuffer(); })
        .then(decode).then(function (b) {
            // 풀어 둔 곡은 한 곡에 50 MB 가까이 — 곡이 일곱이라 지금 곡만 남긴다 (휴대폰 메모리)
            Object.keys(AU.bufs).forEach(function (k) { if (k !== s.key) delete AU.bufs[k]; });
            AU.bufs[s.key] = b; return b;
        });
}

// ==========================================
// 미리 듣기 (2026-11-11 사용자 「곡들 눌러보면 일정 부분을 한 10 초 정도 재생 — 예시 느낌으로」)
//   곡을 누르면 그 곡에서 노트가 가장 빽빽한 10 초(대개 후렴)를 마디 머리부터 · 앞뒤를 부드럽게 키우고 줄인다.
//   통째로 풀지 않는다 — 그 10 초 언저리 바이트만 받아(Range · 안 되면 받은 것에서 잘라) 그만큼만 풀어 튼다
//   (곡 하나를 다 풀면 50 MB 가까이라 일곱 곡을 눌러 보면 휴대폰이 버겁다 · mp3 는 192 kbps 고정 = 초당 24000 바이트).
//   누르는 손짓 안에서 소리 장치를 깨워 둔다 (아이폰).  START · 싱크 맞추기 · 닫기 · 화면을 떠나면 멈춘다.
// ==========================================
const PREVIEW_MS = 10000;
const MP3_BPS = 24000;                       // 192 kbps
const PV = { cur: null };
function previewAt(ch) {
    const c = (ch && ch.charts && (ch.charts.hard || ch.charts.normal)) || null;
    const ts = c ? c.notes.map(function (n) { return n[0]; }) : [];
    const dur = Number(ch && ch.dur) || 0;
    let best = 0, bi = 0, j = 0;
    for (let i = 0; i < ts.length; i++) {
        while (j < ts.length && ts[j] < ts[i] + PREVIEW_MS) j++;
        if (j - i > best) { best = j - i; bi = i; }
    }
    let t = ts.length ? ts[bi] : dur * 0.3;
    const bars = (ch && ch.bars) || [];
    let b = null;
    for (let i = 0; i < bars.length; i++) { if (bars[i] <= t + 30) b = bars[i]; else break; }
    if (b != null && t - b < 2500) t = b;                         // 마디 머리부터
    return Math.max(0, Math.min(t - 150, dur - PREVIEW_MS - 500));
}
// mp3 틀(프레임) 머리 — 다음 틀까지 이어지는 자리라야 진짜 머리다 (MPEG-1 Layer III)
const MP3_KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], MP3_SR = [44100, 48000, 32000];
function mp3Len(u, i) {
    if (i + 4 > u.length || u[i] !== 0xFF || (u[i + 1] & 0xFE) !== 0xFA) return 0;
    const bi = u[i + 2] >> 4, si = (u[i + 2] >> 2) & 3, pad = (u[i + 2] >> 1) & 1;
    if (bi === 0 || bi === 15 || si === 3) return 0;
    return Math.floor(144000 * MP3_KBPS[bi] / MP3_SR[si]) + pad;
}
function mp3Sync(u) {
    for (let i = 0; i + 4 < u.length && i < 8192; i++) {
        const n = mp3Len(u, i);
        if (n && mp3Len(u, i + n) && mp3Len(u, i + n + mp3Len(u, i + n))) return i;
    }
    return -1;
}
function previewChunk(s, at) {
    const a = Math.max(0, Math.floor(at / 1000 * MP3_BPS) - 2400);
    const b = Math.floor((at + PREVIEW_MS + 800) / 1000 * MP3_BPS) + 2400;
    return fetch(s.audio, { headers: { Range: 'bytes=' + a + '-' + b } }).then(function (r) {
        if (!r.ok) throw new Error('곡을 받지 못했습니다 (' + r.status + ')');
        return r.arrayBuffer().then(function (ab) { return r.status === 206 ? ab : ab.slice(a, b + 1); });
    }).then(function (ab) {
        const i = mp3Sync(new Uint8Array(ab));
        if (i < 0) throw new Error('mp3 머리를 못 찾았습니다');
        // 이 조각의 첫 틀 — 곡에서 몇 초쯤 (앞머리 태그 · 빈 틀 · 인코더 지연만큼 실제는 59 ms 이르다 — 통째로 푼 것과 대 봄)
        const from = (a + i) / MP3_BPS - 0.059;
        return decode(ab.slice(i)).then(function (buf) { return { buf: buf, skip: Math.max(0, at / 1000 - from) }; });
    });
}
function previewStop(fast) {
    const my = PV.cur; PV.cur = null;
    if (!my) return;
    clearTimeout(my.t);
    const c = AU.ctx, g = my.g, n = my.node;
    if (!c || !g || !n) return;
    const out = fast ? 0.08 : 0.5;
    try { const t = c.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + out); n.stop(t + out + 0.02); } catch (e) { try { n.stop(); } catch (x) { } }
}
function previewPlay(s) {
    previewStop(true);
    if (!s || !s.audio) return;
    ctx();                                                        // 손짓 안에서 소리 장치를 깨운다
    const my = { key: s.key, at: null, armed: false, t: 0, g: null, node: null, t0: 0, skip: 0 };
    PV.cur = my;
    loadChart(s).then(function (ch) {
        if (PV.cur !== my) return null;
        my.at = previewAt(ch);
        return previewChunk(s, my.at);
    }).then(function (o) {
        if (!o || PV.cur !== my || !AU.ctx) return;
        const c = AU.ctx, L = PREVIEW_MS / 1000;
        const src = c.createBufferSource(); src.buffer = o.buf;
        const g = c.createGain(); g.gain.value = 0;
        src.connect(g); g.connect(c.destination);
        const t = c.currentTime + 0.03;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.85, t + 0.6);
        g.gain.setValueAtTime(0.85, t + L - 1.6);
        g.gain.linearRampToValueAtTime(0, t + L);
        src.start(t, o.skip, L + 0.05);
        my.node = src; my.g = g; my.t0 = t; my.skip = o.skip; my.armed = true;
        my.t = setTimeout(function () { if (PV.cur === my) previewStop(); }, PREVIEW_MS + 150);
    }).catch(function (e) { console.warn('[🎵] 미리 듣기', e && e.message); if (PV.cur === my) PV.cur = null; });
}
window.rhythmPreviewState = function () { const m = PV.cur, c = AU.ctx; return m ? { key: m.key, at: m.at, armed: m.armed, pos: (m.armed && c) ? Math.round(m.at + (c.currentTime - m.t0) * 1000) : null, gain: m.g ? m.g.gain.value : null } : null; };
const CH = {};
function loadChart(s) {
    if (CH[s.key]) return Promise.resolve(CH[s.key]);
    return fetch(s.chart, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('채보를 받지 못했습니다 (' + r.status + ')'); return r.json(); })
        .then(function (j) { CH[s.key] = j; return j; });
}
function playClick(v) {
    if (!SET.hit || !AU.ctx || !AU.click) return;
    try {
        const s = AU.ctx.createBufferSource(); s.buffer = AU.click;
        const g = AU.ctx.createGain(); g.gain.value = v || 0.35;
        s.connect(g); g.connect(AU.ctx.destination); s.start();
    } catch (e) { }
}
// 곡의 지금 시각 (ms) — 소리가 실제로 나가는 때에 맞춘다
//   ★ 2026-11-10 사용자 「박자가 이상하게 어긋나」
//     · 소리 시계(getOutputTimestamp)는 칸 단위로 들쭉날쭉하다 — 화면 시계(performance.now)에 붙여 두고 천천히만 따라가게 (떨림 · 판정 흔들림을 없앤다)
//     · mp3 앞 공백 — 브라우저마다 앞 25 ms 를 자르기도 · 안 자르기도 한다. 채보의 앞머리 지문(head)과 받은 곡을 대 보고 그만큼 민다 (AU.lag)
function rawMs() {
    const c = AU.ctx; if (!c) return 0;
    const lat = c.outputLatency || c.baseLatency || 0;
    let t = c.currentTime - lat;
    try {
        if (c.getOutputTimestamp && c.state === 'running') {
            const ts = c.getOutputTimestamp();
            if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
                const est = ts.contextTime + Math.max(0, (performance.now() - ts.performanceTime)) / 1000;
                // 멈췄다 이어 갈 때 묵은 값이 남아 앞질러 가지 않게 — 지금 시각보다 앞서지 않고, 많이 뒤처지지 않게
                if (est <= c.currentTime + 0.005 && est >= c.currentTime - 0.4) t = est;
            }
        }
    } catch (e) { }
    return (t - AU.startAt) * 1000 - (AU.lagNow || 0);
}
const CK = { base: null };
function clockReset() { CK.base = null; }
// 한 프레임에 한 번 — 소리 시계 쪽으로 천천히 끌어 둔다
function clockTick() {
    const pn = performance.now();
    if (!AU.ctx || AU.ctx.state !== 'running') { CK.base = null; return; }
    const want = rawMs() - pn;
    if (CK.base == null || Math.abs(want - CK.base) > 80) CK.base = want;        // 처음 · 멈췄다 이어 감 — 바로 맞춘다
    else CK.base += (want - CK.base) * 0.02;                                     // 그 밖에는 아주 천천히만
}
// 곡 시각 (싱크 빼기 전)
function clockMs() {
    if (!AU.ctx || AU.ctx.state !== 'running') return rawMs();
    if (CK.base == null) clockTick();
    return performance.now() + CK.base;
}
// ★ 판정 시계 — 판정 싱크만큼 당겨 본다 (+ 면 늦게 눌러도 맞게)
function songMs() { return clockMs() - (Number(SET.offset) || 0); }
// ★ 화면 시계 — 한 프레임 앞 + 화면 싱크 (+ 면 노트가 더 일찍 닿는다)
const FR = { last: 0, dt: 16.7 };
function frameTick() {
    const t = performance.now();
    if (FR.last) { const d = t - FR.last; if (d > 4 && d < 50) FR.dt += (d - FR.dt) * 0.1; }
    FR.last = t;
}
function visMs() { return clockMs() + Math.min(25, FR.dt) + (Number(SET.vis) || 0); }
// 손가락이 닿은 그 순간 — 이벤트를 늦게 받았으면 그만큼 거슬러 올라간다
function evAge(e) {
    const ts = e && Number(e.timeStamp);
    if (!ts) return 0;
    const a = performance.now() - ts;
    return (a >= 0 && a <= 250) ? a : 0;
}
// 받은 곡의 앞머리를 채보의 지문과 대 본다 — 받은 곡이 늦게 시작하면 + (ms)
function headLag(buf, head) {
    try {
        if (!head || !head.length || !buf) return 0;
        const sr = buf.sampleRate, nb = Math.min(head.length + 140, Math.floor(buf.length / sr * 1000));
        const a = buf.getChannelData(0), b = buf.numberOfChannels > 1 ? buf.getChannelData(1) : a;
        const env = new Float32Array(nb);
        let mx = 0;
        for (let i = 0; i < nb; i++) {
            const s0 = Math.floor(i * sr / 1000), s1 = Math.floor((i + 1) * sr / 1000);
            let sum = 0;
            for (let j = s0; j < s1; j++) sum += Math.abs((a[j] + b[j]) * 0.5);
            env[i] = sum / Math.max(1, s1 - s0);
            if (env[i] > mx) mx = env[i];
        }
        let best = 0, bc = -1;
        for (let lag = -20; lag <= 120; lag++) {
            let num = 0, a2 = 0, b2 = 0;
            for (let i = 0; i < head.length; i++) {
                const j = i + lag; if (j < 0 || j >= nb) continue;
                const v = env[j] / (mx || 1);
                num += head[i] * v; a2 += head[i] * head[i]; b2 += v * v;
            }
            const c = num / Math.sqrt(a2 * b2 + 1e-12);
            if (c > bc) { bc = c; best = lag; }
        }
        return bc > 0.8 ? best : 0;
    } catch (e) { return 0; }
}

// ==========================================
// 화면
// ==========================================
let OV = null, ST = null, CV = null, G2 = null, UI = null;
// ★ 판 바탕(표지 · 바닥 · 판정선)은 밑 장(CB)에 한 번만 그리고, 위 장(CV)에는 움직이는 것만 (2026-11-11 사용자 「발열 · 렉」)
let CB = null, GB = null;
const STILL = { key: null, clr: false, pauseAt: 0, dirty: false };
let rot = false, VW = 0, VH = 0;
function css() {
    if (document.getElementById('rg-css')) return;
    const s = document.createElement('style');
    s.id = 'rg-css';
    s.textContent = [
        '#rg-ov{position:fixed;inset:0;z-index:2147483000;background:#07070d;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;font-family:inherit;color:#eef;}',
        '#rg-st{position:absolute;left:0;top:0;transform-origin:0 0;overflow:hidden;}',
        '#rg-st canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}',
        // ★ 리듬 게임이 덮고 있는 동안 밑의 광장은 칠하지 않는다 — 남들이 걸으면 보이지도 않는 광장을 계속 다시 칠했다 (2026-11-11 발열)
        'body.rg-on #plaza-view{visibility:hidden !important;}',
        '#rg-ui{position:absolute;inset:0;}',
        '.rg-bg{position:absolute;inset:0;background:#000;}',
        '.rg-sel{position:absolute;inset:0;display:flex;gap:14px;padding:14px 18px;box-sizing:border-box;}',
        '.rg-col{display:flex;flex-direction:column;gap:10px;min-width:0;}',
        '.rg-h{font-size:12px;letter-spacing:4px;color:#9ab;opacity:.9;}',
        '.rg-left{width:min(34%,240px);}',
        '.rg-set{align-self:flex-start;padding:7px 14px;font-size:12px;background:rgba(255,255,255,.08);}',
        '.rg-meta{font-size:12px;color:#99a;letter-spacing:.5px;}',
        '.rg-acts{display:flex;gap:10px;align-items:center;margin-top:4px;}',
        '.rg-ic{width:48px;height:48px;padding:0;font-size:20px;background:rgba(255,255,255,.08);}',
        '.rg-box.rg-setbox{min-width:250px;max-width:340px;align-items:stretch;gap:12px;}',
        '.rg-setbox .rg-row{justify-content:space-between;font-size:13px;}',
        '.rg-tog{padding:6px 14px;font-size:12px;min-width:84px;}',
        '.rg-keys{display:flex;gap:6px;}',
        '.rg-key{flex:1;min-width:0;height:34px;padding:0;font-size:14px;font-weight:bold;background:rgba(255,255,255,.08);border:1px solid rgba(220,230,255,.25);}',
        '.rg-key.on{background:rgba(235,242,255,.92);color:#14141c;}',
        '.rg-songs{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-right:2px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent;}',
        '.rg-song{flex-shrink:0;display:flex;gap:10px;align-items:center;padding:8px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);cursor:pointer;}',
        '.rg-song.on{background:rgba(255,255,255,.16);border-color:var(--c);box-shadow:0 0 14px -4px var(--c);}',
        '.rg-song i.rg-sq{width:52px;height:52px;border-radius:8px;background:#000 center/cover no-repeat;border:1px solid rgba(255,255,255,.14);flex-shrink:0;}',
        '.rg-song b{display:block;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.rg-song small{font-size:11px;color:#aab;}',
        '.rg-big{flex:1;display:flex;gap:16px;align-items:center;min-width:0;}',
        '.rg-jacket{width:min(36%,230px);aspect-ratio:1;height:auto;border-radius:14px;background:#000 center/cover no-repeat;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 40px rgba(0,0,0,.6);flex-shrink:0;}',
        '.rg-info{display:flex;flex-direction:column;gap:9px;min-width:0;flex:1;}',
        '.rg-title{font-size:22px;font-weight:bold;color:#fff;line-height:1.2;}',
        '.rg-diffs{display:flex;gap:8px;flex-wrap:wrap;}',
        '.rg-diff{flex:1;min-width:84px;padding:10px 6px;border-radius:10px;border:2px solid var(--c);background:rgba(0,0,0,.3);color:#fff;text-align:center;cursor:pointer;font-family:inherit;}',
        '.rg-diff.on{background:var(--c);color:#111;}',
        '.rg-diff b{display:block;font-size:13px;letter-spacing:2px;}',
        '.rg-diff i{font-style:normal;font-size:20px;font-weight:bold;}',
        '.rg-diff small{display:block;font-size:10px;opacity:.85;}',
        '.rg-row{display:flex;gap:8px;align-items:center;font-size:12px;color:#ccd;flex-wrap:wrap;}',
        '.rg-step{display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.07);border-radius:9px;padding:3px 4px;}',
        '.rg-step button,.rg-btn{border:none;border-radius:8px;background:rgba(255,255,255,.14);color:#fff;font-family:inherit;cursor:pointer;}',
        '.rg-step button{width:30px;height:28px;font-size:16px;}',
        '.rg-step span{min-width:52px;text-align:center;font-weight:bold;}',
        '.rg-btn{padding:10px 18px;font-size:14px;}',
        '.rg-go{background:linear-gradient(135deg,#7ec8ff,#b58cff);color:#111;font-weight:bold;font-size:17px;padding:12px 30px;letter-spacing:3px;}',
        '.rg-x{position:absolute;top:10px;right:12px;width:36px;height:36px;font-size:18px;z-index:5;}',
        '.rg-best{font-size:12px;color:#ffe9a8;}',
        '.rg-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);font-size:15px;letter-spacing:2px;}',
        '.rg-pause{position:absolute;top:8px;left:10px;width:40px;height:34px;border-radius:9px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.35);color:#fff;font-size:15px;z-index:4;}',
        '.rg-modal{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.66);z-index:6;}',
        // 계속 — 3 · 2 · 1 (2026-11-12)
        '.rg-cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:6;pointer-events:none;font-size:96px;font-weight:900;color:#fff;text-shadow:0 0 24px rgba(160,190,255,.75),0 4px 18px #000;font-variant-numeric:tabular-nums;}',
        '.rg-cd.go{animation:rgCd 1s ease-out both;}',
        '@keyframes rgCd{0%{opacity:0;transform:scale(1.6);}18%{opacity:1;transform:scale(1);}80%{opacity:1;transform:scale(.96);}100%{opacity:0;transform:scale(.9);}}',
        '.rg-box{background:rgba(20,20,34,.96);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:18px 22px;display:flex;flex-direction:column;gap:10px;align-items:center;min-width:240px;}',
        '.rg-res{display:flex;gap:22px;align-items:center;}',
        '.rg-rank{font-size:84px;font-weight:900;line-height:1;text-shadow:0 0 24px currentColor;}',
        '.rg-tbl{font-size:13px;line-height:1.75;}',
        '.rg-tbl b{display:inline-block;min-width:104px;}',
        '.rg-rot{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:11px;color:#889;}',
        // 랭크 글자 · 싱크 맞추기 · 랭킹
        '.rg-rk{font-style:normal;font-weight:900;color:var(--r);text-shadow:0 0 8px var(--r);}',
        '.rg-diff.on .rg-rk{color:#111;text-shadow:none;}',
        '.rg-cal-box{position:absolute;top:10px;left:12px;width:min(46%,330px);background:rgba(12,12,22,.86);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;z-index:3;box-sizing:border-box;}',
        '.rg-cal-tip{font-size:11px;color:#99a;line-height:1.45;}',
        '.rg-rkbox{width:min(92%,460px);max-height:88%;box-sizing:border-box;align-items:stretch;padding:12px 14px;}',
        '.rg-tab{flex:1;padding:6px 4px;font-size:12px;letter-spacing:1px;border:2px solid var(--c);background:transparent;}',
        '.rg-tab.on{background:var(--c);color:#111;font-weight:bold;}',
        '.rg-rklist{overflow-y:auto;min-height:0;flex:1 1 auto;font-size:13px;}',
        '.rg-rkrow{display:flex;align-items:center;gap:8px;padding:6px 6px;border-bottom:1px solid rgba(255,255,255,.07);}',
        '.rg-rkrow.me{background:rgba(255,255,255,.1);border-radius:8px;}',
        '.rg-rkrow .no{width:24px;text-align:right;color:#aab;font-weight:bold;}',
        '.rg-rkrow .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.rg-rkrow .rg-rk{width:34px;text-align:center;}',
        '.rg-rkrow .pc{width:62px;text-align:right;font-family:Georgia,serif;}',
        '.rg-rkrow small{width:22px;font-size:10px;color:#ffe066;}'
    ].join('\n');
    document.head.appendChild(s);
}
function fit() {
    if (!OV) return;
    const w = window.innerWidth, h = window.innerHeight;
    rot = h > w;
    VW = rot ? h : w; VH = rot ? w : h;
    ST.style.width = VW + 'px'; ST.style.height = VH + 'px';
    ST.style.transform = rot ? ('translateX(' + w + 'px) rotate(90deg)') : 'none';
    // ★ 2.5 → 2 — 휴대폰(3배 화면)에서 칠할 점이 3분의 1 넘게 준다 · 눈으로는 거의 같다 (2026-11-11 발열)
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    CV.width = Math.round(VW * dpr); CV.height = Math.round(VH * dpr);
    G2.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (CB) { CB.width = CV.width; CB.height = CV.height; GB.setTransform(dpr, 0, 0, dpr, 0, 0); }
    STILL.key = null; STILL.clr = false; STILL.dirty = true;
    layout();
}
// 손가락 자리 → 무대 자리 (세워 두면 돌려서)
function toStage(cx, cy) {
    if (!rot) return { x: cx, y: cy };
    return { x: cy, y: window.innerWidth - cx };
}

function open() {
    if (!canPlay()) { say('아직 준비 중입니다.'); return; }
    if (OV) return;
    css();
    OV = document.createElement('div'); OV.id = 'rg-ov';
    ST = document.createElement('div'); ST.id = 'rg-st';
    CB = document.createElement('canvas'); GB = CB.getContext('2d', { alpha: false }); CB.style.display = 'none';
    CV = document.createElement('canvas'); G2 = CV.getContext('2d');
    UI = document.createElement('div'); UI.id = 'rg-ui';
    ST.appendChild(CB); ST.appendChild(CV); ST.appendChild(UI); OV.appendChild(ST);
    STILL.key = null; STILL.clr = false;
    document.body.appendChild(OV);
    document.body.classList.add('rg-on');
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'click', 'wheel', 'contextmenu'].forEach(function (t) {
        OV.addEventListener(t, function (e) { e.stopPropagation(); if (t === 'contextmenu') e.preventDefault(); }, { passive: t !== 'contextmenu' });
    });
    OV.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKeyUp, true);
    checkNeeds().then(function (got) { if (got && MODE === 'menu') menu(); });
    fit();
    songTop = null;            // 새로 열면 고른 곡이 보이게
    menu();
    raf();
}
function close() {
    previewStop(true);
    calStop(); C = null;
    stopPlay();
    if (!OV) return;
    window.removeEventListener('resize', fit);
    window.removeEventListener('orientationchange', fit);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('keydown', onKey, true);
    window.removeEventListener('keyup', onKeyUp, true);
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) { }
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { }
    sessionOff();
    document.body.classList.remove('rg-on');
    OV.remove(); OV = null; ST = null; CV = null; G2 = null; UI = null; CB = null; GB = null; STILL.key = null;
    MODE = 'off';
}
window.rhythmOpen = open;
// 🎧 플레이리스트(playlist.js)가 곡 목록을 빌려 쓴다 (2026-11-11) — 곡을 새로 넣으면 플레이리스트에도 저절로 들어간다
window.rhythmSongs = function () { return SONGS.map(function (s) { return { key: s.key, title: s.title, artist: s.artist, audio: s.audio, cover: s.cover, color: s.color, price: s.price || 0, need: s.need ? needText(s) : '', needSpec: s.need || null, locked: !owned(s) }; }); };
window.rhythmCheckNeeds = checkNeeds;
// 플레이리스트에서 해금 — { ok, why }
window.rhythmBuy = function (key) { return buySong(SONGS.find(function (s) { return s.key === key; })); };
window.rhythmClose = close;

// ==========================================
// 곡 고르기
// ==========================================
let MODE = 'off';        // menu · load · play · pause · result
function song() { return SONGS.find(function (s) { return s.key === SET.song; }) || SONGS[0]; }
function coverCss(x) { return x.cover ? ' style="background-image:url(\'' + x.cover + '\')"' : ''; }
function bestOf(k, d) { const b = loadJ(BEST_KEY, {}); return b[k + '/' + d] || null; }
// 끌어서 내리는 목록 — 화면을 돌려 그려도(세로로 든 휴대폰) 손가락 방향대로 · 끌었으면 그 손짓은 누름으로 치지 않는다
function dragScroll(el) {
    if (!el || el._drag) return;
    el._drag = true;
    let st = null;
    el.addEventListener('pointerdown', function (e) { const p = toStage(e.clientX, e.clientY); st = { y: p.y, top: el.scrollTop, id: e.pointerId, moved: false }; });
    el.addEventListener('pointermove', function (e) {
        if (!st || e.pointerId !== st.id) return;
        const dy = toStage(e.clientX, e.clientY).y - st.y;
        if (Math.abs(dy) > 6) st.moved = true;
        if (st.moved) el.scrollTop = st.top - dy;
    });
    const end = function () { if (st && st.moved) el._dragAt = Date.now(); st = null; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('pointerleave', end);
    el.addEventListener('click', function (e) { if (el._dragAt && Date.now() - el._dragAt < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
    el.addEventListener('wheel', function (e) { el.scrollTop += e.deltaY; e.preventDefault(); }, { passive: false });
}
let songTop = null;       // 곡 목록을 다시 그려도 내려 둔 자리 그대로
function menu() {
    const sl0 = UI && UI.querySelector('.rg-songs');
    if (sl0) songTop = sl0.scrollTop;
    MODE = 'menu';
    const s = song();
    const chart = CH[s.key];
    if (!chart) loadChart(s).then(function () { if (MODE === 'menu' && song().key === s.key) menu(); }).catch(function () { });
    const songs = SONGS.map(function (x) {
        return '<div class="rg-song' + (x.key === s.key ? ' on' : '') + '" data-song="' + x.key + '" style="--c:' + x.color + '"><i class="rg-sq"' + coverCss(x) + '></i><div style="min-width:0"><b>' + esc(x.title) + '</b><small>' + esc(x.artist) + (owned(x) ? '' : x.price ? ' · 🔒 ' + x.price.toLocaleString() + 'P' : ' · 🔒 ' + needText(x)) + '</small></div></div>';
    }).join('');
    const bpm = chart ? (Array.isArray(chart.bpm) ? chart.bpm[0] + '–' + chart.bpm[1] : chart.bpm) : '…';
    const len = chart ? Math.floor(chart.dur / 60000) + ':' + String(Math.floor(chart.dur / 1000) % 60).padStart(2, '0') : '';
    const diffs = DIFFS.map(function (d) {
        const c = chart && chart.charts[d[0]];
        const b = bestOf(s.key, d[0]);
        const rk = b ? rankOf(b.score, b.ap) : null;
        return '<button class="rg-diff' + (SET.diff === d[0] ? ' on' : '') + '" data-diff="' + d[0] + '" style="--c:' + d[3] + '"><b>' + d[1] + '</b><i>' + (c ? c.level : '·') + '</i>'
            + '<small>' + (b ? '<em class="rg-rk" style="--r:' + rk[2] + '">' + rk[0] + '</em> ' + (b.score / 10000).toFixed(2) + '%' + (b.ap ? '' : b.fc ? ' · FC' : '') : '—') + '</small></button>';
    }).join('');
    UI.innerHTML = '<div class="rg-bg"></div>'
        + '<button class="rg-btn rg-x" data-k="x">✕</button>'
        + '<div class="rg-sel">'
        // ★ 2026-11-11 사용자 「인터페이스 깔끔하게 — 너무 번잡해 · 하드 밑 글씨는 없애고」
        //   설명 글 · 노트 수 · 싱크 숫자 · 「가로로 눕혀서」 글을 뺐다. 속도 · 타격음 · 싱크 맞추기는 ⚙ 설정 창 하나로.
        + '<div class="rg-col rg-left"><div class="rg-h">RHYTHM</div><div class="rg-songs">' + songs + '</div>'
        + '<button class="rg-btn rg-set" data-k="set">⚙ 설정</button></div>'
        + '<div class="rg-big"><div class="rg-jacket"' + coverCss(s) + '></div><div class="rg-info">'
        + '<div class="rg-title">' + esc(s.title) + '</div><div class="rg-meta">' + esc(s.artist) + (chart ? ' · BPM ' + bpm + ' · ' + len : '') + '</div>'
        + '<div class="rg-diffs">' + diffs + '</div>'
        + '<div class="rg-acts">' + (owned(s) ? '<button class="rg-btn rg-go" data-k="go">START</button>' : s.price ? '<button class="rg-btn rg-go" data-k="buy">🔒 ' + s.price.toLocaleString() + 'P 해금</button>' : '<button class="rg-btn rg-go" data-k="buy">🔒 잠김</button>')
        + '<button class="rg-btn rg-ic" data-k="rank" title="랭킹">🏆</button></div>'
        + '</div></div></div>';
    const sl = UI.querySelector('.rg-songs');
    if (sl) {
        dragScroll(sl);
        if (songTop != null) sl.scrollTop = songTop;
        else { const on = sl.querySelector('.rg-song.on'); if (on) sl.scrollTop = Math.max(0, on.offsetTop - sl.offsetTop - 8); }
    }
    Array.prototype.forEach.call(UI.querySelectorAll('[data-song]'), function (el) { el.onclick = function () { SET.song = el.dataset.song; saveSet(); previewPlay(song()); menu(); }; });
    Array.prototype.forEach.call(UI.querySelectorAll('[data-diff]'), function (el) { el.onclick = function () { SET.diff = el.dataset.diff; saveSet(); menu(); }; });
    Array.prototype.forEach.call(UI.querySelectorAll('[data-k]'), function (el) {
        el.onclick = function () {
            const k = el.dataset.k;
            if (k === 'x') { close(); return; }
            if (k === 'go') { saveSet(); start(); return; }
            if (k === 'buy') { if (song().price) buyModal(song()); else needModal(song()); return; }
            if (k === 'set') { setModal(); return; }
            if (k === 'rank') { rankModal(SET.diff); return; }
        };
    });
}
// ⚙ 설정 — 속도 · 타격음 · 싱크 맞추기 (곡 고르기 화면을 다시 그리지 않고 그 자리에서 바뀐다)
function setModal() {
    const old = UI.querySelector('.rg-setmodal'); if (old) old.remove();
    const m = document.createElement('div'); m.className = 'rg-modal rg-setmodal';
    m.innerHTML = '<div class="rg-box rg-setbox"><div style="display:flex;align-items:center;gap:8px;"><b style="flex:1;letter-spacing:2px;">설정</b><button class="rg-btn" data-k="c" style="padding:5px 10px;">✕</button></div>'
        + '<div class="rg-row"><span>속도</span><span class="rg-step"><button data-k="sp-">−</button><span data-v="sp"></span><button data-k="sp+">+</button></span></div>'
        + '<div class="rg-row"><span>타격음</span><button class="rg-btn rg-tog" data-k="hit"></button></div>'
        + '<div class="rg-row"><span>싱크</span><button class="rg-btn rg-tog" data-k="cal">⏱ 맞추기</button></div>'
        + '<div class="rg-cal-tip" data-v="sync" style="text-align:right;"></div>'
        // 키 배치 — PC 에서만 (판정선 밑 키 표시와 같은 때)
        + (showKeys() ? '<div class="rg-row" style="flex-direction:column;align-items:stretch;gap:6px;"><div style="display:flex;justify-content:space-between;align-items:center;"><span>키 배치</span>'
            + '<button class="rg-btn" data-k="kdef" style="padding:4px 10px;font-size:11px;">기본값</button></div>'
            + '<div class="rg-keys">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<button class="rg-btn rg-key" data-lane="' + i + '"></button>'; }).join('') + '</div>'
            + '<div class="rg-cal-tip" data-v="khint">바꿀 줄을 누르고 원하는 키를 누르세요</div></div>' : '')
        + '</div>';
    UI.appendChild(m);
    const paint = function () {
        m.querySelector('[data-v="sp"]').textContent = SET.speed.toFixed(1);
        m.querySelector('[data-k="hit"]').textContent = SET.hit ? 'ON' : 'OFF';
        m.querySelector('[data-v="sync"]').textContent = '판정 ' + sgn(SET.offset) + 'ms · 화면 ' + sgn(SET.vis) + 'ms';
        const ks = keys();
        Array.prototype.forEach.call(m.querySelectorAll('[data-lane]'), function (b) {
            const i = Number(b.dataset.lane);
            b.textContent = bindLane === i ? '…' : keyLabel(ks[i]);
            b.classList.toggle('on', bindLane === i);
        });
        const h = m.querySelector('[data-v="khint"]');
        if (h) h.textContent = bindLane != null ? (bindLane + 1) + '번 줄 — 원하는 키를 누르세요 (Esc 는 그만두기)' : '바꿀 줄을 누르고 원하는 키를 누르세요';
    };
    window.__rgKeyPaint = function () { if (m.isConnected) paint(); };
    paint();
    m.onclick = function (e) { if (e.target === m) { bindLane = null; m.remove(); } };
    Array.prototype.forEach.call(m.querySelectorAll('[data-lane]'), function (b) {
        b.onclick = function (e) { e.stopPropagation(); const i = Number(b.dataset.lane); bindLane = (bindLane === i) ? null : i; paint(); };
    });
    Array.prototype.forEach.call(m.querySelectorAll('[data-k]'), function (el) {
        el.onclick = function (e) {
            e.stopPropagation();
            const k = el.dataset.k;
            if (k === 'c') { bindLane = null; m.remove(); return; }
            if (k === 'cal') { bindLane = null; m.remove(); saveSet(); calEnter(); return; }
            if (k === 'kdef') { bindLane = null; SET.keys = KEYS_DEF.slice(); }
            if (k === 'sp-') SET.speed = Math.max(1, Math.round((SET.speed - 0.5) * 10) / 10);
            if (k === 'sp+') SET.speed = Math.min(12, Math.round((SET.speed + 0.5) * 10) / 10);
            if (k === 'hit') SET.hit = !SET.hit;
            saveSet(); paint();
        };
    });
}
// 🔒 해금 창 — 리듬 게임 위(전체 화면)에 띄우므로 사내 알림창 대신 제 창으로
function buyModal(s) {
    const old = UI.querySelector('.rg-buymodal'); if (old) old.remove();
    const u = u_();
    const pts = Math.floor(Number(u && u.points) || 0);
    const m = document.createElement('div'); m.className = 'rg-modal rg-buymodal';
    m.innerHTML = '<div class="rg-box" style="gap:10px;align-items:center;text-align:center;min-width:260px;">'
        + '<b style="font-size:16px;">🔒 「' + esc(s.title) + '」</b>'
        + '<div style="font-size:13px;color:#ccd;line-height:1.7;">' + s.price.toLocaleString() + 'P 로 해금하면 계속 칠 수 있습니다<br><small style="color:#99a;">보유 ' + pts.toLocaleString() + ' P</small></div>'
        + '<div data-v="why" style="font-size:12px;color:#ff9b9b;min-height:1em;"></div>'
        + '<div style="display:flex;gap:10px;"><button class="rg-btn rg-go" data-k="ok"' + (pts < s.price ? ' disabled style="opacity:.45"' : '') + '>해금</button><button class="rg-btn" data-k="no">취소</button></div></div>';
    UI.appendChild(m);
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector('[data-k="no"]').onclick = function () { m.remove(); };
    m.querySelector('[data-k="ok"]').onclick = function () {
        const r = buySong(s);
        if (!r.ok) { m.querySelector('[data-v="why"]').textContent = r.why || '해금하지 못했습니다'; return; }
        m.remove();
        if (MODE === 'menu') menu();
    };
    if (pts < s.price) m.querySelector('[data-v="why"]').textContent = '포인트가 모자랍니다';
}
// 🏆 랭킹 — 지금 곡 · 난이도 (위 칸으로 난이도를 바꾼다)
function rankModal(d) {
    const s = song();
    // ★ 랭킹 창만 걷는다 — 결과 화면도 .rg-modal 이라, 전에는 랭킹을 열면 결과가 지워져 닫으면 까만 화면만 남았다 (2026-11-11 사용자)
    const old = UI.querySelector('.rg-rkmodal'); if (old) old.remove();
    const m = document.createElement('div'); m.className = 'rg-modal rg-rkmodal';
    const tabs = DIFFS.map(function (x) { return '<button class="rg-btn rg-tab' + (x[0] === d ? ' on' : '') + '" data-d="' + x[0] + '" style="--c:' + x[3] + '">' + x[1] + '</button>'; }).join('');
    m.innerHTML = '<div class="rg-box rg-rkbox"><div style="display:flex;align-items:center;gap:8px;width:100%;"><b style="flex:1;">🏆 ' + esc(s.title) + '</b><button class="rg-btn" data-k="c" style="padding:5px 10px;">✕</button></div>'
        + '<div style="display:flex;gap:6px;">' + tabs + '</div><div class="rg-rklist">불러오는 중…</div></div>';
    UI.appendChild(m);
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    m.querySelector('[data-k="c"]').onclick = function () { m.remove(); };
    Array.prototype.forEach.call(m.querySelectorAll('[data-d]'), function (b) { b.onclick = function () { rankModal(b.dataset.d); }; });
    rankList(s.key, d).then(function (list) {
        const box = m.querySelector('.rg-rklist'); if (!box || !m.isConnected) return;
        const me = (u_() || {}).code;
        if (!list.length) { box.innerHTML = '<div style="color:#889;padding:14px 0;text-align:center;">아직 기록이 없습니다</div>'; return; }
        dragScroll(box);
        box.innerHTML = list.slice(0, 50).map(function (r, i) {
            const rk = rankOf(r.s, r.ac);
            return '<div class="rg-rkrow' + (r.code === me ? ' me' : '') + '"><span class="no">' + (i + 1) + '</span><span class="nm">' + esc(r.n) + '</span>'
                + '<em class="rg-rk" style="--r:' + rk[2] + '">' + rk[0] + '</em><span class="pc">' + (r.s / 10000).toFixed(2) + '%</span><small>' + (r.ac ? 'AC' : r.fc ? 'FC' : '') + '</small></div>';
        }).join('');
    });
}

// ==========================================
// 판
// ==========================================
let P = null;        // 지금 판
function start() {
    if (!owned(song())) { if (song().price) buyModal(song()); else needModal(song()); return; }
    previewStop(true);
    const s = song(), d = SET.diff;
    // 손짓 안에서 — 소리 · 전체 화면 · 가로 고정 (소리 종류를 먼저 — 도는 소리 장치 위에서 바꾸지 않게)
    sessionOn(); ctx(); keepAlive();
    try {
        if (!document.fullscreenElement && OV.requestFullscreen) {
            OV.requestFullscreen({ navigationUI: 'hide' }).then(function () {
                try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () { }); } catch (e) { }
            }).catch(function () { });
        }
    } catch (e) { }
    MODE = 'load';
    UI.innerHTML = '<div class="rg-bg"></div><div class="rg-load">불러오는 중…</div>';
    Promise.all([loadSong(s), loadChart(s)]).then(function (r) {
        if (!OV || MODE !== 'load') return;
        begin(s, d, r[0], r[1]);
    }).catch(function (e) {
        if (!OV) return;
        say('리듬 게임을 열지 못했습니다.\n\n' + (e && e.message ? e.message : e));
        menu();
    });
}
function begin(s, d, buf, chart) {
    const c = chart.charts[d];
    const notes = c.notes.map(function (n, i) {
        const k = n[2] === 3 ? 2 : n[2];               // 지그재그(3)는 슬라이드처럼 판정 — 초록으로만 그린다
        return { i: i, t: n[0], lane: n[1], x: xOfLane(n[1]), w: NOTE_W[k] || 0.15, k: k, z: n[2] === 3, len: k === 1 ? n[3] : 0, ch: k === 2 ? n[3] : 0,
                 done: false, j: null, hold: null, tail: null };
    });
    // 슬라이드 줄 — 같은 번호끼리 차례대로 (희미한 줄로 잇는다)
    const chains = {};
    notes.forEach(function (n) { if (n.k === 2) (chains[n.ch] = chains[n.ch] || []).push(n); });
    const total = notes.reduce(function (a, n) { return a + (n.k === 1 ? 2 : 1); }, 0);
    P = { s: s, d: d, chart: chart, notes: notes, chains: chains, total: total, score: 0, combo: 0, maxCombo: 0,
          cnt: { c: 0, n: 0, m: 0 }, offs: [], ptr: {}, judge: null, fx: [], parts: [], ended: false, head: 0 };
    UI.innerHTML = '<button class="rg-pause" data-k="pause">❚❚</button>';
    UI.querySelector('[data-k="pause"]').onclick = function (e) { e.stopPropagation(); pause(); };
    bindInput();
    bgFor(s);                                      // 바탕 표지를 미리 받아 둔다
    if (AU.lag[s.key] == null) AU.lag[s.key] = headLag(buf, chart.head);
    AU.lagNow = AU.lag[s.key];
    clockReset();
    const cx = ctx();
    keepAlive();
    AU.src = cx.createBufferSource(); AU.src.buffer = buf; AU.src.connect(AU.gain);
    AU.startAt = cx.currentTime + LEAD;
    AU.src.start(AU.startAt);
    AU.src.onended = function () { if (P && MODE === 'play') P.audioEnd = true; };
    P.buf = buf;
    wdReset();
    MODE = 'play';
}
// ★ 소리 장치가 멈춰 있으면 판의 시계도 멈춘다 — 채보가 안 내려오고 곡도 안 나온다 (2026-11-11 사용자 「한 곡 하고 다음 곡을 누르면 채보가 안 내려온다」)
//   아이폰은 다른 소리(광장 피아노 · 소리 종류 바꿈 · 전화 · 다른 앱)가 끼어들면 소리 장치를 「끊김」으로 두고, 누르기 전에는 다시 안 켜 준다.
//   조용히 깨워 봐도 3 초 넘게 소리 시계가 안 가면 「▶ 눌러서 시작」 — 누른 손짓 안에서 소리 장치를 새로 만들어 그 곡을 처음부터 다시 튼다.
const WD = { last: null, at: 0, tried: 0, on: false };
function wdReset() { WD.last = null; WD.at = performance.now(); WD.tried = 0; wakeHide(); }
function watchdog() {
    if (MODE !== 'play' || !P) { if (WD.on) wakeHide(); return; }
    const c = AU.ctx, pn = performance.now();
    const t = c ? c.currentTime : -1;
    if (c && c.state === 'running' && t !== WD.last) { WD.last = t; WD.at = pn; if (WD.on) wakeHide(); return; }
    // 먼저 조용히 깨워 본다 — 멈춤 · 끊김이면 다시 켜고, 깨워 두기가 없으면 다시 건다 (창은 3 초 넘게 안 될 때만)
    if (c && c.state !== 'closed' && pn - WD.tried > 1000) { WD.tried = pn; try { if (c.state !== 'running') c.resume(); } catch (e) { } keepAlive(); }
    if (pn - WD.at > 3000 && !WD.on) wakeShow();
}
function wakeShow() {
    if (!UI || UI.querySelector('.rg-wake')) return;
    WD.on = true;
    const m = document.createElement('div'); m.className = 'rg-modal rg-wake';
    m.innerHTML = '<div class="rg-box" style="align-items:center;text-align:center;gap:10px;"><div style="font-size:13px;color:#ccd;line-height:1.7;">소리가 멈춰 있습니다<br><small style="color:#99a;">눌러 주시면 이 곡을 처음부터 다시 시작합니다</small></div>'
        + '<button class="rg-btn rg-go" data-k="wake">▶ 눌러서 시작</button></div>';
    UI.appendChild(m);
    m.querySelector('[data-k="wake"]').onclick = function (e) { e.stopPropagation(); wakeGo(); };
}
function wakeHide() { WD.on = false; const m = UI && UI.querySelector('.rg-wake'); if (m) m.remove(); }
function wakeGo() {
    if (!P) return;
    const s = P.s, d = P.d, chart = P.chart, buf = P.buf || AU.bufs[s.key];
    wakeHide();
    stopPlay();
    previewStop(true);
    // 누른 손짓 안에서 — 묵은 소리 장치는 닫고 새로 연다
    const old = AU.ctx; AU.ctx = null;
    try { if (old && old.state !== 'closed') old.close(); } catch (e) { }
    sessionOn(); ctx(); keepAlive();
    if (!buf) { MODE = 'load'; start(); return; }
    begin(s, d, buf, chart);
}
// ★ 깨워 두기 — 아이폰은 아무 소리도 안 나는 동안 소리 시계를 세워 두기도 한다.
//   곡은 2.2 초 뒤에 시작하게 걸어 두는데(LEAD), 그 빈 동안 시계가 서면 곡이 영영 시작되지 않고 채보도 안 내려온다.
//   첫 곡은 미리 듣기 소리가 나던 끝이라 괜찮고, 결과 화면에서 한참 조용했다가 다음 곡을 누르면 걸렸다 (2026-11-11 사용자 「다음 곡에서 채보가 안 내려온다」 · 「눌러서 시작이 너무 자주 뜬다」).
//   START 를 누른 순간부터 판이 끝날 때까지 들리지 않을 만큼 작은 소리를 되풀이해 흘려 시계가 서지 않게 한다.
function keepAlive() {
    const c = AU.ctx; if (!c || c.state === 'closed') return;
    if (AU.keep && AU.keep.c === c) return;
    keepStop();
    try {
        const n = Math.round(c.sampleRate * 0.5), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 1e-5;      // −100 dB — 들리지 않는다
        const src = c.createBufferSource(); src.buffer = b; src.loop = true;
        src.connect(c.destination); src.start(0);
        AU.keep = { c: c, src: src };
    } catch (e) { AU.keep = null; }
}
function keepStop() {
    const k = AU.keep; AU.keep = null;
    if (k) { try { k.src.stop(); k.src.disconnect(); } catch (e) { } }
}
function stopPlay() {
    try { if (AU.src) { AU.src.onended = null; AU.src.stop(); } } catch (e) { }
    AU.src = null;
    keepStop();
    try { if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); } catch (e) { }
    unbindInput();
}
function pause() {
    if (MODE !== 'play') return;
    MODE = 'pause';
    STILL.pauseAt = performance.now();
    try { AU.ctx.suspend(); } catch (e) { }
    pauseMenu();
}
function pauseMenu() {
    if (!UI || MODE !== 'pause') return;
    const m = document.createElement('div'); m.className = 'rg-modal';
    m.innerHTML = '<div class="rg-box"><b style="letter-spacing:4px;">PAUSE</b><button class="rg-btn" data-k="r" style="width:180px">계속</button><button class="rg-btn" data-k="re" style="width:180px">처음부터</button><button class="rg-btn" data-k="q" style="width:180px">곡 고르기</button></div>';
    UI.appendChild(m);
    m.querySelector('[data-k="r"]').onclick = function () { m.remove(); countIn(); };
    m.querySelector('[data-k="re"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } start(); };
    m.querySelector('[data-k="q"]').onclick = function () { m.remove(); stopPlay(); try { AU.ctx.resume(); } catch (e) { } menu(); };
}
// ★ 계속 — 3 · 2 · 1 세고 이어 간다 (2026-11-12 사용자 「정지 후에 계속 누르면 카운트 3 2 1 하고 시작하게」)
//   세는 동안은 멈춘 그대로(소리 장치도 멈춤) · 화면을 벗어나면 세기를 그만두고 멈춤 창으로 돌아간다
let CD = null;
function countIn() {
    if (!UI || MODE !== 'pause') return;
    if (CD) { clearTimeout(CD.t); if (CD.el) CD.el.remove(); }
    const el = document.createElement('div');
    el.className = 'rg-cd';
    UI.appendChild(el);
    CD = { el: el, n: 3, t: 0 };
    const tick = function () {
        if (!CD || CD.el !== el) return;
        if (!UI || MODE !== 'pause' || document.hidden) { el.remove(); CD = null; if (MODE === 'pause' && UI && !UI.querySelector('.rg-modal')) pauseMenu(); return; }
        if (CD.n <= 0) {
            el.remove(); CD = null;
            try { AU.ctx.resume(); } catch (e) { }
            clockReset();
            wdReset();
            MODE = 'play';
            return;
        }
        el.textContent = String(CD.n);
        el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
        CD.n--;
        CD.t = setTimeout(tick, 1000);
    };
    tick();
}
function onVis() { if (document.hidden) { previewStop(true); if (MODE === 'cal') calExit(); else pause(); } }

// ==========================================
// 싱크 맞추기 (2026-11-11 사용자 「싱크가 아직도 좀 안 맞아」)
//   딸깍 소리(곡과 같은 길로 나간다)가 600 ms 마다 · 노트가 그 때마다 판정선에 닿는다.
//   · 소리에 맞춰 누르면 — 누른 때와 딸깍의 차이(가운데 값)가 판정 싱크가 된다 (여섯 번부터 · 마지막 열여섯 번)
//   · 노트가 선에 닿는 때가 딸깍과 어긋나 보이면 — 화면 싱크 ±
// ==========================================
const CAL_BEAT = 600, CAL_MIN = 6, CAL_KEEP = 16;
let C = null;
function metroBuf(acc) {
    const c = ctx(), sr = c.sampleRate, n = Math.floor(sr * 0.06), b = c.createBuffer(1, n, sr), d = b.getChannelData(0);
    const f = acc ? 2200 : 1500;
    for (let i = 0; i < n; i++) { const t = i / sr; d[i] = (Math.sin(2 * Math.PI * f * t) * 0.8 + (Math.random() * 2 - 1) * 0.25 * Math.exp(-t * 900)) * Math.exp(-t * 70); }
    return b;
}
function median(a) { if (!a.length) return 0; const s = a.slice().sort(function (x, y) { return x - y; }); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function calEnter() {
    previewStop(true);
    const c = ctx(); sessionOn();
    if (!AU.met) AU.met = [metroBuf(false), metroBuf(true)];
    stopPlay();
    AU.startAt = c.currentTime + 0.8; AU.lagNow = 0; clockReset();
    C = { next: 0, srcs: [], taps: [], fx: [], last: null };
    MODE = 'cal';
    calUI();
    bindInput();
}
function calStop() {
    if (!C) return;
    C.srcs.forEach(function (s) { try { s.stop(); } catch (e) { } });
    C.srcs = [];
}
function calExit() { calStop(); C = null; unbindInput(); menu(); }
function calTick() {
    if (!C || !AU.ctx) return;
    const c = AU.ctx;
    while (AU.startAt + C.next * CAL_BEAT / 1000 < c.currentTime + 0.3) {
        const at = AU.startAt + C.next * CAL_BEAT / 1000;
        if (at >= c.currentTime) {
            try { const s = c.createBufferSource(); s.buffer = AU.met[C.next % 4 === 0 ? 1 : 0]; const g = c.createGain(); g.gain.value = 0.9; s.connect(g); g.connect(AU.gain); s.start(at); C.srcs.push(s); } catch (e) { }
        }
        C.next++;
    }
    if (C.srcs.length > 12) C.srcs.splice(0, C.srcs.length - 12);
}
function calTap(age, pt) {
    if (!C) return;
    const t = clockMs() - (age || 0);
    const k = Math.round(t / CAL_BEAT);
    if (k < 0) return;
    const d = t - k * CAL_BEAT;
    C.fx.push({ at: performance.now(), d: d, x: pt && L ? Math.max(0, Math.min(1, uOf(pt.x))) : 0.5 });
    if (C.fx.length > 12) C.fx.shift();
    if (Math.abs(d) > 260) return;
    C.taps.push(d); if (C.taps.length > CAL_KEEP) C.taps.shift();
    C.last = Math.round(d);
    if (C.taps.length >= CAL_MIN) { SET.offset = Math.max(-300, Math.min(300, Math.round(median(C.taps)))); saveSet(); }
    calRead();
}
function calSpread() {
    if (C.taps.length < CAL_MIN) return null;
    const m = median(C.taps);
    return Math.round(median(C.taps.map(function (x) { return Math.abs(x - m); })));
}
function calRead() {
    if (!C || !UI) return;
    const a = UI.querySelector('[data-v="of"]'), b = UI.querySelector('[data-v="vis"]'), n = UI.querySelector('[data-v="n"]');
    if (a) a.textContent = sgn(SET.offset) + 'ms';
    if (b) b.textContent = sgn(SET.vis) + 'ms';
    if (n) {
        const sp = calSpread();
        n.textContent = C.taps.length < CAL_MIN ? ('딸깍에 맞춰 누르기 ' + C.taps.length + ' / ' + CAL_MIN)
            : ('누른 ' + C.taps.length + '번 · 흔들림 ±' + sp + 'ms' + (sp > 35 ? ' — 조금 더 눌러 주세요' : ' — 맞췄습니다'));
    }
}
function calUI() {
    UI.innerHTML = '<div class="rg-bg" style="background:transparent"></div>'
        + '<div class="rg-cal-box">'
        + '<div style="display:flex;align-items:center;gap:8px;"><button class="rg-btn" data-k="back" style="padding:6px 10px;font-size:12px;">← 곡 고르기</button><b style="letter-spacing:2px;">싱크 맞추기</b></div>'
        + '<div class="rg-cal-tip">딸깍 소리에 맞춰 화면 아무 데나 톡톡 — 판정 싱크가 저절로 맞춰집니다</div>'
        + '<div class="rg-row"><span style="min-width:62px;">판정 싱크</span><span class="rg-step"><button data-k="of-">−</button><span data-v="of"></span><button data-k="of+">+</button></span></div>'
        + '<div class="rg-cal-tip" data-v="n"></div>'
        + '<div class="rg-row"><span style="min-width:62px;">화면 싱크</span><span class="rg-step"><button data-k="vi-">−</button><span data-v="vis"></span><button data-k="vi+">+</button></span></div>'
        + '<div class="rg-cal-tip">노트가 딸깍보다 늦게 선에 닿아 보이면 + · 일찍 닿아 보이면 −</div>'
        + '<div style="display:flex;gap:8px;"><button class="rg-btn" data-k="re" style="padding:7px 12px;font-size:12px;">다시 재기</button><button class="rg-btn" data-k="zero" style="padding:7px 12px;font-size:12px;">둘 다 0</button></div>'
        + '</div>';
    Array.prototype.forEach.call(UI.querySelectorAll('[data-k]'), function (el) {
        el.onclick = function (e) {
            e.stopPropagation();
            const k = el.dataset.k;
            if (k === 'back') { calExit(); return; }
            if (k === 'of-') SET.offset = Math.max(-300, SET.offset - 5);
            if (k === 'of+') SET.offset = Math.min(300, SET.offset + 5);
            if (k === 'vi-') SET.vis = Math.max(-300, SET.vis - 5);
            if (k === 'vi+') SET.vis = Math.min(300, SET.vis + 5);
            if (k === 're') { C.taps = []; C.last = null; }
            if (k === 'zero') { SET.offset = 0; SET.vis = 0; C.taps = []; C.last = null; }
            saveSet(); calRead();
        };
    });
    calRead();
}
function drawCal() {
    const g = G2; if (!g || !L || !C) return;
    const now = visMs();
    const vis = 7000 / SET.speed;
    const pOf = function (t) { return 1 - (t - now) / vis; };
    const bars = [];
    for (let k = Math.max(0, Math.floor((now - 200) / CAL_BEAT)); k * CAL_BEAT < now + vis; k += 4) bars.push(k * CAL_BEAT);
    drawStage(g, pOf, bars);
    // 딸깍마다 노트 하나 — 가운데
    const k0 = Math.max(0, Math.floor(now / CAL_BEAT));
    for (let k = k0 + Math.ceil(vis / CAL_BEAT) + 1; k >= k0; k--) {
        const p = pOf(k * CAL_BEAT); if (p < 0 || p > 1) continue;
        const sc = scaleAt(p);
        key(g, xAt(0.5, sc), yAt(sc), 0.15 * L.lineW * sc, L.nh * sc, k % 4 === 0 ? 2 : 0, false);
    }
    // 노트가 선에 닿는 순간 — 판정선이 번쩍
    const since = now - Math.floor(now / CAL_BEAT) * CAL_BEAT;
    if (now >= 0 && since < 140) {
        const a = 1 - since / 140;
        g.save(); g.globalAlpha = a;
        const x = xAt(0.5, 1), w = 0.22 * L.lineW;
        const rg = g.createRadialGradient(x, L.yJ, 0, x, L.yJ, w);
        rg.addColorStop(0, 'rgba(255,240,250,0.95)'); rg.addColorStop(1, 'rgba(255,240,250,0)');
        g.fillStyle = rg; g.fillRect(x - w, L.yJ - w * 0.7, w * 2, w * 1.4);
        g.restore();
    }
    // 누른 자리 — 차이 (판정 싱크를 뺀 값 · 0 근처면 맞다)
    const tnow = performance.now();
    C.fx.forEach(function (f) {
        const k = (tnow - f.at) / 700; if (k >= 1) return;
        const d = Math.round(f.d - (C.taps.length >= CAL_MIN ? SET.offset : 0));
        const x = xAt(f.x, 1);
        g.save(); g.globalAlpha = 1 - k; g.textAlign = 'center';
        g.fillStyle = Math.abs(d) <= W_CHARM ? '#ffd0ea' : '#9fd4ff';
        g.font = '600 ' + Math.round(VH * 0.045) + 'px Georgia, serif';
        g.fillText(sgn(d) + 'ms', x, L.yJ - VH * 0.1 - k * 14);
        g.beginPath(); g.arc(x, L.yJ, 8 + k * 26, 0, Math.PI * 2); g.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - k)) + ')'; g.lineWidth = 2; g.stroke();
        g.restore();
    });
}

// ==========================================
// 판정 — 가로 자리만 본다 (Deemo 처럼)
// ==========================================
function addScore(kind, dt) {
    const base = 1000000 / Math.max(1, P.total);
    P.score += base * (kind === 'c' ? 1 : kind === 'n' ? 0.6 : 0);
    P.cnt[kind]++;
    if (kind === 'm') P.combo = 0;
    else { P.combo++; if (P.combo > P.maxCombo) P.maxCombo = P.combo; }
    P.judge = { k: kind, at: performance.now(), dt: dt };
}
// 맨 가장자리 줄은 그 바깥 어디를 눌러도 맞은 것으로 (화면 끝을 눌러도 먹게)
const X_EDGE0 = xOfLane(0) + 1e-6, X_EDGE1 = xOfLane(LANES - 1) - 1e-6;
function near(n, u, pad) {
    if (u == null) return false;
    if ((n.x <= X_EDGE0 && u < n.x) || (n.x >= X_EDGE1 && u > n.x)) return true;
    return Math.abs(u - n.x) <= n.w / 2 + pad;
}
function burst(n, kind) {
    const t = performance.now();
    P.fx.push({ x: n.x, w: n.w, at: t, k: kind });
    if (P.fx.length > 30) P.fx.shift();
    for (let q = 0; q < 9; q++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
        P.parts.push({ x: n.x + (Math.random() - 0.5) * n.w * 0.8, at: t, vx: Math.cos(a) * (0.08 + Math.random() * 0.22), vy: Math.sin(a) * (0.5 + Math.random() * 0.9), k: kind });
    }
    if (P.parts.length > 160) P.parts.splice(0, P.parts.length - 160);
}
// 누른 자리의 줄 (가장 가까운 칸)
function laneOf(u) { return Math.max(0, Math.min(LANES - 1, Math.round((u - xOfLane(0)) / (xOfLane(1) - xOfLane(0))))); }
// 눌렀다 — 줄마다 판정 안의 가장 이른 노트 하나씩만 후보로 두고, 그 가운데
//   「시각 차 + 옆 줄이면 90 + 가로 거리」가 가장 작은 것.
// ★ 2026-11-11 사용자 「롱노트 전 · 중 · 후로 일반 노트가 조금 씹힌다」
//   전에는 가로 자리 안에서 「가장 이른 노트」를 무조건 골랐다. 그래서 롱노트 머리를 누른 손가락이
//   옆 줄의 조금 이른 노트를 가로채면 롱노트가 머리부터 통째로 날아가고(MISS 둘), 옆 줄 노트를 치려던
//   손가락은 칠 것이 없어졌다. 이제는 누른 줄의 노트가 먼저이고, 옆 줄 노트는 시각이 훨씬 맞을 때만 고른다.
function press(u, pid, age) {
    if (!P || MODE !== 'play' || u == null) return false;
    const now = songMs() - (age || 0);
    const ln = laneOf(u), seen = {};
    let best = null, bestScore = 1e9;
    for (let i = P.head; i < P.notes.length; i++) {
        const n = P.notes[i];
        const dt = now - n.t;
        if (dt < -W_NORMAL) break;                    // 아직 멀다 (시각 순)
        if (n.done || n.k === 2 || dt > W_NORMAL) continue;
        if (seen[n.lane]) continue;                   // 그 줄은 가장 이른 것만
        if (!near(n, u, HIT_PAD)) continue;
        seen[n.lane] = 1;
        const sc = Math.abs(dt) + (n.lane === ln ? 0 : 90) + Math.abs(u - n.x) * 150;
        if (sc < bestScore) { best = n; bestScore = sc; }
    }
    if (!best) return false;
    const dt = now - best.t;
    const g = Math.abs(dt) <= W_CHARM ? 'c' : 'n';
    best.done = true; best.j = g;
    P.offs.push(dt);
    addScore(g, dt);
    burst(best, g);
    playClick(0.26);
    if (best.k === 1) { best.hold = pid; if (P.ptr[pid]) P.ptr[pid].hold = best; }
    if (P.ptr[pid]) P.ptr[pid].used = true;
    return true;
}
// 롱노트 머리를 조금 일찍(판정 바깥 · 0.4 초 안) 눌러 그대로 버티고 있으면, 머리가 닿을 때 잡아 준다 (NORMAL)
//   그 손가락이 아무 노트도 치지 않았고 · 아무것도 누르고 있지 않고 · 그 줄 위에 있을 때만
const HOLD_CATCH = 400;
function holdCatch(n, now) {
    const ids = Object.keys(P.ptr);
    for (let i = 0; i < ids.length; i++) {
        const q = P.ptr[ids[i]];
        if (!q || q.used || q.hold || q.t == null || q.u == null) continue;
        const early = n.t - q.t;
        if (early <= 0 || early > HOLD_CATCH) continue;
        if (laneOf(q.u) !== n.lane || !near(n, q.u, HIT_PAD)) continue;
        n.done = true; n.j = 'n'; n.hold = ids[i]; q.hold = n; q.used = true;
        addScore('n', now - n.t); burst(n, 'n'); playClick(0.26);
        return true;
    }
    return false;
}
function releaseHold(n, now) {
    if (!n || n.tail) return;
    if (now >= n.t + n.len - HOLD_EARLY_OK) { n.tail = 'c'; addScore('c'); burst(n, 'c'); }
    else { n.tail = 'm'; addScore('m'); }
    n.hold = null;
}
function step(now) {
    const us = [];
    Object.keys(P.ptr).forEach(function (id) { const q = P.ptr[id]; if (q && q.u != null) us.push(q.u); });
    while (P.head < P.notes.length && P.notes[P.head].done && (P.notes[P.head].k !== 1 || P.notes[P.head].tail)) P.head++;
    for (let i = P.head; i < P.notes.length; i++) {
        const n = P.notes[i];
        const dt = now - n.t;
        if (dt < -W_NORMAL - 300) break;
        if (n.done) {
            if (n.k === 1 && !n.tail) {
                if (n.j === 'm') { n.tail = 'm'; addScore('m'); continue; }
                const q = n.hold != null ? P.ptr[n.hold] : null;
                const held = !!q && near(n, q.u, HIT_PAD * 2.2);
                if (!held || now >= n.t + n.len) releaseHold(n, now);
            }
            continue;
        }
        if (n.k === 2) {
            if (dt >= -90 && dt <= W_SLIDE && us.some(function (u) { return near(n, u, HIT_PAD * 1.4); })) {
                n.done = true; n.j = 'c'; addScore('c'); burst(n, 'c'); playClick(0.14);
            } else if (dt > W_SLIDE) { n.done = true; n.j = 'm'; addScore('m'); }
            continue;
        }
        if (n.k === 1 && dt >= 0 && dt <= W_NORMAL && holdCatch(n, now)) continue;
        if (dt > W_NORMAL) {
            n.done = true; n.j = 'm'; addScore('m');
            if (n.k === 1) { n.tail = 'm'; addScore('m'); }
        }
    }
    const tailEnd = P.notes.length ? Math.max.apply(null, P.notes.slice(-24).map(function (n) { return n.t + (n.len || 0); })) : 0;
    if (!P.ended && (now > P.chart.dur + 600 || (P.audioEnd && now > tailEnd + 800))) {
        P.ended = true;
        setTimeout(result, 900);
    }
}

// ==========================================
// 자리 — 원근 (멀리 위 가운데 → 판정선)
// ==========================================
let L = null;
const DEPTH = 2.4;                     // 멀리 있을 때 1 / (1 + DEPTH) 크기
function layout() {
    if (!VW) return;
    const lineW = Math.min(VW * 0.9, VH * 2.2);
    L = { lineW: lineW, lineL: (VW - lineW) / 2, cx: VW / 2, yJ: VH * 0.82, yV: -VH * 0.32, nh: Math.max(12, VH * 0.042) };
}
function scaleAt(p) { return p <= 1 ? 1 / (1 + (1 - p) * DEPTH) : 1 + (p - 1) * 0.6; }
function yAt(s) { return L.yV + (L.yJ - L.yV) * s; }
function xAt(u, s) { return L.cx + (u - 0.5) * L.lineW * s; }
function uOf(x) { if (!L) return null; return (x - L.lineL) / L.lineW; }

// ==========================================
// 손가락 · 키보드
// ==========================================
function pd(e) {
    if (MODE === 'cal') {
        if (e.target && e.target.closest && e.target.closest('button,.rg-cal-box')) return;
        e.preventDefault(); calTap(evAge(e), toStage(e.clientX, e.clientY));
        return;
    }
    if (MODE !== 'play' || !P) return;
    if (e.target && e.target.closest && e.target.closest('.rg-pause,.rg-modal')) return;
    e.preventDefault();
    const age = evAge(e);
    const p = toStage(e.clientX, e.clientY);
    const u = uOf(p.x);
    P.ptr[e.pointerId] = { u: u, hold: null, at: performance.now(), t: songMs() - age, used: false };
    try { ST.setPointerCapture && ST.setPointerCapture(e.pointerId); } catch (x) { }
    press(u, e.pointerId, age);
}
function pm(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const p = toStage(e.clientX, e.clientY);
    P.ptr[e.pointerId].u = uOf(p.x);
}
function pu(e) {
    if (!P || !P.ptr[e.pointerId]) return;
    const q = P.ptr[e.pointerId];
    delete P.ptr[e.pointerId];
    if (q.hold && MODE === 'play') releaseHold(q.hold, songMs() - evAge(e));
}
// 무대 전체에서 받는다 — 위에 덮인 글자 칸(#rg-ui)을 눌러도 (단추 · 멈춤 창은 빼고)
function bindInput() {
    ST.addEventListener('pointerdown', pd);
    ST.addEventListener('pointermove', pm);
    ST.addEventListener('pointerup', pu);
    ST.addEventListener('pointercancel', pu);
}
function unbindInput() {
    if (!ST) return;
    ST.removeEventListener('pointerdown', pd);
    ST.removeEventListener('pointermove', pm);
    ST.removeEventListener('pointerup', pu);
    ST.removeEventListener('pointercancel', pu);
}
function onKey(e) {
    if (!OV) return;
    const k = (e.key || '').toLowerCase();
    // 설정 창 — 줄을 골라 두었으면 이 키를 그 줄로 (이미 다른 줄에 있던 키면 서로 바꾼다 · Esc 는 그만두기)
    if (bindLane != null) {
        e.preventDefault(); e.stopPropagation();
        if (e.repeat) return;
        const lane = bindLane; bindLane = null;
        if (k !== 'escape' && k && KEY_BAN.indexOf(k) < 0) {
            const ks = keys().slice(), at = ks.indexOf(k);
            if (at >= 0 && at !== lane) ks[at] = ks[lane];
            ks[lane] = k;
            SET.keys = ks; saveSet();
        }
        try { if (typeof window.__rgKeyPaint === 'function') window.__rgKeyPaint(); } catch (x) { }
        return;
    }
    if (MODE === 'cal') {
        if (k === 'escape') { calExit(); e.preventDefault(); return; }
        if ((k === ' ' || keys().indexOf(k) >= 0) && !e.repeat) { e.preventDefault(); e.stopPropagation(); calTap(evAge(e), null); }
        return;
    }
    if (k === 'escape') { if (MODE === 'play') pause(); e.preventDefault(); return; }
    if (MODE !== 'play' || !P) return;
    if (k === ' ') { pause(); e.preventDefault(); return; }
    const lane = keys().indexOf(k);
    if (lane < 0 || e.repeat) return;
    kbUsed = true;
    e.preventDefault(); e.stopPropagation();
    const id = 'k' + lane;
    const age = evAge(e);
    P.ptr[id] = { u: xOfLane(lane), hold: null, key: true, t: songMs() - age, used: false };
    press(xOfLane(lane), id, age);
}
function onKeyUp(e) {
    if (!P) return;
    const lane = keys().indexOf((e.key || '').toLowerCase());
    if (lane < 0) return;
    pu({ pointerId: 'k' + lane, timeStamp: e.timeStamp });
}

// ==========================================
// 그리기
// ==========================================
const JTX = { c: ['CHARMING', '#ffe3f2', '#ff9ccf'], n: ['NORMAL', '#cfeaff', '#7ec8ff'], m: ['MISS', '#a3a3b3', '#6b6b7a'] };
function raf() {
    if (!OV) return;
    requestAnimationFrame(raf);
    frameTick();
    const still = (MODE === 'play' || MODE === 'pause') && !!P;
    if (CB && (CB.style.display !== 'none') !== still) CB.style.display = still ? '' : 'none';
    if (MODE === 'cal') { STILL.clr = false; clockTick(); calTick(); drawCal(); return; }
    // 곡 고르기 · 결과 — 한 번만 지우고 쉰다 (전에는 틀마다 온 화면을 지웠다)
    if (MODE !== 'play' && MODE !== 'pause') { if (G2 && !STILL.clr) { G2.clearRect(0, 0, VW, VH); STILL.clr = true; } return; }
    STILL.clr = false;
    if (MODE === 'play') { watchdog(); clockTick(); P.lastNow = songMs(); P.lastVis = visMs(); step(P.lastNow); }
    // 멈춤 — 판정 글자가 사그라질 동안만 그리고 쉰다 (화면 크기가 바뀌면 한 번 더)
    else if (performance.now() - STILL.pauseAt > 700 && !STILL.dirty) return;
    STILL.dirty = false;
    draw(P.lastVis || 0);
}
function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// ★ 건반 둘레 빛 — 전에는 노트마다 shadowBlur 로 그때그때 흐렸다(휴대폰에서 가장 비싼 일 중 하나).
//   이제 종류마다 한 번 흐려 둔 빛 조각을 아홉 조각(네 귀 · 네 변 · 가운데)으로 늘여 붙인다 — 모양은 같다 (2026-11-11 발열)
const GLOW = {};
function glowCol(kind) { return kind === 3 ? 'rgba(110,240,150,0.7)' : kind === 2 ? 'rgba(255,214,90,0.7)' : 'rgba(210,230,255,0.55)'; }
function glowSprite(kind, glow, dpr) {
    const k = kind + (glow ? 'g' : '') + '@' + dpr;
    if (GLOW[k]) return GLOW[k];
    const blur = glow ? 18 : 8;                                   // shadowBlur 는 화면 점 단위 (변환을 안 탄다)
    const pad = Math.ceil(blur / dpr) + 3;                         // 빛이 번지는 폭 (CSS px)
    const core = 12, W = core + pad * 2;
    const c = document.createElement('canvas'); c.width = Math.ceil(W * dpr); c.height = Math.ceil(W * dpr);
    const g = c.getContext('2d');
    // 모양은 왼쪽 밖에 그리고 그림자만 안으로 옮겨 남긴다
    const off = W * 2;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.shadowColor = glowCol(kind); g.shadowBlur = blur; g.shadowOffsetX = off * dpr;
    rr(g, pad - off, pad, core, core, 4); g.fillStyle = '#fff'; g.fill();
    return (GLOW[k] = { c: c, pad: pad, core: core, W: W, s: dpr });
}
function glowDraw(g, sp, x, y, w, h) {
    const P2 = sp.pad, s = sp.s, C = sp.c, cw = sp.core;
    const sx = [0, P2, P2 + cw], sw = [P2, cw, P2];
    const dx = [x - P2, x, x + w], dw = [P2, w, P2];
    const dy = [y - P2, y, y + h], dh = [P2, h, P2];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) continue;                          // 가운데는 건반이 덮는다
        if (dw[i] <= 0 || dh[j] <= 0) continue;
        g.drawImage(C, sx[i] * s, sx[j] * s, sw[i] * s, sw[j] * s, dx[i], dy[j], dw[i], dh[j]);
    }
}
// 건반 하나 — 가운데 (cx, cy) · 폭 w · 높이 h
function key(g, cx, cy, w, h, kind, glow) {
    const x = cx - w / 2, y = cy - h / 2;
    const dpr = CV && VW ? CV.width / VW : 1;
    glowDraw(g, glowSprite(kind, glow, Math.round(dpr * 100) / 100), x, y, w, h);
    g.save();
    const gr = g.createLinearGradient(0, y, 0, y + h);
    if (kind === 3) { gr.addColorStop(0, '#dcffe6'); gr.addColorStop(0.55, '#5fe08a'); gr.addColorStop(1, '#1f9e52'); }
    else if (kind === 2) { gr.addColorStop(0, '#fff3b8'); gr.addColorStop(0.55, '#ffd34d'); gr.addColorStop(1, '#d99a12'); }
    else { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#eef1f8'); gr.addColorStop(1, '#b8c2d6'); }
    g.fillStyle = gr;
    rr(g, x, y, w, h, Math.min(5, h * 0.3)); g.fill();
    g.strokeStyle = kind === 3 ? 'rgba(0,80,30,0.55)' : kind === 2 ? 'rgba(120,80,0,0.55)' : 'rgba(40,50,80,0.55)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x + 3, y + 2, w - 6, Math.max(1, h * 0.14));
    g.restore();
}
// 판 바탕 — 표지를 흐리고 어둡게 깐다 (2026-11-11 사용자 「게임 시작 시에 표지가 배경으로 박히게」)
//   한 번 그려 두고(크기가 바뀌면 다시) 프레임마다 붙이기만 한다 · 표지가 없는 곡은 까맣게
const BG = { key: null, img: null, cv: null, w: 0, h: 0 };
function bgFor(s) {
    if (!s || !s.cover) return null;
    if (BG.key !== s.key) { BG.key = s.key; BG.cv = null; BG.img = new Image(); BG.img.src = s.cover; }
    const im = BG.img;
    if (!im || !im.complete || !im.naturalWidth) return null;
    if (!BG.cv || BG.w !== VW || BG.h !== VH) {
        const c = document.createElement('canvas');
        const sc = 0.5;                                   // 흐리게 할 것이라 반 크기면 넉넉하다
        c.width = Math.max(1, Math.round(VW * sc)); c.height = Math.max(1, Math.round(VH * sc));
        const g = c.getContext('2d');
        const r = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight) * 1.08;   // 흐린 가장자리가 비지 않게 조금 크게
        const w = im.naturalWidth * r, h = im.naturalHeight * r;
        try { g.filter = 'blur(5px)'; } catch (e) { }
        g.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
        try { g.filter = 'none'; } catch (e) { }
        g.fillStyle = 'rgba(0,0,0,0.68)'; g.fillRect(0, 0, c.width, c.height);
        const v = g.createRadialGradient(c.width / 2, c.height * 0.55, c.height * 0.2, c.width / 2, c.height * 0.55, c.width * 0.75);
        v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
        g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
        BG.cv = c; BG.w = VW; BG.h = VH;
    }
    return BG.cv;
}
// 바탕 · 바닥 · 마디 · 판정선
function drawStage(g, pOf, bars, bg) {
    g.clearRect(0, 0, VW, VH);
    stageBase(g, bg);
    stageBars(g, pOf, bars);
    stageLine(g);
}
// 판 바탕 한 장 — 곡 · 화면 크기 · 표지가 다 받아졌나가 바뀔 때만 밑 장에 다시 그린다
function stillPaint(s) {
    if (!GB || !L) return false;
    const bg = bgFor(s);
    const k = (s ? s.key : '') + '|' + VW + 'x' + VH + '|' + (bg ? 1 : 0) + '|' + L.yJ + '|' + L.lineW;
    if (STILL.key === k) return true;
    STILL.key = k;
    GB.clearRect(0, 0, VW, VH);
    stageBase(GB, bg);
    stageLine(GB);
    return true;
}
function stageBase(g, bg) {
    // 바탕 — 까맣게 (2026-11-10 사용자 「표지 없이 까만색으로」) · 판에서는 표지를 흐리게 (2026-11-11)
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    if (bg) g.drawImage(bg, 0, 0, VW, VH);
    // 바닥 — 원근 사다리꼴 (멀리 → 판정선)
    const s0 = scaleAt(0), y0 = yAt(s0);
    g.save();
    g.beginPath();
    g.moveTo(xAt(0, s0), y0); g.lineTo(xAt(1, s0), y0); g.lineTo(xAt(1, 1), L.yJ); g.lineTo(xAt(0, 1), L.yJ); g.closePath();
    const fl = g.createLinearGradient(0, y0, 0, L.yJ);
    fl.addColorStop(0, 'rgba(120,150,220,0.0)'); fl.addColorStop(1, 'rgba(140,170,240,0.13)');
    g.fillStyle = fl; g.fill();
    g.strokeStyle = 'rgba(190,210,255,0.18)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(xAt(0, s0), y0); g.lineTo(xAt(0, 1), L.yJ); g.moveTo(xAt(1, s0), y0); g.lineTo(xAt(1, 1), L.yJ); g.stroke();
    g.restore();
}
function stageBars(g, pOf, bars) {
    // 마디 — 바닥을 가로지르는 희미한 줄
    g.strokeStyle = 'rgba(200,215,255,0.08)'; g.lineWidth = 1;
    for (let i = 0; i < bars.length; i++) {
        const p = pOf(bars[i]); if (p < 0 || p > 1) continue;
        const sc = scaleAt(p), y = yAt(sc);
        g.beginPath(); g.moveTo(xAt(0, sc), y); g.lineTo(xAt(1, sc), y); g.stroke();
    }
}
function stageLine(g) {
    // 판정선
    g.save();
    g.shadowColor = 'rgba(190,215,255,0.9)'; g.shadowBlur = 14;
    g.fillStyle = 'rgba(235,242,255,0.95)'; g.fillRect(L.lineL, L.yJ - 1.5, L.lineW, 3);
    g.restore();
    g.fillStyle = 'rgba(235,242,255,0.9)';
    [L.lineL, L.lineL + L.lineW].forEach(function (x) { g.beginPath(); g.arc(x, L.yJ, 4, 0, Math.PI * 2); g.fill(); });
}
function draw(now) {
    const g = G2; if (!g || !L) return;
    const vis = 7000 / SET.speed;                     // 멀리서 판정선까지 걸리는 ms
    const pOf = function (t) { return 1 - (t - now) / vis; };
    const tnow = performance.now();
    if (stillPaint(P.s)) { g.clearRect(0, 0, VW, VH); stageBars(g, pOf, P.chart.bars); }
    else drawStage(g, pOf, P.chart.bars, bgFor(P.s));
    // 손가락 자리 — 판정선 위 은은한 빛
    Object.keys(P.ptr).forEach(function (id) {
        const q = P.ptr[id]; if (!q || q.u == null) return;
        const x = xAt(q.u, 1);
        const rg = g.createRadialGradient(x, L.yJ, 0, x, L.yJ, L.lineW * 0.07);
        rg.addColorStop(0, 'rgba(200,225,255,0.45)'); rg.addColorStop(1, 'rgba(200,225,255,0)');
        g.fillStyle = rg; g.fillRect(x - L.lineW * 0.07, L.yJ - L.lineW * 0.07, L.lineW * 0.14, L.lineW * 0.14);
    });
    // 슬라이드 줄 — 희미하게
    Object.keys(P.chains).forEach(function (c) {
        const ch = P.chains[c]; if (ch.length < 2) return;
        g.strokeStyle = ch[0].z ? 'rgba(110,240,150,0.45)' : 'rgba(255,214,90,0.38)'; g.lineWidth = 3; g.lineCap = 'round';     // 지그재그는 초록 줄
        g.beginPath(); let st = false;
        for (let i = 0; i < ch.length; i++) {
            const n = ch[i]; const p = pOf(n.t); if (p < 0) break; if (n.done && i < ch.length - 1 && ch[i + 1].done) continue;
            const sc = scaleAt(Math.min(p, 1)); const x = xAt(n.x, sc), y = yAt(sc);
            if (!st) { g.moveTo(x, y); st = true; } else g.lineTo(x, y);
        }
        if (st) g.stroke();
    });
    // 노트 — 먼 것부터 (가까운 것이 위에)
    let last = P.head;
    while (last < P.notes.length && pOf(P.notes[last].t) >= 0) last++;
    for (let i = last - 1; i >= P.head; i--) {
        const n = P.notes[i];
        const p = pOf(n.t);
        if (n.k === 1) {
            if (n.tail) continue;
            const holding = n.done && n.j !== 'm' && n.hold != null;
            if (n.done && !holding) continue;
            const pe = Math.max(0, pOf(n.t + n.len));
            const ph = holding ? 1 : p;
            if (ph < 0) continue;
            // 띠 — 꼬리에서 머리까지 (원근으로 좁아진다)
            const steps = 10;
            g.beginPath();
            for (let q = 0; q <= steps; q++) { const pp = pe + (ph - pe) * q / steps; const sc = scaleAt(pp); const x = xAt(n.x - n.w * 0.32, sc); const y = yAt(sc); if (q === 0) g.moveTo(x, y); else g.lineTo(x, y); }
            for (let q = steps; q >= 0; q--) { const pp = pe + (ph - pe) * q / steps; const sc = scaleAt(pp); g.lineTo(xAt(n.x + n.w * 0.32, sc), yAt(sc)); }
            g.closePath();
            const ys = yAt(scaleAt(pe)), yh = yAt(scaleAt(ph));
            const bg2 = g.createLinearGradient(0, ys, 0, yh);
            bg2.addColorStop(0, holding ? 'rgba(210,230,255,0.25)' : 'rgba(200,215,245,0.15)');
            bg2.addColorStop(1, holding ? 'rgba(235,245,255,0.75)' : 'rgba(210,225,255,0.45)');
            g.fillStyle = bg2; g.fill();
            g.strokeStyle = holding ? 'rgba(255,255,255,0.8)' : 'rgba(220,232,255,0.45)'; g.lineWidth = 1.2; g.stroke();
            if (pe > 0) { const sc = scaleAt(pe); key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc * 0.7, L.nh * sc * 0.5, 0, false); }
            const sc = scaleAt(ph);
            key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc, L.nh * sc, 1, holding);
            continue;
        }
        if (n.done || p < 0 || p > 1.25) continue;
        const sc = scaleAt(p);
        key(g, xAt(n.x, sc), yAt(sc), n.w * L.lineW * sc, L.nh * sc * (n.k === 2 ? 0.8 : 1), n.z ? 3 : n.k, false);
    }
    // 맞힌 자리 — 번쩍 · 부서지는 빛
    P.fx.forEach(function (f) {
        const k = (tnow - f.at) / 260; if (k >= 1) return;
        const w = f.w * L.lineW * (1 + k * 0.5), x = xAt(f.x, 1);
        g.save(); g.globalAlpha = (1 - k) * 0.9;
        const c = f.k === 'c' ? '255,228,244' : '200,230,255';
        const rg = g.createRadialGradient(x, L.yJ, 0, x, L.yJ, w * 0.75);
        rg.addColorStop(0, 'rgba(' + c + ',0.95)'); rg.addColorStop(1, 'rgba(' + c + ',0)');
        g.fillStyle = rg; g.fillRect(x - w, L.yJ - w * 0.75, w * 2, w * 1.5);
        g.restore();
    });
    P.parts = P.parts.filter(function (q) { return tnow - q.at < 520; });
    P.parts.forEach(function (q) {
        const k = (tnow - q.at) / 520;
        const x = xAt(q.x + q.vx * k * 0.35, 1), y = L.yJ + q.vy * k * VH * 0.35 + k * k * VH * 0.25;
        g.fillStyle = q.k === 'c' ? 'rgba(255,225,240,' + (1 - k) + ')' : 'rgba(200,230,255,' + (1 - k) + ')';
        g.fillRect(x - 2, y - 2, 4, 4);
    });
    // PC — 판정선 밑에 키 (누르고 있으면 밝게)
    if (showKeys()) {
        const ky = L.yJ + Math.min(VH * 0.09, (VH - L.yJ) * 0.55);
        const ks = Math.max(18, Math.min(32, VH * 0.064));
        g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '600 ' + Math.round(ks * 0.52) + 'px sans-serif';
        keys().forEach(function (k, i) {
            const x = xAt(xOfLane(i), 1), on = !!P.ptr['k' + i];
            rr(g, x - ks / 2, ky - ks / 2, ks, ks, Math.min(6, ks * 0.22));
            g.fillStyle = on ? 'rgba(235,242,255,0.92)' : 'rgba(255,255,255,0.07)'; g.fill();
            g.strokeStyle = on ? 'rgba(255,255,255,0.95)' : 'rgba(220,230,255,0.32)'; g.lineWidth = 1.2; g.stroke();
            g.fillStyle = on ? '#14141c' : 'rgba(235,240,255,0.72)';
            g.fillText(keyLabel(k), x, ky + 1);
        });
        g.restore();
    }
    // 판정 글자 · 빠르게 / 늦게 · 콤보
    if (P.judge) {
        const k = (tnow - P.judge.at) / 520;
        if (k < 1) {
            const J = JTX[P.judge.k];
            g.save(); g.globalAlpha = 1 - k * k; g.textAlign = 'center';
            g.shadowColor = J[2]; g.shadowBlur = 12;
            g.fillStyle = J[1]; g.font = '600 ' + Math.round(VH * 0.055) + 'px Georgia, serif';
            g.fillText(J[0], VW / 2, L.yJ - VH * 0.17 - k * 8);
            if (P.judge.k === 'n' && P.judge.dt != null) {
                g.shadowBlur = 0; g.font = Math.round(VH * 0.03) + 'px sans-serif';
                g.fillStyle = P.judge.dt < 0 ? '#8fd0ff' : '#ffb38a';
                g.fillText(P.judge.dt < 0 ? 'FAST' : 'SLOW', VW / 2, L.yJ - VH * 0.17 + VH * 0.045 - k * 8);
            }
            g.restore();
        }
    }
    if (P.combo >= 5) {
        g.save(); g.textAlign = 'center';
        g.fillStyle = 'rgba(255,255,255,0.88)'; g.font = '300 ' + Math.round(VH * 0.1) + 'px Georgia, serif';
        g.fillText(String(P.combo), VW / 2, VH * 0.3);
        g.fillStyle = 'rgba(255,255,255,0.45)'; g.font = Math.round(VH * 0.026) + 'px Georgia, serif';
        g.fillText('C O M B O', VW / 2, VH * 0.3 + VH * 0.045);
        g.restore();
    }
    // 위 — 진행 · 정확도
    const prog = Math.max(0, Math.min(1, now / P.chart.dur));
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(0, 0, VW, 2);
    g.fillStyle = P.s.color; g.fillRect(0, 0, VW * prog, 2);
    const done = P.cnt.c + P.cnt.n + P.cnt.m;
    const acc = done ? (P.cnt.c + P.cnt.n * 0.6) / done * 100 : 100;
    g.textAlign = 'right'; g.textBaseline = 'top';
    g.fillStyle = '#fff'; g.font = '600 ' + Math.round(VH * 0.048) + 'px Georgia, serif';
    g.fillText(acc.toFixed(2) + '%', VW - 14, 10);
    g.font = Math.round(VH * 0.027) + 'px sans-serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    g.fillText(P.s.title + ' · ' + D[1] + ' ' + P.chart.charts[P.d].level, VW - 14, 12 + VH * 0.055);
    g.textBaseline = 'alphabetic';
    if (now < 0) {
        g.save(); g.textAlign = 'center';
        g.fillStyle = 'rgba(255,255,255,' + Math.min(1, -now / 600) + ')'; g.font = '300 ' + Math.round(VH * 0.07) + 'px Georgia, serif';
        g.fillText(P.s.title, VW / 2, VH * 0.42);
        g.font = Math.round(VH * 0.03) + 'px Georgia, serif'; g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillText(P.s.artist, VW / 2, VH * 0.42 + VH * 0.06);
        g.restore();
    }
}

// ==========================================
// 끝
// ==========================================
function result() {
    if (!P || !OV) return;
    MODE = 'result';
    stopPlay();
    const sc = Math.round(P.score), pct = (sc / 10000).toFixed(2);
    const fc = P.cnt.m === 0, ac = fc && P.cnt.n === 0;
    const best = loadJ(BEST_KEY, {}), k = P.s.key + '/' + P.d, old = best[k];
    const newBest = !old || sc > old.score;
    if (newBest) best[k] = { score: sc, fc: fc, ap: ac, at: Date.now() };
    else { best[k].fc = old.fc || fc; best[k].ap = old.ap || ac; }
    saveJ(BEST_KEY, best);
    // 평균 타이밍 — 맞힌 터치 · 길게 누르기 머리
    const offs = P.offs.slice().sort(function (a, b) { return a - b; });
    const mid = offs.length ? offs[Math.floor(offs.length / 2)] : 0;
    const avg = offs.length >= 8 ? Math.round(mid) : null;
    const D = DIFFS.find(function (d) { return d[0] === P.d; });
    const rk = rankOf(sc, ac);
    const run = { s: sc, fc: fc, ac: ac, c: P.cnt.c, n: P.cnt.n, m: P.cnt.m, mc: P.maxCombo };
    const sk = P.s.key, dk = P.d;
    const lv = P.chart.charts[P.d].level;
    const pay = P.paid ? 0 : dreamPay(dk, rk[0], lv);
    P.paid = true;
    UI.innerHTML = '<div class="rg-bg"></div>'
        + '<div class="rg-modal" style="background:transparent"><div class="rg-box" style="padding:16px 28px;">'
        + '<div style="font-size:13px;color:#aab;">' + esc(P.s.title) + ' · <b style="color:' + D[3] + '">' + D[1] + ' ' + P.chart.charts[P.d].level + '</b></div>'
        + '<div class="rg-res"><div style="text-align:center;">'
        + '<div class="rg-rank rg-rk" style="--r:' + rk[2] + ';font-family:Georgia,serif;font-size:' + (rk[0].length > 2 ? 58 : 72) + 'px;">' + rk[0] + '</div>'
        + '<div style="font-family:Georgia,serif;font-weight:300;font-size:30px;color:#fff;">' + pct + '<small style="font-size:16px;">%</small></div>'
        + (ac ? '<div style="color:#ffc1e3;font-weight:bold;letter-spacing:3px;">ALL CHARMING</div>' : fc ? '<div style="color:#ffe066;font-weight:bold;letter-spacing:3px;">ALL COMBO</div>' : '')       // MISS 없이 끝까지 (2026-11-11 사용자 「FULL COMBO → ALL COMBO」)
        + (newBest ? '<div style="font-size:12px;color:#ffe066;">NEW BEST</div>' : '') + '</div>'
        + '<div class="rg-tbl"><div><b style="color:#ff9ccf">CHARMING</b>' + P.cnt.c + '</div><div><b style="color:#7ec8ff">NORMAL</b>' + P.cnt.n + '</div>'
        + '<div><b style="color:#a3a3b3">MISS</b>' + P.cnt.m + '</div><div><b>MAX COMBO</b>' + P.maxCombo + '</div>'
        + (avg != null ? '<div style="font-size:12px;color:#ccd;">평균 ' + sgn(avg) + 'ms · ' + (Math.abs(avg) <= 12 ? '딱 맞음' : avg > 0 ? '늦게 누름' : '빠르게 누름') + '</div>' : '')
        + '<div data-v="place" style="font-size:12px;color:#ffe9a8;">🏆 랭킹 올리는 중…</div>'
        + (pay ? '<div data-v="dream" style="font-size:12px;color:#c9a8ff;">💤 꿈결 +' + pay.toLocaleString() + ' D …</div>' : '')
        + '</div></div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;"><button class="rg-btn" data-k="re">다시</button><button class="rg-btn" data-k="q">곡 고르기</button><button class="rg-btn" data-k="rank">🏆 랭킹</button>'
        + (avg != null && Math.abs(avg) > 12 ? '<button class="rg-btn" data-k="sync">판정 싱크에 반영 (' + sgn(Math.max(-300, Math.min(300, SET.offset + avg))) + 'ms)</button>' : '')
        + '</div></div></div>';
    UI.querySelector('[data-k="re"]').onclick = function () { start(); };
    UI.querySelector('[data-k="q"]').onclick = function () { menu(); };
    UI.querySelector('[data-k="rank"]').onclick = function () { rankModal(dk); };
    const sy = UI.querySelector('[data-k="sync"]');
    if (sy) sy.onclick = function () { SET.offset = Math.max(-300, Math.min(300, SET.offset + avg)); saveSet(); sy.textContent = '판정 싱크 ' + sgn(SET.offset) + 'ms 로 맞췄습니다'; sy.disabled = true; };
    // 꿈결 — 하드 · D 이상
    // 🔓 이 판으로 조건을 채운 곡 (Handicap ← 내담자 여러분께 HARD B 이상)
    SONGS.forEach(function (x) {
        if (!x.need || owned(x) || x.need.song !== sk || x.need.diff !== dk) return;
        if (rankIdx(rk[0]) > rankIdx(x.need.rank)) return;
        if (grantNeed(x)) {
            const box = UI && UI.querySelector('.rg-tbl');
            if (box) box.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:' + x.color + ';">🔓 「' + esc(x.title) + '」 열림</div>');
        }
    });
    if (pay) dreamGive(pay, '[🎵 리듬 게임] ' + P.s.title + ' HARD ' + lv + ' · ' + rk[0] + ' — 💤 꿈결 +' + pay.toLocaleString() + ' D').then(function (g) {
        const el = UI && UI.querySelector('[data-v="dream"]'); if (!el) return;
        el.textContent = g.ok ? '💤 꿈결 +' + pay.toLocaleString() + ' D · 오늘 ' + g.n + '/' + DREAM_DAY
            : g.full ? '💤 오늘 꿈결 ' + DREAM_DAY + '번을 다 받았습니다' : '💤 꿈결을 받지 못했습니다';
    });
    // 랭킹 — 올리고 내 자리를 본다
    rankSave(sk, dk, run).then(function () { return rankList(sk, dk); }).then(function (list) {
        const el = UI && UI.querySelector('[data-v="place"]'); if (!el) return;
        const me = (u_() || {}).code;
        const i = list.findIndex(function (r) { return r.code === me; });
        el.textContent = i >= 0 ? ('🏆 랭킹 ' + (i + 1) + '위 / ' + list.length + '명') : '🏆 랭킹에 올리지 못했습니다';
    });
}

window.rhythmState = function () {
    console.log({ 모드: MODE, 곡: SET.song, 난이도: SET.diff, 속도: SET.speed, 판정싱크: SET.offset, 화면싱크: SET.vis, 점수: P && Math.round(P.score), 콤보: P && P.combo, 판정: P && P.cnt, 소리: AU.ctx && AU.ctx.state });
};
window.rhythmDebug = { P: function () { return P; }, now: function () { return songMs(); }, mode: function () { return MODE; }, L: function () { return L; }, lag: function () { return AU.lag; }, headLag: headLag, vis: function () { return visMs(); }, clock: function () { return clockMs(); }, cal: function () { return C; }, set: SET, rankOf: rankOf, previewChunk: previewChunk, previewAt: previewAt, drawOnce: function () { if (P && L) draw(P.lastVis || 0); } };   // 시험 · 콘솔
console.log('[🎵 리듬] rhythmOpen() — 상담사 전용');
})();
