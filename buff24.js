// ==========================================
// ★ 일회용 버프 — 전부 24시간으로
// index.html 에서 맨 뒤(save-merge.js 앞)에 불러온다
// ==========================================
//
// 판정에 걸리는 버프(행운·판정·기믹 파괴 같은 것)의 기본 지속시간을
// 24시간으로 맞춘다. 앞으로 넣는 아이템도 따로 적지 않으면 24시간이 된다.
//
// 지금 있는 물건 중 지속시간이 따로 적혀 있는 것은 그대로 둔다.
//   연구 보고서   행운 300%    3시간
//   유리구슬      행운 300%    5시간
//   달빛 타투     행운 300%   12시간 · 기믹 24시간
//   엽서          행운 100%   12시간 · 판정 12시간
//   봉제 인형     두 가지      사흘
//   은화 뱀       행운·판정   24시간
//
// 그 밖에 건드리지 않는 것
//   · { run: true } — 「다음 어둠 1회」짜리. 시간이 아니라 횟수다.
//   · 성별 반전·동물화 같은 연출용 효과 — 판정에 안 걸린다.

(function buff24() {

const H = 3600 * 1000;
const WANT = 24 * H;

// 판정에 걸리는 몫 — 이 열쇠가 붙은 버프만 24시간으로 맞춘다
const KEYS = {
    luck: 1,      // 행운
    bon: 1,       // 판정 가산
    gim: 1,       // 기믹 파괴
    pct: 1,       // 상시 행운배수
    eva: 1,       // 회피
    fac: 1,       // 공용시설
    dark: 1,      // 어둠 탐사 횟수
    death: 1,     // 사망 회피
    resist: 1,    // 저항
    noPoll: 1     // 오염 동결
};

// 시간을 그대로 두는 것 — 설명에 적힌 기간이 따로 있는 물건
// (ibAdd 의 src 이름과 똑같이 적어야 걸린다)
const KEEP = {
    '봉제 인형': 1,      // 사흘
    '달빛': 1,           // 달빛 타투 — 행운 12시간 · 기믹 24시간
    '엽서': 1,           // 행운·판정 12시간
    '연구 보고서': 1     // 행운 3시간
};

// ==========================================
// 1. ibAdd — 신규 아이템 버프 저장소
// ==========================================
(function hookIb() {
    const iv = setInterval(function () {
        if (typeof ibAdd !== 'function') return;
        if (ibAdd._b24) { clearInterval(iv); return; }

        const _add = ibAdd;
        ibAdd = function (u, k, v, ms, src, opt) {
            // 횟수형(run)은 시간이 없다 — 그대로 보낸다
            if (opt && opt.run) return _add.apply(this, arguments);
            if (KEYS[k] && !KEEP[src]) ms = WANT;
            return _add.call(this, u, k, v, ms, src, opt);
        };
        ibAdd._b24 = true;
        clearInterval(iv);
        console.log('[버프] ibAdd 24시간 연결');
    }, 500);
})();

// ==========================================
// 2. addTimedEffect — 이름표 효과
// ==========================================
//
// 판정에 걸리는 것만 24시간으로 올린다.
// 여기 없는 이름은 원래 시간 그대로 간다.
// 유리구슬은 다섯 시간 그대로 둔다 (설명에 적혀 있다)
const TIMED_24 = {
    // '아이의 운' 은 여기서 뺐다 — 출산품마다 1~4시간이라고 적혀 있는데
    // 24시간으로 덮이고, 겹쳐 쓰면 하루씩 또 쌓여 영영 안 끝났다. (birth-end.js)
    '감자맛 물약': 1,     // 행운 +100 (이미 24)
    '먹물맛 물약': 1      // 회피 +2 (이미 24)
};

(function hookTimed() {
    const iv = setInterval(function () {
        if (typeof addTimedEffect !== 'function') return;
        if (addTimedEffect._b24) { clearInterval(iv); return; }

        const _t = addTimedEffect;
        addTimedEffect = function (user, name, desc, hours) {
            if (TIMED_24[name]) hours = 24;
            return _t.call(this, user, name, desc, hours);
        };
        addTimedEffect._b24 = true;
        clearInterval(iv);
        console.log('[버프] addTimedEffect 24시간 연결');
    }, 500);
})();

// ==========================================
// 3. 만료된 버프를 서버에서도 지운다
// ==========================================
//
// ibClean 은 걸러서 보여 주기만 하고 저장을 안 한다.
// 그래서 다 끝난 버프가 기록에 계속 쌓인다. 10분마다 한 번 치운다.
(function sweep() {
    setInterval(function () {
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (!Array.isArray(currentUser.itemBuffs) || !currentUser.itemBuffs.length) return;
        const now = Date.now();
        const before = currentUser.itemBuffs.length;
        currentUser.itemBuffs = currentUser.itemBuffs.filter(function (b) {
            if (!b) return false;
            if (b.run) return true;
            return !b.until || b.until > now;
        });
        if (currentUser.itemBuffs.length === before) return;
        if (typeof saveFields === 'function') {
            try { saveFields({ itemBuffs: 1 }); } catch (e) { }
        }
        console.log('[버프] 끝난 버프 ' + (before - currentUser.itemBuffs.length) + '개를 치웠습니다.');
    }, 10 * 60 * 1000);
})();

// ==========================================
// 확인
// ==========================================
window.buff24State = function () {
    if (!currentUser) { console.log('로그인 후에 쓰세요.'); return; }
    const list = currentUser.itemBuffs || [];
    console.log('%c===== 지금 걸린 버프 =====', 'color:#ffd700; font-size:13px');
    if (!list.length) { console.log('  없습니다.'); }
    else {
        console.table(list.map(function (b) {
            return {
                효과: b.k, 값: b.v, 출처: b.src || '-',
                종류: b.run ? '다음 어둠 1회' : '시간',
                남음: b.run ? '-'
                    : (b.until ? Math.max(0, Math.round((b.until - Date.now()) / 60000)) + '분' : '무기한'),
                대상: KEYS[b.k] ? '24시간 통일 대상' : '-'
            };
        }));
    }
    const eff = currentUser.timedEffects || [];
    if (eff.length) {
        console.log('  이름표 효과:');
        console.table(eff.map(function (e) {
            return {
                이름: e.name, 내용: e.desc,
                남음: e.until ? Math.max(0, Math.round((e.until - Date.now()) / 60000)) + '분' : '-',
                대상: TIMED_24[e.name] ? '24시간 통일 대상' : '-'
            };
        }));
    }
    console.log('  연결 — ibAdd:', (typeof ibAdd === 'function' && ibAdd._b24) ? 'O' : '✗',
        '· addTimedEffect:', (typeof addTimedEffect === 'function' && addTimedEffect._b24) ? 'O' : '✗');
};

console.log('[버프] 일회용 버프 24시간 통일 · buff24State()');

})();