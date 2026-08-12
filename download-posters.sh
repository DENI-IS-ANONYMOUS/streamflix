#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
POSTER_DIR="$ROOT/posters"
mkdir -p "$POSTER_DIR"

command -v python >/dev/null 2>&1 || { echo "Python is required. Run: pkg install python -y"; exit 1; }

if [ -z "${TMDB_TOKEN:-}" ]; then
  echo "StreamFlix poster downloader"
  echo "TMDB API Read Access Token is required."
  echo "Get it from your TMDB account API settings."
  echo
  read -r -s -p "Paste TMDB Read Access Token: " TMDB_TOKEN
  echo
fi

export TMDB_TOKEN
python "$ROOT/download_posters.py"
