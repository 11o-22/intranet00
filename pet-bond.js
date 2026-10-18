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
        + '@keyframes petDash { 0%,100% { transform: translate(0,0); }'
        + ' 25% { transform: translate(-6px,-5px); } 75% { transform: translate(6px,-5px); } }'
        + '@keyframes petSleep { 0%,100% { transform: translateY(0) scale(1); }'
        + ' 50% { transform: translateY(-2px) scale(1.02); } }'
        + '@keyframes petFight { 0%,100% { transform: translate(0,0) rotate(0); }'
        + ' 20% { transform: translate(-3px,-3px) rotate(-6deg); }'
        + ' 60% { transform: translate(3px,-3px) rotate(6deg); } }'
        + '@keyframes petLean { 0%,100% { transform: translateY(0) rotate(0); }'
        + ' 50% { transform: translateY(-3px) rotate(3deg); } }'
        + '.pet-bob   { animation: petBob 2.2s ease-in-out infinite; will-change: transform; }'
        + '.pet-dash  { animation: petDash 0.9s ease-in-out infinite; will-change: transform; }'
        + '.pet-sleep { animation: petSleep 4.2s ease-in-out infinite; will-change: transform; }'
        + '.pet-fight { animation: petFight 0.35s ease-in-out infinite; will-change: transform; }'
        + '.pet-lean  { animation: petLean 3.0s ease-in-out infinite; will-change: transform; }'
        + '.pet-still { animation: none; }'
        + '.pet-scene { font-size:9.5px; color:#b8ac97; text-align:center; line-height:1.6;'
        + ' padding:7px 6px 0 6px; min-height:17px; }'
        + '.pet-floor { position:relative; display:flex; flex-wrap:wrap; gap:4px;'
        + ' align-items:flex-end; justify-content:center; min-height:72px;'
        + ' padding:10px 6px 8px 6px; border-radius:6px;'
        + ' background:linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(60,44,22,0.18) 100%);'
        + ' border:1px solid #3a3025; overflow:hidden; }'
        + '.pet-floor::after { content:""; position:absolute; left:8px; right:8px; bottom:6px;'
        + ' height:1px; background:linear-gradient(90deg, transparent, #5a4a2a, transparent); }'
        + '.pet-stand { width:52px; text-align:center; cursor:pointer; position:relative; z-index:1; }'
        + '@media (prefers-reduced-motion: reduce) {'
        + ' .pet-bob, .pet-dash, .pet-sleep, .pet-fight, .pet-lean { animation: none; } }';
    document.head.appendChild(s);
}

// ==========================================
// 둘이 같이 있을 때 — 스무 가지
// ==========================================
//
//   t   한 줄. $1 $2 는 두 펫의 이름으로 바뀐다.
//   a   그때 두 마리가 어떻게 움직이나 [왼쪽, 오른쪽]
//   c   글자 색
const SCENES = [
    { t: '$1{와} $2{이} 서로 쫓아다닙니다.',               a: ['dash',  'dash'],  c: '#9fd8ef' },
    { t: '$1{와} $2{이} 한 덩어리로 뭉쳐 잡니다.',          a: ['sleep', 'sleep'], c: '#8d8578' },
    { t: '$1{와} $2{이} 등을 맞대고 앉아 있습니다.',        a: ['lean',  'lean'],  c: '#b8ac97' },
    { t: '$1{와} $2{이} 좋은 자리를 두고 다툽니다.',        a: ['fight', 'fight'], c: '#e07a5f' },
    { t: '$1{이} $2{의} 꼬리를 뭅니다. $2{은} 모르는 척합니다.',
                                                        a: ['dash',  'still'], c: '#e0b05f' },
    { t: '$1{와} $2{이} 서로 털을 골라 줍니다.',            a: ['lean',  'lean'],  c: '#9fd0a6' },
    { t: '빈 그릇 앞에서 $1{와} $2{이} 눈치를 봅니다.',      a: ['still', 'still'], c: '#b8ac97' },
    { t: '$1{와} $2{이} 번갈아 한 번씩 웁니다.',            a: ['bob',   'bob'],   c: '#b8ac97' },
    { t: '$1{와} $2{이} 같은 곳을 한참 봅니다. 거기엔 아무것도 없습니다.',
                                                        a: ['still', 'still'], c: '#8d8578' },
    { t: '$1{이} $2{의} 등에 올라탔습니다. 내려올 생각이 없습니다.',
                                                        a: ['still', 'lean'],  c: '#e0b05f' },
    { t: '$1{와} $2{이} 서로 모르는 척 지나갑니다.',        a: ['dash',  'dash'],  c: '#8d8578' },
    { t: '$1{와} $2{이} 코를 맞댑니다.',                   a: ['lean',  'lean'],  c: '#ffb3c7' },
    { t: '$1{와} $2{이} 구석에서 같이 숨어 있습니다.',      a: ['still', 'still'], c: '#8d8578' },
    { t: '$1{은} 자고, $2{은} 그 옆을 지킵니다.',           a: ['sleep', 'still'], c: '#9fd0a6' },
    { t: '$1{와} $2{이} 서로 밀어냅니다. 둘 다 안 물러섭니다.',
                                                        a: ['fight', 'fight'], c: '#e07a5f' },
    { t: '$1{와} $2{이} 같은 자리를 빙빙 돕니다.',          a: ['dash',  'dash'],  c: '#9fd8ef' },
    { t: '$1{이} 물어 온 것을 $2{에게} 밀어 줍니다.',       a: ['lean',  'bob'],   c: '#9fd0a6' },
    { t: '$1{와} $2{이} 소리 없이 서로를 노려봅니다.',      a: ['still', 'still'], c: '#e07a5f' },
    { t: '$1{와} $2{이} 겹쳐 누워 숨을 맞춥니다.',          a: ['sleep', 'sleep'], c: '#8d8578' },
    { t: '$1{와} $2{이} 갑자기 둘 다 멈췄습니다. 무언가 들은 모양입니다.',
                                                        a: ['still', 'still'], c: '#c9a227' }
];
const SOLO = [
    { t: '$1{이} 방을 한 바퀴 돌고 제자리에 앉습니다.', a: ['dash'],  c: '#9fd8ef' },
    { t: '$1{이} 창 쪽을 보고 있습니다.',               a: ['still'], c: '#8d8578' },
    { t: '$1{이} 혼자 잡니다.',                        a: ['sleep'], c: '#8d8578' },
    { t: '$1{이} 아무것도 없는 바닥을 긁습니다.',       a: ['bob'],   c: '#b8ac97' },
    { t: '$1{이} 이쪽을 봅니다.',                      a: ['lean'],  c: '#b8ac97' }
];
const SCENE_MS = 20000;                 // 한 장면이 머무는 시간

let sceneIdx = -1, sceneAt = 0, sceneFor = '';

// 지금 장면 — 같은 짝으로는 20초마다 하나씩 바뀐다
function sceneNow(keys) {
    const tag = keys.join(',');
    const now = Date.now();
    const pool = (keys.length >= 2) ? SCENES : SOLO;
    if (tag !== sceneFor || sceneIdx < 0 || now - sceneAt > SCENE_MS) {
        let i = Math.floor(Math.random() * pool.length);
        if (tag === sceneFor && pool.length > 1 && i === sceneIdx) i = (i + 1) % pool.length;
        sceneIdx = i; sceneAt = now; sceneFor = tag;
    }
    return pool[Math.min(sceneIdx, pool.length - 1)];
}
// $1{와} 처럼 적어 두면 이름 뒤에 맞는 조사를 붙여 준다.
//   「삐약가」 같은 말이 나오지 않게 하려고 둔 것이다.
//   {의} {에게} 처럼 안 바뀌는 것은 그대로 붙인다.
function sceneText(sc, keys, u) {
    const n = [P().nick(keys[0], u), keys[1] ? P().nick(keys[1], u) : ''];
    return sc.t.replace(/\$([12])\{([^}]*)\}/g, function (_, i, j) {
        const name = n[Number(i) - 1];
        const k = P().josa(name, j);
        return name + (k || j);
    });
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
    // ★ 서버에서 확인한 뒤에야 지우므로, 죽은 펫은 대개 나중에 cb 로 온다
    const gone = P().sweep(function (late) { buried(late, quiet); });
    buried(gone, quiet);
}
function buried(gone, quiet) {
    if (!gone || !gone.length) return;
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
    const sat = P().full(id, u);
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

        + '<div style="padding:7px 0; border-top:1px solid #241f19;'
        + ' border-bottom:1px solid #241f19; margin-bottom:11px;">'
        + '<div style="font-size:10px; color:#8d8578; display:flex;'
        + ' justify-content:space-between;">'
        + '<span>포만도</span><span style="color:' + (soon ? '#e07a5f' : '#e8d7b4') + ';">'
        + sat + ' / 100</span></div>'
        + '<div style="height:7px; background:#241f19; border-radius:4px; margin:5px 0 4px 0;">'
        + '<div style="height:100%; width:' + sat + '%;'
        + ' background:linear-gradient(90deg,' + (soon ? '#7a2f1f,#e07a5f' : '#4a6a2a,#8bc34a') + ');'
        + ' border-radius:4px;"></div></div>'
        + '<div style="font-size:9.5px; color:' + (soon ? '#e07a5f' : '#6f685e') + ';">'
        + (hunger <= 0 ? '굶었습니다' : (span(hunger) + ' 뒤에 굶습니다'))
        + (soon ? ' — 먹이를 주지 않으면 죽습니다.' : '')
        + '</div></div>'

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
                    + ' margin-left:6px;">×' + F.have(f.n, u) + '</span>'
                    + '<span style="font-size:9.5px; color:#8bc34a; font-weight:normal;'
                    + ' margin-left:6px;">'
                    + (f.fill == null || f.fill >= 1 ? '포만도 가득'
                                                     : '포만도 +' + Math.round(f.fill * 100))
                    + '</span></button>';
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
    const all = Object.keys(ps).filter(function (k) { return P().BY[k]; });

    const head = '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:4px;">'
        + '🏠 내 방</div>';

    if (!all.length) {
        return head + '<div style="font-size:11px; color:#666; padding:4px 0;">'
            + '방이 비었습니다. 환몽알이 깨어나면 여기에 섭니다.</div>';
    }

    const keys = P().show(u);                 // 내놓기로 한 둘
    const rest = all.length - keys.length;

    const hungry = all.filter(function (k) {
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
        + '<div class="pet-floor" style="gap:14px;">'
        + keys.map(function (k) {
            const s = ps[k];
            const b = P().bond(k, u);
            const away = !!(s.out && s.out.till) || !!s['with'];
            return '<div class="pet-stand" id="pet-st-' + k + '" style="width:62px;"'
                + ' onclick="petBondOpen(' + k + ')" title="' + esc(P().nick(k, u)) + '">'
                + '<img class="pet-bob" src="' + P().icon(k) + '" alt=""'
                + ' style="width:50px; image-rendering:pixelated;'
                + (away ? ' opacity:.32; filter:grayscale(.7);' : '') + '">'
                + '<div style="font-size:8.5px; color:#9d9488; margin-top:1px; overflow:hidden;'
                + ' text-overflow:ellipsis; white-space:nowrap;">' + esc(P().nick(k, u)) + '</div>'
                + '<div style="font-size:7.5px; color:' + (b >= P().BOND_MAX ? '#d4af37' : '#5f594f') + ';">'
                + (away ? '자리 비움' : ('♥ ' + b)) + '</div>'
                + '</div>';
        }).join('')
        + '</div>'
        + '<div class="pet-scene" id="pet-scene-line"></div>'
        + '<div style="font-size:9px; color:#5f594f; margin-top:6px; text-align:center;">'
        + '방에는 ' + P().SHOW_MAX + '마리까지 — [🐶 펫] 칸에서 고릅니다'
        + (rest > 0 ? ' <span style="color:#4a443c;">· 나머지 ' + rest + '마리는 쉬는 중</span>' : '')
        + '</div>';
}

// ==========================================
// 장면 — 틀은 그대로 두고 글과 움직임만 갈아 끼운다
// ==========================================
function playScene() {
    const u = u_();
    const line = document.getElementById('pet-scene-line');
    if (!u || !line) return;
    const ps = P().pets(u);
    const keys = P().show(u).filter(function (k) { return ps[k]; });
    if (!keys.length) { line.textContent = ''; return; }

    const away = keys.filter(function (k) {
        const s = ps[k];
        return !!(s.out && s.out.till) || !!s['with'];
    });
    const here = keys.filter(function (k) { return away.indexOf(k) < 0; });

    // 나가 있는 펫이 있으면 장면 없이 그것만 알린다
    if (away.length) {
        const n = away.map(function (k) { return P().nick(k, u); }).join('와 ');
        line.textContent = n + P().josa(n, '은') + ' 나가 있습니다.';
        line.style.color = '#8d8578';
        here.forEach(function (k) { setMove(k, 'bob'); });
        away.forEach(function (k) { setMove(k, 'still'); });
        sceneFor = '';                        // 돌아오면 새 장면으로
        return;
    }

    const sc = sceneNow(here);
    line.textContent = sceneText(sc, here, u);
    line.style.color = sc.c;
    here.forEach(function (k, i) { setMove(k, sc.a[i] || 'bob'); });
}

function setMove(k, kind) {
    const el = document.getElementById('pet-st-' + k);
    const img = el && el.querySelector('img');
    if (!img) return;
    const cls = 'pet-' + kind;
    if (img.className === cls) return;        // 같으면 두어야 움직임이 안 끊긴다
    img.className = cls;
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
    // 글 자체를 재 둔다 — 장면이 class 를 바꾸므로 innerHTML 로 재면 늘 어긋난다
    if (el._petH !== h) { el._petH = h; el.innerHTML = h; }
    try { playScene(); } catch (e) { }
}

// 장면은 제 시계로 돈다
setInterval(function () {
    try {
        const panel = document.getElementById('house-main');
        if (!panel || !panel.classList.contains('active')) return;
        if (!document.getElementById('pet-scene-line')) return;
        playScene();
    } catch (e) { }
}, 2000);

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
    console.log('  방에 내놓은 펫:', P().show(u).map(function (k) {
        return P().nick(k, u);
    }).join(' · ') || '-', '(최대 ' + P().SHOW_MAX + '마리 · [🐶 펫] 칸에서 고릅니다)');
    console.table(keys.map(function (k) {
        const s = ps[k];
        return { 번호: k, 이름: P().nick(k, u), 방: P().showHas(k, u) ? '🏠' : '',
                 교감: P().bond(k, u) + ' / ' + P().BOND_MAX,
                 오늘남은몫: P().bondRoom(k, u),
                 포만도: P().full(k, u) + ' / 100',
                 굶기까지: span(Math.max(0, P().starveLeft(k, u))),
                 대신죽기: P().bondFull(k, u) ? ('O (' + Math.round(P().SAVE_ODDS * 100) + '%)') : '✗',
                 지금: (s.out && s.out.till) ? '탐사 중' : (s['with'] ? '동행 중' : '방') };
    }));
};

try { style(); } catch (e) { }

console.log('[펫] petRoom() · petPat(번호) · petPlay(번호)');

})();
