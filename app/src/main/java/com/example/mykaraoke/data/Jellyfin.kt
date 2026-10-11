package com.example.mykaraoke.data

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

data class JfUser(@SerializedName("Id") val id: String?)
data class JfAuth(
    @SerializedName("AccessToken") val accessToken: String?,
    @SerializedName("User") val user: JfUser?
)
data class JfItem(
    @SerializedName("Id") val id: String?,
    @SerializedName("Name") val name: String?,
    @SerializedName("ImageTags") val imageTags: Map<String, String>?
)
data class JfItems(@SerializedName("Items") val items: List<JfItem>?)

/** Minimal Jellyfin client. All calls are blocking: call from a background thread. */
class JellyfinClient(private val http: OkHttpClient, base: String) {

    private val root = base.trim().let { if (it.endsWith("/")) it else "$it/" }
    private val gson = Gson()
    private val authHeader =
        "MediaBrowser Client=\"MyKaraoke\", Device=\"Android\", DeviceId=\"mykaraoke-android\", Version=\"1.0.0\""

    private fun login(user: String, pass: String): JfAuth {
        val json = gson.toJson(mapOf("Username" to user, "Pw" to pass))
        val req = Request.Builder()
            .url(root.toHttpUrl().newBuilder().addPathSegments("Users/AuthenticateByName").build())
            .header("X-Emby-Authorization", authHeader)
            .post(json.toRequestBody("application/json".toMediaType()))
            .build()
        return http.newCall(req).execute().use { r ->
            if (r.code == 401) throw IllegalStateException("Wrong username or password")
            if (!r.isSuccessful) throw IllegalStateException("Jellyfin replied ${r.code}")
            gson.fromJson(r.body?.string(), JfAuth::class.java)
                ?: throw IllegalStateException("Empty login response")
        }
    }

    private fun get(path: String, token: String, params: Map<String, String> = emptyMap()): String {
        val b = root.toHttpUrl().newBuilder().addPathSegments(path)
        params.forEach { (k, v) -> b.addQueryParameter(k, v) }
        val req = Request.Builder()
            .url(b.build())
            .header("X-Emby-Authorization", authHeader)
            .header("X-Emby-Token", token)
            .build()
        return http.newCall(req).execute().use { r ->
            if (!r.isSuccessful) throw IllegalStateException("Jellyfin replied ${r.code}")
            r.body?.string() ?: throw IllegalStateException("Empty response")
        }
    }

    private fun streamUrl(id: String, token: String): String =
        root.toHttpUrl().newBuilder()
            .addPathSegments("Videos/$id/stream")
            .addQueryParameter("static", "true")          // original file, keeps ALL audio tracks
            .addQueryParameter("MediaSourceId", id)
            .addQueryParameter("api_key", token)
            .build().toString()

    private fun coverUrl(id: String, token: String): String =
        root.toHttpUrl().newBuilder()
            .addPathSegments("Items/$id/Images/Primary")
            .addQueryParameter("maxHeight", "200")
            .addQueryParameter("api_key", token)
            .build().toString()

    fun songs(user: String, pass: String, library: String): List<Song> {
        val auth = login(user, pass)
        val token = auth.accessToken ?: throw IllegalStateException("No access token")
        val uid = auth.user?.id ?: throw IllegalStateException("No user id")

        val params = mutableMapOf(
            "Recursive" to "true",
            "IncludeItemTypes" to "Movie,Video,MusicVideo",
            "SortBy" to "SortName",
            "SortOrder" to "Ascending"
        )
        if (library.isNotBlank()) {
            val views = gson.fromJson(get("Users/$uid/Views", token), JfItems::class.java).items.orEmpty()
            val view = views.firstOrNull { it.name.equals(library.trim(), ignoreCase = true) }
                ?: throw IllegalStateException("Library \"${library.trim()}\" not found")
            params["ParentId"] = view.id ?: ""
        }

        val items = gson.fromJson(get("Users/$uid/Items", token, params), JfItems::class.java).items.orEmpty()
        return items.mapIndexedNotNull { index, item ->
            val id = item.id ?: return@mapIndexedNotNull null
            val name = item.name ?: id
            // Jellyfin has no artist for plain videos: use "Artist - Title" naming
            val (artist, title) = if (name.contains(" - ")) {
                name.substringBefore(" - ") to name.substringAfter(" - ")
            } else {
                "" to name
            }
            Song(
                id = id,
                code = "%05d".format(index + 1),
                title = title.trim(),
                artist = artist.trim(),
                file = streamUrl(id, token),
                cover = if (item.imageTags?.containsKey("Primary") == true) coverUrl(id, token) else null
            )
        }
    }
}
