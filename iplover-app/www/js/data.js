if(typeof iplover === 'undefined'){
	iplover = [];
}
myerror = null;

iplover.data = (function(){

	//
	//This saves the image to the persistent storage (if available)
	// and returns the image file path
	//
	var saveImage = function(uuid, image_file, callback){

        if(!window.resolveLocalFileSystemURL){
            return "Unimplemented on this platform";
        }

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir){

            dir.getFile(uuid + '.jpg', {create:true}, function(file){

                file.createWriter(function(writer){
                    writer.onwrite = function(evt){callback(uuid + '.jpg');};
                    writer.onerror = function(e){alert('error'+e);};
                    writer.write(image_file);
                });//writer
            });//file
        });//datadir

	};

    var getImageDataURL = function(image_path, callback, error){

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + image_path, function(fs){
            reader = new FileReader();
            reader.onloadend = function(evt){callback(evt.target.result);};
            fs.file(function(file){reader.readAsDataURL(file);});
        },
        error);
    };

    var deleteImage = function(image_path, callback, error){

        //set empty function as default if not passed
        error = typeof error !== 'undefined' ? error : function(){};

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + image_path, function(fs){
            fs.remove(callback);
        },
        error);
    };


	var newRecord = function(data){


		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}

		//var imgPath = saveImage(image);
		//data['image_path'] = imgPath;

		records.push(data);

		localStorage.records = JSON.stringify(records);
		return true;
	};

	//
	//This returns an array of iplover record objects
	// that match the record_state pattern
	// record states:['unsynced', 'synced', 'edited', 'deleted']
	// Can also pass nothing and get back all records
	//
	var getRecords = function(record_state){

		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}

        records = records.filter(function(element){return !element.deleted});

		if(!record_state){
			return records;
		}else{
			// filter and then return
			var toreturn = records.filter(function(element){return element.memstate == record_state;});
			return toreturn;
		}
	};

	var getNonserverRecords = function(){

		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records)
		}else{
			records = new Array();
		}

		// filter and then return
		var toreturn = records.filter(function(element){return !element.on_server;});
		return toreturn;


	};

    /*
    *  Returns records that have unsynced_changes. This includes edited and deleted records
    *
    */
	var getChangedRecords = function(){

		var records = [];
		if(localStorage.records){
			records = JSON.parse(localStorage.records);
		}else{
			records = new Array();
		}

		// filter and then return
		var toreturn = records.filter(function(element){return !element.changes_synced;});
		return toreturn;


	};

    var getRecordById = function(uuid){

        var records = getRecords();
        // filter and then return
        var toreturn = records.filter(function(element){return element.uuid === uuid;});
        if(toreturn.length === 1){
            return toreturn[0];
        }else{
            return null;
        }

    };

    var setRecordById = function(uuid, record){

        var records = [];
        if(localStorage.records){
            records = JSON.parse(localStorage.records)
        }else{
            records = new Array();
        }

        var indx = records.map(function(e) {return e.uuid;}).indexOf(uuid);

        if(indx < 0){
            console.log('Error saving record with uuid:' + uuid);
            alert("Error saving site \n" + uuid);
        }

        records.splice(indx, 1, record);

        localStorage.records = JSON.stringify(records);
    };

    var rmRecordById = function(uuid){

    	var records = [];
        if(localStorage.records){
            records = JSON.parse(localStorage.records)
        }else{
            records = new Array();
        }

        var indx = records.map(function(e) {return e.uuid;}).indexOf(uuid);

        if(indx < 0){
            console.log('Error removing record with uuid:' + uuid);
            return;
        }
        records.splice(indx, 1);
        localStorage.records = JSON.stringify(records);

    };

    var getNumberToSync = function(){
        var records = [];
        if(localStorage.records){
            records = JSON.parse(localStorage.records)
        }else{
            records = new Array();
        }

        // filter and then return
				//TODO: Is this REALLY what we want to do? Bitwise OR seems like an odd operation here.
				//Unless changes_synced/on_server are booleans. Still seems unlikely. 
        var toreturn = records.filter(function(element){return !element.changes_synced | !element.on_server;});
        return toreturn.length;
    };

    var clobberAllRecords = function(records){

        localStorage.records = JSON.stringify(records);
    };

    var getDeviceInfo = function(){
        if(typeof device !== 'undefined'){
            return device.platform + ' ' + device.version;
        }else{
            return window.navigator.userAgent;
        }
    };

    var getGroup = function(){
        if(!localStorage.group){
            return "unknown";
        }else{
            return localStorage.group;
        }
    };

    var setGroup = function(group){
        localStorage.group = group;
    };

    var getUser = function(user){
        return localStorage.user;
    };

    var setUser = function(user){
        //If there are data in localStorage.records, store it using previous name

        user = user.toLowerCase();

        //short circuit if nobody else was logged in or user didn't change
        if(!localStorage.user || localStorage.user == "" || localStorage.user == user){
            localStorage.user = user;
            return;
        }

        if(localStorage.backup){
            backup = JSON.parse(localStorage.backup);
        }else{
            backup = {};
        }

        if(backup[user]){
            torestore = backup[user];
        }else{
            torestore = "[]";
        }
        //backup what the last user had stored
        backup[localStorage.user] = localStorage.records;
        localStorage.backup = JSON.stringify(backup);

        localStorage.records = torestore;
        localStorage.user = user;
        return;
    };
	
	//Returns true if autoSyncOn was called, then turns off autosync.
	var autoSyncOff = function(){
		if((localStorage.syncImmediately !== undefined) && JSON.parse(localStorage.syncImmediately)){
			localStorage.syncImmediately = false;
			return true;
		} else{
			return false;
		}
	};
	
	//If called, it forces sync when the synchronize page is next loaded.
	var autoSyncOn = function(){
		localStorage.syncImmediately = true;
		return true;
	};
	
	//If the first time called, returns now. 
	//Otherwise, returns the time set in delaySync.
	var timeSincePopup = function(){
		if(localStorage.timeSincePopup === undefined){
			localStorage.timeSincePopup = Date.now();
		}
		var timeToReturn = localStorage.timeSincePopup;
		return timeToReturn;
	};
	
	//When run, it sets the timeToPopup to be 12 hours from now.
	var delaySync = function(){
		var intermediate = new Date();
		intermediate.setHours(intermediate.getHours() + 6);
		localStorage.timeSincePopup = intermediate.getTime();
	};

    return {newRecord     : newRecord,
            getRecords    : getRecords,
            getRecordById : getRecordById,
            setRecordById : setRecordById,
            rmRecordById  : rmRecordById,
            getDeviceInfo : getDeviceInfo,
            getGroup      : getGroup,
            setGroup      : setGroup,
            setUser       : setUser,
            getUser       : getUser,
            saveImage     : saveImage,
            getImageDataURL: getImageDataURL,
            deleteImage   : deleteImage,
            getNonserverRecords : getNonserverRecords,
            getChangedRecords   : getChangedRecords,
            clobberAllRecords   : clobberAllRecords,
            getNumberToSync     : getNumberToSync,
            autoSyncOff			: autoSyncOff,
            autoSyncOn			: autoSyncOn,
            timeSincePopup		: timeSincePopup,
            delaySync			: delaySync
            };

})();
