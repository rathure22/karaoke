package com.example.mykaraoke.ui

import android.app.Activity
import android.view.View
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import com.example.mykaraoke.KaraokeViewModel
import com.example.mykaraoke.MODE_JELLYFIN
import com.example.mykaraoke.MODE_SIMPLE
import com.example.mykaraoke.data.Song

// ---------------------------------------------------------------- Setup

@Composable
private fun ModeButton(text: String, selected: Boolean, onClick: () -> Unit) {
    if (selected) Button(onClick = onClick) { Text(text) }
    else OutlinedButton(onClick = onClick) { Text(text) }
}

@Composable
fun SetupScreen(vm: KaraokeViewModel) {
    var jellyfin by remember { mutableStateOf(false) }
    var url by remember { mutableStateOf("") }
    var user by remember { mutableStateOf("") }
    var pass by remember { mutableStateOf("") }
    var library by remember { mutableStateOf("") }

    Column(
        Modifier.fillMaxSize().systemBarsPadding().verticalScroll(rememberScrollState()).padding(32.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text("MyKaraoke", style = MaterialTheme.typography.headlineLarge)
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            ModeButton("Simple server", !jellyfin) { jellyfin = false }
            ModeButton("Jellyfin", jellyfin) { jellyfin = true }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            if (jellyfin) "Jellyfin server with your karaoke videos in a Movies or Home Videos library"
            else "Web server with a catalog.json (see README)",
            style = MaterialTheme.typography.bodySmall
        )
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = url, onValueChange = { url = it },
            label = { Text(if (jellyfin) "Server (e.g. 192.168.1.10:8096)" else "Server (e.g. 192.168.1.10:8080)") },
            singleLine = true, modifier = Modifier.fillMaxWidth()
        )
        if (jellyfin) {
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = user, onValueChange = { user = it },
                label = { Text("Username") }, singleLine = true, modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = pass, onValueChange = { pass = it },
                label = { Text("Password") }, singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(
                value = library, onValueChange = { library = it },
                label = { Text("Library name (optional)") }, singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
        }
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = { vm.connect(url, if (jellyfin) MODE_JELLYFIN else MODE_SIMPLE, user, pass, library) },
            enabled = !vm.loading && url.isNotBlank() && (!jellyfin || user.isNotBlank()),
            modifier = Modifier.fillMaxWidth()
        ) { Text(if (vm.loading) "Connecting..." else "Connect") }
        vm.error?.let {
            Spacer(Modifier.height(12.dp))
            Text(it, color = MaterialTheme.colorScheme.error)
        }
    }
}

// ---------------------------------------------------------------- Browse

@Composable
fun BrowseScreen(vm: KaraokeViewModel) {
    val songs = vm.filtered

    Column(Modifier.fillMaxSize().systemBarsPadding()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = vm.query, onValueChange = { vm.query = it },
                placeholder = { Text("Search title, artist or code") },
                singleLine = true, modifier = Modifier.weight(1f)
            )
            Button(onClick = { vm.load() }) { Text("Refresh") }
            OutlinedButton(onClick = { vm.changeServer() }) { Text("Server") }
        }

        vm.error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(horizontal = 12.dp))
        }
        if (vm.loading) LinearProgressIndicator(Modifier.fillMaxWidth())
        if (vm.current != null) NowPlayingBar(vm)

        LazyColumn(Modifier.weight(1f)) {
            if (vm.queue.isNotEmpty()) {
                item {
                    Text(
                        "Queue (${vm.queue.size})",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(12.dp)
                    )
                }
                itemsIndexed(vm.queue, key = { i, s -> "q$i-${s.file}" }) { i, s ->
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${i + 1}. ${s.displayTitle}",
                            modifier = Modifier.weight(1f),
                            maxLines = 1, overflow = TextOverflow.Ellipsis
                        )
                        TextButton(onClick = { vm.removeFromQueue(i) }) { Text("✕") }
                    }
                }
                item { HorizontalDivider(Modifier.padding(vertical = 8.dp)) }
            }

            item {
                Text(
                    if (!vm.loading && songs.isEmpty()) "No songs found" else "Songs (${songs.size})",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(12.dp)
                )
            }
            itemsIndexed(songs, key = { i, s -> "s$i-${s.file}" }) { _, song ->
                SongRow(vm, song)
            }
        }
    }
}

@Composable
private fun SongRow(vm: KaraokeViewModel, song: Song) {
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (!song.cover.isNullOrBlank()) {
            AsyncImage(
                model = vm.coverUrl(song),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(48.dp).clip(MaterialTheme.shapes.small)
            )
            Spacer(Modifier.width(12.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(song.displayTitle, maxLines = 1, overflow = TextOverflow.Ellipsis)
            val sub = listOfNotNull(
                song.artist?.takeIf { it.isNotBlank() },
                song.code?.takeIf { it.isNotBlank() }?.let { "#$it" }
            ).joinToString(" • ")
            if (sub.isNotEmpty()) {
                Text(
                    sub, style = MaterialTheme.typography.bodySmall,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
            }
        }
        Spacer(Modifier.width(8.dp))
        Button(onClick = { vm.playNow(song) }) { Text("Sing") }
        Spacer(Modifier.width(8.dp))
        OutlinedButton(onClick = { vm.enqueue(song) }) { Text("+ Queue") }
    }
}

@Composable
private fun NowPlayingBar(vm: KaraokeViewModel) {
    Surface(tonalElevation = 6.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp)) {
            Text("Now playing", style = MaterialTheme.typography.labelSmall)
            Text(
                vm.current?.displayTitle ?: "",
                style = MaterialTheme.typography.titleMedium,
                maxLines = 1, overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.showPlayer = true }) { Text("Video") }
                if (vm.audioCount >= 2) {
                    OutlinedButton(onClick = { vm.toggleAudio() }) { Text(vm.audioLabel) }
                }
                OutlinedButton(onClick = { vm.playNext() }) { Text("Next") }
                TextButton(onClick = { vm.stopPlayback() }) { Text("Stop") }
            }
        }
    }
}

// ---------------------------------------------------------------- Player

@Composable
fun PlayerScreen(vm: KaraokeViewModel) {
    // Back returns to the song list; the song keeps playing (use "Video" to return)
    BackHandler { vm.showPlayer = false }

    // Fullscreen: hide system bars while the video is shown
    val view = LocalView.current
    DisposableEffect(Unit) {
        val window = (view.context as? Activity)?.window
        val controller = window?.let { WindowCompat.getInsetsController(it, view) }
        controller?.hide(WindowInsetsCompat.Type.systemBars())
        controller?.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        onDispose { controller?.show(WindowInsetsCompat.Type.systemBars()) }
    }

    var controlsVisible by remember { mutableStateOf(true) }

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = vm.player
                    useController = true
                    controllerShowTimeoutMs = 4000
                    setShowNextButton(false)
                    setShowPreviousButton(false)
                    setControllerVisibilityListener(
                        PlayerView.ControllerVisibilityListener { v ->
                            controlsVisible = (v == View.VISIBLE)
                        }
                    )
                }
            },
            onRelease = { it.player = null }
        )

        if (controlsVisible) {
            Row(
                Modifier.align(Alignment.TopStart).fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Column(Modifier.weight(1f)) {
                    Text(
                        vm.current?.displayTitle ?: "",
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium,
                        maxLines = 1, overflow = TextOverflow.Ellipsis
                    )
                    vm.queue.firstOrNull()?.let {
                        Text(
                            "Next: ${it.displayTitle}",
                            color = Color.White.copy(alpha = 0.8f),
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 1, overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                if (vm.audioCount >= 2) {
                    Button(onClick = { vm.toggleAudio() }) { Text(vm.audioLabel) }
                }
                OutlinedButton(onClick = { vm.playNext() }) { Text("Next") }
                OutlinedButton(onClick = { vm.showPlayer = false }) { Text("Songs") }
            }
        }
    }
}
