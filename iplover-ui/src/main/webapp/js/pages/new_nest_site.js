

$(document).ready(function() {
	
	iplover.location.startedCallback = function(){
		$('#spinner-img').show();
		//Code to show "Lock Location"
		$("#refresh-link").html("Lock Location");
		$("#refresh-link").click(function(){
			iplover.location.stopLocation('lock');
			$("#refresh-link").html("Unlock Location");
			$("#refresh-link").click(iplover.location.watchLocation.bind(iplover.location));
		});
	};
	
	iplover.location.updatedCallback = function(_position){
		//Populate hidden fields
		var timestamp = new Date(_position.timestamp);
		$('#timestamp').val(timestamp.format("yyyy-mm-dd HH:MM:ss"));
		$('#lat').val(_position.coords.latitude);
		$('#lon').val(_position.coords.longitude);
		$('#accuracy').val(_position.coords.accuracy);
		$('#z').val(_position.coords.altitude);
		$('#zaccuracy').val(_position.coords.altitudeAccuracy);
		
		//Update display fields and map URL
		$('#disp-accuracy').html(_position.coords.accuracy);
		$('#disp-lat').html(Math.round(_position.coords.latitude * 100000) / 100000);
		$('#disp-lon').html(Math.round(_position.coords.longitude * 100000) / 100000);
		$('#disp-time').html(timestamp.format("h:MM:ss TT"));
		
		iplover.map.setMiniMapSrc($('#minimap-image')[0], _position);
		iplover.map.setGoogleMapsHref($('#map-google-link')[0], _position);
	};
	
	iplover.location.stoppedCallback = function(cause){
		$('#spinner-img').hide();
		if(cause == 'lock'){
			//Do nothing
		}else{
			$("#refresh-link").html("Refresh");
			$("#refresh-link").click(iplover.location.watchLocation.bind(iplover.location));
		}
	};
	
	iplover.location.watchLocation();
	
	
	
	//TODO: Implement refresh
	$("#refresh-link").onclick = function(){
		iplover.location.watchLocation();
	};
	
	$("#show-map-link").click(function show(){
		$("#minimap-div").show();
		$("#show-map-link").html('Hide Map');
		$("#show-map-link").click(function(){
			$("#minimap-div").hide();
			$("#show-map-link").html('Show Map');
			$("#show-map-link").click(show);
		});
	});
	
	
	
});