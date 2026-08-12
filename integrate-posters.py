#!/usr/bin/env python3
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data.js"
MAP = ROOT / "poster-map.json"

if not DATA.exists():
    raise SystemExit("data.js not found. Put this package inside your StreamFlix site root.")
if not MAP.exists():
    raise SystemExit("poster-map.json not found. Run ./download-posters.sh first.")

s = DATA.read_text(encoding="utf-8")
mapping = json.loads(MAP.read_text(encoding="utf-8"))

# Replace poster/thumb fields by matching the title of each movie object.
pattern = re.compile(r'(\{.*?\n  \},)', re.S)
count = 0

def patch(m):
    global count
    block = m.group(1)
    mt = re.search(r'"title"\s*:\s*"((?:\\.|[^"\\])*)"', block)
    if not mt:
        return block
    title = json.loads('"' + mt.group(1) + '"')
    poster = mapping.get(title)
    if not poster:
        return block
    block2 = re.sub(r'("poster"\s*:\s*)"[^"]*"', lambda x: x.group(1) + json.dumps(poster), block, count=1)
    block2 = re.sub(r'("thumb"\s*:\s*)"[^"]*"', lambda x: x.group(1) + json.dumps(poster), block2, count=1)
    count += 1
    return block2

s2 = pattern.sub(patch, s)
DATA.write_text(s2, encoding="utf-8")
print(f"Updated poster/thumb paths for {count} movies.")
