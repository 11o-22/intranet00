// ==========================================
// ★ 펫 — 먹이 (사택에서 산다)
// bundles.json 마지막 묶음, pet-hatch.js 보다 뒤
// ==========================================
//
// ■ 무엇에 쓰나
//
//   먹이는 **포만도**를 채운다. 포만도는 따로 적어 두는 값이 아니라
//   굶주림 시계(fedAt)를 백분율로 읽은 것이다 — 사흘이 100 이다.
//   포만도가 0 이 되면 교감이 70 깎인다 (★ 2026-11-04 — 예전에는 죽었다 · pet-data.js).
//
//   탐사를 다녀온 펫은 두 시간 쉰다. 비싼 먹이는 그 쉬는 시간도 줄이고
//   다음 탐사에 더 받아 오게 한다.
//
//     물 만 밥       150 P   포만도 +33        (하루치)
//     마른 멸치      400 P   포만도 +67        (이틀치)
//     마른 사료    1,000 P   포만도 가득 · 쉬는 시간 30분
//     고기 통조림  3,000 P   포만도 가득 · 쉬는 시간 전부 · 다음 탐사 +20%
//     특제 도시락  8,000 P   포만도 가득 · 쉬는 시간 전부 · 다음 탐사 +60%
//
//   앞의 둘은 **포만도만** 채우는 값싼 것이다. 하루치가 150 P 이므로
//   사흘에 450 P — 마른 사료(1,000 P) 보다 싸지만 그만큼 자주 와야 한다.
//   뒤의 셋은 예전과 글자 하나까지 똑같다 (fill 이 1 이면 fedAt 을 지금으로
//   미는 것과 같은 셈이 된다).
//
//   사택 첫 칸에서 산다. 돌봄 물품과 마찬가지로 소지품에 섞이지 않는다
//   (u.petFood).
//
// ■ 콘솔
//   petFoodBag()   가진 먹이
//   petFeed(펫번호, '마른 사료')

(function petFood() {

const BOX = 'pet-food-box';

// fill — 포만도를 얼마나 채우나 (1 이면 가득)
// ★ 이름 (2026-11-08 사용자 「사료들 이름을 자투리 솜 · 새하얀 솜뭉치 · 폭신한 충전솜 · 금실 바느질 세트 · 요정의 비단실로 (이름만) · 잡화점으로」)
//   n  — 적어 두는 열쇠(u.petFood · 옛 이름 그대로 — 가진 것이 그대로 이어진다) · 옛 펫 외형을 켠 사원에게 보이는 이름
//   dn — 봉제인형 쪽 이름 (기본). 보이는 이름은 name(n, u) 로 — 값 · 효과는 같다
//   파는 곳 — 봉제인형: 도깨비 공방 잡화점 · 옛 펫 외형: 사택(전처럼)
const FOOD = [
    { n: '물 만 밥',    dn: '자투리 솜',        p:  150, cut: 0,              up: 0,   fill: 1 / 3, bond: false,
      d: '먹을 것이라기보다 물이다. 그래도 하루는 간다.', dd: '천 끝에서 잘라 낸 솜 부스러기. 그래도 하루는 간다.' },
    { n: '마른 멸치',   dn: '새하얀 솜뭉치',    p:  400, cut: 0,              up: 0,   fill: 2 / 3, bond: false,
      d: '짜다. 먹고 나면 물그릇을 비운다.', dd: '한 줌 쥐면 손이 가려진다. 이틀은 든든하다.' },
    { n: '마른 사료',   dn: '폭신한 충전솜',    p: 1000, cut: 30 * 60 * 1000, up: 0,   fill: 1,
      d: '눅눅하다. 그래도 먹는다.', dd: '꾹 눌러도 금세 부푼다. 속이 꽉 찬다.' },
    { n: '고기 통조림', dn: '금실 바느질 세트', p: 3000, cut: -1,             up: 0.2, fill: 1,
      d: '따는 소리에 어디선가 달려온다.', dd: '풀린 실밥을 금실로 다시 꿰맨다. 눈에 띄게 단단해진다.' },
    { n: '특제 도시락', dn: '요정의 비단실',    p: 8000, cut: -1,             up: 0.6, fill: 1,
      d: '사람 것보다 낫다는 말이 돈다.', dd: '어디서 났는지 아무도 모른다. 꿰맨 자리가 빛난다.' }
];
const FOOD_BY = {};
FOOD.forEach(function (f) { FOOD_BY[f.n] = f; FOOD_BY[f.dn] = f; });     // 두 이름 다 받는다 — 열쇠는 n
function keyOf(name) { const f = FOOD_BY[name]; return f ? f.n : name; }
function oldArt(u) { try { return !!(window.DOLL && window.DOLL.artOld && window.DOLL.artOld(u || u_())); } catch (e) { return false; } }
function nameOf(name, u) { const f = FOOD_BY[name]; if (!f) return name; return oldArt(u) ? f.n : f.dn; }
function descOf(name, u) { const f = FOOD_BY[name]; if (!f) return ''; return oldArt(u) ? f.d : (f.dd || f.d); }

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function P() { return window.PET; }
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
function ui() { try { if (typeof updateUI === 'function') updateUI(); } catch (e) { } }

// ==========================================
// 먹이 주머니
// ==========================================
function bag(u) {
    u = u || u_();
    if (!u) return {};
    const v = u.petFood;
    if (Array.isArray(v)) {                       // 파이어베이스가 배열로 돌려준 것
        const o = {};
        for (let i = 0; i < v.length; i++) if (v[i]) o[String(i)] = v[i];
        u.petFood = o;
    } else if (!v || typeof v !== 'object') {
        u.petFood = {};
    }
    return u.petFood;
}
function have(name, u) { return Number(bag(u)[keyOf(name)]) || 0; }

function add(name, n) {
    const u = u_();
    if (!u) return 0;
    name = keyOf(name);
    const b = bag(u);
    const v = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (v) b[name] = v; else delete b[name];
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/petFood/' + name).set(v || null)
                .catch(function (e) { console.warn('[인형] 먹이 저장 실패', e); });
            return v;
        }
    } catch (e) { }
    try { if (typeof saveFields === 'function') saveFields({ petFood: 1 }); } catch (e) { }
    return v;
}

// ==========================================
// 사기
// ==========================================
window.petFoodBuy = function (name) {
    if (typeof buyGuard === 'function' && !buyGuard()) return;
    const u = u_();
    const f = FOOD_BY[name];
    if (!u || !f) return;
    try {
        if (typeof isQuarantined === 'function' && isQuarantined(u)) {
            alert_('격리 중에는 살 수 없습니다.'); return;
        }
    } catch (e) { }
    if ((Number(u.points) || 0) < f.p) {
        alert_('포인트가 모자랍니다.\n\n' + nameOf(f.n, u) + ' ' + f.p.toLocaleString() + ' P');
        return;
    }
    u.points = (Number(u.points) || 0) - f.p;
    add(f.n, 1);
    log_('[사택] ' + nameOf(f.n, u) + ' 구입 (-' + f.p.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    ui();
    paint();
};

// ==========================================
// 먹이기
// ==========================================
//
//   돌려주는 값 — { ok, msg } 또는 { ok:false, why }
function feed(id, name) {
    const u = u_();
    const f = FOOD_BY[name];
    const sp = P().BY[id];
    if (!u || !f || !sp) return { ok: false, why: '그런 먹이가 없습니다.' };
    const s = P().pets(u)[String(id)];
    if (!s) return { ok: false, why: '아직 없는 인형입니다.' };
    const shown = nameOf(f.n, u);                                   // 보이는 이름 (봉제인형 · 옛 펫)
    name = f.n;
    if (!have(name, u)) return { ok: false, why: shown + P().josa(shown, '이') + ' 없습니다.' };
    if (s.out && s.out.till) return { ok: false, why: '탐사를 나가 있습니다.' };

    const now = P().now();
    const rest = Math.max(0, (Number(s.rest) || 0) - now);

    // ★ 포만도가 이미 가득한데 포만도밖에 못 채우는 먹이라면 돌려보낸다.
    //   값싼 둘(물 만 밥 · 마른 멸치)이 여기 걸린다. 비싼 셋은 쉬는 시간이나
    //   탐사 몫이 있어 가득해도 줄 까닭이 있으므로 그대로 받는다.
    const fillOnly = !f.cut && !f.up && f.bond === false;
    if (fillOnly && P().full(id, u) >= 100) {
        return { ok: false, why: P().nick(id, u) + ' — 포만도가 이미 가득합니다.\n\n'
            + shown + P().josa(shown, '은') + ' 아껴 두십시오.' };
    }

    add(name, -1);

    // 포만도를 채운다 — fill 이 1 이면 예전처럼 fedAt 이 지금이 된다
    const fl = P().fillAt(id, u, f.fill == null ? 1 : f.fill);
    const patch = { fedAt: fl.fedAt };
    let said = ['포만도 ' + fl.was + ' → ' + fl.now + (fl.now >= 100 ? ' (가득)' : '')];
    if (f.bond === false) {
        said.push('교감은 오르지 않습니다.');
    } else {
        const up = P().bondUp(id, patch);           // 교감도
        if (up) said.push('교감 +' + up + ' (' + (patch.bond) + ' / ' + P().BOND_MAX + ')');
        else if (P().bond(id, u) >= P().BOND_MAX) said.push('교감은 이미 가득합니다.');
        else said.push('오늘 교감은 더 오르지 않습니다.');
    }
    if (rest) {
        const left = (f.cut < 0) ? 0 : Math.max(0, rest - f.cut);
        patch.rest = left ? (now + left) : null;
        said.push(left
            ? ('쉬는 시간이 ' + Math.ceil(left / 60000) + '분 남았습니다.')
            : '바로 다시 나갈 수 있습니다.');
    }
    if (f.up) {
        patch.fed = f.up;
        said.push('다음 탐사에 ' + Math.round(f.up * 100) + '% 더 받아 옵니다.');
    }
    P().patch(id, patch);

    log_('[인형] ' + P().nick(id, u) + '에게 ' + shown + P().josa(shown, '을') + ' 주었습니다.');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    paint();
    return { ok: true, msg: P().nick(id, u) + P().josa(P().nick(id, u), '이') + ' ' + shown
        + P().josa(shown, '을') + ' 먹었습니다.\n\n' + said.join('\n') };
}

window.petFeed = function (id, name) {
    const r = feed(id, name);
    if (!r.ok) { alert_(r.why); return r; }
    alert_(r.msg);
    return r;
};
// ==========================================
// 사택 칸
// ==========================================
function html() {
    const u = u_();
    const rows = FOOD.map(function (f) {
        const n = have(f.n, u);
        return '<div style="display:flex; justify-content:space-between; align-items:center;'
            + ' gap:7px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.05);">'
            + '<div style="flex:1; min-width:0;">'
            + '<span style="font-size:11px; color:#ddd;">' + esc(nameOf(f.n, u)) + '</span>'
            + (n ? '<span style="font-size:10px; color:#ff9800; margin-left:5px;">보유 ' + n + '</span>' : '')
            + '<div style="font-size:9px; color:#666; margin-top:2px;">'
            + '<span style="color:#8bc34a;">'
            + (f.fill == null || f.fill >= 1 ? '포만도 가득'
                                             : '포만도 +' + Math.round(f.fill * 100)) + '</span>'
            + (f.cut < 0 ? ' · 쉬는 시간 전부'
                         : f.cut ? ' · 쉬는 시간 ' + Math.round(f.cut / 60000) + '분' : '')
            + (f.up ? ' · 다음 탐사 +' + Math.round(f.up * 100) + '%' : '')
            + (f.bond === false ? ' · 교감 없음' : '')
            + ' <span style="color:#555;">· ' + esc(descOf(f.n, u)) + '</span></div>'
            + '</div>'
            + '<button class="inv-btn inv-btn-use" style="flex:0 0 auto; min-width:66px;"'
            + ' onclick="petFoodBuy(\'' + esc(f.n) + '\')">' + f.p.toLocaleString() + ' P</button>'
            + '</div>';
    }).join('');

    return '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:4px;">'
        + '🍖 인형 먹이</div>'
        + '<div style="font-size:9.5px; color:#777; margin-bottom:6px; line-height:1.6;">'
        + '먹이면 포만도가 찹니다. 사흘치가 포만도 100 입니다.'
        + ' <span style="color:#e07a5f;">포만도가 0 이 되면 교감이 ' + P().DEATH_HIT + ' 깎입니다.</span><br>'
        + '값싼 둘은 포만도만 채웁니다. 1,000 P 이상은 교감도 오르고 쉬는 시간도 줄어듭니다.<br>'
        + '주는 것은 내 방에서 합니다.</div>'
        + rows;
}

function paint() {
    const host = document.getElementById('house-main-body');
    if (!host || !u_()) return;
    let el = document.getElementById(BOX);
    // ★ 사택 먹이 칸은 옛 펫 외형을 켠 사원에게만 — 봉제인형 쪽은 도깨비 공방 잡화점에서 산다 (2026-11-08)
    if (!oldArt()) { if (el) el.remove(); return; }
    if (!el) {
        el = document.createElement('div');
        el.id = BOX;
        el.style.cssText = 'background:rgba(212,175,55,0.06); border:1px solid #4a3a26;'
            + ' border-radius:6px; padding:12px; margin-top:10px;';
        host.appendChild(el);
    }
    const h = html();
    if (el.innerHTML !== h) el.innerHTML = h;
}

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._petFood) { clearInterval(iv); return; }
        const _r = renderHouse;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { paint(); } catch (e) { console.warn('[인형]', e); }
            return out;
        };
        w._petFood = true;
        renderHouse = w;
        window.renderHouse = w;
        clearInterval(iv);
        console.log('[인형] 사택 먹이 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 바깥에 내어 준다
// ==========================================
window.PETFOOD = { LIST: FOOD, BY: FOOD_BY, bag: bag, have: have, add: add, feed: feed, paint: paint, name: nameOf, desc: descOf, key: keyOf, oldArt: oldArt };

window.petFoodBag = function () {
    const u = u_();
    console.log('%c===== 인형 먹이 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const b = bag(u);
    const k = Object.keys(b).filter(function (x) { return b[x] > 0; });
    console.log('  ' + (k.length ? k.map(function (x) { return x + '×' + b[x]; }).join(', ') : '비었음'));
};

console.log('[인형] petFoodBag() · petFeed(번호, 먹이)');

})();
