// ==========================================
// ★ 피날레 — ??? 상점 물건 두 가지
// bundles.json 마지막 묶음 — finale-bq.js 다음
// ==========================================
//
//   「내일의 일정표」  감화도 −15. 한 탐사에 한 번. (너무 쉬워지지 않게 — 겨우 버틸 만큼만)
//   「동행 신청서」    다음 NPC 영입 판정 한 번에 +1. (NPC 판정에 붙는 유일한 보정)
//
//   둘 다 「제■■■회 완벽한 피날레」 안에서만 쓴다. 들어갈 때 반입해서 🎒 로 쓴다.

(function finaleItems() {
'use strict';
if (typeof ITEM_CATALOG === 'undefined') return;

const FIN_ITEMS = {
    '내일의 일정표': {
        price: 2500, effect: 'fin_calm',
        desc: '[???] 내일 날짜가 적힌 빈 일정표. 아직 적어 넣을 칸이 남아 있다는 사실이 떠오른다. 사용 즉시 감화도가 15 내려간다. 제■■■회 완벽한 피날레(Qtrew-S-018) 탐사 중 한 번만.'
    },
    '동행 신청서': {
        price: 1500, effect: 'fin_npc',
        desc: '[???] 피날레교단 접수처의 낡은 양식. 「함께 퇴장할 분」 칸이 비어 있다. 다음 NPC 영입 판정 한 번에 +1. 제■■■회 완벽한 피날레(Qtrew-S-018) 탐사 중에만.'
    }
};
Object.keys(FIN_ITEMS).forEach(function (n) {
    const it = FIN_ITEMS[n];
    ITEM_CATALOG[n] = { price: it.price, usable: true, targetable: false, effect: it.effect, qShop: true, desc: it.desc };
});

function alertMsg(m) { try { showCustomAlert(m); } catch (e) { console.log(m); } }

(function hook() {
    const iv = setInterval(function () {
        if (typeof useInventoryItem !== 'function') return;
        clearInterval(iv);
        const _use = useInventoryItem;
        const w = function (itemName) {
            const cat = ITEM_CATALOG[itemName];
            if (!cat || (cat.effect !== 'fin_calm' && cat.effect !== 'fin_npc')) return _use.apply(this, arguments);
            if (typeof isQuarantined === 'function' && isQuarantined(currentUser)) { alertMsg('격리 중에는 소지품을 사용할 수 없습니다.'); return; }
            const X = window.FINX;
            const F = X && X.F && X.F();
            if (typeof darkRun === 'undefined' || !darkRun || !X || darkRun.zone !== X.CODE || !F || F.st !== 'in') {
                alertMsg('제■■■회 완벽한 피날레(Qtrew-S-018) 탐사 중에만 쓸 수 있습니다.');
                return;
            }
            if (!((currentUser.inventory || []).indexOf(itemName) >= 0)) return;

            if (cat.effect === 'fin_calm') {
                if (F.calmUsed) { alertMsg('이번 탐사에서는 이미 일정표를 펼쳐 보았습니다.\n같은 내일을 두 번 떠올릴 수는 없습니다.'); return; }
                if (!(F.gam > 0)) { alertMsg('지금은 펼쳐 볼 필요가 없습니다. (감화도 0)'); return; }
                F.calmUsed = 1;
                const d = X.gam(-15, '내일의 일정표');
                removeItemFromInventory(currentUser, itemName, 1);
                try { addHistoryLog(currentUser, '[??? 사용] ' + itemName); } catch (e) { }
                try { saveSelfFull(); } catch (e) { }
                X.save();
                X.view({ keep: true });
                alertMsg('일정표의 빈칸을 바라봅니다.\n내일 해야 할 일이 하나둘 떠오릅니다.\n\n감화도 ' + d + ' → ' + F.gam + ' / 100');
                return;
            }
            // fin_npc
            if (F.npcPlus) { alertMsg('이미 신청서를 적어 두었습니다.\n다음 NPC 영입 판정에 쓰입니다.'); return; }
            F.npcPlus = 1;
            removeItemFromInventory(currentUser, itemName, 1);
            try { addHistoryLog(currentUser, '[??? 사용] ' + itemName); } catch (e) { }
            try { saveSelfFull(); } catch (e) { }
            X.save();
            X.view({ keep: true });
            alertMsg('신청서의 빈칸을 채웠습니다.\n다음 NPC 영입 판정 한 번에 +1.');
        };
        useInventoryItem = w;
        try { window.useInventoryItem = w; } catch (e) { }
    }, 60);
})();

console.log('[피날레] ??? 물건 두 가지 연결');
})();
