/**
 * 
 */
/**
    	 * Device store and model
    	 */
    	 Ext.define('DeviceFormSetModel', {
             extend: 'Ext.data.Model',

             fields: [
                 {name: 'name',     type: 'string'},
               //  {name: 'idO',    type: 'string'},
                 {name: 'status1',    type: 'string'},
                 {name: 'temp1',    type: 'string'}
//                 {name: 'rank',     type: 'string'},
//                 {name: 'title',    type: 'string'}
             ]
         });

         var defaultDeviceStore = Ext.create('Ext.data.Store', {
             data : [
//                 { rank : 'master',  title : 'Master'},
                 { name : 'padawan',  status1: '1' ,temp1: '500'},
                 { name : 'padawan',  status1: '1' ,temp1: '500'}
//                 { rank : 'teacher', title : 'Instructor'},
//                 { rank : 'aid',     title : 'Assistant'}
             ],
             model : 'DeviceFormSetModel',
             autoLoad : true,
             autoDestroy : true
         });
var form;
var formBase = {
      //  url           : 'postUser.php',
        standardSubmit: false,
        items: [
            {
                xtype: 'fieldset',
                title: 'Personal Info',
                instructions: 'Please enter the information above.',
                defaults: {
                    required  : true,
                    labelAlign: 'left',
                    labelWidth: '40%'
                },
                items: [
				{
										xtype : 'textfield',
										name : 'name',
										id: 'refrigeratorName',
										label : 'Name',
										value : 'Refrigerator'		
									},
					                {
					                     xtype: 'fieldset',
					                     title: 'Set Refrigerator ON/OFF',
					                     
					                     items: [
					                         {
					                             xtype: 'togglefield',
					                             name: 'status1',
					                             id: 'refrigeratorOn',
					                             value : 1,
					                             label: 'Device is ON',
					                             labelAlign : 'left',
												 labelWidth : '40%'
					                         }
					                     ]
					                },
					                {
					                     xtype: 'fieldset',
					                     title: 'Control Refrigeration Utilization',
					                     id: 'refrigeratorTempValue',
					                     items: [{
					                            id: 'tempValue1',
					                            xtype: 'textfield',
					                            name: 'temp1',
					                            labelAlign : 'left',
												labelWidth : '40%',
					                            label:'Temperature(Degree Celcius)  ',
					                            value: ' 500'
					                        },
					                         {	flex: 1,
					                            xtype: 'sliderfield',
					                            name : 'tempControl1',
					                            id: 'refrigeratorTempControl',
					                            label: 'Temperature Control',
					                            labelAlign : 'left',
												labelWidth : '40%',
												maxValue : 1000,
									            minValue : 200,
									            value: 500,
									            listeners: {
									                change: function(slider, thumb, value) {
									                    if (value) {
									                      //  Ext.getCmp('tempValue1').setValue(value);
									                        /**
									                         * Make a call for configuration web service to configure the device to be set to that temperature.
									                         * Get a response back and show it in the dialog.
									                         */
															 
									                      //  jsWebService.configurationRequest();
									                    }
									                }
									            }
					                        }
					                     ]
					                }
                    
                ]
            }
            ,
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        text: 'Load Model',
                        ui: 'round',
                        handler: function() {
                           /* if (!formBase.userStore) {
                                formBase.userStore = Ext.ModelMgr.create({
                                    'name'    : 'Akura',
                                    'password': 'secret',
                                    'email'   : 'saru@sencha.com',
                                    'url'     : 'http://sencha.com',
                                    'single_slider': 20,
                                    'enable'  : 1,
                                    'cool'    : true,
                                    'team'    : 'redteam',
                                    'color'   : 'blue',
                                    'rank'    : 'padawan',
                                    'secret'  : true,
                                    'bio'     : 'Learned the hard way !'
                                }, 'User');
                            }

                            form.loadModel(formBase.userStore);*/
                        	Ext.getCmp('refrigeratorTempControl').setValue('600');
                        }
                    },
                    {xtype: 'spacer'},
                    {
                        text: 'Reset',
                        handler: function() {
                       //     form.reset();
                        	Ext.getCmp('referigerationForm').reset();
                        }
                    },
                    {
                        text: 'Save',
                        ui: 'confirm',
                        handler: function() {
                        	var form = Ext.getCmp('referigerationForm');
					    	Ext.Msg.alert('Form Base values', form.getValues(true));
                       
                           /* if (formBase.userStore) {
								alert(formBase.userStore);
                                form.updateRecord(formBase.userStore, true);
                            }
                            form.submit({
							
                            //    waitMsg : {message:'Submitting', cls : 'demos-loading'}
                            });
							//alert(formBase);
							//alert(form);
							//alert(formBase==formBase);
							alert(formBase==form);
							alert(formBase.userStore);
							alert(formBase.userStore.getCount());*/
					    	form.submit({
						        //    waitMsg : {message:'Submitting', cls : 'demos-loading'}
						        });
                        }
                    }
                ]
            }
        ],

        listeners: {
            submit: function(form, result) {
                console.log('success', Ext.toArray(arguments));
            },
            exception: function(form, result) {
                console.log('failure', Ext.toArray(arguments));
            }
        }
    };
EnergyApp.views.form = Ext.create('Ext.form.Panel', formBase);