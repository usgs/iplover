
$(document).ready(function() {
    
    $("#logout").click(function(){
        message = 'Are you sure you want to logout?\n' + 
                'You will not be able to login again unless you have an internet connection.';
        if(confirm(message)){
            iplover.auth.logout();
        }
    });
    
    $("#bug_report").click(function(){
    	
    	records_json = JSON.stringify(iplover.data.getRecords());
    	nonserver_json = JSON.stringify(iplover.data.getRecords());
    	
    	window.location = "mailto:iplover_help@usgs.gov?" + 
    			"subject=iPlover error report&" + 
    			"body=\n\n\n" +
    			"\n\nRecords JSON:\n" + records_json + "\n\nNonserver JSON:\n" + nonserver_json;
    
    });
    
});