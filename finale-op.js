// ==========================================
// ★ 피날레 — 오프닝 · 로비 합류 (0차 · 1차 · 2차)
// bundles.json 마지막 묶음 — finale-core.js 다음
// ==========================================
//
//   오프닝 장면 01~09 · 시스템 설명 → 로비 0차
//   합류마다: 명찰 NPC (1 · 2차) → 대기실(공용 보관함 · 동행 NPC 정산) → 모두 「다음 탐사를 준비한다」
//            → 장소 선택 (들어갈 수 있는 부스만 · 출구 함정) → 모두 고르면 흩어진다 (2차 뒤에는 연회 입장)

(function finaleOp() {
'use strict';
const X = window.FINX;
if (!X) return;
const SC = X.SC, LIVE = X.LIVE, AUTO = X.AUTO;
const sec = X.sec, opt = X.opt, x = X.x, esc = X.esc;

function F() { return X.F(); }
function S() { return X.S(); }

// ==========================================
// 오프닝
// ==========================================
const OP_NEXT_LABEL = { 1: '일어난다.', 2: '주변을 살핀다.', 3: '계속 간다.', 4: '계속 간다.', 5: '대강당을 나선다.', 7: '상품권 교환소로 향한다.' };

SC.op = function (sc) {
    const n = sc.n || 1;
    const node = sec('op', '장면 0' + n);
    const ui = X.UI();
    let extra = '';
    if (n === 6) {
        extra = X.notes(['「행사 안내 책자」를 획득했습니다.']);
        extra += ui.b('행사 안내 책자를 확인한다.', function () { X.go({ id: 'op6b' }); });
    } else if (n === 8) {
        [['nail', 0], ['ear', 1], ['eye', 2]].forEach(function (p) {
            extra += ui.b(node.o[p[1]].l, function () { sell(p[0]); });
        });
    } else if (n === 9) {
        extra += ui.b('물건의 용도를 물어본다.', function () { X.go({ id: 'op9a' }); });
        extra += ui.b('거래를 약속한다.', function () { deal('yes'); });
        extra += ui.b('거절하고 떠난다.', function () { deal('no'); });
    } else {
        extra += ui.b(OP_NEXT_LABEL[n] || '계속 간다.', function () {
            const f = F();
            if (n === 5 && !f.gotBook) { f.gotBook = 1; X.invAdd('행사 안내 책자'); }
            X.go({ id: 'op', n: n + 1 });
        });
    }
    X.draw(ui, '오프닝 — 장면 0' + n, x(node), extra);
};

SC.op6b = function () {
    const ui = X.UI();
    X.draw(ui, '오프닝 — 행사 안내 책자', x(opt(sec('op', '장면 06'), '행사 안내 책자를 확인한다')),
        ui.b('계속 간다.', function () { X.go({ id: 'op', n: 7 }); }));
};

const BODY = { nail: { t: 3, m: 0, n: '양손의 손톱 열 개' }, ear: { t: 6, m: -1, n: '왼쪽 귀' }, eye: { t: 9, m: -2, n: '왼쪽 눈' } };
function sell(k) {
    const f = F();
    if (f.body) { X.go({ id: 'op8r', k: f.body }); return; }
    f.body = k;
    f.tix = (f.tix || 0) + BODY[k].t;
    const d = X.gam(20, '신체 판매');
    darkRun.log.push('[교환소] ' + BODY[k].n + ' → 상품권 ' + BODY[k].t + '장');
    X.go({ id: 'op8r', k: k, d: d });
}
SC.op8r = function (sc) {
    const node = sec('op', '장면 08');
    const i = ['nail', 'ear', 'eye'].indexOf(sc.k);
    const b = BODY[sc.k];
    const ui = X.UI();
    X.draw(ui, '오프닝 — 상품권 교환소', x(X.optAt(node, i)),
        X.notes(['상품권 <b>' + b.t + '장</b>을 받았습니다.', X.gamNote(sc.d || 20),
            b.m ? '전투 · 위기 판정 <b style="color:#ff8a80;">' + b.m + '</b> (탐사가 끝날 때까지)' : '판정 보정 변화 없음'])
        + ui.b('계속 간다.', function () {
            const f = F();
            if (!f.deal) f.deal = { want: X.pick(X.SWEET), st: 'offer' };
            X.go({ id: 'op', n: 9 });
        }));
};

SC.op9a = function () {
    const ui = X.UI();
    X.draw(ui, '오프닝 — 장면 09', x(opt(sec('op', '장면 09'), '물건의 용도를 물어본다')),
        ui.b('거래를 약속한다.', function () { deal('yes'); }) + ui.b('거절하고 떠난다.', function () { deal('no'); }));
};
function deal(a) {
    const f = F();
    if (!f.deal) f.deal = { want: X.pick(X.SWEET), st: 'offer' };
    f.deal.st = a;
    darkRun.log.push('[명찰 상인] ' + (a === 'yes' ? '거래 약속' : '거절') + ' — 요구 물품 ' + f.deal.want);
    X.go({ id: 'op9r', a: a });
}
SC.op9r = function (sc) {
    const ui = X.UI();
    const node = opt(sec('op', '장면 09'), sc.a === 'yes' ? '거래를 약속한다' : '거절하고 떠난다');
    X.draw(ui, '오프닝 — 장면 09', x(node), ui.b('계속 간다.', function () { X.go({ id: 'sys' }); }));
};

SC.sys = function () {
    const ui = X.UI();
    X.draw(ui, '시스템 설명', x(sec('op', '시스템 설명')), ui.b('계속 간다.', function () { toLobby(0); }));
};

// ==========================================
// 로비
// ==========================================
function toLobby(k) {
    const f = F();
    f.ph = 'l' + k;
    X.pub('pl/' + X.me() + '/ph', f.ph);
    X.pub('pl/' + X.me() + '/where', null);
    if (k >= 1 && f.deal && f.deal.st !== 'done') X.go({ id: 'lobTag', k: k });
    else X.go({ id: 'lobWait', k: k });
}
X.toLobby = toLobby;

// --- 명찰 NPC (1차 · 2차) ---
function tagNode() {
    const f = F();
    return f.lastBooth === 'be' ? sec('be', '마무리 05') : sec('sw', '고정 장면 3');
}
SC.lobTag = function (sc) {
    const f = F();
    const node = tagNode();
    const want = f.deal.want;
    const have = X.invHas(want) || X.storeHas(want);
    const ui = X.UI();
    X.draw(ui, (sc.k === 1 ? '1차' : '2차') + ' 합류 — 명찰 상인', x(node),
        ui.b('물건을 건네고 명찰을 받는다.', function () { giveWant(sc.k); },
            { dis: !have, sub: have ? (X.invHas(want) ? '개인 소지품에서 건넵니다.' : '공용 보관함에서 꺼내 건넵니다.') : '요구 물품이 없습니다.' })
        + ui.b('아직 구하지 못했다고 말한다.', function () { tagRes(sc.k, 'not'); })
        + ui.b('거래를 거절한다.', function () { tagRes(sc.k, 'refuse'); }));
};
function giveWant(k) {
    const f = F();
    const want = f.deal.want;
    const done = function () {
        X.invAdd('이름 없는 명찰');
        f.deal.st = 'done';
        darkRun.log.push('[명찰 상인] ' + want + ' → 이름 없는 명찰');
        try { sendPartyChat('[SYSTEM] 누군가 「이름 없는 명찰」을 획득했습니다.', true); } catch (e) { }
        X.go({ id: 'lobTagR', k: k, a: 'give' });
    };
    if (X.invDel(want)) { done(); return; }
    X.storeTake(want).then(function (ok) {
        if (ok) done();
        else { X.view(); }
    });
}
function tagRes(k, a) {
    const f = F();
    if (a === 'refuse') f.deal.st = 'no';
    X.go({ id: 'lobTagR', k: k, a: a });
}
SC.lobTagR = function (sc) {
    const node = tagNode();
    const lab = sc.a === 'give' ? '물건을 건네고 명찰을 받는다' : sc.a === 'not' ? '아직 구하지 못했다고 말한다' : '거래를 거절한다';
    const ui = X.UI();
    X.draw(ui, (sc.k === 1 ? '1차' : '2차') + ' 합류 — 명찰 상인', x(opt(node, lab)),
        (sc.a === 'give' ? X.notes(['요구 물품을 잃었습니다. 「이름 없는 명찰」을 획득했습니다.']) : '')
        + ui.b('계속 간다.', function () { X.go({ id: 'lobWait', k: sc.k }); }));
};

// --- 대기실 ---
function where(c) {
    const p = (S().pl || {})[c] || {};
    const ph = p.ph || 'op';
    if (ph === 'op') return '오프닝';
    if (ph.charAt(0) === 'l') return '<span style="color:#4CAF50;">대기실</span>';
    if (ph.charAt(0) === 'x') return (p.where === 'be' ? '아름다움과 추악함' : '달콤한 밤, 영원한 꿈') + ' 탐사 중';
    if (ph === 'bq') return '연회장';
    return ph;
}
function arrived(k) {
    const a = X.actives();
    const pl = S().pl || {};
    return a.filter(function (c) { return (pl[c] || {}).ph === 'l' + k; });
}
function allArrived(k) { const a = X.actives(); return a.length > 0 && arrived(k).length === a.length; }

function mergeNpc(k) {
    const s = S();
    if ((s.merged || {})['l' + k]) return;
    X.tx('npc', function (cur) {
        cur = cur || {};
        const sr = s.sres || {};
        Object.keys(sr).forEach(function (c) {
            Object.keys(sr[c] || {}).forEach(function (n) {
                const r = cur[n] || {};
                r.enc = 1;
                if (sr[c][n]) r.rec = 1;
                cur[n] = r;
            });
        });
        const br = s.bres || {};
        Object.keys(br).forEach(function (v) {
            Object.keys(br[v] || {}).forEach(function (n) {
                const r = cur[n] || {};
                r.enc = 1;
                if (br[v][n]) r.rec = 1;
                cur[n] = r;
            });
        });
        return cur;
    }).then(function () { X.pub('merged/l' + k, Date.now()); });
}

function lobMenu(ui, k) {
    return ui.b('개인 소지품을 확인한다.', function () { window.finBag(); })
        + ui.b('공용 보관함을 확인한다.', function () { storeOpen(); })
        + ui.b('동행 중인 NPC를 확인한다.', function () { window.finComps(); });
}

SC.lobWait = function (sc) {
    const k = sc.k;
    const a = X.actives();
    const all = allArrived(k);
    if (all && k >= 1) mergeNpc(k);
    const merged = k === 0 || !!((S().merged || {})['l' + k]);
    const ui = X.UI();
    const list = '<div class="fin-list">' + a.map(function (c) {
        return esc(X.nameOf(c)) + (c === X.me() ? ' (나)' : '') + ' — ' + where(c);
    }).join('<br>') + '</div>';
    let text, extra = '';
    if (!all || !merged) {
        text = '<div class="fin-sys">' + (k === 0 ? '공용 보관함을 이용할 수 있습니다.' : '먼저 탐사를 마쳤습니다.') + '</div>'
            + '모두가 대기실에 모이면 다음 탐사를 준비합니다.';
        extra = list + '<div class="fin-wait">다른 교우를 기다리는 중 — <b style="color:#d4af37;">' + arrived(k).length + ' / ' + a.length + '</b></div>' + lobMenu(ui, k);
    } else {
        text = k === 0 ? '<div class="fin-sys">공용 보관함을 이용할 수 있습니다.</div>모두 모였습니다.'
            : x(sec('lobby', k === 1 ? '1차 합류—01' : '2차 합류—01'));
        extra = list + lobMenu(ui, k)
            + ui.b(k === 2 ? '마지막 탐사를 준비한다.' : '다음 탐사를 준비한다.', function () {
                X.gatePress('r' + k);
                X.go({ id: 'lobReady', k: k });
            }, { gold: true });
    }
    X.draw(ui, (k === 0 ? '로비' : k + '차 합류') + ' — 대기실', text, extra, { keep: true });
};
LIVE.lobWait = true;

SC.lobReady = function (sc) {
    const k = sc.k;
    const ui = X.UI();
    X.draw(ui, (k === 0 ? '로비' : k + '차 합류') + ' — 대기실', '다른 교우들이 준비를 마치기를 기다립니다.',
        X.waitHtml('r' + k) + lobMenu(ui, k), { keep: true });
};
LIVE.lobReady = true;
AUTO.lobReady = function (sc) {
    if (X.gateDone('r' + sc.k)) X.go({ id: 'lobGo', k: sc.k });
};

// --- 공용 보관함 ---
function storeOpen() {
    const f = F();
    const list = X.storeList();
    const mine = (f.inv || []).slice();
    const OB = X.ob;
    let h = '<div style="font-weight:bold; color:#d4af37; margin-bottom:6px;">「피날레교단 교우 전용 공용 보관함」</div>'
        + '<div style="font-size:10px; color:#888; margin-bottom:10px; line-height:1.6;">모두가 볼 수 있고, 누구나 가져갈 수 있습니다. 맡긴 물품은 전투·위기에서 잃지 않습니다.<br>탐사 중에는 넣거나 꺼낼 수 없습니다. (NPC에게 제출하는 것은 됩니다)<br>꺼지지 않는 향초 · 식탁보는 넣을 수 없습니다.</div>';
    h += '<div style="font-size:11px; color:#ccc; margin:6px 0;">— 보관함 —</div>';
    if (!list.length) h += '<div style="color:#666; font-size:11px; padding:6px 0 10px 0;">비어 있습니다.</div>';
    list.forEach(function (e) {
        h += '<div class="it"><div class="n">' + esc(e.k) + '</div><div class="d">맡긴 사람 ' + esc(X.nameOf(e.by)) + '</div>'
            + '<div class="row">' + OB('물품을 가져온다', function () { storeGet(e.id); }) + '</div></div>';
    });
    h += '<div style="font-size:11px; color:#ccc; margin:10px 0 6px 0;">— 내 소지품 —</div>';
    if (!mine.length) h += '<div style="color:#666; font-size:11px; padding:6px 0;">가진 것이 없습니다.</div>';
    const seen = {};
    mine.forEach(function (k) {
        if (seen[k]) return;
        seen[k] = 1;
        const n = mine.filter(function (y) { return y === k; }).length;
        const kept = X.IT[k] && X.IT[k].kept;
        h += '<div class="it"><div class="n">' + esc(k) + (n > 1 ? ' ×' + n : '') + '</div>'
            + '<div class="row">' + OB(kept ? '넣을 수 없음' : '물품을 넣는다', function () { storePut(k); }, kept) + '</div></div>';
    });
    h += '<div class="row" style="margin-top:10px;">' + OB('닫는다', X.ovClose) + '</div>';
    X.ovOpen(h);
}
function storePut(k) {
    const f = F();
    if (X.IT[k] && X.IT[k].kept) return;
    if (!X.invDel(k)) return;
    const id = 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    X.pub('store/' + id, { k: k, by: X.me(), at: Date.now() });
    darkRun.log.push('[보관함] 넣음 — ' + k);
    X.save();
    setTimeout(storeOpen, 150);
    X.view({ keep: true });
}
function storeGet(id) {
    let got = null;
    X.tx('store/' + id, function (cur) {
        got = null;
        if (!cur) return;
        got = cur.k;
        return null;
    }).then(function (r) {
        if (r && r.committed && got) {
            X.invAdd(got);
            darkRun.log.push('[보관함] 가져옴 — ' + got);
            X.save();
        }
        setTimeout(storeOpen, 150);
        X.view({ keep: true });
    });
}
X.storeOpen = storeOpen;

// --- 장소 선택 ---
const BOOTH = { sw: '달콤한 밤, 영원한 꿈', be: '아름다움과 추악함' };
function lobGoNode(k) {
    return k === 0 ? sec('lobby', '0차 합류') : k === 1 ? sec('lobby', '1차 합류—02') : sec('lobby', '2차 합류—02');
}
SC.lobGo = function (sc) {
    const k = sc.k;
    const f = F();
    const node = lobGoNode(k);
    const ui = X.UI();
    let extra = '';
    if (k === 2) {
        extra = ui.b('「끝나지 않는 연회」에 입장한다.', function () {
            X.gatePress('bqIn');
            X.go({ id: 'lobPicked', k: 2 });
        }, { gold: true });
    } else {
        ['sw', 'be'].forEach(function (b) {
            if ((f.visited || []).indexOf(b) >= 0) return;            // 이미 다녀온 부스는 안 보인다
            extra += ui.b(BOOTH[b], function () { choose(k, b); });
        });
        extra += ui.b('출구를 찾는다.', function () { X.go({ id: 'lobExit', k: k, s: 0 }); });
    }
    X.draw(ui, (k === 0 ? '로비 — 0차 합류' : k + '차 합류'), x(node), extra);
};
function choose(k, b) {
    X.pub('pick/' + k + '/' + X.me(), b);
    darkRun.log.push('[장소] ' + BOOTH[b]);
    X.go({ id: 'lobPicked', k: k, b: b });
}
SC.lobPicked = function (sc) {
    const k = sc.k;
    const ui = X.UI();
    const a = X.actives();
    if (k === 2) {
        X.draw(ui, '2차 합류', '다른 교우들과 함께 출입문 앞으로 다가갑니다.', X.waitHtml('bqIn', a, '모두가 입장하기를 기다리는 중'), { keep: true });
        return;
    }
    const picks = (S().pick || {})[k] || {};
    const list = '<div class="fin-list">' + a.map(function (c) {
        return esc(X.nameOf(c)) + ' — ' + (picks[c] ? '<span style="color:#d4af37;">' + BOOTH[picks[c]] + '</span>' : '<span style="color:#777;">고르는 중</span>');
    }).join('<br>') + '</div>';
    X.draw(ui, (k === 0 ? '로비 — 0차 합류' : k + '차 합류'),
        '「' + BOOTH[sc.b] + '」로 향합니다.<br><br><span style="font-size:11px; color:#888;">모두가 갈 곳을 고르면 각자 출발합니다.</span>', list, { keep: true });
};
LIVE.lobPicked = true;
AUTO.lobPicked = function (sc) {
    const k = sc.k;
    const a = X.actives();
    if (k === 2) {
        if (X.gateDone('bqIn', a)) X.go({ id: 'bqEnter' });
        return;
    }
    const picks = (S().pick || {})[k] || {};
    if (!a.length || !a.every(function (c) { return !!picks[c]; })) return;
    depart(k, picks[X.me()] || sc.b);
};

// 2차에 동행 NPC 가 따라갈 쪽 — 양쪽에 사람이 있으면 무작위 (모두 같은 답)
function sides() {
    const picks = (S().pick || {})[1] || {};
    const a = X.actives();
    const sw = a.some(function (c) { return picks[c] === 'sw'; });
    const be = a.some(function (c) { return picks[c] === 'be'; });
    const out = {};
    X.comps().forEach(function (n) {
        out[n] = (sw && be) ? (X.srand(X.pid() + '|side|' + n)() < 0.5 ? 'sw' : 'be') : (be ? 'be' : 'sw');
    });
    return out;
}

function depart(k, b) {
    const f = F();
    if (f.ph === 'x' + (k + 1)) return;
    f.ph = 'x' + (k + 1);
    if ((f.visited || []).indexOf(b) < 0) f.visited.push(b);
    f.lastBooth = b;
    X.pub('pl/' + X.me() + '/ph', f.ph);
    X.pub('pl/' + X.me() + '/where', b);
    if (k === 1) {
        const sd = sides();
        X.tx('side', function (cur) { if (cur) return; return Object.keys(sd).length ? sd : { _: 1 }; });
    }
    if (b === 'sw') { if (X.swStart) X.swStart(k === 0 ? 1 : 2); }
    else { if (X.beStart) X.beStart(k + 1); }
}

// --- 출구 (즉사 함정) ---
SC.lobExit = function (sc) {
    const node = opt(lobGoNode(sc.k), '출구를 찾는다');
    const ui = X.UI();
    if (sc.s === 0) {
        X.draw(ui, '출구', x(node),
            ui.b('출구를 향해 걸어간다.', function () {
                darkRun.log.push('[출구] 걸어 들어감');
                X.die(x(opt(node, '출구를 향해 걸어간다')), { id: 'lobGo', k: sc.k });
            })
            + ui.b('복도를 자세히 살펴본다.', function () { X.go({ id: 'lobExit', k: sc.k, s: 1 }); })
            + ui.b('로비로 돌아간다.', function () { X.go({ id: 'lobExit', k: sc.k, s: 2 }); }));
        return;
    }
    const sub = sc.s === 1 ? opt(node, '복도를 자세히 살펴본다') : opt(node, '로비로 돌아간다');
    X.draw(ui, '출구', x(sub), ui.b(sc.s === 1 ? '로비로 돌아간다.' : '계속 간다.', function () { X.go({ id: 'lobGo', k: sc.k }); }));
};

console.log('[피날레] 오프닝 · 로비 연결');
})();
