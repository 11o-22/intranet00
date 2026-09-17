export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST만 허용됩니다.' });
    }

    const { messages, system } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages가 필요합니다.' });
    }

    try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 600,
                system: system || '',
                messages: messages
            })
        });

        const data = await r.json();
        if (!r.ok) {
            console.error('API 오류:', data);
            return res.status(r.status).json({ error: '응답 실패' });
        }

        const text = (data.content || [])
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');

        return res.status(200).json({ text });
    } catch (e) {
        console.error('중계 실패:', e);
        return res.status(500).json({ error: '서버 오류' });
    }
}