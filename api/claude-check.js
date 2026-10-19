// ★ 임시 — ANTHROPIC_API_KEY 가 제대로 들어갔는지 확인한다 (확인이 끝나면 지운다)
//   키 자체는 절대 내보내지 않는다. 있는지 · 통하는지 · 크레딧으로 한 번 불러지는지만 알려 준다.
//   ① 모델 목록 (돈이 안 드는 호출)   ② 아주 짧은 메시지 한 번 (Haiku, 거의 0원)
export default async function handler(req, res) {
    const key = process.env.ANTHROPIC_API_KEY || '';
    const out = {
        키_있음: !!key,
        키_모양: key ? (key.startsWith('sk-ant-') ? '정상 (sk-ant- 로 시작)' : '이상함 — 앞뒤 공백이나 다른 값이 들어갔을 수 있음') : '없음',
        앞뒤_공백: key ? key !== key.trim() : false
    };
    if (!key) {
        out.결론 = '키가 이 배포에 안 들어와 있습니다. 저장 뒤 Redeploy 를 했는지 봐 주세요.';
        return res.status(200).json(out);
    }
    const head = {
        'Authorization': `Bearer ${key.trim()}`,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
    };
    try {
        const m = await fetch('https://api.anthropic.com/v1/models?limit=100', { headers: head });
        const mj = await m.json().catch(() => ({}));
        const ids = (mj.data || []).map(x => x.id);
        out.모델목록 = m.ok
            ? { 상태: m.status, sonnet_5_5: ids.includes('claude-sonnet-5-5'), haiku_5_5: ids.includes('claude-haiku-5-5'), 개수: ids.length }
            : { 상태: m.status, 오류: (mj.error && (mj.error.type + ' — ' + mj.error.message)) || '알 수 없음' };
    } catch (e) {
        out.모델목록 = { 오류: String(e && e.message || e) };
    }
    try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST', headers: head,
            body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 16,
                                   messages: [{ role: 'user', content: '1' }] })
        });
        const j = await r.json().catch(() => ({}));
        out.메시지 = r.ok
            ? { 상태: r.status, 모델: j.model, 끝난_까닭: j.stop_reason }
            : { 상태: r.status, 오류: (j.error && (j.error.type + ' — ' + j.error.message)) || '알 수 없음' };
    } catch (e) {
        out.메시지 = { 오류: String(e && e.message || e) };
    }
    const okAll = out.모델목록 && out.모델목록.상태 === 200 && out.메시지 && out.메시지.상태 === 200;
    out.결론 = okAll ? '✓ 키가 들어가 있고, 불러지고, 크레딧으로 한 번 응답까지 받았습니다.'
                     : '✗ 위의 오류를 봐 주세요.';
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(out);
}
