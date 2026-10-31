// ==========================================
// ★ 「이상한 나라의 ■■■」 — 뱀파이어 (몽환)
// bundles.json 마지막 묶음 — wonder-link-angel.js 다음 (wonder-text-vampire.js 뒤)
// ==========================================
//
//   원고: 사용자 원고 01~11 (v_intro · v_vote · v_end) + 새 장면 12~19 (v_new, 「뱀파이어의 장 · 몽환 — 원고」 문서)
//   01 문 너머의 저택 → 03 달빛 아래의 초대 → 04 가장 공평한 환대
//   → 희생 투표 세 번 (05 · 06 · 07 — 익명, 자기 자신도 가능, 동률은 무작위, 혼자면 자동 선정)
//      선정자만 「피를 바치는 의식」 d30 16+ (장비 없음 — 장미 반창고 +5) — 15 이하 「지나친 성의」(죽음)
//   → 11 가장 귀한 손님 → 12 · 14 · 16 · 18 → 19 부탁(미션) → 커튼 너머의 문 → 피날레 연계판 (wonder-link-vampire.js)
//     (2026-10-31 줄이기 — 13 · 15 · 17 은 흐름에서 뺐다. 아래 「줄이기」 묶음 참고)
//
//   조건 문단(원고의 *(…)* 메모)은 여기서 고친다:
//     12  「선정되어 살아남은 탐사자가 있을 때」 · 「「지나친 성의」로 죽은 탐사자가 있을 때」 — 메모부터 다음 메모까지가 한 덩어리
//     17  앙코르는 세 번까지 — 세 번째에 집사가 피아노 뚜껑에 손을 얹는다
//     19  미션 안내 메모 — 지운다

(function wonderVampire() {
'use strict';
const X = window.WONDER;
if (!X || !X.VIEW) return;
const CH = 'vampire';

function F() { return X.F(); }
function S() { return X.S(); }
function ME() { return currentUser.code; }
function rk() { const m = S().meta || {}; return (m.rid || '') + '_' + (m.idx || 0); }
function clone(key, i) { const s = X.scene(key, i); return s ? JSON.parse(JSON.stringify(s)) : null; }
function paras(x) { return String(x || '').split('<br><br>'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function josa(w, a, b) { const c = String(w).charCodeAt(String(w).length - 1); return (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28) ? a : b; }
const V = X.VAMP = X.VAMP || {};

// 메모 덩어리 — *(조건)* 문단부터 다음 *(조건)* 문단 앞까지가 한 덩어리. 메모 없는 앞부분은 늘 보인다.
function blocks(x, show) {
    let on = true;
    const out = [];
    paras(x).forEach(function (p) {
        const m = p.match(/^<i>\(([^)]*)\)<\/i>\s*/);
        if (m) { on = !!show(m[1]); p = p.slice(m[0].length); }
        if (on && p) out.push(p);
    });
    return out.join('<br><br>');
}
V.blocks = blocks;

// ==========================================
// 고친 장면
// ==========================================
X.FIX.v01 = function () {
    const s = clone('v_intro', 1);
    try {
        const b = s.p[0].o[1].b;
        b[1].x = paras(b[1].x).filter(function (p) { return p.indexOf('(여기서부터 사망 판정)') < 0; }).join('<br><br>');
    } catch (e) { }
    return s;
};
// 01 — 「역시 문을 넘는다」는 위쪽 「문을 넘는다」
X.CHOOSE.v_intro = function (w, pg, i, op) {
    if (/역시 문을 넘는다/.test(op.l)) { w.loc = [0]; X.save(); X.pick(0); return true; }
    return false;
};
function vs() { return ((S().vs || {})[rk()]) || {}; }
X.FIX.v12 = function () {
    const s = clone('v_new', 3);
    const st = vs();
    const live = Object.keys(st).some(function (c) { return st[c] === 'live'; });
    const dead = Object.keys(st).some(function (c) { return st[c] === 'dead'; });
    const x = blocks(s.p[1].x, function (n) { return (/살아남은/.test(n) && live) || (/지나친 성의/.test(n) && dead); });
    if (x) s.p[1].x = x; else s.p = [s.p[0]];
    return s;
};
X.FIX.v17 = function () {
    const s = clone('v_new', 9);
    const n = (F() && F().enc) || 0;
    if (n > 0) {
        s.p[0].x = '주인님의 얼굴이 환하게 밝아집니다. 대답도 하지 않고 처음부터 다시 치기 시작합니다. 같은 곡입니다. 끝나자 또 당신을 돌아봅니다.'
            + '<div class="wd-sys">앙코르 ' + n + ' / 3</div>';
    }
    return s;
};
X.CHOOSE.v_new = function (w, pg, i, op) {
    if (w.fix === 'v17' && /앙코르/.test(op.l) && ((F().enc || 0) < 2)) { F().enc = (F().enc || 0) + 1; X.save(); X.view(); return true; }
    return false;
};
X.FIX.v19 = function () {
    const s = clone('v_new', 11);
    s.p[0].x = paras(s.p[0].x).filter(function (p) { return !/^<i>미션은/.test(p); }).join('<br><br>');
    return s;
};
X.FIX.v_mis = function () {
    const id = (F() && F().mis) || 'S1';
    const team = id.charAt(0) === 'T';
    const s = clone('v_new', team ? 13 : 12);
    const pg = s.p[parseInt(id.slice(1), 10) - 1];
    const ps = paras(pg.x);
    ps.shift();
    const lab = (pg.o && pg.o[0] && pg.o[0].l) || '';
    const m = lab.match(/소지품:\s*([^)<]+)/);
    if (m) ps.push('<div class="wd-sys">소지품 — ' + m[1].trim() + '</div>');
    pg.x = ps.join('<br><br>');
    return { h: '부탁 — 「' + X.misName(CH, id) + '」', p: [pg] };
};

// ★ 줄이기 (2026-10-31 사용자 — 챕터마다 절반쯤 · 연계판은 그대로) — 문단을 통째로 뺀다 (wonder-core.js X.cut)
//   장면은 흐름(SEQ)에서 13 붉은 차 · 15 초상화 · 17 한 곡만 더 를 뺐다 (FIX v17 · CHOOSE 앙코르는 이제 쓰이지 않는다).
//   남긴 것: 투표 규칙(익명 · 자기 이름 · 최다 득표 · 동률 추첨 · 여러 번 선정 · 죽을 수 있음) · 흰 장갑 초상화 · 초대장 · 커튼 · 빈 잔(19 「잔을 내려놓고」)
X.cut('v_intro', 1, ['문틈으로 서늘한 밤공기가', '마치 오래전부터 당신이 찾아오기를', '그곳에 누가 서 있는지는',
    '참으로 간단한 일이었습니다', '홀을 따라 걸어 봅니다', '홀은 여전히 아름답습니다', '당신이 잠시 눈을 감았다 떠도']);
X.cut('v_intro', 2, ['발끝에 닿는 것은 부드러운 잔디', '뒤를 돌아보면 조금 전까지', '달빛 아래의 저택은 무척',
    '“아아, 정확한 시간이로군요', '바닥에는 검은색과 흰색 대리석', '어디선가 흘러나오는 피아노 선율',
    '집사는 부드럽게 웃으며 홀 안쪽을', '세 개의 문이라니', '“누구에게나 똑같은 기회가', '집사는 다시 한번 허리를 숙입니다',
    '“아, 저 그림들이 마음에', '집사가 뒤돌아보며 묻습니다', '그는 흐뭇한 표정으로 그림들을', '그렇게 말한 집사는 다시 걸음을',
    '집사는 정중하게 문 옆에 섭니다', '“도착했습니다.”', '그는 장갑 낀 손으로 문에 새겨진']);
X.cut('v_intro', 3, ['집사는 이제야 중요한 사실이', '“실례했습니다. 손님을 맞이하는', '그는 문 앞에 선 당신을 향해', '“너무 놀라실 필요는 없습니다. 저희 주인님께서도',
    '집사는 종이 한 장을 집어', '집사는 투표용지를 상자에 다시', '문에는 여전히 손잡이가 없습니다', '「한 방울의 정성이 문을 엽니다.」',
    '“아, 물론 가장 궁금해하실', '집사는 다시 한번 손뼉을 칩니다', '그는 말끝을 흐리더니', '“운이 나쁘시다면 조금 더', '얼마나 많은 피를 내어 주어야', '“글쎄요. 사람에게 피가', '그는 마치 말썽꾸러기 아이의',
    '집사는 상자를 당신 앞으로 내밉니다', '“그렇다고 너무 겁먹으실 필요는',
    '그는 복도 저편을 바라봅니다', '“주인님께서는 저 문 너머에서 기다리고', '세 번. 당신은 그 숫자를', '집사는 당신의 생각을 아는지', '그는 상자를 문 앞의 작은 탁자', '“자, 설명은 이 정도면', '“부디 신중하게 선택해 주십시오', '집사는 한 걸음 물러섭니다']);
X.cut('v_vote', 1, ['투표용지 위로 붉은 장미 꽃잎', '“아아, 실례했습니다. 손님께서 이름을', '그는 두 손을 가지런히 모은 채', '집사가 다정하게 말합니다', '“저희는 손님의 선택을 존중']);
X.cut('v_vote', 2, ['집사가 기쁜 목소리로 말합니다', '“축하드립니다. 역시 훌륭한', '그는 투표함의 뚜껑을 열어', '당신은 주변을 둘러봅니다', '물론 당신 역시 누군가의 이름을',
    '집사가 만년필을 내밀며', '집사는 다시 한번 정중하게 허리를']);
X.cut('v_vote', 3, ['집사는 감격한 듯 두 손을', '“참으로 기쁜 일입니다', '그는 마지막 문을 향해 몸을', '첫 번째와 두 번째 투표함을 떠올려', '그는 새 투표용지를 꺼내', '“하지만 모든 즐거운 일에는']);
X.cut('v_vote', 4, ['“모두 선택을 마치셨군요', '그는 상자를 가볍게 흔듭니다']);
X.cut('v_vote', 5, ['집사는 밝은 목소리로 발표합니다', '그는 잠시 말을 멈추고 손뼉을', '“다른 손님들께서 손님을 선택하셨군요', '그는 문 앞으로 한 걸음 물러섭니다',
    '집사가 투표용지를 몇 번이나', '그는 품속에서 작은 은화', '그가 종이를 펼칩니다', '집사는 선정된 사람을 향해 정중하게',
    '그는 잠시 안타까운 표정을', '“하지만 걱정하지 마십시오. 손님이 한 분뿐이라고', '“이번 투표는 참으로 간단하겠군요', '집사는 종이를 곱게 접어', '“자, 결과를 발표하겠습니다', '그는 세상에서 가장 중요한 발표라도']);
X.cut('v_vote', 6, ['가까이에서 바라본 문은', '“너무 긴장하지 마십시오.”',
    '잠시 후, 문에서 작은 소리가', '딸깍.', '당신은 얼른 손을 거둡니다', '집사가 기쁜 듯 박수를 칩니다', '손수건은 부드럽고 깨끗합니다', '“정말 다행입니다. 이 정도라면', '그리고 문 너머에서 묵직한 자물쇠가',
    '손끝이 저려 오고', '집사가 걱정스러운 얼굴로', '“움직이시면 오히려']);
X.cut('v_vote', 7, ['참으로 다행스러운 일입니다. 적어도', '집사는 선정된 사람에게 정중히 길을', '조금 전까지 모두가 같은 자리에', '물론 당신의 표가 결과를 바꾸었는지', '그렇다고 해서 이미 끝난 투표를', '그의 목소리는 조금도 흔들리지']);
X.cut('v_end', 1, ['바닥을 덮은 융단은', '집사가 마지막 문을 지나온', '그는 빈 투표함을 품에',
    '복도 양옆에는 커다란 거울들이', '“아, 저희 주인님께서는 손님을 기다리는', '집사가 문득 입을 엽니다', '“기다림이 길수록 만남이', '그의 말이 끝나기 무섭게',
    '참으로 세심한 환대입니다', '그런데 어째서인지, 당신은', '문마다 똑같은 구멍이 있었고', '당신이 그런 생각을 하는 사이', '집사는 품에서 회중시계를 꺼내', '“마침 좋은 때로군요', '그는 투표함을 문 옆의',
    '“마지막으로 한 가지만 부탁드리겠습니다', '그는 잠시 당신을 살펴보더니', '“그리고 혹시 주인님께서 무언가를', '무엇을 나누어 준다는 뜻일까요', '집사는 입술에 손가락을', '그가 정중히 고개를 숙입니다']);
X.cut('v_new', 3, ['목소리는 피아노의 낮은 음처럼']);
X.cut('v_new', 5, ['“다들 선물로 두고 가셨어요', '집사가 조용히 덧붙입니다', '“주인님께서는 매번 이번 손님께서']);
X.cut('v_new', 8, ['그는 마치 아이가 비밀을', '“주인님께서는 그 행사의 귀빈이십니다', '집사가 자랑스럽게 말합니다']);
X.cut('v_new', 10, ['“주인님께서는 하룻밤에 디저트를', '“둘 다 먹으면 어느 쪽이', '새하얀 식탁보 한구석에는', '“저 얼룩만 보면 속상해요', '“아, 말씀드리는 걸 잊을', '집사는 여전히 다정한 얼굴입니다']);

// ==========================================
// 흐름
// ==========================================
// 12 → 14 → 16 → 18 → 19 (13 · 15 · 17 은 줄이기로 뺐다)
const SEQ = [['v_new', 3, 'v12'], ['v_new', 5], ['v_new', 8], ['v_new', 10], ['v_new', 11, 'v19']];
function seqGo(i) {
    const f = F();
    f.vseq = i;
    if (i >= SEQ.length) return X.toMission();
    const st = SEQ[i];
    if (st[2]) X.walk(st[0], st[1], 'vSeq', { fix: st[2] });
    else X.walk(st[0], st[1], 'vSeq');
}
X.THEN.vSeq = function () { seqGo((F().vseq || 0) + 1); };
X.THEN.v03 = function () { X.walk('v_intro', 2, 'v04'); };
X.THEN.v04 = function () { X.walk('v_intro', 3, 'vVote0'); };
X.THEN.vVote0 = function () { X.go({ id: 'vvote', n: 0 }); };
X.THEN.v11 = function () { X.walk('v_end', 1, 'vSeq0'); };
X.THEN.vSeq0 = function () { seqGo(0); };
X.FIX.v14 = function () { const s = clone('v_new', 14); s.h = '커튼 너머의 문'; return s; };
X.THEN.vStairs = function () { X.walk('v_new', 14, 'vLink', { fix: 'v14' }); };
X.THEN.vLink = function () { X.go({ id: 'link' }); };

X.chapters[CH] = {
    stages: [0],
    run: function () {
        const f = F();
        f.enc = 0; f.vseq = 0;
        X.walk('v_intro', 1, 'v03', { fix: 'v01' });
    },
    mission: function () { X.walk('v_new', 'mis', 'vStairs', { fix: 'v_mis' }); },
    link: function (api, mid) { X.L.run(CH, mid); }
};

// ==========================================
// 희생 투표 세 번
// ==========================================
//   함께 보는 곳  vv/{회차_챕터}/{n}/ { v:{사번:대상}, b:{사번:백지}, r:{c, ok, total} }
//                 vs/{회차_챕터}/{사번} = 'live' | 'dead'  (12의 조건 문단)
function vv(n) { return (((S().vv || {})[rk()]) || {})[n] || {}; }
function vpath(n) { return 'vv/' + rk() + '/' + n; }
function voters() { return X.actives(); }
function chosenOf(n) {
    const a = voters();
    const d = vv(n);
    if (d.r && d.r.c) return { c: d.r.c, kind: d.r.kind };
    if (a.length === 1) return { c: a[0], kind: 2 };
    const v = d.v || {};
    if (!a.every(function (c) { return v[c] != null; })) return null;
    const t = {};
    a.forEach(function (c) { t[v[c]] = (t[v[c]] || 0) + 1; });
    Object.keys(d.b || {}).forEach(function (c) { if (t[c] > 0) t[c]--; });     // 백지 투표용지 — 나에게 온 표 하나 무효
    let best = -1, top = [];
    Object.keys(t).forEach(function (c) { if (t[c] > best) { best = t[c]; top = [c]; } else if (t[c] === best) top.push(c); });
    top.sort();
    if (top.length === 1) return { c: top[0], kind: 0 };
    const r = X.srand(rk() + ':vote:' + n)();
    return { c: top[Math.floor(r * top.length)], kind: 1 };
}
function sceneText(n) {
    const s = X.scene('v_vote', 1 + n);
    return X.clip(s.p[0].x);
}
X.LIVE.vvote = 1;
X.VIEW.vvote = function (sc) {
    const f = F();
    const n = sc.n;
    const d = vv(n);
    const a = voters();
    const title = ['붉은 응접실', '초상화 복도', '마지막 초대'][n];
    const gk = 'vv_' + rk() + '_' + n;
    // 다음 문으로 — 모두 모이면
    if (f.wait && f.wait.key === gk) {
        if (X.gateDone(gk)) { f.wait = null; X.save(); return nextVote(n); }
        X.draw(title, (f.vline || ''), X.waitHtml(gk, '다음 문으로 갈 일행을 기다립니다.'));
        return;
    }
    const ch = chosenOf(n);
    // 1. 투표
    if (!ch) {
        const mine = (d.v || {})[ME()];
        if (mine == null) {
            let b = a.map(function (c) { return X.btn(esc(X.nameOf(c)) + (c === ME() ? ' <span style="font-size:10px;color:#888;">(나)</span>' : ''), "WONDER.VAMP.vote(" + n + ",'" + c + "')"); }).join('');
            if (X.has && X.has('백지 투표용지') && !(d.b || {})[ME()]) b += X.btn('📄 백지 투표용지를 함께 넣는다. <span style="font-size:10px;color:#d4af37;">(나에게 온 표 하나 무효)</span>', 'WONDER.VAMP.blank(' + n + ')');
            X.draw(title, sceneText(n) + ((d.b || {})[ME()] ? '<div class="wd-sys">백지 투표용지를 함께 넣었습니다.</div>' : '') + '<div class="wd-sys">익명 투표 · 자기 자신에게도 투표할 수 있습니다</div>', b);
            return;
        }
        X.draw(title, sceneText(n), '<div class="wd-wait">투표했습니다.<br>' + a.map(function (c) { return ((d.v || {})[c] != null ? '✔ ' : '… ') + esc(X.nameOf(c)); }).join(' · ') + '</div>');
        return;
    }
    // 2. 결과
    if (!f.vseen || f.vseen[n] !== 1) {
        const end = X.scene('v_vote', 4);
        const res = X.scene('v_vote', 5).p[ch.kind];
        const nm = '<b>' + esc(X.nameOf(ch.c)) + '</b>';
        const rt = paras(res.x).slice(1).join('<br><br>').replace(/<b>\((최다 득표자|선정된 탐사자) 닉네임\)<\/b>/g, nm);
        X.draw('결과', (a.length > 1 ? X.clip(end.p[0].x) + '<br><br>' : '') + rt, X.btn(ch.c === ME() ? '문 앞으로 나간다.' : '계속 간다.', 'WONDER.VAMP.seen(' + n + ')'));
        return;
    }
    // 3. 선정자 — 피를 바치는 의식
    if (ch.c === ME()) {
        const rite = X.scene('v_vote', 6);
        if (!d.r || d.r.c !== ME() || d.r.ok == null) {
            const x = paras(rite.p[0].x).slice(1).filter(function (p) { return !/주사위 판정/.test(p); }).join('<br><br>');
            let b = X.btn('손을 내민다.', 'WONDER.VAMP.rite(' + n + ',0)');
            if (X.has && X.has('장미 반창고')) b += X.btn('🌹 장미 반창고를 붙이고 손을 내민다. <span style="font-size:10px;color:#d4af37;">(+5)</span>', 'WONDER.VAMP.rite(' + n + ',1)');
            X.draw('피를 바치는 의식', X.clip(x) + '<div class="wd-sys">[주사위 판정 — 1~30 · 16 이상 생존] 장비 보정 없음</div>', b);
            return;
        }
        const ps = paras(rite.p[1].x);
        const k = ps.findIndex(function (p) { return /11-B/.test(p); });
        const okText = ps.slice(1, k).join('<br><br>');
        X.draw('충분한 성의', X.rollHtml(d.r) + okText, X.btn('문을 지난다.', 'WONDER.VAMP.go(' + n + ')'));
        return;
    }
    // 4. 나머지
    const rest = X.scene('v_vote', 7).p[0];
    const x = paras(rest.x).slice(1).join('<br><br>');
    if (!d.r || d.r.ok == null) {
        X.draw('—', X.clip(x), X.waitHtml('_none', esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '이', '가') + ' 문 앞에 서 있습니다…'));
        return;
    }
    const line = d.r.ok
        ? '딸깍. 문이 열립니다. ' + esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '이', '가') + ' 하얀 손수건으로 손목을 감싼 채 돌아옵니다.'
        : '철컥. 문이 열립니다. ' + esc(X.nameOf(ch.c)) + josa(X.nameOf(ch.c), '은', '는') + ' 돌아오지 않습니다. 집사가 그 자리에 대고 정중하게 허리를 숙입니다.';
    f.vline = line;
    X.draw('—', X.clip(x) + '<br><br>' + line, X.btn('계속 간다.', 'WONDER.VAMP.go(' + n + ')'));
};
V.vote = function (n, c) { if ((vv(n).v || {})[ME()] == null) X.pub(vpath(n) + '/v/' + ME(), c); };
V.blank = function (n) {
    if ((vv(n).b || {})[ME()] || !X.spend('백지 투표용지')) return;
    X.pub(vpath(n) + '/b/' + ME(), true);
};
V.seen = function (n) { const f = F(); f.vseen = f.vseen || {}; f.vseen[n] = 1; X.save(); X.view(); };
V.rite = function (n, band) {
    const d = vv(n);
    if (d.r && d.r.ok != null) return;
    const ch = chosenOf(n);
    if (!ch || ch.c !== ME()) return;
    let bonus = 0;
    if (band && X.spend('장미 반창고')) bonus = 5;
    const r = X.roll(bonus);
    try { darkRun.log.push('[뱀파이어] 피를 바치는 의식 ' + (n + 1) + ' — ' + r.total + (r.ok ? ' 충분한 성의' : ' 지나친 성의')); } catch (e) { }
    X.pub(vpath(n) + '/r', { c: ME(), kind: ch.kind, ok: r.ok, raw: r.raw, bonus: r.bonus, total: r.total });
    X.pub('vs/' + rk() + '/' + ME(), r.ok ? 'live' : 'dead');
    if (!r.ok) {
        const ps = paras(X.scene('v_vote', 6).p[1].x);
        const k = ps.findIndex(function (p) { return /11-B/.test(p); });
        const bad = ps.slice(k + 1).join('<br><br>');
        setTimeout(function () { X.die(X.rollHtml(r) + bad); }, 300);
        return;
    }
};
V.go = function (n) {
    const f = F();
    const gk = 'vv_' + rk() + '_' + n;
    if (!X.isTeam()) return nextVote(n);
    X.gatePress(gk);
    f.wait = { key: gk };
    X.save(); X.view();
};
function nextVote(n) {
    const f = F();
    f.wait = null; f.vline = '';
    if (n < 2) return X.go({ id: 'vvote', n: n + 1 });
    X.walk('v_end', 1, 'vSeq0');
}

console.log('[이상한 나라] 뱀파이어 (몽환) 연결');
})();
