# MyKaraoke 2.0 (phone + Android TV)

Plays karaoke from: (1) MIDI files on the device, (2) videos on your own web server, (3) Jellyfin.

## 1. Local MIDI (your Karaoke_mo pack)
Folder layout used: `<root>/songs/000001 – Title – Artist.mid` (also .kar), optional `<root>/bgv` (videos) and `<root>/bgphoto` (photos).
Default root: `/storage/emulated/0/Karaoke_mo`. Title/artist/code come from the file name, so `idx/` is NOT used.
- First launch: pick **Local MIDI**, tap **Grant file access** (All files access), then **Connect**.
- Android TV without that screen: `adb shell appops set com.example.mykaraoke MANAGE_EXTERNAL_STORAGE allow`
- Lyrics are read from the MIDI (karaoke text/lyric events), highlighted in time. Key +/- and Tempo +/- work while playing.
- Sound = Android's built-in MIDI synth (basic General MIDI). SoundFont (.sf2) is NOT used yet.
- BGV: background video or photos behind the lyrics (Settings > BGV).
- 48,000 songs: the list shows the first 300; type in the search box (title, artist or code) to narrow.

## 2. Video karaoke
MP4 (H.264+AAC) with 2 audio tracks (1 = original, 2 = karaoke); the Audio button switches tracks.
- **Simple server**: folder of videos + `catalog.json` (`python3 server/make_catalog.py /folder`), served by nginx (must support Range).
  `docker run -d -p 8080:80 -v /folder:/usr/share/nginx/html:ro nginx`
- **Jellyfin**: library type "Home Videos and Photos", name files `Artist - Title.mp4`, enter `IP:8096`, user and password.
- 2-audio-track mp4: see `server/mux-example.sh`.

## 3. Settings (Browse screen > Settings)
- Remote server: phone browser opens `http://TV_IP:PORT` (default port 48080, OFF by default) to search, queue, pause, next. Anyone on your Wi-Fi can use it while it is ON.
- Selection dialog in player, hide player buttons.
- Scoring: Off / Random (fun score, not real singing analysis), difficulty, fanfare volume.
- BGV: Off / Videos / Photos, change clip every song, BGV folder.

## 4. Build the APK with GitHub
1. Upload ALL files (including hidden `.github`) to the repo (`git add -A`, `git commit`, `git push`).
2. Actions tab > "Build APK" > download artifact `MyKaraoke-apk`. Without secrets you get a DEBUG apk.
3. Signed release (optional): secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. Never upload the .jks.
4. Tag `v2.0` (`git tag v2.0 && git push origin v2.0`) to also get a GitHub Release with the apk.
Debug builds from GitHub have a different signature each time: uninstall the old app before installing a new one.

## Icon
Adaptive icon (`mipmap-anydpi-v26`) + PNG fallbacks; TV banner `drawable-xhdpi/banner.png`.
test CodeRabbit
