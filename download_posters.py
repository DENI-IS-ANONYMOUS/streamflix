#!/usr/bin/env python3
import json, os, re, sys, time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parent
TITLES = ROOT / "movie_titles.txt"
POSTERS = ROOT / "posters"
POSTERS.mkdir(exist_ok=True)
TOKEN = os.environ.get("TMDB_TOKEN", "").strip()

if not TOKEN:
    print("Missing TMDB_TOKEN")
    sys.exit(1)

API = "https://api.themoviedb.org/3/search/movie?query={}&include_adult=false&language=en-US&page=1&year=2026"
IMG = "https://image.tmdb.org/t/p/w500{}"


def slug(s):
    s = s.lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def get_json(url):
    req = Request(url, headers={"Authorization": f"Bearer {TOKEN}", "accept": "application/json", "User-Agent": "StreamFlix-Poster-Downloader/1.0"})
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def download(url, dest):
    req = Request(url, headers={"User-Agent": "StreamFlix-Poster-Downloader/1.0"})
    with urlopen(req, timeout=60) as r, open(dest, "wb") as f:
        f.write(r.read())


titles = [x.strip() for x in TITLES.read_text(encoding="utf-8").splitlines() if x.strip()]
print(f"Found {len(titles)} movie titles.")
failed = []
matched = 0

for i, title in enumerate(titles, 1):
    out = POSTERS / f"{i:03d}-{slug(title)}.jpg"
    if out.exists() and out.stat().st_size > 1000:
        print(f"[{i:03d}/100] exists: {title}")
        matched += 1
        continue
    try:
        data = get_json(API.format(quote(title)))
        results = data.get("results", [])
        # Prefer an exact/near-exact title match with a poster; otherwise first result with poster.
        chosen = None
        nt = re.sub(r"[^a-z0-9]", "", title.lower())
        for r in results:
            rt = re.sub(r"[^a-z0-9]", "", (r.get("title") or "").lower())
            if r.get("poster_path") and rt == nt:
                chosen = r; break
        if not chosen:
            for r in results:
                if r.get("poster_path"):
                    chosen = r; break
        if not chosen:
            failed.append((i, title, "no poster match"))
            print(f"[{i:03d}/100] NO POSTER: {title}")
            continue
        download(IMG.format(chosen["poster_path"]), out)
        matched += 1
        print(f"[{i:03d}/100] {title} -> {chosen.get('title')} ({chosen.get('release_date','')})")
    except (HTTPError, URLError, TimeoutError, Exception) as e:
        failed.append((i, title, str(e)))
        print(f"[{i:03d}/100] ERROR: {title}: {e}")
    time.sleep(0.15)

# Write a simple mapping for the site integration script.
mapping = {}
for i, title in enumerate(titles, 1):
    p = POSTERS / f"{i:03d}-{slug(title)}.jpg"
    mapping[title] = str(p.relative_to(ROOT)).replace("\\", "/") if p.exists() else None
(ROOT / "poster-map.json").write_text(json.dumps(mapping, indent=2, ensure_ascii=False), encoding="utf-8")

(ROOT / "poster-results.txt").write_text(
    "Downloaded/matched: %d/100\nFailed: %d\n\n" % (matched, len(failed)) +
    "\n".join(f"{i}. {title} — {reason}" for i, title, reason in failed),
    encoding="utf-8"
)
print(f"\nDone. Posters matched/downloaded: {matched}/100. Failed: {len(failed)}.")
if failed:
    print("See poster-results.txt for misses.")
