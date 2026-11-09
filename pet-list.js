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
let showAll = false;            // ★ 목록 — 동행 중인 셋만(기본) ↔ 가진 인형 전부 (창을 닫아도 이번 접속 동안은 기억) (2026-11-08)

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

function cell(p, key) {
    const me = u_();
    const ps = P().pets(me);
    const k = key != null ? Number(key) : p.i;          // ★ 같은 종 둘째부터는 113 · 213 … (pet-data.js newKey)
    const s = ps[String(k)];
    const img = P().icon(k);

    if (!s) {
        // 입양 전 — 어둡게
        return '<div style="text-align:center; padding:4px 2px; opacity:0.85;">'
            + '<div style="height:4px; margin:0 3px 2px 3px;"></div><div style="height:4px; margin:0 3px 2px 3px;"></div>'
            + '<div style="width:100%; aspect-ratio:1/1; display:flex; align-items:center;'
            + ' justify-content:center; border:1px solid #2a2622; border-radius:7px;'
            + ' background:rgba(0,0,0,0.5);">'
            + '<img src="' + img + '" alt="" style="max-width:88%; max-height:88%;'
            + ' image-rendering:pixelated; filter:brightness(0.14) grayscale(1);">'
            + '</div>'
            + '<div style="font-size:8.5px; color:#5a544c; margin-top:3px; line-height:1.2;">아직 없음</div>'
            + '</div>';
    }

    const st = statusOf(s);
    const nick = P().nick(k, me);
    const inRoom = P().showHas(k, me);
    // ★ 막대 둘 — 체력(전투 체력 색 · 초록→노랑→빨강) · 배고픔(흰색 · 포만도) (2026-11-08 사용자 「게이지도 두 개로 — 체력과 배고픔, 배고픔은 흰색」)
    //   (2026-10-29 에는 포만도(초록) · 상처 깊이(붉음)였다 — 상처는 🩹 표시와 글로 남긴다)
    let full = 0; try { full = Math.max(0, Math.min(100, Number(P().full(k, me)) || 0)); } catch (e) { }
    let hpr = 1; try { const d = window.DOLL.dolls(me)[String(k)]; hpr = Math.max(0, Math.min(1, window.DOLL.hpOf(d) / (window.DOLL.stats(d).max || 1))); } catch (e) { }
    const hurt = (s.hurt && typeof s.hurt === 'object') ? s.hurt : null;
    const deep = hurt ? Math.max(0, Math.min(100, Number(hurt.deep) || 0)) : 0;
    const hpCol = hpr > 0.5 ? '#4cd964' : (hpr > 0.2 ? '#ffcc00' : '#ff3b30');
    const bars = '<div style="height:4px; border-radius:2px; background:rgba(255,255,255,0.08); margin:0 3px 2px 3px; overflow:hidden;" title="체력 ' + Math.round(hpr * 100) + '%">'
        + '<div style="height:100%; width:' + Math.round(hpr * 100) + '%; background:' + hpCol + ';"></div></div>'
        + '<div style="height:4px; border-radius:2px; background:rgba(255,255,255,0.08); margin:0 3px 2px 3px; overflow:hidden;" title="배고픔 — 포만도 ' + full + '%">'
        + '<div style="height:100%; width:' + full + '%; background:#f4f1ea;"></div></div>';
    return '<div class="pet-cell" data-i="' + k + '" style="text-align:center; padding:4px 2px;'
        + ' cursor:pointer;">'
        + bars
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
        + (hurt ? '<span style="position:absolute; top:-4px; left:' + (inRoom ? '10px' : '-3px') + '; font-size:9px; line-height:1;" title="다침">🩹</span>' : '')
        + (st ? '<span style="position:absolute; bottom:1px; left:1px; right:1px; font-size:7.5px;'
            + ' color:' + st.c + '; background:rgba(0,0,0,0.72);">' + st.t + '</span>'
            : (hurt ? '<span style="position:absolute; bottom:1px; left:1px; right:1px; font-size:7.5px; color:#ff8a80; background:rgba(0,0,0,0.72);">다침 · 깊이 ' + deep + '</span>' : ''))
        + '</div>'
        + '<div style="font-size:8.5px; color:#e8d7b4; margin-top:3px; line-height:1.2;'
        + ' overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + esc(nick) + '</div>'
        + '</div>';
}

function listView() {
    const me = u_();
    if (!me) { alert_('로그인 뒤에 쓸 수 있습니다.'); return; }
    const L = P().LIST;
    const mine = Object.keys(P().pets(me)).filter(function (k) { return P().BY[k]; });
    const have = mine.length;
    // ★ 기본은 동행 중인 셋만 · 위 단추로 가진 인형 전부 (2026-11-08 사용자 「동행 중인 펫 세 마리만 기본으로 · 위에 버튼 누르면 보유 중인 펫 전부」)
    //   전부 볼 때는 2026-11-07 처럼 — 종 차례로 · 같은 종 여럿은 그 종 칸 뒤에 · 없는 종은 안 보이게
    let withIds = mine;
    try { if (window.DOLL && DOLL.withList) withIds = DOLL.withList(me).map(String).filter(function (k) { return P().BY[k] && P().pets(me)[k]; }); } catch (e) { }
    const PM = (window.DOLL && DOLL.PARTY_MAX) || 3;
    const cells = [];
    if (showAll) {
        L.forEach(function (p) {
            const owned = mine.filter(function (k) { return P().sp(k) === p.i; }).sort(function (a, b) { return a - b; });
            owned.forEach(function (k) { cells.push(Number(k) === p.i ? cell(p) : cell(p, k)); });
        });
    } else {
        withIds.forEach(function (k) { const p = P().BY[k]; cells.push(Number(k) === p.i ? cell(p) : cell(p, k)); });
    }
    if (!cells.length) cells.push('<div style="grid-column:1/-1; font-size:10.5px; color:#6f685e; padding:14px 0; text-align:center;">' + (have ? '동행 중인 인형이 없습니다 — 보관소(펫박스)에서 동행으로 옮깁니다.' : '아직 인형이 없습니다 — 출몰지에서 포옹 리본으로 잡아 옵니다.') + '</div>');

    const grid = '<div style="display:grid; grid-template-columns:repeat(' + COLS + ',1fr);'
        + ' gap:5px;">' + cells.join('') + '</div>';

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">'
        + '<span style="font-size:13px; color:#ffcf8f; font-weight:bold;">🧸 인형</span>'
        + '<span style="font-size:10px; color:#8d8578;">동행 중 ' + withIds.length + ' / ' + PM + ' · 전체 ' + have + '마리</span>'
        + '</div>'
        + '<button id="pet-all" class="game-btn" style="' + BTN + ' padding:8px; font-size:11px;' + (showAll ? '' : GREY) + '">'
        + (showAll ? '동행 중인 인형만 본다' : '가진 인형 전부 본다 (' + have + '마리)') + '</button>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:10px; line-height:1.6;">'
        + (showAll ? '가진 인형 전부입니다. 동행 중인 인형은 금빛 테두리 · ' : '동행 중인 인형만 보입니다. 맡겨 둔 인형은 위 단추나 도깨비 공방 보관소(펫박스)에서 봅니다. ')
        + '🏠 표시가 지금 방에 있는 ' + P().SHOW_MAX + '마리입니다. 그림 위 막대 — 위는 체력, 아래 흰 막대는 배고픔(포만도)입니다.</div>'
        + (window.DOLL && DOLL.artSwitchHtml ? DOLL.artSwitchHtml() : '')      // 🔘 옛 펫 외형 ↔ 봉제인형
        + grid
        + '<button id="pet-x" class="game-btn" style="' + BTN + GREY + ' margin-top:11px;">닫는다</button>');

    w.querySelector('#pet-x').onclick = shut;
    w.querySelector('#pet-all').onclick = function () { showAll = !showAll; listView(); };
    try { if (window.DOLL && DOLL.artSwitchWire) DOLL.artSwitchWire(w, function () { listView(); }); } catch (e) { }   // 켜고 끄면 그림을 바꿔 다시 그린다
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
        // 성별 · 기질 (pet-trait.js — 「성격」 이름은 인형 전투 2차의 특기 성격이 쓴다 · 옛 동물 스킬 줄은 뺐다 · 2026-11-10)
        + (window.PETTRAIT ? line('성별', esc(PETTRAIT.sexName(PETTRAIT.sex(id, me))))
            + line('기질', esc(PETTRAIT.perName(id, me))) : '')
        // ★ 인형 전투 2차 — 레벨 · 경험치 · 각성 돌파 · 성격 · 특성 · 능력치 · 기술 (6단계 · 2026-11-10 · d2-core.js · d2-skills.js · d2-traits.js)
        + (window.D2 && window.DOLL ? (function () {
            const D = window.DOLL, d = D.dolls(me)[String(id)];
            if (!d) return '';
            const st = D.stats(d), need = D2.R(st.lv), wait = D2.waiting(d);
            let h = line('Lv', 'Lv ' + st.lv + (need ? ' <span style="color:#6f685e;">(' + (Number(d.xp) || 0) + ' / ' + need + (wait ? ' · 각성 돌파 필요' : ' · 상한 Lv ' + D.lvMaxOf(d)) + ')</span>' : ' <span style="color:#d4af37;">— 최대</span>'));
            h += line('각성 돌파', (function () {
                const nd = D.gradeNeed(id, me);
                if (!nd.rune) return '<span style="color:#6f685e;">' + esc(nd.why) + '</span>';
                return '<span style="color:' + (nd.have ? '#9fd8ef' : '#6f685e') + ';">💠 ' + esc(nd.rune) + ' ' + nd.have + '개</span>' + ' <span style="color:#6f685e;">' + (nd.ok ? '· 돌파 가능' : '· ' + esc(nd.why)) + '</span>';
            })());
            const pr = D2.perOf(d);
            h += line('성격', esc(pr.n) + ' <span style="color:#6f685e;">(특기 ' + esc(D2.NAME[pr.a]) + ' · ' + esc(D2.NAME[pr.b]) + ')</span>');
            if (window.D2TR) { const tr = D2TR.get(D2TR.trOf(d)); h += line('특성', tr ? esc(tr.n) + (tr.rare ? ' <span style="color:#d4af37;">희귀</span>' : '') + ' <span style="color:#6f685e;">— ' + esc(tr.e) + '</span>' : '-'); }
            h += line('능력치', 'HP ' + st.hp + '/' + st.max + ' · 공 ' + st.atk + ' · 매 ' + st.chm + ' · 방 ' + st.def + ' · 굳 ' + st.sta + ' · 속 ' + st.spd);
            if (window.D2SK) {
                const mv = D2SK.mvOf(d), nm = function (no) { return no ? esc(D2SK.get(no).n) + ' <span style="color:#6f685e;">' + D2SK.ppOf(d, no) + '/' + D2SK.get(no).pp + '</span>' : '<span style="color:#5f594f;">빈칸</span>'; };
                h += line('공격기', mv.a.map(nm).join('<br>')) + line('유틸기', mv.u.map(nm).join('<br>'));
            }
            return h;
        })() : '')
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
        // 🧸 데리고 다니기 — 광장 · 출몰지 같은 곳에서 뒤를 따라다닌다 (doll-walk.js · 2026-11-07 사용자)
        + (window.DOLLWALK ? line('데리고 다니기', (String(window.DOLLWALK.key(me)) === String(id))
            ? '<span style="color:#d4af37;">따라다니는 중</span> <span style="color:#6f685e;">— 광장 · 출몰지에서 뒤를 따라온다</span>'
            : '<span style="color:#8d8578;">아니오</span>') : '')

        + '<button id="pet-room" class="game-btn" style="' + BTN + ' margin-top:12px;'
        + (P().showHas(id, me) ? GREY : '') + '">'
        + (P().showHas(id, me) ? '방에서 내린다' : '방에 내놓는다') + '</button>'
        + (window.DOLLWALK ? '<button id="pet-walk" class="game-btn" style="' + BTN + (String(window.DOLLWALK.key(me)) === String(id) ? GREY : '') + '">'
            + (String(window.DOLLWALK.key(me)) === String(id) ? '그만 데리고 다닌다' : '데리고 다닌다 — 광장 · 출몰지에서 따라온다') + '</button>' : '')
        + '<button id="pet-care" class="game-btn" style="' + BTN + '">쓰다듬고 먹인다</button>'
        + '<button id="pet-nick" class="game-btn" style="' + BTN + '">이름 붙이기</button>'
        + (window.PETRUNE ? '<button id="pet-rune" class="game-btn" style="' + BTN + '">룬 먹이기</button>' : '')
        + ((window.DOLL && window.D2 && DOLL.gradeNeed(id, me).ok) ? '<button id="pet-up" class="game-btn" style="' + BTN + ' background:linear-gradient(145deg,#6b4a1d,#38250e) !important; border-color:#ffd766 !important; color:#ffe9bd !important;">각성 돌파 — ' + esc(s.g || 'D') + ' → ' + esc(DOLL.gradeNeed(id, me).to || '') + '</button>' : '')
        // ✗ 입양 보내기 — 도깨비 공방 교환소로 바뀌었다 (2026-11-07)
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
    const wk = w.querySelector('#pet-walk');
    if (wk) wk.onclick = function () {
        const on = String(window.DOLLWALK.key(me)) === String(id);
        const nm = P().nick(id, me);
        if (on) { window.DOLLWALK.set(null, me); alert_(nm + P().josa(nm, '은') + ' 이제 따라다니지 않습니다.'); }
        else { window.DOLLWALK.set(id, me); alert_(nm + P().josa(nm, '이') + ' 광장 · 출몰지에서 뒤를 따라다닙니다.\n\n데리고 다니는 인형은 하나입니다.'); }
        oneView(id);
    };
    w.querySelector('#pet-care').onclick = function () {
        if (typeof window.petBondOpen === 'function') { shut(); window.petBondOpen(id); }
    };
    w.querySelector('#pet-nick').onclick = function () { nickView(id); };
    const rn = w.querySelector('#pet-rune');           // pet-rune.js 가 있을 때만 붙는다
    if (rn) rn.onclick = function () { shut(); window.petRuneFeedOpen(id, function () { oneView(id); }); };
    const up = w.querySelector('#pet-up');             // 각성 돌파 (d2-core.js — 레벨은 그대로, 등급만 다음으로)
    if (up) up.onclick = function () {
        const r = window.DOLL.gradeUp(id, me);
        if (!r.ok) { alert_(r.why); return; }
        alert_(P().nick(id, me) + ' — 각성 돌파! ' + r.from + ' 등급에서 ' + r.to + ' 등급으로 올랐습니다.\n\nLv ' + r.lv + ' 그대로 이어서 오릅니다.' + (r.up ? ' (쌓인 경험치로 바로 Lv ' + r.lv + ')' : ''));
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
        b.textContent = '🧸 인형';
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
window.petOneOpen = oneView;          // 보관소(펫박스)의 「돌보기」 — 인형 하나의 창 (doll-gong.js · 2026-11-08)
window.petShut = shut;

console.log('[인형] petOpen()');

})();
