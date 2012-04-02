(function() {
	EnergyApp.models.HousingType = Ext.regModel('HousingType', {
		fields : [ {
			name : 'rank',
			type : 'string'
		}, {
			name : 'title',
			type : 'string'
		} ]

	});

	EnergyApp.models.Device = Ext
			.regModel(
					'Device',
					{
						fields : [ {
							name : 'id',
							type : 'int'
						}, {
							name : 'name',
							type : 'string'
						}, {
							name : 'status',
							type : 'string'
						}, {
							name : 'operation',
							type : 'string'
						}, {
							name : 'region',
							type : 'string'
						}, {
							name : 'dimensions',
							type : 'string'
						}, {
							name : 'EnergyConsumption',
							type : 'string'
						}, {
							name : 'EnergyEstimates',
							type : 'string'
						}, {
							name : 'YearOfPurchase',
							type : 'string'
						}, {
							name : 'Life',
							type : 'string'
						}, {
							name : 'Electronic Sensor Supervised',
							type : 'string'
						} ],

						validations : [
								{
									type : 'presence',
									name : 'name'
								},
								{
									type : 'format',
									name : 'temperature',
									matcher : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
									message : 'must be a valid temperature'
								} ],

						proxy : {
							/**
							 * With localStorage as the type of proxy , it was
							 * giving me errors, But with memory type it was not
							 * giving any errors but was not persistent across
							 * any views. With one form data added it was not
							 * shown in the list's view.
							 * 
							 * YES!!! got it , the session storage is the one by
							 * which I was able to add the record and show it in
							 * the list, Was also able to update it.
							 * 
							 * But upon clicking the app next time the records
							 * previously created are not shown , well its
							 * understandable as it was a session storage and
							 * must persist only ofr one session.
							 * 
							 */
							// type: 'localstorage',
							// type : 'memory',
							type : 'sessionstorage',
							id : 'sencha-devices'
						}
					});
	// alert('OK');
})();