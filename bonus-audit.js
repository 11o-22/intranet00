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
// ■ 고유 아이템 · 얹은 몫이 두 번 들어가던 것 — 코드에서 고쳤다 (2026-10-19, dna-gifts.js · itemfix.js)
//   그것은 저장된 값이 아니라 셈이 겹친 것이라 걷어낼 데이터가 없다. 표에도 더 안 적는다.
//
// ■ 같은 버프가 겹쳐 있음 — 서버에 실제로 쌓여 있는 것
//   itemBuffs 에 종류 · 값 · 출처 · 끝나는 때(1회짜리면 그 표시)까지 똑같은 것이 여러 개 들어 있으면
//   하나만 남기고 걷는다 — 상담사 콘솔 [겹친 버프 걷어내기] 또는 bonusDedupe().
//   사원마다 트랜잭션으로 걷으므로 그 사이에 새로 붙은 버프는 그대로 남는다.
//
// ■ 콘솔
//   bonusAudit()        표로
//   bonusAudit('4892')  한 사원 내역
//   bonusDedupe()       겹친 버프 걷어내기 (상담사)

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

    // ★ 고유 아이템 · 얹은 몫이 두 번 들어가던 것은 코드에서 고쳤다 (2026-10-19) — 표에는 더 안 적는다.

    // 같은 버프가 겹쳐 들어 있는 것 (서버에 실제로 쌓여 있다 — [겹친 버프 걷어내기] 로 걷는다)
    const dd = dedupe(u.itemBuffs);
    const dupB = dd.gone.map(function (b) { return b.src || b.k; });

    // 참고
    const info = [];
    if (sense >= 12 || hide >= 12) info.push('L 속성');
    if (hasEquipSafe(u, '유리손포')) info.push('유리손포 (감각 판정만 +3)');

    return { c: c, name: u.name, no: u.no || '', now: now, parts: P, dupB: dupB, info: info, sense: sense };
}

// 똑같은 버프(종류 · 값 · 출처 · 끝나는 때 · 1회짜리)는 하나만 남긴다
function bkey(b) { return [b.k, b.v, b.src || '', b.until || '', b.run ? 1 : 0].join('|'); }
function asArr(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (v && typeof v === 'object') return Object.keys(v).sort(function (a, b) { return a - b; }).map(function (k) { return v[k]; }).filter(Boolean);
    return [];
}
function dedupe(list) {
    const seen = {}, keep = [], gone = [];
    asArr(list).forEach(function (b) {
        const k = bkey(b);
        if (seen[k]) { gone.push(b); return; }
        seen[k] = 1; keep.push(b);
    });
    return { keep: keep, gone: gone };
}
function sg(v) { return (v > 0 ? '+' : '') + v; }
function hasEquipSafe(u, n) { return safe(function () { return hasEquip(u, n); }, false); }

function all() {
    return Object.keys(users()).map(rowOf).filter(Boolean)
        .sort(function (a, b) { return (b.now - a.now) || (b.dupB.length - a.dupB.length); });
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
        console.log('  합계 ' + sg(r.now));
        if (r.dupB.length) console.log('  ⚠ 같은 버프가 겹쳐 있음: ' + r.dupB.join(', '));
        r.info.forEach(function (n) { console.log('  · ' + n); });
        return r;
    }
    console.log('%c===== 🔎 판정 보정 — 전체 사원 =====', 'color:#9fe3e3; font-size:13px');
    console.table(rows.map(function (r) {
        return { 이름: r.name, 사번: r.no, 합계: r.now,
                 내역: r.parts.map(function (p) { return p[0] + ' ' + (p[1] > 0 ? '+' : '') + p[1]; }).join(' · '),
                 겹친버프: r.dupB.join(', '), 참고: r.info.join(' / ') };
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
    const who = rows.filter(function (r) { return r.dupB.length; });
    const n = who.reduce(function (s, r) { return s + r.dupB.length; }, 0);
    out.innerHTML = '<div style="font-size:10px; color:#888; line-height:1.6; margin-bottom:8px;">'
        + '어둠 판정에 상시로 붙는 보정 (구역 깎기 · 장면 몫 빼고).</div>'
        + '<button class="game-btn" style="width:100%; margin:0 0 10px; padding:9px; font-size:11px;'
        + (n ? ' background:linear-gradient(145deg,#6a5a2a,#3a3216) !important; border-color:#e8c27a !important; color:#fff !important;' : '')
        + '" onclick="bonusDedupe()"' + (n ? '' : ' disabled') + '>'
        + (n ? '겹친 버프 걷어내기 — ' + who.length + '명 · ' + n + '개' : '겹친 버프 없음') + '</button>'
        + '<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse;">'
        + rows.map(function (r) {
            return '<tr><td style="' + td + ' white-space:nowrap; color:#fff;">' + esc(r.name)
                + ' <span style="font-size:9px; color:#777;">' + esc(r.no) + '</span><br>'
                + '<b style="color:#ffd479;">' + sg(r.now) + '</b></td>'
                + '<td style="' + td + ' color:#bbb; line-height:1.6;">'
                + (r.parts.map(function (p) { return esc(p[0]) + ' <b>' + (p[1] > 0 ? '+' : '') + p[1] + '</b>'; }).join(' · ') || '—')
                + (r.dupB.length ? '<br><span style="color:#e8c27a;">⚠ 같은 버프가 겹쳐 있음 ' + r.dupB.length + '개: ' + esc(r.dupB.join(', ')) + '</span>' : '')
                + (r.info.length ? '<br><span style="color:#888;">· ' + esc(r.info.join(' / ')) + '</span>' : '')
                + '</td></tr>';
        }).join('') + '</table></div>';
}
window.bonusAuditPaint = paint;

// ==========================================
// 겹친 버프 걷어내기 — 사원마다 itemBuffs 를 트랜잭션으로 (그 사이 붙은 것은 살린다)
// ==========================================
let busy = false;
window.bonusDedupe = function () {
    const me = u_();
    if (!me || me.code !== ADMIN || busy || typeof database === 'undefined' || !database) return;
    const codes = Object.keys(users()).filter(function (c) { return dedupe((users()[c] || {}).itemBuffs).gone.length; });
    if (!codes.length) { try { showCustomAlert('겹친 버프가 없습니다.'); } catch (e) { } return; }
    busy = true;
    const done = [];
    let i = 0;
    const next = function () {
        if (i >= codes.length) {
            busy = false;
            const total = done.reduce(function (s, d) { return s + d.n; }, 0);
            console.table(done.map(function (d) { return { 이름: d.name, 사번: d.no, 걷은것: d.n, 무엇: d.what }; }));
            try {
                showCustomAlert('겹친 버프를 걷어냈습니다.\n\n' + done.length + '명 · ' + total + '개\n\n'
                    + done.map(function (d) { return d.name + ' — ' + d.n + '개'; }).join('\n'));
            } catch (e) { }
            setTimeout(paint, 600);
            return;
        }
        const c = codes[i++];
        let gone = [];
        database.ref('users/' + c + '/itemBuffs').transaction(function (v) {
            const d = dedupe(v);
            gone = d.gone;
            if (!d.gone.length) return;                       // 그 사이 이미 걷혔다 — 건드리지 않는다
            return d.keep;
        }).then(function () {
            if (gone.length) {
                const u = users()[c] || {};
                const cnt = {};
                gone.forEach(function (b) { const k = (b.src || b.k); cnt[k] = (cnt[k] || 0) + 1; });
                done.push({ name: u.name || c, no: u.no || '', n: gone.length,
                            what: Object.keys(cnt).map(function (k) { return k + ' ×' + cnt[k]; }).join(', ') });
                // 화면 쪽 사본도 맞춰 둔다 (내 것은 병합이 알아서 받는다)
                if (u !== u_() && u.itemBuffs) u.itemBuffs = dedupe(u.itemBuffs).keep;
            }
            next();
        }).catch(function (e) { console.warn('[보정] 걷어내기 실패', c, e); next(); });
    };
    next();
};
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
