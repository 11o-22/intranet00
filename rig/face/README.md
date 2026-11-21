# 얼굴 · 머리카락 파츠 (3배율 · 2400×2400 기준)

캐릭터마다 **한 장**으로 묶어 둔다 (2026-11-22 — 낱장 288장 → 캐릭터 18장 + 입 1장).

- `face/<이름>.webp` — 그 캐릭터의 눈 · 눈썹 · 머리카락을 빈 곳 없이 잘라 붙인 한 장 (무손실 WebP)
- `face/<이름>.json` — 자리표. `parts` 의 낱장마다
  - `x, y, w, h` : 묶음 그림 안의 자리
  - `ox, oy` : 원래 캔버스(`canvas`, 대개 2400×2400) 안의 자리 — 여기에 그대로 붙이면 원래 낱장과 똑같다
- 낱장 이름
  - 눈 · 눈썹: 흰자위 · 눈동자 · 속눈썹 아래 · 눈꺼풀 · 감긴 눈 · 눈썹 + ` 오`(오른쪽 · 먼 눈) / ` 왼`(왼쪽 · 가까운 눈)
  - 따로 있는 것: 고영은 `눈꺼풀(눈 감기 전용)` · 곽제강 `안경` · 백사헌 `안대` · 호유원 `눈동자 기본/특수` · `감은 눈`
  - 머리카락: 한 가지면 `머리카락`, 여러 가지면 `머리카락/<원래 이름>` (이성해 · 진나솔 · 장허운)
  - 장허운 `머리카락/장허운 뒷머리` 만 원래 800×800 캔버스 (`canvas` 에 적혀 있음)
- `mouth/입.webp` · `mouth/입.json` — 입 22가지 한 장. **모든 캐릭터는 `기본 입` 하나로 통일** (`default`)

겹치는 차례 (뒤 → 앞): 머리(`rig/body/머리.png`) → 입 → [흰자위 → 눈동자 → 속눈썹 아래 → 눈꺼풀] (감으면 이 넷 대신 감긴 눈) → 눈썹 → 머리카락

낱장으로 되살리기 (Python · Pillow):

```python
import json
from PIL import Image
m = json.load(open('rig/face/김솔음.json', encoding='utf8'))
sheet = Image.open('rig/face/' + m['image'])
def part(name):
    p = m['parts'][name]
    can = Image.new('RGBA', tuple(p['canvas']))
    can.paste(sheet.crop((p['x'], p['y'], p['x'] + p['w'], p['y'] + p['h'])), (p['ox'], p['oy']))
    return can
```
