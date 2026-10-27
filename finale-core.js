// ==========================================
// ★ 「제■■■회 완벽한 피날레」 — 뼈대 (2026-10-25)
// bundles.json 마지막 묶음 — finale-text.js 다음, finale-op/sw/be/bq.js 앞
// ==========================================
//
// ■ 무엇인가
//
//   노션 시나리오를 그대로 옮긴 어둠. 지문은 finale-text.js (원문에서 뽑은 장면 나무),
//   진행 · 숫자는 이 파일과 finale-op / sw / be / bq.js 가 정한다.
//
//   오프닝 → 로비 0차 → 1차 탐사 → 로비 1차 → 2차 탐사 → 로비 2차 → 끝나지 않는 연회 → 엔딩
//   한 판 안에서 두 부스(달콤 · 아름다움)가 동시에 돈다. 그래서 기존 curStep 한 줄로는 못 돈다.
//   이 구역은 renderDarkStep 을 가로채 스스로 그린다 (epic.js · kroom-core.js 와 같은 길).
//
// ■ 상태
//
//   내 것   finaleMe/{파티}/{사번}   — 감화도 · 상품권 · 소지품 · 지금 화면 (남이 볼 일 없다)
//   함께    finale/{파티}             — 명단 · 공용 보관함 · NPC 기록 · 준비 · 투표 · 굴림 결과
//
//   화면은 늘 F.sc (지금 화면 하나) 로 다시 그릴 수 있게 둔다. 새로고침 · 복귀 · 동료 변화에도
//   같은 화면이 다시 뜬다. 효과(감화도 · 아이템)는 누를 때 한 번만 먹이고, 그리기는 그리기만 한다.
//
// ■ 사용자가 정한 규칙 (메모리 /areas/finale-dark.md)
//
//   · 게임의 판정 보정 · 즉사 막기는 듣는다. NPC 영입 판정만 맨 주사위.
//   · 대성공 · 대실패는 주사위 눈 20 · 1 일 때만.
//   · 주사위 3회 연속 실패 즉사 — NPC 판정 제외 · 아이템 획득 판정 포함 · 판 전체로 이어진다.
//   · 감화도 100 · 명찰 대리 참석자는 「탈락」 — 즉사 막기가 막지 않는다.
//
// ■ 콘솔
//   finState()      내 상태 · 함께 보는 상태 요약

(function finaleCore() {
'use strict';

const FIN = 'Qtrew-S-018';
const X = window.FINX = window.FINX || {};
X.CODE = FIN;

// ==========================================
// 구역 등록
// ==========================================
const OP1 = '처음 느껴지는 것은 푹신한 의자의 감촉입니다.<br><br>당신은 눈을 뜹니다. 낯선 천장이 보입니다. 눈부신 샹들리에, 정교하게 장식된 벽면, 그리고 어디선가 들려오는 잔잔한 음악 소리.';
if (typeof DARK_ZONES !== 'undefined') {
    DARK_ZONES[FIN] = {
        code: FIN, grade: 'S', name: '제■■■회 완벽한 피날레',
        brief: '(그대의 마지막 순간이 가장 아름답기를.)',
        warn: '트라우마 유발 가능성 주의 — 자살 소재, 사망 장면 직접 목격',
        danger: '최상', survival: '0.1%', min: 3, max: 8, reward: [25000, 35000], ready: true,
        voteMode: true, finale: true,
        intro: OP1,
        outro: '공연은 계속됩니다.',
        images: {}
    };
    // 목록 자리 — 「동화의 뒷면」(S-003) 바로 위. 어둠 목록은 DARK_ZONES 에 넣은 순서대로 그린다.
    (function placeAboveTale() {
        const keys = Object.keys(DARK_ZONES);
        const at = keys.indexOf('Qtrew-S-003');
        if (at < 0) return;
        const mine = DARK_ZONES[FIN];
        const tail = keys.slice(at).filter(function (k) { return k !== FIN; });
        const keep = {};
        tail.forEach(function (k) { keep[k] = DARK_ZONES[k]; delete DARK_ZONES[k]; });
        delete DARK_ZONES[FIN];
        DARK_ZONES[FIN] = mine;
        tail.forEach(function (k) { DARK_ZONES[k] = keep[k]; });
    })();
}

// ==========================================
// 지문 — finale-text.js 의 장면 나무
// ==========================================
function MD() { return window.FIN_MD || {}; }
// 제목이 h 로 시작하는 장면 (from 번째 것부터)
function sec(file, h, from) {
    const arr = MD()[file] || [];
    for (let i = from || 0; i < arr.length; i++) if (arr[i].h.indexOf(h) === 0) return arr[i].n;
    return null;
}
function secIdx(file, h) {
    const arr = MD()[file] || [];
    for (let i = 0; i < arr.length; i++) if (arr[i].h.indexOf(h) === 0) return i;
    return -1;
}
// 선택지 글이 lab 로 시작하는 것의 아래 장면
function opt(node, lab) {
    if (!node || !node.o) return null;
    let o = node.o.find(function (x) { return x.l.indexOf(lab) === 0; });
    if (!o) o = node.o.find(function (x) { return x.l.indexOf(lab) >= 0 || x.r.indexOf(lab) >= 0; });
    return o ? o.n : null;
}
function optAt(node, i) { return (node && node.o && node.o[i]) ? node.o[i].n : null; }
function labels(node) { return (node && node.o) ? node.o.map(function (x) { return x.l; }) : []; }
X.sec = sec; X.secIdx = secIdx; X.opt = opt; X.optAt = optAt; X.labels = labels;

function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
X.esc = esc;
// {{want}} · {{me}} · {{target}} · {{INPUT}}
function fill(html, o) {
    o = o || {};
    let s = String(html || '');
    s = s.replace(/\{\{want\}\}/g, '<b style="color:#d4af37;">' + esc((F && F.deal && F.deal.want) || '—') + '</b>');
    s = s.replace(/\{\{me\}\}/g, '<b>' + esc(o.me || (F && F.name) || '') + '</b>');
    s = s.replace(/\{\{target\}\}/g, '<b>' + esc(o.target || (F && F.tgtName) || '') + '</b>');
    s = s.replace(/\{\{INPUT\}\}/g, o.input != null
        ? '<div class="fin-say">“' + esc(o.input) + '”</div>'
        : '<div class="fin-say" style="color:#777;">…</div>');
    return s;
}
X.fill = fill;
// 장면 끝에 붙은 아이템 카드(「이름」 + 설명)는 걷는다 — 설명은 📦 에서 본다
function x(node) {
    if (!node) return '';
    return String(node.x || '').replace(/<div class="fin-q"><b>「([^」]+)」<\/b><br>[\s\S]*?<\/div>/g, function (m, k) {
        return (typeof IT !== 'undefined' && IT[k]) ? '' : m;
    });
}
X.x = x;

// ==========================================
// 모양
// ==========================================
(function css() {
    if (document.getElementById('fin-css')) return;
    const st = document.createElement('style');
    st.id = 'fin-css';
    st.textContent = [
        '.fin-q{background:rgba(212,175,55,0.07);border:1px solid #5a4a2a;border-radius:6px;padding:10px 12px;margin:10px 0;color:#e8d9a8;line-height:1.8;text-align:center;}',
        '.fin-sys{color:#d4af37;font-weight:bold;text-align:center;margin:10px 0;font-size:11px;line-height:1.7;}',
        '.fin-say{margin:10px 0;padding:10px 12px;border-left:3px solid #d4af37;background:rgba(0,0,0,0.3);color:#fff;font-size:13px;}',
        '.fin-note{background:rgba(0,0,0,0.35);border:1px solid #333;border-radius:6px;padding:9px 11px;margin:0 0 12px 0;font-size:11px;line-height:1.8;color:#ccc;}',
        '.fin-note b{color:#fff;}',
        '.fin-bar{display:flex;align-items:center;gap:8px;font-size:10px;color:#888;margin:0 0 12px 0;padding:7px 9px;background:rgba(0,0,0,0.3);border:1px solid #2a2a2a;border-radius:5px;}',
        '.fin-gam{flex:1;min-width:0;}',
        '.fin-gam .t{display:flex;justify-content:space-between;margin-bottom:3px;}',
        '.fin-gam .g{height:5px;background:#222;border-radius:3px;overflow:hidden;}',
        '.fin-gam .g div{height:100%;transition:width .4s;}',
        '.fin-bag{flex-shrink:0;background:none;border:1px solid #5a4a2a;color:#d4af37;font-size:11px;padding:5px 8px;border-radius:4px;cursor:pointer;}',
        '.fin-roll{text-align:center;font-size:26px;font-weight:bold;margin-bottom:12px;}',
        '.fin-roll small{font-size:12px;color:#888;font-weight:normal;}',
        '.fin-list{font-size:11px;line-height:1.9;color:#bbb;margin:0 0 12px 0;padding:9px 11px;background:rgba(0,0,0,0.3);border:1px solid #2a2a2a;border-radius:6px;}',
        '.fin-bsub{font-size:10px;color:#888;margin-top:4px;}',
        '.fin-wait{text-align:center;font-size:11px;color:#888;padding:12px;border:1px dashed #333;border-radius:6px;margin-bottom:10px;line-height:1.8;}',
        '#fin-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,0.78);display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;}',
        '#fin-ov .box{width:100%;max-width:430px;margin:40px 12px;background:#101010;border:1px solid #5a4a2a;border-radius:8px;padding:14px;color:#ddd;font-size:12px;line-height:1.8;}',
        '#fin-ov .it{border:1px solid #2a2a2a;border-radius:6px;padding:9px 10px;margin-bottom:8px;background:rgba(0,0,0,0.3);}',
        '#fin-ov .it .n{font-weight:bold;color:#e8d9a8;}',
        '#fin-ov .it .d{font-size:10px;color:#999;line-height:1.6;margin-top:3px;}',
        '#fin-ov .row{display:flex;gap:6px;margin-top:7px;}',
        '#fin-ov button{flex:1;margin:0;padding:7px;font-size:11px;}'
    ].join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 상태
// ==========================================
let F = null;          // 내 것
let S = {};            // 함께 보는 것
let PID = null, ME = null;
let sharedRef = null;
X.F = function () { return F; };
X.S = function () { return S; };
X.pid = function () { return PID; };
X.me = function () { return ME; };

function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function now() { return Date.now(); }
function clean(v) { try { return JSON.parse(JSON.stringify(v)); } catch (e) { return null; } }

let snapAt = 0;
function save() {
    if (!F || !PID || !ME) return;
    F.at = now();
    if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === FIN) {
        darkRun.success = F.succ || 0;
        darkRun.fail = F.fail || 0;
    }
    const d = db_();
    if (d) { try { d.ref('finaleMe/' + PID + '/' + ME).set(clean(F)); } catch (e) { } }
    if (now() - snapAt > 4000) snapRun();
}
X.save = save;

// 복귀 창(checkDarkRunResume)이 알아보게 — 탐사 중이라는 표만 적어 둔다
function snapRun() {
    const d = db_();
    if (!d || !F || F.st !== 'in' || typeof darkRun === 'undefined' || !darkRun) return;
    snapAt = now();
    try {
        d.ref('darkRuns/' + ME).set({
            zone: FIN, step: 0, savedAt: now(),
            success: F.succ || 0, fail: F.fail || 0, modifier: darkRun.modifier || 0,
            carryEquips: darkRun.carryEquips || [], carryItems: darkRun.carryItems || [],
            log: (darkRun.log || []).slice(-20), lostItems: [],
            isParty: true, isLeader: !!darkRun.isLeader, partyId: PID,
            memberCount: darkRun.memberCount || 1, counted: true, finale: true
        });
    } catch (e) { }
}

function pub(path, v) {
    const d = db_();
    if (!d || !PID) return Promise.resolve();
    try { return d.ref('finale/' + PID + '/' + path).set(v === undefined ? null : clean(v)); }
    catch (e) { return Promise.resolve(); }
}
function tx(path, fn) {
    const d = db_();
    if (!d || !PID) return Promise.resolve({ committed: false });
    try { return d.ref('finale/' + PID + '/' + path).transaction(fn); }
    catch (e) { return Promise.resolve({ committed: false }); }
}
X.pub = pub; X.tx = tx;

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
function isIn(c) { const p = pl()[c]; return !!(p && p.st === 'in' && !p.gone); }
function actives() { return Object.keys(pl()).filter(function (c) { return c.charAt(0) !== '_' && isIn(c); }).sort(); }
function n0() { return (S.meta && S.meta.n0) || 1; }
// 파티장 — 살아서 탐사 중인 사람 가운데. 방 기록의 방장이 그렇지 않으면 사번 순 첫째.
function leader() {
    let l = null;
    try { const p = darkParties[PID]; l = p && p.leader; } catch (e) { }
    const a = actives();
    if (l && a.indexOf(l) >= 0) return l;
    return a[0] || null;
}
X.nameOf = nameOf; X.isIn = isIn; X.actives = actives; X.n0 = n0; X.leader = leader;

// ==========================================
// 씨앗 난수 — 모두가 같은 답을 내야 하는 곳 (동률 · 카테고리 · 순서 · 배정)
// ==========================================
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
function pick(arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; }
X.hash = hash; X.srand = srand; X.shuffle = shuffle; X.pick = pick;

// ==========================================
// 아이템
// ==========================================
//   kept — 분실 · 던지기 · 보관함 넣기에서 빠진다 (향초 · 식탁보)
const IT = {
    '행사 안내 책자': { d: '완벽한 피날레의 일정과 각종 체험 부스에 관한 정보가 적힌 책자.', read: 'book' },
    '이름 없는 명찰': { d: '아무런 이름도 적혀 있지 않은 작은 명찰입니다. 명찰의 앞면은 깨끗하게 비어 있지만, 뒷면에는 아주 작은 글씨가 새겨져 있습니다.<br>「한 사람의 자리는, 다른 한 사람으로 대신할 수 있습니다.」', tag: true },
    '꺼지지 않는 향초': { d: '아무리 시간이 흘러도 불이 꺼지거나 녹아 없어지지 않는 향초. 은은하고 달콤한 향기를 풍긴다.', kept: true },
    '식탁보': { d: '가장자리에 「망상홈쇼핑」이라는 글자가 금색 실로 수놓인 새하얀 식탁보. 아무리 사용해도 더러워지지 않으며, 그 위에 놓인 물건은 끝없이 복제된다.', kept: true },
    '드림모지': { d: '꾸고 싶은 꿈을 적어 베개 밑에 두면 해당하는 꿈을 꿀 수 있는 메모지.' },
    '마녀의 독사과': { d: '먹기 전에 원하는 수면 시간을 말하면, 최대 24시간까지 잠들 수 있는 사과입니다.' },
    '아침 해': { d: '잠들기 전 원하는 기상 시각을 말하면 반드시 그 시간에 깨어나게 해 주는 장식품. 단, 기상 이후의 신체 상태는 보장하지 않습니다.' },
    '비밀을 지켜 주는 베개': { d: '베개에 대고 속삭인 비밀을 누구에게도 알려지지 않게 해 주는 베개.' },
    '엄마의 품': { d: '덮고 잠들면 밤새 누군가에게 안겨 있는 듯한 온기를 느낄 수 있는 이불.' },
    '마지막 자장가': { d: '듣는 사람에게 가장 그리운 목소리로 자장가를 들려주는 오르골.' },
    '악몽 수거함': { d: '잠자는 동안 꾸는 악몽을 병 안에 가두는 유리병. 깨지면 수거한 악몽이 풀려난다.' },
    '주머니 속 별빛': { d: '어두운 곳에서 은은하게 빛나는 작은 별. 아침이 오기 전에는 상자에 넣어 두어야 한다.' },
    '꺼지지 않는 향초 사용 설명서': { d: '망상홈쇼핑에서 판매하는 「꺼지지 않는 향초」의 정품 사용 설명서. 제품의 사용 방법과 주의 사항이 상세히 기재되어 있다. 표지에는 망상홈쇼핑의 로고가 인쇄되어 있다.', read: 'm1' },
    '식탁보 사용 설명서': { d: '망상홈쇼핑에서 판매하는 「식탁보」의 정품 사용 설명서. 제품의 올바른 사용 방법과 취급 시 주의 사항이 기재되어 있다. 표지에는 망상홈쇼핑의 로고가 인쇄되어 있다.', read: 'm2' },
    '마지막 립스틱': { d: '선명한 붉은색의 립스틱. 생기가 없는 입술에도 아름다운 혈색을 더해 준다.' },
    '미소 고정 장치': { d: '입꼬리에 착용하는 작은 금속 장치. 착용자의 의사와 관계없이 완벽한 미소를 유지시켜 준다.' },
    '피날레 전용 클렌징 오일': { d: '무대 분장을 지우기 위한 전용 세정제. 제품 뒷면에는 ‘피날레 종료 이전에만 사용 가능’이라는 주의 문구가 적혀 있다.' },
    '마지막 대사 수첩': { d: '무대에 오르기 전 마지막 대사를 적는 작은 수첩. 첫 장에는 ‘당신의 이야기는 아직 끝나지 않았습니다.’라는 문장이 적혀 있다.' },
    '휴대용 무대 조명': { d: '손바닥만 한 무대 조명. 스위치를 켜면 작은 빛이 한 사람의 얼굴만을 정확하게 비춘다.' },
    '무대 위의 흰 장미': { d: '무대용 꽃다발에서 꺼낸 흰 장미. 줄기에 작은 리본이 묶여 있다. 꽃잎은 아직 싱싱하다.' },
    '막간의 종': { d: '손바닥에 들어오는 작은 은색 종. 흔들면 맑은 소리가 난다. 손잡이에는 ‘모든 공연에는 끝이 있다.’라는 문장이 새겨져 있다.' },
    '배우 식별 끈': { d: '배우를 구분하기 위해 손목에 묶는 흰색 끈. 안쪽에는 작은 글씨로 ‘나는 나의 역할을 맡는다.’라고 적혀 있다.' },
    '관객 평가 카드': { d: '공연이 끝난 뒤 관객의 반응을 기록하는 카드. 앞면에는 ‘훌륭한 피날레’라는 문구가, 뒷면에는 빈 평가란이 있다.' }
};
X.IT = IT;
// 달콤 상품 8종 — 명찰 상인 요구 물품 · NPC 무작위 요구 물품의 후보 (향초는 뺀다)
const SWEET = ['드림모지', '마녀의 독사과', '아침 해', '비밀을 지켜 주는 베개', '엄마의 품', '마지막 자장가', '악몽 수거함', '주머니 속 별빛'];
X.SWEET = SWEET;

function invHas(k) { return !!(F && F.inv && F.inv.indexOf(k) >= 0); }
function invAdd(k) { if (!F.inv) F.inv = []; F.inv.push(k); }
function invDel(k) {
    if (!F || !F.inv) return false;
    const i = F.inv.indexOf(k);
    if (i < 0) return false;
    F.inv.splice(i, 1);
    return true;
}
// 잃을 수 있는 것 (향초 · 식탁보 빼고)
function losable() { return (F.inv || []).filter(function (k) { return !(IT[k] && IT[k].kept); }); }
X.invHas = invHas; X.invAdd = invAdd; X.invDel = invDel; X.losable = losable;

// 공용 보관함 — { id: {k, by, at} }
function storeList() {
    const s = S.store || {};
    return Object.keys(s).map(function (id) { return Object.assign({ id: id }, s[id]); })
        .filter(function (e) { return e && e.k; }).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
}
function storeHas(k) { return storeList().some(function (e) { return e.k === k; }); }
// 보관함에서 하나 꺼내 없앤다 (제출) — 성공하면 true
function storeTake(k) {
    const e = storeList().find(function (y) { return y.k === k; });
    if (!e) return Promise.resolve(false);
    let ok = false;
    return tx('store/' + e.id, function (cur) {
        ok = false;
        if (!cur) return;                // 이미 누가 가져갔다
        ok = true;
        return null;
    }).then(function (r) { return !!(r && r.committed && ok); }).catch(function () { return false; });
}
X.storeList = storeList; X.storeHas = storeHas; X.storeTake = storeTake;

// ==========================================
// 감화도 · 연속 실패 · 판정
// ==========================================
function gam(n, why) {
    if (!F) return 0;
    const was = F.gam || 0;
    F.gam = Math.max(0, Math.min(100, was + n));
    const d = F.gam - was;
    if (d && typeof darkRun !== 'undefined' && darkRun && darkRun.log) darkRun.log.push('[감화도] ' + (why || '') + ' ' + (d > 0 ? '+' : '') + d + ' → ' + F.gam);
    if (F.gam >= 100 && F.st === 'in') {
        F.st = 'out'; F.outWhy = 'gam';
        pub('pl/' + ME + '/st', 'out');
        try { sendPartyChat(F.name + ' 사원이 자리에서 일어났습니다.', true); } catch (e) { }
    }
    return d;
}
X.gam = gam;

// 판정 하나의 결과를 연속 실패에 반영한다 — 'dead' · 'warn' · null
function streak(ok) {
    if (ok) { F.streak = 0; return null; }
    F.streak = (F.streak || 0) + 1;
    if (F.streak >= 3) return 'dead';
    return F.streak === 2 ? 'warn' : null;
}
X.streak = streak;

function bodyMod() { return F && F.body === 'ear' ? -1 : F && F.body === 'eye' ? -2 : 0; }
// 인원수 보정 — 같은 장면에 참여한 사람 수 (최초 3인 이상일 때만)
function hc(n) {
    if (n0() < 3) return 0;
    const tot = actives().length || 1;
    if (n >= tot) return 2;
    if (n * 2 >= tot) return 1;
    return 0;
}
X.bodyMod = bodyMod; X.hc = hc;

// D20
//   o.kind  rollDarkBonus 종류 · o.dc (기본 15) · o.n 같은 장면 인원 · o.body 상품권 디버프 · o.extra
//   o.item  아이템 획득 판정 (1 · 20 은 그냥 실패 · 성공)
//   o.npc   NPC 판정 — 맨 주사위 (동행 신청서만 +1)
// ★ 경계 — 🔎 감지하는 눈 · 🌟 제 칠 성군을 지닌 사람(차고 있거나 · 소지품에 있거나 · 빼앗아 쓰고 있거나)은
//   이 무대가 알아보고 경계한다 — 판정 DC 가 높다 (2026-10-25 · 두 장비로 너무 쉽게 깼다 — 많이 올림).
//   하나면 +7 · 둘 다면 +10. NPC 판정(맨 주사위)은 그대로.
const WARY = ['🔎 감지하는 눈', '🌟 제 칠(七) 성군(星君)'];
const WARY_DC = [0, 7, 10];
function waryOf(u) {
    if (!u) return 0;
    const base = function (w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } };
    const has = function (n) {
        const eq = Array.isArray(u.equippedWeapons) ? u.equippedWeapons : [];
        const inv = Array.isArray(u.inventory) ? u.inventory : [];
        const bor = Array.isArray(u.borrowedGear) ? u.borrowedGear : [];
        return eq.some(function (w) { return base(w) === n; }) || inv.indexOf(n) >= 0
            || bor.some(function (w) { return String(w || '').indexOf(n) === 0; });
    };
    return WARY_DC[WARY.filter(has).length] || 0;
}
X.waryOf = waryOf;
function roll(o) {
    o = o || {};
    let raw = 1 + Math.floor(Math.random() * 30);
    let bonus = 0;
    const wary = o.npc ? 0 : waryOf(typeof currentUser !== 'undefined' ? currentUser : null);
    const dc = 16;
    if (o.npc) {
        bonus = o.plus || 0;
    } else {
        try { raw = luckReroll(raw); } catch (e) { }
        try { bonus = rollDarkBonus(o.kind || 'sense') || 0; } catch (e) { bonus = 0; }
        if (o.body) bonus += bodyMod();
        if (o.n) bonus += hc(o.n);
        bonus += (o.extra || 0);
        bonus -= wary;                                   // 경계는 보정에서 뺀다 (기준은 16 고정 · 2026-10-27)
        // 연회 — 파티장이 자리를 비웠을 때 대신 굴리는 사람이 쓰는 값
        if (!o.extra) pub('pl/' + ME + '/bon', bonus);
    }
    const total = raw + bonus;
    let out;
    if (o.item) out = (raw <= 3) ? 'fail' : (raw === 30) ? 'ok' : (total >= dc ? 'ok' : 'fail');
    else out = raw === 1 ? 'c1' : raw <= 3 ? 'fail' : raw === 30 ? 'c20' : total >= dc ? 'ok' : 'fail';
    // ⛓ 파훼 — 걸어 둔 것이 있으면 실패할 판정을 한 번 넘긴다 (NPC 판정은 빼고 · X.smash 참고)
    let smashed = null;
    if (!o.npc && F && Array.isArray(F.smash) && F.smash.length && (out === 'fail' || out === 'c1')) {
        smashed = String(F.smash.shift() || '파훼');
        out = 'ok';
        save();
    }
    if (typeof darkRun !== 'undefined' && darkRun && darkRun.log) darkRun.log.push('[판정] d30 ' + raw + (bonus ? (bonus > 0 ? '+' : '') + bonus : '') + ' vs ' + dc + ' → ' + out + (smashed ? ' (파훼 — ' + smashed + ')' : ''));
    return { raw: raw, bonus: bonus, total: total, dc: dc, out: out, npc: !!o.npc, smashed: smashed, wary: wary };
}
X.roll = roll;

// ==========================================
// ⛓ 파훼 — 기믹을 부수는 것들이 이 구역에서 하는 일 (2026-10-25)
// ==========================================
//   이 구역은 장면이 renderDarkStep 이 아니라 F.sc 로 돈다. 그래서 다른 어둠처럼
//   「부쉈다 → partyAdvance(다음 장면)」로 넘기면 같은 선택지로 되돌아왔다 (롤백처럼 보였다).
//   여기서는 부수는 것(⛓️‍💥 이레귤러의 사슬 · 🦋 파훼 나비 · 🐾 파괴 분신 · 루비 · 사인참사검)이
//   **다음에 실패할 판정을 한 번 넘기는 몫**으로 쌓인다 — F.smash = ['누가 · 무엇이', …]
//   NPC 판정에는 쓰이지 않는다 (NPC 판정은 맨 주사위 · 히든 조건).
function on() {
    return !!(F && F.st === 'in' && typeof darkRun !== 'undefined' && darkRun && darkRun.zone === FIN && !darkRun._dead && !darkRun._settled);
}
X.on = on;
X.smash = function (label) {
    if (!on()) return false;
    F.smash = (Array.isArray(F.smash) ? F.smash : []).concat([String(label || '파훼')]);
    save();
    try { if (typeof showDarkToast === 'function') showDarkToast('⛓ ' + (label || '파훼') + ' — 다음에 실패할 판정을 한 번 넘긴다'); } catch (e) { }
    try { view({ keep: true }); } catch (e) { }
    return true;
};
X.smashLeft = function () { return (F && Array.isArray(F.smash)) ? F.smash.length : 0; };
function rollHtml(r, cap) {
    const good = r.out === 'ok' || r.out === 'c20';
    const col = r.out === 'c20' ? '#d4af37' : good ? '#4CAF50' : '#f44336';
    const tag = r.out === 'c20' ? ' 대성공' : r.out === 'c1' ? ' 대실패' : '';
    const sub = r.npc
        ? '(보정 없음' + (r.bonus ? ' · 동행 신청서 +' + r.bonus : '') + ')'
        : '(보정 ' + (r.bonus >= 0 ? '+' : '') + r.bonus + ' / DC ' + r.dc + (r.wary ? ' · 경계 +' + r.wary : '') + ')';
    if (r.smashed) cap = (cap ? cap + '<br>' : '') + '⛓ ' + esc(r.smashed) + ' — 막고 있던 것이 부서져 이 판정을 넘겼다';
    return '<div class="fin-roll" style="color:' + col + ';">🎲 ' + r.raw + tag + ' <small>' + sub + '</small>'
        + (cap ? '<div style="font-size:10px; color:#888; font-weight:normal; margin-top:4px;">' + cap + '</div>' : '') + '</div>';
}
X.rollHtml = rollHtml;

// 세 번 연속 실패 — 즉사 (막기는 듣는다)
X.STREAK_DEATH = '<div class="fin-sys">세 번째입니다.</div>박자를 놓친 배우를 위해 기다려 주는 무대는 없습니다.<br><br>조명이 천천히 당신에게서 멀어집니다. 객석 어딘가에서 박수 소리가 들려옵니다.';

function countRoll(ok) {
    if (ok) F.succ = (F.succ || 0) + 1; else F.fail = (F.fail || 0) + 1;
}
X.countRoll = countRoll;

// 알림 줄 — 결과 화면 아래에 붙는다
function notes(arr) {
    arr = (arr || []).filter(Boolean);
    if (!arr.length) return '';
    return '<div class="fin-note">' + arr.join('<br>') + '</div>';
}
X.notes = notes;
function gamNote(d) {
    if (!d) return null;
    return '감화도 <b style="color:' + (d > 0 ? '#ff8a80' : '#81c784') + ';">' + (d > 0 ? '+' : '') + d + '</b> → ' + F.gam + ' / 100';
}
X.gamNote = gamNote;
function streakNote(s) {
    if (s === 'warn') return '<span style="color:#ff6b6b;">⚠ 두 번 연속 어긋났다. 한 번 더 어긋나면 끝이다.</span>';
    return null;
}
X.streakNote = streakNote;

// ==========================================
// 그리기
// ==========================================
let R = [];
window.finA = function (i) {
    const f = R[i];
    if (typeof f !== 'function') return;
    R = [];                       // 두 번 누르기 막기 — 다음 그림에서 새로 채운다
    try { f(); } catch (e) { console.error('[피날레]', e); try { view(); } catch (e2) { } }
};
// ☪️ 죽는 길 — 이 구역은 renderChoiceStep 을 거치지 않으므로, 죽음으로 이어지는 단추(o.die)에 여기서 단다.
//   다른 파일이 X.addSeer(fn) 로 「보는 이」를 건다 — fn() 이 글줄을 돌려주면 그 사람 화면에서 보인다 (2026-10-25 · foxcult.js)
const SEE = X.SEE = X.SEE || [];
X.addSeer = function (fn) { if (typeof fn === 'function') SEE.push(fn); };
function seeNote() {
    for (let i = 0; i < SEE.length; i++) { try { const s = SEE[i](); if (s) return String(s); } catch (e) { } }
    return '';
}
X.seeNote = seeNote;
// 장면마다 얹는 단추 — X.addOn(fn) · fn(o) 가 html 을 돌려준다 (배드 엔딩 같은 nobar 화면에는 얹지 않는다)
const ADD = X.ADD = X.ADD || [];
X.addOn = function (fn) { if (typeof fn === 'function') ADD.push(fn); };
function adds(o) {
    if (o.nobar) return '';
    return ADD.map(function (f) { try { return f(o) || ''; } catch (e) { return ''; } }).join('');
}
function UI() {
    const fns = [];
    const ui = {
        fns: fns,
        seen: '',
        b: function (label, fn, o) {
            o = o || {};
            if (o.die && !o.dis) {
                const s = seeNote();
                if (s) { if (String(label).indexOf('☪️') < 0) label = '☪️ ' + label; ui.seen = s; }
            }
            const i = fns.push(fn) - 1;
            const st = 'width:100%; margin:0 0 8px 0; padding:12px; text-align:left; font-size:12px; font-weight:normal;'
                + (o.gold ? ' background:linear-gradient(145deg,#3a2f18,#1c1608) !important; border-color:#5a4a2a !important; color:#d4af37 !important;' : '')
                + (o.red ? ' background:linear-gradient(145deg,#7f0000,#4a0000) !important; border-color:#b71c1c !important; color:#fff !important;' : '')
                + (o.dis ? ' opacity:0.4;' : '');
            return '<button class="game-btn" style="' + st + '" ' + (o.dis ? 'disabled' : 'onclick="finA(' + i + ')"') + '>'
                + label + (o.sub ? '<div class="fin-bsub">' + o.sub + '</div>' : '') + '</button>';
        }
    };
    return ui;
}
X.UI = UI;

function bar() {
    if (!F) return '';
    const g = F.gam || 0;
    const col = g >= 80 ? '#ff5252' : g >= 50 ? '#ffb74d' : '#d4af37';
    const sk = F.streak || 0;
    return '<div class="fin-bar">'
        + '<div class="fin-gam"><div class="t"><span>감화도</span><span style="color:' + col + '; font-weight:bold;">' + g + ' / 100</span></div>'
        + '<div class="g"><div style="width:' + g + '%; background:' + col + ';"></div></div></div>'
        + '<div style="text-align:right; line-height:1.5;">🎟 ' + (F.tix || 0) + '장'
        + (sk ? '<br><span style="color:' + (sk >= 2 ? '#ff6b6b' : '#888') + ';">연속 실패 ' + sk + '/3</span>' : '')
        + (Array.isArray(F.smash) && F.smash.length ? '<br><span style="color:#c9a8ff;">⛓ 파훼 ' + F.smash.length + '</span>' : '') + '</div>'
        + '<button class="fin-bag" onclick="finBag()">📦 소지품</button>'
        + '</div>';
}
X.bar = bar;

function body() { try { return darkBodyEl(); } catch (e) { return null; } }
function draw(ui, title, text, extra, o) {
    o = o || {};
    const b = body();
    if (!b || typeof darkRun === 'undefined' || !darkRun) return;
    R = ui ? ui.fns : [];
    const keepY = o.keep ? b.scrollTop : 0;
    if (ui && ui.seen) text = String(text || '') + '<br><br><span style="color:#f0c987;">' + ui.seen + '</span>';
    b.innerHTML = darkBox(title, fill(text, o.fill), (o.nobar ? '' : bar()) + (extra || '') + adds(o));
    b.scrollTop = keepY;
    try { mountDarkChat('normal'); } catch (e) { }
}
X.draw = draw;

// ==========================================
// 화면 — F.sc 하나로 다시 그린다
// ==========================================
const SC = X.SC = X.SC || {};
// 동료 변화로 다시 그려야 하는 화면 (대기 · 투표 · 함께 보는 결과)
const LIVE = X.LIVE = X.LIVE || {};
// 저절로 넘어가는 조건 (모두 준비됨 등) — tick 마다 본다
const AUTO = X.AUTO = X.AUTO || {};

function view(o) {
    if (!F || typeof darkRun === 'undefined' || !darkRun || darkRun.zone !== FIN) return;
    if (darkRun._dead || darkRun._settled) return;
    if (F.st === 'dead' || F.st === 'esc' && !(F.sc && F.sc.esc)) return;
    // 탈락이 정해졌으면 어디에 있었든 배드 엔딩으로
    if (F.st === 'out' && !(F.sc && F.sc.bad)) { F.sc = { id: 'bad', i: 0, bad: true }; save(); }
    const sc = F.sc || { id: 'op', n: 1 };
    const fn = SC[sc.id];
    if (!fn) { console.warn('[피날레] 모르는 화면', sc.id); return; }
    try { fn(sc, o || {}); } catch (e) { console.error('[피날레] 그리기 실패', sc.id, e); }
}
X.view = view;

// 다음 화면으로 — 탈락이 정해졌으면 배드 엔딩으로 돌린다
function go(sc) {
    if (!F) return;
    if (F.st === 'out' && !(sc && sc.bad)) sc = { id: 'bad', i: 0, bad: true };
    F.sc = sc;
    save();
    view();
    const b = body();
    if (b) b.scrollTop = 0;
}
X.go = go;

// 동료 변화 — 대기 화면만 다시 그린다 (읽는 중인 글은 건드리지 않는다)
let redrawT = null;
function redrawLive() {
    clearTimeout(redrawT);
    redrawT = setTimeout(function () {
        if (!F || !F.sc) return;
        if (LIVE[F.sc.id]) view({ keep: true });
    }, 120);
}

// ==========================================
// 준비 (모두가 눌러야 넘어가는 곳)
// ==========================================
function gatePress(name) { return pub('gate/' + name + '/' + ME, now()); }
function gateOf(name) { return (S.gate || {})[name] || {}; }
function gateDone(name, among) {
    among = among || actives();
    const g = gateOf(name);
    return among.length > 0 && among.every(function (c) { return !!g[c]; });
}
function gateCount(name, among) {
    among = among || actives();
    const g = gateOf(name);
    return among.filter(function (c) { return !!g[c]; }).length;
}
X.gatePress = gatePress; X.gateOf = gateOf; X.gateDone = gateDone; X.gateCount = gateCount;
function waitHtml(name, among, label) {
    among = among || actives();
    const g = gateOf(name);
    const done = among.filter(function (c) { return g[c]; });
    const left = among.filter(function (c) { return !g[c]; });
    return '<div class="fin-wait">' + (label || '모두 준비되기를 기다리는 중') + ' — <b style="color:#d4af37;">' + done.length + ' / ' + among.length + '</b>'
        + (left.length ? '<br><span style="font-size:10px;">기다리는 중: ' + left.map(nameOf).map(esc).join(', ') + '</span>' : '') + '</div>';
}
X.waitHtml = waitHtml;

// ==========================================
// 투표 — 동률이면 동률인 것 중 무작위 (씨앗 난수라 모두 같은 답)
// ==========================================
const VOTE_SEC = 60;
// 표는 사람마다 따로 적는다 (vote/{열쇠}/v/{사번}) — 한 덩어리를 통째로 다시 쓰면 동시에 낸 표가 지워진다.
// 결과는 vote/{열쇠}/r 에 한 번만 (트랜잭션 — 먼저 적은 것이 남는다).
function voteOf(key) {
    const raw = (S.vote || {})[key] || {};
    const r = raw.r || {};
    return { v: raw.v || {}, first: raw.first || null, res: r.res != null ? r.res : null, cnt: r.cnt, tie: r.tie, at: r.at };
}
function voteCast(key, optId) {
    const vo = voteOf(key);
    if (vo.res != null || vo.v[ME] != null) return Promise.resolve();
    if (!vo.first) tx('vote/' + key + '/first', function (cur) { if (cur) return; return now(); });
    return pub('vote/' + key + '/v/' + ME, optId);
}
function tally(key, voters, opts) {
    const v = voteOf(key).v || {};
    const cnt = {};
    opts.forEach(function (o) { cnt[o] = 0; });
    voters.forEach(function (c) { if (v[c] != null && cnt[v[c]] != null) cnt[v[c]]++; });
    let best = -1, top = [];
    opts.forEach(function (o) {
        if (cnt[o] > best) { best = cnt[o]; top = [o]; } else if (cnt[o] === best) top.push(o);
    });
    if (best <= 0) top = opts.slice();
    return { res: pick(top, srand(PID + '|' + key + '|tie')), cnt: cnt, tie: top.length > 1 };
}
// 다 모였거나 (첫 표 뒤 VOTE_SEC 초) 시간이 지났으면 결과를 적는다 — 결과(res)를 돌려준다
function voteResolve(key, voters, opts) {
    const vo = voteOf(key);
    if (vo.res != null) return vo.res;
    const v = vo.v || {};
    const all = voters.length > 0 && voters.every(function (c) { return v[c] != null; });
    const late = vo.first && now() - vo.first > VOTE_SEC * 1000;
    if (!all && !late) return null;
    const t = tally(key, voters, opts);
    tx('vote/' + key + '/r', function (cur) {
        if (cur && cur.res != null) return;
        return { res: t.res, cnt: t.cnt, tie: t.tie ? 1 : 0, at: now() };
    });
    return null;                      // 적힌 것이 돌아오면 그때 쓴다
}
function voteHtml(key, voters, opts, names) {
    const vo = voteOf(key), v = vo.v || {};
    const rows = opts.map(function (o) {
        const who = voters.filter(function (c) { return v[c] === o; }).map(nameOf);
        return '<div>' + esc(names[o] || o) + ' — <b style="color:#d4af37;">' + who.length + '</b>'
            + (who.length ? ' <span style="color:#777;">(' + who.map(esc).join(', ') + ')</span>' : '') + '</div>';
    }).join('');
    const left = voters.filter(function (c) { return v[c] == null; });
    let tl = '';
    if (vo.first && vo.res == null) {
        const s = Math.max(0, VOTE_SEC - Math.floor((now() - vo.first) / 1000));
        tl = '<div style="font-size:10px; color:#888; margin-top:4px;">남은 시간 ' + s + '초 · 안 고른 사람: ' + (left.length ? left.map(nameOf).map(esc).join(', ') : '없음') + '</div>';
    }
    return '<div class="fin-list">' + rows + tl + '</div>';
}
X.voteOf = voteOf; X.voteCast = voteCast; X.voteResolve = voteResolve; X.voteHtml = voteHtml; X.tally = tally;

// ==========================================
// 동행 NPC
// ==========================================
//   S.npc[key] = { enc:1, rec:1, dead:1 }   · 이름은 NPC_NAME
const NPC_NAME = X.NPC_NAME = X.NPC_NAME || {};
function comps(side) {
    const n = S.npc || {};
    return Object.keys(n).filter(function (k) {
        const r = n[k];
        if (!r || !r.rec || r.dead) return false;
        if (side && S.side && S.side[k] && S.side[k] !== side) return false;
        return true;
    });
}
X.comps = comps;

// ==========================================
// 사망 · 탈락
// ==========================================
//   die — 즉사. 즉사 막기(장비 · 흔적 · 도깨비 불 …)가 막으면 next 화면으로 이어 간다.
function die(html, next) {
    if (!F) return;
    F.sc = next || F.sc;
    F.streak = 0;
    save();
    try { darkDeath(html); } catch (e) { console.error('[피날레] darkDeath', e); }
    setTimeout(checkDead, 30);
}
X.die = die;

function checkDead() {
    if (!F || F.st !== 'in') return;
    if (typeof darkRun === 'undefined' || !darkRun) { markGone('dead'); return; }
    if (darkRun.zone === FIN && darkRun._dead) markGone('dead');
}
function markGone(st) {
    if (!F) return;
    if (F.st === 'in') F.st = st;
    pub('pl/' + ME + '/st', F.st);
    save();
}

// ==========================================
// 탈락 — 즉사 막기를 거치지 않는다 (감화도 100 · 명찰 대리 참석자 · 탈출 실패)
// ==========================================
//   잃는 것은 사망과 같다 (S 등급: 보유 포인트 · 반입품 — 행운이 일부 지킨다 · 상담실 이송).
function eliminate(reasonHtml) {
    if (typeof darkRun === 'undefined' || !darkRun || darkRun._dead) return;
    darkRun._dead = true;
    F.st = (F.st === 'in') ? 'out' : F.st;
    pub('pl/' + ME + '/st', F.st === 'in' ? 'out' : F.st);
    save();

    const z = DARK_ZONES[FIN];
    let lostPoints = 0;
    const lostItems = [];
    const luckRate = (typeof gearValue === 'function') ? gearValue(currentUser, 'luck') : 0;
    const saved = luckRate > 0 && Math.random() < luckRate;
    const carried = [].concat(darkRun.carryEquips || [], darkRun.carryItems || []);
    if (saved) {
        const kept = Math.floor(currentUser.points * (0.30 + Math.random() * 0.15));
        lostPoints = currentUser.points - kept;
        currentUser.points = kept;
        carried.slice(0, Math.ceil(carried.length / 2)).forEach(function (it) { removeItemFromInventory(currentUser, it, 1); lostItems.push(it); });
    } else {
        lostPoints = currentUser.points;
        currentUser.points = 0;
        carried.forEach(function (it) { removeItemFromInventory(currentUser, it, 1); lostItems.push(it); });
    }
    addHistoryLog(currentUser, '[어둠 탈락] ' + z.code + ' — 자발적 피날레. 포인트 ' + lostPoints + ' P' + (lostItems.length ? '와 반입품' : '') + ' 소실.');

    currentUser.pollution = 100;
    currentUser.quarantineUntil = Date.now() + 4 * 60 * 60 * 1000;
    currentUser.quarantineExitPollution = 40;
    currentUser.foxRoomAnswered = true;
    currentUser.quarantineHospital = true;
    try { currentUser.quarantineDest = isDisasterAgent(currentUser) ? 'bath' : 'fox'; } catch (e) { currentUser.quarantineDest = 'fox'; }

    const d = db_();
    if (d && darkRun.isParty) {
        try {
            const p = darkParties[PID];
            if (p && p.leader === ME) {
                const next = actives().filter(function (c) { return c !== ME; })[0];
                if (next) d.ref('darkParties/' + PID).update({ leader: next, leaderName: nameOf(next) });
            }
        } catch (e) { }
        d.ref('darkParties/' + PID + '/alive/' + ME).remove();
    }

    if (!currentUser.darkLogs) currentUser.darkLogs = [];
    currentUser.darkLogs.unshift({
        date: new Date().toLocaleString(), zone: z.code, zoneName: z.name,
        reward: 0, success: F.succ || 0, fail: F.fail || 0, loot: [], lost: lostItems,
        detail: darkRun.log || [], died: true, party: true,
        chat: (typeof partyChatLog !== 'undefined' && partyChatLog.length) ? partyChatLog.slice(-80).map(function (m) {
            return { n: m.code === 'SYSTEM' ? '' : m.name, t: m.text, s: m.code === 'SYSTEM' };
        }) : null
    });
    if (currentUser.darkLogs.length > 15) currentUser.darkLogs.pop();

    const b = body();
    if (b) {
        R = [];
        b.innerHTML = darkBox('종료', reasonHtml || '막이 내려옵니다.',
            '<div style="background:rgba(127,0,0,0.15); border:1px solid #7f0000; border-radius:6px; padding:14px; font-size:12px; line-height:1.9; margin-bottom:14px;">'
            + '<div style="font-weight:bold; color:#ff6b6b; margin-bottom:8px; border-bottom:1px dashed #7f0000; padding-bottom:6px;">[탈락 보고서]</div>'
            + 'BAD ENDING — 「자발적 피날레」<br>'
            + '보유 포인트 <b style="color:#f44336;">-' + lostPoints + ' P</b>' + (saved ? '' : ' (전액 소실)') + '<br>'
            + (lostItems.length ? '반입품 <b style="color:#f44336;">' + lostItems.join(', ') + '</b> 소실<br>' : '<span style="color:#aaa;">반입한 물품이 없어 소실 없음</span><br>')
            + (saved ? '<div style="color:#4CAF50;">✺ 행운 — 일부를 지켜냈습니다.</div>' : '')
            + '오염도 <b style="color:#ff9800;">100%</b>'
            + '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed #7f0000; color:#d4af37;">🦊 여우 상담실로 긴급 이송됩니다.<br><span style="font-size:10px; color:#aaa;">회복 예상 시간: 2시간 (퇴원 시 오염도 40%)</span></div>'
            + '</div>' + darkChoiceBtn('막이 내린다.', 'finishDarkDeath()'));
    }
    try { darkAmbienceStop(); } catch (e) { }
    try { saveDB(); } catch (e) { }
}
X.eliminate = eliminate;

// ==========================================
// 정산 — 살아서 나간 사람 (굿 · 히든 · 이기적인 엔딩)
// ==========================================
const OUTRO = {
    good: '공연은 계속됩니다.<br><br>다만 이번에는, 당신이 그 자리에 없을 뿐입니다.',
    hidden: '막이 내렸다면, 다시 올리면 됩니다.<br>마지막 장면이 마음에 들지 않았다면, 새로운 장면을 쓰면 됩니다.<br><br>그러니 이것은 피날레가 아닙니다.',
    selfish: '누군가 당신의 자리에 앉아 있다는 사실만 빼면, 아무것도 달라지지 않았습니다.'
};
const END_NAME = { good: 'GOOD ENDING — 「객석을 떠난 사람들」', hidden: 'HIDDEN ENDING — 「앙코르!」', selfish: 'SELFISH ENDING — 「당신을 대신하여」' };
X.END_NAME = END_NAME;
function settle(kind) {
    if (!F || typeof darkRun === 'undefined' || !darkRun || darkRun._settled || darkRun._dead) return;
    F.endKind = kind;
    if (F.st === 'in' || F.st === 'esc') F.st = 'esc';
    pub('pl/' + ME + '/st', 'esc');
    pub('pl/' + ME + '/end', kind);
    // 방장이면 남은 사람에게 넘긴다 (일찍 나가는 이기적인 엔딩)
    try {
        const p = darkParties[PID];
        const d = db_();
        if (d && p && p.leader === ME) {
            const next = actives().filter(function (c) { return c !== ME; })[0];
            if (next) d.ref('darkParties/' + PID).update({ leader: next, leaderName: nameOf(next) });
        }
    } catch (e) { }
    darkRun.success = F.succ || 0;
    darkRun.fail = F.fail || 0;
    darkRun.log.push('[엔딩] ' + END_NAME[kind]);
    save();
    const z = DARK_ZONES[FIN];
    const keep = z.outro;
    z.outro = '<div class="fin-sys">' + END_NAME[kind] + '</div>' + (OUTRO[kind] || '');
    try { renderDarkResult(); } catch (e) { console.error('[피날레] 정산', e); }
    finally { z.outro = keep; }
}
X.settle = settle;

// 정산서에 얹는 몫 (index.html renderDarkResult 가 부른다)
window.finaleBonus = function () {
    if (!F) return 0;
    let b = 0;
    if (F.endKind === 'hidden') b += 20000;
    else if (F.endKind === 'good') b += 6000;
    const g = F.gam || 0;
    if (g < 20) b += 3000;
    else if (g < 40) b += 1500;
    else if (g >= 80) b -= 2000;
    if (F.endKind !== 'selfish') b += comps().length * 800;
    return b;
};

// ==========================================
// 소지품 창 (📦) — 언제든
// ==========================================
function ovOpen(html) {
    ovClose();
    const ov = document.createElement('div');
    ov.id = 'fin-ov';
    ov.innerHTML = '<div class="box">' + html + '</div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) ovClose(); });
    document.body.appendChild(ov);
}
function ovClose() { const o = document.getElementById('fin-ov'); if (o) o.remove(); }
window.finOvClose = ovClose;
X.ovOpen = ovOpen; X.ovClose = ovClose;

let OVF = [];
window.finO = function (i) { const f = OVF[i]; if (typeof f === 'function') { try { f(); } catch (e) { console.error(e); } } };
function ob(label, fn, dis) {
    const i = OVF.push(fn) - 1;
    return '<button class="game-btn" ' + (dis ? 'disabled style="opacity:0.4;"' : 'onclick="finO(' + i + ')"') + '>' + label + '</button>';
}
X.ob = ob;

window.finBag = function () {
    if (!F) return;
    OVF = [];
    const cnt = {};
    (F.inv || []).forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; });
    const keys = Object.keys(cnt);
    const others = actives().filter(function (c) { return c !== ME; });
    const canTag = F.st === 'in' && others.length > 0 && !(S.pl && S.pl._lock);
    let h = '<div style="font-weight:bold; color:#d4af37; margin-bottom:6px;">📦 개인 소지품</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:10px;">다른 교우는 볼 수 없습니다. 전투나 위기에서 잃을 수 있습니다.</div>'
        + '<div class="fin-list">감화도 <b>' + (F.gam || 0) + ' / 100</b> · 상품권 <b>' + (F.tix || 0) + '장</b>'
        + (F.body ? ' · 판정 보정 <b>' + bodyMod() + '</b> <span style="color:#777;">(' + ({ nail: '손톱', ear: '왼쪽 귀', eye: '왼쪽 눈' })[F.body] + ')</span>' : '')
        + '<br>연속 실패 <b>' + (F.streak || 0) + ' / 3</b>'
        + (F.deal && F.deal.want && F.deal.st !== 'done' ? '<br>명찰 상인 요구 물품 <b style="color:#d4af37;">' + esc(F.deal.want) + '</b>' : '') + '</div>';
    if (!keys.length) h += '<div style="color:#777; text-align:center; padding:14px;">가진 것이 없습니다.</div>';
    keys.forEach(function (k) {
        const it = IT[k] || { d: '' };
        let act = '';
        if (it.read) act += ob('열람한다', function () { readItem(k); });
        if (it.tag) act += ob('사용한다', function () { ovClose(); if (X.tagStart) X.tagStart(); }, !canTag);
        h += '<div class="it"><div class="n">' + esc(k) + (cnt[k] > 1 ? ' ×' + cnt[k] : '') + (it.kept ? ' <span style="font-size:9px; color:#81c784;">(잃지 않음)</span>' : '') + '</div>'
            + '<div class="d">' + it.d + '</div>' + (act ? '<div class="row">' + act + '</div>' : '') + '</div>';
    });
    h += '<div class="row" style="margin-top:10px;">' + ob('닫는다', ovClose) + '</div>';
    ovOpen(h);
};

function readItem(k) {
    OVF = [];
    const it = IT[k];
    let t = '';
    if (it.read === 'book') t = x(opt(sec('op', '장면 06'), '행사 안내 책자를 확인한다'));
    else if (it.read === 'm1') t = x(opt(sec('items', '아름다움과 추악함'), '「꺼지지 않는 향초 사용 설명서」'));
    else if (it.read === 'm2') t = x(opt(sec('items', '아름다움과 추악함'), '「식탁보 사용 설명서」'));
    ovOpen('<div style="font-weight:bold; color:#d4af37; margin-bottom:8px;">' + esc(k) + '</div><div style="line-height:1.9;">' + t + '</div>'
        + '<div class="row" style="margin-top:10px;">' + ob(it.read === 'book' ? '책자를 덮는다' : '설명서를 덮는다', function () { window.finBag(); }) + '</div>');
}

// 동행 NPC 목록 창
window.finComps = function () {
    OVF = [];
    const n = S.npc || {};
    const keys = Object.keys(n);
    let h = '<div style="font-weight:bold; color:#d4af37; margin-bottom:8px;">동행 NPC</div>';
    if (!keys.length) h += '<div style="color:#777; text-align:center; padding:12px;">아직 만난 사람이 없습니다.</div>';
    keys.forEach(function (k) {
        const r = n[k];
        const st = r.dead ? '<span style="color:#f44336;">사망</span>' : r.rec ? '<span style="color:#4CAF50;">동행 중</span>' : '<span style="color:#888;">영입하지 못함</span>';
        h += '<div class="it"><div class="n">' + esc(NPC_NAME[k] || k) + '</div><div class="d">' + st
            + (r.rec && !r.dead && S.side && S.side[k] ? ' · ' + (S.side[k] === 'be' ? '아름다움과 추악함' : '달콤한 밤, 영원한 꿈') + ' 쪽을 따라감' : '') + '</div></div>';
    });
    h += '<div class="row" style="margin-top:10px;">' + ob('닫는다', ovClose) + '</div>';
    ovOpen(h);
};

// ==========================================
// 시작 · 복귀
// ==========================================
function fresh() {
    return {
        v: 1, pid: PID, code: ME, name: currentUser.name || ME,
        st: 'in', ph: 'op', sc: { id: 'op', n: 1 },
        gam: 0, tix: 0, body: null, streak: 0, inv: [],
        deal: null, visited: [], sw: null, be: null, bqa: {},
        npcPlus: 0, calmUsed: 0, succ: 0, fail: 0, at: now()
    };
}

function attach() {
    const d = db_();
    if (!d || !PID) return;
    if (sharedRef) { try { sharedRef.off(); } catch (e) { } }
    sharedRef = d.ref('finale/' + PID);
    sharedRef.on('value', function (s) {
        S = s.val() || {};
        onShared();
    });
}

function begin(isResume) {
    PID = darkRun.partyId;
    ME = currentUser.code;
    const d = db_();
    if (!d || !PID) {
        draw(null, '—', '이 구역은 일행과 함께 들어가야 합니다.', darkChoiceBtn('단말로 복귀한다.', 'finishDarkRun()'), { nobar: true });
        return;
    }
    S = {};
    attach();
    d.ref('finaleMe/' + PID + '/' + ME).once('value').then(function (s) {
        const v = s.val();
        if (v && v.v && v.pid === PID) {
            F = v;
            if (!F.inv) F.inv = [];
            if (!F.visited) F.visited = [];
            if (!F.bqa) F.bqa = {};
            if (F.st === 'in') pub('pl/' + ME + '/gone', null);
            try { sendPartyChat(F.name + ' 사원이 자리로 돌아왔습니다.', true); } catch (e) { }
            view();
            return;
        }
        if (isResume) {
            F = null;
            draw(null, '—', '눈을 떴을 때, 객석이었습니다.<br><br>무대 위에서는 아직 공연이 이어지고 있습니다. 당신이 어디까지 갔었는지는 기억나지 않습니다.<br><span style="font-size:11px; color:#888;">(연결이 끊겨 탐사에서 밀려났습니다. 이번 탐사는 보상 없이 끝납니다.)</span>',
                darkChoiceBtn('단말로 복귀한다.', 'finishDarkRun()'), { nobar: true });
            return;
        }
        F = fresh();
        let party = null;
        try { party = darkParties[PID]; } catch (e) { }
        const names = {};
        if (party && party.members) Object.keys(party.members).forEach(function (c) { names[c] = party.members[c].name || c; });
        names[ME] = F.name;
        const cnt = Math.max(1, (party && party.members) ? Object.keys(party.members).length : (darkRun.memberCount || 1));
        tx('meta', function (cur) { if (cur && cur.n0) return; return { n0: cnt, at: now(), names: names }; });
        pub('pl/' + ME, { name: F.name, st: 'in', ph: 'op', at: now() });
        darkRun.log.push('[피날레] 입장 (' + cnt + '인)');
        save();
        view();
    });
}

function cleanup() {
    if (sharedRef) { try { sharedRef.off(); } catch (e) { } }
    sharedRef = null;
    F = null; S = {}; PID = null;
    ovClose();
}
X.cleanup = cleanup;

// ==========================================
// 동료 변화
// ==========================================
function onShared() {
    if (!F) return;
    if (typeof darkRun === 'undefined' || !darkRun || darkRun.zone !== FIN) return;
    // 누가 내 이름을 명찰에 적었다
    const mine = pl()[ME];
    if (mine && mine.st === 'tag' && F.st === 'in' && X.onTagged) { X.onTagged(mine); return; }
    try { Object.keys(AUTO).forEach(function (k) { if (F && F.sc && F.sc.id === k) AUTO[k](F.sc); }); } catch (e) { console.error('[피날레] auto', e); }
    redrawLive();
}

let tickN = 0;
setInterval(function () {
    if (!F) return;
    if (typeof darkRun === 'undefined' || !darkRun) { cleanup(); return; }
    if (darkRun.zone !== FIN) return;
    tickN++;
    if (F.st === 'in' && darkRun._dead) markGone('dead');
    // 방에서 빠진 사람(오래 응답이 없어 명단에서 지워진 사람) — 파티장이 「떠남」으로 적는다
    if (leader() === ME) {
        try {
            const p = darkParties[PID];
            if (p && p.members) {
                Object.keys(pl()).forEach(function (c) {
                    if (c.charAt(0) === '_') return;
                    const r = pl()[c];
                    if (r && r.st === 'in' && !r.gone && !p.members[c]) pub('pl/' + c + '/gone', true);
                });
            }
        } catch (e) { }
    }
    try { Object.keys(AUTO).forEach(function (k) { if (F && F.sc && F.sc.id === k) AUTO[k](F.sc); }); } catch (e) { }
    if (F && F.sc && LIVE[F.sc.id] && tickN % 2 === 0) view({ keep: true });
}, 1500);

// ==========================================
// 이어 붙이기
// ==========================================
(function hooks() {
    // 진행 — 이 구역이면 여기서 그린다
    const iv = setInterval(function () {
        if (typeof renderDarkStep !== 'function') return;
        clearInterval(iv);
        const _r = renderDarkStep;
        renderDarkStep = function () {
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === FIN) {
                if (darkRun._dead || darkRun._settled) return;
                if (!F || F.pid !== darkRun.partyId) { begin(!!darkRun.rejoined); return; }
                // 즉사를 막아 다시 일어났다 (막기 단추가 renderDarkStep 을 부른다) — 「죽음」 표를 거둔다
                if (F.st === 'dead') {
                    F.st = 'in';
                    pub('pl/' + ME + '/st', 'in');
                    save();
                    try { sendPartyChat(F.name + ' 사원이 다시 일어났습니다.', true); } catch (e) { }
                }
                view();
                return;
            }
            return _r.apply(this, arguments);
        };
        try { window.renderDarkStep = renderDarkStep; } catch (e) { }
    }, 50);

    // 복귀 장면 — 거울 합류 대신 제자리로
    const iv2 = setInterval(function () {
        if (typeof renderRejoinScene !== 'function') return;
        clearInterval(iv2);
        const _j = renderRejoinScene;
        renderRejoinScene = function () {
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.zone === FIN) {
                darkRun.rejoined = false;
                F = null;
                begin(true);
                return;
            }
            return _j.apply(this, arguments);
        };
    }, 50);

    // 끝내기 — 듣던 것을 걷는다
    ['finishDarkRun', 'finishDarkDeath'].forEach(function (nm) {
        const iv3 = setInterval(function () {
            if (typeof window[nm] !== 'function') return;
            clearInterval(iv3);
            const _f = window[nm];
            const w = function () {
                const wasMine = typeof darkRun !== 'undefined' && darkRun && darkRun.zone === FIN;
                if (wasMine && F && F.st === 'in') markGone('dead');
                const pid = wasMine ? darkRun.partyId : null;
                const r = _f.apply(this, arguments);
                if (wasMine || F) cleanup();
                // 마지막 사람이 나가면 함께 쓰던 자리도 걷는다
                if (pid) {
                    const d = db_();
                    if (d) setTimeout(function () {
                        try {
                            d.ref('darkParties/' + pid + '/alive').once('value').then(function (sn) {
                                const left = sn.val();
                                if (left && Object.keys(left).length) return;
                                d.ref('finale/' + pid).remove();
                                d.ref('finaleMe/' + pid).remove();
                            });
                        } catch (e) { }
                    }, 1500);
                }
                return r;
            };
            window[nm] = w;
            try { if (nm === 'finishDarkRun') finishDarkRun = w; else finishDarkDeath = w; } catch (e) { }
        }, 60);
    });
})();

// ==========================================
// 콘솔
// ==========================================
window.finState = function () {
    if (!F) { console.log('피날레 탐사 중이 아닙니다.'); return; }
    console.log('%c===== 피날레 =====', 'color:#d4af37');
    console.log('나', { st: F.st, ph: F.ph, sc: F.sc, gam: F.gam, tix: F.tix, streak: F.streak, inv: F.inv, deal: F.deal });
    console.log('함께', JSON.parse(JSON.stringify(S)));
};

console.log('[피날레] 뼈대 연결 — ' + FIN);
})();
