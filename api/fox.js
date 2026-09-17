export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST만 허용됩니다.' });
    }

    const { messages, system } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages가 필요합니다.' });
    }

    // OpenRouter는 system을 messages 배열 안에 넣는다
    const fullMessages = system
        ? [{ role: 'system', content: system }, ...messages]
        : messages;

    try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://intranet00.vercel.app',
                'X-Title': 'Qtrew Intranet'
            },
            body: JSON.stringify({
         model : 'qwen/qwen-2.5-72b-instruct',
                max_tokens: 600,
                temperature: 0.9,
                messages: fullMessages
            })
        });

        const data = await r.json();
        if (!r.ok) {
            console.error('API 오류:', JSON.stringify(data));
            return res.status(r.status).json({ error: '응답 실패' });
        }

        const text = data.choices?.[0]?.message?.content || '';
        return res.status(200).json({ text });
    } catch (e) {
        console.error('중계 실패:', e);
        return res.status(500).json({ error: '서버 오류' });
    }
}