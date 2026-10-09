// ==========================================
// ★ 🀄 마작 — 화면 · 상담실/선녀탕 붙이기 · 정산
// bundles.json 마지막 묶음, mj-play.js · plea.js 보다 뒤 · save-merge.js 앞
// ==========================================
//
// ■ 어디에 뜨나
//
//   여우 상담실·선녀탕에 들어가면 안내 칸(#quarantine-lock-box)에
//   탄원서가 붙는다. 그 **바로 밑**에 마작 단추를 붙인다.
//   들어가자마자 끌려가는 것이 아니라, 누르면 그때 자리를 고른다.
//
// ■ 끝나면
//
//   동풍전이 끝나면 1위의 격리가 풀린다. (탄원이 받아들여졌을 때와 같은 손질 —
//   plea.js:242 과 맞춰 두었다)
//   그리고 각자 **최종 점수 − 시작 점수**만큼 포인트를 주고받는다.
//   이긴 만큼 받고 진 만큼 깎인다. 0 밑으로는 안 내려간다.
//   (MJ_PLAY.payout 을 'none' 으로 두면 포인트는 안 움직인다)
//
//   정산은 **각자 제 자리에만** 쓴다. 한 사람이 남의 포인트를 건드리지 않는다.
//   이미 받았는지는 판에 적어 두고 본다 (paid).
//
// ■ 콘솔
//   mjOpen()     자리 고르는 창을 연다
//   mjClose()    닫는다

(function mjUI() {

const BTN = 'mj-enter-btn';
const OV = 'mj-overlay';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function arr(v) {
    if (Array.isArray(v)) return v.slice();
    if (v && typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
}
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}
function inside() {
    return typeof isQuarantined === 'function' && me() && isQuarantined(me());
}
function bath() { return typeof isBathUser === 'function' && isBathUser(me()); }
function hue() { return bath() ? '#7fd4d4' : '#d4af37'; }
function G(t) { return window.mjTileGlyph(t); }

// ==========================================
// 탄원서 밑의 단추
// ==========================================
let openCount = 0;
let lastBtn = '';
function paintBtn() {
    const lock = document.getElementById('quarantine-lock-box');
    const old = document.getElementById(BTN);
    if (!lock || !inside()) { if (old) old.remove(); lastBtn = ''; return; }

    const c = hue();
    const seated = window.mjCur && window.mjCur();
    const label = seated ? '🀄 마작 — 판으로 돌아가기'
        : ('🀄 마작' + (openCount ? ' <span style="font-size:10px; color:#ffd76a;">(열린 자리 ' + openCount + ')</span>' : ''));

    const html = '<div id="' + BTN + '" style="border-top:1px dashed ' + c + '55; margin-top:14px; padding-top:13px; text-align:left;">'
        + '<div style="font-size:12px; color:' + c + '; font-weight:bold; margin-bottom:6px;">마작</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:9px; line-height:1.7;">'
        + '갇힌 사람끼리 한 판 둡니다. 동풍전이 끝나면 <b style="color:' + c + ';">1위는 바로 나갑니다.</b><br>'
        + '점수만큼 포인트를 주고받습니다.'
        + '</div>'
        + '<button class="game-btn" style="width:100%; margin:0; padding:10px; font-size:12px;'
        + ' background:linear-gradient(145deg,' + (bath() ? '#2a4a5a,#152830' : '#5a4a2a,#3a2f18') + ') !important;'
        + ' border-color:' + c + ' !important; color:' + c + ' !important;" onclick="mjOpen()">' + label + '</button>'
        + '</div>';

    const plea = document.getElementById('plea-box');
    // 탄원서가 다시 그려지면 우리 칸이 위로 올라가 있을 수 있다 — 그때는 다시 붙인다
    const misplaced = old && plea && plea.nextElementSibling !== old;
    if (old && !misplaced) {
        if (lastBtn === html) return;                 // 안 바뀌었으면 손대지 않는다
        old.outerHTML = html;
    } else {
        if (old) old.remove();
        if (plea) plea.insertAdjacentHTML('afterend', html);     // 탄원서 바로 밑
        else lock.insertAdjacentHTML('beforeend', html);
    }
    lastBtn = html;
}

// 격리 칸은 updateUI 가 다시 그린다 — 그때마다 도로 붙인다
setInterval(function () { try { paintBtn(); } catch (e) { } }, 900);
setInterval(function () {
    if (!inside() || !window.mjListTables) return;
    window.mjListTables().then(function (l) {
        const n = l.filter(function (t) { return t.state === 'WAIT'; }).length;
        if (n !== openCount) { openCount = n; paintBtn(); }
    }).catch(function () { });
}, 6000);

// ==========================================
// 창
// ==========================================
function shell(inner) {
    let el = document.getElementById(OV);
    if (!el) {
        document.body.insertAdjacentHTML('beforeend',
            '<div id="' + OV + '" class="modal-overlay" style="display:flex; z-index:9999998;">'
            + '<div class="modal-content" id="mj-body" style="max-width:420px; width:100%; max-height:88vh; overflow:auto; text-align:left;"></div></div>');
        el = document.getElementById(OV);
    }
    document.getElementById('mj-body').innerHTML = inner;
    el.style.display = 'flex';
}
window.mjClose = function () {
    const el = document.getElementById(OV);
    if (el) el.style.display = 'none';
};
window.mjOpen = function () {
    // 앉아 있던 판은 격리가 풀린 뒤에도 연다 — 1위는 끝나자마자 풀리기 때문이다
    const seated = window.mjCur && window.mjCur();
    if (seated && seated.t) { safePaint(seated.t); return; }
    if (!inside()) { showCustomAlert('상담실·선녀탕 안에서만 둘 수 있습니다.'); return; }
    lobby();
};

function lobby() {
    shell('<div style="text-align:center; padding:20px; color:#888; font-size:12px;">자리를 찾는 중…</div>');
    window.mjListTables().then(function (list) {
        const c = hue();
        const open = list.filter(function (t) { return t.state === 'WAIT'; });
        let h = '<div style="font-size:15px; color:' + c + '; font-weight:bold; margin-bottom:4px;">🀄 마작</div>'
            + '<div style="font-size:10px; color:#888; line-height:1.7; margin-bottom:14px;">'
            + '동풍전 — 사람 수만큼 국을 돕니다. 끝나면 1위가 나갑니다.<br>'
            + '2·3인은 북과 만수 2~8 을 빼고 치(吃)가 없습니다.</div>';

        h += '<div style="font-size:11px; color:#aaa; margin-bottom:6px;">열린 자리</div>';
        if (!open.length) h += '<div style="font-size:11px; color:#666; padding:10px 0;">아직 없습니다. 아래에서 만드세요.</div>';
        open.forEach(function (t) {
            const n = arr(t.seats).length;
            h += '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;'
                + ' background:rgba(0,0,0,0.25); border-radius:5px; padding:9px 11px; margin-bottom:6px;">'
                + '<div style="flex:1; min-width:0;">'
                + '<div style="font-size:12px; color:#fff; font-weight:bold;">' + t.players + '인 · ' + n + '/' + t.players + '</div>'
                + '<div style="font-size:9px; color:#999; margin-top:3px;">'
                + arr(t.seats).map(function (s) { return esc(s.name); }).join(', ') + '</div></div>'
                + '<button class="game-btn" style="margin:0; padding:7px 12px; font-size:11px;"'
                + ' onclick="mjJoinUI(\'' + t.id + '\')">앉는다</button></div>';
        });

        h += '<div style="font-size:11px; color:#aaa; margin:14px 0 6px 0;">새 자리</div>'
            + '<div style="display:flex; gap:6px;">'
            + [2, 3, 4].map(function (n) {
                return '<button class="game-btn" style="flex:1; margin:0; padding:10px; font-size:12px;"'
                    + ' onclick="mjMakeUI(' + n + ')">' + n + '인</button>';
            }).join('')
            + '</div>'
            + '<button class="btn-cancel" style="width:100%; margin-top:14px; background:#444; border-color:#555 !important;"'
            + ' onclick="mjClose()">닫는다</button>';
        shell(h);
    });
}
// 왜 안 되는지 말해 준다 — 말없이 떨어지면 「눌러도 아무 일이 없다」로 보인다
function whine(e, what) {
    const msg = (e && (e.message || e.code)) ? String(e.message || e.code) : '알 수 없는 까닭';
    console.error('[마작] ' + what, e);
    window._mjLastError = msg;
    const perm = /permission|denied/i.test(msg);
    showCustomAlert(what + '\n\n' + msg
        + (perm ? '\n\n데이터베이스 규칙이 mjTables 쓰기를 막고 있습니다.\n상담사에게 알려 주세요.' : ''));
}

// 앉은 판이 손에 들어올 때까지 기다렸다가 그린다.
// mjOnChange 하나만 믿지 않는다 — 그 길이 막히면 화면이 로비인 채로 남는다.
// 그리다 터져도 빈 화면으로 두지 않는다 — 까닭을 창에 적는다
function safePaint(t) {
    try { paint(t); return true; }
    catch (e) {
        window._mjLastError = String((e && e.message) || e);
        console.error('[마작] 판을 그리다 터졌습니다', e);
        shell('<div style="font-size:13px; color:#ff8a80; font-weight:bold; margin-bottom:8px;">🀄 판을 그리지 못했습니다</div>'
            + '<div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:12px;">'
            + esc(window._mjLastError) + '</div>'
            + btns([['자리를 뜬다', 'mjLeaveUI()', '#444'], ['닫는다', 'mjClose()', '#444']]));
        return false;
    }
}

function waitAndPaint(what, tries) {
    tries = tries || 0;
    const s = window.mjCur && window.mjCur();
    if (s && s.t) { safePaint(s.t); return; }
    if (tries >= 30) {                                   // 3초
        showCustomAlert(what + '\n\n판을 불러오지 못했습니다. 다시 한 번 눌러 주세요.'
            + (window._mjLastError ? '\n\n(' + window._mjLastError + ')' : ''));
        lobby(); return;
    }
    setTimeout(function () { waitAndPaint(what, tries + 1); }, 100);
}

function busy(msg) {
    shell('<div style="text-align:center; padding:26px 10px; color:#aaa; font-size:12px;">' + esc(msg) + '…</div>');
}

window.mjMakeUI = function (n) {
    busy('자리를 만드는 중');
    try {
        const p = window.mjMake(n);
        if (!p || typeof p.then !== 'function') { waitAndPaint('자리를 만들었습니다.'); return; }
        p.then(function (id) {
            if (!id) { showCustomAlert('자리를 만들지 못했습니다.\n\n잠시 뒤에 다시 해 주세요.'); lobby(); return; }
            waitAndPaint('자리를 만들었습니다.');
        }).catch(function (e) { whine(e, '자리를 만들지 못했습니다.'); lobby(); });
    } catch (e) { whine(e, '자리를 만들지 못했습니다.'); lobby(); }
};
window.mjJoinUI = function (id) {
    busy('앉는 중');
    try {
        window.mjJoin(id).then(function (ok) {
            if (!ok) { showCustomAlert('그 자리에는 앉을 수 없습니다.'); lobby(); return; }
            waitAndPaint('앉았습니다.');
        }).catch(function (e) { whine(e, '자리에 앉지 못했습니다.'); lobby(); });
    } catch (e) { whine(e, '자리에 앉지 못했습니다.'); lobby(); }
};

// ==========================================
// 판 화면
// ==========================================
function paint(t) {
    if (!t) { lobby(); return; }
    const u = me(); if (!u) return;
    const c = hue();

    if (t.state === 'DONE') { paintEnd(t); return; }

    const s = window.mjMy();
    if (!s) return;
    const h = s.h;

    let o = '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">'
        + '<div style="font-size:13px; color:' + c + '; font-weight:bold;">🀄 동' + t.kyoku + '국'
        + ((t.honba || 0) ? ' ' + t.honba + '본장' : '') + '</div>'
        + '<div style="font-size:10px; color:#888;">' + (h ? arr(h.wall).length : 0) + '장 남음'
        + ((t.sticks || 0) ? ' · 리치봉 ' + t.sticks : '') + '</div></div>';

    if (t.state === 'WAIT') {
        o += '<div style="font-size:12px; color:#ddd; padding:16px 0; text-align:center;">'
            + arr(t.seats).length + ' / ' + t.players + ' — 사람을 기다립니다.</div>'
            + '<div style="font-size:11px; color:#999; text-align:center; margin-bottom:14px;">'
            + arr(t.seats).map(function (x) { return esc(x.name); }).join(', ') + '</div>'
            + btns([['나간다', 'mjLeaveUI()', '#444'], ['닫는다', 'mjClose()', '#444']]);
        shell(o); return;
    }

    // 자리와 점수
    o += '<div style="display:flex; gap:5px; margin-bottom:10px;">';
    arr(t.seats).forEach(function (x, i) {
        const turn = (h && h.turn === i);
        const ri = h && h.riichi && h.riichi[x.code];
        o += '<div style="flex:1; min-width:0; text-align:center; padding:6px 3px; border-radius:5px;'
            + ' background:' + (turn ? 'rgba(212,175,55,0.18)' : 'rgba(0,0,0,0.25)') + ';'
            + ' border:1px solid ' + (turn ? c : '#333') + ';">'
            + '<div style="font-size:10px; color:' + (turn ? c : '#ccc') + '; font-weight:bold; overflow:hidden; text-overflow:ellipsis;">'
            + (turn ? '▶' : '') + esc(x.name) + '</div>'
            + '<div style="font-size:11px; color:#fff;">' + (t.scores[x.code] || 0) + '</div>'
            + (ri ? '<div style="font-size:9px; color:#ff8a65;">리치</div>' : '')
            + '</div>';
    });
    o += '</div>';

    // 도라와 내 자풍
    const di = arr(h.doraInd);
    if (di.length) {
        const n = t.players;
        const wind = [27, 28, 29, 30][((s.seat - (t.kyoku - 1)) % n + n) % n];
        o += '<div style="display:flex; align-items:center; gap:7px; margin-bottom:9px; font-size:10px; color:#888;">'
            + '<span>도라</span>'
            + '<span style="font-size:20px; line-height:1; color:#ffd76a;">'
            + di.map(function (x) { return G(window.mjDoraOf(x)); }).join('') + '</span>'
            + '<span style="margin-left:auto;">장풍 ' + window.mjTileName(27)
            + ' · 자풍 <b style="color:' + c + ';">' + window.mjTileName(wind) + '</b></span>'
            + '</div>';
    }

    // 남들이 버린 패
    arr(t.seats).forEach(function (x) {
        if (x.code === u.code) return;
        const p = arr(h.pond[x.code]);
        if (!p.length) return;
        o += '<div style="font-size:9px; color:#777; margin-bottom:2px;">' + esc(x.name) + '</div>'
            + '<div style="font-size:19px; line-height:1.25; margin-bottom:7px; word-break:break-all;">'
            + p.map(G).join('') + '</div>';
    });

    // 내가 버린 패
    const mp = arr(h.pond[u.code]);
    if (mp.length) {
        o += '<div style="font-size:9px; color:' + c + '; margin-bottom:2px;">내가 버린 것</div>'
            + '<div style="font-size:19px; line-height:1.25; margin-bottom:9px; word-break:break-all;">'
            + mp.map(G).join('') + '</div>';
    }

    // 내 울음
    if (s.melds.length) {
        o += '<div style="font-size:9px; color:#aaa; margin-bottom:2px;">울음</div>'
            + '<div style="font-size:20px; margin-bottom:7px;">'
            + s.melds.map(function (m) { return arr(m.tiles).map(G).join(''); }).join(' &nbsp; ') + '</div>';
    }

    // 내 패
    o += '<div style="border-top:1px dashed #444; margin-top:8px; padding-top:9px;">';
    const canDiscard = s.mine && s.phase === 'DISCARD';
    o += '<div style="display:flex; flex-wrap:wrap; gap:2px;">';
    s.hand.forEach(function (tile, i) {
        const isDrawn = (h.drawn === tile && i === s.hand.length - 1);
        o += '<button ' + (canDiscard ? '' : 'disabled ') + 'style="font-size:26px; line-height:1;'
            + ' padding:3px 1px; margin:0; background:' + (isDrawn ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)') + ';'
            + ' border:1px solid ' + (isDrawn ? c : '#444') + '; border-radius:4px; color:#fff;'
            + ' opacity:' + (canDiscard ? 1 : 0.55) + ';"'
            + (canDiscard ? ' onclick="mjDiscardUI(' + tile + ')"' : '') + '>' + G(tile) + '</button>';
    });
    o += '</div>';

    const sh = window.mjShanten(s.hand, s.melds.length);
    const w = window.mjWaits(s.hand, s.melds.length);
    o += '<div style="font-size:10px; color:#888; margin-top:6px;">'
        + (sh < 0 ? '<span style="color:#4CAF50;">화료</span>'
            : sh === 0 ? ('<span style="color:#ffd76a;">텐파이</span> — 기다림 ' + w.map(G).join(''))
            : (sh + '샨텐'))
        + '</div>';
    o += '</div>';

    // 단추
    const acts = [];
    if (s.mine && s.phase === 'DRAW') acts.push(['패를 가져온다', 'mjDraw()', c]);
    if (s.mine && s.phase === 'DISCARD') {
        const r = window.mjScore(window.mjWinArgs(t, h, u.code, h.drawn, true));
        if (h.drawn != null && r && r.ok) acts.push(['쯔모 — ' + r.han + '판 ' + (r.name || r.points), 'mjTsumoUI()', '#4CAF50']);
        if (!s.riichi && !s.melds.length) {
            const can = s.hand.some(function (x) {
                const a = s.hand.slice(); a.splice(a.indexOf(x), 1);
                return window.mjShanten(a, 0) === 0;
            });
            if (can && (t.scores[u.code] || 0) >= 1000) acts.push(['리치 — 버릴 패를 고르세요', 'mjRiichiArm()', '#ff8a65']);
        }
    }
    const cl = window.mjCanClaim();
    if (cl) {
        if (cl.ron) acts.push(['론 — ' + cl.ron.han + '판 ' + (cl.ron.name || cl.ron.points), 'mjRonUI()', '#4CAF50']);
        if (cl.kan) acts.push(['깡', "mjClaim('kan')", '#9fd0ff']);
        if (cl.pon) acts.push(['폰', "mjClaim('pon')", '#9fd0ff']);
        if (cl.chi) cl.chi.forEach(function (p, i) {
            acts.push(['치 ' + G(p[0]) + G(p[1]), 'mjChiUI(' + i + ')', '#9fd0ff']);
        });
        acts.push(['넘긴다', 'mjPass()', '#666']);
    }
    if (window._mjRiichiArm) {
        o += '<div style="font-size:11px; color:#ff8a65; margin-top:8px;">리치 — 버릴 패를 누르세요. '
            + '<a href="#" onclick="mjRiichiArm(0);return false;" style="color:#888;">취소</a></div>';
    }
    o += '<div style="margin-top:10px;">' + btns(acts.concat([['닫는다', 'mjClose()', '#444']])) + '</div>';

    // 지난 결과
    if (t.last) o += lastBox(t);

    shell(o);
}

function btns(list) {
    return '<div style="display:flex; flex-wrap:wrap; gap:6px;">'
        + list.map(function (b) {
            return '<button class="game-btn" style="flex:1 1 44%; margin:0; padding:10px 6px; font-size:11px;'
                + ' border-color:' + b[2] + ' !important; color:' + b[2] + ' !important;"'
                + ' onclick="' + b[1] + '">' + b[0] + '</button>';
        }).join('') + '</div>';
}

function lastBox(t) {
    const L = t.last;
    if (!L) return '';
    if (L.kind === 'draw') {
        return '<div style="margin-top:12px; padding:9px 11px; background:rgba(0,0,0,0.3); border-radius:5px; font-size:10px; color:#aaa;">'
            + '지난 국 — 유국. 텐파이 ' + (L.ten || []).length + '명</div>';
    }
    const who = L.winner;
    const name = (arr(t.seats).filter(function (s) { return s.code === who; })[0] || {}).name || '?';
    return '<div style="margin-top:12px; padding:9px 11px; background:rgba(76,175,80,0.1); border:1px solid #2e7d32; border-radius:5px; font-size:10px; color:#ddd; line-height:1.7;">'
        + '지난 국 — <b>' + esc(name) + '</b> ' + (L.loser ? '론' : '쯔모') + ' · '
        + L.han + '판 ' + L.fu + '부 ' + (L.name ? L.name + ' ' : '') + L.points.toLocaleString() + '점<br>'
        + '<span style="color:#999;">' + (L.yaku || []).map(function (y) { return y.n; }).join(' · ') + '</span></div>';
}

// ==========================================
// 끝 — 1위가 나간다
// ==========================================
function paintEnd(t) {
    const u = me(); const c = hue();
    const rank = arr(t.result && t.result.rank);
    const first = rank[0];
    const iWon = first && first.code === u.code;

    let o = '<div style="font-size:15px; color:' + c + '; font-weight:bold; margin-bottom:12px;">🀄 끝났습니다</div>';
    rank.forEach(function (x, i) {
        const diff = x.score - (t.result.start || 25000);
        o += '<div style="display:flex; justify-content:space-between; align-items:center;'
            + ' padding:9px 11px; margin-bottom:5px; border-radius:5px;'
            + ' background:' + (i === 0 ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.25)') + ';'
            + ' border:1px solid ' + (i === 0 ? c : '#333') + ';">'
            + '<div style="font-size:12px; color:' + (i === 0 ? c : '#ddd') + '; font-weight:bold;">'
            + (i + 1) + '위 ' + esc(x.name) + (i === 0 ? ' 🚪' : '') + '</div>'
            + '<div style="font-size:12px; color:#fff;">' + x.score.toLocaleString()
            + ' <span style="font-size:10px; color:' + (diff >= 0 ? '#4CAF50' : '#f44336') + ';">'
            + (diff >= 0 ? '+' : '') + diff.toLocaleString() + '</span></div></div>';
    });
    o += '<div style="font-size:11px; color:' + (iWon ? '#4CAF50' : '#888') + '; margin:12px 0; line-height:1.8;">'
        + (iWon ? '1위입니다. 격리가 풀렸습니다. 나가셔도 좋습니다.' : '1위가 나갔습니다. 다음 판을 기다리거나 새로 여세요.')
        + '</div>';
    o += btns([['자리를 뜬다', 'mjLeaveUI()', '#444'], ['닫는다', 'mjClose()', '#444']]);
    shell(o);
}

window.mjLeaveUI = function () { window.mjLeave().then(function () { window.mjClose(); }); };
window.mjDiscardUI = function (tile) {
    if (window._mjRiichiArm) { window._mjRiichiArm = false; window.mjRiichi(tile); return; }
    window.mjDiscard(tile);
};
window.mjRiichiArm = function (v) { window._mjRiichiArm = (v === 0) ? false : true; repaint(); };
window.mjTsumoUI = function () { window.mjTsumo(); };
window.mjRonUI = function () { window.mjClaim('ron'); };
window.mjChiUI = function (i) {
    const c = window.mjCanClaim();
    if (c && c.chi && c.chi[i]) window.mjClaim('chi', c.chi[i]);
};

function repaint() {
    const s = window.mjCur && window.mjCur();
    const el = document.getElementById(OV);
    if (el && el.style.display !== 'none') safePaint(s && s.t);
}
let shownEnd = '';
window.mjOnChange = function (t) {
    try {
        paintBtn();
        const el = document.getElementById(OV);
        if (el && el.style.display !== 'none') safePaint(t);
        if (!t || t.state !== 'DONE') { shownEnd = ''; return; }
        // 끝난 판은 창이 닫혀 있어도 한 번 띄운다 (정산보다 먼저 — 1위는 곧 격리가 풀린다)
        if (shownEnd !== t.id && arr(t.result && t.result.rank).length) { shownEnd = t.id; paintEnd(t); }
        settle(t);
    } catch (e) { console.warn('[마작] 화면', e); }
};

// ==========================================
// 정산 — 각자 제 자리에만 쓴다
// ==========================================
let settling = false;
function settle(t) {
    const u = me();
    if (!u || settling) return;
    if (!t.result || !arr(t.result.rank).length) return;
    if (t.paid && t.paid[u.code]) return;
    const rank = arr(t.result.rank);
    const mine = rank.filter(function (x) { return x.code === u.code; })[0];
    if (!mine) return;
    settling = true;

    const start = t.result.start || 25000;
    const diff = mine.score - start;
    const first = (rank[0] && rank[0].code === u.code);
    const f = {};

    if (window.MJ_PLAY.payout === 'diff' && diff !== 0) {
        const before = Number(u.points) || 0;
        u.points = Math.max(0, before + diff);
        f.points = 1;
    }
    if (first && typeof isQuarantined === 'function' && isQuarantined(u)) {
        const exitPoll = Number(u.quarantineExitPollution) || 0;    // 지우기 전에 먼저 챙긴다
        u.quarantineUntil = 0;
        u.quarantineExitPollution = 0;
        u.quarantineHospital = false;
        u.pollution = exitPoll;
        u.lastPollutionTime = Date.now();
        u.foxRoomAnswered = false;
        if (u.badge && u.badge.notes) {
            const keep = String(u.badge.notes).split(' | ')
                .filter(function (n) { return n.trim() && !/의식 불명|긴급 이송|사직 반려/.test(n); });
            u.badge.notes = keep.length ? keep.join(' | ') : '특이사항 없음';
            f.badge = 1;
        }
        f.quarantineUntil = 1; f.quarantineExitPollution = 1; f.quarantineHospital = 1;
        f.pollution = 1; f.lastPollutionTime = 1; f.foxRoomAnswered = 1;
    }
    if (typeof addHistoryLog === 'function') {
        addHistoryLog(u, '[마작] 동풍전 ' + (rank.indexOf(mine) + 1) + '위 · '
            + mine.score.toLocaleString() + '점 (' + (diff >= 0 ? '+' : '') + diff.toLocaleString() + ')'
            + (first ? ' — 1위로 격리 해제' : ''));
        f.history = 1;
    }
    try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { }
    try { if (typeof updateUI === 'function') updateUI(); } catch (e) { }

    // 받았다고 적어 둔다
    try {
        if (typeof database !== 'undefined' && database) {
            database.ref('mjTables/' + t.id + '/paid/' + u.code).set(true);
        }
    } catch (e) { }

    setTimeout(function () {
        showCustomAlert('🀄 동풍전이 끝났습니다.\n\n'
            + (rank.indexOf(mine) + 1) + '위 · ' + mine.score.toLocaleString() + '점\n'
            + (window.MJ_PLAY.payout === 'diff'
                ? ((diff >= 0 ? '+' : '') + diff.toLocaleString() + ' P\n') : '')
            + (first ? '\n1위입니다. 격리가 풀렸습니다.' : ''));
        settling = false;
    }, 500);
}

console.log('[마작] 화면 — mjOpen()');

})();
