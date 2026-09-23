// ==========================================
// ★ 익명 편지 보관함
// index.html 에서 invcat.js 다음에 불러온다
// ==========================================

// 받은 편지(letters)는 3장까지만 남고 밀려난다.
// 보관(kept)으로 옮긴 편지는 무제한으로 남는다.

function keptLetters() {
    if (!currentUser.keptLetters) currentUser.keptLetters = [];
    return currentUser.keptLetters;
}

function keepLetter(idx) {
    if (!currentUser.letters || !currentUser.letters[idx]) return;
    const l = currentUser.letters[idx];
    const kept = keptLetters();

    if (kept.some(k => k.id === l.id)) { showCustomAlert('이미 보관 중인 편지입니다.'); return; }

    kept.unshift(Object.assign({}, l, { keptAt: Date.now() }));
    currentUser.letters.splice(idx, 1);
    saveFields({ letters: 1, keptLetters: 1 });
    renderLetters();
    renderKeptLetters();
    showCustomAlert('보관함으로 옮겼습니다.');
}

function unkeepLetter(idx) {
    const kept = keptLetters();
    if (!kept[idx]) return;
    if (!confirm('보관함에서 지웁니다.\n되돌릴 수 없습니다.\n\n지울까요?')) return;
    kept.splice(idx, 1);
    saveFields({ keptLetters: 1 });
    renderKeptLetters();
}

function toggleKeptBox() {
    if (!currentUser) return;
    currentUser.keptOpen = !currentUser.keptOpen;
    saveFields({ keptOpen: 1 });
    renderKeptLetters();
}

function renderKeptLetters() {
    const box = document.getElementById('kept-letters-box');
    if (!box || !currentUser) return;

    const kept = keptLetters();
    const open = !!currentUser.keptOpen;

    box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;
            padding:8px 11px; border-radius:5px; background:rgba(0,0,0,0.3);
            border:1px solid var(--theme-border); border-left:3px solid var(--theme-focus); margin-bottom:8px;"
            onclick="toggleKeptBox()">
            <span style="font-size:12px; color:var(--theme-focus); font-weight:bold;">
                🗃 보관함
                <span style="font-size:10px; color:#888; font-weight:normal; margin-left:5px;">${kept.length}장</span>
            </span>
            <span style="font-size:10px; color:#888;">${open ? '▼' : '▲'}</span>
        </div>
        <div style="${open ? '' : 'display:none;'}">
            ${kept.length === 0
                ? `<div style="font-size:11px; color:#666; padding:10px 0; text-align:center;">보관한 편지가 없습니다.</div>`
                : kept.map((l, i) => `
                    <div class="letter-card" style="position:relative;">
                        <div class="letter-meta">발신인: [익명] | ${l.date}</div>
                        <div class="letter-body">${l.content}</div>
                        <button onclick="unkeepLetter(${i})" style="position:absolute; top:8px; right:8px; background:transparent; border:none; color:#888; cursor:pointer; font-size:10px; font-weight:bold;">지움</button>
                    </div>`).join('')}
        </div>`;
}

// --- 기존 함수에 연결 ---
(function hookLetters() {
    const _renderLetters = renderLetters;
    renderLetters = function () {
        const r = _renderLetters.apply(this, arguments);

        // 받은 편지마다 [보관] 버튼을 붙인다
        const box = document.getElementById('received-letters-container');
        if (box && currentUser && (currentUser.letters || []).length > 0) {
            Array.from(box.querySelectorAll('.letter-card')).forEach((el, i) => {
                if (el.querySelector('.keep-btn')) return;
                el.insertAdjacentHTML('beforeend',
                    `<button class="keep-btn" onclick="keepLetter(${i})" style="position:absolute; top:8px; right:44px; background:transparent; border:none; color:var(--theme-focus); cursor:pointer; font-size:10px; font-weight:bold;">보관</button>`);
            });
        }

        // 보관함 영역이 없으면 만든다
        if (!document.getElementById('kept-letters-box')) {
            const panel = document.getElementById('rec-letters');
            if (panel) {
                panel.insertAdjacentHTML('beforeend',
                    `<div style="margin-top:14px; border-top:1px dashed #333; padding-top:12px;">
                        <div id="kept-letters-box"></div>
                     </div>`);
            }
        }
        renderKeptLetters();
        return r;
    };
})();