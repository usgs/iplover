// Global vars
var page_id, show_map, sync_html, db_errors, db_successes, args_global = {},
	enableSaveAccuracyThreshold = 65,
	watchLocationId,
	watchLocationTimeoutId,
	watchLocationTimeoutSec = 60,
	bestLocationReading;	//most accurate GPS reading within the watchlocation timeout

$(document).ready(function() {
  resumeState();
  saveState('onLoad');
  setupClickHandlers();
  //setupOperatorField();
  sync_html = $('#sync').html();
});


// Fire events when user loads a panel (called from onload.js)
function onPanelLoad(panel) {
  if (!panel) return false; // gets called sometimes when panel isn't set (e.g. Ajax form submission before new panel loads)
  page_id = '#' + panel;

  if (panel == 'home' || panel == 'sync') {
    var records = getRecords();
    var num_records = Object.keys(records).length;
    navigator.geolocation.clearWatch(watchLocation);	//JRH - stop watching the location once out of form
  }
  
  // form panel
  if ($(page_id).get(0).tagName.toLowerCase() == 'form') {
    saveState('onPanelLoad'); // save page user is viewing
    $('#operator, #hidden-fields').appendTo(page_id); // move operator and hidden fields to panel (form) user is viewing
    $('#form-name').val(panel); // set hidden form-name field
    
    //JRH -- reset best gps reading
    bestLocationReading = null;
    watchLocation();
  }
  
  // home panel
  else if (panel == 'home') {
    saveState('onPanelLoad'); // save page user is viewing
    $('#operator').appendTo('#user'); // move operator field back to home page
    $('#syncrecords + p').remove(); // remove any previous sync msg
    if (num_records > 0) {
      $('#syncrecords').after('<p>You have ' + num_records + ' record'.pluralize(num_records) + ' stored on your device.</p>');
    }
    $('#location').remove(); // remove any previous location info / map (added here as a safeguard--sometimes it persists)
    $('#accuracy-display').remove();	//JRH added
  }
  
  // sync panel
  else if (panel == 'sync') {
    saveState('onPanelLoad'); // save page user is viewing
    $('#sync').html(sync_html); // reset sync panel to original html
    
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
    saveState('toggleMap')
  });

  // start sync
  $('#syncbutton').live('click', function(e) {
    e.preventDefault();
    $(this).addClass('disabled'); // only allow button press once
    db_errors = 0; // reset error / success vars from any previous inserts
    db_successes = 0;
    syncRecords();
  });
  
  // prevent form submittal until location is determined (and disabled class is removed)
  $('.record').live('click', function(e) {
    if ($(this).hasClass('disabled')) e.preventDefault();
  });
}


// Grey out form links if operator field not filled in
/* function setupOperatorField() {
  if ($('#operator').val() == '') deActivate();

  $('#operator').bind('keyup', function() {
    if($(this).val().length >= 3) {
      $('#home li a').removeClass('disabled').removeAttr('target');
    } else {
      deActivate();
    }
  });

  function deActivate() {
    $('#home li a').addClass('disabled')
    .attr('target', '_blank') // add target so that iui doesn't intercept link (so preventDefault works)
    .click(function(e) {
      e.preventDefault();
    });
  }
} */

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
  
  
  	//JRH added
  	//draw poly around point to denote accuracy since google static maps don't support circles
  	var eRad = 6378137,
  		offsetPts = [],
  		llAccCoords = [];
  	
  	//put 30 points in the circle
  	for (var i = 0; i < 360; i+=12) {
  		//offsets in meters, calc offsets in lat/lon
  		var dn = Math.cos((Math.PI/180) * i) * acc,
  			de = Math.sin((Math.PI/180) * i) * acc,
  		 	dLat = dn/eRad,
 			dLon = de/(eRad*Math.cos((Math.PI/180) * lat)),
 			latO = lat + dLat * 180/Math.PI,
	 		lonO = lon + dLon * 180/Math.PI;

  		llAccCoords.push(latO+','+lonO);
  	}
  	//close the circle
  	llAccCoords.push(llAccCoords[0]);
  	//end JRH added
  	
  	
  
    //JRH replace map if it's already been drawn
	var mapSrc = encodeURI('http://maps.googleapis.com/maps/api/staticmap?center=' + _position.coords.latitude + ',' + _position.coords.longitude + '&path=color:0x0000ff|fillcolor:0x0000ff22|weight:5|'+llAccCoords.join('|')+'&markers=color:red|' + _position.coords.latitude + ',' + _position.coords.longitude +'&size=280x280&maptype=roadmap&sensor=true'),
		mapLink = 'http://maps.google.com/?q=' + _position.coords.latitude + ',' + _position.coords.longitude + '+(Recorded+location)&t=m&z=13';

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


// Store record in browser's localStorage
function storeRecord(querystring) { 
  if (!Modernizr.localstorage) {
    $('#returnpage').attr('title', 'Error').html('<p>Can&rsquo;t store record. Your device does not support local storage.</p>');
    return false;
  }
  
  // store record (and insert in db if user is online)
  var now = new Date();
  var key = now.format("yyyy-mm-dd HH:MM:ss");
  localStorage[key] = querystring;
  if (navigator.onLine) insertRecord(key, querystring)
  
  // display resulsts and clear previous entries from html form
  returnHtml();
  resumeState(); 
}


// Insert record into db
//TODO: Modify this for Java Servelet and POST (and image)
function insertRecord(key, querystring) {
 $.get('insert.php?' + querystring, function(errors) {
    if (errors) {
      db_errors ++;
      $('#syncstatus .error').html(db_errors + ' record'.pluralize(db_errors) + ' failed to sync');
    } else {
      db_successes ++;
      $('#syncstatus .success').html(db_successes + ' record'.pluralize(db_successes) + ' synced');
      localStorage.removeItem(key); // remove from localStorage on successful db insert
    }
  });
}


// Get records from localStorage
function getRecords() {
  if (!Modernizr.localstorage) return false;
  
  var records = {};
  for (i = 0; i < localStorage.length; i ++) {
    var key = localStorage.key(i);
    if (key.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) { // stored records use date string for key
      records[key] = localStorage[key];
    }
  }
  return records;
}


// Sync records stored in browser's localStorage to db
function syncRecords() {  
  var records = getRecords();
  for (var key in records) {
    var record = records[key] + '&submitted=' + encodeURIComponent(key);
    insertRecord(key, record);    
  }
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


// Retrieve user entered values / current page from localStorage
function resumeState() {
  if (!Modernizr.localstorage) return false;
  
  var elem_id;
  
  show_map = parseInt(localStorage['show_map']);
  
  // show appropriate page
  page_id = localStorage['page'];
  if (page_id) {
    var hashtag = page_id.replace('#', '#_');
    var url = 'http://' + window.location.host + window.location.pathname + window.location.search + hashtag;
    window.location.replace(url); 
  }
  
  // set text areas and pulldown menus
  $('textarea, select').each(function() {
    elem_id = $(this).attr('id');
    $(this).val(localStorage[elem_id]);
  });
  
  // set input fields (checkbox, radio, text)
  $('input').each(function() {
    elem_id = $(this).attr('id');
    if ($(this).attr('type') == 'checkbox' || $(this).attr('type') == 'radio') { // checkboxes and radio buttons
      var is_checked = parseInt(localStorage[elem_id]);
      if (is_checked) {
        $(this).attr('checked', true);
      } else {
        $(this).attr('checked', false);
      }
    } else { // text, number, email, etc.
      $(this).val(localStorage[elem_id]);
    }
  });
}


// Save user entered values / current page to localStorage
function saveState(event) {
  if (!Modernizr.localstorage) return false;
  
  var elem_id;

  if (event == 'onLoad') {
    // onKeypress: textareas and input fields (text, number, email, etc)
    $('input:not(:radio,:checkbox), textarea').keyup(function() {
      elem_id = $(this).attr('id');
      localStorage[elem_id] = $(this).val();
    });
    
    // onChange: pulldown menus and input fields--need change event for input text in case user doesn't type changes (e.g. a number field)
    $('input, select').change(function() {
      elem_id = $(this).attr('id');
      if ($(this).attr('type') == 'checkbox') { // checkboxes
        storeBoolean(elem_id);
      } else if ($(this).attr('type') == 'radio') { // radio buttons
        storeBoolean(elem_id);
        $(this).parent().siblings().children('input').each(function(i) {
          var other_elem_id = $(this).attr('id');
          storeBoolean(other_elem_id); // need to change value of "other" radio button
        });
      } else { // pulldown menus and text input (incl. number, email, etc)
        localStorage[elem_id] = $(this).val();
      }
    });    
  } 
  
  else if (event == 'onPanelLoad') {
    localStorage['page'] = page_id;
  }
  
  else if (event == 'toggleMap') {
    localStorage['show_map'] = show_map;
  }
  
  function storeBoolean(id) {
    if ($('#' + id).is(':checked')) {
      localStorage[id] = 1;
    } else {
      localStorage[id] = 0;
    }
  }
}