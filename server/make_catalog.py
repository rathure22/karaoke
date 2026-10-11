#!/usr/bin/env python3
"""Scan a folder of karaoke videos and write catalog.json in that folder.

Usage:  python3 make_catalog.py /path/to/karaoke

File naming (recommended):  "Artist - Title.mp4"
Optional cover next to the video with the same name (.jpg/.png/.webp).
"""
import json
import os
import sys

VIDEO_EXT = {".mp4", ".m4v", ".mkv", ".webm"}
COVER_EXT = (".jpg", ".jpeg", ".png", ".webp")

root = sys.argv[1] if len(sys.argv) > 1 else "."

files = []
for dirpath, _, names in os.walk(root):
    for n in names:
        if os.path.splitext(n)[1].lower() in VIDEO_EXT:
            rel = os.path.relpath(os.path.join(dirpath, n), root).replace(os.sep, "/")
            files.append(rel)
files.sort(key=str.lower)

songs = []
for i, rel in enumerate(files, 1):
    base, _ = os.path.splitext(rel)
    name = os.path.basename(base)
    if " - " in name:
        artist, title = name.split(" - ", 1)
    else:
        artist, title = "", name
    cover = next((base + e for e in COVER_EXT if os.path.exists(os.path.join(root, base + e))), None)
    songs.append({
        "id": str(i),
        "code": f"{i:05d}",
        "title": title.strip(),
        "artist": artist.strip(),
        "file": rel,
        "cover": cover,
    })

out = os.path.join(root, "catalog.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump({"songs": songs}, f, ensure_ascii=False, indent=2)
print(f"{len(songs)} songs -> {out}")
