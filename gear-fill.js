// ==========================================
// ★ 전용 장비가 없는 사원에게 — 이모지 · 이름을 무작위로 정해 하나씩 (2026-10-28)
// bundles.json 마지막 묶음 맨 끝쪽 (user-norm.js · save-merge.js 뒤)
// ==========================================
//
// ■ 무엇을 하나
//   전용 장비(soulGear)가 없는 사원은 들어올 때 제 몫을 하나 받는다 — 상담사가 주는 것과 같은 꼴
//   { icon, name, grade:'D', attrs:[], slots:1, createdAt }. 속성은 소지품 탭에서 직접 고른다 (전과 같다).
//   이모지와 이름은 아래 표에서 **사번 해시**로 정한다 — 어느 기기에서 보든 같은 것이 나오고, 겹치는 일은 적다.
//
//   상담사 화면에서는 **접속하지 않은 사원까지** 한 번에 채운다 (gearFillAll · 들어오면 저절로 한 번).
//   같은 사원에게 두 번 주지 않게 users/<사번>/soulGear 에 트랜잭션으로 「비어 있을 때만」 적는다.
//
// ■ 콘솔
//   gearFillAll()     상담사 — 없는 사원 전부
//   gearFillState()   누가 아직 없나

(function gearFill() {

const ADMIN = 'kario0987';

const ICONS = ['🗝', '🪞', '🕯', '🧭', '⚖', '🪶', '🔔', '🪡', '🧵', '🪨', '🫧', '🧿', '🪬', '🕰', '📿', '🪵',
               '🌙', '🌑', '☂', '🧷', '🔗', '⚙', '🪤', '🧲', '🪔', '🫙', '🧊', '🥀', '🍂', '🪺', '🪹', '🐚',
               '🦴', '🧸', '📌', '🖇', '🪜', '🎐', '🎴', '🀄'];

const NAMES = ['반 박자 늦은 이름', '아직 식지 않은 열쇠', '두 번 접힌 지도', '누가 두고 간 우산', '뒤집어 쓴 거울', '소리 없는 종',
               '한 번도 켜지 않은 등', '어제의 영수증', '빈칸이 많은 달력', '남의 이름이 적힌 명찰', '멈춘 손목시계', '잘못 배달된 상자',
               '녹슬지 않는 못', '반쯤 지워진 낙서', '구겨진 사직서', '돌아오지 않은 메아리', '세 번째 열쇠고리', '마르지 않는 잉크',
               '마지막 장이 없는 수첩', '발신인 없는 엽서', '숫자가 바뀐 번호표', '혼자 남은 장갑', '깨지지 않은 알', '기울어진 액자',
               '비어 있는 봉투', '닳지 않는 지우개', '창문 없는 방의 열쇠', '끝이 보이지 않는 실', '구멍 난 주머니', '늘 젖어 있는 수건',
               '바닥이 없는 컵', '뒤에서 부른 이름', '안쪽에 적힌 글씨', '아무도 안 받는 전화', '먼저 닳은 왼쪽 신발', '밤에만 보이는 얼룩',
               '손에 남은 온기', '다 쓴 성냥갑', '귀퉁이 접힌 사진', '멈춘 회전문', '오래된 입장권', '서랍 맨 안쪽의 것', '틀린 시간의 시계',
               '두 번 읽은 편지', '창틀의 먼지', '끝까지 안 풀린 매듭', '빌려 간 사람이 없는 책', '주인이 바뀐 열쇠', '조용한 자명종',
               '물이 고이는 자리', '늘 한 칸 비는 서가', '이름 없는 정류장', '한쪽만 남은 귀걸이', '가장 낡은 단추', '뒤늦게 온 답장',
               '기억나지 않는 비밀번호', '첫 장이 찢긴 사전', '아무도 안 앉는 의자', '반대로 도는 나침반', '빛이 안 드는 창'];

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function hash(s) { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function hasGear(u) { const g = u && u.soulGear; return !!(g && typeof g === 'object' && g.name); }
function pick(code) {
    const h = hash(code);
    return { icon: ICONS[h % ICONS.length], name: NAMES[(h >>> 8) % NAMES.length] };
}
function make(code) {
    const p = pick(code);
    return { icon: p.icon, name: p.name, grade: 'D', attrs: [], slots: 1, createdAt: Date.now() };
}
function alert_(t) { try { if (typeof showCustomAlert === 'function') showCustomAlert(t); } catch (e) { } }

// 한 사원에게 — 비어 있을 때만 (트랜잭션). 돌려주는 값: Promise<장비 | null>
function give(code) {
    const d = db_();
    if (!d || !code || code === ADMIN) return Promise.resolve(null);
    const g = make(code);
    return d.ref('users/' + code + '/soulGear').transaction(function (cur) {
        if (cur && typeof cur === 'object' && cur.name) return;        // 이미 있다
        return g;
    }).then(function (r) {
        if (!r || !r.committed) return null;
        const v = r.snapshot ? r.snapshot.val() : g;
        try {
            const t = users()[code];
            if (t) {
                t.soulGear = v;
                if (typeof addHistoryLog === 'function') {
                    addHistoryLog(t, "[전용 장비] '" + v.name + "'을(를) 지급받았습니다. 속성을 선택해야 효력이 생깁니다.");
                    const me = u_();
                    if (me && me.code === code) { try { saveFields({ history: 1 }); } catch (e) { } }
                    else if (typeof updateUserFields === 'function') updateUserFields(code, { history: t.history });
                }
            }
        } catch (e) { }
        return v;
    }).catch(function (e) { console.warn('[전용 장비] 지급 실패', code, e && e.message); return null; });
}

// 내 것 — 들어와서 없으면 받는다
let mineFor = '';
setInterval(function () {
    try {
        const me = u_();
        if (!me || !me.code || !db_() || me.code === ADMIN) return;
        if (mineFor === me.code) return;
        if (hasGear(me)) { mineFor = me.code; return; }
        mineFor = me.code;
        give(me.code).then(function (v) {
            if (!v) return;
            me.soulGear = v;
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_('전용 장비를 받았습니다.\n\n' + v.icon + ' ' + v.name + '\n\n소지품 탭에서 속성을 고르면 효력이 생깁니다.');
        });
    } catch (e) { }
}, 2500);

// 상담사 — 없는 사원 전부 (접속하지 않은 사원도)
window.gearFillAll = function (quiet) {
    const me = u_();
    if (!me || me.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return Promise.resolve([]); }
    const all = users();
    const need = Object.keys(all).filter(function (c) { return c !== ADMIN && all[c] && all[c].name && !hasGear(all[c]); });
    if (!need.length) { if (!quiet) console.log('[전용 장비] 없는 사원이 없습니다.'); return Promise.resolve([]); }
    return Promise.all(need.map(function (c) { return give(c).then(function (v) { return v ? { code: c, name: all[c].name, gear: v } : null; }); }))
        .then(function (rs) {
            const got = rs.filter(Boolean);
            if (got.length) console.log('%c✓ 전용 장비 ' + got.length + '명에게 — ' + got.map(function (x) { return x.name + ' ' + x.gear.icon + ' ' + x.gear.name; }).join(' · '), 'color:#4CAF50');
            try { if (typeof renderAdminGearList === 'function') renderAdminGearList(); } catch (e) { }
            return got;
        });
};
let adminDone = '';
setInterval(function () {
    try {
        const me = u_();
        if (!me || me.code !== ADMIN || !db_()) return;
        if (adminDone === me.code) return;
        if (!Object.keys(users()).length) return;
        adminDone = me.code;
        setTimeout(function () { window.gearFillAll(true); }, 4000);           // 사원 기록이 다 내려온 뒤에
    } catch (e) { }
}, 3000);

window.gearFillState = function () {
    const all = users();
    const need = Object.keys(all).filter(function (c) { return c !== ADMIN && all[c] && all[c].name && !hasGear(all[c]); });
    console.log('%c===== 전용 장비 채우기 =====', 'color:#c9a8ff; font-size:13px');
    console.log('  아직 없는 사원:', need.length ? need.map(function (c) { const p = pick(c); return all[c].name + '(' + (all[c].no || c) + ') → ' + p.icon + ' ' + p.name; }).join(' · ') : '없음');
};

console.log('[전용 장비] gearFillAll() · gearFillState()');

})();
