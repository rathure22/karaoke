package com.example.mykaraoke

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

class WebActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var errorView: TextView
    private var server: AssetHttpServer? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = FrameLayout(this)
        root.setBackgroundColor(Color.parseColor("#07131C"))

        errorView = TextView(this).apply {
            setTextColor(Color.WHITE)
            textSize = 14f
            setPadding(48, 48, 48, 48)
            visibility = android.view.View.GONE
        }

        try {
            val s = AssetHttpServer(assets, "web")
            s.start()
            server = s
            Log.i(TAG, "local server port=" + s.port)
        } catch (e: Exception) {
            Log.e(TAG, "server start failed", e)
            errorView.text = "Local server failed: " + e.message
            errorView.visibility = android.view.View.VISIBLE
        }

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
                builtInZoomControls = false
                displayZoomControls = false
            }
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                    Log.e(TAG, msg.messageLevel().toString() + " " +
                        msg.sourceId() + ":" + msg.lineNumber() + " " + msg.message())
                    return true
                }
            }
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean = false

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    val desc = error?.description?.toString() ?: "unknown"
                    val url = request?.url?.toString() ?: ""
                    Log.e(TAG, "error: " + desc + " " + url)
                    if (request?.isForMainFrame == true) {
                        errorView.text = "Load error:\n" + desc + "\n" + url
                        errorView.visibility = android.view.View.VISIBLE
                    }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    Log.i(TAG, "finished: " + url)
                }
            }
            setBackgroundColor(Color.parseColor("#07131C"))
            val p = server?.port ?: 0
            if (p > 0) {
                loadUrl("http://127.0.0.1:" + p + "/")
            }
        }

        root.addView(webView, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))
        root.addView(errorView, FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))
        setContentView(root)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack()
                else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    override fun onDestroy() {
        server?.stop()
        server = null
        webView.destroy()
        super.onDestroy()
    }

    override fun onResume() { super.onResume(); webView.onResume() }
    override fun onPause() { webView.onPause(); super.onPause() }

    companion object {
        private const val TAG = "MyKaraokeWeb"
    }
}
