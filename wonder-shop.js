// ==========================================
// ★ 「이상한 나라의 ■■■」 이벤트 샵 — 챕터마다 5종, 30종
// bundles.json 마지막 묶음 — wonder-core.js 다음
// ==========================================
//
//   이벤트 기간에는 상점의 「???」 샵 자리를 이 샵이 대신한다 (설계표 「이벤트 샵 — 챕터마다 5종」).
//   · 켜고 끄기: Firebase wonderEvent/shop (관리자 콘솔 wonderEvent(true|false)).
//     2026-10-31 사용자 「이벤트 샵 바로 넣어 줘」 — 값이 없으면 **열려 있다** (false 로 적어야 닫힌다).
//     (예전 열쇠 wonderEvent/on 은 시험하며 false 가 남았을 수 있어 쓰지 않는다)
//     꺼져 있어도 관리자에게는 ??? 샵 위에 미리보기로 보인다.
//   · 진열당 항목마다 5개까지 (??? 샵과 같은 진열 시간표).
//   · 값은 전부 100 ~ 200 P (2026-10-31 사용자 — 예전 900 ~ 2,200 P 를 같은 차례로 줄였다).
//   · 물건은 적힌 챕터와 그 챕터의 연계판 안에서만 쓴다. 들어갈 때 반입해서 🎒 로 쓰거나,
//     쓸 자리에서 뜨는 단추로 쓴다 — 어느 쪽이든 WONDER.has / WONDER.spend 로 센다.

(function wonderShop() {
'use strict';
if (typeof ITEM_CATALOG === 'undefined') return;
const X = window.WONDER = window.WONDER || {};
const ADMIN = 'kario0987';
const CAP = 5;

const LIST = {
    angel: [
        ['변호인의 깃펜', 120, '심문 판정 한 번에 +5.', '깃촉이 닳아 있다. 누군가를 여러 번 변호한 펜이다.'],
        ['방청석 과자', 170, '실패한 심문 하나를 다시 굴린다. (한 번)', '방청석에서 돌던 과자 봉지. 한 입 먹으면 할 말이 다시 떠오른다.'],
        ['구름 방석', 100, '연계판에서 기믹 실패 한 번의 시간 손실을 없앤다.', '푹신하다. 넘어져도 아프지 않을 만큼.'],
        ['증인 명찰', 140, '연계판의 지목 · 대답 전에 흔적을 하나 더 읽는다.', '이름 칸이 비어 있는 명찰. 달고 있으면 사람들이 무언가를 말해 준다.'],
        ['휴정 종', 150, '연계판 제한 시간 +2분. (한 번)', '흔들면 모두가 잠깐 손을 멈춘다.']
    ],
    siren: [
        ['티타임 각설탕', 180, '진주 도둑 퍼즐의 오답 한 번을 없던 일로 한다. (즉사 대신)', '찻잔에 떨어뜨리면 방금 한 말이 녹아 사라진다.'],
        ['진주 단추', 130, '인어 하나의 증언이 참인지 거짓인지 알려 준다.', '거짓말 앞에서는 흐려지는 단추.'],
        ['바닷물 사탕', 150, '연계판에서 인간성 +15.', '짠맛 끝에 아주 조금 단맛이 남는다.'],
        ['조개 거울', 120, '자기 확인 질문 하나를 반드시 맞힌다.', '들여다보면 어제의 얼굴이 보인다.'],
        ['소라 귀마개', 140, '노래로 깎이는 인간성 한 번을 막는다.', '귀에 대면 파도 소리만 들린다.']
    ],
    vampire: [
        ['장미 반창고', 170, '피를 바치는 의식 판정에 +5.', '붙이면 상처가 장미꽃처럼 보인다.'],
        ['백지 투표용지', 150, '희생 투표에서 나에게 온 표 하나를 무효로 한다.', '아무것도 적지 않은 표도 표다.'],
        ['은 티스푼', 150, '연계판에서 감화도 −10.', '저으면 찻잔 속 소용돌이가 반대로 돈다.'],
        ['집사의 심부름표', 120, '연계판 NPC 영입 판정 한 번에 +3.', '「손님을 모셔 오세요.」 집사의 글씨다.'],
        ['붉은 손수건', 200, '주사위 3회 연속 실패 횟수를 한 번 0으로 되돌린다.', '눈을 가렸다 떼면 처음부터인 것 같은 기분이 든다.']
    ],
    succubus: [
        ['빌린 가면', 150, '춤 · 만찬 · 거울 판정 중 하나에 +5.', '누구의 얼굴인지는 묻지 않기로 한다.'],
        ['무도회 구두끈', 130, '「끝나지 않는 춤」 실패 한 번을 없던 일로 한다.', '단단히 묶으면 발이 멈추는 법을 기억한다.'],
        ['장미 꽃잎 차', 110, '연계판에서 정신력을 크게 되찾는다.', '향이 먼저 마음을 데운다.'],
        ['꿈결 사탕', 120, '연계판에서 장미 꿈결을 더 받는다.', '혀끝에서 녹는 동안 꿈이 조금 길어진다.'],
        ['거울 닦개', 180, '「사랑받는다는 것」 배드엔딩을 한 번 막는다.', '닦으면 거울 속 얼굴이 내 얼굴로 돌아온다.']
    ],
    jiangshi: [
        ['작은 방울', 170, '숨바꼭질 발각 한 번을 없던 일로 한다.', '술래보다 먼저 울려 술래의 귀를 돌린다.'],
        ['홍등 성냥', 120, '숨기 전에 술래가 오는 은신처 하나를 미리 본다.', '불을 붙이면 그림자가 갈 길을 먼저 간다.'],
        ['종이 부적 한 장', 150, '연계판에서 감염 판정 한 번을 막는다.', '붓글씨가 아직 마르지 않았다.'],
        ['연꽃 소독수', 140, '연계판에서 감염도 −20.', '연꽃 향이 나는 맑은 물.'],
        ['대나무 피리', 120, '연계판 방어전 한 라운드를 판정 없이 버틴다.', '불면 모두가 잠깐 놀이를 멈춘다.']
    ],
    wolf: [
        ['자장가 악보', 150, '마지막 음절이 언제 올지 한 번 미리 보인다.', '마지막 줄에만 동그라미가 쳐져 있다.'],
        ['수면 모자 실밥', 180, '발각 횟수를 하나 되돌린다.', '늑대인간의 수면 모자에서 풀린 실 한 가닥.'],
        ['책갈피', 120, '연계판에서 찢어진 장 찾기 한 번이 반드시 성공한다.', '끼워 둔 자리를 잊지 않는다.'],
        ['요정 가루', 140, '연계판에서 배역 금기를 한 번 어겨도 없던 일이 된다.', '뿌리면 방금 일을 요정들이 못 본 척한다.'],
        ['양털 베개', 150, '연계판에서 끌려감 판정에 +5.', '붙잡고 있으면 아무 데도 끌려가지 않을 것 같다.']
    ]
};
const ORDER = ['angel', 'siren', 'vampire', 'succubus', 'jiangshi', 'wolf'];
const CH_NAME = { angel: '천사와 악마 · 빛을 찾아서', siren: '세이렌 · 물고기가 인간이 되었다', vampire: '뱀파이어 · 제■■■회 완벽한 피날레', succubus: '서큐버스 · K의 방', jiangshi: '강시 · 검역 실패', wolf: '늑대인간 · 동화의 뒷면' };
const OF = {};       // 물건 → 챕터

ORDER.forEach(function (ch) {
    LIST[ch].forEach(function (r) {
        OF[r[0]] = ch;
        ITEM_CATALOG[r[0]] = {
            price: r[1], usable: true, targetable: false, effect: 'wonder_item', qShop: false, wonder: ch,
            desc: '[이상한 나라] ' + r[3] + ' ' + r[2] + ' 「이상한 나라의 ■■■」 ' + CH_NAME[ch].split(' · ')[0] + ' 챕터와 그 연계판 안에서만 쓸 수 있다.'
        };
    });
});
X.SHOP = LIST; X.ITEM_CH = OF;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function isAdmin() { const u = me(); return !!(u && u.code === ADMIN); }
function alertMsg(m) { try { showCustomAlert(m); } catch (e) { console.log(m); } }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

// ==========================================
// 켜짐
// ==========================================
let ON = true;
X.shopOn = function () { return ON; };
(function listen() {
    const iv = setInterval(function () {
        const d = db_();
        if (!d) return;
        clearInterval(iv);
        try {
            d.ref('wonderEvent/shop').on('value', function (s) {
                const was = ON;
                ON = s.val() !== false;
                if (was !== ON) repaint();
            });
        } catch (e) { }
    }, 300);
})();
window.wonderEvent = function (v) {
    if (!isAdmin()) { console.log('관리자만'); return; }
    const d = db_();
    if (d) d.ref('wonderEvent/shop').set(!!v);
    console.log('이벤트 샵 ' + (v ? '열림' : '닫힘'));
};

// ==========================================
// 진열
// ==========================================
function slot() {
    try { if (typeof qshopSlotKey === 'function') return qshopSlotKey(); } catch (e) { }
    const n = new Date();
    return n.toISOString().slice(0, 10) + '-s' + Math.floor(n.getHours() / 4);
}
function recOf() {
    const u = me();
    if (!u.wonderShop) u.wonderShop = {};
    const k = slot();
    if (!u.wonderShop[k]) {
        // 지난 진열 기록은 버린다
        Object.keys(u.wonderShop).forEach(function (o) { if (o !== k) delete u.wonderShop[o]; });
        u.wonderShop[k] = {};
    }
    return u.wonderShop[k];
}
function shopHtml(preview) {
    const rec = recOf();
    const adm = isAdmin();
    const n = new Date();
    const nx = new Date(n); nx.setHours((Math.floor(n.getHours() / 4) + 1) * 4, 0, 0, 0);
    const left = Math.max(0, Math.floor((nx - n) / 60000));
    return '<div style="text-align:center; font-size:13px; color:#d4af37; letter-spacing:2px; padding:14px 0 6px 0;">🍬 Eat me.</div>'
        + '<div style="text-align:center; font-size:10px; color:#888; padding-bottom:12px; border-bottom:1px dashed #3a3220; margin-bottom:12px; line-height:1.7;">'
        + '「이상한 나라의 ■■■」 이벤트 샵' + (preview ? ' <span style="color:#a87;">(관리자 미리보기 — 아직 닫혀 있음)</span>' : '') + '<br>'
        + '이 어둠에서는 어떤 장비도 통하지 않습니다. 물건은 적힌 챕터와 그 연계판 안에서만 쓸 수 있습니다.<br>'
        + '진열은 ' + Math.floor(left / 60) + '시간 ' + (left % 60) + '분 뒤에 바뀝니다. · 항목당 ' + CAP + '개 한정</div>'
        + ORDER.map(function (ch) {
            return '<div style="font-size:11px; color:#e8d9a8; font-weight:bold; margin:14px 0 6px 2px;">' + esc(CH_NAME[ch]) + '</div>'
                + LIST[ch].map(function (r) {
                    const name = r[0], price = r[1];
                    const bought = rec[name] || 0;
                    const lf = adm ? 99 : Math.max(0, CAP - bought);
                    const sold = lf === 0;
                    return '<div class="shop-item ' + (sold ? 'sold-out' : '') + '" style="border-color:#3a3220;">'
                        + '<div style="flex:1; min-width:0;"><span style="font-weight:bold; font-size:12px;">' + esc(name) + '</span>'
                        + '<span style="font-size:10px; color:#666; margin-left:5px;">' + (lf === 99 ? '' : '(' + lf + '/' + CAP + ')') + '</span><br>'
                        + '<span style="font-size:10px; color:#999; line-height:1.5;">' + esc(r[2]) + '</span></div>'
                        + '<button ' + (sold ? 'disabled' : '') + ' onclick="buyWonderItem(\'' + esc(name) + '\')" style="flex-shrink:0;">' + (sold ? '품절' : price.toLocaleString() + ' P') + '</button></div>';
                }).join('');
        }).join('');
}
window.buyWonderItem = function (name) {
    const u = me();
    const ch = OF[name];
    if (!u || !ch) return;
    if (!ON && !isAdmin()) { alertMsg('지금은 열려 있지 않습니다.'); return; }
    try { if (typeof buyGuard === 'function' && !buyGuard()) return; } catch (e) { }
    const it = ITEM_CATALOG[name];
    const rec = recOf();
    const bought = rec[name] || 0;
    if (!isAdmin() && bought >= CAP) { alertMsg('이 진열에서는 더 가져갈 수 없습니다.'); return; }
    if ((Number(u.points) || 0) < it.price) { try { showLuxuryAlert(); } catch (e) { alertMsg('포인트가 부족합니다.'); } return; }
    u.points -= it.price;
    rec[name] = bought + 1;
    if (!u.inventory) u.inventory = [];
    u.inventory.push(name);
    try { addHistoryLog(u, '[이상한 나라 구매] ' + name + ' (-' + it.price + ' P)'); } catch (e) { }
    try { saveSelfFull(); } catch (e) { }
    try { updateUI(); } catch (e) { }
    try { renderQShop(); } catch (e) { }
};

// 켜고 끌 때는 바로 다시 그린다 — 다른 파일의 「바뀐 게 없으면 안 그림」을 건너뛰려고 안쪽 함수를 직접 부른다
let inner = null;
function repaint() {
    const box = document.getElementById('qshop-body');
    if (!box || !me()) return;
    try {
        if (ON) box.innerHTML = shopHtml(false);
        else if (inner) inner();
        else if (typeof renderQShop === 'function') renderQShop();
    } catch (e) { }
}
(function hookShop() {
    const iv = setInterval(function () {
        if (typeof window.renderQShop !== 'function') return;
        clearInterval(iv);
        const _r = window.renderQShop;
        const w = function () {
            const box = document.getElementById('qshop-body');
            if (box && me() && ON) { box.innerHTML = shopHtml(false); return; }
            const out = _r.apply(this, arguments);
            if (box && me() && isAdmin()) {
                try { box.insertAdjacentHTML('afterbegin', '<div style="border:1px dashed #5a4a2a; border-radius:6px; padding:0 8px 10px 8px; margin-bottom:16px;">' + shopHtml(true) + '</div>'); } catch (e) { }
            }
            return out;
        };
        w._wonder = true;
        window.renderQShop = w;
        inner = function () { return w(); };
    }, 200);
})();

// ==========================================
// 쓰기 — 🎒 에서 쓰면 「꺼내 둔다」. 쓸 자리에서 WONDER.has / spend 로 센다.
// ==========================================
function F_() { try { return X.F && X.F(); } catch (e) { return null; } }
X.has = function (name) {
    const F = F_();
    if (!F) return false;
    if ((F.arm || {})[name] > 0) return true;
    return !!(typeof darkRun !== 'undefined' && darkRun && (darkRun.carryItems || []).indexOf(name) >= 0);
};
X.spend = function (name) {
    const F = F_();
    if (!F) return false;
    if ((F.arm || {})[name] > 0) { F.arm[name]--; X.save && X.save(); return true; }
    if (!(typeof darkRun !== 'undefined' && darkRun && (darkRun.carryItems || []).indexOf(name) >= 0)) return false;
    try { removeItemFromInventory(currentUser, name, 1); } catch (e) { }
    const i = darkRun.carryItems.indexOf(name);
    if (i >= 0) darkRun.carryItems.splice(i, 1);
    try { darkRun.log.push('[이상한 나라 물건] ' + name); } catch (e) { }
    try { addHistoryLog(currentUser, '[이상한 나라 사용] ' + name); } catch (e) { }
    try { saveSelfFull(); } catch (e) { }
    X.save && X.save();
    return true;
};

(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        clearInterval(iv);
        const _use = useInventoryItem;
        const w = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || cat.effect !== 'wonder_item') return _use.apply(this, arguments);
            const ch = OF[itemName];
            const F = F_();
            const inside = !!(X.inW && X.inW() && F && F.st === 'in');
            if (!inside || F.ch !== ch) {
                alertMsg('「이상한 나라의 ■■■」 ' + CH_NAME[ch].split(' · ')[0] + ' 챕터와 그 연계판 안에서만 쓸 수 있습니다.');
                return;
            }
            if (!((currentUser.inventory || []).indexOf(itemName) >= 0)) return;
            removeItemFromInventory(currentUser, itemName, 1);
            try { const i = (darkRun.carryItems || []).indexOf(itemName); if (i >= 0) darkRun.carryItems.splice(i, 1); } catch (e) { }
            F.arm = F.arm || {};
            F.arm[itemName] = (F.arm[itemName] || 0) + 1;
            try { addHistoryLog(currentUser, '[이상한 나라 꺼냄] ' + itemName); } catch (e) { }
            try { saveSelfFull(); } catch (e) { }
            X.save && X.save();
            alertMsg('「' + itemName + '」을(를) 꺼내 두었습니다.\n' + cat.desc.replace(/^\[이상한 나라\] /, '').split(' 「이상한 나라의')[0]);
            try { X.view && X.view(); } catch (e) { }
        };
        useInventoryItem = w;
        try { window.useInventoryItem = w; } catch (e) { }
    }, 60);
})();

console.log('[이상한 나라] 이벤트 샵 30종 연결');
})();
