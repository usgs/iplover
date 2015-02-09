
$(document).ready(function() {
    
    //grab id or index from querystring
    var qstr = location.search;
    var uuid = qstr.match(/uuid=(.+)/i);
    if(!uuid){
        // setup error condition and notify user
    }else{
        uuid = uuid[1];
    }
    
    //grab entry from backend datastore
    var rec = iplover.data.getRecordById(uuid);
    
    //populate page with entry
    populateForm(rec);
    
    //Setup update button callback
    
});


var populateForm = function(rec){
    
    $('#site_id').val(rec.site_id);
    
    $('input[name=setting][value=' + rec.setting + ']').attr('checked', true);
    $('input[name=substrate][value=' + rec.substrate + ']').attr('checked', true);
    $('input[name=vegetation][value=' + rec.vegetation + ']').attr('checked', true);
    $('input[name=density][value=' + rec.density + ']').attr('checked', true);
    
    $('#disp-accuracy').html(rec.location_accuracy);
    $('#disp-lat').html(Math.round(parseFloat(rec.location_lat) * 100000) / 100000);
    $('#disp-lon').html(Math.round(parseFloat(rec.location_lon) * 100000) / 100000);
    $('#disp-time').html(rec.location_timestamp);
    
};


