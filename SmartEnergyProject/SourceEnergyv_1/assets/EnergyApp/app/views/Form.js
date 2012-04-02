(function(){
	EnergyApp.views.DevicesForm = Ext.extend(Ext.form.FormPanel, {

    defaultInstructions: 'Please enter the information above.',

    initComponent: function(){
        var titlebar, cancelButton, buttonbar, saveButton, fields;

        cancelButton = {
            text: 'cancel',
            ui: 'back',
            handler: this.onCancelAction
        };

        titlebar = {
            id: 'deviceFormTitlebar',
            xtype: 'toolbar',
            title: 'Create device',
            items: [ cancelButton ]
        };

        saveButton = {
            id: 'deviceFormSaveButton',
            text: 'save',
            ui: 'confirm',
            handler: this.onSaveAction,
            scope: this
        };

        deleteButton = {
            id: 'deviceFormDeleteButton',
            text: 'delete',
            ui: 'decline',
            handler: this.onDeleteAction,
            scope: this
        };

        buttonbar = {
            xtype: 'toolbar',
            dock: 'bottom',
            items: [deleteButton, {xtype: 'spacer'}, saveButton]
        };

        fields = {
            xtype: 'fieldset',
            id: 'deviceFormFieldset',
            title: 'Device details',
            instructions: this.defaultInstructions,
            defaults: {
                xtype: 'textfield',
                labelAlign: 'left',
                labelWidth: '40%',
                required: false,
                useClearIcon: true,
                autoCapitalize : false
            },
            items: [
                {
                    name : 'name',
                    label: 'Name',
                    autoCapitalize : true
                }/*,
                {
                    xtype: 'EnergyApp.views.ErrorField',
                    fieldname: 'name',
                }*/,
                {
                    name: 'email',
                    label: 'Email of Owner',
                    xtype: 'emailfield',
                }/*,
                {
                    xtype: 'EnergyApp.views.ErrorField',
                    fieldname: 'email',
                }*/,
                {
                    name: 'phone',
                    label: 'Phone Number(Notification) ',
                    xtype: 'numberfield',
                }/*,
                {
                    xtype: 'EnergyApp.views.ErrorField',
                    fieldname: 'phone',
                }*/
            ]
        };

        Ext.apply(this, {
            scroll: 'vertical',
            dockedItems: [ titlebar, buttonbar ],
            items: [ fields ],
            listeners: {
                beforeactivate: function() {
                    var deleteButton = this.down('#deviceFormDeleteButton'),
                        saveButton = this.down('#deviceFormSaveButton'),
                        titlebar = this.down('#deviceFormTitlebar'),
                        model = this.getRecord();

                    if (model.phantom) {
                        titlebar.setTitle('Create device');
                        saveButton.setText('create');
                        deleteButton.hide();
                    } else {
                        titlebar.setTitle('Update device');
                        saveButton.setText('update');
                        deleteButton.show();
                    }
                },
                deactivate: function() {
                    this.resetForm();
                }
            }
        });

        EnergyApp.views.DevicesForm.superclass.initComponent.call(this);
    },

    onCancelAction: function() {
        Ext.dispatch({
            controller: 'Devices',
            action: 'index'
        });
    },

    onSaveAction: function() {
        var model = this.getRecord();

        Ext.dispatch({
            controller: 'Devices',
            action    : (model.phantom ? 'save' : 'update'),
            data      : this.getValues(),
            record    : this.getRecord(),
            form      : this
        });
    },

    onDeleteAction: function() {
        Ext.Msg.confirm("Delete this device?", "", function(answer) {
            if (answer === "yes") {
                Ext.dispatch({
                    controller: 'Devices',
                    action    : 'remove',
                    record    : this.getRecord()
                });
            }
        }, this);
    },

    showErrors: function(errors) {
        var fieldset = this.down('#deviceFormFieldset');
        this.fields.each(function(field) {
            var fieldErrors = errors.getByField(field.name),
                errorField = this.resetField(field);

            if (fieldErrors.length > 0) {
                field.addCls('invalid-field');
                errorField.update(fieldErrors);
                errorField.show();
            }
        }, this);
        fieldset.setInstructions("Please amend the flagged fields");
    },

    resetForm: function() {
        var fieldset = this.down('#deviceFormFieldset');
        this.fields.each(function(field) {
            this.resetField(field);
        }, this);
        fieldset.setInstructions(this.defaultInstructions);
        this.reset();
    },

    resetField: function(field) {
        var errorField = this.down('#'+field.name+'ErrorField');
        errorField.hide();
        field.removeCls('invalid-field');
        return errorField;
    }
    /* I did for checking values in form of Personal data. None of the following code has any significance till date.
    getValue: function(val){
    	//alert('ok'+val);
    },
    setValue : function(val1,val2) {
    	alert('ok');
    }*/
});

Ext.reg('EnergyApp.views.DevicesForm', EnergyApp.views.DevicesForm);
//alert('form'+EnergyApp.views.DevicesForm);
//console.log(EnergyApp.views.DevicesForm);
})();
