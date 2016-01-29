
$(document).ready(function() {



    $("#logout").click(function(){
        message = 'Are you sure you want to logout?\n' +
                'You will not be able to login again unless you have an internet connection.';
        if(confirm(message)){
            iplover.auth.logout();
        }
    });
	botherFun();
	
});

function daysBetweenDates(d1,d2){
	var diff = d1 - d2;
//	return diff / (1000 * 60 * 60 * 24);
	//CURRENTLY MINUTES.
	return diff / (1000 * 60);
}

function botherFun() {
	var tmp = iplover.data.getChangedRecords();
	
	if(tmp.length < 1){return;}
	var entry = tmp[0];
	var currTime = Date.now();

	var numDaySinceLastSync = daysBetweenDates(currTime,entry.last_edited);
	alert(numDaySinceLastSync);
	if(numDaySinceLastSync > 5){
		var response = confirm("It has been " + numDaySinceLastSync + " days since you last synced your data. \n Would you like to sync now?");
		if(response){
			location.href = "synchronize.html";
			
		}
		else{
			alert("bladfs");
		}
	}
	
//    confirm("Getting changed records: " + entry.location_timestamp + " " + entry.changes_synced + " " + entry.on_server + " " + entry.last_edited_timestamp);

	
	return;
};
