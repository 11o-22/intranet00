// ==========================================
// ★ 📺 브라운의 심야 토크 쇼 — 🎬 피날레 (2026-10-30 사용자)
// bundles.json 마지막 묶음 맨 끝 — talkshow.js · cage-escape.js 보다 뒤
// ==========================================
//
// ■ 무엇인가
//
//   「📺 브라운의 심야 토크 쇼」를 찬 사원의 장착칸에 [🎬 피날레] 단추가 붙는다.
//   누르면 **사택 감금실**에 갇힌 사원이 죽 뜬다.
//   (2026-10-31 사용자: 커스텀 장비는 남의 상담실 · 선녀탕 · 가두리에 관여하지 못하고 갇힌 본인만 나올 수 있다. 🎐 여우 신도만 예외
//    → 처음엔 여우 상담실 · 선녀탕 · 입원 · 가두리 · 사택 감금실을 다 꺼냈으나, 가두리 · 상담실 · 선녀탕 · 입원은 뺐다.) 고르면
//       『 당신의 쇼는 여기서 끝났습니까? 』
//   팝업이 뜬다. 「끝났다 — 꺼낸다」를 누르면 그 사원이 **무슨 조건이든 막히는 일 없이** 풀려난다 (2026-10-30 사용자 · 오염도는 50 을 넘지 않게).
//   **횟수 제한이 없다** — 초대의 「사원당 하루 한 번」과는 다른 길이다.
//
//   풀려난 사원의 화면에도 같은 문구가 팝업으로 뜬다 (talkFinale/<사번> 을 보고 · 접속해 있지 않으면 들어올 때).
//
// ■ 적히는 자리
//   users/<사번>  격리 칸 (quarantineUntil … · tapeFree 와 같은 묶음)
//   talkFinale/<사번> = { by, name, at }   풀려난 사원에게 띄울 팝업 (보고 나면 지운다)
//
// ■ 콘솔
//   showFinaleState()

(function showFinale() {
'use strict';

const SHOW = '📺 브라운의 심야 토크 쇼';
const LINE = '당신의 쇼는 여기서 끝났습니까?';
const OUT_POLL = 50;
const ID = 'show-finale-btn';
const MOD = 'show-finale-modal';
const NODE = 'talkFinale';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined' && database) ? database : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function baseOf(w) { try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); } catch (e) { return String(w || ''); } }
function wears(u) { return !!(u && Array.isArray(u.equippedWeapons) && u.equippedWeapons.some(function (w) { return baseOf(w) === SHOW; })); }
function qLocked(u) { return !!(u && Number(u.quarantineUntil) > Date.now()); }
function gEntry(code) { try { return (typeof window.gaduriEntry === 'function') ? window.gaduriEntry(code) : null; } catch (e) { return null; } }
function cCaged(u) { try { return !!(u && typeof window.isCaged === 'function' && window.isCaged(u)); } catch (e) { return false; } }
// 상담실 · 선녀탕 · 입원 · 가두리는 갇힌 본인만 나올 수 있다 (2026-10-31 사용자 — 커스텀 장비는 남의 그 자리에 관여하지 못함 · 🎐 여우 신도만 예외).
//   피날레는 사택 감금실만 꺼낸다.
function locked(u) { return !!(u && cCaged(u)); }
function leftH(u) { return Math.max(0.1, Math.round((Number(u.quarantineUntil) - Date.now()) / 360000) / 10); }
// 어디에 갇혔나 — 여러 곳이면 다 적는다
function where(u) {
    const out = [];
    if (qLocked(u)) out.push((u.quarantineHospital ? '🏥 입원 · ' : '') + ((u.quarantineDest || 'fox') === 'bath' ? '♨ 선녀탕' : '🦊 여우 상담실') + ' · ' + leftH(u) + '시간 — 본인만 나올 수 있음');
    const g = gEntry(u.code);
    if (g) {
        const by = g.auto ? '격리' : g.by === 'journey' ? '여정' : g.by === 'petbt' ? '펫 배틀' : g.by === 'foxd' ? '여우 신도' : '상담사';
        const lock = (g.by === 'journey' && typeof window.cageLockLeft === 'function') ? window.cageLockLeft(u.code) : -1;
        if (!g.auto) out.push('🔒 ' + ((window.GADURI_NAMES && window.GADURI_NAMES[g.room]) || (g.room === 'dream' ? '백일몽' : '광장')) + ' 가두리 (' + by + (Number(g.until) > Date.now() ? ' · ' + Math.max(1, Math.ceil((Number(g.until) - Date.now()) / 60000)) + '분' : '') + (lock > 0 ? ' · 잠김 ' + lock + '분' : '') + ' — 본인만 나올 수 있음)');
    }
    if (cCaged(u)) out.push('🚪 사택 감금실');
    return out.join(' · ') || '갇힌 곳 없음';
}

// ==========================================
// 장착칸의 [🎬 피날레] 단추
// ==========================================
(function stickBtn() {
    function stick() {
        const host = document.getElementById('inventory-list-container');
        if (!host) return;
        const old = document.getElementById(ID);
        if (!wears(u_())) { if (old) old.remove(); return; }
        if (old && old.isConnected) return;
        let card = null;
        for (let i = 0; i < host.children.length; i++) {
            const t = host.children[i].textContent || '';
            if (t.indexOf('[장착 중 슬롯') >= 0 && t.indexOf(SHOW) >= 0) { card = host.children[i]; break; }
        }
        if (!card) return;
        const row = card.querySelector('div'); if (!row) return;
        const b = document.createElement('button');
        b.id = ID; b.className = 'game-btn';
        b.style.cssText = 'margin:0 0 0 6px; padding:6px 10px; font-size:11px; flex-shrink:0; background:linear-gradient(145deg,#6a4a22,#2a1b0e) !important; border-color:#c79a5b !important; color:#f3e6d2 !important;';
        b.textContent = '🎬 피날레';
        b.onclick = window.showFinaleMenu;
        row.appendChild(b);
    }
    (function wrap() {
        const iv = setInterval(function () {
            if (typeof renderInventory !== 'function') return;
            if (renderInventory._finale) { clearInterval(iv); return; }
            const _r = renderInventory;
            renderInventory = function () { const r = _r.apply(this, arguments); try { stick(); } catch (e) { } return r; };
            renderInventory._finale = true;
            clearInterval(iv);
        }, 400);
    })();
    (function watch() {
        const iv = setInterval(function () {
            const el = document.getElementById('inventory-list-container');
            if (!el) return;
            clearInterval(iv);
            try { new MutationObserver(function () { try { stick(); } catch (e) { } }).observe(el, { childList: true }); } catch (e) { }
            stick();
        }, 400);
    })();
    setInterval(function () { try { stick(); } catch (e) { } }, 2500);
})();

// ==========================================
// 창 — 갇힌 사원 목록 → 『 당신의 쇼는 여기서 끝났습니까? 』
// ==========================================
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:99999999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.86); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#2a1b0e,#0f0904); border:1px solid #c79a5b; border-radius:10px; padding:14px; width:100%; max-width:430px; max-height:88dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;">' + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
function lockedList() {
    const me = u_(), book = users();
    return Object.keys(book).filter(function (c) { const x = book[c]; return x && c !== (me && me.code) && locked(x); })
        .sort(function (a, b) { return String(book[a].name || a).localeCompare(String(book[b].name || b), 'ko'); });
}
window.showFinaleMenu = function () {
    const me = u_();
    if (!me || !wears(me)) { alert_(SHOW + ' 를 차고 있어야 합니다.'); return; }
    const book = users();
    const list = lockedList();
    const rows = list.map(function (c) {
        const x = book[c];
        return '<div style="display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1; min-width:0; font-size:11.5px; color:#f3e6d2;">' + esc(x.name || c) + ' <span style="font-size:9.5px; color:#a88d6a;">· ' + where(x) + '</span></div>'
            + '<button class="game-btn sf-pick" data-c="' + esc(c) + '" style="flex:0 0 auto; margin:0; padding:7px 10px; font-size:10px; background:linear-gradient(145deg,#6a4a22,#2a1b0e) !important; border-color:#c79a5b !important; color:#f3e6d2 !important;">피날레</button></div>';
    }).join('');
    const w = box('<div style="font-size:13px; color:#f3e6d2; font-weight:bold; margin-bottom:4px;">🎬 피날레 — ' + SHOW.replace('📺 ', '') + '</div>'
        + '<div style="font-size:10px; color:#a88d6a; margin-bottom:11px; line-height:1.6;">사택 감금실에 갇힌 사원을 무대로 불러내 쇼를 끝냅니다. 막히는 조건이 없고, 횟수 제한도 없습니다. 여우 상담실 · 선녀탕 · 입원 · 가두리는 갇힌 본인만 나올 수 있어 불러내지 못합니다.</div>'
        + (rows || '<div style="font-size:10.5px; color:#a88d6a; padding:6px 0;">지금 갇힌 사원이 없습니다.</div>')
        + '<button id="sf-x" class="game-btn" style="width:100%; margin:10px 0 0 0; padding:11px; font-size:12px; background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">닫는다</button>');
    w.querySelector('#sf-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.sf-pick'), function (b) { b.onclick = function () { ask(b.dataset.c); }; });
};
function ask(code) {
    const x = users()[code];
    if (!x) { alert_('사원을 찾지 못했습니다.'); return; }
    if (!locked(x)) { alert_((x.name || code) + ' 사원은 지금 갇혀 있지 않습니다.'); window.showFinaleMenu(); return; }
    const w = box('<div style="text-align:center; padding:12px 4px 4px;">'
        + '<div style="font-size:30px; margin-bottom:10px; text-shadow:0 0 14px rgba(199,154,91,.8);">📺</div>'
        + '<div style="font-size:16px; letter-spacing:2px; color:#f3e6d2; line-height:1.8; font-family:\'Nanum Myeongjo\',\'Noto Serif KR\',serif; text-shadow:0 0 10px rgba(199,154,91,.6);">『 ' + esc(LINE) + ' 』</div>'
        + '<div style="font-size:11px; color:#a88d6a; margin-top:12px; line-height:1.7;">' + esc(x.name || code) + ' 사원 — ' + where(x) + '<br>끝났다고 하면 지금 사택 감금실에서 무대로 불러냅니다.</div>'
        + '</div>'
        + '<div style="display:flex; gap:8px; margin-top:16px;">'
        + '<button id="sf-no" class="game-btn" style="flex:1; margin:0; padding:11px; font-size:12px; background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;">아직이다</button>'
        + '<button id="sf-yes" class="game-btn" style="flex:1; margin:0; padding:11px; font-size:12px; background:linear-gradient(145deg,#c79a5b,#6a4a22) !important; border-color:#f3e6d2 !important; color:#1a1008 !important; font-weight:bold;">끝났다 — 꺼낸다</button>'
        + '</div>');
    w.querySelector('#sf-no').onclick = function () { window.showFinaleMenu(); };
    w.querySelector('#sf-yes').onclick = function () { free(code); };
}
function free(code) {
    const me = u_(), d = db_(), x = users()[code];
    if (!me || !x) return;
    const was = '🚪 사택 감금실';     // 2026-10-31 — 피날레가 여는 곳은 여기뿐
    const f = {};
    let out = null;
    // ① 상담실 · 선녀탕 · 입원 — 2026-10-31 사용자: 남의 격리는 건드리지 않는다 (갇힌 본인만 나올 수 있음)
    if (false && qLocked(x)) {
        out = Math.min(OUT_POLL, Number(x.pollution) || 0);
        Object.assign(f, { quarantineUntil: 0, quarantineDest: null, quarantineHospital: false, quarantineExitPollution: 0,
                           pollution: out, lastPollutionTime: Date.now(), foxRoomAnswered: false });
        if (x.badge && typeof x.badge.notes === 'string') {
            const arr = x.badge.notes.split(' | ').filter(function (n) { return n.trim() !== '' && !/의식 불명|긴급 이송|사직 반려/.test(n); });
            f.badge = Object.assign({}, x.badge, { notes: arr.length ? arr.join(' | ') : '특이사항 없음' });
        }
    }
    // ② 가두리 — 격리에 딸려 생긴 것(auto)만 함께 지운다. 진짜 가두리(여정 · 펫 배틀 · 여우 신도 · 상담사)는 건드리지 않는다
    //   (2026-10-31 사용자 — 남의 가두리에 관여하는 능력은 허용하지 않음)
    //   같은 날 뒤이어 — 격리도 건드리지 않으므로 격리에 딸린 가두리(auto)도 그대로 둔다
    const tmp = { history: Array.isArray(x.history) ? x.history.slice() : [] };
    try { addHistoryLog(tmp, '[토크쇼] 🎬 피날레 — ' + (me.name || me.code) + ' 사회자가 무대로 불러냈습니다. 「' + LINE + '」 (' + was + (out != null ? ' · 오염도 ' + out + '%' : '') + ')'); } catch (e) { }
    f.history = tmp.history;
    Object.keys(f).forEach(function (k) { x[k] = f[k]; });
    try { if (typeof updateUserFields === 'function') updateUserFields(code, f); } catch (e) { }
    // ③ 사택 감금실 — cage.js 가 정산까지 하고 지운다
    if (cCaged(x)) { try { if (typeof window.cageFreeUser === 'function') window.cageFreeUser(x, '🎬 피날레 — ' + (me.name || me.code) + ' 사회자가 무대로 불러냈습니다.'); } catch (e) { } }
    if (d) { try { d.ref(NODE + '/' + code).set({ by: me.code, name: me.name || me.code, at: Date.now(), was: was }); } catch (e) { } }
    try { addHistoryLog(me, '[토크쇼] 🎬 피날레 — ' + (x.name || code) + ' 사원을 불러냈습니다 (' + was + ').'); if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    shut();
    alert_('🎬 피날레\n\n' + (x.name || code) + ' 사원의 쇼가 끝났습니다.\n' + was + ' → 무대로 불러냈습니다.' + (out != null ? ' (오염도 ' + out + '%)' : ''));
}

// ==========================================
// 풀려난 사원 쪽 — 팝업
// ==========================================
(function watchMine() {
    let on = '';
    setInterval(function () {
        const me = u_(), d = db_();
        if (!me || !d || on === me.code) return;
        on = me.code;
        d.ref(NODE + '/' + me.code).on('value', function (s) {
            const v = s.val();
            if (!v || !v.at) return;
            if (Date.now() - Number(v.at) > 3 * 24 * 3600000) { try { d.ref(NODE + '/' + me.code).remove(); } catch (e) { } return; }
            // 2026-10-31 — 피날레는 사택 감금실만 연다. 격리 칸은 손대지 않는다 (감금실은 서버 기록이 지워지며 제 화면이 알아서 푼다)
            try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }
            alert_('📺 『 ' + LINE + ' 』\n\n' + (v.name || v.by) + ' 사회자가 당신을 무대로 불러냈습니다.\n쇼는 여기서 끝났습니다 — 감금실에서 풀려났습니다.');
            try { d.ref(NODE + '/' + me.code).remove(); } catch (e) { }
        });
    }, 1500);
})();

window.showFinaleState = function () {
    const me = u_();
    console.log('%c===== 🎬 피날레 — ' + SHOW + ' =====', 'color:#c79a5b; font-size:13px');
    console.log('  차고 있나: ' + (wears(me) ? '예' : '아니오') + ' · 단추: ' + (document.getElementById(ID) ? '있음' : '없음'));
    const book = users();
    console.table(lockedList().map(function (c) { const x = book[c]; return { 사원: x.name || c, 어디: where(x) }; }));
};

console.log('[토크쇼] 🎬 피날레 — 사택 감금실에 갇힌 사원을 무대로 불러낸다 (상담실 · 선녀탕 · 가두리는 본인만)');
})();
