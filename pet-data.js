// ==========================================
// ★ 펫 — 바탕 (자료 · 등급 · 보관 자리)
// bundles.json 마지막 묶음 — 다른 펫 파일보다 앞
// ==========================================
//
// ■ 무엇이 있나
//
//   펫 20종. 다섯 가지 「주의 문구」로 네 마리씩 나뉜다. 알을 살 때 주의
//   문구 하나가 정해지고, 그 묶음의 네 마리 가운데 하나가 깨어난다.
//
//   등급은 D → C → B → A → S. 전부 D 로 태어난다. 능력치는 B 부터
//   생긴다 (등급을 올리는 길은 아직 안 넣었다 — 자리만 잡아 둔다).
//
// ■ 그림
//
//   pet/p01~p20.webp   깨어날 때 뜨는 본 그림 (긴 쪽 220)
//   pet/s01~s20.webp   목록에 뜨는 작은 것 (긴 쪽 64)
//                      데포르메가 아직 없는 다섯(사자·백호·치와와·송골매·
//                      부엉이)은 본 그림을 줄여서 쓴다
//   pet/egg0~egg3.webp 알 — 금이 번지는 차례
//
// ■ 사원 기록에 적히는 자리
//
//   u.pets      { 펫번호: { g:'D', nick, at, fed, fedAt, rest, out,
//                            bond, bd:{d,v}, pat, play, with } }
//               nick 은 따로 붙여 준 이름. 비어 있으면 종 이름으로 부른다.
//   u.petEgg    { warn, need:{물품:수}, done:{물품:수}, last, ruin }
//   u.petEggAt  알을 산 날 (하루 하나)
//   u.petBag    { 돌봄 물품 이름: 개수 }   ← 소지품과 따로 둔다
//
//   돌봄 물품을 소지품에 넣지 않는 까닭 — 소지품은 어둠에 반입되고,
//   팔리고, 남에게 넘어간다. 마흔 가지가 거기 섞이면 목록이 묻힌다.
//   부화에만 쓰는 것이라 제 주머니를 따로 둔다.
//
// ■ 콘솔
//   petState()   내 펫과 알
//   petAll()     펫 20종 표

const PET_GRADES = ['D', 'C', 'B', 'A', 'S'];

// 다섯 가지 주의 문구 — 어기면 안 되는 표식이 하나씩 붙어 있다
const PET_WARN = {
    wet:   { n: '물에 닿게 하지 마시오.',      bad: 'wet',   badName: '수분',
             hint: '물기가 있는 것을 쓰면 안 됩니다.' },
    heat:  { n: '차가운 곳에 두세요.',          bad: 'heat',  badName: '열기',
             hint: '뜨거운 것을 쓰면 안 됩니다.' },
    cold:  { n: '따뜻하게 감싸 주세요.',        bad: 'cold',  badName: '냉기',
             hint: '찬 것을 쓰면 안 됩니다.' },
    noise: { n: '시끄러운 소리를 싫어합니다.',   bad: 'noise', badName: '소리',
             hint: '소리가 나는 것을 쓰면 안 됩니다.' },
    scent: { n: '냄새를 없애 주세요.',          bad: 'scent', badName: '향',
             hint: '향이 나는 것을 쓰면 안 됩니다.' }
};
const PET_WARN_KEYS = ['wet', 'heat', 'cold', 'noise', 'scent'];

// ==========================================
// 펫 20종
// ==========================================
//
//   i      그림 번호 (pet/p○○.webp · pet/s○○.webp)
//   w      어느 주의 문구에서 깨어나나
//   st     B 등급부터 붙는 능력치 (등급을 올리는 길은 아직 없다)
//   deform 데포르메 그림이 따로 있나
const PET_LIST = [
    { i: 1,  n: '고양이',   w: 'wet',   deform: true,  st: { luck: 60 },  d: '좁은 데를 좋아한다. 부르면 안 온다.' },
    { i: 2,  n: '리트리버', w: 'scent', deform: true,  st: { bon: 2 },    d: '언제나 기쁘다. 까닭은 모른다.' },
    { i: 3,  n: '사자',     w: 'scent', deform: false, st: { bon: 3 },    d: '아직 작다. 목소리는 벌써 크다.' },
    { i: 4,  n: '뱁새',     w: 'heat',  deform: true,  st: { eva: 2 },    d: '둥글다. 거의 전부가 깃털이다.' },
    { i: 5,  n: '담비',     w: 'noise', deform: true,  st: { eva: 3 },    d: '소리 없이 지나간다. 뭔가 없어진다.' },
    { i: 6,  n: '도마뱀',   w: 'cold',  deform: true,  st: { resist: 2 }, d: '햇볕이 드는 자리를 귀신같이 안다.' },
    { i: 7,  n: '거북이',   w: 'cold',  deform: true,  st: { resist: 3 }, d: '느리다. 그래도 어디든 간다.' },
    { i: 8,  n: '참새',     w: 'noise', deform: true,  st: { luck: 50 },  d: '늘 셋 이상이다. 혼자인 걸 본 적이 없다.' },
    { i: 9,  n: '햄스터',   w: 'wet',   deform: true,  st: { luck: 70 },  d: '볼에 하루치를 넣고 다닌다.' },
    { i: 10, n: '백호',     w: 'heat',  deform: false, st: { bon: 3, eva: 1 }, d: '흰 줄무늬. 눈을 마주치면 진다.' },
    { i: 11, n: '곰',       w: 'scent', deform: true,  st: { resist: 4 }, d: '봉제 인형처럼 생겼다. 아니다.' },
    { i: 12, n: '뱀',       w: 'cold',  deform: true,  st: { gim: 1 },    d: '감아 오는 것이 인사다.' },
    { i: 13, n: '여우',     w: 'noise', deform: true,  st: { luck: 90 },  d: '웃고 있다. 웃는 게 아닐 수도 있다.' },
    { i: 14, n: '토끼',     w: 'cold',  deform: true,  st: { eva: 4 },    d: '귀가 길다. 다 듣고 있다.' },
    { i: 15, n: '수달',     w: 'heat',  deform: true,  st: { luck: 80 },  d: '돌 하나를 평생 들고 다닌다.' },
    { i: 16, n: '병아리',   w: 'wet',   deform: true,  st: { luck: 40 },  d: '아직 아무것도 모른다. 그래서 겁이 없다.' },
    { i: 17, n: '치와와',   w: 'scent', deform: false, st: { bon: 2, eva: 2 }, d: '작고 화가 나 있다. 늘.' },
    { i: 18, n: '송골매',   w: 'noise', deform: false, st: { bon: 4 },    d: '내려올 때는 소리가 안 난다.' },
    { i: 19, n: '돌고래',   w: 'heat',  deform: true,  st: { gim: 2 },    d: '웃는 얼굴로 태어났다. 기분과는 무관하다.' },
    { i: 20, n: '부엉이',   w: 'wet',   deform: false, st: { gim: 1, luck: 60 }, d: '밤에만 눈이 커진다.' }
];

const PET_BY_ID = {};
PET_LIST.forEach(function (p) { PET_BY_ID[p.i] = p; });

const PET_STAT_NAME = {
    luck: '행운', bon: '판정', eva: '회피', gim: '기믹 파훼', resist: '저항'
};
function petStatText(st) {
    return Object.keys(st || {}).map(function (k) {
        return (PET_STAT_NAME[k] || k) + ' +' + st[k] + (k === 'luck' ? '%' : '');
    }).join(' · ');
}

// ==========================================
// 돌봄 물품 40종 — 망상 홈쇼핑에서만 판다
// ==========================================
//
//   표식 다섯 가지와 아무 표식도 없는 것. 알의 주의 문구가 가리키는 표식을
//   쓰면 그 자리에서 알이 상한다.
const PET_TAGS = { wet: '💧 수분', heat: '🔥 열기', cold: '❄ 냉기',
                   noise: '🔔 소리', scent: '🌸 향', '': '— 무난' };

const PET_CARE = [
    // 💧 수분
    ['이슬 적신 솜',    'wet',  1200], ['가습 돌',        'wet',  1500],
    ['젖은 수건',       'wet',   900], ['물안개 분무기',   'wet',  1800],
    ['수경 이끼',       'wet',  2000], ['물컵 받침',       'wet',   700],
    // 🔥 열기
    ['손난로',          'heat', 1100], ['온열 매트',       'heat', 2400],
    ['뜨거운 돌',       'heat', 1600], ['전구 램프',       'heat', 1900],
    ['김 나는 보온병',  'heat', 2200], ['화로 재',         'heat', 1300],
    // ❄ 냉기
    ['얼음 주머니',     'cold', 1100], ['냉각 젤',         'cold', 1700],
    ['서리 낀 유리',    'cold', 1400], ['한랭 송풍기',     'cold', 2300],
    ['눈 뭉치',         'cold',  800], ['냉장 보관함',     'cold', 2600],
    // 🔔 소리
    ['작은 종',         'noise', 900], ['태엽 오르골',     'noise',2100],
    ['딸랑이',          'noise', 700], ['금속 풍경',       'noise',1500],
    ['삐걱대는 의자',   'noise',1000], ['라디오',          'noise',2500],
    // 🌸 향
    ['라벤더 주머니',   'scent',1300], ['향초',            'scent',1800],
    ['방향제',          'scent',1600], ['말린 꽃다발',     'scent',1200],
    ['송진 덩어리',     'scent',1400], ['향나무 조각',     'scent',2000],
    // — 무난
    ['부드러운 천',     '',      600], ['마른 짚',         '',      500],
    ['깃털 쿠션',       '',     1500], ['나무 받침대',     '',      900],
    ['두꺼운 담요',     '',     1700], ['실타래',          '',      700],
    ['조약돌',          '',      400], ['낡은 장갑',       '',      800],
    ['가죽 끈',         '',     1000], ['유리 뚜껑',       '',     1900]
];
const PET_CARE_BY = {};
PET_CARE.forEach(function (x) { PET_CARE_BY[x[0]] = { tag: x[1], price: x[2] }; });

// ==========================================
// 알
// ==========================================
const PET_EGG_NAME = '환몽알';
const PET_EGG_PRICE = 500000;
const PET_CARE_GAP = 10 * 60 * 1000;      // 한 번 쓰고 다음까지
const PET_REST_MS = 2 * 3600 * 1000;      // 탐사 뒤 쉬는 시간

// 알이 상했을 때 나오는 것 — 어긴 표식마다 다르다
//
//   poll  오염도가 오른다
//   sat   포만감이 깎인다
//   eff   특이사항에 적히는 [이름, 설명]
//   buf   그동안 깎이는 수치 [무엇, 얼마] · hrs 시간
//   say   기어 나왔을 때의 한 줄
const PET_RUIN = {
    wet:   { n: '물에 불은 지렁이', poll: 15, hrs: 24, buf: ['bon', -3],
             eff: ['미끈거림', '손에서 자꾸 빠진다. 판정이 흔들린다.'],
             say: '껍질이 물러 터지고, 안에서 뭔가 길쭉한 것이 흘러나옵니다.' },
    heat:  { n: '눌어붙은 껍질',    sat: 30,  hrs: 24, buf: ['eva', -3],
             eff: ['그을음', '탄 냄새가 가시지 않는다.'],
             say: '껍질이 바닥에 들러붙었습니다. 안쪽은 이미 굳었습니다.' },
    cold:  { n: '얼어붙은 무언가',  poll: 10, hrs: 24, buf: ['eva', -4],
             eff: ['한기', '손끝이 곱는다. 움직임이 굼뜨다.'],
             say: '알이 속까지 얼었습니다. 두드려도 소리가 나지 않습니다.' },
    noise: { n: '귀를 먹은 울음',   poll: 12, hrs: 24, buf: ['gim', -1],
             eff: ['이명', '한쪽 귀에서 소리가 안 멎는다.'],
             say: '알이 짧게 한 번 울고 조용해졌습니다. 귀가 한참 멍합니다.' },
    scent: { n: '냄새나는 덩어리',  sat: 25,  hrs: 24, buf: ['pct', -40],
             eff: ['악취', '가까이 오는 사람이 없다.'],
             say: '껍질 틈으로 냄새가 먼저 나왔습니다. 안쪽은 보지 않는 편이 낫습니다.' }
};

// ==========================================
// 교감 · 굶주림
// ==========================================
//
//   교감도는 0 에서 100 까지. 쓰다듬기 · 놀아주기 · 먹이주기로 한 번에
//   둘~셋씩 오른다. 하루에 오르는 몫은 열까지다.
//
//   먹이를 사흘 동안 안 주면 펫이 죽는다. 죽은 펫은 목록에서 사라지고
//   그 자리는 다시 「입양 전」이 된다.
const PET_BOND_MAX = 100;
const PET_BOND_DAY = 10;                      // 하루에 오르는 몫
const PET_BOND_STEP = [2, 3];                 // 한 번에 둘~셋
const PET_PAT_GAP = 10 * 60 * 1000;           // 쓰다듬기 사이
const PET_PLAY_GAP = 20 * 60 * 1000;          // 놀아주기 사이
const PET_STARVE = 3 * 24 * 3600 * 1000;      // 사흘
const PET_SAVE_ODDS = 0.5;                    // 교감 100 — 대신 죽어 줄 확률

// ==========================================
// 사원 기록
// ==========================================
function petMe() { return (typeof currentUser !== 'undefined') ? currentUser : null; }

// 서버 기준 지금 — 기기 시계를 믿지 않는다 (clock.js)
function petNow() {
    try { if (typeof serverNow === 'function') return serverNow(); } catch (e) { }
    return Date.now();
}
function petToday() {
    try { if (typeof getTodayStr === 'function') return getTodayStr(); } catch (e) { }
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
        + '-' + String(d.getDate()).padStart(2, '0');
}

function petsOf(u) {
    u = u || petMe();
    if (!u) return {};
    if (!u.pets || typeof u.pets !== 'object' || Array.isArray(u.pets)) u.pets = {};
    return u.pets;
}
function petBag(u) {
    u = u || petMe();
    if (!u) return {};
    if (!u.petBag || typeof u.petBag !== 'object' || Array.isArray(u.petBag)) u.petBag = {};
    return u.petBag;
}
function petEgg(u) {
    u = u || petMe();
    return (u && u.petEgg && u.petEgg.warn) ? u.petEgg : null;
}
function petHas(id, u) { return !!petsOf(u)[String(id)]; }

// 돌봄 주머니 — 한 칸만 고쳐 쓴다
function petBagAdd(name, n) {
    const u = petMe();
    if (!u) return 0;
    const b = petBag(u);
    const v = Math.max(0, (Number(b[name]) || 0) + (Number(n) || 0));
    if (v) b[name] = v; else delete b[name];
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/petBag/' + name).set(v || null)
                .catch(function (e) { console.warn('[펫] 주머니 저장 실패', e); });
            return v;
        }
    } catch (e) { }
    petSave({ petBag: 1 });
    return v;
}
function petBagHas(name, u) { return Number(petBag(u)[name]) || 0; }

// ==========================================
// 교감도
// ==========================================
function petBond(id, u) {
    const s = petsOf(u)[String(id)];
    return Math.max(0, Math.min(PET_BOND_MAX, Number(s && s.bond) || 0));
}
function petBondFull(id, u) { return petBond(id, u) >= PET_BOND_MAX; }

// 오늘 더 올릴 수 있는 몫
function petBondRoom(id, u) {
    const s = petsOf(u)[String(id)];
    if (!s) return 0;
    const cap = PET_BOND_MAX - petBond(id, u);
    if (cap <= 0) return 0;
    const bd = s.bd;
    const used = (bd && bd.d === petToday()) ? (Number(bd.v) || 0) : 0;
    return Math.max(0, Math.min(cap, PET_BOND_DAY - used));
}

// 올린다 — 올린 만큼 돌려준다 (patch 에 얹을 것도 같이 채워 준다)
function petBondUp(id, patch) {
    const u = petMe();
    const s = petsOf(u)[String(id)];
    if (!s) return 0;
    const room = petBondRoom(id, u);
    if (room <= 0) return 0;
    const lo = PET_BOND_STEP[0], hi = PET_BOND_STEP[1];
    const got = Math.min(room, lo + Math.floor(Math.random() * (hi - lo + 1)));
    const bd = (s.bd && s.bd.d === petToday()) ? s.bd : { d: petToday(), v: 0 };
    patch.bond = petBond(id, u) + got;
    patch.bd = { d: bd.d, v: (Number(bd.v) || 0) + got };
    return got;
}

// ==========================================
// 굶주림 — 마지막으로 먹인 때로부터 사흘
// ==========================================
function petStarveLeft(id, u) {
    const s = petsOf(u)[String(id)];
    if (!s) return 0;
    const at = Number(s.fedAt) || 0;
    if (!at) return PET_STARVE;          // 아직 시계가 안 붙은 펫은 굶지 않는다
    return (at + PET_STARVE) - petNow();
}

// 굶어 죽은 펫을 걷어 간다 — 치운 펫 목록을 돌려준다
function petStarveSweep() {
    const u = petMe();
    if (!u) return [];
    const ps = petsOf(u);
    const now = petNow();

    // 굶주림 시계가 없는 펫(예전에 깨어난 것)에게는 지금부터 사흘을 준다
    const stamp = {};
    Object.keys(ps).forEach(function (k) {
        if (!PET_BY_ID[k] || !ps[k] || ps[k].fedAt) return;
        ps[k].fedAt = now;
        stamp['pets/' + k + '/fedAt'] = now;
    });
    if (Object.keys(stamp).length) {
        try {
            if (typeof database !== 'undefined' && database && u.code) {
                database.ref('users/' + u.code).update(stamp).catch(function () { });
            } else petSave({ pets: 1 });
        } catch (e) { }
    }

    const gone = [];
    Object.keys(ps).forEach(function (k) {
        if (!PET_BY_ID[k]) return;
        if (petStarveLeft(k, u) > 0) return;
        gone.push({ i: k, n: petNick(k, u), sp: (PET_BY_ID[k] || {}).n });
        delete ps[k];
    });
    if (!gone.length) return gone;
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            const up = {};
            gone.forEach(function (g) { up['pets/' + g.i] = null; });
            database.ref('users/' + u.code).update(up)
                .catch(function (e) { console.warn('[펫] 굶주림 저장 실패', e); });
            return gone;
        }
    } catch (e) { }
    petSave({ pets: 1 });
    return gone;
}

// 알 쪽 기록 — 통째로 쓴다 (알은 한 번에 하나뿐이라 겹칠 일이 없다)
function petEggSave() {
    const u = petMe();
    if (!u) return;
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code).update({
                petEgg: u.petEgg || null, petEggAt: u.petEggAt || null
            }).catch(function (e) { console.warn('[펫] 알 저장 실패', e); });
            return;
        }
    } catch (e) { }
    petSave({ petEgg: 1, petEggAt: 1 });
}
function petSave(f) {
    try { if (typeof saveFields === 'function') saveFields(f); } catch (e) { }
}

// 펫 하나만 고쳐 쓴다 — u.pets 통째로 덮으면 다른 기기에서 받은 펫이 날아간다.
//   patch 의 값이 null 이면 그 자리를 지운다.
function petPatch(id, patch) {
    const u = petMe();
    if (!u) return false;
    const key = String(id);
    const s = petsOf(u)[key];
    if (!s) return false;
    Object.keys(patch).forEach(function (k) {
        if (patch[k] === null) delete s[k]; else s[k] = patch[k];
    });
    try {
        if (typeof database !== 'undefined' && database && u.code) {
            database.ref('users/' + u.code + '/pets/' + key).update(patch)
                .catch(function (e) { console.warn('[펫] 저장 실패', e); });
            return true;
        }
    } catch (e) { }
    petSave({ pets: 1 });
    return true;
}

// ==========================================
// 따로 붙여 주는 이름
// ==========================================
//
//   깨어난 펫마다 이름을 하나 붙여 둘 수 있다. 안 붙이면 종 이름으로 부른다.
//   열두 자까지. 빈 칸으로 저장하면 종 이름으로 돌아간다.
const PET_NICK_MAX = 12;

function petNick(id, u) {
    const s = petsOf(u)[String(id)];
    const sp = (PET_BY_ID[id] || {}).n || '?';
    const nk = s && typeof s.nick === 'string' ? s.nick.trim() : '';
    return nk || sp;
}
// 종 이름과 다른 이름을 붙여 뒀나 (목록에 종을 같이 적어 줄 때 쓴다)
function petNamed(id, u) {
    const s = petsOf(u)[String(id)];
    const nk = s && typeof s.nick === 'string' ? s.nick.trim() : '';
    return !!nk && nk !== ((PET_BY_ID[id] || {}).n || '');
}
// 돌려주는 값 — { ok, name } 또는 { ok:false, why }
function petRename(id, name) {
    const u = petMe();
    if (!u) return { ok: false, why: '로그인 전입니다.' };
    const key = String(id);
    const s = petsOf(u)[key];
    if (!s) return { ok: false, why: '아직 없는 펫입니다.' };

    let nk = String(name == null ? '' : name).replace(/\s+/g, ' ').trim();
    if (nk.length > PET_NICK_MAX) nk = nk.slice(0, PET_NICK_MAX);
    // 꺾쇠나 따옴표는 그리는 쪽에서 막아도 아예 안 받는 게 깔끔하다
    if (/[<>"'`&\\]/.test(nk)) return { ok: false, why: '쓸 수 없는 글자가 있습니다.' };

    petPatch(key, { nick: nk || null });
    return { ok: true, name: petNick(key, u) };
}

// 알 하나를 짠다 — 주의 문구 하나와 「쓸 것」 목록
//
//   쓸 것은 **그 알이 싫어하는 표식이 아닌 것** 가운데서 고른다. 안 그러면
//   어떻게 해도 못 깨운다. 가짓수는 둘~넷, 가짓수마다 두세 번씩,
//   통틀어 다섯~열 번이 되게 맞춘다.
function petMakeEgg() {
    const warn = PET_WARN_KEYS[Math.floor(Math.random() * PET_WARN_KEYS.length)];
    const bad = PET_WARN[warn].bad;
    const safe = PET_CARE.filter(function (x) { return x[1] !== bad; }).map(function (x) { return x[0]; });

    const kinds = 2 + Math.floor(Math.random() * 3);          // 둘~넷
    const pick = [];
    const pool = safe.slice();
    for (let i = 0; i < kinds && pool.length; i++) {
        pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    const need = {};
    pick.forEach(function (n) { need[n] = 2 + Math.floor(Math.random() * 2); });   // 두세 번

    // 통틀어 다섯~열 번으로 맞춘다
    const total = function () {
        return Object.keys(need).reduce(function (a, k) { return a + need[k]; }, 0);
    };
    while (total() < 5) { need[pick[0]] = (need[pick[0]] || 0) + 1; }
    while (total() > 10) {
        const k = pick[pick.length - 1];
        if (need[k] > 2) need[k]--; else { delete need[k]; pick.pop(); }
    }
    return { warn: warn, need: need, done: {}, last: 0, ruin: '' };
}

// 이 알이 다 자랐나 (쓸 것을 다 썼나)
function petEggDone(e) {
    if (!e) return false;
    const n = e.need || {}, d = e.done || {};
    return Object.keys(n).every(function (k) { return (d[k] || 0) >= n[k]; });
}
function petEggStep(e) {
    const n = e.need || {}, d = e.done || {};
    let a = 0, b = 0;
    Object.keys(n).forEach(function (k) { b += n[k]; a += Math.min(n[k], d[k] || 0); });
    return { now: a, all: b };
}
// 금이 번지는 정도 — 그림 넷 가운데 하나
function petEggImg(e) {
    if (!e) return 'pet/egg0.webp';
    const s = petEggStep(e);
    if (!s.all) return 'pet/egg0.webp';
    const r = s.now / s.all;
    return 'pet/egg' + (r >= 1 ? 3 : r >= 0.66 ? 2 : r >= 0.33 ? 1 : 0) + '.webp';
}

// 그 묶음에서 한 마리 — 아직 없는 것을 먼저 준다
function petPick(warn, u) {
    const pool = PET_LIST.filter(function (p) { return p.w === warn; });
    const fresh = pool.filter(function (p) { return !petHas(p.i, u); });
    const from = fresh.length ? fresh : pool;
    return from[Math.floor(Math.random() * from.length)];
}

// ==========================================
// 조사 — 「막내이라고」 같은 말이 나오지 않게
// ==========================================
//
//   petJong('막내') → 받침 없음, petJong('송골매') → 없음, petJong('곰') → 있음
//   ㄹ 받침은 「로」를 쓰므로 따로 본다.
function petJong(s) {
    s = String(s == null ? '' : s).trim();
    if (!s) return 0;
    const c = s.charCodeAt(s.length - 1);
    if (c >= 0xAC00 && c <= 0xD7A3) {
        const t = (c - 0xAC00) % 28;
        return t === 0 ? 0 : (t === 8 ? 2 : 1);     // 0 없음 · 1 있음 · 2 ㄹ
    }
    return 1;                                       // 한글이 아니면 받침 있는 쪽으로
}
//   kind — '을' '이' '은' '와' '라고' '로'
function petJosa(s, kind) {
    const j = petJong(s);
    switch (kind) {
        case '을':   return j ? '을' : '를';
        case '이':   return j ? '이' : '가';
        case '은':   return j ? '은' : '는';
        case '와':   return j ? '과' : '와';
        case '라고': return j ? '이라고' : '라고';
        case '로':   return (j === 1) ? '으로' : '로';
    }
    return '';
}

function petImg(id)  { return 'pet/p' + String(id).padStart(2, '0') + '.webp'; }
function petIcon(id) { return 'pet/s' + String(id).padStart(2, '0') + '.webp'; }

// ==========================================
// 바깥에 내어 준다
// ==========================================
window.PET = {
    LIST: PET_LIST, BY: PET_BY_ID, WARN: PET_WARN, WARN_KEYS: PET_WARN_KEYS,
    CARE: PET_CARE, CARE_BY: PET_CARE_BY, TAGS: PET_TAGS, GRADES: PET_GRADES,
    RUIN: PET_RUIN, EGG_NAME: PET_EGG_NAME, EGG_PRICE: PET_EGG_PRICE,
    GAP: PET_CARE_GAP, REST: PET_REST_MS, NICK_MAX: PET_NICK_MAX,
    BOND_MAX: PET_BOND_MAX, BOND_DAY: PET_BOND_DAY, PAT_GAP: PET_PAT_GAP,
    PLAY_GAP: PET_PLAY_GAP, STARVE: PET_STARVE, SAVE_ODDS: PET_SAVE_ODDS,
    bond: petBond, bondFull: petBondFull, bondRoom: petBondRoom, bondUp: petBondUp,
    starveLeft: petStarveLeft, sweep: petStarveSweep,
    pets: petsOf, bag: petBag, egg: petEgg, has: petHas, save: petSave, patch: petPatch,
    now: petNow, today: petToday,
    bagAdd: petBagAdd, bagHas: petBagHas, eggSave: petEggSave,
    make: petMakeEgg, done: petEggDone, step: petEggStep, eggImg: petEggImg,
    pick: petPick, img: petImg, icon: petIcon, statText: petStatText, me: petMe,
    josa: petJosa, jong: petJong,
    nick: petNick, named: petNamed, rename: petRename
};

// ==========================================
// 확인
// ==========================================
window.petState = function () {
    const u = petMe();
    console.log('%c===== 🐶 펫 =====', 'color:#ffb74d; font-size:13px');
    if (!u) { console.log('  로그인 전입니다.'); return; }
    const ps = petsOf(u);
    const keys = Object.keys(ps);
    console.log('  가진 펫:', keys.length + ' / ' + PET_LIST.length + '마리');
    if (keys.length) {
        console.table(keys.map(function (k) {
            const p = PET_BY_ID[k] || {};
            const s = ps[k] || {};
            return { 번호: k, 이름: petNick(k, u), 종: p.n, 등급: s.g || 'D',
                     능력치: (PET_GRADES.indexOf(s.g || 'D') >= 2) ? petStatText(p.st) : '— (B부터)',
                     쉬는중: (s.rest || 0) > petNow()
                        ? Math.ceil((s.rest - petNow()) / 60000) + '분' : '아니오',
                     탐사중: s.out ? (s.out.zone + ' ' + Math.max(0, Math.ceil((s.out.till - petNow()) / 60000)) + '분') : '아니오' };
        }));
    }
    const e = petEgg(u);
    if (!e) { console.log('  알: 없음'); }
    else {
        const s = petEggStep(e);
        console.log('  알:', PET_WARN[e.warn].n, '·', s.now + ' / ' + s.all + '번',
            e.ruin ? ('✗ 상했습니다 (' + e.ruin + ')') : '');
        console.log('   쓸 것:', Object.keys(e.need).map(function (k) {
            return k + ' ' + ((e.done || {})[k] || 0) + '/' + e.need[k];
        }).join(' · '));
    }
    const bag = petBag(u);
    const bk = Object.keys(bag).filter(function (k) { return bag[k] > 0; });
    console.log('  돌봄 주머니:', bk.length ? bk.map(function (k) { return k + '×' + bag[k]; }).join(', ') : '비었음');
};

window.petAll = function () {
    console.log('%c===== 펫 20종 =====', 'color:#ffb74d; font-size:13px');
    PET_WARN_KEYS.forEach(function (w) {
        console.log('%c' + PET_WARN[w].n, 'color:#9fd8ef');
        PET_LIST.filter(function (p) { return p.w === w; }).forEach(function (p) {
            console.log('   ', String(p.i).padStart(2), p.n.padEnd(5),
                '· B부터', petStatText(p.st), petHas(p.i) ? ' ← 가지고 있음' : '');
        });
    });
};

console.log('[펫] petState() · petAll()');
