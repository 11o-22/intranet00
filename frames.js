// ==========================================
// ★ 사원증 테두리 — 견본첩 40종
// index.html 에서 allamount.js 다음에 불러온다
// ==========================================

const FRAME_REFUND = { D: 20, C: 30, B: 40, A: 50, S: 60 };
const FRAME_WEIGHT = { D: 60, C: 25, B: 10, A: 4.5, S: 0.5 };
const FRAME_COLOR  = { D: '#9e9e9e', C: '#4fc3f7', B: '#c9a8ff', A: '#ffd700', S: '#ff6b9d' };

const FRAMES = [
    // ===== D 16종 · 사무 =====
    { id:'d01', g:'D', n:'무지', c:`border:2px solid #8a8a8a;` },
    { id:'d02', g:'D', n:'철선', c:`border:2px solid #6b6b6b; box-shadow:inset 0 0 0 1px #3a3a3a;` },
    { id:'d03', g:'D', n:'갱지', c:`border:2px solid #b8a888; background-image:linear-gradient(0deg, rgba(180,160,120,0.06), transparent);` },
    { id:'d04', g:'D', n:'복사용지', c:`border:2px solid #d8d8d8; box-shadow:0 0 6px rgba(255,255,255,0.12);` },
    { id:'d05', g:'D', n:'형광펜', c:`border:2px solid #d4e157; animation:frBreath 3.4s ease-in-out infinite;` },
    { id:'d06', g:'D', n:'연필선', c:`border:2px dashed #7a7a6a;` },
    { id:'d07', g:'D', n:'압정', c:`border:2px solid #8a8a8a; box-shadow:0 0 0 3px rgba(200,60,60,0.25);` },
    { id:'d08', g:'D', n:'스테이플러', c:`border:2px solid #9a9a9a; border-top-width:4px;` },
    { id:'d09', g:'D', n:'마스킹 테이프', c:`border:3px solid rgba(220,200,150,0.55);` },
    { id:'d10', g:'D', n:'모눈', c:`border:2px solid #6a7a8a; background-image:linear-gradient(rgba(120,150,180,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,150,180,0.10) 1px, transparent 1px); background-size:9px 9px;` },
    { id:'d11', g:'D', n:'점선', c:`border:2px dotted #909090;` },
    { id:'d12', g:'D', n:'이중선', c:`border:3px double #a0a0a0;` },
    { id:'d13', g:'D', n:'낡은 종이', c:`border:2px solid #9a8a70; filter:sepia(0.15);` },
    { id:'d14', g:'D', n:'커피 자국', c:`border:2px solid #7a5a3a; box-shadow:inset 0 0 12px rgba(120,80,40,0.28);` },
    { id:'d15', g:'D', n:'접힌 자국', c:`border:2px solid #8a8a8a; background-image:linear-gradient(135deg, transparent 47%, rgba(255,255,255,0.10) 50%, transparent 53%);` },
    { id:'d16', g:'D', n:'지문', c:`border:2px solid #7a7a7a; box-shadow:inset 0 0 10px rgba(150,150,150,0.20);` },

    // ===== C 12종 · 건물 =====
    { id:'c01', g:'C', n:'형광등', c:`border:2px solid #cfd8dc; box-shadow:0 0 10px rgba(207,216,220,0.45); animation:frFlicker 5s linear infinite;` },
    { id:'c02', g:'C', n:'비상구', c:`border:2px solid #4CAF50; box-shadow:0 0 10px rgba(76,175,80,0.5); animation:frBreath 2.6s ease-in-out infinite;` },
    { id:'c03', g:'C', n:'복도 조명', c:`border:2px solid #b0bec5; background-image:linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent); background-size:200% 100%; animation:frSlide 5s linear infinite;` },
    { id:'c04', g:'C', n:'엘리베이터', c:`border:2px solid #90a4ae; border-left-width:5px; border-right-width:5px;` },
    { id:'c05', g:'C', n:'창틀', c:`border:3px solid #78909c; box-shadow:inset 0 0 0 2px rgba(255,255,255,0.10);` },
    { id:'c06', g:'C', n:'블라인드', c:`border:2px solid #90a4ae; background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 7px);` },
    { id:'c07', g:'C', n:'카펫', c:`border:3px solid #6d4c41; box-shadow:inset 0 0 8px rgba(110,70,50,0.35);` },
    { id:'c08', g:'C', n:'명패', c:`border:2px solid #b8a060; box-shadow:0 0 0 1px #5a4a2a, inset 0 0 6px rgba(200,170,100,0.25);` },
    { id:'c09', g:'C', n:'사원증 케이스', c:`border:3px solid rgba(180,200,220,0.45); box-shadow:inset 0 0 14px rgba(255,255,255,0.12);` },
    { id:'c10', g:'C', n:'안전선', c:`border:3px solid #ffb300; background-image:repeating-linear-gradient(45deg, rgba(255,179,0,0.14) 0 7px, transparent 7px 14px);` },
    { id:'c11', g:'C', n:'주의 테이프', c:`border:3px solid #000; background-image:repeating-linear-gradient(45deg, #ffca28 0 9px, #1a1a1a 9px 18px); background-clip:border-box; box-shadow:inset 0 0 0 99px rgba(0,0,0,0.78);` },
    { id:'c12', g:'C', n:'소화전', c:`border:2px solid #e53935; box-shadow:0 0 9px rgba(229,57,53,0.45); animation:frBreath 3s ease-in-out infinite;` },

    // ===== B 7종 · 어둠 =====
    { id:'b01', g:'B', n:'어둠 가장자리', c:`border:2px solid #4a2a4a; box-shadow:inset 0 0 18px rgba(0,0,0,0.9), 0 0 12px rgba(90,40,90,0.45); animation:frBreath 4.2s ease-in-out infinite;` },
    { id:'b02', g:'B', n:'꺼진 가로등', c:`border:2px solid #5a5a3a; box-shadow:0 0 14px rgba(200,180,90,0.30); animation:frFlicker 3.2s linear infinite;` },
    { id:'b03', g:'B', n:'거울', c:`border:2px solid #8fa8c8; background-image:linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%); background-size:250% 100%; animation:frSlide 3.6s linear infinite;` },
    { id:'b04', g:'B', n:'미로', c:`border:2px solid #7a6a5a; background-image:repeating-linear-gradient(90deg, rgba(180,160,130,0.12) 0 3px, transparent 3px 10px), repeating-linear-gradient(0deg, rgba(180,160,130,0.12) 0 3px, transparent 3px 10px);` },
    { id:'b05', g:'B', n:'안개', c:`border:2px solid rgba(200,210,220,0.45); box-shadow:0 0 20px rgba(200,210,220,0.25), inset 0 0 16px rgba(200,210,220,0.12); animation:frBreath 5s ease-in-out infinite;` },
    { id:'b06', g:'B', n:'물그림자', c:`border:2px solid #2a6a7a; background-image:linear-gradient(180deg, transparent, rgba(60,160,180,0.14)); animation:frWave 4.5s ease-in-out infinite;` },
    { id:'b07', g:'B', n:'꺼지지 않는 초', c:`border:2px solid #c8922a; box-shadow:0 0 14px rgba(255,180,60,0.40); animation:frFlame 2.2s ease-in-out infinite;` },

    // ===== A 4종 · 구역 =====
    { id:'a01', g:'A', n:'검역', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(90deg,#e53935,#ffb300,#e53935); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 200% 100%; animation:frSlide 3s linear infinite; box-shadow:0 0 16px rgba(229,57,53,0.40);` },
    { id:'a02', g:'A', n:'심해', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(135deg,#01579b,#4fc3f7,#00363a,#4fc3f7); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 300% 300%; animation:frDrift 7s ease-in-out infinite; box-shadow:0 0 18px rgba(79,195,247,0.35);` },
    { id:'a03', g:'A', n:'동화의 뒷면', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), linear-gradient(120deg,#8d6e63,#d7ccc8,#6d4c41,#d7ccc8); background-origin:border-box; background-clip:padding-box,border-box; background-size:100% 100%, 260% 260%; animation:frDrift 8s ease-in-out infinite; box-shadow:0 0 16px rgba(215,204,200,0.30);` },
    { id:'a04', g:'A', n:'별자리', c:`border:2px solid transparent; background-image:linear-gradient(#000,#000), conic-gradient(from 0deg,#1a237e,#5c6bc0,#e8eaf6,#5c6bc0,#1a237e); background-origin:border-box; background-clip:padding-box,border-box; animation:frSpin 9s linear infinite; box-shadow:0 0 20px rgba(92,107,192,0.45);` },

    // ===== S 1종 =====
    { id:'s01', g:'S', n:'■■의 ■■■', c:`` }
];

// ==========================================
// 스타일
// ==========================================
(function injectFrameCSS() {
    let css = `
@keyframes frBreath { 0%,100%{filter:brightness(1);} 50%{filter:brightness(1.55);} }
@keyframes frFlicker { 0%,92%,96%,100%{opacity:1;} 94%{opacity:0.45;} 98%{opacity:0.7;} }
@keyframes frSlide { 0%{background-position:0% 50%, 0% 50%;} 100%{background-position:0% 50%, 200% 50%;} }
@keyframes frDrift { 0%,100%{background-position:0% 50%, 0% 50%;} 50%{background-position:0% 50%, 100% 50%;} }
@keyframes frSpin { 0%{--fra:0deg; transform:rotate(0);} 100%{--fra:360deg;} }
@keyframes frWave { 0%,100%{box-shadow:inset 0 -6px 14px rgba(60,160,180,0.20);} 50%{box-shadow:inset 0 -14px 22px rgba(60,160,180,0.38);} }
@keyframes frFlame { 0%,100%{box-shadow:0 0 12px rgba(255,180,60,0.35);} 50%{box-shadow:0 0 22px rgba(255,210,110,0.65);} }

.fr-wrap { position:relative; border-radius:7px; }

/* ===== S — ■■의 ■■■ ===== */
@keyframes frSRing { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
@keyframes frSSweep { 0%{transform:translateX(-140%) skewX(-22deg);} 55%,100%{transform:translateX(240%) skewX(-22deg);} }
@keyframes frSPulse { 0%,100%{box-shadow:0 0 18px rgba(212,175,55,0.35), inset 0 0 22px rgba(0,0,0,0.85);} 50%{box-shadow:0 0 34px rgba(212,175,55,0.70), 0 0 60px rgba(180,40,80,0.30), inset 0 0 26px rgba(0,0,0,0.9);} }

.fr-s01 {
    position:relative;
    border:2px solid rgba(212,175,55,0.75) !important;
    border-radius:7px;
    background-color:#0a0a08 !important;
    animation:frSPulse 3.8s ease-in-out infinite;
    overflow:hidden;
    isolation:isolate;
}
.fr-s01::before {
    content:''; position:absolute; inset:-60%;
    background:conic-gradient(from 0deg,
        transparent 0deg, rgba(212,175,55,0.55) 28deg, transparent 56deg,
        transparent 150deg, rgba(180,40,80,0.45) 178deg, transparent 206deg,
        transparent 290deg, rgba(212,175,55,0.35) 318deg, transparent 346deg);
    animation:frSRing 6.5s linear infinite;
    pointer-events:none; z-index:0;
}
.fr-s01::after {
    content:''; position:absolute; top:0; bottom:0; width:38%;
    background:linear-gradient(90deg, transparent, rgba(255,240,190,0.30), transparent);
    animation:frSSweep 4.6s ease-in-out infinite;
    pointer-events:none; z-index:1;
}
.fr-s01 > * { position:relative; z-index:2; }
`;
    FRAMES.forEach(function (f) {
              if (f.c) {
            const body = f.c.replace(/;\s*/g, ' !important; ');
            css += `.fr-${f.id}{ ${body} border-radius:7px !important; }\n`;
        }
    });
    const st = document.createElement('style');
    st.id = 'frame-css';
    st.textContent = css;
    document.head.appendChild(st);
})();

// ==========================================
// 소지 관리
// ==========================================
function frBag() {
    if (!currentUser) return { owned: {} };
    if (!currentUser.frames) currentUser.frames = { owned: {}, badge: '', list: '', hist: '' };
    if (!currentUser.frames.owned) currentUser.frames.owned = {};
    return currentUser.frames;
}
function frOwned(id) { return (frBag().owned || {})[id] > 0; }
function frById(id) { return FRAMES.find(f => f.id === id); }

function frDraw() {
    let total = 0;
    FRAMES.forEach(f => { total += FRAME_WEIGHT[f.g] / FRAMES.filter(x => x.g === f.g).length; });
    let r = Math.random() * total;
    for (let i = 0; i < FRAMES.length; i++) {
        const w = FRAME_WEIGHT[FRAMES[i].g] / FRAMES.filter(x => x.g === FRAMES[i].g).length;
        r -= w;
        if (r <= 0) return FRAMES[i];
    }
    return FRAMES[0];
}

// ==========================================
// 견본첩
// ==========================================
ITEM_CATALOG['테두리 견본첩'] = {
    price: 100, usable: true, targetable: false, effect: 'frame_book',
    desc: '사원증에 두를 테두리가 한 장 들어 있다. 무엇이 나올지는 열어야 안다.'
};
if (typeof NO_SELL_ITEMS !== 'undefined') NO_SELL_ITEMS.push('테두리 견본첩');

function frameBookLeft() {
    if (!currentUser) return 0;
    const key = getShopCycleKey();
    if (!currentUser.purchaseRecord) currentUser.purchaseRecord = {};
    if (!currentUser.purchaseRecord[key]) currentUser.purchaseRecord[key] = {};
    return Math.max(0, 5 - (currentUser.purchaseRecord[key]['frame_book'] || 0));
}

function buyFrameBook() {
    if (!buyGuard()) return;
    if (isQuarantined(currentUser)) { showCustomAlert('격리 중에는 상점을 이용할 수 없습니다.'); return; }
    if (frameBookLeft() <= 0) { showCustomAlert('금일 구매 한도를 모두 사용했습니다.'); return; }
    const price = ITEM_CATALOG['테두리 견본첩'].price;
    if (currentUser.points < price) { showLuxuryAlert(); return; }

    const key = getShopCycleKey();
    currentUser.purchaseRecord[key]['frame_book'] = (currentUser.purchaseRecord[key]['frame_book'] || 0) + 1;
    currentUser.points -= price;
    currentUser.inventory.push('테두리 견본첩');
    addHistoryLog(currentUser, `[상점 구매] 테두리 견본첩 (-${price} P)`);
    saveFields({ points: 1, inventory: 1, history: 1, purchaseRecord: 1 });
    updateUI();
}

// 유쾌 판매소 상단 고정
(function pinShop() {
    if (typeof renderRegularShop !== 'function') return;
    const _r = renderRegularShop;
    renderRegularShop = function () {
        const r = _r.apply(this, arguments);
        const box = document.getElementById('regular-shop-items-container');
        if (!box) return r;
        const left = frameBookLeft();
        box.insertAdjacentHTML('afterbegin', `
            <div style="background:linear-gradient(145deg,#1d1730,#120e1f); border:1px solid #6a4c93; border-radius:7px; padding:12px; margin-bottom:12px;">
                <div style="font-size:10px; color:#c9a8ff; letter-spacing:1px; margin-bottom:5px;">[상시 비치]</div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-size:14px; color:#fff; font-weight:bold;">📕 테두리 견본첩</div>
                        <div style="font-size:10px; color:#aaa; margin-top:5px; line-height:1.6;">
                            사원증에 두를 테두리가 한 장 들어 있다.<br>
                            <span style="color:#888;">금일 잔여 <b style="color:${left ? '#4CAF50' : '#f44336'}">${left}</b> / 5개</span>
                        </div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:9px 13px; font-size:12px; flex-shrink:0;" onclick="buyFrameBook()" ${left ? '' : 'disabled'}>
                        ${left ? '100 P' : '품절'}
                    </button>
                </div>
            </div>`);
        return r;
    };
})();

// ==========================================
// 개봉
// ==========================================
(function hookOpen() {
    const _use = useInventoryItem;
    useInventoryItem = function (itemName) {
        if (!ITEM_CATALOG[itemName] || ITEM_CATALOG[itemName].effect !== 'frame_book')
            return _use.apply(this, arguments);
        if (!buyGuard()) return;

        const f = frDraw();
        const bag = frBag();
        const dup = frOwned(f.id);
        removeItemFromInventory(currentUser, '테두리 견본첩', 1);

        let msg;
        if (dup) {
            const back = FRAME_REFUND[f.g];
            currentUser.points += back;
            bag.owned[f.id] = (bag.owned[f.id] || 0) + 1;
            addHistoryLog(currentUser, `[견본첩] ${f.n} (중복 · +${back} P)`);
            msg = `${f.g}등급 — ${f.n}\n\n이미 가지고 있던 것입니다.\n${back} P로 돌려받았습니다.`;
        } else {
            bag.owned[f.id] = 1;
            addHistoryLog(currentUser, `[견본첩] ${f.g}등급 '${f.n}' 획득`);
            msg = `${f.g}등급 — ${f.n}\n\n새로 얻었습니다.`;
        }

        saveSelfFull();
        updateUI();
        if (dup) showPointGainEffect(FRAME_REFUND[f.g]);
        showCustomAlert(msg);
        setTimeout(function () { if (!dup) openFramePanel(); }, 400);
    };
})();

// ==========================================
// 관리 화면
// ==========================================
function openFramePanel() {
    const bag = frBag();
    const owned = FRAMES.filter(f => frOwned(f.id));
    const total = FRAMES.length;

    const slotRow = (key, label) => {
        const cur = bag[key] ? frById(bag[key]) : null;
        return `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid #4a3a6a; border-radius:5px; padding:9px 11px; margin-bottom:6px;">
            <span style="font-size:11px; color:#aaa;">${label}</span>
            <span style="font-size:11px; color:${cur ? FRAME_COLOR[cur.g] : '#666'}; font-weight:bold;">${cur ? cur.g + ' · ' + cur.n : '없음'}</span>
        </div>`;
    };

    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">
            보유 <b style="color:#c9a8ff;">${owned.length}</b> / ${total}종<br>
            테두리를 고르고 어디에 쓸지 지정하세요.
        </div>
        ${slotRow('badge', '사원증')}
        ${slotRow('list', '열람 카드')}
        ${slotRow('hist', '기록')}
        <div style="display:flex; gap:5px; margin:9px 0 13px 0;">
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('badge','')">사원증 해제</button>
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('list','')">열람 해제</button>
            <button class="game-btn" style="flex:1; margin:0; padding:8px; font-size:11px;" onclick="frSet('hist','')">기록 해제</button>
        </div>
        <div style="max-height:46vh; overflow-y:auto; padding-right:4px;">
        ${['S','A','B','C','D'].map(g => {
            const list = FRAMES.filter(f => f.g === g);
            const have = list.filter(f => frOwned(f.id));
            return `
            <div style="font-size:11px; color:${FRAME_COLOR[g]}; font-weight:bold; margin:11px 0 6px 0; border-bottom:1px solid #333; padding-bottom:4px;">
                ${g}등급 <span style="color:#888; font-weight:normal;">${have.length} / ${list.length}</span>
            </div>` +
            list.map(f => {
                const own = frOwned(f.id);
                if (!own) return `<div style="border:1px dashed #333; border-radius:6px; padding:9px 11px; margin-bottom:6px; font-size:11px; color:#555;">??? <span style="font-size:10px;">미획득</span></div>`;
                return `
                <div style="border:1px solid #3a3a3a; border-radius:6px; padding:9px 11px; margin-bottom:6px;">
                    <div style="display:flex; align-items:center; gap:9px; margin-bottom:7px;">
                        <div class="fr-${f.id}" style="width:34px; height:34px; flex-shrink:0;"></div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:12px; color:#fff; font-weight:bold;">${f.n}</div>
                            <div style="font-size:10px; color:${FRAME_COLOR[f.g]};">${f.g}등급</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('badge','${f.id}')">사원증</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('list','${f.id}')">열람</button>
                        <button class="game-btn" style="flex:1; margin:0; padding:6px; font-size:10px;" onclick="frSet('hist','${f.id}')">기록</button>
                    </div>
                </div>`;
            }).join('');
        }).join('')}
        </div>`;

    openGearModal('테두리', html);
}

function frSet(slot, id) {
    const bag = frBag();
    if (id && !frOwned(id)) { showCustomAlert('아직 얻지 못한 테두리입니다.'); return; }
    bag[slot] = id;
    saveSelfFull();
    updateUI();
    openFramePanel();
}

// ==========================================
// 적용
// ==========================================
function frOf(user, slot) {
    if (!user || !user.frames) return '';
    return user.frames[slot] || '';
}
function frApply(el, id) {
    if (!el) return;
    Array.from(el.classList).forEach(c => { if (/^fr-/.test(c)) el.classList.remove(c); });
    el.classList.remove('fr-wrap');
    if (!id) return;
    el.classList.add('fr-wrap', 'fr-' + id);
}

function frRefresh() {
    if (!currentUser) return;
    frApply(document.getElementById('badge-photo-display'), frOf(currentUser, 'badge'));
    document.querySelectorAll('#history-list-container .history-item')
        .forEach(el => frApply(el, frOf(currentUser, 'hist')));
    document.querySelectorAll('#employee-cards-container .emp-list-card').forEach(function (el) {
        const m = (el.getAttribute('onclick') || '').match(/'([^']+)'/);
        if (!m) return;
        const u = db.users[m[1]];
        frApply(el, frOf(u, 'list'));
    });
}

['updateUI', 'renderHistory', 'renderEmployeeCards', 'renderBadgePhoto'].forEach(function (n) {
    if (typeof window[n] !== 'function') return;
    const _f = window[n];
    window[n] = function () {
        const r = _f.apply(this, arguments);
        setTimeout(frRefresh, 30);
        return r;
    };
});

// 사원증 탭에 버튼
(function addBtn() {
    function put() {
        const panel = document.getElementById('rec-badge');
        if (!panel || document.getElementById('frame-open-btn')) return;
        const save = panel.querySelector('button[onclick*="saveBadgeInfo"]');
        if (!save) return;
        save.insertAdjacentHTML('afterend',
            `<button id="frame-open-btn" class="game-btn" style="width:100%; margin-top:8px; padding:10px; background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;" onclick="openFramePanel()">🖼 테두리 관리</button>`);
    }
    put();
    setTimeout(put, 900);
    setTimeout(put, 2500);
})();

console.log('[테두리] 40종 등록 완료');