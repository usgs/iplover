
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
iplover.location = {

	enableSaveAccuracyThreshold: 24001,
	watchLocationId:null,
	watchLocationTimeoutId:null,
	watchLocationTimeoutSec:60,
	bestLocationReading:null,
	updatedCallback:function(){},
	stoppedCallback:function(){},
	errorCallback:function(){},
	
	// Location error handling 
	getLocationError:function(_error) {
		var errors = ["Unknown error", "Permission denied by user", "Position unavailable", "Time out"];
		errorCallback(errors[_error.code]);
		stoppedCallback();
	},
	
	// Capture new location calls and update internal location info
	setLocation:function(_position) {
		var lat = Math.round(_position.coords.latitude * 100000) / 100000;
		var lon = Math.round(_position.coords.longitude * 100000) / 100000;
		var elev = Math.round(_position.coords.altitude * 10) / 10;
		var acc = Math.floor(_position.coords.accuracy);  //in meters
		var timestamp = new Date(_position.timestamp);
		
		updatedCallback(_position);
		
		//JRH--- we got a first or better gps reading	
		if (!this.bestLocationReading || (this.bestLocationReading && this.bestLocationReading.accuracy >= acc)) {
			  
			//active submit button when there's a valid reading
			if (acc <= this.enableSaveAccuracyThreshold) {
				$('.record').removeClass('disabled').attr('type', 'submit').removeAttr('target');
			}

			this.bestLocationReading = {
			  latitude: lat,
			  longitude: lon,
			  accuracy: acc
			}

			// display location info
			//$('#location').hide().slideDown('fast');

			// activate submit button
			//$('.record').removeClass('disabled').attr('type', 'submit').removeAttr('target');
		}
	},

	watchLocation:function(_updatedCallback, _stoppedCallback) {
		if (!navigator.geolocation) return false;
		
		updatedCallback = _updatedCallback;
		stoppedCallback = _stoppedCallback;
		
		//start the gps watchPosition
		watchLocationId = navigator.geolocation.watchPosition(
		this.setLocation, this.getLocationError, {enableHighAccuracy: true, maximumAge: 1000});
		
		//set timeout to force stop of gps watching position
		watchLocationTimeoutId = setTimeout(function() {
			navigator.geolocation.clearWatch(watchLocationId);
			this.stoppedCallback();
		}, this.watchLocationTimeoutSec*1000);
	}

};