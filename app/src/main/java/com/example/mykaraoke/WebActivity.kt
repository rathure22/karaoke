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
                @Suppress("DEPRECATION")
                allowFileAccessFromFileURLs = true
                @Suppress("DEPRECATION")
                allowUniversalAccessFromFileURLs = true
                useWideViewPort = true
                loadWithOverviewMode = true
                builtInZoomControls = false
                displayZoomControls = false
            }
            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                    Log.e("MyKaraokeWeb", "${msg.messageLevel()} \( {msg.sourceId()}: \){msg.lineNumber()} ${msg.message()}")
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
                    Log.e("MyKaraokeWeb", "load error: $desc url=$url")
                    if (request?.isForMainFrame == true) {
                        errorView.text =
                            "Could not load Grok UI.\n\n$desc\n$url\n\nassets/web/index.html missing?"
                        errorView.visibility = android.view.View.VISIBLE
                    }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    Log.i("MyKaraokeWeb", "page finished: $url")
                    view?.evaluateJavascript(
                        "(function(){return document.body ? document.body.innerText.length : -1;})()"
                    ) { result ->
                        Log.i("MyKaraokeWeb", "body text length: $result")
                        if (result == "0" || result == "null") {
                            errorView.text =
                                "Page loaded but UI empty.\nNeed relative JS paths (base: './')."
                            errorView.visibility = android.view.View.VISIBLE
                        }
                    }
                }
            }
            setBackgroundColor(Color.parseColor("#07131C"))
            loadUrl("file:///android_asset/web/index.html")
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

    override fun onResume() { super.onResume(); webView.onResume() }
    override fun onPause() { webView.onPause(); super.onPause() }
    override fun onDestroy() { webView.destroy(); super.onDestroy() }
}
