(fucntion(){
	alert('Tested and this is not loaded.');
	EnergyApp.views.ErrorField = Ext.extend(Ext.Component, {

	// private
	initComponent: function() {
		config = {
			xtype: 'component',
			id: this.fieldname + 'ErrorField',
			cls: 'errorfield',
			tpl: [
				'<tpl if="values.length &gt; 0">',
				'	<ul>',
				'		<tpl for=".">',
				'			<li>{field} {message}</li>',
				'		</tpl>',
				'	</ul>',
				'</tpl>'
			],
			hidden: true
		};

		Ext.apply(this, config);
		EnergyApp.views.ErrorField.superclass.initComponent.call(this);
	},

});
Ext.reg('EnergyApp.views.ErrorField', EnergyApp.views.ErrorField);
alert('Ok');
})();
