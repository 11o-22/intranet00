// ==========================================
// ★ 서비스 워커 — 앱처럼 쓰기 위한 것
// 뿌리(/sw.js)에 두어야 한다. 고치면 build.mjs 가 BUILD 를 다시 찍는다.
// ==========================================
//
// ■ 무엇을 하나
//
//   1. 홈 화면에서 열었을 때 **주소창 없이** 뜨게 한다 (manifest 가 한다)
//   2. 한 번 받은 것을 들고 있다가, 서버가 느리거나 안 될 때 그것으로 연다
//
// ■ 묵은 것을 내보내지 않는다 — 여기가 제일 중요하다
//
//   이 게임은 묶음 파일 여덟 개가 **서로 맞물려** 돈다. 하나만 묵어도
//   「조용히 안 되는」 고장이 난다. 오늘 하루에만 그런 종류를 여러 번
//   겪었다. 그래서 캐시를 **먼저** 쓰지 않는다.
//
//       네트워크 먼저 · 3초 안에 안 오면 그때 들고 있던 것
//
//   잘 터지는 자리에서는 늘 새것을 받고, 안 터지는 자리에서는 바로 열린다.
//   빠르기를 조금 내주고 「묵은 것 때문에 고장」을 없앴다.
//
//   그리고 BUILD 가 바뀌면(= 새로 올릴 때마다) 들고 있던 것을 통째로
//   버린다. build.mjs 가 묶음을 만들 때 아래 숫자를 다시 찍는다.
//
// ■ 건드리지 않는 것
//   파이어베이스·구글 등 **다른 곳으로 가는 요청**은 손대지 않는다.
//   받아 오기(GET)가 아닌 것도 손대지 않는다.

const BUILD = '20261011003409';
const CACHE = 'corp-' + BUILD;
const TIMEOUT = 3000;

// 처음에 챙겨 둘 것 — 없어도 그만이라 실패해도 넘어간다
const SHELL = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './icons/icon-192.png',
    './icons/apple-touch-icon.png',
    './b/01.js', './b/02.js', './b/03.js', './b/04.js',
    './b/05.js', './b/06.js', './b/07.js', './b/08.js'
];

self.addEventListener('install', function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return Promise.all(SHELL.map(function (u) {
                return c.add(new Request(u, { cache: 'reload' })).catch(function () { });
            }));
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                if (k !== CACHE) return caches.delete(k);      // 묵은 꾸러미는 버린다
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('message', function (e) {
    if (e.data === 'skipWaiting') self.skipWaiting();
});

function fresh(req) {
    return new Promise(function (resolve, reject) {
        let done = false;
        const t = setTimeout(function () { if (!done) { done = true; reject(new Error('늦다')); } }, TIMEOUT);
        fetch(req).then(function (res) {
            if (done) return;
            done = true; clearTimeout(t); resolve(res);
        }).catch(function (err) {
            if (done) return;
            done = true; clearTimeout(t); reject(err);
        });
    });
}

self.addEventListener('fetch', function (e) {
    const req = e.request;
    if (req.method !== 'GET') return;

    let url;
    try { url = new URL(req.url); } catch (err) { return; }
    if (url.origin !== self.location.origin) return;          // 남의 집 것은 손대지 않는다
    if (url.pathname.indexOf('/api/') === 0) return;          // 서버 쪽 길도 손대지 않는다

    // 이모티콘 그림은 들고 있던 것을 먼저 준다.
    //   묶음 파일과 달리 서로 맞물리지 않고, 꾸러미 이름에 BUILD 가 들어 있어
    //   새로 올리면 어차피 통째로 버려진다. 그러니 묵을 걱정이 없다.
    //   이모티콘 칸을 열 때 서른아홉 장을 매번 다시 받지 않게 해 준다.
    if (url.pathname.indexOf('/emo/') >= 0) {
        e.respondWith(
            caches.match(req, { ignoreSearch: true }).then(function (hit) {
                if (hit) return hit;
                return fetch(req).then(function (res) {
                    if (res && res.ok && res.type === 'basic') {
                        const copy = res.clone();
                        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () { });
                    }
                    return res;
                });
            })
        );
        return;
    }

    e.respondWith(
        fresh(req).then(function (res) {
            if (res && res.ok && res.type === 'basic') {
                const copy = res.clone();
                caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () { });
            }
            return res;
        }).catch(function () {
            return caches.match(req, { ignoreSearch: true }).then(function (hit) {
                if (hit) return hit;
                // 화면을 띄우는 길이면 들고 있던 첫 장이라도 준다
                if (req.mode === 'navigate') return caches.match('./index.html');
                return new Response('', { status: 504, statusText: '서버에 닿지 못했습니다' });
            });
        })
    );
});
