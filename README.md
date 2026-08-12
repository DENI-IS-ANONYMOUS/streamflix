# StreamFlix — Termux 100-Poster Downloader

This package downloads real movie poster images for the 100-title StreamFlix 2026 catalog using TMDB's API and updates `data.js` to point to local poster files.

## Requirements

- Termux
- Python (`pkg install python -y`)
- A TMDB API Read Access Token

TMDB documents Bearer-token authentication and provides an API for movie/image data. See the official developer docs:
https://developer.themoviedb.org/docs/authentication-application

## Install into your StreamFlix site

Copy these files into the same folder as your StreamFlix `data.js`:

- `download-posters.sh`
- `download_posters.py`
- `integrate-posters.py`
- `movie_titles.txt`

Then run:

```bash
chmod +x download-posters.sh
./download-posters.sh
python integrate-posters.py
```

The script prompts for the TMDB Read Access Token so you don't have to store it in the website.

It creates:

- `posters/` — downloaded JPG poster files
- `poster-map.json` — title-to-local-file mapping
- `poster-results.txt` — download/match report

## Important

The website should not contain your TMDB token. Keep the token private and use it only in the Termux downloader.

The downloaded artwork is provided by TMDB. Review TMDB's current terms and attribution requirements before publishing the resulting site.

## Rate limits and misses

TMDB enforces rate limiting. The downloader spaces requests slightly and reports titles for which it cannot find a poster. You can rerun it to retry missing posters.
