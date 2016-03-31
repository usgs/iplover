$(document).ready(function() {
    document.addEventListener("deviceReady",onDeviceReady,false);
});
function onDeviceReady(){
    

    	var records_json = JSON.stringify(iplover.data.getChangedRecords());
    	var nonserver_json = JSON.stringify(iplover.data.getNonserverRecords());
    	var all_rec = JSON.stringify(iplover.data.getRecords());
        var errors = JSON.stringify(iplover.data.getErrors());
    	
    	var debug_text = "User Token:" + iplover.auth.getToken() + "\n" +
    				"User Group:" + iplover.data.getGroup() + "\n" + 
    				"Nonserver:" + nonserver_json + "\n" +
    				"Changed:" + records_json + "\n" + 
                    "Errors:" + errors + "\n" +
    				"All:" + all_rec;
    	
    	$("#debugtext").val(debug_text);
    
};