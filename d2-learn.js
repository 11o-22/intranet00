// ==========================================
// ★ 🧸 봉제인형 전투 2차 — 조는 도깨비 · 기술 관리 화면 (배우기 · 잊기 · 교환 · 자리 바꾸기)
// bundles.json 마지막 묶음 — d2-items.js 뒤 (D2 · D2SK · DOLL · PET 를 쓴다)
// ==========================================
//
// 2026-11-10 사용자 「인형 전투 시스템 2차.xlsx — 단계별로 쭉 갈아엎자」 — 5단계
//   기획 탭 「조는 도깨비」 01 · 02 · 05 · 06 을 옮겼다. 조는 도깨비 메뉴에 붙이는 것은 마지막 단계 (지금은 d2LearnOpen()).
//
// ■ 화면
//   위   선택한 동행 인형 — 이름 · Lv · 등급 · 성격 · [대상 변경]
//   가운데 배울 수 있는 기술 (스크롤) — 이름 / 번호 · 속성 · PP / 설명 한 줄 · [상세] [배우기]
//   아래 고정 — 공격기 3칸 · 유틸기 2칸 (전투 버튼 순서) — 누르면 상세 · 잊기 · 자리 바꾸기
//   기획은 길게 눌러 끌기지만, 손가락 화면에서 확실하게 되도록 **눌러서 고르고 칸을 눌러 놓는** 식으로 했다 (같은 규칙 · 같은 출력문).
//
// ■ 규칙 (D2SK 가 지킨다)
//   배우기 → 같은 분류의 빈칸(MSG-101) 또는 차 있는 칸과 교환(MSG-103) · 다른 분류 칸은 비활성(MSG-105)
//   잊기 → MSG-102 · 마지막 1개는 MSG-115 · PP 기록은 남는다
//   자리 바꾸기 → 같은 분류 안에서 (MSG-104) · 변화 없으면 조용히
//   저장 — 유효한 변경 직후 바로 (pets/<열쇠>/mv · pp) · 실패하면 되돌리고 MSG-106
//
// ■ 콘솔
//   d2LearnOpen(열쇠)   기술 관리 (열쇠 없으면 동행 인형 고르기)

(function d2learn() {
'use strict';

function D2() { return window.D2; }
function SK() { return window.D2SK; }
function DL() { return window.DOLL; }
function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function alert_(t) { try { if (typeof showCustomAlert === 'function') return showCustomAlert(t); } catch (e) { } console.log(t); }
function fix(t) { try { return window.D2BT.fix(t); } catch (e) { return String(t); } }
function copy(o) { return JSON.parse(JSON.stringify(o)); }

function css() {
    if (document.getElementById('d2l-css')) return;
    const s = document.createElement('style'); s.id = 'd2l-css';
    s.textContent = [
        '.d2l-dim{position:fixed;inset:0;z-index:99998;background:rgba(5,3,10,.6);display:flex;align-items:flex-end;justify-content:center}',
        '.d2l-pan{width:100%;max-width:440px;height:88vh;display:flex;flex-direction:column;background:#1c1528;border:2px solid #a78bdb;border-bottom:0;border-radius:14px 14px 0 0;color:#eee;font-size:13px;overflow:hidden}',
        '.d2l-head{padding:12px 14px 8px;border-bottom:1px solid #3d2f5c}.d2l-head h3{margin:0 0 6px;font-size:15px;color:#ffe6b8;display:flex;justify-content:space-between;align-items:center}',
        '.d2l-x{background:none;border:1px solid #666;color:#ccc;border-radius:6px;padding:3px 9px;font-size:12px}',
        '.d2l-who{display:flex;gap:10px;align-items:center}.d2l-who .pic{width:44px;height:44px;border-radius:8px;background:#2a2140;flex:none;background-size:cover;background-position:center}',
        '.d2l-who .n{flex:1;min-width:0}.d2l-who .n b{display:block}.d2l-who .n small{color:#a99cc4;font-size:11px}',
        '.d2l-list{flex:1;overflow:auto;padding:8px 14px}.d2l-sub{color:#a99cc4;font-size:11px;margin:4px 0 6px}',
        '.d2l-row{display:flex;gap:8px;align-items:center;padding:7px 8px;border:1px solid #3d2f5c;border-radius:8px;margin:6px 0;background:rgba(0,0,0,.25)}',
        '.d2l-row .n{flex:1;min-width:0}.d2l-row .n b{display:block;font-size:13px}.d2l-row .n small{color:#a99cc4;font-size:11px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.d2l-row.sel{border-color:#ffd766;background:rgba(255,215,102,.08)}',
        '.d2l-tag{font-size:10px;padding:1px 5px;border-radius:4px;background:#3d2f5c;color:#d9cff2;margin-left:4px}',
        '.d2l-btn{background:linear-gradient(145deg,#6b4a1d,#38250e);border:1px solid #ffd766;color:#ffe6b8;border-radius:8px;padding:7px 10px;font-size:12px;white-space:nowrap}',
        '.d2l-ghost{background:#2a2a2a;border:1px solid #555;color:#ccc;border-radius:8px;padding:7px 10px;font-size:12px;white-space:nowrap}',
        '.d2l-foot{border-top:1px solid #3d2f5c;padding:8px 14px calc(env(safe-area-inset-bottom) + 10px);background:#17112a}',
        '.d2l-lab{color:#ffd766;font-size:11px;margin:4px 0 2px}',
        '.d2l-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.d2l-slots.u{grid-template-columns:repeat(2,1fr)}',
        '.d2l-slot{min-height:46px;border:1px solid #3d2f5c;border-radius:8px;background:rgba(0,0,0,.3);padding:5px 6px;text-align:left;color:#eee;font-size:12px;line-height:1.3}',
        '.d2l-slot small{display:block;color:#a99cc4;font-size:10px}.d2l-slot.empty{color:#777;border-style:dashed}',
        '.d2l-slot.ok{border-color:#ffd766;box-shadow:0 0 0 1px #ffd766 inset}.d2l-slot.no{opacity:.35}.d2l-slot.mv{border-color:#9fd8ef}',
        '.d2l-hint{font-size:11px;color:#ffd766;margin:4px 0 0;min-height:14px}',
        '.d2l-menu{position:fixed;left:0;right:0;bottom:0;z-index:99999;max-width:440px;margin:0 auto;background:#241b38;border:1px solid #a78bdb;border-bottom:0;border-radius:12px 12px 0 0;padding:10px 14px calc(env(safe-area-inset-bottom) + 12px)}',
        '.d2l-menu button{display:block;width:100%;margin:6px 0;padding:10px;border-radius:8px;border:1px solid #555;background:#2a2a2a;color:#eee;font-size:13px}'
    ].join('\n');
    document.head.appendChild(s);
}
function shut() { const e = document.getElementById('d2l-dim'); if (e) e.remove(); const m = document.getElementById('d2l-menu'); if (m) m.remove(); }
function withDolls(u) { const D = DL(); const ds = D.dolls(u); let list = []; try { list = D.withList(u); } catch (e) { list = Object.keys(ds); } return list.map(function (k) { return ds[String(k)]; }).filter(Boolean); }
function picOf(d) { try { return window.PET.icon(d.id); } catch (e) { return ''; } }

// ── 저장 — 바로 · 실패하면 되돌린다
function save(d, before, msg) {
    const u = u_(), p = {};
    p['pets/' + d.id + '/mv'] = d.mv; p['pets/' + d.id + '/pp'] = d.pp || {};
    let pr; try { pr = DL().put(p, u); } catch (e) { pr = Promise.resolve(false); }
    return Promise.resolve(pr).then(function (okk) {
        if (okk === false) { d.mv = before.mv; d.pp = before.pp; alert_('변경 내용을 저장하지 못했다. 다시 시도해 주세요.'); return false; }
        if (msg) alert_(msg);
        return true;
    });
}

// ── 창
const ST = { k: null, pend: null, mv: null };          // pend: 배울 기술 번호 · mv: 옮기는 { slot, i }
function open(key) {
    const u = u_(), D = DL(); if (!u || !D) return;
    css(); shut();
    const dolls = withDolls(u);
    if (!dolls.length) { alert_('선택할 수 있는 인형이 없다!'); return; }
    if (key == null || !dolls.some(function (d) { return String(d.id) === String(key); })) { pickDoll(dolls); return; }
    ST.k = String(key); ST.pend = null; ST.mv = null;
    paint();
}
function pickDoll(dolls) {
    const D = DL();
    const dim = document.createElement('div'); dim.id = 'd2l-dim'; dim.className = 'd2l-dim';
    dim.addEventListener('click', function (e) { if (e.target === dim) shut(); });
    const pan = document.createElement('div'); pan.className = 'd2l-pan'; pan.style.height = 'auto'; pan.style.maxHeight = '86vh';
    let h = '<div class="d2l-head"><h3>관리할 동행 인형 선택 <button class="d2l-x">닫기</button></h3><div class="d2l-sub">인형을 눌러 기술 관리로 · 보관함 인형은 여기 없다</div></div><div class="d2l-list" style="padding-bottom:14px">';
    dolls.forEach(function (d) { const s = D2().statsOf(d); h += '<div class="d2l-row" data-k="' + esc(d.id) + '"><div class="pic d2l-pic" style="width:40px;height:40px;border-radius:8px;background:#2a2140 url(' + esc(picOf(d)) + ') center/cover"></div><div class="n"><b>' + esc(D.nickOf(d)) + '</b><small>Lv ' + s.lv + ' · ' + s.g + ' 등급 · ' + esc(D2().perOf(d).n) + ' · 기술 ' + SK().count(d) + '/5</small></div><button class="d2l-btn">기술 관리</button></div>'; });
    h += '</div>';
    pan.innerHTML = h; dim.appendChild(pan); document.body.appendChild(dim);
    pan.querySelector('.d2l-x').onclick = shut;
    Array.prototype.forEach.call(pan.querySelectorAll('.d2l-row'), function (row) { row.querySelector('button').onclick = function () { open(row.getAttribute('data-k')); }; });
}
function paint() {
    const u = u_(), D = DL(), S = SK();
    const d = D.dolls(u)[ST.k]; if (!d) { shut(); return; }
    css();
    let dim = document.getElementById('d2l-dim');
    if (!dim) { dim = document.createElement('div'); dim.id = 'd2l-dim'; dim.className = 'd2l-dim'; dim.addEventListener('click', function (e) { if (e.target === dim) shut(); }); document.body.appendChild(dim); }
    const m = document.getElementById('d2l-menu'); if (m) m.remove();
    const st = D2().statsOf(d), mv = S.mvOf(d), learn = S.learnable(d);
    const pendSk = ST.pend ? S.get(ST.pend) : null;
    let h = '<div class="d2l-pan">';
    h += '<div class="d2l-head"><h3>기술 관리 <button class="d2l-x">닫기</button></h3><div class="d2l-who"><div class="pic" style="background-image:url(' + esc(picOf(d)) + ')"></div><div class="n"><b>' + esc(D.nickOf(d)) + '</b><small>Lv ' + st.lv + ' · ' + st.g + ' 등급 · ' + esc(D2().perOf(d).n) + ' · ' + esc(S.elName(D.attOf(d))) + ' · 기술 ' + S.count(d) + '/5</small></div><button class="d2l-ghost d2l-chg">대상 변경</button></div></div>';
    h += '<div class="d2l-list"><div class="d2l-sub">배울 수 있는 기술 ' + learn.length + '개 — 짧게: 상세 · [배우기] 를 누른 뒤 아래 칸을 누르면 그 칸에 들어간다</div>';
    learn.forEach(function (no) {
        const sk = S.get(no);
        h += '<div class="d2l-row' + (ST.pend === no ? ' sel' : '') + '" data-no="' + no + '"><div class="n"><b>' + esc(sk.n) + '<span class="d2l-tag">' + (sk.slot === 'A' ? '공격기' : '유틸기') + '</span></b><small>#' + sk.no + ' · ' + esc(S.elName(sk.el, d)) + ' · PP ' + S.ppOf(d, no) + '/' + sk.pp + (sk.pw ? ' · 위력 ' + sk.pw : '') + ' · 명중 ' + esc(S.accText(sk)) + '</small><small>' + esc(sk.desc) + '</small></div><button class="d2l-ghost d2l-det">상세</button><button class="d2l-btn d2l-learn">' + (ST.pend === no ? '취소' : '배우기') + '</button></div>';
    });
    h += '</div>';
    // 아래 — 칸 다섯
    const slotHtml = function (slot, i, no) {
        const sk = no ? S.get(no) : null;
        let cls = 'd2l-slot' + (sk ? '' : ' empty');
        if (pendSk) cls += pendSk.slot === slot ? ' ok' : ' no';
        if (ST.mv) cls += ST.mv.slot === slot ? (ST.mv.i === i ? ' mv' : ' ok') : ' no';
        return '<button class="' + cls + '" data-slot="' + slot + '" data-i="' + i + '">' + (sk ? esc(sk.n) + '<small>PP ' + S.ppOf(d, no) + '/' + sk.pp + ' · ' + esc(S.elName(sk.el, d)) + '</small>' : (slot === 'A' ? '공격기 ' : '유틸기 ') + (i + 1) + '<small>빈칸</small>') + '</button>';
    };
    h += '<div class="d2l-foot"><div class="d2l-lab">공격기 3칸</div><div class="d2l-slots">' + mv.a.map(function (no, i) { return slotHtml('A', i, no); }).join('') + '</div>';
    h += '<div class="d2l-lab">유틸기 2칸</div><div class="d2l-slots u">' + mv.u.map(function (no, i) { return slotHtml('U', i, no); }).join('') + '</div>';
    h += '<div class="d2l-hint">' + (pendSk ? esc(pendSk.n) + ' — ' + (pendSk.slot === 'A' ? '공격기' : '유틸기') + ' 칸을 누르세요 (빈칸이면 배우고, 차 있으면 바꿉니다)' : ST.mv ? '바꿀 칸을 누르세요' : '칸을 누르면 상세 · 잊기 · 자리 바꾸기') + '</div></div>';
    h += '</div>';
    dim.innerHTML = h;
    const pan = dim.firstChild;
    pan.querySelector('.d2l-x').onclick = shut;
    pan.querySelector('.d2l-chg').onclick = function () { shut(); pickDoll(withDolls(u)); };
    Array.prototype.forEach.call(pan.querySelectorAll('.d2l-row'), function (row) {
        const no = Number(row.getAttribute('data-no'));
        row.querySelector('.d2l-det').onclick = function () { alert_(S.detail(no, d)); };
        row.querySelector('.d2l-learn').onclick = function () { ST.mv = null; ST.pend = (ST.pend === no) ? null : no; paint(); };
    });
    Array.prototype.forEach.call(pan.querySelectorAll('.d2l-slot'), function (b) {
        const slot = b.getAttribute('data-slot'), i = Number(b.getAttribute('data-i'));
        b.onclick = function () { onSlot(d, slot, i); };
    });
}
function onSlot(d, slot, i) {
    const S = SK(), D = DL(), mv = S.mvOf(d), row = slot === 'A' ? mv.a : mv.u, cur = row[i] || 0;
    if (ST.pend) {                                                  // 배우기 · 교환
        const sk = S.get(ST.pend);
        if (sk.slot !== slot) { alert_('공격기는 공격기 칸에, 유틸기는 유틸기 칸에 놓아 주세요.'); return; }
        const before = { mv: copy(d.mv || {}), pp: copy(d.pp || {}) };
        const r = S.learn(d, ST.pend, i);
        if (!r.ok) { alert_(r.why); return; }
        const no = ST.pend; ST.pend = null;
        const msg = r.forgot ? fix(D.nickOf(d) + '의 ' + S.get(r.forgot).n + '을/를 ' + S.get(no).n + '으로/로 바꿨다!') : fix(D.nickOf(d) + '은/는 ' + S.get(no).n + '을/를 배웠다!');
        save(d, before, msg).then(paint);
        return;
    }
    if (ST.mv) {                                                    // 자리 바꾸기
        if (ST.mv.slot !== slot) { alert_('공격기는 공격기 칸에, 유틸기는 유틸기 칸에 놓아 주세요.'); return; }
        const from = ST.mv; ST.mv = null;
        if (from.i === i) { paint(); return; }
        const before = { mv: copy(d.mv || {}), pp: copy(d.pp || {}) };
        const r = S.move(d, slot, from.i, i);
        if (!r.ok) { alert_(r.why); paint(); return; }
        save(d, before, '기술 순서를 변경했다!').then(paint);
        return;
    }
    if (!cur) return;
    menu(d, slot, i, cur);
}
function menu(d, slot, i, no) {
    const S = SK(), D = DL();
    const old = document.getElementById('d2l-menu'); if (old) old.remove();
    const m = document.createElement('div'); m.id = 'd2l-menu'; m.className = 'd2l-menu';
    m.innerHTML = '<div style="color:#ffe6b8;font-size:13px;margin-bottom:4px">' + esc(S.get(no).n) + ' <small style="color:#a99cc4">PP ' + S.ppOf(d, no) + '/' + S.get(no).pp + '</small></div><button class="d2l-m-det">상세</button><button class="d2l-m-mv">자리 바꾸기</button><button class="d2l-m-fg" style="border-color:#8a4a4a">잊기</button><button class="d2l-m-x">닫기</button>';
    document.body.appendChild(m);
    m.querySelector('.d2l-m-x').onclick = function () { m.remove(); };
    m.querySelector('.d2l-m-det').onclick = function () { alert_(S.detail(no, d)); };
    m.querySelector('.d2l-m-mv').onclick = function () { m.remove(); ST.pend = null; ST.mv = { slot: slot, i: i }; paint(); };
    m.querySelector('.d2l-m-fg').onclick = function () {
        m.remove();
        const before = { mv: copy(d.mv || {}), pp: copy(d.pp || {}) };
        const r = S.forget(d, no);
        if (!r.ok) { alert_(r.why); return; }
        save(d, before, fix(D.nickOf(d) + '은/는 ' + S.get(no).n + '을/를 잊었다!')).then(paint);
    };
}

window.D2LN = { open: open, shut: shut, paint: paint, state: ST };
window.d2LearnOpen = open;
console.log('[🧸 2차] d2LearnOpen(열쇠)');
})();
