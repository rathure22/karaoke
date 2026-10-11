@file:OptIn(UnstableApi::class)

package com.example.mykaraoke.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.util.UnstableApi
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import com.example.mykaraoke.KaraokeViewModel
import com.example.mykaraoke.data.LyricLine
import kotlinx.coroutines.delay
import java.io.File

private val SUNG = Color(0xFFFFEB3B)
private val UNSUNG = Color.White

@Composable
private fun PhotoBackground(photos: List<String>) {
    var idx by remember(photos) { mutableStateOf(0) }
    LaunchedEffect(photos) {
        while (photos.size > 1) {
            delay(20_000)
            idx = (idx + 1) % photos.size
        }
    }
    Crossfade(targetState = idx, animationSpec = tween(1500), label = "bgphoto") { i ->
        AsyncImage(
            model = File(photos[i % photos.size]),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Composable
private fun LyricLineText(line: LyricLine, baseMs: Long, sung: Color, unsung: Color, size: TextUnit) {
    val text = buildAnnotatedString {
        for (s in line.syls) {
            withStyle(SpanStyle(color = if (s.timeMs <= baseMs) sung else unsung)) { append(s.text) }
        }
    }
    Text(
        text,
        fontSize = size,
        fontWeight = FontWeight.Bold,
        textAlign = TextAlign.Center,
        style = TextStyle(shadow = Shadow(Color.Black, Offset(3f, 3f), 8f)),
        modifier = Modifier.padding(horizontal = 16.dp)
    )
}

@Composable
private fun LyricsView(lines: List<LyricLine>, baseMs: Long, title: String, artist: String) {
    if (lines.isEmpty()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Text(
                title, color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center, style = TextStyle(shadow = Shadow(Color.Black, Offset(3f, 3f), 8f))
            )
            if (artist.isNotBlank()) {
                Text(artist, color = Color.White.copy(alpha = 0.85f), fontSize = 22.sp, textAlign = TextAlign.Center)
            }
            Spacer(Modifier.height(16.dp))
            Text("(no lyrics in this file)", color = Color.White.copy(alpha = 0.6f), fontSize = 16.sp)
        }
        return
    }
    var idx = -1
    for (i in lines.indices) {
        if (lines[i].startMs <= baseMs + 300) idx = i else break
    }
    val cur = idx.coerceAtLeast(0)
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        LyricLineText(lines[cur], if (idx >= 0) baseMs else -1L, SUNG, UNSUNG, 34.sp)
        Spacer(Modifier.height(18.dp))
        val next = lines.getOrNull(cur + 1)
        if (next != null) {
            LyricLineText(next, -1L, UNSUNG.copy(alpha = 0.65f), UNSUNG.copy(alpha = 0.65f), 28.sp)
        }
    }
}

@Composable
fun MidiStage(vm: KaraokeViewModel) {
    BackHandler { vm.showPlayer = false }
    FullscreenEffect()

    var controls by remember { mutableStateOf(true) }
    var pos by remember { mutableStateOf(0) }
    LaunchedEffect(Unit) {
        while (true) {
            pos = vm.midiPosition()
            delay(40)
        }
    }
    val baseMs = pos.toLong() * vm.tempoPercent / 100
    val hasBg = vm.hasBgVideo || vm.bgPhotos.isNotEmpty()

    Box(Modifier.fillMaxSize().background(Color.Black).clickable { controls = !controls }) {
        if (vm.hasBgVideo) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = vm.bgPlayer
                        useController = false
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                    }
                },
                onRelease = { it.player = null }
            )
        } else if (vm.bgPhotos.isNotEmpty()) {
            PhotoBackground(vm.bgPhotos)
        }
        if (hasBg) Box(Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.35f)))

        Box(Modifier.align(Alignment.Center).fillMaxWidth()) {
            Box(Modifier.align(Alignment.Center)) {
                LyricsView(
                    vm.lyricLines, baseMs,
                    vm.current?.displayTitle ?: "", vm.current?.artist ?: ""
                )
            }
        }

        if (controls && !vm.hidePlayerButtons) {
            Column(Modifier.align(Alignment.TopStart).fillMaxWidth().padding(16.dp)) {
                Text(
                    vm.current?.displayTitle ?: "", color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
                val k = if (vm.keyShift > 0) "+${vm.keyShift}" else vm.keyShift.toString()
                Text(
                    "Key $k   Tempo ${vm.tempoPercent}%" +
                        (vm.queue.firstOrNull()?.let { "   Next: ${it.displayTitle}" } ?: ""),
                    color = Color.White.copy(alpha = 0.8f),
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
            }
            Row(
                Modifier.align(Alignment.BottomStart).fillMaxWidth()
                    .horizontalScroll(rememberScrollState()).padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(onClick = { vm.togglePause() }) { Text(if (vm.midiPaused) "Play" else "Pause") }
                OutlinedButton(onClick = { vm.changeKey(-1) }) { Text("Key −") }
                OutlinedButton(onClick = { vm.changeKey(1) }) { Text("Key +") }
                OutlinedButton(onClick = { vm.changeTempo(-5) }) { Text("Tempo −") }
                OutlinedButton(onClick = { vm.changeTempo(5) }) { Text("Tempo +") }
                OutlinedButton(onClick = { vm.playNext() }) { Text("Next") }
                OutlinedButton(onClick = {
                    if (vm.pickerDialog) vm.showPicker = true else vm.showPlayer = false
                }) { Text("Songs") }
            }
        }
    }
}
