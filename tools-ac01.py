#!/usr/bin/env python3
# ==========================================
# 🦊 가나디(ac01) — 귀와 꼬리를 주신 그림 자리로 되돌린다
# ==========================================
#
# ■ 무슨 일이 있었나
#
#   가나디는 **귀 둘과 꼬리 하나**가 한 장에 든 악세다. 처음 넣을 때
#   악세 규격(864x512 · 칸 144x256)으로 치고 가로 +104 · 세로 +106 으로
#   옮겼는데, 주신 그림은 **의상 규격(216x128 · 칸 36x64)** 이었다.
#   거기에 악세 또렷하게 만들기(tools-acc-sharp.py)가 한 번 더 지나가면서
#   4픽셀 눈금에 맞춘다고 얇은 가장자리를 깎아, 자리도 한 도트씩 밀리고
#   모양도 야위었다.
#
#       지금      귀 x 122~189 · y 124~155   꼬리 x 198~247 · y 216~295
#       주신 그림 귀 x 118~193 · y 116~147   꼬리 x 194~245 · y 212~287
#
# ■ 어떻게 고치나
#
#   주신 216x128 그림은 **한 픽셀이 그대로 한 도트**다. 네 배로 늘리면
#   4픽셀 눈금에 저절로 딱 맞으므로, 또렷하게 만들기를 아예 안 거친다.
#   의상과 같은 자리(가로 +102 · 세로 +100)에 놓으면 몸과 맞는다 —
#   그림 속 사람의 발바닥이 몸 발바닥(y 351)과, 머리 위가 몸 머리 위
#   (y 116)와 같아진다.
#
#   그림에는 **몸도 같이 그려져 있다.** 살색 몸은 버리고 주황빛 귀·꼬리만
#   남긴다 (초록과 파랑 차이가 크면 주황이다 — 살색은 둘이 거의 같다).
#
#   ★ 색은 **쓰던 ac01 의 두 가지를 그대로 쓴다.** 주신 그림이 jpg 라
#     가장자리마다 색이 번져 있어서, 그대로 쓰면 도트가 지저분해진다.
#     밝은 쪽 (255,191,136) · 어두운 쪽 (218,132,89) 두 가지뿐이다.
#
# ■ 쓰기
#       python3 tools-ac01.py            dot/ac01.png 를 새로 쓴다
#       python3 tools-ac01.py --dry      쓰지 않고 자리만 알려 준다

import sys
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = '/root/.claude/uploads/eb30d633-08e6-55cf-ba6d-ed9f799a677c/f03a45fa-image.jpg'
OUT = 'dot/ac01.png'

CW, CH = 36, 64            # 주신 그림의 칸
K = 4                      # 도트 하나가 네 픽셀
OX, OY = 102, 100          # 의상과 같은 자리
W, H = 352, 384            # 쓰는 칸
SHEET = (2112, 768)

LIGHT = (255, 191, 136)    # 쓰던 ac01 의 밝은 쪽
DARK = (218, 132, 89)      # 어두운 쪽

# 주황인가 — 초록과 파랑 차이로 가른다 (살색은 둘이 거의 같다).
#   22 로 잡으면 주신 그림과 같은 두께가 나온다. 더 올리면 꼬리가 야위고,
#   더 내리면 살색 테두리에 묻은 jpg 번짐까지 딸려 온다.
TAN_GB = 22
# jpg 번짐으로 생긴 **외톨이 점**을 버린다 (칸 경계 너머로 묻어 온 꼬리 끝 따위)
MIN_DOT = 6
# 밝은 쪽인가 어두운 쪽인가
LIGHT_R = 214


def main():
    dry = '--dry' in sys.argv
    ref = np.array(Image.open(SRC).convert('RGB')).astype(int)
    if ref.shape[:2] != (CH * 2, CW * 6):
        print('그림 크기가 %dx%d 가 아닙니다: %s' % (CW * 6, CH * 2, ref.shape))
        return 1

    r, g, b = ref[..., 0], ref[..., 1], ref[..., 2]
    tan = (g - b > TAN_GB) & (r > 100)
    light = tan & (r >= LIGHT_R)

    # ★ 서기 줄(row 1)은 **여섯 칸이 같은 그림**이다. 그런데 jpg 번짐 탓에
    #   칸마다 가장자리 한 도트가 들쭉날쭉했다 (어떤 칸은 귀가 y 116 에서,
    #   어떤 칸은 120 에서 시작했다). 여섯 칸을 맞대어 **넷 이상에서 켜진
    #   도트만** 남겨 하나로 모은다 — 번짐은 떨어져 나가고 그림만 남는다.
    def vote(mask, row):
        six = [mask[row * CH:(row + 1) * CH, c * CW:(c + 1) * CW] for c in range(6)]
        return (np.sum(six, axis=0) >= 4)
    stand_t, stand_l = vote(tan, 1), vote(light, 1)

    out = np.zeros((SHEET[1], SHEET[0], 4), np.uint8)
    for row in range(2):
        for col in range(6):
            if row == 1:
                t = stand_t.copy()
                light_cell = stand_l
            else:
                t = tan[row * CH:(row + 1) * CH, col * CW:(col + 1) * CW].copy()
                light_cell = light[row * CH:(row + 1) * CH, col * CW:(col + 1) * CW]
            lab, n = ndimage.label(t)
            for v in range(1, n + 1):
                if (lab == v).sum() < MIN_DOT:
                    t[lab == v] = False
            l = light_cell & t
            big = np.kron(t, np.ones((K, K), bool))
            bigl = np.kron(l, np.ones((K, K), bool))
            cell = np.zeros((CH * K, CW * K, 4), np.uint8)
            cell[big & bigl] = (*LIGHT, 255)
            cell[big & ~bigl] = (*DARK, 255)
            y0, x0 = row * H + OY, col * W + OX
            out[y0:y0 + CH * K, x0:x0 + CW * K] = cell
            if row == 1 and col == 0:
                ys, xs = np.where(big)
                print('서기 첫 칸 — 가로 %d~%d · 세로 %d~%d · 도트 %d개'
                      % (x0 + xs.min(), x0 + xs.max(), y0 + ys.min(), y0 + ys.max(), t.sum()))

    m = out[..., 3] > 0
    print('칸마다:')
    for row in range(2):
        for col in range(6):
            c = m[row * H:(row + 1) * H, col * W:(col + 1) * W]
            ys, xs = np.where(c)
            print('  r%d c%d  x %d-%d  y %d-%d  %d px'
                  % (row, col, xs.min(), xs.max(), ys.min(), ys.max(), c.sum()))

    if dry:
        print('(--dry 라 쓰지 않았습니다)')
        return 0
    Image.fromarray(out).save(OUT)
    print('썼습니다 — ' + OUT)
    return 0


if __name__ == '__main__':
    sys.exit(main())
