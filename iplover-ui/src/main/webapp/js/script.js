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
            $('#syncnumsites').html(num_records);
            $('#syncstatus').html('<li><strong>You don&rsquo;t have any records stored on your device.</strong></li>');
            $('#syncbutton').html('Upload ' + num_records + ' ' + 'Site'.pluralize(num_records));
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
    updateResponses();
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
  
  $('#lockgeo').live('click', function(e){
      e.preventDefault();
      if($('#lockgeo').text() === 'Lock Location'){
        $('#lockgeo').text('Unlock Location');
        navigator.geolocation.clearWatch(watchLocationId);
        $('#gps-reading-spinner').attr('style','display:none');
      }else{
        $('#lockgeo').text('Lock Location');
        watchLocation();
      }
  });
  
  
  // Handle buttom submission
  $('#submitbutton').live('click', function(e) {
      e.preventDefault();
      //$(this).addClass('disabled'); // only allow button press once
      storeRecordImage();
  });
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
        success:function(response){
            addResponse(response);
            console.log(response);
            //Remove the last upload now and start the next
            removeRecord(key, function(){
                console.log("removed item "+key);
                //window.alert(response);
                $('.percent').html('0%');
                $('.bar').width('0%');
                $('#syncbutton').addClass('disabled');
                updateNumRecords();
                syncRecords();
            });
        },
        error:function( jqXHR, textStatus, errorThrown){
            $('.percent').html('0%');
            $('.bar').width('0%');
            addResponse("Upload Error");
            alert("Upload has terminated\nPlease check connection.");
        },
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
            console.log('Done, maybe...');
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

function addResponse(response){
    if(!localStorage){
        return;
    }
    
    if(!localStorage.uploadResponses){
        localStorage.uploadResponses = JSON.stringify(new Array());
    }
    var responses = JSON.parse(localStorage.uploadResponses);
    responses.push(response);
    if(responses.length > 4){
        responses.shift();
    }
    
    localStorage.uploadResponses = JSON.stringify(responses);
    updateResponses();
}

function updateResponses(){
    if(!localStorage.uploadResponses){
        localStorage.uploadResponses = JSON.stringify(new Array());
    }
    var responses = JSON.parse(localStorage.uploadResponses);
    var newtxt = "Last Events:<br />";
    for(var i=(responses.length-1); i >=0; i--){
        newtxt = newtxt + responses[i] + "<br />";
    }
    $("#responses").html(newtxt);
}

// Sync records stored in browser's localStorage to db
function syncRecords() {
    $('#syncbutton').addClass('disabled');
    $('#syncstatus').html('<li><strong>Refresh browser to cancel upload.</strong></li>');
    getRecordKeys(function(recordKeys){
        
        if(recordKeys.length > 0){
            var key = recordKeys.pop();
            getRecord(key, function(data){
                uploadNest(key, data);
            });
        }else{
            //window.location.hash = '_home';
            updateNumRecords();
        }
    });
}

