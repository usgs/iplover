
var editing_record = [];

$(document).ready(function() {
    
    //Add click functionality to GPS map link
    $("#show-map-link").click(function show(){
        $("#minimap-div").show();
        $("#show-map-link").html('Hide Map');
        $("#show-map-link").click(function(){
            $("#minimap-div").hide();
            $("#show-map-link").html('Show Map');
            $("#show-map-link").click(show);
        });
    });
    
    //grab id or index from querystring
    var qstr = location.search;
    var uuid = qstr.match(/uuid=(.+)/i);
    if(!uuid){
        // setup error condition and notify user
    }else{
        uuid = uuid[1];
    }
    
    //grab entry from backend datastore
    editing_record = iplover.data.getRecordById(uuid);
    
    //populate page with entry
    populate_form(editing_record);
    
    //Setup update button callback
    $('#new_site_form').submit(save_form);
});


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
        
        alert('Sorry, all fields except Notes must be filled out.');
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
    rec.substrate = $('input[name=substrate]:checked').val()
    rec.vegetation = $('input[name=vegetation]:checked').val()
    rec.density = $('input[name=density]:checked').val()
    
    //init and notes
    rec.nest_init = $('#nest_init').val();
    rec.notes = $('#notes').val();
    
    //only if state isn't unsynced, set to edited
    if(rec.store_state != 'unsynced'){
        rec.store_state = 'edited';
    }
    
    iplover.data.setRecordById(rec.uuid, rec);
    //Send them back to the list of nest sites
    window.location.href='list_nest_sites.html';
    
};
