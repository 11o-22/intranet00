// ==========================================
// ★ [ 🎁 웰컴 패키지 팩 ] — 새 사번이 생기면 선물함에 저절로 들어간다
// bundles.json 마지막 묶음, giftbox.js **다음** (giftSendRaw 를 쓴다)
// ==========================================
//
// ■ 무엇이 들어가나 — 소속에 따라 다르다
//
//   백일몽 주식회사     재난관리국
//   ─────────────────  ─────────────────
//   보안팀 의상 세트    사자탈
//   버터 나이프         작두
//   착한 친구           유리손포
//   정갈한 문패 ×2      오색 신발끈 ×2
//   2,000,000 P         2,000,000 P
//   벽지 견본첩 ×10     벽지 견본첩 ×10
//   뉴비 의상           뉴비 의상          ← 2026-10-25 · 뉴비 세트 (받으면 소지품이 아니라 옷장으로 — wear-gift.js)
//   잎 우산             잎 우산
//   뉴비 새싹           뉴비 새싹          ← 2026-10-29 · 악세 (옷장 악세 칸 · 거래 안 됨)
//   칭호 🌱 뉴비        칭호 🌱 뉴비        ← 2026-10-29 · 받는 순간 titleAdmin 에 붙는다 (giftbox.js titles)
//
//   둘 다 그 소속만 찰 수 있는 물건들이다 (EQUIP_AFFIL). 그래서 소속을
//   보고 갈라 보낸다. 어느 쪽도 아닌 소속(어둠 따위)은 **안 보낸다** —
//   무엇을 넣을지 듣지 못했다. 넣으려면 아래 PACK 에 한 줄 더 적으면 된다.
//
// ■ 언제 들어가나
//
//   상담사가 「신규 사원 등록」으로 **사번을 새로 만들 때**
//   (adminRegisterNewEmployee). 그 함수를 감싸, 등록이 끝나면 새 계정의
//   선물함(gifts/<인가코드>)에 한 건 넣는다.
//   ★ 가입 신청을 **승인할 때**도 (signup.js signupApprove · 2026-10-26)
//     ✗ 2026-10-23 가입 신청이 생긴 뒤로 새 사원은 거의 다 그 길로 들어오는데, 그 길에는 웰컴 패키지가
//       걸려 있지 않아 **가입으로 들어온 사원은 하나도 받지 못했다.** 승인이 끝나면 welcomeAuto 를 부른다.
//   보낸 사원에게는 users/<코드>/welcomeAt 을 적는다 — 저절로 보내는 길은 이것이 있으면 다시 안 보낸다.
//
//   ✗ 로그인할 때 넣으면 안 된다 — 받고 나서 다시 들어오면 또 생긴다.
//     「새로 생긴 그 순간」 한 번만 넣어야 한다.
//
//   그래도 두 번 들어가는 일이 없도록, 받는 사람 선물함에 이미 같은
//   제목이 있으면 건너뛴다.
//
// ■ 받으면
//
//   선물함에서 「받는다」를 누르면 물품은 소지품으로, 포인트는 보유
//   포인트로 들어가고, **무엇이 들어왔는지 한 창에 모아** 보여 준다
//   (giftbox.js 의 giftTake — 포인트 줄도 거기서 붙는다).
//
// ■ 콘솔
//   welcomeSend('사번 또는 이름')   손으로 한 번 더 보낸다 (상담사)
//   welcomePack('백일몽 주식회사')  무엇이 들어가는지 본다
//   welcomeMissing()               가입으로 들어와 아직 못 받은 사원 · welcomeMissing(true) 면 그 사원들에게 보낸다

(function welcomePack() {

const TITLE = '[ 🎁 웰컴 패키지 팩 ]';
const COUNSEL = 'kario0987';
const SENDER = '당국';
const PTS = 2000000;
const SKIN = '벽지 견본첩';
const SKIN_N = 10;

// 소속마다 들어가는 물품 — { 물품이름: 개수 }
const PACK = [
    { re: /백일몽/, n: '백일몽 주식회사', items: {
        '보안팀 의상 세트': 1, '버터 나이프': 1, '착한 친구': 1, '정갈한 문패': 2,
        '뉴비 의상': 1, '잎 우산': 1, '뉴비 새싹': 1
    } },
    { re: /재난관리국/, n: '재난관리국', items: {
        '사자탈': 1, '작두': 1, '유리손포': 1, '오색 신발끈': 2,
        '뉴비 의상': 1, '잎 우산': 1, '뉴비 새싹': 1
    } }
];
// 같이 붙는 칭호 — 소속 가리지 않고 (titles.js ADMIN_TITLES 에 있는 이름이어야 그림이 붙는다)
const TITLES = ['뉴비'];

const TEXT = '입사를 환영합니다.\n'
    + '소속에 맞는 장비와 당장 쓸 포인트, 뉴비 옷과 새싹, 뉴비 칭호를 함께 보냅니다.\n'
    + '받으시면 물품은 소지품으로, 옷과 새싹은 옷장으로, 포인트와 칭호는 바로 들어갑니다.';

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }

// 어느 묶음인가 — 소속과 팀을 붙여 놓고 본다 (다른 곳과 같은 잣대)
function packOf(aff, team) {
    const where = String(aff || '') + ' ' + String(team || '');
    for (let i = 0; i < PACK.length; i++) if (PACK[i].re.test(where)) return PACK[i];
    return null;
}

function contents(p) {
    const it = {};
    Object.keys(p.items).forEach(function (k) { it[k] = p.items[k]; });
    it[SKIN] = (it[SKIN] || 0) + SKIN_N;
    return it;
}

// ==========================================
// 보내기
// ==========================================
//
//   ★ 이미 같은 제목이 그 선물함에 있으면 안 보낸다. 등록 단추를 두 번
//     누르거나, 지웠다 다시 만든 계정에 두 벌이 쌓이는 것을 막는다.
function sendTo(code, aff, team) {
    const d = db_();
    const p = packOf(aff, team);
    if (!d || !code || !p) return Promise.resolve(false);
    if (typeof giftSendRaw !== 'function') return Promise.resolve(false);

    return d.ref('gifts/' + code).once('value').then(function (s) {
        const all = s.val() || {};
        const dup = Object.keys(all).some(function (k) {
            return all[k] && all[k].title === TITLE;
        });
        if (dup) { console.log('[웰컴] 이미 들어가 있습니다 — ' + code); return false; }
        return giftSendRaw([code], {
            title: TITLE, text: TEXT, byName: SENDER,
            items: contents(p), pts: PTS, titles: TITLES
        }).then(function (n) {
            if (n) {
                console.log('%c[웰컴] ' + p.n + ' 묶음을 넣었습니다 — ' + code, 'color:#4CAF50');
                try { d.ref('users/' + code + '/welcomeAt').set(Date.now()); } catch (e) { }
            }
            return !!n;
        });
    }).catch(function (e) { console.error('[웰컴] 넣지 못했습니다', e); return false; });
}

// 저절로 보내는 길 — 이미 보낸 적이 있으면(welcomeAt) 건너뛴다
function autoSend(code, aff, team) {
    const d = db_();
    if (!d || !code) return Promise.resolve(false);
    return d.ref('users/' + code + '/welcomeAt').once('value').then(function (s) {
        if (s && s.val()) { console.log('[웰컴] 이미 보낸 사원입니다 — ' + code); return false; }
        return sendTo(code, aff, team);
    }).catch(function () { return sendTo(code, aff, team); });
}
// 가입 신청 승인(signup.js)이 부른다
window.welcomeAuto = function (code, aff, team) {
    const u = me();
    if (!u || u.code !== COUNSEL) return Promise.resolve(false);
    return autoSend(code, aff, team || '현장탐사팀');
};

// ==========================================
// 새 사번이 생기는 자리를 감싼다
// ==========================================
//
//   adminRegisterNewEmployee 는 입력칸을 제가 읽고, 끝나면 **비운다.**
//   그래서 부르기 **전에** 적힌 값을 먼저 떠 둔다. 그리고 등록이 정말
//   되었는지(db.users 에 생겼는지) 보고 넣는다.
(function hook() {
    const iv = setInterval(function () {
        if (typeof adminRegisterNewEmployee !== 'function') return;
        if (adminRegisterNewEmployee._welcome) { clearInterval(iv); return; }

        const _f = adminRegisterNewEmployee;
        adminRegisterNewEmployee = function () {
            const g = function (id) {
                const e = document.getElementById(id);
                return e ? String(e.value || '').trim() : '';
            };
            const code = g('new-emp-code');
            const aff = g('new-emp-aff') || '백일몽 주식회사';   // 원본과 같은 기본값
            const team = g('new-emp-team') || '현장탐사팀';
            const had = !!(typeof db !== 'undefined' && db.users && db.users[code]);

            const r = _f.apply(this, arguments);

            // 등록이 **새로** 된 때만 (이미 있던 사번이면 원본이 막는다)
            if (code && !had) {
                setTimeout(function () {
                    try {
                        if (typeof db === 'undefined' || !db.users || !db.users[code]) return;
                        autoSend(code, aff, team);
                    } catch (e) { console.error('[웰컴]', e); }
                }, 700);
            }
            return r;
        };
        adminRegisterNewEmployee._welcome = true;
        clearInterval(iv);
        console.log('[웰컴] 신규 사원 등록에 연결 — ' + TITLE);
    }, 500);
})();

// ==========================================
// 콘솔
// ==========================================
window.welcomePack = function (aff, team) {
    const p = packOf(aff, team);
    if (!p) {
        console.log('%c그 소속에는 넣을 묶음이 없습니다.', 'color:#ff8a80');
        console.log('  있는 묶음:', PACK.map(function (x) { return x.n; }).join(' · '));
        return;
    }
    const it = contents(p);
    console.log('%c===== ' + TITLE + ' — ' + p.n + ' =====', 'color:#d4af37; font-size:13px');
    Object.keys(it).forEach(function (k) { console.log('  · ' + k + (it[k] > 1 ? ' ×' + it[k] : '')); });
    console.log('  · ' + PTS.toLocaleString('ko-KR') + ' P');
    TITLES.forEach(function (t) { console.log('  · 칭호 [' + t + ']'); });
};

window.welcomeSend = function (who) {
    const u = me();
    if (!u || u.code !== COUNSEL) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) ? db.users : {};
    const code = Object.keys(book).filter(function (c) {
        const x = book[c] || {};
        return c === who || String(x.no) === String(who) || x.name === who;
    })[0];
    if (!code) { console.warn('사원을 못 찾았습니다.'); return; }
    const x = book[code];
    sendTo(code, x.affiliation, x.team).then(function (okk) {
        if (!okk) console.log('  넣지 않았습니다 (이미 있거나, 묶음이 없는 소속입니다).');
    });
};

// 가입으로 들어와 아직 못 받은 사원 — 보낸 적(welcomeAt) 없고 · 선물함에 받을 웰컴 팩도 없는 사원
window.welcomeMissing = function (send) {
    const u = me(), d = db_();
    if (!u || u.code !== COUNSEL || !d) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    const book = (typeof db !== 'undefined' && db.users) ? db.users : {};
    const list = Object.keys(book).filter(function (c) {
        const x = book[c];
        return x && x.name && x.signedUpAt && !x.welcomeAt && packOf(x.affiliation, x.team);
    });
    Promise.all(list.map(function (c) {
        return d.ref('gifts/' + c).once('value').then(function (s) {
            const all = s.val() || {};
            return Object.keys(all).some(function (k) { return all[k] && all[k].title === TITLE; }) ? null : c;
        }).catch(function () { return c; });
    })).then(function (got) {
        const miss = got.filter(Boolean);
        console.log('%c===== ' + TITLE + ' — 가입으로 들어와 못 받은 사원 ' + miss.length + '명 =====', 'color:#d4af37; font-size:13px');
        if (miss.length) console.table(miss.map(function (c) { const x = book[c]; return { 사번: x.no, 이름: x.name, 소속: x.affiliation, 가입: new Date(x.signedUpAt).toLocaleString() }; }));
        if (!send) { if (miss.length) console.log('  보내려면 welcomeMissing(true)'); return; }
        miss.reduce(function (pr, c) {
            return pr.then(function () { const x = book[c]; return sendTo(c, x.affiliation, x.team); });
        }, Promise.resolve()).then(function () { console.log('%c✓ ' + miss.length + '명에게 보냈습니다.', 'color:#4CAF50'); });
    });
};

console.log('[웰컴] welcomePack(소속) · welcomeSend(사번) · welcomeMissing()');

})();
