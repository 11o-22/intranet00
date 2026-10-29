// ==========================================
// ⏳ 기한이 있는 것 — 사라지는 때를 초 단위로 (2026-10-23)
// bundles.json 마지막 그룹 맨 끝
// ==========================================
//
// ■ 감자맛 물약이 특이사항에서 사라져 보이던 것
//
//   특이사항 칸은 updateUI 가 이렇게 그린다. (index.html updateUI)
//
//       적힌 줄(badge.notes)  +  <br>  +  시간 효과(timedEffects — 물약 같은 것)
//
//   그런데 몇 군데가 그 칸을 **적힌 줄만으로** 덮어썼다.
//
//       note-fix.js   15초마다 줄을 맞추고 나서   el.innerText = badge.notes
//       index.html    appendSystemBadgeNote · loadBadgeInfo
//       equip-fold.js · admin-clear.js
//
//   그러면 물약 줄이 화면에서 빠진다 (데이터는 그대로). 다음 updateUI 가 돌아야
//   돌아오는데, updateUI 는 무엇이 바뀌어야 돈다. 디저트 줄을 맞추게 된 뒤로는
//   새로고침하고 15초 안에 맞추는 일이 생기므로 「감자맛 물약이 사라졌다」로 보였다.
//
//   → 그 칸은 이제 여기 한 곳(noteLivePaint)에서만 그린다. 덮어쓰던 자리는 전부
//     이것을 부르게 바꿨고, 누가 또 덮어쓰면 1초 안에 다시 그린다.
//
// ■ 남은 시간을 실시간으로
//
//   기한이 있는 것마다 끝나는 때를 찾아 「(⏳ 23:41:05 남음)」을 붙이고 1초마다 센다.
//
//     특이사항   시간 효과 (물약 · 술 · 출산품 …)            timedEffects[].expireAt
//                [디저트]                                     식당 디저트 버프 (먹은 번마다)
//                [은화 뱀] · [달빛] · [인형] · [📲] · ⛓️‍💥 카피  itemBuffs[].until (· dollPt · kleeShop)
//                꼬리 n개 사용                                 foxNotes[].until
//                [탈모약] · [감금실] · [계약]                  hairUntil · cage · slaveUntil
//                🎐 …가 역병을 뿌립니다. - 판정               foxPl[역병].until (한 시간)
//                노스텔지어 끈 · 눈가리개(오염 동결)            nostalgiaUntil · blindfoldUntil
//                정원을 찬양하라 · 고행이 시작될 것이다         자정
//                [장착됨] 기한 있는 장비                        아래 장착과 같다
//                줄이 없는 버프 (연구 보고서 · 엽서 · 식당 ★ …) 여기서 한 줄씩 보여 준다 (적지는 않는다)
//     장착       은반지 · 버터 나이프 · 작두 · 가터밸트 · ??? 안경 · 혈욕조 · 빨간 리본 · 복제품
//                — 사원증 「장착」 칸과 소지품의 장착 카드 둘 다
//     오염도     「동결중」 표시에 남은 시간 (눈가리개 · 공략집 · 여우 꼬리 …)
//     남의 사원증 (사원 목록에서 열었을 때) 특이사항도 같이
//
// ■ 콘솔
//   noteLiveState()   내 것에서 찾은 끝나는 때들

(function noteLive() {

const NONE = '특이사항 없음';
const HOUR = 3600 * 1000;
const LEFT = 'color:#ff9800; font-weight:bold; white-space:nowrap;';

function now() { return Date.now(); }
function me() { try { return currentUser || null; } catch (e) { return null; } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function baseOf(w) {
    try { return (typeof getEquipBaseName === 'function') ? getEquipBaseName(w) : String(w || ''); }
    catch (e) { return String(w || ''); }
}

// 23:41:05 · 4일 23:41:05
function fmt(ms) {
    if (!(ms > 0)) return '0:00:00';
    const s = Math.ceil(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60), x = s % 60;
    const t = h + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
    return d ? d + '일 ' + t : t;
}
window.tlFmt = fmt;
function clock(at) { return '<span data-tl="' + Math.round(at) + '">' + fmt(at - now()) + '</span>'; }
function left(at) { return '<span style="' + LEFT + '">(⏳ ' + clock(at) + ' 남음)</span>'; }

// ==========================================
// 버프 (itemBuffs)
// ==========================================
function buffs(u) {
    const t = now();
    return (Array.isArray(u && u.itemBuffs) ? u.itemBuffs : []).filter(function (b) {
        return b && b.k && !b.run && (b.until || 0) > t;
    });
}
function lastOf(u, src, k) {
    let at = 0;
    buffs(u).forEach(function (b) {
        if (b.src !== src) return;
        if (k && b.k !== k) return;
        if (b.until > at) at = b.until;
    });
    return at || null;
}

const KLEE = 'K.LEE';
const KLEE_KEY = {                                   // klee.js KEY_OF 와 같다
    '행운': 'luck', '판정': 'bon', '회피': 'eva', '기믹 파훼': 'gim',
    '공용시설 횟수': 'fac', '어둠 탐사 횟수': 'dark',
    '공용시설 행운': 'pct', '회수품 확률': 'kleeLoot'
};
const COPY_SRC = '⛓️‍💥 이레귤러';                     // irregular.js
const FOX_SRC = '🐯 호가호위';                         // foxtail.js (2026-10-29 이름 바꿈)
const FOX_SRC_OLD = '🦊 호사수구';
const FOX_SRC_OLD2 = '🦊 호가호위';
// 특이사항에 줄이 따로 있는 버프 — 그 줄에 시간을 붙인다
const HAS_LINE = ['식당 디저트', '은화 뱀', '달빛', '봉제 인형', KLEE, COPY_SRC, FOX_SRC, FOX_SRC_OLD, FOX_SRC_OLD2];
const BUFF_NAME = { luck: '행운', pct: '행운', eva: '회피', bon: '판정', fac: '공용시설', dark: '어둠 탐사',
                    gim: '기믹 파훼', resc: '구출 확률', resist: '저항', noPoll: '오염 동결', kleeLoot: '회수품 확률' };
function buffWord(b) {
    if (b.k === 'noPoll') return '오염 동결';
    const v = Number(b.v) || 0;
    const unit = b.k === 'pct' ? '%' : (b.k === 'fac' || b.k === 'dark' || b.k === 'gim') ? '회' : '';
    return (BUFF_NAME[b.k] || b.k) + ' ' + (v >= 0 ? '+' : '') + v + unit;
}

// 줄이 없는 버프 — 같은 물건 · 같은 때 끝나는 것끼리 한 줄
function bareLines(u) {
    const groups = [];
    buffs(u).forEach(function (b) {
        const src = String(b.src || '');
        if (HAS_LINE.indexOf(src) >= 0) return;
        const g = groups.filter(function (x) { return x.src === src && Math.abs(x.at - b.until) < 5000; })[0];
        if (g) { g.list.push(b); if (b.until > g.at) g.at = b.until; }
        else groups.push({ src: src, at: b.until, list: [b] });
    });
    groups.sort(function (a, z) { return a.at - z.at; });
    return groups.map(function (g) {
        return '[' + esc(g.src || '버프') + '] ' + esc(g.list.map(buffWord).join(' · ')) + ' ' + left(g.at);
    });
}

// ==========================================
// 장비
// ==========================================
const EQUIP_KEY = {
    '은반지': 'silverRingExpireTime', '버터 나이프': 'butterKnifeExpireTime', '작두': 'jakduExpireTime',
    '가터밸트': 'garterExpire', '??? 안경': 'glassesExpire'
};
const RIBBON = '빨간 리본';
// 리본은 같은 이름표가 여럿이다 — nth 번째 것은 nth 번째로 빨리 끝나는 리본
function ribbonAt(u, label, nth) {
    if (/ · 영구$/.test(String(label))) return null;
    const eq = (u.equippedWeapons || []).filter(function (w) { return baseOf(w) === RIBBON && !/ · 영구$/.test(String(w)); });
    let i = -1;
    for (let k = 0, seen = 0; k < eq.length; k++) {
        if (eq[k] !== label) continue;
        if (seen === (nth || 0)) { i = k; break; }
        seen++;
    }
    if (i < 0) return null;
    const t = now();
    const live = (Array.isArray(u.ribbons) ? u.ribbons : []).filter(function (r) { return r && r.u > t; })
        .map(function (r) { return r.u; }).sort(function (a, z) { return a - z; });
    return live[i] || null;
}
// 장착 이름표 하나가 언제 빠지나 — 모르면 null (nth: 같은 이름표 가운데 몇 번째)
function equipAt(u, label, nth) {
    if (!u || !label) return null;
    const t = now();
    const cp = Array.isArray(u.copyExpire) ? u.copyExpire.filter(function (x) { return x && x.n === label; })[0] : null;
    if (cp && Number(cp.at) > t) return Number(cp.at);
    const b = baseOf(label);
    const key = EQUIP_KEY[b];
    if (key) return (u[key] || 0) > t ? u[key] : null;
    if (b === '혈욕조' && u.bloodBathEquippedAt) {
        const at = u.bloodBathEquippedAt + Math.max(0, 3 * HOUR - (u.bloodBathDailyUsedMs || 0));
        return at > t ? at : null;
    }
    if (b === RIBBON) return ribbonAt(u, label, nth);
    return null;
}

// ==========================================
// 특이사항 한 줄이 언제 끝나나 — 모르면 null
// ==========================================
function nextMidnight() {
    const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime();
}
function lineAt(u, line, nth) {
    const t = now();
    const ok = function (x) { return (x || 0) > t ? x : null; };
    const has = function (s) { return line.indexOf(s) >= 0; };

    // 여우 꼬리 — 적은 줄과 끝나는 때를 같이 들고 있다
    const fx = (Array.isArray(u.foxNotes) ? u.foxNotes : []).filter(function (n) {
        return n && n.line && line.indexOf(n.line) >= 0;
    })[0];
    if (fx) return ok(fx.until);

    if (line.indexOf('[디저트]') === 0) {
        let gs = [];
        try { gs = window.noteSweet ? window.noteSweet(u) : []; } catch (e) { }
        const g = gs.filter(function (x) { return x.line === line; })[0];
        return g ? ok(g.at) : lastOf(u, '식당 디저트');
    }
    if (has('[은화 뱀]')) {
        const k = /행운/.test(line) ? 'luck' : /판정/.test(line) ? 'bon' : /공용시설/.test(line) ? 'fac' : null;
        return lastOf(u, '은화 뱀', k);
    }
    if (has('[달빛]')) return /탐사/.test(line) ? null : lastOf(u, '달빛');
    if (has('[인형]')) {
        const a = ok(u.dollPt), b = lastOf(u, '봉제 인형');
        return Math.max(a || 0, b || 0) || null;
    }
    if (has('[📲]')) {
        if (/구매 행운/.test(line)) return ok(u.kleeShop);
        if (has('출산 시간 절반') || has('어둠 신호')) return null;
        const nm = Object.keys(KLEE_KEY).filter(has).sort(function (a, z) { return z.length - a.length; })[0];
        return lastOf(u, KLEE, nm ? KLEE_KEY[nm] : null);
    }
    if (has('⛓️‍💥') && has('카피')) return lastOf(u, COPY_SRC);
    // 🎐 여우 신도의 역병 — 한 시간 (foxcult.js · u.foxPl[역병] = { line, until }) · 2026-10-25
    if (line.indexOf('🎐 ') === 0 && has('역병을 뿌립니다')) {
        const pl = (u.foxPl && typeof u.foxPl === 'object') ? u.foxPl : {};
        let at = 0;
        Object.keys(pl).forEach(function (k) {
            const p = pl[k];
            if (p && String(p.line || '').trim() === line && (Number(p.until) || 0) > at) at = Number(p.until) || 0;
        });
        return ok(at);
    }
    if (has('[탈모약]')) return ok(u.hairUntil);
    if (has('[감금실]')) {
        const c = u.cage;
        if (!c || !c.by) return null;
        let until = c.until || 0;
        if (c.at && until > c.at + 12 * HOUR) until = c.at + 12 * HOUR;
        return ok(until);
    }
    if (line.indexOf('[계약]') === 0) {
        if (u.slaveFixed || (u.slaveUntil || 0) >= Number.MAX_SAFE_INTEGER) return null;
        return ok(u.slaveUntil);
    }
    if (has('노스텔지어 끈')) return ok(u.nostalgiaUntil);
    if (has('효과 발동') && has('오염 동결')) return ok(u.blindfoldUntil);
    if (has('[ 🔴 정원을 찬양하라') || has('[고행이 시작될 것이다')) {
        return (u.jisanRod && u.jisanRod.at) ? nextMidnight() : null;
    }
    if (line.indexOf('[장착됨] ') === 0) {
        const name = line.slice(6).replace(/\s*장착 적용\s*$/, '').replace(/\s*장착\s*\(.*$/, '').trim();
        const eq = (u.equippedWeapons || []);
        const same = eq.filter(function (w) { return w === name; });
        if (same.length) return equipAt(u, name, Math.min(nth || 0, same.length - 1));
        const hit = eq.filter(function (w) { return baseOf(w) === baseOf(name); })[0];
        return hit ? equipAt(u, hit, 0) : null;
    }
    return null;
}

// ==========================================
// 특이사항 칸 — 적힌 줄 · 시간 효과 · 줄 없는 버프
// ==========================================
function notesOf(u) {
    const s = (u && u.badge && u.badge.notes) || '';
    if (!s || s === NONE) return [];
    return String(s).split('|').map(function (x) { return x.trim(); }).filter(Boolean);
}
function timedLines(u) {
    const out = [];
    (Array.isArray(u.timedEffects) ? u.timedEffects : []).forEach(function (eff) {
        if (!eff) return;
        if (eff.fixed) {
            out.push('[' + eff.name + '] ' + eff.desc + ' <span style="color:#4fc3f7; font-weight:bold;">(영구)</span>');
            return;
        }
        if (!eff.expireAt || isNaN(eff.expireAt)) {
            out.push('[' + eff.name + '] ' + eff.desc + ' <span style="color:#ff9800; font-weight:bold;">(남은 시간 확인 중)</span>');
            return;
        }
        if (eff.expireAt > now()) out.push('[' + eff.name + '] ' + eff.desc + ' ' + left(eff.expireAt));
    });
    return out;
}
// 글줄은 전처럼 그대로 넣는다 (updateUI 가 innerHTML 로 넣던 것과 같다)
function notesHtml(u) {
    if (!u) return NONE;
    const seen = {};
    const manual = notesOf(u).map(function (line) {
        const nth = seen[line] || 0;
        seen[line] = nth + 1;
        let at = null;
        try { at = lineAt(u, line, nth); } catch (e) { }
        return at ? line + ' ' + left(at) : line;
    });
    const rows = [];
    if (manual.length) rows.push(manual.join(' | '));
    let more = [];
    try { more = timedLines(u).concat(bareLines(u)); } catch (e) { }
    return rows.concat(more).join('<br>') || NONE;
}
window.noteLiveHtml = notesHtml;

// 사원증 「장착」 칸 — updateUI 와 같은 꼴에 시간만 붙인다
function equipHtml(u) {
    let gear = '';
    try { gear = (typeof getGear === 'function' && getGear(u)) ? gearLabel(u) : ''; } catch (e) { }
    const seen = {};
    const eq = (Array.isArray(u.equippedWeapons) ? u.equippedWeapons : []).map(function (w) {
        const nth = seen[w] || 0;
        seen[w] = nth + 1;
        let at = null;
        try { at = equipAt(u, w, nth); } catch (e) { }
        return at ? w + ' ' + left(at) : w;
    }).join(', ');
    return (gear ? '<span style="color:#c9a8ff;">' + gear + '</span>' : '') + (gear && eq ? '<br>' : '') + (eq || (gear ? '' : '없음'));
}

// ==========================================
// 그리기 · 세기
// ==========================================
const strip = function (h) { return String(h).replace(/(data-tl="\d+">)[^<]*/g, '$1'); };
const managed = [];      // 여기서 그리는 칸 — 남이 덮어썼는지 보려고 그린 모양을 들고 있다
// 바뀐 것이 있으면 통째로, 아니면 숫자만
function put(el, html) {
    if (!el) return;
    if (managed.indexOf(el) < 0) managed.push(el);
    const key = strip(html);
    if (el._nlKey !== key || el.innerHTML !== el._nlSeen) {
        el.innerHTML = html;
        el._nlKey = key;
    } else {
        tickIn(el);
    }
    el._nlSeen = el.innerHTML;
}
function tickIn(root) {
    const list = root.querySelectorAll('[data-tl]');
    const t = now();
    for (let i = 0; i < list.length; i++) {
        const s = fmt(Number(list[i].getAttribute('data-tl')) - t);
        if (list[i].textContent !== s) list[i].textContent = s;
    }
}

function paintFreeze(u) {
    const el = document.getElementById('blindfold-status');
    if (!el) return;
    const at = Math.max(u.blindfoldUntil || 0, u.pollFreezeUntil || 0);
    if (at > now()) {
        put(el, '[장비/효과로 인해 동결중 · ⏳ ' + clock(at) + ']');
        if (el.style.display !== 'inline') el.style.display = 'inline';
    } else if (el._nlKey) {
        el.innerHTML = '[장비/효과로 인해 동결중]';
        el._nlKey = null;
        const bf = (typeof isBlindfolded === 'function') ? isBlindfolded(u) : false;
        el.style.display = bf ? 'inline' : 'none';
    }
}

// 소지품의 장착 카드 — 「[장착 중 슬롯 n]」 카드 이름 아래에 한 줄
function paintCards(u) {
    const box = document.getElementById('inventory-list-container');
    if (!box) return;
    const eq = Array.isArray(u.equippedWeapons) ? u.equippedWeapons : [];
    const tags = box.querySelectorAll('span');
    for (let i = 0; i < tags.length; i++) {
        const m = /^\[장착 중 슬롯 (\d+)\]$/.exec((tags[i].textContent || '').trim());
        if (!m) continue;
        const idx = Number(m[1]) - 1;
        const label = eq[idx];
        const nth = eq.slice(0, idx).filter(function (w) { return w === label; }).length;
        const name = tags[i].nextElementSibling;
        if (!name) continue;
        let row = name.nextElementSibling && name.nextElementSibling.classList.contains('nl-eq') ? name.nextElementSibling : null;
        let at = null;
        try { at = equipAt(u, label, nth); } catch (e) { }
        if (!at || (name.textContent || '').trim() !== String(label)) { if (row) row.remove(); continue; }
        if (!row) {
            row = document.createElement('div');
            row.className = 'nl-eq';
            row.style.cssText = 'font-size:10px; margin-top:4px;';
            name.insertAdjacentElement('afterend', row);
        }
        if (Number(row.getAttribute('data-at')) !== at) {
            row.setAttribute('data-at', at);
            row.innerHTML = '<span style="' + LEFT + '">⏳ ' + clock(at) + ' 남음</span>';
        }
    }
}

function paint() {
    const u = me();
    if (!u) return;
    try { put(document.getElementById('badge-notes-text'), notesHtml(u)); } catch (e) { }
    try { put(document.getElementById('badge-equipped-text'), equipHtml(u)); } catch (e) { }
    try { paintFreeze(u); } catch (e) { }
    try { paintCards(u); } catch (e) { }
}
window.noteLivePaint = paint;

// 남의 사원증 (사원 목록) — 열 때 특이사항 칸을 같은 것으로
let shown = null;
function paintEmp() {
    if (!shown) return;
    const box = document.getElementById('emp-detail-card-container');
    const u = (typeof db !== 'undefined' && db && db.users) ? db.users[shown] : null;
    if (!box || !u) return;
    const th = Array.prototype.filter.call(box.querySelectorAll('th'), function (x) { return (x.textContent || '').trim() === '특이사항'; })[0];
    const td = th && th.nextElementSibling;
    if (td) put(td, notesHtml(u));
}

(function hook() {
    const iv = setInterval(function () {
        let done = 0;
        if (typeof window.updateUI === 'function') {
            if (!window.updateUI._nl) {
                const _u = window.updateUI;
                const w = function () {
                    const r = _u.apply(this, arguments);
                    try { paint(); } catch (e) { }
                    return r;
                };
                Object.keys(_u).forEach(function (k) { if (!(k in w)) w[k] = _u[k]; });   // 다른 묶음의 표식은 그대로
                w._nl = true;
                updateUI = w; window.updateUI = w;
            }
            done++;
        }
        if (typeof window.openEmpDetailModal === 'function') {
            if (!window.openEmpDetailModal._nl) {
                const _o = window.openEmpDetailModal;
                const w2 = function (code) {
                    const r = _o.apply(this, arguments);
                    shown = code;
                    try { paintEmp(); } catch (e) { }
                    return r;
                };
                w2._nl = true;
                // 다른 묶음이 쓰는 표식은 그대로 넘긴다
                Object.keys(_o).forEach(function (k) { if (!(k in w2)) w2[k] = _o[k]; });
                openEmpDetailModal = w2; window.openEmpDetailModal = w2;
            }
            done++;
        }
        // ★ 소지품 칸을 다시 그린 바로 그 자리에서 장착 카드의 「⏳ 남음」 줄을 붙인다 (2026-10-25)
        //   — updateUI 를 거치지 않고 그려질 때는 1초 시계까지 그 줄이 비어, 아래 카드들이 한 줄만큼 위로 튀었다가 돌아왔다
        if (typeof window.renderInventory === 'function') {
            if (!window.renderInventory._nl) {
                const _r = window.renderInventory;
                const w3 = function () {
                    const r = _r.apply(this, arguments);
                    try { const u = me(); if (u) paintCards(u); } catch (e) { }
                    return r;
                };
                Object.keys(_r).forEach(function (k) { if (!(k in w3)) { try { w3[k] = _r[k]; } catch (e) { } } });
                w3._nl = true;
                renderInventory = w3; window.renderInventory = w3;
            }
            done++;
        }
        if (done === 3) clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// 1초마다 — 내 칸은 다시 맞추고 (누가 덮어썼으면 다시 그린다), 화면의 시계는 전부 센다
setInterval(function () {
    try { paint(); } catch (e) { }
    try {
        const box = document.getElementById('emp-detail-card-container');
        if (shown && box && box.offsetParent !== null) paintEmp();
        tickIn(document);
        for (let i = managed.length - 1; i >= 0; i--) {
            const el = managed[i];
            if (!el.isConnected) { managed.splice(i, 1); continue; }
            el._nlSeen = el.innerHTML;
        }
    } catch (e) { }
}, 1000);

// ==========================================
// 확인
// ==========================================
window.noteLiveState = function () {
    const u = me();
    if (!u) { console.log('로그인 후에 쓰세요.'); return; }
    const rows = [];
    notesOf(u).forEach(function (line) {
        const at = lineAt(u, line);
        rows.push({ 칸: '특이사항', 줄: line.slice(0, 40), 끝: at ? new Date(at).toLocaleString() : '—', 남음: at ? fmt(at - now()) : '—' });
    });
    (u.timedEffects || []).forEach(function (e) {
        if (e) rows.push({ 칸: '시간 효과', 줄: e.name, 끝: e.fixed ? '영구' : new Date(e.expireAt).toLocaleString(), 남음: e.fixed ? '—' : fmt(e.expireAt - now()) });
    });
    buffs(u).forEach(function (b) {
        rows.push({ 칸: '버프', 줄: (b.src || '') + ' ' + buffWord(b), 끝: new Date(b.until).toLocaleString(), 남음: fmt(b.until - now()) });
    });
    (u.equippedWeapons || []).forEach(function (w) {
        const at = equipAt(u, w);
        rows.push({ 칸: '장착', 줄: w, 끝: at ? new Date(at).toLocaleString() : '—', 남음: at ? fmt(at - now()) : '—' });
    });
    console.table(rows);
};

console.log('[⏳] 기한 있는 것 남은 시간 — noteLiveState()');

})();
