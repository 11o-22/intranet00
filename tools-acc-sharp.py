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
#   ac14 롭이어 토끼 : 귀가 어깨까지 내려와 있었다. 귀뿌리가 머리 꼭대기에
#   오도록 **열여섯 도트(64픽셀)** 올린다.
FIX = {
    'ac14': (0, -64),   # 롭이어 토끼 — 귀가 어깨까지 내려와 있었다
    'ac04': (0,  -8),   # 곰방대 — 턱 밑에 물려 있었다. 입술에 맞춘다
    'ac33': (0,  -8),   # 안대 — 눈을 반만 가렸다. 한 눈을 덮게 올린다
    'ac15': (0, -24),   # 리본 (검정) — 뺨 옆에 달려 있었다. 머리에 맨 것으로
    'ac10': (0,  -4),   # 담배 — 입술보다 네 칸 아래로 처져 있었다
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
