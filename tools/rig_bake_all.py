import sys,os,json,glob
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import rig_acc
from PIL import Image
out=sys.argv[1]; only=sys.argv[2:]
os.makedirs(out,exist_ok=True)
items=sorted(glob.glob('acc/*/리깅.json')+glob.glob('outfit/*/리깅.json'))
for j in items:
    d=os.path.dirname(j); cfg=json.load(open(j,encoding='utf-8'))
    if cfg.get('still'): continue
    if only and d not in only: continue
    for an in (list(cfg.get('anims')) or [None]) if cfg.get('anims') else [None]:
        name=d.replace('/','_')+('_'+an if an else '')
        rig_acc.bake(d, os.path.join(out,name+'.webp'), s=0.3, maxw=480, anim=an)
        # 확인용 — 네 장
        rig=rig_acc.Rig(d,0.3,anim=an)
        fr=[rig_acc.to_pil(rig.frame(t)) for t in (0,0.25,0.5,0.75)]
        w,h=fr[0].size; sh=Image.new('RGB',(w*4,h),'white')
        for i,f in enumerate(fr): sh.paste(f,(i*w,0))
        sh.resize((w*4//2,h//2)).save(os.path.join(out,'chk_'+name+'.png'))
        print('baked',name,flush=True)
