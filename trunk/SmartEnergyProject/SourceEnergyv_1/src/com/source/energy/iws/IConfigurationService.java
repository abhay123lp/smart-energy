/**
 * 
 */
package com.source.energy.iws;

import java.util.Date;

import device.status.DEVICESTATUS;

/**
 * @author Swati Soni
 *
 */
public interface IConfigurationService {
	
	public DEVICESTATUS getDeviceStatus();// DEFAULT : AT PRESENT TIME
	public long getDeviceID();
	public long setDeviceID(long deviceID);
	public String getDeviceName(long deviceID);
	
	public String troubleShootDevice(long deviceID);
	
	public Boolean IsRemoteControlled(long deviceID);
	public Boolean IsTimerEnabled(long deviceID);
	
	public String setDeviceOnTime(Date date);
	public String setDeviceEnergyConsumption(double energyInKWH);
	
	public String setVoltage(double voltage);
	public String setAmperage(double amps);
	

}
