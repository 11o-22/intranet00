#!/usr/bin/env python3
"""악세서리 · 의상 리깅 미리보기 굽기.

rig/acc/<이름>/리깅.json (또는 rig/outfit/<이름>/리깅.json) 을 읽어
몸(rig/body) 위에 입히고, 파츠마다 정해 둔 축(pivot)으로 돌리거나 휘게 해서
한 바퀴(loop) 움짤을 만든다.

좌표는 전부 2400×2400 몸 칸 기준 (800 칸 그림은 3배로 키워서 같은 자리에 둠).

파츠 항목:
  file     그림 파일 (리깅.json 과 같은 폴더)
  name     이름 (없으면 file 에서 .png 뺀 것) — parent 로 부를 때 씀
  follow   따라가는 몸 파츠: 몸통 · 머리 · 왼팔1 · … (기본 몸통) · 목록이면 그 파츠들의 가운데
  parent   다른 파츠 이름 — 그 파츠의 움직임을 이어받음 (꼬리 마디 · 날개 깃)
  layer    back(몸 뒤) · front(몸 앞) · head(머리 바로 앞) · body(몸통 위 · 가까운 팔 아래)
  z        같은 layer 안의 차례 (작을수록 먼저)
  pivot    [x, y] 도는 축 (마디 · 뿌리 · 매달린 곳)
  rot      {amp, bias, phase, freq, kind}  kind: sin · twitch
  bend     {anchor, len, start, amp, bias, phase, lag, freq, dir, width, still}
           anchor 에서 멀어질수록 더 많이 휨 (꼬리 · 천 · 술 · 줄)
           still: 이 그림의 불투명한 곳은 안 움직임 (리본 매듭 등)
  move     {dx, dy, phase, freq}  둥실둥실 (헤일로 · 풍선)
  glow     {amp, phase, freq}  밝기 깜빡임 (등불 빛)
  anim     {동작 이름: {rot · fold · bend … 덮어쓸 값}} — 동작마다 움직임을 바꿈 (예: 새 날개 평소 / 날기)
           리깅.json 의 anims: {동작 이름: {frames · fps · fold_curve · hover …}} 도 그 동작일 때 덮어씀
  hover    (리깅.json) {dy, amp, freq} — 몸째로 떠 있기 (날기)
  fold     {deg, scale, lag}  접기 — 리깅.json 의 fold_curve(0 = 받은 그림대로 편 모습, 1 = 다 접은 모습)를 따라
           pivot 을 축으로 deg 만큼 돌고 scale 만큼 줄어듦 (새 날개 접었다 펴기)
"""
import json, math, os, sys
import numpy as np
import cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BODY = os.environ.get('RIG_BODY') or os.path.join(ROOT, 'rig', 'body')
BODY_ORDER = ['오른팔2', '오른팔1', '오른쪽 다리2', '오른쪽 다리1', '왼쪽 다리2', '왼쪽 다리1',
              '몸통', '왼팔2', '왼팔1', '머리']
LEGS = {'오른쪽 다리2', '오른쪽 다리1', '왼쪽 다리2', '왼쪽 다리1'}
NEAR_ARM = {'왼팔2', '왼팔1'}


def _load(path, s):
    im = Image.open(path).convert('RGBA')
    n = round(2400 * s)
    if im.size != (n, n):
        im = im.resize((n, n), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255.0
    a[:, :, :3] *= a[:, :, 3:4]          # 미리 곱한 알파 — 가장자리 검은 테 방지
    return a


def T(dx, dy):
    return np.array([[1, 0, dx], [0, 1, dy], [0, 0, 1]], np.float64)


def R(deg, cx, cy):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return T(cx, cy) @ np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], np.float64) @ T(-cx, -cy)


def wave(m, t, extra=0.0):
    """m: {amp, bias, phase, freq, kind}"""
    if not m:
        return 0.0
    amp, bias = m.get('amp', 0.0), m.get('bias', 0.0)
    ph, f = m.get('phase', 0.0), m.get('freq', 1)
    if m.get('kind') == 'twitch':          # 가끔 파르르 — 한 바퀴에 한 번 두 번 튐
        u = (t * f - ph) % 1.0
        g = lambda c: math.exp(-((u - c) / 0.035) ** 2)
        return bias + amp * (g(0.62) - 0.7 * g(0.70) + 0.35 * g(0.78))
    return bias + amp * math.sin(2 * math.pi * (t * f - ph - extra))


def curve(keys, t):
    """keys: [[t, v], …] — 사이는 부드럽게(smoothstep) 이음 · 한 바퀴로 돎"""
    t %= 1.0
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t0 <= t <= t1:
            u = 0.0 if t1 == t0 else (t - t0) / (t1 - t0)
            u = u * u * (3 - 2 * u)
            return v0 + (v1 - v0) * u
    return keys[-1][1]


class Rig:
    def __init__(self, folder, s=0.3, body=True, anim=None):
        self.folder, self.s, self.anim = folder, s, anim
        self.cfg = json.load(open(os.path.join(folder, '리깅.json'), encoding='utf-8'))
        if anim:
            self.cfg.update(self.cfg.get('anims', {}).get(anim, {}))
        self.parts = []
        for p in self.cfg['parts']:
            if p.get('variant'):          # 같은 리깅을 쓰는 다른 그림 — 미리보기에는 안 그림
                continue
            p = dict(p)
            if anim and anim in p.get('anim', {}):
                for k, v in p['anim'][anim].items():
                    if v is None:
                        p.pop(k, None)
                    else:
                        p[k] = v
            p.setdefault('name', os.path.splitext(p['file'])[0])
            p.setdefault('follow', '몸통')
            p.setdefault('layer', 'back')
            p.setdefault('z', 0)
            p['img'] = _load(os.path.join(folder, p['file']), s)
            self._mask(p, s)
            b = p.get('bend')
            if b and b.get('still'):
                st = _load(os.path.join(folder, b['still']), s)[:, :, 3]
                p['still'] = cv2.GaussianBlur(st, (0, 0), 6 * s / 0.3)
            self.parts.append(p)
        self.by = {p['name']: p for p in self.parts}
        self.body = {n: _load(os.path.join(BODY, n + '.png'), s) for n in BODY_ORDER} if body else {}
        self.bob = self.cfg.get('bob', 5.0)

    @staticmethod
    def _mask(p, s):
        """clip [x0,y0,x1,y1] — 그 네모 안만 씀 · keep/cut [[x,y],…] — 다각형 안만 / 다각형 밖만 씀
        (cut 은 가려져 있던 자리를 주변 색으로 메워서 움직여도 구멍이 안 보이게)"""
        img = p['img']
        n = img.shape[0]
        m = None
        if p.get('clip'):
            x0, y0, x1, y1 = [int(v * s) for v in p['clip']]
            m = np.zeros((n, n), np.float32); m[y0:y1, x0:x1] = 1
        for key in ('keep', 'cut'):
            if p.get(key):
                pm = np.zeros((n, n), np.uint8)
                cv2.fillPoly(pm, [np.round(np.array(p[key]) * s).astype(np.int32)], 1)
                pm = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), 0.8)
                if key == 'cut':
                    if p.get('inpaint', True):
                        a8 = (np.clip(img, 0, 1) * 255).astype(np.uint8)
                        hole = (pm > 0.05).astype(np.uint8)
                        rgb = np.zeros_like(a8[:, :, :3])
                        al = a8[:, :, 3:4].astype(np.float32) / 255
                        rgb = np.where(al > 0, (img[:, :, :3] / np.maximum(al, 1e-3) * 255).clip(0, 255), 0).astype(np.uint8)
                        r2 = cv2.inpaint(rgb, hole, 6, cv2.INPAINT_TELEA)
                        A = cv2.inpaint(a8[:, :, 3], hole, 6, cv2.INPAINT_TELEA).astype(np.float32) / 255
                        A = np.where(hole > 0, A, al[:, :, 0])
                        img = np.dstack([r2.astype(np.float32) / 255 * A[:, :, None], A]).astype(np.float32)
                        p['img'] = img
                    else:
                        m = (1 - pm) if m is None else m * (1 - pm)
                else:
                    m = pm if m is None else m * pm
        if m is not None:
            p['img'] = p['img'] * m[:, :, None]

    # ---- 몸 움직임 (숨쉬기) ----
    def follow_M(self, name, t):
        if isinstance(name, list):              # 여러 몸 파츠의 가운데를 따라감 (다리 사이 채움 등)
            return sum(self.follow_M(n, t) for n in name) / len(name)
        return self._follow_M(name, t)

    def _follow_M(self, name, t):
        """몸 파츠(그리고 그 파츠를 따라가는 옷 · 악세서리)의 변환
        walk (리깅.json · 동작 「걷기」) — 아장아장: 발 쪽을 축으로 몸이 좌우로 기우뚱 · 발을 번갈아 들고 ·
        걸음마다 몸이 살짝 튀어 오르고 · 팔은 반대쪽 다리와 함께 흔듦
          {sway 기울기(도), pivot 발 쪽 축, bounce 튀어 오름(px), lift 발 듦(px), stride 앞으로 내딛음(px),
           arm 팔 흔듦(도), shoulder {오른팔: [x,y], 왼팔: [x,y]}}"""
        hv = self.cfg.get('hover')
        H = np.eye(3)
        if hv:
            H = T(0, (hv.get('dy', 0) + hv.get('amp', 0) * math.sin(2 * math.pi * (t * hv.get('freq', 1) - hv.get('phase', 0)))) * self.s)
        s = self.s
        w = self.cfg.get('walk')
        if w:
            sn = math.sin(2 * math.pi * t)
            px, py = w['pivot']
            G = H @ R(w.get('sway', 0) * sn, px * s, py * s)
            if name in LEGS:
                near = name.startswith('왼쪽')           # 화면 오른쪽(가까운) 다리
                up = max(0.0, sn if near else -sn)
                k = 1.0 if name.endswith('1') else 0.7
                dx = w.get('stride', 0) * (sn if near else -sn)
                return G @ T(dx * k * s, -w.get('lift', 0) * up * k * s)
            G = G @ T(0, -w.get('bounce', 0) * abs(sn) * s)
            for arm in ('오른팔', '왼팔'):
                if name.startswith(arm):
                    sx, sy = w['shoulder'][arm]
                    a = w.get('arm', 0) * sn * (1 if arm == '왼팔' else -1)
                    return G @ R(a, sx * s, sy * s)
            return G
        if name in LEGS or name == '땅':
            return H
        dy = self.bob * math.sin(2 * math.pi * t) * s
        return H @ T(0, dy)

    def local_M(self, p, t):
        """파츠의 2400 좌표계 변환 (부모 포함)."""
        s = self.s
        M = np.eye(3)
        if p.get('parent'):
            M = self.local_M(self.by[p['parent']], t)
        r = p.get('rot')
        if r:
            px, py = p['pivot']
            M = M @ R(wave(r, t), px * s, py * s)
        fd = p.get('fold')
        if fd:
            g = curve(self.cfg['fold_curve'], t - fd.get('lag', 0.0))
            px, py = p['pivot'][0] * s, p['pivot'][1] * s
            k = 1 - (1 - fd.get('scale', 1.0)) * g
            M = M @ R(fd['deg'] * g, px, py) @ T(px, py) @ np.diag([k, k, 1.0]) @ T(-px, -py)
        mv = p.get('move')
        if mv:
            ph, f = mv.get('phase', 0.0), mv.get('freq', 1)
            k = math.sin(2 * math.pi * (t * f - ph))
            M = M @ T(mv.get('dx', 0) * k * s, mv.get('dy', 0) * k * s)
        return M

    def world_M(self, p, t):
        root = p
        while root.get('parent'):
            root = self.by[root['parent']]
        return self.follow_M(root['follow'], t) @ self.local_M(p, t)

    # ---- 휘기 (뿌리에서 멀수록 더 돌아감) ----
    def bend_theta(self, b, qx, qy, t, still=None):
        s = self.s
        L, st = b['len'] * s, b.get('start', 0) * s
        r = np.sqrt(qx * qx + qy * qy)
        u = np.clip((r - st) / max(L - st, 1e-3), 0, 1)
        w = u ** b.get('pow', 1.0)
        if 'dir' in b:
            ang = np.degrees(np.arctan2(qy, qx))
            d = np.abs((ang - b['dir'] + 180) % 360 - 180)
            wd = b.get('width', 60)
            w = w * (1 - np.clip((d - wd * 0.6) / (wd * 0.4), 0, 1))
        if still is not None:
            w = w * (1 - still)
        amp, bias = b.get('amp', 0.0), b.get('bias', 0.0)
        ph, f, lag = b.get('phase', 0.0), b.get('freq', 1), b.get('lag', 0.0)
        return w * (bias + amp * np.sin(2 * np.pi * (t * f - ph - lag * u)))

    def render_part(self, p, t, canvas):
        s = self.s
        img = p['img']
        H, W = img.shape[:2]
        M = self.world_M(p, t)
        Mi = np.linalg.inv(M)
        a = img[:, :, 3]
        ys, xs = np.nonzero(a > 0.004)
        if len(xs) == 0:
            return
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        b = p.get('bend')
        pad = 4
        if b:
            pad += int(b['len'] * s * 0.35)
        corners = np.array([[x0, y0, 1], [x1, y0, 1], [x0, y1, 1], [x1, y1, 1]], np.float64).T
        wc = M @ corners
        X0 = max(int(wc[0].min()) - pad, 0); X1 = min(int(wc[0].max()) + pad, W - 1)
        Y0 = max(int(wc[1].min()) - pad, 0); Y1 = min(int(wc[1].max()) + pad, H - 1)
        if X1 <= X0 or Y1 <= Y0:
            return
        gx, gy = np.meshgrid(np.arange(X0, X1 + 1, dtype=np.float64), np.arange(Y0, Y1 + 1, dtype=np.float64))
        sx = Mi[0, 0] * gx + Mi[0, 1] * gy + Mi[0, 2]
        sy = Mi[1, 0] * gx + Mi[1, 1] * gy + Mi[1, 2]
        if b:
            ax, ay = b['anchor'][0] * s, b['anchor'][1] * s
            qx, qy = sx - ax, sy - ay
            cx, cy = qx, qy
            still = p.get('still')
            for _ in range(4 if (still is not None or 'dir' in b) else 1):
                sv = None
                if still is not None:
                    sv = cv2.remap(still, (cx + ax).astype(np.float32), (cy + ay).astype(np.float32),
                                   cv2.INTER_LINEAR, borderValue=0)
                th = np.radians(-self.bend_theta(b, cx, cy, t, sv))
                c, sn = np.cos(th), np.sin(th)
                cx, cy = c * qx - sn * qy, sn * qx + c * qy
            sx, sy = cx + ax, cy + ay
        out = cv2.remap(img, sx.astype(np.float32), sy.astype(np.float32), cv2.INTER_LINEAR,
                        borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        g = p.get('glow')
        if g:
            k = 1 - g.get('amp', 0.3) * (0.5 + 0.5 * math.sin(2 * math.pi * (t * g.get('freq', 2) - g.get('phase', 0))))
            k *= 1 - g.get('amp', 0.3) * 0.25 * (0.5 + 0.5 * math.sin(2 * math.pi * (t * 5 + 0.3)))
            out = out * k
        roi = canvas[Y0:Y1 + 1, X0:X1 + 1]
        roi[:] = out + roi * (1 - out[:, :, 3:4])

    def render_body_part(self, n, t, canvas):
        M = self.follow_M(n, t)
        img = self.body[n]
        dy = M[1, 2]
        if abs(dy) < 1e-6:
            o = img
        else:
            o = cv2.warpAffine(img, M[:2].astype(np.float32), (img.shape[1], img.shape[0]),
                               flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
        canvas[:] = o + canvas * (1 - o[:, :, 3:4])

    def frame(self, t):
        n = round(2400 * self.s)
        cv_ = np.zeros((n, n, 4), np.float32)
        key = lambda p: p['z']
        L = lambda name: sorted([p for p in self.parts if p['layer'] == name], key=key)
        for p in L('back'):
            self.render_part(p, t, cv_)
        for bn in BODY_ORDER:
            if self.body and bn in NEAR_ARM and bn == '왼팔2':
                for p in L('body'):
                    self.render_part(p, t, cv_)
            if self.body and bn == '머리':
                for p in L('neck'):
                    self.render_part(p, t, cv_)
            if self.body:
                self.render_body_part(bn, t, cv_)
        if not self.body:
            for p in L('body') + L('neck'):
                self.render_part(p, t, cv_)
        for p in L('head') + L('front'):
            self.render_part(p, t, cv_)
        return cv_


def to_pil(a, bg=(236, 236, 236)):
    a = np.clip(a, 0, 1)
    rgb = a[:, :, :3] + np.array(bg, np.float32)[None, None] / 255.0 * (1 - a[:, :, 3:4])
    return Image.fromarray((rgb * 255 + 0.5).astype(np.uint8), 'RGB')


def bake(folder, out, frames=None, fps=None, s=0.3, crop=None, maxw=520, anim=None):
    rig = Rig(folder, s, anim=anim)
    frames = frames or rig.cfg.get('frames', 24)
    fps = fps or rig.cfg.get('fps', 12)
    ims = [rig.frame(i / frames) for i in range(frames)]
    if crop is None:
        al = np.max(np.stack([im[:, :, 3] for im in ims]), axis=0)
        ys, xs = np.nonzero(al > 0.02)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pw, ph = int((x1 - x0) * 0.06) + 6, int((y1 - y0) * 0.05) + 6
        crop = (max(x0 - pw, 0), max(y0 - ph, 0), min(x1 + pw, al.shape[1]), min(y1 + ph, al.shape[0]))
    else:
        crop = tuple(int(v * s) for v in crop)
    pil = [to_pil(im).crop(crop) for im in ims]
    if pil[0].width > maxw:
        k = maxw / pil[0].width
        pil = [p.resize((maxw, round(p.height * k)), Image.LANCZOS) for p in pil]
    if out.endswith('.webp'):
        pil[0].save(out, save_all=True, append_images=pil[1:], duration=round(1000 / fps), loop=0, quality=82, method=4)
    else:
        pil[0].save(out, save_all=True, append_images=pil[1:], duration=round(1000 / fps), loop=0, optimize=True)
    return out


if __name__ == '__main__':
    bake(sys.argv[1], sys.argv[2], s=float(sys.argv[3]) if len(sys.argv) > 3 else 0.3)
