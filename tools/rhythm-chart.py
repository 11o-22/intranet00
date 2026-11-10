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
#        노말   — 8분까지 · 한 박에 1.1 개쯤 · 길게 누르기 · 슬라이드 · 강박에 가끔 동시
#        하드   — 16분까지 · 한 박에 2 개쯤 · 동시 · 길게 누르며 치기 · 긴 슬라이드
#   5. 6칸에 놓는다 — 높낮이를 칸으로 (낮은 소리 왼쪽 · 높은 소리 오른쪽) · 같은 칸 연타 · 무리한 뜀은 고친다
#
#   노트 한 줄 = [시각(ms), 칸(0~5), 종류, 덧값]
#     종류 0 터치 · 1 길게 누르기 (덧값 = 길이 ms) · 2 슬라이드 (덧값 = 줄 번호 — 같은 줄끼리 이어 그린다)
import json, sys, math
import numpy as np
from scipy.io import wavfile
from scipy.signal import stft, find_peaks

HOP = 240                 # 48k 에서 5 ms
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


def main():
    wav, key, title, artist = sys.argv[1:5]
    sr, x = load(wav)
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
    grid = grid + off          # 틀 가운데로
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
        'normal': {'per_beat': 1.05, 'mods': (0, 2, 4, 6, 8, 10, 12, 14), 'gap': 2, 'pref': 2, 'hold': (3, 12), 'hold_p': 0.12, 'slide': (3, 4), 'slide_step': (2,), 'slide_n': 1.0, 'chord': 0.08},
        'hard':   {'per_beat': 1.9, 'mods': tuple(range(16)), 'gap': 1, 'pref': 1, 'hold': (2, 12), 'hold_p': 0.1, 'slide': (4, 6), 'slide_step': (1, 2), 'slide_n': 1.6, 'chord': 0.16},
    }
    charts = {}
    for diff, S in SPEC.items():
        ok = np.array([(grid[i] >= first_ok and grid[i] <= last_ok and active[i] and (pos[i] in S['mods'])) for i in range(K)])
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
        nps = len(out) / max(1, (last_ok - first_ok))
        kinds = {0: 0, 1: 0, 2: 0}
        for n in out:
            kinds[n[2]] += 1
        level = int(round(min(15, max(1, 1.2 + nps * 2.0 + kinds[1] / max(1, len(out)) * 3 + kinds[2] / max(1, len(out)) * 4))))
        charts[diff] = {'level': level, 'count': len(out), 'nps': round(nps, 2), 'kinds': kinds, 'notes': out}
        print(diff, 'notes', len(out), 'nps %.2f' % nps, 'level', level, kinds)

    bars = [int(round(grid[i] * 1000)) for i in range(K) if pos[i] == 0]
    bpms = sorted(set(int(round(60 / (per_curve(t) * 4))) for t in np.arange(1, dur, 5)))
    data = {'key': key, 'title': title, 'artist': artist, 'dur': int(dur * 1000),
            'bpm': bpms[0] if len(bpms) == 1 else [bpms[0], bpms[-1]], 'bars': bars, 'charts': charts}
    out = 'rhythm/' + key + '.json'
    with open(out, 'w') as fp:
        json.dump(data, fp, ensure_ascii=False, separators=(',', ':'))
    print('->', out, 'bpm', data['bpm'], 'bars', len(bars), 'grid', K)


if __name__ == '__main__':
    main()
