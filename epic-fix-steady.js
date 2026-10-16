// ==========================================
// ★ Qtrew-???-■■■ — ✚보정 / ▣굳건 여섯 자리
// bundles.json — epic-merchant-4.js 다음 · epic-bearer-1.js 앞 · epic-fill.js 앞
// ==========================================
//
// 새 속성 둘(attr2.js)에 맞춰 자리를 셋씩 더한다. 이로써 자리는 30종이고,
// 한 사람이 한 자리를 맡으므로 탐사 정원도 30명이다 (epic.js 의 max).
//
//   ✚ 보정 — 남을 바로 세우는 자리. 제게는 몫이 없다.
//       기수 🚩       성문에서 시작 · 쓰러진 깃발을 다시 세운다
//       등불지기 🏮   끊긴 길에서 시작 · 꺼진 등을 끝까지 다시 켠다
//       측량사 📐     기울어진 탑에서 시작 · 탑의 기울기를 재어 적는다
//
//   ▣ 굳건 — 버티는 자리.
//       짐꾼 🎒       장터에서 시작 · 아무도 끝까지 못 나른 짐을 나른다
//       순례자 🥾     신전에서 시작 · 마지막 계단까지 걸어 올라 절한다
//       고행자 📿     거울 호수에서 시작 · 하루 낮밤을 움직이지 않고 버틴다
//
// ■ 장면
//   자리마다 epic-<자리>-1~4.js 네 장에 나눠 담았다 (다른 자리와 같은 분량 —
//   58장면 안팎 · 미니게임 12 · 동료 기믹 13 · 즉사 기믹 18 · 목표 선택지 3).
//
// ■ 갈 수 있는 곳
//   속성마다 열리는 장소가 셋씩 있다 (성문 · 빈 마을은 누구나).
//       보정  끊긴 길 · 기울어진 탑 · 폐허 회랑
//       굳건  열린 장터 · 무너진 신전 · 거울 호수

(function epicFixSteady() {

const NEW_JOBS = {
    // ✚ 보정
    bearer:   { name:'기수',     icon:'🚩', attr:'fix',    desc:'깃발이 서 있는 동안은 아무도 길을 잃지 않는다. 드는 사람만 빼고.',
                start:'gate',   goal:{ id:'g_bearer',   text:'쓰러진 성문 깃대에 깃발을 다시 세운다.', grade:3 } },
    lamp:     { name:'등불지기', icon:'🏮', attr:'fix',    desc:'남의 발밑을 비추느라 제 발밑은 늘 어둡다.',
                start:'road',   goal:{ id:'g_lamp',     text:'끊긴 길의 꺼진 등을 끝까지 다시 켠다.', grade:2 } },
    surveyor: { name:'측량사',   icon:'📐', attr:'fix',    desc:'어긋난 것을 재어 바로잡는다. 제 눈금만 빼고.',
                start:'tower',  goal:{ id:'g_surveyor', text:'기울어진 탑의 기울기를 재어 바로 적는다.', grade:3 } },

    // ▣ 굳건
    porter:   { name:'짐꾼',     icon:'🎒', attr:'steady', desc:'무거운 것은 나눠 들지 않는다. 혼자 끝까지 든다.',
                start:'market', goal:{ id:'g_porter',   text:'아무도 끝까지 못 나른 짐을 장터 끝까지 나른다.', grade:2 } },
    pilgrim:  { name:'순례자',   icon:'🥾', attr:'steady', desc:'닳는 것은 신발이고 발은 닳지 않는다고 믿는다.',
                start:'temple', goal:{ id:'g_pilgrim',  text:'무너진 신전의 마지막 계단까지 걸어 올라 절한다.', grade:3 } },
    ascetic:  { name:'고행자',   icon:'📿', attr:'steady', desc:'굶는 법을 배워서, 배고픔이 먼저 지친다.',
                start:'lake',   goal:{ id:'g_ascetic',  text:'거울 호수 앞에서 하루 낮밤을 움직이지 않고 버틴다.', grade:2 } }
};

Object.keys(NEW_JOBS).forEach(function (k) { EPIC_JOBS[k] = NEW_JOBS[k]; });

// 속성 이름 · 아이콘 (attr2.js 도 넣지만, 그쪽은 기다렸다 넣으므로 여기서 먼저 둔다)
EPIC_ATTR_NAME.fix = '보정';    EPIC_ATTR_ICON.fix = '✚';
EPIC_ATTR_NAME.steady = '굳건'; EPIC_ATTR_ICON.steady = '▣';

// 열리는 장소
const OPEN = { fix: ['road', 'tower', 'ruin'], steady: ['market', 'temple', 'lake'] };
Object.keys(OPEN).forEach(function (a) {
    OPEN[a].forEach(function (pl) {
        const p = EPIC_PLACES[pl];
        if (!p || !p.open) return;                     // open 이 없으면 이미 누구나
        if (p.open.indexOf(a) < 0) p.open.push(a);
    });
});

// 정원 — epic.js 에 30 으로 적었지만, 다른 파일이 덮어써도 따라오게 한 번 더
if (DARK_ZONES[EPIC_CODE]) DARK_ZONES[EPIC_CODE].max = Object.keys(EPIC_JOBS).length;

// 확인
window.epicFixSteadyState = function () {
    console.log('%c===== ✚보정 · ▣굳건 자리 =====', 'color:#d4af37; font-size:13px');
    console.table(Object.keys(NEW_JOBS).map(function (k) {
        let n = 0;
        Object.keys(EPIC_SCENES).forEach(function (pl) {
            const a = EPIC_SCENES[pl] && EPIC_SCENES[pl].job && EPIC_SCENES[pl].job[k];
            if (a) n += a.length;
        });
        const j = EPIC_JOBS[k];
        return { 자리: j.icon + ' ' + j.name, 속성: EPIC_ATTR_NAME[j.attr], 시작: EPIC_PLACES[j.start].name, 장면: n };
    }));
    console.log('  자리 ' + Object.keys(EPIC_JOBS).length + '종 · 정원 ' + DARK_ZONES[EPIC_CODE].max + '명');
};

console.log('[???] 보정 · 굳건 자리 여섯 — epicFixSteadyState()');

})();
