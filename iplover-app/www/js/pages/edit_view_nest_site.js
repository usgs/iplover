
var editing_record = [];

//Grab the sourceurl from the querystring for later use
var queryinfo = {};
var sourceurl = 'home.html';

location.search.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) { queryinfo[$1] = $3; }
);

if(queryinfo.sourceurl){
    sourceurl = queryinfo.sourceurl;
}
$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
});

function onDeviceReady(){
    
    $("#home_link").attr("href", sourceurl);
    
    //Add click functionality to GPS map link
    $("#show-map-link").click(function show(){
        $("#minimap-div").stop().fadeIn();
        $("#show-map-link").html('Hide Map');
        $("#show-map-link").click(function(){
            $("#minimap-div").stop().fadeOut();
            $("#show-map-link").html('Show Map');
            $("#show-map-link").click(show);
        });
    });
    
    //grab id or index from querystring
    var queryinfo = {};
    location.search.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryinfo[$1] = $3; }
    );
    
    if(!queryinfo.uuid){
        // TODO: setup error condition and notify user
        alert('Unknown UUID:' + queryinfo.uuid);
    }
    
    //grab entry from backend datastore
    editing_record = iplover.data.getRecordById(queryinfo.uuid);
    
    //populate page with entry
    populate_form(editing_record);
    
    //Setup update button callback
    $('#new_site_form').submit(save_form);
    $('#delete_button').click(delete_record);
    
};

var populate_form = function(rec){
    
    $('#site_id').val(rec.site_id);
    
    //geo radio buttons
    $('input[name=setting][value=' + rec.setting + ']').attr('checked', true);
    $('input[name=substrate][value=' + rec.substrate + ']').attr('checked', true);
    $('input[name=vegetation][value=' + rec.vegetation + ']').attr('checked', true);
    $('input[name=density][value=' + rec.density + ']').attr('checked', true);
    
    //location info
    $('#disp-accuracy').html(rec.location_accuracy);
    $('#disp-lat').html(Math.round(parseFloat(rec.location_lat) * 100000) / 100000);
    $('#disp-lon').html(Math.round(parseFloat(rec.location_lon) * 100000) / 100000);
    $('#disp-time').html(rec.location_timestamp);
    
    //init and notes
    $('#nest_init').val(rec.nest_init);
    $('#notes').val(rec.notes);
    
    iplover.map.setMiniMapSrc($('#minimap-image')[0], parseFloat(rec.location_lat), 
        parseFloat(rec.location_lon), parseFloat(rec.location_accuracy));
};

var validate_form = function(){
    
    if(!$('#site_id').val()){
        alert('Site ID required.');
        return false;
    }
    
    if(!$( "input[name='substrate']:checked" ).val() | !$( "input[name='setting']:checked" ).val()
        | !$( "input[name='density']:checked" ).val() | !$( "input[name='vegetation']:checked" ).val()){
        
        alert('Sorry, all fields, except Notes, must be filled out.');
        return false;
    }
    return true;
};

var save_form = function(e){
    e.preventDefault();
    
    if(!validate_form()){
        return;
    }
    
    var rec = editing_record;
    rec.site_id = $('#site_id').val();
    
    //geo radio buttons
    rec.setting = $('input[name=setting]:checked').val();
    rec.substrate = $('input[name=substrate]:checked').val();
    rec.vegetation = $('input[name=vegetation]:checked').val();
    rec.density = $('input[name=density]:checked').val();
    
    //init and notes
    rec.nest_init = $('#nest_init').val();
    rec.notes = $('#notes').val();
    
    //only if set to edited
    rec.changes_synced = false;
	
	//Time of last Edit. One is for server, one is for calculations
    var timeSet = new Date();
    rec.last_edited_calculations = timeSet.getTime(); 
    rec.last_edited = timeSet.format("yyyy-mm-dd HH:MM:ss");
    
    iplover.data.setRecordById(rec.uuid, rec);
    
    //Send them back to wherever they came from
    window.location.href = sourceurl;
    
};

var delete_record = function(e){
    e.preventDefault();
    
    if(!confirm('Are you sure you want to delete this record?')){
        return;
    }
    
    var rec = editing_record;
	//If we are deleting record, mark for deletion
	rec.deleted = true;
	rec.changes_synced = false;
    iplover.data.setRecordById(rec.uuid, rec);
    
	window.location.href = sourceurl;
}
