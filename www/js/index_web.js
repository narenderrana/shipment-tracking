 
 var ajax=function(url,callback){
                
                var  request;
                if(window.XMLHttpRequest){
                    request=new XMLHttpRequest;
                }
                else {
                    request=new ActiveXObject("Microsoft.XMLHTTP");
                }
                
               request.open('GET',url);
               request.onload=callback;
               request.send()
            }

var ENV = (function() {
    
    var localStorage = window.localStorage;

    return {
        settings: {
            /**
            * state-mgmt
            */
            enabled:    localStorage.getItem('enabled')     || 'true',
            aggressive: localStorage.getItem('aggressive')  || 'false'
        },
        toggle: function(key) {
            var value       = localStorage.getItem(key)
                newValue    = ((new String(value)) == 'true') ? 'false' : 'true';

            localStorage.setItem(key, newValue);
            return newValue;
        }
    }
})()

var app = {
    /**
    * @property {google.maps.Map} map
    */
    map: undefined,
    /**
    * @property {google.maps.Marker} location The current location
    */
    location: undefined,
    /**
    * @property {google.map.PolyLine} path The list of background geolocations
    */
    path: undefined,
    /**
    * @property {Boolean} aggressiveEnabled
    */
    aggressiveEnabled: false,
    /**
    * @property {Array} locations List of rendered map markers of prev locations
    */
    locations: [],
    /**
    * @private
    */
    btnEnabled: undefined,
    btnPace: undefined,
    btnHome: undefined,
    btnReset: undefined,

    // Application Constructor  
    initialize: function() {
        this.bindEvents();
        google.maps.event.addDomListener(window, 'load', app.initializeMap);
    },
    initializeMap: function() {
        
        var mapOptions = {
          center: { lat: -34.397, lng: 150.644},
          zoom: 8,
          zoomControl: false
        };

        var header = $('#header'),
            footer = $('#footer'),
            canvas = $('#map-canvas'),
            canvasHeight = window.innerHeight - header[0].clientHeight - footer[0].clientHeight;

        canvas.height(canvasHeight);
        canvas.width(window.clientWidth);

        app.map = new google.maps.Map(canvas[0], mapOptions);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        //document.addEventListener('deviceready', this.onDeviceReady, false);
       // document.addEventListener('pause', this.onPause, false);
        //document.addEventListener('resume', this.onResume, false);

        // Init UI buttons
        this.btnHome        = $('button#btn-home');
        this.btnReset       = $('button#btn-reset');
        this.btnPace        = $('button#btn-pace');
        this.btnEnabled     = $('button#btn-enabled');

        if (ENV.settings.aggressive == 'true') {
            this.btnPace.addClass('btn-danger');
        } else {
            this.btnPace.addClass('btn-success');
        }
        if (ENV.settings.enabled == 'true') {
            this.btnEnabled.addClass('btn-danger');
            this.btnEnabled[0].innerHTML = 'Stop';
        } else {
            this.btnEnabled.addClass('btn-success');
            this.btnEnabled[0].innerHTML = 'Start';
        }
        
        this.btnHome.on('click', this.onClickHome);
        this.btnReset.on('click', this.onClickReset);
        this.btnPace.on('click', this.onClickChangePace);
        this.btnEnabled.on('click', this.onClickToggleEnabled);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        //app.configureBackgroundGeoLocation();
        app.watchPosition();
    },
    onClickHome: function() {
        var fgGeo = window.navigator.geolocation;

        // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        //  in order to prompt the user for Location permission.
        fgGeo.getCurrentPosition(function(location) {
            var map     = app.map,
                coords  = location.coords,
                ll      = new google.maps.LatLng(coords.latitude, coords.longitude),
                zoom    = map.getZoom();

            map.setCenter(ll);
            if (zoom < 15) {
                map.setZoom(15);
            }
            app.setCurrentLocation(coords);
        });
    },
    onClickChangePace: function(value) {
        var bgGeo   = window.plugins.backgroundGeoLocation,
            btnPace = app.btnPace;

        btnPace.removeClass('btn-success');
        btnPace.removeClass('btn-danger');

        var isAggressive = ENV.toggle('aggressive');
        if (isAggressive == 'true') {
            btnPace.addClass('btn-danger');
            bgGeo.changePace(true);
        } else {
            btnPace.addClass('btn-success');
            bgGeo.changePace(false);
        }
    },
    onClickReset: function() {
        // Clear prev location markers.
        var locations = app.locations;
        for (var n=0,len=locations.length;n<len;n++) {
            locations[n].setMap(null);
        }
        app.locations = [];

        // Clear Polyline.
        app.path.setMap(null);
        app.path = undefined;
    },
    onClickToggleEnabled: function(value) {
        var bgGeo       = window.plugins.backgroundGeoLocation,
            btnEnabled  = app.btnEnabled,
            isEnabled   = ENV.toggle('enabled');
        
        btnEnabled.removeClass('btn-danger');
        btnEnabled.removeClass('btn-success');

        if (isEnabled == 'true') {
            btnEnabled.addClass('btn-danger');
            btnEnabled[0].innerHTML = 'Stop';
            bgGeo.start();
        } else {
            btnEnabled.addClass('btn-success');
            btnEnabled[0].innerHTML = 'Start';
            bgGeo.stop();
        }
    },
    watchPosition: function() {
        var fgGeo = window.navigator.geolocation;
        if (app.watchId) {
            app.stopPositionWatch();
        }
        // Watch foreground location
        app.watchId = fgGeo.watchPosition(function(location) {
            app.setCurrentLocation(location.coords);
        }, function() {}, {
            enableHighAccuracy: true,
            maximumAge: 5000,
            frequency: 10000,
            timeout: 10000
        });
    },
    stopPositionWatch: function() {
        var fgGeo = window.navigator.geolocation;
        if (app.watchId) {
            fgGeo.clearWatch(app.watchId);
            app.watchId = undefined;
        }
    },
    /**
    * Cordova foreground geolocation watch has no stop/start detection or scaled distance-filtering to conserve HTTP requests based upon speed.  
    * You can't leave Cordova's GeoLocation running in background or it'll kill your battery.  This is the purpose of BackgroundGeoLocation:  to intelligently 
    * determine start/stop of device.
    */
    onPause: function() {
        console.log('- onPause');
        app.stopPositionWatch();
    },
    /**
    * Once in foreground, re-engage foreground geolocation watch with standard Cordova GeoLocation api
    */
    onResume: function() {
        console.log('- onResume');
        app.watchPosition();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
    setCurrentLocation: function(location) {
        if (!app.location) {
            app.location = new google.maps.Marker({
                map: app.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: 'blue',
                    strokeColor: 'blue',
                    strokeWeight: 5
                }
            });
            app.locationAccuracy = new google.maps.Circle({
                fillColor: '#3366cc',
                fillOpacity: 0.4,
                strokeOpacity: 0,
                map: app.map
            });
        }
        if (!app.path) {
            app.path = new google.maps.Polyline({
                map: app.map,
                strokeColor: '#3366cc',
                fillOpacity: 0.4
            });
        }
        var latlng = new google.maps.LatLng(location.latitude, location.longitude);
        
        if (app.previousLocation) {
            var prevLocation = app.previousLocation;
            // Drop a breadcrumb of where we've been.
            app.locations.push(new google.maps.Marker({
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: 'green',
                    strokeColor: 'green',
                    strokeWeight: 5
                },
                map: app.map,
                position: new google.maps.LatLng(prevLocation.latitude, prevLocation.longitude)
            }));
        }

        // Update our current position marker and accuracy bubble.
        app.location.setPosition(latlng);
        app.locationAccuracy.setCenter(latlng);
        app.locationAccuracy.setRadius(location.accuracy);
        // Add breadcrumb to current Polyline path.
        app.path.getPath().push(latlng);
        app.previousLocation = location;
    }
};


