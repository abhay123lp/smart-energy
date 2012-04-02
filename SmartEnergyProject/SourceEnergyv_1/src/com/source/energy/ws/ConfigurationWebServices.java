/**
 * 
 */
package com.source.energy.ws;

/**
 * @author Swati Soni
 *
 */
import java.io.IOException;
import java.util.Date;

import org.ksoap2.SoapEnvelope;
import org.ksoap2.serialization.SoapObject;
import org.ksoap2.serialization.SoapSerializationEnvelope;
import org.ksoap2.transport.HttpTransportSE;
import org.xmlpull.v1.XmlPullParserException;

import com.source.energy.iws.IConfigurationService;

import device.constants.AirConditioner;
import device.status.DEVICESTATUS;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;

public class ConfigurationWebServices implements IConfigurationService{

	/**
	 * Get the Configuration Web Services and compose for Devices in the entire
	 * Domain. The context we are looking to deal into.
	 */
	private static final String NAMESPACE = "http://tempuri.org/";
	// Save for FAVORITE

	static private String URL = "http://localhost:8080/DeviceConfigurationWS/services/AirConditionerConfig?wsdl";
	
	public String getAirConditionType(long DeviceID) {
		// TODO Auto-generated method stub
		return AirConditioner.WINDOWS;
	}

	
	public String getAirDirection(long DeviceID) {
		// TODO Auto-generated method stub
		return AirConditioner.AIR_DIRECTION_4_WAY;
	}

	
	public double getBTUCoolingRating(long DeviceID) {
		// TODO Auto-generated method stub
		return 123.45;
	}

	
	public String setAutoShutOFF(long DeviceID) {
		// TODO Auto-generated method stub
		return "success";
	}

	
	public boolean IsAutoShutOFF(long DeviceID) {
		// TODO Auto-generated method stub
		return true;
	}

	
	public String setBTUCoolingRating(double BTURating) {
		// TODO Auto-generated method stub
		return "success";
	}

	
	public double getMinimumTemperature(long DeviceID) {
		// TODO Auto-generated method stub
		return 50;
	}

	
	public double setMinimumTemperature(double temperature,long DeviceID) {
		// TODO Auto-generated method stub
		return 100;
	}

	
	public double getMaximumTemperature(long DeviceID) {
		// TODO Auto-generated method stub
		return 0;
	}

	
	public double setMaximumTemperature(double temperature, long DeviceID) {
		// TODO Auto-generated method stub
		return 0;
	}
	static private String PUT_FAVORITE_METHOD_NAME = "saveDisasterInfo2";
	static private String GET_FAVORITE_METHOD_NAME = "saveDisasterInfo2";
	private String KEYWORD;
	private String CATEGORY;
	public Activity activity;

	public ConfigurationWebServices(String keyWord, String category,
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


	public DEVICESTATUS getDeviceStatus() {
		// TODO Auto-generated method stub
		return null;
	}


	public long getDeviceID() {
		// TODO Auto-generated method stub
		return 0;
	}


	public long setDeviceID(long deviceID) {
		// TODO Auto-generated method stub
		return 0;
	}


	public String getDeviceName(long deviceID) {
		// TODO Auto-generated method stub
		return null;
	}


	public String troubleShootDevice(long deviceID) {
		// TODO Auto-generated method stub
		return null;
	}


	public Boolean IsRemoteControlled(long deviceID) {
		// TODO Auto-generated method stub
		return null;
	}


	public Boolean IsTimerEnabled(long deviceID) {
		// TODO Auto-generated method stub
		return null;
	}


	public String setDeviceOnTime(Date date) {
		// TODO Auto-generated method stub
		return null;
	}


	public String setDeviceEnergyConsumption(double energyInKWH) {
		// TODO Auto-generated method stub
		return null;
	}


	public String setVoltage(double voltage) {
		// TODO Auto-generated method stub
		return null;
	}


	public String setAmperage(double amps) {
		// TODO Auto-generated method stub
		return null;
	}
}
