// ==========================================
// ★ 🌡 지금 기온 — 🦊 호갑투의 여우비가 눈으로 바뀌는가 (foxrain.js)
//   2026-11-15 사용자 「현재 날씨에 따라서 0도 밑으로 내려가면 비 대신 눈이 오는 효과도 가능한가?」 「무료 그거로 하자.」
//
//   Open-Meteo (https://open-meteo.com) 의 공개 날씨 자료에서 서울의 지금 기온 하나만 받아 돌려준다.
//     · 열쇠가 없다 (환경 변수도 쓰지 않는다)
//     · 무료 조건 — 비상업적 이용 · 하루 10,000 번까지 · 자료는 CC BY 4.0 (출처를 적는다 — 광장 목록 맨 아래 · plaza.js)
//     · 여기서 10분 묵힌다 (s-maxage) — 사람이 몇이든 Open-Meteo 에는 10분에 한 번꼴로만 묻는다
//
//   GET → { ok: true, temp: -2.3, at, obs: '2026-11-15T21:30', place: '서울', src }
//         못 받았으면 { ok: false, why } — 화면은 비로 둔다 (1분 묵힌다)
//
//   곳을 바꾸려면 LAT · LON · PLACE 만 고친다 (foxrain.js 의 WX.PLACE 는 콘솔에 보이는 이름일 뿐이다).
// ==========================================
export const config = { maxDuration: 10 };

const PLACE = '서울';
const LAT = 37.5665, LON = 126.978;
const SRC = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT + '&longitude=' + LON
    + '&current=temperature_2m&timezone=Asia%2FSeoul';

export default async function handler(req, res) {
    let timer = null;
    try {
        const ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        if (ctl) timer = setTimeout(function () { try { ctl.abort(); } catch (e) { } }, 6000);
        const r = await fetch(SRC, ctl ? { signal: ctl.signal } : undefined);
        if (!r.ok) throw new Error('날씨 자료 ' + r.status);
        const j = await r.json();
        const cur = (j && j.current) || {};
        // 값이 비어 있으면(null) 0 도로 읽지 않는다 — 못 받은 것이다
        const temp = (typeof cur.temperature_2m === 'number') ? cur.temperature_2m : NaN;
        if (!isFinite(temp)) throw new Error('기온이 없다');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=1800');
        return res.status(200).json({ ok: true, temp: temp, at: Date.now(), obs: cur.time || null, place: PLACE, src: 'Open-Meteo.com (CC BY 4.0)' });
    } catch (e) {
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
        return res.status(200).json({ ok: false, why: String((e && e.message) || e) });
    } finally {
        if (timer) clearTimeout(timer);
    }
}
