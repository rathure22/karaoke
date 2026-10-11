package com.example.mykaraoke.data

enum class ScoreMode { OFF, RANDOM }

enum class Difficulty(val min: Int, val max: Int) {
    EASY(75, 100), MEDIUM(65, 98), HARD(50, 95)
}

enum class Fanfare(val label: String, val volume: Float) {
    OFF("Off", 0f), LOW("Low", 0.3f), MID("Mid", 0.6f), HIGH("High", 1f)
}

enum class BgvMode(val label: String) {
    OFF("Off"), VIDEOS("Videos"), PHOTOS("Photos")
}
