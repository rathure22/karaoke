package com.example.mykaraoke

import android.Manifest
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import com.example.mykaraoke.ui.BrowseScreen
import com.example.mykaraoke.ui.MidiStage
import com.example.mykaraoke.ui.PlayerScreen
import com.example.mykaraoke.ui.SettingsScreen
import com.example.mykaraoke.ui.SetupScreen
import com.example.mykaraoke.ui.SongPickerDialog
import com.example.mykaraoke.ui.appTypography

class MainActivity : ComponentActivity() {
    private val vm: KaraokeViewModel by viewModels()

    private val storageLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    private fun requestStorage() {
        if (Build.VERSION.SDK_INT >= 30) {
            try {
                startActivity(
                    Intent(
                        Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                        Uri.parse("package:$packageName")
                    )
                )
            } catch (e: Exception) {
                try {
                    startActivity(Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION))
                } catch (e2: Exception) {
                    vm.error = "This device has no 'All files access' screen. Use adb: " +
                        "adb shell appops set $packageName MANAGE_EXTERNAL_STORAGE allow"
                }
            }
        } else {
            storageLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val ctx = LocalContext.current
            val density = LocalDensity.current
            val isTv = remember {
                (ctx.resources.configuration.uiMode and Configuration.UI_MODE_TYPE_MASK) ==
                    Configuration.UI_MODE_TYPE_TELEVISION
            }
            // Bigger text on TV (viewed from far away)
            val effective = if (isTv) Density(density.density, density.fontScale * 1.3f) else density

            CompositionLocalProvider(LocalDensity provides effective) {
                MaterialTheme(colorScheme = darkColorScheme(), typography = appTypography(vm.fontKey)) {
                    Surface(Modifier.fillMaxSize()) {
                        Box(Modifier.fillMaxSize()) {
                            when {
                                vm.serverUrl.isBlank() -> SetupScreen(vm) { requestStorage() }
                                vm.showSettings -> SettingsScreen(vm) { requestStorage() }
                                vm.current != null && vm.showPlayer ->
                                    if (vm.isMidi) MidiStage(vm) else PlayerScreen(vm)
                                else -> BrowseScreen(vm)
                            }
                            if (vm.showPicker && vm.current != null) SongPickerDialog(vm)
                        }
                    }
                }
            }
        }
    }
}
