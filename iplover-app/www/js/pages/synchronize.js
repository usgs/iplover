
$(document).ready(function() {
    
    $('#num_to_sync').text(iplover.data.getNumberToSync());
    
    $('#sync_button').click(function(){
        $('#sync_button').
        iplover.sync.syncAll(onfinish, onprogress, onerror);
    });
    
});


var onprogress = function(percent){
    
    pct = percent + '%';
    $('.percent').html(pct);
    $('.bar').width(pct);
};


var onfinish  = function(){
    $('.percent').html('0%');
    $('.bar').width('0%');
    $('#num_to_sync').text(iplover.data.getNumberToSync());
    
};

var onerror = function(error){
    $('.percent').html('0%');
    $('.bar').width('0%');
    alert("Error occurred. Please restart iPlover and try again.\nContact mhines@usgs.gov if issues persist");
};


