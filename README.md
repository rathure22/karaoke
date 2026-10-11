# MyKaraoke (phone + Android TV)

Plays karaoke videos from YOUR own server. One APK works on phone and Android TV.
Songs: MP4 (H.264 + AAC) with 2 audio tracks -> track 1 = original, track 2 = karaoke.
The "Audio" button switches tracks instantly while playing.

## 1. Server (choose ONE)

### Option A: Jellyfin (easiest, nothing to script)
1. Install Jellyfin, add a library (Movies or Home Videos) pointing to your karaoke folder.
2. Name files `Artist - Title.mp4` (the app splits artist/title on " - "). Cover = Jellyfin poster.
3. In the app choose **Jellyfin**, enter `SERVER_IP:8096`, your username/password, and optionally the library name
   (use it if the server also has normal movies, so only karaoke shows).
4. The app plays the ORIGINAL file (static stream), so both audio tracks are kept and the Audio button works.
   Your login is saved on the device (plain SharedPreferences): use a separate Jellyfin user for the app.

### Option B: Simple web server + catalog.json
1. Put the videos in one folder, named `Artist - Title.mp4` (optional cover: same name .jpg/.png).
2. Make the song list:  `python3 server/make_catalog.py /path/to/karaoke`  -> creates `catalog.json`
3. Serve the folder over HTTP (must support Range requests, so don't use `python -m http.server`):
   - Docker:  `docker run -d -p 8080:80 -v /path/to/karaoke:/usr/share/nginx/html:ro nginx`
   - or nginx with `server/nginx.conf`
4. Test in a browser: `http://SERVER_IP:8080/catalog.json`

catalog.json format (you can also write it by hand):
{ "songs": [ { "id": "1", "code": "00001", "title": "Title", "artist": "Artist",
               "file": "Artist - Title.mp4", "cover": "Artist - Title.jpg" } ] }
Only "file" is required. "file"/"cover" are paths relative to the server address (or full URLs).

To make a 2-audio-track mp4 see `server/mux-example.sh`.

## 2. Build with Android Studio (alternative to GitHub, see section 4)
1. Android Studio (Koala or newer) > Open this folder > wait for Gradle sync.
2. Run on phone/TV to test (debug).
3. Signed release: create keystore
   keytool -genkey -v -keystore my-release-key.jks -alias mykaraoke -keyalg RSA -keysize 2048 -validity 10000
   copy `keystore.properties.example` -> `keystore.properties`, fill values,
   then Build > Generate Signed App Bundle/APK > APK > release.
   Keep the .jks and passwords safe.

## 3. Install on TV
- USB stick + file manager on the TV (allow "unknown sources" for that file manager), or
- `adb connect TV_IP` then `adb install app-release.apk`

## Using it
- First launch: type server address (e.g. 192.168.1.10:8080).
- Sing = play now. + Queue = reserve; the next song starts automatically.
- Back (in video) = back to the song list, song keeps playing. "Video" returns to the video.
- Search works on title, artist and the song code.

## 4. Build the APK with GitHub (no Android Studio needed)
1. Create a GitHub repo and upload ALL files of this folder (including the hidden `.github` folder).
   Easiest: install Git, then `git init`, `git add .`, `git commit -m init`, `git remote add origin ...`, `git push -u origin main`.
2. Open the repo > Actions tab > "Build APK" runs automatically on every push (or press "Run workflow").
3. When it is green, open the run > Artifacts > download `MyKaraoke-apk` > unzip > install the .apk.
   Without signing secrets you get a DEBUG apk (installs fine on phone/TV, good enough for personal use).
4. Optional, signed release apk (needed if you want updates to install over the old version later):
   - keytool -genkey -v -keystore my-release-key.jks -alias mykaraoke -keyalg RSA -keysize 2048 -validity 10000
   - base64 -w0 my-release-key.jks   (copy the output)
   - Repo > Settings > Secrets and variables > Actions > New secret, create:
     KEYSTORE_BASE64 (the output above), KEYSTORE_PASSWORD, KEY_ALIAS (mykaraoke), KEY_PASSWORD
   - Next run builds a signed release apk. Keep the .jks safe: NEVER upload it to the repo (.gitignore blocks *.jks).
5. For a download page: `git tag v1.0 && git push origin v1.0` creates a GitHub Release with the apk attached.

## Icon
Launcher icon = adaptive icon (`mipmap-anydpi-v26`, mic on purple) + PNG fallbacks (`mipmap-*dpi`).
TV banner = `drawable-xhdpi/banner.png` (320x180). Replace these files to use your own artwork.
