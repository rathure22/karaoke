package com.example.mykaraoke.ui

import android.content.Context
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import org.json.JSONObject

/** Solar icon styles (same six as the KINI web desk). "auto" = follow the theme. */
val ICON_STYLES: List<Pair<String, String>> = listOf(
    "l" to "Linear",
    "b" to "Bold",
    "bd" to "Duotone",
    "ld" to "Line duo",
    "br" to "Broken",
    "o" to "Outline"
)

fun iconStyleLabel(key: String): String =
    if (key == "auto") "Auto (follow theme)" else ICON_STYLES.firstOrNull { it.first == key }?.second ?: "Linear"

/** The icon style each theme uses when icon style is "auto". */
fun themeIconStyle(themeKey: String): String = when (themeKey) {
    "neon" -> "bd"
    "amber" -> "ld"
    "ocean" -> "b"
    "matrix" -> "br"
    "paper" -> "o"
    else -> "l"
}

/** The icon style currently in use (already resolved, never "auto"). */
val LocalSolarStyle = compositionLocalOf { "l" }

private object SolarCache {
    var json: JSONObject? = null
    val vectors = HashMap<String, ImageVector>()
}

/** Loads one icon from assets/solar-icons.json and turns it into an ImageVector. Null if missing. */
fun solarVector(ctx: Context, name: String, style: String): ImageVector? {
    val key = "$name/$style"
    SolarCache.vectors[key]?.let { return it }
    val root = SolarCache.json ?: try {
        JSONObject(ctx.assets.open("solar-icons.json").bufferedReader().use { it.readText() })
    } catch (e: Exception) {
        null
    }?.also { SolarCache.json = it } ?: return null
    val icon = root.optJSONObject(name) ?: return null
    val arr = icon.optJSONArray(style) ?: icon.optJSONArray("l") ?: return null
    return try {
        val b = ImageVector.Builder(
            name = key,
            defaultWidth = 24.dp,
            defaultHeight = 24.dp,
            viewportWidth = 24f,
            viewportHeight = 24f
        )
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            val nodes = PathParser().parsePathString(o.getString("d")).toNodes()
            val alpha = if (o.has("a")) 0.5f else 1f
            if (o.optString("t") == "s") {
                b.addPath(
                    pathData = nodes,
                    stroke = SolidColor(Color.Black),
                    strokeAlpha = alpha,
                    strokeLineWidth = 1.5f,
                    strokeLineCap = StrokeCap.Round,
                    strokeLineJoin = StrokeJoin.Round
                )
            } else {
                b.addPath(
                    pathData = nodes,
                    pathFillType = if (o.has("eo")) PathFillType.EvenOdd else PathFillType.NonZero,
                    fill = SolidColor(Color.Black),
                    fillAlpha = alpha
                )
            }
        }
        b.build().also { SolarCache.vectors[key] = it }
    } catch (e: Exception) {
        null
    }
}

@Composable
fun SolarIcon(
    name: String,
    modifier: Modifier = Modifier,
    size: Dp = 24.dp,
    tint: Color = MaterialTheme.colorScheme.primary
) {
    val ctx = LocalContext.current
    val style = LocalSolarStyle.current
    val vec = remember(name, style) { solarVector(ctx, name, style) }
    if (vec != null) Icon(vec, contentDescription = null, modifier = modifier.size(size), tint = tint)
}
