#!/usr/bin/env python3
"""
Patches your CURRENT MyKaraoke files in place (does not overwrite your other edits).

  python3 apply_patch.py ~/MyKaraoke

Adds:
  1. "Sound engine status" line in Settings > SOUND  (MidiEngine / KaraokeViewModel / SettingsScreen)
  2. Roomier song rows + "Showing first N of 47,997" header  (Screens.kt)

Safe to run twice. If an anchor is not found, that part is skipped and reported.
"""
import os
import sys

root = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/MyKaraoke")
base = os.path.join(root, "app/src/main/java/com/example/mykaraoke")

results = []


def patch(rel, edits, marker):
    path = os.path.join(base, rel)
    if not os.path.isfile(path):
        results.append(f"[MISSING FILE] {rel}")
        return
    s = open(path, encoding="utf-8").read()
    if marker in s:
        results.append(f"[already patched] {rel}")
        return
    new = s
    for name, old, repl in edits:
        if old not in new:
            results.append(f"[SKIPPED, anchor not found: {name}] {rel}")
            return
        new = new.replace(old, repl, 1)
    open(path, "w", encoding="utf-8").write(new)
    results.append(f"[patched] {rel}")


# ---------------------------------------------------------------- MidiEngine.kt
patch(
    "MidiEngine.kt",
    [
        (
            "imports",
            "import android.os.Looper\n",
            "import android.os.Looper\n"
            "import androidx.compose.runtime.getValue\n"
            "import androidx.compose.runtime.mutableStateOf\n"
            "import androidx.compose.runtime.setValue\n",
        ),
        (
            "main handler",
            "    private val main = Handler(Looper.getMainLooper())\n",
            "    companion object {\n"
            "        /** Shown in Settings > SOUND so you can see which synth is really playing. */\n"
            '        var status by mutableStateOf("Engine: no MIDI song played yet")\n'
            "            private set\n"
            "    }\n\n"
            "    private val main = Handler(Looper.getMainLooper())\n\n"
            "    private fun setStatus(msg: String) {\n"
            "        main.post { status = msg }\n"
            "    }\n",
        ),
        (
            "builtin branch",
            "        if (sf == null) {\n            startBuiltIn(path, startMs, my)\n",
            "        if (sf == null) {\n"
            '            setStatus("Engine: Android built-in synth (no usable .sf2 set or found)")\n'
            "            startBuiltIn(path, startMs, my)\n",
        ),
        (
            "fluid ok",
            "                        if (startMs > 0) player.seekTo(map.msToTick(startMs))\n",
            "                        if (startMs > 0) player.seekTo(map.msToTick(startMs))\n"
            '                        setStatus("Engine: FluidSynth OK - " + File(sf).name)\n',
        ),
        (
            "fluid fail",
            "                // SF2 failed (bad file / native error): fall back to the built-in synth\n",
            "                // SF2 failed (bad file / native error): fall back to the built-in synth\n"
            "                setStatus(\n"
            '                    "Engine: FluidSynth failed (" + e.javaClass.simpleName +\n'
            '                        (e.message?.let { ": " + it.take(120) } ?: "") + "). Using built-in synth."\n'
            "                )\n",
        ),
    ],
    "fun setStatus(",
)

# ---------------------------------------------------------------- KaraokeViewModel.kt
patch(
    "KaraokeViewModel.kt",
    [
        (
            "soundFontDisplay",
            "    val soundFontDisplay: String\n",
            "    val soundEngineStatus: String get() = MidiEngine.status\n\n"
            "    val soundFontDisplay: String\n",
        ),
    ],
    "soundEngineStatus",
)

# ---------------------------------------------------------------- ui/SettingsScreen.kt
patch(
    "ui/SettingsScreen.kt",
    [
        (
            "soundfont row",
            '            item { SettingRow("SoundFont File", vm.soundFontDisplay, onClick = { dialog = "sf" }) }\n',
            '            item { SettingRow("SoundFont File", vm.soundFontDisplay, onClick = { dialog = "sf" }) }\n'
            '            item { SettingRow("Sound engine status", vm.soundEngineStatus, onClick = { }) }\n',
        ),
    ],
    "Sound engine status",
)

# ---------------------------------------------------------------- ui/Screens.kt
screens = os.path.join(base, "ui/Screens.kt")
if os.path.isfile(screens):
    s = open(screens, encoding="utf-8").read()
    if "Showing first" in s:
        results.append("[already patched] ui/Screens.kt")
    else:
        old_header = 'songs.size < vm.songs.size -> "Showing ${songs.size} of ${vm.songs.size} (type to search)"'
        new_header = (
            'songs.size < vm.songs.size -> "Showing first ${songs.size} of '
            '${"%,d".format(vm.songs.size)} songs. Type to search."'
        )
        start_anchor = (
            "        Column(Modifier.weight(1f)) {\n"
            "            Text(song.displayTitle, maxLines = 1, overflow = TextOverflow.Ellipsis)"
        )
        end_anchor = "@Composable\nprivate fun NowPlayingBar"
        if old_header in s and start_anchor in s and end_anchor in s:
            a = s.index(start_anchor)
            b = s.index(end_anchor)
            block = '''        Column(Modifier.weight(1f)) {
            Text(
                song.displayTitle,
                style = MaterialTheme.typography.bodyLarge,
                maxLines = 2, overflow = TextOverflow.Ellipsis
            )
            song.artist?.takeIf { it.isNotBlank() }?.let {
                Text(
                    it, style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1, overflow = TextOverflow.Ellipsis
                )
            }
            song.code?.takeIf { it.isNotBlank() }?.let {
                Text(
                    "#$it", style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }
        }
        Spacer(Modifier.width(8.dp))
        Button(
            onClick = { vm.playNow(song) },
            contentPadding = PaddingValues(horizontal = 16.dp)
        ) { Text("Sing") }
        Spacer(Modifier.width(6.dp))
        OutlinedButton(
            onClick = { vm.enqueue(song) },
            contentPadding = PaddingValues(horizontal = 12.dp)
        ) { Text("+") }
    }
}

'''
            s = s[:a] + block + s[b:]
            s = s.replace(old_header, new_header, 1)
            open(screens, "w", encoding="utf-8").write(s)
            results.append("[patched] ui/Screens.kt")
        else:
            results.append("[SKIPPED, anchors not found] ui/Screens.kt (song list unchanged)")
else:
    results.append("[MISSING FILE] ui/Screens.kt")

print("\n".join(results))
