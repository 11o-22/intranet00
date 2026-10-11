// ==========================================
// ★ 펫 — 어둠에 혼자 보내기 (펫 탐사)
// bundles.json 마지막 묶음, pet-food.js 보다 뒤
// ==========================================
//
// ■ 어떻게 도나
//
//   어둠 첫 칸(renderDarkness → #darkness-body) 아래에 펫 탐사 칸을 붙인다.
//   사원 본인의 하루 여덟 번과는 따로 센다 — 펫은 횟수를 쓰지 않는다.
//
//   구역은 열 군데 다 보낼 수 있다. 사람이 못 들어가는 S 구역도 보낸다.
//   한 번 나가면 한두 시간, 돌아오면 포인트를 물어 온다. 다녀온 펫은
//   두 시간 쉰다 — 먹이를 주면 그 시간이 준다 (pet-food.js).
//
//   펫이 다치거나 죽는 일은 없다. 물어 오는 것만 다르다.
//
// ■ 얼마를 물어 오나
//
//   구역 등급별 한 시간치 × 나간 시간(1~2) × 펫 등급 × (1 + 먹이)
//   지금은 전부 D 등급이라 펫 등급 몫은 1배다.
//
// ■ 콘솔
//   petTrips()        나가 있는 펫
//   petSend(번호, 'Qtrew-D-042')
//   petBack(번호)

(function petDark() {

const BOX = 'pet-dark-box';
const MOD = 'pet-dark-modal';

// 구역 등급별 한 시간치
const PAY = { D: [150, 350], C: [300, 700], B: [600, 1300], A: [1000, 2000], S: [2000, 4000] };
// 펫 등급 몫 (등급을 올리는 길은 아직 없다 — 자리만 잡아 둔다)
const GMUL = { D: 1, C: 1.25, B: 1.5, A: 1.75, S: 2 };
const HOURS = [1, 2];

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
function mins(ms) { return Math.max(1, Math.ceil(ms / 60000)); }
function left(ms) {
    const m = mins(ms);
    return m >= 60 ? (Math.floor(m / 60) + '시간 ' + (m % 60) + '분') : (m + '분');
}
function zones() {
    return (typeof DARK_ZONES !== 'undefined' && DARK_ZONES) ? DARK_ZONES : {};
}
function cap() { return (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000; }

// ==========================================
// 창
// ==========================================
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999992; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:15px; width:100%;'
        + ' max-width:400px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// ==========================================
// 상태
// ==========================================
function stateOf(s) {
    const now = P().now();
    if (s && s.out && s.out.till) {
        return (s.out.till > now)
            ? { k: 'out',  t: esc(s.out.name || s.out.zone) + ' · ' + left(s.out.till - now) + ' 남음', c: '#9fd8ef' }
            : { k: 'done', t: esc(s.out.name || s.out.zone) + ' · 돌아왔습니다', c: '#6f8f5e' };
    }
    if (s && (Number(s.rest) || 0) > now)
        return { k: 'rest', t: '쉬는 중 · ' + left(s.rest - now), c: '#c9a227' };
    return { k: 'idle', t: '대기', c: '#8d8578' };
}

function payOf(zone, hours, s) {
    const z = zones()[zone];
    if (!z) return 0;
    const r = PAY[z.grade] || PAY.D;
    const base = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1));
    const g = GMUL[(s && s.g) || 'D'] || 1;
    const up = 1 + (Number(s && s.fed) || 0);
    return Math.max(10, Math.round(base * hours * g * up / 10) * 10);
}

// ==========================================
// 내보낸다
// ==========================================
window.petSend = function (id, zone) {
    const u = u_();
    const sp = P().BY[id];
    const z = zones()[zone];
    if (!u || !sp || !z) { alert_('그런 구역이 없습니다.'); return; }
    const key = String(id);
    const s = P().pets(u)[key];
    if (!s) { alert_('아직 없는 펫입니다.'); return; }
    const st = stateOf(s);
    if (st.k === 'out')  { alert_('이미 나가 있습니다.'); return; }
    if (st.k === 'done') { alert_('먼저 데려오십시오.'); return; }
    if (st.k === 'rest') { alert_('쉬는 중입니다.\n\n' + st.t + '\n사택에서 먹이를 사 두면 줄일 수 있습니다.'); return; }

    const hours = HOURS[Math.floor(Math.random() * HOURS.length)];
    const now = P().now();
    const out = {
        zone: zone, name: z.name, grade: z.grade,
        till: now + hours * 3600 * 1000, hours: hours,
        pay: payOf(zone, hours, s)
    };
    P().patch(key, { out: out });

    const nick = P().nick(id, u);
    log_('[펫 탐사] ' + nick + P().josa(nick, '을') + ' ' + z.name + '에 보냈습니다. (' + hours + '시간)');
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    shut();
    paint();
    alert_(nick + P().josa(nick, '이') + ' ' + z.name + P().josa(z.name, '로')
        + ' 들어갔습니다.\n\n'
        + hours + '시간 뒤에 돌아옵니다.');
};

// ==========================================
// 데려온다
// ==========================================
window.petBack = function (id) {
    const u = u_();
    if (!u) return;
    const key = String(id);
    const s = P().pets(u)[key];
    if (!s || !s.out || !s.out.till) { alert_('나가 있지 않습니다.'); return; }
    const now = P().now();
    if (s.out.till > now) {
        alert_('아직 안 돌아왔습니다.\n\n' + left(s.out.till - now) + ' 남았습니다.');
        return;
    }

    const got = Math.max(0, Number(s.out.pay) || 0);
    const z = s.out.name || s.out.zone;
    u.points = Math.max(0, Math.min(cap(), (Number(u.points) || 0) + got));
    P().patch(key, { out: null, fed: null, rest: now + P().REST });

    const nick = P().nick(id, u);
    log_('[펫 탐사] ' + nick + P().josa(nick, '이') + ' ' + z + '에서 돌아왔습니다. (+'
        + got.toLocaleString() + ' P)');
    try { if (typeof saveFields === 'function') saveFields({ points: 1, history: 1 }); } catch (e) { }
    try { if (typeof showPointGainEffect === 'function') showPointGainEffect(got); } catch (e) { }
    ui();
    shut();
    paint();
    alert_(nick + P().josa(nick, '이') + ' ' + z + '에서 돌아왔습니다.\n\n'
        + '+' + got.toLocaleString() + ' P\n\n두 시간 쉽니다.');
};

// ==========================================
// 구역 고르기
// ==========================================
window.petPickZone = function (id) {
    const u = u_();
    const sp = P().BY[id];
    if (!u || !sp) return;
    const s = P().pets(u)[String(id)];
    if (!s) return;
    const g = GMUL[s.g || 'D'] || 1;
    const up = 1 + (Number(s.fed) || 0);

    const Z = zones();
    const rows = Object.keys(Z).map(function (k) {
        const z = Z[k];
        const r = PAY[z.grade] || PAY.D;
        const lo = Math.round(r[0] * 1 * g * up / 10) * 10;
        const hi = Math.round(r[1] * 2 * g * up / 10) * 10;
        return '<button class="game-btn pd-go" data-k="' + esc(k) + '"'
            + ' style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px; text-align:left;">'
            + '<span style="color:#ffcf8f; font-weight:bold;">[' + esc(z.grade) + '] '
            + esc(z.name) + '</span>'
            + '<div style="font-size:10px; color:#aaa; margin-top:3px; font-weight:normal;">'
            + esc(k) + ' · 한두 시간 · ' + lo.toLocaleString() + ' ~ ' + hi.toLocaleString() + ' P'
            + '</div></button>';
    }).join('');

    const nick = P().nick(id, u);
    const w = box('<div style="font-size:12px; color:#ffcf8f; font-weight:bold;">'
        + esc(nick) + P().josa(nick, '을') + ' 어디로</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin:4px 0 11px 0; line-height:1.6;">'
        + '사원 본인의 탐사 횟수는 쓰지 않습니다. 펫은 다치지 않습니다.'
        + (s.fed ? '<br><span style="color:#c9a227;">먹인 것이 남아 있습니다 — +'
            + Math.round(s.fed * 100) + '%</span>' : '') + '</div>'
        + rows
        + '<button id="pd-x" class="game-btn" style="' + BTN + GREY + ' margin-top:5px;">그만둔다</button>');

    w.querySelector('#pd-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.pd-go'), function (b) {
        b.onclick = function () { window.petSend(id, b.getAttribute('data-k')); };
    });
};

// ==========================================
// 먹이 주기
// ==========================================
window.petFeedPick = function (id) {
    const u = u_();
    const F = window.PETFOOD;
    if (!u || !F) return;
    const nick = P().nick(id, u);
    const rows = F.LIST.filter(function (f) { return F.have(f.n, u) > 0; }).map(function (f) {
        return '<button class="game-btn pd-feed" data-n="' + esc(f.n) + '"'
            + ' style="width:100%; margin:0 0 6px 0; padding:10px; font-size:12px; text-align:left;">'
            + '<span style="color:#ffcf8f; font-weight:bold;">' + esc(f.n) + '</span>'
            + '<span style="font-size:10px; color:#888; margin-left:6px; font-weight:normal;">'
            + '×' + F.have(f.n, u) + '</span>'
            + '<div style="font-size:10px; color:#aaa; margin-top:3px; font-weight:normal;">'
            + (f.cut < 0 ? '쉬는 시간 전부' : '쉬는 시간 ' + Math.round(f.cut / 60000) + '분')
            + (f.up ? ' · 다음 탐사 +' + Math.round(f.up * 100) + '%' : '') + '</div></button>';
    }).join('');

    const w = box('<div style="font-size:12px; color:#ffcf8f; font-weight:bold;">'
        + esc(nick) + '에게 무엇을</div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin:4px 0 11px 0;">'
        + '먹이는 사택에서 삽니다.</div>'
        + (rows || '<div style="font-size:11px; color:#666; padding:14px 0; text-align:center;">'
            + '가진 먹이가 없습니다.<br>사택에서 사 오십시오.</div>')
        + '<button id="pd-x" class="game-btn" style="' + BTN + GREY + ' margin-top:5px;">닫는다</button>');

    w.querySelector('#pd-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.pd-feed'), function (b) {
        b.onclick = function () {
            const r = window.petFeed(id, b.getAttribute('data-n'));
            if (r && r.ok) { shut(); paint(); }
        };
    });
};

// ==========================================
// 어둠 칸
// ==========================================
function html() {
    const u = u_();
    const ps = P().pets(u);
    const keys = Object.keys(ps).filter(function (k) { return P().BY[k]; })
        .sort(function (a, b) { return Number(a) - Number(b); });

    const head = '<div style="font-size:12px; color:#d4af37; font-weight:bold; margin-bottom:4px;">'
        + '🐶 펫 탐사</div>'
        + '<div style="font-size:9.5px; color:#777; margin-bottom:10px; line-height:1.6;">'
        + '펫은 혼자 들어갑니다. 사원 본인의 탐사 횟수는 쓰지 않고, 다치지도 않습니다.'
        + ' 한두 시간 뒤에 포인트를 물어 옵니다.</div>';

    if (!keys.length) {
        return head + '<div style="font-size:11px; color:#666; padding:6px 0;">'
            + '보낼 펫이 없습니다. 망상 홈쇼핑에서 환몽알을 가져오십시오.</div>';
    }

    return head + keys.map(function (k) {
        const sp = P().BY[k], s = ps[k], st = stateOf(s);
        let btn = '';
        if (st.k === 'idle')
            btn = '<button class="game-btn" onclick="petPickZone(' + k + ')"'
                + ' style="margin:0; padding:7px 12px; font-size:11px;">내보낸다</button>';
        else if (st.k === 'done')
            btn = '<button class="game-btn" onclick="petBack(' + k + ')"'
                + ' style="margin:0; padding:7px 12px; font-size:11px;">데려온다</button>';
        else if (st.k === 'rest')
            btn = '<button class="game-btn" onclick="petFeedPick(' + k + ')"'
                + ' style="margin:0; padding:7px 12px; font-size:11px;' + GREY + '">먹인다</button>';
        else
            btn = '<span style="font-size:10px; color:#555;">탐사 중</span>';

        return '<div style="display:flex; align-items:center; gap:9px; padding:7px 0;'
            + ' border-bottom:1px solid rgba(255,255,255,0.05);">'
            + '<img src="' + P().icon(sp.i) + '" alt="" style="flex:0 0 30px; width:30px;'
            + ' image-rendering:pixelated;">'
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:11px; color:#e8d7b4; overflow:hidden;'
            + ' text-overflow:ellipsis; white-space:nowrap;">' + esc(P().nick(k, u))
            + ' <span style="font-size:9px; color:#8d8578;">' + esc(s.g || 'D') + '</span></div>'
            + '<div style="font-size:9.5px; color:' + st.c + '; margin-top:2px;">' + st.t + '</div>'
            + '</div>' + btn + '</div>';
    }).join('');
}

function paint() {
    if (typeof darkRun !== 'undefined' && darkRun) {
        const old = document.getElementById(BOX);
        if (old) old.remove();
        return;
    }
    const host = document.getElementById('darkness-body');
    if (!host || !u_()) return;
    let el = document.getElementById(BOX);
    if (!el) {
        el = document.createElement('div');
        el.id = BOX;
        el.style.cssText = 'background:rgba(212,175,55,0.06); border:1px solid #4a3a26;'
            + ' border-radius:6px; padding:12px; margin-top:16px; text-align:left;';
        host.appendChild(el);
    }
    const h = html();
    if (el.innerHTML !== h) el.innerHTML = h;
}

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderDarkness !== 'function') return;
        if (renderDarkness._pet) { clearInterval(iv); return; }
        const _r = renderDarkness;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { paint(); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._pet = true;
        renderDarkness = w;
        window.renderDarkness = w;
        clearInterval(iv);
        console.log('[펫] 펫 탐사 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 남은 시간이 줄어드는 것을 보여 준다
setInterval(function () {
    try {
        const panel = document.getElementById('dark-main');
        if (!panel || !panel.classList.contains('active')) return;
        if (!u_()) return;
        paint();
    } catch (e) { }
}, 5000);

// ==========================================
// 확인
// ==========================================
window.petTrips = function () {
    const u = u_();
    console.log('%c===== 펫 탐사 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const ps = P().pets(u);
    const keys = Object.keys(ps).filter(function (k) { return P().BY[k]; });
    if (!keys.length) { console.log('  펫이 없습니다.'); return; }
    console.table(keys.map(function (k) {
        const s = ps[k], st = stateOf(s);
        return { 번호: k, 이름: P().nick(k, u), 등급: s.g || 'D', 지금: st.t,
                 물어올것: (s.out && s.out.pay) ? (s.out.pay.toLocaleString() + ' P') : '-',
                 먹인것: s.fed ? ('+' + Math.round(s.fed * 100) + '%') : '-' };
    }));
};

console.log('[펫] petTrips() · petSend(번호, 구역) · petBack(번호)');

})();
