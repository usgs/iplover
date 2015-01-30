if(typeof iplover === 'undefined'){
	iplover = [];
}

iplover.location = (function(){

	var watchLocationId = null;
	var watchLocationTimeoutId  = null;
	var watchLocationTimeoutSec = 60;
	var bestLocationReading     = null;
	var _startedCallback         = function(){};
	var _updatedCallback         = function(_position){};
	var _stoppedCallback         = function(){};
	var _errorCallback           = function(){};
	
	// Location error handling 
	var getLocationError = function(_error) {
		var errors = ["Unknown error", "Permission denied by user", "Position unavailable", "Time out"];
		errorCallback(errors[_error.code]);
		_stoppedCallback();
	};
	
	// Capture new location calls and update internal location info
	var setLocation = function(_position) {
		var lat = Math.round(_position.coords.latitude * 100000) / 100000;
		var lon = Math.round(_position.coords.longitude * 100000) / 100000;
		var elev = Math.round(_position.coords.altitude * 10) / 10;
		var acc = Math.floor(_position.coords.accuracy);  //in meters
		var timestamp = new Date(_position.timestamp);
		
		
		//we got a first or better gps reading	
		if (!bestLocationReading || (bestLocationReading && bestLocationReading.accuracy >= acc)) {
			 
			bestLocationReading = {
				latitude: lat,
				longitude: lon,
				accuracy: acc
			}
		}
		_updatedCallback(_position);
	};
	
	var watchLocation = function() {
		if (!navigator.geolocation) return false;
		
		//start the gps watchPosition
		watchLocationId = navigator.geolocation.watchPosition(
		setLocation, getLocationError, {enableHighAccuracy: true, maximumAge: 1000});
		
		//set timeout to force stop of gps watching position
		watchLocationTimeoutId = setTimeout(stopLocation.bind(this,'timeout'), watchLocationTimeoutSec*1000);
		_startedCallback();
	};
	
	var stopLocation = function(cause){
		navigator.geolocation.clearWatch(watchLocationId);
		_stoppedCallback(cause);
	};
	
	var started = function(x){
		_startedCallback = x;
	};
	
	var stopped = function(x){
		_stoppedCallback = x;
	};
	
	var updated = function(x){
		_updatedCallback = x;
	};
	
	return {
		stopLocation     : stopLocation,
		watchLocation    : watchLocation,
		setLocation      : setLocation,
		getLocationError : getLocationError,
		started          : started,
		stopped          : stopped,
		updated          : updated
	};

})();