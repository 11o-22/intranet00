// ==========================================
// ★ 통째 저장을 통째로 죽이는 것들을 걸러 낸다
//   ① 빈 객체   ② 파이어베이스가 못 받는 열쇠
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
// ■ ② 파이어베이스가 못 받는 열쇠
//
//   열쇠에는 . # $ [ ] / 를 못 쓴다. 하나라도 섞이면 **그 꾸러미가 통째로
//   거절된다** — update 는 전부 되거나 전부 안 되기 때문이다.
//
//       Invalid key in users/…/copyExpire: "[복제품] 은반지"
//
//   복제품 이름에 대괄호가 들어 있어서, 이름을 열쇠로 쓰는 칸(copyExpire ·
//   equipOwner)에 복제품이 한 번 들어가면 그 사원의 저장이 **그 뒤로 계속**
//   실패했다. 복제품이 원본인 채로 남고, 하루가 지나도 안 삭고, 절반이 된
//   효과도 서버에 안 들어가던 까닭이다. (spaceitems.js:29)
//
//   부르는 쪽을 하나하나 고쳐도 또 생긴다. 그러니 길목에서 그 열쇠만 빼고
//   보낸다 — 한 칸을 잃을지언정 저장 전체가 죽지는 않게. 뺀 자리는 콘솔에
//   남으므로 어디서 또 새는지 바로 보인다.
//
// ■ 콘솔
//   emptyNullLog()   빼고 보낸 자리

(function emptyNull() {

const USERNODE = /^users\/[^/]+$/;
const LOG = [];
const KEEP = 40;
let cut = 0;

// 파이어베이스가 못 받는 열쇠
//
//   ★ 「/」는 자리에 따라 다르다. update() 의 **맨 위 열쇠는 어디서나 경로**다.
//
//         database.ref('/').update({ 'users/c1/points': 10 })
//         database.ref('users/c1').update({ 'pets/3': {…} })
//
//     거기서 「/」를 막으면 통째 저장이 통째로 사라진다. 맨 위 한 켜만
//     「/」를 봐주고, 그 아래로는 막는다.
function badKey(k, path) {
    const s = String(k);
    if (/[\x00-\x1f\x7f]/.test(s)) return true;
    return path ? /[.#$\[\]]/.test(s) : /[.#$\[\]\/]/.test(s);
}

// 알맹이 속까지 들어가 못 쓰는 열쇠를 뺀다
function scrub(v, at, gone, path) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(function (x) { return scrub(x, at, gone, false); });
    const out = {};
    Object.keys(v).forEach(function (k) {
        if (badKey(k, path)) { gone.push((at ? at + '/' : '') + k); return; }
        out[k] = scrub(v[k], (at ? at + '/' : '') + k, gone, false);
    });
    return out;
}

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
            let o = strip(obj, p);
            // ② 못 쓰는 열쇠는 빼고 보낸다 — 하나 때문에 전부 죽지 않게
            const gone = [];
            const cleaned = scrub(o, p || '', gone, true);   // 맨 위 한 켜는 경로다
            if (gone.length) {
                cut += gone.length;
                LOG.unshift({ 때: new Date().toLocaleTimeString(), 자리: p || '/',
                              '빼고 보낸 것': gone.slice(0, 6).join(', '), '부른 곳': where() });
                if (LOG.length > KEEP) LOG.pop();
                console.warn('[빈칸] 파이어베이스가 못 받는 열쇠 ' + gone.length
                    + '개를 빼고 보냅니다 — ' + gone.slice(0, 4).join(', ')
                    + '   (. # $ [ ] / 는 열쇠로 쓸 수 없습니다)');
                o = cleaned;
            }
            return _up(o, done);
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
