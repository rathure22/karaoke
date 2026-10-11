package com.example.mykaraoke.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun NeonBackground(content: @Composable () -> Unit) {
    val infinite = rememberInfiniteTransition(label = "neon")
    val pulse by infinite.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )
    val rotate by infinite.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(28000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotate"
    )

    Box(Modifier.fillMaxSize().background(Color(0xFF05050A))) {
        Canvas(Modifier.fillMaxSize()) {
            val cx = size.width / 2
            val cy = size.height / 2
            val maxR = size.minDimension * 0.55f

            // soft radial glow
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF00E5FF).copy(alpha = 0.12f * pulse),
                        Color(0xFF7C4DFF).copy(alpha = 0.06f * pulse),
                        Color.Transparent
                    ),
                    center = Offset(cx, cy),
                    radius = maxR
                ),
                radius = maxR,
                center = Offset(cx, cy)
            )

            // rotating neon rings
            for (i in 0..3) {
                val r = maxR * (0.35f + i * 0.18f)
                val alpha = (0.25f - i * 0.05f) * pulse
                drawCircle(
                    color = when (i % 3) {
                        0 -> Color(0xFF00E5FF).copy(alpha = alpha)
                        1 -> Color(0xFFFF00E5).copy(alpha = alpha)
                        else -> Color(0xFF7C4DFF).copy(alpha = alpha)
                    },
                    radius = r,
                    center = Offset(cx, cy),
                    style = Stroke(width = 2.5f)
                )
            }

            // floating dots
            for (i in 0 until 12) {
                val angle = Math.toRadians((rotate + i * 30).toDouble())
                val dist = maxR * (0.6f + (i % 3) * 0.1f)
                val x = cx + cos(angle).toFloat() * dist
                val y = cy + sin(angle).toFloat() * dist
                drawCircle(
                    color = Color(0xFF00E5FF).copy(alpha = 0.35f * pulse),
                    radius = 3.5f,
                    center = Offset(x, y)
                )
            }
        }
        content()
    }
}
