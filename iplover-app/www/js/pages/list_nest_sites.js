$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
});
    
function onDeviceReady(){
    $('#collection_group').html(iplover.data.getGroup().toLowerCase().replace("iplover", "iPlover"));
    
    //code to population buttons
    var sites = iplover.data.getRecords();
    
    for(var i = sites.length-1; i >= 0; i--){
        
        if(i == sites.length-1){
            var label = sites[i].site_id;
            populate_button(sites[i], $('#site_button'));
        }else{
            //TODO: Add code to link to in-development edit page
            var tmp = $('#site_button').clone();
            populate_button(sites[i], tmp);
            $('#edit_section').append(tmp);
        }
    }
};


var populate_button = function(site, button){
    var label = site.site_id;
    var querystring = "uuid=" + site.uuid + "&sourceurl=list_nest_sites.html";
    button.html(label);
    button.attr("onclick", "window.location.href='edit_view_nest_site.html?" + querystring + "';");
    
    if(!site.on_server || !site.changes_synced){
        button.addClass('unsynced');
    }else{
        button.removeClass('unsynced');
    }
}

