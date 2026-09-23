// ==========================================
// ★ 어둠 탐사 관전
// index.html 에서 letterbox.js 다음에 불러온다
// ==========================================
//
// 파티 방에서 방장이 관전을 켜면, 탐사 중인 파티가 목록에 뜬다.
// 관전자는 본문·판정·채팅을 전부 볼 수 있고 채팅에 끼어들 수 있다.
// 다만 선택지 버튼은 누를 수 없다.

let spectateId = null;       // 지금 보고 있는 파티
let spectateRef = null;
let spectateChatRef = null;
let spectateData = null;
let spectateChat = [];

// --- 방장: 관전 허용 토글 ---
function toggleSpectate() {
    const p = getMyParty();
    if (!p || !database) return;
    if (p.leader !== currentUser.code) { showCustomAlert('방장만 바꿀 수 있습니다.'); return; }
    database.ref(`darkParties/${p.id}/openView`).set(!p.openView);
}

// --- 탐사 중인 파티가 화면을 서버에 올린다 ---
function pushSpectateView(html, title) {
    if (!darkRun || !darkRun.isParty || !database) return;
    const p = darkParties[darkRun.partyId];
    if (!p || !p.openView) return;
    if (!darkRun.isLeader) return;              // 방장 화면만 중계한다

    database.ref(`darkViews/${darkRun.partyId}`).set({
        zone: darkRun.zone,
        zoneName: (DARK_ZONES[darkRun.zone] || {}).name || '',
        step: darkRun.step,
        title: title || '',
        html: String(html || '').slice(0, 20000),
        leaderName: p.leaderName || '',
        at: Date.now()
    });
}

function clearSpectateView(pid) {
    if (!database || !pid) return;
    database.ref('darkViews/' + pid).remove();
}

// --- 관전 목록 ---
function renderSpectateList() {
    const box = document.getElementById('spectate-list');
    if (!box || !currentUser) return;

    const list = Object.values(darkParties).filter(p =>
        p && p.state === 'RUNNING' && p.openView &&
        !(p.members && p.members[currentUser.code])
    );

    if (list.length === 0) {
        box.innerHTML = `<div style="font-size:11px; color:#666; text-align:center; padding:18px 0;">공개된 탐사가 없습니다.</div>`;
        return;
    }

    box.innerHTML = list.map(p => {
        const z = DARK_ZONES[p.zone] || {};
        const alive = p.alive ? Object.keys(p.alive).length : 0;
        const names = p.members ? Object.values(p.members).map(m => m.name).join(', ') : '';
        return `
            <div style="background:rgba(0,0,0,0.35); border:1px solid var(--theme-border); border-radius:6px; padding:12px; margin-bottom:9px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-family:monospace; font-size:10px; color:#ff6b6b; font-weight:bold;">${z.code || p.zone}</div>
                        <div style="font-size:13px; font-weight:bold; color:var(--theme-text); margin:3px 0;">${z.name || ''}</div>
                        <div style="font-size:10px; color:#999;">선임 <b>${p.leaderName}</b> · 생존 ${alive}명</div>
                        <div style="font-size:9px; color:#666; margin-top:3px;">${names}</div>
                    </div>
                    <button class="game-btn" style="margin:0; padding:8px 12px; font-size:11px; flex-shrink:0;" onclick="startSpectate('${p.id}')">관전</button>
                </div>
            </div>`;
    }).join('');
}

// --- 관전 시작 ---
function startSpectate(pid) {
    if (darkRun) { showCustomAlert('탐사 중에는 관전할 수 없습니다.'); return; }
    if (!database) return;

    spectateId = pid;
    const ov = document.getElementById('spectate-overlay');
    if (ov) ov.style.display = 'flex';

    if (spectateRef) { try { spectateRef.off(); } catch (e) {} }
    spectateRef = database.ref('darkViews/' + pid);
    spectateRef.on('value', snap => {
        spectateData = snap.val();
        renderSpectateView();
    });

    if (spectateChatRef) { try { spectateChatRef.off(); } catch (e) {} }
    spectateChatRef = database.ref('darkChats/' + pid);
    spectateChatRef.on('value', snap => {
        const v = snap.val();
        spectateChat = v ? Object.values(v).sort((a, b) => a.at - b.at) : [];
        renderSpectateChat();
    });
}

function stopSpectate() {
    if (spectateRef) { try { spectateRef.off(); } catch (e) {} }
    if (spectateChatRef) { try { spectateChatRef.off(); } catch (e) {} }
    spectateRef = null; spectateChatRef = null;
    spectateId = null; spectateData = null; spectateChat = [];
    const ov = document.getElementById('spectate-overlay');
    if (ov) ov.style.display = 'none';
    renderSpectateList();
}

function renderSpectateView() {
    const head = document.getElementById('spec-code');
    const body = document.getElementById('spec-body');
    if (!body) return;

    if (!spectateData) {
        if (head) head.innerText = '연결 중...';
        body.innerHTML = `<div style="text-align:center; font-size:12px; color:#888; padding:40px 0;">화면을 받아오는 중입니다.<br><span style="font-size:10px;">선임의 화면이 바뀌면 여기에 나타납니다.</span></div>`;
        return;
    }

    if (head) head.innerText = `${spectateData.zone} · ${spectateData.leaderName}`;

    // 버튼은 눌리지 않게 잠근다
    const safe = String(spectateData.html || '')
        .replace(/onclick="[^"]*"/g, '')
        .replace(/ontouchstart="[^"]*"/g, '')
        .replace(/<button/g, '<button disabled');

    body.innerHTML = safe;
    body.scrollTop = 0;
}

function renderSpectateChat() {
    const log = document.getElementById('spec-chat-log');
    if (!log) return;

    if (spectateChat.length === 0) {
        log.innerHTML = `<div style="color:#666; font-size:11px; text-align:center; padding:14px 0;">아직 대화가 없습니다.</div>`;
        return;
    }
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 50;
    log.innerHTML = spectateChat.map(m => {
        const t = new Date(m.at);
        const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
        if (m.code === 'SYSTEM') {
            return `<div style="color:#888; font-style:italic; font-size:10px; margin-bottom:5px; text-align:center;">— ${m.text} <span style="color:#555;">${ts}</span></div>`;
        }
        const mine = m.code === currentUser.code;
        return `<div style="margin-bottom:5px; font-size:11px; line-height:1.6; ${mine ? 'text-align:right;' : ''}">
            <span style="color:${m.spec ? '#7fd4d4' : 'var(--theme-focus)'}; font-weight:bold;">${m.spec ? '👁 ' : ''}${m.name}</span>
            <span style="color:#ddd;">${m.text}</span>
            <span style="color:#555; font-size:9px; margin-left:4px;">${ts}</span>
        </div>`;
    }).join('');
    if (atBottom) log.scrollTop = log.scrollHeight;
}

function sendSpectateChat() {
    const input = document.getElementById('spec-chat-input');
    if (!input || !spectateId || !database) return;
    const text = input.value.trim();
    if (!text || text.length > 200) return;

    database.ref('darkChats/' + spectateId).push({
        code: currentUser.code,
        name: currentUser.name,
        text: text,
        spec: true,
        at: Date.now()
    });
    input.value = '';
}

// --- 화면 만들기 ---
function buildSpectateUI() {
    if (document.getElementById('spectate-overlay')) return;
    document.body.insertAdjacentHTML('beforeend', `
        <div id="spectate-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100dvh; background:#000; z-index:9999997; justify-content:center; align-items:flex-start; overflow:hidden;">
            <div style="width:100%; max-width:450px; height:100dvh; display:flex; flex-direction:column; background:#0a0a0a; box-shadow:0 0 60px rgba(127,212,212,0.15);">
                <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; padding:11px 14px; border-bottom:1px solid #2a2a2a; background:#0d0d0d;">
                    <div style="font-family:monospace; font-size:11px; color:#7fd4d4; font-weight:bold;" id="spec-code">관전</div>
                    <div style="display:flex; gap:7px; align-items:center;">
                        <span style="font-size:10px; color:#666;">👁 관전 중</span>
                        <button onclick="stopSpectate()" style="background:none; border:1px solid #333; color:#888; font-size:11px; padding:4px 10px; border-radius:4px; cursor:pointer;">나간다</button>
                    </div>
                </div>
                <div id="spec-body" style="flex:1; overflow-y:auto; padding:14px; -webkit-overflow-scrolling:touch; min-height:0; opacity:0.92;"></div>
                <div style="flex-shrink:0; border-top:1px solid #2a2a2a; background:#0d0d0d;">
                    <div id="spec-chat-log" style="height:26dvh; overflow-y:auto; padding:10px 12px; -webkit-overflow-scrolling:touch;"></div>
                    <div style="display:flex; gap:6px; padding:8px 10px; border-top:1px solid #1a1a1a;">
                        <input type="text" id="spec-chat-input" maxlength="200" placeholder="한마디 거든다..." style="flex:1; font-size:12px; padding:9px;" onkeypress="if(event.key==='Enter') sendSpectateChat()">
                        <button class="game-btn" style="margin:0; padding:9px 16px; font-size:11px; flex-shrink:0;" onclick="sendSpectateChat()">전송</button>
                    </div>
                </div>
            </div>
        </div>`);
}

// --- 기존 함수에 연결 ---
(function hookSpectate() {
    buildSpectateUI();

    // 탐사 화면이 바뀔 때마다 중계
    const _darkBox = darkBox;
    darkBox = function (title, text, extra, imgKey) {
        const html = _darkBox.apply(this, arguments);
        try { pushSpectateView(html, title); } catch (e) {}
        return html;
    };

    // 탐사가 끝나면 중계도 끝낸다
    const _finishDarkRun = finishDarkRun;
    finishDarkRun = function () {
        const pid = darkRun ? darkRun.partyId : null;
        const r = _finishDarkRun.apply(this, arguments);
        if (pid) clearSpectateView(pid);
        return r;
    };

    const _finishDarkDeath = finishDarkDeath;
    finishDarkDeath = function () {
        const pid = darkRun ? darkRun.partyId : null;
        const wasLeader = darkRun ? darkRun.isLeader : false;
        const r = _finishDarkDeath.apply(this, arguments);
        if (pid && wasLeader) clearSpectateView(pid);
        return r;
    };

    // 파티 방에 관전 스위치, 탐사 탭에 관전 목록
    const _renderPartyRoom = renderPartyRoom;
    renderPartyRoom = function (p, body) {
        const r = _renderPartyRoom.apply(this, arguments);
        const isLeader = p.leader === currentUser.code;
        const on = !!p.openView;
        const chat = body.querySelector('.pchat-wrap');
        const html = `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid ${on ? '#2a4a5a' : '#333'}; border-radius:6px; padding:10px 12px; margin-top:10px;">
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:${on ? '#7fd4d4' : '#888'}; font-weight:bold;">👁 관전 ${on ? '허용' : '차단'}</div>
                    <div style="font-size:9px; color:#666; margin-top:3px;">켜면 다른 사원이 이 탐사를 볼 수 있습니다.</div>
                </div>
                ${isLeader
                    ? `<button class="game-btn" style="margin:0; padding:7px 12px; font-size:10px; flex-shrink:0;" onclick="toggleSpectate()">${on ? '끄기' : '켜기'}</button>`
                    : `<span style="font-size:9px; color:#666; flex-shrink:0;">방장만 변경</span>`}
            </div>`;
        if (chat) chat.insertAdjacentHTML('beforebegin', html);
        else body.insertAdjacentHTML('beforeend', html);
        return r;
    };

    const _renderDarkness = renderDarkness;
    renderDarkness = function () {
        const r = _renderDarkness.apply(this, arguments);
        const body = document.getElementById('darkness-body');
        if (body && !darkRun && !document.getElementById('spectate-list')) {
            body.insertAdjacentHTML('beforeend', `
                <div style="margin-top:16px; border-top:1px dashed #333; padding-top:12px; text-align:left;">
                    <div style="font-size:11px; color:#7fd4d4; font-weight:bold; margin-bottom:8px;">👁 공개된 탐사</div>
                    <div id="spectate-list"></div>
                </div>`);
            renderSpectateList();
        } else if (document.getElementById('spectate-list')) {
            renderSpectateList();
        }
        return r;
    };
})();