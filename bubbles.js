// ==========================================
// ★ 말풍선 관리 — 광장 머리 위 말풍선의 빛깔을 고른다
// ==========================================
//
// ■ 무엇인가
//
//   광장에서 말하면 머리 위에 뜨는 말풍선(.plaza-say)은 여태 한 가지
//   빛깔(#f4efe2)뿐이었다. 네 가지를 더 두고 사원증 칸에서 고르게 한다.
//
//       아이보리   #fbf3f1      연노랑   #fffae4
//       하늘       #e6eff4      풀빛     #e9efe5
//
//   테두리는 넷 다 연필로 그은 듯한 잿빛 한 줄(#8c8c88)이고,
//   꼬리에도 같은 줄이 둘러진다.
//
//   빛깔 네 가지는 보여 주신 테마 그림에서 안쪽 색을 집어 와 썼다.
//   (테마에 얹혀 있던 그림 인물은 남의 것이라 가져오지 않았다.)
//
//   말풍선 위에는 **이 게임에 이미 있는 사내 이모티콘**을 하나씩 얹는다.
//   emo/e34·e42·e28·e30 에서 **글씨만 걷어 내고** 작게 줄인 것이다
//   (emo/bub-*.webp). 어느 것에서 떴는지는 아래 SB 의 em 에 적어 두었다.
//
//       아이보리 ← e34 처리하겠습니다   연노랑 ← e42 힘내요~
//       하늘     ← e28 배째여~         풀빛   ← e30 나만 믿어!
//
// ■ 누가 쓰나
//
//   **상담사(kario0987)만** 쓴다 (ONLY_ADMIN = true). 단추도 상담사
//   사원증 칸에만 선다. 전 사원에게 열 때는 false 로만 바꾸면 된다.
//
//   고른 빛깔은 자리 기록의 b 칸에 실려 **같은 방 사람 화면에도** 그대로
//   보인다 — 그 길은 열려 있으니, 상담사가 고른 말풍선은 남들 눈에도
//   그 빛깔로 뜬다.
//
// ■ 어디에 붙나
//
//   사원증 칸(#rec-badge)의 「🖼 테두리 관리」 **오른쪽**에 나란히 선다.
//   frames.js 가 혼자 한 줄을 다 쓰고 있어서, 그 단추를 줄 상자에
//   담고 둘로 나눈다.
//
// ■ 어디에 적히나
//
//   currentUser.sbub 한 칸. 광장에 나갈 때 자리 기록의 b 칸에 실려
//   같은 방 사람에게도 그대로 보인다 (plaza.js 의 sbMine·bubble).

(function speechBubbles() {

const ADMIN = 'kario0987';
// ★ 2026-10-16 — 다시 **상담사만** 쓰도록 닫았다.
//   (10-15 에 전 사원에게 열었다가 되돌렸다)
const ONLY_ADMIN = true;        // false 로 두면 전 사원이 쓴다

// 그림에서 안쪽 빛깔을 집어 와 그대로 쓴다.
//
//   ★ 말풍선 위에 **사내 이모티콘**을 하나씩 얹는다 (emo/ 에 이미 있는 것).
//     글씨만 걷어 내고 쓴다 — 어느 것에서 떴는지는 em 에 적어 둔다.
//     w 는 높이 TOP 일 때의 가로 (그림의 가로세로비 그대로).
const SB = [
    // 아이보리 ← e34 「처리하겠습니다」 분홍 토끼
    { id: 'ivory', n: '아이보리', bg: '#fbf3f1', fg: '#3a3433', em: 'e34', w: 25 },
    // 연노랑 ← e42 「힘내요~」 노랑 고양이
    { id: 'lemon', n: '연노랑',   bg: '#fffae4', fg: '#3c3a2c', em: 'e42', w: 32 },
    // 하늘 ← e28 「배째여~」 늘어진 하양
    { id: 'sky',   n: '하늘',     bg: '#e6eff4', fg: '#2c3338', em: 'e28', w: 39 },
    // 풀빛 ← e30 「나만 믿어!」 식칼 든 갈색머리
    { id: 'grass', n: '풀빛',     bg: '#e9efe5', fg: '#303630', em: 'e30', w: 30 },
];
const LINE = '#8c8c88';         // 연필로 그은 듯한 테두리
const TAIL = 6;                 // 꼬리 크기 (px)
const TOP  = 31;                // 얹는 그림 높이 (px)
const DIP  = 9;                 // 말풍선 윗선에 걸치는 깊이 (px)

// ==========================================
// 모양
// ==========================================
//
//   ✗ border 로 테두리를 두르면 꼬리(:after)가 **테두리 안쪽**에서
//     시작한다 (가로세로 백분율이 안쪽 상자를 기준으로 잡힌다).
//     그러면 말풍선 밑줄이 꼬리를 가로질러 그어져 보인다.
//     그래서 테두리는 box-shadow 로 두르고, 꼬리는 세모 둘을 겹친다 —
//     큰 세모(:before)가 테두리, 그 위에 작은 세모(:after)가 속살.
(function css() {
    if (document.getElementById('sbub-css')) return;
    const L = [];
    SB.forEach(function (s) {
        const k = '.plaza-say.sb-' + s.id;
        L.push(k + '{background:' + s.bg + ';color:' + s.fg + ';'
                 + 'box-shadow:0 0 0 1.6px ' + LINE + ',0 2px 7px rgba(0,0,0,.45);'
                 + 'border-radius:11px;}');
        // 속살 세모 — 테두리 세모 위에 얹힌다
        L.push(k + ':after{margin-left:-' + TAIL + 'px;border-width:' + TAIL + 'px;'
                 + 'border-top-color:' + s.bg + ';}');
        // 위에 얹는 그림 — 말풍선 왼쪽 어깨에 걸터앉는다
        L.push(k + ' .sbi{width:' + s.w + 'px;'
                 + 'background-image:url(emo/bub-' + s.id + '.webp);}');
    });
    // 얹는 자리 — 네 가지가 똑같다
    L.push('.plaza-say .sbi{position:absolute;left:1px;bottom:calc(100% - ' + DIP + 'px);'
         + 'height:' + TOP + 'px;background-repeat:no-repeat;'
         + 'background-position:bottom center;background-size:contain;'
         + 'pointer-events:none;}');
    // 테두리 세모 — 네 빛깔이 똑같아 한 번만 적는다
    L.push('.plaza-say[class*="sb-"]:before{content:"";position:absolute;left:50%;top:100%;'
         + 'margin-left:-' + (TAIL + 2) + 'px;margin-top:-1px;'
         + 'border:' + (TAIL + 2) + 'px solid transparent;border-top-color:' + LINE + ';}');
    const st = document.createElement('style');
    st.id = 'sbub-css';
    st.textContent = L.join('\n');
    document.head.appendChild(st);
})();

// ==========================================
// 고른 것
// ==========================================
function sbById(id) { return SB.find(function (s) { return s.id === id; }) || null; }

// 이 사람이 말풍선을 쓸 수 있나
function sbAllowed(u) { return !ONLY_ADMIN || (!!u && u.code === ADMIN); }

// plaza.js 가 이것을 부른다 — 없는 이름이면 빈 글자(전처럼)
//
// ★ 쓸 수 없는 사원이 **전에 골라 둔 것**은 안 쳐 준다.
//   하루쯤 전 사원에게 열어 두었던 적이 있어, 그때 고른 사람의 sbub 가
//   칸에 남아 있다. 단추를 닫기만 하면 그 사람은 **풀 수도 없이** 그
//   말풍선을 영영 쓰게 된다. 여기서 막으면 제 화면에서도, 남의 화면에서도
//   (자리 기록의 b 는 보내는 쪽이 적는다) 바로 보통 말풍선으로 돌아간다.
window.sbOf = function (u) {
    if (!sbAllowed(u)) return '';
    const id = u && u.sbub;
    return (id && sbById(id)) ? id : '';
};

// ★ 남아 있는 칸도 치운다 — 들어올 때 한 번.
//   화면에서는 위에서 이미 막았고, 이것은 **적힌 값**을 지우는 일이다.
//   ★ 한 번만 보고 그만두면 안 된다 — 사원 칸은 **나중에 서버에서 한 번 더
//     내려온다.** 그때 sbub 가 되살아나므로, 들어온 뒤 한동안 거듭 본다.
(function sweepMine() {
    let left = 15;                                   // 2초마다 열다섯 번 (30초)
    const iv = setInterval(function () {
        if (--left < 0) { clearInterval(iv); return; }
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (!currentUser.sbub || sbAllowed(currentUser)) return;
        currentUser.sbub = null;
        if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
        console.log('[말풍선] 고른 것을 거뒀습니다 (지금은 상담사만 씁니다)');
    }, 2000);
})();

// ★ 한 번에 거두기 — 상담사 전용 (들어오기를 기다리지 않는다)
window.sbubClearAll = function () {
    if (!currentUser || currentUser.code !== ADMIN) { console.warn('상담사만 쓸 수 있습니다.'); return; }
    if (typeof database === 'undefined' || !database) { console.warn('서버에 닿지 못했습니다.'); return; }
    database.ref('users').once('value').then(function (s) {
        const all = s.val() || {};
        const up = {}, who = [];
        Object.keys(all).forEach(function (c) {
            const u = all[c] || {};
            if (!u.sbub) return;
            if (sbAllowed(u)) return;                 // 상담사 것은 둔다
            up['users/' + c + '/sbub'] = null;
            who.push((u.name || c) + ' (' + u.sbub + ')');
        });
        if (!who.length) { console.log('거둘 것이 없습니다.'); return; }
        return database.ref().update(up).then(function () {
            console.log('%c✓ ' + who.length + '명에게서 거뒀습니다: ' + who.join(', '), 'color:#4CAF50');
        });
    }).catch(function (e) { console.error(e); });
};

function sbSet(id) {
    if (!currentUser) return;
    if (id && !sbById(id)) return;
    currentUser.sbub = id || null;
    if (typeof saveSelfFull === 'function') { try { saveSelfFull(); } catch (e) { } }
    openBubblePanel();
}
window.sbSet = sbSet;

// ==========================================
// 관리 화면
// ==========================================
//
//   고르기 전에 **그대로 생긴 것**을 보여 준다. 광장과 같은 갈래 이름을
//   쓰되, 광장 칸이 아니라서 자리 잡는 값만 따로 준다.
function sample(s, on) {
    const cls = s ? ' sb-' + s.id : '';
    const bg = s ? s.bg : '#f4efe2';
    return `<div style="position:relative; height:70px;">
        <div class="plaza-say${cls}" style="position:absolute; left:50%; top:30px; bottom:auto;
             transform:translateX(-50%); margin:0; width:max-content;
             ${s ? '' : 'background:' + bg + ';color:#1a1a1a;'}">
            ${on ? '지금 이걸 쓰는 중' : '안녕하세요'}${s ? '<i class="sbi"></i>' : ''}
        </div>
    </div>`;
}

function openBubblePanel() {
    const cur = (currentUser && currentUser.sbub) || '';
    const row = function (s) {
        const id = s ? s.id : '';
        const on = (cur === id);
        return `<div style="border:1px solid ${on ? '#8a6cb3' : '#3a3a3a'}; border-radius:6px;
                     padding:9px 11px; margin-bottom:7px; background:${on ? 'rgba(106,76,147,.18)' : 'transparent'};">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:12px; color:#fff; font-weight:bold;">${s ? s.n : '기본'}</span>
                <span style="font-size:10px; color:${on ? '#c9a8ff' : '#666'};">${on ? '쓰는 중' : ''}</span>
            </div>
            ${sample(s, on)}
            <button class="game-btn" style="width:100%; margin:4px 0 0 0; padding:7px; font-size:11px;"
                    onclick="sbSet('${id}')" ${on ? 'disabled' : ''}>${on ? '고른 것' : '이걸로 쓴다'}</button>
        </div>`;
    };
    const html = `
        <div style="font-size:11px; color:#aaa; line-height:1.7; margin-bottom:11px;">
            광장에서 말할 때 머리 위에 뜨는 말풍선입니다.<br>
            고른 빛깔은 <b style="color:#c9a8ff;">같은 방 사람에게도</b> 그대로 보입니다.
        </div>
        <div style="max-height:52vh; overflow-y:auto; padding-right:4px;">
            ${[null].concat(SB).map(row).join('')}
        </div>`;
    openGearModal('말풍선', html);
}
window.openBubblePanel = openBubblePanel;

// ==========================================
// 사원증 칸에 단추 — 「테두리 관리」 오른쪽
// ==========================================
(function addBtn() {
    function put() {
        if (!currentUser) return;
        if (ONLY_ADMIN && currentUser.code !== ADMIN) return;
        if (document.getElementById('bub-open-btn')) return;
        const fb = document.getElementById('frame-open-btn');
        if (!fb) return;

        // 테두리 단추가 한 줄을 다 쓰고 있다 — 줄 상자에 담아 둘로 나눈다
        let row = document.getElementById('frame-bub-row');
        if (!row) {
            row = document.createElement('div');
            row.id = 'frame-bub-row';
            row.style.cssText = 'display:flex; gap:6px; margin-top:8px;';
            fb.parentElement.insertBefore(row, fb);
            row.appendChild(fb);
            fb.style.width = 'auto';
            fb.style.flex = '1';
            fb.style.marginTop = '0';
        }
        const b = document.createElement('button');
        b.id = 'bub-open-btn';
        b.className = 'game-btn';
        b.style.cssText = 'flex:1; margin:0; padding:10px;'
            + ' background:linear-gradient(145deg,#4c6a93,#2c4a73) !important;'
            + ' border-color:#6c8ab3 !important; color:#fff !important;';
        b.textContent = '💬 말풍선 관리';
        b.onclick = openBubblePanel;
        row.appendChild(b);
    }
    put();
    [700, 1600, 3000, 5000].forEach(function (t) { setTimeout(put, t); });
    // 사원증 칸을 다시 그릴 때마다 단추가 날아간다 — 그때 또 단다
    ['updateUI', 'renderBadgePhoto'].forEach(function (n) {
        if (typeof window[n] !== 'function') return;
        const _f = window[n];
        window[n] = function () {
            const r = _f.apply(this, arguments);
            setTimeout(put, 60);
            return r;
        };
    });
})();

console.log('[말풍선] ' + SB.length + '종 — ' + (ONLY_ADMIN ? '상담사만' : '전 사원'));

})();
