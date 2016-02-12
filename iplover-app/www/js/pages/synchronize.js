
$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
});

function onDeviceReady(){

    $('#num_to_sync').text(iplover.data.getNumberToSync());

    $('#sync_button').click(function(){
		iplover.sync.syncAll(onfinish, onprogress, onerror);
    });
	
	if(iplover.data.autoSyncOff()){
		$('#sync_button').click();
	}

};


var onprogress = function(percent){

    pct = Math.round(percent) + '%';
    $('.percent').html(pct);
    $('.bar').width(pct);
};


var onfinish  = function(){
    $('.percent').html('0%');
    $('.bar').width('0%');
    $('#num_to_sync').text(iplover.data.getNumberToSync());
	navigator.notification.alert('',function(){},"Sync Complete");

};

var onerror = function(error){
    $('.percent').html('0%');
    $('.bar').width('0%');
	navigator.notification.alert(
			error + '\n\nPlease restart iPlover and try again.\nContact iplover_help@usgs.gov is issues persist.',
			function(){},
			"Error occurred");
};
