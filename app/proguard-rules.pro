-keepattributes Signature, *Annotation*
-keep class com.example.mykaraoke.data.** { *; }
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**

# --- fluidsynth-kmp (JNI): do not rename/strip ---
-keep class dev.kotlinds.** { *; }
-keepclasseswithmembernames class * { native <methods>; }
-dontwarn dev.kotlinds.**
