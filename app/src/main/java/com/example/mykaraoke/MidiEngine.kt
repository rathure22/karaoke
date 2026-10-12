package com.example.mykaraoke

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
// NOTE: if the build says "Unresolved reference: kotlinds", the package name of
// fluidsynth-kmp is different. Fix these 3 imports only (everything else stays the same).
import dev.kotlinds.fluidsynthkmp.AudioConfig
import dev.kotlinds.fluidsynthkmp.Interpolation
import dev.kotlinds.fluidsynthkmp.MidiFilePlayer
import java.io.File

/**
 * Plays a .mid file.
 *  - If [soundFont] returns an existing .sf2 file -> FluidSynth (fluidsynth-kmp), full-quality sound.
 *  - Otherwise (or if FluidSynth fails to start) -> Android's built-in synthesizer (MediaPlayer).
 *
 * Public API is the same as before: start / position (ms) / pause / resume / release.
 */
class MidiEngine(
    private val onEnded: () -> Unit,
    private val onFail: () -> Unit,
    private val soundFont: () -> String?
) {

    private val main = Handler(Looper.getMainLooper())
    private val lock = Any()

    @Volatile private var gen = 0

    // built-in synth
    private var mp: MediaPlayer? = null

    // FluidSynth
    @Volatile private var fs: MidiFilePlayer? = null
    @Volatile private var tempo: TempoMap? = null
    @Volatile private var lastMs = 0

    fun start(path: String, startMs: Int) {
        release()
        val my = ++gen
        val sf = try { soundFont()?.takeIf { File(it).isFile } } catch (e: Exception) { null }
        if (sf == null) {
            startBuiltIn(path, startMs, my)
        } else {
            startFluid(sf, path, startMs, my)
        }
    }

    // ---------------- FluidSynth (SF2) ----------------

    private fun completion(my: Int): () -> Unit = {
        // called on a background thread by the library
        if (my == gen) main.post { if (my == gen) onEnded() }
    }

    private fun startFluid(sf: String, path: String, startMs: Int, my: Int) {
        Thread {
            var player: MidiFilePlayer? = null
            try {
                val map = TempoMap.parse(File(path).readBytes())
                // Big period/buffer: karaoke playback does not need low latency, and this avoids crackling.
                val cfg = AudioConfig(
                    sampleRate = 44100,
                    interpolation = Interpolation.NORMAL,
                    periodSize = 512,
                    periods = 4
                )
                player = MidiFilePlayer(sf, path, cfg)
                synchronized(lock) {
                    if (my == gen) {
                        fs = player
                        tempo = map
                        lastMs = 0
                        player.play(completion(my))
                        if (startMs > 0) player.seekTo(map.msToTick(startMs))
                    } else {
                        try { player.close() } catch (e: Throwable) { }
                    }
                }
            } catch (e: Throwable) {
                try { player?.close() } catch (x: Throwable) { }
                // SF2 failed (bad file / native error): fall back to the built-in synth
                main.post { if (my == gen) startBuiltIn(path, startMs, my) }
            }
        }.start()
    }

    // ---------------- built-in Android synth ----------------

    private fun startBuiltIn(path: String, startMs: Int, my: Int) {
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

    // ---------------- controls ----------------

    /** Current position in milliseconds. */
    val position: Int
        get() {
            val p = fs
            val map = tempo
            if (p != null && map != null) {
                return try {
                    val ms = map.tickToMs(p.currentTick)
                    lastMs = ms
                    ms
                } catch (e: Throwable) {
                    lastMs
                }
            }
            return try { mp?.currentPosition ?: 0 } catch (e: IllegalStateException) { 0 }
        }

    fun pause() {
        val p = fs
        if (p != null) {
            try { p.pause() } catch (e: Throwable) { }
        } else {
            try { mp?.pause() } catch (e: IllegalStateException) { }
        }
    }

    fun resume() {
        val p = fs
        if (p != null) {
            try { p.play(completion(gen)) } catch (e: Throwable) { }
        } else {
            try { mp?.start() } catch (e: IllegalStateException) { }
        }
    }

    fun release() {
        synchronized(lock) {
            gen++
            val p = fs
            fs = null
            tempo = null
            if (p != null) {
                try { p.stop() } catch (e: Throwable) { }
                try { p.close() } catch (e: Throwable) { }
            }
        }
        try { mp?.release() } catch (e: Exception) { }
        mp = null
    }
}

/**
 * Tick <-> millisecond conversion for a Standard MIDI File (reads the tempo map).
 * FluidSynth reports its position in ticks, but the lyrics highlighter works in ms.
 */
private class TempoMap(
    private val segTick: LongArray,
    private val segMs: DoubleArray,
    private val usPerTick: DoubleArray
) {

    fun tickToMs(tick: Long): Int {
        val t = if (tick < 0) 0L else tick
        var lo = 0
        var hi = segTick.size - 1
        while (lo < hi) {
            val mid = (lo + hi + 1) ushr 1
            if (segTick[mid] <= t) lo = mid else hi = mid - 1
        }
        val ms = segMs[lo] + (t - segTick[lo]) * usPerTick[lo] / 1000.0
        return ms.toLong().coerceIn(0L, Int.MAX_VALUE.toLong()).toInt()
    }

    fun msToTick(ms: Int): Long {
        val m = if (ms < 0) 0.0 else ms.toDouble()
        var lo = 0
        var hi = segMs.size - 1
        while (lo < hi) {
            val mid = (lo + hi + 1) ushr 1
            if (segMs[mid] <= m) lo = mid else hi = mid - 1
        }
        return segTick[lo] + ((m - segMs[lo]) * 1000.0 / usPerTick[lo]).toLong()
    }

    companion object {
        private const val DEFAULT_US_PER_QUARTER = 500_000

        private fun u16(b: ByteArray, p: Int) = ((b[p].toInt() and 0xFF) shl 8) or (b[p + 1].toInt() and 0xFF)
        private fun u32(b: ByteArray, p: Int) =
            ((b[p].toLong() and 0xFF) shl 24) or ((b[p + 1].toLong() and 0xFF) shl 16) or
                ((b[p + 2].toLong() and 0xFF) shl 8) or (b[p + 3].toLong() and 0xFF)

        fun parse(b: ByteArray): TempoMap {
            // Fallback: 480 ticks/quarter at 120 bpm
            val fallback = TempoMap(longArrayOf(0L), doubleArrayOf(0.0), doubleArrayOf(DEFAULT_US_PER_QUARTER / 480.0))
            if (b.size < 14 || b[0] != 'M'.code.toByte() || b[1] != 'T'.code.toByte() ||
                b[2] != 'h'.code.toByte() || b[3] != 'd'.code.toByte()
            ) return fallback

            val ntrks = u16(b, 10)
            val division = u16(b, 12)

            // SMPTE time: fixed rate, no tempo map
            if (division and 0x8000 != 0) {
                val fps = 256 - (division shr 8)          // e.g. 24, 25, 29, 30
                val tpf = division and 0xFF
                val realFps = if (fps == 29) 29.97 else fps.toDouble()
                if (realFps <= 0.0 || tpf <= 0) return fallback
                return TempoMap(longArrayOf(0L), doubleArrayOf(0.0), doubleArrayOf(1_000_000.0 / (realFps * tpf)))
            }
            if (division <= 0) return fallback

            // collect tempo events (tick, microseconds per quarter) from all tracks
            val ev = ArrayList<LongArray>()
            var pos = 8 + u32(b, 4).toInt()
            var track = 0
            while (track < ntrks && pos + 8 <= b.size) {
                val len = u32(b, pos + 4)
                val end = minOf(pos + 8L + len, b.size.toLong()).toInt()
                if (b[pos] == 'M'.code.toByte() && b[pos + 1] == 'T'.code.toByte() &&
                    b[pos + 2] == 'r'.code.toByte() && b[pos + 3] == 'k'.code.toByte()
                ) {
                    readTrack(b, pos + 8, end, ev)
                }
                pos = end
                track++
            }

            ev.sortBy { it[0] }
            // build segments (a later event on the same tick wins)
            val ticks = ArrayList<Long>()
            val uspq = ArrayList<Long>()
            ticks.add(0L); uspq.add(DEFAULT_US_PER_QUARTER.toLong())
            for (e in ev) {
                if (e[0] == ticks.last()) {
                    uspq[uspq.size - 1] = e[1]
                } else {
                    ticks.add(e[0]); uspq.add(e[1])
                }
            }

            val n = ticks.size
            val segTick = LongArray(n)
            val segMs = DoubleArray(n)
            val usPer = DoubleArray(n)
            var ms = 0.0
            for (i in 0 until n) {
                segTick[i] = ticks[i]
                usPer[i] = uspq[i].toDouble() / division
                if (i > 0) {
                    ms += (ticks[i] - ticks[i - 1]) * usPer[i - 1] / 1000.0
                }
                segMs[i] = ms
            }
            return TempoMap(segTick, segMs, usPer)
        }

        private fun readTrack(b: ByteArray, start: Int, end: Int, out: ArrayList<LongArray>) {
            var p = start
            var tick = 0L
            var running = 0

            fun vlq(): Long {
                var v = 0L
                while (p < end) {
                    val c = b[p++].toInt() and 0xFF
                    v = (v shl 7) or (c and 0x7F).toLong()
                    if (c and 0x80 == 0) break
                }
                return v
            }

            while (p < end) {
                tick += vlq()
                if (p >= end) break
                var status = b[p].toInt() and 0xFF
                if (status < 0x80) {
                    if (running == 0) return          // malformed
                    status = running                  // running status: data byte follows
                } else {
                    p++
                    if (status < 0xF0) running = status
                }
                when {
                    status == 0xFF -> {
                        if (p >= end) return
                        val type = b[p++].toInt() and 0xFF
                        val len = vlq().toInt()
                        if (type == 0x51 && len == 3 && p + 3 <= end) {
                            val us = ((b[p].toLong() and 0xFF) shl 16) or
                                ((b[p + 1].toLong() and 0xFF) shl 8) or (b[p + 2].toLong() and 0xFF)
                            if (us > 0) out.add(longArrayOf(tick, us))
                        }
                        p += len
                        if (type == 0x2F) return
                    }
                    status == 0xF0 || status == 0xF7 -> {
                        val len = vlq().toInt()
                        p += len
                    }
                    else -> {
                        p += if (status in 0xC0..0xDF) 1 else 2
                    }
                }
            }
        }
    }
}
