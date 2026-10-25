// ==========================================
// ★ 가입 신청 — 사원이 스스로 가입하고, 상담사가 승인하면 들어온다 (2026-10-23)
// bundles.json 마지막 그룹 맨 끝
// ==========================================
//
// ■ 흐름
//   1. 접속 화면 [가입 신청] — 사원명 · 비밀번호 · 소속(백일몽 주식회사 / 재난관리국)
//        signups/<자리> = { name, aff, salt, hash, at, st: 'wait' }
//      사원명은 겹칠 수 없다 (있는 사원 · 기다리는 신청과 견준다).
//   2. 상담사 화면 맨 위 「가입 신청」 칸 — [승인] [반려]
//        승인  users/<새 코드> 를 만든다 (상담사 발급과 같은 buildNewUser · 팀 현장탐사팀 · 직급 사원)
//              비밀번호는 pw/<코드> 로 옮기고, 신청 자리는 지운다.
//        반려  st: 'no' — 같은 이름으로 다시 신청하면 그 자리를 지우고 새로 적는다.
//      팀 · 직급을 바꾸는 것은 전처럼 「인사 발령」.
//   3. 접속 — 사원명 + 비밀번호
//        비밀번호가 있는 사원   pw/<코드> 와 맞춰 본다. 맞으면 그 사원의 코드로 원래 접속 길(attemptLogin)을 탄다.
//        예전 사원             전처럼 사원명 + 인가 코드 (인가 코드가 곧 비밀번호다).
//   4. 비밀번호 변경 (접속 화면) — 사원명 · 지금 비밀번호(예전 사원은 인가 코드) · 바꿀 비밀번호
//        pw/<코드> 에 적는다. 그 뒤로는 바꾼 비밀번호로만 들어온다 (인가 코드로는 안 된다).
//        상담사가 「인가 코드 변경」을 하면 비밀번호를 지운다 — 새 인가 코드가 다시 비밀번호가 된다 (초기화).
//
// ■ 비밀번호는 사원 기록 밖(pw/<코드>)에 둔다
//   사원 기록은 여러 자리가 통째로 다시 쓴다 (set). 기록 안에 두면 묵은 사본이 덮어쓰며 지울 수 있다.
//   접속 때 그 사람 몫만 읽어 온다 — 모든 화면에 늘 내려가지도 않는다.
//        기다리는 신청   「승인을 기다리는 중」 · 반려됐으면 「반려되었습니다」.
//      ★ 가입한 사원의 코드는 비밀이 아니다 (사원 기록은 모든 화면에 내려온다). 그래서 그 코드로는
//        못 들어온다 — 이 기기에서 들어갔던 적이 있어 자동 접속하는 때만 예외.
//
// ■ 비밀번호
//   원문은 어디에도 적지 않는다. PBKDF2(SHA-256 · 12만 번 · 사람마다 다른 소금)로 바꾼 값만 둔다.
//   사원 기록이 모든 화면에 내려오는 구조라 완벽하지는 않다 — 짧은 비밀번호는 시간을 들이면 풀린다.
//
// ■ 상담사 발급은 그대로 둔다 (그 사원은 예전 방식으로 들어온다).
//
// ■ 콘솔
//   signupState()   기다리는 신청

(function signup() {

const ADMIN = 'kario0987';
const AFFS = ['백일몽 주식회사', '재난관리국'];
const ITER = 120000;
const NAME_MAX = 12;
const PW_MIN = 4;

function me() { try { return currentUser || null; } catch (e) { return null; } }
function users() { try { return (db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function dbr() { try { return (typeof database !== 'undefined' && database) ? database : null; } catch (e) { return null; } }
function say(t) { try { showCustomAlert(t); } catch (e) { alert(t); } }
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}
function el(id) { return document.getElementById(id); }

// ── 비밀번호 바꾸기
function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}
function newSalt() {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return hex(a.buffer);
}
async function hashPw(pw, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: ITER, hash: 'SHA-256' }, key, 256);
    return hex(bits);
}
async function pwOk(pw, salt, hash) {
    if (!pw || !salt || !hash) return false;
    try { return (await hashPw(pw, salt)) === hash; } catch (e) { return false; }
}
function cryptoOk() { return !!(window.crypto && crypto.subtle && crypto.getRandomValues); }

// 그 사원의 비밀번호 — pw/<코드> (예전에 사원 기록 안에 적었던 것도 읽는다)
async function pwRec(code) {
    const d = dbr();
    if (d) {
        try {
            const v = (await d.ref('pw/' + code).once('value')).val();
            if (v && v.s && v.h) return v;
        } catch (e) { }
    }
    const u = users()[code];
    if (u && u.passSalt && u.passHash) return { s: u.passSalt, h: u.passHash };
    return null;
}
// 사원명 + 비밀번호(또는 인가 코드)가 누구인가
//   { code, how: 'pw' | 'code' } — 맞았다
//   codeHasPw — 인가 코드는 맞는데 그 사원은 비밀번호를 정해 두었다 (코드로는 못 들어온다)
//   anyPw     — 그 이름의 사원 가운데 비밀번호를 정한 사람이 있다 (틀린 비밀번호)
async function whoIs(name, pw) {
    const U = users();
    const same = Object.keys(U).filter(function (c) { return U[c] && U[c].name === name; });
    let anyPw = false;
    for (let i = 0; i < same.length; i++) {
        const rec = await pwRec(same[i]);
        if (!rec) continue;
        anyPw = true;
        if (await pwOk(pw, rec.s, rec.h)) return { code: same[i], how: 'pw' };
    }
    const t = U[pw];
    if (t && t.name === name) {
        if (await pwRec(pw)) return { codeHasPw: true, anyPw: true };
        return { code: pw, how: 'code' };
    }
    return { anyPw: anyPw };
}

// ── 신청 목록 (모든 화면이 듣는다 — 이름 겹침 · 접속 때 안내에 쓴다)
let signups = {};
(function listen() {
    const iv = setInterval(function () {
        const d = dbr();
        if (!d) return;
        clearInterval(iv);
        d.ref('signups').on('value', function (s) {
            signups = s.val() || {};
            try { paintAdmin(); } catch (e) { }
        });
    }, 300);
})();
function nameTaken(name) {
    const U = users();
    if (Object.keys(U).some(function (c) { const u = U[c]; return u && u.name === name; })) return '이미 있는 사원명입니다.';
    if (Object.keys(signups).some(function (k) { const s = signups[k]; return s && s.name === name && s.st === 'wait'; })) return '같은 사원명으로 승인을 기다리는 신청이 있습니다.';
    return '';
}

// ==========================================
// 접속 화면 — 가입 신청 칸
// ==========================================
let busy = false;
window.openSignup = function () {
    const box = el('login-screen');
    if (!box) return;
    let f = el('signup-box');
    if (!f) {
        f = document.createElement('div');
        f.id = 'signup-box';
        f.style.cssText = 'width:100%; display:flex; flex-direction:column; align-items:stretch;';
        f.innerHTML =
              '<div class="login-input-group"><input type="text" id="su-name" maxlength="' + NAME_MAX + '" placeholder="사원명"></div>'
            + '<div class="login-input-group"><input type="password" id="su-pw" placeholder="비밀번호 (' + PW_MIN + '자 이상)"></div>'
            + '<div class="login-input-group"><input type="password" id="su-pw2" placeholder="비밀번호 확인"></div>'
            + '<div style="display:flex; gap:8px; margin-bottom:6px;">'
            + AFFS.map(function (a, i) {
                return '<button type="button" class="su-aff" data-a="' + esc(a) + '" style="flex:1; padding:12px 6px; font-size:14px; cursor:pointer;'
                    + ' border:1px solid #4a5260; background:rgba(18,20,24,0.88); color:#cfd6df; border-radius:4px;">' + esc(a) + '</button>';
            }).join('')
            + '</div>'
            + '<div style="font-size:11px; color:#8d96a0; text-align:center; margin:4px 0 4px; text-shadow:0 1px 3px #000;">'
            + '팀 · 직급은 현장탐사팀 · 사원으로 시작합니다. 상담사가 승인하면 접속할 수 있습니다.</div>'
            + '<button class="login-btn" id="su-go" type="button">가입 신청</button>'
            + '<div style="margin-top:14px; font-size:13px; text-align:center;"><a href="#" id="su-back" style="color:#9aa3ad;">접속 화면으로</a></div>';
        box.appendChild(f);
        f.querySelectorAll('.su-aff').forEach(function (b) {
            b.addEventListener('click', function () {
                f.querySelectorAll('.su-aff').forEach(function (x) { x.dataset.on = ''; x.style.borderColor = '#4a5260'; x.style.color = '#cfd6df'; x.style.fontWeight = ''; });
                b.dataset.on = '1'; b.style.borderColor = '#d4af37'; b.style.color = '#ffd479'; b.style.fontWeight = 'bold';
            });
        });
        el('su-go').addEventListener('click', submit);
        el('su-back').addEventListener('click', function (e) { e.preventDefault(); closeSignup(); });
        el('su-pw2').addEventListener('keypress', function (e) { if (e.key === 'Enter') submit(); });
    }
    showLogin(false);
    f.style.display = 'flex';
    const h = box.querySelector('h2'); if (h) { h.dataset.was = h.dataset.was || h.textContent; h.textContent = '가입 신청'; }
    setTimeout(function () { try { el('su-name').focus(); } catch (e) { } }, 50);
};
function showLogin(on) {
    const box = el('login-screen');
    Array.prototype.forEach.call(box.children, function (c) {
        if (c.tagName === 'H2' || c.id === 'signup-box' || c.id === 'pwc-box') return;
        c.style.display = on ? '' : 'none';
    });
}
function closeSignup() {
    const f = el('signup-box');
    if (f) f.style.display = 'none';
    showLogin(true);
    const h = el('login-screen').querySelector('h2'); if (h && h.dataset.was) h.textContent = h.dataset.was;
}
window.closeSignup = closeSignup;

async function submit() {
    if (busy) return;
    const name = (el('su-name').value || '').trim();
    const pw = el('su-pw').value || '', pw2 = el('su-pw2').value || '';
    const affBtn = document.querySelector('#signup-box .su-aff[data-on="1"]');
    const aff = affBtn ? affBtn.dataset.a : '';
    if (!name) { say('사원명을 적어 주세요.'); return; }
    if (name.length > NAME_MAX) { say('사원명은 ' + NAME_MAX + '자까지입니다.'); return; }
    if (/[.#$\[\]\/|<>]/.test(name)) { say('사원명에 쓸 수 없는 글자가 있습니다. ( . # $ [ ] / | < > )'); return; }
    if (pw.length < PW_MIN) { say('비밀번호는 ' + PW_MIN + '자 이상으로 정해 주세요.'); return; }
    if (pw !== pw2) { say('비밀번호 확인이 맞지 않습니다.'); return; }
    if (AFFS.indexOf(aff) < 0) { say('소속을 골라 주세요.'); return; }
    if (!cryptoOk()) { say('이 브라우저에서는 가입할 수 없습니다.\n\n다른 브라우저로 열어 주세요.'); return; }
    const d = dbr();
    if (!d) { say('서버와 연결 중입니다. 잠시 후 다시 시도해 주세요.'); return; }
    const taken = nameTaken(name);
    if (taken) { say(taken); return; }
    busy = true;
    try {
        // 같은 이름의 반려된 신청은 걷는다
        const rm = {};
        Object.keys(signups).forEach(function (k) { const s = signups[k]; if (s && s.name === name && s.st === 'no') rm['signups/' + k] = null; });
        if (Object.keys(rm).length) await d.ref().update(rm);
        const salt = newSalt();
        const hash = await hashPw(pw, salt);
        await d.ref('signups').push({ name: name, aff: aff, salt: salt, hash: hash, at: Date.now(), st: 'wait' });
        el('su-name').value = ''; el('su-pw').value = ''; el('su-pw2').value = '';
        closeSignup();
        try { el('nickname-input').value = name; } catch (e) { }
        say('가입 신청을 보냈습니다.\n\n상담사가 승인하면 이 사원명과 비밀번호로 접속할 수 있습니다.');
    } catch (e) {
        console.error('[가입] 신청 실패', e);
        say('신청을 보내지 못했습니다.\n\n잠시 후 다시 시도해 주세요.');
    } finally { busy = false; }
}

// ==========================================
// 접속 화면 — 비밀번호 변경
// ==========================================
//   사원명 · 지금 비밀번호(예전 사원은 인가 코드) · 바꿀 비밀번호 · 확인
window.openPwChange = function () {
    const box = el('login-screen');
    if (!box) return;
    const sb = el('signup-box'); if (sb) sb.style.display = 'none';
    let f = el('pwc-box');
    if (!f) {
        f = document.createElement('div');
        f.id = 'pwc-box';
        f.style.cssText = 'width:100%; display:flex; flex-direction:column; align-items:stretch;';
        f.innerHTML =
              '<div class="login-input-group"><input type="text" id="pwc-name" maxlength="' + NAME_MAX + '" placeholder="사원명"></div>'
            + '<div class="login-input-group"><input type="password" id="pwc-old" placeholder="지금 비밀번호 (인가 코드)"></div>'
            + '<div class="login-input-group"><input type="password" id="pwc-new" placeholder="바꿀 비밀번호 (' + PW_MIN + '자 이상)"></div>'
            + '<div class="login-input-group"><input type="password" id="pwc-new2" placeholder="바꿀 비밀번호 확인"></div>'
            + '<div style="font-size:11px; color:#8d96a0; text-align:center; margin:0 0 4px; text-shadow:0 1px 3px #000;">'
            + '바꾼 뒤에는 새 비밀번호로만 접속합니다. 인가 코드로는 더 이상 들어올 수 없습니다.</div>'
            + '<button class="login-btn" id="pwc-go" type="button">비밀번호 바꾸기</button>'
            + '<div style="margin-top:14px; font-size:13px; text-align:center;"><a href="#" id="pwc-back" style="color:#9aa3ad;">접속 화면으로</a></div>';
        box.appendChild(f);
        el('pwc-go').addEventListener('click', submitPwc);
        el('pwc-back').addEventListener('click', function (e) { e.preventDefault(); closePwChange(); });
        el('pwc-new2').addEventListener('keypress', function (e) { if (e.key === 'Enter') submitPwc(); });
    }
    showLogin(false);
    f.style.display = 'flex';
    const h = box.querySelector('h2'); if (h) { h.dataset.was = h.dataset.was || h.textContent; h.textContent = '비밀번호 변경'; }
    try { el('pwc-name').value = (el('nickname-input').value || '').trim(); } catch (e) { }
    setTimeout(function () { try { el(el('pwc-name').value ? 'pwc-old' : 'pwc-name').focus(); } catch (e) { } }, 50);
};
function closePwChange() {
    const f = el('pwc-box');
    if (f) f.style.display = 'none';
    showLogin(true);
    const h = el('login-screen').querySelector('h2'); if (h && h.dataset.was) h.textContent = h.dataset.was;
}
window.closePwChange = closePwChange;
let pwcBusy = false;
async function submitPwc() {
    if (pwcBusy) return;
    const name = (el('pwc-name').value || '').trim();
    const old = (el('pwc-old').value || '').trim();
    const nw = el('pwc-new').value || '', nw2 = el('pwc-new2').value || '';
    if (!name || !old) { say('사원명과 지금 비밀번호를 적어 주세요.'); return; }
    if (nw.length < PW_MIN) { say('바꿀 비밀번호는 ' + PW_MIN + '자 이상으로 정해 주세요.'); return; }
    if (nw !== nw2) { say('바꿀 비밀번호 확인이 맞지 않습니다.'); return; }
    if (!cryptoOk()) { say('이 브라우저에서는 바꿀 수 없습니다.\n\n다른 브라우저로 열어 주세요.'); return; }
    const d = dbr();
    if (!d) { say('서버와 연결 중입니다. 잠시 후 다시 시도해 주세요.'); return; }
    pwcBusy = true;
    try {
        const r = await whoIs(name, old);
        if (!r.code) { say('사원명 혹은 지금 비밀번호가 맞지 않습니다.'); return; }
        const salt = newSalt();
        const hash = await hashPw(nw, salt);
        const up = {};
        up['pw/' + r.code] = { s: salt, h: hash, at: Date.now() };
        const u = users()[r.code];
        if (u && (u.passSalt || u.passHash)) { up['users/' + r.code + '/passSalt'] = null; up['users/' + r.code + '/passHash'] = null; }
        await d.ref().update(up);
        el('pwc-old').value = ''; el('pwc-new').value = ''; el('pwc-new2').value = '';
        closePwChange();
        try { el('nickname-input').value = name; el('code-input').value = ''; } catch (e) { }
        say('비밀번호를 바꿨습니다.\n\n이제 새 비밀번호로 접속합니다.'
            + (r.how === 'code' ? '\n예전 인가 코드로는 더 이상 들어올 수 없습니다.' : ''));
    } catch (e) {
        console.error('[비밀번호] 바꾸기 실패', e);
        say('비밀번호를 바꾸지 못했습니다.\n\n잠시 후 다시 시도해 주세요.');
    } finally { pwcBusy = false; }
}

// 상담사가 「인가 코드 변경」을 하면 — 비밀번호를 지운다 (새 인가 코드가 다시 비밀번호가 된다 · 초기화)
(function hookCodeChange() {
    const iv = setInterval(function () {
        if (typeof window.adminChangeCode !== 'function') return;
        if (window.adminChangeCode._pw) { clearInterval(iv); return; }
        const _c = window.adminChangeCode;
        const w = async function () {
            let oldCode = null, newCode = '';
            try {
                const no = (el('adm-target-no').value || '').trim();
                newCode = (el('adm-new-code').value || '').trim();
                const U = users();
                oldCode = Object.keys(U).find(function (c) { return U[c] && (U[c].no === no || c === no); }) || null;
            } catch (e) { }
            const r = await _c.apply(this, arguments);
            const d = dbr();
            if (d && oldCode && newCode && oldCode !== newCode) {
                try {
                    const still = (await d.ref('users/' + oldCode).once('value')).val();
                    if (!still) {
                        await d.ref('pw/' + oldCode).remove();
                        const moved = users()[newCode];
                        if (moved && (moved.passSalt || moved.passHash)) await d.ref('users/' + newCode).update({ passSalt: null, passHash: null });
                        console.log('[비밀번호] 인가 코드가 바뀌어 비밀번호를 지웠습니다 — 새 인가 코드로 접속합니다.');
                    }
                } catch (e) { console.warn('[비밀번호] 코드 변경 뒤 정리 실패', e); }
            }
            return r;
        };
        Object.keys(_c).forEach(function (k) { if (!(k in w)) w[k] = _c[k]; });
        w._pw = true;
        window.adminChangeCode = w;
        try { adminChangeCode = w; } catch (e) { }
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 접속 — 사원명 + 비밀번호
// ==========================================
(function hookLogin() {
    const iv = setInterval(function () {
        if (typeof window.attemptLogin !== 'function') return;
        if (window.attemptLogin._signup) { clearInterval(iv); return; }
        const _l = window.attemptLogin;
        const w = async function () {
            const ni = el('nickname-input'), ci = el('code-input');
            const name = ni ? ni.value.trim() : '', pw = ci ? ci.value.trim() : '';
            const args = arguments, ctx = this;
            const go = function () { return _l.apply(ctx, args); };
            if (!name || !pw) return go();
            const U = users();
            const saved = (function () { try { return localStorage.getItem('corp_logged_code'); } catch (e) { return null; } })();
            // ⓪ 이 기기의 자동 접속 — 적어 둔 사원 코드 그대로면 서버에 묻지 않고 바로 (기다리는 사이 접속 칸이 비치지 않게)
            if (saved && saved === pw && U[pw] && U[pw].name === name) return go();
            const r = await whoIs(name, pw);
            // ① 비밀번호가 있는 사원 — 비밀번호로
            if (r.code && r.how === 'pw') { ci.value = r.code; return go(); }
            // ② 코드로 — 예전 사원은 그대로 · 비밀번호가 있는 사원은 이 기기의 자동 접속만
            if (r.code && r.how === 'code') return go();
            if (r.codeHasPw) {
                if (saved === pw) return go();
                say('사원명 혹은 비밀번호가 맞지 않습니다.');
                return;
            }
            if (r.anyPw) { say('사원명 혹은 비밀번호가 맞지 않습니다.'); return; }
            // 사원 기록이 아직 이 화면에 안 내려왔어도 — 비밀번호를 정한 사원의 코드로는 못 들어온다
            if (saved !== pw && await pwRec(pw)) { say('사원명 혹은 비밀번호가 맞지 않습니다.'); return; }
            // ③ 가입 신청 — 기다리는 중 · 반려
            const sg = Object.keys(signups).map(function (k) { return signups[k]; })
                .filter(function (s) { return s && s.name === name; });
            for (let i = 0; i < sg.length; i++) {
                if (await pwOk(pw, sg[i].salt, sg[i].hash)) {
                    if (sg[i].st === 'no') say('가입 신청이 반려되었습니다.' + (sg[i].why ? '\n\n' + sg[i].why : '') + '\n\n다시 신청할 수 있습니다.');
                    else say('가입 신청을 상담사가 확인하는 중입니다.\n\n승인되면 접속할 수 있습니다.');
                    return;
                }
            }
            return go();
        };
        Object.keys(_l).forEach(function (k) { if (!(k in w)) w[k] = _l[k]; });
        w._signup = true;
        window.attemptLogin = w;
        try { attemptLogin = w; } catch (e) { }
        clearInterval(iv);
    }, 300);
})();

// ==========================================
// 상담사 화면 — 가입 신청 칸
// ==========================================
function isAdmin() { const u = me(); return !!(u && u.code === ADMIN); }
function pending() {
    return Object.keys(signups).map(function (k) { return Object.assign({ id: k }, signups[k]); })
        .filter(function (s) { return s && s.st === 'wait'; })
        .sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
}
function paintAdmin() {
    if (!isAdmin()) return;
    const scr = el('admin-screen');
    if (!scr) return;
    let box = el('signup-admin-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'signup-admin-box';
        box.className = 'admin-panel-box';
        const anchor = Array.prototype.filter.call(scr.querySelectorAll('.admin-panel-box'), function (b) {
            const h = b.querySelector('h4'); return h && /신규 사원 등록/.test(h.textContent);
        })[0];
        if (anchor) anchor.parentNode.insertBefore(box, anchor); else scr.appendChild(box);
    }
    const list = pending();
    box.innerHTML = '<h4>가입 신청 ' + (list.length ? '<span style="color:#ff6b6b;">(' + list.length + ')</span>' : '') + '</h4>'
        + (list.length ? list.map(function (s) {
            const t = new Date(s.at || 0);
            const when = (t.getMonth() + 1) + '/' + t.getDate() + ' ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
            return '<div style="display:flex; align-items:center; gap:6px; padding:7px 0; border-bottom:1px dashed #333; font-size:12px;">'
                + '<div style="flex:1; min-width:0;"><b>' + esc(s.name) + '</b> <span style="color:#aaa;">· ' + esc(s.aff) + '</span>'
                + '<div style="font-size:10px; color:#777;">' + when + '</div></div>'
                + '<button class="game-btn" style="margin:0; padding:6px 10px; font-size:11px;" onclick="signupApprove(\'' + s.id + '\')">승인</button>'
                + '<button class="game-btn" style="margin:0; padding:6px 10px; font-size:11px; background:linear-gradient(145deg,#555,#333);" onclick="signupReject(\'' + s.id + '\')">반려</button>'
                + '</div>';
        }).join('') : '<div style="font-size:11px; color:#777;">기다리는 신청이 없습니다.</div>');
}
// 새 신청이 들어오면 상담사에게 한 번 알린다
let seenIds = null;
setInterval(function () {
    if (!isAdmin()) { seenIds = null; return; }
    const ids = pending().map(function (s) { return s.id; });
    if (seenIds === null) { seenIds = ids; paintAdmin(); return; }
    const fresh = ids.filter(function (k) { return seenIds.indexOf(k) < 0; });
    seenIds = ids;
    if (fresh.length) {
        paintAdmin();
        const n = fresh.map(function (k) { return signups[k] && signups[k].name; }).filter(Boolean).join(', ');
        say('📝 가입 신청 — ' + n + '\n\n상담사 화면에서 승인하거나 반려할 수 있습니다.');
    }
}, 2000);

function newCode() {
    const U = users();
    for (let i = 0; i < 20; i++) {
        const a = new Uint8Array(5); crypto.getRandomValues(a);
        const c = 's' + Date.now().toString(36) + hex(a.buffer).slice(0, 6);
        if (!U[c]) return c;
    }
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
window.signupApprove = async function (id) {
    if (!isAdmin()) return;
    const d = dbr(); if (!d) return;
    const s = signups[id];
    if (!s || s.st !== 'wait') { say('이미 처리된 신청입니다.'); return; }
    const U = users();
    if (Object.keys(U).some(function (c) { return U[c] && U[c].name === s.name; })) {
        say('같은 사원명이 이미 있습니다 — 「' + s.name + '」\n\n반려하고 다른 이름으로 다시 신청하게 해 주세요.');
        return;
    }
    if (typeof buildNewUser !== 'function') { say('사원 기록을 만들 수 없습니다.'); return; }
    const code = newCode();
    const u = buildNewUser(code, s.name, s.aff, '사원', '현장탐사팀');
    u.signedUpAt = s.at || Date.now();
    try {
        const up = {};
        up['users/' + code] = u;
        up['pw/' + code] = { s: s.salt, h: s.hash, at: Date.now() };
        up['signups/' + id] = null;
        await d.ref().update(up);
        try { db.users[code] = u; } catch (e) { }
        try { addHistoryLog(me(), '[가입 승인] ' + s.name + ' · ' + s.aff + ' · 사번 ' + u.no); } catch (e) { }
        // 🎁 웰컴 패키지 팩 — 상담사 발급과 같이 선물함으로 (welcome.js · 2026-10-26)
        try { if (typeof window.welcomeAuto === 'function') window.welcomeAuto(code, s.aff, '현장탐사팀'); } catch (e) { console.warn('[가입] 웰컴 패키지', e); }
        say('승인했습니다 — ' + s.name + '\n\n사번 ' + u.no + ' · ' + s.aff + ' · 현장탐사팀 · 사원');
    } catch (e) {
        console.error('[가입] 승인 실패', e);
        say('승인하지 못했습니다.');
    }
};
window.signupReject = async function (id) {
    if (!isAdmin()) return;
    const d = dbr(); if (!d) return;
    const s = signups[id];
    if (!s || s.st !== 'wait') { say('이미 처리된 신청입니다.'); return; }
    try {
        await d.ref('signups/' + id).update({ st: 'no', doneAt: Date.now() });
        say('반려했습니다 — ' + s.name);
    } catch (e) { say('반려하지 못했습니다.'); }
};
// 상담사 화면을 열 때마다 칸을 다시 그린다
setInterval(function () { try { if (isAdmin() && !el('signup-admin-box')) paintAdmin(); } catch (e) { } }, 2000);

window.signupState = function () {
    console.table(Object.keys(signups).map(function (k) { const s = signups[k]; return { 자리: k, 사원명: s.name, 소속: s.aff, 상태: s.st, 때: new Date(s.at || 0).toLocaleString() }; }));
};

console.log('[가입] 가입 신청 · 상담사 승인 · 사원명 + 비밀번호 접속 — signupState()');

})();
