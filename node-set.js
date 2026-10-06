// ==========================================
// ★ 사원 기록을 통째로 갈아치우는 것을 막는다
// bundles.json 마지막 그룹, save-merge.js 뒤 (맨 끝)
// ==========================================
//
// ■ 소지품이 통째로 사라지는 까닭
//
//   save-merge.js 가 막아 둔 길은 세 가지다.
//
//       saveSelfFull · saveFields · changePoints      내 자리
//       updateUserFields(남)                          남의 자리
//       database.ref('/').update({ 'users/누구/…' })   루트 통째 쓰기
//
//   그런데 **네 번째 길이 남아 있었다.**
//
//       database.ref('users/' + 누구).set(어떤객체)
//
//   set 은 update 와 다르다. **그 객체에 없는 열쇠는 서버에서 지워진다.**
//   그러니까 넘긴 객체에 inventory 가 없거나 짧으면, 그 사원의 소지품은
//   그 자리에서 통째로 사라진다. 그리고 이 길은 가로채지 않았으므로
//   병합도 되지 않았다.
//
//   살아 있는 자리는 여섯 군데다. 전부 **제 화면에 캐시된 남의 객체**
//   (db.users[코드]) 를 그대로 쓴다.
//
//       index.html:8510  VIP 실시간 대전 — 방장이 양쪽을 통째로 쓴다  ← 되풀이된다
//       index.html:8511
//       index.html:10326 당국 개입 · 장비 강제 회수 — 장착자의 주인
//       index.html:10491 건의 처리
//       dark.js:9664     금고 압수
//       dark.js:12154    전용 장비 명칭
//       dark.js:12478    전용 장비 등급
//
//   db.users[코드] 는 child_changed 가 올 때마다 **객체째로 갈린다**
//   (index.html:1386). 그래서 조금만 묵은 참조를 쥐고 있으면 그때 모습이
//   그대로 서버에 박힌다. 늘 같은 사람이 당하는 것은, 늘 같은 사람이
//   그 자리의 「상대」이기 때문이다. (사택 주인 · 대전 상대 · 장비 주인)
//
// ■ 어떻게 막나
//
//   첫째, set 을 update 로 바꾼다. 그러면 **아무 열쇠도 지워지지 않는다.**
//
//   둘째, **소지품·효과·버프는 아예 쓰지 않는다.**
//   위 여섯 자리를 하나하나 보면, 소지품을 바꿀 뜻이 있는 곳은 단 하나다.
//
//       8510 · 8511  대전     → 뜻: points · pollution · history
//       10326        장비회수 → 뜻: inventory · history   ← 이 하나뿐
//       10491        건의     → 뜻: hasNewReply · history
//       9664         금고압수 → 뜻: safeBoxes · history
//       12154        장비명칭 → 뜻: soulGear · history
//       12478        장비등급 → 뜻: soulGear · gearAwakened · history
//
//   나머지 다섯은 소지품을 **딸려 보낼 뿐**이다. 그러니 빼는 것이 옳다.
//   빼면 묵은 꾸러미가 박힐 길이 없어진다. 하나뿐인 10326 은 제자리에서
//   updateUserFields 로 바꿔 두었으므로 돌려주는 물건은 그대로 들어간다.
//
//   셋째, 돈은 save-merge.js 의 길(updateUserFields)로 돌린다. 값이 아니라
//   「움직인 몫」으로 가므로, 그 사이 들어온 돈이 살아남는다.
//
//   내 자리면 넷을 다 빼고, 그 넷은 **내 살아 있는 값**으로 따로 보낸다.
//
//   없는 사원을 만드는 set(새사원) 은 update 로도 똑같이 만들어지므로
//   그대로 둬도 된다.
//
// ■ 누가 그랬는지 적어 둔다
//
//   nodeSetLog()   통째로 쓰려 한 자리 · 부른 곳 · 지워질 뻔한 열쇠
//
//   「지워질 뻔한 열쇠」가 inventory 로 나오면 그 자리가 범인이다.

(function nodeSet() {

const USERNODE = /^users\/([^/]+)$/;
const DROP = ['inventory', 'timedEffects', 'itemBuffs'];   // 통째 쓰기로는 절대 안 보낸다
const LOG = [];
const KEEP = 40;

function where() {
    let s = '';
    try { throw new Error('x'); } catch (e) { s = String(e.stack || ''); }
    return s.split('\n').slice(1)
        .filter(function (l) { return l.indexOf('node-set.js') < 0 && /\S/.test(l); })
        .slice(0, 3)
        .map(function (l) { return l.trim().replace(/^at\s+/, ''); })
        .join('  ←  ') || '(모르겠습니다)';
}

function note(row) { LOG.unshift(row); if (LOG.length > KEEP) LOG.pop(); }

// set 이 지웠을 열쇠를 적어 둔다
function reportLost(c, obj, row, v) {
    try {
        {
            if (!v) return;
            const lost = Object.keys(v).filter(function (k) {
                return !Object.prototype.hasOwnProperty.call(obj, k);
            });
            row['지워질 뻔한 열쇠'] = lost.length ? lost.join(', ') : '없음';
            if (lost.length) {
                console.warn('[통째쓰기] users/' + c + ' — set 이었다면 지워질 열쇠 '
                    + lost.length + '개: ' + lost.join(', ') + '\n  부른 곳: ' + row['부른 곳']);
            }
            const si = Array.isArray(v.inventory) ? v.inventory.length
                : (v.inventory && typeof v.inventory === 'object' ? Object.keys(v.inventory).length : 0);
            const oi = Array.isArray(obj.inventory) ? obj.inventory.length
                : (obj.inventory && typeof obj.inventory === 'object' ? Object.keys(obj.inventory).length : 0);
            row['소지품'] = si + ' → ' + oi;
            if (oi < si) {
                console.warn('[통째쓰기] users/' + c + ' — 넘긴 소지품이 서버보다 '
                    + (si - oi) + '개 적습니다. (' + si + ' → ' + oi + ')'
                    + '\n  부른 곳: ' + row['부른 곳']);
            }
        }
    } catch (e) { }
}

function safeWrite(c, obj, row) {
    const mine = (typeof currentUser !== 'undefined' && currentUser && c === currentUser.code);
    const rest = {};
    const dropped = [];
    Object.keys(obj).forEach(function (k) {
        if (obj[k] === undefined) return;
        // 소지품·효과·버프는 통째 쓰기로 절대 보내지 않는다 (묵은 꾸러미가 박힌다)
        if (DROP.indexOf(k) >= 0) { dropped.push(k); return; }
        // 내 자리면 돈도 빼고 내 살아 있는 값으로 보낸다
        if (mine && k === 'points') { dropped.push(k); return; }
        rest[k] = obj[k];
    });
    if (row) row['빼고 쓴 것'] = dropped.length ? dropped.join(', ') : '없음';

    const jobs = [];
    if (Object.keys(rest).length && typeof updateUserFields === 'function') {
        // 남의 자리면 save-merge 가 points 를 「움직인 몫」으로 바꿔 준다
        jobs.push(updateUserFields(c, rest));
    }
    if (mine && typeof saveFields === 'function') {
        // 내 넷은 살아 있는 값으로 — save-merge 가 더하고 빼기로 보낸다
        try { saveFields({ points: 1, inventory: 1, timedEffects: 1, itemBuffs: 1 }); } catch (e) { }
    }
    return Promise.all(jobs);
}

const iv = setInterval(function () {
    if (typeof database === 'undefined' || !database) return;
    if (database._nodeSet) { clearInterval(iv); return; }
    if (typeof database.ref !== 'function') return;

    const _ref = database.ref.bind(database);
    database.ref = function () {
        const r = _ref.apply(null, arguments);
        const p = String(arguments[0] == null ? '' : arguments[0]).replace(/^\/+|\/+$/g, '');
        const m = USERNODE.exec(p);
        if (!m || !r || typeof r.set !== 'function' || r._nodeSet) return r;

        const c = m[1];
        const _set = r.set.bind(r);
        r.set = function (obj, done) {
            // 객체가 아니면(지우기 등) 손대지 않는다
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return _set(obj, done);

            const row = {
                때: new Date().toLocaleTimeString(), 사원: c,
                열쇠: Object.keys(obj).length + '개',
                '부른 곳': where(), '지워질 뻔한 열쇠': '…',
                '빼고 쓴 것': '…', 소지품: '…'
            };

            // 없는 사원을 만드는 set 은 그대로 둬야 한다. 안 그러면 새 사원의
            // 시작 소지품이 빠진다. (index.html:9441) 그래서 먼저 있는지 본다.
            const job = database.ref('users/' + c).once('value').then(function (s) {
                const cur = s.val();
                if (!cur) {
                    row['빼고 쓴 것'] = '없음 (새 사원 — 통째로 씁니다)';
                    row['지워질 뻔한 열쇠'] = '없음';
                    row.소지품 = '새로';
                    note(row);
                    return _set(obj);
                }
                note(row);
                reportLost(c, obj, row, cur);
                return safeWrite(c, obj, row);
            }).catch(function (e) {
                // 읽지 못하면 안전한 쪽으로 — 통째로 쓰지 않는다
                console.warn('[통째쓰기] users/' + c + ' 를 못 읽어 통째 쓰기를 건너뜁니다:', e && e.message);
                note(row);
                return safeWrite(c, obj, row);
            });

            if (typeof done === 'function') job.then(function () { done(null); },
                                                     function (e) { done(e); });
            return job;
        };
        r._nodeSet = true;
        return r;
    };
    database._nodeSet = true;
    clearInterval(iv);
    console.log('[통째쓰기] users/<사번> 통째 set 을 update 로 바꿉니다. nodeSetLog()');
}, 500);

window.nodeSetLog = function () {
    console.log('%c===== 사원 기록 통째 쓰기 =====', 'color:#ff8f6b; font-size:13px');
    if (!LOG.length) {
        console.log('  아직 없습니다. (이것이 비어 있으면 소지품이 사라진 까닭은 다른 곳입니다)');
        return;
    }
    console.table(LOG);
    console.log('  「지워질 뻔한 열쇠」에 inventory 가 있거나 「소지품」이 줄어들면 그 자리가 범인입니다.');
    console.log('  이제는 set 을 update 로 바꾸므로 지워지지는 않습니다.');
};

console.log('[통째쓰기] nodeSetLog()');

})();
