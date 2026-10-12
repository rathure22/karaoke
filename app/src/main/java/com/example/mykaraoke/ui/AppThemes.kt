package com.example.mykaraoke.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

/** A color theme (same palettes as the KINI web desk). key "default" = the app's original dark look. */
class AppTheme(
    val key: String,
    val label: String,
    val light: Boolean,
    val bg: Long,
    val card: Long,
    val hover: Long,
    val fg: Long,
    val muted: Long,
    val line: Long,
    val accent: Long,
    val onAccent: Long,
    val danger: Long
)

val APP_THEMES: List<AppTheme> = listOf(
    AppTheme("midnight", "Midnight", false, 0xFF09090B, 0xFF111114, 0xFF1A1A20, 0xFFF4F4F6, 0xFF8A8A94, 0xFF26262D, 0xFF7AA2FF, 0xFF0A0A0C, 0xFFFF6B6B),
    AppTheme("neon", "Neon", false, 0xFF05050A, 0xFF0D0D17, 0xFF1B1B36, 0xFFF2F2FF, 0xFF9A9AC0, 0xFF2D2D52, 0xFFB57BFF, 0xFF0A0518, 0xFFFF3D81),
    AppTheme("amber", "Amber", false, 0xFF0B0905, 0xFF15110A, 0xFF221B0D, 0xFFFBF3E0, 0xFFA89B7E, 0xFF3A2F17, 0xFFF5B84B, 0xFF1A1100, 0xFFFF7A59),
    AppTheme("ocean", "Ocean", false, 0xFF050B14, 0xFF0B1624, 0xFF12243A, 0xFFE8F1FB, 0xFF7F9BB8, 0xFF1F3552, 0xFF4DA3FF, 0xFF03111F, 0xFFFF6B81),
    AppTheme("matrix", "Matrix", false, 0xFF020603, 0xFF07110A, 0xFF0C2113, 0xFFD6FFE0, 0xFF6FAE80, 0xFF164A26, 0xFF39FF6A, 0xFF00140A, 0xFFFF4D4D),
    AppTheme("paper", "Paper (light)", true, 0xFFF4F1EA, 0xFFFFFDF8, 0xFFEFE9DB, 0xFF1D1B16, 0xFF6B6558, 0xFFD9D2C2, 0xFF3B5BDB, 0xFFFFFFFF, 0xFFD9363E)
)

fun appThemeLabel(key: String): String =
    APP_THEMES.firstOrNull { it.key == key }?.label ?: "Default"

/** Material color scheme for a theme key. Unknown / "default" = the original darkColorScheme(). */
fun appColorScheme(key: String): ColorScheme {
    val t = APP_THEMES.firstOrNull { it.key == key } ?: return darkColorScheme()
    val base = if (t.light) lightColorScheme() else darkColorScheme()
    return base.copy(
        primary = Color(t.accent),
        onPrimary = Color(t.onAccent),
        primaryContainer = Color(t.hover),
        onPrimaryContainer = Color(t.fg),
        secondary = Color(t.accent),
        onSecondary = Color(t.onAccent),
        secondaryContainer = Color(t.hover),
        onSecondaryContainer = Color(t.fg),
        background = Color(t.bg),
        onBackground = Color(t.fg),
        surface = Color(t.bg),
        onSurface = Color(t.fg),
        surfaceVariant = Color(t.hover),
        onSurfaceVariant = Color(t.muted),
        outline = Color(t.muted),
        outlineVariant = Color(t.line),
        error = Color(t.danger),
        surfaceContainer = Color(t.card),
        surfaceContainerLow = Color(t.card),
        surfaceContainerHigh = Color(t.card),
        surfaceContainerHighest = Color(t.hover),
        surfaceContainerLowest = Color(t.bg)
    )
}

/** Tap a theme to apply it right away. Each row shows its background / card / accent colors. */
@Composable
fun ThemePickerDialog(current: String, onPick: (String) -> Unit, onDismiss: () -> Unit) {
    val keys = listOf("default") + APP_THEMES.map { it.key }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Choose theme") },
        text = {
            LazyColumn {
                items(keys, key = { it }) { k ->
                    val t = APP_THEMES.firstOrNull { it.key == k }
                    Row(
                        Modifier.fillMaxWidth().clickable { onPick(k) }.padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = k == current, onClick = { onPick(k) })
                        Text(
                            appThemeLabel(k),
                            modifier = Modifier.weight(1f).padding(start = 4.dp)
                        )
                        val dots = if (t == null) listOf(Color(0xFF1C1B1F), Color(0xFF2B2930), Color(0xFFD0BCFF))
                        else listOf(Color(t.bg), Color(t.card), Color(t.accent))
                        for (c in dots) {
                            Box(
                                Modifier.padding(start = 6.dp).size(22.dp).clip(CircleShape)
                                    .background(c).border(1.dp, Color.Gray, CircleShape)
                            )
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Done") } }
    )
}
