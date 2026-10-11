package com.example.mykaraoke

import android.content.res.Configuration
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
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
import com.example.mykaraoke.ui.PlayerScreen
import com.example.mykaraoke.ui.SetupScreen

class MainActivity : ComponentActivity() {
    private val vm: KaraokeViewModel by viewModels()

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
                MaterialTheme(colorScheme = darkColorScheme()) {
                    Surface(Modifier.fillMaxSize()) {
                        when {
                            vm.serverUrl.isBlank() -> SetupScreen(vm)
                            vm.current != null && vm.showPlayer -> PlayerScreen(vm)
                            else -> BrowseScreen(vm)
                        }
                    }
                }
            }
        }
    }
}
