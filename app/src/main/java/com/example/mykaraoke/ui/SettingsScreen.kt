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

@Composable
private fun SectionHeader(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 16.dp, top = 20.dp, bottom = 4.dp)
    )
}

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

    Box(Modifier.fillMaxSize().systemBarsPadding()) {
        LazyColumn(Modifier.fillMaxSize()) {
            item {
                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { vm.showSettings = false }) { Text("← Back") }
                    Text("Settings", style = MaterialTheme.typography.headlineMedium)
                }
            }

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
