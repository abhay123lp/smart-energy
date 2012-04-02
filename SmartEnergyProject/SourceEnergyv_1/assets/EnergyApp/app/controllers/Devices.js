Ext.regController('Devices', {
    store: EnergyApp.stores.devices,

    index: function() {
      /**
       * No device list till date in the sheet.so commenting the device list.
       */  
    	//App.views.viewport.reveal('devicesList');
    },

    newForm: function() {
        var model = new EnergyApp.models.Device()
        EnergyApp.views.devicesForm.load(model);
        EnergyApp.views.viewport.reveal('devicesForm');
    },

    editForm: function(options) {
        var model = this.store.getAt(options.index);
        EnergyApp.views.devicesForm.load(model);
        EnergyApp.views.viewport.reveal('devicesForm');
    },

    save: function(params) {
        params.record.set(params.data);
        var errors = params.record.validate();

        if (errors.isValid()) {
            this.store.create(params.data);
            this.index();
        } else {
            params.form.showErrors(errors);
        }
    },

    update: function(params) {
        var tmpDevice = new EnergyApp.models.Device(params.data),
            errors = tmpDevice.validate()

        if (errors.isValid()) {
            params.record.set(params.data);
            params.record.save();
            this.index();
        } else {
            params.form.showErrors(errors);
        }
    },

    remove: function(params) {
        this.store.remove(params.record);
        this.store.sync();
        this.index();
    }

});
