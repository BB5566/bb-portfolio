#!/usr/bin/env python3
"""作品頁分享圖：每件作品一張 1200×630 的 JPG，放在 public/og/{slug}.jpg。

LinkedIn 等平台的預覽卡不保證吃 WebP，所以 og:image 另外給 JPG。
做法：紙色底，封面等比縮小放正中間（不裁切，圖上的字不會被切掉）。

封面換圖或新增作品後重跑：
    python3 frontend/scripts/make-og-images.py
然後把 ProjectShareController::OG_VERSION 與 frontend/src/utils/image.ts 的 OG_VERSION 換新（邊緣快取一天）。
需要 Pillow。
"""

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SEEDER = ROOT / "backend/database/seeders/ProjectSeeder.php"
PUBLIC = ROOT / "frontend/public"
OUT = PUBLIC / "og"

SIZE = (1200, 630)
PAPER = (243, 238, 231)  # 跟紙色封面的底同色，紙色封面放上去看不到接縫
RULE = (217, 211, 199)
MARGIN = 15  # 上下各留 15px

pairs = re.findall(r"'slug' => '([^']+)',.*?'cover_image_url' => '([^'?]+)", SEEDER.read_text(), flags=re.S)

OUT.mkdir(exist_ok=True)
for slug, cover in pairs:
    image = Image.open(PUBLIC / cover.lstrip("/")).convert("RGB")
    height = SIZE[1] - MARGIN * 2
    width = round(image.width * height / image.height)
    image = image.resize((width, height), Image.LANCZOS)

    canvas = Image.new("RGB", SIZE, PAPER)
    left = (SIZE[0] - width) // 2
    # 一圈細線：深色封面放在紙色底上才有邊
    canvas.paste(Image.new("RGB", (width + 2, height + 2), RULE), (left - 1, MARGIN - 1))
    canvas.paste(image, (left, MARGIN))
    canvas.save(OUT / f"{slug}.jpg", quality=88, optimize=True, progressive=True)
    print(f"{slug}.jpg")

print(f"共 {len(pairs)} 張")
