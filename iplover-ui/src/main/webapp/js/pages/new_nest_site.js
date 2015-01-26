
$(document).ready(function() {
	
	$("#show-map-link").click(function show(){
		$("#minimap-div").show();
		$("#show-map-link").html('Hide Map');
		$("#show-map-link").click(function(){
			$("#minimap-div").hide();
			$("#show-map-link").html('Show Map');
			$("#show-map-link").click(show);
		});
	});
	
	iplover.location.watchLocation();
	
	//#$("#nest_save").click(verify_save_nest);
	
	$('#new_site_form').submit(function(e) {
		e.preventDefault();
		console.log("prevented form submit");
		
		//get image
		var reader = new FileReader();
		reader.readAsDataURL($('#newnestsite-picture')[0].files[0]);
		
		console.log('file read as data URL');
		console.log(reader);

		reader.onload = function (evt) {
			//Once the file is loaded, setup object with values
			var inputs = $("#new_site_form :input");
			var siteObject = {};
			$.map(inputs, function(n, i){
				siteObject[n.name] = $(n).val();
			});
			
			//var siteObject = $('#new_site_form').serializeArray();

			var now = new Date();
			var key = now.format("yyyy-mm-dd HH:MM:ss");
			//save both
			iplover.data.newRecord(siteObject, evt.target.result);
			//send to home
			window.location.href = "home.html";
		};
		
	});
});



iplover.location.started(function(){
	$('#spinner-img').show();
	//Code to show "Lock Location"
	$("#refresh-link").html("Lock");
	$("#refresh-link").click(function(){
		iplover.location.stopLocation('lock');
		$("#refresh-link").html("Unlock");
		$("#refresh-link").click(iplover.location.watchLocation.bind(iplover.location));
	});
});

iplover.location.updated(function(_position){
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
});

iplover.location.stopped(function(cause){
	$('#spinner-img').hide();
	if(cause == 'lock'){
		//Do nothing
	}else{
		$("#refresh-link").html("Refresh");
		$("#refresh-link").click(iplover.location.watchLocation.bind(iplover.location));
	}
});


$("#refresh-link").click(function(){
	iplover.location.watchLocation();
});



