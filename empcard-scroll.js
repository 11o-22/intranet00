// ==========================================
// ★ 사원 기록 카드 — 길어지면 스크롤
// index.html 에서 wine-fix.js 다음에 불러온다
// ==========================================
//
// 특이사항이 길면 카드가 화면을 넘어가서
// 아래에 붙는 임신·돌봄 버튼이 안 보인다.
// 카드 속을 스크롤되게 만든다.

(function fixEmpDetailScroll() {
    const CSS = `
#emp-detail-modal .modal-content {
    max-height: 85vh !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 20px 20px 16px 20px !important;
}
#emp-detail-modal .modal-content > h3 { flex-shrink: 0; }
#emp-detail-modal .modal-btn-group { flex-shrink: 0; margin-top: 14px !important; }

#emp-detail-card-container {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-right: 6px;
    margin-right: -4px;
}

/* 스크롤이 더 있다는 표시 */
#emp-detail-card-container::-webkit-scrollbar { width: 5px; }
#emp-detail-card-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
#emp-detail-card-container::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }

/* 특이사항 칸이 혼자 너무 길어지지 않게 */
#emp-detail-card-container .badge-table td { max-height: 160px; overflow-y: auto; }
`;
    const st = document.createElement('style');
    st.id = 'emp-detail-scroll-fix';
    st.textContent = CSS;
    document.head.appendChild(st);

    // 열릴 때 맨 위로 돌려놓는다
    if (typeof openEmpDetailModal === 'function') {
        const _o = openEmpDetailModal;
        openEmpDetailModal = function () {
            const r = _o.apply(this, arguments);
            setTimeout(function () {
                const box = document.getElementById('emp-detail-card-container');
                if (box) box.scrollTop = 0;
            }, 80);
            return r;
        };
    }

    // 임신 버튼이 붙고 나면 거기까지 보이게 한 번 알려 준다
    if (typeof addPregBtn === 'function') {
        const _a = addPregBtn;
        addPregBtn = function () {
            const r = _a.apply(this, arguments);
            setTimeout(function () {
                const box = document.getElementById('emp-detail-card-container');
                const btn = document.getElementById('preg-btn-box');
                if (!box || !btn) return;
                if (box.scrollHeight <= box.clientHeight) return;   // 스크롤 없으면 그만

                if (document.getElementById('preg-scroll-hint')) return;
                btn.insertAdjacentHTML('beforebegin',
                    `<div id="preg-scroll-hint" style="text-align:center; font-size:10px; color:#888; margin-top:10px;">▾ 아래에 더 있습니다</div>`);
            }, 120);
            return r;
        };
    }

    console.log('[사원 카드] 스크롤 보정 적용');
})();