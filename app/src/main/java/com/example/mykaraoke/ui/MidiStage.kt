@file:OptIn(UnstableApi::class, ExperimentalTextApi::class)

package com.example.mykaraoke.ui

import androidx.activity.compose.BackHandler
import android.content.res.Configuration
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.font.FontFamily
import com.example.mykaraoke.data.CountdownStyle
import com.example.mykaraoke.data.LyricAlign
import com.example.mykaraoke.data.LyricAnim
import kotlin.math.ceil
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


/** Everything the lyric settings control, bundled so it can be passed around easily. */
private class LyricStyle(
    val align: LyricAlign,
    val anim: LyricAnim,
    val countdown: CountdownStyle,
    val sung: Color,
    val outline: Float,
    val shadow: Boolean,
    val family: FontFamily?
)

private fun LyricAlign.textAlign(): TextAlign = when (this) {
    LyricAlign.LEFT -> TextAlign.Left
    LyricAlign.CENTER -> TextAlign.Center
    LyricAlign.RIGHT -> TextAlign.Right
}

private fun LyricAlign.horizontal(): Alignment.Horizontal = when (this) {
    LyricAlign.LEFT -> Alignment.Start
    LyricAlign.CENTER -> Alignment.CenterHorizontally
    LyricAlign.RIGHT -> Alignment.End
}

private fun LyricAlign.top(): Alignment = when (this) {
    LyricAlign.LEFT -> Alignment.TopStart
    LyricAlign.CENTER -> Alignment.TopCenter
    LyricAlign.RIGHT -> Alignment.TopEnd
}

/** Text with an optional black outline (a stroked copy drawn underneath the normal text). */
@Composable
private fun OutlinedText(
    text: AnnotatedString,
    style: TextStyle,
    outline: Float,
    modifier: Modifier = Modifier
) {
    Box(modifier) {
        if (outline > 0f) {
            Text(
                text.text,
                modifier = Modifier.fillMaxWidth(),
                style = style.copy(
                    color = Color.Black,
                    shadow = null,
                    drawStyle = Stroke(width = outline, join = StrokeJoin.Round)
                )
            )
        }
        Text(text, modifier = Modifier.fillMaxWidth(), style = style)
    }
}

@Composable
private fun LyricLineText(
    line: LyricLine,
    baseMs: Long,
    sung: Color,
    unsung: Color,
    size: TextUnit,
    st: LyricStyle
) {
    val text = buildAnnotatedString {
        for (s in line.syls) {
            withStyle(SpanStyle(color = if (s.timeMs <= baseMs) sung else unsung)) { append(s.text) }
        }
    }
    val style = TextStyle(
        fontFamily = st.family,
        fontSize = size,
        fontWeight = FontWeight.Bold,
        textAlign = st.align.textAlign(),
        shadow = if (st.shadow) Shadow(Color.Black, Offset(3f, 3f), 8f) else null
    )
    OutlinedText(text, style, st.outline, Modifier.padding(horizontal = 16.dp))
}

/** One lyric line, colored by where it is relative to the current line. */
@Composable
private fun StateLine(
    lines: List<LyricLine>,
    i: Int,
    cur: Int,
    baseMs: Long,
    started: Boolean,
    size: TextUnit,
    st: LyricStyle
) {
    val dim = UNSUNG.copy(alpha = 0.65f)
    when {
        i < cur -> LyricLineText(lines[i], Long.MAX_VALUE, st.sung, UNSUNG, size, st)
        i == cur -> LyricLineText(lines[i], if (started) baseMs else -1L, st.sung, UNSUNG, size, st)
        else -> LyricLineText(lines[i], -1L, dim, dim, size, st)
    }
}

/** The lines shown for one "page": 4 lines (portrait option) or current + next line. */
@Composable
private fun LyricsBody(
    lines: List<LyricLine>,
    key: Int,
    cur: Int,
    baseMs: Long,
    started: Boolean,
    four: Boolean,
    size: Float,
    st: LyricStyle
) {
    Column(horizontalAlignment = st.align.horizontal(), modifier = Modifier.fillMaxWidth()) {
        if (four) {
            val from = key * 4
            val to = minOf(from + 4, lines.size)
            for (i in from until to) {
                if (i > from) Spacer(Modifier.height(10.dp))
                StateLine(lines, i, cur, baseMs, started, size.sp, st)
            }
        } else {
            if (key in lines.indices) {
                StateLine(lines, key, cur, baseMs, started, size.sp, st)
            }
            Spacer(Modifier.height(18.dp))
            val next = lines.getOrNull(key + 1)
            if (next != null) {
                val dim = UNSUNG.copy(alpha = 0.65f)
                LyricLineText(next, -1L, dim, dim, (size * 0.7f).sp, st)
            }
        }
    }
}

@Composable
private fun CountdownView(remainingMs: Long, st: LyricStyle, size: Float) {
    val secs = ceil(remainingMs / 1000.0).toInt().coerceIn(1, 4)
    val textStyle = TextStyle(
        fontFamily = st.family,
        fontSize = (size * 0.9f).sp,
        fontWeight = FontWeight.Bold,
        color = st.sung,
        shadow = if (st.shadow) Shadow(Color.Black, Offset(3f, 3f), 8f) else null
    )
    when (st.countdown) {
        CountdownStyle.OFF -> {}
        CountdownStyle.TEXT -> Text("$secs", style = textStyle)
        CountdownStyle.TEXT_ANIMATED -> {
            val scale = remember { Animatable(1f) }
            LaunchedEffect(secs) {
                scale.snapTo(1.6f)
                scale.animateTo(1f, tween(700))
            }
            Text(
                "$secs",
                style = textStyle,
                modifier = Modifier.graphicsLayer {
                    scaleX = scale.value
                    scaleY = scale.value
                }
            )
        }
        CountdownStyle.DOTS -> Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            repeat(secs) {
                Box(Modifier.size((size * 0.35f).dp).clip(CircleShape).background(st.sung))
            }
        }
    }
}

@Composable
private fun LyricsView(
    lines: List<LyricLine>,
    baseMs: Long,
    title: String,
    artist: String,
    st: LyricStyle,
    sizePortrait: Int,
    sizeLandscape: Int,
    fourLinesSetting: Boolean
) {
    val portrait = LocalConfiguration.current.orientation == Configuration.ORIENTATION_PORTRAIT
    val size = (if (portrait) sizePortrait else sizeLandscape).toFloat()

    if (lines.isEmpty()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            val titleStyle = TextStyle(
                fontFamily = st.family,
                fontSize = 52.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                textAlign = TextAlign.Center,
                shadow = if (st.shadow) Shadow(Color.Black, Offset(3f, 3f), 8f) else null
            )
            OutlinedText(AnnotatedString(title), titleStyle, st.outline)
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
    val started = idx >= 0
    val four = fourLinesSetting && portrait
    val key = if (four) cur / 4 else cur

    // Countdown: shown in the last 4 seconds before a line that comes after a long gap
    // (song intro or an instrumental break).
    var remaining = 0L
    if (st.countdown != CountdownStyle.OFF) {
        val up = lines.indexOfFirst { it.startMs > baseMs }
        if (up >= 0) {
            val prevEnd = if (up > 0) lines[up - 1].syls.lastOrNull()?.timeMs ?: 0L else 0L
            val left = lines[up].startMs - baseMs
            if (left in 1..4000L && lines[up].startMs - prevEnd >= 7000L) remaining = left
        }
    }

    Box(Modifier.fillMaxWidth()) {
        if (st.anim == LyricAnim.NONE) {
            LyricsBody(lines, key, cur, baseMs, started, four, size, st)
        } else {
            AnimatedContent(
                targetState = key,
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.TopCenter,
                transitionSpec = {
                    when (st.anim) {
                        LyricAnim.FADE ->
                            fadeIn(tween(300)) togetherWith fadeOut(tween(200))
                        LyricAnim.SLIDE ->
                            (slideInVertically(tween(300)) { it / 2 } + fadeIn(tween(300))) togetherWith
                                (slideOutVertically(tween(300)) { -it / 2 } + fadeOut(tween(200)))
                        LyricAnim.ZOOM ->
                            (scaleIn(tween(300), initialScale = 0.8f) + fadeIn(tween(300))) togetherWith
                                fadeOut(tween(150))
                        LyricAnim.NONE ->
                            fadeIn(tween(0)) togetherWith fadeOut(tween(0))
                    }
                },
                label = "lyrics"
            ) { k ->
                LyricsBody(lines, k, cur, baseMs, started, four, size, st)
            }
        }
        if (remaining > 0L) {
            Box(
                Modifier.align(st.align.top())
                    .offset(y = -(size * 1.4f).dp)
                    .padding(horizontal = 16.dp)
            ) {
                CountdownView(remaining, st, size)
            }
        }
    }
}

/** Song title card for the first few seconds. With "Randomize intro title style" it gets a random font + color. */
@Composable
private fun IntroTitle(
    title: String,
    artist: String,
    baseMs: Long,
    st: LyricStyle,
    random: Boolean,
    songKey: String?,
    size: Float,
    modifier: Modifier
) {
    val rnd = remember(songKey, random) {
        if (random) {
            val fam = APP_FONTS.filter { it.family != null }.random().family
            Pair(fam, Color(RANDOM_LYRIC_COLORS.random()))
        } else null
    }
    val a = if (baseMs < 4500L) 1f else ((6000L - baseMs) / 1500f).coerceIn(0f, 1f)
    if (title.isBlank() || a <= 0f) return

    val titleStyle = TextStyle(
        fontFamily = rnd?.first ?: st.family,
        fontSize = (size * 1.1f).sp,
        fontWeight = FontWeight.Bold,
        color = rnd?.second ?: Color.White,
        textAlign = TextAlign.Center,
        shadow = if (st.shadow) Shadow(Color.Black, Offset(3f, 3f), 8f) else null
    )
    Column(modifier.alpha(a), horizontalAlignment = Alignment.CenterHorizontally) {
        OutlinedText(AnnotatedString(title), titleStyle, st.outline, Modifier.padding(horizontal = 16.dp))
        if (artist.isNotBlank()) {
            Text(
                artist,
                color = Color.White.copy(alpha = 0.85f),
                fontSize = (size * 0.5f).sp,
                textAlign = TextAlign.Center,
                style = TextStyle(shadow = if (st.shadow) Shadow(Color.Black, Offset(2f, 2f), 6f) else null)
            )
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

    // lyric look (from Settings > Lyrics)
    val songKey = vm.current?.file
    val portrait = LocalConfiguration.current.orientation == Configuration.ORIENTATION_PORTRAIT
    val sungColor = remember(songKey, vm.lyricRandomColor, vm.lyricColor) {
        if (vm.lyricRandomColor) Color(RANDOM_LYRIC_COLORS.random()) else Color(vm.lyricColor)
    }
    val st = LyricStyle(
        align = vm.lyricAlign,
        anim = vm.lyricAnim,
        countdown = vm.countdownStyle,
        sung = sungColor,
        outline = vm.lyricOutline,
        shadow = vm.lyricShadow,
        family = lyricFamily(vm.lyricFontKey, vm.fontKey)
    )

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
            LyricsView(
                vm.lyricLines, baseMs,
                vm.current?.displayTitle ?: "", vm.current?.artist ?: "",
                st, vm.lyricSizePortrait, vm.lyricSizeLandscape, vm.lyricFourLines
            )
        }
        if (vm.lyricLines.isNotEmpty()) {
            IntroTitle(
                title = vm.current?.displayTitle ?: "",
                artist = vm.current?.artist ?: "",
                baseMs = baseMs,
                st = st,
                random = vm.introRandom,
                songKey = songKey,
                size = if (portrait) vm.lyricSizePortrait.toFloat() else vm.lyricSizeLandscape.toFloat(),
                modifier = Modifier.align(Alignment.TopCenter).fillMaxWidth().padding(top = 72.dp)
            )
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
