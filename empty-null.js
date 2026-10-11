// ==========================================
// ★ 빈 객체를 통째 저장에 실어 보내지 않는다
// bundles.json 마지막 묶음, node-set.js 보다 뒤
// ==========================================
//
// ■ 펫이 「입양 전」으로 돌아가던 까닭
//
//   파이어베이스에는 **빈 객체라는 것이 없다.** 어떤 자리에 {} 를 쓰면
//   그 자리는 저장되는 게 아니라 **지워진다.** null 을 쓴 것과 같다.
//
//   그런데 펫 쪽은 읽을 때마다 빈 칸을 만들어 둔다 (pet-data.js petsOf) —
//
//       function petsOf(u) { u.pets = petObj(u.pets); return u.pets; }
//       function petObj(v) { … return (v && typeof v === 'object') ? v : {}; }
//
//   펫 칸을 한 번 그리기만 해도 currentUser.pets 가 {} 로 생긴다.
//   그 다음에 아무 저장이나 한 번 돌면 —
//
//       saveDB · saveSelfFull · updateUserFields
//       → database.ref('users/<사번>').update({ …, pets: {} , … })
//
//   서버의 pets 가 통째로 **지워진다.** 펫이 전부 「입양 전」이 된다.
//   돌봄 주머니(petBag)·먹이(petFood)도 같은 길로 날아간다.
//
//   언제 currentUser.pets 가 비어 있나 — 펫이 생기기 **전에** 띄워 둔 화면이다.
//   휴대폰에서 알을 깨우면 서버에는 펫이 생기지만, 켜 둔 PC 쪽
//   currentUser 는 그것을 모른다 (save-merge 가 켜져 있으면 index.html 의
//   applyMine 이 서버 모습을 덮어쓰지 않는다). 그 PC 에서 아무거나 한 번
//   저장하는 순간 휴대폰에서 깨운 펫이 사라진다.
//   petEggAt 은 글자라서 살아남으므로, 「알은 하루에 하나입니다」까지 겹친다.
//
// ■ 어떻게 막나
//
//   update 는 **지우는 길이 아니다.** 지울 때는 null 을 적는다. 그러니
//   update 꾸러미에 섞여 온 빈 객체는 뜻이 아니라 사고다. 빼고 보낸다.
//
//   빈 **배열**은 건드리지 않는다. 그쪽은 뜻이 있다 —
//   roommate.js 가 house/storage 를 [] 로 비우는 것이 그것이다.
//
//   users/<사번> 쓰기와 루트 통째 쓰기 둘 다 거른다. saveDB · saveSelfFull ·
//   updateUserFields · node-set.js 의 safeWrite 가 전부 이 둘을 지난다.
//
// ■ 콘솔
//   emptyNullLog()   빼고 보낸 자리

(function emptyNull() {

const USERNODE = /^users\/[^/]+$/;
const LOG = [];
const KEEP = 40;
let cut = 0;

function emptyObj(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v)
        && Object.keys(v).length === 0;
}

function where() {
    let s = '';
    try { throw new Error('x'); } catch (e) { s = String(e.stack || ''); }
    return s.split('\n').slice(1)
        .filter(function (l) { return l.indexOf('empty-null.js') < 0 && /\S/.test(l); })
        .slice(0, 2)
        .map(function (l) { return l.trim().replace(/^at\s+/, ''); })
        .join('  ←  ') || '(모르겠습니다)';
}

function strip(obj, at) {
    let gone = null;
    const out = {};
    Object.keys(obj).forEach(function (k) {
        if (emptyObj(obj[k])) { (gone || (gone = [])).push(k); return; }
        out[k] = obj[k];
    });
    if (!gone) return obj;
    cut += gone.length;
    LOG.unshift({ 때: new Date().toLocaleTimeString(), 자리: at || '/',
                  '빼고 보낸 것': gone.join(', '), '부른 곳': where() });
    if (LOG.length > KEEP) LOG.pop();
    console.warn('[빈칸] ' + (at || '/') + ' 에 빈 객체가 실려 있었습니다 — 빼고 보냅니다: '
        + gone.join(', '));
    return out;
}

const iv = setInterval(function () {
    if (typeof database === 'undefined' || !database) return;
    if (database._emptyNull) { clearInterval(iv); return; }
    if (typeof database.ref !== 'function') return;

    const _ref = database.ref.bind(database);
    database.ref = function () {
        const r = _ref.apply(null, arguments);
        const p = String(arguments[0] == null ? '' : arguments[0]).replace(/^\/+|\/+$/g, '');
        if (!r || typeof r.update !== 'function' || r._emptyNull) return r;
        if (p !== '' && !USERNODE.test(p)) return r;        // 깊은 자리는 뜻이 있는 쓰기다

        const _up = r.update.bind(r);
        r.update = function (obj, done) {
            if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return _up(obj, done);
            return _up(strip(obj, p), done);
        };
        r._emptyNull = true;
        return r;
    };
    database._emptyNull = true;
    clearInterval(iv);
    console.log('[빈칸] 통째 저장에서 빈 객체를 빼 둡니다 — emptyNullLog()');
}, 300);
setTimeout(function () { clearInterval(iv); }, 40000);

window.emptyNullLog = function () {
    console.log('%c===== 빼고 보낸 빈 칸 =====', 'color:#9fd0ff; font-size:13px');
    console.log('  모두 ' + cut + '번');
    if (!LOG.length) { console.log('  아직 없습니다.'); return; }
    console.table(LOG);
};

})();
