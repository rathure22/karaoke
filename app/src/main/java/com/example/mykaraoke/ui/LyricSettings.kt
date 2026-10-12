package com.example.mykaraoke.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

/** "#RRGGBB" for an ARGB int. */
fun hexOf(argb: Int): String = String.format("#%06X", argb and 0xFFFFFF)

/** Parse "#RRGGBB" / "RRGGBB" into an opaque ARGB int, or null if it is not valid. */
fun parseHex(text: String): Int? {
    val t = text.trim().removePrefix("#")
    if (t.length != 6) return null
    val v = t.toLongOrNull(16) ?: return null
    return (0xFF000000L or v).toInt()
}

/** Bright colors that stay readable on a dark / video background. Used for the picker and for "random". */
val LYRIC_COLORS: List<Int> = listOf(
    0xFFFFEB3B, 0xFF0000FF, 0xFFFF5252, 0xFF69F0AE, 0xFF40C4FF, 0xFFE040FB,
    0xFFFFAB40, 0xFF18FFFF, 0xFFFF4081, 0xFFB2FF59, 0xFF7C4DFF, 0xFFFFFFFF
).map { it.toInt() }

/** Colors used when "Random Lyric Color" is on (no pure blue / white: they are hard to see). */
val RANDOM_LYRIC_COLORS: List<Int> = LYRIC_COLORS.filter { it != 0xFF0000FF.toInt() && it != 0xFFFFFFFF.toInt() }

/** Pick one option from a short list. Closes as soon as an option is tapped. */
@Composable
fun <T> ChoiceDialog(
    title: String,
    options: List<T>,
    label: (T) -> String,
    selected: T,
    onPick: (T) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column {
                for (o in options) {
                    Row(
                        Modifier.fillMaxWidth().clickable {
                            onPick(o)
                            onDismiss()
                        }.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = o == selected, onClick = {
                            onPick(o)
                            onDismiss()
                        })
                        Text(label(o), modifier = Modifier.padding(start = 4.dp))
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Close") } }
    )
}

/** Swatches + a hex box. */
@Composable
fun ColorPickerDialog(current: Int, onPick: (Int) -> Unit, onDismiss: () -> Unit) {
    var hex by remember { mutableStateOf(hexOf(current)) }
    val parsed = parseHex(hex)
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Highlight color") },
        text = {
            Column {
                for (row in LYRIC_COLORS.chunked(6)) {
                    Row(
                        Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        for (c in row) {
                            val isCurrent = (parsed ?: current) == c
                            Box(
                                Modifier.size(36.dp)
                                    .clip(CircleShape)
                                    .background(Color(c))
                                    .border(
                                        width = if (isCurrent) 3.dp else 1.dp,
                                        color = if (isCurrent) MaterialTheme.colorScheme.primary else Color.Gray,
                                        shape = CircleShape
                                    )
                                    .clickable { hex = hexOf(c) }
                            )
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = hex,
                    onValueChange = { hex = it.take(7) },
                    label = { Text("Hex (#RRGGBB)") },
                    singleLine = true,
                    isError = parsed == null,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = parsed != null,
                onClick = {
                    if (parsed != null) onPick(parsed)
                    onDismiss()
                }
            ) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun OutlineDialog(current: Float, onSave: (Float) -> Unit, onDismiss: () -> Unit) {
    var v by remember { mutableStateOf(current.coerceIn(0f, 12f).roundToInt().toFloat()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Outline thickness") },
        text = {
            Column {
                Text(if (v <= 0f) "Off" else "Current: ${String.format("%.1f", v)}")
                Slider(value = v, onValueChange = { v = it }, valueRange = 0f..12f, steps = 11)
            }
        },
        confirmButton = {
            TextButton(onClick = {
                onSave(v)
                onDismiss()
            }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

@Composable
fun LyricSizeDialog(
    portrait: Int,
    landscape: Int,
    onSave: (Int, Int) -> Unit,
    onDismiss: () -> Unit
) {
    var p by remember { mutableStateOf(portrait.coerceIn(20, 80).toFloat()) }
    var l by remember { mutableStateOf(landscape.coerceIn(24, 120).toFloat()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Lyric font size") },
        text = {
            Column {
                Text("Portrait: ${p.roundToInt()}")
                Slider(value = p, onValueChange = { p = it }, valueRange = 20f..80f, steps = 59)
                Spacer(Modifier.height(8.dp))
                Text("Landscape: ${l.roundToInt()}")
                Slider(value = l, onValueChange = { l = it }, valueRange = 24f..120f, steps = 95)
            }
        },
        confirmButton = {
            TextButton(onClick = {
                onSave(p.roundToInt(), l.roundToInt())
                onDismiss()
            }) { Text("Save") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } }
    )
}

/** Family for the lyrics: "app" follows the app font, anything else is a specific font. null = system font. */
fun lyricFamily(lyricKey: String, appKey: String): FontFamily? =
    if (lyricKey == "app") appFont(appKey).family else appFont(lyricKey).family

fun lyricFontLabel(lyricKey: String): String =
    if (lyricKey == "app") "Same as app font" else appFont(lyricKey).label

/** Like the app font picker, with an extra "Same as app font" row. Tap to apply right away. */
@Composable
fun LyricFontPickerDialog(
    current: String,
    appKey: String,
    onPick: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val keys = listOf("app") + APP_FONTS.map { it.key }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Lyric font") },
        text = {
            LazyColumn {
                items(keys, key = { it }) { k ->
                    Row(
                        Modifier.fillMaxWidth().clickable { onPick(k) }.padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = k == current, onClick = { onPick(k) })
                        Column(Modifier.padding(start = 4.dp)) {
                            Text(lyricFontLabel(k), style = MaterialTheme.typography.labelMedium)
                            Text(
                                "Mahal kita, Karaoke! Abc 123 ♪",
                                fontFamily = lyricFamily(k, appKey),
                                fontSize = 20.sp,
                                maxLines = 2
                            )
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Done") } }
    )
}
