"""
把 Noto Serif TC 粗體裁成只剩首頁大標用到的字（整包 1.3 MB → 十幾 KB）。

改了 ProfileSeeder 的 claim_lines 就要重跑一次，否則新字會退回系統字型：
    pip install fonttools brotli
    python frontend/scripts/subset-claim-font.py

會產生：
    src/assets/fonts/noto-serif-tc-claim-900.woff2  字型檔
    src/assets/fonts/noto-serif-tc-claim-900.txt    裡面收了哪些字（測試用它檢查有沒有漏字）
"""

import re
import tempfile
from pathlib import Path

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont

FRONTEND = Path(__file__).resolve().parent.parent
SEEDER = FRONTEND.parent / 'backend/database/seeders/ProfileSeeder.php'
# fontsource 把字型依字元切成上百個檔，全形標點跟中文字不在同一個檔，所以每個檔都看一次
SOURCES = sorted((FRONTEND / 'node_modules/@fontsource/noto-serif-tc/files').glob('*-900-normal.woff2'))
OUT = FRONTEND / 'src/assets/fonts/noto-serif-tc-claim-900'

block = re.search(r"'claim_lines' => \[(.*?)\]", SEEDER.read_text(encoding='utf-8'), re.S)
lines = re.findall(r"'([^']*)'", block.group(1))
# 大標的字＋常用標點；英數字用 DM Sans，不收
latin = set(' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,')
chars = sorted(set(''.join(lines) + '，。、：；！？「」（）—') - latin)

options = subset.Options()
options.layout_features = ['palt', 'kern']
options.drop_tables += ['BASE', 'STAT', 'vhea', 'vmtx']

# 每個來源檔只留它有的字，最後合成一個檔
pieces = []
remaining = set(chars)
with tempfile.TemporaryDirectory() as tmp:
    for source in SOURCES:
        have = {c for c in remaining if ord(c) in TTFont(source).getBestCmap()}
        if not have:
            continue
        font = subset.load_font(str(source), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=''.join(have))
        subsetter.subset(font)
        piece = Path(tmp) / f'{len(pieces)}.ttf'
        font.save(str(piece))
        pieces.append(str(piece))
        remaining -= have

    merged = Merger().merge(pieces)
    merged.flavor = 'woff2'
    merged.save(str(OUT) + '.woff2')

if remaining:
    raise SystemExit(f'字型裡找不到：{"".join(sorted(remaining))}')
Path(str(OUT) + '.txt').write_text(''.join(chars) + '\n', encoding='utf-8')

print(f'{len(chars)} 個字 → {Path(str(OUT) + ".woff2").stat().st_size / 1024:.1f} KB')
