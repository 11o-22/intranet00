// ==========================================
// ★ 재난 — 기록 소실 · 📡 파형 재난 (대화로 진행하는 탐사)
// bundles.json 마지막 묶음, playtime.js 뒤
// ==========================================
//
// ■ 어디서 들어가나
//   어둠 탐사 → 「기록 소실」 칸 → [들어간다]   (🎫 기록 소실 티켓을 「사용」해도 열린다)
//
// ■ 한 판
//   1. 대기실 — 한 사람이 방을 열고(방장) 최대 4명이 들어온다. 방장이 [시작한다].
//      시작하는 순간 서버가 사원마다 🎫 기록 소실 티켓을 한 장씩 뗀다 (한 사람이라도 없으면 못 함).
//   2. 장면 — 진행자(Claude)가 장면을 쓴다. 선택지는 없다.
//      사원들은 아래 대화칸에서 캐릭터로 말하고 행동한다. 장면마다 90초.
//      살아 있는 사람이 모두 [행동 확정]을 누르면 일찍 넘어간다.
//   3. 판정 — 대화에서 사원마다 행동 하나를 골라 판정 종류로 바꾸고(서버), 주사위는 코드가 굴린다.
//      실패가 위험하면 다침 → 실종. 치유는 다친 동료를, 연결은 실종된 동료를 한 단계 되돌린다.
//   4. 결말 — 종결(근원을 지움) · 탈출(살아서 나옴) · 전멸(모두 실종). 최대 8장면.
//
//   ✗ 아직 보상 · 장비 · 오염도와는 잇지 않았다 (게임을 짠 뒤에 잇기로 함).
//
// ■ 서버에 적는 자리
//   disaster/<판>            판 (서버 함수가 장면 · 판정 · 상태를 쓴다. 화면은 사원 들고 나기 · 확정만 쓴다)
//   disasterChat/<판>/<번호> 대화 { c, n, t, at, r(장면 번호 · 대기실은 0) }
//
// ■ 콘솔
//   disasterOpen()    창 열기
//   disasterState()   지금 판

const DZ_TICKET = '🎫 기록 소실 티켓';

(function disaster() {

const ROOT = 'disaster', CHAT = 'disasterChat';
const KIND = 'wave', NAME = '파형 재난';
const MAX_MEMBERS = 4, MAX_ROUNDS = 8;
const LOBBY_TTL = 2 * 3600000, PLAY_TTL = 6 * 3600000, END_TTL = 24 * 3600000;
const GRACE = 4000;          // 방장이 먼저 넘긴다 — 다른 사람은 이만큼 기다렸다가 (방장이 없을 때를 대비)
const Z = 99999980;          // 알림창(99999999) · 팔레트(99999990)보다 아래
const ST = { ok: '멀쩡', hurt: '다침', lost: '실종' };
const ST_C = { ok: '#9fd8a4', hurt: '#ffb36b', lost: '#ff6b81' };
const KIND_N = { sense: '감각', hide: '은신', evade: '회피', break: '파괴', bond: '연결', gaze: '응시',
                 heal: '치유', luck: '행운', none: '판정 없음' };
const END_N = { clear: ['종결', '#7fd4d4', '근원을 지웠습니다'], escape: ['탈출', '#e8c27a', '살아서 빠져나왔습니다'],
                fail: ['전멸', '#ff6b81', '모두 파형에 맞춰졌습니다'] };

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function br(s) { return esc(s).replace(/\n/g, '<br>'); }
function alert_(m) { try { showCustomAlert(m); } catch (e) { } }
function tickets(u) { return ((u && u.inventory) || []).filter(function (x) { return x === DZ_TICKET; }).length; }
let off = 0;                 // 서버 시계와의 차이
function now() { return Date.now() + off; }

// ==========================================
// 1. 🎫 티켓 — 물품 표 · 사용하면 창이 열린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[DZ_TICKET]) {
            ITEM_CATALOG[DZ_TICKET] = {
                price: '???', usable: true, targetable: false, effect: 'disaster_ticket', adminOnly: true,
                desc: '[특수] 기록 소실에서 복원된 재난에 들어가는 표. 재난이 시작되는 순간 한 장이 사라진다. 사용하면 기록 소실 창이 열린다.'
            };
        }
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(DZ_TICKET) < 0) NO_SELL_ITEMS.push(DZ_TICKET); } catch (e) { }
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._dz) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName === DZ_TICKET) { open(); return; }            // 쓰는 것은 시작할 때 — 여기서는 안 뗀다
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._dz = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 2. 모양새
// ==========================================
(function css() {
    if (document.getElementById('dz-css')) return;
    const s = document.createElement('style');
    s.id = 'dz-css';
    s.textContent = [
        '#dz-panel{padding:18px 6px 10px;}',
        '#dz-panel .dz-glitch{font-family:monospace;font-size:11px;color:#3a4a4a;letter-spacing:2px;text-align:center;line-height:2;margin-bottom:14px;}',
        '.dz-card{border:1px solid #2f5f60;border-radius:10px;background:linear-gradient(160deg,#0c1718,#0a0d10);padding:14px;}',
        '.dz-card-h{font-size:14px;color:#9fe3e3;font-weight:bold;margin-bottom:6px;letter-spacing:1px;}',
        '.dz-card-t{font-size:12px;color:#c9d6d6;line-height:1.8;margin-bottom:10px;}',
        '.dz-card-m{font-size:10px;color:#7d9a9a;line-height:1.7;margin-bottom:12px;}',
        '.dz-btn{display:block;width:100%;margin:0;padding:11px;border-radius:8px;border:1px solid #3f8f90;',
        '  background:linear-gradient(145deg,#1d4b4c,#123132);color:#e8ffff;font-size:13px;font-weight:bold;cursor:pointer;font-family:inherit;}',
        '.dz-btn[disabled]{opacity:.45;cursor:default;}',
        '.dz-btn.sub{background:rgba(255,255,255,.04);border-color:#3a4650;color:#bcc6cc;font-weight:normal;}',
        '#dz-ov{position:fixed;inset:0;z-index:' + Z + ';background:#06090b;color:#d8e3e3;display:flex;flex-direction:column;',
        '  height:100dvh;font-size:13px;}',
        '#dz-head{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #1d3536;',
        '  background:linear-gradient(180deg,#0d1b1c,#081011);}',
        '#dz-head .t{font-size:13px;color:#9fe3e3;font-weight:bold;letter-spacing:1px;}',
        '#dz-head .n{font-size:11px;color:#6f8c8c;}',
        '#dz-timer{margin-left:auto;font-family:monospace;font-size:14px;color:#e8c27a;min-width:48px;text-align:right;}',
        '#dz-timer.low{color:#ff6b81;}',
        '#dz-x{border:0;background:none;color:#8aa;font-size:18px;cursor:pointer;padding:0 4px;}',
        '#dz-mem{flex:0 0 auto;display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid #12201f;}',
        '#dz-mem span{font-size:11px;padding:3px 8px;border-radius:12px;border:1px solid #24393a;background:rgba(255,255,255,.03);}',
        '#dz-main{flex:1 1 auto;overflow-y:auto;padding:12px;-webkit-overflow-scrolling:touch;}',
        '.dz-sec{font-size:10px;color:#6f8c8c;letter-spacing:1px;margin:14px 0 6px;}',
        '.dz-scene{border-left:2px solid #3f8f90;padding:4px 0 4px 12px;margin-bottom:12px;}',
        '.dz-scene .h{font-size:13px;color:#bff0f0;font-weight:bold;margin-bottom:8px;}',
        '.dz-scene .b{font-size:13px;line-height:1.9;color:#dfe9e9;}',
        '.dz-res{border:1px solid #2a3a3b;border-radius:8px;padding:10px 12px;background:rgba(255,255,255,.025);margin-bottom:14px;}',
        '.dz-res .b{font-size:12px;line-height:1.85;color:#c8d4d4;}',
        '.dz-chk{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;}',
        '.dz-chk span{font-size:10px;padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.35);border:1px solid #2a3a3b;color:#b8c4c4;}',
        '.dz-chk span.ok{border-color:#2f6b4a;color:#9fd8a4;} .dz-chk span.no{border-color:#6b2f3a;color:#ff9aa8;}',
        '#dz-chat .ln{font-size:12px;line-height:1.7;padding:2px 0;word-break:break-word;}',
        '#dz-chat .ln b{color:#9fe3e3;font-weight:normal;margin-right:6px;}',
        '#dz-chat .ln.me b{color:#e8c27a;}',
        '#dz-chat .ln.echo{color:#7a8f8f;font-style:italic;}',
        '#dz-chat .sep{font-size:10px;color:#4e6a6a;text-align:center;margin:10px 0 4px;letter-spacing:2px;}',
        '#dz-wait{font-size:12px;color:#e8c27a;text-align:center;padding:12px;border:1px dashed #5a4a2a;border-radius:8px;margin:10px 0;',
        '  animation:dzp 1.6s ease-in-out infinite;}',
        '@keyframes dzp{0%,100%{opacity:.55}50%{opacity:1}}',
        '.dz-err{font-size:11px;color:#ff9aa8;margin:8px 0;line-height:1.6;}',
        '#dz-bar{flex:0 0 auto;display:flex;gap:6px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));border-top:1px solid #1d3536;background:#081011;}',
        '#dz-in{flex:1 1 auto;min-width:0;margin:0;padding:10px;border-radius:8px;border:1px solid #2a4a4b;background:#0d1718;color:#e8f2f2;font-size:13px;font-family:inherit;}',
        '#dz-bar button{flex:0 0 auto;margin:0;padding:0 11px;border-radius:8px;border:1px solid #3f8f90;background:#123132;color:#e8ffff;font-size:12px;cursor:pointer;font-family:inherit;}',
        '#dz-bar button.on{background:#3f8f90;color:#071012;font-weight:bold;}',
        '#dz-bar button[disabled]{opacity:.4;}',
        '.dz-row{display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid #1f3233;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,.02);}',
        '.dz-row .w{flex:1 1 auto;min-width:0;font-size:12px;line-height:1.5;}',
        '.dz-row .w i{font-style:normal;color:#6f8c8c;font-size:10px;}',
        '.dz-row button{flex:0 0 auto;margin:0;padding:7px 11px;border-radius:7px;border:1px solid #3f8f90;background:#123132;color:#e8ffff;font-size:11px;cursor:pointer;font-family:inherit;}',
        '.dz-row button[disabled]{opacity:.4;}',
        '.dz-end{border:1px solid;border-radius:10px;padding:14px;margin-bottom:14px;}',
        '.dz-end .k{font-size:15px;font-weight:bold;letter-spacing:2px;margin-bottom:8px;}',
        'details.dz-h{margin-bottom:6px;border:1px solid #1f3233;border-radius:8px;padding:8px 10px;}',
        'details.dz-h summary{font-size:12px;color:#9fe3e3;cursor:pointer;}',
        'details.dz-h div{font-size:12px;line-height:1.8;color:#c8d4d4;margin-top:6px;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 3. 기록 소실 칸
// ==========================================
function activeOf(all, code) {
    const ids = Object.keys(all || {}).filter(function (id) {
        const r = all[id];
        if (!r || r.kind !== KIND || !r.members || !r.members[code]) return false;
        if (r.state === 'LOBBY' || r.state === 'PLAY') return true;
        return r.state === 'END' && !(r.members[code] || {}).seen;
    });
    ids.sort(function (a, b) { return (all[b].createdAt || 0) - (all[a].createdAt || 0); });
    return ids[0] || null;
}
function paintPanel() {
    const box = document.getElementById('dark-lost');
    const u = me();
    if (!box || !u) return;
    let p = document.getElementById('dz-panel');
    if (!p) {
        const old = box.children[1];
        p = document.createElement('div');
        p.id = 'dz-panel';
        if (old) box.replaceChild(p, old); else box.appendChild(p);
    }
    const n = tickets(u);
    const draw = function (mine) {
        p.innerHTML = '<div class="dz-glitch">■■■■■■■■■■<br>■■■&nbsp;&nbsp;복&nbsp;원&nbsp;&nbsp;■■■<br>■■■■■■■■■■</div>'
            + '<div class="dz-card">'
            + '<div class="dz-card-h">📡 ' + NAME + '</div>'
            + '<div class="dz-card-t">새벽 3시 33분. 오래된 아파트 단지의 모든 스피커에서 같은 파형이 흘러나온다.<br>끝까지 들은 사람은 조금씩 박자에 맞춰진다.</div>'
            + '<div class="dz-card-m">' + DZ_TICKET + ' <b style="color:#e8c27a;">' + n + '</b>장 · 시작할 때 사원마다 한 장<br>'
            + '최대 ' + MAX_MEMBERS + '명 · 선택지 없이 대화로 진행 · 장면마다 90초 · 최대 ' + MAX_ROUNDS + '장면</div>'
            + '<button class="dz-btn" onclick="disasterOpen()">' + (mine ? '이어서 들어간다' : '들어간다') + '</button>'
            + '</div>';
    };
    draw(false);
    const d = db_();
    if (d) d.ref(ROOT).once('value').then(function (s) { if (activeOf(s.val() || {}, u.code)) draw(true); }).catch(function () { });
}
(function hookPanel() {
    const iv = setInterval(function () {
        if (typeof switchDarknessPanel !== 'function') return;
        if (switchDarknessPanel._dz) { clearInterval(iv); return; }
        const _s = switchDarknessPanel;
        const w = function (panelId) {
            const r = _s.apply(this, arguments);
            if (panelId === 'dark-lost') { try { paintPanel(); } catch (e) { } }
            return r;
        };
        Object.keys(_s).forEach(function (k) { try { w[k] = _s[k]; } catch (e) { } });
        w._dz = true;
        switchDarknessPanel = w; window.switchDarknessPanel = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 4. 창
// ==========================================
let ov = null, all = {}, rootRef = null, rootCb = null;
let curId = null, chatRef = null, chatCb = null, chatLines = [];
let tick = 0, busy = false, msg = '';
const asked = {}, doneSeen = {};

function open() {
    const u = me(), d = db_();
    if (!u || !d) return;
    if (ov) return;
    ov = document.createElement('div');
    ov.id = 'dz-ov';
    ov.innerHTML = '<div id="dz-head"><span class="t">📡 ' + NAME + '</span><span class="n" id="dz-n"></span>'
        + '<span id="dz-timer"></span><button id="dz-x" title="닫기">✕</button></div>'
        + '<div id="dz-mem"></div>'
        + '<div id="dz-main"><div id="dz-info"></div><div id="dz-chat"></div><div id="dz-foot"></div></div>'
        + '<div id="dz-bar"><input id="dz-in" maxlength="200" autocomplete="off" placeholder="">'
        + '<button id="dz-send">말</button><button id="dz-done">행동 확정</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#dz-x').onclick = close;
    ov.querySelector('#dz-send').onclick = send;
    ov.querySelector('#dz-done').onclick = toggleDone;
    ov.querySelector('#dz-in').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); send(); } });
    try { d.ref('.info/serverTimeOffset').once('value').then(function (s) { off = Number(s.val()) || 0; }).catch(function () { }); } catch (e) { }
    rootRef = d.ref(ROOT);
    rootCb = function (s) { all = s.val() || {}; sweep(); follow(); paint(); };
    rootRef.on('value', rootCb);
    tick = setInterval(onTick, 1000);
    paint();
}
window.disasterOpen = open;

function close() {
    const u = me(), r = curId && all[curId];
    // 끝난 판을 닫으면 「봤다」고 적는다 — 다음에 열면 대기실 목록으로
    if (u && r && r.state === 'END' && r.members && r.members[u.code]) {
        try { db_().ref(ROOT + '/' + curId + '/members/' + u.code + '/seen').set(true); } catch (e) { }
    }
    if (rootRef && rootCb) { try { rootRef.off('value', rootCb); } catch (e) { } }
    if (chatRef && chatCb) { try { chatRef.off('child_added', chatCb); } catch (e) { } }
    rootRef = rootCb = chatRef = chatCb = null;
    clearInterval(tick); tick = 0;
    if (ov) ov.remove();
    ov = null; curId = null; chatLines = []; msg = '';
    try { if (document.getElementById('dark-lost')) paintPanel(); } catch (e) { }
}

// 오래된 판 치우기 (누가 열든 같이 치운다)
let swept = false;
function sweep() {
    if (swept) return;
    swept = true;
    const d = db_(), t = now();
    Object.keys(all).forEach(function (id) {
        const r = all[id] || {};
        const age = t - (Number(r.createdAt) || 0);
        const old = (r.state === 'LOBBY' && age > LOBBY_TTL) || (r.state === 'PLAY' && age > PLAY_TTL)
            || (r.state === 'END' && age > END_TTL) || !r.kind;
        if (!old) return;
        try { d.ref(ROOT + '/' + id).remove(); d.ref(CHAT + '/' + id).remove(); d.ref('disasterSrv/' + id).remove(); } catch (e) { }
    });
}

// 내가 들어 있는 판을 따라간다 — 대화칸을 그 판에 건다
function follow() {
    const u = me();
    const id = u ? activeOf(all, u.code) : null;
    if (id === curId) return;
    if (chatRef && chatCb) { try { chatRef.off('child_added', chatCb); } catch (e) { } }
    chatRef = chatCb = null; chatLines = [];
    const c = document.getElementById('dz-chat'); if (c) c.innerHTML = '';
    curId = id; lastR = -1; lastInfo = '';
    if (!id) return;
    chatRef = db_().ref(CHAT + '/' + id).limitToLast(300);
    chatCb = function (s) { const v = s.val(); if (v && v.t) { chatLines.push(v); addLine(v); } };
    chatRef.on('child_added', chatCb);
}

let lastR = -1;
function addLine(v) {
    const c = document.getElementById('dz-chat'); if (!c) return;
    const u = me(), r = all[curId] || {};
    const rn = Number(v.r) || 0;
    if (rn !== lastR) {
        lastR = rn;
        const sep = document.createElement('div');
        sep.className = 'sep';
        sep.textContent = rn ? '— 장면 ' + rn + ' —' : '— 대기실 —';
        c.appendChild(sep);
    }
    const m = (r.members || {})[v.c] || {};
    const el = document.createElement('div');
    el.className = 'ln' + (u && v.c === u.code ? ' me' : '') + (m.st === 'lost' ? ' echo' : '');
    el.innerHTML = '<b>' + esc(v.n || v.c) + '</b>' + esc(v.t);
    c.appendChild(el);
    const main = document.getElementById('dz-main');
    if (main && main.scrollHeight - main.scrollTop - main.clientHeight < 160) main.scrollTop = main.scrollHeight;
}

// ==========================================
// 5. 그리기
// ==========================================
let lastInfo = '';
function paint() {
    if (!ov) return;
    const u = me(); if (!u) return;
    const r = curId ? all[curId] : null;
    const info = document.getElementById('dz-info'), mem = document.getElementById('dz-mem');
    const nEl = document.getElementById('dz-n'), bar = document.getElementById('dz-bar');
    const inp = document.getElementById('dz-in'), done = document.getElementById('dz-done');
    let html = '';
    if (!r) {
        lastR = -1;
        nEl.textContent = '· 대기실 목록';
        mem.innerHTML = ''; mem.style.display = 'none';
        bar.style.display = 'none';
        html = lobbyList(u);
    } else {
        mem.style.display = '';
        mem.innerHTML = memberChips(r, u);
        bar.style.display = '';
        if (r.state === 'LOBBY') {
            nEl.textContent = '· 대기실';
            html = room(r, u);
            inp.placeholder = '대기실에서 의논하기';
            inp.disabled = false; done.style.display = 'none';
            ov.querySelector('#dz-send').disabled = false;
        } else if (r.state === 'PLAY') {
            const n = Number(r.round) || 0;
            nEl.textContent = '· 장면 ' + n + ' / ' + MAX_ROUNDS;
            html = play(r, u);
            const lost = ((r.members[u.code] || {}).st === 'lost');
            const talk = r.phase === 'TALK';
            inp.disabled = !talk;
            inp.placeholder = !talk ? '진행자가 정리하는 중…' : (lost ? '파형 속에서 목소리만 남았다…' : '캐릭터로 말하고 행동하기');
            ov.querySelector('#dz-send').disabled = !talk;
            done.style.display = lost ? 'none' : '';
            const on = Number((r.members[u.code] || {}).done) === n;
            done.classList.toggle('on', on);
            done.textContent = on ? '확정함 ✓' : '행동 확정';
            done.disabled = !talk;
        } else {
            nEl.textContent = '· 끝';
            html = ending(r, u);
            bar.style.display = 'none';
        }
    }
    if (html !== lastInfo) { info.innerHTML = html; lastInfo = html; wire(); }
    onTick();
}

function lobbyList(u) {
    const t = now();
    const ids = Object.keys(all).filter(function (id) {
        const r = all[id];
        return r && r.kind === KIND && r.state === 'LOBBY' && t - (r.createdAt || 0) < LOBBY_TTL;
    }).sort(function (a, b) { return (all[a].createdAt || 0) - (all[b].createdAt || 0); });
    const n = tickets(u);
    let h = '<div class="dz-card-m" style="margin:0 0 10px;">' + DZ_TICKET + ' <b style="color:#e8c27a;">' + n + '</b>장'
        + (n ? '' : ' — 티켓이 있어야 방을 열거나 들어갈 수 있습니다.') + '</div>';
    h += '<div class="dz-sec">열려 있는 방</div>';
    if (!ids.length) h += '<div class="dz-card-m">열려 있는 방이 없습니다.</div>';
    ids.forEach(function (id) {
        const r = all[id], m = r.members || {}, cs = Object.keys(m);
        const full = cs.length >= MAX_MEMBERS;
        h += '<div class="dz-row"><div class="w">' + esc((m[r.leader] || {}).n || '?') + '의 방 <i>' + cs.length + ' / ' + MAX_MEMBERS + '</i><br>'
            + '<i>' + cs.map(function (c) { return esc(m[c].n || c); }).join(' · ') + '</i></div>'
            + '<button data-join="' + esc(id) + '"' + ((full || !n || busy) ? ' disabled' : '') + '>' + (full ? '가득 참' : '들어간다') + '</button></div>';
    });
    h += '<div style="margin-top:14px;"><button class="dz-btn" data-make="1"' + ((!n || busy) ? ' disabled' : '') + '>새로 연다</button></div>';
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    return h;
}

function memberChips(r, u) {
    const m = r.members || {}, n = Number(r.round) || 0;
    return Object.keys(m).sort(function (a, b) { return (m[a].at || 0) - (m[b].at || 0); }).map(function (c) {
        const x = m[c], st = x.st || 'ok';
        const tag = r.state === 'LOBBY' ? (c === r.leader ? ' · 방장' : '')
            : (' · ' + ST[st] + (r.state === 'PLAY' && st !== 'lost' && Number(x.done) === n ? ' ✓' : ''));
        return '<span style="color:' + (r.state === 'LOBBY' ? '#cfe' : ST_C[st]) + ';' + (c === u.code ? 'border-color:#5a7a3a;' : '') + '">'
            + esc(x.n || c) + tag + '</span>';
    }).join('');
}

function room(r, u) {
    const lead = r.leader === u.code;
    const cs = Object.keys(r.members || {});
    let h = '<div class="dz-card-t" style="margin-top:4px;">대기실입니다. 방장이 [시작한다]를 누르면 재난이 열립니다.<br>'
        + '시작하는 순간 사원마다 ' + DZ_TICKET + '이 한 장씩 사라집니다. (' + cs.length + ' / ' + MAX_MEMBERS + '명)</div>';
    if (r.phase === 'WAIT') h += '<div id="dz-wait">진행자가 재난을 여는 중…</div>';
    if (r.err) h += '<div class="dz-err">⚠ ' + esc(r.err) + '</div>';
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    if (lead) h += '<button class="dz-btn" data-start="1"' + (busy || r.phase === 'WAIT' ? ' disabled' : '') + '>시작한다</button>';
    else h += '<div class="dz-card-m">방장이 시작하기를 기다리는 중입니다.</div>';
    h += '<div style="margin-top:8px;"><button class="dz-btn sub" data-leave="1"' + (busy ? ' disabled' : '') + '>나간다</button></div>';
    return h;
}

function checkChips(list) {
    return '<div class="dz-chk">' + (list || []).map(function (c) {
        if (c.kind === 'none') return '<span>' + esc(c.name) + ' · ' + esc(c.did) + '</span>';
        let s = esc(c.name) + ' · ' + KIND_N[c.kind] + ' ' + c.roll + '/' + c.dc + ' ' + (c.ok ? '성공' : '실패')
            + (c.crit ? ' ★' : '') + (c.fumble ? ' ✖' : '');
        if (c.to) s += ' → ' + ST[c.to];
        if (c.tgtTo) s += ' · ' + esc(c.tgtName) + ' ' + ST[c.tgtFrom] + '→' + ST[c.tgtTo];
        return '<span class="' + (c.ok ? 'ok' : 'no') + '" title="' + esc(c.did) + '">' + s + '</span>';
    }).join('') + '</div>';
}

function play(r, u) {
    const n = Number(r.round) || 0;
    let h = '';
    if (r.last && Number(r.last.n) === n - 1) {
        h += '<div class="dz-sec">지난 장면 — ' + esc(r.last.title) + '</div>'
            + '<div class="dz-res"><div class="b">' + br(r.last.result) + '</div>' + checkChips(r.last.checks) + '</div>';
    }
    if (r.scene) {
        h += '<div class="dz-sec">장면 ' + n + '</div>'
            + '<div class="dz-scene"><div class="h">' + esc(r.scene.title) + '</div><div class="b">' + br(r.scene.text) + '</div></div>';
    }
    if (r.phase === 'WAIT') h += '<div id="dz-wait">진행자가 장면을 정리하는 중…</div>';
    if (r.err) h += '<div class="dz-err">⚠ ' + esc(r.err) + ' — 잠시 뒤 다시 넘깁니다.</div>';
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    h += '<div class="dz-sec">대화 — 캐릭터로 말하고 행동하세요. 90초가 지나거나 모두 확정하면 넘어갑니다.</div>';
    return h;
}

function ending(r, u) {
    const o = r.outcome || {}, E = END_N[o.kind] || END_N.escape;
    const m = r.members || {};
    let h = '';
    if (r.last) {
        h += '<div class="dz-sec">마지막 장면 — ' + esc(r.last.title) + '</div>'
            + '<div class="dz-res"><div class="b">' + br(r.last.result) + '</div>' + checkChips(r.last.checks) + '</div>';
    }
    h += '<div class="dz-end" style="border-color:' + E[1] + ';"><div class="k" style="color:' + E[1] + ';">' + E[0] + '</div>'
        + '<div class="dz-card-t" style="margin:0;">' + br(o.text || E[2]) + '</div></div>';
    h += '<div class="dz-sec">사원</div><div class="dz-card-m">' + Object.keys(m).map(function (c) {
        const st = m[c].st || 'ok';
        return '<span style="color:' + ST_C[st] + ';">' + esc(m[c].n || c) + ' — ' + (st === 'lost' ? '실종' : (st === 'hurt' ? '다친 채 생환' : '생환')) + '</span>';
    }).join('<br>') + '</div>';
    const hist = r.history || {};
    const ks = Object.keys(hist).sort(function (a, b) { return a - b; });
    if (ks.length) {
        h += '<div class="dz-sec">지난 장면들</div>' + ks.map(function (k) {
            const x = hist[k] || {};
            return '<details class="dz-h"><summary>장면 ' + k + ' — ' + esc(x.title) + '</summary><div>' + br(x.text)
                + '<br><br><span style="color:#9fe3e3;">' + br(x.result) + '</span></div></details>';
        }).join('');
    }
    h += '<div style="margin-top:12px;"><button class="dz-btn" data-close="1">닫는다</button></div>';
    return h;
}

function wire() {
    if (!ov) return;
    Array.prototype.forEach.call(ov.querySelectorAll('[data-join]'), function (b) { b.onclick = function () { join(b.dataset.join); }; });
    const mk = ov.querySelector('[data-make]'); if (mk) mk.onclick = make;
    const st = ov.querySelector('[data-start]'); if (st) st.onclick = startRun;
    const lv = ov.querySelector('[data-leave]'); if (lv) lv.onclick = leave;
    const cl = ov.querySelector('[data-close]'); if (cl) cl.onclick = close;
}

// ==========================================
// 6. 대기실 — 열기 · 들어가기 · 나가기 · 시작
// ==========================================
function prof(u) {
    return { n: String(u.name || u.code), no: String(u.no || ''), team: String(u.team || ''),
             aff: String(u.affiliation || ''), pos: String(u.position || ''), at: now() };
}
function make() {
    const u = me(), d = db_();
    if (!u || !d || busy) return;
    if (!tickets(u)) { msg = DZ_TICKET + '이 없습니다.'; lastInfo = ''; paint(); return; }
    if (activeOf(all, u.code)) return;
    busy = true;
    const ref = d.ref(ROOT).push();
    const m = {}; m[u.code] = prof(u);
    ref.set({ kind: KIND, state: 'LOBBY', leader: u.code, createdAt: now(), members: m })
        .then(function () { busy = false; msg = ''; })
        .catch(function () { busy = false; msg = '방을 열지 못했습니다.'; lastInfo = ''; paint(); });
}
function join(id) {
    const u = me(), d = db_();
    if (!u || !d || busy || !id) return;
    if (!tickets(u)) { msg = DZ_TICKET + '이 없습니다.'; lastInfo = ''; paint(); return; }
    busy = true;
    const p = prof(u);
    d.ref(ROOT + '/' + id).transaction(function (r) {
        if (!r || r.state !== 'LOBBY') return;
        const m = r.members || {};
        if (m[u.code]) return r;
        if (Object.keys(m).length >= MAX_MEMBERS) return;
        m[u.code] = p; r.members = m;
        return r;
    }).then(function (res) {
        busy = false;
        if (!res || !res.committed) { msg = '들어가지 못했습니다. (가득 찼거나 이미 시작한 방)'; lastInfo = ''; paint(); }
        else msg = '';
    }).catch(function () { busy = false; msg = '들어가지 못했습니다.'; lastInfo = ''; paint(); });
}
function leave() {
    const u = me(), d = db_(), id = curId;
    if (!u || !d || !id || busy) return;
    busy = true;
    d.ref(ROOT + '/' + id).transaction(function (r) {
        if (!r || r.state !== 'LOBBY') return;
        const m = r.members || {};
        delete m[u.code];
        const left = Object.keys(m).sort(function (a, b) { return (m[a].at || 0) - (m[b].at || 0); });
        if (!left.length) return null;                       // 아무도 없으면 방을 닫는다
        if (r.leader === u.code) r.leader = left[0];
        r.members = m;
        return r;
    }).then(function () { busy = false; msg = ''; }).catch(function () { busy = false; });
}

function post(body) {
    return fetch('/api/disaster', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, json: j || {} }; }); })
        .catch(function () { return { status: 0, json: { error: '서버에 닿지 못했습니다.' } }; });
}
function startRun() {
    const u = me(), id = curId;
    if (!u || !id || busy) return;
    busy = true; msg = ''; lastInfo = ''; paint();
    post({ act: 'start', run: id, code: u.code }).then(function (res) {
        busy = false;
        if (res.status !== 200) msg = res.json.error || '시작하지 못했습니다.';
        lastInfo = ''; paint();
    });
}

// ==========================================
// 7. 장면 — 말하기 · 확정 · 시간이 다 되면 넘기기
// ==========================================
function send() {
    const u = me(), d = db_(), r = curId && all[curId];
    const inp = document.getElementById('dz-in');
    if (!u || !d || !r || !inp) return;
    const t = String(inp.value || '').trim().slice(0, 200);
    if (!t) return;
    if (r.state === 'PLAY' && r.phase !== 'TALK') return;
    if (r.state !== 'PLAY' && r.state !== 'LOBBY') return;
    inp.value = '';
    d.ref(CHAT + '/' + curId).push({ c: u.code, n: String(u.name || u.code), t: t, at: now(),
                                     r: r.state === 'PLAY' ? (Number(r.round) || 0) : 0 });
}
function toggleDone() {
    const u = me(), d = db_(), r = curId && all[curId];
    if (!u || !d || !r || r.state !== 'PLAY' || r.phase !== 'TALK') return;
    const n = Number(r.round) || 0;
    const on = Number((r.members[u.code] || {}).done) === n;
    d.ref(ROOT + '/' + curId + '/members/' + u.code + '/done').set(on ? 0 : n);
}

function onTick() {
    if (!ov) return;
    const u = me(), r = curId && all[curId];
    const tm = document.getElementById('dz-timer');
    if (!r || r.state !== 'PLAY' || !r.scene) { if (tm) tm.textContent = ''; return; }
    const t = now(), n = Number(r.round) || 0;
    const left = Math.max(0, Math.ceil(((Number(r.scene.endsAt) || 0) - t) / 1000));
    if (tm) {
        tm.textContent = r.phase === 'TALK' ? (Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0')) : '…';
        tm.classList.toggle('low', r.phase === 'TALK' && left <= 10);
    }
    if (!u || r.phase !== 'TALK' || !r.members[u.code]) return;
    // 넘길 때인가 — 시간이 다 됐거나, 살아 있는 사람이 모두 확정했거나
    const m = r.members;
    const alive = Object.keys(m).filter(function (c) { return (m[c].st || 'ok') !== 'lost'; });
    const allDone = alive.length > 0 && alive.every(function (c) { return Number(m[c].done) === n; });
    const key = curId + '#' + n;
    if (allDone && !doneSeen[key]) doneSeen[key] = t;
    const dueAt = allDone ? Math.min(doneSeen[key], Number(r.scene.endsAt) || 0) : (Number(r.scene.endsAt) || 0);
    if (t < dueAt) return;
    if (r.leader !== u.code && t < dueAt + GRACE) return;            // 방장이 먼저 — 없으면 4초 뒤 아무나
    if (asked[key] && t < asked[key]) return;
    asked[key] = t + 20000;
    post({ act: 'round', run: curId, code: u.code, round: n }).then(function (res) {
        if (res.status === 425 && res.json.wait) asked[key] = now() + Math.min(20000, res.json.wait + 600);
        else if (res.status === 409 || res.status === 200) { /* 누가 넘겼다 · 넘어갔다 */ }
        else if (res.status && res.status !== 502) { msg = res.json.error || ''; lastInfo = ''; paint(); }
    });
}

window.disasterState = function () {
    const r = curId && all[curId];
    console.log('%c===== 📡 재난 =====', 'color:#9fe3e3; font-size:13px');
    console.log('  판:', curId || '없음', '· 상태:', r ? r.state + ' / ' + (r.phase || '') + ' · 장면 ' + (r.round || 0) : '-');
    if (r) console.table(Object.keys(r.members || {}).map(function (c) {
        const x = r.members[c]; return { 사번: c, 이름: x.n, 상태: x.st || '', 확정: x.done || 0 };
    }));
    console.log('  내 티켓:', tickets(me()));
};

console.log('[재난] 기록 소실 · 📡 ' + NAME + ' — disasterOpen() · disasterState()');

})();
