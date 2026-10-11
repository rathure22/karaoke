package com.example.mykaraoke.data

import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.CodingErrorAction

class MidiEvent(val tick: Long, val status: Int, val meta: Int, val data: ByteArray)
class MidiTrack(val events: MutableList<MidiEvent>)
class MidiFile(val format: Int, val division: Int, val tracks: MutableList<MidiTrack>)

data class Syl(val timeMs: Long, val text: String)

data class LyricLine(val syls: List<Syl>) {
    val startMs: Long get() = syls.firstOrNull()?.timeMs ?: 0L
}

/** Small Standard-MIDI-File reader/writer: lyrics extraction, key change and tempo change. */
object MidiTools {

    private class Reader(val b: ByteArray, var p: Int = 0) {
        fun u8(): Int = b[p++].toInt() and 0xFF
        fun u16(): Int = (u8() shl 8) or u8()
        fun u32(): Int = (u16() shl 16) or u16()
        fun vlq(): Int {
            var v = 0
            for (i in 0 until 4) {
                val c = u8()
                v = (v shl 7) or (c and 0x7F)
                if ((c and 0x80) == 0) return v
            }
            return v
        }
        fun bytes(n: Int): ByteArray {
            val r = b.copyOfRange(p, p + n)
            p += n
            return r
        }
    }

    private fun indexOfTag(b: ByteArray, tag: String): Int {
        val t = tag.toByteArray(Charsets.US_ASCII)
        var i = 0
        while (i + t.size <= b.size) {
            var ok = true
            for (j in t.indices) if (b[i + j] != t[j]) { ok = false; break }
            if (ok) return i
            i++
        }
        return -1
    }

    fun read(bytes: ByteArray): MidiFile {
        val start = indexOfTag(bytes, "MThd")
        if (start < 0) throw IllegalArgumentException("Not a MIDI file")
        val r = Reader(bytes, start + 4)
        val hlen = r.u32()
        val format = r.u16()
        val ntrks = r.u16()
        val division = r.u16()
        r.p = start + 8 + hlen
        val tracks = ArrayList<MidiTrack>()
        while (tracks.size < ntrks && r.p + 8 <= bytes.size) {
            val id = r.u32()
            val len = r.u32()
            val end = if (len < 0) bytes.size else minOf(r.p + len, bytes.size)
            if (id == 0x4D54726B) tracks.add(readTrack(r, end))
            r.p = end
        }
        return MidiFile(format, division, tracks)
    }

    private fun readTrack(r: Reader, end: Int): MidiTrack {
        val ev = ArrayList<MidiEvent>()
        var tick = 0L
        var running = 0
        try {
            while (r.p < end) {
                tick += r.vlq()
                var s = r.u8()
                if (s < 0x80) {
                    r.p--
                    s = running
                    if (s == 0) break
                }
                if (s == 0xFF) {
                    val t = r.u8()
                    val n = r.vlq()
                    ev.add(MidiEvent(tick, 0xFF, t, r.bytes(n)))
                    if (t == 0x2F) break
                } else if (s == 0xF0 || s == 0xF7) {
                    val n = r.vlq()
                    ev.add(MidiEvent(tick, s, 0, r.bytes(n)))
                } else {
                    running = s
                    val hi = s and 0xF0
                    val n = if (hi == 0xC0 || hi == 0xD0) 1 else 2
                    ev.add(MidiEvent(tick, s, 0, r.bytes(n)))
                }
            }
        } catch (e: IndexOutOfBoundsException) {
            // truncated file: keep what we have
        }
        return MidiTrack(ev)
    }

    private fun writeVlq(os: ByteArrayOutputStream, value: Long) {
        var x = if (value < 0) 0L else value
        val buf = ArrayList<Int>()
        buf.add((x and 0x7F).toInt())
        x = x shr 7
        while (x > 0) {
            buf.add(((x and 0x7F) or 0x80).toInt())
            x = x shr 7
        }
        for (i in buf.indices.reversed()) os.write(buf[i])
    }

    fun write(f: MidiFile): ByteArray {
        val out = ByteArrayOutputStream()
        fun w16(v: Int) { out.write((v shr 8) and 0xFF); out.write(v and 0xFF) }
        fun w32(v: Int) { w16((v ushr 16) and 0xFFFF); w16(v and 0xFFFF) }
        out.write("MThd".toByteArray(Charsets.US_ASCII))
        w32(6); w16(f.format); w16(f.tracks.size); w16(f.division)
        for (t in f.tracks) {
            val body = ByteArrayOutputStream()
            var last = 0L
            var hasEnd = false
            for (e in t.events) {
                writeVlq(body, e.tick - last)
                last = e.tick
                if (e.status == 0xFF) {
                    if (e.meta == 0x2F) hasEnd = true
                    body.write(0xFF); body.write(e.meta)
                    writeVlq(body, e.data.size.toLong()); body.write(e.data)
                } else if (e.status == 0xF0 || e.status == 0xF7) {
                    body.write(e.status)
                    writeVlq(body, e.data.size.toLong()); body.write(e.data)
                } else {
                    body.write(e.status); body.write(e.data)
                }
            }
            if (!hasEnd) { writeVlq(body, 0); body.write(0xFF); body.write(0x2F); body.write(0) }
            out.write("MTrk".toByteArray(Charsets.US_ASCII))
            w32(body.size())
            out.write(body.toByteArray())
        }
        return out.toByteArray()
    }

    private fun tempoBytes(us: Int): ByteArray =
        byteArrayOf(((us shr 16) and 0xFF).toByte(), ((us shr 8) and 0xFF).toByte(), (us and 0xFF).toByte())

    /** Transpose all notes except drums (channel 10) and scale tempo (percent 100 = original). */
    fun transform(bytes: ByteArray, semitones: Int, tempoPercent: Int): ByteArray {
        val f = read(bytes)
        if (semitones != 0) {
            for (t in f.tracks) {
                for (i in t.events.indices) {
                    val e = t.events[i]
                    val hi = e.status and 0xF0
                    if ((hi == 0x80 || hi == 0x90) && e.status != 0xFF && (e.status and 0x0F) != 9) {
                        val d = e.data.copyOf()
                        d[0] = (((d[0].toInt() and 0x7F) + semitones).coerceIn(0, 127)).toByte()
                        t.events[i] = MidiEvent(e.tick, e.status, e.meta, d)
                    }
                }
            }
        }
        if (tempoPercent != 100 && tempoPercent > 0) {
            var atZero = false
            for (t in f.tracks) {
                for (i in t.events.indices) {
                    val e = t.events[i]
                    if (e.status == 0xFF && e.meta == 0x51 && e.data.size == 3) {
                        val us = ((e.data[0].toInt() and 0xFF) shl 16) or
                            ((e.data[1].toInt() and 0xFF) shl 8) or (e.data[2].toInt() and 0xFF)
                        val nu = (us.toLong() * 100 / tempoPercent).toInt().coerceIn(1, 0xFFFFFF)
                        t.events[i] = MidiEvent(e.tick, 0xFF, 0x51, tempoBytes(nu))
                        if (e.tick == 0L) atZero = true
                    }
                }
            }
            if (!atZero && f.tracks.isNotEmpty()) {
                val nu = (500000L * 100 / tempoPercent).toInt().coerceIn(1, 0xFFFFFF)
                f.tracks[0].events.add(0, MidiEvent(0, 0xFF, 0x51, tempoBytes(nu)))
            }
        }
        return write(f)
    }

    private fun decode(d: ByteArray): String {
        val dec = Charsets.UTF_8.newDecoder()
            .onMalformedInput(CodingErrorAction.REPORT)
            .onUnmappableCharacter(CodingErrorAction.REPORT)
        return try {
            dec.decode(ByteBuffer.wrap(d)).toString()
        } catch (e: CharacterCodingException) {
            String(d, Charsets.ISO_8859_1)
        }
    }

    private class Tempo(val tick: Long, val us: Int)
    private class Txt(val tick: Long, val text: String)

    /** Lyrics (karaoke text/lyric events) with times in ms at ORIGINAL tempo. */
    fun parseLyrics(bytes: ByteArray): List<LyricLine> {
        val f = read(bytes)

        val tempos = ArrayList<Tempo>()
        for (t in f.tracks) for (e in t.events) {
            if (e.status == 0xFF && e.meta == 0x51 && e.data.size == 3) {
                val us = ((e.data[0].toInt() and 0xFF) shl 16) or
                    ((e.data[1].toInt() and 0xFF) shl 8) or (e.data[2].toInt() and 0xFF)
                tempos.add(Tempo(e.tick, us))
            }
        }
        tempos.sortBy { it.tick }
        if (tempos.isEmpty() || tempos[0].tick > 0) tempos.add(0, Tempo(0, 500000))

        val div = if (f.division == 0) 480 else f.division
        val smpte = (div and 0x8000) != 0
        val fixedUsPerTick: Double = if (smpte) {
            val fps = 256 - ((div shr 8) and 0xFF)
            val tpf = div and 0xFF
            if (fps > 0 && tpf > 0) 1_000_000.0 / (fps * tpf) else 1000.0
        } else 0.0

        fun usPerTick(i: Int): Double = if (smpte) fixedUsPerTick else tempos[i].us.toDouble() / div

        val acc = DoubleArray(tempos.size)
        for (i in 1 until tempos.size) {
            acc[i] = acc[i - 1] + (tempos[i].tick - tempos[i - 1].tick) * usPerTick(i - 1)
        }

        fun tickToMs(tick: Long): Long {
            var i = tempos.size - 1
            while (i > 0 && tempos[i].tick > tick) i--
            return ((acc[i] + (tick - tempos[i].tick) * usPerTick(i)) / 1000.0).toLong()
        }

        val lyricMeta = ArrayList<Txt>()
        val perTrack = ArrayList<List<Txt>>()
        for (t in f.tracks) {
            val textEv = ArrayList<Txt>()
            for (e in t.events) {
                if (e.status != 0xFF) continue
                if (e.meta == 0x05) lyricMeta.add(Txt(e.tick, decode(e.data)))
                else if (e.meta == 0x01) textEv.add(Txt(e.tick, decode(e.data)))
            }
            perTrack.add(textEv)
        }

        val raw: List<Txt> = if (lyricMeta.size >= 3) {
            lyricMeta
        } else {
            val best = perTrack.maxByOrNull { tr -> tr.count { !it.text.startsWith("@") } } ?: emptyList()
            best.filter { !it.text.startsWith("@") }
        }
        if (raw.size < 3) return emptyList()

        val lines = ArrayList<LyricLine>()
        var cur = ArrayList<Syl>()
        var curLen = 0
        fun flush() {
            if (cur.isNotEmpty()) {
                lines.add(LyricLine(cur))
                cur = ArrayList()
                curLen = 0
            }
        }

        for (x in raw.sortedBy { it.tick }) {
            var s = x.text.replace("\r\n", "\n").replace('\r', '\n')
            var breakBefore = false
            var breakAfter = false
            if (s.startsWith("/") || s.startsWith("\\")) {
                breakBefore = true
                s = s.substring(1)
            }
            if (s.startsWith("\n")) breakBefore = true
            if (s.endsWith("\n")) breakAfter = true
            s = s.replace("\n", "").filter { it >= ' ' }

            if (breakBefore) flush()
            if (s.isNotEmpty()) {
                cur.add(Syl(tickToMs(x.tick), s))
                curLen += s.length
                if (curLen >= 60 || (curLen >= 44 && s.endsWith(" "))) flush()
            }
            if (breakAfter) flush()
        }
        flush()
        return lines.filter { l -> l.syls.any { it.text.isNotBlank() } }
    }
}
