/**
 * 
 */
package com.source.energy.dialog;



import com.source.energy.activity.R;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/**
 * @author Swati Soni
 *
 */
public class SmartEnergyDialog extends Dialog{
	static final int MB_BLUE = 0x5AC22E;
	static final float[] DIMENSIONS_DIFF_LANDSCAPE = { 20, 60 };
	static final float[] DIMENSIONS_DIFF_PORTRAIT = { 40, 60 };
	static final FrameLayout.LayoutParams FILL = new FrameLayout.LayoutParams(
			ViewGroup.LayoutParams.FILL_PARENT,
			ViewGroup.LayoutParams.FILL_PARENT);
	static final int MARGIN = 4;
	static final int PADDING = 2;
	static final String DISPLAY_STRING = "touch";
	static final String MB_ICON = "icon.png";
	public static final String REDIRECT_URI = null;

	private String mUrl;
	private SEDialogListener mListener;
	private ProgressDialog mSpinner;
	private WebView mWebView;
	private LinearLayout mContent;
	private TextView mTitle;
	private Context context;

	public SmartEnergyDialog(Context context, String url,
			SEDialogListener listener) {
		super(context);
		this.context = context;
		mUrl = url;
		mListener = listener;
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		mSpinner = new ProgressDialog(getContext());
		mSpinner.requestWindowFeature(Window.FEATURE_NO_TITLE);
		mSpinner.setMessage("Loading...");

		mContent = new LinearLayout(getContext());
		mContent.setOrientation(LinearLayout.VERTICAL);
		setUpTitle();
		setUpWebView();
		Display display = getWindow().getWindowManager().getDefaultDisplay();
		final float scale = getContext().getResources().getDisplayMetrics().density;
		int orientation = getContext().getResources().getConfiguration().orientation;
		float[] dimensions = (orientation == Configuration.ORIENTATION_LANDSCAPE) ? DIMENSIONS_DIFF_LANDSCAPE
				: DIMENSIONS_DIFF_PORTRAIT;
		addContentView(
				mContent,
				new LinearLayout.LayoutParams(display.getWidth()
						- ((int) (dimensions[0] * scale + 0.5f)), display
						.getHeight() - ((int) (dimensions[1] * scale + 0.5f))));
	}

	private void setUpTitle() {
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Drawable icon = getContext().getResources().getDrawable(
				R.drawable.smartplanet);
//				R.drawable.Smart_planet_Icon.png);
		mTitle = new TextView(getContext());
		mTitle.setText("Smart Energy");
		mTitle.setTextColor(Color.WHITE);
		mTitle.setTypeface(Typeface.DEFAULT_BOLD);
		mTitle.setBackgroundColor(MB_BLUE);
		mTitle.setPadding(MARGIN + PADDING, MARGIN, MARGIN, MARGIN);
		mTitle.setCompoundDrawablePadding(MARGIN + PADDING);
		mTitle.setCompoundDrawablesWithIntrinsicBounds(icon, null, null, null);
		mContent.addView(mTitle);
	}

	private void setUpWebView() {
		mWebView = new WebView(getContext());
		//mWebView =(WebView) findViewById(R.id.web_view);
		mWebView.setVerticalScrollBarEnabled(false);
		mWebView.setHorizontalScrollBarEnabled(false);
		mWebView.setWebViewClient(new SmartEnergyDialog.SEWebViewClient());
		mWebView.getSettings().setJavaScriptEnabled(true);
		mWebView.addJavascriptInterface(new JsInterface(mWebView,
				context), "SearchJavaScriptAndroidInterface");
		mWebView.loadUrl(mUrl);
		mWebView.setLayoutParams(FILL);
		mContent.addView(mWebView);
	}

	private class SEWebViewClient extends WebViewClient {

		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			Log.d("Smart Energy ", "Smart Energy " + url);
			// // if (url.startsWith(MusicBubbyDialog.REDIRECT_URI)) {
			// Bundle values = Util.parseUrl(url);
			//
			// String error = values.getString("error");
			// if (error == null) {
			// error = values.getString("error_type");
			// }
			//
			// if (error == null) {
			// mListener.onComplete(values);
			// } else if (error.equals("access_denied") ||
			// error.equals("OAuthAccessDeniedException")) {
			// mListener.onCancel();
			// } else {
			// mListener.onFacebookError(new FacebookError(error));
			// }
			//
			// MusicBubbyDialog.this.dismiss();
			// return true;
			// // } else if (url.startsWith(Facebook.CANCEL_URI)) {
			// mListener.onCancel();
			// MusicBubbyDialog.this.dismiss();
			// return true;
			// } else if (url.contains(DISPLAY_STRING)) {
			// return false;
			// }
			// launch non-dialog URLs in a full browser
			getContext().startActivity(
					new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
			return true;
		}

		@Override
		public void onReceivedError(WebView view, int errorCode,
				String description, String failingUrl) {
			super.onReceivedError(view, errorCode, description, failingUrl);
			// mListener.onError(
			// new DialogError(description, errorCode, failingUrl));
			SmartEnergyDialog.this.dismiss();
		}

		@Override
		public void onPageStarted(WebView view, String url, Bitmap favicon) {
			Log.d("Smart Energy Entered New Page", "Webview loading URL: " + url);
			super.onPageStarted(view, url, favicon);
			mSpinner.show();
		}

		@Override
		public void onPageFinished(WebView view, String url) {
			super.onPageFinished(view, url);
			String title = mWebView.getTitle();
			if (title != null && title.length() > 0) {
				mTitle.setText(title);
			}
			mSpinner.dismiss();
		}

	}

	public interface SEDialogListener {

		/**
		 * Called when a dialog completes.
		 * 
		 * Executed by the thread that initiated the dialog.
		 * 
		 * @param values
		 *            Key-value string pairs extracted from the response.
		 */
		public void onComplete(Bundle values);

		/**
		 * Called when a Music Bubby responds to a dialog with an error.
		 * 
		 * Executed by the thread that initiated the dialog.
		 * 
		 */
		public void onMusicBubbyBrainzError(Error e);

		/**
		 * Called when a dialog has an error.
		 * 
		 * Executed by the thread that initiated the dialog.
		 * 
		 */
		public void onError(Error e);

		/**
		 * Called when a dialog is canceled by the user.
		 * 
		 * Executed by the thread that initiated the dialog.
		 * 
		 */
		public void onCancel();

	}
	private class JsInterface {
		// function that will be called from assets/test.js
		// js example: android.log('my message');
		private String typeValue;
		private String userQuery;

		private WebView mAppView;
		private Context mContext;

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

		public void openAndroidDialog() {
			AlertDialog.Builder myDialog = new AlertDialog.Builder(mContext);
			myDialog.setTitle("DANGER!");
			myDialog.setMessage("You can do what you want!");
			myDialog.setPositiveButton("ON", null);
			myDialog.show();
		}

	}
}
