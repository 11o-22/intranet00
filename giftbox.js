// ==========================================
// ★ 선물함 — 상담사가 보낸 물품과 공지를 사원이 받아 간다
// bundles.json 마지막 묶음, find-item.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 무엇이 바뀌나
//
//   예전에는 상담사가 「물품 강제 꽂기」를 누르면 소지품에 **말없이**
//   꽂혔다. 받는 사람은 기록을 뒤져야 알았다.
//   이제 선물함을 한 번 거친다. 사원이 소지품 탭에서 직접 받아야
//   소지품에 들어온다.
//
//   물품 없이 **글만** 보낼 수도 있다. 공지·안내용이다.
//   둘을 같이 보낼 수도 있다 (물품에 쪽지를 붙이는 셈).
//
// ■ 어디서 여나
//
//   사원증의 **SERIAL NO. 왼쪽**에 선물 상자 단추 하나가 늘 붙어 있다.
//   누르면 선물함이 제 창으로 열린다. 받을 것이 있으면 단추에 숫자가 뜬다.
//
//   예전에는 소지품 탭 맨 위에 칸으로 붙였는데, 받을 것이 없으면 아예
//   안 그려서 「선물함이 어디 있는지」 알 수가 없었다. 단추는 비어 있어도
//   늘 보인다.
//
// ■ 어디에 쌓이나
//
//       gifts/<사번>/<번호> = {
//           at,  by,  byName,
//           title,  text,              ← 글 (없을 수 있다)
//           items: { 물품이름: 개수 }   ← 물품 (없을 수 있다)
//       }
//
//   받으면 그 자리를 **지운다.** 받은 내용은 기록(history)에 남으므로
//   잃지 않고, 선물함이 끝없이 불어나지도 않는다.
//
// ■ 두 번 받지 않게
//
//   받기는 그 자리 하나를 지우는 **트랜잭션**이다. 먼저 지운 쪽만
//   물품을 가져간다. 두 창을 띄워 두고 동시에 눌러도 한 번만 들어온다.
//
//   파이어베이스는 지켜보기가 붙어 있는 동안만 값을 들고 있다.
//   선물함은 내가 늘 지켜보고 있으므로(watch) 트랜잭션 첫 굴림부터
//   진짜 자료를 본다. (마작에서 겪은 그 자리다)
//
// ■ 콘솔
//   giftState()            내 선물함
//   giftState(사번)        상담사 — 남의 선물함
//   giftSend(사번, '제목', '내용')     글만 보내기
//   giftSendItem(사번, '물품', 개수)   물품 보내기
//   openGiftBox()          선물함 창 열기 (단추가 안 보일 때)

(function giftBox() {

const ROOT = 'gifts';
const COUNSEL = 'kario0987';
const MAX_TEXT = 1500;

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function isCounsel(u) { return !!(u && u.code === COUNSEL); }
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function when(t) {
    const d = new Date(Number(t) || 0);
    if (!t) return '';
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 '
        + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function itemPairs(g) {
    const it = (g && g.items) || {};
    if (typeof it !== 'object') return [];
    return Object.keys(it).map(function (k) { return [k, Number(it[k]) || 0]; })
        .filter(function (p) { return p[1] > 0; });
}

// 트랜잭션 — 거는 동안 그 자리를 지켜본다 (안 그러면 첫 굴림이 null 이다)
function tx(path, fn) {
    const d = db_();
    if (!d) return Promise.resolve({ committed: false });
    const ref = d.ref(path);
    let held = false, fired = false, go = null;
    const keep = function () { if (fired || !go) return; fired = true; go(); };
    const drop = function () { if (!held) return; held = false; try { ref.off('value', keep); } catch (e) { } };
    const run = function () {
        if (typeof txRetry === 'function') return txRetry(path, fn);
        return ref.transaction(fn, null, false);
    };
    return new Promise(function (res) {
        go = res;
        try { ref.on('value', keep, keep); held = true; } catch (e) { keep(); }
        setTimeout(keep, 4000);
    }).then(run).then(function (r) { drop(); return r; }, function (e) { drop(); throw e; });
}

// ==========================================
// 1. 보내기
// ==========================================
function send(codes, opt) {
    const d = db_(), u = me();
    if (!d || !u) return Promise.resolve(0);
    const list = (Array.isArray(codes) ? codes : [codes]).filter(Boolean);
    if (!list.length) return Promise.resolve(0);

    const title = String((opt && opt.title) || '').slice(0, 120).trim();
    const text = String((opt && opt.text) || '').slice(0, MAX_TEXT).trim();
    const items = {};
    Object.keys((opt && opt.items) || {}).forEach(function (k) {
        const n = Number(opt.items[k]) || 0;
        if (k && n > 0) items[k] = n;
    });
    if (!title && !text && !Object.keys(items).length) return Promise.resolve(0);

    const base = { at: Date.now(), by: u.code, byName: u.name || '' };
    if (title) base.title = title;
    if (text) base.text = text;
    if (Object.keys(items).length) base.items = items;      // 빈 것은 넣지 않는다 (서버가 지운다)

    const up = {};
    list.forEach(function (c) {
        const id = d.ref(ROOT + '/' + c).push().key;
        up[ROOT + '/' + c + '/' + id] = base;
    });
    return d.ref('/').update(up).then(function () { return list.length; })
        .catch(function (e) { console.error('[선물함] 보내지 못했습니다', e); return 0; });
}
window.giftSendRaw = send;

window.giftSend = function (who, title, text) {
    if (!isCounsel(me())) { console.warn('상담사만 보낼 수 있습니다.'); return; }
    const c = findCode(who);
    if (!c) { console.warn('사원을 못 찾았습니다.'); return; }
    send([c], { title: title, text: text }).then(function (n) {
        console.log(n ? '✓ 보냈습니다.' : '보내지 못했습니다.');
    });
};
window.giftSendItem = function (who, item, qty) {
    if (!isCounsel(me())) { console.warn('상담사만 보낼 수 있습니다.'); return; }
    const c = findCode(who);
    if (!c) { console.warn('사원을 못 찾았습니다.'); return; }
    const it = {}; it[item] = Math.max(1, Number(qty) || 1);
    send([c], { items: it }).then(function (n) {
        console.log(n ? '✓ 보냈습니다.' : '보내지 못했습니다.');
    });
};
function findCode(who) {
    if (!who) return null;
    const users = (typeof db !== 'undefined' && db.users) || {};
    if (users[who]) return who;
    return Object.keys(users).filter(function (c) {
        const u = users[c];
        return u && (u.no === who || u.name === who);
    })[0] || null;
}

// ==========================================
// 2. 「물품 강제 꽂기」를 선물함으로 돌린다
// ==========================================
(function hookGive() {
    const iv = setInterval(function () {
        if (typeof adminGiveItem !== 'function') return;
        if (adminGiveItem._gift) { clearInterval(iv); return; }
        adminGiveItem = function () {
            const targets = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
            if (!targets.length) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.'); return; }
            const picked = Array.from(document.querySelectorAll('.adm-item-cb:checked')).map(function (c) { return c.value; });
            if (!picked.length) { showCustomAlert('지급할 물품을 선택해주세요.'); return; }
            const qty = parseInt((document.getElementById('adm-special-qty') || {}).value, 10) || 1;

            const items = {};
            picked.forEach(function (n) { items[n] = (items[n] || 0) + qty; });
            const note = (document.getElementById('gift-admin-text') || {}).value || '';
            const title = (document.getElementById('gift-admin-title') || {}).value || '';

            send(targets, { items: items, title: title, text: note }).then(function (n) {
                if (!n) { showCustomAlert('보내지 못했습니다.'); return; }
                const names = targets.map(function (c) { return (db.users[c] || {}).name || c; });
                clearAdminText();
                showCustomAlert(n + '명의 선물함으로 보냈습니다.\n\n'
                    + picked.join(', ') + ' 각 ' + qty + '개\n\n'
                    + '사원이 사원증의 🎁 단추에서 받아야 들어갑니다.\n(' + names.join(', ') + ')');
            });
        };
        adminGiveItem._gift = true;
        clearInterval(iv);
        console.log('[선물함] 물품 강제 꽂기를 선물함으로 돌렸습니다');
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

function clearAdminText() {
    const a = document.getElementById('gift-admin-title');
    const b = document.getElementById('gift-admin-text');
    if (a) a.value = '';
    if (b) b.value = '';
}

// ==========================================
// 3. 상담사 화면 — 글 칸과 보내기 단추
// ==========================================
const ADM = 'gift-admin-box';
function paintAdmin() {
    if (!isCounsel(me())) { const o = document.getElementById(ADM); if (o) o.remove(); return; }
    if (document.getElementById(ADM)) return;
    const btn = document.querySelector('[onclick*="adminGiveItem"]');
    if (!btn) return;
    const row = btn.parentNode;
    if (!row) return;

    row.insertAdjacentHTML('afterend',
        '<div id="' + ADM + '" style="border:1px solid #2e7d32; border-radius:6px; padding:10px;'
        + ' background:rgba(0,0,0,0.25); margin-top:8px;">'
        + '<div style="font-size:11px; color:#a5d6a7; font-weight:bold; margin-bottom:7px;">🎁 선물함 쪽지 · 공지</div>'
        + '<div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:8px;">'
        + '물품과 함께 보내려면 적어 두고 위의 <b>물품 강제 꽂기</b>를 누르십시오.<br>'
        + '글만 보내려면 아래 <b>글만 보내기</b>를 누르십시오.<br>'
        + '사원은 사원증의 <b>🎁</b> 단추에서 받습니다.</div>'
        + '<input type="text" id="gift-admin-title" placeholder="제목 (없어도 됩니다)"'
        + ' style="width:100%; margin-bottom:6px; font-size:11px;">'
        + '<textarea id="gift-admin-text" placeholder="내용" rows="3"'
        + ' style="width:100%; margin-bottom:7px; font-size:11px; resize:vertical;"></textarea>'
        + '<label style="display:flex; align-items:center; gap:6px; font-size:10px; color:#aaa; margin-bottom:8px;">'
        + '<input type="checkbox" id="gift-admin-all" style="width:auto; margin:0;"> 전 사원에게 보낸다</label>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;'
        + ' background:linear-gradient(145deg,#2e7d32,#1b5e20) !important; border-color:#4CAF50 !important;'
        + ' color:#fff !important;" onclick="giftAdminSend()">글만 보내기</button>'
        + '</div>');
}
setInterval(function () { try { paintAdmin(); } catch (e) { } }, 1200);

window.giftAdminSend = function () {
    const title = (document.getElementById('gift-admin-title') || {}).value || '';
    const text = (document.getElementById('gift-admin-text') || {}).value || '';
    if (!title.trim() && !text.trim()) { showCustomAlert('제목이나 내용을 적어 주세요.'); return; }

    const all = !!(document.getElementById('gift-admin-all') || {}).checked;
    let targets;
    if (all) {
        targets = Object.keys((typeof db !== 'undefined' && db.users) || {})
            .filter(function (c) { const u = db.users[c]; return u && u.name; });
    } else {
        targets = (typeof getAdminTargets === 'function') ? getAdminTargets() : [];
        if (!targets.length) { showCustomAlert('대상을 선택하거나 사번을 입력해주세요.\n\n전 사원에게 보내려면 아래 칸을 켜 주십시오.'); return; }
    }

    send(targets, { title: title, text: text }).then(function (n) {
        if (!n) { showCustomAlert('보내지 못했습니다.'); return; }
        clearAdminText();
        const box = document.getElementById('gift-admin-all');
        if (box) box.checked = false;
        showCustomAlert(n + '명의 선물함으로 보냈습니다.');
    });
};

// ==========================================
// 4. 사원 화면 — 사원증의 선물 상자 단추
// ==========================================
const BTN = 'gift-btn';
let mine = {};              // 번호 → 내용
let watching = '';
let known = null;           // 처음 받아 온 뒤부터 새것을 알린다
let opened = false;         // 선물함 창이 열려 있나 (받은 뒤 다시 그리려고)

let wRef = null, wCb = null;        // 뗄 때 같은 것을 넘겨야 확실히 떨어진다

(function watch() {
    setInterval(function () {
        const u = me(), d = db_();
        if (!u || !d) return;
        if (watching === u.code) return;
        if (wRef && wCb) { try { wRef.off('value', wCb); } catch (e) { } }
        wRef = null; wCb = null;
        watching = u.code; mine = {}; known = null;

        wCb = function (s) {
            const v = s.val() || {};
            const ids = Object.keys(v);
            if (known) {
                const fresh = ids.filter(function (k) { return known.indexOf(k) < 0; });
                if (fresh.length) tell(v[fresh[0]], fresh.length);
            }
            known = ids;
            mine = v;
            paintBtn();
            if (opened) paintList();            // 열어 둔 채로 새것이 오면 바로 보인다
        };
        wRef = d.ref(ROOT + '/' + u.code);
        wRef.on('value', wCb);
    }, 1500);
})();

function tell(g, n) {
    if (!g) return;
    const who = esc(g.byName || '당국');
    const what = itemPairs(g).length ? '물품' : '전할 말';
    setTimeout(function () {
        try {
            showCustomAlert('🎁 선물함에 ' + what + '이(가) 도착했습니다.\n\n'
                + who + ' 쪽에서 보냈습니다.'
                + (n > 1 ? '\n(모두 ' + n + '건)' : '')
                + '\n\n사원증의 🎁 단추에서 받으실 수 있습니다.');
        } catch (e) { }
    }, 900);
}

function count() { return Object.keys(mine || {}).length; }

// --- 단추 — 사원증 SERIAL NO. 왼쪽. 비어 있어도 늘 보인다 ---
function paintBtn() {
    const slot = document.getElementById('gift-slot');
    if (!slot) return;
    if (!me()) { slot.innerHTML = ''; return; }
    const n = count();
    const want = '<button id="' + BTN + '" onclick="openGiftBox()" title="선물함"'
        + ' style="position:relative; margin:0; padding:0; width:27px; height:23px; line-height:1;'
        + ' font-size:13px; font-family:inherit; border:1px solid #d4af37; border-radius:5px;'
        + ' background:rgba(212,175,55,0.10); color:#d4af37; cursor:pointer;'
        + ' display:flex; align-items:center; justify-content:center;">🎁'
        + (n ? '<span style="position:absolute; top:-6px; right:-6px; min-width:14px; height:14px;'
            + ' padding:0 3px; box-sizing:border-box; border-radius:7px; background:#e53935;'
            + ' color:#fff; font-size:9px; font-weight:bold; line-height:14px; text-align:center;'
            + ' box-shadow:0 0 0 1px rgba(0,0,0,0.5);">' + (n > 9 ? '9+' : n) + '</span>' : '')
        + '</button>';
    if (slot.innerHTML !== want) slot.innerHTML = want;
}
setInterval(function () { try { paintBtn(); } catch (e) { } }, 1200);

// --- 창 ---
function listHtml() {
    const ids = Object.keys(mine || {}).sort(function (a, b) {
        return (mine[a].at || 0) - (mine[b].at || 0);
    });
    if (!ids.length) {
        return '<div style="font-size:11px; color:#888; line-height:1.8; padding:18px 2px; text-align:center;">'
            + '선물함이 비어 있습니다.<br>상담사가 보낸 물품과 전할 말이 여기에 쌓입니다.</div>';
    }

    let h = '<div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">'
        + '받을 것 <b style="color:#d4af37;">' + ids.length + '</b>건. 받으면 소지품으로 들어가고'
        + ' 내용은 기록에 남습니다.</div>';

    ids.forEach(function (id) {
        const g = mine[id] || {};
        const pairs = itemPairs(g);
        h += '<div style="border:1px solid #d4af37; border-radius:6px; padding:11px; margin-bottom:8px;'
            + ' background:rgba(212,175,55,0.06);">'
            + '<div style="font-size:9px; color:#888; margin-bottom:6px;">'
            + esc(g.byName || '당국') + ' · ' + when(g.at) + '</div>';
        if (g.title) {
            h += '<div style="font-size:13px; color:#fff; font-weight:bold; margin-bottom:6px;">'
                + esc(g.title) + '</div>';
        }
        if (g.text) {
            h += '<div style="font-size:11px; color:#ddd; line-height:1.8; margin-bottom:8px;'
                + ' white-space:pre-wrap; word-break:break-word;">' + esc(g.text) + '</div>';
        }
        if (pairs.length) {
            h += '<div style="font-size:11px; color:#a5d6a7; line-height:1.8; margin-bottom:8px;">'
                + pairs.map(function (p) {
                    return '• ' + esc(p[0]) + (p[1] > 1 ? ' <b>×' + p[1] + '</b>' : '');
                }).join('<br>') + '</div>';
        }
        h += '<button class="game-btn" style="width:100%; margin:0; padding:9px; font-size:11px;"'
            + ' onclick="giftTake(\'' + id + '\')">'
            + (pairs.length ? '받는다' : '확인했다') + '</button></div>';
    });
    return h;
}

const TITLE = '🎁 선물함';
function paintList() {
    const body = document.getElementById('gear-modal-body');
    const box = document.getElementById('gear-modal');
    const ttl = document.getElementById('gear-modal-title');
    if (!body || !box || box.style.display === 'none') { opened = false; return; }
    // 같은 창을 장비·금고 쪽에서도 쓴다 — 선물함이 아니면 손대지 않는다
    if (!ttl || ttl.innerText !== TITLE) { opened = false; return; }
    const h = listHtml();
    if (body.innerHTML !== h) body.innerHTML = h;
}

window.openGiftBox = function () {
    if (typeof openGearModal === 'function') {
        openGearModal(TITLE, listHtml());
        opened = true;
        return;
    }
    // 창을 쓸 수 없으면 적어도 글로는 보여 준다
    showCustomAlert('선물함 — ' + count() + '건\n\n' + (count() ? '잠시 뒤에 다시 열어 주세요.' : '비어 있습니다.'));
};

// ==========================================
// 5. 받기 — 먼저 지운 쪽만 가져간다
// ==========================================
window.giftTake = function (id) {
    const u = me(), d = db_();
    if (!u || !d || !id) return;
    const path = ROOT + '/' + u.code + '/' + id;

    let got = null;
    tx(path, function (v) {
        got = v || null;
        return null;                       // 지운다 — 먼저 지운 쪽만 가져간다
    }).then(function (r) {
        if (!r || !r.committed || !got) return;
        const pairs = itemPairs(got);

        if (pairs.length) {
            if (!Array.isArray(u.inventory)) u.inventory = [];
            pairs.forEach(function (p) {
                for (let i = 0; i < p[1]; i++) u.inventory.push(p[0]);
            });
        }
        const line = pairs.length
            ? ('[선물함] ' + (got.byName || '당국') + ' 쪽에서 '
                + pairs.map(function (p) { return p[0] + (p[1] > 1 ? '×' + p[1] : ''); }).join(', ') + ' 을(를) 받았습니다.')
            : ('[선물함] ' + (got.byName || '당국') + ' 쪽의 전언 — '
                + (got.title ? got.title + ' : ' : '') + String(got.text || '').replace(/\s+/g, ' ').slice(0, 200));
        if (typeof addHistoryLog === 'function') addHistoryLog(u, line);
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
        if (typeof updateUI === 'function') { try { updateUI(); } catch (e) { } }

        delete mine[id];                       // 지켜보기가 알려 주기 전에 먼저 지운다
        try { paintBtn(); if (opened) paintList(); } catch (e) { }

        showCustomAlert(pairs.length
            ? ('받았습니다.\n\n' + pairs.map(function (p) { return p[0] + (p[1] > 1 ? ' ×' + p[1] : ''); }).join('\n'))
            : '확인했습니다.\n\n내용은 기록에 남았습니다.');
    }).catch(function (e) {
        console.error('[선물함] 받지 못했습니다', e);
        showCustomAlert('받지 못했습니다.\n\n잠시 뒤에 다시 해 주세요.');
    });
};

// ==========================================
// 확인
// ==========================================
window.giftState = function (who) {
    const u = me();
    if (!u) return;
    if (who && !isCounsel(u)) { console.warn('남의 것은 상담사만 볼 수 있습니다.'); return; }
    if (!who) {
        console.log('%c===== 🎁 내 선물함 =====', 'color:#d4af37; font-size:13px');
        const ids = Object.keys(mine || {});
        if (!ids.length) { console.log('  비어 있습니다.'); return; }
        console.table(ids.map(function (id) {
            const g = mine[id];
            return { 보낸이: g.byName || '-', 때: when(g.at), 제목: g.title || '-',
                     물품: itemPairs(g).map(function (p) { return p[0] + '×' + p[1]; }).join(', ') || '-' };
        }));
        return;
    }
    const c = findCode(who);
    if (!c) { console.warn('사원을 못 찾았습니다.'); return; }
    db_().ref(ROOT + '/' + c).once('value').then(function (s) {
        const v = s.val() || {};
        const ids = Object.keys(v);
        console.log('%c===== 🎁 ' + ((db.users[c] || {}).name || c) + ' 선물함 =====', 'color:#d4af37; font-size:13px');
        if (!ids.length) { console.log('  비어 있습니다. (다 받아 갔습니다)'); return; }
        console.table(ids.map(function (id) {
            const g = v[id];
            return { 보낸이: g.byName || '-', 때: when(g.at), 제목: g.title || '-',
                     물품: itemPairs(g).map(function (p) { return p[0] + '×' + p[1]; }).join(', ') || '-' };
        }));
    });
};

console.log('[선물함] 사원증 🎁 단추 — openGiftBox() · giftState(사번) · giftSend(사번,제목,내용) · giftSendItem(사번,물품,개수)');

})();
