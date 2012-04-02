package com.source.energy.activity;



import com.phonegap.DroidGap;
import com.source.energy.dialog.SmartEnergyDialog;
import com.source.energy.ws.ConfigurationWebServices;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.Toast;

public class SourceEnergyv_1Activity extends DroidGap {
	/** Called when the activity is first created. */
	final Activity activity = this;
	WebView webView;
	static final int SE_BLUE = 0x93CE22;
	static final int SE_TOP_Blue = 0x93CE22;
	private static SmartEnergyDialog smartEnergyDialog;
	private final Handler mFacebookHandler = new Handler();
	private final ConfigurationWebServices mConfigService = new ConfigurationWebServices("ABC", "CAT", this);
	
	final Runnable mUpdateFacebookNotification = new Runnable() {
		public void run() {
			Toast.makeText(getBaseContext(), "Source Energy Running Multiple Threads!",
					Toast.LENGTH_LONG).show();
		}
	};
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		View layout =(View)findViewById(R.id.linearLayout2);
    	//layout.setBackgroundColor(SE_TOP_Blue);

		
		// webView = new WebView(this);
		webView = (WebView) findViewById(R.id.web_view);
		webView.getSettings().setJavaScriptEnabled(true);
		webView.setWebChromeClient(new WebChromeClient() {
			public void onProgressChanged(WebView view, int progress) {
				activity.setTitle("Loading...");
				activity.setProgress(progress * 100);

				if (progress == 100)
					activity.setTitle(R.string.app_name);
			}
		});

		webView.setWebViewClient(new WebViewClient() {
			@Override
			public void onReceivedError(WebView view, int errorCode,
					String description, String failingUrl) {
				Toast.makeText(getBaseContext(), "Smart Energy Error Received !", Toast.LENGTH_LONG)
				.show();
			}

			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				view.loadUrl(url);
				return true;
			}
		});

		webView.addJavascriptInterface(new JsInterface(webView, this),
				"jsWebService");
		webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
		webView.loadUrl("file:///android_asset/EnergyApp/index.html");
//		setContentView(webView);
		
		String urlString = "file:///android_asset/EnergyApp/index.html";
		Toast.makeText(getBaseContext(), "Smart Energy !", Toast.LENGTH_LONG)
				.show();
	
		smartEnergyDialog = new SmartEnergyDialog(
				activity, urlString, new SmartEnergyDialog.SEDialogListener() {

					public void onComplete(Bundle values) {
						// TODO Auto-generated method stub

					}

					public void onMusicBubbyBrainzError(Error e) {
						// TODO Auto-generated method stub

					}

					public void onError(Error e) {
						// TODO Auto-generated method stub

					}

					public void onCancel() {
						// TODO Auto-generated method stub

					}
				});
		Button energySavorButton = (Button) findViewById(R.id.button1);
		
		energySavorButton.setBackgroundColor(SE_BLUE);
		energySavorButton.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				 smartEnergyDialog.show();
				 postMessage();
			}

		});
	}
	private void postMessage() {
		Thread t = new Thread() {
			public void run() {

				try {
					
					mFacebookHandler.post(mUpdateFacebookNotification);
				} catch (Exception ex) {
					Log.e("Showing Error toast on click", "Error sending msg", ex);
				}
			}
		};
		t.start();
	}
	

	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		
	}

	@Override
	protected void onResume() {
		super.onResume();
		
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
		
		/**
		 * Web service for configuration and calling
		 */
		
		public String configurationRequest() {
			mConfigService.getFavoriteSearchResults(null);
			return "successful";
		}


	}
}
