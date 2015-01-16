
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
iplover.location = {

	enableSaveAccuracyThreshold: 24001,
	watchLocationId:null,
	watchLocationTimeoutId:null,
	watchLocationTimeoutSec:60,
	bestLocationReading:null,
	startedCallback:function(){},
	updatedCallback:function(_position){},
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
			
			
		}
		this.updatedCallback(_position);
	},
	
	watchLocation:function() {
		if (!navigator.geolocation) return false;
		
		//start the gps watchPosition
		watchLocationId = navigator.geolocation.watchPosition(
		this.setLocation.bind(this), this.getLocationError, {enableHighAccuracy: true, maximumAge: 1000});
		
		//set timeout to force stop of gps watching position
		watchLocationTimeoutId = setTimeout(this.stopLocation.bind(this,'timeout'), this.watchLocationTimeoutSec*1000);
		this.startedCallback();
	},
	
	stopLocation:function(cause){
		navigator.geolocation.clearWatch(watchLocationId);
		this.stoppedCallback(cause);
	}

};