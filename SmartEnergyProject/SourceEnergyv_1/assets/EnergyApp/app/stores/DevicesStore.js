(function() {

	EnergyApp.stores.HousingTypeStore = new Ext.data.Store({
		data : [ {
			rank : 'master',
			title : 'Master'
		}, {
			rank : 'padawan',
			title : 'Student'
		}, {
			rank : 'teacher',
			title : 'Instructor'
		}, {
			rank : 'aid',
			title : 'Assistant'
		} ],
		model : 'HousingType',
		autoLoad : true,
		autoDestroy : true
	});

	EnergyApp.stores.devices = new Ext.data.Store({
		model : 'Device',
		autoLoad : true
	});

	//alert('Device Model & Device Store are Loaded');
})();
