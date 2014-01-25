function id(element) {
	return document.getElementById(element);
}
 
document.addEventListener("deviceready", onDeviceReady, false);
 var isiOS = false;
function onDeviceReady() {
	navigator.splashscreen.hide();
    init();
}
function init(){
	try{
    	var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
		isiOS = deviceType=="iPhone"||deviceType=="iPad";
		alert('deviceType: '+deviceType);
    } catch(e){ console.log(e);}
	
	geolocationApp = new geolocationApp();
	geolocationApp.run();
	var img = new Image();
	Image.src = 'images/circle.png';

	$('#location').click(function(){geolocationApp.getLocation();});
	/*$('#bulls').click(function(){geolocationApp.setCenter();});
	$('#refresh').click(function(){geolocationApp.refreshNearby();});
	$('#listBtn').click(function(){
		hideActiveScreenThen(function(){
			hideActiveFirstBtn();
			$('#mapBtn').addClass('active');
			var $screen = $('#list_screen');
			$screen.fadeIn(300,function(){ $screen.addClass('active'); });
		});
	});

	$('#mapBtn').click(function(){
		changeScreen($('#map_canvas'),$('#listBtn'));
	});
	*/
	$('#backBtn').click(function(){
		changeScreen($('#map_canvas'));
	});

	/*$('#h1').click(function(){
		var that = $(this);
		hideActiveScreenThen(function(){
			hideActiveFirstBtn();
			that.addClass('active');
			var $screen = $('#post_screen');
			$screen.html(getPostContent(getFakePost()));
			$screen.fadeIn(300,function(){ $screen.addClass('active'); });
		});
	});*/
}

function changeScreen($nextScreen,$buttonVisible,extraStuffFcn)
{
	hideActiveScreenThen(function(){
		hideActiveFirstBtn();
		if($buttonVisible)
			$buttonVisible.addClass('active');
		$nextScreen.fadeIn(300,function(){ 
			$nextScreen.addClass('active'); 
			if(extraStuffFcn) extraStuffFcn();
		});
	});
}

function hideActiveFirstBtn(nextIdToActivate) { 
	$('.firstBtn.active').removeClass('active');
	if(nextIdToActivate)
		$(nextIdToActivate).addClass('active');
} 
function hideActiveScreenThen(cb) { 
	var $active = $('.screen.active');
	$active.fadeOut(300,function(){ $active.removeClass('active'); cb!=null?cb():null; });
};

function go2post (htmlcontent) {
	var $screen = $('#post_screen');
	$screen.html(htmlcontent);
	changeScreen($screen,$('#backBtn'));
};

$(document).ready(init);

function geolocationApp() {
};

geolocationApp.prototype = {
	_watchID:null,
	map:null,
	lat:0,
	lon:0,
	markers:{},
	posts:{},
    
	run:function() {
		var that = this;
		this.measure();
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
			if(that.mymarker != null) this.mymarker.setMap(null);
	    	that.mymarker = new google.maps.Marker({
	                    	position: new google.maps.LatLng(that.lat, that.lon),
	                        map: this.map,
	                        icon: 'images/circle.png'
	                    });
	    	
			that.refreshNearby(true);
		},function(e){
			alert('error: '+ e.message);
			that.initMap();
			that.refreshNearby();
		});
	},
	measure: function(){
		this.winWidth = $(window).width();
		this.winHeight = $(window).height();
		$('.screen').css('min-height',(this.winHeight-$('#header').height()));

	},
    initMap: function(_lat,_lon){
		if(this.map != null) return;
		var myOptions = {
		    zoom: 11,
		    center: new google.maps.LatLng(_lat==null?-22.907072809355967:_lat, _lon==null?-43.21398052978515:_lon),
		    mapTypeId: google.maps.MapTypeId.ROADMAP,
		    streetViewControl: false
		};
		this.map = new google.maps.Map($('#map_canvas')[0], myOptions);
		this.markers = [];
		var that = this;
		google.maps.event.addListener(this.map, 'idle', function() {
			if(that.to_refresh>0) { 
				clearTimeout(that.to_refresh);
				that.to_refresh = 0;
				console.log('clearedTO:'+that.to_refresh);
			}
			that.to_refresh = setTimeout(function(){that.setCenter();console.log('callinRefresh');},600);
			console.log('setTO->'+that.to_refresh);

    	});
    },
    setCenter:function(){
    	var center = this.map.getCenter();
    	this.lat = center.lat();
    	this.lon = center.lng();
    	this.refreshNearby();
    },
    refreshNearby:function(setBounds){
    	var that = this;
    	var bounds = new google.maps.LatLngBounds();
    	$('#loadingBtn').show();
	    $.getJSON('https://api.instagram.com/v1/media/search?lat='+that.lat+'&lng='+that.lon+'&client_id=f9a471af537e46a48d14e83f76949f89',
          	function(resp){
          		console.log(resp);
          		//$.each(that.markers,function(i,o){
      			//	o.setMap(null);
          		//});
          		//that.markers = [];
          		//that.posts = [];
                $.each(resp.data,function(i,o){
                	if(that.markers[o.link] != null) return; // -> se ja tiver no client nao faz nada
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
                    that.markers[o.link] = marker;
                    that.posts[o.link] = o;
                    var olink = o.link;

					bounds.extend(pos);
					var dateInt = parseInt(o.created_time) * 1000;
					var content = "<div><img width='"+(that.winWidth-100)+"' height='"+(that.winWidth-100)+"' src='"+o.images.standard_resolution.url+"'/>" 
		        				+	"<div><a href='"+o.link+"'>"+o.user.username+"</a>"
		        				+	"<img src='images/heart.png' style='position:relative;margin-left:15px;margin-right:4px;'>"+o.likes.count+"</span>"
		        				+	"<img src='images/comment.png' style='position:relative;margin-left:15px;margin-right:4px;'>"+o.comments.count+"</span>"
		        				+	"<i style='margin-left:15px;'>"+parseInstagramDate(dateInt)+"</i>"
		        				+	"</div>"
		        				+	"<div style='max-width:"+(that.winWidth-100)+"px;max-height:60px;overflow:scroll;overflow-x:hidden;text-align:justify;'>" + (o.caption==null?'':o.caption.text)
		        				+	"</div>"
			        			+ "</div>";
			        //marker.infowindow = new google.maps.InfoWindow({
			        //	content:content
			        //});

			        google.maps.event.addListener(marker, 'click', function () {
				        //marker.infowindow.open(that.map, marker);
		        		go2post(getPostContent(that.posts[olink]));
				    });

              	});
				if(setBounds)
              		that.map.fitBounds(bounds);
    			
    			$('#loadingBtn').hide();
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

function getPostContent(instapost){
	geolocationApp.measure();
	var that = geolocationApp;
	var o = instapost;
	var dateInt = parseInt(o.created_time) * 1000;
	return "<div id='outerpost'><img width='"+(o.images.standard_resolution.width)
				//+"' height='"+(o.images.standard_resolution.height)
				//+"' style='max-width:" + that.winWidth + "px;max-height:" + that.winHeight + "px;"
				+"' src='"+o.images.standard_resolution.url+"'/>" 
		+	"<table class='postheader'><tr><td><a style='word-break:break-all;' href='#' "+
				"onclick=\"window.open('" + (isiOS?'instagram://media?id=' + o.id.toString() : o.link) + "', '_blank','location=yes');\">" 
				+o.user.username.toString()+"</a></td>"
			+	"<td width='166' class='stats'><img src='images/heart.png' style='position:relative;margin-right:4px;'><span>"+o.likes.count+"</span>"
			+	"<img src='images/comment.png' style='position:relative;margin-left:10px;margin-right:4px;'><span>"+o.comments.count+"</span>"
			+	"<i style='margin-left:10px;'>"+parseInstagramDate(dateInt)+"</i>"
			+	"</td></tr>"
		+	"</table>"
		+	(o.caption==null?'':"<div class='postcaption'>"+o.caption.text+"</div>")
		+ "</div>";
}

function getFakePost () {
	return {
		created_time: 123882,
		images: {
			standard_resolution: {
				url: 'http://www.metheora.com/logo.png'
			}
		},
		link: 'http://instagram.com/666',
		user: {
			username: 'LOLOLOLOL'
		},
		likes: {count:99},
		comments: {count:13}
	};
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