// ==========================================
// 🔒 여정 가두리에서 나가는 길 — 격리와 같이 통하게 (2026-10-30 사용자)
// bundles.json 마지막 묶음 맨 끝 — gaduri.js · plaza.js · plea.js · foxtail.js · eliteb.js 보다 뒤
// ==========================================
//
// ■ 왜
//
//   🐾 여정에서 펫 대신 맞은 주인은 한 시간 광장 가두리에 갇힌다 (journey.js · gaduri/<방>/<사번> by 'journey').
//   격리(상담실 · 선녀탕)가 아니라서 호가호위 「금제를 푼다」 · 카세트테이프 · 탄원서가 안 통했고,
//   점검표(Morpho 10.30 01:23)에 올라왔다. 사용자가 「격리와 같이 통하게」로 정했다 — 가두리는 그대로 두고 나갈 길만 연다.
//
// ■ 무엇을
//
//   cageTimedOf(사번)   여정 가두리에 갇혀 있으면 그 기록 (until 이 남은 것만) · 아니면 null
//   cageRelease(사번)   가두리 문을 연다 (gaduri/<방>/<사번> 을 지운다) → Promise<bool>
//
//   · 호가호위 「금제를 푼다」 — foxtail.js 가 cageTimedOf 를 보고 단추를 띄우고 cageRelease 로 연다 (연등 하나)
//   · 카세트테이프 — eliteb.js tapeMenu · tapeFree 가 함께 탐사한 사람이 가두리에 있어도 풀어 준다 (사람마다 하루 한 번)
//   · 탄원서 — 가두리 위에 📜 단추 (갇힌 본인에게만). pleas/<사번> 에 where 'cage' 로 낸다.
//       상담사 탄원 칸(plea.js)에 같이 뜨고, 「내보냄」 · 「-n시간」은 가두리 문을 열고 「반려」는 그대로.
//       답이 오면 plea.js 의 감시가 알린다 (나가셔도 좋습니다 / 반려).
//
// ■ 콘솔
//   cagePleaState()

(function cageEscape() {
'use strict';

const ADMIN = 'kario0987';
const PLEA_COOL = 30 * 60000;
const PLEA_MAX = 300;

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); else console.log(m); } catch (e) { } }
function log_(u, t) { try { if (typeof addHistoryLog === 'function') addHistoryLog(u, t); } catch (e) { } }

function entry(code) { try { return (typeof window.gaduriEntry === 'function') ? window.gaduriEntry(code) : null; } catch (e) { return null; } }
function timed(code) {
    const e = entry(code);
    return (e && e.by === 'journey' && Number(e.until) > Date.now()) ? e : null;
}
window.cageTimedOf = timed;
window.cageRelease = function (code) {
    const d = db_(), e = entry(code);
    if (!d || !e) return Promise.resolve(false);
    return d.ref('gaduri/' + e.room + '/' + code).remove().then(function () { return true; }).catch(function (err) { console.warn('[가두리] 문 열기 실패', err && err.message); return false; });
};
function leftMin(e) { return Math.max(1, Math.ceil((Number(e.until) - Date.now()) / 60000)); }

// ==========================================
// 탄원서 — 갇힌 본인 (가두리 위 📜 단추)
// ==========================================
let myPlea = null;
(function watchMine() {
    let on = '';
    setInterval(function () {
        const me = u_(), d = db_();
        if (!me || !d || on === me.code) return;
        on = me.code;
        d.ref('pleas/' + me.code).on('value', function (s) { myPlea = s.val(); });
    }, 1500);
})();

window.cagePleaWrite = function () {
    const me = u_(), d = db_();
    if (!me || !d) return;
    const e = timed(me.code);
    if (!e) { alert_('지금은 낼 수 없습니다.'); return; }
    if (myPlea && myPlea.state === 'PENDING' && Date.now() - (myPlea.at || 0) < 24 * 3600000) { alert_('이미 낸 탄원서가 처리되지 않았습니다.'); return; }
    if (myPlea && myPlea.decidedAt && Date.now() - myPlea.decidedAt < PLEA_COOL) {
        alert_('아직 ' + Math.ceil((PLEA_COOL - (Date.now() - myPlea.decidedAt)) / 60000) + '분 남았습니다.'); return;
    }
    if (typeof openTextInput !== 'function') return;
    openTextInput('탄원서',
        '상담사에게 보낼 글입니다.<br><span style="color:#888; font-size:10px;">여정에서 펫 대신 맞아 가두리에서 쉬는 중입니다. 사정을 적으면 읽고 내보내 줄 수 있습니다. (최대 ' + PLEA_MAX + '자)</span>',
        '예: 맡은 일이 남아 있습니다',
        function (text) {
            const fld = document.getElementById('text-input-field');
            if (fld) fld.setAttribute('maxlength', 30);
            const e2 = timed(me.code);
            d.ref('pleas/' + me.code).set({
                code: me.code, name: me.name, no: me.no,
                text: String(text).slice(0, PLEA_MAX),
                where: 'cage', cage: 'journey',
                pollution: me.pollution || 0,
                remainH: e2 ? Math.round(leftMin(e2) / 60 * 10) / 10 : 0,
                remainMin: e2 ? leftMin(e2) : 0,
                state: 'PENDING', at: Date.now()
            }).then(function () {
                log_(me, '[탄원서] 가두리에서 탄원서를 냈습니다.');
                try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (err) { }
                alert_('탄원서를 냈습니다.\n\n답을 기다려 주세요.');
            }).catch(function (err) { console.error('탄원 실패:', err); alert_('접수 중 오류가 발생했습니다.'); });
        });
    const fld = document.getElementById('text-input-field');
    if (fld) fld.setAttribute('maxlength', PLEA_MAX);
};

// 가두리 위 단추 — 먹이 던지기 단추 자리에 (갇힌 사람에게는 먹이 단추가 숨어 있다)
setInterval(function () {
    const me = u_();
    const old = document.querySelector('.plaza-plea-btn');
    const e = me ? timed(me.code) : null;
    const feed = document.querySelector('.plaza-feed-btn');
    if (!e || !feed || !feed.parentNode) { if (old) old.remove(); return; }
    const pending = !!(myPlea && myPlea.state === 'PENDING' && Date.now() - (myPlea.at || 0) < 24 * 3600000);
    let b = old;
    if (!b || b.parentNode !== feed.parentNode) {
        if (b) b.remove();
        b = document.createElement('div');
        b.className = 'plaza-spot plaza-plea-btn';
        b.addEventListener('pointerdown', function (ev) { ev.preventDefault(); ev.stopPropagation(); });
        b.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); window.cagePleaWrite(); });
        feed.parentNode.appendChild(b);
    }
    if (b.style.left !== feed.style.left) b.style.left = feed.style.left;
    if (b.style.top !== feed.style.top) b.style.top = feed.style.top;
    const html = '<div class="b" style="width:38px;height:38px;font-size:18px;">📜</div><div class="t">' + (pending ? '탄원서 접수됨' : '탄원서') + '</div>';
    if (b.innerHTML !== html) b.innerHTML = html;
}, 1000);

// ==========================================
// 상담사 — 탄원 칸에서 가두리 탄원을 가려서 처리한다
// ==========================================
let pleas = {};
(function watchAll() {
    let on = false;
    setInterval(function () {
        const me = u_(), d = db_();
        if (on || !me || me.code !== ADMIN || !d) return;
        on = true;
        d.ref('pleas').on('value', function (s) { pleas = s.val() || {}; try { relabel(); } catch (e) { } });
    }, 1500);
})();
// 줄 머리 — 「🦊 여우 상담실 · 오염도 … · 남은 격리 0.0시간」 → 「🔒 여정 가두리 · 남은 n분」, 줄이는 단추는 감춘다
function relabel() {
    const box = document.getElementById('admin-plea-list');
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('button[onclick^="pleaDecide("]'), function (btn) {
        const m = /pleaDecide\('([^']+)'/.exec(btn.getAttribute('onclick') || '');
        if (!m) return;
        const v = pleas[m[1]];
        if (!v || v.where !== 'cage') return;
        const row = btn.closest('div[style*="border-radius:6px"]') || btn.parentNode.parentNode;
        if (!row || row._cageDone) return;
        row._cageDone = true;
        const u = users()[m[1]];
        const e = u ? timed(u.code) : null;
        Array.prototype.forEach.call(row.querySelectorAll('div'), function (dv) {
            if (dv.children.length === 0 && /여우 상담실|선녀탕/.test(dv.textContent) && /남은 격리/.test(dv.textContent)) {
                dv.textContent = '🔒 여정 가두리 (펫 대신 맞음) · ' + (e ? '남은 ' + leftMin(e) + '분' : '이미 풀렸다');
                dv.style.color = '#c9b8ff';
            }
        });
        Array.prototype.forEach.call(row.querySelectorAll('button[onclick*="\'CUT\'"]'), function (b2) { b2.style.display = 'none'; });
    });
}
(function watchList() {
    let mo = null;
    setInterval(function () {
        const box = document.getElementById('admin-plea-list');
        if (!box || mo) return;
        mo = new MutationObserver(function () { try { relabel(); } catch (e) { } });
        mo.observe(box, { childList: true, subtree: true });
        try { relabel(); } catch (e) { }
    }, 1500);
})();
// 결정 — 가두리 탄원이면 문을 열거나(내보냄 · 줄임) 반려만 한다
(function hookDecide() {
    const iv = setInterval(function () {
        if (typeof window.pleaDecide !== 'function' || window.pleaDecide._cage) return;
        const _o = window.pleaDecide;
        const w = function (code, kind, hours) {
            const v = pleas[code];
            if (!v || v.where !== 'cage') return _o.apply(this, arguments);
            const me = u_(), d = db_();
            if (!me || !d) return;
            const u = users()[code];
            const finish = function (memo) {
                const out = kind !== 'NO';
                const patch = { state: out ? 'OUT' : 'NO', cut: 0, memo: memo || '', by: me.name, decidedAt: Date.now() };
                const tmp = { history: (u && Array.isArray(u.history)) ? u.history.slice() : [] };
                log_(tmp, out ? '[탄원] 받아들여져 가두리에서 풀려났습니다.' : '[탄원] 반려되었습니다.');
                try { if (typeof updateUserFields === 'function') updateUserFields(code, { history: tmp.history }); } catch (e) { }
                const p = out ? window.cageRelease(code) : Promise.resolve(true);
                p.then(function () { return d.ref('pleas/' + code).update(patch); }).then(function () {
                    alert_(((u && u.name) || code) + ' 사원 — ' + (out ? '가두리에서 내보냈습니다.' : '반려했습니다.'));
                    try { if (typeof renderPleaList === 'function') renderPleaList(); } catch (e) { }
                }).catch(function (e) { console.error('[가두리 탄원]', e); alert_('처리 중 오류가 났습니다.'); });
            };
            if (typeof openTextInput === 'function') {
                openTextInput('한마디', '사원에게 함께 전할 말입니다.<br><span style="color:#888; font-size:10px;">비워도 됩니다.</span>',
                    kind === 'NO' ? '예: 조금 더 쉬셔야 합니다' : '예: 다음부터는 조심하세요', finish);
            } else finish('');
        };
        w._cage = true;
        window.pleaDecide = w;
        try { pleaDecide = w; } catch (e) { }
        clearInterval(iv);
    }, 600);
    setTimeout(function () { clearInterval(iv); }, 120000);
})();

window.cagePleaState = function () {
    const me = u_();
    console.log('%c===== 🔒 가두리 탄원 =====', 'color:#c9b8ff; font-size:13px');
    console.log('  내 가두리:', me ? JSON.stringify(timed(me.code)) : '-');
    console.log('  내 탄원:', JSON.stringify(myPlea));
    if (me && me.code === ADMIN) console.table(Object.keys(pleas).filter(function (c) { return pleas[c] && pleas[c].where === 'cage'; }).map(function (c) { const v = pleas[c]; return { 사원: v.name, 상태: v.state, 남은분: v.remainMin, 글: (v.text || '').slice(0, 30) }; }));
};

console.log('[가두리] 여정 가두리 — 금제를 푼다 · 카세트테이프 · 탄원서로 나간다');
})();
