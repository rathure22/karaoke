package com.example.mykaraoke

import android.media.AudioAttributes
import android.media.MediaPlayer

/** Plays a .mid file with Android's built-in synthesizer (MediaPlayer). */
class MidiEngine(private val onEnded: () -> Unit, private val onFail: () -> Unit) {

    private var mp: MediaPlayer? = null
    private var gen = 0

    fun start(path: String, startMs: Int) {
        release()
        val my = ++gen
        val p = MediaPlayer()
        mp = p
        try {
            p.setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            )
            p.setDataSource(path)
            p.setOnPreparedListener {
                if (my == gen) {
                    if (startMs > 0) it.seekTo(startMs)
                    it.start()
                }
            }
            p.setOnCompletionListener { if (my == gen) onEnded() }
            p.setOnErrorListener { _, _, _ ->
                if (my == gen) onFail()
                true
            }
            p.prepareAsync()
        } catch (e: Exception) {
            onFail()
        }
    }

    val position: Int
        get() = try { mp?.currentPosition ?: 0 } catch (e: IllegalStateException) { 0 }

    fun pause() { try { mp?.pause() } catch (e: IllegalStateException) { } }
    fun resume() { try { mp?.start() } catch (e: IllegalStateException) { } }

    fun release() {
        gen++
        try { mp?.release() } catch (e: Exception) { }
        mp = null
    }
}
