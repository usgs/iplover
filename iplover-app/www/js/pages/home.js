
$(document).ready(function() {

	

    $("#logout").click(function(){
        message = 'Are you sure you want to logout?\n' +
                'You will not be able to login again unless you have an internet connection.';
        if(confirm(message)){
            iplover.auth.logout();
        }
    });
	syncPopUp();
	
});

function syncPopUp() {
	var tmp = iplover.data.getChangedRecords();
	
	//If there are no changed records, have an empty array. Most other 
	//problems return false too, so this helps catch various errors.
	if(!(tmp.length > 0)){return;}
	var entry = tmp[0];
	alert("lastEdited " + entry.last_edited);
//	alert("timestamp " + entry.location_timestamp);
//	
//	//////TESTING
//	var test = iplover.data.getRecords();
//	for(i = 0; i <= tmp.length; i++){
//		alert(test[i].site_id + " last edited: " + test[i].last_edited);
//	}
//	///////TESTING DONE.
//
//
//	var numDaySinceLastSync = daysSinceDate(entry.last_edited);
//	var lastBothered = hoursSinceDate(iplover.data.timeSincePopup());
//	
//	if(numDaySinceLastSync > 1 && lastBothered > 0){
//		var response = confirm("It has been " + numDaySinceLastSync + " days since you last synced your data. \n Would you like to sync now?");
//		if(response){
//			window.location.replace("synchronize.html");			
//			iplover.data.autoSyncOn();
//		} else{
//			iplover.data.delaySync();
//		}
//	}
	return;
};
//
////Takes long value date and compares the days it has been since that date.
//function daysSinceDate(timeToCompare){
//	var diff = Date.now() - timeToCompare;
//	return diff / (1000 * 60 * 60 * 24);
//	//CURRENTLY MINUTES.
////	return Math.round(diff / (1000 * 60));
//};
//
////Takes long value date and compares the hours it's been since that date.
//function hoursSinceDate(timeToCompare){
//	var diff = Date.now() - timeToCompare;
//	return Math.round(diff / 1000 * 60 * 60);
//};
