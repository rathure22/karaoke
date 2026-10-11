package com.example.mykaraoke.remote

import java.io.IOException
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.net.URLDecoder
import java.util.concurrent.Executors

/** What the web remote can ask the app to do. All methods are thread-safe (the app hops to the main thread). */
interface RemoteHost {
    fun stateJson(): String
    fun songsJson(query: String, limit: Int): String
    fun act(action: String, index: Int)
    fun remotePage(): String
}

/** Tiny HTTP server: open http://TV_IP:PORT in a phone browser to queue songs and control playback. */
class RemoteServer(private val port: Int, private val host: RemoteHost) {

    private var server: ServerSocket? = null
    private val pool = Executors.newCachedThreadPool()
    @Volatile private var running = false

    fun start(): Boolean {
        return try {
            val s = ServerSocket()
            s.reuseAddress = true
            s.bind(InetSocketAddress(port))
            server = s
            running = true
            pool.execute {
                while (running) {
                    try {
                        val c = s.accept()
                        pool.execute { handle(c) }
                    } catch (e: IOException) {
                        break
                    }
                }
            }
            true
        } catch (e: IOException) {
            false
        }
    }

    fun stop() {
        running = false
        try { server?.close() } catch (e: IOException) { }
        server = null
        pool.shutdownNow()
    }

    private fun parseQuery(q: String): Map<String, String> {
        val map = HashMap<String, String>()
        if (q.isEmpty()) return map
        for (part in q.split("&")) {
            val k = part.substringBefore("=")
            val v = part.substringAfter("=", "")
            try {
                map[URLDecoder.decode(k, "UTF-8")] = URLDecoder.decode(v, "UTF-8")
            } catch (e: Exception) { }
        }
        return map
    }

    private fun handle(sock: Socket) {
        try {
            sock.use { s ->
                s.soTimeout = 5000
                val reader = s.getInputStream().bufferedReader()
                val requestLine = reader.readLine() ?: return
                while (true) {
                    val h = reader.readLine() ?: break
                    if (h.isEmpty()) break
                }
                val parts = requestLine.split(" ")
                if (parts.size < 2) return
                val target = parts[1]
                val path = target.substringBefore("?")
                val query = parseQuery(target.substringAfter("?", ""))

                var code = "200 OK"
                var type = "application/json"
                var body: String
                try {
                    when (path) {
                        "/", "/index.html" -> {
                            type = "text/html"
                            body = host.remotePage()
                        }
                        "/api/state" -> body = host.stateJson()
                        "/api/songs" -> body = host.songsJson(query["q"] ?: "", query["limit"]?.toIntOrNull() ?: 100)
                        "/api/play", "/api/queue", "/api/unqueue", "/api/next",
                        "/api/stop", "/api/audio", "/api/pause" -> {
                            host.act(path.removePrefix("/api/"), query["i"]?.toIntOrNull() ?: -1)
                            body = host.stateJson()
                        }
                        else -> {
                            code = "404 Not Found"
                            type = "text/plain"
                            body = "Not found"
                        }
                    }
                } catch (e: Exception) {
                    code = "500 Internal Server Error"
                    type = "text/plain"
                    body = "Error"
                }
                val bytes = body.toByteArray(Charsets.UTF_8)
                val out = s.getOutputStream()
                val head = "HTTP/1.1 $code\r\nContent-Type: $type; charset=utf-8\r\n" +
                    "Content-Length: ${bytes.size}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n"
                out.write(head.toByteArray(Charsets.UTF_8))
                out.write(bytes)
                out.flush()
            }
        } catch (e: Exception) {
            // client went away
        }
    }
}
