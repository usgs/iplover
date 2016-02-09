
$(function(){
    document.addEventListener("deviceready", on_device_ready, false);
});

on_device_ready = function() {
	
	//Add click functionality to GPS map links
	$("#show-map-link").click(function show(){
		$("#minimap-div").show();
		$("#show-map-link").html('Hide Map');
		$("#show-map-link").click(function(){
			$("#minimap-div").hide();
			$("#show-map-link").html('Show Map');
			$("#show-map-link").click(show);
		});
	});
	
	//Start watch location
	iplover.location.watchLocation();
	
	//Override form submit functionality
	$('#new_site_form').submit(new_site_submit_function);
    $('#device_info').val(iplover.data.getDeviceInfo());
    
    $('#picture_button').click(function(e){
        e.preventDefault();
        $('#newnestsite_picture').click();
    });
    
    $('#newnestsite_picture').change(function(e){
        $('#picture_button').html('Retake Nest Photo');
    });
    
};

var verify_new_site = function(){
	
	if(!$('#site_id').val()){
		alert('Site ID required.');
		return false;
	}
	
	if(!$( "input[name='substrate']:checked" ).val() | !$( "input[name='setting']:checked" ).val()
		| !$( "input[name='density']:checked" ).val() | !$( "input[name='vegetation']:checked" ).val()){
		
		alert('Sorry, all fields except Notes must be filled out.');
		return false;
	}
	
	if($('#newnestsite_picture')[0].files.length < 1){
		alert('Sorry, picture is mandatory.');
		return false;
	}
    
    if($('#lat').val() == "" | $('#lon').val() == ""){
        alert('Invalid Lat/Lon. Please restart acquisition.');
        return false;
    }
    
    return true;
};

var new_site_submit_function = function(e) {
	e.preventDefault();
	if(!verify_new_site()){
		return;
	}
	
	console.log('file read as data URL');

    //Once the file is loaded, setup object with values
    var inputs = $("#new_site_form :input");
    var siteObject = {};
    
    siteObject.site_id              = $("#site_id").val();
    
    //location info
    siteObject.location_lat         = parseFloat($("#lat").val());
    siteObject.location_lon         = parseFloat($("#lon").val());
    siteObject.location_z           = parseFloat($("#z").val());
    siteObject.location_accuracy    = parseFloat($("#accuracy").val());
    siteObject.location_zaccuracy   = parseFloat($("#zaccuracy").val());
    siteObject.location_timestamp   = $("#timestamp").val();
    
    //notes
    siteObject.notes                = $("#notes").val();
    siteObject.nest_init            = $("#nest_init").val();
    
    //client data
    siteObject.device_info          = $("#device_info").val();
    siteObject.client_version       = $("#client_version").val();
    
    //radio buttons
    siteObject.setting              = $('input[name=setting]:checked').val();
    siteObject.substrate            = $('input[name=substrate]:checked').val();
    siteObject.vegetation           = $('input[name=vegetation]:checked').val();
    siteObject.density              = $('input[name=density]:checked').val();
    
    siteObject.collection_group = iplover.data.getGroup();
    siteObject.deleted = false;
    siteObject.changes_synced = false;
    siteObject.on_server = false;
    var timeSet = new Date();
    siteObject.last_edited_calculations = timeSet.getTime();
    siteObject.last_edited = timeSet.format("yyyy-mm-dd HH:MM:ss");
    
    siteObject.uuid = generateUUID();
    
    iplover.data.saveImage(siteObject.uuid, 
                            $('#newnestsite_picture')[0].files[0],
                            function(fpath){
                                siteObject['image_path'] = fpath;
                                
                                iplover.data.newRecord(siteObject);
                                //send to home
                                window.location.href = "home.html";
                                
                            });

};

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
	
	iplover.map.setMiniMapSrc($('#minimap-image')[0], _position.coords.latitude, 
        _position.coords.longitude, _position.coords.accuracy);
    
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



