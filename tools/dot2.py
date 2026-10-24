#!/usr/bin/env python3
# ==========================================
# ★ 옷장 그림을 절반 크기로 — dot/ → dot2/ (2026-10-24)
# ==========================================
#
# 왜
#   그림 한 장이 2112x768 이라 풀어 놓으면 6.5MB 다. 광장에 열 명이 서로 다른 옷을 입고 있으면
#   마흔 장이 넘게 한꺼번에 풀려 260MB 를 넘는다. 휴대폰은 그만큼을 쥐고 있지 못해 그릴 때마다
#   다시 풀고, 사람이 많을 때 걸음이 뚝뚝 끊겼다.
#
#   도트는 2x2 픽셀을 한 점으로 그려져 있다 (칸을 +30 씩 옮겨 붙였으므로 4 가 아니라 2 로만 맞는다).
#   그래서 절반으로 줄여도 **한 점도 잃지 않는다** — 줄인 것을 두 배로 늘리면 원본과 똑같은 장만 만든다.
#   똑같지 않은 장(2x2 가 아닌 점이 섞인 것)은 만들지 않는다 — 그 장은 원본을 그대로 쓴다.
#
#   화면은 배경 크기를 늘 원본 크기로 적어 두므로(closet.js layer) 작은 장을 깔아도 같은 자리 · 같은 크기로 그려진다.
#
# 쓰는 법 — 옷장 그림을 새로 넣거나 고친 뒤 한 번
#   python3 tools/dot2.py
#
#   dot2/manifest.json 에 원본의 지문(sha1)을 적어 둔다. build.mjs 가 원본과 지문이 맞는 것만
#   window.DOT2 로 묶음에 싣는다 — 원본을 고치고 이것을 안 돌렸으면 그 장은 저절로 원본을 쓴다.
import hashlib, json, os, sys
import numpy as np
from PIL import Image

SRC, OUT = 'dot', 'dot2'
SIZE = (2112, 768)


def main():
    os.makedirs(OUT, exist_ok=True)
    man = {}
    made = kept = 0
    skip = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.png'):
            continue
        p = os.path.join(SRC, f)
        raw = open(p, 'rb').read()
        im = Image.open(p)
        if im.size != SIZE:
            continue
        a = np.array(im.convert('RGBA'))
        s = a[0::2, 0::2]
        if (np.repeat(np.repeat(s, 2, 0), 2, 1) != a).any():
            skip.append(f)
            q = os.path.join(OUT, f)
            if os.path.exists(q):
                os.remove(q)
            continue
        name = f[:-4]
        sha = hashlib.sha1(raw).hexdigest()
        q = os.path.join(OUT, f)
        old = None
        try:
            old = json.load(open(os.path.join(OUT, 'manifest.json'))).get(name)
        except Exception:
            pass
        if old != sha or not os.path.exists(q):
            Image.fromarray(s, 'RGBA').save(q, optimize=True)
            made += 1
        else:
            kept += 1
        man[name] = sha
    # 원본이 없어진 것은 치운다
    for f in os.listdir(OUT):
        if f.endswith('.png') and f[:-4] not in man:
            os.remove(os.path.join(OUT, f))
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=0, sort_keys=True)
    print('dot2 — 새로 만듦 %d · 그대로 %d · 원본을 쓰는 장 %d %s' % (made, kept, len(skip), skip))


if __name__ == '__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    sys.exit(main())
