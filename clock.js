// ==========================================
// ★ 날짜를 기기 시계가 아니라 서버 시계로 센다
// bundles.json 마지막 묶음 (날짜 함수만 갈아 끼우므로 자리는 가리지 않는다)
// ==========================================
//
// ■ 무엇이 안 됐나
//
//   휴대폰으로 하다가 PC 로 가면 **공용시설 이용 횟수가 리셋되고,
//   유쾌 판매소도 리셋되던** 까닭이다.
//
//   하루가 바뀌었는지는 이 둘로 판단한다 (index.html:1264, 1273).
//
//       getTodayStr()         자정 기준  — 공용시설·식사·치료 …
//       get22HourCycleStr()   밤 10시 기준 — 유쾌 판매소
//
//   둘 다 `new Date()` 와 `getFullYear()/getHours()` 를 쓴다. 곧
//   **그 기기의 시계와 시간대** 그대로다. 기기마다 시간대가 다르거나
//   시계가 몇 분 어긋나 있으면, 기기를 옮기는 것만으로 날짜 글자가
//   달라진다. 그러면 —
//
//     · dailyRollover() 가 로그인하자마자 돌면서 (index.html:5637,
//       들어온 직후에는 60초 제한도 건너뛴다) facilityCount = 0 을
//       써 버린다. 이 칸은 save-merge 의 보호 밖이라 그대로 서버를 덮는다.
//     · 유쾌 판매소는 purchaseRecord[주기열쇠] 에 산 횟수를 적는데
//       (index.html:7785) 열쇠가 갈리면 0 으로 보인다. 진열 목록까지
//       그 열쇠로 뽑으므로 (index.html:4761) 물건도 통째로 바뀐다.
//
// ■ 어떻게 고쳤나
//
//   파이어베이스가 알려 주는 **서버와 내 시계의 차이**(.info/serverTimeOffset)
//   를 받아 두고, 거기에 **한국 시각(+9시간)을 고정으로** 더해서 날짜를
//   센다. 기기의 시간대는 아예 보지 않는다 — 어느 기기에서 봐도 같다.
//
//   roommate.js:75 가 이미 같은 수를 쓰고 있다. 거기 주석도 똑같이
//   「기기의 시계와 시간대를 보면 안 된다」고 적어 두었다. 그 방식을
//   날짜 함수 전체로 넓힌 것이다.
//
//   시계가 서기 전에는 **하루 넘김을 멈춰 둔다.** 안 그러면 들어오자마자
//   기기 시계로 리셋을 써 버린다. 서버가 안 잡히면 8초 뒤 기기 시계로
//   물러난다 — 그래도 게임이 멎지는 않게.
//
// ■ 콘솔
//   clockState()   서버와 내 시계가 얼마나 어긋나 있나

(function corpClock() {

const KST = 9 * 3600 * 1000;
const WAIT = 8000;              // 서버 시계를 이만큼 기다린다
let skew = 0;
let got = false;                // 서버에서 받았나
let gaveUp = false;             // 기다리다 물러났나
const bootAt = Date.now();

function ready() { return got || gaveUp; }
window.clockReady = ready;

// 서버 기준 지금
function srvNow() { return Date.now() + skew; }
window.serverNow = srvNow;

// 한국 시각으로 본 달력 조각 — 기기 시간대를 안 본다
function kstParts(ms) {
    const d = new Date((ms == null ? srvNow() : ms) + KST);
    return {
        y: d.getUTCFullYear(),
        m: d.getUTCMonth() + 1,
        d: d.getUTCDate(),
        h: d.getUTCHours()
    };
}
function pad(n) { return String(n).padStart(2, '0'); }

function todayStr() {
    const p = kstParts();
    return p.y + '-' + pad(p.m) + '-' + pad(p.d);
}
function cycleStr() {
    // 밤 10시 전이면 아직 「어제」로 친다 — 원래 셈 그대로
    let ms = srvNow();
    if (kstParts(ms).h < 22) ms -= 24 * 3600 * 1000;
    const p = kstParts(ms);
    return p.y + '-' + pad(p.m) + '-' + pad(p.d) + '-22h';
}

// ==========================================
// 서버 시계 받기
// ==========================================
(function listen() {
    const iv = setInterval(function () {
        if (typeof database === 'undefined' || !database) return;
        clearInterval(iv);
        try {
            database.ref('.info/serverTimeOffset').on('value', function (s) {
                const v = Number(s.val());
                if (!isFinite(v)) return;
                const was = skew;
                skew = v;
                if (!got) {
                    got = true;
                    const off = Math.round(v / 1000);
                    console.log('[시계] 서버와 ' + (off >= 0 ? '+' : '') + off + '초 차이 — 날짜를 서버 기준으로 셉니다');
                    if (Math.abs(v) > 120000) {
                        console.warn('[시계] 이 기기의 시계가 서버와 '
                            + Math.round(Math.abs(v) / 60000) + '분 어긋나 있습니다.');
                    }
                } else if (Math.abs(v - was) > 5000) {
                    console.log('[시계] 차이가 바뀌었습니다 — ' + Math.round(v / 1000) + '초');
                }
            });
        } catch (e) { }
    }, 200);
    setTimeout(function () { clearInterval(iv); }, 20000);
})();

setTimeout(function () {
    if (got) return;
    gaveUp = true;
    console.warn('[시계] 서버 시계를 못 받았습니다 — 이 기기 시계로 셉니다');
}, WAIT);

// ==========================================
// 날짜 함수 갈아 끼우기
// ==========================================
(function swap() {
    const iv = setInterval(function () {
        if (typeof getTodayStr !== 'function') return;
        if (getTodayStr._srv) { clearInterval(iv); return; }
        const _t = getTodayStr;
        const _c = (typeof get22HourCycleStr === 'function') ? get22HourCycleStr : null;

        const t = function () {
            // 서버 시계를 못 받은 동안에는 전처럼 기기 시계로
            if (!got) return _t.apply(this, arguments);
            return todayStr();
        };
        t._srv = true;
        getTodayStr = t;
        window.getTodayStr = t;

        if (_c) {
            const c = function () {
                if (!got) return _c.apply(this, arguments);
                return cycleStr();
            };
            c._srv = true;
            get22HourCycleStr = c;
            window.get22HourCycleStr = c;
        }
        clearInterval(iv);
        console.log('[시계] 날짜 셈을 서버 기준으로 바꿨습니다');
    }, 200);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 하루 넘김은 시계가 선 뒤에
// ==========================================
//
//   dailyRollover() 는 들어온 직후 바로 한 번 돈다 (60초 제한을 건너뛴다).
//   그때 시계가 아직 안 서 있으면 기기 시계로 facilityCount = 0 을 써 버리고,
//   그 0 이 그대로 서버를 덮는다. 시계가 설 때까지만 멈춰 둔다.
(function gate() {
    const iv = setInterval(function () {
        if (typeof dailyRollover !== 'function') return;
        if (dailyRollover._srv) { clearInterval(iv); return; }
        const _d = dailyRollover;
        const w = function () {
            if (!ready()) return false;         // 아직 — 다음 바퀴에 다시 본다
            return _d.apply(this, arguments);
        };
        w._srv = true;
        dailyRollover = w;
        window.dailyRollover = w;
        clearInterval(iv);
        console.log('[시계] 하루 넘김을 시계 뒤로 미뤘습니다');
    }, 200);
    setTimeout(function () { clearInterval(iv); }, 30000);
})();

// ==========================================
// 확인
// ==========================================
window.clockState = function () {
    console.log('%c===== 시계 =====', 'color:#9fd8ef; font-size:13px');
    console.log('  서버 시계   :', got ? '받음' : (gaveUp ? '못 받음 (기기 시계로 셈)' : '기다리는 중'));
    console.log('  차이        :', Math.round(skew / 1000) + '초',
        Math.abs(skew) > 60000 ? '← 이 기기 시계가 많이 어긋나 있습니다' : '');
    console.log('  이 기기 시각:', new Date().toLocaleString(), '· 시간대',
        Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('  서버 기준   :', new Date(srvNow()).toLocaleString());
    console.log('  오늘(한국)  :', todayStr());
    console.log('  판매소 주기 :', cycleStr());
    console.log('  갈아 끼움   :',
        (typeof getTodayStr === 'function' && getTodayStr._srv) ? '날짜 O' : '날짜 ✗',
        (typeof get22HourCycleStr === 'function' && get22HourCycleStr._srv) ? '· 주기 O' : '· 주기 ✗',
        (typeof dailyRollover === 'function' && dailyRollover._srv) ? '· 하루 넘김 O' : '· 하루 넘김 ✗');
    console.log('  띄운 지     :', Math.round((Date.now() - bootAt) / 1000) + '초');
};

console.log('[시계] clockState()');

})();
