// ==========================================
// ★ 🔎 판정 보정 점검 — 전체 사원 (상담사 콘솔 · 2026-10-19)
// bundles.json 마지막 묶음, s3-period.js 뒤
// ==========================================
//
// ■ 무엇을 보나
//   어둠 탐사 판정의 「보정 +N」은 rollDarkBonus 한 곳을 여러 파일이 겹겹이 감싸서 만든다.
//   사원마다 그 판정에 상시로 붙는 몫을 출처별로 늘어놓고, 많은 차례로 세운다.
//     고유 아이템(찼을 때 · 상담사가 얹은 몫 포함) · 임시 버프(은화 뱀 · 식당 …) · 포승줄 · 은심장
//     · 장비(착한 친구 · 플러그 · 루비 · 사인참사검 · ??? 안경 · 에메랄드 목줄) · 속성(감각 · 은신)
//     · 횟수형(배터리 · 성냥) · 오염도
//   구역 등급 깎기 · 장면마다 붙는 몫(동거인 · 소모품 · 감염)은 판마다 달라 넣지 않았다.
//
// ■ 고치기 전 (겹쳤던 몫)
//   2026-10-19 까지는 두 군데서 같은 몫이 두 번 들어갔다.
//     ① 고유 아이템 성능을 구울 때 그 사원의 버프 · 포승줄 · 은심장까지 같이 구웠고,
//        판정 때 그 버프를 한 번 더 더했다 → 고유 아이템을 찬 사원은 버프가 두 번.
//     ② 상담사가 얹어 준 몫(dnaExtra)이 고유 아이템에도, 버프에도 들어갔다 → 얹은 몫이 두 번
//        (고유를 안 차도 버프 쪽으로 한 번은 들어갔다).
//   「겹쳤던 몫」은 그때 더 붙던 양이다. 이번에 고쳤으니 지금 합계에는 없다.
//   (판정 +N 말고 행운 · 회피 · 기믹 · 즉사 회피 횟수와 어둠 탐사 횟수도 같은 길이라 같이 고쳐졌다)
//
// ■ 콘솔
//   bonusAudit()        표로
//   bonusAudit('4892')  한 사원 내역

(function bonusAudit() {

const ADMIN = 'kario0987';
const BOX = 'admin-bonus-box';

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function users() { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; }
function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function base(w) { try { return getEquipBaseName(w); } catch (e) { return w; } }
function wears(u, name) { return (u.equippedWeapons || []).some(function (w) { return base(w) === name; }); }
function safe(f, d) { try { const v = f(); return (v == null || isNaN(v)) ? d : v; } catch (e) { return d; } }

function dnaWorn(u) {
    const list = u.equippedWeapons || [];
    for (let i = 0; i < list.length; i++) {
        const cat = (typeof ITEM_CATALOG !== 'undefined') ? (ITEM_CATALOG[base(list[i])] || ITEM_CATALOG[list[i]]) : null;
        if (cat && cat.effect === 'equip_dna') {
            const eff = (typeof dnaEffOf === 'function') ? (dnaEffOf(cat) || {}) : (cat.dnaEff || {});
            return { name: base(list[i]).split(' · ')[0], eff: eff, own: cat.dnaOwner === u.code };
        }
    }
    return null;
}

function rowOf(c) {
    const u = users()[c];
    if (!u || !u.name) return null;
    const P = [];                     // [이름, 값]
    const add = function (n, v) { v = Math.round(Number(v) || 0); if (v) P.push([n, v]); return v; };
    let now = 0;

    // 고유 아이템
    const dw = dnaWorn(u);
    const ex = Number((u.dnaExtra || {}).bon) || 0;
    if (dw) now += add('고유 「' + dw.name + '」' + (dw.own && ex ? ' (얹은 몫 +' + ex + ' 포함)' : ''), dw.eff.bon);

    // 버프 · 포승줄 · 은심장 (사람 몫)
    const ib = safe(function () { return window.ibSum(u).bon; }, 0);
    now += add('임시 버프', ib);
    const rope = wears(u, '포승줄') ? 5 : 0;
    now += add('포승줄', rope);
    const heart = safe(function () {
        if (!window.hasSilverHeart(u)) return 0;
        return Math.min(5, Math.floor((Number(u.heartSaves) || 0) / 2));
    }, 0);
    now += add('은심장', heart);

    // 장비
    const eq = function (n, v, ok) { if (ok) now += add(n, v); };
    eq('착한 친구', 2, safe(function () { return hasEquip(u, '착한 친구'); }, false));
    eq('다이아 애널 플러그', 2, safe(function () { return plugActive(u, '다이아 애널 플러그'); }, false));
    eq('루비 클리 피어싱', 2, safe(function () { return rubyActive(u, '루비 클리 피어싱'); }, false));
    eq('사인참사검', 2, wears(u, '사인참사검'));
    eq('??? 안경', 2, wears(u, '??? 안경'));
    eq('에메랄드 목줄', 3, safe(function () { return window._emOn(u).c; }, false));

    // 속성 — 감각 · 은신 반은 모든 판정에
    const sense = safe(function () { return gearValue(u, 'sense'); }, 0);
    const hide = safe(function () { return gearValue(u, 'hide'); }, 0);
    now += add('속성 (감각 ' + sense + ' · 은신 ' + hide + ' 의 반)', Math.floor(sense / 2) + Math.floor(hide / 2));

    // 횟수형 — 쓰기 전까지 남아 있는 동안
    const nf = u.nFlags || {};
    if (nf.c_batt > 0) now += add('배터리', 1);
    if (nf.c_match > 0) now += add('성냥', 3);

    // 오염도
    const pol = Number(u.pollution) || 0;
    now += add('오염도 ' + pol, pol < 30 ? 1 : (pol >= 90 ? -2 : (pol >= 60 ? -1 : 0)));

    // 고치기 전에 더 붙던 몫 — 틀림없이 겹치던 것만 센다
    //   얹은 몫은 버프 쪽으로 한 번 더 (고유를 안 차도) · 상담사 고유는 버프 쪽으로 한 번 더 (어디서나)
    let dup = (c === ADMIN) ? (Number(((safe(function () { return dnaGiftOf(u); }, null) || {}).e || {}).bon) || 0) : ex;
    const notes = [];
    //   고유에 버프가 같이 구워졌는지는 그 사원이 접속할 때 어느 쪽이 먼저 돌았는지에 달려 있어 장담할 수 없다
    if (dw && c !== ADMIN && (ib + rope + heart) > 0) notes.push('고유를 찬 채 접속했을 때 버프 +' + (ib + rope + heart) + ' 도 두 번 들어갔을 수 있음');

    // 눈여겨볼 것
    const ibl = (u.itemBuffs || []).filter(Boolean);
    const seen = {}, dupB = [];
    ibl.forEach(function (b) { const k = [b.k, b.v, b.src, b.until].join('|'); if (seen[k]) dupB.push(b.src || b.k); seen[k] = 1; });
    if (dupB.length) notes.push('같은 버프가 겹쳐 있음: ' + dupB.join(', '));
    if (sense >= 12 || hide >= 12) notes.push('L 속성');
    if (hasEquipSafe(u, '유리손포')) notes.push('유리손포 (감각 판정만 +3)');

    return { c: c, name: u.name, no: u.no || '', now: now, before: now + dup, dup: dup, parts: P, notes: notes, sense: sense };
}
function sg(v) { return (v > 0 ? '+' : '') + v; }
function hasEquipSafe(u, n) { return safe(function () { return hasEquip(u, n); }, false); }

function all() {
    return Object.keys(users()).map(rowOf).filter(Boolean)
        .sort(function (a, b) { return (b.before - a.before) || (b.now - a.now); });
}

// ==========================================
// 콘솔
// ==========================================
window.bonusAudit = function (who) {
    const rows = all();
    if (who) {
        const r = rows.filter(function (x) { return x.c === who || x.no === who || x.name === who; })[0];
        if (!r) { console.warn('사원을 못 찾았습니다.'); return; }
        console.log('%c===== 🔎 ' + r.name + ' (' + r.no + ') 판정 보정 =====', 'color:#9fe3e3; font-size:13px');
        console.table(r.parts.map(function (p) { return { 출처: p[0], 보정: p[1] }; }));
        console.log('  지금 합계 ' + sg(r.now) + (r.dup ? ' · 고치기 전 ' + sg(r.before) + ' (겹쳤던 몫 +' + r.dup + ')' : ''));
        r.notes.forEach(function (n) { console.log('  ⚠ ' + n); });
        return r;
    }
    console.log('%c===== 🔎 판정 보정 — 전체 사원 =====', 'color:#9fe3e3; font-size:13px');
    console.table(rows.map(function (r) {
        return { 이름: r.name, 사번: r.no, 지금: r.now, 고치기전: r.before, 겹쳤던몫: r.dup || '',
                 내역: r.parts.map(function (p) { return p[0] + ' ' + (p[1] > 0 ? '+' : '') + p[1]; }).join(' · '),
                 눈여겨볼것: r.notes.join(' / ') };
    }));
    return rows;
};

// ==========================================
// 상담사 콘솔 칸
// ==========================================
function paint() {
    const box = document.getElementById(BOX);
    if (!box) return;
    const out = box.querySelector('.ba-out');
    const rows = all();
    const td = 'padding:6px 4px; font-size:11px; border-top:1px solid rgba(255,255,255,.06); vertical-align:top;';
    out.innerHTML = '<div style="font-size:10px; color:#888; line-height:1.6; margin-bottom:8px;">'
        + '어둠 판정에 상시로 붙는 보정 (구역 깎기 · 장면 몫 빼고). 「겹쳤던 몫」은 이번에 고친 두 번 더해지던 양입니다.</div>'
        + '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse;">'
        + rows.map(function (r) {
            const hot = r.dup > 0;
            return '<tr><td style="' + td + ' white-space:nowrap; color:#fff;">' + esc(r.name)
                + ' <span style="font-size:9px; color:#777;">' + esc(r.no) + '</span><br>'
                + '<b style="color:#ffd479;">' + sg(r.now) + '</b>'
                + (hot ? ' <span style="color:#ff8a8a;">(전 ' + sg(r.before) + ')</span>' : '') + '</td>'
                + '<td style="' + td + ' color:#bbb; line-height:1.6;">'
                + (r.parts.map(function (p) { return esc(p[0]) + ' <b>' + (p[1] > 0 ? '+' : '') + p[1] + '</b>'; }).join(' · ') || '—')
                + (hot ? '<br><span style="color:#ff8a8a;">겹쳤던 몫 +' + r.dup + '</span>' : '')
                + (r.notes.length ? '<br><span style="color:#e8c27a;">⚠ ' + esc(r.notes.join(' / ')) + '</span>' : '')
                + '</td></tr>';
        }).join('') + '</table></div>';
}
window.bonusAuditPaint = paint;
function make() {
    const u = u_();
    if (!u || u.code !== ADMIN) return;
    const scr = document.getElementById('admin-screen');
    if (!scr || document.getElementById(BOX)) return;
    const anchor = scr.querySelector('.action-buttons');
    const html = '<div class="admin-panel-box collapsed" id="' + BOX + '" style="border-color:#5a5a7a; background-color:#111118;">'
        + '<h4 style="color:#c9c9f0; cursor:pointer;" data-acc="1">🔎 판정 보정 점검</h4>'
        + '<button class="game-btn" style="width:100%; margin:0 0 9px; padding:8px; font-size:11px;" onclick="bonusAuditPaint()">전체 사원 점검한다</button>'
        + '<div class="ba-out"></div></div>';
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html); else scr.insertAdjacentHTML('beforeend', html);
    const box = document.getElementById(BOX), h = box.querySelector('h4');
    h.onclick = function () { box.classList.toggle('collapsed'); if (!box.classList.contains('collapsed')) paint(); };
}
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._bonusAudit) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () { const r = _o.apply(this, arguments); setTimeout(make, 240); return r; };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._bonusAudit = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

})();
