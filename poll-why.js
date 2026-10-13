// ==========================================
// ★ 오염도가 왜 올랐나 — 조용히 오르던 것을 보이게
// bundles.json 마지막 묶음, poll-freeze.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 문제였나
//
//   「탐사를 안 갔는데도 오염도가 올라가 있다」
//
//   재어 보니 오염도가 오르는 길이 탐사 밖에도 열 몇 군데 있었다.
//   그런데 그 가운데 **알림도 기록도 없이** 오르는 것은 하나뿐이다.
//
//       index.html:5135   세 시간마다 +3%   (checkPassivePollution)
//
//   이것은 고장이 아니라 처음부터 그렇게 만든 것이다. 다만 **아무 흔적을
//   안 남긴다.** 특이사항에도, 기록에도, 알림창에도 안 뜬다. 기록은 열
//   줄만 남으므로 세 시간마다 한 줄을 적으면 중요한 줄이 밀려 나간다.
//   그래서 기록에 적는 대신 **오염도 칸 옆에 다음 상승을 적어 둔다.**
//
//   한 번에 여덟 칸(+24%)까지 몰아서 오른다는 것도 같이 적는다. 하루를
//   비우고 들어오면 그 순간 24% 가 올라 있다 — 그래서 「갑자기 올랐다」로
//   보인다.
//
// ■ 탐사 밖에서 오르는 길 (재어서 추린 것)
//
//   ① 알림도 기록도 없는 것
//        세 시간마다 +3%                       index.html:5135
//
//   ② 큰길로 오르는 것 — 상담사 면제 · 안대 · 동결이 다 걸린다
//        공용시설 한 판 +2 (섯다는 +4)          index.html:9514 · 8221
//        사택 이상 현상 +6~25 · 사고 +30        dark.js:9272 · 9301
//        기괴한 음식 +12~25                     index.html:7275
//        대출 기한 초과 +10                     bank.js:175
//        묵은 탐사 기록 실패 처리 +5            index.html:1976
//        세뇌 만년필 +50 (남이 채운다)          index.html:7459
//
//   ③ 큰길을 건너뛰는 것 — 동결을 걸어도 오른다
//        황금 막대, 한 판 +15                   jisan.js:651   (일부러 그렇게 둠)
//        뿅망치 대리 격리, 오염도 = 100         ppyong.js:292  (일부러 그렇게 둠)
//        격리에서 나올 때 오염도 = 50/40        eye.js · foxtail.js · talkshow.js · mj-ui.js
//        은심장으로 꺼낼 때 오염도 = 50         heart2.js:118
//        상한 환몽알 +10~15                     pet-hatch.js   ← 큰길로 돌려놓았다
//
//   ③ 가운데 상한 환몽알만 고쳤다. 나머지는 「그렇게 하기로 한 것」이라고
//   주석에 적혀 있어 건드리지 않았다. 대신 pollWhy() 가 전부 보여 준다.
//
// ■ 콘솔
//   pollWhy()     지금 오염도가 어디서 왔나 · 다음 자연 상승 · 막고 있는 것
//   pollWhere()   탐사 밖에서 오르는 길 전부
//
//   둘 다 보기만 한다. 아무것도 고치지 않는다.

(function pollWhyFile() {

const STEP = 3 * 3600 * 1000;        // 세 시간
const UP = 3;                        // 그때 오르는 몫
const CAP = 8;                       // 한 번에 몰아서 오르는 칸 수
const KEEP = 40;                     // 적어 두는 줄 수
const ADMIN = 'kario0987';

const log = [];                      // { t, from, to, by }
let byHint = 0;                      // 큰길이 방금 돌았다 — 그 시각
let seen = null;                     // 지난번에 본 오염도
let seenClock = 0;                   // 지난번에 본 lastPollutionTime

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function now() { return Date.now(); }
function mins(ms) { return Math.max(0, Math.ceil(ms / 60000)); }
function span(ms) {
    const m = mins(ms);
    return m >= 60 ? (Math.floor(m / 60) + '시간 ' + (m % 60) + '분') : (m + '분');
}

// ==========================================
// 막고 있는 것
// ==========================================
function blocks(u) {
    const out = [];
    if (!u) return out;
    if (u.code === ADMIN) out.push('상담사 면제');
    try { if (typeof isBlindfolded === 'function' && isBlindfolded(u)) out.push('안대'); } catch (e) { }
    try { if (typeof isPollFrozen === 'function' && isPollFrozen(u)) out.push('오염 동결'); } catch (e) { }
    try {
        if (typeof getPollutionMultiplier === 'function' && getPollutionMultiplier(u) === 0) {
            out.push('오염 배수 0 (은반지 · 버터 나이프 등)');
        }
    } catch (e) { }
    return out;
}

// 다음 자연 상승까지 — 막혀 있으면 null
function nextTick(u) {
    if (!u || u.code === ADMIN) return null;
    if (Number(u.pollution) >= 100) return null;
    if (Number(u.quarantineUntil) > 0) return null;
    if (blocks(u).length) return null;
    const at = Number(u.lastPollutionTime) || 0;
    if (!at) return null;                       // 시계가 아직 안 붙었다
    return Math.max(0, at + STEP - now());
}

// ==========================================
// 큰길이 돌 때를 적어 둔다
// ==========================================
//
//   어느 줄에서 불렀는지까지는 안 캔다 (스택을 뒤지면 무거워진다).
//   「큰길로 왔나 · 저절로 올랐나 · 큰길을 건너뛰었나」 셋만 가린다.
//   그 셋만 알면 고칠 자리는 찾을 수 있다.
function hook(name) {
    const iv = setInterval(function () {
        const f = window[name];
        if (typeof f !== 'function') return;
        if (f._why) { clearInterval(iv); return; }
        const w = function () {
            byHint = now();
            return f.apply(this, arguments);
        };
        w._why = true;
        window[name] = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
}
hook('applyPollutionToUser');
hook('addPollution');

// ==========================================
// 1초마다 들여다본다 — 오르면 어디서 왔는지 적는다
// ==========================================
setInterval(function () {
    // ★ 큰길 표식은 **한 칸만** 산다 — 보고 나면 비운다
    //
    //   1초마다 보므로, 큰길이 돈 뒤 다음 한 번만 그 몫으로 센다.
    //   안 비우면 바로 뒤에 직접 쓰기로 오른 것까지 큰길로 적혀
    //   건너뛴 자리를 놓친다 — 그게 찾으려는 바로 그 자리다.
    //   막혀서 안 오른 부름도 표식을 남기므로 **돌아가기 전에** 비운다.
    const viaMain = (now() - byHint) < 1200;
    byHint = 0;

    const u = u_();
    if (!u) { seen = null; return; }
    const v = Number(u.pollution) || 0;
    const clock = Number(u.lastPollutionTime) || 0;
    if (seen == null) { seen = v; seenClock = clock; return; }
    if (v === seen) { seenClock = clock; return; }

    let by;
    if (v < seen) by = '내려갔습니다';
    else if (viaMain) by = '큰길 (아이템 · 시설 · 기믹 등)';
    else if (clock !== seenClock && Math.abs(clock - now()) < 4000) {
        const steps = Math.min(CAP, Math.max(1, Math.round((v - seen) / UP)));
        by = '저절로 — 세 시간마다 +' + UP + '% (' + steps + '칸 몰림)';
    } else by = '직접 쓰기 — 큰길을 건너뛴 자리';

    log.unshift({ t: now(), from: seen, to: v, by: by });
    while (log.length > KEEP) log.pop();
    seen = v;
    seenClock = clock;
}, 1000);

// ==========================================
// 오염도 칸 옆에 다음 상승을 적는다
// ==========================================
(function mark() {
    setInterval(function () {
        const el = document.getElementById('pollution-text');
        const u = u_();
        if (!el || !u) return;
        let tag = document.getElementById('poll-next-tag');
        const left = nextTick(u);
        const bl = blocks(u);

        let t = '';
        if (bl.length) t = '';                       // 안대 표시가 따로 있다
        else if (left == null) t = '';
        else t = '세 시간마다 +' + UP + '% · 다음 ' + span(left);

        if (!t) { if (tag) tag.remove(); return; }
        if (!tag) {
            tag = document.createElement('span');
            tag.id = 'poll-next-tag';
            tag.style.cssText = 'margin-left:6px; font-size:9px; color:#8d8578;';
            el.parentElement.appendChild(tag);
        }
        if (tag.textContent !== t) tag.textContent = t;
        tag.title = '탐사를 안 가도 세 시간마다 ' + UP + '% 오릅니다.'
            + ' 한 번에 ' + CAP + '칸(+' + (CAP * UP) + '%)까지 몰려 오릅니다.'
            + ' 자세히 보려면 콘솔에 pollWhy() 를 적으십시오.';
    }, 3000);
})();

// ==========================================
// 확인
// ==========================================
window.pollWhy = function () {
    const u = u_();
    console.log('%c===== 오염도가 왜 올랐나 =====', 'color:#ff8a65; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    console.log('  지금 오염도:', (Number(u.pollution) || 0) + ' / 100%');
    const bl = blocks(u);
    console.log('  막고 있는 것:', bl.length ? bl.join(' · ') : '없음');
    const left = nextTick(u);
    console.log('  다음 자연 상승:', left == null
        ? '없음 (막혀 있거나 격리 중이거나 시계가 아직 안 붙었습니다)'
        : (span(left) + ' 뒤 +' + UP + '%'));
    const at = Number(u.lastPollutionTime) || 0;
    console.log('  오염 시계:', at ? new Date(at).toLocaleString() : '없음',
        at ? ('· ' + span(now() - at) + ' 지났습니다') : '');
    if (at && now() - at >= STEP) {
        const steps = Math.min(CAP, Math.floor((now() - at) / STEP));
        console.warn('  → 이미 ' + steps + '칸이 밀려 있습니다. 다음 셈에 +'
            + (steps * UP) + '% 가 한꺼번에 오릅니다.');
    }
    if (!log.length) {
        console.log('  적어 둔 변동: 없음 (이 창을 켜 둔 동안만 적습니다)');
    } else {
        console.log('%c  이 창에서 본 변동', 'color:#ff8a65');
        console.table(log.map(function (r) {
            return { 때: new Date(r.t).toLocaleTimeString(),
                     '오염도': r.from + ' → ' + r.to,
                     '얼마': (r.to > r.from ? '+' : '') + (r.to - r.from),
                     '어디서': r.by };
        }));
    }
    console.log('  길 전부를 보시려면 pollWhere()');
};

window.pollWhere = function () {
    console.log('%c===== 탐사 밖에서 오염도가 오르는 길 =====', 'color:#ff8a65; font-size:13px');
    console.table([
        { 길: '세 시간마다', 얼마: '+3% (한 번에 최대 +24%)', 알림: '없음',
          '동결·안대·면제': '걸린다', 자리: 'index.html:5135' },
        { 길: '공용시설 한 판', 얼마: '+2 (섯다 +4)', 알림: '없음',
          '동결·안대·면제': '걸린다', 자리: 'index.html:9514' },
        { 길: '사택 이상 현상', 얼마: '+6~25 · 사고 +30', 알림: '창',
          '동결·안대·면제': '걸린다', 자리: 'dark.js:9272' },
        { 길: '기괴한 음식', 얼마: '+12~25', 알림: '창',
          '동결·안대·면제': '걸린다', 자리: 'index.html:7275' },
        { 길: '대출 기한 초과', 얼마: '+10', 알림: '기록',
          '동결·안대·면제': '걸린다', 자리: 'bank.js:175' },
        { 길: '묵은 탐사 기록 실패 처리', 얼마: '+5', 알림: '창',
          '동결·안대·면제': '걸린다', 자리: 'index.html:1976' },
        { 길: '세뇌 만년필 (남이 채운다)', 얼마: '+50', 알림: '없음',
          '동결·안대·면제': '걸린다', 자리: 'index.html:7459' },
        { 길: '황금 막대, 한 판', 얼마: '+15', 알림: '토스트',
          '동결·안대·면제': '건너뛴다 (일부러)', 자리: 'jisan.js:651' },
        { 길: '뿅망치 대리 격리', 얼마: '= 100', 알림: '창',
          '동결·안대·면제': '건너뛴다 (일부러)', 자리: 'ppyong.js:292' },
        { 길: '격리에서 나올 때', 얼마: '= 50 또는 40', 알림: '창',
          '동결·안대·면제': '건너뛴다', 자리: 'eye.js · foxtail.js · talkshow.js · mj-ui.js' },
        { 길: '은심장으로 꺼낼 때', 얼마: '= 50', 알림: '창',
          '동결·안대·면제': '건너뛴다', 자리: 'heart2.js:118' },
        { 길: '상한 환몽알', 얼마: '+10~15', 알림: '창',
          '동결·안대·면제': '걸린다 (고쳤음)', 자리: 'pet-hatch.js' }
    ]);
    console.log('  알림이 「없음」인 셋이 「탐사를 안 갔는데 올라가 있다」로 보이는 것입니다.');
    console.log('  그 가운데 세 시간마다 오르는 것은 이제 오염도 칸 옆에 적힙니다.');
};

console.log('[오염] pollWhy() · pollWhere()');

})();
