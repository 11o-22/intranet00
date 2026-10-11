// ==========================================
// ★ 펫 — 내 방 · 교감 · 굶주림
// bundles.json 마지막 묶음, pet-food.js 보다 뒤
// ==========================================
//
// ■ 내 방 (사택 첫 칸)
//
//   가진 펫이 방 안에 늘어서서 위아래로 둥실거린다. 마리마다 흔들리는
//   박자가 조금씩 다르다. 누르면 그 펫과의 교감 칸이 열린다.
//
// ■ 교감
//
//   쓰다듬기 · 놀아주기 · 먹이주기. 한 번에 둘~셋씩 오르고 100 이 끝이다.
//   하루에 오르는 몫은 열까지다 — 하루에 다 채울 수는 없다.
//
//     쓰다듬기  10분마다   공짜
//     놀아주기  20분마다   공짜
//     먹이주기  먹이 하나  (굶주림 시계도 같이 되돌린다)
//
//   교감 100 인 펫은 어둠에 같이 들어갔을 때 주인 대신 죽어 줄 수 있다
//   (pet-with.js).
//
// ■ 굶주림
//
//   먹이를 사흘 동안 안 주면 죽는다. 죽으면 목록에서 사라지고 그 자리는
//   다시 「입양 전」이 된다. 하루가 안 남으면 붉게 띄운다.
//
// ■ 콘솔
//   petRoom()    내 방 · 교감 · 굶주림 상태
//   petPat(번호) · petPlay(번호)

(function petBond() {

const BOX = 'pet-room-box';
const MOD = 'pet-bond-modal';
const CSS = 'pet-bob-css';

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
function mins(ms) { return Math.max(1, Math.ceil(ms / 60000)); }
function span(ms) {
    if (ms <= 0) return '0분';
    const m = Math.ceil(ms / 60000);
    if (m < 60) return m + '분';
    const h = Math.floor(m / 60);
    if (h < 24) return h + '시간 ' + (m % 60) + '분';
    return Math.floor(h / 24) + '일 ' + (h % 24) + '시간';
}

// ==========================================
// 둥실거리는 틀 — 한 번만 심는다
// ==========================================
function style() {
    if (document.getElementById(CSS)) return;
    const s = document.createElement('style');
    s.id = CSS;
    s.textContent =
        '@keyframes petBob { 0%,100% { transform: translateY(0); }'
        + ' 50% { transform: translateY(-7px); } }'
        + '.pet-bob { animation: petBob 2.2s ease-in-out infinite; will-change: transform; }'
        + '.pet-floor { position:relative; display:flex; flex-wrap:wrap; gap:4px;'
        + ' align-items:flex-end; justify-content:center; min-height:72px;'
        + ' padding:10px 6px 8px 6px; border-radius:6px;'
        + ' background:linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(60,44,22,0.18) 100%);'
        + ' border:1px solid #3a3025; overflow:hidden; }'
        + '.pet-floor::after { content:""; position:absolute; left:8px; right:8px; bottom:6px;'
        + ' height:1px; background:linear-gradient(90deg, transparent, #5a4a2a, transparent); }'
        + '.pet-stand { width:52px; text-align:center; cursor:pointer; position:relative; z-index:1; }'
        + '@media (prefers-reduced-motion: reduce) { .pet-bob { animation: none; } }';
    document.head.appendChild(s);
}

// ==========================================
// 창
// ==========================================
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999993; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:15px; width:100%;'
        + ' max-width:380px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w) shut(); });
    document.body.appendChild(w);
    return w;
}
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// ==========================================
// 굶어 죽은 펫 걷어 가기
// ==========================================
let told = 0;
function sweep(quiet) {
    const u = u_();
    if (!u || !P()) return;
    const gone = P().sweep();
    if (!gone.length) return;
    gone.forEach(function (g) {
        log_('[펫] ' + g.n + P().josa(g.n, '이') + ' 굶어 죽었습니다. (' + g.sp + ')');
    });
    try { if (typeof saveFields === 'function') saveFields({ history: 1 }); } catch (e) { }
    paint();
    if (quiet) return;
    const now = Date.now();
    if (now - told < 5000) return;
    told = now;
    alert_('사흘 동안 아무것도 먹지 못했습니다.\n\n'
        + gone.map(function (g) { return '— ' + g.n + ' (' + g.sp + ')'; }).join('\n')
        + '\n\n자리가 비었습니다.');
}

// ==========================================
// 쓰다듬기 · 놀아주기
// ==========================================
function touch(id, kind) {
    const u = u_();
    const sp = P().BY[id];
    if (!u || !sp) return { ok: false, why: '그런 펫이 없습니다.' };
    const s = P().pets(u)[String(id)];
    if (!s) return { ok: false, why: '아직 없는 펫입니다.' };
    if (s.out && s.out.till) return { ok: false, why: '탐사를 나가 있습니다.' };

    const pat = (kind === 'pat');
    const gap = pat ? P().PAT_GAP : P().PLAY_GAP;
    const last = Number(pat ? s.pat : s.play) || 0;
    const now = P().now();
    const left = Math.max(0, last + gap - now);
    const word = pat ? '쓰다듬기' : '놀아주기';
    if (left > 0) return { ok: false, why: word + P().josa(word, '은') + ' ' + mins(left) + '분 뒤에 다시 됩니다.' };

    if (P().bondRoom(id, u) <= 0) {
        return { ok: false, why: P().bondFull(id, u)
            ? '교감이 이미 가득합니다.'
            : '오늘 교감은 더 오르지 않습니다.\n하루에 ' + P().BOND_DAY + '까지입니다.' };
    }

    const patch = {};
    patch[pat ? 'pat' : 'play'] = now;
    const up = P().bondUp(id, patch);
    P().patch(id, patch);
    paint();

    const nick = P().nick(id, u);
    const say = pat
        ? ['가만히 있습니다.', '눈을 감습니다.', '머리를 들이밉니다.', '못 들은 척합니다.',
           '한참 있다가 한 번 돌아봅니다.']
        : ['한참을 뛰어다녔습니다.', '숨이 찼는지 드러눕습니다.', '먼저 와서 기다립니다.',
           '어디론가 물고 달아납니다.', '지치지도 않습니다.'];
    return { ok: true, msg: nick + P().josa(nick, '은') + ' ' + say[Math.floor(Math.random() * say.length)]
        + '\n\n교감 +' + up + ' (' + patch.bond + ' / ' + P().BOND_MAX + ')' };
}

window.petPat  = function (id) { const r = touch(id, 'pat');  r.ok ? alert_(r.msg) : alert_(r.why); return r; };
window.petPlay = function (id) { const r = touch(id, 'play'); r.ok ? alert_(r.msg) : alert_(r.why); return r; };

// ==========================================
// 교감 칸
// ==========================================
window.petBondOpen = function (id) {
    const u = u_();
    const sp = P().BY[id];
    if (!u || !sp) return;
    const s = P().pets(u)[String(id)];
    if (!s) { alert_('아직 없는 펫입니다.'); return; }

    const now = P().now();
    const b = P().bond(id, u);
    const full = b >= P().BOND_MAX;
    const room = P().bondRoom(id, u);
    const hunger = P().starveLeft(id, u);
    const soon = hunger < 24 * 3600 * 1000;
    const patLeft  = Math.max(0, (Number(s.pat) || 0) + P().PAT_GAP - now);
    const playLeft = Math.max(0, (Number(s.play) || 0) + P().PLAY_GAP - now);
    const out = !!(s.out && s.out.till);
    const nick = P().nick(id, u);

    const F = window.PETFOOD;
    const foods = F ? F.LIST.filter(function (f) { return F.have(f.n, u) > 0; }) : [];

    const w = box(
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:9px;">'
        + '<span style="font-size:12px; color:#ffcf8f; font-weight:bold;">' + esc(nick) + '</span>'
        + '<span style="font-size:10px; color:#8d8578;">' + esc(sp.n) + ' · ' + esc(s.g || 'D') + ' 등급</span>'
        + '</div>'

        + '<div class="pet-floor" style="margin-bottom:11px; min-height:96px;">'
        + '<div class="pet-stand" style="width:84px;">'
        + '<img class="pet-bob" src="' + P().icon(id) + '" alt="" style="width:72px;'
        + ' image-rendering:pixelated;"></div></div>'

        + '<div style="font-size:10px; color:#8d8578; display:flex; justify-content:space-between;">'
        + '<span>교감</span><span style="color:' + (full ? '#d4af37' : '#e8d7b4') + ';">'
        + b + ' / ' + P().BOND_MAX + '</span></div>'
        + '<div style="height:7px; background:#241f19; border-radius:4px; margin:5px 0 4px 0;">'
        + '<div style="height:100%; width:' + Math.round(b / P().BOND_MAX * 100) + '%;'
        + ' background:linear-gradient(90deg,#8a6a2a,' + (full ? '#ffd766' : '#d4af37') + ');'
        + ' border-radius:4px;"></div></div>'
        + '<div style="font-size:9.5px; color:#6f685e; margin-bottom:9px;">'
        + (full
            ? '<span style="color:#d4af37;">가득 찼습니다 — 어둠에 같이 들어가면 주인 대신 죽어 줄 수 있습니다.</span>'
            : ('오늘 더 오를 몫 ' + room + ' <span style="color:#555;">/ 하루 ' + P().BOND_DAY + '</span>'))
        + '</div>'

        + '<div style="font-size:10px; padding:7px 0; border-top:1px solid #241f19;'
        + ' border-bottom:1px solid #241f19; margin-bottom:11px; color:'
        + (soon ? '#e07a5f' : '#8d8578') + ';">'
        + '배고픔 — ' + (hunger <= 0 ? '굶었습니다' : (span(hunger) + ' 뒤에 굶습니다'))
        + (soon ? '<br><span style="font-size:9.5px;">먹이를 주지 않으면 죽습니다.</span>' : '')
        + '</div>'

        + '<button id="pb-pat" class="game-btn" ' + ((out || patLeft > 0) ? 'disabled ' : '')
        + 'style="' + BTN + ((out || patLeft > 0) ? ' opacity:.45;' : '') + '">'
        + (out ? '탐사 중입니다' : patLeft > 0 ? ('쓰다듬기 — ' + mins(patLeft) + '분 뒤') : '쓰다듬는다') + '</button>'
        + '<button id="pb-play" class="game-btn" ' + ((out || playLeft > 0) ? 'disabled ' : '')
        + 'style="' + BTN + ((out || playLeft > 0) ? ' opacity:.45;' : '') + '">'
        + (out ? '탐사 중입니다' : playLeft > 0 ? ('놀아주기 — ' + mins(playLeft) + '분 뒤') : '놀아 준다') + '</button>'

        + '<div style="font-size:10px; color:#8d8578; margin:9px 0 5px 0;">먹이를 준다</div>'
        + (foods.length
            ? foods.map(function (f) {
                return '<button class="game-btn pb-food" data-n="' + esc(f.n) + '"'
                    + (out ? ' disabled' : '')
                    + ' style="' + BTN + ' text-align:left;' + (out ? ' opacity:.45;' : '') + '">'
                    + esc(f.n) + '<span style="font-size:10px; color:#888; font-weight:normal;'
                    + ' margin-left:6px;">×' + F.have(f.n, u) + '</span></button>';
            }).join('')
            : '<div style="font-size:10px; color:#666; padding:4px 0 8px 0;">'
              + '가진 먹이가 없습니다. 사택에서 사 오십시오.</div>')

        + '<button id="pb-x" class="game-btn" style="' + BTN + GREY + ' margin-top:6px;">닫는다</button>');

    w.querySelector('#pb-x').onclick = shut;
    w.querySelector('#pb-pat').onclick = function () {
        const r = window.petPat(id); if (r.ok) window.petBondOpen(id);
    };
    w.querySelector('#pb-play').onclick = function () {
        const r = window.petPlay(id); if (r.ok) window.petBondOpen(id);
    };
    Array.prototype.forEach.call(w.querySelectorAll('.pb-food'), function (btn) {
        btn.onclick = function () {
            const r = window.petFeed(id, btn.getAttribute('data-n'));
            if (r && r.ok) window.petBondOpen(id);
        };
    });
};

// ==========================================
// 내 방
// ==========================================
function html() {
    const u = u_();
    const ps = P().pets(u);
    const keys = Object.keys(ps).filter(function (k) { return P().BY[k]; })
        .sort(function (a, b) { return Number(a) - Number(b); });

    const head = '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:4px;">'
        + '🏠 내 방</div>';

    if (!keys.length) {
        return head + '<div style="font-size:11px; color:#666; padding:4px 0;">'
            + '방이 비었습니다. 환몽알이 깨어나면 여기에 섭니다.</div>';
    }

    const hungry = keys.filter(function (k) {
        return P().starveLeft(k, u) < 24 * 3600 * 1000;
    });

    return head
        + '<div style="font-size:9.5px; color:#777; margin-bottom:7px; line-height:1.6;">'
        + '누르면 쓰다듬고 놀아 주고 먹일 수 있습니다. 먹이를 사흘 동안 안 주면 죽습니다.</div>'
        + (hungry.length
            ? '<div style="font-size:10px; color:#e07a5f; margin-bottom:7px;">'
              + hungry.map(function (k) {
                  return esc(P().nick(k, u)) + ' ' + span(Math.max(0, P().starveLeft(k, u)));
              }).join(' · ') + ' 뒤에 굶습니다</div>'
            : '')
        + '<div class="pet-floor">'
        + keys.map(function (k, i) {
            const s = ps[k];
            const b = P().bond(k, u);
            const away = !!(s.out && s.out.till) || !!s['with'];
            const dur = (1.9 + (Number(k) % 5) * 0.22).toFixed(2);
            const del = ((Number(k) % 7) * 0.17).toFixed(2);
            return '<div class="pet-stand" onclick="petBondOpen(' + k + ')" title="' + esc(P().nick(k, u)) + '">'
                + '<img class="pet-bob" src="' + P().icon(k) + '" alt=""'
                + ' style="width:42px; image-rendering:pixelated;'
                + ' animation-duration:' + dur + 's; animation-delay:' + del + 's;'
                + (away ? ' opacity:.32; filter:grayscale(.7);' : '') + '">'
                + '<div style="font-size:8px; color:#9d9488; margin-top:1px; overflow:hidden;'
                + ' text-overflow:ellipsis; white-space:nowrap;">' + esc(P().nick(k, u)) + '</div>'
                + '<div style="font-size:7.5px; color:' + (b >= P().BOND_MAX ? '#d4af37' : '#5f594f') + ';">'
                + (away ? '자리 비움' : ('♥ ' + b)) + '</div>'
                + '</div>';
        }).join('')
        + '</div>';
}

function paint() {
    const host = document.getElementById('house-main-body');
    if (!host || !u_()) return;
    style();
    let el = document.getElementById(BOX);
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

window.petRoomPaint = paint;

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._petRoom) { clearInterval(iv); return; }
        const _r = renderHouse;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { sweep(false); paint(); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._petRoom = true;
        renderHouse = w;
        window.renderHouse = w;
        clearInterval(iv);
        console.log('[펫] 내 방 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 굶주림은 화면을 안 보고 있어도 돈다 — 느린 시계를 하나 둔다
setTimeout(function () { try { sweep(false); } catch (e) { } }, 6000);
setInterval(function () { try { sweep(false); } catch (e) { } }, 5 * 60 * 1000);

// ==========================================
// 확인
// ==========================================
window.petRoom = function () {
    const u = u_();
    console.log('%c===== 🏠 내 방 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const ps = P().pets(u);
    const keys = Object.keys(ps).filter(function (k) { return P().BY[k]; });
    if (!keys.length) { console.log('  방이 비었습니다.'); return; }
    console.table(keys.map(function (k) {
        const s = ps[k];
        return { 번호: k, 이름: P().nick(k, u), 교감: P().bond(k, u) + ' / ' + P().BOND_MAX,
                 오늘남은몫: P().bondRoom(k, u),
                 배고픔: span(Math.max(0, P().starveLeft(k, u))) + ' 뒤',
                 대신죽기: P().bondFull(k, u) ? ('O (' + Math.round(P().SAVE_ODDS * 100) + '%)') : '✗',
                 지금: (s.out && s.out.till) ? '탐사 중' : (s['with'] ? '동행 중' : '방') };
    }));
};

try { style(); } catch (e) { }

console.log('[펫] petRoom() · petPat(번호) · petPlay(번호)');

})();
