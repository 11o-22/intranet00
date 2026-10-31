// ==========================================
// ★ 「이상한 나라의 ■■■」 — 뱀파이어 연계판 「제■■■회 완벽한 피날레」 (몽환)
// bundles.json 마지막 묶음 — wonder-ch-vampire.js 다음
// ==========================================
//
//   원고: 「뱀파이어의 장 · 몽환 — 원고」 문서의 연계판 공통 뼈대 · S1~T8.
//   피날레 본편(finale-*.js)을 다시 돌리지 않는다 — 원고가 「본편 그대로」라고 적은 판정 규칙만 여기서 다시 세운다:
//     · 감화도 (사람마다, 0~100). 100 = 「자발적 피날레」(탈락 · 죽음). 은 티스푼 −10.
//     · 주사위 3회 연속 실패 = 즉사. 붉은 손수건이 연속 실패 수를 한 번 0으로.
//     · NPC 영입 맨 주사위 25 이상 · 아이템 제출 17 이상 (집사의 심부름표 +3). 대실패(1).
//     · 「피를 바치는 의식」 1~30, 16 이상 「충분한 성의」 (장미 반창고 +5).
//     · 장비 없음. 시계(15분) 없음 — 판은 미션의 결말이 정해질 때 멈춘다.
//   원고가 「본편 장면」에 맡긴 부스 · 로비 · 연회는 짧은 지문(아래 BOOTH)으로 대신한다.
//   누가 죽으면(탈락 · 지나친 성의 · 3회 연속 실패 · 출구) 그 사람은 상담실 · 선녀탕으로, 판은 ✖ 로 멈춘다.
//
//   결과: 'w' ✔ 첫 번째 결말(이상한 나라 쪽) · 'd' ✔ 두 번째 결말(어둠 쪽) · 'f' ✖

(function wonderLinkVampire() {
'use strict';
const X = window.WONDER;
if (!X || !X.L || !X.VAMP) return;
const L = X.L;
const V = X.VAMP;
function F() { return X.F(); }
function ME() { return currentUser.code; }
function me() { return L.me(); }
function st() { return F().lk.s; }
function esc(s) { return L.esc(s); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
function nm(c) { return L.name(c); }
function paras(x) { return String(x || '').split('<br><br>'); }
function isVamp() { const d = L.def(); return !!(d && d.vamp); }

// ==========================================
// 원고 찾기
// ==========================================
function scn(name) { return L.sub('v_new', L.def().base, name); }
function common(i) { return X.scene('v_new', i); }
// 장면의 모든 쪽 문단을 한 줄로
function allP(s) { const out = []; (s ? s.p : []).forEach(function (p) { paras(p.x).forEach(function (q) { out.push(q); }); }); return out; }
function isHead(q) { return /^<b>[^<]+<\/b>\s*(<i>\([^)]*\)<\/i>)?\s*$/.test(q); }
function clean(q) {
    return String(q || '').replace(/\s*<i>\(→[^)]*\)<\/i>/g, '').replace(/<i>\([^)]*\)<\/i>\s*/g, '').replace(/\s+$/, '').trim();
}
// 머리 문단(굵은 글씨) 다음부터 다음 머리 문단 앞까지
function sect(s, head) {
    const ps = allP(s);
    const i = ps.findIndex(function (q) { return isHead(q) && q.indexOf(head) >= 0; });
    if (i < 0) return '';
    const out = [];
    for (let k = i + 1; k < ps.length; k++) {
        if (isHead(ps[k])) break;
        if (/^<b>「(충분한|지나친) 성의」/.test(ps[k])) break;
        out.push(clean(ps[k]));
    }
    return out.filter(Boolean).join('<br><br>');
}
// 「<b>label</b> — 본문」 한 문단
function inl(s, label) {
    const q = allP(s).find(function (x) { return x.indexOf('<b>' + label) === 0; });
    return q ? clean(q.replace(/^<b>[^<]*<\/b>\s*—?\s*/, '')) : '';
}
// 기울임 머리말이 달린 문단 「(성공) …」
function tagged(s, tag) {
    const q = allP(s).find(function (x) { return x.indexOf('<i>(' + tag + ')</i>') === 0; });
    return q ? clean(q) : '';
}
// 이야기 문단만 (맨 앞의 기울임 안내 · 메모 문단 빼고)
function body(x) {
    return paras(x).filter(function (q) { return !/^<i>[^<]*<\/i>$/.test(q); }).map(clean).filter(Boolean).join('<br><br>');
}

// ==========================================
// 사람마다 — 감화도 · 연속 실패 · 상품권
// ==========================================
const DIE_TXT = {
    '자발적 피날레': '사회자의 목소리가 아주 가까이에서 들립니다.<br><br>“축하드립니다! 오늘도 한 분의 완벽한 피날레가 완성되었습니다!”<br><br>조명이 꺼집니다. 어둠 속에서 박수 소리만 점점 커집니다.',
    '대리 참석': '누군가 당신의 가슴에 명찰을 달아 줍니다. 이름이 적혀 있어야 할 자리는 비어 있습니다.<br><br>“어서 오세요, 교우님. 자리는 이쪽입니다.”<br><br>조명이 꺼집니다. 어둠 속에서 박수 소리만 점점 커집니다.',
    '주사위 3회 연속 실패': '발밑이 기울어집니다. 붙잡을 것을 찾지만 손에 닿는 것은 벨벳뿐입니다.<br><br>조명이 꺼집니다. 어둠 속에서 박수 소리만 점점 커집니다.',
    '출구를 찾는다': '출입문을 열자 벨벳의 감촉이 느껴집니다. 그러나 이번에는 객석이 아닙니다.<br><br>“아이고, 교우님. 아직 막간이 아니라니까요.”<br><br>조명이 꺼집니다. 어둠 속에서 박수 소리만 점점 커집니다.',
    '지나친 성의': '잔이 찼는데도 멈추지 않습니다. 조명이 꺼집니다. 어둠 속에서 박수 소리만 점점 커집니다.'
};
function dead() { const lk = me(); return !!(lk && (lk.dead || lk.dying)); }
// 죽음 — 판은 ✖ 로 멈추고(endTitle), 나는 상담실 · 선녀탕으로
function vDie(why, endTitle, pre) {
    const lk = me();
    if (lk.dead) return;
    lk.dead = 1;
    X.save();
    L.end(endTitle || why, 'f', { who: ME(), why: why, lead: esc(nm(ME())) + '의 자리에서 박수 소리가 터집니다. 조명이 다시 켜졌을 때, 그 자리는 비어 있습니다.' });
    try { darkRun.log.push('[피날레 연계판] ' + why); } catch (e) { }
    setTimeout(function () { X.die((pre || '') + (DIE_TXT[why] || DIE_TXT['자발적 피날레']) + '<br><br><b>BAD — 「' + esc(why) + '」</b>'); }, 250);
}
V.die = vDie;
function gam(n, endTitle) {
    const lk = me();
    const before = lk.gam || 0;
    lk.gam = Math.max(0, Math.min(100, before + n));
    X.save();
    if (lk.gam >= 100) { vDie('자발적 피날레', endTitle || '자발적 피날레'); }
    return '<div class="wd-sys" style="color:' + (n > 0 ? '#ff8a80' : '#9ccc65') + ';">감화도 ' + (n > 0 ? '+' : '') + n + ' → ' + lk.gam + ' / 100</div>';
}
V.gam = gam;
// 판정 — 장비 없이. dc 16 기준에서 need 로 바꾼다 (25 → −9). 3회 연속 실패는 즉사.
function vRoll(need, extra) {
    const lk = me();
    const r = X.roll((extra || 0) + (16 - (need || 16)) - (lk.pen || 0));
    r.need = need || 16;
    if (r.ok) lk.fails = 0;
    else lk.fails = (lk.fails || 0) + 1;
    X.save();
    if (lk.fails >= 3 && !lk.dying) { lk.dying = 1; X.save(); setTimeout(function () { vDie('주사위 3회 연속 실패', null, rollH(r)); }, 600); }
    return r;
}
V.roll = vRoll;
function rollH(r) {
    const need = r.need || 16;
    const real = (r.total - r.raw) - (16 - need);
    return '<div class="wd-roll" style="color:' + (r.ok ? '#4CAF50' : '#f44336') + ';">' + (r.raw + real)
        + (real ? ' <small>(' + r.raw + (real > 0 ? ' + ' : ' − ') + Math.abs(real) + ')</small>' : '') + ' <small>/ ' + need + '</small></div>';
}
// 피를 바치는 의식 — 3회 연속 실패에는 세지 않는다
function rite(extra, band) {
    let b = extra || 0;
    if (band && X.spend('장미 반창고')) b += 5;
    const r = X.roll(b);
    r.need = 16;
    return r;
}
function riteBtns(fn) {
    let b = X.btn('손을 내민다. <span style="font-size:10px;color:#888;">(「피를 바치는 의식」 1~30 · 16 이상)</span>', fn + '(0)');
    if (X.has && X.has('장미 반창고')) b += X.btn('🌹 장미 반창고를 붙이고 손을 내민다. <span style="font-size:10px;color:#d4af37;">(+5)</span>', fn + '(1)');
    return b;
}

// 위쪽 띠 — 감화도 · 연속 실패 · 상품권 · 쓸 수 있는 물건
(function hookBar() {
    const _bar = L.bar;
    L.bar = function () {
        if (!isVamp()) return _bar.apply(this, arguments);
        const lk = me() || {};
        const g = lk.gam || 0;
        let h = '<div class="wd-bar" style="border-color:#4a1f2a;">'
            + '<span>감화도 <b style="color:' + (g >= 70 ? '#ff6b6b' : g >= 40 ? '#ff9800' : '#e8d9a8') + ';">' + g + '</b> / 100</span>'
            + '<span>연속 실패 <b>' + (lk.fails || 0) + '</b> / 3</span>'
            + (lk.tix != null ? '<span>상품권 <b>' + lk.tix + '</b></span>' : '')
            + (lk.inst ? '<span>남은 할부 <b>' + lk.inst + '</b></span>' : '')
            + '</div>';
        if (X.has && X.has('은 티스푼') && g > 0) h += X.btn('🥄 은 티스푼으로 찻잔을 젓는다. <span style="font-size:10px;color:#d4af37;">(감화도 −10)</span>', 'WONDER.VAMP.spoon()');
        if (X.has && X.has('붉은 손수건') && (lk.fails || 0) > 0) h += X.btn('🟥 붉은 손수건으로 눈을 가렸다 뗀다. <span style="font-size:10px;color:#d4af37;">(연속 실패 0)</span>', 'WONDER.VAMP.hanky()');
        if (L.def().exitBtn) h += X.btn('⏏ 「퇴장」', 'WONDER.VAMP.exit()');
        return h;
    };
})();
V.spoon = function () { if (!X.spend('은 티스푼')) return; gam(-10); try { showDarkToast('🥄 감화도 −10'); } catch (e) { } X.view(); };
V.hanky = function () { if (!X.spend('붉은 손수건')) return; me().fails = 0; X.save(); try { showDarkToast('🟥 연속 실패 0'); } catch (e) { } X.view(); };

// 한 번만 — 다시 그릴 때 두 번 적용되지 않게
function once(key, fn) {
    const lk = me();
    lk.once = lk.once || {};
    if (lk.once[key]) return lk.once[key] === 1 ? '' : lk.once[key];
    const r = fn() || '';
    lk.once[key] = r || 1;
    X.save();
    return r;
}

// ==========================================
// 함께 고르는 걸음 (투표 · 몰래 고르기)
// ==========================================
//   step: { k:'vtv', id, title, text(), who()?, opts() → [{l, v, cast()?}], mine(v)?, resolve(m) → { html, end:[t,r,extra], wait } , skip()? }
//   cast() 는 고르는 순간 내 쪽에서 한 번 — 판정 · 감화도 같은 것. 값을 고쳐 돌려줄 수 있다 (null 이면 취소).
L.K.vtv = function (step, i) {
    if (step.skip && step.skip()) { L.goStep(i + 1); return; }
    if (dead()) return;
    const m = L.votes(step.id);
    const who = step.who ? step.who() : L.who();
    const title = step.title || '—';
    const text = step.text ? step.text() : '';
    if (who.indexOf(ME()) >= 0 && m[ME()] == null) {
        const os = step.opts();
        L.draw(title, text, os.map(function (o, j) { return X.btn(o.l, 'WONDER.VAMP.cast(' + i + ',' + j + ')'); }).join('') + (step.extra ? step.extra() : ''));
        return;
    }
    if (!who.every(function (c) { return m[c] != null; })) {
        const mv = m[ME()];
        L.draw(title, text + (mv != null && step.mine ? '<div class="wd-sys">' + step.mine(mv) + '</div>' : ''), L.waitList(m, who));
        return;
    }
    const r = step.resolve(m) || {};
    if (r.end) { L.end(r.end[0], r.end[1], r.end[2]); L.draw(title, r.html || text, X.waitHtml('_none', '…')); return; }
    if (r.wait) { L.draw(title, r.html || text, X.waitHtml('_none', '…')); return; }
    L.draw(title, r.html || '', r.btns || X.btn('계속 간다.', 'WONDER.lkNext()'));
};
V.cast = function (i, j) {
    const f = F();
    if (f.lk.i !== i || dead()) return;
    const step = L.def().steps[i];
    if (L.votes(step.id)[ME()] != null) return;
    const o = step.opts()[j];
    if (!o) return;
    let v = o.v;
    if (o.cast) { v = o.cast(v); if (v == null) return; }
    L.vote(step.id, v);
};
function val(x) { return (x && typeof x === 'object') ? x.v : x; }
function memList() { const p = L.plan(); return p.mem.filter(function (c) { return X.actives().indexOf(c) >= 0; }); }
function seeded(tag, list) { if (!list.length) return null; const r = X.srand(L.rk() + ':' + tag)(); return list.slice().sort()[Math.floor(r * list.length)]; }
// 가장 많이 받은 것 — 동률이면 운명 뽑기(무작위)
function topPick(m, tag, blank) {
    const t = {};
    Object.keys(m).forEach(function (c) { const v = val(m[c]); t[v] = (t[v] || 0) + 1; });
    Object.keys(blank || {}).forEach(function (c) { if (t[c] > 0) t[c]--; });
    let best = -1, top = [];
    Object.keys(t).forEach(function (k) { if (t[k] > best) { best = t[k]; top = [k]; } else if (t[k] === best) top.push(k); });
    return { win: top.length === 1 ? top[0] : seeded(tag, top), tie: top.length > 1, t: t };
}

// ==========================================
// 공용 걸음
// ==========================================
//   venter — 진입 · 귀빈석 (상품권 2장)
//   vann   — 사회자의 안내
//   vroom  — 부스 · 연회의 한 장면 + 판정 하나 (개인)
//   vlobby — 로비 합류
const BOOTH = {
    sweet: [
        { t: '「달콤한 밤, 영원한 꿈」', x: '「달콤한 밤, 영원한 꿈」 체험관입니다. 진열대마다 망상홈쇼핑의 신상품이 줄지어 놓여 있습니다. 베개, 이불, 작은 수면 안대. 모두 「한 번 누우면 다시는 일어나고 싶지 않은」이라는 문구를 달고 있습니다.<br><br>직원이 당신의 팔을 다정하게 붙잡습니다. “교우님, 한 번만 누워 보세요. 딱 한 번만요.”',
          o: ['정중히 사양한다.', '누워 보는 척하고 빠져나온다.', '직원의 말을 끝까지 듣는다.'],
          ok: '당신은 진열대 사이를 무사히 빠져나옵니다. 직원은 여전히 웃으며 손을 흔듭니다.', bad: '정신을 차려 보니 당신은 푹신한 침대 위에 누워 있습니다. 언제 누웠는지 기억나지 않습니다. 직원이 박수를 칩니다.' },
        { t: '시식 코너', x: '시식 코너입니다. 은쟁반 위에 작은 케이크가 끝없이 놓여 있습니다. 하나를 집으면 그 자리에 또 하나가 놓입니다.<br><br>“교우님, 맛만 보세요! 오늘 밤은 영원히 달콤하니까요!”',
          o: ['하나만 맛본다.', '손을 대지 않는다.', '접시를 직원에게 돌려준다.'],
          ok: '입안에 단맛이 남지만, 발은 제자리에 있습니다.', bad: '하나, 또 하나. 접시가 비지 않습니다. 손이 멈추지 않습니다. 직원이 냅킨을 건네며 웃습니다.' }
    ],
    beauty: [
        { t: '분장실', x: '「아름다움과 추악함」 체험관의 분장실입니다. 거울 수십 개가 한 사람을 비춥니다. 거울마다 당신이 조금씩 다르게 웃고 있습니다.<br><br>분장사가 붓을 들고 다가옵니다. “조금만 고치면 완벽해요. 아주 조금만.”',
          o: ['붓을 피한다.', '거울을 등지고 앉는다.', '맡겨 본다.'],
          ok: '붓끝이 뺨에 닿기 전에 당신은 자리에서 일어납니다. 거울 속의 당신들이 아쉽다는 듯 웃습니다.', bad: '붓이 입꼬리를 한 번 쓸고 지나갑니다. 거울 속의 당신이 조금 더 크게 웃습니다. 입꼬리가 잘 내려오지 않습니다.' },
        { t: '소품실', x: '소품실입니다. 선반마다 가면과 장갑, 오래된 왕관이 놓여 있습니다. 모두 누군가 쓰던 것입니다. 안쪽에서 리허설 박수가 규칙적으로 들려옵니다.',
          o: ['아무것도 만지지 않고 지나간다.', '가면 하나를 들어 본다.', '박수 소리를 따라간다.'],
          ok: '선반 사이를 지나는 동안 아무것도 당신을 붙잡지 않습니다.', bad: '가면 안쪽에서 누군가의 숨결이 느껴집니다. 박수 소리가 한 박자 빨라집니다.' }
    ],
    feast: [
        { t: '「끝나지 않는 연회」', x: '「끝나지 않는 연회」의 문이 열립니다. 긴 식탁 위의 음식은 덜어 가는 족족 다시 차오릅니다. 빈자리 하나가 당신을 기다리는 것처럼 의자가 빠져 있습니다.',
          o: ['서서 지켜본다.', '잔만 받아 든다.', '빈자리를 지나친다.'],
          ok: '당신은 빈자리를 지나칩니다. 의자는 다음 사람을 기다립니다.', bad: '어느새 당신은 빈자리에 앉아 있습니다. 옆자리의 신도가 잔을 채워 줍니다. “정말 편안하군요.”' },
        { t: '건배', x: '연회가 무르익습니다. 누군가 건배를 외치고, 모두가 같은 순간 잔을 비웁니다. 그리고 같은 순간 잔이 다시 찹니다.',
          o: ['잔을 내려놓는다.', '건배를 따라 한다.', '입만 벙긋한다.'],
          ok: '박자에서 한 발 비켜섭니다. 아무도 눈치채지 못합니다.', bad: '당신의 잔도 비어 있고, 다시 차 있습니다. 언제 마셨는지 모릅니다.' }
    ]
};
V.BOOTH = BOOTH;
L.K.venter = function () {
    const lk = me();
    if (lk.gam == null) { lk.gam = 0; lk.fails = 0; lk.tix = 2; X.save(); }
    const sc = common(17);
    const x = paras(sc.p[0].x).filter(function (q) { return !/^<i>\(/.test(q); }).map(clean).join('<br><br>');
    L.draw('귀빈석', x + '<div class="wd-sys">상품권 2장을 받았습니다.<br>이 어둠에서는 어떤 장비도 통하지 않습니다. 주사위 3회 연속 실패는 즉사, 감화도 100은 탈락입니다.</div>', X.btn('대강당을 나선다.', 'WONDER.lkNext()'));
};
L.K.vann = function () {
    const s = scn('사회자의 안내');
    L.draw('사회자의 안내', body(s.p[0].x), X.btn('계속 간다.', 'WONDER.lkNext()'));
};
L.K.vroom = function (step, i) {
    if (dead()) return;
    const s = st();
    const R = BOOTH[step.b][step.n || 0];
    const pre = step.pre ? step.pre(s) : '';
    if (!s.r) {
        L.draw(R.t, pre + R.x, R.o.map(function (o, j) { return X.btn(o + ' <span style="font-size:10px;color:#888;">(판정)</span>', 'WONDER.VAMP.room(' + j + ')'); }).join(''));
        return;
    }
    const after = step.after ? once('after' + i, function () { return step.after(s); }) : '';
    L.draw(R.t, rollH(s.r) + (s.r.ok ? R.ok : R.bad) + after, dead() ? '' : X.btn(step.next || '계속 간다.', 'WONDER.lkNext()'));
};
V.room = function (j) {
    const s = st();
    if (s.r || dead()) return;
    const step = L.def().steps[F().lk.i];
    s.r = vRoll(16, step.bonus ? step.bonus() : 0);
    if (dead()) { X.save(); return; }
    if (step.onRoll) step.onRoll(s, s.r);
    X.save(); X.view();
};
L.K.vlobby = function (step) {
    const lk = me();
    const p = L.plan();
    let x = step.n === 2 ? '로비로 돌아옵니다. 전광판의 숫자가 거의 다 흘렀습니다. 사람들이 「끝나지 않는 연회」의 문 앞에 줄을 서기 시작합니다.'
        : '로비로 돌아옵니다. 전광판의 숫자가 흐르고, 어디선가 안내 방송이 경쾌하게 울립니다. “2차 체험을 준비해 주세요!”';
    if (step.n === 1 && (p.mem.length <= 2 || L.def().guestBox)) x += '<br><br>' + body(common(18).p[0].x);
    const extra = step.extra ? step.extra() : '';
    L.draw('로비', x + extra, (step.btns ? step.btns() : '') + X.btn(step.n === 2 ? '연회장으로 향한다.' : '다음 탐사를 준비한다.', 'WONDER.lkNext()'));
};
const COMMON = [{ k: 'venter' }, { k: 'vann' }, { k: 'rules' }];

// ==========================================
// 결말 — 「판이 멈출 때」 → 귀환 ✔ / ✖ (원고 공통) + 미션의 (귀환) 대사
// ==========================================
function endings() {
    const s = scn('결말');
    const out = {};
    let cur = null;
    allP(s).forEach(function (q) {
        const m = q.match(/^<b>([✔✖])?\s*([^<]+)<\/b>/);
        if (m) { cur = { ok: m[1] === '✔', t: m[2].trim(), ret: null }; out[cur.t] = cur; return; }
        if (cur && /^<i>\(귀환\)<\/i>/.test(q)) cur.ret = clean(q.replace(/^<i>\(귀환\)<\/i>\s*/, ''));
    });
    return out;
}
function retPage(ok, line) {
    const sc = common(ok ? 20 : 21);
    return paras(sc.p[0].x).map(function (q) {
        if (/판마다 적힌/.test(q)) return line || '';
        if (/황금빛 열쇠 사탕」/.test(q) && /보상/.test(q)) return '';
        return clean(q);
    }).filter(Boolean).join('<br><br>');
}
(function hookEnd() {
    const _lk = X.VIEW.lk;
    X.VIEW.lk = function (sc) {
        if (isVamp() && L.st().plan && L.st().end) return vEnd(L.st().end);
        return _lk.apply(this, arguments);
    };
})();
function vEnd(end) {
    const f = F();
    if (dead()) return;
    f.lk.e = f.lk.e || {};
    const d = L.def();
    let mine = end.r, extra = '';
    if (d.endMine) {
        const o = d.endMine(end, f.lk.e);
        if (o) { if (o.r) mine = o.r; if (o.html) extra = o.html; if (o.die) return vDie(o.die, end.t); }
    }
    const ok = mine === 'w' || mine === 'd';
    if (!(f.lk.e.pg)) {
        const stop = common(19);
        const x = paras(stop.p[0].x).filter(function (q) { return !/^<i>/.test(q); }).join('<br><br>');
        L.draw((end.r === 'f' ? '✖ ' : '✔ ') + esc(end.t), (end.lead ? end.lead + '<br><br>' : '') + extra + (extra ? '<br><br>' : '') + x, X.btn('저택으로 돌아간다.', 'WONDER.L.endPage(1)'));
        return;
    }
    const E = endings();
    const e = E[end.t] || {};
    const line = e.ret || '';
    X.draw(ok ? '✔' : '✖', retPage(ok, line) + '<div class="wd-sys">' + (ok ? '미션 성공 — ' + (mine === 'w' ? '이상한 나라 쪽' : '어둠 쪽') + ' · 「황금빛 열쇠 사탕」 · 보상은 나중에 들어갑니다' : '미션 실패 — 잃는 것은 없습니다') + '</div>',
        X.btn('문을 지난다.', 'WONDER.L.done()'));
}
const GEN_FAIL = '판이 멈춤';    // 원고에 따로 없는 「✔에 닿지 못함」

// ==========================================
// S1 주인님의 꽃
// ==========================================
const S1_ITEM = ['마지막 립스틱', '미소 고정 장치', '막간의 종'];
const S1_SEC = ['분장실', '소품실', '리허설실'];
L.K.s1tag = function () {
    const s = st();
    const sc = scn('꼬리표');
    const x = body(sc.p[0].x);
    if (s.pick == null) {
        L.draw('꼬리표', x, X.btn('흰 장미를 집는다. <span style="font-size:10px;color:#888;">(★★★★ · 감화도 +40)</span>', 'WONDER.VAMP.s1rose()') + X.btn('지금은 두고 부스를 둘러본다.', 'WONDER.VAMP.s1skip()'));
        return;
    }
    L.draw('꼬리표', x + (s.note || ''), dead() ? '' : X.btn('부스를 둘러본다.', 'WONDER.lkNext()'));
};
V.s1rose = function () { const s = st(), lk = me(); if (lk.rose) return; lk.rose = 1; s.pick = 1; s.note = '<br><br>유리 덮개를 들어 올립니다. 흰 장미가 손바닥 위에서 서늘합니다.' + gam(40); X.save(); X.view(); };
V.s1skip = function () { st().pick = 0; X.save(); X.view(); };
L.K.s1sec = function (step) {
    const s = st(), lk = me();
    if (dead()) return;
    const n = step.n;
    const R = BOOTH.beauty[n < 2 ? n : 1];
    const item = S1_ITEM[n];
    if (!s.ph) {
        const intro = n === 2 ? '리허설실입니다. 작은 무대 위에서 누군가 끝없이 인사를 연습합니다. 객석은 비어 있는데도 박수 소리가 규칙적으로 들려옵니다.' : R.x;
        let b = X.btn('「' + item + '」을 집는다. <span style="font-size:10px;color:#888;">(★★ · 감화도 +20)</span>', "WONDER.VAMP.s1take(1)");
        if (!lk.rose) b += X.btn('부스 한가운데의 흰 장미를 집는다. <span style="font-size:10px;color:#888;">(★★★★ · 감화도 +40)</span>', "WONDER.VAMP.s1take(2)");
        b += X.btn('아무것도 집지 않는다.', "WONDER.VAMP.s1take(0)");
        L.draw(S1_SEC[n], intro + '<br><br>진열대 위에 「' + item + '」이 놓여 있습니다. 꼬리표의 별은 두 개입니다.', b);
        return;
    }
    if (s.ph === 1) {
        const sc = scn('미소 요청');
        const x = body(sc.p[0].x);
        const fixed = (lk.items || []).indexOf('미소 고정 장치') >= 0;
        L.draw('미소 요청', (s.note || '') + x + (fixed ? '<div class="wd-sys">「미소 고정 장치」를 착용하고 있어 웃지 않을 수 없습니다.</div>' : '') + '<div class="wd-sys">미소 ' + (lk.smile || 0) + ' / 3</div>',
            X.btn('웃는다. <span style="font-size:10px;color:#888;">(감화도 +25 · 미소 1회)</span>', 'WONDER.VAMP.s1smile(1)') + (fixed ? '' : X.btn('웃지 않는다.', 'WONDER.VAMP.s1smile(0)')));
        return;
    }
    L.draw('미소 요청', s.note2 || '', dead() ? '' : X.btn('계속 간다.', 'WONDER.lkNext()'));
};
V.s1take = function (k) {
    const s = st(), lk = me();
    if (s.ph) return;
    const n = L.def().steps[F().lk.i].n;
    s.note = '';
    if (k === 1) { lk.items = (lk.items || []).concat([S1_ITEM[n]]); s.note = '「' + S1_ITEM[n] + '」을 손에 넣었습니다.' + gam(20) + '<br>'; }
    if (k === 2) { lk.rose = 1; s.note = '유리 덮개를 들어 올립니다. 흰 장미가 손바닥 위에서 서늘합니다.' + gam(40) + '<br>'; }
    s.ph = 1;
    X.save(); X.view();
};
V.s1smile = function (k) {
    const s = st(), lk = me();
    if (s.ph !== 1) return;
    s.ph = 2;
    if (!k) { s.note2 = '당신은 웃지 않습니다. 거울 속의 사회자가 아쉽다는 듯 어깨를 으쓱합니다.'; X.save(); return X.view(); }
    lk.smile = (lk.smile || 0) + 1;
    s.note2 = '입꼬리가 올라갑니다. 찰칵.' + gam(25);
    X.save();
    if (dead()) return;
    if (lk.smile >= 3) return L.end('명예 참석자', 'd', { lead: sect(scn('미소 요청'), '세 번째 미소') });
    X.view();
};
L.K.s1out = function () {
    const lk = me();
    if ((lk.gam || 0) >= 50) return L.end('빈손', 'f', { lead: '부스를 나서는 순간 꼬리표의 별이 하나둘 지워지고, 그 자리에 글자가 떠오릅니다. 「판매 완료」. 손에 든 물건이 모두 진열대로 돌아갑니다.' });
    if (lk.rose) return L.end('가장 아름다운 것', 'w', { lead: '흰 장미를 품에 안고 부스를 나섭니다. 꼬리표의 별은 그대로입니다.' });
    L.end('빈손', 'f');
};

// ==========================================
// S2 빈 액자
// ==========================================
L.K.s2stage = function () {
    const s = st(), lk = me();
    if (dead()) return;
    const sc = scn('앙코르 대기 중');
    let x = s.res || body(sc.p[0].x);
    let b = X.btn('저택으로 모셔 가겠다고 설득한다. <span style="font-size:10px;color:#888;">(맨 주사위 25 이상)</span>', 'WONDER.VAMP.s2(0)');
    if (X.has && X.has('집사의 심부름표')) b += X.btn('📜 집사의 심부름표를 내밀며 설득한다. <span style="font-size:10px;color:#d4af37;">(25 이상 · +3)</span>', 'WONDER.VAMP.s2(3)');
    b += X.btn('긁힌 명패를 내민다. <span style="font-size:10px;color:#888;">(아이템 제출 17 이상)</span>', 'WONDER.VAMP.s2(1)');
    b += X.btn('「앙코르!」를 외친다. <span style="font-size:10px;color:#888;">(감화도 +16 · ' + (lk.enc || 0) + ' / 3)</span>', 'WONDER.VAMP.s2(2)');
    L.draw('리허설실', x, b);
};
V.s2 = function (k) {
    const s = st(), lk = me();
    if (dead()) return;
    const sc = scn('앙코르 대기 중');
    if (k === 2) {
        lk.enc = (lk.enc || 0) + 1;
        const g = gam(16);
        if (dead()) return;
        if (lk.enc >= 3) return L.end('마지막 인사', 'd', { lead: sect(sc, '세 번째 앙코르') });
        s.res = '당신의 목소리가 빈 객석에 울립니다. 그는 허리를 숙였다가 폅니다. 조금 더 천천히.' + g + '<br>“' + ['한 번 더요.', '마지막으로 한 번만 더요.'][lk.enc - 1] + '”';
        X.save(); return X.view();
    }
    let extra = 0;
    if (k === 3) { if (!X.spend('집사의 심부름표')) return; extra = 3; }
    const r = vRoll(k === 1 ? 17 : 25, extra);
    if (dead()) return;
    const pre = k === 1 ? sect(sc, '긁힌 명패를 내밀면') + '<br><br>' : '';
    if (r.raw === 1) { s.res = pre + rollH(r); X.save(); X.view(); return vDie('대리 참석', '대리 참석', rollH(r) + '그가 자기 명찰을 떼어 당신의 가슴에 달아 줍니다. “이제 당신 차례예요.”<br><br>'); }
    if (r.ok) return L.end('액자의 주인', 'w', { lead: pre + rollH(r) + sect(sc, '영입에 성공하면') });
    s.res = pre + rollH(r) + '그는 고개를 젓고, 다시 빈 객석을 향해 허리를 숙입니다. “아직 끝나지 않았어요.”';
    X.save(); X.view();
};

// ==========================================
// S3 첫 번째 선물
// ==========================================
const BODY_X = [['양손의 손톱 열 개', 3, 20, 0], ['왼쪽 귀', 6, 0, 1], ['왼쪽 눈', 9, 0, 2]];
L.K.s3exch = function () {
    const s = st(), lk = me();
    if (s.done) { L.draw('상품권 교환소', s.done, X.btn('계속 간다.', 'WONDER.lkNext()')); return; }
    if (lk.exch) { L.goStep(F().lk.i + 1); return; }
    L.draw('상품권 교환소', '로비 한쪽에 상품권 교환소가 열려 있습니다. 접수대 뒤의 직원이 환하게 인사합니다.<br><br>“어서 오세요, 교우님! 오늘은 무엇으로 바꿔 가시겠어요?”<div class="wd-sys">교우님당 한 번</div>',
        BODY_X.map(function (b, j) { return X.btn(b[0] + ' — 상품권 ' + b[1] + '장 <span style="font-size:10px;color:#888;">(' + (b[2] ? '감화도 +' + b[2] : '판정 −' + b[3]) + ')</span>', 'WONDER.VAMP.s3x(' + j + ')'); }).join('')
        + X.btn('들르지 않는다.', 'WONDER.VAMP.s3x(9)'));
};
V.s3x = function (j) {
    const s = st(), lk = me();
    if (lk.exch) return;
    lk.exch = 1;
    if (j === 9) { X.save(); return L.next(true); }
    const b = BODY_X[j];
    lk.tix = (lk.tix || 0) + b[1];
    lk.pen = (lk.pen || 0) + b[3];
    s.done = '직원이 서류에 도장을 찍습니다. 「' + b[0] + '」 — 상품권 ' + b[1] + '장.<div class="wd-sys">상품권 ' + lk.tix + '장' + (b[3] ? ' · 판정 −' + b[3] + ' (탐사가 끝날 때까지)' : '') + '</div>' + (b[2] ? gam(b[2]) : '');
    X.save(); X.view();
};
function s3charge(i) {
    const lk = me();
    if (!lk.inst) return '';
    return once('inst' + i, function () { return '<div class="wd-note" style="border-color:#4a1f2a;">' + sect(scn('귀빈을 위한 붉은 한 잔'), '분할 상환 중일 때').replace('■', String(lk.inst)) + '</div>' + gam(8, '갚지 못한 할부'); });
}
function s3pay() {
    const lk = me();
    return (lk.inst && lk.tix > 0) ? X.btn('상품권 1장으로 할부를 갚는다. <span style="font-size:10px;color:#888;">(남은 할부 ' + lk.inst + ')</span>', 'WONDER.VAMP.s3pay()') : '';
}
V.s3pay = function () {
    const lk = me();
    if (!lk.inst || !(lk.tix > 0)) return;
    lk.tix--; lk.inst--;
    X.save();
    if (!lk.inst) return L.end('선물', 'w', { lead: '마지막 상품권을 내밀자 어디선가 딱, 하고 계산기 소리가 납니다. 「할부 완납」. 품에 안은 잔이 따뜻합니다.' });
    X.view();
};
L.K.s3cup = function (step, i) {
    const s = st(), lk = me();
    if (dead()) return;
    const sc = scn('귀빈을 위한 붉은 한 잔');
    if (s.res) { L.draw('붉은 한 잔', s.res, dead() ? '' : X.btn('계속 간다.', 'WONDER.lkNext()')); return; }
    const x = paras(sc.p[0].x).join('<br><br>');
    let b = '';
    if ((lk.tix || 0) >= 4) b += X.btn('상품권 4장으로 산다. <span style="font-size:10px;color:#888;">(즉시 상환 · 감화도 +12)</span>', 'WONDER.VAMP.s3(0)');
    else b += '<div class="wd-sys">즉시 상환에는 상품권 4장이 필요합니다. (지금 ' + (lk.tix || 0) + '장)</div>';
    b += X.btn('분할 상환으로 산다. <span style="font-size:10px;color:#888;">(장면마다 감화도 +8 · 4장)</span>', 'WONDER.VAMP.s3(1)');
    if (!s.rite) b += X.btn('직접 바친다. <span style="font-size:10px;color:#888;">(「피를 바치는 의식」 · 감화도 +16)</span>', 'WONDER.VAMP.s3(2)');
    b += X.btn('지금은 두고 계속 간다.', 'WONDER.lkNext()');
    if (s.rite) { L.draw('붉은 한 잔', sect(sc, '직접 바칠 때') + gam0(s), riteBtns('WONDER.VAMP.s3rite')); return; }
    L.draw('붉은 한 잔', x, b);
};
function gam0(s) { return s.gnote || ''; }
V.s3 = function (k) {
    const s = st(), lk = me();
    const sc = scn('귀빈을 위한 붉은 한 잔');
    if (k === 0) { if ((lk.tix || 0) < 4) return; lk.tix -= 4; const g = gam(12); if (dead()) return; return L.end('선물', 'w', { lead: sect(sc, '샀을 때') + g }); }
    if (k === 1) { lk.inst = 4; s.res = sect(sc, '샀을 때') + '<div class="wd-sys">남은 할부 4장 — 다 갚을 때까지 장면이 바뀔 때마다 감화도 +8. 4장을 다 갚기 전에는 잔을 들고 나갈 수 없습니다.</div>'; X.save(); return X.view(); }
    s.rite = 1; s.gnote = gam(16); X.save(); if (!dead()) X.view();
};
V.s3rite = function (band) {
    const s = st();
    if (s.rr) return;
    const sc = scn('귀빈을 위한 붉은 한 잔');
    const r = rite(0, band);
    s.rr = r; X.save();
    if (r.ok) return L.end('참석 확정', 'd', { lead: rollH(r) + inl(sc, '「충분한 성의」') });
    vDie('지나친 성의', '지나친 성의', rollH(r) + inl(sc, '「지나친 성의」') + '<br><br>');
};
L.K.s3lobby = function (step, i) {
    if (dead()) return;
    const lk = me();
    const ch = s3charge(i);
    if (dead()) return;
    L.draw('로비', ch + '로비로 돌아옵니다. 전광판의 숫자가 흐릅니다.' + (step.n === 2 ? '<br><br>로비 2차 합류입니다. 집사가 로비 구석에서 당신의 잔을 바라봅니다.' : ''),
        s3pay() + X.btn(step.n === 2 ? '집사에게 간다.' : '다음 탐사를 준비한다.', step.n === 2 ? 'WONDER.VAMP.s3fin()' : 'WONDER.lkNext()'));
};
V.s3fin = function () {
    const lk = me();
    if (lk.inst) return L.end('로비 2차까지 잔을 채우지 못함', 'f', { lead: '아직 갚지 못한 할부가 ' + lk.inst + '장 남아 있습니다. 직원이 상냥하게 잔을 돌려받아 진열대에 올려놓습니다.' });
    L.end('로비 2차까지 잔을 채우지 못함', 'f', { lead: '주인님의 빈 잔은 여전히 비어 있습니다.' });
};

// ==========================================
// S4 기다리는 시간
// ==========================================
L.K.s4bell = function (step) {
    const s = st(), lk = me();
    if (dead()) return;
    const p = L.plan();
    const real = p.bell === step.n;
    const sc = scn('막간의 종');
    let x = body(sc.p[0].x);
    if (s.look) {
        const q = allP(sc).find(function (z) { return z.indexOf('회중시계의 뚜껑을 엽니다') >= 0; }) || '';
        const parts = q.split(/<i>\((진짜|가짜)\)<\/i>/);
        let t = parts[0];
        for (let k = 1; k < parts.length; k += 2) if ((parts[k] === '진짜') === real) t += parts[k + 1];
        x += '<br><br>' + clean(t) + (real && (lk.items || []).indexOf('막간의 종') >= 0 ? ' 소지품 속 작은 종도 함께 떨립니다.' : '');
    }
    L.draw('막간의 종', x, (s.look ? '' : X.btn('소지품을 확인한다.', 'WONDER.VAMP.s4look()')) + X.btn('퇴장한다.', 'WONDER.VAMP.s4out()') + X.btn('버틴다.', 'WONDER.lkNext()'));
};
V.s4look = function () { st().look = 1; X.save(); X.view(); };
V.s4out = function () {
    const p = L.plan();
    const step = L.def().steps[F().lk.i];
    const sc = scn('막간의 종');
    if (p.bell === step.n) return L.end('퇴장 승인', 'd', { lead: sect(sc, '진짜 종에 퇴장하면') });
    L.end('가짜 종', 'f', { lead: sect(sc, '가짜 종에 퇴장하면') });
};
V.exit = function () {
    const step = L.def().steps[F().lk.i] || {};
    if (step.k === 's4bell') return V.s4out();
    vDie('출구를 찾는다', '출구를 찾는다');
};
L.K.v_s4end = function () { L.end('아름다운 인내', 'w', { lead: sect(scn('행사가 끝날 때'), '') || body(scn('행사가 끝날 때').p[0].x) }); };
function hold(s) { return gam(16); }

// ==========================================
// T1 세 번의 투표
// ==========================================
function t1res(n) { return (L.x().t1 || {})[n] || null; }
function t1vote(n) {
    return {
        k: 'vtv', id: 't1v' + n, title: '오늘의 주인공',
        skip: function () { return !!L.st().end; },
        text: function () {
            const sc = scn('투표');
            const ps = paras(sc.p[0].x);
            const k = ps.findIndex(function (q) { return /익명 투표/.test(q); });
            return ps.slice(0, k).filter(function (q) { return !/^<i>/.test(q); }).join('<br><br>') + '<div class="wd-sys">투표 ' + (n + 1) + ' / 3 · 익명 · 자기 자신도 가능 · 동률은 운명 뽑기<br>열린 문 ' + t1doors(n) + ' / 3</div>';
        },
        opts: function () { return memList().map(function (c) { return { l: esc(nm(c)) + (c === ME() ? ' <span style="font-size:10px;color:#888;">(나)</span>' : ''), v: c }; }); },
        extra: function () { return (X.has && X.has('백지 투표용지') && !((L.x().t1b || {})[n] || {})[ME()]) ? X.btn('📄 백지 투표용지를 함께 넣는다. <span style="font-size:10px;color:#d4af37;">(나에게 온 표 하나 무효)</span>', 'WONDER.VAMP.t1blank(' + n + ')') : ''; },
        mine: function (v) { return esc(nm(val(v))) + '에게 투표했습니다.'; },
        resolve: function (m) {
            const top = topPick(m, 't1v' + n, ((L.x().t1b || {})[n]) || {});
            const sc = scn('투표');
            const ps = paras(sc.p[0].x);
            const k = ps.findIndex(function (q) { return /익명 투표/.test(q); });
            const html = ps.slice(k + 1).map(clean).join('<br><br>').replace('■■■', esc(nm(top.win))) + (top.tie ? '<div class="wd-sys">동률 — 운명 뽑기</div>' : '');
            L.tx('x/t1c/' + n, function (cur) { return cur || top.win; });
            return { html: html };
        }
    };
}
V.t1blank = function (n) { if (!X.spend('백지 투표용지')) return; L.pub('x/t1b/' + n + '/' + ME(), true); X.view(); };
function t1doors(upto) { let d = 0; for (let k = 0; k < upto; k++) { const r = t1res(k); if (r && r.act === 'door' && r.ok) d++; } return d; }
L.K.t1act = function (step, i) {
    if (dead()) return;
    const n = step.n;
    const c = (L.x().t1c || {})[n];
    const r = t1res(n);
    const sc = scn('투표');
    if (!c) { L.draw('—', '', X.waitHtml('_none', '…')); return; }
    if (!r) {
        if (c === ME()) {
            const s = st();
            if (s.door) { L.draw('문', sect(sc, '문에 피를 바치면'), riteBtns('WONDER.VAMP.t1rite')); return; }
            L.draw('오늘의 주인공', '무대의 조명과 문 손잡이의 은빛이 동시에 당신을 비춥니다.',
                X.btn('문에 피를 바친다. <span style="font-size:10px;color:#888;">(「피를 바치는 의식」)</span>', 'WONDER.VAMP.t1door()') + X.btn('무대에 오른다. <span style="font-size:10px;color:#888;">(감화도 +30)</span>', 'WONDER.VAMP.t1stage()'));
            return;
        }
        L.draw('—', '박수 속에서 ' + esc(nm(c)) + josa(nm(c), '이', '가') + ' 무대와 문 사이에 서 있습니다.', X.waitHtml('_none', esc(nm(c)) + josa(nm(c), '이', '가') + ' 고르고 있습니다…'));
        return;
    }
    let html;
    if (r.act === 'stage') html = sect(sc, '무대에 오르면');
    else if (r.ok) {
        const q = inl(scn('투표'), '「충분한 성의」') || '';
        const raw = (allP(sc).find(function (z) { return z.indexOf('<b>「충분한 성의」') === 0; }) || '').replace(/^<b>[^<]*<\/b>\s*—?\s*/, '');
        const parts = raw.split(/<i>\((첫|두|세) 번째\)<\/i>/);
        const nth = t1doors(n + 1);
        html = (r.r ? rollH(r.r) : '') + clean(parts[0]) + ' ' + clean(parts[(nth - 1) * 2 + 2] || '');
    } else html = (r.r ? rollH(r.r) : '') + inl(sc, '「지나친 성의」');
    if (r.act === 'door' && r.ok && t1doors(n + 1) >= 3) { L.end('세 개의 문', 'w', { lead: html }); return; }
    if (n === 2) {
        const all = [0, 1, 2].map(t1res);
        if (all.every(function (z) { return z && z.act === 'stage' && z.c === all[0].c; })) { L.end('오늘의 주인공', 'd', { lead: html }); return; }
        L.end('세 번째 투표까지 ✔에 닿지 못함', 'f', { lead: html });
        return;
    }
    L.draw('—', html, X.btn('계속 간다.', 'WONDER.lkNext()'));
};
V.t1door = function () { st().door = 1; X.save(); X.view(); };
V.t1stage = function () {
    const n = L.def().steps[F().lk.i].n;
    if (t1res(n)) return;
    const g = gam(30, '주인공의 피날레');
    L.tx('x/t1/' + n, function (cur) { return cur || { c: ME(), act: 'stage' }; });
    if (!dead()) try { showDarkToast('감화도 +30'); } catch (e) { }
};
V.t1rite = function (band) {
    const n = L.def().steps[F().lk.i].n;
    if (t1res(n)) return;
    const r = rite(0, band);
    L.tx('x/t1/' + n, function (cur) { return cur || { c: ME(), act: 'door', ok: r.ok, r: { ok: r.ok, raw: r.raw, total: r.total, need: 16 } }; });
    if (!r.ok) vDie('지나친 성의', '지나친 성의', rollH(r) + inl(scn('투표'), '「지나친 성의」') + '<br><br>');
};

// ==========================================
// T2 오늘 밤의 디저트
// ==========================================
function t2items() { const x = L.x().t2 || {}; return { sweet: x.sweet || 0, beauty: x.beauty || 0 }; }
function t2grp(c) { const p = L.plan(); return p.groups[0].indexOf(c) >= 0 ? 0 : 1; }
function t2booth(n) {
    return {
        k: 'vroom', b: 'sweet', n: n,
        pre: function () {
            const g = t2grp(ME());
            const kind = (g + n) % 2 === 0 ? 'sweet' : 'beauty';
            return '<div class="wd-sys">당신의 조 — 「' + (kind === 'sweet' ? '달콤한 밤, 영원한 꿈' : '아름다움과 추악함') + '」 · 성공하면 ' + (kind === 'sweet' ? '달콤한 것' : '아름다운 것') + ' 하나</div>';
        },
        onRoll: function (s, r) {
            const kind = (t2grp(ME()) + n) % 2 === 0 ? 'sweet' : 'beauty';
            s.kind = kind;
            if (r.ok) L.tx('x/t2/' + kind, function (cur) { return (cur || 0) + 1; });
        },
        after: function (s) { return s.r.ok ? '<div class="wd-sys">' + (s.kind === 'sweet' ? '달콤한 것' : '아름다운 것') + ' 하나를 손에 넣었습니다.</div>' : ''; }
    };
}
// 조마다 다른 부스 지문
(function () {
    const _room = L.K.vroom;
    L.K.vroom = function (step, i) {
        if (step.k === 'vroom' && step.pre && L.def() && L.def().mid === 'T2') {
            const kind = (t2grp(ME()) + step.n) % 2 === 0 ? 'sweet' : 'beauty';
            return _room(Object.assign({}, step, { b: kind }), i);
        }
        return _room(step, i);
    };
})();
function t2vote(n) {
    return {
        k: 'vtv', id: 't2v' + n, title: '오늘의 부스',
        skip: function () { return !!L.st().end; },
        text: function () { const it = t2items(); return body(scn('오늘의 부스').p[0].x) + '<div class="wd-sys">일행이 가진 것 — 달콤한 것 ' + it.sweet + ' · 아름다운 것 ' + it.beauty + '</div>'; },
        opts: function () { return [{ l: '「달콤한 밤, 영원한 꿈」에 몰아 준다. <span style="font-size:10px;color:#888;">(아름다운 것을 모두 버린다)</span>', v: 'sweet' }, { l: '「아름다움과 추악함」에 몰아 준다. <span style="font-size:10px;color:#888;">(달콤한 것을 모두 버린다)</span>', v: 'beauty' }, { l: '아무것도 버리지 않는다. <span style="font-size:10px;color:#888;">(전원 감화도 +16)</span>', v: 'keep' }]; },
        mine: function (v) { return { sweet: '「달콤한 밤」', beauty: '「아름다움과 추악함」', keep: '「버리지 않는다」' }[val(v)]; },
        resolve: function (m) {
            const it = t2items();
            const sc = scn('오늘의 부스');
            const top = L.tally(m).win;
            if ((top === 'sweet' && it.sweet) || (top === 'beauty' && it.beauty)) {
                L.tx('x/t2/' + (top === 'sweet' ? 'beauty' : 'sweet'), function () { return 0; });
                return { end: ['오늘의 부스', 'd', { lead: sect(sc, '몰아 주면').replace('■■■', top === 'sweet' ? '달콤한 밤, 영원한 꿈' : '아름다움과 추악함') }] };
            }
            const g = once('t2k' + n, function () { return gam(16, '자발적 피날레'); });
            if (dead()) return { wait: true };
            if (n === 1) {
                if (it.sweet && it.beauty) return { end: ['두 접시', 'w'] };
                if (!it.sweet && !it.beauty) return { end: ['빈 쟁반', 'f'] };
                return { end: [GEN_FAIL, 'f', { lead: '로비 2차 합류에서 판이 멈춥니다. 쟁반의 한 자리는 비어 있습니다.' }] };
            }
            return { html: ((top === 'sweet' || top === 'beauty') ? '몰아 줄 물건이 없습니다. ' : '') + sect(sc, '버리지 않으면') + g };
        }
    };
}

// ==========================================
// T3 식탁보
// ==========================================
function t3lifted(upto) { const out = {}; for (let r = 0; r < upto; r++) { const m = L.votes('t3r' + r); Object.keys(m).forEach(function (c) { const v = val(m[c]); if (/^lift/.test(v)) out[v.slice(5)] = c; }); } return out; }
function t3round(r) {
    return {
        k: 'vtv', id: 't3r' + r, title: '다섯 개의 식탁',
        skip: function () { return !!L.st().end; },
        text: function () {
            const lifted = t3lifted(r);
            const lk = me();
            return (r === 0 ? body(scn('다섯 개의 식탁').p[0].x) : '연회는 아무 일도 없었다는 듯 이어집니다. 다섯 장의 식탁보가 여전히 새하얗습니다.')
                + '<div class="wd-sys">걷은 식탁보 ' + Object.keys(lifted).length + ' / 5' + (Object.keys(lifted).length ? ' — ' + Object.keys(lifted).sort().map(function (k) { return k + '번'; }).join(', ') : '') + ' · ' + (r + 1) + '번째 차례</div>'
                + (lk.t3seen != null ? '<div class="wd-note" style="border-color:#4a1f2a;">당신이 살핀 것 — ' + lk.t3seen + '번 식탁의 접시만 비어 갑니다.</div>' : '');
        },
        opts: function () {
            const lifted = t3lifted(r);
            const os = [{ l: '식탁을 살핀다. <span style="font-size:10px;color:#888;">(맨 주사위 17 이상)</span>', v: 'look', cast: function (v) { const x = vRoll(17); if (dead()) return null; try { showDarkToast((x.ok ? '✔ ' : '✖ ') + '살핀다'); } catch (e) { } if (x.ok) { me().t3seen = L.plan().table; X.save(); } return { v: 'look', ok: x.ok }; } }];
            [1, 2, 3, 4, 5].forEach(function (k) { if (!lifted[k]) os.push({ l: k + '번 식탁보를 걷는다. <span style="font-size:10px;color:#888;">(감화도 +16)</span>', v: 'lift:' + k, cast: function (v) { gam(16); return dead() ? null : v; } }); });
            os.push({ l: '아무것도 건드리지 않고 자리에 앉는다.', v: 'sit' });
            return os;
        },
        mine: function (v) { v = val(v); return v === 'look' ? '「살핀다」' : v === 'sit' ? '「자리에 앉는다」' : '「' + v.slice(5) + '번 식탁보를 걷는다」'; },
        resolve: function (m) {
            const p = L.plan();
            const sc = scn('다섯 개의 식탁');
            const lifted = t3lifted(r + 1);
            const now = Object.keys(m).map(function (c) { return val(m[c]); }).filter(function (v) { return /^lift/.test(v); }).map(function (v) { return +v.slice(5); });
            const liftHtml = sect(sc, '식탁보를 걷으면');
            if (Object.keys(lifted).length >= 5) return { end: ['끝난 연회', 'f', { lead: sect(sc, '다섯 번째 식탁보') }] };
            if (now.indexOf(p.table) >= 0) return { end: ['저택의 식탁보', 'w', { lead: liftHtml + '<br><br>' + tagged(sc, '저택의 것이면') }] };
            const all = Object.keys(m).every(function (c) { return val(m[c]) === 'sit'; });
            if (all && !Object.keys(lifted).length) return { end: ['끝나지 않는 연회', 'd', { lead: '모두 자리에 앉습니다. 음식은 덜어 가는 족족 다시 차오르고, 연회는 마무리까지 그대로 이어집니다.' }] };
            if (r >= 3) return { end: [GEN_FAIL, 'f', { lead: '샹들리에의 촛불이 하나 꺼집니다. 연회는 아직 끝나지 않았지만, 판은 여기서 멈춥니다.' }] };
            const mine = val(m[ME()]);
            let html = now.length ? (/^lift/.test(mine) ? liftHtml + '<br><br>' : '') + tagged(sc, '저택의 것이 아니면') : '연회는 계속됩니다.';
            if (mine === 'look') html = (m[ME()].ok ? tagged(sc, '성공') : tagged(sc, '실패')) + '<br><br>' + html;
            return { html: html };
        }
    };
}

// ==========================================
// T4 단체 초상화
// ==========================================
function t4shot(k) {
    return {
        k: 'vtv', id: 't4s' + k, title: '단체 사진',
        skip: function () { return !!L.st().end; },
        text: function () { return (k === 0 ? body(scn('단체 사진').p[0].x) : '“다시 갈게요! 하나, 둘……”') + '<div class="wd-sys">' + (k + 1) + ' / 5번째 촬영 · 서로 모르게 고릅니다</div>'; },
        opts: function () {
            const os = [{ l: '웃는다. <span style="font-size:10px;color:#888;">(감화도 +16)</span>', v: 'smile', cast: function (v) { gam(16); return dead() ? null : v; } },
                { l: '웃지 않는다.', v: 'no' },
                { l: '포즈를 취하는 대신 사진사에게 다가간다. <span style="font-size:10px;color:#888;">(맨 주사위 25 이상)</span>', v: 'go', cast: function () { const r = vRoll(25); return dead() ? null : { v: 'go', ok: r.ok }; } }];
            if (X.has && X.has('집사의 심부름표')) os.push({ l: '📜 집사의 심부름표를 들고 사진사에게 다가간다. <span style="font-size:10px;color:#d4af37;">(25 이상 · +3)</span>', v: 'go', cast: function () { if (!X.spend('집사의 심부름표')) return null; const r = vRoll(25, 3); return dead() ? null : { v: 'go', ok: r.ok }; } });
            return os;
        },
        mine: function (v) { return { smile: '「웃는다」', no: '「웃지 않는다」', go: '「사진사에게 다가간다」' }[val(v)] + (v && v.ok != null ? (v.ok ? ' — 성공' : ' — 실패') : ''); },
        resolve: function (m) {
            const sc = scn('단체 사진');
            if (Object.keys(m).some(function (c) { return val(m[c]) === 'go' && m[c].ok; })) return { end: ['사진사', 'w', { lead: tagged(sc, '성공').replace(/\s*$/, '') }] };
            if (Object.keys(m).every(function (c) { return val(m[c]) === 'smile'; })) return { end: ['단체 초상화', 'd', { lead: sect(sc, '전원이 웃었다면') }] };
            if (k >= 4) return { end: ['흐려진 얼굴', 'f', { lead: sect(sc, '한 명이라도 웃지 않았다면') }] };
            const fail = Object.keys(m).some(function (c) { return val(m[c]) === 'go'; }) ? tagged(sc, '실패') + '<br><br>' : '';
            return { html: fail + sect(sc, '한 명이라도 웃지 않았다면') };
        }
    };
}

// ==========================================
// T5 명찰 바꿔 달기
// ==========================================
const T5_P = ['붉은 스카프를 두른 여자', '안경을 쓴 소년', '낡은 정장의 노인', '하얀 장갑을 낀 남자'];
function t5frag(a, idx) {
    const sc = scn('기억 조각');
    const ps = allP(sc);
    const i0 = ps.findIndex(function (q) { return /저택의 손님의 조각/.test(q); });
    const i1 = ps.findIndex(function (q) { return /다른 참석자의 조각/.test(q); });
    // 조각은 선택지 줄로 들어 있다
    const pg = sc.p;
    const lists = [];
    pg.forEach(function (p) { if (p.o && p.o.length) lists.push(p.o.map(function (o) { return o.l; })); });
    const guest = lists[0] || [], other = lists[1] || [];
    const isG = a === L.plan().guest;
    return (isG ? guest : other)[idx % 3] || '';
}
function t5swappers(a) {
    const out = [];
    [0, 1].forEach(function (n) { const m = L.votes('t5m' + n); Object.keys(m).forEach(function (c) { if (val(m[c]) === 'a' + a) out.push(c); }); });
    return out.sort();
}
function t5meet(n) {
    return {
        k: 'vtv', id: 't5m' + n, title: '명찰을 단 참석자',
        skip: function () { return !!L.st().end; },
        text: function () {
            const lk = me();
            return (n === 0 ? body(scn('명찰을 단 참석자').p[0].x) : '2차 체험관에서도 명찰을 단 참석자 둘이 당신에게 다가옵니다.') + '<div class="wd-sys">이번에 마주친 사람 — ' + T5_P[n * 2] + ' · ' + T5_P[n * 2 + 1] + (lk.tag != null ? '<br>당신은 지금 ' + T5_P[lk.tag] + '의 명찰을 달고 있습니다.' : '') + '</div>';
        },
        opts: function () {
            const lk = me();
            const os = [];
            if (lk.tag == null) [n * 2, n * 2 + 1].forEach(function (a) { os.push({ l: T5_P[a] + josa(T5_P[a], '과', '와') + ' 명찰을 바꿔 단다.', v: 'a' + a }); });
            os.push({ l: '지나간다.', v: 'pass' });
            return os;
        },
        mine: function (v) { v = val(v); return v === 'pass' ? '「지나간다」' : T5_P[+v.slice(1)] + josa(T5_P[+v.slice(1)], '과', '와') + ' 명찰을 바꿔 달았습니다.'; },
        resolve: function (m) {
            const lk = me();
            const v = val(m[ME()]);
            if (v === 'pass') return { html: '당신은 지나갑니다. 낯선 사람의 미소가 등 뒤에 오래 남습니다.' };
            const a = +v.slice(1);
            once('t5tag' + n, function () { lk.tag = a; lk.seen = (lk.seen || []).concat([a]); return ''; });
            const sw = t5swappers(a);
            const idx = sw.indexOf(ME());
            const clear = sw.length >= 2;
            const frags = sw.map(function (c, k) { return t5frag(a, k); });
            let html = paras(scn('기억 조각').p[0].x)[0] + '<br><br>' + '<div class="wd-note" style="border-color:#4a1f2a;">' + esc(frags[idx]) + '</div>';
            if (clear) {
                html += '<div class="wd-sys">일행이 본 조각을 맞춥니다 — ' + frags.map(esc).join(' / ') + '<br>선명해집니다: ' + T5_P[a] + josa(T5_P[a], '은', '는') + ' ' + (a === L.plan().guest ? '<b>저택의 손님입니다.</b>' : '저택의 손님이 아닙니다.') + '</div>';
                L.tx('x/t5clear/' + a, function (cur) { return cur || 1; });
            } else html += '<div class="wd-sys">조각 하나만으로는 흐릿합니다. 두 조각 이상을 맞춰야 선명해집니다.</div>';
            return { html: html + '<div class="wd-sys">당신은 지금 ' + T5_P[a] + '의 명찰을 달고 있습니다. 판이 멈출 때 제 명찰을 달고 있지 않으면 탈락입니다.</div>' };
        }
    };
}
L.K.t5back = function (step) {
    const s = st(), lk = me();
    if (dead()) return;
    if (lk.tag == null || s.kept) {
        L.draw('로비', '로비로 돌아옵니다.' + (s.kept ? ' 당신은 낯선 명찰을 그대로 단 채 서 있습니다.' : '') + clearBox(), X.btn('계속 간다.', 'WONDER.lkNext()'));
        return;
    }
    L.draw('로비', '로비 합류입니다. 당신의 명찰을 달고 간 ' + T5_P[lk.tag] + josa(T5_P[lk.tag], '이', '가') + ' 사람들 사이에서 나타납니다. 당신의 이름이 그 사람의 가슴에서 반짝입니다.' + clearBox(),
        X.btn('제 명찰을 되찾는다.', 'WONDER.VAMP.t5back(1)') + X.btn('그대로 둔다.' + (step.n === 2 ? ' <span style="font-size:10px;color:#888;">(손님 보관함에 넣으려면)</span>' : ''), 'WONDER.VAMP.t5back(0)'));
};
function clearBox() {
    const c = L.x().t5clear || {};
    const ks = Object.keys(c);
    return ks.length ? '<div class="wd-sys">일행이 맞춘 조각 — ' + ks.map(function (a) { return T5_P[a] + ': ' + (+a === L.plan().guest ? '저택의 손님' : '아님'); }).join(' · ') + '</div>' : '';
}
V.t5back = function (k) {
    const s = st(), lk = me();
    if (k) { lk.tag = null; s.kept = 0; X.save(); L.next(); return; }
    s.kept = 1; X.save(); X.view();
};
function t5tags() { const out = {}; memList().forEach(function (c) { const t = (L.x().t5w || {})[c]; if (t != null && t !== -1) out[c] = t; }); return out; }
L.K.t5mark = function () {
    const lk = me();
    once('t5mark', function () { L.pub('x/t5w/' + ME(), lk.tag == null ? -1 : lk.tag); return ''; });
    L.draw('로비 2차', '「끝나지 않는 연회」의 문이 열리기 직전, 집사가 일행 앞으로 다가옵니다.', X.btn('계속 간다.', 'WONDER.lkNext()'));
};
const T5_FINAL = {
    k: 'vtv', id: 't5f', title: '저택의 손님',
    skip: function () { return !!L.st().end; },
    text: function () { return body(scn('저택의 손님').p[0].x) + clearBox(); },
    opts: function () {
        const os = [];
        const lk = me();
        [0, 1, 2, 3].forEach(function (a) {
            const item = lk.tag === a;
            os.push({ l: '저택으로 모셔 간다 — ' + T5_P[a] + ' <span style="font-size:10px;color:#888;">(' + (item ? '그의 명찰 제출 17 이상' : '맨 주사위 25 이상') + ')</span>', v: 'r' + a, cast: function () { const r = vRoll(item ? 17 : 25); return dead() ? null : { v: 'r' + a, ok: r.ok }; } });
        });
        const tags = t5tags();
        Object.keys(tags).forEach(function (c) { const a = tags[c]; if (!os.some(function (o) { return o.v === 'b' + a; })) os.push({ l: '손님 보관함에 넣는다 — ' + T5_P[a] + '의 명찰', v: 'b' + a }); });
        os.push({ l: '아무것도 하지 않는다.', v: 'none' });
        return os;
    },
    mine: function (v) { v = val(v); return v === 'none' ? '「아무것도 하지 않는다」' : (v.charAt(0) === 'r' ? '모셔 간다 — ' : '보관함 — ') + T5_P[+v.slice(1)]; },
    resolve: function (m) {
        const p = L.plan();
        const sc = scn('저택의 손님');
        const t = L.tally(m);
        const w = t.win || 'none';
        const tags = t5tags();
        let restored = null;
        let res = null;
        if (w.charAt(0) === 'b') {
            const a = +w.slice(1);
            if (a === p.guest) { restored = Object.keys(tags).filter(function (c) { return tags[c] === a; }); res = ['참석 확정', 'd', { lead: sect(sc, '손님 보관함에 넣으면') }]; }
            else res = [GEN_FAIL, 'f', { lead: '보관함의 뚜껑이 닫히지 않습니다. 집사가 조용히 명찰을 꺼내 돌려줍니다.' }];
        } else if (w.charAt(0) === 'r') {
            const a = +w.slice(1);
            const who = Object.keys(m).filter(function (c) { return val(m[c]) === w; }).sort()[0];
            if (!m[who].ok) res = [GEN_FAIL, 'f', { lead: T5_P[a] + josa(T5_P[a], '은', '는') + ' 명찰을 손으로 감싼 채 물러섭니다.' }];
            else if (a === p.guest) res = ['돌아온 손님', 'w'];
            else res = ['엉뚱한 손님', 'f'];
        } else res = [GEN_FAIL, 'f'];
        // 제 명찰을 달지 않은 사람 — 대리 참석
        const bad = Object.keys(tags).filter(function (c) { return (restored || []).indexOf(c) < 0; });
        if (bad.length) return { end: ['대리 참석', 'f', { named: bad }] };
        return { end: res };
    }
};

// ==========================================
// T6 마지막 곡
// ==========================================
function t6state(upto) {
    let enc = 0, split = 0, done = null;
    for (let r = 0; r < upto; r++) {
        const m = L.votes('t6r' + r);
        const vs = Object.keys(m).map(function (c) { return val(m[c]); });
        if (!vs.length) break;
        const e = vs.filter(function (v) { return v === 'enc'; }).length;
        if (e === vs.length) { enc++; split = 0; if (enc >= 5) { done = 'enc'; break; } }
        else if ((vs.length - e) * 2 > vs.length) { done = 'cancel'; break; }
        else { split++; if (split >= 3) { done = 'split'; break; } }
    }
    return { enc: enc, split: split, done: done };
}
function t6round(r) {
    return {
        k: 'vtv', id: 't6r' + r, title: '마지막 곡',
        skip: function () { return !!L.st().end; },
        text: function () {
            const s6 = t6state(r);
            return (r === 0 ? body(scn('마지막 곡').p[0].x) : '같은 곡이 처음부터 다시 시작됩니다. 곡이 끝을 향해 가고, 마지막 화음이 길게 울리고 — 멎습니다. 연회장의 모든 얼굴이 당신의 일행을 향합니다.')
                + '<div class="wd-sys">앙코르 ' + s6.enc + ' / 5 · 연속 갈림 ' + s6.split + ' / 3 · 서로 모르게 고릅니다</div>';
        },
        opts: function () { return [{ l: '「앙코르!」 <span style="font-size:10px;color:#888;">(감화도 +16)</span>', v: 'enc', cast: function (v) { gam(16); return dead() ? null : v; } }, { l: '침묵한다.', v: 'mute' }]; },
        mine: function (v) { return val(v) === 'enc' ? '「앙코르!」' : '「침묵」'; },
        resolve: function () {
            const sc = scn('마지막 곡');
            const s6 = t6state(r + 1);
            if (s6.done === 'enc') return { end: ['영원한 곡', 'd', { lead: sect(sc, '다섯 번째 앙코르') }] };
            if (s6.done === 'cancel') return { end: ['공연 취소', 'w', { lead: sect(sc, '공연 취소') }] };
            if (s6.done === 'split') return { end: ['세 번의 갈림', 'f', { lead: sect(sc, '갈림') }] };
            if (r >= 14) return { end: [GEN_FAIL, 'f', { lead: '곡은 여전히 끝나지 않습니다. 판은 여기서 멈춥니다.' }] };
            const prev = t6state(r);
            return { html: s6.enc > prev.enc ? sect(sc, '앙코르') : sect(sc, '갈림') };
        }
    };
}

// ==========================================
// T7 아침 해
// ==========================================
const T7_C = ['22:00', '23:00', '23:59', '03:00', '05:00', '07:00 · 아침 해'];
function t7grp(c) { const p = L.plan(); return p.groups[0].indexOf(c) >= 0 ? 'clock' : 'curtain'; }
function t7pos(upto) {
    let pos = 0, at2 = 0, res = null;
    for (let a = 0; a < upto; a++) {
        const m = L.votes('t7a' + a);
        if (!Object.keys(m).length) break;
        let d = 1;
        Object.keys(m).forEach(function (c) { const v = val(m[c]); if (v === 'back') d--; if (v === 'open') d++; });
        pos = Math.max(0, Math.min(5, pos + d));
        if (pos === 5) { res = 'sun'; break; }
        if (pos === 2) { at2++; if (at2 >= 2) { res = 'stop'; break; } } else at2 = 0;
    }
    return { pos: pos, res: res };
}
L.K.t7hall = function () {
    const g = t7grp(ME());
    const sc = scn('아침을 기다리는 대강당');
    L.draw('대강당', body(sc.p[0].x) + '<div class="wd-sys">당신의 조 — ' + (g === 'clock' ? '시계 조' : '커튼 조') + '</div>',
        X.btn(g === 'clock' ? '시계 조로 무대에 오른다.' : '커튼 조로 객석 양옆에 선다.', 'WONDER.lkNext()'));
};
function t7act(a) {
    return {
        k: 'vtv', id: 't7a' + a, title: '한 막',
        skip: function () { return !!L.st().end; },
        text: function () {
            const s7 = t7pos(a);
            const sc = scn('한 막');
            const g = t7grp(ME());
            return '“현재 시각은 ' + T7_C[s7.pos].split(' ')[0] + '! 아침 해가 점점 가까워집니다!”<br><br>' + sect(sc, g === 'clock' ? '시계 조' : '커튼 조') + '<div class="wd-sys">' + (a + 1) + ' / 8막 · 막마다 시계는 저절로 한 칸 나아갑니다 · 서로 모르게 고릅니다</div>';
        },
        opts: function () {
            return t7grp(ME()) === 'clock'
                ? [{ l: '바늘을 되돌린다. <span style="font-size:10px;color:#888;">(한 칸 뒤로 · 감화도 +16)</span>', v: 'back', cast: function (v) { gam(16); return dead() ? null : v; } }, { l: '둔다.', v: 'stay' }]
                : [{ l: '커튼을 연다. <span style="font-size:10px;color:#888;">(한 칸 더 앞으로)</span>', v: 'open' }, { l: '닫아 둔다.', v: 'shut' }];
        },
        mine: function (v) { return { back: '「바늘을 되돌린다」', stay: '「둔다」', open: '「커튼을 연다」', shut: '「닫아 둔다」' }[val(v)]; },
        resolve: function () {
            const sc = scn('한 막');
            const s7 = t7pos(a + 1);
            if (s7.res === 'stop') return { end: ['오지 않는 아침', 'w', { lead: sect(sc, '「23:59」에서 두 막') }] };
            if (s7.res === 'sun') return { end: ['아침 해', 'd', { lead: sect(sc, '「07:00 · 아침 해」') }] };
            if (a >= 7) return { end: ['멈추지도 가지도 않는 시계', 'f'] };
            return { html: '막이 내립니다. 시계는 「' + T7_C[s7.pos] + '」을 가리킵니다.' };
        }
    };
}

// ==========================================
// T8 가장 귀한 손님
// ==========================================
const T8_PICK = {
    k: 'vtv', id: 't8p', title: '주인공 정하기',
    skip: function () { return !!L.st().end; },
    text: function () { return body(scn('주인공 정하기').p[0].x); },
    opts: function () { return memList().map(function (c) { return { l: '한 사람을 정한다 — ' + esc(nm(c)) + (c === ME() ? ' <span style="font-size:10px;color:#888;">(나)</span>' : ''), v: c }; }).concat([{ l: '다 같이 오른다.', v: 'all' }]); },
    mine: function (v) { return val(v) === 'all' ? '「다 같이」' : esc(nm(val(v))) + '에게 초대장을'; },
    resolve: function (m) {
        const top = topPick(m, 't8p');
        L.tx('x/t8', function (cur) { return cur || top.win; });
        return { html: top.win === 'all' ? '일행은 다 같이 오르기로 합니다. 집사가 초대장을 당신들 모두의 손에 번갈아 쥐여 줍니다.' : '초대장이 ' + esc(nm(top.win)) + '의 손에 건네집니다.' + (top.tie ? '<div class="wd-sys">동률 — 운명 뽑기</div>' : '') };
    }
};
const T8_CROWD = {
    k: 'vtv', id: 't8c', title: '귀빈 식탁',
    skip: function () { return !!L.st().end || L.x().t8 === 'all'; },
    who: function () { const h = L.x().t8; return memList().filter(function (c) { return c !== h; }); },
    text: function () {
        const h = L.x().t8;
        const sc = scn('귀빈 식탁');
        const x = sect(sc, '한 사람이 오르면');
        return x + (h === ME() ? '<div class="wd-sys">객석의 일행이 고르는 동안 당신은 식탁에 앉아 있습니다.</div>' : '');
    },
    opts: function () {
        return [{ l: '박수를 친다. <span style="font-size:10px;color:#888;">(판정 +3 · 감화도 +8)</span>', v: 'clap', cast: function (v) { gam(8); return dead() ? null : v; } },
            { l: '야유한다. <span style="font-size:10px;color:#888;">(판정 −3 · 감화도 −8)</span>', v: 'boo', cast: function (v) { gam(-8); return v; } },
            { l: '침묵한다.', v: 'mute' }];
    },
    mine: function (v) { return { clap: '「박수」', boo: '「야유」', mute: '「침묵」' }[val(v)]; },
    resolve: function () { return { html: '객석이 숨을 죽입니다. 주인님이 빈 잔을 주인공 쪽으로 내밉니다.' }; }
};
L.K.t8table = function () {
    if (dead()) return;
    const h = L.x().t8;
    const sc = scn('귀빈 식탁');
    if (h === 'all') {
        const g = once('t8all', function () { return gam(30); });
        if (dead()) return;
        L.end('다 같이', 'd', { lead: sect(sc, '다 같이 오르면') + g });
        return;
    }
    const m = L.votes('t8c');
    let mod = 0;
    Object.keys(m).forEach(function (c) { const v = val(m[c]); if (v === 'clap') mod += 3; if (v === 'boo') mod -= 3; });
    const r = (L.x().t8r);
    if (h !== ME()) {
        L.draw('귀빈 식탁', '객석의 응원 ' + (mod >= 0 ? '+' : '') + mod + '.', X.waitHtml('_none', esc(nm(h)) + josa(nm(h), '이', '가') + ' 손을 내밉니다…'));
        return;
    }
    L.draw('귀빈 식탁', '주인님이 빈 잔을 당신 쪽으로 내밉니다.<div class="wd-sys">객석의 응원 ' + (mod >= 0 ? '+' : '') + mod + '</div>', riteBtns('WONDER.VAMP.t8rite'));
};
V.t8rite = function (band) {
    if (L.x().t8r) return;
    const m = L.votes('t8c');
    let mod = 0;
    Object.keys(m).forEach(function (c) { const v = val(m[c]); if (v === 'clap') mod += 3; if (v === 'boo') mod -= 3; });
    const r = rite(mod, band);
    const sc = scn('귀빈 식탁');
    L.tx('x/t8r', function (cur) { return cur || { ok: r.ok }; });
    if (r.ok) return L.end('건배', 'w', { lead: rollH(r) + inl(sc, '「충분한 성의」') });
    vDie('지나친 성의', '지나친 성의', rollH(r) + inl(sc, '「지나친 성의」') + '<br><br>');
};

// ==========================================
// 사람마다 갈리는 결말 — T5 대리 참석 (제 명찰을 달지 않은 사람)
// ==========================================
function t5mine(end, e) {
    if (end.t !== '대리 참석' || (end.named || []).indexOf(ME()) < 0) return null;
    return { die: '대리 참석' };
}

// ==========================================
// 미션 표
// ==========================================
function M(base, o) { return Object.assign({ key: 'v_new', base: base, vamp: true, timer: false, enterIdx: 17, returnIdx: 20 }, o); }
function rooms(p, rnd) { }
L.M.vampire = {
    S1: M(22, {
        mid: 'S1',
        steps: COMMON.concat([{ k: 's1tag' }, { k: 's1sec', n: 0 }, { k: 's1sec', n: 1 }, { k: 's1sec', n: 2 }, { k: 's1out' }])
    }),
    S2: M(28, {
        mid: 'S2',
        steps: COMMON.concat([{ k: 'vroom', b: 'sweet', n: 0 }, { k: 'vlobby', n: 1 }, { k: 'vroom', b: 'beauty', n: 0 }, { k: 's2stage' }])
    }),
    S3: M(33, {
        mid: 'S3',
        steps: COMMON.concat([{ k: 's3exch' }, { k: 's3cup' }, { k: 's3lobby', n: 1 }, { k: 'vroom', b: 'beauty', n: 1, pre: function () { return s3charge(F().lk.i); } }, { k: 's3lobby', n: 2 }])
    }),
    S4: M(38, {
        mid: 'S4', exitBtn: true,
        plan: function (p, rnd) { p.bell = Math.floor(rnd() * 3); },
        steps: COMMON.concat([
            { k: 'vroom', b: 'sweet', n: 0, after: hold }, { k: 's4bell', n: 0 },
            { k: 'vroom', b: 'beauty', n: 1, after: hold }, { k: 's4bell', n: 1 },
            { k: 'vroom', b: 'feast', n: 0, after: hold }, { k: 's4bell', n: 2 },
            { k: 'vroom', b: 'feast', n: 1 }, { k: 'v_s4end' }])
    }),
    T1: M(44, {
        mid: 'T1',
        steps: COMMON.concat([t1vote(0), { k: 't1act', n: 0 }, { k: 'vroom', b: 'sweet', n: 0 }, t1vote(1), { k: 't1act', n: 1 }, { k: 'vroom', b: 'beauty', n: 0 }, t1vote(2), { k: 't1act', n: 2 }])
    }),
    T2: M(49, {
        mid: 'T2',
        plan: function (p, rnd) { const s = X.shuffle(p.mem, rnd); p.groups = [[], []]; s.forEach(function (c, k) { p.groups[k % 2].push(c); }); },
        steps: COMMON.concat([t2booth(0), t2vote(0), t2booth(1), t2vote(1)])
    }),
    T3: M(54, {
        mid: 'T3',
        plan: function (p, rnd) { p.table = 1 + Math.floor(rnd() * 5); },
        steps: COMMON.concat([t3round(0), t3round(1), t3round(2), t3round(3)])
    }),
    T4: M(59, {
        mid: 'T4',
        steps: COMMON.concat([{ k: 'vroom', b: 'sweet', n: 0 }, { k: 'vlobby', n: 1 }, t4shot(0), t4shot(1), t4shot(2), t4shot(3), t4shot(4)])
    }),
    T5: M(64, {
        mid: 'T5', guestBox: true,
        plan: function (p, rnd) { p.guest = Math.floor(rnd() * 4); },
        steps: COMMON.concat([t5meet(0), { k: 't5back', n: 1 }, t5meet(1), { k: 't5back', n: 2 }, { k: 't5mark' }, T5_FINAL]),
        endMine: t5mine
    }),
    T6: M(71, {
        mid: 'T6',
        steps: COMMON.concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(t6round))
    }),
    T7: M(76, {
        mid: 'T7',
        plan: function (p, rnd) { const s = X.shuffle(p.mem, rnd); p.groups = [[], []]; s.forEach(function (c, k) { p.groups[k % 2].push(c); }); },
        steps: COMMON.concat([{ k: 't7hall' }, 0, 1, 2, 3, 4, 5, 6, 7].map(function (a) { return typeof a === 'number' ? t7act(a) : a; }))
    }),
    T8: M(82, {
        mid: 'T8',
        steps: COMMON.concat([{ k: 'vroom', b: 'sweet', n: 0 }, { k: 'vroom', b: 'beauty', n: 0 }, T8_PICK, { k: 'vroom', b: 'feast', n: 0 }, T8_CROWD, { k: 't8table' }])
    })
};

console.log('[이상한 나라] 피날레 연계판 12종 연결');
})();
