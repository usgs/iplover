

$(document).ready(function() {
	
	iplover.location.watchLocation(
		function(_position){
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
			iplover.map.setGoogleMapsHref($('#minimap-image')[0], _position);
		},
		function(){
			$('#refresh-link').attr('style','display:inline');
			$('#gps-reading-spinner').attr('style','display:none');
			$('#lockgeo').attr('style','display:none');
		}
	);
	
//	TODO: Add spinner to show GPS is working
//		if ($('#gps-reading-spinner').length == 1) {
//			$('#gps-reading-spinner').attr('style','display:inline');
//			$('#refresh').attr('style','display:none');
//			$('#lockgeo').attr('style','display:inline');
//		}
	
	$("#refresh-link").onclick = function(){
		
	};
	
	var show = function(){
		
		
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