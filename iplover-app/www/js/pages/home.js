
$(document).ready(function(){
	document.addEventListener("deviceReady", onDeviceReady, false);
});

function onDeviceReady(){


    $("#logout").click(function(){
        var message = 'You will not be able to login again unless you have an internet connection.';
        navigator.notification.confirm(
                message,
                function(index){
                    switch(index){
                        case 1:
                            break;
                            
                        case 2:
                            iplover.auth.logout();
                            break;
                    }
                },
                "Are you sure?",
                ["Cancel", "Logout"]);
    });

    syncPopUp();

};

function syncPopUp(){
	var tmp = iplover.data.getChangedRecords();

	//If there are no changed records, have an empty array. Most other 
	//problems return false too, so this helps catch various errors.
	if(!(tmp.length > 0)){
		return;
	}
	var entry = tmp[0];

	var numDaySinceLastSync = daysSinceDate(entry.last_edited_calculations);
	var lastBothered = hoursSinceDate(iplover.data.timeSincePopup());
	
	if(numDaySinceLastSync > 1 && lastBothered > 0){
        var message = "It has been " + numDaySinceLastSync + " days since you last synced your data. \n Would you like to sync now?";

        navigator.notification.confirm(
                message,
                function(index){
                    switch(index){
                        case 1:
                            iplover.data.delaySync();
                            break;

                        case 2:
                            window.location.replace("synchronize.html");
                            iplover.data.autoSyncOn();
                            break;
                    }
                },
                "Synchronization Reminder",
                ["Later", "Sync now"]);

    }
    return;
};

//Takes long value date and compares the days it has been since that date.
function daysSinceDate(timeToCompare){
	var diff = Date.now() - timeToCompare;
	//1000*60*60*24 converts from milliseconds to days
	return Math.round(diff / (1000 * 60 * 60 * 24));
};

//Takes long value date and compares the hours it's been since that date.
function hoursSinceDate(timeToCompare){
	var diff = Date.now() - timeToCompare;
	//1000*60*60 converts from milliseconds to hours
	return Math.round(diff / (1000 * 60 * 60));
};
