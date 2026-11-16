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
//   「조용히 안 되는」 고장이 난다. 그래서 화면 · 불러오기 파일은 캐시를 **먼저** 쓰지 않는다.
//
// ■ ★ 데이터를 덜 먹게 (2026-11-16 사용자 「데이터를 너무 많이 먹어서 덜 먹게 최적화좀 하자. 전체적으로.」)
//
//   ✗ 전에는 — 새로 올릴 때마다(하루 수십 번)
//       · 설치하면서 묶음 여덟 개(압축해도 5 MB 남짓)를 「캐시 무시(reload)」로 **전부** 다시 받았고
//       · 들고 있던 것을 통째로 버려, 소리(리듬 게임 곡 · 효과음) · 이모티콘도 다음에 쓸 때 **처음부터** 다시 받았다
//       · 그림(옷장 · 광장 그림)은 열 때마다 하나하나 서버에 다시 물었다
//
//   ✓ 이제는 꾸러미를 셋으로 나눈다
//       CODE  (판마다)   화면 · 불러오기(b/01.js ~ 08.js) — 늘 서버에 먼저 묻는다(바뀌었으면 받고 · 아니면 304) · 안 될 때만 들고 있던 것
//       IMM   (영영)     덩어리 b/c/NN-지문.js — 이름에 내용의 지문이 있어 안 바뀐다 · 들고 있으면 묻지도 않는다
//                        이번 판 목록(CHUNKS)에 없는 묵은 덩어리는 새 판이 깔릴 때 지운다
//       MEDIA (영영)     그림 · 소리 · 채보 — 판(BUILD)마다 **한 번만** 서버에 「바뀌었나」를 묻는다 (ETag · 안 바뀌면 304 로 몇 바이트)
//                        같은 판 안에서는 묻지 않고 들고 있던 것을 준다 · 바뀌었으면 새것으로 바꿔 넣는다
//   설치할 때 받는 것도 작은 것들(화면 · 아이콘)만, 브라우저 캐시를 거쳐(다시 묻기만) 받는다.
//
// ■ 건드리지 않는 것
//   파이어베이스·구글 등 **다른 곳으로 가는 요청**은 손대지 않는다.
//   받아 오기(GET)가 아닌 것도 손대지 않는다. /api/ 도.

const BUILD = '20261012134805';
const CACHE = 'corp-' + BUILD;
const IMM = 'corp-imm-v1';
const MEDIA = 'corp-media-v1';
const CHUNKS = [];
const TIMEOUT = 3000;

// 처음에 챙겨 둘 것 — 없어도 그만이라 실패해도 넘어간다 (작은 것만 · 브라우저 캐시를 거쳐)
const SHELL = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './icons/icon-192.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return Promise.all(SHELL.map(function (u) {
                return c.add(new Request(u)).catch(function () { });
            }));
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) {
                if (k !== CACHE && k !== IMM && k !== MEDIA) return caches.delete(k);      // 묵은 꾸러미는 버린다
            }));
        }).then(function () {
            // 이번 판 목록에 없는 덩어리는 지운다 (목록이 비었으면 — 빌드가 안 찍었으면 — 건드리지 않는다)
            if (!CHUNKS.length) return;
            const want = {};
            CHUNKS.forEach(function (u) { want[new URL(u, self.location.href).pathname] = 1; });
            return caches.open(IMM).then(function (c) {
                return c.keys().then(function (reqs) {
                    return Promise.all(reqs.map(function (r) {
                        try { if (!want[new URL(r.url).pathname]) return c.delete(r); } catch (err) { }
                    }));
                });
            });
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
function within(p, ms, fallback) {
    return new Promise(function (resolve) {
        let done = false;
        const t = setTimeout(function () { if (!done) { done = true; resolve(fallback); } }, ms);
        p.then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
               function () { if (!done) { done = true; clearTimeout(t); resolve(fallback); } });
    });
}

// 그림 · 소리 · 채보인가
const MEDIA_DIR = /^\/(snd|emo|dot|dot2|rhythm|plaza|icons|ico|house|pet|doll|kroom)\//;
const MEDIA_EXT = /\.(png|jpe?g|gif|webp|svg|mp3|ogg|wav|m4a|aac|woff2?|ttf|otf)$/i;
function isMedia(url) {
    const p = url.pathname;
    if (/\.(js|mjs|html|css)$/i.test(p) || /\/(manifest|build)\.json$/.test(p)) return false;
    return MEDIA_EXT.test(p) || (MEDIA_DIR.test(p) && /\.json$/i.test(p));
}

// 판 번호를 붙여 넣는다 — 같은 판이면 다시 묻지 않는다 (몸통은 들고 있던 것 그대로)
function stamp(res) {
    return res.blob().then(function (b) {
        const h = new Headers(res.headers);
        h.set('x-sw-build', BUILD);
        return new Response(b, { status: res.status, statusText: res.statusText, headers: h });
    });
}
function keep(cacheName, req, res) {
    if (!res || res.status !== 200 || res.type !== 'basic') return;
    caches.open(cacheName).then(function (c) {
        return (cacheName === MEDIA ? stamp(res) : Promise.resolve(res)).then(function (r) { return c.put(req, r); });
    }).catch(function () { });
}
// 들고 있던 것이 지난 판 것 — 「바뀌었나」만 묻는다
function recheck(req, hit) {
    const h = {};
    const et = hit.headers.get('etag'), lm = hit.headers.get('last-modified');
    if (et) h['If-None-Match'] = et;
    if (lm) h['If-Modified-Since'] = lm;
    return fetch(req.url, { headers: h, cache: 'no-store', credentials: 'same-origin' }).then(function (res) {
        if (res.status === 304) { keep(MEDIA, req, hit.clone()); return hit; }      // 그대로 — 이번 판 표만 다시 붙인다
        if (res.status === 200) { keep(MEDIA, req, res.clone()); return res; }       // 바뀌었다 — 새것
        return hit;
    });
}
function media(req) {
    return caches.open(MEDIA).then(function (c) {
        return c.match(req).then(function (hit) {
            if (hit && hit.headers.get('x-sw-build') === BUILD) return hit;           // 이 판에서 이미 물어본 것
            if (hit) return within(recheck(req, hit), TIMEOUT, hit);                   // 새 판 — 한 번 묻는다 (늦으면 들고 있던 것)
            return fetch(req).then(function (res) { keep(MEDIA, req, res.clone()); return res; });
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

    // 덩어리 — 이름에 지문이 있다 · 들고 있으면 묻지 않는다
    if (url.pathname.indexOf('/b/c/') === 0) {
        e.respondWith(caches.open(IMM).then(function (c) {
            return c.match(req).then(function (hit) {
                if (hit) return hit;
                return fetch(req).then(function (res) { keep(IMM, req, res.clone()); return res; });
            });
        }).catch(function () { return fetch(req); }));
        return;
    }

    // 그림 · 소리 · 채보 — 판마다 한 번만 묻는다
    //   소리를 조각(Range)으로 달라는 것도 들고 있던 통째를 준다 (전과 같다 — 로딩 소리가 그 순간 있어야 한다)
    if (isMedia(url)) {
        e.respondWith(media(req).catch(function () {
            return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req); });
        }));
        return;
    }

    // ★ 화면 · 불러오기 파일 · 번호(build.json)는 **늦어도 새것**을 기다린다 (2026-10-26)
    //   네트워크가 아예 안 될 때만 들고 있던 것을 준다. (브라우저 캐시가 있으면 304 로 몇 바이트만 오간다)
    const code = req.mode === 'navigate' || url.pathname.indexOf('/b/') >= 0
        || /\/(index\.html|style\.css)?$/.test(url.pathname);
    e.respondWith(
        (code ? fetch(req) : fresh(req)).then(function (res) {
            keep(CACHE, req, res.clone());
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
