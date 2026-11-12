#!/usr/bin/env python3
# ==========================================
# ★ 리듬 게임 채보 만들기 — 곡(wav) → rhythm/<곡>.json (2026-11-10)
# ==========================================
#
#   python3 tools/rhythm-chart.py <마스터링한 wav> <열쇠> "<제목>" "<지은이>"
#
#   1. 소리 흐름(스펙트럼 변화)에서 박의 결을 뽑는다 — 전체 · 낮은 (킥) · 가운데 (스네어 · 선율) · 높은 (하이햇)
#   2. 16분 격자를 따라간다 (동적 계획 — 템포가 조금씩 바뀌는 곡도 따라간다 · In the Airplane 은 128 → 131 로 오른다)
#   3. 격자마다 세기 · 자리(박 · 8분 · 16분) · 높낮이(소리 무게중심)를 잰다
#   4. 난이도마다 고른다
#        이지   — 박 위주 · 한 박에 0.6 개쯤 · 길게 누르기 · 짧은 슬라이드 조금
#        노말   — 8분까지 · 한 박에 1.5 개쯤 · 길게 누르기 · 슬라이드 · 지그재그 슬라이드 · 강박에 가끔 동시
#        하드   — 16분까지 · 한 박에 2.7 개쯤 · 동시 · 길게 누르며 치기 · 긴 슬라이드 · 지그재그 슬라이드
#        ★ 2026-11-11 하드는 선율을 따라간다 — hard_chart() 머리말 (선율 음 → 높이대로 칸 · 박은 쉬는 곳에 다른 손으로 · 노말의 1.4 ~ 1.5 배)
#        ★ 2026-11-11 사용자 「노말 · 하드 둘 다 내려오는 바 수를 늘리고, 음이 왔다갔다 하면서 길게 될 때는 지그재그 슬라이드도」
#          · 노말 1.05 → 1.5 · 하드 1.9 → 2.7 (한 박에)
#          · 지그재그 — 새로 울린 음의 높이(배음 합)가 낮 · 높 · 낮 · 높 … 으로 여섯 번 넘게 이어지는 곳 (8분 · 하드는 16분도)
#            → 노란 슬라이드가 왼 · 오른 칸을 번갈아 (낮은 음 왼쪽 · 높은 음 오른쪽) · 그 사이 다른 노트는 비운다
#        ★ 2026-11-11 사용자 「지그재그는 초록색 · 양손으로 지그재그 하는 파트도」
#          · 지그재그는 종류 3 (초록 슬라이드) — 게임에서는 슬라이드와 똑같이 판정한다
#          · 양손 — 8분 지그재그 가운데 소리가 큰 쪽 몇 줄 (넷에 하나 반쯤 · 적어도 하나)
#            왼손 0 ↔ 2 칸 · 오른손 5 ↔ 3 칸 — 거울처럼 (낮은 음에 벌리고 · 높은 음에 모은다)
#   5. 6칸에 놓는다 — 높낮이를 칸으로 (낮은 소리 왼쪽 · 높은 소리 오른쪽) · 같은 칸 연타 · 무리한 뜀은 고친다
#
#   노트 한 줄 = [시각(ms), 칸(0~5), 종류, 덧값]
#     종류 0 터치 · 1 길게 누르기 (덧값 = 길이 ms) · 2 슬라이드 (덧값 = 줄 번호 — 같은 줄끼리 이어 그린다)
import json, sys, math
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft, find_peaks

HOP = 240                 # 48k 에서 5 ms
BIAS = 0.011              # 결이 실제 소리보다 이만큼 일찍 선다 — 노트를 그만큼 늦춘다
NFFT = 2048


def load(path):
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    return sr, x


def analyse(sr, x):
    f, t, Z = stft(x, sr, nperseg=NFFT, noverlap=NFFT - HOP, boundary=None, padded=False)
    mag = np.abs(Z)
    L = np.log1p(1000 * mag)
    flux = np.maximum(0, np.diff(L, axis=1))
    flux = np.concatenate([np.zeros((flux.shape[0], 1)), flux], axis=1)
    fps = sr / HOP
    off = (NFFT / 2) / sr            # 틀 가운데
    bands = {'all': (30, 16000), 'low': (30, 160), 'mid': (160, 2500), 'high': (2500, 16000)}
    env = {}
    for k, (a, b) in bands.items():
        m = (f >= a) & (f < b)
        e = flux[m].sum(axis=0)
        env[k] = e / (np.percentile(e, 99.5) + 1e-9)
    # 높낮이 — 오른 소리의 무게중심 (100 Hz ~ 5 kHz, 로그)
    m = (f >= 100) & (f < 5000)
    lf = np.log2(f[m])
    w = flux[m] + 1e-9
    cen = (w * lf[:, None]).sum(axis=0) / w.sum(axis=0)
    # 크기 (RMS · dB)
    rms = np.sqrt((mag ** 2).mean(axis=0))
    rdb = 20 * np.log10(rms + 1e-9)
    # 가운데 소리 크기 — 길게 누르기(이어지는 소리)를 본다
    mm = (f >= 160) & (f < 4000)
    mid_db = 20 * np.log10(np.sqrt((mag[mm] ** 2).mean(axis=0)) + 1e-9)
    return fps, off, env, cen, rdb, mid_db


def onset_pitch(sr, x, grid, off_bias):
    """격자마다 새로 울린 음의 높이 (MIDI 번호 · 배음 합) 와 세기 — 지그재그 슬라이드를 찾는다."""
    N = 4096
    win = np.hanning(N)
    df = sr / N
    fr = np.arange(N // 2 + 1) * df
    mm = (fr >= 100) & (fr < 5000)
    cands = 2 ** (np.arange(np.log2(110) * 48, np.log2(1100) * 48) / 48)      # 1/4 반음 간격
    idx = np.arange(N // 2 + 1)
    offs = np.arange(-0.025, 0.0301, 0.005)
    pit = np.zeros(len(grid))
    pstr = np.zeros(len(grid))
    for gi, tt in enumerate(grid):
        t0 = tt - off_bias
        frames = []
        for o in offs:
            a = int(round((t0 + o) * sr)) - N // 2
            if a < 0 or a + N > len(x):
                frames.append(None)
                continue
            frames.append(np.log1p(1000 * np.abs(np.fft.rfft(x[a:a + N] * win)) / (N / 4)))
        best = None
        for k in range(1, len(frames)):
            if frames[k] is None or frames[k - 1] is None:
                continue
            fl = np.maximum(0, frames[k] - frames[k - 1])
            sm = float(fl[mm].sum())
            if best is None or sm > best[0]:
                best = (sm, fl)
        if best is None:
            continue
        col = best[1]
        sc = np.zeros(len(cands))
        for h in range(1, 6):
            sc += np.interp(cands * h / df, idx, col) / h ** 0.8
        pit[gi] = 12 * np.log2(cands[int(np.argmax(sc))] / 440) + 69
        pstr[gi] = best[0]
    return pit, pstr


def zig_runs(pit, pstr, ok, step, n_min, n_max):
    """높이가 낮 · 높 · 낮 · 높 … 으로 번갈아 이어지는 격자 줄 (간격 step) — [격자 번호들]"""
    th = np.percentile(pstr[pstr > 0], 55) if (pstr > 0).any() else 1e9
    K = len(pit)
    out = []
    last = -1
    for s0 in range(K):
        if s0 <= last or not ok[s0] or pstr[s0] < th:
            continue
        seq = [s0]
        while seq[-1] + step < K and ok[seq[-1] + step] and pstr[seq[-1] + step] >= th and len(seq) < n_max:
            seq.append(seq[-1] + step)
        d = np.diff(pit[seq])
        if not len(d) or abs(d[0]) < 1:
            continue
        n = 1
        while n < len(d) and abs(d[n]) >= 1 and np.sign(d[n]) != np.sign(d[n - 1]):
            n += 1
        if n + 1 >= n_min:
            out.append(seq[:n + 1])
            last = seq[n]
    return out


HOLD_TAIL = 80        # 꼬리 끝나고 이만큼까지도 손이 아직 거기 있다


def one_side(notes):
    """길게 누르는 동안 다른 노트는 한쪽에만 — 한 손은 누르고 있으니 나머지 한 손으로 칠 수 있게.
    ★ 2026-11-11 사용자 「2나 5에서 꾹 누를 때 134 · 346 을 오가는 타일이 많다 — 손이 셋이 아닌 이상 힘드니
      1에만 · 3456에만 · 6에만 · 1234에만 있게」 — 2 · 5 뿐 아니라 어느 칸에서 누르든 같다.
    누르는 칸 L 의 왼쪽 · 오른쪽 가운데 노트가 많은 쪽(같으면 칸이 넓은 쪽)으로 모은다 — 다른 쪽 노트는 L 을 기준으로
    거울처럼 넘긴다(거리를 그대로). 슬라이드(2 · 3)는 줄째로 넘겨 모양을 지킨다. 넘길 자리가 막히면 그 쪽 옆 칸 · 그래도 막히면 뺀다."""
    notes = sorted([list(n) for n in notes], key=lambda n: (n[0], n[1]))
    for _ in range(3):                                     # 줄째로 넘긴 것이 다른 누르기에 걸릴 수 있어 몇 번 돈다
        changed = False
        holds = [n for n in notes if n[2] == 1]
        for h in holds:
            t0, t1, L = h[0], h[0] + h[3] + HOLD_TAIL, h[1]
            oth = [n for n in notes if n is not h and t0 <= n[0] <= t1]
            left = [n for n in oth if n[1] < L]
            right = [n for n in oth if n[1] > L]
            if not left or not right:
                continue
            wl, wr = L, 5 - L                              # 그쪽 칸 수
            go_right = (len(right) > len(left)) or (len(right) == len(left) and wr >= wl)
            if (go_right and wr == 0) or (not go_right and wl == 0):
                go_right = not go_right
            bad = left if go_right else right
            lo, hi = (L + 1, 5) if go_right else (0, L - 1)
            moved_chains = set()
            drop = []
            for n in bad:
                if n[2] in (2, 3) and n[3]:
                    key = (n[2], n[3])
                    if key in moved_chains:
                        continue
                    moved_chains.add(key)
                    for m in notes:                         # 줄째로 넘긴다
                        if m[2] == n[2] and m[3] == n[3]:
                            m[1] = int(min(5, max(0, 2 * L - m[1])))
                            if t0 <= m[0] <= t1:
                                m[1] = int(min(hi, max(lo, m[1])))
                    continue
                want = int(min(hi, max(lo, 2 * L - n[1])))
                taken = {m[1] for m in notes if m is not n and m[0] == n[0]}
                cands = sorted(range(lo, hi + 1), key=lambda c: abs(c - want))
                for c in cands:
                    if c not in taken:
                        n[1] = c
                        break
                else:
                    drop.append(n)
            if drop:
                ids = {id(x) for x in drop}
                notes = [m for m in notes if id(m) not in ids]
            changed = True
        if not changed:
            break
    # 같은 시각 같은 칸으로 겹친 것은 하나만
    out, seen = [], set()
    for n in sorted(notes, key=lambda n: (n[0], n[1])):
        k = (n[0], n[1])
        if k in seen:
            continue
        seen.add(k)
        out.append(n)
    return out


def local_period(env, fps, sub=4, lo=60, hi=200, win=12.0, step=2.0):
    """창마다 16분 길이(초) — 봉우리들의 원 평균으로."""
    e = env['all']
    pk, pr = find_peaks(e, height=np.convolve(e, np.ones(41) / 41, mode='same') + 0.15, distance=int(0.07 * fps))
    ts = pk / fps
    hs = pr['peak_heights']
    T = len(e) / fps
    # 전체에서 먼저 템포 대강 — 결의 자기상관 (박 · 두 박 · 네 박이 같이 맞는 쪽 · 70 ~ 180)
    ee = e - np.convolve(e, np.ones(int(fps)) / int(fps), mode='same')
    ee = np.maximum(ee, 0)
    ac = np.correlate(ee, ee, mode='full')[len(ee) - 1:]
    best = None
    for bpm in np.arange(70, 180, 0.05):
        lag = 60 / bpm * fps
        s = 0.0
        for k in (1, 2, 4):
            L = lag * k
            i = int(L)
            fr = L - i
            if i + 1 < len(ac):
                s += (ac[i] * (1 - fr) + ac[i + 1] * fr) / k
        if best is None or s > best[0]:
            best = (s, bpm)
    bpm0 = best[1]
    out = []
    c0 = win / 2
    while c0 < T - win / 2 + step:
        m = (ts >= c0 - win / 2) & (ts < c0 + win / 2)
        if m.sum() >= 8:
            bb = None
            for bpm in np.arange(bpm0 - 4, bpm0 + 4, 0.02):
                d = 60 / bpm / sub
                z = (hs[m] * np.exp(2j * np.pi * ts[m] / d)).sum()
                c = abs(z) / hs[m].sum()
                if bb is None or c > bb[0]:
                    bb = (c, bpm)
            out.append((c0, 60 / bb[1] / sub, bb[0]))
        c0 += step
    return bpm0, out


def track_grid(env, fps, per_curve):
    """동적 계획 — 16분 격자. per_curve(t) = 그 자리 16분 길이."""
    e = np.convolve(env['all'], np.hanning(5) / np.hanning(5).sum(), mode='same')
    n = len(e)
    score = np.zeros(n)
    back = -np.ones(n, dtype=int)
    alpha = 60.0
    for i in range(n):
        d = per_curve(i / fps) * fps
        a = int(i - 1.25 * d)
        b = int(i - 0.8 * d)
        best = 0.0
        arg = -1
        if b > 0:
            a = max(a, 0)
            js = np.arange(a, b + 1)
            pen = -alpha * (np.log((i - js) / d)) ** 2
            v = score[js] + pen
            j = np.argmax(v)
            if v[j] > 0:
                best = v[j]
                arg = js[j]
        score[i] = e[i] + best
        back[i] = arg
    # 끝 — 마지막 몇 초에서 가장 높은 곳
    tail = int(max(0, n - 3 * fps))
    i = tail + int(np.argmax(score[tail:]))
    path = []
    while i >= 0:
        path.append(i)
        i = back[i]
    path = path[::-1]
    return np.array(path) / fps


# 사용자가 양손(두 줄 · 양쪽)으로 정한 지그재그 — 곡 안에서 나오는 차례 (0 = 처음)
#   2026-11-11 사용자 「쇼타임 지그재그 처음이랑 두 번 나오는 거 한 개가 아니라 두 개 양쪽으로 지그재그 하는 걸로」
ZIG_TWO = {'showtime': {'normal': (0, 1), 'hard': (0, 1)}}

# 셔플(스윙)로 출렁이는 곡 — 박 안 16분 넷의 자리 (박 길이의 몫). 곧은 곡은 (0, .25, .5, .75)
#   Handicap — 8분이 2:1 로 출렁인다 (마디를 48 칸으로 접어 보니 박 0 · 2/3 에 소리가 몰렸다 · 2026-11-11)
#   → 앞 8분(길게)을 0 · 1/3, 뒤 8분(짧게)을 2/3 · 5/6 으로
SWING = {'handicap': (0, 1 / 3, 2 / 3, 5 / 6)}


# 사용자가 「어렵게」라고 한 곡 — 노말 · 하드 둘 다 더 촘촘하게 (2026-11-11 사용자 「Handicap … 어렵게」)
#   normal — 노말 한 박에 노트 수 배 · hard — 하드 노트 수(노말의 HARD_X 배)에 또 곱함
#   zig — 지그재그 줄 수 배 · two — 8분 지그재그 가운데 양손으로 하는 몫 (보통 0.4) · chord — 노말 동시 몫 배
#   fill16 — 하드에서 그래도 모자라면 박을 선율 옆 16분 자리까지 (다른 손)
HARDER = {'handicap': {'normal': 1.1, 'hard': 0.98, 'alt': True, 'fill16': True}}
#   ✗ 처음(2026-11-11)엔 'normal': 1.35, 'hard': 1.15, 'zig': 1.8, 'two': 0.65, 'chord': 1.8, 'fill16': True 로 촘촘하게 했다 (노말 629 · 하드 1070 · 초당 8)
#     → 사용자 「너무 촘촘해서 안 될 것 같아. 딱 쇼타임 정도로만 맞춰주고 레벨은 17로」 — Showtime! (노말 초당 4.0 · 하드 6.68) 에 맞춘 값으로


# 사용자가 정한 레벨 — 다시 뽑아도 이 값 (2026-11-11 사용자 「쇼타임은 하드 레벨을 17로」)
#   하드를 선율 따라가기로 다시 짠 뒤(2026-11-11)에도 하드 레벨 표시는 그 전 값 그대로 둔다 — 꿈결 +50 (레벨 15 이상)이 이 표시에 붙어 있다
LV_FIX = {'showtime': {'hard': 17}, 'handicap': {'hard': 15, 'normal': 10},   # Handicap 하드 17 (2026-11-11 사용자) → 15 (2026-11-12 사용자 「핸디캡 하드 레벨 15로 낮추자」) · 노말은 그때 뽑힌 10 그대로 (2026-11-12 새 판 끝 마당이 성겨져 평균이 조금 내려도)
          'airplane': {'hard': 15}, 'client': {'hard': 11}, 'devotion': {'hard': 11}, 'evilhigh': {'hard': 15},
          'returnhome': {'hard': 15}, 'winterfloat': {'hard': 15}, 'whitexmas': {'hard': 13}}

# 끝 마당 — 드럼이 빠지고 박 없이 흐르는 곳 (이 시각부터 끝까지). 격자(박을 이어 그은 줄)는 거기서 소리와 어긋나므로,
#   격자 노트를 걷고 새로 울린 소리 위에 바로 노트를 둔다 · 가장 크게 친 소리(마지막 한 방)에 맺고 그 뒤 꼬리에는 두지 않는다
#   Handicap 새 판 (2026-11-12 사용자 「끝부분만 좀 다르거든」) — 132.3 초부터 드럼이 빠지고 142.1 초에 한 번 크게 친 뒤 사라진다
OUTRO = {'handicap': 132.3}
#   난이도마다 (새 소리 세기 문턱 · 노트 사이 최소 초 · 길게 누르기로 바꾸는 다음 노트까지 초) — 세기는 끝 마당 앞 30 초 95 % 를 1 로
OUT_SPEC = {'easy': (0.35, 0.40, 1.0), 'normal': (0.17, 0.22, 0.7), 'hard': (0.10, 0.12, 0.7)}


def outro_onsets(sr, x, t0, env, off, fps):
    """t0 뒤 새로 울린 소리 [시각(초), 세기, 높이(log2 Hz)].
    찾기는 4096 틀에서 6 dB 넘게 새로 오른 주파수 칸의 합 (패드가 깔린 곳에서도 새 음이 보인다) —
    시각은 그 자리 가운데 소리 결(env['mid']) 꼭대기로 다시 잡는다 (격자와 같은 잣대 · 4096 틀 값은 소리에 따라 20 ms 안팎 흔들린다)."""
    a = max(0, int((t0 - 30) * sr))
    f, t, Z = stft(x[a:], sr, nperseg=4096, noverlap=4096 - HOP, boundary=None, padded=False)
    L = 20 * np.log10(np.abs(Z) + 1e-9)
    L = np.maximum(L, L.max() - 60)
    k = (f > 150) & (f < 3000)
    D = np.maximum(0, L[k, 6:] - L[k, :-6])
    D = np.where(D > 6, D, 0)
    nov = D.sum(axis=0)
    tn = t[6:] - 3 * HOP / sr + a / sr
    nov = nov / (np.percentile(nov[tn < t0], 95) + 1e-9)
    lf = np.log2(f[k])
    pk, _ = find_peaks(nov, height=0.08, distance=int(0.08 * sr / HOP))
    e = env['mid']
    out = []
    for p in pk:
        if tn[p] < t0:
            continue
        i0 = max(0, int((tn[p] - 0.05 - off) * fps))
        i1 = min(len(e) - 1, int((tn[p] + 0.015 - off) * fps))
        j = i0 + int(np.argmax(e[i0:i1 + 1]))
        w = D[:, p] + 1e-9
        out.append([j / fps + off + BIAS, float(nov[p]), float((w * lf).sum() / w.sum())])
    return out


def outro_notes(notes, diff, ons, t0):
    """끝 마당(t0 ~)의 격자 노트를 걷고 ons 위에 다시 둔다. t0 앞에서 시작한 길게 누르기 · 슬라이드 줄은 그대로 둔다."""
    th, gap, hold_at = OUT_SPEC[diff]
    T0 = t0 * 1000
    head = {}
    for n in notes:
        if n[2] in (2, 3):
            head[n[3]] = min(head.get(n[3], n[0]), n[0])
    keep = [n for n in notes if n[0] < T0 or (n[2] in (2, 3) and head[n[3]] < T0)]
    busy = max([n[0] + (n[3] if n[2] == 1 else 0) for n in keep] + [0]) / 1000 + gap
    if not ons:
        return keep, len(notes) - len(keep)
    fin = max(ons, key=lambda o: o[1])                      # 마지막 한 방
    pick = []
    for o in sorted(ons, key=lambda o: -o[1]):
        if o is fin or o[1] < th or o[0] < busy or o[0] > fin[0] - gap:
            continue
        if any(abs(o[0] - p[0]) < gap for p in pick):
            continue
        pick.append(o)
    pick.sort(key=lambda o: o[0])
    out = list(keep)
    if pick:
        ps = sorted(p[2] for p in pick)
        qs = [ps[int(len(ps) * q / 6)] for q in range(1, 6)] if len(ps) >= 6 else []
        prev = None
        for i, o in enumerate(pick):
            lane = int(np.searchsorted(qs, o[2])) if qs else int(np.clip(round((o[2] - ps[0]) / max(1e-6, ps[-1] - ps[0]) * 5), 0, 5))
            if prev and prev[1] == lane and o[0] - prev[0] < 0.3:
                lane = lane + 1 if lane < 3 else lane - 1           # 같은 칸 연타는 옆 칸으로
            nxt = pick[i + 1][0] if i + 1 < len(pick) else fin[0]
            if nxt - o[0] >= hold_at:                               # 다음 소리까지 길게 이어지면 길게 누르기
                out.append([int(round(o[0] * 1000)), lane, 1, int(round(min(1.5, nxt - o[0] - 0.3) * 1000))])
            else:
                out.append([int(round(o[0] * 1000)), lane, 0, 0])
            prev = (o[0], lane)
    tf = int(round(fin[0] * 1000))
    if diff == 'easy':
        out.append([tf, 2, 0, 0])
    else:
        out += [[tf, 1, 0, 0], [tf, 4, 0, 0]]                     # 양손 동시로 맺는다
    return out, len(notes) - len(out)                           # 걷어 낸 노트 수 − 새로 둔 노트 수


HOLD_GAP = 250


def lane_gap(notes, ms):
    """같은 칸에 ms 안으로 붙은 터치는 뒤의 것을 뺀다 (지그재그 · 슬라이드 줄은 그대로).
    셔플 격자(SWING)는 뒤 8분 안의 두 16분이 박의 1/6 (124 BPM 에서 80 ms) 밖에 안 떨어져, 같은 칸이면 칠 수가 없다."""
    out, last = [], {}
    for n in sorted(notes, key=lambda n: (n[0], n[1])):
        if n[2] == 0 and n[1] in last and n[0] - last[n[1]] < ms:
            continue
        out.append(n)
        last[n[1]] = n[0] + (n[3] if n[2] == 1 else 0)
    return out


def hold_gap(notes):
    """★ 2026-11-11 사용자 「롱노트 전 · 중 · 후로 일반 노트가 조금 씹히는 느낌」
    길게 누르기 바로 앞(머리 250 ms 전 안)이나 바로 뒤(끝 250 ms 안)에 같은 칸 터치가 있으면,
    한 손가락으로 「치고 → 곧바로 다시 눌러 버티기」 · 「떼자마자 다시 치기」가 되어 둘 중 하나가 씹힌다.
    그 터치를 가까운 다른 칸으로 옮긴다 — 그 칸에 120 ms 안 노트가 없고, 같은 시각 노트가 이미 둘이 아니고,
    그 칸이 누르는 중이 아니고, 그때 누르고 있는 다른 롱노트가 있으면 그 롱노트의 한쪽 규칙(one_side)을 지키는 칸으로만.
    자리가 없으면 뺀다."""
    notes = sorted([list(n) for n in notes], key=lambda n: (n[0], n[1]))
    holds = [n for n in notes if n[2] == 1]
    gone = set()
    live = lambda: [m for m in notes if id(m) not in gone]

    def fits(n, c):
        lv = [m for m in live() if m is not n]
        if any(m[1] == c and abs(m[0] - n[0]) < 120 for m in lv):
            return False
        if sum(1 for m in lv if m[0] == n[0]) >= 2:
            return False
        for g in holds:
            if id(g) in gone:
                continue
            g0, g1 = g[0], g[0] + g[3] + HOLD_TAIL
            if g[1] == c and g0 - HOLD_GAP <= n[0] <= g[0] + g[3] + HOLD_GAP:
                return False                                  # 누르고 있는 칸 (그 앞뒤 250 ms 도)
            if g0 <= n[0] <= g1:                              # 그때 누르는 롱노트 — 다른 노트들과 같은 쪽으로만
                side = [m[1] - g[1] for m in lv if m is not g and g0 <= m[0] <= g1 and m[1] != g[1]]
                if c == g[1] or any((c - g[1]) * sd < 0 for sd in side):
                    return False
        return True

    for h in holds:
        L, t0, t1 = h[1], h[0], h[0] + h[3]
        for n in notes:
            if n[2] != 0 or n[1] != L or id(n) in gone:
                continue
            if not (t0 - HOLD_GAP <= n[0] < t0 or t1 + 60 < n[0] <= t1 + HOLD_GAP):
                continue
            for c in sorted([c for c in range(6) if c != L], key=lambda c: (abs(c - L), c)):
                if fits(n, c):
                    n[1] = c
                    break
            else:
                gone.add(id(n))
    return live()

# ==========================================
# ★ 하드 — 선율을 따라간다 (2026-11-11 사용자)
#   「곡도 시스템도 다 좋은데 채보가 많이 헷갈린다. 하드 기준으로 메인 멜로디와 부수적인 리듬이나 비트가
#     전부 노트로 나온다는 느낌 — 좀 정리되면 좋겠다」
#   전에는 격자마다 「가장 센 결」(킥 · 스네어 · 하이햇 · 선율 · 아르페지오 무엇이든)을 골라 놓고,
#   칸은 그 소리의 무게중심으로 정했다. 그래서 북 · 반주 · 선율이 한 줄에 섞이고 칸이 제멋대로 뛰었다.
#   이제는
#     1. 선율 음역(330 Hz ~ 1.5 kHz)에서 새로 울린 「음높이 있는」 소리만 노트로 — 빗살(배음 합) 대비로 잰다.
#        북 · 하이햇처럼 고르게 퍼진 소리는 빗살 대비가 낮아 빠진다. 한 줄기에서 크게 벗어난 높이(반주 · 베이스 배음)도 뺀다.
#     2. 칸은 그 음의 높이로 — 두 마디 안에서 낮은 음은 왼쪽 · 높은 음은 오른쪽. 같은 음은 같은 칸
#        (16분으로 빠르게 되풀이하면 옆 칸과 번갈아).
#     3. 선율이 한 박 넘게 쉬는 곳에만 박(킥 2번 칸 · 스네어 3번 칸)을 넣어 박자를 이어 준다.
#     4. 길게 누르기는 그 음이 실제로 이어 울리는 곳 · 동시는 반 마디 첫머리의 센 킥을 다른 손 바깥 칸으로 (두 박에 한 번까지).
#   지그재그 · 양손 지그재그 · 한쪽 규칙 · 롱노트 앞뒤 규칙은 그대로.
MEL_LO, MEL_HI = 330, 1500
MEL_CORE = 2.6          # 뚜렷한 선율 음
MEL_TH2 = 1.2           # 노트가 모자랄 때 더 받는 흐린 음
HARD_X = 1.72           # 하드 노트 수 = 노말의 이만큼 (정리 전 하드가 1.72 ~ 1.81 배)
MEL_TH = 1.6            # 빗살 대비 — 가짜 곡(북 · 베이스 · 패드 · 선율)에서 선율은 4.5 ~ 6.7 · 나머지는 거의 1.3 아래 · 실제 곡은 반주가 두꺼워 조금 낮춘다


def melody_onsets(sr, x, grid):
    N = 4096
    win = np.hanning(N)
    df = sr / N
    fr = np.arange(N // 2 + 1) * df
    band = (fr >= 120) & (fr < 5000)
    cands = 2 ** (np.arange(np.log2(MEL_LO) * 48, np.log2(MEL_HI) * 48) / 48)
    cm = 12 * np.log2(cands / 440) + 69
    idx = np.arange(N // 2 + 1)
    W = [(h, 1 / h ** 0.8) for h in range(1, 7)]

    def spec(c):
        a = int(round(c * sr)) - N // 2
        if a < 0 or a + N > len(x):
            return None
        sp = np.log1p(1000 * np.abs(np.fft.rfft(x[a:a + N] * win)) / (N / 4))
        sp[~band] = 0
        return sp

    def comb(col):
        sc = np.zeros(len(cands))
        for h, w in W:
            sc += np.interp(cands * h / df, idx, col) * w
        return sc
    K = len(grid)
    pon = np.zeros(K)
    pit = np.zeros(K)
    SB = np.zeros((K, len(cands)))
    for i, t in enumerate(grid):
        A = spec(t - 0.045)
        B = spec(t + 0.045)
        if A is None or B is None:
            continue
        sc = comb(np.maximum(0, B - A))
        j = int(np.argmax(sc))
        pon[i] = sc[j] - np.median(sc)
        pit[i] = cm[j]
        sb = comb(B)
        SB[i] = sb - np.median(sb)
    return pon, pit, SB, cm


def hard_chart(grid, K, pos, ok, F, R, active, MEL, zig_span, first_ok, last_ok, beats_per_sec, S, want):
    pon, pit, SB, cm = MEL
    beat_s = 1.0 / beats_per_sec
    # 1. 선율 — 두 단계로 고른다
    #    ① 뚜렷한 음 (빗살 대비 MEL_CORE 넘게) — 한 줄기(앞 여섯 음의 가운데 높이)에서 9 반음 넘게 벗어나면 뺀다
    #    ② 흐린 음 (MEL_TH ~ MEL_CORE) — 앞뒤 세 박 안의 뚜렷한 음들 높이에서 7 반음 안일 때만 (가려진 선율 음은 살리고 반주는 뺀다)
    P = {}
    core = []
    for i in range(K):
        if not ok[i] or pon[i] < MEL_CORE:
            continue
        p = float(pit[i])
        if core and grid[i] - grid[core[-1]] < 4 * beat_s:
            ref = float(np.median([P[j] for j in core[-6:]]))
            if abs(p - ref) > 9 and pon[i] < MEL_CORE * 1.7:
                continue
        P[i] = p
        core.append(i)
    ct = np.array([grid[j] for j in core]) if core else np.zeros(0)
    cp = np.array([P[j] for j in core]) if core else np.zeros(0)
    kept = list(core)
    for i in range(K):
        if not ok[i] or i in P or pon[i] < MEL_TH:
            continue
        m = np.abs(ct - grid[i]) <= 3 * beat_s
        if not m.any():
            continue
        p = float(pit[i])
        if abs(p - float(np.median(cp[m]))) <= 7:
            P[i] = p
            kept.append(i)
    # ③ 그래도 노트가 모자라면(선율이 노트의 8 할쯤 되게) 더 흐린 음(MEL_TH2 ~)도 — 앞뒤 두 박 안 뚜렷한 음들 높이에서 5 반음 안 · 센 순서로
    #    (2026-11-11 사용자 「하드 조금만 더 노트 수를 늘리자. 기존처럼」)
    need = int(0.8 * want) - len(kept)
    if need > 0:
        c2 = []
        for i in range(K):
            if not ok[i] or i in P or pon[i] < MEL_TH2:
                continue
            m = np.abs(ct - grid[i]) <= 2 * beat_s
            if m.any() and abs(float(pit[i]) - float(np.median(cp[m]))) <= 5:
                c2.append((pon[i], i))
        for _, i in sorted(c2, reverse=True)[:need]:
            P[i] = float(pit[i])
            kept.append(i)
    kept.sort()
    mel = set(kept)
    # 2. 칸 — 앞뒤 네 마디(열여섯 박) 안의 선율 높이로 (10 ~ 90 % 를 0 ~ 5 칸에 · 좁으면 가운데로)
    win_s = 16 * beat_s
    lanes = {}
    for i in kept:
        m = np.abs(ct - grid[i]) <= win_s                       # 뚜렷한 음들의 높이로 잰다
        if not m.any():
            m = np.abs(ct - grid[i]) <= 4 * win_s
        lo, hi = np.percentile(cp[m], [10, 90]) if m.any() else (P[i] - 3.5, P[i] + 3.5)
        span = max(hi - lo, 7.0)
        mid = (lo + hi) / 2
        lanes[i] = int(np.clip(round((P[i] - (mid - span / 2)) / span * 5), 0, 5))
    prev = None
    for i in kept:                                               # 선율끼리만 — 한 손이 따라가는 줄
        ln = lanes[i]
        if prev is not None:
            pi, pl = prev
            dk = i - pi
            if ln == pl and dk < 2:                              # 같은 칸 16분 — 옆 칸과 번갈아
                ln = pl + (1 if pl < 3 else -1)
            maxjump = 5 if dk >= 4 else (3 if dk >= 2 else 2)    # 빠를수록 가깝게
            if abs(ln - pl) > maxjump:
                ln = pl + (maxjump if ln > pl else -maxjump)
        ln = int(min(5, max(0, ln)))
        lanes[i] = ln
        prev = (i, ln)
    # 3. 부가 — 박(킥 · 스네어)을 정리해서 넣는다 (2026-11-11 사용자 「노트를 많이 하되 멜로디 라인은 대부분 찍히게 · 부가적인 것들을 정리」)
    #    · 선율 음과 겹치지 않는 자리(앞뒤 16분 안에 선율 음이 없는 곳)에만
    #    · 먼저 박(4분) 자리 — 그래도 노트가 모자라면 8분 자리를 센 순서로 · 그래도 모자라면 선율 바로 옆 16분 자리까지 (선율과 같은 자리는 비운다)
    #    · 칸은 늘 선율 반대쪽 손 — 가까운 선율 음이 왼쪽(0~2)이면 오른쪽 끝(킥 5 · 스네어 4), 오른쪽이면 왼쪽 끝(킥 0 · 스네어 1)
    def drum(q):
        return max(F['low'][q], F['mid'][q] * 0.9, F['high'][q] * 0.6)

    def free(q):
        return not any(j in mel for j in range(q - 1, q + 2))
    beats = [q for q in range(K) if ok[q] and pos[q] % 4 == 0 and free(q) and drum(q) >= 0.18]
    # 모자라면 차례로 — 8분(선율과 16분 띄움) → 4분(선율 바로 옆 16분도) → 8분(선율 바로 옆 16분도) · 선율과 같은 자리는 끝까지 비운다
    for step_ in ((2, True), (0, False), (2, False)) + (((1, False), (3, False)) if S.get('fill16') else ()):
        room = int(0.94 * want) - len(kept) - len(beats)
        if room <= 0:
            break
        md, strict = step_
        have = set(beats)
        cc = [q for q in range(K) if ok[q] and q not in have and q not in mel and pos[q] % 4 == md
              and (free(q) if strict else True) and drum(q) >= (0.1 if md else 0.18)]
        beats = sorted(beats + sorted(cc, key=lambda q: -drum(q))[:room])
    beat_set = set(beats)
    lb_ = [None, None]                                        # 바로 앞 박 (자리 · 칸)
    for q in beats:
        near_m = [j for j in kept if abs(j - q) <= 6]
        ref = lanes[min(near_m, key=lambda j: (abs(j - q), j))] if near_m else 2
        kick = F['low'][q] >= F['mid'][q] * 0.9
        ln = (5 if kick else 4) if ref <= 2 else (0 if kick else 1)
        if any(lanes.get(j) == ln for j in range(q - 2, q + 3) if j in mel):
            ln = {5: 4, 4: 5, 0: 1, 1: 0}[ln]
        # 박이 8분 안으로 붙어 오면 같은 칸을 연타하지 않게 — 그 쪽 두 칸을 번갈아 (2026-11-11 · 「어렵게」 곡만 — 다른 곡 채보는 그대로 다시 뽑히게)
        if (S.get('fill16') or S.get('alt')) and lb_[0] is not None and q - lb_[0] <= 2 and lb_[1] == ln:
            alt = {5: 4, 4: 5, 0: 1, 1: 0}[ln]
            if not any(lanes.get(j) == alt for j in range(q - 1, q + 2) if j in mel):
                ln = alt
        lanes[q] = ln
        lb_[0], lb_[1] = q, ln
    sel = sorted(kept + beats)
    # 4. 슬라이드 — 선율이 같은 간격(16분 · 8분)으로 네 개 넘게 이어지며 한쪽으로만 오르거나 내리는 곳 (3 반음 넘게)
    #    오르면 오른쪽으로 · 내리면 왼쪽으로 — 높이가 그대로이거나 오르내리면 슬라이드로 만들지 않는다
    notes = []
    chain = 0
    taken = set()
    n_slide_target = int(S['slide_n'] * (last_ok - first_ok) / 30)
    runs = []
    for step in S['slide_step']:
        j = 0
        while j < len(kept):
            k = j
            while k + 1 < len(kept) and kept[k + 1] - kept[k] == step and not any(b_ in beat_set for b_ in range(kept[k], kept[k + 1])):
                k += 1
            # 한쪽으로만 가는 가장 긴 앞머리
            best = None
            for e in range(j + S['slide'][0] - 1, k + 1):
                d = np.diff([P[kept[q]] for q in range(j, e + 1)])
                if (np.all(d >= -0.5) or np.all(d <= 0.5)) and abs(P[kept[e]] - P[kept[j]]) >= 3:
                    best = e
            if best is not None:
                runs.append((j, best))
            j = j + 1 if best is None else best + 1
    runs.sort(key=lambda r: -sum(pon[kept[q]] for q in range(r[0], r[1] + 1)))
    made = 0
    last_slide_t = -99
    for (a, b) in runs:
        if made >= n_slide_target:
            break
        ln_n = min(S['slide'][1], b - a + 1)
        if any(kept[a + q] in taken for q in range(ln_n)):
            continue
        t0 = grid[kept[a]]
        if abs(t0 - last_slide_t) < 2.0:
            continue
        l0 = lanes[kept[a]]
        dirn = 1 if P[kept[a + ln_n - 1]] >= P[kept[a]] else -1
        if not (0 <= l0 + dirn * (ln_n - 1) <= 5):
            dirn = -dirn
        if not (0 <= l0 + dirn * (ln_n - 1) <= 5):
            l0 = 0 if dirn > 0 else 5
        chain += 1
        for q in range(ln_n):
            i = kept[a + q]
            lanes[i] = l0 + dirn * q
            taken.add(i)
            notes.append([int(round(grid[i] * 1000)), lanes[i], 2, chain])
        made += 1
        last_slide_t = t0
    # 5. 길게 누르기 — 그 음이 실제로 이어 울리는 동안 (같은 음을 다시 치거나 · 세기가 60 % 아래로 지면 끝)
    #    다른 높이의 음이 그 사이에 오면(반주 · 화음) 다른 손으로 친다 — 한쪽 규칙(one_side)이 한쪽으로 모은다
    def sustain(i):
        c = int(np.argmin(np.abs(cm - P[i])))
        v0 = SB[i][c]
        if v0 < 1.0:
            return 0
        n = 0
        for j in range(i + 1, min(K, i + S['hold'][1] + 1)):
            if (j in mel and (abs(P[j] - P[i]) < 0.8 or pon[j] >= 2 * MEL_TH)) or SB[j][c] < 0.6 * v0:
                break
            n += 1
        return n
    cand_h = []
    for i in kept:
        if i in taken:
            continue
        hl = sustain(i)
        for za, zb in zig_span:
            if i < za <= i + hl + 1:
                hl = min(hl, za - i - 2)
        if hl >= 3:
            cand_h.append((hl + 0.3 * pon[i], i, hl))
    cand_h.sort(reverse=True)
    want_h = int(len(sel) * S['hold_p'])
    hold_at = {i: hl for _, i, hl in cand_h[:want_h]}
    # 6. 터치 · 길게 누르기 · 동시
    used_until = {}
    hold_on = {}
    chord_c = []
    prev_mel = -99
    for i in sel:
        if i in taken:
            prev_mel = i if i in mel else prev_mel
            continue
        ln = lanes[i]
        if used_until.get(ln, -1) >= i:
            for c2 in (ln + 1, ln - 1, ln + 2, ln - 2):
                if 0 <= c2 <= 5 and used_until.get(c2, -1) < i:
                    ln = c2
                    break
            else:
                continue
        busy = sum(1 for c2, u2 in used_until.items() if u2 >= i and c2 != ln and hold_on.get(c2))
        hl = hold_at.get(i, 0) if busy == 0 else 0
        t = int(round(grid[i] * 1000))
        if hl > 0:
            notes.append([t, ln, 1, int(round((grid[min(K - 1, i + hl)] - grid[i]) * 1000))])
            used_until[ln] = i + hl + 1
            hold_on[ln] = True
        else:
            notes.append([t, ln, 0, 0])
            if used_until.get(ln, -1) < i:
                hold_on[ln] = False
            used_until[ln] = max(used_until.get(ln, -1), i)
        # 동시 후보 — 선율 음이 반 마디 첫머리(킥 자리)에 오고 킥이 셀 때 · 다른 손 바깥 칸(선율이 왼쪽이면 5 · 오른쪽이면 0)
        if i in mel and pos[i] % 8 == 0 and hl == 0 and busy == 0 and F['low'][i] >= 0.45:
            ln2 = 5 if ln <= 2 else 0
            if used_until.get(ln2, -1) < i:
                chord_c.append((float(F['low'][i]) + (0.5 if pos[i] == 0 else 0), i, t, ln2))
        if i in mel:
            prev_mel = i
    # 동시 — 노트가 모자란 만큼 킥이 센 자리부터 · 두 박에 한 번 (모자라면 한 박에 한 번까지)
    room = want - len(notes)
    put = []
    for gap_b in (2, 1):                                   # 두 박에 한 번 → 모자라면 한 박에 한 번까지
        for _, i, t, ln2 in sorted(chord_c, reverse=True):
            if room <= 0:
                break
            if i in put or any(abs(grid[i] - grid[j]) < gap_b * beat_s - 1e-6 for j in put):
                continue
            notes.append([t, ln2, 0, 0])
            put.append(i)
            room -= 1
    print('  하드 — 선율 %d · 박 %d · 동시 %d · 슬라이드 %d 줄 · 길게 %d' % (len(kept), len(beats), len(put), made, sum(1 for n in notes if n[2] == 1)))
    return notes, chain


# 박 · 격자를 잴 때 이 시각 뒤는 보지 않는다 — 덧붙인 꼬리(박 없는 잔향)가 템포 · 마디 첫 박 고르기를 흔들지 않게. 곡 길이(dur)는 파일 전체
#   Handicap 새 판 — 142.6 초에 뚝 끊기던 화음을 이어 살려 147.6 초까지 잦아들게 했다 (2026-11-12 사용자 「그 부분 다시 살려줘」) · 그 전 끝(143.655 초)까지만 잰다
TAIL = {'handicap': 143.655}


def main():
    wav, key, title, artist = sys.argv[1:5]
    sr, x = load(wav)
    dur_all = len(x) / sr
    if key in TAIL:
        x = x[:int(TAIL[key] * sr)]
    dur = len(x) / sr
    fps, off, env, cen, rdb, mid_db = analyse(sr, x)
    bpm0, lp = local_period(env, fps)
    lt = np.array([p[0] for p in lp])
    ld = np.array([p[1] for p in lp])
    # 부드럽게 (가운데 값 · 이동 평균)
    if len(ld) >= 5:
        ld2 = np.copy(ld)
        for i in range(len(ld)):
            a, b = max(0, i - 2), min(len(ld), i + 3)
            ld2[i] = np.median(ld[a:b])
        ld = np.convolve(np.pad(ld2, 2, mode='edge'), np.ones(5) / 5, mode='valid')

    def per_curve(t):
        return float(np.interp(t, lt, ld))

    grid = track_grid(env, fps, per_curve)
    # 틀 가운데로 + 잡는 쪽의 이른 버릇 (킥 · 하이햇을 정해진 시각에 깐 소리로 재 보니 결이 9~14 ms 일찍 섰다 · 2026-11-10)
    grid = grid + off + BIAS
    # 격자 앞뒤를 채운다 (조용한 앞 · 뒤에도 박을 그어 둔다)
    d0 = per_curve(grid[0])
    pre = []
    t = grid[0] - d0
    while t > 0:
        pre.append(t)
        t -= d0
    grid = np.concatenate([np.array(pre[::-1]), grid])
    d1 = per_curve(grid[-1])
    post = []
    t = grid[-1] + d1
    while t < dur:
        post.append(t)
        t += d1
    grid = np.concatenate([grid, np.array(post)])
    K = len(grid)
    PIT, PSTR = onset_pitch(sr, x, grid, 0.0)                       # 격자 = 소리 시각 · 그 앞뒤 틀에서 새로 오른 소리를 본다
    MEL = melody_onsets(sr, x, grid)                                 # 하드 — 선율 따라가기 (2026-11-11)

    # 격자마다 세기
    def feat(name, t, wnd=0.02):
        e = env[name]
        a = int(max(0, (t - off - wnd) * fps))
        b = int(min(len(e) - 1, (t - off + wnd) * fps))
        return float(e[a:b + 1].max()) if b >= a else 0.0

    F = {k: np.array([feat(k, t) for t in grid]) for k in ('all', 'low', 'mid', 'high')}
    C = np.array([cen[int(min(len(cen) - 1, max(0, (t - off) * fps)))] for t in grid])
    R = np.array([rdb[int(min(len(rdb) - 1, max(0, (t - off) * fps)))] for t in grid])

    # 박 자리 — 낮은 소리(킥)가 가장 많이 실리는 나머지
    beat_off = int(np.argmax([F['low'][i::4].sum() + 0.5 * F['all'][i::4].sum() for i in range(4)]))
    bar_off = beat_off + 4 * int(np.argmax([F['low'][beat_off + 4 * j::16].sum() for j in range(4)]))
    pos = (np.arange(K) - bar_off) % 16
    # ★ 셔플(스윙) 곡 — 박 안 16분 넷의 자리를 SWING 대로 옮기고, 격자에 딸린 값들을 다시 잰다 (박 자리 · 마디선은 그대로)
    if key in SWING:
        Wsw = SWING[key]
        bi = [i for i in range(K) if pos[i] % 4 == 0]
        g2 = grid.copy()
        for a, b in zip(bi[:-1], bi[1:]):
            if b - a != 4:
                continue
            Lb = grid[b] - grid[a]
            for q in range(1, 4):
                g2[a + q] = grid[a] + Lb * Wsw[q]
        grid = g2
        PIT, PSTR = onset_pitch(sr, x, grid, 0.0)
        MEL = melody_onsets(sr, x, grid)
        F = {k: np.array([feat(k, t) for t in grid]) for k in ('all', 'low', 'mid', 'high')}
        C = np.array([cen[int(min(len(cen) - 1, max(0, (t - off) * fps)))] for t in grid])
        R = np.array([rdb[int(min(len(rdb) - 1, max(0, (t - off) * fps)))] for t in grid])
    OUT_ON = outro_onsets(sr, x, OUTRO[key], env, off, fps) if key in OUTRO else None
    metric = np.where(pos == 0, 1.0, np.where(pos % 4 == 0, 0.8, np.where(pos % 2 == 0, 0.55, 0.35)))

    loud = R - np.percentile(R, 95)                 # 0 이 가장 큰 쪽 · 음수
    active = R > np.percentile(R, 95) - 30          # 들리는 자리

    strength = np.maximum.reduce([F['all'], F['low'] * 1.1, F['mid'], F['high'] * 0.9])
    # 높낮이 → 칸 (곡 안의 분위수로 고르게)
    qs = np.percentile(C[strength > 0.25], [16.7, 33.3, 50, 66.7, 83.3]) if (strength > 0.25).sum() > 20 else np.percentile(C, [16.7, 33.3, 50, 66.7, 83.3])

    def lane_of(i):
        return int(np.searchsorted(qs, C[i]))

    beats_per_sec = 1.0 / (per_curve(dur / 2) * 4)
    bpm_mid = 60 * beats_per_sec
    first_ok = 1.6                                 # 처음 1.6 초는 비운다
    last_ok = dur - 0.3

    # 이어지는 소리 — 그 격자부터 가운데 소리가 얼마나 남나 (격자 수)
    def sustain_len(i, maxk):
        t0 = grid[i]
        a = int((t0 - off) * fps)
        if a < 0 or a >= len(mid_db):
            return 0
        top = mid_db[a:a + int(0.06 * fps)].max() if a + 1 < len(mid_db) else mid_db[a]
        n = 0
        for j in range(i + 1, min(K, i + maxk + 1)):
            b = int((grid[j] - off) * fps)
            if b >= len(mid_db):
                break
            # 새 소리가 크게 오면 끝
            if F['mid'][j] > 0.6:
                break
            if mid_db[b] < top - 12:
                break
            n += 1
        return n

    rng = np.random.default_rng(7)
    SPEC = {
        'easy':   {'per_beat': 0.5, 'mods': (0, 4, 8, 12, 2, 6, 10, 14), 'gap': 2, 'pref': 4, 'hold': (4, 12), 'hold_p': 0.12, 'slide': (2, 3), 'slide_step': (4,), 'slide_n': 0.6, 'chord': 0.0},
        'normal': {'per_beat': 1.5, 'mods': (0, 2, 4, 6, 8, 10, 12, 14), 'gap': 2, 'pref': 2, 'hold': (3, 12), 'hold_p': 0.12, 'slide': (3, 4), 'slide_step': (2,), 'slide_n': 1.0, 'chord': 0.08},
        'hard':   {'per_beat': 2.7, 'mods': tuple(range(16)), 'gap': 1, 'pref': 1, 'hold': (2, 12), 'hold_p': 0.1, 'slide': (4, 6), 'slide_step': (1, 2), 'slide_n': 1.6, 'chord': 0.16},
    }
    # 지그재그 — (간격 · 칸 너비) 들 · 최소 · 최대 음 수 · 30 초에 몇 줄
    ZIG = {'normal': {'steps': ((2, 2),), 'min': 6, 'max': 10, 'per30': 1.2},
           'hard':   {'steps': ((2, 3), (1, 2)), 'min': 6, 'max': 12, 'per30': 1.8}}
    charts = {}
    NORM_N = 0
    HX = HARDER.get(key)
    for diff, S in SPEC.items():
        if HX and diff in ('normal', 'hard'):
            S = dict(S)
            if diff == 'normal':
                S['per_beat'] = S['per_beat'] * HX.get('normal', 1)
                S['chord'] = S['chord'] * HX.get('chord', 1)
            S['slide_n'] = S['slide_n'] * HX.get('zig', 1)
            S['fill16'] = bool(HX.get('fill16'))
            S['alt'] = bool(HX.get('alt'))
        ok = np.array([(grid[i] >= first_ok and grid[i] <= last_ok and active[i] and (pos[i] in S['mods'])) for i in range(K)])
        # 지그재그 자리를 먼저 잡고 — 그 사이는 다른 노트를 비운다
        zigs = []
        if diff in ZIG:
            Z = ZIG[diff]
            okz = np.array([(grid[i] >= first_ok + 1 and grid[i] <= last_ok - 0.5 and active[i]) for i in range(K)])
            cand = []
            for step, amp in Z['steps']:
                for r in zig_runs(PIT, PSTR, okz, step, Z['min'], Z['max']):
                    cand.append((len(r) * step + 0.02 * float(PSTR[r].mean()), r, amp))
            cand.sort(key=lambda c: -c[0])
            want = max(1, int(Z['per30'] * (HX.get('zig', 1) if HX else 1) * (last_ok - first_ok) / 30))
            for _, r, amp in cand:
                if len(zigs) >= want:
                    break
                if any(not (r[-1] + 6 < z[0][0] or r[0] > z[0][-1] + 6) for z in zigs):
                    continue
                if any(abs(grid[r[0]] - grid[z[0][0]]) < 4.0 for z in zigs):
                    continue
                zigs.append((r, amp))
            zigs.sort(key=lambda z: z[0][0])
            for r, amp in zigs:
                ok[max(0, r[0] - 1):min(K, r[-1] + 2)] = False
        zig_span = [(r[0] - 1, r[-1] + 1) for r, amp in zigs]
        if diff == 'hard':
            # 노트 수 — 정리 전 하드처럼 노말의 1.72 배 (2026-11-11 사용자 「하드 조금만 더 노트 수를 늘리자. 기존처럼」) · 지그재그 노트 몫은 뺀다
            z8_ = sorted([zi for zi, (r, amp) in enumerate(zigs) if r[1] - r[0] >= 2], key=lambda zi: -float(R[zigs[zi][0]].mean()))
            two_ = set(z8_[:max(1, int(math.ceil(len(z8_) * (HX.get('two', 0.4) if HX else 0.4))))]) if z8_ else set()
            two_ |= {zi for zi in ZIG_TWO.get(key, {}).get(diff, ()) if zi < len(zigs)}
            zn_ = sum(len(r) * (2 if zi in two_ else 1) for zi, (r, amp) in enumerate(zigs))
            notes, chain = hard_chart(grid, K, pos, ok, F, R, active, MEL, zig_span, first_ok, last_ok, beats_per_sec, S,
                                      int(HARD_X * (HX.get('hard', 1) if HX else 1) * (charts['normal']['count'] + NORM_N)) - zn_)
        else:
            sc = strength * metric * (1.0 + 0.25 * np.clip(loud / 30 + 1, 0, 1))
            if diff == 'easy':
                sc = sc * np.where(pos % 4 == 0, 1.6, 0.6)
            n_beats = (last_ok - first_ok) * beats_per_sec
            target = int(S['per_beat'] * n_beats * float(active.mean()))
            order = np.argsort(-sc)
            pick = np.zeros(K, bool)
            cnt = 0
            for i in order:
                if cnt >= target:
                    break
                if not ok[i] or sc[i] < 0.12:
                    continue
                g = S['gap']
                if pick[max(0, i - g + 1):i + g].any():
                    continue
                pick[i] = True
                cnt += 1
            # 들리는데 너무 오래 비면 채운다 (박 두 개 넘게 · 이지는 네 개)
            gapmax = 16 if diff == 'easy' else 8
            idx = list(np.where(pick)[0])
            i = 0
            while i < len(idx) - 1:
                a, b = idx[i], idx[i + 1]
                if b - a > gapmax:
                    cand = [j for j in range(a + S['pref'] * 2, b - S['pref'] * 2 + 1) if ok[j] and pos[j] % S['pref'] == 0]
                    if cand:
                        j = max(cand, key=lambda q: sc[q] + 0.3 * metric[q])
                        if sc[j] > 0.05:
                            pick[j] = True
                            idx.insert(i + 1, j)
                            continue
                i += 1
            sel = list(np.where(pick)[0])

            # 칸
            lanes = {}
            prev = None
            for i in sel:
                ln = lane_of(i)
                if prev is not None:
                    pi, pl = prev
                    dk = i - pi
                    # 같은 칸 연타 — 8분보다 빠르면(하드) · 4분보다 빠르면(이지·노말) 옆으로
                    lim = 2 if diff == 'hard' else 4
                    if ln == pl and dk < lim:
                        ln = pl + (1 if (pl < 3) else -1)
                    # 무리한 뜀 — 빠를수록 가깝게
                    maxjump = 5 if dk >= 8 else (3 if dk >= 4 else 2)
                    if abs(ln - pl) > maxjump:
                        ln = pl + (maxjump if ln > pl else -maxjump)
                ln = int(min(5, max(0, ln)))
                lanes[i] = ln
                prev = (i, ln)

            notes = []
            used_until = {}                      # 칸 → 길게 누르기가 끝나는 격자
            hold_on = {}                         # 칸 → 지금 길게 누르는 중인가
            chain = 0
            taken = set()
            # 슬라이드 — 고른 노트가 촘촘히 이어지는 곳 (같은 간격 · 높은 소리 쪽)
            n_slide_target = int(S['slide_n'] * (last_ok - first_ok) / 30)   # 30초에 몇 줄
            runs = []
            for step in S['slide_step']:
                j = 0
                while j < len(sel):
                    k = j
                    while k + 1 < len(sel) and sel[k + 1] - sel[k] == step:
                        k += 1
                    if k - j + 1 >= S['slide'][0]:
                        runs.append((j, k))
                    j = k + 1
            runs.sort(key=lambda r: -sum(F['high'][sel[q]] + F['mid'][sel[q]] for q in range(r[0], r[1] + 1)))
            made = 0
            last_slide_t = -99
            for (a, b) in runs:
                if made >= n_slide_target:
                    break
                ln_n = min(S['slide'][1], b - a + 1)
                if any(sel[a + q] in taken for q in range(ln_n)):
                    continue
                t0 = grid[sel[a]]
                if t0 - last_slide_t < (4.0 if diff == 'easy' else 2.0):
                    continue
                # 방향 — 높낮이가 오르면 오른쪽 · 아니면 왼쪽 · 끝 칸 쪽에서는 안쪽으로
                l0 = lanes[sel[a]]
                up = C[sel[a + ln_n - 1]] >= C[sel[a]]
                dirn = 1 if up else -1
                if l0 + dirn * (ln_n - 1) > 5 or l0 + dirn * (ln_n - 1) < 0:
                    dirn = -dirn
                if l0 + dirn * (ln_n - 1) > 5 or l0 + dirn * (ln_n - 1) < 0:
                    l0 = 0 if dirn > 0 else 5
                chain += 1
                for q in range(ln_n):
                    i = sel[a + q]
                    lanes[i] = l0 + dirn * q
                    taken.add(i)
                    notes.append([int(round(grid[i] * 1000)), lanes[i], 2, chain])
                made += 1
                last_slide_t = grid[sel[a + ln_n - 1]]
            # 길게 누르기 — 이어지는 소리가 긴 자리부터 (목표 몫만큼)
            cand_h = []
            for n_i, i in enumerate(sel):
                if i in taken:
                    continue
                nxt = sel[n_i + 1] if n_i + 1 < len(sel) else K - 1
                room = nxt - i - (2 if diff != 'hard' else 1)
                s_len = sustain_len(i, S['hold'][1])
                if s_len < S['hold'][0]:
                    continue
                if diff == 'easy':
                    if room < S['hold'][0]:
                        continue
                    hl = min(s_len, S['hold'][1], room)
                else:
                    hl = min(s_len, S['hold'][1])          # 노말 · 하드 — 누르는 동안 다른 칸이 와도 된다
                for za, zb in zig_span:                    # 지그재그 앞에서 끝낸다 (두 손 다 비운다)
                    if i < za <= i + hl + 1:
                        hl = min(hl, za - i - 2)
                if hl < S['hold'][0]:
                    continue
                cand_h.append((s_len + 0.5 * strength[i], i, hl))
            cand_h.sort(reverse=True)
            want_h = int(len(sel) * S['hold_p'])
            hold_at = {}
            last_end = -1
            for _, i, hl in cand_h:
                if len(hold_at) >= want_h:
                    break
                hold_at[i] = hl
            # 터치 · 길게 누르기
            for n_i, i in enumerate(sel):
                if i in taken:
                    continue
                ln = lanes[i]
                if used_until.get(ln, -1) >= i:
                    # 그 칸은 누르고 있는 중 — 옆 칸으로
                    for cand in (ln + 1, ln - 1, ln + 2, ln - 2):
                        if 0 <= cand <= 5 and used_until.get(cand, -1) < i:
                            ln = cand
                            break
                    else:
                        continue
                # 누르고 있는 칸이 이미 하나면 (노말 · 하드) 두 번째 길게 누르기는 안 만든다 — 한 손은 비워 둔다
                busy = sum(1 for c2, u2 in used_until.items() if u2 >= i and c2 != ln and hold_on.get(c2))
                hl = hold_at.get(i, 0) if busy == 0 else 0
                if hl > 0:
                    dur_ms = int(round((grid[min(K - 1, i + hl)] - grid[i]) * 1000))
                    notes.append([int(round(grid[i] * 1000)), ln, 1, dur_ms])
                    used_until[ln] = i + hl + 1
                    hold_on[ln] = True
                else:
                    notes.append([int(round(grid[i] * 1000)), ln, 0, 0])
                    if used_until.get(ln, -1) < i:
                        hold_on[ln] = False
                    used_until[ln] = max(used_until.get(ln, -1), i)
                # 동시 — 강박에 반대 손 쪽으로 (누르는 중이 아닐 때)
                if S['chord'] > 0 and hl == 0 and busy == 0 and pos[i] % 8 == 0 and F['low'][i] > 0.5 and rng.random() < S['chord'] * 2.5:
                    ln2 = 5 - ln if abs((5 - ln) - ln) >= 2 else (ln + 3) % 6
                    if used_until.get(ln2, -1) < i:
                        notes.append([int(round(grid[i] * 1000)), ln2, 0, 0])
        # 지그재그 — 낮은 음 왼쪽 · 높은 음 오른쪽 칸을 번갈아 (곡의 그 자리 높이로 왼 · 가운데 · 오른 쪽)
        #   양손 — 8분 지그재그 가운데 소리가 큰 줄 (40 % · 적어도 하나)
        two = set()
        z8 = [zi for zi, (r, amp) in enumerate(zigs) if r[1] - r[0] >= 2]
        if z8:
            z8.sort(key=lambda zi: -float(R[zigs[zi][0]].mean()))
            two = set(z8[:max(1, int(math.ceil(len(z8) * (HX.get('two', 0.4) if HX else 0.4))))])
        two |= {zi for zi in ZIG_TWO.get(key, {}).get(diff, ()) if zi < len(zigs)}      # 사용자가 양손으로 정한 줄
        for zi, (r, amp) in enumerate(zigs):
            first_low = PIT[r[1]] > PIT[r[0]]           # 처음이 오르면 처음 음은 낮은 쪽
            if zi in two:
                chain += 1
                cl = chain
                chain += 1
                cr = chain
                for q, i in enumerate(r):
                    low = (q % 2 == 0) == first_low
                    t = int(round(grid[i] * 1000))
                    notes.append([t, 0 if low else 2, 3, cl])
                    notes.append([t, 5 if low else 3, 3, cr])
                continue
            chain += 1
            centre = int(np.clip(np.searchsorted(qs, float(np.median(C[r]))), 0, 5))
            lo = int(np.clip(centre - amp // 2, 0, 5 - amp))
            hi = lo + amp
            for q, i in enumerate(r):
                low = (q % 2 == 0) == first_low
                notes.append([int(round(grid[i] * 1000)), lo if low else hi, 3, chain])
        if OUT_ON is not None:
            notes, out_d = outro_notes(notes, diff, OUT_ON, OUTRO[key])
            if diff == 'normal':
                NORM_N = out_d                                      # 하드 노트 수는 끝 마당을 걷기 전 노말 수에 맞춘다 (몸통 촘촘함 그대로)
        # 길게 누르는 칸에 걸친 다른 노트는 치운다 (같은 칸)
        notes.sort(key=lambda n: (n[0], n[1]))
        clean = []
        holds = []
        for n in notes:
            bad = False
            for h in holds:
                if h[1] == n[1] and h[0] < n[0] <= h[0] + h[3] + 60:
                    bad = True
                    break
            if bad:
                continue
            # 이지 — 길게 누르는 동안 다른 노트도 치운다
            if diff == 'easy' and any(h[0] < n[0] <= h[0] + h[3] + 60 for h in holds):
                continue
            # 같은 시각 같은 칸 겹침
            if clean and clean[-1][0] == n[0] and clean[-1][1] == n[1]:
                continue
            clean.append(n)
            if n[2] == 1:
                holds.append(n)
        # 같은 시각 셋 이상은 둘로
        out = []
        for n in clean:
            same = [m for m in out if m[0] == n[0]]
            if len(same) >= 2:
                continue
            out.append(n)
        out = one_side(out)
        out = hold_gap(out)
        if key in SWING or HX:
            out = lane_gap(out, 120)
        nps = len(out) / max(1, (last_ok - first_ok))
        kinds = {0: 0, 1: 0, 2: 0, 3: 0}
        for n in out:
            kinds[n[2]] += 1
        level = int(round(min(15, max(1, 1.2 + nps * 2.0 + kinds[1] / max(1, len(out)) * 3 + (kinds[2] + kinds[3]) / max(1, len(out)) * 4))))
        level = LV_FIX.get(key, {}).get(diff, level)        # 사용자가 정한 레벨
        charts[diff] = {'level': level, 'count': len(out), 'nps': round(nps, 2), 'kinds': kinds, 'notes': out}
        print(diff, 'notes', len(out), 'nps %.2f' % nps, 'level', level, kinds, 'zigzag', [('%.1fs' % grid[r[0]], len(r), r[1] - r[0], '양손' if zi in two else '') for zi, (r, a) in enumerate(zigs)])

    bars = [int(round(grid[i] * 1000)) for i in range(K) if pos[i] == 0]
    bpms = sorted(set(int(round(60 / (per_curve(t) * 4))) for t in np.arange(1, dur, 5)))
    # 앞머리 지문 — 처음 1.5 초를 1 ms 칸의 크기로 (게임이 받은 곡과 대 보고, 브라우저마다 다른 mp3 앞 공백을 저절로 맞춘다)
    sr1 = sr // 1000
    head = np.abs(x[:sr1 * 1500]).reshape(-1, sr1).mean(axis=1)
    head = [round(float(v), 4) for v in head / (head.max() + 1e-9)]
    data = {'key': key, 'title': title, 'artist': artist, 'dur': int(dur_all * 1000), 'head': head,
            'bpm': bpms[0] if len(bpms) == 1 else [bpms[0], bpms[-1]], 'bars': bars, 'charts': charts}
    out = 'rhythm/' + key + '.json'
    with open(out, 'w') as fp:
        json.dump(data, fp, ensure_ascii=False, separators=(',', ':'))
    print('->', out, 'bpm', data['bpm'], 'bars', len(bars), 'grid', K)


if __name__ == '__main__':
    main()
