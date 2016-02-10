$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
});
function onDeviceReady(){
    

    	records_json = JSON.stringify(iplover.data.getChangedRecords());
    	nonserver_json = JSON.stringify(iplover.data.getNonserverRecords());
    	all_rec = JSON.stringify(iplover.data.getRecords());
    	
    	debug_text = "User Token:" + iplover.auth.getToken() + "\n" +
    				"User Group:" + iplover.data.getGroup() + "\n" + 
    				"Nonserver:" + nonserver_json + "\n" +
    				"Changed:" + records_json + "\n" + 
    				"All:" + all_rec;
    	
    	$("#debugtext").val(debug_text);
    
};