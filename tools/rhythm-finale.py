#!/usr/bin/env python3
# ==========================================
# ★ 리듬 게임 듀얼 — 마지막 하이라이트(합주)가 시작되는 때를 채보에 적는다 (2026-11-13)
#   사용자 「리듬 듀얼 마지막에 하이라이트 부분은 둘이서 같이 하는 식으로 바꾸자」
# ==========================================
#
#   python3 tools/rhythm-finale.py            ← rhythm/*.json 전부
#   python3 tools/rhythm-finale.py airplane   ← 그 곡만
#   (ffmpeg 가 있어야 한다 — snd/rhythm-<열쇠>.mp3 를 풀어 소리 크기를 잰다)
#
#   듀얼은 파트(마디 넷 · 8 초쯤)마다 번갈아 치다가, 채보의 "fin"(ms) 부터 곡 끝까지는 둘이 같이 친다.
#   fin 은 파트 머리 가운데 하나다 (rhythm.js duelCuts 와 같은 셈으로 파트를 나눈다).
#
#   고르는 법 — 파트마다 소리 크기(RMS dB · 곡의 큰 쪽 90% 값이 0)와 노트 빽빽함(하드 채보)을 잰다
#     1. 몸통의 끝 E — 뒤에서부터 「크기 -1 dB 이상 · 노트가 가운데값의 60% 이상」인 첫 파트 (그 뒤는 잦아드는 끝 부분)
#     2. E 에서 앞으로 -1 dB 이상이 이어지는 덩어리 = 마지막 후렴
#          · 22 ~ 42 초면 그 머리가 fin
#          · 더 길면 (뒤쪽이 내내 큰 곡) 끝에서 22 ~ 42 초 사이에서 가장 크게 올라서는 파트 (0.4 dB 이상), 없으면 32 초 앞
#          · 더 짧으면 22 초가 되게 앞으로 늘린다
#     3. 같이 치는 몫이 곡의 3 분의 1 을 넘으면 그 안쪽이 될 때까지 뒤로 민다 · 적어도 두 파트(한 번씩)는 혼자 친다
#   곡마다 들어 보고 고치고 싶으면 채보의 "fin" 숫자만 바꾸면 된다 (가까운 파트 머리로 맞춰 쓴다).
import sys, os, re, json, glob, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 22050
PART_MS = 8000            # rhythm.js DC.PART_MS
THR = -1.0                # 이만큼(dB)까지는 「큰 쪽」


def decode(mp3):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def median_js(a):
    s = sorted(a)
    if not s:
        return 0
    m = len(s) >> 1
    return s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2


def cuts_of(ch):
    bars = ch.get('bars') or []
    bl = median_js([bars[i] - bars[i - 1] for i in range(1, len(bars))]) or 2000
    n = max(2, min(8, int(np.floor(PART_MS / bl / 2 + 0.5)) * 2))
    return [bars[i] for i in range(n, len(bars), n)]


def pick(ch, x):
    cuts = cuts_of(ch)
    dur = ch['dur']
    edges = [0] + cuts + [dur]
    P = len(edges) - 1
    if P < 4:
        return None, ''
    db = []
    for k in range(P):
        seg = x[int(edges[k] / 1000 * SR):int(edges[k + 1] / 1000 * SR)]
        db.append(20 * np.log10(np.sqrt(np.mean(seg.astype(np.float64) ** 2)) + 1e-9) if len(seg) else -99.0)
    db = np.array(db)
    db = db - np.percentile(db, 90)
    C = ch['charts'].get('hard') or ch['charts'].get('normal') or ch['charts'].get('easy')
    ts = np.array([n[0] for n in C['notes']])
    den = np.array([((ts >= edges[k] - 40) & (ts < edges[k + 1] - 40)).sum() / ((edges[k + 1] - edges[k]) / 1000) for k in range(P)])
    plen = float(np.median(np.diff(edges[:-1])))
    med = float(np.median(den))
    E = P - 1
    while E > 0 and not (db[E] >= THR and den[E] >= 0.6 * med):
        E -= 1
    s0 = E
    while s0 > 0 and db[s0 - 1] >= THR:
        s0 -= 1
    wmin = max(2, int(np.ceil(22000 / plen)))
    wmax = max(wmin, int(np.floor(42000 / plen)))
    w = int(round(32000 / plen))
    ln = E - s0 + 1
    if ln > wmax:
        best, bs = 0.4, None
        for s in range(E - wmax + 1, E - wmin + 2):
            if s >= 1 and db[s] - db[s - 1] >= best:
                best, bs = db[s] - db[s - 1], s
        s, why = (bs, '올라서는 자리') if bs is not None else (E - w + 1, '끝에서 32 초')
    elif ln < wmin:
        s, why = E - wmin + 1, '22 초가 되게'
    else:
        s, why = s0, '마지막 큰 덩어리'
    s = max(2, s)
    while s < P - 1 and (dur - edges[s]) / dur > 1 / 3:
        s += 1
        why += ' · 3분의 1 안쪽으로'
    note = '파트 %d/%d (%s) · %.1f 초부터 · 같이 %.1f 초 · 혼자 %d/%d 번' % (s, P, why, edges[s] / 1000, (ts[-1] - edges[s]) / 1000, (s + 1) // 2, s // 2)
    return int(edges[s]), note


def main():
    keys = sys.argv[1:] or sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(ROOT, 'rhythm', '*.json')))
    for key in keys:
        path = os.path.join(ROOT, 'rhythm', key + '.json')
        txt = open(path, encoding='utf-8').read()
        ch = json.loads(txt)
        fin, note = pick(ch, decode(os.path.join(ROOT, 'snd', 'rhythm-' + key + '.mp3')))
        if fin is None:
            print('%-12s 너무 짧다 — 적지 않음' % key)
            continue
        # 나머지는 건드리지 않는다 — "dur" 바로 뒤에 끼워 넣는다 (이미 있으면 바꾼다)
        new, n = re.subn(r'"dur":(\d+),(?:"fin":\d+,)?', lambda m: '"dur":%s,"fin":%d,' % (m.group(1), fin), txt, count=1)
        if n != 1 or json.loads(new).get('fin') != fin:
            raise SystemExit(key + ': "dur" 자리를 찾지 못했다')
        if new != txt:
            open(path, 'w', encoding='utf-8').write(new)
        print('%-12s fin %6d  %s' % (key, fin, note))


if __name__ == '__main__':
    main()
