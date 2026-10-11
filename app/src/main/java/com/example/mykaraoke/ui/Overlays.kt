package com.example.mykaraoke.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.mykaraoke.KaraokeViewModel

/** Pick songs while a song is playing (the "selection dialog"). */
@Composable
fun SongPickerDialog(vm: KaraokeViewModel) {
    Dialog(
        onDismissRequest = { vm.showPicker = false },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(0.94f).fillMaxHeight(0.88f),
            shape = MaterialTheme.shapes.large,
            tonalElevation = 6.dp
        ) {
            Column(Modifier.padding(12.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = vm.query, onValueChange = { vm.query = it },
                        placeholder = { Text("Search title, artist or code") },
                        singleLine = true, modifier = Modifier.weight(1f)
                    )
                    Button(onClick = { vm.showPicker = false }) { Text("Close") }
                }
                val songs = vm.filtered
                LazyColumn(Modifier.weight(1f)) {
                    itemsIndexed(songs, key = { i, s -> "p$i-${s.file}" }) { _, s ->
                        SongRow(vm, s)
                    }
                }
            }
        }
    }
}

private fun scoreMessage(s: Int): String = when {
    s >= 95 -> "Perfect!"
    s >= 85 -> "Excellent!"
    s >= 75 -> "Great job!"
    s >= 65 -> "Good!"
    else -> "Keep singing!"
}

@Composable
fun ScoreOverlay(vm: KaraokeViewModel, score: Int) {
    BackHandler { vm.dismissScore() }
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { runCatching { focus.requestFocus() } }

    Box(
        Modifier.fillMaxSize()
            .background(Color.Black.copy(alpha = 0.88f))
            .pointerInput(Unit) { detectTapGestures { } },
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("SCORE", color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.titleLarge)
            Text("$score", color = Color.White, fontSize = 120.sp, fontWeight = FontWeight.Bold)
            Text(scoreMessage(score), color = Color(0xFFFFD54F), style = MaterialTheme.typography.headlineMedium)
            vm.scoredTitle?.let {
                Spacer(Modifier.height(8.dp))
                Text(
                    it, color = Color.White.copy(alpha = 0.8f),
                    maxLines = 1, overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
            }
            Spacer(Modifier.height(24.dp))
            Button(onClick = { vm.dismissScore() }, modifier = Modifier.focusRequester(focus)) {
                Text(if (vm.queue.isNotEmpty()) "Next song" else "Done")
            }
        }
    }
}

@Composable
fun TextInputDialog(
    title: String,
    initial: String,
    numeric: Boolean,
    onSave: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var text by remember { mutableStateOf(initial) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = if (numeric) it.filter { c -> c.isDigit() }.take(5) else it },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = if (numeric) KeyboardType.Number else KeyboardType.Text)
            )
        },
        confirmButton = { TextButton(onClick = { onSave(text) }) { Text("Save") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}
