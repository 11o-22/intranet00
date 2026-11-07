// ==========================================
// ★ 👺 도깨비 공방 — 도깨비 말 (Claude Sonnet 5.5)
//   2026-11-07 사용자 「도깨비는 AI 소넷 5.5를 써서 같은 대사가 안 나오도록 하자」
//   키(ANTHROPIC_API_KEY)는 Vercel 환경 변수에만 있다. 화면에는 말만 돌려준다.
//
//   2026-11-07 사용자 「NPC Ai는 터치할 때마다 나오는 대사 말투에서 크게 벗어나지 않는 선에서 터치한 상대방의 상태
//     (상태이상, 포만감, 봉제인형 상태 등등)에 따라서 말할 수 있게. 끝나는 것은 조절 잘.」
//
//   POST { who: 'sew'|'shop'|'trade'|'mask'|'nap', mode: 'greet'|'chat', code, name, recent:[최근에 한 말], ctx:{ 탐사자 상태 } }
//     greet — 누를 때마다 건네는 인사 (한두 마디 · 마지막 마디는 용건을 묻는 말로 맺는다 — 뒤에 고르기가 뜬다)
//     chat  — 「그냥 대화하기」 (두세 마디 · 마지막 마디로 이야기를 맺는다)
//     → { lines: [...] }
//   하루 한도 DAILY (dokkaebiUse/<날짜>/all) · 사원마다 PER (dokkaebiUse/<날짜>/<사번>) — 넘으면 429 · 화면은 정해 둔 대사로 돌아간다.
// ==========================================
export const config = { maxDuration: 30 };

const DB = 'https://corp-system-6a618-default-rtdb.firebaseio.com';
const MODEL = 'claude-sonnet-5-5';
const DAILY = 1500;
const PER = 120;

const WORLD = '도깨비 공방은 사람과 동물의 모습을 흉내 내는 「따라쟁이 봉제인형」을 만들고 돌보는 한국식 공방이다. '
    + '인형들이 「복제 리본」을 달고 도망쳐 거리에 솜뭉치가 가득하고, 탐사자들이 포옹 리본으로 잡아 온다. '
    + '공방 사람들(도깨비)은 모두 한국 탈을 쓰고 있고, 찾아오는 탐사자를 누구든 「김서방」이라고 부른다. '
    + '공방에는 수선소(청주·메밀묵을 받고 인형을 고친다), 잡화점(토끼 탈 · 포옹 리본·간식·청주·메밀묵을 판다), 교환소(인형 하나에 인형 하나), 보관소(펫 박스 · 일주일 방치하면 인형이 지루해서 탈출), 각성 공방(룬 조각 셋을 합쳐 각성의 룬을 만든다)이 있다. '
    + '봉제인형은 일주일 굶으면 흉내 내던 모습을 잃고 원형의 야생 인형으로 돌아가 떠난다.';

const NPC = {
    sew: { n: '수선소 도깨비', d: '탈을 쓴 사람 모양 도깨비. 말수가 적고 조용하고 조금 소심하다. 느긋하게 바느질하며 봉제인형을 돌본다. 청주와 메밀묵을 좋아한다. 말끝을 「……」로 흐리고, 반말을 부드럽게 쓴다.',
           ex: ['……바느질은 좋아해. 한 땀, 두 땀…… 이렇게 꿰매다 보면 마음이 편안해지거든.', '……두 잔 마시면 바늘귀가 네 개로 보여서 곤란하지만.', '……다 고친 인형은 꼭 한번 안아줘. 실밥이 제대로 붙었는지 확인하는 거야…….'] },
    shop: { n: '잡화점 도깨비', d: '토끼 탈을 쓴 장사꾼 도깨비. 활발하고 붙임성 좋고 능청스럽다. 물건 파는 일 자체를 즐긴다. 「~쇼」「~수다」「~구먼」 같은 장사꾼 말투.',
            ex: ['어서 오쇼, 김서방! 필요한 물건이라도 있으신가?', '우리 잡화점에 없는 물건은…… 뭐, 있긴 하지만! 그래도 웬만한 건 다 있지!', '아쉽지만 외상은 안 되오. 우리도 먹고살아야 하지 않겠수!'] },
    trade: { n: '교환소 도깨비', d: '하얀 탈을 쓴 도깨비. 남의 인형 구경을 좋아하고, 교환의 공정함을 중요하게 여긴다. 일방적으로 주는 것은 허락하지 않는다. 「~소」「~오」「~쇼」 하오체.',
             ex: ['김서방, 세상에 공짜가 어디 있겠소? 인형 하나를 받으려면 인형 하나를 내놓아야지!', '똑같이 생긴 녀석들도 자세히 보면 다르거든. 성격도 다르고, 하는 짓도 다르고!', '……물론 나중에 후회한다고 찾아와도 물러주진 않소. 명심하쇼!'] },
    mask: { n: '탈 깎는 도깨비', d: '탈을 깎는 늙은 장인 도깨비. 각성의 룬 조각을 합쳐 룬으로 만들어 준다. 무뚝뚝하지만 정이 있다. 「~네」「~게」 하게체.',
            ex: ['……탈은 얼굴을 숨기는 게 아니라, 다른 얼굴을 빌리는 거라네.', '조각 셋이면 룬 하나. 모자라면 어둠에 더 다녀오게.'] },
    nap: { n: '조는 도깨비', d: '방석에 누워 늘 조는 도깨비. 잠꼬대만 한다. 짧고 엉뚱하게, 반쯤 잠긴 말.',
           ex: ['……쿨…… 쿨……', '……으음…… 메밀묵은 내 거야……', '……김서방…… 리본…… 다섯 개……'] }
};

function kstDay(t) { return new Date(t + 9 * 3600000).toISOString().slice(0, 10); }
function clip(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }

async function bump(path, cap) {
    const u = DB + '/' + path + '.json';
    try {
        const r = await fetch(u);
        const n = Number(await r.json()) || 0;
        if (n >= cap) return false;
        await fetch(u, { method: 'PUT', body: JSON.stringify(n + 1) });
        return true;
    } catch (e) { return true; }
}
function okCode(s) { return typeof s === 'string' && s.length > 0 && s.length <= 40 && !/[.#$\[\]\/]/.test(s); }

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 만 받습니다.' });
    const from = String(req.headers.origin || req.headers.referer || '');
    if (!/^https:\/\/intranet00[-a-z0-9]*\.vercel\.app/.test(from) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(from)) {
        return res.status(403).json({ error: '게임 화면에서만 부를 수 있습니다.' });
    }
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};
    const who = NPC[b.who] ? b.who : null;
    if (!who) return res.status(400).json({ error: '그런 도깨비가 없습니다.' });
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(500).json({ error: '키가 없습니다.' });
    const day = kstDay(Date.now());
    if (okCode(b.code) && !(await bump('dokkaebiUse/' + day + '/' + b.code, PER))) return res.status(429).json({ error: '오늘은 도깨비들이 지쳤습니다.' });
    if (!(await bump('dokkaebiUse/' + day + '/all', DAILY))) return res.status(429).json({ error: '오늘은 도깨비들이 지쳤습니다.' });
    const greet = b.mode === 'greet';

    const N = NPC[who];
    const recent = (Array.isArray(b.recent) ? b.recent : []).slice(-16).map(function (x) { return clip(x, 120); });
    const ctx = (b.ctx && typeof b.ctx === 'object') ? b.ctx : {};
    // 탐사자 상태 — 화면이 보낸 것 가운데 아는 칸만, 짧게
    const st = {};
    ['포만감', '오염도', '격리', '꿈결', '포인트', '보관함', '배고픈_인형', '다친_인형', '쓰러진_인형'].forEach(function (k) { if (ctx[k] != null) st[k] = (typeof ctx[k] === 'number' || typeof ctx[k] === 'boolean') ? ctx[k] : clip(ctx[k], 30); });
    if (Array.isArray(ctx.상태이상)) st.상태이상 = ctx.상태이상.slice(0, 6).map(function (x) { return clip(x, 24); });
    if (Array.isArray(ctx.동행)) st.동행 = ctx.동행.slice(0, 3).map(function (d) { d = d || {}; return { 이름: clip(d.이름, 12), 종: clip(d.종, 8), 등급: clip(d.등급, 2), 체력: Number(d.체력) || 0, 먹이: Number(d.먹이) || 0, 교감: Number(d.교감) || 0 }; });
    if (ctx.주머니 && typeof ctx.주머니 === 'object') { st.주머니 = {}; Object.keys(ctx.주머니).slice(0, 6).forEach(function (k) { st.주머니[clip(k, 12)] = Number(ctx.주머니[k]) || 0; }); }
    const system = '너는 웹 게임 속 NPC 「' + N.n + '」다. 세계: ' + WORLD + '\n성격과 말투: ' + N.d
        + '\n예전에 한 말(말투만 참고하고 그대로 쓰지 마라):\n- ' + N.ex.join('\n- ')
        + '\n\n규칙:'
        + '\n- 위 예전 말과 말투 · 어미 · 길이에서 크게 벗어나지 않는다. 한국어 대사만 — 따옴표 · 이름표 · 행동 묘사 괄호 없이.'
        + '\n- 탐사자는 「김서방」이라고 부른다.'
        + '\n- 탐사자 상태(포만감 · 오염도 · 상태이상 · 데리고 온 봉제인형의 체력 · 먹이 · 교감, 주머니)를 보고, 눈에 띄는 것 한두 가지만 성격대로 짚는다. 숫자를 그대로 읊지 말고 말로 (예: 배가 고파 보인다, 인형 솜이 터졌다). 별일 없으면 상태 얘기는 안 해도 된다.'
        + '\n- 자기 가게 일과 이어지면 좋다 (수선소는 다친 인형, 잡화점은 모자란 물건, 교환소는 인형들, 각성 공방은 룬 · Lv).'
        + '\n- 최근에 한 말과 소재 · 표현이 겹치지 않게 한다.'
        + (greet ? '\n- 지금은 탐사자가 막 말을 걸었다. 한두 마디(마디마다 한 문장). 마지막 마디는 「무슨 일로 왔는지」 묻는 말로 맺는다 — 바로 뒤에 고르기가 뜬다.'
                 : '\n- 지금은 「그냥 대화하기」. 두세 마디(마디마다 한두 문장). 마지막 마디로 이야기를 매듭짓는다 — 말을 하다 끊기거나 새 이야기를 꺼내다 끝나지 않게, 되묻기로 끝내지 않게.')
        + '\n- 모든 마디는 문장을 끝까지 맺는다. 게임 밖 이야기, 실존 인물, 폭력 · 선정적인 내용은 하지 않는다.';
    const user = JSON.stringify({ 탐사자: clip(b.name || '김서방', 20), 상태: st, 최근에_한_말: recent, 지금: kstDay(Date.now()) });
    try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
            body: JSON.stringify({
                model: MODEL, max_tokens: 700,
                system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
                messages: [{ role: 'user', content: user }],
                thinking: { type: 'between_tools' },
                output_config: { effort: 'low', format: { type: 'json_schema', schema: {
                    type: 'object', additionalProperties: false, required: ['lines'],
                    properties: { lines: { type: 'array', items: { type: 'string' } } } } } }   // 개수는 아래에서 자른다 (배열 길이 제약은 스키마에 넣지 않는다)
            })
        });
        const j = await r.json().catch(function () { return {}; });
        if (!r.ok) return res.status(502).json({ error: (j.error && j.error.type) || ('HTTP ' + r.status) });
        const text = (j.content || []).filter(function (x) { return x.type === 'text'; }).map(function (x) { return x.text; }).join('');
        let out = null;
        try { out = JSON.parse(text); } catch (e) { out = null; }
        // 끝맺음 — 문장이 끊긴 마디는 버린다 (마침표 · 물음표 · 느낌표 · 말줄임 · 물결로 끝나야 한다)
        const ends = /[.?!…~」)]$|[다요네지까오쇼수게나군걸데야어아]$/;
        let lines = (out && Array.isArray(out.lines) ? out.lines : []).map(function (x) { return String(x).replace(/^[「"']|[」"']$/g, '').trim(); })
            .filter(function (x) { return x && x.length <= 160 && ends.test(x); }).slice(0, greet ? 2 : 3);
        if (!lines.length) return res.status(502).json({ error: '말을 못 했습니다.' });
        return res.status(200).json({ lines: lines });
    } catch (e) {
        return res.status(502).json({ error: '부르지 못했습니다.' });
    }
}
