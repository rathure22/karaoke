package com.example.mykaraoke

import android.content.res.AssetManager
import android.util.Log
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

class AssetHttpServer(private val assets: AssetManager, private val root: String = "web") {

    private val running = AtomicBoolean(false)
    private var server: ServerSocket? = null
    private val pool = Executors.newCachedThreadPool()
    @Volatile var port: Int = 0
        private set

    fun start(): Int {
        if (running.get()) return port
        val ss = ServerSocket(0)
        server = ss
        port = ss.localPort
        running.set(true)
        pool.execute {
            while (running.get()) {
                try {
                    val client = ss.accept()
                    pool.execute { handle(client) }
                } catch (e: Exception) {
                    if (running.get()) Log.e(TAG, "accept failed", e)
                    break
                }
            }
        }
        Log.i(TAG, "serving on http://127.0.0.1:$port/")
        return port
    }

    fun stop() {
        running.set(false)
        try { server?.close() } catch (_: Exception) {}
        pool.shutdownNow()
    }

    private fun handle(socket: Socket) {
        try {
            socket.soTimeout = 10000
            val input = BufferedReader(InputStreamReader(socket.getInputStream()))
            val requestLine = input.readLine() ?: return
            while (true) {
                val line = input.readLine() ?: break
                if (line.isEmpty()) break
            }
            val parts = requestLine.split(" ")
            if (parts.size < 2 || parts[0] != "GET") {
                writeResponse(socket.getOutputStream(), 405, "text/plain", "Method Not Allowed".toByteArray())
                return
            }
            var path = parts[1].substringBefore("?").substringBefore("#")
            if (path == "/" || path.isEmpty()) path = "/index.html"
            path = path.replace("..", "")
            val assetPath = root + path
            val bytes = readAsset(assetPath)
            if (bytes == null) {
                val index = readAsset("$root/index.html")
                if (index != null) {
                    writeResponse(socket.getOutputStream(), 200, "text/html; charset=utf-8", index)
                } else {
                    writeResponse(socket.getOutputStream(), 404, "text/plain", "Not Found".toByteArray())
                }
            } else {
                writeResponse(socket.getOutputStream(), 200, mime(path), bytes)
            }
        } catch (e: Exception) {
            Log.e(TAG, "handle error", e)
        } finally {
            try { socket.close() } catch (_: Exception) {}
        }
    }

    private fun readAsset(path: String): ByteArray? {
        return try {
            assets.open(path).use { it.readBytes() }
        } catch (_: Exception) {
            null
        }
    }

    private fun writeResponse(out: OutputStream, code: Int, contentType: String, body: ByteArray) {
        val status = when (code) {
            200 -> "200 OK"
            404 -> "404 Not Found"
            405 -> "405 Method Not Allowed"
            else -> "$code"
        }
        val header = "HTTP/1.1 $status\r\n" +
            "Content-Type: $contentType\r\n" +
            "Content-Length: ${body.size}\r\n" +
            "Access-Control-Allow-Origin: *\r\n" +
            "Cache-Control: no-cache\r\n" +
            "Connection: close\r\n\r\n"
        out.write(header.toByteArray(Charsets.US_ASCII))
        out.write(body)
        out.flush()
    }

    private fun mime(path: String): String {
        val lower = path.lowercase()
        return when {
            lower.endsWith(".html") -> "text/html; charset=utf-8"
            lower.endsWith(".js") -> "application/javascript; charset=utf-8"
            lower.endsWith(".css") -> "text/css; charset=utf-8"
            lower.endsWith(".json") -> "application/json"
            lower.endsWith(".png") -> "image/png"
            lower.endsWith(".jpg") || lower.endsWith(".jpeg") -> "image/jpeg"
            lower.endsWith(".svg") -> "image/svg+xml"
            lower.endsWith(".webp") -> "image/webp"
            lower.endsWith(".woff2") -> "font/woff2"
            lower.endsWith(".woff") -> "font/woff"
            else -> "application/octet-stream"
        }
    }

    companion object {
        private const val TAG = "AssetHttpServer"
    }
}
