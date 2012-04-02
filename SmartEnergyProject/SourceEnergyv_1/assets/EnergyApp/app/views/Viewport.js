(function(){
	
	EnergyApp.views.Viewport = Ext
		.extend(
				Ext.TabPanel,
				{
					fullscreen : true,
					layout : 'card',
					//tabBarPosition : 'bottom',
					
					items : [
							{
								cls : 'launchscreen',
								title : 'About',
								iconCls : 'info',
								html : '<div><p><strong>This application visualizes UMKC Energy data with charts from the Data collected near University area.</strong><br> Start by selecting consumption or production.</p></div>'
							},
							{	cls : 'card1',
								title : 'Personal',
								xtype: 'formpanel',
								name : 'personalForm', 
								standardSubmit : false,
								modal : true,
								hideOnMaskTap : false,
								items : [
										{
											xtype : 'fieldset',
											title : 'Contact Us',
											instructions : 'Email is optional.',
											defaults : {
												required : true,
												labelAlign : 'left',
												labelWidth : '40%'
											},
											items : [ {
												xtype : 'textfield',
												name : 'name',
												id: 'name',
												label : 'Name',
												useClearIcon : true,
												autoCapitalize : false
											}, {
					                             xtype: 'numberfield',
					                             name : 'age',
					                             id : 'age',
					                             label: 'Age',
					                            // disabled: true,
					                             useClearIcon: true
					                         }, {
					                             xtype: 'datepickerfield',
					                             name : 'date',
					                             id : 'date',
					                             label: 'Initiation Date',
					                             value: new Date(),
					                             picker: {
					                                 yearFrom: 1990
					                             }
					                         },{
					                             xtype: 'fieldset',
					                             title: 'Contact',
					                             defaults : {
														required : true,
														labelAlign : 'left',
														labelWidth : '40%'
													},
					                             items: [
					                                 
					                                 {
					                                     xtype: 'emailfield',
					                                     name: 'email2',
					                                     id : 'email2',
					                                     label: 'Email',
					                                     placeHolder : 'you@domain.com',
					                                     useClearIcon: true
					                                 },
					                                 {
					                                     xtype: 'textfield',
					                                     name: 'phone ',
					                                     id :'phone',
					                                     label: 'Phone Number',
					                                     placeHolder : '(XXX)-(XXX)-(XXXX)',
					                                     useClearIcon: true
					                                 },{
					                                     xtype: 'textfield',
					                                     name: 'address',
					                                     id : 'address',
					                                     label: 'Address',
					                                     placeHolder : '<Street>, <City>, <State> <Country>',
					                                     useClearIcon: true
					                                 }
					                             ]
					                        }
					                         ]// items ends
										},
										{
											xtype : 'toolbar',
											docked : 'bottom',
											items : [
													
													{
														xtype : 'spacer'
													},
													{
														text : 'Load',
														handler : function() {
															//alert('Loading');
															var form = this.up('form');
															form.setValues({
															    name: 'Swati',
															    email2: 'ssvk3@umkc.edu',
															    phone :'816-235-3817',
															    age: '20',
															    address : '5050 Oak Street Oak Place Apt KC, MO 64112',
															    date :new Date()
															});
														}
													},
													{
														text : 'Reset',
														handler : function() {
															//alert('Resetting');
															var form = this.up('form');
															form.reset();
														}
													},
													{
														text : 'Save',
														ui : 'confirm',
														handler : function() {
															/*
															console.log('success', Ext.toArray(arguments));
															Works :alert('success'+ Ext.toArray(arguments));
															Works : alert('Saving' + this.toString());
															Doesnt Works : console.log('Saving'this.up('formpanel')+this.getForm());
															
*/															var form = this.up('form');
															var obj = form.getValues();
															//DW: console.log(form.getValues());
															console.log(form.getValues().valueOf('name'));
															console.log(form.getValues().toString());
															console.log(form.getValues().name);
															console.log(form.getValues().email2);
															console.log(form.getValues().date);
															
															/*
															Doesnt work: alert('Submitted Values to the Cloud Server', form.getValues(true));
															Doesnt work : alert(''+form.elements[]);
															Doesnt work : alert(document.getElementById('name').getValue(true));
															Doesnt work :console.log(form.getAt(1));
															alert('Submitted Values to the Cloud Server', obj);
															Doesnt work :Ext.Msg.alert('Submitted Values', form.getValues(true)); true /false Doesnt work.
															Doesnt work :Ext.Msg.alert('Data ',form.getData());// Doesnt work
															Doesnt work :Ext.Msg.alert('args',this.up('formpanel').getItems());
															Doesnt work :validate(form.getValues(true));
															alert(' Your Personalised Data is Submitted');
*/															form.submit({
//																waitMsg : {
//																	message : 'Submitting'
//																}
																
															});
														}
													} ]
										} ],// items ends.

								listeners : {
									submit : function(form, result) {
										console.log('success', Ext.toArray(arguments));
										var form = this.up('form');
										Ext.Msg.alert('Submitted Values to the Cloud Server', form.getValues());
									},
									exception : function(form, result) {
										console.log('failure', Ext.toArray(arguments));
									}
								},
								iconCls : 'settings'
							}// Personal Configuration ends
							,{
								title : 'Housing',
								xtype: 'formpanel',
								name : 'housingForm', 
								standardSubmit : false,
								modal : true,
								hideOnMaskTap : false,
								items : [
										{
											xtype : 'fieldset',
											title : 'Housing Information',
											instructions : 'For Proper Monitoring of your Devices please enter housing Information',
											defaults : {
												required : true,
												labelAlign : 'left',
												labelWidth : '40%'
											},
											items : [/* 
											I defined the model and store for the houring type but its Giving exception that Housing Type is not defined. So I am turing to the alternative solution for showing the dropdown button.
											{
					                             xtype: 'selectfield',
					                             name : 'housingType',
					                             label: 'Housing Type',
					                             valueField : 'rank',
					                             displayField : 'title',
					                             store : HousingType
					                         },*/{
					     						xtype : 'fieldset',
					    						title : 'Single Select (in fieldset)',
					    						items : [ {
					    							xtype : 'selectfield',
					    							name : 'housingType',
					    							options : [
					    									{
					    										text : 'Studio Apartment',
					    										value : '1'
					    									}, {
					    										text : '1 Bedroom Hall Kitchen Apartment',
					    										value : '2'
					    									},{
					    										text : '2 Bedroom Hall Kitchen Apartment',
					    										value : '3'
					    									},{
					    										text : '3 Bedroom Hall Kitchen Apartment',
					    										value : '4'
					    									},{
					    										text : 'More than 3 Bedroom Hall Kitchen Apartment',
					    										value : '5'
					    									} ,{
					    										text : '2 Bedroom Hall Kitchen House without Garage',
					    										value : '6'
					    									},{
					    										text : '2 Bedroom Hall Kitchen House without Garage',
					    										value : '7'
					    									},{
					    										text : '3 Bedroom Hall Kitchen House without Garage',
					    										value : '8'
					    									},{
					    										text : '3 Bedroom Hall Kitchen House without Garage Multi-floor',
					    										value : '8'
					    									},{
					    										text : '2 Story House without garage',
					    										value : '8'
					    									},{
					    										text : '2 Story House with Garage',
					    										value : '5'
					    									} ,{
					    										text : 'Multi- Story House without Garage',
					    										value : '5'
					    									},{
					    										text : 'Multi- Story House with Garage',
					    										value : '5'
					    									}]
					    								} ]
					    					}, {
					                             xtype: 'fieldset',
					                             title: 'Year Of Construction (Square Feet)',
					                             items: [
					                                 {
					                                     xtype: 'selectfield',
					                                     name: 'housingYear',
					                                     options: [
					                                         {text: 'Before 1940',  value: '1'},
					                                         {text: '1940 to 1949', value: '2'},
					                                         {text: '1950 to 1959', value: '3'},
					                                         {text: '1960 to 1969', value: '4'},
					                                         {text: '1970 to 1979', value: '5'},
					                                         {text: '1980 to 1989', value: '6'},
					                                         {text: '1990 to 1999', value: '7'},
					                                         {text: '2000 to 2005', value: '8'},
					                                         {text: '2005 to 2010', value: '9'}
					                                        
					                                     ]
					                                 }
					                             ]
					                        },{
					                             xtype: 'fieldset',
					                             title: 'Floor Area (Square Feet)',
					                             items: [
					                                 {
					                                     xtype: 'selectfield',
					                                     name: 'floorArea',
					                                     options: [
					                                         {text: 'Fewer than 500',  value: '1'},
					                                         {text: '500 to 999', value: '2'},
					                                         {text: '1000 to 1499', value: '3'},
					                                         {text: '1500 to 1999', value: '4'},
					                                         {text: '2000 to 2499', value: '5'},
					                                         {text: '2500 to 2999', value: '6'},
					                                         {text: '3000 to 3499', value: '7'},
					                                         {text: '3500 to 3999', value: '8'},
					                                         {text: '4000 or more', value: '9'}
					                                     ]
					                                 }
					                             ]
					                        }
					                         ]// items ends
										},
										{
											xtype : 'toolbar',
											docked : 'bottom',
											items : [
													
													{
														xtype : 'spacer'
													},
													{
														text : 'Load',
														handler : function() {
															//alert('Loading');
															var form = this.up('form');
															form.setValues({
															    floorArea :'2',
															    housingYear :'3',
															    housingType : '4'
															});
														}
													},
													{
														text : 'Reset',
														handler : function() {
															//alert('Resetting');
															var form = this.up('form');
															form.reset();
														}
													},
													{
														text : 'Save',
														ui : 'confirm',
														handler : function() {
																														
															var form = this.up('form');
															var obj = form.getValues();
															console.log(form.getValues(true));
															console.log(form.getValues().valueOf('floorArea'));
															console.log(form.getValues().floorArea);														
															
															
															form.submit({
//																waitMsg : {
//																	message : 'Submitting'
//																}
																
															});
														}
													} ]
										} ],// items ends.

								listeners : {
									submit : function(form, result) {
										console.log('success', Ext.toArray(arguments));
										var form = this.up('form');
										Ext.Msg.alert('Submitted Values to the Cloud Server', form.getValues());
									},
									exception : function(form, result) {
										console.log('failure', Ext.toArray(arguments));
									}
								},
								iconCls : 'settings'
							}// The Housing Configuration Ends here.
							// Configuraiton of devices
							,{
								title : 'Configuration',
								xtype: 'formpanel',
								name : 'referigerationForm', 
								standardSubmit : false,
								modal : true,
								hideOnMaskTap : false,
								items : [
										{
											xtype : 'fieldset',
											title : 'Device Configuration Information',
											instructions : 'For Proper Monitoring of your Devices please enter Device Configuration Information',
											defaults : {
												required : true,
												labelAlign : 'left',
												labelWidth : '40%'
											},
											items : [ 
											{
												xtype : 'textfield',
												name : 'name',
												id: 'refrigeratorName',
												label : 'Name',
												value : 'Refrigerator'		
											},{
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
							                },{
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
											                        Ext.getCmp('tempValue1').setValue(value);
											                        /**
											                         * Make a call for configuration web service to configure the device to be set to that temperature.
											                         * Get a response back and show it in the dialog.
											                         */
											                       // jsWebService.configurationRequest();
											                    }
											                }
											            }
							                        }
							                     ]
							                }
					                         ]// items ends
										},
										{
											xtype : 'toolbar',
											docked : 'bottom',
											items : [
													
													{
														xtype : 'spacer'
													},
													{
														text : 'Optimize',
														handler : function() {
															//alert('Loading');
															var form = this.up('form');
															form.setValues({
															    status1 :'1',
															    temp1 :'400',
															    tempControl1 : '400'
															});
														}
													},
													{
														text : 'Reset',
														handler : function() {
															//alert('Resetting');
															var form = this.up('form');
															form.reset();
															form.setValues({
																name: "Refrigerator"
															});
														}
													},
													{
														text : 'Save',
														ui : 'confirm',
														handler : function() {
																														
															var form = this.up('form');
															var obj = form.getValues();
															console.log(form.getValues(true));
															console.log(form.getValues().valueOf('floorArea'));
															console.log(form.getValues().floorArea);														
															
															
															form.submit({
//																waitMsg : {
//																	message : 'Submitting'
//																}
																
															});
														}
													} ]
										} ],// items ends.

								listeners : {
									submit : function(form, result) {
										console.log('success', Ext.toArray(arguments));
										var form = this.up('form');
										Ext.Msg.alert('Submitted Values to the Cloud Server', form.getValues());
									},
									exception : function(form, result) {
										console.log('failure', Ext.toArray(arguments));
									}
								},
								iconCls : 'settings'
							}// Refrigeration Device Configuration ends
						],//items ends
					initComponent : function() {

						var navigateButton = new Ext.Button(
								{
									hidden : Ext.is.Phone
											|| Ext.Viewport.orientation == 'landscape',
									text : 'Navigation',
									handler : function() {
										EnergyApp.views.Navigation.showBy(this,
												'fade');
									}
								});

						var backButton = new Ext.Button(
								{
									text : 'Back',
									ui : 'back',
									handler : function() {
										var navigation = EnergyApp.views.Navigation, title;

										if (this.getActiveItem() === navigation) {
											navigation.onBackTap();

											// we are in the root - no back
											// button here
											if (navigation.items
													.indexOf(navigation
															.getActiveItem()) <= 0) {
												this.toolBar.items.get(0)
														.hide();
												title = this.title || '';
											}
										} else {
											this.setActiveItem(navigation, {
												type : 'slide',
												reverse : true
											});
										}
										var recordNode = navigation
												.getActiveItem().recordNode;
										title = title
												|| navigation
														.renderTitleText(recordNode);

										this.toolBar.setTitle(title);
									},
									hidden : true,
									scope : this
								});
						/**
						 * an Array of buttons
						 */
						var btns = [ navigateButton ];

						if (Ext.is.Phone) {
							/**
							 * unshift adds a new element at the beginning of
							 * the array btns
							 */
							btns.unshift(backButton);
						}

						/**
						 * the energy Bar at the top, containing the buttons
						 */
						this.toolBar = new Ext.Toolbar({
							ui : 'dark',
							dock : 'top',
							items : btns.concat(this.buttons || []),
							title : this.title
						});
						/**
						 * this.dockedItems = this.dockedItems || [];
						 * this.dockedItems.unshift(myPanel);
						 */
						this.dockedItems = this.dockedItems || [];
						this.dockedItems.unshift(this.toolBar);

						if (!Ext.is.Phone) {
							EnergyApp.views.Navigation.setWidth(300);
						}

						if (!Ext.is.Phone
								&& Ext.Viewport.orientation == 'landscape') {
							this.dockedItems
									.unshift(EnergyApp.views.Navigation);
						} else if (Ext.is.Phone) {
							this.items = this.items || [];
							this.items.unshift(EnergyApp.views.Navigation);
						}
						/**
						 * I: This will add the navigation Item to the Docked
						 * side bar only.
						 */
						// this.dockedItems.unshift(EnergyApp.views.Navigation);
						/**
						 * I: Following will add the Navigation Item to the
						 * Tabed Bars on the top of the application instead of
						 * the sidewise Docked bar.
						 */
						// this.items.unshift(EnergyApp.views.Navigation);
						/**
						 * addDocked is part of Ext.Panel in Sencha Touch and
						 * Ext JS 4 .
						 * 
						 * This explanation applies to both items and
						 * dockedItems.
						 * 
						 * When you are manipulating this.items or
						 * this.dockedItems directly via unshift/push/etc you
						 * want to make sure that you do so before the Component
						 * has been initialized (before you invoke the parent
						 * class initComponent method).
						 * 
						 * After you have invoked the parent class
						 * implementation of initComponent you will then invoke
						 * add or addDocked.
						 * 
						 * To generalize this: Before the parent class
						 * initComponent is invoked, everything in this. are
						 * configurations. After the parent class initComponent
						 * is invoked, everything in this. are properties and
						 * methods
						 */
						EnergyApp.views.Viewport.superclass.initComponent.call(
								this, arguments);
					},
					layoutOrientation : function(orientation, w, h) {
						if (!Ext.is.Phone) {
							if (orientation == 'portrait') {
								/**
								 * Show the navigation
								 */
								EnergyApp.views.Navigation.hide(false);
								/**
								 * removed from docked
								 */
								this.removeDocked(EnergyApp.views.Navigation,
										false);
								if (EnergyApp.views.Navigation.rendered) {
									EnergyApp.views.Navigation.el
											.appendTo(document.body);
								}
								EnergyApp.views.Navigation.setFloating(true);
								EnergyApp.views.Navigation.setHeight(400);
								/**
								 * hide the navigation buttons when the
								 * orientation is portrait
								 */
								this.toolBar.items.get(0).show(false);
							} else {
								/**
								 * show the navigation buttons if the
								 * orientation is landscape
								 */
								EnergyApp.views.Navigation.setFloating(false);
								EnergyApp.views.Navigation.show(false);

								this.toolBar.items.get(0).hide(false);
								this
										.insertDocked(0,
												EnergyApp.views.Navigation);

							}
							this.toolBar.doComponentLayout();
						}

						EnergyApp.views.Viewport.superclass.layoutOrientation
								.call(this, orientation, w, h);
					}
				});
	//alert('ViewPort Loaded');
})();