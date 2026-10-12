package com.example.mykaraoke.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.mykaraoke.KaraokeViewModel
import com.example.mykaraoke.data.CountdownStyle
import com.example.mykaraoke.data.LyricAlign
import com.example.mykaraoke.data.LyricAnim

@Composable
private fun SectionHeader(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 16.dp, top = 20.dp, bottom = 4.dp)
    )
}

/** Which Solar icon goes with which row. Rows without a match keep an empty slot so text lines up. */
private val ROW_ICONS = mapOf(
    "Theme" to "palette",
    "Icon Style" to "settings",
    "Highlight Color" to "palette",
    "Outline Thickness" to "tuning-2",
    "Lyric Font Size" to "tuning-2",
    "Refresh Songs" to "restart",
    "Enable Remote Server" to "power",
    "Hide Player Buttons" to "forbidden-circle",
    "Score Mode" to "chart-2",
    "Scoring Difficulty" to "target",
    "Fanfare Sound" to "rocket"
)

@Composable
private fun SettingRow(
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    trailing: (@Composable () -> Unit)? = null
) {
    Row(
        Modifier.fillMaxWidth().clickable { onClick() }.padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(Modifier.size(40.dp), contentAlignment = Alignment.CenterStart) {
            ROW_ICONS[title]?.let { SolarIcon(it) }
        }
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        if (trailing != null) trailing()
    }
}

@Composable
fun SettingsScreen(vm: KaraokeViewModel, onRequestStorage: () -> Unit) {
    BackHandler { vm.showSettings = false }
    var dialog by remember { mutableStateOf<String?>(null) }

    val solarStyle = if (vm.iconStyle == "auto") themeIconStyle(vm.themeKey) else vm.iconStyle
    CompositionLocalProvider(LocalSolarStyle provides solarStyle) {
    Box(Modifier.fillMaxSize().systemBarsPadding()) {
        LazyColumn(Modifier.fillMaxSize()) {
            item {
                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { vm.showSettings = false }) { Text("← Back") }
                    SolarIcon("settings", size = 28.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("Settings", style = MaterialTheme.typography.headlineMedium)
                }
            }

            item { SectionHeader("LYRICS") }
            item { SettingRow("Lyric Alignment", "Style: ${vm.lyricAlign.label}", onClick = { dialog = "lalign" }) }
            item { SettingRow("Lyric Animation", "Style: ${vm.lyricAnim.label}", onClick = { dialog = "lanim" }) }
            item { SettingRow("Countdown Style", "Style: ${vm.countdownStyle.label}", onClick = { dialog = "lcount" }) }
            item { SettingRow("Highlight Color", "Current: ${hexOf(vm.lyricColor)}", onClick = { dialog = "lcolor" }) }
            item {
                SettingRow(
                    "Random Lyric Color",
                    "Randomized highlight color per song",
                    onClick = { vm.updateLyricRandomColor(!vm.lyricRandomColor) }
                ) { Switch(checked = vm.lyricRandomColor, onCheckedChange = null) }
            }
            item {
                SettingRow(
                    "Outline Thickness",
                    "Current: ${String.format("%.1f", vm.lyricOutline)}",
                    onClick = { dialog = "loutline" }
                )
            }
            item {
                SettingRow(
                    "Lyric Font Size",
                    "Portrait: ${vm.lyricSizePortrait} / Landscape: ${vm.lyricSizeLandscape}",
                    onClick = { dialog = "lsize" }
                )
            }
            item {
                SettingRow(
                    "Lyric Shadow",
                    "Drop shadow for better legibility",
                    onClick = { vm.updateLyricShadow(!vm.lyricShadow) }
                ) { Switch(checked = vm.lyricShadow, onCheckedChange = null) }
            }
            item {
                SettingRow(
                    "4 Line Display (Portrait)",
                    "Show 4 lyric lines in portrait mode",
                    onClick = { vm.updateLyricFourLines(!vm.lyricFourLines) }
                ) { Switch(checked = vm.lyricFourLines, onCheckedChange = null) }
            }
            item {
                SettingRow(
                    "Randomize Intro Title Style",
                    "Randomize song intro title colors and fonts",
                    onClick = { vm.updateIntroRandom(!vm.introRandom) }
                ) { Switch(checked = vm.introRandom, onCheckedChange = null) }
            }
            item { SettingRow("Lyric Font", lyricFontLabel(vm.lyricFontKey), onClick = { dialog = "lfont" }) }

            item { SectionHeader("CONTENT") }
            item {
                SettingRow("Refresh Songs", "Rescan the folder / reload the list", onClick = {
                    vm.load()
                    vm.showSettings = false
                })
            }
            item {
                SettingRow(
                    "File Access",
                    if (vm.hasStorageAccess()) "Granted" else "Not granted: tap to allow (needed for local MIDI)",
                    onClick = onRequestStorage
                )
            }
            item { SettingRow("Change Source", vm.serverUrl, onClick = { vm.changeServer() }) }

            item { SectionHeader("APPEARANCE") }
            item { SettingRow("Theme", appThemeLabel(vm.themeKey), onClick = { dialog = "theme" }) }
            item { SettingRow("Icon Style", iconStyleLabel(vm.iconStyle), onClick = { dialog = "icons" }) }
            item { SettingRow("Font", appFont(vm.fontKey).label, onClick = { dialog = "font" }) }

            item { SectionHeader("REMOTE CONTROL (phone browser)") }
            item {
                SettingRow("Enable Remote Server", vm.remoteStatus, onClick = { vm.updateRemoteEnabled(!vm.remoteEnabled) }) {
                    Switch(checked = vm.remoteEnabled, onCheckedChange = null)
                }
            }
            item { SettingRow("Server Port", "Current: ${vm.remotePort}", onClick = { dialog = "port" }) }

            item { SectionHeader("BEHAVIOR") }
            item {
                SettingRow(
                    "Selection Dialog in Player",
                    if (vm.pickerDialog) "Enabled: pick songs without leaving the player" else "Disabled: Songs button goes back to the list",
                    onClick = { vm.updatePickerDialog(!vm.pickerDialog) }
                ) { Switch(checked = vm.pickerDialog, onCheckedChange = null) }
            }
            item {
                SettingRow(
                    "Hide Player Buttons",
                    if (vm.hidePlayerButtons) "Hidden: use the remote or Back" else "Shown on screen",
                    onClick = { vm.updateHidePlayerButtons(!vm.hidePlayerButtons) }
                ) { Switch(checked = vm.hidePlayerButtons, onCheckedChange = null) }
            }

            item { SectionHeader("SCORING") }
            item { SettingRow("Score Mode", "Current: ${vm.scoreMode.name}", onClick = { vm.cycleScoreMode() }) }
            item { SettingRow("Scoring Difficulty", "Level: ${vm.difficulty.name}", onClick = { vm.cycleDifficulty() }) }
            item { SettingRow("Fanfare Sound", "Level: ${vm.fanfare.label}", onClick = { vm.cycleFanfare() }) }

            item { SectionHeader("SOUND (MIDI songs)") }
            item {
                SettingRow(
                    "Use SoundFont (.sf2)",
                    if (vm.soundFontEnabled) "On: FluidSynth plays MIDI with your soundfont" else "Off: Android's thin built-in synth",
                    onClick = { vm.updateSoundFontEnabled(!vm.soundFontEnabled) }
                ) { Switch(checked = vm.soundFontEnabled, onCheckedChange = null) }
            }
            item { SettingRow("SoundFont File", vm.soundFontDisplay, onClick = { dialog = "sf" }) }
            item { SettingRow("Sound engine status", vm.soundEngineStatus, onClick = { }) }

            item { SectionHeader("BACKGROUND VISUAL (BGV) - MIDI songs") }
            item { SettingRow("BGV Mode", "Current: ${vm.bgvMode.label}", onClick = { vm.cycleBgvMode() }) }
            item {
                SettingRow(
                    "Change Clip on Every Song",
                    if (vm.bgvChangeEverySong) "On: new background each song" else "Off: same background continues",
                    onClick = { vm.setBgvChange(!vm.bgvChangeEverySong) }
                ) { Switch(checked = vm.bgvChangeEverySong, onCheckedChange = null) }
            }
            item { SettingRow("BGV Directory", vm.bgvDirDisplay, onClick = { dialog = "bgvdir" }) }
            item { Spacer(Modifier.height(32.dp)) }
        }

        when (dialog) {
            "icons" -> ChoiceDialog(
                title = "Icon style",
                options = listOf("auto") + ICON_STYLES.map { it.first },
                label = { iconStyleLabel(it) },
                selected = vm.iconStyle,
                onPick = { vm.updateIconStyle(it) },
                onDismiss = { dialog = null }
            )
            "theme" -> ThemePickerDialog(
                current = vm.themeKey,
                onPick = { vm.updateTheme(it) },
                onDismiss = { dialog = null }
            )
            "font" -> FontPickerDialog(
                current = vm.fontKey,
                onPick = { vm.updateFont(it) },
                onDismiss = { dialog = null }
            )
            "lalign" -> ChoiceDialog(
                title = "Lyric alignment",
                options = LyricAlign.values().toList(),
                label = { it.label },
                selected = vm.lyricAlign,
                onPick = { vm.updateLyricAlign(it) },
                onDismiss = { dialog = null }
            )
            "lanim" -> ChoiceDialog(
                title = "Lyric animation",
                options = LyricAnim.values().toList(),
                label = { it.label },
                selected = vm.lyricAnim,
                onPick = { vm.updateLyricAnim(it) },
                onDismiss = { dialog = null }
            )
            "lcount" -> ChoiceDialog(
                title = "Countdown style",
                options = CountdownStyle.values().toList(),
                label = { it.label },
                selected = vm.countdownStyle,
                onPick = { vm.updateCountdownStyle(it) },
                onDismiss = { dialog = null }
            )
            "lcolor" -> ColorPickerDialog(
                current = vm.lyricColor,
                onPick = { vm.updateLyricColor(it) },
                onDismiss = { dialog = null }
            )
            "loutline" -> OutlineDialog(
                current = vm.lyricOutline,
                onSave = { vm.updateLyricOutline(it) },
                onDismiss = { dialog = null }
            )
            "lsize" -> LyricSizeDialog(
                portrait = vm.lyricSizePortrait,
                landscape = vm.lyricSizeLandscape,
                onSave = { p, l -> vm.updateLyricSizes(p, l) },
                onDismiss = { dialog = null }
            )
            "lfont" -> LyricFontPickerDialog(
                current = vm.lyricFontKey,
                appKey = vm.fontKey,
                onPick = { vm.updateLyricFont(it) },
                onDismiss = { dialog = null }
            )
            "port" -> TextInputDialog(
                title = "Server Port (1024-65535)",
                initial = vm.remotePort.toString(),
                numeric = true,
                onSave = {
                    val p = it.toIntOrNull()
                    if (p != null && p in 1024..65535) vm.updateRemotePort(p)
                    dialog = null
                },
                onDismiss = { dialog = null }
            )
            "sf" -> TextInputDialog(
                title = "SoundFont .sf2 path (empty = auto)",
                initial = vm.soundFontPath,
                numeric = false,
                onSave = {
                    vm.updateSoundFontPath(it)
                    dialog = null
                },
                onDismiss = { dialog = null }
            )
            "bgvdir" -> TextInputDialog(
                title = "BGV folder (empty = auto)",
                initial = vm.bgvDir,
                numeric = false,
                onSave = {
                    vm.updateBgvDir(it)
                    dialog = null
                },
                onDismiss = { dialog = null }
            )
            else -> {}
        }
    }
    }
}
