// ==========================================
// 🏆 테트리스 대회 — 개인전 · 팀전 토너먼트 · 관전 · 중계 (2026-11-16 사용자)
// bundles.json 마지막 묶음 — tet-ride.js · potion-chat.js 뒤 (plaza.js ☰ 「오락」 칸 「🏆 테트리스 대회」 → tetCupOpen)
// ==========================================
//
// ■ 사용자
//   「테트리스를 대회 형식으로 할 수 있는 시스템을 만들자.
//    팀전 — 한 팀당 3명으로 이루어져 있으며 토너먼트식으로 올라감. 다른 사람들은 관전이 가능하며 (팀원이) 개별적으로 점수를 쌓는 형식.
//           최종적으로 많은 점수를 얻는 팀이 승리.
//    개인전 — 지금 대전 모드와 동일하되, 사회자(중계자)와 관전자들은 둘의 화면을 동시에 볼 수 있으며 스트리밍처럼 댓글 달고 이모지를 달 수 있음.
//           중계자는 채팅 색이 다르게 해주고 중계자 채팅은 관전자들 채팅과 다른 쪽에 뜨는 식으로.」
//   고른 것 — 팀전 한 경기는 2팀 맞대결 · 팀원 각자 게임 오버까지 · 개인전도 토너먼트로 올라감 · 상담사가 열고 중계자를 지정
//
// ■ 흐름
//   상담사  ☰ 오락 「🏆 테트리스 대회」 → 중계자를 고르고 「개인전 열기」 / 「팀전 열기」
//   사원    같은 칸에서 참가 신청 (팀전은 「새 팀 만들기」 · 다른 팀에 「합류」 — 3명이 찬 팀만 대진표에 들어간다)
//   상담사  「대진표 만들고 시작」 (섞어서 · 모자라면 부전승) → 경기마다 「부르기」
//   선수    위쪽 띠의 「입장」 → 선수가 모두 입장하면 3초 뒤 오락기 창이 열리며 시작
//   개인전 경기 — 지금 대전과 같다 (dark.js duels/<id> · 지운 줄로 공격 · 먼저 무너지면 진다). 걸린 것은 없다 (settleDuel 을 건너뛴다)
//   팀전 경기   — 여섯 명이 각자 혼자 친다 (공격 없음 · tet.mode 'cup') · 게임 오버까지 쌓은 점수를 팀마다 더해 많은 팀이 이긴다
//               점수까지 같으면 줄 수로 · 그것도 같으면 상담사가 고른다
//   끝나면 이긴 쪽이 다음 판으로 · 결승이 끝나면 우승 공지
//   선수가 나가 버린 경기 · 동점 — 상담사가 「승자 지정」
//
// ■ 관전 (스트리밍처럼)
//   경기 중인 선수들의 판(tetCup/live/<경기>)을 한 화면에 — 개인전 두 판 · 팀전 여섯 판 (팀마다 합계)
//   🎙 중계자 글은 금빛으로 위쪽(넓은 화면은 왼쪽)에 · 관전자 댓글은 아래쪽(넓은 화면은 오른쪽)에 흐른다
//   이모지 단추 — 누르면 보는 사람 모두의 화면 위로 떠오른다
//
// ■ 자리 (Firebase)
//   tetCup/cur  = { id, kind:'solo'|'team', st:'open'|'run'|'done', at, cast(중계자), castN, ents, R, live, champ }
//       ents/<eid> = { n: 이름(팀 이름), cap: 팀장, m: { <사원>: 이름 }, at }      개인전 eid = 그 사원 · 팀전 eid = 't…'
//       R/r<라운드>/m<번호> = { a, b, w, st:'wait'|'call'|'live'|'done', mid, rd:{<사원>:1}, go, sc:{<사원>:{s,l}}, tie }
//   tetCup/live/<mid>/<사원> = { g: 200 글자 판(. I O T S Z J L G), s, l, o }
//   tetCup/chat (push) = { n, t, k:'c'(중계)|'v'(관전), at } · tetCup/emo (push) = { e, at }
//
// ■ 콘솔
//   tetCupState()

(function tetCup() {
'use strict';

const ADMIN = 'kario0987';
const PATH = 'tetCup';
const EMO = ['👏', '🔥', '😂', '😮', '❤️', '👍', '🎉', '😱'];
const CAST_C = '#ffd36b';           // 중계자 글 빛깔
const COL = { I: '#4fc3f7', O: '#ffd54f', T: '#ba68c8', S: '#81c784', Z: '#e57373', J: '#7986cb', L: '#ffb74d', G: '#5a5a5a' };
const GO_MS = 3500;                 // 모두 입장하고 나서 시작까지

function u_() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function d_() { return (typeof database !== 'undefined') ? database : null; }
function me() { const u = u_(); return u ? String(u.code) : ''; }
function isAdmin() { return me() === ADMIN; }
function now() { return Date.now(); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function book() { try { return (typeof db !== 'undefined' && db && db.users) ? db.users : {}; } catch (e) { return {}; } }
function nameOf(c) { const u = book()[c]; return (u && u.name) || '?'; }
function noOf(c) { const u = book()[c]; return (u && u.no) || ''; }
function online(c) { try { return !!(typeof onlineUsersMap !== 'undefined' && onlineUsersMap && onlineUsersMap[c]); } catch (e) { return false; } }
function alert_(m) { try { if (typeof showCustomAlert === 'function') showCustomAlert(m); } catch (e) { } }
function notice(t) { try { if (typeof pushNotice === 'function') pushNotice(t); } catch (e) { } }
function fmt(n) { return (Number(n) || 0).toLocaleString('ko-KR'); }
function T() { try { return (typeof tet !== 'undefined') ? tet : null; } catch (e) { return null; } }
function dId() { try { return (typeof duelId !== 'undefined') ? duelId : null; } catch (e) { return null; } }
function inDark() { try { return !!(typeof darkRun !== 'undefined' && darkRun); } catch (e) { return false; } }

let CUR = null;                     // tetCup/cur
let PREV = null;
let CAST_LIST = [], castPick = '';  // 중계자 고르기 — 고르는 칸에는 목록 순번만 둔다 (인가 코드는 화면에 두지 않는다)

// ==========================================
// 1. 대진 — 둘레 계산
// ==========================================
function rKeys(c) { return Object.keys((c && c.R) || {}).sort(function (a, b) { return Number(a.slice(1)) - Number(b.slice(1)); }); }
function mKeys(c, rk) { return Object.keys((c && c.R && c.R[rk]) || {}).sort(function (a, b) { return Number(a.slice(1)) - Number(b.slice(1)); }); }
function roundName(c, rk) {
    const n = mKeys(c, rk).length;
    if (n === 1) return '결승';
    return (n * 2) + '강';
}
function ent(c, eid) { return (c && c.ents && c.ents[eid]) || null; }
function entName(c, eid) {
    if (eid === '-') return '부전승';
    if (!eid) return '—';
    const e = ent(c, eid);
    return e ? (e.n || '?') : '?';
}
function members(c, eid) { const e = ent(c, eid); return e && e.m ? Object.keys(e.m) : []; }
function memName(c, eid, code) { const e = ent(c, eid); return (e && e.m && e.m[code]) || nameOf(code); }
// 나는 어느 엔트리인가
function myEnt(c) {
    const m = me();
    if (!c || !c.ents || !m) return '';
    return Object.keys(c.ents).filter(function (k) { const e = c.ents[k]; return e && e.m && e.m[m]; })[0] || '';
}
// 지금 부르거나 치는 경기
function liveMatch(c) {
    let out = null;
    rKeys(c).forEach(function (rk) { mKeys(c, rk).forEach(function (mk) { const x = c.R[rk][mk]; if (!out && x && (x.st === 'call' || x.st === 'live')) out = { rk: rk, mk: mk, m: x }; }); });
    return out;
}
// 내가 선수인 경기 (부르는 중 · 치는 중)
function myMatch(c) {
    const lm = liveMatch(c);
    if (!lm) return null;
    const e = myEnt(c);
    if (!e || (lm.m.a !== e && lm.m.b !== e)) return null;
    return lm;
}
function playersOf(c, m) { return members(c, m.a).concat(members(c, m.b)); }

// 이긴 쪽을 적고 다음 판에 올린다 — 트랜잭션 안에서 부른다 (c 를 고친다)
function applyWin(c, rk, mk, w) {
    const m = c.R && c.R[rk] && c.R[rk][mk];
    if (!m || m.st === 'done' || !w) return false;
    m.w = w; m.st = 'done'; m.end = now();
    delete m.tie;
    if (c.live === rk + '_' + mk) c.live = null;
    const r = Number(rk.slice(1)), i = Number(mk.slice(1));
    const nx = c.R['r' + (r + 1)];
    if (nx) {
        const slot = nx['m' + Math.floor(i / 2)];
        if (slot) slot[i % 2 === 0 ? 'a' : 'b'] = w;
    } else {
        c.champ = w; c.st = 'done'; c.endAt = now();
    }
    return true;
}
function tx(fn) {
    const d = d_();
    if (!d) return Promise.resolve(null);
    return d.ref(PATH + '/cur').transaction(function (c) {
        if (!c) return;
        const r = fn(c);
        return r === false ? undefined : c;
    });
}
function liveOff(mid) {
    const d = d_();
    if (!d || !mid) return;
    setTimeout(function () { try { d.ref(PATH + '/live/' + mid).remove(); } catch (e) { } }, 15000);
}

// ==========================================
// 2. 상담사 — 열기 · 대진표 · 부르기 · 승자 지정 · 닫기
// ==========================================
function openCup(kind) {
    const d = d_();
    if (!d || !isAdmin()) return;
    const cast = castPick;
    if (!cast) { alert_('🎙 중계자를 골라 주세요.'); return; }
    const go = function () {
        const cur = { id: 'c' + now().toString(36), kind: kind, st: 'open', at: now(), cast: cast, castN: nameOf(cast), ents: null, R: null, live: null, champ: null };
        d.ref(PATH).set({ cur: cur }).then(function () { paint(); });
    };
    if (CUR && CUR.st === 'run') {
        if (typeof showCustomConfirm === 'function') { showCustomConfirm('진행 중인 대회가 있습니다.\n지우고 새로 여시겠습니까?', go); return; }
        if (!window.confirm('진행 중인 대회가 있습니다. 지우고 새로 여시겠습니까?')) return;
    }
    go();
}
function castSet() {
    const d = d_();
    if (!d || !isAdmin() || !CUR) return;
    const cast = castPick;
    if (!cast) { alert_('🎙 새 중계자를 골라 주세요.'); return; }
    d.ref(PATH + '/cur').update({ cast: cast, castN: nameOf(cast) });
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function makeBracket() {
    if (!isAdmin() || !CUR || CUR.st !== 'open') return;
    const ok = Object.keys(CUR.ents || {}).filter(function (k) { return CUR.kind !== 'team' || members(CUR, k).length === 3; });
    if (ok.length < 2) { alert_(CUR.kind === 'team' ? '3명이 다 찬 팀이 둘 이상 있어야 합니다.' : '참가자가 둘 이상 있어야 합니다.'); return; }
    const short = Object.keys(CUR.ents || {}).length - ok.length;
    const go = function () {
        tx(function (c) {
            if (c.st !== 'open') return false;
            const eids = shuffle(Object.keys(c.ents || {}).filter(function (k) { return c.kind !== 'team' || members(c, k).length === 3; }));
            if (eids.length < 2) return false;
            // 다 차지 않은 팀은 빠진다
            Object.keys(c.ents || {}).forEach(function (k) { if (eids.indexOf(k) < 0) delete c.ents[k]; });
            let size = 2; while (size < eids.length) size *= 2;
            const nR = Math.round(Math.log(size) / Math.log(2));
            const R = {};
            for (let r = 0; r < nR; r++) {
                R['r' + r] = {};
                const n = size / Math.pow(2, r + 1);
                for (let i = 0; i < n; i++) R['r' + r]['m' + i] = { a: '', b: '', st: 'wait' };
            }
            const m0 = size / 2, byes = size - eids.length, byeAt = {};
            for (let k = 0; k < byes; k++) byeAt[Math.floor(k * m0 / byes)] = 1;
            let q = 0;
            for (let i = 0; i < m0; i++) { const mt = R.r0['m' + i]; mt.a = eids[q++]; mt.b = byeAt[i] ? '-' : eids[q++]; }
            c.R = R; c.st = 'run'; c.runAt = now(); c.live = null;
            for (let i = 0; i < m0; i++) { const mt = R.r0['m' + i]; if (mt.b === '-') applyWin(c, 'r0', 'm' + i, mt.a); }
            return true;
        }).then(function (r) {
            if (r && r.committed) notice('🏆 <b>테트리스 대회</b> 대진표가 나왔습니다. ☰ 오락 「테트리스 대회」에서 볼 수 있습니다.');
        });
    };
    const msg = (short > 0 ? '3명이 다 차지 않은 팀 ' + short + '개는 빠집니다.\n' : '') + ok.length + (CUR.kind === 'team' ? '팀' : '명') + '으로 대진표를 만들고 시작할까요?\n(신청은 닫힙니다)';
    if (typeof showCustomConfirm === 'function') showCustomConfirm(msg, go); else if (window.confirm(msg)) go();
}
function callMatch(rk, mk) {
    if (!isAdmin() || !CUR) return;
    if (liveMatch(CUR)) { alert_('진행 중인 경기가 끝난 뒤에 부를 수 있습니다.'); return; }
    tx(function (c) {
        const m = c.R && c.R[rk] && c.R[rk][mk];
        if (!m || m.st !== 'wait' || !m.a || !m.b || m.b === '-' || liveMatch(c)) return false;
        m.st = 'call'; m.mid = 'cup_' + now().toString(36) + Math.floor(Math.random() * 900 + 100);
        m.rd = null; m.sc = null; m.go = null; m.callAt = now();
        c.live = rk + '_' + mk;
        return true;
    });
}
function forceWin(rk, mk, side) {
    if (!isAdmin() || !CUR) return;
    const m = CUR.R && CUR.R[rk] && CUR.R[rk][mk];
    if (!m) return;
    const w = side === 'a' ? m.a : m.b;
    const go = function () {
        tx(function (c) { return applyWin(c, rk, mk, w); }).then(function (r) { if (r && r.committed) liveOff(m.mid); });
    };
    const msg = '「' + entName(CUR, w) + '」을(를) 이긴 쪽으로 정할까요?';
    if (typeof showCustomConfirm === 'function') showCustomConfirm(msg, go); else if (window.confirm(msg)) go();
}
function closeCup() {
    const d = d_();
    if (!d || !isAdmin()) return;
    const go = function () { d.ref(PATH).remove().then(function () { paint(); }); };
    const msg = '대회를 닫고 기록을 지울까요?';
    if (typeof showCustomConfirm === 'function') showCustomConfirm(msg, go); else if (window.confirm(msg)) go();
}

// ==========================================
// 3. 사원 — 신청 · 팀 만들기 · 합류 · 나가기
// ==========================================
function joinSolo() {
    const d = d_(), u = u_();
    if (!d || !u || !CUR || CUR.st !== 'open' || CUR.kind !== 'solo') return;
    const m = {}; m[u.code] = u.name || '?';
    d.ref(PATH + '/cur/ents/' + u.code).set({ n: u.name || '?', m: m, at: now() });
}
function leave() {
    const d = d_(), u = u_();
    if (!d || !u || !CUR || CUR.st !== 'open') return;
    const e = myEnt(CUR);
    if (!e) return;
    if (CUR.kind === 'solo') { d.ref(PATH + '/cur/ents/' + e).remove(); return; }
    d.ref(PATH + '/cur/ents/' + e).transaction(function (v) {
        if (!v || !v.m) return v;
        delete v.m[u.code];
        if (!Object.keys(v.m).length) return null;                        // 빈 팀은 없앤다
        if (v.cap === u.code) v.cap = Object.keys(v.m)[0];                 // 팀장이 나가면 남은 사람이
        return v;
    });
}
function newTeam() {
    const u = u_();
    if (!u || !CUR || CUR.st !== 'open' || CUR.kind !== 'team') return;
    if (myEnt(CUR)) { alert_('이미 팀에 들어가 있습니다.'); return; }
    const go = function (v) {
        const n = String(v || '').trim().slice(0, 16);
        if (!n) return;
        const d = d_();
        if (!d || !CUR || CUR.st !== 'open' || myEnt(CUR)) return;
        const m = {}; m[u.code] = u.name || '?';
        d.ref(PATH + '/cur/ents/t' + now().toString(36) + Math.floor(Math.random() * 90 + 10)).set({ n: n, cap: u.code, m: m, at: now() });
    };
    if (typeof openTextInput === 'function') openTextInput('🏆 새 팀 만들기', '팀 이름을 적어 주세요. (16자까지)<br><span style="font-size:10px; color:#888;">3명이 차야 대진표에 들어갑니다.</span>', '팀 이름', go);
    else go(window.prompt('팀 이름', ''));
}
function joinTeam(eid) {
    const d = d_(), u = u_();
    if (!d || !u || !CUR || CUR.st !== 'open' || CUR.kind !== 'team') return;
    if (myEnt(CUR)) { alert_('이미 팀에 들어가 있습니다.'); return; }
    d.ref(PATH + '/cur/ents/' + eid).transaction(function (v) {
        if (!v || !v.m) return v;
        if (Object.keys(v.m).length >= 3 || v.m[u.code]) return;           // 다 찼다 — 그만둔다
        v.m[u.code] = u.name || '?';
        return v;
    }).then(function (r) { if (r && !r.committed) alert_('그 팀은 다 찼습니다.'); });
}

// ==========================================
// 4. 패널 — ☰ 오락 「🏆 테트리스 대회」
// ==========================================
function css() {
    if (document.getElementById('cup-css')) return;
    const s = document.createElement('style');
    s.id = 'cup-css';
    s.textContent = [
        '#cup-pn{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;}',
        '#cup-pn .bx{background:#141218;border:1px solid #5a4a2a;border-radius:14px;width:100%;max-width:560px;max-height:100%;overflow:auto;padding:14px;box-sizing:border-box;color:#ddd;font-size:12px;}',
        '#cup-pn h3{margin:0 0 4px;font-size:15px;color:#ffe08a;display:flex;align-items:center;gap:8px;}',
        '#cup-pn h3 .x{margin-left:auto;background:none;border:1px solid #444;color:#aaa;border-radius:8px;padding:4px 10px;font-family:inherit;cursor:pointer;}',
        '#cup-pn .sub{font-size:11px;color:#999;margin-bottom:10px;line-height:1.6;}',
        '#cup-pn .cb{display:inline-block;margin:0;padding:9px 12px;border-radius:9px;border:1px solid #6b5a2a;background:#2a2316;color:#ffe08a;font-size:12px;font-family:inherit;cursor:pointer;}',
        '#cup-pn .cb.w{width:100%;margin-top:8px;}',
        '#cup-pn .cb.g{border-color:#3a3a3a;background:#1c1c1c;color:#aaa;}',
        '#cup-pn .cb.s{padding:5px 9px;font-size:11px;}',
        '#cup-pn .cb:disabled{opacity:.45;}',
        '#cup-pn .card{background:rgba(255,255,255,.03);border:1px solid #2e2a22;border-radius:10px;padding:10px;margin:8px 0;}',
        '#cup-pn .ttl{font-size:11px;color:#d4af37;font-weight:bold;margin-bottom:6px;}',
        '#cup-pn .row{display:flex;align-items:center;gap:6px;margin:4px 0;}',
        '#cup-pn .row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#cup-pn select{width:100%;font-size:12px;margin:4px 0 0;}',
        '#cup-pn .brk{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;}',
        '#cup-pn .rd{flex:0 0 auto;min-width:150px;display:flex;flex-direction:column;gap:6px;}',
        '#cup-pn .rd .ms{flex:1;display:flex;flex-direction:column;justify-content:space-around;gap:8px;}',
        '#cup-pn .rd .rn{font-size:10px;color:#d4af37;text-align:center;font-weight:bold;}',
        '#cup-pn .mt{background:#1b1914;border:1px solid #3a3326;border-radius:8px;padding:6px 7px;font-size:11px;}',
        '#cup-pn .mt.lv{border-color:#e0583a;box-shadow:0 0 0 1px rgba(224,88,58,.35);}',
        '#cup-pn .mt .sd{display:flex;justify-content:space-between;gap:6px;padding:2px 0;color:#bbb;}',
        '#cup-pn .mt .sd.w{color:#ffe08a;font-weight:bold;}',
        '#cup-pn .mt .sd.l{color:#666;text-decoration:line-through;}',
        '#cup-pn .mt .bt{display:flex;gap:4px;margin-top:5px;flex-wrap:wrap;}',
        '#cup-pn .lvb{font-size:9px;color:#fff;background:#c0392b;border-radius:6px;padding:1px 5px;margin-left:4px;}',
        '#cup-pn .champ{text-align:center;font-size:16px;color:#ffe08a;font-weight:bold;padding:10px 0;}',
        // 띠 (부름 · 관전)
        '#cup-bn{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 46px);transform:translateX(-50%);z-index:10002;background:rgba(20,16,10,.95);border:1px solid #8a6a2a;color:#ffe08a;border-radius:14px;padding:8px 10px 8px 14px;font-size:12px;display:flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(0,0,0,.5);max-width:calc(100vw - 24px);box-sizing:border-box;}',
        '#cup-bn .t{flex:1;min-width:0;line-height:1.45;}',
        '#cup-bn button{border:1px solid #8a6a2a;background:#3a2c12;color:#ffe08a;border-radius:9px;padding:6px 10px;font-size:12px;font-family:inherit;cursor:pointer;white-space:nowrap;}',
        '#cup-bn button.x{background:none;border-color:#444;color:#888;padding:6px 8px;}',
        // 관전
        '#cup-ov{position:fixed;inset:0;z-index:10001;background:#08080b;color:#ddd;display:grid;grid-template-columns:1fr;grid-template-rows:auto auto 1fr auto;font-size:12px;}',
        '#cup-ov .top{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px;border-bottom:1px solid #222;}',
        '#cup-ov .top b{color:#ffe08a;font-size:13px;}',
        '#cup-ov .top .k{color:#888;font-size:11px;}',
        '#cup-ov .top button{margin-left:auto;border:1px solid #444;background:#151515;color:#aaa;border-radius:8px;padding:5px 11px;font-family:inherit;cursor:pointer;}',
        '#cup-cast{padding:6px 12px;background:linear-gradient(90deg,rgba(255,211,107,.10),rgba(255,211,107,.02));border-bottom:1px solid #3a3020;min-height:20px;}',
        '#cup-cast .ln{color:' + CAST_C + ';font-weight:bold;font-size:12.5px;line-height:1.55;}',
        '#cup-cast .ln .who{font-size:10px;opacity:.75;margin-right:6px;}',
        '#cup-cast .emp{color:#6a5a3a;font-size:11px;}',
        '#cup-stage{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:8px;min-height:0;}',
        '#cup-stage .wait{color:#777;text-align:center;line-height:1.8;}',
        '#cup-stage .tm{display:flex;flex-direction:column;align-items:center;gap:4px;}',
        '#cup-stage .tmh{font-size:12px;color:#ffe08a;font-weight:bold;}',
        '#cup-stage .tmh .sum{color:#fff;margin-left:6px;}',
        '#cup-stage .tmh.win{color:#7dffb0;}',
        '#cup-stage .bds{display:flex;gap:8px;justify-content:center;}',
        '#cup-stage .bd{display:flex;flex-direction:column;align-items:center;gap:3px;}',
        '#cup-stage .bd .nm{font-size:11px;color:#ccc;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '#cup-stage .bd .nm.o{color:#f44336;}',
        '#cup-stage .bd .sc{font-size:10px;color:#999;}',
        '#cup-stage .gr{display:grid;grid-template-columns:repeat(10,var(--c));grid-template-rows:repeat(20,var(--c));gap:1px;background:#111;border:1px solid #333;padding:2px;border-radius:4px;}',
        '#cup-stage .gr.o{opacity:.45;filter:grayscale(.6);}',
        '#cup-stage .gr i{display:block;border-radius:1px;background:rgba(255,255,255,.035);}',
        '#cup-stage .vs{color:#e0583a;font-weight:bold;font-size:14px;}',
        '#cup-fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;}',
        '#cup-fx span{position:absolute;bottom:-10px;font-size:26px;animation:cupUp 2.6s ease-out forwards;}',
        '@keyframes cupUp{0%{transform:translateY(0) scale(.7);opacity:0}12%{opacity:1}100%{transform:translateY(-75vh) scale(1.25);opacity:0}}',
        '#cup-side{display:flex;flex-direction:column;min-height:0;border-top:1px solid #222;}',
        '#cup-feed{height:130px;overflow-y:auto;padding:6px 12px;display:flex;flex-direction:column;gap:2px;}',
        '#cup-feed .ln{line-height:1.5;word-break:break-all;}',
        '#cup-feed .ln .who{color:#9ab;font-weight:bold;margin-right:6px;}',
        '#cup-emo{display:flex;gap:4px;padding:4px 10px;overflow-x:auto;}',
        '#cup-emo button{font-size:18px;background:#16161a;border:1px solid #2a2a30;border-radius:9px;padding:3px 7px;cursor:pointer;}',
        '#cup-in{display:flex;gap:6px;padding:6px 10px calc(env(safe-area-inset-bottom,0px) + 8px);}',
        '#cup-in input{flex:1;min-width:0;font-size:13px;padding:8px 10px;border-radius:9px;border:1px solid #333;background:#111;color:#eee;}',
        '#cup-in input.cast{border-color:#8a6a2a;color:' + CAST_C + ';}',
        '#cup-in button{border:1px solid #444;background:#1c1c1c;color:#ddd;border-radius:9px;padding:0 12px;font-family:inherit;}',
        // 넓은 화면 — 중계(왼쪽) · 판(가운데) · 관전자 댓글(오른쪽)
        '@media (min-width:900px){',
        '  #cup-ov{grid-template-columns:240px 1fr 280px;grid-template-rows:auto 1fr;}',
        '  #cup-ov .top{grid-column:1 / 4;}',
        '  #cup-cast{grid-column:1;grid-row:2;border-bottom:none;border-right:1px solid #3a3020;overflow-y:auto;padding:12px;background:linear-gradient(180deg,rgba(255,211,107,.08),rgba(255,211,107,.01));}',
        '  #cup-stage{grid-column:2;grid-row:2;}',
        '  #cup-side{grid-column:3;grid-row:2;border-top:none;border-left:1px solid #222;}',
        '  #cup-feed{height:auto;flex:1;}',
        '}'
    ].join('\n');
    document.head.appendChild(s);
}

function bracketHtml(c) {
    const adm = isAdmin();
    const busy = !!liveMatch(c);
    let h = '<div class="brk">';
    rKeys(c).forEach(function (rk) {
        h += '<div class="rd"><div class="rn">' + esc(roundName(c, rk)) + '</div><div class="ms">';
        mKeys(c, rk).forEach(function (mk) {
            const m = c.R[rk][mk];
            const lv = m.st === 'call' || m.st === 'live';
            const side = function (k) {
                const eid = m[k];
                const cls = m.st === 'done' && eid && eid !== '-' ? (m.w === eid ? ' w' : ' l') : '';
                let sc = '';
                if (c.kind === 'team' && m.sc && eid && eid !== '-') {
                    let s = 0, any = false;
                    members(c, eid).forEach(function (p) { if (m.sc[p]) { any = true; s += Number(m.sc[p].s) || 0; } });
                    if (any) sc = fmt(s);
                }
                return '<div class="sd' + cls + '"><span>' + esc(entName(c, eid)) + '</span><span>' + sc + '</span></div>';
            };
            h += '<div class="mt' + (lv ? ' lv' : '') + '">' + side('a') + side('b');
            if (lv) h += '<div style="font-size:10px;color:#e0583a;margin-top:3px;">' + (m.st === 'call' ? '📣 입장을 기다리는 중' : '🔴 경기 중') + (m.tie ? ' · 동점 — 상담사가 고릅니다' : '') + '</div>';
            if (adm && c.st === 'run') {
                let b = '';
                if (m.st === 'wait' && m.a && m.b && m.b !== '-') b += '<button class="cb s" data-act="call" data-r="' + rk + '" data-m="' + mk + '"' + (busy ? ' disabled' : '') + '>📣 부르기</button>';
                if (lv) b += '<button class="cb s g" data-act="win" data-side="a" data-r="' + rk + '" data-m="' + mk + '">' + esc(entName(c, m.a)) + ' 승</button><button class="cb s g" data-act="win" data-side="b" data-r="' + rk + '" data-m="' + mk + '">' + esc(entName(c, m.b)) + ' 승</button>';
                if (b) h += '<div class="bt">' + b + '</div>';
            }
            h += '</div>';
        });
        h += '</div></div>';
    });
    return h + '</div>';
}
function castSelect(c) {
    const us = book();
    const list = Object.keys(us).filter(function (k) { return us[k] && us[k].name; }).sort(function (a, b) { return String(us[a].name).localeCompare(String(us[b].name), 'ko'); });
    const cur = castPick || (c && c.cast ? c.cast : '');
    CAST_LIST = list;
    return '<select id="cup-cast-sel"><option value="">🎙 중계자 고르기</option>' + list.map(function (k, i) {
        return '<option value="' + i + '"' + (k === cur ? ' selected' : '') + '>' + esc(us[k].name) + (us[k].no ? ' · ' + esc(us[k].no) : '') + (online(k) ? ' ●' : '') + '</option>';
    }).join('') + '</select>';
}
function panelHtml() {
    const c = CUR, adm = isAdmin(), mine = myEnt(c);
    let h = '<h3>🏆 테트리스 대회<button class="x" data-act="close">✕</button></h3>';
    if (!c) {
        h += '<div class="sub">열린 대회가 없습니다.</div>';
        if (adm) h += '<div class="card"><div class="ttl">대회 열기</div>' + castSelect(null)
            + '<div class="row" style="margin-top:8px;"><button class="cb" style="flex:1" data-act="open" data-k="solo">🎮 개인전 열기</button><button class="cb" style="flex:1" data-act="open" data-k="team">👥 팀전 열기 (3인)</button></div>'
            + '<div class="sub" style="margin:8px 0 0;">개인전 — 지금 대전처럼 1:1 (공격 줄 · 먼저 무너지면 패배)<br>팀전 — 3명씩 두 팀 · 각자 게임 오버까지 쌓은 점수의 합으로 승부</div></div>';
        return h;
    }
    const kindN = c.kind === 'team' ? '팀전 (3인)' : '개인전';
    h += '<div class="sub">' + kindN + ' · 🎙 중계 <b style="color:' + CAST_C + '">' + esc(c.castN || nameOf(c.cast)) + '</b>'
        + (c.st === 'open' ? ' · <span style="color:#7dffb0">신청 받는 중</span>' : c.st === 'run' ? ' · <span style="color:#e0583a">진행 중</span>' : ' · 끝남') + '</div>';
    if (c.st === 'done' && c.champ) {
        h += '<div class="champ">🏆 우승 — ' + esc(entName(c, c.champ)) + '</div>';
        if (c.kind === 'team') h += '<div class="sub" style="text-align:center;">' + members(c, c.champ).map(function (p) { return esc(memName(c, c.champ, p)); }).join(' · ') + '</div>';
    }
    if (c.st === 'open') {
        const es = Object.keys(c.ents || {}).sort(function (a, b) { return (c.ents[a].at || 0) - (c.ents[b].at || 0); });
        if (c.kind === 'solo') {
            h += '<div class="card"><div class="ttl">참가자 ' + es.length + '명</div>'
                + (es.length ? es.map(function (k) { return '<div class="row"><span class="nm">' + esc(c.ents[k].n) + (noOf(k) ? ' <span style="color:#777">· ' + esc(noOf(k)) + '</span>' : '') + '</span>' + (online(k) ? '<span style="color:#4CAF50">●</span>' : '') + '</div>'; }).join('') : '<div class="sub" style="margin:0">아직 없습니다.</div>')
                + '</div>';
            h += mine ? '<button class="cb w g" data-act="leave">신청 취소</button>' : '<button class="cb w" data-act="join">🎮 참가 신청</button>';
        } else {
            h += '<div class="card"><div class="ttl">팀 ' + es.length + '개 <span style="color:#888;font-weight:normal">(3명이 찬 팀만 대진표에 들어갑니다)</span></div>';
            h += es.length ? es.map(function (k) {
                const e = c.ents[k], ms = members(c, k);
                return '<div class="card" style="margin:6px 0;"><div class="row"><span class="nm" style="color:#ffe08a;font-weight:bold;">' + esc(e.n) + '</span><span style="color:' + (ms.length === 3 ? '#4CAF50' : '#999') + '">' + ms.length + ' / 3</span>'
                    + (!mine && ms.length < 3 ? '<button class="cb s" data-act="tjoin" data-e="' + esc(k) + '">합류</button>' : '') + '</div>'
                    + '<div style="color:#bbb;font-size:11px;">' + ms.map(function (p) { return esc(e.m[p]) + (noOf(p) ? ' <span style="color:#666">· ' + esc(noOf(p)) + '</span>' : '') + (p === e.cap ? ' 👑' : ''); }).join('<br>') + '</div></div>';
            }).join('') : '<div class="sub" style="margin:0">아직 없습니다.</div>';
            h += '</div>';
            h += mine ? '<button class="cb w g" data-act="leave">팀 나가기</button>' : '<button class="cb w" data-act="tnew">👥 새 팀 만들기</button>';
        }
        if (adm) h += '<div class="card"><div class="ttl">상담사</div>' + castSelect(c)
            + '<div class="row" style="margin-top:8px;"><button class="cb s g" data-act="cast">중계자 바꾸기</button><button class="cb" style="flex:1" data-act="bracket">🗂 대진표 만들고 시작</button></div>'
            + '<button class="cb w g" data-act="closecup">대회 닫기 (지우기)</button></div>';
        return h;
    }
    // 진행 중 · 끝남 — 대진표
    const lm = liveMatch(c);
    if (lm) h += '<button class="cb w" data-act="watch">📺 ' + esc(roundName(c, lm.rk)) + ' 관전하기 — ' + esc(entName(c, lm.m.a)) + ' vs ' + esc(entName(c, lm.m.b)) + '</button>';
    else if (c.st === 'run') h += '<button class="cb w g" data-act="watch">📺 관전 화면 열기 (다음 경기를 기다립니다)</button>';
    h += '<div class="card"><div class="ttl">대진표</div>' + bracketHtml(c) + '</div>';
    if (c.kind === 'team') {
        h += '<div class="card"><div class="ttl">팀</div>' + Object.keys(c.ents || {}).map(function (k) {
            return '<div class="row"><span class="nm"><b style="color:#ffe08a">' + esc(c.ents[k].n) + '</b> <span style="color:#999">' + members(c, k).map(function (p) { return esc(memName(c, k, p)); }).join(' · ') + '</span></span></div>';
        }).join('') + '</div>';
    }
    if (adm) h += '<div class="card"><div class="ttl">상담사</div>' + castSelect(c) + '<div class="row" style="margin-top:8px;"><button class="cb s g" data-act="cast">중계자 바꾸기</button><button class="cb s g" style="margin-left:auto" data-act="closecup">대회 닫기 (지우기)</button></div></div>';
    return h;
}
function paint() {
    const pn = document.getElementById('cup-pn');
    if (!pn) return;
    const bx = pn.querySelector('.bx');
    const sc = bx.scrollTop;
    const brk = bx.querySelector('.brk'), bsc = brk ? brk.scrollLeft : 0;
    const h = panelHtml();
    if (bx._h === h) return;
    bx._h = h;
    bx.innerHTML = h;
    bx.scrollTop = sc;
    const nb = bx.querySelector('.brk'); if (nb) nb.scrollLeft = bsc;
}
function openPanel() {
    css();
    let pn = document.getElementById('cup-pn');
    if (!pn) {
        pn = document.createElement('div');
        pn.id = 'cup-pn';
        pn.innerHTML = '<div class="bx"></div>';
        pn.addEventListener('click', function (ev) {
            if (ev.target === pn) { pn.remove(); return; }
            const b = ev.target.closest('[data-act]');
            if (!b || b.disabled) return;
            const a = b.getAttribute('data-act');
            if (a === 'close') { pn.remove(); return; }
            if (a === 'open') openCup(b.getAttribute('data-k'));
            else if (a === 'cast') castSet();
            else if (a === 'bracket') makeBracket();
            else if (a === 'closecup') closeCup();
            else if (a === 'join') joinSolo();
            else if (a === 'leave') leave();
            else if (a === 'tnew') newTeam();
            else if (a === 'tjoin') joinTeam(b.getAttribute('data-e'));
            else if (a === 'call') callMatch(b.getAttribute('data-r'), b.getAttribute('data-m'));
            else if (a === 'win') forceWin(b.getAttribute('data-r'), b.getAttribute('data-m'), b.getAttribute('data-side'));
            else if (a === 'watch') { pn.remove(); watchOpen(); }
        });
        pn.addEventListener('change', function (ev) {
            if (ev.target && ev.target.id === 'cup-cast-sel') castPick = CAST_LIST[Number(ev.target.value)] || '';
        });
        document.body.appendChild(pn);
    }
    castPick = '';
    pn.querySelector('.bx')._h = '';
    paint();
}

// ==========================================
// 5. 선수 — 부름 · 입장 · 시작 · 판 올리기 · 끝
// ==========================================
let started = {};                    // mid → 이 화면에서 시작했다
try { const s = localStorage.getItem('tetCupGo'); if (s) started[s] = 'old'; } catch (e) { }
let myMid = '';                      // 지금 내가 치는 대회 경기
let doneShown = {};

function ready(lm) {
    const d = d_();
    if (!d || !lm) return;
    d.ref(PATH + '/cur/R/' + lm.rk + '/' + lm.mk + '/rd/' + me()).set(1).then(function () { tryGo(lm.rk, lm.mk); });
}
// 선수가 모두 입장했으면 — 3.5초 뒤 시작 (개인전은 대전 판(duels/<mid>)도 이때 만든다)
function tryGo(rk, mk) {
    let made = null;
    tx(function (c) {
        const m = c.R && c.R[rk] && c.R[rk][mk];
        if (!m || m.st !== 'call') return false;
        const ps = playersOf(c, m), rd = m.rd || {};
        if (!ps.length || !ps.every(function (p) { return rd[p]; })) return false;
        m.st = 'live'; m.go = now() + GO_MS;
        made = { kind: c.kind, mid: m.mid, a: m.a, b: m.b, an: entName(c, m.a), bn: entName(c, m.b), rn: roundName(c, rk) };
        return true;
    }).then(function (r) {
        if (!r || !r.committed || !made || made.kind !== 'solo') return;
        const d = d_();
        d.ref('duels/' + made.mid).set({
            id: made.mid, cup: 1,
            host: made.a, hostName: made.an, guest: made.b, guestName: made.bn,
            stake: { type: 'text', value: 'cup', label: '🏆 테트리스 대회 · ' + made.rn },
            state: 'PLAYING', createdAt: now(), hostLines: 0, guestLines: 0, hostAlive: true, guestAlive: true
        });
    });
}
function startMine(lm) {
    const c = CUR, m = lm.m, mid = m.mid;
    if (!mid || started[mid]) return;
    started[mid] = 1;
    try { localStorage.setItem('tetCupGo', mid); } catch (e) { }
    myMid = mid;
    const rn = roundName(c, lm.rk);
    try { const pn = document.getElementById('cup-pn'); if (pn) pn.remove(); } catch (e) { }
    try { watchClose(); } catch (e) { }
    if (c.kind === 'solo') {
        // 지금 대전과 같다 — dark.js 대전 판에 붙는다 (handleDuelState 가 startTetris('duel'))
        try { duelId = mid; duelIsHost = (m.a === me()); attachDuel(mid); } catch (e) { console.warn('[🏆 대회] 대전 판', e); }
        setTimeout(function () { const t = document.getElementById('tetris-title'); if (t) t.innerText = '🏆 테트리스 대회 · ' + rn; }, 400);
    } else {
        try { startTetris('cup'); } catch (e) { console.warn('[🏆 대회] 시작', e); return; }
        const t = T(); if (t) { t.cupMid = mid; t.cupR = lm.rk; t.cupM = lm.mk; }
        const tt = document.getElementById('tetris-title'); if (tt) tt.innerText = '🏆 테트리스 대회 · ' + rn + ' — 팀전';
    }
}
// 판 — 200 글자 (. 빈칸 · I O T S Z J L G)
function boardStr(t) {
    const g = t.grid.map(function (r) { return r.slice(); });
    if (!t.over && t.cur) {
        try { tetCells(t.cur, t.rot, t.pos.x, t.pos.y).forEach(function (p) { if (p[1] >= 0 && p[1] < 20 && p[0] >= 0 && p[0] < 10) g[p[1]][p[0]] = t.cur; }); } catch (e) { }
    }
    return g.map(function (r) { return r.map(function (v) { return v ? (COL[v] ? v : 'G') : '.'; }).join(''); }).join('');
}
function myPlaying() {
    const t = T();
    if (!t || !myMid) return null;
    if (t.mode === 'cup' && t.cupMid === myMid) return t;
    if (t.mode === 'duel' && dId() === myMid) return t;
    return null;
}
let pub = { g: '', s: -1, o: 0, at: 0 };
setInterval(function () {
    const d = d_(), t = myPlaying();
    if (!d || !t) return;
    const g = boardStr(t), o = t.over ? 1 : 0, n = now();
    if (g === pub.g && t.score === pub.s && o === pub.o && n - pub.at < 3000) return;
    if (n - pub.at < 140 && !o) return;
    pub = { g: g, s: t.score, o: o, at: n };
    try { d.ref(PATH + '/live/' + myMid + '/' + me()).set({ g: g, s: t.score || 0, l: t.lines || 0, o: o, n: (u_() || {}).name || '?' }); } catch (e) { }
}, 120);

// 팀전 — 게임 오버면 점수를 적고, 여섯 명이 다 끝났으면 승패를 낸다
function teamFinal(t) {
    const d = d_();
    if (!d || !t || !t.cupMid) return;
    const rk = t.cupR, mk = t.cupM, mid = t.cupMid;
    try { d.ref(PATH + '/live/' + mid + '/' + me()).set({ g: boardStr(t), s: t.score || 0, l: t.lines || 0, o: 1, n: (u_() || {}).name || '?' }); } catch (e) { }
    d.ref(PATH + '/cur/R/' + rk + '/' + mk + '/sc/' + me()).set({ s: t.score || 0, l: t.lines || 0 }).then(function () { teamJudge(rk, mk); });
}
function teamJudge(rk, mk) {
    let mid = '';
    tx(function (c) {
        const m = c.R && c.R[rk] && c.R[rk][mk];
        if (!m || m.st !== 'live' || m.tie) return false;
        const sc = m.sc || {};
        const A = members(c, m.a), B = members(c, m.b);
        if (!A.concat(B).every(function (p) { return sc[p]; })) return false;
        const sum = function (L, k) { return L.reduce(function (s, p) { return s + (Number(sc[p][k]) || 0); }, 0); };
        const sa = sum(A, 's'), sb = sum(B, 's');
        let w = sa > sb ? m.a : sb > sa ? m.b : '';
        if (!w) { const la = sum(A, 'l'), lb = sum(B, 'l'); w = la > lb ? m.a : lb > la ? m.b : ''; }
        if (!w) { m.tie = 1; return true; }
        mid = m.mid;
        return applyWin(c, rk, mk, w);
    }).then(function (r) { if (r && r.committed && mid) liveOff(mid); });
}
// 개인전 — 대전 판에서 누가 무너졌나 본다 (선수 · 상담사 화면)
const duelSeen = {};
function watchDuel(lm) {
    const d = d_(), mid = lm && lm.m && lm.m.mid;
    if (!d || !mid || duelSeen[mid]) return;
    duelSeen[mid] = 1;
    const rk = lm.rk, mk = lm.mk;
    const ref = d.ref('duels/' + mid);
    const h = ref.on('value', function (s) {
        const v = s.val();
        if (!v) return;
        let w = '';
        if (v.hostAlive === false) w = v.guest; else if (v.guestAlive === false) w = v.host;
        if (!w) return;
        try { ref.off('value', h); } catch (e) { }
        tx(function (c) {
            const m = c.R && c.R[rk] && c.R[rk][mk];
            if (!m || m.mid !== mid || m.st !== 'live') return false;
            return applyWin(c, rk, mk, w);
        }).then(function (r) { if (r && r.committed) liveOff(mid); });
    });
}
// 다시 열었을 때 — 치던 경기는 이어 칠 수 없다 (개인전은 기권 · 팀전은 마지막 점수로 끝)
function resume(lm) {
    const m = lm.m, mid = m.mid, d = d_();
    if (started[mid] !== 'old' || myPlaying()) return;
    started[mid] = 1;
    if (CUR.kind === 'solo') {
        const k = m.a === me() ? 'hostAlive' : 'guestAlive';
        try { d.ref('duels/' + mid + '/' + k).set(false); } catch (e) { }
        alert_('🏆 테트리스 대회 — 경기 도중에 화면을 다시 열어 기권 처리되었습니다.');
        return;
    }
    if (m.sc && m.sc[me()]) return;
    d.ref(PATH + '/live/' + mid + '/' + me()).once('value').then(function (s) {
        const v = s.val() || {};
        return d.ref(PATH + '/cur/R/' + lm.rk + '/' + lm.mk + '/sc/' + me()).set({ s: Number(v.s) || 0, l: Number(v.l) || 0 });
    }).then(function () { teamJudge(lm.rk, lm.mk); });
}

// 치고 있는 대회 판을 멈춘다 (상담사가 승자를 정했다 · 대회가 닫혔다) — 나간다 단추로 나올 수 있게
function stopMine(html, mid) {
    mid = mid || myMid;
    const t = T();
    if (!t || !mid || !((t.mode === 'cup' && t.cupMid === mid) || (t.mode === 'duel' && dId() === mid))) return false;
    if (!t.over) {
        t.over = true;
        try { clearInterval(t.timer); } catch (er) { }
        try { document.removeEventListener('keydown', tetKey); } catch (er) { }
        try { tetDraw(); } catch (er) { }
    }
    const msg = document.getElementById('tetris-msg');
    if (msg && html) msg.innerHTML = html;
    const q = document.getElementById('tetris-quit'); if (q) q.style.display = 'block';
    return true;
}
// 경기가 끝났다 — 치고 있는 판을 멈추고 결과를 적는다 (상담사가 승자를 정한 경우 포함)
function endMine(c, rk, mk, m) {
    if (doneShown[m.mid]) return;
    doneShown[m.mid] = 1;
    const t = T();
    const e = myEnt(c);
    const won = m.w === e;
    const champ = c.champ && c.champ === e;
    stopMine('<span style="color:' + (won ? '#7dffb0' : '#f44336') + '; font-weight:bold;">' + (champ ? '🏆 우승!' : won ? '🏆 이겼습니다 — 다음 경기로 올라갑니다' : '대회에서 떨어졌습니다') + '</span><br>'
        + '<span style="font-size:11px; color:#aaa;">' + esc(roundName(c, rk)) + ' · ' + ((t && t.lines) || 0) + '줄 / ' + fmt(t && t.score) + '점</span>'
        + '<br><button class="btn-cancel" style="margin-top:6px;" onclick="tetCupWatch()">📺 관전 화면</button>', m.mid);
    if (myMid === m.mid) myMid = '';
    try { if (localStorage.getItem('tetCupGo') === m.mid) localStorage.removeItem('tetCupGo'); } catch (er) { }
}

// 팀전 판의 오른쪽 — 두 팀 합계
function rivalPaint() {
    const t = T();
    if (!t || t.mode !== 'cup' || !CUR || !LIVE_ME) return;
    const el = document.getElementById('tetris-rival');
    if (!el) return;
    const m = CUR.R && CUR.R[t.cupR] && CUR.R[t.cupR][t.cupM];
    if (!m) return;
    const sum = function (eid) { return members(CUR, eid).reduce(function (s, p) { const v = LIVE_ME[p]; return s + (v ? Number(v.s) || 0 : 0); }, 0); };
    const e = myEnt(CUR), other = m.a === e ? m.b : m.a;
    const h = '<div style="border-top:1px dashed #333; padding-top:8px; margin-top:8px;">'
        + '<div style="color:#7dffb0; font-weight:bold; font-size:10px;">' + esc(entName(CUR, e)) + '</div><div style="font-size:14px; font-weight:bold; color:#ddd;">' + fmt(sum(e)) + '</div>'
        + '<div style="color:#c9a8ff; font-weight:bold; font-size:10px; margin-top:6px;">' + esc(entName(CUR, other)) + '</div><div style="font-size:14px; font-weight:bold; color:#ddd;">' + fmt(sum(other)) + '</div>'
        + '<div style="font-size:9px; color:#888; margin-top:6px;">팀 합계</div></div>';
    if (el._h !== h) { el._h = h; el.innerHTML = h; }
}
let LIVE_ME = null, liveMeRef = null, liveMeMid = '';
function liveMeOn(mid) {
    const d = d_();
    if (!d || liveMeMid === mid) return;
    if (liveMeRef) { try { liveMeRef.off(); } catch (e) { } }
    liveMeMid = mid; LIVE_ME = null; liveMeRef = null;
    if (!mid) return;
    liveMeRef = d.ref(PATH + '/live/' + mid);
    liveMeRef.on('value', function (s) { LIVE_ME = s.val() || {}; rivalPaint(); });
}

// 팀전 판의 끝 · 나가기 막기 — dark.js 를 감싼다
(function hookTet() {
    const iv = setInterval(function () {
        if (typeof window.tetGameOver !== 'function' || typeof window.exitTetris !== 'function' || typeof window.settleDuel !== 'function') return;
        if (!window.tetGameOver._cup) {
            const f = window.tetGameOver;
            const w = function () {
                const t = T();
                if (t && t.mode === 'cup') {
                    if (t.over) return;
                    t.over = true;
                    try { clearInterval(t.timer); } catch (e) { }
                    try { document.removeEventListener('keydown', tetKey); } catch (e) { }
                    const msg = document.getElementById('tetris-msg');
                    if (msg) msg.innerHTML = '<span style="color:#d4af37; font-weight:bold;">종료 — ' + (t.lines || 0) + '줄 / ' + fmt(t.score) + '점</span><br>'
                        + '<span style="font-size:11px; color:#aaa;">모두 끝나면 팀 합계로 승부가 납니다.</span><br><button class="btn-cancel" style="margin-top:6px;" onclick="tetCupWatch()">📺 관전 화면</button>';
                    const q = document.getElementById('tetris-quit'); if (q) q.style.display = 'block';
                    teamFinal(t);
                    return;
                }
                return f.apply(this, arguments);
            };
            Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
            w._cup = true;
            window.tetGameOver = w;
            try { tetGameOver = w; } catch (e) { }
        }
        if (!window.exitTetris._cup) {
            const f = window.exitTetris;
            const w = function () {
                const t = T();
                if (t && !t.over && t.mode === 'cup') { try { const m = document.getElementById('tetris-msg'); if (m) m.innerHTML = '<span style="color:#f44336;">대회 경기 중에는 나갈 수 없습니다.</span>'; } catch (e) { } return; }
                return f.apply(this, arguments);
            };
            Object.keys(f).forEach(function (k) { try { w[k] = f[k]; } catch (e) { } });
            w._cup = true;
            window.exitTetris = w;
            try { exitTetris = w; } catch (e) { }
        }
        // 개인전 대전 판 — 걸린 것이 없다 (포인트 · 소지품 · 대전 공지를 건너뛴다) · 판은 조금 뒤에 걷는다
        if (!window.settleDuel._cup) {
            const f = window.settleDuel;
            const w = function () {
                const id = String(dId() || '');
                if (id.indexOf('cup_') === 0) {
                    setTimeout(function () { try { d_().ref('duels/' + id).remove(); } catch (e) { } }, 8000);
                    return;
                }
                return f.apply(this, arguments);
            };
            w._cup = true;
            window.settleDuel = w;
            try { settleDuel = w; } catch (e) { }
        }
        if (window.tetGameOver._cup && window.exitTetris._cup && window.settleDuel._cup) clearInterval(iv);
    }, 600);
})();

// ==========================================
// 6. 띠 — 선수에게는 「입장」 · 다른 사람에게는 「관전」
// ==========================================
const shut = {};
function bnPaint() {
    const c = CUR;
    let b = document.getElementById('cup-bn');
    const lm = c && c.st === 'run' ? liveMatch(c) : null;
    let h = '';
    if (lm) {
        const mine = myMatch(c);
        const rn = roundName(c, lm.rk), vs = esc(entName(c, lm.m.a)) + ' vs ' + esc(entName(c, lm.m.b));
        if (mine && lm.m.st === 'call') {
            const rd = lm.m.rd || {}, ps = playersOf(c, lm.m);
            const n = ps.filter(function (p) { return rd[p]; }).length;
            h = rd[me()]
                ? '<div class="t">🏆 ' + esc(rn) + ' · ' + vs + '<br><span style="color:#aaa;font-size:11px;">입장했습니다 — 다른 선수를 기다립니다 (' + n + ' / ' + ps.length + ')</span></div>'
                : '<div class="t">🏆 테트리스 대회 ' + esc(rn) + ' — 경기에 부릅니다<br><span style="color:#aaa;font-size:11px;">' + vs + '</span></div><button data-b="in">입장</button>';
        } else if (mine && lm.m.st === 'live' && !myPlaying() && lm.m.go && now() < lm.m.go) {
            h = '<div class="t">🏆 ' + esc(rn) + ' — 곧 시작합니다 (' + Math.max(1, Math.ceil((lm.m.go - now()) / 1000)) + ')</div>';
        } else if (!mine && !shut[lm.m.mid] && !document.getElementById('cup-ov') && !inDark() && !(document.body && document.body.classList.contains('rg-on'))) {
            h = '<div class="t">🏆 테트리스 대회 ' + esc(rn) + (lm.m.st === 'live' ? ' 🔴' : '') + '<br><span style="color:#aaa;font-size:11px;">' + vs + '</span></div><button data-b="watch">📺 관전</button><button class="x" data-b="x">✕</button>';
        }
    }
    if (!h) { if (b) b.remove(); return; }
    if (!b) {
        css();
        b = document.createElement('div');
        b.id = 'cup-bn';
        b.addEventListener('click', function (ev) {
            const x = ev.target.closest('[data-b]');
            if (!x || !CUR) return;
            const k = x.getAttribute('data-b'), l2 = liveMatch(CUR);
            if (k === 'in') { if (l2) ready(l2); x.disabled = true; }
            else if (k === 'watch') watchOpen();
            else if (k === 'x') { if (l2) shut[l2.m.mid] = 1; bnPaint(); }
        });
        document.body.appendChild(b);
    }
    if (b._h !== h) { b._h = h; b.innerHTML = h; }
}

// ==========================================
// 7. 관전 화면
// ==========================================
let W = null;                         // { ov, mid, ref, live, chatRef, emoRef, at, cells:{code:[200 i]}, kind }
function watchOpen() {
    css();
    if (document.getElementById('cup-ov')) return;
    const ov = document.createElement('div');
    ov.id = 'cup-ov';
    ov.innerHTML = '<div class="top"><b>🏆 테트리스 대회</b><span class="k" id="cup-k"></span><button data-w="x">✕ 닫기</button></div>'
        + '<div id="cup-cast"><div class="emp">🎙 중계자의 글이 여기에 뜹니다</div></div>'
        + '<div id="cup-stage"><div class="wait">경기를 기다립니다…</div></div>'
        + '<div id="cup-side"><div id="cup-feed"></div>'
        + '<div id="cup-emo">' + EMO.map(function (e) { return '<button data-e="' + e + '">' + e + '</button>'; }).join('') + '</div>'
        + '<div id="cup-in"><input maxlength="60" placeholder="댓글 (Enter)" autocomplete="off"><button data-w="send">보내기</button></div></div>';
    const fx = document.createElement('div'); fx.id = 'cup-fx';
    document.body.appendChild(ov);
    ov.querySelector('#cup-stage').appendChild(fx);
    W = { ov: ov, mid: '', ref: null, live: {}, at: now(), cells: {}, sig: '' };
    ov.addEventListener('click', function (ev) {
        const b = ev.target.closest('button');
        if (!b) return;
        if (b.getAttribute('data-w') === 'x') { watchClose(); return; }
        if (b.getAttribute('data-w') === 'send') { say(); return; }
        const e = b.getAttribute('data-e'); if (e) emo(e);
    });
    const inp = ov.querySelector('#cup-in input');
    inp.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); say(); } });
    const d = d_();
    if (d) {
        W.chatRef = d.ref(PATH + '/chat').limitToLast(40);
        W.chatRef.on('child_added', function (s) { chatLine(s.val()); });
        W.emoRef = d.ref(PATH + '/emo').limitToLast(1);
        W.emoRef.on('child_added', function (s) { const v = s.val(); if (v && v.at > W.at - 1500) floatEmo(v.e); });
    }
    window.addEventListener('resize', fit);
    // 위쪽 공지 띠(📢)가 떠 있으면 그만큼 내려 머리줄 · 닫기 단추를 가리지 않게
    W.tk = setInterval(function () {
        if (!W) return;
        const tk = document.getElementById('notice-ticker');
        const pad = (tk && tk.style.display !== 'none' && tk.offsetHeight) ? tk.offsetHeight : 0;
        if (W.pad !== pad) { W.pad = pad; W.ov.style.paddingTop = pad + 'px'; setTimeout(fit, 30); }
    }, 500);
    watchPaint();
    bnPaint();
}
function watchClose() {
    if (!W) { const o = document.getElementById('cup-ov'); if (o) o.remove(); return; }
    try { if (W.ref) W.ref.off(); } catch (e) { }
    try { if (W.chatRef) W.chatRef.off(); } catch (e) { }
    try { if (W.emoRef) W.emoRef.off(); } catch (e) { }
    try { W.ov.remove(); } catch (e) { }
    try { clearInterval(W.tk); } catch (e) { }
    window.removeEventListener('resize', fit);
    W = null;
    bnPaint();
}
let sayAt = 0, emoAt = 0;
function say() {
    if (!W || !CUR) return;
    const inp = W.ov.querySelector('#cup-in input');
    const t = String(inp.value || '').trim().slice(0, 60);
    if (!t) return;
    if (now() - sayAt < 800) return;
    sayAt = now();
    inp.value = '';
    const d = d_(), u = u_();
    if (!d || !u) return;
    d.ref(PATH + '/chat').push({ n: u.name || '?', t: t, k: me() === CUR.cast ? 'c' : 'v', at: now() });
}
function emo(e) {
    if (now() - emoAt < 250) return;
    emoAt = now();
    const d = d_();
    if (d) d.ref(PATH + '/emo').push({ e: e, at: now() });
}
function floatEmo(e) {
    const fx = document.getElementById('cup-fx');
    if (!fx || EMO.indexOf(e) < 0) return;
    const s = document.createElement('span');
    s.textContent = e;
    s.style.left = (8 + Math.random() * 84) + '%';
    s.style.animationDuration = (2.2 + Math.random() * 0.9) + 's';
    fx.appendChild(s);
    setTimeout(function () { s.remove(); }, 3300);
}
function chatLine(v) {
    if (!W || !v || !v.t) return;
    if (v.k === 'c') {
        const box = W.ov.querySelector('#cup-cast');
        const emp = box.querySelector('.emp'); if (emp) emp.remove();
        const ln = document.createElement('div');
        ln.className = 'ln';
        ln.innerHTML = '<span class="who">🎙 ' + esc(v.n) + '</span>' + esc(v.t);
        box.appendChild(ln);
        const wide = window.matchMedia && window.matchMedia('(min-width:900px)').matches;
        const keep = wide ? 30 : 3;                       // 좁은 화면은 위쪽 띠에 세 줄만
        while (box.querySelectorAll('.ln').length > keep) box.querySelector('.ln').remove();
        box.scrollTop = box.scrollHeight;
        return;
    }
    const feed = W.ov.querySelector('#cup-feed');
    const ln = document.createElement('div');
    ln.className = 'ln';
    ln.innerHTML = '<span class="who">' + esc(v.n) + '</span>' + esc(v.t);
    feed.appendChild(ln);
    while (feed.children.length > 60) feed.firstChild.remove();
    feed.scrollTop = feed.scrollHeight;
}
// 판 칸 크기 — 화면에 맞춘다
function fit() {
    if (!W) return;
    const st = W.ov.querySelector('#cup-stage');
    if (!st) return;
    const n = W.kind === 'team' ? 6 : 2;
    const wide = window.innerWidth >= 900;
    const cols = W.kind === 'team' ? (st.clientWidth >= 700 ? 6 : 3) : 2;
    const rows = Math.ceil(n / cols);
    const w = (st.clientWidth - 30 - (cols - 1) * 10 - (W.kind === 'team' && cols === 6 ? 20 : 0)) / cols;
    const h = (st.clientHeight - 20 - rows * (W.kind === 'team' ? 62 : 46) - (W.kind === 'team' && cols === 3 ? 24 : 0)) / rows;
    let c = Math.floor(Math.min((w - 6) / 10.9, (h - 6) / 21.9));
    c = Math.max(4, Math.min(wide ? 26 : 22, c));
    st.style.setProperty('--c', c + 'px');
    // 팀전 — 좁으면 위(우리 팀) · VS · 아래(상대 팀) · 넓으면 한 줄
    const rt = st.querySelector('.row-t'); if (rt) rt.style.flexDirection = cols === 6 ? 'row' : 'column';
}
function stageHtml(c, lm) {
    const m = lm.m;
    W.ps = [];
    const bd = function (eid, p) {
        W.ps.push(p);
        return '<div class="bd" data-p="' + (W.ps.length - 1) + '"><div class="nm">' + esc(memName(c, eid, p)) + '</div><div class="gr">' + new Array(201).join('<i></i>') + '</div><div class="sc">0점 · 0줄</div></div>';
    };
    if (c.kind === 'team') {
        const tm = function (eid, k) {
            return '<div class="tm" data-t="' + k + '"><div class="tmh"><span>' + esc(entName(c, eid)) + '</span><span class="sum">0</span></div><div class="bds">' + members(c, eid).map(function (p) { return bd(eid, p); }).join('') + '</div></div>';
        };
        return '<div class="row-t" style="display:flex;gap:10px 20px;justify-content:center;align-items:center;">' + tm(m.a, 'a') + '<div class="vs">VS</div>' + tm(m.b, 'b') + '</div>';
    }
    return '<div style="display:flex;gap:10px;align-items:center;justify-content:center;">' + bd(m.a, members(c, m.a)[0]) + '<div class="vs">VS</div>' + bd(m.b, members(c, m.b)[0]) + '</div>';
}
function watchPaint() {
    if (!W || !CUR) { if (W && !CUR) watchClose(); return; }
    const c = CUR, lm = c.st === 'run' ? liveMatch(c) : null;
    const k = W.ov.querySelector('#cup-k');
    const st = W.ov.querySelector('#cup-stage');
    const kt = (c.kind === 'team' ? '팀전' : '개인전') + (lm ? ' · ' + roundName(c, lm.rk) + (lm.m.st === 'call' ? ' · 입장 중' : '') : '') + ' · 🎙 ' + (c.castN || nameOf(c.cast));
    if (k.textContent !== kt) k.textContent = kt;
    // 내가 중계자면 입력 칸이 금빛
    const inp = W.ov.querySelector('#cup-in input');
    const ic = me() === c.cast;
    if (inp.classList.contains('cast') !== ic) { inp.classList.toggle('cast', ic); inp.placeholder = ic ? '🎙 중계 (Enter)' : '댓글 (Enter)'; }
    const mid = lm ? lm.m.mid : '';
    const sig = mid + '|' + (lm ? lm.m.a + lm.m.b : '') + '|' + c.st;
    if (sig !== W.sig) {
        W.sig = sig;
        try { if (W.ref) W.ref.off(); } catch (e) { }
        W.ref = null; W.live = {}; W.mid = mid; W.kind = c.kind;
        const fx = st.querySelector('#cup-fx');
        if (lm) {
            st.innerHTML = stageHtml(c, lm);
            const d = d_();
            if (d) { W.ref = d.ref(PATH + '/live/' + mid); W.ref.on('value', function (s) { W.live = s.val() || {}; boardsPaint(); }); }
        } else if (c.st === 'done' && c.champ) {
            st.innerHTML = '<div class="wait"><div style="font-size:22px;color:#ffe08a;font-weight:bold;">🏆 우승 — ' + esc(entName(c, c.champ)) + '</div>'
                + (c.kind === 'team' ? '<div>' + members(c, c.champ).map(function (p) { return esc(memName(c, c.champ, p)); }).join(' · ') + '</div>' : '') + '</div>';
        } else {
            // 방금 끝난 경기
            let last = null;
            rKeys(c).forEach(function (rk) { mKeys(c, rk).forEach(function (mk) { const x = c.R[rk][mk]; if (x.st === 'done' && x.end && (!last || x.end > last.m.end)) last = { rk: rk, mk: mk, m: x }; }); });
            st.innerHTML = '<div class="wait">' + (last ? '<div style="color:#ffe08a;font-weight:bold;margin-bottom:6px;">' + esc(roundName(c, last.rk)) + ' — ' + esc(entName(c, last.m.w)) + ' 승리</div>' : '') + '다음 경기를 기다립니다…</div>';
        }
        if (fx) st.appendChild(fx); else { const f = document.createElement('div'); f.id = 'cup-fx'; st.appendChild(f); }
        W.cells = {};
        fit();
    }
    if (lm) boardsPaint();
}
function boardsPaint() {
    if (!W || !CUR) return;
    const c = CUR, lm = liveMatch(c);
    if (!lm || lm.m.mid !== W.mid) return;
    const m = lm.m;
    Array.prototype.forEach.call(W.ov.querySelectorAll('#cup-stage .bd'), function (bd) {
        const p = W.ps[Number(bd.getAttribute('data-p'))];
        if (!p) return;
        const v = W.live[p] || null;
        const sc = m.sc && m.sc[p];
        const g = v && v.g ? String(v.g) : '';
        let cells = W.cells[p];
        if (!cells) { cells = W.cells[p] = { el: bd.querySelectorAll('.gr i'), g: '' }; }
        if (g && g !== cells.g) {
            for (let i = 0; i < 200 && i < cells.el.length; i++) {
                const ch = g.charAt(i);
                if (ch !== cells.g.charAt(i)) cells.el[i].style.background = ch && ch !== '.' ? (COL[ch] || COL.G) : '';
            }
            cells.g = g;
        }
        const over = !!((v && v.o) || sc);
        bd.querySelector('.gr').classList.toggle('o', over);
        bd.querySelector('.nm').classList.toggle('o', over);
        const s = sc ? sc.s : v ? v.s : 0, l = sc ? sc.l : v ? v.l : 0;
        const tx2 = fmt(s) + '점 · ' + (l || 0) + '줄' + (over ? ' · 끝' : '');
        const se = bd.querySelector('.sc'); if (se.textContent !== tx2) se.textContent = tx2;
    });
    if (c.kind === 'team') {
        ['a', 'b'].forEach(function (k) {
            const eid = m[k];
            const s = members(c, eid).reduce(function (t, p) { const sc = m.sc && m.sc[p], v = W.live[p]; return t + (sc ? Number(sc.s) || 0 : v ? Number(v.s) || 0 : 0); }, 0);
            const el = W.ov.querySelector('#cup-stage .tm[data-t="' + k + '"] .sum');
            if (el && el.textContent !== fmt(s)) el.textContent = fmt(s);
        });
    }
}

// ==========================================
// 8. 듣기
// ==========================================
function onCur(c) {
    PREV = CUR; CUR = c;
    // 결과 공지 — 방금 끝난 경기 · 우승
    if (PREV && c && c.R) {
        rKeys(c).forEach(function (rk) {
            mKeys(c, rk).forEach(function (mk) {
                const m = c.R[rk][mk], o = PREV.R && PREV.R[rk] && PREV.R[rk][mk];
                if (m.st === 'done' && o && o.st !== 'done' && m.b !== '-' && now() - (m.end || 0) < 20000) {
                    if (c.st === 'done' && c.champ) notice('🏆 <b>테트리스 대회</b> 우승 — <b>' + esc(entName(c, c.champ)) + '</b>');
                    else notice('🏆 테트리스 대회 ' + esc(roundName(c, rk)) + ' — <b>' + esc(entName(c, m.w)) + '</b> 승리');
                }
            });
        });
    }
    if (c && c.st !== 'open' && c.R) {
        const e = myEnt(c);
        // 내 경기
        const lm = myMatch(c);
        if (!lm || lm.m.st !== 'live' || c.kind !== 'team') liveMeOn('');
        if (lm) {
            if (lm.m.st === 'live') {
                if (started[lm.m.mid] === 'old') resume(lm);
                else if (!started[lm.m.mid]) {
                    const wait = Math.max(0, (lm.m.go || 0) - now());
                    const mid = lm.m.mid;
                    setTimeout(function () { const l2 = CUR && myMatch(CUR); if (l2 && l2.m.mid === mid && l2.m.st === 'live') startMine(l2); }, wait);
                }
                if (c.kind === 'solo') watchDuel(lm);
                else liveMeOn(lm.m.mid);
            }
            if (lm.m.st === 'call' && lm.m.rd && lm.m.rd[me()]) tryGo(lm.rk, lm.mk);
        }
        // 상담사 — 모두 입장했는지 · 개인전 결과
        if (isAdmin()) {
            const al = liveMatch(c);
            if (al && al.m.st === 'call') tryGo(al.rk, al.mk);
            if (al && al.m.st === 'live' && c.kind === 'solo') watchDuel(al);
            if (al && al.m.st === 'live' && c.kind === 'team') teamJudge(al.rk, al.mk);
        }
        // 끝난 내 경기
        if (e) rKeys(c).forEach(function (rk) { mKeys(c, rk).forEach(function (mk) { const m = c.R[rk][mk]; if (m.st === 'done' && m.mid && (m.a === e || m.b === e) && (started[m.mid] || myMid === m.mid)) endMine(c, rk, mk, m); }); });
    }
    if (!c) {
        try { localStorage.removeItem('tetCupGo'); } catch (er) { }
        liveMeOn('');
        if (myMid) { stopMine('<span style="color:#aaa;">대회가 닫혔습니다.</span>'); myMid = ''; }
    }
    paint();
    bnPaint();
    if (W) watchPaint();
    rivalPaint();
}
(function listen() {
    let on = false;
    const iv = setInterval(function () {
        const d = d_(), u = u_();
        if (on || !d || !u) return;
        on = true;
        clearInterval(iv);
        d.ref(PATH + '/cur').on('value', function (s) { try { onCur(s.val()); } catch (e) { console.warn('[🏆 대회]', e); } });
    }, 1000);
    setInterval(function () { try { bnPaint(); } catch (e) { } }, 1000);
})();

// ==========================================
// 9. 밖에서 쓰게
// ==========================================
window.tetCupOpen = function () { openPanel(); };
window.tetCupWatch = function () { try { if (typeof exitTetris === 'function') { const t = T(); if (!t || t.over) exitTetris(); } } catch (e) { } watchOpen(); };
window.tetCupState = function () {
    const c = CUR;
    console.log('%c===== 🏆 테트리스 대회 =====', 'color:#ffe08a; font-size:13px');
    if (!c) { console.log('  열린 대회 없음'); return null; }
    console.log('  ' + (c.kind === 'team' ? '팀전' : '개인전') + ' · ' + c.st + ' · 중계 ' + (c.castN || '') + ' · 참가 ' + Object.keys(c.ents || {}).length);
    rKeys(c).forEach(function (rk) { mKeys(c, rk).forEach(function (mk) { const m = c.R[rk][mk]; console.log('  ' + roundName(c, rk) + ' ' + mk + ' — ' + entName(c, m.a) + ' vs ' + entName(c, m.b) + ' · ' + m.st + (m.w ? ' · 승 ' + entName(c, m.w) : '')); }); });
    return { st: c.st, kind: c.kind, live: liveMatch(c) ? liveMatch(c).rk + '_' + liveMatch(c).mk : null, mine: myEnt(c), playing: myMid, champ: c.champ || null };
};
window.tetCupDebug = { cur: function () { return CUR; }, boardStr: boardStr, W: function () { return W; } };

})();
