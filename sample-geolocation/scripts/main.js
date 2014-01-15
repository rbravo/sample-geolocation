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
		this.winWidth = $(window).width();
		this.winHeight = $(window).height();
    },
    refreshNearby:function(){
    	var that = this;
    	var bounds = new google.maps.LatLngBounds();
	    $.getJSON('https://api.instagram.com/v1/media/search?lat='+that.lat+'&lng='+that.lon+'&client_id=f9a471af537e46a48d14e83f76949f89',
          	function(resp){
                //$('#tx').val(resp);
                $.each(resp.data,function(i,o){
                	var pos = new google.maps.LatLng(o.location.latitude, o.location.longitude);
                	var pinIcon = new google.maps.MarkerImage(
					    o.images.thumbnail.url,
					    null, /* size is determined at runtime */
					    null, /* origin is 0,0 */
					    null, /* anchor is bottom center of the scaled image */
					    new google.maps.Size(44, 44)
					);  
            		var marker = new google.maps.Marker({
                    	position: pos,
                        map: that.map,
                        icon: pinIcon
                    });
					bounds.extend(pos);
					var dateInt = parseInt(o.created_time) * 1000;
					marker.infowindow = new google.maps.InfoWindow({
			        	content: "<div><img width='"+(that.winWidth-100)+"' height='"+(that.winWidth-100)+"' src='"+o.images.standard_resolution.url+"'/>" 
		        				+	"<div><a href='"+o.link+"'>"+o.user.username+"</a>"
		        				+	"<img src='images/heart.png' style='position:relative;margin-left:15px;margin-right:4px;'>"+o.likes.count+"</span>"
		        				+	"<img src='images/comment.png' style='position:relative;margin-left:15px;margin-right:4px;'>"+o.comments.count+"</span>"
		        				+	"<i style='margin-left:15px;'>"+parseInstagramDate(dateInt)+"</i>"
		        				+	"</div>"
		        				+	"<div style='max-width:"+(that.winWidth-100)+"px;max-height:60px;overflow:scroll;overflow-x:hidden;text-align:justify;'>" + (o.caption==null?'':o.caption.text)
		        				+	"</div>"
			        			+"</div>"
			        });

			         google.maps.event.addListener(marker, 'click', function () {
				        marker.infowindow.open(that.map, marker);
				    });

              	});
              	that.map.fitBounds(bounds);
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


function parseInstagramDate(tdate) {
    var system_date = new Date(tdate);
    var user_date = new Date();
    var diff = Math.floor((user_date - system_date) / 1000);
    if (diff <= 1) {return "just now";}
    if (diff < 20) {return diff + " seconds ago";}
    if (diff < 40) {return "half a minute ago";}
    if (diff < 60) {return "less than a minute ago";}
    if (diff <= 90) {return "one minute ago";}
    if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
    if (diff <= 5400) {return "1 hour ago";}
    if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
    if (diff <= 129600) {return "1 day ago";}
    if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
    if (diff <= 777600) {return "1 week ago";}
    return "on " + system_date;
}