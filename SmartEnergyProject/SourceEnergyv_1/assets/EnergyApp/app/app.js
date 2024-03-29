EnergyApp = new Ext.Application({
    name: 'EnergyApp',
    tabletStartupScreen: 'tablet_startup.jpg',
    phoneStartupScreen: 'phone_startup.jpg',
    tabletIcon: 'icon-ipad.png',
    phoneIcon: 'icon-iphone.png',
    glossOnIcon: false,
    launch: function(){
        this.views.viewport = new this.views.Viewport({title: 'Smart Energy Data Visualization'});
       // this.views.devicesForm = this.views.viewport.down('#devicesForm');
        
    }
});

// Touch 1.x doesn't have a beforetabswitch event to hook...
Ext.override(Ext.TabBar, {
    onTouchStart : function(e, t) {
        t = e.getTarget('.x-tab');
       // alert(t);
        if (t) {
            var newTab = Ext.getCmp(t.id);
           // alert('newtab'+newTab);
            if (!newTab.hasBeenShown) {
                newTab.hasBeenShown = true;
                var loadMask = new Ext.LoadMask(EnergyApp.views.viewport.getActiveItem().el, {
                    msg: 'Loading...'
                });
                loadMask.show();
                newTab.on('activate', function() {
                    loadMask.destroy();
                }, undefined, { delay: 10 });
            }
            Ext.defer(this.onTabTap, 10, this, [newTab]);
        }
    }
});

EnergyApp.commify = function(nStr) {
    return(nStr / 1000000).toFixed(2);
};

EnergyApp.loadPieAtYear = function(year) {
    EnergyApp.currentYear = year = year || EnergyApp.currentYear || 2008;
    var store = EnergyApp.stores.ChartStore,
        record = store.getAt(store.find('year', year));
    EnergyApp.stores.YearStore.loadData([
        {type: 'Cooking', data: record.get('coal')},
        {type: 'Cleaning', data: record.get('crude-oil')},
        {type: 'Playing', data: record.get('gas')},
        {type: 'Study', data: record.get('nuclear')},
        {type: 'Sleep', data: record.get('renewable')}
    ]);
   // alert('Pie loaded properly');
};

EnergyApp.popup = function(item, panel) {
    var storeItem = item.storeItem,
        commify = EnergyApp.commify;
    panel.update([
        '<ul><li><b>Time: </b>' + storeItem.get('year') + '</li>',
        '<li><b>Coal: </b> ' + commify(storeItem.get('coal')) + '</li>',
        '<li><b>Oil: </b> ' + commify(storeItem.get('crude-oil')) + '</li>',
        '<li><b>Natural Gas: </b> ' + commify(storeItem.get('gas')) + '</li>',
        '<li><b>Nuclear: </b> ' + commify(storeItem.get('nuclear')) + '</li>',
        '<li><b>Renewable: </b> ' + commify(storeItem.get('renewable')) + '</li>',
        '</ul>'
    ].join(''));
};

EnergyApp.popupYear = function(item, panel) {
    var storeItem = item.storeItem,
        commify = EnergyApp.commify;
    panel.update([
        '<ul><li><b>ActivityType: </b>' + storeItem.get('type') + '</li>',
        '<li><b>BTUs: </b> ' + commify(storeItem.get('data')) + '</li>',
        '</ul>'
    ].join(''));
};