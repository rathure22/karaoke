package com.example.mykaraoke

import android.app.Application
import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.TrackSelectionOverride
import androidx.media3.common.Tracks
import androidx.media3.exoplayer.ExoPlayer
import com.example.mykaraoke.data.Catalog
import com.example.mykaraoke.data.JellyfinClient
import com.example.mykaraoke.data.Song
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit

const val MODE_SIMPLE = "simple"
const val MODE_JELLYFIN = "jellyfin"

class KaraokeViewModel(app: Application) : AndroidViewModel(app) {

    private val prefs = app.getSharedPreferences("karaoke", Context.MODE_PRIVATE)
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    val player: ExoPlayer = ExoPlayer.Builder(app).build().apply {
        setAudioAttributes(AudioAttributes.DEFAULT, true)
    }

    // saved connection settings
    private var cfgMode = prefs.getString("mode", MODE_SIMPLE) ?: MODE_SIMPLE
    private var cfgUser = prefs.getString("user", "") ?: ""
    private var cfgPass = prefs.getString("pass", "") ?: ""
    private var cfgLibrary = prefs.getString("library", "") ?: ""

    var serverUrl by mutableStateOf(prefs.getString("url", "") ?: ""); private set
    var songs by mutableStateOf<List<Song>>(emptyList()); private set
    var loading by mutableStateOf(false); private set
    var error by mutableStateOf<String?>(null)
    var query by mutableStateOf("")

    var queue by mutableStateOf<List<Song>>(emptyList()); private set
    var current by mutableStateOf<Song?>(null); private set
    var showPlayer by mutableStateOf(false)

    var audioCount by mutableStateOf(0); private set
    var audioIndex by mutableStateOf(0); private set

    val audioLabel: String
        get() = when {
            audioCount == 2 && audioIndex == 0 -> "Audio: Original"
            audioCount == 2 -> "Audio: Karaoke"
            else -> "Audio ${audioIndex + 1}/$audioCount"
        }

    val filtered: List<Song>
        get() {
            val q = query.trim().lowercase()
            if (q.isEmpty()) return songs
            return songs.filter {
                it.displayTitle.lowercase().contains(q) ||
                    (it.artist ?: "").lowercase().contains(q) ||
                    (it.code ?: "").lowercase().contains(q)
            }
        }

    private val listener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_ENDED) playNext()
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
    }

    // ---------- server / catalog ----------

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
        if (mode == MODE_JELLYFIN) JellyfinClient(http, base).songs(user, pass, library)
        else fetchCatalog(base)
    }

    fun connect(url: String, mode: String, user: String, pass: String, library: String) {
        val base = normalize(url)
        viewModelScope.launch {
            loading = true; error = null
            try {
                songs = fetchSongs(mode, base, user, pass, library)
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
        val base = serverUrl
        if (base.isBlank()) return
        viewModelScope.launch {
            loading = true; error = null
            try {
                songs = fetchSongs(cfgMode, base, cfgUser, cfgPass, cfgLibrary)
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
        songs = emptyList()
        serverUrl = ""
        error = null
        prefs.edit().clear().apply()
        cfgMode = MODE_SIMPLE; cfgUser = ""; cfgPass = ""; cfgLibrary = ""
    }

    // Relative paths are resolved against the server; absolute URLs (Jellyfin) are used as-is.
    private fun urlFor(path: String?): String? =
        if (path.isNullOrBlank()) null else serverUrl.toHttpUrlOrNull()?.resolve(path)?.toString()

    fun coverUrl(song: Song): String? = urlFor(song.cover)

    // ---------- playback / queue ----------

    private fun startSong(song: Song) {
        val url = urlFor(song.file)
        if (url == null) {
            error = "Bad file path"
            return
        }
        error = null
        current = song
        player.setMediaItem(MediaItem.fromUri(url))
        player.prepare()
        player.playWhenReady = true
    }

    fun playNow(song: Song) {
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
        player.stop()
        player.clearMediaItems()
        current = null
        showPlayer = false
        audioCount = 0
        audioIndex = 0
    }

    // Switch between audio tracks (track 1 = original, track 2 = karaoke)
    fun toggleAudio() {
        val groups = player.currentTracks.groups.filter { it.type == C.TRACK_TYPE_AUDIO }
        if (groups.size < 2) return
        val next = (audioIndex + 1) % groups.size
        player.trackSelectionParameters = player.trackSelectionParameters
            .buildUpon()
            .setOverrideForType(TrackSelectionOverride(groups[next].mediaTrackGroup, 0))
            .build()
    }

    override fun onCleared() {
        player.removeListener(listener)
        player.release()
        super.onCleared()
    }
}
