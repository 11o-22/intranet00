// ==========================================
// ★ 펫 — 사택에서 알 돌보기 · 부화
// bundles.json 마지막 묶음, pet-data.js 보다 뒤
// ==========================================
//
// ■ 어디에 붙나
//
//   사택 첫 칸(renderHouse → #house-main-body) 맨 아래에 알 칸을 붙인다.
//   사택 등급은 보지 않는다 — D 든 L 이든 똑같이 품을 수 있다.
//
// ■ 돌보는 법
//
//   알마다 「쓸 것」이 두세 가지, 가짓수마다 두세 번, 통틀어 다섯~열 번.
//   한 번 대고 나면 10분 뒤에 다시 댈 수 있다.
//
//   알에 적힌 주의 문구를 어기는 표식(💧🔥❄🔔🌸)을 대면 **그 자리에서
//   상한다.** 상한 알에서는 괴물이 나오고, 하루 동안 몸에 자국이 남는다.
//
//   쓸 것을 다 대면 그 자리에서 깨어난다. 주의 문구가 가리키는 네 마리
//   가운데 하나다 — 아직 없는 것을 먼저 준다.
//
// ■ 콘솔
//   petEggNow()        지금 알이 어떤가
//   petEggForce()      상담사 — 바로 깨운다
//
(function petHatch() {

const BOX = 'pet-house-box';
const MOD = 'pet-hatch-modal';

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

// ==========================================
// 창
// ==========================================
function shut() { const m = document.getElementById(MOD); if (m) m.remove(); }
function box(html, wide) {
    shut();
    const w = document.createElement('div');
    w.id = MOD;
    w.style.cssText = 'position:fixed; inset:0; z-index:999991; display:flex;'
        + ' align-items:center; justify-content:center; background:rgba(0,0,0,0.84); padding:14px;';
    w.innerHTML = '<div style="background:linear-gradient(145deg,#171410,#0d0b09);'
        + ' border:1px solid #c08a3e; border-radius:10px; padding:15px; width:100%;'
        + ' max-width:' + (wide ? 420 : 360) + 'px; max-height:86dvh; overflow-y:auto;'
        + ' -webkit-overflow-scrolling:touch; box-shadow:0 6px 24px rgba(0,0,0,0.75);">'
        + html + '</div>';
    document.body.appendChild(w);
    return w;
}
const BTN = 'width:100%; margin:0 0 7px 0; padding:11px; font-size:12px;';
const GREY = ' background:#2a2a2a !important; border-color:#444 !important; color:#aaa !important;';

// ==========================================
// 대어 주기
// ==========================================
function gapLeft(e) {
    return Math.max(0, (Number(e.last) || 0) + P().GAP - P().now());
}

window.petCareUse = function (name) {
    const u = u_();
    const e = P().egg(u);
    if (!u || !e) return;
    if (e.ruin) { alert_('이미 상한 알입니다.\n치우고 새 알을 가져오십시오.'); return; }
    if (!P().bagHas(name, u)) { alert_('그 물품이 없습니다.'); return; }

    const left = gapLeft(e);
    if (left > 0) {
        alert_('아직 이릅니다.\n\n' + mins(left) + '분 뒤에 다시 대어 주십시오.');
        return;
    }

    const it = P().CARE_BY[name];
    if (!it) return;
    const bad = P().WARN[e.warn].bad;
    const need = (e.need || {})[name] || 0;
    const did = (e.done || {})[name] || 0;

    if (it.tag !== bad && !(need && did < need)) {
        alert_('이 알은 그것을 바라지 않습니다.\n\n「' + esc(P().WARN[e.warn].n) + '」');
        return;
    }

    P().bagAdd(name, -1);

    if (it.tag === bad) { ruin(e, name); return; }

    if (!e.done || typeof e.done !== 'object') e.done = {};
    e.done[name] = did + 1;
    e.last = P().now();
    P().eggSave();

    if (P().done(e)) { hatch(e); return; }

    const s = P().step(e);
    paint();
    shut();
    alert_(name + P().josa(name, '을') + ' 대어 주었습니다.\n\n' + s.now + ' / ' + s.all + '번\n'
        + '다음은 10분 뒤입니다.');
};

// ==========================================
// 상한다
// ==========================================
function ruin(e, name) {
    const u = u_();
    const R = P().RUIN[e.warn];
    e.ruin = R.n;
    e.last = P().now();

    const f = { petEgg: 1 };
    if (R.poll) {
        u.pollution = Math.min(100, (Number(u.pollution) || 0) + R.poll);
        f.pollution = 1;
    }
    if (R.sat) {
        u.satiety = Math.max(0, (u.satiety != null ? Number(u.satiety) : 100) - R.sat);
        f.satiety = 1;
    }
    try {
        if (typeof addTimedEffect === 'function') addTimedEffect(u, R.eff[0], R.eff[1], R.hrs);
    } catch (er) { }
    try {
        if (typeof ibAdd === 'function') ibAdd(u, R.buf[0], R.buf[1], R.hrs * 3600 * 1000, '상한 알');
    } catch (er) { }

    log_('[환몽알] ' + name + P().josa(name, '을') + ' 대어 알이 상했습니다 — ' + R.n);
    P().save(f);
    P().eggSave();
    ui();
    paint();

    box('<div style="font-size:13px; color:#e07a5f; font-weight:bold; margin-bottom:9px;">알이 상했습니다</div>'
        + '<div style="text-align:center; background:rgba(0,0,0,0.42); border:1px solid #3a3025;'
        + ' border-radius:8px; padding:12px; margin-bottom:11px;">'
        + '<img src="pet/egg3.webp" alt="" style="width:76px; image-rendering:pixelated;'
        + ' filter:grayscale(1) brightness(0.55);"></div>'
        + '<div style="font-size:11px; color:#b8ac97; line-height:1.6; margin-bottom:10px;">'
        + esc(R.say) + '</div>'
        + '<div style="font-size:11px; color:#e8d7b4; margin-bottom:4px;">— ' + esc(R.n) + '</div>'
        + '<div style="font-size:10px; color:#8d8578; line-height:1.6; margin-bottom:11px;">'
        + '적힌 줄: 「' + esc(P().WARN[e.warn].n) + '」<br>'
        + '댄 것: ' + esc(name) + ' <span style="color:#e07a5f;">'
        + esc(P().TAGS[P().CARE_BY[name].tag]) + '</span></div>'
        + '<div style="font-size:10px; color:#e07a5f; line-height:1.7; border-top:1px solid #2a241c;'
        + ' padding-top:9px; margin-bottom:11px;">'
        + '[' + esc(R.eff[0]) + '] ' + esc(R.eff[1]) + ' (' + R.hrs + '시간)'
        + (R.poll ? '<br>오염도 +' + R.poll + '%' : '')
        + (R.sat ? '<br>포만감 −' + R.sat : '')
        + '</div>'
        + '<button id="ph-x" class="game-btn" style="' + BTN + GREY + '">닫는다</button>')
        .querySelector('#ph-x').onclick = shut;
}

window.petEggClear = function () {
    const u = u_();
    const e = P().egg(u);
    if (!u || !e) return;
    if (!e.ruin) { alert_('아직 상하지 않았습니다.'); return; }
    u.petEgg = null;
    log_('[환몽알] 상한 알을 치웠습니다.');
    P().eggSave();
    shut();
    paint();
    alert_('치웠습니다.\n\n다음 알은 망상 홈쇼핑에서 가져오실 수 있습니다.');
};

// ==========================================
// 깨어난다
// ==========================================
function hatch(e) {
    const u = u_();
    const p = P().pick(e.warn, u);
    const key = String(p.i);
    const now = P().now();

    // 그 묶음 넷을 다 가지고 있으면 겹쳐서 나온다 — 그때는 값을 돌려준다
    if (P().has(p.i, u)) { dup(p); return; }

    const rec = { g: 'D', at: now, fedAt: now, bond: 0 };

    P().pets(u)[key] = rec;
    u.petEgg = null;

    let wrote = false;
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            const up = { petEgg: null };
            up['pets/' + key] = rec;
            database.ref('users/' + u.code).update(up)
                .catch(function (er) { console.warn('[펫] 부화 저장 실패', er); });
            wrote = true;
        }
    } catch (er) { }
    if (!wrote) P().save({ pets: 1, petEgg: 1, petEggAt: 1 });

    log_('[환몽알] ' + p.n + P().josa(p.n, '이') + ' 깨어났습니다.');
    P().save({ history: 1 });
    ui();
    paint();
    reveal(p);
}

// 이미 있는 펫이 또 나왔다 — 데려가지 않고 값을 돌려준다
function dup(p) {
    const u = u_();
    const back = P().DUP_BACK;
    const cap = (typeof POINT_CAP !== 'undefined') ? POINT_CAP : 30000000;

    u.petEgg = null;
    u.points = Math.max(0, Math.min(cap, (Number(u.points) || 0) + back));

    log_('[환몽알] ' + p.n + P().josa(p.n, '이') + ' 또 나왔습니다 — 돌려받음 (+'
        + back.toLocaleString() + ' P)');
    P().save({ points: 1, history: 1 });
    P().eggSave();
    try { if (typeof showPointGainEffect === 'function') showPointGainEffect(back); } catch (e) { }
    ui();
    paint();

    const nick = P().nick(p.i, u);
    box('<div style="font-size:10px; color:#8d8578; text-align:center;">껍질이 갈라집니다</div>'
        + '<div style="font-size:15px; color:#9fd8ef; font-weight:bold; text-align:center;'
        + ' margin:4px 0 11px 0;">' + esc(p.n) + '</div>'
        + '<div style="text-align:center; background:rgba(0,0,0,0.42); border:1px solid #3a3025;'
        + ' border-radius:8px; padding:12px; margin-bottom:11px;">'
        + '<img src="' + P().img(p.i) + '" alt="" style="max-width:100%; max-height:190px;'
        + ' filter:grayscale(0.55) brightness(0.8);"></div>'
        + '<div style="font-size:11px; color:#b8ac97; line-height:1.6; margin-bottom:11px;">'
        + '같은 것이 또 나왔습니다. 방에 이미 '
        + (P().named(p.i, u) ? ('「' + esc(nick) + '」') : esc(p.n)) + P().josa(P().named(p.i, u) ? nick : p.n, '이')
        + ' 있습니다.<br>데려가지 않기로 하고, 값의 일부를 돌려받았습니다.</div>'
        + '<div style="font-size:11px; color:#d4af37; text-align:center; border-top:1px solid #2a241c;'
        + ' padding-top:10px; margin-bottom:12px;">+ ' + back.toLocaleString() + ' P</div>'
        + '<button id="ph-x" class="game-btn" style="' + BTN + GREY + '">닫는다</button>', true)
        .querySelector('#ph-x').onclick = shut;
}

function reveal(p) {
    const max = P().NICK_MAX;
    const w = box(
        '<div style="font-size:10px; color:#8d8578; text-align:center;">껍질이 갈라집니다</div>'
        + '<div style="font-size:15px; color:#ffcf8f; font-weight:bold; text-align:center;'
        + ' margin:4px 0 11px 0;">' + esc(p.n) + '</div>'
        + '<div style="text-align:center; background:rgba(0,0,0,0.42); border:1px solid #3a3025;'
        + ' border-radius:8px; padding:12px; margin-bottom:11px;">'
        + '<img src="' + P().img(p.i) + '" alt="" style="max-width:100%; max-height:200px;"></div>'
        + '<div style="font-size:11px; color:#b8ac97; line-height:1.6; margin-bottom:11px;">'
        + esc(p.d) + '</div>'
        + '<div style="font-size:10px; color:#8d8578; line-height:1.7; border-top:1px solid #2a241c;'
        + ' border-bottom:1px solid #2a241c; padding:8px 0; margin-bottom:12px;">'
        + 'D 등급으로 깨어났습니다 (최고 S)<br>'
        + '능력치는 B 등급부터 생깁니다 — ' + esc(P().statText(p.st)) + '</div>'

        + '<div style="font-size:11px; color:#e8d7b4; margin-bottom:5px;">이름을 붙여 주시겠습니까</div>'
        + '<input id="ph-in" type="text" maxlength="' + max + '" inputmode="text"'
        + ' autocapitalize="off" autocorrect="off" spellcheck="false"'
        + ' placeholder="' + esc(p.n) + '" style="width:100%; padding:10px; font-size:13px;'
        + ' margin-bottom:10px;">'
        + '<button id="ph-ok" class="game-btn" style="' + BTN + '">이 이름으로 부른다</button>'
        + '<button id="ph-skip" class="game-btn" style="' + BTN + GREY + '">그냥 ' + esc(p.n) + P().josa(p.n, '로') + '</button>', true);

    const f = w.querySelector('#ph-in');
    setTimeout(function () { try { f.focus(); } catch (e) { } }, 120);
    w.querySelector('#ph-skip').onclick = shut;
    w.querySelector('#ph-ok').onclick = function () {
        const v = String(f.value || '').trim();
        if (!v) { shut(); return; }
        const r = P().rename(p.i, v);
        if (!r.ok) { alert_(r.why); return; }
        shut();
        alert_('「' + r.name + '」' + P().josa(r.name, '라고') + ' 부르기로 했습니다.');
    };
}

// ==========================================
// 주머니에서 고르기
// ==========================================
window.petCarePick = function () {
    const u = u_();
    const e = P().egg(u);
    if (!u || !e || e.ruin) return;
    const bag = P().bag(u);
    const tags = P().WARN_KEYS.concat(['']);

    const rows = tags.map(function (t) {
        const list = P().CARE.filter(function (x) {
            return x[1] === t && (Number(bag[x[0]]) || 0) > 0;
        });
        if (!list.length) return '';
        return '<div style="font-size:10px; color:#8d8578; margin:9px 0 4px 0;">'
            + esc(P().TAGS[t]) + '</div>'
            + list.map(function (x) {
                const n = x[0];
                const need = (e.need || {})[n] || 0;
                const did = (e.done || {})[n] || 0;
                const want = need && did < need;
                return '<div style="display:flex; justify-content:space-between; align-items:center;'
                    + ' gap:7px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.05);">'
                    + '<div style="flex:1; min-width:0;">'
                    + '<span style="font-size:11px; color:' + (want ? '#9fd8ef' : '#bbb') + ';">'
                    + esc(n) + '</span>'
                    + '<span style="font-size:10px; color:#777; margin-left:5px;">×' + bag[n] + '</span>'
                    + (want ? '<span style="font-size:9.5px; color:#9fd8ef; margin-left:5px;">'
                        + did + '/' + need + '</span>' : '')
                    + '</div>'
                    + '<button class="game-btn ph-use" data-n="' + esc(n) + '"'
                    + ' style="flex:0 0 auto; margin:0; padding:7px 13px; font-size:11px;">댄다</button>'
                    + '</div>';
            }).join('');
    }).join('');

    const left = gapLeft(e);
    const w = box(
        '<div style="font-size:12px; color:#ffcf8f; font-weight:bold; margin-bottom:4px;">알에 대어 준다</div>'
        + '<div style="font-size:10px; color:#8d8578; margin-bottom:9px; line-height:1.6;">'
        + '적힌 줄 — 「' + esc(P().WARN[e.warn].n) + '」<br>'
        + (left > 0
            ? '<span style="color:#c9a227;">' + mins(left) + '분 뒤에 다시 댈 수 있습니다.</span>'
            : '지금 하나 댈 수 있습니다.') + '</div>'
        + (rows || '<div style="font-size:11px; color:#666; padding:14px 0; text-align:center;">'
            + '주머니가 비었습니다.<br>망상 홈쇼핑에서 돌봄 물품을 가져오십시오.</div>')
        + '<button id="ph-x" class="game-btn" style="' + BTN + GREY + ' margin-top:11px;">닫는다</button>');

    w.querySelector('#ph-x').onclick = shut;
    Array.prototype.forEach.call(w.querySelectorAll('.ph-use'), function (b) {
        b.onclick = function () { window.petCareUse(b.getAttribute('data-n')); };
    });
};

// ==========================================
// 사택 칸
// ==========================================
function html() {
    const u = u_();
    const e = P().egg(u);
    const head = '<div style="font-size:11px; color:#d4af37; font-weight:bold; margin-bottom:7px;">'
        + '🥚 환몽알</div>';

    if (!e) {
        return head + '<div style="font-size:11px; color:#888; line-height:1.7;">'
            + '품고 있는 알이 없습니다.<br>'
            + '<span style="font-size:10px; color:#777;">'
            + '망상 홈쇼핑에서 환몽알을 가져오면 여기서 돌볼 수 있습니다.</span></div>';
    }

    if (e.ruin) {
        return head
            + '<div style="display:flex; gap:11px; align-items:center;">'
            + '<img src="pet/egg3.webp" alt="" style="width:46px; image-rendering:pixelated;'
            + ' filter:grayscale(1) brightness(0.55);">'
            + '<div style="flex:1; min-width:0;">'
            + '<div style="font-size:11px; color:#e07a5f;">상했습니다 — ' + esc(e.ruin) + '</div>'
            + '<div style="font-size:10px; color:#777; margin-top:3px;">'
            + '치우기 전에는 다음 알을 가져올 수 없습니다.</div></div></div>'
            + '<button class="game-btn" onclick="petEggClear()"'
            + ' style="width:100%; margin:9px 0 0 0; padding:9px; font-size:11px;">치운다</button>';
    }

    const s = P().step(e);
    const left = gapLeft(e);
    const need = Object.keys(e.need || {}).map(function (n) {
        const did = (e.done || {})[n] || 0, want = e.need[n];
        const ok = did >= want;
        return '<span style="color:' + (ok ? '#6f8f5e' : '#e8d7b4') + ';">'
            + (ok ? '✓ ' : '') + esc(n) + ' ' + did + '/' + want + '</span>';
    }).join('<span style="color:#443e35;"> · </span>');

    return head
        + '<div style="display:flex; gap:11px; align-items:flex-start;">'
        + '<img src="' + P().eggImg(e) + '" alt="" style="width:46px; image-rendering:pixelated;">'
        + '<div style="flex:1; min-width:0;">'
        + '<div style="font-size:11px; color:#e8d7b4;">「' + esc(P().WARN[e.warn].n) + '」</div>'
        + '<div style="font-size:10px; color:#8d8578; margin-top:3px;">'
        + s.now + ' / ' + s.all + '번 돌봤습니다</div>'
        + '<div style="height:5px; background:#241f19; border-radius:3px; margin:5px 0;">'
        + '<div style="height:100%; width:' + (s.all ? Math.round(s.now / s.all * 100) : 0) + '%;'
        + ' background:linear-gradient(90deg,#8a6a2a,#d4af37); border-radius:3px;"></div></div>'
        + '<div style="font-size:9.5px; line-height:1.7;">' + need + '</div>'
        + '</div></div>'
        + '<button class="game-btn" onclick="petCarePick()"'
        + ' style="width:100%; margin:9px 0 0 0; padding:9px; font-size:11px;'
        + (left > 0 ? ' opacity:.55;' : '') + '">'
        + (left > 0 ? mins(left) + '분 뒤에 댈 수 있습니다' : '대어 준다') + '</button>';
}

function paint() {
    const host = document.getElementById('house-main-body');
    if (!host || !u_()) return;
    let el = document.getElementById(BOX);
    if (!el) {
        el = document.createElement('div');
        el.id = BOX;
        el.style.cssText = 'background:rgba(212,175,55,0.06); border:1px solid #4a3a26;'
            + ' border-radius:6px; padding:12px; margin-top:14px;';
        host.appendChild(el);
    }
    const h = html();
    if (el.innerHTML !== h) el.innerHTML = h;
}

(function hookRender() {
    const iv = setInterval(function () {
        if (typeof renderHouse !== 'function') return;
        if (renderHouse._pet) { clearInterval(iv); return; }
        const _r = renderHouse;
        const w = function () {
            const out = _r.apply(this, arguments);
            try { paint(); } catch (e) { console.warn('[펫]', e); }
            return out;
        };
        w._pet = true;
        renderHouse = w;
        window.renderHouse = w;
        clearInterval(iv);
        console.log('[펫] 사택 알 칸 연결');
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// 남은 시간이 줄어드는 것을 보여 준다
setInterval(function () {
    try {
        const panel = document.getElementById('house-main');
        if (!panel || !panel.classList.contains('active')) return;
        if (!u_()) return;
        paint();
    } catch (e) { }
}, 5000);

// ==========================================
// 확인
// ==========================================
window.petEggNow = function () {
    const u = u_();
    const e = P().egg(u);
    console.log('%c===== 환몽알 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    if (!e) { console.log('  품은 알이 없습니다.'); return; }
    const s = P().step(e);
    console.log('  적힌 줄 :', P().WARN[e.warn].n, '· 쓰면 안 되는 것', P().TAGS[P().WARN[e.warn].bad]);
    console.log('  돌봄    :', s.now + ' / ' + s.all + '번', e.ruin ? ('✗ 상함 — ' + e.ruin) : '');
    console.log('  쓸 것   :', Object.keys(e.need).map(function (k) {
        return k + ' ' + ((e.done || {})[k] || 0) + '/' + e.need[k];
    }).join(' · '));
    const left = gapLeft(e);
    console.log('  다음    :', left > 0 ? (mins(left) + '분 뒤') : '지금 댈 수 있습니다');
    console.log('  깨어날 것:', P().LIST.filter(function (p) { return p.w === e.warn; })
        .map(function (p) { return p.n + (P().has(p.i, u) ? '(있음)' : ''); }).join(' · '));
};

window.petEggForce = function () {
    const u = u_();
    const e = P().egg(u);
    if (!u || u.code !== 'kario0987') { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (!e) { console.warn('품은 알이 없습니다.'); return; }
    Object.keys(e.need).forEach(function (k) { e.done[k] = e.need[k]; });
    hatch(e);
};

console.log('[펫] petEggNow()');

})();
