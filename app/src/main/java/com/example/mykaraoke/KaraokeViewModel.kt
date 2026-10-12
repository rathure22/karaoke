@file:OptIn(UnstableApi::class)

package com.example.mykaraoke

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.Tracks
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import com.example.mykaraoke.data.BgvMode
import com.example.mykaraoke.data.Catalog
import com.example.mykaraoke.data.Difficulty
import com.example.mykaraoke.data.Fanfare
import com.example.mykaraoke.data.JellyfinClient
import com.example.mykaraoke.data.LocalLibrary
import com.example.mykaraoke.data.LyricLine
import com.example.mykaraoke.data.MidiTools
import com.example.mykaraoke.data.ScoreMode
import com.example.mykaraoke.data.Song
import com.example.mykaraoke.remote.RemoteHost
import com.example.mykaraoke.remote.RemoteServer
import com.google.gson.Gson
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.net.Inet4Address
import java.net.NetworkInterface
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.random.Random

const val MODE_SIMPLE = "simple"
const val MODE_JELLYFIN = "jellyfin"
const val MODE_LOCAL = "local"
const val DEFAULT_LOCAL_PATH = "/storage/emulated/0/Karaoke_mo"
private const val MAX_SHOWN = 300

class KaraokeViewModel(app: Application) : AndroidViewModel(app), RemoteHost {

    private val prefs = app.getSharedPreferences("karaoke", Context.MODE_PRIVATE)
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    // video player (simple server / Jellyfin)
    val player: ExoPlayer = ExoPlayer.Builder(app).build().apply {
        setAudioAttributes(AudioAttributes.DEFAULT, true)
    }

    // silent looping background video (MIDI songs)
    val bgPlayer: ExoPlayer = ExoPlayer.Builder(app).build().apply {
        repeatMode = Player.REPEAT_MODE_ALL
        volume = 0f
        trackSelectionParameters = trackSelectionParameters.buildUpon()
            .setTrackTypeDisabled(C.TRACK_TYPE_AUDIO, true)
            .build()
    }

    private val midi = MidiEngine(
        onEnded = { songEnded() },
        onFail = { midiFailed() },
        soundFont = { activeSoundFont() }
    )

    // ---------- saved connection ----------
    private var cfgMode = prefs.getString("mode", MODE_SIMPLE) ?: MODE_SIMPLE
    private var cfgUser = prefs.getString("user", "") ?: ""
    private var cfgPass = prefs.getString("pass", "") ?: ""
    private var cfgLibrary = prefs.getString("library", "") ?: ""

    var serverUrl by mutableStateOf(prefs.getString("url", "") ?: ""); private set
    var songs by mutableStateOf<List<Song>>(emptyList()); private set
    private var keys: List<String> = emptyList()
    var loading by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null)
    var query by mutableStateOf("")

    // ---------- screens ----------
    var showPlayer by mutableStateOf(false)
    var showSettings by mutableStateOf(false)
    var showPicker by mutableStateOf(false)

    // ---------- playback state ----------
    var queue by mutableStateOf<List<Song>>(emptyList()); private set
    var current by mutableStateOf<Song?>(null); private set
    var isMidi by mutableStateOf(false); private set
    var playing by mutableStateOf(false); private set
    var midiPaused by mutableStateOf(false); private set
    var audioCount by mutableStateOf(0); private set
    var audioIndex by mutableStateOf(0); private set
    var keyShift by mutableStateOf(0); private set
    var tempoPercent by mutableStateOf(100); private set
    var lyricLines by mutableStateOf<List<LyricLine>>(emptyList()); private set
    var hasBgVideo by mutableStateOf(false); private set
    var bgPhotos by mutableStateOf<List<String>>(emptyList()); private set

    val playingNow: Boolean get() = if (isMidi) !midiPaused else playing

    val audioLabel: String
        get() = when {
            audioCount == 2 && audioIndex == 0 -> "Audio: Original"
            audioCount == 2 -> "Audio: Karaoke"
            else -> "Audio ${audioIndex + 1}/$audioCount"
        }

    // ---------- scoring ----------
    var score by mutableStateOf<Int?>(null); private set
    var scoredTitle by mutableStateOf<String?>(null); private set
    private var scoreJob: Job? = null

    // ---------- settings ----------
    private inline fun <reified T : Enum<T>> loadEnum(key: String, def: T): T =
        try {
            enumValueOf<T>(prefs.getString(key, def.name) ?: def.name)
        } catch (e: IllegalArgumentException) {
            def
        }

    var scoreMode by mutableStateOf(loadEnum("scoreMode", ScoreMode.OFF)); private set
    var difficulty by mutableStateOf(loadEnum("difficulty", Difficulty.MEDIUM)); private set
    var fanfare by mutableStateOf(loadEnum("fanfare", Fanfare.MID)); private set
    var pickerDialog by mutableStateOf(prefs.getBoolean("pickerDialog", true)); private set
    var hidePlayerButtons by mutableStateOf(prefs.getBoolean("hideButtons", false)); private set
    var bgvMode by mutableStateOf(loadEnum("bgvMode", BgvMode.VIDEOS)); private set
    var bgvChangeEverySong by mutableStateOf(prefs.getBoolean("bgvChange", false)); private set
    var bgvDir by mutableStateOf(prefs.getString("bgvDir", "") ?: ""); private set
    var fontKey by mutableStateOf(prefs.getString("font", "default") ?: "default"); private set
    var soundFontEnabled by mutableStateOf(prefs.getBoolean("sfEnabled", true)); private set
    var soundFontPath by mutableStateOf(prefs.getString("sfPath", "") ?: ""); private set
    var remoteEnabled by mutableStateOf(prefs.getBoolean("remote", false)); private set
    var remotePort by mutableStateOf(prefs.getInt("remotePort", 48080)); private set
    var remoteStatus by mutableStateOf("Off"); private set

    private var remote: RemoteServer? = null
    private var midiJob: Job? = null
    private var midiBytes: ByteArray? = null
    private var midiPath: String = ""
    private var bgvIndex = -1

    private val listener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_ENDED && !isMidi) songEnded()
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            playing = isPlaying
        }

        override fun onTracksChanged(tracks: Tracks) {
            val audio = tracks.groups.filter { it.type == C.TRACK_TYPE_AUDIO }
            audioCount = audio.size
            audioIndex = audio.indexOfFirst { it.isSelected }.coerceAtLeast(0)
        }

        override fun onPlayerError(e: PlaybackException) {
            error = "Cannot play this file (${e.errorCodeName})"
            playNext()
        }
    }

    init {
        player.addListener(listener)
        if (serverUrl.isNotBlank()) load()
        if (remoteEnabled) applyRemote()
    }

    // ================= song list =================

    private fun updateSongs(list: List<Song>) {
        keys = list.map {
            (it.displayTitle + " " + (it.artist ?: "") + " " + (it.code ?: "")).lowercase()
        }
        songs = list
    }

    private var cacheSongs: List<Song>? = null
    private var cacheQuery = ""
    private var cacheResult: List<Song> = emptyList()

    /** Songs matching the search box (max 300 shown; type to narrow). */
    val filtered: List<Song>
        get() {
            val q = query.trim().lowercase()
            val s = songs
            if (s === cacheSongs && q == cacheQuery) return cacheResult
            val res: List<Song> = if (q.isEmpty()) {
                s.take(MAX_SHOWN)
            } else {
                val out = ArrayList<Song>()
                for (i in s.indices) {
                    if (keys[i].contains(q)) {
                        out.add(s[i])
                        if (out.size >= MAX_SHOWN) break
                    }
                }
                out
            }
            cacheSongs = s
            cacheQuery = q
            cacheResult = res
            return res
        }

    // ================= connection =================

    fun hasStorageAccess(): Boolean {
        val app = getApplication<Application>()
        return if (Build.VERSION.SDK_INT >= 30) {
            Environment.isExternalStorageManager()
        } else {
            ContextCompat.checkSelfPermission(app, Manifest.permission.READ_EXTERNAL_STORAGE) ==
                PackageManager.PERMISSION_GRANTED
        }
    }

    private fun normalize(u: String): String {
        var s = u.trim()
        if (!s.startsWith("http://") && !s.startsWith("https://")) s = "http://$s"
        if (!s.endsWith("/")) s += "/"
        return s
    }

    // blocking
    private fun fetchCatalog(base: String): List<Song> {
        val req = Request.Builder().url(base + "catalog.json").build()
        return http.newCall(req).execute().use { r ->
            if (!r.isSuccessful) throw IllegalStateException("Server replied ${r.code}")
            val text = r.body?.string() ?: throw IllegalStateException("Empty response")
            Gson().fromJson(text, Catalog::class.java)?.songs.orEmpty().filter { !it.file.isNullOrBlank() }
        }
    }

    private suspend fun fetchSongs(
        mode: String, base: String, user: String, pass: String, library: String
    ): List<Song> = withContext(Dispatchers.IO) {
        when (mode) {
            MODE_LOCAL -> LocalLibrary.scan(base)
            MODE_JELLYFIN -> JellyfinClient(http, base).songs(user, pass, library)
            else -> fetchCatalog(base)
        }
    }

    fun connect(source: String, mode: String, user: String, pass: String, library: String) {
        val base = if (mode == MODE_LOCAL) source.trim().trimEnd('/') else normalize(source)
        viewModelScope.launch {
            loading = true; error = null
            try {
                if (mode == MODE_LOCAL && !hasStorageAccess()) {
                    throw IllegalStateException("File access not granted yet")
                }
                updateSongs(fetchSongs(mode, base, user, pass, library))
                cfgMode = mode; cfgUser = user; cfgPass = pass; cfgLibrary = library
                serverUrl = base
                prefs.edit()
                    .putString("url", base).putString("mode", mode)
                    .putString("user", user).putString("pass", pass)
                    .putString("library", library)
                    .apply()
            } catch (e: Exception) {
                error = "Cannot connect: ${e.message ?: e.javaClass.simpleName}"
            } finally {
                loading = false
            }
        }
    }

    fun load() {
        autoSfScanned = false
        val base = serverUrl
        if (base.isBlank()) return
        viewModelScope.launch {
            loading = true; error = null
            try {
                updateSongs(fetchSongs(cfgMode, base, cfgUser, cfgPass, cfgLibrary))
            } catch (e: Exception) {
                error = "Cannot load songs: ${e.message ?: e.javaClass.simpleName}"
            } finally {
                loading = false
            }
        }
    }

    fun changeServer() {
        stopPlayback()
        queue = emptyList()
        updateSongs(emptyList())
        serverUrl = ""
        showSettings = false
        error = null
        prefs.edit().remove("url").remove("mode").remove("user").remove("pass").remove("library").apply()
        cfgMode = MODE_SIMPLE; cfgUser = ""; cfgPass = ""; cfgLibrary = ""
    }

    // Relative paths are resolved against the server; absolute URLs (Jellyfin) are used as-is.
    private fun urlFor(path: String?): String? =
        if (path.isNullOrBlank()) null else serverUrl.toHttpUrlOrNull()?.resolve(path)?.toString()

    fun coverUrl(song: Song): String? = urlFor(song.cover)

    // ================= playback / queue =================

    private fun stopEngines() {
        midiJob?.cancel()
        midi.release()
        player.stop()
        player.clearMediaItems()
        bgPlayer.stop()
        bgPlayer.clearMediaItems()
        isMidi = false
        midiPaused = false
        hasBgVideo = false
        bgPhotos = emptyList()
        lyricLines = emptyList()
        audioCount = 0
        audioIndex = 0
    }

    private fun startSong(song: Song) {
        cancelScore()
        error = null
        stopEngines()
        current = song
        val f = song.file
        if (LocalLibrary.isMidi(f)) startMidi(f!!) else startVideo(song)
    }

    private fun startVideo(song: Song) {
        val url = urlFor(song.file)
        if (url == null) {
            error = "Bad file path"
            current = null
            return
        }
        player.setMediaItem(MediaItem.fromUri(url))
        player.prepare()
        player.playWhenReady = true
    }

    private fun startMidi(path: String) {
        isMidi = true
        keyShift = 0
        tempoPercent = 100
        prepareBgv()
        midiJob = viewModelScope.launch {
            try {
                val bytes = withContext(Dispatchers.IO) { File(path).readBytes() }
                midiBytes = bytes
                midiPath = path
                lyricLines = withContext(Dispatchers.Default) {
                    try { MidiTools.parseLyrics(bytes) } catch (e: Exception) { emptyList() }
                }
                startMidiPlayback(0)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = "Cannot play: ${e.message ?: e.javaClass.simpleName}"
                playNext()
            }
        }
    }

    private suspend fun startMidiPlayback(startMs: Int) {
        val bytes = midiBytes ?: return
        val path: String = if (keyShift == 0 && tempoPercent == 100) {
            midiPath
        } else {
            val data = withContext(Dispatchers.Default) { MidiTools.transform(bytes, keyShift, tempoPercent) }
            val f = File(getApplication<Application>().cacheDir, "current.mid")
            withContext(Dispatchers.IO) { f.writeBytes(data) }
            f.absolutePath
        }
        midi.start(path, startMs)
        midiPaused = false
    }

    private fun restartMidi(oldTempo: Int) {
        val pos = midi.position
        val newPos = (pos.toLong() * oldTempo / tempoPercent).toInt()
        midiJob?.cancel()
        midiJob = viewModelScope.launch {
            try {
                startMidiPlayback(newPos)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = "Cannot change key/tempo: ${e.message ?: e.javaClass.simpleName}"
            }
        }
    }

    fun changeKey(delta: Int) {
        if (!isMidi) return
        keyShift = (keyShift + delta).coerceIn(-12, 12)
        restartMidi(tempoPercent)
    }

    fun changeTempo(delta: Int) {
        if (!isMidi) return
        val old = tempoPercent
        tempoPercent = (old + delta).coerceIn(50, 150)
        restartMidi(old)
    }

    fun midiPosition(): Int = midi.position

    fun togglePause() {
        if (current == null) return
        if (isMidi) {
            if (midiPaused) midi.resume() else midi.pause()
            midiPaused = !midiPaused
        } else {
            if (player.isPlaying) player.pause() else player.play()
        }
    }

    fun playNow(song: Song) {
        showPicker = false
        startSong(song)
        showPlayer = true
    }

    fun enqueue(song: Song) {
        if (current == null) playNow(song) else queue = queue + song
    }

    fun removeFromQueue(index: Int) {
        queue = queue.filterIndexed { i, _ -> i != index }
    }

    fun playNext() {
        val next = queue.firstOrNull()
        if (next != null) {
            queue = queue.drop(1)
            startSong(next)
        } else {
            stopPlayback()
        }
    }

    fun stopPlayback() {
        cancelScore()
        stopEngines()
        current = null
        showPlayer = false
        showPicker = false
    }

    // Switch between audio tracks of a video (track 1 = original, track 2 = karaoke)
    fun toggleAudio() {
        val groups = player.currentTracks.groups.filter { it.type == C.TRACK_TYPE_AUDIO }
        if (groups.size < 2) return
        val next = (audioIndex + 1) % groups.size
        player.trackSelectionParameters = player.trackSelectionParameters
            .buildUpon()
            .setOverrideForType(TrackSelectionOverride(groups[next].mediaTrackGroup, 0))
            .build()
    }

    private fun songEnded() {
        val song = current ?: return
        if (score != null) return
        if (scoreMode == ScoreMode.OFF) showScore(song) else playNext()
    }

    private fun midiFailed() {
        error = "MIDI playback failed (this device may not support MIDI)"
        playNext()
    }

    // ================= scoring =================

    private fun showScore(song: Song) {
        scoredTitle = song.displayTitle
        score = Random.nextInt(difficulty.min, difficulty.max + 1)
        playFanfare()
        scoreJob?.cancel()
        scoreJob = viewModelScope.launch {
            delay(10_000)
            dismissScore()
        }
    }

    private fun cancelScore() {
        scoreJob?.cancel()
        scoreJob = null
        score = null
    }

    fun dismissScore() {
        scoreJob?.cancel()
        scoreJob = null
        if (score == null) return
        score = null
        playNext()
    }

    private fun playFanfare() {
        val v = fanfare.volume
        if (v <= 0f) return
        try {
            val mp = MediaPlayer.create(getApplication<Application>(), R.raw.fanfare) ?: return
            mp.setVolume(v, v)
            mp.setOnCompletionListener { it.release() }
            mp.start()
        } catch (e: Exception) {
            // ignore
        }
    }

    // ================= BGV (background visuals for MIDI) =================

    private val bgvRoot: String get() = if (cfgMode == MODE_LOCAL) serverUrl else DEFAULT_LOCAL_PATH

    val bgvDirDisplay: String
        get() = if (bgvDir.isNotBlank()) bgvDir
        else "(Auto) $bgvRoot/" + (if (bgvMode == BgvMode.PHOTOS) "bgphoto" else "bgv")

    private fun prepareBgv() {
        if (bgvMode == BgvMode.OFF) return
        val videos = bgvMode == BgvMode.VIDEOS
        val dir = File(if (bgvDir.isNotBlank()) bgvDir else bgvRoot + (if (videos) "/bgv" else "/bgphoto"))
        val exts = if (videos) setOf("mp4", "mkv", "webm", "3gp", "m4v", "mov") else setOf("jpg", "jpeg", "png", "webp")
        val all = dir.listFiles() ?: return
        val files = all.filter { it.isFile && it.extension.lowercase() in exts }.sortedBy { it.name }
        if (files.isEmpty()) return
        if (videos) {
            val idx = if (bgvChangeEverySong || bgvIndex < 0) Random.nextInt(files.size) else bgvIndex % files.size
            bgvIndex = idx
            bgPlayer.setMediaItem(MediaItem.fromUri(Uri.fromFile(files[idx])))
            bgPlayer.prepare()
            bgPlayer.playWhenReady = true
            hasBgVideo = true
        } else {
            bgPhotos = files.map { it.absolutePath }.shuffled()
        }
    }

    // ================= SoundFont (.sf2) =================

    private var autoSf: String? = null
    private var autoSfScanned = false

    /** Looks for the first .sf2 in the usual folders (non-recursive, so it stays fast). */
    private fun autoSoundFont(): String? {
        if (autoSfScanned) return autoSf
        autoSfScanned = true
        val dirs = listOf(
            "$bgvRoot/soundfonts",
            "$bgvRoot/soundfont",
            bgvRoot,
            "/storage/emulated/0/SongHub/soundfonts",
            "/storage/emulated/0/SongHub",
            "$DEFAULT_LOCAL_PATH/soundfonts"
        ).distinct()
        for (d in dirs) {
            val hit = try {
                File(d).listFiles { f -> f.isFile && f.extension.equals("sf2", ignoreCase = true) }
                    ?.sortedBy { it.name }?.firstOrNull()
            } catch (e: Exception) {
                null
            }
            if (hit != null) {
                autoSf = hit.absolutePath
                return autoSf
            }
        }
        autoSf = null
        return null
    }

    /** The .sf2 file the engine should use, or null = Android's built-in synth. */
    private fun activeSoundFont(): String? {
        if (!soundFontEnabled) return null
        if (soundFontPath.isNotBlank()) return soundFontPath.takeIf { File(it).isFile }
        return autoSoundFont()
    }

    val soundEngineStatus: String get() = MidiEngine.status

    val soundFontDisplay: String
        get() = when {
            !soundFontEnabled -> "Off: using Android's built-in synth"
            soundFontPath.isNotBlank() ->
                if (File(soundFontPath).isFile) soundFontPath else "$soundFontPath (file not found: using built-in synth)"
            else -> autoSoundFont()?.let { "(Auto) $it" } ?: "(Auto) no .sf2 found: using built-in synth"
        }

    fun updateSoundFontEnabled(on: Boolean) {
        soundFontEnabled = on
        prefs.edit().putBoolean("sfEnabled", on).apply()
    }

    fun updateSoundFontPath(path: String) {
        soundFontPath = path.trim()
        autoSfScanned = false
        prefs.edit().putString("sfPath", soundFontPath).apply()
    }

    // ================= font =================

    fun updateFont(key: String) {
        fontKey = key
        prefs.edit().putString("font", key).apply()
    }

    // ================= settings =================

    fun cycleScoreMode() {
        val all = ScoreMode.values()
        scoreMode = all[(scoreMode.ordinal + 1) % all.size]
        prefs.edit().putString("scoreMode", scoreMode.name).apply()
    }

    fun cycleDifficulty() {
        val all = Difficulty.values()
        difficulty = all[(difficulty.ordinal + 1) % all.size]
        prefs.edit().putString("difficulty", difficulty.name).apply()
    }

    fun cycleFanfare() {
        val all = Fanfare.values()
        fanfare = all[(fanfare.ordinal + 1) % all.size]
        prefs.edit().putString("fanfare", fanfare.name).apply()
        playFanfare()
    }

    fun updatePickerDialog(on: Boolean) {
        pickerDialog = on
        prefs.edit().putBoolean("pickerDialog", on).apply()
    }

    fun updateHidePlayerButtons(on: Boolean) {
        hidePlayerButtons = on
        prefs.edit().putBoolean("hideButtons", on).apply()
    }

    fun cycleBgvMode() {
        val all = BgvMode.values()
        bgvMode = all[(bgvMode.ordinal + 1) % all.size]
        prefs.edit().putString("bgvMode", bgvMode.name).apply()
    }

    fun setBgvChange(on: Boolean) {
        bgvChangeEverySong = on
        prefs.edit().putBoolean("bgvChange", on).apply()
    }

    fun updateBgvDir(path: String) {
        bgvDir = path.trim()
        prefs.edit().putString("bgvDir", bgvDir).apply()
    }

    fun updateRemoteEnabled(on: Boolean) {
        remoteEnabled = on
        prefs.edit().putBoolean("remote", on).apply()
        applyRemote()
    }

    fun updateRemotePort(port: Int) {
        remotePort = port
        prefs.edit().putInt("remotePort", port).apply()
        if (remoteEnabled) applyRemote()
    }

    // ================= remote control (web page on the phone) =================

    private fun applyRemote() {
        remote?.stop()
        remote = null
        if (!remoteEnabled) {
            remoteStatus = "Off"
            return
        }
        val server = RemoteServer(remotePort, this)
        viewModelScope.launch {
            val ok = withContext(Dispatchers.IO) { server.start() }
            if (ok) {
                remote = server
                val ip = withContext(Dispatchers.IO) { localIp() } ?: "TV_IP"
                remoteStatus = "Active: http://$ip:$remotePort"
            } else {
                remoteStatus = "Cannot start (port $remotePort in use?)"
            }
        }
    }

    private fun localIp(): String? = try {
        NetworkInterface.getNetworkInterfaces().toList()
            .filter { it.isUp && !it.isLoopback }
            .flatMap { it.inetAddresses.toList() }
            .firstOrNull { it is Inet4Address && !it.isLoopbackAddress && it.isSiteLocalAddress }
            ?.hostAddress
    } catch (e: Exception) {
        null
    }

    private fun <T> onMain(block: () -> T): T {
        if (Looper.myLooper() == Looper.getMainLooper()) return block()
        val latch = CountDownLatch(1)
        var result: Any? = null
        var failure: Throwable? = null
        Handler(Looper.getMainLooper()).post {
            try {
                result = block()
            } catch (t: Throwable) {
                failure = t
            }
            latch.countDown()
        }
        latch.await(5, TimeUnit.SECONDS)
        val f = failure
        if (f != null) throw f
        @Suppress("UNCHECKED_CAST")
        return result as T
    }

    override fun stateJson(): String = onMain {
        Gson().toJson(
            mapOf(
                "current" to current?.displayTitle,
                "playing" to playingNow,
                "audio" to (if (!isMidi && audioCount >= 2) audioLabel else null),
                "queue" to queue.map { it.displayTitle },
                "songCount" to songs.size
            )
        )
    }

    override fun songsJson(query: String, limit: Int): String = onMain {
        val q = query.trim().lowercase()
        val out = ArrayList<Map<String, Any>>()
        for (i in songs.indices) {
            if (q.isEmpty() || keys[i].contains(q)) {
                val s = songs[i]
                out.add(mapOf("i" to i, "title" to s.displayTitle, "artist" to (s.artist ?: ""), "code" to (s.code ?: "")))
                if (out.size >= limit.coerceIn(1, 500)) break
            }
        }
        Gson().toJson(out)
    }

    override fun act(action: String, index: Int) {
        onMain {
            when (action) {
                "play" -> songs.getOrNull(index)?.let { playNow(it) }
                "queue" -> songs.getOrNull(index)?.let { enqueue(it) }
                "unqueue" -> removeFromQueue(index)
                "next" -> if (current != null) playNext()
                "stop" -> stopPlayback()
                "audio" -> toggleAudio()
                "pause" -> togglePause()
            }
            Unit
        }
    }

    override fun remotePage(): String =
        getApplication<Application>().assets.open("remote.html").bufferedReader().use { it.readText() }

    override fun onCleared() {
        remote?.stop()
        midi.release()
        player.removeListener(listener)
        player.release()
        bgPlayer.release()
        super.onCleared()
    }
}
