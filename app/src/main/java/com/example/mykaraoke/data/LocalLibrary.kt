package com.example.mykaraoke.data

import java.io.File

/** Scans <root>/songs for .mid/.kar files named "000001 – Title – Artist.mid". */
object LocalLibrary {
    private val SEP = Regex("\\s+[–—-]\\s+")
    private val EXT = setOf("mid", "midi", "kar")

    fun isMidi(path: String?): Boolean =
        path != null && path.substringAfterLast('.', "").lowercase() in EXT

    fun scan(root: String): List<Song> {
        val songsDir = File(root, "songs")
        val dir = if (songsDir.isDirectory) songsDir else File(root)
        val files = dir.listFiles()
            ?: throw IllegalStateException("Cannot read $dir (no file access?)")
        val list = files
            .filter { it.isFile && it.extension.lowercase() in EXT }
            .sortedBy { it.name }
            .mapIndexed { i, f -> parse(f, i) }
        if (list.isEmpty()) throw IllegalStateException("No .mid files found in $dir")
        return list
    }

    private fun parse(f: File, index: Int): Song {
        val base = f.nameWithoutExtension
        var parts = base.split(SEP).map { it.trim() }.filter { it.isNotEmpty() }
        var code: String? = null
        if (parts.isNotEmpty() && parts[0].all { it.isDigit() }) {
            code = parts[0]
            parts = parts.drop(1)
        }
        val title: String
        val artist: String
        if (parts.size >= 2) {
            artist = parts.last()
            title = parts.dropLast(1).joinToString(" - ")
        } else if (parts.size == 1) {
            title = parts[0]
            artist = ""
        } else {
            title = base
            artist = ""
        }
        return Song(
            id = code ?: index.toString(),
            code = code ?: "%06d".format(index + 1),
            title = title,
            artist = artist,
            file = f.absolutePath,
            cover = null
        )
    }
}
