// ==========================================
// ★ 소지품 검색 · 울림 확성기
// index.html 에서 invcat.js 보다 뒤에 불러온다 (맨 뒤여도 된다)
// ==========================================
//
// 1. 소지품 목록 위에 찾는 칸을 둔다. 이름·설명으로 걸러 준다.
// 2. 울림 확성기 — 500 P, 유쾌 판매소 무작위 입고, 한 번 쓰면 사라진다.
//    쓰고 나서 50자 안쪽으로 적으면, 접속한 모든 사원 화면 위로 띠가 지나간다.

(function invShout() {

// ==========================================
// 1. 소지품 검색
// ==========================================
let invQuery = '';

function norm(s) {
    return String(s || '').toLowerCase().replace(/\s+/g, '');
}

function invBox() {
    return document.getElementById('inventory-list-container');
}

// 찾는 칸을 소지품 목록 «바깥»에 둔다.
// 목록 안에 두면 renderInventory 가 다시 그릴 때마다 지워져 글자가 끊긴다.
function mountSearchBar() {
    const box = invBox();
    if (!box || !box.parentNode) return false;
    if (document.getElementById('inv-search-bar')) return true;

    const bar = document.createElement('div');
    bar.id = 'inv-search-bar';
    bar.style.cssText = 'display:flex; gap:6px; align-items:center; margin-bottom:9px;';
    bar.innerHTML =
        '<input type="text" id="inv-search-input" placeholder="소지품 찾기"'
        + ' style="flex:1; min-width:0; padding:9px 11px; font-size:12px; box-sizing:border-box; margin:0;">'
        + '<button class="game-btn" id="inv-search-clear"'
        + ' style="margin:0; padding:9px 12px; font-size:11px; flex-shrink:0;">지움</button>';

    box.parentNode.insertBefore(bar, box);

    const input = document.getElementById('inv-search-input');
    const setQ = function (v) {
        const had = !!invQuery;
        invQuery = v;
        input.value = v;
        // 검색어를 지웠으면 다시 그린다 — 접어 둔 칸이 제 상태로 돌아온다
        if (had && !v && typeof renderInventory === 'function') renderInventory();
        else applyInvFilter();
    };
    input.addEventListener('input', function () { setQ(input.value); });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setQ('');
    });
    document.getElementById('inv-search-clear').addEventListener('click', function () {
        setQ(''); input.focus();
    });
    return true;
}

function cardName(el) {
    if (el.dataset && el.dataset.invName) return el.dataset.invName;
    const n = el.querySelector('.inv-card-name');
    return n ? n.innerText.trim() : '';
}

function applyInvFilter() {
    const box = invBox();
    if (!box) return;

    const q = norm(invQuery);
    const cards = Array.from(box.querySelectorAll('.inv-card'));

    // 검색어가 없으면 전부 되돌린다
    if (!q) {
        cards.forEach(function (el) { el.style.display = ''; });
        Array.from(box.children).forEach(function (c) { c.style.display = ''; });
        Array.from(box.querySelectorAll('.inv-cat-wrap > div')).forEach(function (sec) {
            sec.style.display = '';
        });
        const tag = document.getElementById('inv-search-count');
        if (tag) tag.remove();
        return;
    }

    let hit = 0;
    cards.forEach(function (el) {
        const nm = cardName(el);
        const cat = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG[nm] : null;
        const hay = norm(nm) + ' ' + norm(cat && cat.desc);
        const ok = hay.indexOf(q) >= 0;
        el.style.display = ok ? '' : 'none';
        if (ok) hit++;
    });

    // 소지품 카드가 아닌 위쪽 덩어리(전용 장비·금고 등)는 찾는 동안 감춘다
    Array.from(box.children).forEach(function (c) {
        if (!c.classList || !c.classList.contains('inv-cat-wrap')) c.style.display = 'none';
        else c.style.display = '';
    });

    // 칸 단위로 — 남은 것이 없으면 칸째 감추고, 있으면 펼쳐 둔다
    const wrap = box.querySelector('.inv-cat-wrap');
    if (wrap) {
        Array.from(wrap.children).forEach(function (sec) {
            const inner = sec.querySelectorAll ? Array.from(sec.querySelectorAll('.inv-card')) : [];
            if (!inner.length) {                      // 「모두 펼치기」 줄
                sec.style.display = 'none';
                return;
            }
            const any = inner.some(function (el) { return el.style.display !== 'none'; });
            sec.style.display = any ? '' : 'none';
            if (any) {
                Array.from(sec.children).forEach(function (part, i) {
                    if (i > 0) part.style.display = '';   // 접혀 있어도 찾는 동안은 편다
                });
            }
        });
    }

    showCount(hit);
}

function showCount(n) {
    let tag = document.getElementById('inv-search-count');
    const bar = document.getElementById('inv-search-bar');
    if (!bar) return;
    if (!tag) {
        tag = document.createElement('div');
        tag.id = 'inv-search-count';
        tag.style.cssText = 'font-size:10px; color:#888; margin:-4px 0 9px 2px;';
        bar.parentNode.insertBefore(tag, bar.nextSibling);
    }
    tag.innerText = n ? (n + '종 찾았습니다.') : '찾는 물건이 없습니다.';
    tag.style.color = n ? '#888' : '#ff8f8f';
}

(function hookInvSearch() {
    const iv = setInterval(function () {
        if (typeof renderInventory !== 'function') return;
        if (renderInventory._invSearch) { clearInterval(iv); return; }

        const _r = renderInventory;
        renderInventory = function () {
            const out = _r.apply(this, arguments);
            try {
                if (mountSearchBar()) applyInvFilter();
            } catch (e) {
                console.warn('[소지품] 찾기 건너뜀:', e && e.message);
            }
            return out;
        };
        renderInventory._invSearch = true;
        clearInterval(iv);
        console.log('[소지품] 찾는 칸 연결');
    }, 500);
})();

// ==========================================
// 2. 울림 확성기
// ==========================================
const HORN = '울림 확성기';
const HORN_MAX = 50;

(function registerHorn() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (ITEM_CATALOG[HORN]) { clearInterval(iv); return; }

        ITEM_CATALOG[HORN] = {
            price: 500, usable: true, targetable: false, effect: 'echo_horn',
            desc: '한 번 눌러 쓰면 그만이다. 50자 안쪽으로 적은 말이 사내 전체를 한 바퀴 돌아 지나간다.'
        };

        // 유쾌 판매소 무작위 입고 목록에 넣는다
        try {
            if (typeof ALL_10_ITEMS !== 'undefined' && ALL_10_ITEMS.indexOf(HORN) === -1) {
                ALL_10_ITEMS.push(HORN);
            }
        } catch (e) { }

        clearInterval(iv);
        console.log('[확성기] 등록 — 유쾌 판매소 입고 목록에 추가');
    }, 500);
})();

function esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ------------------------------------------
// 적는 창
// ------------------------------------------
function openHornBox() {
    if (document.getElementById('horn-overlay')) return;

    const ov = document.createElement('div');
    ov.id = 'horn-overlay';
    ov.style.cssText = 'position:fixed; inset:0; z-index:10050; display:flex;'
        + ' align-items:center; justify-content:center; padding:18px;'
        + ' background:rgba(0,0,0,0.72);';
    ov.innerHTML =
        '<div style="width:100%; max-width:380px; box-sizing:border-box; padding:18px;'
        + ' border:1px solid #5a4a2a; border-radius:8px; background:#14110c;'
        + ' box-shadow:0 8px 30px rgba(0,0,0,0.6);">'
        + '<div style="font-size:14px; color:#d4af37; font-weight:bold; margin-bottom:6px;">울림 확성기</div>'
        + '<div style="font-size:11px; color:#999; line-height:1.7; margin-bottom:12px;">'
        + '적은 말이 지금 접속한 모든 사원의 화면 위를 지나갑니다.<br>'
        + '이름이 함께 나갑니다. 한 번 쓰면 확성기는 사라집니다.</div>'
        + '<input type="text" id="horn-text" maxlength="' + HORN_MAX + '" placeholder="50자 안쪽"'
        + ' style="width:100%; padding:11px; font-size:13px; box-sizing:border-box; margin:0 0 6px 0;">'
        + '<div id="horn-left" style="font-size:10px; color:#888; text-align:right; margin-bottom:12px;">'
        + '0 / ' + HORN_MAX + '</div>'
        + '<div style="display:flex; gap:7px;">'
        + '<button class="game-btn" id="horn-send" style="flex:1; margin:0; padding:11px; font-size:12px;">외친다</button>'
        + '<button class="game-btn" id="horn-cancel" style="flex:1; margin:0; padding:11px; font-size:12px;'
        + ' background:linear-gradient(145deg,#333,#1a1a1a) !important;">그만둔다</button>'
        + '</div></div>';

    document.body.appendChild(ov);

    const input = document.getElementById('horn-text');
    const left = document.getElementById('horn-left');
    input.addEventListener('input', function () {
        left.innerText = input.value.length + ' / ' + HORN_MAX;
    });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendHorn();
        if (e.key === 'Escape') closeHorn();
    });
    document.getElementById('horn-send').addEventListener('click', sendHorn);
    document.getElementById('horn-cancel').addEventListener('click', closeHorn);
    setTimeout(function () { input.focus(); }, 120);
}

function closeHorn() {
    const ov = document.getElementById('horn-overlay');
    if (ov) ov.remove();
}

function sendHorn() {
    const input = document.getElementById('horn-text');
    if (!input) return;
    const text = input.value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, HORN_MAX);
    if (!text) { showCustomAlert('적어 주세요.'); return; }

    if ((currentUser.inventory || []).indexOf(HORN) === -1) {
        showCustomAlert('확성기가 없습니다.'); closeHorn(); return;
    }
    if (!database) { showCustomAlert('지금은 외칠 수 없습니다.'); return; }

    const btn = document.getElementById('horn-send');
    if (btn) { btn.disabled = true; btn.innerText = '보내는 중...'; }

    database.ref('shouts').push({
        name: currentUser.name || '사원',
        team: currentUser.team || '',
        text: text,
        at: Date.now()
    }).then(function () {
        removeItemFromInventory(currentUser, HORN, 1);
        addHistoryLog(currentUser, '[울림 확성기] ' + text);
        saveFields({ inventory: 1, history: 1 });
        updateUI();
        closeHorn();
        sweepShouts();
    }).catch(function (e) {
        console.error('[확성기] 실패:', e);
        if (btn) { btn.disabled = false; btn.innerText = '외친다'; }
        showCustomAlert('서버에 닿지 못했습니다.\n확성기는 그대로 있습니다.');
    });
}

// 소지품에서 쓰기
(function hookHornUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._horn) { clearInterval(iv); return; }

        const _u = useInventoryItem;
        useInventoryItem = function (itemName) {
            if (itemName !== HORN) return _u.apply(this, arguments);
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) {
                showCustomAlert('격리 중에는 쓸 수 없습니다.'); return;
            }
            if ((currentUser.inventory || []).indexOf(HORN) === -1) return;
            openHornBox();
        };
        useInventoryItem._horn = true;
        clearInterval(iv);
        console.log('[확성기] 소지품 사용 연결');
    }, 500);
})();

// ------------------------------------------
// 지나가는 띠
// ------------------------------------------
(function hornStyle() {
    if (document.getElementById('horn-style')) return;
    const st = document.createElement('style');
    st.id = 'horn-style';
    st.innerHTML =
        '#horn-lane{position:fixed;left:0;right:0;top:0;z-index:10040;pointer-events:none;}'
        + '.horn-band{position:relative;overflow:hidden;height:34px;'
        + 'background:linear-gradient(90deg,rgba(10,8,4,0.95),rgba(30,24,10,0.95),rgba(10,8,4,0.95));'
        + 'border-bottom:1px solid #5a4a2a;box-shadow:0 2px 12px rgba(0,0,0,0.5);}'
        + '.horn-run{position:absolute;top:0;left:0;height:34px;line-height:34px;white-space:nowrap;'
        + 'font-size:13px;color:#e8d9a8;letter-spacing:0.4px;'
        + 'will-change:transform;animation:hornRun 14s linear forwards;}'
        + '.horn-who{color:#d4af37;font-weight:bold;}'
        + '@keyframes hornRun{from{transform:translateX(100vw);}to{transform:translateX(-100%);}}';
    document.head.appendChild(st);
})();

function hornLane() {
    let lane = document.getElementById('horn-lane');
    if (!lane) {
        lane = document.createElement('div');
        lane.id = 'horn-lane';
        document.body.appendChild(lane);
    }
    return lane;
}

function showBand(name, team, text) {
    const body = '<span style="color:#d4af37; font-weight:bold;">' + esc(name)
        + (team ? ' <span style="color:#8a8f98;">· ' + esc(team) + '</span>' : '')
        + '</span> &nbsp;—&nbsp; ' + esc(text);

    // 이미 있는 📢 띠를 쓴다 (임신 안내와 같은 자리, 겹치지 않는다)
    if (typeof showPregTicker === 'function' && document.getElementById('notice-ticker')) {
        try { showPregTicker(body); return; } catch (e) { }
    }

    // 그 띠가 없으면 따로 만든다
    const lane = hornLane();
    if (lane.children.length >= 3) return;

    const band = document.createElement('div');
    band.className = 'horn-band';
    band.innerHTML = '<div class="horn-run">📢 ' + body + '</div>';
    lane.appendChild(band);
    setTimeout(function () { if (band.parentNode) band.remove(); }, 14500);
}

// ------------------------------------------
// 남이 외친 것을 받는다
// ------------------------------------------
const bornAt = Date.now();
const seen = {};

(function listenShouts() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (window._hornListen) { clearInterval(iv); return; }
        window._hornListen = true;
        clearInterval(iv);

        // push 열쇠가 곧 시간순이라 orderByChild 가 필요 없다 (규칙에 색인을 안 만들어도 된다)
        database.ref('shouts').limitToLast(5)
            .on('child_added', function (snap) {
                const v = snap.val();
                if (!v || !v.text) return;
                if (seen[snap.key]) return;
                seen[snap.key] = true;
                // 들어오기 전에 지나간 것은 다시 틀지 않는다
                if (!v.at || v.at < bornAt - 20000) return;
                showBand(v.name, v.team, v.text);
            });
        console.log('[확성기] 띠 수신 연결');
    }, 700);
})();

// 오래된 것은 치운다 (외친 사람이 한 번씩)
function sweepShouts() {
    if (!database) return;
    const cut = Date.now() - 300000;
    database.ref('shouts').once('value').then(function (s) {
        const v = s.val();
        if (!v) return;
        const up = {};
        let n = 0;
        Object.keys(v).forEach(function (k) {
            const at = v[k] && v[k].at;
            if (!at || at < cut) { up['shouts/' + k] = null; n++; }
        });
        if (n) return database.ref().update(up);
    }).catch(function () { });
}

// ==========================================
// 확인
// ==========================================
window.hornTest = function (text) {
    showBand(currentUser ? currentUser.name : '시험', '', text || '시험 삼아 한 번 외쳐 봅니다.');
    console.log('(나에게만 보이는 시험입니다. 서버로 나가지 않습니다.)');
};

window.invSearchState = function () {
    const box = invBox();
    console.log('%c===== 소지품 찾기 =====', 'color:#d4af37; font-size:13px');
    console.log('  찾는 칸:', document.getElementById('inv-search-bar') ? 'O' : '-');
    console.log('  지금 검색어:', invQuery || '(없음)');
    console.log('  카드 수:', box ? box.querySelectorAll('.inv-card').length : 0);
    console.log('  확성기 등록:', (typeof ITEM_CATALOG !== 'undefined' && ITEM_CATALOG[HORN]) ? 'O' : '-');
    console.log('  판매소 목록 포함:', (typeof ALL_10_ITEMS !== 'undefined' && ALL_10_ITEMS.indexOf(HORN) >= 0) ? 'O' : '-');
};

console.log('[소지품/확성기] invSearchState() · hornTest("글")');

})();