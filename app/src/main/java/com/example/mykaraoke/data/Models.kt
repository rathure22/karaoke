package com.example.mykaraoke.data

// One entry of catalog.json. Only "file" is required.
data class Song(
    val id: String?,
    val code: String?,
    val title: String?,
    val artist: String?,
    val file: String?,
    val cover: String?
) {
    val displayTitle: String
        get() = title?.takeIf { it.isNotBlank() } ?: file.orEmpty()
}

data class Catalog(val songs: List<Song>?)
