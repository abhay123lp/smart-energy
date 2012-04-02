/**
 * This is the output of the Sencha Touch 2.0 Getting Started Guide. It sets up a simple application with Sencha Touch,
 * creating a Tab Panel with 3 tabs - home, blog and contact. The home page just shows html, the blog page uses a 
 * nested list to display recent blog posts, and the contact page uses a form to wire up user feedback.
 */
Ext.application({
    name: 'Sencha',
    
    launch: function() {
    	/**
    	 * Adding elements for the form panel
    	 */
    	 var formNew;

         Ext.define('User', {
             extend: 'Ext.data.Model',

             fields: [
                 {name: 'name',     type: 'string'},
                 {name: 'password', type: 'password'},
                 {name: 'email',    type: 'string'},
                 {name: 'url',      type: 'string'},
                 {name: 'rank',     type: 'string'},
                 {name: 'enable',   type: 'boolean'},
                 {name: 'cool',     type: 'boolean'},
                 {name: 'color',    type: 'string'},
                 {name: 'team',     type: 'string'},
                 {name: 'secret',   type: 'boolean'}
             ]
         });

         Ext.define('Ranks', {
             extend: 'Ext.data.Model',

             fields: [
                 {name: 'rank',     type: 'string'},
                 {name: 'title',    type: 'string'}
             ]
         });

         var ranksStore = Ext.create('Ext.data.Store', {
             data : [
                 { rank : 'master',  title : 'Master'},
                 { rank : 'padawan', title : 'Student'},
                 { rank : 'teacher', title : 'Instructor'},
                 { rank : 'aid',     title : 'Assistant'}
             ],
             model : 'Ranks',
             autoLoad : true,
             autoDestroy : true
         });

        

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
         //The whole app UI lives in this tab panel 
        Ext.create('Ext.TabPanel', {
            fullscreen: true,
            tabBarPosition: 'bottom',
            
            items: [
				//this is the home page, just some simple html
				
				{
					title : 'Control',
					iconCls: 'locate',
					xtype: 'formpanel',
					id:'referigerationForm',
					standardSubmit : false,
					modal : true,
					hideOnMaskTap : false,
					items : [{
						    title: 'Home',
						    iconCls: 'home',
						    cls: 'home',
						    html: [
						        '<center><img height=260 src="http://staging.sencha.com/img/sencha.png" /><center>',
						        '<center><h1> UMKC SCE : GREEN ZONE Project </h1></center>',
						        "<p></p>",
						        '<h2></h2>'
						    ].join("")
							},							
							{
							xtype : 'fieldset',
							title : 'Refrigerator',
							id:'referigerationFieldSet',
							instructions : 'Please enter the information to change respective settings.',
							defaults : {
								required : true,
								labelAlign : 'left',
								labelWidth : '40%'
							},
							items : [ 
							         /**
							          * Items of One Device Form Starts
							          */
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
										                        Ext.getCmp('tempValue1').setValue(value);
										                        /**
										                         * Make a call for configuration web service to configure the device to be set to that temperature.
										                         * Get a response back and show it in the dialog.
										                         */
										                        jsWebService.configurationRequest();
										                    }
										                }
										            }
						                        }
						                     ]
						                }
						    ],
			                dockedItems: [{
						        dock: 'bottom',
						        xtype: 'toolbar',
						        height: 70,
						        items: [{
								    text: 'Optimize Settings',
								    ui: 'confirm-round',
								    xtype:'button',
								    handler: function() {
								    	Ext.getCmp('refrigeratorTempControl').setValue('600');
								    	//Ext.getCmp('tempValue1').setValue
//								    	var formBase = Ext.getCmp('referigerationForm');
//								    	 Ext.Msg.alert('Form Base values', formBase.getValues(true));
//								        if (!formBase.user) {
//								            formBase.user = Ext.ModelMgr.create({
//								                'name'    : 'Akura',								                
//								                'status1': 1,
//								                'temp1': 400							                
//								            }, 'DeviceFormSetModel');
//								        }
//								        formBase.user.get('name');
//								        Ext.Msg.alert('Form Base values', formBase.getValues(true));
								      //  Ext.getCmp('referigerationForm').loadModel(formBase.user);
								    	Ext.Msg.alert('Form Base values',defaultDeviceStore.getAt(0));
								    	Ext.getCmp('referigerationForm').loadRecord(defaultDeviceStore.getAt(0));
								    }
								},
								{xtype: 'spacer'},
								{
								    text: 'Reset',
								    ui:'confirm-round',
								    xtype:'button',
								    handler: function() {
//								    	var formBase = Ext.getCmp('referigerationForm');
//								    	Ext.Msg.alert('Form Base values', formBase.getValues(true));
								    	Ext.getCmp('referigerationForm').reset();
//								    	Ext.getCmp('referigerationForm').loadModel(defaultDeviceStore.getAt(0));
								    }
								},
								{
								    text: 'Save',
								    ui:'confirm-round',
								    xtype:'button',									   
								    handler: function() {
								    	var form = Ext.getCmp('referigerationForm');
								    	Ext.Msg.alert('Form Base values', form.getValues(true));
//								        if (form.user) {
//								            form.updateRecord(form.user, true);
//								        }
								        form.submit({
								        //    waitMsg : {message:'Submitting', cls : 'demos-loading'}
								        });
								    }
								}]
						    }
							
							]
							
							},{xtype: 'spacer'},formNew,{
								xtype : 'fieldset',
								title : 'Water Heater',
								instructions : 'Please enter the information to change respective settings.',
								defaults : {
									required : true,
									labelAlign : 'left',
									labelWidth : '40%'
								},items : [ {
									xtype : 'textfield',
									name : 'name',
									label : 'Name',
									value : 'Water Heater',
									
									autoCapitalize : false
								},
				                {
				                     xtype: 'fieldset',
				                     title: 'Set Water ON/OFF',
				                     items: [
				                         {
				                             xtype: 'togglefield',
				                             name: 'status2',
				                             value : 1,
				                             label: 'Device is ON',
				                             labelAlign : 'left',
											 labelWidth : '40%'
				                         }
				                     ]
				                },
				                {
				                     xtype: 'fieldset',
				                     title: 'Control Water Heater Utilization',
				                     items: [
				                          {	flex: 1,
			                            xtype: 'sliderfield',
			                            name : 'tempControl2',
			                            label: 'Temperature Control',
			                            labelAlign : 'left',
										labelWidth : '40%',
										maxValue : 1000,
							            minValue : 200,
							            value: 500,
							            listeners: {
							                change: function(slider, thumb, value) {
							                    if (value) {
							                        Ext.getCmp('tempValue2').setValue(value);
							                        
							                    }
							                }
							            }
			                        },{
			                            id: 'tempValue2',
			                            xtype: 'textfield',
			                            labelAlign : 'left',
										labelWidth : '40%',
			                            label:'Temperature(Degree Celcius) Set to ',
			                            value: ' 500'
			                        }
				                     ]
				                }
								
								
								]
								
								}
								]
				}/]});// 
				//till this one,
                
                //this is the recent blogs page. It uses a tree store to load its data from blog.json
                {
                    xtype: 'nestedlist',
                    title: 'Usage',
                    iconCls: 'star',
                    cls: 'blog',
                    displayField: 'title',
                    
                    store: Ext.create('Ext.data.TreeStore', {
                        fields: ['title', 'text'],
                        
                        root: {},
                        proxy: {
                            type: 'ajax',
                            url: 'blog.json'
                        }
                    }),
                    
                    //when a leaf node is tapped on this function is called. Whatever we return is shown on the page
                    //here we show a page containing the blog post's text
                    getDetailCard: function(node) {
                        if (node) {
                            return {
                                xtype: 'panel',
                                scrollable: true,
                                html: node.get('text')
                            };
                        }
                    }
                },
                
                //this is the contact page, which features a form and a button. The button submits the form
                {
                    xtype: 'formpanel',
                    title: 'Contact Us',
                    iconCls: 'user',
                    url: 'contact.php',
                    layout: 'vbox',
                    
                    items: [
                        {
                            xtype: 'fieldset',
                            title: 'Contact Us',
                            instructions: 'Email address is optional',
                            
                            items: [
                                {
                                    xtype: 'textfield',
                                    label: 'Name',
                                    name: 'name'
                                },
                                {
                                    xtype: 'emailfield',
                                    label: 'Email',
                                    name: 'email'
                                },
                                {
                                    xtype: 'textareafield',
                                    label: 'Message',
                                    name: 'message',
                                    height: 90
                                }
                            ]
                        },
                        {
                            xtype: 'button',
                            text: 'Send',
                            ui: 'confirm',
                            
                            //the handler is called when the button is tapped on
                            handler: function() {
                                //this looks up the items stack above, getting a reference to the first form it see
                                var form = this.up('formpanel');
                                
                                //sends an AJAX request with the form data to the url specified above (contact.php)
                                //success callback is called if we get a non-error response from the server
                                form.submit({
                                    success: function() {
                                        //the callback function is run when the user taps the 'ok' button
                                        Ext.Msg.alert('Thank You', 'Your message has been received', function() {
                                            form.reset();
                                        });
                                    }
                                });
                            }
                        }
                    ]
                }
            ]
        });
    }
});