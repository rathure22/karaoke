#!/bin/sh
# Make ONE mp4 with TWO audio tracks: track 1 = original, track 2 = karaoke/instrumental.
# Needs ffmpeg. Video is copied (no re-encode), audio is AAC.
#
# A) video already has the original audio, instrumental is a separate file:
ffmpeg -i video_original.mp4 -i instrumental.m4a \
  -map 0:v -map 0:a -map 1:a \
  -c:v copy -c:a aac -b:a 192k \
  -metadata:s:a:0 title="Original" -metadata:s:a:1 title="Karaoke" \
  "Artist - Title.mp4"
#
# B) the video has no audio, you have both audio files:
# ffmpeg -i video.mp4 -i original.m4a -i instrumental.m4a \
#   -map 0:v -map 1:a -map 2:a -c:v copy -c:a aac -b:a 192k \
#   -metadata:s:a:0 title="Original" -metadata:s:a:1 title="Karaoke" \
#   "Artist - Title.mp4"
