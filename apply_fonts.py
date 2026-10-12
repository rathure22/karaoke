#!/usr/bin/env python3
"""
Adds the font picker to your CURRENT MyKaraoke files (does not overwrite your other edits).
Run from the folder where you unzipped fonts-pack.zip:

    python3 apply_fonts.py ~/MyKaraoke

(The zip already put the .ttf files and AppFonts.kt in place.)
"""
import os
import sys

root = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/MyKaraoke")
base = os.path.join(root, "app/src/main/java/com/example/mykaraoke")
res = []


def patch(rel, edits, marker):
    path = os.path.join(base, rel)
    if not os.path.isfile(path):
        res.append(f"[MISSING FILE] {rel}")
        return
    s = open(path, encoding="utf-8").read()
    if marker in s:
        res.append(f"[already patched] {rel}")
        return
    for name, old, new in edits:
        if old not in s:
            res.append(f"[SKIPPED, anchor not found: {name}] {rel}")
            return
        s = s.replace(old, new, 1)
    open(path, "w", encoding="utf-8").write(s)
    res.append(f"[patched] {rel}")


patch(
    "KaraokeViewModel.kt",
    [
        (
            "bgvDir",
            '    var bgvDir by mutableStateOf(prefs.getString("bgvDir", "") ?: ""); private set\n',
            '    var bgvDir by mutableStateOf(prefs.getString("bgvDir", "") ?: ""); private set\n'
            '    var fontKey by mutableStateOf(prefs.getString("font", "default") ?: "default"); private set\n',
        ),
        (
            "settings section",
            "    // ================= settings =================\n",
            "    // ================= font =================\n\n"
            "    fun updateFont(key: String) {\n"
            "        fontKey = key\n"
            '        prefs.edit().putString("font", key).apply()\n'
            "    }\n\n"
            "    // ================= settings =================\n",
        ),
    ],
    "fun updateFont(",
)

patch(
    "MainActivity.kt",
    [
        (
            "import",
            "import com.example.mykaraoke.ui.SongPickerDialog\n",
            "import com.example.mykaraoke.ui.SongPickerDialog\nimport com.example.mykaraoke.ui.appTypography\n",
        ),
        (
            "theme",
            "MaterialTheme(colorScheme = darkColorScheme()) {",
            "MaterialTheme(colorScheme = darkColorScheme(), typography = appTypography(vm.fontKey)) {",
        ),
    ],
    "appTypography(vm.fontKey)",
)

patch(
    "ui/SettingsScreen.kt",
    [
        (
            "appearance section",
            '            item { SectionHeader("REMOTE CONTROL (phone browser)") }\n',
            '            item { SectionHeader("APPEARANCE") }\n'
            '            item { SettingRow("Font", appFont(vm.fontKey).label, onClick = { dialog = "font" }) }\n\n'
            '            item { SectionHeader("REMOTE CONTROL (phone browser)") }\n',
        ),
        (
            "font dialog",
            "        when (dialog) {\n",
            "        when (dialog) {\n"
            '            "font" -> FontPickerDialog(\n'
            "                current = vm.fontKey,\n"
            "                onPick = { vm.updateFont(it) },\n"
            "                onDismiss = { dialog = null }\n"
            "            )\n",
        ),
    ],
    "FontPickerDialog",
)

print("\n".join(res))
