// ==========================================
// ★ 재난 — 기록 소실 · 📡 파형(破刑)급 『 3시 33분 방송국 』 (대화로 진행하는 탐사)
// bundles.json 마지막 묶음, playtime.js 뒤
// ==========================================
//
// ■ 어디서 들어가나
//   광장 재난관리국 엘리베이터 → B2 「기록 소실」 (2026-10-19)
//   🎫 기록 소실 티켓이 없으면 **아예 못 들어간다** (대기실 목록도 안 보인다).
//   이미 들어가 있는 판(티켓을 뗀 뒤)은 티켓 없이도 다시 들어간다.
//
// ■ 상담사가 열고 닫는다
//   상담사 콘솔 「📡 기록 소실」 칸 — disasterCfg/<재난>/open
//   닫혀 있으면 상담사 말고는 못 들어간다 (서버도 시작을 막는다). 이미 진행 중인 판은 끝까지 간다.
//   상담사는 닫혀 있어도 들어가 시험할 수 있고, 상담사가 연 방에는 다른 사원도 들어올 수 있다.
//
// ■ 한 판
//   1. 대기실 — 한 사람이 방을 열고(방장) 최대 5명이 들어온다. 방장이 [시작한다].
//      시작하는 순간 서버가 사원마다 🎫 기록 소실 티켓을 한 장씩 뗀다 (한 사람이라도 없으면 못 함).
//   2. 장면 — 진행자(Claude)가 장면을 쓴다. 선택지는 없다.
//      사원들은 아래 대화칸에서 캐릭터로 말하고 행동한다. 장면마다 4분 (서버 core.js TALK_MS).
//      살아 있는 사람이 모두 [행동 확정]을 누르면 일찍 넘어간다.
//   3. 판정 — 대화에서 사원마다 행동 하나를 골라 판정 종류로 바꾸고(서버), 주사위는 코드가 굴린다.
//      실패가 위험하면 다침 → 실종. 치유는 다친 동료를, 연결은 실종된 동료를 한 단계 되돌린다.
//   4. 결말 — 종결(근원을 지움) · 탈출(살아서 나옴) · 전멸(모두 실종). 최대 8장면.
//
//   ✗ 아직 보상 · 오염도와는 잇지 않았다 (게임을 짠 뒤에 잇기로 함).
//
// ■ 『 3시 33분 방송국 』 (2026-10-20 — 설정은 api/_disaster/lore.js)
//   · 생존 확률 1% — 대기실에 띄운다. 판정 난이도도 세게 둔다 (서버)
//   · 대기실에서 들고 갈 장비를 3개까지 고른다 (장착 중 · 소지품의 장비 · 전용 장비). 성적인 것은 목록에 안 뜬다.
//     효과(수치)는 적용하지 않는다 — 진행자가 이야기 속 물건으로만 쓴다. 정말 가진 것인지는 시작할 때 서버가 다시 본다.
//   · 시작할 때 서버가 소속을 보고 자리를 가른다 — 귀빈 · 재난관리국 · 백일몽 · 예외
//   · 귀빈은 [홀로 나간다] 를 누를 수 있다 → 그 장면이 끝나면 빠져나간다. 남은 재난관리국 · 백일몽 쪽 난이도가 기하급수로 오른다
//   · 상담사는 관리자 — 들어가 있어도 판정 · 확정 기다림에서 빠진다 (서버)
//   · 상담사 관전 — 목록의 「진행 중인 판」에서 [본다] → 장면 · 대화 · 판정을 그대로 본다 (말 · 확정은 못 함)
//   · ★ 사원 관전 (2026-10-21) — 👁 기록 소실 관전 티켓이 있으면 다른 사원도 본다 (상담사가 나눠 준다 · 상점에는 없다).
//       진행 중인 판을 골라 보기 시작할 때 한 장이 사라진다. 같은 판은 다시 들어가 봐도 또 떼지 않는다 (u.dzWatch[판]).
//       관전 티켓만 있으면 재난이 닫혀 있어도 · 기록 소실 티켓이 없어도 창에 들어와 볼 수 있다 (방에 들거나 열지는 못 한다).
//   · 10장면 · 1~2장면은 아무도 죽지 않고 3장면부터 행동에 따라 죽는다 · 8장면 전에는 안 끝남 · 9장면부터 방송국이 덮친다 (⚡) — 서버
//   · 보상 · 죽음 — 끝나면 서버가 disasterPay/<사번>/<판> 에 적고, 이 파일이 한 번만 받아 적용한다 (아래 9)
//
// ■ 서버에 적는 자리
//   disaster/<판>            판 (서버 함수가 장면 · 판정 · 상태를 쓴다. 화면은 사원 들고 나기 · 확정만 쓴다)
//   disasterChat/<판>/<번호> 대화 { c, n, t, at, r(장면 번호 · 대기실은 0) }
//
// ■ 콘솔
//   disasterOpen()    창 열기
//   disasterState()   지금 판

const DZ_TICKET = '🎫 기록 소실 티켓';
const DZ_WATCH = '👁 기록 소실 관전 티켓';

(function disaster() {

const ROOT = 'disaster', CHAT = 'disasterChat';
// ★ 재난마다 (서버 lore.js DISASTERS 와 같은 열쇠 · 2026-10-22 『 새빛 병원 』 을 넣으며)
//   대기실 목록 위의 칸으로 고른다 · 방(판)은 제 kind 를 들고 다닌다 · 상담사는 재난마다 열고 닫는다
const PAY_B = function (n) { return '<b style="color:#e8c27a;">' + n + '</b>'; };
const KINDS_C = {
    wave: { icon: '📡', grade: '파형(破刑)', name: '『 3시 33분 방송국 』', survive: 1, gear: 3,
            brief: '일기예보와 여러 정보를 전해 주는 방송국. 3시 33분에 정확히 3번 채널을 33번 누르면 들어온다.',
            reward: '살아서 끝까지 남으면 — 재난관리국 요원 · 백일몽 사원 · 이사팀 ' + PAY_B('300,000 P') + ' · 선생님 ' + PAY_B('150,000 P') + ' · '
                + '끝까지 함께한 심야 토크쇼의 주인 ' + PAY_B('300,000 P') + ' (홀로 나가면 0)<br>죽으면 여우 상담실 · 선녀탕으로 이송됩니다.',
            place: '방송국', lost: '죽음', lostEnd: '죽음', lostIn: '전파 속에서 목소리만 남았다…', vip: '사회자', vipLine: '이 방송국의 <b>사회자</b>',
            kickSay: '「귀빈께서는 저희 방송과 맞지 않으십니다. 더 어울리는 곳으로 모시겠습니다.」', kickWho: '방송국 사람들이',
            fail: '남은 사람이 모두 방송국에 먹혔습니다', fate: '방송국에 먹혔다' },
    ward: { icon: '🏥', grade: '파형(破刑)', name: '『 새빛 병원 』', survive: 1, gear: 3,
            brief: '산자락에 버려진 정신병원. 정신병원이 되기 전에는 고등학교였고, 그보다 더 전에 이 건물에 무엇이 있었는지는 아무도 말하지 않는다. 넷째 날 새벽, 해가 뜰 때까지 사흘을 버텨야 한다.',
            reward: '넷째 날 새벽까지 살아남으면 — 재난관리국 요원 · 백일몽 사원 · 이사팀 ' + PAY_B('300,000 P') + ' · 선생님 ' + PAY_B('150,000 P') + ' · '
                + '심야 토크쇼의 주인 ' + PAY_B('300,000 P') + '<br>둘째 날은 어려움, 셋째 날은 매우 어려움입니다. 귀빈은 없고, 아무도 홀로 나가지 못합니다.'
                + '<br>붙잡히면 어딘가로 끌려갑니다 — 동료가 구하러 올 수 있습니다. 끌려간 채 끝나면 여우 상담실 · 선녀탕으로 이송됩니다.',
            place: '병원', lost: '끌려감', lostEnd: '돌아오지 못함', lostIn: '어딘가에 붙들려 목소리만 새어 나간다…', vip: '사회자',
            noLeave: true,          // 귀빈이 없다 — 사회자도 똑같이 들어가고 홀로 나가지 못한다
            kinLine: '괴물들이 당신을 <b>저희와 같은 것</b>으로 알아봅니다. 끌려가지 않고, 밤의 사냥도 당신을 비껴갑니다.',
            vanishAt: 3,            // 괴물들의 의심이 3번 쌓이면 어둠 속으로 사라진다 — 실종 (서버 lore.js kinVanish)
            vanishIn: '어둠 속에서 목소리만 희미하게 새어 나간다…',
            burnLine: '손가락을 튕겨(또는 「소각」을 시켜) 무언가를 태울 수 있습니다 — 파괴 판정 주사위 <b>+7</b>.',
            fail: '남은 사람이 모두 끌려갔습니다', fate: '병원 어딘가로 끌려갔다' }
};
const KIND_LIST = ['wave', 'ward'];
const KIND = 'wave';                               // 처음 보여 주는 칸 (열린 재난이 있으면 그쪽)
function K(k) { return KINDS_C[k] || KINDS_C[KIND]; }
function kName(k) { const x = K(k); return x.icon + ' ' + x.name; }
// 성적인 표현이 들어간 장비는 지참하지 못한다 (서버 core.js 와 같은 목록)
const NO_GEAR = /플러그|오나홀|딜도|바이브|흡입기|피어싱|가터|콘돔|정조대|하네스|목줄|유두|클리|보지|애널|자지/;
// 커스텀 장비 — 가지고 있으면 서버가 알아서 진행자에게 알린다 (lore.js SIGILS). 지참 장비 3칸에는 안 넣는다
const SIGIL_ITEMS = ['🔎 감지하는 눈', '🩶 은심장', '🐯 호가호위', '🦊 호가호위', '🦊 호사수구', '📖 〈종말예언 : 어둠탐사기록〉', '🧧 지산의 복 : 대리자', '🐾 아기 호랑이', '🐾 아기 여우', '🌙 달빛 문신', '📺 브라운의 심야 토크 쇼', '🌟 제 칠(七) 성군(星君)', '🐯 제 칠(七) 성군(星君)'];
// 귀빈 자리(어둠 소속 · 심야 토크쇼의 주인)는 화면에 「사회자」로 띄운다 — 진행자는 귀빈으로 안다 (2026-10-20)
const ROLE_N = { admin: '관리자', vip: '사회자', bureau: '재난관리국', daydream: '백일몽', board: '이사팀', teacher: '예외', other: '그 밖' };
const MAX_MEMBERS = 5;                             // 한 방 최대 인원 (2026-10-20 — 4 → 8 → 5 · 서버 core.js 와 같이)
// ★ 몇 장면인지는 화면에 알리지 않는다 (2026-10-20) — 장면 수는 서버(lore.js rounds)만 안다
const LOBBY_TTL = 2 * 3600000, PLAY_TTL = 6 * 3600000, END_TTL = 24 * 3600000;
const GRACE = 4000;          // 방장이 먼저 넘긴다 — 다른 사람은 이만큼 기다렸다가 (방장이 없을 때를 대비)
const Z = 99999980;          // 알림창(99999999) · 팔레트(99999990)보다 아래
const ADMIN = 'kario0987';
const ST = { ok: '멀쩡', hurt: '다침', lost: '죽음', out: '홀로 나감' };
// 상태 이름 — 실종을 재난마다 다르게 부른다 (방송국은 죽음 · 병원은 끌려감)
function stN(k, st) { return st === 'lost' ? K(k).lost : (ST[st || 'ok'] || st); }
// 사람 하나의 상태 — 🏥 어둠 속으로 사라진 사회자는 「실종」
function stM(k, x) { x = x || {}; return (x.vanish && x.st === 'lost') ? '실종' : stN(k, x.st || 'ok'); }
const ST_C = { ok: '#9fd8a4', hurt: '#ffb36b', lost: '#ff6b81', out: '#c9b6ff' };
function gone(st) { return st === 'lost' || st === 'out'; }
const KIND_N = { sense: '감각', hide: '은신', evade: '회피', break: '파괴', bond: '연결', gaze: '응시',
                 heal: '치유', fix: '보정', steady: '굳건', luck: '행운', none: '판정 없음' };     // 열 가지 (2026-10-24)
const END_N = { clear: ['종결', '#7fd4d4', '근원을 지웠습니다'], escape: ['탈출', '#e8c27a', '살아서 빠져나왔습니다'],
                fail: ['전멸', '#ff6b81', '남은 사람이 모두 방송국에 먹혔습니다'] };

function me() { return (typeof currentUser !== 'undefined') ? currentUser : null; }
function db_() { return (typeof database !== 'undefined') ? database : null; }
function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// 진행자 글 — 줄바꿈 · 아기 여우의 말(<f>…</f> 로 감싼 대사)은 옅은 주황색으로 (2026-10-20)
//   짝이 안 맞는 표(글이 잘려 남은 것)는 지운다
function br(s) {
    return esc(s).replace(/&lt;f&gt;([\s\S]*?)&lt;\/f&gt;/g, '<span class="dz-fox">$1</span>')
        .replace(/&lt;\/?f&gt;/g, '').replace(/\n/g, '<br>');
}
function alert_(m) { try { showCustomAlert(m); } catch (e) { } }
function tickets(u) { return ((u && u.inventory) || []).filter(function (x) { return x === DZ_TICKET; }).length; }
function wTickets(u) { return ((u && u.inventory) || []).filter(function (x) { return x === DZ_WATCH; }).length; }
// 이미 표를 내고 본 판
function paidWatch(u, id) { return !!(u && id && u.dzWatch && typeof u.dzWatch === 'object' && u.dzWatch[id]); }
let off = 0;                 // 서버 시계와의 차이
function now() { return Date.now() + off; }

// ==========================================
// 1. 🎫 티켓 — 물품 표 · 사용하면 창이 열린다
// ==========================================
(function reg() {
    const iv = setInterval(function () {
        if (typeof ITEM_CATALOG === 'undefined') return;
        if (!ITEM_CATALOG[DZ_TICKET]) {
            ITEM_CATALOG[DZ_TICKET] = {
                price: '???', usable: true, targetable: false, effect: 'disaster_ticket', adminOnly: true,
                desc: '[특수] 기록 소실에서 복원된 재난에 들어가는 표. 재난이 시작되는 순간 한 장이 사라진다. 사용하면 기록 소실 창이 열린다.'
            };
        }
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(DZ_TICKET) < 0) NO_SELL_ITEMS.push(DZ_TICKET); } catch (e) { }
        if (!ITEM_CATALOG[DZ_WATCH]) {
            ITEM_CATALOG[DZ_WATCH] = {
                price: '???', usable: true, targetable: false, effect: 'disaster_watch', adminOnly: true,
                desc: '[특수] 기록 소실에서 진행 중인 재난을 지켜보는 표. 판을 골라 보기 시작할 때 한 장이 사라진다 (같은 판은 다시 봐도 그대로). 말을 하거나 판에 끼어들 수는 없다.'
            };
        }
        try { if (typeof NO_SELL_ITEMS !== 'undefined' && NO_SELL_ITEMS.indexOf(DZ_WATCH) < 0) NO_SELL_ITEMS.push(DZ_WATCH); } catch (e) { }
        clearInterval(iv);
    }, 300);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();
(function hookUse() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        if (useInventoryItem._dz) { clearInterval(iv); return; }
        const _u = useInventoryItem;
        const w = function (itemName) {
            if (itemName === DZ_TICKET) {                                 // 쓰는 것은 시작할 때 — 여기서는 안 뗀다
                alert_(DZ_TICKET + '\n\n재난관리국 지하 2층 「기록 소실」에서 씁니다.\n재난이 시작되는 순간 한 장이 사라집니다.');
                return;
            }
            if (itemName === DZ_WATCH) {                                  // 쓰는 것은 판을 골라 볼 때
                alert_(DZ_WATCH + '\n\n재난관리국 지하 2층 「기록 소실」에서 씁니다.\n진행 중인 판을 골라 보기 시작할 때 한 장이 사라집니다. (같은 판은 다시 봐도 그대로)');
                return;
            }
            return _u.apply(this, arguments);
        };
        Object.keys(_u).forEach(function (k) { try { w[k] = _u[k]; } catch (e) { } });
        w._dz = true;
        useInventoryItem = w; window.useInventoryItem = w;
        clearInterval(iv);
    }, 400);
    setTimeout(function () { clearInterval(iv); }, 40000);
})();

// ==========================================
// 2. 모양새
// ==========================================
(function css() {
    if (document.getElementById('dz-css')) return;
    const s = document.createElement('style');
    s.id = 'dz-css';
    s.textContent = [
        '.dz-card{border:1px solid #2f5f60;border-radius:10px;background:linear-gradient(160deg,#0c1718,#0a0d10);padding:14px;}',
        '.dz-card-h{font-size:14px;color:#9fe3e3;font-weight:bold;margin-bottom:6px;letter-spacing:1px;}',
        '.dz-card-t{font-size:12px;color:#c9d6d6;line-height:1.8;margin-bottom:10px;}',
        '.dz-card-m{font-size:10px;color:#7d9a9a;line-height:1.7;margin-bottom:12px;}',
        '.dz-btn{display:block;width:100%;margin:0;padding:11px;border-radius:8px;border:1px solid #3f8f90;',
        '  background:linear-gradient(145deg,#1d4b4c,#123132);color:#e8ffff;font-size:13px;font-weight:bold;cursor:pointer;font-family:inherit;}',
        '.dz-btn[disabled]{opacity:.45;cursor:default;}',
        '.dz-btn.sub{background:rgba(255,255,255,.04);border-color:#3a4650;color:#bcc6cc;font-weight:normal;}',
        '#dz-ov{position:fixed;inset:0;z-index:' + Z + ';background:#06090b;color:#d8e3e3;display:flex;flex-direction:column;',
        '  height:100dvh;font-size:13px;}',
        // 넓은 터치 화면(폴드를 편 화면)에서는 가운데 760 폭으로 모은다
        '@media (min-width:820px) and (pointer:coarse){#dz-ov{padding-left:calc((100% - 760px) / 2);padding-right:calc((100% - 760px) / 2);}}',
        // ★ 아이폰 — 화면이 상태 표시줄(시계 · 배터리) 아래까지 깔린다 (viewport-fit=cover). 머리를 그만큼 내린다
        '#dz-head{flex:0 0 auto;display:flex;align-items:center;gap:8px;border-bottom:1px solid #1d3536;',
        '  padding:calc(10px + env(safe-area-inset-top, 0px)) calc(12px + env(safe-area-inset-right, 0px)) 10px calc(12px + env(safe-area-inset-left, 0px));',
        '  background:linear-gradient(180deg,#0d1b1c,#081011);}',
        '#dz-head .t{font-size:13px;color:#9fe3e3;font-weight:bold;letter-spacing:1px;}',
        '#dz-head .n{font-size:11px;color:#6f8c8c;}',
        '#dz-timer{margin-left:auto;font-family:monospace;font-size:14px;color:#e8c27a;min-width:48px;text-align:right;}',
        '#dz-timer.low{color:#ff6b81;}',
        '#dz-x{border:0;background:none;color:#8aa;font-size:18px;cursor:pointer;padding:0 4px;}',
        '#dz-mem{flex:0 0 auto;display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid #12201f;}',
        '#dz-mem span{font-size:11px;padding:3px 8px;border-radius:12px;border:1px solid #24393a;background:rgba(255,255,255,.03);}',
        '#dz-main{flex:1 1 auto;overflow-y:auto;padding:12px;-webkit-overflow-scrolling:touch;}',
        '.dz-sec{font-size:10px;color:#6f8c8c;letter-spacing:1px;margin:14px 0 6px;}',
        '.dz-scene{border-left:2px solid #3f8f90;padding:4px 0 4px 12px;margin-bottom:12px;}',
        '.dz-scene .h{font-size:13px;color:#bff0f0;font-weight:bold;margin-bottom:8px;}',
        '.dz-scene .b{font-size:13px;line-height:1.9;color:#dfe9e9;}',
        '.dz-res{border:1px solid #2a3a3b;border-radius:8px;padding:10px 12px;background:rgba(255,255,255,.025);margin-bottom:14px;}',
        '.dz-res .b{font-size:12px;line-height:1.85;color:#c8d4d4;}',
        '.dz-chk{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;}',
        '.dz-chk span{font-size:10px;padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.35);border:1px solid #2a3a3b;color:#b8c4c4;}',
        '.dz-chk span.ok{border-color:#2f6b4a;color:#9fd8a4;} .dz-chk span.no{border-color:#6b2f3a;color:#ff9aa8;}',
        '.dz-chk span.fx{color:#ffc38a;}',             // 🐾 아기 호랑이의 판정
        '#dz-chat .ln{font-size:12px;line-height:1.7;padding:2px 0;word-break:break-word;}',
        '.dz-fox{color:#ffc38a;}',                     // 🐾 아기 호랑이의 말 — 옅은 주황
        '#dz-chat .ln.fox,#dz-chat .ln.fox b{color:#ffc38a;}',
        '#dz-chat .ln b{color:#9fe3e3;font-weight:normal;margin-right:6px;}',
        '#dz-chat .ln.me b{color:#e8c27a;}',
        '#dz-chat .ln.echo{color:#7a8f8f;font-style:italic;}',
        '#dz-chat .sep{font-size:10px;color:#4e6a6a;text-align:center;margin:10px 0 4px;letter-spacing:2px;}',
        '#dz-chat .dz-rh{margin-top:6px;}',             // 장면마다 — 지난 장면 결과 · 이번 장면 서술 (그 장면 대화 바로 위)
        '#dz-foot{margin-top:12px;} #dz-foot:empty{display:none;}',
        '#dz-wait{font-size:12px;color:#e8c27a;text-align:center;padding:12px;border:1px dashed #5a4a2a;border-radius:8px;margin:10px 0;',
        '  animation:dzp 1.6s ease-in-out infinite;}',
        '@keyframes dzp{0%,100%{opacity:.55}50%{opacity:1}}',
        '.dz-err{font-size:11px;color:#ff9aa8;margin:8px 0;line-height:1.6;}',
        '#dz-bar{flex:0 0 auto;display:flex;gap:6px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));border-top:1px solid #1d3536;background:#081011;}',
        '#dz-in{flex:1 1 auto;min-width:0;margin:0;padding:10px;border-radius:8px;border:1px solid #2a4a4b;background:#0d1718;color:#e8f2f2;font-size:13px;font-family:inherit;}',
        '#dz-bar button{flex:0 0 auto;margin:0;padding:0 11px;border-radius:8px;border:1px solid #3f8f90;background:#123132;color:#e8ffff;font-size:12px;cursor:pointer;font-family:inherit;}',
        '#dz-bar button.on{background:#3f8f90;color:#071012;font-weight:bold;}',
        '#dz-bar button[disabled]{opacity:.4;}',
        '.dz-row{display:flex;align-items:center;gap:8px;padding:9px 10px;border:1px solid #1f3233;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,.02);}',
        '.dz-row .w{flex:1 1 auto;min-width:0;font-size:12px;line-height:1.5;}',
        '.dz-row .w i{font-style:normal;color:#6f8c8c;font-size:10px;}',
        '.dz-row button{flex:0 0 auto;margin:0;padding:7px 11px;border-radius:7px;border:1px solid #3f8f90;background:#123132;color:#e8ffff;font-size:11px;cursor:pointer;font-family:inherit;}',
        '.dz-row button[disabled]{opacity:.4;}',
        '.dz-end{border:1px solid;border-radius:10px;padding:14px;margin-bottom:14px;}',
        '.dz-end .k{font-size:15px;font-weight:bold;letter-spacing:2px;margin-bottom:8px;}',
        'details.dz-h{margin-bottom:6px;border:1px solid #1f3233;border-radius:8px;padding:8px 10px;}',
        'details.dz-h summary{font-size:12px;color:#9fe3e3;cursor:pointer;}',
        'details.dz-h div{font-size:12px;line-height:1.8;color:#c8d4d4;margin-top:6px;}'
    ].join('\n');
    document.head.appendChild(s);
})();

// ==========================================
// 3. 들어가는 문 — 열림 · 티켓
// ==========================================
let cfg = {};
(function watchCfg() {
    const iv = setInterval(function () {
        const d = db_(); if (!d) return;
        clearInterval(iv);
        d.ref('disasterCfg').on('value', function (s) { cfg = s.val() || {}; if (ov) { lastInfo = ''; paint(); } paintAdmin(); });
    }, 500);
})();
// 재난 하나가 열렸나 — k 가 없으면 하나라도 열렸나
function isOpen(k) {
    if (k) return !!(cfg[k] && cfg[k].open);
    return KIND_LIST.some(function (x) { return !!(cfg[x] && cfg[x].open); });
}
// 대기실 목록에서 고른 재난 — 처음에는 열린 재난 (둘 다 열렸거나 닫혔으면 앞의 것)
let pickK = null;
function curK() {
    if (pickK && KINDS_C[pickK]) return pickK;
    return KIND_LIST.filter(function (x) { return isOpen(x); })[0] || KIND;
}
function isAdm(u) { return !!(u && u.code === ADMIN); }
// 들어갈 수 있나 — 상담사 · 이미 들어가 있는 판 · (열림 + 티켓)
function gate(u, list) {
    if (!u) return { ok: false, why: '' };
    if (isAdm(u)) return { ok: true };
    if (list && activeOf(list, u.code)) return { ok: true };
    if (canSpectate(u, list)) return { ok: true, watch: true };         // 👁 관전만
    if (!isOpen()) return { ok: false, why: '기록 소실 — 지금은 열려 있는 재난이 없습니다.' };
    if (!tickets(u)) return { ok: false, why: DZ_TICKET + '이 없으면 들어갈 수 없습니다.' };
    return { ok: true };
}
// 관전할 수 있나 — 상담사 · 관전 티켓이 있거나 이미 표를 낸 판이 아직 남아 있음
function canSpectate(u, list) {
    if (!u) return false;
    if (isAdm(u) || wTickets(u) > 0) return true;
    return Object.keys(list || {}).some(function (id) { return paidWatch(u, id) && list[id] && !!KINDS_C[list[id].kind]; });
}
function activeOf(all, code) {
    const ids = Object.keys(all || {}).filter(function (id) {
        const r = all[id];
        if (!r || !KINDS_C[r.kind] || !r.members || !r.members[code]) return false;
        if (r.state === 'LOBBY' || r.state === 'PLAY') return true;
        return r.state === 'END' && !(r.members[code] || {}).seen;
    });
    ids.sort(function (a, b) { return (all[b].createdAt || 0) - (all[a].createdAt || 0); });
    return ids[0] || null;
}
// ==========================================
// 4. 창
// ==========================================
let ov = null, all = {}, rootRef = null, rootCb = null;
let curId = null, chatRef = null, chatCb = null, chatLines = [];
let tick = 0, busy = false, msg = '';
let watchId = null;              // 관전하는 판 (상담사 · 관전 티켓을 낸 사원)
let askWatch = null;             // 관전 티켓을 쓸지 묻는 판
const asked = {}, doneSeen = {};

function open() {
    const u = me(), d = db_();
    if (!u || !d) return;
    if (ov) return;
    lastInfo = ''; lastR = -1; msg = '';                       // 새 창 — 지난번 그린 것을 잊는다
    ov = document.createElement('div');
    ov.id = 'dz-ov';
    ov.innerHTML = '<div id="dz-head"><span class="t" id="dz-t">📼 기록 소실</span><span class="n" id="dz-n"></span>'
        + '<span id="dz-timer"></span><button id="dz-x" title="닫기">✕</button></div>'
        + '<div id="dz-mem"></div>'
        + '<div id="dz-main"><div id="dz-info"></div><div id="dz-chat"></div><div id="dz-foot"></div></div>'
        + '<div id="dz-bar"><input id="dz-in" maxlength="200" autocomplete="off" placeholder="">'
        + '<button id="dz-send">말</button><button id="dz-done">행동 확정</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#dz-x').onclick = close;
    ov.querySelector('#dz-send').onclick = send;
    ov.querySelector('#dz-done').onclick = toggleDone;
    ov.querySelector('#dz-in').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); send(); } });
    try { d.ref('.info/serverTimeOffset').once('value').then(function (s) { off = Number(s.val()) || 0; }).catch(function () { }); } catch (e) { }
    rootRef = d.ref(ROOT);
    rootCb = function (s) { all = s.val() || {}; sweep(); follow(); paint(); };
    rootRef.on('value', rootCb);
    tick = setInterval(onTick, 1000);
    paint();
}
// 엘리베이터 B2 · 콘솔 — 문을 지나서 연다
function enter() {
    const u = me(), d = db_();
    if (!u || !d) return;
    d.ref(ROOT).once('value').then(function (s) {
        const g = gate(u, s.val() || {});
        if (!g.ok) { alert_('🔒 ' + g.why); return; }
        open();
    }).catch(function () { alert_('기록을 불러오지 못했습니다.'); });
}
window.disasterLost = enter;
window.disasterOpen = enter;

function close() {
    const u = me(), r = curId && all[curId];
    // 끝난 판을 닫으면 「봤다」고 적는다 — 다음에 열면 대기실 목록으로
    if (u && r && r.state === 'END' && r.members && r.members[u.code]) {
        try { db_().ref(ROOT + '/' + curId + '/members/' + u.code + '/seen').set(true); } catch (e) { }
    }
    if (rootRef && rootCb) { try { rootRef.off('value', rootCb); } catch (e) { } }
    if (chatRef && chatCb) { try { chatRef.off('child_added', chatCb); } catch (e) { } }
    rootRef = rootCb = chatRef = chatCb = null;
    watchId = null; askWatch = null;
    clearInterval(tick); tick = 0;
    if (ov) ov.remove();
    ov = null; curId = null; chatLines = []; msg = '';
}

// 오래된 판 치우기 (누가 열든 같이 치운다)
let swept = false;
function sweep() {
    if (swept) return;
    swept = true;
    const d = db_(), t = now();
    Object.keys(all).forEach(function (id) {
        const r = all[id] || {};
        const age = t - (Number(r.createdAt) || 0);
        const old = (r.state === 'LOBBY' && age > LOBBY_TTL) || (r.state === 'PLAY' && age > PLAY_TTL)
            || (r.state === 'END' && age > END_TTL) || !r.kind;
        if (!old) return;
        try { d.ref(ROOT + '/' + id).remove(); d.ref(CHAT + '/' + id).remove(); d.ref('disasterSrv/' + id).remove(); } catch (e) { }
    });
}

// 내가 들어 있는 판을 따라간다 — 대화칸을 그 판에 건다
function follow() {
    const u = me();
    let id = u ? activeOf(all, u.code) : null;
    if (!id && u && watchId && all[watchId] && (isAdm(u) || paidWatch(u, watchId))) id = watchId;   // 관전
    if (id === curId) return;
    if (chatRef && chatCb) { try { chatRef.off('child_added', chatCb); } catch (e) { } }
    chatRef = chatCb = null; chatLines = [];
    const c = document.getElementById('dz-chat'); if (c) c.innerHTML = '';
    curId = id; lastR = -1; lastInfo = ''; headN = 0;
    if (!id) return;
    chatRef = db_().ref(CHAT + '/' + id).limitToLast(300);
    chatCb = function (s) { const v = s.val(); if (v && v.t) { chatLines.push(v); addLine(v); } };
    chatRef.on('child_added', chatCb);
}

let lastR = -1;
// ★ 장면마다 한 묶음 (2026-10-20) — [지난 장면 결과 · 이번 장면 서술] 바로 아래에 그 장면의 대화가 이어진다
//   예전에는 결과 · 서술이 창 맨 위(#dz-info)에만 있어 대화가 길어지면 한참 위로 올라가야 했다.
//   #dz-chat > .dz-rd[data-r=장면] > .dz-rh (머리 — 결과 · 서술) + .dz-rl (대화) · 대기실(0)은 머리 없이 「— 대기실 —」
function secOf(rn) {
    const c = document.getElementById('dz-chat'); if (!c) return null;
    let s = c.querySelector('.dz-rd[data-r="' + rn + '"]');
    if (s) return s;
    s = document.createElement('div');
    s.className = 'dz-rd'; s.setAttribute('data-r', String(rn));
    s.innerHTML = rn ? '<div class="dz-rh"><div class="sep">— 장면 ' + rn + ' —</div></div><div class="dz-rl"></div>'
                     : '<div class="sep">— 대기실 —</div><div class="dz-rl"></div>';
    const after = Array.prototype.filter.call(c.children, function (x) { return Number(x.getAttribute('data-r')) > rn; })[0];
    c.insertBefore(s, after || null);
    return s;
}
function addLine(v) {
    const c = document.getElementById('dz-chat'); if (!c) return;
    const u = me(), r = all[curId] || {};
    const rn = Number(v.r) || 0;
    const sec = secOf(rn); if (!sec) return;
    const m = (r.members || {})[v.c] || {};
    const el = document.createElement('div');
    // 🐾 아기 여우의 말 — 옅은 주황색 (서버가 올린 줄 · v.fox)
    el.className = 'ln' + (v.fox || v.foxd ? ' fox' : '') + (u && v.c === u.code ? ' me' : '') + (m.st === 'lost' ? ' echo' : '');
    el.innerHTML = '<b>' + esc(v.n || v.c) + '</b>' + esc(v.t);
    sec.querySelector('.dz-rl').appendChild(el);
    const main = document.getElementById('dz-main');
    if (main && main.scrollHeight - main.scrollTop - main.clientHeight < 160) main.scrollTop = main.scrollHeight;
}
// 장면 머리 — 지난 장면 결과(판정 칩까지) · 이번 장면 서술
function headHtml(r, n) {
    const H = r.history || {}, cur = Number(r.round) || 0;
    const L = (r.last && Number(r.last.n) === n - 1) ? r.last : null;
    const p = H[n - 1] || null;
    let h = '';
    if (n >= 2 && (L || p)) {
        h += '<div class="dz-sec">지난 장면 — ' + esc((L || p).title) + '</div>'
            + '<div class="dz-res"><div class="b">' + br((L || p).result) + '</div>' + checkChips(L ? L.checks : (p && p.checks), r.kind) + '</div>';
    }
    const sc = (r.state === 'PLAY' && n === cur && r.scene) ? r.scene : H[n];
    if (sc) h += '<div class="dz-sec">장면 ' + n + '</div>'
        + '<div class="dz-scene"><div class="h">' + esc(sc.title) + '</div><div class="b">' + br(sc.text) + '</div></div>';
    return h || '<div class="sep">— 장면 ' + n + ' —</div>';
}
// 장면 머리를 채운다 — 새 장면이 열리면 (아래쪽을 보고 있었으면) 그 머리가 맨 위에 오게 내린다
let headN = 0;
function syncHeads(r) {
    if (!r || (r.state !== 'PLAY' && r.state !== 'END')) return;
    const top = r.state === 'PLAY' ? (Number(r.round) || 0)
        : Object.keys(r.history || {}).reduce(function (a, k) { return Math.max(a, Number(k) || 0); }, 0);
    const main = document.getElementById('dz-main');
    const low = !main || main.scrollHeight - main.scrollTop - main.clientHeight < 160 || !headN;
    let moved = false;                                   // 지금 장면의 머리가 새로 채워졌나 (장면이 넘어가며 결과 · 서술이 차례로 닿는다)
    for (let n = 1; n <= top; n++) {
        const sec = secOf(n); if (!sec) return;
        const hd = sec.querySelector('.dz-rh'), h = headHtml(r, n);
        if (hd.getAttribute('data-h') !== h) { hd.innerHTML = h; hd.setAttribute('data-h', h); if (n === top) moved = true; }
    }
    if (r.state === 'PLAY' && top && (top !== headN || moved)) {
        const first = !headN;
        headN = top;
        const hd = (secOf(top) || {}).firstChild;
        if (main && hd && (low || first)) {
            main.scrollTop += hd.getBoundingClientRect().top - main.getBoundingClientRect().top - 6;
        }
    }
}

// ==========================================
// 5. 그리기
// ==========================================
let lastInfo = '';
function paint() {
    if (!ov) return;
    const u = me(); if (!u) return;
    const r = curId ? all[curId] : null;
    const info = document.getElementById('dz-info'), mem = document.getElementById('dz-mem');
    const nEl = document.getElementById('dz-n'), bar = document.getElementById('dz-bar');
    const inp = document.getElementById('dz-in'), done = document.getElementById('dz-done');
    const tEl = document.getElementById('dz-t');
    if (tEl) { const tt = r ? kName(r.kind) : '📼 기록 소실'; if (tEl.textContent !== tt) tEl.textContent = tt; }
    let html = '', foot = '';
    if (!r) {
        lastR = -1;
        nEl.textContent = '· 대기실 목록';
        mem.innerHTML = ''; mem.style.display = 'none';
        bar.style.display = 'none';
        html = lobbyList(u);
    } else if (!(r.members || {})[u.code]) {
        // ── 관전 — 보기만 한다 (상담사 · 관전 티켓을 낸 사원)
        mem.style.display = '';
        mem.innerHTML = memberChips(r, u);
        bar.style.display = 'none';
        const n = Number(r.round) || 0;
        nEl.textContent = '· 관전 · ' + (r.state === 'PLAY' ? '장면 ' + n : (r.state === 'END' ? '끝' : '대기실'));
        html = '<div class="dz-row" style="border-color:#5a4a2a;"><div class="w" style="color:#e8c27a;">👁 관전 중 — '
            + esc(((r.members || {})[r.leader] || {}).n || '?') + '의 방 <i>말과 확정은 할 수 없습니다</i></div>'
            + '<button data-unwatch="1">목록으로</button></div>'
            + ((r.state === 'END' || r.state === 'PLAY') ? '' : '<div class="dz-card-m">아직 시작하지 않은 방입니다.</div>');
        foot = r.state === 'END' ? ending(r, u) : (r.state === 'PLAY' ? play(r, u) : '');
    } else {
        mem.style.display = '';
        mem.innerHTML = memberChips(r, u);
        bar.style.display = '';
        if (r.state === 'LOBBY') {
            nEl.textContent = '· 대기실';
            html = room(r, u);
            inp.placeholder = '대기실에서 의논하기';
            inp.disabled = false; done.style.display = 'none';
            ov.querySelector('#dz-send').disabled = false;
        } else if (r.state === 'PLAY') {
            const n = Number(r.round) || 0;
            nEl.textContent = '· 장면 ' + n;
            foot = play(r, u);                                  // 결과 · 서술은 대화칸의 장면 머리로 (syncHeads)
            const mySt = (r.members[u.code] || {}).st || 'ok';
            const lost = mySt === 'lost', out = mySt === 'out';
            const talk = r.phase === 'TALK';
            inp.disabled = !talk || out;
            inp.placeholder = out ? K(r.kind).place + '을 빠져나왔습니다 — 지켜봅니다' : (!talk ? '진행자가 정리하는 중…'
                : (lost ? (((r.members[u.code] || {}).vanish && K(r.kind).vanishIn) || K(r.kind).lostIn) : '캐릭터로 말하고 행동하기'));
            ov.querySelector('#dz-send').disabled = !talk || out;
            done.style.display = (lost || out || isAdm(u)) ? 'none' : '';
            const on = Number((r.members[u.code] || {}).done) === n;
            done.classList.toggle('on', on);
            done.textContent = on ? '확정함 ✓' : '행동 확정';
            done.disabled = !talk;
        } else {
            nEl.textContent = '· 끝';
            foot = ending(r, u);
            bar.style.display = 'none';
        }
    }
    // 위(#dz-info) — 목록 · 대기실 · 관전 띠 / 아래(#dz-foot, 대화 뒤) — 지금 장면의 안내 · 끝 화면
    const key = html + '\u0001' + foot;
    if (key !== lastInfo) {
        info.innerHTML = html;
        const ft = document.getElementById('dz-foot'); if (ft) ft.innerHTML = foot;
        lastInfo = key; wire();
    }
    if (r) syncHeads(r);
    onTick();
}

function lobbyList(u) {
    const t = now();
    const g = gate(u, all);
    if (!g.ok) return '<div class="dz-err" style="margin-top:20px;">🔒 ' + esc(g.why) + '</div>';
    const pk = curK();
    const shut = !isOpen(pk);
    const free = isAdm(u);                                   // 상담사는 티켓 없이 · 닫혀 있어도
    const ids = Object.keys(all).filter(function (id) {
        const r = all[id];
        return r && r.kind === pk && r.state === 'LOBBY' && t - (r.createdAt || 0) < LOBBY_TTL
            && (!shut || free || r.leader === ADMIN);
    }).sort(function (a, b) { return (all[a].createdAt || 0) - (all[b].createdAt || 0); });
    const n = tickets(u), wn = wTickets(u);
    // 재난 고르기 — 열린 재난에 「열림」 · 대기실 방 수
    let h = '<div class="dz-chk" style="margin:0 0 10px;">' + KIND_LIST.map(function (k) {
        const on = k === pk, open = isOpen(k);
        const rooms = Object.keys(all).filter(function (id) { const r = all[id]; return r && r.kind === k && r.state === 'LOBBY' && t - (r.createdAt || 0) < LOBBY_TTL; }).length;
        return '<span data-kind="' + k + '" class="' + (on ? 'ok' : '') + '" style="cursor:pointer;font-size:12px;padding:6px 10px;">'
            + kName(k) + ' <i style="font-style:normal;color:' + (open ? '#9fd8a4' : '#6f8c8c') + ';">' + (open ? '열림' : '닫힘')
            + (rooms ? ' · 방 ' + rooms : '') + '</i></span>';
    }).join('') + '</div>';
    h += intro(pk) + '<div class="dz-card-m" style="margin:0 0 10px;">' + DZ_TICKET + ' <b style="color:#e8c27a;">' + n + '</b>장'
        + (free ? ' · 상담사는 티켓 없이 들어갑니다' : '')
        + (!free && wn ? '<br>' + DZ_WATCH + ' <b style="color:#9fd8ef;">' + wn + '</b>장' : '') + '</div>';
    if (shut) h += '<div class="dz-err">🔒 닫혀 있습니다 — 상담사만 들어가 시험할 수 있습니다. (상담사가 연 방에는 다른 사원도 들어옵니다)</div>';
    h += '<div class="dz-sec">열려 있는 방</div>';
    if (!ids.length) h += '<div class="dz-card-m">열려 있는 방이 없습니다.</div>';
    ids.forEach(function (id) {
        const r = all[id], m = r.members || {}, cs = Object.keys(m);
        const full = cs.length >= MAX_MEMBERS;
        h += '<div class="dz-row"><div class="w">' + esc((m[r.leader] || {}).n || '?') + '의 방 <i>' + cs.length + ' / ' + MAX_MEMBERS + '</i><br>'
            + '<i>' + cs.map(function (c) { return esc(m[c].n || c); }).join(' · ') + '</i></div>'
            + '<button data-join="' + esc(id) + '"' + ((full || (!n && !free) || busy) ? ' disabled' : '') + '>' + (full ? '가득 참' : '들어간다') + '</button></div>';
    });
    h += '<div style="margin-top:14px;"><button class="dz-btn" data-make="1"' + (((!n && !free) || busy || (shut && !free)) ? ' disabled' : '') + '>새로 연다</button></div>';
    if (free || canSpectate(u, all)) {
        const live = Object.keys(all).filter(function (id) {
            const r = all[id];
            return r && !!KINDS_C[r.kind] && !(r.members || {})[u.code]
                && (r.state === 'PLAY' || (r.state === 'END' && t - (Number((r.outcome || {}).at) || 0) < 3600000));
        }).sort(function (a, b) { return (all[b].startedAt || 0) - (all[a].startedAt || 0); });
        h += '<div class="dz-sec">진행 중인 판 — 👁 관전' + (free ? ' (상담사)' : '') + '</div>';
        if (!free) h += '<div class="dz-card-m" style="margin:0 0 8px;">판을 골라 보기 시작할 때 ' + DZ_WATCH + '이 한 장 사라집니다. 이미 본 판은 다시 봐도 그대로입니다. 말 · 확정은 할 수 없습니다.</div>';
        if (!live.length) h += '<div class="dz-card-m">진행 중인 판이 없습니다.</div>';
        live.forEach(function (id) {
            const r = all[id], m = r.members || {}, cs = Object.keys(m);
            const where = r.state === 'PLAY' ? '장면 ' + (Number(r.round) || 0) : '끝 — ' + ((END_N[(r.outcome || {}).kind] || END_N.escape)[0]);
            const paid = free || paidWatch(u, id);
            let btn = '<button data-watch="' + esc(id) + '"' + (!paid && !wn ? ' disabled' : '') + '>' + (paid ? '본다' : (wn ? '본다 · 1장' : '티켓 없음')) + '</button>';
            h += '<div class="dz-row"><div class="w">' + esc(kName(r.kind)) + ' · ' + esc((m[r.leader] || {}).n || '?') + '의 방 <i>' + where + '</i><br>'
                + '<i>' + cs.map(function (c) { return esc(m[c].n || c) + ' ' + stM(r.kind, m[c]); }).join(' · ') + '</i></div>'
                + btn + '</div>';
            if (askWatch === id && !paid) {
                h += '<div class="dz-row" style="border-color:#2a7a9a;"><div class="w" style="color:#9fd8ef;">👁 ' + DZ_WATCH + ' 한 장을 쓰고 이 판을 봅니다.<br>'
                    + '<i>남은 ' + wn + '장 → ' + (wn - 1) + '장</i></div>'
                    + '<button data-watchok="' + esc(id) + '">쓴다</button><button data-watchno="1">그만둔다</button></div>';
            }
        });
    }
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    return h;
}

// 재난 안내 — 등급 · 이름 · 생존 확률 · 개요 · 장비
function intro(k) {
    const x = K(k);
    return '<div class="dz-card" style="margin-bottom:12px;">'
        + '<div class="dz-card-m" style="margin:0 0 4px; color:#ff9aa8; letter-spacing:2px;">' + x.grade + '급 재난</div>'
        + '<div class="dz-card-h">' + x.icon + ' ' + x.name + '</div>'
        + '<div class="dz-card-t" style="margin-bottom:8px;">' + esc(x.brief) + '</div>'
        + '<div class="dz-card-m" style="margin:0;">생존 확률 <b style="color:#ff6b81;">' + x.survive + '%</b>'
        + ' · 들고 들어갈 수 있는 장비 <b style="color:#e8c27a;">' + x.gear + '개</b> (효과는 적용되지 않습니다)</div>'
        + '<div class="dz-card-m" style="margin:8px 0 0;line-height:1.8;">' + x.reward + '</div></div>';
}

// 들고 갈 수 있는 장비 — 장착 중 · 소지품의 장비 · 전용 장비 (성적인 것 빼고)
function baseOf(w) {
    try { if (typeof getEquipBaseName === 'function') return getEquipBaseName(w); } catch (e) { }
    return String(w || '').split(' (')[0].trim();
}
function gearPool(u) {
    const out = [], seen = {};
    const put = function (nm, tag) {
        nm = String(nm || '').trim();
        if (!nm || seen[nm] || NO_GEAR.test(nm) || nm === DZ_TICKET || SIGIL_ITEMS.indexOf(nm) >= 0) return;
        seen[nm] = 1; out.push({ n: nm, tag: tag });
    };
    (u.equippedWeapons || []).forEach(function (w) { put(baseOf(w), '장착 중'); });
    const cat = (typeof ITEM_CATALOG !== 'undefined') ? ITEM_CATALOG : {};
    (u.inventory || []).forEach(function (x) {
        const b = baseOf(x), c = cat[x] || cat[b];
        if (c && (String(c.effect || '').indexOf('equip') === 0 || c.equipKind)) put(b, '소지품');
    });
    if (u.soulGear && u.soulGear.name) put(u.soulGear.name, '전용 장비');
    return out;
}
function gearPick(r, u) {
    const mine = ((r.members || {})[u.code] || {}).gear || [];
    const pool = gearPool(u);
    const GEAR_MAX = K(r.kind).gear;
    let h = '<div class="dz-sec">들고 갈 장비 — ' + mine.length + ' / ' + GEAR_MAX + ' (효과는 적용되지 않고, 이야기 속 물건으로만 쓰입니다)</div>';
    if (!pool.length) return h + '<div class="dz-card-m">들고 갈 수 있는 장비가 없습니다.</div>';
    h += '<div class="dz-chk" style="margin:0 0 10px;">' + pool.map(function (g) {
        const on = mine.indexOf(g.n) >= 0, full = !on && mine.length >= GEAR_MAX;
        return '<span data-gear="' + esc(g.n) + '" class="' + (on ? 'ok' : '') + '" style="cursor:' + (full ? 'default' : 'pointer') + ';'
            + (full ? 'opacity:.4;' : '') + 'font-size:11px;padding:5px 9px;">' + (on ? '✓ ' : '') + esc(g.n)
            + ' <i style="font-style:normal;color:#6f8c8c;">' + g.tag + '</i></span>';
    }).join('') + '</div>';
    return h;
}
// ★ 🐾 아기 여우 — 주인은 데려갈 여우를 고른다 (2026-10-20)
//   members/<사번>/foxPick = 'evade,heal' 꼴 글자 · '-' 는 하나도 안 데려감 · 없으면 데려갈 수 있는 것 전부
//   (빈 배열은 파이어베이스가 지워 「안 고름」과 갈리지 않으므로 글자로 둔다 — 서버 core.js foxesOf 가 읽는다)
//   남에게 붙여 준 아이는 그 사람 곁으로 가므로 여기서 고르지 않는다 · 오늘 소멸한 아이도 못 고른다
const BABY = '🐾 아기 호랑이';
const BABY_OLDS = ['🐾 아기 여우'];                                         // 옛 이름 (2026-10-29 이름 바꿈 · fox-rename.js 가 글자를 바꾼다)
function isBaby(n) { return n === BABY || BABY_OLDS.indexOf(n) >= 0; }
const FOX_K = [['evade', '코코', '회피'], ['sense', '잭슨', '감각'], ['heal', '쭈니', '치유'], ['hide', '루팡', '은신'],
               ['luck', '앙냥', '행운'], ['break', '디트', '파괴'], ['bond', '메리', '연결'], ['gaze', '니케', '응시']];
function ownsBaby(u) {
    return (u.equippedWeapons || []).concat(u.inventory || []).some(function (w) { return isBaby(baseOf(w)); });
}
function dayStr() { try { return getTodayStr(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function foxStateOf(u, k) {                 // 'ok' · 'gone' · '붙여 준 사람 이름'
    const kits = (u.kits && typeof u.kits === 'object') ? u.kits : {};
    const s = (kits[k] && typeof kits[k] === 'object') ? kits[k] : {};
    if (u.kitDay === dayStr() && s.gone) return 'gone';
    if (s.to && s.to !== u.code) return String(s.toName || s.to);
    return 'ok';
}
function foxPickOf(x) {
    const v = x && x.foxPick;
    if (v == null || v === '') return null;
    if (v === '-') return [];
    return String(v).split(',').filter(Boolean);
}
function foxOn(r, u) {
    const avail = FOX_K.filter(function (f) { return foxStateOf(u, f[0]) === 'ok'; }).map(function (f) { return f[0]; });
    const pick = foxPickOf((r.members || {})[u.code]);
    return { avail: avail, on: pick === null ? avail : pick.filter(function (k) { return avail.indexOf(k) >= 0; }) };
}
function foxPick(r, u) {
    if (!ownsBaby(u)) return '';
    const F = foxOn(r, u);
    let h = '<div class="dz-sec">🐾 데려갈 아기 호랑이 — ' + F.on.length + ' / ' + F.avail.length + '</div>';
    h += '<div class="dz-chk" style="margin:0 0 10px;">' + FOX_K.map(function (f) {
        const s = foxStateOf(u, f[0]), ok = s === 'ok', sel = ok && F.on.indexOf(f[0]) >= 0;
        return '<span data-fox="' + f[0] + '" class="' + (sel ? 'ok' : '') + '" style="cursor:' + (ok ? 'pointer' : 'default') + ';'
            + (ok ? '' : 'opacity:.4;') + 'font-size:11px;padding:5px 9px;">' + (sel ? '✓ ' : '') + f[1]
            + ' <i style="font-style:normal;color:#6f8c8c;">' + f[2] + (s === 'gone' ? ' · 오늘 소멸' : (ok ? '' : ' · ' + esc(s) + ' 곁')) + '</i></span>';
    }).join('') + '</div>';
    return h;
}
function toggleFox(k) {
    const u = me(), d = db_(), r = curId && all[curId];
    if (!u || !d || !r || r.state !== 'LOBBY' || !r.members || !r.members[u.code] || !ownsBaby(u)) return;
    const F = foxOn(r, u);
    if (F.avail.indexOf(k) < 0) return;
    const cur = F.on.slice(), i = cur.indexOf(k);
    if (i >= 0) cur.splice(i, 1); else cur.push(k);
    const all8 = F.avail.every(function (x) { return cur.indexOf(x) >= 0; });
    d.ref(ROOT + '/' + curId + '/members/' + u.code + '/foxPick').set(all8 ? null : (cur.length ? cur.join(',') : '-'));
}

function toggleGear(nm) {
    const u = me(), d = db_(), r = curId && all[curId];
    if (!u || !d || !r || r.state !== 'LOBBY' || !r.members || !r.members[u.code]) return;
    const cur = (r.members[u.code].gear || []).slice();
    const i = cur.indexOf(nm);
    if (i >= 0) cur.splice(i, 1);
    else { if (cur.length >= K(r.kind).gear) return; cur.push(nm); }
    d.ref(ROOT + '/' + curId + '/members/' + u.code + '/gear').set(cur.length ? cur : null);
}

// 💍 함께 들어온 커플 — 사번 → 짝의 사번 (판이 시작되면 서버가 맞춘 couples · 대기실에서는 사원 기록의 couple 로)
function pairMap(r) {
    const m = r.members || {}, out = {};
    if (Array.isArray(r.couples)) r.couples.forEach(function (x) { if (x && m[x[0]] && m[x[1]]) { out[x[0]] = x[1]; out[x[1]] = x[0]; } });
    Object.keys(m).forEach(function (c) {
        if (out[c]) return;
        const uc = me();
        const cp = (m[c].couple && m[c].couple.p) ? { partner: m[c].couple.p }
            : ((uc && uc.code === c) ? uc.couple : ((typeof db !== 'undefined' && db.users && db.users[c]) || {}).couple) || null;
        if (cp && cp.partner && m[cp.partner] && cp.partner !== c) { out[c] = cp.partner; out[cp.partner] = c; }
    });
    return out;
}
function coupleEmoji(c) {
    try {
        const u = me();
        const src = (u && u.code === c) ? u : ((typeof db !== 'undefined' && db.users && db.users[c]) || null);
        const cp = src && src.couple;
        return (cp && cp.emoji) || '💍';
    } catch (e) { return '💍'; }
}
function memberChips(r, u) {
    const m = r.members || {}, n = Number(r.round) || 0;
    const pm = pairMap(r);
    return Object.keys(m).sort(function (a, b) { return (m[a].at || 0) - (m[b].at || 0); }).map(function (c) {
        const x = m[c], st = x.st || 'ok';
        const tag = r.state === 'LOBBY' ? (c === r.leader ? ' · 방장' : '')
            : ((x.role && ROLE_N[x.role] ? ' · ' + (x.role === 'vip' ? K(r.kind).vip : ROLE_N[x.role]) : '') + ' · ' + (st === 'out' && x.kick ? '모셔짐' : stM(r.kind, x))
               + (r.state === 'PLAY' && !gone(st) && (Number(x.done) === n || Number(x.leave) === n) ? ' ✓' : ''));
        return '<span style="color:' + (r.state === 'LOBBY' ? '#cfe' : ST_C[st]) + ';' + (c === u.code ? 'border-color:#5a7a3a;' : '') + '"'
            + (pm[c] ? ' title="' + esc(((m[pm[c]] || {}).n || '') + ' 사원과 커플') + '"' : '') + '>'
            + esc(x.n || c) + (pm[c] ? ' ' + esc(coupleEmoji(c)) : '') + (x.wolf && !gone(st) ? ' 🐺' : '')
            + (x.role === 'vip' && K(r.kind).noLeave && Number(x.odd) && !gone(st) ? ' ❓' + Number(x.odd) : '') + tag + '</span>';
    }).join('') + aidChips(r);
}
// 🤝 조력자 — 만난 장면부터 (새빛 병원 · 2026-10-23) · 대신 끌려가면 흐리게
function aidChips(r) {
    const A = r.aid || {}, n = Number(r.round) || 0;
    if (r.state !== 'PLAY' && r.state !== 'END') return '';
    return Object.keys(A).filter(function (id) { return A[id] && Number(A[id].met) <= n; }).map(function (id) {
        const a = A[id], off = !!a.gone;
        const what = a.save ? '한 번 대신 끌려감' : ((a.k || '') + (a.cut ? ' −' + a.cut : ''));
        return '<span style="color:' + (off ? '#6a6a7a' : '#9fd8ef') + ';border-color:' + (off ? '#3a3a4a' : '#2a6a8a') + ';" title="조력자">🤝 '
            + esc(a.n || id) + ' · ' + (off ? '끌려감' : esc(what)) + '</span>';
    }).join('');
}

function room(r, u) {
    const lead = r.leader === u.code;
    const cs = Object.keys(r.members || {});
    let h = intro(r.kind) + '<div class="dz-card-t" style="margin-top:4px;">대기실입니다. 방장이 [시작한다]를 누르면 재난이 열립니다.<br>'
        + '시작하는 순간 사원마다 ' + DZ_TICKET + '이 한 장씩 사라집니다. (' + cs.length + ' / ' + MAX_MEMBERS + '명)</div>';
    if (r.phase === 'WAIT') h += '<div id="dz-wait">진행자가 재난을 여는 중…</div>';
    if (r.err) h += '<div class="dz-err">⚠ ' + esc(r.err) + '</div>';
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    // 💍 커플이 함께 들어간다 — 진행자도 안다
    const pm = pairMap(r), seenP = {};
    const pairs = Object.keys(pm).filter(function (c) { const k = [c, pm[c]].sort().join('|'); if (seenP[k]) return false; seenP[k] = 1; return true; });
    if (pairs.length) h += '<div class="dz-card-m" style="margin:0 0 10px; color:#ffb7c5;">' + pairs.map(function (c) {
        return esc((r.members[c] || {}).n || c) + ' ' + esc(coupleEmoji(c)) + ' ' + esc((r.members[pm[c]] || {}).n || pm[c]);
    }).join(' · ') + ' — 커플이 함께 들어갑니다. 재난 속에서도 둘이 연인임을 압니다.</div>';
    h += gearPick(r, u);
    h += foxPick(r, u);
    if (lead) h += '<button class="dz-btn" data-start="1"' + (busy || r.phase === 'WAIT' ? ' disabled' : '') + '>시작한다</button>';
    else h += '<div class="dz-card-m">방장이 시작하기를 기다리는 중입니다.</div>';
    h += '<div style="margin-top:8px;"><button class="dz-btn sub" data-leave="1"' + (busy ? ' disabled' : '') + '>나간다</button></div>';
    return h;
}

function checkChips(list, kind) {
    return '<div class="dz-chk">' + (list || []).map(function (c) {
        if (c.vanish) return '<span class="no" title="괴물들의 의심이 쌓였다">🌑 ' + esc(c.name) + ' · 어둠 속으로 사라짐 → 실종</span>';
        if (c.kind === 'none') return '<span' + (c.kick ? ' class="no"' : '') + '>' + esc(c.name) + ' · ' + esc(c.did) + (c.kick ? ' → 모셔짐' : '') + '</span>';
        // 🐾 아기 여우의 판정 — 옅은 주황 (다침은 이 판 안에서만 · 대신 소멸은 그날 어둠에서도 못 부름)
        if (c.fx) {
            let f = esc(c.name) + ' · ' + KIND_N[c.kind] + ' ' + c.roll + '/' + c.dc + ' ' + (c.ok ? '성공' : '실패')
                + (c.crit ? ' ★' : '') + (c.fumble ? ' ✖' : '') + (c.plus ? ' (+' + c.plus + ')' : '');
            if (c.to) f += ' → ' + (c.to === 'lost' ? '소멸' : '다침');
            if (c.tgtTo) f += ' · ' + esc(c.tgtName) + ' ' + (c.tgtFox ? '다침→멀쩡' : stN(kind, c.tgtFrom) + '→' + stN(kind, c.tgtTo));
            return '<span class="fx ' + (c.ok ? 'ok' : 'no') + '" title="' + esc(c.did) + '">' + f + '</span>';
        }
        let s = esc(c.name) + ' · ' + KIND_N[c.kind] + ' ' + c.roll + (c.wolf ? '+' + c.wolf : '') + (c.burnPlus ? '+' + c.burnPlus : '') + '/' + c.dc + ' ' + (c.ok ? '성공' : '실패')
            + (c.crit ? ' ★' : '') + (c.fumble ? ' ✖' : '');
        if (c.wolf) s = '🐺 ' + s;          // 늑대의 모습인 경비팀장 — 주사위 +8 (2026-10-21)
        if (c.forced) s = '⚡ ' + s;
        if (c.quiet) s = '💤 ' + s;         // 말이 없어 대신 굴린 다이스
        if (c.burn) s = '🔥 ' + s;          // 📺 심야 토크쇼의 주인의 소각
        if (c.meta) s = '🔊 ' + s;          // 바깥의 말 — 그곳이 그 말을 들었다
        if (c.plus) s += ' (+' + c.plus + ')';
        if (c.ease) s += ' (−' + c.ease + ')';          // 이사팀 — 조금 쉽게
        if (c.help) s += ' (🤝−' + c.help + ')';        // 조력자 덕에 (새빛 병원)
        if (c.to) s += ' → ' + stN(kind, c.to);
        if (c.tgtTo) s += ' · ' + esc(c.tgtName) + ' ' + stN(kind, c.tgtFrom) + '→' + stN(kind, c.tgtTo);
        if (c.kick) s += ' → 모셔짐';
        if (c.aid) s += ' · 🤝 ' + esc(c.aid) + ' 대신 끌려감';     // 조력자가 대신 끌려갔다 (새빛 병원)
        if (c.fox) s += ' · 🐾 ' + esc(c.fox.n) + ' 대신 소멸';      // 아기 호랑이가 죽음을 대신 받았다
        return '<span class="' + (c.ok ? 'ok' : 'no') + '" title="' + esc(c.did) + '">' + s + '</span>';
    }).join('') + '</div>';
}

// 지금 장면의 안내 — 대화칸 아래 (#dz-foot). 지난 결과 · 장면 서술은 대화칸의 장면 머리에 (headHtml · 2026-10-20)
function play(r, u) {
    const n = Number(r.round) || 0;
    let h = '';
    // ✗ 「귀빈이 빠진 자리 — 난이도 +n」 · 「심야 토크쇼의 사회자가 없습니다」 같은 경고 줄은 띄우지 않는다 (2026-10-20)
    //   (진행자는 알고 이야기로 그린다 · 대기실 안내 카드에도 안 적는다)
    const x = (r.members || {})[u.code] || {}, st = x.st || 'ok';
    if (st === 'out') {
        const bath = /재난관리/.test((x.aff || '') + ' ' + (x.team || ''));
        h += '<div class="dz-card" style="border-color:#5a4a7a;margin-bottom:12px;"><div class="dz-card-t" style="margin:0;color:#c9b6ff;">'
            + (x.kick ? K(r.kind).kickSay + '<br>' + K(r.kind).kickWho + ' ' + (bath ? '♨ 선녀탕으로' : '🦊 여우 상담실로') + ' 모셨습니다.<br>남은 사람들의 이야기를 지켜봅니다.'
                      : K(r.kind).place + '을 홀로 빠져나왔습니다. 남은 사람들의 이야기를 지켜봅니다.') + '</div></div>';
    } else if (x.role === 'vip' && st !== 'lost' && K(r.kind).noLeave) {
        // 🏥 새빛 병원 — 귀빈이 없다. 사회자는 똑같이 들어가되 괴물들이 동족으로 알아본다 (홀로 나가기 없음)
        h += '<div class="dz-card" style="border-color:#5a4a7a;margin-bottom:12px;"><div class="dz-card-t" style="margin:0;color:#c9b6ff;">'
            + K(r.kind).kinLine + '<br><span style="font-size:11px;color:#9a8fb8;">괴물답지 않게 굴면 괴물들이 이상함을 느낍니다.'
            + (K(r.kind).vanishAt ? ' 그 의심이 ' + K(r.kind).vanishAt + '번 쌓이면 어둠 속으로 사라집니다 (실종).' : '') + ' 홀로 나갈 수는 없습니다.</span>'
            + (K(r.kind).burnLine ? '<br><span style="font-size:11px;color:#ff9a6b;">🔥 ' + K(r.kind).burnLine + '</span>' : '')
            + (Number(x.odd) ? '<br><span style="font-size:11px;color:#ffb36b;">❓ 괴물들이 당신을 ' + Number(x.odd) + '번 이상하게 여겼습니다'
                + (K(r.kind).vanishAt ? ' (' + K(r.kind).vanishAt + '번이면 사라집니다)' : '') + '.</span>' : '')
            + '</div></div>';
    } else if (x.vanish && st === 'lost') {
        // 🏥 괴물들의 의심이 쌓여 어둠 속으로 사라졌다 (실종)
        h += '<div class="dz-card" style="border-color:#3a3a4a;margin-bottom:12px;"><div class="dz-card-t" style="margin:0;color:#b8b0c8;">'
            + '🌑 괴물들의 의심이 쌓였습니다. 당신은 <b>어둠 속으로 사라졌습니다</b> — 실종.<br>'
            + '<span style="font-size:11px;color:#8a8298;">아무도 당신을 찾을 수 없습니다. 남은 사람들의 이야기를 지켜봅니다.</span></div></div>';
    } else if (x.role === 'vip' && st !== 'lost') {
        const going = Number(x.leave) === n;
        h += '<div class="dz-card" style="border-color:#5a4a7a;margin-bottom:12px;">'
            + '<div class="dz-card-t" style="margin-bottom:8px;color:#c9b6ff;">당신은 ' + K(r.kind).vipLine + '입니다. 원하면 홀로 나갈 수 있습니다.<br>'
            + '<span style="font-size:11px;color:#9a8fb8;">나가면 남은 재난관리국 · 백일몽 쪽의 난이도가 기하급수로 오릅니다.</span></div>'
            + '<button class="dz-btn sub" data-out="1"' + (r.phase !== 'TALK' ? ' disabled' : '') + ' style="border-color:#5a4a7a;color:#c9b6ff;">'
            + (going ? '이 장면이 끝나면 나갑니다 — 그만둔다' : '홀로 나간다') + '</button></div>';
    }
    if (r.phase === 'WAIT') h += '<div id="dz-wait">진행자가 장면을 정리하는 중…</div>';
    if (r.err) h += '<div class="dz-err">⚠ ' + esc(r.err) + ' — 잠시 뒤 다시 넘깁니다.</div>';
    if (msg) h += '<div class="dz-err">' + esc(msg) + '</div>';
    // 💤 말이 없던 사람에게 — 이번에도 말이 없으면 다이스가 대신 굴러간다 (2026-10-20 · 서버 core.js QUIET_ROLL)
    const qn = Number(x.quiet) || 0;
    if (qn && !gone(st) && r.phase === 'TALK') {
        h += '<div class="dz-card" style="border-color:#4a5a6a;margin-bottom:12px;"><div class="dz-card-t" style="margin:0;color:#b8c8d8;">💤 '
            + (qn >= 2 ? '여러 장면째 아무 말도 하지 않아 다이스가 대신 굴러갔습니다.' : '지난 장면에 아무 말도 하지 않았습니다.')
            + '<br><span style="font-size:11px;color:#8a9aaa;">이번 장면에도 말이 없으면 다이스가 대신 굴러갑니다 — 머뭇거리는 사이 상황이 닥칩니다.</span></div></div>';
    }
    h += '<div class="dz-sec">대화 — 캐릭터로 말하고 행동하세요. 4분이 지나거나 모두 확정하면 넘어갑니다.</div>';
    return h;
}

function ending(r, u) {
    const o = r.outcome || {}, E0 = END_N[o.kind] || END_N.escape;
    const E = (o.kind === 'fail') ? [E0[0], E0[1], K(r.kind).fail] : E0;
    const m = r.members || {};
    let h = '';
    if (r.last) {
        h += '<div class="dz-sec">마지막 장면 — ' + esc(r.last.title) + '</div>'
            + '<div class="dz-res"><div class="b">' + br(r.last.result) + '</div>' + checkChips(r.last.checks, r.kind) + '</div>';
    }
    h += '<div class="dz-end" style="border-color:' + E[1] + ';"><div class="k" style="color:' + E[1] + ';">' + E[0] + '</div>'
        + '<div class="dz-card-t" style="margin:0;">' + br(o.text || E[2]) + '</div></div>';
    h += '<div class="dz-sec">사원</div><div class="dz-card-m">' + Object.keys(m).map(function (c) {
        const st = m[c].st || 'ok';
        return '<span style="color:' + ST_C[st] + ';">' + esc(m[c].n || c) + ' — '
            + (st === 'lost' ? (m[c].vanish ? '실종' : K(r.kind).lostEnd) + (m[c].fate ? ' — ' + esc(m[c].fate) : '') : (st === 'out' ? (m[c].kick ? '다른 곳으로 모셔짐' : '홀로 빠져나감') : (st === 'hurt' ? '다친 채 생환' : '생환')))
            + payTag((o.pay || {})[c], m[c]) + '</span>';
    }).join('<br>') + '</div>';
    const hist = r.history || {};
    const ks = Object.keys(hist).sort(function (a, b) { return a - b; });
    if (ks.length) {
        h += '<div class="dz-sec">지난 장면들</div>' + ks.map(function (k) {
            const x = hist[k] || {};
            return '<details class="dz-h"><summary>장면 ' + k + ' — ' + esc(x.title) + '</summary><div>' + br(x.text)
                + '<br><br><span style="color:#9fe3e3;">' + br(x.result) + '</span></div></details>';
        }).join('');
    }
    h += '<div style="margin-top:12px;"><button class="dz-btn" data-close="1">닫는다</button></div>';
    return h;
}

function payTag(v, x) {
    if (v === undefined || v === null) return '';
    const bath = /재난관리/.test(((x && x.aff) || '') + ' ' + ((x && x.team) || ''));
    if (v < 0) return ' <i style="font-style:normal;color:#ff9aa8;">· ' + (bath ? '선녀탕' : '여우 상담실') + ' 이송</i>';
    return ' <i style="font-style:normal;color:#e8c27a;">· ' + (v ? '+' + Number(v).toLocaleString('ko-KR') + ' P' : '보상 없음') + '</i>';
}
function wire() {
    if (!ov) return;
    Array.prototype.forEach.call(ov.querySelectorAll('[data-join]'), function (b) { b.onclick = function () { join(b.dataset.join); }; });
    const mk = ov.querySelector('[data-make]'); if (mk) mk.onclick = make;
    Array.prototype.forEach.call(ov.querySelectorAll('[data-kind]'), function (b) {
        b.onclick = function () { pickK = b.dataset.kind; msg = ''; lastInfo = ''; paint(); };
    });
    const st = ov.querySelector('[data-start]'); if (st) st.onclick = startRun;
    const lv = ov.querySelector('[data-leave]'); if (lv) lv.onclick = leave;
    const cl = ov.querySelector('[data-close]'); if (cl) cl.onclick = close;
    Array.prototype.forEach.call(ov.querySelectorAll('[data-gear]'), function (b) { b.onclick = function () { toggleGear(b.dataset.gear); }; });
    Array.prototype.forEach.call(ov.querySelectorAll('[data-fox]'), function (b) { b.onclick = function () { toggleFox(b.dataset.fox); }; });
    const ot = ov.querySelector('[data-out]'); if (ot) ot.onclick = toggleOut;
    Array.prototype.forEach.call(ov.querySelectorAll('[data-watch]'), function (b) {
        b.onclick = function () {
            const u = me(), id = b.dataset.watch;
            if (!u || !all[id]) return;
            if (isAdm(u) || paidWatch(u, id)) { askWatch = null; watchId = id; follow(); lastInfo = ''; paint(); return; }
            if (!wTickets(u)) { alert_(DZ_WATCH + '이 없습니다.\n\n상담사에게 받을 수 있습니다.'); return; }
            askWatch = id; lastInfo = ''; paint();                      // 한 장 쓸지 묻는다
        };
    });
    const wok = ov.querySelector('[data-watchok]');
    if (wok) wok.onclick = function () { spendWatch(wok.dataset.watchok); };   // (payWatch 는 아래 9 · 보상 받기의 이름이다)
    const wno = ov.querySelector('[data-watchno]');
    if (wno) wno.onclick = function () { askWatch = null; lastInfo = ''; paint(); };
    const uw = ov.querySelector('[data-unwatch]');
    if (uw) uw.onclick = function () { watchId = null; follow(); lastInfo = ''; paint(); };
}

// 👁 관전 티켓 한 장을 내고 본다 — 같은 판은 다시 떼지 않는다
function spendWatch(id) {
    const u = me();
    askWatch = null;
    if (!u || !all[id]) { lastInfo = ''; paint(); return; }
    if (!paidWatch(u, id)) {
        if (!wTickets(u)) { alert_(DZ_WATCH + '이 없습니다.'); lastInfo = ''; paint(); return; }
        try { if (typeof removeItemFromInventory === 'function') removeItemFromInventory(u, DZ_WATCH, 1); else u.inventory.splice(u.inventory.indexOf(DZ_WATCH), 1); } catch (e) { }
        const w = (u.dzWatch && typeof u.dzWatch === 'object') ? u.dzWatch : {};
        w[id] = now();
        // 오래된 것은 걷는다 (스무 판까지만)
        Object.keys(w).sort(function (a, b) { return w[a] - w[b]; }).slice(0, Math.max(0, Object.keys(w).length - 20)).forEach(function (k) { delete w[k]; });
        u.dzWatch = w;
        const r = all[id], m = r.members || {};
        try { if (typeof addHistoryLog === 'function') addHistoryLog(u, '[기록 소실] ' + ((m[r.leader] || {}).n || '?') + '의 방을 관전합니다. (' + DZ_WATCH + ' -1)'); } catch (e) { }
        try { if (typeof saveFields === 'function') saveFields({ inventory: 1, dzWatch: 1, history: 1 }); } catch (e) { }
    }
    watchId = id; follow(); lastInfo = ''; paint();
}

// ==========================================
// 6. 대기실 — 열기 · 들어가기 · 나가기 · 시작
// ==========================================
function prof(u) {
    return { n: String(u.name || u.code), no: String(u.no || ''), team: String(u.team || ''),
             aff: String(u.affiliation || ''), pos: String(u.position || ''), at: now() };
}
function make() {
    const u = me(), d = db_();
    if (!u || !d || busy) return;
    if (!isAdm(u) && !tickets(u)) { msg = DZ_TICKET + '이 없습니다.'; lastInfo = ''; paint(); return; }
    const pk = curK();
    if (!isAdm(u) && !isOpen(pk)) { msg = '닫혀 있는 재난입니다.'; lastInfo = ''; paint(); return; }
    if (activeOf(all, u.code)) return;
    busy = true;
    const ref = d.ref(ROOT).push();
    const m = {}; m[u.code] = prof(u);
    ref.set({ kind: pk, state: 'LOBBY', leader: u.code, createdAt: now(), members: m })
        .then(function () { busy = false; msg = ''; lastInfo = ''; paint(); })
        .catch(function () { busy = false; msg = '방을 열지 못했습니다.'; lastInfo = ''; paint(); });
}
function join(id) {
    const u = me(), d = db_();
    if (!u || !d || busy || !id) return;
    if (!isAdm(u) && !tickets(u)) { msg = DZ_TICKET + '이 없습니다.'; lastInfo = ''; paint(); return; }
    if (!isAdm(u) && !isOpen((all[id] || {}).kind) && (all[id] || {}).leader !== ADMIN) { msg = '닫혀 있는 재난입니다.'; lastInfo = ''; paint(); return; }
    busy = true;
    const p = prof(u);
    d.ref(ROOT + '/' + id).transaction(function (r) {
        if (!r || r.state !== 'LOBBY') return;
        const m = r.members || {};
        if (m[u.code]) return r;
        if (Object.keys(m).length >= MAX_MEMBERS) return;
        m[u.code] = p; r.members = m;
        return r;
    }).then(function (res) {
        busy = false;
        if (!res || !res.committed) msg = '들어가지 못했습니다. (가득 찼거나 이미 시작한 방)';
        else msg = '';
        lastInfo = ''; paint();
    }).catch(function () { busy = false; msg = '들어가지 못했습니다.'; lastInfo = ''; paint(); });
}
function leave() {
    const u = me(), d = db_(), id = curId;
    if (!u || !d || !id || busy) return;
    busy = true;
    d.ref(ROOT + '/' + id).transaction(function (r) {
        if (!r || r.state !== 'LOBBY') return;
        const m = r.members || {};
        delete m[u.code];
        const left = Object.keys(m).sort(function (a, b) { return (m[a].at || 0) - (m[b].at || 0); });
        if (!left.length) return null;                       // 아무도 없으면 방을 닫는다
        if (r.leader === u.code) r.leader = left[0];
        r.members = m;
        return r;
    }).then(function () { busy = false; msg = ''; lastInfo = ''; paint(); })
      .catch(function () { busy = false; lastInfo = ''; paint(); });
}

function post(body) {
    return fetch('/api/disaster', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, json: j || {} }; }); })
        .catch(function () { return { status: 0, json: { error: '서버에 닿지 못했습니다.' } }; });
}
function startRun() {
    const u = me(), id = curId;
    if (!u || !id || busy) return;
    busy = true; msg = ''; lastInfo = ''; paint();
    post({ act: 'start', run: id, code: u.code }).then(function (res) {
        busy = false;
        if (res.status !== 200) msg = res.json.error || '시작하지 못했습니다.';
        lastInfo = ''; paint();
    });
}

// ==========================================
// 7. 장면 — 말하기 · 확정 · 시간이 다 되면 넘기기
// ==========================================
function send() {
    const u = me(), d = db_(), r = curId && all[curId];
    const inp = document.getElementById('dz-in');
    if (!u || !d || !r || !inp) return;
    const t = String(inp.value || '').trim().slice(0, 200);
    if (!t) return;
    if (r.state === 'PLAY' && r.phase !== 'TALK') return;
    if (r.state === 'PLAY' && ((r.members || {})[u.code] || {}).st === 'out') return;
    if (r.state !== 'PLAY' && r.state !== 'LOBBY') return;
    inp.value = '';
    d.ref(CHAT + '/' + curId).push({ c: u.code, n: String(u.name || u.code), t: t, at: now(),
                                     r: r.state === 'PLAY' ? (Number(r.round) || 0) : 0 });
    if (r.state === 'PLAY' && !/^\s*[*＊]/.test(t)) foxPoke(r);
}
// 🐾 아기 여우 — 판에 살아 있는 여우가 있으면, 말한 뒤 2.5초쯤 기다렸다가 여우에게 대답을 청한다 (2026-10-20)
//   여럿이 잇달아 말하면 마지막 한 번만 부른다 · 서버가 사이 · 횟수를 따로 막는다
let foxTimer = 0;
function foxAlive(r) {
    const F = r.foxes || {}, m = r.members || {};
    if (Object.keys(F).some(function (id) { const f = F[id]; return f && !f.gone && m[f.on] && !gone(m[f.on].st || 'ok'); })) return true;
    // 🎐 여우 신도 — 곁의 사람이 아직 재난 안에 있으면 (서버가 판을 열 때 r.foxd 에 적는다 · 2026-10-26)
    const D = r.foxd || {};
    return Object.keys(D).some(function (id) { const f = D[id]; return f && m[f.on] && !gone(m[f.on].st || 'ok'); });
}
function foxPoke(r) {
    if (!foxAlive(r)) return;
    const id = curId, u = me(), n = Number(r.round) || 0;
    if (foxTimer) clearTimeout(foxTimer);
    foxTimer = setTimeout(function () {
        foxTimer = 0;
        const rr = all[id];
        if (!u || !rr || rr.state !== 'PLAY' || rr.phase !== 'TALK' || Number(rr.round) !== n) return;
        post({ act: 'fox', run: id, code: u.code, round: n });
    }, 2500);
}
function toggleOut() {
    const u = me(), d = db_(), r = curId && all[curId];
    if (!u || !d || !r || r.state !== 'PLAY' || r.phase !== 'TALK') return;
    const x = (r.members || {})[u.code] || {};
    if (x.role !== 'vip' || gone(x.st) || K(r.kind).noLeave) return;
    const n = Number(r.round) || 0;
    const going = Number(x.leave) === n;
    if (!going) {
        const go = function () { d.ref(ROOT + '/' + curId + '/members/' + u.code + '/leave').set(n); };
        // 게임의 확인창들은 이 창(z-index 99999980) 아래에 뜬다 — 브라우저 확인창을 쓴다
        if (window.confirm('홀로 나가시겠습니까?\n\n이 장면이 끝나면 ' + K(r.kind).place + '을 빠져나갑니다.\n남은 사람들의 난이도가 크게 오릅니다.')) go();
        return;
    }
    d.ref(ROOT + '/' + curId + '/members/' + u.code + '/leave').set(null);
}
function toggleDone() {
    const u = me(), d = db_(), r = curId && all[curId];
    if (!u || !d || !r || r.state !== 'PLAY' || r.phase !== 'TALK') return;
    const n = Number(r.round) || 0;
    const on = Number((r.members[u.code] || {}).done) === n;
    d.ref(ROOT + '/' + curId + '/members/' + u.code + '/done').set(on ? 0 : n);
}

function onTick() {
    if (!ov) return;
    const u = me(), r = curId && all[curId];
    const tm = document.getElementById('dz-timer');
    if (!r || r.state !== 'PLAY' || !r.scene) { if (tm) tm.textContent = ''; return; }
    const t = now(), n = Number(r.round) || 0;
    const left = Math.max(0, Math.ceil(((Number(r.scene.endsAt) || 0) - t) / 1000));
    if (tm) {
        tm.textContent = r.phase === 'TALK' ? (Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0')) : '…';
        tm.classList.toggle('low', r.phase === 'TALK' && left <= 10);
    }
    if (!u || r.phase !== 'TALK' || !r.members[u.code]) return;
    // 넘길 때인가 — 시간이 다 됐거나, 살아 있는 사람이 모두 확정했거나
    const m = r.members;
    const alive = Object.keys(m).filter(function (c) { return !gone(m[c].st || 'ok') && m[c].role !== 'admin'; });
    const allDone = alive.length > 0 && alive.every(function (c) {
        return Number(m[c].done) === n || (m[c].role === 'vip' && !K(r.kind).noLeave && Number(m[c].leave) === n);
    });
    const key = curId + '#' + n;
    if (allDone && !doneSeen[key]) doneSeen[key] = t;
    const dueAt = allDone ? Math.min(doneSeen[key], Number(r.scene.endsAt) || 0) : (Number(r.scene.endsAt) || 0);
    if (t < dueAt) return;
    if (r.leader !== u.code && t < dueAt + GRACE) return;            // 방장이 먼저 — 없으면 4초 뒤 아무나
    if (asked[key] && t < asked[key]) return;
    asked[key] = t + 20000;
    post({ act: 'round', run: curId, code: u.code, round: n }).then(function (res) {
        if (res.status === 425 && res.json.wait) asked[key] = now() + Math.min(20000, res.json.wait + 600);
        else if (res.status === 409 || res.status === 200) { /* 누가 넘겼다 · 넘어갔다 */ }
        else if (res.status && res.status !== 502) { msg = res.json.error || ''; lastInfo = ''; paint(); }
    });
}

// ==========================================
// 8. 상담사 콘솔 — 📡 기록 소실 (열고 닫기)
// ==========================================
const BOX = 'admin-disaster-box';
function paintAdmin() {
    const box = document.getElementById(BOX);
    if (!box) return;
    const h = KIND_LIST.map(function (k) {
        const o = isOpen(k), c = cfg[k] || {};
        const at = c.at ? new Date(c.at) : null;
        return '<div style="display:flex; align-items:center; gap:8px; padding:9px 10px; border:1px solid #24393a; border-radius:7px; background:rgba(255,255,255,.03); margin-bottom:6px;">'
            + '<span style="font-size:12px; color:#bff0f0;">' + kName(k) + '</span>'
            + '<span style="font-size:11px; color:' + (o ? '#9fd8a4' : '#ff9aa8') + ';">' + (o ? '열림' : '닫힘') + '</span>'
            + (at ? '<span style="font-size:9px; color:#667;">' + (at.getMonth() + 1) + '/' + at.getDate() + ' ' + String(at.getHours()).padStart(2, '0') + ':' + String(at.getMinutes()).padStart(2, '0') + '</span>' : '')
            + '<button class="game-btn" style="margin:0 0 0 auto; padding:6px 12px; font-size:11px;" onclick="disasterToggle(\'' + k + '\')">' + (o ? '닫는다' : '연다') + '</button></div>';
    }).join('')
        + '<div style="font-size:10px; color:#888; margin-top:8px; line-height:1.6;">닫혀 있으면 상담사 말고는 못 들어갑니다. 진행 중인 판은 끝까지 갑니다.</div>';
    const body = box.querySelector('.dz-adm');
    if (body && body._h !== h) { body.innerHTML = h; body._h = h; }
}
window.disasterToggle = function (kind) {
    const u = me(), d = db_();
    if (!isAdm(u) || !d || !KINDS_C[kind]) return;
    const o = !!(cfg[kind] && cfg[kind].open);
    d.ref('disasterCfg/' + kind).set({ open: !o, at: Date.now(), by: u.code });
};
function makeAdmin() {
    if (!isAdm(me())) return;
    const scr = document.getElementById('admin-screen');
    if (!scr || document.getElementById(BOX)) return;
    const anchor = scr.querySelector('.action-buttons');
    const html = '<div class="admin-panel-box" id="' + BOX + '" style="border-color:#2f5f60; background-color:#0b1516;">'
        + '<h4 style="color:#9fe3e3;">📡 기록 소실 — 재난</h4><div class="dz-adm"></div></div>';
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html); else scr.insertAdjacentHTML('beforeend', html);
    paintAdmin();
}
(function hookAdmin() {
    const iv = setInterval(function () {
        if (typeof openAdminScreen !== 'function') return;
        if (openAdminScreen._dz) { clearInterval(iv); return; }
        const _o = openAdminScreen;
        const w = function () { const r = _o.apply(this, arguments); setTimeout(makeAdmin, 220); return r; };
        Object.keys(_o).forEach(function (k) { try { w[k] = _o[k]; } catch (e) { } });
        w._dz = true;
        openAdminScreen = w; window.openAdminScreen = w;
        clearInterval(iv);
    }, 500);
    setTimeout(function () { clearInterval(iv); }, 60000);
})();

// ==========================================
// 9. 보상 · 죽음 — 서버가 적어 둔 몫(disasterPay/<사번>/<판>)을 한 번만 받는다
// ==========================================
//   판이 끝나면 서버가 사람마다 몫을 적는다. 그 사람의 화면이 (지금이든 다음에 들어왔을 때든)
//   트랜잭션으로 「받았다」를 박고, 포인트 · 기록 · 이송을 제 기록에 적용한 뒤 지운다.
//   죽음은 어둠에서 죽은 것과 같다 — 오염도 100 · 4시간 · 재난관리국은 선녀탕, 그 밖은 여우 상담실.
let payRef = null, payCode = '';
function payWatch() {
    const u = me(), d = db_();
    const code = (u && u.code) || '';
    if (code === payCode) return;
    if (payRef) { try { payRef.off(); } catch (e) { } payRef = null; }
    payCode = code;
    if (!code || !d) return;
    payRef = d.ref('disasterPay/' + code);
    payRef.on('child_added', function (s) { takePay(s.key, s.val()); });
}
setInterval(payWatch, 2000);
function takePay(run, v) {
    const u = me(), d = db_();
    if (!u || !d || !v || v.claimed) return;
    const path = 'disasterPay/' + u.code + '/' + run;
    const stamp = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    d.ref(path).transaction(function (cur) {
        if (!cur) return cur;                   // 아직 안 읽혔거나 없다 — 서버 값으로 다시 돈다
        if (cur.claimed) return;                // 다른 창이 이미 받았다
        cur.claimed = stamp;
        return cur;
    }).then(function (res) {
        const got = res && res.snapshot && res.snapshot.val ? res.snapshot.val() : null;
        if (!res || !res.committed || !got || got.claimed !== stamp) return;
        try { applyPay(got); } catch (e) { console.warn('[재난] 몫 적용 실패', e); }
        d.ref(path).remove();
    }).catch(function () { });
}
function applyPay(v) {
    const u = me(); if (!u) return;
    const nm = v.name || '기록 소실';
    if (v.die || v.kick) {
        const bath = (typeof isDisasterAgent === 'function') ? isDisasterAgent(u)
            : /재난관리/.test((u.affiliation || '') + ' ' + (u.team || ''));
        u.pollution = 100;
        u.quarantineUntil = Date.now() + 4 * 3600000;
        u.quarantineExitPollution = 40;
        u.foxRoomAnswered = true;            // 질문 절차 생략 (어둠 사망과 같다)
        u.quarantineHospital = true;
        u.quarantineDest = bath ? 'bath' : 'fox';
        const where = bath ? '♨ 선녀탕으로' : '🦊 여우 상담실로';
        try { addHistoryLog(u, (v.kick ? '[재난 — 모셔짐] ' : (v.vanish ? '[재난 실종] ' : '[재난 사망] ')) + nm + ' — ' + (v.how || '돌아오지 못했다') + '. ' + where + (v.kick ? ' 모셔졌습니다.' : ' 이송되었습니다.')); } catch (e) { }
        try { saveFields({ pollution: 1, quarantineUntil: 1, quarantineExitPollution: 1, foxRoomAnswered: 1, quarantineHospital: 1, quarantineDest: 1, history: 1 }); } catch (e) { }
        try { updateUI(); } catch (e) { }
        alert_(nm + '\n\n' + (v.how || '돌아오지 못했다') + '\n\n' + where + (v.kick ? ' 모셔집니다. (4시간)' : ' 이송됩니다. (4시간)'));
        return;
    }
    const pts = Math.max(0, Number(v.pts) || 0);
    if (pts) {
        try { changePoints(pts); } catch (e) { u.points = (Number(u.points) || 0) + pts; try { saveFields({ points: 1 }); } catch (x) { } }
        try { addHistoryLog(u, '[재난 생환] ' + nm + ' — 살아서 돌아왔습니다. (+' + pts.toLocaleString('ko-KR') + ' P)'); saveFields({ history: 1 }); } catch (e) { }
        try { updateUI(); } catch (e) { }
        alert_(nm + '\n\n살아서 돌아왔습니다.\n+' + pts.toLocaleString('ko-KR') + ' P');
    } else if (v.left) {
        try { addHistoryLog(u, '[재난] ' + nm + ' — 홀로 빠져나왔습니다. (보상 없음)'); saveFields({ history: 1 }); } catch (e) { }
    }
}

window.disasterState = function () {
    const r = curId && all[curId];
    console.log('%c===== 📡 재난 =====', 'color:#9fe3e3; font-size:13px');
    console.log('  판:', curId || '없음', '· 상태:', r ? r.state + ' / ' + (r.phase || '') + ' · 장면 ' + (r.round || 0) : '-');
    if (r) console.table(Object.keys(r.members || {}).map(function (c) {
        const x = r.members[c]; return { 사번: c, 이름: x.n, 자리: x.role || '', 상태: x.st || '', 확정: x.done || 0, 나감: x.leave || '', 장비: (x.gear || []).join(', '), 죽음: x.fate || '' };
    }));
    console.log('  내 티켓:', tickets(me()));
};

console.log('[재난] 재난관리국 B2 기록 소실 · ' + KIND_LIST.map(kName).join(' · ') + ' — disasterOpen() · disasterState() · 상담사 disasterToggle(\'wave\' · \'ward\')');

})();
