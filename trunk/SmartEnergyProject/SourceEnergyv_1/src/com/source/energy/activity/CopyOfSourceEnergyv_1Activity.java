package com.source.energy.activity;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class CopyOfSourceEnergyv_1Activity extends Activity {
    /** Called when the activity is first created. */
	final Activity activity = this;
	WebView webView;
	static final int MB_BLUE = 0xFF6D84B4;
	static final int MB_TOP_Blue = 0x354f6e;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
      /*  setContentView(R.layout.main);
        // super.loadUrl("file:///android_asset/sencha/examples/forms/index.html");
		setContentView(R.layout.main);
		View layout =(View)findViewById(R.id.linearLayout2);
		layout.setBackgroundColor(MB_TOP_Blue);
		webView = (WebView) findViewById(R.id.web_view);
		webView.getSettings().setJavaScriptEnabled(true);
		webView.setWebChromeClient(new WebChromeClient() {
			public void onProgressChanged(WebView view, int progress) {
				activity.setTitle("Loading...");
				activity.setProgress(progress * 100);

				if (progress == 100)
					activity.setTitle(R.string.app_name);
			}
		});*/

		webView.setWebViewClient(new WebViewClient() {
			@Override
			public void onReceivedError(WebView view, int errorCode,
					String description, String failingUrl) {
				// Handle the error
			}

			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				view.loadUrl(url);
				return true;
			}
		});

		webView.addJavascriptInterface(new JsInterface(webView, this),
				"SearchJavaScriptAndroidInterface");
		webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
		webView.loadUrl("file:///android_asset/index.html");
    }
    private class JsInterface {
		// function that will be called from assets/test.js
		// js example: android.log('my message');
		private String typeValue;
		private String userQuery;

		private WebView mAppView;
		Context mContext;

		public JsInterface(WebView appView, Context c) {
			this.mAppView = appView;
			mContext = c;
		}

		public void setTypeValue(String typeValue) {
			Log.d("Set value Type", typeValue);
			this.typeValue = typeValue;
		}

		public void setUserQuery(String userQuery) {
			this.userQuery = userQuery;
		}

		public String getTypeValue() {
			return typeValue;
		}

		public String getUserQuery() {
			return userQuery;
		}

		public String makeSoapWebServiceRequest() {
			return "successful";
		}

		public void showToast(String val) {
			Log.d("Set value Type", val);
			Toast toast = Toast.makeText(mAppView.getContext(), val,
					Toast.LENGTH_SHORT);
			toast.show();
		}
	}
}