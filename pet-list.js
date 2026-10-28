// ==========================================
// ★ 펫 — [🐶 펫] 단추와 목록 칸
// bundles.json 마지막 묶음, pet-data.js 보다 뒤
// ==========================================
//
// ■ 무엇을 하나
//
//   오른쪽 아래에 [🐶 펫] 단추를 띄운다. 누르면 펫 24종이 다섯 칸씩 깔린다. 가진 것은 작은 데포르메 그림, 없는 것은 어둡게 깔고 「입양 전」.
//
//   가진 펫을 누르면 본 그림과 함께 등급·능력치·설명이 열리고, 거기서
//   **이름을 따로 붙여 줄 수 있다**. 안 붙이면 종 이름으로 부른다.
//
//   능력치는 B 등급부터 생긴다. 전부 D 로 깨어나므로 당장은 다들
//   「능력치는 B 등급부터」로 뜬다 (등급을 올리는 길은 아직 안 넣었다).
//
// ■ 단추를 숨기는 때
//   로그인 전 · 어둠 탐사 중 · 창이 열려 있을 때
//
// ■ 콘솔
//   petOpen()   목록을 연다

(function petListUI() {

const FAB = 'pet-fab';
const MOD = 'pet-modal';
const COLS = 5;                 // 사용자가 적어 준 차례대로 다섯 칸씩

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function alert_(t) {
    if (typeof showCustomAlert === 'function') showCustomAlert(t); else alert(t);
}
function P() { return window.PET; }

// ==========================================
// 창
// ==========================================
function shut() {
    const m = document.getElementById(MOD);
    if (m) m.remove();
}
function box(html) {
    shut();
    const f = document.getElementById(FAB);        // 창을 열면 단추는 치운다
    if (f) f.remove();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999990; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.82); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:14px; width:100%;'
        + ' max-width:420px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}

const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// ==========================================
// 목록
// ==========================================
function statusOf(s) {
    const now = P().now();
    if (s && s['with']) return { t: '동행 중', c: '#d4af37' };
    if (s && s.out && s.out.till)
        return (s.out.till > now)
            ? { t: '탐사 중', c: '#9fd8ef' }
            : { t: '돌아옴', c: '#6f8f5e' };      // 어둠 칸에서 데려오면 된다
    if (s && (s.rest || 0) > now)
        return { t: '쉬는 중', c: '#c9a227' };
    if (s && (Number(s.jsleep) || 0) > now) return { t: '💤 여정 뒤 잠', c: '#8fa8d8' };   // 🐾 여정에서 주인이 대신 맞았다 (journey.js)
    if (P().asleep && P().asleep()) return { t: '💤 잠듦', c: '#8fa8d8' };   // 🦋 숨결 두 번 — 모두 잔다
    return null;
}

function cell(p) {
    const me = u_();
    const ps = P().pets(me);
    const s = ps[String(p.i)];
    const img = P().icon(p.i);

    if (!s) {
        // 입양 전 — 어둡게
        return '<div style="text-align:center; padding:4px 2px; opacity:0.85;">'
            + '<div style="width:100%; aspect-ratio:1/1; display:flex; align-items:center;'
            + ' justify-content:center; border:1px solid #2a2622; border-radius:7px;'
            + ' background:rgba(0,0,0,0.5);">'
            + '<img src="' + img + '" alt="" style="max-width:88%; max-height:88%;'
            + ' image-rendering:pixelated; filter:brightness(0.14) grayscale(1);">'
            + '</div>'
            + '<div style="font-size:8.5px; color:#5a544c; margin-top:3px; line-height:1.2;">입양 전</div>'
            + '</div>';
    }

    const st = statusOf(s);
    const nick = P().nick(p.i, me);
    const inRoom = P().showHas(p.i, me);
    return '<div class="pet-cell" data-i="' + p.i + '" style="text-align:center; padding:4px 2px;'
        + ' cursor:pointer;">'
        + '<div style="position:relative; width:100%; aspect-ratio:1/1; display:flex;'
        + ' align-items:center; justify-content:center; border:1px solid '
        + (inRoom ? '#c9a227' : '#4a3a26') + ';'
        + ' border-radius:7px; background:rgba(60,44,22,' + (inRoom ? '0.34' : '0.22') + ');">'
        + (inRoom ? '<span style="position:absolute; top:-4px; left:-3px; font-size:9px;'
            + ' line-height:1;">🏠</span>' : '')
        + '<img src="' + img + '" alt="" style="max-width:88%; max-height:88%;'
        + ' image-rendering:pixelated;">'
        + '<span style="position:absolute; top:-3px; right:-3px; font-size:8px; font-weight:bold;'
        + ' color:#1a1208; background:#c9a227; border-radius:3px; padding:0 3px;">'
        + esc(s.g || 'D') + '</span>'
        + (st ? '<span style="position:absolute; bottom:1px; left:1px; right:1px; font-size:7.5px;'
            + ' color:' + st.c + '; background:rgba(0,0,0,0.72);">' + st.t + '</span>' : '')
        + '</div>'
        + '<div style="font-size:8.5px; color:#e8d7b4; margin-top:3px; line-height:1.2;'
        + ' overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(nick) + '</div>'
        + '</div>';
}

function listView() {
    const me = u_();
    if (!me) { alert_('로그인 뒤에 쓸 수 있습니다.'); return; }
    const L = P().LIST;
    const have = Object.keys(P().pets(me)).filter(function (k) { return P().BY[k]; }).length;

    const grid = '<div style="display:grid; grid-template-columns:repeat(' + COLS + ',1fr);'
        + ' gap:5px;">' + L.map(cell).join('') + '</div>';

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">'
        + '<span style="font-size:13px; color:#ffcf8f; font-weight:bold;">🐶 펫</span>'
        + '<span style="font-size:10px; color:#8d8578;">' + have + ' / ' + L.length + '마리</span>'
        + '</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:10px; line-height:1.6;">'
        + '가진 펫을 누르면 이름을 붙이고, 사택 방에 내놓을 펫을 고를 수 있습니다.<br>'
        + '🏠 표시가 지금 방에 있는 ' + P().SHOW_MAX + '마리입니다.</div>'
        + grid
        + '<button id="pet-x" class="game-btn" style="' + BTN + GREY + ' margin-top:11px;">닫는다</button>');

    w.querySelector('#pet-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.pet-cell'), function (el) {
        el.onclick = function () { oneView(Number(el.getAttribute('data-i'))); };
    });
}

// ==========================================
// 펫 하나
// ==========================================
function oneView(id) {
    const me = u_();
    const p = P().BY[id];
    if (!me || !p) return;
    const s = P().pets(me)[String(id)];
    if (!s) { listView(); return; }

    const g = s.g || 'D';
    const gi = P().GRADES.indexOf(g);
    const named = P().named(id, me);
    const nick = P().nick(id, me);
    const st = statusOf(s);

    const line = function (k, v) {
        return '<div style="display:flex; justify-content:space-between; gap:10px;'
            + ' font-size:11px; padding:5px 0; border-bottom:1px solid #241f19;">'
            + '<span style="color:#8d8578;">' + k + '</span>'
            + '<span style="color:#e8d7b4; text-align:right;">' + v + '</span></div>';
    };

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">'
        + '<span style="font-size:12px; color:#ffcf8f; font-weight:bold;">' + esc(nick) + '</span>'
        + '<span style="font-size:10px; color:#8d8578;">'
        + (named ? esc(p.n) + ' · ' : '') + g + ' 등급</span></div>'

        + '<div style="text-align:center; background:rgba(0,0,0,0.42); border:1px solid #3a3025;'
        + ' border-radius:8px; padding:10px; margin-bottom:11px;">'
        + '<img src="' + P().img(id) + '" alt="" style="max-width:100%; max-height:190px;">'
        + '</div>'

        + '<div style="font-size:11px; color:#b8ac97; line-height:1.55; margin-bottom:10px;">'
        + esc(p.d) + '</div>'

        + line('등급', g + ' <span style="color:#6f685e;">(최고 S)</span>')
        + line('능력치', gi >= 2
            ? esc(P().statText(p.st))
            : '<span style="color:#8d8578;">없음</span>'
              + ' <span style="color:#5f594f;">(B 등급이 되면 '
              + esc(P().statText(p.st)) + ')</span>')
        + line('주의 문구', esc(P().WARN[p.w].n))
        // ★ 성별 · 성격 · 스킬 · 먹인 룬 (pet-trait.js · pet-rune.js · 2026-10-27)
        + (window.PETTRAIT ? line('성별', esc(PETTRAIT.sexName(PETTRAIT.sex(id, me))))
            + line('성격', esc(PETTRAIT.perName(id, me)))
            + line('스킬', (function () { const sk = PETTRAIT.skill(id); return sk ? esc(sk.n) + ' <span style="color:#6f685e;">— ' + esc(sk.d) + '</span>' : '-'; })()) : '')
        // ★ 여정 레벨 · 장비 (pet-gear.js · journey.js · 2026-10-28)
        + (window.PETGEAR ? line('여정 Lv', (function () {
            const lv = PETGEAR.lv(id, me), xp = PETGEAR.xp(id, me);
            return 'Lv ' + lv + (lv >= PETGEAR.LV_MAX ? ' <span style="color:#d4af37;">— 등급업 가능</span>' : ' <span style="color:#6f685e;">(' + xp + ' / ' + PETGEAR.needXp(lv) + ')</span>');
        })()) + line('장비', (function () {
            const g = PETGEAR.worn(id, me);
            return g ? esc(g) + ' <span style="color:#6f685e;">(' + esc(PETGEAR.addText(PETGEAR.BY[g].add)) + ')</span>' : '<span style="color:#8d8578;">없음</span>';
        })()) : '')
        + (window.PETRUNE ? line('룬', (function () {
            const r = PETRUNE.fed(id, me);
            return (r.length ? r.map(PETRUNE.tag).map(esc).join(' · ') : '<span style="color:#8d8578;">없음</span>')
                + ' <span style="color:#6f685e;">(' + r.length + '/' + PETRUNE.FED_MAX + ')</span>';
        })()) : '')
        + line('내 방', P().showHas(id, me)
            ? '<span style="color:#d4af37;">내놓는 중</span>'
            : '<span style="color:#8d8578;">아니오</span>')
        + line('교감', P().bond(id, me) + ' / ' + P().BOND_MAX
            + (P().bondFull(id, me)
                ? ' <span style="color:#d4af37;">— 대신 간다</span>' : ''))
        + line('포만도', (function () {
            const h = P().starveLeft(id, me);
            if (h <= 0) return '<span style="color:#e07a5f;">0 / 100 — 굶었습니다</span>';
            const m = Math.ceil(h / 60000), hh = Math.floor(m / 60);
            const t = hh >= 24 ? (Math.floor(hh / 24) + '일 ' + (hh % 24) + '시간')
                   : hh >= 1 ? (hh + '시간 ' + (m % 60) + '분') : (m + '분');
            const f = P().full(id, me);
            return '<span style="color:' + (h < 24 * 3600 * 1000 ? '#e07a5f' : '#e8d7b4')
                + ';">' + f + ' / 100</span>'
                + ' <span style="color:#6f685e;">· ' + t + ' 뒤에 굶습니다</span>';
        })())
        + (st ? line('지금', '<span style="color:' + st.c + ';">' + st.t + '</span>') : '')

        + '<button id="pet-room" class="game-btn" style="' + BTN + ' margin-top:12px;'
        + (P().showHas(id, me) ? GREY : '') + '">'
        + (P().showHas(id, me) ? '방에서 내린다' : '방에 내놓는다') + '</button>'
        + '<button id="pet-care" class="game-btn" style="' + BTN + '">쓰다듬고 먹인다</button>'
        + '<button id="pet-nick" class="game-btn" style="' + BTN + '">이름 붙이기</button>'
        + (window.PETRUNE ? '<button id="pet-rune" class="game-btn" style="' + BTN + '">룬 먹이기</button>' : '')
        + (window.PETGEAR ? '<button id="pet-gear" class="game-btn" style="' + BTN + '">장비</button>'
            + (PETGEAR.canGradeUp(id, me) ? '<button id="pet-up" class="game-btn" style="' + BTN + ' background:linear-gradient(145deg,#6b4a1d,#38250e) !important; border-color:#ffd766 !important; color:#ffe9bd !important;">등급업 — ' + esc(s.g || 'D') + ' → ' + esc(P().GRADES[PETGEAR.gradeIdx(id, me) + 1] || '') + '</button>' : '') : '')
        + (typeof window.petAdoptSend === 'function'
            ? '<button id="pet-adopt" class="game-btn" style="' + BTN + '">입양 보내기</button>' : '')
        + '<button id="pet-back" class="game-btn" style="' + BTN + GREY + '">목록으로</button>');

    w.querySelector('#pet-back').onclick = listView;
    w.querySelector('#pet-room').onclick = function () {
        const r = P().showToggle(id);
        try { if (typeof window.petRoomPaint === 'function') window.petRoomPaint(); } catch (e2) { }
        const nm = P().nick(id, me);
        if (r.on) {
            alert_(nm + P().josa(nm, '을') + ' 방에 내놓았습니다.'
                + (r.out ? ('\n\n' + P().nick(r.out, me) + P().josa(P().nick(r.out, me), '은')
                    + ' 자리를 비켰습니다.') : ''));
        } else {
            alert_(nm + P().josa(nm, '을') + ' 방에서 내렸습니다.');
        }
        oneView(id);
    };
    w.querySelector('#pet-care').onclick = function () {
        if (typeof window.petBondOpen === 'function') { shut(); window.petBondOpen(id); }
    };
    w.querySelector('#pet-nick').onclick = function () { nickView(id); };
    const rn = w.querySelector('#pet-rune');           // pet-rune.js 가 있을 때만 붙는다
    if (rn) rn.onclick = function () { shut(); window.petRuneFeedOpen(id, function () { oneView(id); }); };
    const gr = w.querySelector('#pet-gear');           // pet-gear.js
    if (gr) gr.onclick = function () { shut(); window.petGearOpen(id, function () { oneView(id); }); };
    const up = w.querySelector('#pet-up');
    if (up) up.onclick = function () {
        const r = PETGEAR.gradeUp(id);
        if (!r.ok) { alert_(r.why); return; }
        alert_(P().nick(id, me) + ' — ' + r.from + ' 등급에서 ' + r.to + ' 등급으로 올랐습니다.\n\n여정 Lv 1 부터 다시 오릅니다.');
        oneView(id);
    };
    const ad = w.querySelector('#pet-adopt');          // pet-adopt.js 가 있을 때만 붙는다
    if (ad) ad.onclick = function () { shut(); window.petAdoptSend(id); };
}

// ==========================================
// 이름 붙이기
// ==========================================
function nickView(id) {
    const me = u_();
    const p = P().BY[id];
    if (!me || !p) return;
    const now = P().named(id, me) ? P().nick(id, me) : '';
    const max = P().NICK_MAX;

    const w = box(
        '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">이름 붙이기</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:11px;">'
        + esc(p.n) + ' · ' + max + '자까지. 비워 두면 종 이름으로 돌아갑니다.</div>'
        + '<input id="pet-in" type="text" maxlength="' + max + '" inputmode="text"'
        + ' autocapitalize="off" autocorrect="off" spellcheck="false"'
        + ' placeholder="' + esc(p.n) + '" value="' + esc(now) + '"'
        + ' style="width:100%; padding:10px; font-size:13px; margin-bottom:11px;">'
        + '<button id="pet-ok" class="game-btn" style="' + BTN + '">붙인다</button>'
        + '<button id="pet-no" class="game-btn" style="' + BTN + GREY + '">그만둔다</button>');

    const f = w.querySelector('#pet-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 90);

    const go = function () {
        const r = P().rename(id, f.value);
        if (!r.ok) { alert_(r.why); return; }
        oneView(id);
    };
    w.querySelector('#pet-ok').onclick = go;
    w.querySelector('#pet-no').onclick = function () { oneView(id); };
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
}

// ==========================================
// 떠 있는 단추
// ==========================================
function want() {
    const me = u_();
    if (!me) return false;
    const main = document.getElementById('main-screen');
    if (!main || main.style.display === 'none') return false;
    if (typeof darkRun !== 'undefined' && darkRun) return false;
    if (document.getElementById(MOD)) return false;
    return true;
}

setInterval(function () {
    try {
        let b = document.getElementById(FAB);
        if (!want()) { if (b) b.remove(); return; }
        if (b) return;
        b = document.createElement('button');
        b.id = FAB;
        b.type = 'button';
        b.textContent = '🐶 펫';
        b.style.cssText = 'position:fixed; right:12px; z-index:9997;'
            + ' bottom:calc(16px + env(safe-area-inset-bottom)); padding:9px 13px;'
            + ' border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;'
            + ' background:linear-gradient(145deg,#6b4a1d,#38250e); border:1px solid #c9a227;'
            + ' color:#ffe9bd; box-shadow:0 3px 10px rgba(0,0,0,0.6);';
        b.onclick = listView;
        document.body.appendChild(b);
    } catch (e) { }
}, 1200);

window.petOpen = listView;
window.petShut = shut;

console.log('[펫] petOpen()');

})();
