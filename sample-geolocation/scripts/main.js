function id(element) {
	return document.getElementById(element);
}
 
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {
	navigator.splashscreen.hide();
    init();
}
function init(){
	geolocationApp = new geolocationApp();
	geolocationApp.run();
}
 
$(document).ready(init);

function geolocationApp() {
};

geolocationApp.prototype = {
	_watchID:null,
	map:null,
	lat:0,
	lon:0,
    
	run:function() {
		var that = this;
		this.getLocation();
	},

	getLocation:function(){
		var that = this;
		navigator.geolocation.getCurrentPosition(function(position) {
		// Successfully retrieved the geolocation information. Display it all.
        
		/*this._setResults('Latitude: ' + position.coords.latitude + '<br />' +
						 'Longitude: ' + position.coords.longitude + '<br />' +
						 'Altitude: ' + position.coords.altitude + '<br />' +
						 'Accuracy: ' + position.coords.accuracy + '<br />' +*/
			that.lat = position.coords.latitude;
			that.lon = position.coords.longitude;
			that.initMap(that.lat,that.lon);

		},function(e){
			alert('error: '+ e.message);
			that.initMap();
		});
	},
    initMap: function(_lat,_lon){

		var myOptions = {
		    zoom: 11,
		    center: new google.maps.LatLng(_lat==null?-22.907072809355967:_lat, _lon==null?-43.21398052978515:_lon),
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		this.map = new google.maps.Map($('#map_canvas')[0], myOptions);
		var markers = [];
		this.refreshNearby();
    },
    refreshNearby:function(){
    	var that = this;
	    $.getJSON('https://api.instagram.com/v1/media/search?lat='+that.lat+'&lng='+that.lon+'&client_id=f9a471af537e46a48d14e83f76949f89',
          	function(resp){
                //$('#tx').val(resp);
                $.each(resp.data,function(o){
            		var marker = new google.maps.Marker({
                    	position: new google.maps.LatLng(o.location.latitude, o.location.longitude),
                        map: that.map
                    });
              	});
      		}
  		);
        
    },

	_handleRefresh:function() {
		var options = {
			enableHighAccuracy: true
		},
		that = this;
		navigator.geolocation.getCurrentPosition(function() {
			that._onSuccess.apply(that, arguments);
		}, function() {
			that._onError.apply(that, arguments);
		}, options);
	},
    
	_handleWatch:function() {
		var that = this;
		// If watch is running, clear it now. Otherwise, start it.
		             
		if (that._watchID != null) {
			navigator.geolocation.clearWatch(that._watchID);
			that._watchID = null;
		}
		else {
			that._setResults("Waiting for geolocation information...");
			// Update the watch every second.
			var options = {
				frequency: 3000,
				enableHighAccuracy: true
			};
			that._watchID = navigator.geolocation.watchPosition(function() {
				that._onSuccess.apply(that, arguments);
			}, function() {
				that._onError.apply(that, arguments);
			}, options);
			button.innerHTML = "Clear Geolocation Watch";
            
		}
	},
    
	_onSuccess:function(position) {
		// Successfully retrieved the geolocation information. Display it all.
        
		this._setResults('Latitude: ' + position.coords.latitude + '<br />' +
						 'Longitude: ' + position.coords.longitude + '<br />' +
						 'Altitude: ' + position.coords.altitude + '<br />' +
						 'Accuracy: ' + position.coords.accuracy + '<br />' +
						 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
						 'Heading: ' + position.coords.heading + '<br />' +
						 'Speed: ' + position.coords.speed + '<br />' +
						 'Timestamp: ' + new Date(position.timestamp).toLocaleTimeString().split(" ")[0] + '<br />');
	},
    
	_onError:function(error) {
		this._setResults('code: ' + error.code + '<br/>' +
						 'message: ' + error.message + '<br/>');
	},
    
	_setResults:function(value) {
		if (!value) {
			document.getElementById("results").innerHTML = "";
		}
		else {
			document.getElementById("results").innerHTML = value;
		}
	},
}