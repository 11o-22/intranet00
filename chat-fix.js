// ==========================================
// 어둠 파티 채팅이 간헐적으로 안 되던 것
//
// ── 무슨 일이었나 ──
// 파티 채팅 묶음(pchat-log / pchat-input / pchat-head …)은 **두 곳**에서
// 똑같은 id 로 그려진다.
//   ㄱ. 로비 — renderPartyRoom() 안의 buildChatHtml('normal')  → #dark-party
//   ㄴ. 탐사 화면 — mountDarkChat()                            → #dro-chat
// mountDarkChat 은 "구성이 그대로면 다시 그리지 않는다" 를 판단할 때
// document.getElementById('pchat-log') 를 봤다. 그런데 오버레이를 닫을 때
// 비우는 것은 innerHTML 뿐이고 #dro-chat 의 dataset.chatKey 는 그대로 남았다.
// 그래서 **두 번째 탐사부터는**
//     열쇠가 같다(normal|0|0|0) + pchat-log 도 있다(로비 것)
// 가 되어 탐사 화면 채팅칸을 아예 안 그리고 그냥 돌아섰다.
// → 어둠 안에 채팅이 통째로 안 보인다. 쪽을 새로 열면 멀쩡해진다.
//   = 「몇몇 사원이 어둠 들어갈 때마다 간헐적으로 채팅이 안 된다」
//
// 그 두 줄은 index.html 에서 고쳤다(칸 안에서만 찾고, 닫을 때 열쇠도 버린다).
// 이 파일은 같은 증상을 낼 수 있는 나머지 구멍을 메운다.
//   ㄱ. 파티 탐사 중인데 채팅칸이 비어 있으면 어떤 길로 비었든 다시 붙인다
//   ㄴ. 듣는 귀가 엉뚱한 방에 붙어 있으면 바로잡는다
//   ㄷ. 보낸 말이 안 나갔으면 알려 준다 (여태 조용히 삼켰다)
//   ㄹ. 한 사람 연결이 깜빡인 사이에 남이 방·대화를 지워 버리던 것
//   ㅁ. chatState() — 안 될 때 상태를 바로 읽는다
// ==========================================

(function () {
    'use strict';

    function slot() { return document.getElementById('dro-chat'); }

    function overlayUp() {
        const ov = document.getElementById('dark-run-overlay');
        return !!(ov && ov.style.display !== 'none');
    }

    function inParty() {
        return !!(typeof darkRun !== 'undefined' && darkRun && darkRun.isParty);
    }

    function roomId() {
        if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId) return darkRun.partyId;
        if (typeof myPartyId !== 'undefined' && myPartyId) return myPartyId;
        return null;
    }

    function tell(msg) {
        try {
            if (overlayUp() && typeof showDarkToast === 'function') { showDarkToast(msg); return; }
        } catch (e) { }
        try { if (typeof showCustomAlert === 'function') { showCustomAlert(msg); return; } } catch (e) { }
        console.warn('[채팅] ' + msg);
    }

    // ------------------------------------------------------------------
    // 마지막으로 어떤 모양으로 붙였는지 적어 둔다.
    // 다시 붙일 때 늘 'normal' 로 되돌리면, 입을 막아 둔 대목(muted)이나
    // 정해진 말만 고르는 대목(words)에서 입력칸이 되살아나 버린다.
    // ------------------------------------------------------------------
    let lastArgs = ['normal'];
    const ivM = setInterval(function () {
        if (typeof mountDarkChat !== 'function') return;
        if (mountDarkChat._remember) { clearInterval(ivM); return; }
        const realMount = mountDarkChat;
        window.mountDarkChat = function (mode, words, wordsLeft, muted) {
            lastArgs = [mode, words, wordsLeft, muted];
            return realMount.apply(this, arguments);
        };
        window.mountDarkChat._remember = true;
        clearInterval(ivM);
    }, 500);

    function remount() {
        const s = slot();
        if (s) delete s.dataset.chatKey;
        if (typeof mountDarkChat === 'function') mountDarkChat.apply(null, lastArgs);
        const rid = roomId();
        if (rid && typeof attachChatListener === 'function') attachChatListener(rid);
    }

    // ------------------------------------------------------------------
    // ㄱㄴ. 채팅칸 지킴이 — 2 초마다 살펴서 비어 있으면 다시 붙인다
    // ------------------------------------------------------------------
    let lastFix = 0;
    window.chatFixCount = 0;

    setInterval(function () {
        if (!inParty() || !overlayUp()) return;
        const s = slot();
        if (!s) return;

        const rid = roomId();
        let why = '';
        if (!s.querySelector('[id="pchat-log"]')) why = '채팅칸이 비어 있었습니다';
        else if (rid && typeof chatListenerId !== 'undefined' && chatListenerId && chatListenerId !== rid)
            why = '듣는 귀가 다른 방(' + chatListenerId + ')에 붙어 있었습니다';
        else if (rid && typeof chatListenerId !== 'undefined' && !chatListenerId)
            why = '듣는 귀가 안 붙어 있었습니다';
        if (!why) return;

        if (Date.now() - lastFix < 4000) return;   // 연달아 흔들지 않는다
        lastFix = Date.now();
        try {
            remount();                             // 묵은 열쇠를 버리고 같은 모양으로 다시
            window.chatFixCount++;
            console.log('[채팅] 다시 붙였습니다 — ' + why);
        } catch (e) {
            console.error('[채팅] 다시 붙이지 못했습니다:', e);
        }
    }, 2000);

    // ------------------------------------------------------------------
    // ㄷ. 보낸 말이 안 나가면 알려 준다
    // ------------------------------------------------------------------
    const iv = setInterval(function () {
        if (typeof sendPartyChat !== 'function') return;
        if (sendPartyChat._loud) { clearInterval(iv); return; }

        const real = sendPartyChat;
        window.sendPartyChat = function (text, isSystem) {
            const rid = roomId();
            if (!rid || typeof database === 'undefined' || !database) {
                console.warn('[채팅] 방 번호가 없어 보내지 못했습니다.',
                    { partyId: (typeof darkRun !== 'undefined' && darkRun) ? darkRun.partyId : null,
                      myPartyId: (typeof myPartyId !== 'undefined') ? myPartyId : null });
                if (!isSystem) tell('말을 보내지 못했습니다. 파티 방을 찾지 못했습니다.');
                return;
            }

            // 방 번호가 비어 있던 자리를 메워 둔다 (다음 번엔 본 흐름이 알아서 찾는다)
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.isParty && !darkRun.partyId) {
                darkRun.partyId = rid;
            }

            let ret;
            try {
                ret = real(text, isSystem);
            } catch (e) {
                console.error('[채팅] 보내다 걸렸습니다:', e);
                if (!isSystem) tell('말을 보내지 못했습니다.');
                return;
            }

            // 내가 한 말이 되돌아오는지 본다 (듣는 귀가 죽어 있으면 안 돌아온다)
            const msg = String(text || '').trim();
            if (isSystem || !msg || msg.length > 200) return;
            const mine = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.code : null;
            setTimeout(function () {
                const log = (typeof partyChatLog !== 'undefined' && partyChatLog) ? partyChatLog : [];
                const back = log.some(function (m) { return m && m.text === msg && m.code === mine; });
                if (back) return;
                console.warn('[채팅] 보낸 말이 돌아오지 않았습니다:', msg,
                    '· 듣는 방 ' + ((typeof chatListenerId !== 'undefined') ? chatListenerId : '?'));
                tell('말이 전달되지 않은 것 같습니다. 연결을 확인해 주세요.');
            }, 4000);

            return ret;
        };
        window.sendPartyChat._loud = true;
        clearInterval(iv);
        console.log('[채팅] 보내기 실패를 알려 주도록 고쳤습니다.');
    }, 500);

    // ------------------------------------------------------------------
    // ㄹ. 남이 아직 안에 있는데 방과 대화를 지워 버리던 것
    //
    //   partyRunCleanup 은 alive 가 비었으면 방·대화·투표를 통째로 지웠다.
    //   그런데 alive 는 onDisconnect().remove() 로 서버가 지운다. 쪽을 덮어 둔
    //   손전화는 연결이 끊긴 것으로 보이기 쉽다. 그 틈에 먼저 나온 사람이
    //   darkChats/<방> 을 지워 버리면 안에 있던 사람의 대화가 통째로 빈다.
    //   → alive 가 비었어도 members 까지 빈 뒤에야 지운다.
    //     (members 는 각자 나올 때 스스로 지우므로 깜빡임에 지워지지 않는다)
    //   억지로 쪽을 닫고 다시 안 들어온 사람 때문에 방이 남는 것은
    //   아래 ㅁ 의 쓸개가 5 분 뒤에 치운다.
    // ------------------------------------------------------------------
    const iv2 = setInterval(function () {
        if (typeof partyRunCleanup !== 'function') return;
        if (partyRunCleanup._safe) { clearInterval(iv2); return; }

        window.partyRunCleanup = function (pid, zone) {
            if (typeof database === 'undefined' || !database || !pid) return;
            if (typeof currentUser === 'undefined' || !currentUser) return;
            const me = currentUser.code;
            const aliveRef = database.ref('darkParties/' + pid + '/alive/' + me);
            try { aliveRef.onDisconnect().cancel(); } catch (e) { }

            database.ref('darkParties/' + pid + '/members/' + me).remove();

            aliveRef.remove()
                .then(function () { return database.ref('darkParties/' + pid).once('value'); })
                .then(function (snap) {
                    const p = snap.val() || {};
                    const aliveLeft = Object.keys(p.alive || {}).length;
                    const memLeft = Object.keys(p.members || {}).length;
                    if (aliveLeft > 0 || memLeft > 0) {
                        // 아직 누군가 안에 있다. 구역 점유만 내 몫으로 두고 둔다.
                        console.log('[파티] 방을 두고 나왔습니다 — 살아있음 ' + aliveLeft
                            + '명 · 명단 ' + memLeft + '명');
                        return;
                    }
                    database.ref('darkParties/' + pid).remove();
                    database.ref('darkChats/' + pid).remove();
                    database.ref('darkVotes/' + pid).remove();
                    database.ref('darkC119/' + pid).remove();
                    if (zone) database.ref('darkOccupancy/' + zone).remove();
                })
                .catch(function (e) { console.error('[파티] 정리 실패:', e); });
        };
        window.partyRunCleanup._safe = true;
        clearInterval(iv2);
        console.log('[파티] 방 정리를 안전하게 고쳤습니다.');
    }, 500);

    // ------------------------------------------------------------------
    // ㅁ. 아무도 안 남은 탐사 방 치우기 (5 분 넘게 빈 채로 있으면)
    // ------------------------------------------------------------------
    const emptySince = {};
    const STRAND = 5 * 60 * 1000;

    setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        if (typeof currentUser === 'undefined' || !currentUser) return;
        if (typeof darkParties === 'undefined' || !darkParties) return;

        const now = Date.now();
        Object.keys(darkParties).forEach(function (pid) {
            const p = darkParties[pid];
            if (!p || p.state !== 'RUNNING') { delete emptySince[pid]; return; }
            if (typeof myPartyId !== 'undefined' && myPartyId === pid) { delete emptySince[pid]; return; }
            if (typeof darkRun !== 'undefined' && darkRun && darkRun.partyId === pid) { delete emptySince[pid]; return; }

            const aliveLeft = Object.keys(p.alive || {}).length;
            if (aliveLeft > 0) { delete emptySince[pid]; return; }

            if (!emptySince[pid]) { emptySince[pid] = now; return; }
            if (now - emptySince[pid] < STRAND) return;

            delete emptySince[pid];
            console.log('[파티] 아무도 없는 방을 치웠습니다:', pid);
            database.ref('darkParties/' + pid).remove();
            database.ref('darkChats/' + pid).remove();
            database.ref('darkVotes/' + pid).remove();
            database.ref('darkC119/' + pid).remove();
            if (p.zone) database.ref('darkOccupancy/' + p.zone).remove();
        });
    }, 60000);

    // ------------------------------------------------------------------
    // ㅂ. 콘솔 — 안 될 때 이걸 찍어서 보내 주면 된다
    // ------------------------------------------------------------------
    window.chatState = function () {
        const s = slot();
        const rid = roomId();
        const inSlot = s ? !!s.querySelector('[id="pchat-log"]') : false;
        const dup = document.querySelectorAll('[id="pchat-log"]').length;

        console.log('%c── 파티 채팅 상태 ──', 'color:#7fd4d4; font-weight:bold');
        console.log('  탐사 중:', (typeof darkRun !== 'undefined' && darkRun) ? '예' : '아니오',
            '· 파티:', inParty() ? '예' : '아니오');
        console.log('  탐사 화면 열림:', overlayUp() ? '예' : '아니오');
        console.log('  방 번호: darkRun.partyId =',
            (typeof darkRun !== 'undefined' && darkRun) ? (darkRun.partyId || '없음') : '-',
            '· myPartyId =', (typeof myPartyId !== 'undefined' ? (myPartyId || '없음') : '-'),
            '→ 쓰는 것:', rid || '없음');
        console.log('  듣는 귀:', (typeof chatListenerId !== 'undefined' ? (chatListenerId || '안 붙음') : '-'),
            (rid && typeof chatListenerId !== 'undefined' && chatListenerId !== rid) ? '  ← 엉뚱한 방!' : '');
        console.log('  어둠 쪽 채팅칸:', inSlot ? '있음' : '없음',
            '· 열쇠:', (s && s.dataset.chatKey) || '없음',
            '· 쪽 전체 pchat-log 수:', dup);
        console.log('  받아 둔 말:', (typeof partyChatLog !== 'undefined' ? partyChatLog.length : '-') + '개',
            '· 안 읽음:', (typeof partyChatUnread !== 'undefined' ? partyChatUnread : '-'),
            '· 펼침:', (typeof partyChatOpen !== 'undefined' ? (partyChatOpen ? '예' : '아니오') : '-'));
        console.log('  지킴이가 고친 횟수:', window.chatFixCount);

        if (inParty() && overlayUp() && !inSlot) {
            console.log('%c  → 채팅칸이 없습니다. chatRemount() 를 쳐 보세요.', 'color:#ff6b6b');
        } else if (rid && typeof chatListenerId !== 'undefined' && chatListenerId !== rid) {
            console.log('%c  → 듣는 방이 다릅니다. chatRemount() 를 쳐 보세요.', 'color:#ff6b6b');
        } else if (inParty() && overlayUp()) {
            console.log('%c  → 멀쩡합니다.', 'color:#4CAF50');
        }

        return {
            party: inParty(), overlay: overlayUp(), room: rid,
            listener: (typeof chatListenerId !== 'undefined') ? chatListenerId : null,
            box: inSlot, key: (s && s.dataset.chatKey) || null, dupLogs: dup,
            msgs: (typeof partyChatLog !== 'undefined') ? partyChatLog.length : null,
            fixes: window.chatFixCount
        };
    };

    window.chatRemount = function () {
        remount();
        console.log('[채팅] 다시 붙였습니다.');
        return window.chatState();
    };

    console.log('[채팅] 어둠 채팅 지킴이 올라왔습니다. (chatState / chatRemount)');
})();
