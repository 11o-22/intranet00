// ==========================================
// ★ 펫 — 어둠 동행 · 주인 대신 죽기
// bundles.json 마지막 묶음, pet-bond.js 와 irregular.js 보다 뒤
// ==========================================
//
// ■ 데리고 들어간다
//
//   어둠 진입 화면(반입 물품 고르는 자리)과 파티 반입 창에 「데려갈 펫」
//   칸을 붙인다. 고른 펫은 u.petWith 에 남고, 탐사가 시작될 때 붙는다.
//
//   혼자 탐사를 나가 있는 펫은 못 데려간다. 들어가 있는 동안에는 혼자
//   내보낼 수도 없다.
//
//   들어가면 화면 왼쪽 아래에서 펫이 위아래로 둥실거린다.
//
// ■ 대신 죽는다
//
//   교감 100 인 펫만 할 수 있다. 주인이 죽는 자리에서 한 탐사에 한 번
//   주사위를 굴려, 절반쯤의 확률로 펫이 대신 간다. 그 펫은 영영 사라진다.
//
//   darkDeath 를 감싼다. 이레귤러보다 바깥이라 펫이 먼저 나선다.
//
// ■ 콘솔
//   petWith()        지금 누구를 데려가기로 했나
//   petWithSet(번호) · petWithSet(0) 으로 물림

(function petWithMod() {

const SPR = 'pet-with-sprite';
const PICK = 'pet-with-pick';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
function run() { return (typeof darkRun !== 'undefined') ? darkRun : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function log_(t) {
    try { if (typeof addHistoryLog === 'function') addHistoryLog(u_(), t); } catch (e) { }
}
function save(f) { try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { } }

// 데려갈 수 있는 펫 — 혼자 탐사를 나가 있지 않은 것
function ready(u) {
    u = u || u_();
    const ps = P().pets(u);
    return Object.keys(ps).filter(function (k) {
        return P().BY[k] && !(ps[k].out && ps[k].out.till);
    }).sort(function (a, b) { return Number(a) - Number(b); });
}

// ==========================================
// 고르기
// ==========================================
window.petWithSet = function (id) {
    const u = u_();
    if (!u) return;
    const n = Number(id) || 0;
    if (n && !P().pets(u)[String(n)]) { alert_('아직 없는 펫입니다.'); return; }
    u.petWith = n || null;
    save({ petWith: 1 });
    try { paintPick(); } catch (e) { }
};

function pickHtml() {
    const u = u_();
    const list = ready(u);
    const now = P().now();
    const cur = Number(u.petWith) || 0;

    if (!list.length) {
        return '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:5px;">'
            + '데려갈 펫</div>'
            + '<div style="font-size:10px; color:#666;">데려갈 수 있는 펫이 없습니다.</div>';
    }

    return '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:5px;">'
        + '데려갈 펫</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:7px; line-height:1.6;">'
        + '교감이 가득 찬 펫은 치명적인 자리에서 주인 대신 갈 수 있습니다.'
        + ' <span style="color:#e07a5f;">그 펫은 돌아오지 않습니다.</span></div>'
        + '<select id="' + PICK + '-sel" onchange="petWithSet(this.value)"'
        + ' style="width:100%; margin-bottom:6px; box-sizing:border-box;">'
        + '<option value="0"' + (cur ? '' : ' selected') + '>— 혼자 간다 —</option>'
        + list.map(function (k) {
            const s = P().pets(u)[k];
            const b = P().bond(k, u);
            const rest = Math.max(0, (Number(s.rest) || 0) - now);
            return '<option value="' + k + '"' + (cur === Number(k) ? ' selected' : '') + '>'
                + esc(P().nick(k, u)) + ' (' + esc(P().BY[k].n) + ' · ♥' + b
                + (b >= P().BOND_MAX ? ' 대신 간다' : '')
                + (rest ? ' · 쉬는 중' : '') + ')</option>';
        }).join('')
        + '</select>';
}

function paintPick() {
    const el = document.getElementById(PICK);
    if (!el || !u_()) return;
    const h = pickHtml();
    if (el.innerHTML !== h) el.innerHTML = h;
}

// 진입 화면에 칸을 끼워 넣는다 — 「어둠으로 진입」 단추 바로 위
function mount(hostId, btnSel) {
    const host = document.getElementById(hostId);
    if (!host || !u_()) return;
    if (document.getElementById(PICK)) { paintPick(); return; }
    const el = document.createElement('div');
    el.id = PICK;
    el.style.cssText = 'margin-bottom:14px; padding:11px; border-radius:6px;'
        + ' background:rgba(212,175,55,0.06); border:1px solid #4a3a26;';
    const btn = host.querySelector(btnSel);
    const row = btn ? btn.parentNode : null;
    if (row && row.parentNode) row.parentNode.insertBefore(el, row);
    else host.appendChild(el);
    paintPick();
}

(function hookBriefing() {
    const iv = setInterval(function () {
        if (typeof openDarkBriefing !== 'function') return;
        if (openDarkBriefing._pet) { clearInterval(iv); return; }
        const _o = openDarkBriefing;
        const w = function () {
            const out = _o.apply(this, arguments);
            try { mount('darkness-body', 'button[onclick^="startDarkRun"]'); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._pet = true;
        openDarkBriefing = w;
        window.openDarkBriefing = w;
        clearInterval(iv);
        console.log('[펫] 어둠 진입 화면 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

(function hookParty() {
    const iv = setInterval(function () {
        if (typeof openPartyCarryModal !== 'function') return;
        if (openPartyCarryModal._pet) { clearInterval(iv); return; }
        const _o = openPartyCarryModal;
        const w = function () {
            const out = _o.apply(this, arguments);
            try { mount('dark-party-body', 'button[onclick^="savePartyCarry"]'); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._pet = true;
        openPartyCarryModal = w;
        window.openPartyCarryModal = w;
        clearInterval(iv);
        console.log('[펫] 파티 반입 창 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 들어가고 나오기
// ==========================================
let was = false;

function begin() {
    const u = u_(), d = run();
    if (!u || !d) return;
    const id = Number(u.petWith) || 0;
    if (!id) return;
    const s = P().pets(u)[String(id)];
    if (!s) { u.petWith = null; return; }
    if (s.out && s.out.till) return;              // 혼자 나가 있다
    d._pet = id;
    P().patch(id, { 'with': 1 });
    const nick = P().nick(id, u);
    log_('[펫 동행] ' + nick + P().josa(nick, '을') + ' 데리고 들어갔습니다.');
}

function end() {
    const u = u_();
    if (!u) return;
    const ps = P().pets(u);
    Object.keys(ps).forEach(function (k) {
        if (ps[k] && ps[k]['with']) P().patch(k, { 'with': null });
    });
    drop();
}

setInterval(function () {
    try {
        const on = !!run();
        if (on && !was) begin();
        if (!on && was) end();
        was = on;
        sprite();
    } catch (e) { }
}, 800);

// ==========================================
// 화면 구석에서 둥실거린다
// ==========================================
function drop() { const el = document.getElementById(SPR); if (el) el.remove(); }

function sprite() {
    const d = run(), u = u_();
    if (!d || !u || !d._pet) { drop(); return; }
    const id = d._pet;
    const s = P().pets(u)[String(id)];
    if (!s) { drop(); return; }

    let el = document.getElementById(SPR);
    if (!el) {
        el = document.createElement('div');
        el.id = SPR;
        el.style.cssText = 'position:fixed; left:10px; z-index:9996; pointer-events:none;'
            + ' bottom:calc(14px + env(safe-area-inset-bottom)); text-align:center;'
            + ' text-shadow:0 1px 3px rgba(0,0,0,0.9);';
        document.body.appendChild(el);
        const full = P().bondFull(id, u);
        el.innerHTML = '<img class="pet-bob" src="' + P().icon(id) + '" alt=""'
            + ' style="width:40px; image-rendering:pixelated;'
            + ' filter:drop-shadow(0 2px 4px rgba(0,0,0,0.8));">'
            + '<div style="font-size:8.5px; color:' + (full ? '#d4af37' : '#9d9488') + ';">'
            + esc(P().nick(id, u)) + (full ? ' ♥' : '') + '</div>';
    }
}

// ==========================================
// 대신 죽는다
// ==========================================
const SAY = [
    '앞으로 나선 것이 먼저였다. 말릴 틈이 없었다.',
    '발밑에서 뭔가가 튀어 나갔다. 뒤늦게 누구인지 알았다.',
    '한 번도 부르면 오지 않던 것이, 부르지도 않았는데 왔다.',
    '소리를 낸 적이 없는 짐승이 그때 한 번 울었다.',
    '어둠이 가져갈 몫은 정해져 있었다. 다만 누구인지는 아니었다.'
];

function sacrifice(reasonText) {
    const d = run(), u = u_();
    if (!d || !u || d._dead) return false;
    const id = d._pet;
    if (!id) return false;
    if (d._petRolled) return false;                 // 한 탐사에 한 번
    const s = P().pets(u)[String(id)];
    if (!s) return false;
    if (!P().bondFull(id, u)) return false;

    d._petRolled = 1;
    if (Math.random() >= P().SAVE_ODDS) {
        try { d.log.push('[펫 동행] 대신 가지 못했습니다.'); } catch (e) { }
        return false;                               // 원래대로 죽는다
    }

    const nick = P().nick(id, u);
    const sp = (P().BY[id] || {}).n || '';

    // 펫을 영영 지운다
    delete P().pets(u)[String(id)];
    u.petWith = null;
    d._pet = 0;
    let wrote = false;
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            const up = { petWith: null };
            up['pets/' + id] = null;
            database.ref('users/' + u.code).update(up)
                .catch(function (e) { console.warn('[펫] 저장 실패', e); });
            wrote = true;
        }
    } catch (e) { }
    if (!wrote) save({ pets: 1, petWith: 1 });

    d.fail = Math.max(0, (d.fail || 0) - 1);
    d.log.push('[펫 동행] ' + nick + P().josa(nick, '이') + ' 대신 갔습니다.');
    log_('[펫 동행] ' + nick + '(' + sp + ')' + P().josa(nick, '이')
        + ' 주인 대신 어둠에 남았습니다.');
    try { if (typeof saveSelfFull === 'function') saveSelfFull(); } catch (e) { }
    drop();

    const say = SAY[Math.floor(Math.random() * SAY.length)];
    try {
        if (typeof darkBodyEl === 'function' && typeof darkBox === 'function') {
            darkBodyEl().innerHTML = darkBox('—',
                reasonText + '<br><br>'
                + '<span style="color:#d4af37;">— ' + esc(say) + '<br><br>'
                + '숨이 돌아온다. 옆이 비어 있다.</span>'
                + '<div style="margin-top:12px; padding:10px; border-radius:6px;'
                + ' background:rgba(0,0,0,0.3); border:1px solid #5a4a2a; font-size:11px;'
                + ' color:#d4af37; text-align:center; line-height:1.8;">'
                + esc(nick) + ' <span style="color:#8d8578;">(' + esc(sp) + ')</span><br>'
                + '교감 ' + P().BOND_MAX + ' — 주인 대신 남았습니다</div>',
                darkChoiceBtn('일어선다.', 'renderDarkStep();'));
            if (typeof mountDarkChat === 'function') mountDarkChat('normal');
        } else {
            alert_(nick + P().josa(nick, '이') + ' 주인 대신 어둠에 남았습니다.');
        }
    } catch (e) { console.warn('[펫]', e); }
    return true;
}

(function hookDeath() {
    const iv = setInterval(function () {
        if (typeof darkDeath !== 'function') return;
        if (darkDeath._petWith) { clearInterval(iv); return; }
        const _d = darkDeath;
        const w = function (reasonText) {
            try { if (sacrifice(reasonText)) return; }
            catch (e) { console.warn('[펫]', e); }
            return _d.apply(this, arguments);
        };
        w._petWith = true;
        darkDeath = w;
        window.darkDeath = w;
        clearInterval(iv);
        console.log('[펫] 대신 죽기 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 확인
// ==========================================
window.petWith = function () {
    const u = u_(), d = run();
    console.log('%c===== 펫 동행 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const id = Number(u.petWith) || 0;
    console.log('  데려가기로 한 펫 :', id ? (P().nick(id, u) + ' (♥' + P().bond(id, u) + ')') : '없음');
    console.log('  지금 같이 있는 펫 :', (d && d._pet) ? P().nick(d._pet, u) : '없음');
    console.log('  대신 죽기        :', (id && P().bondFull(id, u))
        ? ('가능 · 확률 ' + Math.round(P().SAVE_ODDS * 100) + '%')
        : '교감 ' + P().BOND_MAX + ' 이어야 합니다');
};

console.log('[펫] petWith() · petWithSet(번호)');

})();
