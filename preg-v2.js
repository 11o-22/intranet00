// ==========================================
// ★ 임신 개편 — 돌보기 없애기 · 24시간 · 양쪽 5명 · 착정
// index.html 에서 preg-roster.js · preg-fix3.js 다음에 불러온다
// ==========================================
//
// 바뀌는 것
//   1. 돌보기를 통째로 걷어낸다. 아이템 5종도, 방치 벌칙도 없앤다.
//   2. 임신 기간 48시간 → 24시간.
//   3. 시키는 쪽도 동시에 5명까지만. 받는 쪽은 아버지 5명까지 (예전과 같다).
//   4. 좋은 물건이 나올 확률은 돌보기가 생기기 전 값으로 고정한다.
//   5. 착정 — 받는 쪽이 먼저 상대에게 청할 수 있다. 상대 동의가 필요하다.
//
// 기존 파일은 손대지 않고 감싸기만 한다.

(function pregV2() {

const PREG_H = 24;                 // 임신 기간
const MAX_SIRES = 5;               // 한 사람이 받을 수 있는 아버지 수
const MAX_LOAD = 5;                // 한 사람이 동시에 임신시킬 수 있는 인원

const CARE_ITEMS = {
    '미지근한 물수건': 400,
    '흔들의자':       900,
    '식지 않는 죽':   1500,
    '두꺼운 담요':    2600,
    '밤새 켜 둔 등':  5000
};

// ==========================================
// 1. 돌보기를 걷어낸다
// ==========================================
(function dropCare() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;

        // 상점·소지품 목록에서 뺀다
        Object.keys(CARE_ITEMS).forEach(function (n) { delete ITEM_CATALOG[n]; });

        // 좋은 물건 확률을 돌보기 생기기 전으로 고정
        if (typeof careFill === 'function' && !careFill._v2) {
            careFill = function () { return 0; };
            careFill._v2 = true;
        }

        // 방치 벌칙 — 상담실·선녀탕으로 보내지 않는다
        if (typeof checkPregNeglect === 'function' && !checkPregNeglect._v2) {
            checkPregNeglect = function () { };
            checkPregNeglect._v2 = true;
        }

        // 돌보기 창
        if (typeof openCarePanel === 'function' && !openCarePanel._v2) {
            openCarePanel = function () {
                showCustomAlert('돌보기는 없어졌습니다.\n\n이제 시간만 지나면 나옵니다.');
            };
            openCarePanel._v2 = true;
        }
        if (typeof doCare === 'function' && !doCare._v2) {
            doCare = function () { };
            doCare._v2 = true;
        }

        clearInterval(iv);
        console.log('[임신v2] 돌보기 제거 — 아이템 5종 · 방치 벌칙 · 확률 보정');
    }, 500);
})();

// ==========================================
// 2. 몇 명을 임신시켜 두었는가
// ==========================================
function sireLoad(code) {
    if (!code || typeof db === 'undefined' || !db.users) return 0;
    let n = 0;
    Object.keys(db.users).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.preg || !u.preg.sires || !u.preg.sires.length) return;
        if (u.preg.sires.some(function (s) { return s && s.code === code; })) n++;
    });
    return n;
}
window.sireLoad = sireLoad;

function sireNames(code) {
    const out = [];
    Object.keys(db.users || {}).forEach(function (c) {
        const u = db.users[c];
        if (!u || !u.preg || !u.preg.sires) return;
        if (u.preg.sires.some(function (s) { return s && s.code === code; })) out.push(u.name);
    });
    return out;
}

// ==========================================
// 3. 임신 기간 24시간 · 시키는 쪽 5명 제한
// ==========================================
function fixDue(t) {
    if (!t || !t.preg || !t.preg.sires || !t.preg.sires.length) return false;
    const start = t.preg.sires[0].at || Date.now();
    // ★ 📱 K·LEE 의 ⑥ 「오, 실물이 더 나으시네.」를 받았으면 절반으로 센다.
    //   안 그러면 여기서 「처음 시각 + 24시간」으로 도로 늘려 놓는다.
    const want = start + PREG_H * 3600000 - (t.preg.kleeHalf ? PREG_H * 1800000 : 0);
    if (Math.abs((t.preg.due || 0) - want) <= 60000) return false;
    t.preg.due = want;
    return true;
}

(function hookPregnancy() {
    const iv = setInterval(function () {
        if (typeof doPregnancy !== 'function' || typeof tryPregnancy !== 'function') return;
        if (doPregnancy._v2) { clearInterval(iv); return; }

        // 시도 단계에서 「내가 몇 명이나 임신시켜 뒀나」를 본다
        const _t = tryPregnancy;
        tryPregnancy = function (code) {
            const load = sireLoad(currentUser.code);
            if (load >= MAX_LOAD) {
                showCustomAlert('동시에 ' + MAX_LOAD + '명까지만 임신시킬 수 있습니다.\n\n'
                    + '지금 ' + load + '명 — ' + sireNames(currentUser.code).join(', ')
                    + '\n\n한 명이 낳으면 자리가 납니다.');
                return;
            }
            return _t.apply(this, arguments);
        };
        tryPregnancy._v2 = true;

        // 성사된 뒤 기간을 24시간으로 다시 잡는다
        const _d = doPregnancy;
        doPregnancy = function (code) {
            const t0 = db.users[code];
            const before = (t0 && t0.preg && t0.preg.sires) ? t0.preg.sires.length : 0;
            const r = _d.apply(this, arguments);
            const t = db.users[code];
            if (t && t.preg && t.preg.sires && t.preg.sires.length > before) {
                if (fixDue(t)) updateUserFields(code, { preg: t.preg });
            }
            return r;
        };
        doPregnancy._v2 = true;

        clearInterval(iv);
        console.log('[임신v2] 24시간 · 시키는 쪽 ' + MAX_LOAD + '명 제한 연결');
    }, 500);
})();

// 안내 문구에서 돌보기·방치 이야기를 지운다
(function fixAlert() {
    const iv = setInterval(function () {
        if (typeof showCustomAlert !== 'function') return;
        if (showCustomAlert._pregV2) { clearInterval(iv); return; }
        const _a = showCustomAlert;
        showCustomAlert = function (msg) {
            if (typeof msg === 'string' && msg.indexOf('돌볼 수 있습니다') >= 0) {
                msg = msg.split('\n\n하루')[0].replace(/\d+시간 뒤에 나옵니다/, PREG_H + '시간 뒤에 나옵니다');
            }
            return _a.apply(this, [msg].concat([].slice.call(arguments, 1)));
        };
        showCustomAlert._pregV2 = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 4. 착정 — 받는 쪽이 먼저 청한다
// ==========================================
//
// 기존 임신시키기와 섞이지 않도록 따로 된 길(milkAsk · milkGo)로 간다.
//
// 받을 수 있는 인원은 pregnancy.js 의 maxSires 가 센다.
// 리치맛 물약을 마신 쪽은 열 명까지다. (없으면 여기 MAX_SIRES 로 돈다)
function bearCap(u) {
    if (typeof maxSires === 'function') { try { return maxSires(u); } catch (e) { } }
    return MAX_SIRES;
}

function canMilk(t) {
    if (!currentUser || !t || t.code === currentUser.code) return false;
    if (typeof canBearNow === 'function' && !canBearNow(currentUser)) return false;
    if (typeof canSire === 'function' && !canSire(t)) return false;
    if (typeof sireCount === 'function' && sireCount(currentUser) >= bearCap(currentUser)) return false;
    // 같은 사람에게서 몇 번까지 받을 수 있나 — 리치맛 물약을 마셨으면 두 번
    {
        const p = (typeof pregOf === 'function') ? pregOf(currentUser) : null;
        const n = (p && p.sires) ? p.sires.filter(function (s) {
            return s && s.code === t.code;
        }).length : 0;
        const cap = (typeof mySireMax === 'function') ? mySireMax(currentUser) : 1;
        if (n >= cap) return false;
    }
    if (sireLoad(t.code) >= MAX_LOAD) return false;
    return true;
}

window.tryMilk = function (code) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const t = db.users[code];
    if (!t) return;
    if (!canMilk(t)) { showCustomAlert('지금은 할 수 없습니다.'); return; }
    if (!database) { showCustomAlert('서버 연결이 필요합니다.'); return; }

    const id = 'mk_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    database.ref('milkAsk/' + id).set({
        id: id, from: currentUser.code, fromName: currentUser.name,
        to: code, at: Date.now()
    });
    showCustomAlert(t.name + ' 사원에게 청했습니다.\n수락하면 진행됩니다.');
};

// 청을 받은 쪽
(function watchMilkAsk() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        database.ref('milkAsk').on('value', function (snap) {
            if (!currentUser) return;
            const v = snap.val() || {};
            const mine = Object.keys(v).map(function (k) { return v[k]; })
                .find(function (x) { return x && x.to === currentUser.code && Date.now() - x.at < 120000; });
            if (!mine) { closeMilkAsk(); return; }
            if (window._milkAskId === mine.id) return;
            window._milkAskId = mine.id;
            openMilkAsk(mine);
        });
    }, 1200);
})();

function openMilkAsk(ask) {
    if (!document.getElementById('milk-ask-overlay')) {
        document.body.insertAdjacentHTML('beforeend',
            '<div id="milk-ask-overlay" class="modal-overlay" style="display:none; z-index:10007;">'
            + '<div class="modal-content" style="max-width:360px; text-align:center; border-color:#6a4c93;">'
            + '<div style="font-size:28px; margin-bottom:10px;">🤍</div>'
            + '<div id="milk-ask-text" style="font-size:13px; color:#eee; line-height:1.9; margin-bottom:18px;"></div>'
            + '<div style="display:flex; gap:8px;">'
            + '<button class="btn-cancel" style="flex:1; background:#444; border-color:#555 !important;" onclick="rejectMilkAsk()">거절</button>'
            + '<button class="game-btn" style="flex:1; margin:0; padding:12px; background:linear-gradient(145deg,#6a4c93,#4a2c73) !important; border-color:#8a6cb3 !important; color:#fff !important;" onclick="acceptMilkAsk()">수락</button>'
            + '</div></div></div>');
    }
    const r = (typeof myRates === 'function') ? myRates(currentUser) : { sire: null };
    document.getElementById('milk-ask-text').innerHTML =
        '<b style="color:#c9a8ff;">' + ask.fromName + '</b> 사원이<br>당신에게서 받아 가려 합니다.<br><br>'
        + '<span style="font-size:11px; color:#888;">당신이 임신시킬 확률 '
        + '<b style="color:#ffd700;">' + (r.sire !== null ? r.sire + '%' : '-') + '</b></span>';
    document.getElementById('milk-ask-overlay').style.display = 'flex';
}

function closeMilkAsk() {
    const el = document.getElementById('milk-ask-overlay');
    if (el) el.style.display = 'none';
    window._milkAskId = null;
}

window.acceptMilkAsk = function () {
    const id = window._milkAskId;
    closeMilkAsk();
    if (!id || !database) return;
    database.ref('milkAsk/' + id).once('value').then(function (s) {
        const a = s.val();
        database.ref('milkAsk/' + id).remove();
        if (!a) return;
        // 판정은 받는 쪽(청한 사람)이 돌린다
        database.ref('milkGo/' + a.from).set({ sire: currentUser.code, at: Date.now() });
    });
};

window.rejectMilkAsk = function () {
    const id = window._milkAskId;
    closeMilkAsk();
    if (id && database) database.ref('milkAsk/' + id).remove();
};

// 수락 신호를 받으면 청한 쪽에서 판정
(function watchMilkGo() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database || !currentUser) return;
        clearInterval(iv);
        database.ref('milkGo/' + currentUser.code).on('value', function (s) {
            const v = s.val();
            if (!v || Date.now() - v.at > 60000) return;
            database.ref('milkGo/' + currentUser.code).remove();
            doMilk(v.sire);
        });
    }, 1500);
})();

// 실제 판정 — 나는 받는 쪽, sireCode 가 주는 쪽
function doMilk(sireCode) {
    const t = db.users[sireCode];
    if (!t) return;
    if (!canMilk(t)) { showCustomAlert('지금은 할 수 없는 상태가 되었습니다.'); return; }

    const sure = (typeof hasSureBear === 'function') ? hasSureBear(currentUser) : false;
    const flip = (typeof roleFlipped === 'function') ? roleFlipped : function () { return false; };
    const sR = flip(t) ? sireRateAlt(t) : sireRate(t);
    const bR = flip(currentUser) ? bearRateAlt(currentUser) : bearRate(currentUser);
    const chance = (sR / 100) * (bR / 100) * 6;

    if (!(sure || Math.random() < chance)) {
        addHistoryLog(currentUser, '[착정] ' + t.name + ' 사원 — 이번에는 되지 않았습니다.');
        saveFields({ history: 1 });
        showCustomAlert('이번에는 되지 않았습니다.');
        return;
    }

    const p = (typeof pregOf === 'function' ? pregOf(currentUser) : currentUser.preg)
        || { sires: [], due: Date.now() + PREG_H * 3600000, careAt: {} };
    if (!p.sires) p.sires = [];
    p.sires.push({ code: t.code, name: t.name, at: Date.now() });
    if (!p.careAt) p.careAt = {};
    currentUser.preg = p;
    fixDue(currentUser);

    if (typeof appendBadgeNoteToUser === 'function') {
        appendBadgeNoteToUser(currentUser, '[' + t.name + ' 사원에게서 받아 임신했습니다]');
    }
    addHistoryLog(currentUser, '[착정] ' + t.name + ' 사원에게서 받아 아이를 가졌습니다.');
    addHistoryLog(t, '[착정] ' + currentUser.name + ' 사원이 당신에게서 받아 갔습니다.');

    saveFields({ preg: 1, badge: 1, history: 1 });
    updateUserFields(t.code, { history: t.history });
    updateUI();

    if (typeof pregBroadcast === 'function') {
        pregBroadcast('<b style="color:#c9a8ff;">' + currentUser.name + '</b> 사원이 <b style="color:#c9a8ff;">'
            + t.name + '</b> 사원에게서 받아 갔습니다.');
    }
    showCustomAlert('받았습니다.' + (sure ? '\n(딸기맛 물약)' : '')
        + '\n\n' + t.name + ' 사원의 아이를 가졌습니다.\n' + PREG_H + '시간 뒤에 나옵니다.');
    if (typeof closeEmpDetailModal === 'function') closeEmpDetailModal();
}
window.doMilk = doMilk;

// ==========================================
// 5. 정보 열람 버튼 — 돌보기를 빼고 착정을 넣는다
// ==========================================
(function hookBtn() {
    const iv = setInterval(function () {
        if (typeof addPregBtn !== 'function') return;
        if (addPregBtn._v2) { clearInterval(iv); return; }

        const _a = addPregBtn;
        addPregBtn = function (code) {
            const r = _a.apply(this, arguments);
            try { reshape(code); } catch (e) { console.warn('[임신v2] 버튼 손질 건너뜀:', e && e.message); }
            return r;
        };
        addPregBtn._v2 = true;
        clearInterval(iv);
        console.log('[임신v2] 착정 버튼 연결');
    }, 500);
})();

function reshape(code) {
    const box = document.getElementById('preg-btn-box');
    if (!box || !currentUser) return;
    const t = db.users[code];
    if (!t) return;

    // 돌보기 버튼 제거
    box.querySelectorAll('button[onclick*="openCarePanel"]').forEach(function (b) { b.remove(); });

    // 내가 몇 명을 임신시켜 뒀는지 — 꽉 찼으면 알려 준다
    const load = sireLoad(currentUser.code);
    const doBtn = box.querySelector('#preg-do-btn');
    if (doBtn && load >= MAX_LOAD) {
        doBtn.disabled = true;
        doBtn.style.opacity = '0.4';
        doBtn.innerHTML = '이미 ' + load + '명 (최대 ' + MAX_LOAD + ')';
    }

    // 착정 버튼
    if (!box.querySelector('#milk-do-btn') && canMilk(t)) {
        box.insertAdjacentHTML('beforeend',
            '<button id="milk-do-btn" class="game-btn" style="width:100%; margin-top:8px; padding:11px;'
            + ' background:linear-gradient(145deg,#4a2c73,#2d1a47) !important; border-color:#8a6cb3 !important;'
            + ' color:#fff !important;" onclick="tryMilk(\'' + code + '\')">'
            + '착정한다 <span style="font-size:10px; color:#ffd76a;">(동의 필요)</span></button>');
    }
}

// ==========================================
// 6. 명부에서 돌봄·방치 자리를 뺀다
// ==========================================
(function hookRoster() {
    const iv = setInterval(function () {
        if (typeof renderPregRoster !== 'function') return;
        if (renderPregRoster._v2) { clearInterval(iv); return; }
        const _r = renderPregRoster;
        renderPregRoster = function () {
            const out = _r.apply(this, arguments);
            try {
                document.querySelectorAll('button[onclick*="openCarePanel"]').forEach(function (b) { b.remove(); });
                document.querySelectorAll('span').forEach(function (s) {
                    const t = s.innerText || '';
                    if (t.indexOf('방치') >= 0) s.remove();
                });
            } catch (e) { }
            return out;
        };
        renderPregRoster._v2 = true;
        clearInterval(iv);
    }, 500);
})();

// ==========================================
// 상담사용 — 한 번만 돌리는 정리 작업
// ==========================================

// 돌보기 아이템을 거두고 산 값만큼 돌려준다
window.pregRefundAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!database) { console.warn('서버에 닿지 못했습니다.'); return; }

    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {};
        const rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            const inv = Array.isArray(u.inventory) ? u.inventory.slice() : [];
            if (!inv.length) return;
            let back = 0, cnt = 0;
            const kept = inv.filter(function (n) {
                if (CARE_ITEMS[n] === undefined) return true;
                back += CARE_ITEMS[n]; cnt++;
                return false;
            });
            if (!cnt) return;
            up['users/' + c + '/inventory'] = kept;
            up['users/' + c + '/points'] = Math.min(30000000, (u.points || 0) + back);
            rows.push({ 사원: u.name, 거둔개수: cnt, 돌려준포인트: back.toLocaleString() });
        });
        if (!rows.length) { console.log('돌보기 아이템을 가진 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ 돌보기 아이템 환불 완료', 'color:#4CAF50');
            console.table(rows);
        });
    }).catch(function (e) { console.error('실패:', e); });
};

// 지금 임신 중인 사람을 전부 출산 대기로 만든다 (각자 창에서 1분 안에 나온다)
window.pregFlushAll = function () {
    if (!currentUser || currentUser.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!database) { console.warn('서버에 닿지 못했습니다.'); return; }

    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {};
        const rows = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            const p = u.preg;
            if (!p || !p.sires || !p.sires.length) return;
            up['users/' + c + '/preg/due'] = Date.now() - 1000;
            up['users/' + c + '/_birthing'] = null;
            up['users/' + c + '/_birthAt'] = null;
            rows.push({ 사원: u.name, 아버지: p.sires.length });
        });
        if (!rows.length) { console.log('임신 중인 사원이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ ' + rows.length + '명을 출산 대기로 바꿨습니다.', 'color:#4CAF50');
            console.table(rows);
            console.log('  각자 접속해 있으면 1분 안에 나옵니다. 꺼져 있으면 다음 접속 때 나옵니다.');
        });
    }).catch(function (e) { console.error('실패:', e); });
};

// ==========================================
// 확인
// ==========================================
window.pregV2State = function () {
    console.log('%c===== 임신 v2 =====', 'color:#ff8fb1; font-size:13px');
    console.log('  기간:', PREG_H + '시간 · 아버지 최대', MAX_SIRES, '· 동시에 임신시키기 최대', MAX_LOAD);
    if (currentUser) {
        console.log('  내가 받을 수 있는 인원:', bearCap(currentUser) + '명',
            (typeof hasLychee === 'function' && hasLychee(currentUser)) ? '(리치맛 물약)' : '');
    }
    console.log('  돌보기 아이템 남아 있나:',
        Object.keys(CARE_ITEMS).filter(function (n) { return ITEM_CATALOG[n]; }).join(', ') || '없음 (정상)');
    console.log('  careFill 고정:', (typeof careFill === 'function' && careFill._v2) ? 'O' : '✗');
    console.log('  방치 벌칙 해제:', (typeof checkPregNeglect === 'function' && checkPregNeglect._v2) ? 'O' : '✗');
    console.log('  24시간·5명 연결:', (typeof doPregnancy === 'function' && doPregnancy._v2) ? 'O' : '✗');
    console.log('  착정 버튼 연결:', (typeof addPregBtn === 'function' && addPregBtn._v2) ? 'O' : '✗');
    console.log('');
    console.log('  내가 임신시켜 둔 사람:', sireLoad(currentUser.code) + '명',
        sireNames(currentUser.code).join(', ') || '');
    const p = (typeof pregOf === 'function') ? pregOf(currentUser) : null;
    if (p && p.sires && p.sires.length) {
        console.log('  내 임신 — 아버지', p.sires.length + '명:',
            p.sires.map(function (x) { return x.name; }).join(', '));
        console.log('  출산까지:', Math.max(0, Math.round((p.due - Date.now()) / 60000)) + '분');
    } else {
        console.log('  내 임신: 없음');
    }
};

console.log('[임신v2] pregV2State() · pregRefundAll() · pregFlushAll()');

})();