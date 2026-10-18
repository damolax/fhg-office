"""Repair FHG published evidence without erasing sponsor/upline acknowledgements.

Restore each team screenshot from the last original commit, then permanently obscure
ONLY the sender's displayed profile/name (if visible). Every other bit of evidence,
including Oyekunle Olalekan Musodiq and sponsor/upline names, stays readable.
Also materialise valid FHG organisation screenshots as real JPEG assets.
"""
from __future__ import annotations
import base64
import re
import subprocess
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"assets"/"team-results"
FHG=ROOT/"assets"/"fhg-stories"
ORIGINAL_COMMIT="d11717efffd634b68f4a8bb292d5f5312bfa6b6c"
# 420px-wide reference screenshots; only name/avatar patches belonging
# to the person who posted the evidence. All sponsor/upline writing is retained.
POSTER_AREAS={
  "172356.jpg":[(0,0,39,34),(39,4,228,34)],
  "172344.jpg":[(0,0,39,26),(39,0,162,27)],
  "172332.jpg":[(190,394,213,428),(212,396,346,427)],
  "172342.jpg":[],
  "172343.jpg":[(0,0,39,43),(39,0,239,43)],
  "172322.jpg":[],
  "172320.jpg":[(0,0,37,32),(35,0,164,33)],
  "172307.jpg":[],
  "172306.jpg":[(227,485,288,512)],
  "172278.jpg":[(0,10,44,47),(44,10,193,45)],
}

def bbox_for(img, rect):
    scale=img.width/420
    a,b,c,d=rect
    return tuple((max(0,min(dim,round(value*scale))) for value,dim in
                  zip((a,b,c,d),(img.width,img.height,img.width,img.height))))

def privacy_blur(img,rect):
    box=bbox_for(img,rect)
    w,h=box[2]-box[0],box[3]-box[1]
    if w<1 or h<1:return
    crop=img.crop(box)
    # Resampling deliberately destroys letters and recognizable face details.
    low=crop.resize((max(1,w//23),max(1,h//11)),Image.Resampling.BOX)
    masked=low.resize((w,h),Image.Resampling.NEAREST).filter(
        ImageFilter.GaussianBlur(max(2,round(img.width/100))))
    img.paste(masked,box)

def fix_team_images():
    for filename, patches in POSTER_AREAS.items():
        raw=subprocess.check_output([
            "git","show",f"{ORIGINAL_COMMIT}:assets/team-results/{filename}"
        ],cwd=ROOT)
        image=Image.open(BytesIO(raw)).convert("RGB")
        for region in patches:
            privacy_blur(image,region)
        target=BASE/filename
        image.save(target,"JPEG",quality=92,optimize=True,subsampling=0)
        print("Restored context; anonymized sender only:",filename, patches)

def extract_wider_fhg_images():
    page=ROOT/"testimonials.html"
    text=page.read_text(encoding="utf-8")
    FHG.mkdir(parents=True,exist_ok=True)
    names=["ruby-director-house.jpg","ruby-director-milestones.jpg","step-up-bonus.jpg"]
    index=0
    def replace(match):
        nonlocal index
        content=match.group(1)
        try:
            binary=base64.b64decode(content,validate=True)
        except Exception:
            return match.group(0)
        if not (binary.startswith(b"\\xff\\xd8") and binary.endswith(b"\\xff\\xd9")):
            return match.group(0)
        if index>=len(names):
            return match.group(0)
        filename=names[index]
        index+=1
        with Image.open(BytesIO(binary)) as img:
            img.verify()
        (FHG/filename).write_bytes(binary)
        print("Recovered FHG community asset:",filename)
        return "assets/fhg-stories/"+filename
    # Embedded valid pictures are in the same order as the FHG story cards.
    replaced=re.sub(r'data:image/jpeg;base64,([A-Za-z0-9+/=]+)',replace,text)
    if replaced!=text:
        page.write_text(replaced,encoding="utf-8")
    print("Recovered organisation screenshots:",index)

if __name__=="__main__":
    fix_team_images()
    extract_wider_fhg_images()
