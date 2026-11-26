#!/usr/bin/env python3
"""리깅.json 만들기 — 항목마다 축 · 움직임을 적어 둔 곳."""
import json, os, sys, itertools
import numpy as np
from PIL import Image

RIG = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "rig")
ACC, OUT = os.path.join(RIG, 'acc'), os.path.join(RIG, 'outfit')


def mask(path, clip=None):
    im = Image.open(path).convert('RGBA')
    if im.size != (2400, 2400):
        im = im.resize((2400, 2400))
    a = np.asarray(im)[:, :, 3] > 60
    if clip:
        m = np.zeros_like(a); x0, y0, x1, y1 = clip; m[y0:y1, x0:x1] = True; a = a & m
    return a


def near(path, P, clip=None, q=2):
    a = mask(path, clip); ys, xs = np.nonzero(a); d = np.hypot(xs - P[0], ys - P[1])
    k = d <= np.percentile(d, q); return [int(xs[k].mean()), int(ys[k].mean())]


def far_len(path, P, clip=None):
    a = mask(path, clip); ys, xs = np.nonzero(a); return int(np.hypot(xs - P[0], ys - P[1]).max())


def auto_order(ref, files):
    """합친 그림과 비교해서 아래 → 위 차례"""
    def L(p):
        im = Image.open(p).convert('RGBA')
        if im.size != (2400, 2400): im = im.resize((2400, 2400))
        a = np.asarray(im.resize((800, 800), Image.BILINEAR)).astype(float) / 255
        a[:, :, :3] *= a[:, :, 3:4]; return a
    R = L(ref); ims = [L(f) for f in files]
    over = lambda a, b: a + b * (1 - a[:, :, 3:4])
    above = {i: set() for i in range(len(files))}   # above[i] = i 보다 아래에 있어야 하는 것
    for i, j in itertools.combinations(range(len(files)), 2):
        m = (ims[i][:, :, 3] > 0.3) & (ims[j][:, :, 3] > 0.3)
        if m.sum() < 30: continue
        e1 = np.abs(over(ims[i], ims[j]) - R)[m].sum(); e2 = np.abs(over(ims[j], ims[i]) - R)[m].sum()
        if e1 < e2: above[i].add(j)
        else: above[j].add(i)
    out, left = [], list(range(len(files)))
    while left:
        ready = [i for i in left if not (above[i] & set(left))]
        i = ready[0] if ready else left[0]
        out.append(i); left.remove(i)
    return [os.path.basename(files[i]) for i in out]


def P(file, **kw):
    d = {'file': file}; d.update(kw); return d


def flap(amp, ph=0.0, f=2):
    return {'amp': amp, 'phase': ph, 'freq': f}


def twitch(amp, ph=0.0):
    return {'amp': amp, 'phase': ph, 'kind': 'twitch'}


def ears(R, L, rp, lp, follow='머리', layer='head', zr=5, zl=5):
    return [P(R, follow=follow, layer=layer, z=zr, pivot=rp, rot=twitch(9, 0.0)),
            P(L, follow=follow, layer=layer, z=zl, pivot=lp, rot=twitch(-9, 0.18))]


ITEMS = {}


def item(path, desc, parts, **kw):
    cfg = {'설명': desc, 'frames': kw.pop('frames', 24), 'fps': kw.pop('fps', 12), 'parts': parts}
    cfg.update(kw)
    ITEMS[path] = cfg


def wing_fan(folder, segs, root, side, amps, z0=0, f=2, zs=None, bend=4):
    """segs: 안쪽 → 바깥 차례 · side: +1 화면 오른쪽 날개 / -1 왼쪽 날개"""
    out = []
    for k, (s, a) in enumerate(zip(segs, amps)):
        L = far_len(os.path.join(folder, s), root)
        out.append(P(s, layer='back', z=(zs[k] if zs else k) + z0, pivot=root,
                     rot=flap(-side * a, 0.03 * k, f),
                     bend={'anchor': root, 'len': L, 'start': int(L * 0.35), 'amp': -side * bend * (k / max(len(segs) - 1, 1)),
                           'lag': 0.3, 'freq': f, 'pow': 1.3}))
    return out


def far_pt(path, P):
    a = mask(path); ys, xs = np.nonzero(a); d = np.hypot(xs - P[0], ys - P[1])
    k = d >= np.percentile(d, 98); return float(xs[k].mean()), float(ys[k].mean())


def wing_fold(folder, segs, root, side, zs, z0=0, target=62, scale=0.8):
    """새 날개 접었다 펴기 — segs: 안쪽 → 바깥 차례 · side: +1 화면 오른쪽 / -1 왼쪽
    접으면 깃 셋이 모두 어깨 축에서 아래(바깥쪽으로 조금)로 모여 겹침"""
    tgt = target if side > 0 else 180 - target
    out = []
    for k, sg in enumerate(segs):
        fx, fy = far_pt(os.path.join(folder, sg), root)
        cur = float(np.degrees(np.arctan2(fy - root[1], fx - root[0])))
        deg = (tgt - cur + 180) % 360 - 180
        L = far_len(os.path.join(folder, sg), root)
        amp = [9, 15, 22][k]
        out.append(P(sg, layer='back', z=zs[k] + z0, pivot=root,
                     fold={'deg': round(deg, 1), 'scale': scale, 'lag': 0},
                     anim={'날기': {'rot': flap(-side * amp, 0.04 * k, 3),
                                   'bend': {'anchor': root, 'len': L, 'start': int(L * 0.35), 'amp': -side * 5 * k / 2,
                                            'lag': 0.3, 'freq': 3, 'pow': 1.3}}}))
    return out


# 평소: 늘 접음 (걷거나 움직일 때도) · 날기: 다 펴고 펄럭 · 몸은 떠서 날갯짓에 맞춰 오르내림
BIRD_ANIMS = {'평소': {'fold_curve': [[0, 1], [1, 1]], 'frames': 24, 'fps': 12},
              '날기': {'fold_curve': [[0, 0], [1, 0]], 'frames': 24, 'fps': 18, 'bob': 0,
                       'hover': {'dy': -90, 'amp': 14, 'freq': 3, 'phase': 0.5}}}


def build():
    # ---------- 새 동물 ----------
    f = os.path.join(ACC, '뱁새')
    RR, RL = [1160, 1592], [1080, 1592]
    item('acc/뱁새', '뱁새 — 평소(걸을 때도)엔 날개 세 깃을 접어 등 뒤에 붙임 · 날 때는 다 펴고 어깨 뒤 축에서 펄럭(바깥 깃일수록 크게 · 조금 늦게) · 꼬리는 까딱',
         wing_fold(f, ['오른날개3.png', '오른날개2.png', '오른날개1.png'], RR, +1, zs=[2, 0, 1], z0=10)
         + wing_fold(f, ['왼날개 3.png', '왼날개2.png', '왼날개1.png'], RL, -1, zs=[0.5, 1, 0])
         + [P('꼬리.png', layer='back', z=-5, pivot=[1128, 1839], rot=flap(3, 0.3, 2),
              bend={'anchor': [1128, 1839], 'len': 412, 'amp': 5, 'lag': 0.4, 'freq': 2})],
         fold_curve=[[0, 1], [1, 1]], anims=BIRD_ANIMS)
    f = os.path.join(ACC, '참새')
    RR, RL = [1150, 1596], [1066, 1594]
    item('acc/참새', '참새 — 평소(걸을 때도)엔 날개 세 깃을 접어 등 뒤에 붙임 · 날 때는 다 펴고 어깨 뒤 축에서 펄럭(바깥 깃일수록 크게 · 조금 늦게) · 꼬리는 까딱',
         wing_fold(f, ['오른날개 3.png', '오른날개 2.png', '오른날개 1.png'], RR, +1, zs=[0, 1, 0], z0=10)
         + wing_fold(f, ['왼날개3.png', '왼날개 2.png', '왼날개 1.png'], RL, -1, zs=[0, 1, 0])
         + [P('꼬리.png', layer='back', z=-5, pivot=[1154, 1814], rot=flap(3, 0.3, 2),
              bend={'anchor': [1154, 1814], 'len': 493, 'amp': 5, 'lag': 0.4, 'freq': 2})],
         fold_curve=[[0, 1], [1, 1]], anims=BIRD_ANIMS)
    item('acc/담비', '담비 — 꼬리 세 마디가 차례로 따라 흔들림 · 귀는 가끔 파르르',
         [P('꼬리1.png', layer='back', z=1, pivot=[1148, 1807], rot=flap(6, 0.0, 1)),
          P('꼬리2.png', layer='back', z=0, parent='꼬리1', pivot=[1264, 1959], rot=flap(9, 0.08, 1)),
          P('꼬리3.png', layer='back', z=2, parent='꼬리2', pivot=[1424, 1986], rot=flap(12, 0.16, 1))]
         + ears('오른귀.png', '왼귀.png', [1374, 1151], [852, 1094]))
    item('acc/사자', '사자 — 꼬리 네 마디(끝은 술)가 채찍처럼 따라 흔들림 · 귀는 가끔 파르르',
         [P('꼬리1.png', layer='back', z=0, pivot=[1155, 1817], rot=flap(5, 0.0, 1)),
          P('꼬리2.png', layer='back', z=2, parent='꼬리1', pivot=[1213, 1961], rot=flap(7, 0.08, 1)),
          P('꼬리3.png', layer='back', z=1, parent='꼬리2', pivot=[1314, 2086], rot=flap(9, 0.16, 1)),
          P('꼬리4.png', layer='back', z=0, parent='꼬리3', pivot=[1484, 2020], rot=flap(13, 0.24, 1))]
         + ears('오른귀.png', '왼귀.png', [1345, 1103], [901, 1073]))

    # ---------- 늑대잠옷 (의상) ----------
    f = os.path.join(OUT, '늑대잠옷')
    # 차례 (몸 파츠 이름 기준 — 왼쪽 = 화면 오른쪽 · 가까운 쪽):
    #   먼 팔 소매 → 다리 사이 채움 → 오른쪽 다리(파일 「왼발」, 몸통 뒤) → 몸통 → 왼쪽 다리(파일 「오른발」, 몸통 위)
    #   → [맨몸 왼팔] → 왼팔 소매   — 맨몸 왼팔은 잠옷 몸통 위 · 왼팔 소매 밑
    under = ['늑대잠옷_오른팔 2.png', '늑대잠옷_오른팔 1.png', '다리 사이 채움.png', '늑대잠옷_왼발 2.png', '늑대잠옷_왼발 1.png',
             '늑대잠옷_몸통.png', '늑대잠옷_오른발 2.png', '늑대잠옷_오른발 1.png']
    sleeve = ['늑대잠옷_왼팔 2.png', '늑대잠옷_왼팔 1.png']
    fol = {'늑대잠옷_왼발 2.png': '오른쪽 다리2', '늑대잠옷_왼발 1.png': '오른쪽 다리1',
           '늑대잠옷_오른발 2.png': '왼쪽 다리2', '늑대잠옷_오른발 1.png': '왼쪽 다리1',
           '늑대잠옷_오른팔 2.png': '오른팔2', '늑대잠옷_오른팔 1.png': '오른팔1',
           '늑대잠옷_왼팔 2.png': '왼팔2', '늑대잠옷_왼팔 1.png': '왼팔1',
           '다리 사이 채움.png': ['오른쪽 다리2', '왼쪽 다리2']}
    item('outfit/늑대잠옷', '늑대잠옷 — 꼬리 세 마디(3 뿌리 → 2 → 1 끝)가 살랑 · 귀(후드)는 가끔 파르르 · 걸을 때는 기우뚱 없이 다리만 번갈아 내딛고, 두 다리 사이는 같은 색(다리 사이 채움)으로 이어 벌어져도 티가 안 남 · 다리 · 팔 뿌리는 몸통에 붙은 채 끝만 움직여 옷 · 바지 이음새가 안 벌어짐 · 오른쪽 다리는 몸통 뒤, 왼쪽 다리는 몸통 위 · 맨몸 왼팔은 잠옷 몸통 위 · 왼팔 소매 밑 · 나머지는 몸 파츠를 따라감 '
         '(받은 이름의 오른발 · 왼발은 화면 오른쪽 · 왼쪽 — 몸 파츠로는 왼쪽 다리 · 오른쪽 다리)',
         [P('늑대잠옷_꼬리 3.png', name='꼬리3', layer='back', z=0, pivot=[1279, 1849], rot=flap(6, 0.0, 1),
            anim={'걷기': {'rot': flap(7, 0.05, 2)}}),
          P('늑대잠옷_꼬리 2.png', name='꼬리2', layer='back', z=1, parent='꼬리3', pivot=[1478, 1850], rot=flap(9, 0.08, 1),
            anim={'걷기': {'rot': flap(10, 0.13, 2)}}),
          P('늑대잠옷_꼬리 1.png', name='꼬리1', layer='back', z=2, parent='꼬리2', pivot=[1643, 1776], rot=flap(12, 0.16, 1),
            anim={'걷기': {'rot': flap(13, 0.21, 2)}}),
          P('늑대잠옷_머리 뒤.png', follow='머리', layer='body', z=0)]
         + [P(c, follow=fol.get(c, '몸통'), layer='body', z=1 + i) for i, c in enumerate(under)]
         + [P(c, follow=fol.get(c, '몸통'), layer='neck', z=1 + i) for i, c in enumerate(sleeve)]
         + [P('늑대잠옷_왼귀.png', follow='머리', layer='head', z=0, pivot=[966, 924], rot=twitch(-8, 0.18)),
            P('늑대잠옷_머리.png', follow='머리', layer='head', z=1),
            P('늑대잠옷_오른귀.png', follow='머리', layer='head', z=2, pivot=[1340, 908], rot=twitch(8, 0.0))],
         anims={'평소': {},
                '걷기': {'frames': 16, 'fps': 16, 'bob': 0,
                         'walk': {'sway': 0, 'pivot': [1110, 2200], 'bounce': 6, 'lift': 22, 'stride': 20, 'arm': 10, 'legs_one': True,
                                  'shoulder': {'오른팔': [1050, 1585], '왼팔': [1195, 1590]}},
                         'skin': {'legs': {'from': 1880, 'to': 2110}, 'arms': {'r0': 40, 'r1': 190}}}})

    # ---------- 전에 받은 동물 · 날개 ----------
    item('acc/가나디', '가나디 — 꼬리는 빠르게 살랑살랑(뿌리 축 + 휨) · 귀는 가끔 파르르',
         [P('가나디 꼬리.png', layer='back', pivot=[1154, 1807], rot=flap(12, 0, 2),
            bend={'anchor': [1154, 1807], 'len': 478, 'amp': 8, 'lag': 0.35, 'freq': 2})]
         + ears('가나디 오른쪽 귀.png', '가나디 왼쪽 귀.png', [1316, 1143], [901, 1033]))
    item('acc/호랑이', '호랑이 — 꼬리는 느긋하게 휘며 흔들림(끝으로 갈수록 늦게) · 귀는 가끔 파르르',
         [P('호랑이 꼬리.png', layer='back', pivot=[1147, 1803], rot=flap(4, 0, 1),
            bend={'anchor': [1147, 1803], 'len': 461, 'amp': 12, 'lag': 0.6, 'freq': 1})]
         + ears('호랑이 귀 오.png', '호랑이 귀 왼.png', [1338, 1097], [901, 1056]))
    for n, horns in (('악마 1', ['소악마 뿔.png']), ('악마 2', ['악마 오른뿔.png', '악마 왼뿔.png']),
                     ('악마 3', ['서큐버스 오른뿔.png', '서큐버스 왼뿔.png'])):
        item('acc/' + n, n + ' — 박쥐 날개는 어깨 뒤 축에서 천천히 퍼덕 · 꼬리는 채찍처럼 휨 · 뿔은 머리에 붙음',
             [P('악마 오른 날개.png', layer='back', z=1, pivot=[1163, 1589], rot=flap(-12, 0, 1),
                bend={'anchor': [1163, 1589], 'len': 334, 'start': 100, 'amp': -4, 'lag': 0.3, 'freq': 1}),
              P('악마 왼날개.png', layer='back', z=0, pivot=[1049, 1587], rot=flap(12, 0, 1),
                bend={'anchor': [1049, 1587], 'len': 342, 'start': 100, 'amp': 4, 'lag': 0.3, 'freq': 1}),
              P('악마 꼬리.png', layer='back', z=-1, pivot=[1163, 1839], rot=flap(4, 0, 1),
                bend={'anchor': [1163, 1839], 'len': 456, 'amp': 14, 'lag': 0.7, 'freq': 1})]
             + [P(h, follow='머리', layer='head', z=3) for h in horns])
    f = os.path.join(ACC, '천사 1', '천사 날개.png')
    lr = near(f, (1137, 1600), clip=(0, 0, 1137, 2400)); rr = near(f, (1137, 1600), clip=(1137, 0, 2400, 2400))
    item('acc/천사 1', '천사 1 — 한 장에 그려진 두 날개를 가운데에서 나눠 따로 파닥 · 천사링은 머리 위에서 둥실',
         [P('천사 날개.png', name='왼날개', clip=[0, 0, 1137, 2400], layer='back', pivot=lr, rot=flap(10, 0, 2)),
          P('천사 날개.png', name='오른날개', clip=[1137, 0, 2400, 2400], layer='back', pivot=rr, rot=flap(-10, 0, 2)),
          P('천사링.png', follow='머리', layer='front', move={'dy': 14, 'freq': 1})])
    item('acc/천사 2', '천사 2(타천사) — 늘어진 날개 안 · 겉 두 겹이 어깨 뒤 축에서 천천히 들썩(겉이 조금 늦게) · 헤일로 둥실',
         [P('타천사 오른쪽 날개 - 안.png', name='오른안', layer='back', z=10, pivot=[1157, 1604], rot=flap(-6, 0, 1)),
          P('타천사 오른쪽 날개 - 겉.png', name='오른겉', layer='back', z=11, parent='오른안', pivot=[1279, 1564], rot=flap(-3, 0.08, 1)),
          P('타천사 왼쪽 날개 - 안.png', name='왼안', layer='back', z=0, pivot=[1048, 1609], rot=flap(6, 0, 1)),
          P('타천사 왼쪽 날개 - 겉.png', name='왼겉', layer='back', z=1, parent='왼안', pivot=[904, 1554], rot=flap(3, 0.08, 1)),
          P('타천사 헤일로.png', follow='머리', layer='front', move={'dy': 12, 'freq': 1})])
    item('acc/천사 3', '천사 3 — 등 날개 안 · 겉 두 겹이 들썩 · 얼굴 옆 머리 날개는 움직이지 않고 머리만 따라감(얼굴보다 위) · 깨진 헤일로 둥실',
         [P('천사 오른쪽 날개 - 안.png', name='오른안', layer='back', z=10, pivot=[1169, 1597], rot=flap(-6, 0, 1)),
          P('천사 오른쪽 날개 - 겉.png', name='오른겉', layer='back', z=11, parent='오른안', pivot=[1323, 1618], rot=flap(-3, 0.08, 1)),
          P('천사 왼쪽 날개 - 안.png', name='왼안', layer='back', z=0, pivot=[1040, 1596], rot=flap(6, 0, 1)),
          P('천사 왼쪽 날개 - 겉.png', name='왼겉', layer='back', z=1, parent='왼안', pivot=[865, 1594], rot=flap(3, 0.08, 1)),
          P('천사 머리 날개 - 아래.png', follow='머리', layer='back', z=20),
          P('천사 머리 날개 - 위.png', follow='머리', layer='head', z=21),
          P('천사 깨진 헤일로.png', follow='머리', layer='front', move={'dy': 12, 'freq': 1})])
    item('acc/요정 날개', '요정 날개 — 큰 날개(위) · 작은 날개(아래)를 한 벌로 붙여 어깨 뒤 축에서 같이 파르르 (작은 날개가 조금 늦게) · 큰 날개1 오른쪽 위 반짝이 점은 그대로',
         [P('큰 날개1.png', name='큰왼', clip=[0, 1200, 1160, 2400], layer='back', z=0, pivot=[1091, 1625], rot=flap(9, 0, 3)),
          P('큰 날개1.png', name='반짝이', clip=[1160, 0, 2400, 1200], layer='back', z=0),
          P('큰 날개2.png', name='큰오른', layer='back', z=0, pivot=[1150, 1629], rot=flap(-9, 0, 3)),
          P('작은 날개1.png', name='작은왼', layer='back', z=1, pivot=[1096, 1658], rot=flap(7, 0.06, 3)),
          P('작은 날개2.png', name='작은오른', layer='back', z=1, pivot=[1137, 1660], rot=flap(-7, 0.06, 3))])
    item('acc/롭이어', '롭이어 — 한 장 그림을 왼귀 · 오른귀 · 꼬리로 나눠, 늘어진 귀는 머리에 붙은 채 흔들 · 꼬리는 통통',
         [P('롭이어.png', name='왼귀', clip=[0, 0, 1100, 1800], follow='머리', layer='head', pivot=[897, 905], rot=flap(3, 0, 1),
            bend={'anchor': [897, 905], 'len': 800, 'start': 150, 'amp': 4, 'lag': 0.4, 'freq': 1}),
          P('롭이어.png', name='오른귀', clip=[1100, 0, 2400, 1800], follow='머리', layer='head', pivot=[1265, 918], rot=flap(-3, 0.1, 1),
            bend={'anchor': [1265, 918], 'len': 800, 'start': 150, 'amp': -4, 'lag': 0.4, 'freq': 1}),
          P('롭이어.png', name='꼬리', clip=[0, 1800, 2400, 2400], layer='back', move={'dy': 6, 'freq': 2})])
    item('acc/돌고래', '돌고래 — 꼬리처럼 뿌리 축에서 휘며 흔들림',
         [P('돌고래.png', layer='back', pivot=[1150, 1800], rot=flap(4, 0, 1),
            bend={'anchor': [1150, 1800], 'len': 583, 'amp': 10, 'lag': 0.5, 'freq': 1})])

    # ---------- 매달린 것 · 천 ----------
    stick = [[662, 1636], [676, 1626], [972, 1836], [958, 1850]]
    item('acc/등불', '등불 (피드백 수정본으로 바꿈) — 막대는 손에 그대로, 초롱은 끈 매듭을 축으로 흔들 · 빛은 초롱을 따라가며 일렁',
         [P('등불-빛.png', name='빛', layer='back', z=0, pivot=[704, 1672], rot=flap(7, 0, 1), glow={'amp': 0.3, 'freq': 3}),
          P('등불-본체.png', name='초롱', cut=stick, layer='back', z=1, pivot=[704, 1672], rot=flap(7, 0, 1)),
          P('등불-본체.png', name='막대', keep=stick, layer='back', z=2)])
    item('acc/마패', '마패 — 매듭을 축으로 흔들', [P('마패.png', layer='front', pivot=[1245, 1693], rot=flap(6, 0, 1))])
    item('acc/크로스백', '크로스백 — 어깨끈 위쪽은 고정 · 아래로 갈수록 가방이 살짝 흔들 · 가방은 몸통 위, 왼팔(가까운 팔) 아래',
         [P('크로스백 뒷레이어.png', layer='back'),
          P('크로스백.png', layer='body', bend={'anchor': [1010, 1550], 'start': 280, 'len': 650, 'amp': 3, 'pow': 1.5, 'lag': 0.2, 'freq': 1})])
    item('acc/노리개', '노리개 — 윗부분 → 중간 → 술 세 마디가 차례로 흔들',
         [P('노리개 윗부분.png', name='윗', layer='front', pivot=[1125, 1786], rot=flap(3, 0, 1)),
          P('노리개 중간.png', name='중', layer='front', parent='윗', pivot=[1131, 1845], rot=flap(4, 0.08, 1)),
          P('노리개 아랫부분 술.png', name='술', layer='front', parent='중', pivot=[1148, 1899], rot=flap(6, 0.16, 1))])
    for col, knot, fol, lay in (('빨강', [1115, 1605], '몸통', 'front'), ('검정', [1355, 809], '머리', 'back')):
        nt = '(꼬리 없음)' if col == '빨강' else '(꼬리없음)'
        b = {'anchor': knot, 'start': 100, 'len': 650, 'amp': 5, 'lag': 0.5, 'pow': 1.2, 'freq': 1, 'still': f'리본 {col}{nt}.png'}
        item('acc/리본 ' + col, f'리본 {col} — 매듭과 고리는 그대로, 늘어진 꼬리만 살랑 (꼬리 앞 · 꼬리 뒤 둘 다 같은 리깅)',
             [P(f'리본 {col}(꼬리 앞).png', follow=fol, layer=lay, bend=b),
              P(f'리본 {col}(꼬리 뒤).png', follow=fol, layer=lay, bend=b, variant='꼬리 뒤')],
             preview_variant=None)
    item('acc/목도리', '목도리 — 목에 감긴 부분(하)은 그대로, 늘어진 두 자락(상 · 중)이 살랑',
         [P('목도리(중).png', layer='neck', z=0, bend={'anchor': [1235, 1500], 'start': 20, 'len': 350, 'amp': 4, 'lag': 0.4, 'pow': 1.2, 'freq': 1, 'phase': 0.1}),
          P('목도리(하).png', layer='neck', z=1),
          P('목도리(상).png', layer='neck', z=2, bend={'anchor': [1240, 1492], 'start': 20, 'len': 300, 'amp': 4, 'lag': 0.4, 'pow': 1.2, 'freq': 1})])
    for n, fb, ff, anc, st, L in (('베일', '베일 뒷면.png', '베일 앞면.png', [1120, 760], 450, 1400),
                                   ('수녀복 베일', '수녀복 베일_뒷면.png', '수녀복 베일.png', [1100, 760], 380, 1000)):
        b = {'anchor': anc, 'start': st, 'len': L, 'amp': 1.6, 'lag': 0.4, 'pow': 1.5, 'freq': 1, 'dir': 90, 'width': 100}
        item('acc/' + n, n + ' — 머리에 붙은 윗부분은 그대로, 아래 자락이 하늘하늘',
             [P(fb, follow='머리', layer='back', bend=b), P(ff, follow='머리', layer='head', bend=b)])
    item('acc/곰방대', '곰방대 — 대는 입에 그대로, 술이 대롱대롱',
         [P('곰방대.png', follow='머리', layer='head', z=0),
          P('곰방대 술.png', follow='머리', layer='head', z=1, pivot=[832, 1600], rot=flap(7, 0, 1))])
    item('acc/작두', '작두 — 날은 그대로, 손잡이 끝 술과 무령 · 옥패가 대롱대롱',
         [P('작두 본체.png', layer='front', z=0),
          P('작두 술.png', layer='front', z=1, pivot=[1825, 1320], rot=flap(3, 0, 1),
            bend={'anchor': [1825, 1320], 'len': 720, 'start': 60, 'amp': 3, 'lag': 0.4, 'freq': 1}),
          P('작두 무령+ 옥패.png', layer='front', z=2, pivot=[1819, 885], rot=flap(6, 0.1, 1))])
    item('acc/목줄', '목줄 — 목줄은 목에, 리드줄은 고리부터 아래로 흔들',
         [P('목줄.png', layer='neck', z=0),
          P('리드줄.png', layer='front', bend={'anchor': [1168, 1595], 'start': 20, 'len': 700, 'amp': 5, 'lag': 0.5, 'pow': 1.1, 'freq': 1})])
    item('acc/담배', '담배 — 연기가 끝에서부터 굽이치며 피어오르고 옅어졌다 짙어짐',
         [P('담배 연기.png', follow='머리', layer='head', z=0, bend={'anchor': [895, 1487], 'len': 650, 'amp': 8, 'lag': 1.0, 'pow': 1.2, 'freq': 1},
            glow={'amp': 0.35, 'freq': 1}),
          P('담배.png', follow='머리', layer='head', z=1)])
    b = {'anchor': [1160, 920], 'start': 120, 'len': 550, 'amp': 3, 'lag': 0.6, 'pow': 1.3, 'freq': 2}
    item('acc/부적', '부적 — 붙은 윗부분은 그대로, 아래 끝이 팔랑 (부적1 · 부적2 · 소원성취 셋 다 같은 리깅)',
         [P('부적1.png', follow='머리', layer='head', bend=b),
          P('부적2.png', follow='머리', layer='head', bend=b, variant='부적2'),
          P('소원성취.png', follow='머리', layer='head', bend=b, variant='소원성취')])
    item('acc/지나가버린어린시절에', '풍선 — 손에 쥔 줄 끝은 그대로, 풍선이 둥실둥실 흔들',
         [P('지나가버린어린시절에.png', layer='front', bend={'anchor': [1218, 1845], 'len': 1050, 'amp': 4, 'lag': 0.3, 'pow': 0.8, 'freq': 1})])

    # ---------- 의상 속 망토 · 고름 · 노리개 ----------
    f = os.path.join(OUT, '눈꽃 망토')
    cape = {'anchor': [1094, 1560], 'start': 40, 'len': 560, 'amp': 2.5, 'lag': 0.5, 'pow': 1.3, 'freq': 1, 'dir': 90, 'width': 110}
    item('outfit/눈꽃 망토', '눈꽃 망토 (임시 이름) — 망토 앞 · 뒷자락이 목을 축으로 하늘하늘 · 참은 대롱대롱 · 나머지는 몸 파츠를 따라감',
         [P('망토 뒷면.png', layer='back', bend=cape),
          P('하의 오른다리.png', follow='오른쪽 다리2', layer='neck', z=1), P('부츠 오른다리.png', follow='오른쪽 다리1', layer='neck', z=2),
          P('상의 오른팔2.png', follow='오른팔2', layer='neck', z=3), P('상의 오른팔1.png', follow='오른팔1', layer='neck', z=4),
          P('하의 왼다리2.png', follow='왼쪽 다리2', layer='neck', z=5), P('부츠 왼다리.png', follow='왼쪽 다리1', layer='neck', z=6),
          P('하의 몸통.png', layer='neck', z=7), P('상의 몸통.png', layer='neck', z=8),
          P('상의 왼팔2.png', follow='왼팔2', layer='neck', z=9), P('상의 왼팔1.png', follow='왼팔1', layer='neck', z=10),
          P('망토 앞면.png', layer='neck', z=11, bend=cape), P('망토 목 파츠.png', layer='neck', z=12),
          P('망토 참.png', layer='neck', z=13, pivot=[1185, 1640], rot=flap(6, 0.1, 1)),
          P('모자.png', follow='머리', layer='head')])
    for n, cfile, anc in (('흰 제복 망토', ['망토뒤', '망토앞'], None), ('보라 드레스', ['망토뒤'], None)):
        d = os.path.join(OUT, n)
        order = json.load(open(os.path.join(d, '입히기 설정.json'), encoding='utf-8'))['order']
        parts = []
        for i, o in enumerate(order):
            fp = os.path.join(d, o + '.png')
            kw = {'follow': o if (o.startswith('오른') or o.startswith('왼')) else '몸통', 'layer': 'neck', 'z': i}
            if o in cfile:
                top = near(fp, (1110, 1400))
                kw['bend'] = {'anchor': top, 'start': 30, 'len': far_len(fp, top), 'amp': 3, 'lag': 0.5, 'pow': 1.3, 'freq': 1}
                if o == '망토뒤':
                    kw['layer'] = 'back'
            parts.append(P(o + '.png', **kw))
        item('outfit/' + n, n + ' — 망토 자락이 어깨를 축으로 하늘하늘 · 나머지는 몸 파츠를 따라감', parts)
    d = os.path.join(OUT, '두루마기')
    fl = [x for x in os.listdir(d) if x.endswith('.png') and '전체샷' not in x]
    order = auto_order(os.path.join(d, '두루마기 only 전체샷.png'), [os.path.join(d, x) for x in fl])
    parts = []
    for i, o in enumerate(order):
        kw = {'layer': 'neck', 'z': i}
        if '팔' in o or '소매' in o:   # 받은 이름의 오른쪽 · 왼쪽 = 화면 오른쪽 · 왼쪽 → 몸 파츠로는 왼팔 · 오른팔
            kw['follow'] = ('왼팔' if '오른쪽' in o else '오른팔') + ('2' if '윗팔' in o else '1')
        if o == '두루마기 안감.png':          # 안쪽 천은 몸 뒤로
            kw['layer'] = 'back'
        if o == '두루마기 오른쪽 고름.png':
            kw['bend'] = {'anchor': [1136, 1750], 'start': 20, 'len': 450, 'amp': 5, 'lag': 0.5, 'pow': 1.2, 'freq': 1}
        if o == '두루마기 왼쪽 고름.png':
            kw['bend'] = {'anchor': [945, 1727], 'start': 20, 'len': 420, 'amp': 5, 'lag': 0.5, 'pow': 1.2, 'freq': 1, 'phase': 0.15}
        parts.append(P(o, **kw))
    item('outfit/두루마기', '두루마기 — 고름 두 가닥이 살랑 · 나머지는 몸 파츠를 따라감 (차례는 「두루마기 only 전체샷」 과 맞춤)', parts)
    d = os.path.join(OUT, '하늘 배자 한복')
    fl = [x for x in os.listdir(d) if x.endswith('.png') and x != '합친 모습.png']
    order = auto_order(os.path.join(d, '합친 모습.png'), [os.path.join(d, x) for x in fl])
    parts = []
    for i, o in enumerate(order):
        n = o[:-4]
        kw = {'layer': 'neck', 'z': i, 'follow': n if (n.startswith('오른') or n.startswith('왼')) else '몸통'}
        if n == '노리개':
            kw['bend'] = {'anchor': [1129, 1705], 'start': 20, 'len': 400, 'amp': 6, 'lag': 0.3, 'pow': 0, 'freq': 1, 'dir': 90, 'width': 60}
        parts.append(P(o, **kw))
    item('outfit/하늘 배자 한복', '하늘 배자 한복 (임시 이름) — 노리개가 대롱대롱 · 나머지는 몸 파츠를 따라감', parts)

    # ---------- 붙어만 있는 것 (흔들 곳 없음 — 따라가는 몸 파츠만) ----------
    item('acc/헤드폰', '헤드폰 — 움직이는 곳 없음 · 머리를 따라감 (오 = 머리 앞, 왼 = 머리 뒤)',
         [P('헤드폰 왼.png', follow='머리', layer='back'), P('헤드폰 오.png', follow='머리', layer='head')], still=True)
    item('acc/검역용 볼트', '검역용 볼트 — 움직이는 곳 없음 · 머리를 따라감', [P('검역용 볼트.png', follow='머리', layer='head')], still=True)
    item('acc/연지곤지', '연지곤지 — 움직이는 곳 없음 · 얼굴(머리)을 따라감', [P('연지곤지.png', follow='머리', layer='head')], still=True)
    item('acc/흉터', '흉터 (800 칸 그대로) — 움직이는 곳 없음 · 얼굴(머리)을 따라감', [P('흉터.png', follow='머리', layer='head')], still=True)
    for n in ('사운드 신발', '제작자 신발'):
        item('outfit/' + n, n + ' — 움직이는 곳 없음 · 다리1(종아리)을 따라감',
             [P(f'{n} 오른다리.png', follow='오른쪽 다리1', layer='neck'), P(f'{n} 왼다리.png', follow='왼쪽 다리1', layer='neck')], still=True)


if __name__ == '__main__':
    build()
    for path, cfg in ITEMS.items():
        fp = os.path.join(RIG, path, '리깅.json')
        for p in cfg['parts']:
            assert os.path.exists(os.path.join(RIG, path, p['file'])), (path, p['file'])
        json.dump(cfg, open(fp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('wrote', path, len(cfg['parts']))
