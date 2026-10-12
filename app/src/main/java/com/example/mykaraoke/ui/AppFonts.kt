package com.example.mykaraoke.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mykaraoke.R

/** A selectable app font. family == null means "use the phone's system font". */
class AppFont(val key: String, val label: String, val family: FontFamily?)

// Families with only one weight use the same file for Normal and Bold,
// so Compose does not fake-bold them.
private fun single(res: Int) = FontFamily(
    Font(res, FontWeight.Normal),
    Font(res, FontWeight.Bold)
)

private val Poppins = FontFamily(
    Font(R.font.poppins_regular, FontWeight.Normal),
    Font(R.font.poppins_bold, FontWeight.Bold)
)
private val Outfit = FontFamily(
    Font(R.font.outfit_regular, FontWeight.Normal),
    Font(R.font.outfit_bold, FontWeight.Bold)
)
private val WorkSans = FontFamily(
    Font(R.font.work_sans_regular, FontWeight.Normal),
    Font(R.font.work_sans_bold, FontWeight.Bold)
)
private val Lora = FontFamily(
    Font(R.font.lora_regular, FontWeight.Normal),
    Font(R.font.lora_bold, FontWeight.Bold)
)
private val BigShoulders = FontFamily(
    Font(R.font.big_shoulders_regular, FontWeight.Normal),
    Font(R.font.big_shoulders_bold, FontWeight.Bold)
)
private val Tektur = FontFamily(
    Font(R.font.tektur_regular, FontWeight.Normal),
    Font(R.font.tektur_medium, FontWeight.Bold)
)

val APP_FONTS: List<AppFont> = listOf(
    AppFont("default", "System default", null),
    AppFont("poppins", "Poppins - modern, friendly", Poppins),
    AppFont("outfit", "Outfit - clean geometric", Outfit),
    AppFont("worksans", "Work Sans - easy to read", WorkSans),
    AppFont("lora", "Lora - elegant serif", Lora),
    AppFont("youngserif", "Young Serif - warm serif", single(R.font.young_serif)),
    AppFont("gloock", "Gloock - stylish display serif", single(R.font.gloock)),
    AppFont("erica", "Erica One - bold and loud", single(R.font.erica_one)),
    AppFont("bigshoulders", "Big Shoulders - tall and condensed", BigShoulders),
    AppFont("tektur", "Tektur - techno", Tektur),
    AppFont("hand", "Nothing You Could Do - handwritten", single(R.font.nothing_you_could_do))
)

fun appFont(key: String): AppFont = APP_FONTS.firstOrNull { it.key == key } ?: APP_FONTS[0]

/** Material typography where every text style uses the chosen font. */
fun appTypography(key: String): Typography {
    val fam = appFont(key).family
    val d = Typography()
    if (fam == null) return d
    return d.copy(
        displayLarge = d.displayLarge.copy(fontFamily = fam),
        displayMedium = d.displayMedium.copy(fontFamily = fam),
        displaySmall = d.displaySmall.copy(fontFamily = fam),
        headlineLarge = d.headlineLarge.copy(fontFamily = fam),
        headlineMedium = d.headlineMedium.copy(fontFamily = fam),
        headlineSmall = d.headlineSmall.copy(fontFamily = fam),
        titleLarge = d.titleLarge.copy(fontFamily = fam),
        titleMedium = d.titleMedium.copy(fontFamily = fam),
        titleSmall = d.titleSmall.copy(fontFamily = fam),
        bodyLarge = d.bodyLarge.copy(fontFamily = fam),
        bodyMedium = d.bodyMedium.copy(fontFamily = fam),
        bodySmall = d.bodySmall.copy(fontFamily = fam),
        labelLarge = d.labelLarge.copy(fontFamily = fam),
        labelMedium = d.labelMedium.copy(fontFamily = fam),
        labelSmall = d.labelSmall.copy(fontFamily = fam)
    )
}

/** Tap a font to apply it right away. Each row is previewed in its own font. */
@Composable
fun FontPickerDialog(current: String, onPick: (String) -> Unit, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Choose font") },
        text = {
            LazyColumn {
                items(APP_FONTS, key = { it.key }) { f ->
                    Row(
                        Modifier.fillMaxWidth().clickable { onPick(f.key) }.padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = f.key == current, onClick = { onPick(f.key) })
                        Column(Modifier.padding(start = 4.dp)) {
                            Text(f.label, style = MaterialTheme.typography.labelMedium)
                            Text(
                                "Mahal kita, Karaoke! Abc 123 ♪",
                                fontFamily = f.family,
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
