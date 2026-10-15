# 악세를 **도트 눈금에 맞춰** 또렷하게 만든다.
#
#   받은 그림은 칸 크기는 맞는데 **한 픽셀 단위**로 그려져 있었다.
#   사람 그림은 도트 한 칸이 4픽셀이라, 나란히 놓으면 악세만 잘게 흩어져
#   흐릿해 보인다. 그래서 4x4 덩어리마다 한 색으로 눌러 준다.
#
#   눈금의 자리까지 맞춘다 — 사람 그림은 가로로 x≡2(mod 4), 세로로
#   y≡0(mod 4) 에서 색이 바뀐다. 옮길 때 가로 +104 · 세로 +106 이므로
#   **원본에서는 (2,2) 에서 시작하는 눈금**이어야 맞아 떨어진다.
from PIL import Image
import numpy as np, os, json
from collections import Counter

DX, DY = 104, 106

# ★ 그림 자체가 어긋나게 그려져 온 것 — 칸마다 따로 올리고 내린다.
FIX = {
    # 🐰 롭이어 토끼 — **귀 밑에 붙어야 한다.**
    #   머리 그림의 귀는 세로 144~180 에 있고(h12 처럼 귀가 보이는 머리로 쟀다),
    #   받은 그림은 귀뿌리가 188 에서 시작해 **턱보다 아래**였다. 그래서 귀가
    #   머리에 안 붙고 어깨에 얹힌 것처럼 보였다. 세 도트(12픽셀) 올려
    #   귀뿌리를 176 에 두면 귀 밑에 딱 닿는다.
    #   ✗ (0, -64) — 머리 꼭대기까지 올려 봤다가 도로 내렸다. 귀뿌리가 정수리에
    #     붙으니 긴 귀가 얼굴을 통째로 덮었다.
    #   ✗ (0, -16) 이상 — 귀뿌리가 귀를 지나 뺨을 가린다.
    'ac14': (0, -12),
    # 🧣 목도리 — 턱 밑에 목이 한 도트 비어 보였다. 네 픽셀 올려 목에 붙인다.
    #   ✗ -8 이상은 턱을 먹는다.
    'ac18': (0,  -4),
    'ac25': (0, -16),   # 부채 — 손보다 아래에 매달려 있었다. 손에 쥐게 올린다
    'ac04': (0,  -8),   # 곰방대 — 턱 밑에 물려 있었다. 입술에 맞춘다
    'ac33': (0,  -8),   # 안대 — 눈을 반만 가렸다. 한 눈을 덮게 올린다
    'ac15': (0, -24),   # 리본 (검정) — 뺨 옆에 달려 있었다. 머리에 맨 것으로
    'ac10': (0,  -4),   # 담배 — 입술보다 네 칸 아래로 처져 있었다

    # ── 2026-10-15 다시 훑어 본 것 ──────────────────────────────
    #   마흔아홉 장을 한 판에 늘어놓고, 다는 자리(머리·귀·얼굴·목·손·등)마다
    #   어느 높이에 있어야 하는지를 몸·머리에서 재어 견주었다.
    #
    #       귀  144~180   눈 168~175   입·턱 180~188   목 192
    #       어깨 200~212   손 256~268   발바닥 351
    #
    #   그 띠를 벗어난 것만 손댔다. 나머지 마흔넷은 제자리였다.
    'ac02': (0,  12),   # 검역용 볼트 — 관자놀이에 걸려 있었다(가운데 149). 귀 높이로 내린다
    'ac17': (24, 44),   # 마패 — 가슴 한복판에 떠 있었다. 오른손에 쥐게 내린다 (부적과 같은 자리)
    'ac23': (8,  -4),   # 볼터치 — 뺨을 벗어나 머리카락 위에 찍혀 있었다. 뺨 위로
    'ac29': (0, -48),   # 스마일 스티커 — 가슴(220~247)에 붙어 있었다. 뺨으로 올린다
    # 지사 스티커 — 쇄골(204~223)에 붙어 있었다. 뺨으로 올린다.
    #   가로도 8 왼쪽으로 — 그냥 올리면 오른쪽 머리카락이 반을 가린다
    'ac41': (-8, -32),
}
PX, PY = 2, 2           # 원본 눈금 시작 자리
KEEP = 0.50             # 덩어리의 절반은 차야 남긴다 (덜 차면 버린다 — 안 그러면 얇은 선이 뭉개져 뭉텅이가 된다)

def snap(im):
    a = np.asarray(im).astype(np.int32)
    h, w, _ = a.shape
    out = np.zeros_like(a)
    for by in range(-PY, h, 4):
        for bx in range(-PX, w, 4):
            y0, y1 = max(0, by), min(h, by + 4)
            x0, x1 = max(0, bx), min(w, bx + 4)
            if y0 >= y1 or x0 >= x1: continue
            blk = a[y0:y1, x0:x1].reshape(-1, 4)
            cov = blk[:, 3].mean() / 255.0
            if cov < KEEP: continue
            on = blk[blk[:, 3] >= 64]
            if not len(on): on = blk[blk[:, 3] > 0]
            if not len(on): continue
            c = Counter(map(tuple, on[:, :3].tolist()))
            rgb = c.most_common(1)[0][0]
            al = int(on[:, 3].max())          # 일부러 덜 비치게 그린 것은 그대로 둔다
            out[y0:y1, x0:x1] = (rgb[0], rgb[1], rgb[2], al)
    return Image.fromarray(out.astype(np.uint8))

os.makedirs('out2', exist_ok=True)
names = sorted(f[:-4] for f in os.listdir('raw') if f.endswith('.png'))
for k, n in enumerate(names):
    pid = 'ac%02d' % (k + 1)
    if pid == 'ac21': continue                 # 베일은 새 그림(dot/veil.png)을 쓴다
    im = Image.open(os.path.join('raw', n + '.png')).convert('RGBA')
    if im.size == (3456, 2048):
        im = Image.fromarray(np.asarray(im)[0::4, 0::4])
    im = snap(im)
    out = Image.new('RGBA', (2112, 768), (0, 0, 0, 0))
    for r in range(2):
        for c in range(6):
            fx, fy = FIX.get(pid, (0, 0))
            out.paste(im.crop((c*144, r*256, (c+1)*144, (r+1)*256)),
                      (c*352 + DX + fx, r*384 + DY + fy))
    out.save('out2/' + pid + '.png')
print('또렷하게 만든 장', len(os.listdir('out2')))
