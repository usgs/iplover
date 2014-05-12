// Global vars
var db, page_id, show_map, sync_html, db_errors, db_successes, args_global = {},
	enableSaveAccuracyThreshold = 24001,
	watchLocationId,
	watchLocationTimeoutId,
	watchLocationTimeoutSec = 60,
	bestLocationReading;	//most accurate GPS reading within the watchlocation timeout


var bar = $('.bar');
var percent = $('.percent');

initDatabase();
createTables();

$(document).ready(function() {
  setupClickHandlers();
  //setupOperatorField();
  sync_html = $('#sync').html();
});



//Get new record count and update display based on that data
function updateNumRecords(){
    numRecords(function(num_records){

        if (num_records > 0) {
            $('#syncrecords + p').remove();
            $('#syncrecords').after('<p>You have ' + num_records + ' record'.pluralize(num_records) + ' stored on your device.</p>');
        }else{
            $('#syncrecords + p').remove(); // remove any previous sync msg
        }
        // update button and status
        if (num_records > 0) {
            $('#syncbutton').html('Upload ' + num_records + ' ' + 'Site'.pluralize(num_records));
            $('#syncnumsites').html(num_records);
            if (!navigator.onLine) {
                $('#syncbutton').addClass('disabled');
                $('#syncstatus').html('<li><strong>Your device is currently offline.</strong></li>');
            }
        } else {
            $('#syncbutton').addClass('disabled');
            $('#syncstatus').html('<li><strong>You don&rsquo;t have any records stored on your device.</strong></li>');
        }
    });
}

// Fire events when user loads a panel (called from onload.js)
function onPanelLoad(panel) {
  if (!panel) return false; // gets called sometimes when panel isn't set (e.g. Ajax form submission before new panel loads)
  page_id = '#' + panel;

  if (panel == 'home' || panel == 'sync') {
    
    navigator.geolocation.clearWatch(watchLocation);	//JRH - stop watching the location once out of form
  }
  
  // form panel
  if ($(page_id).get(0).tagName.toLowerCase() == 'form') {
    //saveState('onPanelLoad'); // save page user is viewing
    $('#operator, #hidden-fields').appendTo(page_id); // move operator and hidden fields to panel (form) user is viewing
    $('#form-name').val(panel); // set hidden form-name field
    
    //JRH -- reset best gps reading
    bestLocationReading = null;
    watchLocation();
  }
  
  // home panel
  else if (panel == 'home') {
    //saveState('onPanelLoad'); // save page user is viewing
    $('#operator').appendTo('#user'); // move operator field back to home page
    updateNumRecords();
    $('#location').remove(); // remove any previous location info / map (added here as a safeguard--sometimes it persists)
    $('#accuracy-display').remove();	//JRH added
  }
  
  // sync panel
  else if (panel == 'sync') {
    //saveState('onPanelLoad'); // save page user is viewing
    $('#sync').html(sync_html); // reset sync panel to original html
    
    updateNumRecords();
  }
}


// onClick event handlers
function setupClickHandlers() {

  // refresh geolocation
  $('#refresh').live('click', function(e) { 
    e.preventDefault();
    watchLocation();
  });
  
  // toggle map
  $('#showmap').live('click', function(e) {
    e.preventDefault();
    if ($('#showmap').text() == 'Show Map') { // show map
      $('#map').slideDown('fast');
      $('#showmap').text('Hide Map');
      show_map = 1;
    } else { // hide map
      $('#map').slideUp('fast');
      $('#showmap').text('Show Map');
      show_map = 0;
    }
    //saveState('toggleMap')
  });

  
  // Handle buttom submission
  $('#submitbutton').live('click', function(e) {
      e.preventDefault();
      //$(this).addClass('disabled'); // only allow button press once
      storeRecordImage();
  });
}


function watchLocation() {
  if (!Modernizr.geolocation) return false;

  // disable submit button until device location determined
  $('.record').addClass('disabled').attr('target', '_blank').removeAttr('type');

  //JRH start the gps watchPosition
  watchLocationId = navigator.geolocation.watchPosition(setLocation, getLocationError, {enableHighAccuracy: true, maximumAge: 1000});
        
  if ($('#gps-reading-spinner').length == 1) {
  	$('#gps-reading-spinner').attr('style','display:inline');
  	$('#refresh').attr('style','display:none');
  }
  //set timeout to force stop of gps watching position
  watchLocationTimeoutId = setTimeout(function() {
    navigator.geolocation.clearWatch(watchLocationId);
    $('#refresh').attr('style','display:inline');
    $('#gps-reading-spinner').attr('style','display:none');
  }, watchLocationTimeoutSec*1000);
}



// Set user's location -- form fields, map, etc
function setLocation(_position) {

  var lat = Math.round(_position.coords.latitude * 100000) / 100000;
  var lon = Math.round(_position.coords.longitude * 100000) / 100000;
  var elev = Math.round(_position.coords.altitude * 10) / 10;
  var acc = Math.floor(_position.coords.accuracy);  //in meters
  var timestamp = new Date(_position.timestamp);
  		
  		
  //JRH--- we got a first or better gps reading	
  if (!bestLocationReading || (bestLocationReading && bestLocationReading.accuracy >= acc)) {
      
    //active submit button when there's a valid reading
    if (acc <= enableSaveAccuracyThreshold) {
      $('.record').removeClass('disabled').attr('type', 'submit').removeAttr('target');
    }

	bestLocationReading = {
	  latitude: lat,
	  longitude: lon,
	  accuracy: acc
	}
  
  // display lat, lon values
  $(page_id + '-location').val(lat + ', ' + lon)
  if ($('#accuracy-display').length == 1) {
  	$('#accuracy-value').html(acc + ' meters');
  	$('#location-timestamp-value').html(timestamp.format("h:MM:ss TT"));
  } else {
    $(page_id + '-location')
      .after(
        '<div id="accuracy-display">Accuracy:<span id="accuracy-value">' + acc + ' meters</span><img id="gps-reading-spinner" src="img/spinner.gif"/></div>' + 	//JRH added
        '<div id="location">' + 
        '  <p id="location-timestamp-value">at ' + timestamp.format("h:MM:ss TT") + '</p>' + // timestamp
        '  <ul id="options">' + 
        '    <li><a href="#" target="_blank" id="refresh" style="display:none">Refresh</a></li>' + // refresh link (use target="_blank" so that iui doesn't intercept links)
        '  </ul>' + 
        '</div>'
      );
  }
  
  // create map / map options if user online
  if (navigator.onLine) {
  
        var lonConv = Math.cos(Math.PI/180*_position.coords.latitude)*111131;
        var ulLat, ulLon, lrLat, lrLon = [];
        
        ulLat = _position.coords.latitude + acc/111131;
        lrLat = _position.coords.latitude - acc/111131;
        ulLon = _position.coords.longitude - acc/lonConv;
        lrLon = _position.coords.longitude + acc/lonConv;

            
        var mapSrc = 'http://open.mapquestapi.com/staticmap/v4/getmap?key=Fmjtd%7Cluur2d6znd%2Crl%3Do5-9abal6&zoom=15&size=280,280&'+
                'ellipse=color:0x0000ff%7Cfill:0x700000ff%7Cwidth:2%7C'+ ulLat +','+ ulLon +','+ lrLat +','+ lrLon +
                '&center='+_position.coords.latitude+','+_position.coords.longitude;
    
	var mapLink = 'http://maps.google.com/?q=' + _position.coords.latitude + ',' + _position.coords.longitude + '+(Recorded+location)&t=m&z=13';

    if ($('#map').length == 1) {
    	$('#map-google-image')[0].src = mapSrc;
    	$('#map-google-link')[0].href = mapLink;
    } else {
      $('#options').append('    <li><a href="#" target="_blank" id="showmap">Hide Map</a></li>'); // map toggle
      $('#options').after(
         '<div id="map">' + // google map
        	'<img id="map-google-image" src="' + mapSrc + '">' +	//JRH modified
        	'<p><a id="map-google-link" href="' + mapLink + '" target="_blank">Launch Google Maps</a></p>' +
      	'</div>'
      );
    }

    if (!show_map) {
      $('#map').hide();
      $('#showmap').text('Show Map');
    }
  }
  
  // display location info
  //$('#location').hide().slideDown('fast');
  
  // set values of hidden form fields
  $('#timestamp').val(timestamp.format("yyyy-mm-dd HH:MM:ss"));
  $('#lat').val(_position.coords.latitude);
  $('#lon').val(_position.coords.longitude);
  $('#accuracy').val(_position.coords.accuracy);
  $('#z').val(_position.coords.altitude);
  $('#zaccuracy').val(_position.coords.altitudeAccuracy); // no idea why, but this param MUST be set last...anything after it not filled in
  
  // activate submit button
  //$('.record').removeClass('disabled').attr('type', 'submit').removeAttr('target');
  }
}


// Location error handling 
function getLocationError(_error) {
  var errors = ["Unknown error", "Permission denied by user", "Position unavailable", "Time out"];
  $(page_id + '-location').val('unknown')
  .after(
    '<div id="location">' +
    '  <p class="error">' + errors[_error.code] + '</p>' +
    '  <ul id="options"><li><a href="#" target="_blank" id="refresh">Try again</a></li></ul>' +
    '</div>'
  );

  // activate submit button
  $('.record').removeClass('disabled').attr('type', 'submit').removeAttr('target');
}



//Handles image in new form setup
function storeRecordImage(){
	if (!Modernizr.localstorage){
		$('#returnpage').attr('title', 'Error').html('<p>Can&rsquo;t store record. Your device does not support local storage.</p>');
		return false;
	}
	
        
        
        if(!$('#newnestsite-site').val()){
            alert('Site ID required.');
            return false;
        }
        
        if(!$( "input[name='substrate']:checked" ).val() | !$( "input[name='setting']:checked" ).val()
           | !$( "input[name='vegdens']:checked" ).val() | !$( "input[name='vegtype']:checked" ).val()){
            
            alert('Sorry, all fields except Notes must be filled out.');
            return false;
        }
        
	var file = document.getElementById("newnestsite-picture").files[0];
	if (!file) {
            alert('Sorry, picture is mandatory.');
            return false;
        }        
        
        var reader = new FileReader();

        reader.readAsDataURL(file);
        console.log('file read as data URL');
        console.log(reader);

        reader.onload = function (evt) {
            //Once the file is loaded, setup object with values

            var siteObject = {data:$('#newnestsite').serializeArray(),
                                image:evt.target.result};

            var now = new Date();
            var key = now.format("yyyy-mm-dd HH:MM:ss");

            addRecord(key, JSON.stringify(siteObject), 
            function(result){
               window.location.hash = '_home';
                $('#newnestsite')[0].reset();
                navigator.geolocation.clearWatch(watchLocationId);
                updateNumRecords(); //This may not be necessary
            });
        };
        
	return true;
}


function uploadNest(key, data){
    
    $.ajax({
        type: "POST",
        contentType: "applicatoin/json; charset=utf-8", 
        url: "service/v1/imagepost", 
        data: data,
        xhr: function(){
        // get the native XmlHttpRequest object
        var xhr = $.ajaxSettings.xhr() ;
        // set the onprogress event handler
        xhr.upload.onprogress = function(evt){
            var pct = Math.round(evt.loaded*100/evt.total) + "%";
            console.log('progress', pct);
            $('.percent').html(pct);
            $('.bar').width(pct);
        } ;
        // set the onload event handler
        xhr.upload.onload = function(evt){
            console.log('DONE!');
            console.log("Response:"+xhr.response);

            removeRecord(key, function(){
                console.log("removed item "+key);
                //window.alert(response);
                $('.percent').html('0%');
                $('.bar').width('0%');
                updateNumRecords();
                syncRecords();
            });
        };
        xhr.upload.onabort = function(){
            $('.percent').html('0%');
            $('.bar').width('0%');
        };

        xhr.upload.error = function(evt){
            alert(evt);
        };
        // return the customized object
        return xhr;
        }
    });
    
    return null;
}



// Sync records stored in browser's localStorage to db
function syncRecords() {
    getRecordKeys(function(recordKeys){
        
        if(recordKeys.length > 0){
            var key = recordKeys.pop();
            getRecord(key, function(data){
                uploadNest(key, data);
            });
        }else{
            window.location.hash = '_home';
            updateNumRecords();
        }
    });
}

// Show summary page / clear localStorage values after user submits form
function returnHtml() {

  // "friendly" field names for return page
  var labels = { 
    
    "newnestsite" : {
      "setting" : "Setting",
      "vegcover" : "Vegcover",
      "toHighTideLine" : "toOHTL"
    }
  };
  
  var form_name = args_global['form-name'];
  var return_html = '<fieldset>';
  
  for (var key in args_global) {
  
    // don't echo empty fields, form name, operator, or location details in return html
    if (args_global[key] == '' || 
        key == 'form-name' || 
        key == 'operator' || 
        key.match(/^location-.+/))
      continue; 
  
//  	alert(key + ', ' + args_global[key]);
    var label = key.capitalize();
    if (typeof labels[form_name][key] == 'string') label = labels[form_name][key].capitalize();
    row = '<div class="row results"><label>' + label + '</label><span>' + args_global[key] + '</span></div>';
    return_html += row;
    
    // clear values from localStorage when form submitted
    var elem = $('#' + form_name + ' *[name="' + key + '"]'); // get all form elements by name value
    $(elem).each(function() { // loop thru form elements
      var key = $(this).attr('id');
      localStorage.removeItem(key);
    });
    
  }
  return_html += '</fieldset>';
  //  Add a home button
  return_html += '<a class="whiteButton record" type="home" href="#home">Back to Home</a>';

  $('#returnpage').html(return_html);
  $('#returnpage').attr('title', 'Saved');
}
