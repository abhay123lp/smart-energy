/**
 * 
 */
package com.source.energy.ws;

import java.io.IOException;

import org.ksoap2.SoapEnvelope;
import org.ksoap2.serialization.SoapObject;
import org.ksoap2.serialization.SoapSerializationEnvelope;
import org.ksoap2.transport.HttpTransportSE;
import org.xmlpull.v1.XmlPullParserException;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;

/**
 * @author Swati Soni
 *
 */
public class ProfileConfigurationWS {
	/**
	 * Get the music brainz list from the music brainz webservice linked to your
	 * cloud.
	 */
	private static final String NAMESPACE = "http://tempuri.org/";
	// Save for FAVORITE
	//static private String URL = "http://170.224.165.29/WebServiceDisaster/Service.asmx";
	static private String URL = "http://localhost:8080/DeviceConfigurationWS/services/AirConditionerConfig?wsdl";
	static private String PUT_FAVORITE_METHOD_NAME = "saveDisasterInfo2";
	static private String GET_FAVORITE_METHOD_NAME = "saveDisasterInfo2";
	private String KEYWORD;
	private String CATEGORY;
	public Activity activity;

	public ProfileConfigurationWS(String keyWord, String category,
			Activity activity) {
		this.KEYWORD = keyWord;
		this.CATEGORY = category;
		this.activity = activity;
	}

	/**
	 * Called when user clicks on search.
	 */
	public String putFavoriteSearchResults(Bundle savedInstanceState) {
		// ***** Create the transport object
		HttpTransportSE transport = new HttpTransportSE(URL);
		transport.debug = true;
		/**
		 * * Create the soapobject
		 */
		SoapObject soapObject = new SoapObject(NAMESPACE,
				PUT_FAVORITE_METHOD_NAME);
		/**
		 * Add parameters to pass to the method
		 */
		soapObject.addProperty("keyword", KEYWORD);
		soapObject.addProperty("category", CATEGORY);
		/**
		 * create new serialisation envelope
		 */
		SoapSerializationEnvelope envelope = new SoapSerializationEnvelope(
				SoapEnvelope.VER11);
		envelope.dotNet = true;
		envelope.bodyOut = soapObject;// transport;
		/**
		 * Get response from the cloud webservice
		 */
		String response = null;
		try {
			transport.call("http://tempuri.org/saveDisasterInfo2", envelope);
			response = envelope.getResponse().toString();
			showDialog("Upload Successfully");
		} catch (IOException e1) {
			e1.printStackTrace();
			showDialog("E1");
		} catch (XmlPullParserException e1) {
			e1.printStackTrace();
			showDialog("E2");
		} catch (Exception ex) {
			ex.printStackTrace();
			showDialog("E3");
		}

		return response;
	}

	/**
	 * Called when user clicks on search.
	 */
	public String getFavoriteSearchResults(Bundle savedInstanceState) {
		// ***** Create the transport object
		HttpTransportSE transport = new HttpTransportSE(URL);
		transport.debug = true;
		/**
		 * * Create the soapobject
		 */
		SoapObject soapObject = new SoapObject(NAMESPACE,
				GET_FAVORITE_METHOD_NAME);
		/**
		 * Add parameters to pass to the method
		 */
		soapObject.addProperty("keyword", KEYWORD);
		soapObject.addProperty("category", CATEGORY);
		/**
		 * create new serialisation envelope
		 */
		SoapSerializationEnvelope envelope = new SoapSerializationEnvelope(
				SoapEnvelope.VER11);
		envelope.dotNet = true;
		envelope.bodyOut = soapObject;// transport;
		/**
		 * Get response from the cloud webservice
		 */
		String response = null;
		try {
			transport.call("http://tempuri.org/saveDisasterInfo2", envelope);
			response = envelope.getResponse().toString();
			showDialog("Upload Successfully");
		} catch (IOException e1) {
			e1.printStackTrace();
			showDialog("E1");
		} catch (XmlPullParserException e1) {
			e1.printStackTrace();
			showDialog("E2");
		} catch (Exception ex) {
			ex.printStackTrace();
			showDialog("E3");
		}

		return response;
	}

	private void showDialog(String mess) {
		new AlertDialog.Builder(activity).setTitle("Message").setMessage(mess)
				.setNegativeButton("OK", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
					}
				}).show();
	}
}
