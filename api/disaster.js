// ==========================================
// ★ 재난 — 진행자(Claude) 부르는 서버 함수
//   실제 일은 _disaster/core.js 가 한다. 키(ANTHROPIC_API_KEY)는 Vercel 환경 변수에만 있다.
// ==========================================
import { handle } from './_disaster/core.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 만 받습니다.' });
    // 게임 화면에서 온 요청만 (다른 사이트에서 부르는 것을 막는다)
    const from = String(req.headers.origin || req.headers.referer || '');
    if (!/^https:\/\/intranet00[-a-z0-9]*\.vercel\.app/.test(from) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(from)) {
        return res.status(403).json({ error: '게임 화면에서만 부를 수 있습니다.' });
    }
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const out = await handle(body || {}, { fetch: fetch, key: process.env.ANTHROPIC_API_KEY });
    return res.status(out.status).json(out.json);
}
